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
import {
  assessmentPolicy,
  assessmentType,
  encompassedBy as encompassedIn,
} from './catalog-outline';
import { mathSpans, mathTextErrors, mathTextFields } from './math-text';
import { synonymCollisionErrors, typedQuestionErrors } from './typed-answer';
import {
  MAX_PARTS,
  MIN_PARTS,
  partId,
  pointSkillId,
  problemId,
} from './multistep';
import {
  GENERATOR_SAMPLES,
  MIN_DISTINCT_VARIANTS,
  questionVariant,
  sampleVariants,
  variantKey,
  variantSeed,
} from './variants';
export {
  assessmentPolicy,
  assessmentType,
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
  /**
   * A generated question: each presentation asks a fresh seeded variant
   * from `generate` (see `src/lib/variants.ts`). The fields above are the
   * authored question that attempts without a recorded variant show.
   */
  generated?: true;
  /** The variant number this object shows, set by `questionVariant`. */
  variant?: number;
}

/** What a generator returns for one seed: a question of its own type. */
export type GeneratedFields<Q> = Omit<
  Q,
  'id' | 'generated' | 'generate' | 'variant'
>;

export interface ChoiceQuestion extends QuestionBase {
  type: 'choice';
  code?: string;
  choices: string[];
  answer: number;
  /** The correct choice is exactly what `code` prints; catalog tests run it. */
  checksOutput?: boolean;
  generate?: (seed: number) => GeneratedFields<ChoiceQuestion>;
}

/**
 * A typed number. The response is graded by `src/lib/typed-answer.ts`: it may
 * be an integer, a decimal, a simple fraction like `3/4`, scientific notation
 * like `1e-3`, or grouped in thousands (`1,000`), optionally followed by the
 * declared unit, and is correct within the absolute `tolerance`.
 */
export interface NumericQuestion extends QuestionBase {
  type: 'numeric';
  /** Shown with the question; never executed. */
  code?: string;
  answer: number;
  /** Absolute: correct when |response − answer| ≤ tolerance. Omitted is exact. */
  tolerance?: number;
  /**
   * Unit or format hint shown next to the input, e.g. `ms` or `to 2 decimals`.
   * A unit (one word without digits) may also end the response: `250 ms`.
   */
  unit?: string;
  generate?: (seed: number) => GeneratedFields<NumericQuestion>;
}

/**
 * A short typed answer: a predicted program output, a name, or a keyword.
 * Responses are compared line by line after trimming each line and
 * collapsing runs of spaces. An output question (`checksOutput`) or an
 * `exact` one stops there, case included unless `ignoreCase` is set. Any
 * other accepts equivalent forms: any case unless `caseSensitive`, wrapping
 * quotes or backticks, and trailing punctuation (`src/lib/typed-answer.ts`).
 */
export interface TextQuestion extends QuestionBase {
  type: 'text';
  code?: string;
  /** Accepted answers and synonyms; the first is the one shown after answering. */
  answers: string[];
  /** Case does not matter, for an exact question or a capitalized term. */
  ignoreCase?: boolean;
  /** Case is part of the answer, as in an identifier such as `True`. */
  caseSensitive?: boolean;
  /** Graded like an output: quotes and punctuation count, as in `'a'`. */
  exact?: boolean;
  /** The single accepted answer is exactly what `code` prints; catalog tests run it. */
  checksOutput?: boolean;
  generate?: (seed: number) => GeneratedFields<TextQuestion>;
}

/** A question the learner answers by typing rather than choosing. */
export type TypedQuestion = NumericQuestion | TextQuestion;

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

export type Question = ChoiceQuestion | TypedQuestion | CodeQuestion;

/** A question answered without running code: chosen or typed. */
export type AnswerQuestion = ChoiceQuestion | TypedQuestion;

/**
 * What an assessment policy can require: `code` is an executed exercise, and
 * `choice` is any question answered without running code (chosen or typed).
 */
export type AssessmentType = 'choice' | 'code';

/**
 * A question's identity and kind: what scheduling and evidence need. A
 * generated question never repeats a recent variant, so selection treats it
 * as always fresh.
 */
export type QuestionRef = Pick<Question, 'id' | 'type' | 'generated'>;

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

/**
 * One part of a multistep problem: a chosen or typed question on one
 * knowledge point, which may belong to the problem's skill or to one of its
 * ancestors. Its ID is `<problem>#p<k>`, numbered from 1 in order.
 */
export type MultistepPart = AnswerQuestion & {
  /** The knowledge point this part exercises, by ID (`<skill>-kp<n>`). */
  point: string;
};

/** The scenario every part of a multistep problem refers to, shown once. */
export interface MultistepSetup {
  /** Paragraphs of prose, with `$…$` math. */
  text: string[];
  /** A program or listing the parts refer to. */
  code?: string;
  /** The language of `code`; omitted means the course's. */
  language?: CodeLanguage;
  /** Exactly what `code` prints, shown under it; catalog tests run it. */
  output?: string;
  /** A table, log, or other data shown as written. */
  data?: string;
}

/**
 * One scenario and two to four ordered parts, each needing a different
 * earlier idea (CEN-163). Asked in due reviews and quizzes, never in lessons.
 */
export interface MultistepProblem {
  /** `<skill>-ms<n>`, from its position in its skill's list. */
  id: string;
  /** A short plain-text name. */
  title: string;
  setup: MultistepSetup;
  parts: MultistepPart[];
}

/** A multistep part's identity: what scheduling and evidence need. */
export type MultistepPartRef = QuestionRef & { point: string };

/** A multistep problem without its content, as the graph index keeps it. */
export interface MultistepRef {
  id: string;
  parts: MultistepPartRef[];
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
  /**
   * Subject-specific evidence needed within a spaced review cycle. Typed
   * questions meet a `choice` requirement, as choice questions do.
   */
  assessment?: { requiredTypes: AssessmentType[]; reviewAnswers: number };
  /**
   * How much practicing this skill also exercises each direct prerequisite,
   * 0 < weight <= 1. Omitted means every direct prerequisite at
   * DEFAULT_ENCOMPASS_WEIGHT. Authored heuristics, not fitted to learners.
   */
  encompasses?: { id: string; weight: number }[];
  /** Multistep problems its due reviews and quizzes ask (CEN-163). */
  multistep?: MultistepRef[];
}

export interface Skill extends SkillOutline {
  lesson: {
    paragraphs: string[];
    example: LessonExample;
  };
  knowledgePoints?: KnowledgePoint[];
  multistep?: MultistepProblem[];
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

/** Registered multistep problem files, checked against the folder by tests. */
export const multistepFiles = contents.flatMap((c) => c.multistepFiles);

/**
 * Each course's registered question generator files (`*.gen.ts` in
 * `src/lib/knowledge-points/`). The browser build attaches them to the
 * course's downloaded units, whose content arrives as JSON.
 */
export const generatorFiles: Record<string, string[]> = Object.fromEntries(
  contents
    .filter((c) => c.generatorFiles.length)
    .map((c) => [c.courses[0].id, c.generatorFiles]),
);

/** Skills whose practice also exercises `skillId`, in catalog order. */
export function encompassedBy<S extends SkillOutline = Skill>(
  skillId: string,
  registry: S[] = skills as unknown as S[],
): S[] {
  return encompassedIn(skillId, registry);
}

/**
 * Checks the registry contract before any scheduler or graph renderer uses it.
 * `checkTex` returns a TeX parse error, if any; tests pass KaTeX's parser so
 * this module and the client bundle stay free of KaTeX.
 */
export function validateCurriculum(
  registry: Skill[] = skills,
  catalog: Pick<CurriculumCatalog, 'courses' | 'units'> = defaultCatalog,
  checkTex?: (tex: string, displayMode: boolean) => string | undefined,
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
    // a separate list of choice or typed questions.
    if (points.length && item.questions.some((q) => q.type !== 'code'))
      errors.push(
        `${item.id}: choice and typed questions belong in knowledge points, not in questions.`,
      );
    // The launched Python course keeps its four-question assessment standard
    // for any skill not yet taught through knowledge points.
    if (item.courseId === 'python-foundations') {
      if (!item.questions.some((question) => question.type === 'code'))
        errors.push(`${item.id}: missing executable exercise.`);
      if (
        !points.length &&
        item.questions.filter(
          (question) => assessmentType(question.type) === 'choice',
        ).length < 3
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
        ).some((question) => assessmentType(question.type) === type)
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
    // A typed synonym must not accept a distractor of the same skill.
    errors.push(
      ...synonymCollisionErrors([
        ...item.questions,
        ...points.flatMap((point) => point.questions),
      ]),
    );
    for (const question of [
      ...item.questions,
      ...points.flatMap((point) => point.questions),
    ]) {
      if (
        (question.type === 'choice' || question.type === 'text') &&
        question.checksOutput &&
        !question.code?.trim()
      )
        errors.push(`${question.id}: output questions need code to run.`);
      if (!['choice', 'numeric', 'text', 'code'].includes(question.type))
        errors.push(`${question.id}: unknown question type.`);
      // Lessons have no hints (CEN-79): the worked example is the support.
      if ('hint' in question)
        errors.push(`${question.id}: questions have no hint; remove it.`);
      errors.push(...typedQuestionErrors(question));
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
    for (const question of item.questions)
      if (question.generated || 'generate' in question)
        errors.push(
          `${question.id}: generated questions belong in knowledge points.`,
        );
    for (const question of points.flatMap((point) => point.questions))
      errors.push(...generatedQuestionErrors(question, checkTex));
    errors.push(...multistepErrors(item, questions, checkTex));
    // Prose marks math with $…$ or $$…$$; a literal dollar is written \$.
    for (const [location, text] of mathTextFields(item))
      for (const error of [
        ...mathTextErrors(text),
        ...mathSpans(text).map(({ tex, display }) => checkTex?.(tex, display)),
      ])
        if (error) errors.push(`${location}: ${error}`);
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
  // A multistep part exercises a point of its problem's skill or of one of
  // that skill's ancestors, never an unrelated skill's.
  const pointIds = new Set(
    registry.flatMap((item) =>
      (item.knowledgePoints ?? []).map((point) => point.id),
    ),
  );
  for (const item of registry)
    for (const problem of item.multistep ?? [])
      for (const part of problem.parts) {
        const owner = pointSkillId(part.point ?? '');
        if (!pointIds.has(part.point))
          errors.push(`${part.id}: unknown knowledge point ${part.point}.`);
        else if (owner !== item.id && !ancestorsOf(item.id).has(owner))
          errors.push(
            `${part.id}: point ${part.point} belongs to ${owner}, which is neither ${item.id} nor one of its ancestors.`,
          );
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
 * A skill's multistep problems (CEN-163): generated IDs, a titled setup with
 * prose and optional code, output, or data, and two to four chosen or typed
 * parts, each a well-formed question on one knowledge point. At least one
 * part applies a point of the skill itself, which a missed part counts
 * against, and the parts name at least two different points. Whether each
 * point exists and belongs to the skill or an ancestor is checked once the
 * whole graph is known.
 */
function multistepErrors(
  item: Skill,
  questions: Set<string>,
  checkTex?: (tex: string, displayMode: boolean) => string | undefined,
): string[] {
  const problems = item.multistep;
  if (problems === undefined) return [];
  const errors: string[] = [];
  if (!item.knowledgePoints?.length)
    errors.push(`${item.id}: multistep problems need knowledge points.`);
  if (!problems.length)
    errors.push(`${item.id}: an empty multistep problem list.`);
  problems.forEach((problem, index) => {
    const at = problem.id;
    if (problem.id !== problemId(item.id, index))
      errors.push(`${at}: multistep problem IDs must be generated.`);
    if (!problem.title?.trim() || /\$/.test(problem.title))
      errors.push(`${at}: needs a plain-text title.`);
    const setup = problem.setup;
    if (
      !setup ||
      !Array.isArray(setup.text) ||
      !setup.text.length ||
      setup.text.some((paragraph) => !paragraph.trim())
    )
      errors.push(`${at}: the setup needs prose.`);
    if (
      setup?.language !== undefined &&
      !['python', 'rust', 'cpp'].includes(setup.language)
    )
      errors.push(`${at}: unsupported setup language.`);
    if (setup?.output !== undefined && !setup.code?.trim())
      errors.push(`${at}: a setup output needs the code that prints it.`);
    if (
      setup?.data !== undefined &&
      (typeof setup.data !== 'string' || !setup.data.trim())
    )
      errors.push(`${at}: setup data must be nonempty text.`);
    const parts = problem.parts ?? [];
    if (parts.length < MIN_PARTS || parts.length > MAX_PARTS)
      errors.push(`${at}: needs ${MIN_PARTS} to ${MAX_PARTS} parts.`);
    parts.forEach((part, partIndex) => {
      if (part.id !== partId(problem.id, partIndex))
        errors.push(`${at}: part IDs must be generated.`);
      if (!['choice', 'numeric', 'text'].includes(part.type)) {
        errors.push(
          `${part.id}: a part is a choice, numeric, or text question.`,
        );
        return;
      }
      if (typeof part.point !== 'string' || !/-kp\d+$/.test(part.point))
        errors.push(`${part.id}: needs the knowledge point it exercises.`);
      if (part.generated || 'generate' in part)
        errors.push(`${part.id}: parts cannot be generated.`);
      if ('hint' in part)
        errors.push(`${part.id}: questions have no hint; remove it.`);
      if (questions.has(part.id))
        errors.push(`Duplicate question ID ${part.id}.`);
      questions.add(part.id);
      // An output part runs its own code, or else the setup's.
      errors.push(
        ...answerQuestionErrors(
          { ...part, code: part.code ?? setup?.code },
          part.id,
          checkTex,
        ),
      );
    });
    if (!parts.some((part) => pointSkillId(part.point ?? '') === item.id))
      errors.push(`${at}: needs a part on a point of ${item.id} itself.`);
    if (new Set(parts.map((part) => part.point)).size < 2)
      errors.push(`${at}: its parts must name at least two different points.`);
  });
  return errors;
}

/**
 * The structural rules every concrete choice or typed question follows,
 * authored or generated: four or more distinct choices and a valid answer
 * index, a gradable typed answer, code for an output question, and closed
 * `$…$` math in its prose.
 */
function answerQuestionErrors(
  question: AnswerQuestion,
  location: string,
  checkTex?: (tex: string, displayMode: boolean) => string | undefined,
): string[] {
  const errors: string[] = [];
  if (question.type === 'choice') {
    if (
      !Array.isArray(question.choices) ||
      question.choices.length < 4 ||
      new Set(question.choices.map((c) => c.trim())).size !==
        question.choices.length
    )
      errors.push(`${location}: needs four or more distinct choices.`);
    else if (
      !Number.isInteger(question.answer) ||
      question.answer < 0 ||
      question.answer >= question.choices.length
    )
      errors.push(`${location}: invalid answer index.`);
  }
  if (
    (question.type === 'choice' || question.type === 'text') &&
    question.checksOutput &&
    !question.code?.trim()
  )
    errors.push(`${location}: output questions need code to run.`);
  if (!question.prompt?.trim() || !question.explanation?.trim())
    errors.push(`${location}: needs a prompt and an explanation.`);
  errors.push(
    ...typedQuestionErrors({ ...question, id: location } as Question),
  );
  const prose = [
    question.prompt ?? '',
    question.explanation ?? '',
    ...(question.type === 'choice' && !question.checksOutput
      ? question.choices
      : []),
  ];
  for (const text of prose)
    for (const error of [
      ...mathTextErrors(text),
      ...mathSpans(text).map(({ tex, display }) => checkTex?.(tex, display)),
    ])
      if (error) errors.push(`${location}: ${error}`);
  return errors;
}

/**
 * A generated question samples its first GENERATOR_SAMPLES variants, the
 * ones learners meet first. Each must be a well-formed question of the
 * generator's own type, deterministic for its seed, and together they must
 * offer at least MIN_DISTINCT_VARIANTS different questions.
 */
export function generatedQuestionErrors(
  question: Question,
  checkTex?: (tex: string, displayMode: boolean) => string | undefined,
): string[] {
  const generate = 'generate' in question ? question.generate : undefined;
  if (!question.generated && !generate) return [];
  if (question.type === 'code')
    return [`${question.id}: code exercises cannot be generated.`];
  if (!question.generated || typeof generate !== 'function')
    return [`${question.id}: a generator needs both generated and generate.`];
  const errors: string[] = [];
  const keys = new Set<string>();
  for (const variant of sampleVariants()) {
    const location = `${question.id} variant ${variant}`;
    let instance: AnswerQuestion;
    try {
      instance = questionVariant(question, variant);
      const call = generate as (seed: number) => object;
      const seed = variantSeed(question.id, variant);
      if (JSON.stringify(call(seed)) !== JSON.stringify(call(seed)))
        errors.push(`${location}: the same seed must give the same question.`);
    } catch (error) {
      errors.push(`${location}: the generator threw ${String(error)}.`);
      continue;
    }
    if (instance.type !== question.type)
      errors.push(`${location}: must be a ${question.type} question.`);
    if (
      (instance.type === 'choice' || instance.type === 'text') &&
      !!instance.checksOutput !==
        !!(question as ChoiceQuestion | TextQuestion).checksOutput
    )
      errors.push(`${location}: must check output exactly when its base does.`);
    errors.push(...answerQuestionErrors(instance, location, checkTex));
    keys.add(variantKey(instance));
  }
  if (keys.size < MIN_DISTINCT_VARIANTS)
    errors.push(
      `${question.id}: only ${keys.size} distinct variants in ${GENERATOR_SAMPLES} seeds; needs ${MIN_DISTINCT_VARIANTS}.`,
    );
  return [...new Set(errors)].slice(0, 5);
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
