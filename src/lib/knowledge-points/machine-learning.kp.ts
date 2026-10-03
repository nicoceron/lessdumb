import {
  choose,
  predictOutput,
  typeOutput,
  type KnowledgePointModule,
} from './authoring';

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
        typeOutput(
          'What does this program print?',
          'house = {"rooms": 3, "area_m2": 72, "price": 210000}\nfeatures = [house["rooms"], house["area_m2"]]\ntarget = house["price"]\nprint(features)\nprint(target)',
          '[3, 72]\n210000',
          'The feature list holds rooms and area in the order written; the target is the price value, not the key name.',
        ),
        typeOutput(
          'What does this program print?',
          'row = {"temp_c": 21, "humidity": 40, "wind": 12, "rain_mm": 5}\nfeatures = [row["temp_c"], row["humidity"], row["wind"]]\ntarget = row["rain_mm"]\nprint(len(features), target)',
          '3 5',
          'Three keys are used as features, and the target is the rainfall value 5.',
        ),
        choose(
          'A churn table has the columns churned, monthly_fee, support_calls and tenure_months. You want to predict churned. Which columns are the features?',
          [
            'monthly_fee, support_calls, tenure_months, churned',
            'churned only',
            'monthly_fee and churned',
            'monthly_fee, support_calls, tenure_months',
          ],
          3,
          'Every column except the target can serve as an input; churned is what you predict, so it cannot be a feature.',
        ),
        typeOutput(
          'What does this program print?',
          'def target_of(record):\n    return record["passed"]\n\nstudents = [{"hours": 2, "passed": False}, {"hours": 9, "passed": True}]\nlabels = []\nfor student in students:\n    labels.append(target_of(student))\nprint(labels)',
          '[False, True]',
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
        typeOutput(
          'What does this program print?',
          'reading = {"sensor": "A7", "temp_c": 91.5}\noverheated = reading["temp_c"] >= 90\nprint(reading["temp_c"], overheated)',
          '91.5 True',
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
            'Sensor logs with timestamps but no recorded outcome',
            'Transactions each labelled fraud or not fraud',
            'Website visits with no conversion data',
          ],
          2,
          'Only the transactions come with a known target for every example.',
        ),
        typeOutput(
          'What does this program print?',
          'def learning_type(has_labels, takes_actions):\n    if takes_actions:\n        return "reinforcement"\n    if has_labels:\n        return "supervised"\n    return "unsupervised"\n\nprint(learning_type(False, True))\nprint(learning_type(True, False))',
          'reinforcement\nsupervised',
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
            'Missed payments on earlier loans',
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
            'refund_issued is recorded after the cancellation',
            'refund_issued was stored as True/False, not 0/1',
            'refund_issued is a categorical column',
            'Test sets are always easier than real data',
          ],
          0,
          'Refunds follow cancellations, so the feature carried the answer during testing but is missing at prediction time.',
        ),
        typeOutput(
          'What does this program print?',
          'row = {"plan": "pro", "logins": 12, "cancel_reason": "price", "cancelled": True}\nusable = ["plan", "logins"]\nfeatures = []\nfor name in usable:\n    features.append(row[name])\nprint(features)\nprint(row["cancelled"])',
          "['pro', 12]\nTrue",
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
            'Their choices were tuned to those test rows',
            'Test sets always contain easier rows',
            'Running many experiments overfits the training set',
            'Scores always fall after a model is chosen',
          ],
          0,
          'Selecting on the test score fits the choices to those specific rows, so the score overstates performance on new data.',
        ),
        typeOutput(
          'What does this program print?',
          'rows = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]\ntrain = rows[:7]\nvalidation = rows[7:9]\ntest = rows[9:]\nprint(len(train), len(validation), len(test))',
          '7 2 1',
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
        typeOutput(
          'What does this program print?',
          'months = ["jan", "feb", "mar", "apr", "may", "jun"]\ntrain = months[:-2]\ntest = months[-2:]\nprint(train[-1], test[0])',
          'apr may',
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
            'A random split leaves fewer unusual days in the test set',
            'Training can include days after the test days',
            'The chronological test set is larger',
          ],
          2,
          'With a random split, the model sees neighbouring and later days, information a real forecast never has.',
        ),
        typeOutput(
          'What does this program print?',
          'temps = [3, 5, 4, 8, 9, 7, 10, 12]\nn_test = 3\ntrain = temps[:len(temps) - n_test]\ntest = temps[len(temps) - n_test:]\nprint(len(train), test)',
          '5 [7, 10, 12]',
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
        typeOutput(
          'What does this program print?',
          'labels = [1, 0, 0, 1, 0, 0, 0, 0, 1, 0]\ntrain, test = labels[:5], labels[5:]\nprint(sum(labels) / len(labels))\nprint(sum(train) / len(train), sum(test) / len(test))',
          '0.3\n0.4 0.2',
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
            'Independent rows with uneven class shares',
          ],
          3,
          'Stratification preserves class shares; it does not address time order or repeated entities.',
        ),
        typeOutput(
          'What does this program print?',
          'labels = [0, 0, 0, 0, 0, 0, 0, 0, 1, 1]\ntrain, test = labels[:8], labels[8:]\nprint(sum(train), sum(test))',
          '0 2',
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
        typeOutput(
          'What does this program print?',
          'readings = [{"machine": "m1", "temp": 70}, {"machine": "m2", "temp": 64},\n            {"machine": "m1", "temp": 72}, {"machine": "m3", "temp": 80},\n            {"machine": "m2", "temp": 66}]\nheld_out = ["m2"]\ntrain, test = [], []\nfor r in readings:\n    if r["machine"] in held_out:\n        test.append(r["temp"])\n    else:\n        train.append(r["temp"])\nprint(len(train), len(test))\nprint(test)',
          '3 2\n[64, 66]',
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
          'The training mean is $120 / 4 = 30.0$, and the baseline predicts that same value for every new row.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          'train = [3, 5, 10]\ntest = [4, 100]\nbaseline = sum(train) / len(train)\nprint(baseline)',
          '6.0',
          'Only the training targets are averaged: $18 / 3 = 6.0$. Division with / gives a float.',
        ),
        choose(
          'Why compute the baseline constant from the training targets only?',
          [
            'Test targets are noisier, so their mean is less reliable',
            'Using test targets would leak answers into the rule',
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
        typeOutput(
          'What does this program print?',
          'train = [12, 18, 15]\nbaseline = sum(train) / len(train)\nnew_rows = [{"id": 1}, {"id": 2}]\nprint([baseline for row in new_rows])',
          '[15.0, 15.0]',
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
        typeOutput(
          'What does this program print?',
          'train = [1, 1, 0, 1, 1]\nif sum(train) > len(train) / 2:\n    majority = 1\nelse:\n    majority = 0\ntest = [1, 0, 1, 1, 0]\nhits = sum([1 for y in test if y == majority])\nprint(majority, hits / len(test))',
          '1 0.6',
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
        typeOutput(
          'What does this program print?',
          'majority = 0\nvalidation = [1, 0, 0, 0, 0, 1, 0, 0]\ncorrect = sum([1 for y in validation if y == majority])\nprint(correct, correct / len(validation))',
          '6 0.75',
          'Six validation labels equal the predicted class 0, and $6 / 8 = 0.75$.',
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
          'The squares are 9, 0, 16, and 0, which average to $25 / 4 = 6.25$. Its square root is 2.5.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          'actual = [10, 12, 9]\nprediction = 10\nmse = sum([(a - prediction) ** 2 for a in actual]) / len(actual)\nprint(round(mse, 3))',
          '1.667',
          'The residuals are 0, 2, and -1; their squares sum to 5, and $5 / 3$ rounds to 1.667.',
        ),
        typeOutput(
          'What does this program print?',
          'residuals = [5, -5, 5, -5]\nmse = sum([r ** 2 for r in residuals]) / len(residuals)\nprint(mse, mse ** 0.5)',
          '25.0 5.0',
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
          'The first MSE is $4 / 4 = 1$, the second is $16 / 4 = 4$: squaring makes the single large error dominate.',
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
        typeOutput(
          'What does this program print?',
          'baseline_residuals = [4, -4, 2, -2]\nmodel_residuals = [3, -1, 1, -3]\nbaseline_mse = sum([r ** 2 for r in baseline_residuals]) / 4\nmodel_mse = sum([r ** 2 for r in model_residuals]) / 4\nprint(baseline_mse - model_mse)',
          '5.0',
          'The baseline MSE is $40 / 4 = 10.0$ and the model MSE is $20 / 4 = 5.0$, so the model is 5.0 lower.',
        ),
        choose(
          'A model has an RMSE of 8 minutes on the validation set. The training-mean baseline has an RMSE of 11 minutes on the test set. What is wrong with concluding that the model is better?',
          [
            'Nothing; 8 is smaller than 11',
            'The baseline should have been scored with MSE instead',
            'A baseline is never evaluated with RMSE',
            'The two errors come from different rows',
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
        typeOutput(
          'What does this program print?',
          'baseline_mse = 49.0\nmodel_mse = 36.0\nprint(baseline_mse ** 0.5 - model_mse ** 0.5)',
          '1.0',
          'The RMSEs are 7.0 and 6.0, so the model’s typical error is 1.0 target unit smaller.',
        ),
      ],
    },
  ],
  'ml-preprocessing': [
    {
      title: 'Standardize with training statistics',
      explanation: [
        'Standardizing rescales a feature to $z = (x - \\text{mean}) / \\text{std}$, so features measured in different units become comparable. With NumPy, train.mean() and train.std() give the mean and the population standard deviation.',
        'The mean and standard deviation come from the training rows only, and every later row is transformed with those same two numbers. A new value outside the training range simply gets a large z value.',
      ],
      example: {
        code: 'import numpy as np\ntrain = np.array([2.0, 4.0, 4.0, 4.0, 5.0, 5.0, 7.0, 9.0])\nmean, std = train.mean(), train.std()\nprint(mean, std)\nprint(((np.array([9.0, 1.0]) - mean) / std).tolist())',
        output: '5.0 2.0\n[2.0, -2.0]',
        explanation:
          'The training mean is 5 and the standard deviation is 2. A new 9 lies two standard deviations above the mean, and 1 lies two below.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          'import numpy as np\ntrain = np.array([10.0, 14.0])\ntest = np.array([16.0, 12.0])\nmean, std = train.mean(), train.std()\nprint(((test - mean) / std).tolist())',
          '[2.0, 0.0]',
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
            'It lets the model see the test labels during training',
            'It removes outliers from the training set',
            'Test rows shape the scaling used in training',
            'It makes the test set smaller',
          ],
          2,
          'The test rows leak their distribution into training through the shared mean and standard deviation.',
        ),
        typeOutput(
          'What does this program print?',
          'import numpy as np\ntrain = np.array([0.0, 4.0])\nmean, std = train.mean(), train.std()\nprint(((np.array([10.0]) - mean) / std).tolist())',
          '[4.0]',
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
        typeOutput(
          'What does this program print?',
          'from sklearn.preprocessing import StandardScaler\nscaler = StandardScaler().fit([[0.0], [10.0]])\nprint(scaler.mean_.tolist(), scaler.scale_.tolist())\nprint(scaler.transform([[20.0], [5.0]]).tolist())',
          '[5.0] [5.0]\n[[3.0], [0.0]]',
          'fit learns mean 5 and scale 5 from the training rows; transform reuses them, so 20 becomes 3.0 and 5 becomes 0.0.',
        ),
        typeOutput(
          'What does this program print?',
          'from sklearn.preprocessing import StandardScaler\ntrain = [[1.0], [2.0], [3.0]]\ntest = [[10.0], [20.0]]\nscaler = StandardScaler()\nscaler.fit_transform(train)\nscaler.transform(test)\nprint(int(scaler.n_samples_seen_))',
          '3',
          'Only fit_transform learned from rows; transform applies the statistics without counting the test rows.',
        ),
        choose(
          'You call scaler.fit(test_X) right before scaler.transform(test_X). What goes wrong?',
          [
            'The test rows now set their own scaling',
            'transform raises an error after a second fit',
            'The scaler now averages training and test statistics',
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
        typeOutput(
          'What does this program print?',
          'import numpy as np\nfrom sklearn.impute import SimpleImputer\nimputer = SimpleImputer(strategy="median").fit([[1.0], [np.nan], [3.0], [10.0]])\nprint(imputer.statistics_.tolist())\nprint(imputer.transform([[np.nan], [7.0]]).tolist())',
          '[3.0]\n[[3.0], [7.0]]',
          'The median of the observed training values 1, 3, and 10 is 3.0; only the missing entry is replaced.',
        ),
        typeOutput(
          'What does this program print?',
          'import pandas as pd\ntrain = pd.Series(["bus", "car", "bus"])\ntest = pd.Series(["train", "car"])\nprint(pd.get_dummies(train, dtype=int).columns.tolist())\nprint(pd.get_dummies(test, dtype=int).columns.tolist())',
          "['bus', 'car']\n['car', 'train']",
          'get_dummies builds columns from whatever values it sees, so the two tables disagree. A fitted encoder fixes the column list from training data.',
        ),
        choose(
          'Which value should fill missing incomes in the test set?',
          [
            'The median income of the test rows',
            'The median of all rows, training and test combined',
            'The income of the previous row',
            'The median income of the training rows',
          ],
          3,
          'Fill values are learned statistics, so they come from training rows like every other preprocessing step.',
        ),
        choose(
          'An encoder learned the categories bus, car, and train. In production a row arrives with "scooter". Which preparation is sound?',
          [
            'Refit the encoder on the production row',
            'Plan and test how unknown categories are encoded',
            'Map scooter to the alphabetically closest category',
            'Give scooter a fourth column for that row only',
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
          'The imputer learns mean 3 and fills the gap, so the scaler learns from [0, 3, 6]. A new NaN becomes 3, which is 0.0 after scaling; 9 becomes $6 / 2.449 \\approx 2.449$.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          'import numpy as np\nfrom sklearn.pipeline import make_pipeline\nfrom sklearn.impute import SimpleImputer\nfrom sklearn.preprocessing import StandardScaler\nprep = make_pipeline(SimpleImputer(strategy="mean"), StandardScaler())\nprep.fit([[1.0], [np.nan], [3.0]])\nprint(np.round(prep.transform([[np.nan], [3.0]]), 3).tolist())',
          '[[0.0], [1.225]]',
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
            'The training rows after imputation',
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
            'On each split’s training rows',
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
        'A linear regression prediction is an intercept $b$ plus each feature times its weight: $b + w_1 x_1 + w_2 x_2 + \\cdots$. The weighted sum is the dot product of the weight vector and the feature vector; with NumPy arrays, (w * x).sum() computes it, and X @ w computes it for every row of a feature matrix X at once.',
        'The model is linear in its weights, not necessarily in the raw input. Adding a column that holds x squared still gives a linear model, because the prediction remains a weighted sum of the columns.',
      ],
      example: {
        code: 'import numpy as np\nw = np.array([40.0, 15.0])\nb = 50.0\nx = np.array([3.0, 2.0])\nprint(b + (w * x).sum())\nX = np.array([[3.0, 2.0], [1.0, 0.0]])\nprint((X @ w + b).tolist())',
        output: '200.0\n[200.0, 90.0]',
        explanation:
          'For one row, $50 + 40 \\times 3 + 15 \\times 2 = 200$. X @ w computes each row’s weighted sum, and adding b shifts every prediction.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          'import numpy as np\nw = np.array([3.0, -2.0])\nb = 10.0\nx = np.array([4.0, 5.0])\nprint(b + (w * x).sum())',
          '12.0',
          '$10 + 3 \\times 4 + (-2) \\times 5 = 10 + 12 - 10 = 12.0$. The negative weight lowers the prediction.',
        ),
        typeOutput(
          'What does this program print?',
          'import numpy as np\nX = np.array([[1.0, 0.0], [2.0, 1.0], [0.0, 3.0]])\nw = np.array([5.0, 2.0])\nb = 1.0\nprint((X @ w + b).tolist())',
          '[6.0, 13.0, 7.0]',
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
          'Which formula is still a linear regression model with learned weights $b$, $w_1$, and $w_2$?',
          [
            '$b + w_1 x + w_2 x^2$',
            '$b + x^{w_1}$',
            '$b + w_1 w_2 x$',
            '$b / (w_1 x)$',
          ],
          0,
          'It is a weighted sum of the columns $x$ and $x^2$, so it is linear in the weights even though it curves in $x$.',
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
        typeOutput(
          'What does this program print?',
          'import numpy as np\nx = np.array([1.0, 2.0, 3.0])\ny = np.array([2.0, 4.0, 7.0])\n\ndef sse(b, w):\n    residuals = y - (b + w * x)\n    return float((residuals ** 2).sum())\n\nprint(sse(0.0, 2.0), sse(-1.0, 2.5))',
          '1.0 0.5',
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
            'Not necessarily; another line may have lower SSE',
            'Yes; least squares makes the residuals sum to zero',
            'It cannot be judged without test data',
          ],
          1,
          'Its SSE is 18. A line through both points would have SSE 0, so zero total residual is not enough.',
        ),
        typeOutput(
          'What does this program print?',
          'import numpy as np\ny = np.array([2.0, 6.0, 7.0])\nfor b in [4.0, 5.0, 6.0]:\n    print(b, float(((y - b) ** 2).sum()))',
          '4.0 17.0\n5.0 14.0\n6.0 17.0',
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
          'The points lie on $y = 3 + 2x$, so the fitted intercept is 3 and the one coefficient is 2. At $x = 10$ the model predicts 23.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          'from sklearn.linear_model import LinearRegression\nX = [[1, 0], [0, 1], [1, 1], [2, 1]]\ny = [3, 4, 6, 8]\nmodel = LinearRegression().fit(X, y)\nprint(model.coef_.round(3).tolist(), round(float(model.intercept_), 3))',
          '[2.0, 3.0] 1.0',
          'Every row satisfies $y = 1 + 2x_1 + 3x_2$; coef_ lists the weights in column order.',
        ),
        typeOutput(
          'What does this program print?',
          'import numpy as np\nx = np.array([4.0, 5.0, 6.0])\nX = x.reshape(-1, 1)\nprint(x.shape, X.shape)',
          '(3,) (3, 1)',
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
            'X must be two-dimensional',
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
            'At equal area, the model predicts 10 more with a garage',
            'Ten homes in the data have a garage',
          ],
          2,
          'A coefficient compares predictions with the other features held fixed; it does not establish a causal effect.',
        ),
        choose(
          'A model predicting daily sunburn cases gives ice-cream sales a large positive coefficient. What does this show?',
          [
            'They are associated, perhaps both driven by sunny days',
            'Selling more ice cream would raise the number of sunburns',
            'The coefficient must be a calculation error',
            'Sunburn causes people to buy ice cream',
          ],
          0,
          'A shared cause such as sunshine creates the association; the coefficient alone cannot separate cause from correlation.',
        ),
        typeOutput(
          'What does this program print?',
          'from sklearn.linear_model import LinearRegression\nhours = [[1.0], [2.0], [3.0]]\nminutes = [[60.0], [120.0], [180.0]]\ncost = [30.0, 50.0, 70.0]\na = LinearRegression().fit(hours, cost).coef_[0]\nb = LinearRegression().fit(minutes, cost).coef_[0]\nprint(round(float(a), 3), round(float(b), 3))',
          '20.0 0.333',
          'Cost rises 20 per hour, which is $20 / 60 \\approx 0.333$ per minute.',
        ),
        typeOutput(
          'The second column holds x squared. What does this program print?',
          'from sklearn.linear_model import LinearRegression\nX = [[0.0, 0.0], [1.0, 1.0], [2.0, 4.0], [3.0, 9.0]]\ny = [1.0, 2.0, 5.0, 10.0]\nmodel = LinearRegression().fit(X, y)\nprint(model.predict([[4.0, 16.0]]).round(3).tolist())',
          '[17.0]',
          'The data follow $y = 1 + 0 \\cdot x + 1 \\cdot x^2$, a weighted sum of the two columns, so the model predicts $1 + 16 = 17$.',
        ),
      ],
    },
  ],
  'ml-gradient-descent': [
    {
      title: 'Step against the gradient',
      explanation: [
        'Gradient descent improves a parameter by moving it opposite to the loss gradient: $w = w - \\text{learning\\_rate} \\times \\text{gradient}$. A positive gradient means the loss rises as $w$ grows, so $w$ moves down; a negative gradient moves $w$ up.',
        'With several parameters, each one moves by its own gradient entry times the same learning rate. For the loss $(w - t)^2$ the gradient is $2(w - t)$.',
      ],
      example: {
        code: 'w = 4.0\ngradient = 2 * (w - 1)\nlearning_rate = 0.25\nw = w - learning_rate * gradient\nprint(gradient, w)',
        output: '6.0 2.5',
        explanation:
          'For the loss $(w - 1)^2$ at $w = 4$, the gradient is 6, so the step subtracts $0.25 \\times 6 = 1.5$ and $w$ moves toward 1.',
      },
      questions: [
        typeOutput(
          'The loss is $(w - 3)^2$. What does this program print?',
          'w = 0.0\ngradient = 2 * (w - 3)\nw = w - 0.1 * gradient\nprint(round(w, 2))',
          '0.6',
          'The gradient is -6, and subtracting 0.1 * (-6) raises w to 0.6, toward the minimum at 3.',
        ),
        choose(
          'The gradient of the loss at the current w is -8. Which way does one gradient-descent step move w?',
          [
            'Down, toward smaller w',
            'Nowhere until the gradient becomes positive',
            'Directly to the minimum',
            'Up, because it subtracts a negative number',
          ],
          3,
          'w - rate * (-8) adds 8 * rate, so w increases, which is the direction in which the loss falls.',
        ),
        choose(
          'Which update is gradient descent with learning rate lr?',
          [
            '$w = w + \\text{lr} \\times \\text{gradient}$',
            '$w = w - \\text{lr} \\times \\text{gradient}$',
            '$w = \\text{lr} \\times \\text{gradient}$',
            '$w = w - \\text{gradient} / \\text{lr}$',
          ],
          1,
          'Subtracting a small multiple of the gradient moves w in the direction of decreasing loss.',
        ),
        typeOutput(
          'What does this program print?',
          'weights = [1.0, -2.0]\ngradient = [4.0, -6.0]\nlr = 0.5\nweights = [weights[i] - lr * gradient[i] for i in range(2)]\nprint(weights)',
          '[-1.0, 1.0]',
          'Each weight moves by its own gradient: $1 - 0.5 \\times 4 = -1$ and $-2 - 0.5 \\times (-6) = 1$.',
        ),
      ],
    },
    {
      title: 'Pick a learning rate that converges',
      explanation: [
        'Repeating the update moves w step by step toward a minimum. The learning rate sets the step size. Too small, and progress is slow. Too large, and a step jumps past the minimum to the other side.',
        'For the loss $(w - t)^2$, each step multiplies the distance to $t$ by $(1 - 2 \\times \\text{lr})$. With $\\text{lr} = 0.5$ one step lands exactly on $t$; between 0.5 and 1 the steps overshoot but shrink; above 1 every step overshoots further, so training diverges.',
      ],
      example: {
        code: 'def run(lr, steps):\n    w = 0.0\n    for step in range(steps):\n        w = w - lr * 2 * (w - 10)\n    return round(w, 3)\n\nprint(run(0.1, 3))\nprint(run(0.5, 3))\nprint(run(1.1, 3))',
        output: '4.88\n10.0\n27.28',
        explanation:
          'With 0.1, the distance shrinks by 20% per step. With 0.5, the first step lands on 10. With 1.1, each step overshoots further, so w moves away from 10.',
      },
      questions: [
        typeOutput(
          'The loss is $(w - 8)^2$. What does this program print?',
          'w = 0.0\nfor step in range(2):\n    w = w - 0.25 * 2 * (w - 8)\nprint(w)',
          '6.0',
          'Each step halves the distance to 8: it goes from 8 to 4 to 2, so w ends at 6.0.',
        ),
        typeOutput(
          'The loss is $(w - 4)^2$. What does this program print?',
          'w = 0.0\nfor step in range(2):\n    w = w - 0.75 * 2 * (w - 4)\n    print(w)',
          '6.0\n3.0',
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
            'Start every run from $w = 0$',
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
        'For a model that predicts $wx$ with mean squared error, each example contributes the gradient $2(wx - y)x$, and the loss gradient is their average. Batch gradient descent averages over every training example for each update.',
        'Stochastic gradient descent updates after a single example, and mini-batch gradient descent after a small group. Smaller batches make cheaper but noisier gradient estimates, because each one depends on which examples were picked.',
      ],
      example: {
        code: 'xs = [1.0, 2.0, 3.0]\nys = [2.0, 4.0, 6.0]\nw = 1.0\ngrads = [2 * (w * xs[i] - ys[i]) * xs[i] for i in range(3)]\nprint(grads)\nprint(round(sum(grads) / len(grads), 3))',
        output: '[-2.0, -8.0, -18.0]\n-9.333',
        explanation:
          'Each example says $w$ is too small, by different amounts. The batch gradient is their average, $-28 / 3$.',
      },
      questions: [
        typeOutput(
          'Only the first two examples form this mini-batch. What does this program print?',
          'xs = [1.0, 2.0, 3.0, 4.0]\nys = [3.0, 6.0, 9.0, 12.0]\nw = 2.0\nbatch = [0, 1]\ngrads = [2 * (w * xs[i] - ys[i]) * xs[i] for i in batch]\nprint(sum(grads) / len(grads))',
          '-5.0',
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
            'Each gradient comes from one row, so it varies by step',
            'Stochastic updates use a larger learning rate by definition',
            'Stochastic updates skip the gradient calculation',
            'Stochastic updates are evaluated on the test set',
          ],
          0,
          'A one-row gradient is a rough estimate of the average gradient, so successive steps point in varying directions.',
        ),
        typeOutput(
          'This loop makes one stochastic update per example. What does it print?',
          'xs = [1.0, 2.0]\nys = [2.0, 4.0]\nw = 0.0\nfor i in range(2):\n    w = w - 0.1 * 2 * (w * xs[i] - ys[i]) * xs[i]\n    print(round(w, 3))',
          '0.4\n1.68',
          'The first update gives 0.4. The second gradient is computed at $w = 0.4$: $2(0.8 - 4) \\times 2 = -12.8$, so $w$ rises by 1.28.',
        ),
      ],
    },
    {
      title: 'Fit a line by updating both parameters together',
      explanation: [
        'For predictions $b + wx$ and mean squared error, the gradient for $b$ averages $2(\\text{prediction} - y)$, and the gradient for $w$ averages $2(\\text{prediction} - y)x$. Compute both from the current $b$ and $w$, then update both, and repeat.',
        'When both gradients reach zero, the parameters sit at a flat point. For the mean squared error of a linear model that point is the least-squares solution. A loss with several valleys can also be flat at a valley that is not the lowest one, so a zero gradient alone does not prove the best possible fit.',
      ],
      example: {
        code: 'xs = [0.0, 1.0, 2.0]\nys = [1.0, 3.0, 5.0]\nb, w = 0.0, 0.0\nfor step in range(500):\n    errors = [b + w * xs[i] - ys[i] for i in range(3)]\n    grad_b = sum([2 * e for e in errors]) / 3\n    grad_w = sum([2 * errors[i] * xs[i] for i in range(3)]) / 3\n    b, w = b - 0.1 * grad_b, w - 0.1 * grad_w\nprint(round(b, 3), round(w, 3))',
        output: '1.0 2.0',
        explanation:
          'Five hundred small steps reach the line $y = 1 + 2x$, which fits all three points exactly.',
      },
      questions: [
        typeOutput(
          'What does this program print after one update?',
          'xs = [1.0, 2.0]\nys = [3.0, 5.0]\nb, w = 0.0, 0.0\nerrors = [b + w * xs[i] - ys[i] for i in range(2)]\ngrad_b = sum([2 * e for e in errors]) / 2\ngrad_w = sum([2 * errors[i] * xs[i] for i in range(2)]) / 2\nb, w = b - 0.1 * grad_b, w - 0.1 * grad_w\nprint(round(b, 3), round(w, 3))',
          '0.8 1.3',
          'The errors are -3 and -5, so grad_b = -8 and grad_w = (-6 - 20) / 2 = -13. Subtracting 0.1 times each gives 0.8 and 1.3.',
        ),
        choose(
          'After many steps, both gradients of the mean squared error for a linear model are 0. What does this tell you?',
          [
            'The line now passes through every training point',
            'The learning rate was too small',
            'Training must restart from new values',
            'b and w are the training least-squares values',
          ],
          3,
          'For a linear model, mean squared error has a single valley, so a flat point is the least-squares minimum on the training rows.',
        ),
        choose(
          'A loss has several valleys. Gradient descent stops where the gradient is 0. What can you conclude?',
          [
            'It found the lowest point of the whole loss',
            'It reached a flat point, possibly a local valley',
            'The training loss at this point must be zero',
            'The learning rate was exactly right',
          ],
          1,
          'A zero gradient marks a flat point, which can be a local minimum rather than the overall best.',
        ),
        choose(
          'Why compute grad_b and grad_w before updating either parameter?',
          [
            'Both gradients should describe the same point',
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
  'ml-overfitting': [
    {
      title: 'Compare training and validation error',
      explanation: [
        'Training error measures how well a model fits the rows it learned from; validation error measures how well it predicts rows it never saw. The gap between them shows how much of the fit fails to carry over.',
        'A small training error with a much larger validation error is overfitting. High error on both, with a small gap, is underfitting. Good generalization means a low validation error with a small gap.',
      ],
      example: {
        code: 'train = 0.4\nvalidation = 6.2\nprint(round(validation - train, 1))',
        output: '5.8',
        explanation:
          'The model fits its training rows almost perfectly but misses new rows badly. A gap this large relative to the training error is the signature of overfitting.',
      },
      questions: [
        choose(
          'Training MSE is 0.3 and validation MSE is 8.1. What is the clearest diagnosis?',
          [
            'Underfitting',
            'Overfitting',
            'Good generalization',
            'Too little training error',
          ],
          1,
          'The model fits seen rows far better than unseen ones, so its fit does not carry over.',
        ),
        choose(
          'Training MSE is 9.6 and validation MSE is 9.9, while predicting the mean gives 10.2. What does this suggest?',
          [
            'Overfitting',
            'A leaked validation set',
            'Underfitting',
            'A perfect fit',
          ],
          2,
          'Both errors are high and barely beat a constant baseline, so the model misses real structure.',
        ),
        typeOutput(
          'Each pair is (training MSE, validation MSE). What does this program print?',
          'models = {"shallow": (5.1, 5.4), "medium": (2.2, 2.6), "deep": (0.1, 7.9)}\nfor name, (train, val) in models.items():\n    print(name, round(val - train, 1))',
          'shallow 0.3\nmedium 0.4\ndeep 7.8',
          'Each line subtracts training error from validation error. The deep model has by far the largest gap.',
        ),
        choose(
          'Training and validation MSE are shallow (5.1, 5.4), medium (2.2, 2.6) and deep (0.1, 7.9). Which model generalizes best?',
          [
            'shallow, because its gap is smallest',
            'deep, because its training error is lowest',
            'medium, because its validation error is lowest',
            'All three equally',
          ],
          2,
          'Generalization is judged by error on unseen rows; medium has the lowest validation error with a small gap.',
        ),
      ],
    },
    {
      title: 'Read a learning curve',
      explanation: [
        'A learning curve records training and validation error as the training set grows. With few rows a flexible model can fit them all, so training error starts low and validation error high.',
        'More rows make memorizing harder: training error rises a little and validation error falls, so the gap narrows. If both curves level off at a high error, the model underfits and more data will not help; a simpler or richer model is the fix, not more rows.',
      ],
      example: {
        code: 'sizes = [50, 100, 200, 400]\ntrain = [0.5, 1.1, 1.6, 1.8]\nval = [6.0, 4.1, 2.9, 2.3]\nfor size, t, v in zip(sizes, train, val):\n    print(size, round(v - t, 1))',
        output: '50 5.5\n100 3.0\n200 1.3\n400 0.5',
        explanation:
          'The gap shrinks from 5.5 to 0.5 as data grows: the extra rows stop the model from fitting details that do not generalize.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          'train = [6.8, 7.0, 7.1]\nval = [7.4, 7.3, 7.3]\ngaps = [round(v - t, 1) for t, v in zip(train, val)]\nprint(gaps)',
          '[0.6, 0.3, 0.2]',
          'Each gap subtracts training error from validation error at the same training size.',
        ),
        choose(
          'A learning curve shows both errors leveling off near 7 with a small gap. What will doubling the data most likely do?',
          [
            'Cut validation error in half',
            'Cause overfitting',
            'Change little, because the model underfits',
            'Raise training error above validation error',
          ],
          2,
          'When both curves level off high with a small gap, the model lacks capacity; more rows do not add it.',
        ),
        typeOutput(
          'What does this program print?',
          'train = [0.2, 0.6, 0.9, 1.2]\nval = [5.0, 3.1, 2.0, 1.5]\nprint(round(val[-1] - train[-1], 1) < round(val[0] - train[0], 1))',
          'True',
          'The last gap is 0.3 and the first is 4.8, so the curve narrows as data grows.',
        ),
        choose(
          'A learning curve shows a large gap that is still shrinking at the largest training size. Which step is most promising?',
          [
            'Collect more training rows',
            'Evaluate on the training rows instead',
            'Make the model more flexible',
            'Remove the validation set',
          ],
          0,
          'A shrinking gap means more data is still helping the model generalize.',
        ),
      ],
    },
    {
      title: 'Choose complexity on validation data',
      explanation: [
        'More complexity always lowers training error, so training error cannot choose a model. Pick the complexity, such as a tree depth or polynomial degree, with the lowest validation error.',
        'Keep the test set for one final check after all choices are made. Choosing by test error turns the test set into another validation set, and the final score becomes optimistic.',
      ],
      example: {
        code: 'train = [3.0, 1.5, 0.4, 0.0]\nval = [3.4, 2.1, 2.6, 5.3]\nbest = 0\nfor i, error in enumerate(val):\n    if error < val[best]:\n        best = i\nprint(best, train[best])',
        output: '1 1.5',
        explanation:
          'Position 1 has the lowest validation error. The most complex model, at position 3, has zero training error but generalizes worst.',
      },
      questions: [
        typeOutput(
          'Each pair is (model, validation MSE). What does this program print?',
          'results = [("linear", 2.8), ("tree", 2.1), ("forest", 2.3)]\nbest_name, best_error = results[0]\nfor name, error in results:\n    if error < best_error:\n        best_name, best_error = name, error\nprint(best_name)',
          'tree',
          'The loop keeps the name with the lowest validation error, which is the tree at 2.1.',
        ),
        choose(
          'Why not pick the depth with the lowest training error?',
          [
            'Training error is always zero',
            'Training error always favours the deepest tree',
            'Training error cannot be computed for trees',
            'Training error is too noisy to compare depths',
          ],
          1,
          'Training error keeps falling with complexity, so it would always choose the most complex model.',
        ),
        choose(
          'You tried 30 depths and chose the one with the best test error. What is wrong with reporting that test error?',
          [
            'Nothing, the test set was never trained on',
            'Test error is always higher than validation error',
            'It is optimistic; the test set helped choose',
            'Depth cannot be tuned',
          ],
          2,
          'Selecting on the test set fits the choice to it, so it no longer measures performance on new data.',
        ),
        choose(
          'Validation MSE by degree is 4.0, 2.2, 2.4, 3.9 for degrees 1 to 4. Which degree should you keep?',
          ['Degree 4', 'Degree 1', 'Degree 3', 'Degree 2'],
          3,
          'Degree 2 has the lowest validation error; higher degrees fit training rows better but generalize worse.',
        ),
      ],
    },
  ],
  'ml-regularization': [
    {
      title: 'Diagnose overfitting and underfitting',
      explanation: [
        'Compare the error on the training rows with the error on validation rows. Low training error with much higher validation error is overfitting: the model fits details of the training rows that do not carry over. High error on both is underfitting: the model misses patterns even in the data it trained on.',
        'Model flexibility moves you between the two. Adding columns such as $x^2$ up to $x^5$ lets a linear model bend more; with few rows it can pass through every training point and still predict new points badly.',
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
            'Adding columns for $x^6$ through $x^{10}$',
            'Training longer on the same few rows',
            'Scoring the model on its training rows',
            'Using a simpler model or more rows',
          ],
          3,
          'Less flexibility, or more rows to constrain it, makes it harder to fit details that do not generalize.',
        ),
        typeOutput(
          'Each list position is a model of increasing complexity. What does this program print?',
          'train_mse = [4.1, 2.0, 0.6, 0.1]\nval_mse = [4.5, 2.4, 2.9, 7.8]\nbest = 0\nfor i in range(len(val_mse)):\n    if val_mse[i] < val_mse[best]:\n        best = i\nprint(best, train_mse[best])',
          '1 2.0',
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
          'The least-squares slope is 2. As alpha grows, the penalty pulls the slope toward 0, even though the data fit $y = 2x$ exactly.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          'data_loss = 2.0\nweights = [1.0, -3.0]\nalpha = 0.1\nprint(data_loss + alpha * sum([w ** 2 for w in weights]))',
          '3.0',
          'The squared weights sum to 1 + 9 = 10; alpha scales that to 1.0, which is added to the data loss.',
        ),
        typeOutput(
          'What does this program print?',
          'from sklearn.linear_model import LinearRegression, Ridge\nX = [[-1.0], [0.0], [1.0]]\ny = [-2.0, 0.0, 2.0]\nplain = LinearRegression().fit(X, y).coef_[0]\nridge = Ridge(alpha=2.0).fit(X, y).coef_[0]\nprint(round(float(plain), 3), round(float(ridge), 3))',
          '2.0 1.0',
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
            'The penalized coefficient size depends on the unit',
            'Ridge cannot fit features measured in metres',
            'Ridge penalizes the feature values, which are larger in metres',
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
        typeOutput(
          'What does this program print?',
          'data_loss = 1.0\nweights = [2.0, -3.0, 0.0]\nalpha = 0.5\nprint(data_loss + alpha * sum([abs(w) for w in weights]))',
          '3.5',
          'The absolute values sum to 5, so the L1 penalty is 2.5. Squaring instead would give the ridge value 7.5.',
        ),
        typeOutput(
          'Only the first two columns influence y. What does this program print?',
          'import numpy as np\nfrom sklearn.linear_model import Lasso\nX = np.array([[1.0, 2.0, 0.5], [2.0, 1.0, -0.5], [3.0, 4.0, 0.0], [4.0, 3.0, 1.0], [5.0, 5.0, -1.0]])\ny = 3 * X[:, 0] + 0.5 * X[:, 1]\nfor alpha in [0.01, 2.0]:\n    coef = Lasso(alpha=alpha).fit(X, y).coef_\n    print(alpha, int((coef == 0).sum()))',
          '0.01 1\n2.0 2',
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
        typeOutput(
          'What does this program print?',
          'alphas = [0.01, 0.1, 1.0, 10.0]\ntrain_mse = [1.2, 1.5, 2.3, 4.0]\nval_mse = [5.2, 4.1, 3.6, 4.4]\nbest = 0\nfor i in range(len(alphas)):\n    if val_mse[i] < val_mse[best]:\n        best = i\nprint(alphas[best], train_mse[best])',
          '1.0 2.3',
          'alpha = 1.0 has the lowest validation error, 3.6; the program prints its training error, 2.3.',
        ),
        choose(
          'Validation loss falls for 30 steps, then rises while training loss keeps falling. Which parameters should early stopping keep?',
          [
            'Those from the final step',
            'Those from the step where the two losses were closest',
            'Those with the lowest training loss',
            'Those with the lowest validation loss',
          ],
          3,
          'The validation minimum marks the point after which further training only fits the training rows.',
        ),
        choose(
          'With alpha = 100, both training and validation errors are high. What is happening?',
          [
            'The strong penalty makes the model underfit',
            'The model overfits the training rows',
            'The penalty also shrinks the intercept to zero',
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
            'Training error always prefers alpha = 0',
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
        'Logistic regression computes a linear score $z = b + w_1 x_1 + \\cdots$, which can be any number, and passes it through the sigmoid: $p = \\frac{1}{1 + \\exp(-z)}$. The result always lies between 0 and 1 and is read as the probability of the positive class.',
        'A score of 0 gives exactly 0.5. Positive scores give probabilities above 0.5 and negative scores below. The curve is symmetric: sigmoid(-z) = 1 - sigmoid(z).',
      ],
      example: {
        code: 'import math\n\ndef sigmoid(z):\n    return 1 / (1 + math.exp(-z))\n\nprint(sigmoid(0))\nprint(round(sigmoid(2), 3), round(sigmoid(-2), 3))',
        output: '0.5\n0.881 0.119',
        explanation:
          '$\\exp(0) = 1$, so the score 0 maps to $1 / 2$. Scores of 2 and -2 land the same distance above and below 0.5.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          'import math\nb, w = -3.0, 0.5\nx = 6.0\nz = b + w * x\nprint(z, 1 / (1 + math.exp(-z)))',
          '0.0 0.5',
          'The score is $-3 + 0.5 \\times 6 = 0$, and the sigmoid of 0 is 0.5.',
        ),
        typeOutput(
          'What does this program print?',
          'import math\n\ndef sigmoid(z):\n    return 1 / (1 + math.exp(-z))\n\nprint(round(sigmoid(1.5) + sigmoid(-1.5), 3))',
          '1.0',
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
            'A score is unbounded; a probability lies between 0 and 1',
            'The sigmoid turns every score into a hard label of 0 or 1',
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
        typeOutput(
          'What does this program print?',
          'probabilities = [0.25, 0.3, 0.65, 0.1]\nthreshold = 0.3\nprint([int(p >= threshold) for p in probabilities])',
          '[0, 1, 1, 0]',
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
            'Nothing; only the labels change',
            'Every probability increases',
            'The model is retrained',
            'Probabilities below 0.8 are set to 0',
          ],
          0,
          'The threshold is applied after the model; the probabilities are unchanged.',
        ),
        typeOutput(
          'What does this program print?',
          'probabilities = [0.05, 0.35, 0.5, 0.62, 0.77, 0.93]\nfor threshold in [0.5, 0.75]:\n    flagged = [p for p in probabilities if p >= threshold]\n    print(threshold, len(flagged))',
          '0.5 4\n0.75 2',
          'Four probabilities are at least 0.5, counting 0.5 itself; only 0.77 and 0.93 reach 0.75.',
        ),
      ],
    },
    {
      title: 'Score probabilities with log loss',
      explanation: [
        'Log loss scores a predicted probability $p$ of class 1 against the true label $y$: $-(y \\log(p) + (1 - y) \\log(1 - p))$. Only one term is active: $-\\log(p)$ when $y$ is 1, and $-\\log(1 - p)$ when $y$ is 0.',
        'A confident correct prediction costs almost nothing, while a confident wrong one costs a lot. Logistic regression is fitted by minimizing the average log loss over the training rows.',
      ],
      example: {
        code: 'import math\n\ndef log_loss(y, p):\n    return -(y * math.log(p) + (1 - y) * math.log(1 - p))\n\nprint(round(log_loss(1, 0.9), 3))\nprint(round(log_loss(1, 0.1), 3))',
        output: '0.105\n2.303',
        explanation:
          'Both rows are positive. Predicting 0.9 costs $-\\log(0.9) \\approx 0.105$; predicting 0.1 costs $-\\log(0.1) \\approx 2.303$, about 22 times more.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          'import math\n\ndef log_loss(y, p):\n    return -(y * math.log(p) + (1 - y) * math.log(1 - p))\n\nprint(round(log_loss(0, 0.8), 3))',
          '1.609',
          'The label is 0, so the loss is $-\\log(1 - 0.8) = -\\log(0.2) \\approx 1.609$.',
        ),
        typeOutput(
          'What does this program print?',
          'import math\n\ndef log_loss(y, p):\n    return -(y * math.log(p) + (1 - y) * math.log(1 - p))\n\nlosses = [log_loss(1, 0.5), log_loss(0, 0.5)]\nprint(round(sum(losses) / len(losses), 3))',
          '0.693',
          'A probability of 0.5 costs $\\log(2) \\approx 0.693$ whichever label is true, so the average is also 0.693.',
        ),
        choose(
          'For a row whose true label is 0, one model predicts 0.99 and another 0.6. Which gets the larger log loss?',
          [
            'The 0.6 model, because it is less certain',
            'Both, equally, because both are on the wrong side of 0.5',
            'The 0.99 model, because it is confidently wrong',
            'Neither, because log loss ignores the label',
          ],
          2,
          '$-\\log(0.01) \\approx 4.6$ is far larger than $-\\log(0.4) \\approx 0.92$.',
        ),
        choose(
          'Why is logistic regression trained on log loss rather than on the count of wrong labels?',
          [
            'Log loss uses probabilities and changes smoothly',
            'Counting wrong labels requires test data',
            'Log loss is zero for every reasonable model',
            'Counting wrong labels is too slow on large datasets',
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
          '$x = 4.5$ is midway between the classes, so both columns are 0.5. Rows far to either side get the matching label.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          'from sklearn.linear_model import LogisticRegression\nX = [[1.0], [2.0], [3.0], [6.0], [7.0], [8.0]]\ny = [0, 0, 0, 1, 1, 1]\nweak = LogisticRegression(C=0.01).fit(X, y).coef_[0][0]\nstrong = LogisticRegression(C=100.0).fit(X, y).coef_[0][0]\nprint(round(float(weak), 3), round(float(strong), 3))',
          '0.068 3.095',
          'C = 0.01 imposes a strong penalty, so its coefficient is tiny; C = 100 barely penalizes, so the coefficient is large.',
        ),
        typeOutput(
          'What does this program print?',
          'from sklearn.linear_model import LogisticRegression\nX = [[1.0], [2.0], [3.0], [6.0], [7.0], [8.0]]\ny = ["yes", "yes", "yes", "no", "no", "no"]\nmodel = LogisticRegression().fit(X, y)\nprint(model.classes_.tolist())\nprint(model.predict_proba([[1.0]]).round(2).tolist())',
          "['no', 'yes']\n[[0.03, 0.97]]",
          'classes_ is sorted, so "no" is column 0. A row at $x = 1$ is almost surely "yes", which is column 1.',
        ),
        choose(
          'In scikit-learn’s LogisticRegression, what does a smaller C mean?',
          [
            'A weaker penalty on the coefficients',
            'A stronger penalty on the coefficients',
            'A lower threshold, so more rows are labelled positive',
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
        typeOutput(
          'What does this program print?',
          'from sklearn.metrics import confusion_matrix\nactual = [0, 1, 1, 0, 1]\npredicted = [0, 1, 0, 1, 1]\nprint(confusion_matrix(actual, predicted).tolist())',
          '[[1, 1], [1, 2]]',
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
            'A patient with cancer told the result is clear',
            'A healthy patient flagged for a follow-up test',
            'A healthy patient told the result is clear',
            'A patient with cancer who is flagged for follow-up',
          ],
          0,
          'The actual class is positive and the prediction is negative: the screen missed the cancer.',
        ),
        typeOutput(
          'What does this program print?',
          'actual = [1, 1, 0, 0, 1, 0]\npredicted = [1, 0, 0, 1, 1, 1]\nrows = range(len(actual))\nfp = sum([1 for i in rows if actual[i] == 0 and predicted[i] == 1])\nfn = sum([1 for i in rows if actual[i] == 1 and predicted[i] == 0])\nprint(fp, fn)',
          '2 1',
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
        typeOutput(
          'What does this program print?',
          'from sklearn.metrics import precision_score, recall_score\nactual = [1, 1, 1, 1, 0, 0, 0, 0]\npredicted = [1, 1, 0, 0, 1, 0, 0, 0]\np = precision_score(actual, predicted)\nr = recall_score(actual, predicted)\nprint(round(float(p), 3), round(float(r), 3))',
          '0.667 0.5',
          'TP = 2, FP = 1, FN = 2. Precision is $2 / 3$ and recall is $2 / 4$.',
        ),
        choose(
          'A spam filter has precision 0.95 and recall 0.40. What does that mean?',
          [
            'It catches most spam but also flags many real messages',
            'Its flags are nearly all spam, but it misses most spam',
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
        typeOutput(
          'What does this program print?',
          'tp, fp, fn = 9, 1, 21\nprint(tp / (tp + fp), tp / (tp + fn))',
          '0.9 0.3',
          'Nine of ten flags were right (precision 0.9), but only nine of thirty positives were found (recall 0.3).',
        ),
      ],
    },
    {
      title: 'See through accuracy with rare classes; combine with F1',
      explanation: [
        'Accuracy is (TP + TN) divided by all rows. When positives are rare, a model that always predicts negative scores high accuracy while finding none of them, so its recall is 0.',
        'The F1 score, $\\frac{2 \\times \\text{precision} \\times \\text{recall}}{\\text{precision} + \\text{recall}}$, is the harmonic mean of the two. It is high only when both are high, so it exposes a model that buys one at the expense of the other.',
      ],
      example: {
        code: 'tp, fp, fn, tn = 0, 0, 10, 990\naccuracy = (tp + tn) / (tp + fp + fn + tn)\nrecall = tp / (tp + fn)\nprint(accuracy, recall)',
        output: '0.99 0.0',
        explanation:
          'Predicting negative for all 1,000 rows is right 99% of the time, yet it catches none of the 10 positives.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          'precision, recall = 0.5, 1.0\nf1 = 2 * precision * recall / (precision + recall)\nprint(round(f1, 3))',
          '0.667',
          'The harmonic mean is $2 \\times 0.5 \\times 1.0 / 1.5 \\approx 0.667$, below the ordinary average 0.75.',
        ),
        typeOutput(
          'What does this program print?',
          'from sklearn.metrics import accuracy_score, f1_score\nactual = [0, 0, 0, 0, 0, 0, 0, 0, 1, 1]\npredicted = [0, 0, 0, 0, 0, 0, 0, 0, 0, 1]\nprint(accuracy_score(actual, predicted), round(float(f1_score(actual, predicted)), 3))',
          '0.9 0.667',
          'Nine of ten rows are correct. Precision is 1.0 and recall 0.5, so $\\text{F1} = 2 \\times 0.5 / 1.5 \\approx 0.667$.',
        ),
        choose(
          'Only 1% of rows are positive. Why can a 99% accuracy be meaningless?',
          [
            'Accuracy cannot be computed on rare classes',
            'Accuracy is always lower than recall',
            'Always predicting negative also scores 99%',
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
          'A’s F1 is $2 \\times 0.09 / 1.0 = 0.18$; B’s is 0.5. The harmonic mean punishes A’s very low recall.',
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
        typeOutput(
          'What does this program print?',
          'probs = [0.9, 0.6, 0.45, 0.35, 0.2]\nactual = [1, 0, 1, 1, 0]\npred = [int(p >= 0.3) for p in probs]\ntp = sum([1 for i in range(5) if pred[i] == 1 and actual[i] == 1])\nfp = sum([1 for i in range(5) if pred[i] == 1 and actual[i] == 0])\nfn = sum([1 for i in range(5) if pred[i] == 0 and actual[i] == 1])\nprint(tp / (tp + fp), tp / (tp + fn))',
          '0.75 1.0',
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
            'Set it so about 50 rows a day are flagged',
            'Lower it to catch every fraud regardless of volume',
            'Pick it from the test set until recall reaches 1.0',
          ],
          1,
          'The review capacity fixes how many flags are useful; the threshold is chosen to produce that volume.',
        ),
        choose(
          'Lowering the threshold raised recall from 0.6 to 0.9 and dropped precision from 0.8 to 0.3. When is that a good trade?',
          [
            'When misses cost far more than false alarms',
            'When false alarms are very expensive',
            'When reviewers have no time for extra alerts',
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
          ['Five times', 'Four times', 'Once', 'Never'],
          2,
          'The folds partition the rows, and each fold is the validation fold in exactly one round.',
        ),
        choose(
          'Why is a fresh model fitted in every round instead of reusing one model?',
          [
            'Reusing a model would make the folds overlap',
            'A reused model would be scored on rows it trained on',
            'scikit-learn models can be fitted only once',
            'Each round needs a model with different hyperparameters',
          ],
          1,
          'Each round’s score is honest only if that round’s model never trained on its validation rows.',
        ),
        typeOutput(
          'What does this program print?',
          'from sklearn.model_selection import KFold\nX = [[0], [1], [2], [3], [4], [5], [6], [7], [8], [9]]\nsizes = []\nfor train_idx, val_idx in KFold(n_splits=5).split(X):\n    sizes.append(len(train_idx))\nprint(sizes)',
          '[8, 8, 8, 8, 8]',
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
        typeOutput(
          'What does this program print?',
          'import numpy as np\nscores = np.array([-4.0, -9.0, -2.0])\nprint(float(-scores.mean()))',
          '5.0',
          'The scores are negated MSEs, so the mean MSE is $-(-15 / 3) = 5.0$.',
        ),
        typeOutput(
          'DummyRegressor predicts the training mean. What does this program print?',
          'from sklearn.dummy import DummyRegressor\nfrom sklearn.linear_model import LinearRegression\nfrom sklearn.model_selection import cross_val_score\nX = [[0], [1], [2], [3], [4], [5]]\ny = [1.0, 2.9, 5.2, 7.0, 8.8, 11.1]\nfor model in [DummyRegressor(), LinearRegression()]:\n    scores = cross_val_score(model, X, y, cv=3, scoring="neg_mean_squared_error")\n    print(round(float(-scores.mean()), 3))',
          '25.023\n0.043',
          'Both models face the same folds and metric; the mean baseline’s error is far larger than the line’s.',
        ),
        choose(
          'cross_val_score with neg_mean_squared_error returns [-3.1, -2.8, -9.7]. What does this tell you?',
          [
            'The mean MSE is about 5.2, with one much harder fold',
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
            'It keeps scores comparable across folds of different sizes',
            'Its scorers treat larger values as better',
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
        typeOutput(
          'What does this program print?',
          'from sklearn.model_selection import StratifiedKFold\ny = [0, 0, 0, 0, 1, 1]\nX = [[0], [1], [2], [3], [4], [5]]\nfor train_idx, val_idx in StratifiedKFold(n_splits=2).split(X, y):\n    print([y[i] for i in val_idx])',
          '[0, 0, 1]\n[0, 0, 1]',
          'Two thirds of the labels are 0, and stratification keeps that share in both validation folds.',
        ),
        typeOutput(
          'What does this program print?',
          'from sklearn.model_selection import GroupKFold\nX = [[0], [1], [2], [3], [4], [5]]\ngroups = ["a", "a", "b", "b", "b", "c"]\nfor train_idx, val_idx in GroupKFold(n_splits=3).split(X, groups=groups):\n    print([groups[i] for i in val_idx])',
          "['b', 'b', 'b']\n['a', 'a']\n['c']",
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
            'GroupKFold by patient ID',
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
        typeOutput(
          'What does this program print?',
          'from sklearn.model_selection import cross_validate\nfrom sklearn.pipeline import make_pipeline\nfrom sklearn.preprocessing import StandardScaler\nfrom sklearn.linear_model import LinearRegression\nX = [[1.0], [2.0], [3.0], [10.0], [11.0], [12.0]]\ny = [1.0, 2.0, 3.0, 4.0, 5.0, 6.0]\npipe = make_pipeline(StandardScaler(), LinearRegression())\nresult = cross_validate(pipe, X, y, cv=3, return_estimator=True)\nfor fitted in result["estimator"]:\n    print(fitted.named_steps["standardscaler"].mean_.tolist())',
          '[9.0]\n[6.5]\n[4.0]',
          'Each round’s scaler sees only that round’s four training rows; the first round leaves out 1 and 2, so its mean is $36 / 4 = 9$.',
        ),
        choose(
          'You standardize all 1,000 rows, then run 5-fold cross-validation on the scaled table. What is wrong?',
          [
            'Validation rows helped set the scaling statistics',
            'Standardized data cannot be cross-validated',
            'Scaling should be applied after cross-validation ends',
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
            'It stays outside and is scored once at the end',
          ],
          3,
          'Cross-validation is used to make choices, so the test set must remain untouched until those choices are final.',
        ),
        typeOutput(
          'What does this program print?',
          'from sklearn.model_selection import cross_validate\nfrom sklearn.pipeline import make_pipeline\nfrom sklearn.preprocessing import StandardScaler\nfrom sklearn.linear_model import LinearRegression\nX = [[0.0], [2.0], [4.0], [6.0], [8.0]]\ny = [1.0, 2.0, 3.0, 4.0, 5.0]\nresult = cross_validate(make_pipeline(StandardScaler(), LinearRegression()), X, y, cv=5, scoring="neg_mean_squared_error", return_estimator=True)\nprint(len(result["estimator"]))',
          '5',
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
        typeOutput(
          'What does this program print?',
          'from sklearn.linear_model import Ridge\nmodel = Ridge(alpha=2.0).fit([[-1.0], [0.0], [1.0]], [-2.0, 0.0, 2.0])\nprint(model.alpha)\nprint(round(float(model.coef_[0]), 3))',
          '2.0\n1.0',
          'alpha stays exactly as supplied; the coefficient is learned, and the penalty shrinks it from 2 to 1.',
        ),
        choose(
          'Where should a value for max_depth come from?',
          [
            'Validation scores of several candidate depths',
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
        'GridSearchCV(model, grid, cv=k) tries every combination of the listed hyperparameter values, scores each with k-fold cross-validation, and records the results in cv_results_. A grid of 3 depths and 2 leaf sizes has $3 \\times 2 = 6$ combinations, so it fits $6 \\times k$ models.',
        'best_params_ is the combination with the highest mean validation score, and best_score_ is that mean. For classifiers, the default score is the fraction of correct predictions; for regression you can pass scoring="neg_mean_squared_error".',
      ],
      example: {
        code: 'from sklearn.model_selection import GridSearchCV\nfrom sklearn.tree import DecisionTreeClassifier\nX = [[1], [2], [3], [4], [5], [6], [7], [8]]\ny = [0, 0, 1, 0, 1, 1, 1, 1]\ngrid = {"max_depth": [1, 2, 3], "min_samples_leaf": [1, 2]}\nsearch = GridSearchCV(DecisionTreeClassifier(random_state=0), grid, cv=2)\nsearch.fit(X, y)\nprint(len(search.cv_results_["params"]))\nprint(search.best_params_)',
        output: "6\n{'max_depth': 1, 'min_samples_leaf': 1}",
        explanation:
          'Six combinations were scored. Deeper trees did no better on the held-out folds, so the simplest tree wins.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          'grid = {"max_depth": [2, 4, 6, 8], "min_samples_leaf": [1, 5, 10]}\ncombos = len(grid["max_depth"]) * len(grid["min_samples_leaf"])\nfolds = 5\nprint(combos, combos * folds)',
          '12 60',
          'Four depths times three leaf sizes make 12 combinations, each fitted once per fold.',
        ),
        typeOutput(
          'What does this program print?',
          'from sklearn.model_selection import GridSearchCV\nfrom sklearn.linear_model import Ridge\nX = [[0.0], [1.0], [2.0], [3.0], [4.0], [5.0]]\ny = [0.2, 1.9, 4.1, 6.2, 7.8, 10.1]\nsearch = GridSearchCV(Ridge(), {"alpha": [0.01, 1.0, 100.0]}, cv=3, scoring="neg_mean_squared_error")\nsearch.fit(X, y)\nprint(search.best_params_)\nprint(round(float(-search.best_score_), 3))',
          "{'alpha': 0.01}\n0.04",
          'The data are almost exactly linear, so the weakest penalty validates best. best_score_ is a negated MSE, so negating it gives 0.04.',
        ),
        choose(
          'A grid has 5 alphas, 4 depths, and 3 leaf sizes, scored with 5-fold cross-validation. How many models are fitted before the final refit?',
          ['12', '60', '301', '300'],
          3,
          '$5 \\times 4 \\times 3 = 60$ combinations, each fitted once per fold: $60 \\times 5 = 300$.',
        ),
        choose(
          'What does search.best_score_ report after GridSearchCV?',
          [
            'The best combination’s mean validation score',
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
        typeOutput(
          'What does this program print?',
          'from sklearn.model_selection import RandomizedSearchCV\nfrom sklearn.tree import DecisionTreeClassifier\nX = [[1], [2], [3], [4], [5], [6], [7], [8]]\ny = [0, 0, 1, 0, 1, 1, 1, 1]\nspace = {"max_depth": [1, 2, 3, 4, 5], "min_samples_leaf": [1, 2, 3]}\nsearch = RandomizedSearchCV(DecisionTreeClassifier(random_state=0), space, n_iter=4, cv=2, random_state=0)\nsearch.fit(X, y)\nprint(len(search.cv_results_["params"]))',
          '4',
          'Randomized search evaluates only n_iter = 4 of the 15 possible combinations.',
        ),
        choose(
          'You tried 500 configurations. The best validation score is 0.91 and the median is 0.86. What should you expect on fresh data?',
          [
            'Exactly 0.91, because validation rows were never trained on',
            'Probably below 0.91, because the maximum is partly luck',
            'Above 0.91, because the model will keep improving',
            'Exactly 0.86, the median',
          ],
          1,
          'Selecting the maximum of many noisy scores favours lucky ones, so the winner’s score overstates its true performance.',
        ),
        choose(
          'When is randomized search usually preferable to a full grid?',
          [
            'When many hyperparameters must share a small budget',
            'When there is a single hyperparameter with two values',
            'When every combination must be tried',
            'When no validation data are available',
          ],
          0,
          'A grid grows multiplicatively with each hyperparameter; random sampling keeps the cost fixed.',
        ),
        typeOutput(
          'What does this program print?',
          'validation = [0.84, 0.86, 0.91, 0.85]\ntest = [0.83, 0.85, 0.84, 0.84]\nbest = 0\nfor i in range(len(validation)):\n    if validation[i] > validation[best]:\n        best = i\nprint(validation[best], test[best])',
          '0.91 0.84',
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
        typeOutput(
          'What does this program print?',
          'from sklearn.model_selection import GridSearchCV\nfrom sklearn.tree import DecisionTreeClassifier\nX_train = [[1], [2], [3], [4], [5], [6], [7], [8]]\ny_train = [0, 0, 0, 0, 1, 1, 1, 1]\nsearch = GridSearchCV(DecisionTreeClassifier(random_state=0), {"max_depth": [1, 2, 3]}, cv=2)\nsearch.fit(X_train, y_train)\nprint(int(search.best_estimator_.tree_.n_node_samples[0]))',
          '8',
          'The root node counts the rows the final tree was fitted on: all eight training rows, not one fold’s four.',
        ),
        choose(
          'What is nested cross-validation for?',
          [
            'Training on the test labels safely',
            'Estimating how well the whole tuning procedure works',
            'Picking better hyperparameters than a single search finds',
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
            'The test set is now guiding the tuning',
            'Nothing; the test set exists to guide tuning',
          ],
          2,
          'Once its score influences decisions, the test set is effectively validation data.',
        ),
        typeOutput(
          'What does this program print?',
          'outer_folds = 5\ncombinations = 4\ninner_folds = 3\ninner_fits = outer_folds * combinations * inner_folds\nprint(inner_fits, inner_fits + outer_folds)',
          '60 65',
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
        typeOutput(
          'What does this program print?',
          'def predict(row):\n    if row["temp"] <= 20:\n        return "jacket"\n    if row["rain"] <= 0:\n        return "t-shirt"\n    return "umbrella"\n\nprint(predict({"temp": 20, "rain": 3}))\nprint(predict({"temp": 25, "rain": 3}))',
          'jacket\numbrella',
          'temp 20 satisfies <= 20, so the first row stops at "jacket". The second row passes on and has rain above 0.',
        ),
        typeOutput(
          'What does this program print?',
          'from sklearn.tree import DecisionTreeClassifier\nX = [[1], [3], [4], [8], [9], [10]]\ny = [0, 0, 0, 1, 1, 1]\ntree = DecisionTreeClassifier(max_depth=1, random_state=0).fit(X, y)\nprint(tree.tree_.threshold[0])\nprint(tree.predict([[5], [7]]).tolist())',
          '6.0\n[0, 1]',
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
            'The mean target of its training rows',
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
        typeOutput(
          'What does this program print?',
          'def gini(labels):\n    counts = {}\n    for label in labels:\n        counts[label] = counts.get(label, 0) + 1\n    total = len(labels)\n    return 1 - sum([(c / total) ** 2 for c in counts.values()])\n\nprint(round(gini(["x", "y", "z"]), 3))',
          '0.667',
          'Each class has proportion $1/3$, so the impurity is $1 - 3 \\times (1/9) \\approx 0.667$. With three classes it can exceed 0.5.',
        ),
        typeOutput(
          'What does this program print?',
          'def gini(labels):\n    counts = {}\n    for label in labels:\n        counts[label] = counts.get(label, 0) + 1\n    total = len(labels)\n    return 1 - sum([(c / total) ** 2 for c in counts.values()])\n\nprint(round(gini([1, 1, 1, 1, 0]), 3))',
          '0.32',
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
          'At 2.5 the left child [0, 0] is pure and the right child [1, 0, 1, 1] scores 0.375, weighted by $4/6$. At 3.5 both children are mixed, so 2.5 is the better split.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          'def gini(labels):\n    counts = {}\n    for label in labels:\n        counts[label] = counts.get(label, 0) + 1\n    return 1 - sum([(c / len(labels)) ** 2 for c in counts.values()])\n\nx = [1, 2, 3, 4]\ny = [0, 0, 1, 1]\nfor t in [1.5, 2.5]:\n    left = [y[i] for i in range(4) if x[i] <= t]\n    right = [y[i] for i in range(4) if x[i] > t]\n    print(t, round(len(left) / 4 * gini(left) + len(right) / 4 * gini(right), 3))',
          '1.5 0.333\n2.5 0.0',
          'At 1.5 the right child [0, 1, 1] scores 0.444, weighted by $3/4$. At 2.5 both children are pure.',
        ),
        choose(
          'Why is each child’s impurity weighted by its share of the rows?',
          [
            'So a tiny pure child cannot dominate the score',
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
            'By half, because the right child is empty',
            'All the way to zero',
            'Not at all; the child equals the parent',
            'It depends on the threshold value',
          ],
          2,
          'The left child holds exactly the parent’s rows, so the weighted impurity is unchanged.',
        ),
        typeOutput(
          'What does this program print?',
          'from sklearn.tree import DecisionTreeClassifier\nX = [[1], [2], [3], [7], [8], [9]]\nX_km = [[1000], [2000], [3000], [7000], [8000], [9000]]\ny = [0, 0, 0, 1, 1, 1]\na = DecisionTreeClassifier(random_state=0).fit(X, y)\nb = DecisionTreeClassifier(random_state=0).fit(X_km, y)\nprint(a.tree_.threshold[0], b.tree_.threshold[0])',
          '5.0 5000.0',
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
        typeOutput(
          'What does this program print?',
          'from sklearn.tree import DecisionTreeClassifier\nX = [[1], [2], [3], [4], [5], [6], [7], [8]]\ny = [0, 0, 1, 0, 1, 1, 0, 1]\nfor leaf in [1, 3]:\n    tree = DecisionTreeClassifier(min_samples_leaf=leaf, random_state=0).fit(X, y)\n    print(leaf, tree.get_n_leaves(), tree.score(X, y))',
          '1 6 1.0\n3 2 0.75',
          'Requiring at least three rows per leaf forbids the tiny leaves that isolate single rows, so the tree stays small and no longer fits every row.',
        ),
        choose(
          'An unlimited-depth tree scores 100% on training rows and 70% on validation rows. What should you try?',
          [
            'Remove max_depth entirely',
            'Standardize the features, then refit the tree',
            'Limit max_depth or raise min_samples_leaf',
            'Score the tree on the training rows only',
          ],
          2,
          'The gap shows overfitting; growth limits stop the tree from memorizing training noise.',
        ),
        choose(
          'Why is standardizing usually unnecessary for a decision tree?',
          [
            'Positive rescaling keeps each feature’s order',
            'Trees standardize each feature automatically during fit',
            'Scaling would change the labels',
            'Trees use only one feature',
          ],
          0,
          'A threshold test depends only on order, which multiplying by a positive constant does not change.',
        ),
        typeOutput(
          'What does this program print?',
          'from sklearn.tree import DecisionTreeClassifier\nX = [[1], [2], [3], [7], [8], [9]]\nX_km = [[1000], [2000], [3000], [7000], [8000], [9000]]\ny = [0, 0, 0, 1, 1, 1]\na = DecisionTreeClassifier(random_state=0).fit(X, y)\nb = DecisionTreeClassifier(random_state=0).fit(X_km, y)\nprint(a.predict([[4]]).tolist(), b.predict([[4000]]).tolist())',
          '[0] [0]',
          'The same row in either unit lands on the same side of its tree’s threshold, so both predictions agree.',
        ),
      ],
    },
  ],
  'ml-svm': [
    {
      title: 'Classify by the sign of a linear decision score',
      explanation: [
        'A linear support vector classifier computes a score $w \\cdot x + b$ and predicts the positive class when the score is positive. The boundary is where the score is 0. The margin is the band where the score lies between -1 and 1; training seeks the widest margin that keeps the classes apart.',
        'SVC(kernel="linear") learns w and b. decision_function(X) returns the scores, and predict(X) returns their sign as a class.',
      ],
      example: {
        code: 'from sklearn.svm import SVC\nX = [[0.0], [1.0], [3.0], [4.0]]\ny = [0, 0, 1, 1]\nmodel = SVC(kernel="linear", C=1.0).fit(X, y)\nprint(model.decision_function([[0.0], [2.5], [5.0]]).round(3).tolist())\nprint(model.predict([[1.8], [2.2]]).tolist())',
        output: '[-2.0, 0.5, 3.0]\n[0, 1]',
        explanation:
          'The learned score is x - 2: the boundary sits at 2, midway between the closest points 1 and 3, which lie exactly on the margin at -1 and +1.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          'import numpy as np\nw = np.array([1.0, 2.0])\nb = -4.0\npoints = np.array([[1.0, 1.0], [2.0, 2.0], [0.0, 3.0]])\nscores = points @ w + b\nprint(scores.tolist())\nprint([int(s > 0) for s in scores])',
          '[-1.0, 2.0, 2.0]\n[0, 1, 1]',
          'Each score is $x_1 + 2x_2 - 4$, so the first point falls on the negative side and the other two on the positive side.',
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
        typeOutput(
          'What does this program print?',
          'from sklearn.svm import SVC\nX = [[0.0], [1.0], [3.0], [4.0]]\ny = [0, 0, 1, 1]\nmodel = SVC(kernel="linear", C=1.0).fit(X, y)\nprint(model.predict([[1.5], [2.9], [10.0]]).tolist())',
          '[0, 1, 1]',
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
        typeOutput(
          'The second model is fitted on the two support vectors only. What does this program print?',
          'from sklearn.svm import SVC\nfull = SVC(kernel="linear", C=10.0).fit([[0.0], [1.0], [3.0], [4.0], [10.0]], [0, 0, 1, 1, 1])\nsmall = SVC(kernel="linear", C=10.0).fit([[1.0], [3.0]], [0, 1])\nprint(full.decision_function([[2.5]]).round(3).tolist(), small.decision_function([[2.5]]).round(3).tolist())',
          '[0.5] [0.5]',
          'The non-support points did not influence the fit, so both models learn the same boundary and score.',
        ),
        choose(
          'Which training points are support vectors?',
          [
            'The points farthest from the boundary',
            'Every point of the minority class',
            'The points on or inside the margin',
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
        typeOutput(
          'What does this program print?',
          'from sklearn.svm import SVC\nX = [[0.0], [1.0], [3.0], [4.0]]\ny = [0, 0, 1, 1]\nmodel = SVC(kernel="linear", C=1.0).fit(X, y)\nprint(model.support_.tolist(), model.n_support_.tolist())',
          '[1, 2] [1, 1]',
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
            'Penalizes margin violations more heavily',
            'Removes every support vector',
            'Converts the scores into calibrated probabilities',
          ],
          1,
          'C multiplies the violation cost, so a larger C means weaker regularization.',
        ),
        typeOutput(
          'The class depends only on the first feature. What does this program print?',
          'from sklearn.svm import SVC\nfrom sklearn.pipeline import make_pipeline\nfrom sklearn.preprocessing import StandardScaler\nX = [[0, 1000], [0, 3000], [0, 5000], [1, 2000], [1, 4000], [1, 6000]]\ny = [0, 0, 0, 1, 1, 1]\ntest = [[0, 5900], [1, 1100]]\nraw = SVC(kernel="rbf").fit(X, y)\nscaled = make_pipeline(StandardScaler(), SVC(kernel="rbf")).fit(X, y)\nprint(raw.predict(test).tolist(), scaled.predict(test).tolist())',
          '[1, 0] [0, 1]',
          'Unscaled, the thousands in the second column dominate every distance, so the model matches on the irrelevant feature. After scaling, the first feature counts again.',
        ),
        choose(
          'Validation accuracy is poor with C = 1000 although training accuracy is perfect. Which change is most sensible to try?',
          [
            'A smaller C',
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
            'Large-unit features would dominate the distances',
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
        'Some classes cannot be separated by a straight boundary, such as a class in the middle of a line with the other class on both sides. kernel="rbf" compares points by similarity $\\exp(-\\text{gamma} \\times \\text{distance}^2)$, which is 1 for identical points and fades with distance, allowing curved boundaries.',
        'gamma sets how quickly similarity fades. A large gamma makes each training point influence only its immediate neighbourhood, so the boundary can wrap around single points and overfit. Tune gamma together with C on validation data.',
      ],
      example: {
        code: 'from sklearn.svm import SVC\nX = [[-3.0], [-2.0], [-1.0], [0.0], [1.0], [2.0], [3.0]]\ny = [0, 0, 1, 1, 1, 0, 0]\nlinear = SVC(kernel="linear").fit(X, y)\nrbf = SVC(kernel="rbf", gamma=1.0).fit(X, y)\nprint(round(linear.score(X, y), 3), rbf.score(X, y))\nprint(rbf.predict([[-2.5], [0.5], [2.5]]).tolist())',
        output: '0.571 1.0\n[0, 1, 0]',
        explanation:
          'No single threshold puts the middle class on one side, so the linear model fails. The RBF model encloses the middle interval.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          'import math\ngamma = 0.5\nprint([round(math.exp(-gamma * d ** 2), 3) for d in [0, 1, 2]])',
          '[1.0, 0.607, 0.135]',
          'At distance 0 the similarity is $\\exp(0) = 1$, and it decays as $\\exp(-0.5 d^2)$ with distance.',
        ),
        typeOutput(
          'What does this program print?',
          'import math\ndistance = 2\nfor gamma in [0.1, 2.0]:\n    print(gamma, round(math.exp(-gamma * distance ** 2), 4))',
          '0.1 0.6703\n2.0 0.0003',
          'With a small gamma, a point two units away is still fairly similar; with a large gamma, it barely counts.',
        ),
        choose(
          'An RBF SVM with a very large gamma scores 100% on training rows and poorly on validation rows. What is happening?',
          [
            'The boundary wraps around individual training rows',
            'The boundary has become a straight line',
            'gamma is too small to fit the data',
            'The kernel now treats distant points as very similar',
          ],
          0,
          'Very local influence lets the model memorize single points, which is overfitting.',
        ),
        choose(
          'When is an RBF kernel a better choice than a linear one?',
          [
            'When the classes are already separable by a straight boundary',
            'When validation shows the classes need a curved boundary',
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
        typeOutput(
          'Each row of the array holds one model’s predictions. What does this program print?',
          'import numpy as np\npredictions = np.array([[10.0, 20.0, 30.0], [14.0, 18.0, 33.0], [12.0, 22.0, 27.0]])\nprint(predictions.mean(axis=0).tolist())',
          '[12.0, 20.0, 30.0]',
          'axis=0 averages down each column, giving one combined prediction per observation.',
        ),
        typeOutput(
          'The true labels are [1, 1, 0]. What does this program print?',
          'predictions = [[0, 1, 0], [0, 1, 0], [1, 1, 0]]\ncombined = []\nfor j in range(3):\n    ones = sum([model[j] for model in predictions])\n    if ones >= 2:\n        combined.append(1)\n    else:\n        combined.append(0)\nprint(combined)',
          '[0, 1, 0]',
          'Two models make the same mistake on the first row, so the vote repeats it.',
        ),
        choose(
          'When does averaging several models help the most?',
          [
            'When they err on different rows',
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
        typeOutput(
          'What does this program print?',
          'rows = [0, 1, 2, 3, 4, 5]\nsample = [2, 0, 2, 5, 3, 0]\nout_of_bag = [r for r in rows if r not in sample]\nprint(len(sample), out_of_bag)',
          '6 [1, 4]',
          'The sample still has six draws, but rows 0 and 2 repeat, so rows 1 and 4 never appear.',
        ),
        choose(
          'What does sampling "with replacement" mean for a bootstrap sample?',
          [
            'Each row appears exactly once',
            'The sample is the test set',
            'A row can be drawn more than once',
            'Rows are replaced by their averages',
          ],
          2,
          'Each draw picks from all rows again, so repeats and omissions both happen.',
        ),
        choose(
          'Why does bagging especially help deep decision trees?',
          [
            'It averages away deep trees’ high variance',
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
            'Rows left out of each model’s sample',
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
        typeOutput(
          'What does this program print?',
          'from sklearn.ensemble import RandomForestClassifier\nX = [[1, 5], [2, 4], [3, 6], [6, 1], [7, 2], [8, 1]]\ny = [0, 0, 0, 1, 1, 1]\nforest = RandomForestClassifier(n_estimators=25, random_state=0).fit(X, y)\nprint(len(forest.estimators_))\nprint(forest.predict([[2, 5], [7, 1]]).tolist())',
          '25\n[0, 1]',
          'n_estimators=25 fits 25 trees, and points deep inside each group get that group’s class.',
        ),
        choose(
          'What does max_features control in a random forest?',
          [
            'How many features each split may use',
            'How many trees are grown',
            'How deep each tree may be',
            'How many rows each bootstrap sample has',
          ],
          0,
          'Limiting the candidate features at each split forces trees to differ, which decorrelates their errors.',
        ),
        typeOutput(
          'Five trees vote on one row. What does this program print?',
          'tree_probabilities = [1.0, 0.0, 1.0, 1.0, 0.5]\nprint(sum(tree_probabilities) / len(tree_probabilities))',
          '0.7',
          'The forest averages the trees’ class-1 probabilities: $3.5 / 5 = 0.7$.',
        ),
        choose(
          'Two runs of the same forest code give slightly different predictions. What fixes this?',
          [
            'Adding more features',
            'Using max_features=1',
            'Fixing random_state',
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
          'The constant 21.5 leaves the residuals shown. A one-split tree predicts their group means, $\\pm 10.5$, and half of that correction moves each prediction toward its target.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          'from sklearn.ensemble import GradientBoostingRegressor\nX = [[1], [2], [3], [4]]\ny = [1.0, 1.0, 5.0, 5.0]\nfor n in [1, 2]:\n    model = GradientBoostingRegressor(n_estimators=n, learning_rate=0.5, max_depth=1, random_state=0).fit(X, y)\n    print(model.predict(X).round(3).tolist())',
          '[2.0, 2.0, 4.0, 4.0]\n[1.5, 1.5, 4.5, 4.5]',
          'Starting from 3, each round fits the residuals and adds half of them: the residuals go from $\\pm 2$ to $\\pm 1$ to $\\pm 0.5$.',
        ),
        choose(
          'How does boosting differ from bagging?',
          [
            'Boosting fits each model to the errors left so far',
            'Boosting fits independent models on bootstrap samples',
            'Boosting cannot use decision trees',
            'Boosting averages identical models',
          ],
          0,
          'Each boosted model depends on the ensemble so far; bagged models are fitted independently.',
        ),
        typeOutput(
          'What does this program print?',
          'from sklearn.ensemble import GradientBoostingRegressor\nimport numpy as np\nX = np.arange(10).reshape(-1, 1)\ny = np.array([3.0, 1.0, 4.0, 1.0, 5.0, 9.0, 2.0, 6.0, 5.0, 3.0])\nfor n in [1, 10, 200]:\n    m = GradientBoostingRegressor(n_estimators=n, learning_rate=0.3, max_depth=2, random_state=0).fit(X, y)\n    print(n, round(float(((m.predict(X) - y) ** 2).mean()), 3))',
          '1 3.846\n10 0.504\n200 0.0',
          'Every round removes more of the training residuals; with 200 rounds the model fits these ten noisy targets exactly, a sign of overfitting.',
        ),
        choose(
          'Training error keeps falling as boosting rounds increase, but validation error rises after round 150. What should you do?',
          [
            'Keep all rounds, because training error is lower',
            'Use about 150 rounds, chosen on validation data',
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
        'PCA first centers each feature by subtracting its mean. Projecting a centered row onto a unit-length direction $d$ is the dot product $\\text{row} \\cdot d$; for a whole matrix, X @ d gives one projected value per row.',
        'The first principal component is the direction along which those projected values have the largest variance. Each later component has the largest remaining variance while staying orthogonal to the earlier ones, which means its dot product with each of them is 0.',
      ],
      example: {
        code: 'import numpy as np\nX = np.array([[1.0, 1.0], [2.0, 2.0], [3.0, 3.0]])\ncentered = X - X.mean(axis=0)\ndirection = np.array([1.0, 1.0]) / np.sqrt(2)\nprint(centered.tolist())\nprint((centered @ direction).round(3).tolist())',
        output: '[[-1.0, -1.0], [0.0, 0.0], [1.0, 1.0]]\n[-1.414, 0.0, 1.414]',
        explanation:
          'The points lie on the diagonal, so projecting onto the unit diagonal direction keeps all of their spread in a single number per row.',
      },
      questions: [
        typeOutput(
          'The rows are already centered. What does this program print?',
          'import numpy as np\nX = np.array([[3.0, 1.0], [-3.0, -1.0], [1.0, -1.0], [-1.0, 1.0]])\nfor d in [np.array([1.0, 0.0]), np.array([0.0, 1.0])]:\n    print(float((X @ d).var()))',
          '5.0\n1.0',
          'Projecting onto [1, 0] keeps the first column, whose variance is (9 + 9 + 1 + 1) / 4 = 5; the second column’s variance is 1.',
        ),
        choose(
          'What does the first principal component maximize?',
          [
            'The correlation with the target',
            'The number of rows kept',
            'The variance of the projected data',
            'The distance between class means',
          ],
          2,
          'PCA ignores any target; the first component is the direction of greatest spread in the features.',
        ),
        typeOutput(
          'What does this program print?',
          'import numpy as np\na = np.array([3.0, 4.0])\nb = np.array([-4.0, 3.0])\nprint(float(a @ b), float(np.linalg.norm(a)))',
          '0.0 5.0',
          '$3 \\times (-4) + 4 \\times 3 = 0$, so the vectors are orthogonal. np.linalg.norm gives the length, $\\sqrt{9 + 16} = 5$; dividing by it would make a unit direction.',
        ),
        choose(
          'Why does PCA center the features before looking for directions?',
          [
            'Centering removes the target from the data',
            'So directions describe spread around the mean',
            'Centering makes every feature an integer',
            'Centering gives every feature the same variance',
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
        typeOutput(
          'What does this program print?',
          'from sklearn.decomposition import PCA\nX = [[1.0, 2.0], [2.0, 4.0], [3.0, 6.0], [4.0, 8.0]]\npca = PCA().fit(X)\nprint(pca.explained_variance_ratio_.round(3).tolist())',
          '[1.0, 0.0]',
          'Every point lies on the line $y = 2x$, so one direction carries all of the variance.',
        ),
        typeOutput(
          'What does this program print?',
          'import numpy as np\nfrom sklearn.decomposition import PCA\nX = np.array([[1.0, 2.0, 0.0], [2.0, 1.0, 1.0], [3.0, 5.0, 0.0], [4.0, 3.0, 2.0], [5.0, 4.0, 1.0]])\npca = PCA(n_components=2).fit(X)\nprint(pca.transform(X).shape, pca.components_.shape)',
          '(5, 2) (2, 3)',
          'transform keeps one row per example with one column per component; components_ holds one row per component with one entry per feature.',
        ),
        choose(
          'explained_variance_ratio_ is [0.7, 0.2, 0.1]. What does 0.2 mean?',
          [
            'The second component holds 20% of the feature variance',
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
        typeOutput(
          'What does this program print?',
          'import numpy as np\nratios = np.array([0.4, 0.3, 0.2, 0.1])\ncumulative = np.cumsum(ratios)\nprint(cumulative.round(2).tolist())\nprint(int((cumulative < 0.8).sum()) + 1)',
          '[0.4, 0.7, 0.9, 1.0]\n3',
          'Only 0.4 and 0.7 fall short of 0.8, so three components are needed.',
        ),
        typeOutput(
          'Columns 1 and 2 are near copies, and so are columns 3 and 4. What does this program print?',
          'import numpy as np\nfrom sklearn.decomposition import PCA\nrng = np.random.default_rng(0)\nbase = rng.normal(size=(40, 1))\nother = rng.normal(size=(40, 1))\nX = np.hstack([base, base + rng.normal(scale=0.1, size=(40, 1)), other, other + rng.normal(scale=0.1, size=(40, 1))])\nprint(PCA(n_components=0.95).fit(X).n_components_)',
          '2',
          'The four columns carry about two independent signals, so two components already hold over 95% of the variance.',
        ),
        choose(
          'What do you give up by keeping fewer components?',
          [
            'Variance that may carry useful signal',
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
            'Nothing until it is checked on validation data',
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
        typeOutput(
          'The two features are uncorrelated. What does this program print?',
          'from sklearn.decomposition import PCA\nfrom sklearn.preprocessing import StandardScaler\nX = [[0.0, 0.0], [10.0, 1.0], [0.0, 1.0], [10.0, 0.0]]\nraw = PCA().fit(X).explained_variance_ratio_[0]\nscaled = PCA().fit(StandardScaler().fit_transform(X)).explained_variance_ratio_[0]\nprint(round(float(raw), 2), round(float(scaled), 2))',
          '0.99 0.5',
          'Raw, the first column’s variance (25) dwarfs the second’s (0.25). Scaled, both have variance 1 and share the total equally.',
        ),
        choose(
          'A dataset has age in years and income in dollars. Without scaling, what will the first principal component mostly reflect?',
          [
            'Age, because it is listed first',
            'Income, because its variance is far larger',
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
            'Nothing; the model itself never trains on test rows',
            'The test rows shaped the learned directions',
          ],
          3,
          'PCA learns statistics like any preprocessing step, so it must be fitted on training rows only.',
        ),
        choose(
          'The last component holds only 1% of the variance. Can it still matter for prediction?',
          [
            'Yes; a small direction can still carry the signal',
            'No; low variance always means noise',
            'No; PCA has removed the target from it',
            'No; the first components already hold all target signal',
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
        typeOutput(
          'What does this program print?',
          'import numpy as np\npoints = np.array([1.0, 4.0, 6.0, 9.0])\ncenters = np.array([2.0, 8.0])\nlabels = [int(np.abs(centers - p).argmin()) for p in points]\nprint(labels)',
          '[0, 0, 1, 1]',
          '4 is 2 from the first centroid and 4 from the second; 6 is closer to 8.',
        ),
        choose(
          'Why may k-means compare squared distances instead of distances?',
          [
            'Squaring keeps the order of the distances',
            'Squared distances are always smaller',
            'Distances cannot be computed in more than one dimension',
            'Squaring makes the clusters equal in size',
          ],
          0,
          'For non-negative numbers, a smaller distance always has a smaller square.',
        ),
        typeOutput(
          'What does this program print?',
          'import numpy as np\npoint = np.array([3.0, 3.0])\ncenters = np.array([[0.0, 0.0], [4.0, 0.0], [3.0, 5.0]])\nd = ((centers - point) ** 2).sum(axis=1)\nprint(d.tolist(), int(d.argmin()))',
          '[18.0, 10.0, 4.0] 2',
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
        typeOutput(
          'This runs one assignment step and one update step. What does it print?',
          'import numpy as np\npoints = np.array([1.0, 1.5, 3.0, 10.0, 11.0])\ncenters = np.array([1.0, 3.0])\nlabels = np.array([int(np.abs(centers - p).argmin()) for p in points])\ncenters = np.array([points[labels == k].mean() for k in [0, 1]])\nprint(labels.tolist(), centers.tolist())',
          '[0, 0, 1, 1, 1] [1.25, 8.0]',
          '1 and 1.5 are nearer to 1; the rest are nearer to 3. The new centroids are the means of each group.',
        ),
        typeOutput(
          'What does this program print?',
          'import numpy as np\npoints = np.array([1.0, 3.0, 10.0, 12.0])\nlabels = np.array([0, 0, 1, 1])\ncenters = np.array([2.0, 11.0])\nprint(float(((points - centers[labels]) ** 2).sum()))',
          '4.0',
          'centers[labels] gives each point its own centroid; every point is 1 away, so the inertia is $4 \\times 1 = 4.0$.',
        ),
        choose(
          'When does k-means stop iterating?',
          [
            'When every cluster has the same size',
            'When the assignments stop changing',
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
            'It rises when a centroid moves far',
            'It falls or stays the same',
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
        typeOutput(
          'What does this program print?',
          'import numpy as np\npoints = np.array([0.0, 2.0, 9.0, 11.0])\ncenters = np.array([0.0, 2.0])\nfor step in range(3):\n    labels = np.array([int(np.abs(centers - p).argmin()) for p in points])\n    centers = np.array([points[labels == k].mean() for k in [0, 1]])\nprint(centers.tolist())',
          '[1.0, 10.0]',
          'The first update gives centroids 0 and $22 / 3$. Then 2 is nearer to 0, so the groups become $\\{0, 2\\}$ and $\\{9, 11\\}$, with means 1 and 10; this start recovers.',
        ),
        choose(
          'Why does KMeans run several initializations (n_init)?',
          [
            'Different starts can reach different local solutions',
            'It keeps the run whose clusters are most equal in size',
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
            'Cluster numbers are arbitrary names',
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
        typeOutput(
          'The list holds inertia for $k = 1, 2, 3, 4$. What does this program print?',
          'inertias = [169.21, 4.0, 2.33, 1.12]\ndrops = [round(inertias[i] - inertias[i + 1], 2) for i in range(3)]\nprint(drops)',
          '[165.21, 1.67, 1.21]',
          'Going from 1 to 2 clusters removes almost all inertia; later clusters add little, so the elbow is at $k = 2$.',
        ),
        choose(
          'Why not choose k by picking the lowest inertia?',
          [
            'Inertia is undefined for k above 3',
            'Inertia keeps falling as k grows',
            'Inertia measures label accuracy, not cluster quality',
            'Inertia increases with k',
          ],
          1,
          'More centroids can only bring points closer to one, so inertia alone favours too many clusters.',
        ),
        typeOutput(
          'Features are age in years and income in dollars. What does this program print?',
          'import numpy as np\npoint = np.array([30.0, 52000.0])\ncenters = np.array([[31.0, 60000.0], [65.0, 52500.0]])\nd = np.sqrt(((centers - point) ** 2).sum(axis=1))\nprint(d.round(1).tolist())',
          '[8000.0, 501.2]',
          'Income differences in thousands swamp a 35-year age gap, so the 65-year-old centroid is "closer". Standardizing would fix this.',
        ),
        choose(
          'A clustering has a high silhouette score. What does that establish?',
          [
            'Points sit closer to their own cluster than to others',
            'The clusters match the true customer segments',
            'k is the number of real classes',
            'The clusters will be useful for the business decision',
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
        typeOutput(
          'What does this program print?',
          'import numpy as np\nreference = np.array([10.0, 12.0, 8.0, 10.0])\nmean, std = reference.mean(), reference.std()\nz = (np.array([13.0, 10.5]) - mean) / std\nprint(np.round(z, 2).tolist())\nprint((np.abs(z) >= 2).tolist())',
          '[2.12, 0.35]\n[True, False]',
          'The reference has mean 10 and standard deviation $\\sqrt{2} \\approx 1.41$, so 13 is 2.12 standard deviations above the mean.',
        ),
        typeOutput(
          'What does this program print?',
          'z = [0.3, -2.8, 1.1, 3.4, -0.9]\nprint([i for i in range(len(z)) if abs(z[i]) >= 2.5])',
          '[1, 3]',
          'abs() catches unusually low values as well as high ones, so positions 1 and 3 are flagged.',
        ),
        choose(
          'A reading has $z = -4$ relative to last month’s data. What does that tell you?',
          [
            'It is four standard deviations below the mean',
            'It is four units below the mean',
            'It has a 4% chance of being normal',
            'It is four times smaller than the reference mean',
          ],
          0,
          'A z-score counts standard deviations from the mean; it does not by itself explain the cause.',
        ),
        choose(
          'A transaction is flagged as highly unusual. What is the right next step?',
          [
            'Block the customer, since unusual means fraudulent',
            'Delete the row so it does not distort statistics',
            'Investigate it, since rare does not mean wrong',
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
        typeOutput(
          'These are scikit-learn detector predictions. What does this program print?',
          'predictions = [1, -1, 1, 1, -1]\nalerts = [i for i in range(len(predictions)) if predictions[i] == -1]\nprint(alerts)',
          '[1, 4]',
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
        typeOutput(
          'Here a higher score means more normal. What does this program print?',
          'normality = [0.9, 0.2, 0.7, 0.4]\nanomaly = [-s for s in normality]\nthreshold = -0.5\nprint([i for i in range(4) if anomaly[i] >= threshold])',
          '[1, 3]',
          'Negating turns "higher is more normal" into "higher is more unusual"; rows 1 and 3 have normality below 0.5.',
        ),
        choose(
          'A scikit-learn detector’s decision_function returns -3.2 for a row. What does that mean?',
          [
            'The row is 3.2 standard deviations from the mean',
            'The row is on the outlier side of the boundary',
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
        typeOutput(
          'Larger scores are more unusual. What does this program print?',
          'scores = [0.9, 0.2, 0.75, 0.1, 0.6, 0.85]\nincident = [1, 0, 0, 0, 1, 0]\nalerts = [int(s >= 0.7) for s in scores]\ntp = sum([1 for i in range(6) if alerts[i] == 1 and incident[i] == 1])\nprint(round(tp / sum(alerts), 3), round(tp / sum(incident), 3))',
          '0.333 0.5',
          'Three rows are alerted but only one is an incident (precision $1/3$); one of the two incidents was caught (recall $1/2$).',
        ),
        choose(
          'An investigations team can handle about 20 alerts a day out of 10,000 scored events. How should the threshold be set?',
          [
            'At the score only about 20 daily events exceed',
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
            'Fewer misses, more false alarms',
            'Higher precision and higher recall',
          ],
          2,
          'More rows pass a lower bar, catching more incidents along with more ordinary rows.',
        ),
        typeOutput(
          'What does this program print?',
          'import numpy as np\nscores = np.arange(1, 11)\ncutoff = np.quantile(scores, 0.9)\nprint(round(float(cutoff), 2), int((scores >= cutoff).sum()))',
          '9.1 1',
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
            'Novelty detection on a clean reference',
            'Supervised classification',
            'Clustering',
          ],
          1,
          'The reference is known to be clean, and only new readings are judged against it.',
        ),
        typeOutput(
          'What does this program print?',
          'import numpy as np\ndata = np.array([5.0, 6.0, 5.0, 7.0, 6.0, 5.0, 40.0])\nmedian = np.median(data)\nmad = np.median(np.abs(data - median))\nprint(median, mad, (40.0 - median) / mad)',
          '6.0 1.0 34.0',
          'The median is 6, and the median absolute deviation is 1; the extreme value does not affect either, so 40 sits 34 deviations away.',
        ),
        choose(
          'Why can an extreme value escape a z-score rule computed on the same data?',
          [
            'z-scores ignore large values',
            'It inflates the standard deviation',
            'Extreme values always have $z = 0$',
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
  'ml-neural-layers': [
    {
      title: 'Compute a dense layer as X @ W + b',
      explanation: [
        'A dense layer gives every output neuron one weight per input plus a bias. For a batch X shaped (batch, inputs), weights W shaped (inputs, outputs), and bias b shaped (outputs,), the layer computes Z = X @ W + b, shaped (batch, outputs). Broadcasting adds b to every row.',
        'The layer has $\\text{inputs} \\times \\text{outputs}$ weights plus outputs biases. Each column of $W$ holds one neuron’s weights, so column $j$ of $Z$ is that neuron’s weighted sum for every row.',
      ],
      example: {
        code: 'import numpy as np\nX = np.array([[1.0, 0.0, 2.0], [0.0, 1.0, 1.0]])\nW = np.array([[1.0, -1.0], [2.0, 0.0], [0.5, 1.0]])\nb = np.array([0.0, 1.0])\nZ = X @ W + b\nprint(Z.shape)\nprint(Z.tolist())',
        output: '(2, 2)\n[[2.0, 2.0], [2.5, 2.0]]',
        explanation:
          'Two rows with three inputs pass through two neurons. Row 1, neuron 1: $1 \\times 1 + 0 \\times 2 + 2 \\times 0.5 + 0 = 2$.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          'import numpy as np\nX = np.zeros((10, 3))\nW = np.zeros((3, 4))\nb = np.zeros(4)\nprint((X @ W + b).shape)',
          '(10, 4)',
          'The shared size 3 is summed over, leaving 10 rows and 4 neuron outputs.',
        ),
        typeOutput(
          'What does this program print?',
          'import numpy as np\nX = np.array([[2.0, 1.0]])\nW = np.array([[1.0, 0.0, -1.0], [3.0, 1.0, 2.0]])\nb = np.array([0.5, 0.0, 1.0])\nprint((X @ W + b).tolist())',
          '[[5.5, 1.0, 1.0]]',
          'Neuron 1: $2 \\times 1 + 1 \\times 3 + 0.5 = 5.5$. Neuron 3: $2 \\times (-1) + 1 \\times 2 + 1 = 1$.',
        ),
        choose(
          'A dense layer maps 100 input features to 64 neurons. How many parameters does it have?',
          ['164', '6,400', '6,464', '6,500'],
          2,
          '$100 \\times 64$ weights plus one bias per neuron: $6{,}400 + 64$.',
        ),
        choose(
          'A batch X has shape (32, 20) and the layer has 5 neurons. What shape must W have?',
          ['(32, 5)', '(5, 20)', '(20, 32)', '(20, 5)'],
          3,
          'W needs one row per input feature and one column per neuron so that X @ W is (32, 5).',
        ),
      ],
    },
    {
      title: 'Apply an activation function elementwise',
      explanation: [
        'After the weighted sum, a layer applies an activation to every entry. ReLU keeps positive values and replaces negatives with 0: np.maximum(0, Z). The sigmoid squeezes each value into the interval from 0 to 1.',
        'ReLU is the usual choice for hidden layers. A neuron whose pre-activation is negative outputs exactly 0 for that row.',
      ],
      example: {
        code: 'import numpy as np\nz = np.array([[-1.5, 0.0, 2.0]])\nprint(np.maximum(0, z).tolist())\nprint((1 / (1 + np.exp(-z))).round(3).tolist())',
        output: '[[0.0, 0.0, 2.0]]\n[[0.182, 0.5, 0.881]]',
        explanation:
          'ReLU zeroes the negative entry and keeps 2.0. The sigmoid maps the same three values into (0, 1), with 0 mapped to 0.5.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          'import numpy as np\nX = np.array([[1.0, 2.0], [-1.0, 0.0]])\nW = np.array([[2.0, -1.0], [1.0, 1.0]])\nb = np.array([0.0, -2.0])\nprint(np.maximum(0, X @ W + b).tolist())',
          '[[4.0, 0.0], [0.0, 0.0]]',
          'The pre-activations are [[4, -1], [-2, -1]]; ReLU replaces the three negatives with 0.',
        ),
        choose(
          'What does ReLU return for an input of -3?',
          ['-3', '3', '0', '0.5'],
          2,
          'ReLU is max(0, value), so any negative input becomes 0.',
        ),
        typeOutput(
          'What does this program print?',
          'import numpy as np\nz = np.array([-4.0, 4.0])\nprint(np.maximum(0, z).tolist(), (1 / (1 + np.exp(-z))).round(2).tolist())',
          '[0.0, 4.0] [0.02, 0.98]',
          'ReLU clips -4 to 0. The sigmoid approaches but never reaches 0 or 1.',
        ),
        choose(
          'A hidden ReLU neuron outputs 0 for a row. What do you know about its pre-activation for that row?',
          [
            'It was exactly 1',
            'It was 0 or negative',
            'It was positive',
            'Its weights are all zero',
          ],
          1,
          'ReLU outputs 0 exactly when its input is not positive.',
        ),
      ],
    },
    {
      title: 'Put nonlinear activations between stacked layers',
      explanation: [
        'Stacking linear layers without activations gains nothing: (X @ W1) @ W2 equals X @ (W1 @ W2), a single linear layer. Biases do not change this; the stack stays one affine map.',
        'A nonlinear activation such as ReLU between the layers breaks that collapse, which is what lets a deeper network represent curved, nonlinear relationships.',
      ],
      example: {
        code: 'import numpy as np\nX = np.array([[1.0, 2.0], [3.0, -1.0]])\nW1 = np.array([[1.0, -1.0], [0.5, 2.0]])\nW2 = np.array([[2.0], [1.0]])\nprint(((X @ W1) @ W2).tolist(), (X @ (W1 @ W2)).tolist())\nprint((np.maximum(0, X @ W1) @ W2).tolist())',
        output: '[[7.0], [0.0]] [[7.0], [0.0]]\n[[7.0], [5.0]]',
        explanation:
          'Without an activation, two layers give exactly the same output as their single combined matrix. With ReLU in between, the second row changes, so the stack is no longer one linear map.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          'import numpy as np\nW1 = np.array([[2.0, 0.0], [0.0, 3.0]])\nW2 = np.array([[1.0], [1.0]])\nprint((W1 @ W2).tolist())',
          '[[2.0], [3.0]]',
          'The two layers combine into a single (2, 1) weight matrix: scale the inputs by 2 and 3 and add them.',
        ),
        choose(
          'A network has ten dense layers with no activation functions. What can it represent?',
          [
            'Any nonlinear function, given enough layers',
            'Only what one linear layer can represent',
            'Nothing, because it cannot be trained',
            'Only binary outputs',
          ],
          1,
          'The ten matrices multiply into one, so the whole network is one linear (affine) map.',
        ),
        typeOutput(
          'What does this program print?',
          'import numpy as np\nx = np.array([[-2.0], [2.0]])\nW1 = np.array([[1.0]])\nW2 = np.array([[1.0]])\nprint(((x @ W1) @ W2).ravel().tolist(), (np.maximum(0, x @ W1) @ W2).ravel().tolist())',
          '[-2.0, 2.0] [0.0, 2.0]',
          'ravel flattens the column into a list. The linear stack passes -2 through unchanged; ReLU in between turns it into 0.',
        ),
        choose(
          'Why do hidden layers usually use an activation such as ReLU?',
          [
            'It turns the outputs into probabilities',
            'It keeps the layer outputs from growing too large',
            'It keeps the stack from being one linear map',
            'It makes training data unnecessary',
          ],
          2,
          'Nonlinearity between layers is what gives depth its extra modelling power.',
        ),
      ],
    },
    {
      title: 'Match the output layer to the task',
      explanation: [
        'The last layer must produce the kind of prediction the task needs. Regression uses one unit with no activation, so any number is possible. Binary classification uses one sigmoid unit, read as the probability of class 1.',
        'Multiclass classification with exactly one correct class uses one unit per class followed by softmax: $\\exp(\\text{score}) / \\sum \\exp(\\text{scores})$. Every output is positive, they add up to 1, and adding the same constant to every score leaves them unchanged.',
      ],
      example: {
        code: 'import numpy as np\nscores = np.array([2.0, 1.0, 0.1])\np = np.exp(scores) / np.exp(scores).sum()\nprint(p.round(3).tolist(), round(float(p.sum()), 3))',
        output: '[0.659, 0.242, 0.099] 1.0',
        explanation:
          'Softmax turns three raw scores into three probabilities that sum to 1, keeping their order.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          'import numpy as np\nfor scores in [np.array([1.0, 2.0, 3.0]), np.array([101.0, 102.0, 103.0])]:\n    p = np.exp(scores) / np.exp(scores).sum()\n    print(p.round(3).tolist())',
          '[0.09, 0.245, 0.665]\n[0.09, 0.245, 0.665]',
          'Adding 100 to every score multiplies each exp by the same factor, which cancels in the division.',
        ),
        typeOutput(
          'What does this program print?',
          'import numpy as np\nscores = np.array([0.0, 0.0, 0.0, 0.0])\np = np.exp(scores) / np.exp(scores).sum()\nprint(p.tolist())',
          '[0.25, 0.25, 0.25, 0.25]',
          'Equal scores give equal probabilities, and four of them must add up to 1.',
        ),
        choose(
          'A model predicts which one of 10 digits an image shows. Which output layer fits?',
          [
            'One sigmoid unit',
            'One unit with no activation',
            '10 ReLU units',
            '10 units with softmax',
          ],
          3,
          'Exactly one of ten classes is correct, so the outputs should be ten probabilities that sum to 1.',
        ),
        choose(
          'A model predicts a house price in dollars. Which output layer fits?',
          [
            'One unit with no activation',
            'One sigmoid unit',
            'Softmax over price ranges',
            'One ReLU unit followed by a sigmoid',
          ],
          0,
          'A price is an unrestricted number, so the output must not be squeezed into a probability range.',
        ),
      ],
    },
  ],
  'ml-backpropagation': [
    {
      title: 'Chain derivatives from the loss back to a weight',
      explanation: [
        'Backpropagation applies the chain rule. For a prediction $p = wx + b$ and loss $L = (p - y)^2$, first find how the loss changes with the prediction, $\\frac{dL}{dp} = 2(p - y)$. Then multiply by how the prediction changes with each parameter: $\\frac{dp}{dw} = x$ and $\\frac{dp}{db} = 1$.',
        'So $\\frac{dL}{dw} = 2(p - y)x$ and $\\frac{dL}{db} = 2(p - y)$. The upstream value $2(p - y)$ is computed once and reused for every parameter that feeds into $p$.',
      ],
      example: {
        code: 'x, y, w, b = 3.0, 4.0, 2.0, 1.0\np = w * x + b\nupstream = 2 * (p - y)\nprint(p, upstream, upstream * x, upstream * 1)',
        output: '7.0 6.0 18.0 6.0',
        explanation:
          'The prediction overshoots by 3, so $\\frac{dL}{dp} = 6$. The weight gradient multiplies by $x = 3$, and the bias gradient by 1.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          'x, y, w, b = 2.0, 5.0, 1.0, 0.0\np = w * x + b\nupstream = 2 * (p - y)\nprint(upstream * x, upstream)',
          '-12.0 -6.0',
          'The prediction 2 is 3 below the target, so $\\frac{dL}{dp} = -6$, and the weight gradient adds a factor of $x = 2$.',
        ),
        choose(
          'For $p = wx + b$, which factor turns $\\frac{dL}{dp}$ into $\\frac{dL}{dw}$?',
          ['$b$', '$y$', '$x$', '$1$'],
          2,
          'Changing w by a small amount changes p by x times that amount.',
        ),
        typeOutput(
          'What does this program print?',
          'x, y, w, b = 4.0, 9.0, 2.0, 1.0\np = w * x + b\nupstream = 2 * (p - y)\nprint(upstream * x, upstream)',
          '0.0 0.0',
          'The prediction 9 equals the target, so the loss is at its minimum and both gradients are 0.',
        ),
        choose(
          'Why is 2*(p - y) called the upstream gradient?',
          [
            'It is computed after the parameters are updated',
            'It is the loss’s slope at p, reused by each parameter',
            'It is the gradient flowing from the input layer upward',
            'It is the learning rate',
          ],
          1,
          'Each parameter’s gradient multiplies this shared value by its own local derivative.',
        ),
      ],
    },
    {
      title: 'Multiply by each activation’s local derivative',
      explanation: [
        'The forward pass computes and stores every intermediate value; the backward pass walks the same steps in reverse, multiplying the incoming gradient by each step’s local derivative at the stored value.',
        'ReLU’s local derivative is 1 where its input was positive and 0 elsewhere, so it blocks gradient for inactive neurons. The sigmoid’s is $s(1 - s)$, at most 0.25. For a sigmoid output with log loss, the chain simplifies to $\\frac{dL}{dz} = p - y$.',
      ],
      example: {
        code: 'import math\nx, y, w = 1.0, 1.0, 0.0\nz = w * x\np = 1 / (1 + math.exp(-z))\nloss = -math.log(p)\ndp = -1 / p\ndz = dp * p * (1 - p)\nprint(p, round(loss, 3), dz, dz * x)',
        output: '0.5 0.693 -0.5 -0.5',
        explanation:
          'The loss derivative $-1/p$ times the sigmoid derivative $p(1 - p)$ gives $dz = -(1 - p) = p - y = -0.5$.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          'import numpy as np\nz = np.array([0.0, 2.0])\ns = 1 / (1 + np.exp(-z))\nprint((s * (1 - s)).round(3).tolist())',
          '[0.25, 0.105]',
          'The sigmoid’s slope is largest, 0.25, at $z = 0$ and shrinks as $z$ moves away from 0.',
        ),
        typeOutput(
          'What does this program print?',
          'import numpy as np\nz = np.array([-1.0, 0.5, 3.0, -0.2])\nupstream = np.array([4.0, 4.0, 4.0, 4.0])\nprint((upstream * (z > 0)).tolist())',
          '[0.0, 4.0, 4.0, 0.0]',
          'z > 0 is True (1) only where ReLU was active, so gradient passes through those two entries and is blocked elsewhere.',
        ),
        choose(
          'Why does the forward pass keep its intermediate values?',
          [
            'Local derivatives are evaluated at them',
            'They are needed to compute the next batch',
            'They replace the weights after training',
            'They are the final predictions for every layer',
          ],
          0,
          'Derivatives such as $s(1 - s)$ or the ReLU mask depend on the values computed going forward.',
        ),
        choose(
          'A ReLU neuron’s pre-activation is negative for every training row. What gradient reaches its incoming weights?',
          [
            'Zero, so they stop changing',
            'A very large value',
            'Exactly 0.25',
            'The same as for an active neuron',
          ],
          0,
          'ReLU’s local derivative is 0 for negative inputs, so no gradient flows back through it.',
        ),
      ],
    },
    {
      title: 'Check a gradient with finite differences',
      explanation: [
        'A derivative is a slope, so you can estimate it numerically: nudge the parameter by a small h in both directions and compute (L(w + h) - L(w - h)) / (2*h). This finite-difference estimate should closely match the gradient from backpropagation.',
        'Gradient checking is slow, because it needs two loss evaluations per parameter, so it is used to test a gradient implementation, not to train.',
      ],
      example: {
        code: 'x, y, w = 3.0, 2.0, 1.0\n\ndef loss(w):\n    return (w * x - y) ** 2\n\nh = 0.001\nnumeric = (loss(w + h) - loss(w - h)) / (2 * h)\nanalytic = 2 * (w * x - y) * x\nprint(round(numeric, 4), analytic)',
        output: '6.0 6.0',
        explanation:
          'Both methods give a slope of 6, so the analytic formula is implemented correctly.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          'def loss(w):\n    return w ** 2\n\nh = 0.001\nw = 3.0\nprint(round((loss(w + h) - loss(w - h)) / (2 * h), 3))',
          '6.0',
          'The slope of $w^2$ at $w = 3$ is $2 \\times 3 = 6$, and the symmetric difference recovers it.',
        ),
        choose(
          'A gradient check gives 6.0 numerically, but your backpropagation code gives 3.0. What is the most likely conclusion?',
          [
            'The numeric estimate is always wrong',
            'The learning rate is too large',
            'The loss has no minimum',
            'The backpropagation code has a bug',
          ],
          3,
          'A large mismatch points to the analytic gradient; here it is off by exactly a factor of 2.',
        ),
        typeOutput(
          'The code under test forgot the factor 2. What does this program print?',
          'x, y, w = 2.0, 1.0, 1.0\n\ndef loss(w):\n    return (w * x - y) ** 2\n\nh = 0.001\nnumeric = (loss(w + h) - loss(w - h)) / (2 * h)\nbuggy = (w * x - y) * x\nprint(round(numeric, 3), buggy)',
          '4.0 2.0',
          'The true slope is 2*(2 - 1)*2 = 4; the buggy formula returns half of it, which the check exposes.',
        ),
        choose(
          'Why is finite differencing not used to train large networks?',
          [
            'Its estimates are too noisy to follow downhill',
            'It needs two loss evaluations per parameter',
            'It only works for ReLU networks',
            'It cannot handle a bias',
          ],
          1,
          'Backpropagation gets all gradients in one backward pass; finite differences need two passes per parameter.',
        ),
      ],
    },
    {
      title: 'Run forward, backward, then update',
      explanation: [
        'One training step has three parts: a forward pass computes predictions and the loss, backpropagation computes the gradients, and the optimizer updates the parameters with them. Backpropagation itself changes nothing; the update is a separate step.',
        'For a batch, the per-row gradients are averaged. In matrix form, with P = X @ W and dP the loss gradient for each prediction, the weight gradient is X.T @ dP, where X.T is X with rows and columns swapped.',
      ],
      example: {
        code: 'x, y = 2.0, 10.0\nw, b = 1.0, 0.0\nfor step in range(3):\n    p = w * x + b\n    loss = (p - y) ** 2\n    grad = 2 * (p - y)\n    w, b = w - 0.05 * grad * x, b - 0.05 * grad\n    print(step, loss)',
        output: '0 64.0\n1 16.0\n2 4.0',
        explanation:
          'Each step computes the loss, backpropagates, and updates w and b. The loss falls by a factor of 4 per step.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          'import numpy as np\nX = np.array([[1.0, 2.0], [3.0, 0.0]])\ny = np.array([[1.0], [2.0]])\nW = np.array([[0.5], [0.5]])\nP = X @ W\ndP = 2 * (P - y) / len(X)\nprint(P.tolist(), (X.T @ dP).tolist())',
          '[[1.5], [1.5]] [[-1.0], [1.0]]',
          'dP is [[0.5], [-0.5]]. The first weight gets $1 \\times 0.5 + 3 \\times (-0.5) = -1$; the second gets $2 \\times 0.5 + 0 \\times (-0.5) = 1$.',
        ),
        choose(
          'What is the difference between backpropagation and an optimizer step?',
          [
            'Backpropagation updates weights; the optimizer computes gradients',
            'Backpropagation computes gradients; the optimizer applies them',
            'They are two names for the same calculation',
            'The optimizer runs before the forward pass',
          ],
          1,
          'Computing the direction and taking the step are separate operations.',
        ),
        typeOutput(
          'What does this program print?',
          'x, y = 1.0, 3.0\nw = 0.0\nfor step in range(2):\n    p = w * x\n    grad = 2 * (p - y) * x\n    w = w - 0.25 * grad\n    print(step, (p - y) ** 2, w)',
          '0 9.0 1.5\n1 2.25 2.25',
          'The loss is printed from the forward pass before each update: 9 at $w = 0$, then 2.25 at $w = 1.5$.',
        ),
        choose(
          'In which order does one training step run?',
          [
            'Update, forward pass, backward pass',
            'Backward pass, forward pass, update',
            'Forward pass, backward pass, update',
            'Forward pass, update, backward pass',
          ],
          2,
          'The backward pass needs the forward pass’s values, and the update needs the gradients.',
        ),
      ],
    },
  ],
  'ml-training-deep-networks': [
    {
      title: 'See why gradients vanish or explode with depth',
      explanation: [
        'Backpropagating through many layers multiplies many local factors. If they are typically below 1, the product shrinks toward 0 and early layers barely learn (vanishing gradients); if above 1, it grows huge (exploding gradients).',
        'The sigmoid’s derivative is at most 0.25, so deep sigmoid stacks vanish quickly. ReLU’s derivative is 1 for active units, and careful initialization keeps each layer’s signal scale near 1; residual connections and normalization also help.',
      ],
      example: {
        code: 'print(0.5 ** 10, round(1.5 ** 10, 2))',
        output: '0.0009765625 57.67',
        explanation:
          'Ten layers that each halve the gradient shrink it about a thousandfold; ten that each multiply it by 1.5 grow it nearly sixtyfold.',
      },
      questions: [
        predictOutput(
          'Each of five sigmoid layers contributes its largest possible derivative. What does this program print?',
          'print(0.25 ** 5)',
          ['1.25', '0.0009765625', '0.25', '0.03125'],
          1,
          'Even at the best case of 0.25 per layer, five layers shrink the gradient about a thousandfold.',
        ),
        choose(
          'Why do deep stacks of ReLU layers suffer less from vanishing gradients than stacks of sigmoids?',
          [
            'ReLU outputs are always between 0 and 1',
            'ReLU has no weights',
            'ReLU makes the loss convex',
            'ReLU’s derivative is 1 for active units',
          ],
          3,
          'Multiplying by 1 keeps the gradient’s size, while multiplying by 0.25 per layer shrinks it fast.',
        ),
        typeOutput(
          'What does this program print?',
          'grad = 1.0\nfor layer in range(8):\n    grad = grad * 2.0\nprint(grad)',
          '256.0',
          'Eight factors of 2 multiply the gradient by $2^8 = 256$, which is how gradients explode with depth.',
        ),
        choose(
          'Training loss of a 50-layer network suddenly becomes NaN after a few steps. What is a likely cause?',
          [
            'Exploding gradients producing huge updates',
            'Too few training rows',
            'An overly strong dropout rate at inference',
            'A missing validation set',
          ],
          0,
          'Huge gradients make weights overflow, which shows up as an infinite or NaN loss.',
        ),
      ],
    },
    {
      title: 'Limit update size with clipping and learning-rate schedules',
      explanation: [
        'Norm clipping rescales a gradient vector whose length, np.linalg.norm(g), exceeds a limit: $g \\times \\min(1, \\text{limit} / \\text{norm})$. The direction is kept and only oversized gradients shrink.',
        'A learning-rate schedule changes the step size during training, for example halving it every 10 epochs, so early steps make fast progress and later steps settle in. Neither technique fixes overfitting, which is a generalization problem rather than a numerical one.',
      ],
      example: {
        code: 'import numpy as np\ngradient = np.array([6.0, -8.0])\nlimit = 5.0\nnorm = np.linalg.norm(gradient)\nclipped = gradient * min(1.0, limit / norm)\nprint(float(norm), clipped.tolist())',
        output: '10.0 [3.0, -4.0]',
        explanation:
          'The norm is 10, twice the limit, so the vector is halved: same direction, length 5.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          'import numpy as np\ngradient = np.array([1.0, 2.0, 2.0])\nnorm = float(np.linalg.norm(gradient))\nfor limit in [1.0, 5.0]:\n    print(limit, (gradient * min(1.0, limit / norm)).round(3).tolist())',
          '1.0 [0.333, 0.667, 0.667]\n5.0 [1.0, 2.0, 2.0]',
          'The norm is 3. A limit of 1 scales the vector by $1/3$; a limit of 5 leaves it alone, because clipping never enlarges.',
        ),
        predictOutput(
          'What does this program print?',
          'for epoch in [0, 9, 10, 25]:\n    print(epoch, 0.1 * 0.5 ** (epoch // 10))',
          [
            '0 0.1\n9 0.05\n10 0.025\n25 0.0125',
            '0 0.1\n9 0.1\n10 0.05\n25 0.025',
            '0 0.1\n9 0.1\n10 0.05\n25 0.0125',
            '0 0.05\n9 0.05\n10 0.025\n25 0.0125',
          ],
          1,
          'epoch // 10 counts completed blocks of 10 epochs, and each block halves the rate.',
        ),
        choose(
          'What does gradient norm clipping preserve?',
          [
            'The gradient’s length',
            'The gradient’s direction',
            'The loss value',
            'The learning rate',
          ],
          1,
          'Every entry is multiplied by the same factor, so the vector points the same way.',
        ),
        choose(
          'Validation loss rises while training loss keeps falling. Will gradient clipping fix this?',
          [
            'Yes, because clipping prevents all instability',
            'Yes, if the limit is very small',
            'No; this is overfitting, not instability',
            'No, because clipping only works for ReLU',
          ],
          2,
          'Clipping addresses numerical blow-ups, not a generalization gap.',
        ),
      ],
    },
    {
      title: 'Drop activations while training, not while predicting',
      explanation: [
        'Dropout randomly zeroes a fraction p of a layer’s activations at each training step, so the network cannot rely on any single unit. The kept activations are divided by 1 - p, which keeps each unit’s expected value unchanged.',
        'At prediction time, dropout is switched off and the full network is used, with no rescaling needed. Frameworks therefore distinguish a training mode from an inference mode.',
      ],
      example: {
        code: 'import numpy as np\na = np.array([2.0, 4.0, 6.0, 8.0])\nmask = np.array([1.0, 0.0, 1.0, 0.0])\np_drop = 0.5\nprint((a * mask / (1 - p_drop)).tolist())\nprint(a.tolist())',
        output: '[4.0, 0.0, 12.0, 0.0]\n[2.0, 4.0, 6.0, 8.0]',
        explanation:
          'In training, half the units are dropped by this mask and the rest are doubled. At inference, the activations pass through unchanged.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          'import numpy as np\na = np.array([3.0, 3.0, 3.0, 3.0])\nmask = np.array([1.0, 1.0, 1.0, 0.0])\np_drop = 0.25\nprint((a * mask / (1 - p_drop)).tolist())',
          '[4.0, 4.0, 4.0, 0.0]',
          'Kept values are divided by 0.75, giving 4.0; the dropped one is 0. The mean stays 3.',
        ),
        choose(
          'How does standard dropout behave when the trained model makes predictions?',
          [
            'It keeps dropping the same fraction of units',
            'It is switched off; every unit is used',
            'It drops every unit',
            'It doubles every activation',
          ],
          1,
          'Dropout is a training-time regularizer; inference uses every unit.',
        ),
        choose(
          'Why are kept activations divided by 1 - p during training?',
          [
            'So their expected value matches inference',
            'To make the loss smaller',
            'To speed up the backward pass',
            'Because dropped units would otherwise be negative',
          ],
          0,
          'Without the rescaling, the layer’s output would be smaller in training than at inference.',
        ),
        choose(
          'A model’s evaluation scores vary from run to run on the same data. What is a likely cause?',
          [
            'The validation rows were shuffled between runs',
            'The learning rate schedule is too slow',
            'The weights were initialized carefully',
            'Dropout was left active during evaluation',
          ],
          3,
          'Active dropout makes each forward pass random, so predictions change between runs.',
        ),
      ],
    },
    {
      title:
        'Normalize with batch statistics, then switch to running statistics',
      explanation: [
        'Batch normalization standardizes each feature of a layer’s input using the current batch’s mean and variance, then applies a learned scale and shift. This keeps activation scales steady from layer to layer, which stabilizes training.',
        'At inference, batches may be tiny or single rows, so the layer uses running averages of the mean and variance collected during training. Using the wrong mode changes predictions, just as with dropout.',
      ],
      example: {
        code: 'import numpy as np\nbatch = np.array([2.0, 4.0, 6.0, 8.0])\nnormed = (batch - batch.mean()) / np.sqrt(batch.var() + 1e-5)\nprint(normed.round(3).tolist())\nrunning_mean, running_var = 4.0, 4.0\nprint(((np.array([6.0]) - running_mean) / np.sqrt(running_var + 1e-5)).round(3).tolist())',
        output: '[-1.342, -0.447, 0.447, 1.342]\n[1.0]',
        explanation:
          'In training, the batch’s own mean 5 and variance 5 are used (the tiny 1e-5 avoids division by zero). At inference, a single 6.0 is normalized with the stored running mean and variance of 4.',
      },
      questions: [
        typeOutput(
          'Each column is one feature. What does this program print?',
          'import numpy as np\nbatch = np.array([[1.0, 10.0], [3.0, 30.0]])\nprint(((batch - batch.mean(axis=0)) / batch.std(axis=0)).tolist())',
          '[[-1.0, -1.0], [1.0, 1.0]]',
          'Each column is standardized with its own mean and standard deviation, so both features end up on the same scale.',
        ),
        choose(
          'Which statistics does a batch-normalization layer use when predicting a single row?',
          [
            'The mean and variance of that single row',
            'The statistics of the test set',
            'Running averages from training',
            'No statistics; it is skipped',
          ],
          2,
          'One row has no meaningful batch statistics, so the stored running averages are used.',
        ),
        typeOutput(
          'What does this program print?',
          'import numpy as np\nrunning_mean, running_var = 10.0, 25.0\nrows = np.array([20.0, 5.0])\nprint(((rows - running_mean) / np.sqrt(running_var)).tolist())',
          '[2.0, -1.0]',
          'Inference uses the stored mean 10 and standard deviation 5: (20 - 10) / 5 = 2 and (5 - 10) / 5 = -1.',
        ),
        choose(
          'Why does batch normalization help train deep networks?',
          [
            'It removes the need for a loss function',
            'It keeps each layer’s inputs at a steady scale',
            'It normalizes the targets so the loss stays small',
            'It prevents overfitting entirely',
          ],
          1,
          'Steady activation scales keep gradients from shrinking or growing as they pass through layers.',
        ),
      ],
    },
  ],
  'ml-keras-workflow': [
    {
      title: 'Stack layers and count their parameters',
      explanation: [
        'In Keras, a Sequential model is a list of layers applied in order: an input of n features, then Dense layers such as Dense(8, activation="relu"), ending in an output layer that suits the task. model.summary() lists each layer’s parameter count, $\\text{inputs} \\times \\text{units} + \\text{units}$.',
        'When a model needs branches, several inputs, or several outputs, the Functional API connects layers as a graph instead of a single stack. TensorFlow does not run in this browser, so the programs here compute the same quantities with plain Python and NumPy.',
      ],
      example: {
        code: 'layers = [4, 8, 3]\ntotal = 0\nfor i in range(len(layers) - 1):\n    params = layers[i] * layers[i + 1] + layers[i + 1]\n    print(params)\n    total += params\nprint(total)',
        output: '40\n27\n67',
        explanation:
          'A stack of 4 inputs, Dense(8), and Dense(3) has $4 \\times 8 + 8 = 40$ and $8 \\times 3 + 3 = 27$ parameters: 67 in total, as model.summary() would report.',
      },
      questions: [
        typeOutput(
          'The model has 10 inputs, Dense(16), and Dense(1). What does this program print?',
          'layers = [10, 16, 1]\ntotal = 0\nfor i in range(len(layers) - 1):\n    total += layers[i] * layers[i + 1] + layers[i + 1]\nprint(total)',
          '193',
          '$10 \\times 16 + 16 = 176$ and $16 \\times 1 + 1 = 17$, which sum to 193.',
        ),
        choose(
          'A model takes an image and a text caption as two separate inputs. Which Keras style is needed?',
          [
            'A Sequential model, because it is shorter',
            'The Functional API, which allows branches',
            'A single Dense layer',
            'No model; Keras accepts one input only',
          ],
          1,
          'Two inputs form two branches, which a single linear stack cannot express.',
        ),
        choose(
          'A Sequential model ends with Dense(3, activation="softmax"). What does each prediction contain?',
          [
            'Three probabilities summing to 1',
            'One probability between 0 and 1',
            'Three unrestricted numbers',
            'The index of the predicted class',
          ],
          0,
          'Three softmax units output a probability for each of three mutually exclusive classes.',
        ),
        choose(
          'Which layer list builds a binary classifier on 20 features?',
          [
            'Input(20), Dense(16, relu), Dense(2, relu)',
            'Input(20), Dense(16, relu), Dense(20, softmax)',
            'Input(20), Dense(16, sigmoid), Dense(16, relu)',
            'Input(20), Dense(16, relu), Dense(1, sigmoid)',
          ],
          3,
          'One sigmoid output unit gives the probability of the positive class.',
        ),
      ],
    },
    {
      title: 'Compile with an optimizer and a loss that fits the labels',
      explanation: [
        'model.compile(optimizer="adam", loss=..., metrics=["accuracy"]) fixes how the model will train. The loss must match both the output layer and the label format: one sigmoid unit with 0/1 labels uses "binary_crossentropy"; softmax with integer class labels uses "sparse_categorical_crossentropy"; softmax with one-hot label vectors uses "categorical_crossentropy"; a numeric output uses "mse".',
        'The two categorical losses compute the same quantity, minus the log of the probability given to the true class; they differ only in how the label is written. Metrics are reported but not optimized.',
      ],
      example: {
        code: 'import numpy as np\np = np.array([0.1, 0.2, 0.7])\none_hot = np.array([0.0, 0.0, 1.0])\nlabel = 2\nprint(round(float(-(one_hot * np.log(p)).sum()), 3), round(float(-np.log(p[label])), 3))',
        output: '0.357 0.357',
        explanation:
          'The one-hot form and the integer form pick out the same probability, 0.7, so both losses are $-\\log(0.7)$.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          'import numpy as np\none_hot = np.array([[0, 1, 0], [1, 0, 0], [0, 0, 1]])\nprint(np.argmax(one_hot, axis=1).tolist())',
          '[1, 0, 2]',
          'np.argmax finds the position of the 1 in each row, converting one-hot vectors to integer labels.',
        ),
        choose(
          'Labels are integers 0 to 9 and the output is Dense(10, softmax). Which loss fits without converting the labels?',
          [
            'binary_crossentropy',
            'sparse_categorical_crossentropy',
            'categorical_crossentropy',
            'mse',
          ],
          1,
          'The sparse variant accepts integer labels; the plain categorical loss expects one-hot vectors.',
        ),
        typeOutput(
          'p[np.arange(2), labels] picks each row’s probability for its true class. What does this program print?',
          'import numpy as np\np = np.array([[0.8, 0.1, 0.1], [0.2, 0.2, 0.6]])\nlabels = np.array([0, 1])\nlosses = -np.log(p[np.arange(2), labels])\nprint(losses.round(3).tolist())',
          '[0.223, 1.609]',
          'Row 1 gave its true class 0.8, a small loss; row 2 gave its true class only 0.2, a loss of $-\\log(0.2) \\approx 1.609$.',
        ),
        choose(
          'A model predicts delivery time in minutes. Which compile setting fits?',
          [
            'A sigmoid output with binary_crossentropy',
            'A softmax output with categorical_crossentropy',
            'A linear output with mse',
            'Any output with accuracy as the loss',
          ],
          2,
          'A numeric target needs an unrestricted output and a regression loss.',
        ),
      ],
    },
    {
      title: 'Fit in epochs and mini-batches with validation data',
      explanation: [
        'model.fit(X, y, epochs=5, batch_size=32, validation_data=(X_val, y_val)) trains with mini-batch gradient descent. One epoch is one pass over all training rows; each batch of 32 rows is one parameter update, so an epoch has ceil(rows / batch_size) updates.',
        'fit returns a History whose history dictionary lists the loss and val_loss for every epoch. validation_split=0.2 instead holds out the last 20% of the rows before shuffling, which misleads if the rows are sorted.',
      ],
      example: {
        code: 'import math\nn, batch_size, epochs = 1000, 32, 5\nsteps = math.ceil(n / batch_size)\nprint(steps, steps * epochs)',
        output: '32 160',
        explanation:
          'math.ceil rounds up: 1,000 rows make 31 full batches and one partial batch, so 32 updates per epoch and 160 over five epochs.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          'import math\nsteps = math.ceil(50000 / 128)\nprint(steps, steps * 10)',
          '391 3910',
          '$50{,}000 / 128$ is 390.6, which rounds up to 391 updates per epoch.',
        ),
        choose(
          'What is one epoch?',
          [
            'One parameter update',
            'One batch of 32 rows',
            'One pass over every training row',
            'One evaluation on the test set',
          ],
          2,
          'An epoch covers the whole training set once, usually in many mini-batch updates.',
        ),
        choose(
          'Training rows are sorted so that every positive example comes last. You call fit with validation_split=0.2. What goes wrong?',
          [
            'The validation rows are almost all positive',
            'Keras raises an error for sorted data',
            'Validation rows are drawn at random, so nothing goes wrong',
            'The model trains on the validation rows',
          ],
          0,
          'validation_split takes the final rows before shuffling, so shuffle the data first or pass validation_data.',
        ),
        typeOutput(
          'This dictionary has the shape of a History. What does this program print?',
          'history = {"loss": [0.9, 0.6, 0.4, 0.3, 0.25], "val_loss": [0.95, 0.7, 0.55, 0.58, 0.62]}\nval = history["val_loss"]\nbest = 0\nfor epoch in range(len(val)):\n    if val[epoch] < val[best]:\n        best = epoch\nprint(best + 1, val[best])',
          '3 0.55',
          'Validation loss is lowest in the third epoch; training loss keeps falling after that, a sign of overfitting.',
        ),
      ],
    },
    {
      title: 'Stop early, then evaluate once on the test set',
      explanation: [
        'Callbacks run during fit. EarlyStopping(monitor="val_loss", patience=2, restore_best_weights=True) stops after val_loss fails to improve for 2 epochs in a row and restores the weights from the best epoch.',
        'After training, model.evaluate(X_test, y_test) reports the loss and metrics on the untouched test set, once. model.predict(X) returns the output layer’s values, such as probabilities, which you turn into labels yourself.',
      ],
      example: {
        code: 'val_loss = [0.70, 0.55, 0.50, 0.52, 0.51, 0.53, 0.56]\npatience = 2\nbest, best_epoch, waited = val_loss[0], 0, 0\nfor epoch in range(1, len(val_loss)):\n    if val_loss[epoch] < best:\n        best, best_epoch, waited = val_loss[epoch], epoch, 0\n    else:\n        waited += 1\n        if waited >= patience:\n            print("stop after epoch", epoch)\n            break\nprint("restore epoch", best_epoch)',
        output: 'stop after epoch 4\nrestore epoch 2',
        explanation:
          'Epochs 3 and 4 fail to beat 0.50, so patience runs out at epoch 4, and the weights from epoch 2 are restored. break leaves the loop early.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          'val_loss = [0.8, 0.6, 0.62, 0.59, 0.61, 0.63, 0.65]\npatience = 2\nbest, best_epoch, waited = val_loss[0], 0, 0\nfor epoch in range(1, len(val_loss)):\n    if val_loss[epoch] < best:\n        best, best_epoch, waited = val_loss[epoch], epoch, 0\n    else:\n        waited += 1\n        if waited >= patience:\n            print("stop after epoch", epoch)\n            break\nprint("restore epoch", best_epoch)',
          'stop after epoch 5\nrestore epoch 3',
          'Epoch 3 improves to 0.59 and resets the count, so epochs 4 and 5 use up the patience.',
        ),
        choose(
          'What does restore_best_weights=True add to EarlyStopping?',
          [
            'Training continues for extra epochs',
            'The weights from the best epoch are kept',
            'The test set is used as validation data',
            'The weights are reset to their initial values',
          ],
          1,
          'Without it, the model keeps the weights from the last, already-worse epoch.',
        ),
        choose(
          'Where should X_test be used in a Keras workflow?',
          [
            'Once, in model.evaluate after tuning',
            'As validation_data for EarlyStopping',
            'In every epoch to choose the learning rate',
            'Merged into the training data',
          ],
          0,
          'Any use that guides training turns the test set into validation data.',
        ),
        typeOutput(
          'predict returned these sigmoid outputs. What does this program print?',
          'import numpy as np\nprobs = np.array([[0.2], [0.8], [0.5], [0.49]])\nprint([int(p >= 0.5) for p in probs[:, 0]])',
          '[0, 1, 1, 0]',
          'predict returns probabilities; a threshold of 0.5 turns them into labels, with 0.5 itself counted as positive.',
        ),
      ],
    },
  ],
  'ml-convolution': [
    {
      title: 'Slide one shared filter across the input',
      explanation: [
        'A convolutional layer slides a small filter along the input and computes a weighted sum at every position. The same weights are reused everywhere, so a pattern the filter detects is found wherever it appears. Each output depends only on a local window, its receptive field.',
        'Deep-learning libraries compute cross-correlation, without flipping the filter, and still call it convolution. np.correlate(signal, f, mode="valid") does the same in NumPy; a filter of length k over n values gives n - k + 1 outputs.',
      ],
      example: {
        code: 'import numpy as np\nsignal = np.array([1.0, 3.0, 2.0, 5.0, 4.0])\nf = np.array([-1.0, 1.0])\nprint(np.correlate(signal, f, mode="valid").tolist())',
        output: '[2.0, -1.0, 3.0, -1.0]',
        explanation:
          'The filter [-1, 1] measures each step from one value to the next: +2, -1, +3, -1. Five values and a two-wide filter give four outputs.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          'import numpy as np\nsignal = np.array([0.0, 1.0, 4.0, 9.0])\nf = np.array([1.0, 1.0])\nprint(np.correlate(signal, f, mode="valid").tolist())',
          '[1.0, 5.0, 13.0]',
          'Each output sums a neighbouring pair: 0+1, 1+4, 4+9. Four values and a two-wide filter give three outputs.',
        ),
        choose(
          'What is weight sharing in a convolutional layer?',
          [
            'Each position learns its own unrelated filter',
            'The same filter weights are applied at every position',
            'All layers share one set of weights',
            'Every filter has the same weights as every other filter',
          ],
          1,
          'One filter slides across the input, so it uses far fewer weights and detects a pattern anywhere.',
        ),
        typeOutput(
          'What does this program print?',
          'import numpy as np\nsignal = np.zeros(10)\nf = np.ones(3)\nprint(len(np.correlate(signal, f, mode="valid")))',
          '8',
          'A filter of width 3 fits in 10 - 3 + 1 = 8 positions.',
        ),
        choose(
          'An output unit is computed from input positions 4, 5, and 6. What are those positions called?',
          [
            'Its receptive field',
            'Its stride',
            'Its padding',
            'Its output channel',
          ],
          0,
          'The receptive field is the part of the input that influences a given output.',
        ),
      ],
    },
    {
      title: 'Control output size with stride and padding',
      explanation: [
        'Stride is how far the filter moves between positions; a stride of 2 computes every other output, roughly halving the size. Padding adds values, usually zeros, around the input so the filter can also be centred at the edges; "same" padding keeps the output as long as the input at stride 1.',
        'For length n, filter k, padding p on each side, and stride s, the output length is (n + 2*p - k) // s + 1.',
      ],
      example: {
        code: 'import numpy as np\nsignal = np.array([1.0, 3.0, 2.0, 5.0, 4.0])\nf = np.array([-1.0, 1.0])\nfull = np.correlate(signal, f, mode="valid")\nprint(full[::2].tolist())\npadded = np.pad(signal, 1)\nprint(padded.tolist(), len(np.correlate(padded, f, mode="valid")))',
        output: '[2.0, 3.0]\n[0.0, 1.0, 3.0, 2.0, 5.0, 4.0, 0.0] 6',
        explanation:
          'Stride 2 keeps every other response. np.pad adds one zero on each side, so the two-wide filter fits in 6 positions.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          'def out_len(n, k, p, s):\n    return (n + 2 * p - k) // s + 1\n\nprint(out_len(32, 3, 0, 1), out_len(32, 3, 1, 1), out_len(32, 3, 1, 2))',
          '30 32 16',
          'No padding loses k - 1 = 2 positions; padding 1 restores them; stride 2 then halves the count.',
        ),
        choose(
          'What does increasing the stride from 1 to 2 usually do?',
          [
            'Doubles the number of outputs',
            'Makes the filter twice as wide',
            'Roughly halves the output size',
            'Adds zeros around the input',
          ],
          2,
          'The filter skips every other position, so fewer outputs are computed.',
        ),
        choose(
          'Why add "same" padding to a convolution?',
          [
            'To make the filter learn faster',
            'To keep the output as long as the input',
            'To stop the filter weights from growing too large',
            'To share weights between layers',
          ],
          1,
          'Zeros at the edges give the filter enough room at the borders to produce one output per input position.',
        ),
        typeOutput(
          'What does this program print?',
          'def out_len(n, k, p, s):\n    return (n + 2 * p - k) // s + 1\n\nprint(out_len(9, 5, 0, 1), out_len(9, 5, 2, 1))',
          '5 9',
          '9 - 5 + 1 = 5 without padding; padding 2 on each side gives 13 - 5 + 1 = 9, the same as the input.',
        ),
      ],
    },
    {
      title: 'Apply 2D filters and stack output channels',
      explanation: [
        'On an image, a filter is a small grid, such as 3 by 3, that slides over rows and columns. With several input channels, such as red, green, and blue, the filter has one grid per channel. Each filter produces one output channel; a layer with 16 filters produces 16 channels.',
        'A layer’s parameters are kernel_height * kernel_width * input_channels * filters, plus one bias per filter, independent of image size. That is far fewer than a dense layer connecting every pixel.',
      ],
      example: {
        code: 'import numpy as np\nimage = np.array([[0, 0, 9, 9], [0, 0, 9, 9], [0, 0, 9, 9]], dtype=float)\nkernel = np.array([[-1.0, 1.0], [-1.0, 1.0]])\nout = np.array([[(image[r:r + 2, c:c + 2] * kernel).sum() for c in range(3)] for r in range(2)])\nprint(out.tolist())',
        output: '[[0.0, 18.0, 0.0], [0.0, 18.0, 0.0]]',
        explanation:
          'The nested comprehension slides the 2 by 2 kernel over every position. It responds only where dark changes to bright, so it detects the vertical edge.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          'import numpy as np\nimage = np.array([[1, 1, 1], [5, 5, 5], [5, 5, 5]], dtype=float)\nkernel = np.array([[-1.0, -1.0], [1.0, 1.0]])\nout = np.array([[(image[r:r + 2, c:c + 2] * kernel).sum() for c in range(2)] for r in range(2)])\nprint(out.tolist())',
          '[[8.0, 8.0], [0.0, 0.0]]',
          'This kernel compares each row with the one below; it fires on the dark-to-bright change in the top rows and stays 0 in the uniform bottom rows.',
        ),
        typeOutput(
          'What does this program print?',
          'k, in_channels, filters = 3, 3, 16\nconv = k * k * in_channels * filters + filters\ndense = 32 * 32 * 3 * 16 + 16\nprint(conv, dense)',
          '448 49168',
          'The convolution reuses $3 \\times 3 \\times 3$ weights per filter at every position; a dense layer needs a weight for every pixel and channel.',
        ),
        choose(
          'A convolutional layer has 32 filters. How many output channels does it produce?',
          ['1', '3', '32', 'One per pixel'],
          2,
          'Each filter produces its own feature map, so 32 filters give 32 channels.',
        ),
        choose(
          'Why does a convolutional layer need far fewer parameters than a dense layer on an image?',
          [
            'It ignores most of the pixels',
            'It works only on grayscale images',
            'It stores the image at a lower resolution',
            'Its filters are shared across positions',
          ],
          3,
          'Weight sharing makes the parameter count depend on the filter size, not the image size.',
        ),
      ],
    },
    {
      title: 'Pool neighbourhoods and grow the receptive field',
      explanation: [
        'Pooling summarizes neighbouring values to shrink the output. Max pooling with window 2 and stride 2 keeps the largest value of each pair, halving the length and keeping the strongest response.',
        'Stacking layers widens the receptive field: each layer sees a window of the previous layer’s outputs, so deeper units depend on larger regions of the input. With $L$ stacked stride-1 layers of width $k$, it is $1 + L(k - 1)$ inputs wide. Shared filters and pooling help find a pattern in different places, but they do not make a network fully insensitive to position.',
      ],
      example: {
        code: 'import numpy as np\nx = np.array([1.0, 3.0, 2.0, 0.0, 4.0, 6.0])\nprint(x.reshape(-1, 2).max(axis=1).tolist())',
        output: '[3.0, 2.0, 6.0]',
        explanation:
          'reshape(-1, 2) groups the values into pairs, and max(axis=1) keeps the largest in each pair.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          'import numpy as np\nx = np.array([5.0, 1.0, 2.0, 8.0, 0.0, 3.0, 7.0, 7.0])\nprint(x.reshape(-1, 2).max(axis=1).tolist())',
          '[5.0, 8.0, 3.0, 7.0]',
          'Each pair keeps its largest value, halving the length from 8 to 4.',
        ),
        typeOutput(
          'What does this program print?',
          'def receptive_field(layers, k):\n    return 1 + layers * (k - 1)\n\nprint(receptive_field(1, 3), receptive_field(2, 3), receptive_field(3, 3))',
          '3 5 7',
          'Each extra 3-wide layer adds 2 input positions to what one output unit can see.',
        ),
        choose(
          'What does max pooling keep from each window?',
          [
            'The average value',
            'The first value',
            'Every value, sorted',
            'The largest value',
          ],
          3,
          'Max pooling reports the strongest response in each neighbourhood.',
        ),
        choose(
          'Why can deeper convolutional layers detect larger structures?',
          [
            'Their filters are always larger',
            'Their receptive fields are larger',
            'They use more input channels',
            'They see a higher-resolution copy of the image',
          ],
          1,
          'Each layer combines neighbouring outputs of the previous one, so its units depend on wider input regions.',
        ),
      ],
    },
  ],
  'ml-sequence-models': [
    {
      title: 'Build causal windows of past values',
      explanation: [
        'To forecast a sequence, each training example pairs a window of past observations with the value that follows it. The window must end before the target, so the model never sees the value it is predicting or anything later.',
        'With values in time order, slicing values[i - window:i] gives the window for target values[i].',
      ],
      example: {
        code: 'values = [10, 12, 11, 15, 14]\nwindow = 3\nexamples = []\nfor i in range(window, len(values)):\n    examples.append((values[i - window:i], values[i]))\nprint(examples)',
        output: '[([10, 12, 11], 15), ([12, 11, 15], 14)]',
        explanation:
          'Each target is paired with the three values just before it. Five values with a window of 3 give two examples.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'values = [4, 6, 5, 7, 9, 8]\nwindow = 2\nfor i in range(window, len(values)):\n    print(values[i - window:i], values[i])',
          [
            '[4, 6] 6\n[6, 5] 5\n[5, 7] 7\n[7, 9] 9',
            '[4, 6] 5\n[6, 5] 7\n[5, 7] 9\n[7, 9] 8',
            '[4, 6, 5] 7\n[6, 5, 7] 9\n[5, 7, 9] 8',
            '[6, 5] 4\n[5, 7] 6\n[7, 9] 5\n[9, 8] 7',
          ],
          1,
          'Each window holds the two values before its target, so the window never includes the target itself.',
        ),
        choose(
          'Which input window is valid for predicting the value at time 5?',
          ['Times 6, 7, 8', 'Times 3, 4, 5', 'Times 2, 3, 4', 'Times 4, 5, 6'],
          2,
          'A causal window ends before the target time; any window containing time 5 or later leaks the answer.',
        ),
        typeOutput(
          'What does this program print?',
          'values = list(range(100))\nwindow = 7\nprint(len(values) - window)',
          '93',
          'The first target needs 7 earlier values, so targets run from position 7 to 99: 93 examples.',
        ),
        choose(
          'A feature is a centred rolling average over days t - 1, t, and t + 1. Why is it a problem for forecasting day t?',
          [
            'Rolling averages are too smooth',
            'It uses day t and the later day t + 1',
            'Averaging removes the trend the model needs',
            'It ignores day t - 1',
          ],
          1,
          'A centred window reaches forward in time, so it is not available when the forecast is made.',
        ),
      ],
    },
    {
      title: 'Carry a hidden state through the steps',
      explanation: [
        'A recurrent network reads a sequence one step at a time. At each step it updates a hidden state from the current input and the previous state, $h = \\tanh(w_h h + w_x x + b)$, reusing the same weights at every step. np.tanh squeezes any number into the range -1 to 1.',
        'The final state summarizes the whole sequence, and the state at each step can also produce a prediction for that step. Information from early inputs fades unless the weights preserve it.',
      ],
      example: {
        code: 'import numpy as np\nh = 0.0\nfor x in [1.0, 0.0, 0.0, 2.0]:\n    h = np.tanh(0.8 * h + x)\n    print(round(float(h), 3))',
        output: '0.762\n0.544\n0.409\n0.981',
        explanation:
          'The first input raises the state; with zero inputs it slowly fades, still remembering the 1; the new input 2 pushes it close to 1.',
      },
      questions: [
        typeOutput(
          'This simplified recurrence has no activation. What does this program print?',
          'h = 0.0\nfor x in [4.0, 0.0, 0.0]:\n    h = 0.5 * h + x\nprint(h)',
          '1.0',
          'The 4 enters the state and is halved at each later step: 4, then 2, then 1.',
        ),
        choose(
          'What carries information from earlier steps in a recurrent network?',
          [
            'A separate model for each step',
            'The hidden state between steps',
            'The test labels',
            'A copy of every earlier input',
          ],
          1,
          'The state is updated at each step from the previous state and the current input.',
        ),
        typeOutput(
          'What does this program print?',
          'import numpy as np\nprint(np.tanh(np.array([-10.0, 0.0, 10.0])).round(3).tolist())',
          '[-1.0, 0.0, 1.0]',
          'tanh keeps the state between -1 and 1, with 0 mapped to 0.',
        ),
        choose(
          'Why does a recurrent network reuse the same weights at every step?',
          [
            'To make every hidden state identical',
            'Because the sequence has one value',
            'So one update rule fits any sequence length',
            'To store every earlier input inside the weights',
          ],
          2,
          'Sharing weights across time is to sequences what weight sharing across positions is to convolution.',
        ),
      ],
    },
    {
      title: 'Control memory with gates',
      explanation: [
        'LSTM and GRU cells add gates: learned values between 0 and 1 that decide how much of the old state to keep and how much new information to write. A simplified update is $h = g \\cdot h_{\\text{old}} + (1 - g) \\cdot \\text{candidate}$.',
        'A gate near 1 preserves the old state almost unchanged, which lets information survive many steps; a gate near 0 replaces it with the candidate. This is how gated cells keep long-range information that a plain recurrence would lose.',
      ],
      example: {
        code: 'h_old, candidate = 0.8, -0.4\nfor g in [0.9, 0.1]:\n    print(g, round(g * h_old + (1 - g) * candidate, 3))',
        output: '0.9 0.68\n0.1 -0.28',
        explanation:
          'With $g = 0.9$ the state stays close to its old value 0.8; with $g = 0.1$ it moves most of the way to the candidate -0.4.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          'h = 1.0\nfor step in range(5):\n    h = 1.0 * h + (1 - 1.0) * 0.0\nprint(h)',
          '1.0',
          'A gate of exactly 1 keeps the whole old state at every step, so the value survives unchanged.',
        ),
        typeOutput(
          'What does this program print?',
          'h_old, candidate, g = 2.0, 6.0, 0.25\nprint(g * h_old + (1 - g) * candidate)',
          '5.0',
          'A quarter of the old state plus three quarters of the candidate: 0.5 + 4.5 = 5.0.',
        ),
        choose(
          'What do LSTM and GRU gates control?',
          [
            'How much of the state is kept or rewritten',
            'How many time steps the sequence has',
            'Which rows go into the test set',
            'How fast each weight changes during training',
          ],
          0,
          'Gates are learned controls on the flow of information through the state.',
        ),
        choose(
          'Why do gated cells handle long sequences better than a plain recurrence?',
          [
            'They read the sequence backwards',
            'A gate near 0 stores every input permanently',
            'A gate near 1 stops old information fading',
            'They use larger hidden states only',
          ],
          2,
          'Keeping the state almost unchanged prevents early information from being overwritten.',
        ),
      ],
    },
    {
      title: 'Keep windows inside one entity and score each horizon',
      explanation: [
        'With several entities, such as sensors or customers, build windows within each entity’s own series. A window that runs from the end of one sensor into the start of another mixes unrelated histories.',
        'A one-step forecast predicts the next value; a multi-step forecast predicts several future values, and errors usually grow with the horizon. Report error per horizon and compare it with a naive baseline such as repeating the last observed value.',
      ],
      example: {
        code: 'series = {"A": [1, 2, 3, 4], "B": [10, 20, 30]}\nwindow = 2\nfor name in ["A", "B"]:\n    values = series[name]\n    for i in range(window, len(values)):\n        print(name, values[i - window:i], values[i])',
        output: 'A [1, 2] 3\nA [2, 3] 4\nB [10, 20] 30',
        explanation:
          'Each sensor gets its own windows. Concatenating the lists first would create a window [4, 10] that mixes sensor A with sensor B.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          'a = [5, 6, 7]\nb = [50, 60, 70]\njoined = a + b\nwindow = 2\nbad = [joined[i - window:i] for i in range(window, len(joined))]\nprint(bad[1:3])',
          '[[6, 7], [7, 50]]',
          'After concatenating, the window [7, 50] spans the end of one series and the start of the other.',
        ),
        typeOutput(
          'The naive forecast repeats the last observed value 20 for the next three steps. What does this program print?',
          'actual = [21, 24, 29]\nlast = 20\nprint([abs(a - last) for a in actual])',
          '[1, 4, 9]',
          'The error grows with the horizon because the series keeps moving away from the last value.',
        ),
        choose(
          'Why report forecast error separately for each horizon?',
          [
            'Errors are the same at every horizon',
            'Each horizon needs its own separate test set',
            'It removes the need for a baseline',
            'Accuracy can fall as the horizon grows',
          ],
          3,
          'Averaging all horizons together can hide how quickly the forecast degrades.',
        ),
        choose(
          'Readings from 50 machines are stored one machine after another in a single list. How should you build training windows?',
          [
            'Slide one window over the whole list',
            'Build windows within each machine’s readings',
            'Shuffle the list first, then build windows',
            'Use one window per machine, covering all its readings',
          ],
          1,
          'Windows must not cross from one machine’s history into another’s.',
        ),
      ],
    },
  ],
  'ml-attention': [
    {
      title: 'Score keys against a query and normalize with softmax',
      explanation: [
        'Attention lets each position decide how much to use every other position. A query vector is compared with one key vector per position, usually by a dot product, giving a score per position. Softmax turns the scores into positive weights that sum to 1.',
        'Keys similar to the query get high scores and therefore most of the weight. In a matrix, K @ q gives one score per key.',
      ],
      example: {
        code: 'import numpy as np\nq = np.array([1.0, 0.0])\nK = np.array([[1.0, 0.0], [0.0, 1.0], [1.0, 1.0]])\nscores = K @ q\nweights = np.exp(scores) / np.exp(scores).sum()\nprint(scores.tolist(), weights.round(3).tolist())',
        output: '[1.0, 0.0, 1.0] [0.422, 0.155, 0.422]',
        explanation:
          'The first and third keys share the query’s direction and score 1; the second scores 0 and gets the smallest weight.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          'import numpy as np\nq = np.array([0.0, 2.0])\nK = np.array([[1.0, 1.0], [0.0, 3.0], [2.0, 0.0]])\nprint((K @ q).tolist())',
          '[2.0, 6.0, 0.0]',
          'Each score is the dot product of a key with the query: $0 \\times 1 + 2 \\times 1 = 2$, $0 \\times 0 + 2 \\times 3 = 6$, and $2 \\times 0 + 0 \\times 2 = 0$.',
        ),
        choose(
          'What does softmax do to the attention scores?',
          [
            'Sorts them from largest to smallest',
            'Makes them positive weights that sum to 1',
            'Removes the largest score',
            'Divides each score by the sum of the scores',
          ],
          1,
          'Normalized weights say what share of attention each position receives.',
        ),
        typeOutput(
          'What does this program print?',
          'import numpy as np\nscores = np.array([5.0, 5.0])\nweights = np.exp(scores) / np.exp(scores).sum()\nprint(weights.tolist())',
          '[0.5, 0.5]',
          'Equal scores give equal weights, however large the scores are.',
        ),
        choose(
          'Which key receives the most attention?',
          [
            'The key stored first',
            'The key with the largest values overall',
            'The key with the highest query score',
            'Every key equally, always',
          ],
          2,
          'Weights follow the scores, and the scores measure similarity to the query.',
        ),
      ],
    },
    {
      title: 'Combine value vectors into a context',
      explanation: [
        'The attention weights mix value vectors: the output is the weighted sum of the values, weights @ V. Queries and keys decide where to look; values supply what is retrieved.',
        'For many queries at once, the scores are Q @ K.T, and they are divided by the square root of the key size d before softmax. Without that scaling, dot products of long vectors grow large, and softmax puts almost all weight on one position.',
      ],
      example: {
        code: 'import numpy as np\nweights = np.array([0.422, 0.155, 0.422])\nV = np.array([[10.0, 0.0], [0.0, 10.0], [5.0, 5.0]])\nprint((weights @ V).round(2).tolist())',
        output: '[6.33, 3.66]',
        explanation:
          'Most weight falls on the first and third values, so the context leans toward their first coordinate.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          'import numpy as np\nweights = np.array([0.25, 0.75])\nV = np.array([[2.0, 0.0], [0.0, 4.0]])\nprint((weights @ V).tolist())',
          '[0.5, 3.0]',
          '0.25 of the first value contributes 0.5; 0.75 of the second contributes 3.0.',
        ),
        typeOutput(
          'What does this program print?',
          'import numpy as np\nfor d in [4, 64]:\n    q = np.ones(d)\n    k = np.ones(d)\n    print(d, float(q @ k), float(q @ k / np.sqrt(d)))',
          '4 4.0 2.0\n64 64.0 8.0',
          'Raw dot products grow with $d$; dividing by $\\sqrt{d}$ keeps them in a smaller range.',
        ),
        choose(
          'In attention, what do the value vectors provide?',
          [
            'The content mixed into the output',
            'The scores that decide where to look',
            'The positions of the tokens',
            'The softmax normalization',
          ],
          0,
          'Keys and queries produce weights; values are what those weights combine.',
        ),
        choose(
          'Why are attention scores divided by $\\sqrt{d}$ before softmax?',
          [
            'To make every weight equal',
            'To stop softmax piling weight on one position',
            'To shrink scores so that softmax runs faster',
            'To make the weights sum to 1 across all positions',
          ],
          1,
          'Scaling keeps the scores moderate, so the weights stay spread out and gradients stay useful.',
        ),
      ],
    },
    {
      title: 'Mask future positions for causal attention',
      explanation: [
        'When a model generates a sequence one token at a time, a position must not attend to later positions, because they do not exist yet at generation time. A causal mask sets their scores to minus infinity before softmax, which gives them weight exactly 0.',
        'For a whole sequence the allowed pairs form a lower-triangular pattern: position i may attend to positions 0 through i. np.tril builds that pattern, and np.where swaps disallowed scores for -np.inf.',
      ],
      example: {
        code: 'import numpy as np\nscores = np.array([2.0, 1.0, 3.0])\nallowed = np.array([True, True, False])\nmasked = np.where(allowed, scores, -np.inf)\nweights = np.exp(masked) / np.exp(masked).sum()\nprint(weights.round(3).tolist())',
        output: '[0.731, 0.269, 0.0]',
        explanation:
          'The third position is in the future, so it gets weight 0 even though its score was the highest; the others share all the weight.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'import numpy as np\nprint(np.tril(np.ones((3, 3), dtype=int)).tolist())',
          [
            '[[1, 1, 1], [0, 1, 1], [0, 0, 1]]',
            '[[1, 0, 0], [1, 1, 0], [1, 1, 1]]',
            '[[1, 1, 1], [1, 1, 1], [1, 1, 1]]',
            '[[0, 0, 0], [1, 0, 0], [1, 1, 0]]',
          ],
          1,
          'Row i allows columns 0 through i: each position sees itself and the past.',
        ),
        predictOutput(
          'Each row holds one position’s scores. What does this program print?',
          'import numpy as np\nscores = np.array([[1.0, 2.0, 0.5], [0.0, 1.0, 1.0], [2.0, 0.0, 1.0]])\nallowed = np.tril(np.ones((3, 3), dtype=bool))\nmasked = np.where(allowed, scores, -np.inf)\nweights = np.exp(masked) / np.exp(masked).sum(axis=1, keepdims=True)\nprint(weights.round(3).tolist())',
          [
            '[[1.0, 0.0, 0.0], [0.269, 0.731, 0.0], [0.665, 0.09, 0.245]]',
            '[[0.231, 0.629, 0.14], [0.155, 0.422, 0.422], [0.665, 0.09, 0.245]]',
            '[[0.0, 0.0, 1.0], [0.0, 0.269, 0.731], [0.665, 0.09, 0.245]]',
            '[[1.0, 0.0, 0.0], [0.5, 0.5, 0.0], [0.333, 0.333, 0.333]]',
          ],
          0,
          'The first position can only see itself. The second splits weight between positions 0 and 1. The last sees all three.',
        ),
        choose(
          'What does a causal mask prevent?',
          [
            'Attending to earlier tokens',
            'Using value vectors',
            'Attending to later tokens',
            'Normalizing the scores',
          ],
          2,
          'During generation later tokens do not exist yet, so training must not let the model use them.',
        ),
        choose(
          'Why are masked scores set to minus infinity rather than 0?',
          [
            'exp(-inf) is 0, so masked positions get exactly zero weight',
            'A score of 0 is not allowed in attention',
            'Minus infinity makes softmax faster',
            'Either works, because softmax gives a score of 0 zero weight',
          ],
          0,
          'A score of 0 would still receive positive weight after softmax.',
        ),
      ],
    },
    {
      title: 'Add position information; choose self- or cross-attention',
      explanation: [
        'Attention by itself ignores order: shuffling the key–value pairs gives the same output, because each pair is scored on its content alone. Transformers therefore add positional information, such as position embeddings, to every token.',
        'In self-attention, queries, keys, and values all come from the same sequence. In cross-attention, queries come from one sequence and keys and values from another, as when a translation decoder consults the source sentence. Transformer blocks wrap attention with feed-forward layers, residual connections, and normalization.',
      ],
      example: {
        code: 'import numpy as np\nq = np.array([1.0, 1.0])\nK = np.array([[2.0, 0.0], [0.0, 1.0]])\nV = np.array([[1.0], [3.0]])\n\ndef attend(K, V):\n    s = K @ q\n    w = np.exp(s) / np.exp(s).sum()\n    return (w @ V).round(3).tolist()\n\nprint(attend(K, V), attend(K[::-1], V[::-1]))',
        output: '[1.538] [1.538]',
        explanation:
          'Reversing the order of the key–value pairs leaves the output unchanged, so attention alone cannot tell which token came first.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          'import numpy as np\ntokens = np.array([[1.0, 0.0], [1.0, 0.0]])\npositions = np.array([[0.0, 0.1], [0.0, 0.2]])\nprint((tokens + positions).tolist())',
          '[[1.0, 0.1], [1.0, 0.2]]',
          'Two identical tokens become different vectors once their positions are added, so attention can tell them apart.',
        ),
        choose(
          'Why do transformers add positional information to tokens?',
          [
            'Attention alone ignores token order',
            'It makes every token a class label',
            'It replaces the value vectors',
            'It masks future tokens',
          ],
          0,
          'Without positions, "dog bites man" and "man bites dog" would look the same to attention.',
        ),
        choose(
          'A translation decoder attends to the encoded source sentence. Which kind of attention is this?',
          [
            'Self-attention',
            'Causal self-attention',
            'Pooling',
            'Cross-attention',
          ],
          3,
          'The queries come from the target sequence; the keys and values come from the source.',
        ),
        choose(
          'In self-attention over a sentence, where do the queries, keys, and values come from?',
          [
            'Queries from the sentence; keys and values from another sentence',
            'All three from the same sentence',
            'Keys only from the sentence',
            'From the labels',
          ],
          1,
          'Each token compares itself with every token of the same sequence.',
        ),
      ],
    },
  ],
  'ml-transfer-learning': [
    {
      title: 'Reuse a frozen base as a feature extractor',
      explanation: [
        'Transfer learning starts from a network trained on a large related task. Feature extraction keeps that pretrained base frozen, runs the new data through it, and trains only a new head, often a single output layer, on the resulting features.',
        'This works well when the new labelled dataset is small, because only the few head parameters are learned from it. Here a fixed weight matrix stands in for the pretrained base, and scikit-learn’s LogisticRegression plays the new head.',
      ],
      example: {
        code: 'import numpy as np\nfrom sklearn.linear_model import LogisticRegression\nX = np.array([[1.0, 0.0], [2.0, 1.0], [0.0, 3.0], [1.0, 4.0]])\ny = [0, 0, 1, 1]\nW_base = np.array([[1.0, -1.0, 0.5], [-1.0, 1.0, 0.5]])\nfeatures = np.maximum(0, X @ W_base)\nprint(features.tolist())\nhead = LogisticRegression().fit(features, y)\nprint(head.predict(np.maximum(0, np.array([[0.0, 5.0]]) @ W_base)).tolist())',
        output:
          '[[1.0, 0.0, 0.5], [1.0, 0.0, 1.5], [0.0, 3.0, 1.5], [0.0, 3.0, 2.5]]\n[1]',
        explanation:
          'The frozen base turns each row into three features. Only the head is fitted, and a new row passes through the same frozen base before the head predicts.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          'base_params = 2_000_000\nhead_params = 1_281\nprint(head_params, base_params + head_params)',
          '1281 2001281',
          'With the base frozen, only the head’s 1,281 parameters are trained, out of about two million in the model. Underscores in numbers are only digit separators.',
        ),
        choose(
          'Why freeze the pretrained base while training a new head?',
          [
            'To preserve its useful features while the randomly initialized head learns',
            'To erase the pretrained weights',
            'To make every layer permanently unchangeable',
            'To avoid needing labels',
          ],
          0,
          'Large early errors from a random head could otherwise damage the pretrained features.',
        ),
        typeOutput(
          'What does this program print?',
          'import numpy as np\nW_base = np.array([[1.0, 0.0], [0.0, 2.0]])\nrow = np.array([[3.0, -1.0]])\nprint(np.maximum(0, row @ W_base).tolist())',
          '[[3.0, 0.0]]',
          'The frozen base computes [3, -2], and its ReLU clips the negative value, exactly as for the training rows.',
        ),
        choose(
          'You have 300 labelled images and a base pretrained on millions of photos. Which approach is a sensible start?',
          [
            'Train a large network from random weights',
            'Freeze the base and train a new head on its features',
            'Fine-tune every layer at a large learning rate',
            'Skip validation because the base is pretrained',
          ],
          1,
          'With few labels, reusing the frozen features and learning only the head is the safest first step.',
        ),
      ],
    },
    {
      title: 'Change trainable flags, then recompile',
      explanation: [
        'A frozen layer’s weights receive no updates: training applies the update only to trainable parameters. In Keras, set layer.trainable = False or True, then call compile again so the training configuration reflects the new flags.',
        'The model summary reports trainable and non-trainable parameter counts, a quick check that the right layers are frozen.',
      ],
      example: {
        code: 'import numpy as np\nweights = np.array([0.5, -1.0, 2.0, 0.5])\ntrainable = np.array([False, False, True, True])\ngradient = np.array([1.0, 1.0, 1.0, 1.0])\nweights = weights - 0.1 * gradient * trainable\nprint(weights.tolist())',
        output: '[0.5, -1.0, 1.9, 0.4]',
        explanation:
          'Multiplying by the trainable flags (True = 1, False = 0) applies the update only to the last two weights; the frozen ones are unchanged.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          'layers = [{"name": "conv1", "params": 1000, "trainable": False}, {"name": "conv2", "params": 5000, "trainable": True}, {"name": "head", "params": 200, "trainable": True}]\ntrainable_total = sum([layer["params"] for layer in layers if layer["trainable"]])\nprint(trainable_total)',
          '5200',
          'Only conv2 and the head are trainable: 5,000 + 200.',
        ),
        choose(
          'After setting base.trainable = True in Keras, what must you do before calling fit again?',
          [
            'Nothing; fit notices the change',
            'Delete the head',
            'Rename the model',
            'Compile the model again',
          ],
          3,
          'compile fixes the training configuration, so it must run again after trainable flags change.',
        ),
        typeOutput(
          'What does this program print?',
          'import numpy as np\nweights = np.array([1.0, 1.0, 1.0])\ntrainable = np.array([True, False, True])\nfor step in range(2):\n    weights = weights - 0.5 * np.array([2.0, 2.0, 2.0]) * trainable\nprint(weights.tolist())',
          '[-1.0, 1.0, -1.0]',
          'Each step subtracts 1 from the trainable weights only; the frozen middle weight stays at 1.',
        ),
        choose(
          'The summary shows 0 trainable parameters after you meant to unfreeze the top layers. What is the likely cause?',
          [
            'The flags were set on the wrong layers or not recompiled',
            'The base has no parameters',
            'Summary counts only change after the next fit',
            'The learning rate is too small',
          ],
          0,
          'Check which layers have trainable = True and recompile so training uses them.',
        ),
      ],
    },
    {
      title: 'Fine-tune selected layers at a small learning rate',
      explanation: [
        'Once the new head works, fine-tuning unfreezes some of the base, usually its top layers, and continues training so the features adapt to the new task. The early layers, which detect generic patterns, often stay frozen.',
        'Use a much smaller learning rate than for the head. Large updates can wreck pretrained weights in a few steps; small updates adjust them gently. Watch validation loss to decide how long to fine-tune.',
      ],
      example: {
        code: 'pretrained = 0.80\ngradient = 4.0\nfor lr in [0.1, 0.0001]:\n    print(lr, round(pretrained - lr * gradient, 4))',
        output: '0.1 0.4\n0.0001 0.7996',
        explanation:
          'At 0.1 one step halves the pretrained weight. At 0.0001 the weight barely moves, preserving what it learned.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          'w = 1.0\nfor step in range(3):\n    w = w - 0.5 * 2.0\nprint(w)',
          '-2.0',
          'Each step subtracts 1, so three large steps move the pretrained weight from 1 to -2, far from its learned value.',
        ),
        choose(
          'What is a sound fine-tuning strategy?',
          [
            'Unfreeze every layer and use the largest stable learning rate',
            'Unfreeze the top layers and use a small learning rate, watching validation loss',
            'Fine-tune before training the new head',
            'Choose the number of fine-tuning steps from the test set',
          ],
          1,
          'Small, monitored updates adapt the features without destroying them.',
        ),
        choose(
          'Why are the earliest layers of a pretrained image network often left frozen?',
          [
            'They detect generic patterns such as edges',
            'They have no weights',
            'They cannot be unfrozen',
            'They hold the class-specific features of the old task',
          ],
          0,
          'Early features transfer broadly; later layers are more specific to the original task.',
        ),
        choose(
          'Validation loss jumps sharply in the first epoch of fine-tuning. What should you try first?',
          [
            'Unfreeze more layers',
            'Raise the learning rate',
            'Train on the test set',
            'Lower the fine-tuning learning rate',
          ],
          3,
          'A sudden jump suggests the updates are too large and are disrupting pretrained features.',
        ),
      ],
    },
    {
      title:
        'Match the pretrained preprocessing and judge the fit of the source',
      explanation: [
        'A pretrained base expects inputs prepared exactly as during its training, for example pixels scaled to -1 to 1 rather than 0 to 1. Feeding it differently scaled inputs silently degrades its features. Batch-normalization layers in the base also need deliberate handling: they usually stay in inference mode while fine-tuning.',
        'Transfer helps when the source task resembles the target. Features learned on everyday photos may help with product photos but little with medical scans or audio spectrograms; validation results decide.',
      ],
      example: {
        code: 'pixels = [0, 255]\nprint([p / 255 for p in pixels])\nprint([p / 127.5 - 1 for p in pixels])',
        output: '[0.0, 1.0]\n[-1.0, 1.0]',
        explanation:
          'The same pixels become different numbers under the two conventions. A base trained on the second would receive a shifted input range if fed the first.',
      },
      questions: [
        typeOutput(
          'The base was trained on inputs scaled with p / 127.5 - 1. What does this program print?',
          'pixel = 51\nexpected = pixel / 127.5 - 1\nactual = pixel / 255\nprint(round(expected, 2), round(actual, 2))',
          '-0.6 0.2',
          'The base expects -0.6 for this pixel but would receive 0.2 under the wrong convention.',
        ),
        choose(
          'Fine-tuned accuracy is poor, and you find the new images were scaled to 0–1 while the base was trained on -1 to 1. What should you do?',
          [
            'Preprocess new images the way the base expects',
            'Fine-tune with a larger learning rate to adapt',
            'Freeze more layers',
            'Add more classes',
          ],
          0,
          'The base’s features are only meaningful for inputs prepared the way it was trained.',
        ),
        choose(
          'When is transfer learning least likely to help?',
          [
            'When the new task closely resembles the source task',
            'When the source representations poorly match the new domain',
            'When the new dataset is small',
            'When the base was trained on many examples',
          ],
          1,
          'Features that do not describe the new data give the head little to work with.',
        ),
        choose(
          'How do you find out whether a pretrained base helps your task?',
          [
            'Assume it does, since it was pretrained',
            'Check its accuracy on the original task',
            'Compare validation results against a reasonable baseline',
            'Count its parameters',
          ],
          2,
          'Only held-out performance on the new task shows whether the transfer worked.',
        ),
      ],
    },
  ],
  'ml-generative-models': [
    {
      title: 'Compress and reconstruct with an autoencoder',
      explanation: [
        'An autoencoder has an encoder that maps an input to a smaller code and a decoder that rebuilds the input from that code. It is trained to make the reconstruction match the input, usually with mean squared error.',
        'Because the code is smaller than the input, the network must keep the most important structure. The simplest example is a linear one: encode by projecting onto a direction, decode by scaling that direction back up.',
      ],
      example: {
        code: 'import numpy as np\nx = np.array([[1.0, 0.0], [0.0, 2.0], [3.0, 1.0]])\nd = np.array([0.6, 0.8])\ncode = x @ d\nrecon = np.outer(code, d)\nprint(code.round(2).tolist())\nprint(recon.round(2).tolist())\nprint(round(float(((x - recon) ** 2).mean()), 3))',
        output:
          '[0.6, 1.6, 2.6]\n[[0.36, 0.48], [0.96, 1.28], [1.56, 2.08]]\n0.887',
        explanation:
          'Each two-number row is squeezed into one code. np.outer multiplies each code by the direction to rebuild a row; the mean squared error measures what was lost.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          'import numpy as np\nx = np.array([[2.0, 2.0], [1.0, 1.0]])\nd = np.array([1.0, 1.0]) / np.sqrt(2)\nrecon = np.outer(x @ d, d)\nprint(recon.round(3).tolist(), round(float(((x - recon) ** 2).mean()), 3))',
          '[[2.0, 2.0], [1.0, 1.0]] 0.0',
          'These rows lie exactly along the code direction, so one number per row reconstructs them perfectly.',
        ),
        choose(
          'What is a basic autoencoder trained to do?',
          [
            'Predict a class label for each input',
            'Rebuild its input from a smaller code',
            'Generate labels for unlabelled data',
            'Choose actions in an environment',
          ],
          1,
          'Its training target is the input itself.',
        ),
        typeOutput(
          'What does this program print?',
          'original = [1.0, 0.0, 2.0]\nreconstructed = [0.8, 0.1, 2.1]\nerrors = [(original[i] - reconstructed[i]) ** 2 for i in range(3)]\nprint(round(sum(errors) / len(errors), 3))',
          '0.02',
          'The squared errors are 0.04, 0.01, and 0.01, which average to 0.02.',
        ),
        choose(
          'Why must an autoencoder’s code be smaller than its input, or otherwise constrained?',
          [
            'Otherwise it could copy the input without learning any structure',
            'Smaller codes always reconstruct perfectly',
            'The decoder cannot read large codes',
            'It makes training data unnecessary',
          ],
          0,
          'The bottleneck forces it to keep the most important patterns.',
        ),
      ],
    },
    {
      title: 'Sample new codes from a variational autoencoder',
      explanation: [
        'A variational autoencoder (VAE) encodes each input as a distribution, a mean $\\mu$ (mu) and a spread $\\sigma$ (sigma), rather than a single code. During training it samples a code as $z = \\mu + \\sigma \\varepsilon$, where $\\varepsilon$ (eps) is random noise, and a regularizer keeps the codes close to a standard normal distribution.',
        'Because the codes fill a smooth, known region, you can generate new data by sampling z from that normal distribution and decoding it; nearby codes decode to similar outputs.',
      ],
      example: {
        code: 'mu, sigma = 2.0, 0.5\nfor eps in [-1.0, 0.0, 2.0]:\n    print(mu + sigma * eps)',
        output: '1.5\n2.0\n3.0',
        explanation:
          'Different noise values give different codes around the mean 2.0; sigma sets how far they spread.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          'import numpy as np\nmu = np.array([1.0, -1.0])\nsigma = np.array([0.1, 2.0])\neps = np.array([1.0, 0.5])\nprint((mu + sigma * eps).tolist())',
          '[1.1, 0.0]',
          'Each coordinate moves from its mean by its own sigma times its noise: 1 + 0.1 and -1 + 1.0.',
        ),
        choose(
          'How does a trained VAE generate a new example?',
          [
            'It decodes the code of a random training example',
            'It decodes a code sampled from the prior',
            'It averages all training examples',
            'It asks a discriminator for one',
          ],
          1,
          'The regularized code space can be sampled directly, and the decoder turns samples into data.',
        ),
        typeOutput(
          'What does this program print?',
          'mu = 0.0\nfor sigma in [0.1, 3.0]:\n    print(sigma, mu + sigma * 2.0)',
          '0.1 0.2\n3.0 6.0',
          'The same noise moves the code much farther when sigma is large.',
        ),
        choose(
          'What does a VAE’s regularizer encourage?',
          [
            'Codes that memorize each input exactly',
            'Codes with no randomness',
            'Codes distributed close to a chosen prior',
            'A discriminator that is always correct',
          ],
          2,
          'Keeping codes near the prior is what makes sampling from it produce sensible outputs.',
        ),
      ],
    },
    {
      title: 'Train a generator against a discriminator',
      explanation: [
        'A generative adversarial network (GAN) has two networks. The generator turns random noise into samples; the discriminator outputs the probability that a sample is real. The discriminator is trained with log loss to say real for real data and fake for generated data.',
        'The generator is trained to make the discriminator call its samples real, for example by minimizing $-\\log(D(\\text{fake}))$. The two improve against each other, which can be unstable, and a generator may collapse onto a few kinds of output.',
      ],
      example: {
        code: 'import math\nd_real, d_fake = 0.9, 0.2\ndisc_loss = -math.log(d_real) - math.log(1 - d_fake)\ngen_loss = -math.log(d_fake)\nprint(round(disc_loss, 3), round(gen_loss, 3))',
        output: '0.329 1.609',
        explanation:
          'The discriminator is doing well (0.9 on real, 0.2 on fake), so its loss is low and the generator’s is high.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          'import math\nfor d_fake in [0.1, 0.5]:\n    print(d_fake, round(-math.log(d_fake), 3))',
          '0.1 2.303\n0.5 0.693',
          'The generator’s loss falls as the discriminator gives its samples a higher probability of being real.',
        ),
        choose(
          'Which architecture pairs a generator with a discriminator?',
          [
            'A variational autoencoder',
            'A diffusion model',
            'A recurrent network',
            'A generative adversarial network',
          ],
          3,
          'The adversarial game between the two networks defines a GAN.',
        ),
        choose(
          'A GAN produces sharp images, but nearly all of them show the same few faces. What is this failure called?',
          [
            'Mode collapse',
            'Overfitting the discriminator',
            'Vanishing reconstruction',
            'A causal mask',
          ],
          0,
          'The generator found a few outputs that fool the discriminator and stopped covering the rest of the data.',
        ),
        choose(
          'What does the discriminator output for a sample?',
          [
            'A reconstruction of the sample',
            'The noise used to create it',
            'The probability that the sample is real',
            'The sample’s class label',
          ],
          2,
          'It is a binary classifier between real and generated data.',
        ),
      ],
    },
    {
      title: 'Generate by learning to remove noise (diffusion)',
      explanation: [
        'A diffusion model corrupts training data step by step with Gaussian noise. At a step with signal level $a$, the noisy version is $x_t = \\sqrt{a} \\, x_0 + \\sqrt{1 - a} \\cdot \\text{noise}$. A network is trained to predict the noise that was added.',
        'Knowing the noise lets you recover an estimate of the clean data. Generation starts from pure noise and repeatedly removes the predicted noise, step by step, until a sample emerges.',
      ],
      example: {
        code: 'import numpy as np\nx0 = np.array([2.0, -1.0])\nnoise = np.array([0.5, 1.0])\na = 0.64\nxt = np.sqrt(a) * x0 + np.sqrt(1 - a) * noise\nprint(xt.round(3).tolist())\nprint(((xt - np.sqrt(1 - a) * noise) / np.sqrt(a)).round(3).tolist())',
        output: '[1.9, -0.2]\n[2.0, -1.0]',
        explanation:
          'With $a = 0.64$ the noisy point is 0.8 parts signal and 0.6 parts noise. Subtracting the noise contribution and rescaling recovers the clean point exactly.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          'import numpy as np\nx0 = np.array([1.0])\nnoise = np.array([2.0])\nfor a in [1.0, 0.0]:\n    print(a, (np.sqrt(a) * x0 + np.sqrt(1 - a) * noise).tolist())',
          '1.0 [1.0]\n0.0 [2.0]',
          'At $a = 1$ the sample is the clean data; at $a = 0$ it is pure noise.',
        ),
        choose(
          'What does the network in a diffusion model learn to predict?',
          [
            'The noise that was added to a corrupted sample',
            'Whether a sample is real or fake',
            'A compressed code of the input',
            'The next token in a sentence',
          ],
          0,
          'Predicting the noise is what allows it to be removed step by step.',
        ),
        typeOutput(
          'The model predicted the noise exactly. What does this program print?',
          'import numpy as np\na = 0.36\nxt = np.array([1.4])\npredicted_noise = np.array([1.0])\nprint(((xt - np.sqrt(1 - a) * predicted_noise) / np.sqrt(a)).round(3).tolist())',
          '[1.0]',
          '$\\sqrt{0.64} = 0.8$ of noise is removed, leaving 0.6, and dividing by $\\sqrt{0.36} = 0.6$ gives 1.0.',
        ),
        choose(
          'Where does a diffusion model start when generating a new sample?',
          [
            'From a training example',
            'From pure random noise',
            'From a discriminator’s output',
            'From a compressed code of a real input',
          ],
          1,
          'It reverses the noising process, so generation begins at the fully noisy end.',
        ),
      ],
    },
    {
      title: 'Check samples for memorization and coverage',
      explanation: [
        'A few attractive samples prove little. A generator can memorize training examples, cover only some kinds of data, or produce plausible but wrong content. Reconstruction error, sample quality, and diversity measure different things.',
        'One simple memorization check finds each sample’s nearest training example: a distance of 0 means an exact copy. Coverage checks ask whether samples span all the kinds of data in the training set, not just the most common ones.',
      ],
      example: {
        code: 'import numpy as np\ntrain = np.array([[0.0, 0.0], [5.0, 5.0], [9.0, 1.0]])\nsamples = np.array([[5.0, 5.0], [2.0, 3.0]])\nfor s in samples:\n    d = np.sqrt(((train - s) ** 2).sum(axis=1))\n    print(round(float(d.min()), 3))',
        output: '0.0\n3.606',
        explanation:
          'The first sample is an exact copy of a training example. The second is new, at distance $\\sqrt{13} \\approx 3.606$ from its nearest neighbour.',
      },
      questions: [
        typeOutput(
          'Each sample is labelled with the kind of data it shows. What does this program print?',
          'training_kinds = ["cat", "dog", "bird", "fish"]\nsample_kinds = ["cat", "cat", "dog", "cat", "dog"]\ncovered = [k for k in training_kinds if k in sample_kinds]\nprint(covered, len(covered) / len(training_kinds))',
          "['cat', 'dog'] 0.5",
          'The samples show only two of the four kinds, so half of the training data’s variety is missing.',
        ),
        choose(
          'Why is a small set of attractive samples not enough to evaluate a generator?',
          [
            'It proves the model cannot memorize',
            'It can hide memorization and missing kinds of data',
            'It guarantees diversity',
            'Every sample is automatically calibrated',
          ],
          1,
          'Hand-picked outputs do not describe the whole distribution of what the model produces.',
        ),
        choose(
          'A sample’s nearest training example is at distance 0. What does that suggest?',
          [
            'The model is generating perfectly new data',
            'The sample is an exact copy of a training example',
            'The training set is empty',
            'The sample is pure noise',
          ],
          1,
          'Zero distance means the model reproduced a training item rather than generating a new one.',
        ),
        choose(
          'An autoencoder reconstructs held-out inputs very well. What does that tell you about samples generated from it?',
          [
            'They will be realistic, since the decoder works well',
            'They will cover every kind of data',
            'Nothing directly; sampling is a separate test',
            'They will all be memorized copies',
          ],
          2,
          'Good reconstruction concerns encoding real inputs, not what decoding new codes produces.',
        ),
      ],
    },
  ],
  'ml-reinforcement-learning': [
    {
      title: 'Follow the agent–environment loop with a policy',
      explanation: [
        'In reinforcement learning, an agent observes the state of an environment, chooses an action, and receives a reward and a new state. A policy is the agent’s rule for choosing actions; the simplest is a dictionary from each state to an action.',
        'No one supplies the correct action. The agent learns only from the rewards that follow its own choices.',
      ],
      example: {
        code: 'policy = {"low_battery": "recharge", "ok": "explore"}\nreward_for = {"recharge": 0, "explore": 1}\nstates = ["ok", "ok", "low_battery", "ok"]\ntotal = 0\nfor state in states:\n    action = policy[state]\n    total += reward_for[action]\n    print(state, action)\nprint(total)',
        output: 'ok explore\nok explore\nlow_battery recharge\nok explore\n3',
        explanation:
          'The policy maps each observed state to an action, and the rewards for the chosen actions add up to 3.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          'policy = {"red": "stop", "green": "go"}\nreward_for = {"stop": 0, "go": 2}\ntotal = 0\nfor state in ["green", "red", "green"]:\n    total += reward_for[policy[state]]\nprint(total)',
          '4',
          'Two green states lead to "go", each earning 2; the red state earns 0.',
        ),
        choose(
          'What does a policy specify?',
          [
            'How the agent chooses an action from its state',
            'The reward for every action',
            'The correct label for each state',
            'The number of training rows',
          ],
          0,
          'The policy is the agent’s behaviour: state in, action out.',
        ),
        choose(
          'How does reinforcement learning differ from supervised learning?',
          [
            'It needs a correct action for every state',
            'It learns from rewards for its own actions',
            'It cannot use numeric data',
            'It never changes its behaviour',
          ],
          1,
          'The feedback is a reward signal, and the agent must discover which actions earn it.',
        ),
        typeOutput(
          'What does this program print?',
          'policy = {"hungry": "eat", "tired": "sleep", "fine": "work"}\nactions = [policy[s] for s in ["tired", "fine", "hungry"]]\nprint(actions)',
          "['sleep', 'work', 'eat']",
          'The comprehension looks up the policy’s action for each state, in order.',
        ),
      ],
    },
    {
      title: 'Discount future rewards into a return',
      explanation: [
        'The agent tries to maximize its return, the total of future rewards, not just the next one. A discount factor gamma ($\\gamma$) between 0 and 1 weights a reward $t$ steps away by $\\gamma^t$, so nearer rewards count more.',
        'Computing the return in a loop, start with weight 1 and multiply it by gamma after each reward. A gamma near 0 makes the agent short-sighted; near 1, patient.',
      ],
      example: {
        code: 'rewards = [1, 2, 4]\ngamma = 0.5\ntotal = 0\nweight = 1\nfor reward in rewards:\n    total += weight * reward\n    weight *= gamma\nprint(total)',
        output: '3.0',
        explanation:
          'The return is $1 + 0.5 \\times 2 + 0.25 \\times 4 = 3$. The weight halves for each step further into the future.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          'rewards = [2, 4]\ngamma = 0.5\ntotal = 0\nweight = 1\nfor reward in rewards:\n    total += weight * reward\n    weight *= gamma\nprint(total)',
          '4.0',
          'The immediate reward counts fully and the next one is halved: $2 + 0.5 \\times 4 = 4$.',
        ),
        typeOutput(
          'What does this program print?',
          'rewards = [0, 0, 10]\nfor gamma in [0.9, 0.1]:\n    total = 0\n    weight = 1\n    for reward in rewards:\n        total += weight * reward\n        weight *= gamma\n    print(gamma, round(total, 3))',
          '0.9 8.1\n0.1 0.1',
          'The reward arrives two steps away, so it is weighted by $\\gamma^2$: 0.81 or 0.01.',
        ),
        choose(
          'Why might the action with the best immediate reward be the wrong choice?',
          [
            'Future rewards never matter',
            'Another action can give up a little now for a larger return later',
            'Every action has the same consequences',
            'Rewards are only given at the start',
          ],
          1,
          'The objective is the whole discounted return, which includes delayed effects.',
        ),
        choose(
          'An agent with gamma = 0 ignores rewards after the next step. How would raising gamma toward 1 change it?',
          [
            'It would value distant rewards almost as much as immediate ones',
            'It would stop receiving rewards',
            'It would act randomly',
            'It would only value the immediate reward',
          ],
          0,
          'A gamma close to 1 shrinks the discount, so long-term consequences count.',
        ),
      ],
    },
    {
      title: 'Pick actions with Q-values and update them from experience',
      explanation: [
        'A Q-value Q(state, action) estimates the return from taking that action in that state and acting well afterwards. A greedy agent chooses the action with the highest Q-value.',
        'Q-learning improves the estimates from experience. After taking an action and seeing reward $r$ and next state $s_2$, it moves the old estimate toward the target $r + \\gamma \\times (\\text{best Q-value in } s_2)$ by a step alpha ($\\alpha$): $Q = Q + \\alpha(\\text{target} - Q)$.',
      ],
      example: {
        code: 'q = {"left": 1.5, "right": 2.5, "stay": 0.5}\nbest = "left"\nfor action in ["left", "right", "stay"]:\n    if q[action] > q[best]:\n        best = action\nprint(best)\nold, reward, gamma, best_next, alpha = 2.0, 1.0, 0.9, 5.0, 0.5\ntarget = reward + gamma * best_next\nprint(target, old + alpha * (target - old))',
        output: 'right\n5.5 3.75',
        explanation:
          'The greedy choice is the action with the largest Q-value. The update moves 2.0 halfway toward the target $1 + 0.9 \\times 5 = 5.5$.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          'q = {"up": 0.2, "down": 0.9, "wait": 0.4}\nbest = "up"\nfor action in ["up", "down", "wait"]:\n    if q[action] > q[best]:\n        best = action\nprint(best, q[best])',
          'down 0.9',
          'The loop keeps the action with the largest Q-value seen so far.',
        ),
        typeOutput(
          'What does this program print?',
          'old, reward, gamma, best_next, alpha = 0.0, 2.0, 0.5, 4.0, 0.25\ntarget = reward + gamma * best_next\nprint(target, old + alpha * (target - old))',
          '4.0 1.0',
          'The target is $2 + 0.5 \\times 4 = 4$, and the estimate moves a quarter of the way from 0 toward it.',
        ),
        choose(
          'What does Q(state, action) estimate?',
          [
            'The immediate reward only',
            'The probability that the action is the best one',
            'The expected return of that action, then acting well',
            'The number of times the action was tried',
          ],
          2,
          'A Q-value includes both the immediate reward and discounted future returns.',
        ),
        choose(
          'In the Q-learning update, what does alpha control?',
          [
            'How heavily future rewards are discounted',
            'How far each estimate moves toward its new target',
            'How often the agent explores',
            'The number of actions',
          ],
          1,
          'alpha is the step size of the update; gamma is the discount.',
        ),
      ],
    },
    {
      title: 'Balance exploration and exploitation; design rewards carefully',
      explanation: [
        'Exploiting chooses the action that currently looks best; exploring tries other actions to learn what they are worth. Epsilon-greedy does both: with probability epsilon it picks a random action, otherwise the greedy one. With n actions, the greedy action’s probability is 1 - epsilon + epsilon / n, and each other action’s is epsilon / n.',
        'The agent maximizes exactly the reward it is given. If the reward is only a proxy for the real goal, the agent may find ways to score highly that miss the goal, so reward design needs care and checking.',
      ],
      example: {
        code: 'epsilon = 0.2\nn_actions = 4\ngreedy = 1 - epsilon + epsilon / n_actions\nother = epsilon / n_actions\nprint(round(greedy, 3), round(other, 3), round(greedy + 3 * other, 3))',
        output: '0.85 0.05 1.0',
        explanation:
          'The greedy action can be chosen deliberately or by the random pick; the other three share only the random pick. The four probabilities add up to 1.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          'epsilon = 0.1\nn_actions = 2\nprint(round(1 - epsilon + epsilon / n_actions, 3), round(epsilon / n_actions, 3))',
          '0.95 0.05',
          'The random pick can also land on the greedy action, adding 0.05 to its 0.9.',
        ),
        choose(
          'What is exploration?',
          [
            'Always choosing the highest current estimate',
            'Removing states from the environment',
            'Trying actions to learn more about their consequences',
            'Copying a teacher’s labels',
          ],
          2,
          'Exploration gathers information that a purely greedy agent would never collect.',
        ),
        typeOutput(
          'The greedy action pays 1.0 on average and the other action pays 0.0. What does this program print?',
          'for epsilon in [0.0, 0.5]:\n    p_greedy = 1 - epsilon + epsilon / 2\n    print(epsilon, p_greedy * 1.0 + (1 - p_greedy) * 0.0)',
          '0.0 1.0\n0.5 0.75',
          'More exploration costs some immediate reward, which is the price of learning about the other action.',
        ),
        choose(
          'A cleaning robot is rewarded for each piece of dirt it collects. It learns to dump dirt and collect it again. What went wrong?',
          [
            'The reward could be maximized without a clean room',
            'The discount factor was too small',
            'The robot explored too little',
            'Q-learning overvalues actions it has repeated often',
          ],
          0,
          'The agent optimized the stated reward, not the intended outcome of a clean room.',
        ),
      ],
    },
  ],
  'ml-deployment-monitoring': [
    {
      title: 'Validate every request against the feature schema',
      explanation: [
        'A deployed model receives data from systems that change. Before predicting, check each request against the schema the model was trained with: every required feature is present, each value converts to the expected type, and each lies in a plausible range. Extra keys can be ignored.',
        'Reject or flag a request that fails these checks instead of letting the pipeline guess. A missing feature silently filled with a default produces a confident but meaningless prediction.',
      ],
      example: {
        code: 'required = ["distance_km", "rain"]\nrecord = {"distance_km": "8.5", "weather": "dry"}\nmissing = [name for name in required if name not in record]\nprint(missing)\ntry:\n    print(float(record["distance_km"]))\nexcept ValueError:\n    print("bad distance")',
        output: "['rain']\n8.5",
        explanation:
          'The request lacks rain, so it should be rejected or flagged. distance_km arrives as text but converts cleanly to a number.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          'required = ["age", "plan", "visits"]\nrecord = {"plan": "pro", "visits": 4, "browser": "x"}\nprint([name for name in required if name not in record])',
          "['age']",
          'Only required names are checked, so the extra browser key is ignored and age is reported missing.',
        ),
        typeOutput(
          'What does this program print?',
          'def parse_age(text):\n    try:\n        age = int(text)\n    except ValueError:\n        return "rejected"\n    if age < 0 or age > 120:\n        return "rejected"\n    return age\n\nprint(parse_age("42"), parse_age("forty"), parse_age("300"))',
          '42 rejected rejected',
          '"forty" fails the conversion, and 300 converts but is outside the plausible range.',
        ),
        choose(
          'A request arrives without the rain feature. What should the serving code do?',
          [
            'Reject or flag the request as invalid',
            'Fill rain with 0 and predict as usual',
            'Retrain the model without rain',
            'Return the previous request’s prediction',
          ],
          0,
          'A silent default changes the input the model sees; failing visibly keeps the problem detectable.',
        ),
        typeOutput(
          'What does this program print?',
          'schema = {"distance_km": float, "items": int}\nrecord = {"distance_km": "3.2", "items": "two"}\nproblems = []\nfor name in ["distance_km", "items"]:\n    try:\n        schema[name](record[name])\n    except ValueError:\n        problems.append(name)\nprint(problems)',
          "['items']",
          'float("3.2") succeeds, but int("two") raises ValueError, so only items is reported.',
        ),
      ],
    },
    {
      title: 'Serve with the stored, versioned pipeline',
      explanation: [
        'Serving must transform inputs exactly as training did, with the same feature order and the same fitted statistics. Recomputing preprocessing on live data, or reordering columns, creates training–serving skew: the model receives numbers it was never trained on.',
        'Save the whole fitted pipeline together with the feature list, the library versions, and a record of the training data. With these, a prediction can be reproduced later and a bad release rolled back.',
      ],
      example: {
        code: 'from sklearn.preprocessing import StandardScaler\ntrain = [[10.0], [20.0], [30.0]]\nscaler = StandardScaler().fit(train)\nlive = [[40.0], [50.0]]\nprint(scaler.transform(live).round(3).tolist())\nprint(StandardScaler().fit_transform(live).round(3).tolist())',
        output: '[[2.449], [3.674]]\n[[-1.0], [1.0]]',
        explanation:
          'The stored scaler shows that live values are far above the training range. Refitting on live data erases that and feeds the model ordinary-looking values.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          'artifact = {"model": "delivery-v3", "features": ["distance_km", "rain"]}\nlive_features = ["rain", "distance_km"]\nprint(len(live_features) == len(artifact["features"]), live_features == artifact["features"])',
          'True False',
          'The same names arrive in a different order. A model reading columns by position would receive rain where it expects distance.',
        ),
        choose(
          'What must stay identical between training and serving?',
          [
            'The hardware and batch size used in training',
            'Feature definitions, order, and fitted preprocessing',
            'The number of requests per day',
            'The training set’s target values',
          ],
          1,
          'The model’s weights only make sense for inputs prepared exactly as in training.',
        ),
        typeOutput(
          'What does this program print?',
          'from sklearn.preprocessing import StandardScaler\nscaler = StandardScaler().fit([[0.0], [4.0]])\nbatch_a = [[2.0]]\nbatch_b = [[2.0], [100.0]]\nprint(scaler.transform(batch_a).tolist(), scaler.transform(batch_b).tolist())',
          '[[0.0]] [[0.0], [49.0]]',
          'The stored scaler treats each row the same way regardless of what else is in the batch, so the value 2.0 always maps to 0.0.',
        ),
        choose(
          'Which item is most important to store alongside the model weights?',
          [
            'The fitted preprocessing and library versions',
            'A screenshot of the training loss',
            'The final validation scores of every epoch',
            'The developer’s notebook state',
          ],
          0,
          'Without the exact preprocessing and versions, the same weights can produce different predictions.',
        ),
      ],
    },
    {
      title: 'Detect shifts in the input distribution',
      explanation: [
        'Covariate shift means the inputs change: live data no longer look like the training data. Compare live summaries with a training reference, such as how many training standard deviations the live mean has moved, or how category shares changed. value_counts(normalize=True) gives each category’s share.',
        'A shift is a warning to investigate, not proof that predictions got worse. The model may still do well on the new inputs, or badly; only outcomes tell.',
      ],
      example: {
        code: 'import numpy as np\ntrain = np.array([5.0, 7.0, 6.0, 8.0, 4.0])\nlive = np.array([9.0, 11.0, 10.0, 12.0])\nshift = (live.mean() - train.mean()) / train.std()\nprint(round(float(shift), 2))',
        output: '3.18',
        explanation:
          'The live mean 10.5 sits more than three training standard deviations above the training mean 6, a large shift worth investigating.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          'import pandas as pd\ntrain = pd.Series(["card", "card", "cash", "card"])\nlive = pd.Series(["cash", "cash", "card", "cash"])\nprint(train.value_counts(normalize=True).to_dict())\nprint(live.value_counts(normalize=True).to_dict())',
          "{'card': 0.75, 'cash': 0.25}\n{'cash': 0.75, 'card': 0.25}",
          'Card payments fall from three quarters of training rows to one quarter of live rows: the input mix has shifted.',
        ),
        choose(
          'The live distribution of an input feature has shifted. What can you conclude right away?',
          [
            'Prediction quality certainly improved',
            'Prediction quality certainly got worse',
            'The inputs changed, and outcomes should be checked when they arrive',
            'The model must be deleted',
          ],
          2,
          'Input monitoring signals risk; only labelled outcomes show whether predictions degraded.',
        ),
        typeOutput(
          'What does this program print?',
          'import numpy as np\ntrain = np.array([20.0, 22.0, 18.0, 20.0])\nfor live in [np.array([21.0, 19.0]), np.array([30.0, 32.0])]:\n    print(round(float((live.mean() - train.mean()) / train.std()), 2))',
          '0.0\n7.78',
          'The first live batch has the training mean, 20; the second sits 11 units, about 7.78 training standard deviations, above it.',
        ),
        choose(
          'What is covariate shift?',
          [
            'A change in the relationship between features and target',
            'A change in the distribution of the input features',
            'A change in the model’s file format',
            'A change in the random seed',
          ],
          1,
          'Covariate shift concerns the inputs; a changed input–target relationship is concept drift.',
        ),
      ],
    },
    {
      title: 'Monitor outcomes over time and across groups',
      explanation: [
        'When true outcomes arrive, join them to the logged predictions and track performance over time, for example the fraction of correct predictions per week. A falling trend with steady inputs points to concept drift: the same inputs now lead to different outcomes.',
        'Also compare groups such as regions or customer types, since an overall average can hide a group that is badly served. Keep the previous version deployable so a bad release can be rolled back quickly.',
      ],
      example: {
        code: 'import pandas as pd\nlog = pd.DataFrame({"week": [1, 1, 1, 2, 2, 2], "predicted": [1, 0, 1, 1, 0, 1], "actual": [1, 0, 1, 0, 1, 1]})\nlog["correct"] = (log["predicted"] == log["actual"]).astype(int)\nprint(log.groupby("week")["correct"].mean().round(3).to_dict())',
        output: '{1: 1.0, 2: 0.333}',
        explanation:
          'Every week-1 prediction was correct, but only one of three in week 2: a drop that calls for investigation.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          'import pandas as pd\nlog = pd.DataFrame({"region": ["N", "N", "S", "S", "S", "N"], "correct": [1, 1, 0, 1, 0, 1]})\nprint(round(float(log["correct"].mean()), 3))\nprint(log.groupby("region")["correct"].mean().round(3).to_dict())',
          "0.667\n{'N': 1.0, 'S': 0.333}",
          'The overall rate of 0.667 hides that every northern prediction was right and two of three southern ones were wrong.',
        ),
        choose(
          'What is concept drift?',
          [
            'A change in how inputs relate to the target',
            'A change in the input distribution alone',
            'A change in the number of requests',
            'Repeating a fixed random seed',
          ],
          0,
          'The same inputs no longer imply the same outcomes, so the learned relationship goes stale.',
        ),
        choose(
          'Input distributions look unchanged, but weekly error has risen steadily since a new competitor launched. What is the likely cause?',
          [
            'Covariate shift only',
            'A bug in the schema check',
            'A larger test set',
            'Concept drift',
          ],
          3,
          'Stable inputs with worsening outcomes point to a changed relationship rather than changed inputs.',
        ),
        choose(
          'A new model version is released, and its weekly error doubles. What should already be in place?',
          [
            'A plan to retrain from scratch on the test set',
            'A way to roll back quickly to the previous version',
            'A larger learning rate',
            'Nothing; wait for the error to recover',
          ],
          1,
          'Keeping the previous, versioned pipeline deployable limits the damage of a bad release.',
        ),
      ],
    },
  ],
};
