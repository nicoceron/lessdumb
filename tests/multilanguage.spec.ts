import { expect, test, type Page } from '@playwright/test';
import {
  courses,
  skills,
  skillById,
  type Question,
  type CodeLanguage,
} from '../src/lib/curriculum';
import {
  isUnlocked,
  MAX_RECENT_ATTEMPTS,
  selectQuestion,
} from '../src/lib/learning';
import {
  createState,
  recordLearningAnswer,
  type LearnerState,
} from '../src/lib/state';
import { signUp } from './helpers/accounts';
import { replaceCode as fillCode } from './helpers/editor';

const baseURL = process.env.LESSDUMB_E2E_URL ?? 'http://127.0.0.1:4321';
test.use({ baseURL });

async function cloud(page: Page): Promise<LearnerState> {
  const response = await page.request.get(`${baseURL}/api/state`);
  expect(response.status()).toBe(200);
  return (await response.json()).state;
}

async function runAndCheck(page: Page) {
  const before = await cloud(page);
  for (let attempt = 0; attempt < 2; attempt++) {
    const response = page.waitForResponse(
      (result) =>
        result.url().endsWith('/api/code') &&
        result.request().method() === 'POST',
      { timeout: 45_000 },
    );
    await page
      .getByRole('button', { name: 'Run & check', exact: true })
      .click();
    const result = await (await response).json();
    if (!result.infrastructure) return;
    // Retry only service failures, after proving that they earned no evidence.
    // Actual compiler, assertion, and completion-proof failures are never retried.
    const retained = await cloud(page);
    expect(retained.progress).toEqual(before.progress);
    expect(retained.cards).toEqual(before.cards);
    await expect(
      page.getByRole('button', { name: 'Run & check', exact: true }),
    ).toBeEnabled();
    if (attempt === 1)
      throw new Error(
        `Live compiler unavailable after two attempts: ${result.error}`,
      );
  }
}

async function answer(page: Page, question: Question) {
  if (question.type === 'choice') {
    await page
      .getByRole('button', {
        name: `${String.fromCharCode(65 + question.answer)} ${question.choices[question.answer]}`,
        exact: true,
      })
      .click();
    await page
      .getByRole('button', { name: 'Check answer', exact: true })
      .click();
  } else {
    await fillCode(page, question.solution);
    await runAndCheck(page);
  }
}

for (const language of ['rust', 'cpp'] as const) {
  test(`${language} uses real compilation for mastery, persisted cards, graph unlocks, and a due FSRS review`, async ({
    page,
  }) => {
    test.setTimeout(180_000);
    const course = courses.find((item) => item.language === language)!;
    const first = skills.find(
      (item) => item.courseId === course.id && !item.prerequisites.length,
    )!;
    const second = skills.find(
      (item) =>
        item.courseId === course.id &&
        item.prerequisites.length === 1 &&
        item.prerequisites[0] === first.id,
    )!;
    const registration = await signUp(page.request, baseURL, {
      name: `${language} learner`,
      email: `${language}-${Date.now()}-${Math.random().toString(16).slice(2)}@example.test`,
      password: 'compiled-course-test-123',
    });
    expect(registration.status()).toBe(200);
    await page.goto('/courses');
    const tile = page.locator('.ma-catalog-card').filter({
      has: page.getByRole('heading', { name: course.title, exact: true }),
    });
    await tile
      .getByRole('button', { name: 'Set learning goal', exact: true })
      .click();
    await expect
      .poll(async () => (await cloud(page))?.activeCourseId)
      .toBe(course.id);
    await page.goto(`/learn?skill=${first.id}`);
    await expect(page.getByText('Step 1 of 4', { exact: true })).toBeVisible();
    await page
      .getByRole('button', { name: 'Let’s try it', exact: true })
      .click();
    for (const question of first.questions.filter(
      (item) => item.type === 'choice',
    )) {
      await answer(page, question);
      await expect(
        page.getByText('That’s a small win.', { exact: true }),
      ).toBeVisible();
      await page.getByRole('button', { name: 'Continue', exact: true }).click();
    }
    await expect
      .poll(
        async () =>
          (await cloud(page)).progress.skills[first.id]?.questionIds.length,
      )
      .toBe(3);
    const partial = await cloud(page);
    expect(partial.progress.skills[first.id].memory).toBeUndefined();
    expect(isUnlocked(partial.progress, second.id)).toBe(false);
    const exercise = first.questions.find((item) => item.type === 'code')!;
    if (exercise.type !== 'code')
      throw new Error('Expected executable assessment.');
    expect(exercise.language).toBe(language);
    const contract = page.getByLabel('Required behavior checks', {
      exact: true,
    });
    await expect(contract).toBeVisible();
    await expect(contract.locator('[data-slot="code-block-line"]')).toHaveText(
      exercise.contract!.split('\n'),
    );

    // An unavailable compiler must be retryable and must not create a mistake.
    await page.route('**/api/code', (route) =>
      route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({
          passed: false,
          output: '',
          error: 'Compiler temporarily unavailable.',
          infrastructure: true,
        }),
      }),
    );
    await page
      .getByRole('button', { name: 'Run & check', exact: true })
      .click();
    await expect(
      page.getByText('Compiler temporarily unavailable.', { exact: true }),
    ).toBeVisible();
    expect((await cloud(page)).progress).toEqual(partial.progress);
    expect((await cloud(page)).cards).toEqual(partial.cards);
    await page.unroute('**/api/code');

    // A zero exit before the assertions finish must not earn executable evidence.
    await fillCode(
      page,
      language === 'rust'
        ? "fn greeting() -> &'static str { std::process::exit(0) }"
        : '#include <cstdlib>\nint solve(int) { std::exit(0); }',
    );
    await runAndCheck(page);
    await expect(
      page.getByText('A useful mistake. Let’s work through it.', {
        exact: true,
      }),
    ).toBeVisible({ timeout: 45_000 });
    await expect
      .poll(async () => (await cloud(page)).progress.skills[first.id]?.attempts)
      .toBe(4);
    expect((await cloud(page)).progress.skills[first.id].mastery).toBe(0.75);
    await page.getByRole('button', { name: 'Continue', exact: true }).click();

    // The real provider must reject unfinished work, then accept the actual contract.
    await fillCode(page, exercise.starterCode);
    await runAndCheck(page);
    await expect(
      page.getByText('A useful mistake. Let’s work through it.', {
        exact: true,
      }),
    ).toBeVisible({ timeout: 45_000 });
    await expect
      .poll(
        async () =>
          (await cloud(page)).cards.filter((card) => card.kind === 'mistake')
            .length,
      )
      .toBe(1);
    await page.getByRole('button', { name: 'Continue', exact: true }).click();
    await answer(page, exercise);
    await expect(
      page.getByText('Skill mastered. A new connection made.', { exact: true }),
    ).toBeVisible({ timeout: 45_000 });
    await expect
      .poll(async () => (await cloud(page)).progress.skills[first.id]?.mastery)
      .toBe(1);
    await expect
      .poll(
        async () =>
          (await cloud(page)).cards.filter((card) => card.kind === 'mastery')
            .length,
      )
      .toBe(2);
    const acquired = await cloud(page);
    expect(acquired.progress.totalXp).toBe(45);
    expect(acquired.progress.skills[first.id].memory?.algorithm).toBe('fsrs-6');
    expect(acquired.progress.skills[first.id].intervalDays).toBe(1);
    expect(isUnlocked(acquired.progress, second.id)).toBe(true);
    expect(Object.keys(acquired.progress.skills)).toEqual([first.id]);
    await page.goto('/cards');
    await expect(
      page.getByRole('button', { name: /BREAKTHROUGH/ }),
    ).toHaveCount(2);
    await page.reload();
    await expect(
      page.getByRole('button', { name: /USEFUL MISTAKE/ }),
    ).toHaveCount(1);
    await page.goto(`/graph?skill=${second.id}&course=${course.id}`);
    await expect(
      page.getByRole('button', {
        name: `${first.title}: Mastered`,
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      page.getByRole('button', {
        name: `${second.title}: Ready to learn`,
        exact: true,
      }),
    ).toBeVisible();

    const due = acquired.progress.skills[first.id].dueAt! + 1_000;
    await page.clock.setFixedTime(due);
    await page.goto(`/learn?skill=${first.id}&mode=review`);
    await expect(
      page.getByText('SPACED REVIEW', { exact: true }),
    ).toBeVisible();
    let stored = acquired;
    const types: Question['type'][] = [];
    for (let index = 0; index < 2; index++) {
      const question = selectQuestion(stored.progress, first, 'review');
      types.push(question.type);
      await answer(page, question);
      await expect
        .poll(
          async () => (await cloud(page)).progress.skills[first.id].attempts,
        )
        .toBe(7 + index);
      stored = await cloud(page);
      if (index === 0) {
        expect(stored.progress.skills[first.id].memory).toEqual(
          acquired.progress.skills[first.id].memory,
        );
        await page
          .getByRole('button', { name: 'Continue', exact: true })
          .click();
      }
    }
    expect(new Set(types)).toEqual(new Set(['code', 'choice']));
    expect(stored.progress.skills[first.id].reviewCount).toBe(1);
    expect(stored.progress.skills[first.id].memory!.reps).toBe(
      acquired.progress.skills[first.id].memory!.reps + 1,
    );
    expect(stored.progress.totalXp).toBe(58);
    expect(stored.cards).toHaveLength(3);
    await page.reload();
    expect((await cloud(page)).progress.skills[first.id].memory).toEqual(
      stored.progress.skills[first.id].memory,
    );
  });
}

test('the code lab preserves a separate buffer per language and executes real C++ without earning progress', async ({
  page,
}) => {
  test.setTimeout(90_000);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/lab?language=python');
  const language = page.getByRole('combobox', {
    name: 'Playground language',
    exact: true,
  });
  const programs: Record<CodeLanguage, string> = {
    python: 'print("saved Python")',
    rust: 'fn main() { println!("saved Rust"); }',
    cpp: '#include <iostream>\nint main() { std::cout << "saved C++\\n"; }',
  };
  for (const id of ['python', 'rust', 'cpp'] as const) {
    await language.selectOption(id);
    await fillCode(page, programs[id]);
  }
  for (const id of ['rust', 'python', 'cpp'] as const) {
    await language.selectOption(id);
    await expect(page.locator('.cm-content .cm-line')).toHaveText(
      programs[id].split('\n'),
    );
  }
  await page.getByRole('button', { name: 'Run C++', exact: true }).click();
  await expect(page.locator('.runner-output')).toContainText('saved C++', {
    timeout: 45_000,
  });
  await expect(
    page.getByRole('button', { name: 'Run C++', exact: true }),
  ).toBeEnabled();
  const guest = (await page.evaluate(() =>
    JSON.parse(localStorage.getItem('lessdumb.guest') ?? 'null'),
  )) as LearnerState | null;
  expect(guest?.progress.totalXp ?? 0).toBe(0);
  expect(guest?.cards ?? []).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test('a full catalog with mistake cards survives guest reload, account migration, and an offline account reload', async ({
  page,
}) => {
  test.setTimeout(180_000);
  let state = createState();
  state.activeCourseId = 'cpp';
  const remaining = new Map(skills.map((skill) => [skill.id, skill]));
  while (remaining.size) {
    const skill = [...remaining.values()].find((item) =>
      isUnlocked(state.progress, item.id),
    );
    if (!skill) throw new Error('Unreachable prerequisite path.');
    for (const question of skill.questions) {
      for (const correct of [false, true])
        state = recordLearningAnswer(state, {
          skillId: skill.id,
          questionId: question.id,
          correct,
          mode: 'learn',
          attemptId: crypto.randomUUID(),
          writerId: 'full-catalog-browser',
        });
    }
    remaining.delete(skill.id);
  }
  const cardCount = skills.reduce(
    (sum, skill) => sum + skill.questions.length + skill.flashcards.length,
    0,
  );
  expect(state.cards).toHaveLength(cardCount);
  expect(state.progress.attempts).toHaveLength(MAX_RECENT_ATTEMPTS);
  expect(Buffer.byteLength(JSON.stringify(state))).toBeGreaterThan(
    2 * 1024 * 1024,
  );
  await page.addInitScript((saved) => {
    if (!localStorage.getItem('lessdumb.full-catalog-seeded')) {
      localStorage.setItem('lessdumb.guest', JSON.stringify(saved));
      localStorage.setItem('lessdumb.full-catalog-seeded', 'true');
    }
  }, state);
  const first = skills.find(
    (item) => item.courseId === 'cpp' && !item.prerequisites.length,
  )!;
  await page.goto(`/graph?skill=${first.id}&course=cpp`);
  await expect(
    page.getByRole('button', { name: `${first.title}: Mastered`, exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole('button', { name: `${first.title}: Mastered`, exact: true }),
  ).toBeVisible();
  const response = await signUp(page.request, baseURL, {
    name: 'Full catalog learner',
    email: `full-${Date.now()}-${Math.random().toString(16).slice(2)}@example.test`,
    password: 'full-catalog-browser-123',
  });
  expect(response.status()).toBe(200);
  const owner = (await response.json()).user.id as string;
  await page.reload();
  await expect
    .poll(async () => (await cloud(page))?.cards.length)
    .toBe(cardCount);
  const stored = await cloud(page);
  expect(stored.progress.totalXp).toBe(state.progress.totalXp);
  expect(Object.keys(stored.progress.skills)).toHaveLength(skills.length);
  await expect
    .poll(async () =>
      page.evaluate((id) => {
        const saved = localStorage.getItem(`lessdumb.account.${id}`);
        return saved ? JSON.parse(saved).cards.length : 0;
      }, owner),
    )
    .toBe(cardCount);
  await page.route('**/api/state', (route) =>
    route.fulfill({
      status: 503,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'Temporarily offline.' }),
    }),
  );
  await page.reload();
  await expect(
    page.getByRole('button', { name: `${first.title}: Mastered`, exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      (id) =>
        JSON.parse(localStorage.getItem(`lessdumb.account.${id}`)!).progress
          .totalXp,
      owner,
    ),
  ).toBe(state.progress.totalXp);
});

test('the sandbox executes advanced C++20 and Rust standard-library assessment contracts', async ({
  page,
}) => {
  test.setTimeout(180_000);
  await page.goto('/lab');
  for (const id of [
    'cpp-threads',
    'cpp-integral-concept',
    'cpp-strings',
    'cpp-ring-buffer',
    'rust-scoped-threads',
    'rust-future-pending',
  ]) {
    const skill = skillById[id];
    const question = skill.questions.find((item) => item.type === 'code')!;
    if (question.type !== 'code')
      throw new Error('Expected compiled contract.');
    const response = await page.request.post(`${baseURL}/api/code`, {
      headers: { origin: baseURL },
      data: {
        language: question.language,
        code: question.solution,
        skillId: skill.id,
        questionId: question.id,
      },
    });
    expect(response.status(), id).toBe(200);
    expect(await response.json(), id).toMatchObject({
      passed: true,
      infrastructure: false,
      error: null,
    });
  }
  const guest = (await page.evaluate(() =>
    JSON.parse(localStorage.getItem('lessdumb.guest') ?? 'null'),
  )) as LearnerState | null;
  expect(guest?.progress.totalXp ?? 0).toBe(0);
  expect(guest?.cards ?? []).toEqual([]);
});
