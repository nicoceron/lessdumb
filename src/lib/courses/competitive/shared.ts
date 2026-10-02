import type { ChoiceQuestion, CodeQuestion, Skill } from '../../curriculum';

export const courseId = 'competitive-programming';

export function choice(
  prompt: string,
  choices: string[],
  answer: number,
  explanation: string,
  hint: string,
  code?: string,
): Omit<ChoiceQuestion, 'id'> {
  return {
    type: 'choice',
    prompt,
    choices,
    answer,
    explanation,
    hint,
    ...(code ? { code } : {}),
  };
}

export function exercise(
  prompt: string,
  starterCode: string,
  solution: string,
  tests: string,
  explanation: string,
  hint: string,
): Omit<CodeQuestion, 'id'> {
  return {
    type: 'code',
    prompt,
    starterCode,
    solution,
    tests,
    explanation,
    hint,
  };
}

export function skill(
  id: string,
  unitId: string,
  title: string,
  summary: string,
  prerequisites: string[],
  paragraphs: string[],
  code: string,
  output: string,
  explanation: string,
  questions: (Omit<ChoiceQuestion, 'id'> | Omit<CodeQuestion, 'id'>)[],
  cards: [string, string][],
): Skill {
  return {
    id,
    courseId,
    domain: 'programming',
    unitId,
    title,
    summary,
    // Every contest assessment defines a function with inputs and a result.
    // Reuse the real Python foundation rather than granting assumed knowledge.
    prerequisites: [...new Set(['parameters', ...prerequisites])],
    order: 0,
    estimatedMinutes: 12,
    assessment: { requiredTypes: ['code', 'choice'], reviewAnswers: 2 },
    lesson: { paragraphs, example: { code, output, explanation } },
    questions: questions.map((question, index) => ({
      ...question,
      id: `${id}-q${index + 1}`,
    })),
    flashcards: cards.map(([front, back], index) => ({
      id: `${id}-card${index + 1}`,
      skillId: id,
      front,
      back,
    })),
  };
}
