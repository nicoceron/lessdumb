# Knowledge points

A lesson teaches a skill as a short sequence of knowledge points, in the Math Academy pattern: a brief explanation of one idea, a fully worked example of it, then practice questions on that idea only. Learners practice each point until they show they can do it, so a lesson never jumps from reading to a four-question exam.

## Authoring

Knowledge points live in `src/lib/knowledge-points/*.kp.ts`, keyed by skill ID. Each file exports `knowledgePoints: KnowledgePointModule`, imports its helpers from `./authoring`, and is registered in its course's content module, `src/lib/content/<course>.ts` (a test fails if a file is not registered). The browser downloads lesson content one unit at a time, built from these modules, only when a lesson needs it (see [content loading](knowledge-graph.md#how-the-browser-loads-the-catalog)), so a file may only name skills of that course. Explicit imports keep the catalog loadable outside Vite, for example by Playwright. A skill may appear in only one file. IDs are assigned from position (`<skill>-kp<n>`, `<skill>-kp<n>-q<m>`), so append new points or questions rather than reordering published ones.

```ts
import { choose, typeNumber, typeOutput, type KnowledgePointModule } from './authoring';

export const knowledgePoints: KnowledgePointModule = {
  'skill-id': [
    {
      title: 'One idea, stated as what the learner can do',
      explanation: ['One or two short paragraphs about this idea only.'],
      example: { code: '…', output: '…', explanation: 'Why the result is what it is.' },
      questions: [typeOutput(…), typeNumber(…), choose(…), …],
    },
  ],
};
```

Every skill with knowledge points needs **two to five points**, and every point needs **at least three interchangeable questions** that test the same idea with different values or situations. Learners see unseen variants first, and reviews draw fresh variants, so questions must not be near-duplicates a learner can pattern-match. Where fresh numbers matter, one question of a point can be a [generator](#generated-questions) that asks new numbers every time.

### Questions

Prefer a typed answer. A learner who guesses among four choices is right a quarter of the time, and two correct answers pass a point, so a lucky guess counts heavily. Learners type the answer whenever it is a number or a short exact text, as in Math Academy; multiple choice is for answers that cannot be typed unambiguously.

| Helper                                            | Type      | Use for                                                                                |
| ------------------------------------------------- | --------- | -------------------------------------------------------------------------------------- |
| `typeOutput(prompt, code, output, explanation)`   | `text`    | What a complete program prints, when the output is one to three short lines.           |
| `typeNumber(prompt, answer, explanation, opts?)`  | `numeric` | A computed number: a mean, a probability, a count, a derivative at a point.            |
| `typeText(prompt, answers, explanation, opts?)`   | `text`    | A short answer that is not an output: a function or method name, a keyword, a term.    |
| `predictOutput(prompt, code, choices, answer, …)` | `choice`  | An output that cannot be typed fairly (see below).                                     |
| `choose(prompt, choices, answer, explanation, …)` | `choice`  | A decision or consequence, or a value question whose typed answer would not be unique. |

#### Typed answers

How responses are graded (`src/lib/typed-answer.ts`):

- **Numbers** accept integers, decimals, negative numbers, a leading `+`, simple fractions like `3/4`, and scientific notation like `1e-3`; surrounding spaces are ignored. Thousands may be grouped with commas (`1,000`, `12,345.5`) or spaces (`1 000`, including the no-break and thin spaces some keyboards insert), one separator throughout, when every group after the first has exactly three digits. `1,5`, `12,34`, and `1.000,5` could be a decimal comma or a typo, so they are not numbers. Anything that is not a number gets a gentle "not a number" message and does not count as an answer: no miss, no attempt.
- **Tolerance is absolute.** A response is correct when |response − answer| ≤ `tolerance`. Without one, it must equal the answer, allowing only floating-point rounding, so `3/4`, `0.75`, and `7.5e-1` are all correct for 0.75. When the true value repeats or was rounded (σ(1) ≈ 0.731), give the rounded answer, a tolerance of half the last digit (`0.0005`), and say the precision in `unit`: `{ tolerance: 0.0005, unit: 'to 3 decimals' }`. A tolerance as wide as the answer itself is rejected, since it would accept 0.
- **`unit`** is shown next to the field: a unit (`ms`, `%`) or a format hint (`to 3 decimals`). It is plain text, without math. A unit, one word without digits, may also end the response, with or without a space: `250 ms` and `250ms` read as 250, and `50%` as 50. It must be typed as declared (`250 MS` and `250 s` are not numbers), and a format hint is never a suffix.
- **Text** is compared line by line: line endings are unified, each line is trimmed and its runs of whitespace collapse to one space, blank lines at the start and end are dropped, and curly quotes from phone keyboards are straightened.
- **Output stays exact.** For an output question (`typeOutput`, `checksOutput`) the exact output is the skill, so nothing else is forgiven: `[1,2]` is not `[1, 2]`, `true` is not `True`, and `"Ready"` is not `Ready`.
- **Other text accepts equivalent forms.** A `typeText` answer (a name, a keyword, a term) is also correct in any case, wrapped in quotes or backticks (`"append"`, `` `append` ``, matched pairs only), or with trailing punctuation (`append.`), and as any listed synonym: `typeText` lists every accepted answer (`['append', 'list.append']`), and the first is the one shown after answering. Leading or inner punctuation still counts: `.append` and `append()` are wrong unless listed.
- **Opting out.** Set `caseSensitive` when case is part of the answer, as in an identifier (`True`, `String`); quotes and punctuation are still forgiven. Set `exact` when quotes or punctuation carry meaning, as in a char literal (`'a'`) or a statement (`x += 1;`): the question is then graded like an output, case included unless `ignoreCase` is set.

Rules for typed questions, checked by the catalog validator:

- **Output questions accept exactly the output.** `typeOutput` has one accepted answer, case-sensitive, and the catalog tests run the program and require that answer to equal what it prints, as for `predictOutput`. `ignoreCase`, `caseSensitive`, and `exact` are errors on it.
- **A prompt that asks what code prints is an output question.** A `typeText` question with `code` whose prompt says print, output, or display must be a `typeOutput` question, so it is graded exactly.
- **An answer must keep its meaning under lenient grading.** An answer that wrapping quotes, backticks, or trailing punctuation would change (`'a'`, `x += 1;`, `?`) needs `exact`. An answer with a capital letter must say whether case matters: `caseSensitive` for an identifier such as `True`, or `ignoreCase` for a term such as `NumPy`. Accepted answers must stay distinct after this grading, so `['len', 'LEN']` is one answer unless the question is exact.
- **Synonyms must not accept a distractor.** When a `typeText` question accepts the correct choice of a choice question of the same skill, both ask about the same thing, so it must reject every distractor of that question, whether through a listed synonym, case, or quotes (`synonymCollisionErrors`). `['append', 'extend']` fails next to a choice question whose key is `append` and whose distractor is `extend`; so does `['true']` next to one that counts `True` wrong, unless the question is `caseSensitive`.
- **Spacing must not matter.** An output with leading spaces, runs of spaces, or tabs would be accepted with different spacing, so it stays a `predictOutput` choice question.
- Text answers are at most three lines of 40 characters. Numeric answers must be finite and read back as themselves.

Keep an output or value question as a choice when typing it would be ambiguous or unfair: output longer than three short lines, non-ASCII text (`é`, `日`), floats with long decimal tails (`0.30000000000000004`), integers of eight or more digits, library error text (`ParseIntError { kind: InvalidDigit }`), set reprs whose order a learner cannot know, and prompts that ask about something other than the printed output. The same goes for value questions with more than one right answer ("Which key may this node hold?", "Which value of a makes `a % 4 == 0`?") and for choices that are formulas or statements rather than one number. Phrase a typed prompt as a direct question ("What is $2^{-4}$?"), not "Which value equals…".

#### Choice questions

- **Four or more distinct choices.** Distractors are the answers a learner with a specific misconception would give: an off-by-one count, the unsorted order, the quoted string, the integer-division result. Never pad with filler such as "Compilation fails" or "The function never returns" unless that is genuinely a plausible answer to that program.
- **No giveaways.** Keep choices similar in length and form; do not make the correct answer the longest, the shortest, or the most hedged one, and do not repeat it in the prompt. `tests/question-quality.test.ts` fails a course whose correct choice is the longest (or shortest) in more than 40% of its conceptual questions, and any key more than 1.8 times longer than every distractor.
- **Output questions use `typeOutput` or `predictOutput`.** The code must be a complete program, and the accepted answer or correct choice must be exactly what it prints. Catalog tests run every such program and every worked example and compare the output, so a wrong key fails the build.
- **Conceptual questions use `choose`.** Ask about a decision or consequence, not a restatement of the explanation's wording.
- Explanations say why the answer is right, in one or two sentences. There are no hints: the worked example is the support. Name a choice by its content, never by position ("the third", "the last one"): choices are shuffled.
- Prompts are plain questions. Do not template them from the skill title.
- Every question stands alone. A review shows one question without its point, worked example, or neighbouring questions, so put the code a question needs in its `code` argument instead of writing "in the example", "the class above", or "that program".

### Math notation

Lesson prose is typeset with [KaTeX](https://katex.org/docs/supported): lesson paragraphs, point explanations, worked-example explanations, question prompts, the choices of `choose` questions, and answer explanations. Typed answers, accepted answers, and unit hints stay plain text.

- Write inline math as `$…$` and display math as `$$…$$`: `'The standard error is $\\sigma / \\sqrt{n}$.'` In a TypeScript string, double each backslash.
- Typeset formulas, variables, and worked arithmetic (`$12 \times 5 = 60$`). Plain standalone numbers, counts, percentages, and times stay plain text.
- Keep code as code: backtick spans, `code`, worked-example code and output, and the choices of `predictOutput` questions are never parsed for math. Python syntax that teaches Python (`x ** 0.5`, `len(values)`) is code, not math.
- Write a literal dollar sign as `\$` (`'\\$20'` in source), inside or outside math.
- Inline math cannot start or end with a space, and only ASCII belongs inside it: use `\times`, `\le`, `\sigma`, `\bar{x}`, and `\text{mean}` rather than Unicode symbols or bare words.
- Use display math only for a long standalone formula in an explanation, never in choices. It scrolls inside its own box on narrow screens.
- If one choice is a formula, write the comparable choices in TeX too, so formatting never hints at the answer.
- Titles, summaries, and authored flashcards are plain text everywhere; keep math out of them. A mistake card shows the question's prose and code separately, so its math is typeset on the Flashcards page and in Anki (see [math in cards](anki.md#math-in-cards)).

The catalog validator rejects unclosed, empty, or space-padded `$` delimiters, and a test renders every math span with KaTeX in strict mode, so a TeX typo fails CI. Competitive Programming keeps complexity notation such as O(n log n) as plain text.

### Generated questions

A learner who retries a lesson and then takes reviews and quizzes meets a point's questions many times, and could start recognizing answers instead of working them out. Where fresh numbers matter, turn one of a point's authored questions into a **generator**: a seeded function that returns a new concrete question of the same type each time it is asked, as Math Academy does.

```ts
// src/lib/knowledge-points/quantitative-foundations.gen.ts
import { series, typeNumber, type GeneratorModule } from './authoring';

export const generators: GeneratorModule = {
  // math-mean: Compute an arithmetic mean
  'math-mean-kp1-q2': (r) => {
    const values = r.ints(4, 2, 60);
    // …choose values whose mean is exact…
    return typeNumber(`What is the mean of ${series(values)}?`, mean, `…`);
  },
};
```

- **One file per course, keyed by question ID.** Generators live in `src/lib/knowledge-points/<course>.gen.ts`, keyed by the ID of the authored question each one varies (`<skill>-kp<n>-q<m>`), and are registered next to the course's `*.kp.ts` files in `src/lib/content/<course>.ts` (`withKnowledgePoints(catalog, points, { '<course>.gen.ts': generators })`). They live apart from the points because the browser downloads lesson content as JSON and generators as code; the build attaches a course's generator modules to each of its unit chunks by these IDs (`scripts/catalog-index-plugin.mjs`), as the server does when it builds the curriculum. A key that names no choice or typed question of the course is a validation error, and a test fails if a `*.gen.ts` file is not registered.
- **Prefer turning an existing question into a generator** over adding a point or a question. The authored question stays in its `*.kp.ts` file: it documents what the generator asks, and it is what attempts saved before the question became a generator show. A generator counts as one of the point's three or more questions; keep the others authored, so the point still offers different situations.
- **Same type, same helpers.** A generator returns `typeNumber`, `typeOutput`, `typeText`, `choose`, or `predictOutput`, of the authored question's type, and an output generator checks output exactly when the authored one does. Every rule above applies to each variant: typed answers, choices, math, and complete programs.
- **Compiled programs.** C++ and Rust generators (`cpp.gen.ts`, `rust.gen.ts`) build complete programs in the authored layout with small local helpers: sorted `#include` lines, helper functions, then `main`. They follow the [complete-program rules](#complete-programs): a generated C++ `main` never returns a value, since the batched tests run it as a void function, and no output may depend on time, addresses, or hash order (an `unordered_map` is read by key, never iterated). Draw constrained values together (`until(() => [values, threshold], ok)`), so a seed whose first draw cannot meet the constraint redraws both.
- **Draw every number from `r`, never from `Math.random`.** `r` (`src/lib/variants.ts`) is a small seeded PRNG (mulberry32): `r.int(min, max)`, `r.pick(items)`, `r.ints(count, min, max, distinct)`, `r.sample`, `r.shuffle`. The same seed always gives the same question, so a stored attempt can be rebuilt and graded again. A test fails if a generator calls `Math.random`.
- **Compute answers exactly.** Prefer values whose answers are integers or short decimals: pick the answer first and build the question around it (choose the mean, then the values). Python semantics are in `authoring.ts`: `py()` prints a value as Python does, `pyFloat`, `pyDiv`, and `pyMod` follow its floats, `//`, and `%`. `num()` strips floating-point noise from prose, and `prose()`, `paren()`, `plus()`, `coef()`, `terms()`, and `poly()` write signed numbers and polynomials.
- **Enough variety.** Among its first 50 variants (`GENERATOR_SAMPLES`), a generator must produce at least 12 different questions (`MIN_DISTINCT_VARIANTS`), so a learner's recent variants can always be avoided. Aim for dozens.
- **Stand alone, and stay apart.** A variant must not reproduce another question of the same skill, prompt and code included; the quality test checks this. A choice generator must not make its key the longest or shortest choice in more than 40% of its variants.
- **Edit with care.** Variant `k` of a question is whatever its generator returns for `variantSeed(id, k)`, so changing a generator changes what old attempts and mistake cards rebuild to, just as editing an authored question does. Keep IDs stable.

How generators are checked:

- The catalog validator (`generatedQuestionErrors` in `src/lib/curriculum.ts`) samples the first 50 variants of every generator and applies the structure rules to each: the authored question's type, four or more distinct choices and a valid answer index, a parseable finite numeric answer that reads back as itself, a nonempty text answer of at most three short lines, code for an output question, balanced `$…$` math that KaTeX renders, and the same question for the same seed.
- `tests/knowledge-points.test.ts` runs a sample of every output generator's variants (0, 1, 2, 10, 25, and 49) through Pyodide, rustc, or clang++, with the authored programs, and compares each output with the generated answer.
- `tests/question-quality.test.ts` applies its giveaway checks to the sampled variants.

A generated question is asked as a variant number `k`: 0, 1, 2, … for each question, each seeding the generator with `variantSeed(id, k)`. The learner's attempt stores only that small number (`variant`), never the question, so states stay small; quiz questions and placement questions store it too. The lesson page, quiz results, and mistake cards rebuild what was asked from the question ID and the variant.

### Complete programs

- **Python:** ordinary scripts. `numpy`, `pandas`, and `scikit-learn` are available.
- **Rust:** a complete program with `fn main()`, standard library only. Do not call `std::process::exit`.
- **C++:** a complete C++20 program with `int main()` that prints with `std::cout` and does not `return` a value from `main`; standard library only. Include every header the program uses.

Tests run programs in batches, so output must be deterministic: no random seeds from time, no thread-ordering races, no addresses.

### Teaching

Use only what the skill's prerequisites, and earlier points of the same skill, have taught. If a question needs an idea the graph does not provide, change the question or add the prerequisite (see [graph rules](knowledge-graph.md)). Each point teaches one idea; a skill's last point usually combines the earlier ones.

## Lesson behavior

A lesson is one page that grows as the learner works through it:

1. Read the skill's introduction (`lesson.paragraphs`).
2. For each knowledge point in order: read its explanation and worked example, then answer its questions, unseen variants first. Each answered question stays on the page with its explanation, and the next one is added below it. Two correct answers, on two different questions, pass the point. Three incorrect answers on one point fail the lesson attempt.
3. For a programming skill, finish with the skill's code exercise, as its assessment policy requires. A wrong run can be fixed and run again; it costs XP but does not fail the attempt.

Points passed during an attempt are provisional (`lessonAttempt` in the learner's state). They become mastery evidence together when the last step passes, so a failed attempt keeps nothing from that attempt. A failure records `lessonFailedAt` and the learner sees "Lesson failed — you'll see it again later" with a link back to Today, at the bottom of the page under everything they read and answered. The scheduler then offers any other available work first. The lesson returns once the learner completes another lesson or review, or four hours after the failure (`LESSON_RETRY_DELAY_MS`), whichever comes first. If nothing else is available it is offered anyway. Opening it directly is always allowed. The retry starts from the first point. Passing every point (and the code exercise, where required) masters the skill and schedules its first review one day later, as before.

A due review asks one fresh question from each of several points, rotating which point comes first each cycle, plus code where the skill's policy requires it. For these skills a policy's `reviewAnswers` is the number of points reviewed (at most the number of points), and the code exercise is asked in addition. Knowledge-point questions, chosen or typed, satisfy a `choice` requirement. A wrong review answer records a lapse and removes evidence for that point only; the learn task that follows re-teaches just the missing point.

Questions are chosen so that a learner never meets the same concrete question of a point within their last three attempts at it (`RECENT_VARIANTS`), in any mode, as long as another question or variant can be asked (`freshQuestion` and `chooseVariant` in `src/lib/learning.ts`; a lesson never asks again a question already answered correctly in the attempt). This holds across lessons, retries, reviews, and quizzes. An authored question asked in those three attempts waits; a generated question never waits, because it brings a variant they did not show. Then unseen variants come first: an authored question not yet answered, or any generated question, whose next variant is the first one the learner has neither answered nor met in those three attempts. A variant is fixed when the question is shown, so a reload shows the same one until it is answered. A point's two correct answers must still be on two different questions.

Choices appear in a shuffled order each time a question is shown: the order is a deterministic function of the question and how many times the learner has answered it (`src/lib/choice-order.ts`), so a reload keeps the order and grading always uses the authored answer index.

A typed question shows one field instead: `inputmode="decimal"` for a number, so phones open the number pad, and a code-font field for text, or a text area when the answer spans lines. Enter submits a one-line answer and Ctrl+Enter (⌘+Enter) a multi-line one. A response that is not a number is answered in place ("not a number, so it was not counted") and the field stays open. Once graded, the field freezes into what the learner typed, marked correct or incorrect, with the accepted answer when it was wrong or reads differently, and the explanation, like an answered choice question; keyboard focus moves to Continue. Typed questions follow the same rules as choices: two correct answers pass a point, three misses fail the attempt, reviews, quizzes, and placement ask them, and XP is the same. The attempt keeps the typed text (`response`, at most 200 characters), and a mistake card's back is the accepted answer. A correct answer typed in another form (another case, quoted, a synonym) also shows the accepted spelling. Every attempt, typed, chosen, or run, also keeps its [answer time](learning-design.md#answer-time).

Every skill is taught through knowledge points. The engine still supports a skill without them (a four-question lesson), for future catalogs. The choice questions of the original four-question lessons were deleted once knowledge points replaced them (CEN-117); a skill's `questions` now holds only its code exercise, which keeps the ID `<skill>-q4` from that lesson. Choice or typed questions in a course file are a validation error. Saved progress may still name the retired `<skill>-q1` to `-q3`: an account that mastered a skill under the four-question lesson (evidence for all of `-q1` to `-q4`) keeps that mastery, partial legacy evidence restarts the lesson, XP earned per retired question still counts against the lesson's XP, and old attempts and mistake or Anki cards stay as saved.

XP follows `src/lib/xp.ts`: about one XP per focused minute, with a bonus for a perfect task and a deduction per incorrect answer. It is paid once per completed task, on the answer that completes it: `lessonXp` once per skill (net of any XP the skill earned per question before this change), and `REVIEW_XP` once per due review cycle. Failed attempts, remediation after a lapse, and relearning earn nothing.
