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
};
