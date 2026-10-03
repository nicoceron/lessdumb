import type {
  AnswerQuestion,
  NumericQuestion,
  Question,
  QuestionRef,
  TextQuestion,
  TypedQuestion,
} from './curriculum';

// Typed answers: numbers and short free responses. Grading is strict about
// what an answer says and lenient about how it is typed: surrounding spaces,
// runs of spaces, curly quotes from a phone keyboard, and a Unicode minus
// sign never decide a result. A response that is not a number at all is not a
// wrong answer; the learner is asked to type a number instead.

/** Longest response the input accepts and an attempt stores. */
export const TYPED_RESPONSE_MAX_LENGTH = 200;

/** Question types answered by typing rather than by choosing or running code. */
export function isTypedType(type: QuestionRef['type']): boolean {
  return type === 'numeric' || type === 'text';
}

export function isTyped(question: Question): question is TypedQuestion {
  return isTypedType(question.type);
}

export type TypedGrade =
  | { status: 'correct' }
  | { status: 'incorrect' }
  /** Not gradable: no answer, or not a number. Never counts as a miss. */
  | { status: 'invalid'; message: string };

export const NOT_A_NUMBER =
  'That is not a number this question can read. Type digits, such as 42, -3.5, 3/4, or 1e-3.';
export const EMPTY_RESPONSE = 'Type an answer first.';

const DECIMAL = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i;
const FRACTION = /^([+-]?\d+)\s*\/\s*(\d+)$/;

/**
 * Reads a typed number: an integer, a decimal, a negative number, a simple
 * fraction like `3/4`, or scientific notation like `1e-3`, with surrounding
 * whitespace ignored. Anything else, including thousands separators, is null.
 */
export function parseNumber(text: string): number | null {
  const value = text.trim().replace(/−/g, '-');
  let result: number;
  if (DECIMAL.test(value)) result = Number(value);
  else {
    const fraction = FRACTION.exec(value);
    if (!fraction || Number(fraction[2]) === 0) return null;
    result = Number(fraction[1]) / Number(fraction[2]);
  }
  return Number.isFinite(result) ? result : null;
}

/**
 * A number as the learner should read it, without floating-point noise: a
 * short decimal, or a simple fraction such as `5/6` when the decimal repeats.
 */
export function formatNumber(value: number): string {
  const decimal = String(Number(value.toPrecision(12)));
  if (!/\.\d{7,}/.test(decimal)) return decimal;
  for (let denominator = 2; denominator <= 100; denominator++) {
    const numerator = Math.round(value * denominator);
    if (Math.abs(value - numerator / denominator) < 1e-12)
      return `${numerator}/${denominator}`;
  }
  return decimal;
}

/**
 * Correct within the question's absolute tolerance. Without one, the response
 * must equal the answer, allowing only floating-point rounding.
 */
export function gradeNumeric(
  question: Pick<NumericQuestion, 'answer' | 'tolerance'>,
  response: string,
): TypedGrade {
  if (!response.trim()) return { status: 'invalid', message: EMPTY_RESPONSE };
  const value = parseNumber(response);
  if (value === null) return { status: 'invalid', message: NOT_A_NUMBER };
  const allowed =
    (question.tolerance ?? 0) + 1e-9 * Math.max(1, Math.abs(question.answer));
  return Math.abs(value - question.answer) <= allowed
    ? { status: 'correct' }
    : { status: 'incorrect' };
}

/**
 * Text as compared: line endings unified, curly quotes straightened, each
 * line trimmed with its runs of whitespace collapsed to one space, and blank
 * lines at the start and end dropped. Case is folded only when asked.
 */
export function normalizeText(text: string, ignoreCase = false): string {
  const lines = text
    .normalize('NFC')
    .replace(/\r\n?/g, '\n')
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .split('\n')
    .map((line) => line.replace(/\s+/g, ' ').trim());
  while (lines.length && !lines[0]) lines.shift();
  while (lines.length && !lines[lines.length - 1]) lines.pop();
  const joined = lines.join('\n');
  return ignoreCase ? joined.toLowerCase() : joined;
}

/** Correct when the response matches one accepted answer after normalizing. */
export function gradeText(
  question: Pick<TextQuestion, 'answers' | 'ignoreCase'>,
  response: string,
): TypedGrade {
  const typed = normalizeText(response, question.ignoreCase);
  if (!typed) return { status: 'invalid', message: EMPTY_RESPONSE };
  return question.answers.some(
    (answer) => normalizeText(answer, question.ignoreCase) === typed,
  )
    ? { status: 'correct' }
    : { status: 'incorrect' };
}

export function gradeTyped(
  question: TypedQuestion,
  response: string,
): TypedGrade {
  if (response.length > TYPED_RESPONSE_MAX_LENGTH)
    return {
      status: 'invalid',
      message: `Answers are at most ${TYPED_RESPONSE_MAX_LENGTH} characters.`,
    };
  return question.type === 'numeric'
    ? gradeNumeric(question, response)
    : gradeText(question, response);
}

/**
 * Grades a quiz or placement answer: the authored index of a choice, or the
 * text typed for a typed question. Throws for an answer of the wrong kind, an
 * unknown choice, or a typed response that cannot be graded; callers check
 * typed responses with `gradeTyped` first, so these never count as misses.
 */
export function gradeAnswer(
  question: AnswerQuestion,
  answer: number | string,
): boolean {
  if (question.type === 'choice') {
    if (
      typeof answer !== 'number' ||
      !Number.isInteger(answer) ||
      answer < 0 ||
      answer >= question.choices.length
    )
      throw new Error('Unknown choice.');
    return answer === question.answer;
  }
  if (typeof answer !== 'string') throw new Error('Type an answer.');
  const grade = gradeTyped(question, answer);
  if (grade.status === 'invalid') throw new Error(grade.message);
  return grade.status === 'correct';
}

/** The accepted answer shown after answering, with any tolerance. */
export function acceptedAnswer(question: TypedQuestion): string {
  if (question.type === 'text') return question.answers[0];
  const value = formatNumber(question.answer);
  return question.tolerance
    ? `${value} (± ${formatNumber(question.tolerance)})`
    : value;
}

/** Whether the answer spans several lines, so the input should too. */
export function typedLines(question: TypedQuestion): number {
  return question.type === 'text'
    ? Math.max(...question.answers.map((answer) => answer.split('\n').length))
    : 1;
}

/** Longest accepted line of a text answer. */
const MAX_TEXT_LINE = 40;
const MAX_TEXT_LINES = 3;

/** Authoring errors for a typed question; the catalog validator reports them. */
export function typedQuestionErrors(question: Question): string[] {
  const errors: string[] = [];
  if (question.type === 'numeric') {
    if (
      typeof question.answer !== 'number' ||
      !Number.isFinite(question.answer)
    )
      return [`${question.id}: a numeric answer must be a finite number.`];
    const tolerance = question.tolerance ?? 0;
    if (
      typeof tolerance !== 'number' ||
      !Number.isFinite(tolerance) ||
      tolerance < 0
    )
      errors.push(`${question.id}: tolerance must be a nonnegative number.`);
    else if (question.answer !== 0 && tolerance >= Math.abs(question.answer))
      errors.push(
        `${question.id}: a tolerance as wide as the answer would accept 0.`,
      );
    if (
      gradeNumeric(question, formatNumber(question.answer)).status !== 'correct'
    )
      errors.push(`${question.id}: the answer must read back as itself.`);
    if (question.unit !== undefined && !question.unit.trim())
      errors.push(`${question.id}: an empty unit hint.`);
  }
  if (question.type === 'text') {
    if (!Array.isArray(question.answers) || !question.answers.length)
      return [`${question.id}: needs at least one accepted answer.`];
    const normalized = question.answers.map((answer) =>
      normalizeText(answer, question.ignoreCase),
    );
    if (normalized.some((answer) => !answer))
      errors.push(`${question.id}: accepted answers must not be blank.`);
    if (new Set(normalized).size !== normalized.length)
      errors.push(`${question.id}: accepted answers must be distinct.`);
    for (const answer of question.answers) {
      const lines = answer.split('\n');
      if (
        lines.length > MAX_TEXT_LINES ||
        lines.some((line) => line.length > MAX_TEXT_LINE)
      )
        errors.push(
          `${question.id}: typed answers are at most ${MAX_TEXT_LINES} lines of ${MAX_TEXT_LINE} characters.`,
        );
    }
    if (question.checksOutput) {
      // The program prints one thing, exactly; normalizing must not be able
      // to accept a different output.
      if (question.answers.length !== 1 || question.ignoreCase)
        errors.push(
          `${question.id}: an output question accepts exactly its output, case included.`,
        );
      if (question.answers.some((answer) => normalizeText(answer) !== answer))
        errors.push(
          `${question.id}: typed output must not depend on spacing; keep it a choice question.`,
        );
    }
  }
  return errors;
}
