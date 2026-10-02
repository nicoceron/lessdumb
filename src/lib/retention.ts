import { createEmptyCard, fsrs, Rating, State, type Card } from 'ts-fsrs';

const DAY = 86_400_000;
/** JSON-safe, per-learner, per-skill FSRS-6 state. Model weights are defaults. */
export interface MemoryState {
  algorithm: 'fsrs-6';
  dueAt: number;
  lastReviewAt: number;
  stability: number;
  difficulty: number;
  elapsedDays: number;
  scheduledDays: number;
  reps: number;
  lapses: number;
}

const scheduler = fsrs({
  request_retention: 0.9,
  maximum_interval: 365,
  enable_fuzz: false,
  enable_short_term: false,
});

function serialize(card: Card, elapsedDays = 0): MemoryState {
  return {
    algorithm: 'fsrs-6',
    dueAt: card.due.getTime(),
    lastReviewAt: card.last_review!.getTime(),
    stability: card.stability,
    difficulty: card.difficulty,
    elapsedDays,
    scheduledDays: card.scheduled_days,
    reps: card.reps,
    lapses: card.lapses,
  };
}

function card(memory: MemoryState): Card {
  return {
    due: new Date(memory.dueAt),
    last_review: new Date(memory.lastReviewAt),
    stability: memory.stability,
    difficulty: memory.difficulty,
    elapsed_days: memory.elapsedDays,
    scheduled_days: memory.scheduledDays,
    reps: memory.reps,
    lapses: memory.lapses,
    state: State.Review,
    learning_steps: 0,
  };
}

/** A conservative one-day check follows independent acquisition or repair. */
export function acquisitionMemory(
  now: number,
  previous?: MemoryState,
): MemoryState {
  const memory =
    previous ??
    serialize(scheduler.next(createEmptyCard(now), now, Rating.Good).card);
  return { ...memory, lastReviewAt: now, dueAt: now + DAY, scheduledDays: 1 };
}

/** Migrate the old fixed ladder without moving an existing due date. */
export function legacyMemory(
  state: {
    memory?: MemoryState;
    intervalDays: number;
    dueAt: number | null;
    learnedAt: string | null;
    reviewCount: number;
  },
  now: number,
): MemoryState {
  if (state.memory) return state.memory;
  const interval = Math.max(1, state.intervalDays);
  const last =
    state.dueAt !== null
      ? state.dueAt - interval * DAY
      : state.learnedAt
        ? Date.parse(state.learnedAt)
        : now;
  const initial = acquisitionMemory(Math.max(0, last));
  return {
    ...initial,
    stability: interval,
    scheduledDays: interval,
    dueAt: state.dueAt ?? initial.dueAt,
    reps: 1 + state.reviewCount,
  };
}

export function reviewMemory(
  memory: MemoryState,
  now: number,
  outcome: 'pass' | 'hard' | 'fail',
): MemoryState {
  return serialize(
    scheduler.next(
      card(memory),
      now,
      outcome === 'fail'
        ? Rating.Again
        : outcome === 'hard'
          ? Rating.Hard
          : Rating.Good,
    ).card,
    Math.max(0, Math.floor((now - memory.lastReviewAt) / DAY)),
  );
}

export function recallProbability(memory: MemoryState, now: number): number {
  return scheduler.get_retrievability(
    card(memory),
    Math.max(now, memory.lastReviewAt),
    false,
  );
}
