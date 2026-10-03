import { expect, type Page } from '@playwright/test';

/** Secondary pages and account actions live in the header's account menu. */
export async function openFromMenu(page: Page, name: string | RegExp) {
  await page.getByRole('button', { name: 'Account menu', exact: true }).click();
  await page
    .getByRole('menuitem', {
      name,
      ...(typeof name === 'string' ? { exact: true } : {}),
    })
    .click();
}

const escape = (text: string) => text.replace(/[.*+?^$()|[\]\\{}]/g, '\\$&');

/** Courses are chosen on the Courses page; Learn shows the active one. */
export async function chooseCourse(page: Page, title: string) {
  await page
    .getByRole('region', { name: 'All courses' })
    .getByRole('button', {
      name: new RegExp(`^${escape(title)}\\s*(?:Active)?\\s*\\d+%$`),
    })
    .click();
  await expect(
    page.getByRole('heading', { level: 2, name: title, exact: true }),
  ).toBeVisible();
  await page
    .getByRole('button', { name: 'Set as active course', exact: true })
    .click();
  await expect(page.getByText('Active course', { exact: true })).toBeVisible();
}

export async function expectActiveCourse(page: Page, title: string) {
  await expect(
    page.getByRole('region', { name: title, exact: true }),
  ).toBeVisible();
}
