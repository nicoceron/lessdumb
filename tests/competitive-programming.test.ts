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
  selectQuestion,
  type Progress,
} from '../src/lib/learning';
import { createState, recordLearningAnswer } from '../src/lib/state';
import { parseStateUpdate } from '../src/lib/server/state-validation';
import { competitiveTopicStages } from '../src/lib/courses/competitive-programming';
import { masterSkill } from './helpers/mastery';

const courseId = 'competitive-programming';
const NOW = Date.parse('2026-10-02T15:00:00Z');

function master(progress: Progress, id: string): Progress {
  let result = progress;
  for (const prerequisite of skillById[id].prerequisites)
    if (getSkillState(result, prerequisite).mastery < 1)
      result = master(result, prerequisite);
  return masterSkill(result, id, NOW);
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
    const ancestors = (id: string): Set<string> =>
      new Set(
        skillById[id].prerequisites.flatMap((parent) => [
          parent,
          ...ancestors(parent),
        ]),
      );
    for (const skill of path.filter((item) => item.courseId === courseId)) {
      // Every contest assessment defines a function that returns a result.
      expect(ancestors(skill.id).has('return-values')).toBe(true);
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
    const ancestor = skillById['math-vectors'].questions[0];
    progress = applyAttempt(
      progress,
      {
        skillId: 'math-vectors',
        questionId: ancestor.id,
        correct: false,
        mode: 'review',
      },
      NOW + DAY_MS,
    );
    expect(isUnlocked(progress, 'cp-geometry')).toBe(false);
    expect(getSkillState(progress, 'cp-geometry-turn-sign').mastery).toBe(1);
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
        skillId: 'math-vectors',
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
    const skill = skillById['cp-prefix-sums'];
    for (
      let guard = 0;
      getSkillState(state.progress, skill.id).mastery < 1 && guard < 64;
      guard++
    )
      state = recordLearningAnswer(state, {
        skillId: skill.id,
        questionId: selectQuestion(state.progress, skill, 'learn').id,
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
    // The review completes only once both choice and code evidence exist.
    const answered = new Set<string>();
    for (
      let guard = 0;
      getSkillState(state.progress, skill.id).dueAt === due && guard < 8;
      guard++
    ) {
      const question = selectQuestion(state.progress, skill, 'review');
      answered.add(question.type);
      state = recordLearningAnswer(state, {
        skillId: skill.id,
        questionId: question.id,
        correct: true,
        mode: 'review',
      });
      if (guard === 0)
        expect(getSkillState(state.progress, skill.id).dueAt).toBe(due);
    }
    expect([...answered].sort()).toEqual(['choice', 'code']);
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

  it('requires the concepts each preserved application uses, in their own order', () => {
    expect(Object.keys(competitiveTopicStages)).toHaveLength(48);
    const ancestors = (id: string): Set<string> =>
      new Set(
        skillById[id].prerequisites.flatMap((parent) => [
          parent,
          ...ancestors(parent),
        ]),
      );
    for (const [topic, stages] of Object.entries(competitiveTopicStages)) {
      expect(stages).toHaveLength(3);
      stages.forEach((id, index) => {
        expect(skillById[id]).toMatchObject({
          topicId: topic,
          stage: index + 1,
          stageCount: 4,
          unitId: skillById[topic].unitId,
        });
        // A concept never depends on the application it prepares.
        expect(ancestors(id).has(topic)).toBe(false);
      });
      // Two concepts are not used by their application yet; their
      // applications need rewriting before an edge would be honest.
      for (const stage of stages)
        expect(ancestors(topic).has(stage)).toBe(
          !['cp-grid-component', 'cp-bit-submask-step'].includes(stage),
        );
      expect(skillById[topic]).toMatchObject({
        topicId: topic,
        stage: 4,
        stageCount: 4,
      });
    }
    // Mastering one ready concept unlocks exactly the nodes whose remaining
    // prerequisites it completes; the application waits for every concept.
    const topic = 'cp-prefix-sums';
    const sequence = [...competitiveTopicStages[topic], topic];
    let progress = createState().progress;
    for (const id of sequence)
      for (const parent of skillById[id].prerequisites)
        if (!sequence.includes(parent)) progress = master(progress, parent);
    for (const [index, id] of sequence.entries()) {
      expect(isUnlocked(progress, id)).toBe(
        skillById[id].prerequisites.every(
          (parent) => getSkillState(progress, parent).mastery === 1,
        ),
      );
      if (index < 3) expect(isUnlocked(progress, topic)).toBe(false);
      progress = master(progress, id);
    }
  });
});
