import type {
  AnswerQuestion,
  ChoiceQuestion,
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
//
// Output questions (`checksOutput`) accept exactly what the program prints:
// the output is the skill. Other text questions (a name, a keyword, a term)
// also accept equivalent forms: any case unless the question is
// `caseSensitive`, wrapping quotes or backticks, trailing punctuation, and
// the authored synonyms in `answers`. An `exact` question opts out of all of
// these, as an output question does.

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
  'That is not a number, so it was not counted. Type digits, such as 42, -3.5, 3/4, or 1e-3.';
export const EMPTY_RESPONSE = 'Type an answer first.';

const DECIMAL = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i;
const FRACTION = /^([+-]?\d+)\s*\/\s*(\d+)$/;
/**
 * An integer part grouped in thousands with one separator throughout: a
 * comma (`1,000`) or a space, including the no-break and thin spaces some
 * keyboards insert (`1 000`). Every group after the first has exactly three
 * digits, so `1,5` or `12,34` (a decimal comma, or a typo) never reads as a
 * number.
 */
const GROUPED =
  /^([+-]?)(\d{1,3}(?:([, \u00a0\u2009\u202f])\d{3})(?:\3\d{3})*)(\.\d+)?$/;

/**
 * A numeric question's `unit` when it names a unit (`ms`, `%`, `km/h`)
 * rather than a format hint (`to 3 decimals`): one word without digits. A
 * response may end with it.
 */
export function unitSuffix(unit?: string): string | undefined {
  const value = unit?.trim();
  return value && /^[^\s\d]+$/.test(value) ? value : undefined;
}

/**
 * Reads a typed number: an integer, a decimal, a negative number, a leading
 * `+`, a simple fraction like `3/4`, scientific notation like `1e-3`, or
 * thousands grouped unambiguously (`1,000`, `1 000`), with surrounding
 * whitespace ignored. When the question declares a unit, the response may end
 * with it (`250 ms`). Anything else is null.
 */
export function parseNumber(text: string, unit?: string): number | null {
  let value = text.trim().replace(/−/g, '-');
  const suffix = unitSuffix(unit);
  if (suffix && value.endsWith(suffix))
    value = value.slice(0, -suffix.length).trimEnd();
  let result: number;
  const grouped = GROUPED.exec(value);
  if (grouped)
    result = Number(
      `${grouped[1]}${grouped[2].replace(/[^\d]/g, '')}${grouped[4] ?? ''}`,
    );
  else if (DECIMAL.test(value)) result = Number(value);
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
  question: Pick<NumericQuestion, 'answer' | 'tolerance' | 'unit'>,
  response: string,
): TypedGrade {
  if (!response.trim()) return { status: 'invalid', message: EMPTY_RESPONSE };
  const value = parseNumber(response, question.unit);
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

/** What decides how a text question compares answers. */
export type TextGrading = Pick<
  TextQuestion,
  'answers' | 'ignoreCase' | 'caseSensitive' | 'exact' | 'checksOutput'
>;

/**
 * Graded exactly: an output question, or one marked `exact`. Only spacing,
 * line endings, and curly quotes are normalized, and case only with
 * `ignoreCase`.
 */
export function isExactText(
  question: Pick<TextQuestion, 'exact' | 'checksOutput'>,
): boolean {
  return !!question.checksOutput || !!question.exact;
}

const WRAPPERS = new Set(['"', "'", '`']);
const TRAILING_PUNCTUATION = /[.,;:!?]+$/;

/**
 * The equivalent form of a name, keyword, or term: normalized text without
 * wrapping quotes or backticks (`"append"`, `` `append` ``) and without
 * trailing punctuation (`append.`), folded to lower case unless case matters.
 */
export function lenientText(text: string, caseSensitive = false): string {
  let value = normalizeText(text);
  for (let before = ''; before !== value;) {
    before = value;
    value = value.replace(TRAILING_PUNCTUATION, '').trimEnd();
    if (value.length > 1 && WRAPPERS.has(value[0]) && value.at(-1) === value[0])
      value = value.slice(1, -1).trim();
  }
  return caseSensitive ? value : value.toLowerCase();
}

/** A text answer in the form a question compares. */
export function textForm(
  question: Omit<TextGrading, 'answers'>,
  text: string,
): string {
  return isExactText(question)
    ? normalizeText(text, question.ignoreCase)
    : lenientText(text, question.caseSensitive);
}

/**
 * Correct when the response matches one accepted answer: exactly for an
 * output or `exact` question, otherwise in equivalent form (`lenientText`).
 */
export function gradeText(question: TextGrading, response: string): TypedGrade {
  const typed = textForm(question, response);
  if (!typed) return { status: 'invalid', message: EMPTY_RESPONSE };
  return question.answers.some((answer) => textForm(question, answer) === typed)
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
    const forms = question.answers.map((answer) => textForm(question, answer));
    if (forms.some((answer) => !answer))
      errors.push(`${question.id}: accepted answers must not be blank.`);
    if (new Set(forms).size !== forms.length)
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
      if (question.caseSensitive || question.exact)
        errors.push(
          `${question.id}: an output question is always graded exactly; drop caseSensitive and exact.`,
        );
    } else if (question.exact) {
      if (question.caseSensitive)
        errors.push(
          `${question.id}: an exact question already keeps case; drop caseSensitive.`,
        );
    } else {
      errors.push(...lenientTextErrors(question));
    }
  }
  return errors;
}

/** Words in a prompt that ask what a program prints. */
const OUTPUT_PROMPT =
  /\b(?:print|prints|printed|output|outputs|display|displays)\b/i;

/**
 * A text question graded leniently must not lose meaning to it. These are the
 * questions that should be exact-only, or say whether case matters.
 */
function lenientTextErrors(question: TextQuestion): string[] {
  const errors: string[] = [];
  if (question.caseSensitive && question.ignoreCase)
    errors.push(
      `${question.id}: caseSensitive and ignoreCase contradict each other.`,
    );
  // "What does this print?" is an output question: the exact output is the
  // skill, so it must not accept another case or a quoted form.
  if (question.code?.trim() && OUTPUT_PROMPT.test(question.prompt))
    errors.push(
      `${question.id}: asks what code prints; make it an output question (typeOutput) so it is graded exactly.`,
    );
  for (const answer of question.answers) {
    // A char literal ('a'), a statement (x += 1;), or a bare operator (?)
    // means something different without its quotes or punctuation.
    if (lenientText(answer, true) !== normalizeText(answer))
      errors.push(
        `${question.id}: "${answer}" changes without its quotes or trailing punctuation; mark the question exact.`,
      );
    // Case carries meaning in an identifier such as True or String: the
    // author decides whether it is part of the answer.
    if (
      /\p{Lu}/u.test(answer) &&
      !question.caseSensitive &&
      !question.ignoreCase
    )
      errors.push(
        `${question.id}: "${answer}" has capitals; set caseSensitive if case is part of the answer, or ignoreCase if it is not.`,
      );
  }
  return errors;
}

/**
 * Synonyms must not accept what a related question counts wrong. When a
 * leniently graded text question of a skill accepts the correct choice of a
 * choice question of the same skill, it asks about the same thing, so it must
 * also reject every distractor of that question: through a synonym, a case
 * fold, or a stripped quote.
 */
export function synonymCollisionErrors(questions: Question[]): string[] {
  const errors: string[] = [];
  const choices = questions.filter(
    (question): question is ChoiceQuestion =>
      question.type === 'choice' && Array.isArray(question.choices),
  );
  for (const question of questions) {
    if (
      question.type !== 'text' ||
      isExactText(question) ||
      !Array.isArray(question.answers)
    )
      continue;
    const accepts = (text: string) =>
      gradeText(question, text).status === 'correct';
    for (const choice of choices) {
      if (!accepts(choice.choices[choice.answer] ?? '')) continue;
      choice.choices.forEach((distractor, index) => {
        if (index !== choice.answer && accepts(distractor))
          errors.push(
            `${question.id}: accepts "${distractor}", which ${choice.id} counts wrong; drop that synonym, or mark the question caseSensitive or exact.`,
          );
      });
    }
  }
  return errors;
}
