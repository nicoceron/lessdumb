import type {
  CurriculumCatalog,
  KnowledgePoint,
  MultistepProblem,
  Skill,
} from '../curriculum';
import { partId, problemId } from '../multistep';
import {
  vary,
  type GeneratorModule,
  type KnowledgePointDraft,
  type KnowledgePointModule,
  type MultistepDraft,
  type MultistepModule,
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
  /** Registered `*.multistep.ts` file names, checked against the folder by tests. */
  multistepFiles: string[];
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

/** Stable IDs: `<skill>-ms<n>` and `<skill>-ms<n>#p<k>`. */
function attachProblems(skill: Skill, drafts: MultistepDraft[]): Skill {
  const multistep: MultistepProblem[] = drafts.map((draft, index) => {
    const id = problemId(skill.id, index);
    return {
      id,
      title: draft.title,
      setup: draft.setup,
      parts: draft.parts.map((part, partIndex) => ({
        ...part,
        id: partId(id, partIndex),
      })),
    };
  });
  return { ...skill, multistep };
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
    multistepFiles: [],
    knowledgePointErrors: errors,
  };
}

/**
 * Attach a course's multistep problems (CEN-163), from its `*.multistep.ts`
 * files keyed by the skill whose reviews and quizzes ask them. They travel
 * with that skill's content, so the browser downloads them with its unit.
 */
export function withMultistep(
  content: CourseContent,
  modules: Record<string, MultistepModule>,
): CourseContent {
  const problems = new Map<
    string,
    { file: string; drafts: MultistepDraft[] }
  >();
  const errors: string[] = [];
  const ids = new Set(content.skills.map((skill) => skill.id));
  for (const [file, module] of Object.entries(modules))
    for (const [skillId, drafts] of Object.entries(module)) {
      if (problems.has(skillId))
        errors.push(
          `${skillId}: multistep problems defined in ${problems.get(skillId)!.file} and ${file}.`,
        );
      else if (!ids.has(skillId))
        errors.push(
          `${skillId}: multistep problems in ${file} for a skill outside ${content.courses.map((course) => course.id).join(', ')}.`,
        );
      problems.set(skillId, { file, drafts });
    }
  return {
    ...content,
    skills: content.skills.map((skill) => {
      const authored = problems.get(skill.id);
      return authored ? attachProblems(skill, authored.drafts) : skill;
    }),
    multistepFiles: [...content.multistepFiles, ...Object.keys(modules)],
    knowledgePointErrors: [...content.knowledgePointErrors, ...errors],
  };
}
