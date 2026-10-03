import type {
  ChoiceQuestion,
  CodeQuestion,
  LessonExample,
} from '../curriculum';

export type QuestionDraft =
  Omit<ChoiceQuestion, 'id'> | Omit<CodeQuestion, 'id'>;

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
