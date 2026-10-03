import type { Skill, SkillOutline } from '../curriculum';
import { contentParts, partOf } from './parts';

// Lesson content, loaded one part at a time: in the browser a part is a unit
// (see `./parts`), so opening a lesson downloads only its unit's lessons,
// points, exercises, and cards, as an immutable, cached chunk. The graph
// index (`../catalog-index`) is always in memory; this module only adds
// content. On the server and in tests the full curriculum registers itself,
// so every skill is already loaded there.

type Located = Pick<SkillOutline, 'id' | 'courseId' | 'unitId'>;

/** Course IDs with content, checked against the catalog by tests. */
export const contentCourseIds = [
  ...new Set(Object.values(contentParts).map((part) => part.courseId)),
];

const loaded = new Map<string, Skill>();
const loadedParts = new Set<string>();
const pending = new Map<string, Promise<Skill[]>>();

/** Make skills available synchronously, as a finished part load does. */
export function registerSkills(skills: Skill[]) {
  for (const skill of skills) {
    loaded.set(skill.id, skill);
    loadedParts.add(partOf(skill));
  }
}

/** Whether a skill carries its lesson content rather than only its outline. */
export function hasContent(skill: SkillOutline): skill is Skill {
  return 'lesson' in skill;
}

/** The skill with its content, if its part is loaded. */
export function loadedSkill(skillId: string): Skill | undefined {
  return loaded.get(skillId);
}

/** The content for an outline: the skill itself, or its loaded counterpart. */
export function contentOf(skill: SkillOutline): Skill | undefined {
  return hasContent(skill) ? skill : loaded.get(skill.id);
}

function courseParts(courseId: string): string[] {
  return Object.keys(contentParts).filter(
    (id) => contentParts[id].courseId === courseId,
  );
}

export function courseContentLoaded(courseId: string): boolean {
  const parts = courseParts(courseId);
  return parts.length > 0 && parts.every((id) => loadedParts.has(id));
}

/** Load (once) one part's skills with their content. */
function loadPart(id: string): Promise<Skill[]> {
  const existing = pending.get(id);
  if (existing) return existing;
  const part = contentParts[id];
  if (!part) return Promise.reject(new Error(`Unknown content part ${id}.`));
  const request = part.load().then((skills) => {
    registerSkills(skills);
    return skills;
  });
  pending.set(id, request);
  // A failed download (offline, a deploy in between) can be retried.
  request.catch(() => pending.delete(id));
  return request;
}

/** Load (once) every skill of a course with its content. */
export async function loadCourseContent(courseId: string): Promise<Skill[]> {
  const parts = courseParts(courseId);
  if (!parts.length) throw new Error(`Unknown course ${courseId}.`);
  return (await Promise.all(parts.map(loadPart))).flat();
}

/** Load the parts holding these skills and return the skills with content. */
export async function loadSkills(skills: Located[]): Promise<Skill[]> {
  await Promise.all(
    [
      ...new Set(skills.filter((skill) => !loaded.has(skill.id)).map(partOf)),
    ].map(loadPart),
  );
  return skills.map((skill) => {
    const found = loaded.get(skill.id);
    if (!found) throw new Error(`Unknown skill ${skill.id}.`);
    return found;
  });
}

export async function loadSkill(skill: Located): Promise<Skill> {
  return (await loadSkills([skill]))[0];
}
