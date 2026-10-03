import { num, typeOutput, type GeneratorModule, type Rng } from './authoring';

// C++: fresh values for integer arithmetic and wraparound, casts, characters,
// bit operations, loops, arrays, strings, vectors, iterators, pairs, maps,
// sets, heaps, and the standard algorithms. The catalog tests compile sampled
// variants with clang++ or g++ in the same batch as the authored programs and
// compare each output with the generated answer.

const PRINT = 'What does this program print?';
const COMPLETE = 'What does this complete C++20 program print?';

/**
 * A complete C++20 program: sorted headers (iostream always), optional helper
 * definitions, then main's statements, two spaces deep. main never returns a
 * value, so the batched test harness can run it as a void function.
 */
function cpp(body: string[], headers: string[] = [], helpers = ''): string {
  return [
    ...[...new Set(['iostream', ...headers])]
      .sort()
      .map((header) => `#include <${header}>`),
    ...(helpers ? [helpers] : []),
    'int main() {',
    ...body.map((line) => `  ${line}`),
    '}',
  ].join('\n');
}

/** Draws from `make` until `ok` accepts, so constraints stay seeded. */
function until<T>(make: () => T, ok: (value: T) => boolean): T {
  for (let attempt = 0; attempt < 1000; attempt++) {
    const value = make();
    if (ok(value)) return value;
  }
  throw new Error('No value met the generator constraint.');
}

const list = (values: number[]) => `{${values.join(', ')}}`;
const bin4 = (value: number) => value.toString(2).padStart(4, '0');
const hex = (value: number, digits: number) =>
  value.toString(16).toUpperCase().padStart(digits, '0');
const sum = (values: number[]) => values.reduce((total, x) => total + x, 0);
const count = (values: number[], value: number) =>
  values.filter((x) => x === value).length;
const sorted = (values: number[]) => [...values].sort((a, b) => a - b);
const times = (n: number) => (n === 1 ? 'time' : 'times');
/** A list of `size` values drawn from `pool`, each pool value at least once. */
function using(r: Rng, pool: number[], size: number): number[] {
  return until(
    () => Array.from({ length: size }, () => r.pick(pool)),
    (values) => pool.every((value) => values.includes(value)),
  );
}

const WORDS = [
  'kernel',
  'socket',
  'buffer',
  'thread',
  'vector',
  'packet',
  'cursor',
  'module',
  'signal',
  'stream',
];
/** Words with at least one letter that occurs twice or more. */
const REPEATING = [
  'banana',
  'letter',
  'pepper',
  'rotor',
  'kayak',
  'coffee',
  'parrot',
  'cookie',
  'mammal',
  'radar',
];

export const generators: GeneratorModule = {
  // cpp-integer-values: Copy a value into another int
  'cpp-integer-values-kp2-q3': (r) => {
    const [first, factor] = [r.int(2, 30), r.int(2, 9)];
    return typeOutput(
      COMPLETE,
      cpp([
        `int first = ${first};`,
        'int second = first;',
        `first = first * ${factor};`,
        'std::cout << first << " " << second << "\\n";',
      ]),
      `${first * factor} ${first}`,
      `second copied ${first} when it was declared. Multiplying first by ${factor} afterwards changes only first, to ${first * factor}; second keeps its own copy.`,
    );
  },

  // cpp-arithmetic: Divide integers and drop the fraction
  'cpp-arithmetic-kp1-q1': (r) => {
    const [total, teams] = until(
      () => [r.int(10, 99), r.int(3, 9)],
      ([a, b]) => a % b !== 0,
    );
    const quotient = Math.trunc(total / teams);
    return typeOutput(
      COMPLETE,
      cpp([
        `int total = ${total};`,
        `int teams = ${teams};`,
        'std::cout << total / teams << "\\n";',
      ]),
      String(quotient),
      `${teams} * ${quotient} is ${teams * quotient}, which leaves ${total % teams} over, so ${total} / ${teams} has a fraction. Integer division discards it and keeps ${quotient}.`,
    );
  },
  // cpp-arithmetic: Truncate negative quotients toward zero
  'cpp-arithmetic-kp2-q4': (r) => {
    const [a, b] = until(
      () => [r.int(7, 60), r.int(2, 9)],
      ([x, y]) => x > y && x % y !== 0,
    );
    const quotient = Math.trunc(a / b);
    return typeOutput(
      PRINT,
      cpp([
        `int a = -${a};`,
        `int b = ${b};`,
        'std::cout << a / b << " " << -a / b << "\\n";',
      ]),
      `${-quotient} ${quotient}`,
      `-${a} / ${b} truncates toward zero, to -${quotient} rather than down to -${quotient + 1}. -a is ${a}, and ${a} / ${b} is ${quotient}: only the sign differs.`,
    );
  },
  // cpp-arithmetic: Take the remainder with %
  'cpp-arithmetic-kp3-q2': (r) => {
    const [name, divisor] = r.pick([
      ['eggs', 12],
      ['days', 7],
      ['minutes', 60],
      ['inches', 12],
      ['cards', 13],
      ['hours', 24],
    ] as [string, number][]);
    const value = r.int(divisor + 1, divisor * 9);
    const [quotient, remainder] = [
      Math.trunc(value / divisor),
      value % divisor,
    ];
    return typeOutput(
      PRINT,
      cpp([
        `int ${name} = ${value};`,
        `std::cout << ${name} / ${divisor} << " " << ${name} % ${divisor} << "\\n";`,
      ]),
      `${quotient} ${remainder}`,
      `${divisor} goes into ${value} ${quotient} whole ${times(quotient)} (${quotient * divisor}), so / gives ${quotient} and % gives the ${remainder} left over.`,
    );
  },
  // cpp-arithmetic: Predict the sign of a remainder
  'cpp-arithmetic-kp4-q4': (r) => {
    const [a, b] = until(
      () => [r.int(7, 60), r.int(3, 9)],
      ([x, y]) => x > y && x % y !== 0,
    );
    const remainder = a % b;
    return typeOutput(
      PRINT,
      cpp([`std::cout << ${a} % -${b} << " " << -${a} % ${b} << "\\n";`]),
      `${remainder} -${remainder}`,
      `A remainder takes the sign of the dividend, the left operand. ${a} is positive, so ${a} % -${b} is ${remainder}; -${a} is negative, so -${a} % ${b} is -${remainder}.`,
    );
  },

  // cpp-explicit-casts: Convert an int to double before dividing
  'cpp-explicit-casts-kp1-q2': (r) => {
    const divisor = r.pick([2, 4, 5, 8]);
    const a = until(
      () => r.int(3, 99),
      (x) => x % divisor !== 0,
    );
    return typeOutput(
      PRINT,
      cpp([
        `int a = ${a};`,
        `std::cout << a / ${divisor} << " " << static_cast<double>(a) / ${divisor} << "\\n";`,
      ]),
      `${Math.trunc(a / divisor)} ${num(a / divisor)}`,
      `a / ${divisor} divides two ints and drops the fraction, giving ${Math.trunc(a / divisor)}. Casting a to double first makes it a floating-point division, giving ${num(a / divisor)}.`,
    );
  },
  // cpp-explicit-casts: Cast before the division, not after it
  'cpp-explicit-casts-kp2-q2': (r) => {
    const b = r.pick([2, 4, 5, 8]);
    const a = until(
      () => r.int(1, 40),
      (x) => x % b !== 0,
    );
    const whole = Math.trunc(a / b);
    return typeOutput(
      PRINT,
      cpp([
        `int a = ${a};`,
        `int b = ${b};`,
        'std::cout << static_cast<double>(a) / b << " " << static_cast<double>(a / b) << "\\n";',
      ]),
      `${num(a / b)} ${whole}`,
      `Casting a first gives the exact quotient ${num(a / b)}. In static_cast<double>(a / b), integer division has already produced ${whole}, and the cast only turns ${whole} into a double.`,
    );
  },
  // cpp-explicit-casts: Convert a double back to int
  'cpp-explicit-casts-kp3-q2': (r) => {
    const n = 2 * r.int(1, 20) + 1;
    const factor = r.int(2, 9);
    const product = (n * factor) / 2;
    return typeOutput(
      PRINT,
      cpp([
        `double half = static_cast<double>(${n}) / 2;`,
        `std::cout << static_cast<int>(half * ${factor}) << "\\n";`,
      ]),
      String(Math.trunc(product)),
      `half is ${num(n / 2)}, and half * ${factor} is ${num(product)}. static_cast<int> drops any fraction, giving ${Math.trunc(product)}.`,
    );
  },

  // cpp-unsigned-wrap: Watch unsigned values wrap around
  'cpp-unsigned-wrap-kp1-q2': (r) => {
    const k = r.int(2, 60);
    return typeOutput(
      PRINT,
      cpp(
        [
          'unsigned int top = std::numeric_limits<unsigned int>::max();',
          `std::cout << top + ${k}u << "\\n";`,
        ],
        ['limits'],
      ),
      String(k - 1),
      `Adding 1 to the maximum wraps to 0, and the remaining ${k - 1} ${k - 1 === 1 ? 'step counts' : 'steps count'} up from there, so the result is ${k - 1}.`,
    );
  },
  // cpp-unsigned-wrap: Compare before subtracting unsigned values
  'cpp-unsigned-wrap-kp2-q1': (r) => {
    const [have, need] = until(
      () => [r.int(1, 30), r.int(1, 30)],
      ([a, b]) => a !== b,
    );
    const short = need > have;
    return typeOutput(
      COMPLETE,
      cpp([
        `unsigned int have = ${have}u;`,
        `unsigned int need = ${need}u;`,
        'if (need > have) std::cout << "short\\n";',
        'else std::cout << have - need << "\\n";',
      ]),
      short ? 'short' : String(have - need),
      short
        ? `need (${need}) is larger than have (${have}), so the guard prints short and never computes have - need, which would wrap to a huge value.`
        : `need (${need}) is not larger than have (${have}), so the subtraction is safe and prints ${have - need}.`,
    );
  },
  // cpp-unsigned-wrap: Reject a sum before it wraps
  'cpp-unsigned-wrap-kp3-q2': (r) => {
    const gap = r.int(0, 9);
    const add = r.int(gap + 1, gap + 30);
    return typeOutput(
      PRINT,
      cpp(
        [
          `unsigned int used = std::numeric_limits<unsigned int>::max() - ${gap}u;`,
          `unsigned int total = used + ${add}u;`,
          'std::cout << total << "\\n";',
        ],
        ['limits'],
      ),
      String(add - gap - 1),
      `used is ${gap === 0 ? 'the maximum' : `${gap} below the maximum`}. Adding ${add} passes the maximum and wraps through 0, leaving ${add} - ${gap} - 1 = ${add - gap - 1}.`,
    );
  },

  // cpp-char-values: Treat a char as a small integer code
  'cpp-char-values-kp2-q1': (r) => {
    // A lowercase or uppercase letter from a to u.
    const code = r.pick([97, 65]) + r.int(0, 20);
    const letter = String.fromCharCode(code);
    const step = r.int(1, 5);
    return typeOutput(
      COMPLETE,
      cpp([`char c = '${letter}';`, `std::cout << c + ${step} << "\\n";`]),
      String(code + step),
      `'${letter}' has the code ${code}. c + ${step} promotes the char to int, so it prints the number ${code + step}, not a letter.`,
    );
  },
  // cpp-char-values: Convert a digit character to its value
  'cpp-char-values-kp3-q2': (r) => {
    const [tens, ones] = [r.int(1, 9), r.int(0, 9)];
    return typeOutput(
      PRINT,
      cpp([
        `char tens = '${tens}';`,
        `char ones = '${ones}';`,
        "int number = (tens - '0') * 10 + (ones - '0');",
        'std::cout << number << "\\n";',
      ]),
      String(tens * 10 + ones),
      `Subtracting '0' turns each digit character into its value: ${tens} and ${ones}. ${tens} * 10 + ${ones} is ${tens * 10 + ones}.`,
    );
  },

  // cpp-fixed-width-integers: Wrap exact-width unsigned values
  'cpp-fixed-width-integers-kp2-q1': (r) => {
    const [a, b] = until(
      () => [r.int(130, 250), r.int(40, 200)],
      ([x, y]) => x + y > 256,
    );
    return typeOutput(
      COMPLETE,
      cpp(
        [
          `std::uint8_t a = ${a};`,
          `std::uint8_t b = ${b};`,
          'std::uint8_t sum = static_cast<std::uint8_t>(a + b);',
          'std::cout << static_cast<int>(sum) << "\\n";',
        ],
        ['cstdint'],
      ),
      String(a + b - 256),
      `a + b is computed as int, ${a + b}. Storing it in std::uint8_t keeps it modulo 256: ${a + b} - 256 = ${a + b - 256}.`,
    );
  },

  // cpp-bit-shifts: Shift left to multiply by a power of two
  'cpp-bit-shifts-kp1-q1': (r) => {
    const [x, k] = [r.int(1, 15), r.int(1, 6)];
    return typeOutput(
      COMPLETE,
      cpp([`unsigned x = ${x}u;`, `std::cout << (x << ${k}) << "\\n";`]),
      String(x * 2 ** k),
      `Shifting left by ${k} multiplies by $2^{${k}} = ${2 ** k}$, so ${x} becomes ${x * 2 ** k}.`,
    );
  },
  // cpp-bit-shifts: Shift right to divide by a power of two
  'cpp-bit-shifts-kp2-q1': (r) => {
    const [bytes, k] = [r.int(100, 9000), r.int(2, 10)];
    const result = Math.floor(bytes / 2 ** k);
    return typeOutput(
      COMPLETE,
      cpp([
        `unsigned bytes = ${bytes}u;`,
        `std::cout << (bytes >> ${k}) << "\\n";`,
      ]),
      String(result),
      `Shifting right by ${k} divides by $2^{${k}} = ${2 ** k}$ and drops the remainder: ${bytes} / ${2 ** k} is ${result} after truncation.`,
    );
  },

  // cpp-bit-masks: Keep selected bits with &
  'cpp-bit-masks-kp2-q1': (r) => {
    const [v, mask] = [r.int(1, 15), r.int(1, 15)];
    return typeOutput(
      COMPLETE,
      cpp([
        `unsigned v = 0b${bin4(v)}u;`,
        `std::cout << (v & 0b${bin4(mask)}u) << "\\n";`,
      ]),
      String(v & mask),
      `& keeps a bit only where both values have a 1: ${bin4(v)} & ${bin4(mask)} is ${bin4(v & mask)}, which is ${v & mask}.`,
    );
  },
  // cpp-bit-masks: Turn bits on with |
  'cpp-bit-masks-kp3-q1': (r) => {
    const [v, mask] = [r.int(1, 15), r.int(1, 15)];
    return typeOutput(
      COMPLETE,
      cpp([
        `unsigned v = 0b${bin4(v)}u;`,
        `std::cout << (v | 0b${bin4(mask)}u) << "\\n";`,
      ]),
      String(v | mask),
      `| sets a bit wherever either value has a 1: ${bin4(v)} | ${bin4(mask)} is ${bin4(v | mask)}, which is ${v | mask}.`,
    );
  },

  // cpp-bit-flags: Toggle bits with ^
  'cpp-bit-flags-kp2-q2': (r) => {
    const [v, k] = [r.int(1, 15), r.int(0, 3)];
    const result = v ^ (1 << k);
    const on = (v & (1 << k)) !== 0;
    return typeOutput(
      PRINT,
      cpp([
        `unsigned v = 0b${bin4(v)}u;`,
        `v = v ^ (1u << ${k});`,
        'std::cout << v << "\\n";',
      ]),
      String(result),
      `1u << ${k} is ${bin4(1 << k)}. Bit ${k} of ${bin4(v)} is ${on ? 'on, so ^ turns it off' : 'off, so ^ turns it on'}, giving ${bin4(result)}, which is ${result}.`,
    );
  },
  // cpp-bit-flags: Clear bits with & ~
  'cpp-bit-flags-kp3-q1': (r) => {
    const [v, mask] = [r.int(1, 15), r.int(1, 15)];
    const result = v & ~mask;
    return typeOutput(
      COMPLETE,
      cpp([
        `unsigned v = 0b${bin4(v)}u;`,
        `std::cout << (v & ~0b${bin4(mask)}u) << "\\n";`,
      ]),
      String(result),
      `~0b${bin4(mask)}u has every bit on except those of ${bin4(mask)}, so & clears exactly those bits of ${bin4(v)}, leaving ${bin4(result)}, which is ${result}.`,
    );
  },

  // cpp-bits: Mask after shifting
  'cpp-bits-kp2-q3': (r) => {
    const [high, middle, low] = [r.int(1, 255), r.int(0, 255), r.int(0, 255)];
    const word = high * 65536 + middle * 256 + low;
    return typeOutput(
      PRINT,
      cpp(
        [
          `std::uint32_t word = 0x${hex(word, 8)}u;`,
          'std::cout << ((word >> 8) & 0xFFu) << " " << (word & 0xFFu) << "\\n";',
        ],
        ['cstdint'],
      ),
      `${middle} ${low}`,
      `word >> 8 moves byte 1, 0x${hex(middle, 2)}, to the bottom, and & 0xFFu removes byte 2 above it, giving ${middle}. word & 0xFFu keeps byte 0, 0x${hex(low, 2)}, which is ${low}.`,
    );
  },

  // cpp-if-branches: Test several cases with else if
  'cpp-if-branches-kp3-q1': (r) => {
    const score = r.int(50, 100);
    const grade = score >= 90 ? 'A' : score >= 80 ? 'B' : 'C';
    return typeOutput(
      COMPLETE,
      cpp([
        `int score = ${score};`,
        'if (score >= 90) std::cout << "A\\n";',
        'else if (score >= 80) std::cout << "B\\n";',
        'else std::cout << "C\\n";',
      ]),
      grade,
      grade === 'A'
        ? `${score} >= 90 is true, so the first branch prints A and the rest are skipped.`
        : grade === 'B'
          ? `${score} >= 90 is false, so the next test runs: ${score} >= 80 is true, so it prints B.`
          : `${score} is below both 90 and 80, so neither test holds and the else branch prints C.`,
    );
  },

  // cpp-for-bounds: Count with a for loop
  'cpp-for-bounds-kp1-q2': (r) => {
    const start = r.int(0, 6);
    const end = start + r.int(2, 8);
    const values = Array.from({ length: end - start }, (_, i) => start + i);
    return typeOutput(
      PRINT,
      cpp([
        'int total = 0;',
        `for (int i = ${start}; i < ${end}; ++i) total += i;`,
        'std::cout << total << "\\n";',
      ]),
      String(sum(values)),
      `i takes the values ${start} through ${end - 1}, stopping before ${end}: ${values.join(' + ')} = ${sum(values)}.`,
    );
  },

  // cpp-while-progress: Repeat while a condition holds
  'cpp-while-progress-kp1-q1': (r) => {
    const [n, step] = [r.int(10, 60), r.int(3, 9)];
    const steps = Math.ceil(n / step);
    const last = n - steps * step;
    return typeOutput(
      COMPLETE,
      cpp([
        `int n = ${n};`,
        'int steps = 0;',
        'while (n > 0) {',
        `  n -= ${step};`,
        '  ++steps;',
        '}',
        'std::cout << steps << " " << n << "\\n";',
      ]),
      `${steps} ${last}`,
      `Each pass subtracts ${step}. After ${steps - 1} ${steps - 1 === 1 ? 'pass' : 'passes'} n is ${n - (steps - 1) * step}, still positive, so one more pass runs and n becomes ${last}; then n > 0 is false.`,
    );
  },

  // cpp-loop-exits: Leave the loop with break
  'cpp-loop-exits-kp2-q1': (r) => {
    const limit = r.int(5, 99);
    const last = Math.floor(Math.sqrt(limit));
    const printed = Array.from({ length: last }, (_, i) => i + 1).join('');
    return typeOutput(
      COMPLETE,
      cpp([
        'for (int i = 1; i <= 10; ++i) {',
        `  if (i * i > ${limit}) break;`,
        '  std::cout << i;',
        '}',
        'std::cout << "\\n";',
      ]),
      printed,
      `${last} * ${last} is ${last * last}, at most ${limit}, so ${last} still prints. ${last + 1} * ${last + 1} is ${(last + 1) ** 2}, more than ${limit}, so break ends the loop before printing it.`,
    );
  },
  // cpp-loop-exits: Combine continue and break
  'cpp-loop-exits-kp3-q1': (r) => {
    const stop = r.int(2, 4);
    const readings = Array.from({ length: 6 }, (_, i) =>
      i === stop ? 0 : r.int(0, 2) === 0 ? -r.int(1, 9) : r.int(1, 9),
    );
    const before = readings.slice(0, stop).filter((x) => x > 0);
    const total = sum(before);
    return typeOutput(
      COMPLETE,
      cpp(
        [
          `std::array<int, 6> readings${list(readings)};`,
          'int total = 0;',
          'for (int x : readings) {',
          '  if (x < 0) continue;',
          '  if (x == 0) break;',
          '  total += x;',
          '}',
          'std::cout << total << "\\n";',
        ],
        ['array'],
      ),
      String(total),
      `Negative readings are skipped, and the 0 at index ${stop} ends the loop, so nothing after it counts. ${
        before.length === 0
          ? 'No positive reading comes before it, so total stays 0.'
          : before.length === 1
            ? `The only positive reading before it is ${total}.`
            : `The positive readings before it sum to ${before.join(' + ')} = ${total}.`
      }`,
    );
  },

  // cpp-range-for: Visit every element in order
  'cpp-range-for-kp1-q2': (r) => {
    const values = r.ints(4, 1, 5);
    const product = values.reduce((total, x) => total * x, 1);
    return typeOutput(
      PRINT,
      cpp(
        [
          `std::array<int, 4> a${list(values)};`,
          'int product = 1;',
          'for (int x : a) product *= x;',
          'std::cout << product << "\\n";',
        ],
        ['array'],
      ),
      String(product),
      `The loop visits each of the 4 elements once and multiplies it in: ${values.join(' * ')} = ${product}.`,
    );
  },

  // cpp-arrays: Build results in place
  'cpp-arrays-kp3-q1': (r) => {
    const values = r.ints(4, 1, 9);
    const index = r.int(1, 3);
    const prefix = values.slice(0, index + 1);
    return typeOutput(
      COMPLETE,
      cpp(
        [
          `std::array<int, 4> a${list(values)};`,
          'int running = 0;',
          'for (int& x : a) {',
          '  running += x;',
          '  x = running;',
          '}',
          `std::cout << a[${index}] << "\\n";`,
        ],
        ['array'],
      ),
      String(sum(prefix)),
      `int& writes each running total back into the array, so a[${index}] holds the sum of the first ${index + 1} elements: ${prefix.join(' + ')} = ${sum(prefix)}.`,
    );
  },

  // cpp-return-values: Use the returned value
  'cpp-return-values-kp3-q1': (r) => {
    const start = r.int(1, 20);
    const end = start + r.int(1, 30);
    const factor = r.int(2, 5);
    return typeOutput(
      COMPLETE,
      cpp(
        [`std::cout << span(${start}, ${end}) * ${factor} << "\\n";`],
        [],
        'int span(int start, int end) {\n  return end - start;\n}',
      ),
      String((end - start) * factor),
      `span(${start}, ${end}) returns ${end} - ${start} = ${end - start}, and the returned value is used in the expression: ${end - start} * ${factor} = ${(end - start) * factor}.`,
    );
  },

  // cpp-default-arguments: Omit a trailing argument to use its default
  'cpp-default-arguments-kp1-q2': (r) => {
    const step = r.int(2, 4);
    const given = until(
      () => r.int(2, 6),
      (x) => x !== step,
    );
    const n = r.int(2, 12);
    return typeOutput(
      PRINT,
      cpp(
        [`std::cout << grow(${n}, ${given}) + grow(${n}) << "\\n";`],
        [],
        `int grow(int n, int step = ${step}) {\n  return n * step;\n}`,
      ),
      String(n * given + n * step),
      `grow(${n}, ${given}) uses the supplied ${given}: ${n * given}. grow(${n}) omits step, so the default ${step} applies: ${n * step}. The sum is ${n * given + n * step}.`,
    );
  },

  // cpp-string-size: Read characters by position
  'cpp-string-size-kp2-q1': (r) => {
    const word = r.pick(WORDS);
    const [i, j] = r.sample(
      Array.from({ length: word.length }, (_, k) => k),
      2,
    );
    return typeOutput(
      COMPLETE,
      cpp(
        [
          `std::string s = "${word}";`,
          `std::cout << s[${i}] << s[${j}] << "\\n";`,
        ],
        ['string'],
      ),
      `${word[i]}${word[j]}`,
      `Positions count from 0, so s[${i}] is character ${i + 1}, ${word[i]}, and s[${j}] is character ${j + 1}, ${word[j]}.`,
    );
  },

  // cpp-string-find: Turn the result into an index or a sentinel
  'cpp-string-find-kp3-q2': (r) => {
    const word = r.pick(REPEATING);
    const letter = r.pick(
      [...new Set(word)].filter((c) => word.indexOf(c) !== word.lastIndexOf(c)),
    );
    const first = word.indexOf(letter);
    const second = word.indexOf(letter, first + 1);
    return typeOutput(
      PRINT,
      cpp(
        [
          `std::string s = "${word}";`,
          `auto first = s.find('${letter}');`,
          `auto second = s.find('${letter}', first + 1);`,
          'std::cout << first << " " << second << "\\n";',
        ],
        ['string'],
      ),
      `${first} ${second}`,
      `The first ${letter} is at position ${first}. The second search starts at position ${first + 1}, just after it, and finds the next ${letter} at ${second}.`,
    );
  },

  // cpp-vector-elements: Index a vector from 0 to size() - 1
  'cpp-vector-elements-kp1-q1': (r) => {
    const values = r.ints(r.int(4, 6), 1, 50);
    const [i, j] = sorted(
      r.sample(
        values.map((_, k) => k),
        2,
      ),
    );
    return typeOutput(
      COMPLETE,
      cpp(
        [
          `std::vector<int> v${list(values)};`,
          `std::cout << v[${i}] + v[${j}] << "\\n";`,
        ],
        ['vector'],
      ),
      String(values[i] + values[j]),
      `Indices start at 0: v[${i}] is ${values[i]} and v[${j}] is ${values[j]}, so the sum is ${values[i] + values[j]}.`,
    );
  },

  // cpp-vector-push: Know that push_back stores a copy
  'cpp-vector-push-kp3-q3': (r) => {
    const [first, extra, replaced] = [r.int(1, 9), r.int(1, 9), r.int(10, 30)];
    return typeOutput(
      PRINT,
      cpp(
        [
          'std::vector<int> v;',
          `v.push_back(${first});`,
          `v.push_back(v[0] + ${extra});`,
          `v[0] = ${replaced};`,
          'std::cout << v[0] + v[1] << "\\n";',
        ],
        ['vector'],
      ),
      String(replaced + first + extra),
      `The second push_back stored the value ${first} + ${extra} = ${first + extra}, a copy computed at that moment. Changing v[0] to ${replaced} later does not change it: ${replaced} + ${first + extra} = ${replaced + first + extra}.`,
    );
  },

  // cpp-vectors: Erase an element and close the gap
  'cpp-vectors-kp1-q2': (r) => {
    const values = r.ints(r.int(3, 5), 1, 9, true);
    const index = r.int(1, values.length - 1);
    const left = values.filter((_, k) => k !== index);
    return typeOutput(
      PRINT,
      cpp(
        [
          `std::vector<int> v${list(values)};`,
          `v.erase(v.begin() + ${index});`,
          'std::cout << v.size() << v[v.size() - 1] << "\\n";',
        ],
        ['vector'],
      ),
      `${left.length}${left[left.length - 1]}`,
      `Erasing index ${index} removes ${values[index]} and shifts the later elements down, leaving ${left.join(', ')}: size ${left.length} and last element ${left[left.length - 1]}, printed with no space between.`,
    );
  },

  // cpp-iterator-distance: Turn an iterator into an index
  'cpp-iterator-distance-kp2-q2': (r) => {
    const values = r.ints(r.int(4, 7), 1, 9);
    const [i, j] = sorted(r.sample(values.map((_, k) => k).slice(1), 2));
    return typeOutput(
      PRINT,
      cpp(
        [
          `std::vector<int> v${list(values)};`,
          `auto a = v.begin() + ${i};`,
          `auto b = v.begin() + ${j};`,
          'std::cout << std::distance(a, b) << " " << b - a << "\\n";',
        ],
        ['iterator', 'vector'],
      ),
      `${j - i} ${j - i}`,
      `a points at index ${i} and b at index ${j}. std::distance(a, b) counts the ${j - i} steps from a to b, and for vector iterators b - a gives the same ${j - i}.`,
    );
  },

  // cpp-abs-value: Measure the distance between two values
  'cpp-abs-value-kp2-q1': (r) => {
    const [low, high] = [-r.int(1, 20), r.int(1, 20)];
    const gap = high - low;
    return typeOutput(
      PRINT,
      cpp(
        [
          `int low = ${low};`,
          `int high = ${high};`,
          'std::cout << std::abs(low - high) << " " << std::abs(high - low) << "\\n";',
        ],
        ['cstdlib'],
      ),
      `${gap} ${gap}`,
      `low - high is ${low - high} and high - low is ${gap}. std::abs removes the sign, so both orders give the distance ${gap}.`,
    );
  },

  // cpp-to-string: Convert before appending a number to text
  'cpp-to-string-kp2-q3': (r) => {
    const [a, b, c] = [r.int(1, 99), r.int(1, 99), r.int(1, 9)];
    const line = `${a}${b}-${c}`;
    return typeOutput(
      PRINT,
      cpp(
        [
          `std::string line = std::to_string(${a});`,
          `line += std::to_string(${b});`,
          `line += std::to_string(-${c});`,
          'std::cout << line << " " << line.size() << "\\n";',
        ],
        ['string'],
      ),
      `${line} ${line.length}`,
      `Each std::to_string call appends the number's digits, and -${c} includes its minus sign, so the text is ${line}: ${line.length} characters.`,
    );
  },

  // cpp-reverse-range: Reverse only part of a range
  'cpp-reverse-range-kp2-q1': (r) => {
    const values = r.ints(5, 1, 9, true);
    const from = r.int(1, 3);
    const tail = values.slice(from);
    const result = [...values.slice(0, from), ...[...tail].reverse()];
    return typeOutput(
      PRINT,
      cpp(
        [
          `std::vector<int> v${list(values)};`,
          `std::reverse(v.begin() + ${from}, v.end());`,
          'std::cout << v[0] << v[1] << v[2] << v[3] << v[4] << "\\n";',
        ],
        ['algorithm', 'vector'],
      ),
      result.join(''),
      `Only the range from index ${from} to the end is reversed: ${tail.join(', ')} becomes ${[...tail].reverse().join(', ')}. The first ${from === 1 ? 'element stays' : `${from} elements stay`} in place.`,
    );
  },

  // cpp-pair-ordering: Compare pairs by first, then by second
  'cpp-pair-ordering-kp1-q1': (r) => {
    const tie = r.int(0, 1) === 1;
    const a0 = r.int(1, 9);
    const b0 = tie
      ? a0
      : until(
          () => r.int(1, 9),
          (x) => x !== a0,
        );
    const [a1, b1] = until(
      () => [r.int(0, 9), r.int(0, 9)],
      ([x, y]) => x !== y,
    );
    const less = (p: number[], q: number[]) =>
      p[0] < q[0] || (p[0] === q[0] && p[1] < q[1]);
    const [a, b] = [
      [a0, a1],
      [b0, b1],
    ];
    const [ab, ba] = [Number(less(a, b)), Number(less(b, a))];
    return typeOutput(
      COMPLETE,
      cpp(
        [
          `std::pair<int, int> a{${a0}, ${a1}};`,
          `std::pair<int, int> b{${b0}, ${b1}};`,
          'std::cout << (a < b) << (b < a) << "\\n";',
        ],
        ['utility'],
      ),
      `${ab}${ba}`,
      tie
        ? `The first members tie at ${a0}, so .second decides: ${Math.min(a1, b1)} is less than ${Math.max(a1, b1)}, so ${ab ? 'a < b' : 'b < a'} is true and the other comparison is false.`
        : `The first members differ, ${a0} and ${b0}, so they decide alone: ${ab ? 'a < b' : 'b < a'} is true, and .second is never compared.`,
    );
  },

  // cpp-map-find: Answer several lookups with a fallback
  'cpp-map-find-kp3-q3': (r) => {
    const all = [10, 20, 30, 40, 50];
    const keys = sorted(r.sample(all, 2));
    const values = r.ints(2, 1, 9);
    const queries = r.shuffle([
      ...r.sample(keys, r.int(1, 2)),
      ...r.sample(
        all.filter((k) => !keys.includes(k)),
        r.int(1, 2),
      ),
    ]);
    const found = queries.map((key) =>
      keys.includes(key) ? values[keys.indexOf(key)] : -1,
    );
    return typeOutput(
      PRINT,
      cpp(
        [
          `std::map<int, int> code{{${keys[0]}, ${values[0]}}, {${keys[1]}, ${values[1]}}};`,
          `std::vector<int> queries${list(queries)};`,
          'for (int key : queries) {',
          '  auto it = code.find(key);',
          '  std::cout << (it == code.end() ? -1 : it->second) << " ";',
          '}',
          'std::cout << "\\n";',
        ],
        ['map', 'vector'],
      ),
      found.join(' '),
      `Each query is looked up with find: ${queries.map((key, k) => (found[k] === -1 ? `${key} is missing, so -1` : `${key} maps to ${found[k]}`)).join('; ')}.`,
    );
  },

  // cpp-unordered-frequency: Count occurrences with ++counts[value]
  'cpp-unordered-frequency-kp1-q1': (r) => {
    const [x, y] = r.sample([1, 2, 3, 4, 5, 6, 7, 8, 9], 2);
    const codes = using(r, [x, y], r.int(4, 7));
    const [cx, cy] = [count(codes, x), count(codes, y)];
    return typeOutput(
      PRINT,
      cpp(
        [
          `std::vector<int> codes${list(codes)};`,
          'std::unordered_map<int, int> counts;',
          'for (int code : codes) ++counts[code];',
          `std::cout << counts[${x}] << " " << counts[${y}] << "\\n";`,
        ],
        ['unordered_map', 'vector'],
      ),
      `${cx} ${cy}`,
      `Each ++counts[code] adds one for that value: ${x} occurs ${cx} ${times(cx)} and ${y} occurs ${cy} ${times(cy)}.`,
    );
  },

  // cpp-maps: A map iterates in ascending key order
  'cpp-maps-kp1-q4': (r) => {
    const rolls = until(
      () => r.ints(r.int(4, 5), 1, 6),
      (values) => values.join() !== sorted(values).join(),
    );
    const keys = sorted([...new Set(rolls)]);
    return typeOutput(
      PRINT,
      cpp(
        [
          `std::vector<int> rolls${list(rolls)};`,
          'std::map<int, int> counts;',
          'for (int roll : rolls) ++counts[roll];',
          'for (auto it = counts.begin(); it != counts.end(); ++it)',
          '  std::cout << it->first << ":" << it->second << " ";',
          'std::cout << "\\n";',
        ],
        ['map', 'vector'],
      ),
      keys.map((key) => `${key}:${count(rolls, key)}`).join(' '),
      `A std::map visits its keys in ascending order, whatever order they were inserted in: ${keys.join(', ')}, each with its count.`,
    );
  },

  // cpp-set-membership: A set stores each value once, in order
  'cpp-set-membership-kp1-q4': (r) => {
    const ids = r.sample([2, 3, 4, 5, 6, 7, 8, 9], r.int(2, 4));
    const events = using(r, ids, r.int(5, 7));
    return typeOutput(
      PRINT,
      cpp(
        [
          `std::vector<int> events${list(events)};`,
          'std::set<int> users;',
          'for (int event : events) users.insert(event);',
          'std::cout << events.size() << " " << users.size() << "\\n";',
        ],
        ['set', 'vector'],
      ),
      `${events.length} ${ids.length}`,
      `The vector keeps all ${events.length} events. The set ignores repeated inserts, so it holds the ${ids.length} distinct values ${sorted(ids).join(', ')}.`,
    );
  },

  // cpp-set-lower-bound: Find the first element not less than a target
  'cpp-set-lower-bound-kp1-q2': (r) => {
    const marks = until(
      () => sorted(r.ints(3, 1, 60, true)),
      (values) => values.join() !== '10,20,30',
    );
    const target = r.int(marks[0] - 5, marks[2]);
    const answer = marks.find((x) => x >= target)!;
    return typeOutput(
      PRINT,
      cpp(
        [
          `std::set<int> marks${list(marks)};`,
          `std::cout << *marks.lower_bound(${target}) << "\\n";`,
        ],
        ['set'],
      ),
      String(answer),
      answer === target
        ? `${target} is in the set, and lower_bound returns the first element not less than the target, which is ${target} itself.`
        : `${target} is not in the set. lower_bound returns the first element not less than ${target}, which is ${answer}.`,
    );
  },

  // cpp-heap-top: Take the k largest values
  'cpp-heap-top-kp3-q1': (r) => {
    const values = r.ints(4, 1, 20, true);
    const [a, b] = sorted(values).reverse();
    return typeOutput(
      'The loop takes the two largest values. What does it print?',
      cpp(
        [
          `std::vector<int> values${list(values)};`,
          'std::priority_queue<int> heap(values.begin(), values.end());',
          'int total = 0;',
          'for (int i = 0; i < 2; ++i) {',
          '  if (heap.size() > 0) {',
          '    total += heap.top();',
          '    heap.pop();',
          '  }',
          '}',
          'std::cout << total << "\\n";',
        ],
        ['queue', 'vector'],
      ),
      String(a + b),
      `top() is the largest remaining value: ${a} first, then ${b} after the pop, so total is ${a} + ${b} = ${a + b}.`,
    );
  },

  // cpp-sets: Popping a min heap gives ascending order
  'cpp-sets-kp2-q1': (r) => {
    const due = r.ints(3, 1, 20, true);
    const [a, b] = sorted(due);
    return typeOutput(
      PRINT,
      cpp(
        [
          `std::vector<int> due${list(due)};`,
          'std::priority_queue<int, std::vector<int>, std::greater<int>> heap(due.begin(), due.end());',
          'for (int i = 0; i < 2; ++i) {',
          '  std::cout << heap.top() << " ";',
          '  heap.pop();',
          '}',
          'std::cout << "\\n";',
        ],
        ['functional', 'queue', 'vector'],
      ),
      `${a} ${b}`,
      `With std::greater the smallest value is on top. The first pass prints ${a} and pops it; the second prints the next smallest, ${b}.`,
    );
  },

  // cpp-sort-order: Sort only part of a range
  'cpp-sort-order-kp2-q2': (r) => {
    const values = until(
      () => r.ints(4, 1, 9, true),
      (v) => v.slice(1).join() !== sorted(v.slice(1)).join(),
    );
    const tail = sorted(values.slice(1));
    return typeOutput(
      PRINT,
      cpp(
        [
          `std::vector<int> v${list(values)};`,
          'std::sort(v.begin() + 1, v.end());',
          'for (int x : v) std::cout << x << " ";',
          'std::cout << "\\n";',
        ],
        ['algorithm', 'vector'],
      ),
      [values[0], ...tail].join(' '),
      `The range starts at v.begin() + 1, so ${values[0]} stays first and only the last three elements are sorted: ${tail.join(', ')}.`,
    );
  },

  // cpp-accumulate-seed: Add a range to a starting value
  'cpp-accumulate-seed-kp1-q1': (r) => {
    const values = r.ints(3, 1, 20);
    const seed = r.int(1, 10);
    return typeOutput(
      PRINT,
      cpp(
        [
          `std::vector<int> v${list(values)};`,
          `std::cout << std::accumulate(v.begin(), v.end(), ${seed}) << "\\n";`,
        ],
        ['numeric', 'vector'],
      ),
      String(seed + sum(values)),
      `accumulate starts from the seed ${seed} and adds every element: ${seed} + ${values.join(' + ')} = ${seed + sum(values)}.`,
    );
  },

  // cpp-algorithms: Erase the leftover tail
  'cpp-algorithms-kp2-q1': (r) => {
    const [drop, keep] = r.sample([1, 2, 3, 4, 5, 6, 7, 8, 9], 2);
    const values = using(r, [drop, keep], 5);
    const left = values.filter((x) => x !== drop);
    return typeOutput(
      PRINT,
      cpp(
        [
          `std::vector<int> v${list(values)};`,
          `v.erase(std::remove(v.begin(), v.end(), ${drop}), v.end());`,
          'std::cout << v.size() << ":";',
          'for (int x : v) std::cout << " " << x;',
          'std::cout << "\\n";',
        ],
        ['algorithm', 'vector'],
      ),
      `${left.length}: ${left.join(' ')}`,
      `std::remove moves the ${left.length} ${left.length === 1 ? 'value' : 'values'} that are not ${drop} to the front, and erase cuts off the leftover tail, so the vector shrinks to ${left.length} ${left.length === 1 ? 'element' : 'elements'}.`,
    );
  },

  // cpp-lambda-value-capture: [value] copies the variable when the lambda is created
  'cpp-lambda-value-capture-kp2-q1': (r) => {
    const [rate, later] = r.sample([2, 3, 4, 5, 6, 7, 8, 9], 2);
    const n = r.int(2, 9);
    return typeOutput(
      PRINT,
      cpp([
        `int rate = ${rate};`,
        'auto cost = [rate](int n) { return n * rate; };',
        `rate = ${later};`,
        `std::cout << cost(${n}) << "\\n";`,
      ]),
      String(n * rate),
      `[rate] copied ${rate} when the lambda was created. Setting rate to ${later} afterwards changes only the outer variable, so cost(${n}) is ${n} * ${rate} = ${n * rate}.`,
    );
  },
};
