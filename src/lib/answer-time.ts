import type { SkillOutline } from './curriculum';
import type { Attempt } from './learning';

// Answer time: how long a learner took on a question, from the moment it
// became visible to the moment they submitted it. It is recorded on every
// attempt (`elapsedMs`) for a future speed model, as Math Academy uses answer
// speed to find skills that are correct but slow. Nothing schedules on it yet.
//
// Time counts only while the tab is visible, so a learner who leaves a
// question open overnight is not recorded as slow, and it is capped: past
// ten minutes the learner was not working on it throughout.

/** The longest answer time recorded. */
export const MAX_ANSWER_MS = 10 * 60_000;

/**
 * An answer time as stored: whole milliseconds, capped at MAX_ANSWER_MS, or
 * undefined when there is none to record.
 */
export function answerTime(value: unknown): number | undefined {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0)
    return undefined;
  return Math.min(Math.round(value), MAX_ANSWER_MS);
}

/**
 * A stopwatch that runs only after `start` and only while visible. Times are
 * from a monotonic clock (`performance.now()` in the browser).
 */
export class AnswerClock {
  private elapsed = 0;
  /** When the current visible stretch began, while running. */
  private since: number | null = null;
  private started = false;

  constructor(private visible = true) {}

  /** The question became visible. Later calls change nothing. */
  start(now: number) {
    if (this.started) return;
    this.started = true;
    if (this.visible) this.since = now;
  }

  /** The tab was hidden or shown again. */
  setVisible(visible: boolean, now: number) {
    if (visible === this.visible) return;
    this.visible = visible;
    if (!this.started) return;
    if (visible) this.since = now;
    else if (this.since !== null) {
      this.elapsed += Math.max(0, now - this.since);
      this.since = null;
    }
  }

  /** The answer time so far, capped; undefined if never started. */
  read(now: number): number | undefined {
    if (!this.started) return undefined;
    const running = this.since === null ? 0 : Math.max(0, now - this.since);
    return answerTime(this.elapsed + running);
  }
}

/** What `watchAnswerTime` needs from the browser; tests pass their own. */
export interface AnswerTimeEnvironment {
  document: Pick<
    Document,
    'visibilityState' | 'addEventListener' | 'removeEventListener'
  >;
  IntersectionObserver?: new (
    callback: (entries: { isIntersecting: boolean }[]) => void,
  ) => { observe(target: Element): void; disconnect(): void };
  now: () => number;
}

function browserEnvironment(): AnswerTimeEnvironment {
  return {
    document,
    IntersectionObserver:
      typeof IntersectionObserver === 'function'
        ? IntersectionObserver
        : undefined,
    now: () => performance.now(),
  };
}

/**
 * Time one question. The clock starts when `target` first scrolls into view
 * (immediately without a target, or where IntersectionObserver is missing),
 * pauses while the tab is hidden, and keeps running if the learner scrolls
 * back up to reread. Call `read` on submit and `stop` when done.
 */
export function watchAnswerTime(
  target: Element | null,
  environment: AnswerTimeEnvironment = browserEnvironment(),
): { read(): number | undefined; stop(): void } {
  const { document: doc, now } = environment;
  const clock = new AnswerClock(doc.visibilityState !== 'hidden');
  const onVisibility = () =>
    clock.setVisible(doc.visibilityState !== 'hidden', now());
  doc.addEventListener('visibilitychange', onVisibility);
  let observer: { disconnect(): void } | undefined;
  if (target && environment.IntersectionObserver) {
    const watcher = new environment.IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      clock.start(now());
      watcher.disconnect();
    });
    watcher.observe(target);
    observer = watcher;
  } else clock.start(now());
  return {
    read: () => clock.read(now()),
    stop() {
      doc.removeEventListener('visibilitychange', onVisibility);
      observer?.disconnect();
    },
  };
}

/**
 * The mean answer time of a skill's retained, timed answers to questions,
 * not code exercises, which take far longer. Null without any.
 */
export function averageAnswerTime(
  attempts: Attempt[],
  skill: Pick<SkillOutline, 'id' | 'questions'>,
): { ms: number; count: number } | null {
  const code = new Set(
    skill.questions
      .filter((question) => question.type === 'code')
      .map((question) => question.id),
  );
  let total = 0;
  let count = 0;
  for (const attempt of attempts)
    if (
      attempt.skillId === skill.id &&
      attempt.elapsedMs !== undefined &&
      !code.has(attempt.questionId)
    ) {
      total += attempt.elapsedMs;
      count++;
    }
  return count ? { ms: Math.round(total / count), count } : null;
}

/** "8 s", "1 min 5 s", "10 min". */
export function formatAnswerTime(ms: number): string {
  const seconds = Math.round(ms / 1000);
  if (seconds < 60) return `${seconds} s`;
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return rest ? `${minutes} min ${rest} s` : `${minutes} min`;
}
