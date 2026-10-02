import { describe, expect, it } from 'vitest';
import { skillById } from '../src/lib/curriculum';
import {
  applyAttempt,
  emptyProgress,
  DAY_MS,
  recordLesson,
  MAX_RECENT_ATTEMPTS,
  getStats,
  isMastered,
  isUnlocked,
  type Progress,
} from '../src/lib/learning';
import {
  acquisitionMemory,
  legacyMemory,
  recallProbability,
  reviewMemory,
} from '../src/lib/retention';
import { createState, mergeStates, type LearnerState } from '../src/lib/state';
import { parseStateUpdate } from '../src/lib/server/state-validation';

const NOW = Date.parse('2026-10-02T12:00:00Z');
const ID = 'print-output';
function acquire() {
  return skillById[ID].questions.reduce(
    (p, q) =>
      applyAttempt(
        p,
        { skillId: ID, questionId: q.id, correct: true, mode: 'learn' },
        NOW,
      ),
    emptyProgress(NOW, 'UTC'),
  );
}
function answer(
  p: Progress,
  q: number,
  at: number,
  usedHint = false,
  correct = true,
) {
  return applyAttempt(
    p,
    {
      skillId: ID,
      questionId: `${ID}-q${q}`,
      correct,
      usedHint,
      mode: 'review',
    },
    at,
  );
}
function state(progress: Progress): LearnerState {
  return {
    ...createState(),
    progress,
    createdAt: NOW,
    updatedAt: progress.skills[ID].lastPracticedAt!,
  };
}

describe('per-learner FSRS retention', () => {
  it('models recall decay and changes spacing with observed difficulty and elapsed time', () => {
    const memory = acquisitionMemory(NOW);
    expect(recallProbability(memory, NOW)).toBe(1);
    expect(recallProbability(memory, NOW + 20 * DAY_MS)).toBeLessThan(
      recallProbability(memory, NOW + DAY_MS),
    );
    const good = reviewMemory(memory, NOW + DAY_MS, 'pass');
    const hard = reviewMemory(memory, NOW + DAY_MS, 'hard');
    const late = reviewMemory(memory, NOW + 10 * DAY_MS, 'pass');
    expect(good.scheduledDays).toBeGreaterThan(hard.scheduledDays);
    expect(late.stability).toBeGreaterThan(good.stability);
    const failed = reviewMemory(memory, NOW + DAY_MS, 'fail');
    expect(failed.lapses).toBe(1);
    expect(failed.stability).toBeLessThan(memory.stability);
    expect(failed.difficulty).toBeGreaterThan(memory.difficulty);
    expect(JSON.parse(JSON.stringify(good))).toEqual(good);
  });

  it('does not grant memory strength for early, repeated, or assisted answers', () => {
    const original = acquire(),
      saved = JSON.stringify(original);
    let early = answer(original, 4, NOW + 1000);
    expect(early.skills[ID].memory).toEqual(original.skills[ID].memory);
    expect(early.totalXp).toBe(original.totalXp);
    const due = original.skills[ID].dueAt!;
    let assisted = answer(original, 4, due, true);
    expect(assisted.skills[ID].memory).toEqual(original.skills[ID].memory);
    expect(assisted.skills[ID].dueAt).toBe(due);
    assisted = answer(assisted, 1, due);
    expect(assisted.skills[ID].reviewCount).toBe(0);
    assisted = answer(assisted, 1, due);
    expect(assisted.skills[ID].reviewCount).toBe(0);
    assisted = answer(assisted, 4, due);
    const independent = answer(answer(original, 1, due), 4, due);
    expect(assisted.skills[ID].reviewCount).toBe(1);
    expect(assisted.skills[ID].intervalDays).toBeLessThan(
      independent.skills[ID].intervalDays,
    );
    expect(JSON.stringify(original)).toBe(saved);
  });

  it('keeps two learners independent and persists/migrates valid memory without resetting due dates', () => {
    const base = acquire(),
      due = base.skills[ID].dueAt!;
    const retained = answer(answer(base, 1, due), 4, due);
    const failed = answer(base, 4, due, false, false);
    expect(retained.skills[ID].memory!.lapses).toBe(0);
    expect(failed.skills[ID].memory!.lapses).toBe(1);
    expect(failed.skills[ID].dueAt).toBeNull();
    expect(
      parseStateUpdate({ state: state(retained), revision: 2 }).state.progress,
    ).toEqual(retained);
    const old = {
      ...base.skills[ID],
      intervalDays: 14,
      dueAt: NOW + 14 * DAY_MS,
      reviewCount: 3,
    };
    delete old.memory;
    delete old.reviewHadHint;
    expect(legacyMemory(old, NOW).dueAt).toBe(old.dueAt);
    const oldProgress = { ...base, skills: { [ID]: old } };
    expect(
      parseStateUpdate({ state: state(oldProgress), revision: 0 }).state
        .progress,
    ).toEqual(oldProgress);
    const migrated = answer(answer(oldProgress, 1, old.dueAt!), 4, old.dueAt!);
    expect(migrated.skills[ID].memory!.algorithm).toBe('fsrs-6');
    expect(migrated.skills[ID].memory!.stability).toBeGreaterThan(14);
    const invalid = state(structuredClone(retained));
    invalid.progress.skills[ID].memory!.stability = -1;
    expect(() => parseStateUpdate({ state: invalid, revision: 0 })).toThrow(
      'stability',
    );
  });

  it('combines offline review evidence once and keeps an observed hint when devices reconcile', () => {
    const base = acquire(),
      due = base.skills[ID].dueAt!;
    const left = state(answer(base, 1, due));
    const right = state(answer(answer(base, 4, due, true), 4, due + 1));
    const combined = mergeStates(left, right);
    expect(combined.progress.skills[ID].reviewCount).toBe(1);
    expect(combined.progress.skills[ID].reviewQuestionIds).toEqual([]);
    expect(combined.progress.skills[ID].intervalDays).toBeLessThan(7);
    expect(mergeStates(combined, combined)).toEqual(combined);
    expect(mergeStates(combined, left).progress.skills[ID].memory).toEqual(
      combined.progress.skills[ID].memory,
    );
    expect(parseStateUpdate({ state: combined, revision: 0 }).state).toEqual(
      combined,
    );
  });

  it('does not let a newer lesson read overwrite a completed retrieval schedule', () => {
    const base = acquire(),
      due = base.skills[ID].dueAt!;
    const reviewed = state(answer(answer(base, 1, due), 4, due));
    const read = state(recordLesson(base, ID, due + 60_000));
    const merged = mergeStates(reviewed, read);
    expect(merged.progress.skills[ID].dueAt).toBe(
      reviewed.progress.skills[ID].dueAt,
    );
    expect(merged.progress.skills[ID].memory).toEqual(
      reviewed.progress.skills[ID].memory,
    );
    expect(merged.progress.skills[ID].reviewCount).toBe(1);
  });

  it('resolves simultaneous Good and Hard retrievals conservatively in either merge order', () => {
    const base = acquire(),
      due = base.skills[ID].dueAt!;
    const good = state(answer(answer(base, 1, due), 4, due));
    const hard = state(
      answer(answer(answer(base, 4, due, true), 1, due), 4, due),
    );
    expect(good.progress.skills[ID].memory!.lastReviewAt).toBe(
      hard.progress.skills[ID].memory!.lastReviewAt,
    );
    expect(hard.progress.skills[ID].memory!.stability).toBeLessThan(
      good.progress.skills[ID].memory!.stability,
    );
    for (const merged of [mergeStates(good, hard), mergeStates(hard, good)]) {
      const skill = merged.progress.skills[ID];
      expect(skill.memory).toEqual(hard.progress.skills[ID].memory);
      expect(skill.dueAt).toBe(hard.progress.skills[ID].dueAt);
      expect(skill.intervalDays).toBe(hard.progress.skills[ID].intervalDays);
      expect(skill.reviewCount).toBe(1);
      expect(mergeStates(merged, good).progress.skills[ID].memory).toEqual(
        skill.memory,
      );
      expect(mergeStates(good, merged).progress.skills[ID].dueAt).toBe(
        skill.dueAt,
      );
    }
  });

  it('preserves newer retrieval precedence over a harder simultaneous tie candidate', () => {
    const base = acquire(),
      due = base.skills[ID].dueAt!;
    const hard = state(
      answer(answer(answer(base, 4, due, true), 1, due), 4, due),
    );
    const newer = state(answer(answer(base, 1, due + 1000), 4, due + 1000));
    for (const merged of [mergeStates(hard, newer), mergeStates(newer, hard)]) {
      expect(merged.progress.skills[ID].memory).toEqual(
        newer.progress.skills[ID].memory,
      );
      expect(merged.progress.skills[ID].dueAt).toBe(
        newer.progress.skills[ID].dueAt,
      );
    }
  });

  it('keeps partial review evidence and hints when memory values are unchanged', () => {
    const base = acquire(),
      due = base.skills[ID].dueAt!;
    const independent = state(answer(base, 1, due));
    const assisted = state(answer(base, 4, due + 1000, true));
    expect(independent.progress.skills[ID].memory).toEqual(
      assisted.progress.skills[ID].memory,
    );
    for (const merged of [
      mergeStates(independent, assisted),
      mergeStates(assisted, independent),
    ]) {
      const skill = merged.progress.skills[ID];
      expect(skill.memory).toEqual(base.skills[ID].memory);
      expect(skill.dueAt).toBe(due);
      expect(skill.reviewCount).toBe(0);
      expect(skill.reviewQuestionIds).toEqual([ID + '-q1']);
      expect(skill.reviewHadHint).toBe(true);
    }
  });

  it('compacts long histories without losing XP, accuracy, or failed prerequisite evidence', () => {
    const base = acquire();
    let progress = answer(base, 4, NOW + DAY_MS, false, false);
    for (let index = 0; index < MAX_RECENT_ATTEMPTS + 10; index++) {
      progress = applyAttempt(
        progress,
        {
          skillId: ID,
          questionId: `${ID}-q1`,
          mode: 'learn',
          correct: true,
          attemptId: `compact-${index}`,
        },
        NOW + DAY_MS + index + 1,
      );
    }
    expect(progress.attempts).toHaveLength(MAX_RECENT_ATTEMPTS);
    expect(progress.attempts.some((event) => !event.correct)).toBe(false);
    const merged = mergeStates(state(progress), state(base));
    expect(merged.progress.attempts).toHaveLength(MAX_RECENT_ATTEMPTS);
    expect(isMastered(merged.progress, ID)).toBe(false);
    expect(isUnlocked(merged.progress, 'variables')).toBe(false);
    expect(merged.progress.skills[ID].dueAt).toBeNull();
    expect(getStats(merged.progress, NOW, 'python-foundations').totalXp).toBe(
      45,
    );
    expect(getStats(merged.progress, NOW, 'python-foundations').todayXp).toBe(
      45,
    );
    expect(getStats(merged.progress, NOW).accuracy).toBeLessThan(1);
    expect(merged.progress.skills[ID].attempts).toBe(MAX_RECENT_ATTEMPTS + 15);
    expect(merged.progress.skills[ID].memory!.lapses).toBe(1);
    expect(parseStateUpdate({ state: merged, revision: 0 }).state).toEqual(
      merged,
    );
    const repaired = applyAttempt(
      merged.progress,
      { skillId: ID, questionId: `${ID}-q4`, mode: 'learn', correct: true },
      NOW + 2 * DAY_MS,
    );
    expect(isUnlocked(repaired, 'variables')).toBe(true);
    expect(repaired.totalXp).toBe(45);
    expect(repaired.skills[ID].memory!.lapses).toBe(1);
  });

  it('counts an independent offline writer even when its new event predates the compacted device snapshot', () => {
    const base = acquire();
    let left = applyAttempt(
      base,
      {
        skillId: ID,
        questionId: `${ID}-q4`,
        correct: false,
        mode: 'review',
        writerId: 'left-device',
      },
      NOW + DAY_MS,
    );
    for (let index = 0; index < MAX_RECENT_ATTEMPTS + 10; index++)
      left = applyAttempt(
        left,
        {
          skillId: ID,
          questionId: `${ID}-q1`,
          correct: true,
          mode: 'learn',
          writerId: 'left-device',
        },
        NOW + DAY_MS + index + 1,
      );
    const right = applyAttempt(
      base,
      {
        skillId: ID,
        questionId: `${ID}-q1`,
        correct: true,
        mode: 'review',
        writerId: 'right-device',
      },
      NOW + DAY_MS + 100,
    );
    const merged = mergeStates(state(left), state(right));
    expect(merged.progress.skills[ID].attempts).toBe(MAX_RECENT_ATTEMPTS + 16);
    expect(merged.progress.skills[ID].correct).toBe(MAX_RECENT_ATTEMPTS + 15);
    expect(merged.progress.totalXp).toBe(50);
    expect(isMastered(merged.progress, ID)).toBe(false);
    expect(mergeStates(merged, state(right)).progress.skills[ID].attempts).toBe(
      MAX_RECENT_ATTEMPTS + 16,
    );
    expect(parseStateUpdate({ state: merged, revision: 0 }).state).toEqual(
      merged,
    );
  });

  it('does not pay twice for the same due-cycle question answered on two devices', () => {
    const base = acquire(),
      due = base.skills[ID].dueAt!;
    const left = state(answer(base, 1, due));
    const right = state(answer(base, 1, due + 1));
    const merged = mergeStates(left, right);
    expect(merged.progress.totalXp).toBe(50);
    expect(getStats(merged.progress, due, 'python-foundations').totalXp).toBe(
      50,
    );
    expect(merged.progress.skills[ID].reviewQuestionIds).toEqual([`${ID}-q1`]);
    expect(merged.progress.skills[ID].reviewCount).toBe(0);
    expect(
      merged.progress.attempts
        .filter((event) => event.mode === 'review')
        .reduce((n, event) => n + event.xp, 0),
    ).toBe(5);
    expect(mergeStates(merged, right).progress.totalXp).toBe(50);
    expect(parseStateUpdate({ state: merged, revision: 0 }).state).toEqual(
      merged,
    );
  });
});
