import type { AnswerQuestion } from '../../src/lib/curriculum';
import { formatNumber } from '../../src/lib/typed-answer';

/** The answer a quiz or placement test accepts: a choice index or typed text. */
export function rightAnswer(question: AnswerQuestion): number | string {
  if (question.type === 'choice') return question.answer;
  if (question.type === 'numeric') return formatNumber(question.answer);
  return question.answers[0];
}

/** A gradable answer that is wrong: another choice, or other typed text. */
export function wrongAnswer(question: AnswerQuestion): number | string {
  if (question.type === 'choice')
    return (question.answer + 1) % question.choices.length;
  if (question.type === 'numeric')
    return formatNumber(
      question.answer + Math.max(1, 10 * (question.tolerance ?? 0)),
    );
  return `${question.answers[0]} and more`;
}
