import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { createBackend, type Backend } from '../src/lib/server/backend';
import { handleStateRequest } from '../src/lib/server/state-api';
import { createState } from '../src/lib/state';
import { applyAttempt, recordLesson } from '../src/lib/learning';
import { skills } from '../src/lib/curriculum';

const baseURL = 'http://localhost:4321';
const secret = 'test-only-secret-with-more-than-thirty-two-characters';
const cleanup: (() => void)[] = [];

afterEach(() => {
  for (const dispose of cleanup.splice(0).reverse()) dispose();
});

async function freshBackend() {
  const directory = mkdtempSync(join(tmpdir(), 'lessdumb-backend-'));
  cleanup.push(() => rmSync(directory, { recursive: true, force: true }));
  const backend = createBackend({
    databasePath: join(directory, 'test.sqlite'),
    secret,
    baseURL,
    rateLimit: false,
  });
  cleanup.push(() => backend.close());
  await backend.ready();
  return { backend, directory };
}

function authRequest(
  backend: Backend,
  path: string,
  body?: unknown,
  cookie?: string,
  origin = baseURL,
) {
  const headers = new Headers({ origin });
  if (body !== undefined) headers.set('content-type', 'application/json');
  if (cookie) headers.set('cookie', cookie);
  return backend.auth.handler(
    new Request(`${baseURL}/api/auth${path}`, {
      method: body !== undefined ? 'POST' : 'GET',
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),
  );
}

function sessionCookie(response: Response) {
  const values = response.headers.getSetCookie();
  return values.map((value) => value.split(';')[0]).join('; ');
}

async function register(backend: Backend, email = 'first@example.test') {
  const response = await authRequest(backend, '/sign-up/email', {
    name: 'Learner',
    email,
    password: 'correct-horse-123',
  });
  expect(response.status).toBe(200);
  return sessionCookie(response);
}

describe('documented Better Auth account backend', () => {
  it('registers, hashes the password, persists the session, and signs out', async () => {
    const { backend } = await freshBackend();
    const cookie = await register(backend);
    expect(cookie).toContain('lessdumb.session_token=');

    const account = backend.database
      .prepare('SELECT password FROM account WHERE providerId = ?')
      .get('credential') as { password: string };
    expect(account.password).toBeTruthy();
    expect(account.password).not.toBe('correct-horse-123');

    const session = await authRequest(
      backend,
      '/get-session',
      undefined,
      cookie,
    );
    expect(session.status).toBe(200);
    expect((await session.json()).user.email).toBe('first@example.test');

    const logout = await authRequest(backend, '/sign-out', {}, cookie);
    expect(logout.status).toBe(200);
    const afterLogout = await authRequest(
      backend,
      '/get-session',
      undefined,
      cookie,
    );
    expect(await afterLogout.json()).toBeNull();
  });

  it('checks credentials and rejects cross-origin sign-in', async () => {
    const { backend } = await freshBackend();
    await register(backend);
    const badPassword = await authRequest(backend, '/sign-in/email', {
      email: 'first@example.test',
      password: 'wrong-password',
    });
    expect(badPassword.status).toBe(401);
    const signin = await authRequest(backend, '/sign-in/email', {
      email: 'first@example.test',
      password: 'correct-horse-123',
    });
    expect(signin.status).toBe(200);
    expect(sessionCookie(signin)).toContain('lessdumb.session_token=');
    const untrusted = await authRequest(
      backend,
      '/sign-in/email',
      { email: 'first@example.test', password: 'correct-horse-123' },
      undefined,
      'https://untrusted.example',
    );
    expect(untrusted.status).toBe(403);
  });

  it('preserves accounts and sessions when the Node database connection restarts', async () => {
    const directory = mkdtempSync(join(tmpdir(), 'lessdumb-restart-'));
    cleanup.push(() => rmSync(directory, { recursive: true, force: true }));
    const databasePath = join(directory, 'test.sqlite');
    const original = createBackend({
      databasePath,
      secret,
      baseURL,
      rateLimit: false,
    });
    await original.ready();
    const cookie = await register(original);
    const state = progressFixture();
    expect(
      (await stateRequest(original, cookie, { state, revision: 0 })).status,
    ).toBe(200);
    original.close();

    const restarted = createBackend({
      databasePath,
      secret,
      baseURL,
      rateLimit: false,
    });
    cleanup.push(() => restarted.close());
    await restarted.ready();
    const session = await authRequest(
      restarted,
      '/get-session',
      undefined,
      cookie,
    );
    expect((await session.json()).user.email).toBe('first@example.test');
    expect(await (await stateRequest(restarted, cookie)).json()).toEqual({
      state,
      revision: 1,
    });
  });
});

function progressFixture() {
  return {
    version: 1,
    progress: {
      version: 1,
      skills: {},
      totalXp: 0,
      dailyXp: {},
      lastActivityDate: null,
      streak: 0,
      attempts: [],
      timeZone: 'America/Bogota',
    },
    dailyGoal: 50,
    cards: [],
    anki: { connected: false, profile: null, deck: 'lessdumb::Python' },
    createdAt: 1,
    updatedAt: 1,
  };
}

function stateRequest(
  backend: Backend,
  cookie?: string,
  body?: unknown,
  origin = baseURL,
) {
  const headers = new Headers({ origin });
  if (cookie) headers.set('cookie', cookie);
  if (body !== undefined) headers.set('content-type', 'application/json');
  return handleStateRequest(
    new Request(`${baseURL}/api/state`, {
      method: body !== undefined ? 'PUT' : 'GET',
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),
    backend,
  );
}

describe('versioned per-account progress', () => {
  it('rejects an old tab when its cookie now belongs to a different learner', async () => {
    const { backend } = await freshBackend();
    const firstCookie = await register(backend, 'old-tab@example.test');
    const first = await backend.auth.api.getSession({
      headers: new Headers({ cookie: firstCookie }),
    });
    const nextCookie = await register(backend, 'new-account@example.test');
    for (const method of ['GET', 'PUT']) {
      const response = await handleStateRequest(
        new Request(`${baseURL}/api/state`, {
          method,
          headers: {
            origin: baseURL,
            cookie: nextCookie,
            'x-lessdumb-user': first!.user.id,
            'content-type': 'application/json',
          },
          body:
            method === 'PUT'
              ? JSON.stringify({ state: progressFixture(), revision: 0 })
              : undefined,
        }),
        backend,
      );
      expect(response.status).toBe(401);
    }
    expect(await (await stateRequest(backend, nextCookie)).json()).toEqual({
      state: null,
      revision: 0,
    });
  });

  it('accepts the actual lesson and mastery state produced by the learning engine', async () => {
    const { backend } = await freshBackend();
    const cookie = await register(backend);
    const state = createState();
    const skill = skills.find(
      (candidate) => candidate.prerequisites.length === 0,
    )!;
    state.progress = recordLesson(state.progress, skill.id, 1_790_900_000_000);
    for (const [index, question] of skill.questions.entries()) {
      state.progress = applyAttempt(
        state.progress,
        {
          skillId: skill.id,
          questionId: question.id,
          correct: true,
          mode: 'learn',
        },
        1_790_900_000_001 + index,
      );
    }
    const saved = await stateRequest(backend, cookie, { state, revision: 0 });
    expect(saved.status).toBe(200);
    expect(await (await stateRequest(backend, cookie)).json()).toEqual({
      state,
      revision: 1,
    });
  });

  it('isolates learners and atomically rejects stale revisions', async () => {
    const { backend } = await freshBackend();
    expect((await stateRequest(backend)).status).toBe(401);
    const firstCookie = await register(backend, 'first@example.test');
    const secondCookie = await register(backend, 'second@example.test');
    expect(await (await stateRequest(backend, firstCookie)).json()).toEqual({
      state: null,
      revision: 0,
    });
    const state = progressFixture();
    const saved = await stateRequest(backend, firstCookie, {
      state,
      revision: 0,
    });
    expect(saved.status).toBe(200);
    expect(await saved.json()).toEqual({ state, revision: 1 });
    expect(await (await stateRequest(backend, secondCookie)).json()).toEqual({
      state: null,
      revision: 0,
    });

    const stale = await stateRequest(backend, firstCookie, {
      state: { ...state, dailyGoal: 100 },
      revision: 0,
    });
    expect(stale.status).toBe(409);
    expect(await stale.json()).toEqual({ state, revision: 1 });
    const current = await stateRequest(backend, firstCookie, {
      state: { ...state, dailyGoal: 100 },
      revision: 1,
    });
    expect(current.status).toBe(200);
    expect((await current.json()).revision).toBe(2);
  });

  it('stores generic future subject skill IDs and pending Anki cards together', async () => {
    const { backend } = await freshBackend();
    const cookie = await register(backend);
    const state = {
      ...progressFixture(),
      progress: {
        ...progressFixture().progress,
        skills: {
          'physics:kinematics': {
            lessonSeen: true,
            attempts: 2,
            correct: 1,
            questionIds: ['physics:velocity-1'],
            rewardedQuestionIds: ['physics:velocity-1'],
            reviewQuestionIds: [],
            consecutiveCorrect: 1,
            mastery: 0.5,
            intervalDays: 1,
            dueAt: 1000,
            lastPracticedAt: 1,
            reviewCount: 0,
            learnedAt: null,
            lastQuestionId: 'physics:velocity-1',
          },
        },
      },
      cards: [
        {
          id: 'mistake:velocity-1',
          skillId: 'physics:kinematics',
          skillName: 'Kinematics',
          front: 'What is velocity?',
          back: 'Change in position per unit time.',
          kind: 'mistake',
          status: 'pending',
        },
      ],
    };
    const response = await stateRequest(backend, cookie, {
      state,
      revision: 0,
    });
    expect(response.status).toBe(200);
    expect(await (await stateRequest(backend, cookie)).json()).toEqual({
      state,
      revision: 1,
    });
  });

  it('rejects invalid shapes, extra secrets, and cross-origin state writes', async () => {
    const { backend } = await freshBackend();
    const cookie = await register(backend);
    const state = progressFixture();
    const invalid = await stateRequest(backend, cookie, {
      state: { ...state, version: 2 },
      revision: 0,
    });
    expect(invalid.status).toBe(400);
    const extraSecret = await stateRequest(backend, cookie, {
      state: {
        ...state,
        anki: { ...state.anki, apiKey: 'should-never-be-saved' },
      },
      revision: 0,
    });
    expect(extraSecret.status).toBe(400);
    const userSpoof = await stateRequest(backend, cookie, {
      state,
      revision: 0,
      userId: 'another-user',
    });
    expect(userSpoof.status).toBe(400);
    const crossOrigin = await stateRequest(
      backend,
      cookie,
      { state, revision: 0 },
      'https://untrusted.example',
    );
    expect(crossOrigin.status).toBe(403);
    expect(await (await stateRequest(backend, cookie)).json()).toEqual({
      state: null,
      revision: 0,
    });
  });

  it('rejects oversized requests before parsing them', async () => {
    const { backend } = await freshBackend();
    const cookie = await register(backend);
    const response = await handleStateRequest(
      new Request(`${baseURL}/api/state`, {
        method: 'PUT',
        headers: {
          origin: baseURL,
          cookie,
          'content-type': 'application/json',
        },
        body: 'x'.repeat(2 * 1024 * 1024 + 1),
      }),
      backend,
    );
    expect(response.status).toBe(413);
  });
});
