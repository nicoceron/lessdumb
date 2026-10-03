import type {
  CurriculumCatalog,
  GraphCatalog,
  MultistepRef,
  Question,
  QuestionRef,
  SkillOutline,
} from './curriculum';
import { defaultCatalog } from './catalog-index';
import { contentOf, hasContent } from './content';
import {
  isGenerated,
  isVariant,
  questionVariant,
  variantKey,
} from './variants';
import {
  assessmentType,
  DEFAULT_ENCOMPASS_WEIGHT,
  encompassings,
} from './catalog-outline';
import {
  findPart,
  ownPart,
  ownPartIds,
  pointSkillId,
  problemsOf,
} from './multistep';
import {
  evidenceIdFor,
  findQuestion,
  hasKnowledgePoints,
  hasLessonEvidence,
  legacyQuestionIds,
  lessonSteps,
  masteryFraction,
  POINT_FAIL_INCORRECT,
  POINT_PASS_CORRECT,
  reviewCycleComplete,
  reviewPointOrder,
  reviewRequirement,
  stepFor,
  type LessonStepRef,
  type QuestionOf,
  type StepOf,
} from './lesson-plan';
import { earnedXp, lessonXp, REVIEW_XP } from './xp';
import type { Quiz } from './quiz';
import type { Diagnostic } from './placement';
import {
  acquisitionMemory,
  legacyMemory,
  reviewMemory,
  recallProbability,
  type MemoryState,
} from './retention';
import { createActivity, recordActivity, type ActivityState } from './activity';
import {
  lessonFailureStreak,
  pendingRefreshes,
  planRefresh,
  REFRESH_HOLD_MS,
  refreshPending,
  scheduleRefresh,
  type Refresh,
} from './remediation';
import { isTypedType, TYPED_RESPONSE_MAX_LENGTH } from './typed-answer';

/**
 * The learner-state schema version. 2 adds knowledge-point lesson attempts,
 * cooldowns and task XP; 3 quizzes; 4 implicit review credit; 5 placement
 * diagnostics; 6 prerequisite refreshes after failed lessons; 7 the variant
 * of a generated question on attempts, quiz questions, and placement
 * questions; 8 cards stored by reference rather than with their text.
 */
export const STATE_VERSION = 8;

export const DAY_MS = 86_400_000;
/**
 * After a failed knowledge-point lesson attempt the scheduler offers other work
 * first. The lesson returns once the learner completes another task, or after
 * this delay, whichever comes first.
 */
export const LESSON_RETRY_DELAY_MS = 4 * 3_600_000;
/**
 * Due reviews come first, but never more than this many in a row while a
 * lesson is ready: then a lesson goes next, so reviews interleave with new
 * learning instead of blocking it.
 */
export const MAX_CONSECUTIVE_REVIEWS = 2;
/** Keep recent diagnostics bounded; durable evidence and counters live on skills. */
export const MAX_RECENT_ATTEMPTS = 2000;
export interface EvidenceUpdate {
  at: number;
  sequence: number;
  correct: boolean;
}

/** Answers on one lesson step within the current lesson attempt. */
export interface LessonStepProgress {
  /** Distinct questions answered correctly, without help. */
  correct: string[];
  incorrect: number;
}

/** A knowledge-point lesson in progress. Nothing here is mastery evidence until it completes. */
export interface LessonAttempt {
  startedAt: number;
  steps: Record<string, LessonStepProgress>;
}

export interface SkillProgress {
  lessonSeen: boolean;
  attempts: number;
  correct: number;
  /**
   * Mastery evidence: passed knowledge points and question IDs. Legacy skills
   * use distinct unassisted correct answers; knowledge-point skills commit
   * their points and code exercise when a lesson attempt completes.
   */
  questionIds: string[];
  /** Legacy per-question XP ledger; kept so relearning earns no new XP. */
  rewardedQuestionIds: string[];
  consecutiveCorrect: number;
  mastery: number;
  intervalDays: number;
  dueAt: number | null;
  lastPracticedAt: number | null;
  reviewCount: number;
  reviewQuestionIds: string[];
  learnedAt: string | null;
  lastQuestionId: string | null;
  /** Optional so saved accounts from the fixed scheduler remain readable. */
  memory?: MemoryState;
  reviewHadHint?: boolean;
  evidenceUpdates?: Record<string, EvidenceUpdate>;
  totalXp?: number;
  dailyXp?: Record<string, number>;
  activity?: ActivityState;
  /** Point progress of the lesson attempt in progress, if any. */
  lessonAttempt?: LessonAttempt;
  /** When the latest lesson attempt failed; see LESSON_RETRY_DELAY_MS. */
  lessonFailedAt?: number;
  /** The skill's one-time lesson XP has been awarded. */
  lessonRewarded?: boolean;
  /** The latest implicit review credit this skill received from a dependent. */
  implicitCredit?: ImplicitCredit;
  /** Placed out of by a diagnostic: conditional until its first review. */
  placement?: Placement;
  /** A review brought forward because a lesson that uses this skill failed. */
  refresh?: Refresh;
}

/**
 * A placement counts as mastery for unlocking. Its first review confirms it;
 * a wrong answer before then returns the skill to learning from the start.
 */
export interface Placement {
  at: number;
  diagnosticId: string;
  confirmedAt?: number;
  demotedAt?: number;
}

/** A placed skill whose first review has not yet confirmed or failed it. */
export function placementPending(state?: SkillProgress): boolean {
  return (
    !!state?.placement &&
    state.placement.confirmedAt === undefined &&
    state.placement.demotedAt === undefined
  );
}

/**
 * Partial review credit from practicing a skill that uses this one. It moves
 * only the due date: FSRS memory changes through real reviews alone.
 */
export interface ImplicitCredit {
  /** When the dependent's task succeeded. */
  at: number;
  /** The learner's calendar day of `at`; one credit per skill per day. */
  day: string;
  /** The dependent skill whose success gave the credit. */
  from: string;
  weight: number;
  /** The memory's last real review when credited; a later review supersedes. */
  basis: number;
  dueBefore: number;
  dueAt: number;
}

export type AttemptOutcome =
  'lesson-passed' | 'lesson-failed' | 'review-passed';

export interface Attempt {
  id: string;
  skillId: string;
  questionId: string;
  correct: boolean;
  /** Quiz answers are retrieval checks; they never add or remove lesson evidence. */
  mode: 'learn' | 'review' | 'quiz';
  usedHint: boolean;
  at: string;
  xp: number;
  /** Identifies a due cycle across devices, independently of event UUIDs. */
  reviewDueAt?: number;
  /** Set on the answer that completed or failed a task; task XP rides on it. */
  outcome?: AttemptOutcome;
  /** The quiz a quiz answer belongs to. */
  quizId?: string;
  /** Prerequisites that this successful answer gave implicit review credit. */
  credited?: string[];
  /** What the learner typed, for a numeric or text question. */
  response?: string;
  /** The variant number asked, for a generated question (see variants.ts). */
  variant?: number;
}

export interface Progress {
  version: typeof STATE_VERSION;
  skills: Record<string, SkillProgress>;
  totalXp: number;
  dailyXp: Record<string, number>;
  lastActivityDate: string | null;
  streak: number;
  attempts: Attempt[];
  timeZone: string;
  /** Recent quizzes, oldest first; quiz XP is recorded on them. */
  quizzes?: Quiz[];
  /** Recent placement diagnostics, oldest first. */
  diagnostics?: Diagnostic[];
}

export interface AttemptInput {
  skillId: string;
  questionId: string;
  correct: boolean;
  mode: 'learn' | 'review';
  /** Only older clients sent assisted answers; they never count as evidence. */
  usedHint?: boolean;
  /** Stable event identity, generated before asynchronous grading completes. */
  attemptId?: string;
  /** Tests may name independent devices; browsers use a unique runtime writer. */
  writerId?: string;
  /** What the learner typed, for a typed question; kept on the attempt. */
  response?: string;
  /** The variant shown, for a generated question; kept on the attempt. */
  variant?: number;
}

export interface NextTask {
  skillId: string;
  mode: 'learn' | 'review';
  questionId: string;
  reason: string;
}

type Now = Date | number | string;
const calendarFormatters = new Map<string, Intl.DateTimeFormat>();
const defaultIndex = new Map(
  defaultCatalog.skills.map((item) => [item.id, item]),
);
function skillIndex(catalog: GraphCatalog) {
  return catalog === defaultCatalog
    ? defaultIndex
    : new Map(catalog.skills.map((item) => [item.id, item]));
}
const timestamp = (now: Now) => {
  const result = now instanceof Date ? now.getTime() : new Date(now).getTime();
  if (!Number.isFinite(result)) throw new Error('A valid date is required.');
  return result;
};

export function dateKey(now: Now = new Date(), timeZone = 'UTC'): string {
  let formatter = calendarFormatters.get(timeZone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    if (calendarFormatters.size >= 32) calendarFormatters.clear();
    calendarFormatters.set(timeZone, formatter);
  }
  const parts = formatter.formatToParts(new Date(timestamp(now)));
  return `${parts.find((part) => part.type === 'year')!.value}-${parts.find((part) => part.type === 'month')!.value}-${parts.find((part) => part.type === 'day')!.value}`;
}

function previousDate(key: string): string {
  return new Date(Date.parse(`${key}T12:00:00Z`) - DAY_MS)
    .toISOString()
    .slice(0, 10);
}

/** The learner's calendar day and streak after activity at `time`. */
export function activityDay(progress: Progress, time: number) {
  const today = dateKey(time, progress.timeZone || 'UTC');
  const previous = progress.lastActivityDate;
  return {
    today,
    streak:
      previous === today
        ? progress.streak
        : previous === previousDate(today)
          ? progress.streak + 1
          : 1,
  };
}

export function emptyProgress(
  _now: Now = new Date(),
  timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
): Progress {
  // Validate the zone at creation rather than failing only after the first answer.
  dateKey(_now, timeZone);
  return {
    version: STATE_VERSION,
    skills: {},
    totalXp: 0,
    dailyXp: {},
    lastActivityDate: null,
    streak: 0,
    attempts: [],
    timeZone,
  };
}

export function getSkillState(
  progress: Progress,
  skillId: string,
): SkillProgress {
  return (
    progress.skills[skillId] ?? {
      lessonSeen: false,
      attempts: 0,
      correct: 0,
      questionIds: [],
      rewardedQuestionIds: [],
      consecutiveCorrect: 0,
      mastery: 0,
      intervalDays: 0,
      dueAt: null,
      lastPracticedAt: null,
      reviewCount: 0,
      reviewQuestionIds: [],
      learnedAt: null,
      lastQuestionId: null,
    }
  );
}

export function isMastered(
  progress: Progress,
  skillId: string,
  catalog: GraphCatalog = defaultCatalog,
): boolean {
  const item = skillIndex(catalog).get(skillId);
  if (!item) return false;
  // Recompute from evidence so an inconsistent persisted numeric score cannot unlock a node.
  return hasLessonEvidence(item, getSkillState(progress, skillId).questionIds);
}

/** The lesson attempt in progress, unless a later failure discarded it. */
export function currentLessonAttempt(
  state: SkillProgress,
): LessonAttempt | undefined {
  const attempt = state.lessonAttempt;
  if (!attempt) return undefined;
  if (
    state.lessonFailedAt !== undefined &&
    attempt.startedAt <= state.lessonFailedAt
  )
    return undefined;
  return attempt;
}

function stepPassed(step: LessonStepRef, progress?: LessonStepProgress) {
  if (!progress) return false;
  return step.kind === 'point'
    ? progress.correct.length >= POINT_PASS_CORRECT
    : progress.correct.length >= 1;
}

export type LessonStepStatus = 'done' | 'passed' | 'current' | 'todo';

/**
 * Where a learner is in a skill's lesson: evidence already earned ("done"),
 * steps passed in this attempt ("passed"), the current step, and what remains.
 */
export function lessonState<S extends SkillOutline>(
  progress: Progress,
  item: S,
) {
  const state = getSkillState(progress, item.id);
  const attempt = currentLessonAttempt(state);
  let current: StepOf<S> | undefined;
  const steps = lessonSteps(item).map((step) => {
    const answers = attempt?.steps[step.id];
    let status: LessonStepStatus;
    if (state.questionIds.includes(step.id)) status = 'done';
    else if (hasKnowledgePoints(item) && stepPassed(step, answers))
      status = 'passed';
    else if (!current) {
      current = step;
      status = 'current';
    } else status = 'todo';
    return {
      step,
      status,
      correct: answers?.correct.length ?? 0,
      incorrect: answers?.incorrect ?? 0,
    };
  });
  return {
    steps,
    current,
    attempt,
    incorrect: Object.values(attempt?.steps ?? {}).reduce(
      (sum, step) => sum + step.incorrect,
      0,
    ),
  };
}

/**
 * Prerequisites whose refresh, scheduled by this skill's latest failed
 * lesson, is still pending: they come before the lesson returns.
 */
export function lessonRefreshes(progress: Progress, skillId: string): string[] {
  const failedAt = progress.skills[skillId]?.lessonFailedAt;
  return failedAt === undefined
    ? []
    : pendingRefreshes(progress, skillId, failedAt);
}

/**
 * Whether a failed lesson is still waiting: for the prerequisite refreshes it
 * scheduled (up to REFRESH_HOLD_MS), or for other work (see
 * LESSON_RETRY_DELAY_MS).
 */
export function lessonCoolingDown(
  progress: Progress,
  skillId: string,
  now: Now = new Date(),
): boolean {
  const state = progress.skills[skillId];
  const failedAt = state?.lessonFailedAt;
  if (failedAt === undefined || currentLessonAttempt(state)) return false;
  const time = timestamp(now);
  if (
    time < failedAt + REFRESH_HOLD_MS &&
    lessonRefreshes(progress, skillId).length
  )
    return true;
  if (time >= failedAt + LESSON_RETRY_DELAY_MS) return false;
  if (
    (progress.quizzes ?? []).some(
      (quiz) => quiz.completedAt !== undefined && quiz.completedAt > failedAt,
    )
  )
    return false;
  return !progress.attempts.some(
    (attempt) =>
      attempt.skillId !== skillId &&
      (attempt.outcome === 'lesson-passed' ||
        attempt.outcome === 'review-passed') &&
      Date.parse(attempt.at) > failedAt,
  );
}

export function isUnlocked(
  progress: Progress,
  skillId: string,
  catalog: GraphCatalog = defaultCatalog,
): boolean {
  return unlockChecker(progress, catalog)(skillId);
}

/** Reuse one traversal across a scheduling pass; cycles and missing nodes fail closed. */
function unlockChecker(progress: Progress, catalog: GraphCatalog) {
  const byId = skillIndex(catalog);
  const checked = new Map<string, boolean>();
  const visiting = new Set<string>();
  function prerequisitesReady(id: string): boolean {
    const item = byId.get(id);
    if (!item || visiting.has(id)) return false;
    if (checked.has(id)) return checked.get(id)!;
    visiting.add(id);
    // A parent's earlier evidence remains intact after an ancestor lapses,
    // but it cannot open a path through that ancestor until remediation.
    const ready = item.prerequisites.every(
      (prerequisite) =>
        isMastered(progress, prerequisite, catalog) &&
        prerequisitesReady(prerequisite),
    );
    visiting.delete(id);
    checked.set(id, ready);
    return ready;
  }
  return prerequisitesReady;
}

function courseSkills<S extends SkillOutline>(
  courseId: string | undefined,
  catalog: CurriculumCatalog<S>,
): S[] {
  return courseId
    ? catalog.skills.filter((item) => item.courseId === courseId)
    : catalog.skills;
}

/** A course goal includes its prerequisite ancestors, even when they live in another subject. */
export function coursePath<S extends SkillOutline = SkillOutline>(
  courseId: string | undefined,
  catalog: CurriculumCatalog<S> = defaultCatalog as CurriculumCatalog<S>,
): S[] {
  if (!courseId) return catalog.skills;
  const ids = new Set<string>();
  const byId = new Map(catalog.skills.map((item) => [item.id, item]));
  function visit(id: string) {
    if (ids.has(id)) return;
    const item = byId.get(id);
    if (!item) return;
    ids.add(id);
    item.prerequisites.forEach(visit);
  }
  courseSkills(courseId, catalog).forEach((item) => visit(item.id));
  return catalog.skills.filter((item) => ids.has(item.id));
}

/** How often each question of a skill has been answered, in any mode. */
export function seenCounts(progress: Progress, skillId: string) {
  const counts = new Map<string, number>();
  for (const attempt of progress.attempts)
    if (attempt.skillId === skillId)
      counts.set(attempt.questionId, (counts.get(attempt.questionId) ?? 0) + 1);
  return counts;
}

/**
 * A learner never meets the same concrete question of a point within their
 * last RECENT_VARIANTS attempts at that point, in any mode, while another
 * question or variant remains.
 */
export const RECENT_VARIANTS = 3;
/** Variants a generated question tries when looking for one not yet seen. */
const VARIANT_TRIES = 64;

/** Answers on any of these questions of a skill, oldest first. */
function attemptsOn(
  progress: Progress,
  skillId: string,
  questionIds: Set<string>,
): Attempt[] {
  return progress.attempts.filter(
    (attempt) =>
      attempt.skillId === skillId && questionIds.has(attempt.questionId),
  );
}

/**
 * The question a point (or a code step) asks next. A question asked in the
 * learner's last RECENT_VARIANTS attempts at the point waits while others
 * remain; a generated question never waits, since it brings a variant those
 * attempts did not show. Then unseen variants come first (an authored
 * question not yet answered, or any generated one), then the least asked,
 * never the same question twice in a row when avoidable, then authored
 * order. Scheduling runs on outlines, so this uses only IDs and attempts.
 */
export function freshQuestion<Q extends QuestionRef>(
  progress: Progress,
  skillId: string,
  questions: Q[],
  exclude: string[] = [],
): Q {
  const candidates = questions.filter((q) => !exclude.includes(q.id));
  const pool = candidates.length ? candidates : questions;
  const asked = attemptsOn(
    progress,
    skillId,
    new Set(questions.map((question) => question.id)),
  );
  const recent = new Set(
    asked.slice(-RECENT_VARIANTS).map((attempt) => attempt.questionId),
  );
  const counts = new Map<string, number>();
  for (const attempt of asked)
    counts.set(attempt.questionId, (counts.get(attempt.questionId) ?? 0) + 1);
  const last = progress.skills[skillId]?.lastQuestionId ?? null;
  const count = (q: Q) => counts.get(q.id) ?? 0;
  const stale = (q: Q) => !isGenerated(q) && recent.has(q.id);
  const seen = (q: Q) => !isGenerated(q) && count(q) > 0;
  return [...pool].sort(
    (a, b) =>
      Number(stale(a)) - Number(stale(b)) ||
      Number(seen(a)) - Number(seen(b)) ||
      count(a) - count(b) ||
      Number(a.id === last) - Number(b.id === last) ||
      pool.indexOf(a) - pool.indexOf(b),
  )[0];
}

/**
 * The variant a generated question asks next, or undefined for an authored
 * question. Variants are numbered 0, 1, 2, … per question (each number seeds
 * the generator); the search starts at the number of times the learner has
 * answered the question, so a reload shows the same variant until it is
 * answered. With the skill's content loaded, the first variant the learner
 * has neither answered nor met in their last RECENT_VARIANTS attempts at the
 * point is chosen, and failing that the first not met recently. Without
 * content, variant numbers alone keep variants apart.
 */
export function chooseVariant(
  progress: Progress,
  skill: SkillOutline,
  questionId: string,
): number | undefined {
  const step = stepFor(skill, evidenceIdFor(skill, questionId) ?? '');
  const ref = step?.questions.find((question) => question.id === questionId);
  if (!step || !ref || !isGenerated(ref)) return undefined;
  const full = contentOf(skill);
  const keyOf = (id: string, variant?: number) => {
    const question = full && findQuestion(full, id);
    return question && question.type !== 'code'
      ? variantKey(questionVariant(question, variant))
      : `${id}#${variant ?? ''}`;
  };
  const atPoint = attemptsOn(
    progress,
    skill.id,
    new Set(step.questions.map((question) => question.id)),
  );
  const recent = new Set(
    atPoint
      .slice(-RECENT_VARIANTS)
      .map((attempt) => keyOf(attempt.questionId, attempt.variant)),
  );
  const own = atPoint.filter((attempt) => attempt.questionId === questionId);
  const seen = new Set(
    own.map((attempt) => keyOf(attempt.questionId, attempt.variant)),
  );
  let fallback: number | undefined;
  for (let k = own.length; k < own.length + VARIANT_TRIES; k++) {
    const key = keyOf(questionId, k);
    if (recent.has(key)) continue;
    if (!seen.has(key)) return k;
    fallback ??= k;
  }
  return fallback ?? own.length;
}

/**
 * A multistep presentation: the learner's answers, in order, on the first
 * parts of one problem. Parts are answered in order on one card, so the
 * presentation in progress ends with the learner's latest lesson or review
 * answer on the skill, when that answer is a part (quiz answers live in
 * their quiz).
 */
export interface Presentation {
  problem: MultistepRef;
  answers: Attempt[];
}

/** The skill's latest presentation, finished or not, if its latest answer is a part. */
export function latestPresentation(
  progress: Progress,
  item: SkillOutline,
): Presentation | undefined {
  const own = progress.attempts.filter(
    (attempt) => attempt.skillId === item.id && attempt.mode !== 'quiz',
  );
  const last = own.at(-1);
  const found = last && findPart(item, last.questionId);
  if (!found) return undefined;
  const answers = own.slice(own.length - found.index - 1);
  return answers.every(
    (attempt, index) => attempt.questionId === found.problem.parts[index].id,
  )
    ? { problem: found.problem, answers }
    : undefined;
}

/**
 * The problem the learner is part-way through on this skill, with the index
 * of the part to ask next. A missed part does not end it: every part is
 * asked and graded.
 */
export function openProblem(
  progress: Progress,
  item: SkillOutline,
): (Presentation & { next: number }) | undefined {
  const presentation = latestPresentation(progress, item);
  return presentation &&
    presentation.answers.length < presentation.problem.parts.length
    ? { ...presentation, next: presentation.answers.length }
    : undefined;
}

/** How often each of a skill's problems was presented, and when last. */
export function problemPresentations(
  progress: Progress,
  item: SkillOutline,
): Map<string, { count: number; last: number }> {
  const result = new Map<string, { count: number; last: number }>();
  for (const problem of problemsOf(item)) {
    const first = problem.parts[0].id;
    for (const attempt of progress.attempts)
      if (attempt.skillId === item.id && attempt.questionId === first) {
        const entry = result.get(problem.id) ?? { count: 0, last: -Infinity };
        result.set(problem.id, {
          count: entry.count + 1,
          last: Math.max(entry.last, Date.parse(attempt.at)),
        });
      }
  }
  return result;
}

/** The problem met least, then longest ago, then first authored. */
export function freshestProblem(
  progress: Progress,
  item: SkillOutline,
  eligible: (problem: MultistepRef, last: number) => boolean = () => true,
): MultistepRef | undefined {
  const seen = problemPresentations(progress, item);
  const problems = problemsOf(item);
  const stats = (problem: MultistepRef) =>
    seen.get(problem.id) ?? { count: 0, last: -Infinity };
  return problems
    .filter((problem) => eligible(problem, stats(problem).last))
    .sort(
      (a, b) =>
        stats(a).count - stats(b).count ||
        stats(a).last - stats(b).last ||
        problems.indexOf(a) - problems.indexOf(b),
    )[0];
}

/**
 * The multistep problem a review of a mastered skill asks: the one the
 * learner has met least, unless they met one of the skill's problems since
 * its last review or (re)learning, so a cycle asks at most one (CEN-163).
 */
export function reviewProblem(
  progress: Progress,
  item: SkillOutline,
): MultistepRef | undefined {
  if (!problemsOf(item).length) return undefined;
  const state = getSkillState(progress, item.id);
  if (!hasLessonEvidence(item, state.questionIds)) return undefined;
  const since =
    state.memory?.lastReviewAt ??
    (state.learnedAt ? Date.parse(state.learnedAt) : 0);
  const seen = problemPresentations(progress, item);
  if ([...seen.values()].some((entry) => entry.last > since)) return undefined;
  return freshestProblem(progress, item);
}

function selectKnowledgePointQuestion(
  progress: Progress,
  item: SkillOutline,
  mode: 'learn' | 'review',
): QuestionRef {
  const state = getSkillState(progress, item.id);
  // A problem part-way through continues with its next part.
  const open = mode === 'review' ? openProblem(progress, item) : undefined;
  if (open) return open.problem.parts[open.next];
  if (mode === 'learn' && !hasLessonEvidence(item, state.questionIds)) {
    const { current, attempt } = lessonState(progress, item);
    if (current)
      return freshQuestion(
        progress,
        item.id,
        current.questions,
        attempt?.steps[current.id]?.correct,
      );
  }
  // Reviews (and practice on a mastered skill) take one fresh question from
  // each of several points, then the code exercise where policy requires it.
  const requirement = reviewRequirement(item);
  const answered = mode === 'review' ? state.reviewQuestionIds : [];
  const covered = new Set(
    answered.map((id) => evidenceIdFor(item, id)).filter(Boolean),
  );
  const points = reviewPointOrder(item, state.reviewCount);
  // A review may ask one multistep problem in place of the questions on the
  // skill's own points its parts apply. Single questions go to the other
  // points first; the problem fills the cycle's last point slots.
  const problem = mode === 'review' ? reviewProblem(progress, item) : undefined;
  const applied = new Set(
    problem?.parts.filter((part) => ownPart(item, part)).map((p) => p.point),
  );
  const pending = [...applied].filter((id) => !covered.has(id)).length;
  const remaining = [
    ...points.filter((point) => !applied.has(point.id)),
    ...points.filter((point) => applied.has(point.id)),
  ].filter((point) => !covered.has(point.id));
  const pointsCovered = points.length - remaining.length;
  if (problem && pending > 0) {
    if (pointsCovered + pending < requirement.points)
      return freshQuestion(progress, item.id, remaining[0].questions);
    if (pointsCovered < requirement.points) return problem.parts[0];
  }
  if (remaining.length && pointsCovered < requirement.points)
    return freshQuestion(progress, item.id, remaining[0].questions);
  const code = item.questions.filter((question) => question.type === 'code');
  if (
    requirement.code &&
    code.length &&
    !answered.some((id) => code.some((q) => q.id === id))
  )
    return freshQuestion(progress, item.id, code);
  return freshQuestion(progress, item.id, points[0].questions);
}

/**
 * The question to ask next. Scheduling needs only the outline; given a skill
 * with its content, the question comes back with its content too, and a
 * generated question as the variant to ask (its `variant` is the number to
 * record with the answer).
 */
export function selectQuestion<S extends SkillOutline>(
  progress: Progress,
  item: S,
  mode: 'learn' | 'review',
): QuestionOf<S> {
  const question = pickQuestion(progress, item, mode);
  // With content, a generated question comes back as the variant to ask.
  if (!hasContent(item) || !isGenerated(question))
    return question as QuestionOf<S>;
  return questionVariant(
    question as Question,
    chooseVariant(progress, item, question.id),
  ) as QuestionOf<S>;
}

function pickQuestion(
  progress: Progress,
  item: SkillOutline,
  mode: 'learn' | 'review',
): QuestionRef {
  if (hasKnowledgePoints(item))
    return selectKnowledgePointQuestion(progress, item, mode);
  const state = getSkillState(progress, item.id);
  const evidence =
    mode === 'learn' ? state.questionIds : state.reviewQuestionIds;
  const available = item.questions.filter(
    (question) => !evidence.includes(question.id),
  );
  const candidates = available.length ? available : item.questions;
  const typeOf = (question: QuestionRef) => assessmentType(question.type);
  const missingTypes = reviewRequirement(item).types.filter(
    (type) =>
      !state.reviewQuestionIds.some((id) => {
        const question = item.questions.find(
          (candidate) => candidate.id === id,
        );
        return !!question && typeOf(question) === type;
      }),
  );
  const counts = new Map<string, number>();
  progress.attempts
    .filter(
      (attempt) =>
        attempt.skillId === item.id &&
        attempt.mode === mode &&
        (mode !== 'review' ||
          state.dueAt === null ||
          Date.parse(attempt.at) >= state.dueAt),
    )
    .forEach((attempt) =>
      counts.set(attempt.questionId, (counts.get(attempt.questionId) ?? 0) + 1),
    );
  const sorted = [...candidates].sort((a, b) => {
    const countDifference = (counts.get(a.id) ?? 0) - (counts.get(b.id) ?? 0);
    if (countDifference) return countDifference;
    // Ask for missing subject-specific assessment evidence before repeating a covered type.
    if (mode === 'review' && missingTypes.length) {
      const aPriority = missingTypes.indexOf(typeOf(a)),
        bPriority = missingTypes.indexOf(typeOf(b));
      if (aPriority >= 0 && bPriority < 0) return -1;
      if (bPriority >= 0 && aPriority < 0) return 1;
      if (aPriority >= 0 && bPriority >= 0 && aPriority !== bPriority)
        return aPriority - bPriority;
    }
    if (a.id === state.lastQuestionId && b.id !== state.lastQuestionId)
      return 1;
    if (b.id === state.lastQuestionId && a.id !== state.lastQuestionId)
      return -1;
    return item.questions.indexOf(a) - item.questions.indexOf(b);
  });
  return sorted[0];
}

/** Prioritize due retrieval, then remediation, then the prerequisite-ready frontier. */
/**
 * Review tasks finished since the learner last worked on a lesson: passed
 * cycles and missed due-review answers (which end their cycle).
 */
export function reviewsSinceLesson(progress: Progress): number {
  let count = 0;
  for (let index = progress.attempts.length - 1; index >= 0; index--) {
    const attempt = progress.attempts[index];
    if (attempt.mode === 'learn') break;
    if (
      attempt.mode === 'review' &&
      attempt.reviewDueAt !== undefined &&
      (attempt.outcome === 'review-passed' || !attempt.correct)
    )
      count++;
  }
  return count;
}

/** Due within this window counts as nearly due when compressing reviews. */
export const NEARLY_DUE_MS = DAY_MS;

/**
 * Whether a prerequisite can take implicit credit now: mastered, unlocked,
 * scheduled, not mid-way through its own review, not credited today, not
 * learned or reviewed earlier today (its own check comes first), and not
 * waiting on a remedial review after its latest direct answer was wrong.
 */
function creditable(
  progress: Progress,
  id: string,
  today: string,
  time: number,
  catalog: GraphCatalog,
  unlocked: (id: string) => boolean = (skillId) =>
    isUnlocked(progress, skillId, catalog),
): boolean {
  const state = progress.skills[id];
  return (
    !!state &&
    state.dueAt !== null &&
    state.reviewQuestionIds.length === 0 &&
    state.consecutiveCorrect > 0 &&
    state.implicitCredit?.day !== today &&
    // A placement waits for its own first review.
    !placementPending(state) &&
    // So does a refresh a failed lesson brought forward.
    !refreshPending(state) &&
    dateKey(
      legacyMemory(state, time).lastReviewAt,
      progress.timeZone || 'UTC',
    ) !== today &&
    isMastered(progress, id, catalog) &&
    unlocked(id)
  );
}

/**
 * The due date a successful task on a dependent gives a prerequisite: its
 * weight times the interval a full successful review at `time` would add,
 * so never later than that review would schedule.
 */
export function implicitDueAt(
  state: SkillProgress,
  weight: number,
  time: number,
): { dueAt: number; basis: number } | null {
  if (state.dueAt === null) return null;
  const memory = legacyMemory(state, time);
  // Practice timed before the last real review (a stale clock or an
  // offline replay) adds nothing to it.
  if (time <= memory.lastReviewAt) return null;
  const full = reviewMemory(memory, time, 'pass').dueAt;
  const gain = full - state.dueAt;
  if (gain <= 0) return null;
  return {
    dueAt: Math.min(full, state.dueAt + Math.round(weight * gain)),
    basis: memory.lastReviewAt,
  };
}

/**
 * After skill `from` succeeds (a lesson, a review cycle, or a quiz answer),
 * give each prerequisite it encompasses weighted implicit review credit.
 * Direct prerequisites only; failures never call this.
 */
export function applyImplicitCredit(
  progress: Progress,
  from: SkillOutline,
  now: Now,
  catalog: GraphCatalog = defaultCatalog,
): { progress: Progress; credited: string[] } {
  return creditSkills(progress, from.id, encompassings(from), now, catalog);
}

/**
 * The weight a correct multistep part gives the skill of the point it
 * exercises: that skill's encompassing weight when it is a direct
 * prerequisite, and never less than DEFAULT_ENCOMPASS_WEIGHT, since the part
 * asked about one of its points directly.
 */
export function partCreditWeight(from: SkillOutline, skillId: string): number {
  return Math.max(
    DEFAULT_ENCOMPASS_WEIGHT,
    encompassings(from).find((entry) => entry.id === skillId)?.weight ?? 0,
  );
}

/**
 * Give implicit review credit from skill `from` to each target that can take
 * it now (see creditable), each moving its due date by its weight.
 */
export function creditSkills(
  progress: Progress,
  from: string,
  targets: { id: string; weight: number }[],
  now: Now,
  catalog: GraphCatalog = defaultCatalog,
): { progress: Progress; credited: string[] } {
  const time = timestamp(now);
  const today = dateKey(time, progress.timeZone || 'UTC');
  const skills = { ...progress.skills };
  const credited: string[] = [];
  for (const { id, weight } of targets) {
    if (!creditable(progress, id, today, time, catalog)) continue;
    const state = skills[id];
    const next = implicitDueAt(state, weight, time);
    if (!next) continue;
    skills[id] = {
      ...state,
      dueAt: next.dueAt,
      implicitCredit: {
        at: time,
        day: today,
        from,
        weight,
        basis: next.basis,
        dueBefore: state.dueAt!,
        dueAt: next.dueAt,
      },
    };
    credited.push(id);
  }
  return credited.length
    ? { progress: { ...progress, skills }, credited }
    : { progress, credited };
}

/**
 * How many other due or nearly due skills a successful review of `skill`
 * would credit. Reviews that cover more of the queue go first.
 */
export function reviewCoverage(
  progress: Progress,
  skill: SkillOutline,
  now: Now,
  catalog: GraphCatalog = defaultCatalog,
  unlocked = unlockChecker(progress, catalog),
): number {
  const time = timestamp(now);
  const today = dateKey(time, progress.timeZone || 'UTC');
  return encompassings(skill).filter(({ id }) => {
    const state = progress.skills[id];
    return (
      !!state &&
      state.dueAt !== null &&
      state.dueAt <= time + NEARLY_DUE_MS &&
      creditable(progress, id, today, time, catalog, unlocked)
    );
  }).length;
}

/**
 * Why a refreshed skill is reviewed now, in the learner's words:
 * "Before trying <lesson> again, let's refresh <skill>."
 */
export function refreshReason(
  progress: Progress,
  item: SkillOutline,
  catalog: GraphCatalog = defaultCatalog,
): string {
  const lesson = progress.skills[item.id]?.refresh?.lesson;
  const title = lesson && skillIndex(catalog).get(lesson)?.title;
  return title
    ? `Before trying ${title} again, let's refresh ${item.title}.`
    : `Let's refresh ${item.title}.`;
}

export function nextTask(
  progress: Progress,
  now: Now = new Date(),
  courseId?: string,
  catalog: GraphCatalog = defaultCatalog,
  /** A review session asks only for reviews, so it never switches to a lesson. */
  options: { reviewsOnly?: boolean } = {},
): NextTask | null {
  const time = timestamp(now);
  const registry = coursePath(courseId, catalog);
  const unlocked = unlockChecker(progress, catalog);
  const lastSkill = progress.attempts.at(-1)?.skillId;
  const due = registry.filter(
    (item) =>
      isMastered(progress, item.id, catalog) &&
      unlocked(item.id) &&
      getSkillState(progress, item.id).dueAt !== null &&
      getSkillState(progress, item.id).dueAt! <= time,
  );
  const coverageCache = new Map<string, number>();
  const coverage = (item: SkillOutline) => {
    if (!coverageCache.has(item.id))
      coverageCache.set(
        item.id,
        reviewCoverage(progress, item, time, catalog, unlocked),
      );
    return coverageCache.get(item.id)!;
  };
  // A multistep problem part-way through is finished first, on its card.
  const resuming = due.find(
    (item) => item.id === lastSkill && openProblem(progress, item),
  )?.id;
  due.sort((a, b) => {
    if (a.id === resuming || b.id === resuming)
      return Number(b.id === resuming) - Number(a.id === resuming);
    // A refresh a failed lesson is waiting for goes first.
    const refreshing =
      Number(refreshPending(progress.skills[b.id])) -
      Number(refreshPending(progress.skills[a.id]));
    if (refreshing) return refreshing;
    // Keep the selected course's due retrieval ahead of its supporting ancestors.
    if (courseId && a.courseId === courseId && b.courseId !== courseId)
      return -1;
    if (courseId && b.courseId === courseId && a.courseId !== courseId)
      return 1;
    // Interleave due skills when several are available.
    if (a.id === lastSkill && b.id !== lastSkill) return 1;
    if (b.id === lastSkill && a.id !== lastSkill) return -1;
    // Review compression: a review that also credits due prerequisites first.
    const covered = coverage(b) - coverage(a);
    if (covered) return covered;
    const left = getSkillState(progress, a.id),
      right = getSkillState(progress, b.id);
    return (
      recallProbability(legacyMemory(left, time), time) -
        recallProbability(legacyMemory(right, time), time) ||
      left.dueAt! - right.dueAt!
    );
  });
  const available = registry.filter(
    (item) => !isMastered(progress, item.id, catalog) && unlocked(item.id),
  );
  // A lesson failed moments ago waits behind any other available work.
  const coolingDown = available.filter((item) =>
    lessonCoolingDown(progress, item.id, time),
  );
  const fresh = available.filter((item) => !coolingDown.includes(item));
  // Reviews come first, up to MAX_CONSECUTIVE_REVIEWS in a row while a
  // lesson is ready; then a lesson takes its turn.
  const lessonTurn =
    !options.reviewsOnly &&
    fresh.length > 0 &&
    reviewsSinceLesson(progress) >= MAX_CONSECUTIVE_REVIEWS;
  if (due.length && !lessonTurn) {
    const item = due[0];
    return {
      skillId: item.id,
      mode: 'review',
      questionId: selectQuestion(progress, item, 'review').id,
      reason: refreshPending(progress.skills[item.id])
        ? refreshReason(progress, item, catalog)
        : 'This skill is due for spaced retrieval. Recall it before looking back at the lesson.',
    };
  }
  const ready = fresh.length ? fresh : coolingDown;
  const remediation = ready
    .filter((item) => getSkillState(progress, item.id).learnedAt !== null)
    .sort(
      (a, b) =>
        (getSkillState(progress, b.id).lastPracticedAt ?? 0) -
        (getSkillState(progress, a.id).lastPracticedAt ?? 0),
    );
  const active = ready
    .filter(
      (item) =>
        getSkillState(progress, item.id).attempts > 0 ||
        getSkillState(progress, item.id).lessonSeen,
    )
    .sort(
      (a, b) =>
        (getSkillState(progress, b.id).lastPracticedAt ?? 0) -
        (getSkillState(progress, a.id).lastPracticedAt ?? 0),
    );
  const item =
    remediation[0] ??
    active[0] ??
    ready.sort((a, b) => {
      if (courseId && a.courseId === courseId && b.courseId !== courseId)
        return -1;
      if (courseId && b.courseId === courseId && a.courseId !== courseId)
        return 1;
      return a.order - b.order;
    })[0];
  if (!item) return null;
  return {
    skillId: item.id,
    mode: 'learn',
    questionId: selectQuestion(progress, item, 'learn').id,
    reason: !fresh.length
      ? 'Try this lesson again from its first point.'
      : due.length
        ? 'You have done a few reviews in a row; learn something new before the next one.'
        : remediation.length
          ? 'Restore the missing evidence for this skill before building on it.'
          : active.length
            ? 'Finish this skill with distinct, independent answers.'
            : courseId && item.courseId !== courseId
              ? 'Build this prerequisite from another course to advance your selected learning goal.'
              : 'You have the prerequisite evidence to learn this skill.',
  };
}

export function recordLesson(
  progress: Progress,
  skillId: string,
  now: Now = new Date(),
  catalog: GraphCatalog = defaultCatalog,
): Progress {
  if (!catalog.skills.some((skill) => skill.id === skillId))
    throw new Error(`Unknown skill: ${skillId}`);
  if (!isUnlocked(progress, skillId, catalog))
    throw new Error('Master the prerequisites before starting this lesson.');
  const old = getSkillState(progress, skillId);
  return {
    ...progress,
    skills: {
      ...progress.skills,
      [skillId]: { ...old, lessonSeen: true, lastPracticedAt: timestamp(now) },
    },
  };
}

/**
 * XP from per-question rewards earned before lessons awarded XP per task: 10
 * per choice question and 15 for the code exercise, including the retired
 * choice questions of the four-question lessons.
 */
function legacyLessonCredit(item: SkillOutline, rewarded: string[]): number {
  const code = new Set(
    item.questions.filter((q) => q.type === 'code').map((q) => q.id),
  );
  return [
    ...new Set([
      ...legacyQuestionIds(item),
      ...item.questions.map((question) => question.id),
    ]),
  ]
    .filter((id) => rewarded.includes(id))
    .reduce((sum, id) => sum + (code.has(id) ? 15 : 10), 0);
}

/** Base XP a lesson can still pay; zero once its reward has been earned. */
export function lessonXpAvailable(
  progress: Progress,
  item: SkillOutline,
): number {
  const state = getSkillState(progress, item.id);
  if (state.lessonRewarded) return 0;
  return Math.max(
    0,
    lessonXp(item) - legacyLessonCredit(item, state.rewardedQuestionIds),
  );
}

export function applyAttempt(
  progress: Progress,
  input: AttemptInput,
  now: Now = new Date(),
  catalog: GraphCatalog = defaultCatalog,
): Progress {
  if (
    input.attemptId &&
    progress.attempts.some((a) => a.id === input.attemptId)
  )
    return progress;
  const item = catalog.skills.find((skill) => skill.id === input.skillId);
  if (!item) throw new Error(`Unknown skill: ${input.skillId}`);
  const question = findQuestion(item, input.questionId);
  if (!question) throw new Error('This question does not belong to the skill.');
  // A multistep part (CEN-163): graded on its own, never a lesson step.
  const part = findPart(item, question.id);
  if (!isUnlocked(progress, item.id, catalog))
    throw new Error('Master the prerequisites before attempting this skill.');
  if (input.mode !== 'learn' && input.mode !== 'review')
    throw new Error('Unknown practice mode.');
  const time = timestamp(now);
  const old = getSkillState(progress, item.id);
  const state: SkillProgress = {
    ...old,
    questionIds: [...old.questionIds],
    rewardedQuestionIds: [...(old.rewardedQuestionIds ?? [])],
    reviewQuestionIds: [...(old.reviewQuestionIds ?? [])],
    evidenceUpdates: { ...old.evidenceUpdates },
    totalXp:
      old.totalXp ??
      progress.attempts
        .filter((a) => a.skillId === item.id)
        .reduce((sum, a) => sum + a.xp, 0),
    dailyXp: old.dailyXp
      ? { ...old.dailyXp }
      : progress.attempts
          .filter((a) => a.skillId === item.id)
          .reduce<Record<string, number>>((days, a) => {
            const day = dateKey(a.at, progress.timeZone || 'UTC');
            days[day] = (days[day] ?? 0) + a.xp;
            return days;
          }, {}),
  };
  // Seed legacy evidence before compaction so an old device cannot resurrect
  // a later observed failure when its event falls out of the recent log.
  for (const id of old.questionIds)
    state.evidenceUpdates![id] ??= {
      at: old.lastPracticedAt ?? time,
      sequence: old.attempts,
      correct: true,
    };
  const wasMastered = isMastered(progress, item.id, catalog);
  const knowledgePoints = hasKnowledgePoints(item);
  // A part answers for the skill's own point it applies (partEvidencePoint).
  const evidenceId = evidenceIdFor(item, question.id) ?? question.id;
  const unassisted = input.correct && !input.usedHint;
  // The problem counts for the skill only when every part, answered in
  // order in one presentation, is right.
  let problemSolved = false;
  if (part && unassisted && part.index === part.problem.parts.length - 1) {
    const before = latestPresentation(progress, item);
    problemSolved =
      part.index === 0 ||
      (before?.problem.id === part.problem.id &&
        before.answers.length === part.index &&
        before.answers.every((answer) => answer.correct && !answer.usedHint));
  }
  const reviewDue = wasMastered && old.dueAt !== null && old.dueAt <= time;
  let xp = 0;
  let outcome: AttemptOutcome | undefined;
  state.lessonSeen = true;
  state.attempts += 1;
  state.correct += input.correct ? 1 : 0;
  state.activity = recordActivity(
    old.activity ?? createActivity(old.attempts, old.correct),
    input.correct,
    input.writerId,
  );
  state.consecutiveCorrect = unassisted ? state.consecutiveCorrect + 1 : 0;
  state.lastPracticedAt = time;
  state.lastQuestionId = question.id;

  // Learning a skill is one task: its attempt tracks answers per lesson step.
  // Only the current step counts, so a stale screen cannot skip ahead.
  let step: LessonStepProgress | undefined;
  let stepKind: LessonStepRef['kind'] | undefined;
  if (input.mode === 'learn' && !wasMastered && !part) {
    const lesson = lessonState(progress, item);
    if (lesson.current?.id === evidenceId) {
      const attempt = currentLessonAttempt(old);
      const startedAt = Math.max(time, (old.lessonFailedAt ?? -1) + 1);
      state.lessonAttempt = attempt
        ? { ...attempt, steps: { ...attempt.steps } }
        : { startedAt, steps: {} };
      const previous = state.lessonAttempt.steps[evidenceId];
      step = {
        correct: [...(previous?.correct ?? [])],
        incorrect: previous?.incorrect ?? 0,
      };
      state.lessonAttempt.steps[evidenceId] = step;
      stepKind = lesson.current.kind;
    }
  }

  if (!input.correct) {
    state.evidenceUpdates![evidenceId] = {
      at: time,
      sequence: state.attempts,
      correct: false,
    };
    if (wasMastered) {
      state.memory = reviewMemory(legacyMemory(old, time), time, 'fail');
      // The lapse settles any pending refresh: the skill is relearned now.
      delete state.refresh;
    }
    state.questionIds = state.questionIds.filter((id) => id !== evidenceId);
    // An unconfirmed placement was never learned here: the whole lesson
    // returns, not just the missed point.
    if (placementPending(old)) {
      for (const id of lessonSteps(item).map((step) => step.id)) {
        state.evidenceUpdates![id] = {
          at: time,
          sequence: state.attempts,
          correct: false,
        };
      }
      const steps = new Set(lessonSteps(item).map((step) => step.id));
      state.questionIds = state.questionIds.filter((id) => !steps.has(id));
      state.placement = { ...old.placement!, demotedAt: time };
    }
    state.reviewQuestionIds = [];
    state.reviewHadHint = false;
    state.intervalDays = 0;
    state.dueAt = null;
    if (step) {
      step.incorrect += 1;
      // Three misses on one point fail the attempt: nothing from it is kept.
      if (
        knowledgePoints &&
        stepKind === 'point' &&
        step.incorrect >= POINT_FAIL_INCORRECT
      ) {
        state.lessonAttempt = undefined;
        state.lessonFailedAt = time;
        outcome = 'lesson-failed';
      }
    }
  } else if (input.mode === 'learn' && unassisted && !wasMastered) {
    if (!knowledgePoints) {
      state.evidenceUpdates![question.id] = {
        at: time,
        sequence: state.attempts,
        correct: true,
      };
      if (!state.questionIds.includes(question.id))
        state.questionIds.push(question.id);
    } else if (step) {
      if (!step.correct.includes(question.id)) step.correct.push(question.id);
      // Passed points become evidence together, when the whole lesson passes.
      const steps = lessonSteps(item);
      const complete = steps.every(
        (candidate) =>
          state.questionIds.includes(candidate.id) ||
          stepPassed(candidate, state.lessonAttempt!.steps[candidate.id]),
      );
      if (complete)
        for (const candidate of steps)
          if (!state.questionIds.includes(candidate.id)) {
            state.questionIds.push(candidate.id);
            state.evidenceUpdates![candidate.id] = {
              at: time,
              sequence: state.attempts,
              correct: true,
            };
          }
    }
  } else if (
    input.mode === 'review' &&
    reviewDue &&
    unassisted &&
    // A solved problem answers for the skill's own points its parts apply.
    (part
      ? problemSolved
        ? ownPartIds(item, part.problem)
        : []
      : [question.id]
    ).some((id) => !state.reviewQuestionIds.includes(id))
  ) {
    for (const id of part ? ownPartIds(item, part.problem) : [question.id])
      if (!state.reviewQuestionIds.includes(id))
        state.reviewQuestionIds.push(id);
    if (reviewCycleComplete(item, state.reviewQuestionIds)) {
      state.reviewCount += 1;
      state.memory = reviewMemory(
        legacyMemory(old, time),
        time,
        state.reviewHadHint ? 'hard' : 'pass',
      );
      state.intervalDays = state.memory.scheduledDays;
      state.dueAt = state.memory.dueAt;
      state.reviewQuestionIds = [];
      state.reviewHadHint = false;
      delete state.refresh;
      // A wrong answer ends a cycle, so a completed review has no misses.
      xp = earnedXp(REVIEW_XP, 0, true);
      outcome = 'review-passed';
      if (placementPending(old))
        state.placement = { ...old.placement!, confirmedAt: time };
    }
  }
  // Assisted answers never postpone retrieval; a later independent completion
  // records a harder cycle rather than treating it like effortless recall.
  if (input.mode === 'review' && reviewDue && input.usedHint && input.correct)
    state.reviewHadHint = true;

  state.mastery = masteryFraction(item, state.questionIds);
  if (hasLessonEvidence(item, state.questionIds) && !wasMastered) {
    state.learnedAt ??= new Date(time).toISOString();
    state.memory = acquisitionMemory(time, state.memory);
    state.intervalDays = 1;
    state.dueAt = time + DAY_MS;
    state.reviewQuestionIds = [];
    state.reviewHadHint = false;
    // Lesson XP is paid once per skill, net of any older per-question XP.
    const incorrect = Object.values(state.lessonAttempt?.steps ?? {}).reduce(
      (sum, answers) => sum + answers.incorrect,
      0,
    );
    xp = state.lessonRewarded
      ? 0
      : Math.max(
          0,
          earnedXp(lessonXp(item), incorrect, true) -
            legacyLessonCredit(item, state.rewardedQuestionIds),
        );
    state.lessonRewarded = true;
    state.lessonAttempt = undefined;
    outcome = 'lesson-passed';
  }
  if (state.lessonAttempt === undefined) delete state.lessonAttempt;
  const today = dateKey(time, progress.timeZone || 'UTC');
  state.totalXp! += xp;
  state.dailyXp![today] = (state.dailyXp![today] ?? 0) + xp;
  const previous = progress.lastActivityDate;
  const streak =
    previous === today
      ? progress.streak
      : previous === previousDate(today)
        ? progress.streak + 1
        : 1;
  const attempt: Attempt = {
    id: input.attemptId ?? crypto.randomUUID(),
    skillId: item.id,
    questionId: question.id,
    correct: input.correct,
    mode: input.mode,
    usedHint: !!input.usedHint,
    at: new Date(time).toISOString(),
    xp,
    ...(input.mode === 'review' && reviewDue
      ? { reviewDueAt: old.dueAt! }
      : {}),
    ...(outcome ? { outcome } : {}),
    ...(input.response !== undefined && isTypedType(question.type)
      ? { response: input.response.slice(0, TYPED_RESPONSE_MAX_LENGTH) }
      : {}),
    ...(isGenerated(question) && isVariant(input.variant)
      ? { variant: input.variant }
      : {}),
  };
  const updated: Progress = {
    ...progress,
    skills: { ...progress.skills, [item.id]: state },
    totalXp: progress.totalXp + xp,
    dailyXp: {
      ...progress.dailyXp,
      [today]: (progress.dailyXp[today] ?? 0) + xp,
    },
    lastActivityDate: today,
    streak,
  };
  // A correct part on a prerequisite's point reviews that skill a little.
  const target = part && pointSkillId(part.part.point);
  const partCredit =
    part && unassisted && target && !ownPart(item, part.part)
      ? creditSkills(
          updated,
          item.id,
          [{ id: target, weight: partCreditWeight(item, target) }],
          time,
          catalog,
        )
      : { progress: updated, credited: [] };
  // A finished lesson or review also exercises the skills it uses.
  const taskCredit =
    outcome === 'lesson-passed' || outcome === 'review-passed'
      ? applyImplicitCredit(partCredit.progress, item, time, catalog)
      : { progress: partCredit.progress, credited: [] };
  const credit = {
    progress: taskCredit.progress,
    credited: [...partCredit.credited, ...taskCredit.credited],
  };
  // A failed lesson brings its weakest prerequisites' reviews forward. This
  // failure is not in the log yet, so it adds one to the streak there.
  const refreshed =
    outcome === 'lesson-failed'
      ? refreshPrerequisites(
          credit.progress,
          item,
          time,
          lessonFailureStreak(progress, item.id) + 1,
          catalog,
          old.lessonFailedAt,
        )
      : { progress: credit.progress, refreshed: [] };
  return {
    ...refreshed.progress,
    attempts: [
      ...progress.attempts,
      credit.credited.length
        ? { ...attempt, credited: credit.credited }
        : attempt,
    ].slice(-MAX_RECENT_ATTEMPTS),
  };
}

/**
 * After `item`'s lesson fails, schedule a refresh of its weakest
 * prerequisites (see planRefresh). `since` is the previous failure, if any.
 */
export function refreshPrerequisites(
  progress: Progress,
  item: SkillOutline,
  time: number,
  failures: number,
  catalog: GraphCatalog = defaultCatalog,
  since?: number,
): { progress: Progress; refreshed: string[] } {
  const plan = planRefresh(progress, item, time, failures, catalog, since);
  if (!plan.length) return { progress, refreshed: [] };
  const skills = { ...progress.skills };
  for (const { id } of plan)
    skills[id] = scheduleRefresh(skills[id], time, item.id);
  return {
    progress: { ...progress, skills },
    refreshed: plan.map(({ id }) => id),
  };
}

export function getStats(
  progress: Progress,
  now: Now = new Date(),
  courseId?: string,
  catalog: GraphCatalog = defaultCatalog,
) {
  const time = timestamp(now);
  const registry = courseSkills(courseId, catalog);
  const ids = new Set(registry.map((item) => item.id));
  const attempts = progress.attempts.filter((attempt) =>
    ids.has(attempt.skillId),
  );
  const today = dateKey(time, progress.timeZone || 'UTC');
  const mastered = registry.filter((item) =>
    isMastered(progress, item.id, catalog),
  ).length;
  const unlocked = unlockChecker(progress, catalog);
  return {
    todayXp: courseId
      ? registry.reduce(
          (sum, item) =>
            sum +
            (getSkillState(progress, item.id).dailyXp?.[today] ??
              attempts
                .filter(
                  (a) =>
                    a.skillId === item.id &&
                    dateKey(a.at, progress.timeZone || 'UTC') === today,
                )
                .reduce((n, a) => n + a.xp, 0)),
          0,
        )
      : (progress.dailyXp[today] ?? 0),
    totalXp: courseId
      ? registry.reduce(
          (sum, item) =>
            sum +
            (getSkillState(progress, item.id).totalXp ??
              attempts
                .filter((a) => a.skillId === item.id)
                .reduce((n, a) => n + a.xp, 0)),
          0,
        )
      : progress.totalXp,
    mastered,
    started: registry.filter(
      (item) =>
        getSkillState(progress, item.id).lessonSeen ||
        getSkillState(progress, item.id).attempts > 0,
    ).length,
    accuracy: registry.reduce(
      (n, item) => n + getSkillState(progress, item.id).attempts,
      0,
    )
      ? registry.reduce(
          (n, item) => n + getSkillState(progress, item.id).correct,
          0,
        ) /
        registry.reduce(
          (n, item) => n + getSkillState(progress, item.id).attempts,
          0,
        )
      : 0,
    dueCount: registry.filter(
      (item) =>
        isMastered(progress, item.id, catalog) &&
        unlocked(item.id) &&
        getSkillState(progress, item.id).dueAt !== null &&
        getSkillState(progress, item.id).dueAt! <= time,
    ).length,
    streak:
      progress.lastActivityDate === today ||
      progress.lastActivityDate === previousDate(today)
        ? progress.streak
        : 0,
    totalSkills: registry.length,
    available: registry.filter(
      (item) =>
        isUnlocked(progress, item.id, catalog) &&
        !isMastered(progress, item.id, catalog),
    ).length,
    completion: registry.length ? mastered / registry.length : 0,
    course: courseId
      ? catalog.courses.find((course) => course.id === courseId)
      : undefined,
  };
}

/** Cards are earned by actual mastery; the export layer can add explicit preview support. */
export function earnedFlashcards<S extends SkillOutline = SkillOutline>(
  progress: Progress,
  courseId?: string,
  catalog: CurriculumCatalog<S> = defaultCatalog as CurriculumCatalog<S>,
): S['flashcards'] {
  return courseSkills(courseId, catalog)
    .filter((item) => isMastered(progress, item.id, catalog))
    .flatMap((item) => item.flashcards);
}
