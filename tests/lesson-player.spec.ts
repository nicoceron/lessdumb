import { expect, test, type Page } from '@playwright/test';
import { skillById, type ChoiceQuestion } from '../src/lib/curriculum';
import { getSkillState, nextTask, selectQuestion } from '../src/lib/learning';
import {
  createState,
  recordLearningAnswer,
  type LearnerState,
} from '../src/lib/state';
import { signUp } from './helpers/accounts';
import { replaceCode } from './helpers/editor';

const baseURL = process.env.LESSDUMB_E2E_URL ?? 'http://127.0.0.1:4321';
test.use({ baseURL });

async function register(
  page: Page,
  courseId = 'python-foundations',
  state = createState(),
) {
  const response = await signUp(page.request, baseURL, {
    name: 'Lesson player QA',
    email: `lesson-player-${Date.now()}-${Math.random().toString(16).slice(2)}@example.test`,
    password: 'lesson-player-integration-123',
  });
  expect(response.status()).toBe(200);
  const owner = (await response.json()).user.id as string;
  state.activeCourseId = courseId;
  const saved = await page.request.put(`${baseURL}/api/state`, {
    headers: { origin: baseURL, 'X-Lessdumb-User': owner },
    data: { state, revision: 0 },
  });
  expect(saved.status()).toBe(200);
  return state;
}

async function cloud(page: Page): Promise<LearnerState> {
  const response = await page.request.get(`${baseURL}/api/state`);
  expect(response.status()).toBe(200);
  const saved = (await response.json()).state as LearnerState | null;
  expect(saved).not.toBeNull();
  return saved!;
}

function outline(page: Page) {
  return page.getByRole('navigation', { name: 'Lesson outline', exact: true });
}

function slide(page: Page) {
  return page.getByRole('region', {
    name: 'Instructional slide',
    exact: true,
  });
}

async function returnToPractice(page: Page) {
  await page
    .getByRole('button', { name: /^(Return to practice|Let’s try it)$/ })
    .first()
    .click();
}

function correctOption(page: Page, question: ChoiceQuestion) {
  return page.getByRole('button', {
    name: `${String.fromCharCode(65 + question.answer)} ${question.choices[question.answer]}`,
    exact: true,
  });
}

test('instructional slides and the outline teach without awarding answer evidence or cards', async ({
  page,
}) => {
  const skill = skillById['print-output'];
  const baseline = await register(page);
  await page.goto(`/learn?skill=${skill.id}&mode=learn`);
  await expect(slide(page).getByRole('heading', { level: 1 })).toHaveText(
    skill.title,
  );
  await expect(
    slide(page).getByText(skill.lesson.paragraphs[0], { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Let’s try it' }),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Previous slide', exact: true }),
  ).toBeDisabled();

  await page.getByRole('button', { name: 'Next slide', exact: true }).click();
  await expect(
    slide(page).getByText(skill.lesson.paragraphs[1], { exact: true }),
  ).toBeVisible();
  await page
    .getByRole('button', { name: 'Previous slide', exact: true })
    .click();
  await expect(slide(page).getByRole('heading', { level: 1 })).toHaveText(
    skill.title,
  );

  await outline(page)
    .getByRole('button', { name: 'Worked example', exact: true })
    .click();
  await expect(slide(page).getByRole('heading', { level: 1 })).not.toHaveText(
    skill.title,
  );
  const firstWorkedHeading = await slide(page)
    .getByRole('heading', { level: 1 })
    .textContent();
  await page.getByRole('button', { name: 'Next slide', exact: true }).click();
  await expect(slide(page).getByRole('heading', { level: 1 })).not.toHaveText(
    firstWorkedHeading!,
  );
  await page
    .getByRole('button', { name: 'Previous slide', exact: true })
    .click();
  await expect(slide(page).getByRole('heading', { level: 1 })).toHaveText(
    firstWorkedHeading!,
  );
  await outline(page)
    .getByRole('button', { name: 'Introduction', exact: true })
    .click();
  await expect(slide(page).getByRole('heading', { level: 1 })).toHaveText(
    skill.title,
  );

  const afterReading = await cloud(page);
  expect(afterReading.progress).toEqual(baseline.progress);
  expect(afterReading.cards).toEqual([]);
  await page.reload();
  await expect(slide(page).getByRole('heading', { level: 1 })).toHaveText(
    skill.title,
  );
  const reloaded = await cloud(page);
  expect(reloaded.progress).toEqual(baseline.progress);
  expect(reloaded.cards).toEqual([]);
});

test('reopening instruction preserves the pending choice and code but marks answers as assisted', async ({
  page,
}) => {
  test.setTimeout(60_000);
  const skill = skillById['print-output'];
  await register(page);
  await page.goto(`/learn?skill=${skill.id}&mode=learn`);
  await page.getByRole('button', { name: 'Let’s try it', exact: true }).click();
  await expect
    .poll(async () => (await cloud(page)).progress.skills[skill.id]?.lessonSeen)
    .toBe(true);

  for (const [index, question] of skill.questions.entries()) {
    const prompt = page.locator('.question-paper h1');
    await expect(prompt).toHaveText(question.prompt);
    if (question.type === 'choice') {
      await correctOption(page, question).click();
      await expect(correctOption(page, question)).toHaveAttribute(
        'aria-pressed',
        'true',
      );
    } else {
      await replaceCode(page, question.solution);
    }

    await outline(page)
      .getByRole('button', { name: 'Worked example', exact: true })
      .click();
    await expect(slide(page)).toBeVisible();
    await returnToPractice(page);
    await expect(prompt).toHaveText(question.prompt);
    await expect(
      page.getByRole('button', { name: 'Give me a hint', exact: true }),
    ).toBeDisabled();
    if (question.type === 'choice') {
      await expect(correctOption(page, question)).toHaveAttribute(
        'aria-pressed',
        'true',
      );
      await page
        .getByRole('button', { name: 'Check answer', exact: true })
        .click();
    } else {
      await expect
        .poll(() => page.locator('.cm-content .cm-line').allTextContents())
        .toEqual(question.solution.split('\n'));
      await page
        .getByRole('button', { name: 'Run & check', exact: true })
        .click();
    }
    await expect(
      page.getByText('You’ve got the idea. Try it independently next.', {
        exact: true,
      }),
    ).toBeVisible({ timeout: 40_000 });
    await expect
      .poll(async () => (await cloud(page)).progress.attempts.length)
      .toBe(index + 1);
    const saved = await cloud(page);
    expect(saved.progress.attempts.at(-1)).toMatchObject({
      skillId: skill.id,
      questionId: question.id,
      correct: true,
      usedHint: true,
      xp: 0,
    });
    expect(saved.progress.totalXp).toBe(0);
    expect(saved.progress.skills[skill.id].questionIds).toEqual([]);
    expect(saved.progress.skills[skill.id].rewardedQuestionIds).toEqual([]);
    expect(saved.progress.skills[skill.id].mastery).toBe(0);
    expect(saved.cards).toEqual([]);
    if (index < skill.questions.length - 1)
      await page.getByRole('button', { name: 'Continue', exact: true }).click();
  }

  await page.reload();
  await expect(page.locator('.question-paper h1')).toHaveText(
    skill.questions[0].prompt,
  );
  await expect(
    page.getByRole('button', { name: 'Check answer', exact: true }),
  ).toBeVisible();
  await outline(page)
    .getByRole('button', { name: 'Worked example', exact: true })
    .click();
  await returnToPractice(page);
  await expect(page.locator('.question-paper h1')).toHaveText(
    skill.questions[0].prompt,
  );
  const reloaded = await cloud(page);
  expect(reloaded.progress.attempts).toHaveLength(skill.questions.length);
  expect(reloaded.progress.totalXp).toBe(0);
  expect(reloaded.progress.skills[skill.id].lessonSeen).toBe(true);
  expect(reloaded.progress.skills[skill.id].questionIds).toEqual([]);
  expect(reloaded.cards).toEqual([]);
});

test('mobile outline and slide controls work by keyboard and scenarios never pretend to be code', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const skill = skillById['ds-workloads'];
  const baseline = await register(page, skill.courseId);
  await page.goto(`/learn?skill=${skill.id}&mode=learn`);
  const introduction = outline(page).getByRole('button', {
    name: 'Introduction',
    exact: true,
  });
  await introduction.focus();
  await expect(introduction).toBeFocused();
  await introduction.press('Enter');
  await expect(slide(page).getByRole('heading', { level: 1 })).toHaveText(
    skill.title,
  );
  const next = page.getByRole('button', { name: 'Next slide', exact: true });
  await next.focus();
  await next.press('Enter');
  await expect(
    slide(page).getByText(skill.lesson.paragraphs[1], { exact: true }),
  ).toBeVisible();
  const previous = page.getByRole('button', {
    name: 'Previous slide',
    exact: true,
  });
  await previous.focus();
  await previous.press('Enter');
  await expect(slide(page).getByRole('heading', { level: 1 })).toHaveText(
    skill.title,
  );

  const worked = outline(page).getByRole('button', {
    name: 'Worked scenario',
    exact: true,
  });
  await worked.focus();
  await worked.press('Enter');
  await expect(
    page
      .locator('.lesson-player')
      .getByText('Worked scenario', { exact: true }),
  ).toBeVisible();
  await expect(
    slide(page).getByText(skill.lesson.example.code, { exact: true }),
  ).toBeVisible();
  // Scenario workthroughs have a finite authored sequence. Stop at its
  // result, rather than clicking an unbounded loop that could hide a bug.
  for (let index = 0; index < 6 && (await next.isVisible()); index++) {
    await next.focus();
    await next.press('Enter');
  }
  await expect(next).toHaveCount(0);
  await expect(
    slide(page).getByText('Decision', { exact: true }),
  ).toBeVisible();
  await expect(
    slide(page).getByText(skill.lesson.example.output, { exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await expect(page.locator('.cm-content')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Run & check' })).toHaveCount(
    0,
  );

  await page
    .getByRole('button', { name: 'Let’s try it', exact: true })
    .press('Enter');
  await expect(page.locator('.question-paper h1')).toHaveText(
    skill.questions[0].prompt,
  );
  await expect(page.locator('.cm-content')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Run & check' })).toHaveCount(
    0,
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  const after = await cloud(page);
  expect(after.progress.totalXp).toBe(baseline.progress.totalXp);
  expect(after.progress.attempts).toEqual([]);
  expect(after.progress.skills[skill.id]?.questionIds ?? []).toEqual([]);
  expect(after.cards).toEqual([]);
});

test('reference material during a due review cannot strengthen memory before independent completion', async ({
  page,
}) => {
  const skill = skillById['ds-workloads'];
  let state = createState();
  for (const question of skill.questions)
    state = recordLearningAnswer(state, {
      skillId: skill.id,
      questionId: question.id,
      correct: true,
      mode: 'learn',
    });
  const mastered = getSkillState(state.progress, skill.id);
  expect(mastered.mastery).toBe(1);
  expect(mastered.memory).toBeDefined();
  expect(state.cards).toHaveLength(2);
  const reviewTime = mastered.dueAt! + 1;
  await register(page, skill.courseId, state);
  await page.clock.setFixedTime(reviewTime);
  await page.goto(`/learn?skill=${skill.id}&mode=review`);

  const assistedQuestion = selectQuestion(state.progress, skill, 'review');
  if (assistedQuestion.type !== 'choice')
    throw new Error('The systems review must use a real scenario choice.');
  await expect(page.locator('.question-paper h1')).toHaveText(
    assistedQuestion.prompt,
  );
  await correctOption(page, assistedQuestion).click();
  await outline(page)
    .getByRole('button', { name: 'Worked scenario', exact: true })
    .click();
  await returnToPractice(page);
  await expect(correctOption(page, assistedQuestion)).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await page.getByRole('button', { name: 'Check answer', exact: true }).click();
  await expect(
    page.getByText('You’ve got the idea. Try it independently next.', {
      exact: true,
    }),
  ).toBeVisible();
  await expect
    .poll(async () => (await cloud(page)).progress.attempts.length)
    .toBe(skill.questions.length + 1);
  let saved = await cloud(page);
  expect(saved.progress.attempts.at(-1)).toMatchObject({
    mode: 'review',
    questionId: assistedQuestion.id,
    correct: true,
    usedHint: true,
    xp: 0,
  });
  expect(saved.progress.skills[skill.id].memory).toEqual(mastered.memory);
  expect(saved.progress.skills[skill.id].dueAt).toBe(mastered.dueAt);
  expect(saved.progress.skills[skill.id].reviewCount).toBe(
    mastered.reviewCount,
  );
  expect(saved.progress.skills[skill.id].reviewQuestionIds).toEqual([]);
  expect(saved.progress.skills[skill.id].reviewHadHint).toBe(true);
  expect(saved.progress.totalXp).toBe(state.progress.totalXp);
  expect(saved.cards).toEqual(state.cards);

  for (let index = 0; index < 2; index++) {
    await page.getByRole('button', { name: 'Continue', exact: true }).click();
    const question = selectQuestion(saved.progress, skill, 'review');
    if (question.type !== 'choice')
      throw new Error('The systems review must use a real scenario choice.');
    await expect(page.locator('.question-paper h1')).toHaveText(
      question.prompt,
    );
    await correctOption(page, question).click();
    await page
      .getByRole('button', { name: 'Check answer', exact: true })
      .click();
    await expect(
      page.getByText(
        index === 0
          ? 'Good retrieval. Keep this connection fresh.'
          : 'Review complete. That connection is stronger.',
        { exact: true },
      ),
    ).toBeVisible();
    await expect
      .poll(async () => (await cloud(page)).progress.attempts.length)
      .toBe(skill.questions.length + 2 + index);
    saved = await cloud(page);
    expect(saved.progress.attempts.at(-1)).toMatchObject({
      mode: 'review',
      questionId: question.id,
      correct: true,
      usedHint: false,
      xp: 5,
    });
    expect(saved.cards).toEqual(state.cards);
    if (index === 0) {
      expect(saved.progress.skills[skill.id].reviewQuestionIds).toEqual([
        question.id,
      ]);
      expect(saved.progress.skills[skill.id].memory).toEqual(mastered.memory);
      expect(saved.progress.skills[skill.id].dueAt).toBe(mastered.dueAt);
      expect(saved.progress.skills[skill.id].reviewCount).toBe(
        mastered.reviewCount,
      );
    }
  }

  const reviewed = saved.progress.skills[skill.id];
  expect(reviewed.reviewCount).toBe(mastered.reviewCount + 1);
  expect(reviewed.reviewQuestionIds).toEqual([]);
  expect(reviewed.reviewHadHint).toBe(false);
  expect(reviewed.memory?.reps).toBe(mastered.memory!.reps + 1);
  expect(reviewed.memory?.lastReviewAt).toBe(reviewTime);
  expect(reviewed.dueAt).toBeGreaterThan(reviewTime);
  expect(saved.progress.totalXp).toBe(state.progress.totalXp + 10);
  await page.reload();
  await expect(page.locator('.question-paper h1')).toBeVisible();
  const reloaded = await cloud(page);
  expect(reloaded.progress.skills[skill.id].memory).toEqual(reviewed.memory);
  expect(reloaded.progress.totalXp).toBe(saved.progress.totalXp);
  expect(reloaded.cards).toEqual(state.cards);
});

test('initial teaching for the next unseen skill does not turn its first answer into assisted practice', async ({
  page,
}) => {
  const skill = skillById['ds-workloads'];
  let state = createState();
  for (const question of skill.questions.slice(0, -1))
    state = recordLearningAnswer(state, {
      skillId: skill.id,
      questionId: question.id,
      correct: true,
      mode: 'learn',
    });
  expect(state.progress.totalXp).toBe(30);
  expect(state.cards).toEqual([]);
  await register(page, skill.courseId, state);
  await page.goto(
    `/learn?skill=${skill.id}&mode=learn&course=${skill.courseId}`,
  );
  const lastQuestion = skill.questions.at(-1)!;
  if (lastQuestion.type !== 'choice')
    throw new Error('The systems acquisition must use a real scenario choice.');
  await expect(page.locator('.question-paper h1')).toHaveText(
    lastQuestion.prompt,
  );
  await correctOption(page, lastQuestion).click();
  await page.getByRole('button', { name: 'Check answer', exact: true }).click();
  await expect(
    page.getByText('Skill mastered. A new connection made.', { exact: true }),
  ).toBeVisible();
  await expect.poll(async () => (await cloud(page)).progress.totalXp).toBe(40);
  const mastered = await cloud(page);
  expect(mastered.cards).toHaveLength(2);
  const task = nextTask(mastered.progress, new Date(), skill.courseId)!;
  expect(task.mode).toBe('learn');
  expect(task.skillId).not.toBe(skill.id);
  const nextSkill = skillById[task.skillId];
  expect(nextSkill.lesson.example.kind).toBe('text');
  expect(getSkillState(mastered.progress, nextSkill.id).lessonSeen).toBe(false);

  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(slide(page).getByRole('heading', { level: 1 })).toHaveText(
    nextSkill.title,
  );
  await expect(
    page.getByRole('button', { name: 'Return to practice' }),
  ).toHaveCount(0);
  await expect(
    page.getByRole('button', { name: 'Let’s try it', exact: true }),
  ).toBeVisible();
  await outline(page)
    .getByRole('button', { name: 'Worked scenario', exact: true })
    .click();
  await expect(slide(page)).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Return to practice' }),
  ).toHaveCount(0);
  const afterReading = await cloud(page);
  expect(afterReading.progress.totalXp).toBe(mastered.progress.totalXp);
  expect(afterReading.progress.attempts).toEqual(mastered.progress.attempts);
  expect(getSkillState(afterReading.progress, nextSkill.id).lessonSeen).toBe(
    false,
  );
  expect(afterReading.cards).toEqual(mastered.cards);

  await page.getByRole('button', { name: 'Let’s try it', exact: true }).click();
  const firstQuestion = selectQuestion(mastered.progress, nextSkill, 'learn');
  if (firstQuestion.type !== 'choice')
    throw new Error('The systems acquisition must use a real scenario choice.');
  await expect(page.locator('.question-paper h1')).toHaveText(
    firstQuestion.prompt,
  );
  await expect(
    page.getByRole('button', { name: 'Give me a hint', exact: true }),
  ).toBeEnabled();
  await expect
    .poll(
      async () => (await cloud(page)).progress.skills[nextSkill.id]?.lessonSeen,
    )
    .toBe(true);
  await correctOption(page, firstQuestion).click();
  await page.getByRole('button', { name: 'Check answer', exact: true }).click();
  await expect(
    page.getByText('That’s a small win.', { exact: true }),
  ).toBeVisible();
  await expect.poll(async () => (await cloud(page)).progress.totalXp).toBe(50);
  const independent = await cloud(page);
  expect(independent.progress.attempts.at(-1)).toMatchObject({
    skillId: nextSkill.id,
    questionId: firstQuestion.id,
    correct: true,
    usedHint: false,
    xp: 10,
  });
  expect(independent.progress.skills[nextSkill.id].lessonSeen).toBe(true);
  expect(independent.progress.skills[nextSkill.id].questionIds).toEqual([
    firstQuestion.id,
  ]);
  expect(independent.progress.skills[nextSkill.id].rewardedQuestionIds).toEqual(
    [firstQuestion.id],
  );
  expect(independent.cards).toEqual(mastered.cards);
});
