import type { BetterAuthOptions } from 'better-auth';

export const SESSION_READ_RATE_LIMIT = { window: 60, max: 600 } as const;

export interface AuthOptions {
  secret: string;
  baseURL: string;
  trustedOrigins?: string[];
  rateLimit?: boolean;
}

export function authOptions(
  options: AuthOptions,
  database: BetterAuthOptions['database'],
) {
  return {
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
      disableCSRFCheck: false,
      disableOriginCheck: false,
      defaultCookieAttributes: { httpOnly: true, sameSite: 'lax' },
    },
  } satisfies BetterAuthOptions;
}
