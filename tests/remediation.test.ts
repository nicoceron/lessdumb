import { describe, expect, it } from 'vitest';
import { defaultCatalog, skillById } from '../src/lib/curriculum';
import {
  applyAttempt,
  applyImplicitCredit,
  DAY_MS,
  emptyProgress,
  getSkillState,
  isMastered,
  LESSON_RETRY_DELAY_MS,
  lessonCoolingDown,
  lessonRefreshes,
  nextTask,
  selectQuestion,
  STATE_VERSION,
  type Attempt,
  type Progress,
  type SkillProgress,
} from '../src/lib/learning';
import {
  FIRST_FAILURE_THRESHOLD,
  MAX_COUNTED_MISTAKES,
  planRefresh,
  prerequisiteWeakness,
  REFRESH_HOLD_MS,
  refreshPending,
  REPEAT_FAILURE_THRESHOLD,
} from '../src/lib/remediation';
import { taskQueue } from '../src/lib/dashboard';
import {
  createState,
  mergeStates,
  type LearnerState,
  type LegacyLearnerState,
} from '../src/lib/state';
import { parseStateUpdate } from '../src/lib/server/state-validation';
import { decodeState, encodeState } from '../src/lib/server/state-codec';
import { masterWithPrerequisites } from './helpers/mastery';

// `unpacking` uses `tuples` and `for-loops`; one layer down, `tuples` uses
// `indexing` and `for-loops` uses `lists`.
const NOW = Date.parse('2026-10-01T16:00:00Z');
const HOUR = 3_600_000;
const LEARNED = NOW - 60 * DAY_MS;
const COURSE = 'python-foundations';
const LESSON = 'unpacking';
const TUPLES = 'tuples';
const LOOPS = 'for-loops';
const INDEXING = 'indexing';
const LISTS = 'lists';

/** Reviewed three times, last ten days ago, next due in a month. */
function solid(state: SkillProgress): SkillProgress {
  const { implicitCredit: _credit, ...rest } = state;
  return {
    ...rest,
    memory: {
      algorithm: 'fsrs-6',
      dueAt: NOW + 30 * DAY_MS,
      lastReviewAt: NOW - 10 * DAY_MS,
      stability: 40,
      difficulty: 5,
      elapsedDays: 10,
      scheduledDays: 40,
      reps: 4,
      lapses: 0,
    },
    dueAt: NOW + 30 * DAY_MS,
    intervalDays: 40,
    reviewCount: 3,
  };
}

/** Low FSRS stability: the review barely strengthened it. */
const unstable = (state: SkillProgress): SkillProgress => ({
  ...state,
  memory: { ...state.memory!, stability: 4 },
});

/** Every ancestor of the lesson mastered two months ago and solid now. */
function baseline(): Progress {
  let progress = emptyProgress(LEARNED, 'UTC');
  for (const id of skillById[LESSON].prerequisites)
    progress = masterWithPrerequisites(progress, id, LEARNED);
  return {
    ...progress,
    skills: Object.fromEntries(
      Object.entries(progress.skills).map(([id, state]) => [id, solid(state)]),
    ),
  };
}

function withSkill(
  progress: Progress,
  id: string,
  change: (state: SkillProgress) => SkillProgress,
): Progress {
  return {
    ...progress,
    skills: { ...progress.skills, [id]: change(progress.skills[id]) },
  };
}

/** A wrong answer on a skill, as a quiz records it (no evidence is lost). */
function missed(progress: Progress, skillId: string, at: number): Progress {
  const attempt: Attempt = {
    id: `miss-${skillId}-${at}`,
    skillId,
    questionId: skillById[skillId].knowledgePoints![0].questions[0].id,
    correct: false,
    mode: 'quiz',
    usedHint: false,
    at: new Date(at).toISOString(),
    xp: 0,
  };
  return { ...progress, attempts: [...progress.attempts, attempt] };
}

/** Three wrong answers on the lesson's current point: the attempt fails. */
function failLesson(progress: Progress, at: number): Progress {
  const skill = skillById[LESSON];
  let result = progress;
  for (let index = 0; index < 3; index++)
    result = applyAttempt(
      result,
      {
        skillId: LESSON,
        questionId: selectQuestion(result, skill, 'learn').id,
        correct: false,
        mode: 'learn',
      },
      at + index,
    );
  expect(result.attempts.at(-1)!.outcome).toBe('lesson-failed');
  return result;
}

const lastFailure = (progress: Progress) =>
  progress.attempts.findLast((attempt) => attempt.outcome === 'lesson-failed')!;

/** Complete one review cycle of a due skill. */
function review(progress: Progress, skillId: string, at: number): Progress {
  const cycle = getSkillState(progress, skillId).reviewCount;
  let result = progress;
  for (
    let index = 0;
    getSkillState(result, skillId).reviewCount === cycle && index < 8;
    index++
  )
    result = applyAttempt(
      result,
      {
        skillId,
        questionId: selectQuestion(result, skillById[skillId], 'review').id,
        correct: true,
        mode: 'review',
      },
      at,
    );
  expect(getSkillState(result, skillId).reviewCount).toBe(cycle + 1);
  return result;
}

const message = (prerequisite: string) =>
  `Before trying ${skillById[LESSON].title} again, let's refresh ${skillById[prerequisite].title}.`;

describe('weakness signals', () => {
  const start = baseline();
  const tuples = skillById[TUPLES];
  const scored = (change: (state: SkillProgress) => SkillProgress) =>
    prerequisiteWeakness(withSkill(start, TUPLES, change), tuples, NOW)!;

  it('scores each signal with its weight, and nothing for a solid skill', () => {
    expect(scored((state) => state)).toMatchObject({ score: 0, signals: [] });
    expect(
      scored((state) => ({
        ...state,
        placement: { at: LEARNED, diagnosticId: 'placement-1' },
      })),
    ).toMatchObject({ score: 3, signals: ['placement'] });
    // A placement its first review confirmed is ordinary evidence.
    expect(
      scored((state) => ({
        ...state,
        placement: {
          at: LEARNED,
          diagnosticId: 'placement-1',
          confirmedAt: LEARNED + DAY_MS,
        },
      })).score,
    ).toBe(0);
    expect(
      scored((state) => ({
        ...state,
        attempts: 0,
        correct: 0,
        consecutiveCorrect: 0,
      })),
    ).toMatchObject({ score: 3, signals: ['unobserved'] });
    expect(scored((state) => ({ ...state, dueAt: NOW }))).toMatchObject({
      score: 2,
      signals: ['due'],
    });
    expect(scored(unstable)).toMatchObject({ score: 1, signals: ['unstable'] });
    expect(
      scored((state) => ({
        ...state,
        memory: { ...state.memory!, stability: 3, lapses: 1 },
      })),
    ).toMatchObject({ score: 2, signals: ['unstable', 'lapsed'] });
    // A lapse long since rebuilt is not a signal.
    expect(
      scored((state) => ({
        ...state,
        memory: { ...state.memory!, lapses: 2 },
      })).score,
    ).toBe(0);
    // Its review was due yesterday; only implicit credit postponed it (CEN-88).
    const credited = (dueBefore: number) => (state: SkillProgress) => ({
      ...state,
      dueAt: NOW + 5 * DAY_MS,
      implicitCredit: {
        at: NOW - DAY_MS,
        day: '2026-09-30',
        from: LESSON,
        weight: 0.25,
        basis: state.memory!.lastReviewAt,
        dueBefore,
        dueAt: NOW + 5 * DAY_MS,
      },
    });
    expect(scored(credited(NOW - DAY_MS))).toMatchObject({
      score: 1,
      signals: ['implicit'],
    });
    // Credit that only postponed a review not yet due is not a signal.
    expect(scored(credited(NOW + DAY_MS)).score).toBe(0);
  });

  it('counts recent mistakes in any mode, up to three, within two weeks', () => {
    let progress = start;
    for (let index = 1; index <= 5; index++)
      progress = missed(progress, TUPLES, NOW - index * HOUR);
    expect(prerequisiteWeakness(progress, tuples, NOW)).toMatchObject({
      score: MAX_COUNTED_MISTAKES,
      signals: ['mistakes'],
    });
    expect(
      prerequisiteWeakness(
        missed(start, TUPLES, NOW - 15 * DAY_MS),
        tuples,
        NOW,
      )!.score,
    ).toBe(0);
    // Only mastered skills can be refreshed.
    expect(prerequisiteWeakness(start, skillById[LESSON], NOW)).toBeNull();
  });
});

describe('remediation after a failed lesson', () => {
  it('refreshes nothing when every prerequisite is solid, even after two failures', () => {
    const start = baseline();
    let progress = failLesson(start, NOW);
    progress = failLesson(progress, NOW + HOUR);
    expect(getSkillState(progress, LESSON).lessonFailures).toBe(2);
    const failures = progress.attempts.filter(
      (attempt) => attempt.outcome === 'lesson-failed',
    );
    expect(failures).toHaveLength(2);
    expect(failures.every((attempt) => !attempt.refreshed)).toBe(true);
    for (const id of Object.keys(start.skills)) {
      expect(getSkillState(progress, id).dueAt).toBe(
        getSkillState(start, id).dueAt,
      );
      expect(getSkillState(progress, id).refresh).toBeUndefined();
    }
    expect(
      planRefresh(start, skillById[LESSON], NOW, 2, defaultCatalog),
    ).toEqual([]);
    // The usual cooldown applies: other work first, for up to four hours.
    const failedAt = getSkillState(progress, LESSON).lessonFailedAt!;
    expect(lessonRefreshes(progress, LESSON)).toEqual([]);
    const next = nextTask(progress, failedAt + 1, COURSE)!;
    expect(next.mode).toBe('learn');
    expect(next.skillId).not.toBe(LESSON);
    expect(
      lessonCoolingDown(progress, LESSON, failedAt + LESSON_RETRY_DELAY_MS),
    ).toBe(false);
  });

  it('refreshes a mildly weak prerequisite on the second failure in a row and holds the lesson until it is reviewed', () => {
    const start = withSkill(baseline(), TUPLES, unstable);
    expect(FIRST_FAILURE_THRESHOLD).toBe(2);
    expect(REPEAT_FAILURE_THRESHOLD).toBe(1);
    // A first failure refreshes only clearly weak prerequisites.
    const first = failLesson(start, NOW);
    expect(lastFailure(first).refreshed).toBeUndefined();
    expect(getSkillState(first, LESSON).lessonFailures).toBe(1);
    expect(getSkillState(first, TUPLES).dueAt).toBe(NOW + 30 * DAY_MS);

    const second = failLesson(first, NOW + HOUR);
    const failedAt = getSkillState(second, LESSON).lessonFailedAt!;
    expect(getSkillState(second, LESSON).lessonFailures).toBe(2);
    expect(lastFailure(second).refreshed).toEqual([TUPLES]);
    expect(getSkillState(second, TUPLES)).toMatchObject({
      dueAt: failedAt,
      refresh: {
        at: failedAt,
        lesson: LESSON,
        basis: NOW - 10 * DAY_MS,
      },
    });
    // Memory is untouched; for-loops is solid and stays on schedule.
    expect(getSkillState(second, TUPLES).memory).toEqual(
      getSkillState(start, TUPLES).memory,
    );
    expect(getSkillState(second, LOOPS).dueAt).toBe(NOW + 30 * DAY_MS);

    // The refresh is the next task, and says why.
    expect(nextTask(second, failedAt + 1, COURSE)).toMatchObject({
      skillId: TUPLES,
      mode: 'review',
      reason: message(TUPLES),
    });
    // The lesson waits for it past the usual four hours, for up to a day.
    expect(lessonRefreshes(second, LESSON)).toEqual([TUPLES]);
    expect(
      lessonCoolingDown(second, LESSON, failedAt + LESSON_RETRY_DELAY_MS + 1),
    ).toBe(true);
    expect(
      lessonCoolingDown(second, LESSON, failedAt + REFRESH_HOLD_MS - 1),
    ).toBe(true);
    expect(lessonCoolingDown(second, LESSON, failedAt + REFRESH_HOLD_MS)).toBe(
      false,
    );

    // Once the review is done, the lesson returns.
    const reviewed = review(second, TUPLES, failedAt + 60_000);
    expect(getSkillState(reviewed, TUPLES).refresh).toBeUndefined();
    expect(getSkillState(reviewed, TUPLES).dueAt).toBeGreaterThan(
      failedAt + 60_000,
    );
    expect(lessonCoolingDown(reviewed, LESSON, failedAt + 60_001)).toBe(false);
    expect(nextTask(reviewed, failedAt + 60_001, COURSE)).toMatchObject({
      skillId: LESSON,
      mode: 'learn',
    });
  });

  it('refreshes the weakest one or two direct prerequisites, weakest first, ahead of other reviews', () => {
    let start = withSkill(baseline(), TUPLES, unstable);
    // tuples: unstable and missed twice (3); for-loops: overdue (2).
    start = missed(start, TUPLES, NOW - 2 * DAY_MS);
    start = missed(start, TUPLES, NOW - DAY_MS);
    start = withSkill(start, LOOPS, (state) => ({
      ...state,
      dueAt: NOW - DAY_MS,
    }));
    // An older, unrelated review is due too.
    start = withSkill(start, 'numbers', (state) => ({
      ...state,
      dueAt: NOW - 20 * DAY_MS,
    }));
    expect(
      planRefresh(start, skillById[LESSON], NOW, 1, defaultCatalog).map(
        ({ id, score, depth }) => [id, score, depth],
      ),
    ).toEqual([
      [TUPLES, 3, 1],
      [LOOPS, 2, 1],
    ]);
    const failed = failLesson(start, NOW);
    const at = getSkillState(failed, LESSON).lessonFailedAt!;
    expect(lastFailure(failed).refreshed).toEqual([TUPLES, LOOPS]);
    expect(nextTask(failed, at + 1, COURSE)).toMatchObject({
      skillId: TUPLES,
      reason: message(TUPLES),
    });
    // The Learn list shows both refreshes first, with their lesson, and
    // holds the lesson back meanwhile.
    const tasks = taskQueue(failed, COURSE, at + 1);
    expect(
      tasks
        .slice(0, 2)
        .map((task) => [task.skill.id, task.mode, task.refreshFor?.id]),
    ).toEqual([
      [TUPLES, 'review', LESSON],
      [LOOPS, 'review', LESSON],
    ]);
    expect(tasks.map((task) => task.skill.id)).not.toContain(LESSON);
    const afterOne = review(failed, TUPLES, at + 60_000);
    expect(nextTask(afterOne, at + 60_001, COURSE)).toMatchObject({
      skillId: LOOPS,
      reason: message(LOOPS),
    });
    expect(lessonCoolingDown(afterOne, LESSON, at + 60_001)).toBe(true);
    const afterBoth = review(afterOne, LOOPS, at + 120_000);
    expect(lessonRefreshes(afterBoth, LESSON)).toEqual([]);
    // Two reviews in a row: the lesson takes its turn.
    expect(nextTask(afterBoth, at + 120_001, COURSE)).toMatchObject({
      skillId: LESSON,
      mode: 'learn',
    });
  });

  it('looks one layer down only when every direct prerequisite looks solid', () => {
    // indexing (under tuples) is overdue and was missed yesterday: 2 + 1.
    let start = withSkill(baseline(), INDEXING, (state) => ({
      ...state,
      dueAt: NOW - DAY_MS,
    }));
    start = missed(start, INDEXING, NOW - DAY_MS);
    expect(
      planRefresh(start, skillById[LESSON], NOW, 1, defaultCatalog),
    ).toMatchObject([{ id: INDEXING, depth: 2, score: 3 }]);
    const deep = failLesson(start, NOW);
    expect(lastFailure(deep).refreshed).toEqual([INDEXING]);
    expect(nextTask(deep, NOW + 10, COURSE)).toMatchObject({
      skillId: INDEXING,
      mode: 'review',
      reason: message(INDEXING),
    });

    // A clearly weak direct prerequisite is refreshed instead, even though
    // the deeper one is weaker.
    const direct = withSkill(start, LOOPS, (state) => ({
      ...state,
      dueAt: NOW - DAY_MS,
    }));
    const failed = failLesson(direct, NOW);
    expect(lastFailure(failed).refreshed).toEqual([LOOPS]);
    expect(getSkillState(failed, INDEXING).refresh).toBeUndefined();
    expect(nextTask(failed, NOW + 10, COURSE)?.skillId).toBe(LOOPS);
  });

  it('does not refresh a prerequisite again once it was checked, so the next failure looks deeper', () => {
    let start = withSkill(baseline(), TUPLES, unstable);
    start = missed(start, TUPLES, NOW - 2 * DAY_MS);
    start = missed(start, TUPLES, NOW - DAY_MS);
    start = withSkill(start, LISTS, unstable);
    let progress = failLesson(start, NOW);
    const firstFailure = getSkillState(progress, LESSON).lessonFailedAt!;
    expect(lastFailure(progress).refreshed).toEqual([TUPLES]);
    progress = review(progress, TUPLES, NOW + HOUR);
    // Its recent mistakes still count, but its recall was checked after the failure.
    const tuples = skillById[TUPLES];
    expect(
      prerequisiteWeakness(progress, tuples, NOW + 2 * HOUR)!.score,
    ).toBeGreaterThanOrEqual(2);
    expect(
      prerequisiteWeakness(progress, tuples, NOW + 2 * HOUR, firstFailure)!
        .score,
    ).toBe(0);
    progress = failLesson(progress, NOW + 2 * HOUR);
    expect(getSkillState(progress, LESSON).lessonFailures).toBe(2);
    expect(lastFailure(progress).refreshed).toEqual([LISTS]);
    expect(getSkillState(progress, TUPLES).refresh).toBeUndefined();
  });

  it('settles a refresh when its review fails, and the lapsed prerequisite is relearned first', () => {
    const second = failLesson(
      failLesson(withSkill(baseline(), TUPLES, unstable), NOW),
      NOW + HOUR,
    );
    const at = getSkillState(second, LESSON).lessonFailedAt! + 1000;
    const lapsed = applyAttempt(
      second,
      {
        skillId: TUPLES,
        questionId: selectQuestion(second, skillById[TUPLES], 'review').id,
        correct: false,
        mode: 'review',
      },
      at,
    );
    expect(getSkillState(lapsed, TUPLES).refresh).toBeUndefined();
    expect(isMastered(lapsed, TUPLES)).toBe(false);
    expect(lessonRefreshes(lapsed, LESSON)).toEqual([]);
    expect(nextTask(lapsed, at + 1, COURSE)).toMatchObject({
      skillId: TUPLES,
      mode: 'learn',
    });
  });

  it('gives a pending refresh no implicit credit and resets the failure count on a pass', () => {
    const start = withSkill(baseline(), LOOPS, (state) => ({
      ...state,
      dueAt: NOW - DAY_MS,
    }));
    const failed = failLesson(start, NOW);
    expect(refreshPending(getSkillState(failed, LOOPS))).toBe(true);
    // `ranges` uses for-loops: its success would normally credit it.
    const later = NOW + DAY_MS;
    expect(
      applyImplicitCredit(start, skillById.ranges, later).credited,
    ).toEqual([LOOPS]);
    expect(
      applyImplicitCredit(failed, skillById.ranges, later).credited,
    ).toEqual([]);
    // Passing the lesson ends the run of failures.
    let passed = review(failed, LOOPS, NOW + HOUR);
    for (let index = 0; !isMastered(passed, LESSON) && index < 64; index++)
      passed = applyAttempt(
        passed,
        {
          skillId: LESSON,
          questionId: selectQuestion(passed, skillById[LESSON], 'learn').id,
          correct: true,
          mode: 'learn',
        },
        NOW + 2 * HOUR,
      );
    expect(isMastered(passed, LESSON)).toBe(true);
    expect(getSkillState(passed, LESSON).lessonFailures).toBeUndefined();
  });
});

describe('refresh persistence', () => {
  const state = (progress: Progress, updatedAt: number): LearnerState => ({
    ...createState(),
    progress,
    createdAt: LEARNED,
    updatedAt,
  });
  let weak = withSkill(baseline(), TUPLES, unstable);
  weak = missed(weak, TUPLES, NOW - DAY_MS);
  const failed = failLesson(weak, NOW);
  const failedAt = getSkillState(failed, LESSON).lessonFailedAt!;

  it('validates refreshes and failure counts and rejects malformed ones', () => {
    expect(lastFailure(failed).refreshed).toEqual([TUPLES]);
    const saved = state(failed, NOW + 10);
    expect(parseStateUpdate({ state: saved, revision: 0 }).state).toEqual(
      saved,
    );
    const reject = (mutate: (copy: LearnerState) => void) => {
      const copy = structuredClone(saved);
      mutate(copy);
      expect(() => parseStateUpdate({ state: copy, revision: 0 })).toThrow();
    };
    reject((copy) => {
      (
        copy.progress.skills[TUPLES].refresh as unknown as { extra: number }
      ).extra = 1;
    });
    reject((copy) => {
      copy.progress.skills[TUPLES].refresh!.lesson = '';
    });
    reject((copy) => {
      copy.progress.skills[TUPLES].refresh!.basis = -1;
    });
    reject((copy) => {
      copy.progress.skills[LESSON].lessonFailures = 0;
    });
    reject((copy) => {
      lastFailure(copy.progress).refreshed = [TUPLES, LOOPS, INDEXING];
    });
  });

  it('keeps a refresh through a merge with a device that has not seen it, until a real review', () => {
    const local = state(failed, NOW + 10);
    const stale = state(weak, NOW + 5);
    for (const merged of [
      mergeStates(local, stale),
      mergeStates(stale, local),
    ]) {
      expect(getSkillState(merged.progress, TUPLES)).toMatchObject({
        dueAt: failedAt,
        refresh: { at: failedAt, lesson: LESSON },
      });
      expect(getSkillState(merged.progress, LESSON).lessonFailures).toBe(1);
      expect(lessonRefreshes(merged.progress, LESSON)).toEqual([TUPLES]);
      expect(nextTask(merged.progress, failedAt + 1, COURSE)?.skillId).toBe(
        TUPLES,
      );
    }
    // A review on another device completes it.
    const reviewed = state(review(failed, TUPLES, failedAt + HOUR), NOW + 20);
    const merged = mergeStates(local, reviewed);
    expect(refreshPending(getSkillState(merged.progress, TUPLES))).toBe(false);
    expect(getSkillState(merged.progress, TUPLES).refresh).toBeUndefined();
    expect(getSkillState(merged.progress, TUPLES).dueAt).toBe(
      getSkillState(reviewed.progress, TUPLES).dueAt,
    );
  });

  it('loads states saved before refreshes, through the storage codec', async () => {
    // A version 5 account with placement and implicit credit fields.
    const placed = withSkill(weak, LOOPS, (skill) => ({
      ...skill,
      placement: {
        at: LEARNED,
        diagnosticId: 'placement-1',
        confirmedAt: LEARNED + DAY_MS,
      },
    }));
    const v5 = {
      ...state(placed, NOW),
      version: 5,
      progress: { ...placed, version: 5 },
    } as LegacyLearnerState;
    const stored = await decodeState(
      await encodeState(v5 as never),
      'gzip-base64',
    );
    const loaded = parseStateUpdate({ state: stored, revision: 0 }).state;
    expect(loaded.version).toBe(STATE_VERSION);
    expect(loaded.progress.version).toBe(STATE_VERSION);
    expect(loaded.progress.skills).toEqual(placed.skills);
    // The engine runs on it: its first failure refreshes as usual.
    const refailed = failLesson(loaded.progress, NOW);
    expect(lastFailure(refailed).refreshed).toEqual([TUPLES]);
    expect(getSkillState(refailed, LESSON).lessonFailures).toBe(1);
  });
});
