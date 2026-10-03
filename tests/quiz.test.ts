import { describe, expect, it } from 'vitest';
import { skillById } from '../src/lib/curriculum';
import {
  applyAttempt,
  DAY_MS,
  emptyProgress,
  getSkillState,
  isMastered,
  MAX_CONSECUTIVE_REVIEWS,
  nextTask,
  reviewsSinceLesson,
  selectQuestion,
  type Progress,
} from '../src/lib/learning';
import {
  activeQuiz,
  answerQuiz,
  finishQuiz,
  MAX_SAVED_QUIZZES,
  nonQuizXp,
  planQuiz,
  QUIZ_MAX_QUESTIONS,
  QUIZ_MIN_QUESTIONS,
  QUIZ_SECONDS_PER_QUESTION,
  QUIZ_XP_INTERVAL,
  quizDeadline,
  quizQuestion,
  quizStatus,
  startQuiz,
  type Quiz,
} from '../src/lib/quiz';
import { taskHistory, taskQueue } from '../src/lib/dashboard';
import { createState, mergeStates, type LearnerState } from '../src/lib/state';
import {
  MAX_STATE_BODY_BYTES,
  parseStateUpdate,
} from '../src/lib/server/state-validation';
import { earnedQuizXp, quizXp } from '../src/lib/xp';

const NOW = Date.parse('2026-10-01T16:00:00Z');
const COURSE = 'python-foundations';

/** Learn lessons in scheduler order until at least `xp` XP is earned. */
function learnUntil(progress: Progress, xp: number, at = NOW): Progress {
  let result = progress;
  for (let index = 0; nonQuizXp(result) < xp && index < 400; index++) {
    const task = nextTask(result, at, COURSE)!;
    expect(task.mode).toBe('learn');
    result = applyAttempt(result, { ...task, correct: true }, at);
  }
  return result;
}

const ready = learnUntil(emptyProgress(NOW, 'UTC'), QUIZ_XP_INTERVAL);

function answerAll(
  progress: Progress,
  quiz: Quiz,
  correct: (index: number) => boolean,
  at = NOW + 60_000,
) {
  let result = progress;
  quiz.questions.forEach((slot, index) => {
    const { question } = quizQuestion(slot)!;
    const answer = correct(index)
      ? question.answer
      : (question.answer + 1) % question.choices.length;
    result = answerQuiz(result, quiz.id, index, answer, at);
  });
  return result;
}

describe('quiz availability and content', () => {
  it('becomes available after 150 XP of lessons and reviews', () => {
    const before = learnUntil(emptyProgress(NOW, 'UTC'), 1);
    const status = quizStatus(before, COURSE);
    expect(status).toMatchObject({ kind: 'waiting' });
    if (status.kind === 'waiting')
      expect(status.xpToGo).toBe(QUIZ_XP_INTERVAL - nonQuizXp(before));
    const available = quizStatus(ready, COURSE);
    expect(available.kind).toBe('available');
    if (available.kind !== 'available') throw new Error('Expected a quiz.');
    expect(available.number).toBe(1);
    expect(available.questions).toBeGreaterThanOrEqual(QUIZ_MIN_QUESTIONS);
    expect(available.questions).toBeLessThanOrEqual(QUIZ_MAX_QUESTIONS);
    expect(available.xp).toBe(quizXp(available.questions));
  });

  it('asks fresh variants from mastered skills, one per skill when there are enough', () => {
    const plan = planQuiz(ready, COURSE);
    const answered = new Set(ready.attempts.map((a) => a.questionId));
    for (const slot of plan) {
      expect(isMastered(ready, slot.skillId)).toBe(true);
      expect(skillById[slot.skillId].courseId).toBe(COURSE);
      const found = quizQuestion(slot);
      expect(found?.question.type).toBe('choice');
      // Lessons used each point's first variants; quizzes draw unseen ones.
      expect(answered.has(slot.questionId)).toBe(false);
    }
    const skills = new Set(plan.map((slot) => slot.skillId));
    if (skills.size >= QUIZ_MIN_QUESTIONS)
      expect(skills.size).toBe(plan.length);
    // The same progress always plans the same quiz.
    expect(planQuiz(ready, COURSE)).toEqual(plan);
  });

  it('starts a timed quiz once and hides no question behind a lesson', () => {
    const started = startQuiz(ready, COURSE, NOW);
    const quiz = activeQuiz(started)!;
    expect(quiz).toMatchObject({ number: 1, courseId: COURSE, createdAt: NOW });
    expect(quiz.timeLimitMs).toBe(
      quiz.questions.length * QUIZ_SECONDS_PER_QUESTION * 1000,
    );
    expect(quiz.possible).toBe(quizXp(quiz.questions.length));
    expect(quizStatus(started, COURSE)).toEqual({ kind: 'active', quiz });
    expect(startQuiz(started, COURSE, NOW + 1)).toBe(started);
    expect(() => startQuiz(emptyProgress(NOW, 'UTC'), COURSE, NOW)).toThrow(
      'No quiz is available yet.',
    );
  });
});

describe('taking a quiz', () => {
  const started = startQuiz(ready, COURSE, NOW);
  const quiz = activeQuiz(started)!;

  it('pays base XP scaled by accuracy once the last question is answered', () => {
    expect(quizXp(10)).toBe(15);
    expect(earnedQuizXp(15, 9, 10)).toBe(14);
    expect(earnedQuizXp(15, 0, 10)).toBe(0);
    const total = quiz.questions.length;
    const partial = answerAll(started, quiz, (index) => index !== 0);
    const finished = partial.quizzes!.find((item) => item.id === quiz.id)!;
    expect(finished.completedAt).toBe(NOW + 60_000);
    expect(finished.earned).toBe(earnedQuizXp(quiz.possible, total - 1, total));
    expect(partial.totalXp).toBe(ready.totalXp + finished.earned!);
    expect(partial.dailyXp['2026-10-01']).toBe(
      ready.dailyXp['2026-10-01'] + finished.earned!,
    );
    expect(activeQuiz(partial)).toBeUndefined();
    const answers = partial.attempts.filter((a) => a.quizId === quiz.id);
    expect(answers).toHaveLength(total);
    expect(answers.every((a) => a.mode === 'quiz' && a.xp === 0)).toBe(true);
    // A finished quiz takes no more answers.
    expect(answerQuiz(partial, quiz.id, 0, 0, NOW + 61_000)).toBe(partial);
  });

  it('turns a miss into a review due now without unlearning, and leaves correct skills on schedule', () => {
    const missedSkill = quiz.questions[0].skillId;
    const correctSkill = quiz.questions[1].skillId;
    const at = NOW + 60_000;
    const after = answerAll(started, quiz, (index) => index !== 0, at);
    const missed = getSkillState(after, missedSkill);
    expect(isMastered(after, missedSkill)).toBe(true);
    expect(missed.dueAt).toBe(at);
    expect(missed.memory).toEqual(getSkillState(ready, missedSkill).memory);
    expect(getSkillState(after, correctSkill).dueAt).toBe(
      getSkillState(ready, correctSkill).dueAt,
    );
    expect(getSkillState(after, correctSkill).memory).toEqual(
      getSkillState(ready, correctSkill).memory,
    );
    const task = nextTask(after, at, COURSE)!;
    expect(task).toMatchObject({ skillId: missedSkill, mode: 'review' });
    // The remedial review is an ordinary review: passing it reschedules.
    let reviewed = after;
    for (
      let index = 0;
      getSkillState(reviewed, missedSkill).reviewCount === missed.reviewCount &&
      index < 8;
      index++
    )
      reviewed = applyAttempt(
        reviewed,
        {
          skillId: missedSkill,
          questionId: selectQuestion(reviewed, skillById[missedSkill], 'review')
            .id,
          correct: true,
          mode: 'review',
        },
        at + 1,
      );
    expect(getSkillState(reviewed, missedSkill).dueAt).toBeGreaterThan(at);
  });

  it('counts correct answers toward a due review cycle without completing it', () => {
    const due = NOW + 3 * DAY_MS;
    const lateQuiz = { ...quiz, createdAt: due };
    const late = {
      ...started,
      quizzes: [lateQuiz],
    };
    const slot = lateQuiz.questions[0];
    const { question } = quizQuestion(slot)!;
    const after = answerQuiz(late, quiz.id, 0, question.answer, due + 1);
    const state = getSkillState(after, slot.skillId);
    expect(state.reviewQuestionIds).toEqual([question.id]);
    expect(state.reviewCount).toBe(
      getSkillState(ready, slot.skillId).reviewCount,
    );
    expect(state.memory).toEqual(getSkillState(ready, slot.skillId).memory);
  });

  it('finishes at the time limit, counting unanswered questions as missed', () => {
    const first = quizQuestion(quiz.questions[0])!.question;
    let progress = answerQuiz(started, quiz.id, 0, first.answer, NOW + 1000);
    const deadline = quizDeadline(quiz);
    // An answer after the deadline is not recorded; the quiz ends instead.
    progress = answerQuiz(progress, quiz.id, 1, 0, deadline + 5000);
    const ended = progress.quizzes!.find((item) => item.id === quiz.id)!;
    expect(ended.completedAt).toBe(deadline);
    expect(ended.questions[0].correct).toBe(true);
    expect(ended.questions.slice(1).every((slot) => slot.answer === null)).toBe(
      true,
    );
    expect(ended.earned).toBe(
      earnedQuizXp(quiz.possible, 1, quiz.questions.length),
    );
    for (const slot of quiz.questions.slice(1))
      expect(getSkillState(progress, slot.skillId).dueAt).toBe(deadline);
    expect(finishQuiz(progress, quiz.id, deadline + 1)).toBe(progress);
  });

  it('offers the next quiz after another 150 XP of other work, not of quiz XP', () => {
    const done = answerAll(started, quiz, () => true);
    expect(quizStatus(done, COURSE).kind).toBe('waiting');
    const more = learnUntil(done, nonQuizXp(done) + QUIZ_XP_INTERVAL);
    const next = quizStatus(more, COURSE);
    expect(next).toMatchObject({ kind: 'available', number: 2 });
    // Skills just quizzed go to the back of the line.
    const plan = planQuiz(more, COURSE);
    const quizzed = new Set(quiz.questions.map((slot) => slot.skillId));
    const fresh = plan.filter((slot) => !quizzed.has(slot.skillId));
    expect(plan.slice(0, fresh.length)).toEqual(fresh);
  });

  it('appears in history as Quiz N with earned and possible XP', () => {
    const done = answerAll(started, quiz, (index) => index > 1);
    const entry = taskHistory(done).find((item) => item.kind === 'quiz')!;
    const finished = done.quizzes![0];
    expect(entry).toMatchObject({
      title: 'Quiz 1',
      quizId: quiz.id,
      at: finished.completedAt,
      earned: finished.earned,
      possible: quiz.possible,
    });
    expect(entry.skill).toBeUndefined();
  });
});

describe('quiz persistence', () => {
  const started = startQuiz(ready, COURSE, NOW);
  const quiz = activeQuiz(started)!;
  const state = (progress: Progress, updatedAt: number): LearnerState => ({
    ...createState(),
    progress,
    createdAt: NOW,
    updatedAt,
  });

  it('validates saved quizzes and migrates accounts from before quizzes', () => {
    const done = state(
      answerAll(started, quiz, () => true),
      NOW + 1,
    );
    expect(parseStateUpdate({ state: done, revision: 0 }).state).toEqual(done);
    const reject = (mutate: (copy: LearnerState) => void) => {
      const copy = structuredClone(done);
      mutate(copy);
      expect(() => parseStateUpdate({ state: copy, revision: 0 })).toThrow();
    };
    reject((copy) => {
      copy.progress.quizzes![0].earned = copy.progress.quizzes![0].possible + 1;
    });
    reject((copy) => {
      delete copy.progress.quizzes![0].questions[0].correct;
    });
    reject((copy) => {
      (copy.progress.quizzes![0] as unknown as { secret: string }).secret = 'x';
    });
    reject((copy) => {
      (copy.progress.attempts.at(-1) as { mode: string }).mode = 'exam';
    });
    const v2 = {
      ...createState(),
      version: 2,
      progress: { ...createState().progress, version: 2 },
    };
    const migrated = parseStateUpdate({ state: v2, revision: 0 }).state;
    expect(migrated.version).toBe(3);
    expect(migrated.progress.version).toBe(3);
    expect(migrated.progress.quizzes).toBeUndefined();
  });

  it('merges a quiz taken across devices once, with its XP once', () => {
    const local = state(
      answerAll(started, quiz, () => true),
      NOW + 2,
    );
    const remote = state(started, NOW + 1);
    const merged = mergeStates(local, remote);
    expect(merged.progress.quizzes).toHaveLength(1);
    expect(merged.progress.quizzes![0].completedAt).toBeDefined();
    expect(merged.progress.totalXp).toBe(local.progress.totalXp);
    expect(mergeStates(merged, local).progress.totalXp).toBe(
      local.progress.totalXp,
    );
    expect(mergeStates(remote, local)).toEqual(mergeStates(local, remote));
  });

  it('keeps both devices’ different quizzes and their XP', () => {
    const left = state(
      answerAll(started, quiz, () => true),
      NOW + 2,
    );
    const other = startQuiz(ready, COURSE, NOW + 5);
    const otherQuiz = activeQuiz(other)!;
    const right = state(
      answerAll(other, otherQuiz, () => true, NOW + 70_000),
      NOW + 3,
    );
    const merged = mergeStates(left, right);
    expect(merged.progress.quizzes!.map((item) => item.id)).toEqual([
      quiz.id,
      otherQuiz.id,
    ]);
    expect(merged.progress.totalXp).toBe(
      ready.totalXp + quiz.possible + otherQuiz.possible,
    );
  });

  it('keeps only the latest quizzes, well inside the state size cap', () => {
    let progress = ready;
    for (let index = 0; index < MAX_SAVED_QUIZZES + 5; index++) {
      const at = NOW + index * 1000;
      // Stand in for another 150 XP of lessons and reviews.
      progress = { ...progress, totalXp: progress.totalXp + QUIZ_XP_INTERVAL };
      progress = startQuiz(progress, COURSE, at);
      progress = finishQuiz(progress, activeQuiz(progress)!.id, at + 500);
    }
    expect(progress.quizzes).toHaveLength(MAX_SAVED_QUIZZES);
    expect(progress.quizzes!.at(-1)!.number).toBe(MAX_SAVED_QUIZZES + 5);
    const saved = state(progress, NOW + 1);
    expect(parseStateUpdate({ state: saved, revision: 0 }).state).toEqual(
      saved,
    );
    expect(JSON.stringify(progress.quizzes).length).toBeLessThan(
      MAX_STATE_BODY_BYTES / 20,
    );
  });

  it('never removes lesson evidence because of a quiz miss, even after a merge', () => {
    const missed = state(
      answerAll(started, quiz, () => false),
      NOW + 2,
    );
    const merged = mergeStates(missed, state(ready, NOW + 1));
    for (const slot of quiz.questions)
      expect(isMastered(merged.progress, slot.skillId)).toBe(true);
    expect(
      getSkillState(merged.progress, quiz.questions[0].skillId).dueAt,
    ).toBe(NOW + 60_000);
  });
});

describe('interleaving reviews with lessons', () => {
  // Everything learned is due two days later, and lessons remain ready.
  const due = NOW + 2 * DAY_MS;

  function review(progress: Progress, skillId: string, at: number) {
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
    return result;
  }

  it('allows at most two reviews in a row while a lesson is ready', () => {
    let progress = ready;
    expect(reviewsSinceLesson(progress)).toBe(0);
    const seen: ('learn' | 'review')[] = [];
    for (let step = 0; step < 6; step++) {
      const task = nextTask(progress, due, COURSE)!;
      seen.push(task.mode);
      if (task.mode === 'review')
        progress = review(progress, task.skillId, due);
      else
        for (
          let index = 0;
          !isMastered(progress, task.skillId) && index < 40;
          index++
        )
          progress = applyAttempt(
            progress,
            {
              skillId: task.skillId,
              questionId: selectQuestion(
                progress,
                skillById[task.skillId],
                'learn',
              ).id,
              correct: true,
              mode: 'learn',
            },
            due,
          );
    }
    expect(MAX_CONSECUTIVE_REVIEWS).toBe(2);
    expect(seen).toEqual([
      'review',
      'review',
      'learn',
      'review',
      'review',
      'learn',
    ]);
  });

  it('keeps reviews first in a review session and when no lesson is ready', () => {
    let progress = ready;
    for (let index = 0; index < 2; index++)
      progress = review(
        progress,
        nextTask(progress, due, COURSE)!.skillId,
        due,
      );
    expect(reviewsSinceLesson(progress)).toBe(2);
    expect(nextTask(progress, due, COURSE)?.mode).toBe('learn');
    expect(
      nextTask(progress, due, COURSE, undefined, { reviewsOnly: true })?.mode,
    ).toBe('review');
  });

  it('orders the Learn task list by the same rule', () => {
    const tasks = taskQueue(ready, COURSE, due, 5);
    expect(tasks.map((task) => task.mode)).toEqual([
      'review',
      'review',
      'learn',
      'review',
      'review',
    ]);
    // Due skills still interleave: no skill appears twice.
    expect(new Set(tasks.map((task) => task.skill.id)).size).toBe(5);
  });
});
