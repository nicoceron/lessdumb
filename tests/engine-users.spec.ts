import { expect, test, type Page } from '@playwright/test';
import { skillById, type ChoiceQuestion } from '../src/lib/curriculum';
import {
  DAY_MS,
  getStats,
  nextTask,
  selectQuestion,
} from '../src/lib/learning';
import { createState, type LearnerState } from '../src/lib/state';
import { earnedXp, lessonXp, REVIEW_XP } from '../src/lib/xp';
import { signUp } from './helpers/accounts';
import { answerChoice, feedback, shownQuestion } from './helpers/lesson';

const baseURL = process.env.LESSDUMB_E2E_URL ?? 'http://127.0.0.1:4321';
const password = 'testing-engine-users-123';
test.use({ baseURL });

async function register(page: Page, label: string) {
  const email = `engine-${label}-${Date.now()}-${Math.random().toString(16).slice(2)}@example.test`;
  const response = await signUp(page.request, baseURL, {
    name: `Engine ${label}`,
    email,
    password,
  });
  expect(response.status()).toBe(200);
  return { id: (await response.json()).user.id as string, email };
}

async function cloud(page: Page): Promise<LearnerState | null> {
  const response = await page.request.get(`${baseURL}/api/state`);
  expect(response.status()).toBe(200);
  return (await response.json()).state;
}

async function seedPreferences(
  page: Page,
  owner: string,
  courseId: string,
  goal: number,
) {
  const state = createState();
  state.activeCourseId = courseId;
  state.dailyGoal = goal;
  state.anki.deck = `Learner goal ${goal}`;
  const response = await page.request.put(`${baseURL}/api/state`, {
    headers: { origin: baseURL, 'X-Lessdumb-User': owner },
    data: { state, revision: 0 },
  });
  expect(response.status()).toBe(200);
}

async function answer(page: Page, question: ChoiceQuestion, correct = true) {
  await answerChoice(page, question, correct);
}

async function signOut(page: Page) {
  await page.getByRole('button', { name: 'Account menu', exact: true }).click();
  await page.getByRole('menuitem', { name: 'Sign out', exact: true }).click();
  await expect(page.locator('.account-name')).toHaveText('Your learning space');
}

test('two authenticated learners keep separate mastery, due reviews, mistakes, cards, and goals', async ({
  page,
  browser,
}) => {
  test.setTimeout(60_000);
  const otherContext = await browser.newContext({ baseURL });
  const otherPage = await otherContext.newPage();
  try {
    const first = await register(page, 'mastered');
    const second = await register(otherPage, 'mistake');
    await seedPreferences(page, first.id, 'data-systems-foundations', 100);
    await seedPreferences(otherPage, second.id, 'python-foundations', 25);
    const masteredSkill = skillById['ds-workloads'];
    const mistakeSkill = skillById['print-output'];

    await page.goto(`/learn?skill=${masteredSkill.id}`);
    await page.getByRole('button', { name: 'Let’s try it' }).click();
    for (const [index, question] of masteredSkill.questions.entries()) {
      if (question.type !== 'choice')
        throw new Error('Expected scenario question.');
      await answer(page, question);
      if (index < masteredSkill.questions.length - 1)
        await page
          .getByRole('button', { name: 'Continue', exact: true })
          .click();
    }
    await expect(feedback(page)).toContainText('Lesson complete');
    const lessonReward = earnedXp(lessonXp(masteredSkill), 0, true);
    await expect
      .poll(async () => (await cloud(page))?.progress.totalXp)
      .toBe(lessonReward);

    await otherPage.goto(`/learn?skill=${mistakeSkill.id}`);
    await otherPage.getByRole('button', { name: 'Start lesson' }).click();
    const firstQuestion = await shownQuestion(
      otherPage,
      mistakeSkill.knowledgePoints![0].questions,
    );
    if (firstQuestion.type !== 'choice')
      throw new Error('Expected choice question.');
    await answer(otherPage, firstQuestion, false);
    await expect
      .poll(async () => (await cloud(otherPage))?.cards.length)
      .toBe(1);

    const firstStored = (await cloud(page))!;
    const secondStored = (await cloud(otherPage))!;
    expect(firstStored.dailyGoal).toBe(100);
    expect(firstStored.activeCourseId).toBe('data-systems-foundations');
    expect(firstStored.anki.deck).toBe('Learner goal 100');
    expect(secondStored.dailyGoal).toBe(25);
    expect(secondStored.activeCourseId).toBe('python-foundations');
    expect(secondStored.anki.deck).toBe('Learner goal 25');
    expect(getStats(firstStored.progress).mastered).toBe(1);
    expect(getStats(secondStored.progress).mastered).toBe(0);
    expect(firstStored.cards).toHaveLength(2);
    expect(
      firstStored.cards.every((card) => card.skillId === masteredSkill.id),
    ).toBe(true);
    expect(secondStored.cards[0]).toMatchObject({
      skillId: mistakeSkill.id,
      kind: 'mistake',
    });
    expect(secondStored.progress.totalXp).toBe(0);
    expect(secondStored.progress.skills[masteredSkill.id]).toBeUndefined();
    expect(firstStored.progress.skills[mistakeSkill.id]).toBeUndefined();

    await page.goto('/cards');
    await expect(
      page.getByRole('button', { name: /BREAKTHROUGH/ }),
    ).toHaveCount(2);
    await otherPage.goto('/cards');
    await expect(
      otherPage.getByRole('button', { name: /USEFUL MISTAKE/ }),
    ).toHaveCount(1);
    await page.reload();
    await otherPage.reload();
    await expect(
      page.getByRole('button', { name: /BREAKTHROUGH/ }),
    ).toHaveCount(2);
    await expect(
      otherPage.getByRole('button', { name: /BREAKTHROUGH/ }),
    ).toHaveCount(0);

    const reviewTime = Date.now() + 2 * DAY_MS;
    expect(
      nextTask(firstStored.progress, reviewTime, firstStored.activeCourseId),
    ).toMatchObject({
      skillId: masteredSkill.id,
      mode: 'review',
    });
    expect(
      nextTask(secondStored.progress, reviewTime, secondStored.activeCourseId)
        ?.mode,
    ).toBe('learn');
    await page.clock.setFixedTime(reviewTime);
    await page.goto('/learn?mode=review');
    await expect(
      page
        .locator('.lesson-session-stats')
        .getByText('Review', { exact: true }),
    ).toBeVisible();
    let current = (await cloud(page))!;
    for (let index = 0; index < 2; index++) {
      const question = selectQuestion(
        current.progress,
        masteredSkill,
        'review',
      );
      if (question.type !== 'choice')
        throw new Error('Expected conceptual review question.');
      await answer(page, question);
      await expect
        .poll(async () => (await cloud(page))?.progress.attempts.length)
        .toBe(5 + index);
      current = (await cloud(page))!;
      if (index === 0)
        await page
          .getByRole('button', { name: 'Continue', exact: true })
          .click();
    }
    expect(current.progress.skills[masteredSkill.id].reviewCount).toBe(1);
    expect(current.progress.totalXp).toBe(
      lessonReward + earnedXp(REVIEW_XP, 0, true),
    );
    expect(await cloud(otherPage)).toEqual(secondStored);
    expect(
      await otherPage.evaluate(
        (id) => localStorage.getItem(`lessdumb.account.${id}`),
        first.id,
      ),
    ).toBeNull();
  } finally {
    await otherContext.close();
  }
});

test('guest learning migrates durably into one account and stays out of the next account', async ({
  page,
}) => {
  const skill = skillById['ds-workloads'];
  await page.goto(`/learn?skill=${skill.id}`);
  await page.getByRole('button', { name: 'Let’s try it' }).click();
  const question = skill.questions[0];
  if (question.type !== 'choice')
    throw new Error('Expected scenario question.');
  await answer(page, question);
  await expect(feedback(page)).toContainText('Correct');
  const first = await register(page, 'guest-owner');
  await page.reload();
  // One answer is not a finished lesson, so it carries evidence but no XP.
  await expect
    .poll(async () => (await cloud(page))?.progress.attempts.length)
    .toBe(1);
  expect((await cloud(page))?.progress.skills[skill.id].questionIds).toEqual([
    question.id,
  ]);
  await expect
    .poll(() => page.evaluate(() => localStorage.getItem('lessdumb.guest')))
    .toBeNull();
  await signOut(page);
  const second = await register(page, 'fresh-owner');
  await page.reload();
  await expect
    .poll(async () => (await cloud(page))?.progress.attempts.length)
    .toBe(0);
  const secondStored = (await cloud(page))!;
  expect(secondStored.progress.skills).toEqual({});
  expect(secondStored.cards).toEqual([]);
  expect(secondStored.progress.attempts).toEqual([]);
  expect(secondStored.progress.dailyXp).toEqual({});

  const signIn = await page.request.post(`${baseURL}/api/auth/sign-in/email`, {
    headers: { origin: baseURL },
    data: { email: first.email, password },
  });
  expect(signIn.status()).toBe(200);
  await page.reload();
  await expect
    .poll(async () => (await cloud(page))?.progress.attempts.length)
    .toBe(1);
  expect((await cloud(page))?.progress.skills[skill.id].questionIds).toEqual([
    question.id,
  ]);
  const cachedSecond = await page.evaluate(
    (id) =>
      JSON.parse(localStorage.getItem(`lessdumb.account.${id}`) ?? 'null'),
    second.id,
  );
  expect(cachedSecond.progress.totalXp).toBe(0);
  expect(cachedSecond.cards).toEqual([]);
});
