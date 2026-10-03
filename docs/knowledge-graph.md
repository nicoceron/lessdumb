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

| Course                   | Edges before → after → now | Longest in-course chain | Median ready |
| ------------------------ | -------------------------: | ----------------------: | -----------: |
| Python foundations       |               45 → 30 → 74 |             10 → 9 → 12 |    3 → 3 → 6 |
| Quantitative foundations |                  7 → 8 → 9 |               3 → 2 → 2 |    2 → 2 → 2 |
| Python for Data Analysis |               48 → 39 → 41 |              15 → 8 → 8 |    2 → 3 → 3 |
| Machine Learning         |               89 → 56 → 66 |              10 → 9 → 9 |    3 → 6 → 6 |
| Data Systems             |               42 → 33 → 33 |               7 → 7 → 7 |    3 → 3 → 3 |
| Competitive Programming  |            683 → 373 → 443 |              20 → 9 → 9 |  9 → 28 → 28 |
| Rust                     |            145 → 227 → 261 |           124 → 15 → 18 |  1 → 17 → 17 |
| C++                      |            200 → 296 → 296 |           116 → 12 → 12 |  3 → 30 → 30 |
| **Catalog**              |  **1,259 → 1,062 → 1,223** |                         |              |

"Now" adds the Python foundations idiom nodes (CEN-81) and the Rust basics (CEN-84). For Python: 24 skills for constructs that lessons used without teaching, such as tuples, unpacking, built-ins, truthiness, sorting keys, sets, imports, heaps, and classes. Every skill whose lesson, example, questions, or solution uses one of them now names it directly, and prerequisites that became implied were removed. Writing knowledge points for every foundation skill also exposed three missing edges, now added: `strings` repeats text with `*` from `numbers`, `lists` relies on `==` from `comparisons` for membership and equality, and `parameters` uses the `is None` default idiom from `truthiness`.

For Rust, 17 basics were added, and every lesson using them now depends on them. Redundant edges fell from 523 to 0. Rust and C++ gained edges because the old generators chained each skill to the previous one and omitted most real uses: 55% of Rust's and 52% of C++'s previous-skill edges were false, and dozens of skills used constructs taught only later. Competitive Programming no longer injects `parameters` into every node or chains every concept to its sibling; 231 of its removed edges named skills that are no longer ancestors at all.

## Known gaps

Edges cannot fix content. These items are the backlog for new concept nodes and lesson rewrites.

**Constructs used but taught nowhere** (number of skills that first use them):

- Python: decorators (`@cache` in `cp-memoization`, whose lesson describes `functools.cache` but not decorator syntax), argument unpacking with `zip(*rows)` (`ml-ensembles`), and set operations on `dict.keys()` (`ml-deployment-monitoring`).
- Mathematics for ML: exponentials and logarithms, softmax, derivative definition and rules, partial derivatives, expected value, correlation, percentiles.
- C++: `&&`/`||`/`!` (28), `?:` (26), range-for (13), `std::array` (8), const member functions, type traits, structured bindings, `break`/`continue`, bit shifts, fixed-width integers.

**Content that contradicts its own edges:**

- C++: `cpp-functions` sums a `std::vector` although vectors depend on it; `cpp-while-progress` teaches `while` with a `do-while` example; `cpp-arithmetic` never teaches `%`, which 12 later skills use.
- Competitive Programming: `cp-grid-component` (flood fill) and `cp-bit-submask-step` are not used by their applications, so they remain leaves. Brute-force solutions passed all 32 application assessments tried, because inputs are small.
- Machine Learning: `ml-decision-trees` reaches calculus only through the overfitting idea in `ml-regularization`; a separate overfitting node would remove that dependency.

**Closed:** Rust now teaches every construct listed in the original audit before a lesson uses it: Debug formatting, `#[derive(Debug, Clone, PartialEq)]`, `const`, `while`, early `return`, tuple structs, turbofish, `From`/`Into`, `TryFrom`/`TryInto`, `.copied()`/`.cloned()`, `Option`/`Result` query methods, `.unwrap()`/`.expect()`, `?` on `Option`, `while let`, `VecDeque`, `assert!`/`assert_eq!`, and `#[test]`/`#[cfg(test)]`. `rust-main`, `rust-returns`, `rust-format`, and `rust-match` use only what precedes them; `rust-future-ready` polls through `Pin::new` and leaves pinning to `rust-future-pin`; `rust-cow` uses `to_mut`; `rust-test-contract` and `rust-package-name` exercise test modules and `Cargo.toml` names; maps and sets are built with `insert` loops, so they no longer depend on iterators.
