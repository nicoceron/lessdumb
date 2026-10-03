import { expect, test, type Page } from '@playwright/test';
import { courses, skillById } from '../src/lib/curriculum';
import {
  applyAttempt,
  dateKey,
  DAY_MS,
  getSkillState,
  nextTask,
  selectQuestion,
} from '../src/lib/learning';
import {
  courseMastery,
  courseOutline,
  courseSequence,
  estimateCompletion,
  formatDayHeading,
  formatMonthYear,
  taskHistory,
  taskQueue,
} from '../src/lib/dashboard';
import { createState, type LearnerState } from '../src/lib/state';
import { REVIEW_XP } from '../src/lib/xp';
import { masterSkill } from './helpers/mastery';
import { openFromMenu } from './helpers/navigation';

async function ready(page: Page) {
  await expect(page.getByText('Preparing your learning space…')).toHaveCount(0);
}
async function asGuest(page: Page, state: LearnerState) {
  await page.addInitScript(
    (value) => localStorage.setItem('lessdumb.guest', JSON.stringify(value)),
    state,
  );
}
function master(state: LearnerState, id: string, at: number) {
  state.progress = masterSkill(state.progress, id, at);
}

test('Learn shows the active course, XP, frontier tasks, and dated history', async ({
  page,
}) => {
  const now = Date.now();
  const state = createState();
  state.activeCourseId = 'machine-learning';
  state.dailyGoal = 25;
  master(state, 'print-output', now - 3 * DAY_MS);
  const due = getSkillState(state.progress, 'print-output').dueAt!;
  const review = skillById['print-output'];
  // Complete one review cycle with the engine's own question choices.
  while (getSkillState(state.progress, review.id).dueAt === due)
    state.progress = applyAttempt(
      state.progress,
      {
        skillId: review.id,
        questionId: selectQuestion(state.progress, review, 'review').id,
        correct: true,
        mode: 'review',
      },
      due + 60_000,
    );
  master(state, 'variables', now - 60_000);
  // Keep learning along the scheduler's path until several lessons are ready.
  let latest = 'variables';
  for (
    let i = 1;
    taskQueue(state.progress, 'machine-learning', now).length < 3;
    i++
  ) {
    latest = nextTask(state.progress, now, 'machine-learning')!.skillId;
    master(state, latest, now - 60_000 + i * 1_000);
  }
  await asGuest(page, state);
  await page.goto('/');
  await ready(page);

  const nav = page.getByRole('navigation', { name: 'Main navigation' });
  await expect(nav.getByRole('link')).toHaveText(['Learn', 'Courses']);
  await expect(nav.getByRole('link', { name: 'Learn' })).toHaveAttribute(
    'aria-current',
    'page',
  );

  const course = page.getByRole('region', { name: 'Machine Learning' });
  await expect(course.getByRole('progressbar')).toHaveAttribute(
    'aria-valuenow',
    '0',
  );
  const estimate = estimateCompletion(
    state.progress,
    25,
    'machine-learning',
    now,
  );
  if (estimate.status !== 'estimated') throw new Error('Expected an estimate');
  await expect(course).toContainText(
    `Estimated completion is ${formatMonthYear(estimate.dateKey)}`,
  );

  const xp = page.getByRole('region', { name: 'XP' });
  await expect(xp).toContainText(`${state.progress.totalXp} XP`);
  const today = state.progress.dailyXp[dateKey(now, state.progress.timeZone)];
  await expect(xp).toContainText(`${today}/25 XP`);
  await expect(xp.getByText('This week')).toBeVisible();

  const tasks = page
    .getByRole('region', { name: 'Tasks' })
    .locator('article.ma-task');
  const count = await tasks.count();
  expect(count).toBeGreaterThan(1);
  expect(count).toBeLessThanOrEqual(5);
  const first = tasks.first();
  const scheduled = nextTask(state.progress, now, 'machine-learning')!;
  await expect(first.getByRole('button')).toHaveAttribute(
    'aria-expanded',
    'true',
  );
  await expect(first).toContainText(skillById[scheduled.skillId].title);
  await expect(first).toContainText('Python foundations');
  await expect(first).toContainText(/Lesson\s*\d+ XP/);
  await expect(first.getByText('Prerequisites')).toBeVisible();
  for (const id of skillById[scheduled.skillId].prerequisites)
    await expect(
      first.getByRole('link', { name: skillById[id].title }),
    ).toHaveAttribute('href', `/graph?skill=${id}`);
  await expect(first.getByRole('link', { name: 'Start' })).toHaveAttribute(
    'href',
    `/learn?skill=${scheduled.skillId}&mode=learn&course=machine-learning`,
  );
  const second = tasks.nth(1);
  await expect(second.getByRole('button')).toHaveAttribute(
    'aria-expanded',
    'false',
  );
  await second.getByRole('button').click();
  await expect(second.getByRole('button')).toHaveAttribute(
    'aria-expanded',
    'true',
  );
  await expect(first.getByRole('button')).toHaveAttribute(
    'aria-expanded',
    'false',
  );

  const history = page.getByRole('region', { name: 'History' });
  const zone = state.progress.timeZone;
  await expect(
    history.getByRole('heading', {
      name: formatDayHeading(dateKey(now - 60_000, zone)),
    }),
  ).toBeVisible();
  await expect(
    history.getByRole('heading', {
      name: formatDayHeading(dateKey(due + 60_000, zone)),
    }),
  ).toBeVisible();
  const items = history.locator('.ma-history-item');
  await expect(items).toHaveCount(taskHistory(state.progress).length);
  await expect(items.nth(0)).toContainText(skillById[latest].title);
  await expect(items.nth(0)).toContainText(/Completed @ \d{1,2}:\d{2} [AP]M/);
  // Match the task type, not a "+ reviewed N prerequisites" note.
  const reviewItem = items.filter({
    has: page.locator('.ma-task-type', { hasText: /^Review$/ }),
  });
  await expect(reviewItem).toContainText('Your first output');
  await expect(reviewItem).toContainText(`/${REVIEW_XP} XP`);

  await expect(page.getByText(/day streak/i)).toHaveCount(0);
  await expect(page.getByText('Spaced practice')).toHaveCount(0);
  await expect(page.getByLabel('CURRENT COURSE')).toHaveCount(0);
});

test('a new learner sees one ready lesson, no history, and a completion estimate', async ({
  page,
}) => {
  await page.goto('/');
  await ready(page);
  const tasks = page.locator('article.ma-task');
  await expect(tasks).toHaveCount(1);
  await expect(tasks.first()).toContainText('Your first output');
  await expect(tasks.first()).toContainText('None');
  await expect(
    tasks.first().getByRole('link', { name: 'Start' }),
  ).toBeVisible();
  await expect(
    page.getByText('Completed lessons and reviews appear here.'),
  ).toBeVisible();
  await expect(
    page.getByRole('region', { name: 'Python foundations' }),
  ).toContainText(/Estimated completion is [A-Z][a-z]+ \d{4}/);
  await openFromMenu(page, 'Settings & connections');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Settings');
  await expect(page.getByRole('status').first()).toHaveText(
    'Saved on this device',
  );
});

test('Courses shows the course sequence and numbered skills that open the graph', async ({
  page,
}) => {
  await page.goto('/courses?course=machine-learning');
  await ready(page);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Courses');
  const sequence = page.getByRole('region', { name: 'Course sequence' });
  await expect(sequence.getByRole('button')).toHaveText(
    courseSequence('machine-learning').map((course) => course.title),
  );
  await expect(
    sequence.getByRole('button', { name: 'Machine Learning' }),
  ).toHaveAttribute('aria-current', 'true');

  const main = page.getByRole('region', { name: 'Machine Learning' });
  // Counts come from the catalog, which grows as skills are added.
  const fresh = createState().progress;
  const ml = courses.find((course) => course.id === 'machine-learning')!;
  const outline = courseOutline(fresh, ml.id);
  await expect(main).toContainText(
    `0 of ${courseMastery(fresh, ml).total} skills mastered · ${outline.length} units`,
  );
  const firstUnit = main.getByRole('button', {
    name: new RegExp(`^1\\s*${outline[0].unit.title}`),
  });
  await expect(firstUnit).toHaveAttribute('aria-expanded', 'true');
  await expect(firstUnit).toContainText(`${outline[0].total} skills`);
  const row = main.getByRole('link', { name: /^Locked\s*1\.1\s*[A-Z]/ });
  await expect(row).toHaveAttribute('href', /^\/graph\?skill=/);
  await row.click();
  await expect(page.getByLabel('Graph course')).toHaveValue('machine-learning');

  await page.goto('/courses');
  await ready(page);
  await page
    .getByRole('region', { name: 'All courses' })
    .getByRole('button', { name: /^Rust: from zero to systems/ })
    .click();
  await expect(page).toHaveURL(/\/courses\?course=rust$/);
  const rust = page.getByRole('region', { name: 'Rust: from zero to systems' });
  await expect(rust.getByText('1.1.1', { exact: true })).toBeVisible();
  await expect(
    rust.getByRole('link', { name: /^Ready to learn\s*1\.1\.1\s*[A-Z]/ }),
  ).toHaveAttribute('href', '/graph?skill=rust-main');
  await expect(
    page.getByRole('button', { name: 'Set as active course' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Set as active course' }).click();
  await page
    .getByRole('navigation', { name: 'Main navigation' })
    .getByRole('link', { name: 'Learn' })
    .click();
  await expect(
    page.getByRole('region', { name: 'Rust: from zero to systems' }),
  ).toBeVisible();
  await expect(page.locator('article.ma-task').first()).toContainText(
    skillById['rust-main'].title,
  );
});
