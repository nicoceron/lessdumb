/** A pair of grow-only counters; correct observations are a subset of attempts. */
export interface ActivityCount {
  attempts: number;
  correct: number;
}

/**
 * JSON-safe state-based G-counters, scoped to one learner and one skill.
 * Each independent writer owns its contribution and merges use component maxima.
 * https://doc.akka.io/libraries/akka-core/current/typed/distributed-data.html
 */
export interface ActivityState {
  version: 1;
  /** Shared pre-migration totals. Never copy tracked writer totals into this. */
  baseline: ActivityCount;
  writers: Record<string, ActivityCount>;
}

// A reload or separate tab gets a fresh writer; concurrent runtimes never share
// a persisted writer ID. Explicit IDs are useful when simulating devices.
let runtimeWriterId: string | undefined;
export function defaultActivityWriterId(): string {
  runtimeWriterId ??= crypto.randomUUID();
  return runtimeWriterId;
}

function validCount(count: ActivityCount): void {
  if (
    !Number.isSafeInteger(count.attempts) ||
    !Number.isSafeInteger(count.correct) ||
    count.attempts < 0 ||
    count.correct < 0 ||
    count.correct > count.attempts
  )
    throw new Error(
      'Activity counters must be safe nonnegative integers with correct <= attempts.',
    );
}

function validWriter(writerId: string): void {
  if (
    !/^[a-zA-Z0-9_-]{1,128}$/.test(writerId) ||
    ['__proto__', 'prototype', 'constructor'].includes(writerId)
  )
    throw new Error('An activity writer must have a safe, nonempty ID.');
}

/** Initialize an old snapshot once, before recording any tracked increments. */
export function createActivity(attempts = 0, correct = 0): ActivityState {
  const baseline = { attempts, correct };
  validCount(baseline);
  return { version: 1, baseline, writers: {} };
}

/** Recover lifetime counts even when every original event has been compacted. */
export function activityTotals(state: ActivityState): ActivityCount {
  validCount(state.baseline);
  const total = { ...state.baseline };
  for (const contribution of Object.values(state.writers)) {
    validCount(contribution);
    total.attempts += contribution.attempts;
    total.correct += contribution.correct;
  }
  validCount(total);
  return total;
}

/**
 * Record one already-deduplicated event against the current writer snapshot.
 * Callers keep stable event-ID deduplication; a G-counter merges states rather
 * than deduplicating repeated commands. It contains no timestamps or event log.
 */
export function recordActivity(
  state: ActivityState,
  correct: boolean,
  writerId: string = defaultActivityWriterId(),
): ActivityState {
  validWriter(writerId);
  const previous = Object.hasOwn(state.writers, writerId)
    ? state.writers[writerId]
    : { attempts: 0, correct: 0 };
  validCount(previous);
  const contribution = {
    attempts: previous.attempts + 1,
    correct: previous.correct + (correct ? 1 : 0),
  };
  validCount(contribution);
  const next: ActivityState = {
    ...state,
    writers: { ...state.writers, [writerId]: contribution },
  };
  activityTotals(next);
  return next;
}

/**
 * Associative, commutative and idempotent for independent single-writer streams.
 * Legacy baselines merge by max because their overlap is unknown. Distinct
 * pre-migration offline work cannot be recovered exactly without retained IDs.
 * Writer entries are never discarded: safe retirement requires an acknowledged
 * causal checkpoint, not an age cutoff or a capped recent event list.
 */
export function mergeActivity(
  left: ActivityState,
  right: ActivityState,
): ActivityState {
  validCount(left.baseline);
  validCount(right.baseline);
  const writers = Object.fromEntries(
    [...new Set([...Object.keys(left.writers), ...Object.keys(right.writers)])]
      .sort()
      .map((writerId) => {
        validWriter(writerId);
        const a = left.writers[writerId] ?? { attempts: 0, correct: 0 };
        const b = right.writers[writerId] ?? { attempts: 0, correct: 0 };
        validCount(a);
        validCount(b);
        return [
          writerId,
          {
            attempts: Math.max(a.attempts, b.attempts),
            correct: Math.max(a.correct, b.correct),
          },
        ];
      }),
  );
  const merged: ActivityState = {
    version: 1,
    baseline: {
      attempts: Math.max(left.baseline.attempts, right.baseline.attempts),
      correct: Math.max(left.baseline.correct, right.baseline.correct),
    },
    writers,
  };
  activityTotals(merged);
  return merged;
}
