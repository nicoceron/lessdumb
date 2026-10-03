import { typeOutput, type GeneratorModule, type Rng } from './authoring';

// Rust: fresh values for integer and float arithmetic, tuples and arrays,
// branches, match, loops and ranges, recursion, slices, Option and Result
// adapters, vectors, maps, sets, queues, iterator chains, fold, sorting and
// searching, checked arithmetic, and byte order. The catalog tests compile
// sampled variants with rustc in the same batch as the authored programs and
// compare each output with the generated answer.

const PRINT = 'What does this program print?';
const PRINTED = 'What is printed?';
const OUTPUT = 'What is the output of this program?';
const COMPLETE = 'What does this complete Rust program print?';

/**
 * A complete Rust program: helper functions, each followed by a blank line,
 * then main with its statements four spaces deep.
 */
function rust(main: string[], helpers: string[] = []): string {
  return [
    ...helpers,
    ['fn main() {', ...main.map((line) => `    ${line}`), '}'].join('\n'),
  ].join('\n\n');
}
/** A one-expression helper function: `fn name(params) -> type { body }`. */
const fn = (signature: string, ...body: string[]) =>
  [`fn ${signature} {`, ...body.map((line) => `    ${line}`), '}'].join('\n');

/** Draws from `make` until `ok` accepts, so constraints stay seeded. */
function until<T>(make: () => T, ok: (value: T) => boolean): T {
  for (let attempt = 0; attempt < 1000; attempt++) {
    const value = make();
    if (ok(value)) return value;
  }
  throw new Error('No value met the generator constraint.');
}

const list = (values: (number | string)[]) => `[${values.join(', ')}]`;
const sum = (values: number[]) => values.reduce((total, x) => total + x, 0);
const range = (from: number, to: number) =>
  Array.from({ length: Math.max(0, to - from) }, (_, i) => from + i);
const sorted = (values: number[]) => [...values].sort((a, b) => a - b);
/** An f64 literal: `4.0`, `2.75`. */
const f64 = (value: number) =>
  Number.isInteger(value) ? `${value}.0` : String(value);
/** A list of `size` values drawn from `pool`, each pool value at least once. */
function using(r: Rng, pool: number[], size: number): number[] {
  return until(
    () => Array.from({ length: size }, () => r.pick(pool)),
    (values) => pool.every((value) => values.includes(value)),
  );
}

export const generators: GeneratorModule = {
  // rust-format: Fill several {} placeholders in order
  'rust-format-kp1-q2': (r) => {
    const [a, b, c, d] = [r.int(2, 9), r.int(2, 9), r.int(0, 20), r.int(5, 20)];
    const e = r.int(1, d);
    return typeOutput(
      PRINTED,
      rust([`println!("{} {} {}", ${a} * ${b}, ${c}, ${d} - ${e});`]),
      `${a * b} ${c} ${d - e}`,
      `Each argument is evaluated, then fills the next {} in order: ${a} * ${b} is ${a * b}, then ${c}, then ${d} - ${e} is ${d - e}.`,
    );
  },
  // rust-format: Build a String with format!
  'rust-format-kp2-q3': (r) => {
    const [a, b] = until(
      () => [r.int(2, 30), r.int(2, 30)],
      ([x, y]) => x !== y,
    );
    return typeOutput(
      OUTPUT,
      rust(
        [`println!("{}", ratio(${a}, ${b}));`],
        [fn('ratio(a: i32, b: i32) -> String', 'format!("{}:{}", b, a)')],
      ),
      `${b}:${a}`,
      `format! fills its placeholders in argument order, and the arguments are b then a, so ratio(${a}, ${b}) returns the String ${b}:${a}.`,
    );
  },

  // rust-integers: Integer division drops the fraction
  'rust-integers-kp1-q2': (r) => {
    const [a, b] = until(
      () => [r.int(5, 60), r.int(2, 9)],
      ([x, y]) => x > y && x % y !== 0,
    );
    const quotient = Math.trunc(a / b);
    return typeOutput(
      PRINTED,
      rust([`println!("{}", -${a} / ${b});`]),
      String(-quotient),
      `Integer division truncates toward zero: -${a} / ${b} is between -${quotient} and -${quotient + 1}, and the fraction is dropped, giving -${quotient}.`,
    );
  },
  // rust-integers: Find the remainder with %
  'rust-integers-kp2-q3': (r) => {
    const [a, b] = until(
      () => [r.int(5, 60), r.int(2, 9)],
      ([x, y]) => x > y && x % y !== 0,
    );
    const remainder = a % b;
    return typeOutput(
      OUTPUT,
      rust([`println!("{}", -${a} % ${b});`]),
      String(-remainder),
      `The quotient -${a} / ${b} truncates to -${Math.trunc(a / b)}, and -${Math.trunc(a / b)} * ${b} is -${Math.trunc(a / b) * b}, so the remainder is -${remainder}: it takes the sign of the left operand.`,
    );
  },
  // rust-integers: Split a total into groups and leftovers
  'rust-integers-kp4-q1': (r) => {
    const size = r.int(3, 9);
    const players = r.int(size + 1, 60);
    const [q, rest] = [Math.trunc(players / size), players % size];
    return typeOutput(
      PRINT,
      rust(
        [`println!("{:?}", teams(${players}, ${size}));`],
        [
          fn(
            'teams(players: u32, size: u32) -> (u32, u32)',
            '(players / size, players % size)',
          ),
        ],
      ),
      `(${q}, ${rest})`,
      `${players} / ${size} is ${q} full teams, using ${q * size} players, and ${players} % ${size} is the ${rest} left over.`,
    );
  },
  // rust-integers: Split a total into groups and leftovers
  'rust-integers-kp4-q3': (r) => {
    const perBag = r.int(3, 12);
    const cookies = r.int(perBag + 1, 99);
    const [full, spare] = [Math.trunc(cookies / perBag), cookies % perBag];
    return typeOutput(
      OUTPUT,
      rust([
        `let cookies = ${cookies};`,
        `let per_bag = ${perBag};`,
        'let full = cookies / per_bag;',
        'let spare = cookies % per_bag;',
        'println!("{} bags, {} spare", full, spare);',
      ]),
      `${full} bags, ${spare} spare`,
      `${full} bags of ${perBag} hold ${full * perBag} cookies, and the remaining ${spare} are what % gives.`,
    );
  },

  // rust-floats: Use f64 for values with a fractional part
  'rust-floats-kp1-q1': (r) => {
    const b = r.pick([2, 4, 5, 8, 10, 16, 20, 25]);
    const a = until(
      () => r.int(1, 40),
      (x) => x % b !== 0,
    );
    return typeOutput(
      PRINT,
      rust([`println!("{}", ${a}.0 / ${b}.0);`]),
      String(a / b),
      `Both operands are f64, so the division keeps the fraction: ${a} / ${b} is ${a / b}.`,
    );
  },
  // rust-floats: Convert with as before dividing
  'rust-floats-kp3-q1': (r) => {
    const whole = r.pick([2, 4, 5, 8, 10, 16, 20, 25, 40]);
    const part = r.int(1, whole - 1);
    return typeOutput(
      PRINT,
      rust(
        [`println!("{}", share(${part}, ${whole}));`],
        [
          fn(
            'share(part: i32, whole: i32) -> f64',
            'part as f64 / whole as f64',
          ),
        ],
      ),
      String(part / whole),
      `Both integers are converted to f64 before dividing, so ${part} / ${whole} keeps its fraction: ${part / whole}.`,
    );
  },
  // rust-floats: Convert with as before dividing
  'rust-floats-kp3-q3': (r) => {
    const decimal = () => `${r.int(1, 99)}`.padStart(2, '0');
    const [a, b] = [r.int(1, 20), r.int(1, 9)];
    const [x, y] = [`${a}.${decimal()}`, `${b}.${decimal()}`];
    return typeOutput(
      OUTPUT,
      rust([`println!("{}", ${x} as i32);`, `println!("{}", -${y} as i32);`]),
      `${a}\n-${b}`,
      `as i32 truncates toward zero instead of rounding: ${x} becomes ${a}, and -${y} becomes -${b}, not -${b + 1}.`,
    );
  },
  // rust-floats: Compare computed floats with a tolerance
  'rust-floats-kp4-q1': (r) => {
    const [a, b] = until(
      () => [r.int(0, 40) / 4, r.int(0, 40) / 4],
      ([x, y]) => x !== y,
    );
    const gap = Math.abs(a - b);
    return typeOutput(
      PRINT,
      rust([
        `let a: f64 = ${f64(a)};`,
        `let b: f64 = ${f64(b)};`,
        'println!("{}", (a - b).abs());',
      ]),
      String(gap),
      `a - b is ${a - b}; abs() drops the sign, giving ${gap}. Quarters are exact in binary, so there is no rounding error${Number.isInteger(gap) ? ', and {} prints a whole f64 without .0' : ''}.`,
    );
  },

  // rust-tuples-arrays: Group values in a tuple and read fields by position
  'rust-tuples-arrays-kp1-q2': (r) => {
    const [m, k, n] = [r.int(2, 5), r.int(1, 9), r.int(2, 15)];
    return typeOutput(
      PRINTED,
      rust(
        [`let r = split(${n});`, 'println!("{}", r.0 + r.1);'],
        [fn('split(n: i32) -> (i32, i32)', `(n * ${m}, n - ${k})`)],
      ),
      String(n * m + n - k),
      `split(${n}) returns (${n * m}, ${n - k}). r.0 is ${n * m} and r.1 is ${n - k}, so the sum is ${n * m + n - k}.`,
    );
  },
  // rust-tuples-arrays: Pass arrays in and get tuples out
  'rust-tuples-arrays-kp4-q1': (r) => {
    const [a, b] = [r.int(1, 20), r.int(1, 20)];
    const c = a + r.int(1, 30);
    return typeOutput(
      PRINT,
      rust(
        [
          `let (gap, mid) = spread([${a}, ${b}, ${c}]);`,
          'println!("{}", gap);',
          'println!("{}", mid);',
        ],
        [fn('spread(v: [i32; 3]) -> (i32, i32)', '(v[2] - v[0], v[1])')],
      ),
      `${c - a}\n${b}`,
      `v[2] - v[0] is ${c} - ${a} = ${c - a}, and v[1] is ${b}. The tuple unpacks into gap and mid in that order.`,
    );
  },

  // rust-if: Choose among several cases with else if
  'rust-if-kp3-q1': (r) => {
    const score = r.int(50, 100);
    const grade = score >= 90 ? 4 : score >= 80 ? 3 : score >= 70 ? 2 : 0;
    return typeOutput(
      COMPLETE,
      rust(
        [`println!("{}", grade(${score}));`],
        [
          fn(
            'grade(score: i32) -> i32',
            'if score >= 90 {',
            '    4',
            '} else if score >= 80 {',
            '    3',
            '} else if score >= 70 {',
            '    2',
            '} else {',
            '    0',
            '}',
          ),
        ],
      ),
      String(grade),
      grade === 0
        ? `${score} is below 90, 80, and 70, so no test holds and the else branch gives 0.`
        : `The tests run from the top, and the first true one wins: ${score} >= ${grade * 10 + 50} is the first that holds, so grade returns ${grade}.`,
    );
  },

  // rust-match: Group values with | and ranges
  'rust-match-kp3-q1': (r) => {
    const level = (x: number) => (x <= 49 ? 1 : x <= 79 ? 2 : x <= 100 ? 3 : 0);
    const [a, b] = until(
      () => [r.int(0, 110), r.int(0, 110)],
      ([x, y]) => x !== y,
    );
    const describe = (x: number) =>
      x > 100
        ? `${x} matches no range, so _ gives 0`
        : `${x} falls in ${['', '0..=49', '50..=79', '80..=100'][level(x)]}, giving ${level(x)}`;
    return typeOutput(
      COMPLETE,
      rust(
        [`println!("{}", level(${a}));`, `println!("{}", level(${b}));`],
        [
          fn(
            'level(score: i32) -> i32',
            'match score {',
            '    0..=49 => 1,',
            '    50..=79 => 2,',
            '    80..=100 => 3,',
            '    _ => 0,',
            '}',
          ),
        ],
      ),
      `${level(a)}\n${level(b)}`,
      `Inclusive ranges contain both ends. ${describe(a)}; ${describe(b)}.`,
    );
  },
  // rust-match: Add conditions with match guards
  'rust-match-kp4-q1': (r) => {
    const discount = (q: number) =>
      q === 0 ? 0 : q >= 10 ? 20 : q >= 5 ? 10 : 5;
    const [a, b] = until(
      () => [r.int(0, 15), r.int(0, 15)],
      ([x, y]) => discount(x) !== discount(y),
    );
    const why = (q: number) =>
      q === 0
        ? '0 matches the literal arm'
        : q >= 10
          ? `${q} passes the guard q >= 10`
          : q >= 5
            ? `${q} fails q >= 10 but passes q >= 5`
            : `${q} fails both guards and falls to _`;
    return typeOutput(
      COMPLETE,
      rust(
        [`println!("{}", discount(${a}));`, `println!("{}", discount(${b}));`],
        [
          fn(
            'discount(qty: i32) -> i32',
            'match qty {',
            '    0 => 0,',
            '    q if q >= 10 => 20,',
            '    q if q >= 5 => 10,',
            '    _ => 5,',
            '}',
          ),
        ],
      ),
      `${discount(a)}\n${discount(b)}`,
      `Arms are tried in order: ${why(a)}, giving ${discount(a)}; ${why(b)}, giving ${discount(b)}.`,
    );
  },

  // rust-loop: Repeat with loop until break
  'rust-loop-kp1-q4': (r) => {
    const [factor, limit] = [r.int(2, 4), r.int(10, 200)];
    let [steps, x] = [0, 1];
    do {
      x *= factor;
      steps += 1;
    } while (x <= limit);
    return typeOutput(
      COMPLETE,
      rust([
        'let mut steps = 0;',
        'let mut x = 1;',
        'loop {',
        `    x *= ${factor};`,
        '    steps += 1;',
        `    if x > ${limit} {`,
        '        break;',
        '    }',
        '}',
        'println!("{} {}", steps, x);',
      ]),
      `${steps} ${x}`,
      `x takes the powers of ${factor}: after ${steps} ${steps === 1 ? 'pass' : 'passes'} it is ${x}, the first power above ${limit}, and the test after the multiplication breaks out.`,
    );
  },
  // rust-loop: Return a value with break
  'rust-loop-kp2-q2': (r) => {
    const step = r.int(3, 9);
    const off = until(
      () => r.int(step + 1, 60),
      (x) => x % step !== 0,
    );
    const on = step * r.int(2, 9);
    const next = Math.ceil(off / step) * step;
    const [first, second] = r.shuffle([off, on]);
    const result = (n: number) => (n === off ? next : on);
    return typeOutput(
      COMPLETE,
      rust(
        [
          `println!("{}", next_multiple(${first}, ${step}));`,
          `println!("{}", next_multiple(${second}, ${step}));`,
        ],
        [
          fn(
            'next_multiple(n: i32, step: i32) -> i32',
            'let mut x = n;',
            'loop {',
            '    if x % step == 0 {',
            '        break x;',
            '    }',
            '    x += 1;',
            '}',
          ),
        ],
      ),
      `${result(first)}\n${result(second)}`,
      `break x makes the loop's value x. ${off} is not a multiple of ${step}, so x counts up to ${next}; ${on} already is, so the first test breaks with ${on} itself.`,
    );
  },
  // rust-loop: Return a value with break
  'rust-loop-kp2-q3': (r) => {
    const [start, divisor] = [r.int(20, 500), r.int(2, 4)];
    let [x, count] = [start, 0];
    while (x >= 10) {
      x = Math.trunc(x / divisor);
      count += 1;
    }
    return typeOutput(
      COMPLETE,
      rust([
        `let mut x = ${start};`,
        'let mut count = 0;',
        'let steps = loop {',
        '    if x < 10 {',
        '        break count;',
        '    }',
        `    x /= ${divisor};`,
        '    count += 1;',
        '};',
        'println!("{} {}", steps, x);',
      ]),
      `${count} ${x}`,
      `Each pass divides x by ${divisor}, dropping the fraction. After ${count} ${count === 1 ? 'pass' : 'passes'} x is ${x}, below 10, so break count gives the loop the value ${count}.`,
    );
  },

  // rust-while: Change the tested value inside the body
  'rust-while-kp2-q4': (r) => {
    const n = r.int(1000, 99999);
    const digits = String(n).split('').map(Number);
    return typeOutput(
      COMPLETE,
      rust([
        `let mut n = ${n};`,
        'let mut sum = 0;',
        'while n > 0 {',
        '    sum += n % 10;',
        '    n /= 10;',
        '}',
        'println!("{}", sum);',
      ]),
      String(sum(digits)),
      `n % 10 takes the last digit and n /= 10 removes it, until n reaches 0: ${[...digits].reverse().join(' + ')} = ${sum(digits)}.`,
    );
  },
  // rust-while: Walk an array with an index
  'rust-while-kp3-q2': (r) => {
    const data = r.ints(r.int(5, 7), 1, 9);
    const picked = data.filter((_, i) => i % 2 === 0);
    const end = data.length % 2 === 0 ? data.length : data.length + 1;
    return typeOutput(
      COMPLETE,
      rust([
        `let data = ${list(data)};`,
        'let mut i = 0;',
        'let mut sum = 0;',
        'while i < data.len() {',
        '    sum += data[i];',
        '    i += 2;',
        '}',
        'println!("{} {}", sum, i);',
      ]),
      `${sum(picked)} ${end}`,
      `i visits indices 0, 2, 4, and so on: ${picked.join(' + ')} = ${sum(picked)}. The loop stops when i reaches ${end}, the first even index past the last element.`,
    );
  },
  // rust-while: Walk an array with an index
  'rust-while-kp3-q4': (r) => {
    const temps = r.ints(5, 10, 30);
    const threshold = r.int(15, 28);
    let i = 0;
    while (i < temps.length && temps[i] < threshold) i += 1;
    return typeOutput(
      COMPLETE,
      rust([
        `let temps = ${list(temps)};`,
        'let mut i = 0;',
        `while i < temps.len() && temps[i] < ${threshold} {`,
        '    i += 1;',
        '}',
        'println!("{}", i);',
      ]),
      String(i),
      i === temps.length
        ? `Every temperature is below ${threshold}, so i reaches temps.len(), ${i}, and the first test stops the loop before temps[${i}] is read.`
        : `The loop stops at the first temperature not below ${threshold}: temps[${i}] is ${temps[i]}, so i is ${i}.`,
    );
  },

  // rust-ranges: Count through a..b, stopping before b
  'rust-ranges-kp1-q2': (r) => {
    const a = r.int(0, 9);
    const b = a + r.int(2, 6);
    const values = range(a, b);
    return typeOutput(
      COMPLETE,
      rust([
        'let mut total = 0;',
        `for x in ${a}..${b} {`,
        '    total += x;',
        '}',
        'println!("{}", total);',
      ]),
      String(sum(values)),
      `${a}..${b} stops before ${b}, so x is ${values.join(', ')}, and the total is ${sum(values)}.`,
    );
  },
  // rust-ranges: Include the end with a..=b
  'rust-ranges-kp2-q4': (r) => {
    const a = r.int(1, 5);
    const b = a + r.int(1, 3);
    const values = range(a, b + 1);
    const squares = values.map((x) => x * x);
    return typeOutput(
      COMPLETE,
      rust([
        'let mut sum = 0;',
        `for x in ${a}..=${b} {`,
        '    sum += x * x;',
        '}',
        'println!("{}", sum);',
      ]),
      String(sum(squares)),
      `${a}..=${b} includes ${b}, so the squares are ${squares.join(' + ')} = ${sum(squares)}.`,
    );
  },
  // rust-ranges: Accumulate over a range chosen by the caller
  'rust-ranges-kp4-q1': (r) => {
    const [start, len] = [r.int(1, 20), r.int(2, 5)];
    const values = range(start, start + len);
    return typeOutput(
      COMPLETE,
      rust(
        [`println!("{}", window_sum(${start}, ${len}));`],
        [
          fn(
            'window_sum(start: i32, len: i32) -> i32',
            'let mut total = 0;',
            'for x in start..start + len {',
            '    total += x;',
            '}',
            'total',
          ),
        ],
      ),
      String(sum(values)),
      `start..start + len is ${start}..${start + len}: the ${len} values ${values.join(', ')}, which sum to ${sum(values)}.`,
    );
  },
  // rust-ranges: Accumulate over a range chosen by the caller
  'rust-ranges-kp4-q3': (r) => {
    const [base, exp] = [r.int(2, 9), r.int(0, 5)];
    return typeOutput(
      COMPLETE,
      rust(
        [`println!("{}", power(${base}, ${exp}));`],
        [
          fn(
            'power(base: i32, exp: i32) -> i32',
            'let mut result = 1;',
            'for _ in 0..exp {',
            '    result *= base;',
            '}',
            'result',
          ),
        ],
      ),
      String(base ** exp),
      exp === 0
        ? `0..0 is empty, so the body never runs and result keeps its starting value 1.`
        : `0..${exp} runs the body ${exp} ${exp === 1 ? 'time' : 'times'}, multiplying 1 by ${base} each time: $${base}^{${exp}} = ${base ** exp}$.`,
    );
  },

  // rust-recursion: Stop recursion with a base case
  'rust-recursion-kp1-q3': (r) => {
    const n = r.int(100, 99999);
    const digits = String(n).split('').map(Number);
    return typeOutput(
      COMPLETE,
      rust(
        [`println!("{}", digit_sum(${n}));`],
        [
          fn(
            'digit_sum(n: u32) -> u32',
            'if n < 10 {',
            '    n',
            '} else {',
            '    n % 10 + digit_sum(n / 10)',
            '}',
          ),
        ],
      ),
      String(sum(digits)),
      `Each call adds the last digit and recurses on the rest, until a single digit is left as the base case: ${[...digits].reverse().join(' + ')} = ${sum(digits)}.`,
    );
  },
  // rust-recursion: Shrink the input on every call
  'rust-recursion-kp2-q2': (r) => {
    const [n, divisor] = [r.int(10, 500), r.int(2, 5)];
    const chain = [n];
    while (chain[chain.length - 1] > 0)
      chain.push(Math.trunc(chain[chain.length - 1] / divisor));
    return typeOutput(
      COMPLETE,
      rust(
        [`println!("{}", steps_to_zero(${n}));`],
        [
          fn(
            'steps_to_zero(n: u32) -> u32',
            'if n == 0 {',
            '    0',
            '} else {',
            `    1 + steps_to_zero(n / ${divisor})`,
            '}',
          ),
        ],
      ),
      String(chain.length - 1),
      `The argument shrinks ${chain.join(', ')}. Each call before reaching 0 adds 1, so the result is ${chain.length - 1}.`,
    );
  },
  // rust-recursion: Recurse with several parameters
  'rust-recursion-kp4-q2': (r) => {
    const lo = r.int(1, 10);
    const hi = lo + r.int(1, 6);
    const values = range(lo, hi + 1);
    return typeOutput(
      COMPLETE,
      rust(
        [`println!("{}", sum_range(${lo}, ${hi}));`],
        [
          fn(
            'sum_range(lo: u32, hi: u32) -> u32',
            'if lo > hi {',
            '    0',
            '} else {',
            '    lo + sum_range(lo + 1, hi)',
            '}',
          ),
        ],
      ),
      String(sum(values)),
      `Each call adds lo and moves lo up by one until it passes ${hi}: ${values.join(' + ')} = ${sum(values)}.`,
    );
  },

  // rust-slices: Slice a range of elements
  'rust-slices-kp2-q1': (r) => {
    const values = r.ints(6, 1, 9);
    const start = r.int(0, 4);
    const end = r.int(start + 1, 6);
    return typeOutput(
      PRINT,
      rust([
        `let values = ${list(values)};`,
        `println!("{:?}", &values[${start}..${end}]);`,
      ]),
      list(values.slice(start, end)),
      `${start}..${end} takes indices ${start} up to but not including ${end}: ${end - start === 1 ? `just index ${start}` : `${range(start, end).join(', ')}`}.`,
    );
  },
  // rust-slices: Limit the end before slicing a prefix
  'rust-slices-kp4-q4': (r) => {
    const values = r.ints(r.int(3, 4), 1, 30);
    const short = r.int(1, values.length - 1);
    const long = r.int(values.length + 1, 9);
    const first = sum(values.slice(0, short));
    return typeOutput(
      'What does this program output?',
      rust(
        [
          `let v = ${list(values)};`,
          `println!("{} {}", sum_first(&v, ${short}), sum_first(&v, ${long}));`,
        ],
        [
          fn(
            'sum_first(values: &[i32], n: usize) -> i32',
            'let mut total = 0;',
            'for x in &values[..n.min(values.len())] {',
            '    total += x;',
            '}',
            'total',
          ),
        ],
      ),
      `${first} ${sum(values)}`,
      `sum_first(&v, ${short}) adds the first ${short}: ${first}. ${long} is past the end, so n.min(values.len()) caps it at ${values.length} and the whole array is summed: ${sum(values)}.`,
    );
  },

  // rust-option-map: Transform a present value with map
  'rust-option-map-kp1-q4': (r) => {
    const [add, factor, x] = [r.int(1, 9), r.int(2, 5), r.int(-5, 12)];
    const addFirst = r.int(0, 1) === 1;
    const result = addFirst ? (x + add) * factor : x * factor + add;
    const chain = addFirst ? '.map(plus).map(times)' : '.map(times).map(plus)';
    return typeOutput(
      PRINT,
      rust(
        [`println!("{:?}", Some(${x})${chain});`],
        [
          fn('plus(n: i32) -> i32', `n + ${add}`),
          fn('times(n: i32) -> i32', `n * ${factor}`),
        ],
      ),
      `Some(${result})`,
      addFirst
        ? `map applies each function to the value inside Some, in order: ${x} + ${add} is ${x + add}, then times ${factor} gives ${result}.`
        : `map applies each function to the value inside Some, in order: ${x} * ${factor} is ${x * factor}, then plus ${add} gives ${result}.`,
    );
  },
  // rust-option-and-then: Chain a step that can itself fail
  'rust-option-and-then-kp1-q4': (r) => {
    const limit = r.int(5, 20);
    const small = r.int(1, limit);
    const big = r.int(limit + 1, limit + 10);
    const [a, b] = r.shuffle([small, big]);
    const show = (n: number) => (n <= limit ? `Some(${n * 2})` : 'None');
    return typeOutput(
      PRINT,
      rust(
        [
          'println!(',
          '    "{:?} {:?}",',
          `    Some(${a}).and_then(double_small),`,
          `    Some(${b}).and_then(double_small)`,
          ');',
        ],
        [
          fn(
            'double_small(n: i32) -> Option<i32>',
            `if n <= ${limit} {`,
            '    Some(n * 2)',
            '} else {',
            '    None',
            '}',
          ),
        ],
      ),
      `${show(a)} ${show(b)}`,
      `and_then passes the payload to double_small and returns its Option directly. ${small} is at most ${limit}, giving Some(${small * 2}); ${big} is above it, giving None.`,
    );
  },

  // rust-result-map: Apply a function to the Ok value with map
  'rust-result-map-kp1-q1': (r) => {
    const cents = r.int(100, 990);
    const taxed = cents + Math.trunc(cents / 10);
    return typeOutput(
      PRINT,
      rust(
        [
          `let price: Result<i32, &str> = Ok(${cents});`,
          'println!("{:?}", price.map(add_tax));',
        ],
        [fn('add_tax(cents: i32) -> i32', 'cents + cents / 10')],
      ),
      `Ok(${taxed})`,
      `price is Ok, so map applies add_tax to ${cents}: ${cents} / 10 is ${Math.trunc(cents / 10)} in integer division, and the sum is ${taxed}, still wrapped in Ok.`,
    );
  },
  // rust-option-queries: Supply a default with unwrap_or
  'rust-option-queries-kp2-q2': (r) => {
    const even = 2 * r.int(1, 20);
    const odd = 2 * r.int(0, 19) + 1;
    const [a, b] = r.shuffle([even, odd]);
    const value = (n: number) => (n % 2 === 0 ? n / 2 : -1);
    return typeOutput(
      PRINTED,
      rust(
        [
          `println!("{} {}", half(${a}).unwrap_or(-1), half(${b}).unwrap_or(-1));`,
        ],
        [
          fn(
            'half(n: i32) -> Option<i32>',
            'if n % 2 == 0 {',
            '    Some(n / 2)',
            '} else {',
            '    None',
            '}',
          ),
        ],
      ),
      `${value(a)} ${value(b)}`,
      `half(${even}) is Some(${even / 2}), so unwrap_or returns ${even / 2}. ${odd} is odd, so half returns None and unwrap_or supplies the default -1.`,
    );
  },

  // rust-vec-push: Use a Vec as a stack
  'rust-vec-push-kp4-q3': (r) => {
    const [n, factor] = [r.int(3, 5), r.int(2, 9)];
    const values = range(0, n).map((i) => i * factor);
    const [a, b] = [values[n - 1], values[n - 2]];
    return typeOutput(
      PRINT,
      rust([
        'let mut v = Vec::new();',
        `for i in 0..${n} {`,
        `    v.push(i * ${factor});`,
        '}',
        'let a = v.pop();',
        'let b = v.pop();',
        'println!("{:?} {:?} {:?}", a, b, v);',
      ]),
      `Some(${a}) Some(${b}) ${list(values.slice(0, n - 2))}`,
      `The loop pushes ${values.join(', ')}. pop removes from the end, so a is Some(${a}), b is Some(${b}), and ${n - 2 === 1 ? 'one value remains' : `${n - 2} values remain`}.`,
    );
  },
  // rust-vec-get: Look up computed positions safely
  'rust-vec-get-kp3-q1': (r) => {
    const values = r.ints(r.int(3, 4), 1, 20);
    const inside = r.int(0, values.length - 2);
    const last = values.length - 1;
    const [a, b] = r.shuffle([inside, last]);
    const show = (i: number) =>
      i === last ? 'None' : `Some(${values[i + 1]})`;
    return typeOutput(
      PRINT,
      rust(
        [
          `let v = ${list(values)};`,
          `println!("{:?} {:?}", after(&v, ${a}), after(&v, ${b}));`,
        ],
        [
          fn(
            'after(values: &[i32], i: usize) -> Option<i32>',
            'values.get(i + 1).copied()',
          ),
        ],
      ),
      `${show(a)} ${show(b)}`,
      `after(&v, ${inside}) reads index ${inside + 1}, which holds ${values[inside + 1]}. after(&v, ${last}) asks for index ${last + 1}, past the end, so get returns None instead of panicking.`,
    );
  },
  // rust-vec-retain: Combine conditions in one predicate
  'rust-vec-retain-kp3-q1': (r) => {
    const low = r.int(0, 3);
    const high = low + r.int(3, 6);
    const values = until(
      () => r.ints(5, 0, 9),
      (v) =>
        v.some((n) => n > low && n < high) &&
        v.some((n) => !(n > low && n < high)),
    );
    const kept = values.filter((n) => n > low && n < high);
    return typeOutput(
      PRINT,
      rust(
        [
          `let mut v = vec!${list(values)};`,
          'v.retain(in_range);',
          'println!("{:?}", v);',
        ],
        [fn('in_range(n: &i32) -> bool', `*n > ${low} && *n < ${high}`)],
      ),
      list(kept),
      `retain keeps, in their original order, the values strictly between ${low} and ${high}: ${kept.join(', ')}. Both bounds are excluded.`,
    );
  },
  // rust-vec-extend: Append a range with extend
  'rust-vec-extend-kp1-q2': (r) => {
    const [first, last] = [r.int(0, 9), r.int(0, 9)];
    const from = r.int(1, 8);
    const to = from + r.int(1, 3);
    const result = [first, ...range(from, to), last];
    return typeOutput(
      PRINTED,
      rust([
        'let mut v = Vec::new();',
        `v.push(${first});`,
        `v.extend(${from}..${to});`,
        `v.push(${last});`,
        'println!("{:?}", v);',
      ]),
      list(result),
      `extend appends every value of ${from}..${to}, which stops before ${to}, after the ${first}; the last push adds ${last} at the end.`,
    );
  },

  // rust-map-entry: Count occurrences in one pass
  'rust-map-entry-kp2-q1': (r) => {
    const rolls = r.ints(5, 1, 6);
    const present = r.pick(rolls);
    const absent = until(
      () => r.int(1, 6),
      (x) => !rolls.includes(x),
    );
    const n = rolls.filter((x) => x === present).length;
    const distinct = new Set(rolls).size;
    return typeOutput(
      PRINT,
      rust([
        `let rolls = ${list(rolls)};`,
        'let mut counts = std::collections::HashMap::new();',
        'for &r in &rolls {',
        '    *counts.entry(r).or_insert(0) += 1;',
        '}',
        `println!("{:?} {:?} {}", counts.get(&${present}), counts.get(&${absent}), counts.len());`,
      ]),
      `Some(${n}) None ${distinct}`,
      `Each roll adds one to its own entry: ${present} appears ${n} ${n === 1 ? 'time' : 'times'}, ${absent} never appears so get returns None, and there are ${distinct} distinct keys.`,
    );
  },
  // rust-hash-set: A set keeps one copy of each value
  'rust-hash-set-kp1-q1': (r) => {
    const make = () => {
      const pool = r.sample([1, 2, 3, 4, 5, 6, 7, 8, 9], r.int(1, 3));
      return using(r, pool, r.int(pool.length + 1, 5));
    };
    const [a, b] = [make(), make()];
    const [da, db] = [new Set(a).size, new Set(b).size];
    return typeOutput(
      PRINT,
      rust(
        [`println!("{} {}", distinct(&${list(a)}), distinct(&${list(b)}));`],
        [
          fn(
            'distinct(values: &[i32]) -> usize',
            'let mut seen = std::collections::HashSet::new();',
            'for &v in values {',
            '    seen.insert(v);',
            '}',
            'seen.len()',
          ),
        ],
      ),
      `${da} ${db}`,
      `Inserting a value the set already holds changes nothing, so len counts distinct values: ${da} in the first slice and ${db} in the second.`,
    );
  },
  // rust-btree-range: Visit only the keys inside a range
  'rust-btree-range-kp2-q2': (r) => {
    const keys = sorted(r.sample([1, 2, 3, 4, 5, 6, 7, 8, 9], 3));
    const values = [10, 20, 30];
    const low = r.int(1, keys[1]);
    const high = r.int(keys[1], 9);
    const inside = keys.filter((k) => k >= low && k <= high);
    const total = sum(inside.map((k) => values[keys.indexOf(k)]));
    return typeOutput(
      PRINT,
      rust([
        'let mut m = std::collections::BTreeMap::new();',
        ...keys.map((k, i) => `m.insert(${k}, ${values[i]});`),
        'let mut total = 0;',
        `for (_, v) in m.range(${low}..=${high}) {`,
        '    total += v;',
        '}',
        'println!("{}", total);',
      ]),
      String(total),
      `${low}..=${high} includes both ends, so it visits the keys ${inside.join(', ')}, whose values sum to ${total}.`,
    );
  },
  // rust-vecdeque: Keep a sliding window of recent values
  'rust-vecdeque-kp3-q1': (r) => {
    const size = r.int(2, 3);
    const values = r.ints(r.int(size + 2, 6), 1, 9);
    return typeOutput(
      PRINT,
      rust([
        'let mut window = std::collections::VecDeque::new();',
        `for &n in &${list(values)} {`,
        '    window.push_back(n);',
        `    if window.len() > ${size} {`,
        '        window.pop_front();',
        '    }',
        '}',
        'println!("{:?}", window);',
      ]),
      list(values.slice(-size)),
      `Each new value joins at the back, and whenever the window grows past ${size} the oldest leaves from the front, so the last ${size} values remain, oldest first.`,
    );
  },

  // rust-iterator-lazy: Adapters wait until something consumes them
  'rust-iterator-lazy-kp1-q4': (r) => {
    const prices = r.ints(3, 1, 20);
    const fee = r.int(1, 5);
    const total = sum(prices) + 3 * fee;
    return typeOutput(
      PRINT,
      rust([
        `let prices = ${list(prices)};`,
        `let fee = ${fee};`,
        'let total: i32 = prices.iter().map(|p| p + fee).sum();',
        'println!("{}", total);',
      ]),
      String(total),
      `sum consumes the iterator, so map adds the fee to each price: ${prices.map((p) => p + fee).join(' + ')} = ${total}.`,
    );
  },
  // rust-map-filter: map transforms, and the order of steps matters
  'rust-map-filter-kp2-q1': (r) => {
    const factor = r.int(2, 3);
    const scores = r.ints(4, 1, 9);
    const scaled = scores.map((s) => s * factor);
    const threshold = until(
      () => r.int(4, 20),
      (t) => scaled.some((s) => s > t) && scaled.some((s) => s <= t),
    );
    const kept = scaled.filter((s) => s > threshold);
    return typeOutput(
      PRINT,
      rust([
        `let scores = ${list(scores)};`,
        `let total: i32 = scores.iter().copied().map(|s| s * ${factor}).filter(|s| *s > ${threshold}).sum();`,
        'println!("{}", total);',
      ]),
      String(sum(kept)),
      `map runs first, giving ${scaled.join(', ')}; filter then keeps the values above ${threshold}: ${kept.join(' + ')} = ${sum(kept)}.`,
    );
  },
  // rust-fold: fold carries an accumulator through every item
  'rust-fold-kp1-q2': (r) => {
    const values = r.ints(3, 1, 9);
    const start = r.int(10, 40);
    return typeOutput(
      OUTPUT,
      rust([
        `let left = ${list(values)}.iter().fold(${start}, |acc, n| acc - n);`,
        'println!("{}", left);',
      ]),
      String(start - sum(values)),
      `The accumulator starts at ${start} and each item is subtracted in turn: ${start} - ${values.join(' - ')} = ${start - sum(values)}.`,
    );
  },
  // rust-fold: The accumulator can have its own type
  'rust-fold-kp2-q4': (r) => {
    const values = r.ints(r.int(3, 4), 1, 5);
    const product = values.reduce((total, x) => total * x, 1);
    return typeOutput(
      PRINT,
      rust([
        `let r = ${list(values)}.iter().fold((0, 1), |acc, n| (acc.0 + n, acc.1 * n));`,
        'println!("{} {}", r.0, r.1);',
      ]),
      `${sum(values)} ${product}`,
      `The tuple accumulator tracks two results at once: a sum starting at 0, ${values.join(' + ')} = ${sum(values)}, and a product starting at 1, ${values.join(' * ')} = ${product}.`,
    );
  },

  // rust-sort-dedup: Sort first so equal values become neighbours
  'rust-sort-dedup-kp2-q1': (r) => {
    const pool = r.sample([1, 2, 3, 4, 5, 6, 7, 8, 9], r.int(3, 4));
    const values = using(r, pool, 6);
    const distinct = sorted(pool);
    return typeOutput(
      PRINT,
      rust([
        `let mut v = vec!${list(values)};`,
        'v.sort();',
        'v.dedup();',
        'println!("{:?}", v);',
      ]),
      list(distinct),
      `sort puts equal values next to each other, so dedup can remove every repeat, leaving each distinct value once in ascending order.`,
    );
  },
  // rust-binary-search: The lower bound is the first position not below the target
  'rust-binary-search-kp1-q1': (r) => {
    const values = sorted(r.ints(5, 1, 9));
    const targets = [r.int(1, 9), r.int(0, 10), r.int(0, 10)];
    const bound = (t: number) => values.filter((x) => x < t).length;
    return typeOutput(
      PRINT,
      rust(
        [
          `let values = ${list(values)};`,
          `println!("{} {} {}", ${targets.map((t) => `lower_bound(&values, ${t})`).join(', ')});`,
        ],
        [
          fn(
            'lower_bound(values: &[i32], target: i32) -> usize',
            'let mut i = 0;',
            'while i < values.len() && values[i] < target {',
            '    i += 1;',
            '}',
            'i',
          ),
        ],
      ),
      targets.map(bound).join(' '),
      `The lower bound counts the values below the target, which is the index of the first value not below it: ${targets.map((t) => `${t} gives ${bound(t)}`).join(', ')}.`,
    );
  },
  // rust-checked-arithmetic: checked_mul and checked_add report overflow as None
  'rust-checked-arithmetic-kp1-q1': (r) => {
    const a = r.int(200, 250);
    const room = 255 - a;
    const fits = r.int(1, room);
    const over = r.int(room + 1, room + 10);
    return typeOutput(
      PRINT,
      rust([
        `let a: u8 = ${a};`,
        `println!("{:?} {:?}", a.checked_add(${fits}), a.checked_add(${over}));`,
      ]),
      `Some(${a + fits}) None`,
      `A u8 holds at most 255. ${a} + ${fits} is ${a + fits}, which fits, so it is Some(${a + fits}); ${a} + ${over} would be ${a + over}, so checked_add returns None instead of overflowing.`,
    );
  },
  // rust-byte-order: Big-endian and little-endian reverse the bytes
  'rust-byte-order-kp1-q1': (r) => {
    const [a, b] = until(
      () => [r.int(0, 9), r.int(0, 9)],
      ([x, y]) => x !== y,
    );
    return typeOutput(
      PRINT,
      rust([
        `println!("{} {}", u16::from_be_bytes([${a}, ${b}]), u16::from_le_bytes([${a}, ${b}]));`,
      ]),
      `${a * 256 + b} ${b * 256 + a}`,
      `Big-endian puts the most significant byte first: ${a} * 256 + ${b} = ${a * 256 + b}. Little-endian puts it last: ${b} * 256 + ${a} = ${b * 256 + a}.`,
    );
  },
  // rust-heap-selection: BinaryHeap hands out its greatest element first
  'rust-heap-selection-kp1-q1': (r) => {
    const values = r.ints(3, 1, 20, true);
    const pushed = r.int(1, 20);
    const [a, b, c] = sorted(values).reverse();
    const top = Math.max(c, pushed);
    return typeOutput(
      PRINT,
      rust([
        'let mut heap = std::collections::BinaryHeap::new();',
        ...values.map((v) => `heap.push(${v});`),
        'let a = heap.pop();',
        'let b = heap.pop();',
        `heap.push(${pushed});`,
        'println!("{:?} {:?} {:?}", a, b, heap.peek());',
      ]),
      `Some(${a}) Some(${b}) Some(${top})`,
      `pop always removes the greatest value: ${a}, then ${b}. That leaves ${c}; after pushing ${pushed}, peek shows the greater of the two, ${top}.`,
    );
  },
};
