import { expect, test, type Page } from '@playwright/test';
import { createState } from '../src/lib/state';
import { signUp } from './helpers/accounts';
import {
  emailMode,
  openAccountDialog,
  outboxDirectory,
  waitForLink,
} from './helpers/outbox';

const baseURL = process.env.LESSDUMB_E2E_URL ?? 'http://127.0.0.1:4321';
const password = 'testing-email-flows-123';
test.use({ baseURL });

const unique = (label: string) =>
  `email-${label}-${Date.now()}-${Math.random().toString(16).slice(2)}@example.test`;

async function register(
  request: Page['request'],
  label: string,
): Promise<{ id: string; email: string; name: string }> {
  const email = unique(label);
  const name = `Email ${label}`;
  const response = await signUp(request, baseURL, { name, email, password });
  expect(response.status()).toBe(200);
  return { id: (await response.json()).user.id, email, name };
}

test.describe('with email enabled (Node test outbox)', () => {
  test.beforeEach(async ({ request }) => {
    test.skip(
      (await emailMode(request, baseURL)) !== 'enabled',
      'The server under test has email turned off.',
    );
    test.skip(
      !outboxDirectory,
      'Run Playwright with the server’s LESSDUMB_TEST_OUTBOX to read its email.',
    );
  });

  test('a forgotten password is reset through the emailed link', async ({
    page,
    request,
  }) => {
    // Registered outside the browser, so the page starts signed out.
    const learner = await register(request, 'reset');
    await page.goto('/');
    let dialog = await openAccountDialog(page, 'Sign in or create account');
    await dialog
      .getByRole('button', { name: 'Already have an account? Sign in' })
      .click();
    await dialog.getByRole('button', { name: 'Forgot password?' }).click();
    await expect(
      dialog.getByRole('heading', { name: 'Reset your password.' }),
    ).toBeVisible();
    await dialog.getByLabel('Email').fill(learner.email);
    await dialog.getByRole('button', { name: 'Send reset link' }).click();
    await expect(dialog.getByRole('status')).toContainText(
      'a link to reset your password is on its way',
    );

    const link = await waitForLink(
      learner.email,
      'Reset your lessdumb password',
    );
    expect(new URL(link).origin).toBe(new URL(baseURL).origin);
    await page.goto(link);
    await expect(page).toHaveURL(/\/reset-password\?token=/);
    await page.getByLabel('New password', { exact: true }).fill('reset-pass-1');
    await page.getByLabel('Confirm new password').fill('reset-pass-2');
    await page.getByRole('button', { name: 'Set new password' }).click();
    await expect(
      page.getByText('The two passwords don’t match.'),
    ).toBeVisible();
    await page.getByLabel('Confirm new password').fill('reset-pass-1');
    await page.getByRole('button', { name: 'Set new password' }).click();

    await expect(
      page.getByText(
        'Your password is changed. Sign in with your new password.',
      ),
    ).toBeVisible();
    expect(new URL(page.url()).search).toBe('');
    await page.getByRole('button', { name: 'Sign in', exact: true }).click();
    dialog = page.getByRole('dialog', { name: 'Welcome back.' });
    await dialog.getByLabel('Email').fill(learner.email);
    await dialog.getByLabel('Password').fill('reset-pass-1');
    await dialog.getByRole('button', { name: 'Sign in' }).click();
    await expect(page.locator('.account-name')).toHaveText(learner.name);

    const old = await request.post(`${baseURL}/api/auth/sign-in/email`, {
      headers: { origin: baseURL },
      data: { email: learner.email, password },
    });
    expect(old.status()).toBe(401);
    // The emailed link works once.
    await page.goto(link);
    await expect(
      page.getByText('This reset link is invalid or has expired.'),
    ).toBeVisible();
  });

  test('the verification link marks the email verified', async ({ page }) => {
    const learner = await register(page.request, 'verify');
    await waitForLink(learner.email, 'Verify your email for lessdumb');
    await page.goto('/');
    let dialog = await openAccountDialog(page, 'Account');
    await expect(dialog.getByText('Verify your email')).toBeVisible();
    await dialog.getByRole('button', { name: 'Resend link' }).click();
    await expect(
      dialog.getByText(`We sent a new verification link to ${learner.email}.`),
    ).toBeVisible();
    const link = await waitForLink(
      learner.email,
      'Verify your email for lessdumb',
      2,
    );
    await dialog.getByRole('button', { name: 'Close account dialog' }).click();

    await page.goto(link);
    await expect(page.getByText('Your email is verified.')).toBeVisible();
    expect(new URL(page.url()).search).toBe('');
    const session = await page.request.get(`${baseURL}/api/auth/get-session`);
    expect((await session.json()).user).toMatchObject({
      id: learner.id,
      emailVerified: true,
    });
    dialog = await openAccountDialog(page, 'Account');
    await expect(dialog.getByText('Your progress is connected')).toBeVisible();
    await expect(dialog.getByText('Verify your email')).toHaveCount(0);
  });
});

test.describe('with email off', () => {
  test.beforeEach(async ({ request }) => {
    test.skip(
      (await emailMode(request, baseURL)) !== 'disabled',
      'The server under test has email turned on.',
    );
  });

  test('nothing that needs email is offered, and its endpoints refuse', async ({
    page,
  }) => {
    await page.goto('/');
    const dialog = await openAccountDialog(page, 'Sign in or create account');
    await dialog
      .getByRole('button', { name: 'Already have an account? Sign in' })
      .click();
    await expect(
      dialog.getByRole('heading', { name: 'Welcome back.' }),
    ).toBeVisible();
    await expect(
      dialog.getByRole('button', { name: 'Forgot password?' }),
    ).toHaveCount(0);
    await dialog.getByRole('button', { name: 'Close account dialog' }).click();

    const learner = await register(page.request, 'off');
    for (const path of ['request-password-reset', 'send-verification-email']) {
      const response = await page.request.post(`${baseURL}/api/auth/${path}`, {
        headers: { origin: baseURL },
        data: { email: learner.email },
      });
      expect(response.status(), path).toBe(400);
      expect(await response.json(), path).toMatchObject({
        code: 'EMAIL_NOT_ENABLED',
      });
    }
    await page.reload();
    const account = await openAccountDialog(page, 'Account');
    await expect(account.getByText('Your progress is connected')).toBeVisible();
    await expect(account.getByText('Verify your email')).toHaveCount(0);
    await expect(
      account.getByRole('button', { name: 'Resend link' }),
    ).toHaveCount(0);
    await page.goto('/reset-password?token=anything');
    await expect(
      page.getByText('Email isn’t enabled on this server'),
    ).toBeVisible();
    await expect(page.getByLabel('New password')).toHaveCount(0);
  });
});

test('deleting the account removes the user and signs out', async ({
  page,
  request,
}) => {
  const learner = await register(page.request, 'delete');
  const state = createState();
  state.dailyGoal = 100;
  const saved = await page.request.put(`${baseURL}/api/state`, {
    headers: { origin: baseURL, 'X-Lessdumb-User': learner.id },
    data: { state, revision: 0 },
  });
  expect(saved.status()).toBe(200);
  await page.goto('/settings');
  await expect(page.locator('.account-name')).toHaveText(learner.name);
  await expect
    .poll(() =>
      page.evaluate(
        (key) => localStorage.getItem(key) !== null,
        `lessdumb.account.${learner.id}`,
      ),
    )
    .toBe(true);

  const dialog = await openAccountDialog(page, 'Account');
  await dialog.getByRole('button', { name: 'Delete account' }).click();
  const form = dialog.getByRole('form', { name: 'Delete account' });
  await form.getByLabel('Password').fill('not-my-password');
  await form
    .getByRole('button', { name: 'Delete account permanently' })
    .click();
  await expect(dialog.getByRole('alert')).toBeVisible();
  await expect(page.locator('.account-name')).toHaveText(learner.name);

  await form.getByLabel('Password').fill(password);
  await form
    .getByRole('button', { name: 'Delete account permanently' })
    .click();
  await expect(
    page.getByText('Your account and its saved progress were deleted.'),
  ).toBeVisible();
  await expect(page.locator('.account-name')).toHaveText('Your learning space');
  expect(
    await page.evaluate(
      (key) => localStorage.getItem(key),
      `lessdumb.account.${learner.id}`,
    ),
  ).toBeNull();
  expect((await page.request.get(`${baseURL}/api/state`)).status()).toBe(401);
  const signIn = await request.post(`${baseURL}/api/auth/sign-in/email`, {
    headers: { origin: baseURL },
    data: { email: learner.email, password },
  });
  expect(signIn.status()).toBe(401);
});
