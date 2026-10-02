import { describe, expect, it } from 'vitest';
import { defaultCatalog, skills } from '../src/lib/curriculum';
import {
  applyAttempt,
  dateKey,
  isMastered,
  recordLesson,
} from '../src/lib/learning';
import { createState, mergeStates, type LearnerState } from '../src/lib/state';
import { parseStateUpdate } from '../src/lib/server/state-validation';

const skill = skills.find((candidate) => candidate.prerequisites.length === 0)!;
const start = Date.parse('2026-10-01T12:00:00.000Z');
function answer(
  state: LearnerState,
  index: number,
  at: number,
  correct = true,
) {
  return {
    ...state,
    updatedAt: at,
    progress: applyAttempt(
      state.progress,
      {
        skillId: skill.id,
        questionId: skill.questions[index].id,
        correct,
        mode: 'learn',
      },
      at,
    ),
  };
}
function baseline() {
  const state = createState();
  return {
    ...state,
    createdAt: start,
    updatedAt: start,
    progress: recordLesson(state.progress, skill.id, start),
  };
}

describe('device progress reconciliation', () => {
  it('credits different questions answered offline on the same day', () => {
    const shared = baseline();
    const local = answer(shared, 0, start + 1);
    const remote = answer(shared, 1, start + 1);
    const combined = mergeStates(local, remote);
    expect(combined.progress.totalXp).toBe(20);
    expect(
      combined.progress.dailyXp[dateKey(start, combined.progress.timeZone)],
    ).toBe(20);
    expect(
      combined.progress.attempts.reduce((sum, attempt) => sum + attempt.xp, 0),
    ).toBe(20);
    expect(mergeStates(combined, local).progress.totalXp).toBe(20);
    expect(mergeStates(combined, combined)).toEqual(combined);
  });

  it('credits the same question only once even when offline attempt IDs differ', () => {
    const shared = baseline();
    const local = answer(shared, 0, start + 1);
    const remote = answer(shared, 0, start + 2);
    const combined = mergeStates(local, remote);
    expect(combined.progress.totalXp).toBe(10);
    expect(
      combined.progress.dailyXp[dateKey(start, combined.progress.timeZone)],
    ).toBe(10);
    expect(combined.progress.attempts).toHaveLength(2);
    expect(combined.progress.attempts.map((attempt) => attempt.xp)).toEqual([
      10, 0,
    ]);
    expect(combined.progress.skills[skill.id].rewardedQuestionIds).toEqual([
      skill.questions[0].id,
    ]);
    expect(mergeStates(combined, remote).progress.totalXp).toBe(10);
    expect(mergeStates(combined, combined)).toEqual(combined);
  });

  it('preserves XP outside a truncated attempt log while combining new rewards', () => {
    const shared = baseline();
    const day = dateKey(start, shared.progress.timeZone);
    shared.progress.totalXp = 50;
    shared.progress.dailyXp[day] = 50;
    const local = answer(shared, 1, start + 1);
    const remote = answer(shared, 2, start + 2);
    const combined = mergeStates(local, remote);
    expect(combined.progress.totalXp).toBe(70);
    expect(combined.progress.dailyXp[day]).toBe(70);
    expect(mergeStates(combined, local).progress.totalXp).toBe(70);
    expect(mergeStates(combined, combined)).toEqual(combined);
  });

  it('uses the permanent reward ledger when an old rewarded attempt has been truncated', () => {
    const historical = answer(baseline(), 0, start + 1);
    historical.progress.attempts = [];
    const replayed = answer(baseline(), 0, start + 2);
    const combined = mergeStates(historical, replayed);
    expect(combined.progress.totalXp).toBe(10);
    expect(
      combined.progress.dailyXp[dateKey(start, combined.progress.timeZone)],
    ).toBe(10);
    expect(combined.progress.attempts[0].xp).toBe(0);
    expect(answer(combined, 0, start + 3).progress.totalXp).toBe(10);
    expect(mergeStates(combined, replayed).progress.totalXp).toBe(10);
  });

  it('deduplicates shared attempts while preserving distinct offline mastery evidence and XP ledgers', () => {
    let shared = baseline();
    skill.questions.slice(0, -2).forEach((_, index) => {
      shared = answer(shared, index, start + index + 1);
    });
    const local = answer(
      shared,
      skill.questions.length - 2,
      start + skill.questions.length - 1,
    );
    const remote = answer(
      shared,
      skill.questions.length - 1,
      start + skill.questions.length,
    );
    const combined = mergeStates(local, remote);
    expect(combined.progress.attempts).toHaveLength(skill.questions.length);
    expect(combined.progress.skills[skill.id].attempts).toBe(
      skill.questions.length,
    );
    expect(combined.progress.skills[skill.id].rewardedQuestionIds).toEqual(
      expect.arrayContaining(skill.questions.map((question) => question.id)),
    );
    expect(isMastered(combined.progress, skill.id)).toBe(true);
    expect(combined.cards).toEqual(
      expect.arrayContaining(
        skill.flashcards.map((card) =>
          expect.objectContaining({ id: card.id, status: 'pending' }),
        ),
      ),
    );
    expect(combined.progress.skills[skill.id].dueAt).toBe(
      start + skill.questions.length + 86_400_000,
    );
    expect(parseStateUpdate({ state: combined, revision: 0 }).state).toEqual(
      combined,
    );
    expect(mergeStates(combined, combined)).toEqual(combined);
  });

  it('keeps a later failure and prevents relearning a previously rewarded question from farming XP', () => {
    let mastered = baseline();
    skill.questions.forEach((_, index) => {
      mastered = answer(mastered, index, start + index + 1);
    });
    const failed = answer(mastered, 0, start + 20, false);
    const merged = mergeStates(mastered, failed);
    expect(isMastered(merged.progress, skill.id)).toBe(false);
    expect(merged.progress.skills[skill.id].questionIds).not.toContain(
      skill.questions[0].id,
    );
    expect(merged.progress.attempts).toHaveLength(skill.questions.length + 1);
    expect(answer(merged, 0, start + 21).progress.totalXp).toBe(
      merged.progress.totalXp,
    );
    expect(merged.progress.skills[skill.id].consecutiveCorrect).toBe(0);
  });

  it('keeps synced cards and activity while newer preference changes do not discard learning history', () => {
    const learned = answer(baseline(), 0, start + 1);
    learned.cards = [
      {
        id: 'mastery:test',
        skillId: skill.id,
        skillName: skill.title,
        front: 'Question',
        back: 'Answer',
        kind: 'mastery',
        status: 'synced',
        noteId: 123,
      },
    ];
    const preferences = {
      ...baseline(),
      dailyGoal: 100,
      updatedAt: start + 30,
      cards: [
        { ...learned.cards[0], status: 'pending' as const, noteId: undefined },
      ],
    };
    const combined = mergeStates(preferences, learned);
    expect(combined.dailyGoal).toBe(100);
    expect(combined.progress.attempts).toHaveLength(1);
    expect(combined.progress.lastActivityDate).toBe(
      learned.progress.lastActivityDate,
    );
    expect(combined.cards[0]).toMatchObject({ status: 'synced', noteId: 123 });
    expect(combined.updatedAt).toBe(start + 30);
  });

  it('keeps cards pending after switching Anki profiles despite stale synced notes', () => {
    const previousProfile = baseline();
    previousProfile.anki.profile = 'Profile 1';
    previousProfile.cards = [
      {
        id: 'mastery:test',
        skillId: skill.id,
        skillName: skill.title,
        front: 'Question',
        back: 'Answer',
        kind: 'mastery',
        status: 'synced',
        noteId: 123,
      },
    ];
    const nextProfile = {
      ...previousProfile,
      updatedAt: start + 30,
      anki: { ...previousProfile.anki, profile: 'Profile 2' },
      cards: [
        {
          ...previousProfile.cards[0],
          status: 'pending' as const,
          noteId: undefined,
        },
      ],
    };
    for (const combined of [
      mergeStates(previousProfile, nextProfile),
      mergeStates(nextProfile, previousProfile),
    ]) {
      expect(combined.anki.profile).toBe('Profile 2');
      expect(combined.cards[0].status).toBe('pending');
      expect(combined.cards[0].noteId).toBeUndefined();
    }
  });

  it('creates mastery cards for an extensible choice-only subject catalog', () => {
    const choiceOnly = {
      ...skill,
      id: 'language:greetings',
      title: 'Greetings',
      questions: skill.questions.filter(
        (question) => question.type === 'choice',
      ),
      flashcards: skill.flashcards.map((card) => ({
        ...card,
        id: `language:${card.id}`,
        skillId: 'language:greetings',
      })),
      assessment: { requiredTypes: ['choice' as const], reviewAnswers: 2 },
    };
    const catalog = { ...defaultCatalog, skills: [choiceOnly] };
    const shared = baseline();
    shared.progress = recordLesson(
      createState().progress,
      choiceOnly.id,
      start,
      catalog,
    );
    const apply = (state: LearnerState, index: number) => ({
      ...state,
      updatedAt: start + index + 1,
      progress: applyAttempt(
        state.progress,
        {
          skillId: choiceOnly.id,
          questionId: choiceOnly.questions[index].id,
          correct: true,
          mode: 'learn',
        },
        start + index + 1,
        catalog,
      ),
    });
    let local = shared;
    choiceOnly.questions.slice(0, -1).forEach((_, index) => {
      local = apply(local, index);
    });
    const remote = apply(shared, choiceOnly.questions.length - 1);
    const combined = mergeStates(local, remote, catalog);
    expect(isMastered(combined.progress, choiceOnly.id, catalog)).toBe(true);
    expect(combined.cards).toEqual(
      expect.arrayContaining(
        choiceOnly.flashcards.map((card) =>
          expect.objectContaining({ id: card.id, status: 'pending' }),
        ),
      ),
    );
  });
});
