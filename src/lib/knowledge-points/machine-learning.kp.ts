import { choose, predictOutput, type KnowledgePointModule } from '.';

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
};
