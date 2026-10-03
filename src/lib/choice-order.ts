import type { ChoiceQuestion } from './curriculum';

// Choices are displayed in a shuffled order so learners recall the answer
// rather than its position. The order is a deterministic function of the
// question and its presentation, so a reload shows the same order and the
// grader can always map a displayed position back to the authored index.

function hash(text: string): number {
  // FNV-1a, 32-bit.
  let value = 0x811c9dc5;
  for (let index = 0; index < text.length; index++) {
    value ^= text.charCodeAt(index);
    value = Math.imul(value, 0x01000193);
  }
  return value >>> 0;
}

function random(seed: number) {
  // mulberry32: small, fast, and good enough for display order.
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value ^= value + Math.imul(value ^ (value >>> 7), 61 | value);
    return ((value ^ (value >>> 14)) >>> 0) / 4_294_967_296;
  };
}

/**
 * Display order for one presentation of a choice question: `order[position]`
 * is the authored index shown at that position. `presentation` identifies the
 * showing, e.g. how many times the learner has already answered the question.
 */
export function choiceOrder(
  question: Pick<ChoiceQuestion, 'id' | 'choices'>,
  presentation: string | number,
): number[] {
  const order = question.choices.map((_, index) => index);
  const next = random(hash(`${question.id}#${presentation}`));
  for (let index = order.length - 1; index > 0; index--) {
    const swap = Math.floor(next() * (index + 1));
    [order[index], order[swap]] = [order[swap], order[index]];
  }
  return order;
}

/** The authored answer index for a choice selected at a displayed position. */
export function authoredChoice(order: number[], position: number): number {
  const index = order[position];
  if (index === undefined) throw new Error('Unknown choice position.');
  return index;
}

/** Letter label for a displayed position: A, B, C, … */
export function choiceLetter(position: number): string {
  return String.fromCharCode(65 + position);
}
