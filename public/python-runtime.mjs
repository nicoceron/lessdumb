/** Shared execution harness, also exercised with real Pyodide in the test suite. */
export async function executePython(python, code, tests = '') {
  python.globals.set('__ld_code', code);
  python.globals.set('__ld_tests', tests);
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
