import type {
  ChoiceQuestion,
  CodeQuestion,
  LessonExample,
  NumericQuestion,
  TextQuestion,
} from '../curriculum';
import { rng, type Rng } from '../variants';

export type QuestionDraft =
  | Omit<ChoiceQuestion, 'id'>
  | Omit<NumericQuestion, 'id'>
  | Omit<TextQuestion, 'id'>
  | Omit<CodeQuestion, 'id'>;

export interface KnowledgePointDraft {
  title: string;
  explanation: string[];
  example: LessonExample;
  questions: QuestionDraft[];
}

/** One authored file: knowledge points keyed by the skill they teach. */
export type KnowledgePointModule = Record<string, KnowledgePointDraft[]>;

/** Authoring helper for a choice question whose answer is the program output. */
export function predictOutput(
  prompt: string,
  code: string,
  choices: string[],
  answer: number,
  explanation: string,
): Omit<ChoiceQuestion, 'id'> {
  return {
    type: 'choice',
    prompt,
    code,
    choices,
    answer,
    explanation,
    hint: explanation,
    checksOutput: true,
  };
}

/** Authoring helper for a conceptual choice question. */
export function choose(
  prompt: string,
  choices: string[],
  answer: number,
  explanation: string,
  code?: string,
): Omit<ChoiceQuestion, 'id'> {
  return {
    type: 'choice',
    prompt,
    choices,
    answer,
    explanation,
    hint: explanation,
    ...(code ? { code } : {}),
  };
}

/**
 * Authoring helper for a typed output question: the learner types what the
 * program prints. `output` must be exactly that output; catalog tests run it.
 */
export function typeOutput(
  prompt: string,
  code: string,
  output: string,
  explanation: string,
): Omit<TextQuestion, 'id'> {
  return {
    type: 'text',
    prompt,
    code,
    answers: [output],
    explanation,
    hint: explanation,
    checksOutput: true,
  };
}

/** Authoring helper for a typed number, graded within `tolerance`. */
export function typeNumber(
  prompt: string,
  answer: number,
  explanation: string,
  options: Pick<NumericQuestion, 'tolerance' | 'unit' | 'code'> = {},
): Omit<NumericQuestion, 'id'> {
  return {
    type: 'numeric',
    prompt,
    answer,
    explanation,
    hint: explanation,
    ...options,
  };
}

/** Authoring helper for a short typed answer such as a name or keyword. */
export function typeText(
  prompt: string,
  answers: string[],
  explanation: string,
  options: Pick<TextQuestion, 'ignoreCase' | 'code'> = {},
): Omit<TextQuestion, 'id'> {
  return {
    type: 'text',
    prompt,
    answers,
    explanation,
    hint: explanation,
    ...options,
  };
}

type AnswerDraft =
  | Omit<ChoiceQuestion, 'id'>
  | Omit<NumericQuestion, 'id'>
  | Omit<TextQuestion, 'id'>;

/**
 * Turn an authored question into a generator: every presentation asks a
 * fresh variant that `generate` builds from a seeded random source, with the
 * same helpers (`typeNumber`, `typeOutput`, `choose`, …) and the same type.
 * The authored question stays: attempts saved before it became a generator
 * name it without a variant, and it documents what the generator asks.
 * Draw every number from `r`, never from Math.random, so a seed always
 * rebuilds the same question.
 */
export function vary<Q extends AnswerDraft>(
  authored: Q,
  generate: (r: Rng) => Q,
): Q {
  return {
    ...authored,
    generated: true,
    generate: (seed: number) => generate(rng(seed)),
  } as Q;
}

/**
 * Four choices for a generated choice question: the correct one and the
 * first three distinct distractors, the correct one at a random position.
 */
export function options(
  r: Rng,
  correct: string,
  distractors: string[],
): { choices: string[]; answer: number } {
  const wrong = [
    ...new Set(distractors.filter((item) => item.trim() !== correct.trim())),
  ].slice(0, 3);
  const answer = r.int(0, wrong.length);
  return {
    choices: [...wrong.slice(0, answer), correct, ...wrong.slice(answer)],
    answer,
  };
}

/** A number as prose and Python print it, without floating-point noise. */
export function num(value: number): string {
  return String(Number(value.toPrecision(12)));
}

/**
 * How Python prints a float: `5.0` for a whole value, otherwise the shortest
 * repr, which JavaScript shares for ordinary magnitudes. Keep generated
 * values small and exact; the executed tests compare the real output.
 */
export function pyFloat(value: number): string {
  return Number.isInteger(value) ? `${value}.0` : String(value);
}

/** Python's floor division and modulo, whose results follow the divisor's sign. */
export const pyDiv = (a: number, b: number) => Math.floor(a / b);
export const pyMod = (a: number, b: number) => ((a % b) + b) % b;

/** How Python prints a value: `[1, 2]`, `'ab'`, `(1,)`, `True`, `None`. */
export function py(value: unknown): string {
  if (value === null || value === undefined) return 'None';
  if (typeof value === 'boolean') return value ? 'True' : 'False';
  if (typeof value === 'number') return num(value);
  if (typeof value === 'string')
    return value.includes("'") && !value.includes('"')
      ? `"${value}"`
      : `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
  if (Array.isArray(value)) return `[${value.map(py).join(', ')}]`;
  throw new Error(`No Python form for ${String(value)}.`);
}

/** Items in prose: `3, 5, and 9`. */
export function series(items: (string | number)[]): string {
  const text = items.map(String);
  return text.length < 3
    ? text.join(' and ')
    : `${text.slice(0, -1).join(', ')}, and ${text.at(-1)}`;
}

export type { Rng };
