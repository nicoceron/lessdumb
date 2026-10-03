import { expect, test } from '@playwright/test';
import { skillById } from '../src/lib/curriculum';
import { applyAttempt, getSkillState } from '../src/lib/learning';
import { createState } from '../src/lib/state';
import { earnedXp, lessonXp } from '../src/lib/xp';
import {
  answeredQuestions,
  answerShown,
  continueLesson,
  feedback,
} from './helpers/lesson';
import { masterSkill } from './helpers/mastery';
import { openFromMenu } from './helpers/navigation';

test('a learner masters a skill point by point with real Python, earns cards, and keeps progress after reload', async ({
  page,
}) => {
  test.setTimeout(60_000);
  const skill = skillById['print-output'];
  const code = skill.questions.find((question) => question.type === 'code')!;
  await page.goto('/learn');
  const introduction = page.getByRole('region', {
    name: 'Introduction',
    exact: true,
  });
  await expect(introduction).toContainText(skill.lesson.paragraphs[0]);
  const markers = page.getByRole('list', { name: 'Lesson progress' });
  await expect(markers.getByRole('listitem')).toHaveCount(
    skill.knowledgePoints!.length + 1,
  );
  for (const point of skill.knowledgePoints!) {
    await expect(markers.locator('[aria-current="step"]')).toContainText(
      point.title,
    );
    const section = page.getByRole('region', {
      name: point.title,
      exact: true,
    });
    await expect(section.getByRole('heading', { level: 2 })).toHaveText(
      point.title,
    );
    for (let answer = 0; answer < 2; answer++) {
      const question = await answerShown(page, point.questions);
      await expect(feedback(page)).toContainText('Correct');
      await expect(feedback(page)).toContainText(question.explanation);
      await continueLesson(page);
    }
  }
  await expect(markers.locator('[aria-current="step"]')).toContainText(
    'Write the code',
  );
  // The code exercise comes last, on the same page as everything before it.
  await expect(
    page.getByRole('region', { name: 'Write the code', exact: true }),
  ).toBeVisible();
  await expect(introduction).toContainText(skill.lesson.paragraphs[0]);
  await expect(answeredQuestions(page)).toHaveCount(
    skill.knowledgePoints!.length * 2,
  );
  await answerShown(
    page,
    [code],
    true,
    'print("Hello, lessdumb!")\nprint("I can learn Python.")',
  );
  await expect(feedback(page)).toContainText('Lesson complete', {
    timeout: 40_000,
  });
  await expect(
    page.getByRole('region', { name: 'Lesson complete', exact: true }),
  ).toContainText(`You earned ${earnedXp(lessonXp(skill), 0, true)} XP.`);
  await expect(
    page.getByText(`${earnedXp(lessonXp(skill), 0, true)} XP this session`, {
      exact: true,
    }),
  ).toBeVisible();
  await openFromMenu(page, /^Flashcards/);
  await expect(page.getByRole('button', { name: /BREAKTHROUGH/ })).toHaveCount(
    2,
  );
  await page.reload();
  await expect(page.getByRole('button', { name: /BREAKTHROUGH/ })).toHaveCount(
    2,
  );
  await openFromMenu(page, 'Knowledge graph');
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
  const tabs = page.getByRole('navigation', {
    name: 'Main navigation',
    exact: true,
  });
  await expect(tabs.getByRole('link')).toHaveText(['Learn', 'Courses']);
  await openFromMenu(page, 'Knowledge graph');
  await expect(
    page.getByRole('heading', { level: 1, name: 'Knowledge graph' }),
  ).toBeVisible();
  await expect(page.getByRole('menu')).toHaveCount(0);
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
  await openFromMenu(page, 'Code lab');
  await expect(page.getByRole('menu')).toHaveCount(0);
  await expect(page.locator('.cm-content')).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  for (const path of ['/', '/courses']) {
    await page.goto(path);
    await expect(page.getByText('Preparing your learning space…')).toHaveCount(
      0,
    );
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
});

test('the account menu is keyboard operable and restores its trigger on Escape', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
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
    name: 'Account menu',
    exact: true,
  });
  try {
    await expect(trigger).toBeDisabled();
  } finally {
    hydrate?.();
  }
  await expect(trigger).toBeEnabled();
  await trigger.press('Enter');
  const menu = page.getByRole('menu');
  await expect(menu).toBeVisible();
  const first = menu.getByRole('menuitem', {
    name: 'Knowledge graph',
    exact: true,
  });
  await expect(first).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await expect(
    menu.getByRole('menuitem', { name: 'Flashcards', exact: true }),
  ).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(menu).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await page.setViewportSize({ width: 1280, height: 900 });
  await expect(
    page.getByRole('navigation', { name: 'Main navigation', exact: true }),
  ).toBeVisible();
  await expect(page.getByText(/day streak/)).toHaveCount(0);
  await expect(
    page.getByRole('navigation', { name: 'breadcrumb' }),
  ).toHaveCount(0);
});

test('the account dialog traps keyboard focus and returns focus to its opener', async ({
  page,
}) => {
  await page.goto('/');
  const opener = page.getByRole('button', {
    name: 'Account menu',
    exact: true,
  });
  await expect(opener).toBeEnabled();
  await opener.press('Enter');
  await page
    .getByRole('menuitem', { name: 'Sign in or create account', exact: true })
    .press('Enter');
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
  for (const id of ['print-output', 'variables', 'numbers'])
    state.progress = masterSkill(state.progress, id, now);
  const ancestor = skillById['print-output'];
  const descendant = skillById['numbers'];
  state.progress = applyAttempt(
    state.progress,
    {
      skillId: ancestor.id,
      questionId: ancestor.knowledgePoints![0].questions[0].id,
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
