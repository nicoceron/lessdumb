import type { CurriculumCatalog, KnowledgePoint, Skill } from '../curriculum';
import type { KnowledgePointDraft, KnowledgePointModule } from './authoring';

export * from './authoring';

/** A course with its knowledge points attached, as its content module exports it. */
export interface CourseContent extends CurriculumCatalog {
  /** Registered `*.kp.ts` file names, checked against the folder by tests. */
  knowledgePointFiles: string[];
  /** Skills these files author points for, whether or not the course has them. */
  knowledgePointSkillIds: string[];
  knowledgePointErrors: string[];
}

/** Stable IDs: `<skill>-kp<n>` and `<skill>-kp<n>-q<m>`. */
function attach(skill: Skill, drafts: KnowledgePointDraft[]): Skill {
  const knowledgePoints: KnowledgePoint[] = drafts.map((draft, index) => {
    const id = `${skill.id}-kp${index + 1}`;
    return {
      ...draft,
      id,
      questions: draft.questions.map((question, questionIndex) => ({
        ...question,
        id: `${id}-q${questionIndex + 1}`,
      })),
    };
  });
  return { ...skill, knowledgePoints };
}

/**
 * Each course registers its own `*.kp.ts` files in its content module
 * (`src/lib/content/<course>.ts`), keyed by file name, so the browser can
 * load one course's points without the others.
 */
export function withKnowledgePoints(
  catalog: CurriculumCatalog,
  modules: Record<string, KnowledgePointModule>,
): CourseContent {
  const registry = new Map<
    string,
    { file: string; drafts: KnowledgePointDraft[] }
  >();
  const errors: string[] = [];
  for (const [file, module] of Object.entries(modules))
    for (const [skillId, drafts] of Object.entries(module)) {
      if (registry.has(skillId))
        errors.push(
          `${skillId}: knowledge points defined in ${registry.get(skillId)!.file} and ${file}.`,
        );
      registry.set(skillId, { file, drafts });
    }
  const ids = new Set(catalog.skills.map((skill) => skill.id));
  for (const [skillId, { file }] of registry)
    if (!ids.has(skillId))
      errors.push(
        `${skillId}: knowledge points in ${file} for a skill outside ${catalog.courses.map((course) => course.id).join(', ')}.`,
      );
  return {
    ...catalog,
    skills: catalog.skills.map((skill) => {
      const authored = registry.get(skill.id);
      return authored ? attach(skill, authored.drafts) : skill;
    }),
    knowledgePointFiles: Object.keys(modules),
    knowledgePointSkillIds: [...registry.keys()],
    knowledgePointErrors: errors,
  };
}
