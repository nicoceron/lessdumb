import type { CurriculumCatalog, KnowledgePoint, Skill } from '../curriculum';
import {
  vary,
  type GeneratorModule,
  type KnowledgePointDraft,
  type KnowledgePointModule,
} from './authoring';

export * from './authoring';

/** A course with its knowledge points attached, as its content module exports it. */
export interface CourseContent extends CurriculumCatalog {
  /** Registered `*.kp.ts` file names, checked against the folder by tests. */
  knowledgePointFiles: string[];
  /** Skills these files author points for, whether or not the course has them. */
  knowledgePointSkillIds: string[];
  /** Registered `*.gen.ts` file names, checked against the folder by tests. */
  generatorFiles: string[];
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
 * Attach generators to the authored questions they vary, by question ID.
 * The server attaches them when it builds the curriculum; the browser, whose
 * lesson content arrives as JSON without functions, attaches the same
 * `*.gen.ts` modules to each downloaded unit. Returns new skill objects for
 * skills with generated questions and the others unchanged.
 */
export function attachGenerators(
  skills: Skill[],
  modules: GeneratorModule[],
): Skill[] {
  const generators = new Map(
    modules.flatMap((module) => Object.entries(module)),
  );
  if (!generators.size) return skills;
  return skills.map((skill) => {
    if (
      !skill.knowledgePoints?.some((point) =>
        point.questions.some((question) => generators.has(question.id)),
      )
    )
      return skill;
    return {
      ...skill,
      knowledgePoints: skill.knowledgePoints.map((point) => ({
        ...point,
        questions: point.questions.map((question) => {
          const generate = generators.get(question.id);
          return generate && question.type !== 'code'
            ? vary(question, generate)
            : question;
        }),
      })),
    };
  });
}

/** Generator keys that name no choice or typed question of these skills. */
function generatorErrors(
  skills: Skill[],
  generators: Record<string, GeneratorModule>,
): string[] {
  const questions = new Map(
    skills.flatMap((skill) =>
      (skill.knowledgePoints ?? []).flatMap((point) =>
        point.questions.map((question) => [question.id, question] as const),
      ),
    ),
  );
  const errors: string[] = [];
  const seen = new Map<string, string>();
  for (const [file, module] of Object.entries(generators))
    for (const id of Object.keys(module)) {
      const question = questions.get(id);
      if (!question)
        errors.push(`${id}: generator in ${file} for an unknown question.`);
      else if (question.type === 'code')
        errors.push(`${id}: generator in ${file} for a code exercise.`);
      if (seen.has(id))
        errors.push(`${id}: generators in ${seen.get(id)} and ${file}.`);
      seen.set(id, file);
    }
  return errors;
}

/**
 * Each course registers its own `*.kp.ts` files in its content module
 * (`src/lib/content/<course>.ts`), keyed by file name, so the browser can
 * load one course's points without the others, and its `*.gen.ts` question
 * generators the same way.
 */
export function withKnowledgePoints(
  catalog: CurriculumCatalog,
  modules: Record<string, KnowledgePointModule>,
  generators: Record<string, GeneratorModule> = {},
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
  const skills = catalog.skills.map((skill) => {
    const authored = registry.get(skill.id);
    return authored ? attach(skill, authored.drafts) : skill;
  });
  errors.push(...generatorErrors(skills, generators));
  return {
    ...catalog,
    skills: attachGenerators(skills, Object.values(generators)),
    knowledgePointFiles: Object.keys(modules),
    knowledgePointSkillIds: [...registry.keys()],
    generatorFiles: Object.keys(generators),
    knowledgePointErrors: errors,
  };
}
