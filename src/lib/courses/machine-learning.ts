import type {
  ChoiceQuestion,
  CodeQuestion,
  Course,
  Skill,
  Unit,
  CurriculumCatalog,
} from '../curriculum';
import { withTeachingOrder } from './teaching-order';

type DraftQuestion = Omit<ChoiceQuestion, 'id'> | Omit<CodeQuestion, 'id'>;
const choice = (
  prompt: string,
  choices: string[],
  answer: number,
  explanation: string,
  hint: string,
  code?: string,
): Omit<ChoiceQuestion, 'id'> => ({
  type: 'choice',
  prompt,
  choices,
  answer,
  explanation,
  hint,
  ...(code ? { code } : {}),
});
const exercise = (
  prompt: string,
  starterCode: string,
  solution: string,
  tests: string,
  explanation: string,
  hint: string,
): Omit<CodeQuestion, 'id'> => ({
  type: 'code',
  prompt,
  starterCode,
  solution,
  tests,
  explanation,
  hint,
});

function skill(
  id: string,
  unitId: string,
  title: string,
  summary: string,
  prerequisites: string[],
  paragraphs: string[],
  example: Skill['lesson']['example'],
  questions: DraftQuestion[],
  cards: [string, string][],
): Omit<Skill, 'order'> {
  const hasCode = questions.some((question) => question.type === 'code');
  return {
    id,
    unitId,
    title,
    summary,
    prerequisites,
    courseId: 'machine-learning',
    domain: 'programming',
    estimatedMinutes: 12,
    assessment: {
      requiredTypes: hasCode ? ['choice', 'code'] : ['choice'],
      reviewAnswers: 2,
    },
    lesson: { paragraphs, example },
    questions: questions.map((question, index) => {
      const questionId = `${id}-q${index + 1}`;
      if (question.type === 'code') return { ...question, id: questionId };
      // Keep answer positions varied and stable across repeated reviews.
      const rotation =
        [...questionId].reduce(
          (hash, character) => (hash * 31 + character.charCodeAt(0)) >>> 0,
          0,
        ) % question.choices.length;
      return {
        ...question,
        id: questionId,
        choices: [
          ...question.choices.slice(rotation),
          ...question.choices.slice(0, rotation),
        ],
        answer:
          (question.answer - rotation + question.choices.length) %
          question.choices.length,
      };
    }),
    flashcards: cards.map(([front, back], index) => ({
      id: `${id}-card${index + 1}`,
      skillId: id,
      front,
      back,
    })),
  };
}

export const machineLearningUnits: Unit[] = [
  {
    id: 'ml-project',
    title: 'Frame an ML project',
    description:
      'Choose a target, protect evaluation data, and establish a baseline.',
    courseId: 'machine-learning',
  },
  {
    id: 'ml-models',
    title: 'Fit predictive models',
    description:
      'Learn linear models, optimization, regularization, and probabilities.',
    courseId: 'machine-learning',
  },
  {
    id: 'ml-evaluation',
    title: 'Measure what matters',
    description:
      'Evaluate classifications and select models without leaking information.',
    courseId: 'machine-learning',
  },
  {
    id: 'ml-structure',
    title: 'Discover structure',
    description:
      'Explore margins, trees, ensembles, projections, clusters, and outliers.',
    courseId: 'machine-learning',
  },
  {
    id: 'ml-neural',
    title: 'Train neural networks',
    description:
      'Connect tensor operations, gradients, and training workflows.',
    courseId: 'machine-learning',
  },
  {
    id: 'ml-architectures',
    title: 'Choose deep architectures',
    description:
      'Reason about convolution, sequence models, attention, transfer, generation, and rewards.',
    courseId: 'machine-learning',
  },
  {
    id: 'ml-production',
    title: 'Operate an ML system',
    description:
      'Reproduce predictions, track drift, and monitor deployed behavior.',
    courseId: 'machine-learning',
  },
];

const curriculum = [
  skill(
    'ml-learning-tasks',
    'ml-project',
    'Choose the learning task',
    'Separate inputs, targets, and the type of prediction you need.',
    ['dictionaries', 'return-values'],
    [
      'A supervised dataset contains features available at prediction time and a target you want to predict. Predicting a numeric delivery time is regression. Predicting whether a delivery is late is classification. The same records can support different tasks depending on how you define the target.',
      'Unsupervised learning looks for structure without labeled targets, such as grouping similar deliveries. Reinforcement learning chooses actions to improve accumulated reward through interaction. Before selecting an algorithm, name the decision, the observation unit, and the information that will actually be available when that decision is made.',
    ],
    {
      code: 'record = {"distance_km": 8, "rain": 1, "minutes": 25}\nfeatures = [record["distance_km"], record["rain"]]\ntarget = record["minutes"]\nprint(features)\nprint(target)',
      output: '[8, 1]\n25',
      explanation:
        'Distance and rain are inputs; completed delivery time is the supervised target.',
    },
    [
      choice(
        'Predicting a transaction amount in dollars is what kind of task?',
        [
          'Clustering',
          'Regression',
          'Binary classification',
          'Reinforcement learning',
        ],
        1,
        'An amount is a numeric target, so this is regression.',
        'Ask whether the output is a number or a category.',
      ),
      choice(
        'Which input would leak the answer when predicting delivery time before dispatch?',
        [
          'Distance to destination',
          'Weather forecast',
          'The recorded arrival timestamp',
          'Time of dispatch',
        ],
        2,
        'The arrival timestamp is only known after the delivery and reveals its duration.',
        'Use information available before the decision.',
      ),
      choice(
        'You group unlabeled customer behavior vectors by similarity. Which description fits?',
        [
          'Unsupervised learning',
          'Supervised regression',
          'A labeled test set',
          'Reward maximization',
        ],
        0,
        'Grouping records without known target labels is an unsupervised task.',
        'No correct group label is supplied during training.',
      ),
      exercise(
        'Define delivery_example(record). Return a tuple (features, target), where features is [distance_km, rain] and target is minutes. Do not modify record.',
        'def delivery_example(record):\n    pass\n',
        'def delivery_example(record):\n    return [record["distance_km"], record["rain"]], record["minutes"]',
        'r = {"distance_km": 4, "rain": 0, "minutes": 16}\nassert delivery_example(r) == ([4, 0], 16)\nassert delivery_example({"distance_km": 9, "rain": 1, "minutes": 31}) == ([9, 1], 31)\nassert r == {"distance_km": 4, "rain": 0, "minutes": 16}, "Keep the input unchanged."',
        'The target stays separate from the feature vector so it cannot accidentally become an input.',
        'Read two feature keys and the target key separately.',
      ),
    ],
    [
      [
        'How do regression and classification differ?',
        'Regression predicts numeric values; classification predicts categories.',
      ],
      [
        'What determines whether a feature leaks information?',
        'Whether it reveals the target or includes information unavailable at the actual prediction time.',
      ],
    ],
  ),
  skill(
    'ml-data-splits',
    'ml-project',
    'Protect train and test sets',
    'Match your split to the future predictions you need to make.',
    ['ml-learning-tasks', 'slicing'],
    [
      'Training data fits parameters. Validation data guides choices you make about the model, such as which features to include or how flexible it should be. A final test set estimates performance after those choices are finished. Repeatedly changing a model based on test results turns the test set into another validation set.',
      'The split must reflect deployment. For forecasting, train on earlier observations and evaluate on later ones. If several rows belong to one person, keep that person in a single partition when the goal is generalization to new people. Stratification can preserve class proportions for an ordinary independent classification split; it does not fix time or group leakage.',
    ],
    {
      code: 'days = [1, 2, 3, 4, 5, 6]\ntrain, test = days[:4], days[4:]\nprint(train)\nprint(test)',
      output: '[1, 2, 3, 4]\n[5, 6]',
      explanation:
        'The chronological split trains on the past and reserves later observations.',
    },
    [
      choice(
        'Which data should guide a choice between two candidate feature sets?',
        [
          'The final test set',
          'A separate validation set',
          'A copy of the target column in the features',
          'Only the first training row',
        ],
        1,
        'Model choices belong to validation, leaving the final test set untouched.',
        'Keep one set for the final estimate.',
      ),
      choice(
        'You predict next week from earlier weeks. Which split best matches this goal?',
        [
          'Randomize every timestamp independently',
          'Train on later weeks and test on earlier ones',
          'Train on earlier weeks and test on later weeks',
          'Put every week in both sets',
        ],
        2,
        'A chronological split preserves the direction in which forecasting uses information.',
        'A real forecast cannot look into the future.',
      ),
      choice(
        'Ten rows come from each patient. To estimate performance on new patients, how should you split?',
        [
          'Keep each patient wholly in one partition',
          'Put each patient in both partitions',
          'Use the patient ID as the target',
          'Delete the test set',
        ],
        0,
        'Grouped splitting prevents the same person from appearing in training and evaluation.',
        'Your independent evaluation unit is a patient.',
      ),
      exercise(
        'Define chronological_split(values, n_train), returning a tuple of two new lists: the first n_train items and the remaining items. Assume 0 <= n_train <= len(values).',
        'def chronological_split(values, n_train):\n    pass\n',
        'def chronological_split(values, n_train):\n    return values[:n_train], values[n_train:]',
        'values = [2, 4, 6, 8, 10]\nassert chronological_split(values, 3) == ([2, 4, 6], [8, 10])\nassert chronological_split(values, 0) == ([], values)\nassert chronological_split(values, 5) == (values, [])\na, b = chronological_split(values, 2)\na.append(99)\nassert values == [2, 4, 6, 8, 10]',
        'Slicing preserves chronological order and creates independent lists.',
        'Two slices meet at n_train.',
      ),
    ],
    [
      [
        'What is the purpose of a final test set?',
        'Estimate performance once, after every model choice has been made.',
      ],
      [
        'When should a split keep groups together?',
        'When repeated rows from one entity would otherwise leak its identity into evaluation, especially when predicting for new entities.',
      ],
    ],
  ),
  skill(
    'ml-baselines',
    'ml-project',
    'Build a baseline and loss',
    'Compare a trained model with a simple reference prediction.',
    ['ml-data-splits', 'math-variance'],
    [
      'A baseline is a simple rule evaluated with the same split and metric as the proposed model. A constant regression predictor can use the training target mean. A majority-class classifier always predicts the most common training class. A complicated model that does not beat an appropriate baseline has not earned its complexity.',
      'Mean squared error averages squared differences between predictions and actual targets. It penalizes large errors strongly and uses squared target units. Root mean squared error takes its square root to restore the target units. Choose a metric tied to the real cost of errors, and never use test targets to choose the baseline prediction.',
    ],
    {
      code: 'actual = [2, 4, 6]\npredicted = [4, 4, 4]\nmse = sum((a - p) ** 2 for a, p in zip(actual, predicted)) / len(actual)\nprint(round(mse, 3))',
      output: '2.667',
      explanation: 'The squared errors are 4, 0, and 4; their mean is 8/3.',
    },
    [
      choice(
        'A model has test RMSE 12; a comparable baseline has test RMSE 9. Which has lower error?',
        ['The model', 'The baseline', 'They tie', 'RMSE cannot compare them'],
        1,
        'Both use the same evaluation and units; 9 is a smaller error than 12.',
        'Lower RMSE is better.',
      ),
      choice(
        'If targets are measured in minutes, RMSE is measured in what?',
        ['Minutes squared', 'Percent only', 'Minutes', 'Number of features'],
        2,
        'Taking the square root reverses the squaring of the target units.',
        'MSE and RMSE have different units.',
      ),
      choice(
        'Where should the mean for a constant baseline come from?',
        [
          'The training targets',
          'The combined training and test targets',
          'Only the final test targets',
          'The future predictions',
        ],
        0,
        'The prediction rule must be learned without using held-out targets.',
        'Fit the rule on the same side as a trained model.',
      ),
      exercise(
        'Define mean_squared_error(actual, predicted) for nonempty equal-length numeric lists. Return the average squared prediction error.',
        'def mean_squared_error(actual, predicted):\n    pass\n',
        'def mean_squared_error(actual, predicted):\n    return sum((a - p) ** 2 for a, p in zip(actual, predicted)) / len(actual)',
        'assert mean_squared_error([1, 3], [2, 2]) == 1\nassert mean_squared_error([0, 4], [0, 0]) == 8\nassert mean_squared_error([5], [5]) == 0\nassert abs(mean_squared_error([2, 4, 6], [4, 4, 4]) - 8/3) < 1e-9',
        'Pair corresponding predictions and targets before averaging their squared differences.',
        'Use zip(), square each difference, and divide by the number of targets.',
      ),
    ],
    [
      [
        'Why evaluate a simple baseline?',
        'It establishes whether a more complex model improves predictions under the same split and metric.',
      ],
      [
        'How do MSE and RMSE differ?',
        'MSE averages squared errors; RMSE is its square root and is expressed in the original target units.',
      ],
    ],
  ),
  skill(
    'ml-preprocessing',
    'ml-project',
    'Fit preprocessing without leakage',
    'Learn transformations on training data and reuse them on new rows.',
    ['ml-data-splits', 'math-variance', 'da-categories'],
    [
      'Imputation, scaling, and category encoding turn raw features into usable model inputs. A standard scaler subtracts a training feature mean and divides by its training standard deviation. Learning those statistics from the test set leaks information, even when no target labels are involved.',
      'A scikit-learn Pipeline joins preprocessing to an estimator. Calling fit on the training set fits each transformation and then the predictor. Calling predict on test data applies the already-fitted transformations. When you evaluate on several different train/validation splits, refitting the whole pipeline on each training portion lets every split learn its own statistics.',
    ],
    {
      code: 'from sklearn.preprocessing import StandardScaler\nscaler = StandardScaler().fit([[2.0], [6.0]])\nprint(scaler.transform([[4.0], [8.0]]).ravel().tolist())',
      output: '[0.0, 2.0]',
      explanation:
        'The training mean is 4 and population standard deviation is 2. New rows use those same fitted values.',
    },
    [
      choice(
        'Which sequence protects a held-out test set?',
        [
          'Fit a scaler on all rows, then split',
          'Fit a scaler on training rows, then transform both partitions',
          'Fit a separate scaler to every test row',
          'Train on test targets first',
        ],
        1,
        'Training rows determine the transformation; held-out rows only pass through it.',
        'fit learns; transform applies.',
      ),
      choice(
        'You evaluate on several train/validation splits. Why refit the scaling pipeline on each split?',
        [
          'To erase labels',
          'To guarantee zero validation error',
          'To learn scaling statistics only from that split’s training rows',
          'To use future test statistics',
        ],
        2,
        'Each split’s training rows must own all learned preprocessing statistics.',
        'Each validation part must stay unseen during fitting.',
      ),
      choice(
        'An unseen category arrives during prediction. What is an appropriate preparation?',
        [
          'Choose and validate an explicit unknown-category handling policy',
          'Fit the encoder again on the test set',
          'Copy the answer into the category column',
          'Assume this can never happen',
        ],
        0,
        'Unknown categories need a planned behavior such as an ignored or reserved representation.',
        'Prediction data can contain new values.',
      ),
      exercise(
        'Define standardize(train, values). Use NumPy to learn the population mean and standard deviation from the nonempty 1D train list, then return a NumPy array of standardized values. If train is constant, use scale 1.0.',
        'import numpy as np\n\ndef standardize(train, values):\n    pass\n',
        'import numpy as np\n\ndef standardize(train, values):\n    train = np.asarray(train, dtype=float)\n    scale = train.std()\n    if scale == 0:\n        scale = 1.0\n    return (np.asarray(values, dtype=float) - train.mean()) / scale',
        'import numpy as np\nassert np.allclose(standardize([2, 6], [4, 8]), [0, 2])\nassert np.allclose(standardize([1, 1], [1, 3]), [0, 2])\nassert np.allclose(standardize([0, 2], [-2, 4]), [-3, 3])\nassert standardize([1, 2], []).shape == (0,)',
        'Training statistics remain fixed for every later input, including values far outside the training range.',
        'np.asarray(), mean(), and std() provide the needed statistics.',
      ),
    ],
    [
      [
        'What is the difference between fit and transform?',
        'fit learns transformation parameters from training data; transform applies those learned parameters to data.',
      ],
      [
        'How does a pipeline prevent preprocessing leakage when you evaluate on several splits?',
        'Refitting it on each training portion learns the preprocessing from those rows before it transforms the held-out rows.',
      ],
    ],
  ),
  skill(
    'ml-linear-regression',
    'ml-models',
    'Fit a linear regression',
    'Connect feature coefficients, intercepts, and least-squares predictions.',
    ['ml-baselines', 'math-vectors', 'da-exploration'],
    [
      'A linear model predicts an intercept plus a weighted sum of input features: prediction = b + w1*x1 + ... . The model is linear in its learned coefficients; you can still supply transformed features such as a squared input. Least squares chooses coefficients to minimize the sum of squared training residuals.',
      'scikit-learn LinearRegression expects a two-dimensional feature matrix with one row per observation and one column per feature. fit(X, y) estimates coefficients; predict(new_X) applies them. A coefficient describes a conditional relationship inside the model and is not automatically a causal effect.',
    ],
    {
      code: 'from sklearn.linear_model import LinearRegression\nmodel = LinearRegression(n_jobs=1).fit([[0], [1], [2]], [3, 5, 7])\nprint(round(float(model.predict([[4]])[0]), 2))',
      output: '11.0',
      explanation:
        'The fitted relationship is 3 + 2*x, which predicts 11 for x=4.',
    },
    [
      choice(
        'A model predicts 2 + 3*x. What does it predict at x=4?',
        ['9', '14', '20', '3'],
        1,
        'The intercept 2 is added to 3 times the feature value 4.',
        'Evaluate the weighted sum plus the intercept.',
      ),
      choice(
        'What shape does scikit-learn normally expect for X with 20 rows and 3 features?',
        ['(3, 20)', '(20,)', '(20, 3)', '(1, 60)'],
        2,
        'Rows are observations and columns are input features.',
        'Keep the sample axis first.',
      ),
      choice(
        'Why does a positive fitted coefficient not prove causation?',
        [
          'Confounding and selection can create predictive associations',
          'All positive coefficients are errors',
          'Linear models have no inputs',
          'Prediction is identical to an experiment',
        ],
        0,
        'A fitted relationship can reflect other variables or sampling mechanisms without a causal intervention.',
        'Observational prediction and intervention answer different questions.',
      ),
      exercise(
        'Define fit_line(x, y). For nonempty equal-length numeric sequences, use sklearn.linear_model.LinearRegression to fit one feature and return the fitted model. Its predict method should accept [[new_x]].',
        'from sklearn.linear_model import LinearRegression\nimport numpy as np\n\ndef fit_line(x, y):\n    pass\n',
        'from sklearn.linear_model import LinearRegression\nimport numpy as np\n\ndef fit_line(x, y):\n    X = np.asarray(x, dtype=float).reshape(-1, 1)\n    return LinearRegression(n_jobs=1).fit(X, y)',
        'import numpy as np\nm = fit_line([0, 1, 2], [3, 5, 7])\nassert np.allclose(m.predict([[4], [5]]), [11, 13])\nm2 = fit_line([-1, 0, 1], [8, 5, 2])\nassert np.allclose(m2.predict([[2], [-2]]), [-1, 11])\nassert m.n_features_in_ == 1',
        'The reshape creates an observation-by-feature matrix, and fit learns both slope and intercept.',
        'Reshape the x array to (-1, 1), then call fit.',
      ),
    ],
    [
      [
        'What is a linear regression prediction?',
        'An intercept plus the weighted sum of input features.',
      ],
      [
        'What does ordinary least squares minimize?',
        'The sum of squared differences between training targets and predicted values.',
      ],
    ],
  ),
  skill(
    'ml-gradient-descent',
    'ml-models',
    'Follow a loss gradient',
    'Update parameters in the direction that locally reduces a loss.',
    ['math-gradients', 'ml-baselines'],
    [
      'A gradient tells you how a loss changes when each parameter changes. Gradient descent updates a parameter vector by subtracting learning_rate times the gradient. For the scalar loss L(w) = (w - target)^2, the derivative is 2*(w - target). The subtraction moves toward the target when the step size is suitable.',
      'A very small learning rate can make progress slow; a very large one can overshoot or diverge. Batch gradient descent uses all training examples per update. Stochastic descent uses one; mini-batch descent uses a small group. A loss can have several valleys, so a zero gradient does not by itself prove that you found the best possible solution.',
    ],
    {
      code: 'w, target, rate = 0.0, 5.0, 0.1\ngradient = 2 * (w - target)\nw = w - rate * gradient\nprint(w)',
      output: '1.0',
      explanation:
        'The gradient is -10. Subtracting 0.1*(-10) moves w from 0 toward 5.',
    },
    [
      choice(
        'Which update is gradient descent?',
        [
          'w = w + rate * gradient',
          'w = w - rate * gradient',
          'w = gradient / 0',
          'w = target + test_loss',
        ],
        1,
        'The negative gradient points in the direction of local loss decrease.',
        'Move opposite to the gradient.',
      ),
      choice(
        'Training loss oscillates wildly after increasing the learning rate. What should you investigate first?',
        [
          'Whether the step size is too large',
          'Whether validation rows have names',
          'Whether every feature is text',
          'Whether the test set is too honest',
        ],
        0,
        'Large updates can overshoot useful parameter values and destabilize optimization.',
        'Large jumps can cross the valley.',
      ),
      choice(
        'Which update uses a small group of training examples?',
        [
          'Full-batch only',
          'Test-set fitting',
          'Mini-batch gradient descent',
          'Final evaluation',
        ],
        2,
        'A mini-batch is a subset used to estimate the gradient for one update.',
        'The name describes the size of data per update.',
      ),
      exercise(
        'Define quadratic_steps(w, target, rate, steps). Apply exactly steps gradient-descent updates for loss (w-target)**2 and return the final w.',
        'def quadratic_steps(w, target, rate, steps):\n    pass\n',
        'def quadratic_steps(w, target, rate, steps):\n    for _ in range(steps):\n        w -= rate * 2 * (w - target)\n    return w',
        'assert abs(quadratic_steps(0, 5, 0.1, 1) - 1) < 1e-9\nassert abs(quadratic_steps(0, 5, 0.1, 2) - 1.8) < 1e-9\nassert quadratic_steps(3, 5, 0.1, 0) == 3\nassert abs(quadratic_steps(10, 2, 0.25, 2) - 4) < 1e-9',
        'Each new gradient is computed at the current w, not just once at its starting value.',
        'Recompute 2*(w-target) inside the loop.',
      ),
    ],
    [
      [
        'What is the gradient-descent update?',
        'parameters = parameters - learning_rate * gradient_of_loss.',
      ],
      [
        'Does a zero gradient always certify the global minimum?',
        'No. When a loss has several valleys or flat regions, it can occur at a local minimum, a maximum, or a saddle point.',
      ],
    ],
  ),
  skill(
    'ml-regularization',
    'ml-models',
    'Control model complexity',
    'Recognize overfitting and penalize unnecessary coefficient size.',
    ['ml-linear-regression', 'ml-gradient-descent'],
    [
      'Overfitting appears when a model fits training details that do not generalize: training error is low while validation error remains high. Underfitting appears when the model or optimization fails to capture useful patterns in both sets. Learning curves compare training and validation behavior as data quantity or training time changes.',
      'Ridge adds an L2 penalty proportional to the sum of squared coefficients; lasso adds an L1 penalty proportional to the sum of absolute coefficients. A larger penalty usually constrains coefficients more strongly. Choose its strength on validation data. Early stopping is another form of control: keep the model from the best validation checkpoint instead of blindly keeping the last training step.',
    ],
    {
      code: 'weights = [2.0, -1.0]\ndata_loss, alpha = 3.0, 0.5\npenalty = alpha * sum(w * w for w in weights)\nprint(data_loss + penalty)',
      output: '5.5',
      explanation:
        'The L2 contribution is 0.5*(4+1)=2.5, added to data loss 3.',
    },
    [
      choice(
        'Training error is near zero but validation error is high. What is the clearest concern?',
        [
          'Overfitting',
          'A proven causal relationship',
          'Perfect generalization',
          'Too much final-test isolation',
        ],
        0,
        'The model is exploiting training details that do not carry over to validation.',
        'Compare fitted-data performance with unseen-data performance.',
      ),
      choice(
        'Which expression is an L2 penalty on coefficients?',
        [
          'sum(abs(w) for w in weights)',
          'sum(w*w for w in weights)',
          'len(test_targets)',
          'max(labels)',
        ],
        1,
        'L2 regularization uses squared coefficient magnitudes.',
        'Ridge uses squares.',
      ),
      choice(
        'Which checkpoint should early stopping retain?',
        [
          'The final checkpoint regardless of validation loss',
          'The first checkpoint always',
          'The checkpoint with the best chosen validation metric',
          'The one with the most test-set tuning',
        ],
        2,
        'Validation performance identifies the checkpoint that best balances learning and generalization.',
        'Stopping and checkpoint selection need a held-out guide.',
      ),
      exercise(
        'Define ridge_objective(data_loss, weights, alpha). Return data_loss + alpha times the sum of squared weights. Do not penalize any separate intercept; only the supplied weights.',
        'def ridge_objective(data_loss, weights, alpha):\n    pass\n',
        'def ridge_objective(data_loss, weights, alpha):\n    return data_loss + alpha * sum(w*w for w in weights)',
        'assert ridge_objective(3, [2, -1], 0.5) == 5.5\nassert ridge_objective(7, [], 2) == 7\nassert ridge_objective(4, [9, -8], 0) == 4\nassert ridge_objective(1, [-3], 2) == 19',
        'The objective combines prediction error with a coefficient-size penalty.',
        'Square each coefficient, sum, multiply by alpha, and add the data loss.',
      ),
    ],
    [
      [
        'What pattern suggests overfitting?',
        'Low training error accompanied by substantially worse validation performance.',
      ],
      [
        'How do ridge and lasso penalties differ?',
        'Ridge uses squared coefficient magnitudes (L2); lasso uses absolute coefficient magnitudes (L1).',
      ],
    ],
  ),
  skill(
    'ml-logistic-regression',
    'ml-models',
    'Turn scores into probabilities',
    'Use logistic scores and thresholds for binary classification.',
    ['ml-linear-regression', 'math-probability'],
    [
      'Binary logistic regression forms a linear score and applies the sigmoid: probability = 1 / (1 + exp(-score)). A score of zero maps to probability 0.5. Positive scores map above 0.5 and negative scores below it. Despite its name, logistic regression is commonly used for classification.',
      'A probability estimate and a class decision are separate outputs. A threshold converts probabilities into labels, for example positive when p >= 0.7. Raising the threshold reduces the set of predicted positives; lowering it expands that set. Select a threshold using validation data and error costs. A probability-shaped output also needs calibration checks before being trusted as a frequency estimate.',
    ],
    {
      code: 'import math\nprobabilities = [1 / (1 + math.exp(-s)) for s in [-2, 0, 2]]\nprint([round(p, 3) for p in probabilities])\nprint([int(p >= 0.7) for p in probabilities])',
      output: '[0.119, 0.5, 0.881]\n[0, 0, 1]',
      explanation:
        'The sigmoid converts scores to values between 0 and 1, then a chosen threshold makes labels.',
    },
    [
      choice(
        'What probability does the sigmoid assign to score 0?',
        ['0', '0.5', '1', 'Any negative value'],
        1,
        'exp(0)=1, so the denominator is 2.',
        'Substitute zero into 1/(1+exp(-score)).',
      ),
      choice(
        'For fixed probability predictions, what happens to the positive set when the threshold rises?',
        [
          'It can only stay the same or shrink',
          'It must become all observations',
          'It can only expand',
          'All probabilities are retrained',
        ],
        0,
        'Fewer values satisfy a stricter lower bound; changing the threshold does not retrain probabilities.',
        'The condition p >= threshold becomes harder to satisfy.',
      ),
      choice(
        'What is a threshold used for?',
        [
          'Standardizing features',
          'Selecting a training split',
          'Turning a score or probability into a class decision',
          'Removing all false negatives automatically',
        ],
        2,
        'A threshold defines the decision rule after the model produces a score.',
        'Distinguish a probability from a label.',
      ),
      exercise(
        'Define classify_probabilities(probabilities, threshold). Return a list of 1 for p >= threshold and 0 otherwise. Include values exactly equal to the threshold in the positive class.',
        'def classify_probabilities(probabilities, threshold):\n    pass\n',
        'def classify_probabilities(probabilities, threshold):\n    return [int(p >= threshold) for p in probabilities]',
        'assert classify_probabilities([0.2, 0.5, 0.8], 0.5) == [0, 1, 1]\nassert classify_probabilities([0.2, 0.5, 0.8], 0.7) == [0, 0, 1]\nassert classify_probabilities([], 0.5) == []\nassert classify_probabilities([0, 1], 1) == [0, 1]',
        'The same probabilities can support different policies by changing the decision threshold.',
        'A comprehension can convert each comparison with int().',
      ),
    ],
    [
      [
        'What does the sigmoid do in binary logistic regression?',
        'It maps a linear score to a value between 0 and 1: 1/(1+exp(-score)).',
      ],
      [
        'Why choose a classification threshold separately?',
        'A class decision depends on error costs and operating requirements, not only on a model probability.',
      ],
    ],
  ),
  skill(
    'ml-classification-metrics',
    'ml-evaluation',
    'Read classification errors',
    'Distinguish precision, recall, and accuracy when classes are uneven.',
    ['ml-logistic-regression'],
    [
      'For a chosen positive class, a true positive is correctly predicted positive. A false positive is predicted positive but actually negative. A false negative is actually positive but missed. Precision = TP/(TP+FP) asks how many positive predictions were correct. Recall = TP/(TP+FN) asks how many actual positives were found.',
      'Accuracy counts correct predictions across both classes. It can hide failure on a rare class: always predicting negative yields 99% accuracy when only 1% are positive. Report metrics that reflect the decision costs, inspect a confusion matrix (the table of TP, FP, FN, and TN counts), and consider multiple thresholds. The F1 score is the harmonic mean of precision and recall; it does not encode every possible business cost.',
    ],
    {
      code: 'tp, fp, fn = 6, 2, 4\nprint(round(tp / (tp + fp), 2))\nprint(round(tp / (tp + fn), 2))',
      output: '0.75\n0.6',
      explanation:
        'Six of eight positive predictions were correct; six of ten actual positives were found.',
    },
    [
      choice(
        'A classifier has TP=8 and FP=2. What is precision?',
        ['0.2', '0.8', '1.0', 'It depends on TN'],
        1,
        'Precision is 8/(8+2)=0.8.',
        'Use all predicted positives in the denominator.',
      ),
      choice(
        'What does a false negative mean for the positive class?',
        [
          'A negative row correctly rejected',
          'A positive prediction on a negative row',
          'An actual positive that was predicted negative',
          'Any probability below 1',
        ],
        2,
        'The model failed to identify an actual positive.',
        'The actual label is positive; the prediction missed it.',
      ),
      choice(
        'A rare class occurs in 1% of rows. An always-negative model has 99% accuracy and what positive-class recall?',
        ['0%', '50%', '99%', '100%'],
        0,
        'It finds none of the actual positives, so TP=0 and recall=0.',
        'No positive row receives a positive prediction.',
      ),
      exercise(
        'Define precision_recall(tp, fp, fn). Return (precision, recall). Use 0.0 for a metric whose denominator is zero.',
        'def precision_recall(tp, fp, fn):\n    pass\n',
        'def precision_recall(tp, fp, fn):\n    precision = tp / (tp + fp) if tp + fp else 0.0\n    recall = tp / (tp + fn) if tp + fn else 0.0\n    return precision, recall',
        'assert precision_recall(6, 2, 4) == (0.75, 0.6)\nassert precision_recall(0, 0, 3) == (0.0, 0.0)\nassert precision_recall(0, 4, 0) == (0.0, 0.0)\nassert precision_recall(3, 0, 0) == (1.0, 1.0)',
        'Each metric uses a different population in its denominator, with an explicit empty-population convention.',
        'Guard tp+fp and tp+fn separately.',
      ),
    ],
    [
      [
        'How are precision and recall calculated?',
        'Precision = TP/(TP+FP); recall = TP/(TP+FN).',
      ],
      [
        'Why can accuracy mislead with rare positives?',
        'A model can predict the majority negative class every time and achieve high accuracy while finding none of the positives.',
      ],
    ],
  ),
  skill(
    'ml-cross-validation',
    'ml-evaluation',
    'Evaluate across validation folds',
    'Rotate held-out data while preserving the independence of each evaluation.',
    ['ml-preprocessing', 'ml-linear-regression'],
    [
      'K-fold cross-validation partitions training data into k folds. In each round, a fresh model fits k-1 folds and is evaluated on the remaining fold. The collection of scores reveals variability that one arbitrary split can hide. The final test set stays outside the entire cross-validation process.',
      'Use a splitter suited to the data: stratified folds for ordinary independent classification, group folds for repeated entities, and time-aware folds for forecasting. Fit learned preprocessing inside each fold using a pipeline. scikit-learn scorers maximize scores, so neg_mean_squared_error returns the negative of MSE; negate it before interpreting it as an error.',
    ],
    {
      code: 'from sklearn.linear_model import LinearRegression\nfrom sklearn.model_selection import cross_val_score\nX = [[0], [1], [2], [3], [4], [5]]\ny = [1, 3, 5, 7, 9, 11]\nscores = cross_val_score(LinearRegression(n_jobs=1), X, y, cv=3, scoring="neg_mean_squared_error", n_jobs=1)\nprint(round(abs(float(scores.mean())), 6))',
      output: '0.0',
      explanation:
        'Three held-out folds recover the exact linear relationship, giving effectively zero mean validation MSE.',
    },
    [
      choice(
        'In one round of 5-fold cross-validation, what data fits the model?',
        [
          'All five folds',
          'Four folds',
          'Only the held-out fold',
          'The final test set',
        ],
        1,
        'One fold is validation and the other four supply training examples.',
        'Leave one fold out.',
      ),
      choice(
        'Why keep the test set outside cross-validation?',
        [
          'To make the model bigger',
          'To repeat the same random seed',
          'To retain a final estimate after selecting a model',
          'To remove all uncertainty',
        ],
        2,
        'Cross-validation guides model selection, while the test set estimates the selected system afterward.',
        'Model selection already consumes validation information.',
      ),
      choice(
        'A neg_mean_squared_error score is -9. What is the MSE?',
        ['9', '-9', '3', '81'],
        0,
        'The scikit-learn score convention negates a loss to make larger scores better.',
        'Undo the minus sign; do not take a square root unless you want RMSE.',
      ),
      exercise(
        'Define mean_validation_mse(negative_scores). Given a nonempty list of neg_mean_squared_error fold scores, return the average MSE.',
        'def mean_validation_mse(negative_scores):\n    pass\n',
        'def mean_validation_mse(negative_scores):\n    return -sum(negative_scores) / len(negative_scores)',
        'assert mean_validation_mse([-4, -9, -2]) == 5\nassert mean_validation_mse([0, 0]) == 0\nassert mean_validation_mse([-7]) == 7\nassert mean_validation_mse([-1.5, -2.5]) == 2',
        'Negating the average recovers the mean validation error.',
        'The scores are negative losses, not raw errors.',
      ),
    ],
    [
      [
        'What happens in each k-fold cross-validation round?',
        'A fresh model trains on k-1 folds and is evaluated on the remaining fold.',
      ],
      [
        'What does scikit-learn neg_mean_squared_error report?',
        'The negative of MSE, so larger scorer values are better; negate it to report the error.',
      ],
    ],
  ),
  skill(
    'ml-hyperparameter-search',
    'ml-evaluation',
    'Select hyperparameters fairly',
    'Separate learned parameters from choices about the learning algorithm.',
    ['ml-cross-validation', 'ml-decision-trees'],
    [
      'Parameters such as regression weights are learned during fitting. Hyperparameters such as penalty strength, tree depth, or learning rate configure the fitting process. Grid search evaluates a predefined combination set; randomized search samples configurations from chosen distributions or lists.',
      'Compare configurations using the same appropriate validation strategy and metric. Searching more settings gives more opportunities to overfit validation results; the best observed score is not a guarantee of future performance. After selection, refit the chosen configuration on the available training data and evaluate once on the untouched test set. Nested cross-validation adds an outer evaluation loop when estimating the full selection procedure.',
    ],
    {
      code: 'results = [{"depth": 2, "mse": 5.1}, {"depth": 4, "mse": 3.7}, {"depth": 8, "mse": 4.2}]\nbest = min(results, key=lambda row: row["mse"])\nprint(best["depth"])',
      output: '4',
      explanation:
        'The selected configuration has the smallest validation loss, not the largest depth.',
    },
    [
      choice(
        'Which is usually a hyperparameter?',
        [
          'A fitted linear regression coefficient',
          'The maximum depth supplied to a decision tree',
          'A training label',
          'A predicted value',
        ],
        1,
        'Maximum depth is chosen before fitting rather than learned as a coefficient from data.',
        'It configures the algorithm.',
      ),
      choice(
        'What is the main purpose of nested cross-validation?',
        [
          'Train on the final test labels',
          'Skip model selection',
          'Evaluate a model-selection process in outer held-out folds',
          'Guarantee every configuration wins',
        ],
        2,
        'Inner folds select settings; outer held-out folds evaluate that selection procedure.',
        'Selection and evaluation need separate loops.',
      ),
      choice(
        'After choosing a configuration using validation, what is a sound final step?',
        [
          'Refit on training data and assess once on untouched test data',
          'Keep tuning on test data until the score looks good',
          'Delete the baseline comparison',
          'Fit only the last validation row',
        ],
        0,
        'The final test set measures the selected system after the choices are complete.',
        'Finish choices before looking at the final estimate.',
      ),
      exercise(
        'Define best_config(results). Each nonempty list entry is a dictionary with name and validation_loss. Return the name with the smallest loss; when losses tie, keep the first entry.',
        'def best_config(results):\n    pass\n',
        'def best_config(results):\n    return min(results, key=lambda row: row["validation_loss"])["name"]',
        'assert best_config([{"name": "a", "validation_loss": 3}, {"name": "b", "validation_loss": 1}]) == "b"\nassert best_config([{"name": "first", "validation_loss": 2}, {"name": "second", "validation_loss": 2}]) == "first"\nassert best_config([{"name": "only", "validation_loss": 9}]) == "only"',
        'The metric defines the ranking, and stable tie behavior makes selection reproducible.',
        'Python min preserves the first minimum when its key ties.',
      ),
    ],
    [
      [
        'How do parameters differ from hyperparameters?',
        'Parameters are estimated during fit; hyperparameters configure how fitting or the model behaves.',
      ],
      [
        'Why can a large search overfit validation results?',
        'Selection exploits chance variation among many tried configurations, making the winning validation score optimistic.',
      ],
    ],
  ),
  skill(
    'ml-svm',
    'ml-structure',
    'Separate classes with a margin',
    'Reason about support vectors, feature scales, and nonlinear kernels.',
    ['ml-logistic-regression', 'ml-regularization', 'ml-preprocessing'],
    [
      'A linear support vector classifier seeks a separating boundary with a wide margin while allowing violations controlled by regularization. The examples nearest the boundary or violating the margin constrain the solution; these are support vectors. Feature scaling matters because distances and margins depend on numeric units.',
      'The C hyperparameter controls the trade-off: larger C penalizes violations more strongly, usually allowing less regularization. A kernel such as the radial basis function permits nonlinear boundaries through similarity calculations. For an RBF model, gamma controls how locally each observation influences the boundary. Tune these choices with validation; an SVM decision score is not automatically a calibrated probability.',
    ],
    {
      code: 'from sklearn.pipeline import make_pipeline\nfrom sklearn.preprocessing import StandardScaler\nfrom sklearn.svm import SVC\nmodel = make_pipeline(StandardScaler(), SVC(kernel="linear", C=1.0))\nmodel.fit([[-2], [-1], [1], [2]], [0, 0, 1, 1])\nprint(model.predict([[-3], [3]]).tolist())',
      output: '[0, 1]',
      explanation:
        'A scaled linear boundary separates the two groups and predicts opposite classes at the two test points.',
    },
    [
      choice(
        'Which observations most directly constrain an SVM margin?',
        [
          'Only randomly deleted rows',
          'Support vectors near or inside the margin',
          'Only the farthest correctly classified rows',
          'Every future test label',
        ],
        1,
        'The supporting observations constrain where the decision boundary and margin can lie.',
        'The algorithm is named for these influential vectors.',
      ),
      choice(
        'What does increasing C generally do?',
        [
          'Increase tolerance of margin violations',
          'Delete every support vector',
          'Penalize margin violations more strongly',
          'Calibrate probabilities automatically',
        ],
        2,
        'A larger C increases the relative cost of violations and weakens regularization.',
        'C weights the violation penalty.',
      ),
      choice(
        'Why should you scale features before a typical SVM?',
        [
          'Different numeric units distort distances and margins',
          'Scaling reveals all test labels',
          'SVMs require every number to be an integer',
          'Scaling guarantees linear separability',
        ],
        0,
        'The geometry should not be dominated just by a feature with a larger numeric unit.',
        'A kilometer-scale feature and a millimeter-scale feature have different raw magnitudes.',
      ),
      exercise(
        'Define fit_margin_classifier(X, y). Return a fitted pipeline containing StandardScaler followed by SVC(kernel="linear", C=1.0). Use make_pipeline.',
        'from sklearn.pipeline import make_pipeline\nfrom sklearn.preprocessing import StandardScaler\nfrom sklearn.svm import SVC\n\ndef fit_margin_classifier(X, y):\n    pass\n',
        'from sklearn.pipeline import make_pipeline\nfrom sklearn.preprocessing import StandardScaler\nfrom sklearn.svm import SVC\n\ndef fit_margin_classifier(X, y):\n    return make_pipeline(StandardScaler(), SVC(kernel="linear", C=1.0)).fit(X, y)',
        'model = fit_margin_classifier([[-2], [-1], [1], [2]], [0, 0, 1, 1])\nassert model.predict([[-3], [3]]).tolist() == [0, 1]\nassert isinstance(model.steps[0][1], StandardScaler)\nassert isinstance(model.steps[-1][1], SVC)\nassert model.steps[-1][1].kernel == "linear"\nassert model.steps[-1][1].C == 1.0\nsecond = fit_margin_classifier([[0], [1], [10], [11]], [0, 0, 1, 1])\nassert second.predict([[-1], [12]]).tolist() == [0, 1]',
        'The fitted pipeline owns both its scaling statistics and the classifier, so predictions use consistent preprocessing.',
        'Construct both stages, then fit the pipeline as one estimator.',
      ),
    ],
    [
      [
        'What does C control in a support vector classifier?',
        'The strength of the penalty for margin violations; larger C generally means less regularization.',
      ],
      [
        'What does an RBF kernel enable?',
        'A nonlinear boundary through distance-based similarity, with gamma controlling how local the influence is.',
      ],
    ],
  ),
  skill(
    'ml-decision-trees',
    'ml-structure',
    'Split data with a decision tree',
    'Connect threshold rules, impurity, and tree depth.',
    ['ml-regularization', 'ml-preprocessing', 'dictionary-loops'],
    [
      'A decision tree repeatedly asks feature-threshold questions and routes a row down one branch until it reaches a leaf. A classification leaf predicts a class or class proportions; a regression leaf predicts a numeric summary. Training chooses splits that improve a criterion such as Gini impurity or squared error.',
      'For class proportions p1, p2, ..., Gini impurity is 1 - sum(pi^2). A pure node has impurity zero. Deep trees can memorize small training details, so validate constraints such as max_depth and min_samples_leaf. Trees usually do not need feature standardization because a consistent monotonic rescaling preserves possible threshold splits.',
    ],
    {
      code: 'from sklearn.tree import DecisionTreeClassifier\nmodel = DecisionTreeClassifier(max_depth=1, random_state=0).fit([[1], [2], [8], [9]], [0, 0, 1, 1])\nprint(model.predict([[0], [10]]).tolist())',
      output: '[0, 1]',
      explanation:
        'A single learned threshold separates the low-valued rows from the high-valued rows.',
    },
    [
      choice(
        'What is the Gini impurity of a node containing only one class?',
        ['1', '0', '0.5', 'The tree depth'],
        1,
        'Its only nonzero class proportion is 1, so 1-1^2=0.',
        'A pure node has no class mixture.',
      ),
      choice(
        'Which setting can constrain a tree to reduce overfitting?',
        [
          'Copying the target into X',
          'Fitting on the final test set',
          'Limiting max_depth',
          'Increasing leaves without validation',
        ],
        2,
        'Maximum depth limits how many successive splits the tree can use.',
        'Control the complexity of its branches.',
      ),
      choice(
        'Why is standard scaling usually unnecessary for a decision tree?',
        [
          'Monotonic rescaling preserves the feature ordering and threshold partitions',
          'Trees never read numeric features',
          'Scaling always destroys labels',
          'Every tree has exactly one feature',
        ],
        0,
        'A tree chooses cut points in a sorted feature order rather than comparing Euclidean distances.',
        'Multiplying a feature by a positive constant does not change its sorted order.',
      ),
      exercise(
        'Define gini(labels) for a nonempty list of hashable class labels. Return 1 minus the sum of squared class proportions.',
        'def gini(labels):\n    pass\n',
        'def gini(labels):\n    counts = {}\n    for label in labels:\n        counts[label] = counts.get(label, 0) + 1\n    return 1 - sum((count / len(labels)) ** 2 for count in counts.values())',
        'assert gini([1, 1, 1]) == 0\nassert gini([0, 0, 1, 1]) == 0.5\nassert abs(gini(["a", "b", "c"]) - 2/3) < 1e-9\nassert abs(gini([0, 0, 0, 1]) - 0.375) < 1e-9',
        'Count each class, convert counts to proportions, then measure the mixture.',
        'A frequency dictionary gives the class counts.',
      ),
    ],
    [
      [
        'How does a decision tree predict?',
        'It follows learned feature-threshold branches to a leaf that supplies a class or numeric prediction.',
      ],
      [
        'What is Gini impurity?',
        '1 minus the sum of squared class proportions; it is zero for a pure node.',
      ],
    ],
  ),
  skill(
    'ml-ensembles',
    'ml-structure',
    'Combine multiple predictors',
    'Distinguish voting, bagging, random forests, and boosting.',
    ['ml-decision-trees'],
    [
      'An ensemble combines several predictors. Classification can use majority voting; regression can average predictions. Combining diverse models can reduce variance when their errors are not identical. Bagging trains models on resampled training sets, often independently and in parallel.',
      'A random forest bags decision trees and also samples candidate features at splits, promoting diversity. Boosting instead adds models sequentially to improve remaining errors or gradients of a loss. More models do not automatically eliminate bias, leakage, or poor data. Validate the ensemble against baselines and monitor its compute cost as well as its predictive metric.',
    ],
    {
      code: 'predictions = [[2, 8], [4, 10], [3, 9]]\ncombined = [sum(column) / len(column) for column in zip(*predictions)]\nprint(combined)',
      output: '[3.0, 9.0]',
      explanation:
        'The ensemble averages the three model predictions separately for each observation.',
    },
    [
      choice(
        'What is a defining feature of bagging?',
        [
          'Every new model corrects the previous model sequentially',
          'Models train on resampled training sets',
          'It uses test labels as features',
          'It always has one predictor',
        ],
        1,
        'Bootstrap aggregation creates diversity by training on sampled versions of the training data.',
        'Bagging is bootstrap aggregation.',
      ),
      choice(
        'How does boosting differ from ordinary bagging?',
        [
          'It cannot use trees',
          'It ignores all previous predictions',
          'It adds learners sequentially to improve remaining errors',
          'It guarantees perfect test accuracy',
        ],
        2,
        'Boosting updates the ensemble through a sequence of error-focused or loss-gradient-focused learners.',
        'Think about the dependency between successive learners.',
      ),
      choice(
        'Which models give an ensemble the most useful error diversity?',
        [
          'Models whose errors are less correlated',
          'Identical copies producing identical predictions',
          'Models fitted on leaked test labels',
          'Models selected only for their file names',
        ],
        0,
        "Averaging helps most when one model can offset another model's errors.",
        'Identical mistakes survive averaging.',
      ),
      exercise(
        'Define ensemble_mean(predictions). The input is a nonempty list of equal-length numeric prediction lists. Return the mean prediction for each observation as a list.',
        'def ensemble_mean(predictions):\n    pass\n',
        'def ensemble_mean(predictions):\n    return [sum(column) / len(column) for column in zip(*predictions)]',
        'assert ensemble_mean([[2, 8], [4, 10], [3, 9]]) == [3, 9]\nassert ensemble_mean([[5, 1]]) == [5, 1]\nassert ensemble_mean([[], []]) == []\nassert ensemble_mean([[0, 10, -4], [2, 2, 4]]) == [1, 6, 0]',
        'Transpose the model-by-observation predictions and average each observation column.',
        'zip(*predictions) groups predictions for the same observation.',
      ),
    ],
    [
      [
        'How does a random forest create tree diversity?',
        'It combines resampled training sets with random candidate-feature subsets at tree splits.',
      ],
      [
        'What distinguishes boosting from bagging?',
        'Boosting adds dependent learners sequentially to improve remaining errors; bagging can fit resampled learners independently.',
      ],
    ],
  ),
  skill(
    'ml-pca',
    'ml-structure',
    'Project data with PCA',
    'Reduce numeric dimensions while tracking retained variation.',
    ['ml-preprocessing', 'math-vectors'],
    [
      'Principal component analysis finds orthogonal directions (perpendicular, with a dot product of zero) of large variance in centered numeric data. Keeping the first few components projects observations into a smaller feature space. It is unsupervised: the directions are selected without knowing which target you hope to predict.',
      "High retained variance does not guarantee high predictive usefulness; a low-variance direction can still matter for a target. Scaling changes the variance geometry, so decide whether raw units or standardized features match your task. Fit PCA on training data, often inside a pipeline. The explained_variance_ratio_ values report each component's share of the total fitted variance.",
    ],
    {
      code: 'from sklearn.decomposition import PCA\nX = [[1, 1], [2, 2], [3, 3]]\nmodel = PCA(n_components=1).fit(X)\nprint(model.transform(X).shape)\nprint(round(float(model.explained_variance_ratio_[0]), 6))',
      output: '(3, 1)\n1.0',
      explanation:
        'These points lie on one line, so one component preserves all of their nonzero variation.',
    },
    [
      choice(
        'What does ordinary PCA use to choose its directions?',
        [
          'Test targets',
          'Variance in numeric features',
          'The class confusion matrix',
          'A reward sequence',
        ],
        1,
        'PCA chooses directions according to feature variation without using supervised labels.',
        'It is an unsupervised transformation.',
      ),
      choice(
        'PCA preserves 99% of feature variance. What can you conclude?',
        [
          'Every classifier will have 99% accuracy',
          'The target has no noise',
          'Most fitted feature variance is retained, but target usefulness still needs evaluation',
          'There is no leakage risk',
        ],
        2,
        'Explained variance concerns the inputs, not a supervised prediction metric.',
        'Variance retention and prediction quality are different quantities.',
      ),
      choice(
        'Where should PCA fit when evaluating a held-out partition?',
        [
          'Only on the training partition',
          'On the final test partition first',
          'On every partition combined',
          'On the model predictions instead of inputs',
        ],
        0,
        'PCA learns a transformation, so its fitted statistics must exclude held-out observations.',
        'Treat PCA like any learned preprocessing stage.',
      ),
      exercise(
        'Define one_component(X). Fit sklearn.decomposition.PCA(n_components=1) on the provided numeric feature matrix and return (projected, model), where projected is model.fit_transform(X).',
        'from sklearn.decomposition import PCA\n\ndef one_component(X):\n    pass\n',
        'from sklearn.decomposition import PCA\n\ndef one_component(X):\n    model = PCA(n_components=1)\n    return model.fit_transform(X), model',
        'import numpy as np\nprojected, model = one_component([[1, 1], [2, 2], [3, 3]])\nassert projected.shape == (3, 1)\nassert np.isclose(model.explained_variance_ratio_.sum(), 1)\nassert np.allclose(model.inverse_transform(projected), [[1, 1], [2, 2], [3, 3]])\np2, m2 = one_component([[0, 0, 0], [1, 2, 3], [2, 4, 6], [3, 6, 9]])\nassert p2.shape == (4, 1)\nassert m2.n_features_in_ == 3',
        'The projection has one column regardless of how many numeric columns the original data had.',
        'Create the PCA estimator once, then return its transformed data and fitted instance.',
      ),
    ],
    [
      [
        'What directions does PCA seek?',
        'Orthogonal directions of large variance in centered numeric feature data.',
      ],
      [
        'Does preserving feature variance guarantee preserving predictive signal?',
        'No. PCA ignores target labels, and a low-variance direction can be predictive.',
      ],
    ],
  ),
  skill(
    'ml-clustering',
    'ml-structure',
    'Group similar observations',
    'Understand centroids, cluster assignments, and geometric assumptions.',
    ['ml-preprocessing', 'math-vectors'],
    [
      'K-means alternates between assigning each observation to its nearest centroid and updating each centroid to the mean of its assigned observations. Its objective is the sum of squared within-cluster distances. The number of clusters k is supplied before fitting, and different initializations can lead to different local solutions.',
      'Cluster numbers are arbitrary identifiers, not known class names. Feature scaling changes distances, and k-means works best for roughly compact groups under its chosen geometry. A silhouette score compares within-cluster closeness with separation from other clusters, but it does not prove that the groups are useful for a real decision. Density-based methods can handle different shapes and mark some observations as noise.',
    ],
    {
      code: 'point = [4, 3]\ncenters = [[0, 0], [5, 3]]\ndistances = [sum((a-b)**2 for a, b in zip(point, c)) for c in centers]\nprint(distances)\nprint(min(range(len(centers)), key=lambda i: distances[i]))',
      output: '[25, 1]\n1',
      explanation:
        'Squared Euclidean distance assigns this point to the second centroid.',
    },
    [
      choice(
        'What does k-means minimize?',
        [
          'The number of class labels',
          'Squared distances from points to their assigned centroids',
          'Final test-set precision',
          'The number of input columns only',
        ],
        1,
        'The objective measures within-cluster squared Euclidean distances.',
        'Each cluster has a center.',
      ),
      choice(
        'K-means labels a group 0. What does 0 mean?',
        [
          'The negative supervised class',
          'The worst possible cluster',
          'An arbitrary cluster identifier',
          'A probability of zero',
        ],
        2,
        'Cluster IDs can be permuted without changing the grouping.',
        'The numbering has no inherent semantic meaning.',
      ),
      choice(
        'Why run multiple initializations?',
        [
          'Different starts can reach different local solutions',
          'To guarantee class labels appear',
          'To train on test targets',
          'To avoid choosing a feature scale',
        ],
        0,
        'The k-means objective can have multiple local optima.',
        'The initial centroids affect later assignments.',
      ),
      exercise(
        'Define closest_center(point, centers). Return the index of the closest nonempty list of equal-dimension numeric centers by squared Euclidean distance. Break a tie by the first index.',
        'def closest_center(point, centers):\n    pass\n',
        'def closest_center(point, centers):\n    distances = [sum((a-b)**2 for a, b in zip(point, c)) for c in centers]\n    return min(range(len(centers)), key=lambda i: distances[i])',
        'assert closest_center([4, 3], [[0, 0], [5, 3]]) == 1\nassert closest_center([1], [[0], [2]]) == 0\nassert closest_center([-4, 8], [[-4, 8], [4, -8]]) == 0\nassert closest_center([2, 2, 2], [[0, 0, 0], [1, 1, 1], [3, 2, 2]]) == 2',
        'Squared distance is sufficient for comparing centers; a square root would not change the ranking.',
        'Sum coordinate-wise squared differences, then select the smallest distance.',
      ),
    ],
    [
      [
        'What are the two repeating steps of k-means?',
        "Assign each point to its nearest centroid; update each centroid to its assigned points' mean.",
      ],
      [
        'Why are cluster IDs different from class labels?',
        'They are arbitrary identifiers learned without known target classes and require separate interpretation.',
      ],
    ],
  ),
  skill(
    'ml-anomaly-detection',
    'ml-structure',
    'Flag unusual observations',
    'Use scores and thresholds without equating rarity with wrongdoing.',
    ['ml-classification-metrics'],
    [
      'An anomaly detector scores how unusual an observation is relative to a learned reference. Z-scores, density models, or distance-based rules can supply such scores. Different libraries use different score directions: in one API larger means more unusual, while another returns larger values for more normal observations. Read the contract before applying a threshold.',
      'An unusual row can be a measurement error, a rare legitimate event, or a genuine problem. Detection requires investigation and domain context. A threshold determines alert volume and the false-positive/false-negative trade-off. Evaluate with representative labels when available, and distinguish outlier detection in potentially contaminated training data from novelty detection using a mostly clean reference set.',
    ],
    {
      code: 'scores = [0.1, 0.8, 0.4, 0.95]  # Larger means more unusual here.\nalerts = [i for i, score in enumerate(scores) if score >= 0.8]\nprint(alerts)',
      output: '[1, 3]',
      explanation:
        'The threshold flags indices 1 and 3 under this explicitly stated score convention.',
    },
    [
      choice(
        'What should you check before thresholding a detector score?',
        [
          'Only the file size',
          'Whether larger scores mean more or less anomalous',
          'Whether every alert is a crime',
          'Whether the test labels can become inputs',
        ],
        1,
        'Score direction is API-specific and determines which side of a threshold is unusual.',
        'A sign convention can reverse an alert rule.',
      ),
      choice(
        'A row is statistically unusual. What follows?',
        [
          'It is certainly fraud',
          'It is necessarily a broken sensor',
          'It needs context; rarity alone does not establish a problem',
          'It must be removed before evaluation',
        ],
        2,
        'Unusual behavior can be legitimate, erroneous, or harmful, depending on the situation.',
        'Statistical rarity is evidence to investigate.',
      ),
      choice(
        'What reference data does novelty detection normally assume?',
        [
          'A mostly clean sample of normal behavior',
          'Only already-labeled fraudulent rows',
          'Future test targets',
          'An empty training set',
        ],
        0,
        'The model learns normal behavior before judging new observations.',
        'Novelty means a departure from a normal reference.',
      ),
      exercise(
        'Define alert_indices(scores, threshold), where larger scores mean more unusual. Return indices whose scores are >= threshold, in original order.',
        'def alert_indices(scores, threshold):\n    pass\n',
        'def alert_indices(scores, threshold):\n    return [i for i, score in enumerate(scores) if score >= threshold]',
        'assert alert_indices([0.1, 0.8, 0.4, 0.95], 0.8) == [1, 3]\nassert alert_indices([1, 2, 3], 4) == []\nassert alert_indices([], 0) == []\nassert alert_indices([-3, -1, 0], -1) == [1, 2]',
        'An explicit score convention turns threshold comparison into a reproducible alert policy.',
        'enumerate supplies both index and score.',
      ),
    ],
    [
      [
        'Why verify anomaly-score direction?',
        'Libraries differ: a larger score can mean either more anomalous or more normal, changing the threshold rule.',
      ],
      [
        'Does anomaly detection establish that an event is harmful?',
        'No. It identifies unusual observations that need context, investigation, and a validated decision policy.',
      ],
    ],
  ),
  skill(
    'ml-neural-layers',
    'ml-neural',
    'Compute a dense neural layer',
    'Track weighted sums, activations, and batch shapes.',
    ['da-broadcasting', 'ml-logistic-regression'],
    [
      'A dense layer computes Z = X @ W + b and applies an activation. With X shaped (batch, inputs), W shaped (inputs, outputs), and b shaped (outputs,), the result has shape (batch, outputs). Each output neuron has one weight per input plus a bias. ReLU replaces negative pre-activation values with zero.',
      'Stacking dense layers with nonlinear activations can model nonlinear relationships. Stacking only linear layers still gives a linear transformation. The output activation and loss must match the task: a single sigmoid often represents a binary probability; a softmax distributes probability across mutually exclusive classes; regression can use an unrestricted numeric output. This lesson executes the layer arithmetic with NumPy, without requiring TensorFlow.',
    ],
    {
      code: 'import numpy as np\nX = np.array([[1., 2.], [-1., 0.]])\nW = np.array([[2., -1.], [1., 1.]])\nb = np.array([0., -2.])\nprint(np.maximum(0, X @ W + b).tolist())',
      output: '[[4.0, 0.0], [0.0, 0.0]]',
      explanation:
        'Matrix multiplication combines each row with the neuron weights, the bias shifts the values, and ReLU clips negatives.',
    },
    [
      choice(
        'X has shape (10, 3) and W has shape (3, 4). What shape does X @ W have?',
        ['(3, 10)', '(10, 4)', '(4, 3)', '(10, 3, 4)'],
        1,
        'The shared dimension 3 contracts, leaving batch 10 and outputs 4.',
        'The inner dimensions must match.',
      ),
      choice(
        'What does ReLU do to input -2?',
        [
          'Return -2',
          'Return 2',
          'Return 0',
          'Return a class label automatically',
        ],
        2,
        'ReLU is max(0, value).',
        'Negative pre-activation values are clipped.',
      ),
      choice(
        'Why include nonlinear activations between dense layers?',
        [
          'Otherwise the composed layers remain a linear transformation',
          'They make every task a clustering task',
          'They replace all training data',
          'They guarantee calibrated probabilities',
        ],
        0,
        'Composition of linear or affine transformations is still linear or affine.',
        'More linear layers alone do not add nonlinear modeling power.',
      ),
      exercise(
        'Define dense_relu(X, W, b). Convert inputs to NumPy arrays, compute X @ W + b, and return its elementwise ReLU as a NumPy array.',
        'import numpy as np\n\ndef dense_relu(X, W, b):\n    pass\n',
        'import numpy as np\n\ndef dense_relu(X, W, b):\n    return np.maximum(0, np.asarray(X) @ np.asarray(W) + np.asarray(b))',
        'import numpy as np\nassert np.allclose(dense_relu([[1, 2], [-1, 0]], [[2, -1], [1, 1]], [0, -2]), [[4, 0], [0, 0]])\nassert np.allclose(dense_relu([[2], [-3]], [[1, -1]], [1, 1]), [[3, 0], [0, 4]])\nassert dense_relu([[0, 0]], [[1], [2]], [-1]).shape == (1, 1)',
        'Array broadcasting adds one output bias vector to every batch row before clipping.',
        'Use @ for matrix multiplication and np.maximum for the activation.',
      ),
    ],
    [
      [
        'What shapes define a dense batch transformation?',
        'X: (batch, inputs), W: (inputs, outputs), b: (outputs,), yielding (batch, outputs).',
      ],
      [
        'Why are nonlinear activations needed in a multilayer network?',
        'Without them, the stack collapses to a single linear or affine transformation.',
      ],
    ],
  ),
  skill(
    'ml-backpropagation',
    'ml-neural',
    'Trace gradients backward',
    'Apply the chain rule from a prediction error to its weights.',
    ['ml-gradient-descent', 'ml-neural-layers'],
    [
      'Backpropagation applies the chain rule to compute how each parameter influences a final loss. For prediction p = w*x + b and loss L = (p-y)^2, dL/dp = 2*(p-y). Multiplying by dp/dw = x gives dL/dw = 2*(p-y)*x; multiplying by dp/db = 1 gives dL/db = 2*(p-y).',
      'A forward pass computes predictions and intermediate values. A backward pass uses those values to compute gradients. An optimizer then applies parameter updates; backpropagation and the update are separate operations. Automatic differentiation frameworks perform this bookkeeping for a computation graph, but the derivatives still follow the same chain rule. The exercise calculates a simple scalar case directly in Python.',
    ],
    {
      code: 'x, y, w, b = 2.0, 5.0, 1.0, 0.0\nprediction = w*x + b\nupstream = 2*(prediction-y)\nprint(upstream*x, upstream)',
      output: '-12.0 -6.0',
      explanation:
        'Prediction 2 differs from target 5 by -3, so dL/dp=-6; the weight gradient adds a factor x=2.',
    },
    [
      choice(
        'For L=(p-y)^2, what is dL/dp?',
        ['p-y', '2*(p-y)', 'y/p', '0 for every p'],
        1,
        'Differentiating the square gives twice the residual.',
        'Apply the derivative of a squared quantity.',
      ),
      choice(
        'For p=w*x+b, what factor links dL/dp to dL/dw?',
        ['b', 'y', 'x', 'The test-set size'],
        2,
        'The derivative of p with respect to w is x.',
        'Hold the input fixed while changing w.',
      ),
      choice(
        'What is the distinction between backpropagation and an optimizer step?',
        [
          'Backpropagation computes gradients; the optimizer uses them to update parameters',
          'They are both only data shuffling',
          'Backpropagation only selects test data',
          'The optimizer creates the target labels',
        ],
        0,
        'Derivative calculation and parameter modification are separate stages.',
        'Compute the direction before taking the step.',
      ),
      exercise(
        'Define linear_gradients(x, y, w, b). For scalar prediction w*x+b and squared loss (prediction-y)**2, return (gradient_w, gradient_b). Do not update w or b.',
        'def linear_gradients(x, y, w, b):\n    pass\n',
        'def linear_gradients(x, y, w, b):\n    upstream = 2 * (w*x + b - y)\n    return upstream*x, upstream',
        'assert linear_gradients(2, 5, 1, 0) == (-12, -6)\nassert linear_gradients(3, 7, 2, 1) == (0, 0)\nassert linear_gradients(0, 4, 2, 1) == (0, -6)\nassert linear_gradients(-2, 0, 1, 1) == (4, -2)',
        'The chain rule multiplies the loss derivative by each prediction derivative.',
        'Compute the residual, then multiply its doubled value by x for the weight.',
      ),
    ],
    [
      [
        'What does backpropagation compute?',
        'Gradients of a final loss with respect to network parameters by applying the chain rule backward through a computation graph.',
      ],
      [
        'For squared loss and p=w*x+b, what are the gradients?',
        'dL/dw = 2*(p-y)*x and dL/db = 2*(p-y).',
      ],
    ],
  ),
  skill(
    'ml-training-deep-networks',
    'ml-neural',
    'Stabilize network training',
    'Separate optimization difficulties from generalization problems.',
    ['ml-backpropagation', 'ml-regularization'],
    [
      "Repeated multiplications through many layers can make gradients vanish or explode. Appropriate initialization, normalization, residual connections, and activation choices help manage signal scales. Gradient clipping limits a gradient vector's norm when it is too large; it does not fix every cause of unstable training. Learning-rate schedules change step sizes during optimization.",
      'Dropout randomly suppresses some activations during training and adjusts scaling so their expected contribution is preserved. Standard prediction uses the full network with dropout disabled. Batch normalization also behaves differently between training and inference: it uses batch statistics while training and learned running statistics at inference. Track both training and validation loss; reduce overfitting through data, regularization, and early stopping rather than confusing it with a numerical failure.',
    ],
    {
      code: 'import numpy as np\ngradient = np.array([3.0, 4.0])\nlimit = 2.0\nnorm = np.linalg.norm(gradient)\nclipped = gradient * min(1.0, limit / norm)\nprint(clipped.tolist())',
      output: '[1.2000000000000002, 1.6]',
      explanation:
        'The original norm is 5. Multiplying by 2/5 preserves direction while reducing the norm to 2.',
    },
    [
      choice(
        'A gradient norm becomes extremely large. Which technique directly limits its magnitude?',
        [
          'Adding future labels',
          'Gradient clipping',
          'Shuffling test labels',
          'Increasing the step size indefinitely',
        ],
        1,
        'Norm clipping bounds the update signal without reversing its direction.',
        'Limit the vector norm.',
      ),
      choice(
        'How does standard dropout behave during prediction?',
        [
          'It continues removing half the inputs regardless of configuration',
          'It learns test labels',
          'It is disabled and the full network is used',
          'It deletes the model weights permanently',
        ],
        2,
        'Random suppression is a training regularizer; ordinary inference uses the complete network.',
        'Training and inference have different modes.',
      ),
      choice(
        'Why distinguish training mode from inference mode?',
        [
          'Some layers, such as dropout and batch normalization, use different behavior',
          'The feature count must always double at inference',
          'Inference should update labels',
          'Validation can never run a neural network',
        ],
        0,
        'These layer behaviors must be configured correctly for evaluation and serving.',
        'The model can have stateful or stochastic training behavior.',
      ),
      exercise(
        'Define clip_gradient(values, max_norm), where max_norm > 0. Return a NumPy float array in the same direction with norm at most max_norm. Leave zero and already-small gradients unchanged.',
        'import numpy as np\n\ndef clip_gradient(values, max_norm):\n    pass\n',
        'import numpy as np\n\ndef clip_gradient(values, max_norm):\n    gradient = np.asarray(values, dtype=float)\n    norm = np.linalg.norm(gradient)\n    if norm > max_norm:\n        gradient = gradient * (max_norm / norm)\n    return gradient',
        'import numpy as np\nassert np.allclose(clip_gradient([3, 4], 2), [1.2, 1.6])\nassert np.allclose(clip_gradient([0, 0], 2), [0, 0])\nassert np.allclose(clip_gradient([1, -1], 3), [1, -1])\nassert np.isclose(np.linalg.norm(clip_gradient([-6, 8], 5)), 5)',
        'Norm clipping rescales only oversized gradients and keeps their direction.',
        'Compute the norm, then scale only if it exceeds the limit.',
      ),
    ],
    [
      [
        'What does gradient norm clipping preserve?',
        'The gradient direction, while rescaling oversized vectors to the chosen maximum norm.',
      ],
      [
        'How does standard dropout differ during training and inference?',
        'Training randomly suppresses activations with compensating scaling; ordinary inference uses the full network without suppression.',
      ],
    ],
  ),
  skill(
    'ml-keras-workflow',
    'ml-neural',
    'Read a Keras training workflow',
    'Connect model construction, compilation, fitting, and evaluation.',
    ['ml-neural-layers', 'ml-regularization'],
    [
      'A Keras workflow constructs a model, compiles it with an optimizer and loss, fits it on training examples, and evaluates it on held-out examples. A Sequential model fits a simple layer stack; the Functional API describes graphs with branching, multiple inputs, or multiple outputs. A binary classifier often combines one sigmoid output with binary cross-entropy; mutually exclusive multiclass outputs often use softmax with an appropriate categorical loss.',
      'Choose the loss to match both the prediction and the target representation: integer multiclass labels differ from one-hot label vectors. Validation data guides callbacks such as early stopping, while the test set estimates the selected model once. TensorFlow and Keras training are not executed in this browser environment. This skill assesses workflow and API reasoning; the runnable Python example below only computes cross-entropy arithmetic.',
    ],
    {
      code: 'import math\ny, probability = 1, 0.8\nloss = -(y*math.log(probability) + (1-y)*math.log(1-probability))\nprint(round(loss, 3))',
      output: '0.223',
      explanation:
        'This is plain-Python binary cross-entropy for one positive target, not a TensorFlow training run.',
    },
    [
      choice(
        'Which Keras operation chooses the optimizer and loss?',
        [
          'predict',
          'compile',
          'Deleting the validation set',
          'Only writing an Input layer',
        ],
        1,
        'compile configures the training objective and optimization behavior.',
        'Model construction describes layers; compilation configures training.',
      ),
      choice(
        'Which output/loss pair fits a binary 0/1 target?',
        [
          'An unrestricted output with no loss',
          'Softmax over unrelated regression targets',
          'One sigmoid output with binary cross-entropy',
          'A hidden-layer count as the loss',
        ],
        2,
        'The sigmoid estimates the positive-class probability, and binary cross-entropy compares it with a binary label.',
        'Match the output meaning to the target.',
      ),
      choice(
        'When is the Functional API useful?',
        [
          'When a model has branches or multiple inputs and outputs',
          'Only for changing the final test labels',
          'Only for constant predictors',
          'When you need to disable gradients permanently',
        ],
        0,
        'The Functional API builds a directed computation graph beyond a simple stack.',
        'Think about topology, not only layer count.',
      ),
      choice(
        'What does this browser skill actually execute?',
        [
          'A complete TensorFlow GPU training job',
          'A Keras cloud deployment',
          'Only the supplied plain-Python loss arithmetic',
          "Automatic fitting on the user's Anki account",
        ],
        2,
        'The assessment teaches workflow literacy; the Python demo does not import or run TensorFlow or Keras.',
        'Read the stated execution scope.',
      ),
    ],
    [
      [
        'What are the main stages of a Keras training workflow?',
        'Construct a model, compile its optimizer and loss, fit on training data, then evaluate held-out performance.',
      ],
      [
        'Why must the loss match target representation?',
        'Integer class labels, one-hot vectors, binary targets, and regression values encode different prediction tasks and require compatible losses.',
      ],
    ],
  ),
  skill(
    'ml-convolution',
    'ml-architectures',
    'Recognize convolutional structure',
    'Reason about local receptive fields, shared filters, and pooling.',
    ['ml-neural-layers'],
    [
      'A convolutional layer applies the same learned filter at many positions. Each response depends on a local receptive field, and the shared weights let the layer detect a pattern in different locations. Deep-learning libraries commonly implement cross-correlation without reversing the filter, while still calling the layer convolution. Multiple filters produce multiple output channels.',
      'Stride controls how far the filter moves between positions; padding controls the treatment of boundaries. Pooling summarizes neighborhoods, often reducing spatial resolution. Convolutional networks can build local features into larger patterns, but invariance to every translation is not automatic. This browser lesson uses a plain-Python filter response for illustration and assesses architecture reasoning, without running a TensorFlow CNN.',
    ],
    {
      code: 'signal = [1, 3, 2, 5]\nfilter_weights = [-1, 1]\nresponses = [sum(a*b for a, b in zip(signal[i:i+2], filter_weights)) for i in range(3)]\nprint(responses)',
      output: '[2, -1, 3]',
      explanation:
        'A shared two-position filter measures neighboring increases at each valid location, using cross-correlation.',
    },
    [
      choice(
        'What is weight sharing in a convolutional layer?',
        [
          'Each position learns a completely unrelated filter',
          'The same filter weights are reused at many positions',
          'Every layer must share the same target',
          'All pixels become class labels',
        ],
        1,
        'Reusing one filter lets a learned local pattern be recognized across positions.',
        'One detector slides across an input.',
      ),
      choice(
        'What does increasing the stride usually do?',
        [
          'Increase every probability to 1',
          'Add target labels to each pixel',
          'Space receptive fields farther apart and reduce output resolution',
          'Require every image to be grayscale',
        ],
        2,
        'A larger step samples fewer filter positions for a fixed input and padding.',
        'Stride is the movement between filter locations.',
      ),
      choice(
        'What is a receptive field?',
        [
          'The input region that influences a particular output unit',
          'The final test set',
          'An optimizer learning rate',
          'The list of all class names',
        ],
        0,
        'A local response depends on its corresponding input neighborhood.',
        'Trace which input values contribute to that response.',
      ),
      choice(
        'For signal [1,3,2] and filter [-1,1], what are the two valid cross-correlation responses?',
        ['[4,5]', '[-2,1]', '[2,-1]', '[1,3,2]'],
        2,
        'The responses are -1*1+1*3=2 and -1*3+1*2=-1.',
        'Apply the same weights to each adjacent pair.',
      ),
    ],
    [
      [
        'What two ideas characterize a convolutional layer?',
        'Local receptive fields and shared filters applied at many positions.',
      ],
      [
        'How do stride and padding affect a convolutional layer?',
        'Stride sets the spacing between filter positions; padding sets boundary treatment and influences output size.',
      ],
    ],
  ),
  skill(
    'ml-sequence-models',
    'ml-architectures',
    'Model ordered sequences',
    'Separate recurrent state, causal windows, and forecast horizons.',
    ['ml-neural-layers', 'da-window'],
    [
      'A recurrent network updates a hidden state using the current input and the previous state, reusing its parameters at each step. Its output can summarize an entire sequence or provide a prediction at every step. LSTM and GRU architectures use gates to control how information enters, persists in, and leaves their state.',
      'Forecasting needs a causal input window: each prediction uses observations available before its forecast time. For multiple entities, group observations by entity before creating windows, so a sequence never crosses from one person or sensor to another. A one-step forecast and a multi-step forecast have different outputs and evaluation demands. Sequence models also include temporal convolution and attention, so recurrence is a design choice rather than a requirement. The Python example creates past-value windows; the assessment does not claim to train an RNN in the browser.',
    ],
    {
      code: 'values = [10, 12, 11, 15, 14]\nwindow = 3\nexamples = [(values[i-window:i], values[i]) for i in range(window, len(values))]\nprint(examples)',
      output: '[([10, 12, 11], 15), ([12, 11, 15], 14)]',
      explanation:
        'Each target is paired only with the three preceding observations, preserving a one-step forecasting boundary.',
    },
    [
      choice(
        'What carries information between steps in a recurrent network?',
        [
          'A hidden state',
          'The final test label',
          'A new unrelated model at every step',
          'Only a file path',
        ],
        0,
        'The recurrent state depends on earlier state and the current input.',
        'The sequence history is represented internally.',
      ),
      choice(
        'Which window is valid when predicting the value at time 5?',
        [
          'Values at times 6,7,8',
          'Values at times 2,3,4',
          'The target at time 5 copied as an input',
          'All future test targets',
        ],
        1,
        'A causal forecast uses only observations before the target time.',
        'Do not look forward from the prediction boundary.',
      ),
      choice(
        'What do LSTM gates help control?',
        [
          'The number of test labels',
          'Whether every feature is an integer',
          'Which information is retained, updated, and exposed in recurrent state',
          'Whether the dataset has a filename',
        ],
        2,
        'Gating regulates the flow of information through time.',
        'Gates are learned controls on state information.',
      ),
      choice(
        'Why evaluate a multi-step forecast by horizon?',
        [
          'Errors can differ between near-term and distant predictions',
          'Every horizon must have exactly the same error',
          'It permits using future observations as inputs',
          'It removes the need for a baseline',
        ],
        0,
        'A model may perform well one step ahead while degrading at longer horizons.',
        'Distance into the future changes the difficulty.',
      ),
    ],
    [
      [
        'What distinguishes a recurrent network?',
        'A hidden state passes between sequence steps while the same recurrent parameters are reused.',
      ],
      [
        'What makes a forecasting input causal?',
        'It includes only information available before the forecast decision, excluding target-time and later observations.',
      ],
    ],
  ),
  skill(
    'ml-attention',
    'ml-architectures',
    'Read attention and transformer flow',
    'Connect queries, keys, values, and causal masking.',
    ['ml-sequence-models', 'ml-training-deep-networks'],
    [
      'Attention compares a query with keys to produce scores, normalizes those scores into weights, and uses the weights to combine value vectors. The result is a context-dependent representation. Self-attention obtains queries, keys, and values from the same sequence; cross-attention lets one sequence query information from another.',
      'Transformer blocks combine attention with feed-forward layers, residual paths, and normalization. Sequence order needs an explicit positional representation because ordinary attention alone does not encode token positions. A causal mask prevents an autoregressive token prediction from attending to future tokens. The plain-Python example computes an already-chosen weighted value average; it does not execute a trained transformer.',
    ],
    {
      code: 'weights = [0.25, 0.75]\nvalues = [[2, 0], [0, 4]]\ncontext = [sum(w*value[j] for w, value in zip(weights, values)) for j in range(2)]\nprint(context)',
      output: '[0.5, 3.0]',
      explanation:
        'A stronger weight on the second value emphasizes its second coordinate in the combined context.',
    },
    [
      choice(
        'What is combined using normalized attention weights?',
        [
          'Only target labels',
          'Value vectors',
          'File names',
          'Optimizer names',
        ],
        1,
        'Attention weights determine how much each value contributes to the context vector.',
        'Queries and keys produce scores; values supply the content.',
      ),
      choice(
        'What prevents an autoregressive prediction from seeing future tokens?',
        [
          'The final test split only',
          'Randomizing all token positions',
          'A causal attention mask',
          'Increasing the batch size',
        ],
        2,
        "The mask excludes later positions from that token's attention calculation.",
        'Block information that would not be available during generation.',
      ),
      choice(
        'Why add positional information to a transformer?',
        [
          'Attention alone does not encode sequence positions',
          'It makes every token a class label',
          'It removes all model weights',
          'It guarantees factual outputs',
        ],
        0,
        'The model needs a representation of order in addition to token content.',
        'Sequence order is not inherent in an unordered attention comparison.',
      ),
      choice(
        'Weights [0.2,0.8] combine scalar values [10,0]. What is the context value?',
        ['8', '10', '2', '0.2'],
        2,
        'The weighted sum is 0.2*10+0.8*0=2.',
        'Multiply each value by its weight, then sum.',
      ),
    ],
    [
      [
        'What are the roles of queries, keys, and values?',
        'Queries compare with keys to produce attention weights; those weights combine value vectors into a context representation.',
      ],
      [
        'Why use a causal attention mask?',
        'To prevent a token prediction from attending to future positions that would be unavailable during autoregressive generation.',
      ],
    ],
  ),
  skill(
    'ml-transfer-learning',
    'ml-architectures',
    'Reuse learned representations',
    'Plan feature extraction and careful fine-tuning for a new task.',
    ['ml-keras-workflow', 'ml-training-deep-networks'],
    [
      'Transfer learning reuses weights learned on one task as a starting point for a related task. A common approach replaces the old prediction head, freezes the pretrained base, and trains the new head. This can exploit reusable features when the new labeled dataset is small, but transfer quality depends on how closely the source representation matches the new task.',
      "After the head has learned a reasonable mapping, you can unfreeze some base layers and fine-tune at a small learning rate. In Keras, changing trainable flags requires compiling again so the training configuration reflects those flags. Preserve the pretrained model's expected preprocessing and handle batch-normalization behavior deliberately. This browser skill assesses that workflow; the example is only a plain-Python listing of which toy layer names are trainable.",
    ],
    {
      code: 'layers = [{"name": "base", "trainable": False}, {"name": "head", "trainable": True}]\nprint([layer["name"] for layer in layers if layer["trainable"]])',
      output: "['head']",
      explanation:
        'The toy list illustrates a frozen base and a trainable head without constructing or running a neural framework.',
    },
    [
      choice(
        'Why initially freeze a pretrained base while training a new head?',
        [
          'To erase all learned weights',
          'To preserve useful representations while the new head learns',
          'To expose final test labels',
          'To make every layer permanently unchangeable',
        ],
        1,
        'A randomly initialized head can create large gradients that disrupt an otherwise useful base.',
        'Let the new mapping stabilize before changing the base.',
      ),
      choice(
        'After changing Keras layer trainable flags, what should you do before further fit calls?',
        [
          'Only rename the model',
          'Delete its input shape',
          'Compile the model again',
          'Assume the optimizer automatically sees every change',
        ],
        2,
        'The training configuration is established at compilation and must reflect changed trainable variables.',
        'The compile step configures the training state.',
      ),
      choice(
        'What is a reasonable fine-tuning strategy?',
        [
          'Unfreeze selected layers with a small validated learning rate',
          'Use the largest possible learning rate immediately',
          'Ignore the pretrained input preprocessing',
          'Choose settings with final test targets',
        ],
        0,
        'Small updates can adapt useful weights while reducing the risk of destroying their representation.',
        'Fine-tuning should be controlled adaptation.',
      ),
      choice(
        'When might transfer learning fail to help?',
        [
          'Whenever the dataset has any label',
          'Only if the new head is named differently',
          'When source representations poorly match the new domain or task',
          'Never; it always improves the test score',
        ],
        2,
        'Representations can encode assumptions or patterns that do not transfer to the new distribution.',
        'Related tasks transfer more plausibly than unrelated ones.',
      ),
    ],
    [
      [
        'What are feature extraction and fine-tuning in transfer learning?',
        'Feature extraction freezes a pretrained base and trains a new head; fine-tuning updates selected pretrained weights for the new task.',
      ],
      [
        'What should happen after changing trainable flags in Keras?',
        'Recompile before fitting again, then validate the training behavior and learning rate.',
      ],
    ],
  ),
  skill(
    'ml-generative-models',
    'ml-architectures',
    'Distinguish generative models',
    'Compare reconstruction, latent sampling, adversarial training, and denoising.',
    ['ml-training-deep-networks'],
    [
      'An autoencoder maps an input to a compact representation and reconstructs it with a decoder. A variational autoencoder learns a distribution of latent representations, balancing reconstruction with a regularizer toward a chosen prior. A generative adversarial network trains a generator against a discriminator. A diffusion model learns a denoising process that can generate samples by iteratively reversing a noising process.',
      'Reconstruction quality, sample diversity, and useful downstream performance measure different things. A model can memorize training examples, omit modes of the data, or generate plausible-looking but incorrect content. Evaluation should examine held-out behavior and the intended use, rather than judging a few attractive outputs. This skill is conceptual: the runnable example computes a reconstruction error using ordinary Python, not a GAN, VAE, or diffusion training job.',
    ],
    {
      code: 'original = [1.0, 0.0, 2.0]\nreconstructed = [0.8, 0.1, 2.1]\nerror = sum((a-b)**2 for a, b in zip(original, reconstructed)) / len(original)\nprint(round(error, 3))',
      output: '0.02',
      explanation:
        'Average squared reconstruction error summarizes this pair, without assessing the diversity of generated samples.',
    },
    [
      choice(
        'What does a basic autoencoder learn to do?',
        [
          'Predict only class labels',
          'Encode an input and reconstruct it',
          'Sort database commits',
          'Choose every reinforcement action',
        ],
        1,
        'Its encoder produces a representation and its decoder reconstructs the input.',
        'The training target is related to the input itself.',
      ),
      choice(
        'Which architecture explicitly pairs a generator with a discriminator?',
        [
          'A linear support vector machine',
          'A standard scaler',
          'A generative adversarial network',
          'K-means',
        ],
        2,
        'GAN training uses an adversarial interaction between these two networks.',
        'The name includes adversarial.',
      ),
      choice(
        'What is the central learned operation in a diffusion generator?',
        [
          'Denoising states across a noise schedule',
          'Copying every test row as a label',
          'Choosing a constant class',
          'Removing all latent randomness',
        ],
        0,
        'Generation follows a learned reverse process from noise toward structured samples.',
        'Reverse the effect of added noise.',
      ),
      choice(
        'Why is a small collection of attractive samples insufficient evaluation?',
        [
          'It proves the model cannot memorize',
          'Every sample is a probability calibration test',
          'It may hide memorization, missing modes, and failures relevant to the intended use',
          'It guarantees diversity',
        ],
        2,
        'Selected examples cannot establish broad held-out quality or coverage of the data distribution.',
        'A few outputs do not describe the full distribution.',
      ),
    ],
    [
      [
        'How do GANs and diffusion models differ conceptually?',
        'GANs train a generator against a discriminator; diffusion models learn a denoising process used to reverse a noising process.',
      ],
      [
        'Why separate reconstruction accuracy from sample diversity?',
        'A model can reconstruct examples well yet generate a narrow, memorized, or unrepresentative collection of new samples.',
      ],
    ],
  ),
  skill(
    'ml-reinforcement-learning',
    'ml-architectures',
    'Reason about actions and rewards',
    'Separate a policy, delayed return, and exploration.',
    ['ml-learning-tasks', 'math-probability', 'comprehensions'],
    [
      'A reinforcement-learning agent observes an environment, chooses an action according to a policy, and receives a reward and a new observation. It tries to maximize expected accumulated return, not merely the next immediate reward. A discounted return sums rewards with powers of a discount factor gamma between 0 and 1, placing progressively less weight on distant rewards.',
      'Exploration tries actions to learn about their consequences; exploitation uses current knowledge to choose a promising action. A value function estimates expected future return. A Q-value conditions that estimate on both state and action. Reward design matters because an agent can optimize the stated proxy in a way that misses the intended goal. This browser lesson computes a short discounted return in Python; it does not run an external simulator or train a deep RL agent.',
    ],
    {
      code: 'rewards = [1, 2, 4]\ngamma = 0.5\nresult = sum((gamma**t)*reward for t, reward in enumerate(rewards))\nprint(result)',
      output: '3.0',
      explanation: 'The return is 1 + 0.5*2 + 0.25*4 = 3.',
    },
    [
      choice(
        'What does a policy specify?',
        [
          'Only a loss-file name',
          'How the agent chooses actions from its observations or state',
          'The final test labels',
          'A constant feature variance',
        ],
        1,
        'A policy maps the available information to an action or action distribution.',
        'It determines behavior.',
      ),
      choice(
        'Why might the best immediate reward be the wrong action?',
        [
          'Future rewards never matter',
          'The dataset is always supervised',
          'An action can sacrifice a small immediate reward for greater future return',
          'Every action has the same consequences',
        ],
        2,
        'The objective concerns accumulated return over time, including delayed effects.',
        'Look beyond the next step.',
      ),
      choice(
        'What is exploration?',
        [
          'Trying actions to learn about their consequences',
          'Always choosing the highest current estimate',
          'Removing all environmental observations',
          'Using held-out test labels as actions',
        ],
        0,
        'Exploration gathers information rather than relying only on current value estimates.',
        'You may need to try an uncertain option.',
      ),
      choice(
        'Rewards are [2,4] and gamma=0.5. What is the discounted return from the first reward?',
        ['6', '3', '4', '2'],
        2,
        'The return is 2 + 0.5*4 = 4.',
        'The immediate reward has discount power zero.',
      ),
    ],
    [
      [
        'What is a discounted return?',
        'The sum of future rewards weighted by successive powers of gamma, starting with power zero for the immediate reward.',
      ],
      [
        'How do exploration and exploitation differ?',
        'Exploration seeks information about action consequences; exploitation uses current knowledge to select a promising action.',
      ],
    ],
  ),
  skill(
    'ml-deployment-monitoring',
    'ml-production',
    'Keep deployed predictions reliable',
    'Version the full prediction pipeline and monitor real outcomes.',
    ['ml-preprocessing', 'da-pipeline'],
    [
      'Serving a model requires the same feature definitions and fitted preprocessing used during training. Store the model together with its schema, transformation state, package versions, and training-data lineage. Validate required fields and input types at the boundary. A reproducible prediction is more than a saved weight file.',
      'Monitor input quality, latency, failures, prediction distributions, and eventual outcomes when labels arrive. Covariate shift changes input distributions; concept drift changes the relationship between inputs and targets. An input-distribution change is a warning to investigate, not automatic proof that accuracy fell. Re-evaluate with new representative labels, compare subgroup performance, and keep a rollback path for a bad release.',
    ],
    {
      code: 'expected = {"distance_km", "rain"}\nrecord = {"distance_km": 8, "rain": 0}\nmissing = sorted(expected - record.keys())\nprint(missing)\nprint(len(missing) == 0)',
      output: '[]\nTrue',
      explanation:
        'A schema check catches absent required inputs before a prediction pipeline receives them.',
    },
    [
      choice(
        'What must stay consistent between training and serving?',
        [
          'Only the model display name',
          'Feature definitions and fitted preprocessing',
          'The final test score string',
          'The browser tab title',
        ],
        1,
        'Serving with different features or transformations changes what the model receives.',
        'The prediction pipeline includes more than weights.',
      ),
      choice(
        'An input distribution shifts. What can you conclude immediately?',
        [
          'Accuracy certainly rose',
          'Accuracy certainly fell',
          'Something changed and should be investigated with outcomes when available',
          'The target is now a different file type',
        ],
        2,
        'Input shift can signal risk without proving the direction or magnitude of predictive degradation.',
        'Distribution monitoring is a signal, not a label-based accuracy estimate.',
      ),
      choice(
        'What is concept drift?',
        [
          'A change in the relationship between features and targets',
          'Renaming a model file',
          'Increasing the width of a plot',
          'Repeating a fixed random seed',
        ],
        0,
        'The predictive relationship itself changes, such as the same features no longer implying the same outcome.',
        'Distinguish changing inputs from changing conditional outcomes.',
      ),
      exercise(
        'Define missing_features(record, required). Return a sorted list of required feature names absent from record. Ignore extra keys.',
        'def missing_features(record, required):\n    pass\n',
        'def missing_features(record, required):\n    return sorted(set(required) - record.keys())',
        'assert missing_features({"a": 1}, ["a", "b", "c"]) == ["b", "c"]\nassert missing_features({"a": 1, "extra": 2}, ["a"]) == []\nassert missing_features({}, ["z", "a", "a"]) == ["a", "z"]\nassert missing_features({"a": None}, ["a"]) == [], "Presence and value validation are separate checks."',
        'A missing-field check establishes presence; checking null values, types, and ranges is a separate validation step.',
        'Take the required-name set minus existing dictionary keys, then sort.',
      ),
    ],
    [
      [
        'What should be versioned with a deployed model?',
        'Its feature schema, fitted preprocessing, package/runtime versions, and training-data lineage, alongside the model artifact.',
      ],
      [
        'How do covariate shift and concept drift differ?',
        'Covariate shift changes input distributions; concept drift changes the relationship between inputs and targets.',
      ],
    ],
  ),
];

export const machineLearningSkills: Skill[] = withTeachingOrder(curriculum);

export const machineLearningCourse: Course = {
  id: 'machine-learning',
  title: 'Machine Learning',
  description:
    'Build, evaluate, and operate predictive models, then reason about neural-network and generative architectures.',
  domain: 'programming',
  skillIds: machineLearningSkills.map((item) => item.id),
};

export const machineLearningCatalog: CurriculumCatalog = {
  courses: [machineLearningCourse],
  units: machineLearningUnits,
  skills: machineLearningSkills,
};
