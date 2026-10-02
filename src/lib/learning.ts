import {
  assessmentPolicy,
  defaultCatalog,
  type CurriculumCatalog,
  type Question,
  type Skill,
} from './curriculum';

export const DAY_MS = 86_400_000;
export const REVIEW_INTERVALS = [1, 3, 7, 14, 30, 60, 120] as const;

export interface SkillProgress {
  lessonSeen: boolean;
  attempts: number;
  correct: number;
  /** Distinct unassisted correct answers; required evidence for mastery. */
  questionIds: string[];
  /** Permanent ledger: relearning an already rewarded question earns no XP. */
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
}

export interface Attempt {
  id: string;
  skillId: string;
  questionId: string;
  correct: boolean;
  mode: 'learn' | 'review';
  usedHint: boolean;
  at: string;
  xp: number;
}

export interface Progress {
  version: 1;
  skills: Record<string, SkillProgress>;
  totalXp: number;
  dailyXp: Record<string, number>;
  lastActivityDate: string | null;
  streak: number;
  attempts: Attempt[];
  timeZone: string;
}

export interface AttemptInput {
  skillId: string;
  questionId: string;
  correct: boolean;
  mode: 'learn' | 'review';
  usedHint?: boolean;
  /** Stable event identity, generated before asynchronous grading completes. */
  attemptId?: string;
}

export interface NextTask {
  skillId: string;
  mode: 'learn' | 'review';
  questionId: string;
  reason: string;
}

type Now = Date | number | string;
const timestamp = (now: Now) => {
  const result = now instanceof Date ? now.getTime() : new Date(now).getTime();
  if (!Number.isFinite(result)) throw new Error('A valid date is required.');
  return result;
};

export function dateKey(now: Now = new Date(), timeZone = 'UTC'): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date(timestamp(now)));
  return `${parts.find((part) => part.type === 'year')!.value}-${parts.find((part) => part.type === 'month')!.value}-${parts.find((part) => part.type === 'day')!.value}`;
}

function previousDate(key: string): string {
  return new Date(Date.parse(`${key}T12:00:00Z`) - DAY_MS)
    .toISOString()
    .slice(0, 10);
}

export function emptyProgress(
  _now: Now = new Date(),
  timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
): Progress {
  // Validate the zone at creation rather than failing only after the first answer.
  dateKey(_now, timeZone);
  return {
    version: 1,
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
  const item = catalog.skills.find((skill) => skill.id === skillId);
  if (!item) return false;
  const state = getSkillState(progress, skillId);
  // Recompute from evidence so an inconsistent persisted numeric score cannot unlock a node.
  const policy = assessmentPolicy(item);
  return (
    item.questions.length > 0 &&
    item.questions.every((question) =>
      state.questionIds.includes(question.id),
    ) &&
    policy.requiredTypes.every((type) =>
      item.questions.some(
        (question) =>
          question.type === type && state.questionIds.includes(question.id),
      ),
    )
  );
}

export function isUnlocked(
  progress: Progress,
  skillId: string,
  catalog: CurriculumCatalog = defaultCatalog,
): boolean {
  const item = catalog.skills.find((skill) => skill.id === skillId);
  return (
    !!item &&
    item.prerequisites.every((prerequisite) =>
      isMastered(progress, prerequisite, catalog),
    )
  );
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

export function selectQuestion(
  progress: Progress,
  item: Skill,
  mode: 'learn' | 'review',
): Question {
  const state = getSkillState(progress, item.id);
  const evidence =
    mode === 'learn' ? state.questionIds : state.reviewQuestionIds;
  const available = item.questions.filter(
    (question) => !evidence.includes(question.id),
  );
  const candidates = available.length ? available : item.questions;
  const policy = assessmentPolicy(item);
  const missingTypes = policy.requiredTypes.filter(
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
export function nextTask(
  progress: Progress,
  now: Now = new Date(),
  courseId?: string,
  catalog: CurriculumCatalog = defaultCatalog,
): NextTask | null {
  const time = timestamp(now);
  const registry = coursePath(courseId, catalog);
  const lastSkill = progress.attempts.at(-1)?.skillId;
  const due = registry.filter(
    (item) =>
      isMastered(progress, item.id, catalog) &&
      isUnlocked(progress, item.id, catalog) &&
      getSkillState(progress, item.id).dueAt !== null &&
      getSkillState(progress, item.id).dueAt! <= time,
  );
  due.sort((a, b) => {
    // Keep the selected course's due retrieval ahead of its supporting ancestors.
    if (courseId && a.courseId === courseId && b.courseId !== courseId)
      return -1;
    if (courseId && b.courseId === courseId && a.courseId !== courseId)
      return 1;
    // Interleave due skills when several are available.
    if (a.id === lastSkill && b.id !== lastSkill) return 1;
    if (b.id === lastSkill && a.id !== lastSkill) return -1;
    return (
      (getSkillState(progress, a.id).dueAt ?? time) -
      (getSkillState(progress, b.id).dueAt ?? time)
    );
  });
  if (due.length) {
    const item = due[0];
    return {
      skillId: item.id,
      mode: 'review',
      questionId: selectQuestion(progress, item, 'review').id,
      reason:
        'This skill is due for spaced retrieval. Recall it before looking back at the lesson.',
    };
  }
  const ready = registry.filter(
    (item) =>
      !isMastered(progress, item.id, catalog) &&
      isUnlocked(progress, item.id, catalog),
  );
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
    reason: remediation.length
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
  const question = item.questions.find(
    (candidate) => candidate.id === input.questionId,
  );
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
  };
  const wasMastered = isMastered(progress, item.id, catalog);
  const policy = assessmentPolicy(item);
  const unassisted = input.correct && !input.usedHint;
  const reviewDue = wasMastered && old.dueAt !== null && old.dueAt <= time;
  let xp = 0;
  state.lessonSeen = true;
  state.attempts += 1;
  state.correct += input.correct ? 1 : 0;
  state.consecutiveCorrect = unassisted ? state.consecutiveCorrect + 1 : 0;
  state.lastPracticedAt = time;
  state.lastQuestionId = question.id;

  if (!input.correct) {
    state.questionIds = state.questionIds.filter((id) => id !== question.id);
    state.reviewQuestionIds = [];
    state.intervalDays = 0;
    state.dueAt = null;
  } else if (input.mode === 'learn' && unassisted && !wasMastered) {
    if (!state.questionIds.includes(question.id))
      state.questionIds.push(question.id);
    if (!state.rewardedQuestionIds.includes(question.id)) {
      xp = question.type === 'code' ? 15 : 10;
      state.rewardedQuestionIds.push(question.id);
    }
  } else if (
    input.mode === 'review' &&
    reviewDue &&
    unassisted &&
    !state.reviewQuestionIds.includes(question.id)
  ) {
    state.reviewQuestionIds.push(question.id);
    xp = question.type === 'code' ? 8 : 5;
    const includesRequiredTypes = policy.requiredTypes.every((type) =>
      state.reviewQuestionIds.some(
        (id) =>
          item.questions.find((candidate) => candidate.id === id)?.type ===
          type,
      ),
    );
    if (
      state.reviewQuestionIds.length >= policy.reviewAnswers &&
      includesRequiredTypes
    ) {
      state.reviewCount += 1;
      state.intervalDays =
        REVIEW_INTERVALS[
          Math.min(state.reviewCount, REVIEW_INTERVALS.length - 1)
        ];
      state.dueAt = time + state.intervalDays * DAY_MS;
      state.reviewQuestionIds = [];
    }
  }

  state.mastery =
    item.questions.filter((candidate) =>
      state.questionIds.includes(candidate.id),
    ).length / item.questions.length;
  if (state.mastery === 1 && !wasMastered) {
    state.learnedAt ??= new Date(time).toISOString();
    state.intervalDays = 1;
    state.dueAt = time + DAY_MS;
    state.reviewQuestionIds = [];
  }
  const today = dateKey(time, progress.timeZone || 'UTC');
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
  };
  return {
    ...progress,
    skills: { ...progress.skills, [item.id]: state },
    totalXp: progress.totalXp + xp,
    dailyXp: {
      ...progress.dailyXp,
      [today]: (progress.dailyXp[today] ?? 0) + xp,
    },
    lastActivityDate: today,
    streak,
    attempts: [...progress.attempts, attempt],
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
  return {
    todayXp: courseId
      ? attempts
          .filter(
            (attempt) =>
              dateKey(attempt.at, progress.timeZone || 'UTC') === today,
          )
          .reduce((sum, attempt) => sum + attempt.xp, 0)
      : (progress.dailyXp[today] ?? 0),
    totalXp: courseId
      ? attempts.reduce((sum, attempt) => sum + attempt.xp, 0)
      : progress.totalXp,
    mastered,
    started: registry.filter(
      (item) =>
        getSkillState(progress, item.id).lessonSeen ||
        getSkillState(progress, item.id).attempts > 0,
    ).length,
    accuracy: attempts.length
      ? attempts.filter((attempt) => attempt.correct).length / attempts.length
      : 0,
    dueCount: registry.filter(
      (item) =>
        isMastered(progress, item.id, catalog) &&
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
