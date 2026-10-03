import {
  defaultCatalog,
  type ChoiceQuestion,
  type CurriculumCatalog,
  type Skill,
} from './curriculum';
import {
  activityDay,
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
import { earnedQuizXp, quizXp } from './xp';

// Quizzes are timed, mixed retrieval checks in the Math Academy pattern. One
// becomes available after QUIZ_XP_INTERVAL XP of other work. It draws fresh
// knowledge-point questions from skills the learner has mastered on the active
// course path, shows no lesson material or feedback until it ends, and turns
// every missed skill into a review that is due immediately.

/** XP of lessons and reviews between quizzes. */
export const QUIZ_XP_INTERVAL = 150;
export const QUIZ_MIN_QUESTIONS = 8;
export const QUIZ_TARGET_QUESTIONS = 10;
export const QUIZ_MAX_QUESTIONS = 12;
/** Each skill contributes at most this many questions. */
const QUESTIONS_PER_SKILL = 2;
export const QUIZ_SECONDS_PER_QUESTION = 90;
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

function choiceQuestions(skill: Skill) {
  return (skill.knowledgePoints ?? []).map((point) => ({
    point,
    questions: point.questions.filter(
      (question): question is ChoiceQuestion => question.type === 'choice',
    ),
  }));
}

/**
 * The questions the next quiz would ask, without creating it. Skills mastered
 * on the course path qualify, active course first; skills not quizzed
 * recently come first, then the most recently practiced. Each skill gives a
 * fresh variant (unseen first) from its least-practiced point, and a second
 * from another point only when there are too few skills.
 */
export function planQuiz(
  progress: Progress,
  courseId: string,
  catalog: CurriculumCatalog = defaultCatalog,
): QuizQuestion[] {
  const lastQuizzed = new Map<string, number>();
  for (const quiz of quizzesOf(progress))
    for (const question of quiz.questions)
      lastQuizzed.set(
        question.skillId,
        Math.max(lastQuizzed.get(question.skillId) ?? 0, quiz.createdAt),
      );
  const state = (id: string) => getSkillState(progress, id);
  const candidates = coursePath(courseId, catalog)
    .filter(
      (skill) =>
        choiceQuestions(skill).some((point) => point.questions.length) &&
        isMastered(progress, skill.id, catalog) &&
        isUnlocked(progress, skill.id, catalog),
    )
    .sort(
      (a, b) =>
        (lastQuizzed.get(a.id) ?? 0) - (lastQuizzed.get(b.id) ?? 0) ||
        Number(b.courseId === courseId) - Number(a.courseId === courseId) ||
        (state(b.id).lastPracticedAt ?? 0) -
          (state(a.id).lastPracticedAt ?? 0) ||
        a.order - b.order,
    );
  const skills = candidates.slice(0, QUIZ_TARGET_QUESTIONS);
  const perSkill = new Map<string, number>(
    skills.map((skill) => [skill.id, 0]),
  );
  const picked: QuizQuestion[] = [];
  const usedPoints = new Map<string, Set<string>>();
  const pick = (skill: Skill) => {
    const counts = seenCounts(progress, skill.id);
    const used = usedPoints.get(skill.id) ?? new Set<string>();
    const points = choiceQuestions(skill)
      .filter((entry) => entry.questions.length && !used.has(entry.point.id))
      .sort(
        (a, b) =>
          a.questions.reduce((n, q) => n + (counts.get(q.id) ?? 0), 0) -
          b.questions.reduce((n, q) => n + (counts.get(q.id) ?? 0), 0),
      );
    const entry = points[0];
    if (!entry) return false;
    const question = [...entry.questions].sort(
      (a, b) => (counts.get(a.id) ?? 0) - (counts.get(b.id) ?? 0),
    )[0];
    used.add(entry.point.id);
    usedPoints.set(skill.id, used);
    perSkill.set(skill.id, (perSkill.get(skill.id) ?? 0) + 1);
    picked.push({
      skillId: skill.id,
      questionId: question.id,
      presentation: counts.get(question.id) ?? 0,
    });
    return true;
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
    ? picked.slice(0, QUIZ_MAX_QUESTIONS)
    : [];
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
  catalog: CurriculumCatalog = defaultCatalog,
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
  catalog: CurriculumCatalog = defaultCatalog,
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

/** The catalog question a quiz slot asks. */
export function quizQuestion(
  slot: Pick<QuizQuestion, 'skillId' | 'questionId'>,
  catalog: CurriculumCatalog = defaultCatalog,
): { skill: Skill; question: ChoiceQuestion } | undefined {
  const skill = catalog.skills.find((item) => item.id === slot.skillId);
  const question = skill?.knowledgePoints
    ?.flatMap((point) => point.questions)
    .find((item) => item.id === slot.questionId);
  return skill && question?.type === 'choice' ? { skill, question } : undefined;
}

/** A missed skill's review becomes due now; nothing is unlearned yet. */
function remediate(state: SkillProgress, at: number): SkillProgress {
  return {
    ...state,
    dueAt: Math.min(state.dueAt ?? at, at),
    reviewQuestionIds: [],
    reviewHadHint: false,
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
  catalog: CurriculumCatalog = defaultCatalog,
  writerId?: string,
): Progress {
  const quiz = quizzesOf(progress).find((item) => item.id === quizId);
  if (!quiz || quiz.completedAt !== undefined) return progress;
  const at = time(now);
  if (at > quizDeadline(quiz)) return finishQuiz(progress, quizId, at, catalog);
  const slot = quiz.questions[index];
  if (!slot || slot.answer !== undefined) return progress;
  const skill = catalog.skills.find((item) => item.id === slot.skillId);
  const question = skill?.knowledgePoints
    ?.flatMap((point) => point.questions)
    .find((item) => item.id === slot.questionId);
  if (!skill || question?.type !== 'choice')
    throw new Error('This quiz question is not in the catalog.');
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
  const next: Progress = {
    ...progress,
    skills: { ...progress.skills, [skill.id]: state },
    attempts: [...progress.attempts, attempt].slice(-MAX_RECENT_ATTEMPTS),
    lastActivityDate: day.today,
    streak: day.streak,
    quizzes: replaceQuiz(progress, updated),
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
  catalog: CurriculumCatalog = defaultCatalog,
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
