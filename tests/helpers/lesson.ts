import { expect, type Locator, type Page } from '@playwright/test';
import type { ChoiceQuestion, Question, Skill } from '../../src/lib/curriculum';
import { lessonSteps, POINT_PASS_CORRECT } from '../../src/lib/lesson-plan';
import { plainProse } from '../../src/lib/math-text';
import { replaceCode } from './editor';

/**
 * The question being answered now. A lesson or review page keeps every
 * answered question above it, marked data-state="answered"; quiz and
 * placement pages show one question at a time.
 */
export function currentQuestion(page: Page) {
  return page.locator('.question-paper:not([data-state="answered"])');
}

/** Questions already answered on this page, oldest first. */
export function answeredQuestions(page: Page) {
  return page.locator('.question-paper[data-state="answered"]');
}

/**
 * A choice button by its authored index. Choices are shuffled per
 * presentation, so the displayed letter is not fixed; the button's name is
 * "<letter> <choice>".
 */
export function choiceButton(page: Page, index: number) {
  return currentQuestion(page)
    .getByRole('group', { name: 'Choices', exact: true })
    .locator(`[data-choice="${index}"]`);
}

const squashSpaces = (text: string) => text.replace(/\s+/g, ' ').trim();

/**
 * Rendered prose in authored form, to compare with `plainProse(text)`: math
 * becomes `$TeX$` (from KaTeX's annotation, or the source shown while KaTeX
 * loads) and inline code is wrapped in backticks.
 */
export async function proseText(locator: Locator): Promise<string> {
  return squashSpaces(
    await locator.evaluate((element) => {
      const copy = element.cloneNode(true) as HTMLElement;
      for (const math of copy.querySelectorAll('.math-inline, .math-display')) {
        const delimiter = math.classList.contains('math-display') ? '$$' : '$';
        const tex =
          math.querySelector('annotation')?.textContent ?? math.textContent;
        math.replaceWith(`${delimiter}${tex}${delimiter}`);
      }
      for (const code of copy.querySelectorAll('code.inline-code'))
        code.replaceWith(`\`${code.textContent}\``);
      return copy.textContent ?? '';
    }),
  );
}

/** Waits until the element shows the authored prose `text`. */
export async function expectProse(locator: Locator, text: string) {
  await expect
    .poll(() => proseText(locator))
    .toBe(squashSpaces(plainProse(text)));
}

/** The prompt of the current question (an h1 on quiz and placement pages). */
export function prompt(page: Page) {
  return currentQuestion(page).locator('.question-prompt, h1');
}

/** The current question's result, announced after it is answered. */
export function feedback(page: Page) {
  return currentQuestion(page).locator('[data-slot="alert"][role="status"]');
}

/** The question on screen, identified among candidates by prompt and code. */
export async function shownQuestion<T extends Question>(
  page: Page,
  candidates: T[],
): Promise<T> {
  await expect(prompt(page)).toBeVisible();
  const text = await proseText(prompt(page));
  const matches = candidates.filter(
    (question) => squashSpaces(plainProse(question.prompt)) === text,
  );
  if (matches.length === 1) return matches[0];
  // Same prompt, different program: compare the displayed code, ignoring
  // the whitespace that highlighting may add or drop.
  const squash = (text: string) => text.replace(/\s+/g, '');
  const shown = squash(
    await currentQuestion(page).evaluate((paper) => {
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
  await expectProse(prompt(page), question.prompt);
  const index = correct
    ? question.answer
    : question.choices.findIndex((_, i) => i !== question.answer);
  const choice = question.choices[index];
  if (question.checksOutput)
    await expect(choiceButton(page, index)).toContainText(
      choice.split('\n')[0],
    );
  else await expectProse(choiceButton(page, index).locator('pre'), choice);
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

/** From a completed lesson's summary, open the next scheduled task. */
export async function openNextTask(page: Page) {
  await page
    .getByRole('region', { name: 'Lesson complete', exact: true })
    .getByRole('button', { name: 'Next task', exact: true })
    .click();
}

/**
 * Pass a knowledge-point lesson that is open on its page: two correct answers
 * on each point, then the code exercise where the lesson has one. Returns the
 * number of answers given; the last one's feedback is left on screen.
 */
export async function completeLesson(
  page: Page,
  skill: Skill,
  { code }: { code?: string } = {},
): Promise<number> {
  const steps = lessonSteps(skill);
  let answers = 0;
  for (const [index, step] of steps.entries()) {
    const repeats = step.kind === 'point' ? POINT_PASS_CORRECT : 1;
    for (let repeat = 0; repeat < repeats; repeat++) {
      await answerShown(page, step.questions, true, code);
      answers++;
      const last = index === steps.length - 1 && repeat === repeats - 1;
      await expect(feedback(page)).toContainText(
        last ? 'Lesson complete' : 'Correct',
        { timeout: 60_000 },
      );
      if (!last) await continueLesson(page);
    }
  }
  return answers;
}
