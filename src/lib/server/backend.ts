import { randomBytes } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { betterAuth } from 'better-auth';
import { authOptions as createAuthOptions } from './auth-options';
import { sqliteStateStore } from './sqlite-state-store';
import type { Backend, BackendAuth } from './backend-contract';
import type { Mailer } from './mail';
import { nodeMailer } from './node-mail';
export type { Backend } from './backend-contract';
export { SESSION_READ_RATE_LIMIT } from './auth-options';
import { getMigrations } from 'better-auth/db/migration';
import Database from 'better-sqlite3';

export interface BackendOptions {
  databasePath: string;
  secret: string;
  baseURL: string;
  trustedOrigins?: string[];
  rateLimit?: boolean;
  /** Omitted: email is off, as in the default configuration. */
  mail?: Mailer;
}

export interface NodeBackend extends Backend {
  database: Database.Database;
}

/** One database connection and one migration promise for the Node process. */
export function createBackend(options: BackendOptions): NodeBackend {
  if (options.databasePath !== ':memory:')
    mkdirSync(dirname(options.databasePath), { recursive: true });
  const database = new Database(options.databasePath);
  database.pragma('foreign_keys = ON');
  database.pragma('journal_mode = WAL');
  database.pragma('busy_timeout = 5000');

  const states = sqliteStateStore(database);
  const authOptions = createAuthOptions(
    { ...options, deleteUserData: (userId) => states.remove(userId) },
    database,
  );

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
    states,
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

const nodeBaseURL = () =>
  process.env.BETTER_AUTH_URL ?? 'http://localhost:4321';
let mail: Mailer | undefined;
const nodeMail = () => (mail ??= nodeMailer(nodeBaseURL()));

/** The Node server has no real email; only the loopback test outbox enables it. */
export function emailEnabled(): boolean {
  return nodeMail().enabled;
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
    const baseURL = nodeBaseURL();
    backend = createBackend({
      databasePath: resolve(dataDirectory, 'lessdumb.sqlite'),
      secret: configuredSecret ?? localSecret(dataDirectory),
      baseURL,
      trustedOrigins: configuredURL
        ? [new URL(baseURL).origin]
        : ['http://localhost:4321', 'http://127.0.0.1:4321'],
      mail: nodeMail(),
    });
  }
  await backend.ready();
  return backend;
}
