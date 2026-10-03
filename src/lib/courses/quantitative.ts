import type {
  ChoiceQuestion,
  CurriculumCatalog,
  LessonExample,
  Skill,
  Unit,
} from '../curriculum';
import { withTeachingOrder } from './teaching-order';

const courseId = 'quantitative-foundations';
const q = (
  prompt: string,
  choices: string[],
  answer: number,
  explanation: string,
): Omit<ChoiceQuestion, 'id'> => ({
  type: 'choice',
  prompt,
  choices,
  answer,
  explanation,
  hint: explanation,
});
/** A worked calculation shown without running code. */
const worked = (
  code: string,
  output: string,
  explanation: string,
): LessonExample => ({
  kind: 'text',
  label: 'WORKED CALCULATION',
  code,
  output,
  explanation,
});

interface Definition {
  id: string;
  unitId: string;
  title: string;
  prerequisites: string[];
  summary: string;
  paragraphs: string[];
  example: LessonExample;
  questions: Omit<ChoiceQuestion, 'id'>[];
  /** A Python exercise; skills without one are assessed with choices only. */
  exercise?: {
    prompt: string;
    starter: string;
    solution: string;
    tests: string;
  };
  cards: [string, string][];
}

const units: Unit[] = [
  {
    id: 'math-data-foundations',
    courseId,
    title: 'Describe data',
    description: 'Summarize location, spread, and association.',
  },
  {
    id: 'math-probability-models',
    courseId,
    title: 'Model uncertainty',
    description:
      'Describe random quantities, common distributions, samples, and likelihood.',
  },
  {
    id: 'math-functions-growth',
    courseId,
    title: 'Functions and growth',
    description:
      'Read functions, exponentials, logarithms, the sigmoid, and softmax.',
  },
  {
    id: 'math-calculus',
    courseId,
    title: 'Derivatives and optimization',
    description: 'Measure change and follow gradients toward a minimum.',
  },
  {
    id: 'math-linear-algebra',
    courseId,
    title: 'Vectors and matrices',
    description: 'Measure, compare, and transform feature vectors.',
  },
];

const definitions: Definition[] = [
  {
    id: 'math-mean',
    unitId: 'math-data-foundations',
    title: 'Means and weighted averages',
    prerequisites: ['accumulators', 'number-builtins'],
    summary:
      'Summarize a collection while keeping track of what each observation contributes.',
    paragraphs: [
      'The arithmetic mean is the sum of observations divided by their count. It is sensitive to unusually large or small values, so a mean alone cannot describe a distribution.',
      'A weighted mean divides the sum of $\\text{value} \\times \\text{weight}$ by the sum of weights. Counts can be weights when combining group averages; averaging the group averages without counts can give the wrong result.',
    ],
    example: {
      code: 'values = [2, 4, 9]\nprint(sum(values) / len(values))',
      output: '5.0',
      explanation:
        'Summarize a collection while keeping track of what each observation contributes.',
    },
    questions: [
      q(
        'What is the mean of 2, 4, and 9?',
        ['5', '4', '15', '3'],
        0,
        'The sum is 15 and the count is 3, giving 5.',
      ),
      q(
        'A group of 10 scores averages 4; a group of 30 averages 8. What is the combined mean?',
        ['6', '7', '12', '8'],
        1,
        '(10 × 4 + 30 × 8) / 40 = 7.',
      ),
      q(
        'Which change raises the mean most?',
        [
          'Adding a value equal to the mean',
          'Reordering observations',
          'Adding a very large observation',
          'Duplicating every observation',
        ],
        2,
        'A large observation adds more to the sum than a typical observation.',
      ),
    ],
    exercise: {
      prompt: 'Set mean_value to the arithmetic mean of values = [3, 5, 10].',
      starter: 'values = [3, 5, 10]\nmean_value = 0',
      solution: 'values = [3, 5, 10]\nmean_value = sum(values) / len(values)',
      tests: 'assert abs(mean_value - 6.0) < 1e-9',
    },
    cards: [
      [
        'How is a weighted mean calculated?',
        'sum(value × weight) / sum(weights).',
      ],
      [
        'Why can averaging group means be wrong?',
        'Different group sizes contribute different numbers of observations; weight each mean by its count.',
      ],
    ],
  },
  {
    id: 'math-variance',
    unitId: 'math-data-foundations',
    title: 'Variance and standard deviation',
    prerequisites: ['math-mean', 'generator-expressions'],
    summary: 'Measure spread with squared distances from the mean.',
    paragraphs: [
      'Population variance averages the squared distance of each observation from the population mean. Squaring prevents positive and negative deviations from cancelling.',
      'Standard deviation is the square root of variance, returning the measurement to the original units. Sample variance divides by $n - 1$ when estimating a population variance from a sample; state which convention you use.',
    ],
    example: {
      code: 'values = [1, 3, 5]\nmean = sum(values) / len(values)\nvariance = sum((x - mean) ** 2 for x in values) / len(values)\nprint(round(variance, 2))',
      output: '2.67',
      explanation: 'Measure spread with squared distances from the mean.',
    },
    questions: [
      q(
        'Why square deviations when measuring spread?',
        [
          'To preserve their signs',
          'To prevent cancellation',
          'To sort the values',
          'To remove the mean',
        ],
        1,
        'Squaring makes each deviation nonnegative.',
      ),
      q(
        'Population variance of [2, 2, 2] is:',
        ['2', '6', '1', '0'],
        3,
        'Every observation equals the mean, so every squared deviation is zero.',
      ),
      q(
        'Which quantity has the same units as the original observations?',
        ['Variance', 'Squared mean', 'Standard deviation', 'Sample count'],
        2,
        'Taking the square root converts squared units back to the original units.',
      ),
    ],
    exercise: {
      prompt:
        'Calculate population_variance for values = [2, 4, 6], dividing by the number of observations.',
      starter: 'values = [2, 4, 6]\npopulation_variance = 0',
      solution:
        'values = [2, 4, 6]\nmean = sum(values) / len(values)\npopulation_variance = sum((x - mean) ** 2 for x in values) / len(values)',
      tests: 'assert abs(population_variance - 8 / 3) < 1e-9',
    },
    cards: [
      [
        'What is population variance?',
        'The average squared deviation from the population mean.',
      ],
      [
        'How does sample variance differ?',
        'The usual unbiased estimator divides the sum of squared deviations by n − 1 instead of n.',
      ],
    ],
  },
  {
    id: 'math-median',
    unitId: 'math-data-foundations',
    title: 'Medians and robust centers',
    prerequisites: ['math-mean'],
    summary:
      'Find the middle value and see why it resists extreme observations.',
    paragraphs: [
      'The median is the middle of the sorted values. With an odd count it is the single middle value: [7, 1, 4] sorts to [1, 4, 7], so the median is 4. With an even count it is the mean of the two middle values: [2, 9, 3, 6] sorts to [2, 3, 6, 9], so the median is $(3 + 6) / 2 = 4.5$.',
      'The median depends only on order, so it barely moves when an extreme value grows. Changing [2, 3, 4] to [2, 3, 400] leaves the median at 3 while the mean jumps from 3 to 135. When the mean and median differ a lot, the data are skewed or contain extreme observations worth inspecting.',
    ],
    example: worked(
      'incomes (thousands): 30, 35, 40, 45, 600\nsorted middle value: 40\nmean: (30 + 35 + 40 + 45 + 600) / 5',
      'median 40, mean 150',
      'Sorting puts 40 in the middle. The single value 600 adds so much to the sum that the mean exceeds four of the five incomes.',
    ),
    questions: [
      q(
        'What is the median of [6, 1, 9, 2]?',
        ['4', '4.5', '5', '6'],
        0,
        'Sorted, the values are 1, 2, 6, 9; the two middle values average to 4.',
      ),
      q(
        'The largest value in a dataset is multiplied by 10. Which summary typically changes less?',
        ['The mean', 'The median', 'The sum', 'Both change equally'],
        1,
        'Only the order matters for the median, and the largest value stays largest.',
      ),
      q(
        'What is the median of [5, 5, 9, 1, 20]?',
        ['9', '8', '5', '20'],
        2,
        'Sorted, the values are 1, 5, 5, 9, 20, and the middle one is 5.',
      ),
      q(
        "A dataset's mean is far above its median. What does that suggest?",
        [
          'The median was computed incorrectly',
          'The values were not sorted',
          'Every value equals the mean',
          'Some large values pull the mean up',
        ],
        3,
        'Large values raise the sum, and therefore the mean, without moving the middle value much.',
      ),
    ],
    cards: [
      [
        'How do you find the median of an even number of values?',
        'Sort them and average the two middle values.',
      ],
      [
        'Why is the median robust to extreme values?',
        'It depends only on the order of the values, not on how far the extremes lie.',
      ],
    ],
  },
  {
    id: 'math-percentiles',
    unitId: 'math-data-foundations',
    title: 'Percentiles and quartiles',
    prerequisites: ['math-median'],
    summary:
      'Locate values by the share of data at or below them and summarize spread with quartiles.',
    paragraphs: [
      'The $p$-th percentile is a value with about $p\\%$ of the data at or below it. The median is the 50th percentile; the first quartile $Q_1$ is the 25th percentile and the third quartile $Q_3$ is the 75th. A common rule, the default in NumPy and pandas, sorts the $n$ values, computes the position $(p / 100) \\times (n - 1)$ counting from 0, and interpolates between neighbors when that position is not a whole number.',
      'The interquartile range $\\text{IQR} = Q_3 - Q_1$ spans the middle half of the data and, like the median, ignores extreme values. A common outlier screen flags values below $Q_1 - 1.5 \\times \\text{IQR}$ or above $Q_3 + 1.5 \\times \\text{IQR}$. The five-number summary (minimum, $Q_1$, median, $Q_3$, maximum) describes location and spread without assuming a distribution shape.',
    ],
    example: worked(
      'sorted: 2, 4, 6, 8, 10, 12, 14, 16, 18 (n = 9)\nQ1 position 0.25 × 8 = 2\nmedian position 0.5 × 8 = 4\nQ3 position 0.75 × 8 = 6',
      'Q1 = 6, median = 10, Q3 = 14, IQR = 8',
      'All three positions are whole numbers, so each quartile is the value stored at that position, counting from 0.',
    ),
    questions: [
      q(
        'A score is at the 90th percentile. What does that mean?',
        [
          'About 90% of scores are at or below it',
          'It is 90% of the highest score',
          'It is worth 90 points',
          'Exactly 90 scores are below it',
        ],
        0,
        'A percentile describes the share of data at or below a value, not the value itself.',
      ),
      q(
        'Q1 = 20 and Q3 = 50. What is the interquartile range?',
        ['70', '35', '30', '15'],
        2,
        'IQR = Q3 − Q1 = 50 − 20 = 30.',
      ),
      q(
        'With Q1 = 20 and Q3 = 50, which value does the 1.5 × IQR rule flag?',
        ['90', '-20', '60', '100'],
        3,
        'The fences are 20 − 45 = −25 and 50 + 45 = 95, so only 100 lies outside.',
      ),
      q(
        'Sorted values are 1, 3, 5, 7, 9. Using position (p / 100) × (n − 1), what is the 25th percentile?',
        ['2', '3', '1.25', '5'],
        1,
        'The position is 0.25 × 4 = 1, and the value at position 1 is 3.',
      ),
    ],
    cards: [
      [
        'What is the interquartile range?',
        'Q3 − Q1: the spread of the middle half of the data.',
      ],
      [
        'Which values does the 1.5 × IQR rule flag?',
        'Values below Q1 − 1.5 × IQR or above Q3 + 1.5 × IQR.',
      ],
    ],
  },
  {
    id: 'math-covariance',
    unitId: 'math-data-foundations',
    title: 'Covariance',
    prerequisites: ['math-variance', 'math-vectors'],
    summary: 'Measure whether two variables move together around their means.',
    paragraphs: [
      'Population covariance averages the products of paired deviations: $\\operatorname{cov}(x, y)$ is the mean of $(x_i - \\bar{x})(y_i - \\bar{y})$. When large $x$ values tend to pair with large $y$ values, most products are positive and the covariance is positive; when large $x$ pairs with small $y$, it is negative; with no linear tendency it is near 0. It equals the dot product of the two centered vectors divided by $n$.',
      '$\\operatorname{cov}(x, x)$ is the variance of $x$. Covariance carries the product of both units, such as centimeter-kilograms, so its size depends on scale: measuring $x$ in millimeters instead of centimeters multiplies the covariance by 10. Its sign is meaningful, but its size alone does not say how strong the relationship is.',
    ],
    example: {
      code: 'x = [0, 2, 4]\ny = [1, 4, 4]\nmean_x = 2\nmean_y = 3\ntotal = 0\nfor i in range(len(x)):\n    total += (x[i] - mean_x) * (y[i] - mean_y)\nprint(total / len(x))',
      output: '2.0',
      explanation:
        'The deviation pairs are (−2, −2), (0, 1), and (2, 1). Their products 4, 0, and 2 sum to 6, and 6 / 3 = 2.0: x and y tend to rise together.',
    },
    questions: [
      q(
        'x = [1, 2, 3] and y = [6, 4, 2]. What is the sign of cov(x, y)?',
        ['Positive', 'Negative', 'Zero', 'It depends on the units'],
        1,
        'Above-average x pairs with below-average y, so the deviation products are negative.',
      ),
      q(
        'What is cov(x, x)?',
        ['0', '1', 'The variance of x', 'The mean of x'],
        2,
        'The paired deviations are identical, so their products are the squared deviations.',
      ),
      q(
        'Heights change from meters to centimeters. What happens to cov(height, weight)?',
        [
          'It is multiplied by 100',
          'It is unchanged',
          'It is divided by 100',
          'It becomes a correlation',
        ],
        0,
        'Every height deviation is multiplied by 100, so every product, and their mean, is too.',
      ),
    ],
    exercise: {
      prompt:
        'Set covariance to the population covariance of x = [1, 3, 5] and y = [2, 2, 8], dividing by the number of pairs.',
      starter: 'x = [1, 3, 5]\ny = [2, 2, 8]\ncovariance = 0',
      solution:
        'x = [1, 3, 5]\ny = [2, 2, 8]\nn = len(x)\nmean_x = 0\nmean_y = 0\nfor i in range(n):\n    mean_x += x[i]\n    mean_y += y[i]\nmean_x = mean_x / n\nmean_y = mean_y / n\ncovariance = 0\nfor i in range(n):\n    covariance += (x[i] - mean_x) * (y[i] - mean_y)\ncovariance = covariance / n',
      tests: 'assert abs(covariance - 4.0) < 1e-9',
    },
    cards: [
      [
        'How is population covariance computed?',
        'Average the products of paired deviations from each mean: mean of (x − x̄)(y − ȳ).',
      ],
      [
        'Why does covariance alone not measure strength?',
        'Its size depends on the units and scales of both variables.',
      ],
    ],
  },
  {
    id: 'math-correlation',
    unitId: 'math-data-foundations',
    title: 'Correlation',
    prerequisites: ['math-covariance'],
    summary:
      'Rescale covariance to a unitless measure of linear association between −1 and 1.',
    paragraphs: [
      'The correlation coefficient $r = \\operatorname{cov}(x, y) / (\\sigma_x \\sigma_y)$ divides covariance by both standard deviations. The units cancel, so $r$ is unchanged when either variable is rescaled by a positive factor, and it always lies between −1 and 1. $r = 1$ or $-1$ means the points lie exactly on a line with positive or negative slope; $r$ near 0 means no linear trend. Because the $1 / n$ factors cancel, $r$ can be computed from sums of products and squares of deviations.',
      'Correlation measures only linear association. For $x = [-2, -1, 0, 1, 2]$ and $y = x^2$, $y$ is completely determined by $x$, yet $r = 0$ because the relationship is curved and symmetric. A strong correlation also does not establish causation: a third variable, selection, or a shared trend can produce it.',
    ],
    example: {
      code: 'x = [1, 2, 3]\ny = [7, 5, 3]\nmean_x = 2\nmean_y = 5\nsxy = 0\nsxx = 0\nsyy = 0\nfor i in range(len(x)):\n    sxy += (x[i] - mean_x) * (y[i] - mean_y)\n    sxx += (x[i] - mean_x) ** 2\n    syy += (y[i] - mean_y) ** 2\nprint(sxy / (sxx * syy) ** 0.5)',
      output: '-1.0',
      explanation:
        'sxy = −4, sxx = 2, and syy = 8, so r = −4 / √16 = −1: the points lie exactly on a falling line.',
    },
    questions: [
      q(
        'Which correlation describes the strongest linear relationship?',
        ['0.6', '-0.9', '0.1', '-0.3'],
        1,
        'Strength is the distance from 0; the sign only gives the direction.',
      ),
      q(
        'y = x² for x = [−2, −1, 0, 1, 2]. What is the correlation of x and y?',
        ['1', '-1', '0.5', '0'],
        3,
        'The symmetric curve has no linear trend, so the positive and negative deviation products cancel.',
      ),
      q(
        'Temperatures convert from Celsius to Fahrenheit. What happens to their correlation with ice-cream sales?',
        [
          'It is unchanged',
          'It is multiplied by 1.8',
          'It increases by 32',
          'It changes sign',
        ],
        0,
        'A positive rescaling and shift leave correlation unchanged because units cancel.',
      ),
    ],
    exercise: {
      prompt:
        'Set r to the correlation coefficient of x = [1, 2, 3, 4] and y = [2, 1, 4, 3].',
      starter: 'x = [1, 2, 3, 4]\ny = [2, 1, 4, 3]\nr = 0',
      solution:
        'x = [1, 2, 3, 4]\ny = [2, 1, 4, 3]\nn = len(x)\nmean_x = 0\nmean_y = 0\nfor i in range(n):\n    mean_x += x[i] / n\n    mean_y += y[i] / n\nsxy = 0\nsxx = 0\nsyy = 0\nfor i in range(n):\n    sxy += (x[i] - mean_x) * (y[i] - mean_y)\n    sxx += (x[i] - mean_x) ** 2\n    syy += (y[i] - mean_y) ** 2\nr = sxy / (sxx * syy) ** 0.5',
      tests: 'assert abs(r - 0.6) < 1e-9',
    },
    cards: [
      [
        'How is the correlation coefficient computed?',
        'r = cov(x, y) / (σ_x σ_y); it lies between −1 and 1.',
      ],
      [
        'Can two variables be strongly related yet have correlation 0?',
        'Yes. Correlation measures only linear association, so a curved relationship can give r = 0.',
      ],
    ],
  },
  {
    id: 'math-probability',
    unitId: 'math-probability-models',
    title: 'Probability and conditional events',
    prerequisites: ['boolean-logic'],
    summary:
      'Distinguish an event probability from a probability within a selected group.',
    paragraphs: [
      'A probability lies between 0 and 1. For equally likely outcomes, an event probability is the number of favorable outcomes divided by the total number of outcomes.',
      'Conditional probability $P(A \\mid B)$ restricts attention to the outcomes where $B$ holds. It equals $P(A \\text{ and } B) / P(B)$ when $P(B) > 0$. Conditioning can change the denominator drastically, and $P(A \\mid B)$ generally differs from $P(B \\mid A)$.',
    ],
    example: {
      code: 'total = 100\npositive = 20\npositive_and_condition = 12\nprint(positive_and_condition / positive)',
      output: '0.6',
      explanation:
        'Distinguish an event probability from a probability within a selected group.',
    },
    questions: [
      q(
        'A fair six-sided die has probability of rolling an even number:',
        ['1/6', '1/3', '1/2', '1'],
        2,
        'Three of the six equally likely outcomes are even.',
      ),
      q(
        '12 of 20 positive tests correspond to the condition. What fraction of positives have it?',
        ['12/100', '20/12', '12/20', '20/100'],
        2,
        'Conditioning on positive tests changes the denominator to 20.',
      ),
      q(
        'Which equality holds for complementary events?',
        [
          'P(A) + P(not A) = 1',
          'P(A) = P(not A)',
          'P(A | B) = P(B | A)',
          'P(A and B) = 1',
        ],
        0,
        'An event and its complement cover every possible outcome without overlap.',
      ),
    ],
    exercise: {
      prompt:
        'Among 50 selected observations, 15 have the event. Set conditional_probability to the event fraction within the selected group.',
      starter:
        'selected = 50\nevent_in_selected = 15\nconditional_probability = 0',
      solution:
        'selected = 50\nevent_in_selected = 15\nconditional_probability = event_in_selected / selected',
      tests: 'assert abs(conditional_probability - 0.3) < 1e-9',
    },
    cards: [
      ['How is P(A | B) computed?', 'P(A and B) / P(B), provided P(B) > 0.'],
      [
        'Why is P(A | B) different from P(B | A)?',
        'They restrict attention to different groups, so their denominators differ.',
      ],
    ],
  },
  {
    id: 'math-random-variables',
    unitId: 'math-probability-models',
    title: 'Random variables and expected value',
    prerequisites: ['math-probability', 'math-mean'],
    summary:
      'Describe an uncertain number by its distribution and its probability-weighted mean.',
    paragraphs: [
      'A random variable $X$ assigns a number to each outcome of a random process, such as the number of heads in two coin flips or the reward from an action. Its distribution lists each possible value with its probability; the probabilities are nonnegative and sum to 1.',
      'The expected value $E[X] = \\sum x \\times P(X = x)$ is the probability-weighted mean of the values: the long-run average over many repetitions. A fair die has $E[X] = (1 + 2 + \\dots + 6) / 6 = 3.5$, a value it never shows. Expectation is linear: $E[aX + b] = a E[X] + b$, and $E[X + Y] = E[X] + E[Y]$ even when $X$ and $Y$ are dependent.',
    ],
    example: worked(
      'reward 10 with probability 0.2\nreward 0 with probability 0.5\nreward −2 with probability 0.3',
      'E[reward] = 2 + 0 − 0.6 = 1.4',
      'Multiply each value by its probability and add the products: 10 × 0.2 = 2, 0 × 0.5 = 0, and −2 × 0.3 = −0.6.',
    ),
    questions: [
      q(
        'X is 1 with probability 0.4 and 5 with probability 0.6. What is E[X]?',
        ['3', '3.4', '2.6', '6'],
        1,
        '1 × 0.4 + 5 × 0.6 = 0.4 + 3 = 3.4.',
      ),
      q(
        'Which list can be the probabilities of a distribution over three values?',
        ['0.5, 0.5, 0.5', '0.6, 0.6, −0.2', '1, 1, 1', '0.2, 0.3, 0.5'],
        3,
        'Probabilities must be nonnegative and sum to 1; only 0.2, 0.3, 0.5 does both.',
      ),
      q(
        'E[X] = 4. What is E[3X − 2]?',
        ['10', '12', '14', '4'],
        0,
        'Expectation is linear: 3 × 4 − 2 = 10.',
      ),
      q(
        'A game costs 1 to play and pays 6 with probability 1/6, otherwise nothing. What is the expected net gain?',
        ['1', '5', '0', '-1'],
        2,
        'The expected payout is 6 × 1/6 = 1, and subtracting the cost of 1 leaves 0.',
      ),
    ],
    cards: [
      [
        'What is the expected value of a discrete random variable?',
        'The probability-weighted sum of its values: Σ x × P(X = x).',
      ],
      [
        'What does linearity of expectation say?',
        'E[aX + b] = a E[X] + b, and E[X + Y] = E[X] + E[Y], even for dependent X and Y.',
      ],
    ],
  },
  {
    id: 'math-rv-variance',
    unitId: 'math-probability-models',
    title: 'Variance of a random variable',
    prerequisites: ['math-random-variables', 'math-variance'],
    summary:
      'Measure the spread of a random variable and how scaling and averaging change it.',
    paragraphs: [
      'The variance of $X$ is the expected squared distance from its mean: $\\operatorname{Var}(X) = E[(X - \\mu)^2]$, where $\\mu = E[X]$. An equivalent shortcut is $\\operatorname{Var}(X) = E[X^2] - \\mu^2$. Its square root is the standard deviation. For $X$ equal to 0 or 2 with probability 1/2 each, $\\mu = 1$ and $\\operatorname{Var}(X) = 1$.',
      'Shifting does not change spread, but scaling does: $\\operatorname{Var}(aX + b) = a^2 \\operatorname{Var}(X)$. For independent $X$ and $Y$, variances add: $\\operatorname{Var}(X + Y) = \\operatorname{Var}(X) + \\operatorname{Var}(Y)$. So the average of $n$ independent copies, each with variance $\\sigma^2$, has variance $\\sigma^2 / n$: averaging independent noisy quantities makes the result less variable.',
    ],
    example: worked(
      'X = 1 or 3, each with probability 0.5\nμ = 2\nE[(X − 2)²] = 0.5 × 1 + 0.5 × 1',
      'Var(X) = 1, Var(5X + 7) = 25',
      'Each value lies 1 from the mean, so the expected squared distance is 1. Adding 7 changes nothing; multiplying by 5 multiplies the variance by 25.',
    ),
    questions: [
      q(
        'Var(X) = 4. What is Var(−3X + 10)?',
        ['-12', '22', '36', '12'],
        2,
        'Shifting by 10 does nothing, and scaling by −3 multiplies the variance by 9.',
      ),
      q(
        'X and Y are independent with variances 2 and 5. What is Var(X + Y)?',
        ['7', '10', '3', '√7'],
        0,
        'Variances of independent variables add.',
      ),
      q(
        'Ten independent models each have prediction-error variance 9. What is the variance of their average error?',
        ['9', '3', '90', '0.9'],
        3,
        'The average of n independent copies has variance σ² / n = 9 / 10.',
      ),
      q(
        'E[X] = 3 and E[X²] = 13. What is Var(X)?',
        ['10', '4', '2', '16'],
        1,
        'Var(X) = E[X²] − μ² = 13 − 9 = 4.',
      ),
    ],
    cards: [
      [
        'What is Var(aX + b)?',
        'a² Var(X); the shift b does not change spread.',
      ],
      [
        'What is the variance of the mean of n independent copies with variance σ²?',
        'σ² / n.',
      ],
    ],
  },
  {
    id: 'math-bernoulli-binomial',
    unitId: 'math-probability-models',
    title: 'Bernoulli and binomial distributions',
    prerequisites: ['math-rv-variance'],
    summary:
      'Model yes/no trials and count successes across independent repetitions.',
    paragraphs: [
      'A Bernoulli variable is 1 (success) with probability $p$ and 0 otherwise. Its mean is $p$ and its variance is $p(1 - p)$, largest at $p = 0.5$. For independent trials, probabilities multiply: three independent trials with $p = 0.2$ produce the sequence 1, 0, 1 with probability $0.2 \\times 0.8 \\times 0.2 = 0.032$.',
      'The binomial distribution counts successes $K$ in $n$ independent $\\text{Bernoulli}(p)$ trials. The number of sequences with exactly $k$ successes is $C(n, k) = n! / (k! (n - k)!)$, so $P(K = k) = C(n, k) p^k (1 - p)^{n - k}$. Because $K$ is a sum of $n$ independent Bernoulli variables, its mean is $np$ and its variance is $np(1 - p)$.',
    ],
    example: worked(
      'n = 4 trials, p = 0.5, exactly 2 successes\nC(4, 2) = 6 sequences, each with probability 0.5⁴ = 1/16',
      'P(K = 2) = 6/16 = 0.375, E[K] = 2, Var(K) = 1',
      'The six sequences are 1100, 1010, 1001, 0110, 0101, and 0011. The mean is np = 2 and the variance is np(1 − p) = 1.',
    ),
    questions: [
      q(
        'A Bernoulli variable has p = 0.3. What is its variance?',
        ['0.3', '0.09', '0.21', '0.7'],
        2,
        'p(1 − p) = 0.3 × 0.7 = 0.21.',
      ),
      q(
        'A coin with P(heads) = 0.6 is flipped twice independently. What is P(both heads)?',
        ['0.36', '1.2', '0.6', '0.24'],
        0,
        'Independent probabilities multiply: 0.6 × 0.6 = 0.36.',
      ),
      q(
        'How many sequences of 5 trials contain exactly 2 successes?',
        ['20', '7', '3', '10'],
        3,
        'C(5, 2) = 5! / (2! 3!) = 10.',
      ),
      q(
        'Each of 100 independent emails is spam with probability 0.1. What are the mean and variance of the spam count?',
        ['10 and 10', '10 and 9', '0.1 and 0.09', '90 and 9'],
        1,
        'np = 10 and np(1 − p) = 100 × 0.1 × 0.9 = 9.',
      ),
    ],
    cards: [
      [
        'What are the mean and variance of a Bernoulli(p) variable?',
        'Mean p, variance p(1 − p).',
      ],
      [
        'What is the binomial probability of k successes in n trials?',
        'C(n, k) pᵏ (1 − p)ⁿ⁻ᵏ, with mean np and variance np(1 − p).',
      ],
    ],
  },
  {
    id: 'math-normal-distribution',
    unitId: 'math-probability-models',
    title: 'The normal distribution',
    prerequisites: ['math-rv-variance'],
    summary:
      "Use the bell curve's mean, standard deviation, and z-scores to judge how unusual a value is.",
    paragraphs: [
      'The normal distribution $N(\\mu, \\sigma^2)$ is a continuous, symmetric, bell-shaped distribution centered at its mean $\\mu$, with spread set by its standard deviation $\\sigma$. For a continuous variable, probabilities are areas under the density curve, so any single exact value has probability 0. About 68% of values lie within $1\\sigma$ of $\\mu$, 95% within $2\\sigma$, and 99.7% within $3\\sigma$.',
      'A z-score $z = (x - \\mu) / \\sigma$ counts how many standard deviations $x$ lies from the mean. If $X$ is normal, $Z = (X - \\mu) / \\sigma$ is standard normal, $N(0, 1)$, so z-scores compare values measured in different units. A value with $|z| > 3$ is rare under a normal model, which is why it is often flagged as unusual. Many measurements are only approximately normal; check the shape before relying on these percentages.',
    ],
    example: worked(
      'heights ~ N(170, 10²); one person is 195 cm\nz = (195 − 170) / 10',
      'z = 2.5',
      'The height is 2.5 standard deviations above the mean. Since 95% of values lie within 2σ, fewer than 2.5% of people are at least this tall.',
    ),
    questions: [
      q(
        'Test scores follow N(60, 8²). What is the z-score of 76?',
        ['16', '0.5', '-2', '2'],
        3,
        '(76 − 60) / 8 = 2.',
      ),
      q(
        'About what share of a normal distribution lies within 2σ of its mean?',
        ['68%', '95%', '99.7%', '50%'],
        1,
        'The 68–95–99.7 rule gives 95% within two standard deviations.',
      ),
      q(
        'X ~ N(0, 1). What is P(X = 1.3) exactly?',
        ['0', '0.5', '0.903', '1.3'],
        0,
        'A continuous variable has probability 0 at any single exact value; probabilities are areas over intervals.',
      ),
      q(
        'Sensor readings follow N(100, 5²). Which reading is most unusual?',
        ['112', '104', '86', '91'],
        2,
        'The z-scores are 2.4, 0.8, −2.8, and −1.8; 86 lies farthest from the mean.',
      ),
    ],
    cards: [
      [
        'What is a z-score?',
        '(x − μ) / σ: the number of standard deviations from the mean.',
      ],
      [
        'What does the 68–95–99.7 rule state?',
        'For a normal distribution, about 68%, 95%, and 99.7% of values lie within 1, 2, and 3 standard deviations of the mean.',
      ],
    ],
  },
  {
    id: 'math-sampling',
    unitId: 'math-probability-models',
    title: 'Samples and sampling variation',
    prerequisites: ['math-normal-distribution'],
    summary:
      'Distinguish a sample from its population and predict how much sample statistics vary.',
    paragraphs: [
      'A population is every unit you care about; a sample is the part you observe. A statistic such as the sample mean changes from sample to sample. For $n$ independent observations with standard deviation $\\sigma$, the sample mean has standard deviation $\\sigma / \\sqrt{n}$, called its standard error, so quadrupling $n$ halves it. By the central limit theorem, the sample mean is approximately normal for large $n$ even when individual values are not.',
      'Sampling with replacement allows a unit to be drawn more than once. A bootstrap sample draws $n$ rows with replacement from $n$ observed rows, so some rows repeat and others are left out; repeating that process approximates how a statistic would vary across new samples. A biased sampling process, such as surveying only customers who reply, is not fixed by collecting more of the same.',
    ],
    example: worked(
      'population standard deviation σ = 12\nsample size n = 36\nstandard error = σ / √n',
      'standard error = 12 / 6 = 2',
      'Sample means cluster around the population mean with standard deviation 2, so about 95% of them fall within 4 of it.',
    ),
    questions: [
      q(
        'σ = 20 and n = 100. What is the standard error of the sample mean?',
        ['0.2', '2', '20', '200'],
        1,
        '20 / √100 = 2.',
      ),
      q(
        'By what factor must the sample size grow to halve the standard error?',
        ['2', '√2', '0.5', '4'],
        3,
        'The standard error shrinks with √n, so halving it needs 4 times as many observations.',
      ),
      q(
        'Which could be a bootstrap sample drawn from the five rows A, B, C, D, E?',
        ['B, B, D, E, A', 'A, B, C, D, E, F', 'A, C', 'A, A, A, B, B, C'],
        0,
        'A bootstrap sample has the same size as the data, drawn from those rows with replacement.',
      ),
      q(
        'A survey reaches only people who answer phone calls at noon. What happens if the sample doubles in size?',
        [
          'The selection bias disappears',
          'The standard error doubles',
          'The bias remains; only random variation shrinks',
          'The population becomes everyone',
        ],
        2,
        'More data from the same biased process reduces noise but not the systematic error.',
      ),
    ],
    cards: [
      [
        'What is the standard error of a sample mean?',
        'σ / √n for n independent observations with standard deviation σ.',
      ],
      [
        'What is a bootstrap sample?',
        'A sample of n rows drawn with replacement from the n observed rows.',
      ],
    ],
  },
  {
    id: 'math-functions',
    unitId: 'math-functions-growth',
    title: 'Functions and their graphs',
    prerequisites: ['numbers'],
    summary:
      'Read a function as a rule from inputs to outputs and connect it to its graph.',
    paragraphs: [
      'A function assigns exactly one output to each allowed input. Writing $f(x) = 3x - 2$ names the rule $f$; $f(4)$ means substitute 4 for $x$, giving $3 \\times 4 - 2 = 10$. The allowed inputs form the domain. A rule that could give two different outputs for the same input is not a function.',
      'The graph of $f$ is the set of points $(x, f(x))$. A linear function $f(x) = mx + b$ has a straight-line graph: $b$ is the output at $x = 0$ (the intercept), and $m$ is the slope, the change in output for each one-unit increase in input. A positive slope means the function increases from left to right; a negative slope means it decreases.',
    ],
    example: worked(
      'f(x) = 3x − 2\nf(0) = 3 × 0 − 2\nf(4) = 3 × 4 − 2',
      'f(0) = −2, f(4) = 10, slope 3',
      'Substitute each input for x. The graph passes through (0, −2) and (4, 10); the output rises 12 over a run of 4, so the slope is 3.',
    ),
    questions: [
      q(
        'For g(x) = x² − 1, what is g(−3)?',
        ['-10', '8', '10', '-7'],
        1,
        '(−3)² − 1 = 9 − 1 = 8.',
      ),
      q(
        'A line passes through (1, 5) and (3, 11). What is its slope?',
        ['6', '2', '8', '3'],
        3,
        'The output rises 11 − 5 = 6 over a run of 3 − 1 = 2, so the slope is 3.',
      ),
      q(
        'Which rule does not define y as a function of x?',
        ['y = 2x + 1', 'y = x²', 'y is any number whose square is x', 'y = 7'],
        2,
        'For x = 4, y could be 2 or −2, so one input has two outputs.',
      ),
      q(
        'h(x) = −2x + 4. As x increases by 1, what happens to h(x)?',
        [
          'It decreases by 2',
          'It increases by 2',
          'It stays at 4',
          'It decreases by 4',
        ],
        0,
        'The slope is −2, so each unit step in x lowers the output by 2.',
      ),
    ],
    cards: [
      ['What does f(a) mean?', 'The output of the rule f when the input is a.'],
      [
        'What do m and b mean in f(x) = mx + b?',
        'm is the slope, the output change per unit of input; b is the output at x = 0.',
      ],
    ],
  },
  {
    id: 'math-exponentials',
    unitId: 'math-functions-growth',
    title: 'Exponents and exponential functions',
    prerequisites: ['math-functions'],
    summary:
      'Apply exponent rules and recognize growth by repeated multiplication, including base e.',
    paragraphs: [
      'An exponent counts repeated multiplication: $2^5 = 2 \\times 2 \\times 2 \\times 2 \\times 2 = 32$. The rules follow from counting factors: $a^m \\times a^n = a^{m+n}$, $a^m / a^n = a^{m-n}$, and $(a^m)^n = a^{mn}$. They also force $a^0 = 1$ and $a^{-n} = 1 / a^n$ for any nonzero $a$.',
      'An exponential function $f(x) = b^x$ with $b > 0$ multiplies its output by $b$ for every unit step in $x$. With $b > 1$ it grows ever faster; with $0 < b < 1$ it decays toward 0 without reaching it. The constant $e \\approx 2.718$ is the base used throughout machine learning: $e^x$ is always positive, $e^0 = 1$, and $e^{-x} = 1 / e^x$.',
    ],
    example: worked(
      '2³ × 2⁴ = 2⁷\n5⁻² = 1 / 5²\ne⁰',
      '128, 0.04, 1',
      'Multiplying powers of the same base adds the exponents; a negative exponent is a reciprocal; any nonzero base to the power 0 is 1.',
    ),
    questions: [
      q(
        'Which expression equals 3⁴ × 3²?',
        ['3⁸', '9⁶', '3⁶', '6⁶'],
        2,
        'Multiplying powers of the same base adds the exponents: 4 + 2 = 6.',
      ),
      q(
        'What is 10⁻³?',
        ['0.001', '-1000', '-30', '0.003'],
        0,
        'A negative exponent is a reciprocal: 1 / 10³ = 0.001.',
      ),
      q(
        'f(x) = 0.5ˣ. What happens as x increases?',
        [
          'f grows without bound',
          'f reaches 0 at x = 2',
          'f alternates in sign',
          'f halves with each unit step and stays positive',
        ],
        3,
        'Each step multiplies by 0.5, so the output shrinks toward 0 but never reaches it.',
      ),
      q(
        'Which value is e⁻¹ closest to?',
        ['-2.718', '$0.368$', '1', '-0.368'],
        1,
        'e⁻¹ = 1 / e ≈ 1 / 2.718 ≈ 0.368, a positive number.',
      ),
    ],
    cards: [
      ['How do you multiply aᵐ by aⁿ?', 'Add the exponents: aᵐ × aⁿ = aᵐ⁺ⁿ.'],
      ['What is a⁻ⁿ?', 'The reciprocal 1 / aⁿ, for nonzero a.'],
    ],
  },
  {
    id: 'math-logarithms',
    unitId: 'math-functions-growth',
    title: 'Logarithms and the natural log',
    prerequisites: ['math-exponentials'],
    summary:
      'Undo exponentials with logarithms and use log rules to turn products into sums.',
    paragraphs: [
      'A logarithm answers "which exponent?": $\\log_b(x) = k$ exactly when $b^k = x$. So $\\log_2(8) = 3$ and $\\log_{10}(0.01) = -2$. The natural logarithm $\\ln$ uses base $e$, so $\\ln(e^k) = k$ and $\\ln(1) = 0$. Logarithms are defined only for positive inputs, because $b^k$ is always positive.',
      'Exponent rules become log rules: $\\log(xy) = \\log(x) + \\log(y)$, $\\log(x / y) = \\log(x) - \\log(y)$, and $\\log(x^k) = k \\log(x)$. Because $\\log$ is increasing, $x < y$ exactly when $\\log(x) < \\log(y)$, so taking logs preserves which value is largest. This is why products of many probabilities are compared through sums of their logs.',
    ],
    example: worked(
      'ln(e³)\nlog₂(32)\nlog₁₀(20) + log₁₀(5) = log₁₀(20 × 5)',
      '3, 5, 2',
      'Each log asks for an exponent: e³, 2⁵ = 32, and 10² = 100. Adding two logs multiplies their inputs.',
    ),
    questions: [
      q(
        'What is log₃(81)?',
        ['27', '3', '4', '243'],
        2,
        '3⁴ = 81, so the exponent is 4.',
      ),
      q(
        'ln(a) = 2 and ln(b) = 5. What is ln(ab)?',
        ['7', '10', '3', '2.5'],
        0,
        'The log of a product is the sum of the logs: 2 + 5 = 7.',
      ),
      q(
        'Why is ln(−4) undefined?',
        [
          'ln accepts only whole numbers',
          'ln(−4) equals ln(4)',
          'Negative inputs always give 0',
          'e raised to any power is positive',
        ],
        3,
        'No exponent k makes eᵏ negative, so no logarithm of −4 exists.',
      ),
      q(
        'Which expression equals ln(x³)?',
        ['3 + ln(x)', '3 ln(x)', '(ln x)³', 'ln(3x)'],
        1,
        'The power rule for logs brings the exponent down as a factor.',
      ),
    ],
    cards: [
      [
        'What does log_b(x) = k mean?',
        'bᵏ = x: the logarithm is the exponent.',
      ],
      [
        'Why compare products of probabilities with sums of logs?',
        'log(xy) = log(x) + log(y), and log is increasing, so the largest product has the largest log-sum.',
      ],
    ],
  },
  {
    id: 'math-sigmoid',
    unitId: 'math-functions-growth',
    title: 'The sigmoid function',
    prerequisites: ['math-exponentials'],
    summary:
      'Squash any real score into a value between 0 and 1 with the logistic sigmoid.',
    paragraphs: [
      'The sigmoid is $\\sigma(z) = 1 / (1 + e^{-z})$. For a large positive $z$, $e^{-z}$ is tiny, so $\\sigma(z)$ is close to 1; for a large negative $z$, $e^{-z}$ is huge, so $\\sigma(z)$ is close to 0. At $z = 0$, $e^0 = 1$ and $\\sigma(0) = 1 / 2$. Every output lies strictly between 0 and 1.',
      'The sigmoid is increasing: a larger score always gives a larger output. It is symmetric around 0, $\\sigma(-z) = 1 - \\sigma(z)$, so a score of −2 gives the complement of a score of 2. Far from 0 the curve flattens (saturates), so changing $z$ there barely changes $\\sigma(z)$.',
    ],
    example: worked(
      'σ(2) = 1 / (1 + e^(−2)) ≈ 1 / (1 + 0.135)\nσ(−2) = 1 − σ(2)',
      'σ(2) ≈ 0.881, σ(−2) ≈ 0.119',
      'e^(−2) ≈ 0.135, so σ(2) ≈ 1 / 1.135. The symmetry rule gives σ(−2) without a second exponential.',
    ),
    questions: [
      q(
        'σ(3) ≈ 0.953. What is σ(−3)?',
        ['-0.953', '0.5', '0.953', '0.047'],
        3,
        'σ(−z) = 1 − σ(z) = 1 − 0.953.',
      ),
      q(
        'Which value can the sigmoid never output?',
        ['0.001', '0.5', '1.2', '0.999'],
        2,
        'Every sigmoid output lies strictly between 0 and 1.',
      ),
      q(
        'Scores z₁ = 4 and z₂ = 1. Which statement is true?',
        [
          'σ(z₁) > σ(z₂)',
          'σ(z₁) < σ(z₂)',
          'σ(z₁) = 4σ(z₂)',
          'σ(z₁) = σ(z₂) + 3',
        ],
        0,
        'The sigmoid is increasing, but it is not proportional or shifted like its input.',
      ),
      q(
        'Why does increasing z from 8 to 9 barely change σ(z)?',
        [
          'The sigmoid decreases there',
          'The curve has saturated near 1',
          'e^(−z) grows with z',
          'σ(9) is undefined',
        ],
        1,
        'e^(−8) and e^(−9) are both tiny, so both outputs are almost exactly 1.',
      ),
    ],
    cards: [
      [
        'What is the sigmoid function?',
        'σ(z) = 1 / (1 + e^(−z)), with outputs between 0 and 1.',
      ],
      ['How is σ(−z) related to σ(z)?', 'σ(−z) = 1 − σ(z).'],
    ],
  },
  {
    id: 'math-softmax',
    unitId: 'math-functions-growth',
    title: 'Softmax over several scores',
    prerequisites: ['math-sigmoid', 'math-probability'],
    summary:
      'Turn a list of scores into probabilities that are positive and sum to 1.',
    paragraphs: [
      'Softmax maps scores $z_1, \\ldots, z_k$ to $p_i = e^{z_i} / (e^{z_1} + \\cdots + e^{z_k})$. Each exponential is positive and the denominator is their total, so every $p_i$ lies between 0 and 1 and the $p_i$ sum to 1: a probability distribution over $k$ mutually exclusive classes. A larger score always receives a larger probability.',
      'Adding the same constant $c$ to every score leaves softmax unchanged, because $e^{z_i + c} = e^{z_i} \\times e^c$ and the factor $e^c$ cancels. Implementations subtract the largest score first so that no exponential overflows. With two classes, softmax gives the first class $\\sigma(z_1 - z_2)$: the sigmoid of the score difference.',
    ],
    example: worked(
      'scores 2, 0, 0\nexponentials ≈ 7.389, 1, 1 (total ≈ 9.389)',
      'probabilities ≈ 0.787, 0.107, 0.107',
      'Divide each exponential by the total. The tied scores receive equal probability, and the three probabilities sum to 1.',
    ),
    questions: [
      q(
        'What is the softmax of the scores 1, 1, 1, 1?',
        [
          '1, 1, 1, 1',
          '0, 0, 0, 1',
          '0.25, 0.25, 0.25, 0.25',
          '0.1, 0.2, 0.3, 0.4',
        ],
        2,
        'Equal scores have equal exponentials, so each class receives 1/4.',
      ),
      q(
        'Scores 3 and 1 become 5 and 3 after adding 2. What happens to their softmax probabilities?',
        [
          'They stay the same',
          'Both increase',
          'They no longer sum to 1',
          'Their gap doubles',
        ],
        0,
        'The common factor e² cancels between numerator and denominator.',
      ),
      q(
        'With e² ≈ 7.39, what probability does softmax give the first of the scores 2 and 0?',
        ['1.00', '0.74', '0.50', '0.88'],
        3,
        '7.39 / (7.39 + 1) ≈ 0.88, which is also σ(2 − 0).',
      ),
      q(
        'Why exponentiate before normalizing instead of dividing raw scores by their sum?',
        [
          'Exponentials turn the scores into integers',
          'Raw scores can be negative or sum to zero',
          'Division is undefined for lists',
          'It makes the largest probability exactly 1',
        ],
        1,
        'Exponentials are always positive, so the normalized values are valid probabilities.',
      ),
    ],
    cards: [
      [
        'How does softmax turn scores into probabilities?',
        'Exponentiate each score and divide by the sum of the exponentials.',
      ],
      [
        'What happens to softmax when every score increases by the same constant?',
        'Nothing; the common factor cancels.',
      ],
    ],
  },
  {
    id: 'math-derivative-rate',
    unitId: 'math-calculus',
    title: 'The derivative as a rate of change',
    prerequisites: ['math-functions'],
    summary: 'Read a derivative as the slope of a function at one point.',
    paragraphs: [
      'The average rate of change of $f$ between $x = a$ and $x = b$ is $(f(b) - f(a)) / (b - a)$: the slope of the straight line through those two points of the graph. For $f(x) = x^2$ from $x = 1$ to $x = 3$, it is $(9 - 1) / 2 = 4$.',
      "The derivative $f'(a)$ is the rate of change at the single point $a$: the value that $(f(a + h) - f(a)) / h$ approaches as $h$ shrinks toward 0, which is the slope of the tangent line there. For $x^2$ at $a = 3$, $h = 0.1$ gives 6.1 and $h = 0.01$ gives 6.01, approaching $f'(3) = 6$. A positive derivative means $f$ is increasing at that point, a negative one means decreasing, and zero means locally flat.",
    ],
    example: worked(
      'f(x) = x², a = 3\nh = 0.1: (3.1² − 3²) / 0.1 = 6.1\nh = 0.01: (3.01² − 3²) / 0.01 = 6.01',
      'f′(3) = 6',
      'As h shrinks, the slopes of the short secant lines approach 6, the slope of the tangent at x = 3.',
    ),
    questions: [
      q(
        'f(x) = x³. What is its average rate of change from x = 0 to x = 2?',
        ['8', '4', '2', '6'],
        1,
        '(2³ − 0³) / (2 − 0) = 8 / 2 = 4.',
      ),
      q(
        'f′(5) = −2. What does f do near x = 5?',
        [
          'It rises about 2 per unit of x',
          'Its value is −2 there',
          'It falls about 2 per unit of x',
          'It has a minimum there',
        ],
        2,
        'A negative derivative means decreasing, at a rate of about 2 output units per input unit.',
      ),
      q(
        'Difference quotients for f at x = 1 are 4.1, 4.01, and 4.001 for h = 0.1, 0.01, and 0.001. What is f′(1)?',
        ['4.1', '4.001', '0', '4'],
        3,
        'The derivative is the value the quotients approach as h shrinks toward 0.',
      ),
      q(
        'For f(x) = 7x − 3, what is f′(x)?',
        ['7', '$7x$', '−3', '0'],
        0,
        'A line has the same slope everywhere, here 7.',
      ),
    ],
    cards: [
      [
        'What is the average rate of change of f from a to b?',
        '(f(b) − f(a)) / (b − a), the slope of the line through the two graph points.',
      ],
      [
        'What does the derivative f′(a) measure?',
        'The instantaneous rate of change at a: the slope of the tangent line there.',
      ],
    ],
  },
  {
    id: 'math-power-rule',
    unitId: 'math-calculus',
    title: 'The power and constant rules',
    prerequisites: ['math-derivative-rate'],
    summary: 'Differentiate powers of x, constants, and constant multiples.',
    paragraphs: [
      "The power rule says the derivative of $x^n$ is $n x^{n-1}$: bring the exponent down as a factor and lower it by one. So $(x^2)' = 2x$, $(x^5)' = 5x^4$, and $(x)' = 1$. A constant has derivative 0 because its graph is flat.",
      "A constant multiple passes through: $(c f(x))' = c f'(x)$. So $(4x^3)' = 4 \\times 3x^2 = 12x^2$. The derivative is itself a function; evaluate it at a point to get the slope there. For $4x^3$ at $x = 2$, the slope is $12 \\times 2^2 = 48$.",
    ],
    example: worked(
      'f(x) = 5x⁴\nf′(x) = 5 × 4x³ = 20x³\nf′(1) = 20 × 1³',
      'f′(x) = 20x³, slope 20 at x = 1',
      'Apply the power rule to x⁴, keep the constant factor 5, then substitute x = 1.',
    ),
    questions: [
      q(
        'What is the derivative of x⁷?',
        ['x⁶', '7x⁷', '6x⁷', '7x⁶'],
        3,
        'Bring down the exponent 7 and lower it to 6.',
      ),
      q(
        'f(x) = 3x². What is f′(4)?',
        ['48', '24', '6', '12'],
        1,
        'f′(x) = 6x, so f′(4) = 24.',
      ),
      q(
        'What is the derivative of the constant function f(x) = 9?',
        ['9', '9x', '0', '1'],
        2,
        'A constant function is flat, so its slope is 0 everywhere.',
      ),
      q(
        'g(x) = −2x³. Which is g′(x)?',
        ['−6x²', '−2x²', '−6x³', '$6x^2$'],
        0,
        'Keep the factor −2 and differentiate x³ to 3x²: −2 × 3x² = −6x².',
      ),
    ],
    cards: [
      ['What is the derivative of xⁿ?', 'n xⁿ⁻¹.'],
      [
        'What is the derivative of c f(x)?',
        'c f′(x); a constant on its own has derivative 0.',
      ],
    ],
  },
  {
    id: 'math-sum-product-rules',
    unitId: 'math-calculus',
    title: 'Sum and product rules',
    prerequisites: ['math-power-rule'],
    summary:
      'Differentiate polynomials term by term and products of two functions.',
    paragraphs: [
      "The derivative of a sum is the sum of the derivatives: $(f + g)' = f' + g'$. So a polynomial is differentiated term by term: $(x^3 - 4x^2 + 7x - 2)' = 3x^2 - 8x + 7$.",
      "A product is not differentiated factor by factor. The product rule is $(fg)' = f'g + fg'$: change one factor at a time and add the effects. For $x^2(3x + 1)$, the derivative is $2x(3x + 1) + x^2 \\times 3 = 9x^2 + 2x$, which matches differentiating the expanded form $3x^3 + x^2$.",
    ],
    example: worked(
      'p(x) = x²(x + 5)\np′(x) = 2x(x + 5) + x² × 1',
      'p′(x) = 3x² + 10x',
      'Differentiate the first factor and keep the second, then keep the first and differentiate the second. Expanding gives 2x² + 10x + x² = 3x² + 10x.',
    ),
    questions: [
      q(
        'What is the derivative of x⁴ + 3x² − 5x + 8?',
        ['4x³ + 3x² − 5', '4x³ + 6x − 5', '4x³ + 6x', 'x³ + 6x − 5'],
        1,
        'Differentiate term by term: 4x³, 6x, −5, and 0 for the constant.',
      ),
      q(
        'What is the derivative of x · x?',
        ['1', 'x', '0', '$2x$'],
        3,
        'The product rule gives 1 · x + x · 1 = 2x, matching (x²)′. Multiplying the factor derivatives would wrongly give 1.',
      ),
      q(
        'h(x) = (2x)(x² + 1). Which is h′(x)?',
        ['2(x² + 1) + 2x · 2x', '2 · 2x', '(2x)(2x)', '$2(x^2 + 1)$'],
        0,
        'f′g + fg′ with f = 2x and g = x² + 1.',
      ),
      q(
        'q(x) = 3x² − 12x. At which x is q′(x) = 0?',
        ['$x = 0$', '$x = 4$', '$x = 2$', '$x = -2$'],
        2,
        'q′(x) = 6x − 12, which is 0 at x = 2.',
      ),
    ],
    cards: [
      ['What is (f + g)′?', 'f′ + g′: differentiate term by term.'],
      ['What is the product rule?', '(fg)′ = f′g + fg′.'],
    ],
  },
  {
    id: 'math-chain-rule',
    unitId: 'math-calculus',
    title: 'The chain rule',
    prerequisites: ['math-sum-product-rules'],
    summary:
      'Differentiate a function of a function by multiplying local rates.',
    paragraphs: [
      "A composition feeds one function's output into another: for $h(x) = (3x + 1)^2$, the inner function is $u = 3x + 1$ and the outer function is $u^2$. The chain rule says $h'(x) = (\\text{outer derivative at } u) \\times (\\text{inner derivative}) = 2u \\times 3 = 6(3x + 1)$. Rates multiply: if $u$ changes 3 times as fast as $x$, and $h$ changes $2u$ times as fast as $u$, then $h$ changes $2u \\times 3$ times as fast as $x$.",
      'Longer chains multiply every link. If a loss $L$ depends on a prediction $p$, and $p$ depends on a weight $w$, then $\\frac{dL}{dw} = \\frac{dL}{dp} \\times \\frac{dp}{dw}$. Each factor is computed locally from its own step. This is the calculation backpropagation repeats through a network.',
    ],
    example: worked(
      'L(w) = (2w − 6)²\nu = 2w − 6, L = u²\ndL/du = 2u, du/dw = 2',
      'L′(w) = 4(2w − 6), so L′(4) = 8',
      'Multiply the outer derivative 2u by the inner derivative 2. At w = 4, u = 2, so L′(4) = 2 × 2 × 2 = 8.',
    ),
    questions: [
      q(
        'What is the derivative of (x − 5)²?',
        ['$2x$', '2(x − 5)', '(x − 5)', '2(x − 5)²'],
        1,
        'Outer derivative 2(x − 5) times inner derivative 1.',
      ),
      q(
        'What is the derivative of (4x + 1)³?',
        ['3(4x + 1)²', '12x²', '4(4x + 1)³', '12(4x + 1)²'],
        3,
        'Outer derivative 3(4x + 1)² times inner derivative 4.',
      ),
      q(
        'dL/dp = −6 and dp/dw = 2. What is dL/dw?',
        ['−12', '−4', '−3', '−8'],
        0,
        'The chain rule multiplies the links: −6 × 2 = −12.',
      ),
      q(
        'For L(p(w)), which factor of dL/dw comes from the inner step?',
        ['dL/dp', 'L(w)', 'dp/dw', 'p(L)'],
        2,
        'p is the inner function of w, so its local rate is dp/dw.',
      ),
    ],
    cards: [
      [
        'What does the chain rule state?',
        'For h(x) = f(g(x)), h′(x) = f′(g(x)) × g′(x).',
      ],
      [
        'How do you differentiate through a chain L(p(w))?',
        'Multiply the local rates: dL/dw = dL/dp × dp/dw.',
      ],
    ],
  },
  {
    id: 'math-partial-derivatives',
    unitId: 'math-calculus',
    title: 'Partial derivatives',
    prerequisites: ['math-chain-rule'],
    summary:
      'Measure how a function of several inputs changes when only one input moves.',
    paragraphs: [
      'A function such as $f(x, y) = x^2y + 3y$ has two inputs. The partial derivative $\\frac{\\partial f}{\\partial x}$ treats $y$ as a constant and differentiates with respect to $x$: $\\frac{\\partial f}{\\partial x} = 2xy$. Likewise $\\frac{\\partial f}{\\partial y}$ treats $x$ as a constant: $\\frac{\\partial f}{\\partial y} = x^2 + 3$. Each partial is a rate of change along one input direction.',
      'Model losses depend on several parameters at once. For one example with input $x$ and target $y$, $L(w, b) = (wx + b - y)^2$. By the chain rule, $\\frac{\\partial L}{\\partial w} = 2(wx + b - y) \\times x$ and $\\frac{\\partial L}{\\partial b} = 2(wx + b - y) \\times 1$. The two partials share the residual factor and differ only in the inner derivative.',
    ],
    example: worked(
      'f(x, y) = 3x²y + y³ at (1, 2)\n∂f/∂x = 6xy\n∂f/∂y = 3x² + 3y²',
      '∂f/∂x = 12, ∂f/∂y = 15',
      'Hold the other input fixed, differentiate, then substitute x = 1 and y = 2.',
    ),
    questions: [
      q(
        'f(x, y) = 5x + xy². What is ∂f/∂x?',
        ['5 + y²', '5 + 2xy', 'y²', '5x + y²'],
        0,
        'Treat y as a constant: 5x gives 5 and xy² gives y².',
      ),
      q(
        'g(a, b) = a²b. What is ∂g/∂b at (3, 4)?',
        ['24', '12', '36', '9'],
        3,
        'Holding a fixed, ∂g/∂b = a², which is 9 at a = 3.',
      ),
      q(
        'L(w, b) = (wx + b − y)² with x = 2, y = 1, w = 1, and b = 0. What is ∂L/∂w?',
        ['2', '1', '4', '8'],
        2,
        'The residual is 2 + 0 − 1 = 1, so ∂L/∂w = 2 × 1 × 2 = 4.',
      ),
      q(
        '∂f/∂x = 0 at a point. Can f still change there?',
        [
          'No, f is constant everywhere',
          'Yes, when another input changes',
          'Only if x becomes negative',
          'No, every partial must then be 0',
        ],
        1,
        'A partial derivative measures change along one input only.',
      ),
    ],
    cards: [
      [
        'How do you compute ∂f/∂x for f(x, y)?',
        'Differentiate with respect to x while treating y as a constant.',
      ],
      [
        'What are the partials of L(w, b) = (wx + b − y)²?',
        '∂L/∂w = 2(wx + b − y)x and ∂L/∂b = 2(wx + b − y).',
      ],
    ],
  },
  {
    id: 'math-gradient-vector',
    unitId: 'math-calculus',
    title: 'The gradient vector',
    prerequisites: ['math-partial-derivatives', 'math-vectors'],
    summary: 'Collect partial derivatives into a vector that points uphill.',
    paragraphs: [
      'The gradient $\\nabla f$ collects every partial derivative into one vector: for $f(x, y)$, $\\nabla f = [\\frac{\\partial f}{\\partial x}, \\frac{\\partial f}{\\partial y}]$. For $f(x, y) = x^2 + 3y^2$, $\\nabla f = [2x, 6y]$, and at $(1, 2)$ it is $[2, 12]$. Its coordinates are in the same order as the inputs.',
      'At a point, the gradient points in the direction of steepest increase of $f$, and its negative points in the direction of steepest decrease. The sign of a coordinate says whether increasing that input raises or lowers $f$, and its size says how sensitive $f$ is to that input. Where every partial is zero, the gradient is the zero vector and the function is locally flat.',
    ],
    example: worked(
      'f(w₁, w₂) = (w₁ − 1)² + 2w₂²\n∇f = [2(w₁ − 1), 4w₂]\nevaluate at (3, −1)',
      '∇f(3, −1) = [4, −4]',
      'Raising w₁ increases f there, and raising w₂ decreases it. To go downhill, move against the gradient: decrease w₁ and increase w₂.',
    ),
    questions: [
      q(
        'f(x, y) = x² + y². What is ∇f at (3, −4)?',
        ['[3, −4]', '[9, 16]', '[6, −8]', '[6, 8]'],
        2,
        '∇f = [2x, 2y] = [6, −8].',
      ),
      q(
        '∇f at a point is [5, 0]. Which move decreases f fastest?',
        ['Increase x', 'Decrease x', 'Increase y', 'Decrease y'],
        1,
        'Steepest decrease is opposite the gradient, which points along +x.',
      ),
      q(
        'What does a zero gradient mean at a point?',
        [
          'Every partial derivative is zero there',
          'The function value is zero there',
          'Every input is zero there',
          'f is undefined there',
        ],
        0,
        'The gradient is the vector of partials; it is zero only when all of them are.',
      ),
      q(
        'f(a, b) = 3a + ab. What is ∇f at (2, 5)?',
        ['[3, 2]', '[2, 8]', '[8, 5]', '[8, 2]'],
        3,
        '∂f/∂a = 3 + b = 8 and ∂f/∂b = a = 2.',
      ),
    ],
    cards: [
      [
        'What is the gradient of f(x, y)?',
        'The vector [∂f/∂x, ∂f/∂y] of its partial derivatives.',
      ],
      [
        'Which direction does the negative gradient point?',
        'The direction of steepest local decrease of the function.',
      ],
    ],
  },
  {
    id: 'math-gradients',
    unitId: 'math-calculus',
    title: 'Gradient descent steps',
    prerequisites: ['math-gradient-vector'],
    summary: 'Use local rates of change to reduce a differentiable objective.',
    paragraphs: [
      "A derivative describes how a function changes near a point. For $f(w) = (w - 3)^2$, $f'(w) = 2(w - 3)$. The derivative is zero at the minimum $w = 3$.",
      'For several parameters, the gradient collects the partial derivatives in a vector. Gradient descent updates parameters with $w_{\\text{new}} = w - \\text{learning\\_rate} \\times \\text{gradient}$. A step that is too large may increase the objective or diverge.',
    ],
    example: {
      code: 'w = 0.0\nlearning_rate = 0.1\ngradient = 2 * (w - 3)\nw -= learning_rate * gradient\nprint(round(w, 2))',
      output: '0.6',
      explanation:
        'Use local rates of change to reduce a differentiable objective.',
    },
    questions: [
      q(
        'For (w − 3)², the derivative at w = 0 is:',
        ['-6', '6', '0', '9'],
        0,
        '2 × (0 − 3) = −6.',
      ),
      q(
        'Gradient descent subtracts the gradient because:',
        [
          'The gradient points toward local increase',
          'The gradient is always negative',
          'Every objective is linear',
          'It removes the learning rate',
        ],
        0,
        'The gradient gives the direction of steepest local increase; its negative points toward decrease.',
      ),
      q(
        'A very large learning rate can:',
        [
          'Guarantee the minimum',
          'Overshoot and diverge',
          'Make all derivatives zero',
          'Remove the need for iterations',
        ],
        1,
        'A step can leave the region where the local approximation is useful.',
      ),
    ],
    exercise: {
      prompt:
        'Starting at w = 1.0, take one gradient step on $(w - 5)^2$ using learning_rate = 0.25. Store the new value in w.',
      starter: 'w = 1.0\nlearning_rate = 0.25\n# Update w.',
      solution:
        'w = 1.0\nlearning_rate = 0.25\nw -= learning_rate * 2 * (w - 5)',
      tests: 'assert abs(w - 3.0) < 1e-9',
    },
    cards: [
      [
        'What is a gradient?',
        'A vector of partial derivatives, one for each parameter.',
      ],
      [
        'What is the gradient descent update?',
        'parameters_new = parameters − learning_rate × gradient.',
      ],
    ],
  },
  {
    id: 'math-critical-points',
    unitId: 'math-calculus',
    title: 'Critical points and minima',
    prerequisites: ['math-sum-product-rules'],
    summary:
      'Find where a derivative is zero and decide whether it is a minimum or a maximum.',
    paragraphs: [
      "A critical point is an input where $f'(x) = 0$: the tangent line is flat. For $f(x) = x^2 - 6x + 10$, $f'(x) = 2x - 6$, so the only critical point is $x = 3$, where $f(3) = 1$. Local minima and maxima of a smooth function occur at critical points.",
      "The sign of the derivative on each side classifies the point. If $f'$ changes from negative to positive, $f$ decreases and then increases: a local minimum. Positive to negative means a local maximum. If the sign does not change, as for $x^3$ at $x = 0$, the flat point is neither. A local minimum is the lowest value nearby; the global minimum is the lowest value anywhere.",
    ],
    example: worked(
      'f(x) = x³ − 3x\nf′(x) = 3x² − 3 = 0 at x = −1 and x = 1\nf′(−2) = 9, f′(0) = −3, f′(2) = 9',
      'x = −1 is a local maximum; x = 1 is a local minimum',
      'The derivative is positive, then negative, then positive again, so f rises into x = −1, falls until x = 1, and rises after it.',
    ),
    questions: [
      q(
        'g(x) = x² + 4x. Where is its critical point?',
        ['$x = 4$', '$x = 2$', '$x = 0$', '$x = -2$'],
        3,
        'g′(x) = 2x + 4, which is 0 at x = −2.',
      ),
      q(
        'f′ is negative just left of x = 5 and positive just right of it. What is x = 5?',
        [
          'A local maximum',
          'A point where f(5) = 0',
          'A local minimum',
          'Neither a minimum nor a maximum',
        ],
        2,
        'f decreases into x = 5 and increases after it.',
      ),
      q(
        'f(x) = x³ has f′(0) = 0. Why is x = 0 not a minimum?',
        [
          'f′ is positive on both sides, so f keeps increasing',
          'f(0) is not zero',
          'x³ has no derivative at 0',
          'Every critical point is a maximum',
        ],
        0,
        'Without a sign change, the flat point is neither a minimum nor a maximum.',
      ),
      q(
        'h(x) = −x² + 8x. What is its maximum value?',
        ['4', '16', '8', '32'],
        1,
        'h′(x) = −2x + 8 = 0 at x = 4, and h(4) = −16 + 32 = 16.',
      ),
    ],
    cards: [
      ['What is a critical point?', 'An input where f′(x) = 0.'],
      [
        'How do you tell a local minimum from a local maximum?',
        'A minimum has f′ changing from negative to positive; a maximum, from positive to negative.',
      ],
    ],
  },
  {
    id: 'math-convexity',
    unitId: 'math-calculus',
    title: 'Convex functions',
    prerequisites: ['math-critical-points', 'math-gradient-vector'],
    summary:
      'Recognize bowl-shaped functions whose flat points are global minima.',
    paragraphs: [
      "A function is convex when every chord lies on or above its graph: the straight segment between any two points of the graph never dips below the curve. For a one-input function with a second derivative (the derivative of $f'$), convexity means $f''$ is never negative. $x^2$, $e^x$, and $(w - 3)^2$ are convex; $-x^2$ and $x^3$ are not.",
      'Convexity makes minimizing reliable. For a convex differentiable function, any point where the gradient is zero is a global minimum, so moving downhill cannot get trapped. A nonconvex function can have several local minima, maxima, and saddle points; at a saddle the gradient is zero but the point is a minimum in one direction and a maximum in another, as for $f(x, y) = x^2 - y^2$ at $(0, 0)$.',
    ],
    example: worked(
      'f(x) = x⁴ − 2x²\nf′(x) = 4x³ − 4x = 0 at x = −1, 0, 1\nf(−1) = −1, f(0) = 0, f(1) = −1',
      'not convex: x = 0 is a flat local maximum between two minima',
      'The chord from (−1, −1) to (1, −1) passes below the graph point (0, 0), which a convex function never allows.',
    ),
    questions: [
      q(
        'Which function is convex?',
        ['−x² + 1', '$x^3$', '(x − 2)² + 7', '$x^4 - 2x^2$'],
        2,
        'A shifted parabola opening upward is bowl-shaped everywhere.',
      ),
      q(
        'f is convex and differentiable, and ∇f = 0 at w*. What can you conclude?',
        [
          'w* may be a saddle point',
          'w* is a maximum',
          'f(w*) = 0',
          'w* is a global minimum',
        ],
        3,
        'For a convex differentiable function, every flat point is a global minimum.',
      ),
      q(
        'f(x, y) = x² − y² has a zero gradient at (0, 0). What kind of point is it?',
        [
          'A saddle point',
          'A global minimum',
          'A global maximum',
          'Not a critical point',
        ],
        0,
        'f increases along x and decreases along y from that point.',
      ),
      q(
        'Gradient descent on a nonconvex loss stops where the gradient is zero. Why might that not be the best solution?',
        [
          'Zero gradients occur only at global minima',
          'It may be a local minimum or a saddle point',
          'The loss must be negative there',
          'Gradients are never exactly zero',
        ],
        1,
        'Nonconvex functions can be flat at points that are not the lowest overall.',
      ),
    ],
    cards: [
      [
        'What does convexity guarantee about flat points?',
        'For a convex differentiable function, any point with zero gradient is a global minimum.',
      ],
      [
        'What is a saddle point?',
        'A point with zero gradient that is a minimum along some directions and a maximum along others.',
      ],
    ],
  },
  {
    id: 'math-vectors',
    unitId: 'math-linear-algebra',
    title: 'Vectors and dot products',
    prerequisites: ['ranges', 'indexing', 'generator-expressions'],
    summary:
      'Represent features as ordered coordinates and combine them with weights.',
    paragraphs: [
      'A vector is an ordered collection of numbers. In a model, its coordinates might represent age, distance, and price. The position and units of each coordinate matter.',
      'The dot product multiplies corresponding coordinates and sums the products. For $x = [2, 3]$ and $w = [4, 1]$, $x \\cdot w = 2 \\times 4 + 3 \\times 1 = 11$. Vectors must have the same length; silently truncating an input loses information.',
    ],
    example: {
      code: 'x = [2, 3]\nw = [4, 1]\nprint(sum(x[i] * w[i] for i in range(len(x))))',
      output: '11',
      explanation:
        'Represent features as ordered coordinates and combine them with weights.',
    },
    questions: [
      q(
        'The dot product of [1, 2] and [3, 4] is:',
        ['7', '11', '[3, 8]', '10'],
        1,
        '1 × 3 + 2 × 4 = 11.',
      ),
      q(
        'What must hold for an ordinary dot product?',
        [
          'Both vectors are sorted',
          'Both vectors have equal length',
          'All coordinates are positive',
          'Both vectors have mean zero',
        ],
        1,
        'Every coordinate needs a corresponding coordinate in the other vector.',
      ),
      q(
        'Swapping only two feature coordinates while keeping weights fixed:',
        [
          'Always preserves a prediction',
          'Makes the vector longer',
          'Can change the weighted sum',
          'Normalizes the inputs',
        ],
        2,
        'Weights are attached to specific coordinate positions.',
      ),
    ],
    exercise: {
      prompt: 'Compute dot_value for x = [2, -1, 3] and w = [4, 2, 1].',
      starter: 'x = [2, -1, 3]\nw = [4, 2, 1]\ndot_value = 0',
      solution:
        'x = [2, -1, 3]\nw = [4, 2, 1]\ndot_value = sum(x[i] * w[i] for i in range(len(x)))',
      tests: 'assert dot_value == 9',
    },
    cards: [
      [
        'What is the dot product of two equal-length vectors?',
        'The sum of products of corresponding coordinates.',
      ],
      [
        'Why preserve feature order?',
        'Each model weight has a specific feature meaning; reordering only the inputs changes that relationship.',
      ],
    ],
  },
  {
    id: 'math-vector-norm',
    unitId: 'math-linear-algebra',
    title: 'Vector length and norms',
    prerequisites: ['math-vectors', 'accumulators'],
    summary: "Measure a vector's length with the Euclidean norm.",
    paragraphs: [
      "The Euclidean norm $\\lVert v \\rVert$ is the length of $v$: the square root of the sum of its squared coordinates. For $v = [3, 4]$, $\\lVert v \\rVert = \\sqrt{9 + 16} = 5$. It equals $\\sqrt{v \\cdot v}$, the square root of $v$'s dot product with itself. Only the zero vector has norm 0. In Python, x ** 0.5 is the square root of x.",
      'Scaling a vector scales its length: $\\lVert cv \\rVert = |c| \\lVert v \\rVert$. Dividing a nonzero vector by its norm gives a unit vector, with length 1, pointing the same way. The L1 norm, the sum of absolute coordinates, is another length: for $[3, -4]$ it is 7, while the Euclidean (L2) norm is 5. Ridge regularization penalizes the squared L2 norm of the weights; lasso penalizes their L1 norm.',
    ],
    example: {
      code: 'v = [3, -4]\ntotal = 0\nfor x in v:\n    total += x * x\nprint(total ** 0.5)',
      output: '5.0',
      explanation:
        'The squares 9 and 16 sum to 25, and its square root is 5.0.',
    },
    questions: [
      q(
        'What is the Euclidean norm of [1, 2, 2]?',
        ['5', '3', '9', '√5'],
        1,
        '√(1 + 4 + 4) = √9 = 3.',
      ),
      q(
        '‖v‖ = 4. What is ‖−3v‖?',
        ['12', '−12', '1', '7'],
        0,
        'Scaling by −3 multiplies the length by |−3| = 3; a length is never negative.',
      ),
      q(
        'Which vector is a unit vector?',
        ['[1, 1]', '[0.5, 0.5]', '[0.6, 0.8]', '$[2, 0]$'],
        2,
        '0.36 + 0.64 = 1, so its length is 1.',
      ),
    ],
    exercise: {
      prompt: 'Set norm_value to the Euclidean norm of v = [2, -3, 6].',
      starter: 'v = [2, -3, 6]\nnorm_value = 0',
      solution:
        'v = [2, -3, 6]\ntotal = 0\nfor x in v:\n    total += x * x\nnorm_value = total ** 0.5',
      tests: 'assert abs(norm_value - 7.0) < 1e-9',
    },
    cards: [
      [
        'How is the Euclidean norm of v computed?',
        'The square root of the sum of squared coordinates, √(v · v).',
      ],
      ['What is ‖cv‖?', '|c| ‖v‖: scaling multiplies the length by |c|.'],
    ],
  },
  {
    id: 'math-distance',
    unitId: 'math-linear-algebra',
    title: 'Euclidean distance',
    prerequisites: ['math-vector-norm'],
    summary:
      'Measure how far apart two observations are as the norm of their difference.',
    paragraphs: [
      'The Euclidean distance between $a$ and $b$ is $\\lVert a - b \\rVert$: subtract coordinate by coordinate, square, sum, and take the square root. For $a = [1, 5]$ and $b = [4, 1]$, the differences are −3 and 4, so the distance is 5. Distance is symmetric, and it is 0 only when the two points are equal.',
      'To find the nearest of several points, comparing squared distances is enough: the square root is increasing, so it never changes which distance is smallest. Distances depend on units. If one feature is measured in meters and another in thousands of dollars, the larger-scaled feature dominates, so distance-based methods usually standardize features first.',
    ],
    example: {
      code: 'a = [1, 5]\nb = [4, 1]\ntotal = 0\nfor i in range(len(a)):\n    total += (a[i] - b[i]) ** 2\nprint(total, total ** 0.5)',
      output: '25 5.0',
      explanation:
        'The squared differences 9 and 16 sum to 25, the squared distance; the distance is its square root, 5.0.',
    },
    questions: [
      q(
        'What is the distance between [0, 0, 0] and [2, 3, 6]?',
        ['11', '49', '7', '√11'],
        2,
        '√(4 + 9 + 36) = √49 = 7.',
      ),
      q(
        "A point's squared distances to centers A, B, and C are 10, 4, and 9. Which center is nearest?",
        ['C', 'A', 'Take square roots first', 'B'],
        3,
        'The square root preserves order, so the smallest squared distance identifies the nearest center.',
      ),
      q(
        'One feature ranges over thousands and another between 0 and 1. What happens to unscaled distances?',
        [
          'The large-scale feature dominates them',
          'The small-scale feature dominates them',
          'Both features count equally',
          'Distances become negative',
        ],
        0,
        'Squared differences in the large-scale feature dwarf those in the small one.',
      ),
    ],
    exercise: {
      prompt:
        'Set distance to the Euclidean distance between a = [2, -1, 4] and b = [5, 3, 4].',
      starter: 'a = [2, -1, 4]\nb = [5, 3, 4]\ndistance = 0',
      solution:
        'a = [2, -1, 4]\nb = [5, 3, 4]\ntotal = 0\nfor i in range(len(a)):\n    total += (a[i] - b[i]) ** 2\ndistance = total ** 0.5',
      tests: 'assert abs(distance - 5.0) < 1e-9',
    },
    cards: [
      [
        'How is the Euclidean distance between a and b computed?',
        '‖a − b‖: the square root of the sum of squared coordinate differences.',
      ],
      [
        'Why can nearest-point searches skip the square root?',
        'The square root is increasing, so squared distances have the same order.',
      ],
    ],
  },
  {
    id: 'math-cosine-similarity',
    unitId: 'math-linear-algebra',
    title: 'Cosine similarity and orthogonality',
    prerequisites: ['math-vector-norm'],
    summary:
      'Compare the directions of two vectors regardless of their lengths.',
    paragraphs: [
      'The cosine similarity of nonzero vectors $a$ and $b$ is $(a \\cdot b) / (\\lVert a \\rVert \\lVert b \\rVert)$, the cosine of the angle between them. It is 1 when they point the same way, 0 when they are perpendicular (orthogonal), and −1 when they point in opposite directions. For $[1, 0]$ and $[1, 1]$, it is $1 / \\sqrt{2} \\approx 0.707$: an angle of 45°.',
      'Two vectors are orthogonal exactly when their dot product is 0, as for $[2, 1]$ and $[-1, 2]$. Cosine similarity ignores length: scaling either vector by a positive number leaves it unchanged, while the dot product grows with length. Text embeddings and recommenders use it to compare direction, such as a mix of topics, rather than magnitude.',
    ],
    example: {
      code: 'a = [3, 4]\nb = [6, 8]\ndot = 0\naa = 0\nbb = 0\nfor i in range(len(a)):\n    dot += a[i] * b[i]\n    aa += a[i] * a[i]\n    bb += b[i] * b[i]\nprint(dot / (aa ** 0.5 * bb ** 0.5))',
      output: '1.0',
      explanation:
        'b = 2a points the same way, so a · b = 50 equals ‖a‖ ‖b‖ = 5 × 10 and the cosine similarity is 1.0.',
    },
    questions: [
      q(
        'What is the cosine similarity of [1, 2] and [−2, 1]?',
        ['1', '$-1$', '0.5', '0'],
        3,
        'The dot product is −2 + 2 = 0, so the vectors are orthogonal.',
      ),
      q(
        'Which pair of vectors is orthogonal?',
        [
          '[1, 1] and [1, −1]',
          '[1, 2] and [2, 4]',
          '[3, 0] and [1, 1]',
          '[1, 1] and [2, 2]',
        ],
        0,
        '1 × 1 + 1 × (−1) = 0.',
      ),
      q(
        'Doubling a gives 2a. How does the cosine similarity of 2a and b compare with that of a and b?',
        ['It doubles', 'It halves', 'It is unchanged', 'It becomes 1'],
        2,
        'The factor 2 appears in both the dot product and ‖2a‖, so it cancels.',
      ),
    ],
    exercise: {
      prompt:
        'Set similarity to the cosine similarity of a = [1, 2, 2] and b = [0, 3, 4].',
      starter: 'a = [1, 2, 2]\nb = [0, 3, 4]\nsimilarity = 0',
      solution:
        'a = [1, 2, 2]\nb = [0, 3, 4]\ndot = 0\naa = 0\nbb = 0\nfor i in range(len(a)):\n    dot += a[i] * b[i]\n    aa += a[i] * a[i]\n    bb += b[i] * b[i]\nsimilarity = dot / (aa ** 0.5 * bb ** 0.5)',
      tests: 'assert abs(similarity - 14 / 15) < 1e-9',
    },
    cards: [
      [
        'How is cosine similarity computed?',
        '(a · b) / (‖a‖ ‖b‖), the cosine of the angle between a and b.',
      ],
      ['When are two vectors orthogonal?', 'When their dot product is 0.'],
    ],
  },
  {
    id: 'math-matrices',
    unitId: 'math-linear-algebra',
    title: 'Matrices, shapes, and transposes',
    prerequisites: ['math-vectors'],
    summary:
      'Store observations as rows of a matrix and swap rows with columns.',
    paragraphs: [
      'A matrix is a rectangular array of numbers with $m$ rows and $n$ columns; its shape is $m \\times n$. The entry $A_{ij}$ sits in row $i$ and column $j$, counting from 1 in math notation. A data matrix $X$ conventionally stores one observation per row and one feature per column, so 100 observations of 3 features form a $100 \\times 3$ matrix whose rows are feature vectors.',
      'The transpose $A^\\top$ turns rows into columns: $(A^\\top)_{ij} = A_{ji}$, so a $2 \\times 3$ matrix becomes $3 \\times 2$, and transposing twice returns the original. A square matrix equal to its own transpose is symmetric. In Python a matrix can be a list of row lists, where A[1][2] is the entry in the second row and third column because positions start at 0.',
    ],
    example: worked(
      'A = [[1, 2, 3],\n     [4, 5, 6]]',
      'shape 2 × 3, A₂₃ = 6, Aᵀ = [[1, 4], [2, 5], [3, 6]]',
      'Row 2, column 3 holds 6. Each row of Aᵀ is a column of A, so Aᵀ has 3 rows and 2 columns.',
    ),
    questions: [
      q(
        'A dataset has 250 observations of 4 features. What is the shape of its data matrix X?',
        ['4 × 250', '250 × 4', '254 × 1', '1000 × 1'],
        1,
        'One row per observation and one column per feature.',
      ),
      q(
        'B has shape 3 × 5. What is the shape of Bᵀ?',
        ['$3 \\times 5$', '15 × 1', '5 × 5', '$5 \\times 3$'],
        3,
        'Transposing swaps the numbers of rows and columns.',
      ),
      q(
        'In Python, A = [[7, 8], [9, 10], [11, 12]]. What is A[2][0]?',
        ['8', '9', '11', '12'],
        2,
        'A[2] is the third row [11, 12], and position 0 of it is 11.',
      ),
      q(
        'A square matrix satisfies A = Aᵀ. What must hold?',
        [
          'A_ij = A_ji for every i and j',
          'All entries are equal',
          'Every entry is zero',
          'A has a single row',
        ],
        0,
        'Equality with the transpose means the matrix mirrors across its diagonal.',
      ),
    ],
    cards: [
      [
        'What is the shape of a data matrix?',
        'observations × features: one row per observation.',
      ],
      [
        'What does the transpose do?',
        'Turns rows into columns: (Aᵀ)_ij = A_ji.',
      ],
    ],
  },
  {
    id: 'math-matrix-vector',
    unitId: 'math-linear-algebra',
    title: 'Matrix–vector products',
    prerequisites: ['math-matrices'],
    summary: 'Multiply a matrix by a vector as a stack of dot products.',
    paragraphs: [
      'For an $m \\times n$ matrix $A$ and a vector $x$ with $n$ coordinates, $Ax$ is the vector of $m$ dot products: entry $i$ is row $i$ of $A$ dotted with $x$. For $A = [[1, 2], [3, 4]]$ and $x = [5, 6]$, $$Ax = \\begin{bmatrix} 1 & 2 \\\\ 3 & 4 \\end{bmatrix} \\begin{bmatrix} 5 \\\\ 6 \\end{bmatrix} = \\begin{bmatrix} 1 \\times 5 + 2 \\times 6 \\\\ 3 \\times 5 + 4 \\times 6 \\end{bmatrix} = \\begin{bmatrix} 17 \\\\ 39 \\end{bmatrix}.$$ The number of columns of $A$ must equal the length of $x$.',
      "This is how a linear model predicts for many observations at once. With data matrix $X$ (one row per observation) and weight vector $w$, $Xw$ lists every observation's weighted sum, and $Xw + b$ adds the intercept to each. A $100 \\times 3$ data matrix times a 3-coordinate weight vector gives 100 predictions.",
    ],
    example: worked(
      'X = [[1, 2], [0, 3], [4, 1]], w = [2, −1], b = 5\nrow dot products: 1×2 + 2×(−1), 0×2 + 3×(−1), 4×2 + 1×(−1)',
      'Xw = [0, −3, 7], Xw + b = [5, 2, 12]',
      'Each prediction is one row of X dotted with w, then shifted by the intercept 5.',
    ),
    questions: [
      q(
        'What is [[2, 0], [1, 3]] times [4, 5]?',
        ['[8, 15]', '[8, 19]', '[13, 15]', '[6, 8]'],
        1,
        'Row dot products: 2 × 4 + 0 × 5 = 8 and 1 × 4 + 3 × 5 = 19.',
      ),
      q(
        'A has shape 4 × 3. What length must x have for Ax to be defined?',
        ['4', '7', '12', '3'],
        3,
        'Each row of A has 3 entries, so x needs 3 coordinates.',
      ),
      q(
        'X has shape 50 × 6 and w has 6 coordinates. What does Xw contain?',
        [
          '50 numbers, one per observation',
          '6 numbers, one per feature',
          '300 numbers',
          'One number',
        ],
        0,
        'Each of the 50 rows produces one dot product with w.',
      ),
      q(
        'The rows of A are [1, 1] and [1, −1]. What is A times [3, 1]?',
        ['[3, 1]', '$[4, -2]$', '[4, 2]', '[2, 4]'],
        2,
        '1 × 3 + 1 × 1 = 4 and 1 × 3 − 1 × 1 = 2.',
      ),
    ],
    cards: [
      [
        'How is Ax computed?',
        'Entry i is the dot product of row i of A with x.',
      ],
      [
        'What does Xw + b represent for a linear model?',
        'The predictions for every row of X: each row dotted with w, plus the intercept.',
      ],
    ],
  },
  {
    id: 'math-matrix-multiplication',
    unitId: 'math-linear-algebra',
    title: 'Matrix multiplication',
    prerequisites: ['math-matrix-vector'],
    summary:
      'Multiply matrices by combining rows of the first with columns of the second.',
    paragraphs: [
      'For $A$ of shape $m \\times n$ and $B$ of shape $n \\times p$, $AB$ has shape $m \\times p$. Its entry in row $i$ and column $j$ is row $i$ of $A$ dotted with column $j$ of $B$. The inner sizes must match and the outer sizes give the result. Each column of $AB$ is $A$ times the matching column of $B$.',
      'Order matters: $AB$ and $BA$ usually differ, and one may not even be defined. A dense neural layer computes $XW$, with $X$ of shape $\\text{batch} \\times \\text{inputs}$ and $W$ of shape $\\text{inputs} \\times \\text{outputs}$, giving $\\text{batch} \\times \\text{outputs}$. The transpose of a product reverses the order: $(AB)^\\top = B^\\top A^\\top$.',
    ],
    example: worked(
      'A = [[1, 2], [3, 4]], B = [[0, 1], [1, 0]]\n(AB)₁₁ = [1, 2] · [0, 1] = 2',
      'AB = [[2, 1], [4, 3]], BA = [[3, 4], [1, 2]]',
      'Multiplying by B on the right swaps the columns of A; on the left it swaps the rows, so AB ≠ BA.',
    ),
    questions: [
      q(
        'A is 2 × 3 and B is 3 × 4. What is the shape of AB?',
        ['$3 \\times 3$', '4 × 2', '2 × 4', 'Undefined'],
        2,
        'The inner 3s match; the outer sizes 2 and 4 give the shape.',
      ),
      q(
        'A is 2 × 3 and B is 3 × 4. What about BA?',
        ['4 × 3', 'Undefined, because 4 ≠ 2', '3 × 2', '2 × 4'],
        1,
        'B has 4 columns but A has only 2 rows, so the inner sizes differ.',
      ),
      q(
        'What is [[1, 0], [2, 1]] times [[3, 1], [0, 2]]?',
        [
          '[[3, 1], [6, 4]]',
          '[[3, 0], [0, 2]]',
          '[[3, 1], [6, 2]]',
          '[[5, 3], [2, 2]]',
        ],
        0,
        'Row [2, 1] dotted with the columns [3, 0] and [1, 2] gives 6 and 4.',
      ),
      q(
        'What is (AB)ᵀ?',
        ['$A^\\top B^\\top$', '$BA$', 'AB', '$B^\\top A^\\top$'],
        3,
        'Transposing a product reverses the order of the factors.',
      ),
    ],
    cards: [
      [
        'What is the shape rule for AB?',
        '(m × n)(n × p) = m × p: inner sizes match, outer sizes remain.',
      ],
      [
        'Is matrix multiplication commutative?',
        'No. AB and BA usually differ, and one may be undefined.',
      ],
    ],
  },
  {
    id: 'math-identity-inverse',
    unitId: 'math-linear-algebra',
    title: 'Identity and inverse matrices',
    prerequisites: ['math-matrix-multiplication'],
    summary:
      'Recognize the matrix that changes nothing and the matrix that undoes another.',
    paragraphs: [
      'The identity matrix $I$ has 1s on its diagonal and 0s elsewhere. Multiplying by it changes nothing: $AI = IA = A$ and $Ix = x$. A scalar multiple $\\lambda I$ multiplies every vector by $\\lambda$.',
      'A square matrix $A$ is invertible when some $A^{-1}$ satisfies $A^{-1}A = AA^{-1} = I$; then $Ax = b$ has the single solution $x = A^{-1}b$. For a $2 \\times 2$ matrix $[[a, b], [c, d]]$, the determinant is $ad - bc$. The inverse exists exactly when the determinant is nonzero, and it is $$\\frac{1}{ad - bc} \\begin{bmatrix} d & -b \\\\ -c & a \\end{bmatrix}.$$ A zero determinant means $A$ sends some nonzero vector to 0, so its effect cannot be undone.',
    ],
    example: worked(
      'A = [[2, 1], [5, 3]]\ndet = 2 × 3 − 1 × 5 = 1\nA⁻¹ = [[3, −1], [−5, 2]]',
      'A⁻¹A = [[1, 0], [0, 1]]',
      'Swap the diagonal entries, negate the off-diagonal entries, and divide by the determinant 1. Check one entry: [3, −1] · [2, 5] = 6 − 5 = 1.',
    ),
    questions: [
      q(
        'What is the 2 × 2 identity matrix times [7, −2]?',
        ['[1, 1]', '[7, −2]', '[0, 0]', '[−2, 7]'],
        1,
        'The identity leaves every vector unchanged.',
      ),
      q(
        'What is the determinant of [[4, 6], [2, 3]]?',
        ['24', '6', '12', '0'],
        3,
        '4 × 3 − 6 × 2 = 0, so this matrix has no inverse.',
      ),
      q(
        'Which matrix has no inverse?',
        [
          '$[[1, 0], [0, 1]]$',
          '[[2, 0], [0, 5]]',
          '[[1, 2], [2, 4]]',
          '$[[0, 1], [1, 0]]$',
        ],
        2,
        'Its determinant is 1 × 4 − 2 × 2 = 0; the second row is twice the first.',
      ),
      q(
        'A is invertible and Ax = b. Which expression gives x?',
        ['A⁻¹b', 'bA⁻¹', 'Ab', 'AᵀA'],
        0,
        'Multiply both sides on the left by A⁻¹: A⁻¹Ax = x.',
      ),
    ],
    cards: [
      [
        'What does the identity matrix do?',
        'AI = IA = A: it leaves matrices and vectors unchanged.',
      ],
      [
        'When is a 2 × 2 matrix [[a, b], [c, d]] invertible?',
        'When its determinant ad − bc is not zero.',
      ],
    ],
  },
  {
    id: 'math-eigenvectors',
    unitId: 'math-linear-algebra',
    title: 'Eigenvectors and principal directions',
    prerequisites: ['math-identity-inverse', 'math-covariance'],
    summary:
      'Find the directions a matrix only stretches and read them as PCA directions.',
    paragraphs: [
      'A nonzero vector $v$ is an eigenvector of a square matrix $A$ when $Av = \\lambda v$: $A$ only stretches $v$, by the eigenvalue $\\lambda$, without turning it. For $A = [[2, 1], [1, 2]]$, $A[1, 1] = [3, 3] = 3[1, 1]$ and $A[1, -1] = [1, -1]$, so the eigenvalues are 3 and 1. Eigenvalues solve $\\det(A - \\lambda I) = 0$; here $(2 - \\lambda)^2 - 1 = 0$ gives $\\lambda = 3$ or $\\lambda = 1$.',
      "A covariance matrix holds each feature's variance on its diagonal and each pair's covariance off it, so it is symmetric. Its eigenvectors are perpendicular directions, and each eigenvalue is the variance of the data along its eigenvector. PCA keeps the eigenvectors with the largest eigenvalues; an eigenvalue divided by the sum of all eigenvalues is that component's share of the total variance.",
    ],
    example: worked(
      'Σ = [[3, 1], [1, 3]]\nΣ[1, 1] = [4, 4] = 4[1, 1]\nΣ[1, −1] = [2, −2] = 2[1, −1]',
      'eigenvalues 4 and 2; the first component explains 4 / 6 ≈ 67% of the variance',
      'The data vary most along [1, 1], with variance 4; the perpendicular direction [1, −1] carries variance 2.',
    ),
    questions: [
      q(
        'For A = [[4, 0], [0, 1]], which vector is an eigenvector with eigenvalue 4?',
        ['[0, 1]', '[1, 1]', '[1, 0]', '[4, 1]'],
        2,
        'A[1, 0] = [4, 0] = 4[1, 0].',
      ),
      q(
        'A covariance matrix has eigenvalues 6, 3, and 1. What share of the variance does the first principal component explain?',
        ['6%', '30%', '90%', '60%'],
        3,
        '6 / (6 + 3 + 1) = 0.6.',
      ),
      q(
        'For v = [1, −2], Av = [−2, 4]. What is the eigenvalue of v?',
        ['−2', '2', '4', '−4'],
        0,
        '[−2, 4] = −2 × [1, −2].',
      ),
      q(
        'A covariance matrix is [[5, 2], [2, 1]]. What is the variance of the first feature?',
        ['2', '5', '1', '7'],
        1,
        'Diagonal entries are variances; the off-diagonal 2 is the covariance.',
      ),
    ],
    cards: [
      [
        'What is an eigenvector of A?',
        'A nonzero vector v with Av = λv for some number λ, its eigenvalue.',
      ],
      [
        'What do eigenvalues of a covariance matrix measure in PCA?',
        'The variance of the data along each eigenvector (principal direction).',
      ],
    ],
  },
  {
    id: 'math-likelihood',
    unitId: 'math-probability-models',
    title: 'Likelihood and maximum likelihood',
    prerequisites: ['math-bernoulli-binomial', 'math-logarithms'],
    summary:
      'Score parameter values by how probable they make the observed data.',
    paragraphs: [
      'The likelihood of a parameter value is the probability of the observed data, computed as if that value were true. For independent observations it is a product. After observing 1, 1, 0 from Bernoulli trials, $L(p) = p \\times p \\times (1 - p)$, so $L(0.5) = 0.125$ and $L(2/3) \\approx 0.148$: $p = 2/3$ explains the data better. Maximum likelihood estimation picks the value with the largest likelihood; for $k$ successes in $n$ trials it is $p = k / n$.',
      'Products of many probabilities become tiny, so we work with the log-likelihood: log turns the product into a sum, and because log is increasing, the same $p$ maximizes both. Maximizing the log-likelihood is the same as minimizing the negative log-likelihood. For one binary label $y$ and predicted probability $p$, the negative log-likelihood is $-(y \\ln p + (1 - y) \\ln(1 - p))$, the binary cross-entropy loss used to train classifiers.',
    ],
    example: worked(
      'data 1, 0, 1, 1 (k = 3 successes in n = 4)\nL(0.5) = 0.5⁴ = 0.0625\nL(0.75) = 0.75³ × 0.25 ≈ 0.105',
      'maximum likelihood estimate p = 3/4',
      'p = 0.75 makes the observed data more probable than p = 0.5, and k / n = 3/4 is the value that makes it most probable.',
    ),
    questions: [
      q(
        'A coin shows 7 heads in 10 independent flips. What is the maximum likelihood estimate of P(heads)?',
        ['0.5', '0.7', '0.3', '7'],
        1,
        'For Bernoulli trials the estimate is k / n = 7 / 10.',
      ),
      q(
        'Why maximize the log-likelihood instead of the likelihood?',
        [
          'It always equals the likelihood',
          'It makes probabilities larger than 1',
          'It removes the need for data',
          'It has the same maximizer and turns products into sums',
        ],
        3,
        'log is increasing, so the maximizer is unchanged, and log(xy) = log x + log y.',
      ),
      q(
        'A classifier predicts p = 0.9 for a label y = 1. What is its binary cross-entropy?',
        ['0.9', '−ln(0.1) ≈ 2.303', '−ln(0.9) ≈ 0.105', '0.1'],
        2,
        'With y = 1 only the term −ln p remains.',
      ),
      q(
        'A Bernoulli(p) model observes 0, 0, 1. Which expression is the likelihood L(p)?',
        ['(1 − p)²p', 'p²(1 − p)', '(1 − p) + (1 − p) + p', '1/3'],
        0,
        'Independent observations multiply: (1 − p)(1 − p)p.',
      ),
    ],
    cards: [
      [
        'What is the likelihood of a parameter value?',
        'The probability of the observed data computed as if that value were true.',
      ],
      [
        'How is binary cross-entropy related to likelihood?',
        'It is the negative log-likelihood of a binary label under the predicted probability.',
      ],
    ],
  },
];

// Listed in teaching order, so every prerequisite precedes its dependents.
const mathSkills: Skill[] = withTeachingOrder(
  definitions.map((d): Omit<Skill, 'order'> => ({
    id: d.id,
    title: d.title,
    prerequisites: d.prerequisites,
    summary: d.summary,
    courseId,
    unitId: d.unitId,
    domain: 'mathematics',
    estimatedMinutes: 8,
    assessment: {
      requiredTypes: d.exercise ? ['choice', 'code'] : ['choice'],
      reviewAnswers: 2,
    },
    lesson: { paragraphs: d.paragraphs, example: d.example },
    questions: [
      ...d.questions.map((x, i) => ({ ...x, id: `${d.id}-q${i + 1}` })),
      ...(d.exercise
        ? [
            {
              id: `${d.id}-q${d.questions.length + 1}`,
              type: 'code' as const,
              prompt: d.exercise.prompt,
              starterCode: d.exercise.starter,
              solution: d.exercise.solution,
              tests: d.exercise.tests,
              explanation: d.summary,
              hint: d.paragraphs[1],
            },
          ]
        : []),
    ],
    flashcards: d.cards.map(([front, back], i) => ({
      id: `${d.id}-card${i + 1}`,
      skillId: d.id,
      front,
      back,
    })),
  })),
).sort((a, b) => a.order - b.order);
export const quantitativeCatalog: CurriculumCatalog = {
  courses: [
    {
      id: courseId,
      title: 'Quantitative foundations',
      description:
        'The mathematics behind data analysis and machine learning: statistics, probability, functions and exponentials, derivatives and gradients, and vectors and matrices.',
      domain: 'mathematics',
      language: 'python',
      skillIds: mathSkills.map((x) => x.id),
    },
  ],
  units,
  skills: mathSkills,
};
