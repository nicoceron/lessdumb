// The complete curriculum: every course with its lessons, knowledge points,
// questions, exercises, and cards. Servers, tests, and the build import it.
// Browser code must not: it uses `import type` from here, the graph index in
// `./catalog-index` for structure, and `./content` to load one course at a
// time. The build fails if a client module imports this file.
import pythonFoundations from './content/python-foundations';
import quantitativeFoundations from './content/quantitative-foundations';
import pythonDataAnalysis from './content/python-data-analysis';
import machineLearning from './content/machine-learning';
import dataSystemsFoundations from './content/data-systems-foundations';
import competitiveProgramming from './content/competitive-programming';
import rust from './content/rust';
import cpp from './content/cpp';
import { registerSkills } from './content';
import { assessmentPolicy, encompassedBy as encompassedIn } from './catalog-outline';
export {
  assessmentPolicy,
  DEFAULT_ENCOMPASS_WEIGHT,
  encompassings,
} from './catalog-outline';
export type Domain = 'programming' | 'mathematics' | 'physics' | 'language';
export type CodeLanguage = 'python' | 'rust' | 'cpp';

export interface Course {
  id: string;
  title: string;
  description: string;
  domain: Domain;
  language?: string;
  skillIds: string[];
  /** Public topic references, never part of a learner's private progress. */
  resources?: { label: string; url: string }[];
}

export interface Unit {
  id: string;
  title: string;
  description: string;
  courseId: string;
}

interface QuestionBase {
  id: string;
  prompt: string;
  explanation: string;
  hint: string;
}

export interface ChoiceQuestion extends QuestionBase {
  type: 'choice';
  code?: string;
  choices: string[];
  answer: number;
  /** The correct choice is exactly what `code` prints; catalog tests run it. */
  checksOutput?: boolean;
}

export interface CodeQuestion extends QuestionBase {
  type: 'code';
  /** Omitted in existing accounts/catalogs means Python. */
  language?: CodeLanguage;
  starterCode: string;
  solution: string;
  /** Learner-visible behavior checks, separate from the reference solution. */
  contract?: string;
  /** Authored assertions/harness in the question's actual language. */
  tests: string;
}

export type Question = ChoiceQuestion | CodeQuestion;

/** A question's identity and kind: what scheduling and evidence need. */
export type QuestionRef = Pick<Question, 'id' | 'type'>;

export interface Flashcard {
  id: string;
  skillId: string;
  front: string;
  back: string;
}

export interface LessonExample {
  code: string;
  output: string;
  explanation: string;
  kind?: 'code' | 'text';
  label?: string;
  language?: CodeLanguage;
}

/** A knowledge point without its teaching: its ID and question IDs. */
export interface KnowledgePointRef {
  id: string;
  questions: QuestionRef[];
}

/**
 * One separately practiced idea inside a skill: a short explanation, a fully
 * worked example, then interchangeable practice questions on that idea only.
 */
export interface KnowledgePoint extends KnowledgePointRef {
  title: string;
  explanation: string[];
  example: LessonExample;
  questions: Question[];
}

/**
 * A skill as the graph, scheduler, and dashboards see it: identity, place in
 * the graph, and the IDs of its points, questions, and cards, without lesson
 * content. The browser keeps every skill's outline in memory and loads a
 * course's content only when a lesson, review, quiz, or placement test needs it.
 */
export interface SkillOutline {
  id: string;
  courseId: string;
  domain: Domain;
  unitId: string;
  title: string;
  summary: string;
  prerequisites: string[];
  order: number;
  estimatedMinutes: number;
  /** Optional atomic sequence metadata; prerequisites remain the unlock authority. */
  topicId?: string;
  /** Topic name when it differs from the title of the topic's final stage. */
  topicTitle?: string;
  stage?: number;
  stageCount?: number;
  /** Ordered knowledge points; the lesson teaches and practices each in turn. */
  knowledgePoints?: KnowledgePointRef[];
  /**
   * The code exercise, if any. Skills without knowledge points keep their
   * whole authored question list here.
   */
  questions: QuestionRef[];
  flashcards: Pick<Flashcard, 'id'>[];
  /** Subject-specific evidence needed within a spaced review cycle. */
  assessment?: { requiredTypes: Question['type'][]; reviewAnswers: number };
  /**
   * How much practicing this skill also exercises each direct prerequisite,
   * 0 < weight <= 1. Omitted means every direct prerequisite at
   * DEFAULT_ENCOMPASS_WEIGHT. Authored heuristics, not fitted to learners.
   */
  encompasses?: { id: string; weight: number }[];
}

export interface Skill extends SkillOutline {
  lesson: {
    paragraphs: string[];
    example: LessonExample;
  };
  knowledgePoints?: KnowledgePoint[];
  questions: Question[];
  flashcards: Flashcard[];
}

export interface CurriculumCatalog<S extends SkillOutline = Skill> {
  courses: Course[];
  units: Unit[];
  skills: S[];
}

/** What the engine schedules over: full skills or their outlines. */
export type GraphCatalog = CurriculumCatalog<SkillOutline>;

// Catalog order: Python first, then each course in the order it was added.
const contents = [
  pythonFoundations,
  quantitativeFoundations,
  pythonDataAnalysis,
  machineLearning,
  dataSystemsFoundations,
  competitiveProgramming,
  rust,
  cpp,
];
export const courses: Course[] = contents.flatMap((c) => c.courses);
export const units: Unit[] = contents.flatMap((c) => c.units);
export const skills: Skill[] = contents.flatMap((c) => c.skills);
export const skillById: Record<string, Skill> = Object.fromEntries(
  skills.map((item) => [item.id, item]),
);
// Everything is already in memory here, so every skill counts as loaded.
registerSkills(skills);

export const allFlashcards: Flashcard[] = skills.flatMap(
  (item) => item.flashcards,
);
export const defaultCatalog: CurriculumCatalog = { courses, units, skills };

/** Registered knowledge-point files, checked against the folder by tests. */
export const knowledgePointFiles = contents.flatMap(
  (c) => c.knowledgePointFiles,
);

/** Skills whose practice also exercises `skillId`, in catalog order. */
export function encompassedBy<S extends SkillOutline = Skill>(
  skillId: string,
  registry: S[] = skills as unknown as S[],
): S[] {
  return encompassedIn(skillId, registry);
}

/** Checks the registry contract before any scheduler or graph renderer uses it. */
export function validateCurriculum(
  registry: Skill[] = skills,
  catalog: Pick<CurriculumCatalog, 'courses' | 'units'> = defaultCatalog,
): string[] {
  const errors: string[] = [];
  const ids = new Set(registry.map((item) => item.id));
  if (ids.size !== registry.length) errors.push('Skill IDs must be unique.');
  if (
    new Set(catalog.courses.map((course) => course.id)).size !==
    catalog.courses.length
  )
    errors.push('Course IDs must be unique.');
  if (
    new Set(catalog.units.map((unit) => unit.id)).size !== catalog.units.length
  )
    errors.push('Unit IDs must be unique.');
  for (const course of catalog.courses) {
    if (new Set(course.skillIds).size !== course.skillIds.length)
      errors.push(`${course.id}: duplicate member skill IDs.`);
    for (const id of course.skillIds)
      if (!ids.has(id))
        errors.push(`${course.id}: unknown member skill ${id}.`);
  }
  for (const unit of catalog.units)
    if (!catalog.courses.some((course) => course.id === unit.courseId))
      errors.push(`${unit.id}: unknown course ${unit.courseId}.`);
  const questions = new Set<string>();
  const cards = new Set<string>();
  for (const item of registry) {
    if (!catalog.courses.some((course) => course.id === item.courseId))
      errors.push(`${item.id}: unknown course ${item.courseId}.`);
    else if (
      !catalog.courses
        .find((course) => course.id === item.courseId)!
        .skillIds.includes(item.id)
    )
      errors.push(`${item.id}: missing from its course's member skills.`);
    if (
      !catalog.units.some(
        (unit) => unit.id === item.unitId && unit.courseId === item.courseId,
      )
    )
      errors.push(`${item.id}: unknown unit ${item.unitId}.`);
    for (const prerequisite of item.prerequisites)
      if (!ids.has(prerequisite))
        errors.push(`${item.id}: unknown prerequisite ${prerequisite}.`);
    if (item.encompasses) {
      const named = item.encompasses.map((entry) => entry.id);
      if (new Set(named).size !== named.length)
        errors.push(`${item.id}: duplicate encompassed skill.`);
      for (const entry of item.encompasses) {
        if (!item.prerequisites.includes(entry.id))
          errors.push(
            `${item.id}: encompasses ${entry.id}, which is not a direct prerequisite.`,
          );
        if (
          typeof entry.weight !== 'number' ||
          !Number.isFinite(entry.weight) ||
          entry.weight <= 0 ||
          entry.weight > 1
        )
          errors.push(
            `${item.id}: encompassing weight for ${entry.id} must be in (0, 1].`,
          );
      }
    }
    const courseLanguage = catalog.courses.find(
      (course) => course.id === item.courseId,
    )?.language;
    if (
      item.lesson.example.language !== undefined &&
      !['python', 'rust', 'cpp'].includes(item.lesson.example.language)
    )
      errors.push(`${item.id}: unsupported example language.`);
    if (
      item.lesson.example.kind !== 'text' &&
      ['rust', 'cpp'].includes(courseLanguage ?? '') &&
      item.lesson.example.language !== courseLanguage
    )
      errors.push(`${item.id}: example language must match its course.`);
    if (
      item.topicId !== undefined ||
      item.stage !== undefined ||
      item.stageCount !== undefined
    ) {
      const topic = registry.find((candidate) => candidate.id === item.topicId);
      if (
        !topic ||
        topic.courseId !== item.courseId ||
        topic.unitId !== item.unitId
      )
        errors.push(`${item.id}: invalid stage topic.`);
      if (
        !Number.isInteger(item.stage) ||
        !Number.isInteger(item.stageCount) ||
        item.stage! < 1 ||
        item.stageCount! < 2 ||
        item.stage! > item.stageCount!
      )
        errors.push(`${item.id}: invalid stage position.`);
      const members = registry.filter(
        (candidate) => candidate.topicId === item.topicId,
      );
      if (
        members.length !== item.stageCount ||
        new Set(members.map((member) => member.stage)).size !==
          item.stageCount ||
        members.some((member) => member.stageCount !== item.stageCount)
      )
        errors.push(`${item.id}: incomplete stage sequence.`);
    }
    const points = item.knowledgePoints ?? [];
    if (!item.questions.length && !points.length)
      errors.push(`${item.id}: missing assessment questions.`);
    // A lesson taught through knowledge points serves their questions, never
    // a separate list of choice questions.
    if (points.length && item.questions.some((q) => q.type === 'choice'))
      errors.push(
        `${item.id}: choice questions belong in knowledge points, not in questions.`,
      );
    // The launched Python course keeps its four-question assessment standard
    // for any skill not yet taught through knowledge points.
    if (item.courseId === 'python-foundations') {
      if (!item.questions.some((question) => question.type === 'code'))
        errors.push(`${item.id}: missing executable exercise.`);
      if (
        !points.length &&
        item.questions.filter((question) => question.type === 'choice').length <
          3
      )
        errors.push(`${item.id}: needs three choice questions.`);
    }
    const policy = assessmentPolicy(item);
    // Knowledge-point reviews ask one question per point, plus code.
    const reviewItems = points.length || item.questions.length;
    if (
      !Number.isInteger(policy.reviewAnswers) ||
      policy.reviewAnswers < 1 ||
      policy.reviewAnswers > reviewItems
    )
      errors.push(`${item.id}: invalid review answer count.`);
    if (
      !policy.requiredTypes.length ||
      new Set(policy.requiredTypes).size !== policy.requiredTypes.length
    )
      errors.push(
        `${item.id}: assessment types must be nonempty and distinct.`,
      );
    if (!points.length && policy.requiredTypes.length > policy.reviewAnswers)
      errors.push(
        `${item.id}: review answer count cannot cover all required types.`,
      );
    for (const type of policy.requiredTypes)
      if (
        !(
          type === 'code'
            ? item.questions
            : [...item.questions, ...points.flatMap((point) => point.questions)]
        ).some((question) => question.type === type)
      )
        errors.push(`${item.id}: missing required assessment type ${type}.`);
    if (
      item.knowledgePoints !== undefined &&
      (points.length < 2 || points.length > 5)
    )
      errors.push(`${item.id}: needs two to five knowledge points.`);
    for (const point of points) {
      if (!point.title.trim() || !point.explanation.some((p) => p.trim()))
        errors.push(`${point.id}: needs a title and an explanation.`);
      if (point.questions.length < 3)
        errors.push(`${point.id}: needs at least three practice questions.`);
      if (
        point.example.kind !== 'text' &&
        ['rust', 'cpp'].includes(courseLanguage ?? '') &&
        point.example.language !== courseLanguage
      )
        errors.push(`${point.id}: example language must match its course.`);
      for (const question of point.questions)
        if (
          question.type === 'choice' &&
          (question.choices.length < 4 ||
            new Set(question.choices.map((c) => c.trim())).size !==
              question.choices.length)
        )
          errors.push(`${question.id}: needs four or more distinct choices.`);
    }
    for (const question of [
      ...item.questions,
      ...points.flatMap((point) => point.questions),
    ]) {
      if (
        question.type === 'choice' &&
        question.checksOutput &&
        !question.code?.trim()
      )
        errors.push(`${question.id}: output questions need code to run.`);
      if (questions.has(question.id))
        errors.push(`Duplicate question ID ${question.id}.`);
      questions.add(question.id);
      if (
        question.type === 'choice' &&
        (!Number.isInteger(question.answer) ||
          question.answer < 0 ||
          question.answer >= question.choices.length)
      )
        errors.push(`${question.id}: invalid answer index.`);
      if (
        question.type === 'code' &&
        (!question.tests.trim() || !question.solution.trim())
      )
        errors.push(`${question.id}: missing tests or solution.`);
      if (
        question.type === 'code' &&
        question.language !== undefined &&
        !['python', 'rust', 'cpp'].includes(question.language)
      )
        errors.push(`${question.id}: unsupported code language.`);
      if (
        question.type === 'code' &&
        ['rust', 'cpp'].includes(courseLanguage ?? '') &&
        question.language !== courseLanguage
      )
        errors.push(`${question.id}: code language must match its course.`);
    }
    for (const card of item.flashcards) {
      if (cards.has(card.id)) errors.push(`Duplicate flashcard ID ${card.id}.`);
      cards.add(card.id);
      if (card.skillId !== item.id) errors.push(`${card.id}: wrong skill ID.`);
    }
  }
  const byId = Object.fromEntries(registry.map((item) => [item.id, item]));
  const visiting = new Set<string>();
  const visited = new Set<string>();
  function visit(id: string) {
    if (visiting.has(id)) {
      errors.push(`Prerequisite cycle at ${id}.`);
      return;
    }
    if (visited.has(id) || !byId[id]) return;
    visiting.add(id);
    byId[id].prerequisites.forEach(visit);
    visiting.delete(id);
    visited.add(id);
  }
  registry.forEach((item) => visit(item.id));
  if (errors.some((error) => error.startsWith('Prerequisite cycle')))
    return errors;
  // Edges list direct requirements only. An edge already implied through
  // another prerequisite hides the real structure and narrows no frontier.
  const ancestors = new Map<string, Set<string>>();
  function ancestorsOf(id: string): Set<string> {
    const cached = ancestors.get(id);
    if (cached) return cached;
    const result = new Set<string>();
    for (const parent of byId[id]?.prerequisites ?? []) {
      result.add(parent);
      ancestorsOf(parent).forEach((ancestor) => result.add(ancestor));
    }
    ancestors.set(id, result);
    return result;
  }
  for (const item of registry) {
    if (new Set(item.prerequisites).size !== item.prerequisites.length)
      errors.push(`${item.id}: duplicate prerequisite.`);
    for (const prerequisite of item.prerequisites) {
      const parent = byId[prerequisite];
      if (parent?.courseId === item.courseId && parent.order >= item.order)
        errors.push(
          `${item.id}: teaching order places it before prerequisite ${prerequisite}.`,
        );
      const via = item.prerequisites.find(
        (other) =>
          other !== prerequisite && ancestorsOf(other).has(prerequisite),
      );
      if (via)
        errors.push(
          `${item.id}: prerequisite ${prerequisite} is already implied by ${via}.`,
        );
    }
  }
  return errors;
}

/**
 * Authored knowledge points must name skills of the course whose content
 * module registers them, once each.
 */
export function validateKnowledgePointRegistry(): string[] {
  const owner = new Map<string, string>();
  const errors = contents.flatMap((c) => c.knowledgePointErrors);
  for (const content of contents)
    for (const id of content.knowledgePointSkillIds) {
      if (owner.has(id))
        errors.push(
          `${id}: knowledge points registered by ${owner.get(id)} and ${content.courses[0]?.id}.`,
        );
      owner.set(id, content.courses[0]?.id ?? '');
    }
  return errors;
}
