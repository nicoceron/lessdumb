import { describe, expect, it } from 'vitest';
import * as curriculum from '../src/lib/curriculum';
import type { Question } from '../src/lib/curriculum';
import {
  cardBlocks,
  cardText,
  mistakeCardText,
  plainText,
} from '../src/lib/card-text';
import { isUnlocked } from '../src/lib/learning';
import { mathSpans, plainProse } from '../src/lib/math-text';
import { acceptedAnswer } from '../src/lib/typed-answer';
import { createState, recordLearningAnswer } from '../src/lib/state';
import { parseStateUpdate } from '../src/lib/server/state-validation';
import { masterWithPrerequisites } from './helpers/mastery';

const questions = curriculum.skills.flatMap((skill) =>
  [
    ...skill.questions,
    ...(skill.knowledgePoints ?? []).flatMap((point) => point.questions),
  ].map((question) => ({ skill, question })),
);

/** The plain text mistake cards carried before CEN-128, plus a typed unit. */
function legacyText(question: Question) {
  const unit = question.type === 'numeric' && question.unit;
  return {
    front: `${plainProse(question.prompt)}${question.type !== 'code' && question.code ? `\n\n${question.code}` : ''}`,
    back: `${
      question.type === 'code'
        ? question.solution
        : question.type !== 'choice'
          ? `${acceptedAnswer(question)}${unit ? ` ${unit}` : ''}`
          : question.checksOutput
            ? question.choices[question.answer]
            : plainProse(question.choices[question.answer])
    }\n\n${plainProse(question.explanation)}`,
  };
}

describe('card text with prose and code (CEN-128)', () => {
  it('fences code with a run of backticks longer than any inside it', () => {
    const blocks = [
      { kind: 'prose' as const, text: 'Run `echo $HOME`:\n\nthen look.' },
      { kind: 'code' as const, text: 'print("```")\n\nx = 1' },
      { kind: 'prose' as const, text: 'It prints $3$ backticks.' },
    ];
    const text = cardText(blocks)!;
    expect(text).toBe(
      'Run `echo $HOME`:\n\nthen look.\n\n````\nprint("```")\n\nx = 1\n````\n\nIt prints $3$ backticks.',
    );
    expect(cardBlocks(text)).toEqual(blocks);
    expect(cardBlocks('Only prose, with \\$5.')).toEqual([
      { kind: 'prose', text: 'Only prose, with \\$5.' },
    ]);
  });

  it('refuses prose that would read back as code', () => {
    expect(
      cardText([{ kind: 'prose', text: 'A fence:\n\n```\nx\n```' }]),
    ).toBeUndefined();
  });

  it('round-trips every question in the catalog and keeps its plain text', () => {
    for (const { question } of questions) {
      const text = mistakeCardText(question);
      expect(text.format, question.id).toBe('prose');
      const front = cardBlocks(text.front);
      const back = cardBlocks(text.back);
      expect(front[0], question.id).toEqual({
        kind: 'prose',
        text: question.prompt,
      });
      const program = question.type !== 'code' && question.code;
      if (program) expect(front[1]).toEqual({ kind: 'code', text: program });
      expect(front).toHaveLength(program ? 2 : 1);
      // Code, program output, and typed answers are literal; choices are prose.
      expect(back[0].kind).toBe(
        question.type === 'choice' && !question.checksOutput ? 'prose' : 'code',
      );
      // Read as plain text, the card says what it said before CEN-128.
      const legacy = legacyText(question);
      expect(plainText(front)).toBe(legacy.front);
      expect(plainText(back)).toBe(legacy.back.replace(/\n\n$/, ''));
    }
  });

  it('stores authored prose, so math and escaped dollars survive', () => {
    const question: Question = {
      id: 'q',
      type: 'choice',
      prompt: 'A ticket costs \\$12. What is $12 \\times 5$?',
      choices: ['$60$', '$17$', '$65$', '$50$'],
      answer: 0,
      explanation: 'Multiply: $12 \\times 5 = 60$, so \\$60 in total.',
    };
    expect(mistakeCardText(question)).toEqual({
      format: 'prose',
      front: question.prompt,
      back: `$60$\n\n${question.explanation}`,
    });
  });

  it('shows a typed answer as written, with its unit, never as math', () => {
    const numeric: Question = {
      id: 'n',
      type: 'numeric',
      prompt: 'A loop runs $n = 4$ times at $3$ ms each. How long in total?',
      answer: 12,
      tolerance: 0.5,
      unit: 'ms',
      explanation: '$4 \\times 3 = 12$.',
    };
    expect(cardBlocks(mistakeCardText(numeric).back)).toEqual([
      { kind: 'code', text: '12 (± 0.5) ms' },
      { kind: 'prose', text: numeric.explanation },
    ]);
    const text: Question = {
      id: 't',
      type: 'text',
      prompt: 'What does this print?',
      code: 'print("$5")',
      answers: ['$5'],
      checksOutput: true,
      explanation: 'The string holds a literal dollar sign.',
    };
    const card = mistakeCardText(text);
    expect(cardBlocks(card.front)).toEqual([
      { kind: 'prose', text: text.prompt },
      { kind: 'code', text: 'print("$5")' },
    ]);
    expect(cardBlocks(card.back)[0]).toEqual({ kind: 'code', text: '$5' });
  });

  it('records a wrong answer on a math question as a prose card the server accepts', () => {
    const { skill, question } = questions.find(
      ({ skill, question }) =>
        skill.courseId === 'quantitative-foundations' &&
        mathSpans(question.prompt).length > 0,
    )!;
    let progress = createState().progress;
    for (const parent of skill.prerequisites)
      progress = masterWithPrerequisites(progress, parent);
    expect(isUnlocked(progress, skill.id)).toBe(true);
    const state = recordLearningAnswer(
      { ...createState(), progress },
      {
        skillId: skill.id,
        questionId: question.id,
        correct: false,
        mode: 'learn',
      },
    );
    expect(state.cards).toHaveLength(1);
    expect(state.cards[0]).toMatchObject({
      id: `mistake:${skill.id}:${question.id}`,
      format: 'prose',
    });
    expect(cardBlocks(state.cards[0].front)[0]).toEqual({
      kind: 'prose',
      text: question.prompt,
    });
    expect(parseStateUpdate({ state, revision: 0 }).state.cards).toEqual(
      state.cards,
    );
    const broken = structuredClone(state);
    (broken.cards[0] as { format: string }).format = 'html';
    expect(() => parseStateUpdate({ state: broken, revision: 0 })).toThrow(
      'state.cards[0].format must be prose.',
    );
  });
});
