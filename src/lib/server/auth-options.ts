import type { BetterAuthOptions } from 'better-auth';
import { APIError, createAuthMiddleware } from 'better-auth/api';
import {
  passwordResetEmail,
  RESET_PASSWORD_TOKEN_SECONDS,
  verificationEmail,
  VERIFY_EMAIL_TOKEN_SECONDS,
  type Mailer,
} from './mail';

export const SESSION_READ_RATE_LIMIT = { window: 60, max: 600 } as const;

/** Sent and consumed only by email; unavailable while mail is off. */
export const EMAIL_ROUTES = [
  '/request-password-reset',
  '/reset-password',
  '/reset-password/:token',
  '/send-verification-email',
  '/verify-email',
];
export const EMAIL_NOT_ENABLED = {
  code: 'EMAIL_NOT_ENABLED',
  message:
    'Email is not enabled on this server, so password reset and email verification are unavailable.',
};

export interface AuthOptions {
  secret: string;
  baseURL: string;
  trustedOrigins?: string[];
  rateLimit?: boolean;
  /** Absent or disabled: no reset or verification email, and their routes refuse. */
  mail?: Mailer;
  /** Removes the learner's own rows before Better Auth deletes the user. */
  deleteUserData?: (userId: string) => Promise<void> | void;
}

export function authOptions(
  options: AuthOptions,
  database: BetterAuthOptions['database'],
) {
  const mail = options.mail?.enabled ? options.mail : undefined;
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
      // Verification never blocks signing in or learning.
      requireEmailVerification: false,
      resetPasswordTokenExpiresIn: RESET_PASSWORD_TOKEN_SECONDS,
      revokeSessionsOnPasswordReset: true,
      ...(mail && {
        sendResetPassword: async ({
          user,
          url,
        }: {
          user: { email: string };
          url: string;
        }) => {
          await mail.sendMail({ to: user.email, ...passwordResetEmail(url) });
        },
      }),
    },
    ...(mail && {
      emailVerification: {
        sendOnSignUp: true,
        autoSignInAfterVerification: true,
        expiresIn: VERIFY_EMAIL_TOKEN_SECONDS,
        sendVerificationEmail: async ({
          user,
          url,
        }: {
          user: { email: string };
          url: string;
        }) => {
          await mail.sendMail({ to: user.email, ...verificationEmail(url) });
        },
      },
    }),
    user: {
      deleteUser: {
        enabled: true,
        beforeDelete: async (user: { id: string }) => {
          await options.deleteUserData?.(user.id);
        },
      },
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
        // Per client address; the D1 email budget caps total deliveries.
        '/request-password-reset': { window: 60, max: 3 },
        '/send-verification-email': { window: 60, max: 3 },
        '/delete-user': { window: 60, max: 10 },
      },
    },
    hooks: {
      before: createAuthMiddleware(async (ctx) => {
        if (!mail && EMAIL_ROUTES.includes(ctx.path))
          throw new APIError('BAD_REQUEST', EMAIL_NOT_ENABLED);
        // Deleting an account always needs the password, however fresh the session.
        if (ctx.path === '/delete-user' && !ctx.body?.password)
          throw new APIError('BAD_REQUEST', {
            code: 'PASSWORD_REQUIRED',
            message: 'Enter your password to delete your account.',
          });
      }),
    },
    advanced: {
      cookiePrefix: 'lessdumb',
      disableCSRFCheck: false,
      disableOriginCheck: false,
      defaultCookieAttributes: { httpOnly: true, sameSite: 'lax' },
    },
  } satisfies BetterAuthOptions;
}
