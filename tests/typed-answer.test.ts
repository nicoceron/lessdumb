import { describe, expect, it } from 'vitest';
import {
  skillById,
  skills,
  validateCurriculum,
  type CurriculumCatalog,
  type KnowledgePoint,
  type NumericQuestion,
  type Question,
  type Skill,
  type TextQuestion,
} from '../src/lib/curriculum';
import {
  acceptedAnswer,
  EMPTY_RESPONSE,
  formatNumber,
  gradeAnswer,
  gradeNumeric,
  gradeText,
  gradeTyped,
  lenientText,
  NOT_A_NUMBER,
  normalizeText,
  parseNumber,
  synonymCollisionErrors,
  TYPED_RESPONSE_MAX_LENGTH,
  typedQuestionErrors,
  unitSuffix,
} from '../src/lib/typed-answer';
import {
  applyAttempt,
  DAY_MS,
  emptyProgress,
  getSkillState,
  isMastered,
  lessonState,
  selectQuestion,
  type Progress,
} from '../src/lib/learning';
import { reviewCycleComplete } from '../src/lib/lesson-plan';
import { cardBlocks } from '../src/lib/card-text';
import { cardWithText } from '../src/lib/cards';
import {
  decodeIndex,
  encodeIndex,
  buildIndex,
} from '../src/lib/catalog-outline';
import { createState, recordLearningAnswer } from '../src/lib/state';
import { parseStateUpdate } from '../src/lib/server/state-validation';
import {
  activeQuiz,
  answerQuiz,
  quizQuestion,
  startQuiz,
} from '../src/lib/quiz';
import {
  beliefs,
  diagnosticQuestion,
  TYPED_GUESS,
  type DiagnosticAnswer,
} from '../src/lib/placement';
import { earnedXp, lessonXp, REVIEW_XP } from '../src/lib/xp';
import { masterSkill } from './helpers/mastery';

const NOW = Date.parse('2026-10-01T16:00:00Z');

const numeric = (
  answer: number,
  extra: Partial<NumericQuestion> = {},
): NumericQuestion => ({
  id: 'fixture-q',
  type: 'numeric',
  prompt: 'How many?',
  answer,
  explanation: 'Count them.',
  ...extra,
});
/** A name, keyword, or term: graded in equivalent forms. */
const text = (
  answers: string[],
  extra: Partial<TextQuestion> = {},
): TextQuestion => ({
  id: 'fixture-q',
  type: 'text',
  prompt: 'Which function returns the length?',
  answers,
  explanation: 'That one.',
  ...extra,
});
/** What a program prints: graded exactly. */
const output = (
  answers: string[],
  extra: Partial<TextQuestion> = {},
): TextQuestion =>
  text(answers, {
    prompt: 'What does it print?',
    code: `print(${JSON.stringify(answers[0])})`,
    explanation: 'It prints that.',
    checksOutput: true,
    ...extra,
  });

describe('reading a typed number', () => {
  it('accepts integers, decimals, negatives, simple fractions, and scientific notation', () => {
    expect(parseNumber('42')).toBe(42);
    expect(parseNumber('  -3.5 ')).toBe(-3.5);
    expect(parseNumber('+7')).toBe(7);
    expect(parseNumber('.25')).toBe(0.25);
    expect(parseNumber('3/4')).toBe(0.75);
    expect(parseNumber('-3 / 4')).toBe(-0.75);
    expect(parseNumber('1e-3')).toBe(0.001);
    expect(parseNumber('2.5E6')).toBe(2_500_000);
    // A phone keyboard's minus sign is still a minus.
    expect(parseNumber('−2')).toBe(-2);
  });

  it('rejects anything else as not a number', () => {
    for (const value of [
      '',
      '   ',
      'abc',
      '3/0',
      '1/2/3',
      '1.5/2',
      '0x10',
      'Infinity',
      '1e999',
      '5 apples',
      '--3',
    ])
      expect(parseNumber(value), value).toBeNull();
  });

  it('shows answers without floating-point noise, as fractions when they repeat', () => {
    expect(formatNumber(0.1 + 0.2)).toBe('0.3');
    expect(formatNumber(5 / 6)).toBe('5/6');
    expect(formatNumber(-1 / 3)).toBe('-1/3');
    expect(formatNumber(0.0625)).toBe('0.0625');
    expect(formatNumber(1_000)).toBe('1000');
  });
});

describe('grading numeric answers', () => {
  it('grades an exact answer, and equal forms of it, as correct', () => {
    const question = numeric(0.75);
    expect(gradeNumeric(question, '0.75')).toEqual({ status: 'correct' });
    expect(gradeNumeric(question, '3/4')).toEqual({ status: 'correct' });
    expect(gradeNumeric(question, '7.5e-1')).toEqual({ status: 'correct' });
    expect(gradeNumeric(question, '0.76')).toEqual({ status: 'incorrect' });
    // Floating-point rounding is not a wrong answer.
    expect(gradeNumeric(numeric(0.3), String(0.1 + 0.2))).toEqual({
      status: 'correct',
    });
  });

  it('accepts a response within the absolute tolerance, including its edge', () => {
    const question = numeric(0.731, { tolerance: 0.0005 });
    expect(gradeNumeric(question, '0.731')).toEqual({ status: 'correct' });
    expect(gradeNumeric(question, '0.7315')).toEqual({ status: 'correct' });
    expect(gradeNumeric(question, '0.7305')).toEqual({ status: 'correct' });
    expect(gradeNumeric(question, '0.7316')).toEqual({ status: 'incorrect' });
    expect(gradeNumeric(question, '0.73')).toEqual({ status: 'incorrect' });
    const fraction = numeric(5 / 6, { tolerance: 0.0005 });
    expect(gradeNumeric(fraction, '5/6')).toEqual({ status: 'correct' });
    expect(gradeNumeric(fraction, '0.833')).toEqual({ status: 'correct' });
    expect(gradeNumeric(fraction, '0.83')).toEqual({ status: 'incorrect' });
  });

  it('asks again, without a miss, when the response is not a number', () => {
    expect(gradeNumeric(numeric(3), 'three')).toEqual({
      status: 'invalid',
      message: NOT_A_NUMBER,
    });
    expect(gradeNumeric(numeric(1000), '1.000,5')).toMatchObject({
      status: 'invalid',
    });
    expect(gradeNumeric(numeric(3), ' ')).toEqual({
      status: 'invalid',
      message: EMPTY_RESPONSE,
    });
  });
});

describe('grading output answers', () => {
  it('ignores surrounding and repeated spaces but not the characters', () => {
    const question = output(['[1, 2]']);
    expect(gradeText(question, '  [1, 2] ')).toEqual({ status: 'correct' });
    expect(gradeText(question, '[1,   2]')).toEqual({ status: 'correct' });
    expect(gradeText(question, '[1,2]')).toEqual({ status: 'incorrect' });
    expect(gradeText(question, '[2, 1]')).toEqual({ status: 'incorrect' });
    expect(gradeText(question, '(1, 2)')).toEqual({ status: 'incorrect' });
  });

  it('is case-sensitive, and an exact question too unless it ignores case', () => {
    expect(gradeText(output(['True']), 'true')).toEqual({
      status: 'incorrect',
    });
    expect(gradeText(text(['Len'], { exact: true }), 'len')).toEqual({
      status: 'incorrect',
    });
    expect(
      gradeText(text(['len'], { exact: true, ignoreCase: true }), 'LEN'),
    ).toEqual({ status: 'correct' });
  });

  it('compares multi-line output line by line, ignoring trailing spaces and line endings', () => {
    const question = output(['first\nsecond']);
    expect(gradeText(question, 'first  \r\nsecond\n')).toEqual({
      status: 'correct',
    });
    expect(gradeText(question, '\nfirst\nsecond\n\n')).toEqual({
      status: 'correct',
    });
    expect(gradeText(question, 'first second')).toEqual({
      status: 'incorrect',
    });
    expect(gradeText(question, 'second\nfirst')).toEqual({
      status: 'incorrect',
    });
  });

  it('straightens curly quotes from phone keyboards', () => {
    expect(gradeText(output(["['a']"]), '[‘a’]')).toEqual({
      status: 'correct',
    });
    expect(normalizeText(' a \t b \n\n c ')).toBe('a b\n\nc');
  });

  it('treats a blank or overlong response as not gradable', () => {
    expect(gradeText(output(['x']), ' \n ')).toMatchObject({
      status: 'invalid',
    });
    expect(
      gradeTyped(output(['x']), 'x'.repeat(TYPED_RESPONSE_MAX_LENGTH + 1)),
    ).toMatchObject({ status: 'invalid' });
  });

  it('shows the accepted answer with its tolerance', () => {
    expect(acceptedAnswer(text(['len', 'length']))).toBe('len');
    expect(acceptedAnswer(numeric(0.731, { tolerance: 0.0005 }))).toBe(
      '0.731 (± 0.0005)',
    );
  });

  it('grades quiz and placement answers by kind', () => {
    const choice: Question = {
      id: 'fixture-q',
      type: 'choice',
      prompt: 'Pick',
      choices: ['a', 'b', 'c', 'd'],
      answer: 2,
      explanation: '',
    };
    expect(gradeAnswer(choice, 2)).toBe(true);
    expect(gradeAnswer(choice, 1)).toBe(false);
    expect(() => gradeAnswer(choice, 4)).toThrow('Unknown choice.');
    expect(() => gradeAnswer(choice, '2')).toThrow('Unknown choice.');
    expect(gradeAnswer(numeric(3), ' 3 ')).toBe(true);
    expect(gradeAnswer(numeric(3), '4')).toBe(false);
    expect(() => gradeAnswer(numeric(3), 'three')).toThrow(NOT_A_NUMBER);
    expect(() => gradeAnswer(numeric(3), 3)).toThrow('Type an answer.');
  });
});

describe('validating typed questions', () => {
  it('accepts well-formed numeric and text questions', () => {
    expect(typedQuestionErrors(numeric(0.75))).toEqual([]);
    expect(
      typedQuestionErrors(numeric(5 / 6, { tolerance: 0.0005, unit: '%' })),
    ).toEqual([]);
    expect(typedQuestionErrors(output(['3\n4']))).toEqual([]);
    expect(typedQuestionErrors(text(['len', 'length']))).toEqual([]);
    expect(typedQuestionErrors(text(['len', 'LEN'], { exact: true }))).toEqual(
      [],
    );
  });

  it('rejects an answer or tolerance that cannot be graded as intended', () => {
    expect(typedQuestionErrors(numeric(Number.NaN))).toHaveLength(1);
    expect(typedQuestionErrors(numeric(2, { tolerance: -1 })).join()).toContain(
      'nonnegative',
    );
    expect(typedQuestionErrors(numeric(2, { tolerance: 2 })).join()).toContain(
      'would accept 0',
    );
    expect(typedQuestionErrors(numeric(2, { unit: ' ' })).join()).toContain(
      'empty unit',
    );
  });

  it('rejects blank, duplicate, long, or spacing-dependent text answers', () => {
    expect(typedQuestionErrors(text([])).join()).toContain('at least one');
    expect(typedQuestionErrors(text([' '])).join()).toContain('blank');
    expect(
      typedQuestionErrors(text(['Len', 'len'], { ignoreCase: true })).join(),
    ).toContain('distinct');
    expect(typedQuestionErrors(text(['a\nb\nc\nd'])).join()).toContain(
      'at most 3 lines',
    );
    // Case folding makes these one answer.
    expect(typedQuestionErrors(text(['len', 'LEN'])).join()).toContain(
      'distinct',
    );
    expect(typedQuestionErrors(output(['x  y'])).join()).toContain('spacing');
    expect(
      typedQuestionErrors(output(['True'], { ignoreCase: true })).join(),
    ).toContain('exactly its output');
    expect(typedQuestionErrors(output(['1', '1.0'])).join()).toContain(
      'exactly its output',
    );
  });
});

// A test-only course taught entirely with typed questions.
function point(skillId: string, index: number, questions: Question[]) {
  const id = `${skillId}-kp${index + 1}`;
  return {
    id,
    title: `Point ${index + 1}`,
    explanation: ['Explanation.'],
    example: { code: '', output: '', explanation: 'Example.', kind: 'text' },
    questions: questions.map((question, q) => ({
      ...question,
      id: `${id}-q${q + 1}`,
    })),
  } satisfies KnowledgePoint;
}
const typedSkill: Skill = {
  id: 'fixture-typed',
  courseId: 'fixture-course',
  domain: 'mathematics',
  unitId: 'fixture-unit',
  title: 'Typed answers',
  summary: 'Every answer is typed.',
  prerequisites: [],
  order: 0,
  estimatedMinutes: 6,
  lesson: {
    paragraphs: ['Type each answer.'],
    example: { code: '', output: '', explanation: 'Example.', kind: 'text' },
  },
  knowledgePoints: [
    point('fixture-typed', 0, [numeric(4), numeric(6), numeric(0.5)]),
    point('fixture-typed', 1, [
      output(['3\n4'], { code: 'print(3)\nprint(4)' }),
      text(['len'], { ignoreCase: true }),
      text(['None'], { caseSensitive: true }),
    ]),
  ],
  questions: [],
  flashcards: [],
};
const catalog: CurriculumCatalog = {
  skills: [typedSkill],
  courses: [
    {
      id: 'fixture-course',
      title: 'Fixture',
      description: 'Test-only catalog.',
      domain: 'mathematics',
      skillIds: [typedSkill.id],
    },
  ],
  units: [
    {
      id: 'fixture-unit',
      title: 'Unit',
      description: 'Test-only unit.',
      courseId: 'fixture-course',
    },
  ],
};
const [kp1, kp2] = typedSkill.knowledgePoints!;
function answer(
  progress: Progress,
  questionId: string,
  correct: boolean,
  at = NOW,
  mode: 'learn' | 'review' = 'learn',
  response?: string,
) {
  return applyAttempt(
    progress,
    { skillId: typedSkill.id, questionId, correct, mode, response },
    at,
    catalog,
  );
}

describe('typed questions in the engine', () => {
  it('validates and indexes a typed course like any other', () => {
    expect(validateCurriculum(catalog.skills, catalog)).toEqual([]);
    const index = buildIndex(catalog);
    const decoded = decodeIndex(encodeIndex(index));
    expect(decoded.skills[0].knowledgePoints).toEqual(
      index.skills[0].knowledgePoints,
    );
    expect(
      decoded.skills[0].knowledgePoints!.flatMap((p) =>
        p.questions.map((q) => q.type),
      ),
    ).toEqual(['numeric', 'numeric', 'numeric', 'text', 'text', 'text']);
  });

  it('passes a point with two correct typed answers and pays the same XP as choices', () => {
    let progress = emptyProgress(NOW, 'UTC');
    expect(selectQuestion(progress, typedSkill, 'learn').type).toBe('numeric');
    progress = answer(progress, kp1.questions[0].id, true, NOW, 'learn', '4');
    progress = answer(progress, kp1.questions[1].id, true, NOW, 'learn', '6');
    expect(lessonState(progress, typedSkill).steps[0].status).toBe('passed');
    progress = answer(progress, kp2.questions[0].id, true);
    progress = answer(progress, kp2.questions[1].id, true);
    expect(isMastered(progress, typedSkill.id, catalog)).toBe(true);
    expect(progress.attempts.at(-1)).toMatchObject({
      outcome: 'lesson-passed',
      xp: earnedXp(lessonXp(typedSkill), 0, true),
    });
    expect(progress.attempts[0].response).toBe('4');
  });

  it('fails the attempt after three wrong typed answers on one point', () => {
    let progress = emptyProgress(NOW, 'UTC');
    for (const [index, q] of kp1.questions.entries())
      progress = answer(progress, q.id, false, NOW + index, 'learn', '99');
    expect(progress.attempts.at(-1)?.outcome).toBe('lesson-failed');
    expect(progress.attempts.map((a) => a.response)).toEqual([
      '99',
      '99',
      '99',
    ]);
    expect(getSkillState(progress, typedSkill.id).questionIds).toEqual([]);
  });

  it('completes a review cycle with typed answers, which meet a choice requirement', () => {
    let progress = emptyProgress(NOW, 'UTC');
    for (const q of [
      ...kp1.questions.slice(0, 2),
      ...kp2.questions.slice(0, 2),
    ])
      progress = answer(progress, q.id, true);
    const due = NOW + DAY_MS;
    expect(
      reviewCycleComplete(typedSkill, [
        kp1.questions[2].id,
        kp2.questions[2].id,
      ]),
    ).toBe(true);
    const first = selectQuestion(progress, typedSkill, 'review');
    progress = answer(progress, first.id, true, due, 'review');
    const second = selectQuestion(progress, typedSkill, 'review');
    progress = answer(progress, second.id, true, due, 'review');
    expect(progress.attempts.at(-1)).toMatchObject({
      outcome: 'review-passed',
      xp: earnedXp(REVIEW_XP, 0, true),
    });
    expect(getSkillState(progress, typedSkill.id).dueAt).toBeGreaterThan(due);
  });

  it('keeps what was typed on the attempt and puts the accepted answer on the mistake card', () => {
    const skill = skillById['print-output'];
    const question = skill.knowledgePoints![0].questions.find(
      (q) => q.type === 'text',
    ) as TextQuestion;
    expect(question).toBeDefined();
    const state = recordLearningAnswer(createState(), {
      skillId: skill.id,
      questionId: question.id,
      correct: false,
      mode: 'learn',
      response: '"Ready"',
    });
    expect(state.progress.attempts[0].response).toBe('"Ready"');
    // The accepted answer is literal text, as the lesson shows it (CEN-128).
    const card = cardWithText(state.cards[0])!;
    expect(cardBlocks(card.back)).toEqual([
      { kind: 'code', text: question.answers[0] },
      { kind: 'prose', text: question.explanation },
    ]);
    expect(card.front).toContain(question.code);
    // The card is a reference: what was typed stays on the attempt only.
    expect(JSON.stringify(state.cards)).not.toContain('Ready');
    // A choice answer records no response.
    const choice = skill.knowledgePoints![0].questions.find(
      (q) => q.type === 'choice',
    )!;
    const chosen = recordLearningAnswer(createState(), {
      skillId: skill.id,
      questionId: choice.id,
      correct: true,
      mode: 'learn',
      response: 'ignored',
    });
    expect(chosen.progress.attempts[0].response).toBeUndefined();
  });

  it('saves and validates typed responses, rejecting overlong ones', () => {
    const skill = skillById['print-output'];
    const question = skill.knowledgePoints![0].questions.find(
      (q) => q.type === 'text',
    )!;
    const state = recordLearningAnswer(createState(), {
      skillId: skill.id,
      questionId: question.id,
      correct: true,
      mode: 'learn',
      response: 'Ready',
    });
    expect(
      parseStateUpdate({ state, revision: 0 }).state.progress.attempts[0],
    ).toMatchObject({ response: 'Ready' });
    const tampered = structuredClone(state);
    tampered.progress.attempts[0].response = 'x'.repeat(
      TYPED_RESPONSE_MAX_LENGTH + 1,
    );
    expect(() => parseStateUpdate({ state: tampered, revision: 0 })).toThrow(
      'response',
    );
  });
});

describe('equivalent numeric answers (CEN-161)', () => {
  it('accepts a leading plus sign on every form', () => {
    expect(parseNumber('+42')).toBe(42);
    expect(parseNumber('+0.5')).toBe(0.5);
    expect(parseNumber('+3/4')).toBe(0.75);
    expect(parseNumber('+1e3')).toBe(1000);
    expect(parseNumber('+1,000')).toBe(1000);
    expect(gradeNumeric(numeric(7), '+7')).toEqual({ status: 'correct' });
    for (const value of ['++4', '+-4', '+ 4', '+'])
      expect(parseNumber(value), value).toBeNull();
  });

  it('accepts thousands grouped by commas or spaces when unambiguous', () => {
    expect(parseNumber('1,000')).toBe(1000);
    expect(parseNumber('12,345,678')).toBe(12_345_678);
    expect(parseNumber('-1,234.5')).toBe(-1234.5);
    expect(parseNumber('1 000')).toBe(1000);
    expect(parseNumber('1 000 000')).toBe(1_000_000);
    // No-break, thin, and narrow no-break spaces from keyboards and pastes.
    expect(parseNumber('1 000')).toBe(1000);
    expect(parseNumber('1 000')).toBe(1000);
    expect(parseNumber('1 000.25')).toBe(1000.25);
    expect(gradeNumeric(numeric(1000), '1,000')).toEqual({
      status: 'correct',
    });
    expect(gradeNumeric(numeric(1000), '1 000')).toEqual({
      status: 'correct',
    });
    expect(gradeNumeric(numeric(1000), '1,001')).toEqual({
      status: 'incorrect',
    });
  });

  it('rejects separators that could be a decimal comma or a typo', () => {
    for (const value of [
      '1,5',
      '0,25',
      '12,34',
      '1,00',
      '1,0000',
      '1000,000',
      '10,00,000',
      ',000',
      '1,000,',
      '1,000 000',
      '1 000,000',
      '1 00',
      '1  000',
      '1.000,5',
      '1,000/4',
      '1,000e3',
    ])
      expect(parseNumber(value), value).toBeNull();
    // Not a number, so not a miss: the learner is asked again.
    expect(gradeNumeric(numeric(1.5), '1,5')).toEqual({
      status: 'invalid',
      message: NOT_A_NUMBER,
    });
  });

  it('accepts the declared unit as a suffix, with or without a space', () => {
    const ms = numeric(250, { unit: 'ms' });
    expect(gradeNumeric(ms, '250')).toEqual({ status: 'correct' });
    expect(gradeNumeric(ms, '250 ms')).toEqual({ status: 'correct' });
    expect(gradeNumeric(ms, '250ms')).toEqual({ status: 'correct' });
    expect(gradeNumeric(ms, '1/4 ms')).toMatchObject({ status: 'incorrect' });
    expect(gradeNumeric(numeric(50, { unit: '%' }), '50%')).toEqual({
      status: 'correct',
    });
    expect(gradeNumeric(numeric(1200, { unit: 'km' }), '1,200 km')).toEqual({
      status: 'correct',
    });
    expect(parseNumber('250 ms', 'ms')).toBe(250);
  });

  it('rejects another unit, a unit in another case, or a unit not declared', () => {
    const ms = numeric(250, { unit: 'ms' });
    for (const value of ['250 s', '250 MS', 'ms 250', '250 ms ms', 'ms'])
      expect(gradeNumeric(ms, value), value).toMatchObject({
        status: 'invalid',
      });
    expect(gradeNumeric(numeric(250), '250 ms')).toMatchObject({
      status: 'invalid',
    });
    expect(parseNumber('50%')).toBeNull();
  });

  it('treats a format hint as a hint, never as a suffix', () => {
    expect(unitSuffix('ms')).toBe('ms');
    expect(unitSuffix('km/h')).toBe('km/h');
    expect(unitSuffix('%')).toBe('%');
    expect(unitSuffix('to 3 decimals')).toBeUndefined();
    expect(unitSuffix('fraction or 3 decimals')).toBeUndefined();
    expect(unitSuffix('m2')).toBeUndefined();
    expect(unitSuffix(undefined)).toBeUndefined();
    const rounded = numeric(0.731, {
      tolerance: 0.0005,
      unit: 'to 3 decimals',
    });
    expect(gradeNumeric(rounded, '0.731')).toEqual({ status: 'correct' });
    expect(gradeNumeric(rounded, '0.731 to 3 decimals')).toMatchObject({
      status: 'invalid',
    });
  });
});

describe('equivalent text answers (CEN-161)', () => {
  it('ignores case unless the question is case-sensitive', () => {
    const len = text(['len']);
    for (const value of ['len', 'LEN', 'Len'])
      expect(gradeText(len, value), value).toEqual({ status: 'correct' });
    expect(gradeText(len, 'lent')).toEqual({ status: 'incorrect' });
    const none = text(['None'], { caseSensitive: true });
    expect(gradeText(none, 'None')).toEqual({ status: 'correct' });
    expect(gradeText(none, '`None`')).toEqual({ status: 'correct' });
    for (const value of ['none', 'NONE', 'nOne'])
      expect(gradeText(none, value), value).toEqual({ status: 'incorrect' });
  });

  it('removes wrapping quotes and backticks, in matched pairs only', () => {
    const len = text(['len']);
    for (const value of [
      '"len"',
      "'len'",
      '`len`',
      '“len”',
      '‘len’',
      '`"len"`',
      '" len "',
    ])
      expect(gradeText(len, value), value).toEqual({ status: 'correct' });
    for (const value of ['"len', "len'", '"len\'', '`len"', 'l"e"n'])
      expect(gradeText(len, value), value).toEqual({ status: 'incorrect' });
  });

  it('removes trailing punctuation, but not leading or inner punctuation', () => {
    const len = text(['len']);
    for (const value of [
      'len.',
      'len!',
      'len?',
      'len;',
      'len:',
      'len,',
      'len...',
      '"len".',
      '`len`;',
    ])
      expect(gradeText(len, value), value).toEqual({ status: 'correct' });
    for (const value of ['.len', 'l.en', 'len()', '-len', 'len-'])
      expect(gradeText(len, value), value).toEqual({ status: 'incorrect' });
    expect(lenientText(' "Len." ')).toBe('len');
    expect(lenientText(' "Len." ', true)).toBe('Len');
  });

  it('accepts every authored synonym and nothing else', () => {
    const append = text(['append', 'list.append']);
    expect(gradeText(append, 'list.append')).toEqual({ status: 'correct' });
    expect(gradeText(append, 'List.Append')).toEqual({ status: 'correct' });
    expect(gradeText(append, '`list.append`')).toEqual({ status: 'correct' });
    expect(gradeText(append, 'extend')).toEqual({ status: 'incorrect' });
    expect(gradeText(append, 'list')).toEqual({ status: 'incorrect' });
  });

  it('treats a response that is only quotes or punctuation as blank', () => {
    for (const value of ['""', '``', '.', '?!'])
      expect(gradeText(text(['len']), value), value).toEqual({
        status: 'invalid',
        message: EMPTY_RESPONSE,
      });
  });

  it('keeps an exact question exact: quotes, punctuation, and case count', () => {
    const char = text(["'a'"], { exact: true });
    expect(gradeText(char, " 'a' ")).toEqual({ status: 'correct' });
    for (const value of ['a', '"a"', "'A'", "'a'."])
      expect(gradeText(char, value), value).toEqual({ status: 'incorrect' });
  });

  it('keeps output questions exact after whitespace normalization', () => {
    const ready = output(['Ready']);
    expect(gradeText(ready, '  Ready ')).toEqual({ status: 'correct' });
    for (const value of [
      'ready',
      'READY',
      '"Ready"',
      '`Ready`',
      'Ready.',
      'Ready!',
    ])
      expect(gradeText(ready, value), value).toEqual({ status: 'incorrect' });
    const quoted = output(["'hi'"]);
    expect(gradeText(quoted, "'hi'")).toEqual({ status: 'correct' });
    expect(gradeText(quoted, 'hi')).toEqual({ status: 'incorrect' });
  });

  it('grades quiz and placement answers with the same rules', () => {
    expect(gradeAnswer(text(['len']), '"LEN".')).toBe(true);
    expect(gradeAnswer(output(['Ready']), 'ready')).toBe(false);
    expect(gradeAnswer(numeric(1000, { unit: 'ms' }), '+1,000 ms')).toBe(true);
  });
});

describe('validating equivalent typed answers (CEN-161)', () => {
  it('flags an output question marked case-sensitive or exact', () => {
    expect(
      typedQuestionErrors(output(['x'], { caseSensitive: true })).join(),
    ).toContain('always graded exactly');
    expect(
      typedQuestionErrors(output(['x'], { exact: true })).join(),
    ).toContain('always graded exactly');
    expect(
      typedQuestionErrors(
        text(['x'], { exact: true, caseSensitive: true }),
      ).join(),
    ).toContain('drop caseSensitive');
  });

  it('flags a question that asks what code prints but is not an output question', () => {
    expect(
      typedQuestionErrors(
        text(['3'], { prompt: 'What does this print?', code: 'print(3)' }),
      ).join(),
    ).toContain('make it an output question');
    expect(
      typedQuestionErrors(
        text(['len'], { prompt: 'Which function is called?', code: 'len(xs)' }),
      ),
    ).toEqual([]);
    // Without code, "print" is a word in a term question.
    expect(
      typedQuestionErrors(
        text(['print'], { prompt: 'Which function prints a value?' }),
      ),
    ).toEqual([]);
  });

  it('flags answers that lenient grading would change: mark them exact', () => {
    for (const answer of ["'a'", '`x`', 'x += 1;', '?', 'done.'])
      expect(typedQuestionErrors(text([answer])).join(), answer).toContain(
        'mark the question exact',
      );
    expect(typedQuestionErrors(text(["'a'"], { exact: true }))).toEqual([]);
    expect(typedQuestionErrors(text(['x += 1;'], { exact: true }))).toEqual([]);
  });

  it('asks a capitalized answer to say whether case matters', () => {
    expect(typedQuestionErrors(text(['True'])).join()).toContain(
      'set caseSensitive',
    );
    expect(
      typedQuestionErrors(text(['True'], { caseSensitive: true })),
    ).toEqual([]);
    expect(typedQuestionErrors(text(['NumPy'], { ignoreCase: true }))).toEqual(
      [],
    );
    expect(
      typedQuestionErrors(
        text(['True'], { caseSensitive: true, ignoreCase: true }),
      ).join(),
    ).toContain('contradict');
  });

  it('rejects a synonym that a related choice question counts wrong', () => {
    const choice = (choices: string[], id = 'fixture-c'): Question => ({
      id,
      type: 'choice',
      prompt: 'Which method adds one item to the end of a list?',
      choices,
      answer: 0,
      explanation: '',
    });
    const methods = choice(['`append`', '`extend`', '`insert`', '`add`']);
    expect(synonymCollisionErrors([text(['append']), methods])).toEqual([]);
    expect(
      synonymCollisionErrors([text(['append', 'extend']), methods]).join(),
    ).toContain('accepts "`extend`", which fixture-c counts wrong');
    // Case folding collides too: True is a distractor where true is right.
    const literals = choice(['true', 'True', 'TRUE', '1']);
    expect(synonymCollisionErrors([text(['true']), literals])).toHaveLength(2);
    expect(
      synonymCollisionErrors([
        text(['true'], { caseSensitive: true }),
        literals,
      ]),
    ).toEqual([]);
    // A choice question about something else is not related.
    expect(
      synonymCollisionErrors([
        text(['len']),
        choice(['`append`', '`len`', '`insert`', '`add`']),
      ]),
    ).toEqual([]);
    // Exact questions accept only their listed answers.
    expect(
      synonymCollisionErrors([text(['true'], { exact: true }), literals]),
    ).toEqual([]);
  });

  it('reports synonym collisions when validating a catalog', () => {
    const [first, second] = typedSkill.knowledgePoints!;
    const colliding: Skill = {
      ...typedSkill,
      knowledgePoints: [
        first,
        {
          ...second,
          questions: [
            ...second.questions,
            {
              id: `${second.id}-q4`,
              type: 'choice',
              prompt: 'Which value is missing?',
              choices: ['None', 'none', 'Null', 'nil'],
              answer: 0,
              explanation: 'None is Python’s missing value.',
            },
          ],
        },
      ],
    };
    expect(
      validateCurriculum([colliding], { ...catalog, skills: [colliding] }),
    ).toEqual([]);
    const lenient: Skill = {
      ...colliding,
      knowledgePoints: [
        first,
        {
          ...colliding.knowledgePoints![1],
          questions: colliding.knowledgePoints![1].questions.map((q) =>
            q.type === 'text' && q.answers[0] === 'None'
              ? { ...q, caseSensitive: undefined, ignoreCase: true }
              : q,
          ),
        },
      ],
    };
    expect(
      validateCurriculum([lenient], { ...catalog, skills: [lenient] }).join(),
    ).toContain('which fixture-typed-kp2-q4 counts wrong');
  });
});

describe('typed questions in quizzes and placement', () => {
  it('grades a typed quiz answer from its text and keeps that text', () => {
    let progress = emptyProgress(NOW, 'UTC');
    for (const skill of skills.filter(
      (item) => item.courseId === 'python-foundations',
    ))
      progress = masterSkill(progress, skill.id, NOW);
    progress = { ...progress, totalXp: 1000 };
    progress = startQuiz(progress, 'python-foundations', NOW);
    const quiz = activeQuiz(progress)!;
    const index = quiz.questions.findIndex(
      (slot) => quizQuestion(slot)?.question.type === 'text',
    );
    expect(index).toBeGreaterThanOrEqual(0);
    const { question } = quizQuestion(quiz.questions[index])! as {
      question: TextQuestion;
    };
    // Spacing noise does not matter; the answer is recorded as typed.
    const typed = `  ${question.answers[0]}  `;
    const answered = answerQuiz(progress, quiz.id, index, typed, NOW + 1000);
    const slot = activeQuiz(answered)!.questions[index];
    expect(slot).toMatchObject({ answer: typed, correct: true });
    const wrong = answerQuiz(progress, quiz.id, index, 'nope', NOW + 1000);
    expect(activeQuiz(wrong)!.questions[index]).toMatchObject({
      answer: 'nope',
      correct: false,
    });
    expect(() =>
      answerQuiz(progress, quiz.id, index, '   ', NOW + 1000),
    ).toThrow(EMPTY_RESPONSE);
    expect(
      parseStateUpdate({
        state: { ...createState(), progress: answered },
        revision: 0,
      }).state.progress.quizzes![0].questions[index].answer,
    ).toBe(typed);
  });

  it('counts a correct typed placement answer as stronger evidence than a correct choice', () => {
    const skill = skillById.variables;
    const questions = skill.knowledgePoints!.flatMap((p) => p.questions);
    const typed = questions.find((q) => q.type === 'text')!;
    const choice = questions.find((q) => q.type === 'choice')!;
    expect(
      diagnosticQuestion({ skillId: skill.id, questionId: typed.id }),
    ).toBeDefined();
    const evidence = (questionId: string): DiagnosticAnswer => ({
      skillId: skill.id,
      questionId,
      presentation: 0,
      answer: 0,
      correct: true,
      at: NOW,
    });
    const after = (questionId: string) =>
      beliefs(emptyProgress(NOW, 'UTC'), {
        courseId: 'python-foundations',
        answers: [evidence(questionId)],
      }).get(skill.id)!;
    expect(TYPED_GUESS).toBeLessThan(1 / 4);
    expect(after(typed.id)).toBeGreaterThan(after(choice.id));
  });
});
