import { useEffect, useState } from 'react';
import { skillById } from '../lib/catalog-index';
import type { SkillOutline } from '../lib/curriculum';
import {
  courseContentLoaded,
  loadCourseContent,
  loadedSkill,
  loadSkills,
} from '../lib/content';

/**
 * Loads lesson content (each part once per page, then from the HTTP cache).
 * `ready` turns true when all of it is in memory, so engine calls that
 * return questions or cards can run synchronously.
 */
function useContent(key: string, ready: boolean, load: () => Promise<unknown>) {
  const [, setLoaded] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (ready) return;
    let current = true;
    setError(null);
    load().then(
      () => {
        if (current) setLoaded((count) => count + 1);
      },
      () => {
        if (current)
          setError(
            'This lesson could not be downloaded. Check your connection and retry.',
          );
      },
    );
    return () => {
      current = false;
    };
  }, [key, ready, attempt]);
  return { ready, error, retry: () => setAttempt((count) => count + 1) };
}

/** Loads every skill of these courses, for a test across a course path. */
export function useCourseContent(courseIds: (string | undefined)[]) {
  const ids = [...new Set(courseIds.filter((id): id is string => !!id))];
  return useContent(ids.sort().join('|'), ids.every(courseContentLoaded), () =>
    Promise.all(ids.map(loadCourseContent)),
  );
}

/** Loads only the units that hold these skills, for a lesson or a quiz. */
export function useSkillContent(skillIds: (string | undefined)[]) {
  const skills = [...new Set(skillIds)]
    .map((id) => (id ? skillById[id] : undefined))
    .filter((skill): skill is SkillOutline => !!skill);
  return useContent(
    skills
      .map((skill) => skill.id)
      .sort()
      .join('|'),
    skills.every((skill) => loadedSkill(skill.id)),
    () => loadSkills(skills),
  );
}
