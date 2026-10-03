import { readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { expect, type APIRequestContext, type Page } from '@playwright/test';
import type { OutgoingMail } from '../../src/lib/server/mail';

/**
 * The Node server writes email here when it runs with LESSDUMB_TEST_OUTBOX on a
 * loopback origin. Start Playwright with the same variable to read it.
 */
export const outboxDirectory = process.env.LESSDUMB_TEST_OUTBOX
  ? resolve(process.env.LESSDUMB_TEST_OUTBOX)
  : undefined;

/** Whether the server under test has email turned on (rendered by the app). */
export async function emailMode(
  request: APIRequestContext,
  baseURL: string,
): Promise<'enabled' | 'disabled'> {
  const html = await (await request.get(`${baseURL}/settings`)).text();
  return html.includes('data-email="enabled"') ? 'enabled' : 'disabled';
}

export function mailTo(to: string, subject: string): OutgoingMail[] {
  if (!outboxDirectory) return [];
  let files: string[];
  try {
    files = readdirSync(outboxDirectory).filter((file) =>
      file.endsWith('.json'),
    );
  } catch {
    return [];
  }
  return files
    .sort()
    .map(
      (file) =>
        JSON.parse(
          readFileSync(join(outboxDirectory!, file), 'utf8'),
        ) as OutgoingMail,
    )
    .filter((message) => message.to === to && message.subject === subject);
}

/** Waits for the `count`-th message and returns the link in its text. */
export async function waitForLink(
  to: string,
  subject: string,
  count = 1,
): Promise<string> {
  await expect
    .poll(() => mailTo(to, subject).length, { timeout: 10_000 })
    .toBeGreaterThanOrEqual(count);
  const message = mailTo(to, subject)[count - 1];
  const link = /https?:\/\/\S+/.exec(message.text)?.[0];
  expect(link, message.text).toBeTruthy();
  return link!;
}

export async function openAccountDialog(page: Page, item: string) {
  const opener = page.getByRole('button', {
    name: 'Account menu',
    exact: true,
  });
  await expect(opener).toBeEnabled();
  await opener.click();
  await page.getByRole('menuitem', { name: item, exact: true }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  return dialog;
}
