import { expect, test, type Page } from '@playwright/test';
import {
  skillById,
  type ChoiceQuestion,
  type CodeQuestion,
} from '../src/lib/curriculum';
import { competitiveTopicStages } from '../src/lib/courses/competitive-programming';
import {
  applyAttempt,
  DAY_MS,
  isMastered,
  nextTask,
  selectQuestion,
} from '../src/lib/learning';
import { createState, type LearnerState } from '../src/lib/state';
import { signUp } from './helpers/accounts';

const origin = process.env.LESSDUMB_E2E_URL ?? 'http://127.0.0.1:4321';
const password = 'granular-engine-browser-123';

async function cloud(page: Page) {
  const response = await page.request.get(`${origin}/api/state`);
  expect(response.status()).toBe(200);
  return (await response.json()) as {
    state: LearnerState | null;
    revision: number;
  };
}

function master(state: LearnerState, id: string, at: number) {
  if (isMastered(state.progress, id)) return;
  const skill = skillById[id];
  skill.prerequisites.forEach((parent) => master(state, parent, at));
  for (const question of skill.questions) {
    state.progress = applyAttempt(
      state.progress,
      { skillId: id, questionId: question.id, correct: true, mode: 'learn' },
      at,
    );
  }
}

async function save(
  page: Page,
  owner: string,
  state: LearnerState,
  revision: number,
) {
  const response = await page.request.put(`${origin}/api/state`, {
    headers: { origin, 'X-Lessdumb-User': owner },
    data: { state, revision },
  });
  expect(response.status()).toBe(200);
}

async function answerChoice(page: Page, question: ChoiceQuestion) {
  await expect(page.locator('.question-paper h1')).toHaveText(question.prompt);
  await page
    .getByRole('button', {
      name: `${String.fromCharCode(65 + question.answer)} ${question.choices[question.answer]}`,
      exact: true,
    })
    .click();
  await page.getByRole('button', { name: 'Check answer', exact: true }).click();
}

async function answerCode(
  page: Page,
  question: CodeQuestion,
  solution: string,
) {
  await expect(page.locator('.question-paper h1')).toHaveText(question.prompt);
  const editor = page.locator('.cm-content');
  await editor.fill(solution);
  await expect(editor.locator('.cm-line')).toHaveText(solution.split('\n'));
  await page.getByRole('button', { name: 'Run & check', exact: true }).click();
}

test('atomic graph stages earn real Python evidence and adaptive reviews interleave without premature FSRS credit', async ({
  page,
  browser,
}) => {
  test.setTimeout(180_000);
  const registered = await signUp(page.request, origin, {
    name: 'Granular learner',
    email: `granular-${Date.now()}-${Math.random().toString(16).slice(2)}@example.test`,
    password,
  });
  expect(registered.status()).toBe(200);
  const owner = (await registered.json()).user.id as string;
  const time = Date.now();
  const stages = [...competitiveTopicStages['cp-stacks'], 'cp-stacks'];
  const atomic = skillById[stages[0]];
  const seeded = createState();
  seeded.activeCourseId = 'competitive-programming';
  atomic.prerequisites.forEach((id) => master(seeded, id, time));
  await save(page, owner, seeded, 0);

  await page.goto('/graph?skill=cp-stacks');
  const detail = page.locator('.graph-detail');
  for (let index = stages.length - 1; index >= 0; index -= 1) {
    const skill = skillById[stages[index]];
    await expect(detail.locator('h2')).toHaveText(skill.title);
    await expect(
      detail.getByText(`Step ${index + 1} of 4`, { exact: true }),
    ).toBeVisible();
    await expect(
      detail.getByText(index === 3 ? 'Apply the algorithm' : 'One concept', {
        exact: true,
      }),
    ).toBeVisible();
    if (index > 0) {
      await expect(
        detail.getByRole('link', { name: 'Practice this skill' }),
      ).toHaveCount(0);
      await detail
        .getByRole('button')
        .filter({ hasText: skillById[stages[index - 1]].title })
        .click();
    }
  }
  await expect(
    detail.getByRole('link', { name: 'Practice this skill' }),
  ).toHaveAttribute('href', `/learn?skill=${atomic.id}`);
  await detail.getByRole('link', { name: 'Practice this skill' }).click();
  await expect(page.getByText('Step 1 of 4', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Let’s try it' }).click();
  const feedback = page.locator(
    '.question-paper [data-slot="alert"][role="status"]',
  );
  for (const question of atomic.questions) {
    if (question.type === 'choice') {
      await answerChoice(page, question);
      await expect(feedback).toContainText('That’s a small win.');
      await page.getByRole('button', { name: 'Continue', exact: true }).click();
    } else {
      await answerCode(page, question, 'pass');
      await expect(feedback).toContainText(
        'A useful mistake. Let’s work through it.',
        { timeout: 60_000 },
      );
      await expect
        .poll(async () => (await cloud(page)).state?.cards.length)
        .toBe(1);
      const incomplete = (await cloud(page)).state!;
      expect(incomplete.progress.skills[atomic.id].questionIds).toHaveLength(3);
      expect(incomplete.progress.skills[atomic.id].memory).toBeUndefined();
      expect(incomplete.cards[0]).toMatchObject({
        skillId: atomic.id,
        kind: 'mistake',
      });
      await page.getByRole('button', { name: 'Continue', exact: true }).click();
      await answerCode(page, question, question.solution);
      await expect(feedback).toContainText(
        'Skill mastered. A new connection made.',
        { timeout: 60_000 },
      );
    }
  }
  await expect
    .poll(
      async () =>
        (await cloud(page)).state?.cards.filter(
          (card) => card.skillId === atomic.id && card.kind === 'mastery',
        ).length,
    )
    .toBe(2);
  const acquired = (await cloud(page)).state!;
  expect(acquired.progress.skills[atomic.id].memory).toMatchObject({
    algorithm: 'fsrs-6',
    reps: 1,
    lapses: 0,
  });
  expect(acquired.progress.skills[atomic.id].questionIds).toHaveLength(4);
  expect(acquired.progress.skills['cp-stacks']).toBeUndefined();
  await page.goto('/cards');
  await page.reload();
  await expect(
    page
      .getByRole('button', { name: /BREAKTHROUGH/ })
      .filter({ hasText: atomic.title }),
  ).toHaveCount(2);
  await page.goto(`/graph?skill=${stages[1]}`);
  await expect(
    detail.getByRole('link', { name: 'Practice this skill' }),
  ).toBeVisible();
  await expect(detail.getByText('Step 2 of 4', { exact: true })).toBeVisible();

  // Seed old, independently mastered scenario skills through the same engine.
  // Fresh local storage in another context reads the same account from its
  // authenticated API, rather than racing a live client's earlier snapshot.
  await page.goto('about:blank');
  const reviewContext = await browser.newContext({ baseURL: origin });
  const reviewPage = await reviewContext.newPage();
  try {
    const signedIn = await reviewPage.request.post(
      `${origin}/api/auth/sign-in/email`,
      {
        headers: { origin },
        data: { email: (await registered.json()).user.email, password },
      },
    );
    expect(signedIn.status()).toBe(200);
    const stored = await cloud(reviewPage);
    const reviewState = structuredClone(stored.state!);
    const dueSkills = ['ds-requirements', 'ds-authority'];
    const reviewTime = Date.now();
    dueSkills.forEach((id) => master(reviewState, id, reviewTime - 3 * DAY_MS));
    // Refresh their shared ancestor so exactly these two systems skills are due.
    const ancestor = skillById['ds-workloads'];
    for (let index = 0; index < 2; index += 1) {
      const question = selectQuestion(reviewState.progress, ancestor, 'review');
      reviewState.progress = applyAttempt(
        reviewState.progress,
        {
          skillId: ancestor.id,
          questionId: question.id,
          correct: true,
          mode: 'review',
        },
        reviewTime,
      );
    }
    reviewState.activeCourseId = 'data-systems-foundations';
    reviewState.updatedAt = reviewTime;
    const before = structuredClone(reviewState.progress.skills);
    await save(reviewPage, owner, reviewState, stored.revision);
    await reviewPage.clock.setFixedTime(reviewTime);
    await reviewPage.goto('/learn?mode=review');
    await expect(
      reviewPage.getByText('SPACED REVIEW', { exact: true }),
    ).toBeVisible();
    let current = (await cloud(reviewPage)).state!;
    const visited: string[] = [];
    for (let index = 0; index < 4; index += 1) {
      const task = nextTask(
        current.progress,
        reviewTime,
        'data-systems-foundations',
      );
      expect(task?.mode).toBe('review');
      expect(dueSkills).toContain(task?.skillId);
      const skill = skillById[task!.skillId];
      visited.push(skill.id);
      if (index > 0) expect(visited[index]).not.toBe(visited[index - 1]);
      const question = selectQuestion(current.progress, skill, 'review');
      if (question.type !== 'choice')
        throw new Error('Expected a systems scenario review.');
      await answerChoice(reviewPage, question);
      await expect
        .poll(
          async () => (await cloud(reviewPage)).state?.progress.attempts.length,
        )
        .toBe(current.progress.attempts.length + 1);
      current = (await cloud(reviewPage)).state!;
      const progress = current.progress.skills[skill.id];
      const evidence = current.progress.attempts.filter(
        (attempt) => attempt.skillId === skill.id && attempt.mode === 'review',
      );
      expect(new Set(evidence.map((attempt) => attempt.questionId)).size).toBe(
        evidence.length,
      );
      if (evidence.length === 1) {
        expect(progress.reviewQuestionIds).toEqual([question.id]);
        expect(progress.reviewCount).toBe(0);
        expect(progress.memory).toEqual(before[skill.id].memory);
        expect(progress.dueAt).toBe(before[skill.id].dueAt);
      } else {
        expect(evidence).toHaveLength(2);
        expect(progress.reviewQuestionIds).toEqual([]);
        expect(progress.reviewCount).toBe(1);
        expect(progress.memory!.reps).toBe(before[skill.id].memory!.reps + 1);
        expect(progress.memory!.lastReviewAt).toBe(reviewTime);
        expect(progress.dueAt).toBeGreaterThan(reviewTime);
      }
      await reviewPage
        .getByRole('button', { name: 'Continue', exact: true })
        .click();
    }
    await expect(
      reviewPage.getByRole('heading', {
        name: 'Your reviews are all caught up.',
      }),
    ).toBeVisible();
    await reviewPage.reload();
    await expect(
      reviewPage.getByRole('heading', {
        name: 'Your reviews are all caught up.',
      }),
    ).toBeVisible();
    const persisted = (await cloud(reviewPage)).state!;
    for (const id of dueSkills) {
      expect(persisted.progress.skills[id].reviewCount).toBe(1);
      expect(persisted.progress.skills[id].memory).toEqual(
        current.progress.skills[id].memory,
      );
    }
    expect(
      persisted.cards.filter((card) => card.skillId === atomic.id),
    ).toHaveLength(3);
    expect(persisted.progress.skills[atomic.id].memory).toEqual(
      acquired.progress.skills[atomic.id].memory,
    );
  } finally {
    await reviewContext.close();
  }
});
