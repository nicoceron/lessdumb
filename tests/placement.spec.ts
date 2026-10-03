import { expect, test, type Page } from '@playwright/test';
import { skillById, type ChoiceQuestion } from '../src/lib/curriculum';
import { DAY_MS, getSkillState, isMastered } from '../src/lib/learning';
import {
  activeDiagnostic,
  diagnosticQuestion,
  type Diagnostic,
} from '../src/lib/placement';
import type { LearnerState } from '../src/lib/state';
import { choiceButton, expectProse, feedback, prompt } from './helpers/lesson';

/** Skills the simulated learner knows: these and everything they use. */
function closure(ids: string[]): Set<string> {
  const result = new Set<string>();
  const visit = (id: string) => {
    if (result.has(id)) return;
    result.add(id);
    skillById[id].prerequisites.forEach(visit);
  };
  ids.forEach(visit);
  return result;
}

async function guest(page: Page): Promise<LearnerState> {
  return page.evaluate(() =>
    JSON.parse(localStorage.getItem('lessdumb.guest') ?? 'null'),
  );
}

test('a placement test adapts without feedback, reports the placement, and Learn starts at the frontier', async ({
  page,
}) => {
  test.setTimeout(180_000);
  const known = closure(['strings', 'comparisons']);
  await page.goto('/');
  // A new learner is offered the optional test; skipping is the default path.
  await expect(page.getByText(/Already know some of/)).toBeVisible();
  await page.getByRole('link', { name: 'Take the placement test' }).click();
  await expect(page).toHaveURL(/\/learn\?placement=python-foundations$/);
  await expect(
    page.getByRole('region', { name: 'Placement instructions' }),
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'Skip: start from the beginning' }),
  ).toHaveAttribute('href', '/');
  await page
    .getByRole('button', { name: 'Start placement test', exact: true })
    .click();

  // Each step waits until the saved test has recorded the previous answer.
  const answered = async () => {
    const state = await guest(page);
    const last = state?.progress.diagnostics?.at(-1);
    return last ? last.answers.length + (last.completedAt ? 1000 : 0) : -1;
  };
  for (let index = 0; index < 60; index++) {
    await expect.poll(answered).toBeGreaterThanOrEqual(index);
    const state = (await guest(page))!;
    const diagnostic: Diagnostic | undefined = activeDiagnostic(state.progress);
    if (!diagnostic) break;
    const { skill, question } = diagnosticQuestion(diagnostic.current!)!;
    await expectProse(prompt(page), question.prompt);
    await expect(page.getByText(`Question ${index + 1}`)).toBeVisible();
    await expect(
      page.getByRole('progressbar', { name: 'Placement progress' }),
    ).toBeVisible();
    // Browser specs predate typed answers (CEN-111): they answer choices only.
    const choice = question as ChoiceQuestion;
    const answer = known.has(skill.id)
      ? choice.answer
      : (choice.answer + 1) % choice.choices.length;
    await choiceButton(page, answer).click();
    await page.getByRole('button', { name: 'Submit', exact: true }).click();
    // No correctness feedback during the test.
    await expect(feedback(page)).toHaveCount(0);
    await expect.poll(answered).toBeGreaterThan(index);
  }

  const report = page.locator('.placement-report');
  await expect(report).toBeVisible();
  const state = (await guest(page))!;
  const finished = state.progress.diagnostics!.at(-1)!;
  expect(finished.completedAt).toBeDefined();
  const placed = finished.placed!;
  expect(placed.length).toBeGreaterThan(0);
  for (const id of placed) expect(known.has(id)).toBe(true);
  await expect(report).toContainText(
    `You placed out of ${placed.length} skill${placed.length === 1 ? '' : 's'}`,
  );
  await expect(report).toContainText('you are on track to finish in');
  const start = page.getByRole('region', { name: 'Where you start' });
  await expect(start).toBeVisible();
  await expect(
    page.getByRole('region', { name: 'Placed out of' }),
  ).toContainText(skillById[placed[0]].title);

  // Placement earns nothing and schedules the placed skills' first reviews.
  expect(state.progress.totalXp).toBe(0);
  expect(state.progress.attempts).toEqual([]);
  expect(state.cards).toEqual([]);
  for (const id of placed) {
    expect(isMastered(state.progress, id)).toBe(true);
    const dueAt = getSkillState(state.progress, id).dueAt!;
    expect(dueAt).toBeGreaterThanOrEqual(finished.completedAt! + DAY_MS);
    expect(dueAt).toBeLessThanOrEqual(finished.completedAt! + 14 * DAY_MS);
  }

  await page.getByRole('link', { name: 'Start learning' }).click();
  const first = page.locator('.ma-task-list > li').first();
  await expect(first.locator('.ma-task-type')).toHaveText('Lesson');
  const title = await first.locator('.ma-task-title').textContent();
  const skill = Object.values(skillById).find((item) => item.title === title)!;
  expect(placed).not.toContain(skill.id);
  expect(
    skill.prerequisites.every((id) => isMastered(state.progress, id)),
  ).toBe(true);
  await expect(start).toHaveCount(0);
  // Placed skills show as mastered in the graph, and the offer is gone.
  await expect(page.getByText(/Already know some of/)).toHaveCount(0);
  await page.goto(`/graph?skill=${placed[0]}`);
  await expect(
    page.locator('.graph-detail').getByText(/Your next review:/),
  ).toBeVisible();
});
