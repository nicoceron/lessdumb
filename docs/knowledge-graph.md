# Knowledge graph rules and audit

Audited October 2, 2026 against each skill's lesson, example, questions, reference solution, and displayed tests, and compared structurally with the supplied Math Academy reference graph. Reference data was inspected for structure only.

## Rules

- **An edge means "uses".** A prerequisite names a skill whose rule or construct the dependent lesson, example, or assessment actually uses. Course position, unit order, and topic stage numbers are not reasons for an edge.
- **Direct edges only.** `validateCurriculum` rejects a prerequisite already implied through another prerequisite. Math Academy's graph has about 1% such edges; this catalog had 41%.
- **Stages are display metadata.** `topicId`, `topicTitle`, `stage`, and `stageCount` group four related skills for the graph and lesson header. A topic's concepts require each other only when one builds on another, and its application requires the concepts it uses.
- **Teaching order follows the graph.** `order` keeps the authored sequence but places a same-course prerequisite before its first dependent (`withTeachingOrder`). The validator rejects a skill ordered before its own prerequisite, so the scheduler's lowest-order pick never points backwards.
- **Branching is tested.** For every course with at least 20 skills, the catalog tests require the longest in-course prerequisite chain to cover at most half the course, and a learner choosing the lowest-order ready skill to have at least three choices at the median step.

Rust and C++ keep their edges in one explicit map each (`src/lib/courses/rust/prerequisites.ts`, `src/lib/courses/cpp/prerequisites.ts`). Other courses keep edges next to each skill.

## How the browser loads the catalog

The graph and the lessons are loaded separately (CEN-108). Before, every page downloaded the whole curriculum in one 5.5 MB chunk (1.45 MB gzipped).

- **Graph index, always loaded.** `src/lib/catalog-index.ts` exports every course, unit, and skill _outline_ (`SkillOutline`): title, summary, course, unit, prerequisites, order, stages, estimated minutes, assessment policy, and the IDs and types of its knowledge points, questions, and cards, but no lesson text. The scheduler, the graph, Learn, Courses, state merging, and validation run on it synchronously. On the server and in tests the module derives the index from the full curriculum. For the browser bundle, `scripts/catalog-index-plugin.mjs` (registered in `astro.config.mjs`) loads that module at build time, encodes the index as compact JSON (point and card IDs are generated from position, so counts recreate them), and substitutes it. `tests/catalog-index.test.ts` checks that the shipped index equals what the full curriculum derives and that the engine plans an outline exactly as the full skill.
- **Content, one unit at a time.** `src/lib/content/<course>.ts` combines a course module from `src/lib/courses/` with its `*.kp.ts` files; the server and the tests use these modules. For the browser, the same plugin derives one content part per unit at build time and serves it in place of `src/lib/content/parts.ts`: each unit's skills, with their lessons, points, exercises, and cards, become a JSON module reached only by a dynamic `import()`, so each unit is its own chunk, `content-<unit>.<hash>.js`, hashed from that unit's content alone (CEN-126). `src/lib/content/index.ts` loads parts and caches them in memory: `loadSkill(skill)` and `loadSkills(skills)` download only the units holding those skills, `loadCourseContent(courseId)` downloads every unit of a course, and `loadedSkill(id)` and `contentOf(outline)` read what is loaded. The lesson and quiz sessions wait for the units of their skills (`useSkillContent`); the placement test, which asks about a whole course path, waits for whole courses (`useCourseContent`). They show "Loading the lesson…" meanwhile. Merged account progress can complete a skill's mastery; its cards are queued once that skill's unit has loaded. `tests/catalog-index.test.ts` checks that the shipped units hold every skill exactly once, as the server derives it.
- **Server-only curriculum.** `src/lib/curriculum.ts` holds the types and the full catalog for the server, the tests, and the build. Browser code may only `import type` from it; the build fails if a client module imports it.
- **Code tools on demand.** The code editor (`src/components/code-editor.tsx`) loads CodeMirror only when an exercise or the Code lab shows an editor, and each language's grammar on first use. ReUI `CodeBlock` renders plain text at once and highlights it after Shiki and the block's language grammar load, in the same box, so nothing moves.

Engine functions are typed on `SkillOutline` and return content when given a full `Skill`: `selectQuestion(progress, outline, mode)` returns a question reference for scheduling, and the same call with a loaded skill returns the question to render.

Content chunks are content-addressed `/_astro/` static assets, served by Cloudflare's asset layer with a one-year immutable cache, and they import nothing, so a deploy that does not change a unit keeps its chunk URL and returning learners keep it cached. Editing a unit changes that unit's chunk only, among content chunks. The table of chunk URLs lives in the main shared chunk with the index, so that chunk and the application chunks that import it get new URLs on any content edit; moving the index into its own chunk would not avoid this, because the URL table changes with every content edit anyway.

Gzipped JavaScript (gzip level 9), measured with `npm run build`: the dashboard's first visit (every chunk its entry scripts import), then what opening each course's first lesson downloads beyond it: the lesson session, the lesson's content, and the highlighter with the course language's grammar. None of these first lessons has math, so KaTeX's 76 KB chunk is not included. "Before" is `main` at a32586b; CEN-108 had cut the first visit from 1,596 KB.

| Download                                     |  Before |           After |
| -------------------------------------------- | ------: | --------------: |
| First visit to `/` (all JavaScript)          |  244 KB |          245 KB |
| First Python foundations lesson              | +406 KB |          +99 KB |
| First Competitive Programming lesson         | +640 KB |         +120 KB |
| First C++ lesson                             | +645 KB |         +171 KB |
| First Rust lesson                            | +559 KB |         +131 KB |
| Code editor, added when the exercise appears |  +22 KB | +156 to +171 KB |

Before CEN-126, the 207 KB `code-block` chunk was mostly CodeMirror: `src/lib/code-language.ts` imported the Python, Rust, and C++ editor grammars statically, so every lesson downloaded them with the shared session code even before an editor appeared. Shiki itself already loaded lazily. Content chunks now range from 5 KB to 65 KB (Rust's Model values and failures unit); whole courses were 64 KB to 352 KB.

## Before and after

"Ready" is the median number of available skills in a course when a learner always takes the lowest-order ready skill, with supporting courses already complete.

| Course                   | Edges before → after → now | Longest in-course chain | Median ready |
| ------------------------ | -------------------------: | ----------------------: | -----------: |
| Python foundations       |               45 → 30 → 74 |             10 → 9 → 12 |    3 → 3 → 6 |
| Quantitative foundations |                 7 → 8 → 49 |               3 → 2 → 8 |    2 → 2 → 4 |
| Python for Data Analysis |               48 → 39 → 44 |              15 → 8 → 8 |    2 → 3 → 3 |
| Machine Learning         |               89 → 56 → 82 |              10 → 9 → 9 |    3 → 6 → 6 |
| Data Systems             |               42 → 33 → 33 |               7 → 7 → 7 |    3 → 3 → 3 |
| Competitive Programming  |            683 → 373 → 443 |              20 → 9 → 9 |  9 → 28 → 28 |
| Rust                     |            145 → 227 → 261 |           124 → 15 → 18 |  1 → 17 → 17 |
| C++                      |            200 → 296 → 383 |           116 → 12 → 12 |  3 → 30 → 32 |
| **Catalog**              |  **1,259 → 1,062 → 1,369** |                         |              |

"Now" adds the nodes that teach what lessons used without teaching: Python idioms (CEN-81), the mathematics layer for ML (CEN-82, below), Rust basics (CEN-84), and C++ basics (CEN-85). The catalog now has 710 skills. For Python: 24 skills for constructs that lessons used without teaching, such as tuples, unpacking, built-ins, truthiness, sorting keys, sets, imports, heaps, and classes. Every skill whose lesson, example, questions, or solution uses one of them now names it directly, and prerequisites that became implied were removed. Writing knowledge points for every foundation skill also exposed three missing edges, now added: `strings` repeats text with `*` from `numbers`, `lists` relies on `==` from `comparisons` for membership and equality, and `parameters` uses the `is None` default idiom from `truthiness`.

For Rust, 17 basics were added, and every lesson using them now depends on them. Redundant edges fell from 523 to 0. Rust and C++ gained edges because the old generators chained each skill to the previous one and omitted most real uses: 55% of Rust's and 52% of C++'s previous-skill edges were false, and dozens of skills used constructs taught only later. Competitive Programming no longer injects `parameters` into every node or chains every concept to its sibling; 231 of its removed edges named skills that are no longer ancestors at all.

## Mathematics for ML (CEN-82)

Machine Learning and Data Analysis used mathematics that no skill taught. Quantitative foundations now has 36 single-idea skills in five units, and each ML or DA skill names the math it uses:

- **Describe data:** means, variance, medians, percentiles and quartiles, covariance, correlation.
- **Model uncertainty:** probability, random variables and expected value, variance of a random variable, Bernoulli and binomial distributions, the normal distribution, sampling, likelihood.
- **Functions and growth:** functions and graphs, exponents and e, logarithms, the sigmoid, softmax.
- **Derivatives and optimization:** rate of change, power rule, sum and product rules, chain rule, partial derivatives, the gradient vector, gradient descent steps, critical points, convexity.
- **Vectors and matrices:** vectors and dot products, norms, distance, cosine similarity, matrices and transposes, matrix–vector and matrix–matrix products, identity and inverse, eigenvectors for PCA.

| Course                   | Skills before → after |
| ------------------------ | --------------------: |
| Quantitative foundations |                5 → 36 |
| Machine Learning         |               28 → 29 |

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

Since the audit, C++ gained seven four-skill topics for constructs it used without teaching (logical and conditional operators, fixed arrays and range-based loops, characters and type traits, bit operations, member functions and `const`, pairs and structured bindings, and `std::chrono`). Every dependent now names the skill it uses: C++ has 208 skills and 383 direct edges, its longest in-course chain is still 12, and the median ready count is 32.

## Known gaps

Edges cannot fix content. These items are the backlog for new concept nodes and lesson rewrites.

**Constructs used but taught nowhere** (number of skills that first use them):

- Python: decorators (`@cache` in `cp-memoization`, whose lesson describes `functools.cache` but not decorator syntax), argument unpacking with `zip(*rows)` (`ml-ensembles`), and set operations on `dict.keys()` (`ml-deployment-monitoring`).
- Quantitative foundations: the original five lessons' examples and exercises use `sum()` and `round()`, which Python foundations does not teach; their knowledge points use loops instead. Several ML lessons call `math.exp` and `math.log` (imports, above).
- C++: generic lambdas and `decltype`/`std::decay_t` (`cpp-optional`, `cpp-tie-break-order`), `mutable` lambdas (`cpp-callbacks`), and single uses of `std::count_if`, `std::reverse`, `std::abs`, and `std::to_string`. `cpp-elapsed-duration` still subtracts raw `long long` timestamps instead of using the `std::chrono` skills.

**Closed since the audit:**

- C++ teaches the basics lessons used without teaching: logical operators and `?:`, range-for with `std::array`, `break`/`continue`, `char`, `sizeof`, fixed-width integers, type traits, bit operations, member functions and `const`, pairs and structured bindings, and `std::chrono`. `cpp-arithmetic` teaches `%`, `cpp-while-progress` uses a real `while`, and `cpp-functions` no longer sums a vector before vectors are taught.
- Machine Learning has a mathematics layer: 31 quantitative-foundations skills cover statistics, probability, exponentials and logarithms, sigmoid and softmax, derivatives and the chain rule, gradients, vectors, matrices, covariance and eigenvectors, and ML and Data Analysis skills depend on the ones they use. `ml-decision-trees` now depends on a separate `ml-overfitting` skill instead of reaching calculus through regularization.
- Rust now teaches every construct listed in the original audit before a lesson uses it: Debug formatting, `#[derive(Debug, Clone, PartialEq)]`, `const`, `while`, early `return`, tuple structs, turbofish, `From`/`Into`, `TryFrom`/`TryInto`, `.copied()`/`.cloned()`, `Option`/`Result` query methods, `.unwrap()`/`.expect()`, `?` on `Option`, `while let`, `VecDeque`, `assert!`/`assert_eq!`, and `#[test]`/`#[cfg(test)]`. `rust-main`, `rust-returns`, `rust-format`, and `rust-match` use only what precedes them; `rust-future-ready` polls through `Pin::new` and leaves pinning to `rust-future-pin`; `rust-cow` uses `to_mut`; `rust-test-contract` and `rust-package-name` exercise test modules and `Cargo.toml` names; maps and sets are built with `insert` loops, so they no longer depend on iterators.
- Competitive Programming has no dead-end concepts. `cp-grids` now counts islands by flood-filling each undiscovered land cell (it requires `cp-grid-component`), and `cp-bitmasks` keeps a selection mask with set and clear changes and walks its submasks (it requires `cp-bit-submask-step`). The test exception for these two leaves is removed; every concept stage is an ancestor of its application.
- Brute force no longer passes Competitive Programming assessments. 37 applications and 4 concept stages end with a hidden deterministic large case that must finish within 3 seconds on the reference machine (1.5 for the sieve), scaled by the device's measured speed (CEN-115), and six exercises disable the library shortcut they teach (bisect, itertools combinatorics, `math.gcd`/`lcm`, three-argument `pow`, `math.comb`/`perm`/`factorial`, and `**` for recursive powers). `tests/competitive-assessments.test.ts` runs 48 brute-force and shortcut solutions, mostly from the audit, and requires each to fail.
