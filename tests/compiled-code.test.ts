import { afterEach, describe, expect, it, vi } from 'vitest';
import { skills, type Skill } from '../src/lib/curriculum';
import type { Backend } from '../src/lib/server/backend';
import {
  compilerResult,
  createCompiledCodeService,
  COMPILED_CODE_LIMITS,
} from '../src/lib/server/compiled-code';
import { runCode } from '../src/lib/code-runner';
import { runPython } from '../src/lib/python';

vi.mock('../src/lib/python', () => ({
  runPython: vi.fn().mockResolvedValue({
    output: 'python',
    passed: true,
    error: null,
    infrastructure: false,
  }),
}));

const baseURL = 'http://localhost:4321';
const success = {
  code: 0,
  didExecute: true,
  timedOut: false,
  stdout: [{ text: '42' }],
  stderr: [],
  buildResult: { code: 0, stdout: [], stderr: [] },
};
const passed = {
  output: '42',
  passed: true,
  error: null,
  infrastructure: false,
};

function fixture(language: 'cpp' | 'rust'): Skill {
  const id = `compiled-${language}`;
  return {
    id,
    courseId: `${language}-foundations`,
    domain: 'programming',
    unitId: `${language}-values`,
    title: 'A tiny function',
    summary: 'One argument and one result.',
    prerequisites: [],
    order: 0,
    estimatedMinutes: 5,
    lesson: {
      paragraphs: ['Compute a value.'],
      example: {
        code:
          language === 'cpp'
            ? '#include <iostream>\nint main(){std::cout << 42;}'
            : 'fn main(){println!("42");}',
        output: '42',
        explanation: 'Print a result.',
        language,
      },
    },
    questions: [
      {
        id: `${id}-q1`,
        type: 'code',
        language,
        prompt: 'Add one.',
        starterCode:
          language === 'cpp'
            ? 'int add_one(int x){return 0;}'
            : 'fn add_one(x:i32)->i32{0}',
        solution:
          language === 'cpp'
            ? 'int add_one(int x){return x+1;}'
            : 'fn add_one(x:i32)->i32{x+1}',
        tests:
          language === 'cpp'
            ? '#include <cassert>\nint main(){assert(add_one(1)==2);assert(add_one(-1)==0);}'
            : 'fn main(){assert_eq!(add_one(1),2);assert_eq!(add_one(-1),0);}',
        explanation: 'The function returns its input plus one.',
      },
    ],
    flashcards: [],
  };
}

const cpp = fixture('cpp');
const rust = fixture('rust');
const catalog = { [cpp.id]: cpp, [rust.id]: rust };

function backend(userId: string | null = null): Backend {
  return {
    ready: vi.fn().mockResolvedValue(undefined),
    close: vi.fn(),
    database: null,
    auth: {
      api: {
        getSession: vi
          .fn()
          .mockResolvedValue(userId ? { user: { id: userId } } : null),
      },
      options: { baseURL, trustedOrigins: [baseURL, 'http://127.0.0.1:4321'] },
    },
  } as unknown as Backend;
}

function request(
  body: unknown = {
    language: 'cpp',
    code: cpp.questions[0].type === 'code' ? cpp.questions[0].solution : '',
    skillId: cpp.id,
    questionId: cpp.questions[0].id,
  },
  headers: Record<string, string> = {},
  method = 'POST',
) {
  return new Request(`${baseURL}/api/code`, {
    method,
    headers: {
      origin: baseURL,
      'sec-fetch-site': 'same-origin',
      'content-type': 'application/json',
      ...headers,
    },
    body: method === 'POST' ? JSON.stringify(body) : undefined,
  });
}

function service(
  fetch = vi.fn().mockImplementation((_url: string, init: RequestInit) => {
    const source = JSON.parse(init.body as string).source as string;
    const marker = source.match(/__LESSDUMB_COMPLETE_[a-f0-9]{32}__/)?.[0];
    return Promise.resolve(
      Response.json({
        ...success,
        stdout: [...success.stdout, ...(marker ? [{ text: marker }] : [])],
      }),
    );
  }),
  options: Parameters<typeof createCompiledCodeService>[0] = {},
) {
  return {
    fetch,
    service: createCompiledCodeService({ fetch, skills: catalog, ...options }),
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
  vi.useRealTimers();
});

describe('canonical Rust and C++ sandbox requests', () => {
  it.each(['cpp', 'rust'] as const)(
    'sends only %s source plus authored tests using pinned compiler flags',
    async (language) => {
      const skill = catalog[`compiled-${language}`];
      const question = skill.questions[0];
      if (question.type !== 'code') throw new Error('Fixture must be code.');
      const { fetch, service: runner } = service();
      const response = await runner.handle(
        request(
          {
            language,
            code: question.solution,
            skillId: skill.id,
            questionId: question.id,
          },
          {
            cookie: 'private=account-cookie',
            'x-lessdumb-user': 'learner-one',
          },
        ),
        backend('learner-one'),
        '127.0.0.1',
      );
      expect(response.status).toBe(200);
      expect(await response.json()).toEqual(passed);
      const [url, init] = fetch.mock.calls[0];
      expect(url).toBe(
        `https://godbolt.org/api/compiler/${language === 'cpp' ? 'g152' : 'r1960'}/compile`,
      );
      expect(init.headers).toEqual({
        'Content-Type': 'application/json',
        Accept: 'application/json',
      });
      const body = JSON.parse(init.body);
      expect(body.source).toContain(
        `${question.solution}\n\n${question.tests.trimEnd().slice(0, -1)}`,
      );
      expect(body.source).toMatch(/__LESSDUMB_COMPLETE_[a-f0-9]{32}__/);
      if (language === 'cpp') expect(body.source).toContain('std::fputs');
      else expect(body.source).toContain('std::println!');
      expect(body.allowStoreCodeDebug).toBe(false);
      expect(body.options.compilerOptions.executorRequest).toBe(true);
      expect(body.options.filters.execute).toBe(true);
      expect(body.options.userArguments).toContain(
        language === 'cpp' ? '-std=c++20' : '--edition=2021',
      );
      if (language === 'cpp')
        expect(body.options.userArguments).toContain('-pthread');
      expect(JSON.stringify(body)).not.toContain('learner-one');
      expect(JSON.stringify(body)).not.toContain('account-cookie');
      expect(init.redirect).toBe('manual');
    },
  );

  it('allows guest code lab runs and verifies saved examples without awarding progress', async () => {
    const { fetch, service: runner } = service();
    expect(
      (
        await runner.handle(
          request({ language: 'rust', code: rust.lesson.example.code }),
          backend(),
        )
      ).status,
    ).toBe(200);
    expect(JSON.parse(fetch.mock.calls[0][1].body).source).toBe(
      rust.lesson.example.code,
    );
    fetch.mockResolvedValue(Response.json(success));
    expect(
      (
        await runner.handle(
          request({
            language: 'rust',
            code: rust.lesson.example.code,
            skillId: rust.id,
          }),
          backend(),
        )
      ).status,
    ).toBe(200);
    expect(JSON.parse(fetch.mock.calls[1][1].body).source).toBe(
      rust.lesson.example.code,
    );
    const altered = await runner.handle(
      request({ language: 'rust', code: 'fn main() {}', skillId: rust.id }),
      backend(),
    );
    expect(altered.status).toBe(400);
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it.each([
    { language: 'cpp', code: '', tests: 'int main(){}' },
    { language: 'cpp', code: '', compiler: 'attacker-choice' },
    { language: 'cpp', code: '', userId: 'another-account' },
    { language: 'cpp', code: '', endpoint: 'http://localhost:secret' },
    { language: 'python', code: 'print(42)' },
    { language: 'rust', code: 'fn main(){}', questionId: 'compiled-rust-q1' },
    {
      language: 'rust',
      code: '',
      skillId: cpp.id,
      questionId: cpp.questions[0].id,
    },
    { language: 'cpp', code: '', skillId: cpp.id, questionId: 'missing' },
    { language: 'cpp', code: '', skillId: '__proto__' },
    { language: 'cpp', code: null },
    { language: 'cpp', code: '\0' },
  ])(
    'rejects invalid fields, mismatched languages, or missing assessments %#',
    async (body) => {
      const { fetch, service: runner } = service();
      const response = await runner.handle(request(body), backend());
      expect(response.status).toBe(400);
      expect((await response.json()).infrastructure).toBe(true);
      expect(fetch).not.toHaveBeenCalled();
    },
  );

  it('reports blank work as an observed failed answer without contacting a compiler', async () => {
    const { fetch, service: runner } = service();
    const response = await runner.handle(
      request({
        language: 'cpp',
        code: '  \n',
        skillId: cpp.id,
        questionId: cpp.questions[0].id,
      }),
      backend(),
    );
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      passed: false,
      infrastructure: false,
    });
    expect(fetch).not.toHaveBeenCalled();
  });

  it.each(['cpp', 'rust'] as const)(
    'rejects an early %s exit with zero status before the authored checks complete',
    async (language) => {
      const skill = catalog[`compiled-${language}`];
      const code =
        language === 'cpp'
          ? '#include <cstdlib>\nint add_one(int x){std::exit(0);}'
          : 'fn add_one(x:i32)->i32{std::process::exit(0)}';
      const { service: runner } = service(
        vi.fn().mockResolvedValue(Response.json({ ...success, stdout: [] })),
      );
      const response = await runner.handle(
        request({
          language,
          code,
          skillId: skill.id,
          questionId: skill.questions[0].id,
        }),
        backend(),
      );
      expect(await response.json()).toMatchObject({
        passed: false,
        infrastructure: false,
        error: expect.stringContaining('before all checks completed'),
      });
    },
  );

  it('uses a fresh unpredictable completion marker per exercise run', async () => {
    const { fetch, service: runner } = service();
    for (let i = 0; i < 2; i++)
      expect(await (await runner.handle(request(), backend())).json()).toEqual(
        passed,
      );
    const markers = fetch.mock.calls.map(
      (call) =>
        JSON.parse(call[1].body as string).source.match(
          /__LESSDUMB_COMPLETE_[a-f0-9]{32}__/,
        )?.[0],
    );
    expect(markers[0]).toBeTruthy();
    expect(markers[1]).toBeTruthy();
    expect(markers[0]).not.toBe(markers[1]);
  });

  it('supports completion injection for every authored Rust/C++ harness without parsing learner source', async () => {
    const fetch = service().fetch;
    const runner = createCompiledCodeService({ fetch });
    for (const skill of skills)
      for (const question of skill.questions) {
        if (
          question.type !== 'code' ||
          !['rust', 'cpp'].includes(question.language ?? '')
        )
          continue;
        expect(
          await runner.execute({
            language: question.language as 'rust' | 'cpp',
            code: question.solution,
            skillId: skill.id,
            questionId: question.id,
          }),
        ).toEqual(passed);
      }
  });

  it('checks same-origin, content type, method, and signed-in owner before forwarding', async () => {
    const { fetch, service: runner } = service();
    const body = { language: 'cpp', code: 'int main(){}' };
    expect(
      (
        await runner.handle(
          request(body, { origin: 'https://untrusted.example' }),
          backend(),
        )
      ).status,
    ).toBe(403);
    expect(
      (
        await runner.handle(
          request(body, { 'sec-fetch-site': 'cross-site' }),
          backend(),
        )
      ).status,
    ).toBe(403);
    expect(
      (
        await runner.handle(
          request(body, { 'content-type': 'text/plain' }),
          backend(),
        )
      ).status,
    ).toBe(415);
    expect(
      (await runner.handle(request(undefined, {}, 'GET'), backend())).status,
    ).toBe(405);
    expect(
      (
        await runner.handle(
          request(body, { 'x-lessdumb-user': 'old-learner' }),
          backend('new-learner'),
        )
      ).status,
    ).toBe(401);
    expect(
      (
        await runner.handle(
          request(body, { 'x-lessdumb-user': 'expired-learner' }),
          backend(),
        )
      ).status,
    ).toBe(401);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('bounds source bytes and streamed body bytes before a provider request', async () => {
    const { fetch, service: runner } = service();
    const source = await runner.handle(
      request({ language: 'rust', code: '😅'.repeat(6001) }),
      backend(),
    );
    expect(source.status).toBe(413);
    const oversized = new Request(`${baseURL}/api/code`, {
      method: 'POST',
      headers: { origin: baseURL, 'content-type': 'application/json' },
      body: JSON.stringify({
        language: 'cpp',
        code: 'x'.repeat(COMPILED_CODE_LIMITS.bodyBytes),
      }),
    });
    expect((await runner.handle(oversized, backend())).status).toBe(413);
    expect(fetch).not.toHaveBeenCalled();
  });
});

describe('compiler outcome interpretation', () => {
  it('requires exact completion proof, strips it, and checks before truncating learner output', () => {
    const marker = '__LESSDUMB_COMPLETE_0123456789abcdef0123456789abcdef__';
    expect(
      compilerResult(
        {
          ...success,
          stdout: [{ text: '42' }, { text: '' }, { text: marker }],
        },
        marker,
      ),
    ).toEqual(passed);
    expect(
      compilerResult(
        { ...success, stdout: [{ text: '42' }, { text: `wrong${marker}` }] },
        marker,
      ),
    ).toMatchObject({ passed: false, infrastructure: false });
    expect(
      compilerResult(
        {
          ...success,
          stdout: [
            { text: '42' },
            { text: '__LESSDUMB_COMPLETE_ffffffffffffffffffffffffffffffff__' },
          ],
        },
        marker,
      ),
    ).toMatchObject({ passed: false, infrastructure: false });
    expect(
      compilerResult(
        { ...success, stdout: [{ text: marker }, { text: marker }] },
        marker,
      ),
    ).toMatchObject({ passed: false, infrastructure: false });
    const output = compilerResult(
      { ...success, stdout: [{ text: 'x'.repeat(20000) }, { text: marker }] },
      marker,
    );
    expect(output.passed).toBe(true);
    expect(output.output.length).toBeLessThanOrEqual(
      COMPILED_CODE_LIMITS.outputCharacters,
    );
    expect(output.output).not.toContain(marker);
    expect(compilerResult(success, marker)).toMatchObject({
      passed: false,
      infrastructure: false,
    });
    // Saved examples and independent lab programs need no assessment token.
    expect(compilerResult(success)).toEqual(passed);
  });

  it.each([
    ['cpp', 134, 'Assertion failed'],
    ['rust', 101, "thread 'main' panicked"],
  ])(
    'recognizes observed %s compilation and assertion failures from the live executor response shape',
    (_language, code, diagnostic) => {
      expect(
        compilerResult({
          code: -1,
          didExecute: false,
          buildResult: {
            code: 1,
            timedOut: false,
            stderr: [{ text: 'unknown function' }],
          },
          stderr: [{ text: 'Build failed' }],
        }),
      ).toMatchObject({
        passed: false,
        infrastructure: false,
        error: 'unknown function',
      });
      expect(
        compilerResult({ ...success, code, stderr: [{ text: diagnostic }] }),
      ).toMatchObject({
        passed: false,
        infrastructure: false,
        error: diagnostic,
      });
    },
  );

  it('requires both compiler and execution success, never a fake passing stdout message', () => {
    expect(compilerResult(success)).toEqual(passed);
    expect(
      compilerResult({
        ...success,
        code: 1,
        stdout: [{ text: 'All checks passed!' }],
        stderr: [{ text: 'assertion failed' }],
      }),
    ).toEqual({
      output: 'All checks passed!',
      passed: false,
      error: 'assertion failed',
      infrastructure: false,
    });
    expect(
      compilerResult({
        ...success,
        buildResult: { code: 1, stderr: [{ text: 'unknown name' }] },
      }),
    ).toEqual({
      output: '',
      passed: false,
      error: 'unknown name',
      infrastructure: false,
    });
    expect(compilerResult({ ...success, didExecute: false })).toMatchObject({
      passed: false,
      infrastructure: true,
    });
    expect(
      compilerResult({ code: 0, stdout: [{ text: 'passed' }] }),
    ).toMatchObject({ passed: false, infrastructure: true });
    expect(compilerResult({ ...success, code: null })).toMatchObject({
      passed: false,
      infrastructure: true,
    });
    expect(compilerResult({ ...success, code: Number.NaN })).toMatchObject({
      passed: false,
      infrastructure: true,
    });
  });

  it('distinguishes observed execution timeouts from compiler transport or build outages', () => {
    expect(
      compilerResult({ ...success, code: 124, timedOut: true }),
    ).toMatchObject({
      passed: false,
      infrastructure: false,
      error: expect.stringContaining('Execution timed out'),
    });
    expect(
      compilerResult({ ...success, buildResult: { code: -1, timedOut: true } }),
    ).toMatchObject({ passed: false, infrastructure: true });
  });

  it('strips color sequences and bounds huge plain-text output and errors', () => {
    const output = compilerResult({
      ...success,
      stdout: [{ text: `\u001b[31m${'x'.repeat(30000)}\u001b[0m` }],
    });
    expect(output.output).not.toContain('\u001b');
    expect(output.output.length).toBeLessThanOrEqual(
      COMPILED_CODE_LIMITS.outputCharacters,
    );
    const failure = compilerResult({
      ...success,
      code: 1,
      stderr: [{ text: 'x'.repeat(30000) }],
    });
    expect(failure.error!.length).toBeLessThanOrEqual(
      COMPILED_CODE_LIMITS.errorCharacters,
    );
  });
});

describe('free compiler availability and load bounds', () => {
  it.each([429, 503])(
    'treats provider HTTP %s as infrastructure so mastery remains intact',
    async (status) => {
      const { service: runner } = service(
        vi
          .fn()
          .mockResolvedValue(
            Response.json({ error: 'at capacity' }, { status }),
          ),
      );
      const response = await runner.handle(request(), backend());
      expect(await response.json()).toMatchObject({
        passed: false,
        infrastructure: true,
      });
    },
  );

  it('handles malformed, oversized, and missing provider responses without accepting a grade', async () => {
    for (const response of [
      new Response('not json'),
      Response.json({ code: 0 }),
      new Response('x'.repeat(COMPILED_CODE_LIMITS.providerBytes + 1)),
    ]) {
      const { service: runner } = service(vi.fn().mockResolvedValue(response));
      expect(
        await (await runner.handle(request(), backend())).json(),
      ).toMatchObject({ passed: false, infrastructure: true });
    }
    const { service: runner } = service(
      vi.fn().mockRejectedValue(new TypeError('offline')),
    );
    expect(
      await (await runner.handle(request(), backend())).json(),
    ).toMatchObject({ passed: false, infrastructure: true });
  });

  it('limits each learner independently and releases the rolling window', async () => {
    let now = 1000;
    const fetch = vi
      .fn()
      .mockImplementation(() => Promise.resolve(Response.json(success)));
    const { service: runner } = service(fetch, {
      now: () => now,
      requestsPerMinute: 1,
    });
    expect((await runner.handle(request(), backend('one'))).status).toBe(200);
    expect((await runner.handle(request(), backend('one'))).status).toBe(429);
    expect((await runner.handle(request(), backend('two'))).status).toBe(200);
    now += 60000;
    expect((await runner.handle(request(), backend('one'))).status).toBe(200);
    expect(fetch).toHaveBeenCalledTimes(3);
  });

  it('bounds simultaneous work and releases capacity after a compiler response', async () => {
    let resolve!: (value: Response) => void;
    const fetch = vi
      .fn()
      .mockImplementationOnce(
        () =>
          new Promise<Response>((done) => {
            resolve = done;
          }),
      )
      .mockImplementation(() => Promise.resolve(Response.json(success)));
    const { service: runner } = service(fetch, { maxConcurrent: 1 });
    const first = runner.execute({ language: 'cpp', code: 'int main(){}' });
    const busy = await runner.execute({
      language: 'rust',
      code: 'fn main(){}',
    });
    expect(busy).toMatchObject({
      passed: false,
      infrastructure: true,
      error: expect.stringContaining('busy'),
    });
    expect(fetch).toHaveBeenCalledTimes(1);
    resolve(Response.json(success));
    expect(await first).toEqual(passed);
    expect(
      await runner.execute({ language: 'rust', code: 'fn main(){}' }),
    ).toEqual(passed);
  });

  it('aborts provider work at the deadline and on navigation without recording a failure', async () => {
    vi.useFakeTimers();
    const fetch = vi.fn().mockImplementation(
      (_url: string, init: RequestInit) =>
        new Promise((_resolve, reject) => {
          init.signal!.addEventListener(
            'abort',
            () => reject(new Error('aborted')),
            { once: true },
          );
        }),
    );
    const { service: runner } = service(fetch, { timeoutMs: 20 });
    const run = runner.execute({ language: 'cpp', code: 'int main(){}' });
    await vi.advanceTimersByTimeAsync(20);
    expect(await run).toMatchObject({
      passed: false,
      infrastructure: true,
      error: expect.stringContaining('too long'),
    });
    const controller = new AbortController();
    const second = runner.execute(
      { language: 'rust', code: 'fn main(){}' },
      controller.signal,
    );
    controller.abort();
    expect(await second).toMatchObject({
      passed: false,
      infrastructure: true,
      error: expect.stringContaining('cancelled'),
    });
  });

  it('discards a late successful transport response after the run was cancelled', async () => {
    let resolve!: (value: Response) => void;
    const fetch = vi.fn().mockImplementation(
      () =>
        new Promise<Response>((done) => {
          resolve = done;
        }),
    );
    const { service: runner } = service(fetch);
    const controller = new AbortController();
    const run = runner.execute(
      { language: 'rust', code: 'fn main(){}' },
      controller.signal,
    );
    controller.abort();
    resolve(Response.json(success));
    expect(await run).toMatchObject({
      passed: false,
      infrastructure: true,
      error: expect.stringContaining('cancelled'),
    });
  });
});

describe('language-independent browser adapter', () => {
  it('preserves Python worker execution and sends only the canonical compiled exercise identifiers', async () => {
    expect(await runCode('print(42)', 'assert True')).toMatchObject({
      passed: true,
      output: 'python',
    });
    expect(runPython).toHaveBeenCalledWith(
      'print(42)',
      'assert True',
      undefined,
    );
    const fetch = vi.fn().mockResolvedValue(Response.json(passed));
    vi.stubGlobal('fetch', fetch);
    const signal = new AbortController().signal;
    expect(
      await runCode(
        'int add_one(int x){return x+1;}',
        'untrusted replacement tests',
        'cpp',
        {
          skillId: cpp.id,
          questionId: cpp.questions[0].id,
          userId: 'learner',
          signal,
        },
      ),
    ).toEqual(passed);
    const [url, init] = fetch.mock.calls[0];
    expect(url).toBe('/api/code');
    expect(JSON.parse(init.body)).toEqual({
      language: 'cpp',
      code: 'int add_one(int x){return x+1;}',
      skillId: cpp.id,
      questionId: cpp.questions[0].id,
    });
    expect(init.headers['X-Lessdumb-User']).toBe('learner');
    expect(init.credentials).toBe('same-origin');
  });

  it('preserves infrastructure messages and rejects malformed or contradictory API grades', async () => {
    for (const value of [
      {
        output: '',
        passed: false,
        error: 'Your account changed.',
        infrastructure: true,
      },
      { output: '42', passed: true, error: null, infrastructure: true },
      { passed: true },
      {
        output: 'x'.repeat(20001),
        passed: true,
        error: null,
        infrastructure: false,
      },
    ]) {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json(value)));
      const result = await runCode('fn main(){}', '', 'rust');
      expect(result).toMatchObject({ passed: false, infrastructure: true });
      if ('error' in value && value.error === 'Your account changed.')
        expect(result.error).toBe(value.error);
    }
  });

  it('does not contact the provider after cancellation and turns connection failures into infrastructure', async () => {
    const fetch = vi.fn().mockRejectedValue(new TypeError('offline'));
    vi.stubGlobal('fetch', fetch);
    const controller = new AbortController();
    controller.abort();
    expect(
      await runCode('fn main(){}', '', 'rust', { signal: controller.signal }),
    ).toMatchObject({
      passed: false,
      infrastructure: true,
      error: expect.stringContaining('cancelled'),
    });
    expect(fetch).not.toHaveBeenCalled();
    expect(await runCode('fn main(){}', '', 'rust')).toMatchObject({
      passed: false,
      infrastructure: true,
    });
  });

  it('discards a late browser result after navigation cancelled its request', async () => {
    let resolve!: (value: Response) => void;
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation(
        () =>
          new Promise<Response>((done) => {
            resolve = done;
          }),
      ),
    );
    const controller = new AbortController();
    const run = runCode('fn main(){}', '', 'rust', {
      signal: controller.signal,
    });
    controller.abort();
    resolve(Response.json(passed));
    expect(await run).toMatchObject({
      passed: false,
      infrastructure: true,
      error: expect.stringContaining('cancelled'),
    });
  });
});
