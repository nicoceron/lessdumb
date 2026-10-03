import type {
  ChoiceQuestion,
  CodeQuestion,
  LessonExample,
  NumericQuestion,
  TextQuestion,
} from '../curriculum';

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
