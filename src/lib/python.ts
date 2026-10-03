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

/**
 * The warm spare. Starting Python takes most of a check (about 0.85 s on a
 * fast laptop, several seconds on a phone, plus any packages), so a page with
 * a Python exercise keeps one worker loading Python before the learner
 * clicks. The spare has never run learner code: a run takes it, and the run's
 * worker is terminated when the run ends, as before. One spare per tab.
 */
type Spare = { worker: Worker; preloaded: Set<string> };
let spare: Spare | undefined;
/** Pages that asked for a spare, each with its exercise's authored source. */
const holders = new Map<symbol, string>();
let releaseTimer: ReturnType<typeof setTimeout> | undefined;
/**
 * How long a spare outlives the last page that asked for it, so moving from
 * one Python page to another does not restart Python.
 */
export const SPARE_RELEASE_MS = 5000;

function startWorker(): Worker {
  return new Worker('/python-worker.mjs', { type: 'module' });
}

/** Preload, in the spare, the packages an exercise's source imports. */
function preload(source: string) {
  if (!spare || !source || spare.preloaded.has(source)) return;
  spare.preloaded.add(source);
  try {
    spare.worker.postMessage({ preload: source });
  } catch {
    // The run loads its packages itself.
  }
}

function discardSpare() {
  spare?.worker.terminate();
  spare = undefined;
}

function startSpare() {
  if (spare || holders.size === 0) return;
  let worker: Worker;
  try {
    worker = startWorker();
  } catch {
    // A run then starts its own worker and reports the failure.
    return;
  }
  const failed = () => {
    if (spare?.worker === worker) spare = undefined;
    worker.terminate();
  };
  worker.onerror = failed;
  worker.onmessageerror = failed;
  spare = { worker, preloaded: new Set() };
  for (const source of holders.values()) preload(source);
}

/** The spare, or a new worker when there is none. The run sets its handlers. */
function takeWorker(): Worker {
  const taken = spare?.worker;
  spare = undefined;
  return taken ?? startWorker();
}

/**
 * Keeps a warm spare while a page shows a Python exercise. `source` is the
 * exercise's authored starter code and checks; the spare preloads the
 * packages it imports. Returns the release for when the page leaves.
 */
export function warmPython(source = ''): () => void {
  const holder = Symbol('Python page');
  holders.set(holder, source);
  clearTimeout(releaseTimer);
  releaseTimer = undefined;
  startSpare();
  preload(source);
  return () => {
    if (!holders.delete(holder) || holders.size) return;
    releaseTimer = setTimeout(() => {
      releaseTimer = undefined;
      if (!holders.size) discardSpare();
    }, SPARE_RELEASE_MS);
  };
}

/**
 * Each run uses an isolated, terminable worker that has never run other code.
 * Learner code never runs on the server.
 */
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
      // Prepare the next run's worker once the page has reacted: a page that
      // is closing has released its spare by then.
      queueMicrotask(startSpare);
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
      worker = takeWorker();
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
