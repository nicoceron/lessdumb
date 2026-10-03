import { useCallback, useEffect, useRef } from 'react';
import { watchAnswerTime } from '../lib/answer-time';

/**
 * Times the question identified by `key` (src/lib/answer-time.ts): from when
 * the element `target` returns first scrolls into view, or from mount without
 * one, until the returned function is called on submit. A new key starts a
 * new clock. Returns undefined when nothing was timed.
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
    // Effects run after the commit, so the question is in the DOM.
    const watcher = watchAnswerTime(targetRef.current?.() ?? null);
    watch.current = watcher;
    return () => {
      watcher.stop();
      if (watch.current === watcher) watch.current = null;
    };
  }, [key]);
  return useCallback(() => watch.current?.read(), []);
}
