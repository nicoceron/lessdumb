import { useEffect } from 'react';
import { codeLanguage } from '../lib/code-language';
import type { CodeQuestion, Skill } from '../lib/curriculum';
import { warmPython } from '../lib/python';

/**
 * The authored starter code and checks of a skill's Python exercises, whose
 * imports a warm worker preloads; null when the skill has none.
 */
export function pythonExerciseSource(skill: Skill | undefined): string | null {
  const exercises = (skill?.questions ?? []).filter(
    (question): question is CodeQuestion =>
      question.type === 'code' && codeLanguage(question.language) === 'python',
  );
  return exercises.length
    ? exercises
        .map((exercise) => `${exercise.starterCode}\n${exercise.tests}`)
        .join('\n')
    : null;
}

/**
 * While `source` is not null, keep a warm Python worker ready for this page's
 * next run (see `warmPython`). Pages without Python pass null and start none.
 */
export function usePythonSpare(source: string | null) {
  useEffect(() => (source === null ? undefined : warmPython(source)), [source]);
}
