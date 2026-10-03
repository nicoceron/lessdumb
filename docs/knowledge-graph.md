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
- **Content, one unit at a time.** `src/lib/content/<course>.ts` combines a course module from `src/lib/courses/` with its `*.kp.ts` files; the server and the tests use these modules. For the browser, the same plugin derives one content part per unit at build time and serves it in place of `src/lib/content/parts.ts`: each unit's skills, with their lessons, points, exercises, and cards, become a JSON module reached only by a dynamic `import()`, so each unit is its own chunk, `content-<unit>.<hash>.js`, hashed from that unit's content alone (CEN-126). JSON holds no functions, so a unit with generated questions also imports its course's `*.gen.ts` generator modules, a shared chunk per course, and attaches them by question ID (`attachGenerators`, CEN-112). `src/lib/content/index.ts` loads parts and caches them in memory: `loadSkill(skill)` and `loadSkills(skills)` download only the units holding those skills, `loadCourseContent(courseId)` downloads every unit of a course, and `loadedSkill(id)` and `contentOf(outline)` read what is loaded. The lesson and quiz sessions wait for the units of their skills (`useSkillContent`); the placement test, which asks about a whole course path, waits for whole courses (`useCourseContent`). They show "Loading the lesson…" meanwhile. Cards in a learner's state are references, so recording an answer or merging progress queues them without content; the Flashcards page loads the units of the cards it shows, and Anki sync and the TSV export load the units of the cards they send (`src/lib/cards.ts`). `tests/catalog-index.test.ts` checks that the shipped units hold every skill exactly once, as the server derives it.
- **Server-only curriculum.** `src/lib/curriculum.ts` holds the types and the full catalog for the server, the tests, and the build. Browser code may only `import type` from it; the build fails if a client module imports it.
- **Code tools on demand.** The code editor (`src/components/code-editor.tsx`) loads CodeMirror only when an exercise or the Code lab shows an editor, and each language's grammar on first use. ReUI `CodeBlock` renders plain text at once and highlights it after Shiki and the block's language grammar load, in the same box, so nothing moves.

Engine functions are typed on `SkillOutline` and return content when given a full `Skill`: `selectQuestion(progress, outline, mode)` returns a question reference for scheduling, and the same call with a loaded skill returns the question to render.

Content chunks are content-addressed `/_astro/` static assets, served by Cloudflare's asset layer with a one-year immutable cache, and they import nothing but, for a unit with generated questions, its course's generator chunk (CEN-112: 9 KB gzipped for quantitative foundations, 9 KB for Competitive Programming, 4 KB for Python foundations, plus 1 KB of shared helpers), so a deploy that does not change a unit keeps its chunk URL and returning learners keep it cached. A generator edit changes its course's generator chunk and the URLs of the units that import it. Editing a unit changes that unit's chunk only, among content chunks. The table of chunk URLs lives in the main shared chunk with the index, so that chunk and the application chunks that import it get new URLs on any content edit; moving the index into its own chunk would not avoid this, because the URL table changes with every content edit anyway.

Gzipped JavaScript (gzip level 9), measured with `npm run build`: the dashboard's first visit (every chunk its entry scripts import), then what opening a lesson downloads beyond it: the lesson session, the lesson's content, and the highlighter with the course language's grammar. None of the first lessons below has math, so KaTeX's 76 KB chunk is not in their rows; the "any lesson" row adds it to each course's largest content download and reports the largest course. "Before" is `main` at e19c12c; CEN-108 had cut the first visit from 1,596 KB.

| Download                                     |  Before |           After |
| -------------------------------------------- | ------: | --------------: |
| First visit to `/` (all JavaScript)          |  248 KB |          250 KB |
| First Python foundations lesson              | +405 KB |         +100 KB |
| First Competitive Programming lesson         | +632 KB |         +121 KB |
| First C++ lesson                             | +648 KB |         +172 KB |
| First Rust lesson                            | +550 KB |         +131 KB |
| Any lesson, at most (C++, with KaTeX)        | +725 KB |         +273 KB |
| Code editor, added when the exercise appears |  +22 KB | +156 to +171 KB |

Before CEN-126, the 207 KB `code-block` chunk was mostly CodeMirror: `src/lib/code-language.ts` imported the Python, Rust, and C++ editor grammars statically, so every lesson downloaded them with the shared session code even before an editor appeared. Shiki itself already loaded lazily. Unit chunks range from 5 KB to 63 KB (Rust's Model values and failures unit); course chunks were 62 KB to 342 KB.

## Before and after

"Ready" is the median number of available skills in a course when a learner always takes the lowest-order ready skill, with supporting courses already complete.

| Course                   | Edges before → after → now | Longest in-course chain | Median ready |
| ------------------------ | -------------------------: | ----------------------: | -----------: |
| Python foundations       |               45 → 30 → 77 |             10 → 9 → 13 |    3 → 3 → 6 |
| Quantitative foundations |                 7 → 8 → 51 |               3 → 2 → 8 |    2 → 2 → 4 |
| Python for Data Analysis |               48 → 39 → 44 |              15 → 8 → 8 |    2 → 3 → 3 |
| Machine Learning         |               89 → 56 → 84 |              10 → 9 → 9 |    3 → 6 → 6 |
| Data Systems             |               42 → 33 → 34 |               7 → 7 → 7 |    3 → 3 → 3 |
| Competitive Programming  |            683 → 373 → 444 |              20 → 9 → 9 |  9 → 28 → 27 |
| Rust                     |            145 → 227 → 265 |           124 → 15 → 18 |  1 → 17 → 17 |
| C++                      |            200 → 296 → 404 |           116 → 12 → 12 |  3 → 30 → 32 |
| **Catalog**              |  **1,259 → 1,062 → 1,403** |                         |              |

"Now" adds the nodes that teach what lessons used without teaching: Python idioms (CEN-81), the mathematics layer for ML (CEN-82, below), Rust basics (CEN-84), C++ basics (CEN-85), and the last constructs from the audit (CEN-114, below). The catalog now has 720 skills. For Python: 24 skills for constructs that lessons used without teaching, such as tuples, unpacking, built-ins, truthiness, sorting keys, sets, imports, heaps, and classes. Every skill whose lesson, example, questions, or solution uses one of them now names it directly, and prerequisites that became implied were removed. Writing knowledge points for every foundation skill also exposed three missing edges, now added: `strings` repeats text with `*` from `numbers`, `lists` relies on `==` from `comparisons` for membership and equality, and `parameters` uses the `is None` default idiom from `truthiness`.

For Rust, 17 basics were added, and every lesson using them now depends on them. Redundant edges fell from 523 to 0. Rust and C++ gained edges because the old generators chained each skill to the previous one and omitted most real uses: 55% of Rust's and 52% of C++'s previous-skill edges were false, and dozens of skills used constructs taught only later. Competitive Programming no longer injects `parameters` into every node or chains every concept to its sibling; 231 of its removed edges named skills that are no longer ancestors at all.

## Mathematics for ML (CEN-82)

Machine Learning and Data Analysis used mathematics that no skill taught. Quantitative foundations now has 37 single-idea skills in five units, and each ML or DA skill names the math it uses:

- **Describe data:** means, variance, medians, percentiles and quartiles, covariance, correlation.
- **Model uncertainty:** probability, random variables and expected value, variance of a random variable, Bernoulli and binomial distributions, the normal distribution, sampling, likelihood.
- **Functions and growth:** functions and graphs, exponents and e, logarithms, computing them with `math.exp` and `math.log` (CEN-114), the sigmoid, softmax.
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

Overfitting is now its own skill, `ml-overfitting`, which depends only on `ml-baselines`. `ml-decision-trees` depends on it instead of `ml-regularization`, so trees no longer reach calculus. Every quantitative skill has knowledge points: 119 points and 476 questions. The 70 output questions and 45 runnable worked examples execute in Pyodide; the other 74 worked examples are calculations shown as text. Eleven skills keep a Python exercise where computing is the point (mean, variance, probability, gradient steps, dot products, norms, distance, cosine similarity, covariance, correlation, and `math.exp`/`math.log`); the other 26 are assessed with choices only.

Since the audit, C++ gained seven four-skill topics for constructs it used without teaching (logical and conditional operators, fixed arrays and range-based loops, characters and type traits, bit operations, member functions and `const`, pairs and structured bindings, and `std::chrono`). Every dependent now names the skill it uses: C++ has 208 skills and 383 direct edges, its longest in-course chain is still 12, and the median ready count is 32.

## Teaching the remaining constructs (CEN-114)

The audit's last untaught constructs now have a skill, or the lesson stopped using them. Ten new skills each have knowledge points, an executable exercise, and two cards, and every skill that uses one names it directly unless another prerequisite already implies it:

| New skill              | Course                   | Teaches                                                                      | Direct dependents                                                                                      |
| ---------------------- | ------------------------ | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `decorators`           | Python foundations       | `@deco` as `f = deco(f)`, `functools.cache`, caching a recursion             | `cp-memoization` (replaces `imports`)                                                                  |
| `math-exp-log`         | Quantitative foundations | `math.exp`, `math.e`, `math.log` and its bases, `ValueError`, adding logs    | `ml-logistic-regression`                                                                               |
| `cpp-abs-value`        | C++                      | `std::abs` and the distance `std::abs(a - b)`                                | `cpp-testing` (replaces `cpp-explicit-casts`), `cpp-digit-palindrome`                                  |
| `cpp-to-string`        | C++                      | `std::to_string`, and why `text += 65` appends one character                 | `cpp-protocol` (replaces `cpp-string-append`), `cpp-digit-palindrome`                                  |
| `cpp-reverse-range`    | C++                      | in-place `std::reverse` of whole and partial ranges                          | `cpp-property-test` (replaces `cpp-iterator-range` and `cpp-independent-copy`), `cpp-digit-palindrome` |
| `cpp-digit-palindrome` | C++                      | the topic's application: a sign-free numeric palindrome check                | none                                                                                                   |
| `cpp-auto-parameters`  | C++                      | generic lambdas with `auto` and `const auto&` parameters                     | `cpp-tie-break-order`, `cpp-decltype-decay`                                                            |
| `cpp-decltype-decay`   | C++                      | `decltype`, `std::decay_t`, and branching on `std::is_same_v`                | `cpp-optional` (replaces `cpp-lambda-value-capture`), `cpp-generic-lambdas`                            |
| `cpp-mutable-lambda`   | C++                      | `mutable` by-value captures, reference captures instead, and copied closures | `cpp-callbacks`, `cpp-generic-lambdas`                                                                 |
| `cpp-generic-lambdas`  | C++                      | the topic's application: one stateful generic lambda across argument types   | none                                                                                                   |

The C++ skills form two four-skill topics: "Magnitudes, digit text, and reversal" in the strings-and-vectors unit and "Generic and stateful lambdas" in the generic-code unit. C++ now has 216 skills in 54 topics and 404 edges; its longest in-course chain is still 12 and its median ready count 32. Python foundations' longest chain grows from 12 to 13, because `decorators` builds on recursion and sorting keys.

The other gaps needed no new skill:

- `ml-ensembles` averages each observation with an index loop, as its knowledge points already did, instead of transposing with `zip(*rows)`. `ml-deployment-monitoring` finds missing features with a list comprehension and `set()` instead of set operations on `dict.keys()`.
- `sum()` and `round()` are taught by `number-builtins`, which every quantitative lesson that uses them reaches through `math-mean`. `ml-data-splits`, whose knowledge points compute class shares with `sum(labels) / len(labels)`, now depends on `number-builtins` directly.
- `ml-svm`, `ml-backpropagation`, `ml-keras-workflow`, and `ml-generative-models` call `math.exp` or `math.log` and reach `math-exp-log` through `ml-logistic-regression`, so a direct edge would be redundant.
- `std::count_if` is taught by the first knowledge point of `cpp-lambda-predicate`, its only user.
- `cpp-elapsed-duration` subtracts `steady_clock` time points and reports with `duration_cast`. Its exercise takes time points, its knowledge points were rewritten to match, and it depends on `cpp-chrono` and `cpp-if-branches` instead of `cpp-arithmetic` and `cpp-conditional-operator`.

## Known gaps

Edges cannot fix content. These items are the backlog for new concept nodes and lesson rewrites.

**Constructs used but taught nowhere:** none known. Every construct the audit listed is now taught by a skill its users depend on, or no longer used (CEN-114, above). Record new findings here.

**Closed since the audit:**

- Python teaches decorators and `functools.cache` (`decorators`, required by `cp-memoization`). `ml-ensembles` no longer transposes with `zip(*rows)`, and `ml-deployment-monitoring` no longer subtracts `dict.keys()` from a set. Quantitative foundations teaches `math.exp` and `math.log` (`math-exp-log`, required by `ml-logistic-regression` and reached by every other ML lesson that calls them), and `ml-data-splits` depends on `number-builtins` for `sum()`.
- C++ teaches generic lambdas, `decltype` and `std::decay_t`, `mutable` lambdas, `std::abs`, `std::to_string`, and `std::reverse` in two new topics, and `cpp-optional`, `cpp-tie-break-order`, `cpp-callbacks`, `cpp-testing`, `cpp-protocol`, and `cpp-property-test` depend on them. `std::count_if` is taught by `cpp-lambda-predicate`, its only user, and `cpp-elapsed-duration` now uses the `std::chrono` skills.

- C++ teaches the basics lessons used without teaching: logical operators and `?:`, range-for with `std::array`, `break`/`continue`, `char`, `sizeof`, fixed-width integers, type traits, bit operations, member functions and `const`, pairs and structured bindings, and `std::chrono`. `cpp-arithmetic` teaches `%`, `cpp-while-progress` uses a real `while`, and `cpp-functions` no longer sums a vector before vectors are taught.
- Machine Learning has a mathematics layer: 31 quantitative-foundations skills cover statistics, probability, exponentials and logarithms, sigmoid and softmax, derivatives and the chain rule, gradients, vectors, matrices, covariance and eigenvectors, and ML and Data Analysis skills depend on the ones they use. `ml-decision-trees` now depends on a separate `ml-overfitting` skill instead of reaching calculus through regularization.
- Rust now teaches every construct listed in the original audit before a lesson uses it: Debug formatting, `#[derive(Debug, Clone, PartialEq)]`, `const`, `while`, early `return`, tuple structs, turbofish, `From`/`Into`, `TryFrom`/`TryInto`, `.copied()`/`.cloned()`, `Option`/`Result` query methods, `.unwrap()`/`.expect()`, `?` on `Option`, `while let`, `VecDeque`, `assert!`/`assert_eq!`, and `#[test]`/`#[cfg(test)]`. `rust-main`, `rust-returns`, `rust-format`, and `rust-match` use only what precedes them; `rust-future-ready` polls through `Pin::new` and leaves pinning to `rust-future-pin`; `rust-cow` uses `to_mut`; `rust-test-contract` and `rust-package-name` exercise test modules and `Cargo.toml` names; maps and sets are built with `insert` loops, so they no longer depend on iterators.
- Competitive Programming has no dead-end concepts. `cp-grids` now counts islands by flood-filling each undiscovered land cell (it requires `cp-grid-component`), and `cp-bitmasks` keeps a selection mask with set and clear changes and walks its submasks (it requires `cp-bit-submask-step`). The test exception for these two leaves is removed; every concept stage is an ancestor of its application.
- Brute force no longer passes Competitive Programming assessments. 37 applications and 4 concept stages end with a hidden deterministic large case that must finish within 3 seconds on the reference machine (1.5 for the sieve), scaled by the device's measured speed (CEN-115), and six exercises disable the library shortcut they teach (bisect, itertools combinatorics, `math.gcd`/`lcm`, three-argument `pow`, `math.comb`/`perm`/`factorial`, and `**` for recursive powers). `tests/competitive-assessments.test.ts` runs 48 brute-force and shortcut solutions, mostly from the audit, and requires each to fail.
