import { expect, test, type Page } from '@playwright/test';
import { skillById, type CodeQuestion } from '../src/lib/curriculum';
import { coursePath } from '../src/lib/learning';
import { createState } from '../src/lib/state';
import { signUp } from './helpers/accounts';
import { replaceCode } from './helpers/editor';
import {
  answerChoice,
  answerShown,
  completeLesson,
  continueLesson,
  feedback,
} from './helpers/lesson';
import { masterSkill } from './helpers/mastery';
import {
  chooseCourse,
  expectActiveCourse,
  openFromMenu,
} from './helpers/navigation';
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
    state.progress = masterSkill(state.progress, id, now);
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
  const response = await signUp(page.request, origin, {
    name: 'Course QA',
    email: `course-${Date.now()}-${Math.random().toString(16).slice(2)}@example.test`,
    password: 'course-integration-test-123',
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
  await chooseCourse(page, 'Machine Learning');
  await page.goto('/');
  await expectActiveCourse(page, 'Machine Learning');
  await page.reload();
  await expectActiveCourse(page, 'Machine Learning');
  await openFromMenu(page, 'Knowledge graph');
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
    if (skill.knowledgePoints) {
      // Points pass with two correct answers each; the scientific Python
      // exercise then completes the lesson.
      await page
        .getByRole('button', { name: 'Start lesson', exact: true })
        .click();
      for (const point of skill.knowledgePoints)
        for (let index = 0; index < 2; index++) {
          await answerShown(page, point.questions);
          await expect(feedback(page)).toContainText('Correct');
          await continueLesson(page);
        }
      await answerShown(
        page,
        skill.questions.filter((question) => question.type === 'code'),
      );
      await expect(feedback(page)).toContainText('Lesson complete', {
        timeout: 60000,
      });
    } else {
      await page.getByRole('button', { name: 'Let’s try it' }).click();
      for (const question of skill.questions) {
        if (question.type === 'choice') await answerChoice(page, question);
        else {
          await replaceCode(page, (question as CodeQuestion).solution);
          await page
            .getByRole('button', { name: 'Run & check', exact: true })
            .click();
        }
        await expect(feedback(page)).toContainText(
          question === skill.questions.at(-1) ? 'Lesson complete' : 'Correct',
          { timeout: 60000 },
        );
        if (question !== skill.questions.at(-1)) await continueLesson(page);
      }
    }
    await openFromMenu(page, /Flashcards/);
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
  await page.getByRole('button', { name: 'Start lesson', exact: true }).click();
  // Each point's worked example is a design scenario with a decision, shown
  // as text rather than as a program.
  const point = skill.knowledgePoints![0];
  expect(point.example.kind).toBe('text');
  const teaching = page.locator('.lesson-point');
  await expect(
    teaching.getByText(point.example.label ?? 'SCENARIO', { exact: true }),
  ).toBeVisible();
  await expect(teaching.getByText('Decision', { exact: true })).toBeVisible();
  await expect(
    teaching.getByText(point.example.output, { exact: true }),
  ).toBeVisible();
  expect(
    skill.knowledgePoints!.every((item) =>
      item.questions.every((question) => question.type === 'choice'),
    ),
  ).toBe(true);
  await completeLesson(page, skill, { started: true });
  await expect(feedback(page)).toContainText('Lesson complete');
  await expect(page.locator('.cm-content')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Run & check' })).toHaveCount(
    0,
  );
  await openFromMenu(page, /Flashcards/);
  await expect(page.getByRole('button', { name: /BREAKTHROUGH/ })).toHaveCount(
    2,
  );
});

test('leaving a lesson cancels its real Python worker and locks the submitted code', async ({
  page,
}) => {
  test.setTimeout(60000);
  await page.addInitScript(() => {
    const NativeWorker = window.Worker;
    window.Worker = class extends NativeWorker {
      terminate() {
        (window as any).__pythonWorkersTerminated =
          ((window as any).__pythonWorkersTerminated ?? 0) + 1;
        super.terminate();
      }
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
  await page.getByRole('button', { name: 'Start lesson' }).click();
  const skill = skillById['print-output'];
  for (const point of skill.knowledgePoints!)
    for (let index = 0; index < 2; index++) {
      await answerShown(page, point.questions);
      await continueLesson(page);
    }
  const exercise = skill.questions.find(
    (q): q is CodeQuestion => q.type === 'code',
  )!;
  await replaceCode(page, exercise.solution);
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
    page.getByRole('button', { name: /Running Python/ }),
  ).toBeDisabled();
  await expect(page.locator('.cm-content')).toHaveAttribute(
    'contenteditable',
    'false',
  );
  await openFromMenu(page, /Flashcards/);
  release();
  await expect
    .poll(() => page.evaluate(() => (window as any).__pythonWorkersTerminated))
    .toBe(1);
  expect(
    await page.evaluate(() => (window as any).__pythonResultObserved),
  ).not.toBe(true);
  const saved = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('lessdumb.guest')!),
  );
  // Both points passed in this attempt; nothing is evidence until the code runs.
  expect(
    Object.keys(saved.progress.skills[skill.id].lessonAttempt.steps),
  ).toEqual(skill.knowledgePoints!.map((point) => point.id));
  expect(saved.progress.skills[skill.id].questionIds).toEqual([]);
  expect(saved.progress.skills[skill.id].memory).toBeUndefined();
  expect(saved.progress.totalXp).toBe(0);
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
