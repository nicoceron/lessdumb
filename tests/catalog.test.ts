import { describe, expect, it } from 'vitest';
import {
  courses,
  skills,
  skillById,
  defaultCatalog,
  validateCurriculum,
} from '../src/lib/curriculum';
import {
  emptyProgress,
  nextTask,
  applyAttempt,
  getStats,
  coursePath,
  isUnlocked,
} from '../src/lib/learning';
import { createState, mergeStates } from '../src/lib/state';
import { parseStateUpdate } from '../src/lib/server/state-validation';
const now = Date.parse('2026-10-02T15:00:00Z');
describe('connected course paths', () => {
  it('validates one acyclic registry with cross-course prerequisite edges', () => {
    expect(validateCurriculum()).toEqual([]);
    expect(
      skills.some((s) =>
        s.prerequisites.some((id) => skillById[id].courseId !== s.courseId),
      ),
    ).toBe(true);
  });
  for (const course of courses) {
    it(`reaches ${course.title} through real prerequisites without unrelated detours`, () => {
      let progress = emptyProgress(now);
      const path = coursePath(course.id);
      const allowed = new Set(path.map((s) => s.id));
      const answers = path.reduce((n, s) => n + s.questions.length, 0);
      for (let i = 0; i < answers; i++) {
        const task = nextTask(progress, now, course.id);
        expect(task, `Path stalled after ${i} answers`).not.toBeNull();
        expect(allowed.has(task!.skillId)).toBe(true);
        expect(isUnlocked(progress, task!.skillId)).toBe(true);
        progress = applyAttempt(progress, { ...task!, correct: true }, now);
      }
      expect(getStats(progress, now, course.id).mastered).toBe(
        course.skillIds.length,
      );
      expect(nextTask(progress, now, course.id)).toBeNull();
      expect(getStats(progress, now).mastered).toBe(path.length);
    });
  }
  it('keeps choice-only scenarios independent of a code runtime', () => {
    const conceptual = defaultCatalog.skills.filter(
      (s) => s.lesson.example.kind === 'text',
    );
    for (const skill of conceptual)
      expect(skill.questions.every((q) => q.type === 'choice')).toBe(true);
  });
  it('persists and reconciles course selection while accepting pre-catalog saved accounts', () => {
    const old = createState();
    delete old.activeCourseId;
    expect(
      parseStateUpdate({ state: old, revision: 0 }).state.activeCourseId,
    ).toBeUndefined();
    const selected = {
      ...old,
      activeCourseId: courses.at(-1)!.id,
      updatedAt: old.updatedAt + 1,
    };
    expect(
      parseStateUpdate({ state: selected, revision: 0 }).state.activeCourseId,
    ).toBe(selected.activeCourseId);
    expect(
      parseStateUpdate({
        state: { ...old, activeCourseId: 'retired-course' },
        revision: 0,
      }).state.activeCourseId,
    ).toBe('python-foundations');
    expect(mergeStates(old, selected).activeCourseId).toBe(
      selected.activeCourseId,
    );
    expect(() =>
      parseStateUpdate({ state: { ...old, activeCourseId: 42 }, revision: 0 }),
    ).toThrow();
  });
});
