import { createHash, randomBytes } from 'node:crypto';
import { skillById, type Skill } from '../curriculum';
import type { CodeResult } from '../code-runner';
import type { Backend } from './backend';

export type CompiledLanguage = 'rust' | 'cpp';

export const COMPILED_CODE_LIMITS = {
  bodyBytes: 40000,
  sourceBytes: 24000,
  providerBytes: 128000,
  outputCharacters: 16000,
  errorCharacters: 8000,
  timeoutMs: 35000,
  concurrent: 4,
  requestsPerMinute: 30,
  trackedClients: 2000,
} as const;

const compilers = {
  rust: {
    id: 'r1960',
    language: 'rust',
    flags: '--edition=2021 -C opt-level=0',
  },
  cpp: {
    id: 'g152',
    language: 'c++',
    flags: '-std=c++20 -O0 -Wall -Wextra -pthread',
  },
} as const;

interface Submission {
  language: CompiledLanguage;
  code: string;
  skillId?: string;
  questionId?: string;
}

interface ServiceOptions {
  fetch?: typeof globalThis.fetch;
  skills?: Record<string, Skill>;
  now?: () => number;
  timeoutMs?: number;
  maxConcurrent?: number;
  requestsPerMinute?: number;
}

class RequestError extends Error {
  constructor(
    message: string,
    readonly status = 400,
  ) {
    super(message);
  }
}

function unavailable(error: string): CodeResult {
  return { output: '', passed: false, error, infrastructure: true };
}

function json(result: CodeResult, status = 200): Response {
  return Response.json(result, {
    status,
    headers: {
      'Cache-Control': 'no-store',
      Vary: 'Cookie',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}

async function readJSON(
  response: Request | Response,
  maximum: number,
): Promise<unknown> {
  const length = response.headers.get('content-length');
  if (length && Number(length) > maximum)
    throw new RequestError('The code request is too large.', 413);
  if (!response.body) throw new RequestError('A JSON body is required.');
  const reader = response.body.getReader();
  let size = 0;
  const chunks: Uint8Array[] = [];
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maximum) {
        await reader.cancel();
        throw new RequestError('The code request is too large.', 413);
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  try {
    return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
  } catch {
    throw new RequestError('The body must contain valid JSON.');
  }
}

function parseSubmission(value: unknown): Submission {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw new RequestError('The code request must be an object.');
  const body = value as Record<string, unknown>;
  const allowed = ['language', 'code', 'skillId', 'questionId'];
  if (Object.keys(body).some((key) => !allowed.includes(key)))
    throw new RequestError('The code request contains unsupported fields.');
  if (body.language !== 'rust' && body.language !== 'cpp')
    throw new RequestError('Choose Rust or C++ for this compiler.');
  if (typeof body.code !== 'string' || body.code.includes('\0'))
    throw new RequestError('The source code must be text.');
  if (
    new TextEncoder().encode(body.code).byteLength >
    COMPILED_CODE_LIMITS.sourceBytes
  )
    throw new RequestError('Keep source code below 24 KB.', 413);
  for (const key of ['skillId', 'questionId']) {
    if (
      body[key] !== undefined &&
      (typeof body[key] !== 'string' ||
        !/^[a-zA-Z0-9:_-]{1,128}$/.test(body[key] as string))
    )
      throw new RequestError('The exercise identifier is invalid.');
  }
  if (body.questionId && !body.skillId)
    throw new RequestError('An exercise needs its skill identifier.');
  return body as unknown as Submission;
}

function sourceFor(
  submission: Submission,
  catalog: Record<string, Skill>,
  completionMarker?: string,
): string {
  if (!submission.skillId) return submission.code;
  const skill = Object.hasOwn(catalog, submission.skillId)
    ? catalog[submission.skillId]
    : undefined;
  if (!skill) throw new RequestError('This skill does not exist.');
  if (!submission.questionId) {
    const example = skill.lesson.example;
    if (example.kind === 'text' || example.language !== submission.language)
      throw new RequestError('The example uses a different code language.');
    if (example.code !== submission.code)
      throw new RequestError(
        'Run the saved lesson example, or use the code lab for edits.',
      );
    return example.code;
  }
  const question = skill.questions.find(
    (candidate) => candidate.id === submission.questionId,
  );
  if (!question || question.type !== 'code')
    throw new RequestError('This code exercise does not exist in the skill.');
  if (question.language !== submission.language)
    throw new RequestError('The exercise uses a different code language.');
  // The client cannot replace tests, compiler flags, files, or provider URLs.
  if (!completionMarker) return `${submission.code}\n\n${question.tests}`;
  const harness = question.tests.trimEnd();
  const main =
    submission.language === 'rust'
      ? /^fn\s+main\s*\(\s*\)\s*\{/
      : /\bint\s+main\s*\(\s*\)\s*\{/;
  // Authored harnesses have a main function as their final item. The injected
  // statement follows its assertions; learner source is never parsed or edited.
  if (!main.test(harness) || !harness.endsWith('}'))
    throw new RequestError(
      'This assessment harness is unavailable. Try another exercise.',
      503,
    );
  const completion =
    submission.language === 'rust'
      ? `\n    std::println!("\\n${completionMarker}");\n`
      : `\n    std::fputs("\\n${completionMarker}\\n", stdout);\n    std::fflush(stdout);\n`;
  const prefix = submission.language === 'cpp' ? '#include <cstdio>\n' : '';
  return `${prefix}${submission.code}\n\n${harness.slice(0, -1)}${completion}}`;
}

function record(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function lines(value: unknown, maximum: number): string {
  if (!Array.isArray(value)) return '';
  let result = '';
  for (const item of value) {
    const line = record(item);
    if (typeof line?.text !== 'string') continue;
    // Compiler diagnostics use ANSI color codes; UI output remains plain text.
    const text = line.text.replace(/\u001b\[[0-?]*[ -/]*[@-~]/g, '');
    result += `${result ? '\n' : ''}${text}`;
    if (result.length > maximum)
      return `${result.slice(0, maximum - 24)}\n[output truncated]`;
  }
  return result;
}

/** Require an actual successful compile and execution; stdout is never a grade. */
export function compilerResult(
  value: unknown,
  completionMarker?: string,
): CodeResult {
  const result = record(value);
  const build = record(result?.buildResult);
  const diagnostic = lines(build?.stderr, COMPILED_CODE_LIMITS.errorCharacters);
  if (Number.isInteger(build?.code) && build?.code !== 0 && !build?.timedOut)
    return {
      output: '',
      passed: false,
      error:
        diagnostic || 'Compilation failed. Check the compiler diagnostics.',
      infrastructure: false,
    };
  if (!result || !build || build.code !== 0 || !Number.isInteger(result.code))
    return unavailable('The compiler could not finish the build. Try again.');
  if (result.didExecute !== true)
    return unavailable('The sandbox could not start the program. Try again.');
  let stdout = result.stdout;
  let completions = 0;
  if (completionMarker && Array.isArray(stdout)) {
    const cleaned: { text: string }[] = [];
    for (const item of stdout) {
      const text = record(item)?.text;
      if (typeof text !== 'string') continue;
      for (const part of text.split(/\r?\n/)) {
        if (part === completionMarker) {
          completions++;
          // Remove the separator added by the proof statement, preserving
          // learner output without showing internal grading tokens.
          if (cleaned.at(-1)?.text === '') cleaned.pop();
        } else cleaned.push({ text: part });
      }
    }
    stdout = cleaned;
  }
  const output = lines(stdout, COMPILED_CODE_LIMITS.outputCharacters);
  if (result.timedOut === true)
    return {
      output,
      passed: false,
      error: 'Execution timed out. Check for an infinite loop and try again.',
      infrastructure: false,
    };
  if (result.code !== 0)
    return {
      output,
      passed: false,
      error:
        lines(result.stderr, COMPILED_CODE_LIMITS.errorCharacters) ||
        `The program stopped with exit code ${result.code}. Check the assertions and runtime behavior.`,
      infrastructure: false,
    };
  if (completionMarker && completions !== 1)
    return {
      output,
      passed: false,
      error:
        'The program ended before all checks completed. Return from your function and let the test harness finish.',
      infrastructure: false,
    };
  return { output, passed: true, error: null, infrastructure: false };
}

/** A process-wide bounded adapter. Learner code is never run by Node or on the host. */
export function createCompiledCodeService(options: ServiceOptions = {}) {
  const transport = options.fetch ?? globalThis.fetch;
  const catalog = options.skills ?? skillById;
  const now = options.now ?? Date.now;
  const maximum = options.maxConcurrent ?? COMPILED_CODE_LIMITS.concurrent;
  const rate =
    options.requestsPerMinute ?? COMPILED_CODE_LIMITS.requestsPerMinute;
  const buckets = new Map<string, { expiresAt: number; count: number }>();
  let active = 0;

  function permit(client: string): boolean {
    const time = now();
    for (const [key, bucket] of buckets) {
      if (bucket.expiresAt <= time) buckets.delete(key);
    }
    const key =
      buckets.has(client) ||
      buckets.size < COMPILED_CODE_LIMITS.trackedClients - 1
        ? client
        : 'overflow';
    const bucket = buckets.get(key) ?? { expiresAt: time + 60000, count: 0 };
    buckets.set(key, bucket);
    if (bucket.count >= rate) return false;
    bucket.count++;
    return true;
  }

  async function execute(
    submission: Submission,
    signal?: AbortSignal,
  ): Promise<CodeResult> {
    const completionMarker = submission.questionId
      ? `__LESSDUMB_COMPLETE_${randomBytes(16).toString('hex')}__`
      : undefined;
    const source = sourceFor(submission, catalog, completionMarker);
    if (!submission.code.trim())
      return {
        output: '',
        passed: false,
        error: 'Write an implementation before running the checks.',
        infrastructure: false,
      };
    if (active >= maximum)
      return unavailable('The compiler is busy. Try again in a moment.');
    if (signal?.aborted) return unavailable('The run was cancelled.');
    active++;
    const controller = new AbortController();
    const abort = () => controller.abort();
    signal?.addEventListener('abort', abort, { once: true });
    const timeout = setTimeout(
      abort,
      options.timeoutMs ?? COMPILED_CODE_LIMITS.timeoutMs,
    );
    try {
      const compiler = compilers[submission.language];
      const response = await transport(
        `https://godbolt.org/api/compiler/${compiler.id}/compile`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            source,
            lang: compiler.language,
            allowStoreCodeDebug: false,
            options: {
              userArguments: compiler.flags,
              compilerOptions: { executorRequest: true, skipAsm: true },
              filters: { execute: true },
              executeParameters: { args: [], stdin: '' },
              tools: [],
              libraries: [],
            },
          }),
          signal: controller.signal,
          redirect: 'error',
        },
      );
      if (!response.ok) {
        await response.body?.cancel();
        return unavailable(
          response.status === 429
            ? 'The free compiler is at capacity. Try again shortly.'
            : 'The compiler service is unavailable. Try again.',
        );
      }
      const value = await readJSON(
        response,
        COMPILED_CODE_LIMITS.providerBytes,
      );
      if (controller.signal.aborted)
        return unavailable('The run was cancelled.');
      return compilerResult(value, completionMarker);
    } catch {
      return unavailable(
        signal?.aborted
          ? 'The run was cancelled.'
          : controller.signal.aborted
            ? 'The compiler took too long to respond. Try again.'
            : 'The compiler could not connect. Try again.',
      );
    } finally {
      clearTimeout(timeout);
      signal?.removeEventListener('abort', abort);
      active--;
    }
  }

  async function handle(
    request: Request,
    backend: Backend,
    clientAddress = 'unknown',
  ): Promise<Response> {
    if (request.method !== 'POST')
      return json(unavailable('Method not allowed.'), 405);
    await backend.ready();
    const origin = request.headers.get('origin');
    const site = request.headers.get('sec-fetch-site');
    const trusted = backend.auth.options.trustedOrigins;
    if (
      !origin ||
      !trusted.includes(origin) ||
      (site && site !== 'same-origin' && site !== 'none')
    )
      return json(unavailable('Code can only run from this application.'), 403);
    if (
      request.headers
        .get('content-type')
        ?.split(';')[0]
        .trim()
        .toLowerCase() !== 'application/json'
    )
      return json(unavailable('Send source code as JSON.'), 415);
    try {
      const submission = parseSubmission(
        await readJSON(request, COMPILED_CODE_LIMITS.bodyBytes),
      );
      // Validate the canonical assessment before allocating a compiler request.
      sourceFor(submission, catalog);
      const session = await backend.auth.api.getSession({
        headers: request.headers,
      });
      const owner = request.headers.get('x-lessdumb-user');
      if (owner && owner !== session?.user.id)
        return json(
          unavailable(
            'Your account changed. Refresh the session before running code.',
          ),
          401,
        );
      const client = session
        ? `account:${session.user.id}`
        : `guest:${createHash('sha256').update(clientAddress).digest('hex')}`;
      if (!permit(client))
        return json(
          unavailable('Too many compiler runs. Try again in a minute.'),
          429,
        );
      return json(await execute(submission, request.signal));
    } catch (error) {
      if (error instanceof RequestError)
        return json(unavailable(error.message), error.status);
      return json(
        unavailable('The compiler could not connect. Try again.'),
        503,
      );
    }
  }

  return { execute, handle };
}

const service = createCompiledCodeService();

export function handleCodeRequest(
  request: Request,
  backend: Backend,
  clientAddress?: string,
): Promise<Response> {
  return service.handle(request, backend, clientAddress);
}
