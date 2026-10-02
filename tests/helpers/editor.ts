import { expect, type Page } from '@playwright/test';

/** Replace code through the editor's keyboard selection and input handling. */
export async function replaceCode(page: Page, source: string) {
  const editor = page.locator('.cm-content');
  await expect(editor).toBeEditable();
  await editor.click();
  await expect(editor).toBeFocused();
  await editor.press('ControlOrMeta+A');
  await editor.press('Backspace');
  // Wait for CodeMirror's managed deletion before inserting the new document.
  await expect
    .poll(() => editor.locator('.cm-line').allTextContents())
    .toEqual(['']);
  await page.keyboard.insertText(source);
  // The exercises in these tests fit the editor's rendered range.
  await expect
    .poll(() => editor.locator('.cm-line').allTextContents())
    .toEqual(source.split('\n'));
}
