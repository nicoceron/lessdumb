import type { Skill } from './curriculum';

// XP measures focused work: about one XP per minute, as in Math Academy.
// A lesson is worth roughly three minutes per knowledge point plus setup; a
// review is a short, fixed task. Accuracy moves the award above or below base.

/** Base XP shown on a lesson task before it is attempted. */
export function lessonXp(
  skill: Pick<Skill, 'estimatedMinutes' | 'knowledgePoints'>,
): number {
  const points = skill.knowledgePoints?.length;
  return points
    ? 3 * points + 2
    : Math.max(3, Math.round(skill.estimatedMinutes));
}

/** Base XP shown on a review task. */
export const REVIEW_XP = 4;

/**
 * XP earned for a completed task. A first-try perfect task earns a bonus of a
 * quarter of its base; each incorrect answer costs one XP, never below one.
 * An abandoned or failed task earns nothing.
 */
export function earnedXp(base: number, incorrect: number, completed: boolean) {
  if (!completed) return 0;
  if (incorrect === 0) return base + Math.ceil(base / 4);
  return Math.max(1, base - incorrect);
}

/** Base XP per quiz question: a ten-question quiz is worth 15 XP. */
export const QUIZ_XP_PER_QUESTION = 1.5;

/** Base XP shown on a quiz task. */
export function quizXp(questions: number): number {
  return Math.round(QUIZ_XP_PER_QUESTION * questions);
}

/**
 * XP earned for a finished quiz: its base scaled by accuracy, rounded. Nine of
 * ten correct on a 15 XP quiz earns 14 XP; unanswered questions count as
 * incorrect.
 */
export function earnedQuizXp(base: number, correct: number, total: number) {
  if (total <= 0) return 0;
  return Math.round((base * Math.min(correct, total)) / total);
}
