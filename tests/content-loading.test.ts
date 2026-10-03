import { describe, expect, it, vi } from 'vitest';
import type { Skill } from '../src/lib/curriculum';

// The browser's content parts are units (scripts/catalog-index-plugin.mjs).
// These tests run the loader against unit parts, as the browser does: a
// lesson downloads only the unit holding its skill.
const fake = vi.hoisted(() => {
  const skill = (id: string, courseId: string, unitId: string) =>
    ({ id, courseId, unitId, lesson: { paragraphs: [] } }) as unknown as Skill;
  const units: Record<string, { courseId: string; skills: Skill[] }> = {
    'a-one': { courseId: 'a', skills: [skill('a1', 'a', 'a-one')] },
    'a-two': {
      courseId: 'a',
      skills: [skill('a2', 'a', 'a-two'), skill('a3', 'a', 'a-two')],
    },
    'b-one': { courseId: 'b', skills: [skill('b1', 'b', 'b-one')] },
  };
  const downloads: string[] = [];
  const failing = new Set<string>();
  return { units, downloads, failing };
});

vi.mock('../src/lib/content/parts', () => ({
  contentParts: Object.fromEntries(
    Object.entries(fake.units).map(([id, unit]) => [
      id,
      {
        courseId: unit.courseId,
        load: async () => {
          fake.downloads.push(id);
          if (fake.failing.has(id)) throw new Error('offline');
          return unit.skills;
        },
      },
    ]),
  ),
  partOf: (skill: { unitId: string }) => skill.unitId,
}));

const content = await import('../src/lib/content');
const outline = (id: string, courseId: string, unitId: string) => ({
  id,
  courseId,
  unitId,
});

describe('loading content per unit', () => {
  it('downloads only the unit that holds a skill, once', async () => {
    expect(content.contentCourseIds).toEqual(['a', 'b']);
    expect(content.loadedSkill('a2')).toBeUndefined();
    const [a2, a3] = await Promise.all([
      content.loadSkill(outline('a2', 'a', 'a-two')),
      content.loadSkill(outline('a3', 'a', 'a-two')),
    ]);
    expect(a2).toBe(fake.units['a-two'].skills[0]);
    expect(a3).toBe(fake.units['a-two'].skills[1]);
    expect(fake.downloads).toEqual(['a-two']);
    expect(content.loadedSkill('a1')).toBeUndefined();
    expect(content.courseContentLoaded('a')).toBe(false);
    // Loaded skills come from memory.
    await content.loadSkills([outline('a2', 'a', 'a-two')]);
    expect(fake.downloads).toEqual(['a-two']);
  });

  it('loads a whole course as its units', async () => {
    const skills = await content.loadCourseContent('a');
    expect(skills.map((skill) => skill.id).sort()).toEqual(['a1', 'a2', 'a3']);
    expect(fake.downloads).toEqual(['a-two', 'a-one']);
    expect(content.courseContentLoaded('a')).toBe(true);
    expect(content.courseContentLoaded('b')).toBe(false);
    await expect(content.loadCourseContent('missing')).rejects.toThrow(
      'Unknown course missing.',
    );
  });

  it('retries a unit whose download failed', async () => {
    fake.failing.add('b-one');
    await expect(
      content.loadSkill(outline('b1', 'b', 'b-one')),
    ).rejects.toThrow('offline');
    fake.failing.delete('b-one');
    expect((await content.loadSkill(outline('b1', 'b', 'b-one'))).id).toBe(
      'b1',
    );
    expect(fake.downloads.filter((id) => id === 'b-one')).toHaveLength(2);
    await expect(
      content.loadSkill(outline('x1', 'b', 'missing')),
    ).rejects.toThrow('Unknown content part missing.');
  });
});
