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
};
