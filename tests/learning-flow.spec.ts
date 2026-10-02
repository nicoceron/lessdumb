import { expect, test } from '@playwright/test';

test('a learner masters a skill with real Python, earns cards, and keeps progress after reload', async ({
  page,
}) => {
  test.setTimeout(60_000);
  await page.goto('/learn');
  await page.getByRole('button', { name: 'Let’s try it' }).click();
  for (const answer of ['A Python', 'C print("Ready")', 'B 1\n2']) {
    await page.getByRole('button', { name: answer, exact: true }).click();
    await page
      .getByRole('button', { name: 'Check answer', exact: true })
      .click();
    await expect(
      page.getByText('That’s a small win.', { exact: true }),
    ).toBeVisible();
    await page.getByRole('button', { name: 'Continue', exact: true }).click();
  }
  await page
    .locator('.cm-content')
    .fill('print("Hello, lessdumb!")\nprint("I can learn Python.")');
  await page.getByRole('button', { name: 'Run & check', exact: true }).click();
  await expect(
    page.getByText('Skill mastered. A new connection made.', { exact: true }),
  ).toBeVisible({ timeout: 40_000 });
  await expect(
    page.getByText('45 XP this session', { exact: true }),
  ).toBeVisible();
  await page.getByRole('link', { name: /^Flashcards/ }).click();
  await expect(page.getByRole('button', { name: /BREAKTHROUGH/ })).toHaveCount(
    2,
  );
  await page.reload();
  await expect(page.getByRole('button', { name: /BREAKTHROUGH/ })).toHaveCount(
    2,
  );
  await page
    .getByRole('link', { name: 'Knowledge graph', exact: true })
    .click();
  await expect(
    page.getByRole('button', {
      name: 'Your first output: Mastered',
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole('button', {
      name: 'Names and variables: Ready to learn',
      exact: true,
    }),
  ).toBeVisible();
});

test('mobile navigation, graph selection, and editor stay inside the viewport', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Open navigation' }).click();
  await page
    .getByRole('link', { name: 'Knowledge graph', exact: true })
    .click();
  await expect(
    page.getByRole('heading', { name: 'Your knowledge graph.' }),
  ).toBeVisible();
  await expect(page.getByRole('button', { name: 'Close menu' })).toHaveCount(0);
  await page.getByRole('textbox', { name: 'Find a skill' }).fill('output');
  await page
    .getByRole('button', {
      name: 'Your first output: Ready to learn',
      exact: true,
    })
    .press('Enter');
  await page.getByRole('button', { name: 'Zoom out' }).click();
  await expect(page.getByText('85%', { exact: true })).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.getByRole('button', { name: 'Open navigation' }).click();
  await page.getByRole('link', { name: 'Python lab', exact: true }).click();
  await expect(page.locator('.cm-content')).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
