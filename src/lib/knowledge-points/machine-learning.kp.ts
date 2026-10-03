import { choose, predictOutput, type KnowledgePointModule } from './authoring';

export const knowledgePoints: KnowledgePointModule = {
  'ml-learning-tasks': [
    {
      title: 'Separate the features from the target',
      explanation: [
        'A supervised example has two parts. The features are the inputs you will know when you make a prediction; the target is the value you want the model to predict. In a record stored as a dictionary, you choose which keys are features and which key is the target.',
        'Keep the target out of the feature list. A model that receives the answer as an input learns nothing useful about the real inputs.',
      ],
      example: {
        code: 'day = {"temp_c": 18, "holiday": 0, "rentals": 340}\nfeatures = [day["temp_c"], day["holiday"]]\ntarget = day["rentals"]\nprint(features)\nprint(target)',
        output: '[18, 0]\n340',
        explanation:
          'Temperature and the holiday flag are inputs. The number of bike rentals is what the model should predict, so it is the target and is not in the feature list.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'house = {"rooms": 3, "area_m2": 72, "price": 210000}\nfeatures = [house["rooms"], house["area_m2"]]\ntarget = house["price"]\nprint(features)\nprint(target)',
          [
            '[3, 72, 210000]\n210000',
            '[3, 72]\n210000',
            '[72, 3]\n210000',
            '[3, 72]\nprice',
          ],
          1,
          'The feature list holds rooms and area in the order written; the target is the price value, not the key name.',
        ),
        predictOutput(
          'What does this program print?',
          'row = {"temp_c": 21, "humidity": 40, "wind": 12, "rain_mm": 5}\nfeatures = [row["temp_c"], row["humidity"], row["wind"]]\ntarget = row["rain_mm"]\nprint(len(features), target)',
          ['4 5', '3 rain_mm', '3 5', '5 3'],
          2,
          'Three keys are used as features, and the target is the rainfall value 5.',
        ),
        choose(
          'A churn table has the columns monthly_fee, support_calls, tenure_months, and churned. You want to predict churned. Which columns are the features?',
          [
            'monthly_fee, support_calls, tenure_months, churned',
            'churned only',
            'monthly_fee and churned',
            'monthly_fee, support_calls, tenure_months',
          ],
          3,
          'Every column except the target can serve as an input; churned is what you predict, so it cannot be a feature.',
        ),
        predictOutput(
          'What does this program print?',
          'def target_of(record):\n    return record["passed"]\n\nstudents = [{"hours": 2, "passed": False}, {"hours": 9, "passed": True}]\nlabels = []\nfor student in students:\n    labels.append(target_of(student))\nprint(labels)',
          ['[2, 9]', '[False, True]', '[True, False]', '["passed", "passed"]'],
          1,
          'target_of returns the passed value of each record, and the loop keeps the records in order.',
        ),
      ],
    },
    {
      title: 'Let the target decide regression or classification',
      explanation: [
        'The kind of target decides the task. A numeric quantity such as minutes, dollars, or degrees is a regression target. A value from a fixed set of categories is a classification target: two categories make binary classification, more make multiclass classification.',
        'Categories stay categories even when they are stored as 0 and 1. The same records can also support either task: comparing a number with a cutoff turns a regression target into a class label.',
      ],
      example: {
        code: 'order = {"items": 4, "minutes": 38}\nminutes_target = order["minutes"]\nlate_target = order["minutes"] > 30\nprint(minutes_target)\nprint(late_target)',
        output: '38\nTrue',
        explanation:
          'Predicting minutes_target, a number, is regression. Predicting late_target, which is True or False, is binary classification on the same order.',
      },
      questions: [
        choose(
          'An email model outputs one of "spam", "promotion", or "personal". What kind of task is this?',
          [
            'Regression',
            'Binary classification',
            'Multiclass classification',
            'Clustering',
          ],
          2,
          'The target is one of three fixed categories, so it is multiclass classification.',
        ),
        choose(
          'A target column stores 0 for "kept subscription" and 1 for "cancelled". What kind of task is predicting it?',
          [
            'Binary classification',
            'Regression, because the labels are numbers',
            'Clustering, because the classes have no names',
            'Multiclass classification',
          ],
          0,
          'The numbers are codes for two categories; their size means nothing, so this is binary classification.',
        ),
        predictOutput(
          'What does this program print?',
          'reading = {"sensor": "A7", "temp_c": 91.5}\noverheated = reading["temp_c"] >= 90\nprint(reading["temp_c"], overheated)',
          ['91.5 False', 'True 91.5', '91.5 overheated', '91.5 True'],
          3,
          '91.5 is at least 90, so the derived class label is True while the numeric value stays 91.5.',
        ),
        choose(
          "Predicting tomorrow's maximum temperature in °C is regression. Which change turns the same data into a classification task?",
          [
            'Reporting the temperature in °F instead',
            'Predicting whether the maximum will exceed 30 °C',
            'Adding humidity as another feature',
            'Using five more years of history',
          ],
          1,
          'Comparing the temperature with 30 °C turns the target into a yes/no label; the other changes keep a numeric target.',
        ),
      ],
    },
    {
      title: 'Recognize unsupervised and reinforcement learning',
      explanation: [
        'Supervised learning needs a known target for every training example. Unsupervised learning has only features: it looks for structure such as groups of similar rows or unusual rows, without a correct answer to compare against.',
        'Reinforcement learning has no table of correct answers either. An agent takes actions, receives rewards, and learns which actions lead to more total reward over time.',
      ],
      example: {
        code: 'def learning_type(has_labels, takes_actions):\n    if takes_actions:\n        return "reinforcement"\n    if has_labels:\n        return "supervised"\n    return "unsupervised"\n\nprint(learning_type(False, False))\nprint(learning_type(True, False))',
        output: 'unsupervised\nsupervised',
        explanation:
          'Without actions or labels, only structure in the features is left to learn. With labels and no actions, the examples supervise the model.',
      },
      questions: [
        choose(
          'A music service groups listeners with similar listening histories. No group names exist beforehand. Which kind of learning is this?',
          [
            'Supervised classification',
            'Reinforcement learning',
            'Regression',
            'Unsupervised learning',
          ],
          3,
          'There is no target to predict; the task is to find groups in the features alone.',
        ),
        choose(
          'A warehouse robot tries moves and receives +1 for each package it delivers. What makes this reinforcement learning?',
          [
            'Each route in the data has a correct label',
            'It learns from rewards that follow its own actions',
            'It groups similar routes without any feedback',
            'It predicts the numeric weight of each package',
          ],
          1,
          'The robot is never told the correct move; it learns from the rewards its actions earn.',
        ),
        choose(
          'Which dataset supports supervised learning?',
          [
            'Product photos with no tags or captions',
            'Sensor logs with no recorded outcome',
            'Transactions that are each marked fraud or not fraud',
            'Website visits with no conversion data',
          ],
          2,
          'Only the transactions come with a known target for every example.',
        ),
        predictOutput(
          'What does this program print?',
          'def learning_type(has_labels, takes_actions):\n    if takes_actions:\n        return "reinforcement"\n    if has_labels:\n        return "supervised"\n    return "unsupervised"\n\nprint(learning_type(False, True))\nprint(learning_type(True, False))',
          [
            'unsupervised\nsupervised',
            'reinforcement\nunsupervised',
            'reinforcement\nsupervised',
            'supervised\nreinforcement',
          ],
          2,
          'takes_actions is checked first, so the first call returns reinforcement; the second has labels and no actions.',
        ),
      ],
    },
    {
      title: 'Use only information available at prediction time',
      explanation: [
        'A feature must be known at the moment the prediction is made. A value recorded after the outcome, or computed from it, leaks the target: the model looks excellent in testing and then fails when that value is not available yet.',
        'For each candidate feature, ask when it is recorded. Keep it only if it exists before the decision the model supports.',
      ],
      example: {
        code: 'record = {"distance_km": 8, "rain": 1, "driver_rating": 4, "minutes": 25}\nknown_at_dispatch = ["distance_km", "rain"]\nfeatures = []\nfor name in known_at_dispatch:\n    features.append(record[name])\nprint(features)',
        output: '[8, 1]',
        explanation:
          'The driver rating is given after the trip, so it is left out. Only distance and rain are known when the order is dispatched.',
      },
      questions: [
        choose(
          'At application time, you predict whether a loan will default. Which column leaks the outcome?',
          [
            'Applicant income',
            'Requested loan amount',
            'Missed payments on this loan',
            'Years at current job',
          ],
          2,
          'Missed payments on this loan happen after it is issued, so they reveal the outcome you are trying to predict.',
        ),
        choose(
          'At admission, a hospital model predicts whether a patient will stay more than five days. Which feature is unavailable at that moment?',
          [
            'Age',
            'Admission diagnosis',
            'Number of prior visits',
            'Discharge date',
          ],
          3,
          'The discharge date is recorded when the stay ends, so it is unknown at admission and reveals the length of stay.',
        ),
        choose(
          'A cancellation model scored 99% in testing but fails after launch. One input was refund_issued. What is the most likely cause?',
          [
            'refund_issued is recorded after the cancellation it predicts',
            'The model has too few features',
            'refund_issued is a categorical column',
            'Test sets are always easier than real data',
          ],
          0,
          'Refunds follow cancellations, so the feature carried the answer during testing but is missing at prediction time.',
        ),
        predictOutput(
          'What does this program print?',
          'row = {"plan": "pro", "logins": 12, "cancel_reason": "price", "cancelled": True}\nusable = ["plan", "logins"]\nfeatures = []\nfor name in usable:\n    features.append(row[name])\nprint(features)\nprint(row["cancelled"])',
          [
            "['pro', 12, 'price']\nTrue",
            "['plan', 'logins']\nTrue",
            "['pro', 12]\nTrue",
            '[pro, 12]\nTrue',
          ],
          2,
          'Only the usable keys are copied, so the cancel reason, known only after cancelling, stays out. Lists print strings with quotes.',
        ),
      ],
    },
  ],
  'ml-data-splits': [
    {
      title: 'Give each partition one job',
      explanation: [
        'The training set fits the model. The validation set compares choices you make, such as which features or model settings to use. The test set is used once at the end to estimate how the finished model will perform on new data.',
        'If you keep adjusting the model to improve its test score, the test rows have influenced your choices. They become another validation set, and the final estimate is optimistic.',
      ],
      example: {
        code: 'rows = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]\ntrain = rows[:6]\nvalidation = rows[6:8]\ntest = rows[8:]\nprint(train)\nprint(validation, test)',
        output: '[1, 2, 3, 4, 5, 6]\n[7, 8] [9, 10]',
        explanation:
          'Three slices that meet at positions 6 and 8 give three partitions with no shared rows.',
      },
      questions: [
        choose(
          'You compare three model settings and keep the one with the lowest error. Which partition should supply that error?',
          [
            'The training set',
            'The test set',
            'The validation set',
            'All rows combined',
          ],
          2,
          'Choosing between settings is the validation set’s job, which keeps the test set unseen.',
        ),
        choose(
          'A team checks the test score after every experiment and keeps whatever scored best. Why is their final test number optimistic?',
          [
            'Test rows influenced the choices, so they are no longer unseen',
            'Test sets always contain easier rows',
            'The training set was too small',
            'Scores always fall after a model is chosen',
          ],
          0,
          'Selecting on the test score fits the choices to those specific rows, so the score overstates performance on new data.',
        ),
        predictOutput(
          'What does this program print?',
          'rows = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]\ntrain = rows[:7]\nvalidation = rows[7:9]\ntest = rows[9:]\nprint(len(train), len(validation), len(test))',
          ['7 2 1', '7 3 1', '6 2 2', '7 2 2'],
          0,
          'rows[:7] has 7 items, rows[7:9] has positions 7 and 8, and rows[9:] has only the last item.',
        ),
        choose(
          'Which partition should be used to learn the model’s parameters, such as its weights?',
          [
            'The validation set',
            'The test set',
            'The validation and test sets together',
            'The training set',
          ],
          3,
          'Only the training set fits parameters; the other two are held out to judge choices and the final result.',
        ),
      ],
    },
    {
      title: 'Split time-ordered data chronologically',
      explanation: [
        'A forecast uses the past to predict the future, so its evaluation should do the same: train on earlier observations and test on later ones. Slicing a time-ordered list at a cut point does exactly that.',
        'A random split mixes later days into training. The model can then learn from observations after the ones it is tested on, which makes its error look smaller than it will be in real forecasting.',
      ],
      example: {
        code: 'sales = [12, 15, 14, 18, 21, 19, 24]\ncut = 5\ntrain, test = sales[:cut], sales[cut:]\nprint(train)\nprint(test)',
        output: '[12, 15, 14, 18, 21]\n[19, 24]',
        explanation:
          'The first five days train the model and the two most recent days test it, so no test day comes before a training day.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'months = ["jan", "feb", "mar", "apr", "may", "jun"]\ntrain = months[:-2]\ntest = months[-2:]\nprint(train[-1], test[0])',
          ['may jun', 'apr may', 'apr jun', 'mar may'],
          1,
          'months[:-2] stops before "may", so training ends at "apr"; the test slice starts at "may".',
        ),
        choose(
          'Daily demand from 2023 and 2024 is used to forecast 2025. Which evaluation matches how the model will be used?',
          [
            'Shuffle all days and hold out 20% at random',
            'Train on 2024 and test on 2023',
            'Test on the same days used for training',
            'Train on 2023 and test on later days in 2024',
          ],
          3,
          'Only the chronological split asks the model to predict days after everything it trained on.',
        ),
        choose(
          'On time-ordered sales, a random split gives a much lower error than a chronological split. What is the likely reason?',
          [
            'Chronological splits always have fewer rows',
            'Random splitting removes the target column',
            'Random splitting lets training include days after the test days',
            'The chronological test set is larger',
          ],
          2,
          'With a random split, the model sees neighbouring and later days, information a real forecast never has.',
        ),
        predictOutput(
          'What does this program print?',
          'temps = [3, 5, 4, 8, 9, 7, 10, 12]\nn_test = 3\ntrain = temps[:len(temps) - n_test]\ntest = temps[len(temps) - n_test:]\nprint(len(train), test)',
          ['5 [3, 5, 4]', '3 [7, 10, 12]', '5 [9, 7, 10]', '5 [7, 10, 12]'],
          3,
          'The cut is at position 8 - 3 = 5, so the last three readings form the test set.',
        ),
      ],
    },
    {
      title: 'Keep class proportions with stratification',
      explanation: [
        'In a classification task with independent rows, a split can give partitions with very different class shares, especially when the data are sorted or one class is rare. With 0/1 labels, sum(labels) counts the 1s, so sum(labels) / len(labels) is the share of positives.',
        'A stratified split samples within each class, so every partition keeps about the overall share. Stratification balances labels only; it does nothing about time order or repeated entities.',
      ],
      example: {
        code: 'labels = [0, 0, 0, 0, 0, 0, 1, 1, 1, 1]\ntrain, test = labels[:8], labels[8:]\nprint(sum(labels) / len(labels))\nprint(sum(train) / len(train), sum(test) / len(test))',
        output: '0.4\n0.25 1.0',
        explanation:
          'Overall, 40% of rows are positive, but slicing sorted labels leaves 25% in training and 100% in testing. A stratified split would keep both near 40%.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'labels = [1, 0, 0, 1, 0, 0, 0, 0, 1, 0]\ntrain, test = labels[:5], labels[5:]\nprint(sum(labels) / len(labels))\nprint(sum(train) / len(train), sum(test) / len(test))',
          ['0.3\n0.4 0.2', '0.3\n0.3 0.3', '3\n2 1', '0.3\n0.2 0.4'],
          0,
          'There are 3 positives in 10 rows overall, 2 in the first five rows, and 1 in the last five.',
        ),
        choose(
          'Only 2% of transactions are fraud. A random 10% test split happens to contain 0.5% fraud. What would a stratified split change?',
          [
            'It would remove fraud rows from training',
            'It would keep about 2% fraud in each partition',
            'It would raise the fraud rate everywhere to 50%',
            'It would order the rows by time',
          ],
          1,
          'Stratifying samples each class separately, so both partitions keep the overall 2% share.',
        ),
        choose(
          'Which situation is stratification designed for?',
          [
            'Forecasting next quarter from past quarters',
            'Keeping each patient in a single partition',
            'Regression on a continuous target',
            'Independent rows in a classification task with uneven classes',
          ],
          3,
          'Stratification preserves class shares; it does not address time order or repeated entities.',
        ),
        predictOutput(
          'What does this program print?',
          'labels = [0, 0, 0, 0, 0, 0, 0, 0, 1, 1]\ntrain, test = labels[:8], labels[8:]\nprint(sum(train), sum(test))',
          ['2 0', '1 1', '0 2', '8 2'],
          2,
          'Both positives sit in the last two positions, so the training slice has none of them.',
        ),
      ],
    },
    {
      title: 'Keep every entity in one partition',
      explanation: [
        'When several rows belong to one entity, such as a patient, customer, or machine, a row-level split puts the same entity in both training and testing. The model can recognise that entity’s quirks instead of learning patterns that carry over to new entities.',
        'To estimate performance on new entities, choose which entities are held out, then send all of their rows to the test set. A stratified split does not prevent this leak, because it balances labels, not entities.',
      ],
      example: {
        code: 'rows = [{"patient": "A", "bp": 120}, {"patient": "B", "bp": 135},\n        {"patient": "A", "bp": 118}, {"patient": "C", "bp": 142}]\ntest_patients = ["A"]\ntrain, test = [], []\nfor row in rows:\n    if row["patient"] in test_patients:\n        test.append(row["bp"])\n    else:\n        train.append(row["bp"])\nprint(train)\nprint(test)',
        output: '[135, 142]\n[120, 118]',
        explanation:
          'Both of patient A’s readings go to the test set, so the model is tested on a patient it never saw.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'readings = [{"machine": "m1", "temp": 70}, {"machine": "m2", "temp": 64},\n            {"machine": "m1", "temp": 72}, {"machine": "m3", "temp": 80},\n            {"machine": "m2", "temp": 66}]\nheld_out = ["m2"]\ntrain, test = [], []\nfor r in readings:\n    if r["machine"] in held_out:\n        test.append(r["temp"])\n    else:\n        train.append(r["temp"])\nprint(len(train), len(test))\nprint(test)',
          ['4 1\n[64]', '3 2\n[64, 66]', '3 2\n[70, 72]', '2 3\n[64, 66]'],
          1,
          'Machine m2 has two readings, 64 and 66, and both go to the test set; the other three stay in training.',
        ),
        choose(
          'A speech model will serve new speakers. Each speaker has 50 clips. A random clip-level split scores 97%; a speaker-level split scores 81%. Which estimate matches deployment?',
          [
            '97%, because it tests on more clips',
            'The average of the two, 89%',
            '81%, because the test speakers were never seen in training',
            'Neither, because clip counts differ by speaker',
          ],
          2,
          'New users are new speakers, so only the speaker-level split measures that situation.',
        ),
        choose(
          'When is an ordinary row-level random split appropriate?',
          [
            'When rows are independent and no entity repeats',
            'Whenever the dataset is large',
            'When the same customer appears many times',
            'When forecasting next month from past months',
          ],
          0,
          'Row-level splitting assumes rows are independent; repeated entities or time order break that assumption.',
        ),
        choose(
          'You stratify a split by label, but each customer has many rows. Which problem remains?',
          [
            'The class shares differ between partitions',
            'The labels are no longer binary',
            'The model has too few features',
            'One customer can still appear in both partitions',
          ],
          3,
          'Stratification balances labels only; a customer’s rows can still be divided across training and testing.',
        ),
      ],
    },
  ],
  'ml-baselines': [
    {
      title: 'Predict the training mean as a regression baseline',
      explanation: [
        'A baseline is a simple prediction rule that any real model should beat. For regression, a common baseline predicts the mean of the training targets for every row, whatever its features.',
        'Compute that constant from training targets only. Using held-out targets would put the answers into the rule you are about to evaluate.',
      ],
      example: {
        code: 'train_minutes = [20, 30, 25, 45]\nbaseline = sum(train_minutes) / len(train_minutes)\ntest_rows = ["order 7", "order 8"]\npredictions = [baseline for row in test_rows]\nprint(baseline)\nprint(predictions)',
        output: '30.0\n[30.0, 30.0]',
        explanation:
          'The training mean is 120 / 4 = 30.0, and the baseline predicts that same value for every new row.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'train = [3, 5, 10]\ntest = [4, 100]\nbaseline = sum(train) / len(train)\nprint(baseline)',
          ['24.4', '52.0', '6', '6.0'],
          3,
          'Only the training targets are averaged: 18 / 3 = 6.0. Division with / gives a float.',
        ),
        choose(
          'Why compute the baseline constant from the training targets only?',
          [
            'Training targets are always more accurate',
            'Using test targets would leak the answers into the rule being evaluated',
            'Test targets cannot be averaged',
            'A baseline must use as few rows as possible',
          ],
          1,
          'The baseline is evaluated on the test rows, so it must not learn anything from their targets.',
        ),
        choose(
          'A regression model’s validation error is barely lower than that of predicting the training mean for every row. What does this suggest?',
          [
            'The model is certainly overfitting',
            'The baseline must have used test data',
            'The model has learned little beyond the average',
            'The error metric must be wrong',
          ],
          2,
          'Matching a constant predictor means the features add almost nothing to the prediction yet.',
        ),
        predictOutput(
          'What does this program print?',
          'train = [12, 18, 15]\nbaseline = sum(train) / len(train)\nnew_rows = [{"id": 1}, {"id": 2}]\nprint([baseline for row in new_rows])',
          ['[15.0, 15.0]', '[12, 18]', '[15, 15]', '15.0'],
          0,
          'The comprehension produces the same baseline value, 15.0, once per new row.',
        ),
      ],
    },
    {
      title: 'Predict the majority class as a classification baseline',
      explanation: [
        'For classification, the matching baseline predicts the most common training class for every row. Its fraction of correct predictions equals the share of that class in the evaluation data.',
        'When one class dominates, this baseline already scores high. A classifier that is right 94% of the time is not impressive if always predicting the common class is right 95% of the time.',
      ],
      example: {
        code: 'train_labels = [0, 1, 0, 0, 1, 0]\nif sum(train_labels) > len(train_labels) / 2:\n    majority = 1\nelse:\n    majority = 0\ntest_labels = [0, 0, 1, 0]\ncorrect = sum([1 for y in test_labels if y == majority])\nprint(majority)\nprint(correct / len(test_labels))',
        output: '0\n0.75',
        explanation:
          'Only 2 of 6 training labels are 1, so the majority class is 0. Predicting 0 for every test row is right for 3 of 4 rows.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'train = [1, 1, 0, 1, 1]\nif sum(train) > len(train) / 2:\n    majority = 1\nelse:\n    majority = 0\ntest = [1, 0, 1, 1, 0]\nhits = sum([1 for y in test if y == majority])\nprint(majority, hits / len(test))',
          ['1 0.8', '1 0.6', '0 0.4', '1 3'],
          1,
          'Four of five training labels are 1, so the baseline predicts 1; three of five test labels are 1.',
        ),
        choose(
          'In a dataset, 95% of emails are not spam. A spam filter labels 94% of emails correctly. How does it compare with a majority-class baseline?',
          [
            'It is excellent, because 94% is high',
            'It ties the baseline',
            'It does worse than always predicting "not spam"',
            'A baseline cannot be computed without a model',
          ],
          2,
          'Always predicting the common class is correct 95% of the time, which beats the filter.',
        ),
        choose(
          'What does a majority-class baseline predict for a new row?',
          [
            'The class of the most similar training row',
            'A random class each time',
            'The most common class among the test labels',
            'The most common class among the training labels',
          ],
          3,
          'It ignores the features and always predicts the training majority; the test labels stay unused.',
        ),
        predictOutput(
          'What does this program print?',
          'majority = 0\nvalidation = [1, 0, 0, 0, 0, 1, 0, 0]\ncorrect = sum([1 for y in validation if y == majority])\nprint(correct, correct / len(validation))',
          ['6 0.75', '2 0.25', '6 0.6', '8 1.0'],
          0,
          'Six validation labels equal the predicted class 0, and 6 / 8 = 0.75.',
        ),
      ],
    },
    {
      title: 'Measure error with MSE and RMSE',
      explanation: [
        'A residual is actual minus predicted. Mean squared error (MSE) averages the squared residuals, so positive and negative errors cannot cancel and large errors count heavily. Its unit is the target unit squared.',
        'Root mean squared error (RMSE) is the square root of MSE, written mse ** 0.5. It is back in the target’s own unit, which makes it easier to read: an RMSE of 4 minutes is a typical error of a few minutes.',
      ],
      example: {
        code: 'residuals = [3, 0, -4, 0]\nmse = sum([r ** 2 for r in residuals]) / len(residuals)\nrmse = mse ** 0.5\nprint(mse)\nprint(rmse)',
        output: '6.25\n2.5',
        explanation:
          'The squares are 9, 0, 16, and 0, which average to 25 / 4 = 6.25. Its square root is 2.5.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'actual = [10, 12, 9]\nprediction = 10\nmse = sum([(a - prediction) ** 2 for a in actual]) / len(actual)\nprint(round(mse, 3))',
          ['0.333', '1.0', '1.667', '5'],
          2,
          'The residuals are 0, 2, and -1; their squares sum to 5, and 5 / 3 rounds to 1.667.',
        ),
        predictOutput(
          'What does this program print?',
          'residuals = [5, -5, 5, -5]\nmse = sum([r ** 2 for r in residuals]) / len(residuals)\nprint(mse, mse ** 0.5)',
          ['0.0 0.0', '25.0 25.0', '100 10.0', '25.0 5.0'],
          3,
          'Squaring removes the signs, so each residual contributes 25; the mean is 25.0 and its square root is 5.0.',
        ),
        choose(
          'Targets are house prices in dollars. In what unit is the MSE?',
          ['Dollars', 'Squared dollars', 'Percent', 'It has no unit'],
          1,
          'MSE averages squared dollar errors; taking the square root (RMSE) returns to dollars.',
        ),
        choose(
          'Two models have residuals [1, 1, 1, 1] and [0, 0, 0, 4]. Their average absolute residual is 1 in both cases. Which has the larger MSE?',
          [
            'The second model',
            'The first model',
            'They are equal',
            'MSE cannot compare them',
          ],
          0,
          'The first MSE is 4 / 4 = 1, the second is 16 / 4 = 4: squaring makes the single large error dominate.',
        ),
      ],
    },
    {
      title: 'Compare a model with its baseline fairly',
      explanation: [
        'A comparison means something only when the model and the baseline are scored on the same evaluation rows with the same metric. Then the difference in error tells you how much the model’s features and fitting actually help.',
        'Lower error is better. If the model does not clearly beat the baseline, its extra complexity has not earned its place yet.',
      ],
      example: {
        code: 'baseline_residuals = [-10, 5, 20, -15]\nmodel_residuals = [-2, 3, -4, 1]\nbaseline_mse = sum([r ** 2 for r in baseline_residuals]) / 4\nmodel_mse = sum([r ** 2 for r in model_residuals]) / 4\nprint(baseline_mse, model_mse)',
        output: '187.5 7.5',
        explanation:
          'Both use the same four validation rows and the same metric, so the model’s much lower MSE is a fair improvement over the baseline.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'baseline_residuals = [4, -4, 2, -2]\nmodel_residuals = [3, -1, 1, -3]\nbaseline_mse = sum([r ** 2 for r in baseline_residuals]) / 4\nmodel_mse = sum([r ** 2 for r in model_residuals]) / 4\nprint(baseline_mse - model_mse)',
          ['-5.0', '0.0', '5.0', '20.0'],
          2,
          'The baseline MSE is 40 / 4 = 10.0 and the model MSE is 20 / 4 = 5.0, so the model is 5.0 lower.',
        ),
        choose(
          'A model has an RMSE of 8 minutes on the validation set. The training-mean baseline has an RMSE of 11 minutes on the test set. What is wrong with concluding that the model is better?',
          [
            'Nothing; 8 is smaller than 11',
            'RMSE cannot be measured in minutes',
            'A baseline is never evaluated with RMSE',
            'The errors come from different rows, so they are not comparable',
          ],
          3,
          'A fair comparison scores both rules on the same rows; otherwise the difference may come from the rows, not the model.',
        ),
        choose(
          'Which setup gives a fair model-versus-baseline comparison?',
          [
            'MSE for the model and RMSE for the baseline',
            'The same metric on the same evaluation rows for both',
            'Training error for the model, test error for the baseline',
            'Whichever metric makes the model look better',
          ],
          1,
          'Only identical rows and an identical metric isolate the effect of the model itself.',
        ),
        predictOutput(
          'What does this program print?',
          'baseline_mse = 49.0\nmodel_mse = 36.0\nprint(baseline_mse ** 0.5 - model_mse ** 0.5)',
          ['1.0', '13.0', '-1.0', '3.6'],
          0,
          'The RMSEs are 7.0 and 6.0, so the model’s typical error is 1.0 target unit smaller.',
        ),
      ],
    },
  ],
  'ml-preprocessing': [
    {
      title: 'Standardize with training statistics',
      explanation: [
        'Standardizing rescales a feature to z = (x - mean) / std, so features measured in different units become comparable. With NumPy, train.mean() and train.std() give the mean and the population standard deviation.',
        'The mean and standard deviation come from the training rows only, and every later row is transformed with those same two numbers. A new value outside the training range simply gets a large z value.',
      ],
      example: {
        code: 'import numpy as np\ntrain = np.array([2.0, 4.0, 4.0, 4.0, 5.0, 5.0, 7.0, 9.0])\nmean, std = train.mean(), train.std()\nprint(mean, std)\nprint(((np.array([9.0, 1.0]) - mean) / std).tolist())',
        output: '5.0 2.0\n[2.0, -2.0]',
        explanation:
          'The training mean is 5 and the standard deviation is 2. A new 9 lies two standard deviations above the mean, and 1 lies two below.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'import numpy as np\ntrain = np.array([10.0, 14.0])\ntest = np.array([16.0, 12.0])\nmean, std = train.mean(), train.std()\nprint(((test - mean) / std).tolist())',
          ['[1.0, -1.0]', '[2.0, 0.0]', '[4.0, 0.0]', '[2.0, 1.0]'],
          1,
          'The training mean is 12 and the standard deviation is 2, so 16 becomes 2.0 and 12 becomes 0.0.',
        ),
        choose(
          'A feature’s mean in the test set differs from its training mean. Which statistics should standardize the test rows?',
          [
            'The test mean and standard deviation',
            'The average of the training and test statistics',
            'No statistics; test rows stay unscaled',
            'The training mean and standard deviation',
          ],
          3,
          'The transformation is part of the trained model, so new rows reuse the training statistics.',
        ),
        choose(
          'Why can computing scaling statistics on all rows before splitting inflate a test score?',
          [
            'It changes the target labels',
            'It removes outliers from the training set',
            'The test rows help shape the transformation the model trains with',
            'It makes the test set smaller',
          ],
          2,
          'The test rows leak their distribution into training through the shared mean and standard deviation.',
        ),
        predictOutput(
          'What does this program print?',
          'import numpy as np\ntrain = np.array([0.0, 4.0])\nmean, std = train.mean(), train.std()\nprint(((np.array([10.0]) - mean) / std).tolist())',
          ['[4.0]', '[1.0]', '[2.5]', '[5.0]'],
          0,
          'The training mean is 2 and the standard deviation is 2, so (10 - 2) / 2 = 4.0. Standardized values are not limited to -1 to 1.',
        ),
      ],
    },
    {
      title: 'Fit learns statistics; transform applies them',
      explanation: [
        'scikit-learn transformers such as StandardScaler take a two-dimensional table: one row per example and one column per feature. fit(X) learns statistics from X and stores them in attributes ending in an underscore, such as mean_ and scale_. transform(X) applies the stored statistics without changing them.',
        'fit_transform(X) fits and transforms the same rows in one call; use it on training data only. Each column gets its own mean and scale.',
      ],
      example: {
        code: 'from sklearn.preprocessing import StandardScaler\nscaler = StandardScaler()\nscaler.fit([[1.0, 100.0], [3.0, 300.0]])\nprint(scaler.mean_.tolist())\nprint(scaler.transform([[2.0, 500.0]]).tolist())',
        output: '[2.0, 200.0]\n[[0.0, 3.0]]',
        explanation:
          'Each column has its own mean (2 and 200) and scale (1 and 100). The new row becomes 0.0 in the first column and 3.0 in the second.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'from sklearn.preprocessing import StandardScaler\nscaler = StandardScaler().fit([[0.0], [10.0]])\nprint(scaler.mean_.tolist(), scaler.scale_.tolist())\nprint(scaler.transform([[20.0], [5.0]]).tolist())',
          [
            '[12.5] [7.5]\n[[1.0], [-1.0]]',
            '[5.0] [5.0]\n[[1.0], [-1.0]]',
            '[5.0] [5.0]\n[[4.0], [1.0]]',
            '[5.0] [5.0]\n[[3.0], [0.0]]',
          ],
          3,
          'fit learns mean 5 and scale 5 from the training rows; transform reuses them, so 20 becomes 3.0 and 5 becomes 0.0.',
        ),
        predictOutput(
          'What does this program print?',
          'from sklearn.preprocessing import StandardScaler\ntrain = [[1.0], [2.0], [3.0]]\ntest = [[10.0], [20.0]]\nscaler = StandardScaler()\nscaler.fit_transform(train)\nscaler.transform(test)\nprint(int(scaler.n_samples_seen_))',
          ['5', '2', '3', '6'],
          2,
          'Only fit_transform learned from rows; transform applies the statistics without counting the test rows.',
        ),
        choose(
          'You call scaler.fit(test_X) right before scaler.transform(test_X). What goes wrong?',
          [
            'The test rows now set their own scaling, leaking their distribution',
            'transform raises an error after a second fit',
            'The training rows are deleted',
            'Nothing; fitting before every transform is required',
          ],
          0,
          'Refitting replaces the training statistics with ones learned from the test rows.',
        ),
        choose(
          'A StandardScaler is fitted on a table with 3 feature columns and 50 rows. How many values does mean_ hold?',
          ['1', '50', '3', '150'],
          2,
          'StandardScaler learns one mean per column, so it stores three means.',
        ),
      ],
    },
    {
      title: 'Learn imputation and encoding from training rows',
      explanation: [
        'Imputation fills missing values. SimpleImputer(strategy="mean") or strategy="median" learns one fill value per column from the training rows and stores it in statistics_; transform replaces each NaN with it.',
        'OneHotEncoder learns the list of categories from the training rows and creates one 0/1 column per category. A category that never appeared in training needs a planned policy: handle_unknown="ignore" encodes it as all zeros. With sparse_output=False the result is an ordinary array.',
      ],
      example: {
        code: 'import numpy as np\nfrom sklearn.impute import SimpleImputer\nfrom sklearn.preprocessing import OneHotEncoder\nimputer = SimpleImputer(strategy="mean").fit([[2.0], [np.nan], [6.0]])\nprint(imputer.transform([[np.nan], [9.0]]).tolist())\nencoder = OneHotEncoder(handle_unknown="ignore", sparse_output=False)\nencoder.fit([["red"], ["blue"], ["red"]])\nprint(encoder.transform([["blue"], ["green"]]).tolist())',
        output: '[[4.0], [9.0]]\n[[1.0, 0.0], [0.0, 0.0]]',
        explanation:
          'The training mean, 4.0, fills the missing value. The encoder learned blue and red, so blue is [1, 0] and the unseen green becomes all zeros.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'import numpy as np\nfrom sklearn.impute import SimpleImputer\nimputer = SimpleImputer(strategy="median").fit([[1.0], [np.nan], [3.0], [10.0]])\nprint(imputer.statistics_.tolist())\nprint(imputer.transform([[np.nan], [7.0]]).tolist())',
          [
            '[3.0]\n[[3.0], [7.0]]',
            '[4.667]\n[[4.667], [7.0]]',
            '[3.0]\n[[3.0], [3.0]]',
            '[7.0]\n[[7.0], [7.0]]',
          ],
          0,
          'The median of the observed training values 1, 3, and 10 is 3.0; only the missing entry is replaced.',
        ),
        predictOutput(
          'What does this program print?',
          'import pandas as pd\ntrain = pd.Series(["bus", "car", "bus"])\ntest = pd.Series(["train", "car"])\nprint(pd.get_dummies(train, dtype=int).columns.tolist())\nprint(pd.get_dummies(test, dtype=int).columns.tolist())',
          [
            "['bus', 'car']\n['bus', 'car']",
            "['bus', 'car', 'train']\n['bus', 'car', 'train']",
            "['bus', 'car']\n['car', 'train']",
            "['bus', 'car']\n['train', 'car']",
          ],
          2,
          'get_dummies builds columns from whatever values it sees, so the two tables disagree. A fitted encoder fixes the column list from training data.',
        ),
        choose(
          'Which value should fill missing incomes in the test set?',
          [
            'The median income of the test rows',
            'Zero, in every case',
            'The income of the previous row',
            'The median income learned from the training rows',
          ],
          3,
          'Fill values are learned statistics, so they come from training rows like every other preprocessing step.',
        ),
        choose(
          'An encoder learned the categories bus, car, and train. In production a row arrives with "scooter". Which preparation is sound?',
          [
            'Refit the encoder on the production row',
            'Decide in advance how unknown categories are encoded, and test that path',
            'Map scooter to the alphabetically closest category',
            'Assume new categories cannot appear',
          ],
          1,
          'A planned policy, such as encoding unknown categories as all zeros, keeps predictions working without refitting on new data.',
        ),
      ],
    },
    {
      title: 'Chain fitted steps in a pipeline',
      explanation: [
        'make_pipeline(step1, step2, ...) joins preprocessing steps into one object. fit runs the steps in order, and each step learns from the output of the step before it. transform then applies every stored statistic in the same order.',
        'Fitting the pipeline on training rows only keeps every learned statistic training-only. When you evaluate on several different train/validation splits, refit the whole pipeline on each split’s training rows so no held-out rows shape the preprocessing.',
      ],
      example: {
        code: 'import numpy as np\nfrom sklearn.pipeline import make_pipeline\nfrom sklearn.impute import SimpleImputer\nfrom sklearn.preprocessing import StandardScaler\nprep = make_pipeline(SimpleImputer(strategy="mean"), StandardScaler())\nprep.fit([[0.0], [np.nan], [6.0]])\nprint(np.round(prep.transform([[np.nan], [9.0]]), 3).tolist())',
        output: '[[0.0], [2.449]]',
        explanation:
          'The imputer learns mean 3 and fills the gap, so the scaler learns from [0, 3, 6]. A new NaN becomes 3, which is 0.0 after scaling; 9 becomes 6 / 2.449 ≈ 2.449.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'import numpy as np\nfrom sklearn.pipeline import make_pipeline\nfrom sklearn.impute import SimpleImputer\nfrom sklearn.preprocessing import StandardScaler\nprep = make_pipeline(SimpleImputer(strategy="mean"), StandardScaler())\nprep.fit([[1.0], [np.nan], [3.0]])\nprint(np.round(prep.transform([[np.nan], [3.0]]), 3).tolist())',
          [
            '[[nan], [1.225]]',
            '[[0.0], [1.0]]',
            '[[-1.225], [1.225]]',
            '[[0.0], [1.225]]',
          ],
          3,
          'The missing value is filled with the training mean 2, which scales to 0.0; 3 is one unit above that mean, divided by the training standard deviation 0.816.',
        ),
        choose(
          'What does prep.transform(new_rows) do on a fitted pipeline?',
          [
            'Refits every step on new_rows first',
            'Fits only the last step',
            'Applies each step’s stored statistics in order',
            'Skips steps when new_rows has no missing values',
          ],
          2,
          'transform never learns; it passes the rows through each fitted step in sequence.',
        ),
        choose(
          'In a pipeline SimpleImputer → StandardScaler, which data does the scaler learn its mean from during fit?',
          [
            'The training rows after the imputer filled their gaps',
            'The raw training rows, NaN included',
            'The rows passed to transform later',
            'Only the imputer’s statistics_',
          ],
          0,
          'Each step is fitted on the output of the previous step, so the scaler sees the imputed training rows.',
        ),
        choose(
          'You evaluate a pipeline on five different train/validation splits. How should the preprocessing be fitted?',
          [
            'Once on all rows before splitting',
            'Refit the whole pipeline on each split’s training rows',
            'On each split’s validation rows',
            'Not at all; use raw values',
          ],
          1,
          'Each split must learn its preprocessing without its own held-out rows, so the pipeline is refit per split.',
        ),
      ],
    },
  ],
  'ml-linear-regression': [
    {
      title: 'Predict with an intercept plus weighted features',
      explanation: [
        'A linear regression prediction is an intercept b plus each feature times its weight: b + w1*x1 + w2*x2 + .... The weighted sum is the dot product of the weight vector and the feature vector; with NumPy arrays, (w * x).sum() computes it, and X @ w computes it for every row of a feature matrix X at once.',
        'The model is linear in its weights, not necessarily in the raw input. Adding a column that holds x squared still gives a linear model, because the prediction remains a weighted sum of the columns.',
      ],
      example: {
        code: 'import numpy as np\nw = np.array([40.0, 15.0])\nb = 50.0\nx = np.array([3.0, 2.0])\nprint(b + (w * x).sum())\nX = np.array([[3.0, 2.0], [1.0, 0.0]])\nprint((X @ w + b).tolist())',
        output: '200.0\n[200.0, 90.0]',
        explanation:
          'For one row, 50 + 40*3 + 15*2 = 200. X @ w computes each row’s weighted sum, and adding b shifts every prediction.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'import numpy as np\nw = np.array([3.0, -2.0])\nb = 10.0\nx = np.array([4.0, 5.0])\nprint(b + (w * x).sum())',
          ['32.0', '2.0', '12.0', '-12.0'],
          2,
          '10 + 3*4 + (-2)*5 = 10 + 12 - 10 = 12.0. The negative weight lowers the prediction.',
        ),
        predictOutput(
          'What does this program print?',
          'import numpy as np\nX = np.array([[1.0, 0.0], [2.0, 1.0], [0.0, 3.0]])\nw = np.array([5.0, 2.0])\nb = 1.0\nprint((X @ w + b).tolist())',
          [
            '[5.0, 12.0, 6.0]',
            '[6.0, 12.0, 7.0]',
            '[6.0, 13.0, 7.0]',
            '[6.0, 13.0]',
          ],
          2,
          'Each row gets its own weighted sum (5, 12, 6), and the intercept adds 1 to each.',
        ),
        choose(
          'A model predicts price = 20 + 3*area - 5*age. If age rises by 2 while area stays the same, how does the prediction change?',
          [
            'It rises by 10',
            'It falls by 5',
            'It falls by 2',
            'It falls by 10',
          ],
          3,
          'Only the age term changes: -5 times an increase of 2 is -10.',
        ),
        choose(
          'Which formula is still a linear regression model with learned weights b, w1, and w2?',
          ['b + w1*x + w2*x**2', 'b + x**w1', 'b + w1*w2*x', 'b / (w1*x)'],
          0,
          'It is a weighted sum of the columns x and x**2, so it is linear in the weights even though it curves in x.',
        ),
      ],
    },
    {
      title: 'Choose the weights that minimize squared error',
      explanation: [
        'Least squares picks the intercept and weights that make the sum of squared residuals (SSE) on the training data as small as possible. Any candidate line can be scored by its SSE, and the least-squares line is the one with the smallest score.',
        'Residuals can sum to zero even for a poor line, because positive and negative errors cancel; squaring prevents that. Predicting a constant is the special case with every weight 0, and the best constant is the training mean.',
      ],
      example: {
        code: 'import numpy as np\nx = np.array([0.0, 1.0, 2.0, 3.0])\ny = np.array([1.0, 3.0, 4.0, 7.0])\n\ndef sse(b, w):\n    residuals = y - (b + w * x)\n    return float((residuals ** 2).sum())\n\nprint(sse(1.0, 2.0))\nprint(sse(1.0, 1.5))',
        output: '1.0\n2.5',
        explanation:
          'The line 1 + 2x misses only one point, by 1. The line 1 + 1.5x misses two points, by 0.5 and 1.5, so its squared error is larger.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'import numpy as np\nx = np.array([1.0, 2.0, 3.0])\ny = np.array([2.0, 4.0, 7.0])\n\ndef sse(b, w):\n    residuals = y - (b + w * x)\n    return float((residuals ** 2).sum())\n\nprint(sse(0.0, 2.0), sse(-1.0, 2.5))',
          ['1.0 1.0', '0.5 1.0', '1.0 0.25', '1.0 0.5'],
          3,
          'The first line misses by 0, 0, and 1; the second by 0.5, 0, and 0.5, whose squares sum to 0.5. Their absolute errors tie, but the squared errors do not.',
        ),
        choose(
          'What does ordinary least squares minimize on the training data?',
          [
            'The sum of the residuals',
            'The largest single residual',
            'The sum of squared residuals',
            'The number of features',
          ],
          2,
          'Squared residuals cannot cancel, and their total is what least squares makes as small as possible.',
        ),
        choose(
          'A line has residuals -3 and 3 on two training points, so its residuals sum to 0. Is it the least-squares line?',
          [
            'Yes; a zero total residual means a perfect fit',
            'Not necessarily; another line can have a smaller sum of squared residuals',
            'Yes; residuals sum to zero only at the optimum',
            'It cannot be judged without test data',
          ],
          1,
          'Its SSE is 18. A line through both points would have SSE 0, so zero total residual is not enough.',
        ),
        predictOutput(
          'What does this program print?',
          'import numpy as np\ny = np.array([2.0, 6.0, 7.0])\nfor b in [4.0, 5.0, 6.0]:\n    print(b, float(((y - b) ** 2).sum()))',
          [
            '4.0 17.0\n5.0 14.0\n6.0 17.0',
            '4.0 3.0\n5.0 0.0\n6.0 -3.0',
            '4.0 17.0\n5.0 17.0\n6.0 17.0',
            '4.0 9.0\n5.0 14.0\n6.0 17.0',
          ],
          0,
          'The constant 5, which is the mean of y, gives the smallest squared error: 9 + 1 + 4 = 14.',
        ),
      ],
    },
    {
      title: 'Fit LinearRegression with a two-dimensional X',
      explanation: [
        'scikit-learn expects the features as a two-dimensional table X with one row per example and one column per feature, and the targets as a one-dimensional y. A single feature still needs one column: [[1.0], [2.0]], or x.reshape(-1, 1) for a NumPy array.',
        'LinearRegression().fit(X, y) finds the least-squares weights and returns the fitted model. It stores the intercept in intercept_ and one weight per feature in coef_. predict(X_new) applies them to new rows.',
      ],
      example: {
        code: 'from sklearn.linear_model import LinearRegression\nX = [[1.0], [2.0], [3.0]]\ny = [5.0, 7.0, 9.0]\nmodel = LinearRegression().fit(X, y)\nprint(round(float(model.intercept_), 3), model.coef_.round(3).tolist())\nprint(model.predict([[10.0]]).round(3).tolist())',
        output: '3.0 [2.0]\n[23.0]',
        explanation:
          'The points lie on y = 3 + 2x, so the fitted intercept is 3 and the one coefficient is 2. At x = 10 the model predicts 23.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'from sklearn.linear_model import LinearRegression\nX = [[1, 0], [0, 1], [1, 1], [2, 1]]\ny = [3, 4, 6, 8]\nmodel = LinearRegression().fit(X, y)\nprint(model.coef_.round(3).tolist(), round(float(model.intercept_), 3))',
          [
            '[3.0, 2.0] 1.0',
            '[2.0, 3.0] 1.0',
            '[2.0, 3.0] 0.0',
            '[1.0, 2.0] 3.0',
          ],
          1,
          'Every row satisfies y = 1 + 2*x1 + 3*x2; coef_ lists the weights in column order.',
        ),
        predictOutput(
          'What does this program print?',
          'import numpy as np\nx = np.array([4.0, 5.0, 6.0])\nX = x.reshape(-1, 1)\nprint(x.shape, X.shape)',
          ['(3,) (1, 3)', '(3, 1) (3,)', '(1, 3) (3, 1)', '(3,) (3, 1)'],
          3,
          'reshape(-1, 1) keeps three rows and makes one column, the shape scikit-learn expects for one feature.',
        ),
        choose(
          'X has 200 rows and 4 features. What shape does model.coef_ have after fitting LinearRegression?',
          ['(200,)', '(200, 4)', '(4,)', '(1,)'],
          2,
          'There is one weight per feature column, regardless of the number of rows.',
        ),
        choose(
          'Why does LinearRegression().fit([1.0, 2.0, 3.0], y) raise an error?',
          [
            'X must be two-dimensional, with one row per example',
            'y must be two-dimensional',
            'Linear regression needs at least ten rows',
            'The targets must be integers',
          ],
          0,
          'A flat list is ambiguous; scikit-learn needs a table of rows and feature columns, such as [[1.0], [2.0], [3.0]].',
        ),
      ],
    },
    {
      title: 'Read a coefficient as a held-fixed association',
      explanation: [
        'A coefficient is the change in the prediction when its feature rises by one unit and every other feature stays the same. Its size depends on the unit: measuring distance in metres instead of kilometres divides the coefficient by 1000 without changing any prediction.',
        'A coefficient describes an association in this model and data, not a cause. Other variables can drive both a feature and the target, so a large coefficient is not evidence that changing the feature would change the outcome.',
      ],
      example: {
        code: 'from sklearn.linear_model import LinearRegression\nkm = [[1.0], [2.0], [4.0]]\nmeters = [[1000.0], [2000.0], [4000.0]]\nminutes = [12.0, 15.0, 21.0]\nper_km = LinearRegression().fit(km, minutes).coef_[0]\nper_m = LinearRegression().fit(meters, minutes).coef_[0]\nprint(round(float(per_km), 3), round(float(per_m), 5))',
        output: '3.0 0.003',
        explanation:
          'Each extra kilometre adds 3 minutes, which is 0.003 minutes per metre. The relationship is the same; only the unit changed.',
      },
      questions: [
        choose(
          'In price = 50 + 4*area_m2 + 10*garage, where garage is 1 or 0, what does the 10 mean?',
          [
            'Adding a garage to any home causes a price rise of exactly 10',
            'Garages explain 10% of the price',
            'For homes of equal area, the model predicts 10 more when there is a garage',
            'Ten homes in the data have a garage',
          ],
          2,
          'A coefficient compares predictions with the other features held fixed; it does not establish a causal effect.',
        ),
        choose(
          'A model predicting daily sunburn cases gives ice-cream sales a large positive coefficient. What does this show?',
          [
            'The two are associated in the data, for example because both rise on sunny days',
            'Eating ice cream causes sunburn',
            'The coefficient must be a calculation error',
            'Sunburn causes people to buy ice cream',
          ],
          0,
          'A shared cause such as sunshine creates the association; the coefficient alone cannot separate cause from correlation.',
        ),
        predictOutput(
          'What does this program print?',
          'from sklearn.linear_model import LinearRegression\nhours = [[1.0], [2.0], [3.0]]\nminutes = [[60.0], [120.0], [180.0]]\ncost = [30.0, 50.0, 70.0]\na = LinearRegression().fit(hours, cost).coef_[0]\nb = LinearRegression().fit(minutes, cost).coef_[0]\nprint(round(float(a), 3), round(float(b), 3))',
          ['20.0 20.0', '20.0 0.333', '20.0 1200.0', '0.333 20.0'],
          1,
          'Cost rises 20 per hour, which is 20 / 60 ≈ 0.333 per minute.',
        ),
        predictOutput(
          'The second column holds x squared. What does this program print?',
          'from sklearn.linear_model import LinearRegression\nX = [[0.0, 0.0], [1.0, 1.0], [2.0, 4.0], [3.0, 9.0]]\ny = [1.0, 2.0, 5.0, 10.0]\nmodel = LinearRegression().fit(X, y)\nprint(model.predict([[4.0, 16.0]]).round(3).tolist())',
          ['[13.0]', '[16.0]', '[10.0]', '[17.0]'],
          3,
          'The data follow y = 1 + 0*x + 1*x**2, a weighted sum of the two columns, so the model predicts 1 + 16 = 17.',
        ),
      ],
    },
  ],
  'ml-gradient-descent': [
    {
      title: 'Step against the gradient',
      explanation: [
        'Gradient descent improves a parameter by moving it opposite to the loss gradient: w = w - learning_rate * gradient. A positive gradient means the loss rises as w grows, so w moves down; a negative gradient moves w up.',
        'With several parameters, each one moves by its own gradient entry times the same learning rate. For the loss (w - t)**2 the gradient is 2*(w - t).',
      ],
      example: {
        code: 'w = 4.0\ngradient = 2 * (w - 1)\nlearning_rate = 0.25\nw = w - learning_rate * gradient\nprint(gradient, w)',
        output: '6.0 2.5',
        explanation:
          'For the loss (w - 1)**2 at w = 4, the gradient is 6, so the step subtracts 0.25 * 6 = 1.5 and w moves toward 1.',
      },
      questions: [
        predictOutput(
          'The loss is (w - 3)**2. What does this program print?',
          'w = 0.0\ngradient = 2 * (w - 3)\nw = w - 0.1 * gradient\nprint(round(w, 2))',
          ['-0.6', '6.0', '0.6', '3.0'],
          2,
          'The gradient is -6, and subtracting 0.1 * (-6) raises w to 0.6, toward the minimum at 3.',
        ),
        choose(
          'The gradient of the loss at the current w is -8. Which way does one gradient-descent step move w?',
          [
            'Down, toward smaller w',
            'Nowhere until the gradient becomes positive',
            'Directly to the minimum',
            'Up, because the update subtracts a negative number',
          ],
          3,
          'w - rate * (-8) adds 8 * rate, so w increases, which is the direction in which the loss falls.',
        ),
        choose(
          'Which update is gradient descent with learning rate lr?',
          [
            'w = w + lr * gradient',
            'w = w - lr * gradient',
            'w = lr * gradient',
            'w = w - gradient / lr',
          ],
          1,
          'Subtracting a small multiple of the gradient moves w in the direction of decreasing loss.',
        ),
        predictOutput(
          'What does this program print?',
          'weights = [1.0, -2.0]\ngradient = [4.0, -6.0]\nlr = 0.5\nweights = [weights[i] - lr * gradient[i] for i in range(2)]\nprint(weights)',
          ['[-1.0, 1.0]', '[3.0, -5.0]', '[2.0, -3.0]', '[-1.0, -5.0]'],
          0,
          'Each weight moves by its own gradient: 1 - 0.5*4 = -1 and -2 - 0.5*(-6) = 1.',
        ),
      ],
    },
    {
      title: 'Pick a learning rate that converges',
      explanation: [
        'Repeating the update moves w step by step toward a minimum. The learning rate sets the step size. Too small, and progress is slow. Too large, and a step jumps past the minimum to the other side.',
        'For the loss (w - t)**2, each step multiplies the distance to t by (1 - 2*lr). With lr = 0.5 one step lands exactly on t; between 0.5 and 1 the steps overshoot but shrink; above 1 every step overshoots further, so training diverges.',
      ],
      example: {
        code: 'def run(lr, steps):\n    w = 0.0\n    for step in range(steps):\n        w = w - lr * 2 * (w - 10)\n    return round(w, 3)\n\nprint(run(0.1, 3))\nprint(run(0.5, 3))\nprint(run(1.1, 3))',
        output: '4.88\n10.0\n27.28',
        explanation:
          'With 0.1, the distance shrinks by 20% per step. With 0.5, the first step lands on 10. With 1.1, each step overshoots further, so w moves away from 10.',
      },
      questions: [
        predictOutput(
          'The loss is (w - 8)**2. What does this program print?',
          'w = 0.0\nfor step in range(2):\n    w = w - 0.25 * 2 * (w - 8)\nprint(w)',
          ['4.0', '8.0', '6.0', '2.0'],
          2,
          'Each step halves the distance to 8: it goes from 8 to 4 to 2, so w ends at 6.0.',
        ),
        predictOutput(
          'The loss is (w - 4)**2. What does this program print?',
          'w = 0.0\nfor step in range(2):\n    w = w - 0.75 * 2 * (w - 4)\n    print(w)',
          ['3.0\n3.75', '6.0\n3.0', '6.0\n8.0', '6.0\n6.0'],
          1,
          'The first step jumps past 4 to 6.0; the next jumps back to 3.0. The steps overshoot, but the distance shrinks.',
        ),
        choose(
          'Training loss grows after every update. What should you try first?',
          [
            'Train for more steps',
            'Raise the learning rate',
            'Lower the learning rate',
            'Add more features',
          ],
          2,
          'A rising loss usually means each step overshoots the minimum, so smaller steps are needed.',
        ),
        choose(
          'Loss falls steadily but extremely slowly over 10,000 steps. Which change most directly speeds up training, provided the loss stays stable?',
          [
            'Evaluate on the test set more often',
            'Reverse the sign of the update',
            'Start every run from w = 0',
            'Use a moderately larger learning rate',
          ],
          3,
          'Tiny steps make slow progress; a larger rate covers more distance per step until it starts to overshoot.',
        ),
      ],
    },
    {
      title: 'Average the gradient over a batch of examples',
      explanation: [
        'For a model that predicts w*x with mean squared error, each example contributes the gradient 2*(w*x - y)*x, and the loss gradient is their average. Batch gradient descent averages over every training example for each update.',
        'Stochastic gradient descent updates after a single example, and mini-batch gradient descent after a small group. Smaller batches make cheaper but noisier gradient estimates, because each one depends on which examples were picked.',
      ],
      example: {
        code: 'xs = [1.0, 2.0, 3.0]\nys = [2.0, 4.0, 6.0]\nw = 1.0\ngrads = [2 * (w * xs[i] - ys[i]) * xs[i] for i in range(3)]\nprint(grads)\nprint(round(sum(grads) / len(grads), 3))',
        output: '[-2.0, -8.0, -18.0]\n-9.333',
        explanation:
          'Each example says w is too small, by different amounts. The batch gradient is their average, -28 / 3.',
      },
      questions: [
        predictOutput(
          'Only the first two examples form this mini-batch. What does this program print?',
          'xs = [1.0, 2.0, 3.0, 4.0]\nys = [3.0, 6.0, 9.0, 12.0]\nw = 2.0\nbatch = [0, 1]\ngrads = [2 * (w * xs[i] - ys[i]) * xs[i] for i in batch]\nprint(sum(grads) / len(grads))',
          ['-15.0', '-10.0', '5.0', '-5.0'],
          3,
          'The two gradients are -2 and -8, whose average is -5.0. The full batch would average all four examples instead.',
        ),
        choose(
          'Each update uses 32 randomly chosen rows from a 50,000-row training set. Which method is this?',
          [
            'Batch gradient descent',
            'Mini-batch gradient descent',
            'Stochastic gradient descent with one row',
            'Least squares solved in one step',
          ],
          1,
          'A small subset per update is a mini-batch; batch descent would use all 50,000 rows.',
        ),
        choose(
          'Why does the loss curve of one-row stochastic updates look noisier than that of batch updates?',
          [
            'Each gradient comes from a single row, so it varies from step to step',
            'Stochastic updates use a larger learning rate by definition',
            'Stochastic updates skip the gradient calculation',
            'Stochastic updates are evaluated on the test set',
          ],
          0,
          'A one-row gradient is a rough estimate of the average gradient, so successive steps point in varying directions.',
        ),
        predictOutput(
          'This loop makes one stochastic update per example. What does it print?',
          'xs = [1.0, 2.0]\nys = [2.0, 4.0]\nw = 0.0\nfor i in range(2):\n    w = w - 0.1 * 2 * (w * xs[i] - ys[i]) * xs[i]\n    print(round(w, 3))',
          ['0.4\n2.0', '1.0\n1.0', '0.4\n1.68', '0.4\n0.8'],
          2,
          'The first update gives 0.4. The second gradient is computed at w = 0.4: 2*(0.8 - 4)*2 = -12.8, so w rises by 1.28.',
        ),
      ],
    },
    {
      title: 'Fit a line by updating both parameters together',
      explanation: [
        'For predictions b + w*x and mean squared error, the gradient for b averages 2*(prediction - y), and the gradient for w averages 2*(prediction - y)*x. Compute both from the current b and w, then update both, and repeat.',
        'When both gradients reach zero, the parameters sit at a flat point. For the mean squared error of a linear model that point is the least-squares solution. A loss with several valleys can also be flat at a valley that is not the lowest one, so a zero gradient alone does not prove the best possible fit.',
      ],
      example: {
        code: 'xs = [0.0, 1.0, 2.0]\nys = [1.0, 3.0, 5.0]\nb, w = 0.0, 0.0\nfor step in range(500):\n    errors = [b + w * xs[i] - ys[i] for i in range(3)]\n    grad_b = sum([2 * e for e in errors]) / 3\n    grad_w = sum([2 * errors[i] * xs[i] for i in range(3)]) / 3\n    b, w = b - 0.1 * grad_b, w - 0.1 * grad_w\nprint(round(b, 3), round(w, 3))',
        output: '1.0 2.0',
        explanation:
          'Five hundred small steps reach the line y = 1 + 2x, which fits all three points exactly.',
      },
      questions: [
        predictOutput(
          'What does this program print after one update?',
          'xs = [1.0, 2.0]\nys = [3.0, 5.0]\nb, w = 0.0, 0.0\nerrors = [b + w * xs[i] - ys[i] for i in range(2)]\ngrad_b = sum([2 * e for e in errors]) / 2\ngrad_w = sum([2 * errors[i] * xs[i] for i in range(2)]) / 2\nb, w = b - 0.1 * grad_b, w - 0.1 * grad_w\nprint(round(b, 3), round(w, 3))',
          ['-0.8 -1.3', '0.8 1.3', '1.6 2.6', '0.8 0.8'],
          1,
          'The errors are -3 and -5, so grad_b = -8 and grad_w = (-6 - 20) / 2 = -13. Subtracting 0.1 times each gives 0.8 and 1.3.',
        ),
        choose(
          'After many steps, both gradients of the mean squared error for a linear model are 0. What does this tell you?',
          [
            'The model will have zero test error',
            'The learning rate was too small',
            'Training must restart from new values',
            'b and w are the least-squares values for the training data',
          ],
          3,
          'For a linear model, mean squared error has a single valley, so a flat point is the least-squares minimum on the training rows.',
        ),
        choose(
          'A loss has several valleys. Gradient descent stops where the gradient is 0. What can you conclude?',
          [
            'It found the lowest point of the whole loss',
            'It reached a flat point that may be only a local valley',
            'The data contain no noise',
            'The learning rate was exactly right',
          ],
          1,
          'A zero gradient marks a flat point, which can be a local minimum rather than the overall best.',
        ),
        choose(
          'Why compute grad_b and grad_w before updating either parameter?',
          [
            'Both gradients should describe the same current point',
            'Python cannot assign two variables in one statement',
            'The intercept must always be updated last',
            'It halves the effective learning rate',
          ],
          0,
          'Updating b first would make grad_w describe a different point from the one grad_b described.',
        ),
      ],
    },
  ],
  'ml-regularization': [
    {
      title: 'Diagnose overfitting and underfitting',
      explanation: [
        'Compare the error on the training rows with the error on validation rows. Low training error with much higher validation error is overfitting: the model fits details of the training rows that do not carry over. High error on both is underfitting: the model misses patterns even in the data it trained on.',
        'Model flexibility moves you between the two. Adding columns such as x**2 up to x**5 lets a linear model bend more; with few rows it can pass through every training point and still predict new points badly.',
      ],
      example: {
        code: 'import numpy as np\nfrom sklearn.linear_model import LinearRegression\nx_train = np.array([0.0, 1.0, 2.0, 3.0, 4.0, 5.0])\ny_train = np.array([1.0, 2.6, 2.9, 4.2, 4.8, 6.3])\nx_val = np.array([0.5, 2.5, 4.5])\ny_val = np.array([1.5, 3.8, 5.4])\n\ndef powers(x, degree):\n    return np.column_stack([x ** d for d in range(1, degree + 1)])\n\nfor degree in [1, 5]:\n    model = LinearRegression().fit(powers(x_train, degree), y_train)\n    train_mse = ((model.predict(powers(x_train, degree)) - y_train) ** 2).mean()\n    val_mse = ((model.predict(powers(x_val, degree)) - y_val) ** 2).mean()\n    print(degree, round(float(train_mse), 3), round(float(val_mse), 3))',
        output: '1 0.071 0.032\n5 0.0 0.385',
        explanation:
          'np.column_stack places the powers of x side by side as columns. With degree 5, six coefficients pass through all six training points, so training error is 0, but validation error is far worse than the straight line’s.',
      },
      questions: [
        choose(
          'A model has training MSE 0.2 and validation MSE 9.5. What is the clearest diagnosis?',
          [
            'Underfitting',
            'A well-generalizing model',
            'Overfitting',
            'A leak from validation into training',
          ],
          2,
          'The model fits the training rows far better than unseen rows, the signature of overfitting.',
        ),
        choose(
          'A model has training MSE 14 and validation MSE 15, while predicting the training mean gives MSE 16. What is the clearest diagnosis?',
          ['Overfitting', 'Underfitting', 'A perfect fit', 'A data leak'],
          1,
          'Both errors are high and barely beat a constant, so the model misses patterns even in its training data.',
        ),
        choose(
          'Which change is most likely to reduce overfitting?',
          [
            'Adding columns for x**6 through x**10',
            'Training longer on the same few rows',
            'Scoring the model on its training rows',
            'Using a simpler model or more training data',
          ],
          3,
          'Less flexibility, or more rows to constrain it, makes it harder to fit details that do not generalize.',
        ),
        predictOutput(
          'Each list position is a model of increasing complexity. What does this program print?',
          'train_mse = [4.1, 2.0, 0.6, 0.1]\nval_mse = [4.5, 2.4, 2.9, 7.8]\nbest = 0\nfor i in range(len(val_mse)):\n    if val_mse[i] < val_mse[best]:\n        best = i\nprint(best, train_mse[best])',
          ['3 0.1', '1 2.0', '0 4.1', '1 2.4'],
          1,
          'The loop keeps the lowest validation error, at position 1. The most complex model has the lowest training error but generalizes worst.',
        ),
      ],
    },
    {
      title: 'Shrink coefficients with a ridge (L2) penalty',
      explanation: [
        'Ridge regression minimizes the data loss plus alpha times the sum of squared coefficients. The intercept is not penalized. Larger coefficients now cost something, so the fit trades a little training error for smaller, more stable weights.',
        'alpha = 0 gives ordinary least squares, and a larger alpha pulls the coefficients closer to zero. Because a coefficient’s size depends on its feature’s unit, features on very different scales are penalized unevenly.',
      ],
      example: {
        code: 'from sklearn.linear_model import Ridge\nX = [[0.0], [1.0], [2.0], [3.0]]\ny = [0.0, 2.0, 4.0, 6.0]\nfor alpha in [0.1, 1.0, 10.0]:\n    print(alpha, round(float(Ridge(alpha=alpha).fit(X, y).coef_[0]), 3))',
        output: '0.1 1.961\n1.0 1.667\n10.0 0.667',
        explanation:
          'The least-squares slope is 2. As alpha grows, the penalty pulls the slope toward 0, even though the data fit y = 2x exactly.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'data_loss = 2.0\nweights = [1.0, -3.0]\nalpha = 0.1\nprint(data_loss + alpha * sum([w ** 2 for w in weights]))',
          ['2.4', '12.0', '3.0', '2.1'],
          2,
          'The squared weights sum to 1 + 9 = 10; alpha scales that to 1.0, which is added to the data loss.',
        ),
        predictOutput(
          'What does this program print?',
          'from sklearn.linear_model import LinearRegression, Ridge\nX = [[-1.0], [0.0], [1.0]]\ny = [-2.0, 0.0, 2.0]\nplain = LinearRegression().fit(X, y).coef_[0]\nridge = Ridge(alpha=2.0).fit(X, y).coef_[0]\nprint(round(float(plain), 3), round(float(ridge), 3))',
          ['2.0 2.0', '2.0 4.0', '1.0 2.0', '2.0 1.0'],
          3,
          'Least squares finds slope 2. The ridge penalty halves it here, trading training fit for a smaller coefficient.',
        ),
        choose(
          'As alpha in Ridge becomes very large, what happens to the coefficients?',
          [
            'They shrink toward zero',
            'They grow without limit',
            'They equal the least-squares values',
            'They all flip sign',
          ],
          0,
          'The penalty dominates the data loss, so the cheapest solution keeps every coefficient near zero.',
        ),
        choose(
          'One model measures distance in kilometres, another in metres; otherwise the data are the same. Why can Ridge treat the two differently?',
          [
            'Ridge ignores the feature columns entirely',
            'The coefficient’s size depends on the unit, and the penalty acts on that size',
            'Ridge cannot fit features measured in metres',
            'Ridge requires whole-number features',
          ],
          1,
          'The metre coefficient is 1000 times smaller for the same relationship, so it is penalized far less.',
        ),
      ],
    },
    {
      title: 'Drop features with a lasso (L1) penalty',
      explanation: [
        'Lasso regression penalizes alpha times the sum of absolute coefficients instead of squared ones. This penalty can push some coefficients to exactly zero, which removes those features from the model.',
        'Ridge shrinks every coefficient but rarely makes one exactly zero. Lasso suits problems where you suspect many features are irrelevant; a larger alpha zeroes more of them.',
      ],
      example: {
        code: 'import numpy as np\nfrom sklearn.linear_model import Lasso, Ridge\nX = np.array([[1.0, 0.3], [2.0, -0.1], [3.0, 0.2], [4.0, -0.4]])\ny = np.array([2.0, 4.0, 6.0, 8.0])\nlasso = Lasso(alpha=0.1).fit(X, y).coef_\nridge = Ridge(alpha=0.1).fit(X, y).coef_\nprint((lasso != 0).tolist())\nprint((ridge != 0).tolist())',
        output: '[True, False]\n[True, True]',
        explanation:
          'The target depends only on the first column. Lasso sets the noise column’s coefficient to exactly zero; Ridge only makes it small.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'data_loss = 1.0\nweights = [2.0, -3.0, 0.0]\nalpha = 0.5\nprint(data_loss + alpha * sum([abs(w) for w in weights]))',
          ['7.5', '3.5', '2.5', '-0.5'],
          1,
          'The absolute values sum to 5, so the L1 penalty is 2.5. Squaring instead would give the ridge value 7.5.',
        ),
        predictOutput(
          'Only the first two columns influence y. What does this program print?',
          'import numpy as np\nfrom sklearn.linear_model import Lasso\nX = np.array([[1.0, 2.0, 0.5], [2.0, 1.0, -0.5], [3.0, 4.0, 0.0], [4.0, 3.0, 1.0], [5.0, 5.0, -1.0]])\ny = 3 * X[:, 0] + 0.5 * X[:, 1]\nfor alpha in [0.01, 2.0]:\n    coef = Lasso(alpha=alpha).fit(X, y).coef_\n    print(alpha, int((coef == 0).sum()))',
          ['0.01 0\n2.0 0', '0.01 2\n2.0 1', '0.01 1\n2.0 2', '0.01 1\n2.0 1'],
          2,
          'Even a small penalty removes the useless third column. The larger penalty also zeroes the weak second column.',
        ),
        choose(
          'You have 200 features and suspect most are irrelevant. Which penalty can remove features by setting their coefficients to exactly zero?',
          [
            'An L2 (ridge) penalty',
            'No penalty at all',
            'A penalty on the intercept only',
            'An L1 (lasso) penalty',
          ],
          3,
          'The absolute-value penalty makes exact zeros, so lasso performs feature selection as it fits.',
        ),
        choose(
          'How do the ridge and lasso penalties differ?',
          [
            'Ridge sums squared coefficients; lasso sums absolute coefficients',
            'Ridge sums absolute coefficients; lasso sums squared coefficients',
            'Both sum the squared residuals',
            'Lasso penalizes only the intercept',
          ],
          0,
          'L2 uses squares and shrinks smoothly; L1 uses absolute values and can produce exact zeros.',
        ),
      ],
    },
    {
      title: 'Choose the penalty and stopping point on validation',
      explanation: [
        'alpha is chosen before fitting, not learned. Fit the model with several values on the training rows, compare their validation errors, and keep the best. Too little penalty leaves overfitting; too much causes underfitting.',
        'Early stopping applies the same idea to gradient descent. Record the validation loss as training proceeds and keep the parameters from the step where it was lowest, even if training loss keeps falling afterwards.',
      ],
      example: {
        code: 'val_loss = [0.90, 0.62, 0.48, 0.45, 0.47, 0.55]\nbest_step = 0\nfor step in range(len(val_loss)):\n    if val_loss[step] < val_loss[best_step]:\n        best_step = step\nprint(best_step, val_loss[best_step])',
        output: '3 0.45',
        explanation:
          'Validation loss bottoms out at step 3 and then rises, so early stopping keeps the parameters saved at step 3.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'alphas = [0.01, 0.1, 1.0, 10.0]\ntrain_mse = [1.2, 1.5, 2.3, 4.0]\nval_mse = [5.2, 4.1, 3.6, 4.4]\nbest = 0\nfor i in range(len(alphas)):\n    if val_mse[i] < val_mse[best]:\n        best = i\nprint(alphas[best], train_mse[best])',
          ['0.01 1.2', '1.0 3.6', '1.0 2.3', '10.0 4.0'],
          2,
          'alpha = 1.0 has the lowest validation error, 3.6; the program prints its training error, 2.3.',
        ),
        choose(
          'Validation loss falls for 30 steps, then rises while training loss keeps falling. Which parameters should early stopping keep?',
          [
            'Those from the final step',
            'Those from the first step',
            'Those with the lowest training loss',
            'Those from the step with the lowest validation loss',
          ],
          3,
          'The validation minimum marks the point after which further training only fits the training rows.',
        ),
        choose(
          'With alpha = 100, both training and validation errors are high. What is happening?',
          [
            'The penalty is so strong that the model underfits',
            'The model overfits the training rows',
            'alpha is too small to matter',
            'Validation rows leaked into training',
          ],
          0,
          'An overly strong penalty forces coefficients near zero, so the model cannot fit even the training data.',
        ),
        choose(
          'Why is alpha chosen on validation data rather than by minimizing training error?',
          [
            'alpha cannot be computed from training data',
            'Validation data have more rows',
            'Training error always prefers alpha = 0, the least constrained fit',
            'Training error ignores the coefficients',
          ],
          2,
          'Any penalty can only raise training error, so training error always favours no penalty; validation error measures generalization.',
        ),
      ],
    },
  ],
  'ml-logistic-regression': [
    {
      title: 'Map a linear score to a probability',
      explanation: [
        'Logistic regression computes a linear score z = b + w1*x1 + ..., which can be any number, and passes it through the sigmoid: p = 1 / (1 + exp(-z)). The result always lies between 0 and 1 and is read as the probability of the positive class.',
        'A score of 0 gives exactly 0.5. Positive scores give probabilities above 0.5 and negative scores below. The curve is symmetric: sigmoid(-z) = 1 - sigmoid(z).',
      ],
      example: {
        code: 'import math\n\ndef sigmoid(z):\n    return 1 / (1 + math.exp(-z))\n\nprint(sigmoid(0))\nprint(round(sigmoid(2), 3), round(sigmoid(-2), 3))',
        output: '0.5\n0.881 0.119',
        explanation:
          'exp(0) = 1, so the score 0 maps to 1 / 2. Scores of 2 and -2 land the same distance above and below 0.5.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'import math\nb, w = -3.0, 0.5\nx = 6.0\nz = b + w * x\nprint(z, 1 / (1 + math.exp(-z)))',
          ['0.0 0.0', '-3.0 0.047', '0.0 1.0', '0.0 0.5'],
          3,
          'The score is -3 + 0.5*6 = 0, and the sigmoid of 0 is 0.5.',
        ),
        predictOutput(
          'What does this program print?',
          'import math\n\ndef sigmoid(z):\n    return 1 / (1 + math.exp(-z))\n\nprint(round(sigmoid(1.5) + sigmoid(-1.5), 3))',
          ['1.0', '0.0', '0.5', '2.0'],
          0,
          'sigmoid(-z) = 1 - sigmoid(z), so the two probabilities always add up to 1.',
        ),
        choose(
          'A logistic model gives an email a score of -4. What can you say about its spam probability?',
          [
            'It is negative',
            'It is exactly 0',
            'It is below 0.5',
            'It is above 0.5',
          ],
          2,
          'A negative score maps below 0.5, but the sigmoid never outputs a value below 0.',
        ),
        choose(
          'Why does logistic regression pass the linear score through the sigmoid instead of using the score as the probability?',
          [
            'The sigmoid removes the intercept',
            'A score can be any real number, but a probability must lie between 0 and 1',
            'Scores are always negative',
            'The sigmoid sorts the training rows',
          ],
          1,
          'The sigmoid squeezes every possible score into the interval from 0 to 1.',
        ),
      ],
    },
    {
      title: 'Turn probabilities into labels with a threshold',
      explanation: [
        'A probability is not yet a decision. A threshold converts it into a class: predict 1 when p >= threshold, otherwise 0. The default 0.5 is only a convention.',
        'Raising the threshold flags fewer rows as positive; lowering it flags more. Changing the threshold never changes the probabilities themselves. Choose it from the costs of the two kinds of mistakes, using validation data.',
      ],
      example: {
        code: 'probabilities = [0.15, 0.42, 0.58, 0.91]\nfor threshold in [0.5, 0.7]:\n    print([int(p >= threshold) for p in probabilities])',
        output: '[0, 0, 1, 1]\n[0, 0, 0, 1]',
        explanation:
          'At 0.5, two rows are positive. At 0.7, the row with 0.58 drops out while the probabilities stay the same.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'probabilities = [0.25, 0.3, 0.65, 0.1]\nthreshold = 0.3\nprint([int(p >= threshold) for p in probabilities])',
          ['[0, 0, 1, 0]', '[1, 1, 1, 0]', '[0, 1, 1, 0]', '[0, 1, 1, 1]'],
          2,
          'p >= 0.3 includes the value exactly equal to the threshold, so 0.3 and 0.65 are labelled 1.',
        ),
        choose(
          'A disease screen should miss as few sick patients as possible, and follow-up tests are cheap. How should the threshold move from 0.5?',
          [
            'Raise it, so fewer patients are flagged',
            'Keep 0.5, because thresholds are fixed',
            'Set it to 1.0',
            'Lower it, so more patients are flagged',
          ],
          3,
          'A lower threshold catches more sick patients at the price of more false alarms, which are cheap here.',
        ),
        choose(
          'What does raising the threshold from 0.5 to 0.8 do to the model’s predicted probabilities?',
          [
            'Nothing; only the labels derived from them change',
            'Every probability increases',
            'The model is retrained',
            'Probabilities below 0.8 are set to 0',
          ],
          0,
          'The threshold is applied after the model; the probabilities are unchanged.',
        ),
        predictOutput(
          'What does this program print?',
          'probabilities = [0.05, 0.35, 0.5, 0.62, 0.77, 0.93]\nfor threshold in [0.5, 0.75]:\n    flagged = [p for p in probabilities if p >= threshold]\n    print(threshold, len(flagged))',
          ['0.5 3\n0.75 2', '0.5 4\n0.75 2', '0.5 4\n0.75 4', '0.5 2\n0.75 4'],
          1,
          'Four probabilities are at least 0.5, counting 0.5 itself; only 0.77 and 0.93 reach 0.75.',
        ),
      ],
    },
    {
      title: 'Score probabilities with log loss',
      explanation: [
        'Log loss scores a predicted probability p of class 1 against the true label y: -(y*log(p) + (1 - y)*log(1 - p)). Only one term is active: -log(p) when y is 1, and -log(1 - p) when y is 0.',
        'A confident correct prediction costs almost nothing, while a confident wrong one costs a lot. Logistic regression is fitted by minimizing the average log loss over the training rows.',
      ],
      example: {
        code: 'import math\n\ndef log_loss(y, p):\n    return -(y * math.log(p) + (1 - y) * math.log(1 - p))\n\nprint(round(log_loss(1, 0.9), 3))\nprint(round(log_loss(1, 0.1), 3))',
        output: '0.105\n2.303',
        explanation:
          'Both rows are positive. Predicting 0.9 costs -log(0.9) ≈ 0.105; predicting 0.1 costs -log(0.1) ≈ 2.303, about 22 times more.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'import math\n\ndef log_loss(y, p):\n    return -(y * math.log(p) + (1 - y) * math.log(1 - p))\n\nprint(round(log_loss(0, 0.8), 3))',
          ['0.223', '0.8', '1.609', '0.2'],
          2,
          'The label is 0, so the loss is -log(1 - 0.8) = -log(0.2) ≈ 1.609.',
        ),
        predictOutput(
          'What does this program print?',
          'import math\n\ndef log_loss(y, p):\n    return -(y * math.log(p) + (1 - y) * math.log(1 - p))\n\nlosses = [log_loss(1, 0.5), log_loss(0, 0.5)]\nprint(round(sum(losses) / len(losses), 3))',
          ['0.5', '1.386', '0.0', '0.693'],
          3,
          'A probability of 0.5 costs log(2) ≈ 0.693 whichever label is true, so the average is also 0.693.',
        ),
        choose(
          'For a row whose true label is 0, one model predicts 0.99 and another 0.6. Which gets the larger log loss?',
          [
            'The 0.6 model, because it is less certain',
            'Both, equally, because both are on the wrong side of 0.5',
            'The 0.99 model, because confident wrong predictions are penalized heavily',
            'Neither, because log loss ignores the label',
          ],
          2,
          '-log(0.01) ≈ 4.6 is far larger than -log(0.4) ≈ 0.92.',
        ),
        choose(
          'Why is logistic regression trained on log loss rather than on the count of wrong labels?',
          [
            'Log loss scores the probabilities themselves and changes smoothly as the weights change',
            'Counting wrong labels requires test data',
            'Log loss is zero for every reasonable model',
            'Log loss does not depend on the labels',
          ],
          0,
          'A wrong-label count ignores confidence and jumps in steps, which gives gradient descent nothing to follow.',
        ),
      ],
    },
    {
      title: 'Fit LogisticRegression in scikit-learn',
      explanation: [
        'LogisticRegression().fit(X, y) learns coef_ and intercept_ by minimizing log loss plus a penalty on the coefficients. predict_proba(X) returns one column per class, in the order listed by classes_ (sorted labels), and predict(X) labels a row with the positive class when its probability is above 0.5.',
        'C controls the penalty in reverse: a smaller C means a stronger penalty, smaller coefficients, and probabilities that stay closer to 0.5. Choose C on validation data, as with alpha.',
      ],
      example: {
        code: 'from sklearn.linear_model import LogisticRegression\nX = [[1.0], [2.0], [3.0], [6.0], [7.0], [8.0]]\ny = [0, 0, 0, 1, 1, 1]\nmodel = LogisticRegression().fit(X, y)\nprint(model.classes_.tolist())\nprint(model.predict_proba([[4.5]]).round(3).tolist())\nprint(model.predict([[2.0], [7.5]]).tolist())',
        output: '[0, 1]\n[[0.5, 0.5]]\n[0, 1]',
        explanation:
          'x = 4.5 is midway between the classes, so both columns are 0.5. Rows far to either side get the matching label.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'from sklearn.linear_model import LogisticRegression\nX = [[1.0], [2.0], [3.0], [6.0], [7.0], [8.0]]\ny = [0, 0, 0, 1, 1, 1]\nweak = LogisticRegression(C=0.01).fit(X, y).coef_[0][0]\nstrong = LogisticRegression(C=100.0).fit(X, y).coef_[0][0]\nprint(round(float(weak), 3), round(float(strong), 3))',
          ['3.095 0.068', '0.068 3.095', '1.042 1.042', '0.068 0.068'],
          1,
          'C = 0.01 imposes a strong penalty, so its coefficient is tiny; C = 100 barely penalizes, so the coefficient is large.',
        ),
        predictOutput(
          'What does this program print?',
          'from sklearn.linear_model import LogisticRegression\nX = [[1.0], [2.0], [3.0], [6.0], [7.0], [8.0]]\ny = ["yes", "yes", "yes", "no", "no", "no"]\nmodel = LogisticRegression().fit(X, y)\nprint(model.classes_.tolist())\nprint(model.predict_proba([[1.0]]).round(2).tolist())',
          [
            "['yes', 'no']\n[[0.97, 0.03]]",
            "['no', 'yes']\n[[0.97, 0.03]]",
            "['yes', 'no']\n[[0.03, 0.97]]",
            "['no', 'yes']\n[[0.03, 0.97]]",
          ],
          3,
          'classes_ is sorted, so "no" is column 0. A row at x = 1 is almost surely "yes", which is column 1.',
        ),
        choose(
          'In scikit-learn’s LogisticRegression, what does a smaller C mean?',
          [
            'A weaker penalty on the coefficients',
            'A stronger penalty that pulls coefficients toward zero',
            'A lower decision threshold',
            'Fewer training rows are used',
          ],
          1,
          'C is the inverse of the penalty strength, so shrinking C strengthens regularization.',
        ),
        choose(
          'You need labels at a threshold of 0.3 from a fitted binary LogisticRegression. Which approach is correct?',
          [
            'Call predict, which reads the threshold from the data',
            'Refit the model with C = 0.3',
            'Compare the class-1 column of predict_proba with 0.3',
            'Multiply the coefficients by 0.3',
          ],
          2,
          'predict always uses 0.5; a custom threshold is applied to the probabilities from predict_proba.',
        ),
      ],
    },
  ],
  'ml-classification-metrics': [
    {
      title: 'Count the four outcomes in a confusion matrix',
      explanation: [
        'Pick one class as positive. Each prediction then lands in one of four cells: a true positive (actual 1, predicted 1), a false positive (actual 0, predicted 1), a false negative (actual 1, predicted 0), or a true negative (actual 0, predicted 0).',
        'scikit-learn’s confusion_matrix(actual, predicted) returns these counts as a table with one row per actual class and one column per predicted class. For labels 0 and 1 the layout is [[TN, FP], [FN, TP]].',
      ],
      example: {
        code: 'actual = [1, 0, 1, 1, 0, 0]\npredicted = [1, 1, 0, 1, 0, 0]\nrows = range(len(actual))\ntp = sum([1 for i in rows if actual[i] == 1 and predicted[i] == 1])\nfp = sum([1 for i in rows if actual[i] == 0 and predicted[i] == 1])\nfn = sum([1 for i in rows if actual[i] == 1 and predicted[i] == 0])\ntn = sum([1 for i in rows if actual[i] == 0 and predicted[i] == 0])\nprint(tp, fp, fn, tn)',
        output: '2 1 1 2',
        explanation:
          'Rows 0 and 3 are caught positives, row 1 is a false alarm, row 2 is a missed positive, and rows 4 and 5 are correctly rejected.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'from sklearn.metrics import confusion_matrix\nactual = [0, 1, 1, 0, 1]\npredicted = [0, 1, 0, 1, 1]\nprint(confusion_matrix(actual, predicted).tolist())',
          [
            '[[2, 1], [1, 1]]',
            '[[1, 1], [1, 2]]',
            '[[2, 1], [1, 1], [0, 0]]',
            '[[1, 2], [1, 1]]',
          ],
          1,
          'Actual 0: one predicted 0 and one predicted 1. Actual 1: one predicted 0 and two predicted 1. The layout is [[TN, FP], [FN, TP]].',
        ),
        choose(
          'With fraud as the positive class, a model flags a legitimate purchase as fraud. Which cell does it count in?',
          [
            'True positive',
            'False negative',
            'True negative',
            'False positive',
          ],
          3,
          'The prediction was positive but the actual class was negative, which is a false positive.',
        ),
        choose(
          'A cancer screen treats "cancer" as positive. Which outcome is a false negative?',
          [
            'A patient with cancer who is told the result is clear',
            'A healthy patient flagged for a follow-up test',
            'A healthy patient told the result is clear',
            'A patient with cancer who is flagged for follow-up',
          ],
          0,
          'The actual class is positive and the prediction is negative: the screen missed the cancer.',
        ),
        predictOutput(
          'What does this program print?',
          'actual = [1, 1, 0, 0, 1, 0]\npredicted = [1, 0, 0, 1, 1, 1]\nrows = range(len(actual))\nfp = sum([1 for i in rows if actual[i] == 0 and predicted[i] == 1])\nfn = sum([1 for i in rows if actual[i] == 1 and predicted[i] == 0])\nprint(fp, fn)',
          ['1 2', '2 2', '2 1', '3 1'],
          2,
          'Rows 3 and 5 are predicted 1 but are actually 0 (two false positives); row 1 is a missed positive.',
        ),
      ],
    },
    {
      title: 'Compute precision and recall',
      explanation: [
        'Precision = TP / (TP + FP) asks: of the rows the model flagged, how many were truly positive? Recall = TP / (TP + FN) asks: of the truly positive rows, how many did the model flag?',
        'They have different denominators and answer different questions. Precision matters when false alarms are costly; recall matters when misses are costly. scikit-learn provides precision_score and recall_score.',
      ],
      example: {
        code: 'tp, fp, fn = 8, 2, 8\nprecision = tp / (tp + fp)\nrecall = tp / (tp + fn)\nprint(precision, recall)',
        output: '0.8 0.5',
        explanation:
          'Eight of the ten flagged rows were positive, so precision is 0.8. The model found eight of the sixteen actual positives, so recall is 0.5.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'from sklearn.metrics import precision_score, recall_score\nactual = [1, 1, 1, 1, 0, 0, 0, 0]\npredicted = [1, 1, 0, 0, 1, 0, 0, 0]\np = precision_score(actual, predicted)\nr = recall_score(actual, predicted)\nprint(round(float(p), 3), round(float(r), 3))',
          ['0.5 0.667', '0.667 0.667', '0.667 0.5', '0.75 0.5'],
          2,
          'TP = 2, FP = 1, FN = 2. Precision is 2 / 3 and recall is 2 / 4.',
        ),
        choose(
          'A spam filter has precision 0.95 and recall 0.40. What does that mean?',
          [
            'It catches most spam but also flags many real messages',
            'Messages it flags are almost always spam, but it misses most spam',
            'It is right on 95% of all messages',
            'It flags 40% of all messages as spam',
          ],
          1,
          'High precision means few false alarms among flagged messages; low recall means most actual spam goes unflagged.',
        ),
        choose(
          'Every missed fraudulent transaction is very costly, while reviewing a false alarm is cheap. Which metric should the team watch most closely?',
          ['Precision', 'Recall', 'The number of features', 'Training error'],
          1,
          'Recall counts how many actual frauds were caught, so it directly measures the costly misses.',
        ),
        predictOutput(
          'What does this program print?',
          'tp, fp, fn = 9, 1, 21\nprint(tp / (tp + fp), tp / (tp + fn))',
          ['0.3 0.9', '0.9 0.9', '0.45 0.3', '0.9 0.3'],
          3,
          'Nine of ten flags were right (precision 0.9), but only nine of thirty positives were found (recall 0.3).',
        ),
      ],
    },
    {
      title: 'See through accuracy with rare classes; combine with F1',
      explanation: [
        'Accuracy is (TP + TN) divided by all rows. When positives are rare, a model that always predicts negative scores high accuracy while finding none of them, so its recall is 0.',
        'The F1 score, 2 * precision * recall / (precision + recall), is the harmonic mean of the two. It is high only when both are high, so it exposes a model that buys one at the expense of the other.',
      ],
      example: {
        code: 'tp, fp, fn, tn = 0, 0, 10, 990\naccuracy = (tp + tn) / (tp + fp + fn + tn)\nrecall = tp / (tp + fn)\nprint(accuracy, recall)',
        output: '0.99 0.0',
        explanation:
          'Predicting negative for all 1,000 rows is right 99% of the time, yet it catches none of the 10 positives.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'precision, recall = 0.5, 1.0\nf1 = 2 * precision * recall / (precision + recall)\nprint(round(f1, 3))',
          ['0.75', '0.667', '0.5', '1.0'],
          1,
          'The harmonic mean is 2 * 0.5 * 1.0 / 1.5 ≈ 0.667, below the ordinary average 0.75.',
        ),
        predictOutput(
          'What does this program print?',
          'from sklearn.metrics import accuracy_score, f1_score\nactual = [0, 0, 0, 0, 0, 0, 0, 0, 1, 1]\npredicted = [0, 0, 0, 0, 0, 0, 0, 0, 0, 1]\nprint(accuracy_score(actual, predicted), round(float(f1_score(actual, predicted)), 3))',
          ['0.9 0.667', '0.9 0.9', '0.5 0.667', '0.9 0.5'],
          0,
          'Nine of ten rows are correct. Precision is 1.0 and recall 0.5, so F1 = 2 * 0.5 / 1.5 ≈ 0.667.',
        ),
        choose(
          'Only 1% of rows are positive. Why can a 99% accuracy be meaningless?',
          [
            'Accuracy cannot be computed on rare classes',
            'Accuracy is always lower than recall',
            'Predicting negative for every row already achieves 99%',
            'A rare class makes accuracy exceed 100%',
          ],
          2,
          'The majority-class baseline reaches the same accuracy while catching no positives.',
        ),
        choose(
          'Model A has precision 0.9 and recall 0.1. Model B has precision 0.5 and recall 0.5. Which has the higher F1?',
          [
            'Model A',
            'They tie, since both average 0.5',
            'F1 cannot compare them',
            'Model B',
          ],
          3,
          'A’s F1 is 2 * 0.09 / 1.0 = 0.18; B’s is 0.5. The harmonic mean punishes A’s very low recall.',
        ),
      ],
    },
    {
      title: 'Trade precision against recall with the threshold',
      explanation: [
        'A classifier’s threshold decides how many rows it flags. Raising it flags fewer rows, which usually removes false positives (precision rises) but adds misses (recall falls). Lowering it does the reverse.',
        'No threshold is best in general. Compute precision and recall at several thresholds on validation data and choose the one whose trade-off matches the costs of each kind of error.',
      ],
      example: {
        code: 'probs = [0.95, 0.8, 0.7, 0.6, 0.4, 0.3, 0.2, 0.1]\nactual = [1, 1, 0, 1, 1, 0, 0, 0]\nfor threshold in [0.5, 0.75]:\n    pred = [int(p >= threshold) for p in probs]\n    tp = sum([1 for i in range(8) if pred[i] == 1 and actual[i] == 1])\n    fp = sum([1 for i in range(8) if pred[i] == 1 and actual[i] == 0])\n    fn = sum([1 for i in range(8) if pred[i] == 0 and actual[i] == 1])\n    print(threshold, tp / (tp + fp), tp / (tp + fn))',
        output: '0.5 0.75 0.75\n0.75 1.0 0.5',
        explanation:
          'At 0.75, the false alarm at 0.7 disappears, so precision reaches 1.0, but the positive at 0.6 is now missed, so recall falls to 0.5.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'probs = [0.9, 0.6, 0.45, 0.35, 0.2]\nactual = [1, 0, 1, 1, 0]\npred = [int(p >= 0.3) for p in probs]\ntp = sum([1 for i in range(5) if pred[i] == 1 and actual[i] == 1])\nfp = sum([1 for i in range(5) if pred[i] == 1 and actual[i] == 0])\nfn = sum([1 for i in range(5) if pred[i] == 0 and actual[i] == 1])\nprint(tp / (tp + fp), tp / (tp + fn))',
          ['0.75 1.0', '1.0 0.75', '0.5 1.0', '0.75 0.75'],
          0,
          'At 0.3, four rows are flagged: three positives and one negative. Every actual positive is caught, so recall is 1.0.',
        ),
        choose(
          'What does raising the decision threshold usually do?',
          [
            'Raises recall and lowers precision',
            'Raises both precision and recall',
            'Changes the predicted probabilities',
            'Raises precision and lowers recall',
          ],
          3,
          'Fewer rows are flagged, so fewer false alarms remain but more positives are missed.',
        ),
        choose(
          'A bank can manually review only 50 alerts a day. How should it set the fraud threshold?',
          [
            'Keep 0.5, the default',
            'Set it so about 50 rows a day are flagged, then check precision and recall at that level',
            'Lower it to catch every fraud regardless of volume',
            'Pick it from the test set until recall reaches 1.0',
          ],
          1,
          'The review capacity fixes how many flags are useful; the threshold is chosen to produce that volume.',
        ),
        choose(
          'Lowering the threshold raised recall from 0.6 to 0.9 and dropped precision from 0.8 to 0.3. When is that a good trade?',
          [
            'When each missed positive costs far more than a false alarm',
            'When false alarms are very expensive',
            'Never, because precision fell',
            'Always, because recall rose',
          ],
          0,
          'The change buys more caught positives with many more false alarms, which pays off only if misses are the costlier error.',
        ),
      ],
    },
  ],
  'ml-cross-validation': [
    {
      title: 'Rotate the validation fold through k folds',
      explanation: [
        'K-fold cross-validation cuts the training data into k folds. In each of k rounds, one fold is held out for validation and a fresh model is fitted on the other k - 1 folds, so every row is used for validation exactly once.',
        'KFold(n_splits=k).split(X) yields, for each round, a pair of index arrays: the training rows and the validation rows. Without shuffling, the folds are consecutive blocks of rows.',
      ],
      example: {
        code: 'from sklearn.model_selection import KFold\nX = [[0], [1], [2], [3], [4], [5]]\nfor train_idx, val_idx in KFold(n_splits=3).split(X):\n    print(train_idx.tolist(), val_idx.tolist())',
        output: '[2, 3, 4, 5] [0, 1]\n[0, 1, 4, 5] [2, 3]\n[0, 1, 2, 3] [4, 5]',
        explanation:
          'Six rows make three folds of two. Each round validates on one fold and trains on the four remaining rows.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'from sklearn.model_selection import KFold\nX = [[0], [1], [2], [3], [4], [5], [6], [7]]\nfor train_idx, val_idx in KFold(n_splits=4).split(X):\n    print(val_idx.tolist())',
          [
            '[0, 1]\n[2, 3]\n[4, 5]\n[6, 7]',
            '[0, 1, 2, 3]\n[4, 5, 6, 7]',
            '[2, 3, 4, 5, 6, 7]\n[0, 1, 4, 5, 6, 7]\n[0, 1, 2, 3, 6, 7]\n[0, 1, 2, 3, 4, 5]',
            '[0]\n[1]\n[2]\n[3]',
          ],
          0,
          'Four folds of eight rows hold two consecutive rows each, and each fold is validated once.',
        ),
        choose(
          'In 5-fold cross-validation, how many times is each training row used for validation?',
          ['Five times', 'Four times', 'Exactly once', 'Never'],
          2,
          'The folds partition the rows, and each fold is the validation fold in exactly one round.',
        ),
        choose(
          'Why is a fresh model fitted in every round instead of reusing one model?',
          [
            'Reusing a model would make the folds overlap',
            'A model already fitted on the validation fold would be scored on rows it has seen',
            'scikit-learn models can be fitted only once',
            'Fresh models always score higher',
          ],
          1,
          'Each round’s score is honest only if that round’s model never trained on its validation rows.',
        ),
        predictOutput(
          'What does this program print?',
          'from sklearn.model_selection import KFold\nX = [[0], [1], [2], [3], [4], [5], [6], [7], [8], [9]]\nsizes = []\nfor train_idx, val_idx in KFold(n_splits=5).split(X):\n    sizes.append(len(train_idx))\nprint(sizes)',
          [
            '[2, 2, 2, 2, 2]',
            '[10, 10, 10, 10, 10]',
            '[8, 6, 4, 2, 0]',
            '[8, 8, 8, 8, 8]',
          ],
          3,
          'Each round holds out one fold of two rows and trains on the other eight.',
        ),
      ],
    },
    {
      title: 'Read cross_val_score, including negated losses',
      explanation: [
        'cross_val_score(model, X, y, cv=k, scoring=...) runs the k rounds and returns one validation score per fold. Their mean estimates performance; their spread shows how much it depends on which rows were held out.',
        'scikit-learn scorers treat larger as better, so losses are reported negated: scoring="neg_mean_squared_error" returns minus the MSE. Negate the scores before reading them as errors.',
      ],
      example: {
        code: 'from sklearn.linear_model import LinearRegression\nfrom sklearn.model_selection import cross_val_score\nX = [[0], [1], [2], [3], [4], [5]]\ny = [1.0, 2.9, 5.2, 7.0, 8.8, 11.1]\nscores = cross_val_score(LinearRegression(), X, y, cv=3, scoring="neg_mean_squared_error")\nmse = -scores\nprint(mse.round(3).tolist())\nprint(round(float(mse.mean()), 3))',
        output: '[0.051, 0.033, 0.045]\n0.043',
        explanation:
          'The three fold errors are close to each other, and their mean, 0.043, is the cross-validated MSE.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'import numpy as np\nscores = np.array([-4.0, -9.0, -2.0])\nprint(float(-scores.mean()))',
          ['-5.0', '5.0', '15.0', '3.0'],
          1,
          'The scores are negated MSEs, so the mean MSE is -(-15 / 3) = 5.0.',
        ),
        predictOutput(
          'DummyRegressor predicts the training mean. What does this program print?',
          'from sklearn.dummy import DummyRegressor\nfrom sklearn.linear_model import LinearRegression\nfrom sklearn.model_selection import cross_val_score\nX = [[0], [1], [2], [3], [4], [5]]\ny = [1.0, 2.9, 5.2, 7.0, 8.8, 11.1]\nfor model in [DummyRegressor(), LinearRegression()]:\n    scores = cross_val_score(model, X, y, cv=3, scoring="neg_mean_squared_error")\n    print(round(float(-scores.mean()), 3))',
          [
            '-25.023\n-0.043',
            '0.043\n25.023',
            '25.023\n0.043',
            '25.023\n25.023',
          ],
          2,
          'Both models face the same folds and metric; the mean baseline’s error is far larger than the line’s.',
        ),
        choose(
          'cross_val_score with neg_mean_squared_error returns [-3.1, -2.8, -9.7]. What does this tell you?',
          [
            'The mean MSE is about 5.2, and one fold is much harder than the others',
            'The model improved from fold to fold',
            'The MSE is negative, so the model is better than perfect',
            'The third fold is the most accurate',
          ],
          0,
          'Negated, the errors are 3.1, 2.8, and 9.7; their mean is 5.2, and the large third error shows strong dependence on the fold.',
        ),
        choose(
          'Why does scikit-learn report neg_mean_squared_error instead of the MSE itself?',
          [
            'Negative numbers are cheaper to store',
            'Its scorers treat larger values as better, so losses are negated',
            'MSE is undefined for cross-validation',
            'The minus sign marks validation scores',
          ],
          1,
          'Negating a loss lets every scorer follow the same "larger is better" rule.',
        ),
      ],
    },
    {
      title: 'Choose a splitter that matches the data',
      explanation: [
        'Plain KFold cuts consecutive blocks, which misleads if rows are sorted; KFold(shuffle=True, random_state=0) shuffles reproducibly first. For classification, StratifiedKFold keeps class shares in every fold.',
        'GroupKFold keeps all rows of a group, such as one patient, in the same fold. TimeSeriesSplit always trains on earlier rows and validates on the rows right after them, so no fold uses the future.',
      ],
      example: {
        code: 'from sklearn.model_selection import TimeSeriesSplit\nX = [[0], [1], [2], [3], [4], [5]]\nfor train_idx, val_idx in TimeSeriesSplit(n_splits=3).split(X):\n    print(train_idx.tolist(), val_idx.tolist())',
        output: '[0, 1, 2] [3]\n[0, 1, 2, 3] [4]\n[0, 1, 2, 3, 4] [5]',
        explanation:
          'Each round validates on the next row in time and trains on everything before it, so the training window grows.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'from sklearn.model_selection import StratifiedKFold\ny = [0, 0, 0, 0, 1, 1]\nX = [[0], [1], [2], [3], [4], [5]]\nfor train_idx, val_idx in StratifiedKFold(n_splits=2).split(X, y):\n    print([y[i] for i in val_idx])',
          [
            '[0, 0, 0]\n[0, 1, 1]',
            '[0, 0, 1]\n[0, 0, 1]',
            '[0, 0, 0, 0]\n[1, 1]',
            '[0, 1]\n[0, 1]',
          ],
          1,
          'Two thirds of the labels are 0, and stratification keeps that share in both validation folds.',
        ),
        predictOutput(
          'What does this program print?',
          'from sklearn.model_selection import GroupKFold\nX = [[0], [1], [2], [3], [4], [5]]\ngroups = ["a", "a", "b", "b", "b", "c"]\nfor train_idx, val_idx in GroupKFold(n_splits=3).split(X, groups=groups):\n    print([groups[i] for i in val_idx])',
          [
            "['a', 'a']\n['b', 'b']\n['b', 'c']",
            "['a', 'b']\n['a', 'b']\n['b', 'c']",
            "['b', 'b', 'b']\n['a', 'a']\n['c']",
            "['a']\n['b']\n['c']",
          ],
          2,
          'Every validation fold holds whole groups, so no group is split between training and validation.',
        ),
        choose(
          'Rows are daily sensor readings, and the model will forecast the next day. Which splitter fits?',
          [
            'StratifiedKFold',
            'TimeSeriesSplit',
            'KFold with shuffle=True',
            'GroupKFold by weekday',
          ],
          1,
          'Only a time-ordered splitter keeps every validation row later than its training rows.',
        ),
        choose(
          'A clinic has ten visits per patient, and the model will serve new patients. Which splitter fits?',
          [
            'KFold with shuffle=True',
            'StratifiedKFold on the diagnosis',
            'TimeSeriesSplit on visit order',
            'GroupKFold with the patient ID as the group',
          ],
          3,
          'Grouping by patient keeps each patient’s visits together, so validation always uses unseen patients.',
        ),
      ],
    },
    {
      title: 'Refit preprocessing inside every fold; keep the test set out',
      explanation: [
        'Pass a pipeline, not a pre-scaled table, to cross-validation. Each round then fits the scaler and the model on that round’s training folds only, so the validation fold never shapes the preprocessing. cross_validate(..., return_estimator=True) returns each round’s fitted pipeline.',
        'Cross-validation guides choices, so it runs on the training data only. The final test set stays outside the whole process and is scored once at the end.',
      ],
      example: {
        code: 'from sklearn.model_selection import cross_validate\nfrom sklearn.pipeline import make_pipeline\nfrom sklearn.preprocessing import StandardScaler\nfrom sklearn.linear_model import LinearRegression\nX = [[0.0], [2.0], [4.0], [6.0]]\ny = [1.0, 2.0, 3.0, 4.0]\npipe = make_pipeline(StandardScaler(), LinearRegression())\nresult = cross_validate(pipe, X, y, cv=2, return_estimator=True)\nfor fitted in result["estimator"]:\n    print(fitted.named_steps["standardscaler"].mean_.tolist())',
        output: '[5.0]\n[1.0]',
        explanation:
          'Round one trains on 4 and 6, so its scaler mean is 5; round two trains on 0 and 2, so its mean is 1. Neither saw its validation rows.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'from sklearn.model_selection import cross_validate\nfrom sklearn.pipeline import make_pipeline\nfrom sklearn.preprocessing import StandardScaler\nfrom sklearn.linear_model import LinearRegression\nX = [[1.0], [2.0], [3.0], [10.0], [11.0], [12.0]]\ny = [1.0, 2.0, 3.0, 4.0, 5.0, 6.0]\npipe = make_pipeline(StandardScaler(), LinearRegression())\nresult = cross_validate(pipe, X, y, cv=3, return_estimator=True)\nfor fitted in result["estimator"]:\n    print(fitted.named_steps["standardscaler"].mean_.tolist())',
          [
            '[6.5]\n[6.5]\n[6.5]',
            '[1.5]\n[6.5]\n[11.5]',
            '[9.0]\n[6.5]\n[4.0]',
            '[4.0]\n[6.5]\n[9.0]',
          ],
          2,
          'Each round’s scaler sees only that round’s four training rows; the first round leaves out 1 and 2, so its mean is 36 / 4 = 9.',
        ),
        choose(
          'You standardize all 1,000 rows, then run 5-fold cross-validation on the scaled table. What is wrong?',
          [
            'Each validation fold helped set the scaling statistics its model trained with',
            'Standardized data cannot be cross-validated',
            'Five folds are too many for 1,000 rows',
            'Nothing; scaling never leaks',
          ],
          0,
          'The scaler learned from every row, including each round’s validation fold, so the scores are slightly optimistic.',
        ),
        choose(
          'Where does the final test set fit into cross-validation?',
          [
            'It is one of the k folds',
            'It is added to every training fold',
            'It replaces the validation fold in the last round',
            'It stays outside the process and is scored once at the end',
          ],
          3,
          'Cross-validation is used to make choices, so the test set must remain untouched until those choices are final.',
        ),
        predictOutput(
          'What does this program print?',
          'from sklearn.model_selection import cross_validate\nfrom sklearn.pipeline import make_pipeline\nfrom sklearn.preprocessing import StandardScaler\nfrom sklearn.linear_model import LinearRegression\nX = [[0.0], [2.0], [4.0], [6.0], [8.0]]\ny = [1.0, 2.0, 3.0, 4.0, 5.0]\nresult = cross_validate(make_pipeline(StandardScaler(), LinearRegression()), X, y, cv=5, scoring="neg_mean_squared_error", return_estimator=True)\nprint(len(result["estimator"]))',
          ['1', '4', '5', '6'],
          2,
          'Five rounds fit five separate pipelines, one per held-out fold.',
        ),
      ],
    },
  ],
  'ml-hyperparameter-search': [
    {
      title: 'Separate learned parameters from chosen hyperparameters',
      explanation: [
        'Parameters are learned by fit from the training data: coefficients, intercepts, and the split thresholds of a tree. Hyperparameters are set before fitting and control how fitting behaves: Ridge’s alpha, a tree’s max_depth, a learning rate.',
        'fit cannot choose hyperparameters, because training error always prefers the most flexible setting. They are chosen by comparing validation scores of candidate values.',
      ],
      example: {
        code: 'from sklearn.tree import DecisionTreeClassifier\nX = [[1], [2], [3], [7], [8], [9]]\ny = [0, 0, 0, 1, 1, 1]\ntree = DecisionTreeClassifier(max_depth=1, random_state=0).fit(X, y)\nprint(tree.get_params()["max_depth"])\nprint(tree.tree_.threshold[0])',
        output: '1\n5.0',
        explanation:
          'max_depth = 1 is a hyperparameter you supplied. The split threshold 5.0, halfway between 3 and 7, is a parameter the tree learned.',
      },
      questions: [
        choose(
          'Which of these is a hyperparameter?',
          [
            'A fitted linear-regression coefficient',
            'The intercept learned by fit',
            'The learning rate of gradient descent',
            'A split threshold chosen during tree fitting',
          ],
          2,
          'The learning rate is set before training and controls how fitting proceeds; the others are outputs of fit.',
        ),
        predictOutput(
          'What does this program print?',
          'from sklearn.linear_model import Ridge\nmodel = Ridge(alpha=2.0).fit([[-1.0], [0.0], [1.0]], [-2.0, 0.0, 2.0])\nprint(model.alpha)\nprint(round(float(model.coef_[0]), 3))',
          ['2.0\n2.0', '1.0\n2.0', '2.0\n1.0', '2.0\n0.5'],
          2,
          'alpha stays exactly as supplied; the coefficient is learned, and the penalty shrinks it from 2 to 1.',
        ),
        choose(
          'Where should a value for max_depth come from?',
          [
            'Comparing validation scores for several candidate depths',
            'The fit method, which learns it with the splits',
            'The depth with the best test score',
            'The deepest tree the data allow',
          ],
          0,
          'Hyperparameters are chosen by validation; training error alone always favours the deepest tree.',
        ),
        choose(
          'Which of these is learned from the training data rather than chosen beforehand?',
          [
            'Ridge’s alpha',
            'The number of folds in cross-validation',
            'A tree’s max_depth',
            'The weights of a linear regression',
          ],
          3,
          'Weights are outputs of fit; the other three are settings you pick before fitting.',
        ),
      ],
    },
    {
      title: 'Search a grid of combinations with cross-validation',
      explanation: [
        'GridSearchCV(model, grid, cv=k) tries every combination of the listed hyperparameter values, scores each with k-fold cross-validation, and records the results in cv_results_. A grid of 3 depths and 2 leaf sizes has 3 * 2 = 6 combinations, so it fits 6 * k models.',
        'best_params_ is the combination with the highest mean validation score, and best_score_ is that mean. For classifiers, the default score is the fraction of correct predictions; for regression you can pass scoring="neg_mean_squared_error".',
      ],
      example: {
        code: 'from sklearn.model_selection import GridSearchCV\nfrom sklearn.tree import DecisionTreeClassifier\nX = [[1], [2], [3], [4], [5], [6], [7], [8]]\ny = [0, 0, 1, 0, 1, 1, 1, 1]\ngrid = {"max_depth": [1, 2, 3], "min_samples_leaf": [1, 2]}\nsearch = GridSearchCV(DecisionTreeClassifier(random_state=0), grid, cv=2)\nsearch.fit(X, y)\nprint(len(search.cv_results_["params"]))\nprint(search.best_params_)',
        output: "6\n{'max_depth': 1, 'min_samples_leaf': 1}",
        explanation:
          'Six combinations were scored. Deeper trees did no better on the held-out folds, so the simplest tree wins.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'grid = {"max_depth": [2, 4, 6, 8], "min_samples_leaf": [1, 5, 10]}\ncombos = len(grid["max_depth"]) * len(grid["min_samples_leaf"])\nfolds = 5\nprint(combos, combos * folds)',
          ['7 35', '12 12', '12 60', '12 61'],
          2,
          'Four depths times three leaf sizes make 12 combinations, each fitted once per fold.',
        ),
        predictOutput(
          'What does this program print?',
          'from sklearn.model_selection import GridSearchCV\nfrom sklearn.linear_model import Ridge\nX = [[0.0], [1.0], [2.0], [3.0], [4.0], [5.0]]\ny = [0.2, 1.9, 4.1, 6.2, 7.8, 10.1]\nsearch = GridSearchCV(Ridge(), {"alpha": [0.01, 1.0, 100.0]}, cv=3, scoring="neg_mean_squared_error")\nsearch.fit(X, y)\nprint(search.best_params_)\nprint(round(float(-search.best_score_), 3))',
          [
            "{'alpha': 100.0}\n0.04",
            "{'alpha': 0.01}\n-0.04",
            "{'alpha': 1.0}\n0.04",
            "{'alpha': 0.01}\n0.04",
          ],
          3,
          'The data are almost exactly linear, so the weakest penalty validates best. best_score_ is a negated MSE, so negating it gives 0.04.',
        ),
        choose(
          'A grid has 5 alphas, 4 depths, and 3 leaf sizes, scored with 5-fold cross-validation. How many models are fitted before the final refit?',
          ['12', '60', '17', '300'],
          3,
          '5 * 4 * 3 = 60 combinations, each fitted once per fold: 60 * 5 = 300.',
        ),
        choose(
          'What does search.best_score_ report after GridSearchCV?',
          [
            'The best combination’s mean score across the validation folds',
            'The best combination’s score on the test set',
            'The best combination’s training score',
            'The highest single-fold score of any combination',
          ],
          0,
          'Each combination is ranked by its average validation score; best_score_ is the winner’s average.',
        ),
      ],
    },
    {
      title: 'Sample at random, and expect the winner to be optimistic',
      explanation: [
        'RandomizedSearchCV samples n_iter combinations from the listed values instead of trying them all. With many hyperparameters, a fixed budget of random combinations often finds good settings far more cheaply than a full grid.',
        'Validation scores contain chance variation. The more combinations you try, the more likely the top score benefited from luck, so the best validation score is an optimistic estimate of how the chosen settings will do on new data.',
      ],
      example: {
        code: 'import numpy as np\nrng = np.random.default_rng(0)\nscores = 0.80 + rng.normal(0, 0.02, size=50)\nprint(round(float(scores.mean()), 3), round(float(scores.max()), 3))',
        output: '0.803 0.839',
        explanation:
          'Here 50 equally good settings get a true score of 0.80 plus seeded random noise. Picking the maximum reports 0.839, an advantage that comes entirely from luck.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'from sklearn.model_selection import RandomizedSearchCV\nfrom sklearn.tree import DecisionTreeClassifier\nX = [[1], [2], [3], [4], [5], [6], [7], [8]]\ny = [0, 0, 1, 0, 1, 1, 1, 1]\nspace = {"max_depth": [1, 2, 3, 4, 5], "min_samples_leaf": [1, 2, 3]}\nsearch = RandomizedSearchCV(DecisionTreeClassifier(random_state=0), space, n_iter=4, cv=2, random_state=0)\nsearch.fit(X, y)\nprint(len(search.cv_results_["params"]))',
          ['15', '8', '4', '2'],
          2,
          'Randomized search evaluates only n_iter = 4 of the 15 possible combinations.',
        ),
        choose(
          'You tried 500 configurations. The best validation score is 0.91 and the median is 0.86. What should you expect on fresh data?',
          [
            'Exactly 0.91',
            'Probably somewhat below 0.91, because the maximum partly reflects luck',
            'Above 0.91, because the model will keep improving',
            'Exactly 0.86, the median',
          ],
          1,
          'Selecting the maximum of many noisy scores favours lucky ones, so the winner’s score overstates its true performance.',
        ),
        choose(
          'When is randomized search usually preferable to a full grid?',
          [
            'When there are many hyperparameters and a limited budget of fits',
            'When there is a single hyperparameter with two values',
            'When every combination must be tried',
            'When no validation data are available',
          ],
          0,
          'A grid grows multiplicatively with each hyperparameter; random sampling keeps the cost fixed.',
        ),
        predictOutput(
          'What does this program print?',
          'validation = [0.84, 0.86, 0.91, 0.85]\ntest = [0.83, 0.85, 0.84, 0.84]\nbest = 0\nfor i in range(len(validation)):\n    if validation[i] > validation[best]:\n        best = i\nprint(validation[best], test[best])',
          ['0.91 0.84', '0.91 0.91', '0.86 0.85', '0.84 0.83'],
          0,
          'The configuration chosen for its 0.91 validation score scores only 0.84 on new data, a typical drop for a selected winner.',
        ),
      ],
    },
    {
      title: 'Refit the winner, test once, and nest to judge the search',
      explanation: [
        'After the search, refit the chosen settings on all of the training data. GridSearchCV does this by default and stores the result in best_estimator_. Then score that model once on the untouched test set; tuning again after seeing the test score turns the test set into validation data.',
        'Nested cross-validation estimates how well the whole selection procedure works: an outer loop of folds holds out data for evaluation, and inside each outer training part an inner cross-validation picks the hyperparameters.',
      ],
      example: {
        code: 'from sklearn.model_selection import GridSearchCV\nfrom sklearn.tree import DecisionTreeClassifier\nX_train = [[1], [2], [3], [4], [5], [6], [7], [8]]\ny_train = [0, 0, 0, 0, 1, 1, 1, 1]\nX_test = [[2.5], [6.5]]\ny_test = [0, 1]\nsearch = GridSearchCV(DecisionTreeClassifier(random_state=0), {"max_depth": [1, 2, 3]}, cv=2)\nsearch.fit(X_train, y_train)\nprint(search.best_params_)\nprint(search.best_estimator_.predict(X_test).tolist(), y_test)',
        output: "{'max_depth': 1}\n[0, 1] [0, 1]",
        explanation:
          'The search picks depth 1 on the training data, refits it there, and the test rows are used once, only to check that final model.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'from sklearn.model_selection import GridSearchCV\nfrom sklearn.tree import DecisionTreeClassifier\nX_train = [[1], [2], [3], [4], [5], [6], [7], [8]]\ny_train = [0, 0, 0, 0, 1, 1, 1, 1]\nsearch = GridSearchCV(DecisionTreeClassifier(random_state=0), {"max_depth": [1, 2, 3]}, cv=2)\nsearch.fit(X_train, y_train)\nprint(int(search.best_estimator_.tree_.n_node_samples[0]))',
          ['4', '2', '10', '8'],
          3,
          'The root node counts the rows the final tree was fitted on: all eight training rows, not one fold’s four.',
        ),
        choose(
          'What is nested cross-validation for?',
          [
            'Training on the test labels safely',
            'Estimating how well the whole tuning procedure performs on held-out data',
            'Making grid search run faster',
            'Guaranteeing that every configuration wins once',
          ],
          1,
          'Inner folds choose settings; outer folds score the result, so the estimate includes the effect of tuning.',
        ),
        choose(
          'After tuning, the test score disappoints, so the team adjusts the grid and searches again. What is the problem?',
          [
            'Grid search cannot be run twice',
            'The new search will be slower',
            'The test set is now guiding choices, so its score is no longer an unbiased final estimate',
            'Nothing; the test set exists to guide tuning',
          ],
          2,
          'Once its score influences decisions, the test set is effectively validation data.',
        ),
        predictOutput(
          'What does this program print?',
          'outer_folds = 5\ncombinations = 4\ninner_folds = 3\ninner_fits = outer_folds * combinations * inner_folds\nprint(inner_fits, inner_fits + outer_folds)',
          ['60 65', '12 17', '60 60', '20 25'],
          0,
          'Each of the 5 outer rounds scores 4 combinations with 3 inner folds, then refits its winner once.',
        ),
      ],
    },
  ],
  'ml-decision-trees': [
    {
      title: 'Route a row through threshold questions to a leaf',
      explanation: [
        'A decision tree asks one question at each node, such as income <= 40, and sends the row left when the answer is true and right when it is false. The row stops at a leaf, which supplies the prediction: the majority class of its training rows for classification, or their mean target for regression.',
        'DecisionTreeClassifier learns these questions with fit and follows them with predict. A value exactly equal to a threshold satisfies <=, so it goes left.',
      ],
      example: {
        code: 'def predict(row):\n    if row["income"] <= 40:\n        if row["debt"] <= 10:\n            return "approve"\n        return "review"\n    return "approve"\n\nprint(predict({"income": 30, "debt": 15}))\nprint(predict({"income": 55, "debt": 15}))',
        output: 'review\napprove',
        explanation:
          'The first row has income 30, so it goes left, where its debt of 15 fails the second test. The second row goes right at the first question and reaches a leaf immediately.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'def predict(row):\n    if row["temp"] <= 20:\n        return "jacket"\n    if row["rain"] <= 0:\n        return "t-shirt"\n    return "umbrella"\n\nprint(predict({"temp": 20, "rain": 3}))\nprint(predict({"temp": 25, "rain": 3}))',
          [
            'jacket\numbrella',
            'umbrella\numbrella',
            'jacket\nt-shirt',
            't-shirt\numbrella',
          ],
          0,
          'temp 20 satisfies <= 20, so the first row stops at "jacket". The second row passes on and has rain above 0.',
        ),
        predictOutput(
          'What does this program print?',
          'from sklearn.tree import DecisionTreeClassifier\nX = [[1], [3], [4], [8], [9], [10]]\ny = [0, 0, 0, 1, 1, 1]\ntree = DecisionTreeClassifier(max_depth=1, random_state=0).fit(X, y)\nprint(tree.tree_.threshold[0])\nprint(tree.predict([[5], [7]]).tolist())',
          ['6.0\n[0, 0]', '4.0\n[1, 1]', '6.0\n[0, 1]', '5.5\n[0, 1]'],
          2,
          'The learned threshold is the midpoint between 4 and 8. Then 5 goes left to class 0 and 7 goes right to class 1.',
        ),
        choose(
          'A tree’s first question is age <= 30. Where does a row with age 30 go?',
          [
            'Right, because 30 is not below 30',
            'Left, because 30 <= 30 is true',
            'Down both branches, then the results are averaged',
            'Nowhere; ties are dropped',
          ],
          1,
          'The test includes equality, so 30 takes the true branch.',
        ),
        choose(
          'What does a leaf of a regression tree predict?',
          [
            'The most common class among its training rows',
            'The threshold of its parent node',
            'A weighted sum of the row’s features',
            'The mean target of the training rows that reached it',
          ],
          3,
          'A regression leaf summarizes its training rows numerically, usually with their mean target.',
        ),
      ],
    },
    {
      title: 'Measure a node’s mixture with Gini impurity',
      explanation: [
        'Gini impurity is 1 minus the sum of squared class proportions. A pure node, with only one class, has impurity 0. A two-class node is most mixed at a 50/50 split, where the impurity is 0.5.',
        'To compute it, count each class with a dictionary, turn counts into proportions, and subtract the sum of their squares from 1.',
      ],
      example: {
        code: 'def gini(labels):\n    counts = {}\n    for label in labels:\n        counts[label] = counts.get(label, 0) + 1\n    total = len(labels)\n    return 1 - sum([(c / total) ** 2 for c in counts.values()])\n\nprint(gini(["a", "a", "a", "a"]))\nprint(gini(["a", "a", "b", "b"]))\nprint(round(gini(["a", "a", "a", "b"]), 3))',
        output: '0.0\n0.5\n0.375',
        explanation:
          'A pure node scores 0. Two equal classes give 1 - (0.25 + 0.25) = 0.5. A 3:1 mix gives 1 - (0.5625 + 0.0625) = 0.375.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'def gini(labels):\n    counts = {}\n    for label in labels:\n        counts[label] = counts.get(label, 0) + 1\n    total = len(labels)\n    return 1 - sum([(c / total) ** 2 for c in counts.values()])\n\nprint(round(gini(["x", "y", "z"]), 3))',
          ['0.5', '0.667', '1.0', '0.333'],
          1,
          'Each class has proportion 1/3, so the impurity is 1 - 3 * (1/9) ≈ 0.667. With three classes it can exceed 0.5.',
        ),
        predictOutput(
          'What does this program print?',
          'def gini(labels):\n    counts = {}\n    for label in labels:\n        counts[label] = counts.get(label, 0) + 1\n    total = len(labels)\n    return 1 - sum([(c / total) ** 2 for c in counts.values()])\n\nprint(round(gini([1, 1, 1, 1, 0]), 3))',
          ['0.2', '0.8', '0.68', '0.32'],
          3,
          'The proportions are 0.8 and 0.2, so the impurity is 1 - (0.64 + 0.04) = 0.32.',
        ),
        choose(
          'Which node is the purest?',
          [
            '5 spam and 5 ham',
            '6 spam and 4 ham',
            '9 spam and 1 ham',
            '3 spam and 3 ham',
          ],
          2,
          'A 9:1 node is closest to a single class, so its Gini impurity (0.18) is the lowest.',
        ),
        choose(
          'A node holds two classes. At what mix is its Gini impurity highest?',
          [
            'An even 50/50 split',
            'A 90/10 split',
            'When it holds a single class',
            'It is the same for every mix',
          ],
          0,
          'Impurity peaks at 0.5 when the two classes are equally common, and falls to 0 as one class takes over.',
        ),
      ],
    },
    {
      title: 'Pick the split with the lowest weighted impurity',
      explanation: [
        'To score a candidate threshold, split the rows into a left and a right child, compute each child’s impurity, and weight it by the child’s share of the rows. The tree chooses the feature and threshold whose weighted impurity is lowest.',
        'Candidate thresholds are midpoints between neighbouring sorted values, which is why fitted thresholds often fall halfway between two training values.',
      ],
      example: {
        code: 'def gini(labels):\n    counts = {}\n    for label in labels:\n        counts[label] = counts.get(label, 0) + 1\n    return 1 - sum([(c / len(labels)) ** 2 for c in counts.values()])\n\nx = [1, 2, 3, 4, 5, 6]\ny = [0, 0, 1, 0, 1, 1]\nfor t in [2.5, 3.5]:\n    left = [y[i] for i in range(6) if x[i] <= t]\n    right = [y[i] for i in range(6) if x[i] > t]\n    score = len(left) / 6 * gini(left) + len(right) / 6 * gini(right)\n    print(t, round(score, 3))',
        output: '2.5 0.25\n3.5 0.444',
        explanation:
          'At 2.5 the left child [0, 0] is pure and the right child [1, 0, 1, 1] scores 0.375, weighted by 4/6. At 3.5 both children are mixed, so 2.5 is the better split.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'def gini(labels):\n    counts = {}\n    for label in labels:\n        counts[label] = counts.get(label, 0) + 1\n    return 1 - sum([(c / len(labels)) ** 2 for c in counts.values()])\n\nx = [1, 2, 3, 4]\ny = [0, 0, 1, 1]\nfor t in [1.5, 2.5]:\n    left = [y[i] for i in range(4) if x[i] <= t]\n    right = [y[i] for i in range(4) if x[i] > t]\n    print(t, round(len(left) / 4 * gini(left) + len(right) / 4 * gini(right), 3))',
          [
            '1.5 0.444\n2.5 0.0',
            '1.5 0.333\n2.5 0.0',
            '1.5 0.0\n2.5 0.333',
            '1.5 0.333\n2.5 0.5',
          ],
          1,
          'At 1.5 the right child [0, 1, 1] scores 0.444, weighted by 3/4. At 2.5 both children are pure.',
        ),
        choose(
          'Why is each child’s impurity weighted by its share of the rows?',
          [
            'So a tiny pure child cannot outweigh a large mixed one',
            'Because larger children are always purer',
            'To make the weights add up to the tree depth',
            'Because the left child is always more important',
          ],
          0,
          'Splitting off one pure row barely helps; weighting by size reflects how many rows each child actually describes.',
        ),
        choose(
          'A candidate split sends every row to the left child. How much does it reduce impurity?',
          [
            'By half',
            'All the way to zero',
            'Not at all; the child is the same as the parent',
            'It depends on the threshold value',
          ],
          2,
          'The left child holds exactly the parent’s rows, so the weighted impurity is unchanged.',
        ),
        predictOutput(
          'What does this program print?',
          'from sklearn.tree import DecisionTreeClassifier\nX = [[1], [2], [3], [7], [8], [9]]\nX_km = [[1000], [2000], [3000], [7000], [8000], [9000]]\ny = [0, 0, 0, 1, 1, 1]\na = DecisionTreeClassifier(random_state=0).fit(X, y)\nb = DecisionTreeClassifier(random_state=0).fit(X_km, y)\nprint(a.tree_.threshold[0], b.tree_.threshold[0])',
          ['5.0 5.0', '5.0 5000.0', '3.0 3000.0', '5.0 0.005'],
          1,
          'Both trees split between the third and fourth rows, at the midpoint of those values in each unit.',
        ),
      ],
    },
    {
      title: 'Limit depth to stop memorizing; skip scaling',
      explanation: [
        'An unlimited tree keeps splitting until every leaf is pure, so it can fit every training row, noise included. Limits such as max_depth or min_samples_leaf stop it earlier; choose them on validation data. score(X, y) on a classifier returns the fraction of rows predicted correctly.',
        'A tree only compares one feature with a threshold at a time. Multiplying a feature by a positive constant moves the thresholds but sends every row to the same leaf, so trees do not need standardized features.',
      ],
      example: {
        code: 'from sklearn.tree import DecisionTreeClassifier\nX = [[1], [2], [3], [4], [5], [6], [7], [8]]\ny = [0, 0, 1, 0, 1, 1, 0, 1]\nfor depth in [1, None]:\n    tree = DecisionTreeClassifier(max_depth=depth, random_state=0).fit(X, y)\n    print(depth, tree.get_depth(), tree.score(X, y))',
        output: '1 1 0.75\nNone 5 1.0',
        explanation:
          'With no limit, the tree grows five levels deep to classify every training row correctly, including the isolated labels at 3 and 7 that are likely noise.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'from sklearn.tree import DecisionTreeClassifier\nX = [[1], [2], [3], [4], [5], [6], [7], [8]]\ny = [0, 0, 1, 0, 1, 1, 0, 1]\nfor leaf in [1, 3]:\n    tree = DecisionTreeClassifier(min_samples_leaf=leaf, random_state=0).fit(X, y)\n    print(leaf, tree.get_n_leaves(), tree.score(X, y))',
          [
            '1 6 1.0\n3 6 1.0',
            '1 2 0.75\n3 6 1.0',
            '1 8 1.0\n3 3 0.75',
            '1 6 1.0\n3 2 0.75',
          ],
          3,
          'Requiring at least three rows per leaf forbids the tiny leaves that isolate single rows, so the tree stays small and no longer fits every row.',
        ),
        choose(
          'An unlimited-depth tree scores 100% on training rows and 70% on validation rows. What should you try?',
          [
            'Remove max_depth entirely',
            'Standardize the features first',
            'Limit max_depth or raise min_samples_leaf, choosing the value on validation data',
            'Score the tree on the training rows only',
          ],
          2,
          'The gap shows overfitting; growth limits stop the tree from memorizing training noise.',
        ),
        choose(
          'Why is standardizing usually unnecessary for a decision tree?',
          [
            'Positive rescaling keeps each feature’s order, so the same rows fall on each side of a threshold',
            'Trees cannot read numeric features',
            'Scaling would change the labels',
            'Trees use only one feature',
          ],
          0,
          'A threshold test depends only on order, which multiplying by a positive constant does not change.',
        ),
        predictOutput(
          'What does this program print?',
          'from sklearn.tree import DecisionTreeClassifier\nX = [[1], [2], [3], [7], [8], [9]]\nX_km = [[1000], [2000], [3000], [7000], [8000], [9000]]\ny = [0, 0, 0, 1, 1, 1]\na = DecisionTreeClassifier(random_state=0).fit(X, y)\nb = DecisionTreeClassifier(random_state=0).fit(X_km, y)\nprint(a.predict([[4]]).tolist(), b.predict([[4000]]).tolist())',
          ['[0] [1]', '[1] [0]', '[0] [0]', '[1] [1]'],
          2,
          'The same row in either unit lands on the same side of its tree’s threshold, so both predictions agree.',
        ),
      ],
    },
  ],
  'ml-svm': [
    {
      title: 'Classify by the sign of a linear decision score',
      explanation: [
        'A linear support vector classifier computes a score w·x + b and predicts the positive class when the score is positive. The boundary is where the score is 0. The margin is the band where the score lies between -1 and 1; training seeks the widest margin that keeps the classes apart.',
        'SVC(kernel="linear") learns w and b. decision_function(X) returns the scores, and predict(X) returns their sign as a class.',
      ],
      example: {
        code: 'from sklearn.svm import SVC\nX = [[0.0], [1.0], [3.0], [4.0]]\ny = [0, 0, 1, 1]\nmodel = SVC(kernel="linear", C=1.0).fit(X, y)\nprint(model.decision_function([[0.0], [2.5], [5.0]]).round(3).tolist())\nprint(model.predict([[1.8], [2.2]]).tolist())',
        output: '[-2.0, 0.5, 3.0]\n[0, 1]',
        explanation:
          'The learned score is x - 2: the boundary sits at 2, midway between the closest points 1 and 3, which lie exactly on the margin at -1 and +1.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'import numpy as np\nw = np.array([1.0, 2.0])\nb = -4.0\npoints = np.array([[1.0, 1.0], [2.0, 2.0], [0.0, 3.0]])\nscores = points @ w + b\nprint(scores.tolist())\nprint([int(s > 0) for s in scores])',
          [
            '[-1.0, 2.0, 2.0]\n[0, 1, 1]',
            '[3.0, 6.0, 6.0]\n[1, 1, 1]',
            '[-1.0, 2.0, 2.0]\n[1, 0, 0]',
            '[-1.0, 6.0, 2.0]\n[0, 1, 1]',
          ],
          0,
          'Each score is x1 + 2*x2 - 4, so the first point falls on the negative side and the other two on the positive side.',
        ),
        choose(
          'A correctly classified training point has decision score 2.7. Does it lie inside the margin?',
          [
            'Yes; every correct point lies inside the margin',
            'Yes, because its score is positive',
            'No; it lies beyond the margin edge at score 1',
            'It lies exactly on the boundary',
          ],
          2,
          'The margin spans scores from -1 to 1, so 2.7 is comfortably outside it.',
        ),
        choose(
          'What does a linear SVM try to make as wide as possible?',
          [
            'The margin between the classes',
            'The number of features',
            'The training error',
            'The decision score of every point',
          ],
          0,
          'Among boundaries that separate the classes, it prefers the one with the widest gap to the nearest points.',
        ),
        predictOutput(
          'What does this program print?',
          'from sklearn.svm import SVC\nX = [[0.0], [1.0], [3.0], [4.0]]\ny = [0, 0, 1, 1]\nmodel = SVC(kernel="linear", C=1.0).fit(X, y)\nprint(model.predict([[1.5], [2.9], [10.0]]).tolist())',
          ['[0, 0, 1]', '[1, 1, 1]', '[0, 1, 0]', '[0, 1, 1]'],
          3,
          'The boundary is at 2, so 1.5 is negative while 2.9 and 10 are positive; distance beyond the margin does not flip the class.',
        ),
      ],
    },
    {
      title: 'Find the support vectors that fix the boundary',
      explanation: [
        'Support vectors are the training points on the margin edge or inside it. They alone determine the fitted boundary: removing or moving any other point, as long as it stays beyond the margin, leaves the model unchanged.',
        'A fitted SVC lists their row positions in support_ and counts them per class in n_support_.',
      ],
      example: {
        code: 'from sklearn.svm import SVC\nX = [[0.0], [1.0], [3.0], [4.0], [10.0]]\ny = [0, 0, 1, 1, 1]\nmodel = SVC(kernel="linear", C=10.0).fit(X, y)\nprint(model.support_.tolist())\nprint(model.n_support_.tolist())',
        output: '[1, 2]\n[1, 1]',
        explanation:
          'Only the points at 1 and 3, rows 1 and 2, touch the margin. The far points at 0, 4, and 10 do not constrain the boundary.',
      },
      questions: [
        predictOutput(
          'The second model is fitted on the two support vectors only. What does this program print?',
          'from sklearn.svm import SVC\nfull = SVC(kernel="linear", C=10.0).fit([[0.0], [1.0], [3.0], [4.0], [10.0]], [0, 0, 1, 1, 1])\nsmall = SVC(kernel="linear", C=10.0).fit([[1.0], [3.0]], [0, 1])\nprint(full.decision_function([[2.5]]).round(3).tolist(), small.decision_function([[2.5]]).round(3).tolist())',
          ['[0.5] [0.5]', '[0.5] [1.5]', '[1.5] [0.5]', '[0.25] [0.5]'],
          0,
          'The non-support points did not influence the fit, so both models learn the same boundary and score.',
        ),
        choose(
          'Which training points are support vectors?',
          [
            'The points farthest from the boundary',
            'Every point of the minority class',
            'The points on the margin edge or inside it',
            'A random sample chosen during fit',
          ],
          2,
          'Points on or inside the margin are the ones that hold the boundary in place.',
        ),
        choose(
          'You delete a correctly classified training point that lies far outside the margin and refit. What happens to the boundary?',
          [
            'It moves toward the deleted point',
            'It stays the same',
            'It flips orientation',
            'The model can no longer be fitted',
          ],
          1,
          'Only support vectors determine the solution, and a far point is not one of them.',
        ),
        predictOutput(
          'What does this program print?',
          'from sklearn.svm import SVC\nX = [[0.0], [1.0], [3.0], [4.0]]\ny = [0, 0, 1, 1]\nmodel = SVC(kernel="linear", C=1.0).fit(X, y)\nprint(model.support_.tolist(), model.n_support_.tolist())',
          [
            '[0, 3] [1, 1]',
            '[1, 2] [2, 2]',
            '[0, 1, 2, 3] [2, 2]',
            '[1, 2] [1, 1]',
          ],
          3,
          'The points at 1 and 3 sit on the margin edges, one from each class; the outer points do not.',
        ),
      ],
    },
    {
      title: 'Trade margin width against violations with C; scale first',
      explanation: [
        'Real classes overlap, so a soft margin lets some points fall inside it or on the wrong side, at a cost multiplied by C. A small C tolerates violations and keeps a wide margin with many support vectors, which is stronger regularization. A large C punishes violations and fits the training rows more tightly.',
        'The margin is measured in feature units, so a feature in large units dominates the geometry. Put StandardScaler before SVC in a pipeline, and choose C on validation data.',
      ],
      example: {
        code: 'from sklearn.svm import SVC\nX = [[0.0], [1.0], [2.0], [2.5], [3.0], [4.0], [5.0]]\ny = [0, 0, 0, 1, 0, 1, 1]\nfor C in [0.1, 100.0]:\n    model = SVC(kernel="linear", C=C).fit(X, y)\n    print(C, int(model.n_support_.sum()), round(model.score(X, y), 3))',
        output: '0.1 6 0.714\n100.0 4 0.857',
        explanation:
          'With C = 0.1, the wide margin holds six support vectors and more training mistakes. With C = 100, the margin narrows and the training fit improves. score returns the fraction of rows classified correctly.',
      },
      questions: [
        choose(
          'What does increasing C generally do in an SVM?',
          [
            'Tolerates more margin violations',
            'Penalizes violations more, fitting training rows more tightly',
            'Removes every support vector',
            'Converts the scores into calibrated probabilities',
          ],
          1,
          'C multiplies the violation cost, so a larger C means weaker regularization.',
        ),
        predictOutput(
          'The class depends only on the first feature. What does this program print?',
          'from sklearn.svm import SVC\nfrom sklearn.pipeline import make_pipeline\nfrom sklearn.preprocessing import StandardScaler\nX = [[0, 1000], [0, 3000], [0, 5000], [1, 2000], [1, 4000], [1, 6000]]\ny = [0, 0, 0, 1, 1, 1]\ntest = [[0, 5900], [1, 1100]]\nraw = SVC(kernel="rbf").fit(X, y)\nscaled = make_pipeline(StandardScaler(), SVC(kernel="rbf")).fit(X, y)\nprint(raw.predict(test).tolist(), scaled.predict(test).tolist())',
          ['[0, 1] [0, 1]', '[0, 1] [1, 0]', '[1, 0] [1, 0]', '[1, 0] [0, 1]'],
          3,
          'Unscaled, the thousands in the second column dominate every distance, so the model matches on the irrelevant feature. After scaling, the first feature counts again.',
        ),
        choose(
          'Validation accuracy is poor with C = 1000 although training accuracy is perfect. Which change is most sensible to try?',
          [
            'A smaller C, chosen on validation data',
            'An even larger C',
            'Removing the scaler',
            'Training on the validation rows',
          ],
          0,
          'A huge C fits the training rows too tightly; a smaller C widens the margin and regularizes more.',
        ),
        choose(
          'Why should features usually be standardized before an SVM?',
          [
            'SVMs only accept integers',
            'Scaling guarantees the classes become separable',
            'Margins and distances are measured in feature units, so large-unit features would dominate',
            'Scaling turns the decision score into a probability',
          ],
          2,
          'Without scaling, a feature measured in thousands outweighs one measured in units for no real reason.',
        ),
      ],
    },
    {
      title: 'Bend the boundary with an RBF kernel and gamma',
      explanation: [
        'Some classes cannot be separated by a straight boundary, such as a class in the middle of a line with the other class on both sides. kernel="rbf" compares points by similarity exp(-gamma * distance**2), which is 1 for identical points and fades with distance, allowing curved boundaries.',
        'gamma sets how quickly similarity fades. A large gamma makes each training point influence only its immediate neighbourhood, so the boundary can wrap around single points and overfit. Tune gamma together with C on validation data.',
      ],
      example: {
        code: 'from sklearn.svm import SVC\nX = [[-3.0], [-2.0], [-1.0], [0.0], [1.0], [2.0], [3.0]]\ny = [0, 0, 1, 1, 1, 0, 0]\nlinear = SVC(kernel="linear").fit(X, y)\nrbf = SVC(kernel="rbf", gamma=1.0).fit(X, y)\nprint(round(linear.score(X, y), 3), rbf.score(X, y))\nprint(rbf.predict([[-2.5], [0.5], [2.5]]).tolist())',
        output: '0.571 1.0\n[0, 1, 0]',
        explanation:
          'No single threshold puts the middle class on one side, so the linear model fails. The RBF model encloses the middle interval.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'import math\ngamma = 0.5\nprint([round(math.exp(-gamma * d ** 2), 3) for d in [0, 1, 2]])',
          [
            '[0.0, 0.607, 0.135]',
            '[1.0, 0.5, 0.25]',
            '[1.0, 0.607, 0.135]',
            '[1.0, 0.368, 0.018]',
          ],
          2,
          'At distance 0 the similarity is exp(0) = 1, and it decays as exp(-0.5 * d**2) with distance.',
        ),
        predictOutput(
          'What does this program print?',
          'import math\ndistance = 2\nfor gamma in [0.1, 2.0]:\n    print(gamma, round(math.exp(-gamma * distance ** 2), 4))',
          [
            '0.1 0.0003\n2.0 0.6703',
            '0.1 0.6703\n2.0 0.0003',
            '0.1 0.8187\n2.0 0.0183',
            '0.1 0.6703\n2.0 0.6703',
          ],
          1,
          'With a small gamma, a point two units away is still fairly similar; with a large gamma, it barely counts.',
        ),
        choose(
          'An RBF SVM with a very large gamma scores 100% on training rows and poorly on validation rows. What is happening?',
          [
            'Each point influences only a tiny neighbourhood, so the boundary wraps around individual training rows',
            'The boundary has become a straight line',
            'gamma is too small to fit the data',
            'The kernel ignores the training data',
          ],
          0,
          'Very local influence lets the model memorize single points, which is overfitting.',
        ),
        choose(
          'When is an RBF kernel a better choice than a linear one?',
          [
            'When the classes are already separable by a straight boundary',
            'When the classes need a curved boundary, as validation results confirm',
            'Whenever there are fewer than ten rows',
            'When features are measured in different units',
          ],
          1,
          'The RBF kernel adds flexibility for curved boundaries; validation shows whether that flexibility helps.',
        ),
      ],
    },
  ],
  'ml-ensembles': [
    {
      title: 'Combine predictions by voting or averaging',
      explanation: [
        'An ensemble combines several models. For classification, a majority vote takes the class most models predict; for regression, the predictions are averaged.',
        'Combining helps when the models make different mistakes, so one model’s error is outvoted or averaged away by the others. Models that all fail on the same rows gain nothing from being combined.',
      ],
      example: {
        code: 'predictions = [[1, 0, 1, 0], [1, 1, 0, 0], [0, 1, 1, 0]]\ncombined = []\nfor j in range(4):\n    ones = sum([model[j] for model in predictions])\n    if ones >= 2:\n        combined.append(1)\n    else:\n        combined.append(0)\nprint(combined)',
        output: '[1, 1, 1, 0]',
        explanation:
          'If the true labels are [1, 1, 1, 0], each model makes one mistake, each on a different row, so the majority vote gets every row right.',
      },
      questions: [
        predictOutput(
          'Each row of the array holds one model’s predictions. What does this program print?',
          'import numpy as np\npredictions = np.array([[10.0, 20.0, 30.0], [14.0, 18.0, 33.0], [12.0, 22.0, 27.0]])\nprint(predictions.mean(axis=0).tolist())',
          [
            '[20.0, 21.67, 24.0]',
            '[12.0, 20.0, 30.0]',
            '[60.0, 65.0, 66.0]',
            '[36.0, 60.0, 90.0]',
          ],
          1,
          'axis=0 averages down each column, giving one combined prediction per observation.',
        ),
        predictOutput(
          'The true labels are [1, 1, 0]. What does this program print?',
          'predictions = [[0, 1, 0], [0, 1, 0], [1, 1, 0]]\ncombined = []\nfor j in range(3):\n    ones = sum([model[j] for model in predictions])\n    if ones >= 2:\n        combined.append(1)\n    else:\n        combined.append(0)\nprint(combined)',
          ['[1, 1, 0]', '[0, 1, 1]', '[1, 1, 1]', '[0, 1, 0]'],
          3,
          'Two models make the same mistake on the first row, so the vote repeats it.',
        ),
        choose(
          'When does averaging several models help the most?',
          [
            'When their errors are weakly correlated',
            'When they are identical copies',
            'When they all fail on the same rows',
            'When each uses the test labels',
          ],
          0,
          'Different mistakes offset each other; identical mistakes survive any average.',
        ),
        choose(
          'Three identical copies of one model are averaged. How do the ensemble’s predictions compare with the single model’s?',
          [
            'They are three times larger',
            'They are more accurate',
            'They are exactly the same',
            'They become a majority vote',
          ],
          2,
          'Averaging three equal numbers returns that number, so the ensemble adds nothing.',
        ),
      ],
    },
    {
      title: 'Bag models on bootstrap samples',
      explanation: [
        'A bootstrap sample draws as many rows as the training set has, at random with replacement, so some rows appear several times and others not at all; on average about a third are left out. Bagging fits one model per bootstrap sample and combines them.',
        'Deep decision trees change a lot when the training rows change. Averaging many trees fitted on different samples smooths out that variability. Rows left out of a sample, the out-of-bag rows, can act as validation data for that model.',
      ],
      example: {
        code: 'import numpy as np\nrng = np.random.default_rng(1)\nrows = np.arange(8)\nsample = rng.choice(rows, size=8, replace=True)\nprint(np.sort(sample).tolist())\nprint(np.setdiff1d(rows, sample).tolist())',
        output: '[0, 1, 3, 4, 6, 6, 7, 7]\n[2, 5]',
        explanation:
          'rng.choice draws 8 row numbers with replacement from a seeded generator. Rows 6 and 7 were drawn twice, and np.setdiff1d shows that rows 2 and 5 are out of bag.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'rows = [0, 1, 2, 3, 4, 5]\nsample = [2, 0, 2, 5, 3, 0]\nout_of_bag = [r for r in rows if r not in sample]\nprint(len(sample), out_of_bag)',
          ['6 [1, 4]', '4 [1, 4]', '6 [0, 2]', '6 []'],
          0,
          'The sample still has six draws, but rows 0 and 2 repeat, so rows 1 and 4 never appear.',
        ),
        choose(
          'What does sampling "with replacement" mean for a bootstrap sample?',
          [
            'Each row appears exactly once',
            'The sample is the test set',
            'A row can be drawn more than once, and some rows are not drawn',
            'Rows are replaced by their averages',
          ],
          2,
          'Each draw picks from all rows again, so repeats and omissions both happen.',
        ),
        choose(
          'Why does bagging especially help deep decision trees?',
          [
            'Deep trees vary strongly with their training rows, and averaging reduces that variance',
            'Deep trees cannot be fitted without resampling',
            'Bagging makes each tree shallower',
            'Bagging removes bias from any model',
          ],
          0,
          'Averaging many unstable but different trees cancels much of their sample-to-sample fluctuation.',
        ),
        choose(
          'A bagged model reports an out-of-bag score. What is it based on?',
          [
            'The final test set',
            'Each model’s predictions on the training rows left out of its own sample',
            'The training rows each model was fitted on',
            'Predictions on duplicate rows only',
          ],
          1,
          'Out-of-bag rows were unseen by that model, so they can serve as built-in validation data.',
        ),
      ],
    },
    {
      title: 'Decorrelate trees with a random forest',
      explanation: [
        'A random forest bags decision trees and adds a second source of randomness: at each split, a tree considers only a random subset of features, set by max_features. Trees then differ more, so their errors are less correlated and averaging helps more.',
        'RandomForestClassifier(n_estimators=..., random_state=0) stores its fitted trees in estimators_. predict_proba averages the trees’ class probabilities, and a fixed random_state makes the forest reproducible.',
      ],
      example: {
        code: 'from sklearn.ensemble import RandomForestClassifier\nX = [[1, 5], [2, 4], [3, 6], [6, 1], [7, 2], [8, 1]]\ny = [0, 0, 0, 1, 1, 1]\nforest = RandomForestClassifier(n_estimators=4, max_features=1, random_state=0).fit(X, y)\nvotes = [int(tree.predict([[4.5, 3.5]])[0]) for tree in forest.estimators_]\nprint(votes)\nprint(forest.predict_proba([[4.5, 3.5]]).round(2).tolist())',
        output: '[0, 1, 1, 1]\n[[0.25, 0.75]]',
        explanation:
          'The point lies between the groups, so the four trees disagree. Three of four lean towards class 1, and the forest’s probability averages them.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'from sklearn.ensemble import RandomForestClassifier\nX = [[1, 5], [2, 4], [3, 6], [6, 1], [7, 2], [8, 1]]\ny = [0, 0, 0, 1, 1, 1]\nforest = RandomForestClassifier(n_estimators=25, random_state=0).fit(X, y)\nprint(len(forest.estimators_))\nprint(forest.predict([[2, 5], [7, 1]]).tolist())',
          ['1\n[0, 1]', '25\n[1, 0]', '6\n[0, 1]', '25\n[0, 1]'],
          3,
          'n_estimators=25 fits 25 trees, and points deep inside each group get that group’s class.',
        ),
        choose(
          'What does max_features control in a random forest?',
          [
            'How many features each split may choose from',
            'How many trees are grown',
            'How deep each tree may be',
            'How many rows each bootstrap sample has',
          ],
          0,
          'Limiting the candidate features at each split forces trees to differ, which decorrelates their errors.',
        ),
        predictOutput(
          'Five trees vote on one row. What does this program print?',
          'tree_probabilities = [1.0, 0.0, 1.0, 1.0, 0.5]\nprint(sum(tree_probabilities) / len(tree_probabilities))',
          ['0.5', '0.7', '1.0', '3.5'],
          1,
          'The forest averages the trees’ class-1 probabilities: 3.5 / 5 = 0.7.',
        ),
        choose(
          'Two runs of the same forest code give slightly different predictions. What fixes this?',
          [
            'Adding more features',
            'Using max_features=1',
            'Setting random_state to a fixed number',
            'Fitting on fewer rows',
          ],
          2,
          'The bootstrap samples and feature subsets are random; a fixed seed makes them repeat exactly.',
        ),
      ],
    },
    {
      title: 'Boost by fitting each new model to the remaining errors',
      explanation: [
        'Boosting builds models one after another. Gradient boosting for regression starts from a constant, fits a small tree to the current residuals, and adds that tree’s predictions scaled by learning_rate. Each round corrects part of what is still wrong.',
        'Bagging fits independent models in parallel; boosting’s models depend on each other. More boosting rounds keep lowering training error and can overfit, so choose n_estimators and learning_rate on validation data.',
      ],
      example: {
        code: 'y = [10.0, 12.0, 30.0, 34.0]\nstart = sum(y) / len(y)\npred = [start for value in y]\nresiduals = [y[i] - pred[i] for i in range(4)]\nprint(residuals)\nstump = [-10.5, -10.5, 10.5, 10.5]\npred = [pred[i] + 0.5 * stump[i] for i in range(4)]\nprint(pred)',
        output: '[-11.5, -9.5, 8.5, 12.5]\n[16.25, 16.25, 26.75, 26.75]',
        explanation:
          'The constant 21.5 leaves the residuals shown. A one-split tree predicts their group means, ±10.5, and half of that correction moves each prediction toward its target.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'from sklearn.ensemble import GradientBoostingRegressor\nX = [[1], [2], [3], [4]]\ny = [1.0, 1.0, 5.0, 5.0]\nfor n in [1, 2]:\n    model = GradientBoostingRegressor(n_estimators=n, learning_rate=0.5, max_depth=1, random_state=0).fit(X, y)\n    print(model.predict(X).round(3).tolist())',
          [
            '[2.0, 2.0, 4.0, 4.0]\n[1.0, 1.0, 5.0, 5.0]',
            '[3.0, 3.0, 3.0, 3.0]\n[2.0, 2.0, 4.0, 4.0]',
            '[2.0, 2.0, 4.0, 4.0]\n[1.5, 1.5, 4.5, 4.5]',
            '[1.0, 1.0, 5.0, 5.0]\n[1.0, 1.0, 5.0, 5.0]',
          ],
          2,
          'Starting from 3, each round fits the residuals and adds half of them: the residuals go from ±2 to ±1 to ±0.5.',
        ),
        choose(
          'How does boosting differ from bagging?',
          [
            'Boosting fits models one after another, each correcting the current errors',
            'Boosting fits independent models on bootstrap samples',
            'Boosting cannot use decision trees',
            'Boosting averages identical models',
          ],
          0,
          'Each boosted model depends on the ensemble so far; bagged models are fitted independently.',
        ),
        predictOutput(
          'What does this program print?',
          'from sklearn.ensemble import GradientBoostingRegressor\nimport numpy as np\nX = np.arange(10).reshape(-1, 1)\ny = np.array([3.0, 1.0, 4.0, 1.0, 5.0, 9.0, 2.0, 6.0, 5.0, 3.0])\nfor n in [1, 10, 200]:\n    m = GradientBoostingRegressor(n_estimators=n, learning_rate=0.3, max_depth=2, random_state=0).fit(X, y)\n    print(n, round(float(((m.predict(X) - y) ** 2).mean()), 3))',
          [
            '1 0.0\n10 0.504\n200 3.846',
            '1 3.846\n10 3.846\n200 3.846',
            '1 3.846\n10 0.504\n200 0.504',
            '1 3.846\n10 0.504\n200 0.0',
          ],
          3,
          'Every round removes more of the training residuals; with 200 rounds the model fits these ten noisy targets exactly, a sign of overfitting.',
        ),
        choose(
          'Training error keeps falling as boosting rounds increase, but validation error rises after round 150. What should you do?',
          [
            'Keep all rounds, because training error is lower',
            'Use about 150 rounds, or a smaller learning rate, chosen on validation data',
            'Switch to more rounds and a larger learning rate',
            'Evaluate on the training rows instead',
          ],
          1,
          'Validation error marks where further rounds start fitting noise.',
        ),
      ],
    },
  ],
  'ml-pca': [
    {
      title: 'Project centered data onto a direction of large variance',
      explanation: [
        'PCA first centers each feature by subtracting its mean. Projecting a centered row onto a unit-length direction d is the dot product row · d; for a whole matrix, X @ d gives one projected value per row.',
        'The first principal component is the direction along which those projected values have the largest variance. Each later component has the largest remaining variance while staying orthogonal to the earlier ones, which means its dot product with each of them is 0.',
      ],
      example: {
        code: 'import numpy as np\nX = np.array([[1.0, 1.0], [2.0, 2.0], [3.0, 3.0]])\ncentered = X - X.mean(axis=0)\ndirection = np.array([1.0, 1.0]) / np.sqrt(2)\nprint(centered.tolist())\nprint((centered @ direction).round(3).tolist())',
        output: '[[-1.0, -1.0], [0.0, 0.0], [1.0, 1.0]]\n[-1.414, 0.0, 1.414]',
        explanation:
          'The points lie on the diagonal, so projecting onto the unit diagonal direction keeps all of their spread in a single number per row.',
      },
      questions: [
        predictOutput(
          'The rows are already centered. What does this program print?',
          'import numpy as np\nX = np.array([[3.0, 1.0], [-3.0, -1.0], [1.0, -1.0], [-1.0, 1.0]])\nfor d in [np.array([1.0, 0.0]), np.array([0.0, 1.0])]:\n    print(float((X @ d).var()))',
          ['1.0\n5.0', '5.0\n1.0', '0.0\n0.0', '20.0\n4.0'],
          1,
          'Projecting onto [1, 0] keeps the first column, whose variance is (9 + 9 + 1 + 1) / 4 = 5; the second column’s variance is 1.',
        ),
        choose(
          'What does the first principal component maximize?',
          [
            'The correlation with the target',
            'The number of rows kept',
            'The variance of the data projected onto it',
            'The distance between class means',
          ],
          2,
          'PCA ignores any target; the first component is the direction of greatest spread in the features.',
        ),
        predictOutput(
          'What does this program print?',
          'import numpy as np\na = np.array([3.0, 4.0])\nb = np.array([-4.0, 3.0])\nprint(float(a @ b), float(np.linalg.norm(a)))',
          ['0.0 5.0', '24.0 5.0', '0.0 7.0', '0.0 25.0'],
          0,
          '3*(-4) + 4*3 = 0, so the vectors are orthogonal. np.linalg.norm gives the length, sqrt(9 + 16) = 5; dividing by it would make a unit direction.',
        ),
        choose(
          'Why does PCA center the features before looking for directions?',
          [
            'Centering removes the target from the data',
            'Without centering, the fixed offsets of the data from the origin would distort the directions of spread',
            'Centering makes every feature an integer',
            'Centering reduces the number of rows',
          ],
          1,
          'Variance is spread around the mean; centering puts the mean at the origin so directions describe that spread.',
        ),
      ],
    },
    {
      title: 'Fit PCA and read its explained variance',
      explanation: [
        'PCA(n_components=k).fit(X) learns k orthogonal directions, stored as the rows of components_, with shape (k, n_features). transform(X) projects the rows onto them, giving shape (n_rows, k).',
        'explained_variance_ratio_ holds each component’s share of the total variance, largest first. PCA never looks at a target, so it is unsupervised.',
      ],
      example: {
        code: 'from sklearn.decomposition import PCA\nX = [[2.0, 0.0], [0.0, 1.0], [-2.0, 0.0], [0.0, -1.0]]\npca = PCA(n_components=2).fit(X)\nprint(pca.explained_variance_ratio_.round(3).tolist())\nprint(pca.transform(X).shape)',
        output: '[0.8, 0.2]\n(4, 2)',
        explanation:
          'The horizontal spread has variance 4 times the vertical spread, so the first component holds 80% of the total and the second 20%.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'from sklearn.decomposition import PCA\nX = [[1.0, 2.0], [2.0, 4.0], [3.0, 6.0], [4.0, 8.0]]\npca = PCA().fit(X)\nprint(pca.explained_variance_ratio_.round(3).tolist())',
          ['[0.5, 0.5]', '[0.667, 0.333]', '[0.8, 0.2]', '[1.0, 0.0]'],
          3,
          'Every point lies on the line y = 2x, so one direction carries all of the variance.',
        ),
        predictOutput(
          'What does this program print?',
          'import numpy as np\nfrom sklearn.decomposition import PCA\nX = np.array([[1.0, 2.0, 0.0], [2.0, 1.0, 1.0], [3.0, 5.0, 0.0], [4.0, 3.0, 2.0], [5.0, 4.0, 1.0]])\npca = PCA(n_components=2).fit(X)\nprint(pca.transform(X).shape, pca.components_.shape)',
          ['(5, 3) (2, 3)', '(5, 2) (2, 3)', '(5, 2) (3, 2)', '(2, 5) (2, 3)'],
          1,
          'transform keeps one row per example with one column per component; components_ holds one row per component with one entry per feature.',
        ),
        choose(
          'explained_variance_ratio_ is [0.7, 0.2, 0.1]. What does 0.2 mean?',
          [
            'The second component holds 20% of the total feature variance',
            'The second component predicts the target with 20% accuracy',
            'The second feature is 20% of the data',
            '20% of the rows belong to the second component',
          ],
          0,
          'Each ratio is a share of the total variance in the inputs, not a prediction score.',
        ),
        choose(
          'Which argument does PCA.fit use from a labelled dataset?',
          [
            'Only the target y',
            'The features and the target together',
            'Only the features X',
            'The test rows',
          ],
          2,
          'PCA is unsupervised; it finds directions from the features alone.',
        ),
      ],
    },
    {
      title: 'Choose how many components to keep',
      explanation: [
        'Add up explained variance ratios from the first component onward; np.cumsum returns the running totals. Keep the smallest number of components whose total reaches your target, such as 90% or 95%.',
        'PCA(n_components=0.95) does this automatically and stores the chosen count in n_components_. Fewer components mean smaller, faster inputs, but whether enough useful signal survives must be checked on the task itself.',
      ],
      example: {
        code: 'import numpy as np\nratios = np.array([0.55, 0.25, 0.12, 0.05, 0.03])\ncumulative = np.cumsum(ratios)\nprint(cumulative.round(2).tolist())\nprint(int((cumulative < 0.9).sum()) + 1)',
        output: '[0.55, 0.8, 0.92, 0.97, 1.0]\n3',
        explanation:
          'Two running totals fall short of 0.9, so the third component is the first to reach it: keep 3.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'import numpy as np\nratios = np.array([0.4, 0.3, 0.2, 0.1])\ncumulative = np.cumsum(ratios)\nprint(cumulative.round(2).tolist())\nprint(int((cumulative < 0.8).sum()) + 1)',
          [
            '[0.4, 0.7, 0.9, 1.0]\n2',
            '[0.4, 0.3, 0.2, 0.1]\n3',
            '[0.4, 0.7, 0.9, 1.0]\n4',
            '[0.4, 0.7, 0.9, 1.0]\n3',
          ],
          3,
          'Only 0.4 and 0.7 fall short of 0.8, so three components are needed.',
        ),
        predictOutput(
          'Columns 1 and 2 are near copies, and so are columns 3 and 4. What does this program print?',
          'import numpy as np\nfrom sklearn.decomposition import PCA\nrng = np.random.default_rng(0)\nbase = rng.normal(size=(40, 1))\nother = rng.normal(size=(40, 1))\nX = np.hstack([base, base + rng.normal(scale=0.1, size=(40, 1)), other, other + rng.normal(scale=0.1, size=(40, 1))])\nprint(PCA(n_components=0.95).fit(X).n_components_)',
          ['1', '2', '3', '4'],
          1,
          'The four columns carry about two independent signals, so two components already hold over 95% of the variance.',
        ),
        choose(
          'What do you give up by keeping fewer components?',
          [
            'Some feature variance, which may include useful signal',
            'The ability to transform new rows',
            'The training labels',
            'Nothing; dropped components never matter',
          ],
          0,
          'Dropped components hold the remaining variance, and some of it can matter for prediction.',
        ),
        choose(
          'Two components keep 95% of the feature variance. What can you conclude about a classifier trained on them?',
          [
            'It will reach 95% accuracy',
            'It will match a classifier trained on all features',
            'It cannot overfit',
            'Nothing yet; its performance must be measured on validation data',
          ],
          3,
          'Variance retained describes the inputs, not how well the target can be predicted.',
        ),
      ],
    },
    {
      title: 'Scale features first and fit PCA on training rows',
      explanation: [
        'PCA chases variance, and variance depends on units. A salary in dollars varies by thousands while an age varies by tens, so unscaled PCA puts almost all weight on salary. Standardizing first lets each feature contribute according to its pattern, not its unit.',
        'PCA learns a mean and directions, so it is fitted on training rows only, usually as a pipeline step after StandardScaler. A direction with little variance can still matter for a target, so keep checking downstream performance.',
      ],
      example: {
        code: 'import numpy as np\nfrom sklearn.decomposition import PCA\nfrom sklearn.pipeline import make_pipeline\nfrom sklearn.preprocessing import StandardScaler\nX = np.array([[25.0, 30000.0], [32.0, 42000.0], [47.0, 35000.0], [51.0, 51000.0], [38.0, 39000.0]])\nraw = PCA(n_components=1).fit(X)\nprint(np.abs(raw.components_).round(3).tolist())\nscaled = make_pipeline(StandardScaler(), PCA(n_components=1)).fit(X)\nprint(np.abs(scaled.named_steps["pca"].components_).round(3).tolist())',
        output: '[[0.001, 1.0]]\n[[0.707, 0.707]]',
        explanation:
          'np.abs drops the arbitrary sign of each component. Unscaled, the first component is essentially "salary"; after scaling, age and salary weigh equally.',
      },
      questions: [
        predictOutput(
          'The two features are uncorrelated. What does this program print?',
          'from sklearn.decomposition import PCA\nfrom sklearn.preprocessing import StandardScaler\nX = [[0.0, 0.0], [10.0, 1.0], [0.0, 1.0], [10.0, 0.0]]\nraw = PCA().fit(X).explained_variance_ratio_[0]\nscaled = PCA().fit(StandardScaler().fit_transform(X)).explained_variance_ratio_[0]\nprint(round(float(raw), 2), round(float(scaled), 2))',
          ['0.5 0.5', '0.5 0.99', '0.99 0.5', '0.99 0.99'],
          2,
          'Raw, the first column’s variance (25) dwarfs the second’s (0.25). Scaled, both have variance 1 and share the total equally.',
        ),
        choose(
          'A dataset has age in years and income in dollars. Without scaling, what will the first principal component mostly reflect?',
          [
            'Age, because it is listed first',
            'Income, because its numeric variance is far larger',
            'Both equally',
            'Whichever feature predicts the target best',
          ],
          1,
          'PCA follows raw variance, so the large-unit feature dominates.',
        ),
        choose(
          'You fit PCA on all rows, then split into training and test sets. What is wrong?',
          [
            'Nothing; PCA ignores the target',
            'PCA cannot transform test rows',
            'The test set becomes larger',
            'The test rows shaped the learned mean and directions, leaking information',
          ],
          3,
          'PCA learns statistics like any preprocessing step, so it must be fitted on training rows only.',
        ),
        choose(
          'The last component holds only 1% of the variance. Can it still matter for prediction?',
          [
            'Yes; a low-variance direction can carry the signal that separates the target',
            'No; low variance always means noise',
            'No; PCA has removed the target from it',
            'Only if it is the first feature',
          ],
          0,
          'PCA ranks directions by spread, not usefulness, so a small direction can still be the predictive one.',
        ),
      ],
    },
  ],
  'ml-clustering': [
    {
      title: 'Assign each point to its nearest centroid',
      explanation: [
        'K-means describes each of k clusters by a centroid, a point in feature space. The assignment step gives every observation the label of its nearest centroid by squared Euclidean distance: the sum of squared coordinate differences.',
        'Squaring keeps the same ranking as the true distance, so the square root can be skipped. With NumPy, ((centers - p) ** 2).sum(axis=1) gives the squared distance from p to every centroid, and argmin() returns the position of the smallest one.',
      ],
      example: {
        code: 'import numpy as np\npoints = np.array([[1.0, 1.0], [5.0, 4.0], [2.0, 0.0]])\ncenters = np.array([[0.0, 0.0], [6.0, 5.0]])\nfor p in points:\n    d = ((centers - p) ** 2).sum(axis=1)\n    print(d.tolist(), int(d.argmin()))',
        output: '[2.0, 41.0] 0\n[41.0, 2.0] 1\n[4.0, 41.0] 0',
        explanation:
          'Each row prints the squared distances to both centroids and the index of the closer one, which becomes that point’s cluster label.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'import numpy as np\npoints = np.array([1.0, 4.0, 6.0, 9.0])\ncenters = np.array([2.0, 8.0])\nlabels = [int(np.abs(centers - p).argmin()) for p in points]\nprint(labels)',
          ['[0, 1, 1, 1]', '[0, 0, 0, 1]', '[0, 0, 1, 1]', '[1, 1, 0, 0]'],
          2,
          '4 is 2 from the first centroid and 4 from the second; 6 is closer to 8.',
        ),
        choose(
          'Why may k-means compare squared distances instead of distances?',
          [
            'Squaring keeps the same order, so the nearest centroid is unchanged',
            'Squared distances are always smaller',
            'Distances cannot be computed in more than one dimension',
            'Squaring makes the clusters equal in size',
          ],
          0,
          'For non-negative numbers, a smaller distance always has a smaller square.',
        ),
        predictOutput(
          'What does this program print?',
          'import numpy as np\npoint = np.array([3.0, 3.0])\ncenters = np.array([[0.0, 0.0], [4.0, 0.0], [3.0, 5.0]])\nd = ((centers - point) ** 2).sum(axis=1)\nprint(d.tolist(), int(d.argmin()))',
          [
            '[18.0, 10.0, 4.0] 0',
            '[18.0, 10.0, 4.0] 2',
            '[6.0, 4.0, 2.0] 2',
            '[18.0, 10.0, 4.0] 1',
          ],
          1,
          'The squared distances are 9 + 9, 1 + 9, and 0 + 4; the smallest is at index 2.',
        ),
        choose(
          'What does the assignment step of k-means change?',
          [
            'The positions of the centroids',
            'The number of clusters',
            'The feature values',
            'Each point’s cluster label',
          ],
          3,
          'Assignment relabels points; a separate update step moves the centroids.',
        ),
      ],
    },
    {
      title: 'Move each centroid to the mean of its points, and repeat',
      explanation: [
        'The update step moves each centroid to the mean of the points assigned to it. points[labels == k] selects the rows with label k, and .mean(axis=0) averages them column by column.',
        'K-means alternates assignment and update until the labels stop changing. Both steps can only lower or keep the inertia, the total squared distance from each point to its own centroid, which is what k-means minimizes.',
      ],
      example: {
        code: 'import numpy as np\npoints = np.array([[1.0, 1.0], [2.0, 0.0], [5.0, 4.0], [7.0, 6.0]])\nlabels = np.array([0, 0, 1, 1])\nfor k in [0, 1]:\n    print(points[labels == k].mean(axis=0).tolist())',
        output: '[1.5, 0.5]\n[6.0, 5.0]',
        explanation:
          'Cluster 0’s centroid moves to the average of its two points; so does cluster 1’s.',
      },
      questions: [
        predictOutput(
          'This runs one assignment step and one update step. What does it print?',
          'import numpy as np\npoints = np.array([1.0, 1.5, 3.0, 10.0, 11.0])\ncenters = np.array([1.0, 3.0])\nlabels = np.array([int(np.abs(centers - p).argmin()) for p in points])\ncenters = np.array([points[labels == k].mean() for k in [0, 1]])\nprint(labels.tolist(), centers.tolist())',
          [
            '[0, 0, 1, 1, 1] [1.25, 8.0]',
            '[0, 0, 1, 1, 1] [1.0, 3.0]',
            '[0, 0, 0, 1, 1] [1.833, 10.5]',
            '[0, 1, 1, 1, 1] [1.0, 6.375]',
          ],
          0,
          '1 and 1.5 are nearer to 1; the rest are nearer to 3. The new centroids are the means of each group.',
        ),
        predictOutput(
          'What does this program print?',
          'import numpy as np\npoints = np.array([1.0, 3.0, 10.0, 12.0])\nlabels = np.array([0, 0, 1, 1])\ncenters = np.array([2.0, 11.0])\nprint(float(((points - centers[labels]) ** 2).sum()))',
          ['2.0', '0.0', '4.0', '8.0'],
          2,
          'centers[labels] gives each point its own centroid; every point is 1 away, so the inertia is 4 * 1 = 4.0.',
        ),
        choose(
          'When does k-means stop iterating?',
          [
            'When every cluster has the same size',
            'When assignments no longer change, or a step limit is reached',
            'When the inertia reaches zero',
            'After exactly one update',
          ],
          1,
          'Once labels stop changing, the centroids stop moving, so further steps change nothing.',
        ),
        choose(
          'What happens to the inertia during a k-means update step?',
          [
            'It can rise sharply',
            'It always becomes zero',
            'It doubles',
            'It goes down or stays the same',
          ],
          3,
          'The mean is the point with the smallest total squared distance to a group, so moving the centroid there cannot increase inertia.',
        ),
      ],
    },
    {
      title: 'Restart from several initial centroids',
      explanation: [
        'K-means stops at a local solution that depends on where the centroids start: a poor start can leave two centroids sharing one group while another centroid covers two groups. Running from several starts and keeping the solution with the lowest inertia guards against this.',
        'scikit-learn’s KMeans(n_clusters=k, n_init=10, random_state=0) does exactly that and stores labels_, cluster_centers_, and inertia_; predict assigns new rows to the nearest learned centroid. Cluster numbers are arbitrary names: two runs can number the same groups differently.',
      ],
      example: {
        code: 'import numpy as np\npoints = np.array([0.0, 1.0, 10.0, 11.0, 20.0, 21.0])\n\ndef kmeans(centers):\n    for step in range(5):\n        labels = np.array([int(np.abs(centers - p).argmin()) for p in points])\n        centers = np.array([points[labels == k].mean() for k in range(3)])\n    print(centers.tolist(), float(((points - centers[labels]) ** 2).sum()))\n\nkmeans(np.array([0.0, 10.0, 20.0]))\nkmeans(np.array([0.0, 1.0, 15.0]))',
        output: '[0.5, 10.5, 20.5] 1.5\n[0.0, 1.0, 15.5] 101.0',
        explanation:
          'The second start splits the first pair between two centroids and never recovers; its much higher inertia shows why restarts keep the best run.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'import numpy as np\npoints = np.array([0.0, 2.0, 9.0, 11.0])\ncenters = np.array([0.0, 2.0])\nfor step in range(3):\n    labels = np.array([int(np.abs(centers - p).argmin()) for p in points])\n    centers = np.array([points[labels == k].mean() for k in [0, 1]])\nprint(centers.tolist())',
          [
            '[0.0, 2.0]',
            '[1.0, 10.0]',
            '[0.0, 7.333]',
            '[0.0, 7.333333333333333]',
          ],
          1,
          'The first update gives centroids 0 and 22 / 3. Then 2 is nearer to 0, so the groups become {0, 2} and {9, 11}, with means 1 and 10; this start recovers.',
        ),
        choose(
          'Why does KMeans run several initializations (n_init)?',
          [
            'Different starts can end in different local solutions, so it keeps the lowest-inertia one',
            'Each run adds another cluster',
            'It averages the labels across runs',
            'It guarantees the true classes are found',
          ],
          0,
          'The objective has several local minima; restarts make a poor one less likely.',
        ),
        choose(
          'Run A labels a group of customers 0; run B labels the same customers 2. What does this mean?',
          [
            'The two runs found different customers',
            'Cluster numbers are arbitrary names, so the grouping can be identical',
            'Run B ranks the customers higher',
            'One run must contain an error',
          ],
          1,
          'Renumbering clusters changes nothing about which points are grouped together.',
        ),
        choose(
          'What does a fitted KMeans model’s predict do with a new row?',
          [
            'Refits the centroids including the new row',
            'Returns the nearest training row’s target',
            'Assigns it to the nearest learned centroid',
            'Creates a new cluster for it',
          ],
          2,
          'Prediction is just the assignment step against the fitted centroids.',
        ),
      ],
    },
    {
      title: 'Choose k and scale the features',
      explanation: [
        'Inertia always falls as k grows, reaching 0 when every point is its own cluster, so the lowest inertia cannot choose k. Look for an elbow, where adding a cluster stops helping much, or compare silhouette scores: from -1 to 1, higher when points sit closer to their own cluster than to the next one.',
        'K-means uses distances, so a feature in large units dominates them; standardize first. Clusters are a description, not truth: judge them by whether they are useful for the decision at hand.',
      ],
      example: {
        code: 'from sklearn.metrics import silhouette_score\nX = [[1, 1], [1.5, 2], [1, 0], [8, 8], [9, 8.5], [8, 9.5]]\nprint(round(float(silhouette_score(X, [0, 0, 0, 1, 1, 1])), 3))\nprint(round(float(silhouette_score(X, [0, 0, 1, 1, 2, 2])), 3))',
        output: '0.869\n0.237',
        explanation:
          'Grouping the two visible clumps gives a high silhouette. A three-way labelling that cuts across them scores far lower.',
      },
      questions: [
        predictOutput(
          'The list holds inertia for k = 1, 2, 3, 4. What does this program print?',
          'inertias = [169.21, 4.0, 2.33, 1.12]\ndrops = [round(inertias[i] - inertias[i + 1], 2) for i in range(3)]\nprint(drops)',
          [
            '[165.21, 1.67, 1.21]',
            '[4.0, 2.33, 1.12]',
            '[165.21, 167.88, 168.09]',
            '[-165.21, -1.67, -1.21]',
          ],
          0,
          'Going from 1 to 2 clusters removes almost all inertia; later clusters add little, so the elbow is at k = 2.',
        ),
        choose(
          'Why not choose k by picking the lowest inertia?',
          [
            'Inertia is undefined for k above 3',
            'Inertia always decreases as k grows, so the largest k always wins',
            'Inertia measures label accuracy, not cluster quality',
            'Inertia increases with k',
          ],
          1,
          'More centroids can only bring points closer to one, so inertia alone favours too many clusters.',
        ),
        predictOutput(
          'Features are age in years and income in dollars. What does this program print?',
          'import numpy as np\npoint = np.array([30.0, 52000.0])\ncenters = np.array([[31.0, 60000.0], [65.0, 52500.0]])\nd = np.sqrt(((centers - point) ** 2).sum(axis=1))\nprint(d.round(1).tolist())',
          [
            '[1.0, 35.0]',
            '[8000.0, 35.0]',
            '[501.2, 8000.0]',
            '[8000.0, 501.2]',
          ],
          3,
          'Income differences in thousands swamp a 35-year age gap, so the 65-year-old centroid is "closer". Standardizing would fix this.',
        ),
        choose(
          'A clustering has a high silhouette score. What does that establish?',
          [
            'Points are compact and well separated under this distance, but usefulness still needs judging',
            'The clusters match the true customer segments',
            'k is the number of real classes',
            'The features did not need scaling',
          ],
          0,
          'Silhouette measures geometry only; whether the groups help a decision is a separate question.',
        ),
      ],
    },
  ],
  'ml-anomaly-detection': [
    {
      title: 'Score unusualness against a reference',
      explanation: [
        'An anomaly detector learns what normal looks like from reference data and scores how far a new observation departs from it. The simplest score is the z-score: (x - mean) / std, using the reference mean and standard deviation.',
        'A large absolute z-score, such as 3 or more, means the value is rare under the reference. Rare is not the same as wrong: it can be a broken sensor, a legitimate but unusual event, or a real problem, and only investigation tells which.',
      ],
      example: {
        code: 'import numpy as np\nreference = np.array([50.0, 52.0, 48.0, 51.0, 49.0])\nmean, std = reference.mean(), reference.std()\nnew = np.array([50.5, 58.0, 41.0])\nz = (new - mean) / std\nprint(np.round(z, 2).tolist())\nprint((np.abs(z) >= 3).tolist())',
        output: '[0.35, 5.66, -6.36]\n[False, True, True]',
        explanation:
          'The reference has mean 50 and standard deviation about 1.41. Both 58 and 41 lie more than three standard deviations away, in opposite directions.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'import numpy as np\nreference = np.array([10.0, 12.0, 8.0, 10.0])\nmean, std = reference.mean(), reference.std()\nz = (np.array([13.0, 10.5]) - mean) / std\nprint(np.round(z, 2).tolist())\nprint((np.abs(z) >= 2).tolist())',
          [
            '[1.5, 0.25]\n[False, False]',
            '[3.0, 0.5]\n[True, False]',
            '[2.12, 0.35]\n[True, True]',
            '[2.12, 0.35]\n[True, False]',
          ],
          3,
          'The reference has mean 10 and standard deviation √2 ≈ 1.41, so 13 is 2.12 standard deviations above the mean.',
        ),
        predictOutput(
          'What does this program print?',
          'z = [0.3, -2.8, 1.1, 3.4, -0.9]\nprint([i for i in range(len(z)) if abs(z[i]) >= 2.5])',
          ['[3]', '[1, 3]', '[1, 2, 3]', '[0, 2, 4]'],
          1,
          'abs() catches unusually low values as well as high ones, so positions 1 and 3 are flagged.',
        ),
        choose(
          'A reading has z = -4 relative to last month’s data. What does that tell you?',
          [
            'It is four standard deviations below the reference mean',
            'It is four units below the mean',
            'It has a 4% chance of being normal',
            'It is certainly a sensor failure',
          ],
          0,
          'A z-score counts standard deviations from the mean; it does not by itself explain the cause.',
        ),
        choose(
          'A transaction is flagged as highly unusual. What is the right next step?',
          [
            'Block the customer, since unusual means fraudulent',
            'Delete the row so it does not distort statistics',
            'Investigate it with context, since rarity alone does not establish a problem',
            'Ignore it, since detectors are often wrong',
          ],
          2,
          'An alert is evidence to examine; legitimate rare events and data errors also look unusual.',
        ),
      ],
    },
    {
      title: 'Check which way a detector’s score points',
      explanation: [
        'Score direction differs between tools. A z-score is larger for more unusual values, but scikit-learn’s detectors return scores where larger means more normal: decision_function is negative for outliers, and predict returns -1 for an outlier and 1 for an inlier.',
        'Read the contract before writing an alert rule. Applying "alert when score >= threshold" to a more-normal-is-higher score flags the most ordinary rows. EllipticEnvelope, a detector that learns the centre and spread of normal data, follows the scikit-learn convention.',
      ],
      example: {
        code: 'import numpy as np\nfrom sklearn.covariance import EllipticEnvelope\nreference = np.array([[50.0], [52.0], [48.0], [51.0], [49.0], [50.5], [49.5], [50.0], [51.5], [48.5]])\ndetector = EllipticEnvelope(contamination=0.1, random_state=0).fit(reference)\nnew = np.array([[50.2], [58.0], [41.0]])\nprint(detector.predict(new).tolist())\nprint(detector.decision_function(new).round(1).tolist())',
        output: '[1, -1, -1]\n[2.2, -34.0, -43.7]',
        explanation:
          'The ordinary reading gets 1 and a positive score; the two extreme readings get -1 and strongly negative scores.',
      },
      questions: [
        predictOutput(
          'These are scikit-learn detector predictions. What does this program print?',
          'predictions = [1, -1, 1, 1, -1]\nalerts = [i for i in range(len(predictions)) if predictions[i] == -1]\nprint(alerts)',
          ['[0, 2, 3]', '[2, 5]', '[1, 4]', '[]'],
          2,
          '-1 marks an outlier, which occurs at positions 1 and 4.',
        ),
        choose(
          'A library documents that lower scores are more anomalous, but your rule alerts when score >= 0.9. What happens?',
          [
            'You alert on the most normal rows',
            'You alert on the most anomalous rows',
            'Nothing changes; direction does not matter',
            'Every row triggers an alert',
          ],
          0,
          'The rule selects the highest scores, which under this contract are the least unusual rows.',
        ),
        predictOutput(
          'Here a higher score means more normal. What does this program print?',
          'normality = [0.9, 0.2, 0.7, 0.4]\nanomaly = [-s for s in normality]\nthreshold = -0.5\nprint([i for i in range(4) if anomaly[i] >= threshold])',
          ['[0, 2]', '[1]', '[0, 1, 2, 3]', '[1, 3]'],
          3,
          'Negating turns "higher is more normal" into "higher is more unusual"; rows 1 and 3 have normality below 0.5.',
        ),
        choose(
          'A scikit-learn detector’s decision_function returns -3.2 for a row. What does that mean?',
          [
            'The row is 3.2 standard deviations from the mean',
            'The row falls on the outlier side of the learned boundary',
            'The row is unusually normal',
            'The model failed to score the row',
          ],
          1,
          'In scikit-learn’s convention, negative decision values mark outliers.',
        ),
      ],
    },
    {
      title: 'Set the threshold by alert volume and check it with labels',
      explanation: [
        'The threshold decides how many alerts you get. A capacity-based rule takes a quantile of recent scores: np.quantile(scores, 0.99) is the value 99% of scores fall below, so alerting at or above it flags about the top 1%.',
        'When some confirmed incidents are known, measure the alerts like a classifier: precision is the share of alerts that were real incidents, and recall is the share of incidents that triggered an alert. Lowering the threshold raises recall and the number of false alarms.',
      ],
      example: {
        code: 'import numpy as np\nscores = np.array([0.1, 0.4, 0.2, 0.9, 0.3, 0.8, 0.05, 0.6, 0.15, 0.7])\ncutoff = np.quantile(scores, 0.8)\nalerts = scores >= cutoff\nprint(round(float(cutoff), 2), int(alerts.sum()))',
        output: '0.72 2',
        explanation:
          'The 80th percentile of these ten scores is 0.72, so the two highest scores, 0.9 and 0.8, become alerts.',
      },
      questions: [
        predictOutput(
          'Larger scores are more unusual. What does this program print?',
          'scores = [0.9, 0.2, 0.75, 0.1, 0.6, 0.85]\nincident = [1, 0, 0, 0, 1, 0]\nalerts = [int(s >= 0.7) for s in scores]\ntp = sum([1 for i in range(6) if alerts[i] == 1 and incident[i] == 1])\nprint(round(tp / sum(alerts), 3), round(tp / sum(incident), 3))',
          ['0.5 0.333', '0.333 0.5', '0.667 0.5', '0.333 1.0'],
          1,
          'Three rows are alerted but only one is an incident (precision 1/3); one of the two incidents was caught (recall 1/2).',
        ),
        choose(
          'An investigations team can handle about 20 alerts a day out of 10,000 scored events. How should the threshold be set?',
          [
            'At the score that about 20 of 10,000 daily events exceed',
            'At 0.5, the usual default',
            'At the score of the most unusual event ever seen',
            'So that every event with any unusual feature alerts',
          ],
          0,
          'A quantile threshold matches the alert volume to the team’s capacity.',
        ),
        choose(
          'You lower the alert threshold. What usually happens?',
          [
            'Fewer alerts, higher precision',
            'No change in the number of alerts',
            'Fewer missed incidents, more false alarms',
            'Higher precision and higher recall',
          ],
          2,
          'More rows pass a lower bar, catching more incidents along with more ordinary rows.',
        ),
        predictOutput(
          'What does this program print?',
          'import numpy as np\nscores = np.arange(1, 11)\ncutoff = np.quantile(scores, 0.9)\nprint(round(float(cutoff), 2), int((scores >= cutoff).sum()))',
          ['9.0 2', '10.0 1', '9.1 2', '9.1 1'],
          3,
          'The 90th percentile interpolates between 9 and 10, at 9.1, so only the score 10 is flagged.',
        ),
      ],
    },
    {
      title: 'Separate novelty from outlier detection; use robust statistics',
      explanation: [
        'Novelty detection learns normal behaviour from a reference set known to be clean and then scores new rows. Outlier detection looks for unusual rows inside data that may already contain them.',
        'Outliers in the reference inflate the mean and standard deviation, which can shrink their own z-scores below the alert level. The median and the median absolute deviation (MAD), the median of |x - median|, barely move when a few extreme values are present.',
      ],
      example: {
        code: 'import numpy as np\ndata = np.array([10.0, 11.0, 9.0, 10.0, 10.0, 11.0, 9.0, 80.0])\nz = (data - data.mean()) / data.std()\nprint(round(float(z[-1]), 2))\nmedian = np.median(data)\nmad = np.median(np.abs(data - median))\nprint(median, mad, round(float((80.0 - median) / mad), 1))',
        output: '2.64\n10.0 1.0 70.0',
        explanation:
          'The value 80 inflates the standard deviation so much that its own z-score is only 2.64. Measured with the median and MAD, it is 70 typical deviations away.',
      },
      questions: [
        choose(
          'A factory records a month of sensor data verified as normal, then scores each new reading against it. Which setting is this?',
          [
            'Outlier detection in contaminated data',
            'Novelty detection against a clean reference',
            'Supervised classification',
            'Clustering',
          ],
          1,
          'The reference is known to be clean, and only new readings are judged against it.',
        ),
        predictOutput(
          'What does this program print?',
          'import numpy as np\ndata = np.array([5.0, 6.0, 5.0, 7.0, 6.0, 5.0, 40.0])\nmedian = np.median(data)\nmad = np.median(np.abs(data - median))\nprint(median, mad, (40.0 - median) / mad)',
          ['6.0 1.0 34.0', '10.57 11.6 2.54', '6.0 0.0 inf', '5.0 1.0 35.0'],
          0,
          'The median is 6, and the median absolute deviation is 1; the extreme value does not affect either, so 40 sits 34 deviations away.',
        ),
        choose(
          'Why can an extreme value escape a z-score rule computed on the same data?',
          [
            'z-scores ignore large values',
            'The value raises the standard deviation, shrinking its own z-score',
            'Extreme values always have z = 0',
            'The mean is unaffected by extreme values',
          ],
          1,
          'This masking happens because the mean and standard deviation are pulled toward the outlier.',
        ),
        choose(
          'You must find unusual rows in a year of transactions that has never been cleaned. Which summary should define "typical"?',
          [
            'The mean and standard deviation, which no outlier can affect',
            'The single largest transaction',
            'The median and MAD, which a few extreme rows barely move',
            'The most recent transaction',
          ],
          2,
          'In possibly contaminated data, robust statistics keep the outliers from redefining what is normal.',
        ),
      ],
    },
  ],
};
