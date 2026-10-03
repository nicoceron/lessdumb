import { indexURL, loadPyodide } from '/pyodide/current.mjs';
import {
  calibrate,
  executePython,
  timeScale,
  usesTimeScale,
} from './python-runtime.mjs';

// Python starts loading as soon as the worker does, so a page can start a
// worker before the learner clicks and the run finds Python ready.
const runtime = loadPyodide({ indexURL });
// A failed load is reported to the run that needs Python.
runtime.catch(() => {});
// Packages the page's exercise imports, loaded while the worker waits.
// Finding imports parses the authored source; it runs none of it.
let preloaded = Promise.resolve();
// One run per worker: a worker that has run code never runs more.
let used = false;

self.onmessage = async ({ data }) => {
  if (typeof data?.preload === 'string') {
    if (used) return;
    const source = data.preload;
    preloaded = preloaded
      .then(async () => (await runtime).loadPackagesFromImports(source))
      .catch(() => {});
    return;
  }
  const { id, code, tests = '' } = data;
  let { calibration } = data;
  try {
    if (used) throw new Error('This Python worker has already run code.');
    used = true;
    const python = await runtime;
    await preloaded;
    await python.loadPackagesFromImports(`${code}\n${tests}`);
    // Timed checks scale their limit by this device's speed. The page caches
    // the measurement and sends it with later runs.
    if (usesTimeScale(tests) && !(calibration > 0)) {
      calibration = await calibrate(python);
      self.postMessage({ id, calibration });
    }
    self.postMessage({ id, ready: true });
    self.postMessage({
      id,
      ...(await executePython(python, code, tests, {
        timeScale: timeScale(calibration),
      })),
    });
  } catch (error) {
    self.postMessage({
      id,
      output: '',
      passed: false,
      error: String(error),
      infrastructure: true,
    });
  }
};
