import {
  assessmentPolicy,
  type ChoiceQuestion,
  type KnowledgePoint,
  type Question,
  type Skill,
} from './curriculum';

// A knowledge-point lesson is a fixed sequence of steps: each point in order,
// then the skill's code exercise when its policy requires code. Skills without
// knowledge points keep one step per authored question.

/** Correct answers, on distinct questions, that pass one knowledge point. */
export const POINT_PASS_CORRECT = 2;
/** Incorrect answers on one knowledge point that fail the lesson attempt. */
export const POINT_FAIL_INCORRECT = 3;

export interface LessonStep {
  /** The evidence ID: a knowledge point ID or a question ID. */
  id: string;
  kind: 'point' | 'code' | 'question';
  title: string;
  point?: KnowledgePoint;
  questions: Question[];
}

interface Plan {
  steps: LessonStep[];
  stepIds: string[];
  /** Every question that can be served for this skill, by ID. */
  questions: Map<string, Question>;
  /** Evidence ID for each servable question. */
  evidence: Map<string, string>;
  points: KnowledgePoint[];
}

const plans = new WeakMap<Skill, Plan>();

function plan(skill: Skill): Plan {
  const cached = plans.get(skill);
  if (cached) return cached;
  const points = skill.knowledgePoints ?? [];
  const steps: LessonStep[] = [];
  if (points.length) {
    for (const point of points)
      steps.push({
        id: point.id,
        kind: 'point',
        title: point.title,
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
  const questions = new Map<string, Question>();
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

export function hasKnowledgePoints(skill: Skill): boolean {
  return plan(skill).points.length > 0;
}

/** Ordered lesson steps; their IDs are the evidence that masters the skill. */
export function lessonSteps(skill: Skill): LessonStep[] {
  return plan(skill).steps;
}

export function lessonEvidenceIds(skill: Skill): string[] {
  return plan(skill).stepIds;
}

/**
 * A question the engine can serve and grade for this skill. Legacy choice
 * questions of a knowledge-point skill are no longer part of its lesson.
 */
export function findQuestion(
  skill: Skill,
  questionId: string,
): Question | undefined {
  return plan(skill).questions.get(questionId);
}

/** The lesson step (point or question) a servable question gives evidence for. */
export function evidenceIdFor(
  skill: Skill,
  questionId: string,
): string | undefined {
  return plan(skill).evidence.get(questionId);
}

export function stepFor(skill: Skill, evidenceId: string) {
  return plan(skill).steps.find((step) => step.id === evidenceId);
}

export function masteryFraction(skill: Skill, evidence: string[]): number {
  const ids = plan(skill).stepIds;
  if (!ids.length) return 0;
  return ids.filter((id) => evidence.includes(id)).length / ids.length;
}

/** Evidence of every lesson step, plus each type the policy requires. */
export function hasLessonEvidence(skill: Skill, evidence: string[]): boolean {
  const { steps, stepIds } = plan(skill);
  if (!stepIds.length || !stepIds.every((id) => evidence.includes(id)))
    return false;
  if (hasKnowledgePoints(skill)) return true;
  return assessmentPolicy(skill).requiredTypes.every((type) =>
    steps.some(
      (step) =>
        evidence.includes(step.id) &&
        step.questions.some((question) => question.type === type),
    ),
  );
}

/** Answers needed in one due review cycle. */
export function reviewRequirement(skill: Skill) {
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
  skill: Skill,
  reviewQuestionIds: string[],
): boolean {
  const requirement = reviewRequirement(skill);
  const { questions, evidence, points } = plan(skill);
  if (!points.length)
    return (
      reviewQuestionIds.length >= requirement.answers &&
      requirement.types.every((type) =>
        reviewQuestionIds.some((id) => questions.get(id)?.type === type),
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
export function reviewProgress(skill: Skill, reviewQuestionIds: string[]) {
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
export function reviewPointOrder(skill: Skill, cycle: number) {
  const { points } = plan(skill);
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
