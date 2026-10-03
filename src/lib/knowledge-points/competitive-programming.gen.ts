import {
  binomial,
  num,
  py,
  pyDiv,
  pyMod,
  series,
  typeNumber,
  typeOutput,
  type GeneratorModule,
} from './authoring';

// Competitive Programming: fresh numbers for work counts, prefix sums and
// difference arrays, binary-search bounds, bit operations, and modular
// arithmetic. Programs keep the shape of the authored question they vary;
// the catalog tests run sampled variants in Pyodide and compare the output.

const PRINT = 'What does this program print?';
const sum = (values: number[]) => values.reduce((total, x) => total + x, 0);
/** How Python prints a tuple. */
const tuple = (values: unknown[]) =>
  values.length === 1
    ? `(${py(values[0])},)`
    : `(${values.map(py).join(', ')})`;
const prefixOf = (values: number[]) =>
  values.reduce((table, x) => [...table, table.at(-1)! + x], [0]);
/** Steps of `probe *= 2` from 1 until probe >= target. */
const doublings = (target: number) => {
  let [probe, steps] = [1, 0];
  while (probe < target) [probe, steps] = [probe * 2, steps + 1];
  return steps;
};
const bits = (value: number) => value.toString(2);
const popcount = (value: number) => bits(value).replace(/0/g, '').length;
const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : Math.abs(a));
const modPow = (base: number, exponent: number, modulus: number) => {
  let result = 1 % modulus;
  base = pyMod(base, modulus);
  while (exponent) {
    if (exponent % 2) result = (result * base) % modulus;
    base = (base * base) % modulus;
    exponent = Math.floor(exponent / 2);
  }
  return result;
};
const PRIMES = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47];
const lowerBound = (values: number[], target: number) => {
  const index = values.findIndex((value) => value >= target);
  return index < 0 ? values.length : index;
};
/** `count` sorted integers from `min` to `max`, repeats allowed. */
const sortedInts = (
  r: Parameters<GeneratorModule[string]>[0],
  count: number,
  min: number,
  max: number,
) => r.ints(count, min, max).sort((a, b) => a - b);

const LOWER_BOUND = `def lower_bound(values, target):
    low = 0
    high = len(values)
    while low < high:
        mid = (low + high) // 2
        if values[mid] < target:
            low = mid + 1
        else:
            high = mid
    return low
`;
const MARK = `def mark(size, left, right, delta):
    marks = []
    for position in range(size):
        marks.append(0)
    marks[left] = marks[left] + delta
    marks[right] = marks[right] - delta
    return marks
`;
const APPLY = `def apply(size, updates):
    difference = [0] * (size + 1)
    for left, right, delta in updates:
        difference[left] += delta
        difference[right] -= delta
    values = []
    running = 0
    for index in range(size):
        running += difference[index]
        values.append(running)
    return values
`;
const EUCLID_STEP = `def euclid_step(a, b):
    return (b, a % b)
`;
const GCD = `def gcd(a, b):
    x, y = abs(a), abs(b)
    while y:
        x, y = y, x % y
    return x
`;
const GCD_LCM = `def gcd_lcm(a, b):
    x, y = abs(a), abs(b)
    while y:
        x, y = y, x % y
    multiple = 0 if a == 0 or b == 0 else abs((a // x) * b)
    return x, multiple
`;
const PRODUCT_RESIDUE = `def product_residue(a, b, modulus):
    return (a % modulus) * (b % modulus) % modulus
`;
const POWER_STEP = `def power_step(result, base, exponent, modulus):
    if exponent % 2:
        result = result * base % modulus
    else:
        result %= modulus
    return (result, base * base % modulus, exponent // 2)
`;
const MOD_POWER = `def mod_power(base, exponent, modulus):
    result = 1 % modulus
    base %= modulus
    while exponent:
        if exponent % 2:
            result = result * base % modulus
        base = base * base % modulus
        exponent //= 2
    return result
`;
const HAS_INVERSE = `from math import gcd

def has_modular_inverse(value, modulus):
    return gcd(value, modulus) == 1
`;
const PRIME_CANDIDATES = `def prime_candidates(limit):
    table = [True] * (limit + 1)
    table[0] = False
    if limit >= 1:
        table[1] = False
    return table
`;
const SQUARE_MULTIPLES = `def square_multiples(prime, limit):
    return list(range(prime * prime, limit + 1, prime))
`;
const SMALLEST_FACTOR = `def smallest_factor(n):
    candidate = 2
    while candidate * candidate <= n:
        if n % candidate == 0:
            return candidate
        candidate += 1
    return n
`;
const FACTOR_CANDIDATES = `def sieve_factor_candidates(limit):
    result = []
    candidate = 2
    while candidate * candidate <= limit:
        result.append(candidate)
        candidate += 1
    return result
`;
const PRIMES_UP_TO = `def primes_up_to(limit):
    if limit < 2:
        return []
    prime = [True] * (limit + 1)
    prime[0] = prime[1] = False
    p = 2
    while p * p <= limit:
        if prime[p]:
            for multiple in range(p * p, limit + 1, p):
                prime[multiple] = False
        p += 1
    return [value for value in range(2, limit + 1) if prime[value]]
`;
const CHOOSE_BOUNDARY = `def choose_boundary(n, k):
    if k < 0 or k > n:
        return 0
    if k == 0 or k == n:
        return 1
    return None
`;
const NEXT_PASCAL_ROW = `def next_pascal_row(previous, modulus):
    result = [1 % modulus]
    for index in range(1, len(previous)):
        result.append((previous[index - 1] + previous[index]) % modulus)
    result.append(1 % modulus)
    return result
`;
const ADD_COUNTING_ITEM = `def add_counting_item(previous, modulus):
    dp = previous[:]
    for selected in range(len(dp) - 1, 0, -1):
        dp[selected] = (dp[selected] + dp[selected - 1]) % modulus
    return dp
`;
const CHOOSE_MOD = `def choose_mod(n, k, modulus):
    if k < 0 or k > n:
        return 0
    k = min(k, n - k)
    dp = [0] * (k + 1)
    dp[0] = 1 % modulus
    for count in range(1, n + 1):
        for selected in range(min(count, k), 0, -1):
            dp[selected] = (dp[selected] + dp[selected - 1]) % modulus
    return dp[k]
`;
const pascalRow = (n: number) =>
  Array.from({ length: n + 1 }, (_, k) => binomial(n, k));

export const generators: GeneratorModule = {
  // cp-work-scan: Count visits, not values
  'cp-work-scan-kp1-q2': (r) => {
    const values = r.ints(r.int(3, 7), -6, 9);
    return typeOutput(
      'This scan keeps a work counter and a running total. What does it print?',
      `checks = 0\ntotal = 0\nfor value in ${py(values)}:\n    checks += 1\n    total += value\nprint(checks)\nprint(total)`,
      `${values.length}\n${sum(values)}`,
      `There are ${values.length} visits, one per item. The total of the values is a separate quantity: ${sum(values)}.`,
    );
  },
  // cp-work-pairs: Nested complete loops multiply
  'cp-work-pairs-kp1-q1': (r) => {
    const [rows, columns] = [r.int(2, 12), r.int(1, 9)];
    return typeOutput(
      PRINT,
      `checks = 0\nfor row in range(${rows}):\n    for column in range(${columns}):\n        checks += 1\nprint(checks)`,
      String(rows * columns),
      `${rows} outer passes each run ${columns} inner actions: ${rows} × ${columns} = ${rows * columns}.`,
    );
  },
  // cp-work-pairs: Loops in sequence add, and counting is not storing
  'cp-work-pairs-kp2-q2': (r) => {
    const [single, outer, inner] = [r.int(1, 9), r.int(2, 6), r.int(2, 6)];
    return typeOutput(
      'One loop runs alone, then a nested pair follows. What is printed?',
      `checks = 0\nfor i in range(${single}):\n    checks += 1\nfor i in range(${outer}):\n    for j in range(${inner}):\n        checks += 1\nprint(checks)`,
      String(single + outer * inner),
      `The first loop adds ${single}, and the nested loops add ${outer} × ${inner} = ${outer * inner} afterwards, for ${single + outer * inner}.`,
    );
  },
  // cp-work-doubling: Double a probe until it reaches the target
  'cp-work-doubling-kp1-q1': (r) => {
    const target = r.int(3, 2000);
    const steps = doublings(target);
    return typeOutput(
      PRINT,
      `probe = 1\nsteps = 0\nwhile probe < ${target}:\n    probe *= 2\n    steps += 1\nprint(steps)`,
      String(steps),
      `After ${steps} doublings the probe is ${2 ** steps}, the first power of 2 that is at least ${target}.`,
    );
  },
  // cp-work-doubling: Doubling steps grow logarithmically
  'cp-work-doubling-kp2-q4': (r) => {
    const k = r.int(2, 9);
    const target = r.pick([2 ** k - 1, 2 ** k, 2 ** k + 1]);
    const [a, b] = [doublings(target), doublings(target + 1)];
    return typeOutput(
      'Two targets that differ by one are checked. What is printed?',
      `for target in [${target}, ${target + 1}]:\n    probe = 1\n    steps = 0\n    while probe < target:\n        probe *= 2\n        steps += 1\n    print(steps)`,
      `${a}\n${b}`,
      a === b
        ? `Both targets are reached by the same power of 2, ${2 ** a}.`
        : `Target ${target} is reached at ${2 ** a}; target ${target + 1} needs one more doubling, to ${2 ** b}.`,
    );
  },
  // cp-complexity: Name the growth of each loop shape
  'cp-complexity-kp1-q3': (r) => {
    const n = r.int(3, 40);
    const steps = doublings(n);
    return typeOutput(
      PRINT,
      `n = ${n}\nchecks = 0\nfor i in range(n):\n    checks += 1\nfor i in range(n):\n    checks += 1\nprobe = 1\nwhile probe < n:\n    probe *= 2\n    checks += 1\nprint(checks)`,
      String(2 * n + steps),
      `The two scans add ${n} + ${n}, and the probe needs ${steps} doublings to reach ${n}: ${2 * n} + ${steps} = ${2 * n + steps}.`,
    );
  },
  // cp-complexity: Predict what happens when n doubles
  'cp-complexity-kp2-q3': (r) => {
    const [m, factor] = [r.int(2, 9), r.int(2, 4)];
    const large = m * factor;
    return typeOutput(
      PRINT,
      `small = 0\nfor i in range(${m}):\n    for j in range(${m}):\n        small += 1\nlarge = 0\nfor i in range(${large}):\n    for j in range(${large}):\n        large += 1\nprint(large // small)`,
      String(factor * factor),
      `The pair loops perform ${m * m} and ${large * large} checks. Multiplying n by ${factor} multiplies a quadratic count by ${factor * factor}.`,
    );
  },
  // cp-complexity: Separate time from extra space
  'cp-complexity-kp3-q4': (r) => {
    const n = r.int(3, 30);
    const count = (n * (n - 1)) / 2;
    return typeOutput(
      'The inner loop starts after i. What does this program print?',
      `n = ${n}\nchecks = 0\nfor i in range(n):\n    for j in range(i + 1, n):\n        checks += 1\nprint(checks)`,
      String(count),
      `The inner loop runs ${n - 1}, ${n - 2}, … down to 0 times: ${count} = ${n} · ${n - 1} / 2. That is about n²/2, still O(n²).`,
    );
  },
  // cp-prefix-boundaries: n values have n + 1 boundaries
  'cp-prefix-boundaries-kp1-q1': (r) => {
    const values = r.ints(r.int(1, 7), 0, 9);
    return typeOutput(
      PRINT,
      `values = ${py(values)}\nprint(list(range(len(values) + 1)))`,
      py(Array.from({ length: values.length + 1 }, (_, i) => i)),
      `${values.length} values have ${values.length + 1} boundaries, numbered 0 through ${values.length}.`,
    );
  },
  // cp-prefix-boundaries: Boundary 0 is the empty prefix
  'cp-prefix-boundaries-kp2-q3': (r) => {
    const values = r.ints(r.int(3, 6), 1, 12);
    const boundary = r.int(1, values.length);
    const total = sum(values.slice(0, boundary));
    return typeNumber(
      `values = ${py(values)}. What is the prefix total at boundary ${boundary}?`,
      total,
      boundary === 1
        ? `Boundary 1 covers only the first value, ${total}.`
        : `Boundary ${boundary} covers the first ${boundary} values, ${series(values.slice(0, boundary))}, which total ${total}.`,
    );
  },
  // cp-prefix-build: Append the previous total plus the next value
  'cp-prefix-build-kp1-q1': (r) => {
    const values = r.ints(r.int(2, 5), 1, 9);
    return typeOutput(
      PRINT,
      `prefix = [0]\nfor value in ${py(values)}:\n    prefix.append(prefix[-1] + value)\nprint(prefix)`,
      py(prefixOf(values)),
      'The table keeps the starting 0 and gains one running total per value.',
    );
  },
  // cp-prefix-build: Totals can fall, and an empty list gives [0]
  'cp-prefix-build-kp2-q1': (r) => {
    const values = r.ints(r.int(3, 5), -6, 6);
    if (values.every((x) => x >= 0)) values[0] = -values[0] - 1;
    return typeOutput(
      PRINT,
      `prefix = [0]\nfor value in ${py(values)}:\n    prefix.append(prefix[-1] + value)\nprint(prefix)`,
      py(prefixOf(values)),
      'Each entry is the previous total plus the next value, signs included.',
    );
  },
  // cp-prefix-query: Subtract two boundaries
  'cp-prefix-query-kp1-q1': (r) => {
    const values = r.ints(r.int(4, 6), 1, 9);
    const left = r.int(0, values.length - 2);
    const right = r.int(left + 1, values.length);
    const prefix = prefixOf(values);
    return typeOutput(
      `The values are ${py(values)}. What does this program print?`,
      `prefix = ${py(prefix)}\nprint(prefix[${right}] - prefix[${left}])`,
      String(prefix[right] - prefix[left]),
      right - left === 1
        ? `The range [${left}, ${right}) holds only position ${left}, whose value is ${values[left]}.`
        : `The range [${left}, ${right}) holds ${series(values.slice(left, right))}, which add to ${prefix[right] - prefix[left]}.`,
    );
  },
  // cp-prefix-query: Empty ranges, the end boundary and inclusive queries
  'cp-prefix-query-kp2-q2': (r) => {
    const values = r.ints(r.int(3, 5), -6, 9);
    const a = r.int(0, values.length - 1);
    const b = r.int(a, values.length - 1);
    const prefix = prefixOf(values);
    return typeOutput(
      `The values are ${py(values)}. What does this program print?`,
      `prefix = ${py(prefix)}\na = ${a}\nb = ${b}\nprint(prefix[b + 1] - prefix[a])`,
      String(prefix[b + 1] - prefix[a]),
      `The inclusive range [${a}, ${b}] becomes the half-open [${a}, ${b + 1}), whose values total ${prefix[b + 1] - prefix[a]}.`,
    );
  },
  // cp-prefix-sums: Build once, answer many queries
  'cp-prefix-sums-kp1-q1': (r) => {
    const values = r.ints(r.int(3, 5), -5, 9);
    const n = values.length;
    const queries = [0, 1].map(() => {
      const left = r.int(0, n - 1);
      return [left, r.int(left + 1, n)];
    });
    const prefix = prefixOf(values);
    const answers = queries.map(
      ([left, right]) => prefix[right] - prefix[left],
    );
    return typeOutput(
      PRINT,
      `values = ${py(values)}\nprefix = [0]\nfor value in values:\n    prefix.append(prefix[-1] + value)\nfor left, right in [${queries.map(tuple).join(', ')}]:\n    print(prefix[right] - prefix[left])`,
      answers.join('\n'),
      queries
        .map(([left, right], i) => `[${left}, ${right}) totals ${answers[i]}`)
        .join('; ')
        .concat('.'),
    );
  },
  // cp-prefix-sums: Why the formula works for every range
  'cp-prefix-sums-kp2-q2': (r) => {
    const values = r.ints(r.int(3, 5), 1, 9);
    const j = r.int(1, values.length - 1);
    const i = r.int(0, j - 1);
    const running = values.map((_, k) => sum(values.slice(0, k + 1)));
    return typeOutput(
      'This table omits the leading 0. What does this program print?',
      `values = ${py(values)}\nprefix = []\ntotal = 0\nfor value in values:\n    total += value\n    prefix.append(total)\nprint(prefix[${j}] - prefix[${i}])`,
      String(running[j] - running[i]),
      `Without boundary 0, prefix[${i}] already includes the value at position ${i}, so the subtraction keeps only ${j === i + 1 ? `position ${j}` : `positions ${i + 1} to ${j}`}: ${running[j] - running[i]}.`,
    );
  },
  // cp-difference-events: Empty ranges cancel and negative deltas work the same
  'cp-difference-events-kp2-q1': (r) => {
    const size = r.int(3, 7);
    const left = r.int(0, size - 2);
    const right = r.int(left, size - 1);
    const delta = r.pick([-9, -7, -5, -4, -3, -2, 2, 3, 4, 6, 8]);
    const marks = Array(size).fill(0);
    marks[left] += delta;
    marks[right] -= delta;
    return typeOutput(
      PRINT,
      `${MARK}\nprint(mark(${size}, ${left}, ${right}, ${delta}))`,
      py(marks),
      left === right
        ? `Both events land on boundary ${left} and cancel: the range [${left}, ${right}) is empty.`
        : `The start mark is the delta ${delta}, and the cancellation at ${right} is ${-delta}.`,
    );
  },
  // cp-difference-batch: One table of n + 1 entries collects every update
  'cp-difference-batch-kp1-q2': (r) => {
    const size = r.int(5, 7);
    const updates = [0, 1].map(() => {
      const left = r.int(0, size - 2);
      return [left, r.int(left + 1, size - 1), r.int(1, 6)];
    });
    const diff = Array(size).fill(0);
    for (const [left, right, delta] of updates) {
      diff[left] += delta;
      diff[right] -= delta;
    }
    return typeOutput(
      PRINT,
      `diff = [0] * ${size}\nfor left, right, delta in [${updates.map(tuple).join(', ')}]:\n    diff[left] += delta\n    diff[right] -= delta\nprint(diff)`,
      py(diff),
      'Each update adds its delta at its left boundary and subtracts it at its right one; events at the same boundary combine.',
    );
  },
  // cp-difference-batch: Overlapping updates add at shared boundaries
  'cp-difference-batch-kp2-q2': (r) => {
    const size = r.int(4, 7);
    const middle = r.int(1, size - 2);
    const [start, end] = [r.int(0, middle - 1), r.int(middle + 1, size - 1)];
    const [first, second] = [r.int(1, 6), r.int(1, 6)];
    const diff = Array(size).fill(0);
    for (const [left, right, delta] of [
      [start, middle, first],
      [middle, end, second],
    ]) {
      diff[left] += delta;
      diff[right] -= delta;
    }
    return typeOutput(
      PRINT,
      `diff = [0] * ${size}\nfor left, right, delta in [(${start}, ${middle}, ${first}), (${middle}, ${end}, ${second})]:\n    diff[left] += delta\n    diff[right] -= delta\nprint(diff)`,
      py(diff),
      `At boundary ${middle} the first update ends (${-first}) and the second starts (+${second}), so the entry there is ${diff[middle]}.`,
    );
  },
  // cp-difference-recover: A running sum turns events back into values
  'cp-difference-recover-kp1-q2': (r) => {
    const diff = r.ints(r.int(3, 5), -4, 5);
    diff.push(-sum(diff));
    const values = prefixOf(diff.slice(0, -1)).slice(1);
    return typeOutput(
      PRINT,
      `diff = ${py(diff)}\nrunning = 0\nvalues = []\nfor i in range(len(diff) - 1):\n    running += diff[i]\n    values.append(running)\nprint(values)`,
      py(values),
      'Each value is the cumulative sum of the entries up to its position; the last entry is the sentinel.',
    );
  },
  // cp-difference-recover: The sentinel is not a position
  'cp-difference-recover-kp2-q2': (r) => {
    const diff = r.ints(r.int(2, 4), -3, 5);
    diff.push(-sum(diff));
    const values = prefixOf(diff).slice(1);
    return typeOutput(
      'This loop also visits the sentinel. What does it print?',
      `diff = ${py(diff)}\nrunning = 0\nvalues = []\nfor i in range(len(diff)):\n    running += diff[i]\n    values.append(running)\nprint(values)`,
      py(values),
      `The extra iteration appends a value, 0, for a position that does not exist: the list has ${values.length} values for ${values.length - 1} positions.`,
    );
  },
  // cp-difference-arrays: Mark boundaries, then reconstruct once
  'cp-difference-arrays-kp1-q2': (r) => {
    const size = r.int(4, 6);
    const updates = [0, 1].map(() => {
      const left = r.int(0, size - 1);
      return [left, r.int(left + 1, size), r.int(1, 5)];
    });
    const values = Array(size).fill(0);
    for (const [left, right, delta] of updates)
      for (let i = left; i < right; i++) values[i] += delta;
    return typeOutput(
      PRINT,
      `${APPLY}\nprint(apply(${size}, [${updates.map(tuple).join(', ')}]))`,
      py(values),
      `Each position gets the delta of every update whose half-open range covers it.`,
    );
  },
  // cp-difference-arrays: Why the running sum is right
  'cp-difference-arrays-kp2-q2': (r) => {
    const updates = [0, 1, 2].map(() => {
      const left = r.int(0, 8);
      return [left, r.int(left, 10), r.int(1, 9)];
    });
    const position = r.int(0, 9);
    const covering = updates.filter(
      ([left, right]) => left <= position && position < right,
    );
    const value = sum(covering.map(([, , delta]) => delta));
    return typeNumber(
      `Updates are ${series(updates.map(tuple))}. What is the value at position ${position}?`,
      value,
      covering.length
        ? `Position ${position} lies in ${series(covering.map(([l, rr]) => `[${l}, ${rr})`))}, so its value is ${value}.`
        : `No half-open range covers position ${position}, so its value is 0.`,
    );
  },
  // cp-binary-midpoint: Floor division picks an index inside [low, high)
  'cp-binary-midpoint-kp1-q2': (r) => {
    const low = r.int(0, 40);
    const high = low + r.int(2, 9);
    const mid = pyDiv(low + high, 2);
    return typeOutput(
      PRINT,
      `low = ${low}\nhigh = ${high}\nmid = (low + high) // 2\nprint(mid)\nprint(low <= mid < high)`,
      `${mid}\nTrue`,
      `${low + high} // 2 is ${mid}, which is one of the candidates from ${low} to ${high - 1}.`,
    );
  },
  // cp-binary-midpoint: One-index and empty intervals
  'cp-binary-midpoint-kp2-q1': (r) => {
    const low = r.int(1, 99);
    return typeOutput(
      PRINT,
      `print((${low} + ${low + 1}) // 2)`,
      String(low),
      `${2 * low + 1} // 2 rounds down to ${low}, the only index in [${low}, ${low + 1}).`,
    );
  },
  // cp-binary-update: Skip a too-small midpoint, keep a qualifying one
  'cp-binary-update-kp1-q2': (r) => {
    const values = sortedInts(r, r.int(4, 7), 1, 20);
    const target = r.int(values[0], values.at(-1)! + 1);
    const mid = pyDiv(values.length, 2);
    const [low, high] =
      values[mid] < target ? [mid + 1, values.length] : [0, mid];
    return typeOutput(
      PRINT,
      `values = ${py(values)}\ntarget = ${target}\nlow = 0\nhigh = ${values.length}\nmid = (low + high) // 2\nif values[mid] < target:\n    low = mid + 1\nelse:\n    high = mid\nprint(low)\nprint(high)`,
      `${low}\n${high}`,
      values[mid] < target
        ? `values[${mid}] = ${values[mid]} is below ${target}, so low moves past the midpoint to ${mid + 1}.`
        : `values[${mid}] = ${values[mid]} qualifies, so high becomes ${mid} and index ${mid} stays a possible answer.`,
    );
  },
  // cp-binary-update: Every correct update shrinks the interval
  'cp-binary-update-kp2-q2': (r) => {
    const low = r.int(0, 20);
    const high = low + r.int(2, 12);
    const mid = pyDiv(low + high, 2);
    return typeOutput(
      PRINT,
      `low = ${low}\nhigh = ${high}\nmid = (low + high) // 2\nhigh = mid\nprint(high - low)`,
      String(mid - low),
      `mid is ${mid}, so the interval shrinks from [${low}, ${high}) to [${low}, ${mid}), which has ${mid - low} indices.`,
    );
  },
  // cp-binary-sentinel: A result of n means that no element qualifies
  'cp-binary-sentinel-kp1-q2': (r) => {
    const values = sortedInts(r, r.int(2, 5), 1, 20);
    const index = r.int(0, values.length);
    const inside = index < values.length;
    return typeOutput(
      PRINT,
      `values = ${py(values)}\nindex = ${index}\nif index < len(values):\n    print(values[index])\nelse:\n    print("none")`,
      inside ? String(values[index]) : 'none',
      inside
        ? `Index ${index} is inside the list, so its value is read.`
        : `The boundary ${index} equals the length, so it is checked before any read and reported as absence.`,
    );
  },
  // cp-binary-sentinel: Edge boundaries, and what a boundary counts
  'cp-binary-sentinel-kp2-q3': (r) => {
    const values = sortedInts(r, r.int(4, 7), 1, 12);
    const target = r.pick(values);
    const index = lowerBound(values, target);
    return typeOutput(
      `The lower bound of ${target} in this list is index ${index}. What does this program print?`,
      `values = ${py(values)}\nindex = ${index}\nprint(len(values) - index)`,
      String(values.length - index),
      `Every value from index ${index} on is at least ${target}: ${series(values.slice(index))}.`,
    );
  },
  // cp-binary-search: Loop until the interval is empty
  'cp-binary-search-kp1-q2': (r) => {
    const values = sortedInts(r, r.int(3, 7), 1, 40);
    const target = r.int(0, 42);
    const index = lowerBound(values, target);
    return typeOutput(
      PRINT,
      `${LOWER_BOUND}\nprint(lower_bound(${py(values)}, ${target}))`,
      String(index),
      index === values.length
        ? `No value is at least ${target}, so the result is the boundary n = ${index}.`
        : `The first value at least ${target} is ${values[index]}, at index ${index}.`,
    );
  },
  // cp-binary-search: Trace the invariant
  'cp-binary-search-kp2-q3': (r) => {
    const n = r.int(3, 20);
    const values = Array.from({ length: n }, (_, i) => i + 1);
    const target = r.pick([0, 100, r.int(1, n)]);
    let [low, high, steps] = [0, n, 0];
    while (low < high) {
      const mid = pyDiv(low + high, 2);
      steps += 1;
      if (values[mid] < target) low = mid + 1;
      else high = mid;
    }
    return typeOutput(
      PRINT,
      `values = list(range(1, ${n + 1}))\ntarget = ${target}\nlow = 0\nhigh = len(values)\nsteps = 0\nwhile low < high:\n    mid = (low + high) // 2\n    steps += 1\n    if values[mid] < target:\n        low = mid + 1\n    else:\n        high = mid\nprint(steps)`,
      String(steps),
      `Each step at least halves the undecided interval of ${n} indices; it is empty after ${steps} steps.`,
    );
  },
  // cp-binary-search: Cost and the sorted precondition
  'cp-binary-search-kp3-q4': (r) => {
    const values = sortedInts(r, r.int(4, 7), 1, 12);
    const target = r.int(1, 13);
    const index = lowerBound(values, target);
    return typeOutput(
      PRINT,
      `${LOWER_BOUND}\nvalues = ${py(values)}\nprint(len(values) - lower_bound(values, ${target}))`,
      String(values.length - index),
      index === values.length
        ? `No value is at least ${target}, so the lower bound is n = ${index} and the count is 0.`
        : `The lower bound of ${target} is ${index}, so the ${values.length - index} values from index ${index} on are at least ${target}.`,
    );
  },
  // cp-bit-position: Build a one-bit mask with a shift
  'cp-bit-position-kp1-q3': (r) => {
    const [a, b] = r.ints(2, 0, 9, true);
    return typeOutput(
      PRINT,
      `print((1 << ${a}) + (1 << ${b}))`,
      String(2 ** a + 2 ** b),
      `1 << ${a} is ${2 ** a} and 1 << ${b} is ${2 ** b}, and their sum ${2 ** a + 2 ** b} is binary ${bits(2 ** a + 2 ** b)}.`,
    );
  },
  // cp-bit-position: Test one position with &
  'cp-bit-position-kp2-q4': (r) => {
    const mask = r.int(1, 15);
    const present = [0, 1, 2, 3].map((k) => Boolean(mask & (1 << k)));
    return typeOutput(
      PRINT,
      `mask = ${mask}\nprint([bool(mask & (1 << k)) for k in range(4)])`,
      py(present),
      `${mask} is binary ${bits(mask).padStart(4, '0')}, read from position 0 on the right.`,
    );
  },
  // cp-bit-position: List the members of a mask
  'cp-bit-position-kp3-q1': (r) => {
    const mask = r.int(1, 31);
    const members = [0, 1, 2, 3, 4].filter((k) => mask & (1 << k));
    return typeOutput(
      PRINT,
      `mask = ${mask}\nprint([k for k in range(5) if mask & (1 << k)])`,
      py(members),
      `${mask} = ${members.map((k) => 2 ** k).join(' + ')}, which are positions ${series(members)}.`,
    );
  },
  // cp-bit-set-clear: Set a position with |
  'cp-bit-set-clear-kp1-q4': (r) => {
    const positions = r.ints(3, 0, 5);
    const mask = positions.reduce((m, k) => m | (1 << k), 0);
    return typeOutput(
      PRINT,
      `mask = 0\nfor k in ${py(positions)}:\n    mask |= 1 << k\nprint(mask)`,
      String(mask),
      `Positions ${series([...new Set(positions)].sort((a, b) => a - b))} are set once each, however often they appear: ${mask}.`,
    );
  },
  // cp-bit-set-clear: Clear a position with & ~
  'cp-bit-set-clear-kp2-q1': (r) => {
    const mask = r.int(1, 63);
    const k = r.int(0, 5);
    const result = mask & ~(1 << k);
    return typeOutput(
      PRINT,
      `mask = ${mask}\nprint(mask & ~(1 << ${k}))`,
      String(result),
      result === mask
        ? `Position ${k} is not in ${mask} (binary ${bits(mask)}), so clearing it changes nothing.`
        : `Clearing position ${k} from ${bits(mask)} leaves ${bits(result) || '0'} = ${result}.`,
    );
  },
  // cp-bit-set-clear: Apply a set-or-clear change
  'cp-bit-set-clear-kp3-q2': (r) => {
    const positions = r.ints(r.int(3, 5), 0, 4);
    const mask = positions.reduce((m, k) => m ^ (1 << k), 0);
    return typeOutput(
      PRINT,
      `mask = 0\nfor k in ${py(positions)}:\n    mask ^= 1 << k\nprint(mask)`,
      String(mask),
      'Each XOR toggles its position: a position listed an even number of times ends cleared, an odd number of times set.',
    );
  },
  // cp-bit-submask-step: Step to the next smaller submask
  'cp-bit-submask-step-kp1-q1': (r) => {
    const mask = r.int(3, 63);
    const next = (mask - 1) & mask;
    return typeOutput(
      PRINT,
      `mask = ${mask}\nprint((mask - 1) & mask)`,
      String(next),
      `${mask - 1} is ${bits(mask - 1)}; ANDing with ${bits(mask)} keeps ${next ? `${bits(next)}, which is ${next}` : 'nothing, so the result is 0'}.`,
    );
  },
  // cp-bit-submask-step: Count the submasks of a mask
  'cp-bit-submask-step-kp3-q1': (r) => {
    const mask = r.int(1, 255);
    const set = popcount(mask);
    return typeNumber(
      `How many submasks does mask = ${mask} (binary ${bits(mask)}) have?`,
      2 ** set,
      `${set === 1 ? 'One position is' : `${set} positions are`} set, giving $2^${set} = ${2 ** set}$ submasks.`,
    );
  },
  // cp-bitmasks: Keep the selection in one mask
  'cp-bitmasks-kp1-q1': (r) => {
    const changes = Array.from(
      { length: r.int(4, 6) },
      () => [r.int(0, 4), r.int(0, 2) > 0] as [number, boolean],
    );
    const mask = changes.reduce(
      (m, [k, present]) => (present ? m | (1 << k) : m & ~(1 << k)),
      0,
    );
    return typeOutput(
      PRINT,
      `mask = 0\nfor index, present in [${changes.map(tuple).join(', ')}]:\n    mask = mask | (1 << index) if present else mask & ~(1 << index)\nprint(mask)`,
      String(mask),
      `Only each position's last change counts, leaving ${mask === 0 ? 'no position set: 0' : `positions ${series([0, 1, 2, 3, 4].filter((k) => mask & (1 << k)))}: ${mask}`}.`,
    );
  },
  // cp-gcd-divisibility: Test divisibility with a zero remainder
  'cp-gcd-divisibility-kp1-q1': (r) => {
    const divisor = r.int(3, 9);
    const a = -r.int(1, 30);
    const b = divisor * r.int(0, 5);
    const c = r.int(1, 40);
    return typeOutput(
      PRINT,
      `print(${a} % ${divisor}, ${b} % ${divisor}, ${c} % ${divisor})`,
      `${pyMod(a, divisor)} ${pyMod(b, divisor)} ${pyMod(c, divisor)}`,
      `With a positive divisor Python returns a remainder from 0 to ${divisor - 1}: ${a} = ${divisor} × (${pyDiv(a, divisor)}) + ${pyMod(a, divisor)}, and ${b} is a multiple of ${divisor}.`,
    );
  },
  // cp-gcd-remainder-step: Replace (a, b) with (b, a % b)
  'cp-gcd-remainder-step-kp1-q1': (r) => {
    const b = r.int(2, 30);
    const a = r.int(1, 200);
    return typeOutput(
      PRINT,
      `${EUCLID_STEP}\nprint(euclid_step(${a}, ${b}))`,
      tuple([b, a % b]),
      `${a} = ${Math.floor(a / b)} × ${b} + ${a % b}, so the new pair is (${b}, ${a % b}).`,
    );
  },
  // cp-gcd-remainder-step: Shrink the second value until a zero remainder
  'cp-gcd-remainder-step-kp2-q1': (r) => {
    let pair = [0, 0];
    let steps: number[][] = [];
    do {
      pair = [r.int(20, 150), r.int(3, 40)];
      steps = [];
      let [a, b] = pair;
      for (let i = 0; i < 3 && b; i++) {
        [a, b] = [b, a % b];
        steps.push([a, b]);
      }
    } while (steps.length < 3 || steps[1][1] === 0);
    return typeOutput(
      PRINT,
      `${EUCLID_STEP}\nstep1 = euclid_step(${pair[0]}, ${pair[1]})\nstep2 = euclid_step(step1[0], step1[1])\nstep3 = euclid_step(step2[0], step2[1])\nprint(step1, step2, step3)`,
      steps.map(tuple).join(' '),
      `${pair[0]} % ${pair[1]} = ${steps[0][1]}, ${steps[0][0]} % ${steps[0][1]} = ${steps[1][1]}, and ${steps[1][0]} % ${steps[1][1]} = ${steps[2][1]}.`,
    );
  },
  // cp-gcd-lcm-zero: Divide by the gcd before multiplying
  'cp-gcd-lcm-zero-kp1-q4': (r) => {
    const g = r.int(2, 12);
    const [x, y] = r.pick([
      [1, 2],
      [2, 3],
      [3, 4],
      [2, 5],
      [3, 5],
      [4, 5],
      [3, 7],
      [5, 6],
    ]);
    const [a, b] = r.shuffle([g * x, g * y]);
    const lcm = (a / g) * b;
    return typeNumber(
      `a = ${a}, b = ${b}, and gcd(a, b) = ${g}. What is lcm(a, b)?`,
      lcm,
      `${a} // ${g} × ${b} = ${lcm}, the smallest positive multiple of both.`,
    );
  },
  // cp-gcd: Loop Euclid’s step until the remainder is zero
  'cp-gcd-kp1-q1': (r) => {
    const g = r.int(2, 15);
    const [a, b] = [g * r.int(2, 12), g * r.int(2, 12)];
    return typeOutput(
      PRINT,
      `${GCD}\nprint(gcd(${a}, ${b}))`,
      String(gcd(a, b)),
      `Euclid's steps reduce (${a}, ${b}) until the remainder is 0; the last nonzero value is ${gcd(a, b)}.`,
    );
  },
  // cp-gcd: Normalize signs and zeros first
  'cp-gcd-kp2-q4': (r) => {
    const g = r.int(2, 9);
    const [a, b] = [-g * r.int(1, 8), -g * r.int(2, 9)];
    return typeOutput(
      PRINT,
      `${GCD}\nprint(gcd(${a}, ${b}))`,
      String(gcd(-a, -b)),
      `After abs, the loop runs on (${-a}, ${-b}) and ends at ${gcd(-a, -b)}; a gcd is never negative.`,
    );
  },
  // cp-gcd: Derive the lcm from the gcd
  'cp-gcd-kp3-q1': (r) => {
    const [a, b] = [r.int(2, 30), r.int(2, 30)];
    const g = gcd(a, b);
    return typeOutput(
      PRINT,
      `${GCD_LCM}\nprint(gcd_lcm(${a}, ${b}))`,
      tuple([g, (a / g) * b]),
      `gcd(${a}, ${b}) = ${g}, and ${a} // ${g} × ${b} = ${(a / g) * b}.`,
    );
  },
  // cp-modular-residue: Read a % m as a residue from 0 to m - 1
  'cp-modular-residue-kp1-q1': (r) => {
    const m = r.int(3, 12);
    const a = -r.int(1, m - 1);
    const b = a - m * r.int(1, 3);
    const c = r.int(m + 1, 5 * m);
    return typeOutput(
      PRINT,
      `print(${a} % ${m}, ${b} % ${m}, ${c} % ${m})`,
      `${pyMod(a, m)} ${pyMod(b, m)} ${pyMod(c, m)}`,
      `${a} and ${b} differ by a multiple of ${m}, so they share residue ${pyMod(a, m)}. ${c} = ${Math.floor(c / m)} × ${m} + ${c % m}.`,
    );
  },
  // cp-modular-residue: Reduce operands before multiplying
  'cp-modular-residue-kp2-q1': (r) => {
    const m = r.int(5, 13);
    const a = r.pick([-1, 1]) * r.int(2, 30);
    const b = r.int(2, 30);
    const result = (pyMod(a, m) * pyMod(b, m)) % m;
    return typeOutput(
      PRINT,
      `${PRODUCT_RESIDUE}\nprint(product_residue(${a}, ${b}, ${m}))`,
      String(result),
      `${a} % ${m} = ${pyMod(a, m)} and ${b} % ${m} = ${pyMod(b, m)}; their product ${pyMod(a, m) * pyMod(b, m)} leaves ${result}, matching ${a * b} % ${m}.`,
    );
  },
  // cp-modular-square-step: Move one base factor into the result when the exponent is odd
  'cp-modular-square-step-kp1-q2': (r) => {
    const m = r.int(5, 13);
    const [result, base, exponent] = [
      r.int(1, m - 1),
      r.int(2, 9),
      r.int(2, 9),
    ];
    const next = exponent % 2 ? (result * base) % m : result % m;
    return typeOutput(
      PRINT,
      `${POWER_STEP}\nprint(power_step(${result}, ${base}, ${exponent}, ${m}))`,
      tuple([next, (base * base) % m, pyDiv(exponent, 2)]),
      `${exponent % 2 ? `The odd exponent moves a ${base} into the result: ${result} × ${base} % ${m} = ${next}.` : `The exponent is even, so the result stays ${next}.`} The base becomes ${base * base} % ${m} = ${(base * base) % m}, and ${exponent} halves to ${pyDiv(exponent, 2)}.`,
    );
  },
  // cp-modular-square-step: Square the base and halve the exponent
  'cp-modular-square-step-kp2-q4': (r) => {
    const exponent = r.int(5, 5000);
    const steps = exponent.toString(2).length;
    return typeNumber(
      `How many halving steps take exponent ${num(exponent)} down to 0?`,
      steps,
      `Each step drops one binary digit, and ${exponent} has ${steps} binary digits (${bits(exponent)}).`,
    );
  },
  // cp-modular-inverse-condition: An inverse exists exactly when gcd(b, m) = 1
  'cp-modular-inverse-condition-kp1-q2': (r) => {
    const m = r.pick([12, 14, 15, 18, 20, 21, 24, 26, 28, 30]);
    const units = Array.from({ length: m - 2 }, (_, i) => i + 2);
    const coprime = r.pick(units.filter((x) => gcd(x, m) === 1));
    const shared = r.pick(units.filter((x) => gcd(x, m) > 1));
    const [a, b] = r.shuffle([coprime, shared]);
    const answer = (x: number) => (gcd(x, m) === 1 ? 'True' : 'False');
    return typeOutput(
      PRINT,
      `${HAS_INVERSE}\nprint(has_modular_inverse(${a}, ${m}), has_modular_inverse(${b}, ${m}))`,
      `${answer(a)} ${answer(b)}`,
      `${coprime} and ${m} share no factor, so ${coprime} is invertible. ${shared} and ${m} share ${gcd(shared, m)}.`,
    );
  },
  // cp-modular-inverse-condition: Do not assume the modulus is prime
  'cp-modular-inverse-condition-kp2-q2': (r) => {
    const m = r.pick([8, 9, 10, 12, 14, 15, 16]);
    const value = -r.int(1, m - 1);
    const other = r.pick([0, m, 2 * m]);
    const answer = (x: number) => (gcd(x, m) === 1 ? 'True' : 'False');
    return typeOutput(
      PRINT,
      `${HAS_INVERSE}\nprint(has_modular_inverse(${value}, ${m}), has_modular_inverse(${other}, ${m}))`,
      `${answer(value)} ${answer(other)}`,
      `gcd(${value}, ${m}) = ${gcd(value, m)}, so ${value} is ${gcd(value, m) === 1 ? `invertible (its residue is ${pyMod(value, m)})` : 'not invertible'}. gcd(${other}, ${m}) = ${m}.`,
    );
  },
  // cp-modular: Exponentiate by repeated squaring
  'cp-modular-kp1-q2': (r) => {
    const [base, exponent, m] = [r.int(2, 9), r.int(2, 12), r.int(5, 31)];
    const result = modPow(base, exponent, m);
    return typeOutput(
      PRINT,
      `${MOD_POWER}\nprint(mod_power(${base}, ${exponent}, ${m}))`,
      String(result),
      `${base}^${exponent} = ${base ** exponent}, which leaves ${result} modulo ${m}.`,
    );
  },
  // cp-modular: Get the empty product, modulus 1, and negative bases right
  'cp-modular-kp2-q2': (r) => {
    const [base, exponent, m] = [-r.int(2, 9), r.int(2, 5), r.int(5, 13)];
    const result = modPow(base, exponent, m);
    return typeOutput(
      PRINT,
      `${MOD_POWER}\nprint(mod_power(${base}, ${exponent}, ${m}))`,
      String(result),
      `${base} becomes ${pyMod(base, m)}, and ${pyMod(base, m)}^${exponent} leaves ${result}, matching ${base ** exponent} % ${m}.`,
    );
  },
  // cp-modular: Divide only by invertible values
  'cp-modular-kp3-q1': (r) => {
    const p = r.pick([5, 7, 11, 13, 17, 19, 23]);
    const a = r.int(2, p - 1);
    const inverse = modPow(a, p - 2, p);
    return typeOutput(
      PRINT,
      `print(pow(${a}, -1, ${p}), ${a} * pow(${a}, -1, ${p}) % ${p})`,
      `${inverse} 1`,
      `${a} × ${inverse} = ${a * inverse} leaves 1 modulo ${p}, so ${inverse} is the inverse of ${a}.`,
    );
  },
  // cp-sieve-candidate-table: Give every integer from 0 to the limit its own entry
  'cp-sieve-candidate-table-kp1-q1': (r) => {
    const limit = r.int(1, 30);
    const k = r.int(0, limit);
    return typeOutput(
      PRINT,
      `${PRIME_CANDIDATES}\ntable = prime_candidates(${limit})\nprint(len(table), table[${k}])`,
      `${limit + 1} ${k >= 2 ? 'True' : 'False'}`,
      `${limit + 1} entries cover 0 through ${limit}, and ${k >= 2 ? `${k} has not been ruled out yet` : `${k} is excluded from the start`}.`,
    );
  },
  // cp-sieve-square-start: Begin a prime’s marking at p × p
  'cp-sieve-square-start-kp1-q1': (r) => {
    const p = r.pick([5, 7, 11, 13]);
    const limit = p * p + p * r.int(0, 5) + r.int(0, p - 1);
    const multiples: number[] = [];
    for (let m = p * p; m <= limit; m += p) multiples.push(m);
    return typeOutput(
      PRINT,
      `${SQUARE_MULTIPLES}\nprint(square_multiples(${p}, ${limit}))`,
      py(multiples),
      `The pass starts at ${p} × ${p} = ${p * p} and steps by ${p}; ${multiples.at(-1)} is the last multiple within the limit ${limit}.`,
    );
  },
  // cp-sieve-square-start: Step by p and include the limit
  'cp-sieve-square-start-kp2-q2': (r) => {
    const p = r.pick([2, 3]);
    const limit = r.int(p * p - 2, p * p + 4 * p);
    const multiples: number[] = [];
    for (let m = p * p; m <= limit; m += p) multiples.push(m);
    return typeOutput(
      PRINT,
      `${SQUARE_MULTIPLES}\nprint(square_multiples(${p}, ${limit}))`,
      py(multiples),
      multiples.length
        ? `Starting at ${p * p} and stepping by ${p}, the next value ${multiples.at(-1)! + p} would pass the limit ${limit}.`
        : `${p * p} is already above ${limit}, so the range is empty.`,
    );
  },
  // cp-sieve-factor-bound: Every composite up to n has a factor at most √n
  'cp-sieve-factor-bound-kp1-q1': (r) => {
    const [a, b] = [r.pick(PRIMES.slice(0, 10)), r.pick(PRIMES)];
    const n = r.int(0, 3) ? a * b : r.pick(PRIMES.slice(5));
    let factor = 2;
    while (factor * factor <= n && n % factor) factor++;
    const smallest = factor * factor <= n ? factor : n;
    return typeOutput(
      PRINT,
      `${SMALLEST_FACTOR}\nprint(smallest_factor(${n}))`,
      String(smallest),
      smallest === n
        ? `${n} has no factor up to √${n}, so it is prime and the function returns ${n}.`
        : `${n} = ${smallest} × ${n / smallest}, and ${smallest} × ${smallest} = ${smallest * smallest} is within the bound.`,
    );
  },
  // cp-sieve-factor-bound: Compare squares as integers
  'cp-sieve-factor-bound-kp2-q1': (r) => {
    const limit = r.int(4, 150);
    const candidates: number[] = [];
    for (let c = 2; c * c <= limit; c++) candidates.push(c);
    const last = candidates.at(-1)!;
    return typeOutput(
      PRINT,
      `${FACTOR_CANDIDATES}\nprint(sieve_factor_candidates(${limit}))`,
      py(candidates),
      `${last} × ${last} = ${last * last} <= ${limit}, while ${last + 1} × ${last + 1} = ${(last + 1) ** 2} is too large.`,
    );
  },
  // cp-sieve: Mark the multiples of each remaining prime
  'cp-sieve-kp1-q4': (r) => {
    const limit = r.int(10, 300);
    const isPrime = (n: number) => {
      for (let d = 2; d * d <= n; d++) if (n % d === 0) return false;
      return n >= 2;
    };
    const primes = Array.from({ length: limit + 1 }, (_, i) => i).filter(
      isPrime,
    );
    return typeOutput(
      PRINT,
      `${PRIMES_UP_TO}\nprint(len(primes_up_to(${limit})))`,
      String(primes.length),
      `There are ${primes.length} primes up to ${limit}, the last being ${primes.at(-1)}.`,
    );
  },
  // cp-sieve: Stop at √n and start at p²
  'cp-sieve-kp2-q3': (r) => {
    const n = r.int(10, 900);
    const passes = PRIMES.filter((p) => p * p <= n);
    const p = passes.at(-1)!;
    const next = PRIMES[passes.length];
    return typeNumber(
      `n = ${n}. What is the largest p whose marking pass runs?`,
      p,
      `${p} × ${p} = ${p * p} <= ${n} and ${next} × ${next} = ${next * next} > ${n}; composite candidates in between are skipped.`,
    );
  },
  // cp-combination-boundaries: Return 0 for impossible selections
  'cp-combination-boundaries-kp2-q1': (r) => {
    const n = r.int(2, 8);
    const ks = r
      .shuffle([n + r.int(1, 3), -r.int(1, 3), r.int(1, n - 1), r.pick([0, n])])
      .slice(0, 3);
    const value = (k: number) =>
      k < 0 || k > n ? 0 : k === 0 || k === n ? 1 : null;
    return typeOutput(
      PRINT,
      `${CHOOSE_BOUNDARY}\nprint([choose_boundary(${n}, k) for k in ${py(ks)}])`,
      py(ks.map(value)),
      'k above n or below 0 is impossible and counts 0; choosing none or all counts 1; anything else is an interior state.',
    );
  },
  // cp-combination-pascal-step: Reduce the sums modulo any positive modulus
  'cp-combination-pascal-step-kp2-q1': (r) => {
    const n = r.int(2, 7);
    const m = r.int(2, 12);
    const row = pascalRow(n);
    const next = pascalRow(n + 1).map((x) => x % m);
    return typeOutput(
      PRINT,
      `${NEXT_PASCAL_ROW}\nprint(next_pascal_row(${py(row)}, ${m}))`,
      py(next),
      `Row ${n + 1} is ${pascalRow(n + 1).join(', ')}, which leaves ${next.join(', ')} modulo ${m}.`,
    );
  },
  // cp-combination-descending-row: Update counts from the highest k down to 1
  'cp-combination-descending-row-kp1-q1': (r) => {
    const n = r.int(2, 8);
    const length = r.int(3, Math.min(5, n + 2));
    const previous = pascalRow(n).concat([0, 0]).slice(0, length);
    const next = pascalRow(n + 1)
      .concat([0, 0])
      .slice(0, length)
      .map((x) => x % 100);
    return typeOutput(
      PRINT,
      `${ADD_COUNTING_ITEM}\nprint(add_counting_item(${py(previous)}, 100))`,
      py(next),
      'Going downward, each entry adds the old value just below it before that value is updated.',
    );
  },
  // cp-combinatorics: Build C(n, k) one item at a time
  'cp-combinatorics-kp1-q1': (r) => {
    const n = r.int(5, 14);
    const k = r.int(2, n - 2);
    return typeOutput(
      PRINT,
      `${CHOOSE_MOD}\nprint(choose_mod(${n}, ${k}, 1000))`,
      String(binomial(n, k) % 1000),
      `C(${n}, ${k}) = ${binomial(n, k)}${binomial(n, k) >= 1000 ? `, which leaves ${binomial(n, k) % 1000} modulo 1000` : ''}.`,
    );
  },
  // cp-combinatorics: Avoid modular division for arbitrary moduli
  'cp-combinatorics-kp3-q2': (r) => {
    const n = r.int(6, 16);
    const k = r.int(2, n - 2);
    const m = r.pick([4, 6, 8, 9, 10, 12]);
    const exact = binomial(n, k);
    return typeOutput(
      PRINT,
      `${CHOOSE_MOD}\nprint(choose_mod(${n}, ${k}, ${m}))`,
      String(exact % m),
      `C(${n}, ${k}) = ${exact} = ${Math.floor(exact / m)} × ${m} + ${exact % m}, computed without any division.`,
    );
  },
  // cp-binary-lifting: Build max(1, n.bit_length()) doubling rows
  'cp-binary-lifting-kp1-q1': (r) => {
    const values = r.ints(3, 1, 300, true);
    return typeOutput(
      PRINT,
      `print(${values.map((v) => `(${v}).bit_length()`).join(', ')})`,
      values.map((v) => bits(v).length).join(' '),
      `${series(values.map((v) => `${v} = ${bits(v)} has ${bits(v).length}`))} bits.`,
    );
  },
};
