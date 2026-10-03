import { describe, expect, it } from 'vitest';
import { courses, skills, type ChoiceQuestion } from '../src/lib/curriculum';
import { parseMathText } from '../src/lib/math-text';

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

/** TeX source of a math span, measured roughly as KaTeX displays it. */
const texLength = (tex: string) =>
  tex
    .replace(/\\(ln|log|exp|sin|cos|tan|max|min|det)(?![A-Za-z])/g, '$1')
    .replace(/\\[A-Za-z]+|\\./g, '#')
    .replace(/[{}^_]/g, '').length;

/**
 * A choice's length as the learner sees it. Output choices are literal text;
 * other choices render `$…$` math and backtick code spans, so `$\\lambda$`
 * counts as one character, not nine.
 */
function shownLength(question: ChoiceQuestion, choice: string) {
  if (question.checksOutput) return choice.trim().length;
  return parseMathText(choice.trim()).segments.reduce(
    (total, segment) =>
      total +
      (segment.kind === 'math' ? texLength(segment.tex) : segment.text.length),
    0,
  );
}
const lengths = (question: ChoiceQuestion) => {
  const all = question.choices.map((choice) => shownLength(question, choice));
  return {
    key: all[question.answer],
    others: all.filter((_, index) => index !== question.answer),
  };
};
const distractors = (question: ChoiceQuestion) =>
  question.choices.filter((_, index) => index !== question.answer);
const isLongest = (question: ChoiceQuestion) => {
  const { key, others } = lengths(question);
  return others.every((other) => key > other);
};
const isShortest = (question: ChoiceQuestion) => {
  const { key, others } = lengths(question);
  return others.every((other) => key < other);
};

/**
 * With four choices whose lengths are unrelated to the key, the correct one is
 * the strictly longest about a quarter of the time (about 21% in this catalog,
 * because ties never count), and likewise the strictly shortest. Above 40%,
 * "pick the longest" (or "pick the shortest") beats chance by more than 15
 * points; for a group of at least 40 questions that is over three standard
 * deviations above chance, so a fair course does not fail by accident. The
 * shortest-choice limit keeps a fix for long keys from trimming every key into
 * the opposite tell. Conceptual and output questions are measured separately:
 * an output's length is fixed by its program, which would dilute a bias in the
 * hand-written conceptual choices.
 */
const MAX_TELL_SHARE = 0.4;
const MIN_GROUP_SIZE = 40;
/** A key this much longer than every distractor stands out on its own. */
const MAX_LENGTH_RATIO = 1.8;
const MIN_FLAGGED_LENGTH = 8;

interface Tells {
  questions: number;
  longest: number;
  shortest: number;
}

function lengthTells() {
  const tells = (group: Item[]): Tells => ({
    questions: group.length,
    longest: group.filter((item) => isLongest(item.question)).length,
    shortest: group.filter((item) => isShortest(item.question)).length,
  });
  return courses
    .map((course) => {
      const own = items.filter((item) => item.courseId === course.id);
      return {
        course: course.id,
        conceptual: tells(own.filter((item) => !item.question.checksOutput)),
        output: tells(own.filter((item) => item.question.checksOutput)),
      };
    })
    .filter((row) => row.conceptual.questions + row.output.questions > 0);
}

const percent = (count: number, total: number) =>
  total ? `${((100 * count) / total).toFixed(1)}%` : '—';

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
  it('reports and limits how often the correct choice is the longest or shortest', () => {
    const rows = lengthTells();
    console.table(
      rows.map(({ course, conceptual, output }) => ({
        course,
        conceptual: conceptual.questions,
        'longest key': percent(conceptual.longest, conceptual.questions),
        'shortest key': percent(conceptual.shortest, conceptual.questions),
        output: output.questions,
        'output longest': percent(output.longest, output.questions),
        'output shortest': percent(output.shortest, output.questions),
      })),
    );
    const failures = rows.flatMap((row) =>
      (['conceptual', 'output'] as const).flatMap((group) =>
        (['longest', 'shortest'] as const)
          .filter(
            (tell) =>
              row[group].questions >= MIN_GROUP_SIZE &&
              row[group][tell] > MAX_TELL_SHARE * row[group].questions,
          )
          .map(
            (tell) =>
              `${row.course} ${group} ${tell}: ${percent(row[group][tell], row[group].questions)}`,
          ),
      ),
    );
    expect(failures).toEqual([]);
  });

  it('never makes the correct choice far longer than every distractor', () => {
    const flagged = items
      .filter(({ question }) => {
        const { key, others } = lengths(question);
        return (
          key >= MIN_FLAGGED_LENGTH &&
          others.every((other) => key > MAX_LENGTH_RATIO * other)
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

  // A review shows one question alone: no explanation, worked example, or
  // neighboring question. A prompt that points at any of them is unanswerable.
  const ELSEWHERE = [
    /\bthe (worked )?example\b/i,
    /\bthe (class|struct|enum|function|program|code|loop|table) above\b/i,
    /\bthe [A-Z]\w* above\b/,
    /\bthe previous (table|curve|program|code|question|example)\b/i,
  ];

  it('never relies on the worked example or another question, which reviews do not show', () => {
    const flagged = items
      .filter(({ question }) =>
        ELSEWHERE.some((pattern) => pattern.test(question.prompt)),
      )
      .map(({ question }) => question.id);
    expect(flagged).toEqual([]);
  });
});
