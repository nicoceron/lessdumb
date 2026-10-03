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

// Imports the modules of served packages that authored source names, such as
// `pandas` or `sklearn.linear_model`, in a scope of its own.
const preimport = `
import ast, importlib
try:
    tree = ast.parse(source)
except SyntaxError:
    tree = ast.Module(body=[], type_ignores=[])
for node in ast.walk(tree):
    if isinstance(node, ast.Import):
        names = [alias.name for alias in node.names]
    elif isinstance(node, ast.ImportFrom) and node.module and not node.level:
        names = [node.module]
    else:
        continue
    for name in names:
        if name.split(".")[0] in served:
            try:
                importlib.import_module(name)
            except Exception:
                pass
`;

/**
 * Loads and imports the served packages (NumPy, pandas, scikit-learn and
 * their dependencies) that an exercise's authored source imports, while the
 * worker waits for a run: importing pandas takes longer than loading it.
 * Only package code runs; the learner's program still imports what it uses.
 */
async function preload(source) {
  const python = await runtime;
  await python.loadPackagesFromImports(source);
  const served = Object.values(python.lockfile.packages).flatMap(
    (item) => item.imports ?? [],
  );
  const scope = python.toPy({ source, served });
  try {
    await python.runPythonAsync(preimport, { globals: scope });
  } finally {
    scope.destroy();
  }
}
let preloaded = Promise.resolve();
// One run per worker: a worker that has run code never runs more.
let used = false;

self.onmessage = async ({ data }) => {
  if (typeof data?.preload === 'string') {
    if (used) return;
    const source = data.preload;
    // A failed preload leaves the run to load and report it.
    preloaded = preloaded.then(() => preload(source)).catch(() => {});
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
