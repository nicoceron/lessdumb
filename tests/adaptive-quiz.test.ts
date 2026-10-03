import { describe, expect, it } from 'vitest';
import { skillById, skills } from '../src/lib/curriculum';
import {
  DAY_MS,
  emptyProgress,
  getSkillState,
  type Attempt,
  type Progress,
  type SkillProgress,
} from '../src/lib/learning';
import {
  activeQuiz,
  answerQuiz,
  nextQuizQuestion,
  planQuiz,
  QUIZ_MAX_QUESTIONS,
  QUIZ_MIN_QUESTIONS,
  QUIZ_SECONDS_PER_QUESTION,
  QUIZ_TARGET_QUESTIONS,
  QUIZ_XP_INTERVAL,
  quizContinues,
  quizDeadline,
  quizQuestion,
  quizStaleness,
  quizWeakness,
  rankQuizSkills,
  startQuiz,
  type Quiz,
  type QuizQuestion,
} from '../src/lib/quiz';
import { earnedQuizXp, quizXp } from '../src/lib/xp';
import { rightAnswer, wrongAnswer } from './helpers/answers';
import { masterWithPrerequisites } from './helpers/mastery';

const NOW = Date.parse('2026-10-01T16:00:00Z');
const LEARNED = NOW - 30 * DAY_MS;
const COURSE = 'python-foundations';
// The first sixteen Python skills in teaching order, print-output to for-loops.
const MASTERED = skills
  .filter((skill) => skill.courseId === COURSE)
  .sort((a, b) => a.order - b.order)
  .slice(0, 16)
  .map((skill) => skill.id);

/** Reviewed three times, last ten days ago, next due in a month. */
function solid(state: SkillProgress): SkillProgress {
  return {
    ...state,
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

/** Sixteen equally solid skills, never quizzed, with a quiz earned. */
function baseline(): Progress {
  let progress = emptyProgress(LEARNED, 'UTC');
  for (const id of MASTERED)
    progress = masterWithPrerequisites(progress, id, LEARNED);
  return {
    ...progress,
    totalXp: Math.max(progress.totalXp, QUIZ_XP_INTERVAL),
    skills: Object.fromEntries(
      Object.entries(progress.skills).map(([id, state]) => [id, solid(state)]),
    ),
  };
}
const base = baseline();

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

/** A recent wrong answer on a question (any mode counts). */
function missed(
  progress: Progress,
  skillId: string,
  at: number,
  questionId = skillById[skillId].knowledgePoints![0].questions[0].id,
): Progress {
  const attempt: Attempt = {
    id: `miss-${questionId}-${at}`,
    skillId,
    questionId,
    correct: false,
    mode: 'review',
    usedHint: false,
    at: new Date(at).toISOString(),
    xp: 0,
  };
  return { ...progress, attempts: [...progress.attempts, attempt] };
}

const quizIn = (progress: Progress, quiz: Quiz) =>
  progress.quizzes!.find((item) => item.id === quiz.id)!;

/** Answer question `index` of the quiz as it is saved now. */
function answer(
  progress: Progress,
  quiz: Quiz,
  index: number,
  correct: boolean,
): Progress {
  const { question } = quizQuestion(quizIn(progress, quiz).questions[index])!;
  return answerQuiz(
    progress,
    quiz.id,
    index,
    correct ? rightAnswer(question) : wrongAnswer(question),
    NOW + (index + 1) * 10_000,
  );
}

/** Answer in order until the quiz ends, however long it grows. */
function answerUntilDone(
  progress: Progress,
  quiz: Quiz,
  correct: (index: number) => boolean,
): Progress {
  let result = progress;
  let index = quizIn(result, quiz).questions.findIndex(
    (slot) => slot.answer === undefined,
  );
  for (; quizIn(result, quiz).completedAt === undefined; index++)
    result = answer(result, quiz, index, correct(index));
  return result;
}

const slotFor = (skillId: string, correct?: boolean): QuizQuestion => ({
  skillId,
  questionId: skillById[skillId].knowledgePoints![0].questions[0].id,
  presentation: 0,
  ...(correct === undefined
    ? {}
    : { answer: 0, correct, answeredAt: NOW - 1000 }),
});

describe('quiz selection', () => {
  it('ranks equally solid skills in teaching order', () => {
    expect(Object.keys(base.skills)).toHaveLength(MASTERED.length);
    expect(rankQuizSkills(base, COURSE, NOW).map((skill) => skill.id)).toEqual(
      MASTERED,
    );
    expect(
      planQuiz(base, COURSE, undefined, NOW).map((slot) => slot.skillId),
    ).toEqual(MASTERED.slice(0, QUIZ_TARGET_QUESTIONS));
  });

  it('asks the weakest skills first: low FSRS stability and recent mistakes', () => {
    const [lowStability, recentlyMissed] = [MASTERED[15], MASTERED[14]];
    let progress = withSkill(base, lowStability, (state) => ({
      ...state,
      memory: { ...state.memory!, stability: 1 },
    }));
    progress = missed(progress, recentlyMissed, NOW - DAY_MS);
    progress = missed(progress, recentlyMissed, NOW - 2 * DAY_MS);
    expect(quizWeakness(progress, lowStability, NOW)).toBeGreaterThan(
      quizWeakness(base, lowStability, NOW),
    );
    expect(quizWeakness(progress, recentlyMissed, NOW)).toBeGreaterThan(
      quizWeakness(base, recentlyMissed, NOW),
    );
    // Mistakes older than two weeks no longer count.
    expect(
      quizWeakness(
        missed(base, recentlyMissed, NOW - 15 * DAY_MS),
        recentlyMissed,
        NOW,
      ),
    ).toBe(quizWeakness(base, recentlyMissed, NOW));
    const plan = planQuiz(progress, COURSE, undefined, NOW);
    expect(plan).toHaveLength(QUIZ_TARGET_QUESTIONS);
    // Last in teaching order, yet asked first; the tenth solid skill drops out.
    expect(plan.map((slot) => slot.skillId)).toEqual([
      lowStability,
      recentlyMissed,
      ...MASTERED.slice(0, QUIZ_TARGET_QUESTIONS - 2),
    ]);
  });

  it('asks skills not quizzed recently first', () => {
    const quizzed = MASTERED.slice(0, QUIZ_TARGET_QUESTIONS);
    const previous = (at: number): Quiz => ({
      id: 'quiz-1',
      number: 1,
      courseId: COURSE,
      createdAt: at,
      timeLimitMs: quizzed.length * QUIZ_SECONDS_PER_QUESTION * 1000,
      xpMark: 0,
      possible: quizXp(quizzed.length),
      questions: quizzed.map((id) => ({
        ...slotFor(id, true),
        answeredAt: at + 1000,
      })),
      completedAt: at + 60_000,
      earned: quizXp(quizzed.length),
    });
    const yesterday = { ...base, quizzes: [previous(NOW - DAY_MS)] };
    expect(
      planQuiz(yesterday, COURSE, undefined, NOW).map((slot) => slot.skillId),
    ).toEqual([
      ...MASTERED.slice(QUIZ_TARGET_QUESTIONS),
      ...quizzed.slice(0, 4),
    ]);
    // Staleness grows over two weeks; after that a quizzed skill counts as
    // never quizzed.
    expect(quizStaleness(undefined, NOW)).toBe(1);
    expect(quizStaleness(NOW - 7 * DAY_MS, NOW)).toBe(0.5);
    expect(quizStaleness(NOW - 30 * DAY_MS, NOW)).toBe(1);
    const monthAgo = { ...base, quizzes: [previous(NOW - 30 * DAY_MS)] };
    expect(planQuiz(monthAgo, COURSE, undefined, NOW)).toEqual(
      planQuiz(base, COURSE, undefined, NOW),
    );
  });

  it('asks the knowledge point the learner missed recently, with a fresh variant', () => {
    const id = MASTERED[0];
    const [first, second] = skillById[id].knowledgePoints!;
    const plain = planQuiz(base, COURSE, undefined, NOW).find(
      (slot) => slot.skillId === id,
    )!;
    expect(first.questions.map((question) => question.id)).toContain(
      plain.questionId,
    );
    const progress = missed(base, id, NOW - DAY_MS, second.questions[0].id);
    const slot = planQuiz(progress, COURSE, undefined, NOW).find(
      (item) => item.skillId === id,
    )!;
    expect(second.questions.map((question) => question.id)).toContain(
      slot.questionId,
    );
    expect(slot.questionId).not.toBe(second.questions[0].id);
  });
});

describe('adaptive quiz length', () => {
  const results = (right: number, wrong: number) => [
    ...Array<boolean>(right).fill(true),
    ...Array<boolean>(wrong).fill(false),
  ];

  it('decides from the results so far, within 8 to 14 questions', () => {
    expect([
      QUIZ_MIN_QUESTIONS,
      QUIZ_TARGET_QUESTIONS,
      QUIZ_MAX_QUESTIONS,
    ]).toEqual([8, 10, 14]);
    expect(quizContinues(results(7, 0))).toBe(true);
    // Every answer right: clearly solid, so stop at the minimum.
    expect(quizContinues(results(8, 0))).toBe(false);
    // A miss: reach the planned ten.
    expect(quizContinues(results(7, 1))).toBe(true);
    expect(quizContinues(results(8, 1))).toBe(true);
    // At ten, 90% is solid and under half is mostly wrong: stop.
    expect(quizContinues(results(9, 1))).toBe(false);
    expect(quizContinues(results(4, 6))).toBe(false);
    // Mixed: keep asking.
    expect(quizContinues(results(8, 2))).toBe(true);
    expect(quizContinues(results(5, 5))).toBe(true);
    expect(quizContinues(results(11, 2))).toBe(true);
    // Until the results become clear, or the maximum.
    expect(quizContinues(results(12, 1))).toBe(false);
    expect(quizContinues(results(5, 6))).toBe(false);
    expect(quizContinues(results(11, 3))).toBe(false);
  });

  it('ends after eight questions when every answer is right, paying 1.5 XP per question asked', () => {
    const started = startQuiz(base, COURSE, NOW);
    const quiz = activeQuiz(started)!;
    expect(quiz.questions).toHaveLength(QUIZ_TARGET_QUESTIONS);
    const done = answerUntilDone(started, quiz, () => true);
    const finished = quizIn(done, quiz);
    expect(finished.completedAt).toBe(NOW + QUIZ_MIN_QUESTIONS * 10_000);
    // The questions asked, in order; the two not reached are dropped.
    expect(
      finished.questions.map((slot) => [slot.questionId, slot.correct]),
    ).toEqual(
      quiz.questions
        .slice(0, QUIZ_MIN_QUESTIONS)
        .map((slot) => [slot.questionId, true]),
    );
    expect(finished.possible).toBe(quizXp(QUIZ_MIN_QUESTIONS));
    expect(finished.earned).toBe(quizXp(QUIZ_MIN_QUESTIONS));
    expect(done.totalXp).toBe(started.totalXp + quizXp(QUIZ_MIN_QUESTIONS));
    // The two questions never asked change nothing.
    for (const slot of quiz.questions.slice(QUIZ_MIN_QUESTIONS))
      expect(getSkillState(done, slot.skillId)).toEqual(
        getSkillState(started, slot.skillId),
      );
  });

  it('grows toward fourteen while results are mixed, adding 90 seconds and 1.5 XP per question', () => {
    const started = startQuiz(base, COURSE, NOW);
    const quiz = activeQuiz(started)!;
    let progress = started;
    // Three of the first ten wrong.
    for (let index = 0; index < QUIZ_TARGET_QUESTIONS; index++)
      progress = answer(progress, quiz, index, index >= 3);
    const grown = quizIn(progress, quiz);
    expect(grown.completedAt).toBeUndefined();
    expect(grown.questions).toHaveLength(11);
    expect(grown.timeLimitMs).toBe(11 * QUIZ_SECONDS_PER_QUESTION * 1000);
    expect(quizDeadline(grown)).toBe(
      NOW + 11 * QUIZ_SECONDS_PER_QUESTION * 1000,
    );
    expect(grown.possible).toBe(quizXp(11));
    // The added question comes from a skill the quiz had not asked yet.
    const asked = new Set(quiz.questions.map((slot) => slot.skillId));
    expect(asked.has(grown.questions[10].skillId)).toBe(false);

    const done = answerUntilDone(progress, quiz, () => true);
    const finished = quizIn(done, quiz);
    expect(finished.questions).toHaveLength(QUIZ_MAX_QUESTIONS);
    expect(new Set(finished.questions.map((slot) => slot.skillId)).size).toBe(
      QUIZ_MAX_QUESTIONS,
    );
    expect(finished.timeLimitMs).toBe(
      QUIZ_MAX_QUESTIONS * QUIZ_SECONDS_PER_QUESTION * 1000,
    );
    expect(finished.possible).toBe(quizXp(QUIZ_MAX_QUESTIONS));
    expect(finished.earned).toBe(
      earnedQuizXp(quizXp(QUIZ_MAX_QUESTIONS), 11, QUIZ_MAX_QUESTIONS),
    );
  });

  it('stops at ten when results are clear either way, and stops growing when they turn mostly wrong', () => {
    const started = startQuiz(base, COURSE, NOW);
    const quiz = activeQuiz(started)!;
    const length = (correct: (index: number) => boolean) =>
      quizIn(answerUntilDone(started, quiz, correct), quiz).questions.length;
    expect(length((index) => index !== 4)).toBe(QUIZ_TARGET_QUESTIONS);
    expect(length((index) => index >= 6)).toBe(QUIZ_TARGET_QUESTIONS);
    // Half right grows the quiz; one more miss ends it.
    expect(length((index) => index >= 5 && index < 10)).toBe(11);
  });

  it('probes beneath a miss when it grows', () => {
    // tuples (MASTERED[14]) uses indexing (MASTERED[13]).
    const tuples = MASTERED[14];
    const indexing = MASTERED[13];
    expect(skillById[tuples].prerequisites).toContain(indexing);
    const quiz = (tuplesCorrect: boolean): Quiz => ({
      id: 'quiz-2',
      number: 2,
      courseId: COURSE,
      createdAt: NOW,
      timeLimitMs: 10 * QUIZ_SECONDS_PER_QUESTION * 1000,
      xpMark: 0,
      possible: quizXp(10),
      questions: [
        ...MASTERED.slice(0, 9).map((id) => slotFor(id, true)),
        slotFor(tuples, tuplesCorrect),
      ],
    });
    // Otherwise the next skill in teaching order would come next.
    expect(nextQuizQuestion(base, quiz(true), NOW)?.skillId).toBe(MASTERED[9]);
    expect(nextQuizQuestion(base, quiz(false), NOW)?.skillId).toBe(indexing);
  });

  it('asks another point of a skill answered correctly once every skill is in', () => {
    const quiz: Quiz = {
      id: 'quiz-3',
      number: 3,
      courseId: COURSE,
      createdAt: NOW,
      timeLimitMs: MASTERED.length * QUIZ_SECONDS_PER_QUESTION * 1000,
      xpMark: 0,
      possible: quizXp(MASTERED.length),
      questions: MASTERED.map((id, index) => slotFor(id, index !== 0)),
    };
    const extra = nextQuizQuestion(base, quiz, NOW)!;
    // Not the missed skill: its review is due already.
    expect(extra.skillId).toBe(MASTERED[1]);
    const points = skillById[extra.skillId].knowledgePoints!;
    expect(points[0].questions.map((question) => question.id)).not.toContain(
      extra.questionId,
    );
  });
});
