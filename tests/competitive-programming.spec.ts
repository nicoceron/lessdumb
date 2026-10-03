import { expect, test, type Page } from '@playwright/test';
import { skillById, type Question } from '../src/lib/curriculum';
import { coursePath } from '../src/lib/learning';
import { createState, type LearnerState } from '../src/lib/state';
import { signUp } from './helpers/accounts';
import { answerShown, continueLesson, feedback } from './helpers/lesson';
import { masterSkill } from './helpers/mastery';
import { chooseCourse, expectActiveCourse } from './helpers/navigation';

const origin = process.env.LESSDUMB_E2E_URL ?? 'http://127.0.0.1:4321';
const courseId = 'competitive-programming';

async function account(page: Page, target?: string) {
  const registered = await signUp(page.request, origin, {
    name: 'Contest learner',
    email: `contest-${Date.now()}-${Math.random().toString(16).slice(2)}@example.test`,
    password: 'contest-integration-test-123',
  });
  expect(registered.status()).toBe(200);
  const owner = (await registered.json()).user.id;
  if (target) {
    const state = createState();
    state.activeCourseId = courseId;
    const done = new Set<string>();
    function master(id: string) {
      if (done.has(id)) return;
      const skill = skillById[id];
      skill.prerequisites.forEach(master);
      state.progress = masterSkill(state.progress, id);
      done.add(id);
    }
    skillById[target].prerequisites.forEach(master);
    const saved = await page.request.put(`${origin}/api/state`, {
      headers: { origin, 'X-Lessdumb-User': owner },
      data: { state, revision: 0 },
    });
    expect(saved.status()).toBe(200);
  }
}

async function cloud(page: Page): Promise<LearnerState | null> {
  const response = await page.request.get(`${origin}/api/state`);
  expect(response.status()).toBe(200);
  return (await response.json()).state;
}

test('a saved contest goal exposes its complete graph and navigates both reference and math paths', async ({
  page,
}) => {
  await account(page);
  await page.goto('/courses');
  await chooseCourse(page, 'Competitive Programming');
  await expect(
    page.getByRole('link', { name: 'USACO Guide', exact: true }),
  ).toHaveAttribute('href', 'https://usaco.guide/');
  await expect(
    page.getByRole('link', { name: 'NeetCode roadmap', exact: true }),
  ).toHaveAttribute('href', 'https://neetcode.io/roadmap');
  await expect
    .poll(async () => (await cloud(page))?.activeCourseId)
    .toBe(courseId);
  await page.goto('/');
  await page.reload();
  await expectActiveCourse(page, 'Competitive Programming');
  await page.goto(`/graph?course=${courseId}`);
  await expect(page.getByLabel('Graph course')).toHaveValue(courseId);
  await expect(page.locator('.graph-node')).toHaveCount(
    coursePath(courseId).length,
  );
  await page.goto('/graph?skill=cp-fenwick');
  await expect(page.locator('.graph-detail h2')).toHaveText(
    skillById['cp-fenwick'].title,
  );
  await page
    .locator('.graph-detail')
    .getByRole('button')
    .filter({ hasText: skillById['cp-prefix-query'].title })
    .click();
  await expect(page.locator('.graph-detail h2')).toHaveText(
    skillById['cp-prefix-query'].title,
  );
  await page.goto('/graph?skill=cp-geometry-displacement');
  await page
    .locator('.graph-detail')
    .getByRole('button')
    .filter({ hasText: skillById['math-vectors'].title })
    .click();
  await expect(page.locator('.graph-detail h2')).toHaveText(
    skillById['math-vectors'].title,
  );
  await expect(page.locator('.graph-course-name')).toHaveText(
    'Quantitative foundations',
  );
  await expect(
    page.getByRole('link', { name: 'Practice this skill' }),
  ).toHaveCount(0);
  await expect
    .poll(async () => (await cloud(page))?.activeCourseId)
    .toBe(courseId);
});

for (const id of ['cp-prefix-sums', 'cp-fenwick']) {
  test(`grades real ${id} code, earns contest cards, and preserves account progress`, async ({
    page,
  }) => {
    await account(page, id);
    const skill = skillById[id];
    await page.goto(`/learn?skill=${id}`);
    // A skill with knowledge points is taught point by point (two answers
    // each) before its code exercise; other skills still use their questions.
    const steps: Question[][] = skill.knowledgePoints
      ? [
          ...skill.knowledgePoints.flatMap((point) => [
            point.questions,
            point.questions,
          ]),
          skill.questions.filter((question) => question.type === 'code'),
        ]
      : skill.questions.map((question) => [question]);
    await page
      .getByRole('button', {
        name: skill.knowledgePoints ? 'Start lesson' : 'Let’s try it',
      })
      .click();
    for (const [index, candidates] of steps.entries()) {
      const last = index === steps.length - 1;
      if (candidates[0].type === 'code' && id === 'cp-prefix-sums') {
        await answerShown(page, candidates, false);
        await expect(feedback(page)).toContainText('Incorrect', {
          timeout: 60000,
        });
        await continueLesson(page);
      }
      await answerShown(page, candidates);
      await expect(feedback(page)).toContainText(
        last ? 'Lesson complete' : 'Correct',
      );
      if (!last) await continueLesson(page);
    }
    await expect
      .poll(
        async () =>
          (await cloud(page))?.cards.filter(
            (card) => card.skillId === id && card.kind === 'mastery',
          ).length,
      )
      .toBe(2);
    if (id === 'cp-prefix-sums')
      expect(
        (await cloud(page))?.cards.some(
          (card) => card.id === `mistake:${id}:${id}-q4`,
        ),
      ).toBe(true);
    await page.goto('/cards');
    await page.reload();
    await expect(
      page
        .getByRole('button', { name: /BREAKTHROUGH/ })
        .filter({ hasText: skill.title }),
    ).toHaveCount(2);
    await page.goto(`/graph?skill=${id}`);
    await expect(
      page.locator('.graph-detail').getByText('Mastered', { exact: true }),
    ).toBeVisible();
    expect((await cloud(page))?.activeCourseId).toBe(courseId);
  });
}
