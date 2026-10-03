# Knowledge points

A lesson teaches a skill as a short sequence of knowledge points, in the Math Academy pattern: a brief explanation of one idea, a fully worked example of it, then practice questions on that idea only. Learners practice each point until they show they can do it, so a lesson never jumps from reading to a four-question exam.

## Authoring

Knowledge points live in `src/lib/knowledge-points/*.kp.ts`, keyed by skill ID. Each file exports `knowledgePoints: KnowledgePointModule`, imports its helpers from `./authoring`, and is registered with one import line in `src/lib/knowledge-points/index.ts` (a test fails if a file is not registered). Explicit imports keep the catalog loadable outside Vite, for example by Playwright. A skill may appear in only one file. IDs are assigned from position (`<skill>-kp<n>`, `<skill>-kp<n>-q<m>`), so append new points or questions rather than reordering published ones.

```ts
import { choose, predictOutput, type KnowledgePointModule } from './authoring';

export const knowledgePoints: KnowledgePointModule = {
  'skill-id': [
    {
      title: 'One idea, stated as what the learner can do',
      explanation: ['One or two short paragraphs about this idea only.'],
      example: { code: '…', output: '…', explanation: 'Why the result is what it is.' },
      questions: [predictOutput(…), choose(…), …],
    },
  ],
};
```

Every skill with knowledge points needs **two to five points**, and every point needs **at least three interchangeable questions** that test the same idea with different values or situations. Learners see unseen variants first, and reviews draw fresh variants, so questions must not be near-duplicates a learner can pattern-match.

### Questions

- **Four or more distinct choices.** Distractors are the answers a learner with a specific misconception would give: an off-by-one count, the unsorted order, the quoted string, the integer-division result. Never pad with filler such as "Compilation fails" or "The function never returns" unless that is genuinely a plausible answer to that program.
- **No giveaways.** Keep choices similar in length and form; do not make the correct answer the longest or most hedged one. Vary the correct position.
- **Output questions use `predictOutput`.** The code must be a complete program, and the correct choice must be exactly what it prints. Catalog tests run every such program and every worked example and compare the output, so a wrong key fails the build.
- **Conceptual questions use `choose`.** Ask about a decision or consequence, not a restatement of the explanation's wording.
- Explanations say why the answer is right, in one or two sentences. There are no hints: the worked example is the support.
- Prompts are plain questions. Do not template them from the skill title.

### Complete programs

- **Python:** ordinary scripts. `numpy`, `pandas`, and `scikit-learn` are available.
- **Rust:** a complete program with `fn main()`, standard library only. Do not call `std::process::exit`.
- **C++:** a complete C++20 program with `int main()` that prints with `std::cout` and does not `return` a value from `main`; standard library only. Include every header the program uses.

Tests run programs in batches, so output must be deterministic: no random seeds from time, no thread-ordering races, no addresses.

### Teaching

Use only what the skill's prerequisites, and earlier points of the same skill, have taught. If a question needs an idea the graph does not provide, change the question or add the prerequisite (see [graph rules](knowledge-graph.md)). Each point teaches one idea; a skill's last point usually combines the earlier ones.

## Lesson behavior

A learner works through a lesson as follows:

1. Read the skill's introduction (`lesson.paragraphs`).
2. For each knowledge point in order: read its explanation and worked example, then answer its questions one at a time, unseen variants first. Two correct answers pass the point. Three incorrect answers on one point fail the lesson attempt.
3. For a programming skill, finish with the skill's code exercise, as its assessment policy requires.

A failed attempt keeps nothing from that attempt. The lesson returns later, after other work, starting from its first point. Passing every point (and the code exercise, where required) masters the skill and schedules its first review.

A due review asks one fresh question from each of several points, plus code where the skill's policy requires it. Choices appear in a shuffled order each time. Skills without knowledge points keep the earlier four-question behavior until they are converted.

XP follows `src/lib/xp.ts`: about one XP per focused minute, with a bonus for a perfect task and a deduction per incorrect answer.
