import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { AccountSession } from '../src/lib/account';

const sdk = vi.hoisted(() => ({
  signOut: vi.fn(),
  session: {
    data: null as AccountSession | null,
    isPending: false,
    error: null as unknown,
    refetch: vi.fn(),
  },
}));

vi.mock('better-auth/react', () => ({
  createAuthClient: () => ({
    useSession: () => sdk.session,
    signUp: { email: vi.fn() },
    signIn: { email: vi.fn() },
    signOut: sdk.signOut,
  }),
}));

import { authClient } from '../src/lib/account';

const account: AccountSession = {
  user: { id: 'observed-user', name: 'Learner', email: 'learner@example.test' },
  session: { id: 'observed-session' },
};

beforeEach(() => {
  sdk.session.data = null;
  sdk.session.isPending = false;
  sdk.session.error = null;
  sdk.session.refetch.mockReset();
  sdk.signOut.mockReset();
});

afterEach(() => vi.unstubAllGlobals());

describe('account session ownership resolution', () => {
  it.each([
    { status: 429, message: 'Rate limited' },
    { status: 503, message: 'Temporarily unavailable' },
    new TypeError('Failed to fetch'),
  ])('keeps an initial failed session lookup unresolved: %j', (error) => {
    sdk.session.error = error;
    const session = authClient.useSession();
    expect(session.data).toBeNull();
    expect(session.isPending).toBe(true);
    expect(session.error).toBe(error);
    session.refetch();
    expect(sdk.session.refetch).toHaveBeenCalledOnce();

    sdk.session.error = null;
    sdk.session.data = account;
    expect(authClient.useSession()).toMatchObject({
      data: account,
      isPending: false,
      error: null,
    });
  });

  it.each([429, 503])(
    'retains a previously observed account after HTTP %i',
    (status) => {
      sdk.session.data = account;
      sdk.session.error = { status };
      expect(authClient.useSession()).toMatchObject({
        data: account,
        isPending: false,
      });
    },
  );

  it.each([null, { status: 401 }])(
    'resolves a confirmed unauthenticated response: %j',
    (error) => {
      sdk.session.error = error;
      expect(authClient.useSession()).toMatchObject({
        data: null,
        isPending: false,
        error,
      });
    },
  );

  it('opens a fresh document only after the SDK confirms successful sign-out', async () => {
    sdk.session.data = account;
    const navigate = vi.fn();
    vi.stubGlobal('window', { location: { reload: navigate } });
    sdk.signOut.mockImplementation(async (options) => {
      expect(navigate).not.toHaveBeenCalled();
      // Better Auth invokes this documented callback only after HTTP success.
      options.fetchOptions.onSuccess();
      return { data: { success: true }, error: null };
    });
    expect((await authClient.signOut()).error).toBeNull();
    expect(navigate).toHaveBeenCalledExactlyOnceWith();
  });

  it('keeps the account and current document when sign-out fails', async () => {
    sdk.session.data = account;
    const navigate = vi.fn();
    vi.stubGlobal('window', { location: { reload: navigate } });
    const error = { status: 503, message: 'Temporarily unavailable' };
    sdk.signOut.mockResolvedValue({ data: null, error });
    expect((await authClient.signOut()).error).toBe(error);
    expect(navigate).not.toHaveBeenCalled();
    expect(authClient.useSession().data).toBe(account);
  });
});
