import {
  num,
  py,
  pyFloat,
  series,
  typeOutput,
  type GeneratorModule,
  type Rng,
} from './authoring';

// Python for Data Analysis: fresh arrays and tables for NumPy shapes,
// vectorized arithmetic, reductions, selection, broadcasting, np.exp and
// np.log values, and pandas selection, alignment, filtering, missing values,
// duplicates, group-by results, windows, and time zones. The catalog tests
// run sampled variants in Pyodide with NumPy and pandas and compare the
// output with the generated answer.

const PRINT = 'What does this program print?';
const NP = 'import numpy as np';
const PD = 'import pandas as pd';

/** Draws from `make` until `ok` accepts, so constraints stay seeded. */
function until<T>(make: () => T, ok: (value: T) => boolean): T {
  for (let attempt = 0; attempt < 1000; attempt++) {
    const value = make();
    if (ok(value)) return value;
  }
  throw new Error('No value met the generator constraint.');
}

const sum = (values: number[]) => values.reduce((total, x) => total + x, 0);
const sorted = (values: number[]) => [...values].sort((a, b) => a - b);
/** A Python list of floats as printed: `[1.0, 2.5]`. */
const floats = (values: number[]) => `[${values.map(pyFloat).join(', ')}]`;
/** A Python list of strings in double quotes, as the programs write them. */
const quoted = (values: string[]) =>
  `[${values.map((value) => `"${value}"`).join(', ')}]`;
/** A grid of integers: `[[1, 2], [3, 4]]`. */
const grid = (r: Rng, rows: number, cols: number, min: number, max: number) =>
  Array.from({ length: rows }, () => r.ints(cols, min, max));
/** Python's dict repr with string keys: `{'x': 10, 'y': 7}`. */
const dict = (entries: [string, number | string][]) =>
  `{${entries.map(([key, value]) => `'${key}': ${value}`).join(', ')}}`;

/** e^x for the exponents the exp questions use, to 2 and 3 decimals. */
const EXP: [number, number, number][] = [
  [-2, 0.14, 0.135],
  [-1, 0.37, 0.368],
  [-0.5, 0.61, 0.607],
  [0, 1, 1],
  [0.5, 1.65, 1.649],
  [1, 2.72, 2.718],
  [1.5, 4.48, 4.482],
  [2, 7.39, 7.389],
  [3, 20.09, 20.086],
  [4, 54.6, 54.598],
];
/** ln x to 3 decimals for the inputs the log questions use. */
const LOG: [number, number][] = [
  [0.1, -2.303],
  [0.5, -0.693],
  [1, 0],
  [2, 0.693],
  [3, 1.099],
  [4, 1.386],
  [5, 1.609],
  [8, 2.079],
  [10, 2.303],
  [20, 2.996],
  [100, 4.605],
];
/** Probabilities whose logs the log-likelihood questions add. */
const PROBABILITIES = [0.1, 0.2, 0.25, 0.4, 0.5, 0.8];

export const generators: GeneratorModule = {
  // da-arrays: Turn a list into an array and read its shape
  'da-arrays-kp1-q1': (r) => {
    const [rows, cols] = [r.int(2, 5), r.int(1, 4)];
    return typeOutput(
      PRINT,
      `${NP}\npoints = np.array(${py(grid(r, rows, cols, 0, 9))})\nprint(points.shape)`,
      `(${rows}, ${cols})`,
      `${rows} inner lists become ${rows} rows, and each has ${cols} ${cols === 1 ? 'value' : 'values'}, so the shape is (${rows}, ${cols}).`,
    );
  },
  // da-arrays: Count entries and axes with size and ndim
  'da-arrays-kp2-q1': (r) => {
    const [rows, cols] = [r.int(2, 4), r.int(2, 5)];
    return typeOutput(
      PRINT,
      `${NP}\nflags = np.array(${py(grid(r, rows, cols, 0, 1))})\nprint(flags.size)`,
      String(rows * cols),
      `The shape is (${rows}, ${cols}), and size multiplies the axis lengths: $${rows} \\times ${cols} = ${rows * cols}$.`,
    );
  },
  // da-arrays: Choose a data type
  'da-arrays-kp3-q1': (r) => {
    const values = until(
      () =>
        r
          .ints(r.int(3, 4), 2, 20)
          .map((x) => (r.int(0, 2) === 0 ? x / 2 : Math.round(x / 2))),
      (v) => v.some((x) => !Number.isInteger(x)) && v.some(Number.isInteger),
    );
    return typeOutput(
      PRINT,
      `${NP}\nweights = np.array([${values.map(num).join(', ')}])\nprint(weights.tolist())`,
      floats(values),
      `One entry has a decimal part, so the whole array gets a float dtype, and the whole numbers become floats too: ${floats(values)}.`,
    );
  },

  // da-vectorization: Apply arithmetic to every entry
  'da-vectorization-kp1-q2': (r) => {
    const n = r.int(2, 3);
    const units = r.ints(n, 1, 9);
    const price = r.ints(n, 1, 8).map((x) => x * 5);
    const product = units.map((u, i) => u * price[i]);
    return typeOutput(
      PRINT,
      `${NP}\nunits = np.array(${py(units)})\nprice = np.array(${py(price)})\nprint((units * price).tolist())`,
      py(product),
      `Two arrays of the same shape multiply position by position: ${units.map((u, i) => `$${u} \\times ${price[i]} = ${product[i]}$`).join(', ')}.`,
    );
  },
  // da-vectorization: Reduce a whole array to one number
  'da-vectorization-kp2-q1': (r) => {
    const n = r.pick([2, 4, 5]);
    const scores = r.ints(n, 1, 20);
    const total = sum(scores);
    return typeOutput(
      PRINT,
      `${NP}\nscores = np.array(${py(scores)})\nprint(scores.sum())\nprint(scores.mean())`,
      `${total}\n${pyFloat(total / n)}`,
      `sum adds every entry to ${total}; mean divides by the ${n} entries, $${total} / ${n} = ${num(total / n)}$, and is always a float.`,
    );
  },
  // da-vectorization: Reduce along one axis
  'da-vectorization-kp3-q1': (r) => {
    const a = grid(r, 3, 2, 1, 9);
    const totals = [0, 1].map((c) => sum(a.map((row) => row[c])));
    return typeOutput(
      PRINT,
      `${NP}\na = np.array(${py(a)})\nprint(a.sum(axis=0).tolist())`,
      py(totals),
      `axis=0 combines the rows, leaving one total per column: ${a.map((row) => row[0]).join(' + ')} = ${totals[0]} and ${a.map((row) => row[1]).join(' + ')} = ${totals[1]}.`,
    );
  },
  // da-vectorization: Match the axis to the question
  'da-vectorization-kp4-q3': (r) => {
    const column = () => {
      const values = r.ints(2, 5, 10).map((x) => x * 10);
      const third = until(
        () => r.int(5, 10) * 5,
        (x) => (sum(values) + x) % 3 === 0,
      );
      return r.shuffle([...values, third]);
    };
    const [first, second] = [column(), column()];
    const scores = first.map((x, i) => [x, second[i]]);
    const means = [sum(first) / 3, sum(second) / 3];
    return typeOutput(
      'Rows are classrooms and columns are exams. What does this program print?',
      `${NP}\nscores = np.array(${py(scores)})\nprint(scores.mean(axis=0).tolist())`,
      floats(means),
      `axis=0 averages down each column, giving one mean per exam: ${sum(first)} / 3 = ${means[0]} and ${sum(second)} / 3 = ${means[1]}.`,
    );
  },

  // da-array-indexing: Select by row and column position
  'da-array-indexing-kp1-q1': (r) => {
    const a = grid(r, 2, 3, 0, 9);
    const [i, j] = [r.int(0, 1), r.int(0, 2)];
    return typeOutput(
      PRINT,
      `${NP}\na = np.array(${py(a)})\nprint(a[${i}, ${j}])`,
      String(a[i][j]),
      `a[${i}, ${j}] is row ${i} (the ${i === 0 ? 'first' : 'second'} row) and column ${j}, counting from 0: ${a[i][j]}.`,
    );
  },
  // da-array-indexing: Filter with a boolean mask
  'da-array-indexing-kp2-q1': (r) => {
    const [v, t] = until(
      () => [r.ints(5, 1, 20), r.int(3, 18)] as const,
      ([values, x]) => values.some((y) => y >= x) && values.some((y) => y < x),
    );
    const kept = v.filter((x) => x >= t);
    return typeOutput(
      PRINT,
      `${NP}\nv = np.array(${py(v)})\nprint(v[v >= ${t}].tolist())`,
      py(kept),
      `v >= ${t} is True at the positions of ${kept.join(', ')}, and the mask keeps exactly those entries, in their original order.`,
    );
  },
  // da-array-indexing: Know when a selection shares data
  'da-array-indexing-kp3-q1': (r) => {
    const a = r.ints(r.int(3, 4), 1, 9);
    const end = r.int(2, a.length - 1);
    const j = r.int(0, end - 1);
    const value = until(
      () => r.int(0, 9),
      (x) => x !== a[j],
    );
    const after = a.map((x, i) => (i === j ? value : x));
    return typeOutput(
      PRINT,
      `${NP}\na = np.array(${py(a)})\npart = a[:${end}]\npart[${j}] = ${value}\nprint(a.tolist())`,
      py(after),
      `a[:${end}] is a view that shares a's storage, so setting part[${j}] also changes a[${j}] to ${value}.`,
    );
  },

  // da-broadcasting: Turn a vector into a column
  'da-broadcasting-kp2-q2': (r) => {
    const m = grid(r, 2, 3, 1, 6);
    const s = r.sample([2, 3, 5, 10, 20], 2);
    const product = m.map((row, i) => row.map((x) => x * s[i]));
    return typeOutput(
      PRINT,
      `${NP}\nm = np.array(${py(m)})\ns = np.array(${py(s)})\nprint((m * s[:, None]).tolist())`,
      py(product),
      `s[:, None] has shape (2, 1), so each row of m is multiplied by its own entry of s: the first row by ${s[0]}, the second by ${s[1]}.`,
    );
  },
  // da-broadcasting: Predict the result shape
  'da-broadcasting-kp3-q2': (r) => {
    const column = r.sample([1, 2, 3, 4, 5], 2);
    const row = r.ints(3, 1, 9);
    const table = column.map((c) => row.map((x) => c * x));
    return typeOutput(
      PRINT,
      `${NP}\na = np.array([[${column[0]}], [${column[1]}]])\nb = np.array(${py(row)})\nprint((a * b).tolist())`,
      py(table),
      `a has shape (2, 1) and b has shape (3,), so both stretch to (2, 3): each entry of a multiplies the whole of b.`,
    );
  },

  // da-series: Select by label or by position
  'da-series-kp2-q1': (r) => {
    const values = r.sample([10, 20, 30, 40, 50, 60, 70], 3);
    const index = until(
      () => r.shuffle([0, 1, 2]),
      (order) => order.join() !== '0,1,2',
    );
    const label = r.int(0, 2);
    const value = values[index.indexOf(label)];
    return typeOutput(
      PRINT,
      `${PD}\ns = pd.Series(${py(values)}, index=${py(index)})\nprint(s.loc[${label}])`,
      String(value),
      `loc selects by label, not position: the label ${label} sits at position ${index.indexOf(label)}, which holds ${value}.`,
    );
  },
  // da-series: Compute with a Series
  'da-series-kp3-q3': (r) => {
    const cities = r.sample(
      ['north', 'south', 'east', 'west', 'harbor', 'hill'],
      3,
    );
    const values = r.ints(3, 5, 40, true);
    const best = values.indexOf(Math.max(...values));
    return typeOutput(
      PRINT,
      `${PD}\ns = pd.Series({${cities.map((c, i) => `"${c}": ${values[i]}`).join(', ')}})\nprint(s.idxmax())\nprint(s.max())`,
      `${cities[best]}\n${values[best]}`,
      `max returns the largest value, ${values[best]}; idxmax returns its label, ${cities[best]}.`,
    );
  },

  // da-dataframes: Add a derived column
  'da-dataframes-kp3-q1': (r) => {
    const n = r.int(2, 3);
    const [w, h] = [r.ints(n, 1, 9), r.ints(n, 1, 9)];
    const area = w.map((x, i) => x * h[i]);
    return typeOutput(
      PRINT,
      `${PD}\nt = pd.DataFrame({"w": ${py(w)}, "h": ${py(h)}})\nt["area"] = t["w"] * t["h"]\nprint(t["area"].tolist())`,
      py(area),
      `Column arithmetic works row by row: ${area.map((a, i) => `$${w[i]} \\times ${h[i]} = ${a}$`).join(', ')}.`,
    );
  },

  // da-label-alignment: Arithmetic matches labels, not positions
  'da-label-alignment-kp1-q1': (r) => {
    const [a, b] = [r.ints(2, 1, 9), r.ints(2, 1, 9).map((x) => x * 10)];
    const label = r.pick(['x', 'y']);
    // a is labelled x, y; b is labelled y, x.
    const value = label === 'x' ? a[0] + b[1] : a[1] + b[0];
    return typeOutput(
      PRINT,
      `${PD}\na = pd.Series(${py(a)}, index=["x", "y"])\nb = pd.Series(${py(b)}, index=["y", "x"])\nprint((a + b).loc["${label}"])`,
      String(value),
      `pandas adds values with the same label, whatever their positions: a's ${label} is ${label === 'x' ? a[0] : a[1]} and b's ${label} is ${label === 'x' ? b[1] : b[0]}, so the sum is ${value}.`,
    );
  },
  // da-label-alignment: Request labels with reindex
  'da-label-alignment-kp3-q1': (r) => {
    const labels = ['x', 'y', 'z'];
    const values = r.ints(3, 1, 9);
    const wanted = until(
      () => r.sample(labels, r.int(2, 3)),
      (order) => order.join() !== labels.slice(0, order.length).join(),
    );
    const result = wanted.map((label) => values[labels.indexOf(label)]);
    return typeOutput(
      PRINT,
      `${PD}\ns = pd.Series(${py(values)}, index=${quoted(labels)})\nprint(s.reindex(${quoted(wanted)}).tolist())`,
      py(result),
      `reindex returns the requested labels in the requested order: ${wanted.map((label, i) => `${label} is ${result[i]}`).join(', ')}. Every label exists, so no value is missing.`,
    );
  },

  // da-table-filtering: Keep rows with a boolean mask
  'da-table-filtering-kp1-q1': (r) => {
    const names = ['a', 'b', 'c', 'd'].slice(0, r.int(3, 4));
    const [qty, limit] = until(
      () => [r.ints(names.length, 0, 9), r.int(0, 7)] as const,
      ([values, k]) => values.some((q) => q > k) && values.some((q) => q <= k),
    );
    const kept = names.filter((_, i) => qty[i] > limit);
    return typeOutput(
      PRINT,
      `${PD}\nt = pd.DataFrame({"name": ${quoted(names)}, "qty": ${py(qty)}})\nprint(t.loc[t["qty"] > ${limit}, "name"].tolist())`,
      py(kept),
      `The mask keeps the rows whose qty is above ${limit}, and "name" picks that column from them: ${kept.join(', ')}.`,
    );
  },
  // da-table-filtering: Combine conditions with &, | and ~
  'da-table-filtering-kp2-q1': (r) => {
    const [x, y, a, b] = until(
      () =>
        [r.ints(4, 1, 9), r.ints(4, 1, 9), r.int(1, 7), r.int(1, 7)] as const,
      ([xs, ys, p, q]) => {
        const n = xs.filter((v, i) => v > p && ys[i] > q).length;
        return n > 0 && n < 4;
      },
    );
    const rows = x.flatMap((v, i) => (v > a && y[i] > b ? [i] : []));
    return typeOutput(
      PRINT,
      `${PD}\nt = pd.DataFrame({"x": ${py(x)}, "y": ${py(y)}})\nprint(t.loc[(t["x"] > ${a}) & (t["y"] > ${b})].index.tolist())`,
      py(rows),
      `& keeps a row only when both conditions hold: x above ${a} and y above ${b}. That is true for ${rows.length === 1 ? `row ${rows[0]}` : `rows ${series(rows)}`}.`,
    );
  },
  // da-table-filtering: Update selected cells in one step
  'da-table-filtering-kp3-q1': (r) => {
    const [scores, pass] = until(
      () => [r.ints(r.int(3, 4), 40, 95), r.pick([50, 60, 70])] as const,
      ([values, p]) => values.some((s) => s < p) && values.some((s) => s >= p),
    );
    const grades = scores.map((s) => (s < pass ? 'fail' : 'pass'));
    return typeOutput(
      PRINT,
      `${PD}\nt = pd.DataFrame({"score": ${py(scores)}})\nt["grade"] = "pass"\nt.loc[t["score"] < ${pass}, "grade"] = "fail"\nprint(t["grade"].tolist())`,
      py(grades),
      `Every row starts as pass; .loc then overwrites grade only in the rows scoring below ${pass}.`,
    );
  },

  // da-missing-values: Choose a rule that matches the meaning
  'da-missing-values-kp3-q1': (r) => {
    const [a, b] = until(
      () => [r.int(1, 30), r.int(1, 30)],
      ([x, y]) => (x + y) % 6 === 0,
    );
    const total = a + b;
    return typeOutput(
      PRINT,
      `${PD}\ns = pd.Series([${a}.0, None, ${b}.0])\nprint(s.mean())\nprint(s.fillna(0).mean())`,
      `${pyFloat(total / 2)}\n${pyFloat(total / 3)}`,
      `mean skips the missing value: $${total} / 2 = ${total / 2}$. After fillna(0) the 0 counts as a reading: $${total} / 3 = ${total / 3}$.`,
    );
  },

  // da-duplicates: Find repeated keys with duplicated
  'da-duplicates-kp1-q4': (r) => {
    const users = Array.from({ length: 5 }, () => r.pick(['a', 'b', 'c']));
    const days = Array.from({ length: 5 }, () => r.int(1, 2));
    const pairs = users.map((u, i) => `${u}${days[i]}`);
    const repeats = pairs.filter((p, i) => pairs.indexOf(p) < i).length;
    return typeOutput(
      PRINT,
      `${PD}\nt = pd.DataFrame({"user": ${quoted(users)}, "day": ${py(days)}})\nprint(t.duplicated(subset=["user", "day"]).sum())`,
      String(repeats),
      repeats === 0
        ? 'Every user and day pair is different, so no row repeats an earlier one.'
        : `A row counts when its user and day pair already appeared earlier; ${repeats} ${repeats === 1 ? 'row does' : 'rows do'}. The first occurrence of each pair is not counted.`,
    );
  },

  // da-groupby: Total a column per group
  'da-groupby-kp1-q1': (r) => {
    const teams = until(
      () => Array.from({ length: r.int(3, 5) }, () => r.pick(['x', 'y'])),
      (t) => t.includes('x') && t.includes('y'),
    );
    const pts = r.ints(teams.length, 1, 9);
    const total = (team: string) =>
      sum(pts.filter((_, i) => teams[i] === team));
    return typeOutput(
      PRINT,
      `${PD}\ndf = pd.DataFrame({"team": ${quoted(teams)}, "pts": ${py(pts)}})\nprint(df.groupby("team")["pts"].sum().to_dict())`,
      dict([
        ['x', total('x')],
        ['y', total('y')],
      ]),
      `Each team's rows are added: x gets ${pts.filter((_, i) => teams[i] === 'x').join(' + ')} = ${total('x')}, and y gets ${pts.filter((_, i) => teams[i] === 'y').join(' + ')} = ${total('y')}.`,
    );
  },
  // da-groupby: Decide whether missing keys form a group
  'da-groupby-kp3-q3': (r) => {
    const teams = until(
      () => Array.from({ length: 4 }, () => r.pick(['r', 'b', null])),
      (t) => t.includes(null) && t.some((x) => x !== null),
    );
    const pts = r.ints(4, 1, 9);
    const dropped = sum(pts.filter((_, i) => teams[i] === null));
    return typeOutput(
      PRINT,
      `${PD}\ndf = pd.DataFrame({"team": [${teams.map((t) => (t === null ? 'None' : `"${t}"`)).join(', ')}], "pts": ${py(pts)}})\nprint(df["pts"].sum() - df.groupby("team")["pts"].sum().sum())`,
      String(dropped),
      `groupby drops rows whose key is missing, so the grouped total leaves out exactly the points of the None rows: ${dropped}.`,
    );
  },

  // da-aggregations: Pick statistics that fit the question
  'da-aggregations-kp2-q1': (r) => {
    const values = until(
      () => [r.int(1, 9), r.int(1, 9), r.int(50, 99)],
      (v) => sum(v) % 3 === 0 && v[0] !== v[1],
    );
    const shown = r.shuffle(values);
    const median = sorted(values)[1];
    return typeOutput(
      PRINT,
      `${PD}\ns = pd.Series(${py(shown)})\nprint(s.median())\nprint(s.mean())`,
      `${pyFloat(median)}\n${pyFloat(sum(values) / 3)}`,
      `The median is the middle value once sorted, ${median}, and the outlier ${values[2]} cannot move it. The mean, $${sum(values)} / 3 = ${sum(values) / 3}$, is pulled toward the outlier.`,
    );
  },

  // da-transforms: Repeat a group result on every row
  'da-transforms-kp1-q1': (r) => {
    const groups = until(
      () => Array.from({ length: r.int(3, 4) }, () => r.pick(['x', 'y'])),
      (g) => g.includes('x') && g.includes('y'),
    );
    const v = r.ints(groups.length, 1, 20);
    const totals = groups.map((g) => sum(v.filter((_, i) => groups[i] === g)));
    return typeOutput(
      PRINT,
      `${PD}\ndf = pd.DataFrame({"g": ${quoted(groups)}, "v": ${py(v)}})\nprint(df.groupby("g")["v"].transform("sum").tolist())`,
      py(totals),
      `transform computes each group's sum and writes it back on every row of that group, so the result keeps all ${groups.length} rows.`,
    );
  },

  // da-window: Average a trailing window
  'da-window-kp1-q1': (r) => {
    const s = r.ints(r.int(4, 5), 1, 20);
    const means = s.slice(1).map((x, i) => (x + s[i]) / 2);
    return typeOutput(
      PRINT,
      `${PD}\ns = pd.Series(${py(s)})\nprint(s.rolling(2).mean().tolist())`,
      `[nan, ${means.map(pyFloat).join(', ')}]`,
      `Each window holds a row and the one before it. The first row has no earlier row, so its window is incomplete and gives nan; the rest are averages of neighbours, such as $(${s[0]} + ${s[1]}) / 2 = ${means[0]}$.`,
    );
  },

  // da-datetime: Normalise offsets to UTC
  'da-datetime-kp2-q1': (r) => {
    const hour = r.int(0, 23);
    const offset = until(
      () => r.int(-8, 9),
      (x) => x !== 0,
    );
    const utc = (((hour - offset) % 24) + 24) % 24;
    const stamp = `2024-05-01T${String(hour).padStart(2, '0')}:00:00${offset < 0 ? '-' : '+'}${String(Math.abs(offset)).padStart(2, '0')}:00`;
    return typeOutput(
      PRINT,
      `${PD}\nt = pd.to_datetime(pd.Series(["${stamp}"]), utc=True)\nprint(t.dt.hour.tolist())`,
      `[${utc}]`,
      `The offset says local time is ${Math.abs(offset)} ${Math.abs(offset) === 1 ? 'hour' : 'hours'} ${offset > 0 ? 'ahead of' : 'behind'} UTC, so UTC is ${offset > 0 ? `${offset} hours earlier` : `${-offset} hours later`}: ${hour}:00 becomes ${utc}:00${hour - offset < 0 || hour - offset > 23 ? ' on the neighbouring day' : ''}.`,
    );
  },

  // da-exploration: Count categories with value_counts
  'da-exploration-kp1-q1': (r) => {
    const [first, second, third] = r.sample(['a', 'b', 'c', 'd', 'e'], 3);
    const values = r.shuffle([first, first, first, second, second, third]);
    return typeOutput(
      PRINT,
      `${PD}\ns = pd.Series(${quoted(values)})\nprint(s.value_counts().to_dict())`,
      dict([
        [first, 3],
        [second, 2],
        [third, 1],
      ]),
      `value_counts counts each label and sorts the counts from most to least frequent: ${first} 3 times, ${second} twice, ${third} once.`,
    );
  },

  // da-exp-log: Apply np.exp to every entry
  'da-exp-log-kp1-q1': (r) => {
    const rows = until(
      () =>
        sorted(r.sample([0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 3)).map((i) => EXP[i]),
      (picked) => picked.map(([x]) => x).join() !== '-1,0,1',
    );
    const digits = r.pick([2, 3]);
    const z = rows.map(([x]) => x);
    const values = rows.map((row) => (digits === 2 ? row[1] : row[2]));
    return typeOutput(
      PRINT,
      `${NP}\nz = np.array(${floats(z)})\nprint(np.exp(z).round(${digits}).tolist())`,
      floats(values),
      `np.exp applies $e^x$ to each entry: ${z.map((x, i) => `$e^{${num(x)}} \\approx ${values[i]}$`).join(', ')}, each rounded to ${digits} decimals by round(${digits}).`,
    );
  },
  // da-exp-log: Take natural logs with np.log
  'da-exp-log-kp2-q2': (r) => {
    const rows = r.sample(LOG, 3);
    const x = rows.map(([value]) => value);
    const logs = rows.map(([, value]) => value);
    return typeOutput(
      PRINT,
      `${NP}\nx = np.array(${floats(x)})\nprint(np.log(x).round(3).tolist())`,
      floats(logs),
      `np.log takes the natural log of each entry: ${x.map((v, i) => `$\\ln ${num(v)} \\approx ${logs[i]}$`).join(', ')}. Entries below 1 have negative logs.`,
    );
  },
  // da-exp-log: Add logs instead of multiplying probabilities
  'da-exp-log-kp3-q1': (r) => {
    const p = r
      .ints(r.int(2, 3), 0, PROBABILITIES.length - 1)
      .map((i) => PROBABILITIES[i]);
    const total = Math.round(sum(p.map(Math.log)) * 1000) / 1000;
    const product = p.reduce((a, b) => a * b, 1);
    return typeOutput(
      PRINT,
      `${NP}\np = np.array(${floats(p)})\nprint(round(float(np.log(p).sum()), 3))`,
      pyFloat(total),
      `The sum of the logs is the log of the product: $\\ln(${p.map(num).join(' \\times ')}) = \\ln ${num(product)} \\approx ${total}$.`,
    );
  },
};
