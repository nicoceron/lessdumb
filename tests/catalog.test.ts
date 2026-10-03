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
  it('rejects prerequisites already implied by another prerequisite', () => {
    const child = skills.find((s) =>
      s.prerequisites.some((p) => skillById[p].prerequisites.length),
    )!;
    const parent =
      skillById[
        child.prerequisites.find((p) => skillById[p].prerequisites.length)!
      ];
    const grandparent = parent.prerequisites[0];
    const registry = skills.map((s) =>
      s.id === child.id
        ? { ...s, prerequisites: [...s.prerequisites, grandparent] }
        : s,
    );
    expect(validateCurriculum(registry)).toContain(
      `${child.id}: prerequisite ${grandparent} is already implied by ${parent.id}.`,
    );
  });
  for (const course of courses.filter((c) => c.skillIds.length >= 20)) {
    it(`offers ${course.title} as a branching graph rather than a playlist`, () => {
      const members = new Set(course.skillIds);
      const depth = new Map<string, number>();
      const chain = (id: string): number => {
        if (!depth.has(id))
          depth.set(
            id,
            1 +
              Math.max(
                0,
                ...skillById[id].prerequisites
                  .filter((p) => members.has(p))
                  .map(chain),
              ),
          );
        return depth.get(id)!;
      };
      const longest = Math.max(...course.skillIds.map(chain));
      expect(longest).toBeLessThanOrEqual(course.skillIds.length / 2);
      // With supporting courses complete, learn the lowest-order ready skill
      // each time and count the choices the learner had.
      const own = course.skillIds.map((id) => skillById[id]);
      const known = new Set<string>();
      const widths: number[] = [];
      while (known.size < own.length) {
        const ready = own
          .filter(
            (s) =>
              !known.has(s.id) &&
              s.prerequisites.every((p) => known.has(p) || !members.has(p)),
          )
          .sort((a, b) => a.order - b.order);
        widths.push(ready.length);
        known.add(ready[0].id);
      }
      widths.sort((a, b) => a - b);
      expect(widths[Math.floor(widths.length / 2)]).toBeGreaterThanOrEqual(3);
    });
  }
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
