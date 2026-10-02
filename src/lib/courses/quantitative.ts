import type { CurriculumCatalog, Skill, ChoiceQuestion } from '../curriculum';
const courseId = 'quantitative-foundations';
const unitId = 'math-data-foundations';
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
const definitions = [
  {
    id: 'math-mean',
    title: 'Means and weighted averages',
    prerequisites: ['numbers', 'lists', 'for-loops'],
    summary:
      'Summarize a collection while keeping track of what each observation contributes.',
    paragraphs: [
      'The arithmetic mean is the sum of observations divided by their count. It is sensitive to unusually large or small values, so a mean alone cannot describe a distribution.',
      'A weighted mean divides the sum of value × weight by the sum of weights. Counts can be weights when combining group averages; averaging the group averages without counts can give the wrong result.',
    ],
    code: 'values = [2, 4, 9]\nprint(sum(values) / len(values))',
    output: '5.0',
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
    prompt: 'Set mean_value to the arithmetic mean of values = [3, 5, 10].',
    starter: 'values = [3, 5, 10]\nmean_value = 0',
    solution: 'values = [3, 5, 10]\nmean_value = sum(values) / len(values)',
    tests: 'assert abs(mean_value - 6.0) < 1e-9',
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
    title: 'Variance and standard deviation',
    prerequisites: ['math-mean'],
    summary: 'Measure spread with squared distances from the mean.',
    paragraphs: [
      'Population variance averages the squared distance of each observation from the population mean. Squaring prevents positive and negative deviations from cancelling.',
      'Standard deviation is the square root of variance, returning the measurement to the original units. Sample variance divides by n − 1 when estimating a population variance from a sample; state which convention you use.',
    ],
    code: 'values = [1, 3, 5]\nmean = sum(values) / len(values)\nvariance = sum((x - mean) ** 2 for x in values) / len(values)\nprint(round(variance, 2))',
    output: '2.67',
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
    prompt:
      'Calculate population_variance for values = [2, 4, 6], dividing by the number of observations.',
    starter: 'values = [2, 4, 6]\npopulation_variance = 0',
    solution:
      'values = [2, 4, 6]\nmean = sum(values) / len(values)\npopulation_variance = sum((x - mean) ** 2 for x in values) / len(values)',
    tests: 'assert abs(population_variance - 8 / 3) < 1e-9',
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
    id: 'math-vectors',
    title: 'Vectors and dot products',
    prerequisites: ['math-mean'],
    summary:
      'Represent features as ordered coordinates and combine them with weights.',
    paragraphs: [
      'A vector is an ordered collection of numbers. In a model, its coordinates might represent age, distance, and price. The position and units of each coordinate matter.',
      'The dot product multiplies corresponding coordinates and sums the products. For x = [2, 3] and w = [4, 1], x · w = 2 × 4 + 3 × 1 = 11. Vectors must have the same length; silently truncating an input loses information.',
    ],
    code: 'x = [2, 3]\nw = [4, 1]\nprint(sum(x[i] * w[i] for i in range(len(x))))',
    output: '11',
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
    prompt: 'Compute dot_value for x = [2, -1, 3] and w = [4, 2, 1].',
    starter: 'x = [2, -1, 3]\nw = [4, 2, 1]\ndot_value = 0',
    solution:
      'x = [2, -1, 3]\nw = [4, 2, 1]\ndot_value = sum(x[i] * w[i] for i in range(len(x)))',
    tests: 'assert dot_value == 9',
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
    id: 'math-probability',
    title: 'Probability and conditional events',
    prerequisites: ['math-mean'],
    summary:
      'Distinguish an event probability from a probability within a selected group.',
    paragraphs: [
      'A probability lies between 0 and 1. For equally likely outcomes, an event probability is the number of favorable outcomes divided by the total number of outcomes.',
      'Conditional probability P(A | B) restricts attention to the outcomes where B holds. It equals P(A and B) / P(B) when P(B) > 0. Conditioning can change the denominator drastically, and P(A | B) generally differs from P(B | A).',
    ],
    code: 'total = 100\npositive = 20\npositive_and_condition = 12\nprint(positive_and_condition / positive)',
    output: '0.6',
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
    prompt:
      'Among 50 selected observations, 15 have the event. Set conditional_probability to the event fraction within the selected group.',
    starter:
      'selected = 50\nevent_in_selected = 15\nconditional_probability = 0',
    solution:
      'selected = 50\nevent_in_selected = 15\nconditional_probability = event_in_selected / selected',
    tests: 'assert abs(conditional_probability - 0.3) < 1e-9',
    cards: [
      ['How is P(A | B) computed?', 'P(A and B) / P(B), provided P(B) > 0.'],
      [
        'Why is P(A | B) different from P(B | A)?',
        'They restrict attention to different groups, so their denominators differ.',
      ],
    ],
  },
  {
    id: 'math-gradients',
    title: 'Derivatives and gradient steps',
    prerequisites: ['math-vectors'],
    summary: 'Use local rates of change to reduce a differentiable objective.',
    paragraphs: [
      'A derivative describes how a function changes near a point. For f(w) = (w − 3)², f′(w) = 2(w − 3). The derivative is zero at the minimum w = 3.',
      'For several parameters, the gradient collects the partial derivatives in a vector. Gradient descent updates parameters with w_new = w − learning_rate × gradient. A step that is too large may increase the objective or diverge.',
    ],
    code: 'w = 0.0\nlearning_rate = 0.1\ngradient = 2 * (w - 3)\nw -= learning_rate * gradient\nprint(round(w, 2))',
    output: '0.6',
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
    prompt:
      'Starting at w = 1.0, take one gradient step on (w − 5)² using learning_rate = 0.25. Store the new value in w.',
    starter: 'w = 1.0\nlearning_rate = 0.25\n# Update w.',
    solution: 'w = 1.0\nlearning_rate = 0.25\nw -= learning_rate * 2 * (w - 5)',
    tests: 'assert abs(w - 3.0) < 1e-9',
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
];
const mathSkills: Skill[] = definitions.map((d, order) => ({
  id: d.id,
  title: d.title,
  prerequisites: d.prerequisites,
  summary: d.summary,
  courseId,
  unitId,
  domain: 'mathematics',
  order,
  estimatedMinutes: 8,
  assessment: { requiredTypes: ['choice', 'code'], reviewAnswers: 2 },
  lesson: {
    paragraphs: d.paragraphs,
    example: { code: d.code, output: d.output, explanation: d.summary },
  },
  questions: [
    ...d.questions.map((x, i) => ({ ...x, id: `${d.id}-q${i + 1}` })),
    {
      id: `${d.id}-q4`,
      type: 'code',
      prompt: d.prompt,
      starterCode: d.starter,
      solution: d.solution,
      tests: d.tests,
      explanation: d.summary,
      hint: d.paragraphs[1],
    },
  ],
  flashcards: d.cards.map(([front, back], i) => ({
    id: `${d.id}-card${i + 1}`,
    skillId: d.id,
    front,
    back,
  })),
}));
export const quantitativeCatalog: CurriculumCatalog = {
  courses: [
    {
      id: courseId,
      title: 'Quantitative foundations',
      description:
        'A focused bridge in averages, spread, vectors, probability, and gradients for data analysis and machine learning.',
      domain: 'mathematics',
      language: 'python',
      skillIds: mathSkills.map((x) => x.id),
    },
  ],
  units: [
    {
      id: unitId,
      courseId,
      title: 'Mathematics for data',
      description: 'Understand the quantities behind a model.',
    },
  ],
  skills: mathSkills,
};
