import type { CodeQuestion, Skill } from '../../curriculum';
import { withExerciseId } from '../exercise';

export const courseId = 'competitive-programming';

/**
 * Seconds a hidden large case may take on the reference machine. The runner
 * multiplies it by the device's measured slowness (`__lessdumb_time_scale`,
 * see public/python-runtime.mjs), so a slow phone gets a longer limit and a
 * fast computer a shorter one. Each case is sized so that, on the reference
 * machine, the reference solution has at least 8× headroom and every brute
 * force in tests/helpers/competitive-shortcuts.ts needs at least 8× the limit;
 * calibration keeps both margins on other devices. A case may pass its own
 * base limit to `_check_time` when no size achieves both: the sieve's trial
 * division is only about 18× slower than the sieve, so it uses 1.5 s, which
 * leaves 5× headroom and 3.5× over the limit.
 */
export const TIME_LIMIT_SECONDS = 3;

// Shared by every large case: deterministic pseudo-random input, an
// order-sensitive checksum for big results, and a wall-clock check whose
// message names the faster idea and the limit on this device. Underscored
// names avoid learner globals.
const largeCaseHelpers = `import time as _time

def _numbers(count, low, high, seed):
    # Deterministic pseudo-random integers in [low, high].
    state = seed
    span = high - low + 1
    result = []
    for _ in range(count):
        state = (state * 6364136223846793005 + 1442695040888963407) % 18446744073709551616
        result.append(low + (state >> 33) % span)
    return result

def _checksum(items):
    # Order-sensitive digest of nested lists or tuples of integers or None.
    total = 0
    for item in items:
        if isinstance(item, (list, tuple)):
            item = _checksum(item) + 7
        elif item is None:
            item = -1
        total = (total * 1000003 + item) % 2305843009213693951
    return total

def _timed(function, *arguments):
    start = _time.perf_counter()
    result = function(*arguments)
    return result, _time.perf_counter() - start

def _check_time(seconds, case, advice, base=${TIME_LIMIT_SECONDS}):
    limit = base * globals().get("__lessdumb_time_scale", 1)
    assert seconds < limit, f"{case} took {seconds:.1f} s; the limit on this device is {limit:.3g} s. {advice}"`;

/**
 * Appends a hidden large case after the small correctness checks, so an
 * exercise about an efficient algorithm rejects a brute-force solution that
 * would pass every small input.
 */
export function withLargeCase(tests: string, largeCase: string): string {
  return `${tests}\n\n${largeCaseHelpers}\n\n${largeCase}`;
}

// Exercises about implementing an algorithm disable the library shortcut
// during the checks. A shortcut captured at module level is rejected too.
const ruleHelpers = `import contextlib as _contextlib

@_contextlib.contextmanager
def _without(module, names, message):
    originals = [getattr(module, name) for name in names]
    for value in list(globals().values()):
        assert all(value is not original for original in originals), message
    def blocked(*arguments, **keywords):
        raise AssertionError(message)
    for name in names:
        setattr(module, name, blocked)
    try:
        yield
    finally:
        for name, original in zip(names, originals):
            setattr(module, name, original)`;

/** Runs checks indented inside a `with` block, so cleanup always happens. */
export function insideWith(
  setup: string,
  context: string,
  checks: string,
): string {
  const body = checks
    .split('\n')
    .map((line) => (line ? `    ${line}` : line))
    .join('\n');
  return `${setup}\nwith ${context}:\n${body}`;
}

/** Runs checks with the named module functions disabled. */
export function withoutShortcuts(
  setup: string,
  module: string,
  names: string[],
  message: string,
  checks: string,
): string {
  return insideWith(
    `${ruleHelpers}\n\n${setup}`,
    `_without(${module}, ${JSON.stringify(names)}, ${JSON.stringify(message)})`,
    checks,
  );
}

export function exercise(
  prompt: string,
  starterCode: string,
  solution: string,
  tests: string,
  explanation: string,
  hint: string,
): Omit<CodeQuestion, 'id'> {
  return {
    type: 'code',
    prompt,
    starterCode,
    solution,
    tests,
    explanation,
    hint,
  };
}

export function skill(
  id: string,
  unitId: string,
  title: string,
  summary: string,
  prerequisites: string[],
  paragraphs: string[],
  code: string,
  output: string,
  explanation: string,
  /** The code exercise; choice practice lives in knowledge points. */
  exercises: Omit<CodeQuestion, 'id'>[],
  cards: [string, string][],
): Skill {
  return {
    id,
    courseId,
    domain: 'programming',
    unitId,
    title,
    summary,
    prerequisites,
    order: 0,
    estimatedMinutes: 12,
    assessment: { requiredTypes: ['code', 'choice'], reviewAnswers: 2 },
    lesson: { paragraphs, example: { code, output, explanation } },
    questions: withExerciseId(id, exercises),
    flashcards: cards.map(([front, back], index) => ({
      id: `${id}-card${index + 1}`,
      skillId: id,
      front,
      back,
    })),
  };
}
