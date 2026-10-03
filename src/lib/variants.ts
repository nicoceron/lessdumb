import type { AnswerQuestion, Question, QuestionRef } from './curriculum';

// Generated questions. A generated question carries a seeded function that
// returns a concrete question of its own type (prompt, answer, explanation,
// and choices) for any seed, so a learner meets fresh numbers instead of a
// question they can recognize. Generation is deterministic: the same seed
// always gives the same question, and every attempt stores the seed it was
// shown with, so the lesson page, quizzes, and mistake cards can rebuild
// exactly what was asked and grade it again. Nothing here uses Math.random.

/** FNV-1a, 32-bit. */
export function hash32(text: string): number {
  let value = 0x811c9dc5;
  for (let index = 0; index < text.length; index++) {
    value ^= text.charCodeAt(index);
    value = Math.imul(value, 0x01000193);
  }
  return value >>> 0;
}

/** mulberry32: a small, fast PRNG with a 32-bit state. Returns [0, 1). */
export function random(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value ^= value + Math.imul(value ^ (value >>> 7), 61 | value);
    return ((value ^ (value >>> 14)) >>> 0) / 4_294_967_296;
  };
}

/** A seeded source of random choices for question generators. */
export interface Rng {
  /** A float in [0, 1). */
  next(): number;
  /** An integer from `min` to `max`, both included. */
  int(min: number, max: number): number;
  /** One item of a nonempty list. */
  pick<T>(items: readonly T[]): T;
  /** A shuffled copy. */
  shuffle<T>(items: readonly T[]): T[];
  /** `count` distinct items of a list, in random order. */
  sample<T>(items: readonly T[], count: number): T[];
  /** `count` integers from `min` to `max`; `distinct` forbids repeats. */
  ints(count: number, min: number, max: number, distinct?: boolean): number[];
}

export function rng(seed: number): Rng {
  const next = random(seed);
  const int = (min: number, max: number) =>
    min + Math.floor(next() * (max - min + 1));
  const shuffle = <T>(items: readonly T[]) => {
    const copy = [...items];
    for (let index = copy.length - 1; index > 0; index--) {
      const swap = Math.floor(next() * (index + 1));
      [copy[index], copy[swap]] = [copy[swap], copy[index]];
    }
    return copy;
  };
  return {
    next,
    int,
    pick: (items) => {
      if (!items.length) throw new Error('Cannot pick from an empty list.');
      return items[Math.floor(next() * items.length)];
    },
    shuffle,
    sample: (items, count) => {
      if (count > items.length) throw new Error('Sample larger than the list.');
      return shuffle(items).slice(0, count);
    },
    ints: (count, min, max, distinct = false) => {
      if (distinct && count > max - min + 1)
        throw new Error('Not enough distinct integers in the range.');
      const result: number[] = [];
      while (result.length < count) {
        const value = int(min, max);
        if (!distinct || !result.includes(value)) result.push(value);
      }
      return result;
    },
  };
}

/**
 * The largest variant number accepted. A variant is a small integer `k`, the
 * learner's `k`-th variant of a question, whose seed is `variantSeed(id, k)`.
 * States store this number, never the seed or the question, to stay small.
 */
export const MAX_VARIANT = 1_000_000;

export function isVariant(value: unknown): value is number {
  return (
    typeof value === 'number' &&
    Number.isInteger(value) &&
    value >= 0 &&
    value <= MAX_VARIANT
  );
}

/**
 * The seed of a generated question's variant `k`. Every learner walks the
 * same sequence; each question has its own, so two generators on one page
 * never move in lockstep.
 */
export function variantSeed(questionId: string, k: number): number {
  return hash32(`${questionId}#variant${k}`);
}

/** Variants the catalog validator checks per generator: the first ones served. */
export const GENERATOR_SAMPLES = 50;
/**
 * Distinct questions a generator must produce among its samples, so that a
 * learner's recent variants can always be avoided and numbers stay fresh.
 */
export const MIN_DISTINCT_VARIANTS = 12;

/** Variant numbers the validator and the executed tests sample: 0, 1, 2, … */
export function sampleVariants(count = GENERATOR_SAMPLES): number[] {
  return Array.from({ length: count }, (_, k) => k);
}

/** Whether the question draws a fresh variant each time it is asked. */
export function isGenerated(question: Pick<QuestionRef, 'generated'>): boolean {
  return question.generated === true;
}

const instances = new WeakMap<Question, Map<number, Question>>();

/**
 * The concrete question asked as variant `k`. An authored question is itself;
 * so is a generated question without a recorded variant: that is the authored
 * question, shown before it became a generator, which older attempts name.
 */
export function questionVariant<Q extends Question>(
  question: Q,
  variant?: number,
): Q {
  if (
    !isGenerated(question) ||
    variant === undefined ||
    question.type === 'code'
  )
    return question;
  let cache = instances.get(question);
  if (!cache) instances.set(question, (cache = new Map()));
  const cached = cache.get(variant);
  if (cached) return cached as Q;
  const generate = question.generate as ((seed: number) => object) | undefined;
  if (!generate) return question;
  const instance = {
    ...generate(variantSeed(question.id, variant)),
    id: question.id,
    generated: true,
    generate,
    variant,
  } as unknown as Q;
  cache.set(variant, instance);
  return instance;
}

/** What the learner sees and must answer, as one comparable string. */
export function variantKey(question: AnswerQuestion): string {
  return JSON.stringify([
    question.type,
    question.prompt,
    question.code ?? '',
    // Choices are shuffled for display, so their authored order is not seen.
    question.type === 'choice'
      ? [[...question.choices].sort(), question.choices[question.answer]]
      : question.type === 'numeric'
        ? question.answer
        : question.answers,
  ]);
}
