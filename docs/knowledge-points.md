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

Every skill with knowledge points needs **two to five points**, and every point needs **at least three interchangeable questions** that test the same idea with different values or situations. Learners see unseen variants first, and reviews draw fresh variants, so questions must not be near-duplicates a learner can pattern-match.

### Questions

Prefer a typed answer. A learner who guesses among four choices is right a quarter of the time, and two correct answers pass a point, so a lucky guess counts heavily. Learners type the answer whenever it is a number or a short exact text, as in Math Academy; multiple choice is for answers that cannot be typed unambiguously.

| Helper                                            | Type      | Use for                                                                                |
| ------------------------------------------------- | --------- | -------------------------------------------------------------------------------------- |
| `typeOutput(prompt, code, output, explanation)`   | `text`    | What a complete program prints, when the output is one to three short lines.           |
| `typeNumber(prompt, answer, explanation, opts?)`  | `numeric` | A computed number: a mean, a probability, a count, a derivative at a point.            |
| `typeText(prompt, answers, explanation, opts?)`   | `text`    | A short exact answer that is not an output: a function or method name, a keyword.      |
| `predictOutput(prompt, code, choices, answer, …)` | `choice`  | An output that cannot be typed fairly (see below).                                     |
| `choose(prompt, choices, answer, explanation, …)` | `choice`  | A decision or consequence, or a value question whose typed answer would not be unique. |

#### Typed answers

How responses are graded (`src/lib/typed-answer.ts`):

- **Numbers** accept integers, decimals, negative numbers, simple fractions like `3/4`, and scientific notation like `1e-3`; surrounding spaces are ignored. Anything else, including `1,000` with a thousands separator, gets a gentle "not a number" message and does not count as an answer: no miss, no attempt.
- **Tolerance is absolute.** A response is correct when |response − answer| ≤ `tolerance`. Without one, it must equal the answer, allowing only floating-point rounding, so `3/4`, `0.75`, and `7.5e-1` are all correct for 0.75. When the true value repeats or was rounded (σ(1) ≈ 0.731), give the rounded answer, a tolerance of half the last digit (`0.0005`), and say the precision in `unit`: `{ tolerance: 0.0005, unit: 'to 3 decimals' }`. A tolerance as wide as the answer itself is rejected, since it would accept 0.
- **`unit`** is shown next to the field: a unit (`ms`, `%`) or a format hint (`to 3 decimals`). It is plain text, without math.
- **Text** is compared line by line: line endings are unified, each line is trimmed and its runs of whitespace collapse to one space, blank lines at the start and end are dropped, and curly quotes from phone keyboards are straightened. Everything else counts, case included: `[1,2]` is not `[1, 2]`, and `true` is not `True`. Set `ignoreCase` only where case carries no meaning, such as a SQL keyword.
- `typeText` lists every accepted answer (`['append', 'list.append']`); the first is the one shown after answering.

Rules for typed questions, checked by the catalog validator:

- **Output questions accept exactly the output.** `typeOutput` has one accepted answer, case-sensitive, and the catalog tests run the program and require that answer to equal what it prints, as for `predictOutput`.
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
- Titles, summaries, and authored flashcards are plain text everywhere; keep math out of them. A mistake card copies the question's prose and code separately, so its math is typeset on the Flashcards page and in Anki (see [math in cards](anki.md#math-in-cards)).

The catalog validator rejects unclosed, empty, or space-padded `$` delimiters, and a test renders every math span with KaTeX in strict mode, so a TeX typo fails CI. Competitive Programming keeps complexity notation such as O(n log n) as plain text.

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

Choices appear in a shuffled order each time a question is shown: the order is a deterministic function of the question and how many times the learner has answered it (`src/lib/choice-order.ts`), so a reload keeps the order and grading always uses the authored answer index.

A typed question shows one field instead: `inputmode="decimal"` for a number, so phones open the number pad, and a code-font field for text, or a text area when the answer spans lines. Enter submits a one-line answer and Ctrl+Enter (⌘+Enter) a multi-line one. A response that is not a number is answered in place ("not a number, so it was not counted") and the field stays open. Once graded, the field freezes into what the learner typed, marked correct or incorrect, with the accepted answer when it was wrong or reads differently, and the explanation, like an answered choice question; keyboard focus moves to Continue. Typed questions follow the same rules as choices: two correct answers pass a point, three misses fail the attempt, reviews, quizzes, and placement ask them, and XP is the same. The attempt keeps the typed text (`response`, at most 200 characters), and a mistake card's back is the accepted answer.

Every skill is taught through knowledge points. The engine still supports a skill without them (a four-question lesson), for future catalogs. The choice questions of the original four-question lessons were deleted once knowledge points replaced them (CEN-117); a skill's `questions` now holds only its code exercise, which keeps the ID `<skill>-q4` from that lesson. Choice or typed questions in a course file are a validation error. Saved progress may still name the retired `<skill>-q1` to `-q3`: an account that mastered a skill under the four-question lesson (evidence for all of `-q1` to `-q4`) keeps that mastery, partial legacy evidence restarts the lesson, XP earned per retired question still counts against the lesson's XP, and old attempts and mistake or Anki cards stay as saved.

XP follows `src/lib/xp.ts`: about one XP per focused minute, with a bonus for a perfect task and a deduction per incorrect answer. It is paid once per completed task, on the answer that completes it: `lessonXp` once per skill (net of any XP the skill earned per question before this change), and `REVIEW_XP` once per due review cycle. Failed attempts, remediation after a lapse, and relearning earn nothing.
