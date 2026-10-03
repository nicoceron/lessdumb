import { describe, expect, it } from 'vitest';
import { skillById, type Skill } from '../src/lib/curriculum';
import {
  applyAttempt,
  coursePath,
  DAY_MS,
  emptyProgress,
  getSkillState,
  isMastered,
  isUnlocked,
  lessonState,
  nextTask,
  selectQuestion,
  type Progress,
} from '../src/lib/learning';
import {
  activeDiagnostic,
  answerDiagnostic,
  beliefs,
  DIAGNOSTIC_MAX_QUESTIONS,
  diagnosticQuestion,
  finishDiagnostic,
  KNOWN,
  nextDiagnosticQuestion,
  placementsFor,
  SLOW_ANSWER_MS,
  startDiagnostic,
  UNKNOWN,
  type Diagnostic,
} from '../src/lib/placement';
import {
  createState,
  mergeStates,
  recordLearningAnswer,
  type LearnerState,
} from '../src/lib/state';
import { parseStateUpdate } from '../src/lib/server/state-validation';
import { masterSkill } from './helpers/mastery';

const NOW = Date.parse('2026-10-01T16:00:00Z');
const COURSE = 'python-foundations';
const fresh = () => emptyProgress(NOW, 'UTC');
const path = coursePath(COURSE);

/** Every ancestor of the given skills, and the skills themselves. */
function closure(ids: string[]): Set<string> {
  const result = new Set<string>();
  const visit = (id: string) => {
    if (result.has(id)) return;
    result.add(id);
    skillById[id].prerequisites.forEach(visit);
  };
  ids.forEach(visit);
  return result;
}

/** Take a test answering correctly exactly for skills in `known`. */
function take(
  progress: Progress,
  known: Set<string>,
  at = NOW,
  elapsedMs?: number,
): { progress: Progress; diagnostic: Diagnostic } {
  let result = startDiagnostic(progress, COURSE, at);
  for (let index = 0; index < 100; index++) {
    const diagnostic = activeDiagnostic(result);
    if (!diagnostic) break;
    const { question } = diagnosticQuestion(diagnostic.current!)!;
    const answer = known.has(diagnostic.current!.skillId)
      ? question.answer
      : (question.answer + 1) % question.choices.length;
    result = answerDiagnostic(
      result,
      diagnostic.id,
      answer,
      at + index * 1000,
      elapsedMs,
    );
  }
  return { progress: result, diagnostic: result.diagnostics!.at(-1)! };
}

describe('inference through the graph', () => {
  const variables = skillById.variables;
  const answer = (skill: Skill, correct: boolean, elapsedMs?: number) => {
    const question = diagnosticQuestion({
      skillId: skill.id,
      questionId: skill.knowledgePoints![0].questions.find(
        (q) => q.type === 'choice',
      )!.id,
    })!.question;
    return {
      skillId: skill.id,
      questionId: question.id,
      presentation: 0,
      answer: correct ? question.answer : (question.answer + 1) % 4,
      correct,
      at: NOW,
      ...(elapsedMs !== undefined ? { elapsedMs } : {}),
    };
  };

  it('raises a skill and its ancestors after a correct answer, and nothing below it', () => {
    const before = beliefs(fresh(), { courseId: COURSE, answers: [] });
    expect(new Set(before.values())).toEqual(new Set([0.5]));
    const after = beliefs(fresh(), {
      courseId: COURSE,
      answers: [answer(skillById.numbers, true)],
    });
    expect(after.get('numbers')!).toBeGreaterThan(0.5);
    expect(after.get('variables')!).toBeGreaterThan(0.5);
    expect(after.get('print-output')!).toBeGreaterThan(0.5);
    // One hop further from the evidence counts less.
    expect(after.get('variables')!).toBeLessThan(after.get('numbers')!);
    expect(after.get('print-output')!).toBeLessThan(after.get('variables')!);
    expect(after.get('strings')).toBe(0.5);
  });

  it('lowers a skill and its descendants after a wrong answer, and nothing above it', () => {
    const after = beliefs(fresh(), {
      courseId: COURSE,
      answers: [answer(variables, false)],
    });
    expect(after.get('variables')!).toBeLessThan(0.5);
    expect(after.get('numbers')!).toBeLessThan(0.5);
    expect(after.get('numbers')!).toBeGreaterThan(after.get('variables')!);
    expect(after.get('print-output')).toBe(0.5);
  });

  it('weights slow correct answers less, and keeps real mastery certain', () => {
    const quick = beliefs(fresh(), {
      courseId: COURSE,
      answers: [answer(variables, true, 5000)],
    });
    const slow = beliefs(fresh(), {
      courseId: COURSE,
      answers: [answer(variables, true, SLOW_ANSWER_MS + 1)],
    });
    expect(slow.get('variables')!).toBeLessThan(quick.get('variables')!);
    expect(slow.get('variables')!).toBeGreaterThan(0.5);
    const learned = masterSkill(fresh(), 'print-output', NOW);
    const held = beliefs(learned, {
      courseId: COURSE,
      answers: [answer(variables, false)],
    });
    expect(held.get('print-output')!).toBeGreaterThan(0.99);
  });
});

describe('question selection and stopping', () => {
  it('asks the skill that best splits the uncertain graph first, not the first lesson', () => {
    const first = nextDiagnosticQuestion(fresh(), {
      courseId: COURSE,
      answers: [],
    })!;
    // It sits in the middle of the graph: with skills both below and above.
    const skill = skillById[first.skillId];
    expect(skill.prerequisites.length).toBeGreaterThan(0);
    expect(
      path.some(
        (item) => item.id !== skill.id && closure([item.id]).has(skill.id),
      ),
    ).toBe(true);
    expect(first.skillId).not.toBe('print-output');
    expect(diagnosticQuestion(first)?.question.type).toBe('choice');
  });

  it('never repeats a question and asks a skill at most twice', () => {
    const { diagnostic } = take(fresh(), closure(['strings', 'comparisons']));
    const ids = diagnostic.answers.map((a) => a.questionId);
    expect(new Set(ids).size).toBe(ids.length);
    const perSkill = new Map<string, number>();
    for (const a of diagnostic.answers)
      perSkill.set(a.skillId, (perSkill.get(a.skillId) ?? 0) + 1);
    expect(Math.max(...perSkill.values())).toBeLessThanOrEqual(2);
  });

  it('stops once every skill is classified, well before the cap for a clear learner', () => {
    const { diagnostic } = take(fresh(), new Set());
    expect(diagnostic.completedAt).toBeDefined();
    expect(diagnostic.answers.length).toBeLessThan(DIAGNOSTIC_MAX_QUESTIONS);
    const belief = beliefs(fresh(), diagnostic);
    expect([...belief.values()].every((p) => p <= UNKNOWN || p >= KNOWN)).toBe(
      true,
    );
    expect(diagnostic.placed).toEqual([]);
  });

  it('stops at the question cap', () => {
    const answers = Array.from({ length: DIAGNOSTIC_MAX_QUESTIONS }, () => ({
      ...nextDiagnosticQuestion(fresh(), { courseId: COURSE, answers: [] })!,
      answer: 0,
      correct: false,
      at: NOW,
    }));
    expect(
      nextDiagnosticQuestion(fresh(), { courseId: COURSE, answers }),
    ).toBeNull();
  });

  it('resumes on the same question after an interruption', () => {
    const started = startDiagnostic(fresh(), COURSE, NOW);
    const diagnostic = activeDiagnostic(started)!;
    expect(startDiagnostic(started, COURSE, NOW + 5000)).toBe(started);
    const saved = parseStateUpdate({
      state: { ...createState(), progress: started },
      revision: 0,
    }).state;
    expect(activeDiagnostic(saved.progress)?.current).toEqual(
      diagnostic.current,
    );
  });
});

describe('placement', () => {
  const known = closure(['strings', 'comparisons']);

  it('places out of known skills only, ancestor-closed, with no XP or cards', () => {
    const state = createState();
    const { progress, diagnostic } = take(state.progress, known);
    const placed = diagnostic.placed!;
    expect(placed.length).toBeGreaterThan(0);
    for (const id of placed) {
      expect(known.has(id)).toBe(true);
      expect(isMastered(progress, id)).toBe(true);
      for (const parent of skillById[id].prerequisites)
        expect(placed.includes(parent) || isMastered(progress, parent)).toBe(
          true,
        );
      const skill = getSkillState(progress, id);
      expect(skill.placement).toMatchObject({ diagnosticId: diagnostic.id });
      expect(skill.attempts).toBe(0);
      expect(skill.lessonRewarded).toBeUndefined();
    }
    expect(progress.totalXp).toBe(0);
    expect(progress.attempts).toEqual([]);
    const merged = mergeStates(
      { ...state, progress, updatedAt: NOW + 1 },
      state,
    );
    expect(merged.cards).toEqual([]);
  });

  it('schedules first reviews soon and spreads them out', () => {
    const { progress, diagnostic } = take(fresh(), known);
    const due = diagnostic.placed!.map(
      (id) => getSkillState(progress, id).dueAt!,
    );
    for (const at of due) {
      expect(at).toBeGreaterThanOrEqual(diagnostic.completedAt! + DAY_MS);
      expect(at).toBeLessThanOrEqual(diagnostic.completedAt! + 14 * DAY_MS);
    }
    if (due.length > 8) expect(new Set(due).size).toBeGreaterThan(1);
    // Learning starts at the frontier: the first task is an unplaced lesson.
    const task = nextTask(progress, NOW + 60_000, COURSE)!;
    expect(task.mode).toBe('learn');
    expect(diagnostic.placed).not.toContain(task.skillId);
    expect(isUnlocked(progress, task.skillId)).toBe(true);
  });

  it('never overrides real evidence', () => {
    let progress = masterSkill(fresh(), 'print-output', NOW - DAY_MS);
    // A lesson already started on variables keeps its real progress.
    progress = applyAttempt(
      progress,
      {
        skillId: 'variables',
        questionId: selectQuestion(progress, skillById.variables, 'learn').id,
        correct: false,
        mode: 'learn',
      },
      NOW - 1000,
    );
    const before = getSkillState(progress, 'print-output');
    const result = take(progress, known).progress;
    expect(getSkillState(result, 'print-output')).toEqual(before);
    expect(getSkillState(result, 'variables').placement).toBeUndefined();
    expect(isMastered(result, 'variables')).toBe(false);
    // Nothing that depends on the unplaced skill is placed either.
    for (const id of result.diagnostics!.at(-1)!.placed!)
      expect(closure([id]).has('variables')).toBe(false);
  });

  it('confirms a placement when its first review passes', () => {
    const { progress, diagnostic } = take(fresh(), known);
    const id = diagnostic.placed![0];
    const due = getSkillState(progress, id).dueAt!;
    let result = progress;
    const cycle = getSkillState(result, id).reviewCount;
    for (
      let index = 0;
      getSkillState(result, id).reviewCount === cycle && index < 8;
      index++
    )
      result = applyAttempt(
        result,
        {
          skillId: id,
          questionId: selectQuestion(result, skillById[id], 'review').id,
          correct: true,
          mode: 'review',
        },
        due,
      );
    expect(getSkillState(result, id).placement?.confirmedAt).toBe(due);
    expect(isMastered(result, id)).toBe(true);
  });

  it('returns a placed skill to learning from the start when its first review fails', () => {
    const state = { ...createState(), progress: take(fresh(), known).progress };
    const id = state.progress
      .diagnostics!.at(-1)!
      .placed!.find(
        (skillId) => skillById[skillId].knowledgePoints!.length > 1,
      )!;
    const failed = recordLearningAnswer(state, {
      skillId: id,
      questionId: selectQuestion(state.progress, skillById[id], 'review').id,
      correct: false,
      mode: 'review',
    });
    const skill = getSkillState(failed.progress, id);
    expect(isMastered(failed.progress, id)).toBe(false);
    expect(skill.placement?.demotedAt).toBeDefined();
    // Every step is open again, not only the missed point.
    expect(
      lessonState(failed.progress, skillById[id]).steps.every(
        (step) => step.status !== 'done',
      ),
    ).toBe(true);
    // A mistake card is still a real mistake; no mastery cards were given.
    expect(failed.cards.every((card) => card.kind === 'mistake')).toBe(true);
  });

  it('can be retaken, adding placements without removing earned mastery', () => {
    const first = take(fresh(), closure(['variables'])).progress;
    const firstPlaced = first.diagnostics!.at(-1)!.placed!;
    const second = take(first, new Set(), NOW + DAY_MS).progress;
    for (const id of firstPlaced) expect(isMastered(second, id)).toBe(true);
    expect(second.diagnostics).toHaveLength(2);
    const third = take(second, known, NOW + 2 * DAY_MS).progress;
    expect(third.diagnostics!.at(-1)!.placed!.length).toBeGreaterThan(0);
    for (const id of firstPlaced) expect(isMastered(third, id)).toBe(true);
    expect(placementsFor(third, { courseId: COURSE, answers: [] })).toEqual([]);
  });
});

describe('placement persistence', () => {
  const state = (progress: Progress, updatedAt: number): LearnerState => ({
    ...createState(),
    progress,
    createdAt: NOW,
    updatedAt,
  });
  const known = closure(['strings']);

  it('validates diagnostics and placements and migrates older accounts', () => {
    const saved = state(take(fresh(), known).progress, NOW + 1);
    expect(parseStateUpdate({ state: saved, revision: 0 }).state).toEqual(
      saved,
    );
    const reject = (mutate: (copy: LearnerState) => void) => {
      const copy = structuredClone(saved);
      mutate(copy);
      expect(() => parseStateUpdate({ state: copy, revision: 0 })).toThrow();
    };
    const placedId = saved.progress.diagnostics![0].placed![0];
    reject((copy) => {
      copy.progress.skills[placedId].placement!.demotedAt = 0;
    });
    reject((copy) => {
      copy.progress.diagnostics![0].current = {
        skillId: 'print-output',
        questionId: 'x',
        presentation: 0,
      };
    });
    reject((copy) => {
      (
        copy.progress.diagnostics![0].answers[0] as unknown as {
          correct: string;
        }
      ).correct = 'yes';
    });
    const v4 = {
      ...createState(),
      version: 4,
      progress: { ...createState().progress, version: 4 },
    };
    expect(parseStateUpdate({ state: v4, revision: 0 }).state.version).toBe(5);
  });

  it('merges a test taken on one device into a stale one, and keeps a demotion', () => {
    const base = state(fresh(), NOW);
    const taken = state(take(fresh(), known).progress, NOW + 100_000);
    const placed = taken.progress.diagnostics![0].placed!;
    for (const merged of [mergeStates(taken, base), mergeStates(base, taken)]) {
      expect(merged.progress.diagnostics).toHaveLength(1);
      for (const id of placed) {
        expect(isMastered(merged.progress, id)).toBe(true);
        expect(getSkillState(merged.progress, id).dueAt).toBe(
          getSkillState(taken.progress, id).dueAt,
        );
      }
    }
    const id = placed[0];
    const failed = recordLearningAnswer(taken, {
      skillId: id,
      questionId: selectQuestion(taken.progress, skillById[id], 'review').id,
      correct: false,
      mode: 'review',
    });
    const merged = mergeStates({ ...failed, updatedAt: NOW + 200_000 }, taken);
    expect(isMastered(merged.progress, id)).toBe(false);
    expect(
      getSkillState(merged.progress, id).placement?.demotedAt,
    ).toBeDefined();
  });

  it('stays small: a finished diagnostic is a few kilobytes', () => {
    const taken = take(fresh(), known);
    expect(JSON.stringify(taken.diagnostic).length).toBeLessThan(16_000);
    // Finishing twice changes nothing.
    expect(finishDiagnostic(taken.progress, taken.diagnostic.id)).toBe(
      taken.progress,
    );
  });
});
