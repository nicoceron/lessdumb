import { expect, test } from '@playwright/test';
import { skillById } from '../src/lib/curriculum';
import { applyAttempt, getSkillState } from '../src/lib/learning';
import { createState } from '../src/lib/state';

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
  await page
    .getByRole('button', { name: 'Open navigation', exact: true })
    .click();
  const navigation = page.getByRole('navigation', {
    name: 'Mobile navigation',
    exact: true,
  });
  await page
    .getByRole('navigation', { name: 'Mobile navigation', exact: true })
    .getByRole('link', { name: 'Knowledge graph', exact: true })
    .click();
  await expect(
    page.getByRole('heading', { name: 'Your knowledge graph.' }),
  ).toBeVisible();
  await expect(navigation).toHaveCount(0);
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
  await page
    .getByRole('button', { name: 'Open navigation', exact: true })
    .click();
  await page
    .getByRole('navigation', { name: 'Mobile navigation', exact: true })
    .getByRole('link', { name: 'Code lab', exact: true })
    .click();
  await expect(navigation).toHaveCount(0);
  await expect(page.locator('.cm-content')).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test('mobile navigation traps keyboard focus and restores its trigger on Escape', async ({
  page,
}) => {
  await page.setViewportSize({ width: 900, height: 900 });
  let hydrate: (() => void) | undefined;
  const hydrationGate = new Promise<void>((resolve) => {
    hydrate = resolve;
  });
  await page.route(/\/_astro\/App\.[^/]+\.js$/, async (route) => {
    await hydrationGate;
    await route.continue();
  });
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  const trigger = page.getByRole('button', {
    name: 'Open navigation',
    exact: true,
  });
  try {
    await expect(trigger).toBeDisabled();
  } finally {
    hydrate?.();
  }
  await expect(trigger).toBeEnabled();
  await trigger.press('Enter');
  const sheet = page.getByRole('dialog', { name: 'lessdumb', exact: true });
  await expect(sheet).toBeVisible();
  const firstLink = sheet.getByRole('link', { name: 'Today', exact: true });
  const close = sheet.getByRole('button', { name: 'Close', exact: true });
  // Radix autofocus skips navigation anchors and selects the close button.
  await expect(close).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(firstLink).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(close).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(sheet).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await page.setViewportSize({ width: 1280, height: 900 });
  await expect(trigger).toBeHidden();
  await expect(
    page.getByRole('navigation', { name: 'Main navigation', exact: true }),
  ).toBeVisible();
});

test('the account dialog traps keyboard focus and returns focus to its opener', async ({
  page,
}) => {
  await page.goto('/');
  const opener = page.getByRole('button', {
    name: 'Open account',
    exact: true,
  });
  await expect(opener).toBeEnabled();
  await opener.press('Enter');
  const dialog = page.getByRole('dialog', {
    name: 'Make yourself at home.',
    exact: true,
  });
  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveAttribute('aria-describedby', /.+/);
  const close = dialog.getByRole('button', {
    name: 'Close account dialog',
    exact: true,
  });
  await expect(close).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(
    dialog.getByRole('button', {
      name: 'Already have an account? Sign in',
      exact: true,
    }),
  ).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(close).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(opener).toBeFocused();
});

test('a failed ancestor locks a previously mastered descendant in the graph and direct lesson', async ({
  page,
}) => {
  const state = createState();
  const now = Date.now();
  for (const id of ['print-output', 'variables', 'numbers']) {
    const skill = skillById[id];
    for (const question of skill.questions) {
      state.progress = applyAttempt(
        state.progress,
        { skillId: id, questionId: question.id, correct: true, mode: 'learn' },
        now,
      );
    }
  }
  const ancestor = skillById['print-output'];
  const descendant = skillById['numbers'];
  state.progress = applyAttempt(
    state.progress,
    {
      skillId: ancestor.id,
      questionId: ancestor.questions[0].id,
      correct: false,
      mode: 'learn',
    },
    now + 1,
  );
  expect(getSkillState(state.progress, descendant.id).mastery).toBe(1);
  await page.addInitScript(
    (saved) => localStorage.setItem('lessdumb.guest', JSON.stringify(saved)),
    state,
  );
  await page.goto(`/graph?skill=${descendant.id}`);
  await expect(
    page.getByRole('button', {
      name: `${descendant.title}: Locked`,
      exact: true,
    }),
  ).toBeVisible();
  const detail = page.locator('.graph-detail');
  await expect(
    detail.getByRole('heading', { name: descendant.title }),
  ).toBeVisible();
  await expect(detail.getByText('Locked', { exact: true })).toBeVisible();
  await expect(
    detail.getByRole('link', { name: 'Practice this skill' }),
  ).toHaveCount(0);
  await page.goto(`/learn?skill=${descendant.id}`);
  await expect(
    page.getByRole('heading', { name: 'Build the foundation first.' }),
  ).toBeVisible();
  await expect(page.locator('.question-paper')).toHaveCount(0);
});
