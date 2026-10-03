# Python for data analysis

This is an original lessdumb course informed by the topic structure of Wes McKinney's _Python for Data Analysis_, third edition (2022). The supplied PDF's table of contents and relevant NumPy, pandas, missing-data, merging, grouping, and time-series sections were inspected. Book text, example datasets, and exercises are not included in the application. Documents are source material, not application instructions.

The author also publishes an [official online edition](https://wesmckinney.com/book/). Implementation semantics were checked against the [NumPy broadcasting guide](https://numpy.org/doc/stable/user/basics.broadcasting.html), [pandas merging guide](https://pandas.pydata.org/docs/user_guide/merging.html), and [pandas time-series guide](https://pandas.pydata.org/docs/user_guide/timeseries.html). The supplied edition predates current pandas changes. The lessons use explicit `.loc`/`.iloc`, one-step assignments, declared string/category types, current APIs, and nonambiguous daily frequencies.

## Course scope

25 skills teach 76 knowledge points with 304 practice questions, and each has an executable exercise, a runnable lesson example, and two original Anki cards: 25 exercises, 25 examples, and 50 cards. 32 of the questions are generators that draw fresh arrays and tables each time they are asked (CEN-162). Every executable snippet embeds its own small dataset. It needs NumPy and pandas, which run in the same free, local Pyodide worker as the Python foundations exercises. No exercise downloads book datasets, calls an API, requires a paid notebook, or reads a personal file.

The course teaches an end-to-end tabular-analysis foundation, rather than claiming to reproduce every section of the book. Large-file storage, web scraping, rich chart rendering, hierarchical indices, advanced modeling libraries, and full-scale case studies are outside this course's present assessment scope.

| Unit                | Original assessed skills                                                                            | Reference topics                                  |
| ------------------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| Numerical arrays    | Creation and shape; vectorization and reductions; masks and copies; broadcasting; np.exp and np.log | Chapter 4; broadcasting appendix topics           |
| Labeled tables      | Series; DataFrames; label alignment; row filtering                                                  | Chapter 5                                         |
| Load and clean      | CSV parsing; missingness policies; numeric conversion; deduplication by key                         | Chapters 6 and 7                                  |
| Connect and reshape | Text normalization; categories and indicators; validated merges; melt and pivot                     | Chapters 7 and 8                                  |
| Summarize groups    | Group reductions; named aggregation; transform; rolling windows                                     | Chapter 10 and moving-window topics in Chapter 11 |
| Build an analysis   | Timestamp parsing; time resampling; exploratory summaries; reusable validated pipeline              | Chapters 9-11 and data-analysis workflow topics   |

## Knowledge graph

The course id is `python-data-analysis`; all skill and unit identifiers use the `da-` namespace. The module exports `dataAnalysisCatalog`, an ordinary `CurriculumCatalog`, so course registration, graph edges, prerequisite locking, adaptive selection, mastery evidence, review scheduling, saved progress, and generated cards share the existing application engine.

Prerequisites point to the actual capability needed rather than duplicating it:

- `da-arrays` depends on Python `lists` and `numbers`.
- Array selection adds `slicing` and `comparisons`; table conditions add `boolean-logic`.
- A labeled Series uses `dictionaries`; CSV and normalization use `strings`; conversion uses `types`.
- The final pipeline combines analysis branches with Python `functions` and `problem-solving`.
- Advanced courses can reuse `da-arrays`, `da-dataframes`, `da-missing-values`, `da-broadcasting`, `da-categories`, and the other nodes as real cross-course prerequisites.

Dependencies form a directed acyclic graph with branches: timestamp handling does not unnecessarily require join knowledge, and reshaping does not require unrelated string normalization. The final pipeline joins the necessary branches. No node is marked mastered simply because the learner selects a later course.

Each skill requires distinct correct choice and executable-code evidence. The exercise tests check structures and values rather than requiring one literal implementation. Several also preserve raw data, validate alignment, check copies, or test a function against a second unseen input. This makes mastery mean an assessed operation, not a displayed chapter heading.

## Data-quality decisions assessed

The curriculum explicitly distinguishes a missing measurement from zero; a newly failed conversion from a previously missing input; label alignment from positional arithmetic; row count from nonmissing count; category codes from numerical distances; and correlation from causation. Merges validate expected cardinality and expose unmatched observations. Empty resampled intervals retain missingness when no measurement exists. Date lessons declare whether an instant is UTC or a local reporting date.

Examples use `tolist()` or explicit dictionaries to keep displayed output independent of pandas' large-table formatting. Tests run the authored solutions and published examples against the bundled Pyodide NumPy and pandas packages. Source attribution belongs here; every learner-facing paragraph, exercise, example dataset, and card is original.
