import type { Skill, SkillOutline } from '../curriculum';
import type { CourseContent } from '../knowledge-points';

// Lesson content, loaded one course at a time. Each course's content module is
// a separate dynamic import, so the browser downloads a course's lessons,
// points, exercises, and cards only when a lesson, review, quiz, or placement
// test needs them, and caches the immutable chunk. The graph index
// (`../catalog-index`) is always in memory; this module only adds content.
// On the server and in tests the full curriculum registers itself, so every
// skill is already loaded there.

const loaders: Record<string, () => Promise<{ default: CourseContent }>> = {
  'python-foundations': () => import('./python-foundations'),
  'quantitative-foundations': () => import('./quantitative-foundations'),
  'python-data-analysis': () => import('./python-data-analysis'),
  'machine-learning': () => import('./machine-learning'),
  'data-systems-foundations': () => import('./data-systems-foundations'),
  'competitive-programming': () => import('./competitive-programming'),
  rust: () => import('./rust'),
  cpp: () => import('./cpp'),
};

/** Course IDs with a content module, checked against the catalog by tests. */
export const contentCourseIds = Object.keys(loaders);

const loaded = new Map<string, Skill>();
const loadedCourses = new Set<string>();
const pending = new Map<string, Promise<Skill[]>>();

/** Make skills available synchronously, as a finished course load does. */
export function registerSkills(skills: Skill[]) {
  for (const skill of skills) {
    loaded.set(skill.id, skill);
    loadedCourses.add(skill.courseId);
  }
}

/** Whether a skill carries its lesson content rather than only its outline. */
export function hasContent(skill: SkillOutline): skill is Skill {
  return 'lesson' in skill;
}

/** The skill with its content, if this skill's course is loaded. */
export function loadedSkill(skillId: string): Skill | undefined {
  return loaded.get(skillId);
}

/** The content for an outline: the skill itself, or its loaded counterpart. */
export function contentOf(skill: SkillOutline): Skill | undefined {
  return hasContent(skill) ? skill : loaded.get(skill.id);
}

export function courseContentLoaded(courseId: string): boolean {
  return loadedCourses.has(courseId);
}

/** Load (once) every skill of a course with its content. */
export function loadCourseContent(courseId: string): Promise<Skill[]> {
  const existing = pending.get(courseId);
  if (existing) return existing;
  const loader = loaders[courseId];
  if (!loader) return Promise.reject(new Error(`Unknown course ${courseId}.`));
  const request = loader().then(({ default: content }) => {
    registerSkills(content.skills);
    return content.skills;
  });
  pending.set(courseId, request);
  // A failed download (offline, a deploy in between) can be retried.
  request.catch(() => pending.delete(courseId));
  return request;
}

/** Load the courses these skills belong to and return the skills with content. */
export async function loadSkills(
  skills: Pick<SkillOutline, 'id' | 'courseId'>[],
): Promise<Skill[]> {
  await Promise.all(
    [...new Set(skills.map((skill) => skill.courseId))]
      .filter((courseId) => !loadedCourses.has(courseId))
      .map(loadCourseContent),
  );
  return skills.map((skill) => {
    const found = loaded.get(skill.id);
    if (!found) throw new Error(`Unknown skill ${skill.id}.`);
    return found;
  });
}

export async function loadSkill(
  skill: Pick<SkillOutline, 'id' | 'courseId'>,
): Promise<Skill> {
  return (await loadSkills([skill]))[0];
}
