import type { LessonExample } from '../curriculum';
import { choose, predictOutput, type KnowledgePointModule } from './authoring';

/** A worked calculation shown step by step, without running code. */
const worked = (
  code: string,
  output: string,
  explanation: string,
): LessonExample => ({ kind: 'text', code, output, explanation });

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
          'The total is 20 and there are 4 values, so the mean is 20 / 4 = 5.0.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'values = [3, 9, 6]\ntotal = 0\nfor value in values:\n    total += value\nprint(total / len(values))',
          ['6.0', '18', '6', '9.0'],
          0,
          'The total 18 divided by the count 3 is 6.0; / always gives a float.',
        ),
        choose(
          'What is the mean of 10, 20, 20, and 50?',
          ['20', '33.3', '25', '100'],
          2,
          'The sum is 100 and the count is 4, so the mean is 25.',
        ),
        predictOutput(
          'What does this program print?',
          'scores = [7, 5, 9, 3]\ntotal = 0\nfor score in scores:\n    total += score\nprint(total / len(scores))',
          ['24', '6.5', '6.0', '4.0'],
          2,
          'The scores sum to 24, and 24 / 4 = 6.0.',
        ),
        choose(
          'Five observations have mean 12. What is their sum?',
          ['12', '60', '17', '2.4'],
          1,
          'mean = sum / count, so sum = 12 × 5 = 60.',
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
        choose(
          'Four values have mean 10. A fifth value, 10, is added. What is the new mean?',
          ['12.5', '10', '8', '50'],
          1,
          'The new sum is 50 over 5 values, so a value equal to the mean leaves it at 10.',
        ),
        choose(
          'The mean of 2, 3, and 4 is 3. Which added value makes the new mean 6?',
          ['6', '9', '12', '15'],
          3,
          'Four values with mean 6 must sum to 24, and 24 − 9 = 15.',
        ),
        predictOutput(
          'What does this program print?',
          'values = [1, 2, 3, 100]\ntotal = 0\nfor value in values:\n    total += value\nprint(total / len(values))',
          ['26.5', '2.5', '106', '26'],
          0,
          'The 100 dominates the total of 106, and 106 / 4 = 26.5.',
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
        'The overall sum is 2,100 + 900 = 3,000 over 40 students. Averaging 70 and 90 directly would give 80, as if the classes were the same size.',
      ),
      questions: [
        choose(
          'Store A has 100 orders averaging $20 and store B has 300 orders averaging $40. What is the overall average order?',
          ['$30', '$35', '$40', '$60'],
          1,
          '(100 × 20 + 300 × 40) / 400 = 14,000 / 400 = $35.',
        ),
        choose(
          'Homework scores 80 with weight 0.3 and the exam scores 90 with weight 0.7. What is the weighted mean?',
          ['87', '85', '83', '170'],
          0,
          '80 × 0.3 + 90 × 0.7 = 24 + 63 = 87; the weights already sum to 1.',
        ),
        choose(
          'Why is (70 + 90) / 2 the wrong overall mean for 30 students averaging 70 and 10 students averaging 90?',
          [
            'Means can never be added',
            'It should divide by 40 instead of 2',
            'It ignores the median',
            'It treats both groups as equal in size',
          ],
          3,
          'Each group mean should count once per student, so the larger group needs more weight.',
        ),
        choose(
          'Values 2 and 8 have weights 3 and 1. What is the weighted mean?',
          ['5', '3.5', '14', '4.67'],
          1,
          '(2 × 3 + 8 × 1) / (3 + 1) = 14 / 4 = 3.5.',
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
          'The deviations −3, −1, 1, and 3 cancel, but their squares sum to 20, and 20 / 4 = 5.0.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'values = [3, 5, 7]\nmean = 5\nprint([x - mean for x in values])',
          ['[-2, 0, 2]', '[2, 0, 2]', '[4, 0, 4]', '[0, 0, 0]'],
          0,
          'Each deviation keeps its sign: 3 − 5 = −2, 5 − 5 = 0, 7 − 5 = 2.',
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
        predictOutput(
          'What does this program print?',
          'values = [2, 6, 4, 8]\nmean = 5\nsquares = [(x - mean) ** 2 for x in values]\ntotal = 0\nfor square in squares:\n    total += square\nprint(total / len(values))',
          ['0.0', '20', '5.0', '2.0'],
          2,
          'The squared deviations 9, 1, 1, 9 sum to 20, and 20 / 4 = 5.0.',
        ),
        choose(
          'What is the population variance of 10, 10, 14, and 14?',
          ['2', '4', '16', '0'],
          1,
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
          'The square root of 6.25 is 2.5, because 2.5 × 2.5 = 6.25.',
      },
      questions: [
        choose(
          'Heights have variance 16 cm². What is their standard deviation?',
          ['16 cm', '4 cm', '8 cm', '256 cm'],
          1,
          'The standard deviation is √16 = 4, in the original unit, centimeters.',
        ),
        predictOutput(
          'What does this program print?',
          'print(49 ** 0.5)',
          ['24.5', '7', '7.0', '2401'],
          2,
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
        "Divide the sum of squared deviations by n when the data are the whole population. When the data are a sample used to estimate a larger population's variance, the usual estimate divides by n − 1, which is slightly larger and corrects for measuring deviations from the sample's own mean. The difference matters for small samples and fades as n grows.",
      ],
      example: worked(
        'sample 2, 4, 6, 8 (mean 5)\nsquared deviations 9, 1, 1, 9, sum 20\ndivide by n = 4, or by n − 1 = 3',
        'population formula 5, sample variance ≈ 6.67',
        'Both start from the same sum of squared deviations; only the divisor changes.',
      ),
      questions: [
        choose(
          'Squared deviations sum to 30 across 6 sampled observations. What is the sample variance, using n − 1?',
          ['5', '6', '30', '7.5'],
          1,
          '30 / (6 − 1) = 6.',
        ),
        choose(
          'Which data call for dividing by n?',
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
          'As n grows from 5 to 5,000, what happens to the gap between the n and n − 1 versions?',
          [
            'It doubles',
            'It stays constant',
            'It shrinks toward nothing',
            'The n − 1 version becomes smaller',
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
          'The squared deviations sum to 14; 14 / 4 = 3.5 and 14 / 3 ≈ 4.667.',
        ),
      ],
    },
  ],
  'math-median': [
    {
      title: 'Find the median of an odd number of values',
      explanation: [
        'To find a median, first sort the values. With an odd count n, the median is the single middle value, at position (n + 1) / 2 counting from 1, with the same number of values on each side.',
      ],
      example: worked(
        '7, 2, 9, 4, 5\nsorted: 2, 4, 5, 7, 9',
        'median 5',
        'With 5 values, position (5 + 1) / 2 = 3 holds the middle value 5. The middle of the unsorted list, 9, is not the median.',
      ),
      questions: [
        choose(
          'What is the median of 8, 3, 6, 1, 4?',
          ['6', '4', '4.4', '3'],
          1,
          'Sorted, the values are 1, 3, 4, 6, 8, so the middle value is 4.',
        ),
        choose(
          'What is the median of 15, 11, and 30?',
          ['11', '18.67', '15', '30'],
          2,
          'Sorted, the values are 11, 15, 30, and the middle one is 15.',
        ),
        choose(
          'Seven values are sorted. Which position holds the median?',
          ['4th', '3rd', '3.5th', '7th'],
          0,
          '(7 + 1) / 2 = 4, leaving three values on each side.',
        ),
        choose(
          'What is the median of −2, 5, 0, −7, 3?',
          ['-7', '3', '-0.2', '0'],
          3,
          'Sorted, the values are −7, −2, 0, 3, 5, so the middle value is 0.',
        ),
      ],
    },
    {
      title: 'Average the middle pair for an even count',
      explanation: [
        'With an even count n there are two middle values, at positions n / 2 and n / 2 + 1 of the sorted list. The median is their mean, so it need not be one of the data values.',
      ],
      example: worked(
        '10, 3, 8, 5, 1, 12\nsorted: 1, 3, 5, 8, 10, 12',
        'median (5 + 8) / 2 = 6.5',
        'Positions 3 and 4 hold 5 and 8, and their mean is 6.5, a value that does not appear in the data.',
      ),
      questions: [
        choose(
          'What is the median of 4, 1, 7, 2?',
          ['3', '4', '3.5', '2'],
          0,
          'Sorted, the values are 1, 2, 4, 7; the middle pair 2 and 4 averages to 3.',
        ),
        choose(
          'What is the median of 30, 10, 90, 25, 40, 50?',
          ['57.5', '35', '40.83', '30'],
          1,
          'Sorted: 10, 25, 30, 40, 50, 90. The middle pair 30 and 40 averages to 35.',
        ),
        choose(
          'Eight values are sorted. Which positions does the median use?',
          ['4th only', '5th only', '4th and 5th', '3rd and 4th'],
          2,
          'n / 2 = 4 and n / 2 + 1 = 5.',
        ),
        choose(
          'What is the median of 1, 2, 2, 9?',
          ['3.5', '5.5', '2.5', '2'],
          3,
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
        'The p-th percentile is a value with about p% of the observations at or below it. The 50th percentile is the median. Percentiles describe position within a dataset, so a score at the 80th percentile beats about 80% of the scores whatever its units.',
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
        'With n sorted values counted from position 0, the p-th percentile sits at position (p / 100) × (n − 1), the default rule in NumPy and pandas. If the position is a whole number, take the value there. If it falls between two positions, interpolate: position 2.25 lies a quarter of the way from the value at 2 to the value at 3.',
      ],
      example: worked(
        'sorted: 10, 20, 30, 40, 50 (n = 5)\n30th percentile position: 0.3 × 4 = 1.2',
        '20 + 0.2 × (30 − 20) = 22',
        'Position 1.2 lies a fifth of the way from position 1, holding 20, to position 2, holding 30.',
      ),
      questions: [
        choose(
          'Sorted values are 4, 8, 15, 16, 23, 42. What is the 50th percentile by the position rule?',
          ['15', '15.5', '16', '18'],
          1,
          'The position 0.5 × 5 = 2.5 lies halfway between 15 and 16.',
        ),
        choose(
          'Sorted values are 2, 4, 6, 8, 10. What is the 75th percentile?',
          ['7.5', '9', '8', '6'],
          2,
          'The position 0.75 × 4 = 3 is a whole number, and position 3 holds 8.',
        ),
        choose(
          'Sorted values are 1, 5, 9. What is the 25th percentile?',
          ['5', '1', '2', '3'],
          3,
          'The position 0.25 × 2 = 0.5 lies halfway from 1 to 5, giving 3.',
        ),
        choose(
          'Sorted values are 100, 200, 300, 400, 500. What is the 90th percentile?',
          ['460', '450', '500', '360'],
          0,
          'The position 0.9 × 4 = 3.6 lies 60% of the way from 400 to 500.',
        ),
      ],
    },
    {
      title: 'Summarize spread with quartiles and the IQR',
      explanation: [
        'Q1 (the 25th percentile), the median, and Q3 (the 75th percentile) cut the sorted data into four parts holding about a quarter of the observations each. The interquartile range IQR = Q3 − Q1 measures the spread of the middle half. Because it ignores the lowest and highest quarters, an extreme value barely changes it, unlike the range, maximum − minimum.',
      ],
      example: worked(
        'sorted: 3, 5, 7, 8, 9, 11, 13, 15, 60 (n = 9)\nQ1 at position 2, Q3 at position 6',
        'Q1 = 7, Q3 = 13, IQR = 6, range = 57',
        'The extreme 60 inflates the range but leaves the middle half untouched.',
      ),
      questions: [
        choose(
          'Q1 = 12 and Q3 = 30. What is the IQR?',
          ['42', '21', '18', '9'],
          2,
          'IQR = Q3 − Q1 = 30 − 12 = 18.',
        ),
        choose(
          'The maximum value 60 is replaced by 600. Which summary changes?',
          ['The IQR', 'The range', 'Q1', 'The median'],
          1,
          'The range uses the maximum; the quartiles and median depend only on the middle of the order.',
        ),
        choose(
          'About what fraction of the observations lies between Q1 and Q3?',
          ['A quarter', 'Three quarters', 'All of them', 'Half'],
          3,
          'Q1 and Q3 enclose the middle two of the four quarters.',
        ),
        choose(
          'Sorted values are 1, 2, 3, 4, 5, 6, 7, 8, 9. By the position rule, what are Q1 and Q3?',
          ['3 and 7', '2.5 and 7.5', '2 and 8', '3 and 6'],
          0,
          'The positions 0.25 × 8 = 2 and 0.75 × 8 = 6 hold 3 and 7.',
        ),
      ],
    },
    {
      title: 'Flag outliers with the 1.5 × IQR rule',
      explanation: [
        'A common screen marks a value as a potential outlier when it lies below Q1 − 1.5 × IQR or above Q3 + 1.5 × IQR. The fences come from the quartiles, so the extreme values being screened barely move them. A flagged value deserves inspection: it may be an error or a real and important observation.',
      ],
      example: worked(
        'Q1 = 10, Q3 = 18, IQR = 8, 1.5 × IQR = 12\nlower fence: 10 − 12\nupper fence: 18 + 12',
        'values below −2 or above 30 are flagged',
        'The fences extend one and a half IQRs beyond the quartiles in each direction.',
      ),
      questions: [
        choose(
          'Q1 = 40 and Q3 = 60. What is the upper fence?',
          ['80', '90', '75', '120'],
          1,
          'IQR = 20, so the fence is 60 + 1.5 × 20 = 90.',
        ),
        choose(
          'Q1 = 5 and Q3 = 9. Which value is flagged?',
          ['14', '0', '16', '-1'],
          2,
          'IQR = 4, so the fences are −1 and 15; only 16 lies beyond one.',
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
        choose(
          'Q1 = 100 and Q3 = 140. What is the lower fence?',
          ['40', '60', '20', '100'],
          0,
          'IQR = 40, so the fence is 100 − 1.5 × 40 = 40.',
        ),
      ],
    },
  ],
  'math-covariance': [
    {
      title: 'Read the sign of covariance',
      explanation: [
        "For each pair, multiply x's deviation from its mean by y's deviation from its mean. The product is positive when both are above or both are below their means, and negative when one is above and the other below. Covariance is the mean of these products, so its sign says which kind of pairing dominates.",
      ],
      example: {
        code: 'x = [1, 2, 3]\ny = [10, 30, 20]\nmean_x = 2\nmean_y = 20\nprint([(x[i] - mean_x) * (y[i] - mean_y) for i in range(len(x))])',
        output: '[10, 0, 0]',
        explanation:
          'Only the first pair has both deviations nonzero, and both are negative, so their product is positive and the covariance 10 / 3 is positive.',
      },
      questions: [
        choose(
          'Students who study more hours make fewer exam errors. What sign does the covariance of hours and errors have?',
          ['Positive', 'Negative', 'Zero', 'It depends on the units'],
          1,
          'Above-average hours pair with below-average errors, giving negative products.',
        ),
        predictOutput(
          'What does this program print?',
          'x = [2, 4, 6]\ny = [5, 3, 1]\nmean_x = 4\nmean_y = 3\nprint([(x[i] - mean_x) * (y[i] - mean_y) for i in range(len(x))])',
          ['[4, 0, 4]', '[10, 12, 6]', '[-4, 0, -4]', '[-2, 0, 2]'],
          2,
          'The deviations are (−2, 2), (0, 0), and (2, −2), so the products are −4, 0, −4.',
        ),
        choose(
          "For one pair, x is above its mean and y is below its mean. What is the sign of that pair's product?",
          ['Positive', 'Zero', 'It cannot be determined', 'Negative'],
          3,
          'A positive deviation times a negative deviation is negative.',
        ),
        choose(
          'The paired deviation products are 6, −1, 2, and −3. What is the population covariance?',
          ['1', '4', '3', '-1'],
          0,
          'Their sum is 4 and there are 4 pairs, so the covariance is 1.',
        ),
      ],
    },
    {
      title: 'Compute population covariance',
      explanation: [
        'Population covariance is the mean of the paired deviation products: compute both means, multiply corresponding deviations, add the products, and divide by the number of pairs n. Equivalently, it is the dot product of the two centered vectors divided by n.',
      ],
      example: {
        code: 'x = [1, 2, 3, 4]\ny = [2, 2, 4, 8]\nmean_x = 2.5\nmean_y = 4\ntotal = 0\nfor i in range(len(x)):\n    total += (x[i] - mean_x) * (y[i] - mean_y)\nprint(total / len(x))',
        output: '2.5',
        explanation:
          'The products are 3, 1, 0, and 6, summing to 10; dividing by the 4 pairs gives 2.5.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'x = [0, 1, 2]\ny = [3, 3, 6]\nmean_x = 1\nmean_y = 4\ntotal = 0\nfor i in range(len(x)):\n    total += (x[i] - mean_x) * (y[i] - mean_y)\nprint(total / len(x))',
          ['3', '1.0', '1.5', '0.0'],
          1,
          'The products are 1, 0, and 2, summing to 3; 3 / 3 = 1.0.',
        ),
        choose(
          'x = [1, 3] and y = [2, 6]. What is their population covariance?',
          ['4', '1', '2', '8'],
          2,
          'The means are 2 and 4; the products (−1)(−2) and (1)(2) are both 2, and their mean is 2.',
        ),
        choose(
          'The centered vectors are [−1, 0, 1] and [−2, 1, 1]. What is the population covariance?',
          ['3', '0', '2', '1'],
          3,
          'Their dot product is 2 + 0 + 1 = 3, and 3 / 3 = 1.',
        ),
        choose(
          'x = [5, 5, 5] and y = [1, 7, 4]. What is cov(x, y)?',
          ['0', '4', '12', '-4'],
          0,
          'Every x deviation is 0, so every product is 0.',
        ),
      ],
    },
    {
      title: "Know what covariance's size depends on",
      explanation: [
        'cov(x, x) equals the variance of x. Multiplying x by a constant c multiplies the covariance by c, while adding a constant to x changes nothing, because the deviations from the mean stay the same. Since covariance carries the product of both units, a large value may reflect large units rather than a strong relationship.',
      ],
      example: worked(
        'cov(height in m, weight in kg) = 0.6\nheight in cm = 100 × height in m',
        'cov(height in cm, weight in kg) = 60',
        'Every height deviation becomes 100 times larger, so every product and their mean do too, although the relationship is unchanged.',
      ),
      questions: [
        choose(
          'cov(x, y) = 3. What is cov(2x, y)?',
          ['3', '6', '12', '1.5'],
          1,
          'Doubling x doubles every deviation of x and therefore every product.',
        ),
        choose(
          'cov(x, y) = 3. What is cov(x + 10, y)?',
          ['13', '30', '3', '0'],
          2,
          'Adding 10 moves the mean by 10 as well, so the deviations do not change.',
        ),
        choose(
          'Var(x) = 9. What is cov(x, x)?',
          ['3', '81', '0', '9'],
          3,
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
        'Correlation divides covariance by the product of the two standard deviations: r = cov(x, y) / (σ_x σ_y). Written with sums of deviation products and squares, the 1 / n factors cancel, so r = Sxy / √(Sxx × Syy).',
      ],
      example: {
        code: 'x = [1, 2, 3]\ny = [1, 3, 2]\nmean_x = 2\nmean_y = 2\nsxy = 0\nsxx = 0\nsyy = 0\nfor i in range(len(x)):\n    sxy += (x[i] - mean_x) * (y[i] - mean_y)\n    sxx += (x[i] - mean_x) ** 2\n    syy += (y[i] - mean_y) ** 2\nprint(sxy, sxx, syy)\nprint(sxy / (sxx * syy) ** 0.5)',
        output: '1 2 2\n0.5',
        explanation:
          'Sxy = 1, Sxx = 2, and Syy = 2, so r = 1 / √4 = 0.5: a moderate positive linear trend.',
      },
      questions: [
        choose(
          'cov(x, y) = 6, σ_x = 2, and σ_y = 5. What is r?',
          ['60', '0.6', '1.2', '0.3'],
          1,
          'r = 6 / (2 × 5) = 0.6.',
        ),
        predictOutput(
          'What does this program print?',
          'sxy = -6\nsxx = 4\nsyy = 9\nprint(sxy / (sxx * syy) ** 0.5)',
          ['-0.16666666666666666', '1.0', '-1.0', '-0.5'],
          2,
          '√(4 × 9) = 6.0, and −6 / 6.0 = −1.0.',
        ),
        choose(
          'Sxy = 12, Sxx = 16, and Syy = 25. What is r?',
          ['0.03', '0.75', '0.48', '0.6'],
          3,
          '√(16 × 25) = 20, and 12 / 20 = 0.6.',
        ),
        predictOutput(
          'What does this program print?',
          'x = [1, 2, 3]\ny = [4, 6, 8]\nmean_x = 2\nmean_y = 6\nsxy = 0\nsxx = 0\nsyy = 0\nfor i in range(len(x)):\n    sxy += (x[i] - mean_x) * (y[i] - mean_y)\n    sxx += (x[i] - mean_x) ** 2\n    syy += (y[i] - mean_y) ** 2\nprint(sxy / (sxx * syy) ** 0.5)',
          ['1.0', '2.0', '4', '0.5'],
          0,
          'Sxy = 4, Sxx = 2, and Syy = 8, so r = 4 / √16 = 1.0: the points lie on a rising line.',
        ),
      ],
    },
    {
      title: 'Interpret r between −1 and 1',
      explanation: [
        'r always lies between −1 and 1. Its sign gives the direction of the linear trend and its distance from 0 gives the strength: r = ±1 means the points lie exactly on a line, and r near 0 means no linear trend. Because the units cancel, rescaling a variable by a positive factor or shifting it leaves r unchanged; a negative factor flips its sign.',
      ],
      example: worked(
        'x = 1, 2, 3 and y = 10, 20, 30\ny in thousands: 0.01, 0.02, 0.03\nnegated y: −10, −20, −30',
        'r = 1, then 1, then −1',
        'A positive rescaling leaves the exact rising line intact; negating y turns it into an exact falling line.',
      ),
      questions: [
        choose(
          'Which r indicates the strongest linear association?',
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
        choose(
          'Points lie exactly on the line y = 5 − 2x. What is r?',
          ['-2', '-1', '0', '1'],
          1,
          'An exact line with negative slope has r = −1; r is not the slope.',
        ),
        choose(
          'A report states r = 1.3. What follows?',
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
        'Correlation measures only straight-line association. A strong curved relationship can have r near 0, and a single extreme point can create or hide a correlation. Even a large r does not show that x causes y: a third variable, the way the data were selected, or two trends rising over time can produce it. Look at the data before trusting r.',
      ],
      example: worked(
        'x = −2, −1, 0, 1, 2 and y = x² = 4, 1, 0, 1, 4\nmean_x = 0, mean_y = 2\nSxy = (−2)(2) + (−1)(−1) + (0)(−2) + (1)(−1) + (2)(2)',
        'Sxy = 0, so r = 0',
        'y is completely determined by x, but the falling left half and rising right half cancel.',
      ),
      questions: [
        choose(
          'y = x² for x = −3, −1, 1, 3. What is the correlation of x and y?',
          ['1', '0', '-1', '0.5'],
          1,
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
          'Two variables have r = 0.02. What can you conclude?',
          [
            'They are independent',
            'Neither can affect the other',
            'They have equal means',
            'There is little linear association, though a curved one is possible',
          ],
          3,
          'r near 0 rules out only a linear trend.',
        ),
        choose(
          'Twenty points have r = 0.1. One extreme point is added far up and to the right. What can happen to r?',
          [
            'It cannot change',
            'It can rise sharply',
            'It must become negative',
            'It must become exactly 0',
          ],
          1,
          'One point with large deviations in both variables can dominate Sxy.',
        ),
      ],
    },
  ],
  'math-probability': [
    {
      title: 'Compute a probability from equally likely outcomes',
      explanation: [
        'When every outcome is equally likely, P(event) = favorable outcomes / total outcomes. A probability lies between 0, for an impossible event, and 1, for a certain one.',
      ],
      example: worked(
        'fair die; event: roll at least 5\nfavorable outcomes: 5, 6\ntotal outcomes: 1, 2, 3, 4, 5, 6',
        'P = 2/6 = 1/3',
        'Two of the six equally likely faces satisfy the event.',
      ),
      questions: [
        choose(
          'A bag holds 3 red and 7 blue marbles. What is P(red) for one random draw?',
          ['0.7', '3/7', '0.3', '0.03'],
          2,
          '3 favorable marbles out of 10 equally likely ones.',
        ),
        predictOutput(
          'What does this program print?',
          'favorable = 5\ntotal = 20\nprint(favorable / total)',
          ['4.0', '0.25', '0.2', '25'],
          1,
          '5 / 20 = 0.25; the favorable count goes on top.',
        ),
        choose(
          'Which value cannot be a probability?',
          ['0', '1', '0.999', '1.5'],
          3,
          'Probabilities lie between 0 and 1.',
        ),
        choose(
          'Two fair coins are flipped. What is P(exactly one head)?',
          ['1/4', '1/3', '1/2', '3/4'],
          2,
          'Of the four equally likely outcomes HH, HT, TH, TT, two have exactly one head.',
        ),
      ],
    },
    {
      title: 'Use the complement',
      explanation: [
        'The complement "not A" contains every outcome where A does not happen, so P(not A) = 1 − P(A). The complement is often easier to count: the chance of at least one success is 1 minus the chance of none.',
      ],
      example: {
        code: 'p_rain = 0.35\nprint(1 - p_rain)',
        output: '0.65',
        explanation:
          'Rain and no rain cover every outcome without overlap, so their probabilities sum to 1.',
      },
      questions: [
        choose(
          'P(defect) = 0.04. What is P(no defect)?',
          ['0.04', '0.96', '0.6', '1.04'],
          1,
          '1 − 0.04 = 0.96.',
        ),
        predictOutput(
          'What does this program print?',
          'p = 0.2\nprint(1 - p)',
          ['0.2', '-0.8', '1.2', '0.8'],
          3,
          'The complement of an event with probability 0.2 has probability 0.8.',
        ),
        choose(
          'A fair die is rolled. What is P(not a 6)?',
          ['1/6', '5/6', '6/5', '1/5'],
          1,
          '1 − 1/6 = 5/6.',
        ),
        choose(
          'P(at least one alert today) = 0.7. What is P(no alerts today)?',
          ['0.7', '1.7', '0.3', '0'],
          2,
          '"No alerts" is the complement of "at least one alert".',
        ),
      ],
    },
    {
      title: 'Condition on a selected group',
      explanation: [
        'P(A | B) is the probability of A among only the outcomes where B holds: P(A and B) / P(B), or with counts, (count of A and B) / (count of B). Conditioning replaces the whole population with the selected group in the denominator.',
      ],
      example: {
        code: 'emails = 200\nflagged = 40\nflagged_and_spam = 30\nprint(flagged_and_spam / flagged)',
        output: '0.75',
        explanation:
          'Among the 40 flagged emails, 30 are spam. The other 160 emails are outside the condition and do not enter the denominator.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'customers = 500\nreturned = 50\nreturned_and_damaged = 20\nprint(returned_and_damaged / returned)',
          ['0.04', '0.4', '2.5', '0.1'],
          1,
          'Within the 50 returns, 20 were damaged: 20 / 50 = 0.4.',
        ),
        choose(
          'P(A and B) = 0.12 and P(B) = 0.4. What is P(A | B)?',
          ['0.3', '0.048', '0.52', '3.33'],
          0,
          '0.12 / 0.4 = 0.3.',
        ),
        choose(
          'Of 1,000 people, 100 smoke, and 30 of the smokers have a cough. What is P(cough | smoker)?',
          ['0.03', '0.1', '0.3', '0.13'],
          2,
          'Restrict to the 100 smokers: 30 / 100 = 0.3.',
        ),
        choose(
          'In P(A | B), which outcomes form the denominator?',
          [
            'All outcomes',
            'Only the outcomes where A holds',
            'Outcomes where neither holds',
            'Only the outcomes where B holds',
          ],
          3,
          'Conditioning on B restricts attention to the outcomes where B holds.',
        ),
      ],
    },
    {
      title: 'Keep P(A | B) and P(B | A) apart',
      explanation: [
        'P(A | B) and P(B | A) share the numerator P(A and B) but divide by different groups, so they usually differ. Among 1,000 patients, 10 are sick and 9 of them test positive, while 99 healthy patients also test positive: P(positive | sick) = 9/10, but P(sick | positive) = 9/108.',
      ],
      example: worked(
        '1,000 patients: 10 sick (9 test positive), 990 healthy (99 test positive)\nP(positive | sick) = 9 / 10\nP(sick | positive) = 9 / (9 + 99)',
        '0.9 versus about 0.083',
        'Both use the 9 sick positives, but the second divides by all 108 positives, most of which are healthy.',
      ),
      questions: [
        choose(
          'In this example, why is P(sick | positive) much smaller than P(positive | sick)?',
          [
            'The test is broken',
            'Probabilities cannot exceed 0.5',
            'Healthy patients far outnumber sick ones, so many positives are false alarms',
            'The two probabilities have different numerators',
          ],
          2,
          'The denominator of P(sick | positive) is dominated by healthy patients who test positive.',
        ),
        choose(
          'Of 100 students, 60 study math, 20 study art, and 15 study both. What is P(math | art)?',
          ['0.25', '0.15', '0.6', '0.75'],
          3,
          'Among the 20 art students, 15 study math: 15 / 20 = 0.75.',
        ),
        choose(
          'Of 100 students, 60 study math, 20 study art, and 15 study both. What is P(art | math)?',
          ['0.75', '0.25', '0.2', '0.15'],
          1,
          'Among the 60 math students, 15 study art: 15 / 60 = 0.25.',
        ),
        choose(
          'P(A and B) = 0.1, P(A) = 0.5, and P(B) = 0.2. What are P(A | B) and P(B | A)?',
          ['0.5 and 0.2', '0.2 and 0.5', '0.1 and 0.1', '0.05 and 0.02'],
          0,
          'P(A | B) = 0.1 / 0.2 = 0.5 and P(B | A) = 0.1 / 0.5 = 0.2.',
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
        'Two of the four equally likely outcomes give X = 1, so that value gets probability 1/2.',
      ),
      questions: [
        choose(
          'X is the number of heads in two fair coin flips. What is P(X = 1)?',
          ['1/4', '1/3', '1/2', '2/3'],
          2,
          'HT and TH both give one head: 2 of 4 equally likely outcomes.',
        ),
        choose(
          'A distribution has P(X = 0) = 0.5, P(X = 1) = 0.3, and one other value, 2. What is P(X = 2)?',
          ['0.8', '0.2', '0.5', '0.3'],
          1,
          'The probabilities must sum to 1: 1 − 0.5 − 0.3 = 0.2.',
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
        choose(
          'X is 1 when a fair die shows an even number and 0 otherwise. What is P(X = 1)?',
          ['1/2', '1/6', '1/3', '1'],
          0,
          'Three of the six faces are even.',
        ),
      ],
    },
    {
      title: 'Compute an expected value',
      explanation: [
        'The expected value E[X] multiplies each value by its probability and adds the products. It is a weighted mean with the probabilities as weights, and it is the long-run average over many repetitions, even when X can never equal it.',
      ],
      example: worked(
        'X = 0, 1, 2 with probabilities 0.5, 0.3, 0.2\nE[X] = 0 × 0.5 + 1 × 0.3 + 2 × 0.2',
        'E[X] = 0.7',
        'The products are 0, 0.3, and 0.4. The average 0.7 is not a value X can take.',
      ),
      questions: [
        choose(
          'X is the roll of a fair six-sided die. What is E[X]?',
          ['3', '3.5', '6', '21'],
          1,
          'Each face has probability 1/6, so E[X] = 21 / 6 = 3.5.',
        ),
        choose(
          'X is 10 with probability 0.1 and 0 otherwise. What is E[X]?',
          ['10', '0.1', '1', '5'],
          2,
          '10 × 0.1 + 0 × 0.9 = 1.',
        ),
        predictOutput(
          'This program computes E[X] for X = 0, 2, 4 with probabilities 0.25, 0.5, 0.25. What does it print?',
          'print(0 * 0.25 + 2 * 0.5 + 4 * 0.25)',
          ['6', '2', '1.5', '2.0'],
          3,
          'The products 0, 1.0, and 1.0 sum to the float 2.0.',
        ),
        choose(
          'A bet wins 50 with probability 0.02 and loses 2 otherwise. What is its expected result?',
          ['-0.96', '48', '1', '-2'],
          0,
          '50 × 0.02 − 2 × 0.98 = 1 − 1.96 = −0.96.',
        ),
      ],
    },
    {
      title: 'Use linearity of expectation',
      explanation: [
        'Expectation passes through scaling and shifting: E[aX + b] = a E[X] + b. The expectation of a sum is the sum of the expectations, E[X + Y] = E[X] + E[Y], even when X and Y depend on each other. This gives the average of a total without listing every combined outcome.',
      ],
      example: worked(
        'daily orders X with E[X] = 40\nprofit = 3X − 20\nE[profit] = 3 × 40 − 20',
        'E[profit] = 100',
        'Scaling by 3 and subtracting 20 act on the expectation the same way they act on each value.',
      ),
      questions: [
        choose(
          'E[X] = 5. What is E[2X + 3]?',
          ['10', '13', '16', '8'],
          1,
          '2 × 5 + 3 = 13.',
        ),
        choose(
          'E[X] = 2 and E[Y] = 7, and X and Y are dependent. What is E[X + Y]?',
          ['14', '5', '9', 'Unknown without independence'],
          2,
          'Linearity of expectation holds with or without independence.',
        ),
        choose(
          'Each of 30 transactions has an expected fee of 0.5. What is the expected total fee?',
          ['0.5', '30', '60', '15'],
          3,
          'The expected total is the sum of the 30 expected fees.',
        ),
        choose(
          'E[X] = −4. What is E[−X + 1]?',
          ['-3', '5', '-5', '3'],
          1,
          '−(−4) + 1 = 5.',
        ),
      ],
    },
  ],
  'math-rv-variance': [
    {
      title: 'Compute the variance of a random variable',
      explanation: [
        'Var(X) = E[(X − μ)²]: square each value’s distance from the mean μ, weight it by its probability, and add. The shortcut Var(X) = E[X²] − μ² gives the same number. The standard deviation is √Var(X).',
      ],
      example: worked(
        'X = 0 or 4, each with probability 0.5\nμ = 2\nVar(X) = 0.5 × (0 − 2)² + 0.5 × (4 − 2)²',
        'Var(X) = 4, standard deviation 2',
        'Both values lie 2 from the mean, so the expected squared distance is 4.',
      ),
      questions: [
        choose(
          'X is 1 or 5, each with probability 1/2. What is Var(X)?',
          ['2', '16', '4', '3'],
          2,
          'The mean is 3 and both values lie 2 away, so Var(X) = 4.',
        ),
        choose(
          'E[X] = 2 and E[X²] = 7. What is Var(X)?',
          ['5', '3', '9', '7'],
          1,
          'Var(X) = E[X²] − μ² = 7 − 4 = 3.',
        ),
        choose(
          'X always equals 8. What is Var(X)?',
          ['8', '64', '1', '0'],
          3,
          'A constant never deviates from its mean.',
        ),
        choose(
          'Var(X) = 25. What is the standard deviation of X?',
          ['5', '25', '625', '12.5'],
          0,
          'The standard deviation is √25 = 5.',
        ),
      ],
    },
    {
      title: 'Scale and shift a random variable',
      explanation: [
        'Adding a constant moves every value and the mean together, so the spread stays the same. Multiplying by a constant a multiplies every distance from the mean by a, and therefore the variance by a²: Var(aX + b) = a² Var(X). The standard deviation becomes |a| times as large.',
      ],
      example: worked(
        'temperature X in °C with Var(X) = 4\nF = 1.8X + 32\nVar(F) = 1.8² × 4',
        'Var(F) = 12.96',
        'The shift by 32 has no effect; the factor 1.8 enters squared.',
      ),
      questions: [
        choose(
          'Var(X) = 3. What is Var(X + 100)?',
          ['103', '3', '300', '0'],
          1,
          'A shift does not change spread.',
        ),
        choose(
          'Var(X) = 3. What is Var(4X)?',
          ['48', '12', '7', '3'],
          0,
          '4² × 3 = 48.',
        ),
        choose(
          'Var(X) = 2. What is Var(−X)?',
          ['-2', '4', '0', '2'],
          3,
          '(−1)² × 2 = 2; variance is never negative.',
        ),
        choose(
          'X has standard deviation 5. What is the standard deviation of 3X − 7?',
          ['8', '225', '15', '45'],
          2,
          'The standard deviation scales by |3|, and the shift has no effect.',
        ),
      ],
    },
    {
      title: 'Add independent variances and average them down',
      explanation: [
        'For independent X and Y, Var(X + Y) = Var(X) + Var(Y), and variances add even for a difference: Var(X − Y) = Var(X) + Var(Y). The mean of n independent copies, each with variance σ², has variance σ² / n, which is why averaging independent errors makes a result steadier.',
      ],
      example: worked(
        '4 independent measurements, each with variance 8\nVar(sum) = 4 × 8 = 32\nVar(mean) = Var(sum / 4) = 32 / 4²',
        'Var(mean) = 2',
        'Dividing the sum by 4 divides its variance by 4² = 16, giving 8 / 4.',
      ),
      questions: [
        choose(
          'X and Y are independent with variances 3 and 4. What is Var(X − Y)?',
          ['-1', '1', '7', '12'],
          2,
          'Subtracting an independent variable still adds its variance.',
        ),
        choose(
          'Each of 25 independent readings has variance 50. What is the variance of their mean?',
          ['50', '2', '1250', '10'],
          1,
          'σ² / n = 50 / 25 = 2.',
        ),
        choose(
          "Several models' errors are strongly correlated. Why does averaging them reduce variance only a little?",
          [
            'Correlated errors have no variance',
            'Averaging always removes bias',
            'The mean of predictions is undefined',
            'The rule Var(mean) = σ² / n assumes independent errors',
          ],
          3,
          'When errors move together they do not cancel, so the σ² / n reduction does not apply.',
        ),
        choose(
          'Averaging n independent copies cuts the variance to one tenth of a single copy. What is n?',
          ['√10', '100', '10', '5'],
          2,
          'σ² / n = σ² / 10 when n = 10.',
        ),
      ],
    },
  ],
  'math-bernoulli-binomial': [
    {
      title: 'Describe a Bernoulli trial',
      explanation: [
        'A Bernoulli variable records one yes/no trial: 1 with probability p and 0 with probability 1 − p. Its mean is p and its variance is p(1 − p), which is largest at p = 0.5 and shrinks toward 0 as the outcome becomes nearly certain.',
      ],
      example: worked(
        'a visitor clicks with probability p = 0.1\nE[X] = 0.1\nVar(X) = 0.1 × 0.9',
        'mean 0.1, variance 0.09',
        'The mean is the success probability; the variance multiplies it by the failure probability.',
      ),
      questions: [
        choose(
          'X is Bernoulli with p = 0.25. What is E[X]?',
          ['0.75', '0.25', '0.1875', '1'],
          1,
          'The mean of a Bernoulli variable is p.',
        ),
        choose(
          'X is Bernoulli with p = 0.25. What is Var(X)?',
          ['0.25', '0.0625', '0.1875', '0.75'],
          2,
          'p(1 − p) = 0.25 × 0.75 = 0.1875.',
        ),
        choose(
          'Which p gives a Bernoulli variable its largest variance?',
          ['0', '1', '0.25', '0.5'],
          3,
          'p(1 − p) peaks at p = 0.5, where the outcome is least predictable.',
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
          'p(1 − p) = 0.99 × 0.01 ≈ 0.0099 because the result rarely varies.',
        ),
      ],
    },
    {
      title: 'Multiply probabilities of independent trials',
      explanation: [
        'When trials are independent, the probability of a particular sequence is the product of the individual probabilities. With p = 0.3, the sequence 1, 1, 0 has probability 0.3 × 0.3 × 0.7 = 0.063. Different orders of the same numbers of successes and failures have the same probability.',
      ],
      example: {
        code: 'p = 0.5\nprint(p * p * (1 - p))',
        output: '0.125',
        explanation:
          'The sequence 1, 1, 0 multiplies p, p, and 1 − p: 0.5 × 0.5 × 0.5 = 0.125.',
      },
      questions: [
        predictOutput(
          'This program computes the probability of the sequence 1, 0, 0, 1. What does it print?',
          'p = 0.5\nprint(p * (1 - p) * (1 - p) * p)',
          ['0.25', '1.0', '0.0625', '0.5'],
          2,
          'Four independent factors of 0.5 multiply to 0.0625.',
        ),
        choose(
          'A server fails on a given day with probability 0.1, independently across days. What is P(no failure on two days)?',
          ['0.8', '0.81', '0.9', '0.01'],
          1,
          '0.9 × 0.9 = 0.81; probabilities multiply, they do not subtract.',
        ),
        choose(
          'With p = 0.2, which sequence of three trials is most probable?',
          ['1, 1, 1', '1, 0, 1', '0, 0, 0', '0, 1, 0'],
          2,
          '0.8³ = 0.512 is larger than any sequence containing a success factor of 0.2.',
        ),
        choose(
          'With p = 0.4, how do P(1, 0) and P(0, 1) compare?',
          [
            'P(1, 0) is larger',
            'P(0, 1) is larger',
            'They sum to 1',
            'They are equal',
          ],
          3,
          'Both are 0.4 × 0.6 = 0.24; order does not change the product.',
        ),
      ],
    },
    {
      title: 'Count arrangements with C(n, k)',
      explanation: [
        'C(n, k), read "n choose k", counts the ways to choose which k of n trials are the successes: C(n, k) = n! / (k! (n − k)!), where n! = n × (n − 1) × … × 1 and 0! = 1. Choosing the successes is the same as choosing the failures, so C(n, k) = C(n, n − k).',
      ],
      example: worked(
        'C(5, 2) = 5! / (2! × 3!)\n= 120 / (2 × 6)',
        '10',
        'There are 10 ways to place 2 successes among 5 trials.',
      ),
      questions: [
        choose(
          'What is C(4, 1)?',
          ['1', '4', '24', '3'],
          1,
          'The single success can be in any of the 4 positions.',
        ),
        choose(
          'What is C(6, 2)?',
          ['12', '30', '15', '36'],
          2,
          '6! / (2! × 4!) = 720 / 48 = 15.',
        ),
        choose(
          'What is C(10, 10)?',
          ['10', '0', '100', '1'],
          3,
          'There is exactly one way to make every trial a success.',
        ),
        choose(
          'C(8, 3) = 56. What is C(8, 5)?',
          ['56', '40', '336', '15'],
          0,
          'Choosing 3 successes is the same as choosing the 5 failures.',
        ),
      ],
    },
    {
      title: 'Combine counts into binomial probabilities',
      explanation: [
        'The number of successes K in n independent Bernoulli(p) trials is binomial: P(K = k) = C(n, k) pᵏ (1 − p)ⁿ⁻ᵏ, the number of arrangements times the probability of each one. Because K adds n Bernoulli variables, its mean is np and its variance is np(1 − p).',
      ],
      example: {
        code: 'p = 0.5\nprint(3 * p ** 2 * (1 - p))',
        output: '0.375',
        explanation:
          'For exactly 2 successes in 3 trials there are C(3, 2) = 3 arrangements, each with probability 0.5² × 0.5.',
      },
      questions: [
        choose(
          'Three fair coins are flipped. What is P(exactly 2 heads)?',
          ['1/8', '3/8', '1/2', '2/3'],
          1,
          'C(3, 2) = 3 arrangements, each with probability 1/8.',
        ),
        predictOutput(
          'This program computes P(K = 3) for n = 4 fair trials. What does it print?',
          'p = 0.5\nprint(4 * p ** 3 * (1 - p))',
          ['0.0625', '0.125', '0.5', '0.25'],
          3,
          'C(4, 3) = 4 arrangements, each with probability 1/16.',
        ),
        choose(
          'A test has 20 independent questions, each answered correctly with probability 0.8. What is the expected number correct?',
          ['4', '20', '16', '3.2'],
          2,
          'np = 20 × 0.8 = 16.',
        ),
        choose(
          'K is binomial with n = 50 and p = 0.2. What is Var(K)?',
          ['8', '10', '0.16', '40'],
          0,
          'np(1 − p) = 50 × 0.2 × 0.8 = 8.',
        ),
      ],
    },
  ],
  'math-normal-distribution': [
    {
      title: "Read the bell curve's parameters",
      explanation: [
        'A normal distribution N(μ, σ²) is symmetric around its mean μ, which is also its median and the center of its peak. The standard deviation σ sets the width: a larger σ spreads the same total probability over a wider range, so the peak is lower. Probabilities are areas under the curve, so P(X = a) = 0 for any exact value a, and P(X < μ) = 0.5.',
      ],
      example: worked(
        'A ~ N(50, 2²)\nB ~ N(50, 10²)',
        'same center 50; B is five times as wide, with a lower peak',
        'The means match, so both curves are centered at 50; only σ differs.',
      ),
      questions: [
        choose(
          'X ~ N(30, 4²). What is P(X < 30)?',
          ['0.3', '0.5', '0.68', '0'],
          1,
          'A normal distribution is symmetric about its mean.',
        ),
        choose(
          'Which change makes a normal curve wider?',
          [
            'Increasing μ',
            'Decreasing σ',
            'Increasing σ',
            'Adding a constant to every value',
          ],
          2,
          'σ controls the width; μ and shifts only move the center.',
        ),
        choose(
          'X ~ N(0, 1). What is P(X = 0) exactly?',
          ['0.5', '1', '0.4', '0'],
          3,
          'A single exact value covers no area under the curve.',
        ),
        choose(
          'X ~ N(100, 15²). What is the median of X?',
          ['100', '85', '115', '15'],
          0,
          'Symmetry makes the median equal the mean.',
        ),
      ],
    },
    {
      title: 'Apply the 68–95–99.7 rule',
      explanation: [
        'For any normal distribution, about 68% of values lie within one standard deviation of the mean, 95% within two, and 99.7% within three. Symmetry splits the remainder evenly between the two tails, so about 2.5% lie above μ + 2σ.',
      ],
      example: worked(
        'scores ~ N(100, 15²)\n85 to 115 is μ ± σ\n70 to 130 is μ ± 2σ',
        'about 68% between 85 and 115; about 95% between 70 and 130',
        'Each interval counts whole standard deviations away from the mean.',
      ),
      questions: [
        choose(
          'Bulb lifetimes follow N(1000, 50²) hours. About what share lasts between 900 and 1100 hours?',
          ['68%', '95%', '99.7%', '50%'],
          1,
          '900 and 1100 are two standard deviations from the mean.',
        ),
        choose(
          'Heights follow N(170, 8²) cm. About what share is taller than 186 cm?',
          ['16%', '5%', '0.15%', '2.5%'],
          3,
          '186 = μ + 2σ, and half of the 5% outside ±2σ lies above.',
        ),
        choose(
          'Scores follow N(60, 10²). About what share lies between 50 and 70?',
          ['95%', '50%', '68%', '34%'],
          2,
          '50 and 70 are one standard deviation from the mean.',
        ),
        choose(
          'For a normal distribution, about what share lies below μ − σ?',
          ['16%', '32%', '34%', '2.5%'],
          0,
          '32% lies outside ±1σ, split evenly: 16% in each tail.',
        ),
      ],
    },
    {
      title: 'Standardize values with z-scores',
      explanation: [
        'A z-score z = (x − μ) / σ says how many standard deviations x lies above the mean (positive) or below it (negative). Standardizing puts values from different scales on one common scale, and under a normal model a value with |z| > 3 is rare.',
      ],
      example: {
        code: 'mu = 70\nsigma = 8\nx = 50\nprint((x - mu) / sigma)',
        output: '-2.5',
        explanation:
          '50 lies 20 below the mean, which is 2.5 standard deviations of size 8.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'mu = 200\nsigma = 25\nx = 250\nprint((x - mu) / sigma)',
          ['50', '2.0', '-2.0', '0.5'],
          1,
          '(250 − 200) / 25 = 2.0 standard deviations above the mean.',
        ),
        choose(
          'Ana scores 82 on a test with mean 70 and σ = 6; Ben scores 90 on a test with mean 80 and σ = 10. Who did relatively better?',
          ['Ben', 'They tie', 'Ana', 'Different tests cannot be compared'],
          2,
          "Ana's z-score is 2 and Ben's is 1.",
        ),
        choose(
          'A value has z = −1.5 under N(40, 4²). What is the value?',
          ['46', '38.5', '-6', '34'],
          3,
          'x = μ + zσ = 40 − 1.5 × 4 = 34.',
        ),
        predictOutput(
          'What does this program print?',
          'mu = 12\nsigma = 3\nx = 3\nprint((x - mu) / sigma)',
          ['3.0', '-3.0', '-9', '1.0'],
          1,
          '(3 − 12) / 3 = −3.0: three standard deviations below the mean.',
        ),
      ],
    },
  ],
  'math-sampling': [
    {
      title: 'Separate a sample from its population',
      explanation: [
        'A population is every unit a question is about; a sample is the subset actually observed. A population value such as the true mean μ is fixed but usually unknown, while a sample statistic such as the sample mean x̄ changes from one random sample to the next. That change is sampling variation, not a mistake. A sample chosen in a biased way can miss the population no matter how large it is.',
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
        'For n independent observations with standard deviation σ, the sample mean has standard deviation σ / √n, its standard error. Variation in the mean shrinks with the square root of n, so quadrupling the sample halves the standard error. By the central limit theorem the sample mean is approximately normal for large n, so about 95% of sample means fall within 2 standard errors of μ.',
      ],
      example: {
        code: 'sigma = 30\nn = 225\nprint(sigma / n ** 0.5)',
        output: '2.0',
        explanation:
          '√225 = 15, so the standard error is 30 / 15 = 2.0. ** binds before /, so n ** 0.5 is computed first.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'sigma = 12\nn = 16\nprint(sigma / n ** 0.5)',
          ['0.75', '12', '3.0', '48.0'],
          2,
          '√16 = 4, and 12 / 4 = 3.0.',
        ),
        choose(
          'σ = 8 and n = 64. What is the standard error of the sample mean?',
          ['1', '0.125', '8', '64'],
          0,
          '8 / √64 = 8 / 8 = 1.',
        ),
        choose(
          'A sample of 100 gives a standard error of 4. What sample size gives a standard error of 2?',
          ['200', '50', '141', '400'],
          3,
          'Halving the standard error requires four times as many observations.',
        ),
        choose(
          'μ = 50 and the standard error is 3. About 95% of sample means fall in which interval?',
          ['47 to 53', '44 to 56', '41 to 59', '50 to 56'],
          1,
          'Two standard errors on each side: 50 ± 6.',
        ),
      ],
    },
    {
      title: 'Resample with replacement',
      explanation: [
        'Sampling with replacement returns each drawn unit before the next draw, so a unit can appear more than once. A bootstrap sample draws n rows with replacement from the n observed rows; some rows repeat and others are left out. Computing a statistic on many bootstrap samples shows how much it would vary, and bagging trains one model on each bootstrap sample.',
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
        'Given observed data and a model with parameter p, the likelihood L(p) is the probability of exactly those data if p were true. For independent Bernoulli observations, multiply p for each 1 and 1 − p for each 0. A larger likelihood means the parameter value explains the data better.',
      ],
      example: {
        code: 'p = 0.5\nprint(p * p * (1 - p))\np = 0.75\nprint(p * p * (1 - p))',
        output: '0.125\n0.140625',
        explanation:
          'For the data 1, 1, 0, the value p = 0.75 makes the observations more probable than p = 0.5.',
      },
      questions: [
        choose(
          'The data are 1, 0 from a Bernoulli(p) model. What is L(0.5)?',
          ['0.5', '0.25', '1', '0'],
          1,
          '0.5 × (1 − 0.5) = 0.25.',
        ),
        predictOutput(
          'This program computes L(0.25) for the data 1, 0, 0. What does it print?',
          'p = 0.25\nprint(p * (1 - p) * (1 - p))',
          ['0.25', '0.046875', '0.140625', '0.5625'],
          2,
          '0.25 × 0.75 × 0.75 = 0.140625.',
        ),
        choose(
          'The data are 1, 1, 1, 0. Which value of p has the larger likelihood?',
          [
            'p = 0.25',
            'p = 0.75',
            'They are equal',
            'Likelihoods cannot compare them',
          ],
          1,
          '0.75³ × 0.25 ≈ 0.105 exceeds 0.25³ × 0.75 ≈ 0.012.',
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
        'Maximum likelihood estimation chooses the parameter value with the largest likelihood. For k successes in n independent Bernoulli trials, the maximizer is p = k / n, the observed success rate. Values farther from k / n make the observed data less probable.',
      ],
      example: worked(
        'data: 2 successes in 5 trials\nL(p) = p²(1 − p)³\nL(0.2) ≈ 0.0205, L(0.4) ≈ 0.0346, L(0.6) ≈ 0.0230',
        'maximum at p = 2/5 = 0.4',
        'The likelihood rises toward the observed rate 0.4 and falls after it.',
      ),
      questions: [
        choose(
          'A drug works for 18 of 24 independent patients. What is the maximum likelihood estimate of its success rate?',
          ['0.5', '0.75', '18', '0.25'],
          1,
          'k / n = 18 / 24 = 0.75.',
        ),
        choose(
          'A filter sees 3 spam messages among 60. What is the maximum likelihood estimate of the spam rate?',
          ['0.3', '0.5', '0.05', '20'],
          2,
          '3 / 60 = 0.05.',
        ),
        choose(
          'The data are 0, 0, 0, 0. What is the maximum likelihood estimate of p?',
          ['0.5', '0.25', '1', '0'],
          3,
          'L(p) = (1 − p)⁴ is largest at p = 0, matching k / n = 0 / 4.',
        ),
        choose(
          'With 4 successes in 10 trials, which candidate has the largest likelihood?',
          ['p = 0.4', 'p = 0.5', 'p = 0.1', 'p = 0.9'],
          0,
          'The likelihood peaks at the observed rate 4 / 10.',
        ),
      ],
    },
    {
      title: 'Work with log-likelihoods',
      explanation: [
        'Products of many probabilities shrink toward 0, so we take logs: ln L(p) adds the log-probabilities of the observations. Because ln is increasing, the parameter that maximizes the log-likelihood also maximizes the likelihood. Training usually minimizes the negative log-likelihood, which is the same goal.',
      ],
      example: worked(
        'data 1, 1, 0\nL(p) = p × p × (1 − p)\nln L(p) = ln p + ln p + ln(1 − p) = 2 ln p + ln(1 − p)',
        'a sum instead of a product; both peak at p = 2/3',
        'The log of a product is the sum of the logs, and taking logs keeps the location of the maximum.',
      ),
      questions: [
        choose(
          'L(p) = p³(1 − p). Which expression is ln L(p)?',
          [
            'ln(3p) + ln(1 − p)',
            '3 ln p + ln(1 − p)',
            '3 ln p × ln(1 − p)',
            '(ln p)³ + ln(1 − p)',
          ],
          1,
          'ln turns the product into a sum and the power into a factor.',
        ),
        choose(
          'On the same data, model A has log-likelihood −12.4 and model B has −15.1. Which explains the data better?',
          ['B', 'They tie', 'A', 'Log-likelihoods cannot be compared'],
          2,
          '−12.4 is larger, and a larger log-likelihood means a larger likelihood.',
        ),
        choose(
          'Minimizing the negative log-likelihood is equivalent to what?',
          [
            'Minimizing the likelihood',
            'Maximizing the number of parameters',
            'Setting p = 0.5',
            'Maximizing the likelihood',
          ],
          3,
          'Negating flips minimization into maximization, and ln preserves the maximizer.',
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
        'For a binary label y and a predicted probability p that y = 1, the likelihood of the label is p when y = 1 and 1 − p when y = 0. Its negative log is the binary cross-entropy −(y ln p + (1 − y) ln(1 − p)). Confident correct predictions cost little; confident wrong ones cost a lot, because the log of a number near 0 is very negative.',
      ],
      example: worked(
        'y = 1, p = 0.9: −ln 0.9\ny = 1, p = 0.1: −ln 0.1\ny = 0, p = 0.1: −ln(1 − 0.1)',
        '≈ 0.105, ≈ 2.303, ≈ 0.105',
        'The loss depends on the probability given to the true label: 0.9 in the first and third cases, 0.1 in the second.',
      ),
      questions: [
        choose(
          'The label is y = 0 and the model predicts p = 0.8 for class 1. What is the loss?',
          ['−ln(0.8) ≈ 0.223', '0.8', '−ln(0.2) ≈ 1.609', '−ln(1) = 0'],
          2,
          'With y = 0 only −ln(1 − p) remains, and the true label received probability 0.2.',
        ),
        choose(
          'For a label y = 1, which prediction has the largest cross-entropy?',
          ['p = 0.99', 'p = 0.6', 'p = 0.5', 'p = 0.01'],
          3,
          '−ln(0.01) ≈ 4.6 is far larger than the others.',
        ),
        choose(
          'The label is y = 1 and p = e⁻¹. What is the cross-entropy?',
          ['e', '1', '−1', '0.368'],
          1,
          '−ln(e⁻¹) = 1.',
        ),
        choose(
          'A model predicts p = 0.5 for every example. What is its cross-entropy on each one?',
          ['ln 2 ≈ 0.693', '0.5', '0', '1'],
          0,
          'Either label receives probability 0.5, and −ln(0.5) = ln 2.',
        ),
      ],
    },
  ],
};
