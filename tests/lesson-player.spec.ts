import { expect, test, type Page } from '@playwright/test';
import { skillById, type ChoiceQuestion } from '../src/lib/curriculum';
import { getSkillState, nextTask, selectQuestion } from '../src/lib/learning';
import {
  createState,
  recordLearningAnswer,
  type LearnerState,
} from '../src/lib/state';
import { earnedXp, lessonXp, REVIEW_XP } from '../src/lib/xp';
import { signUp } from './helpers/accounts';
import {
  answerChoice,
  answeredQuestions,
  answerShown,
  choiceButton,
  continueLesson,
  currentQuestion,
  feedback,
  openNextTask,
  prompt,
  shownQuestion,
} from './helpers/lesson';
import { lessonAnswerIds, masterSkillState } from './helpers/mastery';

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

const escapeRegExp = (text: string) =>
  text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function markers(page: Page, name = 'Lesson progress') {
  return page.getByRole('list', { name, exact: true });
}

/** A knowledge point's section: its heading, teaching, and questions. */
function pointSection(page: Page, title: string) {
  return page.getByRole('region', { name: title, exact: true });
}

async function noHorizontalScroll(page: Page) {
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
}

const print = skillById['print-output'];
const [firstPoint, secondPoint] = print.knowledgePoints!;
const printCode = print.questions.find((q) => q.type === 'code')!;

test('a lesson opens as one page: introduction, first point, worked example, and its first question, without awarding anything for reading', async ({
  page,
}) => {
  const baseline = await register(page);
  await page.goto(`/learn?skill=${print.id}&mode=learn`);
  const introduction = page.getByRole('region', {
    name: 'Introduction',
    exact: true,
  });
  for (const paragraph of print.lesson.paragraphs)
    await expect(
      introduction.getByText(paragraph, { exact: true }),
    ).toBeVisible();
  await expect(markers(page).getByRole('listitem')).toContainText([
    firstPoint.title,
    secondPoint.title,
    'Write the code',
  ]);
  await expect(markers(page).locator('[aria-current="step"]')).toContainText(
    firstPoint.title,
  );
  // No intro screen, no wizard: the first question is already on the page,
  // under the first point's explanation and worked example.
  await expect(
    page.getByRole('button', { name: 'Start lesson', exact: true }),
  ).toHaveCount(0);
  await expect(page.getByRole('button', { name: /slide/i })).toHaveCount(0);
  await expect(page.getByRole('button', { name: /hint/i })).toHaveCount(0);
  const teaching = pointSection(page, firstPoint.title);
  await expect(teaching.getByRole('heading', { level: 2 })).toHaveText(
    firstPoint.title,
  );
  await expect(
    teaching.getByText(firstPoint.explanation[0], { exact: true }),
  ).toBeVisible();
  await expect(
    teaching.getByRole('heading', { name: 'Worked example', exact: true }),
  ).toBeVisible();
  await expect(
    teaching.getByText(firstPoint.example.explanation, { exact: true }),
  ).toBeVisible();
  await expect(teaching.locator('.question-prompt')).toHaveText(
    firstPoint.questions[0].prompt,
  );
  await expect(prompt(page)).toHaveText(firstPoint.questions[0].prompt);
  await expect(
    page.getByRole('button', { name: 'Submit', exact: true }),
  ).toBeDisabled();
  // Later points are added as the learner reaches them.
  await expect(pointSection(page, secondPoint.title)).toHaveCount(0);

  // Reading records nothing: no attempt, XP, card, or "seen" flag.
  const afterReading = await cloud(page);
  expect(afterReading.progress).toEqual(baseline.progress);
  expect(afterReading.cards).toEqual([]);
  await page.reload();
  await expect(introduction).toBeVisible();
  await expect(prompt(page)).toHaveText(firstPoint.questions[0].prompt);
  expect((await cloud(page)).progress.attempts).toEqual([]);
});

test('answered questions and teaching stay on the page; a passed point appends the next; three misses fail the lesson below everything', async ({
  page,
}) => {
  test.setTimeout(90_000);
  await register(page);
  await page.goto(`/learn?skill=${print.id}&mode=learn`);
  const first = pointSection(page, firstPoint.title);
  const seen: string[] = [];
  for (let index = 0; index < 2; index++) {
    const question = await answerShown(page, firstPoint.questions);
    seen.push(question.id);
    await expect(feedback(page)).toContainText('Correct');
    // The explanation and worked example stay visible after answering.
    await expect(
      first.getByText(firstPoint.explanation[0], { exact: true }),
    ).toBeVisible();
    await expect(
      first.getByText(firstPoint.example.explanation, { exact: true }),
    ).toBeVisible();
    await continueLesson(page);
    // Every earlier answer stays, frozen with its result and explanation.
    await expect(answeredQuestions(page)).toHaveCount(index + 1);
    const answered = answeredQuestions(page).nth(index);
    await expect(answered).toContainText(question.explanation);
    await expect(answered.getByText('Your answer')).toBeVisible();
    await expect(answered.getByRole('button', { name: 'Submit' })).toHaveCount(
      0,
    );
  }
  expect(new Set(seen).size).toBe(2);
  await expect(first.getByText('Passed', { exact: true })).toBeVisible();
  await expect(first.locator('.question-paper')).toHaveCount(2);
  // The next point's section is appended below the passed one, and its
  // first question is the one being answered now.
  const second = pointSection(page, secondPoint.title);
  await expect(second).toBeVisible();
  await expect(second.getByRole('heading', { level: 2 })).toBeFocused();
  await expect(
    second.getByText(secondPoint.explanation[0], { exact: true }),
  ).toBeVisible();
  await expect(second.locator('[data-state="current"]')).toHaveCount(1);
  const firstBox = await first.boundingBox();
  const secondBox = await second.boundingBox();
  expect(secondBox!.y).toBeGreaterThan(firstBox!.y + firstBox!.height - 1);
  await expect(markers(page).getByRole('listitem').first()).toContainText(
    'complete',
  );
  await expect(markers(page).locator('[aria-current="step"]')).toContainText(
    secondPoint.title,
  );
  await expect
    .poll(async () => (await cloud(page)).progress.attempts.length)
    .toBe(2);
  let saved = await cloud(page);
  // Passed points are provisional until the whole lesson passes.
  expect(saved.progress.skills[print.id].questionIds).toEqual([]);
  expect(saved.progress.totalXp).toBe(0);

  for (let miss = 1; miss <= 3; miss++) {
    await answerShown(page, secondPoint.questions, false);
    await expect(feedback(page)).toContainText('Incorrect');
    if (miss < 3) await continueLesson(page);
  }
  // The attempt has ended: no Continue, and the result sits below all of
  // the lesson's content, which stays on the page.
  await expect(
    page.getByRole('button', { name: 'Continue', exact: true }),
  ).toHaveCount(0);
  const failure = page.getByRole('region', {
    name: 'Lesson failed — you’ll see it again later',
    exact: true,
  });
  await expect(failure).toBeVisible();
  await expect(failure).toBeFocused();
  await expect(page.locator('.question-paper')).toHaveCount(5);
  await expect(
    first.getByText(firstPoint.example.explanation, { exact: true }),
  ).toBeVisible();
  const lastQuestion = await page
    .locator('.question-paper')
    .last()
    .boundingBox();
  const failureBox = await failure.boundingBox();
  expect(failureBox!.y).toBeGreaterThan(
    lastQuestion!.y + lastQuestion!.height - 1,
  );
  await expect
    .poll(async () => (await cloud(page)).progress.attempts.length)
    .toBe(5);
  saved = await cloud(page);
  const failed = saved.progress.skills[print.id];
  expect(saved.progress.attempts.at(-1)).toMatchObject({
    outcome: 'lesson-failed',
    correct: false,
    xp: 0,
  });
  expect(failed.lessonFailedAt).toBeGreaterThan(0);
  expect(failed.lessonAttempt).toBeUndefined();
  expect(failed.questionIds).toEqual([]);
  expect(saved.progress.totalXp).toBe(0);
  expect(saved.cards.every((card) => card.kind === 'mistake')).toBe(true);
  expect(saved.cards).toHaveLength(3);

  await failure.getByRole('link', { name: 'Back to Today' }).click();
  await expect(page).toHaveURL(`${baseURL}/`);
  await page.goto(`/learn?skill=${print.id}&mode=learn`);
  await expect(markers(page).locator('[aria-current="step"]')).toContainText(
    firstPoint.title,
  );
  await expect(answeredQuestions(page)).toHaveCount(0);
  // The retry begins with a variant of the first point not seen before.
  const retry = await answerShown(page, firstPoint.questions);
  expect(seen).not.toContain(retry.id);
});

test('a reload mid-attempt rebuilds passed points and the current question without inventing earlier answers', async ({
  page,
}) => {
  let state = createState();
  // The first point passed, and one correct answer on the second.
  for (const questionId of lessonAnswerIds(print.id).slice(0, 3))
    state = recordLearningAnswer(state, {
      skillId: print.id,
      questionId,
      correct: true,
      mode: 'learn',
    });
  await register(page, print.courseId, state);
  await page.goto(`/learn?skill=${print.id}&mode=learn`);
  const first = pointSection(page, firstPoint.title);
  const second = pointSection(page, secondPoint.title);
  await expect(first.getByText('Passed', { exact: true })).toBeVisible();
  await expect(first).toContainText(firstPoint.explanation[0]);
  await expect(first).toContainText(firstPoint.example.explanation);
  await expect(second.getByText('Passed', { exact: true })).toHaveCount(0);
  await expect(second).toContainText(secondPoint.example.explanation);
  await expect(second).toContainText(
    'Answered earlier in this attempt: 1 correct, 0 incorrect.',
  );
  // Only the current question is shown; past answers are not reconstructed.
  await expect(answeredQuestions(page)).toHaveCount(0);
  await expect(second.locator('[data-state="current"]')).toContainText(
    'Question 2',
  );
  await shownQuestion(page, secondPoint.questions);
  await expect(pointSection(page, 'Write the code')).toHaveCount(0);
  await expect(markers(page).locator('[aria-current="step"]')).toContainText(
    secondPoint.title,
  );
});

test('the lesson page works by keyboard on a 375px phone, and scenario examples never pretend to be code', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  const skill = skillById['ds-workloads'];
  const point = skill.knowledgePoints![0];
  expect(point.example.kind).toBe('text');
  const baseline = await register(page, skill.courseId);
  await page.goto(`/learn?skill=${skill.id}&mode=learn`);
  await expect(
    page
      .getByRole('region', { name: 'Introduction', exact: true })
      .getByText(skill.lesson.paragraphs[0], { exact: true }),
  ).toBeVisible();

  // The worked scenario is text with a decision, not a program to run.
  const teaching = pointSection(page, point.title);
  await expect(teaching.getByRole('heading', { level: 2 })).toHaveText(
    point.title,
  );
  await expect(
    teaching.getByText(point.example.label ?? 'SCENARIO', { exact: true }),
  ).toBeVisible();
  await expect(teaching.getByText('Decision', { exact: true })).toBeVisible();
  await expect(
    teaching.getByText(point.example.output, { exact: true }),
  ).toBeVisible();
  await expect(page.locator('.cm-content')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Run & check' })).toHaveCount(
    0,
  );
  // Nothing folds away: there is no toggle around the teaching.
  await expect(
    page.getByRole('button', { name: 'Explanation and worked example' }),
  ).toHaveCount(0);
  await noHorizontalScroll(page);

  // Lettered choices are reachable, named, and selectable from the keyboard.
  const question = (await shownQuestion(
    page,
    point.questions,
  )) as ChoiceQuestion;
  const answer = choiceButton(page, question.answer);
  await answer.focus();
  await answer.press('Enter');
  await expect(answer).toHaveAttribute('aria-pressed', 'true');
  await expect(answer).toHaveAccessibleName(
    new RegExp(
      `^[A-H] ${escapeRegExp(question.choices[question.answer].slice(0, 20))}`,
    ),
  );
  await page
    .getByRole('button', { name: 'Submit', exact: true })
    .press('Enter');
  await expect(feedback(page)).toContainText('Correct');
  // Feedback is announced, and focus stays on the button, now Continue.
  await expect(
    currentQuestion(page).locator('.question-feedback'),
  ).toHaveAttribute('aria-live', 'polite');
  const next = page.getByRole('button', { name: 'Continue', exact: true });
  await expect(next).toBeFocused();
  await noHorizontalScroll(page);
  await expect
    .poll(async () => (await cloud(page)).progress.attempts.length)
    .toBe(1);
  const after = await cloud(page);
  expect(after.progress.totalXp).toBe(baseline.progress.totalXp);
  expect(after.progress.skills[skill.id].lessonAttempt?.steps).toEqual({
    [point.id]: { correct: [question.id], incorrect: 0 },
  });
  expect(after.progress.skills[skill.id].questionIds).toEqual([]);
  expect(after.cards).toEqual([]);

  // Continue appends the next question and moves focus to its prompt.
  await next.press('Enter');
  await expect(prompt(page)).toBeFocused();
  await expect(answeredQuestions(page)).toHaveCount(1);
  await expect(
    teaching.getByText(point.example.output, { exact: true }),
  ).toBeVisible();
  await noHorizontalScroll(page);

  // A programming lesson keeps its markers, code, and choices inside the screen.
  await page.goto(`/learn?skill=${print.id}&mode=learn`);
  await expect(markers(page)).toBeVisible();
  await expect(prompt(page)).toBeVisible();
  await noHorizontalScroll(page);
});

test('a due review stacks a fresh variant of each point plus the code exercise, offers rereading after each answer, and strengthens memory once', async ({
  page,
}) => {
  test.setTimeout(120_000);
  const state = masterSkillState(createState(), print.id);
  const mastered = getSkillState(state.progress, print.id);
  expect(state.cards).toHaveLength(print.flashcards.length);
  const lessonQuestions = state.progress.attempts.map((a) => a.questionId);
  const reviewTime = mastered.dueAt! + 1;
  await register(page, print.courseId, state);
  await page.clock.setFixedTime(reviewTime);
  await page.goto(`/learn?skill=${print.id}&mode=review`);
  await expect(
    markers(page, 'Review progress').getByRole('listitem'),
  ).toContainText(['Question 1', 'Question 2', 'Code']);
  // Reviews show no lesson material.
  await expect(page.locator('.lesson-step')).toHaveCount(0);
  await expect(
    page.getByRole('region', { name: 'Introduction', exact: true }),
  ).toHaveCount(0);
  await expect(page.getByText(firstPoint.explanation[0])).toHaveCount(0);

  const candidates = [
    ...firstPoint.questions,
    ...secondPoint.questions,
    printCode,
  ];
  for (let index = 0; index < 3; index++) {
    // Rereading is offered only after answering, so recall comes first.
    await expect(
      currentQuestion(page).getByRole('button', { name: /^Reread:/ }),
    ).toHaveCount(0);
    const question = await answerShown(page, candidates);
    // Reviews draw point variants the lesson did not use.
    if (question.type === 'choice')
      expect(lessonQuestions).not.toContain(question.id);
    await expect
      .poll(async () => (await cloud(page)).progress.attempts.length)
      .toBe(lessonQuestions.length + index + 1);
    const saved = await cloud(page);
    if (index < 2) {
      await expect(feedback(page)).toContainText('Correct');
      expect(saved.progress.skills[print.id].memory).toEqual(mastered.memory);
      expect(saved.progress.skills[print.id].dueAt).toBe(mastered.dueAt);
      expect(saved.progress.totalXp).toBe(state.progress.totalXp);
      // The answered question offers its point's explanation and example,
      // collapsed until asked for.
      const point = [firstPoint, secondPoint].find((item) =>
        item.questions.some((candidate) => candidate.id === question.id),
      )!;
      const reread = currentQuestion(page).getByRole('button', {
        name: `Reread: ${point.title}`,
        exact: true,
      });
      await expect(reread).toHaveAttribute('aria-expanded', 'false');
      await reread.press('Enter');
      await expect(reread).toHaveAttribute('aria-expanded', 'true');
      await expect(
        currentQuestion(page).getByText(point.example.explanation, {
          exact: true,
        }),
      ).toBeVisible();
      await continueLesson(page);
      // The answered question stays above the next one.
      await expect(answeredQuestions(page)).toHaveCount(index + 1);
      await expect(answeredQuestions(page).nth(index)).toContainText(
        question.explanation,
      );
    } else {
      await expect(feedback(page)).toContainText(
        `Review complete · +${earnedXp(REVIEW_XP, 0, true)} XP`,
      );
      const reviewed = saved.progress.skills[print.id];
      expect(reviewed.reviewCount).toBe(mastered.reviewCount + 1);
      expect(reviewed.memory?.reps).toBe(mastered.memory!.reps + 1);
      expect(reviewed.memory?.lastReviewAt).toBeGreaterThanOrEqual(reviewTime);
      expect(reviewed.dueAt).toBeGreaterThan(reviewTime);
      expect(saved.progress.totalXp).toBe(
        state.progress.totalXp + earnedXp(REVIEW_XP, 0, true),
      );
      expect(saved.cards).toEqual(state.cards);
    }
  }
  await expect(page.locator('.question-paper')).toHaveCount(3);
  const reviewedPoints = (await cloud(page)).progress.attempts
    .slice(lessonQuestions.length, lessonQuestions.length + 2)
    .map((attempt) => attempt.questionId.split('-q')[0]);
  expect(new Set(reviewedPoints)).toEqual(
    new Set([firstPoint.id, secondPoint.id]),
  );
});

test('a completed lesson ends with a summary, and the next task opens as a fresh page whose first answer counts toward its first point', async ({
  page,
}) => {
  const skill = skillById['ds-workloads'];
  const lastPoint = skill.knowledgePoints!.at(-1)!;
  let state = createState();
  // Everything but the lesson's last answer: the attempt is still open.
  for (const questionId of lessonAnswerIds(skill.id).slice(0, -1))
    state = recordLearningAnswer(state, {
      skillId: skill.id,
      questionId,
      correct: true,
      mode: 'learn',
    });
  // A lesson pays its XP when it is complete, not per answer.
  expect(state.progress.totalXp).toBe(0);
  expect(state.cards).toEqual([]);
  await register(page, skill.courseId, state);
  await page.goto(
    `/learn?skill=${skill.id}&mode=learn&course=${skill.courseId}`,
  );
  // An attempt in progress resumes at its current point.
  await expect(markers(page).locator('[aria-current="step"]')).toContainText(
    lastPoint.title,
  );
  await answerShown(page, lastPoint.questions);
  const lessonReward = earnedXp(lessonXp(skill), 0, true);
  await expect(feedback(page)).toContainText(
    `Lesson complete · +${lessonReward} XP`,
  );
  // The summary follows the content; there is nothing left to continue.
  const summary = page.getByRole('region', {
    name: 'Lesson complete',
    exact: true,
  });
  await expect(summary).toContainText(`You earned ${lessonReward} XP.`);
  await expect(summary).toBeFocused();
  await expect(
    page.getByRole('button', { name: 'Continue', exact: true }),
  ).toHaveCount(0);
  await expect(
    pointSection(page, lastPoint.title).getByText('Passed', { exact: true }),
  ).toBeVisible();
  await expect
    .poll(async () => (await cloud(page)).progress.totalXp)
    .toBe(lessonReward);
  const mastered = await cloud(page);
  expect(mastered.cards).toHaveLength(skill.flashcards.length);
  const task = nextTask(mastered.progress, new Date(), skill.courseId)!;
  expect(task.mode).toBe('learn');
  expect(task.skillId).not.toBe(skill.id);
  const nextSkill = skillById[task.skillId];
  expect(nextSkill.knowledgePoints?.length).toBeGreaterThan(0);
  expect(getSkillState(mastered.progress, nextSkill.id).lessonSeen).toBe(false);

  await openNextTask(page);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    nextSkill.title,
  );
  await expect(page.getByRole('heading', { level: 1 })).toBeFocused();
  await expect(
    page
      .getByRole('region', { name: 'Introduction', exact: true })
      .getByText(nextSkill.lesson.paragraphs[0], { exact: true }),
  ).toBeVisible();
  // The new lesson's first question is already on its page, and nothing
  // from the previous lesson is carried over.
  const firstQuestion = selectQuestion(mastered.progress, nextSkill, 'learn');
  if (firstQuestion.type !== 'choice')
    throw new Error('The systems acquisition must use a real scenario choice.');
  await expect(prompt(page)).toHaveText(firstQuestion.prompt);
  await expect(answeredQuestions(page)).toHaveCount(0);
  const afterReading = await cloud(page);
  expect(afterReading.progress.totalXp).toBe(mastered.progress.totalXp);
  expect(afterReading.progress.attempts).toEqual(mastered.progress.attempts);
  expect(getSkillState(afterReading.progress, nextSkill.id).lessonSeen).toBe(
    false,
  );
  expect(afterReading.cards).toEqual(mastered.cards);

  await answerChoice(page, firstQuestion);
  await expect(feedback(page)).toContainText('Correct');
  await expect
    .poll(async () => (await cloud(page)).progress.attempts.length)
    .toBe(mastered.progress.attempts.length + 1);
  const independent = await cloud(page);
  expect(independent.progress.skills[nextSkill.id].lessonSeen).toBe(true);
  expect(independent.progress.attempts.at(-1)).toMatchObject({
    skillId: nextSkill.id,
    questionId: firstQuestion.id,
    correct: true,
    usedHint: false,
    xp: 0,
  });
  // The first answer counts toward the first point of the new lesson.
  expect(
    independent.progress.skills[nextSkill.id].lessonAttempt?.steps,
  ).toEqual({
    [nextSkill.knowledgePoints![0].id]: {
      correct: [firstQuestion.id],
      incorrect: 0,
    },
  });
  expect(independent.progress.totalXp).toBe(lessonReward);
  expect(independent.cards).toEqual(mastered.cards);
});
