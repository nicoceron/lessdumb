import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import { loadPyodide, type PyodideInterface } from 'pyodide';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { basename, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { Worker as NodeWorker } from 'node:worker_threads';
import { skillById, skills, type CodeQuestion } from '../src/lib/curriculum';
import {
  runPython,
  SPARE_RELEASE_MS,
  type PythonResult,
} from '../src/lib/python';
import { pythonExerciseSource } from '../src/components/use-python-spare';
import { pyodideDirectory, pyodideIndexURL } from './helpers/pyodide';

const runtimeUrl = pathToFileURL(resolve('public/python-runtime.mjs')).href;
// Cold scientific Python imports can exceed Vitest's default 5-second budget.
// Await each trusted run before the next test reuses the shared runtime.
const REAL_PYTHON_TEST_TIMEOUT_MS = 30_000;
type ExecutePython = (
  runtime: PyodideInterface,
  code: string,
  tests?: string,
  options?: { timeScale?: number },
) => Promise<PythonResult>;
interface Calibration {
  CALIBRATION_REFERENCE_SECONDS: number;
  MIN_TIME_SCALE: number;
  MAX_TIME_SCALE: number;
  calibrate: (runtime: PyodideInterface) => Promise<number>;
  timeScale: (seconds: unknown) => number;
  usesTimeScale: (tests: string) => boolean;
}
const exercises = skills.flatMap((skill) =>
  skill.questions.filter(
    (question): question is CodeQuestion =>
      question.type === 'code' &&
      (!question.language || question.language === 'python'),
  ),
);

describe('real Pyodide curriculum execution', () => {
  let runtime: PyodideInterface;
  let executePython: ExecutePython;
  beforeAll(async () => {
    runtime = await loadPyodide({ indexURL: pyodideDirectory });
    await runtime.loadPackage(['numpy', 'pandas', 'scikit-learn']);
    executePython = (await import(runtimeUrl)).executePython;
  }, 60_000);

  it('contains a complete set of executable exercise checks', () => {
    expect(exercises.length).toBeGreaterThanOrEqual(20);
  });

  for (const exercise of exercises) {
    it(
      `passes the real solution for ${exercise.id} and rejects an empty submission`,
      async () => {
        expect(
          await executePython(runtime, exercise.solution, exercise.tests),
        ).toMatchObject({ passed: true, error: null, infrastructure: false });
        expect(await executePython(runtime, '', exercise.tests)).toMatchObject({
          passed: false,
          infrastructure: false,
        });
      },
      REAL_PYTHON_TEST_TIMEOUT_MS,
    );
  }

  for (const skill of skills.filter(
    (s) =>
      s.lesson.example.kind !== 'text' &&
      (!s.lesson.example.language || s.lesson.example.language === 'python'),
  )) {
    it(
      `matches the published lesson output for ${skill.id}`,
      async () => {
        const result = await executePython(runtime, skill.lesson.example.code);
        expect(result).toMatchObject({
          passed: true,
          error: null,
          infrastructure: false,
        });
        expect(result.output.trim()).toBe(skill.lesson.example.output.trim());
      },
      REAL_PYTHON_TEST_TIMEOUT_MS,
    );
  }

  it('preserves learner output while reporting failed assertions', async () => {
    expect(
      await executePython(
        runtime,
        'print("before assertion")\nanswer = 3',
        'assert answer == 4, "Expected 4"',
      ),
    ).toEqual({
      output: 'before assertion\n',
      passed: false,
      error: 'AssertionError: Expected 4',
      infrastructure: false,
    });
  });

  it('reports syntax errors and runtime exceptions as learner failures', async () => {
    const syntax = await executePython(runtime, 'if True print("x")');
    expect(syntax).toMatchObject({
      passed: false,
      error: expect.stringContaining('SyntaxError'),
      infrastructure: false,
    });
    expect(await executePython(runtime, 'print("started")\n1 / 0')).toEqual({
      output: 'started\n',
      passed: false,
      error: 'ZeroDivisionError: division by zero',
      infrastructure: false,
    });
  });

  it('captures stderr while excluding hidden-test print output', async () => {
    const result = await executePython(
      runtime,
      'import sys\nprint("stdout")\nprint("stderr", file=sys.stderr)',
      'print("internal test output")\nassert __lessdumb_output == "stdout\\nstderr\\n"',
    );
    expect(result).toEqual({
      output: 'stdout\nstderr\n',
      passed: true,
      error: null,
      infrastructure: false,
    });
  });

  it('uses a fresh learner namespace and replaces forged output variables', async () => {
    await executePython(runtime, 'learner_variable = 42');
    expect(
      await executePython(
        runtime,
        'assert "learner_variable" not in globals()',
      ),
    ).toMatchObject({ passed: true });
    expect(
      await executePython(
        runtime,
        '__lessdumb_output = "fake output"',
        'assert __lessdumb_output == "fake output"',
      ),
    ).toMatchObject({ passed: false, error: 'AssertionError: ' });
  });

  it('bounds captured output during writing and lets subsequent runs succeed', async () => {
    const result = await executePython(
      runtime,
      'for _ in range(1000):\n    print("x" * 1000)',
    );
    expect(result).toMatchObject({ passed: true, infrastructure: false });
    expect(result.output.length).toBe(12_000);
    expect(
      result.output.endsWith('[Output truncated at 12,000 characters.]'),
    ).toBe(true);
    expect(await executePython(runtime, 'print("still works")')).toMatchObject({
      passed: true,
      output: 'still works\n',
    });
  });

  it('returns SystemExit as a failure without terminating the runtime', async () => {
    expect(await executePython(runtime, 'raise SystemExit(2)')).toMatchObject({
      passed: false,
      error: 'SystemExit: 2',
      infrastructure: false,
    });
    expect(await executePython(runtime, 'assert 2 + 2 == 4')).toMatchObject({
      passed: true,
    });
  });

  it('gives the checks the device time scale, which learner code cannot forge', async () => {
    expect(
      await executePython(runtime, '', 'assert __lessdumb_time_scale == 1'),
    ).toMatchObject({ passed: true });
    expect(
      await executePython(
        runtime,
        '__lessdumb_time_scale = 99',
        'assert __lessdumb_time_scale == 2.5',
        { timeScale: 2.5 },
      ),
    ).toMatchObject({ passed: true });
  });

  it('times the fixed calibration benchmark', async () => {
    const { calibrate }: Calibration = await import(runtimeUrl);
    const seconds = await calibrate(runtime);
    expect(seconds).toBeGreaterThan(0);
    expect(seconds).toBeLessThan(5);
  });
});

describe('device calibration', () => {
  let calibration: Calibration;
  beforeAll(async () => {
    calibration = await import(runtimeUrl);
  });

  it('scales limits by the device’s slowness relative to the reference machine', () => {
    const { timeScale, CALIBRATION_REFERENCE_SECONDS: reference } = calibration;
    expect(timeScale(reference)).toBe(1);
    // A device six times slower, such as a low-end phone, gets six times the limit.
    expect(timeScale(reference * 6)).toBe(6);
    expect(timeScale(reference * 2.47)).toBe(2.5);
    // A faster device gets a proportionally shorter one.
    expect(timeScale(reference / 1.5)).toBe(0.7);
  });

  it('clamps extreme measurements and ignores invalid ones', () => {
    const {
      timeScale,
      CALIBRATION_REFERENCE_SECONDS: reference,
      MIN_TIME_SCALE,
      MAX_TIME_SCALE,
    } = calibration;
    expect(MIN_TIME_SCALE).toBe(0.5);
    expect(MAX_TIME_SCALE).toBe(10);
    expect(timeScale(reference / 10)).toBe(MIN_TIME_SCALE);
    expect(timeScale(reference * 40)).toBe(MAX_TIME_SCALE);
    for (const invalid of [0, -1, Number.NaN, Infinity, undefined, '0.1'])
      expect(timeScale(invalid)).toBe(1);
  });

  it('benchmarks only for checks that read the scale', () => {
    const { usesTimeScale } = calibration;
    const timed = exercises.filter((exercise) =>
      exercise.tests.includes('_check_time('),
    );
    expect(timed.length).toBeGreaterThanOrEqual(41);
    for (const exercise of timed)
      expect(usesTimeScale(exercise.tests)).toBe(true);
    expect(usesTimeScale('assert answer == 4')).toBe(false);
  });
});

class MockWorker {
  static instances: MockWorker[] = [];
  static failPost = false;
  onmessage: ((event: { data: any }) => void) | null = null;
  onerror: (() => void) | null = null;
  onmessageerror: (() => void) | null = null;
  /** The run request, if this worker received one. */
  message: {
    id: string;
    code: string;
    tests: string;
    calibration?: number;
  } | null = null;
  /** Every message, in order: preloads, then at most one run. */
  messages: any[] = [];
  terminations = 0;
  constructor(url: string, options: { type: string }) {
    expect(url).toBe('/python-worker.mjs');
    expect(options).toEqual({ type: 'module' });
    MockWorker.instances.push(this);
  }
  postMessage(message: any) {
    if (MockWorker.failPost)
      throw new Error('Worker message could not be sent');
    this.messages.push(message);
    if (message && 'id' in message) this.message = message;
  }
  terminate() {
    this.terminations += 1;
  }
  reply(data: Record<string, unknown>) {
    this.onmessage?.({ data: { id: this.message!.id, ...data } });
  }
}

describe('browser runner lifecycle', () => {
  beforeEach(() => {
    MockWorker.instances = [];
    MockWorker.failPost = false;
    vi.stubGlobal('Worker', MockWorker);
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('creates and terminates a separate worker for each run and ignores unrelated messages', async () => {
    const first = runPython('print(1)');
    const second = runPython('print(2)', 'assert True');
    const [one, two] = MockWorker.instances;
    one.reply({
      id: 'wrong-id',
      output: 'bad',
      passed: true,
      error: null,
      infrastructure: false,
    });
    expect(one.terminations).toBe(0);
    one.reply({
      output: '1\n',
      passed: true,
      error: null,
      infrastructure: false,
    });
    two.reply({
      output: '2\n',
      passed: true,
      error: null,
      infrastructure: false,
    });
    expect(await first).toEqual({
      output: '1\n',
      passed: true,
      error: null,
      infrastructure: false,
    });
    expect(await second).toEqual({
      output: '2\n',
      passed: true,
      error: null,
      infrastructure: false,
    });
    expect(one.message?.id).not.toBe(two.message?.id);
    expect(one.terminations).toBe(1);
    expect(two.terminations).toBe(1);
    one.onerror?.();
    expect(one.terminations).toBe(1);
  });

  it('returns infrastructure failure when worker creation or posting fails', async () => {
    vi.stubGlobal(
      'Worker',
      class {
        constructor() {
          throw new Error('Worker unavailable');
        }
      },
    );
    expect(await runPython('print(1)')).toMatchObject({
      passed: false,
      infrastructure: true,
    });
    vi.stubGlobal('Worker', MockWorker);
    MockWorker.failPost = true;
    expect(await runPython('print(1)')).toMatchObject({
      passed: false,
      infrastructure: true,
    });
    expect(MockWorker.instances[0].terminations).toBe(1);
  });

  it('cancels abandoned work without a mistake or interference with another learner run', async () => {
    vi.useFakeTimers();
    const abandoned = new AbortController();
    abandoned.abort();
    expect(await runPython('print(1)', '', abandoned.signal)).toMatchObject({
      passed: false,
      infrastructure: true,
      error: 'The run was cancelled.',
    });
    expect(MockWorker.instances).toHaveLength(0);
    const controller = new AbortController();
    const first = runPython('while True: pass', '', controller.signal);
    const second = runPython('print(2)');
    const [one, two] = MockWorker.instances;
    one.reply({ ready: true });
    controller.abort();
    one.reply({
      output: 'late',
      passed: true,
      error: null,
      infrastructure: false,
    });
    expect(await first).toMatchObject({ passed: false, infrastructure: true });
    expect(one.terminations).toBe(1);
    expect(two.terminations).toBe(0);
    two.reply({
      output: '2\n',
      passed: true,
      error: null,
      infrastructure: false,
    });
    expect(await second).toMatchObject({ passed: true, output: '2\n' });
    expect(vi.getTimerCount()).toBe(0);
  });

  it('returns infrastructure failure for load errors and malformed worker messages', async () => {
    const failed = runPython('print(1)');
    MockWorker.instances[0].onerror?.();
    expect(await failed).toMatchObject({ passed: false, infrastructure: true });
    const malformed = runPython('print(1)');
    MockWorker.instances[1].reply({ output: 4, passed: true, error: null });
    expect(await malformed).toMatchObject({
      passed: false,
      infrastructure: true,
    });
  });

  it('does not score a runtime download timeout as a learner mistake', async () => {
    vi.useFakeTimers();
    const running = runPython('print(1)');
    await vi.advanceTimersByTimeAsync(30_000);
    expect(await running).toMatchObject({
      passed: false,
      infrastructure: true,
      error: expect.stringContaining('too long to load'),
    });
    expect(MockWorker.instances[0].terminations).toBe(1);
  });

  it('keeps the device calibration for later runs and pages in the same tab', async () => {
    const stored = new Map<string, string>();
    vi.stubGlobal('sessionStorage', {
      getItem: (key: string) => stored.get(key) ?? null,
      setItem: (key: string, value: string) => stored.set(key, value),
    });
    vi.resetModules();
    const { runPython: firstPage } = await import('../src/lib/python');
    const finished = {
      output: '',
      passed: true,
      error: null,
      infrastructure: false,
    };
    const first = firstPage('', 'timed checks');
    const [one] = MockWorker.instances;
    expect(one.message?.calibration).toBeUndefined();
    one.reply({ calibration: 'fast' });
    one.reply({ calibration: 0.075 });
    expect(one.terminations).toBe(0);
    one.reply(finished);
    expect(await first).toEqual(finished);
    const second = firstPage('', 'timed checks');
    expect(MockWorker.instances[1].message?.calibration).toBe(0.075);
    MockWorker.instances[1].reply(finished);
    await second;
    expect(stored.get('lessdumb:python-calibration')).toBe('0.075');

    vi.resetModules();
    const { runPython: nextPage } = await import('../src/lib/python');
    const third = nextPage('', 'timed checks');
    expect(MockWorker.instances[2].message?.calibration).toBe(0.075);
    MockWorker.instances[2].reply(finished);
    await third;
  });

  it('starts a separate execution deadline after Pyodide is ready and terminates infinite runs', async () => {
    vi.useFakeTimers();
    const running = runPython('while True: pass');
    await vi.advanceTimersByTimeAsync(25_000);
    MockWorker.instances[0].reply({ ready: true });
    await vi.advanceTimersByTimeAsync(29_999);
    expect(MockWorker.instances[0].terminations).toBe(0);
    await vi.advanceTimersByTimeAsync(1);
    expect(await running).toMatchObject({
      passed: false,
      infrastructure: false,
      error: expect.stringContaining('Execution timed out'),
    });
    expect(MockWorker.instances[0].terminations).toBe(1);
  });
});

/** Lets the runner prepare its next spare, which it does just after a run. */
const afterRun = () => new Promise<void>((done) => queueMicrotask(done));
const runRequests = (worker: MockWorker) =>
  worker.messages.filter((message) => 'id' in message);
const passedResult = {
  output: '',
  passed: true,
  error: null,
  infrastructure: false,
};

describe('warm spare worker', () => {
  let python: typeof import('../src/lib/python');
  beforeEach(async () => {
    MockWorker.instances = [];
    MockWorker.failPost = false;
    vi.stubGlobal('Worker', MockWorker);
    // Each test starts with a tab that has no spare.
    vi.resetModules();
    python = await import('../src/lib/python');
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('loads Python and the exercise packages before the click, and the run takes that worker', async () => {
    const source = 'import pandas as pd\nassert True';
    const release = python.warmPython(source);
    expect(MockWorker.instances).toHaveLength(1);
    const [spare] = MockWorker.instances;
    expect(spare.messages).toEqual([{ preload: source }]);
    const run = python.runPython('print(1)', 'assert True');
    expect(MockWorker.instances).toHaveLength(1);
    expect(spare.message).toMatchObject({
      code: 'print(1)',
      tests: 'assert True',
    });
    spare.reply({ ready: true });
    spare.reply(passedResult);
    expect(await run).toEqual(passedResult);
    expect(spare.terminations).toBe(1);
    await afterRun();
    // The next spare is already loading for the second check.
    expect(MockWorker.instances).toHaveLength(2);
    const next = MockWorker.instances[1];
    expect(next.messages).toEqual([{ preload: source }]);
    const second = python.runPython('print(2)');
    expect(MockWorker.instances).toHaveLength(2);
    expect(next.message?.code).toBe('print(2)');
    next.reply(passedResult);
    await second;
    expect(next.terminations).toBe(1);
    release();
  });

  it('runs each program in a fresh worker that has never run code, then terminates it', async () => {
    const release = python.warmPython('');
    for (let index = 0; index < 4; index++) {
      await afterRun();
      const run = python.runPython(`print(${index})`);
      const worker = MockWorker.instances.find((candidate) =>
        candidate.messages.some(
          (message) => message.code === `print(${index})`,
        ),
      )!;
      worker.reply(passedResult);
      await run;
    }
    await afterRun();
    for (const worker of MockWorker.instances.slice(0, -1)) {
      expect(runRequests(worker)).toHaveLength(1);
      expect(worker.terminations).toBe(1);
    }
    // The prepared spare has not run anything.
    expect(runRequests(MockWorker.instances.at(-1)!)).toHaveLength(0);
    const runs = MockWorker.instances.flatMap(runRequests);
    expect(new Set(runs.map((message) => message.id)).size).toBe(4);
    release();
  });

  it('keeps one spare per tab and preloads every Python page’s packages into it', () => {
    const lesson = python.warmPython('import numpy as np');
    const lab = python.warmPython('');
    const again = python.warmPython('import numpy as np');
    const pandas = python.warmPython('import pandas as pd');
    expect(MockWorker.instances).toHaveLength(1);
    expect(MockWorker.instances[0].messages).toEqual([
      { preload: 'import numpy as np' },
      { preload: 'import pandas as pd' },
    ]);
    [lesson, lab, again, pandas].forEach((release) => release());
  });

  it('starts no spare on pages without Python, before or after a run', async () => {
    const run = python.runPython('print(1)');
    expect(MockWorker.instances).toHaveLength(1);
    MockWorker.instances[0].reply(passedResult);
    await run;
    await afterRun();
    expect(MockWorker.instances).toHaveLength(1);
  });

  it('terminates the spare shortly after the last Python page closes', async () => {
    vi.useFakeTimers();
    const release = python.warmPython('');
    const [spare] = MockWorker.instances;
    release();
    release();
    await vi.advanceTimersByTimeAsync(SPARE_RELEASE_MS - 1);
    expect(spare.terminations).toBe(0);
    // Another Python page in time keeps the same, already loaded worker.
    const next = python.warmPython('');
    await vi.advanceTimersByTimeAsync(SPARE_RELEASE_MS);
    expect(spare.terminations).toBe(0);
    expect(MockWorker.instances).toHaveLength(1);
    next();
    await vi.advanceTimersByTimeAsync(SPARE_RELEASE_MS);
    expect(spare.terminations).toBe(1);
    // A page closing during a run gets no new spare after it.
    const page = python.warmPython('');
    const controller = new AbortController();
    const run = python.runPython('print(1)', '', controller.signal);
    page();
    controller.abort();
    await run;
    await afterRun();
    expect(MockWorker.instances).toHaveLength(2);
    expect(MockWorker.instances[1].terminations).toBe(1);
    expect(vi.getTimerCount()).toBe(1);
    await vi.advanceTimersByTimeAsync(SPARE_RELEASE_MS);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('keeps the time limits and cancellation, and terminates the worker on each', async () => {
    vi.useFakeTimers();
    const release = python.warmPython('');
    const controller = new AbortController();
    const cancelled = python.runPython(
      'while True: pass',
      '',
      controller.signal,
    );
    const [first] = MockWorker.instances;
    first.reply({ ready: true });
    controller.abort();
    expect(await cancelled).toMatchObject({
      passed: false,
      infrastructure: true,
      error: 'The run was cancelled.',
    });
    expect(first.terminations).toBe(1);
    await afterRun();

    // 30 seconds of execution, counted once Python is ready.
    const looping = python.runPython('while True: pass');
    const second = MockWorker.instances[1];
    expect(second.message?.code).toBe('while True: pass');
    await vi.advanceTimersByTimeAsync(25_000);
    second.reply({ ready: true });
    await vi.advanceTimersByTimeAsync(29_999);
    expect(second.terminations).toBe(0);
    await vi.advanceTimersByTimeAsync(1);
    expect(await looping).toMatchObject({
      passed: false,
      infrastructure: false,
      error: expect.stringContaining('Execution timed out'),
    });
    expect(second.terminations).toBe(1);
    await afterRun();

    // 30 seconds from the click for Python to load, even in a spare.
    const loading = python.runPython('print(1)');
    const third = MockWorker.instances[2];
    expect(third.message?.code).toBe('print(1)');
    await vi.advanceTimersByTimeAsync(29_999);
    expect(third.terminations).toBe(0);
    await vi.advanceTimersByTimeAsync(1);
    expect(await loading).toMatchObject({
      passed: false,
      infrastructure: true,
      error: expect.stringContaining('too long to load'),
    });
    expect(third.terminations).toBe(1);
    await afterRun();
    release();
    await vi.advanceTimersByTimeAsync(SPARE_RELEASE_MS);
    expect(MockWorker.instances).toHaveLength(4);
    for (const worker of MockWorker.instances)
      expect(worker.terminations).toBe(1);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('replaces a spare that fails to load', async () => {
    const release = python.warmPython('');
    const [broken] = MockWorker.instances;
    broken.onerror?.();
    expect(broken.terminations).toBe(1);
    const run = python.runPython('print(1)');
    expect(MockWorker.instances).toHaveLength(2);
    expect(runRequests(broken)).toHaveLength(0);
    MockWorker.instances[1].reply(passedResult);
    expect(await run).toEqual(passedResult);
    release();
  });

  it('reports a failure without a spare when workers cannot start', async () => {
    vi.stubGlobal(
      'Worker',
      class {
        constructor() {
          throw new Error('Worker unavailable');
        }
      },
    );
    const release = python.warmPython('import numpy');
    expect(await python.runPython('print(1)')).toMatchObject({
      passed: false,
      infrastructure: true,
    });
    release();
  });

  it('keeps the device calibration measured once per tab', async () => {
    const stored = new Map<string, string>();
    vi.stubGlobal('sessionStorage', {
      getItem: (key: string) => stored.get(key) ?? null,
      setItem: (key: string, value: string) => stored.set(key, value),
    });
    const release = python.warmPython('');
    const first = python.runPython('', 'timed checks');
    const [one] = MockWorker.instances;
    expect(one.message?.calibration).toBeUndefined();
    one.reply({ calibration: 0.05 });
    one.reply({ ready: true });
    one.reply(passedResult);
    await first;
    await afterRun();
    // Preparing a spare neither measures nor forgets the calibration.
    const two = MockWorker.instances[1];
    expect(two.messages).toEqual([]);
    const second = python.runPython('', 'timed checks');
    expect(two.message?.calibration).toBe(0.05);
    two.reply(passedResult);
    await second;
    expect(stored.get('lessdumb:python-calibration')).toBe('0.05');
    release();

    // Another page in the same tab.
    vi.resetModules();
    const nextPage = await import('../src/lib/python');
    const nextRelease = nextPage.warmPython('');
    const third = nextPage.runPython('', 'timed checks');
    const spare = MockWorker.instances.at(-1)!;
    expect(spare.message?.calibration).toBe(0.05);
    spare.reply(passedResult);
    await third;
    nextRelease();
  });

  it('warms only for skills with a Python exercise, with their authored imports', () => {
    const python = skillById['print-output'];
    const exercise = python.questions.find(
      (question): question is CodeQuestion => question.type === 'code',
    )!;
    expect(pythonExerciseSource(python)).toBe(
      `${exercise.starterCode}\n${exercise.tests}`,
    );
    expect(pythonExerciseSource(skillById['da-series'])).toContain(
      'import pandas as pd',
    );
    const compiled = skills.find((skill) =>
      skill.questions.some(
        (question) => question.type === 'code' && question.language === 'rust',
      ),
    )!;
    expect(pythonExerciseSource(compiled)).toBeNull();
    const withoutCode = skills.find(
      (skill) => !skill.questions.some((question) => question.type === 'code'),
    );
    if (withoutCode) expect(pythonExerciseSource(withoutCode)).toBeNull();
    expect(pythonExerciseSource(undefined)).toBeNull();
  });
});

describe('versioned Python runtime', () => {
  it('serves Pyodide from one immutable directory named for its version and packages', () => {
    const { version } = JSON.parse(
      readFileSync(resolve('node_modules/pyodide/package.json'), 'utf8'),
    );
    expect(pyodideIndexURL).toMatch(
      new RegExp(`^/pyodide/${version.replaceAll('.', '\\.')}-[0-9a-f]{10}/$`),
    );
    for (const file of [
      'pyodide.mjs',
      'pyodide.asm.mjs',
      'pyodide.asm.wasm',
      'python_stdlib.zip',
      'pyodide-lock.json',
    ])
      expect(existsSync(`${pyodideDirectory}${file}`), file).toBe(true);
    const lock = JSON.parse(
      readFileSync(`${pyodideDirectory}pyodide-lock.json`, 'utf8'),
    );
    for (const item of Object.values<{ file_name: string }>(lock.packages))
      expect(existsSync(`${pyodideDirectory}${item.file_name}`)).toBe(true);
    // Only the current runtime is deployed.
    expect(readdirSync(resolve('public/pyodide')).sort()).toEqual([
      basename(pyodideDirectory),
      'current.mjs',
    ]);
    const worker = readFileSync(resolve('public/python-worker.mjs'), 'utf8');
    expect(worker).toContain(
      "import { indexURL, loadPyodide } from '/pyodide/current.mjs';",
    );
    expect(worker).toContain('loadPyodide({ indexURL })');
    expect(worker.match(/\/pyodide\//g)).toHaveLength(1);
  });

  it('caches the versioned directory as immutable and keeps the other headers', () => {
    const headers = readFileSync(resolve('public/_headers'), 'utf8');
    const rules = new Map(
      headers
        .split(/\n\s*\n/)
        .map((block) =>
          block
            .split('\n')
            .filter((line) => line.trim() && !line.startsWith('#')),
        )
        .filter((lines) => lines.length)
        .map(([path, ...values]) => [path, values.map((v) => v.trim())]),
    );
    expect(rules.get('/pyodide/:version/*')).toEqual([
      'Cache-Control: public, max-age=31536000, immutable',
    ]);
    for (const [path, type] of [
      ['/llms.txt', 'text/markdown'],
      ['/robots.txt', 'text/plain'],
      ['/catalog.md', 'text/markdown'],
      ['/catalog/*.md', 'text/markdown'],
    ])
      expect(rules.get(path)).toEqual([`Content-Type: ${type}; charset=utf-8`]);
    // A placeholder stops at "/", so the revalidated pointer to the current
    // directory is not cached as immutable.
    const immutable = /^\/pyodide\/[^/]+\/.*$/;
    expect(immutable.test(pyodideIndexURL + 'pyodide.asm.wasm')).toBe(true);
    expect(immutable.test('/pyodide/current.mjs')).toBe(false);
    expect(
      [...rules.keys()].filter((path) => path.startsWith('/pyodide')),
    ).toEqual(['/pyodide/:version/*']);
  });
});

/** /pyodide/current.mjs for Node: the same directory, as a file path. */
const currentRuntimeForNode = `data:text/javascript;charset=utf-8,${encodeURIComponent(
  `export const indexURL = ${JSON.stringify(pyodideDirectory)};\n` +
    `export { loadPyodide } from ${JSON.stringify(pathToFileURL(`${pyodideDirectory}pyodide.mjs`).href)};`,
)}`;

/** Browser URLs and Worker messaging are adapted to Node; production worker logic is unchanged. */
class RealNodeBrowserWorker {
  static instances: RealNodeBrowserWorker[] = [];
  onmessage: ((event: { data: any }) => void) | null = null;
  onerror: (() => void) | null = null;
  onmessageerror: (() => void) | null = null;
  readonly ready: Promise<void>;
  readonly terminated: Promise<number>;
  /** Messages the page sent and the worker posted back, in order. */
  readonly sent: any[] = [];
  readonly posted: any[] = [];
  private readonly nodeWorker: NodeWorker;
  private reportReady!: () => void;
  private reportTermination!: (code: number) => void;

  constructor() {
    this.ready = new Promise((resolveReady) => {
      this.reportReady = resolveReady;
    });
    this.terminated = new Promise((resolveTermination) => {
      this.reportTermination = resolveTermination;
    });
    const workerSource = readFileSync(
      resolve('public/python-worker.mjs'),
      'utf8',
    )
      .replace(
        "from '/pyodide/current.mjs'",
        `from ${JSON.stringify(currentRuntimeForNode)}`,
      )
      .replace(
        "from './python-runtime.mjs'",
        `from ${JSON.stringify(runtimeUrl)}`,
      );
    const workerModule = `data:text/javascript;charset=utf-8,${encodeURIComponent(workerSource)}`;
    // Pyodide prints package-loading messages to stdout (the console in a
    // browser); a Node worker thread has no stdout descriptor, so they are
    // discarded here.
    const bootstrap = `
      import { parentPort } from 'node:worker_threads';
      import { openSync } from 'node:fs';
      import { devNull } from 'node:os';
      Object.defineProperty(process.stdout, 'fd', { value: openSync(devNull, 'w') });
      globalThis.self = { postMessage(data) { parentPort.postMessage(data); } };
      await import(${JSON.stringify(workerModule)});
      parentPort.on('message', (data) => self.onmessage({ data }));
    `;
    this.nodeWorker = new NodeWorker(
      new URL(
        `data:text/javascript;charset=utf-8,${encodeURIComponent(bootstrap)}`,
      ),
    );
    this.nodeWorker.on('message', (data) => {
      this.posted.push(data);
      this.onmessage?.({ data });
      if (data.ready) this.reportReady();
    });
    this.nodeWorker.on('error', () => this.onerror?.());
    this.nodeWorker.on('exit', (code) => this.reportTermination(code));
    RealNodeBrowserWorker.instances.push(this);
  }
  postMessage(data: unknown) {
    this.sent.push(data);
    this.nodeWorker.postMessage(data);
  }
  terminate() {
    void this.nodeWorker.terminate();
  }
}

describe('real production worker isolation and termination', () => {
  beforeEach(() => {
    RealNodeBrowserWorker.instances = [];
    vi.stubGlobal('Worker', RealNodeBrowserWorker);
  });
  afterEach(async () => {
    vi.useRealTimers();
    for (const worker of RealNodeBrowserWorker.instances) worker.terminate();
    await Promise.all(
      RealNodeBrowserWorker.instances.map((worker) => worker.terminated),
    );
    vi.unstubAllGlobals();
  });

  it('isolates modified modules and written files between actual runs', async () => {
    expect(
      await runPython(
        'import builtins\nbuiltins.lessdumb_leak = 99\nwith open("lessdumb_leak.txt", "w") as file:\n    file.write("test")',
      ),
    ).toMatchObject({ passed: true, infrastructure: false });
    expect(
      await runPython(
        'import builtins, os\nassert not hasattr(builtins, "lessdumb_leak")\nassert not os.path.exists("lessdumb_leak.txt")\nprint("isolated")',
      ),
    ).toEqual({
      output: 'isolated\n',
      passed: true,
      error: null,
      infrastructure: false,
    });
  }, 30_000);

  it('terminates a real infinite Python loop and allows the next run to work', async () => {
    vi.useFakeTimers();
    const running = runPython('while True:\n    pass');
    const worker = RealNodeBrowserWorker.instances[0];
    await worker.ready;
    await vi.advanceTimersByTimeAsync(30_000);
    expect(await running).toMatchObject({
      passed: false,
      infrastructure: false,
      error: expect.stringContaining('Execution timed out'),
    });
    await worker.terminated;
    vi.useRealTimers();
    expect(await runPython('print(6 * 7)')).toMatchObject({
      passed: true,
      output: '42\n',
    });
  }, 30_000);

  it('benchmarks the device once for timed checks and reuses the measurement', async () => {
    vi.stubGlobal('sessionStorage', undefined);
    vi.resetModules();
    const { runPython: fresh } = await import('../src/lib/python');
    const timed = 'assert 0.5 <= __lessdumb_time_scale <= 10';
    expect(await fresh('print(1)')).toMatchObject({ passed: true });
    expect(await fresh('', timed)).toMatchObject({ passed: true });
    expect(await fresh('', timed)).toMatchObject({ passed: true });
    const [untimed, first, second] = RealNodeBrowserWorker.instances;
    const measured = (worker: RealNodeBrowserWorker) =>
      worker.posted.filter((message) => 'calibration' in message);
    expect(measured(untimed)).toEqual([]);
    expect(first.sent[0].calibration).toBeUndefined();
    const [{ calibration }] = measured(first);
    expect(calibration).toBeGreaterThan(0);
    expect(second.sent[0].calibration).toBe(calibration);
    expect(measured(second)).toEqual([]);
  }, 60_000);
  it('runs in a warm spare that preloaded the exercise packages, isolated from earlier runs', async () => {
    vi.resetModules();
    const pool = await import('../src/lib/python');
    const release = pool.warmPython('import numpy as np');
    const [spare] = RealNodeBrowserWorker.instances;
    expect(spare.sent).toEqual([{ preload: 'import numpy as np' }]);
    expect(
      await pool.runPython(
        'import builtins\nbuiltins.lessdumb_leak = 1\nimport numpy as np\nprint(int(np.arange(4).sum()))',
      ),
    ).toEqual({
      output: '6\n',
      passed: true,
      error: null,
      infrastructure: false,
    });
    await spare.terminated;
    await afterRun();
    const next = RealNodeBrowserWorker.instances[1];
    expect(next.sent).toEqual([{ preload: 'import numpy as np' }]);
    expect(
      await pool.runPython(
        'import builtins\nassert not hasattr(builtins, "lessdumb_leak")\nprint("isolated")',
      ),
    ).toEqual({
      output: 'isolated\n',
      passed: true,
      error: null,
      infrastructure: false,
    });
    expect(next.sent.filter((message) => 'id' in message)).toHaveLength(1);
    release();
  }, 60_000);

  it('refuses a second program in a worker that has already run code', async () => {
    const worker = new RealNodeBrowserWorker();
    const results: any[] = [];
    const done = new Promise<void>((resolveDone) => {
      worker.onmessage = ({ data }) => {
        if (!('passed' in data)) return;
        results.push(data);
        if (results.length === 2) resolveDone();
      };
    });
    worker.postMessage({
      id: 'first',
      code: 'secret = 1\nprint(1)',
      tests: '',
    });
    worker.postMessage({ id: 'second', code: 'print(secret)', tests: '' });
    await done;
    expect(results.find((result) => result.id === 'first')).toMatchObject({
      passed: true,
      output: '1\n',
    });
    expect(results.find((result) => result.id === 'second')).toMatchObject({
      passed: false,
      infrastructure: true,
      error: expect.stringContaining('already run code'),
    });
  }, 30_000);
});
