import { createAuthClient } from 'better-auth/react';
import { migrateState, type LearnerState } from './state';

export interface AccountUser {
  id: string;
  name: string;
  email: string;
  emailVerified?: boolean;
}
export interface AccountSession {
  user: AccountUser;
  session: { id: string };
}
export interface AccountSessionState {
  data: AccountSession | null;
  isPending: boolean;
  error: unknown;
  refetch: () => void;
}
interface AuthResult {
  data: unknown;
  error: { message?: string; status?: number } | null;
}
interface AccountAuthClient {
  useSession: () => AccountSessionState;
  signUp: {
    email: (input: {
      name: string;
      email: string;
      password: string;
    }) => Promise<AuthResult>;
  };
  signIn: {
    email: (input: { email: string; password: string }) => Promise<AuthResult>;
  };
  signOut: () => Promise<AuthResult>;
  requestPasswordReset: (email: string) => Promise<AuthResult>;
  resetPassword: (token: string, newPassword: string) => Promise<AuthResult>;
  sendVerificationEmail: (email: string) => Promise<AuthResult>;
  deleteUser: (userId: string, password: string) => Promise<AuthResult>;
}

/** One-time messages the app shows after a redirect, then removes from the URL. */
export const NOTICE_PARAM = 'notice';
export const EMAIL_VERIFIED_NOTICE = 'email-verified';
export const ACCOUNT_DELETED_NOTICE = 'account-deleted';
export const PASSWORD_RESET_NOTICE = 'password-reset';
/** Better Auth appends `error=<code>` here when a verification link fails. */
const verifiedCallback = `/?${NOTICE_PARAM}=${EMAIL_VERIFIED_NOTICE}`;

/** Removes a deleted account's progress copy from this browser. */
function forgetAccountOnDevice(userId: string) {
  try {
    localStorage.removeItem(`lessdumb.account.${userId}`);
    const claim = JSON.parse(
      localStorage.getItem('lessdumb.guest-import') ?? 'null',
    );
    if (claim?.owner === userId)
      localStorage.removeItem('lessdumb.guest-import');
  } catch {
    /* Storage may be unavailable; the server copy is already gone. */
  }
}

/** Keep library generics inside this adapter; callers use a small public contract. */
const client = createAuthClient();
export const authClient: AccountAuthClient = {
  useSession() {
    const result = client.useSession();
    // A failed first lookup has not established either an account or a guest.
    // Better Auth already retains previously validated data on non-401 errors.
    const unavailable =
      !result.data && !!result.error && result.error.status !== 401;
    return {
      data: result.data,
      isPending: result.isPending || unavailable,
      error: result.error,
      refetch: () => {
        void result.refetch();
      },
    };
  },
  signUp: {
    // The verification link (sent only while email is enabled) returns here.
    email: async (input) =>
      client.signUp.email({ ...input, callbackURL: verifiedCallback }),
  },
  signIn: { email: async (input) => client.signIn.email(input) },
  signOut: async () =>
    client.signOut({
      fetchOptions: {
        // A fresh document cannot retain the SDK's previous account if the
        // post-sign-out session refresh fails after the server revoked it.
        onSuccess: () => window.location.reload(),
      },
    }),
  requestPasswordReset: async (email) =>
    client.requestPasswordReset({ email, redirectTo: '/reset-password' }),
  resetPassword: async (token, newPassword) =>
    client.resetPassword({ token, newPassword }),
  sendVerificationEmail: async (email) =>
    client.sendVerificationEmail({ email, callbackURL: verifiedCallback }),
  deleteUser: async (userId, password) =>
    client.deleteUser({
      password,
      fetchOptions: {
        // Like sign-out, a fresh document drops the deleted account's SDK state.
        onSuccess: () => {
          forgetAccountOnDevice(userId);
          window.location.assign(`/?${NOTICE_PARAM}=${ACCOUNT_DELETED_NOTICE}`);
        },
      },
    }),
};

export interface AccountState {
  state: LearnerState | null;
  revision: number;
}

export class AccountRequestError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = 'AccountRequestError';
  }
}

export class StateConflictError extends AccountRequestError {
  constructor(public latest: AccountState) {
    super(
      'Your progress changed on another device. Reload or merge the latest progress before saving.',
      409,
    );
    this.name = 'StateConflictError';
  }
}

/** Accounts saved before a schema or catalog change load in the current shape. */
function current(result: AccountState): AccountState {
  return result.state
    ? { ...result, state: migrateState(result.state) }
    : result;
}

async function accountResponse(response: Response): Promise<AccountState> {
  const result = await response.json();
  if (response.status === 409) throw new StateConflictError(current(result));
  if (!response.ok)
    throw new AccountRequestError(
      result.error ?? 'Your progress could not be synced.',
      response.status,
    );
  return current(result as AccountState);
}

export async function loadAccountState(
  expectedUserId?: string,
  signal?: AbortSignal,
): Promise<AccountState> {
  return accountResponse(
    await fetch('/api/state', {
      credentials: 'same-origin',
      cache: 'no-store',
      signal,
      headers: expectedUserId
        ? { 'X-Lessdumb-User': expectedUserId }
        : undefined,
    }),
  );
}

/** Use the revision from the last successful load/save to prevent lost updates. */
export async function saveAccountState(
  state: LearnerState,
  revision = 0,
  expectedUserId?: string,
  signal?: AbortSignal,
): Promise<AccountState> {
  return accountResponse(
    await fetch('/api/state', {
      method: 'PUT',
      credentials: 'same-origin',
      signal,
      headers: {
        'Content-Type': 'application/json',
        ...(expectedUserId ? { 'X-Lessdumb-User': expectedUserId } : {}),
      },
      body: JSON.stringify({ state, revision }),
    }),
  );
}
