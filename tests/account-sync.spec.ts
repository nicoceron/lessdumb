import { expect, test, type Page } from '@playwright/test';
import { createState, type LearnerState } from '../src/lib/state';

const baseURL = process.env.LESSDUMB_E2E_URL ?? 'http://127.0.0.1:4321';
test.use({ baseURL });

async function register(page: Page, name: string) {
  const response = await page.request.post(
    `${baseURL}/api/auth/sign-up/email`,
    {
      headers: { origin: baseURL },
      data: {
        name,
        email: `sync-${name}-${Date.now()}-${Math.random().toString(16).slice(2)}@example.test`,
        password: 'testing-progress-123',
      },
    },
  );
  expect(response.status()).toBe(200);
  return (await response.json()).user.id as string;
}
async function cloud(page: Page) {
  const response = await page.request.get(`${baseURL}/api/state`);
  expect(response.status()).toBe(200);
  return (await response.json()) as {
    state: LearnerState | null;
    revision: number;
  };
}
async function seed(page: Page, userId: string) {
  const state = createState();
  state.dailyGoal = 100;
  state.progress.totalXp = 99;
  state.progress.dailyXp = { '2026-10-01': 99 };
  state.progress.lastActivityDate = '2026-10-01';
  state.progress.streak = 1;
  state.createdAt = state.updatedAt = Date.parse('2026-10-01T00:00:00.000Z');
  const response = await page.request.put(`${baseURL}/api/state`, {
    headers: { origin: baseURL, 'X-Lessdumb-User': userId },
    data: { state, revision: 0 },
  });
  expect(response.status()).toBe(200);
}

test('a failed cloud load saves locally and retry preserves existing account progress', async ({
  page,
}) => {
  const userId = await register(page, 'offline');
  await seed(page, userId);
  let blockLoad = true;
  let saves = 0;
  await page.route('**/api/state', (route) => {
    if (route.request().method() === 'GET' && blockLoad)
      return route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Temporarily unavailable' }),
      });
    if (route.request().method() === 'PUT') saves += 1;
    return route.continue();
  });
  await page.goto('/settings');
  await expect(
    page.getByText('Account unavailable · progress saved on this device', {
      exact: true,
    }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      (id) => localStorage.getItem(`lessdumb.account.${id}`),
      userId,
    ),
  ).toBeNull();
  await page.getByRole('button', { name: '25 XP A small step' }).click();
  await expect
    .poll(async () =>
      page.evaluate(
        (id) =>
          JSON.parse(localStorage.getItem(`lessdumb.account.${id}`) ?? 'null')
            ?.dailyGoal,
        userId,
      ),
    )
    .toBe(25);
  await page.waitForTimeout(1000);
  expect(saves).toBe(0);

  blockLoad = false;
  await page.getByRole('button', { name: 'Retry progress sync' }).click();
  await expect.poll(async () => (await cloud(page)).state?.dailyGoal).toBe(25);
  const result = await cloud(page);
  expect(result.state?.progress.totalXp).toBe(99);
  expect(result.revision).toBeGreaterThan(1);
});

test('an old tab cannot save one learner’s progress with another learner’s cookie', async ({
  page,
}) => {
  const first = await register(page, 'first');
  await seed(page, first);
  await page.goto('/settings');
  await expect(
    page.getByRole('button', { name: '100 XP A deeper session' }),
  ).toHaveClass('selected');
  await expect(
    page.getByText('All progress saved', { exact: true }),
  ).toBeVisible();

  // APIRequestContext shares this browser context's cookies, like another tab signing in.
  const second = await register(page, 'second');
  expect((await cloud(page)).state).toBeNull();
  await page.getByRole('button', { name: '25 XP A small step' }).click();
  await expect
    .poll(async () => (await cloud(page)).state?.progress.totalXp)
    .toBe(0);
  expect((await cloud(page)).state?.cards).toEqual([]);
  await expect
    .poll(async () =>
      page.evaluate(
        (id) =>
          JSON.parse(localStorage.getItem(`lessdumb.account.${id}`) ?? 'null')
            ?.progress.totalXp,
        second,
      ),
    )
    .toBe(0);
  expect(
    await page.evaluate(
      (id) =>
        JSON.parse(localStorage.getItem(`lessdumb.account.${id}`) ?? 'null')
          ?.progress.totalXp,
      first,
    ),
  ).toBe(99);
});
