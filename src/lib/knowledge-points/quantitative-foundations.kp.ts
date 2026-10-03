import type { LessonExample } from '../curriculum';
import {
  choose,
  predictOutput,
  typeNumber,
  typeOutput,
  type KnowledgePointModule,
} from './authoring';

/** A worked calculation shown step by step, without running code. */
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

export const knowledgePoints: KnowledgePointModule = {
  'math-mean': [
    {
      title: 'Compute an arithmetic mean',
      explanation: [
        'The arithmetic mean adds the observations and divides by how many there are. In Python, accumulate the total in a loop, then divide by len(values). The / operator always produces a float, even when the division is exact.',
      ],
      example: {
        code: 'values = [4, 8, 6, 2]\ntotal = 0\nfor value in values:\n    total += value\nprint(total / len(values))',
        output: '5.0',
        explanation:
          'The total is 20 and there are 4 values, so the mean is $20 / 4 = 5.0$.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          'values = [3, 9, 6]\ntotal = 0\nfor value in values:\n    total += value\nprint(total / len(values))',
          '6.0',
          'The total 18 divided by the count 3 is 6.0; / always gives a float.',
        ),
        typeNumber(
          'What is the mean of 10, 20, 20, and 50?',
          25,
          'The sum is 100 and the count is 4, so the mean is 25.',
        ),
        typeOutput(
          'What does this program print?',
          'scores = [7, 5, 9, 3]\ntotal = 0\nfor score in scores:\n    total += score\nprint(total / len(scores))',
          '6.0',
          'The scores sum to 24, and $24 / 4 = 6.0$.',
        ),
        typeNumber(
          'Five observations have mean 12. What is their sum?',
          60,
          '$\\text{mean} = \\text{sum} / \\text{count}$, so $\\text{sum} = 12 \\times 5 = 60$.',
        ),
      ],
    },
    {
      title: 'See how one extreme value moves the mean',
      explanation: [
        'Every observation contributes its full size to the sum, so one very large or very small observation can pull the mean far from the typical values. Adding a value above the current mean raises the mean, adding one below lowers it, and adding one equal to it leaves the mean unchanged.',
      ],
      example: worked(
        'times (minutes): 10, 12, 11, 13\nmean = 46 / 4\nadd a delayed trip of 94: 140 / 5',
        'the mean rises from 11.5 to 28',
        'One unusual trip more than doubles the mean, which is now larger than every ordinary trip.',
      ),
      questions: [
        typeNumber(
          'Four values have mean 10. A fifth value, 10, is added. What is the new mean?',
          10,
          'The new sum is 50 over 5 values, so a value equal to the mean leaves it at 10.',
        ),
        typeNumber(
          'The mean of 2, 3, and 4 is 3. Which added value makes the new mean 6?',
          15,
          'Four values with mean 6 must sum to 24, and $24 - 9 = 15$.',
        ),
        typeOutput(
          'What does this program print?',
          'values = [1, 2, 3, 100]\ntotal = 0\nfor value in values:\n    total += value\nprint(total / len(values))',
          '26.5',
          'The 100 dominates the total of 106, and $106 / 4 = 26.5$.',
        ),
        choose(
          'Daily sales were 5, 6, 5, and 7 units, plus one holiday with 120. Which statement is accurate?',
          [
            'The mean ignores the holiday',
            'The mean equals 5',
            'The mean is larger than every ordinary day',
            'The mean is below every day',
          ],
          2,
          'The sum 143 over 5 days gives 28.6, far above the four ordinary days.',
        ),
      ],
    },
    {
      title: 'Combine groups with a weighted mean',
      explanation: [
        'A weighted mean multiplies each value by its weight, adds the products, and divides by the total weight. To combine group averages, weight each average by its group size: that rebuilds the overall sum. A plain average of the group averages treats a group of 2 like a group of 200.',
      ],
      example: worked(
        'class A: 30 students, mean 70\nclass B: 10 students, mean 90\n(30 × 70 + 10 × 90) / (30 + 10)',
        '75',
        'The overall sum is $2{,}100 + 900 = 3{,}000$ over 40 students. Averaging 70 and 90 directly would give 80, as if the classes were the same size.',
      ),
      questions: [
        choose(
          'Store A has 100 orders averaging \\$20 and store B has 300 orders averaging \\$40. What is the overall average order?',
          ['\\$30', '\\$35', '\\$40', '\\$60'],
          1,
          '$(100 \\times 20 + 300 \\times 40) / 400 = 14{,}000 / 400 = \\$35$.',
        ),
        typeNumber(
          'Homework scores 80 with weight 0.3 and the exam scores 90 with weight 0.7. What is the weighted mean?',
          87,
          '$80 \\times 0.3 + 90 \\times 0.7 = 24 + 63 = 87$; the weights already sum to 1.',
        ),
        choose(
          'Why is $(70 + 90) / 2$ the wrong overall mean for 30 students averaging 70 and 10 students averaging 90?',
          [
            'Means can never be added',
            'It should divide by 40 instead of 2',
            'It ignores the median',
            'It treats both groups as equal in size',
          ],
          3,
          'Each group mean should count once per student, so the larger group needs more weight.',
        ),
        typeNumber(
          'Values 2 and 8 have weights 3 and 1. What is the weighted mean?',
          3.5,
          '$(2 \\times 3 + 8 \\times 1) / (3 + 1) = 14 / 4 = 3.5$.',
        ),
      ],
    },
  ],
  'math-variance': [
    {
      title: 'Measure spread with squared deviations',
      explanation: [
        'A deviation is an observation minus the mean. Deviations always sum to zero, so their plain average says nothing about spread. Squaring makes every deviation nonnegative, and population variance is the mean of the squared deviations.',
      ],
      example: {
        code: 'values = [1, 3, 5, 7]\nmean = 4\nsquares = [(x - mean) ** 2 for x in values]\nprint(squares)\ntotal = 0\nfor square in squares:\n    total += square\nprint(total / len(values))',
        output: '[9, 1, 1, 9]\n5.0',
        explanation:
          'The deviations −3, −1, 1, and 3 cancel, but their squares sum to 20, and $20 / 4 = 5.0$.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          'values = [3, 5, 7]\nmean = 5\nprint([x - mean for x in values])',
          '[-2, 0, 2]',
          'Each deviation keeps its sign: $3 - 5 = -2$, $5 - 5 = 0$, $7 - 5 = 2$.',
        ),
        choose(
          'Why is the average deviation from the mean useless as a measure of spread?',
          [
            'It is always negative',
            'It equals the mean',
            'It is always zero',
            'It ignores the count',
          ],
          2,
          'Positive and negative deviations cancel exactly, whatever the spread.',
        ),
        typeOutput(
          'What does this program print?',
          'values = [2, 6, 4, 8]\nmean = 5\nsquares = [(x - mean) ** 2 for x in values]\ntotal = 0\nfor square in squares:\n    total += square\nprint(total / len(values))',
          '5.0',
          'The squared deviations 9, 1, 1, 9 sum to 20, and $20 / 4 = 5.0$.',
        ),
        typeNumber(
          'What is the population variance of 10, 10, 14, and 14?',
          4,
          'The mean is 12, every squared deviation is 4, and their mean is 4.',
        ),
      ],
    },
    {
      title: 'Return to original units with the standard deviation',
      explanation: [
        'Variance is measured in squared units: centimeters become square centimeters. The standard deviation is the square root of the variance, so it is in the original units and roughly describes a typical distance from the mean. In Python, x ** 0.5 computes the square root of x.',
      ],
      example: {
        code: 'variance = 6.25\nprint(variance ** 0.5)',
        output: '2.5',
        explanation:
          'The square root of 6.25 is 2.5, because $2.5 \\times 2.5 = 6.25$.',
      },
      questions: [
        choose(
          'Heights have variance $16 \\text{ cm}^2$. What is their standard deviation?',
          ['16 cm', '4 cm', '8 cm', '256 cm'],
          1,
          'The standard deviation is $\\sqrt{16} = 4$, in the original unit, centimeters.',
        ),
        typeOutput(
          'What does this program print?',
          'print(49 ** 0.5)',
          '7.0',
          'Raising to the power 0.5 takes a square root, and the result is a float.',
        ),
        choose(
          'Delivery times have a standard deviation of 3 minutes. What is their variance?',
          ['9 square minutes', '3 square minutes', '9 minutes', '1.73 minutes'],
          0,
          'Variance is the square of the standard deviation, in squared units.',
        ),
        choose(
          'Dataset A has standard deviation 2 and dataset B has 5, in the same units. Which statement holds?',
          [
            'B has a larger mean',
            'A has more observations',
            "A's variance is 4 times B's",
            "B's values typically lie farther from their mean",
          ],
          3,
          'Standard deviation measures typical distance from the mean, not location or size.',
        ),
      ],
    },
    {
      title: 'Choose between dividing by n and n − 1',
      explanation: [
        "Divide the sum of squared deviations by $n$ when the data are the whole population. When the data are a sample used to estimate a larger population's variance, the usual estimate divides by $n - 1$, which is slightly larger and corrects for measuring deviations from the sample's own mean. The difference matters for small samples and fades as $n$ grows.",
      ],
      example: worked(
        'sample 2, 4, 6, 8 (mean 5)\nsquared deviations 9, 1, 1, 9, sum 20\ndivide by n = 4, or by n − 1 = 3',
        'population formula 5, sample variance ≈ 6.67',
        'Both start from the same sum of squared deviations; only the divisor changes.',
      ),
      questions: [
        typeNumber(
          'Squared deviations sum to 30 across 6 sampled observations. What is the sample variance, using $n - 1$?',
          6,
          '$30 / (6 - 1) = 6$.',
        ),
        choose(
          'Which data call for dividing by $n$?',
          [
            'A survey of 40 out of 10,000 customers',
            'Ten test runs estimating a process',
            'A pilot sample of 5 patients',
            'Every employee in a company of 40',
          ],
          3,
          'Only the employee data cover the entire population of interest.',
        ),
        choose(
          'As $n$ grows from 5 to 5,000, what happens to the gap between the $n$ and $n - 1$ versions?',
          [
            'It doubles',
            'It stays constant',
            'It shrinks toward nothing',
            'The $n - 1$ version becomes smaller',
          ],
          2,
          'Dividing by 4,999 or 5,000 gives nearly the same result.',
        ),
        predictOutput(
          'What does this program print?',
          'values = [1, 2, 3, 6]\nmean = 3\ntotal = 0\nfor x in values:\n    total += (x - mean) ** 2\nprint(total / len(values), total / (len(values) - 1))',
          [
            '14 3.5',
            '3.5 4.666666666666667',
            '4.666666666666667 3.5',
            '3.5 3.5',
          ],
          1,
          'The squared deviations sum to 14; $14 / 4 = 3.5$ and $14 / 3 \\approx 4.667$.',
        ),
      ],
    },
  ],
  'math-median': [
    {
      title: 'Find the median of an odd number of values',
      explanation: [
        'To find a median, first sort the values. With an odd count $n$, the median is the single middle value, at position $(n + 1) / 2$ counting from 1, with the same number of values on each side.',
      ],
      example: worked(
        '7, 2, 9, 4, 5\nsorted: 2, 4, 5, 7, 9',
        'median 5',
        'With 5 values, position $(5 + 1) / 2 = 3$ holds the middle value 5. The middle of the unsorted list, 9, is not the median.',
      ),
      questions: [
        typeNumber(
          'What is the median of 8, 3, 6, 1, 4?',
          4,
          'Sorted, the values are 1, 3, 4, 6, 8, so the middle value is 4.',
        ),
        typeNumber(
          'What is the median of 15, 11, and 30?',
          15,
          'Sorted, the values are 11, 15, 30, and the middle one is 15.',
        ),
        choose(
          'Seven values are sorted. Which position holds the median?',
          ['4th', '3rd', '3.5th', '7th'],
          0,
          '$(7 + 1) / 2 = 4$, leaving three values on each side.',
        ),
        typeNumber(
          'What is the median of −2, 5, 0, −7, 3?',
          0,
          'Sorted, the values are −7, −2, 0, 3, 5, so the middle value is 0.',
        ),
      ],
    },
    {
      title: 'Average the middle pair for an even count',
      explanation: [
        'With an even count $n$ there are two middle values, at positions $n / 2$ and $n / 2 + 1$ of the sorted list. The median is their mean, so it need not be one of the data values.',
      ],
      example: worked(
        '10, 3, 8, 5, 1, 12\nsorted: 1, 3, 5, 8, 10, 12',
        'median (5 + 8) / 2 = 6.5',
        'Positions 3 and 4 hold 5 and 8, and their mean is 6.5, a value that does not appear in the data.',
      ),
      questions: [
        typeNumber(
          'What is the median of 4, 1, 7, 2?',
          3,
          'Sorted, the values are 1, 2, 4, 7; the middle pair 2 and 4 averages to 3.',
        ),
        typeNumber(
          'What is the median of 30, 10, 90, 25, 40, 50?',
          35,
          'Sorted: 10, 25, 30, 40, 50, 90. The middle pair 30 and 40 averages to 35.',
        ),
        choose(
          'Eight values are sorted. Which positions does the median use?',
          ['4th only', '5th only', '4th and 5th', '3rd and 4th'],
          2,
          '$n / 2 = 4$ and $n / 2 + 1 = 5$.',
        ),
        typeNumber(
          'What is the median of 1, 2, 2, 9?',
          2,
          'The middle pair is 2 and 2, whose mean is 2.',
        ),
      ],
    },
    {
      title: 'Compare the median and mean when values are extreme',
      explanation: [
        "The mean uses every value's size, while the median uses only the order. Raising the largest value raises the mean but leaves the median where it was. A mean far above the median signals a few very large values; a mean far below it signals a few very small ones.",
      ],
      example: worked(
        'salaries (thousands): 40, 42, 45, 48, 300',
        'median 45, mean 95',
        'The single 300 pulls the mean above four of the five salaries, while the middle salary is still 45.',
      ),
      questions: [
        choose(
          'In 3, 4, 5, 6, 7, the 7 is replaced by 70. What happens?',
          [
            'The median rises and the mean stays',
            'The median stays at 5 and the mean rises',
            'Both stay the same',
            'Both rise by 63',
          ],
          1,
          'The order of the values is unchanged, but the sum grows by 63.',
        ),
        choose(
          'A few mansions are included among ordinary homes. Which summary better describes a typical home price?',
          ['The mean', 'The maximum', 'The median', 'The sum'],
          2,
          'The median is not pulled toward the few extreme prices.',
        ),
        choose(
          'A dataset has mean 20 and median 50. What does that suggest?',
          [
            'Some very large values pull the mean up',
            'Some very small values pull the mean down',
            'The data are symmetric',
            'The median was miscalculated',
          ],
          1,
          'A mean below the median points to a few unusually small values.',
        ),
        choose(
          'Commute times 10, 12, 14, 16, 18 have mean 14. If 18 becomes 98, what are the new median and mean?',
          ['30 and 14', '14 and 14', '58 and 30', '14 and 30'],
          3,
          'The middle value stays 14; the sum grows from 70 to 150, so the mean is 30.',
        ),
      ],
    },
  ],
  'math-percentiles': [
    {
      title: 'Read a percentile',
      explanation: [
        'The $p$-th percentile is a value with about $p\\%$ of the observations at or below it. The 50th percentile is the median. Percentiles describe position within a dataset, so a score at the 80th percentile beats about 80% of the scores whatever its units.',
      ],
      example: worked(
        '100 response times; the 90th percentile is 420 ms',
        'about 90 responses take 420 ms or less',
        'A percentile is a cutoff value. The percentage is the share of data at or below it, not a fraction of 420.',
      ),
      questions: [
        choose(
          "A runner's time is at the 25th percentile of finishing times. What share of runners finished at that time or faster?",
          ['About 75%', 'About 25%', 'Exactly 25 runners', 'Exactly half'],
          1,
          'The 25th percentile has about 25% of the values at or below it.',
        ),
        choose(
          'Which percentile is the median?',
          ['25th', '75th', '100th', '50th'],
          3,
          'Half the data lie at or below the median.',
        ),
        choose(
          "A child's height is at the 95th percentile for their age. What does that mean?",
          [
            'The child is 95 cm tall',
            'The child is 95% of the tallest height',
            'About 95% of children that age are this tall or shorter',
            'Only 95 children are shorter',
          ],
          2,
          'The percentile gives the share of children at or below this height.',
        ),
        choose(
          'The 10th percentile of daily sales is 40 units. Which statement is true?',
          [
            'On about 10% of days, sales were 40 units or fewer',
            'On 40% of days, sales were 10 units or fewer',
            'Sales averaged 40 units',
            'Sales never fell below 40 units',
          ],
          0,
          'The 10th percentile is the cutoff with about 10% of days at or below it.',
        ),
      ],
    },
    {
      title: 'Compute a percentile from its position',
      explanation: [
        'With $n$ sorted values counted from position 0, the $p$-th percentile sits at position $(p / 100) \\times (n - 1)$, the default rule in NumPy and pandas. If the position is a whole number, take the value there. If it falls between two positions, interpolate: position 2.25 lies a quarter of the way from the value at 2 to the value at 3.',
      ],
      example: worked(
        'sorted: 10, 20, 30, 40, 50 (n = 5)\n30th percentile position: 0.3 × 4 = 1.2',
        '20 + 0.2 × (30 − 20) = 22',
        'Position 1.2 lies a fifth of the way from position 1, holding 20, to position 2, holding 30.',
      ),
      questions: [
        typeNumber(
          'Sorted values are 4, 8, 15, 16, 23, 42. What is the 50th percentile by the position rule?',
          15.5,
          'The position $0.5 \\times 5 = 2.5$ lies halfway between 15 and 16.',
        ),
        typeNumber(
          'Sorted values are 2, 4, 6, 8, 10. What is the 75th percentile?',
          8,
          'The position $0.75 \\times 4 = 3$ is a whole number, and position 3 holds 8.',
        ),
        typeNumber(
          'Sorted values are 1, 5, 9. What is the 25th percentile?',
          3,
          'The position $0.25 \\times 2 = 0.5$ lies halfway from 1 to 5, giving 3.',
        ),
        typeNumber(
          'Sorted values are 100, 200, 300, 400, 500. What is the 90th percentile?',
          460,
          'The position $0.9 \\times 4 = 3.6$ lies 60% of the way from 400 to 500.',
        ),
      ],
    },
    {
      title: 'Summarize spread with quartiles and the IQR',
      explanation: [
        '$Q_1$ (the 25th percentile), the median, and $Q_3$ (the 75th percentile) cut the sorted data into four parts holding about a quarter of the observations each. The interquartile range $\\text{IQR} = Q_3 - Q_1$ measures the spread of the middle half. Because it ignores the lowest and highest quarters, an extreme value barely changes it, unlike the range, $\\text{maximum} - \\text{minimum}$.',
      ],
      example: worked(
        'sorted: 3, 5, 7, 8, 9, 11, 13, 15, 60 (n = 9)\nQ1 at position 2, Q3 at position 6',
        'Q1 = 7, Q3 = 13, IQR = 6, range = 57',
        'The extreme 60 inflates the range but leaves the middle half untouched.',
      ),
      questions: [
        typeNumber(
          '$Q_1 = 12$ and $Q_3 = 30$. What is the IQR?',
          18,
          '$\\text{IQR} = Q_3 - Q_1 = 30 - 12 = 18$.',
        ),
        choose(
          'The maximum value 60 is replaced by 600. Which summary changes?',
          ['The IQR', 'The range', '$Q_1$', 'The median'],
          1,
          'The range uses the maximum; the quartiles and median depend only on the middle of the order.',
        ),
        choose(
          'About what fraction of the observations lies between $Q_1$ and $Q_3$?',
          ['A quarter', 'Three quarters', 'All of them', 'Half'],
          3,
          '$Q_1$ and $Q_3$ enclose the middle two of the four quarters.',
        ),
        choose(
          'Sorted values are 1, 2, 3, 4, 5, 6, 7, 8, 9. By the position rule, what are $Q_1$ and $Q_3$?',
          ['3 and 7', '2.5 and 7.5', '2 and 8', '3 and 6'],
          0,
          'The positions $0.25 \\times 8 = 2$ and $0.75 \\times 8 = 6$ hold 3 and 7.',
        ),
      ],
    },
    {
      title: 'Flag outliers with the 1.5 × IQR rule',
      explanation: [
        'A common screen marks a value as a potential outlier when it lies below $Q_1 - 1.5 \\times \\text{IQR}$ or above $Q_3 + 1.5 \\times \\text{IQR}$. The fences come from the quartiles, so the extreme values being screened barely move them. A flagged value deserves inspection: it may be an error or a real and important observation.',
      ],
      example: worked(
        'Q1 = 10, Q3 = 18, IQR = 8, 1.5 × IQR = 12\nlower fence: 10 − 12\nupper fence: 18 + 12',
        'values below −2 or above 30 are flagged',
        'The fences extend one and a half IQRs beyond the quartiles in each direction.',
      ),
      questions: [
        typeNumber(
          '$Q_1 = 40$ and $Q_3 = 60$. What is the upper fence?',
          90,
          '$\\text{IQR} = 20$, so the fence is $60 + 1.5 \\times 20 = 90$.',
        ),
        choose(
          '$Q_1 = 5$ and $Q_3 = 9$. Which value is flagged?',
          ['14', '0', '16', '-1'],
          2,
          '$\\text{IQR} = 4$, so the fences are −1 and 15; only 16 lies beyond one.',
        ),
        choose(
          'A value lies above the upper fence. What should you do first?',
          [
            'Delete it automatically',
            'Replace it with the median',
            'Recompute the fences without it',
            'Inspect where the value came from',
          ],
          3,
          'The rule flags values for investigation; it does not prove they are errors.',
        ),
        typeNumber(
          '$Q_1 = 100$ and $Q_3 = 140$. What is the lower fence?',
          40,
          '$\\text{IQR} = 40$, so the fence is $100 - 1.5 \\times 40 = 40$.',
        ),
      ],
    },
  ],
  'math-covariance': [
    {
      title: 'Read the sign of covariance',
      explanation: [
        "For each pair, multiply $x$'s deviation from its mean by $y$'s deviation from its mean. The product is positive when both are above or both are below their means, and negative when one is above and the other below. Covariance is the mean of these products, so its sign says which kind of pairing dominates.",
      ],
      example: {
        code: 'x = [1, 2, 3]\ny = [10, 30, 20]\nmean_x = 2\nmean_y = 20\nprint([(x[i] - mean_x) * (y[i] - mean_y) for i in range(len(x))])',
        output: '[10, 0, 0]',
        explanation:
          'Only the first pair has both deviations nonzero, and both are negative, so their product is positive and the covariance $10 / 3$ is positive.',
      },
      questions: [
        choose(
          'Students who study more hours make fewer exam errors. What sign does the covariance of hours and errors have?',
          ['Positive', 'Negative', 'Zero', 'It depends on the units'],
          1,
          'Above-average hours pair with below-average errors, giving negative products.',
        ),
        typeOutput(
          'What does this program print?',
          'x = [2, 4, 6]\ny = [5, 3, 1]\nmean_x = 4\nmean_y = 3\nprint([(x[i] - mean_x) * (y[i] - mean_y) for i in range(len(x))])',
          '[-4, 0, -4]',
          'The deviations are (−2, 2), (0, 0), and (2, −2), so the products are −4, 0, −4.',
        ),
        choose(
          "For one pair, $x$ is above its mean and $y$ is below its mean. What is the sign of that pair's product?",
          ['Positive', 'Zero', 'It cannot be determined', 'Negative'],
          3,
          'A positive deviation times a negative deviation is negative.',
        ),
        typeNumber(
          'The paired deviation products are 6, −1, 2, and −3. What is the population covariance?',
          1,
          'Their sum is 4 and there are 4 pairs, so the covariance is 1.',
        ),
      ],
    },
    {
      title: 'Compute population covariance',
      explanation: [
        'Population covariance is the mean of the paired deviation products: compute both means, multiply corresponding deviations, add the products, and divide by the number of pairs $n$. Equivalently, it is the dot product of the two centered vectors divided by $n$.',
      ],
      example: {
        code: 'x = [1, 2, 3, 4]\ny = [2, 2, 4, 8]\nmean_x = 2.5\nmean_y = 4\ntotal = 0\nfor i in range(len(x)):\n    total += (x[i] - mean_x) * (y[i] - mean_y)\nprint(total / len(x))',
        output: '2.5',
        explanation:
          'The products are 3, 1, 0, and 6, summing to 10; dividing by the 4 pairs gives 2.5.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          'x = [0, 1, 2]\ny = [3, 3, 6]\nmean_x = 1\nmean_y = 4\ntotal = 0\nfor i in range(len(x)):\n    total += (x[i] - mean_x) * (y[i] - mean_y)\nprint(total / len(x))',
          '1.0',
          'The products are 1, 0, and 2, summing to 3; $3 / 3 = 1.0$.',
        ),
        typeNumber(
          '$x = [1, 3]$ and $y = [2, 6]$. What is their population covariance?',
          2,
          'The means are 2 and 4; the products $(-1)(-2)$ and $(1)(2)$ are both 2, and their mean is 2.',
        ),
        typeNumber(
          'The centered vectors are $[-1, 0, 1]$ and $[-2, 1, 1]$. What is the population covariance?',
          1,
          'Their dot product is $2 + 0 + 1 = 3$, and $3 / 3 = 1$.',
        ),
        typeNumber(
          '$x = [5, 5, 5]$ and $y = [1, 7, 4]$. What is $\\operatorname{cov}(x, y)$?',
          0,
          'Every $x$ deviation is 0, so every product is 0.',
        ),
      ],
    },
    {
      title: "Know what covariance's size depends on",
      explanation: [
        '$\\operatorname{cov}(x, x)$ equals the variance of $x$. Multiplying $x$ by a constant $c$ multiplies the covariance by $c$, while adding a constant to $x$ changes nothing, because the deviations from the mean stay the same. Since covariance carries the product of both units, a large value may reflect large units rather than a strong relationship.',
      ],
      example: worked(
        'cov(height in m, weight in kg) = 0.6\nheight in cm = 100 × height in m',
        'cov(height in cm, weight in kg) = 60',
        'Every height deviation becomes 100 times larger, so every product and their mean do too, although the relationship is unchanged.',
      ),
      questions: [
        typeNumber(
          '$\\operatorname{cov}(x, y) = 3$. What is $\\operatorname{cov}(2x, y)$?',
          6,
          'Doubling $x$ doubles every deviation of $x$ and therefore every product.',
        ),
        typeNumber(
          '$\\operatorname{cov}(x, y) = 3$. What is $\\operatorname{cov}(x + 10, y)$?',
          3,
          'Adding 10 moves the mean by 10 as well, so the deviations do not change.',
        ),
        typeNumber(
          '$\\operatorname{Var}(x) = 9$. What is $\\operatorname{cov}(x, x)$?',
          9,
          'Covariance of a variable with itself averages its squared deviations, which is its variance.',
        ),
        choose(
          'Study A reports covariance 500 and study B reports 0.4, for different variables and units. What can you conclude about strength?',
          [
            'Nothing yet, because the sizes depend on the units',
            'A shows the stronger relationship',
            'B shows the stronger relationship',
            'A has more observations',
          ],
          0,
          'Covariance is not scale-free, so values in different units cannot be compared.',
        ),
      ],
    },
  ],
  'math-correlation': [
    {
      title: 'Compute a correlation coefficient',
      explanation: [
        'Correlation divides covariance by the product of the two standard deviations: $r = \\operatorname{cov}(x, y) / (\\sigma_x \\sigma_y)$. Written with sums of deviation products and squares, the $1 / n$ factors cancel, so $r = S_{xy} / \\sqrt{S_{xx} \\times S_{yy}}$.',
      ],
      example: {
        code: 'x = [1, 2, 3]\ny = [1, 3, 2]\nmean_x = 2\nmean_y = 2\nsxy = 0\nsxx = 0\nsyy = 0\nfor i in range(len(x)):\n    sxy += (x[i] - mean_x) * (y[i] - mean_y)\n    sxx += (x[i] - mean_x) ** 2\n    syy += (y[i] - mean_y) ** 2\nprint(sxy, sxx, syy)\nprint(sxy / (sxx * syy) ** 0.5)',
        output: '1 2 2\n0.5',
        explanation:
          '$S_{xy} = 1$, $S_{xx} = 2$, and $S_{yy} = 2$, so $r = 1 / \\sqrt{4} = 0.5$: a moderate positive linear trend.',
      },
      questions: [
        typeNumber(
          '$\\operatorname{cov}(x, y) = 6$, $\\sigma_x = 2$, and $\\sigma_y = 5$. What is $r$?',
          0.6,
          '$r = 6 / (2 \\times 5) = 0.6$.',
        ),
        typeOutput(
          'What does this program print?',
          'sxy = -6\nsxx = 4\nsyy = 9\nprint(sxy / (sxx * syy) ** 0.5)',
          '-1.0',
          '$\\sqrt{4 \\times 9} = 6.0$, and $-6 / 6.0 = -1.0$.',
        ),
        typeNumber(
          '$S_{xy} = 12$, $S_{xx} = 16$, and $S_{yy} = 25$. What is $r$?',
          0.6,
          '$\\sqrt{16 \\times 25} = 20$, and $12 / 20 = 0.6$.',
        ),
        typeOutput(
          'What does this program print?',
          'x = [1, 2, 3]\ny = [4, 6, 8]\nmean_x = 2\nmean_y = 6\nsxy = 0\nsxx = 0\nsyy = 0\nfor i in range(len(x)):\n    sxy += (x[i] - mean_x) * (y[i] - mean_y)\n    sxx += (x[i] - mean_x) ** 2\n    syy += (y[i] - mean_y) ** 2\nprint(sxy / (sxx * syy) ** 0.5)',
          '1.0',
          '$S_{xy} = 4$, $S_{xx} = 2$, and $S_{yy} = 8$, so $r = 4 / \\sqrt{16} = 1.0$: the points lie on a rising line.',
        ),
      ],
    },
    {
      title: 'Interpret r between −1 and 1',
      explanation: [
        '$r$ always lies between −1 and 1. Its sign gives the direction of the linear trend and its distance from 0 gives the strength: $r = \\pm 1$ means the points lie exactly on a line, and $r$ near 0 means no linear trend. Because the units cancel, rescaling a variable by a positive factor or shifting it leaves $r$ unchanged; a negative factor flips its sign.',
      ],
      example: worked(
        'x = 1, 2, 3 and y = 10, 20, 30\ny in thousands: 0.01, 0.02, 0.03\nnegated y: −10, −20, −30',
        'r = 1, then 1, then −1',
        'A positive rescaling leaves the exact rising line intact; negating $y$ turns it into an exact falling line.',
      ),
      questions: [
        choose(
          'Which $r$ indicates the strongest linear association?',
          ['0.6', '0.05', '-0.85', '-0.4'],
          2,
          'Strength is distance from 0, and −0.85 is farthest.',
        ),
        choose(
          'Weights are converted from kilograms to pounds by multiplying by 2.2. What happens to their correlation with height?',
          [
            'It is multiplied by 2.2',
            'It is divided by 2.2',
            'It becomes 1',
            'It is unchanged',
          ],
          3,
          'A positive rescaling changes covariance and standard deviation by the same factor, which cancels.',
        ),
        typeNumber(
          'Points lie exactly on the line $y = 5 - 2x$. What is $r$?',
          -1,
          'An exact line with negative slope has $r = -1$; $r$ is not the slope.',
        ),
        choose(
          'A report states $r = 1.3$. What follows?',
          [
            'There is a calculation error',
            'The relationship is very strong',
            'The data use large units',
            'The trend is curved',
          ],
          0,
          'A correlation coefficient cannot exceed 1 in absolute value.',
        ),
      ],
    },
    {
      title: 'Know what correlation misses',
      explanation: [
        'Correlation measures only straight-line association. A strong curved relationship can have $r$ near 0, and a single extreme point can create or hide a correlation. Even a large $r$ does not show that $x$ causes $y$: a third variable, the way the data were selected, or two trends rising over time can produce it. Look at the data before trusting $r$.',
      ],
      example: worked(
        'x = −2, −1, 0, 1, 2 and y = x² = 4, 1, 0, 1, 4\nmean_x = 0, mean_y = 2\nSxy = (−2)(2) + (−1)(−1) + (0)(−2) + (1)(−1) + (2)(2)',
        'Sxy = 0, so r = 0',
        '$y$ is completely determined by $x$, but the falling left half and rising right half cancel.',
      ),
      questions: [
        typeNumber(
          '$y = x^2$ for $x = -3, -1, 1, 3$. What is the correlation of $x$ and $y$?',
          0,
          'The relationship is symmetric about 0, so the deviation products cancel.',
        ),
        choose(
          'Ice-cream sales and drowning deaths are positively correlated across months. What is the most plausible explanation?',
          [
            'Ice cream causes drowning',
            'Drowning increases ice-cream sales',
            'Hot weather increases both',
            'The correlation must be a mistake',
          ],
          2,
          'A shared cause can make two variables move together without either causing the other.',
        ),
        choose(
          'Two variables have $r = 0.02$. What can you conclude?',
          [
            'They are independent',
            'Neither can affect the other',
            'They have equal means',
            'There is little linear association, though a curved one is possible',
          ],
          3,
          '$r$ near 0 rules out only a linear trend.',
        ),
        choose(
          'Twenty points have $r = 0.1$. One extreme point is added far up and to the right. What can happen to $r$?',
          [
            'It cannot change',
            'It can rise sharply',
            'It must become negative',
            'It must become exactly 0',
          ],
          1,
          'One point with large deviations in both variables can dominate $S_{xy}$.',
        ),
      ],
    },
  ],
  'math-probability': [
    {
      title: 'Compute a probability from equally likely outcomes',
      explanation: [
        'When every outcome is equally likely, $P(\\text{event}) = \\text{favorable outcomes} / \\text{total outcomes}$. A probability lies between 0, for an impossible event, and 1, for a certain one.',
      ],
      example: worked(
        'fair die; event: roll at least 5\nfavorable outcomes: 5, 6\ntotal outcomes: 1, 2, 3, 4, 5, 6',
        'P = 2/6 = 1/3',
        'Two of the six equally likely faces satisfy the event.',
      ),
      questions: [
        typeNumber(
          'A bag holds 3 red and 7 blue marbles. What is $P(\\text{red})$ for one random draw?',
          0.3,
          '3 favorable marbles out of 10 equally likely ones.',
        ),
        typeOutput(
          'What does this program print?',
          'favorable = 5\ntotal = 20\nprint(favorable / total)',
          '0.25',
          '$5 / 20 = 0.25$; the favorable count goes on top.',
        ),
        choose(
          'Which value cannot be a probability?',
          ['0', '1', '0.999', '1.5'],
          3,
          'Probabilities lie between 0 and 1.',
        ),
        typeNumber(
          'Two fair coins are flipped. What is $P(\\text{exactly one head})$?',
          0.5,
          'Of the four equally likely outcomes HH, HT, TH, TT, two have exactly one head.',
        ),
      ],
    },
    {
      title: 'Use the complement',
      explanation: [
        'The complement "not $A$" contains every outcome where $A$ does not happen, so $P(\\text{not } A) = 1 - P(A)$. The complement is often easier to count: the chance of at least one success is 1 minus the chance of none.',
      ],
      example: {
        code: 'p_rain = 0.35\nprint(1 - p_rain)',
        output: '0.65',
        explanation:
          'Rain and no rain cover every outcome without overlap, so their probabilities sum to 1.',
      },
      questions: [
        typeNumber(
          '$P(\\text{defect}) = 0.04$. What is $P(\\text{no defect})$?',
          0.96,
          '$1 - 0.04 = 0.96$.',
        ),
        typeOutput(
          'What does this program print?',
          'p = 0.2\nprint(1 - p)',
          '0.8',
          'The complement of an event with probability 0.2 has probability 0.8.',
        ),
        typeNumber(
          'A fair die is rolled. What is $P(\\text{not a 6})$?',
          5 / 6,
          '$1 - 1/6 = 5/6$.',
          { tolerance: 0.0005, unit: 'fraction or 3 decimals' },
        ),
        typeNumber(
          '$P(\\text{at least one alert today}) = 0.7$. What is $P(\\text{no alerts today})$?',
          0.3,
          '"No alerts" is the complement of "at least one alert".',
        ),
      ],
    },
    {
      title: 'Condition on a selected group',
      explanation: [
        '$P(A \\mid B)$ is the probability of $A$ among only the outcomes where $B$ holds: $P(A \\text{ and } B) / P(B)$, or with counts, $(\\text{count of } A \\text{ and } B) / (\\text{count of } B)$. Conditioning replaces the whole population with the selected group in the denominator.',
      ],
      example: {
        code: 'emails = 200\nflagged = 40\nflagged_and_spam = 30\nprint(flagged_and_spam / flagged)',
        output: '0.75',
        explanation:
          'Among the 40 flagged emails, 30 are spam. The other 160 emails are outside the condition and do not enter the denominator.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          'customers = 500\nreturned = 50\nreturned_and_damaged = 20\nprint(returned_and_damaged / returned)',
          '0.4',
          'Within the 50 returns, 20 were damaged: $20 / 50 = 0.4$.',
        ),
        typeNumber(
          '$P(A \\text{ and } B) = 0.12$ and $P(B) = 0.4$. What is $P(A \\mid B)$?',
          0.3,
          '$0.12 / 0.4 = 0.3$.',
        ),
        typeNumber(
          'Of 1,000 people, 100 smoke, and 30 of the smokers have a cough. What is $P(\\text{cough} \\mid \\text{smoker})$?',
          0.3,
          'Restrict to the 100 smokers: $30 / 100 = 0.3$.',
        ),
        choose(
          'In $P(A \\mid B)$, which outcomes form the denominator?',
          [
            'All outcomes',
            'Only the outcomes where $A$ holds',
            'Outcomes where neither holds',
            'Only the outcomes where $B$ holds',
          ],
          3,
          'Conditioning on $B$ restricts attention to the outcomes where $B$ holds.',
        ),
      ],
    },
    {
      title: 'Keep P(A | B) and P(B | A) apart',
      explanation: [
        '$P(A \\mid B)$ and $P(B \\mid A)$ share the numerator $P(A \\text{ and } B)$ but divide by different groups, so they usually differ. Among 1,000 patients, 10 are sick and 9 of them test positive, while 99 healthy patients also test positive: $P(\\text{positive} \\mid \\text{sick}) = 9/10$, but $P(\\text{sick} \\mid \\text{positive}) = 9/108$.',
      ],
      example: worked(
        '1,000 patients: 10 sick (9 test positive), 990 healthy (99 test positive)\nP(positive | sick) = 9 / 10\nP(sick | positive) = 9 / (9 + 99)',
        '0.9 versus about 0.083',
        'Both use the 9 sick positives, but the second divides by all 108 positives, most of which are healthy.',
      ),
      questions: [
        choose(
          'In this example, why is $P(\\text{sick} \\mid \\text{positive})$ much smaller than $P(\\text{positive} \\mid \\text{sick})$?',
          [
            'The test is broken',
            'Probabilities cannot exceed 0.5',
            'Healthy patients far outnumber sick ones, so many positives are false alarms',
            'The two probabilities have different numerators',
          ],
          2,
          'The denominator of $P(\\text{sick} \\mid \\text{positive})$ is dominated by healthy patients who test positive.',
        ),
        typeNumber(
          'Of 100 students, 60 study math, 20 study art, and 15 study both. What is $P(\\text{math} \\mid \\text{art})$?',
          0.75,
          'Among the 20 art students, 15 study math: $15 / 20 = 0.75$.',
        ),
        typeNumber(
          'Of 100 students, 60 study math, 20 study art, and 15 study both. What is $P(\\text{art} \\mid \\text{math})$?',
          0.25,
          'Among the 60 math students, 15 study art: $15 / 60 = 0.25$.',
        ),
        choose(
          '$P(A \\text{ and } B) = 0.1$, $P(A) = 0.5$, and $P(B) = 0.2$. What are $P(A \\mid B)$ and $P(B \\mid A)$?',
          ['0.5 and 0.2', '0.2 and 0.5', '0.1 and 0.1', '0.05 and 0.02'],
          0,
          '$P(A \\mid B) = 0.1 / 0.2 = 0.5$ and $P(B \\mid A) = 0.1 / 0.5 = 0.2$.',
        ),
      ],
    },
  ],
  'math-random-variables': [
    {
      title: 'Describe a random variable by its distribution',
      explanation: [
        'A random variable turns each outcome of a random process into a number. Its distribution pairs each possible value with its probability; the probabilities are nonnegative and add up to 1. Different outcomes can map to the same value.',
      ],
      example: worked(
        'two fair coin flips; X = number of heads\nHH → 2, HT → 1, TH → 1, TT → 0',
        'P(X = 0) = 1/4, P(X = 1) = 1/2, P(X = 2) = 1/4',
        'Two of the four equally likely outcomes give $X = 1$, so that value gets probability 1/2.',
      ),
      questions: [
        typeNumber(
          '$X$ is the number of heads in two fair coin flips. What is $P(X = 1)$?',
          0.5,
          'HT and TH both give one head: 2 of 4 equally likely outcomes.',
        ),
        typeNumber(
          'A distribution has $P(X = 0) = 0.5$, $P(X = 1) = 0.3$, and one other value, 2. What is $P(X = 2)$?',
          0.2,
          'The probabilities must sum to 1: $1 - 0.5 - 0.3 = 0.2$.',
        ),
        choose(
          'Which table is a valid distribution?',
          [
            '0: 0.6, 1: 0.6',
            '0: −0.1, 1: 1.1',
            '0: 0.5, 1: 0.4',
            '0: 0.3, 1: 0.7',
          ],
          3,
          'Only 0.3 and 0.7 are both nonnegative and sum to 1.',
        ),
        typeNumber(
          '$X$ is 1 when a fair die shows an even number and 0 otherwise. What is $P(X = 1)$?',
          0.5,
          'Three of the six faces are even.',
        ),
      ],
    },
    {
      title: 'Compute an expected value',
      explanation: [
        'The expected value $E[X]$ multiplies each value by its probability and adds the products. It is a weighted mean with the probabilities as weights, and it is the long-run average over many repetitions, even when $X$ can never equal it.',
      ],
      example: worked(
        'X = 0, 1, 2 with probabilities 0.5, 0.3, 0.2\nE[X] = 0 × 0.5 + 1 × 0.3 + 2 × 0.2',
        'E[X] = 0.7',
        'The products are 0, 0.3, and 0.4. The average 0.7 is not a value $X$ can take.',
      ),
      questions: [
        typeNumber(
          '$X$ is the roll of a fair six-sided die. What is $E[X]$?',
          3.5,
          'Each face has probability 1/6, so $E[X] = 21 / 6 = 3.5$.',
        ),
        typeNumber(
          '$X$ is 10 with probability 0.1 and 0 otherwise. What is $E[X]$?',
          1,
          '$10 \\times 0.1 + 0 \\times 0.9 = 1$.',
        ),
        typeOutput(
          'This program computes $E[X]$ for $X = 0, 2, 4$ with probabilities 0.25, 0.5, 0.25. What does it print?',
          'print(0 * 0.25 + 2 * 0.5 + 4 * 0.25)',
          '2.0',
          'The products 0, 1.0, and 1.0 sum to the float 2.0.',
        ),
        typeNumber(
          'A bet wins 50 with probability 0.02 and loses 2 otherwise. What is its expected result?',
          -0.96,
          '$50 \\times 0.02 - 2 \\times 0.98 = 1 - 1.96 = -0.96$.',
        ),
      ],
    },
    {
      title: 'Use linearity of expectation',
      explanation: [
        'Expectation passes through scaling and shifting: $E[aX + b] = a E[X] + b$. The expectation of a sum is the sum of the expectations, $E[X + Y] = E[X] + E[Y]$, even when $X$ and $Y$ depend on each other. This gives the average of a total without listing every combined outcome.',
      ],
      example: worked(
        'daily orders X with E[X] = 40\nprofit = 3X − 20\nE[profit] = 3 × 40 − 20',
        'E[profit] = 100',
        'Scaling by 3 and subtracting 20 act on the expectation the same way they act on each value.',
      ),
      questions: [
        typeNumber(
          '$E[X] = 5$. What is $E[2X + 3]$?',
          13,
          '$2 \\times 5 + 3 = 13$.',
        ),
        typeNumber(
          '$E[X] = 2$ and $E[Y] = 7$, and $X$ and $Y$ are dependent. What is $E[X + Y]$?',
          9,
          'Linearity of expectation holds with or without independence.',
        ),
        typeNumber(
          'Each of 30 transactions has an expected fee of 0.5. What is the expected total fee?',
          15,
          'The expected total is the sum of the 30 expected fees.',
        ),
        typeNumber('$E[X] = -4$. What is $E[-X + 1]$?', 5, '$-(-4) + 1 = 5$.'),
      ],
    },
  ],
  'math-rv-variance': [
    {
      title: 'Compute the variance of a random variable',
      explanation: [
        '$\\operatorname{Var}(X) = E[(X - \\mu)^2]$: square each value’s distance from the mean $\\mu$, weight it by its probability, and add. The shortcut $\\operatorname{Var}(X) = E[X^2] - \\mu^2$ gives the same number. The standard deviation is $\\sqrt{\\operatorname{Var}(X)}$.',
      ],
      example: worked(
        'X = 0 or 4, each with probability 0.5\nμ = 2\nVar(X) = 0.5 × (0 − 2)² + 0.5 × (4 − 2)²',
        'Var(X) = 4, standard deviation 2',
        'Both values lie 2 from the mean, so the expected squared distance is 4.',
      ),
      questions: [
        typeNumber(
          '$X$ is 1 or 5, each with probability 1/2. What is $\\operatorname{Var}(X)$?',
          4,
          'The mean is 3 and both values lie 2 away, so $\\operatorname{Var}(X) = 4$.',
        ),
        typeNumber(
          '$E[X] = 2$ and $E[X^2] = 7$. What is $\\operatorname{Var}(X)$?',
          3,
          '$\\operatorname{Var}(X) = E[X^2] - \\mu^2 = 7 - 4 = 3$.',
        ),
        typeNumber(
          '$X$ always equals 8. What is $\\operatorname{Var}(X)$?',
          0,
          'A constant never deviates from its mean.',
        ),
        typeNumber(
          '$\\operatorname{Var}(X) = 25$. What is the standard deviation of $X$?',
          5,
          'The standard deviation is $\\sqrt{25} = 5$.',
        ),
      ],
    },
    {
      title: 'Scale and shift a random variable',
      explanation: [
        'Adding a constant moves every value and the mean together, so the spread stays the same. Multiplying by a constant $a$ multiplies every distance from the mean by $a$, and therefore the variance by $a^2$: $\\operatorname{Var}(aX + b) = a^2 \\operatorname{Var}(X)$. The standard deviation becomes $|a|$ times as large.',
      ],
      example: worked(
        'temperature X in °C with Var(X) = 4\nF = 1.8X + 32\nVar(F) = 1.8² × 4',
        'Var(F) = 12.96',
        'The shift by 32 has no effect; the factor 1.8 enters squared.',
      ),
      questions: [
        typeNumber(
          '$\\operatorname{Var}(X) = 3$. What is $\\operatorname{Var}(X + 100)$?',
          3,
          'A shift does not change spread.',
        ),
        typeNumber(
          '$\\operatorname{Var}(X) = 3$. What is $\\operatorname{Var}(4X)$?',
          48,
          '$4^2 \\times 3 = 48$.',
        ),
        typeNumber(
          '$\\operatorname{Var}(X) = 2$. What is $\\operatorname{Var}(-X)$?',
          2,
          '$(-1)^2 \\times 2 = 2$; variance is never negative.',
        ),
        typeNumber(
          '$X$ has standard deviation 5. What is the standard deviation of $3X - 7$?',
          15,
          'The standard deviation scales by $|3|$, and the shift has no effect.',
        ),
      ],
    },
    {
      title: 'Add independent variances and average them down',
      explanation: [
        'For independent $X$ and $Y$, $\\operatorname{Var}(X + Y) = \\operatorname{Var}(X) + \\operatorname{Var}(Y)$, and variances add even for a difference: $\\operatorname{Var}(X - Y) = \\operatorname{Var}(X) + \\operatorname{Var}(Y)$. The mean of $n$ independent copies, each with variance $\\sigma^2$, has variance $\\sigma^2 / n$, which is why averaging independent errors makes a result steadier.',
      ],
      example: worked(
        '4 independent measurements, each with variance 8\nVar(sum) = 4 × 8 = 32\nVar(mean) = Var(sum / 4) = 32 / 4²',
        'Var(mean) = 2',
        'Dividing the sum by 4 divides its variance by $4^2 = 16$, giving $8 / 4$.',
      ),
      questions: [
        typeNumber(
          '$X$ and $Y$ are independent with variances 3 and 4. What is $\\operatorname{Var}(X - Y)$?',
          7,
          'Subtracting an independent variable still adds its variance.',
        ),
        typeNumber(
          'Each of 25 independent readings has variance 50. What is the variance of their mean?',
          2,
          '$\\sigma^2 / n = 50 / 25 = 2$.',
        ),
        choose(
          "Several models' errors are strongly correlated. Why does averaging them reduce variance only a little?",
          [
            'Correlated errors have no variance',
            'Averaging always removes bias',
            'The mean of predictions is undefined',
            'The rule $\\operatorname{Var}(\\text{mean}) = \\sigma^2 / n$ assumes independent errors',
          ],
          3,
          'When errors move together they do not cancel, so the $\\sigma^2 / n$ reduction does not apply.',
        ),
        typeNumber(
          'Averaging $n$ independent copies cuts the variance to one tenth of a single copy. What is $n$?',
          10,
          '$\\sigma^2 / n = \\sigma^2 / 10$ when $n = 10$.',
        ),
      ],
    },
  ],
  'math-bernoulli-binomial': [
    {
      title: 'Describe a Bernoulli trial',
      explanation: [
        'A Bernoulli variable records one yes/no trial: 1 with probability $p$ and 0 with probability $1 - p$. Its mean is $p$ and its variance is $p(1 - p)$, which is largest at $p = 0.5$ and shrinks toward 0 as the outcome becomes nearly certain.',
      ],
      example: worked(
        'a visitor clicks with probability p = 0.1\nE[X] = 0.1\nVar(X) = 0.1 × 0.9',
        'mean 0.1, variance 0.09',
        'The mean is the success probability; the variance multiplies it by the failure probability.',
      ),
      questions: [
        typeNumber(
          '$X$ is Bernoulli with $p = 0.25$. What is $E[X]$?',
          0.25,
          'The mean of a Bernoulli variable is $p$.',
        ),
        typeNumber(
          '$X$ is Bernoulli with $p = 0.25$. What is $\\operatorname{Var}(X)$?',
          0.1875,
          '$p(1 - p) = 0.25 \\times 0.75 = 0.1875$.',
        ),
        typeNumber(
          'Which $p$ gives a Bernoulli variable its largest variance?',
          0.5,
          '$p(1 - p)$ peaks at $p = 0.5$, where the outcome is least predictable.',
        ),
        choose(
          'A process succeeds with probability 0.99. Why is its variance small?',
          [
            'The outcome is nearly always 1, so there is little spread',
            'Its mean is small',
            'Bernoulli variances are always 0.01',
            'Bernoulli variables have no variance',
          ],
          0,
          '$p(1 - p) = 0.99 \\times 0.01 \\approx 0.0099$ because the result rarely varies.',
        ),
      ],
    },
    {
      title: 'Multiply probabilities of independent trials',
      explanation: [
        'When trials are independent, the probability of a particular sequence is the product of the individual probabilities. With $p = 0.3$, the sequence 1, 1, 0 has probability $0.3 \\times 0.3 \\times 0.7 = 0.063$. Different orders of the same numbers of successes and failures have the same probability.',
      ],
      example: {
        code: 'p = 0.5\nprint(p * p * (1 - p))',
        output: '0.125',
        explanation:
          'The sequence 1, 1, 0 multiplies $p$, $p$, and $1 - p$: $0.5 \\times 0.5 \\times 0.5 = 0.125$.',
      },
      questions: [
        typeOutput(
          'This program computes the probability of the sequence 1, 0, 0, 1. What does it print?',
          'p = 0.5\nprint(p * (1 - p) * (1 - p) * p)',
          '0.0625',
          'Four independent factors of 0.5 multiply to 0.0625.',
        ),
        typeNumber(
          'A server fails on a given day with probability 0.1, independently across days. What is $P(\\text{no failure on two days})$?',
          0.81,
          '$0.9 \\times 0.9 = 0.81$; probabilities multiply, they do not subtract.',
        ),
        choose(
          'With $p = 0.2$, which sequence of three trials is most probable?',
          ['1, 1, 1', '1, 0, 1', '0, 0, 0', '0, 1, 0'],
          2,
          '$0.8^3 = 0.512$ is larger than any sequence containing a success factor of 0.2.',
        ),
        choose(
          'With $p = 0.4$, how do $P(1, 0)$ and $P(0, 1)$ compare?',
          [
            '$P(1, 0)$ is larger',
            '$P(0, 1)$ is larger',
            'They sum to 1',
            'They are equal',
          ],
          3,
          'Both are $0.4 \\times 0.6 = 0.24$; order does not change the product.',
        ),
      ],
    },
    {
      title: 'Count arrangements with C(n, k)',
      explanation: [
        '$C(n, k)$, read "$n$ choose $k$", counts the ways to choose which $k$ of $n$ trials are the successes: $C(n, k) = n! / (k! (n - k)!)$, where $n! = n \\times (n - 1) \\times \\dots \\times 1$ and $0! = 1$. Choosing the successes is the same as choosing the failures, so $C(n, k) = C(n, n - k)$.',
      ],
      example: worked(
        'C(5, 2) = 5! / (2! × 3!)\n= 120 / (2 × 6)',
        '10',
        'There are 10 ways to place 2 successes among 5 trials.',
      ),
      questions: [
        typeNumber(
          'What is $C(4, 1)$?',
          4,
          'The single success can be in any of the 4 positions.',
        ),
        typeNumber(
          'What is $C(6, 2)$?',
          15,
          '$6! / (2! \\times 4!) = 720 / 48 = 15$.',
        ),
        typeNumber(
          'What is $C(10, 10)$?',
          1,
          'There is exactly one way to make every trial a success.',
        ),
        typeNumber(
          '$C(8, 3) = 56$. What is $C(8, 5)$?',
          56,
          'Choosing 3 successes is the same as choosing the 5 failures.',
        ),
      ],
    },
    {
      title: 'Combine counts into binomial probabilities',
      explanation: [
        'The number of successes $K$ in $n$ independent $\\text{Bernoulli}(p)$ trials is binomial: $P(K = k) = C(n, k) p^k (1 - p)^{n - k}$, the number of arrangements times the probability of each one. Because $K$ adds $n$ Bernoulli variables, its mean is $np$ and its variance is $np(1 - p)$.',
      ],
      example: {
        code: 'p = 0.5\nprint(3 * p ** 2 * (1 - p))',
        output: '0.375',
        explanation:
          'For exactly 2 successes in 3 trials there are $C(3, 2) = 3$ arrangements, each with probability $0.5^2 \\times 0.5$.',
      },
      questions: [
        typeNumber(
          'Three fair coins are flipped. What is $P(\\text{exactly 2 heads})$?',
          0.375,
          '$C(3, 2) = 3$ arrangements, each with probability 1/8.',
        ),
        typeOutput(
          'This program computes $P(K = 3)$ for $n = 4$ fair trials. What does it print?',
          'p = 0.5\nprint(4 * p ** 3 * (1 - p))',
          '0.25',
          '$C(4, 3) = 4$ arrangements, each with probability 1/16.',
        ),
        typeNumber(
          'A test has 20 independent questions, each answered correctly with probability 0.8. What is the expected number correct?',
          16,
          '$np = 20 \\times 0.8 = 16$.',
        ),
        typeNumber(
          '$K$ is binomial with $n = 50$ and $p = 0.2$. What is $\\operatorname{Var}(K)$?',
          8,
          '$np(1 - p) = 50 \\times 0.2 \\times 0.8 = 8$.',
        ),
      ],
    },
  ],
  'math-normal-distribution': [
    {
      title: "Read the bell curve's parameters",
      explanation: [
        'A normal distribution $N(\\mu, \\sigma^2)$ is symmetric around its mean $\\mu$, which is also its median and the center of its peak. The standard deviation $\\sigma$ sets the width: a larger $\\sigma$ spreads the same total probability over a wider range, so the peak is lower. Probabilities are areas under the curve, so $P(X = a) = 0$ for any exact value $a$, and $P(X < \\mu) = 0.5$.',
      ],
      example: worked(
        'A ~ N(50, 2²)\nB ~ N(50, 10²)',
        'same center 50; B is five times as wide, with a lower peak',
        'The means match, so both curves are centered at 50; only $\\sigma$ differs.',
      ),
      questions: [
        typeNumber(
          '$X \\sim N(30, 4^2)$. What is $P(X < 30)$?',
          0.5,
          'A normal distribution is symmetric about its mean.',
        ),
        choose(
          'Which change makes a normal curve wider?',
          [
            'Increasing $\\mu$',
            'Decreasing $\\sigma$',
            'Increasing $\\sigma$',
            'Adding a constant to every value',
          ],
          2,
          '$\\sigma$ controls the width; $\\mu$ and shifts only move the center.',
        ),
        typeNumber(
          '$X \\sim N(0, 1)$. What is $P(X = 0)$ exactly?',
          0,
          'A single exact value covers no area under the curve.',
        ),
        typeNumber(
          '$X \\sim N(100, 15^2)$. What is the median of $X$?',
          100,
          'Symmetry makes the median equal the mean.',
        ),
      ],
    },
    {
      title: 'Apply the 68–95–99.7 rule',
      explanation: [
        'For any normal distribution, about 68% of values lie within one standard deviation of the mean, 95% within two, and 99.7% within three. Symmetry splits the remainder evenly between the two tails, so about 2.5% lie above $\\mu + 2\\sigma$.',
      ],
      example: worked(
        'scores ~ N(100, 15²)\n85 to 115 is μ ± σ\n70 to 130 is μ ± 2σ',
        'about 68% between 85 and 115; about 95% between 70 and 130',
        'Each interval counts whole standard deviations away from the mean.',
      ),
      questions: [
        choose(
          'Bulb lifetimes follow $N(1000, 50^2)$ hours. About what share lasts between 900 and 1100 hours?',
          ['68%', '95%', '99.7%', '50%'],
          1,
          '900 and 1100 are two standard deviations from the mean.',
        ),
        choose(
          'Heights follow $N(170, 8^2)$ cm. About what share is taller than 186 cm?',
          ['16%', '5%', '0.15%', '2.5%'],
          3,
          '$186 = \\mu + 2\\sigma$, and half of the 5% outside $\\pm 2\\sigma$ lies above.',
        ),
        choose(
          'Scores follow $N(60, 10^2)$. About what share lies between 50 and 70?',
          ['95%', '50%', '68%', '34%'],
          2,
          '50 and 70 are one standard deviation from the mean.',
        ),
        choose(
          'For a normal distribution, about what share lies below $\\mu - \\sigma$?',
          ['16%', '32%', '34%', '2.5%'],
          0,
          '32% lies outside $\\pm 1\\sigma$, split evenly: 16% in each tail.',
        ),
      ],
    },
    {
      title: 'Standardize values with z-scores',
      explanation: [
        'A z-score $z = (x - \\mu) / \\sigma$ says how many standard deviations $x$ lies above the mean (positive) or below it (negative). Standardizing puts values from different scales on one common scale, and under a normal model a value with $|z| > 3$ is rare.',
      ],
      example: {
        code: 'mu = 70\nsigma = 8\nx = 50\nprint((x - mu) / sigma)',
        output: '-2.5',
        explanation:
          '50 lies 20 below the mean, which is 2.5 standard deviations of size 8.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          'mu = 200\nsigma = 25\nx = 250\nprint((x - mu) / sigma)',
          '2.0',
          '$(250 - 200) / 25 = 2.0$ standard deviations above the mean.',
        ),
        choose(
          'Ana scores 82 on a test with mean 70 and $\\sigma = 6$; Ben scores 90 on a test with mean 80 and $\\sigma = 10$. Who did relatively better?',
          ['Ben', 'They tie', 'Ana', 'Different tests cannot be compared'],
          2,
          "Ana's z-score is 2 and Ben's is 1.",
        ),
        typeNumber(
          'A value has $z = -1.5$ under $N(40, 4^2)$. What is the value?',
          34,
          '$x = \\mu + z\\sigma = 40 - 1.5 \\times 4 = 34$.',
        ),
        typeOutput(
          'What does this program print?',
          'mu = 12\nsigma = 3\nx = 3\nprint((x - mu) / sigma)',
          '-3.0',
          '$(3 - 12) / 3 = -3.0$: three standard deviations below the mean.',
        ),
      ],
    },
  ],
  'math-sampling': [
    {
      title: 'Separate a sample from its population',
      explanation: [
        'A population is every unit a question is about; a sample is the subset actually observed. A population value such as the true mean $\\mu$ is fixed but usually unknown, while a sample statistic such as the sample mean $\\bar{x}$ changes from one random sample to the next. That change is sampling variation, not a mistake. A sample chosen in a biased way can miss the population no matter how large it is.',
      ],
      example: worked(
        'population: all 50,000 customers, true mean spend μ unknown\nrandom sample A of 100: x̄ = 41.2\nrandom sample B of 100: x̄ = 39.8',
        'both estimate the same μ; they differ because of sampling variation',
        'Different random subsets contain different customers, so their means differ even though the population is unchanged.',
      ),
      questions: [
        choose(
          "A study measures 500 of a city's 2 million residents. What is the population?",
          [
            'The 500 measured residents',
            'All 2 million residents',
            'The average of the 500',
            'The research team',
          ],
          1,
          'The population is everyone the question is about, not just those measured.',
        ),
        choose(
          'Two random samples from the same population have different means. What is the most likely reason?',
          [
            'The population changed between samples',
            'One calculation is wrong',
            'Sampling variation',
            'Means cannot be estimated from samples',
          ],
          2,
          'Different random samples naturally give different statistics.',
        ),
        choose(
          'Which is a sample statistic rather than a population value?',
          [
            'The mean income of every household in the country',
            'The true defect rate of a factory',
            'The median age of every voter',
            'The mean of the 200 surveyed households',
          ],
          3,
          'Only the 200-household mean is computed from observed data.',
        ),
        choose(
          'Only customers who reply to an email are surveyed. What problem is most likely?',
          [
            'Too little sampling variation',
            'Selection bias',
            'A zero standard error',
            'An undefined mean',
          ],
          1,
          'People who reply can differ systematically from those who do not.',
        ),
      ],
    },
    {
      title: 'Compute the standard error of a mean',
      explanation: [
        'For $n$ independent observations with standard deviation $\\sigma$, the sample mean has standard deviation $\\sigma / \\sqrt{n}$, its standard error. Variation in the mean shrinks with the square root of $n$, so quadrupling the sample halves the standard error. By the central limit theorem the sample mean is approximately normal for large $n$, so about 95% of sample means fall within 2 standard errors of $\\mu$.',
      ],
      example: {
        code: 'sigma = 30\nn = 225\nprint(sigma / n ** 0.5)',
        output: '2.0',
        explanation:
          '$\\sqrt{225} = 15$, so the standard error is $30 / 15 = 2.0$. ** binds before /, so n ** 0.5 is computed first.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          'sigma = 12\nn = 16\nprint(sigma / n ** 0.5)',
          '3.0',
          '$\\sqrt{16} = 4$, and $12 / 4 = 3.0$.',
        ),
        typeNumber(
          '$\\sigma = 8$ and $n = 64$. What is the standard error of the sample mean?',
          1,
          '$8 / \\sqrt{64} = 8 / 8 = 1$.',
        ),
        typeNumber(
          'A sample of 100 gives a standard error of 4. What sample size gives a standard error of 2?',
          400,
          'Halving the standard error requires four times as many observations.',
        ),
        choose(
          '$\\mu = 50$ and the standard error is 3. About 95% of sample means fall in which interval?',
          ['47 to 53', '44 to 56', '41 to 59', '50 to 56'],
          1,
          'Two standard errors on each side: $50 \\pm 6$.',
        ),
      ],
    },
    {
      title: 'Resample with replacement',
      explanation: [
        'Sampling with replacement returns each drawn unit before the next draw, so a unit can appear more than once. A bootstrap sample draws $n$ rows with replacement from the $n$ observed rows; some rows repeat and others are left out. Computing a statistic on many bootstrap samples shows how much it would vary, and bagging trains one model on each bootstrap sample.',
      ],
      example: worked(
        'observed rows: A, B, C, D\nbootstrap sample 1: B, A, B, D\nbootstrap sample 2: C, C, C, A',
        'each sample has 4 rows; repeats are allowed; different rows are left out each time',
        'Every draw picks from all four rows again, so the samples differ from the data and from each other.',
      ),
      questions: [
        choose(
          'Which is a valid bootstrap sample from the rows P, Q, R?',
          ['P, Q', 'P, Q, R, S', 'R, P, R', 'Q, Q, Q, Q'],
          2,
          'It has the original size 3 and draws only from P, Q, and R.',
        ),
        choose(
          'How does a bootstrap sample differ from a shuffle of the data?',
          [
            'It always keeps every row exactly once',
            'It changes the values inside rows',
            'It uses fewer columns',
            'It can repeat some rows and omit others',
          ],
          3,
          'A shuffle reorders the rows; a bootstrap sample redraws them with replacement.',
        ),
        choose(
          'Why does bagging train each tree on its own bootstrap sample?',
          [
            'It guarantees every tree is identical',
            'Different samples give different trees whose errors partly cancel',
            'It removes the need for test data',
            'It makes every row appear twice',
          ],
          1,
          'Resampling creates diversity, and averaging diverse models reduces variance.',
        ),
        choose(
          'Can a 10-row bootstrap sample contain only 9 distinct rows?',
          [
            'No, every row must appear',
            'No, it must then have 9 rows',
            'Only if a row is deleted first',
            'Yes, when one row is drawn twice',
          ],
          3,
          'With replacement, a repeat uses a draw that would otherwise pick another row.',
        ),
      ],
    },
  ],
  'math-likelihood': [
    {
      title: 'Compute the likelihood of a parameter value',
      explanation: [
        'Given observed data and a model with parameter $p$, the likelihood $L(p)$ is the probability of exactly those data if $p$ were true. For independent Bernoulli observations, multiply $p$ for each 1 and $1 - p$ for each 0. A larger likelihood means the parameter value explains the data better.',
      ],
      example: {
        code: 'p = 0.5\nprint(p * p * (1 - p))\np = 0.75\nprint(p * p * (1 - p))',
        output: '0.125\n0.140625',
        explanation:
          'For the data 1, 1, 0, the value $p = 0.75$ makes the observations more probable than $p = 0.5$.',
      },
      questions: [
        typeNumber(
          'The data are 1, 0 from a $\\text{Bernoulli}(p)$ model. What is $L(0.5)$?',
          0.25,
          '$0.5 \\times (1 - 0.5) = 0.25$.',
        ),
        predictOutput(
          'This program computes $L(0.25)$ for the data 1, 0, 0. What does it print?',
          'p = 0.25\nprint(p * (1 - p) * (1 - p))',
          ['0.25', '0.046875', '0.140625', '0.5625'],
          2,
          '$0.25 \\times 0.75 \\times 0.75 = 0.140625$.',
        ),
        choose(
          'The data are 1, 1, 1, 0. Which value of $p$ has the larger likelihood?',
          [
            '$p = 0.25$',
            '$p = 0.75$',
            'They are equal',
            'Likelihoods cannot compare them',
          ],
          1,
          '$0.75^3 \\times 0.25 \\approx 0.105$ exceeds $0.25^3 \\times 0.75 \\approx 0.012$.',
        ),
        choose(
          'Why is the likelihood of independent observations a product?',
          [
            'Likelihoods are always sums',
            'Each observation has probability 1',
            'It averages the data',
            'Probabilities of independent events multiply',
          ],
          3,
          'The probability of all observations together is the product of their probabilities.',
        ),
      ],
    },
    {
      title: 'Choose the maximum likelihood estimate',
      explanation: [
        'Maximum likelihood estimation chooses the parameter value with the largest likelihood. For $k$ successes in $n$ independent Bernoulli trials, the maximizer is $p = k / n$, the observed success rate. Values farther from $k / n$ make the observed data less probable.',
      ],
      example: worked(
        'data: 2 successes in 5 trials\nL(p) = p²(1 − p)³\nL(0.2) ≈ 0.0205, L(0.4) ≈ 0.0346, L(0.6) ≈ 0.0230',
        'maximum at p = 2/5 = 0.4',
        'The likelihood rises toward the observed rate 0.4 and falls after it.',
      ),
      questions: [
        typeNumber(
          'A drug works for 18 of 24 independent patients. What is the maximum likelihood estimate of its success rate?',
          0.75,
          '$k / n = 18 / 24 = 0.75$.',
        ),
        typeNumber(
          'A filter sees 3 spam messages among 60. What is the maximum likelihood estimate of the spam rate?',
          0.05,
          '$3 / 60 = 0.05$.',
        ),
        typeNumber(
          'The data are 0, 0, 0, 0. What is the maximum likelihood estimate of $p$?',
          0,
          '$L(p) = (1 - p)^4$ is largest at $p = 0$, matching $k / n = 0 / 4$.',
        ),
        choose(
          'With 4 successes in 10 trials, which candidate has the largest likelihood?',
          ['$p = 0.4$', '$p = 0.5$', '$p = 0.1$', '$p = 0.9$'],
          0,
          'The likelihood peaks at the observed rate $4 / 10$.',
        ),
      ],
    },
    {
      title: 'Work with log-likelihoods',
      explanation: [
        'Products of many probabilities shrink toward 0, so we take logs: $\\ln L(p)$ adds the log-probabilities of the observations. Because $\\ln$ is increasing, the parameter that maximizes the log-likelihood also maximizes the likelihood. Training usually minimizes the negative log-likelihood, which is the same goal.',
      ],
      example: worked(
        'data 1, 1, 0\nL(p) = p × p × (1 − p)\nln L(p) = ln p + ln p + ln(1 − p) = 2 ln p + ln(1 − p)',
        'a sum instead of a product; both peak at p = 2/3',
        'The log of a product is the sum of the logs, and taking logs keeps the location of the maximum.',
      ),
      questions: [
        choose(
          '$L(p) = p^3(1 - p)$. Which expression is $\\ln L(p)$?',
          [
            '$\\ln(3p) + \\ln(1 - p)$',
            '$3 \\ln p + \\ln(1 - p)$',
            '$3 \\ln p \\times \\ln(1 - p)$',
            '$(\\ln p)^3 + \\ln(1 - p)$',
          ],
          1,
          '$\\ln$ turns the product into a sum and the power into a factor.',
        ),
        choose(
          'On the same data, model A has log-likelihood −12.4 and model B has −15.1. Which explains the data better?',
          ['B', 'They tie', 'A', 'Log-likelihoods cannot be compared'],
          2,
          '$-12.4$ is larger, and a larger log-likelihood means a larger likelihood.',
        ),
        choose(
          'Minimizing the negative log-likelihood is equivalent to what?',
          [
            'Minimizing the likelihood',
            'Maximizing the number of parameters',
            'Setting $p = 0.5$',
            'Maximizing the likelihood',
          ],
          3,
          'Negating flips minimization into maximization, and $\\ln$ preserves the maximizer.',
        ),
        choose(
          'Why do programs add log-probabilities instead of multiplying thousands of probabilities?',
          [
            'The product becomes too small to represent',
            'Logs make probabilities larger than 1',
            'Sums change the maximizer',
            'Multiplying probabilities is not allowed',
          ],
          0,
          'A product of thousands of numbers below 1 underflows to 0; a sum of logs stays representable.',
        ),
      ],
    },
    {
      title: 'Read binary cross-entropy as a negative log-likelihood',
      explanation: [
        'For a binary label $y$ and a predicted probability $p$ that $y = 1$, the likelihood of the label is $p$ when $y = 1$ and $1 - p$ when $y = 0$. Its negative log is the binary cross-entropy $-(y \\ln p + (1 - y) \\ln(1 - p))$. Confident correct predictions cost little; confident wrong ones cost a lot, because the log of a number near 0 is very negative.',
      ],
      example: worked(
        'y = 1, p = 0.9: −ln 0.9\ny = 1, p = 0.1: −ln 0.1\ny = 0, p = 0.1: −ln(1 − 0.1)',
        '≈ 0.105, ≈ 2.303, ≈ 0.105',
        'The loss depends on the probability given to the true label: 0.9 in the first and third cases, 0.1 in the second.',
      ),
      questions: [
        choose(
          'The label is $y = 0$ and the model predicts $p = 0.8$ for class 1. What is the loss?',
          [
            '$-\\ln(0.8) \\approx 0.223$',
            '$0.8$',
            '$-\\ln(0.2) \\approx 1.609$',
            '$-\\ln(1) = 0$',
          ],
          2,
          'With $y = 0$ only $-\\ln(1 - p)$ remains, and the true label received probability 0.2.',
        ),
        choose(
          'For a label $y = 1$, which prediction has the largest cross-entropy?',
          ['$p = 0.99$', '$p = 0.6$', '$p = 0.5$', '$p = 0.01$'],
          3,
          '$-\\ln(0.01) \\approx 4.6$ is far larger than the others.',
        ),
        typeNumber(
          'The label is $y = 1$ and $p = e^{-1}$. What is the cross-entropy?',
          1,
          '$-\\ln(e^{-1}) = 1$.',
        ),
        choose(
          'A model predicts $p = 0.5$ for every example. What is its cross-entropy on each one?',
          ['$\\ln 2 \\approx 0.693$', '$0.5$', '$0$', '$1$'],
          0,
          'Either label receives probability 0.5, and $-\\ln(0.5) = \\ln 2$.',
        ),
      ],
    },
  ],
  'math-functions': [
    {
      title: 'Evaluate a function at an input',
      explanation: [
        'A function is a rule that gives exactly one output for each allowed input. $f(a)$ means: replace every $x$ in the rule with $a$, then follow the order of operations. Put a negative input in parentheses when substituting, so that $(-2)^2$ is 4, not −4.',
      ],
      example: {
        code: 'x = 4\nprint(3 * x - 2)\nx = -1\nprint(3 * x - 2)',
        output: '10\n-5',
        explanation:
          'The same rule $f(x) = 3x - 2$ is applied to two inputs: $f(4) = 10$ and $f(-1) = -5$.',
      },
      questions: [
        typeNumber(
          '$f(x) = 2x^2 - 3$. What is $f(-2)$?',
          5,
          '$(-2)^2 = 4$, so $f(-2) = 2 \\times 4 - 3 = 5$.',
        ),
        typeOutput(
          'What does this program print?',
          'x = -3\nprint(x ** 2 + 1)',
          '10',
          'x holds −3, and $(-3)^2 + 1 = 10$.',
        ),
        typeNumber(
          '$g(t) = 5 - t$. What is $g(8)$?',
          -3,
          'Substitute 8 for $t$: $5 - 8 = -3$.',
        ),
        typeNumber(
          '$h(x) = (x + 1)(x - 1)$. What is $h(3)$?',
          8,
          '$(3 + 1)(3 - 1) = 4 \\times 2 = 8$.',
        ),
      ],
    },
    {
      title: 'Decide whether a rule is a function',
      explanation: [
        'A rule is a function only if every input gives exactly one output. Different inputs may share an output, as $x^2$ gives 4 for both 2 and −2, but one input may never give two outputs. In a table of (input, output) pairs, a repeated input with different outputs breaks the rule.',
      ],
      example: worked(
        'table A: (1, 5), (2, 5), (3, 7)\ntable B: (1, 5), (1, 6), (2, 7)',
        'A is a function; B is not',
        'In A two inputs share the output 5, which is allowed. In B the input 1 has two different outputs.',
      ),
      questions: [
        choose(
          'Which table describes a function?',
          [
            '$(0, 1)$, $(0, 2)$',
            '$(2, 3)$, $(4, 3)$, $(6, 3)$',
            '$(5, 1)$, $(5, 5)$, $(6, 0)$',
            '$(1, 1)$, $(2, 2)$, $(1, 3)$',
          ],
          1,
          'Each input 2, 4, and 6 appears once; sharing the output 3 is allowed.',
        ),
        choose(
          'Which rule gives more than one output for some input?',
          ['$y = x^3$', '$y = x - 7$', '$y = \\pm\\sqrt{x}$', '$y = 10$'],
          2,
          'For $x = 9$, $\\pm\\sqrt{x}$ gives both 3 and −3.',
        ),
        choose(
          '$f(2) = 9$ and $f(5) = 9$. What does this show?',
          [
            '$f$ is not a function',
            '$f$ must be constant',
            '$f(9) = 2$',
            'Two inputs share an output, which a function allows',
          ],
          3,
          'Only one input with two outputs would break the definition.',
        ),
        choose(
          'A lookup assigns each student ID exactly one grade. Is the grade a function of the student ID?',
          [
            'Yes, because each ID has one grade',
            'No, because two students can share a grade',
            'No, because IDs are labels',
            'Only if every grade is different',
          ],
          0,
          'Each input ID determines one output grade; shared grades are fine.',
        ),
      ],
    },
    {
      title: 'Read the slope and intercept of a linear function',
      explanation: [
        'A linear function $f(x) = mx + b$ has a straight-line graph. $b = f(0)$ is where the line crosses the vertical axis, and the slope $m = (\\text{change in output}) / (\\text{change in input})$ between any two points. A positive $m$ rises to the right, a negative $m$ falls, and $m = 0$ is flat.',
      ],
      example: worked(
        'points (2, 7) and (6, 15)\nm = (15 − 7) / (6 − 2) = 2\nb = 7 − 2 × 2',
        'f(x) = 2x + 3',
        'The slope comes from the two points; substituting one point into $y = 2x + b$ gives $b = 3$.',
      ),
      questions: [
        typeNumber(
          'A line passes through $(0, 4)$ and $(2, 10)$. What is its slope?',
          3,
          'The output rises 6 over a run of 2.',
        ),
        choose(
          '$f(x) = -4x + 9$. Where does its graph cross the vertical axis?',
          ['$(0, -4)$', '$(9, 0)$', '$(0, 9)$', '$(-4, 9)$'],
          2,
          'At $x = 0$ the output is $b = 9$.',
        ),
        choose(
          'A taxi charges 3 plus 2 per kilometer. Which function gives the fare for $x$ kilometers?',
          [
            '$f(x) = 3x + 2$',
            '$f(x) = 5x$',
            '$f(x) = (3 + 2)x$',
            '$f(x) = 2x + 3$',
          ],
          3,
          'The fixed charge is the intercept 3 and the per-kilometer rate is the slope 2.',
        ),
        typeNumber(
          'A line passes through $(1, 8)$ and $(5, 0)$. What is its slope?',
          -2,
          '$(0 - 8) / (5 - 1) = -2$; the line falls.',
        ),
      ],
    },
  ],
  'math-exponentials': [
    {
      title: 'Multiply and divide powers of the same base',
      explanation: [
        '$a^n$ means $n$ factors of $a$. Multiplying powers of the same base pools the factors, so the exponents add: $a^m \\times a^n = a^{m+n}$. Dividing cancels factors, so they subtract: $a^m / a^n = a^{m-n}$. A power of a power multiplies them: $(a^m)^n = a^{mn}$. In Python, a ** n computes $a^n$.',
      ],
      example: {
        code: 'print(2 ** 3 * 2 ** 4)\nprint(2 ** 7)',
        output: '128\n128',
        explanation:
          'Three factors of 2 times four more factors of 2 is seven factors of 2.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          'print(3 ** 2 * 3 ** 3)',
          '243',
          'The exponents add: $3^5 = 243$. Multiplying them would give $3^6 = 729$.',
        ),
        choose(
          'Simplify $5^8 / 5^5$.',
          ['$5^{13}$', '$1^3$', '$5^3$', '$5^{40}$'],
          2,
          'Dividing powers of the same base subtracts the exponents.',
        ),
        choose(
          'Simplify $(2^3)^4$.',
          ['$2^7$', '$2^{12}$', '$8^7$', '$2^{81}$'],
          1,
          'Four groups of three factors make twelve factors.',
        ),
        typeOutput(
          'What does this program print?',
          'print((10 ** 2) ** 3)',
          '1000000',
          '$(10^2)^3 = 10^6 = 1{,}000{,}000$.',
        ),
      ],
    },
    {
      title: 'Use zero and negative exponents',
      explanation: [
        'Subtracting exponents forces two definitions. $a^n / a^n = 1$ and also $a^{n-n} = a^0$, so $a^0 = 1$ for every nonzero $a$. Likewise $a^0 / a^n = a^{-n}$, so $a^{-n} = 1 / a^n$: a negative exponent means a reciprocal, not a negative number.',
      ],
      example: {
        code: 'print(7 ** 0)\nprint(2 ** -3)',
        output: '1\n0.125',
        explanation: '$7^0 = 1$, and $2^{-3} = 1 / 2^3 = 1 / 8 = 0.125$.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          'print(4 ** -1)',
          '0.25',
          '$4^{-1} = 1 / 4 = 0.25$.',
        ),
        typeNumber(
          'What is $9^0$?',
          1,
          'Any nonzero number to the power 0 is 1.',
        ),
        typeNumber(
          'What is $2^{-4}$?',
          0.0625,
          '$2^{-4} = 1 / 2^4 = 1/16$, a positive number.',
        ),
        typeOutput(
          'What does this program print?',
          'print(10 ** -2 * 10 ** 3)',
          '10.0',
          'The exponents add to 1, giving 10; the negative power makes the result a float.',
        ),
      ],
    },
    {
      title: 'Recognize exponential growth and decay',
      explanation: [
        '$f(x) = c \\times b^x$ starts at $f(0) = c$ and multiplies by $b$ for each unit step in $x$. With $b > 1$ the output grows, adding more at each step; with $0 < b < 1$ it decays toward 0 but never reaches it. Repeated percentage change is exponential: growing 10% per year multiplies by 1.1 each year.',
      ],
      example: worked(
        'a population of 1,000 grows 50% per period\nafter 1 period: 1000 × 1.5 = 1500\nafter 2 periods: 1000 × 1.5² = 2250',
        'f(t) = 1000 × 1.5ᵗ',
        'Each period multiplies the current value by 1.5, so the second period adds more than the first.',
      ),
      questions: [
        typeNumber(
          'A balance of 200 doubles every year. What is it after 3 years?',
          1600,
          '$200 \\times 2^3 = 1{,}600$.',
        ),
        choose(
          "A drug's amount halves every hour, starting from 80 mg. What remains after 4 hours?",
          ['20 mg', '10 mg', '5 mg', '0 mg'],
          2,
          '$80 \\times 0.5^4 = 80 / 16 = 5$.',
        ),
        typeOutput(
          'What does this program print?',
          'print(64 * 0.5 ** 3)',
          '8.0',
          '** comes first: $0.5^3 = 0.125$, and $64 \\times 0.125 = 8.0$.',
        ),
        choose(
          'Which function decays toward 0 as $x$ grows?',
          [
            '$f(x) = 3 \\times 2^x$',
            '$f(x) = 5 \\times 0.8^x$',
            '$f(x) = 2x + 1$',
            '$f(x) = x^2$',
          ],
          1,
          'Its base 0.8 lies between 0 and 1.',
        ),
      ],
    },
    {
      title: 'Work with the number e',
      explanation: [
        '$e \\approx 2.718$ is the base of the natural exponential function $e^x$, used throughout statistics and machine learning. $e^x$ is positive for every $x$, $e^0 = 1$, and the usual rules apply: $e^a \\times e^b = e^{a+b}$ and $e^{-x} = 1 / e^x$. Large negative inputs give values near 0; large positive inputs grow very quickly.',
      ],
      example: worked(
        'e² ≈ 7.389\ne⁻² = 1 / e²\ne³ × e⁻³ = e⁰',
        '≈ 7.389, ≈ 0.135, 1',
        'A negative exponent is the reciprocal, and opposite exponents cancel to $e^0 = 1$.',
      ),
      questions: [
        typeNumber(
          'What is $e^0$?',
          1,
          'Any nonzero base to the power 0 is 1.',
        ),
        typeNumber(
          '$e^3 \\approx 20.09$. What is $e^{-3}$, approximately?',
          0.05,
          '$e^{-3} = 1 / e^3 \\approx 1 / 20.09 \\approx 0.050$.',
          { tolerance: 0.0005, unit: 'to 3 decimals' },
        ),
        choose(
          'Which statement about $e^x$ is true?',
          [
            'It is negative for negative $x$',
            'It equals 0 at $x = 0$',
            'It decreases as $x$ grows',
            'It is positive for every $x$',
          ],
          3,
          'A positive base raised to any power stays positive.',
        ),
        choose(
          'Simplify $e^5 \\times e^{-2}$.',
          ['$e^3$', '$e^7$', '$e^{-10}$', '$e^{2.5}$'],
          0,
          'Add the exponents: $5 + (-2) = 3$.',
        ),
      ],
    },
  ],
  'math-logarithms': [
    {
      title: 'Read a logarithm as an exponent',
      explanation: [
        '$\\log_b(x)$ asks which exponent turns $b$ into $x$: $\\log_b(x) = k$ exactly when $b^k = x$. So $\\log_{10}(1000) = 3$, $\\log_2(1/8) = -3$, and $\\log_b(1) = 0$ for every base. Logarithms exist only for positive $x$, because $b^k$ is always positive.',
      ],
      example: worked(
        'log₂(16): 2⁴ = 16\nlog₁₀(0.1): 10⁻¹ = 0.1\nlog₅(1): 5⁰ = 1',
        '4, −1, 0',
        'Each answer is the exponent that produces the input.',
      ),
      questions: [
        typeNumber('What is $\\log_2(32)$?', 5, '$2^5 = 32$.'),
        typeNumber('What is $\\log_{10}(0.001)$?', -3, '$10^{-3} = 0.001$.'),
        choose(
          'Which statement means the same as $\\log_3(x) = 4$?',
          ['$x = 4^3$', '$x = 3 \\times 4$', '$x = 4 / 3$', '$x = 3^4$'],
          3,
          'The log is the exponent on the base: $3^4 = x$.',
        ),
        choose(
          'For which input is $\\log_{10}(x)$ undefined?',
          ['$x = 0.5$', '$x = 1$', '$x = -10$', '$x = 1000$'],
          2,
          'No power of 10 is negative.',
        ),
      ],
    },
    {
      title: 'Use the natural logarithm',
      explanation: [
        '$\\ln(x)$ is the logarithm with base $e$, so it undoes $e^x$: $\\ln(e^k) = k$, and $e^{\\ln x} = x$ for $x > 0$. $\\ln(1) = 0$ and $\\ln(e) = 1$. $\\ln$ is negative between 0 and 1, positive above 1, and increasing, so a larger input always has a larger log.',
      ],
      example: worked(
        'ln(e⁴) = 4\nln(1) = 0\nln(0.5): 0.5 < 1',
        '4, 0, and a negative number (≈ −0.693)',
        'Reaching 0.5 from $e$ needs a negative exponent.',
      ),
      questions: [
        typeNumber(
          'What is $\\ln(e^{-2})$?',
          -2,
          '$\\ln$ undoes the exponential, leaving the exponent.',
        ),
        choose(
          'What is the sign of $\\ln(0.2)$?',
          ['Positive', 'Zero', 'Negative', 'Undefined'],
          2,
          'Inputs between 0 and 1 have negative natural logs.',
        ),
        typeNumber(
          'What is $e^{\\ln 7}$?',
          7,
          'The exponential undoes $\\ln$.',
        ),
        choose(
          'For positive $a$ and $b$, $\\ln(a) < \\ln(b)$. What follows?',
          ['$a < b$', '$a > b$', '$a = b$', 'Nothing about $a$ and $b$'],
          0,
          '$\\ln$ is increasing, so it preserves order.',
        ),
      ],
    },
    {
      title: 'Turn products into sums with log rules',
      explanation: [
        'Each exponent rule gives a log rule, in any base: $\\log(xy) = \\log(x) + \\log(y)$, $\\log(x / y) = \\log(x) - \\log(y)$, and $\\log(x^k) = k \\log(x)$. There is no rule for $\\log(x + y)$. These rules turn a product of many factors, such as many probabilities, into a sum.',
      ],
      example: worked(
        'ln(0.5 × 0.2 × 0.1) = ln 0.5 + ln 0.2 + ln 0.1\n≈ −0.693 − 1.609 − 2.303',
        '≈ −4.605, which is ln 0.01',
        'The product 0.01 becomes a sum of three logs.',
      ),
      questions: [
        typeNumber(
          '$\\log_2(8) = 3$ and $\\log_2(4) = 2$. What is $\\log_2(32)$?',
          5,
          '$32 = 8 \\times 4$, so its log is $3 + 2 = 5$.',
        ),
        choose(
          'Which expression equals $\\ln(a / b)$?',
          [
            '$\\ln a / \\ln b$',
            '$\\ln(a - b)$',
            '$\\ln a - \\ln b$',
            '$\\ln b - \\ln a$',
          ],
          2,
          'The log of a quotient is a difference of logs.',
        ),
        typeNumber(
          '$\\log_{10}(x) = 2.5$. What is $\\log_{10}(x^4)$?',
          10,
          'The power comes down as a factor: $4 \\times 2.5 = 10$.',
        ),
        choose(
          'Which expression equals $\\ln(2) + \\ln(3)$?',
          [
            '$\\ln(5)$',
            '$\\ln(6)$',
            '$\\ln(2) \\times \\ln(3)$',
            '$\\ln(1.5)$',
          ],
          1,
          'A sum of logs is the log of the product $2 \\times 3$.',
        ),
      ],
    },
  ],
  'math-sigmoid': [
    {
      title: 'Evaluate the sigmoid',
      explanation: [
        '$\\sigma(z) = 1 / (1 + e^{-z})$. To evaluate it, compute $e^{-z}$, add 1, and take the reciprocal. At $z = 0$, $e^0 = 1$ and $\\sigma(0) = 1/2$ exactly. In Python, e can be written as the number 2.718281828459045.',
      ],
      example: {
        code: 'e = 2.718281828459045\nz = 0\nprint(1 / (1 + e ** -z))',
        output: '0.5',
        explanation:
          'e ** -0 is 1.0, so the denominator is 2 and the output is 0.5.',
      },
      questions: [
        typeNumber(
          '$e^{-1} \\approx 0.368$. What is $\\sigma(1)$?',
          0.731,
          '$1 / (1 + 0.368) \\approx 0.731$.',
          { tolerance: 0.0005, unit: 'to 3 decimals' },
        ),
        typeNumber(
          '$e^2 \\approx 7.389$. What is $\\sigma(-2)$?',
          0.119,
          'For $z = -2$, $e^{-z} = e^2 \\approx 7.389$, so $\\sigma(-2) = 1 / 8.389 \\approx 0.119$.',
          { tolerance: 0.0005, unit: 'to 3 decimals' },
        ),
        typeOutput(
          'Here exp_neg_z holds $e^{-z}$ for some score $z$. What does this program print?',
          'exp_neg_z = 3.0\nprint(1 / (1 + exp_neg_z))',
          '0.25',
          'The denominator is $1 + 3.0 = 4.0$, and $1 / 4.0 = 0.25$.',
        ),
        choose(
          'For which score is $\\sigma(z)$ exactly 0.5?',
          ['$z = 0.5$', '$z = 1$', '$z = 0$', '$z = -1$'],
          2,
          'Only $z = 0$ makes $e^{-z} = 1$ and the denominator 2.',
        ),
      ],
    },
    {
      title: "Use the sigmoid's range and symmetry",
      explanation: [
        'Because $e^{-z}$ is always positive, the denominator $1 + e^{-z}$ is always greater than 1, so $\\sigma(z)$ always lies strictly between 0 and 1. The curve is symmetric around the point $(0, 0.5)$: $\\sigma(-z) = 1 - \\sigma(z)$, so knowing $\\sigma$ for positive scores gives it for negative ones.',
      ],
      example: worked(
        'σ(1.5) ≈ 0.818\nσ(−1.5) = 1 − σ(1.5)',
        'σ(−1.5) ≈ 0.182',
        'Opposite scores give outputs that add up to 1.',
      ),
      questions: [
        typeNumber(
          '$\\sigma(4) \\approx 0.982$. What is $\\sigma(-4)$?',
          0.018,
          '$\\sigma(-4) = 1 - 0.982 = 0.018$.',
          { tolerance: 0.0005, unit: 'to 3 decimals' },
        ),
        choose(
          'Which number can $\\sigma(z)$ output?',
          ['0', '1', '0.9999', '−0.1'],
          2,
          'Outputs lie strictly between 0 and 1, so 0.9999 is possible but 0 and 1 are not.',
        ),
        typeNumber(
          '$\\sigma(a) = 0.3$. What is $\\sigma(-a)$?',
          0.7,
          '$\\sigma(-a) = 1 - \\sigma(a) = 0.7$.',
        ),
        typeNumber(
          'What is $\\sigma(z) + \\sigma(-z)$?',
          1,
          'The symmetry $\\sigma(-z) = 1 - \\sigma(z)$ makes the sum 1.',
        ),
      ],
    },
    {
      title: "Read the sigmoid's increasing, saturating shape",
      explanation: [
        'The sigmoid is increasing: a larger score always gives a larger output, so sigmoid outputs rank scores in the same order as the scores. The curve is steepest near $z = 0$. Far from 0 it flattens, or saturates, so even large changes in $z$ barely change $\\sigma(z)$.',
      ],
      example: worked(
        'σ(0) = 0.5 and σ(1) ≈ 0.731: a step of 1 adds ≈ 0.231\nσ(6) ≈ 0.9975 and σ(7) ≈ 0.9991: a step of 1 adds ≈ 0.0016',
        'the same step in z matters far less in the flat tail',
        'Near 0 the output responds strongly to the score; near 1 there is almost no room left to grow.',
      ),
      questions: [
        choose(
          'Scores are −1, 3, and 0.5. Which has the largest sigmoid output?',
          ['−1', '3', '0.5', 'They are equal'],
          1,
          'The sigmoid is increasing, so the largest score wins.',
        ),
        choose(
          'Where does a one-unit change in $z$ change $\\sigma(z)$ the most?',
          [
            'Near $z = 10$',
            'Near $z = -10$',
            'Near $z = 0$',
            'The same everywhere',
          ],
          2,
          'The curve is steepest at its center and flat in both tails.',
        ),
        choose(
          '$\\sigma(a) > \\sigma(b)$. What can you conclude?',
          ['$a < b$', '$a = 2b$', 'Nothing about $a$ and $b$', '$a > b$'],
          3,
          'An increasing function preserves order.',
        ),
        choose(
          "A classifier's score rises from 9 to 12. Why does its sigmoid output barely change?",
          [
            'The curve has saturated near 1',
            'The sigmoid decreases there',
            '$e^{-z}$ grows as $z$ grows',
            'Outputs above 0.5 are capped',
          ],
          0,
          '$e^{-9}$ and $e^{-12}$ are both tiny, so both outputs are almost 1.',
        ),
      ],
    },
  ],
  'math-softmax': [
    {
      title: 'Compute softmax probabilities',
      explanation: [
        'Softmax exponentiates each score, adds the exponentials, and divides each one by that total: $p_i = e^{z_i} / (e^{z_1} + \\cdots + e^{z_k})$. The results are positive, sum to 1, and keep the order of the scores.',
      ],
      example: {
        code: 'a = 1.0\nb = 3.0\nc = 4.0\ntotal = a + b + c\nprint(a / total, b / total, c / total)',
        output: '0.125 0.375 0.5',
        explanation:
          'Here a, b, and c hold the exponentials of three scores. Dividing each by their total 8.0 gives probabilities that sum to 1.',
      },
      questions: [
        typeOutput(
          'a and b hold the exponentials of two scores. What does this program print?',
          'a = 3.0\nb = 1.0\ntotal = a + b\nprint(a / total, b / total)',
          '0.75 0.25',
          'Each exponential is divided by the total 4.0, keeping the order of the scores.',
        ),
        typeNumber(
          '$e^1 \\approx 2.72$ and $e^0 = 1$. What softmax probability goes to the first of the scores 1, 0, 0?',
          0.576,
          '$2.72 / (2.72 + 1 + 1) \\approx 0.576$.',
          { tolerance: 0.0005, unit: 'to 3 decimals' },
        ),
        typeNumber(
          'Softmax gives three classes the probabilities 0.2, 0.5, and $p$. What is $p$?',
          0.3,
          'Softmax probabilities sum to 1.',
        ),
        choose(
          'Scores are 2, 5, and 1. Which class receives the largest softmax probability?',
          ['The first', 'The second', 'The third', 'All are equal'],
          1,
          'A larger score has a larger exponential and so a larger share.',
        ),
      ],
    },
    {
      title: 'Shift scores without changing softmax',
      explanation: [
        'Adding the same constant $c$ to every score multiplies every exponential by $e^c$, and that common factor cancels in the division. Softmax therefore depends only on the differences between scores. Implementations subtract the largest score before exponentiating, so no exponential overflows and the result is unchanged.',
      ],
      example: worked(
        'scores 1000, 1001\nsubtract the maximum: −1, 0\nexponentials e⁻¹ ≈ 0.368 and e⁰ = 1',
        'probabilities ≈ 0.269 and 0.731',
        '$e^{1000}$ is too large for a float, but after the shift both exponentials are small and the probabilities are the same.',
      ),
      questions: [
        choose(
          'The softmax of 2, 4, 7 is $p$. What is the softmax of 12, 14, 17?',
          ['$p + 10$', '$10p$', '$p$', 'Values that no longer sum to 1'],
          2,
          'Every score rose by 10, and the common factor $e^{10}$ cancels.',
        ),
        choose(
          'A stable implementation subtracts the maximum from the scores 5, 3, 5. Which scores does it exponentiate?',
          ['5, 3, 5', '1, 0.6, 1', '−5, −3, −5', '0, −2, 0'],
          3,
          'Subtracting the maximum 5 from each score gives 0, −2, 0.',
        ),
        choose(
          'Which two score lists give the same softmax?',
          [
            '1, 2 and 2, 4',
            '1, 2 and 11, 12',
            '1, 2 and 2, 1',
            '1, 2 and −1, −2',
          ],
          1,
          'Only 11, 12 keeps the same differences as 1, 2.',
        ),
        choose(
          'Why is subtracting the maximum score safe?',
          [
            'The common factor $e^{-\\max}$ cancels in the division',
            'It makes every probability equal',
            'It changes the ranking only slightly',
            'Softmax ignores the largest score',
          ],
          0,
          'Every exponential is multiplied by the same factor, which divides out.',
        ),
      ],
    },
    {
      title: 'Connect two-class softmax to the sigmoid',
      explanation: [
        'With two scores $z_1$ and $z_2$, dividing the top and bottom of $e^{z_1} / (e^{z_1} + e^{z_2})$ by $e^{z_1}$ gives $1 / (1 + e^{-(z_1 - z_2)}) = \\sigma(z_1 - z_2)$. A two-class softmax is the sigmoid of the score difference, so a binary model can output one sigmoid probability instead.',
      ],
      example: worked(
        'scores 3 and 1\nsoftmax for class 1 = σ(3 − 1) = σ(2)',
        '≈ 0.881 for class 1 and ≈ 0.119 for class 2',
        'Only the difference 2 matters, and the second class receives the rest of the probability.',
      ),
      questions: [
        typeNumber(
          'Two class scores are 0.5 and 0.5. What probability does softmax give the first class?',
          0.5,
          'The difference is 0, and $\\sigma(0) = 0.5$.',
        ),
        typeNumber(
          '$\\sigma(3) \\approx 0.953$. The scores are 4 and 1. What is the first class’s softmax probability?',
          0.953,
          'The probability is $\\sigma(4 - 1) = \\sigma(3)$.',
          { tolerance: 0.0005, unit: 'to 3 decimals' },
        ),
        choose(
          'Which expression equals the softmax probability of the first of two scores $a$ and $b$?',
          [
            '$\\sigma(a + b)$',
            '$\\sigma(a) / \\sigma(b)$',
            '$\\sigma(a) - \\sigma(b)$',
            '$\\sigma(a - b)$',
          ],
          3,
          'Dividing through by $e^a$ leaves the sigmoid of $a - b$.',
        ),
        choose(
          'A binary model outputs one sigmoid probability instead of a two-class softmax. What does it lose?',
          [
            'Nothing, because the two forms are equivalent',
            'The ability to output probabilities',
            'Probabilities that sum to 1',
            'The ranking of the two classes',
          ],
          0,
          'The second class gets $1 - p$, exactly what the softmax would give it.',
        ),
      ],
    },
  ],
  'math-derivative-rate': [
    {
      title: 'Compute an average rate of change',
      explanation: [
        'The average rate of change of $f$ from $x = a$ to $x = b$ is $(f(b) - f(a)) / (b - a)$: how much the output changed per unit of input. It is the slope of the secant line through the graph points $(a, f(a))$ and $(b, f(b))$.',
      ],
      example: {
        code: 'a = 1\nb = 4\nprint((b ** 2 - a ** 2) / (b - a))',
        output: '5.0',
        explanation:
          'For $f(x) = x^2$, the output rises from 1 to 16 while $x$ rises by 3, so the average rate is $15 / 3 = 5.0$.',
      },
      questions: [
        typeNumber(
          '$f(x) = x^2 + 1$. What is its average rate of change from $x = 2$ to $x = 5$?',
          7,
          '$(26 - 5) / (5 - 2) = 21 / 3 = 7$.',
        ),
        typeOutput(
          'This program computes the average rate of change of $x^3$ from 0 to 2. What does it print?',
          'a = 0\nb = 2\nprint((b ** 3 - a ** 3) / (b - a))',
          '4.0',
          'The output rises by 8 over a run of 2, and / gives the float 4.0.',
        ),
        choose(
          "A car's odometer reads 120 km at 2 pm and 300 km at 5 pm. What is its average rate of change?",
          ['180 km/h', '90 km/h', '100 km/h', '60 km/h'],
          3,
          '$(300 - 120) / (5 - 2) = 60$ km per hour.',
        ),
        typeNumber(
          '$f(1) = 10$ and $f(3) = 4$. What is the average rate of change from $x = 1$ to $x = 3$?',
          -3,
          '$(4 - 10) / (3 - 1) = -3$; the function fell on average.',
        ),
      ],
    },
    {
      title: 'Approach the derivative with shrinking steps',
      explanation: [
        "The derivative $f'(a)$ is the instantaneous rate of change at $a$: the value the difference quotient $(f(a + h) - f(a)) / h$ approaches as $h$ shrinks toward 0. Setting $h = 0$ directly would give $0 / 0$, so we watch where the quotients head instead. Geometrically, $f'(a)$ is the slope of the tangent line at $(a, f(a))$.",
      ],
      example: {
        code: 'a = 3\nh = 0.5\nprint(((a + h) ** 2 - a ** 2) / h)\nh = 0.25\nprint(((a + h) ** 2 - a ** 2) / h)',
        output: '6.5\n6.25',
        explanation:
          "For $f(x) = x^2$ at $a = 3$, halving $h$ moves the quotient from 6.5 to 6.25, closing in on $f'(3) = 6$.",
      },
      questions: [
        typeOutput(
          'This program computes a difference quotient of $x^2$ at $a = 1$. What does it print?',
          'a = 1\nh = 0.5\nprint(((a + h) ** 2 - a ** 2) / h)',
          '2.5',
          "$(1.5^2 - 1^2) / 0.5 = 1.25 / 0.5 = 2.5$, on its way toward $f'(1) = 2$.",
        ),
        typeNumber(
          "For $f(x) = x^2$ at $x = 2$, the quotients are 4.5, 4.1, and 4.01 for $h = 0.5$, 0.1, and 0.01. What is $f'(2)$?",
          4,
          'The derivative is the value the quotients approach as $h$ shrinks.',
        ),
        choose(
          "What does $f'(a)$ represent on the graph of $f$?",
          [
            'The height of the graph at $x = a$',
            'The area under the graph up to $a$',
            'The $x$-intercept of the graph',
            'The slope of the tangent line at $x = a$',
          ],
          3,
          'The derivative is a rate of change: the slope where the graph is touched at $a$.',
        ),
        choose(
          'Why not simply set $h = 0$ in $(f(a + h) - f(a)) / h$?',
          [
            'The quotient becomes $0 / 0$',
            'The result is always 1',
            '$f$ is undefined at $a$',
            '$h$ must be negative',
          ],
          0,
          'With $h = 0$ both the top and the bottom are 0, so the derivative is defined by the trend as $h$ shrinks.',
        ),
      ],
    },
    {
      title: 'Read the sign and size of a derivative',
      explanation: [
        "The sign of $f'(a)$ says how $f$ behaves near $a$: positive means increasing, negative means decreasing, and zero means locally flat. Its size says how fast: $f'(a) = 3$ means the output changes by about 3 units per unit of input near $a$, so a small step $\\Delta x$ changes $f$ by about $f'(a) \\times \\Delta x$.",
      ],
      example: worked(
        'f′(1) = 4, f′(2) = 0, f′(3) = −2',
        'rising at x = 1, flat at x = 2, falling at x = 3',
        'Near $x = 3$, increasing $x$ by 0.1 lowers $f$ by about $2 \\times 0.1 = 0.2$.',
      ),
      questions: [
        choose(
          "$f'(4) = -3$. What does $f$ do near $x = 4$?",
          [
            'It increases',
            'It decreases',
            'It stays constant',
            'Its value is −3',
          ],
          1,
          'A negative derivative means the function is falling there.',
        ),
        typeNumber(
          "$f(2) = 10$ and $f'(2) = 5$. About what is $f(2.1)$?",
          10.5,
          'A step of 0.1 changes $f$ by about $5 \\times 0.1 = 0.5$.',
        ),
        choose(
          'Where is the graph of $f$ flat?',
          [
            'Where $f(x) = 0$',
            'Where $x = 0$',
            "Where $f'(x) = 1$",
            "Where $f'(x) = 0$",
          ],
          3,
          'A zero derivative means a horizontal tangent line.',
        ),
        choose(
          "$f'(a) = 0.1$ and $g'(a) = 8$. Which function is changing faster at $a$?",
          ['$g$', '$f$', 'Neither', 'It cannot be told'],
          0,
          '$g$ changes about 8 units per unit of input, $f$ only 0.1.',
        ),
      ],
    },
  ],
  'math-power-rule': [
    {
      title: 'Differentiate powers of x',
      explanation: [
        'The power rule: the derivative of $x^n$ is $n x^{n-1}$. Bring the exponent down as a factor and reduce it by one. Because $x = x^1$, its derivative is $1 \\times x^0 = 1$.',
      ],
      example: worked(
        '(x⁴)′ = 4x³\n(x²)′ = 2x\n(x)′ = 1',
        'at x = 2 the slopes are 32, 4, and 1',
        'Substitute $x = 2$ after differentiating: $4 \\times 2^3 = 32$ and $2 \\times 2 = 4$.',
      ),
      questions: [
        choose(
          'What is the derivative of $x^9$?',
          ['$x^8$', '$9x^8$', '$9x^9$', '$8x^9$'],
          1,
          'Bring down the 9 and lower the exponent to 8.',
        ),
        typeNumber(
          "$f(x) = x^3$. What is $f'(2)$?",
          12,
          "$f'(x) = 3x^2$, so $f'(2) = 12$.",
        ),
        typeNumber(
          "$f(x) = x$. What is $f'(x)$?",
          1,
          '$x = x^1$, so the derivative is $1 \\times x^0 = 1$: a line of slope 1.',
        ),
        choose(
          "$f(x) = x^5$. Where does $f'(x)$ equal 5?",
          ['At $x = 1$ and $x = -1$', 'At $x = 5$', 'At $x = 0$', 'Nowhere'],
          0,
          "$f'(x) = 5x^4 = 5$ when $x^4 = 1$.",
        ),
      ],
    },
    {
      title: 'Handle constants and constant multiples',
      explanation: [
        "A constant function is flat, so its derivative is 0. A constant factor stays in front: $(c x^n)' = c n x^{n-1}$, because multiplying a function by $c$ multiplies every slope by $c$.",
      ],
      example: worked(
        '(7x²)′ = 7 × 2x\n(−3x⁴)′ = −3 × 4x³\n(12)′',
        '14x, −12x³, 0',
        'The constant factor rides along; a standalone constant contributes no slope.',
      ),
      questions: [
        choose(
          'What is the derivative of $6x^3$?',
          ['$6x^2$', '$18x^2$', '$18x^3$', '$3x^2$'],
          1,
          '$6 \\times 3x^2 = 18x^2$.',
        ),
        typeNumber(
          'What is the derivative of the constant 42?',
          0,
          'A constant never changes, so its rate of change is 0.',
        ),
        typeNumber(
          "$g(x) = 0.5x^2$. What is $g'(6)$?",
          6,
          "$g'(x) = 0.5 \\times 2x = x$, so $g'(6) = 6$.",
        ),
        choose(
          "$f'(x) = 2x$. What is the derivative of $5f(x)$?",
          ['$10x$', '$2x + 5$', '$5$', '$7x$'],
          0,
          'A constant multiple multiplies the derivative: $5 \\times 2x$.',
        ),
      ],
    },
    {
      title: 'Evaluate a derivative to get a slope',
      explanation: [
        "The derivative $f'(x)$ is itself a function. To find the slope at a particular point, differentiate first and then substitute the point. Substituting first produces a number, and the derivative of a number is always 0.",
      ],
      example: {
        code: 'x = 3\nprint(4 * 3 * x ** 2)',
        output: '108',
        explanation:
          "For $f(x) = 4x^3$, $f'(x) = 12x^2$, and at $x = 3$ the slope is $12 \\times 9 = 108$.",
      },
      questions: [
        typeOutput(
          "$f(x) = 2x^4$, so $f'(x) = 8x^3$. What does this program print?",
          'x = 2\nprint(2 * 4 * x ** 3)',
          '64',
          '$8 \\times 2^3 = 64$.',
        ),
        typeNumber(
          '$f(x) = 3x^2$. What is the slope of its graph at $x = -1$?',
          -6,
          "$f'(x) = 6x$, so the slope at −1 is −6.",
        ),
        choose(
          'A learner substitutes $x = 2$ into $x^3$ to get 8, then differentiates 8 and reports a slope of 0. What went wrong?',
          [
            'The power rule does not apply to $x^3$',
            'The slope at 2 really is 0',
            'They forgot to square 8',
            'They substituted before differentiating',
          ],
          3,
          "Differentiate first: $f'(x) = 3x^2$, so the slope at 2 is 12.",
        ),
        typeNumber(
          "$f(x) = x^4$. What is $f'(-1)$?",
          -4,
          "$f'(x) = 4x^3$, and $4 \\times (-1)^3 = -4$.",
        ),
      ],
    },
  ],
  'math-sum-product-rules': [
    {
      title: 'Differentiate a polynomial term by term',
      explanation: [
        'The derivative of a sum is the sum of the derivatives, and differences work the same way. So differentiate a polynomial one term at a time with the power and constant rules; constant terms disappear.',
      ],
      example: worked(
        'p(x) = 2x³ − 5x² + 4x − 9\np′(x) = 6x² − 10x + 4',
        'p′(1) = 0',
        'Each term is differentiated separately and the constant −9 vanishes. At $x = 1$: $6 - 10 + 4 = 0$.',
      ),
      questions: [
        choose(
          'What is the derivative of $3x^4 - x^2 + 7$?',
          ['$12x^3 - 2x + 7$', '$12x^3 - 2x$', '$3x^3 - 2x$', '$12x^4 - 2x^2$'],
          1,
          'Differentiate each term: $12x^3$, $-2x$, and 0 for the constant.',
        ),
        typeNumber(
          "$f(x) = x^2 + 6x$. What is $f'(-3)$?",
          0,
          "$f'(x) = 2x + 6$, which is 0 at $x = -3$.",
        ),
        choose(
          'Which term disappears when you differentiate $5x^2 + 8x + 11$?',
          ['$5x^2$', '$8x$', 'None of them', '$11$'],
          3,
          'The constant 11 has derivative 0; $8x$ becomes 8.',
        ),
        typeOutput(
          "$f(x) = x^3 - 4x$, so $f'(x) = 3x^2 - 4$. What does this program print?",
          'x = 2\nprint(3 * x ** 2 - 4)',
          '8',
          '$3 \\times 4 - 4 = 8$.',
        ),
      ],
    },
    {
      title: 'Apply the product rule',
      explanation: [
        "For a product of two functions, $(fg)' = f'g + fg'$: differentiate one factor while keeping the other, then swap roles and add. Multiplying the two derivatives, $f'g'$, is a common mistake that gives the wrong answer.",
      ],
      example: worked(
        'h(x) = x²(x + 3)\nf = x², f′ = 2x; g = x + 3, g′ = 1\nh′(x) = 2x(x + 3) + x² × 1',
        'h′(x) = 3x² + 6x',
        'Each factor gets its turn to change while the other is held fixed.',
      ),
      questions: [
        choose(
          "$h(x) = x(x + 4)$. What is $h'(x)$?",
          ['$1$', '$2x + 4$', '$x + 4$', '$x$'],
          1,
          '$1 \\times (x + 4) + x \\times 1 = 2x + 4$.',
        ),
        typeNumber(
          "$f(2) = 3$, $f'(2) = 1$, $g(2) = 5$, and $g'(2) = 4$. What is $(fg)'$ at $x = 2$?",
          17,
          "$f'g + fg' = 1 \\times 5 + 3 \\times 4 = 17$.",
        ),
        choose(
          "Why is $(fg)' = f'g'$ wrong for $f = x$ and $g = x$?",
          [
            'It happens to give the correct $2x$',
            'Products cannot be differentiated',
            'It gives 0',
            "It gives 1, but $(x^2)' = 2x$",
          ],
          3,
          "$f'g' = 1 \\times 1 = 1$, while the product $x \\cdot x = x^2$ has derivative $2x$.",
        ),
        choose(
          "$h(x) = 3x(x^2 - 1)$. Which expression is $h'(x)$?",
          [
            '$3(x^2 - 1) + 3x(2x)$',
            '$3 \\times 2x$',
            '$3x(2x)$',
            '$3(x^2 - 1)$',
          ],
          0,
          "$f = 3x$ and $g = x^2 - 1$, so $f'g + fg' = 3(x^2 - 1) + 3x(2x)$.",
        ),
      ],
    },
    {
      title: 'Check a derivative by expanding',
      explanation: [
        'When a product is a polynomial, you can also expand it first and differentiate term by term. Both routes must give the same derivative, which makes expanding a good check on the product rule.',
      ],
      example: worked(
        'expand: (x + 1)(x − 1) = x² − 1, derivative 2x\nproduct rule: 1 × (x − 1) + (x + 1) × 1',
        'both routes give 2x',
        'The product rule result simplifies to $x - 1 + x + 1 = 2x$.',
      ),
      questions: [
        choose(
          'Expand $(x + 2)^2$ and differentiate. What is the derivative?',
          ['$2x + 2$', '$2x + 4$', '$2(x + 2)^2$', '$x + 2$'],
          1,
          '$(x + 2)^2 = x^2 + 4x + 4$, whose derivative is $2x + 4$.',
        ),
        choose(
          'What is the derivative of $x^2(x + 1)$?',
          ['$2x$', '$2x(x + 1)$', '$3x^2 + 2x$', '$3x^2 + 1$'],
          2,
          '$x^2(x + 1) = x^3 + x^2$, whose derivative is $3x^2 + 2x$.',
        ),
        typeNumber(
          "Expanding gives $f(x) = x^3 - 2x^2$. What is $f'(2)$?",
          4,
          "$f'(x) = 3x^2 - 4x$, so $f'(2) = 12 - 8 = 4$.",
        ),
        typeOutput(
          '$h(x) = 2x(x + 5)$. This program applies the product rule at $x = 3$. What does it print?',
          'x = 3\nprint(2 * (x + 5) + 2 * x * 1)',
          '22',
          "$f'g + fg' = 2 \\times 8 + 6 \\times 1 = 22$, matching the expanded derivative $4x + 10$.",
        ),
      ],
    },
  ],
  'math-chain-rule': [
    {
      title: 'Split a function into inner and outer parts',
      explanation: [
        'A composition applies one function to the output of another. In $h(x) = (5x - 2)^3$, the inner function $u = 5x - 2$ is computed first and the outer function $u^3$ is applied to its result. Naming the inner expression $u$ is the first step of the chain rule.',
      ],
      example: worked(
        'h(x) = (x² + 1)⁴\ninner: u = x² + 1\nouter: u⁴',
        'h(2) = (2² + 1)⁴ = 5⁴ = 625',
        'Evaluation follows the same order: the inner value 5 first, then the outer power.',
      ),
      questions: [
        choose(
          'In $h(x) = (3x + 7)^2$, what is the inner function?',
          ['$u^2$', '$3x + 7$', '$3x$', '$7$'],
          1,
          'The expression inside the square is computed first.',
        ),
        choose(
          'In $h(x) = e^{2x}$, what is the outer function?',
          ['$2x$', '$x$', '$e^u$', '$e^2$'],
          2,
          'The exponential is applied to the inner value $u = 2x$.',
        ),
        choose(
          'When evaluating $L(w) = (w - 4)^2$ at $w = 6$, which step comes first?',
          [
            'Squaring 6',
            'Squaring 4',
            'Multiplying 6 by 2',
            'Computing the inner value 6 − 4 = 2',
          ],
          3,
          'The inner function is evaluated before the outer square.',
        ),
        typeOutput(
          'This program evaluates $h(x) = (3x - 4)^2$ at $x = 2$. What does it print?',
          'x = 2\nu = 3 * x - 4\nprint(u ** 2)',
          '4',
          'The inner value is $u = 2$, and the outer square gives 4.',
        ),
      ],
    },
    {
      title: 'Multiply the outer and inner derivatives',
      explanation: [
        "Chain rule: for $h(x) = f(u)$ with $u = g(x)$, $h'(x) = f'(u) \\times u'(x)$. Differentiate the outer function as if $u$ were the variable, keep $u$ inside, then multiply by the derivative of $u$. Forgetting the inner factor is the most common error.",
      ],
      example: worked(
        'h(x) = (4x + 1)³\nouter derivative: 3u² = 3(4x + 1)²\ninner derivative: 4',
        'h′(x) = 12(4x + 1)²',
        'Multiplying by the inner rate 4 accounts for $u$ changing four times as fast as $x$.',
      ),
      questions: [
        choose(
          'What is the derivative of $(2x + 5)^4$?',
          ['$4(2x + 5)^3$', '$8(2x + 5)^3$', '$8x^3$', '$2(2x + 5)^4$'],
          1,
          'Outer derivative $4(2x + 5)^3$ times inner derivative 2.',
        ),
        choose(
          'What is the derivative of $(x^2 + 1)^2$?',
          ['$2(x^2 + 1)$', '$2x$', '$4x(x^2 + 1)$', '$(2x)^2$'],
          2,
          'Outer derivative $2(x^2 + 1)$ times inner derivative $2x$.',
        ),
        choose(
          'What is the derivative of $(5 - x)^2$?',
          ['$2(5 - x)$', '$-2x$', '$2x - 5$', '$-2(5 - x)$'],
          3,
          'The inner derivative of $5 - x$ is −1, which flips the sign.',
        ),
        typeNumber(
          'What is the derivative of $(3x)^5$ at $x = 1/3$?',
          15,
          '$5(3x)^4 \\times 3$; at $x = 1/3$, $3x = 1$, giving $5 \\times 1 \\times 3 = 15$.',
        ),
      ],
    },
    {
      title: 'Chain several local rates',
      explanation: [
        'When a quantity passes through several steps, its overall rate multiplies every local rate along the way: if $L$ depends on $p$, $p$ on $z$, and $z$ on $w$, then $\\frac{dL}{dw} = \\frac{dL}{dp} \\times \\frac{dp}{dz} \\times \\frac{dz}{dw}$. Each factor is computed at its own step from values already known. Backpropagation applies exactly this product, layer by layer.',
      ],
      example: {
        code: 'dL_dp = -4\ndp_dz = 0.5\ndz_dw = 3\nprint(dL_dp * dp_dz * dz_dw)',
        output: '-6.0',
        explanation:
          'The three local rates multiply to −6: a small increase in $w$ lowers $L$ about 6 times as much.',
      },
      questions: [
        typeNumber(
          '$\\frac{dL}{dp} = 2$, $\\frac{dp}{dz} = -3$, and $\\frac{dz}{dw} = 0.5$. What is $\\frac{dL}{dw}$?',
          -3,
          '$2 \\times (-3) \\times 0.5 = -3$; the local rates multiply rather than add.',
        ),
        typeOutput(
          'What does this program print?',
          'dL_dp = 6\ndp_dw = -2\nprint(dL_dp * dp_dw)',
          '-12',
          'The chain rule multiplies the two local rates: $6 \\times (-2) = -12$.',
        ),
        typeNumber(
          '$L = (p - 1)^2$ and $p = 3w$. What is $\\frac{dL}{dw}$ at $w = 1$?',
          12,
          'At $w = 1$, $p = 3$, so $\\frac{dL}{dp} = 2(3 - 1) = 4$, and $\\frac{dp}{dw} = 3$; their product is 12.',
        ),
        typeNumber(
          'One local rate in a chain is 0. What is the overall derivative?',
          0,
          'A product with a zero factor is zero: a change cannot pass through a flat link.',
        ),
      ],
    },
  ],
  'math-partial-derivatives': [
    {
      title: 'Hold the other inputs fixed',
      explanation: [
        'For a function of several inputs, the partial derivative $\\frac{\\partial f}{\\partial x}$ treats every other input as a constant and differentiates with respect to $x$ alone. A term without $x$ has partial derivative 0, and a factor such as $y$ in front of $x$ stays as a constant multiplier.',
      ],
      example: worked(
        'f(x, y) = 4x²y + 3y² + x\n∂f/∂x = 8xy + 0 + 1\n∂f/∂y = 4x² + 6y + 0',
        '∂f/∂x = 8xy + 1, ∂f/∂y = 4x² + 6y',
        'Each partial ignores the terms that do not contain its variable.',
      ),
      questions: [
        choose(
          '$f(x, y) = x^3 + 2y$. What is $\\frac{\\partial f}{\\partial x}$?',
          ['$3x^2 + 2$', '$3x^2$', '$2$', '$x^3$'],
          1,
          '$2y$ is constant when only $x$ moves.',
        ),
        typeNumber(
          '$f(x, y) = x^3 + 2y$. What is $\\frac{\\partial f}{\\partial y}$?',
          2,
          '$x^3$ is constant when only $y$ moves, and $2y$ has derivative 2.',
        ),
        choose(
          '$f(a, b) = 5ab$. What is $\\frac{\\partial f}{\\partial a}$?',
          ['$5a$', '$5$', '$ab$', '$5b$'],
          3,
          'With $b$ held fixed, $5b$ is the constant multiplying $a$.',
        ),
        choose(
          '$f(x, y) = x^2y^3$. What is $\\frac{\\partial f}{\\partial y}$?',
          ['$2xy^3$', '$3x^2y^2$', '$6xy^2$', '$x^2$'],
          1,
          '$x^2$ is a constant factor, and $y^3$ differentiates to $3y^2$.',
        ),
      ],
    },
    {
      title: 'Evaluate partial derivatives at a point',
      explanation: [
        'A partial derivative is itself a function of all the inputs. To get the rate at a point, differentiate first, then substitute every coordinate. $\\frac{\\partial f}{\\partial x}$ at $(1, 2)$ says how fast $f$ changes when $x$ moves away from 1 while $y$ stays at 2.',
      ],
      example: {
        code: 'x = 2\ny = 5\nprint(2 * x * y, x ** 2 + 3)',
        output: '20 7',
        explanation:
          'For $f(x, y) = x^2y + 3y$, $\\frac{\\partial f}{\\partial x} = 2xy$ and $\\frac{\\partial f}{\\partial y} = x^2 + 3$; at $(2, 5)$ they are 20 and 7.',
      },
      questions: [
        typeNumber(
          '$f(x, y) = 3x + xy^2$. What is $\\frac{\\partial f}{\\partial x}$ at $(1, 3)$?',
          12,
          '$\\frac{\\partial f}{\\partial x} = 3 + y^2$, which is 12 at $y = 3$.',
        ),
        typeOutput(
          'For $f(x, y) = x^2y$, this program prints $\\frac{\\partial f}{\\partial x}$ and then $\\frac{\\partial f}{\\partial y}$ at $(3, 4)$. What does it print?',
          'x = 3\ny = 4\nprint(2 * x * y, x ** 2)',
          '24 9',
          '$\\frac{\\partial f}{\\partial x} = 2xy = 24$ and $\\frac{\\partial f}{\\partial y} = x^2 = 9$.',
        ),
        choose(
          '$g(u, v) = u^2 + v^2$. At $(0, 5)$, which partial derivative is larger?',
          [
            '$\\frac{\\partial g}{\\partial u}$',
            'They are equal',
            'Neither exists',
            '$\\frac{\\partial g}{\\partial v}$',
          ],
          3,
          '$\\frac{\\partial g}{\\partial u} = 2u = 0$ and $\\frac{\\partial g}{\\partial v} = 2v = 10$.',
        ),
        choose(
          '$\\frac{\\partial f}{\\partial y} = -2$ at a point. What happens to $f$ if $y$ increases slightly while $x$ stays fixed?',
          [
            '$f$ decreases',
            '$f$ increases',
            '$f$ stays the same',
            '$x$ decreases',
          ],
          0,
          'A negative partial means $f$ falls as that input rises.',
        ),
      ],
    },
    {
      title: 'Take partial derivatives of a squared-error loss',
      explanation: [
        'For one example with input $x$ and target $y$, the squared error of the prediction $wx + b$ is $L(w, b) = (wx + b - y)^2$. The chain rule gives $\\frac{\\partial L}{\\partial w} = 2(wx + b - y) \\times x$ and $\\frac{\\partial L}{\\partial b} = 2(wx + b - y)$. Both share the residual factor; the weight’s partial also multiplies by the input $x$.',
      ],
      example: {
        code: 'x = 3\ny = 10\nw = 2\nb = 1\nresidual = w * x + b - y\nprint(2 * residual * x, 2 * residual)',
        output: '-18 -6',
        explanation:
          'The prediction 7 is 3 below the target, so the residual is −3; the partials are $2 \\times (-3) \\times 3$ and $2 \\times (-3)$.',
      },
      questions: [
        typeOutput(
          'This program prints $\\frac{\\partial L}{\\partial w}$ and then $\\frac{\\partial L}{\\partial b}$. What does it print?',
          'x = 2\ny = 3\nw = 1\nb = 0\nresidual = w * x + b - y\nprint(2 * residual * x, 2 * residual)',
          '-4 -2',
          'The residual is $2 - 3 = -1$, so $\\frac{\\partial L}{\\partial w} = -4$ and $\\frac{\\partial L}{\\partial b} = -2$.',
        ),
        choose(
          'The prediction equals the target exactly. What are $\\frac{\\partial L}{\\partial w}$ and $\\frac{\\partial L}{\\partial b}$?',
          ['Both 1', '$x$ and 1', 'Both 0', '$2x$ and 2'],
          2,
          'The shared residual factor is 0, so both partials vanish.',
        ),
        typeNumber(
          'For $x = 4$, the residual $wx + b - y$ is 0.5. What is $\\frac{\\partial L}{\\partial w}$?',
          4,
          '$2 \\times 0.5 \\times 4 = 4$.',
        ),
        choose(
          'Why does $\\frac{\\partial L}{\\partial w}$ contain the factor $x$ while $\\frac{\\partial L}{\\partial b}$ does not?',
          [
            'The inner derivative of $wx + b$ is $x$ for $w$ and 1 for $b$',
            '$x$ is the target value',
            '$b$ is always zero',
            'Squared error ignores $b$',
          ],
          0,
          'The chain rule multiplies by the derivative of the prediction with respect to each parameter.',
        ),
      ],
    },
  ],
  'math-gradient-vector': [
    {
      title: 'Collect partial derivatives into a gradient',
      explanation: [
        'The gradient $\\nabla f$ lists every partial derivative in the order of the inputs: for $f(x, y)$, $\\nabla f = [\\frac{\\partial f}{\\partial x}, \\frac{\\partial f}{\\partial y}]$. It is a vector with one coordinate per input, so a model with 1,000 parameters has a gradient with 1,000 coordinates.',
      ],
      example: {
        code: 'x = 1\ny = 2\ngradient = [2 * x, 6 * y]\nprint(gradient)',
        output: '[2, 12]',
        explanation:
          'For $f(x, y) = x^2 + 3y^2$, the partials are $2x$ and $6y$; at $(1, 2)$ the gradient is $[2, 12]$.',
      },
      questions: [
        choose(
          '$f(x, y) = 4x + y^2$. What is $\\nabla f$?',
          ['$[4x, y^2]$', '$[4, 2y]$', '$[2y, 4]$', '$[4, y^2]$'],
          1,
          '$\\frac{\\partial f}{\\partial x} = 4$ and $\\frac{\\partial f}{\\partial y} = 2y$, listed in input order.',
        ),
        typeOutput(
          'For $f(x, y) = x^2y$, this program builds $\\nabla f$ at $(3, 2)$. What does it print?',
          'x = 3\ny = 2\nprint([2 * x * y, x ** 2])',
          '[12, 9]',
          '$\\frac{\\partial f}{\\partial x} = 2xy = 12$ and $\\frac{\\partial f}{\\partial y} = x^2 = 9$.',
        ),
        typeNumber(
          'A loss depends on 5 weights and 1 bias. How many coordinates does its gradient have?',
          6,
          'There is one partial derivative per parameter.',
        ),
        choose(
          '$f(a, b, c) = a + 2b + 3c$. What is $\\nabla f$?',
          ['$[1, 2, 3]$', '$[a, 2b, 3c]$', '$[6]$', '$[0, 0, 0]$'],
          0,
          'Each partial is the constant coefficient of its input.',
        ),
      ],
    },
    {
      title: 'Read direction from the gradient',
      explanation: [
        "At a point, the gradient points in the direction of steepest increase, and the negative gradient points in the direction of steepest decrease. Each coordinate's sign says whether raising that input raises or lowers $f$, and its size says how sensitive $f$ is to that input there.",
      ],
      example: worked(
        '∇f = [3, −0.5] at a point',
        'raising x increases f quickly; raising y decreases f slowly; f decreases fastest along [−3, 0.5]',
        'Reverse every coordinate of the gradient to point downhill.',
      ),
      questions: [
        choose(
          '$\\nabla f = [-2, 4]$ at a point. Which direction decreases $f$ fastest?',
          ['$[-2, 4]$', '$[2, -4]$', '$[4, -2]$', '$[-4, 2]$'],
          1,
          'Steepest decrease is the negative gradient.',
        ),
        choose(
          '$\\nabla L = [0.1, -7]$ for the weights $(w_1, w_2)$. To which weight is $L$ more sensitive here?',
          ['$w_2$', '$w_1$', 'Both equally', 'Neither'],
          0,
          'The second coordinate is much larger in size, whatever its sign.',
        ),
        choose(
          '$\\nabla f = [5, 0]$ at a point. What happens to $f$ if only $y$ changes slightly?',
          [
            '$f$ increases quickly',
            '$f$ decreases quickly',
            '$f$ barely changes',
            '$f$ becomes 0',
          ],
          2,
          'The $y$-coordinate of the gradient is 0, so $f$ is flat in that direction.',
        ),
        choose(
          'Which statement about the gradient is true?',
          [
            'It always points toward the minimum',
            'It is a single number',
            'It is zero everywhere on a slope',
            'It points uphill, toward steepest increase',
          ],
          3,
          'The gradient gives the locally steepest uphill direction.',
        ),
      ],
    },
    {
      title: 'Recognize a zero gradient',
      explanation: [
        'Where every partial derivative is 0, the gradient is the zero vector and the function is flat in every input direction. Minima, maxima, and saddle points all have zero gradients, so a zero gradient says the point is flat, not which kind of point it is.',
      ],
      example: worked(
        'f(x, y) = (x − 1)² + (y + 2)²\n∇f = [2(x − 1), 2(y + 2)]',
        '∇f = [0, 0] only at (1, −2), the minimum',
        'Both partials must vanish together.',
      ),
      questions: [
        choose(
          '$f(x, y) = (x - 3)^2 + y^2$. Where is $\\nabla f$ the zero vector?',
          ['$(0, 0)$', '$(3, 0)$', '$(-3, 0)$', '$(3, 3)$'],
          1,
          '$2(x - 3) = 0$ needs $x = 3$, and $2y = 0$ needs $y = 0$.',
        ),
        choose(
          '$\\nabla f = [0, 0]$ at a point. What can you conclude?',
          [
            '$f$ has its global minimum there',
            '$f$ equals 0 there',
            '$f$ is flat in every input direction there',
            'Every input is 0 there',
          ],
          2,
          'A zero gradient means flat, which minima, maxima, and saddles all share.',
        ),
        choose(
          '$\\nabla f = [0, 3]$ at a point. Is the gradient zero there?',
          [
            'Yes, because one coordinate is 0',
            'Only if $x = 0$',
            'It depends on the value of $f$',
            'No, because one partial derivative is not 0',
          ],
          3,
          'The zero vector needs every coordinate to be 0.',
        ),
        choose(
          '$f(x, y) = x^2 - y^2$. What is $\\nabla f$ at $(0, 0)$?',
          ['$[0, 0]$', '$[2, -2]$', '$[1, -1]$', '$[0, -2]$'],
          0,
          '$\\nabla f = [2x, -2y]$, which is $[0, 0]$ at the origin.',
        ),
      ],
    },
  ],
  'math-gradients': [
    {
      title: 'Take one gradient descent step',
      explanation: [
        "Gradient descent moves a parameter against its derivative: $w_{\\text{new}} = w - \\text{learning\\_rate} \\times f'(w)$. For $f(w) = (w - 3)^2$, $f'(w) = 2(w - 3)$. Left of the minimum the derivative is negative, so subtracting it moves $w$ to the right, toward 3.",
      ],
      example: {
        code: 'w = 0.0\nlearning_rate = 0.25\ngradient = 2 * (w - 3)\nw = w - learning_rate * gradient\nprint(gradient, w)',
        output: '-6.0 1.5',
        explanation:
          'The derivative −6.0 points left, so the step moves right by $0.25 \\times 6 = 1.5$.',
      },
      questions: [
        typeOutput(
          'This program takes one step on $f(w) = (w - 3)^2$. What does it print?',
          'w = 5.0\nlearning_rate = 0.25\ngradient = 2 * (w - 3)\nw = w - learning_rate * gradient\nprint(w)',
          '4.0',
          'The derivative is 4.0, so $w$ moves from 5.0 to $5.0 - 1.0 = 4.0$.',
        ),
        choose(
          "$f'(w) = 8$ at the current $w$ and the learning rate is 0.1. How does $w$ change?",
          [
            'It increases by 0.8',
            'It decreases by 8',
            'It decreases by 0.8',
            'It becomes 0.8',
          ],
          2,
          'The step subtracts $0.1 \\times 8 = 0.8$.',
        ),
        choose(
          'The derivative at the current $w$ is negative. Which way does a gradient descent step move $w$?',
          [
            'Toward smaller $w$',
            'It stays put',
            'Straight to 0',
            'Toward larger $w$',
          ],
          3,
          'Subtracting a negative derivative increases $w$.',
        ),
        choose(
          'At $w = 3$ the derivative of $(w - 3)^2$ is 0. What does a step do?',
          [
            'Leaves $w$ at 3',
            'Moves $w$ to 0',
            'Doubles $w$',
            'Moves $w$ by the learning rate',
          ],
          0,
          'The step size is $\\text{learning\\_rate} \\times 0 = 0$.',
        ),
      ],
    },
    {
      title: 'Update every parameter with the gradient vector',
      explanation: [
        'With several parameters, one step updates all of them together: $\\text{new parameters} = \\text{parameters} - \\text{learning\\_rate} \\times \\text{gradient}$, coordinate by coordinate. Compute the whole gradient at the current point before changing any parameter.',
      ],
      example: {
        code: 'w = [1.0, -2.0]\ngradient = [4.0, -2.0]\nlearning_rate = 0.5\nw = [w[i] - learning_rate * gradient[i] for i in range(len(w))]\nprint(w)',
        output: '[-1.0, -1.0]',
        explanation:
          'Each coordinate moves against its own partial derivative: $1 - 2 = -1$ and $-2 + 1 = -1$.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          'w = [2.0, 0.0]\ngradient = [1.0, -4.0]\nlearning_rate = 0.5\nw = [w[i] - learning_rate * gradient[i] for i in range(len(w))]\nprint(w)',
          '[1.5, 2.0]',
          '$2.0 - 0.5 = 1.5$ and $0.0 + 2.0 = 2.0$.',
        ),
        choose(
          'Parameters $[3, 3]$, gradient $[2, -6]$, learning rate 0.5. What are the new parameters?',
          ['$[4, 0]$', '$[1, 9]$', '$[2, 0]$', '$[2, 6]$'],
          3,
          '$[3 - 1, 3 + 3] = [2, 6]$.',
        ),
        choose(
          'Why compute the full gradient before updating any parameter?',
          [
            'Every partial must be evaluated at the same current point',
            'Parameters must be updated in alphabetical order',
            'Otherwise the gradient changes its length',
            'It makes the learning rate smaller',
          ],
          0,
          'Updating one parameter first would change the point where the others are evaluated.',
        ),
        choose(
          '$f(x, y) = x^2 + y^2$ at $(2, -1)$ with learning rate 0.25. Where does one step land?',
          ['$(3, -1.5)$', '$(1, -0.5)$', '$(1, -1)$', '$(0, 0)$'],
          1,
          '$\\nabla f = [4, -2]$, so the step is $(2 - 1, -1 + 0.5)$.',
        ),
      ],
    },
    {
      title: 'Choose a learning rate',
      explanation: [
        'The learning rate sets the step size. Too small and progress is slow; too large and a step jumps past the minimum, so the loss bounces or grows. For $f(w) = w^2$, one step gives $w - r \\times 2w = (1 - 2r)w$: with $r = 0.1$ the parameter shrinks by 20% per step, while with $r = 1.5$ it flips sign and doubles in size.',
      ],
      example: {
        code: 'w = 1.0\nw = w - 1.5 * 2 * w\nprint(w)\nw = w - 1.5 * 2 * w\nprint(w)',
        output: '-2.0\n4.0',
        explanation:
          'With learning rate 1.5 on $w^2$, each step overshoots the minimum at 0 and lands twice as far away.',
      },
      questions: [
        typeOutput(
          'This program takes one step on $f(w) = w^2$ with learning rate 0.25. What does it print?',
          'w = 4.0\nw = w - 0.25 * 2 * w\nprint(w)',
          '2.0',
          'The derivative is 8.0, and $4.0 - 0.25 \\times 8.0 = 2.0$.',
        ),
        choose(
          'Training loss grows larger and larger after the learning rate was increased. What is the most likely cause?',
          [
            'The loss is convex',
            'Steps overshoot the minimum and diverge',
            'The gradient is zero',
            'The learning rate is now too small',
          ],
          1,
          'Oversized steps jump past the minimum to points with higher loss.',
        ),
        typeNumber(
          'For $f(w) = w^2$, which learning rate makes one step land exactly on the minimum from any $w$?',
          0.5,
          'The step gives $(1 - 2r)w$, which is 0 when $r = 0.5$.',
        ),
        choose(
          'The loss decreases steadily but extremely slowly. Which change is most likely to help?',
          [
            'A negative learning rate',
            'Turning off gradient computation',
            'A somewhat larger learning rate',
            'A learning rate of 100',
          ],
          2,
          'Moderately larger steps speed progress without necessarily overshooting.',
        ),
      ],
    },
  ],
  'math-critical-points': [
    {
      title: 'Find critical points',
      explanation: [
        "A critical point is an input where $f'(x) = 0$, so the tangent line is flat. To find critical points, differentiate, set the derivative equal to 0, and solve. A smooth function's local minima and maxima can occur only at critical points, because anywhere else the function is still rising or falling.",
      ],
      example: worked(
        'f(x) = x² − 10x + 3\nf′(x) = 2x − 10 = 0',
        'x = 5',
        'Solving $2x - 10 = 0$ gives the only flat point of the graph.',
      ),
      questions: [
        choose(
          '$f(x) = 3x^2 - 12x + 1$. Where is its critical point?',
          ['$x = 4$', '$x = 2$', '$x = -2$', '$x = 12$'],
          1,
          "$f'(x) = 6x - 12 = 0$ at $x = 2$.",
        ),
        choose(
          '$f(x) = x^3 - 12x$. What are its critical points?',
          [
            '$x = 2$ only',
            '$x = 0$ and $x = 12$',
            '$x = -2$ and $x = 2$',
            '$x = 4$',
          ],
          2,
          "$f'(x) = 3x^2 - 12 = 0$ when $x^2 = 4$.",
        ),
        choose(
          'Why must a local minimum of a smooth function be a critical point?',
          [
            'Every point is a minimum',
            'The function value is 0 there',
            'Critical points are where $f$ is largest',
            "If $f'$ were not 0, a small step one way would lower $f$",
          ],
          3,
          'A nonzero slope always offers a nearby lower point.',
        ),
        typeNumber(
          '$f(x) = 2x^2 + 8x$. What is the value of $f$ at its critical point?',
          -8,
          "$f'(x) = 4x + 8 = 0$ at $x = -2$, and $f(-2) = 8 - 16 = -8$.",
        ),
      ],
    },
    {
      title: 'Classify a critical point by sign changes',
      explanation: [
        "Check the sign of $f'$ just left and just right of a critical point. Negative then positive means $f$ falls then rises: a local minimum. Positive then negative means a local maximum. If the sign does not change, as for $x^3$ at 0, the point is neither.",
      ],
      example: worked(
        'f(x) = x³ − 3x²\nf′(x) = 3x² − 6x = 3x(x − 2), zero at x = 0 and x = 2\nf′(−1) = 9, f′(1) = −3, f′(3) = 9',
        'x = 0 is a local maximum; x = 2 is a local minimum',
        'The derivative changes from + to − at 0 and from − to + at 2.',
      ),
      questions: [
        choose(
          "$f'(x) = 2x - 6$. What kind of point is $x = 3$?",
          [
            'A local maximum',
            'A local minimum',
            'Neither',
            'Not a critical point',
          ],
          1,
          "$f'(2) = -2$ and $f'(4) = 2$: falling, then rising.",
        ),
        choose(
          "$f'(x) = -4x$. What kind of point is $x = 0$?",
          [
            'A local minimum',
            'Neither',
            'A local maximum',
            'Not a critical point',
          ],
          2,
          "$f'$ is positive for $x < 0$ and negative for $x > 0$: rising, then falling.",
        ),
        choose(
          "$f'(x) = 3x^2$. Is $x = 0$ a minimum of $f$?",
          [
            'Yes',
            'No, it is a maximum',
            "Yes, because $f'(0) = 0$",
            "No: $f'$ is positive on both sides, so $f$ keeps rising",
          ],
          3,
          'Without a sign change the flat point is neither a minimum nor a maximum.',
        ),
        choose(
          "$f'$ is positive for $x < 1$ and negative for $x > 1$. What is $x = 1$?",
          ['A local maximum', 'A local minimum', 'Neither', 'A zero of $f$'],
          0,
          '$f$ rises up to $x = 1$ and falls after it.',
        ),
      ],
    },
    {
      title: 'Distinguish local from global minima',
      explanation: [
        'A local minimum is lower than every nearby point; the global minimum is the lowest value anywhere. A function can have several local minima of different heights. To find the global minimum, compare $f$ at the candidates, and check the ends of the allowed inputs when the domain is limited.',
      ],
      example: worked(
        'f(x) = x⁴ − 8x²\nf′(x) = 4x³ − 16x = 0 at x = −2, 0, 2\nf(−2) = −16, f(0) = 0, f(2) = −16',
        'global minimum −16 at x = ±2; x = 0 is a local maximum',
        'Comparing the values at all critical points identifies the lowest ones.',
      ),
      questions: [
        typeNumber(
          'A function has local minima with values 3, −1, and 5 and grows without bound in both directions. What is its global minimum value?',
          -1,
          'The global minimum is the lowest of the local minima here.',
        ),
        choose(
          'Which statement is true?',
          [
            'Every local minimum is the global minimum',
            'A function has exactly one local minimum',
            'Every global minimum is also a local minimum',
            'Local minima have the value 0',
          ],
          2,
          'The lowest point overall is also lowest among its neighbors.',
        ),
        choose(
          '$f(x) = x^2$ is restricted to $1 \\le x \\le 3$. Where is its minimum?',
          ['$x = 0$', '$x = 3$', '$x = 2$', '$x = 1$'],
          3,
          'The critical point $x = 0$ lies outside the domain, and $f$ increases on it, so the minimum is at the left end.',
        ),
        typeNumber(
          '$f(x) = (x - 2)^2 + 7$. What is its global minimum value?',
          7,
          'The square is at least 0 and equals 0 at $x = 2$, leaving 7.',
        ),
      ],
    },
  ],
  'math-convexity': [
    {
      title: 'Recognize a convex function',
      explanation: [
        'A function is convex when the straight segment (chord) between any two points of its graph lies on or above the graph: the graph is bowl-shaped and never bends downward. Lines, $x^2$, $(x - 5)^2$, and $e^x$ are convex. $-x^2$ and $x^3$ are not, because each has a chord that passes below the graph.',
      ],
      example: worked(
        'f(x) = x²: the chord from (−1, 1) to (3, 9) has height 5 at x = 1, and f(1) = 1\ng(x) = −x²: the chord from (−1, −1) to (1, −1) has height −1 at x = 0, and g(0) = 0',
        'f stays below its chord, so it can be convex; g rises above its chord, so it is not convex',
        'One chord dipping below the graph is enough to rule out convexity.',
      ),
      questions: [
        choose(
          'Which function is convex?',
          ['$-x^2$', '$(x + 4)^2$', '$x^3$', '$-e^x$'],
          1,
          'An upward parabola is bowl-shaped everywhere.',
        ),
        choose(
          'The chord between two points of a graph dips below the curve between them. What follows?',
          [
            'The function is convex',
            'The function is linear',
            'The function is not convex',
            'The function has no minimum',
          ],
          2,
          'Convexity requires every chord to stay on or above the graph.',
        ),
        choose(
          'Is $f(x) = 3x + 2$ convex?',
          [
            'No, because a line has no minimum',
            'No, because it is increasing',
            'Only for $x > 0$',
            'Yes, because every chord lies on the graph',
          ],
          3,
          'Chords of a line coincide with the line, which satisfies "on or above".',
        ),
        choose(
          '$f$ is convex. Its chord from $(0, 4)$ to $(4, 12)$ has height 8 at $x = 2$. What can $f(2)$ be?',
          [
            'Any value above 8',
            'Any value up to 8, such as 5',
            'Exactly 8 only',
            'Any value at all',
          ],
          1,
          'For a convex function the graph lies on or below each chord.',
        ),
      ],
    },
    {
      title: 'Test convexity with the second derivative',
      explanation: [
        "The second derivative $f''$ is the derivative of $f'$, so it measures how the slope changes. For a function of one input with a second derivative, $f''(x) \\ge 0$ everywhere means the slope never decreases, which is exactly convexity. For $f(x) = x^4$, $f' = 4x^3$ and $f'' = 12x^2 \\ge 0$, so $x^4$ is convex.",
      ],
      example: worked(
        'f(x) = x³ − 6x\nf′(x) = 3x² − 6\nf″(x) = 6x',
        'f″ is negative for x < 0, so f is not convex',
        "Wherever $f''$ is negative, the slope is decreasing and the graph bends downward.",
      ),
      questions: [
        typeNumber(
          "$f(x) = 5x^2$. What is $f''(x)$?",
          10,
          "$f'(x) = 10x$, and its derivative is 10.",
        ),
        choose(
          "$f(x) = x^3$. Where is $f''(x)$ negative?",
          ['For $x > 0$', 'Nowhere', 'For $x < 0$', 'Everywhere'],
          2,
          "$f''(x) = 6x$, which is negative for negative $x$.",
        ),
        choose(
          "$f''(x) = 2$ for every $x$. What can you conclude?",
          [
            '$f$ is decreasing',
            '$f$ has no minimum',
            '$f$ is linear',
            '$f$ is convex',
          ],
          3,
          'A positive second derivative everywhere means the slope keeps increasing.',
        ),
        typeNumber(
          "$f(x) = x^4 - 2x^2$. What is $f''(0)$?",
          -4,
          "$f' = 4x^3 - 4x$ and $f'' = 12x^2 - 4$, which is −4 at 0.",
        ),
      ],
    },
    {
      title: 'Trust the flat points of convex functions',
      explanation: [
        'For a convex differentiable function, every point where the derivative or gradient is zero is a global minimum, so gradient descent with a suitable step cannot get stuck in a worse dip. When the derivative is positive, every minimizer lies to the left; when negative, to the right. Squared-error loss for linear regression is convex in its weights, which is why its minimizer is reliable.',
      ],
      example: worked(
        'f(w) = (w − 4)² + 1 is convex\nf′(w) = 2(w − 4) = 0 at w = 4',
        'w = 4 is the global minimum, with f(4) = 1',
        'Because $f$ is convex, the single flat point is guaranteed to be the lowest point overall.',
      ),
      questions: [
        choose(
          "$f$ is convex and $f'(7) = 0$. Which statement is true?",
          [
            '$f(7)$ is a maximum',
            '$f(7) = 0$',
            '$f(7) \\le f(x)$ for every $x$',
            'There may be a lower dip elsewhere',
          ],
          2,
          'A flat point of a convex differentiable function is a global minimum.',
        ),
        choose(
          'Why is it reassuring when a loss is convex?',
          [
            'Its minimum value is always 0',
            'Any flat point found is the global minimum',
            'It needs no learning rate',
            'Its gradient is never zero',
          ],
          1,
          'Descent cannot settle in a worse local dip because there is none.',
        ),
        choose(
          '$f(w) = (w + 2)^2$. At which $w$ does gradient descent settle?',
          ['$w = 2$', '$w = 0$', '$w = 4$', '$w = -2$'],
          3,
          "$f'(w) = 2(w + 2)$ is 0 only at $w = -2$.",
        ),
        choose(
          "A convex function has $f'(1) = 3$. Where can its minimizer be?",
          ['To the left of 1', 'To the right of 1', 'At $x = 1$', 'At $x = 3$'],
          0,
          'The function is rising at 1, and a convex function keeps rising to the right.',
        ),
      ],
    },
    {
      title: 'Recognize where nonconvex functions can stall descent',
      explanation: [
        'A nonconvex function can have several local minima of different heights, local maxima, and saddle points. At a saddle point the gradient is zero, yet the function rises in some directions and falls in others: $f(x, y) = x^2 - y^2$ at $(0, 0)$ rises along $x$ and falls along $y$. Neural-network losses are nonconvex, so a zero gradient does not prove the best solution was found.',
      ],
      example: worked(
        'f(x, y) = x² − y²\n∇f = [2x, −2y] = [0, 0] at (0, 0)\nf(1, 0) = 1 and f(0, 1) = −1',
        '(0, 0) is a saddle point',
        'Moving along $x$ raises $f$ and moving along $y$ lowers it, although the gradient is zero.',
      ),
      questions: [
        choose(
          '$f(x, y) = y^2 - x^2$. What kind of point is $(0, 0)$?',
          [
            'A global minimum',
            'A saddle point',
            'A global maximum',
            'Not a critical point',
          ],
          1,
          'The gradient is zero, but $f$ rises along $y$ and falls along $x$.',
        ),
        choose(
          'Gradient descent stops at a point with zero gradient on a nonconvex loss. What do you know?',
          [
            'It is the global minimum',
            'The loss is 0 there',
            'The point is flat, but it may not be the global minimum',
            'The learning rate was too large',
          ],
          2,
          'Local minima and saddle points are also flat.',
        ),
        choose(
          'Which function has two separate local minima?',
          ['$(x - 1)^2$', '$3x + 1$', '$e^x$', '$x^4 - 2x^2$'],
          3,
          'Its minima at $x = -1$ and $x = 1$ are separated by a local maximum at 0.',
        ),
        choose(
          'What is the gradient at a saddle point?',
          [
            'The zero vector',
            'Largest in every direction',
            'Positive in every coordinate',
            'Undefined',
          ],
          0,
          'A saddle point is a critical point, so every partial derivative is 0.',
        ),
      ],
    },
  ],
  'math-vectors': [
    {
      title: 'Store features as an ordered vector',
      explanation: [
        'A vector is an ordered list of numbers, one coordinate per feature. Position carries meaning: in [bedrooms, area, price], the first coordinate is always the number of bedrooms. Two vectors can be compared or combined only when they have the same length and the same coordinate order.',
      ],
      example: {
        code: 'house = [3, 120, 250]\nprint(house[1])\nprint(len(house))',
        output: '120\n3',
        explanation:
          'Position 1 holds the area, and the vector has three coordinates, one per feature.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          'x = [5, 0, 2, 7]\nprint(x[2])',
          '2',
          'Positions start at 0, so position 2 is the third coordinate.',
        ),
        typeNumber(
          'Customer vectors store [age, visits, spend]. One customer is [41, 6, 300]. What is the visits coordinate?',
          6,
          'Visits is the second feature, so it is the second coordinate.',
        ),
        choose(
          'Two feature vectors list the same features in different orders. What must happen before combining them?',
          [
            'Sort each vector by value',
            'Add their lengths',
            'Nothing, because order is irrelevant',
            'Put both in the same coordinate order',
          ],
          3,
          'Coordinates are matched by position, so positions must mean the same feature.',
        ),
        typeOutput(
          'What does this program print?',
          'v = [4, 1, 8]\nprint(len(v), v[0] + v[2])',
          '3 12',
          'There are 3 coordinates, and the first and last are 4 and 8.',
        ),
      ],
    },
    {
      title: 'Add vectors and scale them',
      explanation: [
        'Vectors of the same length add coordinate by coordinate: $[1, 2] + [3, 5] = [4, 7]$. Multiplying by a number $c$ scales every coordinate: $3 \\times [1, 2] = [3, 6]$. In Python, + on two lists joins them instead, so vector arithmetic needs a comprehension over the positions.',
      ],
      example: {
        code: 'a = [1, 2, 3]\nb = [10, 20, 30]\nprint([a[i] + b[i] for i in range(len(a))])\nprint(a + b)',
        output: '[11, 22, 33]\n[1, 2, 3, 10, 20, 30]',
        explanation:
          'The comprehension adds matching coordinates; list + only concatenates.',
      },
      questions: [
        choose(
          'What is $[2, -1] + [4, 3]$?',
          ['$[2, -1, 4, 3]$', '$[6, 2]$', '$[8, -3]$', '$[6, 4]$'],
          1,
          'Add matching coordinates: $2 + 4$ and $-1 + 3$.',
        ),
        typeOutput(
          'What does this program print?',
          'v = [1, -2, 4]\nprint([3 * x for x in v])',
          '[3, -6, 12]',
          'The comprehension multiplies every coordinate by 3.',
        ),
        typeOutput(
          'What does this program print?',
          'a = [1, 2]\nb = [3, 4]\nprint(a + b)',
          '[1, 2, 3, 4]',
          'For Python lists, + joins them; it is not vector addition.',
        ),
        choose(
          'What is $2 \\times [1, 0, -3] - [2, 2, 2]$?',
          ['$[0, -2, -8]$', '$[-1, -2, -5]$', '$[0, 2, -4]$', '$[2, 0, -6]$'],
          0,
          'Scale first to $[2, 0, -6]$, then subtract 2 from each coordinate.',
        ),
      ],
    },
    {
      title: 'Compute a dot product',
      explanation: [
        'The dot product $a \\cdot b$ multiplies corresponding coordinates and adds the products: $[2, 3] \\cdot [4, 1] = 8 + 3 = 11$. The result is a single number, not a vector, and both vectors must have the same length.',
      ],
      example: {
        code: 'a = [2, 3, -1]\nb = [4, 1, 5]\nprint([a[i] * b[i] for i in range(len(a))])\nprint(a[0] * b[0] + a[1] * b[1] + a[2] * b[2])',
        output: '[8, 3, -5]\n6',
        explanation:
          'The coordinate products are 8, 3, and −5, and the dot product is their sum, 6.',
      },
      questions: [
        typeNumber(
          'What is $[1, -2, 3] \\cdot [4, 0, -1]$?',
          1,
          '$4 + 0 - 3 = 1$; the dot product is a single number.',
        ),
        typeOutput(
          'What does this program print?',
          'a = [3, 1]\nb = [2, 5]\nprint([a[i] * b[i] for i in range(len(a))])',
          '[6, 5]',
          'The comprehension keeps the separate products; it does not add them.',
        ),
        typeOutput(
          'What does this program print?',
          'a = [2, 0, 1]\nb = [1, 4, 3]\nprint(a[0] * b[0] + a[1] * b[1] + a[2] * b[2])',
          '5',
          '$2 \\times 1 + 0 \\times 4 + 1 \\times 3 = 5$.',
        ),
        choose(
          'Why is there no dot product of $[1, 2, 3]$ and $[4, 5]$?',
          [
            'Dot products need sorted vectors',
            'The lengths differ, so a coordinate has no partner',
            'The result would be negative',
            'One vector has an odd length',
          ],
          1,
          'Every coordinate must pair with the matching coordinate of the other vector.',
        ),
      ],
    },
    {
      title: 'Read a weighted sum as a dot product',
      explanation: [
        "A linear model's score is the dot product of a weight vector with a feature vector, plus an intercept: $\\text{score} = w \\cdot x + b$. Each weight scales its own coordinate, so swapping two features without swapping their weights changes the score.",
      ],
      example: worked(
        'x = [2, 3] (rooms, floors), w = [50, 20], b = 10\nw · x + b = 2 × 50 + 3 × 20 + 10',
        '170',
        'Each feature is multiplied by its own weight before the intercept is added.',
      ),
      questions: [
        typeNumber(
          '$w = [0.5, -1]$, $x = [4, 2]$, and $b = 3$. What is $w \\cdot x + b$?',
          3,
          '$0.5 \\times 4 - 1 \\times 2 + 3 = 2 - 2 + 3 = 3$.',
        ),
        choose(
          '$w = [2, 1]$. The features $x = [3, 7]$ are accidentally entered as $[7, 3]$. How does $w \\cdot x$ change?',
          [
            'It stays 13',
            'It goes from 13 to 10',
            'It goes from 17 to 13',
            'It goes from 13 to 17',
          ],
          3,
          '$2 \\times 3 + 1 \\times 7 = 13$, but $2 \\times 7 + 1 \\times 3 = 17$.',
        ),
        choose(
          'A weight is 0. What does its feature contribute to $w \\cdot x$?',
          ['Its full value', 'Nothing', 'A constant 1', 'The intercept'],
          1,
          'Its product with the feature is 0 whatever the feature value.',
        ),
        typeNumber(
          '$w = [1, 1, 1]$ and $x = [4, 9, 2]$. What is $w \\cdot x$?',
          15,
          'With all weights 1, the dot product adds the coordinates.',
        ),
      ],
    },
  ],
  'math-vector-norm': [
    {
      title: 'Compute the Euclidean norm',
      explanation: [
        'The Euclidean norm $\\lVert v \\rVert$ is the length of $v$: square each coordinate, add the squares, and take the square root. In two dimensions this is the Pythagorean theorem: $\\lVert [3, 4] \\rVert = \\sqrt{9 + 16} = 5$. It also equals $\\sqrt{v \\cdot v}$. In Python, x ** 0.5 is the square root of x.',
      ],
      example: {
        code: 'v = [6, 8]\ntotal = 0\nfor x in v:\n    total += x * x\nprint(total, total ** 0.5)',
        output: '100 10.0',
        explanation:
          'The squares 36 and 64 add to 100, and the length is its square root, 10.0.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          'v = [1, 2, 2]\ntotal = 0\nfor x in v:\n    total += x * x\nprint(total ** 0.5)',
          '3.0',
          'The squares sum to 9, and $\\sqrt{9} = 3.0$. Adding the coordinates would wrongly give 5.',
        ),
        typeNumber(
          'What is $\\lVert [-5, 12] \\rVert$?',
          13,
          '$\\sqrt{25 + 144} = \\sqrt{169} = 13$.',
        ),
        choose(
          'Which vector has norm 0?',
          ['$[0, 0, 0]$', '$[1, -1]$', '$[0, 1]$', '$[-3, 3]$'],
          0,
          'Only the zero vector has length 0; squares of nonzero coordinates are positive.',
        ),
        typeNumber(
          '$v = [3, 4]$ has norm 5. What is $v \\cdot v$?',
          25,
          '$v \\cdot v = 9 + 16 = 25$, the square of the norm.',
        ),
      ],
    },
    {
      title: 'Scale vectors and make unit vectors',
      explanation: [
        'Multiplying a vector by $c$ multiplies its length by $|c|$: $\\lVert cv \\rVert = |c| \\lVert v \\rVert$, and a length is never negative. Dividing a nonzero vector by its own norm gives a unit vector of length 1 pointing the same way, which keeps the direction and discards the size.',
      ],
      example: {
        code: 'v = [3, 4]\nlength = 5\nprint([x / length for x in v])',
        output: '[0.6, 0.8]',
        explanation:
          'Each coordinate is divided by the length 5; the result has length $\\sqrt{0.36 + 0.64} = 1$.',
      },
      questions: [
        typeNumber(
          '$\\lVert v \\rVert = 2$. What is $\\lVert 5v \\rVert$?',
          10,
          'Scaling by 5 multiplies the length by 5.',
        ),
        typeOutput(
          'What does this program print?',
          'v = [0, -6]\nlength = 6\nprint([x / length for x in v])',
          '[0.0, -1.0]',
          'Dividing keeps each sign, and / always produces floats.',
        ),
        choose(
          'What is the unit vector in the direction of $[5, 12]$?',
          ['$[5/17, 12/17]$', '$[1, 1]$', '$[0.5, 0.5]$', '$[5/13, 12/13]$'],
          3,
          'The norm is 13, so divide each coordinate by 13.',
        ),
        typeNumber(
          '$\\lVert v \\rVert = 3$. What is $\\lVert -2v \\rVert$?',
          6,
          'The length is multiplied by $|-2| = 2$; it cannot be negative.',
        ),
      ],
    },
    {
      title: 'Compare L1 and L2 norms',
      explanation: [
        'The L2 (Euclidean) norm squares coordinates before adding, while the L1 norm adds their absolute values: for $[3, -4]$, L1 = 7 and L2 = 5. Ridge regularization penalizes the squared L2 norm of the weights, $\\sum w_i^2$, which punishes one large weight heavily; lasso penalizes the L1 norm, $\\sum |w_i|$, which tends to push some weights exactly to 0.',
      ],
      example: worked(
        'w = [2, −1, 0]\nL1 = |2| + |−1| + |0|\nsquared L2 = 2² + (−1)² + 0²',
        'L1 = 3, squared L2 = 5, L2 = √5 ≈ 2.24',
        'Absolute values and squares both remove signs, but squares weigh large coordinates more.',
      ),
      questions: [
        typeNumber(
          'What is the L1 norm of $[-2, 5, -1]$?',
          8,
          '$2 + 5 + 1 = 8$.',
        ),
        typeNumber(
          'What is the squared L2 norm of the weights $[3, -1]$?',
          10,
          '$9 + 1 = 10$.',
        ),
        choose(
          'The weights $[4, 0]$ and $[2, 2]$ have the same L1 norm. Which has the larger squared L2 penalty?',
          ['$[2, 2]$', 'They are equal', 'Neither has a penalty', '$[4, 0]$'],
          3,
          '16 for $[4, 0]$ versus 8 for $[2, 2]$: squaring punishes one large weight more.',
        ),
        choose(
          'Which norm does a lasso penalty use?',
          [
            'L1, the sum of absolute values',
            'Squared L2, the sum of squares',
            'The largest coordinate',
            'The number of coordinates',
          ],
          0,
          'Lasso adds the sum of absolute weights; ridge adds the sum of squares.',
        ),
      ],
    },
  ],
  'math-distance': [
    {
      title: 'Compute a Euclidean distance',
      explanation: [
        'The distance between points $a$ and $b$ is the norm of their difference, $\\lVert a - b \\rVert$: subtract coordinate by coordinate, square, add, and take the square root. The order of subtraction does not matter, because each difference is squared.',
      ],
      example: {
        code: 'a = [2, 7]\nb = [5, 3]\ntotal = 0\nfor i in range(len(a)):\n    total += (a[i] - b[i]) ** 2\nprint(total ** 0.5)',
        output: '5.0',
        explanation:
          'The differences −3 and 4 square to 9 and 16, which add to 25; the distance is 5.0.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          'a = [1, 1, 1]\nb = [3, 2, 3]\ntotal = 0\nfor i in range(len(a)):\n    total += (a[i] - b[i]) ** 2\nprint(total ** 0.5)',
          '3.0',
          'The squared differences 4, 1, and 4 add to 9, and $\\sqrt{9} = 3.0$.',
        ),
        typeNumber(
          'What is the distance between $[0, 6]$ and $[8, 0]$?',
          10,
          '$\\sqrt{64 + 36} = \\sqrt{100} = 10$.',
        ),
        typeNumber(
          '$\\operatorname{dist}(a, b) = 4$. What is $\\operatorname{dist}(b, a)$?',
          4,
          'Distance is symmetric because each difference is squared.',
        ),
        choose(
          'The distance between two points is 0. What follows?',
          [
            'One point is the origin',
            'The points are identical',
            'They are perpendicular',
            'They have equal norms but differ',
          ],
          1,
          'A sum of squares is 0 only when every difference is 0.',
        ),
      ],
    },
    {
      title: 'Find the nearest point with squared distances',
      explanation: [
        'To find which of several points is nearest, compare squared distances and skip the square root: the square root keeps the order of nonnegative numbers, so the smallest squared distance belongs to the nearest point. This is how k-means assigns each point to its closest centroid.',
      ],
      example: {
        code: 'point = [1, 2]\ncenters = [[0, 0], [2, 2], [5, 1]]\nprint([(point[0] - c[0]) ** 2 + (point[1] - c[1]) ** 2 for c in centers])',
        output: '[5, 1, 17]',
        explanation:
          'The second center has the smallest squared distance, so it is the nearest.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          'point = [3, 0]\ncenters = [[0, 0], [3, 4], [4, 1]]\nprint([(point[0] - c[0]) ** 2 + (point[1] - c[1]) ** 2 for c in centers])',
          '[9, 16, 2]',
          'The squared distances are $9 + 0$, $0 + 16$, and $1 + 1$.',
        ),
        choose(
          'The squared distances to centers A, B, and C are 12, 7, and 30. Which center is nearest?',
          ['A', 'C', 'B', 'Take square roots first to tell'],
          2,
          'The smallest squared distance marks the nearest center.',
        ),
        choose(
          'Why can a nearest-center search skip the square root?',
          [
            'Squared distances are always smaller',
            'Square roots of distances are undefined',
            'Centers always have unit length',
            'The square root keeps the order of nonnegative numbers',
          ],
          3,
          'If one squared distance is smaller, so is its square root.',
        ),
        choose(
          'A point has squared distance 9 to A and 16 to B. What are the actual distances?',
          ['3 and 4', '81 and 256', '4.5 and 8', '9 and 16'],
          0,
          'Take the square root of each squared distance.',
        ),
      ],
    },
    {
      title: 'Scale features before measuring distance',
      explanation: [
        'A distance adds squared differences from every feature, so a feature measured in large units dominates. Income in dollars, with differences in the thousands, swamps age in years, with differences in the tens, unless both are standardized first, for example as z-scores.',
      ],
      example: worked(
        'a = [30 years, 50,000 dollars], b = [60 years, 51,000 dollars]\nsquared differences: 30² = 900 and 1,000² = 1,000,000',
        'income contributes over 99.9% of the squared distance',
        'A 30-year age gap is nearly invisible next to a 1,000-dollar income gap.',
      ),
      questions: [
        choose(
          'Feature 1 is recorded in kilometers and feature 2 in millimeters. Which dominates unscaled distances?',
          ['Kilometers', 'Millimeters', 'Both equally', 'Neither'],
          1,
          'The same physical change produces far larger numbers in millimeters.',
        ),
        choose(
          'A height feature changes from meters to centimeters. What happens to its contribution to a squared distance?',
          [
            'It grows 100 times',
            'It is unchanged',
            'It grows 10,000 times',
            'It shrinks 100 times',
          ],
          2,
          'Each difference grows 100 times, so its square grows $100^2$ times.',
        ),
        choose(
          'What is a sound step before clustering customers by age and income?',
          [
            'Sort the customers by income',
            'Drop the age feature',
            'Square the income values',
            'Standardize both features',
          ],
          3,
          'Standardizing puts both features on comparable scales.',
        ),
        typeNumber(
          'After standardizing, two points differ by 3 in one feature and 4 in the other. What is their distance?',
          5,
          '$\\sqrt{9 + 16} = 5$.',
        ),
      ],
    },
  ],
  'math-cosine-similarity': [
    {
      title: 'Compute cosine similarity',
      explanation: [
        'Cosine similarity divides the dot product by both lengths: $\\cos(a, b) = (a \\cdot b) / (\\lVert a \\rVert \\lVert b \\rVert)$. The result is the cosine of the angle between the vectors, and it always lies between −1 and 1.',
      ],
      example: {
        code: 'a = [1, 0]\nb = [3, 4]\ndot = a[0] * b[0] + a[1] * b[1]\nprint(dot / (1 * 5))',
        output: '0.6',
        explanation:
          '$a \\cdot b = 3$, $\\lVert a \\rVert = 1$, and $\\lVert b \\rVert = 5$, so the cosine similarity is $3 / 5 = 0.6$.',
      },
      questions: [
        typeNumber(
          '$a \\cdot b = 6$, $\\lVert a \\rVert = 2$, and $\\lVert b \\rVert = 5$. What is the cosine similarity?',
          0.6,
          '$6 / (2 \\times 5) = 0.6$.',
        ),
        predictOutput(
          'What does this program print?',
          'a = [2, 2]\nb = [0, 3]\ndot = a[0] * b[0] + a[1] * b[1]\nnorm_a = (a[0] ** 2 + a[1] ** 2) ** 0.5\nnorm_b = (b[0] ** 2 + b[1] ** 2) ** 0.5\nprint(dot / (norm_a * norm_b))',
          ['6', '0.5', '0.7071067811865475', '1.0'],
          2,
          '$6 / (\\sqrt{8} \\times 3) = 1 / \\sqrt{2} \\approx 0.707$: an angle of 45°.',
        ),
        typeNumber(
          'What is the cosine similarity of $[4, 0]$ and $[0, -2]$?',
          0,
          'The dot product is 0, so the vectors are perpendicular.',
        ),
        typeNumber(
          'What is the cosine similarity of $[1, 2, 2]$ and $[2, 4, 4]$?',
          1,
          'The second vector is twice the first, so they point the same way.',
        ),
      ],
    },
    {
      title: 'Interpret aligned, orthogonal, and opposite vectors',
      explanation: [
        'Cosine similarity 1 means the vectors point the same way, 0 means they are perpendicular (orthogonal), and −1 means they point in opposite directions. Two nonzero vectors are orthogonal exactly when their dot product is 0, because the norms in the denominator are positive.',
      ],
      example: worked(
        '[1, 2] · [2, −1] = 2 − 2 = 0\n[1, 2] · [−2, −4] = −2 − 8 = −10 = −(√5 × √20)',
        'the first pair is orthogonal; the second pair points in opposite directions, with cosine −1',
        '$[-2, -4]$ is −2 times $[1, 2]$, so it points exactly the other way.',
      ),
      questions: [
        choose(
          'Which pair of vectors is orthogonal?',
          [
            '$[2, 3]$ and $[4, 6]$',
            '$[2, 3]$ and $[3, -2]$',
            '$[1, 0]$ and $[1, 1]$',
            '$[2, 3]$ and $[-2, -3]$',
          ],
          1,
          '$2 \\times 3 + 3 \\times (-2) = 0$.',
        ),
        choose(
          'The cosine similarity of two vectors is −1. What is true of them?',
          [
            'They are orthogonal',
            'They are identical',
            'They point in opposite directions',
            'One of them is zero',
          ],
          2,
          'A cosine of −1 means an angle of 180°.',
        ),
        typeNumber(
          'For which $k$ is $[k, 2]$ orthogonal to $[3, 6]$?',
          -4,
          '$3k + 12 = 0$ gives $k = -4$.',
        ),
        choose(
          'Two nonzero vectors have a positive dot product. What can you say about the angle between them?',
          [
            'It is less than 90°',
            'It is exactly 90°',
            'It is more than 90°',
            'It is 180°',
          ],
          0,
          'A positive dot product gives a positive cosine.',
        ),
      ],
    },
    {
      title: 'Compare direction rather than size',
      explanation: [
        'Scaling a vector by a positive number changes its dot products and its length by the same factor, so cosine similarity does not change. That makes it useful when only the mix of coordinates matters, such as the proportions of words in two documents of very different lengths. The dot product, by contrast, grows with length.',
      ],
      example: worked(
        'document A word counts [2, 1, 0], document B [20, 10, 0]\ncos(A, B) = 50 / (√5 × √500)\nA · B = 50 but A · A = 5',
        'cos(A, B) = 1: the same topic mix, despite very different dot products',
        'B is ten times A, so their directions match exactly.',
      ),
      questions: [
        typeNumber(
          '$\\cos(a, b) = 0.4$. What is $\\cos(3a, b)$?',
          0.4,
          'The factor 3 cancels between the dot product and $\\lVert 3a \\rVert$.',
        ),
        typeNumber(
          'Document A has word counts $[1, 3]$ and B has $[10, 30]$. What is their cosine similarity?',
          1,
          'B is ten times A, so they point the same way.',
        ),
        choose(
          'Which comparison ignores how long two documents are?',
          [
            'The dot product of their word counts',
            'The Euclidean distance between their counts',
            'The difference in their total counts',
            'The cosine similarity of their word counts',
          ],
          3,
          'Only cosine similarity is unchanged by positive scaling.',
        ),
        typeNumber(
          '$\\cos(a, b) = 0.5$. What is $\\cos(-a, b)$?',
          -0.5,
          'Negating $a$ flips the sign of the dot product but not the norms.',
        ),
      ],
    },
  ],
  'math-matrices': [
    {
      title: 'Read the shape and entries of a matrix',
      explanation: [
        'A matrix with $m$ rows and $n$ columns has shape $m \\times n$. In math notation $A_{ij}$ is the entry in row $i$ and column $j$, counting from 1. A data matrix stores one observation per row and one feature per column.',
      ],
      example: worked(
        'A = [[4, 0, 7],\n     [1, 9, 2]]',
        'shape 2 × 3; A₁₃ = 7; A₂₁ = 1',
        'Rows are counted first, then columns.',
      ),
      questions: [
        choose(
          'A matrix has 3 rows and 5 columns. What is its shape?',
          ['$5 \\times 3$', '$3 \\times 5$', '15', '8'],
          1,
          'Shape lists rows, then columns.',
        ),
        typeNumber(
          '$A = [[1, 2], [3, 4], [5, 6]]$. What is $A_{32}$, the entry in row 3 and column 2, counting from 1?',
          6,
          'Row 3 is $[5, 6]$, and its second entry is 6.',
        ),
        typeNumber(
          'A data matrix has shape $1{,}000 \\times 8$. How many observations does it hold?',
          1000,
          'Rows are observations; the 8 columns are features.',
        ),
        choose(
          'In a data matrix, what does one row represent?',
          [
            'One observation',
            'One feature across all observations',
            'The mean of each feature',
            'The target values',
          ],
          0,
          'Each row is one observation’s feature vector.',
        ),
      ],
    },
    {
      title: 'Index a matrix stored as lists of rows',
      explanation: [
        'In Python, a matrix can be a list of row lists. A[i] is row i, and A[i][j] is the entry in row i and column j, with positions counting from 0. len(A) is the number of rows, and len(A[0]) is the number of columns.',
      ],
      example: {
        code: 'A = [[4, 0, 7], [1, 9, 2]]\nprint(A[1])\nprint(A[0][2])\nprint(len(A), len(A[0]))',
        output: '[1, 9, 2]\n7\n2 3',
        explanation:
          'A[1] is the second row, A[0][2] is the first row’s third entry, and the shape is $2 \\times 3$.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          'A = [[5, 6], [7, 8], [9, 10]]\nprint(A[2][1])',
          '10',
          'A[2] is the third row [9, 10], and position 1 holds 10.',
        ),
        typeOutput(
          'What does this program print?',
          'A = [[5, 6], [7, 8], [9, 10]]\nprint(len(A), len(A[0]))',
          '3 2',
          'There are 3 row lists, each with 2 entries.',
        ),
        typeOutput(
          'What does this program print?',
          'A = [[1, 2, 3], [4, 5, 6]]\nprint([row[0] for row in A])',
          '[1, 4]',
          'Taking position 0 of each row collects the first column.',
        ),
        choose(
          'Which Python expression gives the math entry $A_{21}$, row 2 and column 1?',
          ['A[1][0]', 'A[2][1]', 'A[0][1]', 'A[1][2]'],
          0,
          'Python counts from 0, so row 2 is index 1 and column 1 is index 0.',
        ),
      ],
    },
    {
      title: 'Transpose a matrix',
      explanation: [
        'The transpose $A^\\top$ turns each row into a column: $(A^\\top)_{ij} = A_{ji}$. An $m \\times n$ matrix becomes $n \\times m$, and transposing twice gives back $A$. A square matrix with $A = A^\\top$ is symmetric: it mirrors across its diagonal. In Python, building column j as a list for each j gives the transpose.',
      ],
      example: {
        code: 'A = [[1, 2, 3], [4, 5, 6]]\nprint([[A[i][j] for i in range(len(A))] for j in range(len(A[0]))])',
        output: '[[1, 4], [2, 5], [3, 6]]',
        explanation:
          'For each column position j, the inner comprehension collects that entry from every row.',
      },
      questions: [
        choose(
          'What is the transpose of $[[1, 2], [3, 4]]$?',
          [
            '$[[4, 3], [2, 1]]$',
            '$[[1, 3], [2, 4]]$',
            '$[[2, 1], [4, 3]]$',
            '$[[1, 2], [3, 4]]$',
          ],
          1,
          'The first row of the transpose is the first column, $[1, 3]$.',
        ),
        choose(
          '$X$ has shape $100 \\times 4$. What is the shape of $X^\\top$?',
          [
            '$100 \\times 4$',
            '$4 \\times 4$',
            '$4 \\times 100$',
            '$100 \\times 100$',
          ],
          2,
          'Transposing swaps the numbers of rows and columns.',
        ),
        typeOutput(
          'What does this program print?',
          'A = [[1, 2], [3, 4], [5, 6]]\nprint([[A[i][j] for i in range(len(A))] for j in range(len(A[0]))])',
          '[[1, 3, 5], [2, 4, 6]]',
          'The $3 \\times 2$ matrix becomes $2 \\times 3$; each new row is an old column.',
        ),
        choose(
          'Which matrix is symmetric?',
          [
            '$[[1, 7], [7, 2]]$',
            '$[[1, 7], [2, 1]]$',
            '$[[0, 1], [-1, 0]]$',
            '$[[1, 2, 3], [2, 1, 3]]$',
          ],
          0,
          'It is square and its off-diagonal entries match: $A_{12} = A_{21} = 7$.',
        ),
      ],
    },
  ],
  'math-matrix-vector': [
    {
      title: 'Multiply a matrix by a vector row by row',
      explanation: [
        '$Ax$ is the vector of dot products of each row of $A$ with $x$. $A$ must have as many columns as $x$ has coordinates, and the result has one entry per row of $A$.',
      ],
      example: {
        code: 'A = [[1, 2], [3, 4], [0, -1]]\nx = [5, 6]\nprint([row[0] * x[0] + row[1] * x[1] for row in A])',
        output: '[17, 39, -6]',
        explanation:
          'Each row is dotted with $x$: $5 + 12$, $15 + 24$, and $0 - 6$.',
      },
      questions: [
        choose(
          'What is $[[1, 0], [0, 1]]$ times $[7, 3]$?',
          ['$[3, 7]$', '$[7, 3]$', '$[10, 10]$', '$[7, 0]$'],
          1,
          'Row $[1, 0]$ picks 7 and row $[0, 1]$ picks 3.',
        ),
        typeOutput(
          'What does this program print?',
          'A = [[2, 1], [0, 3]]\nx = [4, -1]\nprint([row[0] * x[0] + row[1] * x[1] for row in A])',
          '[7, -3]',
          '$2 \\times 4 + 1 \\times (-1) = 7$ and $0 \\times 4 + 3 \\times (-1) = -3$.',
        ),
        choose(
          'What is $[[1, 2, 3]]$ times $[1, 1, 1]$?',
          ['$[1, 2, 3]$', '$[3]$', '$6 \\times 3$', '$[6]$'],
          3,
          'The single row gives a single dot product: $1 + 2 + 3$.',
        ),
        choose(
          'What is $[[3, -1], [2, 2]]$ times $[1, 2]$?',
          ['$[1, 6]$', '$[3, 4]$', '$[5, 3]$', '$[1, 4]$'],
          0,
          '$3 - 2 = 1$ and $2 + 4 = 6$.',
        ),
      ],
    },
    {
      title: 'Check shapes before multiplying',
      explanation: [
        'An $m \\times n$ matrix times an $n$-coordinate vector gives an $m$-coordinate vector: the inner sizes must match. If $x$ has the wrong length, some row entry has no partner coordinate and the product is undefined, which usually signals a feature-order or data-preparation bug.',
      ],
      example: worked(
        'A: 4 × 3, x: 3 coordinates\nA: 4 × 3, x: 4 coordinates',
        'Ax has 4 coordinates; the second product is undefined',
        'Each of the 4 rows needs exactly 3 partner coordinates.',
      ),
      questions: [
        typeNumber(
          '$A$ has shape $5 \\times 2$ and $x$ has 2 coordinates. How many coordinates does $Ax$ have?',
          5,
          'One dot product per row of $A$.',
        ),
        choose(
          '$A$ has shape $3 \\times 6$. For which $x$ is $Ax$ defined?',
          [
            '$x$ with 3 coordinates',
            '$x$ with 9 coordinates',
            '$x$ with 6 coordinates',
            'Any $x$',
          ],
          2,
          '$x$ needs one coordinate per column of $A$.',
        ),
        choose(
          '$X$ has shape $200 \\times 5$ and $w$ has 4 coordinates. What is $Xw$?',
          [
            'A 200-coordinate vector',
            'A 5-coordinate vector',
            'A 4-coordinate vector',
            'Undefined, because 5 ≠ 4',
          ],
          3,
          'Each row has 5 entries but $w$ has only 4.',
        ),
        choose(
          '$A$ is $1 \\times 3$ and $x$ has 3 coordinates. What is $Ax$?',
          [
            'A single number, as a 1-coordinate vector',
            'A 3-coordinate vector',
            'A $1 \\times 3$ matrix',
            'Undefined',
          ],
          0,
          'One row gives one dot product.',
        ),
      ],
    },
    {
      title: 'Predict for many observations at once',
      explanation: [
        "Stack the observations as the rows of $X$ and put the weights in $w$. Then $Xw$ gives every observation's weighted sum in one product, and $Xw + b$ adds the intercept to each entry. This is how a linear model predicts for a whole dataset.",
      ],
      example: worked(
        'X = [[1, 2], [3, 0], [0, 1]], w = [10, 5], b = 1\nXw = [10 + 10, 30 + 0, 0 + 5]',
        'predictions Xw + b = [21, 31, 6]',
        'Each row of $X$ is one observation, so each entry is one prediction.',
      ),
      questions: [
        choose(
          '$X = [[2, 1], [0, 4]]$, $w = [3, -1]$, and $b = 0$. What are the predictions $Xw + b$?',
          ['$[6, -4]$', '$[5, -4]$', '$[5, 4]$', '$[3, 3]$'],
          1,
          '$6 - 1 = 5$ and $0 - 4 = -4$.',
        ),
        typeNumber(
          '$X = [[1, 1], [2, 3]]$, $w = [2, 2]$, and $b = 10$. What is the second prediction?',
          20,
          '$2 \\times 2 + 3 \\times 2 + 10 = 20$.',
        ),
        choose(
          'A model has 3 weights and predicts for 50 observations. What is the shape of $X$?',
          [
            '$3 \\times 50$',
            '$50 \\times 50$',
            '$3 \\times 3$',
            '$50 \\times 3$',
          ],
          3,
          'One row per observation and one column per weight.',
        ),
        choose(
          'In $Xw + b$, how many times is the intercept $b$ added?',
          [
            'Once per observation',
            'Once in total',
            'Once per feature',
            'Never',
          ],
          0,
          'Every prediction gets its own copy of the intercept.',
        ),
      ],
    },
  ],
  'math-matrix-multiplication': [
    {
      title: 'Check shapes for a matrix product',
      explanation: [
        '$AB$ is defined when the number of columns of $A$ equals the number of rows of $B$. For shapes $(m \\times n)(n \\times p)$, the inner $n$ must match, and the result is $m \\times p$.',
      ],
      example: worked(
        '(2 × 3)(3 × 4)\n(3 × 4)(2 × 3)',
        '2 × 4; undefined because 4 ≠ 2',
        'Compare the inner sizes; the outer sizes give the result.',
      ),
      questions: [
        choose(
          '$A$ is $5 \\times 2$ and $B$ is $2 \\times 7$. What is the shape of $AB$?',
          ['$2 \\times 2$', '$5 \\times 7$', '$7 \\times 5$', 'Undefined'],
          1,
          'The inner 2s match, leaving $5 \\times 7$.',
        ),
        choose(
          '$A$ and $B$ are both $3 \\times 4$. Is $AB$ defined?',
          [
            'Yes, $3 \\times 4$',
            'Yes, $4 \\times 4$',
            'No, because $4 \\ne 3$',
            'Yes, $3 \\times 3$',
          ],
          2,
          '$A$ has 4 columns but $B$ has 3 rows.',
        ),
        choose(
          '$X$ is $32 \\times 10$ and $W$ is $10 \\times 16$. What shape is $XW$?',
          [
            '10 rows and 10 columns',
            '32 rows and 10 columns',
            '16 rows and 32 columns',
            '32 rows and 16 columns',
          ],
          3,
          '$(32 \\times 10)(10 \\times 16) = 32 \\times 16$.',
        ),
        choose(
          '$A$ is $4 \\times 1$ and $B$ is $1 \\times 4$. What is the shape of $AB$?',
          ['$4 \\times 4$', '$1 \\times 1$', '$4 \\times 1$', 'Undefined'],
          0,
          'The inner 1s match, leaving the outer $4 \\times 4$.',
        ),
      ],
    },
    {
      title: 'Compute an entry of a matrix product',
      explanation: [
        'The entry of $AB$ in row $i$ and column $j$ is row $i$ of $A$ dotted with column $j$ of $B$. Computing every entry gives the full product, and each column of $AB$ is $A$ times the matching column of $B$.',
      ],
      example: {
        code: 'A = [[1, 2], [3, 4]]\nB = [[5, 6], [7, 8]]\nprint(A[0][0] * B[0][1] + A[0][1] * B[1][1])',
        output: '22',
        explanation:
          'Row 1 of $A$, $[1, 2]$, dotted with column 2 of $B$, $[6, 8]$, gives $6 + 16 = 22$. The full product is $[[19, 22], [43, 50]]$.',
      },
      questions: [
        typeNumber(
          '$A = [[1, 2], [3, 4]]$ and $B = [[5, 6], [7, 8]]$. What is the entry of $AB$ in row 2, column 1?',
          43,
          'Row $[3, 4]$ dotted with column $[5, 7]$: $15 + 28 = 43$.',
        ),
        typeOutput(
          'This program computes the row 2, column 2 entry of $AB$. What does it print?',
          'A = [[2, 0], [1, 3]]\nB = [[1, 4], [2, 5]]\nprint(A[1][0] * B[0][1] + A[1][1] * B[1][1])',
          '19',
          'Row $[1, 3]$ dotted with column $[4, 5]$: $4 + 15 = 19$.',
        ),
        choose(
          'What is $[[1, 1], [0, 1]]$ times $[[2, 0], [3, 1]]$?',
          [
            '$[[2, 0], [0, 1]]$',
            '$[[2, 1], [3, 2]]$',
            '$[[3, 1], [3, 1]]$',
            '$[[5, 1], [3, 1]]$',
          ],
          3,
          'Row $[1, 1]$ gives $2 + 3$ and $0 + 1$; row $[0, 1]$ gives 3 and 1.',
        ),
        choose(
          'Which expression describes column $j$ of $AB$?',
          [
            '$A$ times column $j$ of $B$',
            'Row $j$ of $A$ times $B$',
            'Column $j$ of $A$ times column $j$ of $B$',
            'The sum of column $j$ of $A$',
          ],
          0,
          'Every entry of column $j$ uses column $j$ of $B$ with a row of $A$.',
        ),
      ],
    },
    {
      title: 'Respect order and transposes in products',
      explanation: [
        'Matrix multiplication is not commutative: $AB$ and $BA$ usually differ, and one can be undefined while the other is defined. Transposing a product reverses the order: $(AB)^\\top = B^\\top A^\\top$. A dense layer computes $XW$ with $X$ as $\\text{batch} \\times \\text{inputs}$ and $W$ as $\\text{inputs} \\times \\text{outputs}$; $WX$ would not match the shapes.',
      ],
      example: worked(
        'A = [[0, 1], [0, 0]], B = [[0, 0], [1, 0]]\nAB = [[1, 0], [0, 0]]\nBA = [[0, 0], [0, 1]]',
        'AB ≠ BA',
        'Even square matrices of the same shape usually give different products in the two orders.',
      ),
      questions: [
        choose(
          '$A$ is $2 \\times 3$ and $B$ is $3 \\times 2$. What are the shapes of $AB$ and $BA$?',
          [
            'Both $2 \\times 2$',
            '$2 \\times 2$ and $3 \\times 3$',
            'Both $3 \\times 3$',
            '$2 \\times 3$ and $3 \\times 2$',
          ],
          1,
          '$(2 \\times 3)(3 \\times 2) = 2 \\times 2$, while $(3 \\times 2)(2 \\times 3) = 3 \\times 3$.',
        ),
        choose(
          'Which expression equals $(AB)^\\top$?',
          ['$A^\\top B^\\top$', '$BA$', '$B^\\top A^\\top$', '$AB^\\top$'],
          2,
          'Transposing a product reverses the order of its factors.',
        ),
        choose(
          '$X$ is $64 \\times 20$ and $W$ is $20 \\times 10$. Which product gives the layer output?',
          ['$WX$', '$X^\\top W$', '$W^\\top X$', '$XW$'],
          3,
          '$(64 \\times 20)(20 \\times 10) = 64 \\times 10$: one output row per example.',
        ),
        choose(
          '$AB = BA$ for two particular square matrices. What does this show?',
          [
            'These two happen to commute; most pairs do not',
            'Matrix multiplication is always commutative',
            '$A$ and $B$ must be equal',
            'Both must be zero',
          ],
          0,
          'Some pairs commute, such as a matrix and the identity, but it is not the general rule.',
        ),
      ],
    },
  ],
  'math-identity-inverse': [
    {
      title: 'Multiply by the identity',
      explanation: [
        'The identity matrix $I$ has 1s on its diagonal and 0s elsewhere. It changes nothing: $AI = IA = A$ and $Ix = x$, just as multiplying a number by 1 does. The matrix $cI$ scales every vector by $c$.',
      ],
      example: {
        code: 'I = [[1, 0], [0, 1]]\nx = [7, -2]\nprint([row[0] * x[0] + row[1] * x[1] for row in I])',
        output: '[7, -2]',
        explanation:
          'Each row of $I$ picks out one coordinate of $x$, so $Ix = x$.',
      },
      questions: [
        choose(
          'What is the $3 \\times 3$ identity matrix times $[4, 5, 6]$?',
          ['$[1, 1, 1]$', '$[4, 5, 6]$', '$[15]$', '$[6, 5, 4]$'],
          1,
          'The identity leaves every vector unchanged.',
        ),
        choose(
          '$A$ is $2 \\times 2$. What is $IA$?',
          ['$I$', '$A^\\top$', '$A$', '$2A$'],
          2,
          'Multiplying by the identity on either side returns $A$.',
        ),
        typeOutput(
          'What does this program print?',
          'M = [[3, 0], [0, 3]]\nx = [2, -1]\nprint([row[0] * x[0] + row[1] * x[1] for row in M])',
          '[6, -3]',
          '$M = 3I$ scales every coordinate by 3.',
        ),
        choose(
          'Which matrix is the $2 \\times 2$ identity?',
          [
            '$[[1, 0], [0, 1]]$',
            '$[[1, 1], [1, 1]]$',
            '$[[0, 1], [1, 0]]$',
            '$[[1, 0], [0, 0]]$',
          ],
          0,
          'Ones on the diagonal, zeros elsewhere.',
        ),
      ],
    },
    {
      title: 'Compute a 2 × 2 determinant and inverse',
      explanation: [
        'For $A = [[a, b], [c, d]]$, the determinant is $ad - bc$. When it is not 0, $A^{-1} = \\frac{1}{ad - bc} [[d, -b], [-c, a]]$: swap the diagonal entries, negate the off-diagonal entries, and divide by the determinant. Check by multiplying: $A^{-1}A = I$.',
      ],
      example: worked(
        'A = [[4, 7], [2, 6]]\ndet = 4 × 6 − 7 × 2 = 10\nA⁻¹ = (1/10) [[6, −7], [−2, 4]]',
        'A⁻¹ = [[0.6, −0.7], [−0.2, 0.4]]',
        'Check one entry of $A^{-1}A$: $0.6 \\times 4 - 0.7 \\times 2 = 1$.',
      ),
      questions: [
        typeNumber(
          'What is the determinant of $[[3, 1], [4, 2]]$?',
          2,
          '$3 \\times 2 - 1 \\times 4 = 2$.',
        ),
        choose(
          'What is the inverse of $[[2, 0], [0, 4]]$?',
          [
            '$[[-2, 0], [0, -4]]$',
            '$[[4, 0], [0, 2]]$',
            '$[[0.5, 0], [0, 0.25]]$',
            '$[[2, 0], [0, 4]]$',
          ],
          2,
          'A diagonal matrix is inverted by taking the reciprocal of each diagonal entry.',
        ),
        choose(
          '$A = [[1, 2], [1, 3]]$ has determinant 1. What is $A^{-1}$?',
          [
            '$[[1, -2], [-1, 3]]$',
            '$[[3, 2], [1, 1]]$',
            '$[[-3, 2], [1, -1]]$',
            '$[[3, -2], [-1, 1]]$',
          ],
          3,
          'Swap the diagonal to 3 and 1, negate the off-diagonal to −2 and −1, and divide by 1.',
        ),
        choose(
          '$A$ is invertible. What is $A^{-1}A$?',
          ['$A$', '$I$', '$0$', '$A^2$'],
          1,
          'An inverse undoes $A$, leaving the identity.',
        ),
      ],
    },
    {
      title: 'Recognize when no inverse exists',
      explanation: [
        'A square matrix has no inverse when its determinant is 0. Then $A$ sends some nonzero vector to the zero vector, so different inputs share an output and the effect cannot be undone. In a $2 \\times 2$ matrix this happens exactly when one row is a multiple of the other.',
      ],
      example: worked(
        'A = [[1, 2], [2, 4]]\ndet = 1 × 4 − 2 × 2 = 0\nA[2, −1] = [2 − 2, 4 − 4]',
        'A[2, −1] = [0, 0], so A has no inverse',
        'The second row is twice the first, and $A$ flattens the direction $[2, -1]$ to zero.',
      ),
      questions: [
        choose(
          'Which matrix has no inverse?',
          [
            '$[[2, 1], [1, 2]]$',
            '$[[3, 6], [1, 2]]$',
            '$[[1, 0], [0, 5]]$',
            '$[[0, 2], [3, 0]]$',
          ],
          1,
          '$3 \\times 2 - 6 \\times 1 = 0$; the first row is 3 times the second.',
        ),
        typeNumber(
          'For which $k$ does $[[k, 4], [1, 2]]$ have no inverse?',
          2,
          'The determinant $2k - 4$ is 0 when $k = 2$.',
        ),
        choose(
          '$A$ sends a nonzero vector $v$ to $[0, 0]$. What follows?',
          [
            '$A$ is the identity',
            '$A$ is symmetric',
            '$v$ must be the zero vector',
            '$A$ has no inverse',
          ],
          3,
          '$v$ and the zero vector share the output 0, so no matrix can undo $A$.',
        ),
        choose(
          '$Ax = b$ has exactly one solution, $x = A^{-1}b$. What must be true of $A$?',
          [
            'Its determinant is not 0',
            'It is symmetric',
            'All its entries are positive',
            'It is the identity',
          ],
          0,
          'The inverse exists exactly when the determinant is nonzero.',
        ),
      ],
    },
  ],
  'math-eigenvectors': [
    {
      title: 'Check whether a vector is an eigenvector',
      explanation: [
        '$v$ is an eigenvector of $A$ when $Av$ is a multiple of $v$: $Av = \\lambda v$ for some number $\\lambda$, the eigenvalue. To check, compute $Av$ and see whether every coordinate is the same multiple of the matching coordinate of $v$. The zero vector never counts as an eigenvector.',
      ],
      example: {
        code: 'A = [[2, 1], [1, 2]]\nv = [1, -1]\nprint([row[0] * v[0] + row[1] * v[1] for row in A])',
        output: '[1, -1]',
        explanation:
          '$Av$ equals $v$ itself, so $v$ is an eigenvector with eigenvalue 1.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          'A = [[3, 1], [0, 2]]\nv = [1, 0]\nprint([row[0] * v[0] + row[1] * v[1] for row in A])',
          '[3, 0]',
          '$Av = [3, 0] = 3v$, so $[1, 0]$ is an eigenvector with eigenvalue 3.',
        ),
        choose(
          '$A = [[2, 1], [1, 2]]$. Is $[1, 2]$ an eigenvector?',
          [
            'Yes, with eigenvalue 4',
            'Yes, with eigenvalue 2',
            'No, because $A[1, 2] = [4, 5]$ is not a multiple of $[1, 2]$',
            'Only after normalizing it',
          ],
          2,
          '$4 = 4 \\times 1$ but $5 \\ne 4 \\times 2$, so $A$ turns the vector.',
        ),
        typeNumber(
          '$Av = [6, -3]$ for $v = [2, -1]$. What is the eigenvalue?',
          3,
          '$[6, -3] = 3 \\times [2, -1]$.',
        ),
        choose(
          'Why is the zero vector excluded as an eigenvector?',
          [
            '$A0 = \\lambda 0$ holds for every $\\lambda$, so it identifies nothing',
            'It has no coordinates',
            '$A$ cannot multiply it',
            'Its norm is 1',
          ],
          0,
          'Every matrix sends 0 to 0, so it would fit every eigenvalue.',
        ),
      ],
    },
    {
      title: 'Find the eigenvalues of a 2 × 2 matrix',
      explanation: [
        '$Av = \\lambda v$ means $(A - \\lambda I)v = 0$ for a nonzero $v$, so $A - \\lambda I$ must have no inverse: $\\det(A - \\lambda I) = 0$. For a $2 \\times 2$ matrix this is a quadratic equation in $\\lambda$. A diagonal matrix’s eigenvalues are its diagonal entries, with the coordinate directions as eigenvectors.',
      ],
      example: worked(
        'A = [[4, 1], [2, 3]]\ndet(A − λI) = (4 − λ)(3 − λ) − 1 × 2\n= λ² − 7λ + 10 = (λ − 5)(λ − 2)',
        'λ = 5 or λ = 2',
        'Subtract $\\lambda$ from the diagonal, take the determinant, and solve for the $\\lambda$ that makes it 0.',
      ),
      questions: [
        choose(
          'What are the eigenvalues of $[[7, 0], [0, -2]]$?',
          ['5 and 0', '7 and −2', '7 and 0', '0 and −2'],
          1,
          'A diagonal matrix only stretches each coordinate direction by its diagonal entry.',
        ),
        choose(
          '$A = [[3, 1], [1, 3]]$. Which equation gives its eigenvalues?',
          [
            '$3\\lambda - 1 = 0$',
            '$(3 - \\lambda)^2 + 1 = 0$',
            '$(3 - \\lambda)^2 - 1 = 0$',
            '$\\lambda^2 - 9 = 0$',
          ],
          2,
          '$\\det(A - \\lambda I) = (3 - \\lambda)(3 - \\lambda) - 1 \\times 1$.',
        ),
        choose(
          '$\\det(A - \\lambda I) = (5 - \\lambda)(1 - \\lambda)$. What are the eigenvalues?',
          ['5 and −1', '6 and 0', '4 and 1', '5 and 1'],
          3,
          'The product is 0 when $\\lambda = 5$ or $\\lambda = 1$.',
        ),
        choose(
          'Why must $\\det(A - \\lambda I)$ be 0 at an eigenvalue?',
          [
            'Every determinant is 0',
            '$A - \\lambda I$ sends a nonzero $v$ to 0, so it has no inverse',
            '$\\lambda$ must equal 0',
            '$A$ must be the identity',
          ],
          1,
          'A matrix that collapses a nonzero vector has determinant 0.',
        ),
      ],
    },
    {
      title: 'Read a covariance matrix',
      explanation: [
        'For features $x_1, \\ldots, x_k$, the covariance matrix $\\Sigma$ holds $\\operatorname{Var}(x_i)$ in diagonal position $i$ and $\\operatorname{cov}(x_i, x_j)$ in position $(i, j)$. Since $\\operatorname{cov}(x_i, x_j) = \\operatorname{cov}(x_j, x_i)$, $\\Sigma$ is symmetric and $k \\times k$. For a centered data matrix $X$ with $n$ rows, $\\Sigma = X^\\top X / n$.',
      ],
      example: worked(
        'centered features: x₁ = [−1, 1], x₂ = [−3, 3]\nVar(x₁) = 1, Var(x₂) = 9, cov(x₁, x₂) = (3 + 3) / 2 = 3',
        'Σ = [[1, 3], [3, 9]]',
        'Variances sit on the diagonal and the shared covariance fills both off-diagonal positions.',
      ),
      questions: [
        typeNumber(
          '$\\Sigma = [[4, -1], [-1, 9]]$. What is the variance of the second feature?',
          9,
          'The second diagonal entry is $\\operatorname{Var}(x_2)$.',
        ),
        typeNumber(
          '$\\Sigma = [[4, -1], [-1, 9]]$. What is the covariance of the two features?',
          -1,
          'Off-diagonal entries are covariances.',
        ),
        choose(
          'Why is every covariance matrix symmetric?',
          [
            'All its variances are equal',
            'Its entries are positive',
            'It is the identity',
            '$\\operatorname{cov}(x_i, x_j) = \\operatorname{cov}(x_j, x_i)$',
          ],
          3,
          'The products of paired deviations are the same in either order.',
        ),
        choose(
          'A dataset has 6 features. What is the shape of its covariance matrix?',
          ['$6 \\times 6$', '$n \\times 6$', '$6 \\times 1$', '$36 \\times 1$'],
          0,
          'There is one row and one column per feature.',
        ),
      ],
    },
    {
      title: 'Read principal components from eigenvalues',
      explanation: [
        'The eigenvectors of a covariance matrix are perpendicular directions, and each eigenvalue is the variance of the data along its eigenvector. PCA orders the eigenvectors by eigenvalue, so the first principal component is the direction of greatest variance. A component’s share of the total variance is its eigenvalue divided by the sum of all eigenvalues, and that sum equals the sum of the feature variances.',
      ],
      example: worked(
        'Σ = [[5, 2], [2, 2]]\nΣ[2, 1] = [12, 6] = 6[2, 1]\nΣ[1, −2] = [1, −2] = 1[1, −2]\n[2, 1] · [1, −2] = 0',
        'the first component [2, 1] explains 6 / 7 ≈ 86% of the variance',
        'The eigenvalues 6 and 1 add up to 7, the sum of the diagonal variances 5 and 2.',
      ),
      questions: [
        choose(
          'A covariance matrix has eigenvalues 8, 1.5, and 0.5. What share of the variance do the first two components keep?',
          ['80%', '95%', '15%', '90%'],
          1,
          '$(8 + 1.5) / 10 = 0.95$.',
        ),
        choose(
          '$\\Sigma = [[3, 0], [0, 7]]$. Which direction is the first principal component?',
          ['$[1, 0]$', '$[1, 1]$', '$[0, 1]$', '$[3, 7]$'],
          2,
          'The second feature has the larger variance, 7, along $[0, 1]$.',
        ),
        typeNumber(
          'The feature variances are 4 and 6. What is the sum of the covariance matrix’s eigenvalues?',
          10,
          'The eigenvalues add up to the sum of the diagonal variances.',
        ),
        typeNumber(
          'Two principal directions of a covariance matrix are $[1, 1]$ and $[1, -1]$. What is their dot product?',
          0,
          'Principal directions are perpendicular.',
        ),
      ],
    },
  ],
  'math-exp-log': [
    {
      title: 'Compute e to a power with math.exp',
      explanation: [
        'After import math, math.exp(x) returns $e^x$ as a float, and math.e is the constant $e$ itself. math.exp(0) is 1.0, math.exp(1) equals math.e, and a negative exponent gives a reciprocal: math.exp(-1) is $1 / e \\approx 0.368$.',
        '$e^x$ is positive for every $x$ and grows very fast. math.exp(-50) is a tiny positive float, while math.exp(1000) is too large for a float, so Python raises OverflowError.',
      ],
      example: {
        code: 'import math\nprint(math.exp(0))\nprint(math.exp(1))\nprint(math.exp(1) == math.e, math.exp(-1) > 0)',
        output: '1.0\n2.718281828459045\nTrue True',
        explanation:
          '$e^0 = 1$, returned as a float. $e^1$ is the constant $e$, so the comparison is True, and $e^{-1} = 1 / e$ is still positive.',
      },
      questions: [
        typeOutput(
          'What is printed?',
          'import math\nprint(math.exp(0) + math.exp(0))',
          '2.0',
          '$e^0 = 1$, and math.exp always returns a float, so the sum is 2.0.',
        ),
        typeOutput(
          'What does this program print?',
          'import math\nprint(math.exp(2) > 7, math.exp(-2) > 0)',
          'True True',
          '$e^2 \\approx 7.39$, and $e$ raised to any power is positive, even a negative one.',
        ),
        choose(
          'Which expression computes $e^{-z}$ for a score z?',
          ['math.e(-z)', '-math.exp(z)', 'math.exp(z) ** -z', 'math.exp(-z)'],
          3,
          'math.exp takes the exponent as its argument. math.e is a number, not a function, and $-e^z$ is negative.',
        ),
        typeOutput(
          'What is the output?',
          'import math\nprint(math.exp(1) == math.e, math.exp(-1) < 0)',
          'True False',
          'math.exp(1) is exactly the stored constant $e$, and $e^{-1} = 1 / e$ is positive.',
        ),
      ],
    },
    {
      title: 'Undo exponentials with math.log',
      explanation: [
        'math.log(x) returns the natural logarithm $\\ln x$: the exponent that $e$ must be raised to in order to give $x$. It undoes math.exp, so math.log(math.exp(3)) is 3.0, and math.log(1) is 0.0. A second argument picks another base: math.log(8, 2) is 3.0. math.log2(x) and math.log10(x) are shortcuts for bases 2 and 10.',
        'Only positive numbers have a logarithm, because $e^k$ is positive for every $k$. math.log(0) and math.log(-4) raise ValueError instead of returning a number.',
      ],
      example: {
        code: 'import math\nprint(math.log(1))\nprint(math.log(math.exp(3)))\nprint(math.log2(32), math.log10(0.01))',
        output: '0.0\n3.0\n5.0 -2.0',
        explanation:
          '$e^0 = 1$, so $\\ln 1 = 0$. $\\ln$ undoes $e^x$ and returns 3. $2^5 = 32$ and $10^{-2} = 0.01$.',
      },
      questions: [
        typeOutput(
          'What is printed?',
          'import math\nprint(math.log(math.exp(5)))',
          '5.0',
          'math.log undoes math.exp, so the result is the exponent 5, as a float.',
        ),
        typeOutput(
          'What does this program print?',
          'import math\nprint(math.log2(64), math.log10(100))',
          '6.0 2.0',
          '$2^6 = 64$ and $10^2 = 100$, and the log functions return floats.',
        ),
        choose(
          'What happens when a program calls math.log(-2)?',
          [
            'It returns -0.6931471805599453',
            'It raises ValueError',
            'It returns 0.0',
            'It returns the log of 2',
          ],
          1,
          'No power of $e$ is negative, so math.log refuses negative inputs instead of returning a number.',
        ),
        typeOutput(
          'What is the output?',
          'import math\nprint(math.log(8, 2) + math.log(1))',
          '3.0',
          'math.log(8, 2) asks which power of 2 gives 8, which is 3.0, and $\\ln 1$ adds 0.0.',
        ),
      ],
    },
    {
      title: 'Add logs instead of multiplying small probabilities',
      explanation: [
        '$\\ln(xy) = \\ln x + \\ln y$, so math.log(a * b) equals math.log(a) + math.log(b), up to float rounding. Taking logs turns a long product into a sum.',
        'This matters for probabilities. Multiplying hundreds of values such as 0.01 underflows: the true product is smaller than the smallest positive float, so Python stores 0.0, and every comparison between such products is lost. The sum of their logs is an ordinary negative number, and math.exp turns a log back into a probability whenever that probability is large enough to store.',
      ],
      example: {
        code: 'import math\np = 0.01\nprint(p ** 200)\nprint(200 * math.log(p))',
        output: '0.0\n-921.0340371976182',
        explanation:
          '$0.01^{200} = 10^{-400}$, far below the smallest float, so the product becomes 0.0. The log of the same product, $200 \\ln 0.01$, is an ordinary float.',
      },
      questions: [
        typeOutput(
          'What is printed?',
          'import math\ntotal = math.log(0.5) + math.log(0.5)\nprint(math.exp(total))',
          '0.25',
          'Adding the logs multiplies the probabilities, and math.exp turns the sum back into $0.5 \\times 0.5 = 0.25$.',
        ),
        typeOutput(
          'What does this program print?',
          'import math\nprint(0.001 ** 120, 120 * math.log(0.001) < 0)',
          '0.0 True',
          '$10^{-360}$ is too small for a float, so the product underflows to 0.0. Its log, $120 \\ln 0.001$, is negative.',
        ),
        choose(
          'Two models give 400 observations each a probability, and both products print 0.0. How can you still tell which model fits the data better?',
          [
            'Compare the sums of math.log of each probability; the larger sum fits better',
            'Print the products with more decimal places',
            'Pick either model, because both products are equally 0',
            'Multiply each product by 400 before comparing them',
          ],
          0,
          'The products underflowed, but $\\ln$ is increasing, so the larger log-sum still marks the larger true product.',
        ),
        typeOutput(
          'What is the output?',
          'import math\nlog_p = math.log(0.2) + math.log(0.5)\nprint(math.exp(log_p) < 0.11, log_p < 0)',
          'True True',
          'The sum of logs is $\\ln(0.2 \\times 0.5) = \\ln 0.1$, which is negative, and math.exp turns it back into about 0.1.',
        ),
      ],
    },
  ],
};
