import { expect, test, type Page } from '@playwright/test';
import { skillById, type Question } from '../src/lib/curriculum';
import {
  applyAttempt,
  DAY_MS,
  getSkillState,
  isMastered,
  nextTask,
  type Progress,
} from '../src/lib/learning';
import {
  activeQuiz,
  nonQuizXp,
  QUIZ_XP_INTERVAL,
  quizQuestion,
  quizStatus,
} from '../src/lib/quiz';
import { createState, type LearnerState } from '../src/lib/state';
import { earnedQuizXp } from '../src/lib/xp';
import { signUp } from './helpers/accounts';
import {
  answerShown,
  choiceButton,
  expectProse,
  continueLesson,
  feedback,
  prompt,
} from './helpers/lesson';

const baseURL = process.env.LESSDUMB_E2E_URL ?? 'http://127.0.0.1:4321';
test.use({ baseURL });
// Data systems is choice-only, so these runs need no code runtime.
const COURSE = 'data-systems-foundations';

/** Learn lessons in scheduler order at `at` until `xp` XP is earned. */
function learnUntil(progress: Progress, xp: number, at: number): Progress {
  let result = progress;
  for (let index = 0; nonQuizXp(result) < xp && index < 600; index++) {
    const task = nextTask(result, at, COURSE);
    if (!task || task.mode !== 'learn')
      throw new Error('The course ran out of lessons before the XP target.');
    result = applyAttempt(result, { ...task, correct: true }, at);
  }
  return result;
}

async function register(page: Page, state: LearnerState) {
  const response = await signUp(page.request, baseURL, {
    name: 'Quiz learner',
    email: `quiz-${Date.now()}-${Math.random().toString(16).slice(2)}@example.test`,
    password: 'quiz-integration-test-123',
  });
  expect(response.status()).toBe(200);
  const owner = (await response.json()).user.id as string;
  state.activeCourseId = COURSE;
  const saved = await page.request.put(`${baseURL}/api/state`, {
    headers: { origin: baseURL, 'X-Lessdumb-User': owner },
    data: { state, revision: 0 },
  });
  expect(saved.status()).toBe(200);
}

async function cloud(page: Page): Promise<LearnerState> {
  const response = await page.request.get(`${baseURL}/api/state`);
  expect(response.status()).toBe(200);
  return (await response.json()).state as LearnerState;
}

test('a quiz is earned, timed, hides feedback until the end, scores XP, and turns a miss into a review due now', async ({
  page,
}) => {
  test.setTimeout(120_000);
  const state = createState();
  // Learned an hour ago, so nothing is due before the quiz.
  state.progress = learnUntil(
    state.progress,
    QUIZ_XP_INTERVAL,
    Date.now() - 3_600_000,
  );
  const status = quizStatus(state.progress, COURSE);
  if (status.kind !== 'available') throw new Error('Expected a quiz.');
  await register(page, state);

  await page.goto('/');
  const card = page.locator('article.ma-quiz-task');
  await expect(card).toContainText('Quiz');
  await expect(card).toContainText(`${status.xp} XP`);
  await expect(card.locator('.ma-task-title')).toHaveText('Quiz 1');
  await card.getByRole('link', { name: 'Start quiz' }).click();
  await expect(
    page.getByRole('region', { name: 'Quiz instructions' }),
  ).toContainText(`${status.questions} questions`);
  await page.getByRole('button', { name: 'Start quiz', exact: true }).click();
  await expect(page.getByRole('timer', { name: 'Time left' })).toContainText(
    /\d+:\d\d left/,
  );
  await expect
    .poll(async () => activeQuiz((await cloud(page)).progress)?.number)
    .toBe(1);
  const quiz = activeQuiz((await cloud(page)).progress)!;
  expect(quiz.questions).toHaveLength(status.questions);

  for (const [index, slot] of quiz.questions.entries()) {
    const { question } = quizQuestion(slot)!;
    await expect(page.getByText(`Question ${index + 1} of`)).toBeVisible();
    await expectProse(prompt(page), question.prompt);
    // No lesson material during a quiz.
    await expect(page.locator('.lesson-point')).toHaveCount(0);
    const answer =
      index === 0
        ? (question.answer + 1) % question.choices.length
        : question.answer;
    await choiceButton(page, answer).click();
    await page.getByRole('button', { name: 'Submit', exact: true }).click();
    // No correct/incorrect feedback or explanation until the end.
    await expect(feedback(page)).toHaveCount(0);
  }

  const total = quiz.questions.length;
  const earned = earnedQuizXp(quiz.possible, total - 1, total);
  const score = page.locator('.quiz-score');
  await expect(score).toContainText(`${total - 1} of ${total} correct`);
  await expect(score).toContainText(`${earned}/${quiz.possible} XP`);
  const missed = quizQuestion(quiz.questions[0])!;
  await expect(score).toContainText(
    `Due for review now: ${missed.skill.title}`,
  );
  const results = page.getByRole('list', { name: 'Question results' });
  await expect(results.getByRole('listitem')).toHaveCount(total);
  await expect(results.getByRole('listitem').first()).toContainText(
    'Question 1: Incorrect',
  );
  await expectProse(
    results.getByRole('listitem').first().locator('.lesson-teaching-text'),
    missed.question.explanation,
  );
  await expect(results.getByRole('listitem').nth(1)).toContainText(
    'Question 2: Correct',
  );

  await expect
    .poll(async () => (await cloud(page)).progress.quizzes?.[0].completedAt)
    .toBeDefined();
  const saved = await cloud(page);
  expect(saved.progress.quizzes![0].earned).toBe(earned);
  expect(saved.progress.totalXp).toBe(state.progress.totalXp + earned);
  const remedial = getSkillState(saved.progress, missed.skill.id);
  expect(remedial.dueAt).toBeLessThanOrEqual(Date.now());
  expect(isMastered(saved.progress, missed.skill.id)).toBe(true);
  expect(
    saved.progress.attempts.filter((attempt) => attempt.mode === 'quiz'),
  ).toHaveLength(total);

  // Back on Learn: the remedial review leads, and the quiz is in history.
  await page.getByRole('link', { name: 'Back to Learn' }).click();
  const first = page.locator('.ma-task-list > li').first();
  await expect(first).toContainText('Review');
  await expect(first).toContainText(missed.skill.title);
  const entry = page.locator('.ma-history-item').filter({ hasText: 'Quiz 1' });
  await expect(entry).toContainText('Assessment');
  await expect(entry).toContainText(`${earned}/${quiz.possible} XP`);
  await expect(entry.getByRole('link', { name: 'Quiz 1' })).toHaveAttribute(
    'href',
    `/learn?quiz=${quiz.id}`,
  );

  // The remedial review is an ordinary review: passing it reschedules.
  await first.getByRole('link', { name: 'Start' }).click();
  const candidates = missed.skill.knowledgePoints!.flatMap(
    (point) => point.questions,
  ) as Question[];
  for (let index = 0; index < 6; index++) {
    await answerShown(page, candidates);
    const text = await feedback(page).textContent();
    if (text?.includes('Review complete')) break;
    await continueLesson(page);
  }
  await expect(feedback(page)).toContainText('Review complete');
  await expect
    .poll(
      async () =>
        getSkillState((await cloud(page)).progress, missed.skill.id).dueAt!,
    )
    .toBeGreaterThan(Date.now());

  // A finished quiz reopens on its results.
  await page.goto(`/learn?quiz=${quiz.id}`);
  await expect(page.locator('.quiz-score')).toContainText(
    `${total - 1} of ${total} correct`,
  );
});

test('due reviews interleave with lessons: at most two reviews in a row on Learn and in a session', async ({
  page,
}) => {
  test.setTimeout(120_000);
  const state = createState();
  // Learned three days ago, so every mastered skill is due, with lessons ready.
  const learnedAt = Date.now() - 3 * DAY_MS;
  state.progress = learnUntil(state.progress, 60, learnedAt);
  const now = Date.now();
  const due = Object.keys(state.progress.skills).filter(
    (id) => getSkillState(state.progress, id).dueAt! <= now,
  );
  expect(due.length).toBeGreaterThanOrEqual(4);
  await register(page, state);

  await page.goto('/');
  const types = page.locator('.ma-task-list > li .ma-task-type');
  await expect(types).toHaveText([
    'Review',
    'Review',
    'Lesson',
    'Review',
    'Review',
  ]);

  // An adaptive session follows the same rule after two finished reviews.
  await page.goto('/learn');
  const candidates = due.flatMap((id) =>
    skillById[id].knowledgePoints!.flatMap((point) => point.questions),
  ) as Question[];
  // A lesson's turn opens its own page, with the lesson's introduction.
  const lessonPage = page
    .locator('.lesson-session-stats')
    .getByText('Lesson', { exact: true });
  for (let index = 0; index < 12; index++) {
    await answerShown(page, candidates);
    await continueLesson(page);
    if (await lessonPage.isVisible()) break;
  }
  await expect(lessonPage).toBeVisible();
  await expect(
    page.getByRole('region', { name: 'Introduction', exact: true }),
  ).toBeVisible();
  await expect
    .poll(
      async () =>
        (await cloud(page)).progress.attempts.filter(
          (attempt) => attempt.outcome === 'review-passed',
        ).length,
    )
    .toBe(2);
  const saved = await cloud(page);
  // Reviews were still due when the lesson took its turn.
  expect(
    due.filter((id) => getSkillState(saved.progress, id).dueAt! <= Date.now())
      .length,
  ).toBeGreaterThan(0);
});
