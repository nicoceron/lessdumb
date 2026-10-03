import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createAuthClient } from 'better-auth/client';
import type { AccountSession, AccountSessionState } from '../src/lib/account';
import {
  resolveSessionOwner,
  type SessionOwner,
} from '../src/lib/session-owner';

// The account adapter wraps Better Auth's React hook, which needs a React render.
// Here it reads the raw value of a real Better Auth session store instead.
const sdk = vi.hoisted(() => ({ raw: undefined as unknown }));
vi.mock('better-auth/react', () => ({
  createAuthClient: () => ({ useSession: () => sdk.raw }),
}));

import { authClient } from '../src/lib/account';

function account(id: string, sessionId = `${id}-session`): AccountSession {
  return {
    user: { id, name: id, email: `${id}@example.test` },
    session: { id: sessionId },
  };
}
const userA = account('user-a');
const userB = account('user-b');

function view(
  data: AccountSession | null,
  isPending: boolean,
  error: unknown = null,
): AccountSessionState {
  return { data, isPending, error, refetch: () => {} };
}

describe('resolveSessionOwner', () => {
  it('waits for the first session lookup', () => {
    expect(resolveSessionOwner(undefined, view(null, true))).toBeUndefined();
    expect(resolveSessionOwner(undefined, view(null, false))).toBeNull();
    expect(resolveSessionOwner(undefined, view(userA, false))).toBe('user-a');
  });

  it('keeps a confirmed guest while a later lookup is in flight', () => {
    expect(resolveSessionOwner(null, view(null, true))).toBeNull();
    expect(resolveSessionOwner(null, view(null, false))).toBeNull();
  });

  it('keeps an account while Better Auth refetches its data', () => {
    expect(resolveSessionOwner('user-a', view(userA, false))).toBe('user-a');
  });

  it('takes a new identity from the lookup result', () => {
    expect(resolveSessionOwner(null, view(userA, false))).toBe('user-a');
    expect(resolveSessionOwner('user-a', view(userB, false))).toBe('user-b');
    expect(resolveSessionOwner('user-a', view(null, false))).toBeNull();
  });

  it('leaves ownership unresolved after a failed lookup', () => {
    const failed = view(null, true, { status: 503 });
    expect(resolveSessionOwner(null, failed)).toBeUndefined();
    // The retry is a lookup in flight after a failure: still unresolved.
    expect(resolveSessionOwner(undefined, view(null, true))).toBeUndefined();
  });

  it('never carries an account over a lookup without data', () => {
    expect(resolveSessionOwner('user-a', view(null, true))).toBeUndefined();
  });

  it('gives the same owner when a render repeats', () => {
    const cases: [SessionOwner, AccountSessionState][] = [
      [undefined, view(null, true)],
      [null, view(null, true)],
      [null, view(null, true, { status: 429 })],
      ['user-a', view(userB, false)],
    ];
    for (const [previous, session] of cases) {
      const once = resolveSessionOwner(previous, session);
      expect(resolveSessionOwner(once, session)).toBe(once);
    }
  });
});

/**
 * A browser-like environment for Better Auth's real session store: its focus refetch
 * listens for `visibilitychange` on `document`, and it skips work without `window`.
 */
let page: EventTarget & { visibilityState: string };
const managers = [
  'better-auth:focus-manager',
  'better-auth:online-manager',
  'better-auth:broadcast-channel',
].map((name) => Symbol.for(name));

beforeEach(() => {
  page = Object.assign(new EventTarget(), { visibilityState: 'visible' });
  vi.stubGlobal('window', new EventTarget());
  vi.stubGlobal('document', page);
  vi.stubGlobal('navigator', { onLine: true });
  // Better Auth keeps these on globalThis; start each test with fresh ones.
  for (const key of managers)
    delete (globalThis as Record<symbol, unknown>)[key];
});
afterEach(() => vi.unstubAllGlobals());

/** A minimal `/api/auth` that answers session lookups and email sign-in. */
function authServer(initial: AccountSession | null) {
  const server = {
    session: initial,
    failure: 0,
    lookups: 0,
    signInAs: null as AccountSession | null,
  };
  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { 'Content-Type': 'application/json' },
    });
  const fetchImpl = async (input: RequestInfo | URL) => {
    const path = new URL(input instanceof Request ? input.url : String(input))
      .pathname;
    if (path.endsWith('/get-session')) {
      server.lookups += 1;
      if (server.failure)
        return json({ message: 'Unavailable' }, server.failure);
      return json(server.session);
    }
    if (path.endsWith('/sign-in/email') && server.signInAs) {
      server.session = server.signInAs;
      return json({
        redirect: false,
        token: 'token',
        user: server.session.user,
      });
    }
    return json({ message: 'Not found' }, 404);
  };
  return { server, fetchImpl };
}

/**
 * Mirrors useLearner around a real Better Auth session store. Each store value renders:
 * the adapter's session goes through `resolveSessionOwner`, readiness is the render-time
 * ownership check, and the `[owner]` effect reads that owner's saved copy and re-renders.
 */
function mountLearner(initial: AccountSession | null) {
  const { server, fetchImpl } = authServer(initial);
  const client = createAuthClient({
    baseURL: 'http://lessdumb.test',
    fetchOptions: { customFetchImpl: fetchImpl },
  });
  const raw: { isPending: boolean; isRefetching: boolean }[] = [];
  const ready: boolean[] = [];
  const owners: SessionOwner[] = [];
  const reads: SessionOwner[] = [];
  let owner: SessionOwner;
  let effectOwner: SessionOwner | 'unmounted' = 'unmounted';
  let snapshotOwner: SessionOwner;

  function render() {
    owner = resolveSessionOwner(owner, authClient.useSession());
    owners.push(owner);
    ready.push(owner !== undefined && snapshotOwner === owner);
    if (owner === effectOwner) return;
    effectOwner = owner;
    if (owner === undefined) return;
    reads.push(owner);
    snapshotOwner = owner;
    render();
  }
  const unsubscribe = client.useSession.subscribe((value) => {
    raw.push({ isPending: value.isPending, isRefetching: value.isRefetching });
    sdk.raw = value;
    render();
  });
  const settled = (lookups: number) =>
    vi.waitFor(() => {
      expect(server.lookups).toBe(lookups);
      const value = client.useSession.get();
      expect(value.isPending || value.isRefetching).toBe(false);
    });
  const focus = () => page.dispatchEvent(new Event('visibilitychange'));
  return {
    client,
    server,
    raw,
    ready,
    owners,
    reads,
    settled,
    focus,
    unsubscribe,
  };
}

/** True when the workspace, once shown, was replaced by the loading screen. */
function flickered(ready: boolean[]) {
  return ready.slice(ready.indexOf(true)).includes(false);
}

describe('session refetches in the learner workspace', () => {
  it('keeps a guest workspace mounted when the tab regains focus', async () => {
    const learner = mountLearner(null);
    // The first load waits for the session.
    expect(learner.ready).toEqual([false]);
    await learner.settled(1);
    expect(learner.reads).toEqual([null]);
    const shown = learner.raw.length;

    learner.focus();
    await learner.settled(2);
    // Better Auth reports the guest's refetch as pending: the cause of CEN-172.
    expect(learner.raw.slice(shown)).toContainEqual({
      isPending: true,
      isRefetching: true,
    });
    // No loading screen, and no second read of the guest's saved copy.
    expect(flickered(learner.ready)).toBe(false);
    expect(learner.reads).toEqual([null]);
    learner.unsubscribe();
  });

  it('keeps an account workspace mounted when the same user refetches', async () => {
    const learner = mountLearner(userA);
    await learner.settled(1);
    // The refreshed session differs, but it belongs to the same user.
    learner.server.session = account('user-a', 'user-a-renewed');

    learner.focus();
    await learner.settled(2);
    expect(learner.client.useSession.get().data?.session.id).toBe(
      'user-a-renewed',
    );
    expect(flickered(learner.ready)).toBe(false);
    expect(learner.reads).toEqual(['user-a']);
    learner.unsubscribe();
  });

  it('resets through the ownership check when a guest signs in', async () => {
    const learner = mountLearner(null);
    await learner.settled(1);
    learner.server.signInAs = userA;
    const shown = learner.owners.length;

    await learner.client.signIn.email({
      email: 'user-a@example.test',
      password: 'password',
    });
    await learner.settled(2);
    // The guest stays a guest until the lookup confirms the account. Then the
    // account renders not ready until its own copy is read.
    expect(learner.owners.slice(shown)).not.toContain(undefined);
    expect(learner.owners.at(-1)).toBe('user-a');
    expect(learner.reads).toEqual([null, 'user-a']);
    expect(learner.ready.slice(learner.owners.indexOf('user-a'))).toEqual([
      false,
      true,
    ]);
    learner.unsubscribe();
  });

  it('resets through the ownership check when another account takes the session', async () => {
    const learner = mountLearner(userA);
    await learner.settled(1);
    learner.server.session = userB;

    learner.focus();
    await learner.settled(2);
    expect(learner.reads).toEqual(['user-a', 'user-b']);
    expect(learner.ready.slice(learner.owners.indexOf('user-b'))).toEqual([
      false,
      true,
    ]);
    learner.unsubscribe();
  });

  it('resets to the guest workspace when the session ends', async () => {
    const learner = mountLearner(userA);
    await learner.settled(1);
    learner.server.session = null;

    learner.focus();
    await learner.settled(2);
    expect(learner.reads).toEqual(['user-a', null]);
    expect(learner.ready.at(-2)).toBe(false);
    expect(learner.ready.at(-1)).toBe(true);
    learner.unsubscribe();
  });

  it('still leaves a guest unresolved when a lookup fails', async () => {
    const learner = mountLearner(null);
    await learner.settled(1);
    learner.server.failure = 503;

    learner.focus();
    await learner.settled(2);
    // A failure confirms no one: the retry screen replaces the workspace.
    expect(learner.owners.at(-1)).toBeUndefined();
    expect(learner.ready.at(-1)).toBe(false);

    learner.server.failure = 0;
    learner.client.useSession.get().refetch();
    await learner.settled(3);
    expect(learner.owners.at(-1)).toBeNull();
    expect(learner.reads).toEqual([null, null]);
    learner.unsubscribe();
  });
});
