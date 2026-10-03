import { choose, part, typeNumber, type MultistepModule } from './authoring';

// Multistep problems for quantitative foundations (CEN-163): one scenario,
// then parts that each apply a different idea, from the problem's skill or an
// earlier skill it builds on.

export const multistepProblems: MultistepModule = {
  'math-convexity': [
    {
      title: 'Minimize a bowl-shaped loss',
      setup: {
        text: [
          'A model with one weight $w$ has the loss $L(w) = w^2 - 6w + 11$. Training looks for the weight with the smallest loss.',
        ],
      },
      parts: [
        part(
          'math-critical-points-kp1',
          typeNumber(
            "At which $w$ is $L'(w) = 0$?",
            3,
            "$L'(w) = 2w - 6$, which is zero at $w = 3$.",
          ),
        ),
        part(
          'math-convexity-kp2',
          typeNumber(
            "What is $L''(w)$?",
            2,
            'Differentiating $2w - 6$ again gives the constant 2, positive for every $w$.',
          ),
        ),
        part(
          'math-convexity-kp3',
          choose(
            "Gradient descent stops where $L'(w) = 0$. What can you conclude about that point?",
            [
              'It is the global minimum, since $L$ is convex',
              'It is a local minimum that may not be global',
              'It may be a maximum, since the slope is zero',
              'Nothing until other starting points are tried',
            ],
            0,
            'A positive second derivative everywhere makes $L$ convex, and a flat point of a convex function is its global minimum.',
          ),
        ),
        part(
          'math-critical-points-kp3',
          typeNumber(
            'What is the smallest value $L$ takes?',
            2,
            'At the global minimum $w = 3$: $L(3) = 9 - 18 + 11 = 2$.',
          ),
        ),
      ],
    },
  ],
  'math-eigenvectors': [
    {
      title: 'Find the main direction of two features',
      setup: {
        text: [
          'Two standardized features have this covariance matrix:',
          '$$\\Sigma = \\begin{pmatrix} 2 & 1 \\\\ 1 & 2 \\end{pmatrix}$$',
        ],
      },
      parts: [
        part(
          'math-identity-inverse-kp2',
          typeNumber(
            'What is the determinant of $\\Sigma$?',
            3,
            '$2 \\times 2 - 1 \\times 1 = 3$.',
          ),
        ),
        part(
          'math-eigenvectors-kp1',
          choose(
            'Which vector is an eigenvector of $\\Sigma$?',
            ['$(1, 1)$', '$(1, 2)$', '$(2, 1)$', '$(1, 0)$'],
            0,
            '$\\Sigma (1, 1) = (3, 3) = 3 (1, 1)$, a multiple of the vector itself. The others change direction: $\\Sigma (1, 2) = (4, 5)$.',
          ),
        ),
        part(
          'math-eigenvectors-kp2',
          typeNumber(
            'What is the larger eigenvalue of $\\Sigma$?',
            3,
            'The eigenvalues solve $(2 - \\lambda)^2 - 1 = 0$, so $\\lambda = 3$ or $\\lambda = 1$.',
          ),
        ),
        part(
          'math-eigenvectors-kp4',
          typeNumber(
            'What fraction of the total variance does the first principal component explain?',
            0.75,
            'The first component carries the largest eigenvalue: $3 / (3 + 1) = 0.75$.',
          ),
        ),
      ],
    },
  ],
  'math-likelihood': [
    {
      title: 'Estimate a coin from four flips',
      setup: {
        text: [
          'A coin lands heads with an unknown probability $p$. Four independent flips give heads, heads, tails, heads.',
        ],
      },
      parts: [
        part(
          'math-bernoulli-binomial-kp2',
          typeNumber(
            'If $p = 0.5$, what is the probability of exactly this sequence?',
            0.0625,
            'Independent flips multiply: $0.5^4 = 0.0625$.',
          ),
        ),
        part(
          'math-likelihood-kp1',
          typeNumber(
            'What is the likelihood of $p = 0.75$ for this sequence?',
            0.1055,
            'Three heads and one tail: $0.75^3 \\times 0.25 \\approx 0.1055$.',
            { tolerance: 0.0005, unit: 'to 4 decimals' },
          ),
        ),
        part(
          'math-likelihood-kp2',
          typeNumber(
            'Which value of $p$ makes this sequence most likely?',
            0.75,
            'For Bernoulli trials the maximum likelihood estimate is the share of heads: $3 / 4 = 0.75$.',
          ),
        ),
        part(
          'math-logarithms-kp3',
          choose(
            'Which expression equals the log-likelihood $\\ln\\left(p^3 (1 - p)\\right)$?',
            [
              '$3 \\ln p + \\ln(1 - p)$',
              '$\\ln(3p) + \\ln(1 - p)$',
              '$3 \\ln p \\cdot \\ln(1 - p)$',
              '$(\\ln p)^3 + \\ln(1 - p)$',
            ],
            0,
            'The log of a product is a sum of logs, and $\\ln p^3 = 3 \\ln p$.',
          ),
        ),
      ],
    },
  ],
  'math-gradients': [
    {
      title: 'Take one step downhill in two dimensions',
      setup: {
        text: [
          'A loss with two parameters has the gradient $\\nabla L(w_1, w_2) = (2w_1 - 4, 6w_2)$. Training starts at $(w_1, w_2) = (1, 1)$ with learning rate $\\eta = 0.1$.',
        ],
      },
      parts: [
        part(
          'math-gradient-vector-kp1',
          typeNumber(
            'What is the first component of the gradient at the start?',
            -2,
            '$2 \\times 1 - 4 = -2$.',
          ),
        ),
        part(
          'math-gradients-kp2',
          typeNumber(
            'After one gradient descent step, what is $w_1$?',
            1.2,
            'Each parameter moves against its own component: $1 - 0.1 \\times (-2) = 1.2$.',
          ),
        ),
        part(
          'math-gradients-kp3',
          typeNumber(
            'With $\\eta = 1$ instead, what would $w_2$ be after one step from 1?',
            -5,
            '$1 - 1 \\times 6 = -5$: a learning rate this large jumps far past the minimum at $w_2 = 0$.',
          ),
        ),
        part(
          'math-gradient-vector-kp3',
          typeNumber(
            'At which value of $w_1$ is the first component of the gradient zero?',
            2,
            '$2w_1 - 4 = 0$ at $w_1 = 2$, where the loss is flat in that direction.',
          ),
        ),
      ],
    },
  ],
  'math-sampling': [
    {
      title: 'Survey commute times',
      setup: {
        text: [
          'Commute times in a city are roughly normal with mean 30 minutes and standard deviation 8 minutes. A survey asks 16 randomly chosen commuters.',
        ],
      },
      parts: [
        part(
          'math-normal-distribution-kp3',
          typeNumber(
            'What is the z-score of a 42-minute commute?',
            1.5,
            '$z = (42 - 30) / 8 = 1.5$.',
          ),
        ),
        part(
          'math-normal-distribution-kp2',
          typeNumber(
            'About what percent of commutes take between 22 and 38 minutes?',
            68,
            'That range is one standard deviation on each side of the mean, which holds about 68% of a normal distribution.',
            { unit: '%' },
          ),
        ),
        part(
          'math-sampling-kp2',
          typeNumber(
            'What is the standard error of the survey’s mean commute?',
            2,
            '$8 / \\sqrt{16} = 2$ minutes.',
            { unit: 'minutes' },
          ),
        ),
        part(
          'math-sampling-kp2',
          typeNumber(
            'About 95% of such surveys get a mean within how many minutes of 30?',
            4,
            'Sample means are roughly normal with spread equal to the standard error, so 95% fall within $2 \\times 2 = 4$ minutes.',
            { unit: 'minutes' },
          ),
        ),
      ],
    },
  ],
  'math-correlation': [
    {
      title: 'Relate study hours to scores',
      setup: {
        text: [
          'Four students studied 1, 2, 3, and 4 hours and scored 50, 60, 70, and 80 out of 100.',
        ],
      },
      parts: [
        part(
          'math-covariance-kp2',
          typeNumber(
            'What is the population covariance of hours and scores?',
            12.5,
            'The means are 2.5 and 65. The products of deviations are 22.5, 2.5, 2.5, and 22.5, whose mean is 12.5.',
          ),
        ),
        part(
          'math-correlation-kp1',
          typeNumber(
            'What is the correlation coefficient $r$?',
            1,
            'The standard deviations are $\\sqrt{1.25}$ and $\\sqrt{125}$, whose product is 12.5, so $r = 12.5 / 12.5 = 1$.',
          ),
        ),
        part(
          'math-covariance-kp3',
          typeNumber(
            'If scores were reported out of 10 instead (each divided by 10), what would the covariance be?',
            1.25,
            'Covariance scales with the units of each variable: $12.5 / 10 = 1.25$.',
          ),
        ),
        part(
          'math-correlation-kp2',
          choose(
            'What does $r = 1$ tell you about these students?',
            [
              'Their points lie exactly on a rising line',
              'Each extra hour adds exactly one point',
              'Studying longer caused the higher scores',
              'Hours explain half the variation in score',
            ],
            0,
            'A correlation of 1 means a perfect increasing linear relationship. It says nothing about the slope or about cause.',
          ),
        ),
      ],
    },
  ],
  'math-distance': [
    {
      title: 'Choose the nearest store',
      setup: {
        text: [
          'A customer at $(1, 2)$ can walk to store $A$ at $(4, 6)$, store $B$ at $(-2, -2)$, or store $C$ at $(5, 2)$.',
        ],
      },
      parts: [
        part(
          'math-vector-norm-kp1',
          typeNumber(
            'What is the norm of the vector from the customer to $A$, $(3, 4)$?',
            5,
            '$\\sqrt{3^2 + 4^2} = \\sqrt{25} = 5$.',
          ),
        ),
        part(
          'math-distance-kp1',
          typeNumber(
            'What is the distance from the customer to $B$?',
            5,
            'The difference is $(-3, -4)$, whose length is also 5.',
          ),
        ),
        part(
          'math-distance-kp2',
          typeNumber(
            'What is the squared distance from the customer to $C$?',
            16,
            'The difference is $(4, 0)$: $4^2 + 0^2 = 16$.',
          ),
        ),
        part(
          'math-distance-kp2',
          choose(
            'Which store is nearest?',
            ['Store C', 'Store A', 'Store B', 'A and B tie'],
            0,
            'Comparing squared distances is enough: 16 for $C$ against 25 for $A$ and for $B$.',
          ),
        ),
      ],
    },
  ],
  'math-cosine-similarity': [
    {
      title: 'Compare three documents',
      setup: {
        text: [
          'Three documents are counted over the same three words: $u = (3, 4, 0)$, $v = (6, 8, 0)$, and $w = (0, 0, 2)$.',
        ],
      },
      parts: [
        part(
          'math-vector-norm-kp1',
          typeNumber('What is $\\|u\\|$?', 5, '$\\sqrt{9 + 16 + 0} = 5$.'),
        ),
        part(
          'math-cosine-similarity-kp1',
          typeNumber(
            'What is the cosine similarity of $u$ and $v$?',
            1,
            '$u \\cdot v = 18 + 32 = 50$ and $\\|u\\| \\|v\\| = 5 \\times 10 = 50$, so the cosine is 1.',
          ),
        ),
        part(
          'math-cosine-similarity-kp2',
          typeNumber(
            'What is the cosine similarity of $u$ and $w$?',
            0,
            'They share no word, so $u \\cdot w = 0$: the vectors are orthogonal.',
          ),
        ),
        part(
          'math-cosine-similarity-kp3',
          choose(
            '$v$ is twice as long as $u$. Why is their cosine similarity still 1?',
            [
              'Cosine compares direction, and $v$ points the same way',
              'Cosine ignores length only when the two lengths match exactly',
              'Both vectors have a zero in the third position',
              'A dot product can never be larger than 1',
            ],
            0,
            'Dividing by both lengths removes size, so only the angle between the vectors remains, and $v = 2u$.',
          ),
        ),
      ],
    },
  ],
};
