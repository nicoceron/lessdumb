import {
  py,
  pyDiv,
  pyFloat,
  pyMod,
  typeOutput,
  type GeneratorModule,
} from './authoring';

// Python foundations: fresh values for arithmetic, integer division and
// modulo, string methods, indexing and slicing, ranges, and bit operations.
// The catalog tests run sampled variants in Pyodide and compare the output.

const PRINT = 'What does this program print?';
const WORDS = [
  'banana',
  'planet',
  'orbit',
  'garden',
  'rocket',
  'pencil',
  'window',
  'silver',
  'harbor',
  'lantern',
  'meadow',
  'cobalt',
];
/** Python's slice of a list or string, for a positive or negative step. */
function slice<T>(items: T[], start?: number, stop?: number, step = 1): T[] {
  const n = items.length;
  const clamp = (value: number, low: number, high: number) =>
    Math.min(Math.max(value < 0 ? value + n : value, low), high);
  const result: T[] = [];
  if (step > 0) {
    const from = start === undefined ? 0 : clamp(start, 0, n);
    const to = stop === undefined ? n : clamp(stop, 0, n);
    for (let i = from; i < to; i += step) result.push(items[i]);
  } else {
    const from = start === undefined ? n - 1 : clamp(start, -1, n - 1);
    const to = stop === undefined ? -1 : clamp(stop, -1, n - 1);
    for (let i = from; i > to; i += step) result.push(items[i]);
  }
  return result;
}
const text = (value: string) => `"${value}"`;
const bits = (value: number) => value.toString(2);

export const generators: GeneratorModule = {
  // numbers: Add, subtract, multiply, and divide
  'numbers-kp1-q2': (r) => {
    const apples = 2 * r.int(2, 20) + 1;
    const pears = r.int(1, apples - 1);
    return typeOutput(
      'What is printed?',
      `apples = ${apples}\npears = ${pears}\nprint(apples - pears)\nprint(apples / 2)`,
      `${apples - pears}\n${pyFloat(apples / 2)}`,
      `Subtracting two integers gives the integer ${apples - pears}; ${apples} / 2 is the float ${pyFloat(apples / 2)}, not a rounded whole number.`,
    );
  },
  // numbers: Split a number into full groups and a remainder
  'numbers-kp2-q3': (r) => {
    const perCar = r.int(3, 7);
    const people = r.int(perCar + 1, 60);
    const [cars, left] = [pyDiv(people, perCar), pyMod(people, perCar)];
    return typeOutput(
      'What is the output?',
      `people = ${people}\nper_car = ${perCar}\nprint(people // per_car)\nprint(people % per_car)`,
      `${cars}\n${left}`,
      `${cars} full ${cars === 1 ? 'car carries' : 'cars carry'} ${cars * perCar} people, so // gives ${cars} and % gives the ${left} ${left === 1 ? 'person' : 'people'} left over.`,
    );
  },
  // numbers: Use powers and control the order of operations
  'numbers-kp3-q3': (r) => {
    const [base, bonus, factor] = [r.int(2, 12), r.int(2, 9), r.int(2, 5)];
    return typeOutput(
      'What is the output?',
      `base = ${base}\nbonus = ${bonus}\nprint((base + bonus) * ${factor})\nprint(base + bonus * ${factor})`,
      `${(base + bonus) * factor}\n${base + bonus * factor}`,
      `The parentheses make ${base} + ${bonus} happen first, giving ${(base + bonus) * factor}. Without them, ${bonus} * ${factor} happens first, giving ${base} + ${bonus * factor} = ${base + bonus * factor}.`,
    );
  },
  // strings: Join and repeat strings
  'strings-kp1-q3': (r) => {
    const [mark, end] = r.sample(['-', '=', '*', '#', '~', '+', '|'], 2);
    const count = r.int(2, 9);
    return typeOutput(
      'What is the output?',
      `line = "${mark}" * ${count}\nprint(line + "${end}")`,
      mark.repeat(count) + end,
      `"${mark}" * ${count} repeats the character ${count} times; then + adds one "${end}" at the end.`,
    );
  },
  // strings: Count characters with len()
  'strings-kp2-q2': (r) => {
    const digits = '0123456789';
    const word = (length: number) =>
      Array.from({ length }, () => r.pick([...digits])).join('');
    const [a, b] = [word(r.int(1, 5)), word(r.int(1, 6))];
    return typeOutput(
      'What is printed?',
      `print(len(${text(a)}) + len(${text(b)}))`,
      String(a.length + b.length),
      `len() returns numbers, ${a.length} and ${b.length}, and + adds them. The digits inside the strings are not used as numbers.`,
    );
  },
  // strings: Insert values with f-strings
  'strings-kp3-q2': (r) => {
    const [a, b] = [r.int(2, 30), r.int(2, 30)];
    const [symbol, value] = r.pick([
      ['+', a + b],
      ['-', a - b],
      ['*', a * b],
    ] as [string, number][]);
    return typeOutput(
      'What is printed?',
      `a = ${a}\nb = ${b}\nprint(f"{a} ${symbol} {b} = {a ${symbol} b}")`,
      `${a} ${symbol} ${b} = ${value}`,
      `Each brace is evaluated: a is ${a}, b is ${b}, and a ${symbol} b is ${value}. The ${symbol} outside the braces is plain text.`,
    );
  },
  // string-methods: Change case and trim with lower, upper, and strip
  'string-methods-kp1-q3': (r) => {
    const word = r.pick(['yes', 'no', 'maybe', 'ok', 'later', 'done', 'stop']);
    const [left, right] = [r.int(0, 4), r.int(1, 4)];
    const entry = `${' '.repeat(left)}${word}${' '.repeat(right)}`;
    return typeOutput(
      'What is the output?',
      `entry = ${text(entry)}\nprint(len(entry))\nprint(len(entry.strip()))`,
      `${entry.length}\n${word.length}`,
      `The original has ${left} space${left === 1 ? '' : 's'} before and ${right} after the word, ${entry.length} characters in all. strip() removes them, leaving ${word.length}.`,
    );
  },
  // string-methods: Swap text with replace()
  'string-methods-kp2-q1': (r) => {
    const word = r.pick(WORDS);
    const old = r.pick([...new Set(word)]);
    const replacement = r.pick([...'xyzq'].filter((c) => !word.includes(c)));
    const count = [...word].filter((c) => c === old).length;
    return typeOutput(
      PRINT,
      `print(${text(word)}.replace(${text(old)}, ${text(replacement)}))`,
      word.replaceAll(old, replacement),
      count === 1
        ? `The only ${old} becomes ${replacement}; replace would swap every occurrence if there were more.`
        : `replace swaps every occurrence, not just the first, so all ${count} copies of ${old} become ${replacement}.`,
    );
  },
  // string-methods: Split text into a list with split()
  'string-methods-kp3-q3': (r) => {
    const numbers = r.ints(r.int(2, 4), 1, 99).map(String);
    return typeOutput(
      'What is the output?',
      `csv = ${text(numbers.join(','))}\nparts = csv.split(",")\nprint(len(parts))\nprint(parts)`,
      `${numbers.length}\n${py(numbers)}`,
      `There are ${numbers.length} pieces, and split always produces strings, so each number is shown in quotes.`,
    );
  },
  // string-methods: Join a list of strings with join()
  'string-methods-kp4-q1': (r) => {
    const parts = r.ints(r.int(2, 5), 0, 20).map(String);
    const separator = r.pick(['+', '-', ':', '/', '|', '*']);
    return typeOutput(
      PRINT,
      `print(${text(separator)}.join(${py(parts).replace(/'/g, '"')}))`,
      parts.join(separator),
      'join places the separator between the strings and does no arithmetic; nothing is added at the ends.',
    );
  },
  // indexing: Read an item by its position, counting from 0
  'indexing-kp1-q3': (r) => {
    const scores = r.ints(r.int(4, 6), 1, 40);
    const [i, j] = r.ints(2, 0, scores.length - 1, true).sort((a, b) => a - b);
    return typeOutput(
      PRINT,
      `scores = ${py(scores)}\nprint(scores[${i}] + scores[${j}])`,
      String(scores[i] + scores[j]),
      `scores[${i}] is ${scores[i]} and scores[${j}] is ${scores[j]}, items ${i + 1} and ${j + 1}, so the sum is ${scores[i] + scores[j]}.`,
    );
  },
  // indexing: Count from the end with negative indices
  'indexing-kp2-q4': (r) => {
    const temps = r.ints(r.int(4, 6), 10, 30);
    const back = r.int(1, temps.length);
    const front = r.int(0, temps.length - 1);
    const value = temps[temps.length - back] + temps[front];
    return typeOutput(
      PRINT,
      `temps = ${py(temps)}\nprint(temps[-${back}] + temps[${front}])`,
      String(value),
      `temps[-${back}] is ${back === 1 ? 'the last item' : `item ${back} from the end`}, ${temps[temps.length - back]}, and temps[${front}] is ${temps[front]}, so the sum is ${value}.`,
    );
  },
  // indexing: Stay inside the valid positions
  'indexing-kp3-q3': (r) => {
    const nums = r.ints(r.int(3, 7), 1, 50);
    const k = r.int(1, nums.length);
    return typeOutput(
      PRINT,
      `nums = ${py(nums)}\nprint(len(nums) - 1)\nprint(nums[len(nums) - ${k}])`,
      `${nums.length - 1}\n${nums[nums.length - k]}`,
      `${nums.length} items give a last index of ${nums.length - 1}. Index ${nums.length} - ${k} = ${nums.length - k} holds ${nums[nums.length - k]}.`,
    );
  },
  // tuples: Group values in a tuple and read them by index
  'tuples-kp1-q2': (r) => {
    const rgb = r.ints(3, 0, 255);
    return typeOutput(
      PRINT,
      `rgb = (${rgb.join(', ')})\nprint(rgb[0] + rgb[-1])`,
      String(rgb[0] + rgb[2]),
      `rgb[0] is ${rgb[0]} and rgb[-1] is the last item, ${rgb[2]}.`,
    );
  },
  // tuples: Compare tuples item by item from the left
  'tuples-kp4-q2': (r) => {
    const a = r.ints(3, 0, 9);
    const b = [...a];
    const k = r.int(0, 2);
    b[k] = r.pick([...'0123456789'].map(Number).filter((x) => x !== a[k]));
    if (r.int(0, 1)) b[2] = r.int(0, 9);
    let order = 0;
    for (let i = 0; i < 3 && !order; i++) order = Math.sign(a[i] - b[i]);
    return typeOutput(
      PRINT,
      `a = (${a.join(', ')})\nb = (${b.join(', ')})\nprint(a > b)\nprint(a == b)`,
      `${order > 0 ? 'True' : 'False'}\n${order === 0 ? 'True' : 'False'}`,
      order === 0
        ? 'Every item ties, so a > b is False and a == b is True.'
        : `The first difference is at position ${a.findIndex((x, i) => x !== b[i])}, where ${a.find((x, i) => x !== b[i])} ${order > 0 ? '>' : '<'} ${b.find((x, i) => x !== a[i])} decides the order; later items are not compared.`,
    );
  },
  // ranges: Start counting at another number with range(start, stop)
  'ranges-kp2-q1': (r) => {
    const start = r.int(-3, 12);
    const stop = start + r.int(1, 6);
    return typeOutput(
      PRINT,
      `print(list(range(${start}, ${stop})))`,
      py(Array.from({ length: stop - start }, (_, i) => start + i)),
      `The start ${start} is included and the stop ${stop} is excluded.`,
    );
  },
  // ranges: Choose the step, including counting down
  'ranges-kp3-q1': (r) => {
    const step = r.pick([-3, -2, 2, 3, 4, 5]);
    const start = r.int(0, 12);
    const stop = start + step * r.int(2, 4) + r.int(-1, 1) * Math.sign(step);
    const values: number[] = [];
    for (let v = start; step > 0 ? v < stop : v > stop; v += step)
      values.push(v);
    return typeOutput(
      PRINT,
      `print(list(range(${start}, ${stop}, ${step})))`,
      py(values),
      `Start at ${start} and ${step > 0 ? 'add' : 'subtract'} ${Math.abs(step)}; the next value, ${values.at(-1)! + step}, is not ${step > 0 ? 'below' : 'above'} the stop ${stop}.`,
    );
  },
  // nested-lists: Pick a row, then a cell, with two indexes
  'nested-lists-kp1-q3': (r) => {
    const t = [r.ints(3, 1, 20), r.ints(3, 1, 20)];
    const [i, j] = [r.int(0, 2), r.int(0, 2)];
    return typeOutput(
      PRINT,
      `t = ${py(t)}\nprint(t[-1][-1] + t[0][${i}] + t[1][${j}])`,
      String(t[1][2] + t[0][i] + t[1][j]),
      `t[-1][-1] is the last cell of the last row, ${t[1][2]}; t[0][${i}] is ${t[0][i]}, and t[1][${j}] is ${t[1][j]}.`,
    );
  },
  // nested-lists: Change one cell with grid[r][c] = value
  'nested-lists-kp3-q1': (r) => {
    const [rows, cols] = [r.int(2, 3), r.int(2, 3)];
    const g = Array.from({ length: rows }, () => Array(cols).fill(0));
    const [row, col, value] = [
      r.int(0, rows - 1),
      r.int(0, cols - 1),
      r.int(1, 9),
    ];
    const after = g.map((line, i) =>
      line.map((cell, j) => (i === row && j === col ? value : cell)),
    );
    return typeOutput(
      PRINT,
      `g = ${py(g)}\ng[${row}][${col}] = ${value}\nprint(g)`,
      py(after),
      `Row ${row}, index ${col} is cell ${col + 1} of row ${row + 1}; nothing else changes.`,
    );
  },
  // slicing: Take the items from start up to stop
  'slicing-kp1-q1': (r) => {
    const nums = r.ints(r.int(5, 8), 1, 60);
    const start = r.int(0, nums.length - 2);
    const stop = r.int(start + 1, nums.length);
    return typeOutput(
      PRINT,
      `nums = ${py(nums)}\nprint(nums[${start}:${stop}])`,
      py(slice(nums, start, stop)),
      `Positions ${start} to ${stop - 1} are kept; position ${stop} is the stop and is left out.`,
    );
  },
  // slicing: Leave out an end, or count from the end
  'slicing-kp2-q2': (r) => {
    const name = r.pick(WORDS);
    const start = r.int(1, name.length - 2);
    return typeOutput(
      'What is printed?',
      `name = ${text(name)}\nprint(name[${start}:])`,
      name.slice(start),
      `Position ${start} is ${name[start]}; with no stop, the slice runs to the end of the string.`,
    );
  },
  // slicing: Step through a sequence, or reverse it
  'slicing-kp3-q1': (r) => {
    const values = r.ints(r.int(5, 8), 1, 9).map((x) => 10 * x);
    const step = r.int(2, 3);
    const start = r.int(0, 1);
    const kept = slice(values, start, undefined, step);
    return typeOutput(
      PRINT,
      `values = ${py(values)}\nprint(values[${start || ''}::${step}])`,
      py(kept),
      `The slice starts at position ${start} and jumps by ${step}, keeping ${kept.length} items.`,
    );
  },
  // slicing: Predict slices that run past the end
  'slicing-kp4-q1': (r) => {
    const top = r.ints(r.int(3, 5), 1, 20);
    const start = r.int(0, top.length - 1);
    const stop = top.length + r.int(1, 8);
    return typeOutput(
      PRINT,
      `top = ${py(top)}\nprint(top[${start}:${stop}])`,
      py(slice(top, start, stop)),
      `The stop ${stop} is past the end, so the slice simply runs to the end from position ${start}.`,
    );
  },
  // bitwise: Read an integer in binary
  'bitwise-kp1-q1': (r) => {
    const value = r.int(2, 63);
    const parts = [...bits(value)]
      .map((bit, i, all) => (bit === '1' ? 2 ** (all.length - 1 - i) : 0))
      .filter(Boolean);
    return typeOutput(
      'What is printed?',
      `print(bin(${value}))`,
      `0b${bits(value)}`,
      parts.length === 1
        ? `${value} is a single bit worth ${value}, written ${bits(value)}.`
        : `${value} is ${parts.join(' + ')}, so those bits are set: ${bits(value)}.`,
    );
  },
  // bitwise: Combine bits with &, | and ^
  'bitwise-kp2-q1': (r) => {
    const [a, b] = r.ints(2, 1, 15, true);
    const [symbol, value, rule] = r.pick([
      ['&', a & b, 'set in both'],
      ['|', a | b, 'set in either'],
      ['^', a ^ b, 'set in exactly one'],
    ] as [string, number, string][]);
    return typeOutput(
      'What is printed?',
      `print(${a} ${symbol} ${b})`,
      String(value),
      `${a} is ${bits(a).padStart(4, '0')} and ${b} is ${bits(b).padStart(4, '0')}; ${symbol} keeps the bits ${rule}: ${bits(value).padStart(4, '0')}, which is ${value}.`,
    );
  },
  // bitwise: Shift bits left and right
  'bitwise-kp3-q2': (r) => {
    const value = r.int(10, 250);
    const shift = r.int(1, 4);
    return typeOutput(
      PRINT,
      `print(${value} >> ${shift})`,
      String(value >> shift),
      `>> ${shift} is floor division by ${2 ** shift}, and ${value} // ${2 ** shift} is ${value >> shift}. A shift always gives an int.`,
    );
  },
  // bitwise: Test, set, and clear a single bit
  'bitwise-kp4-q3': (r) => {
    const x = r.int(5, 31);
    const [clear, set] = [r.int(0, 4), r.int(0, 4)];
    const [cleared, setTo] = [x & ~(1 << clear), x | (1 << set)];
    return typeOutput(
      'What is the output?',
      `x = ${x}\nprint(x & ~(1 << ${clear}), x | (1 << ${set}))`,
      `${cleared} ${setTo}`,
      `${x} is ${bits(x)}. Clearing bit ${clear} (worth ${2 ** clear}) gives ${cleared}, and setting bit ${set} (worth ${2 ** set}) gives ${setTo}.`,
    );
  },
};
