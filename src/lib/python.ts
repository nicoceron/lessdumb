export type PythonResult = {
  output: string;
  passed: boolean;
  error: string | null;
  infrastructure: boolean;
};

// Seconds this device took for the worker's calibration benchmark. The first
// run with timed checks measures it; later runs (and pages, for this tab)
// reuse it, so the benchmark costs one fraction of a second per session.
const CALIBRATION_KEY = 'lessdumb:python-calibration';
let calibration: number | undefined;

const validCalibration = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value > 0;

function cachedCalibration(): number | undefined {
  if (calibration !== undefined) return calibration;
  try {
    const stored = Number(sessionStorage.getItem(CALIBRATION_KEY));
    if (validCalibration(stored)) calibration = stored;
  } catch {
    // Storage can be unavailable; the worker then measures again.
  }
  return calibration;
}

function rememberCalibration(value: number) {
  calibration = value;
  try {
    sessionStorage.setItem(CALIBRATION_KEY, String(value));
  } catch {
    // Keep the in-memory value.
  }
}

/** Each run uses an isolated, terminable worker. Learner code never runs on the server. */
export function runPython(
  code: string,
  tests = '',
  signal?: AbortSignal,
): Promise<PythonResult> {
  return new Promise((resolve) => {
    let worker: Worker | undefined;
    let timeout: ReturnType<typeof setTimeout> | undefined;
    let settled = false;
    const finish = (result: PythonResult) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      worker?.terminate();
      signal?.removeEventListener('abort', cancelled);
      resolve(result);
    };
    const unavailable = () =>
      finish({
        output: '',
        passed: false,
        error: 'Python could not load. Refresh the page and try again.',
        infrastructure: true,
      });
    const cancelled = () =>
      finish({
        output: '',
        passed: false,
        error: 'The run was cancelled.',
        infrastructure: true,
      });
    if (signal?.aborted) {
      cancelled();
      return;
    }
    signal?.addEventListener('abort', cancelled, { once: true });
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
        if ('calibration' in data) {
          if (validCalibration(data.calibration))
            rememberCalibration(data.calibration);
          return;
        }
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
      worker.postMessage({
        id,
        code,
        tests,
        calibration: cachedCalibration(),
      });
    } catch {
      unavailable();
    }
  });
}
