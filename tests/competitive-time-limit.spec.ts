import { expect, test } from '@playwright/test';
import { skillById, type CodeQuestion } from '../src/lib/curriculum';

// A low-end phone runs Pyodide several times slower than a laptop. Chrome's
// CPU throttling emulates that, but CDP applies it to pages only ("Operation
// is only supported for pages, not workers"), so this harness loads the
// worker's own Pyodide build and python-runtime.mjs into the page and runs
// the same calibration and checks there.

const timed = Object.values(skillById)
  .filter((skill) => skill.courseId === 'competitive-programming')
  .flatMap((skill) =>
    skill.questions.filter(
      (question): question is CodeQuestion =>
        question.type === 'code' && question.tests.includes('_check_time('),
    ),
  );

test('every timed reference passes on a 6× throttled CPU with the calibrated limit', async ({
  page,
  context,
}) => {
  test.setTimeout(600_000);
  expect(timed).toHaveLength(41);
  await page.goto('/robots.txt');
  // Load at full speed; calibration and grading run throttled, as on a phone.
  await page.evaluate(async () => {
    const { loadPyodide } = await import('/pyodide/pyodide.mjs' as string);
    const runtime = await import('/python-runtime.mjs' as string);
    Object.assign(globalThis, {
      __python: await loadPyodide({ indexURL: '/pyodide/' }),
      __runtime: runtime,
    });
  });
  const cdp = await context.newCDPSession(page);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 6 });
  try {
    const scale = await page.evaluate(async () => {
      const { __python: python, __runtime: runtime } = globalThis as any;
      return runtime.timeScale(await runtime.calibrate(python));
    });
    // The benchmark sees the slowdown, so the limit grows with it.
    expect(scale).toBeGreaterThanOrEqual(3);
    for (const question of timed) {
      const result = await page.evaluate(
        ({ code, tests, scale }) => {
          const { __python: python, __runtime: runtime } = globalThis as any;
          return runtime.executePython(python, code, tests, {
            timeScale: scale,
          });
        },
        { code: question.solution, tests: question.tests, scale },
      );
      expect(result, question.id).toMatchObject({ passed: true, error: null });
    }
  } finally {
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
  }
});
