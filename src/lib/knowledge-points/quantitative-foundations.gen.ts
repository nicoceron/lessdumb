import {
  binomial,
  coef,
  grouped,
  num,
  paren,
  plus,
  poly,
  prose,
  py,
  pyFloat,
  series,
  terms,
  typeNumber,
  typeOutput,
  type GeneratorModule,
} from './authoring';

// Quantitative foundations: fresh numbers for the calculation questions, so
// a retry or a review cannot be answered from memory. Each generator varies
// the authored question with the same ID (see docs/knowledge-points.md).

const sum = (values: number[]) => values.reduce((total, x) => total + x, 0);
/** A decimal with at most `places` digits, without floating-point noise. */
const round = (value: number, places = 6) => Number(value.toFixed(places));
/** Probabilities to two decimals, as integers out of 100. */
const hundredths = (value: number) => num(value / 100);
/** Sigmoid values to three decimals for integer scores. */
const SIGMOID: Record<number, number> = {
  [-4]: 0.018,
  [-3]: 0.047,
  [-2]: 0.119,
  [-1]: 0.269,
  1: 0.731,
  2: 0.881,
  3: 0.953,
  4: 0.982,
};

export const generators: GeneratorModule = {
  // math-mean: Compute an arithmetic mean
  'math-mean-kp1-q2': (r) => {
    const count = r.int(4, 6);
    const values = r.ints(count - 1, 2, 60);
    let last = r.int(2, 60);
    last += (count - ((sum(values) + last) % count)) % count;
    values.push(last);
    const total = sum(values);
    return typeNumber(
      `What is the mean of ${series(values)}?`,
      total / count,
      `The sum is ${total} and the count is ${count}, so the mean is $${total} / ${count} = ${total / count}$.`,
    );
  },
  // math-mean: See how one extreme value moves the mean
  'math-mean-kp2-q2': (r) => {
    const mean = r.int(5, 14);
    const values = r.shuffle(
      r
        .pick([
          [-1, 0, 1],
          [-2, 0, 2],
          [-3, 1, 2],
          [-2, -1, 3],
          [-4, 1, 3],
          [-3, 0, 3],
        ])
        .map((offset) => mean + offset),
    );
    const target = mean + r.int(1, 6);
    const added = 4 * target - 3 * mean;
    return typeNumber(
      `The mean of ${series(values)} is ${mean}. Which added value makes the new mean ${target}?`,
      added,
      `Four values with mean ${target} must sum to ${4 * target}, and $${4 * target} - ${3 * mean} = ${added}$.`,
    );
  },
  // math-mean: Combine groups with a weighted mean
  'math-mean-kp3-q4': (r) => {
    const total = r.pick([2, 4, 5, 8, 10]);
    const first = r.int(1, total - 1);
    const [a, b] = r.ints(2, 1, 20, true);
    const weighted = a * first + b * (total - first);
    return typeNumber(
      `Values ${a} and ${b} have weights ${first} and ${total - first}. What is the weighted mean?`,
      weighted / total,
      `$(${a} \\times ${first} + ${b} \\times ${total - first}) / (${first} + ${total - first}) = ${weighted} / ${total} = ${num(weighted / total)}$.`,
    );
  },
  // math-variance: Measure spread with squared deviations
  'math-variance-kp1-q4': (r) => {
    const mean = r.int(5, 30);
    const [d1, d2] = [r.int(0, 5), r.int(1, 6)];
    const values = r.shuffle([mean - d1, mean + d1, mean - d2, mean + d2]);
    const variance = (d1 * d1 + d2 * d2) / 2;
    return typeNumber(
      `What is the population variance of ${series(values)}?`,
      variance,
      `The mean is ${mean}; the squared deviations are ${series(values.map((x) => (x - mean) ** 2))}, and their mean is ${num(variance)}.`,
    );
  },
  // math-variance: Return to original units with the standard deviation
  'math-variance-kp2-q2': (r) => {
    const root = r.int(2, 30);
    return typeOutput(
      'What does this program print?',
      `print(${root * root} ** 0.5)`,
      `${root}.0`,
      `Raising to the power 0.5 takes a square root, $\\sqrt{${root * root}} = ${root}$, and the result is a float.`,
    );
  },
  // math-variance: Choose between dividing by n and n − 1
  'math-variance-kp3-q1': (r) => {
    const n = r.int(3, 12);
    const variance = r.int(2, 15);
    const total = variance * (n - 1);
    return typeNumber(
      `Squared deviations sum to ${total} across ${n} sampled observations. What is the sample variance, using $n - 1$?`,
      variance,
      `$${total} / (${n} - 1) = ${variance}$.`,
    );
  },
  // math-median: Find the median of an odd number of values
  'math-median-kp1-q1': (r) => {
    const count = r.pick([5, 7]);
    const values = r.ints(count, 1, 40, true);
    const sorted = [...values].sort((a, b) => a - b);
    const median = sorted[(count - 1) / 2];
    return typeNumber(
      `What is the median of ${values.join(', ')}?`,
      median,
      `Sorted, the values are ${sorted.join(', ')}, so the middle value is ${median}.`,
    );
  },
  // math-median: Average the middle pair for an even count
  'math-median-kp2-q1': (r) => {
    const count = r.pick([4, 6]);
    const values = r.ints(count, 1, 50, true);
    const sorted = [...values].sort((a, b) => a - b);
    const [low, high] = [sorted[count / 2 - 1], sorted[count / 2]];
    return typeNumber(
      `What is the median of ${values.join(', ')}?`,
      (low + high) / 2,
      `Sorted, the values are ${sorted.join(', ')}; the middle pair ${low} and ${high} averages to ${num((low + high) / 2)}.`,
    );
  },
  // math-percentiles: Compute a percentile from its position
  'math-percentiles-kp2-q2': (r) => {
    const n = r.int(5, 9);
    const values = r.ints(n, 1, 60, true).sort((a, b) => a - b);
    const percent = r.pick([10, 20, 25, 30, 40, 50, 60, 70, 75, 80, 90]);
    // The position p × (n − 1), in hundredths, keeps the arithmetic exact.
    const position = percent * (n - 1);
    const below = Math.floor(position / 100);
    const share = position % 100;
    const answer = share
      ? (values[below] * 100 + share * (values[below + 1] - values[below])) /
        100
      : values[below];
    return typeNumber(
      `Sorted values are ${values.join(', ')}. What is the ${percent}th percentile by the position rule?`,
      answer,
      share
        ? `The position $${num(percent / 100)} \\times ${n - 1} = ${num(position / 100)}$ lies ${share}% of the way from ${values[below]} to ${values[below + 1]}, giving ${num(answer)}.`
        : `The position $${num(percent / 100)} \\times ${n - 1} = ${below}$ is a whole number, and position ${below} holds ${values[below]}.`,
    );
  },
  // math-percentiles: Summarize spread with quartiles and the IQR
  'math-percentiles-kp3-q1': (r) => {
    const q1 = r.int(5, 60);
    const iqr = r.int(4, 40);
    return typeNumber(
      `$Q_1 = ${q1}$ and $Q_3 = ${q1 + iqr}$. What is the IQR?`,
      iqr,
      `$\\text{IQR} = Q_3 - Q_1 = ${q1 + iqr} - ${q1} = ${iqr}$.`,
    );
  },
  // math-percentiles: Flag outliers with the 1.5 × IQR rule
  'math-percentiles-kp4-q1': (r) => {
    const q1 = r.int(10, 80);
    const iqr = 2 * r.int(2, 20);
    const q3 = q1 + iqr;
    const upper = r.int(0, 1) === 1;
    const fence = upper ? q3 + 1.5 * iqr : q1 - 1.5 * iqr;
    return typeNumber(
      `$Q_1 = ${q1}$ and $Q_3 = ${q3}$. What is the ${upper ? 'upper' : 'lower'} fence?`,
      fence,
      `$\\text{IQR} = ${iqr}$, so the fence is $${upper ? `${q3} +` : `${q1} -`} 1.5 \\times ${iqr} = ${fence}$.`,
    );
  },
  // math-vectors: Store features as an ordered vector
  'math-vectors-kp1-q4': (r) => {
    const v = r.ints(r.int(3, 6), 0, 9);
    const [i, j] = r
      .sample(
        v.map((_, k) => k),
        2,
      )
      .sort((a, b) => a - b);
    return typeOutput(
      'What does this program print?',
      `v = ${py(v)}\nprint(len(v), v[${i}] + v[${j}])`,
      `${v.length} ${v[i] + v[j]}`,
      `There are ${v.length} coordinates, and positions ${i} and ${j} hold ${v[i]} and ${v[j]}.`,
    );
  },
  // math-vectors: Add vectors and scale them
  'math-vectors-kp2-q2': (r) => {
    const k = r.pick([-3, -2, 2, 3, 4, 5]);
    const v = r.ints(3, -5, 9);
    return typeOutput(
      'What does this program print?',
      `v = ${py(v)}\nprint([${k} * x for x in v])`,
      py(v.map((x) => k * x)),
      `The comprehension multiplies every coordinate by ${prose(k)}.`,
    );
  },
  // math-vectors: Compute a dot product
  'math-vectors-kp3-q1': (r) => {
    const a = r.ints(3, -4, 5);
    const b = r.ints(3, -4, 5);
    const products = a.map((x, i) => x * b[i]);
    return typeNumber(
      `What is $${py(a)} \\cdot ${py(b)}$?`,
      sum(products),
      `The products are ${series(products.map(prose))}, which add to ${prose(sum(products))}; the dot product is a single number.`,
    );
  },
  // math-vectors: Read a weighted sum as a dot product
  'math-vectors-kp4-q1': (r) => {
    const w = [
      r.pick([-2, -1, -0.5, 0.5, 1, 1.5, 2]),
      r.pick([-2, -1, -0.5, 0.5, 1, 2, 3]),
    ];
    const x = [2 * r.int(-3, 4), r.int(-3, 5)];
    const b = r.int(-5, 5);
    const value = w[0] * x[0] + w[1] * x[1] + b;
    return typeNumber(
      `$w = ${py(w)}$, $x = ${py(x)}$, and $b = ${b}$. What is $w \\cdot x + b$?`,
      value,
      `$${num(w[0])} \\times ${paren(x[0])} + ${paren(w[1])} \\times ${paren(x[1])}${plus(b)} = ${num(value)}$.`,
    );
  },
  // math-covariance: Read the sign of covariance
  'math-covariance-kp1-q4': (r) => {
    const n = r.int(3, 5);
    const covariance = r.int(-4, 5);
    const products = r.ints(n - 1, -8, 9);
    products.push(covariance * n - sum(products));
    return typeNumber(
      `The paired deviation products are ${series(products.map(prose))}. What is the population covariance?`,
      covariance,
      `Their sum is ${prose(covariance * n)} and there are ${n} pairs, so the covariance is ${prose(covariance)}.`,
    );
  },
  // math-covariance: Compute population covariance
  'math-covariance-kp2-q2': (r) => {
    const [x1, y1] = [r.int(0, 9), r.int(0, 9)];
    const dx = r.pick([-3, -2, -1, 1, 2, 3]);
    const dy = r.pick([-3, -2, -1, 1, 2, 3]);
    const x = [x1, x1 + 2 * dx];
    const y = [y1, y1 + 2 * dy];
    const product = dx * dy;
    return typeNumber(
      `$x = ${py(x)}$ and $y = ${py(y)}$. What is their population covariance?`,
      product,
      `The means are ${prose(x1 + dx)} and ${prose(y1 + dy)}; both products $(${-dx})(${-dy})$ and $(${dx})(${dy})$ equal ${prose(product)}, so their mean is ${prose(product)}.`,
    );
  },
  // math-covariance: Know what covariance's size depends on
  'math-covariance-kp3-q1': (r) => {
    const c = r.pick([-4, -3, -2, 2, 3, 4, 5, 6]);
    const a = r.pick([-3, -2, 2, 3, 4, 5]);
    const k = r.int(1, 20);
    const form = r.int(0, 2);
    const [expression, answer, why]: [string, number, string] =
      form === 0
        ? [
            `${a}x`,
            a * c,
            `Scaling $x$ by ${prose(a)} scales every deviation of $x$, and so every product, by ${prose(a)}.`,
          ]
        : form === 1
          ? [
              `x + ${k}`,
              c,
              `Adding ${k} moves the mean by ${k} as well, so the deviations do not change.`,
            ]
          : [
              `${a}x + ${k}`,
              a * c,
              `The shift by ${k} changes no deviation, and the factor ${prose(a)} scales every product.`,
            ];
    return typeNumber(
      `$\\operatorname{cov}(x, y) = ${c}$. What is $\\operatorname{cov}(${expression}, y)$?`,
      answer,
      why,
    );
  },
  // math-correlation: Compute a correlation coefficient
  'math-correlation-kp1-q1': (r) => {
    const sx = r.pick([1, 2, 4, 5, 8, 10]);
    const sy = r.pick([2, 4, 5, 10]);
    const limit = sx * sy;
    const covariance = r.pick([-1, 1]) * r.int(1, limit - 1);
    return typeNumber(
      `$\\operatorname{cov}(x, y) = ${covariance}$, $\\sigma_x = ${sx}$, and $\\sigma_y = ${sy}$. What is $r$?`,
      covariance / limit,
      `$r = ${covariance} / (${sx} \\times ${sy}) = ${num(covariance / limit)}$.`,
    );
  },
  // math-correlation: Interpret r between −1 and 1
  'math-correlation-kp2-q3': (r) => {
    const slope = r.pick([-5, -4, -3, -2, -1, -0.5, 0.5, 1, 2, 3, 4, 5]);
    const intercept = r.int(-9, 9);
    return typeNumber(
      `Points lie exactly on the line $y = ${poly([slope, intercept])}$. What is $r$?`,
      Math.sign(slope),
      `An exact line with ${slope < 0 ? 'negative' : 'positive'} slope has $r = ${Math.sign(slope)}$; $r$ is not the slope.`,
    );
  },
  // math-probability: Compute a probability from equally likely outcomes
  'math-probability-kp1-q1': (r) => {
    const total = r.pick([4, 5, 8, 10, 16, 20, 25]);
    const first = r.int(1, total - 1);
    const [a, b] = r.sample(['red', 'blue', 'green', 'yellow', 'white'], 2);
    return typeNumber(
      `A bag holds ${first} ${a} and ${total - first} ${b} marbles. What is $P(\\text{${a}})$ for one random draw?`,
      first / total,
      `${first} favorable marbles out of ${total} equally likely ones: $${first} / ${total} = ${num(first / total)}$.`,
    );
  },
  // math-probability: Use the complement
  'math-probability-kp2-q1': (r) => {
    const p = r.int(1, 99);
    const [event, complement] = r.pick([
      ['defect', 'no defect'],
      ['rain', 'no rain'],
      ['click', 'no click'],
      ['error', 'no error'],
    ]);
    return typeNumber(
      `$P(\\text{${event}}) = ${hundredths(p)}$. What is $P(\\text{${complement}})$?`,
      (100 - p) / 100,
      `$1 - ${hundredths(p)} = ${hundredths(100 - p)}$.`,
    );
  },
  // math-probability: Condition on a selected group
  'math-probability-kp3-q3': (r) => {
    const group = r.pick([20, 40, 50, 80, 100, 200, 250]);
    const total = group * r.int(3, 10);
    const both = r.int(1, group - 1);
    return typeNumber(
      `Of ${grouped(total)} people, ${group} smoke, and ${both} of the smokers have a cough. What is $P(\\text{cough} \\mid \\text{smoker})$?`,
      both / group,
      `Restrict to the ${group} smokers: $${both} / ${group} = ${num(both / group)}$.`,
    );
  },
  // math-probability: Keep P(A | B) and P(B | A) apart
  'math-probability-kp4-q2': (r) => {
    const [math, art] = r.sample([10, 20, 25, 40, 50, 80], 2);
    const both = r.int(1, Math.min(math, art) - 1);
    const total = math + art - both <= 100 ? 100 : 200;
    const givenArt = r.int(0, 1) === 1;
    const [given, other] = givenArt ? ['art', 'math'] : ['math', 'art'];
    const size = givenArt ? art : math;
    return typeNumber(
      `Of ${total} students, ${math} study math, ${art} study art, and ${both} study both. What is $P(\\text{${other}} \\mid \\text{${given}})$?`,
      both / size,
      `Among the ${size} ${given} students, ${both} study ${other}: $${both} / ${size} = ${num(both / size)}$.`,
    );
  },
  // math-random-variables: Describe a random variable by its distribution
  'math-random-variables-kp1-q2': (r) => {
    const a = r.int(1, 8);
    const b = r.int(1, 9 - a);
    const values = r.ints(3, 0, 9, true).sort((x, y) => x - y);
    return typeNumber(
      `A distribution has $P(X = ${values[0]}) = ${num(a / 10)}$, $P(X = ${values[1]}) = ${num(b / 10)}$, and one other value, ${values[2]}. What is $P(X = ${values[2]})$?`,
      (10 - a - b) / 10,
      `The probabilities must sum to 1: $1 - ${num(a / 10)} - ${num(b / 10)} = ${num((10 - a - b) / 10)}$.`,
    );
  },
  // math-random-variables: Compute an expected value
  'math-random-variables-kp2-q4': (r) => {
    const p = r.pick([1, 2, 4, 5, 10, 20, 25]);
    const win = r.pick([10, 20, 25, 40, 50, 100]);
    const loss = r.int(1, 5);
    const value = (win * p - loss * (100 - p)) / 100;
    return typeNumber(
      `A bet wins ${win} with probability ${hundredths(p)} and loses ${loss} otherwise. What is its expected result?`,
      value,
      `$${win} \\times ${hundredths(p)} - ${loss} \\times ${hundredths(100 - p)} = ${hundredths(win * p)} - ${hundredths(loss * (100 - p))} = ${num(value)}$.`,
    );
  },
  // math-random-variables: Use linearity of expectation
  'math-random-variables-kp3-q1': (r) => {
    const mean = r.int(-6, 9);
    const a = r.pick([-3, -2, 2, 3, 4, 5]);
    const b = r.int(-9, 9);
    return typeNumber(
      `$E[X] = ${mean}$. What is $E[${a}X${plus(b)}]$?`,
      a * mean + b,
      `$${a} \\times ${paren(mean)}${plus(b)} = ${a * mean + b}$.`,
    );
  },
  // math-rv-variance: Compute the variance of a random variable
  'math-rv-variance-kp1-q2': (r) => {
    const mean = r.int(-5, 6);
    const variance = r.int(1, 12);
    const square = variance + mean * mean;
    return typeNumber(
      `$E[X] = ${mean}$ and $E[X^2] = ${square}$. What is $\\operatorname{Var}(X)$?`,
      variance,
      `$\\operatorname{Var}(X) = E[X^2] - \\mu^2 = ${square} - ${mean * mean} = ${variance}$.`,
    );
  },
  // math-rv-variance: Scale and shift a random variable
  'math-rv-variance-kp2-q2': (r) => {
    const variance = r.int(1, 9);
    const a = r.pick([-4, -3, -2, 2, 3, 4, 5, 10]);
    const b = r.int(-9, 9);
    return typeNumber(
      `$\\operatorname{Var}(X) = ${variance}$. What is $\\operatorname{Var}(${a}X${plus(b)})$?`,
      a * a * variance,
      `$${paren(a)}^2 \\times ${variance} = ${a * a * variance}$${b ? `; the shift by ${prose(b)} does not change spread` : ''}.`,
    );
  },
  // math-rv-variance: Add independent variances and average them down
  'math-rv-variance-kp3-q2': (r) => {
    const n = r.pick([2, 4, 5, 8, 10, 16, 20, 25, 50, 100]);
    const answer = r.int(1, 8);
    return typeNumber(
      `Each of ${n} independent readings has variance ${answer * n}. What is the variance of their mean?`,
      answer,
      `$\\sigma^2 / n = ${answer * n} / ${n} = ${answer}$.`,
    );
  },
  // math-bernoulli-binomial: Describe a Bernoulli trial
  'math-bernoulli-binomial-kp1-q2': (r) => {
    const p = 5 * r.int(1, 19);
    const variance = (p * (100 - p)) / 10_000;
    return typeNumber(
      `$X$ is Bernoulli with $p = ${hundredths(p)}$. What is $\\operatorname{Var}(X)$?`,
      variance,
      `$p(1 - p) = ${hundredths(p)} \\times ${hundredths(100 - p)} = ${num(variance)}$.`,
    );
  },
  // math-bernoulli-binomial: Multiply probabilities of independent trials
  'math-bernoulli-binomial-kp2-q2': (r) => {
    const [subject, event, none] = r.pick([
      ['A server', 'fails', 'no failure'],
      ['A delivery', 'is late', 'no late delivery'],
      ['A sensor', 'misreads', 'no misreading'],
    ]);
    const days = r.int(2, 3);
    const p = days === 2 ? 5 * r.int(1, 9) : 10 * r.int(1, 5);
    const keep = 100 - p;
    const answer = round((keep / 100) ** days);
    return typeNumber(
      `${subject} ${event} on a given day with probability ${hundredths(p)}, independently across days. What is $P(\\text{${none} on ${days === 2 ? 'two' : 'three'} days})$?`,
      answer,
      `$${Array(days).fill(hundredths(keep)).join(' \\times ')} = ${num(answer)}$; probabilities multiply, they do not subtract.`,
    );
  },
  // math-bernoulli-binomial: Count arrangements with C(n, k)
  'math-bernoulli-binomial-kp3-q2': (r) => {
    const n = r.int(4, 12);
    const k = r.int(2, n - 2);
    return typeNumber(
      `What is $C(${n}, ${k})$?`,
      binomial(n, k),
      `$${n}! / (${k}! \\times ${n - k}!) = ${binomial(n, k)}$.`,
    );
  },
  // math-bernoulli-binomial: Combine counts into binomial probabilities
  'math-bernoulli-binomial-kp4-q4': (r) => {
    const n = r.pick([10, 20, 25, 40, 50, 60, 80, 100]);
    const p = r.int(1, 9);
    if (r.int(0, 1) === 0)
      return typeNumber(
        `$K$ is binomial with $n = ${n}$ and $p = ${num(p / 10)}$. What is $E[K]$?`,
        (n * p) / 10,
        `$np = ${n} \\times ${num(p / 10)} = ${num((n * p) / 10)}$.`,
      );
    const variance = (n * p * (10 - p)) / 100;
    return typeNumber(
      `$K$ is binomial with $n = ${n}$ and $p = ${num(p / 10)}$. What is $\\operatorname{Var}(K)$?`,
      variance,
      `$np(1 - p) = ${n} \\times ${num(p / 10)} \\times ${num((10 - p) / 10)} = ${num(variance)}$.`,
    );
  },
  // math-normal-distribution: Standardize values with z-scores
  'math-normal-distribution-kp3-q3': (r) => {
    const mu = r.int(10, 120);
    const sigma = r.pick([2, 4, 5, 6, 8, 10, 12, 15]);
    const z = r.pick([-3, -2.5, -2, -1.5, -1, -0.5, 0.5, 1, 1.5, 2, 2.5, 3]);
    const x = mu + z * sigma;
    return typeNumber(
      `A value has $z = ${num(z)}$ under $N(${mu}, ${sigma}^2)$. What is the value?`,
      x,
      `$x = \\mu + z\\sigma = ${mu} ${z < 0 ? '-' : '+'} ${num(Math.abs(z))} \\times ${sigma} = ${num(x)}$.`,
    );
  },
  // math-sampling: Compute the standard error of a mean
  'math-sampling-kp2-q2': (r) => {
    const root = r.int(2, 12);
    const error = r.pick([0.5, 1, 1.5, 2, 2.5, 3, 4, 5]);
    const sigma = error * root;
    return typeNumber(
      `$\\sigma = ${num(sigma)}$ and $n = ${root * root}$. What is the standard error of the sample mean?`,
      error,
      `$${num(sigma)} / \\sqrt{${root * root}} = ${num(sigma)} / ${root} = ${num(error)}$.`,
    );
  },
  // math-functions: Evaluate a function at an input
  'math-functions-kp1-q1': (r) => {
    const [a, b, c] = [
      r.pick([-3, -2, -1, 1, 2, 3]),
      r.int(-5, 5),
      r.int(-9, 9),
    ];
    const x = r.int(-4, 4);
    const value = a * x * x + b * x + c;
    return typeNumber(
      `$f(x) = ${poly([a, b, c])}$. What is $f(${x})$?`,
      value,
      `Substitute ${prose(x)} for $x$: $${Math.abs(a) === 1 ? coef(a) : `${a} \\times `}${paren(x)}^2${b ? ` ${b < 0 ? '-' : '+'} ${Math.abs(b) === 1 ? '' : `${Math.abs(b)} \\times `}${paren(x)}` : ''}${plus(c)} = ${value}$.`,
    );
  },
  // math-functions: Read the slope and intercept of a linear function
  'math-functions-kp3-q1': (r) => {
    const slope = r.pick([-4, -3, -2, -1, 1, 2, 3, 4, 5]);
    const [x1, run, y1] = [r.int(-3, 3), r.int(1, 5), r.int(-6, 9)];
    const [x2, y2] = [x1 + run, y1 + slope * run];
    return typeNumber(
      `A line passes through $(${x1}, ${y1})$ and $(${x2}, ${y2})$. What is its slope?`,
      slope,
      `$(${y2} - ${paren(y1)}) / (${x2} - ${paren(x1)}) = ${slope * run} / ${run} = ${slope}$.`,
    );
  },
  // math-exponentials: Multiply and divide powers of the same base
  'math-exponentials-kp1-q1': (r) => {
    const base = r.int(2, 5);
    let most = 1;
    while (base ** (most + 1) <= 1_000_000) most++;
    const total = r.int(4, Math.min(most, 12));
    const a = r.int(1, total - 1);
    const wrong = a * (total - a);
    return typeOutput(
      'What does this program print?',
      `print(${base} ** ${a} * ${base} ** ${total - a})`,
      String(base ** total),
      `The exponents add: $${base}^{${total}} = ${base ** total}$.${wrong === total ? '' : ` Multiplying them would give $${base}^{${wrong}}$.`}`,
    );
  },
  // math-exponentials: Use zero and negative exponents
  'math-exponentials-kp2-q3': (r) => {
    const [base, k] = r.pick([
      [2, 1],
      [2, 2],
      [2, 3],
      [2, 4],
      [2, 5],
      [2, 6],
      [4, 1],
      [4, 2],
      [4, 3],
      [5, 1],
      [5, 2],
      [5, 3],
      [8, 1],
      [8, 2],
      [10, 1],
      [10, 2],
      [10, 3],
      [20, 1],
      [25, 1],
      [25, 2],
    ]);
    return typeNumber(
      `What is $${base}^{-${k}}$?`,
      1 / base ** k,
      `$${base}^{-${k}} = 1 / ${base}^{${k}} = 1 / ${base ** k} = ${num(1 / base ** k)}$, a positive number.`,
    );
  },
  // math-exponentials: Recognize exponential growth and decay
  'math-exponentials-kp3-q1': (r) => {
    const years = r.int(2, 5);
    const [verb, factor] = r.pick([
      ['doubles', 2],
      ['triples', 3],
      ['halves', 0.5],
    ] as const);
    const start =
      factor === 0.5 ? 2 ** years * r.int(2, 30) : 10 * r.int(1, 30);
    const result = start * factor ** years;
    return typeNumber(
      `A population of ${start} ${verb} every year. What is it after ${years} years?`,
      result,
      `$${start} \\times ${num(factor)}^${years} = ${num(result)}$.`,
    );
  },
  // math-logarithms: Read a logarithm as an exponent
  'math-logarithms-kp1-q1': (r) => {
    const [base, most] = r.pick([
      [2, 10],
      [3, 6],
      [4, 5],
      [5, 4],
      [10, 5],
    ]);
    const k = r.int(-3, most);
    const argument = k >= 0 ? String(base ** k) : `\\frac{1}{${base ** -k}}`;
    return typeNumber(
      `What is $\\log_{${base}}(${argument})$?`,
      k,
      `$${base}^{${k}} = ${argument}$.`,
    );
  },
  // math-logarithms: Use the natural logarithm
  'math-logarithms-kp2-q1': (r) => {
    if (r.int(0, 1) === 0) {
      const k = r.pick([-9, -7, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6, 8]);
      return typeNumber(
        `What is $\\ln(e^{${k}})$?`,
        k,
        '$\\ln$ undoes the exponential, leaving the exponent.',
      );
    }
    const k = r.pick([2, 3, 4, 5, 6, 8, 9, 10, 11, 12, 13, 15, 20]);
    return typeNumber(
      `What is $e^{\\ln ${k}}$?`,
      k,
      'The exponential undoes $\\ln$.',
    );
  },
  // math-logarithms: Turn products into sums with log rules
  'math-logarithms-kp3-q3': (r) => {
    const base = r.pick([2, 10]);
    const a = r.int(1, 9) / 2;
    if (r.int(0, 1) === 0) {
      const p = r.int(2, 6);
      return typeNumber(
        `$\\log_{${base}}(x) = ${num(a)}$. What is $\\log_{${base}}(x^${p})$?`,
        p * a,
        `The power comes down as a factor: $${p} \\times ${num(a)} = ${num(p * a)}$.`,
      );
    }
    const b = r.int(1, 9) / 2;
    return typeNumber(
      `$\\log_{${base}}(x) = ${num(a)}$ and $\\log_{${base}}(y) = ${num(b)}$. What is $\\log_{${base}}(xy)$?`,
      a + b,
      `The log of a product is the sum of the logs: $${num(a)} + ${num(b)} = ${num(a + b)}$.`,
    );
  },
  // math-exp-log: Undo exponentials with math.log
  'math-exp-log-kp2-q2': (r) => {
    const a = r.int(1, 10);
    const b = r.int(1, 6);
    return typeOutput(
      'What does this program print?',
      `import math\nprint(math.log2(${2 ** a}), math.log10(${10 ** b}))`,
      `${a}.0 ${b}.0`,
      `$2^{${a}} = ${2 ** a}$ and $10^{${b}} = ${grouped(10 ** b).replace(/,/g, '{,}')}$, and the log functions return floats.`,
    );
  },
  // math-sigmoid: Use the sigmoid's range and symmetry
  'math-sigmoid-kp2-q3': (r) => {
    const p = r.int(1, 99);
    return typeNumber(
      `$\\sigma(a) = ${hundredths(p)}$. What is $\\sigma(-a)$?`,
      (100 - p) / 100,
      `$\\sigma(-a) = 1 - \\sigma(a) = ${hundredths(100 - p)}$.`,
    );
  },
  // math-softmax: Compute softmax probabilities
  'math-softmax-kp1-q3': (r) => {
    const count = r.int(3, 4);
    const known = r.ints(count - 1, 1, 6).map((x) => 5 * x);
    const missing = 100 - sum(known);
    return typeNumber(
      `Softmax gives ${count === 3 ? 'three' : 'four'} classes the probabilities ${series([...known.map(hundredths), '$p$'])}. What is $p$?`,
      missing / 100,
      `Softmax probabilities sum to 1: $1 - ${known.map(hundredths).join(' - ')} = ${hundredths(missing)}$.`,
    );
  },
  // math-softmax: Connect two-class softmax to the sigmoid
  'math-softmax-kp3-q2': (r) => {
    const d = r.pick([-4, -3, -2, -1, 1, 2, 3, 4]);
    const second = r.int(-3, 5);
    const first = second + d;
    return typeNumber(
      `$\\sigma(${d}) \\approx ${SIGMOID[d]}$. The scores are ${prose(first)} and ${prose(second)}. What is the first class’s softmax probability?`,
      SIGMOID[d],
      `The probability is $\\sigma(${first} - ${paren(second)}) = \\sigma(${d})$.`,
      { tolerance: 0.0005, unit: 'to 3 decimals' },
    );
  },
  // math-derivative-rate: Compute an average rate of change
  'math-derivative-rate-kp1-q1': (r) => {
    const [a, b, c] = [r.pick([-1, 1, 2, 3]), r.int(-4, 4), r.int(-5, 9)];
    const x1 = r.int(-3, 3);
    const x2 = x1 + r.int(1, 4);
    const f = (x: number) => a * x * x + b * x + c;
    const rate = (f(x2) - f(x1)) / (x2 - x1);
    return typeNumber(
      `$f(x) = ${poly([a, b, c])}$. What is its average rate of change from $x = ${x1}$ to $x = ${x2}$?`,
      rate,
      `$(f(${x2}) - f(${x1})) / (${x2} - ${paren(x1)}) = (${f(x2)} - ${paren(f(x1))}) / ${x2 - x1} = ${rate}$.`,
    );
  },
  // math-derivative-rate: Read the sign and size of a derivative
  'math-derivative-rate-kp3-q2': (r) => {
    const [x, value] = [r.int(-3, 6), r.int(-10, 20)];
    const slope = r.pick([-6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6, 7, 8]);
    const h = r.pick([-0.2, -0.1, 0.05, 0.1, 0.2, 0.5]);
    const change = round(slope * h);
    return typeNumber(
      `$f(${x}) = ${value}$ and $f'(${x}) = ${slope}$. About what is $f(${num(round(x + h))})$?`,
      round(value + change),
      `A step of ${prose(h)} changes $f$ by about $${slope} \\times ${paren(h)} = ${num(change)}$, giving ${prose(round(value + change))}.`,
    );
  },
  // math-power-rule: Differentiate powers of x
  'math-power-rule-kp1-q2': (r) => {
    const n = r.int(2, 5);
    const x = r.pick([-3, -2, 2, 3]);
    const value = n * x ** (n - 1);
    return typeNumber(
      `$f(x) = x^${n}$. What is $f'(${x})$?`,
      value,
      `$f'(x) = ${poly([n, ...Array(n - 1).fill(0)])}$, so $f'(${x}) = ${n} \\times ${paren(x)}${n > 2 ? `^${n - 1}` : ''} = ${value}$.`,
    );
  },
  // math-power-rule: Handle constants and constant multiples
  'math-power-rule-kp2-q3': (r) => {
    const c = r.pick([-2, -1, 0.5, 1.5, 2, 3, 4]);
    const n = r.int(2, 4);
    const x = r.pick([-3, -2, -1, 1, 2, 3, 4, 6]);
    const value = c * n * x ** (n - 1);
    return typeNumber(
      `$g(x) = ${poly([c, ...Array(n).fill(0)])}$. What is $g'(${x})$?`,
      value,
      `$g'(x) = ${poly([c * n, ...Array(n - 1).fill(0)])}$, so $g'(${x}) = ${num(value)}$.`,
    );
  },
  // math-power-rule: Evaluate a derivative to get a slope
  'math-power-rule-kp3-q2': (r) => {
    const a = r.pick([-3, -2, -1, 2, 3, 4, 5]);
    const n = r.int(2, 4);
    const x = r.int(-2, 3);
    const slope = a * n * x ** (n - 1);
    return typeNumber(
      `$f(x) = ${poly([a, ...Array(n).fill(0)])}$. What is the slope of its graph at $x = ${x}$?`,
      slope,
      `$f'(x) = ${poly([a * n, ...Array(n - 1).fill(0)])}$, so the slope at ${prose(x)} is ${prose(slope)}.`,
    );
  },
  // math-sum-product-rules: Differentiate a polynomial term by term
  'math-sum-product-rules-kp1-q2': (r) => {
    const coefficients = [
      r.int(-2, 2),
      r.int(-3, 3),
      r.int(-6, 6),
      r.int(-9, 9),
    ];
    if (!coefficients[0] && !coefficients[1]) coefficients[1] = 1;
    const [a, b, c] = coefficients;
    const x = r.int(-3, 3);
    const value = 3 * a * x * x + 2 * b * x + c;
    return typeNumber(
      `$f(x) = ${poly(coefficients)}$. What is $f'(${x})$?`,
      value,
      `$f'(x) = ${poly([3 * a, 2 * b, c])}$, which is ${prose(value)} at $x = ${x}$.`,
    );
  },
  // math-sum-product-rules: Apply the product rule
  'math-sum-product-rules-kp2-q2': (r) => {
    const x = r.int(-2, 5);
    const [f, df, g, dg] = [
      r.int(-5, 9),
      r.int(-4, 6),
      r.int(-5, 9),
      r.int(-4, 6),
    ];
    const value = df * g + f * dg;
    return typeNumber(
      `$f(${x}) = ${f}$, $f'(${x}) = ${df}$, $g(${x}) = ${g}$, and $g'(${x}) = ${dg}$. What is $(fg)'$ at $x = ${x}$?`,
      value,
      `$f'g + fg' = ${df} \\times ${paren(g)} + ${paren(f)} \\times ${paren(dg)} = ${value}$.`,
    );
  },
  // math-sum-product-rules: Check a derivative by expanding
  'math-sum-product-rules-kp3-q4': (r) => {
    const [a, b, x] = [r.int(2, 5), r.int(1, 9), r.int(1, 6)];
    const value = a * (x + b) + a * x;
    return typeOutput(
      `$h(x) = ${a}x(x + ${b})$. This program applies the product rule at $x = ${x}$. What does it print?`,
      `x = ${x}\nprint(${a} * (x + ${b}) + ${a} * x * 1)`,
      String(value),
      `$f'g + fg' = ${a} \\times ${x + b} + ${a * x} \\times 1 = ${value}$, matching the expanded derivative $${2 * a}x + ${a * b}$.`,
    );
  },
  // math-chain-rule: Multiply the outer and inner derivatives
  'math-chain-rule-kp2-q4': (r) => {
    const [a, b, n, x] = [
      r.pick([-2, -1, 2, 3]),
      r.int(-3, 3),
      r.int(2, 4),
      r.int(-2, 2),
    ];
    const inner = a * x + b;
    const value = n * inner ** (n - 1) * a;
    return typeNumber(
      `What is the derivative of $(${poly([a, b])})^${n}$ at $x = ${x}$?`,
      value,
      `The derivative is $${n}(${poly([a, b])})^{${n - 1}} \\times ${paren(a)}$. At $x = ${x}$ the inner value is ${prose(inner)}, giving $${n} \\times ${paren(inner)}^{${n - 1}} \\times ${paren(a)} = ${num(value)}$.`,
    );
  },
  // math-chain-rule: Chain several local rates
  'math-chain-rule-kp3-q1': (r) => {
    const rates = [
      r.pick([-3, -2, -1, 2, 3, 4]),
      r.pick([-3, -2, -0.5, 0.5, 2, 3]),
      r.pick([-2, 0.5, 1.5, 2, 4]),
    ];
    const value = rates[0] * rates[1] * rates[2];
    return typeNumber(
      `$\\frac{dL}{dp} = ${num(rates[0])}$, $\\frac{dp}{dz} = ${num(rates[1])}$, and $\\frac{dz}{dw} = ${num(rates[2])}$. What is $\\frac{dL}{dw}$?`,
      value,
      `$${num(rates[0])} \\times ${paren(rates[1])} \\times ${paren(rates[2])} = ${num(value)}$; the local rates multiply rather than add.`,
    );
  },
  // math-partial-derivatives: Evaluate partial derivatives at a point
  'math-partial-derivatives-kp2-q1': (r) => {
    const [a, b, c] = [r.int(-3, 3), r.pick([-2, -1, 1, 2, 3]), r.int(-3, 3)];
    const [x, y] = [r.int(-3, 3), r.int(-3, 3)];
    const byX = r.int(0, 1) === 1;
    const value = byX ? 2 * a * x + b * y : b * x + 2 * c * y;
    const variable = byX ? 'x' : 'y';
    return typeNumber(
      `$f(x, y) = ${terms([
        [a, 'x^2'],
        [b, 'xy'],
        [c, 'y^2'],
      ])}$. What is $\\frac{\\partial f}{\\partial ${variable}}$ at $(${x}, ${y})$?`,
      value,
      `$\\frac{\\partial f}{\\partial ${variable}} = ${
        byX
          ? terms([
              [2 * a, 'x'],
              [b, 'y'],
            ])
          : terms([
              [b, 'x'],
              [2 * c, 'y'],
            ])
      }$, which is ${prose(value)} at $(${x}, ${y})$.`,
    );
  },
  // math-partial-derivatives: Take partial derivatives of a squared-error loss
  'math-partial-derivatives-kp3-q3': (r) => {
    const x = r.pick([-3, -2, 2, 3, 4, 5, 6]);
    const residual = r.pick([-2, -1.5, -1, -0.5, 0.5, 1, 1.5, 2, 3]);
    if (r.int(0, 2) === 0)
      return typeNumber(
        `For $x = ${x}$, the residual $wx + b - y$ is ${prose(residual)}. What is $\\frac{\\partial L}{\\partial b}$?`,
        2 * residual,
        `$2 \\times ${paren(residual)} = ${num(2 * residual)}$; the bias gradient does not involve $x$.`,
      );
    return typeNumber(
      `For $x = ${x}$, the residual $wx + b - y$ is ${prose(residual)}. What is $\\frac{\\partial L}{\\partial w}$?`,
      2 * residual * x,
      `$2 \\times ${paren(residual)} \\times ${paren(x)} = ${num(2 * residual * x)}$.`,
    );
  },
  // math-gradient-vector: Collect partial derivatives into a gradient
  'math-gradient-vector-kp1-q2': (r) => {
    const x = r.pick([-5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6]);
    const y = r.int(-5, 6);
    return typeOutput(
      `For $f(x, y) = x^2y$, this program builds $\\nabla f$ at $(${x}, ${y})$. What does it print?`,
      `x = ${x}\ny = ${y}\nprint([2 * x * y, x ** 2])`,
      py([2 * x * y, x * x]),
      `$\\frac{\\partial f}{\\partial x} = 2xy = ${2 * x * y}$ and $\\frac{\\partial f}{\\partial y} = x^2 = ${x * x}$.`,
    );
  },
  // math-gradients: Take one gradient descent step
  'math-gradients-kp1-q1': (r) => {
    const target = r.int(1, 6);
    const w = target + r.pick([-4, -3, -2, -1, 1, 2, 3, 4]);
    const rate = r.pick([0.125, 0.25, 0.5]);
    const gradient = 2 * (w - target);
    const next = w - rate * gradient;
    return typeOutput(
      `This program takes one step on $f(w) = (w - ${target})^2$. What does it print?`,
      `w = ${pyFloat(w)}\nlearning_rate = ${rate}\ngradient = 2 * (w - ${target})\nw = w - learning_rate * gradient\nprint(w)`,
      pyFloat(next),
      `The derivative is $${pyFloat(gradient)}$, so $w$ moves from ${pyFloat(w)} to $${pyFloat(w)} - ${rate * gradient < 0 ? `(${pyFloat(rate * gradient)})` : pyFloat(rate * gradient)} = ${pyFloat(next)}$.`,
    );
  },
  // math-gradients: Update every parameter with the gradient vector
  'math-gradients-kp2-q1': (r) => {
    const w = [r.int(-3, 4), r.int(-3, 4)];
    const gradient = [r.int(-4, 4), r.int(-4, 4)];
    const rate = r.pick([0.25, 0.5]);
    const next = w.map((x, i) => x - rate * gradient[i]);
    const floats = (values: number[]) => `[${values.map(pyFloat).join(', ')}]`;
    return typeOutput(
      'What does this program print?',
      `w = ${floats(w)}\ngradient = ${floats(gradient)}\nlearning_rate = ${rate}\nw = [w[i] - learning_rate * gradient[i] for i in range(len(w))]\nprint(w)`,
      floats(next),
      `$${num(w[0])} - ${rate} \\times ${paren(gradient[0])} = ${num(next[0])}$ and $${num(w[1])} - ${rate} \\times ${paren(gradient[1])} = ${num(next[1])}$.`,
    );
  },
  // math-gradients: Choose a learning rate
  'math-gradients-kp3-q1': (r) => {
    const rate = r.pick([0.125, 0.25, 0.375, 0.75]);
    const w = r.pick([-8, -6, -4, -2, 2, 4, 6, 8, 10, 12]);
    const next = w - rate * 2 * w;
    return typeOutput(
      `This program takes one step on $f(w) = w^2$ with learning rate ${rate}. What does it print?`,
      `w = ${pyFloat(w)}\nw = w - ${rate} * 2 * w\nprint(w)`,
      pyFloat(next),
      `The derivative is $${pyFloat(2 * w)}$, and $${pyFloat(w)} - ${rate} \\times ${paren(2 * w)} = ${pyFloat(next)}$.`,
    );
  },
  // math-critical-points: Find critical points
  'math-critical-points-kp1-q4': (r) => {
    const [a, h, c] = [
      r.pick([-3, -2, -1, 1, 2, 3]),
      r.int(-4, 4),
      r.int(-9, 9),
    ];
    const b = -2 * a * h;
    const value = a * h * h + b * h + c;
    return typeNumber(
      `$f(x) = ${poly([a, b, c])}$. What is the value of $f$ at its critical point?`,
      value,
      `$f'(x) = ${poly([2 * a, b])} = 0$ at $x = ${h}$, and $f(${h}) = ${value}$.`,
    );
  },
  // math-critical-points: Distinguish local from global minima
  'math-critical-points-kp3-q4': (r) => {
    const [a, h, k] = [r.pick([1, 2, 3, 0.5]), r.int(-5, 5), r.int(-9, 12)];
    const square = h ? `(${poly([1, -h])})^2` : 'x^2';
    return typeNumber(
      `$f(x) = ${coef(a)}${square}${plus(k)}$. What is its global minimum value?`,
      k,
      `The square is at least 0 and equals 0 at $x = ${h}$, leaving ${prose(k)}.`,
    );
  },
  // math-convexity: Test convexity with the second derivative
  'math-convexity-kp2-q4': (r) => {
    const [a, b, c] = [r.pick([-1, 1, 2]), r.int(-2, 2), r.int(-3, 3)];
    const x = r.int(-2, 2);
    const value = 12 * a * x * x + 6 * b * x + 2 * c;
    return typeNumber(
      `$f(x) = ${poly([a, b, c, 0, 0])}$. What is $f''(${x})$?`,
      value,
      `$f'(x) = ${poly([4 * a, 3 * b, 2 * c, 0])}$ and $f''(x) = ${poly([12 * a, 6 * b, 2 * c])}$, which is ${prose(value)} at $x = ${x}$.`,
    );
  },
  // math-vector-norm: Compute the Euclidean norm
  'math-vector-norm-kp1-q2': (r) => {
    const [base, length] = r.pick([
      [[3, 4], 5],
      [[5, 12], 13],
      [[8, 15], 17],
      [[1, 2, 2], 3],
      [[2, 3, 6], 7],
      [[1, 4, 8], 9],
      [[4, 4, 7], 9],
      [[2, 6, 9], 11],
    ] as [number[], number][]);
    const scale = r.int(1, 3);
    const v = r.shuffle(base).map((x) => x * scale * r.pick([-1, 1]));
    const squares = v.map((x) => x * x);
    return typeNumber(
      `What is $\\lVert ${py(v)} \\rVert$?`,
      length * scale,
      `$\\sqrt{${squares.join(' + ')}} = \\sqrt{${sum(squares)}} = ${length * scale}$.`,
    );
  },
  // math-vector-norm: Scale vectors and make unit vectors
  'math-vector-norm-kp2-q4': (r) => {
    const n = r.int(2, 9);
    const c = r.pick([-4, -3, -2, -1.5, -0.5, 0.5, 1.5]);
    return typeNumber(
      `$\\lVert v \\rVert = ${n}$. What is $\\lVert ${num(c)}v \\rVert$?`,
      Math.abs(c) * n,
      `The length is multiplied by $|${num(c)}| = ${num(Math.abs(c))}$; it cannot be negative.`,
    );
  },
  // math-vector-norm: Compare L1 and L2 norms
  'math-vector-norm-kp3-q1': (r) => {
    const v = r.ints(r.int(3, 4), -6, 6);
    const l1 = sum(v.map(Math.abs));
    return typeNumber(
      `What is the L1 norm of $${py(v)}$?`,
      l1,
      `$${v.map(Math.abs).join(' + ')} = ${l1}$.`,
    );
  },
  // math-distance: Compute a Euclidean distance
  'math-distance-kp1-q2': (r) => {
    const [[dx, dy], d] = r.pick([
      [[3, 4], 5],
      [[4, 3], 5],
      [[6, 8], 10],
      [[8, 6], 10],
      [[5, 12], 13],
      [[12, 5], 13],
      [[9, 12], 15],
    ] as [number[], number][]);
    const a = [r.int(-5, 5), r.int(-5, 5)];
    const b = [a[0] + dx * r.pick([-1, 1]), a[1] + dy * r.pick([-1, 1])];
    return typeNumber(
      `What is the distance between $${py(a)}$ and $${py(b)}$?`,
      d,
      `$\\sqrt{${dx * dx} + ${dy * dy}} = \\sqrt{${d * d}} = ${d}$.`,
    );
  },
  // math-distance: Find the nearest point with squared distances
  'math-distance-kp2-q1': (r) => {
    const point = [r.int(-2, 4), r.int(-2, 4)];
    const centers = Array.from({ length: 3 }, () => [
      r.int(-2, 5),
      r.int(-2, 5),
    ]);
    const parts = centers.map((c) => [
      (point[0] - c[0]) ** 2,
      (point[1] - c[1]) ** 2,
    ]);
    return typeOutput(
      'What does this program print?',
      `point = ${py(point)}\ncenters = ${py(centers)}\nprint([(point[0] - c[0]) ** 2 + (point[1] - c[1]) ** 2 for c in centers])`,
      py(parts.map(([a, b]) => a + b)),
      `The squared distances are ${series(parts.map(([a, b]) => `$${a} + ${b}$`))}.`,
    );
  },
  // math-cosine-similarity: Compute cosine similarity
  'math-cosine-similarity-kp1-q1': (r) => {
    const na = r.pick([1, 2, 4, 5]);
    const nb = r.pick([2, 4, 5, 10]);
    const limit = na * nb;
    const dot = r.pick([-1, 1]) * r.int(1, limit);
    return typeNumber(
      `$a \\cdot b = ${dot}$, $\\lVert a \\rVert = ${na}$, and $\\lVert b \\rVert = ${nb}$. What is the cosine similarity?`,
      dot / limit,
      `$${dot} / (${na} \\times ${nb}) = ${num(dot / limit)}$.`,
    );
  },
  // math-cosine-similarity: Interpret aligned, orthogonal, and opposite vectors
  'math-cosine-similarity-kp2-q3': (r) => {
    const b = r.pick([1, 2, 3, 4]);
    const s = r.pick([-2, -1, 1, 2, 3]);
    const c = r.pick([-6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6]);
    const a = b * s;
    const k = -s * c;
    return typeNumber(
      `For which $k$ is $[k, ${a}]$ orthogonal to $[${b}, ${c}]$?`,
      k,
      `The dot product $${coef(b)}k${plus(a * c)}$ must be 0, which gives $k = ${k}$.`,
    );
  },
  // math-cosine-similarity: Compare direction rather than size
  'math-cosine-similarity-kp3-q4': (r) => {
    const tenths = r.pick([-9, -8, -7, -6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5]);
    const s = r.pick([-3, -2, -1, 2, 3, 0.5]);
    const t = r.pick([-2, -1, 1, 2]);
    const sign = Math.sign(s * t);
    return typeNumber(
      `$\\cos(a, b) = ${num(tenths / 10)}$. What is $\\cos(${coef(s)}a, ${coef(t)}b)$?`,
      (sign * tenths) / 10,
      sign < 0
        ? `One negative factor flips the sign of the dot product but not the norms: ${prose((sign * tenths) / 10)}.`
        : `Positive factors, or two negative ones, cancel between the dot product and the norms: ${prose(tenths / 10)}.`,
    );
  },
  // math-matrices: Index a matrix stored as lists of rows
  'math-matrices-kp2-q1': (r) => {
    const [rows, cols] = [r.int(2, 4), r.int(2, 3)];
    const A = Array.from({ length: rows }, () => r.ints(cols, 0, 20));
    const [i, j] = [r.int(0, rows - 1), r.int(0, cols - 1)];
    return typeOutput(
      'What does this program print?',
      `A = ${py(A)}\nprint(A[${i}][${j}])`,
      String(A[i][j]),
      `A[${i}] is row ${i + 1}, ${py(A[i])}, and position ${j} holds ${A[i][j]}.`,
    );
  },
  // math-matrices: Transpose a matrix
  'math-matrices-kp3-q3': (r) => {
    const [rows, cols] = r.pick([
      [2, 3],
      [3, 2],
      [2, 2],
    ]);
    const A = Array.from({ length: rows }, () => r.ints(cols, 0, 9));
    const T = Array.from({ length: cols }, (_, j) => A.map((row) => row[j]));
    return typeOutput(
      'What does this program print?',
      `A = ${py(A)}\nprint([[A[i][j] for i in range(len(A))] for j in range(len(A[0]))])`,
      py(T),
      `The $${rows} \\times ${cols}$ matrix becomes $${cols} \\times ${rows}$; each new row is an old column.`,
    );
  },
  // math-matrix-vector: Multiply a matrix by a vector row by row
  'math-matrix-vector-kp1-q2': (r) => {
    const A = [r.ints(2, -3, 5), r.ints(2, -3, 5)];
    const x = r.ints(2, -4, 5);
    const y = A.map((row) => row[0] * x[0] + row[1] * x[1]);
    const line = (row: number[], value: number) =>
      `$${row[0]} \\times ${paren(x[0])} + ${paren(row[1])} \\times ${paren(x[1])} = ${value}$`;
    return typeOutput(
      'What does this program print?',
      `A = ${py(A)}\nx = ${py(x)}\nprint([row[0] * x[0] + row[1] * x[1] for row in A])`,
      py(y),
      `${line(A[0], y[0])} and ${line(A[1], y[1])}.`,
    );
  },
  // math-matrix-vector: Predict for many observations at once
  'math-matrix-vector-kp3-q2': (r) => {
    const rows = r.int(2, 3);
    const X = Array.from({ length: rows }, () => r.ints(2, 0, 6));
    const w = r.ints(2, -3, 4);
    const b = r.int(-5, 10);
    const k = r.int(0, rows - 1);
    const value = X[k][0] * w[0] + X[k][1] * w[1] + b;
    return typeNumber(
      `$X = ${py(X)}$, $w = ${py(w)}$, and $b = ${b}$. What is the ${['first', 'second', 'third'][k]} prediction?`,
      value,
      `Row ${k + 1} dotted with $w$, plus $b$: $${X[k][0]} \\times ${paren(w[0])} + ${X[k][1]} \\times ${paren(w[1])}${plus(b)} = ${value}$.`,
    );
  },
  // math-matrix-multiplication: Compute an entry of a matrix product
  'math-matrix-multiplication-kp2-q1': (r) => {
    const A = [r.ints(2, -2, 6), r.ints(2, -2, 6)];
    const B = [r.ints(2, -2, 6), r.ints(2, -2, 6)];
    const [i, j] = [r.int(0, 1), r.int(0, 1)];
    const products = [A[i][0] * B[0][j], A[i][1] * B[1][j]];
    return typeNumber(
      `$A = ${py(A)}$ and $B = ${py(B)}$. What is the entry of $AB$ in row ${i + 1}, column ${j + 1}?`,
      sum(products),
      `Row $${py(A[i])}$ dotted with column $${py([B[0][j], B[1][j]])}$: $${products[0]}${plus(products[1])} = ${sum(products)}$.`,
    );
  },
  // math-identity-inverse: Compute a 2 × 2 determinant and inverse
  'math-identity-inverse-kp2-q1': (r) => {
    const [[a, b], [c, d]] = [r.ints(2, -4, 6), r.ints(2, -4, 6)];
    const det = a * d - b * c;
    return typeNumber(
      `What is the determinant of $${py([
        [a, b],
        [c, d],
      ])}$?`,
      det,
      `$${a} \\times ${paren(d)} - ${paren(b)} \\times ${paren(c)} = ${det}$.`,
    );
  },
  // math-identity-inverse: Recognize when no inverse exists
  'math-identity-inverse-kp3-q2': (r) => {
    const [t, c, d] = [
      r.pick([-3, -2, -1, 1, 2, 3]),
      r.pick([1, 2, 3, -1, -2]),
      r.pick([1, 2, 3, 4, -1, -2]),
    ];
    const [k, b] = [c * t, t * d];
    return typeNumber(
      `For which $k$ does $[[k, ${b}], [${c}, ${d}]]$ have no inverse?`,
      k,
      `The determinant $${coef(d)}k - ${paren(b)} \\times ${paren(c)}$ is 0 when $k = ${k}$.`,
    );
  },
  // math-eigenvectors: Check whether a vector is an eigenvector
  'math-eigenvectors-kp1-q3': (r) => {
    const v = [r.pick([-3, -2, -1, 1, 2, 3, 4]), r.int(-4, 4)];
    const lambda = r.pick([-3, -2, -1, 2, 3, 4, 5]);
    const image = v.map((x) => lambda * x);
    return typeNumber(
      `$Av = ${py(image)}$ for $v = ${py(v)}$. What is the eigenvalue?`,
      lambda,
      `$${py(image)} = ${lambda} \\times ${py(v)}$.`,
    );
  },
  // math-eigenvectors: Read a covariance matrix
  'math-eigenvectors-kp3-q2': (r) => {
    const [v1, v2, c] = [r.int(3, 16), r.int(3, 16), r.int(-3, 3)];
    const ask = r.int(0, 2);
    const [question, value, why]: [string, number, string] =
      ask === 0
        ? [
            'the covariance of the two features',
            c,
            'Off-diagonal entries are covariances.',
          ]
        : ask === 1
          ? [
              'the variance of the first feature',
              v1,
              'The first diagonal entry is $\\operatorname{Var}(x_1)$.',
            ]
          : [
              'the variance of the second feature',
              v2,
              'The second diagonal entry is $\\operatorname{Var}(x_2)$.',
            ];
    return typeNumber(
      `$\\Sigma = ${py([
        [v1, c],
        [c, v2],
      ])}$. What is ${question}?`,
      value,
      why,
    );
  },
  // math-eigenvectors: Read principal components from eigenvalues
  'math-eigenvectors-kp4-q3': (r) => {
    const variances = r.ints(r.int(2, 4), 1, 20);
    return typeNumber(
      `The feature variances are ${series(variances)}. What is the sum of the covariance matrix’s eigenvalues?`,
      sum(variances),
      `The eigenvalues add up to the sum of the diagonal variances: $${variances.join(' + ')} = ${sum(variances)}$.`,
    );
  },
  // math-likelihood: Compute the likelihood of a parameter value
  'math-likelihood-kp1-q1': (r) => {
    const data = r.ints(r.int(2, 4), 0, 1);
    const p = r.int(1, 9);
    const ones = data.filter(Boolean).length;
    const value =
      (p ** ones * (10 - p) ** (data.length - ones)) / 10 ** data.length;
    return typeNumber(
      `The data are ${series(data)} from a $\\text{Bernoulli}(p)$ model. What is $L(${num(p / 10)})$?`,
      value,
      `$${data.map((x) => num((x ? p : 10 - p) / 10)).join(' \\times ')} = ${num(value)}$.`,
    );
  },
  // math-likelihood: Choose the maximum likelihood estimate
  'math-likelihood-kp2-q1': (r) => {
    const n = r.pick([4, 5, 8, 10, 16, 20, 25, 40, 50]);
    const k = r.int(0, n);
    const [subject, unit, rate] = r.pick([
      ['A drug works for', 'independent patients', 'its success rate'],
      ['A filter flags', 'independent messages', 'the flag rate'],
      ['An ad is clicked by', 'independent visitors', 'its click rate'],
    ]);
    return typeNumber(
      `${subject} ${k} of ${n} ${unit}. What is the maximum likelihood estimate of ${rate}?`,
      k / n,
      `$k / n = ${k} / ${n} = ${num(k / n)}$.`,
    );
  },
};
