export type PythonResult = {
  output: string;
  passed: boolean;
  error: string | null;
  infrastructure: boolean;
};

/** Each run uses an isolated, terminable worker. Learner code never runs on the server. */
export function runPython(code: string, tests = ''): Promise<PythonResult> {
  return new Promise((resolve) => {
    let worker: Worker | undefined;
    let timeout: ReturnType<typeof setTimeout> | undefined;
    let settled = false;
    const finish = (result: PythonResult) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      worker?.terminate();
      resolve(result);
    };
    const unavailable = () =>
      finish({
        output: '',
        passed: false,
        error: 'Python could not load. Refresh the page and try again.',
        infrastructure: true,
      });
    try {
      worker = new Worker('/python-worker.mjs', { type: 'module' });
      const id = crypto.randomUUID();
      timeout = setTimeout(
        () =>
          finish({
            output: '',
            passed: false,
            error:
              'Python took too long to load. Check your connection and try again.',
            infrastructure: true,
          }),
        30000,
      );
      worker.onmessage = ({ data }) => {
        if (data?.id !== id) return;
        if (data.ready === true) {
          clearTimeout(timeout);
          timeout = setTimeout(
            () =>
              finish({
                output: '',
                passed: false,
                error:
                  'Execution timed out. Check for an infinite loop and try again.',
                infrastructure: false,
              }),
            30000,
          );
          return;
        }
        if (
          typeof data.output !== 'string' ||
          typeof data.passed !== 'boolean' ||
          (data.error !== null && typeof data.error !== 'string') ||
          typeof data.infrastructure !== 'boolean'
        ) {
          unavailable();
          return;
        }
        finish({
          output: data.output,
          passed: data.passed,
          error: data.error,
          infrastructure: data.infrastructure,
        });
      };
      worker.onerror = unavailable;
      worker.onmessageerror = unavailable;
      worker.postMessage({ id, code, tests });
    } catch {
      unavailable();
    }
  });
}
