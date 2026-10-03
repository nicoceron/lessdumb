# Knowledge graph rules and audit

Audited October 2, 2026 against each skill's lesson, example, questions, reference solution, and displayed tests, and compared structurally with the supplied Math Academy reference graph. Reference data was inspected for structure only.

## Rules

- **An edge means "uses".** A prerequisite names a skill whose rule or construct the dependent lesson, example, or assessment actually uses. Course position, unit order, and topic stage numbers are not reasons for an edge.
- **Direct edges only.** `validateCurriculum` rejects a prerequisite already implied through another prerequisite. Math Academy's graph has about 1% such edges; this catalog had 41%.
- **Stages are display metadata.** `topicId`, `topicTitle`, `stage`, and `stageCount` group four related skills for the graph and lesson header. A topic's concepts require each other only when one builds on another, and its application requires the concepts it uses.
- **Teaching order follows the graph.** `order` keeps the authored sequence but places a same-course prerequisite before its first dependent (`withTeachingOrder`). The validator rejects a skill ordered before its own prerequisite, so the scheduler's lowest-order pick never points backwards.
- **Branching is tested.** For every course with at least 20 skills, the catalog tests require the longest in-course prerequisite chain to cover at most half the course, and a learner choosing the lowest-order ready skill to have at least three choices at the median step.

Rust and C++ keep their edges in one explicit map each (`src/lib/courses/rust/prerequisites.ts`, `src/lib/courses/cpp/prerequisites.ts`). Other courses keep edges next to each skill.

## Before and after

"Ready" is the median number of available skills in a course when a learner always takes the lowest-order ready skill, with supporting courses already complete.

| Course                   | Edges before → after | Longest in-course chain | Median ready |
| ------------------------ | -------------------: | ----------------------: | -----------: |
| Python foundations       |              45 → 30 |                  10 → 9 |        3 → 3 |
| Quantitative foundations |                7 → 8 |                   3 → 2 |        2 → 2 |
| Python for Data Analysis |              48 → 39 |                  15 → 8 |        2 → 3 |
| Machine Learning         |              89 → 56 |                  10 → 9 |        3 → 6 |
| Data Systems             |              42 → 33 |                   7 → 7 |        3 → 3 |
| Competitive Programming  |            683 → 373 |                  20 → 9 |       9 → 28 |
| Rust                     |            145 → 227 |                124 → 15 |       1 → 17 |
| C++                      |            200 → 296 |                116 → 12 |       3 → 30 |
| **Catalog**              |    **1,259 → 1,062** |                         |              |

Redundant edges fell from 523 to 0. Rust and C++ gained edges because the old generators chained each skill to the previous one and omitted most real uses: 55% of Rust's and 52% of C++'s previous-skill edges were false, and dozens of skills used constructs taught only later. Competitive Programming no longer injects `parameters` into every node or chains every concept to its sibling; 231 of its removed edges named skills that are no longer ancestors at all.

## Mathematics for ML (CEN-82)

Machine Learning and Data Analysis used mathematics that no skill taught. Quantitative foundations now has 36 single-idea skills in five units, and each ML or DA skill names the math it uses:

- **Describe data:** means, variance, medians, percentiles and quartiles, covariance, correlation.
- **Model uncertainty:** probability, random variables and expected value, variance of a random variable, Bernoulli and binomial distributions, the normal distribution, sampling, likelihood.
- **Functions and growth:** functions and graphs, exponents and e, logarithms, the sigmoid, softmax.
- **Derivatives and optimization:** rate of change, power rule, sum and product rules, chain rule, partial derivatives, the gradient vector, gradient descent steps, critical points, convexity.
- **Vectors and matrices:** vectors and dot products, norms, distance, cosine similarity, matrices and transposes, matrix–vector and matrix–matrix products, identity and inverse, eigenvectors for PCA.

| Course                   |  Skills | Edges before → after | Longest in-course chain | Median ready |
| ------------------------ | ------: | -------------------: | ----------------------: | -----------: |
| Quantitative foundations |  5 → 36 |               8 → 48 |                   2 → 8 |        2 → 4 |
| Python for Data Analysis |      24 |              39 → 42 |                       8 |            3 |
| Machine Learning         | 28 → 29 |              56 → 72 |                       9 |            6 |
| **Catalog**              | **641** |    **1,062 → 1,121** |                         |              |

| Skill                       | New direct prerequisites                                |
| --------------------------- | ------------------------------------------------------- |
| `ml-linear-regression`      | `math-matrix-vector` (replaces `math-vectors`)          |
| `ml-gradient-descent`       | `math-convexity`                                        |
| `ml-regularization`         | `ml-overfitting`, `math-vector-norm`                    |
| `ml-logistic-regression`    | `math-sigmoid`                                          |
| `ml-svm`, `ml-clustering`   | `math-distance` (replaces `math-vectors` in clustering) |
| `ml-ensembles`              | `math-sampling`, `math-correlation`                     |
| `ml-pca`                    | `math-eigenvectors` (replaces `math-vectors`)           |
| `ml-anomaly-detection`      | `math-normal-distribution`                              |
| `ml-neural-layers`          | `math-matrix-multiplication`, `math-softmax`            |
| `ml-training-deep-networks` | `math-random-variables`                                 |
| `ml-keras-workflow`         | `math-likelihood`                                       |
| `ml-generative-models`      | `math-sampling`                                         |
| `ml-reinforcement-learning` | `math-random-variables` (replaces `math-probability`)   |
| `ml-deployment-monitoring`  | `math-sampling`, `ml-classification-metrics`            |
| `da-aggregations`           | `math-median`                                           |
| `da-exploration`            | `math-percentiles`, `math-correlation`                  |

Edges stay direct, so some uses arrive through another prerequisite: `ml-backpropagation` reaches the chain rule through `ml-gradient-descent` → `math-gradients` → `math-gradient-vector` → `math-partial-derivatives`; `ml-attention` and `ml-keras-workflow` reach softmax and matrix multiplication through `ml-neural-layers`; `ml-training-deep-networks` reaches norms through `ml-regularization`.

Overfitting is now its own skill, `ml-overfitting`, which depends only on `ml-baselines`. `ml-decision-trees` depends on it instead of `ml-regularization`, so trees no longer reach calculus. Every quantitative skill has knowledge points: 116 points and 464 questions. The 61 output questions and 43 runnable worked examples execute in Pyodide; the other 73 worked examples are calculations shown as text. Ten skills keep a Python exercise where computing is the point (mean, variance, probability, gradient steps, dot products, norms, distance, cosine similarity, covariance, correlation); the other 26 are assessed with choices only.

## Known gaps

Edges cannot fix content. These items are the backlog for new concept nodes and lesson rewrites.

**Constructs used but taught nowhere** (number of skills that first use them):

- Python: tuples (32), `min`/`max` (15), truthiness (12), `[x] * n` (11), conditional expressions (9), `zip`/`enumerate`/generator expressions (19 combined), sorting and `key=`/`lambda` (10), imports and standard-library modules (11), classes and objects (4), `break`/`continue` (4), sets, recursion, bitwise operators.
- Quantitative foundations: the original five lessons' examples and exercises use `sum()` and `round()`, which Python foundations does not teach; their knowledge points use loops instead. Several ML lessons call `math.exp` and `math.log` (imports, above).
- Rust: `{:?}`, `assert!`/`assert_eq!`, `.unwrap()` (12), `.copied()` (10), `Option`/`Result` query methods (8), `?` on `Option` (6), turbofish (6), early `return` (5), `TryFrom`/`TryInto` (5), tuple structs (5), `while`/`while let`, `VecDeque`.
- C++: `&&`/`||`/`!` (28), `?:` (26), range-for (13), `std::array` (8), const member functions, type traits, structured bindings, `break`/`continue`, bit shifts, fixed-width integers.

**Content that contradicts its own edges:**

- Rust: `rust-main`, `rust-format`, and `rust-returns` use typed parameters, `&str`, or `&'static str` before the nodes that teach them; `rust-future-ready` uses `pin!` before `rust-future-pin`. `rust-test-contract` and `rust-package-name` do not exercise their stated rules (`#[test]`, package names). Building maps and sets with `collect` puts every collection behind closures and iterators.
- C++: `cpp-functions` sums a `std::vector` although vectors depend on it; `cpp-while-progress` teaches `while` with a `do-while` example; `cpp-arithmetic` never teaches `%`, which 12 later skills use.
- Competitive Programming: `cp-grid-component` (flood fill) and `cp-bit-submask-step` are not used by their applications, so they remain leaves. Brute-force solutions passed all 32 application assessments tried, because inputs are small.
