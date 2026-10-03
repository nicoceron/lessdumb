import { describe, expect, it } from 'vitest';
import { skills, skillById, type Skill } from '../src/lib/curriculum';
import { workedExampleSteps } from '../src/lib/lesson-content';

describe('worked lesson examples', () => {
  it('scaffolds every Python foundation example into named subgoals', () => {
    const foundations = skills.filter(
      (skill) => skill.courseId === 'python-foundations',
    );
    expect(foundations).toHaveLength(24);
    for (const skill of foundations) {
      const steps = workedExampleSteps(skill);
      expect(steps.length, skill.id).toBeGreaterThanOrEqual(3);
      expect(steps.length, skill.id).toBeLessThanOrEqual(4);
      expect(
        steps.slice(0, -1).every((step) => step.code && step.explanation),
        skill.id,
      ).toBe(true);
      expect(
        steps.some((step) => step.title === 'Follow the reasoning'),
        skill.id,
      ).toBe(false);
    }
  });

  it('retains the published result and only shows unchanged source excerpts across the registry', () => {
    for (const skill of skills) {
      const before = JSON.stringify(skill);
      const steps = workedExampleSteps(skill);
      expect(steps.at(-1)?.output, skill.id).toBe(skill.lesson.example.output);
      expect(
        steps.every((step) => step.title.trim() && step.explanation.trim()),
        skill.id,
      ).toBe(true);
      for (const step of steps) {
        if (step.code !== undefined) {
          expect(step.code.trim(), skill.id).not.toBe('');
          expect(skill.lesson.example.code.includes(step.code), skill.id).toBe(
            true,
          );
        }
      }
      expect(JSON.stringify(skill), skill.id).toBe(before);
    }
  });

  it('explains the first four Rust and C++ examples before showing their actual results', () => {
    for (const id of [
      'rust-main',
      'rust-format',
      'rust-bindings',
      'rust-scope',
      'cpp-integer-values',
      'cpp-arithmetic',
      'cpp-explicit-casts',
      'cpp-values',
    ]) {
      const steps = workedExampleSteps(skillById[id]);
      expect(steps, id).toHaveLength(3);
      expect(steps[0].code, id).toBeTruthy();
      expect(steps[1].code, id).toBeTruthy();
      expect(steps[2].output, id).toBe(skillById[id].lesson.example.output);
    }
    expect(workedExampleSteps(skillById['rust-main']).at(-1)?.output).toBe(
      'hello, Rust',
    );
  });

  it('uses existing reasoning for other subjects without reading assessment answers', () => {
    const example: Skill['lesson']['example'] = {
      kind: 'text',
      code: '3 groups of 4 objects',
      explanation: 'Each group contributes four objects.',
      output: '12 objects',
    };
    const skill: Skill = {
      ...skillById['print-output'],
      id: 'future-math-example',
      lesson: { paragraphs: ['Count equal groups.'], example },
      get questions(): Skill['questions'] {
        throw new Error('Worked examples must not access assessment answers.');
      },
    };
    expect(workedExampleSteps(skill)).toEqual([
      {
        title: 'Read the given example',
        explanation: 'Count equal groups.',
        code: example.code,
      },
      { title: 'Follow the reasoning', explanation: example.explanation },
      {
        title: 'Read the result',
        explanation:
          'Compare this published result with the example and its explanation.',
        output: example.output,
      },
    ]);
  });
});
