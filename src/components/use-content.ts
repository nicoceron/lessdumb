import { useEffect, useState } from 'react';
import { courseContentLoaded, loadCourseContent } from '../lib/content';

/**
 * Loads the lesson content of these courses (each course once per page, then
 * from the HTTP cache). `ready` turns true when every one is in memory, so
 * engine calls that return questions or cards can run synchronously.
 */
export function useCourseContent(courseIds: (string | undefined)[]) {
  const ids = [...new Set(courseIds.filter((id): id is string => !!id))];
  const key = ids.sort().join('|');
  const [, setLoaded] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const ready = ids.every(courseContentLoaded);
  useEffect(() => {
    if (ready) return;
    let current = true;
    setError(null);
    Promise.all(ids.map(loadCourseContent)).then(
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
