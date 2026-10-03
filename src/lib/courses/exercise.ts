import type { CodeQuestion } from '../curriculum';

/**
 * A skill's code exercise keeps `<skill>-q4`, the slot it held in the
 * four-question lessons that knowledge points replaced (CEN-117). Saved
 * attempts, evidence, review cycles, and cards name it by that ID.
 */
export function exerciseId(skillId: string): string {
  return `${skillId}-q4`;
}

/** The skill's code exercise with its stable ID; at most one per skill. */
export function withExerciseId(
  skillId: string,
  exercises: Omit<CodeQuestion, 'id'>[],
): CodeQuestion[] {
  if (exercises.length > 1)
    throw new Error(`${skillId}: a skill has at most one code exercise.`);
  return exercises.map((exercise) => ({
    ...exercise,
    id: exerciseId(skillId),
  }));
}
