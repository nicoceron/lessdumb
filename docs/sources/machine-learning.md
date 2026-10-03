# Machine Learning curriculum

This is an original introductory course informed by the subject outline and selected sections of the user-supplied **Hands-On Machine Learning with Scikit-Learn, Keras, and TensorFlow**, third edition, Aurélien Géron. The book's table of contents and sections on evaluation, gradients, transfer learning, convolution, forecasting, attention, generative models, and reinforcement learning were inspected. It is a source of topic organization, not an imported textbook or a claim to cover every book exercise.

All lesson paragraphs, synthetic data, examples, assessment prompts, solutions, test assertions, and flashcards were authored for lessdumb. No book pages, figures, paragraphs, downloaded datasets, or textbook exercises are shipped. Instructions and external-service suggestions appearing in the source are treated as source material, not as user commands.

## Scope

The course has 29 skills in seven units, 116 assessment questions, 21 executable exercises, and 58 mastery flashcards. Every skill has four distinct questions and two flashcards. The overfitting skill and the seven architecture/workflow skills use a choice-only mastery/review policy, while executable skills require both code and choice evidence.

| Unit                      | Skills                                                                                 | Source topics                                                   |
| ------------------------- | -------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| Frame an ML project       | Learning tasks, splits, baselines, preprocessing                                       | ML landscape and end-to-end projects, chapters 1-2              |
| Fit predictive models     | Linear regression, gradient descent, regularization, logistic regression               | Training models, chapter 4                                      |
| Measure what matters      | Overfitting, classification metrics, cross-validation, hyperparameter search           | Classification and model selection, chapters 2-3                |
| Discover structure        | SVM, decision trees, ensembles, PCA, clustering, anomalies                             | Chapters 5-9                                                    |
| Train neural networks     | Dense layers, backpropagation, training stability, Keras workflow                      | Chapters 10-13                                                  |
| Choose deep architectures | Convolution, sequences, attention, transfer, generative models, reinforcement learning | Chapters 11 and 14-18                                           |
| Operate an ML system      | Feature contracts, reproducibility, drift, monitoring                                  | End-to-end maintenance and deployment themes, chapters 2 and 19 |

## Execution contract

Pure-Python exercises cover data splits, losses, thresholds, metrics, gradients, ensemble averaging, impurity, centroid distance, anomaly alerts, and feature presence. NumPy exercises cover scaling, dense-layer arithmetic, and gradient clipping. scikit-learn exercises and demonstrations use real `LinearRegression`, `StandardScaler`, `SVC`, `PCA`, `DecisionTreeClassifier`, pipelines, and cross-validation. Estimators and evaluation calls with supported parallel settings explicitly use `n_jobs=1`. The small datasets are original and embedded; examples do not fetch external datasets.

The browser runtime uses the official Pyodide package builds supplied by the project, including NumPy and scikit-learn. TensorFlow and Keras training are not supported by this browser runtime. Keras workflow, CNN, sequence-model, attention, transfer-learning, generative-model, and RL lessons explicitly describe their conceptual scope. Their executable examples use ordinary Python arithmetic to demonstrate a related idea; those examples are never presented as framework training or deep-model execution. Their assessments use original choice questions rather than pretending to grade an unavailable framework.

## Knowledge graph

This course is part of the shared graph, not an isolated lesson list. Its external prerequisite edges reference:

- Python: dictionaries, functions, return values, slicing, loops, boolean logic, conditionals, indexing, and errors.
- Data Analysis: `da-dataframes`, `da-arrays`, `da-missing-values`, and `da-groupby`.
- Quantitative Foundations: the statistics, probability, sigmoid/softmax/likelihood, calculus, and linear-algebra skills each ML skill uses, such as `math-sigmoid`, `math-convexity`, `math-matrix-multiplication`, `math-distance`, `math-eigenvectors`, and `math-sampling`. [The knowledge graph notes](../knowledge-graph.md#mathematics-for-ml-cen-82) list every edge.

Within the course, graph branches allow learners to pursue classification evaluation, tree ensembles, or unsupervised structure after their actual prerequisites. Neural arithmetic depends on vector operations and linear models; backpropagation depends on gradients. Deep architecture nodes depend on these foundations. Production monitoring combines evaluation, ensemble knowledge, and neural workflow literacy. The same global skill identifiers support unlocking, prerequisite paths, adaptive practice, spaced review, and Anki generation across courses.

## Documentation checked

API behavior was checked against primary documentation before writing framework tasks:

- [scikit-learn LinearRegression](https://scikit-learn.org/stable/modules/generated/sklearn.linear_model.LinearRegression.html)
- [scikit-learn make_pipeline](https://scikit-learn.org/stable/modules/generated/sklearn.pipeline.make_pipeline.html)
- [scikit-learn cross_val_score](https://scikit-learn.org/stable/modules/generated/sklearn.model_selection.cross_val_score.html)
- [scikit-learn PCA](https://scikit-learn.org/stable/modules/generated/sklearn.decomposition.PCA.html)
- [NumPy linear algebra documentation](https://numpy.org/doc/stable/reference/generated/numpy.linalg.lstsq.html)
- [Keras training APIs](https://keras.io/api/models/model_training_apis/)
- [Keras transfer learning guide](https://keras.io/guides/transfer_learning/)

## Validation

Every one of the 28 published example outputs and all 21 exercise solutions were executed with the real vendored Pyodide runtime and its official NumPy/scikit-learn packages. Empty submissions were checked against every exercise assertion set and rejected. The cross-validation example takes the absolute magnitude of scikit-learn's negative-loss score so exact zero prints consistently as `0.0`, avoiding a platform-dependent `-0.0` representation.
