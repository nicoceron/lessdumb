import { describe, expect, it } from 'vitest';
import { courses, skills, type ChoiceQuestion } from '../src/lib/curriculum';

// Knowledge-point questions are checked for giveaways a learner could exploit
// without knowing the idea. The executed-output tests in
// knowledge-points.test.ts cannot see these: they prove an output key right,
// not that its choices are fair.

interface Item {
  courseId: string;
  skillId: string;
  question: ChoiceQuestion;
}

const items: Item[] = skills.flatMap((skill) =>
  (skill.knowledgePoints ?? []).flatMap((point) =>
    point.questions
      .filter((question) => question.type === 'choice')
      .map((question) => ({
        courseId: skill.courseId,
        skillId: skill.id,
        question,
      })),
  ),
);

const length = (choice: string) => choice.trim().length;
const distractors = (question: ChoiceQuestion) =>
  question.choices.filter((_, index) => index !== question.answer);
const isLongest = (question: ChoiceQuestion) =>
  distractors(question).every(
    (choice) => length(question.choices[question.answer]) > length(choice),
  );

/**
 * With four choices whose lengths are unrelated to the key, the correct one is
 * the strictly longest about a quarter of the time (about 21% in this catalog,
 * because ties never count). Above 40%, "pick the longest" beats chance by
 * more than 15 points, and for any course with at least 40 questions in a
 * group that is over three standard deviations above chance, so a fair course
 * does not fail by accident. Conceptual and output questions are measured
 * separately: an output's length is fixed by its program, which would dilute
 * a bias in the hand-written conceptual choices.
 */
const MAX_LONGEST_SHARE = 0.4;
const MIN_GROUP_SIZE = 40;
/** A key this much longer than every distractor stands out on its own. */
const MAX_LENGTH_RATIO = 1.8;
const MIN_FLAGGED_LENGTH = 8;

function longestShares() {
  return courses
    .map((course) => {
      const own = items.filter((item) => item.courseId === course.id);
      const share = (group: Item[]) => ({
        questions: group.length,
        longest: group.filter((item) => isLongest(item.question)).length,
      });
      return {
        course: course.id,
        conceptual: share(own.filter((item) => !item.question.checksOutput)),
        output: share(own.filter((item) => item.question.checksOutput)),
        all: share(own),
      };
    })
    .filter((row) => row.all.questions > 0);
}

const percent = (group: { questions: number; longest: number }) =>
  group.questions
    ? `${((100 * group.longest) / group.questions).toFixed(1)}%`
    : '—';

/** Whitespace-insensitive text, keeping case and symbols that code needs. */
const collapse = (text: string) => text.trim().replace(/\s+/g, ' ');
/**
 * Plain sentences, where case and punctuation carry no meaning. Code such as
 * `self.SCALE` or `Coin::Tails` is a single token and keeps its spelling.
 */
const PROSE = /^[A-Za-z0-9\s.,;:!?'’]+$/;
const isProse = (text: string) =>
  PROSE.test(text) &&
  collapse(text)
    .split(' ')
    .filter((token) => /[A-Za-z]/.test(token)).length >= 2;
const words = (text: string) => text.match(/[A-Za-z]{2,}/g) ?? [];
const plain = (text: string) =>
  collapse(text.toLowerCase().replace(/[.,;:!?'’]/g, ' '));

describe('knowledge point question quality', () => {
  it('reports and limits how often the correct choice is the longest', () => {
    const rows = longestShares();
    console.table(
      rows.map((row) => ({
        course: row.course,
        conceptual: `${percent(row.conceptual)} of ${row.conceptual.questions}`,
        output: `${percent(row.output)} of ${row.output.questions}`,
        all: `${percent(row.all)} of ${row.all.questions}`,
      })),
    );
    const failures = rows.flatMap((row) =>
      (['conceptual', 'output'] as const)
        .filter(
          (group) =>
            row[group].questions >= MIN_GROUP_SIZE &&
            row[group].longest > MAX_LONGEST_SHARE * row[group].questions,
        )
        .map((group) => `${row.course} ${group}: ${percent(row[group])}`),
    );
    expect(failures).toEqual([]);
  });

  it('never makes the correct choice far longer than every distractor', () => {
    const flagged = items
      .filter(({ question }) => {
        const key = length(question.choices[question.answer]);
        return (
          key >= MIN_FLAGGED_LENGTH &&
          distractors(question).every(
            (choice) => key > MAX_LENGTH_RATIO * length(choice),
          )
        );
      })
      .map(({ question }) => question.id);
    expect(flagged).toEqual([]);
  });

  it('keeps every choice distinct after normalizing whitespace, case, and punctuation', () => {
    const flagged = items.flatMap(({ question }) => {
      // An output is compared as printed; whitespace layout is part of it.
      const keys = question.choices.map((choice) =>
        question.checksOutput ? choice.trim() : collapse(choice),
      );
      const proseKeys = question.checksOutput
        ? []
        : question.choices.filter(isProse).map(plain);
      return new Set(keys).size !== keys.length ||
        new Set(proseKeys).size !== proseKeys.length
        ? [question.id]
        : [];
    });
    expect(flagged).toEqual([]);
  });

  it('never repeats a prompt and its code within one skill', () => {
    const seen = new Map<string, string>();
    const repeated: string[] = [];
    for (const { skillId, question } of items) {
      const key = [
        skillId,
        collapse(question.prompt.toLowerCase()),
        collapse(question.code ?? ''),
      ].join('\u0000');
      const first = seen.get(key);
      if (first) repeated.push(`${first} = ${question.id}`);
      else seen.set(key, question.id);
    }
    expect(repeated).toEqual([]);
  });

  it('never quotes only the correct choice in the prompt', () => {
    const appears = (prompt: string, choice: string) => {
      const text = choice.trim().toLowerCase();
      const at = prompt.toLowerCase().indexOf(text);
      if (!text || at < 0) return false;
      const before = prompt[at - 1] ?? ' ';
      const after = prompt[at + text.length] ?? ' ';
      return !/\w/.test(before) && !/\w/.test(after);
    };
    const flagged = items
      .filter(({ question }) => {
        const key = question.choices[question.answer];
        return (
          words(key).length >= 2 &&
          appears(question.prompt, key) &&
          !distractors(question).some((choice) =>
            appears(question.prompt, choice),
          )
        );
      })
      .map(({ question }) => question.id);
    expect(flagged).toEqual([]);
  });

  it('never relies on the worked example, which reviews do not show', () => {
    const flagged = items
      .filter(({ question }) =>
        /\bthe (worked )?example\b/i.test(question.prompt),
      )
      .map(({ question }) => question.id);
    expect(flagged).toEqual([]);
  });
});
