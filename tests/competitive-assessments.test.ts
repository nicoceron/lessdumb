import { availableParallelism } from 'node:os';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { Worker } from 'node:worker_threads';
import { beforeAll, describe, expect, it } from 'vitest';
import { skillById, type CodeQuestion } from '../src/lib/curriculum';
import { TIME_LIMIT_SECONDS } from '../src/lib/courses/competitive/shared';
import { shortcuts } from './helpers/competitive-shortcuts';

// Every hardened Competitive Programming exercise must accept its reference
// solution and reject the brute-force or shortcut solutions that passed the
// old small-input checks. Each run uses a fresh Pyodide worker, like the
// browser runner, so a run can be stopped and disabled shortcuts never leak.

type Outcome =
  | { passed: boolean; error: string | null; seconds: number }
  | { stopped: true; seconds: number };

const pyodide = `${resolve('public/pyodide')}/`;
const bootstrap = `
  import { parentPort } from 'node:worker_threads';
  import { loadPyodide } from ${JSON.stringify(pathToFileURL(`${pyodide}pyodide.mjs`).href)};
  import { executePython } from ${JSON.stringify(pathToFileURL(resolve('public/python-runtime.mjs')).href)};
  const runtime = await loadPyodide({ indexURL: ${JSON.stringify(pyodide)} });
  parentPort.on('message', async ({ code, tests }) => {
    const started = performance.now();
    const result = await executePython(runtime, code, tests);
    parentPort.postMessage({ ...result, seconds: (performance.now() - started) / 1000 });
  });
  parentPort.postMessage('loaded');
`;

/** Runs one submission and stops it once it has used `limit` seconds. */
function run(code: string, tests: string, limit: number): Promise<Outcome> {
  return new Promise((settle, fail) => {
    const worker = new Worker(
      new URL(`data:text/javascript,${encodeURIComponent(bootstrap)}`),
    );
    let timer: ReturnType<typeof setTimeout> | undefined;
    worker.on('error', fail);
    worker.on('message', (message) => {
      if (message === 'loaded') {
        worker.postMessage({ code, tests });
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

const codeQuestion = (id: string) =>
  skillById[id].questions.find(
    (question): question is CodeQuestion => question.type === 'code',
  )!;

interface Report {
  reference: Outcome;
  variants: { small?: Outcome; full: Outcome }[];
}
const reports = new Map<string, Report>();

async function check(id: string): Promise<Report> {
  const question = codeQuestion(id);
  const reference = await run(question.solution, question.tests, 30);
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
  return { reference, variants };
}

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
    it(`${id}: the reference passes; ${variants.map((variant) => variant.idea).join('; ')} fails`, () => {
      const report = reports.get(id)!;
      expect(report.reference, 'reference').toMatchObject({
        passed: true,
        error: null,
      });
      expect(report.reference.seconds).toBeLessThan(TIME_LIMIT_SECONDS);
      variants.forEach((variant, index) => {
        const { small, full } = report.variants[index];
        if (variant.rejectedBy === 'time') {
          // A correct solution: it passes every small check...
          expect(small, variant.idea).toMatchObject({ passed: true });
          // ...but is stopped, or fails the time limit, on the large case.
          if (!('stopped' in full))
            expect(full.error, variant.idea).toMatch(
              `the limit is ${TIME_LIMIT_SECONDS} s`,
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
