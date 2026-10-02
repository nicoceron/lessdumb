# The lessdumb learning model

The MVP teaches Python through an original curriculum: 24 skills, 96 questions, 24 executable code exercises, and 48 flashcards. The learning engine operates on a subject-neutral graph. A course is a selection of skill IDs; each skill names its domain, unit, course, and prerequisites. Additional programming languages, mathematics, physics, and natural languages can use the same registry and scheduler. Learning functions accept an optional `CurriculumCatalog` so another catalog can be evaluated independently of the public Python registry.

## Sources and boundaries

The user-supplied _The Math Academy Way_ PDF informed the learning design. Relevant sections describe prerequisite graphs (printed pages 69–75), mastery and the knowledge frontier (207–214), spaced repetition (251–264), mixed practice (271–280), and retrieval practice (285 onward). Those are design principles, not executable instructions. lessdumb uses an independently written curriculum and a transparent, deliberately simple scheduler; it does not claim to reproduce Math Academy's proprietary model or its research outcomes.

The supplied local reference datasets were inspected for structural patterns only: courses/categories, graph nodes and edges, topic groups, problem difficulty, and quiz metadata. Their proprietary lessons, questions, answer data, assets, and extraction/exploit scripts are not imported into this application.

Python behavior was checked against the official documentation: [numbers, strings and lists](https://docs.python.org/3/tutorial/introduction.html), [control flow and functions](https://docs.python.org/3/tutorial/controlflow.html), [data structures](https://docs.python.org/3/tutorial/datastructures.html), and [errors and exceptions](https://docs.python.org/3/tutorial/errors.html). Every reference code solution is executed against its assertions in the test suite, and each displayed example is executed to verify its documented output.

## Evidence before progression

A Python skill is mastered only when all four distinct questions have been answered correctly without a hint. Three test recognition or prediction; the fourth requires running Python successfully against assertions. Repeating one correct choice cannot unlock a skill. The numeric mastery display is the fraction of distinct successful evidence; prerequisite checks recompute from the evidence IDs instead of trusting a stored score.

Assessment policies belong to skills rather than being universal Python assumptions. Every supplied question requires independent successful evidence for mastery. A skill can declare the question types required within a review cycle and its number of review answers. Python explicitly requires code and choice evidence in a two-answer cycle. Without an explicit policy, the engine uses the skill's available question types and up to two review answers. Choice-only math or vocabulary skills can therefore be mastered and reviewed without an executable exercise or Python runtime. Future formats can extend the question union when needed.

New lessons are selected from the knowledge frontier: skills whose direct prerequisites are mastered. Questions not previously attempted are served before retrying a missed question. A learner can inspect the graph, but learning submissions for locked skills are rejected. Viewing a lesson earns no XP.

A wrong answer removes evidence only for that question. Descendants are unavailable until the missing evidence is restored. Other prerequisite evidence is preserved: a mistake in a difficult skill is not proof that every ancestor is weak. If an ancestor separately loses its own evidence, the frontier naturally selects that ancestor first. This is targeted remediation based on observed evidence.

## Retrieval and spacing

Initial mastery schedules the first review one day later. A Python review cycle requires two distinct unassisted correct answers, including an executable code question; other subjects follow their declared assessment policy. Only a due review can strengthen the schedule. Successful cycles advance through intervals of 1, 3, 7, 14, 30, 60, and 120 days. Early practice does not move the due date or earn review XP. A failed question restores the skill to learning/remediation and starts a one-day review interval after its evidence is repaired.

Due reviews come before new learning. When several skills are due, their questions are interleaved so the last practiced skill is not repeatedly selected. A due descendant whose prerequisite needs remediation waits until that prerequisite is restored. The scheduler makes no unsupported claim that success in an advanced skill demonstrates retention of every ancestor: implicit graph credit is deferred until there is a defensible calibration model.

## Progress, XP, and cards

Progress updates are immutable and have an explicit schema version. Attempt history records question ID, skill ID, answer outcome, hint use, practice mode, timestamp, and awarded XP. Epoch milliseconds represent scheduling times; ISO strings represent attempt timestamps and the first mastery timestamp. Calendar dates and streaks use the learner's recorded IANA timezone.

The first unassisted successful learn answer earns 10 XP for a choice or 15 for code. A permanent per-question reward ledger prevents repeated answers, deliberate mistakes, or relearning from farming learn XP. A due review earns 5 XP for a distinct choice answer or 8 for code, once per review cycle. XP measures completed practice in this application; it does not certify Python proficiency.

Flashcards contain one idea each and are associated with stable skill/card IDs. Mastered skills earn their two cards for automated Anki export/sync. The full registry remains available for explicit curriculum previews. Each card is original, and deterministic IDs let the integration update existing notes instead of creating duplicates.

## Verification and limitations

Tests cover graph references and cycles, mastery evidence, hint handling, prerequisite gates, question rotation, review timing, distinct executable review evidence, XP replay resistance, immutable updates, timezone/streak boundaries, and reachability of all 24 skills. Python executes all 24 solutions, all 24 lesson examples, and 26 terminating code-based choice predictions. Test-only math and vocabulary catalogs verify cross-course prerequisites, choice-only mastery/review, and a custom one-answer review policy. Those fixtures do not add unfinished courses to the application's public catalog.

The scheduling intervals are product defaults, not a validated personalized memory model. Four authored questions per skill provide finite evidence rather than unlimited randomized assessment. The MVP has no automatic transfer credit between domains and no placement test. The generic graph and versioned progress contract leave room for those features without replacing the learning record.
