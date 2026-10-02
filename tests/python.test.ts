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
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { Worker as NodeWorker } from 'node:worker_threads';
import { skills, type CodeQuestion } from '../src/lib/curriculum';
import { runPython, type PythonResult } from '../src/lib/python';

const pyodideDirectory = `${resolve('public/pyodide')}/`;
const runtimeUrl = pathToFileURL(resolve('public/python-runtime.mjs')).href;
type ExecutePython = (
  runtime: PyodideInterface,
  code: string,
  tests?: string,
) => Promise<PythonResult>;
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
    it(`passes the real solution for ${exercise.id} and rejects an empty submission`, async () => {
      expect(
        await executePython(runtime, exercise.solution, exercise.tests),
      ).toMatchObject({ passed: true, error: null, infrastructure: false });
      expect(await executePython(runtime, '', exercise.tests)).toMatchObject({
        passed: false,
        infrastructure: false,
      });
    });
  }

  for (const skill of skills.filter(
    (s) =>
      s.lesson.example.kind !== 'text' &&
      (!s.lesson.example.language || s.lesson.example.language === 'python'),
  )) {
    it(`matches the published lesson output for ${skill.id}`, async () => {
      const result = await executePython(runtime, skill.lesson.example.code);
      expect(result).toMatchObject({
        passed: true,
        error: null,
        infrastructure: false,
      });
      expect(result.output.trim()).toBe(skill.lesson.example.output.trim());
    });
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
});

class MockWorker {
  static instances: MockWorker[] = [];
  static failPost = false;
  onmessage: ((event: { data: any }) => void) | null = null;
  onerror: (() => void) | null = null;
  onmessageerror: (() => void) | null = null;
  message: { id: string; code: string; tests: string } | null = null;
  terminations = 0;
  constructor(url: string, options: { type: string }) {
    expect(url).toBe('/python-worker.mjs');
    expect(options).toEqual({ type: 'module' });
    MockWorker.instances.push(this);
  }
  postMessage(message: typeof this.message) {
    if (MockWorker.failPost)
      throw new Error('Worker message could not be sent');
    this.message = message;
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

/** Browser URLs and Worker messaging are adapted to Node; production worker logic is unchanged. */
class RealNodeBrowserWorker {
  static instances: RealNodeBrowserWorker[] = [];
  onmessage: ((event: { data: any }) => void) | null = null;
  onerror: (() => void) | null = null;
  onmessageerror: (() => void) | null = null;
  readonly ready: Promise<void>;
  readonly terminated: Promise<number>;
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
        "from '/pyodide/pyodide.mjs'",
        `from ${JSON.stringify(pathToFileURL(`${pyodideDirectory}pyodide.mjs`).href)}`,
      )
      .replace(
        "from './python-runtime.mjs'",
        `from ${JSON.stringify(runtimeUrl)}`,
      )
      .replace(
        "indexURL: '/pyodide/'",
        `indexURL: ${JSON.stringify(pyodideDirectory)}`,
      );
    const workerModule = `data:text/javascript;charset=utf-8,${encodeURIComponent(workerSource)}`;
    const bootstrap = `
      import { parentPort } from 'node:worker_threads';
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
      this.onmessage?.({ data });
      if (data.ready) this.reportReady();
    });
    this.nodeWorker.on('error', () => this.onerror?.());
    this.nodeWorker.on('exit', (code) => this.reportTermination(code));
    RealNodeBrowserWorker.instances.push(this);
  }
  postMessage(data: unknown) {
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
});
