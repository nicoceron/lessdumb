import {
  choose,
  part,
  typeNumber,
  typeOutput,
  type MultistepModule,
} from './authoring';

// Multistep problems for Machine Learning (CEN-163). A part's code runs after
// the setup's code, as one program, with NumPy available. Keras code is shown,
// not run: the browser runtime has no deep learning framework.

export const multistepProblems: MultistepModule = {
  'ml-backpropagation': [
    {
      title: 'Backpropagate through one neuron',
      setup: {
        text: [
          'A one-weight neuron computes $z = wx$ and $\\hat{y} = \\text{relu}(z)$, with the loss $L = (\\hat{y} - y)^2$. For one example, $x = 2$, $y = 2$, and the weight starts at $w = 1.5$.',
        ],
      },
      parts: [
        part(
          'ml-neural-layers-kp2',
          typeNumber(
            'What is $\\hat{y}$?',
            3,
            '$z = 1.5 \\times 2 = 3$, and relu keeps a positive value unchanged.',
          ),
        ),
        part(
          'ml-backpropagation-kp1',
          typeNumber(
            'What is $\\partial L / \\partial \\hat{y}$?',
            2,
            '$2(\\hat{y} - y) = 2(3 - 2) = 2$.',
          ),
        ),
        part(
          'ml-backpropagation-kp2',
          typeNumber(
            'What is $\\partial L / \\partial w$?',
            4,
            'Multiply along the chain: $2$ from the loss, $1$ for relu at a positive $z$, and $\\partial z / \\partial w = x = 2$.',
          ),
        ),
        part(
          'ml-gradient-descent-kp1',
          typeNumber(
            'With learning rate 0.1, what is $w$ after one update?',
            1.1,
            'Step against the gradient: $1.5 - 0.1 \\times 4 = 1.1$.',
          ),
        ),
      ],
    },
  ],
  'ml-regularization': [
    {
      title: 'Pick a penalty strength',
      setup: {
        text: [
          'A linear model is fit with three ridge penalty strengths $\\alpha$, and its mean squared error is measured on training and validation data. One fitted weight vector is $w = (3, -4)$.',
        ],
        data: `alpha  train_mse  val_mse
0      0.10       2.40
1      0.45       0.90
10     1.80       1.95`,
      },
      parts: [
        part(
          'ml-overfitting-kp1',
          choose(
            'What do the errors show for $\\alpha = 0$?',
            [
              'Overfitting: training error is far below validation error',
              'Underfitting: both errors are high and close together',
              'A good fit: training error is the lowest of the three',
              'Nothing yet: errors cannot be compared across data sets',
            ],
            0,
            'Without a penalty the model fits the training data closely (0.10) but does much worse on new data (2.40).',
          ),
        ),
        part(
          'ml-regularization-kp4',
          typeNumber(
            'Which $\\alpha$ should be chosen?',
            1,
            'Choose by validation error, where $\\alpha = 1$ is lowest at 0.90. At $\\alpha = 10$ both errors are high: underfitting.',
          ),
        ),
        part(
          'ml-regularization-kp2',
          typeNumber(
            'A ridge penalty adds $\\alpha \\|w\\|^2$ to the loss. What is it for $w = (3, -4)$ and $\\alpha = 1$?',
            25,
            '$\\|w\\|^2 = 3^2 + (-4)^2 = 25$, times $\\alpha = 1$.',
          ),
        ),
        part(
          'math-vector-norm-kp3',
          typeNumber(
            'A lasso penalty uses the L1 norm instead. What is $\\|w\\|_1$ for $w = (3, -4)$?',
            7,
            'The L1 norm adds absolute values: $3 + 4 = 7$.',
          ),
        ),
      ],
    },
  ],
  'ml-anomaly-detection': [
    {
      title: 'Flag unusual card payments',
      setup: {
        text: [
          'Payments on an account are roughly normal with mean 50 and standard deviation 10. A detector flags a payment when its z-score is above 3.',
          'Last month it flagged 40 payments, of which 30 were fraud, and it missed 20 other frauds.',
        ],
      },
      parts: [
        part(
          'math-normal-distribution-kp3',
          typeNumber(
            'What is the z-score of a payment of 95?',
            4.5,
            '$(95 - 50) / 10 = 4.5$.',
          ),
        ),
        part(
          'ml-anomaly-detection-kp1',
          typeNumber(
            'Above what payment amount does the detector flag?',
            80,
            'A z-score of 3 is three standard deviations above the mean: $50 + 3 \\times 10 = 80$.',
          ),
        ),
        part(
          'ml-classification-metrics-kp2',
          typeNumber(
            'What is the detector’s precision?',
            0.75,
            'Of 40 flags, 30 were fraud: $30 / 40 = 0.75$.',
          ),
        ),
        part(
          'ml-classification-metrics-kp2',
          typeNumber(
            'What is its recall?',
            0.6,
            'It caught 30 of the $30 + 20 = 50$ frauds: $30 / 50 = 0.6$.',
          ),
        ),
      ],
    },
  ],
  'ml-svm': [
    {
      title: 'Score points against a margin',
      setup: {
        text: [
          'A linear SVM scores a point with $f(x) = w \\cdot x + b$, where $w = (2, -1)$ and $b = -1$. It predicts the positive class when $f(x) > 0$, and training points with $|f(x)| = 1$ lie on the margin.',
        ],
      },
      parts: [
        part(
          'math-vectors-kp3',
          typeNumber(
            'What is $w \\cdot (3, 1)$?',
            5,
            '$2 \\times 3 + (-1) \\times 1 = 5$.',
          ),
        ),
        part(
          'ml-svm-kp1',
          typeNumber(
            'What is $f(x)$ for $x = (1, 2)$?',
            -1,
            '$2 - 2 - 1 = -1$, so the point is predicted negative.',
          ),
        ),
        part(
          'ml-svm-kp2',
          choose(
            'Which training point could be a support vector?',
            ['$(1, 2)$', '$(3, 1)$', '$(4, 0)$', '$(-1, 3)$'],
            0,
            'Support vectors sit on the margin, where $|f(x)| = 1$: $f(1, 2) = -1$. The others score 4, 7, and $-6$, well outside it.',
          ),
        ),
        part(
          'ml-preprocessing-kp1',
          typeNumber(
            'Before fitting, one feature is standardized with training mean 170 and standard deviation 10. What does 185 become?',
            1.5,
            '$(185 - 170) / 10 = 1.5$. Scaling first keeps one feature’s units from dominating the margin.',
          ),
        ),
      ],
    },
  ],
  'ml-attention': [
    {
      title: 'Attend over three tokens',
      setup: {
        text: [
          'A query scores three keys at $(1, 0, 0)$. Softmax turns the scores into weights, and the context is the weighted sum of the values $(10, 0, 0)$, one number per token.',
        ],
      },
      parts: [
        part(
          'ml-attention-kp1',
          typeNumber(
            'What weight does the first token get?',
            0.58,
            '$e^1 / (e^1 + e^0 + e^0) = 2.718 / 4.718 \\approx 0.58$.',
            { tolerance: 0.005, unit: 'to 2 decimals' },
          ),
        ),
        part(
          'ml-attention-kp2',
          typeNumber(
            'What is the context value?',
            5.8,
            'Only the first value is nonzero: $0.576 \\times 10 \\approx 5.8$.',
            { tolerance: 0.05, unit: 'to 1 decimal' },
          ),
        ),
        part(
          'ml-attention-kp3',
          choose(
            'In causal attention, which tokens can the query at position 2 attend to?',
            [
              'Positions 1 and 2',
              'Positions 2 and 3',
              'Only position 2',
              'All three positions',
            ],
            0,
            'A causal mask hides future positions, so position 2 sees itself and everything before it.',
          ),
        ),
        part(
          'ml-sequence-models-kp1',
          typeNumber(
            'Training pairs each window of 3 past values with the next value. How many pairs does a series of 10 values give?',
            7,
            'The first target is the 4th value and the last is the 10th: $10 - 3 = 7$ pairs.',
          ),
        ),
      ],
    },
  ],
  'ml-keras-workflow': [
    {
      title: 'Read a small classifier',
      setup: {
        text: [
          'A Keras model classifies examples with 4 features into one of 3 classes. The labels are stored as class indices 0, 1, and 2.',
        ],
        code: `model = keras.Sequential([
    keras.Input(shape=(4,)),
    layers.Dense(8, activation="relu"),
    layers.Dense(3, activation="softmax"),
])`,
      },
      parts: [
        part(
          'ml-keras-workflow-kp1',
          typeNumber(
            'How many parameters does the first `Dense` layer have?',
            40,
            'Each of 8 units has 4 weights and a bias: $4 \\times 8 + 8 = 40$.',
          ),
        ),
        part(
          'ml-neural-layers-kp4',
          choose(
            'Why does the output layer use 3 units with softmax?',
            [
              'Each example belongs to exactly one of three classes',
              'Each example has three independent yes or no labels',
              'The model predicts three unbounded numbers at once',
              'Softmax keeps the three outputs from summing to 1',
            ],
            0,
            'Softmax turns three scores into probabilities that sum to 1, one per class, which fits a single choice among three.',
          ),
        ),
        part(
          'ml-keras-workflow-kp2',
          choose(
            'Which loss fits labels stored as class indices?',
            [
              '`"sparse_categorical_crossentropy"`',
              '`"categorical_crossentropy"`',
              '`"binary_crossentropy"`',
              '`"mean_squared_error"`',
            ],
            0,
            'The sparse version takes an integer class per example; the plain categorical loss expects one-hot rows.',
          ),
        ),
        part(
          'math-likelihood-kp4',
          typeNumber(
            'For one example, the true class gets probability 0.5. What is its cross-entropy loss, with the natural log?',
            0.693,
            'Cross-entropy is the negative log-likelihood of the true class: $-\\ln 0.5 \\approx 0.693$.',
            { tolerance: 0.0005, unit: 'to 3 decimals' },
          ),
        ),
      ],
    },
  ],
  'ml-deployment-monitoring': [
    {
      title: 'Check a request and watch for drift',
      setup: {
        text: [
          'A deployed model expects three features. The service checks each request first, and it compares recent inputs with the training data.',
        ],
        code: `EXPECTED = {"age", "income", "region"}

def missing_features(request):
    return sorted(EXPECTED - set(request))

request = {"age": 41, "region": "north", "plan": "pro"}`,
      },
      parts: [
        part(
          'sets-kp3',
          typeOutput(
            'After the setup runs, what does this print?',
            'print(set(request) - EXPECTED)',
            "{'plan'}",
            '`set(request)` holds the request’s keys; subtracting the expected features leaves the unexpected one.',
          ),
        ),
        part(
          'ml-deployment-monitoring-kp1',
          typeOutput(
            'After the setup runs, what does this print?',
            'print(missing_features(request))',
            "['income']",
            'The request lacks `income`, so it must be rejected or completed before the model sees it.',
          ),
        ),
        part(
          'math-sampling-kp2',
          typeNumber(
            'Training ages had mean 40 and standard deviation 12. Last week 36 requests averaged 46. How many standard errors above the training mean is that?',
            3,
            'The standard error is $12 / \\sqrt{36} = 2$, and $(46 - 40) / 2 = 3$.',
          ),
        ),
        part(
          'ml-deployment-monitoring-kp3',
          choose(
            'What should the team conclude from that gap?',
            [
              'The ages of incoming requests have likely shifted',
              'The model’s weights have changed since training',
              'Three standard errors is normal week-to-week noise',
              'The validation step rejected the older customers',
            ],
            0,
            'A sample mean three standard errors away is unlikely by chance, so the input distribution has probably moved; check accuracy before trusting predictions.',
          ),
        ),
      ],
    },
  ],
  'ml-convolution': [
    {
      title: 'Slide a filter along a signal',
      setup: {
        text: [
          'A one-dimensional convolution slides the filter $(1, -1)$ along a signal with stride 1 and no padding, taking a dot product at each position.',
        ],
        code: `import numpy as np

x = np.array([1, 3, 2, 0, 4])
f = np.array([1, -1])
out = np.array([x[i:i + 2] @ f for i in range(len(x) - 1)])`,
      },
      parts: [
        part(
          'math-vectors-kp3',
          typeNumber(
            'What is `x[1:3] @ f`?',
            1,
            '`x[1:3]` is `[3, 2]`, and $3 \\times 1 + 2 \\times (-1) = 1$.',
          ),
        ),
        part(
          'ml-convolution-kp1',
          typeOutput(
            'After the setup runs, what does this print?',
            'print(out.tolist())',
            '[-2, 1, 2, -4]',
            'The same filter is applied at each of the four positions, giving the change from each value to the next, negated.',
          ),
        ),
        part(
          'ml-convolution-kp2',
          typeNumber(
            'With stride 2 instead of 1, how many outputs would there be?',
            2,
            'The filter starts at positions 0 and 2; starting at 4 would run past the end: $\\lfloor (5 - 2) / 2 \\rfloor + 1 = 2$.',
          ),
        ),
        part(
          'ml-neural-layers-kp2',
          typeOutput(
            'After the setup runs, what does this print?',
            'print(np.maximum(out, 0).tolist())',
            '[0, 1, 2, 0]',
            'ReLU is applied elementwise: negative outputs become 0 and the rest pass through.',
          ),
        ),
      ],
    },
  ],
};
