import { describe, expect, it } from 'vitest';
import {
  skillById,
  skills,
  type ChoiceQuestion,
  type CurriculumCatalog,
  type Skill,
} from '../src/lib/curriculum';
import {
  applyAttempt,
  DAY_MS,
  earnedFlashcards,
  emptyProgress,
  getSkillState,
  isMastered,
  isUnlocked,
  LESSON_RETRY_DELAY_MS,
  lessonCoolingDown,
  lessonState,
  lessonXpAvailable,
  nextTask,
  selectQuestion,
  type Progress,
  STATE_VERSION,
} from '../src/lib/learning';
import {
  authoredChoice,
  choiceOrder,
  choiceLetter,
} from '../src/lib/choice-order';
import {
  legacyQuestionIds,
  lessonSteps,
  reviewCycleComplete,
  servedChoiceQuestions,
} from '../src/lib/lesson-plan';
import {
  createState,
  mergeStates,
  migrateState,
  recordLearningAnswer,
  type LearnerState,
  type LegacyLearnerState,
} from '../src/lib/state';
import {
  MAX_STATE_BODY_BYTES,
  parseStateUpdate,
} from '../src/lib/server/state-validation';
import { earnedXp, lessonXp, REVIEW_XP } from '../src/lib/xp';
import { masterSkill } from './helpers/mastery';

const NOW = Date.parse('2026-10-01T16:00:00Z');
const skill = skillById['print-output'];
const [p1, p2] = skill.knowledgePoints!;
const code = skill.questions.find((question) => question.type === 'code')!;
const PERFECT_LESSON = earnedXp(lessonXp(skill), 0, true);

function fresh() {
  return emptyProgress(NOW, 'UTC');
}
function answer(
  progress: Progress,
  questionId: string,
  correct = true,
  at = NOW,
  mode: 'learn' | 'review' = 'learn',
  skillId = skill.id,
) {
  return applyAttempt(progress, { skillId, questionId, correct, mode }, at);
}
function stepStatus(progress: Progress) {
  return lessonState(progress, skill).steps.map((step) => step.status);
}

describe('knowledge-point lessons', () => {
  it('passes each point with two correct answers and masters the skill after its code exercise', () => {
    let progress = fresh();
    expect(lessonSteps(skill).map((step) => step.id)).toEqual([
      p1.id,
      p2.id,
      code.id,
    ]);
    const task = nextTask(progress, NOW, 'python-foundations')!;
    expect(task).toMatchObject({ skillId: skill.id, mode: 'learn' });
    expect(task.questionId).toBe(p1.questions[0].id);

    progress = answer(progress, p1.questions[0].id);
    expect(stepStatus(progress)).toEqual(['current', 'todo', 'todo']);
    // A second correct answer must come from a different variant.
    expect(selectQuestion(progress, skill, 'learn').id).toBe(
      p1.questions[1].id,
    );
    progress = answer(progress, p1.questions[0].id);
    expect(stepStatus(progress)).toEqual(['current', 'todo', 'todo']);
    progress = answer(progress, p1.questions[1].id);
    expect(stepStatus(progress)).toEqual(['passed', 'current', 'todo']);
    // Point progress is provisional until the whole lesson passes.
    expect(getSkillState(progress, skill.id).questionIds).toEqual([]);
    expect(getSkillState(progress, skill.id).mastery).toBe(0);
    expect(isUnlocked(progress, 'variables')).toBe(false);

    progress = answer(progress, p2.questions[0].id);
    progress = answer(progress, p2.questions[1].id);
    expect(stepStatus(progress)).toEqual(['passed', 'passed', 'current']);
    expect(selectQuestion(progress, skill, 'learn').id).toBe(code.id);
    expect(progress.totalXp).toBe(0);
    expect(progress.attempts.every((attempt) => attempt.xp === 0)).toBe(true);

    progress = answer(progress, code.id, true, NOW + 60_000);
    const state = getSkillState(progress, skill.id);
    expect(isMastered(progress, skill.id)).toBe(true);
    expect(state.questionIds).toEqual([p1.id, p2.id, code.id]);
    expect(state.mastery).toBe(1);
    expect(state.lessonAttempt).toBeUndefined();
    expect(state.lessonRewarded).toBe(true);
    expect(state.dueAt).toBe(NOW + 60_000 + DAY_MS);
    expect(state.memory).toMatchObject({ reps: 1, lapses: 0 });
    expect(progress.attempts.at(-1)).toMatchObject({
      questionId: code.id,
      outcome: 'lesson-passed',
      xp: PERFECT_LESSON,
    });
    expect(progress.totalXp).toBe(PERFECT_LESSON);
    expect(isUnlocked(progress, 'variables')).toBe(true);
    expect(earnedFlashcards(progress)).toHaveLength(skill.flashcards.length);
  });

  it('serves no legacy choice question and ignores answers to a later point', () => {
    const progress = fresh();
    // The four-question lesson's choice questions are retired (CEN-117).
    const [retired] = legacyQuestionIds(skill);
    expect(skill.questions.map((question) => question.id)).not.toContain(
      retired,
    );
    expect(() => answer(progress, retired)).toThrow(
      'This question does not belong to the skill.',
    );
    const skipped = answer(progress, p2.questions[0].id);
    expect(stepStatus(skipped)).toEqual(['current', 'todo', 'todo']);
    expect(getSkillState(skipped, skill.id).lessonAttempt).toBeUndefined();
  });

  it('deducts XP for misses below the failure threshold', () => {
    let progress = fresh();
    progress = answer(progress, p1.questions[0].id, false);
    progress = answer(progress, p1.questions[1].id);
    progress = answer(progress, p1.questions[2].id, false);
    progress = answer(progress, p1.questions[3].id);
    progress = answer(progress, p2.questions[0].id);
    progress = answer(progress, p2.questions[1].id);
    progress = answer(progress, code.id, false);
    progress = answer(progress, code.id);
    expect(isMastered(progress, skill.id)).toBe(true);
    expect(progress.attempts.at(-1)?.xp).toBe(
      earnedXp(lessonXp(skill), 3, true),
    );
    expect(progress.totalXp).toBe(lessonXp(skill) - 3);
  });

  it('fails the attempt on the third miss on one point, keeps nothing from it, and restarts at the first point', () => {
    let progress = fresh();
    progress = answer(progress, p1.questions[0].id);
    progress = answer(progress, p1.questions[1].id);
    progress = answer(progress, p2.questions[0].id, false);
    progress = answer(progress, p2.questions[1].id);
    progress = answer(progress, p2.questions[2].id, false);
    expect(stepStatus(progress)).toEqual(['passed', 'current', 'todo']);
    progress = answer(progress, p2.questions[3].id, false, NOW + 5);
    const state = getSkillState(progress, skill.id);
    expect(progress.attempts.at(-1)).toMatchObject({
      outcome: 'lesson-failed',
      xp: 0,
    });
    expect(state.lessonFailedAt).toBe(NOW + 5);
    expect(state.lessonAttempt).toBeUndefined();
    expect(state.questionIds).toEqual([]);
    expect(progress.totalXp).toBe(0);
    expect(stepStatus(progress)).toEqual(['current', 'todo', 'todo']);
    // The retry starts from the first point with a variant not yet seen.
    expect(selectQuestion(progress, skill, 'learn').id).toBe(
      p1.questions[2].id,
    );
    const retry = answer(progress, p1.questions[2].id, true, NOW + 10);
    expect(getSkillState(retry, skill.id).lessonAttempt?.startedAt).toBe(
      NOW + 10,
    );
    expect(lessonCoolingDown(retry, skill.id, NOW + 11)).toBe(false);
  });

  it('prefers other work after a failure until another task is complete or the delay passes', () => {
    let progress = fresh();
    for (const question of p1.questions.slice(0, 3))
      progress = answer(progress, question.id, false);
    const failedAt = NOW;
    expect(lessonCoolingDown(progress, skill.id, NOW + 1)).toBe(true);
    const other = nextTask(progress, NOW + 1)!;
    expect(other.skillId).not.toBe(skill.id);
    // Nothing else in the course: the lesson is still offered, from the start.
    expect(nextTask(progress, NOW + 1, 'python-foundations')).toMatchObject({
      skillId: skill.id,
      questionId: p1.questions[3].id,
      reason: 'Try this lesson again from its first point.',
    });

    const later = failedAt + LESSON_RETRY_DELAY_MS;
    expect(lessonCoolingDown(progress, skill.id, later - 1)).toBe(true);
    expect(lessonCoolingDown(progress, skill.id, later)).toBe(false);
    expect(nextTask(progress, later)?.skillId).toBe(skill.id);

    const afterOtherTask = masterSkill(progress, other.skillId, NOW + 2);
    expect(lessonCoolingDown(afterOtherTask, skill.id, NOW + 3)).toBe(false);
    expect(nextTask(afterOtherTask, NOW + 3)?.skillId).toBe(skill.id);
  });

  it('asks a fresh question from each point plus code in a due review and pays review XP once', () => {
    let progress = masterSkill(fresh(), skill.id, NOW);
    const learned = getSkillState(progress, skill.id);
    const due = learned.dueAt!;
    expect(nextTask(progress, due, 'python-foundations')?.mode).toBe('review');
    // Early practice neither counts nor pays.
    const early = answer(progress, p1.questions[2].id, true, NOW + 1, 'review');
    expect(getSkillState(early, skill.id).reviewQuestionIds).toEqual([]);
    expect(early.totalXp).toBe(progress.totalXp);

    const first = selectQuestion(progress, skill, 'review');
    // The lesson used each point's first two variants; reviews draw others.
    expect(first.id).toBe(p1.questions[2].id);
    progress = answer(progress, first.id, true, due, 'review');
    expect(getSkillState(progress, skill.id).memory).toEqual(learned.memory);
    const second = selectQuestion(progress, skill, 'review');
    expect(second.id).toBe(p2.questions[2].id);
    progress = answer(progress, second.id, true, due, 'review');
    expect(getSkillState(progress, skill.id).reviewCount).toBe(0);
    expect(progress.totalXp).toBe(PERFECT_LESSON);
    expect(selectQuestion(progress, skill, 'review').id).toBe(code.id);
    progress = answer(progress, code.id, true, due, 'review');
    const reviewed = getSkillState(progress, skill.id);
    expect(reviewed.reviewCount).toBe(1);
    expect(reviewed.memory?.reps).toBe(learned.memory!.reps + 1);
    expect(reviewed.dueAt).toBeGreaterThan(due);
    expect(progress.attempts.at(-1)).toMatchObject({
      outcome: 'review-passed',
      xp: earnedXp(REVIEW_XP, 0, true),
      reviewDueAt: due,
    });
    expect(progress.totalXp).toBe(
      PERFECT_LESSON + earnedXp(REVIEW_XP, 0, true),
    );
    // The next cycle starts from the second point.
    expect(selectQuestion(progress, skill, 'review').id).toBe(
      p2.questions[3].id,
    );
    expect(reviewCycleComplete(skill, [p1.questions[0].id, code.id])).toBe(
      false,
    );
  });

  it('remediates only the missed point after a failed review, without new lesson XP', () => {
    let progress = masterSkill(fresh(), skill.id, NOW);
    const due = getSkillState(progress, skill.id).dueAt!;
    const xp = progress.totalXp;
    progress = answer(progress, p2.questions[2].id, false, due, 'review');
    const lapsed = getSkillState(progress, skill.id);
    expect(lapsed.memory?.lapses).toBe(1);
    expect(lapsed.questionIds).toEqual([p1.id, code.id]);
    expect(isMastered(progress, skill.id)).toBe(false);
    expect(isUnlocked(progress, 'variables')).toBe(false);
    expect(lessonCoolingDown(progress, skill.id, due + 1)).toBe(false);
    expect(stepStatus(progress)).toEqual(['done', 'current', 'done']);
    const task = nextTask(progress, due + 1, 'python-foundations')!;
    expect(task.mode).toBe('learn');
    expect(p2.questions.map((q) => q.id)).toContain(task.questionId);

    progress = answer(progress, task.questionId, true, due + 2);
    progress = answer(
      progress,
      selectQuestion(progress, skill, 'learn').id,
      true,
      due + 3,
    );
    const repaired = getSkillState(progress, skill.id);
    expect(isMastered(progress, skill.id)).toBe(true);
    expect(repaired.memory?.lapses).toBe(1);
    expect(repaired.dueAt).toBe(due + 3 + DAY_MS);
    expect(progress.attempts.at(-1)).toMatchObject({
      outcome: 'lesson-passed',
      xp: 0,
    });
    expect(progress.totalXp).toBe(xp);
  });

  it('never pays lesson XP for failing and relearning', () => {
    let progress = fresh();
    for (let round = 0; round < 3; round++)
      for (const question of p1.questions.slice(0, 3))
        progress = answer(progress, question.id, false, NOW + round);
    expect(progress.totalXp).toBe(0);
    progress = masterSkill(progress, skill.id, NOW + 10);
    expect(progress.totalXp).toBe(earnedXp(lessonXp(skill), 0, true));
    const due = getSkillState(progress, skill.id).dueAt!;
    progress = answer(progress, p1.questions[0].id, false, due, 'review');
    progress = masterSkill(progress, skill.id, due + 1);
    expect(progress.totalXp).toBe(earnedXp(lessonXp(skill), 0, true));
  });
});

describe('skills without knowledge points', () => {
  const legacy: Skill = {
    ...skillById['print-output'],
    id: 'fixture-legacy',
    courseId: 'fixture-course',
    unitId: 'fixture-unit',
    prerequisites: [],
    knowledgePoints: undefined,
    // Three choice checks, then the code exercise.
    questions: [
      ...skillById['print-output'].knowledgePoints![0].questions.slice(0, 3),
      ...skillById['print-output'].questions,
    ].map((question, index) => ({
      ...question,
      id: `fixture-legacy-q${index + 1}`,
    })),
    flashcards: [],
  };
  const catalog: CurriculumCatalog = {
    skills: [legacy],
    courses: [
      {
        id: 'fixture-course',
        title: 'Fixture',
        description: 'Test-only catalog.',
        domain: 'programming',
        skillIds: [legacy.id],
      },
    ],
    units: [
      {
        id: 'fixture-unit',
        title: 'Fixture',
        description: 'Test-only unit.',
        courseId: 'fixture-course',
      },
    ],
  };

  it('keeps the four-question lesson and pays lesson XP once, on completion', () => {
    let progress = fresh();
    const [q1, q2, q3, q4] = legacy.questions;
    const apply = (id: string, correct = true, at = NOW) =>
      applyAttempt(
        progress,
        { skillId: legacy.id, questionId: id, correct, mode: 'learn' },
        at,
        catalog,
      );
    progress = apply(q1.id);
    progress = apply(q2.id, false);
    progress = apply(q2.id);
    progress = apply(q3.id);
    expect(getSkillState(progress, legacy.id).questionIds).toEqual([
      q1.id,
      q2.id,
      q3.id,
    ]);
    expect(progress.totalXp).toBe(0);
    progress = apply(q4.id);
    expect(isMastered(progress, legacy.id, catalog)).toBe(true);
    expect(progress.attempts.at(-1)).toMatchObject({
      outcome: 'lesson-passed',
      xp: earnedXp(lessonXp(legacy), 1, true),
    });
    const earned = progress.totalXp;
    // Three misses never fail a legacy lesson, and relearning pays nothing.
    for (let index = 0; index < 3; index++) progress = apply(q1.id, false);
    expect(getSkillState(progress, legacy.id).lessonFailedAt).toBeUndefined();
    progress = apply(q1.id);
    expect(isMastered(progress, legacy.id, catalog)).toBe(true);
    expect(progress.totalXp).toBe(earned);
  });

  it('nets XP already earned per question under the old reward rules', () => {
    let progress = fresh();
    progress.skills[legacy.id] = {
      ...getSkillState(progress, legacy.id),
      questionIds: [legacy.questions[0].id],
      rewardedQuestionIds: [legacy.questions[0].id],
    };
    for (const question of legacy.questions.slice(1))
      progress = applyAttempt(
        progress,
        {
          skillId: legacy.id,
          questionId: question.id,
          correct: true,
          mode: 'learn',
        },
        NOW,
        catalog,
      );
    expect(progress.attempts.at(-1)?.xp).toBe(
      Math.max(0, earnedXp(lessonXp(legacy), 0, true) - 10),
    );
  });
});

describe('shuffled choices', () => {
  const questions = skills.flatMap((item) => servedChoiceQuestions(item));

  it('displays a deterministic permutation per presentation that grades the authored answer', () => {
    expect(questions.length).toBeGreaterThan(1000);
    const answerPositions = new Set<number>();
    let moved = 0;
    for (const question of questions.slice(0, 400)) {
      const order = choiceOrder(question, 0);
      expect([...order].sort()).toEqual(question.choices.map((_, i) => i));
      expect(choiceOrder(question, 0)).toEqual(order);
      const position = order.indexOf(question.answer);
      answerPositions.add(position);
      expect(authoredChoice(order, position)).toBe(question.answer);
      for (let shown = 0; shown < order.length; shown++)
        if (shown !== position)
          expect(authoredChoice(order, shown)).not.toBe(question.answer);
      if (choiceOrder(question, 1).join() !== order.join()) moved++;
    }
    // The correct answer lands in every position, and orders change between presentations.
    expect(answerPositions).toEqual(new Set([0, 1, 2, 3]));
    expect(moved).toBeGreaterThan(300);
    expect(() => authoredChoice([1, 0], 2)).toThrow();
    expect(choiceLetter(2)).toBe('C');
  });

  it('does not depend on the authored answer position', () => {
    const question = p1.questions.find(
      (item) => item.type === 'choice',
    ) as ChoiceQuestion;
    const moved = { ...question, answer: 3 };
    expect(choiceOrder(moved, 4)).toEqual(choiceOrder(question, 4));
  });
});

function legacyState(progress: Record<string, unknown>): LegacyLearnerState {
  const state = createState();
  return {
    ...state,
    version: 1,
    progress: {
      ...state.progress,
      version: 1,
      skills: progress as LearnerState['progress']['skills'],
    },
  };
}

describe('saved state migration, merge and validation', () => {
  // Saved before knowledge points: evidence names the four-question lesson.
  const legacyIds = legacyQuestionIds(skill);
  const mastered = {
    ...getSkillState(fresh(), skill.id),
    lessonSeen: true,
    attempts: 4,
    correct: 4,
    questionIds: legacyIds,
    rewardedQuestionIds: legacyIds,
    mastery: 1,
    intervalDays: 1,
    dueAt: NOW + DAY_MS,
    lastPracticedAt: NOW,
    learnedAt: new Date(NOW).toISOString(),
    lastQuestionId: legacyIds.at(-1)!,
    reviewQuestionIds: [legacyIds[0]],
  };

  it('keeps a legacy-mastered skill mastered and restarts partial legacy evidence', () => {
    const saved = legacyState({
      [skill.id]: mastered,
      'rust-main': {
        ...getSkillState(fresh(), 'rust-main'),
        lessonSeen: true,
        attempts: 2,
        correct: 2,
        questionIds: legacyQuestionIds(skillById['rust-main']).slice(0, 2),
        rewardedQuestionIds: [],
        mastery: 0.5,
      },
    });
    const parsed = parseStateUpdate({ state: saved, revision: 0 }).state;
    expect(parsed.version).toBe(STATE_VERSION);
    expect(parsed.progress.version).toBe(STATE_VERSION);
    expect(isMastered(parsed.progress, skill.id)).toBe(true);
    const migrated = getSkillState(parsed.progress, skill.id);
    expect(migrated.dueAt).toBe(NOW + DAY_MS);
    expect(migrated.questionIds).toEqual(
      expect.arrayContaining([p1.id, p2.id, code.id]),
    );
    // Legacy choice answers no longer count toward a knowledge-point review.
    expect(migrated.reviewQuestionIds).toEqual([]);
    expect(isMastered(parsed.progress, 'rust-main')).toBe(false);
    expect(
      lessonState(parsed.progress, skillById['rust-main']).current?.id,
    ).toBe(skillById['rust-main'].knowledgePoints![0].id);
    expect(migrateState(parsed)).toBe(parsed);
    expect(parseStateUpdate({ state: parsed, revision: 0 }).state).toEqual(
      parsed,
    );

    // A later failure on a credited point survives re-migration and merges.
    const due = migrated.dueAt!;
    const failed = {
      ...parsed,
      updatedAt: due + 1,
      progress: answer(
        parsed.progress,
        p2.questions[0].id,
        false,
        due,
        'review',
      ),
    };
    expect(isMastered(migrateState(failed).progress, skill.id)).toBe(false);
    const merged = mergeStates(failed, saved);
    expect(isMastered(merged.progress, skill.id)).toBe(false);
    expect(getSkillState(merged.progress, skill.id).questionIds).not.toContain(
      p2.id,
    );
  });

  it('keeps attempts, reviews, mistake cards, and Anki notes that name retired questions', () => {
    const [, q2] = legacyIds;
    const base = legacyState({ [skill.id]: mastered });
    const saved: LegacyLearnerState = {
      ...base,
      progress: {
        ...base.progress,
        attempts: [false, true].map((correct, index) => ({
          id: `before-knowledge-points-${index}`,
          skillId: skill.id,
          questionId: q2,
          correct,
          mode: 'learn' as const,
          usedHint: false,
          at: new Date(NOW - 2000 + index * 1000).toISOString(),
          xp: correct ? 10 : 0,
        })),
      },
      cards: [
        {
          id: `mistake:${skill.id}:${q2}`,
          skillId: skill.id,
          skillName: skill.title,
          kind: 'mistake',
          front: 'The retired question',
          back: 'Its answer',
          status: 'synced',
          noteId: 42,
        },
        {
          ...skill.flashcards[0],
          skillName: skill.title,
          kind: 'mastery',
          status: 'synced',
          noteId: 43,
        },
      ],
    };
    const parsed = parseStateUpdate({ state: saved, revision: 0 }).state;
    expect(parsed.cards).toEqual(saved.cards);
    expect(parsed.progress.attempts).toEqual(saved.progress.attempts);
    expect(isMastered(parsed.progress, skill.id)).toBe(true);
    // XP earned per retired question still counts against the lesson.
    expect(lessonXpAvailable(parsed.progress, skill)).toBe(0);
    expect(nextTask(parsed.progress, NOW, 'python-foundations')).not.toBeNull();
    const merged = mergeStates(parsed, { ...createState(), updatedAt: 0 });
    expect(merged.progress.attempts).toEqual(saved.progress.attempts);
    expect(merged.cards.slice(0, 2)).toEqual(saved.cards);
    // The other mastery card is queued once; nothing is duplicated.
    expect(merged.cards.map((card) => card.id)).toEqual([
      saved.cards[0].id,
      ...skill.flashcards.map((card) => card.id),
    ]);
  });

  it('merges lesson attempts, failures and task rewards across devices', () => {
    const base = { ...createState(), createdAt: NOW, updatedAt: NOW };
    const started = {
      ...base,
      progress: answer(base.progress, p1.questions[0].id, true, NOW),
    };
    const a = {
      ...started,
      updatedAt: NOW + 2,
      progress: answer(started.progress, p1.questions[1].id, true, NOW + 2),
    };
    const b = {
      ...started,
      updatedAt: NOW + 1,
      progress: answer(started.progress, p1.questions[2].id, false, NOW + 1),
    };
    const combined = getSkillState(mergeStates(a, b).progress, skill.id);
    expect(combined.lessonAttempt?.steps[p1.id]).toEqual({
      correct: [p1.questions[0].id, p1.questions[1].id],
      incorrect: 1,
    });

    // A failure on one device discards that attempt everywhere.
    let failed = b.progress;
    for (const question of p1.questions.slice(0, 2))
      failed = answer(failed, question.id, false, NOW + 3);
    const merged = getSkillState(
      mergeStates(a, { ...b, progress: failed, updatedAt: NOW + 3 }).progress,
      skill.id,
    );
    expect(merged.lessonFailedAt).toBe(NOW + 3);
    expect(merged.lessonAttempt).toBeUndefined();

    // Completing the lesson on two devices pays its XP once.
    const left = {
      ...base,
      progress: masterSkill(base.progress, skill.id, NOW),
    };
    const right = {
      ...base,
      updatedAt: NOW + 5,
      progress: masterSkill(base.progress, skill.id, NOW + 5),
    };
    const both = mergeStates(left, right);
    expect(both.progress.totalXp).toBe(PERFECT_LESSON);
    expect(getSkillState(both.progress, skill.id).lessonRewarded).toBe(true);
    expect(isMastered(both.progress, skill.id)).toBe(true);

    // So does one due review cycle completed on both devices.
    const due = getSkillState(left.progress, skill.id).dueAt!;
    const review = (progress: Progress, at: number) => {
      let result = progress;
      for (let index = 0; index < 3; index++)
        result = answer(
          result,
          selectQuestion(result, skill, 'review').id,
          true,
          at,
          'review',
        );
      return result;
    };
    const reviewedLeft = {
      ...left,
      updatedAt: due,
      progress: review(left.progress, due),
    };
    const reviewedRight = {
      ...left,
      updatedAt: due + 1,
      progress: review(left.progress, due + 1),
    };
    expect(reviewedLeft.progress.totalXp).toBe(
      PERFECT_LESSON + earnedXp(REVIEW_XP, 0, true),
    );
    expect(mergeStates(reviewedLeft, reviewedRight).progress.totalXp).toBe(
      PERFECT_LESSON + earnedXp(REVIEW_XP, 0, true),
    );
  });

  it('validates the new fields, reads old hint-flagged attempts, and rejects malformed ones', () => {
    let state = createState();
    state.progress = answer(state.progress, p1.questions[0].id, true, NOW);
    state.progress.attempts.push({
      id: 'old-hinted-attempt',
      skillId: skill.id,
      questionId: code.id,
      correct: true,
      mode: 'learn',
      usedHint: true,
      at: new Date(NOW).toISOString(),
      xp: 0,
    });
    state.progress.skills[skill.id].lessonFailedAt = NOW - 1;
    state.progress.skills[skill.id].lessonRewarded = false;
    expect(parseStateUpdate({ state, revision: 0 }).state).toEqual(state);
    const reject = (mutate: (copy: LearnerState) => void) => {
      const copy = structuredClone(state);
      mutate(copy);
      expect(() => parseStateUpdate({ state: copy, revision: 0 })).toThrow();
    };
    reject((copy) => {
      copy.progress.skills[skill.id].lessonAttempt!.steps[p1.id].incorrect = -1;
    });
    reject((copy) => {
      (
        copy.progress.skills[skill.id].lessonAttempt as unknown as {
          extra: number;
        }
      ).extra = 1;
    });
    reject((copy) => {
      (copy.progress.attempts[0] as { outcome?: string }).outcome = 'won';
    });
    reject((copy) => {
      (copy as { version: number }).version = STATE_VERSION + 1;
    });
    // A recorded answer still applies to the current state.
    state = recordLearningAnswer(state, {
      skillId: skill.id,
      questionId: p1.questions[1].id,
      correct: false,
      mode: 'learn',
    });
    expect(state.cards.at(-1)).toMatchObject({
      id: `mistake:${skill.id}:${p1.questions[1].id}`,
      kind: 'mistake',
    });
    expect(JSON.stringify(state).length).toBeLessThan(MAX_STATE_BODY_BYTES);
  });
});
