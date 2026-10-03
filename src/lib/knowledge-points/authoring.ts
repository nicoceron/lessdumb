import type {
  ChoiceQuestion,
  CodeQuestion,
  LessonExample,
  MultistepSetup,
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
    ...options,
  };
}

/** A choice or typed question as authored, before its ID is assigned. */
export type AnswerDraft =
  | Omit<ChoiceQuestion, 'id'>
  | Omit<NumericQuestion, 'id'>
  | Omit<TextQuestion, 'id'>;

/** A multistep part as authored: a question tied to the point it exercises. */
export type PartDraft = AnswerDraft & { point: string };

/** A multistep problem as authored, before its IDs are assigned. */
export interface MultistepDraft {
  title: string;
  setup: MultistepSetup;
  parts: PartDraft[];
}

/**
 * One `*.multistep.ts` file: multistep problems keyed by the skill whose
 * reviews and quizzes ask them (CEN-163).
 */
export type MultistepModule = Record<string, MultistepDraft[]>;

/**
 * Authoring helper for a multistep part: a question built with the usual
 * helpers (`typeNumber`, `typeOutput`, `choose`, …) and the ID of the
 * knowledge point it exercises, of the problem's skill or of an ancestor.
 */
export function part(point: string, question: AnswerDraft): PartDraft {
  return { ...question, point };
}

/**
 * A question generator: one concrete question of the same type as the
 * authored question it varies, built with the same helpers (`typeNumber`,
 * `typeOutput`, `choose`, …). Draw every number from `r`, never from
 * Math.random, so a seed always rebuilds the same question.
 */
export type QuestionGenerator = (r: Rng) => AnswerDraft;

/**
 * One `*.gen.ts` file: generators keyed by the ID of the authored question
 * each one varies (`<skill>-kp<n>-q<m>`). They live apart from the points
 * because the browser downloads lesson content as JSON and generators as
 * code; both sides attach them by these IDs.
 */
export type GeneratorModule = Record<string, QuestionGenerator>;

/**
 * Turn an authored question into a generated one: every presentation asks a
 * fresh variant from `generate`. The authored fields stay: attempts saved
 * before the question became a generator name it without a variant.
 */
export function vary<Q extends AnswerDraft & { id?: string }>(
  authored: Q,
  generate: QuestionGenerator,
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

/** A number in plain prose, with a typographic minus: `−3`. */
export function prose(value: number): string {
  return value < 0 ? `−${num(-value)}` : num(value);
}

/** A number in TeX after an operator, negatives in parentheses: `(-3)`. */
export function paren(value: number): string {
  return value < 0 ? `(${num(value)})` : num(value);
}

/** A signed term after another in TeX: ` + 3`, ` - 3`, or nothing for 0. */
export function plus(value: number): string {
  if (value === 0) return '';
  return value < 0 ? ` - ${num(-value)}` : ` + ${num(value)}`;
}

/** A coefficient written before a variable: `2`, nothing for 1, `-` for −1. */
export function coef(value: number): string {
  return value === 1 ? '' : value === -1 ? '-' : num(value);
}

/**
 * A sum of terms in TeX, skipping zero coefficients:
 * `terms([[2, 'x^2'], [-1, 'xy'], [3, '']])` is `2x^2 - xy + 3`.
 */
export function terms(parts: [number, string][]): string {
  let text = '';
  for (const [coefficient, symbol] of parts) {
    if (coefficient === 0) continue;
    const size = Math.abs(coefficient);
    const body = symbol ? `${size === 1 ? '' : num(size)}${symbol}` : num(size);
    text += text
      ? `${coefficient < 0 ? ' - ' : ' + '}${body}`
      : `${coefficient < 0 ? '-' : ''}${body}`;
  }
  return text || '0';
}

/**
 * A polynomial in TeX from its coefficients, highest power first:
 * `poly([2, 0, -3])` is `2x^2 - 3`.
 */
export function poly(coefficients: number[], variable = 'x'): string {
  const degree = coefficients.length - 1;
  return terms(
    coefficients.map((coefficient, index) => {
      const power = degree - index;
      return [
        coefficient,
        power === 0
          ? ''
          : `${variable}${power > 1 ? `^${power > 9 ? `{${power}}` : power}` : ''}`,
      ];
    }),
  );
}

/** The binomial coefficient C(n, k). */
export function binomial(n: number, k: number): number {
  let result = 1;
  for (let i = 1; i <= k; i++) result = (result * (n - k + i)) / i;
  return Math.round(result);
}

/** An integer with thousands separators, as prose writes it: `1,000`. */
export function grouped(value: number): string {
  return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/** Items in prose: `3, 5, and 9`. */
export function series(items: (string | number)[]): string {
  const text = items.map(String);
  return text.length < 3
    ? text.join(' and ')
    : `${text.slice(0, -1).join(', ')}, and ${text.at(-1)}`;
}

export type { Rng };
