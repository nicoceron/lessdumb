import { afterEach, describe, expect, it, vi } from 'vitest';
import { courses, skills, validateCurriculum } from '../src/lib/curriculum';
import { DAY_MS, isUnlocked, selectQuestion } from '../src/lib/learning';
import {
  createState,
  recordLearningAnswer,
  type LearnerState,
} from '../src/lib/state';

const NOW = Date.parse('2026-10-02T12:00:00Z');
const roots = () =>
  ['rust', 'cpp'].map((language) => {
    const course = courses.find((item) => item.language === language)!;
    return skills.find(
      (item) => item.courseId === course.id && !item.prerequisites.length,
    )!;
  });
function master(state: LearnerState, skill: ReturnType<typeof roots>[number]) {
  let result = state;
  for (const question of skill.questions)
    result = recordLearningAnswer(result, {
      skillId: skill.id,
      questionId: question.id,
      correct: true,
      mode: 'learn',
    });
  return result;
}
afterEach(() => vi.useRealTimers());

describe('Rust and C++ in the shared learner engine', () => {
  it('keeps two languages and two learners independent through acquisition, review, lapse, and repair', () => {
    vi.useFakeTimers().setSystemTime(NOW);
    const [rust, cpp] = roots();
    const otherLearner = createState();
    let learner = master(master(createState(), rust), cpp);
    expect(learner.cards).toHaveLength(4);
    expect(learner.progress.totalXp).toBe(90);
    const cppMemory = learner.progress.skills[cpp.id].memory;
    const descendant = skills.find(
      (item) =>
        item.courseId === rust.courseId &&
        item.prerequisites.length === 1 &&
        item.prerequisites[0] === rust.id,
    )!;
    learner = master(learner, descendant);
    const descendantBefore = learner.progress.skills[descendant.id];

    vi.setSystemTime(NOW + DAY_MS + 1_000);
    for (let index = 0; index < 2; index++) {
      const question = selectQuestion(learner.progress, rust, 'review');
      learner = recordLearningAnswer(learner, {
        skillId: rust.id,
        questionId: question.id,
        correct: true,
        mode: 'review',
      });
    }
    expect(learner.progress.skills[rust.id].reviewCount).toBe(1);
    expect(learner.progress.skills[cpp.id].memory).toEqual(cppMemory);
    const beforeFailure = learner.progress.skills[rust.id].memory!;
    vi.setSystemTime(beforeFailure.dueAt + 1_000);
    const code = rust.questions.find((question) => question.type === 'code')!;
    learner = recordLearningAnswer(learner, {
      skillId: rust.id,
      questionId: code.id,
      correct: false,
      mode: 'review',
    });
    expect(learner.progress.skills[rust.id].memory!.lapses).toBe(
      beforeFailure.lapses + 1,
    );
    expect(learner.progress.skills[rust.id].memory!.stability).toBeLessThan(
      beforeFailure.stability,
    );
    expect(isUnlocked(learner.progress, descendant.id)).toBe(false);
    expect(learner.progress.skills[descendant.id]).toEqual(descendantBefore);
    const xp = learner.progress.totalXp;
    learner = recordLearningAnswer(learner, {
      skillId: rust.id,
      questionId: code.id,
      correct: true,
      mode: 'learn',
    });
    expect(isUnlocked(learner.progress, descendant.id)).toBe(true);
    expect(learner.progress.totalXp).toBe(xp);
    expect(learner.progress.skills[rust.id].intervalDays).toBe(1);
    expect(learner.progress.skills[cpp.id].memory).toEqual(cppMemory);
    expect(otherLearner.progress.skills).toEqual({});
    expect(otherLearner.cards).toEqual([]);
    expect(otherLearner.progress.totalXp).toBe(0);
  });

  it('requires independent executable evidence in each language and gives no repeat rewards', () => {
    vi.useFakeTimers().setSystemTime(NOW);
    for (const root of roots()) {
      let learner = createState();
      for (const question of root.questions)
        learner = recordLearningAnswer(learner, {
          skillId: root.id,
          questionId: question.id,
          correct: true,
          mode: 'learn',
          usedHint: question.type === 'code',
        });
      expect(learner.progress.skills[root.id].mastery).toBe(0.75);
      expect(learner.progress.skills[root.id].memory).toBeUndefined();
      expect(learner.cards).toEqual([]);
      learner = master(learner, root);
      expect(learner.progress.totalXp).toBe(45);
      expect(learner.cards).toHaveLength(2);
      learner = master(learner, root);
      expect(learner.progress.totalXp).toBe(45);
      expect(learner.cards).toHaveLength(2);
    }
  });

  it('rejects an assessment or runnable example carrying a different course language', () => {
    for (const root of roots()) {
      const wrongExercise = structuredClone(root);
      const code = wrongExercise.questions.find(
        (question) => question.type === 'code',
      )!;
      if (code.type !== 'code') throw new Error('Expected compiled exercise.');
      code.language = 'python';
      expect(
        validateCurriculum(
          skills.map((item) => (item.id === root.id ? wrongExercise : item)),
        ),
      ).not.toEqual([]);
      const wrongExample = structuredClone(root);
      wrongExample.lesson.example.language = 'python';
      expect(
        validateCurriculum(
          skills.map((item) => (item.id === root.id ? wrongExample : item)),
        ),
      ).not.toEqual([]);
    }
  });
});
