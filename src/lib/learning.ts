import {
  defaultCatalog,
  encompassings,
  type CurriculumCatalog,
  type Question,
  type Skill,
} from './curriculum';
import {
  evidenceIdFor,
  findQuestion,
  hasKnowledgePoints,
  hasLessonEvidence,
  lessonSteps,
  masteryFraction,
  POINT_FAIL_INCORRECT,
  POINT_PASS_CORRECT,
  reviewCycleComplete,
  reviewPointOrder,
  reviewRequirement,
  type LessonStep,
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
}

export interface Progress {
  version: 5;
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
function skillIndex(catalog: CurriculumCatalog) {
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
    version: 5,
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
  catalog: CurriculumCatalog = defaultCatalog,
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

function stepPassed(step: LessonStep, progress?: LessonStepProgress) {
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
export function lessonState(progress: Progress, item: Skill) {
  const state = getSkillState(progress, item.id);
  const attempt = currentLessonAttempt(state);
  let current: LessonStep | undefined;
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

/** Whether a failed lesson is still waiting for other work (see LESSON_RETRY_DELAY_MS). */
export function lessonCoolingDown(
  progress: Progress,
  skillId: string,
  now: Now = new Date(),
): boolean {
  const state = progress.skills[skillId];
  const failedAt = state?.lessonFailedAt;
  if (failedAt === undefined || currentLessonAttempt(state)) return false;
  if (timestamp(now) >= failedAt + LESSON_RETRY_DELAY_MS) return false;
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
  catalog: CurriculumCatalog = defaultCatalog,
): boolean {
  return unlockChecker(progress, catalog)(skillId);
}

/** Reuse one traversal across a scheduling pass; cycles and missing nodes fail closed. */
function unlockChecker(progress: Progress, catalog: CurriculumCatalog) {
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

function courseSkills(
  courseId: string | undefined,
  catalog: CurriculumCatalog,
): Skill[] {
  return courseId
    ? catalog.skills.filter((item) => item.courseId === courseId)
    : catalog.skills;
}

/** A course goal includes its prerequisite ancestors, even when they live in another subject. */
export function coursePath(
  courseId: string | undefined,
  catalog: CurriculumCatalog = defaultCatalog,
): Skill[] {
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

/** Unseen variants first, then the least seen; never the same question twice in a row when avoidable. */
function freshest(
  questions: Question[],
  counts: Map<string, number>,
  lastQuestionId: string | null,
  exclude: string[] = [],
): Question {
  const candidates = questions.filter((q) => !exclude.includes(q.id));
  const pool = candidates.length ? candidates : questions;
  return [...pool].sort(
    (a, b) =>
      (counts.get(a.id) ?? 0) - (counts.get(b.id) ?? 0) ||
      Number(a.id === lastQuestionId) - Number(b.id === lastQuestionId) ||
      pool.indexOf(a) - pool.indexOf(b),
  )[0];
}

function selectKnowledgePointQuestion(
  progress: Progress,
  item: Skill,
  mode: 'learn' | 'review',
): Question {
  const state = getSkillState(progress, item.id);
  const counts = seenCounts(progress, item.id);
  if (mode === 'learn' && !hasLessonEvidence(item, state.questionIds)) {
    const { current, attempt } = lessonState(progress, item);
    if (current)
      return freshest(
        current.questions,
        counts,
        state.lastQuestionId,
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
  const remaining = points.filter((point) => !covered.has(point.id));
  const pointsCovered = points.length - remaining.length;
  if (remaining.length && pointsCovered < requirement.points)
    return freshest(remaining[0].questions, counts, state.lastQuestionId);
  const code = item.questions.filter((question) => question.type === 'code');
  if (
    requirement.code &&
    code.length &&
    !answered.some((id) => code.some((q) => q.id === id))
  )
    return freshest(code, counts, state.lastQuestionId);
  return freshest(points[0].questions, counts, state.lastQuestionId);
}

export function selectQuestion(
  progress: Progress,
  item: Skill,
  mode: 'learn' | 'review',
): Question {
  if (hasKnowledgePoints(item))
    return selectKnowledgePointQuestion(progress, item, mode);
  const state = getSkillState(progress, item.id);
  const evidence =
    mode === 'learn' ? state.questionIds : state.reviewQuestionIds;
  const available = item.questions.filter(
    (question) => !evidence.includes(question.id),
  );
  const candidates = available.length ? available : item.questions;
  const missingTypes = reviewRequirement(item).types.filter(
    (type) =>
      !state.reviewQuestionIds.some(
        (id) =>
          item.questions.find((question) => question.id === id)?.type === type,
      ),
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
      const aPriority = missingTypes.indexOf(a.type),
        bPriority = missingTypes.indexOf(b.type);
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
  catalog: CurriculumCatalog,
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
  from: Skill,
  now: Now,
  catalog: CurriculumCatalog = defaultCatalog,
): { progress: Progress; credited: string[] } {
  const time = timestamp(now);
  const today = dateKey(time, progress.timeZone || 'UTC');
  const skills = { ...progress.skills };
  const credited: string[] = [];
  for (const { id, weight } of encompassings(from)) {
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
        from: from.id,
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
  skill: Skill,
  now: Now,
  catalog: CurriculumCatalog = defaultCatalog,
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

export function nextTask(
  progress: Progress,
  now: Now = new Date(),
  courseId?: string,
  catalog: CurriculumCatalog = defaultCatalog,
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
  const coverage = (item: Skill) => {
    if (!coverageCache.has(item.id))
      coverageCache.set(
        item.id,
        reviewCoverage(progress, item, time, catalog, unlocked),
      );
    return coverageCache.get(item.id)!;
  };
  due.sort((a, b) => {
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
      reason:
        'This skill is due for spaced retrieval. Recall it before looking back at the lesson.',
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
  catalog: CurriculumCatalog = defaultCatalog,
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

/** XP from per-question rewards earned before lessons awarded XP per task. */
function legacyLessonCredit(item: Skill, rewarded: string[]): number {
  return item.questions
    .filter((question) => rewarded.includes(question.id))
    .reduce((sum, question) => sum + (question.type === 'code' ? 15 : 10), 0);
}

/** Base XP a lesson can still pay; zero once its reward has been earned. */
export function lessonXpAvailable(progress: Progress, item: Skill): number {
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
  catalog: CurriculumCatalog = defaultCatalog,
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
  const evidenceId = evidenceIdFor(item, question.id)!;
  const unassisted = input.correct && !input.usedHint;
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
  let stepKind: LessonStep['kind'] | undefined;
  if (input.mode === 'learn' && !wasMastered) {
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
    if (wasMastered)
      state.memory = reviewMemory(legacyMemory(old, time), time, 'fail');
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
    !state.reviewQuestionIds.includes(question.id)
  ) {
    state.reviewQuestionIds.push(question.id);
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
  // A finished lesson or review also exercises the skills it uses.
  const credit =
    outcome === 'lesson-passed' || outcome === 'review-passed'
      ? applyImplicitCredit(updated, item, time, catalog)
      : { progress: updated, credited: [] };
  return {
    ...credit.progress,
    attempts: [
      ...progress.attempts,
      credit.credited.length
        ? { ...attempt, credited: credit.credited }
        : attempt,
    ].slice(-MAX_RECENT_ATTEMPTS),
  };
}

export function getStats(
  progress: Progress,
  now: Now = new Date(),
  courseId?: string,
  catalog: CurriculumCatalog = defaultCatalog,
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
export function earnedFlashcards(
  progress: Progress,
  courseId?: string,
  catalog: CurriculumCatalog = defaultCatalog,
) {
  return courseSkills(courseId, catalog)
    .filter((item) => isMastered(progress, item.id, catalog))
    .flatMap((item) => item.flashcards);
}
