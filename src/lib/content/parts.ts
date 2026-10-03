import type { Skill, SkillOutline } from '../curriculum';
import type { CourseContent } from '../knowledge-points';

// How lesson content is split into downloads ("parts"). Here, for the server
// and the tests, a part is a whole course, loaded from its content module.
//
// For the browser, `scripts/catalog-index-plugin.mjs` replaces this module
// with one part per unit, generated at build time from these same modules:
// each unit's skills become their own small, content-hashed chunk, so opening
// a lesson downloads only its unit. Keep the exports below in step with the
// plugin's generated module (the build fails on a missing export).

export interface ContentPart {
  courseId: string;
  load: () => Promise<Skill[]>;
}

const course = (load: () => Promise<{ default: CourseContent }>) => async () =>
  (await load()).default.skills;

export const contentParts: Record<string, ContentPart> = {
  'python-foundations': {
    courseId: 'python-foundations',
    load: course(() => import('./python-foundations')),
  },
  'quantitative-foundations': {
    courseId: 'quantitative-foundations',
    load: course(() => import('./quantitative-foundations')),
  },
  'python-data-analysis': {
    courseId: 'python-data-analysis',
    load: course(() => import('./python-data-analysis')),
  },
  'machine-learning': {
    courseId: 'machine-learning',
    load: course(() => import('./machine-learning')),
  },
  'data-systems-foundations': {
    courseId: 'data-systems-foundations',
    load: course(() => import('./data-systems-foundations')),
  },
  'competitive-programming': {
    courseId: 'competitive-programming',
    load: course(() => import('./competitive-programming')),
  },
  rust: { courseId: 'rust', load: course(() => import('./rust')) },
  cpp: { courseId: 'cpp', load: course(() => import('./cpp')) },
};

/** The part that holds a skill's content. */
export function partOf(skill: Pick<SkillOutline, 'courseId' | 'unitId'>) {
  return skill.courseId;
}
