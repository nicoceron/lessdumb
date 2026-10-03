import type {
  ChoiceQuestion,
  GraphCatalog,
  Skill,
  SkillOutline,
} from './curriculum';
import { defaultCatalog } from './catalog-index';
import { contentOf } from './content';
import {
  activityDay,
  applyImplicitCredit,
  coursePath,
  getSkillState,
  isMastered,
  isUnlocked,
  MAX_RECENT_ATTEMPTS,
  seenCounts,
  type Attempt,
  type Progress,
  type SkillProgress,
} from './learning';
import { createActivity, recordActivity } from './activity';
import { MISTAKE_WINDOW_MS, recentMistakes } from './remediation';
import { legacyMemory } from './retention';
import { earnedQuizXp, quizXp } from './xp';

// Quizzes are timed, mixed retrieval checks in the Math Academy pattern. One
// becomes available after QUIZ_XP_INTERVAL XP of other work. It draws fresh
// knowledge-point questions from skills the learner has mastered on the active
// course path, weakest and least recently quizzed first, shows no lesson
// material or feedback until it ends, and turns every missed skill into a
// review that is due immediately. Its length adapts: it ends after
// QUIZ_MIN_QUESTIONS when every answer is right and grows toward
// QUIZ_MAX_QUESTIONS while results are mixed (see quizContinues).

/** XP of lessons and reviews between quizzes. */
export const QUIZ_XP_INTERVAL = 150;
export const QUIZ_MIN_QUESTIONS = 8;
/** Questions planned when a quiz starts. */
export const QUIZ_TARGET_QUESTIONS = 10;
export const QUIZ_MAX_QUESTIONS = 14;
/** Each skill contributes at most this many questions. */
const QUESTIONS_PER_SKILL = 2;
export const QUIZ_SECONDS_PER_QUESTION = 90;
/** From the planned length on, this share correct or more ends the quiz. */
export const QUIZ_SOLID_ACCURACY = 0.85;
/** Below this share correct, more questions would only add more reviews. */
export const QUIZ_WEAK_ACCURACY = 0.5;
/** A skill not quizzed for this many days is fully stale. */
export const QUIZ_STALE_DAYS = 14;
/** FSRS stability, in days, at which a skill counts as half weak. */
export const QUIZ_STABILITY_DAYS = 7;
/** Priority bonus for the active course's own skills. */
const COURSE_BONUS = 0.2;
/** Priority bonus, when a quiz grows, for prerequisites of skills it missed. */
const MISSED_PREREQUISITE_BONUS = 0.5;
const DAY = 86_400_000;
/** Older quizzes are dropped; their XP stays in the learner's totals. */
export const MAX_SAVED_QUIZZES = 50;

export interface QuizQuestion {
  skillId: string;
  questionId: string;
  /** Seeds the shuffled choice order, so a reload shows the same order. */
  presentation: number;
  /** Authored index answered, or null when time ran out first. */
  answer?: number | null;
  correct?: boolean;
  answeredAt?: number;
}

export interface Quiz {
  id: string;
  number: number;
  courseId: string;
  createdAt: number;
  timeLimitMs: number;
  /** XP earned outside quizzes when this quiz was created. */
  xpMark: number;
  /** Base XP: what a perfect score earns. */
  possible: number;
  questions: QuizQuestion[];
  completedAt?: number;
  earned?: number;
}

type Now = Date | number;
const time = (now: Now) => (now instanceof Date ? now.getTime() : now);

const quizzesOf = (progress: Progress) => progress.quizzes ?? [];

/** XP from lessons and reviews: everything except quiz rewards. */
export function nonQuizXp(progress: Progress): number {
  return Math.max(
    0,
    progress.totalXp -
      quizzesOf(progress).reduce((sum, quiz) => sum + (quiz.earned ?? 0), 0),
  );
}

export function activeQuiz(progress: Progress): Quiz | undefined {
  return quizzesOf(progress).findLast((quiz) => quiz.completedAt === undefined);
}

export function quizDeadline(quiz: Quiz): number {
  return quiz.createdAt + quiz.timeLimitMs;
}

function choiceQuestions(skill: SkillOutline) {
  return (skill.knowledgePoints ?? []).map((point) => ({
    point,
    questions: point.questions.filter((question) => question.type === 'choice'),
  }));
}

/** A quiz question with its content; undefined until its course is loaded. */
function quizChoice(
  slot: Pick<QuizQuestion, 'skillId' | 'questionId'>,
  catalog: GraphCatalog,
): { skill: Skill; question: ChoiceQuestion } | undefined {
  const outline = catalog.skills.find((item) => item.id === slot.skillId);
  const skill = outline && contentOf(outline);
  const question = skill?.knowledgePoints
    ?.flatMap((point) => point.questions)
    .find((item) => item.id === slot.questionId);
  return skill && question?.type === 'choice' ? { skill, question } : undefined;
}

/**
 * How much a mastered skill needs checking, from 0 to 1: low FSRS stability
 * and recent mistakes (in any mode) both raise it.
 */
export function quizWeakness(
  progress: Progress,
  skillId: string,
  at: number,
): number {
  const memory = legacyMemory(getSkillState(progress, skillId), at);
  const unstable =
    QUIZ_STABILITY_DAYS / (QUIZ_STABILITY_DAYS + memory.stability);
  const mistakes = recentMistakes(
    progress,
    skillId,
    at - MISTAKE_WINDOW_MS,
    at,
  );
  return 1 - (1 - unstable) * 0.5 ** mistakes;
}

/** When each skill was last asked in a quiz. */
function lastQuizzed(progress: Progress): Map<string, number> {
  const last = new Map<string, number>();
  for (const quiz of quizzesOf(progress))
    for (const question of quiz.questions)
      last.set(
        question.skillId,
        Math.max(
          last.get(question.skillId) ?? 0,
          question.answeredAt ?? quiz.createdAt,
        ),
      );
  return last;
}

/**
 * How long since a skill was quizzed, from 0 (just now) to 1 (never, or
 * QUIZ_STALE_DAYS ago or more).
 */
export function quizStaleness(
  quizzedAt: number | undefined,
  at: number,
): number {
  if (quizzedAt === undefined) return 1;
  return Math.min(1, Math.max(0, at - quizzedAt) / (QUIZ_STALE_DAYS * DAY));
}

/**
 * Mastered skills on the course path that a quiz can ask, highest priority
 * first: weakness plus staleness, plus a bonus for the active course and for
 * `boosted` skills; ties go to the most recently practiced.
 */
export function rankQuizSkills(
  progress: Progress,
  courseId: string,
  at: number,
  catalog: GraphCatalog = defaultCatalog,
  boosted: Set<string> = new Set(),
): SkillOutline[] {
  const quizzed = lastQuizzed(progress);
  const state = (id: string) => getSkillState(progress, id);
  const candidates = coursePath(courseId, catalog).filter(
    (skill) =>
      choiceQuestions(skill).some((point) => point.questions.length) &&
      isMastered(progress, skill.id, catalog) &&
      isUnlocked(progress, skill.id, catalog),
  );
  const priority = new Map(
    candidates.map((skill) => [
      skill.id,
      quizWeakness(progress, skill.id, at) +
        quizStaleness(quizzed.get(skill.id), at) +
        (skill.courseId === courseId ? COURSE_BONUS : 0) +
        (boosted.has(skill.id) ? MISSED_PREREQUISITE_BONUS : 0),
    ]),
  );
  return candidates.sort(
    (a, b) =>
      priority.get(b.id)! - priority.get(a.id)! ||
      (state(b.id).lastPracticedAt ?? 0) - (state(a.id).lastPracticedAt ?? 0) ||
      a.order - b.order,
  );
}

/**
 * A fresh question from one of a skill's points not in `used`: the point with
 * the most recent mistakes, then the least practiced; within it, the variant
 * seen least, unseen first.
 */
function pickQuizQuestion(
  progress: Progress,
  skill: SkillOutline,
  used: Set<string>,
  at: number,
): { slot: QuizQuestion; point: string } | undefined {
  const counts = seenCounts(progress, skill.id);
  const missed = new Map<string, number>();
  for (const attempt of progress.attempts) {
    if (attempt.skillId !== skill.id || attempt.correct) continue;
    const when = Date.parse(attempt.at);
    if (when > at - MISTAKE_WINDOW_MS && when <= at)
      missed.set(attempt.questionId, (missed.get(attempt.questionId) ?? 0) + 1);
  }
  const total = (questions: { id: string }[], tally: Map<string, number>) =>
    questions.reduce((n, question) => n + (tally.get(question.id) ?? 0), 0);
  const entry = choiceQuestions(skill)
    .filter((item) => item.questions.length && !used.has(item.point.id))
    .sort(
      (a, b) =>
        total(b.questions, missed) - total(a.questions, missed) ||
        total(a.questions, counts) - total(b.questions, counts),
    )[0];
  if (!entry) return undefined;
  const question = [...entry.questions].sort(
    (a, b) => (counts.get(a.id) ?? 0) - (counts.get(b.id) ?? 0),
  )[0];
  return {
    slot: {
      skillId: skill.id,
      questionId: question.id,
      presentation: counts.get(question.id) ?? 0,
    },
    point: entry.point.id,
  };
}

/**
 * The questions the next quiz would ask, without creating it: one fresh
 * variant from each of the QUIZ_TARGET_QUESTIONS highest-priority skills (see
 * rankQuizSkills), and a second from another point only when there are too
 * few skills.
 */
export function planQuiz(
  progress: Progress,
  courseId: string,
  catalog: GraphCatalog = defaultCatalog,
  now: Now = Date.now(),
): QuizQuestion[] {
  const at = time(now);
  const skills = rankQuizSkills(progress, courseId, at, catalog).slice(
    0,
    QUIZ_TARGET_QUESTIONS,
  );
  const picked: QuizQuestion[] = [];
  const usedPoints = new Map<string, Set<string>>();
  const pick = (skill: SkillOutline) => {
    const used = usedPoints.get(skill.id) ?? new Set<string>();
    const found = pickQuizQuestion(progress, skill, used, at);
    if (!found) return;
    used.add(found.point);
    usedPoints.set(skill.id, used);
    picked.push(found.slot);
  };
  for (const skill of skills) pick(skill);
  // Too few skills: a second question from another point of each.
  for (
    let round = 1;
    round < QUESTIONS_PER_SKILL && picked.length < QUIZ_MIN_QUESTIONS;
    round++
  )
    for (const skill of skills) {
      if (picked.length >= QUIZ_MIN_QUESTIONS) break;
      pick(skill);
    }
  return picked.length >= QUIZ_MIN_QUESTIONS
    ? picked.slice(0, QUIZ_TARGET_QUESTIONS)
    : [];
}

/**
 * Whether a quiz with these results asks another question. It asks at least
 * QUIZ_MIN_QUESTIONS and at most QUIZ_MAX_QUESTIONS. With every answer right
 * the learner is clearly solid, so it ends at the minimum. Otherwise it
 * reaches the planned length, and from there continues only while results are
 * mixed: below QUIZ_SOLID_ACCURACY and at or above QUIZ_WEAK_ACCURACY. Mostly
 * wrong answers end it too, since every miss already schedules a review.
 */
export function quizContinues(results: boolean[]): boolean {
  const asked = results.length;
  const correct = results.filter(Boolean).length;
  if (asked < QUIZ_MIN_QUESTIONS) return true;
  if (asked >= QUIZ_MAX_QUESTIONS || correct === asked) return false;
  if (asked < QUIZ_TARGET_QUESTIONS) return true;
  const accuracy = correct / asked;
  return accuracy < QUIZ_SOLID_ACCURACY && accuracy >= QUIZ_WEAK_ACCURACY;
}

/**
 * The question that extends a quiz: from the highest-priority skill not yet
 * in it, with prerequisites of the skills it missed boosted, so a growing
 * quiz probes beneath its misses. When every skill is in, another point of a
 * skill answered correctly; undefined when nothing is left.
 */
export function nextQuizQuestion(
  progress: Progress,
  quiz: Quiz,
  now: Now = Date.now(),
  catalog: GraphCatalog = defaultCatalog,
): QuizQuestion | undefined {
  const at = time(now);
  const byId = new Map(catalog.skills.map((skill) => [skill.id, skill]));
  const missed = new Set(
    quiz.questions
      .filter((slot) => slot.correct === false)
      .map((slot) => slot.skillId),
  );
  const beneath = new Set(
    [...missed].flatMap((id) => byId.get(id)?.prerequisites ?? []),
  );
  const ranked = rankQuizSkills(progress, quiz.courseId, at, catalog, beneath);
  // The points each skill has already been asked about in this quiz.
  const asked = new Map<string, Set<string>>();
  for (const slot of quiz.questions) {
    const skill = byId.get(slot.skillId);
    const point = skill
      ? choiceQuestions(skill).find((entry) =>
          entry.questions.some((question) => question.id === slot.questionId),
        )?.point.id
      : undefined;
    const used = asked.get(slot.skillId) ?? new Set<string>();
    if (point) used.add(point);
    asked.set(slot.skillId, used);
  }
  for (const skill of ranked)
    if (!asked.has(skill.id)) {
      const found = pickQuizQuestion(progress, skill, new Set(), at);
      if (found) return found.slot;
    }
  for (const skill of ranked) {
    const used = asked.get(skill.id);
    if (!used || missed.has(skill.id) || used.size >= QUESTIONS_PER_SKILL)
      continue;
    const found = pickQuizQuestion(progress, skill, used, at);
    if (found) return found.slot;
  }
  return undefined;
}

export type QuizStatus =
  | { kind: 'active'; quiz: Quiz }
  | { kind: 'available'; number: number; questions: number; xp: number }
  | { kind: 'waiting'; xpToGo: number }
  | { kind: 'unavailable' };

/** Whether a quiz is under way, ready, or how much XP remains until one is. */
export function quizStatus(
  progress: Progress,
  courseId: string,
  catalog: GraphCatalog = defaultCatalog,
): QuizStatus {
  const active = activeQuiz(progress);
  if (active) return { kind: 'active', quiz: active };
  const last = quizzesOf(progress).at(-1);
  const earned = nonQuizXp(progress) - (last?.xpMark ?? 0);
  if (earned < QUIZ_XP_INTERVAL)
    return { kind: 'waiting', xpToGo: QUIZ_XP_INTERVAL - earned };
  const questions = planQuiz(progress, courseId, catalog).length;
  if (!questions) return { kind: 'unavailable' };
  return {
    kind: 'available',
    number: Math.max(0, ...quizzesOf(progress).map((quiz) => quiz.number)) + 1,
    questions,
    xp: quizXp(questions),
  };
}

/** Create the available quiz; the timer starts now. */
export function startQuiz(
  progress: Progress,
  courseId: string,
  now: Now = Date.now(),
  catalog: GraphCatalog = defaultCatalog,
): Progress {
  const status = quizStatus(progress, courseId, catalog);
  if (status.kind === 'active') return progress;
  if (status.kind !== 'available') throw new Error('No quiz is available yet.');
  const at = time(now);
  const questions = planQuiz(progress, courseId, catalog);
  const quiz: Quiz = {
    id: `quiz-${status.number}-${at}`,
    number: status.number,
    courseId,
    createdAt: at,
    timeLimitMs: questions.length * QUIZ_SECONDS_PER_QUESTION * 1000,
    xpMark: nonQuizXp(progress),
    possible: quizXp(questions.length),
    questions,
  };
  return {
    ...progress,
    quizzes: [...quizzesOf(progress), quiz].slice(-MAX_SAVED_QUIZZES),
  };
}

/**
 * The catalog question a quiz slot asks, with its content. Undefined for an
 * unknown question or while its skill's course is not loaded.
 */
export function quizQuestion(
  slot: Pick<QuizQuestion, 'skillId' | 'questionId'>,
  catalog: GraphCatalog = defaultCatalog,
): { skill: Skill; question: ChoiceQuestion } | undefined {
  return quizChoice(slot, catalog);
}

/** A missed skill's review becomes due now; nothing is unlearned yet. */
function remediate(state: SkillProgress, at: number): SkillProgress {
  // A miss outweighs any partial credit from dependents.
  const { implicitCredit: _credit, ...rest } = state;
  return {
    ...rest,
    dueAt: Math.min(state.dueAt ?? at, at),
    reviewQuestionIds: [],
    reviewHadHint: false,
    consecutiveCorrect: 0,
  };
}

function replaceQuiz(progress: Progress, quiz: Quiz): Quiz[] {
  return quizzesOf(progress).map((item) => (item.id === quiz.id ? quiz : item));
}

/**
 * Record one answer. A correct answer on a skill whose review is due counts
 * toward that review cycle, but only a review answer can complete the cycle;
 * on any other skill it changes no schedule, as with early practice. A wrong
 * answer makes the skill's review due now. Answering the last question, or
 * answering after the time limit, finishes the quiz.
 */
export function answerQuiz(
  progress: Progress,
  quizId: string,
  index: number,
  answer: number,
  now: Now = Date.now(),
  catalog: GraphCatalog = defaultCatalog,
  writerId?: string,
): Progress {
  const quiz = quizzesOf(progress).find((item) => item.id === quizId);
  if (!quiz || quiz.completedAt !== undefined) return progress;
  const at = time(now);
  if (at > quizDeadline(quiz)) return finishQuiz(progress, quizId, at, catalog);
  const slot = quiz.questions[index];
  if (!slot || slot.answer !== undefined) return progress;
  const found = quizChoice(slot, catalog);
  if (!found) throw new Error('This quiz question is not in the catalog.');
  const { skill, question } = found;
  if (
    !Number.isInteger(answer) ||
    answer < 0 ||
    answer >= question.choices.length
  )
    throw new Error('Unknown choice.');
  const correct = answer === question.answer;
  const old = getSkillState(progress, skill.id);
  let state: SkillProgress = {
    ...old,
    attempts: old.attempts + 1,
    correct: old.correct + (correct ? 1 : 0),
    consecutiveCorrect: correct ? old.consecutiveCorrect + 1 : 0,
    lastPracticedAt: at,
    lastQuestionId: question.id,
    activity: recordActivity(
      old.activity ?? createActivity(old.attempts, old.correct),
      correct,
      writerId,
    ),
  };
  const mastered = isMastered(progress, skill.id, catalog);
  const due = mastered && old.dueAt !== null && old.dueAt <= at;
  if (!correct && mastered) state = remediate(state, at);
  else if (correct && due && !state.reviewQuestionIds.includes(question.id))
    state = {
      ...state,
      reviewQuestionIds: [...state.reviewQuestionIds, question.id],
    };
  const attempt: Attempt = {
    id: crypto.randomUUID(),
    skillId: skill.id,
    questionId: question.id,
    correct,
    mode: 'quiz',
    usedHint: false,
    at: new Date(at).toISOString(),
    xp: 0,
    quizId,
  };
  const day = activityDay(progress, at);
  const updated: Quiz = {
    ...quiz,
    questions: quiz.questions.map((item, position) =>
      position === index ? { ...item, answer, correct, answeredAt: at } : item,
    ),
  };
  const answered: Progress = {
    ...progress,
    skills: { ...progress.skills, [skill.id]: state },
    lastActivityDate: day.today,
    streak: day.streak,
    quizzes: replaceQuiz(progress, updated),
  };
  // A correct answer also exercises the skills this one uses.
  const credit = correct
    ? applyImplicitCredit(answered, skill, at, catalog)
    : { progress: answered, credited: [] };
  const next: Progress = {
    ...credit.progress,
    attempts: [
      ...progress.attempts,
      credit.credited.length
        ? { ...attempt, credited: credit.credited }
        : attempt,
    ].slice(-MAX_RECENT_ATTEMPTS),
  };
  return updated.questions.every((item) => item.answer !== undefined)
    ? finishQuiz(next, quizId, at, catalog)
    : next;
}

/**
 * End a quiz: unanswered questions count as missed (their skills become due
 * now) and XP is paid by accuracy.
 */
export function finishQuiz(
  progress: Progress,
  quizId: string,
  now: Now = Date.now(),
  catalog: GraphCatalog = defaultCatalog,
): Progress {
  const quiz = quizzesOf(progress).find((item) => item.id === quizId);
  if (!quiz || quiz.completedAt !== undefined) return progress;
  const at = Math.min(time(now), quizDeadline(quiz));
  const skills = { ...progress.skills };
  const questions = quiz.questions.map((item) => {
    if (item.answer !== undefined) return item;
    if (isMastered(progress, item.skillId, catalog))
      skills[item.skillId] = remediate(
        getSkillState({ ...progress, skills }, item.skillId),
        at,
      );
    return { ...item, answer: null, correct: false };
  });
  const correct = questions.filter((item) => item.correct).length;
  const earned = earnedQuizXp(quiz.possible, correct, questions.length);
  const day = activityDay(progress, at);
  return {
    ...progress,
    skills,
    totalXp: progress.totalXp + earned,
    dailyXp: {
      ...progress.dailyXp,
      [day.today]: (progress.dailyXp[day.today] ?? 0) + earned,
    },
    lastActivityDate: day.today,
    streak: day.streak,
    quizzes: replaceQuiz(progress, {
      ...quiz,
      questions,
      completedAt: at,
      earned,
    }),
  };
}

/** One quiz from two devices: a finished copy wins, then the one with more answers. */
export function mergeQuiz(left: Quiz, right: Quiz): Quiz {
  const answered = (quiz: Quiz) =>
    quiz.questions.filter((item) => item.answer !== undefined).length;
  if ((left.completedAt !== undefined) !== (right.completedAt !== undefined))
    return left.completedAt !== undefined ? left : right;
  return answered(right) > answered(left) ? right : left;
}

/** Quizzes from two devices, by ID, oldest first. */
export function mergeQuizzes(left: Quiz[] = [], right: Quiz[] = []): Quiz[] {
  const byId = new Map<string, Quiz>();
  for (const quiz of [...left, ...right]) {
    const existing = byId.get(quiz.id);
    byId.set(quiz.id, existing ? mergeQuiz(existing, quiz) : quiz);
  }
  return [...byId.values()]
    .sort((a, b) => a.createdAt - b.createdAt || a.id.localeCompare(b.id))
    .slice(-MAX_SAVED_QUIZZES);
}
