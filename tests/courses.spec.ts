import { expect, test, type Page } from '@playwright/test';
import { skillById, type CodeQuestion } from '../src/lib/curriculum';
import { applyAttempt, coursePath } from '../src/lib/learning';
import { createState } from '../src/lib/state';
const origin = process.env.LESSDUMB_E2E_URL ?? 'http://127.0.0.1:4321';
async function ready(page: Page) {
  await expect(page.getByText('Preparing your learning space…')).toHaveCount(0);
}
async function seedPrerequisites(
  page: Page,
  skillId: string,
  completeGoal = false,
  guest = false,
) {
  const state = createState();
  const done = new Set<string>();
  const now = Date.now();
  function master(id: string) {
    if (done.has(id)) return;
    const skill = skillById[id];
    skill.prerequisites.forEach(master);
    for (const question of skill.questions)
      state.progress = applyAttempt(
        state.progress,
        { skillId: id, questionId: question.id, correct: true, mode: 'learn' },
        now,
      );
    done.add(id);
  }
  skillById[skillId].prerequisites.forEach(master);
  if (completeGoal)
    coursePath(skillById[skillId].courseId).forEach((s) => master(s.id));
  state.activeCourseId = skillById[skillId].courseId;
  if (guest) {
    await page.addInitScript(
      (value) => localStorage.setItem('lessdumb.guest', JSON.stringify(value)),
      state,
    );
    return;
  }
  const response = await page.request.post(`${origin}/api/auth/sign-up/email`, {
    headers: { origin },
    data: {
      name: 'Course QA',
      email: `course-${Date.now()}-${Math.random().toString(16).slice(2)}@example.test`,
      password: 'course-integration-test-123',
    },
  });
  expect(response.status()).toBe(200);
  const owner = (await response.json()).user.id;
  const saved = await page.request.put(`${origin}/api/state`, {
    headers: { origin, 'X-Lessdumb-User': owner },
    data: { state, revision: 0 },
  });
  expect(saved.status()).toBe(200);
}

test('course goals persist and the graph exposes prerequisites across subjects', async ({
  page,
}) => {
  await page.goto('/courses');
  await ready(page);
  const course = page.locator('.ma-catalog-card').filter({
    has: page.getByRole('heading', { name: 'Machine Learning', exact: true }),
  });
  await course.getByRole('button', { name: 'Set learning goal' }).click();
  await expect(course.getByRole('button', { name: 'Selected' })).toBeVisible();
  await page.goto('/');
  await expect(page.getByLabel('CURRENT COURSE')).toHaveValue(
    'machine-learning',
  );
  await page.reload();
  await expect(page.getByLabel('CURRENT COURSE')).toHaveValue(
    'machine-learning',
  );
  await page
    .getByRole('navigation', { name: 'Main navigation' })
    .getByRole('link', { name: 'Knowledge graph', exact: true })
    .click();
  await expect(page.getByLabel('Graph course')).toHaveValue('machine-learning');
  const target = Object.values(skillById).find(
    (s) =>
      s.courseId === 'machine-learning' &&
      s.prerequisites.some((id) => skillById[id].domain === 'mathematics'),
  )!;
  await page.goto(`/graph?skill=${target.id}`);
  await expect(page.locator('.graph-detail h2')).toHaveText(target.title);
  const mathId = target.prerequisites.find(
    (id) => skillById[id].domain === 'mathematics',
  )!;
  await page
    .locator('.graph-detail')
    .getByRole('button')
    .filter({ hasText: skillById[mathId].title })
    .click();
  await expect(page.locator('.graph-detail h2')).toHaveText(
    skillById[mathId].title,
  );
  await expect(page.locator('.graph-course-name')).toHaveText(
    'Quantitative foundations',
  );
  await page.getByLabel('Graph course').selectOption('all');
  await expect(page.locator('.graph-node')).toHaveCount(
    Object.keys(skillById).length,
  );
});

for (const id of ['da-arrays', 'ml-linear-regression']) {
  test(`executes and grades ${id} with its real scientific Python package`, async ({
    page,
  }) => {
    test.setTimeout(90000);
    const skill = skillById[id];
    await seedPrerequisites(page, id);
    await page.goto(`/learn?skill=${id}`);
    await page.getByRole('button', { name: 'Let’s try it' }).click();
    for (const question of skill.questions) {
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
        await page
          .locator('.cm-content')
          .fill((question as CodeQuestion).solution);
        await page
          .getByRole('button', { name: 'Run & check', exact: true })
          .click();
      }
      await expect(
        page.getByText(
          question === skill.questions.at(-1)
            ? 'Skill mastered. A new connection made.'
            : 'That’s a small win.',
          { exact: true },
        ),
      ).toBeVisible({ timeout: 60000 });
      if (question !== skill.questions.at(-1))
        await page
          .getByRole('button', { name: 'Continue', exact: true })
          .click();
    }
    await page
      .getByRole('navigation', { name: 'Main navigation' })
      .getByRole('link', { name: /Flashcards/ })
      .click();
    await expect(
      page
        .getByRole('button', { name: /BREAKTHROUGH/ })
        .filter({ hasText: skill.title }),
    ).toHaveCount(2);
    await page.reload();
    await expect(
      page
        .getByRole('button', { name: /BREAKTHROUGH/ })
        .filter({ hasText: skill.title }),
    ).toHaveCount(2);
  });
}

test('data-systems scenarios teach and earn cards without a code exercise', async ({
  page,
}) => {
  const skill = skillById['ds-workloads'];
  await page.goto(`/learn?skill=${skill.id}`);
  await expect(
    page.getByText('Design scenario', { exact: true }),
  ).toBeVisible();
  await expect(page.getByText('DECISION', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Let’s try it' }).click();
  for (const question of skill.questions) {
    if (question.type !== 'choice')
      throw new Error('Scenario course unexpectedly requires Python');
    await page
      .getByRole('button', {
        name: `${String.fromCharCode(65 + question.answer)} ${question.choices[question.answer]}`,
        exact: true,
      })
      .click();
    await page
      .getByRole('button', { name: 'Check answer', exact: true })
      .click();
    if (question !== skill.questions.at(-1))
      await page.getByRole('button', { name: 'Continue', exact: true }).click();
  }
  await expect(
    page.getByText('Skill mastered. A new connection made.', { exact: true }),
  ).toBeVisible();
  await expect(page.getByRole('button', { name: 'Run & check' })).toHaveCount(
    0,
  );
  await page
    .getByRole('navigation', { name: 'Main navigation' })
    .getByRole('link', { name: /Flashcards/ })
    .click();
  await expect(page.getByRole('button', { name: /BREAKTHROUGH/ })).toHaveCount(
    2,
  );
});

test('leaving a lesson ignores a late real Python grade and locks submitted hints', async ({
  page,
}) => {
  test.setTimeout(60000);
  await page.addInitScript(() => {
    const NativeWorker = window.Worker;
    window.Worker = class extends NativeWorker {
      set onmessage(handler: ((this: Worker, ev: MessageEvent) => any) | null) {
        super.onmessage = (event) => {
          if (typeof event.data?.passed === 'boolean')
            (window as any).__pythonResultObserved = true;
          handler?.call(this, event);
        };
      }
      get onmessage() {
        return super.onmessage;
      }
    };
  });
  await page.goto('/learn');
  await page.getByRole('button', { name: 'Let’s try it' }).click();
  const skill = skillById['print-output'];
  for (const q of skill.questions.filter((q) => q.type === 'choice')) {
    if (q.type !== 'choice') continue;
    await page
      .getByRole('button', {
        name: `${String.fromCharCode(65 + q.answer)} ${q.choices[q.answer]}`,
        exact: true,
      })
      .click();
    await page
      .getByRole('button', { name: 'Check answer', exact: true })
      .click();
    await page.getByRole('button', { name: 'Continue', exact: true }).click();
  }
  const exercise = skill.questions.find(
    (q): q is CodeQuestion => q.type === 'code',
  )!;
  await page.locator('.cm-content').fill(exercise.solution);
  let release!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  let held = false;
  await page.route('**/pyodide/pyodide.asm.wasm', async (route) => {
    held = true;
    await gate;
    await route.continue();
  });
  await page.getByRole('button', { name: 'Run & check' }).click();
  await expect.poll(() => held).toBe(true);
  await expect(
    page.getByRole('button', { name: 'Give me a hint' }),
  ).toBeDisabled();
  await expect(page.locator('.cm-content')).toHaveAttribute(
    'contenteditable',
    'false',
  );
  await page
    .getByRole('navigation', { name: 'Main navigation' })
    .getByRole('link', { name: /Flashcards/ })
    .click();
  release();
  await expect
    .poll(() => page.evaluate(() => (window as any).__pythonResultObserved), {
      timeout: 40000,
    })
    .toBe(true);
  await expect(page.getByRole('button', { name: /BREAKTHROUGH/ })).toHaveCount(
    0,
  );
  await page.reload();
  await expect(page.getByRole('button', { name: /BREAKTHROUGH/ })).toHaveCount(
    0,
  );
});

test('a finished course path opens a caught-up screen and selects its own graph node', async ({
  page,
}) => {
  await seedPrerequisites(page, 'math-mean', true, true);
  await page.goto('/learn');
  await expect(
    page.getByRole('heading', { name: 'A foundation worth building on.' }),
  ).toBeVisible();
  await expect(page.locator('.question-paper')).toHaveCount(0);
  await page.getByRole('link', { name: 'See your growing graph' }).click();
  await expect(page.getByLabel('Graph course')).toHaveValue(
    'quantitative-foundations',
  );
  await expect(page.locator('.graph-detail h2')).toHaveText(
    skillById['math-mean'].title,
  );
});
