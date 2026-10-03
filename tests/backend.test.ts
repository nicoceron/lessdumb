import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import {
  createBackend,
  SESSION_READ_RATE_LIMIT,
  type Backend,
} from '../src/lib/server/backend';
import { handleStateRequest } from '../src/lib/server/state-api';
import { MAX_STATE_BODY_BYTES } from '../src/lib/server/state-validation';
import {
  createState,
  recordLearningAnswer,
  type LearnerState,
} from '../src/lib/state';
import {
  applyAttempt,
  DAY_MS,
  getStats,
  isMastered,
  isUnlocked,
  MAX_RECENT_ATTEMPTS,
  nextTask,
  recordLesson,
  selectQuestion,
} from '../src/lib/learning';
import { skills } from '../src/lib/curriculum';
import { earnedXp, lessonXp, REVIEW_XP } from '../src/lib/xp';
import {
  lessonAnswerIds,
  masterSkill,
  masterSkillState,
} from './helpers/mastery';

const baseURL = 'http://localhost:4321';
const secret = 'test-only-secret-with-more-than-thirty-two-characters';
const cleanup: (() => void)[] = [];

afterEach(() => {
  for (const dispose of cleanup.splice(0).reverse()) dispose();
});

async function freshBackend(rateLimit = false) {
  const directory = mkdtempSync(join(tmpdir(), 'lessdumb-backend-'));
  cleanup.push(() => rmSync(directory, { recursive: true, force: true }));
  const backend = createBackend({
    databasePath: join(directory, 'test.sqlite'),
    secret,
    baseURL,
    rateLimit,
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
  it('allows session reads beyond the generic quota, then enforces the bounded read rule', async () => {
    const { backend } = await freshBackend(true);
    const cookie = await register(backend);
    for (let index = 0; index < SESSION_READ_RATE_LIMIT.max; index++) {
      const response = await authRequest(
        backend,
        '/get-session',
        undefined,
        cookie,
      );
      expect(response.status, `session lookup ${index + 1}`).toBe(200);
      expect((await response.json()).user.email).toBe('first@example.test');
    }
    const limited = await authRequest(
      backend,
      '/get-session',
      undefined,
      cookie,
    );
    expect(limited.status).toBe(429);
    expect(Number(limited.headers.get('x-retry-after'))).toBeGreaterThan(0);
  }, 15000);

  it('keeps credential attempts at ten per minute independently of session reads', async () => {
    const { backend } = await freshBackend(true);
    await register(backend);
    for (let index = 0; index < 10; index++) {
      const response = await authRequest(backend, '/sign-in/email', {
        email: 'first@example.test',
        password: 'wrong-password',
      });
      expect(response.status).toBe(401);
    }
    const limited = await authRequest(backend, '/sign-in/email', {
      email: 'first@example.test',
      password: 'wrong-password',
    });
    expect(limited.status).toBe(429);
  }, 15000);

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

function progressFixture(version = 5) {
  return {
    version,
    progress: {
      version,
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
  it('persists distinct engine mastery, review queues, cards, and preferences for two real accounts', async () => {
    const { backend } = await freshBackend();
    const firstCookie = await register(backend, 'engine-first@example.test');
    const secondCookie = await register(backend, 'engine-second@example.test');
    const firstSkill = skills.find((skill) => skill.id === 'print-output')!;
    const secondSkill = skills.find((skill) => skill.id === 'ds-workloads')!;
    const now = Date.now();
    const learnedAt = now - 2 * DAY_MS;
    const first = createState();
    first.dailyGoal = 100;
    first.activeCourseId = firstSkill.courseId;
    first.anki.deck = 'First learner';
    first.progress = masterSkill(first.progress, firstSkill.id, learnedAt);
    first.cards = firstSkill.flashcards.map((card) => ({
      ...card,
      skillName: firstSkill.title,
      kind: 'mastery',
      status: 'pending',
    }));
    let second = createState();
    second.dailyGoal = 25;
    second.activeCourseId = secondSkill.courseId;
    second.anki.deck = 'Second learner';
    second = masterSkillState(second, secondSkill.id);
    second = recordLearningAnswer(second, {
      skillId: secondSkill.id,
      questionId: lessonAnswerIds(secondSkill.id)[0],
      correct: false,
      mode: 'learn',
    });

    for (const [cookie, state] of [
      [firstCookie, first],
      [secondCookie, second],
    ] as const) {
      expect(
        (await stateRequest(backend, cookie, { state, revision: 0 })).status,
      ).toBe(200);
    }
    const load = async (cookie: string) =>
      (await (await stateRequest(backend, cookie)).json()) as {
        state: LearnerState;
        revision: number;
      };
    const storedFirst = await load(firstCookie);
    const storedSecond = await load(secondCookie);
    expect(storedFirst.state).toEqual(first);
    expect(storedSecond.state).toEqual(second);
    expect(getStats(storedFirst.state.progress, now).mastered).toBe(1);
    expect(getStats(storedSecond.state.progress, now).mastered).toBe(0);
    expect(isMastered(storedFirst.state.progress, secondSkill.id)).toBe(false);
    expect(isMastered(storedSecond.state.progress, firstSkill.id)).toBe(false);
    expect(
      nextTask(storedFirst.state.progress, now, firstSkill.courseId),
    ).toMatchObject({
      skillId: firstSkill.id,
      mode: 'review',
    });
    expect(
      nextTask(storedSecond.state.progress, now, secondSkill.courseId),
    ).toMatchObject({
      skillId: secondSkill.id,
      mode: 'learn',
    });
    expect(storedFirst.state.cards.map((card) => card.skillId)).toEqual([
      firstSkill.id,
      firstSkill.id,
    ]);
    expect(storedSecond.state.cards).toHaveLength(3);
    expect(
      storedSecond.state.cards.every((card) => card.skillId === secondSkill.id),
    ).toBe(true);
    expect(
      storedSecond.state.cards.some((card) => card.kind === 'mistake'),
    ).toBe(true);

    for (
      let index = 0;
      storedFirst.state.progress.skills[firstSkill.id].reviewCount === 0 &&
      index < 8;
      index++
    ) {
      const question = selectQuestion(
        storedFirst.state.progress,
        firstSkill,
        'review',
      );
      storedFirst.state.progress = applyAttempt(
        storedFirst.state.progress,
        {
          skillId: firstSkill.id,
          questionId: question.id,
          correct: true,
          mode: 'review',
        },
        now + index,
      );
    }
    const saved = await stateRequest(backend, firstCookie, {
      state: storedFirst.state,
      revision: storedFirst.revision,
    });
    expect(saved.status).toBe(200);
    const reviewed = await load(firstCookie);
    expect(reviewed.state.progress.skills[firstSkill.id]).toMatchObject({
      reviewCount: 1,
      intervalDays: 11,
    });
    // One lesson and one review cycle, each paid once as a task.
    expect(reviewed.state.progress.totalXp).toBe(
      earnedXp(lessonXp(firstSkill), 0, true) + earnedXp(REVIEW_XP, 0, true),
    );
    expect((await load(secondCookie)).state).toEqual(second);
    expect((await load(secondCookie)).revision).toBe(1);
  });

  it('cannot select another account through headers, query parameters, or a body user ID', async () => {
    const { backend } = await freshBackend();
    const firstCookie = await register(backend, 'scope-first@example.test');
    const secondCookie = await register(backend, 'scope-second@example.test');
    const secondSession = await backend.auth.api.getSession({
      headers: new Headers({ cookie: secondCookie }),
    });
    const secondId = secondSession!.user.id;
    const first = { ...createState(), dailyGoal: 25 };
    const second = { ...createState(), dailyGoal: 100 };
    expect(
      (await stateRequest(backend, firstCookie, { state: first, revision: 0 }))
        .status,
    ).toBe(200);
    expect(
      (
        await stateRequest(backend, secondCookie, {
          state: second,
          revision: 0,
        })
      ).status,
    ).toBe(200);

    const query = await handleStateRequest(
      new Request(
        `${baseURL}/api/state?userId=${encodeURIComponent(secondId)}`,
        {
          headers: { cookie: firstCookie },
        },
      ),
      backend,
    );
    expect(query.status).toBe(200);
    expect((await query.json()).state).toEqual(first);
    const asserted = await handleStateRequest(
      new Request(`${baseURL}/api/state`, {
        headers: { cookie: firstCookie, 'X-Lessdumb-User': secondId },
      }),
      backend,
    );
    expect(asserted.status).toBe(401);
    const body = await stateRequest(backend, firstCookie, {
      state: { ...first, dailyGoal: 75 },
      revision: 1,
      userId: secondId,
    });
    expect(body.status).toBe(400);
    expect(
      (await (await stateRequest(backend, firstCookie)).json()).state,
    ).toEqual(first);
    expect(
      (await (await stateRequest(backend, secondCookie)).json()).state,
    ).toEqual(second);
  });

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
    state.progress = masterSkill(state.progress, skill.id, 1_790_900_000_001);
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

  it('migrates accounts saved before knowledge-point lessons and before quizzes', async () => {
    for (const version of [1, 2, 3, 4]) {
      const { backend } = await freshBackend();
      const cookie = await register(backend);
      const legacy = progressFixture(version);
      expect(
        (await stateRequest(backend, cookie, { state: legacy, revision: 0 }))
          .status,
      ).toBe(200);
      expect(await (await stateRequest(backend, cookie)).json()).toEqual({
        state: progressFixture(5),
        revision: 1,
      });
    }
  });

  it('rejects invalid shapes, extra secrets, and cross-origin state writes', async () => {
    const { backend } = await freshBackend();
    const cookie = await register(backend);
    const state = progressFixture();
    const invalid = await stateRequest(backend, cookie, {
      state: { ...state, version: 6 },
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

  it('saves every current course after mistakes and repair with compacted history and all cards', async () => {
    const { backend } = await freshBackend();
    const cookie = await register(backend, 'complete-catalog@example.test');
    let state = createState();
    const remaining = new Map(skills.map((skill) => [skill.id, skill]));
    // Every question the lesson serves is missed once, then answered.
    const missed = new Set<string>();
    while (remaining.size) {
      const skill = [...remaining.values()].find((candidate) =>
        isUnlocked(state.progress, candidate.id),
      );
      if (!skill)
        throw new Error('The current catalog has unreachable prerequisites.');
      for (
        let index = 0;
        !isMastered(state.progress, skill.id) && index < 64;
        index++
      ) {
        const question = selectQuestion(state.progress, skill, 'learn');
        missed.add(question.id);
        for (const correct of [false, true]) {
          state = recordLearningAnswer(state, {
            skillId: skill.id,
            questionId: question.id,
            correct,
            mode: 'learn',
            attemptId: crypto.randomUUID(),
            writerId: 'complete-catalog',
          });
        }
      }
      expect(isMastered(state.progress, skill.id)).toBe(true);
      remaining.delete(skill.id);
    }
    const masteryCards = skills.reduce(
      (sum, skill) => sum + skill.flashcards.length,
      0,
    );
    expect(state.cards).toHaveLength(missed.size + masteryCards);
    expect(state.progress.attempts).toHaveLength(MAX_RECENT_ATTEMPTS);
    expect(
      Object.values(state.progress.skills).reduce(
        (sum, skill) => sum + skill.attempts,
        0,
      ),
    ).toBe(missed.size * 2);
    const body = { state, revision: 0 };
    const bytes = Buffer.byteLength(JSON.stringify(body));
    // The old 2 MiB bound rejected this valid, finite learning history.
    expect(bytes).toBeGreaterThan(2 * 1024 * 1024);
    expect(bytes).toBeLessThan(MAX_STATE_BODY_BYTES);
    const saved = await stateRequest(backend, cookie, body);
    expect(saved.status).toBe(200);
    expect(await (await stateRequest(backend, cookie)).json()).toEqual({
      state,
      revision: 1,
    });
    expect(getStats(state.progress).mastered).toBe(skills.length);
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
        body: 'x'.repeat(MAX_STATE_BODY_BYTES + 1),
      }),
      backend,
    );
    expect(response.status).toBe(413);
  });
});
