import { describe, expect, it } from 'vitest';
import {
  courses,
  defaultCatalog,
  multistepFiles,
  skillById,
  skills,
  validateCurriculum,
  type MultistepPart,
  type MultistepProblem,
  type Skill,
} from '../src/lib/curriculum';
import {
  buildIndex,
  decodeIndex,
  encodeIndex,
} from '../src/lib/catalog-outline';
import {
  applyAttempt,
  DAY_MS,
  emptyProgress,
  getSkillState,
  isMastered,
  lessonState,
  nextTask,
  openProblem,
  partCreditWeight,
  reviewProblem,
  selectQuestion,
  type Progress,
} from '../src/lib/learning';
import { findQuestion, servedChoiceQuestions } from '../src/lib/lesson-plan';
import {
  findPart,
  MAX_PARTS,
  MIN_PARTS,
  ownPartIds,
  parsePartId,
  partEvidencePoint,
  pointSkillId,
} from '../src/lib/multistep';
import {
  answerQuiz,
  planQuiz,
  quizProblem,
  quizQuestion,
  startQuiz,
  type Quiz,
} from '../src/lib/quiz';
import { gradeAnswer } from '../src/lib/typed-answer';
import {
  createState,
  mergeStates,
  migrateState,
  recordLearningAnswer,
  type LearnerState,
} from '../src/lib/state';
import { parseStateUpdate } from '../src/lib/server/state-validation';
import { cardWithText } from '../src/lib/cards';
import { masterWithPrerequisites } from './helpers/mastery';
import { rightAnswer, wrongAnswer } from './helpers/answers';

const NOW = Date.parse('2026-10-01T16:00:00Z');
/** The next day: every skill mastered at NOW is due for its first review. */
const DUE = NOW + DAY_MS + 3_600_000;
const COURSE = 'python-foundations';
// multiple-returns builds on unpacking and return-values. Its problem's
// parts apply its own second point, then a point of each prerequisite.
const SKILL = 'multiple-returns';
const skill = skillById[SKILL];
const problem = skill.multistep![0];
const mastered = masterWithPrerequisites(emptyProgress(NOW, 'UTC'), SKILL, NOW);

/** Answer one question of the skill at `at`, right or wrong. */
function answer(
  progress: Progress,
  questionId: string,
  correct: boolean,
  mode: 'learn' | 'review' = 'review',
  at = DUE,
) {
  return applyAttempt(
    progress,
    { skillId: SKILL, questionId, correct, mode },
    at,
  );
}

/** Answer the review the engine selects until `stop` returns true. */
function reviewUntil(
  progress: Progress,
  stop: (progress: Progress, asked: string[]) => boolean,
  correct: (questionId: string) => boolean = () => true,
) {
  const asked: string[] = [];
  let result = progress;
  for (let index = 0; !stop(result, asked) && index < 12; index++) {
    const question = selectQuestion(result, skill, 'review');
    asked.push(question.id);
    result = answer(result, question.id, correct(question.id));
  }
  return { progress: result, asked };
}

describe('multistep problem catalog', () => {
  it('validates every authored problem', () => {
    expect(validateCurriculum()).toEqual([]);
  });

  it('writes at least 60 problems, 6 or more in every course', () => {
    const counts = Object.fromEntries(
      courses.map((course) => [
        course.id,
        skills
          .filter((item) => item.courseId === course.id)
          .reduce((sum, item) => sum + (item.multistep?.length ?? 0), 0),
      ]),
    );
    console.table(counts);
    for (const [course, count] of Object.entries(counts))
      expect(count, course).toBeGreaterThanOrEqual(6);
    expect(
      Object.values(counts).reduce((sum, count) => sum + count, 0),
    ).toBeGreaterThanOrEqual(60);
    expect(multistepFiles.length).toBe(courses.length);
  });

  it('combines several skills in every problem, on skills deep in the graph', () => {
    for (const item of skills)
      for (const authored of item.multistep ?? []) {
        const owners = new Set(
          authored.parts.map((part) => pointSkillId(part.point)),
        );
        expect(owners.size, authored.id).toBeGreaterThanOrEqual(2);
        expect(owners.has(item.id), authored.id).toBe(true);
        expect(item.prerequisites.length, authored.id).toBeGreaterThanOrEqual(
          1,
        );
        expect(authored.parts.length).toBeGreaterThanOrEqual(MIN_PARTS);
        expect(authored.parts.length).toBeLessThanOrEqual(MAX_PARTS);
      }
  });

  it('keeps problem IDs and part points in the shipped graph index', () => {
    const index = buildIndex(defaultCatalog);
    const decoded = decodeIndex(JSON.parse(JSON.stringify(encodeIndex(index))));
    expect(decoded.skills).toEqual(index.skills);
    expect(decoded.skillById[SKILL].multistep).toEqual([
      {
        id: `${SKILL}-ms1`,
        parts: problem.parts.map(({ id, type, point }) => ({
          id,
          type,
          point,
        })),
      },
    ]);
  });

  it('serves its parts as questions of the skill, never as lesson steps', () => {
    const [first, second] = problem.parts;
    expect(first.id).toBe(`${SKILL}-ms1#p1`);
    expect(parsePartId(second.id)).toEqual({
      problemId: `${SKILL}-ms1`,
      index: 1,
    });
    expect(findQuestion(skill, second.id)).toBe(second);
    expect(findPart(skill, second.id)?.problem).toBe(problem);
    // The outline knows the part too, without its content.
    expect(findPart(defaultCatalog.skills[0], second.id)).toBeUndefined();
    // A missed part counts against the skill's own point it applies, or
    // else the problem's first own point; never a prerequisite's point.
    expect(partEvidencePoint(skill, problem, first)).toBe(first.point);
    expect(partEvidencePoint(skill, problem, second)).toBe(first.point);
    expect(ownPartIds(skill, problem)).toEqual([first.id]);
    expect(
      servedChoiceQuestions(skill).some((question) =>
        question.id.includes('#p'),
      ),
    ).toBe(problem.parts.some((part) => part.type === 'choice'));
  });
});

describe('multistep validation', () => {
  /** Validate the catalog with this skill's problem replaced. */
  function check(change: (problem: MultistepProblem) => MultistepProblem) {
    return validateCurriculum(
      defaultCatalog.skills.map((item) =>
        item.id === SKILL
          ? { ...item, multistep: [change(structuredClone(problem))] }
          : item,
      ),
    );
  }
  const withPart = (
    original: MultistepProblem,
    index: number,
    patch: Partial<MultistepPart>,
  ): MultistepProblem => ({
    ...original,
    parts: original.parts.map((item, at) =>
      at === index ? ({ ...item, ...patch } as MultistepPart) : item,
    ),
  });

  it('accepts the authored problem', () => {
    expect(check((item) => item)).toEqual([]);
  });

  it('rejects malformed parts', () => {
    expect(
      check((item) => ({ ...item, parts: item.parts.slice(0, 1) })),
    ).toContain(`${problem.id}: needs 2 to 4 parts.`);
    expect(
      check((item) => withPart(item, 1, { type: 'code' } as never)),
    ).toContain(
      `${problem.parts[1].id}: a part is a choice, numeric, or text question.`,
    );
    expect(
      check((item) => withPart(item, 0, { explanation: ' ' })).some((error) =>
        error.includes('needs a prompt and an explanation'),
      ),
    ).toBe(true);
    expect(
      check((item) => ({
        ...item,
        parts: [...item.parts, { ...item.parts[0], id: `${item.id}#p9` }],
      })),
    ).toContain(`${problem.id}: part IDs must be generated.`);
    // An output part runs its own code or the setup's; one is required.
    expect(
      check((item) => ({
        ...withPart(item, 1, {
          type: 'text',
          answers: ['x'],
          checksOutput: true,
          code: undefined,
        } as Partial<MultistepPart>),
        setup: { ...item.setup, code: undefined },
      })),
    ).toContain(`${problem.parts[1].id}: output questions need code to run.`);
    expect(check((item) => ({ ...item, setup: { text: [] } }))).toContain(
      `${problem.id}: the setup needs prose.`,
    );
    expect(
      check((item) => withPart(item, 0, { prompt: 'Unclosed $x math' })).some(
        (error) => error.startsWith(`${problem.parts[0].id}`),
      ),
    ).toBe(true);
  });

  it('requires every point to exist and belong to the skill or an ancestor', () => {
    expect(
      check((item) => withPart(item, 1, { point: 'unpacking-kp99' })),
    ).toContain(
      `${problem.parts[1].id}: unknown knowledge point unpacking-kp99.`,
    );
    // decorators is not an ancestor of multiple-returns.
    expect(
      check((item) => withPart(item, 1, { point: 'decorators-kp1' })),
    ).toContain(
      `${problem.parts[1].id}: point decorators-kp1 belongs to decorators, which is neither ${SKILL} nor one of its ancestors.`,
    );
  });

  it('requires a part on the skill itself and two different points', () => {
    expect(
      check((item) => withPart(item, 0, { point: 'unpacking-kp1' })),
    ).toContain(`${problem.id}: needs a part on a point of ${SKILL} itself.`);
    expect(
      check((item) => ({
        ...item,
        parts: item.parts.map(
          (part) => ({ ...part, point: `${SKILL}-kp1` }) as MultistepPart,
        ),
      })),
    ).toContain(
      `${problem.id}: its parts must name at least two different points.`,
    );
  });
});

describe('multistep problems in reviews', () => {
  it('asks a point question, then every part on one card, then the code', () => {
    expect(isMastered(mastered, SKILL)).toBe(true);
    expect(reviewProblem(mastered, skill)).toBe(problem);
    const { progress, asked } = reviewUntil(
      mastered,
      (result) => getSkillState(result, SKILL).reviewCount > 0,
    );
    const code = skill.questions.find((question) => question.type === 'code')!;
    expect(asked).toEqual([
      expect.stringMatching(new RegExp(`^${SKILL}-kp(1|3)-q\\d$`)),
      ...problem.parts.map((part) => part.id),
      code.id,
    ]);
    expect(progress.attempts.at(-1)?.outcome).toBe('review-passed');
    // One attempt per part, each graded on its own.
    expect(
      progress.attempts
        .filter((attempt) => attempt.questionId.startsWith(problem.id))
        .map((attempt) => attempt.questionId),
    ).toEqual(problem.parts.map((part) => part.id));
  });

  it('counts the problem for the skill only when every part is right', () => {
    const { progress } = reviewUntil(mastered, (_, asked) =>
      asked.includes(problem.parts[1].id),
    );
    // Two parts right: nothing yet counts toward the cycle.
    expect(getSkillState(progress, SKILL).reviewQuestionIds).not.toContain(
      problem.parts[0].id,
    );
    expect(openProblem(progress, skill)?.next).toBe(2);
    const done = answer(progress, problem.parts[2].id, true);
    expect(getSkillState(done, SKILL).reviewQuestionIds).toContain(
      problem.parts[0].id,
    );
    expect(openProblem(done, skill)).toBeUndefined();
    // At most one problem per cycle.
    expect(reviewProblem(done, skill)).toBeUndefined();
  });

  it('fails the review on a missed part, still asks the rest, and relearns the own point', () => {
    const { progress } = reviewUntil(mastered, (_, asked) =>
      asked.includes(problem.parts[0].id),
    );
    const lapses = getSkillState(progress, SKILL).memory!.lapses;
    // The second part applies a prerequisite's point; missing it fails the
    // problem, which counts against the skill's own point.
    const missed = answer(progress, problem.parts[1].id, false);
    const state = getSkillState(missed, SKILL);
    expect(isMastered(missed, SKILL)).toBe(false);
    expect(state.questionIds).not.toContain(problem.parts[0].point);
    expect(state.memory!.lapses).toBe(lapses + 1);
    // The prerequisite keeps its evidence: nothing upstream changes.
    expect(isMastered(missed, pointSkillId(problem.parts[1].point))).toBe(true);
    // The remaining part is still asked and graded.
    expect(selectQuestion(missed, skill, 'review').id).toBe(
      problem.parts[2].id,
    );
    const finished = answer(missed, problem.parts[2].id, true);
    expect(openProblem(finished, skill)).toBeUndefined();
    // The lesson re-teaches just the missed point.
    expect(lessonState(finished, skill).current?.id).toBe(
      problem.parts[0].point,
    );
    expect(selectQuestion(finished, skill, 'learn').id).toMatch(
      new RegExp(`^${problem.parts[0].point}-q`),
    );
  });

  it('is never asked in a lesson, and a part cannot pass a lesson step', () => {
    let progress = masterWithPrerequisites(
      emptyProgress(NOW, 'UTC'),
      'unpacking',
      NOW,
    );
    progress = masterWithPrerequisites(progress, 'return-values', NOW);
    for (let index = 0; index < 20 && !isMastered(progress, SKILL); index++) {
      const question = selectQuestion(progress, skill, 'learn');
      expect(question.id).not.toContain('#p');
      progress = answer(progress, question.id, true, 'learn', NOW);
    }
    const partial = masterWithPrerequisites(
      emptyProgress(NOW, 'UTC'),
      'unpacking',
      NOW,
    );
    const ready = masterWithPrerequisites(partial, 'return-values', NOW);
    const after = answer(ready, problem.parts[0].id, true, 'learn', NOW);
    expect(lessonState(after, skill).attempt).toBeUndefined();
  });

  it('resumes a problem part-way through before interleaving another due skill', () => {
    const { progress } = reviewUntil(mastered, (_, asked) =>
      asked.includes(problem.parts[0].id),
    );
    const task = nextTask(progress, DUE, COURSE);
    expect(task).toMatchObject({
      skillId: SKILL,
      mode: 'review',
      questionId: problem.parts[1].id,
    });
  });
});

describe('implicit credit from parts', () => {
  it('credits the skill of each correct part on a prerequisite, through the existing machinery', () => {
    const { progress } = reviewUntil(mastered, (_, asked) =>
      asked.includes(problem.parts[1].id),
    );
    const target = pointSkillId(problem.parts[1].point);
    const credit = getSkillState(progress, target).implicitCredit;
    expect(credit).toMatchObject({
      from: SKILL,
      weight: partCreditWeight(skill, target),
    });
    expect(credit!.dueAt).toBeGreaterThan(credit!.dueBefore);
    expect(progress.attempts.at(-1)?.credited).toEqual([target]);
    // A part on the skill's own point credits nothing.
    const own = progress.attempts.find(
      (attempt) => attempt.questionId === problem.parts[0].id,
    );
    expect(own?.credited).toBeUndefined();
  });

  it('gives nothing for a missed part, and one credit per skill per day', () => {
    const { progress } = reviewUntil(mastered, (_, asked) =>
      asked.includes(problem.parts[0].id),
    );
    const target = pointSkillId(problem.parts[1].point);
    const missed = answer(progress, problem.parts[1].id, false);
    expect(getSkillState(missed, target).implicitCredit).toBeUndefined();
    expect(getSkillState(missed, target).dueAt).toBe(
      getSkillState(progress, target).dueAt,
    );
    // The same part right again on the same day adds no second credit.
    const once = answer(progress, problem.parts[1].id, true);
    const again = answer(
      answer(once, problem.parts[2].id, true),
      problem.parts[0].id,
      true,
    );
    const twice = answer(again, problem.parts[1].id, true);
    expect(getSkillState(twice, target).implicitCredit).toEqual(
      getSkillState(once, target).implicitCredit,
    );
  });
});

describe('multistep problems in quizzes', () => {
  // The quiz asks the weakest skills first: a recent quiz miss on the skill
  // puts it at the top, so its problem is mixed into the plan.
  const weak: Progress = {
    ...mastered,
    attempts: [
      ...mastered.attempts,
      {
        id: 'earlier-quiz-miss',
        skillId: SKILL,
        questionId: `${SKILL}-kp1-q1`,
        correct: false,
        mode: 'quiz',
        usedHint: false,
        at: new Date(NOW).toISOString(),
        xp: 0,
      },
    ],
  };

  function started(at = DUE): { progress: Progress; quiz: Quiz } {
    const progress = startQuiz(weak, COURSE, at);
    return { progress, quiz: progress.quizzes!.at(-1)! };
  }

  it('mixes one problem into a quiz, one slot per part, with other questions', () => {
    const planned = planQuiz(weak, COURSE, defaultCatalog, DUE);
    const parts = planned.filter((slot) => slot.questionId.includes('#p'));
    expect(parts.map((slot) => slot.questionId)).toEqual(
      problem.parts.map((part) => part.id),
    );
    expect(planned.length).toBeGreaterThan(parts.length);
    const start = planned.findIndex(
      (slot) => slot.questionId === parts[0].questionId,
    );
    expect(quizProblem({ questions: planned }, start + 1)).toMatchObject({
      problem,
      part: 1,
      slots: [start, start + 1, start + 2],
    });
    expect(quizQuestion(planned[start + 1])?.question).toBe(problem.parts[1]);
  });

  it('grades each part, credits prerequisites, and remediates the skill on a miss', () => {
    const { progress, quiz } = started();
    const start = quiz.questions.findIndex((slot) =>
      slot.questionId.includes('#p'),
    );
    let result = progress;
    // Answer everything before the problem correctly.
    for (let index = 0; index < start; index++)
      result = answerQuiz(
        result,
        quiz.id,
        index,
        rightAnswer(quizQuestion(quiz.questions[index])!.question),
        DUE + 1000,
      );
    const [p1, p2, p3] = problem.parts;
    result = answerQuiz(result, quiz.id, start, rightAnswer(p1), DUE + 2000);
    result = answerQuiz(
      result,
      quiz.id,
      start + 1,
      wrongAnswer(p2),
      DUE + 3000,
    );
    const state = getSkillState(result, SKILL);
    // A quiz miss makes the review due now and unlearns nothing.
    expect(state.dueAt).toBeLessThanOrEqual(DUE + 3000);
    expect(isMastered(result, SKILL)).toBe(true);
    result = answerQuiz(
      result,
      quiz.id,
      start + 2,
      rightAnswer(p3),
      DUE + 4000,
    );
    const saved = result.quizzes!.find((item) => item.id === quiz.id)!;
    expect(
      saved.questions.slice(start, start + 3).map((slot) => slot.correct),
    ).toEqual([true, false, true]);
    expect(gradeAnswer(p2, wrongAnswer(p2))).toBe(false);
    // The third part's prerequisite is credited; the problem is not solved.
    const target = pointSkillId(p3.point);
    expect(getSkillState(result, target).implicitCredit?.from).toBe(SKILL);
    expect(getSkillState(result, SKILL).reviewQuestionIds).toEqual([]);
  });

  it('counts a solved problem toward a due review and never ends part-way through', () => {
    const { progress, quiz } = started();
    // Move the problem to the 7th to 9th slots: eight right answers would
    // end the quiz, but not before the problem's last part.
    const parts = quiz.questions.filter((slot) =>
      slot.questionId.includes('#p'),
    );
    const others = quiz.questions.filter(
      (slot) => !slot.questionId.includes('#p'),
    );
    const questions = [...others.slice(0, 6), ...parts, ...others.slice(6)];
    const moved: Progress = {
      ...progress,
      quizzes: progress.quizzes!.map((item) =>
        item.id === quiz.id ? { ...item, questions } : item,
      ),
    };
    let result = moved;
    for (let index = 0; index < 9; index++) {
      const current = result.quizzes!.find((item) => item.id === quiz.id)!;
      expect(current.completedAt, `answer ${index + 1}`).toBeUndefined();
      result = answerQuiz(
        result,
        quiz.id,
        index,
        rightAnswer(quizQuestion(current.questions[index])!.question),
        DUE + 1000 * (index + 1),
      );
    }
    const saved = result.quizzes!.find((item) => item.id === quiz.id)!;
    expect(saved.completedAt).toBeDefined();
    expect(saved.questions).toHaveLength(9);
    expect(getSkillState(result, SKILL).reviewQuestionIds).toContain(
      problem.parts[0].id,
    );
  });
});

describe('multistep state', () => {
  function reviewed(): LearnerState {
    let state: LearnerState = { ...createState(), progress: mastered };
    for (let index = 0; index < 4; index++) {
      const question = selectQuestion(state.progress, skill, 'review');
      state = recordLearningAnswer(state, {
        skillId: SKILL,
        questionId: question.id,
        // The second part is missed.
        correct: question.id !== problem.parts[1].id,
        mode: 'review',
        ...(question.type === 'numeric' || question.type === 'text'
          ? { response: 'typed' }
          : {}),
      });
    }
    return state;
  }

  it('stores each part as an attempt that round-trips through validation, migration, and merging', () => {
    const state = reviewed();
    const parts = state.progress.attempts.filter((attempt) =>
      attempt.questionId.startsWith(problem.id),
    );
    expect(
      parts.map((attempt) => [attempt.questionId, attempt.correct]),
    ).toEqual([
      [problem.parts[0].id, true],
      [problem.parts[1].id, false],
      [problem.parts[2].id, true],
    ]);
    const json = JSON.parse(JSON.stringify(state)) as LearnerState;
    expect(parseStateUpdate({ state: json, revision: 0 }).state).toEqual(
      migrateState(json),
    );
    expect(migrateState(json)).toEqual(json);
    const merged = mergeStates(json, { ...createState(), progress: mastered });
    const byId = (attempts: { id: string }[]) =>
      [...attempts].sort((a, b) => a.id.localeCompare(b.id));
    expect(byId(merged.progress.attempts)).toEqual(
      byId(state.progress.attempts),
    );
    expect(isMastered(merged.progress, SKILL)).toBe(false);
    expect(getSkillState(merged.progress, SKILL).questionIds).not.toContain(
      problem.parts[0].point,
    );
  });

  it('keeps a solved problem’s answers in a due cycle across a merge', () => {
    let state: LearnerState = { ...createState(), progress: mastered };
    for (let index = 0; index < 4; index++) {
      const question = selectQuestion(state.progress, skill, 'review');
      state = recordLearningAnswer(state, {
        skillId: SKILL,
        questionId: question.id,
        correct: true,
        mode: 'review',
      });
    }
    const ids = getSkillState(state.progress, SKILL).reviewQuestionIds;
    expect(ids).toContain(problem.parts[0].id);
    const merged = mergeStates(state, migrateState(state));
    expect(getSkillState(merged.progress, SKILL).reviewQuestionIds).toEqual(
      ids,
    );
  });

  it('turns a missed part into a mistake card that shows the setup', () => {
    const state = reviewed();
    const card = state.cards.find((item) =>
      item.id.endsWith(problem.parts[1].id),
    )!;
    expect(card.id).toBe(`mistake:${SKILL}:${problem.parts[1].id}`);
    const text = cardWithText(card)!;
    expect(text.front).toContain(problem.setup.text[0]);
    expect(text.front).toContain(problem.parts[1].prompt);
  });
});

it('uses only skills with knowledge points', () => {
  const owners: Skill[] = skills.filter((item) => item.multistep?.length);
  for (const item of owners)
    expect(item.knowledgePoints?.length).toBeGreaterThan(1);
});
