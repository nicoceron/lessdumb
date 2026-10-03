import { expect, type Page } from '@playwright/test';
import type { ChoiceQuestion, Question } from '../../src/lib/curriculum';
import { replaceCode } from './editor';

/**
 * A choice button by its authored index. Choices are shuffled per
 * presentation, so the displayed letter is not fixed; the button's name is
 * "<letter> <choice>".
 */
export function choiceButton(page: Page, index: number) {
  return page
    .getByRole('group', { name: 'Choices', exact: true })
    .locator(`[data-choice="${index}"]`);
}

/** The prompt of the question currently shown. */
export function prompt(page: Page) {
  return page.locator('.question-paper h1');
}

export function feedback(page: Page) {
  return page.locator('.question-paper [data-slot="alert"][role="status"]');
}

/** The question on screen, identified among candidates by prompt and code. */
export async function shownQuestion<T extends Question>(
  page: Page,
  candidates: T[],
): Promise<T> {
  await expect(prompt(page)).toBeVisible();
  const text = await prompt(page).textContent();
  const matches = candidates.filter((question) => question.prompt === text);
  if (matches.length === 1) return matches[0];
  // Same prompt, different program: compare the displayed code, ignoring
  // the whitespace that highlighting may add or drop.
  const squash = (text: string) => text.replace(/\s+/g, '');
  const shown = squash(
    await page
      .locator('.question-paper')
      .first()
      .evaluate((paper) => {
        const copy = paper.cloneNode(true) as HTMLElement;
        copy.querySelector('.answer-options')?.remove();
        return copy.textContent ?? '';
      }),
  );
  const match = matches
    .filter(
      (question) =>
        question.type === 'choice' &&
        !!question.code &&
        shown.includes(squash(question.code)),
    )
    .sort(
      (a, b) =>
        ((b as ChoiceQuestion).code?.length ?? 0) -
        ((a as ChoiceQuestion).code?.length ?? 0),
    )[0];
  if (!match) throw new Error(`Unknown question on screen: ${text}`);
  return match;
}

/** Select a choice (the answer, or the first wrong one) and submit it. */
export async function answerChoice(
  page: Page,
  question: ChoiceQuestion,
  correct = true,
) {
  await expect(prompt(page)).toHaveText(question.prompt);
  const index = correct
    ? question.answer
    : question.choices.findIndex((_, i) => i !== question.answer);
  await expect(choiceButton(page, index)).toContainText(
    question.choices[index].split('\n')[0],
  );
  await choiceButton(page, index).click();
  await page.getByRole('button', { name: 'Submit', exact: true }).click();
}

/** Answer the question on screen, whichever of the candidates it is. */
export async function answerShown(
  page: Page,
  candidates: Question[],
  correct = true,
  code?: string,
) {
  const question = await shownQuestion(page, candidates);
  if (question.type === 'choice') await answerChoice(page, question, correct);
  else {
    await replaceCode(page, code ?? (correct ? question.solution : 'pass'));
    await page
      .getByRole('button', { name: 'Run & check', exact: true })
      .click();
  }
  await expect(feedback(page)).toBeVisible({ timeout: 60_000 });
  return question;
}

export async function continueLesson(page: Page) {
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
}
