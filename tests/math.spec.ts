import { expect, test, type Page } from '@playwright/test';
import { skillById, type ChoiceQuestion } from '../src/lib/curriculum';
import { mathSpans } from '../src/lib/math-text';
import { createState } from '../src/lib/state';
import {
  answerShown,
  choiceButton,
  expectProse,
  feedback,
  prompt,
  shownQuestion,
} from './helpers/lesson';
import { masterSkill } from './helpers/mastery';

const baseURL = process.env.LESSDUMB_E2E_URL ?? 'http://127.0.0.1:4321';
test.use({ baseURL });

// The introduction has a display matrix product; the first point's
// explanation, worked example, prompt, choices, and answer explanation all
// have inline math.
const skill = skillById['math-matrix-vector'];
const point = skill.knowledgePoints![0];
const hasMath = (text: string) => mathSpans(text).length > 0;

async function noHorizontalScroll(page: Page) {
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
}

test('the fixture lesson has display and inline math in every section', () => {
  expect(skill.lesson.paragraphs.some((p) => p.includes('$$'))).toBe(true);
  expect(point.explanation.some(hasMath)).toBe(true);
  expect(hasMath(point.example.explanation)).toBe(true);
  for (const question of point.questions as ChoiceQuestion[])
    if (!question.checksOutput) {
      expect(hasMath(question.prompt), question.id).toBe(true);
      expect(hasMath(question.explanation), question.id).toBe(true);
    }
});

for (const viewport of [
  { name: 'desktop', width: 1280, height: 900 },
  { name: 'phone', width: 375, height: 812 },
])
  test(`a quantitative lesson typesets its math on ${viewport.name} without widening the page`, async ({
    page,
  }) => {
    const katexRequests: string[] = [];
    page.on('request', (request) => {
      if (/katex/i.test(request.url())) katexRequests.push(request.url());
    });
    await page.setViewportSize(viewport);
    // A guest who has mastered everything the lesson builds on.
    const state = createState();
    state.activeCourseId = skill.courseId;
    const mastered = new Set<string>();
    const master = (id: string) => {
      if (mastered.has(id)) return;
      mastered.add(id);
      skillById[id].prerequisites.forEach(master);
      state.progress = masterSkill(state.progress, id);
    };
    skill.prerequisites.forEach(master);
    await page.addInitScript(
      (value) => localStorage.setItem('lessdumb.guest', JSON.stringify(value)),
      state,
    );
    await page.goto(`/learn?skill=${skill.id}&mode=learn`);

    // Introduction: KaTeX output with MathML for screen readers and the
    // visual HTML hidden from them; display math in its own scroll box.
    const introduction = page.getByRole('region', {
      name: 'Introduction',
      exact: true,
    });
    await expect(introduction.locator('.katex').first()).toBeVisible();
    await expect(page.locator('.math-pending')).toHaveCount(0);
    await expect(
      introduction.locator('.katex-mathml math').first(),
    ).toBeAttached();
    await expect(introduction.locator('.katex-html').first()).toHaveAttribute(
      'aria-hidden',
      'true',
    );
    const display = introduction.locator('.math-display').first();
    await expect(display.locator('.katex-display')).toBeVisible();
    expect(
      await display.evaluate((element) => getComputedStyle(element).overflowX),
    ).toBe('auto');
    const box = await display.boundingBox();
    expect(box!.x + box!.width).toBeLessThanOrEqual(viewport.width);
    // On a phone the matrix product is wider than the column: it scrolls
    // inside its own box while the page keeps its width.
    if (viewport.width < 600)
      expect(
        await display.evaluate(
          (element) => element.scrollWidth > element.clientWidth,
        ),
      ).toBe(true);
    await expectProse(
      introduction.locator('p').first(),
      skill.lesson.paragraphs[0],
    );

    // The point's explanation and worked example.
    const teaching = page.getByRole('region', {
      name: point.title,
      exact: true,
    });
    await expect(
      teaching.locator('.lesson-explanation .katex').first(),
    ).toBeVisible();
    await expect(
      teaching.locator('.lesson-worked .lesson-teaching-text .katex').first(),
    ).toBeVisible();
    // Code and worked-example output stay literal text.
    await expect(teaching.locator('.lesson-worked pre .katex')).toHaveCount(0);

    // The question: prompt and choices typeset; the explanation after answering.
    const question = (await shownQuestion(
      page,
      point.questions,
    )) as ChoiceQuestion;
    if (hasMath(question.prompt))
      await expect(prompt(page).locator('.katex').first()).toBeVisible();
    if (!question.checksOutput && hasMath(question.choices[question.answer]))
      await expect(
        choiceButton(page, question.answer).locator('.katex').first(),
      ).toBeVisible();
    await answerShown(page, [question]);
    if (hasMath(question.explanation))
      await expect(feedback(page).locator('.katex').first()).toBeVisible();

    // KaTeX, its CSS, and its fonts come from this server, not a CDN.
    expect(katexRequests.length).toBeGreaterThan(0);
    for (const url of katexRequests) expect(url.startsWith(baseURL)).toBe(true);
    await noHorizontalScroll(page);
  });
