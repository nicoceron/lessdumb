import type { Course, GraphCatalog, SkillOutline, Unit } from './curriculum';
import { defaultCatalog } from './catalog-index';
import { assessmentPolicy } from './catalog-outline';
import {
  coursePath,
  dateKey,
  getSkillState,
  isMastered,
  lessonCoolingDown,
  lessonState,
  lessonXpAvailable,
  MAX_CONSECUTIVE_REVIEWS,
  nextTask,
  reviewCoverage,
  reviewsSinceLesson,
  type Attempt,
  type Progress,
} from './learning';
import { quizStatus } from './quiz';
import { legacyMemory, recallProbability } from './retention';
import { lessonXp, REVIEW_XP } from './xp';

// Read-only views of learner state for the Learn and Courses pages. Nothing
// here changes scheduling or rewards; it orders and summarizes what the
// engine already decided and recorded.

type Now = Date | number;
const time = (now: Now) => (now instanceof Date ? now.getTime() : now);

function indexOf(catalog: GraphCatalog) {
  return new Map(catalog.skills.map((item) => [item.id, item]));
}

/** One traversal per pass; cycles and missing nodes fail closed, as in the engine. */
function unlockChecker(progress: Progress, catalog: GraphCatalog) {
  const byId = indexOf(catalog);
  const mastered = new Map<string, boolean>();
  const ready = new Map<string, boolean>();
  const visiting = new Set<string>();
  const masteredSkill = (id: string) => {
    if (!mastered.has(id)) mastered.set(id, isMastered(progress, id, catalog));
    return mastered.get(id)!;
  };
  function unlocked(id: string): boolean {
    const item = byId.get(id);
    if (!item || visiting.has(id)) return false;
    if (ready.has(id)) return ready.get(id)!;
    visiting.add(id);
    const result = item.prerequisites.every(
      (parent) => masteredSkill(parent) && unlocked(parent),
    );
    visiting.delete(id);
    ready.set(id, result);
    return result;
  }
  return { unlocked, mastered: masteredSkill };
}

export type SkillStatus = 'mastered' | 'in-progress' | 'ready' | 'locked';
export const skillStatusLabels: Record<SkillStatus, string> = {
  mastered: 'Mastered',
  'in-progress': 'In progress',
  ready: 'Ready to learn',
  locked: 'Locked',
};

/** Status circles share the graph's rule: a lapsed ancestor locks its descendants. */
export function skillStatuses(
  progress: Progress,
  catalog: GraphCatalog = defaultCatalog,
) {
  const check = unlockChecker(progress, catalog);
  return (skill: SkillOutline): SkillStatus => {
    if (!check.unlocked(skill.id)) return 'locked';
    const state = getSkillState(progress, skill.id);
    if (state.mastery >= 1) return 'mastered';
    return state.attempts > 0 || state.lessonSeen ? 'in-progress' : 'ready';
  };
}

export interface DashboardTask {
  skill: SkillOutline;
  mode: 'learn' | 'review';
  /** Base XP for the task, from the XP scale. */
  xp: number;
  /** A lesson already opened or answered, so the action resumes it. */
  started: boolean;
  /** Fraction of this task's evidence already collected. */
  progress: number;
}

/**
 * Up to `limit` frontier tasks in scheduler order: the engine's own next task
 * first, then due reviews interleaved with lessons (unfinished, then fresh):
 * at most MAX_CONSECUTIVE_REVIEWS reviews in a row while a lesson is ready.
 */
export function taskQueue(
  progress: Progress,
  courseId: string,
  now: Now = Date.now(),
  limit = 5,
  catalog: GraphCatalog = defaultCatalog,
): DashboardTask[] {
  const at = time(now);
  const byId = indexOf(catalog);
  const registry = coursePath(courseId, catalog);
  const check = unlockChecker(progress, catalog);
  const lastSkill = progress.attempts.at(-1)?.skillId;
  const state = (id: string) => getSkillState(progress, id);
  const courseFirst = (a: SkillOutline, b: SkillOutline) =>
    a.courseId === courseId && b.courseId !== courseId
      ? -1
      : b.courseId === courseId && a.courseId !== courseId
        ? 1
        : 0;
  const coverageCache = new Map<string, number>();
  const coverage = (item: SkillOutline) => {
    if (!coverageCache.has(item.id))
      coverageCache.set(item.id, reviewCoverage(progress, item, at, catalog));
    return coverageCache.get(item.id)!;
  };
  const recent = (a: SkillOutline, b: SkillOutline) =>
    (state(b.id).lastPracticedAt ?? 0) - (state(a.id).lastPracticedAt ?? 0);

  const due = registry
    .filter(
      (item) =>
        check.mastered(item.id) &&
        check.unlocked(item.id) &&
        state(item.id).dueAt !== null &&
        state(item.id).dueAt! <= at,
    )
    .sort((a, b) => {
      const order = courseFirst(a, b);
      if (order) return order;
      if (a.id === lastSkill && b.id !== lastSkill) return 1;
      if (b.id === lastSkill && a.id !== lastSkill) return -1;
      // Review compression, as in the engine.
      const covered = coverage(b) - coverage(a);
      if (covered) return covered;
      const left = state(a.id),
        right = state(b.id);
      return (
        recallProbability(legacyMemory(left, at), at) -
          recallProbability(legacyMemory(right, at), at) ||
        left.dueAt! - right.dueAt!
      );
    });
  // A lesson failed moments ago waits behind other work.
  const ready = registry.filter(
    (item) =>
      !check.mastered(item.id) &&
      check.unlocked(item.id) &&
      !lessonCoolingDown(progress, item.id, at),
  );
  const remediation = ready
    .filter((item) => state(item.id).learnedAt !== null)
    .sort(recent);
  const active = ready
    .filter((item) => state(item.id).attempts > 0 || state(item.id).lessonSeen)
    .sort(recent);
  const fresh = [...ready].sort(
    (a, b) => courseFirst(a, b) || a.order - b.order,
  );

  const head = nextTask(progress, at, courseId, catalog);
  const lessons = [...new Set([...remediation, ...active, ...fresh])];
  const ordered: { skill: SkillOutline; mode: 'learn' | 'review' }[] =
    head && byId.has(head.skillId)
      ? [{ skill: byId.get(head.skillId)!, mode: head.mode }]
      : [];
  // Continue the engine's rule past its first choice.
  let streak = reviewsSinceLesson(progress) + (head?.mode === 'review' ? 1 : 0);
  if (head?.mode === 'learn') streak = 0;
  const reviews = due.filter((skill) => skill.id !== head?.skillId);
  const learning = lessons.filter((skill) => skill.id !== head?.skillId);
  while (reviews.length || learning.length) {
    if (
      reviews.length &&
      (streak < MAX_CONSECUTIVE_REVIEWS || !learning.length)
    ) {
      ordered.push({ skill: reviews.shift()!, mode: 'review' });
      streak++;
    } else {
      ordered.push({ skill: learning.shift()!, mode: 'learn' });
      streak = 0;
    }
  }
  const seen = new Set<string>();
  const tasks: DashboardTask[] = [];
  for (const { skill, mode } of ordered) {
    if (seen.has(skill.id)) continue;
    seen.add(skill.id);
    const current = state(skill.id);
    const policy = assessmentPolicy(skill);
    tasks.push({
      skill,
      mode,
      xp: mode === 'review' ? REVIEW_XP : lessonXpAvailable(progress, skill),
      started: mode === 'learn' && (current.lessonSeen || current.attempts > 0),
      progress:
        mode === 'review'
          ? Math.min(
              1,
              current.reviewQuestionIds.length /
                Math.max(1, policy.reviewAnswers),
            )
          : lessonCompletion(progress, skill),
    });
    if (tasks.length >= limit) break;
  }
  return tasks;
}

/** Share of a lesson's steps passed so far, including an unfinished attempt. */
function lessonCompletion(progress: Progress, skill: SkillOutline): number {
  const steps = lessonState(progress, skill).steps;
  return (
    steps.filter((step) => step.status === 'done' || step.status === 'passed')
      .length / (steps.length || 1)
  );
}

const DAY = 86_400_000;
/** Calendar arithmetic on YYYY-MM-DD keys, independent of the host timezone. */
export function addDays(key: string, days: number): string {
  return new Date(Date.parse(`${key}T12:00:00Z`) + days * DAY)
    .toISOString()
    .slice(0, 10);
}
const weekday = (key: string) => new Date(`${key}T12:00:00Z`).getUTCDay();

export interface WeekDay {
  key: string;
  label: string;
  xp: number;
  today: boolean;
  future: boolean;
}

/** The learner's current Sunday–Saturday week, in their timezone. */
export function weekXp(progress: Progress, now: Now = Date.now()): WeekDay[] {
  const today = dateKey(time(now), progress.timeZone || 'UTC');
  const start = addDays(today, -weekday(today));
  return Array.from({ length: 7 }, (_, index) => {
    const key = addDays(start, index);
    return {
      key,
      label: 'SMTWTFS'[index],
      xp: progress.dailyXp[key] ?? 0,
      today: key === today,
      future: key > today,
    };
  });
}

export function todayXp(progress: Progress, now: Now = Date.now()): number {
  return progress.dailyXp[dateKey(time(now), progress.timeZone || 'UTC')] ?? 0;
}

/** Lesson XP still to earn on a course path, including cross-course prerequisites. */
export function remainingLessonXp(
  progress: Progress,
  courseId: string,
  catalog: GraphCatalog = defaultCatalog,
): number {
  return coursePath(courseId, catalog)
    .filter((item) => !isMastered(progress, item.id, catalog))
    .reduce((sum, item) => sum + lessonXp(item), 0);
}

export type CompletionEstimate =
  | { status: 'complete' }
  | { status: 'no-goal' }
  | { status: 'estimated'; dateKey: string; days: number };

/**
 * Remaining lesson XP divided by the daily goal, counted in learner-local
 * days. A goal already met today pushes the first working day to tomorrow.
 */
export function estimateCompletion(
  progress: Progress,
  dailyGoal: number,
  courseId: string,
  now: Now = Date.now(),
  catalog: GraphCatalog = defaultCatalog,
): CompletionEstimate {
  const remaining = remainingLessonXp(progress, courseId, catalog);
  if (remaining <= 0) return { status: 'complete' };
  if (!Number.isFinite(dailyGoal) || dailyGoal <= 0)
    return { status: 'no-goal' };
  const today = dateKey(time(now), progress.timeZone || 'UTC');
  const days = Math.ceil(remaining / dailyGoal);
  const offset = todayXp(progress, now) >= dailyGoal ? 1 : 0;
  return {
    status: 'estimated',
    dateKey: addDays(today, days - 1 + offset),
    days,
  };
}

export function formatMonthYear(key: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${key}T12:00:00Z`));
}

function ordinal(day: number) {
  const tens = day % 100;
  if (tens >= 11 && tens <= 13) return `${day}th`;
  return `${day}${['th', 'st', 'nd', 'rd'][day % 10] ?? 'th'}`;
}

/** "Wed, Sep 16th, 2026" for a YYYY-MM-DD key. */
export function formatDayHeading(key: string): string {
  const date = new Date(`${key}T12:00:00Z`);
  const part = (options: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat('en-US', { ...options, timeZone: 'UTC' }).format(
      date,
    );
  return `${part({ weekday: 'short' })}, ${part({ month: 'short' })} ${ordinal(date.getUTCDate())}, ${date.getUTCFullYear()}`;
}

export function formatClockTime(at: number, timeZone: string): string {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: timeZone || 'UTC',
  }).format(new Date(at));
}

export interface HistoryEntry {
  id: string;
  kind: 'lesson' | 'review' | 'quiz';
  /** The lesson or review's skill; quizzes span several skills. */
  skill?: SkillOutline;
  /** Quiz entries: "Quiz N" and the quiz's ID. */
  title?: string;
  quizId?: string;
  /** Completion time in epoch milliseconds. */
  at: number;
  /** XP the engine recorded for this task's answers. */
  earned: number;
  /** Base XP for the task, from the XP scale. */
  possible: number;
  /** Prerequisites this task gave implicit review credit. */
  credited?: number;
}

const attemptTime = (attempt: Attempt) => Date.parse(attempt.at);
const creditedBy = (attempts: Attempt[]) => {
  const ids = new Set(attempts.flatMap((attempt) => attempt.credited ?? []));
  return ids.size ? { credited: ids.size } : {};
};

/**
 * Completed lessons, reviews, and quizzes, newest first. Lessons and reviews
 * are reconstructed from the recent attempt log; quizzes from saved quizzes. A lesson completes when its skill was first learned; a due
 * review completes when its cycle was rescheduled without relearning.
 * Tasks whose answers have aged out of the bounded log are omitted.
 */
export function taskHistory(
  progress: Progress,
  catalog: GraphCatalog = defaultCatalog,
): HistoryEntry[] {
  const byId = indexOf(catalog);
  const attemptsBySkill = new Map<string, Attempt[]>();
  for (const attempt of progress.attempts) {
    const list = attemptsBySkill.get(attempt.skillId) ?? [];
    list.push(attempt);
    attemptsBySkill.set(attempt.skillId, list);
  }
  const entries: HistoryEntry[] = [];
  for (const [skillId, attempts] of attemptsBySkill) {
    const skill = byId.get(skillId);
    if (!skill) continue;
    attempts.sort((a, b) => attemptTime(a) - attemptTime(b));
    const current = getSkillState(progress, skillId);
    const learnedAt = current.learnedAt ? Date.parse(current.learnedAt) : NaN;
    if (Number.isFinite(learnedAt)) {
      const lesson = attempts.filter(
        (attempt) =>
          attempt.mode === 'learn' && attemptTime(attempt) <= learnedAt,
      );
      if (lesson.length)
        entries.push({
          id: `lesson:${skillId}`,
          kind: 'lesson',
          skill,
          at: learnedAt,
          earned: lesson.reduce((sum, attempt) => sum + attempt.xp, 0),
          possible: lessonXp(skill),
          ...creditedBy(lesson),
        });
    }
    const cycles = new Map<number, Attempt[]>();
    for (const attempt of attempts) {
      if (attempt.mode !== 'review' || attempt.reviewDueAt === undefined)
        continue;
      const list = cycles.get(attempt.reviewDueAt) ?? [];
      list.push(attempt);
      cycles.set(attempt.reviewDueAt, list);
    }
    const dueTimes = [...cycles.keys()].sort((a, b) => a - b);
    dueTimes.forEach((dueAt, index) => {
      const cycle = cycles.get(dueAt)!;
      const finished = attemptTime(cycle.at(-1)!);
      const nextCycle = dueTimes[index + 1];
      const rescheduled =
        nextCycle !== undefined ||
        (current.dueAt !== null && current.dueAt !== dueAt);
      const until = nextCycle
        ? attemptTime(cycles.get(nextCycle)![0])
        : Infinity;
      const relearned = attempts.some(
        (attempt) =>
          attempt.mode === 'learn' &&
          attemptTime(attempt) > finished &&
          attemptTime(attempt) < until,
      );
      if (!rescheduled || relearned) return;
      entries.push({
        id: `review:${skillId}:${dueAt}`,
        kind: 'review',
        skill,
        at: finished,
        earned: cycle.reduce((sum, attempt) => sum + attempt.xp, 0),
        possible: REVIEW_XP,
        ...creditedBy(cycle),
      });
    });
  }
  for (const quiz of progress.quizzes ?? [])
    if (quiz.completedAt !== undefined)
      entries.push({
        id: quiz.id,
        kind: 'quiz',
        title: `Quiz ${quiz.number}`,
        quizId: quiz.id,
        at: quiz.completedAt,
        earned: quiz.earned ?? 0,
        possible: quiz.possible,
      });
  return entries.sort((a, b) => b.at - a.at || a.id.localeCompare(b.id));
}

export interface QuizTask {
  number: number;
  /** Base XP: a perfect score. */
  xp: number;
  questions: number;
  /** A quiz already under way; the action resumes it. */
  started: boolean;
}

/** The quiz card on Learn: a quiz under way, or one now available. */
export function quizTask(
  progress: Progress,
  courseId: string,
  catalog: GraphCatalog = defaultCatalog,
): QuizTask | null {
  const status = quizStatus(progress, courseId, catalog);
  if (status.kind === 'active')
    return {
      number: status.quiz.number,
      xp: status.quiz.possible,
      questions: status.quiz.questions.length,
      started: true,
    };
  if (status.kind === 'available')
    return {
      number: status.number,
      xp: status.xp,
      questions: status.questions,
      started: false,
    };
  return null;
}

export function groupByDay(
  entries: HistoryEntry[],
  timeZone: string,
): { key: string; entries: HistoryEntry[] }[] {
  const days: { key: string; entries: HistoryEntry[] }[] = [];
  for (const entry of entries) {
    const key = dateKey(entry.at, timeZone || 'UTC');
    const last = days.at(-1);
    if (last?.key === key) last.entries.push(entry);
    else days.push({ key, entries: [entry] });
  }
  return days;
}

/**
 * Courses whose skills the selected course's path depends on, in prerequisite
 * order, ending with the selected course. Ties keep catalog order.
 */
export function courseSequence(
  courseId: string,
  catalog: GraphCatalog = defaultCatalog,
): Course[] {
  const target = catalog.courses.find((course) => course.id === courseId);
  if (!target) return [];
  const byId = indexOf(catalog);
  const path = coursePath(courseId, catalog);
  const dependsOn = new Map<string, Set<string>>();
  for (const item of path)
    for (const parent of item.prerequisites) {
      const from = byId.get(parent)?.courseId;
      if (!from || from === item.courseId) continue;
      const set = dependsOn.get(item.courseId) ?? new Set<string>();
      set.add(from);
      dependsOn.set(item.courseId, set);
    }
  const members = new Set(path.map((item) => item.courseId));
  const remaining = catalog.courses.filter(
    (course) => course.id !== courseId && members.has(course.id),
  );
  const ordered: Course[] = [];
  const placed = new Set<string>();
  while (remaining.length) {
    const index = remaining.findIndex((course) =>
      [...(dependsOn.get(course.id) ?? [])].every(
        (id) => id === courseId || id === course.id || placed.has(id),
      ),
    );
    const [next] = remaining.splice(Math.max(0, index), 1);
    ordered.push(next);
    placed.add(next.id);
  }
  return [...ordered, target];
}

export interface OutlineSkill {
  skill: SkillOutline;
  number: string;
  status: SkillStatus;
}
export interface OutlineTopic {
  id: string;
  title: string | null;
  number: string | null;
  skills: OutlineSkill[];
}
export interface OutlineUnit {
  unit: Unit;
  number: number;
  topics: OutlineTopic[];
  total: number;
  mastered: number;
}

/**
 * Units in course order with numbered skills: unit.topic.step for staged
 * courses, unit.skill otherwise.
 */
export function courseOutline(
  progress: Progress,
  courseId: string,
  catalog: GraphCatalog = defaultCatalog,
): OutlineUnit[] {
  const status = skillStatuses(progress, catalog);
  const byId = indexOf(catalog);
  return catalog.units
    .filter((unit) => unit.courseId === courseId)
    .map((unit, unitIndex) => {
      const number = unitIndex + 1;
      const members = catalog.skills.filter((item) => item.unitId === unit.id);
      const topics: OutlineTopic[] = [];
      members.forEach((item, index) => {
        if (item.topicId) {
          let topic = topics.find((entry) => entry.id === item.topicId);
          if (!topic) {
            topic = {
              id: item.topicId,
              title:
                item.topicTitle ?? byId.get(item.topicId)?.title ?? item.title,
              number: `${number}.${topics.length + 1}`,
              skills: [],
            };
            topics.push(topic);
          }
          topic.skills.push({
            skill: item,
            number: `${topic.number}.${item.stage ?? topic.skills.length + 1}`,
            status: status(item),
          });
        } else {
          let topic = topics.find((entry) => entry.id === unit.id);
          if (!topic) {
            topic = { id: unit.id, title: null, number: null, skills: [] };
            topics.push(topic);
          }
          topic.skills.push({
            skill: item,
            number: `${number}.${index + 1}`,
            status: status(item),
          });
        }
      });
      const all = topics.flatMap((topic) => topic.skills);
      return {
        unit,
        number,
        topics,
        total: all.length,
        mastered: all.filter((entry) =>
          isMastered(progress, entry.skill.id, catalog),
        ).length,
      };
    });
}

export function courseMastery(
  progress: Progress,
  course: Course,
  catalog: GraphCatalog = defaultCatalog,
) {
  const mastered = course.skillIds.filter((id) =>
    isMastered(progress, id, catalog),
  ).length;
  return {
    mastered,
    total: course.skillIds.length,
    percent: course.skillIds.length
      ? Math.floor((mastered / course.skillIds.length) * 100)
      : 0,
  };
}
