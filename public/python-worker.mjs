import { loadPyodide } from '/pyodide/pyodide.mjs';
import { executePython } from './python-runtime.mjs';

const runtime = loadPyodide({ indexURL: '/pyodide/' });
self.onmessage = async ({ data }) => {
  const { id, code, tests = '' } = data;
  try {
    const python = await runtime;
    self.postMessage({ id, ready: true });
    self.postMessage({ id, ...(await executePython(python, code, tests)) });
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
