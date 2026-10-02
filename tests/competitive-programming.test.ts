import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  courses,
  skillById,
  skills,
  validateCurriculum,
} from '../src/lib/curriculum';
import {
  applyAttempt,
  coursePath,
  DAY_MS,
  getSkillState,
  isUnlocked,
  nextTask,
  type Progress,
} from '../src/lib/learning';
import { createState, recordLearningAnswer } from '../src/lib/state';
import { parseStateUpdate } from '../src/lib/server/state-validation';
import { competitiveTopicStages } from '../src/lib/courses/competitive-programming';

const courseId = 'competitive-programming';
const NOW = Date.parse('2026-10-02T15:00:00Z');

function master(progress: Progress, id: string): Progress {
  let result = progress;
  for (const prerequisite of skillById[id].prerequisites)
    if (getSkillState(result, prerequisite).mastery < 1)
      result = master(result, prerequisite);
  for (const question of skillById[id].questions)
    result = applyAttempt(
      result,
      { skillId: id, questionId: question.id, correct: true, mode: 'learn' },
      NOW,
    );
  return result;
}

afterEach(() => vi.useRealTimers());

describe('competitive programming in the shared knowledge graph', () => {
  it('requires real Python foundations, includes the math branch, and excludes unrelated courses', () => {
    expect(validateCurriculum()).toEqual([]);
    const path = coursePath(courseId);
    const ids = new Set(path.map((skill) => skill.id));
    for (const id of [
      'parameters',
      'ranges',
      'dictionaries',
      'math-vectors',
      'cp-fenwick',
      'cp-scc',
    ])
      expect(ids.has(id)).toBe(true);
    expect(new Set(path.map((skill) => skill.courseId))).toEqual(
      new Set(['python-foundations', 'quantitative-foundations', courseId]),
    );
    expect(skills.filter((skill) => skill.courseId === courseId)).toHaveLength(
      192,
    );
    for (const skill of path.filter((item) => item.courseId === courseId)) {
      expect(skill.prerequisites).toContain('parameters');
      expect(skill.questions.map((q) => q.type)).toEqual([
        'choice',
        'choice',
        'choice',
        'code',
      ]);
      expect(skill.assessment).toEqual({
        requiredTypes: ['code', 'choice'],
        reviewAnswers: 2,
      });
    }
    const state = createState();
    expect(isUnlocked(state.progress, 'cp-complexity')).toBe(false);
    expect(nextTask(state.progress, NOW, courseId)?.skillId).toBe(
      'print-output',
    );
  });

  it('blocks a failed math ancestor only on its dependent contest branch and repairs it without erasing evidence', () => {
    let progress = master(
      master(createState().progress, 'cp-geometry'),
      'cp-greedy',
    );
    const ancestor = skillById['math-mean'].questions[0];
    progress = applyAttempt(
      progress,
      {
        skillId: 'math-mean',
        questionId: ancestor.id,
        correct: false,
        mode: 'review',
      },
      NOW + DAY_MS,
    );
    expect(isUnlocked(progress, 'cp-geometry')).toBe(false);
    expect(getSkillState(progress, 'math-vectors').mastery).toBe(1);
    expect(getSkillState(progress, 'cp-geometry').mastery).toBe(1);
    expect(isUnlocked(progress, 'cp-greedy')).toBe(true);
    expect(() =>
      applyAttempt(
        progress,
        {
          skillId: 'cp-geometry',
          questionId: 'cp-geometry-q4',
          correct: true,
          mode: 'learn',
        },
        NOW + DAY_MS,
      ),
    ).toThrow('prerequisites');
    const restored = applyAttempt(
      progress,
      {
        skillId: 'math-mean',
        questionId: ancestor.id,
        correct: true,
        mode: 'learn',
      },
      NOW + DAY_MS,
    );
    expect(isUnlocked(restored, 'cp-geometry')).toBe(true);
    expect(getSkillState(restored, 'cp-greedy')).toEqual(
      getSkillState(progress, 'cp-greedy'),
    );
  });

  it('earns contest cards and advances a due review only after both code and choice evidence', () => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
    let state = createState();
    for (const prerequisite of skillById['cp-prefix-sums'].prerequisites)
      state.progress = master(state.progress, prerequisite);
    for (const question of skillById['cp-prefix-sums'].questions)
      state = recordLearningAnswer(state, {
        skillId: 'cp-prefix-sums',
        questionId: question.id,
        correct: true,
        mode: 'learn',
      });
    expect(state.cards.map((card) => card.id)).toEqual([
      'cp-prefix-sums-card1',
      'cp-prefix-sums-card2',
    ]);
    expect(state.cards.every((card) => card.status === 'pending')).toBe(true);
    const due = getSkillState(state.progress, 'cp-prefix-sums').dueAt!;
    vi.setSystemTime(due);
    state = recordLearningAnswer(state, {
      skillId: 'cp-prefix-sums',
      questionId: 'cp-prefix-sums-q1',
      correct: true,
      mode: 'review',
    });
    expect(getSkillState(state.progress, 'cp-prefix-sums').dueAt).toBe(due);
    state = recordLearningAnswer(state, {
      skillId: 'cp-prefix-sums',
      questionId: 'cp-prefix-sums-q4',
      correct: true,
      mode: 'review',
    });
    expect(getSkillState(state.progress, 'cp-prefix-sums').dueAt).toBe(
      due + 7 * DAY_MS,
    );
    expect(state.cards).toHaveLength(2);
    state.activeCourseId = courseId;
    expect(parseStateUpdate({ state, revision: 0 }).state).toEqual(state);
    expect(
      courses.find((course) => course.id === courseId)?.skillIds,
    ).toContain('cp-prefix-sums');
  });

  it('requires all three new concepts before each preserved application skill', () => {
    expect(Object.keys(competitiveTopicStages)).toHaveLength(48);
    for (const [topic, stages] of Object.entries(competitiveTopicStages)) {
      expect(stages).toHaveLength(3);
      stages.forEach((id, index) => {
        expect(skillById[id]).toMatchObject({
          topicId: topic,
          stage: index + 1,
          stageCount: 4,
          unitId: skillById[topic].unitId,
        });
        if (index)
          expect(skillById[id].prerequisites).toContain(stages[index - 1]);
      });
      expect(skillById[topic].prerequisites).toContain(stages[2]);
      expect(skillById[topic]).toMatchObject({
        topicId: topic,
        stage: 4,
        stageCount: 4,
      });
    }
    const topic = 'cp-prefix-sums';
    const [first, second, third] = competitiveTopicStages[topic];
    let progress = createState().progress;
    for (const parent of skillById[first].prerequisites)
      progress = master(progress, parent);
    expect(isUnlocked(progress, first)).toBe(true);
    expect(isUnlocked(progress, second)).toBe(false);
    expect(isUnlocked(progress, topic)).toBe(false);
    progress = master(progress, first);
    expect(isUnlocked(progress, second)).toBe(true);
    expect(isUnlocked(progress, third)).toBe(false);
    progress = master(progress, second);
    expect(isUnlocked(progress, third)).toBe(true);
    expect(isUnlocked(progress, topic)).toBe(false);
    progress = master(progress, third);
    expect(isUnlocked(progress, topic)).toBe(true);
  });
});
