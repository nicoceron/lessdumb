import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  generatedQuestionErrors,
  skillById,
  skills,
  type AnswerQuestion,
  type NumericQuestion,
  type Question,
  type Skill,
} from '../src/lib/curriculum';
import { skillById as outlineById } from '../src/lib/catalog-index';
import {
  applyAttempt,
  chooseVariant,
  DAY_MS,
  emptyProgress,
  freshQuestion,
  getSkillState,
  isMastered,
  nextTask,
  RECENT_VARIANTS,
  selectQuestion,
  STATE_VERSION,
  type Attempt,
  type Progress,
} from '../src/lib/learning';
import { findQuestion } from '../src/lib/lesson-plan';
import {
  answerQuiz,
  nonQuizXp,
  quizQuestion,
  startQuiz,
} from '../src/lib/quiz';
import {
  answerDiagnostic,
  diagnosticQuestion,
  startDiagnostic,
} from '../src/lib/placement';
import {
  createState,
  migrateState,
  recordLearningAnswer,
  type LearnerState,
} from '../src/lib/state';
import { parseStateUpdate } from '../src/lib/server/state-validation';
import { mistakeCardText } from '../src/lib/card-text';
import {
  attachGenerators,
  choose,
  typeNumber,
  typeOutput,
  withKnowledgePoints,
} from '../src/lib/knowledge-points';
import {
  GENERATOR_SAMPLES,
  hash32,
  isVariant,
  MAX_VARIANT,
  MIN_DISTINCT_VARIANTS,
  questionVariant,
  random,
  rng,
  sampleVariants,
  variantKey,
  variantSeed,
} from '../src/lib/variants';
import { masterWithPrerequisites } from './helpers/mastery';
import { rightAnswer, wrongAnswer } from './helpers/answers';

const NOW = Date.parse('2026-10-01T16:00:00Z');

const generated = skills.flatMap((skill) =>
  (skill.knowledgePoints ?? []).flatMap((point) =>
    point.questions
      .filter(
        (question): question is AnswerQuestion =>
          question.generated === true && question.type !== 'code',
      )
      .map((question) => ({ skill, point, question })),
  ),
);
const pointOf = (questionId: string) =>
  generated.find((entry) => entry.question.id === questionId)!;
/** The concrete question an attempt asked. */
function asked(skill: Skill, attempt: Pick<Attempt, 'questionId' | 'variant'>) {
  const question = findQuestion(skill, attempt.questionId) as AnswerQuestion;
  return variantKey(questionVariant(question, attempt.variant));
}
/**
 * No attempt at a point repeats the concrete question of any of the learner's
 * RECENT_VARIANTS attempts before it there, in any mode.
 */
function expectNoRecentRepeat(progress: Progress, skill: Skill) {
  for (const point of skill.knowledgePoints ?? []) {
    if (!point.questions.some((question) => question.generated)) continue;
    const ids = new Set(point.questions.map((question) => question.id));
    const keys = progress.attempts
      .filter(
        (attempt) =>
          attempt.skillId === skill.id && ids.has(attempt.questionId),
      )
      .map((attempt) => asked(skill, attempt));
    keys.forEach((key, index) =>
      expect(
        keys.slice(Math.max(0, index - RECENT_VARIANTS), index),
        `${point.id} attempt ${index}`,
      ).not.toContain(key),
    );
  }
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('seeded question generators', () => {
  it('draws the same numbers from the same seed, and different ones from others', () => {
    const first = rng(42);
    const again = rng(42);
    const values = Array.from({ length: 20 }, () => first.int(0, 1000));
    expect(Array.from({ length: 20 }, () => again.int(0, 1000))).toEqual(
      values,
    );
    const other = rng(43);
    expect(Array.from({ length: 20 }, () => other.int(0, 1000))).not.toEqual(
      values,
    );
    const r = rng(7);
    for (let index = 0; index < 500; index++) {
      const value = r.int(-3, 3);
      expect(value).toBeGreaterThanOrEqual(-3);
      expect(value).toBeLessThanOrEqual(3);
    }
    expect(r.ints(5, 1, 5, true).sort()).toEqual([1, 2, 3, 4, 5]);
    expect(() => r.ints(6, 1, 5, true)).toThrow();
    expect(() => r.pick([])).toThrow();
    expect(random(1)()).toBe(random(1)());
    expect(hash32('a')).not.toBe(hash32('b'));
  });

  it('numbers variants per question and seeds each one from the question ID', () => {
    expect(variantSeed('x-kp1-q1', 0)).toBe(variantSeed('x-kp1-q1', 0));
    expect(variantSeed('x-kp1-q1', 0)).not.toBe(variantSeed('x-kp1-q2', 0));
    expect(variantSeed('x-kp1-q1', 0)).not.toBe(variantSeed('x-kp1-q1', 1));
    expect(sampleVariants()).toHaveLength(GENERATOR_SAMPLES);
    expect(sampleVariants(3)).toEqual([0, 1, 2]);
    for (const value of [0, 7, MAX_VARIANT])
      expect(isVariant(value)).toBe(true);
    for (const value of [-1, 1.5, MAX_VARIANT + 1, '3', null, NaN])
      expect(isVariant(value)).toBe(false);
  });

  it('rebuilds the same question for a variant, and keeps the authored one without', () => {
    expect(generated.length).toBeGreaterThanOrEqual(100);
    for (const { question } of generated) {
      const variant = questionVariant(question, 3);
      expect(variant).toMatchObject({
        id: question.id,
        type: question.type,
        generated: true,
        variant: 3,
      });
      // The same object for the same variant, rebuilt identically from scratch.
      expect(questionVariant(question, 3)).toBe(variant);
      expect(
        JSON.stringify(question.generate!(variantSeed(question.id, 3))),
      ).toBe(JSON.stringify(question.generate!(variantSeed(question.id, 3))));
      // No variant: the authored question, which older attempts name.
      expect(questionVariant(question)).toBe(question);
      expect(question.variant).toBeUndefined();
    }
  });

  it('never uses Math.random', () => {
    const spy = vi.spyOn(Math, 'random').mockImplementation(() => {
      throw new Error('Math.random is not seeded.');
    });
    for (const { question } of generated)
      for (const variant of sampleVariants())
        question.generate!(variantSeed(question.id, variant));
    expect(spy).not.toHaveBeenCalled();
  });

  it('gives every generator at least MIN_DISTINCT_VARIANTS distinct questions of its own type', () => {
    for (const { question } of generated) {
      const variants = sampleVariants().map((variant) =>
        questionVariant(question, variant),
      );
      expect(new Set(variants.map(variantKey)).size).toBeGreaterThanOrEqual(
        MIN_DISTINCT_VARIANTS,
      );
      for (const variant of variants) expect(variant.type).toBe(question.type);
    }
  });
});

describe('the validator samples every generator', () => {
  const base = typeNumber('What is $2 + 2$?', 4, 'Two and two make $4$.');
  const make = (fields: Partial<NumericQuestion> & Pick<Question, 'id'>) =>
    ({ ...base, ...fields }) as Question;

  it('accepts a well-formed generator', () => {
    const question = attachGenerators(
      [
        {
          id: 'demo',
          knowledgePoints: [
            { id: 'demo-kp1', questions: [make({ id: 'demo-kp1-q1' })] },
          ],
        } as unknown as Skill,
      ],
      [
        {
          'demo-kp1-q1': (r) => {
            const [a, b] = [r.int(1, 20), r.int(1, 20)];
            return typeNumber(
              `What is $${a} + ${b}$?`,
              a + b,
              `$${a} + ${b} = ${a + b}$.`,
            );
          },
        },
      ],
    )[0].knowledgePoints![0].questions[0];
    expect(question.generated).toBe(true);
    expect(generatedQuestionErrors(question)).toEqual([]);
  });

  it('rejects variants that break the structure rules', () => {
    const generate = (fields: (seed: number) => object) =>
      make({
        id: 'demo-kp1-q1',
        generated: true,
        generate: fields as NumericQuestion['generate'],
      });
    const errors = (question: Question) =>
      generatedQuestionErrors(question).join('\n');
    // Another type than the authored question.
    expect(
      errors(
        generate((seed) =>
          typeOutput('What prints?', 'print(1)', String(seed), 'It prints.'),
        ),
      ),
    ).toMatch(/must be a numeric question/);
    // Too few distinct variants.
    expect(errors(generate(() => base))).toMatch(
      new RegExp(`only 1 distinct variants in ${GENERATOR_SAMPLES} seeds`),
    );
    // Not deterministic.
    let calls = 0;
    expect(
      errors(
        generate(() => typeNumber(`What is ${calls}?`, calls++, 'Count.')),
      ),
    ).toMatch(/same seed must give the same question/);
    // Unparseable numeric answer, unbalanced math, and a throwing generator.
    expect(
      errors(generate((seed) => typeNumber(`Seed ${seed}?`, NaN, 'None.'))),
    ).toMatch(/finite number/);
    expect(
      errors(
        generate((seed) => typeNumber(`What is $${seed}?`, seed, 'It is.')),
      ),
    ).toMatch(/\$/);
    expect(
      errors(
        generate(() => {
          throw new Error('broken');
        }),
      ),
    ).toMatch(/the generator threw/);
    // A choice generator needs four distinct choices, and a text one an answer.
    const choice = {
      ...choose('Which?', ['a', 'b', 'c', 'd'], 0, 'Because.'),
      id: 'demo-kp1-q2',
      generated: true,
      generate: (seed: number) =>
        choose(`Which ${seed}?`, ['a', 'b', 'b'], 0, 'Because.'),
    } as Question;
    expect(errors(choice)).toMatch(/four or more distinct choices/);
    const text = {
      ...typeOutput('What prints?', 'print(1)', '1', 'It prints 1.'),
      id: 'demo-kp1-q3',
      generated: true,
      generate: (seed: number) => ({
        ...typeOutput(`What prints ${seed}?`, `print(${seed})`, '', 'Nothing.'),
      }),
    } as Question;
    expect(errors(text)).toMatch(/accepted answers must not be blank/);
  });

  it('rejects generators for unknown questions and code exercises', () => {
    const skill = skillById['math-mean'];
    const content = withKnowledgePoints(
      {
        courses: [],
        units: [],
        skills: [{ ...skill, knowledgePoints: undefined }],
      },
      {
        'demo.kp.ts': {
          'math-mean': [
            {
              title: 'A point',
              explanation: ['One idea.'],
              example: skill.knowledgePoints![0].example,
              questions: [base, base, base],
            },
          ],
        },
      },
      {
        'demo.gen.ts': {
          'math-mean-kp1-q9': () => base,
          'math-mean-q4': () => base,
        },
      },
    );
    expect(content.generatorFiles).toEqual(['demo.gen.ts']);
    expect(content.knowledgePointErrors).toEqual([
      'math-mean-kp1-q9: generator in demo.gen.ts for an unknown question.',
      'math-mean-q4: generator in demo.gen.ts for an unknown question.',
    ]);
  });
});

describe('choosing a question and its variant', () => {
  const { skill, point } = pointOf('math-mean-kp1-q2');
  const outline = outlineById[skill.id];
  const ready = masterWithPrerequisites(
    emptyProgress(NOW, 'UTC'),
    'accumulators',
    NOW,
  );
  const unlocked = masterWithPrerequisites(ready, 'number-builtins', NOW);

  it('serves unseen authored questions first, then a generator over a seen question', () => {
    const order: string[] = [];
    let progress = unlocked;
    for (let index = 0; index < 8; index++) {
      const question = freshQuestion(progress, skill.id, point.questions);
      order.push(question.id);
      progress = {
        ...progress,
        attempts: [
          ...progress.attempts,
          {
            id: `a${index}`,
            skillId: skill.id,
            questionId: question.id,
            correct: true,
            mode: 'review',
            usedHint: false,
            at: new Date(NOW + index).toISOString(),
            xp: 0,
            variant: chooseVariant(progress, skill, question.id),
          },
        ],
      };
    }
    // Every question once, then the generator: authored ones are seen now.
    expect(new Set(order.slice(0, 4)).size).toBe(4);
    expect(order.slice(4)).toEqual(Array(4).fill('math-mean-kp1-q2'));
    expectNoRecentRepeat(progress, skill);
    // The outline schedules the same question as the full skill.
    expect(
      freshQuestion(progress, outline.id, outline.knowledgePoints![0].questions)
        .id,
    ).toBe(freshQuestion(progress, skill.id, point.questions).id);
  });

  it('keeps a variant until it is answered, then moves to an unseen one', () => {
    const question = findQuestion(skill, 'math-mean-kp1-q2')!;
    const first = chooseVariant(unlocked, skill, question.id);
    expect(first).toBe(0);
    expect(chooseVariant(unlocked, skill, question.id)).toBe(first);
    // Authored questions have no variant.
    expect(chooseVariant(unlocked, skill, 'math-mean-kp1-q1')).toBeUndefined();
    const answered = applyAttempt(
      unlocked,
      {
        skillId: skill.id,
        questionId: question.id,
        correct: false,
        mode: 'learn',
        variant: first,
      },
      NOW,
    );
    const second = chooseVariant(answered, skill, question.id)!;
    expect(second).not.toBe(first);
    expect(
      variantKey(questionVariant(question as AnswerQuestion, second)),
    ).not.toBe(variantKey(questionVariant(question as AnswerQuestion, first)));
    // Its outline chooses the same variant.
    expect(chooseVariant(answered, outline, question.id)).toBe(second);
  });

  it('skips a variant whose question the learner already met under another number', () => {
    const question = findQuestion(skill, 'math-mean-kp1-q2') as AnswerQuestion;
    // In this copy, variant 1 asks exactly what variant 0 asked.
    const original = question.generate!;
    const lookalike = {
      ...question,
      generate: (seed: number) =>
        original(
          seed === variantSeed(question.id, 1)
            ? variantSeed(question.id, 0)
            : seed,
        ),
    } as AnswerQuestion;
    const twin = {
      ...skill,
      knowledgePoints: skill.knowledgePoints!.map((item) => ({
        ...item,
        questions: item.questions.map((candidate) =>
          candidate.id === question.id ? lookalike : candidate,
        ),
      })),
    } as Skill;
    const progress = applyAttempt(
      unlocked,
      {
        skillId: skill.id,
        questionId: question.id,
        correct: true,
        mode: 'learn',
        variant: 0,
      },
      NOW,
    );
    expect(chooseVariant(progress, skill, question.id)).toBe(1);
    expect(chooseVariant(progress, twin, question.id)).toBe(2);
  });

  it('never repeats a concrete variant of a point within the last three attempts, across lessons, retries, reviews, and quizzes', () => {
    let progress = unlocked;
    const answer = (mode: 'learn' | 'review', correct: boolean, at: number) => {
      const question = selectQuestion(progress, skill, mode);
      progress = applyAttempt(
        progress,
        {
          skillId: skill.id,
          questionId: question.id,
          correct,
          mode,
          ...(question.variant !== undefined
            ? { variant: question.variant }
            : {}),
        },
        at,
      );
    };
    // A failed lesson: three misses on the first point.
    for (let index = 0; index < 3; index++) answer('learn', false, NOW);
    expect(getSkillState(progress, skill.id).lessonFailedAt).toBe(NOW);
    // The retry passes.
    for (let index = 0; !isMastered(progress, skill.id) && index < 40; index++)
      answer('learn', true, NOW + 1);
    expect(isMastered(progress, skill.id)).toBe(true);
    // Reviews over many cycles, with occasional misses.
    let at = NOW;
    for (let cycle = 0; cycle < 12; cycle++) {
      at = Math.max(at, getSkillState(progress, skill.id).dueAt ?? at) + DAY_MS;
      for (let index = 0; index < 6; index++)
        answer('review', (cycle + index) % 5 !== 0, at);
    }
    // Quiz answers on the same point, interleaved.
    for (let quiz = 0; quiz < 6; quiz++) {
      const question = freshQuestion(progress, skill.id, point.questions);
      const variant = chooseVariant(progress, skill, question.id);
      progress = {
        ...progress,
        attempts: [
          ...progress.attempts,
          {
            id: `quiz-${quiz}`,
            skillId: skill.id,
            questionId: question.id,
            correct: true,
            mode: 'quiz',
            usedHint: false,
            at: new Date(at + quiz).toISOString(),
            xp: 0,
            quizId: `quiz-${quiz}`,
            ...(variant !== undefined ? { variant } : {}),
          },
        ],
      };
      answer('review', true, at + quiz + 1);
    }
    const atPoint = progress.attempts.filter((attempt) =>
      point.questions.some((question) => question.id === attempt.questionId),
    );
    expect(atPoint.length).toBeGreaterThan(20);
    expect(atPoint.some((attempt) => attempt.mode === 'quiz')).toBe(true);
    expectNoRecentRepeat(progress, skill);
    // The generator's own answers never repeated a variant at all here.
    const own = atPoint.filter(
      (attempt) => attempt.questionId === 'math-mean-kp1-q2',
    );
    expect(own.length).toBeGreaterThan(5);
    expect(new Set(own.map((attempt) => asked(skill, attempt))).size).toBe(
      own.length,
    );
  });

  it('schedules on outlines exactly as on full skills', () => {
    const task = nextTask(unlocked, NOW, 'quantitative-foundations');
    expect(task).not.toBeNull();
    const full = selectQuestion(unlocked, skillById[task!.skillId], task!.mode);
    expect(full.id).toBe(task!.questionId);
  });
});

describe('storing and rebuilding the variant asked', () => {
  const { skill } = pointOf('math-mean-kp1-q2');
  const question = findQuestion(skill, 'math-mean-kp1-q2') as AnswerQuestion;
  const unlocked = masterWithPrerequisites(
    masterWithPrerequisites(emptyProgress(NOW, 'UTC'), 'accumulators', NOW),
    'number-builtins',
    NOW,
  );

  it('keeps a valid variant number on attempts at generated questions only', () => {
    const record = (questionId: string, variant: unknown) =>
      applyAttempt(
        unlocked,
        {
          skillId: skill.id,
          questionId,
          correct: false,
          mode: 'learn',
          variant: variant as number,
        },
        NOW,
      ).attempts.at(-1)!;
    expect(record(question.id, 4).variant).toBe(4);
    expect(record('math-mean-kp1-q1', 4)).not.toHaveProperty('variant');
    for (const invalid of [-1, 2.5, MAX_VARIANT + 1, '4'])
      expect(record(question.id, invalid)).not.toHaveProperty('variant');
    expect(record(question.id, undefined)).not.toHaveProperty('variant');
  });

  it('puts the missed variant on the mistake card and keeps the stored state small', () => {
    let state: LearnerState = { ...createState(), progress: unlocked };
    const variant = questionVariant(question, 5);
    state = recordLearningAnswer(state, {
      skillId: skill.id,
      questionId: question.id,
      correct: false,
      mode: 'learn',
      variant: 5,
      response: '1',
    });
    const card = state.cards.find(
      (item) => item.id === `mistake:${skill.id}:${question.id}`,
    )!;
    expect(card).toMatchObject(mistakeCardText(variant));
    expect(card.front).toContain(variant.prompt);
    expect(card.front).not.toBe(mistakeCardText(question).front);
    // The attempt stores only the number, never the question.
    const attempt = state.progress.attempts.at(-1)!;
    expect(attempt.variant).toBe(5);
    expect(JSON.stringify(attempt)).not.toContain(variant.prompt);
  });

  it('validates stored variants and loads older states without them', () => {
    const progress = applyAttempt(
      unlocked,
      {
        skillId: skill.id,
        questionId: question.id,
        correct: true,
        mode: 'learn',
        variant: 2,
      },
      NOW,
    );
    const state = { ...createState(), progress };
    const saved = parseStateUpdate({
      state: JSON.parse(JSON.stringify(state)),
      revision: 0,
    }).state;
    expect(saved.progress.attempts.at(-1)!.variant).toBe(2);
    expect(saved.version).toBe(STATE_VERSION);
    expect(STATE_VERSION).toBe(7);
    for (const invalid of [-1, 1.5, MAX_VARIANT + 1, '2']) {
      const bad = JSON.parse(JSON.stringify(state));
      bad.progress.attempts.at(-1).variant = invalid;
      expect(() => parseStateUpdate({ state: bad, revision: 0 })).toThrow(
        /variant/,
      );
    }
    // A version 6 state from before generators: attempts name the authored
    // question, with no variant. It loads, migrates, and rebuilds as authored.
    const v6 = JSON.parse(JSON.stringify(state));
    v6.version = 6;
    v6.progress.version = 6;
    delete v6.progress.attempts.at(-1).variant;
    const loaded = parseStateUpdate({ state: v6, revision: 0 }).state;
    expect(loaded.version).toBe(7);
    expect(loaded.progress.version).toBe(7);
    const old = loaded.progress.attempts.at(-1)!;
    expect(old.variant).toBeUndefined();
    expect(questionVariant(question, old.variant)).toBe(question);
    expect(migrateState(loaded)).toBe(loaded);
  });

  it('asks, stores, and grades quiz variants', () => {
    // Learn Python foundations lessons until a quiz is available.
    let progress = emptyProgress(NOW, 'UTC');
    for (let index = 0; nonQuizXp(progress) < 150 && index < 400; index++) {
      const task = nextTask(progress, NOW, 'python-foundations')!;
      const asked = selectQuestion(
        progress,
        skillById[task.skillId],
        task.mode,
      );
      progress = applyAttempt(
        progress,
        {
          ...task,
          correct: true,
          ...(asked.variant !== undefined ? { variant: asked.variant } : {}),
        },
        NOW,
      );
    }
    progress = startQuiz(progress, 'python-foundations', NOW + 1);
    const quiz = progress.quizzes!.at(-1)!;
    const slots = quiz.questions.filter(
      (slot) =>
        findQuestion(skillById[slot.skillId], slot.questionId)?.generated,
    );
    expect(slots.length).toBeGreaterThan(0);
    for (const slot of slots) {
      expect(isVariant(slot.variant)).toBe(true);
      const { question: shown } = quizQuestion(slot)!;
      expect(shown.variant).toBe(slot.variant);
    }
    // Grading uses the variant shown, not the authored question.
    const index = quiz.questions.indexOf(slots[0]);
    const { question: shown } = quizQuestion(slots[0])!;
    const answered = answerQuiz(
      progress,
      quiz.id,
      index,
      rightAnswer(shown),
      NOW + 2,
    );
    const slot = answered.quizzes!.at(-1)!.questions[index];
    expect(slot.correct).toBe(true);
    expect(slot.variant).toBe(slots[0].variant);
    expect(answered.attempts.at(-1)).toMatchObject({
      mode: 'quiz',
      variant: slots[0].variant,
    });
    const wrong = answerQuiz(
      progress,
      quiz.id,
      index,
      wrongAnswer(shown),
      NOW + 2,
    );
    expect(wrong.quizzes!.at(-1)!.questions[index].correct).toBe(false);
    // The saved quiz validates with its variants.
    expect(() =>
      parseStateUpdate({
        state: { ...createState(), progress: answered },
        revision: 0,
      }),
    ).not.toThrow();
  });

  it('asks placement questions as variants', () => {
    let progress = startDiagnostic(
      emptyProgress(NOW, 'UTC'),
      'quantitative-foundations',
      NOW,
    );
    let seen = 0;
    for (let index = 0; index < 48; index++) {
      const diagnostic = progress.diagnostics!.at(-1)!;
      if (!diagnostic.current) break;
      const found = diagnosticQuestion(diagnostic.current)!;
      if (
        findQuestion(skillById[found.skill.id], found.question.id)?.generated
      ) {
        expect(isVariant(diagnostic.current.variant)).toBe(true);
        expect(found.question.variant).toBe(diagnostic.current.variant);
        seen++;
      }
      progress = answerDiagnostic(
        progress,
        diagnostic.id,
        rightAnswer(found.question),
        NOW + index,
      );
    }
    expect(seen).toBeGreaterThan(0);
    expect(() =>
      parseStateUpdate({ state: { ...createState(), progress }, revision: 0 }),
    ).not.toThrow();
  });
});
