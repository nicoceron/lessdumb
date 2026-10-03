import { loadPyodide } from '/pyodide/pyodide.mjs';
import {
  calibrate,
  executePython,
  timeScale,
  usesTimeScale,
} from './python-runtime.mjs';

const runtime = loadPyodide({ indexURL: '/pyodide/' });
self.onmessage = async ({ data }) => {
  const { id, code, tests = '' } = data;
  let { calibration } = data;
  try {
    const python = await runtime;
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
