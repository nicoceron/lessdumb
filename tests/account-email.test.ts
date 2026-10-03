import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createBackend, type NodeBackend } from '../src/lib/server/backend';
import {
  createMailer,
  type MailTransport,
  type OutgoingMail,
} from '../src/lib/server/mail';
import { handleStateRequest } from '../src/lib/server/state-api';
import { createState } from '../src/lib/state';

const baseURL = 'http://localhost:4321';
const secret = 'test-only-secret-with-more-than-thirty-two-characters';
const password = 'correct-horse-123';
const cleanup: (() => void)[] = [];

afterEach(() => {
  for (const dispose of cleanup.splice(0).reverse()) dispose();
  vi.restoreAllMocks();
});

function capture(delivers = false) {
  const sent: OutgoingMail[] = [];
  const transport: MailTransport = {
    delivers,
    send: async (message) => {
      sent.push(message);
    },
  };
  return { sent, transport };
}

async function freshBackend(transport?: MailTransport) {
  vi.spyOn(console, 'info').mockImplementation(() => {});
  const directory = mkdtempSync(join(tmpdir(), 'lessdumb-email-'));
  cleanup.push(() => rmSync(directory, { recursive: true, force: true }));
  const backend = createBackend({
    databasePath: join(directory, 'test.sqlite'),
    secret,
    baseURL,
    rateLimit: false,
    mail: transport
      ? createMailer({ transport, from: 'lessdumb <noreply@lessdumb.test>' })
      : undefined,
  });
  cleanup.push(() => backend.close());
  await backend.ready();
  return backend;
}

function request(
  backend: NodeBackend,
  path: string,
  { body, cookie }: { body?: unknown; cookie?: string } = {},
) {
  const headers = new Headers({ origin: baseURL });
  if (body !== undefined) headers.set('content-type', 'application/json');
  if (cookie) headers.set('cookie', cookie);
  return backend.auth.handler(
    new Request(new URL(path, `${baseURL}/api/auth/`), {
      method: body !== undefined ? 'POST' : 'GET',
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      redirect: 'manual',
    }),
  );
}

function cookieFrom(response: Response) {
  return response.headers
    .getSetCookie()
    .map((value) => value.split(';')[0])
    .join('; ');
}

async function signUp(backend: NodeBackend, email: string) {
  const response = await request(backend, 'sign-up/email', {
    body: { name: 'Learner', email, password, callbackURL: '/?notice=x' },
  });
  expect(response.status).toBe(200);
  return cookieFrom(response);
}

async function signIn(backend: NodeBackend, email: string, secret: string) {
  return request(backend, 'sign-in/email', {
    body: { email, password: secret },
  });
}

async function session(backend: NodeBackend, cookie: string) {
  const response = await request(backend, 'get-session', { cookie });
  return (await response.json()) as {
    user: { id: string; emailVerified: boolean };
  } | null;
}

/** The link in a captured message, relative to the auth handler. */
function link(message: OutgoingMail) {
  const match = /https?:\/\/\S+/.exec(message.text);
  expect(match, message.text).not.toBeNull();
  const url = new URL(match![0]);
  expect(url.origin).toBe(baseURL);
  return url.pathname.replace('/api/auth/', '') + url.search;
}

describe('email off (the default configuration)', () => {
  it('signs up without sending and refuses every email route clearly', async () => {
    const backend = await freshBackend();
    const cookie = await signUp(backend, 'off@example.test');
    expect((await session(backend, cookie))?.user.emailVerified).toBe(false);
    for (const [path, body] of [
      ['request-password-reset', { email: 'off@example.test' }],
      ['send-verification-email', { email: 'off@example.test' }],
      ['reset-password', { token: 'anything', newPassword: 'new-pass-123' }],
      ['verify-email?token=anything', undefined],
      ['reset-password/anything?callbackURL=%2Freset-password', undefined],
    ] as const) {
      const response = await request(backend, path, { body, cookie });
      expect(response.status, path).toBe(400);
      expect(await response.json(), path).toMatchObject({
        code: 'EMAIL_NOT_ENABLED',
        message: expect.stringContaining('Email is not enabled'),
      });
    }
  });
});

describe('email on', () => {
  it('sends a verification link on sign-up that marks the email verified', async () => {
    const { sent, transport } = capture();
    const backend = await freshBackend(transport);
    const cookie = await signUp(backend, 'verify@example.test');
    expect(sent).toHaveLength(1);
    expect(sent[0]).toMatchObject({
      to: 'verify@example.test',
      subject: 'Verify your email for lessdumb',
      from: { email: 'noreply@lessdumb.test', name: 'lessdumb' },
    });
    expect((await session(backend, cookie))?.user.emailVerified).toBe(false);

    // Verification never blocks signing in.
    expect(
      (await signIn(backend, 'verify@example.test', password)).status,
    ).toBe(200);

    const verified = await request(backend, link(sent[0]));
    expect(verified.status).toBe(302);
    expect(verified.headers.get('location')).toBe('/?notice=x');
    expect((await session(backend, cookie))?.user.emailVerified).toBe(true);
    // A link opened in another browser signs that browser in.
    expect(await session(backend, cookieFrom(verified))).not.toBeNull();

    const resend = await request(backend, 'send-verification-email', {
      body: { email: 'verify@example.test' },
      cookie,
    });
    expect(resend.status).toBe(400);
    expect(sent).toHaveLength(1);
  });

  it('resends verification and reports an invalid link through the callback', async () => {
    const { sent, transport } = capture();
    const backend = await freshBackend(transport);
    const cookie = await signUp(backend, 'resend@example.test');
    const resend = await request(backend, 'send-verification-email', {
      body: { email: 'resend@example.test', callbackURL: '/?notice=y' },
      cookie,
    });
    expect(resend.status).toBe(200);
    expect(sent.map((message) => message.to)).toEqual([
      'resend@example.test',
      'resend@example.test',
    ]);
    const invalid = await request(
      backend,
      'verify-email?token=forged&callbackURL=%2F%3Fnotice%3Dy',
    );
    expect(invalid.headers.get('location')).toBe(
      '/?notice=y&error=INVALID_TOKEN',
    );
  });

  it('resets a forgotten password through the emailed link and revokes old sessions', async () => {
    const { sent, transport } = capture();
    const backend = await freshBackend(transport);
    const oldCookie = await signUp(backend, 'reset@example.test');
    sent.length = 0;

    const requested = await request(backend, 'request-password-reset', {
      body: { email: 'reset@example.test', redirectTo: '/reset-password' },
    });
    expect(requested.status).toBe(200);
    expect(sent).toHaveLength(1);
    expect(sent[0].subject).toBe('Reset your lessdumb password');

    const callback = await request(backend, link(sent[0]));
    expect(callback.status).toBe(302);
    const target = new URL(callback.headers.get('location')!);
    expect(target.pathname).toBe('/reset-password');
    const token = target.searchParams.get('token')!;
    expect(token).toBeTruthy();

    const reset = await request(backend, 'reset-password', {
      body: { token, newPassword: 'brand-new-pass-456' },
    });
    expect(reset.status).toBe(200);
    expect(await session(backend, oldCookie)).toBeNull();
    expect((await signIn(backend, 'reset@example.test', password)).status).toBe(
      401,
    );
    expect(
      (await signIn(backend, 'reset@example.test', 'brand-new-pass-456'))
        .status,
    ).toBe(200);

    // The token works once.
    const reused = await request(backend, 'reset-password', {
      body: { token, newPassword: 'another-pass-789' },
    });
    expect(reused.status).toBe(400);
  });

  it('answers a reset request for an unknown email without sending anything', async () => {
    const { sent, transport } = capture();
    const backend = await freshBackend(transport);
    const response = await request(backend, 'request-password-reset', {
      body: { email: 'nobody@example.test', redirectTo: '/reset-password' },
    });
    expect(response.status).toBe(200);
    expect(sent).toEqual([]);
  });

  it('never fails sign-up or reset because delivery fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const transport: MailTransport = {
      delivers: true,
      send: async () => {
        throw new Error('Email Service rejected the sender');
      },
    };
    const backend = await freshBackend(transport);
    await signUp(backend, 'learner@lessdumb-mail.dev');
    const response = await request(backend, 'request-password-reset', {
      body: { email: 'learner@lessdumb-mail.dev' },
    });
    expect(response.status).toBe(200);
  });

  it('does not deliver to reserved domains', async () => {
    const { sent, transport } = capture(true);
    const backend = await freshBackend(transport);
    await signUp(backend, 'smoke+1@example.com');
    const response = await request(backend, 'request-password-reset', {
      body: { email: 'smoke+1@example.com' },
    });
    expect(response.status).toBe(200);
    expect(sent).toEqual([]);
  });
});

describe('account deletion', () => {
  it('requires the password, then removes the user, sessions, and progress', async () => {
    const backend = await freshBackend();
    const cookie = await signUp(backend, 'delete@example.test');
    const user = (await session(backend, cookie))!.user;
    const state = createState();
    state.dailyGoal = 100;
    const saved = await handleStateRequest(
      new Request(`${baseURL}/api/state`, {
        method: 'PUT',
        headers: {
          origin: baseURL,
          cookie,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ state, revision: 0 }),
      }),
      backend,
    );
    expect(saved.status).toBe(200);
    const rows = () =>
      backend.database
        .prepare(
          'SELECT COUNT(*) AS count FROM learner_state WHERE user_id = ?',
        )
        .get(user.id) as { count: number };
    expect(rows().count).toBe(1);

    const withoutPassword = await request(backend, 'delete-user', {
      body: {},
      cookie,
    });
    expect(withoutPassword.status).toBe(400);
    expect(await withoutPassword.json()).toMatchObject({
      code: 'PASSWORD_REQUIRED',
    });
    const wrongPassword = await request(backend, 'delete-user', {
      body: { password: 'not-the-password' },
      cookie,
    });
    expect(wrongPassword.status).toBe(400);
    expect(rows().count).toBe(1);

    const deleted = await request(backend, 'delete-user', {
      body: { password },
      cookie,
    });
    expect(deleted.status).toBe(200);
    expect(await deleted.json()).toEqual({
      success: true,
      message: 'User deleted',
    });
    expect(rows().count).toBe(0);
    expect(await session(backend, cookie)).toBeNull();
    expect(
      backend.database
        .prepare('SELECT COUNT(*) AS count FROM user WHERE id = ?')
        .get(user.id),
    ).toEqual({ count: 0 });
    expect(
      (await signIn(backend, 'delete@example.test', password)).status,
    ).toBe(401);
    // The same email can start over with a new, empty account.
    await signUp(backend, 'delete@example.test');
  });

  it('cannot delete without a session', async () => {
    const backend = await freshBackend();
    await signUp(backend, 'anonymous@example.test');
    const response = await request(backend, 'delete-user', {
      body: { password },
    });
    expect(response.status).toBe(401);
  });
});
