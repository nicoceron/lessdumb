import { randomBytes } from 'node:crypto';
import { expect, test, type APIRequestContext } from '@playwright/test';

// Runs after every deploy against the live Worker and its remote D1 database
// (playwright.smoke.config.ts). It creates one throwaway account on a reserved
// domain, so no email is ever delivered, and always deletes it again.
//
// The lesson page is changing shape, so lesson checks use roles and labels
// only and never depend on its step structure.

const runId = process.env.GITHUB_RUN_ID ?? 'local';

async function cloudState(request: APIRequestContext) {
  const response = await request.get('/api/state');
  expect(response.status()).toBe(200);
  return (await response.json()) as {
    state: { dailyGoal: number } | null;
    revision: number;
  };
}

test('a new learner signs up, saves progress to D1, opens a lesson, and deletes the account', async ({
  page,
  request,
  baseURL,
}) => {
  const origin = new URL(baseURL!).origin;
  const email = `smoke+${runId}-${Date.now()}@example.com`;
  // Generated per run, never committed or printed.
  const password = randomBytes(24).toString('base64url');
  let deleted = false;

  try {
    await test.step('sign up through the account dialog', async () => {
      await page.goto('/');
      const menu = page.getByRole('button', {
        name: 'Account menu',
        exact: true,
      });
      await expect(menu).toBeEnabled();
      await menu.click();
      await page
        .getByRole('menuitem', { name: 'Sign in or create account' })
        .click();
      const dialog = page.getByRole('dialog');
      await dialog.getByLabel('Your name').fill('Smoke test');
      await dialog.getByLabel('Email').fill(email);
      await dialog.getByLabel('Password').fill(password);
      await dialog.getByRole('button', { name: 'Create free account' }).click();
      await expect(dialog).toHaveCount(0);
      await expect(page.locator('.account-name')).toHaveText('Smoke test');
    });

    await test.step('the dashboard loads', async () => {
      await expect(
        page.getByRole('complementary', { name: 'Progress' }),
      ).toBeVisible();
      await expect(
        page.getByRole('heading', { level: 1, name: 'Learn' }),
      ).toBeAttached();
    });

    await test.step('progress saves to D1 and survives a reload', async () => {
      await page.goto('/settings');
      const goal = page.getByRole('radio', { name: /^100 XP/ });
      await goal.click();
      await expect
        .poll(async () => (await cloudState(page.request)).state?.dailyGoal, {
          timeout: 30_000,
        })
        .toBe(100);
      // Drop this browser's copy so the reload can only come from D1.
      await page.evaluate(() => localStorage.clear());
      await page.reload();
      await expect(
        page.getByRole('radio', { name: /^100 XP/ }),
      ).toHaveAttribute('aria-checked', 'true');
      const saved = await cloudState(page.request);
      expect(saved.state?.dailyGoal).toBe(100);
      expect(saved.revision).toBeGreaterThan(0);
    });

    await test.step('a lesson renders with a question', async () => {
      await page.goto('/learn');
      const main = page.getByRole('main');
      await expect(main.getByRole('heading').first()).toBeVisible({
        timeout: 30_000,
      });
      const question = main
        .getByRole('group', { name: /choices/i })
        .or(main.getByRole('radio'))
        .or(main.getByRole('textbox'))
        .or(main.getByRole('button', { name: /^(submit|check|run & check)$/i }))
        .filter({ visible: true })
        .first();
      // Some lesson layouts open on an introduction with a start button.
      const start = main.getByRole('button', { name: /^start( lesson)?$/i });
      await expect(question.or(start).first()).toBeVisible({ timeout: 30_000 });
      if (!(await question.isVisible())) await start.first().click();
      await expect(question).toBeVisible({ timeout: 30_000 });
    });

    await test.step('delete the account from the account dialog', async () => {
      await page
        .getByRole('button', { name: 'Account menu', exact: true })
        .click();
      await page
        .getByRole('menuitem', { name: 'Account', exact: true })
        .click();
      const dialog = page.getByRole('dialog');
      await dialog.getByRole('button', { name: 'Delete account' }).click();
      const form = dialog.getByRole('form', { name: 'Delete account' });
      await form.getByLabel('Password').fill(password);
      await form
        .getByRole('button', { name: 'Delete account permanently' })
        .click();
      await expect(
        page.getByText('Your account and its saved progress were deleted.'),
      ).toBeVisible();
      deleted = true;
      await expect(page.locator('.account-name')).toHaveText(
        'Your learning space',
      );
    });

    await test.step('the deleted account can no longer sign in', async () => {
      expect((await page.request.get('/api/state')).status()).toBe(401);
      const signIn = await request.post('/api/auth/sign-in/email', {
        headers: { origin },
        data: { email, password },
      });
      expect(signIn.status()).toBe(401);
    });
  } finally {
    if (!deleted) {
      // Best effort: never leave a smoke account behind after a failure.
      const signIn = await request
        .post('/api/auth/sign-in/email', {
          headers: { origin },
          data: { email, password },
        })
        .catch(() => null);
      if (signIn?.ok())
        await request
          .post('/api/auth/delete-user', {
            headers: { origin },
            data: { password },
          })
          .catch(() => null);
    }
  }
});
