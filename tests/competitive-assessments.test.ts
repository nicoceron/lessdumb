import { availableParallelism } from 'node:os';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { Worker } from 'node:worker_threads';
import { beforeAll, describe, expect, it } from 'vitest';
import { skillById, type CodeQuestion } from '../src/lib/curriculum';
import {
  TIME_LIMIT_SECONDS,
  withLargeCase,
} from '../src/lib/courses/competitive/shared';
import { shortcuts } from './helpers/competitive-shortcuts';

// Every hardened Competitive Programming exercise must accept its reference
// solution and reject the brute-force or shortcut solutions that passed the
// old small-input checks. Each run uses a fresh Pyodide worker, like the
// browser runner, so a run can be stopped and disabled shortcuts never leak.
//
// The browser scales each time limit by the device's measured slowness
// (public/python-runtime.mjs). These runs pass that scale explicitly so they
// stay deterministic. A simulated slow device runs the same work with a clock
// that reports six times the elapsed time and a matching scale of 6.

type Outcome =
  | { passed: boolean; error: string | null; seconds: number }
  | { stopped: true; seconds: number };

interface Device {
  /** The calibrated limit multiplier the runner would pass. */
  timeScale: number;
  /** How many times slower than this machine the simulated device runs. */
  slowdown: number;
}
const thisMachine: Device = { timeScale: 1, slowdown: 1 };
const slowPhone: Device = { timeScale: 6, slowdown: 6 };

const pyodide = `${resolve('public/pyodide')}/`;
const bootstrap = `
  import { parentPort } from 'node:worker_threads';
  import { loadPyodide } from ${JSON.stringify(pathToFileURL(`${pyodide}pyodide.mjs`).href)};
  import { executePython } from ${JSON.stringify(pathToFileURL(resolve('public/python-runtime.mjs')).href)};
  const runtime = await loadPyodide({ indexURL: ${JSON.stringify(pyodide)} });
  parentPort.on('message', async ({ code, tests, timeScale, slowdown }) => {
    if (slowdown !== 1)
      runtime.runPython(\`import time
_ld_clock = time.perf_counter
time.perf_counter = lambda: _ld_clock() * \${slowdown}\`);
    const started = performance.now();
    const result = await executePython(runtime, code, tests, { timeScale });
    parentPort.postMessage({ ...result, seconds: (performance.now() - started) / 1000 });
  });
  parentPort.postMessage('loaded');
`;

/** Runs one submission and stops it once it has used `limit` seconds. */
function run(
  code: string,
  tests: string,
  limit: number,
  device = thisMachine,
): Promise<Outcome> {
  return new Promise((settle, fail) => {
    const worker = new Worker(
      new URL(`data:text/javascript,${encodeURIComponent(bootstrap)}`),
    );
    let timer: ReturnType<typeof setTimeout> | undefined;
    worker.on('error', fail);
    worker.on('message', (message) => {
      if (message === 'loaded') {
        worker.postMessage({ code, tests, ...device });
        timer = setTimeout(() => {
          void worker.terminate();
          settle({ stopped: true, seconds: limit });
        }, limit * 1000);
        return;
      }
      clearTimeout(timer);
      void worker.terminate();
      settle(message);
    });
  });
}

/** The tests before the hidden large case: correctness checks only. */
const smallChecks = (tests: string) =>
  tests.split(/\n\n *import time as _time\n/)[0];

/** The case's own base limit when it sets one, else the shared limit. */
const baseLimit = (tests: string) =>
  Number(
    /_check_time\(_seconds, .*, (\d+(?:\.\d+)?)\)$/m.exec(tests)?.[1] ??
      TIME_LIMIT_SECONDS,
  );

/** Python's `{limit:.3g}`, as the failure message prints it. */
const shown = (seconds: number) => String(Number(seconds.toPrecision(3)));

const codeQuestion = (id: string) =>
  skillById[id].questions.find(
    (question): question is CodeQuestion => question.type === 'code',
  )!;

interface Report {
  reference: Outcome;
  slowReference: Outcome;
  variants: { small?: Outcome; full: Outcome }[];
}
const reports = new Map<string, Report>();

async function check(id: string): Promise<Report> {
  const question = codeQuestion(id);
  const reference = await run(question.solution, question.tests, 30);
  const slowReference = await run(
    question.solution,
    question.tests,
    30,
    slowPhone,
  );
  // A brute force that is still running once the reference's own work plus
  // the whole time limit has passed must have exceeded the limit.
  const deadline = reference.seconds + TIME_LIMIT_SECONDS + 1;
  const variants = [];
  for (const variant of shortcuts[id])
    variants.push({
      small:
        variant.rejectedBy === 'time'
          ? await run(variant.code, smallChecks(question.tests), 60)
          : undefined,
      full: await run(variant.code, question.tests, deadline),
    });
  return { reference, slowReference, variants };
}

describe('the scaled time limit', () => {
  const timedCheck = (seconds: number, base?: number) =>
    withLargeCase(
      '',
      `_check_time(${seconds}, "The case", "Use the faster idea."${base ? `, ${base}` : ''})`,
    );

  it('multiplies the limit by the device scale and reports it', async () => {
    expect(
      await run('', timedCheck(17.9), 30, { timeScale: 6, slowdown: 1 }),
    ).toMatchObject({ passed: true, error: null });
    expect(await run('', timedCheck(17.9), 30)).toMatchObject({
      passed: false,
      error:
        'AssertionError: The case took 17.9 s; the limit on this device is 3 s. Use the faster idea.',
    });
    expect(
      await run('', timedCheck(20), 30, { timeScale: 6, slowdown: 1 }),
    ).toMatchObject({
      passed: false,
      error:
        'AssertionError: The case took 20.0 s; the limit on this device is 18 s. Use the faster idea.',
    });
  });

  it('scales a case’s own base limit, including below one on a fast device', async () => {
    expect(
      await run('', timedCheck(0.8, 1.5), 30, { timeScale: 0.5, slowdown: 1 }),
    ).toMatchObject({
      passed: false,
      error: expect.stringContaining('the limit on this device is 0.75 s.'),
    });
    expect(
      await run('', timedCheck(8.9, 1.5), 30, { timeScale: 6, slowdown: 1 }),
    ).toMatchObject({ passed: true, error: null });
  });
});

describe('competitive assessments reject brute force', () => {
  beforeAll(async () => {
    const pending = Object.keys(shortcuts);
    const workers = Math.max(2, Math.min(8, availableParallelism() - 2));
    await Promise.all(
      Array.from({ length: workers }, async () => {
        for (let id = pending.shift(); id; id = pending.shift())
          reports.set(id, await check(id));
      }),
    );
  }, 900_000);

  it('covers every exercise with a hidden large case or a disabled shortcut', () => {
    const hardened = Object.values(skillById)
      .filter((skill) => skill.courseId === 'competitive-programming')
      .filter((skill) =>
        /_check_time|_without|_python_calls/.test(codeQuestion(skill.id).tests),
      )
      .map((skill) => skill.id);
    expect(Object.keys(shortcuts).sort()).toEqual(hardened.sort());
  });

  for (const [id, variants] of Object.entries(shortcuts))
    it(`${id}: the reference passes, also on a simulated 6× slower device; ${variants.map((variant) => variant.idea).join('; ')} fails`, () => {
      const report = reports.get(id)!;
      const base = baseLimit(codeQuestion(id).tests);
      expect(report.reference, 'reference').toMatchObject({
        passed: true,
        error: null,
      });
      expect(report.reference.seconds).toBeLessThan(TIME_LIMIT_SECONDS);
      // Six times the work against a limit calibrated six times longer.
      expect(report.slowReference, 'reference on a slow device').toMatchObject({
        passed: true,
        error: null,
      });
      variants.forEach((variant, index) => {
        const { small, full } = report.variants[index];
        if (variant.rejectedBy === 'time') {
          // A correct solution: it passes every small check...
          expect(small, variant.idea).toMatchObject({ passed: true });
          // ...but is stopped, or fails the time limit, on the large case.
          if (!('stopped' in full))
            expect(full.error, variant.idea).toMatch(
              `the limit on this device is ${shown(base)} s`,
            );
        } else
          expect(full, variant.idea).toMatchObject({
            passed: false,
            error: expect.stringMatching(
              /disabled during the checks|Python call\(s\)/,
            ),
          });
      });
    });
});
