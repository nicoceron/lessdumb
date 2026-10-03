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
