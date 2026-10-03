import { expect, test } from '@playwright/test';
import { skillById } from '../src/lib/curriculum';
import { DAY_MS, getSkillState } from '../src/lib/learning';
import { createState } from '../src/lib/state';
import { masterSkill } from './helpers/mastery';

test('practicing a dependent credits its prerequisite in the graph and the history feed', async ({
  page,
}) => {
  const state = createState();
  const now = Date.now();
  // Learned on different days, so the later lesson can credit the earlier one.
  state.progress = masterSkill(
    state.progress,
    'print-output',
    now - 3 * DAY_MS,
  );
  state.progress = masterSkill(state.progress, 'variables', now - 2 * DAY_MS);
  const credit = getSkillState(state.progress, 'print-output').implicitCredit!;
  expect(credit).toMatchObject({ from: 'variables' });
  expect(credit.dueAt).toBeGreaterThan(credit.dueBefore);
  await page.addInitScript(
    (saved) => localStorage.setItem('lessdumb.guest', JSON.stringify(saved)),
    state,
  );

  await page.goto('/graph?skill=print-output');
  const detail = page.locator('.graph-detail');
  await expect(
    detail.getByRole('heading', { name: 'Also reviewed by' }),
  ).toBeVisible();
  await expect(detail).toContainText(skillById.variables.title);
  await expect(detail).toContainText(
    `Your next review: ${new Date(credit.dueAt).toLocaleDateString('en-US')}`,
  );
  await expect(detail).toContainText(
    `Moved later by practice in ${skillById.variables.title}`,
  );

  await page.goto('/');
  const entry = page
    .locator('.ma-history-item')
    .filter({ hasText: skillById.variables.title });
  await expect(entry).toContainText('+ reviewed 1 prerequisite');
  await expect(
    page
      .locator('.ma-history-item')
      .filter({ hasText: skillById['print-output'].title }),
  ).not.toContainText('+ reviewed');
});
