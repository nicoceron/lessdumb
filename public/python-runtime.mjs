// Device calibration for timed checks. A hidden large case's time limit is
// set for the reference machine (an Apple M4 Max in Chromium), where the
// benchmark below takes CALIBRATION_REFERENCE_SECONDS. A device that runs it
// k times slower (a low-end phone can be 5–20× slower) gets a limit k times
// longer, and a faster device a shorter one, so the gap between an efficient
// solution and brute force is the same on every device. The scale is clamped
// to [MIN_TIME_SCALE, MAX_TIME_SCALE]; the runner stops any run after 30 s.
export const CALIBRATION_REFERENCE_SECONDS = 0.025;
export const MIN_TIME_SCALE = 0.5;
export const MAX_TIME_SCALE = 10;

/** Multiplier for timed limits on a device whose benchmark took `seconds`. */
export function timeScale(seconds) {
  if (typeof seconds !== 'number' || !Number.isFinite(seconds) || seconds <= 0)
    return 1;
  const scale = Math.round((seconds / CALIBRATION_REFERENCE_SECONDS) * 10) / 10;
  return Math.min(MAX_TIME_SCALE, Math.max(MIN_TIME_SCALE, scale));
}

/** Only checks that read the scale need the benchmark. */
export const usesTimeScale = (tests) => tests.includes('__lessdumb_time_scale');

// Loops, list and dictionary updates, and a sort: the operations contest
// solutions spend their time on. Interference (garbage collection, code
// still compiling, other work) only slows a repetition down, so the fastest
// of three is the device's speed. Overestimating slowness is the dangerous
// direction: it would lengthen the limit for brute force too.
const benchmark = `
def __ld_benchmark():
    import time
    def work():
        state = 12345
        values = []
        for _ in range(50000):
            state = (state * 1103515245 + 12345) % 2147483648
            values.append(state % 1000)
        counts = {}
        for value in values:
            counts[value] = counts.get(value, 0) + 1
        prefix = [0]
        for value in values:
            prefix.append(prefix[-1] + value)
        order = sorted(values)
        total = 0
        for index in range(1, len(order)):
            total += order[index] - order[index - 1]
        return total + len(counts) + prefix[-1]
    times = []
    for _ in range(3):
        start = time.perf_counter()
        work()
        times.append(time.perf_counter() - start)
    return min(times)
__ld_benchmark()
`;

/** Seconds this device takes for the fixed benchmark (fastest of three). */
export async function calibrate(python) {
  return Number(await python.runPythonAsync(benchmark));
}

/**
 * Shared execution harness, also exercised with real Pyodide in the test suite.
 * `timeScale` is exposed to the checks as `__lessdumb_time_scale`.
 */
export async function executePython(
  python,
  code,
  tests = '',
  { timeScale: scale = 1 } = {},
) {
  python.globals.set('__ld_code', code);
  python.globals.set('__ld_tests', tests);
  python.globals.set('__ld_time_scale', scale);
  const result = await python.runPythonAsync(`
import io, contextlib, json

class _LessdumbOutput(io.TextIOBase):
    def __init__(self):
        self.buffer = io.StringIO()
        self.length = 0
        self.truncated = False
    def write(self, text):
        available = max(0, 12000 - self.length)
        kept = text[:available]
        self.buffer.write(kept)
        self.length += len(kept)
        if len(text) > available:
            self.truncated = True
        return len(text)
    def flush(self):
        pass
    def getvalue(self):
        return self.buffer.getvalue()

_buffer = _LessdumbOutput()
_test_buffer = _LessdumbOutput()
_namespace = {"__name__": "__main__"}
_passed, _error = True, None
try:
    with contextlib.redirect_stdout(_buffer), contextlib.redirect_stderr(_buffer):
        exec(__ld_code, _namespace)
    _namespace["__lessdumb_output"] = _buffer.getvalue()
    _namespace["__lessdumb_time_scale"] = __ld_time_scale
    with contextlib.redirect_stdout(_test_buffer), contextlib.redirect_stderr(_test_buffer):
        exec(__ld_tests, _namespace)
except BaseException as e:
    _passed = False
    _error = type(e).__name__ + ": " + str(e)
_output = _buffer.getvalue()
if _buffer.truncated:
    _notice = "\\n[Output truncated at 12,000 characters.]"
    _output = _output[:12000 - len(_notice)] + _notice
json.dumps({"output": _output, "passed": _passed, "error": _error, "infrastructure": False})
`);
  return JSON.parse(result);
}
