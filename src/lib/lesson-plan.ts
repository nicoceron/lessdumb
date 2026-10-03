import type {
  ChoiceQuestion,
  KnowledgePoint,
  KnowledgePointRef,
  Question,
  QuestionRef,
  Skill,
  SkillOutline,
} from './curriculum';
import { assessmentPolicy, assessmentType } from './catalog-outline';

// A knowledge-point lesson is a fixed sequence of steps: each point in order,
// then the skill's code exercise when its policy requires code. Skills without
// knowledge points keep one step per authored question.
//
// The plan needs only IDs and question types, so it runs on skill outlines.
// Given a skill with its content, the same functions return that content.

/** Correct answers, on distinct questions, that pass one knowledge point. */
export const POINT_PASS_CORRECT = 2;
/** Incorrect answers on one knowledge point that fail the lesson attempt. */
export const POINT_FAIL_INCORRECT = 3;

export interface LessonStep<
  P extends KnowledgePointRef = KnowledgePoint,
  Q extends QuestionRef = Question,
> {
  /** The evidence ID: a knowledge point ID or a question ID. */
  id: string;
  kind: 'point' | 'code' | 'question';
  /** Display title; empty for a point whose content is not loaded. */
  title: string;
  point?: P;
  questions: Q[];
}

/** Lesson steps of a skill outline: IDs and question types only. */
export type LessonStepRef = LessonStep<KnowledgePointRef, QuestionRef>;

/** A full skill's steps carry content; an outline's carry references. */
export type StepOf<S extends SkillOutline> = S extends Skill
  ? LessonStep
  : LessonStepRef;
export type QuestionOf<S extends SkillOutline> = S extends Skill
  ? Question
  : QuestionRef;
export type PointOf<S extends SkillOutline> = S extends Skill
  ? KnowledgePoint
  : KnowledgePointRef;

interface Plan {
  steps: LessonStepRef[];
  stepIds: string[];
  /** Every question that can be served for this skill, by ID. */
  questions: Map<string, QuestionRef>;
  /** Evidence ID for each servable question. */
  evidence: Map<string, string>;
  points: KnowledgePointRef[];
}

const plans = new WeakMap<SkillOutline, Plan>();

function plan(skill: SkillOutline): Plan {
  const cached = plans.get(skill);
  if (cached) return cached;
  const points = skill.knowledgePoints ?? [];
  const steps: LessonStepRef[] = [];
  if (points.length) {
    for (const point of points)
      steps.push({
        id: point.id,
        kind: 'point',
        title: 'title' in point ? String(point.title) : '',
        point,
        questions: point.questions,
      });
    if (assessmentPolicy(skill).requiredTypes.includes('code'))
      for (const question of skill.questions)
        if (question.type === 'code')
          steps.push({
            id: question.id,
            kind: 'code',
            title: 'Write the code',
            questions: [question],
          });
  } else
    skill.questions.forEach((question, index) =>
      steps.push({
        id: question.id,
        kind: question.type === 'code' ? 'code' : 'question',
        title:
          question.type === 'code' ? 'Write the code' : `Check ${index + 1}`,
        questions: [question],
      }),
    );
  const questions = new Map<string, QuestionRef>();
  const evidence = new Map<string, string>();
  for (const step of steps)
    for (const question of step.questions) {
      questions.set(question.id, question);
      evidence.set(question.id, step.id);
    }
  const result: Plan = {
    steps,
    stepIds: steps.map((step) => step.id),
    questions,
    evidence,
    points,
  };
  plans.set(skill, result);
  return result;
}

export function hasKnowledgePoints(skill: SkillOutline): boolean {
  return plan(skill).points.length > 0;
}

/** Ordered lesson steps; their IDs are the evidence that masters the skill. */
export function lessonSteps<S extends SkillOutline>(skill: S): StepOf<S>[] {
  return plan(skill).steps as StepOf<S>[];
}

export function lessonEvidenceIds(skill: SkillOutline): string[] {
  return plan(skill).stepIds;
}

/**
 * A question the engine can serve and grade for this skill. Legacy choice
 * questions of a knowledge-point skill are no longer part of its lesson.
 */
export function findQuestion<S extends SkillOutline>(
  skill: S,
  questionId: string,
): QuestionOf<S> | undefined {
  return plan(skill).questions.get(questionId) as QuestionOf<S> | undefined;
}

/** The lesson step (point or question) a servable question gives evidence for. */
export function evidenceIdFor(
  skill: SkillOutline,
  questionId: string,
): string | undefined {
  return plan(skill).evidence.get(questionId);
}

export function stepFor<S extends SkillOutline>(
  skill: S,
  evidenceId: string,
): StepOf<S> | undefined {
  return plan(skill).steps.find((step) => step.id === evidenceId) as
    StepOf<S> | undefined;
}

export function masteryFraction(
  skill: SkillOutline,
  evidence: string[],
): number {
  const ids = plan(skill).stepIds;
  if (!ids.length) return 0;
  return ids.filter((id) => evidence.includes(id)).length / ids.length;
}

/** Evidence of every lesson step, plus each type the policy requires. */
export function hasLessonEvidence(
  skill: SkillOutline,
  evidence: string[],
): boolean {
  const { steps, stepIds } = plan(skill);
  if (!stepIds.length || !stepIds.every((id) => evidence.includes(id)))
    return false;
  if (hasKnowledgePoints(skill)) return true;
  return assessmentPolicy(skill).requiredTypes.every((type) =>
    steps.some(
      (step) =>
        evidence.includes(step.id) &&
        step.questions.some(
          (question) => assessmentType(question.type) === type,
        ),
    ),
  );
}

/** Answers needed in one due review cycle. */
export function reviewRequirement(skill: SkillOutline) {
  const policy = assessmentPolicy(skill);
  const { points } = plan(skill);
  if (!points.length)
    return {
      points: 0,
      code: false,
      answers: policy.reviewAnswers,
      types: policy.requiredTypes,
    };
  const code =
    policy.requiredTypes.includes('code') &&
    skill.questions.some((question) => question.type === 'code');
  return {
    points: Math.min(policy.reviewAnswers, points.length),
    code,
    answers: Math.min(policy.reviewAnswers, points.length) + (code ? 1 : 0),
    types: policy.requiredTypes,
  };
}

/** Whether these distinct correct review answers complete a due cycle. */
export function reviewCycleComplete(
  skill: SkillOutline,
  reviewQuestionIds: string[],
): boolean {
  const requirement = reviewRequirement(skill);
  const { questions, evidence, points } = plan(skill);
  if (!points.length)
    return (
      reviewQuestionIds.length >= requirement.answers &&
      requirement.types.every((type) =>
        reviewQuestionIds.some((id) => {
          const question = questions.get(id);
          return !!question && assessmentType(question.type) === type;
        }),
      )
    );
  const pointIds = new Set(points.map((point) => point.id));
  const covered = new Set(
    reviewQuestionIds
      .map((id) => evidence.get(id))
      .filter((id): id is string => !!id && pointIds.has(id)),
  );
  return (
    covered.size >= requirement.points &&
    (!requirement.code ||
      reviewQuestionIds.some((id) => questions.get(id)?.type === 'code'))
  );
}

/** Review slots for display: one per point answered or still needed, plus code. */
export function reviewProgress(
  skill: SkillOutline,
  reviewQuestionIds: string[],
) {
  const requirement = reviewRequirement(skill);
  const { questions, evidence, points } = plan(skill);
  if (!points.length) {
    const done = Math.min(reviewQuestionIds.length, requirement.answers);
    return { done, total: requirement.answers };
  }
  const pointIds = new Set(points.map((point) => point.id));
  const covered = new Set(
    reviewQuestionIds
      .map((id) => evidence.get(id))
      .filter((id): id is string => !!id && pointIds.has(id)),
  );
  const code = reviewQuestionIds.some(
    (id) => questions.get(id)?.type === 'code',
  );
  return {
    done:
      Math.min(covered.size, requirement.points) +
      (requirement.code && code ? 1 : 0),
    total: requirement.answers,
  };
}

/** Points ordered for a review cycle; each cycle starts one point later. */
export function reviewPointOrder<S extends SkillOutline>(
  skill: S,
  cycle: number,
): PointOf<S>[] {
  const points = plan(skill).points as PointOf<S>[];
  if (!points.length) return [];
  const start = ((cycle % points.length) + points.length) % points.length;
  return [...points.slice(start), ...points.slice(0, start)];
}

/** Choice questions that are part of the skill's lesson or review. */
export function servedChoiceQuestions(skill: Skill): ChoiceQuestion[] {
  return [...plan(skill).questions.values()].filter(
    (question): question is ChoiceQuestion => question.type === 'choice',
  );
}

/**
 * Question IDs of the four-question lessons that knowledge points replaced:
 * `<skill>-q1` to `-q4`. Their choice questions are retired (CEN-117) and the
 * code exercise kept slot 4, but saved evidence, review cycles, XP ledgers,
 * attempts, and cards may still name any of them.
 */
export function legacyQuestionIds(skill: Pick<SkillOutline, 'id'>): string[] {
  return [1, 2, 3, 4].map((slot) => `${skill.id}-q${slot}`);
}
