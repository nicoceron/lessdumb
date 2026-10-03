import { useCallback, useEffect, useRef } from 'react';
import { watchAnswerTime, type AnswerClock } from '../lib/answer-time';

/**
 * Clocks of questions that were unmounted before being answered, by key. The
 * app can remount a page while a question is open (a guest's session check
 * when the tab regains focus shows the loading screen for a moment); the same
 * question shown again resumes its clock instead of starting over.
 */
const suspended = new Map<string, AnswerClock>();
const MAX_SUSPENDED = 32;

/**
 * Times the question identified by `key` (src/lib/answer-time.ts): from when
 * the element `target` returns first scrolls into view, or from mount without
 * one, until the returned function is called on submit. The key must name
 * one showing of one question and stay the same across remounts; a new key
 * starts a new clock. Returns undefined when nothing was timed.
 */
export function useAnswerTime(
  key: string | undefined,
  target?: () => Element | null,
): () => number | undefined {
  const watch = useRef<ReturnType<typeof watchAnswerTime> | null>(null);
  const targetRef = useRef(target);
  targetRef.current = target;
  useEffect(() => {
    if (key === undefined) return;
    const resume = suspended.get(key);
    suspended.delete(key);
    // Effects run after the commit, so the question is in the DOM.
    const watcher = watchAnswerTime(
      targetRef.current?.() ?? null,
      undefined,
      resume,
    );
    watch.current = watcher;
    return () => {
      watcher.stop();
      if (watch.current === watcher) watch.current = null;
      suspended.set(key, watcher.clock);
      if (suspended.size > MAX_SUSPENDED)
        suspended.delete(suspended.keys().next().value!);
    };
  }, [key]);
  return useCallback(() => watch.current?.read(), []);
}
