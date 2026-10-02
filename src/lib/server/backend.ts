import { randomBytes } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { betterAuth, type BetterAuthOptions } from 'better-auth';
import { getMigrations } from 'better-auth/db/migration';
import Database from 'better-sqlite3';

export interface BackendOptions {
  databasePath: string;
  secret: string;
  baseURL: string;
  trustedOrigins?: string[];
  rateLimit?: boolean;
}

// Navigation, focus refreshes, and multiple tabs all validate their session.
// Keep reads bounded without applying the tighter credential-operation quota.
export const SESSION_READ_RATE_LIMIT = { window: 60, max: 600 } as const;

interface BackendAuth {
  handler: (request: Request) => Promise<Response>;
  api: {
    getSession: (input: {
      headers: Headers;
    }) => Promise<{ user: { id: string } } | null>;
  };
  options: { baseURL: string; trustedOrigins: string[] };
}
export interface Backend {
  auth: BackendAuth;
  database: Database.Database;
  ready: () => Promise<void>;
  close: () => void;
}

/** One database connection and one migration promise for the Node process. */
export function createBackend(options: BackendOptions): Backend {
  if (options.databasePath !== ':memory:')
    mkdirSync(dirname(options.databasePath), { recursive: true });
  const database = new Database(options.databasePath);
  database.pragma('foreign_keys = ON');
  database.pragma('journal_mode = WAL');
  database.pragma('busy_timeout = 5000');

  const authOptions = {
    appName: 'lessdumb',
    database,
    secret: options.secret,
    baseURL: options.baseURL,
    trustedOrigins: options.trustedOrigins ?? [new URL(options.baseURL).origin],
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 8,
      maxPasswordLength: 128,
    },
    session: { expiresIn: 60 * 60 * 24 * 30, updateAge: 60 * 60 * 24 },
    rateLimit: {
      enabled: options.rateLimit ?? true,
      storage: 'database',
      window: 60,
      max: 100,
      customRules: {
        '/get-session': SESSION_READ_RATE_LIMIT,
        '/sign-in/email': { window: 60, max: 10 },
        '/sign-up/email': { window: 60, max: 10 },
      },
    },
    advanced: {
      cookiePrefix: 'lessdumb',
      // Keep the same protection in tests; Better Auth otherwise relaxes it in NODE_ENV=test.
      disableCSRFCheck: false,
      disableOriginCheck: false,
      defaultCookieAttributes: { httpOnly: true, sameSite: 'lax' },
    },
  } satisfies BetterAuthOptions;

  let auth: BackendAuth | undefined;
  let initialization: Promise<void> | undefined;
  const ready = () => {
    initialization ??= (async () => {
      // Migrate before creating the auth instance so its schema check sees complete tables.
      const { runMigrations } = await getMigrations(authOptions);
      await runMigrations();
      database.exec(`
        CREATE TABLE IF NOT EXISTS learner_state (
          user_id TEXT PRIMARY KEY REFERENCES user(id) ON DELETE CASCADE,
          state_json TEXT NOT NULL,
          revision INTEGER NOT NULL DEFAULT 1,
          updated_at INTEGER NOT NULL
        )
      `);
      const initializedAuth = betterAuth(authOptions);
      await initializedAuth.$context;
      auth = {
        handler: (request) => initializedAuth.handler(request),
        api: { getSession: (input) => initializedAuth.api.getSession(input) },
        options: {
          baseURL: authOptions.baseURL,
          trustedOrigins: authOptions.trustedOrigins,
        },
      };
    })();
    return initialization;
  };

  return {
    get auth() {
      if (!auth)
        throw new Error(
          'Call backend.ready() before handling account requests.',
        );
      return auth;
    },
    database,
    ready,
    close: () => database.close(),
  };
}

function localSecret(dataDirectory: string): string {
  const secretPath = resolve(dataDirectory, 'auth-secret');
  mkdirSync(dataDirectory, { recursive: true });
  try {
    return readFileSync(secretPath, 'utf8').trim();
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
    const secret = randomBytes(48).toString('base64url');
    try {
      writeFileSync(secretPath, secret, { mode: 0o600, flag: 'wx' });
      return secret;
    } catch (writeError) {
      if ((writeError as NodeJS.ErrnoException).code !== 'EEXIST')
        throw writeError;
      return readFileSync(secretPath, 'utf8').trim();
    }
  }
}

let backend: Backend | undefined;

export async function getBackend(): Promise<Backend> {
  if (!backend) {
    const dataDirectory = resolve(process.env.LESSDUMB_DATA_DIR ?? 'data');
    const production = process.env.NODE_ENV === 'production';
    const configuredSecret = process.env.BETTER_AUTH_SECRET;
    const configuredURL = process.env.BETTER_AUTH_URL;
    if (production && (!configuredSecret || !configuredURL)) {
      throw new Error(
        'Set BETTER_AUTH_SECRET and BETTER_AUTH_URL before starting the production server.',
      );
    }
    if (configuredSecret && configuredSecret.length < 32) {
      throw new Error(
        'BETTER_AUTH_SECRET must contain at least 32 characters.',
      );
    }
    const baseURL = configuredURL ?? 'http://localhost:4321';
    backend = createBackend({
      databasePath: resolve(dataDirectory, 'lessdumb.sqlite'),
      secret: configuredSecret ?? localSecret(dataDirectory),
      baseURL,
      trustedOrigins: configuredURL
        ? [new URL(baseURL).origin]
        : ['http://localhost:4321', 'http://127.0.0.1:4321'],
    });
  }
  await backend.ready();
  return backend;
}
