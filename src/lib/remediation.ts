import type { GraphCatalog, SkillOutline } from './curriculum';
import type { Progress, SkillProgress } from './learning';
import { hasLessonEvidence } from './lesson-plan';
import { legacyMemory, recallProbability } from './retention';

// Remediation after a failed lesson (CEN-130). A learner stuck on a skill is
// often missing something underneath it, so Math Academy reviews the weak
// prerequisites first. When a knowledge-point lesson attempt fails, the engine
// scores the skill's direct prerequisites for weakness and goes one layer
// further down only when every direct one looks solid. The weakest one or two
// become ordinary due reviews ("refreshes"), and the failed lesson waits until
// they are done.
//
// The signals, weights, and thresholds are authored heuristics, not values
// fitted to learners. Browser code may import this module: it holds no
// catalog data.

const DAY = 86_400_000;

/** Weight of each weakness signal. */
export const WEAKNESS_WEIGHTS = {
  /** Placed out by the diagnostic, first review not yet passed (CEN-46). */
  placement: 3,
  /** Mastered, but this learner has never answered it at all. */
  unobserved: 3,
  /** Its review is due or overdue. */
  due: 2,
  /** Each wrong answer on it in the last MISTAKE_WINDOW_MS, up to three. */
  mistakes: 1,
  /** Forgotten before and not yet rebuilt (FSRS lapses, low stability). */
  lapsed: 1,
  /** FSRS stability below UNSTABLE_DAYS: learned recently or barely reviewed. */
  unstable: 1,
  /**
   * Its review would be due by now, but implicit credit postponed it: no real
   * review backs its current schedule (CEN-88).
   */
  implicit: 1,
} as const;
export type WeaknessSignal = keyof typeof WEAKNESS_WEIGHTS;

export const MAX_COUNTED_MISTAKES = 3;
export const MISTAKE_WINDOW_MS = 14 * DAY;
export const UNSTABLE_DAYS = 7;
/** A first failure refreshes only clearly weak prerequisites. */
export const FIRST_FAILURE_THRESHOLD = 2;
/** A second failure in a row refreshes any prerequisite with a weakness signal. */
export const REPEAT_FAILURE_THRESHOLD = 1;
/** At most this many prerequisites are refreshed per failure. */
export const MAX_REFRESHES = 2;
/** A failed lesson waits at most this long for its pending refreshes. */
export const REFRESH_HOLD_MS = DAY;

/**
 * A review brought forward because a lesson that uses this skill failed. It
 * is due from `at`; the next real review (passed or failed) completes it,
 * since that review moves the memory's last review past `at`. Kept this small
 * on purpose: everything else is derived from the attempts and FSRS memory.
 */
export interface Refresh {
  /** The failed lesson's skill. */
  lesson: string;
  /** When the lesson failed. */
  at: number;
}

export interface Weakness {
  id: string;
  score: number;
  signals: WeaknessSignal[];
  /** 1 for a direct prerequisite, 2 for one layer further down. */
  depth: 1 | 2;
  recall: number;
  stability: number;
}

/** Wrong answers on a skill, in any mode, after `from` and up to `to`. */
export function recentMistakes(
  progress: Progress,
  skillId: string,
  from: number,
  to: number,
): number {
  let count = 0;
  for (const attempt of progress.attempts) {
    if (attempt.skillId !== skillId || attempt.correct) continue;
    const at = Date.parse(attempt.at);
    if (at > from && at <= to) count++;
  }
  return count;
}

function answeredCorrectlySince(
  progress: Progress,
  skillId: string,
  from: number,
  to: number,
): boolean {
  return progress.attempts.some((attempt) => {
    if (attempt.skillId !== skillId || !attempt.correct) return false;
    const at = Date.parse(attempt.at);
    return at > from && at <= to;
  });
}

/**
 * How weak a mastered skill looks at `time`, as a sum of signal weights; null
 * when it is not mastered. A skill whose recall was checked after `since` (the
 * previous failure of the same lesson) with no mistake since counts as solid,
 * so repeated failures move on instead of refreshing the same skill again.
 */
export function prerequisiteWeakness(
  progress: Progress,
  item: SkillOutline,
  time: number,
  since?: number,
): Omit<Weakness, 'depth'> | null {
  const state = progress.skills[item.id];
  if (!state || !hasLessonEvidence(item, state.questionIds)) return null;
  const memory = legacyMemory(state, time);
  const result = {
    id: item.id,
    score: 0,
    signals: [] as WeaknessSignal[],
    recall: recallProbability(memory, time),
    stability: memory.stability,
  };
  if (
    since !== undefined &&
    recentMistakes(progress, item.id, since, time) === 0 &&
    (memory.lastReviewAt > since ||
      answeredCorrectlySince(progress, item.id, since, time))
  )
    return result;
  const add = (signal: WeaknessSignal, times = 1) => {
    result.signals.push(signal);
    result.score += WEAKNESS_WEIGHTS[signal] * times;
  };
  if (
    state.placement &&
    state.placement.confirmedAt === undefined &&
    state.placement.demotedAt === undefined
  )
    add('placement');
  else if (state.attempts === 0) add('unobserved');
  if (state.dueAt !== null && state.dueAt <= time) add('due');
  const mistakes = Math.min(
    MAX_COUNTED_MISTAKES,
    recentMistakes(progress, item.id, time - MISTAKE_WINDOW_MS, time),
  );
  if (mistakes) add('mistakes', mistakes);
  if (memory.stability < UNSTABLE_DAYS) {
    add('unstable');
    if (memory.lapses > 0) add('lapsed');
  }
  // Its review would be due by now, and only implicit credit postponed it.
  const credit = state.implicitCredit;
  if (
    credit &&
    credit.basis === memory.lastReviewAt &&
    state.dueAt === credit.dueAt &&
    credit.dueBefore <= time
  )
    add('implicit');
  return result;
}

/** Weakest first: higher score, then lower estimated recall and stability. */
function weakestFirst(a: Weakness, b: Weakness) {
  return b.score - a.score || a.recall - b.recall || a.stability - b.stability;
}

/**
 * The prerequisites to refresh after `item`'s lesson failed for the
 * `failures`-th time in a row: direct prerequisites at or above the
 * threshold, weakest first; only when none is, the same from the next layer
 * down. At most MAX_REFRESHES; none when everything looks solid.
 */
export function planRefresh(
  progress: Progress,
  item: SkillOutline,
  time: number,
  failures: number,
  catalog: GraphCatalog,
  since?: number,
): Weakness[] {
  const threshold =
    failures >= 2 ? REPEAT_FAILURE_THRESHOLD : FIRST_FAILURE_THRESHOLD;
  const byId = new Map(catalog.skills.map((skill) => [skill.id, skill]));
  const weak = (ids: string[], depth: 1 | 2) =>
    ids
      .map((id) => byId.get(id))
      .filter((skill): skill is SkillOutline => !!skill)
      .map((skill) => prerequisiteWeakness(progress, skill, time, since))
      .filter(
        (found): found is Omit<Weakness, 'depth'> =>
          !!found && found.score >= threshold,
      )
      .map((found) => ({ ...found, depth }))
      .sort(weakestFirst);
  const direct = weak(item.prerequisites, 1);
  if (direct.length) return direct.slice(0, MAX_REFRESHES);
  const deeper = [
    ...new Set(
      item.prerequisites.flatMap((id) => byId.get(id)?.prerequisites ?? []),
    ),
  ].filter((id) => !item.prerequisites.includes(id));
  return weak(deeper, 2).slice(0, MAX_REFRESHES);
}

/**
 * Consecutive failed attempts at a skill's lesson, from the attempt log:
 * failures since its last pass. A failure older than the retained log counts
 * as none, which only makes the next refresh stricter.
 */
export function lessonFailureStreak(
  progress: Progress,
  skillId: string,
): number {
  let failures = 0;
  for (let index = progress.attempts.length - 1; index >= 0; index--) {
    const attempt = progress.attempts[index];
    if (attempt.skillId !== skillId) continue;
    if (attempt.outcome === 'lesson-passed') break;
    if (attempt.outcome === 'lesson-failed') failures++;
  }
  return failures;
}

/**
 * Bring a mastered skill's review forward to `at` for a failed lesson. Its
 * memory is kept, so the review is scheduled from the real elapsed time;
 * implicit credit no longer applies.
 */
export function scheduleRefresh(
  state: SkillProgress,
  at: number,
  lesson: string,
): SkillProgress {
  const memory = legacyMemory(state, at);
  const { implicitCredit: _credit, ...rest } = state;
  return {
    ...rest,
    memory,
    dueAt: Math.min(state.dueAt ?? at, at),
    refresh: { lesson, at },
  };
}

/** A refresh whose review has not happened yet. */
export function refreshPending(state?: SkillProgress): boolean {
  const refresh = state?.refresh;
  return (
    !!refresh &&
    state!.dueAt !== null &&
    !!state!.memory &&
    state!.memory.lastReviewAt < refresh.at
  );
}

/**
 * Skills still waiting on a refresh for `lesson`, scheduled at or after
 * `since`: lowest estimated recall at the failure first, as `nextTask` breaks
 * its ties.
 */
export function pendingRefreshes(
  progress: Progress,
  lesson: string,
  since = -Infinity,
): string[] {
  const recall = (state: SkillProgress) =>
    recallProbability(state.memory!, state.refresh!.at);
  return Object.entries(progress.skills)
    .filter(
      ([, state]) =>
        state.refresh?.lesson === lesson &&
        state.refresh.at >= since &&
        refreshPending(state),
    )
    .sort(
      ([a, left], [b, right]) =>
        recall(left) - recall(right) || (a < b ? -1 : 1),
    )
    .map(([id]) => id);
}
