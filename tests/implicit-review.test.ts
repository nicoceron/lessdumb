import { describe, expect, it } from 'vitest';
import {
  DEFAULT_ENCOMPASS_WEIGHT,
  defaultCatalog,
  encompassedBy,
  encompassings,
  skillById,
  validateCurriculum,
  type CurriculumCatalog,
  type Skill,
} from '../src/lib/curriculum';
import {
  applyAttempt,
  applyImplicitCredit,
  DAY_MS,
  emptyProgress,
  getSkillState,
  implicitDueAt,
  isMastered,
  nextTask,
  reviewCoverage,
  selectQuestion,
  type Progress,
} from '../src/lib/learning';
import { legacyMemory, reviewMemory } from '../src/lib/retention';
import { taskHistory, taskQueue } from '../src/lib/dashboard';
import { createState, mergeStates, type LearnerState } from '../src/lib/state';
import { parseStateUpdate } from '../src/lib/server/state-validation';
import {
  activeQuiz,
  answerQuiz,
  quizQuestion,
  startQuiz,
} from '../src/lib/quiz';
import { masterSkill } from './helpers/mastery';

// print-output <- variables <- numbers: each skill's only prerequisite.
const NOW = Date.parse('2026-10-01T16:00:00Z');
const LATER = NOW + 12 * 3_600_000; // the next calendar day in UTC
const COURSE = 'python-foundations';
const fresh = () => emptyProgress(NOW, 'UTC');

function withWeight(weight: number): CurriculumCatalog {
  return {
    ...defaultCatalog,
    skills: defaultCatalog.skills.map((item) =>
      item.id === 'variables'
        ? { ...item, encompasses: [{ id: 'print-output', weight }] }
        : item,
    ),
  };
}

function review(
  progress: Progress,
  skillId: string,
  at: number,
  catalog = defaultCatalog,
) {
  const skill = catalog.skills.find((item) => item.id === skillId)!;
  const cycle = getSkillState(progress, skillId).reviewCount;
  let result = progress;
  for (
    let index = 0;
    getSkillState(result, skillId).reviewCount === cycle && index < 8;
    index++
  )
    result = applyAttempt(
      result,
      {
        skillId,
        questionId: selectQuestion(result, skill, 'review').id,
        correct: true,
        mode: 'review',
      },
      at,
      catalog,
    );
  return result;
}

describe('encompassing weights', () => {
  it('default to every direct prerequisite at a conservative weight', () => {
    expect(DEFAULT_ENCOMPASS_WEIGHT).toBe(0.25);
    expect(encompassings(skillById.variables)).toEqual([
      { id: 'print-output', weight: 0.25 },
    ]);
    expect(encompassedBy('print-output').map((item) => item.id)).toEqual([
      'variables',
    ]);
    expect(validateCurriculum()).toEqual([]);
  });

  it('reject encompassed skills that are not direct prerequisites, and weights outside (0, 1]', () => {
    const check = (encompasses: Skill['encompasses']) =>
      validateCurriculum(
        defaultCatalog.skills.map((item) =>
          item.id === 'numbers' ? { ...item, encompasses } : item,
        ),
      );
    expect(check([{ id: 'variables', weight: 1 }])).toEqual([]);
    expect(check([{ id: 'print-output', weight: 0.5 }])).toContain(
      'numbers: encompasses print-output, which is not a direct prerequisite.',
    );
    for (const weight of [0, -0.1, 1.5, Number.NaN])
      expect(check([{ id: 'variables', weight }])).toContain(
        'numbers: encompassing weight for variables must be in (0, 1].',
      );
    expect(
      check([
        { id: 'variables', weight: 0.5 },
        { id: 'variables', weight: 0.5 },
      ]),
    ).toContain('numbers: duplicate encompassed skill.');
  });
});

describe('implicit review credit', () => {
  const base = masterSkill(fresh(), 'print-output', NOW);
  const before = getSkillState(base, 'print-output');

  it('moves a prerequisite’s due date by its weight of a full review’s gain', () => {
    const learned = masterSkill(base, 'variables', LATER);
    const after = getSkillState(learned, 'print-output');
    const full = reviewMemory(legacyMemory(before, LATER), LATER, 'pass');
    const gain = full.dueAt - before.dueAt!;
    expect(gain).toBeGreaterThan(0);
    expect(after.dueAt).toBe(before.dueAt! + Math.round(0.25 * gain));
    expect(after.dueAt).toBeLessThan(full.dueAt);
    // Only the due date moves: memory changes through real reviews alone.
    expect(after.memory).toEqual(before.memory);
    expect(after.reviewCount).toBe(before.reviewCount);
    expect(after.implicitCredit).toMatchObject({
      at: LATER,
      day: '2026-10-02',
      from: 'variables',
      weight: 0.25,
      basis: before.memory!.lastReviewAt,
      dueBefore: before.dueAt,
      dueAt: after.dueAt,
    });
    expect(learned.attempts.at(-1)).toMatchObject({
      outcome: 'lesson-passed',
      credited: ['print-output'],
    });
    expect(
      taskHistory(learned).find((entry) => entry.skill?.id === 'variables'),
    ).toMatchObject({ kind: 'lesson', credited: 1 });
  });

  it('never gives more than a real review would, even at full weight', () => {
    const catalog = withWeight(1);
    const learned = masterSkill(base, 'variables', LATER, catalog);
    const full = reviewMemory(legacyMemory(before, LATER), LATER, 'pass');
    expect(getSkillState(learned, 'print-output').dueAt).toBe(full.dueAt);
    expect(implicitDueAt(before, 1, LATER)!.dueAt).toBe(full.dueAt);
    // Already at or past what a review would give: no credit.
    expect(
      implicitDueAt({ ...before, dueAt: full.dueAt + DAY_MS }, 1, LATER),
    ).toBeNull();
  });

  it('credits a prerequisite at most once per day, and not on the day it was learned', () => {
    const sameDay = masterSkill(base, 'variables', NOW + 1000);
    expect(getSkillState(sameDay, 'print-output').dueAt).toBe(before.dueAt);
    expect(sameDay.attempts.at(-1)?.credited).toBeUndefined();

    const learned = masterSkill(base, 'variables', LATER);
    const credited = getSkillState(learned, 'print-output');
    // A second success the same day (here, a quiz-style direct call) adds nothing.
    const again = applyImplicitCredit(
      learned,
      skillById.variables,
      LATER + 60_000,
    );
    expect(again.credited).toEqual([]);
    expect(again.progress).toBe(learned);
    // The next day it can be credited again, never beyond a real review.
    const nextDay = LATER + DAY_MS;
    const later = applyImplicitCredit(learned, skillById.variables, nextDay);
    expect(later.credited).toEqual(['print-output']);
    const full = reviewMemory(legacyMemory(credited, nextDay), nextDay, 'pass');
    const moved = getSkillState(later.progress, 'print-output').dueAt!;
    expect(moved).toBeGreaterThan(credited.dueAt!);
    expect(moved).toBeLessThanOrEqual(full.dueAt);
  });

  it('gives nothing for failures and penalizes nothing upstream', () => {
    let progress = masterSkill(base, 'variables', NOW + 1000);
    const due = getSkillState(progress, 'variables').dueAt!;
    const prerequisite = getSkillState(progress, 'print-output');
    progress = applyAttempt(
      progress,
      {
        skillId: 'variables',
        questionId: selectQuestion(progress, skillById.variables, 'review').id,
        correct: false,
        mode: 'review',
      },
      due,
    );
    expect(getSkillState(progress, 'print-output')).toEqual(prerequisite);
    expect(progress.attempts.at(-1)?.credited).toBeUndefined();
  });

  it('skips lapsed, locked, and mid-review prerequisites and never creates mastery', () => {
    const learned = masterSkill(
      masterSkill(base, 'variables', NOW + 1000),
      'numbers',
      NOW + 2000,
    );
    const lapsedAt = getSkillState(learned, 'variables').dueAt!;
    // variables lapses: not mastered, so numbers' success cannot credit it.
    const lapsed = applyAttempt(
      learned,
      {
        skillId: 'variables',
        questionId: selectQuestion(learned, skillById.variables, 'review').id,
        correct: false,
        mode: 'review',
      },
      lapsedAt,
    );
    expect(isMastered(lapsed, 'variables')).toBe(false);
    const none = applyImplicitCredit(
      lapsed,
      skillById.numbers,
      lapsedAt + DAY_MS,
    );
    expect(none.credited).toEqual([]);
    expect(isMastered(none.progress, 'variables')).toBe(false);
    // print-output lapses: variables is mastered but locked behind it.
    const locked = applyAttempt(
      learned,
      {
        skillId: 'print-output',
        questionId: selectQuestion(learned, skillById['print-output'], 'review')
          .id,
        correct: false,
        mode: 'review',
      },
      before.dueAt!,
    );
    expect(
      applyImplicitCredit(locked, skillById.numbers, before.dueAt! + DAY_MS)
        .credited,
    ).toEqual([]);
    // A review already under way keeps its own due cycle.
    const started = applyAttempt(
      learned,
      {
        skillId: 'variables',
        questionId: selectQuestion(learned, skillById.variables, 'review').id,
        correct: true,
        mode: 'review',
      },
      lapsedAt,
    );
    expect(getSkillState(started, 'variables').reviewQuestionIds).toHaveLength(
      1,
    );
    expect(
      applyImplicitCredit(started, skillById.numbers, lapsedAt).credited,
    ).toEqual([]);
  });

  it('credits from completed reviews and correct quiz answers, not from partial cycles', () => {
    const learned = masterSkill(base, 'variables', NOW + 1000);
    const due = getSkillState(learned, 'variables').dueAt!;
    const reviewed = review(learned, 'variables', due);
    const answers = reviewed.attempts.filter((a) => a.mode === 'review');
    expect(answers.slice(0, -1).every((a) => !a.credited)).toBe(true);
    expect(answers.at(-1)).toMatchObject({
      outcome: 'review-passed',
      credited: ['print-output'],
    });
    expect(getSkillState(reviewed, 'print-output').implicitCredit?.from).toBe(
      'variables',
    );
  });

  it('credits a prerequisite when its dependent is answered correctly in a quiz', () => {
    let progress = fresh();
    // Enough lessons for a quiz, learned a day before it.
    for (let index = 0; index < 400 && progress.totalXp < 150; index++) {
      const task = nextTask(progress, NOW, COURSE)!;
      progress = applyAttempt(progress, { ...task, correct: true }, NOW);
    }
    progress = startQuiz(progress, COURSE, LATER);
    const quiz = activeQuiz(progress)!;
    const index = quiz.questions.findIndex(
      (slot) => skillById[slot.skillId].prerequisites.length > 0,
    );
    const slot = quiz.questions[index];
    const { question } = quizQuestion(slot)!;
    const answered = answerQuiz(
      progress,
      quiz.id,
      index,
      question.answer,
      LATER,
    );
    const attempt = answered.attempts.at(-1)!;
    expect(attempt.mode).toBe('quiz');
    expect(attempt.credited?.length).toBeGreaterThan(0);
    for (const id of attempt.credited!)
      expect(getSkillState(answered, id).implicitCredit).toMatchObject({
        from: slot.skillId,
        at: LATER,
      });
  });
});

describe('review compression', () => {
  it('prefers a due review that also credits other due prerequisites', () => {
    const progress = masterSkill(
      masterSkill(
        masterSkill(fresh(), 'print-output', NOW),
        'variables',
        NOW + 1000,
      ),
      'numbers',
      NOW + 2000,
    );
    const due = NOW + 3 * DAY_MS;
    expect(reviewCoverage(progress, skillById.numbers, due)).toBe(1);
    expect(reviewCoverage(progress, skillById.variables, due)).toBe(1);
    expect(reviewCoverage(progress, skillById['print-output'], due)).toBe(0);
    const first = nextTask(progress, due, COURSE)!;
    expect(first.mode).toBe('review');
    expect(first.skillId).not.toBe('print-output');
    // Reviewing numbers credits variables, which then waits.
    const after = review(progress, 'numbers', due);
    expect(getSkillState(after, 'variables').dueAt).toBeGreaterThan(
      getSkillState(progress, 'variables').dueAt!,
    );
    // The Learn list orders reviews the same way: variables covers a due
    // prerequisite, numbers was practiced last so it waits (interleaving),
    // and a lesson takes its turn after two reviews.
    const reviews = taskQueue(progress, COURSE, due, 5).filter(
      (task) => task.mode === 'review',
    );
    expect(first.skillId).toBe('variables');
    expect(reviews.map((task) => task.skill.id)).toEqual([
      'variables',
      'print-output',
      'numbers',
    ]);
  });
});

describe('implicit credit persistence', () => {
  const base = masterSkill(
    masterSkill(fresh(), 'print-output', NOW),
    'variables',
    LATER,
  );
  const state = (progress: Progress, updatedAt: number): LearnerState => ({
    ...createState(),
    progress,
    createdAt: NOW,
    updatedAt,
  });

  it('validates credit records and migrates accounts from before them', () => {
    const saved = state(base, LATER);
    expect(parseStateUpdate({ state: saved, revision: 0 }).state).toEqual(
      saved,
    );
    const reject = (mutate: (copy: LearnerState) => void) => {
      const copy = structuredClone(saved);
      mutate(copy);
      expect(() => parseStateUpdate({ state: copy, revision: 0 })).toThrow();
    };
    reject((copy) => {
      const credit = copy.progress.skills['print-output'].implicitCredit!;
      credit.dueAt = credit.dueBefore - 1;
    });
    reject((copy) => {
      copy.progress.skills['print-output'].implicitCredit!.weight = 0;
    });
    reject((copy) => {
      (
        copy.progress.skills['print-output'].implicitCredit as unknown as {
          extra: number;
        }
      ).extra = 1;
    });
    reject((copy) => {
      (
        copy.progress.attempts.at(-1) as unknown as { credited: number }
      ).credited = 1;
    });
    const v3 = {
      ...createState(),
      version: 3,
      progress: { ...createState().progress, version: 3 },
    };
    expect(parseStateUpdate({ state: v3, revision: 0 }).state.version).toBe(4);
  });

  it('keeps credit from one device when merging with a stale one', () => {
    const stale = state(masterSkill(fresh(), 'print-output', NOW), NOW);
    const credited = state(base, LATER);
    const expected = getSkillState(base, 'print-output').dueAt;
    for (const merged of [
      mergeStates(credited, stale),
      mergeStates(stale, credited),
    ])
      expect(getSkillState(merged.progress, 'print-output').dueAt).toBe(
        expected,
      );
  });

  it('lets a later real review or quiz miss decide instead of an older credit', () => {
    const credited = state(base, LATER);
    const due = getSkillState(base, 'print-output').dueAt!;
    const reviewed = state(review(base, 'print-output', due), due);
    const merged = mergeStates(credited, reviewed);
    expect(getSkillState(merged.progress, 'print-output').dueAt).toBe(
      getSkillState(reviewed.progress, 'print-output').dueAt,
    );
    expect(
      getSkillState(merged.progress, 'print-output').memory?.lastReviewAt,
    ).toBe(due);
  });
});
