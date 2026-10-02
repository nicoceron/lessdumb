import { runPython, type PythonResult } from './python';
import type { CodeLanguage } from './curriculum';

export type { CodeLanguage } from './curriculum';
export type CodeResult = PythonResult;

export interface CodeContext {
  skillId?: string;
  questionId?: string;
  /** Guard an old tab whose cookie has changed to another signed-in learner. */
  userId?: string;
  signal?: AbortSignal;
}

function unavailable(
  message = 'The compiler could not connect. Try again.',
): CodeResult {
  return { output: '', passed: false, error: message, infrastructure: true };
}

function isResult(value: unknown): value is CodeResult {
  if (!value || typeof value !== 'object') return false;
  const result = value as Partial<CodeResult>;
  return (
    typeof result.output === 'string' &&
    result.output.length <= 20000 &&
    typeof result.passed === 'boolean' &&
    (result.error === null ||
      (typeof result.error === 'string' && result.error.length <= 10000)) &&
    typeof result.infrastructure === 'boolean' &&
    (!result.passed || (!result.infrastructure && result.error === null)) &&
    (!result.infrastructure ||
      (!result.passed && typeof result.error === 'string'))
  );
}

/**
 * Python stays in its browser worker. Rust and C++ use the server's documented
 * Compiler Explorer sandbox adapter; the browser never supplies grading tests.
 */
export async function runCode(
  code: string,
  tests = '',
  language: CodeLanguage = 'python',
  context: CodeContext = {},
): Promise<CodeResult> {
  if (context.signal?.aborted) return unavailable('The run was cancelled.');
  if (language === 'python') return runPython(code, tests, context.signal);
  if (language !== 'rust' && language !== 'cpp')
    return unavailable('This code language is not supported.');

  const controller = new AbortController();
  const abort = () => controller.abort();
  context.signal?.addEventListener('abort', abort, { once: true });
  const timeout = setTimeout(abort, 45000);
  try {
    const response = await fetch('/api/code', {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
        ...(context.userId ? { 'X-Lessdumb-User': context.userId } : {}),
      },
      body: JSON.stringify({
        language,
        code,
        ...(context.skillId ? { skillId: context.skillId } : {}),
        ...(context.questionId ? { questionId: context.questionId } : {}),
      }),
      signal: controller.signal,
    });
    const value: unknown = await response.json();
    if (controller.signal.aborted) return unavailable('The run was cancelled.');
    if (!isResult(value) || (!response.ok && !value.infrastructure))
      return unavailable();
    return value;
  } catch {
    return unavailable(
      context.signal?.aborted
        ? 'The run was cancelled.'
        : controller.signal.aborted
          ? 'The compiler took too long to respond. Try again.'
          : undefined,
    );
  } finally {
    clearTimeout(timeout);
    context.signal?.removeEventListener('abort', abort);
  }
}
