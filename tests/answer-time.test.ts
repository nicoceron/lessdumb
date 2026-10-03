import { describe, expect, it } from 'vitest';
import {
  AnswerClock,
  answerTime,
  averageAnswerTime,
  formatAnswerTime,
  MAX_ANSWER_MS,
  watchAnswerTime,
  type AnswerTimeEnvironment,
} from '../src/lib/answer-time';
import {
  applyAttempt,
  emptyProgress,
  isMastered,
  selectQuestion,
  STATE_VERSION,
  type Attempt,
  type Progress,
} from '../src/lib/learning';
import { skillById, skills } from '../src/lib/curriculum';
import {
  createState,
  mergeStates,
  migrateState,
  recordLearningAnswer,
  type LearnerState,
} from '../src/lib/state';
import { parseStateUpdate } from '../src/lib/server/state-validation';
import {
  activeQuiz,
  answerQuiz,
  quizQuestion,
  startQuiz,
} from '../src/lib/quiz';
import {
  activeDiagnostic,
  answerDiagnostic,
  diagnosticQuestion,
  startDiagnostic,
} from '../src/lib/placement';
import { masterSkill } from './helpers/mastery';

const NOW = Date.parse('2026-10-03T16:00:00Z');
const MINUTE = 60_000;

describe('the answer clock', () => {
  it('records nothing until the question becomes visible', () => {
    const clock = new AnswerClock();
    expect(clock.read(5_000)).toBeUndefined();
    clock.start(5_000);
    expect(clock.read(5_000)).toBe(0);
    expect(clock.read(12_345)).toBe(7_345);
  });

  it('starts once: a later start does not reset it', () => {
    const clock = new AnswerClock();
    clock.start(0);
    clock.start(4_000);
    expect(clock.read(10_000)).toBe(10_000);
  });

  it('pauses while the tab is hidden and resumes when it is shown', () => {
    const clock = new AnswerClock();
    clock.start(0);
    clock.setVisible(false, 3_000);
    expect(clock.read(60_000)).toBe(3_000);
    clock.setVisible(true, 60_000);
    expect(clock.read(65_000)).toBe(8_000);
    // Repeated events in one state change nothing.
    clock.setVisible(true, 70_000);
    clock.setVisible(false, 70_000);
    clock.setVisible(false, 90_000);
    clock.setVisible(true, 100_000);
    expect(clock.read(101_000)).toBe(14_000);
  });

  it('waits for the tab to be visible when the question appears in a hidden tab', () => {
    const clock = new AnswerClock(false);
    clock.start(1_000);
    expect(clock.read(50_000)).toBe(0);
    clock.setVisible(true, 50_000);
    expect(clock.read(52_000)).toBe(2_000);
  });

  it('ignores visibility changes before the question was seen', () => {
    const clock = new AnswerClock();
    clock.setVisible(false, 1_000);
    clock.setVisible(true, 2_000);
    expect(clock.read(3_000)).toBeUndefined();
    clock.start(4_000);
    expect(clock.read(5_000)).toBe(1_000);
  });

  it('caps the time at ten minutes', () => {
    expect(MAX_ANSWER_MS).toBe(10 * MINUTE);
    const clock = new AnswerClock();
    clock.start(0);
    expect(clock.read(10 * MINUTE - 1)).toBe(10 * MINUTE - 1);
    expect(clock.read(10 * MINUTE)).toBe(MAX_ANSWER_MS);
    expect(clock.read(3 * 60 * MINUTE)).toBe(MAX_ANSWER_MS);
    // Hidden time never counts toward the cap.
    const paused = new AnswerClock();
    paused.start(0);
    paused.setVisible(false, MINUTE);
    paused.setVisible(true, 24 * 60 * MINUTE);
    expect(paused.read(24 * 60 * MINUTE + MINUTE)).toBe(2 * MINUTE);
  });

  it('stores whole, nonnegative, capped milliseconds and nothing else', () => {
    expect(answerTime(1234.6)).toBe(1235);
    expect(answerTime(0)).toBe(0);
    expect(answerTime(MAX_ANSWER_MS + 1)).toBe(MAX_ANSWER_MS);
    for (const value of [-1, Number.NaN, Infinity, '500', null, undefined])
      expect(answerTime(value), String(value)).toBeUndefined();
  });
});

/** A document whose visibility a test can flip, and a controllable clock. */
function fakeEnvironment({
  hidden = false,
  observer = true,
}: { hidden?: boolean; observer?: boolean } = {}) {
  const events = new EventTarget();
  let state: DocumentVisibilityState = hidden ? 'hidden' : 'visible';
  let time = 0;
  const observers: {
    callback: (entries: { isIntersecting: boolean }[]) => void;
    targets: Element[];
    disconnected: boolean;
  }[] = [];
  const environment: AnswerTimeEnvironment = {
    document: {
      get visibilityState() {
        return state;
      },
      addEventListener: events.addEventListener.bind(events),
      removeEventListener: events.removeEventListener.bind(events),
    } as AnswerTimeEnvironment['document'],
    IntersectionObserver: observer
      ? class {
          private record: (typeof observers)[number];
          constructor(
            callback: (entries: { isIntersecting: boolean }[]) => void,
          ) {
            this.record = { callback, targets: [], disconnected: false };
            observers.push(this.record);
          }
          observe(target: Element) {
            this.record.targets.push(target);
          }
          disconnect() {
            this.record.disconnected = true;
          }
        }
      : undefined,
    now: () => time,
  };
  return {
    environment,
    observers,
    advance(ms: number) {
      time += ms;
    },
    setHidden(value: boolean) {
      state = value ? 'hidden' : 'visible';
      events.dispatchEvent(new Event('visibilitychange'));
    },
    intersect(isIntersecting = true) {
      for (const item of observers)
        if (!item.disconnected) item.callback([{ isIntersecting }]);
    },
  };
}

const card = {} as Element;

describe('timing a question in the page', () => {
  it('starts when the question scrolls into view, not when it is rendered', () => {
    const page = fakeEnvironment();
    const watch = watchAnswerTime(card, page.environment);
    expect(page.observers[0].targets).toEqual([card]);
    page.advance(30_000); // reading the explanation above the question
    expect(watch.read()).toBeUndefined();
    page.intersect(false);
    expect(watch.read()).toBeUndefined();
    page.intersect();
    expect(page.observers[0].disconnected).toBe(true);
    page.advance(12_000);
    expect(watch.read()).toBe(12_000);
    watch.stop();
  });

  it('pauses on visibilitychange while the tab is hidden', () => {
    const page = fakeEnvironment();
    const watch = watchAnswerTime(card, page.environment);
    page.intersect();
    page.advance(5_000);
    page.setHidden(true);
    page.advance(20 * MINUTE);
    expect(watch.read()).toBe(5_000);
    page.setHidden(false);
    page.advance(4_000);
    expect(watch.read()).toBe(9_000);
    watch.stop();
  });

  it('caps a question left open at ten minutes', () => {
    const page = fakeEnvironment();
    const watch = watchAnswerTime(card, page.environment);
    page.intersect();
    page.advance(45 * MINUTE);
    expect(watch.read()).toBe(MAX_ANSWER_MS);
    watch.stop();
  });

  it('starts at once without a target or without IntersectionObserver', () => {
    for (const [target, observer] of [
      [null, true],
      [card, false],
    ] as const) {
      const page = fakeEnvironment({ observer });
      const watch = watchAnswerTime(target, page.environment);
      page.advance(2_500);
      expect(watch.read()).toBe(2_500);
      watch.stop();
    }
  });

  it('starts paused when the page opens in a hidden tab', () => {
    const page = fakeEnvironment({ hidden: true });
    const watch = watchAnswerTime(null, page.environment);
    page.advance(MINUTE);
    expect(watch.read()).toBe(0);
    page.setHidden(false);
    page.advance(3_000);
    expect(watch.read()).toBe(3_000);
    watch.stop();
  });

  it('pauses and stops listening once stopped', () => {
    const page = fakeEnvironment();
    const watch = watchAnswerTime(card, page.environment);
    page.intersect();
    page.advance(1_000);
    watch.stop();
    expect(page.observers[0].disconnected).toBe(true);
    page.advance(5_000);
    expect(watch.read()).toBe(1_000);
    // The listener is gone: showing the tab again does not restart it.
    page.setHidden(true);
    page.setHidden(false);
    page.advance(1_000);
    expect(watch.read()).toBe(1_000);
  });

  it('resumes a stopped clock when the same question is shown again', () => {
    const page = fakeEnvironment();
    const first = watchAnswerTime(card, page.environment);
    page.intersect();
    page.advance(4_000);
    first.stop(); // the page remounted, or the learner left it
    page.advance(60_000);
    const again = watchAnswerTime(card, page.environment, first.clock);
    // Already seen: it runs on without waiting to scroll into view.
    expect(page.observers).toHaveLength(1);
    page.advance(3_000);
    expect(again.read()).toBe(7_000);
    page.setHidden(true);
    page.advance(MINUTE);
    expect(again.read()).toBe(7_000);
    again.stop();
  });

  it('resumes paused when the tab is hidden, and waits for a question never seen', () => {
    const page = fakeEnvironment();
    const first = watchAnswerTime(card, page.environment);
    page.intersect();
    page.advance(2_000);
    first.stop();
    page.setHidden(true);
    const hidden = watchAnswerTime(card, page.environment, first.clock);
    page.advance(MINUTE);
    expect(hidden.read()).toBe(2_000);
    page.setHidden(false);
    page.advance(500);
    expect(hidden.read()).toBe(2_500);
    hidden.stop();
    // A question that never scrolled into view still waits to be seen.
    const unseen = watchAnswerTime(card, page.environment);
    unseen.stop();
    const back = watchAnswerTime(card, page.environment, unseen.clock);
    page.advance(9_000);
    expect(back.read()).toBeUndefined();
    page.intersect();
    page.advance(1_000);
    expect(back.read()).toBe(1_000);
    back.stop();
  });
});

// The first Python skill: no prerequisites, choice and typed questions, code.
const skill = skillById['print-output'];
const point = skill.knowledgePoints![0];
const choice = point.questions.find((q) => q.type === 'choice')!;
const code = skill.questions.find((q) => q.type === 'code')!;

function answer(
  progress: Progress,
  questionId: string,
  elapsedMs: unknown,
  at = NOW,
) {
  return applyAttempt(
    progress,
    {
      skillId: skill.id,
      questionId,
      correct: true,
      mode: 'learn',
      elapsedMs: elapsedMs as number,
    },
    at,
  );
}

describe('answer time on attempts', () => {
  it('stores the time on lesson and review attempts, capped and whole', () => {
    const progress = emptyProgress(NOW, 'UTC');
    expect(answer(progress, choice.id, 8_400.4).attempts[0].elapsedMs).toBe(
      8_400,
    );
    expect(
      answer(progress, choice.id, 3 * MAX_ANSWER_MS).attempts[0].elapsedMs,
    ).toBe(MAX_ANSWER_MS);
    for (const invalid of [-5, Number.NaN, '900', undefined])
      expect(
        'elapsedMs' in answer(progress, choice.id, invalid).attempts[0],
        String(invalid),
      ).toBe(false);
    const review = applyAttempt(
      masterSkill(progress, skill.id, NOW),
      {
        skillId: skill.id,
        questionId: selectQuestion(
          masterSkill(progress, skill.id, NOW),
          skill,
          'review',
        ).id,
        correct: true,
        mode: 'review',
        elapsedMs: 4_200,
      },
      NOW + 2 * 86_400_000,
    );
    expect(review.attempts.at(-1)).toMatchObject({
      mode: 'review',
      elapsedMs: 4_200,
    });
  });

  it('stores the time on a code exercise attempt', () => {
    const progress = answer(emptyProgress(NOW, 'UTC'), code.id, 95_000);
    expect(progress.attempts[0]).toMatchObject({
      questionId: code.id,
      elapsedMs: 95_000,
    });
  });

  it('keeps the time through recordLearningAnswer and a save', () => {
    const state = recordLearningAnswer(createState(), {
      skillId: skill.id,
      questionId: choice.id,
      correct: false,
      mode: 'learn',
      elapsedMs: 21_000,
    });
    expect(state.progress.attempts[0].elapsedMs).toBe(21_000);
    // The mistake card is a reference; the time stays on the attempt.
    expect(JSON.stringify(state.cards)).not.toContain('21000');
    const saved = parseStateUpdate({
      state: JSON.parse(JSON.stringify(state)),
      revision: 0,
    }).state;
    expect(saved.progress.attempts[0].elapsedMs).toBe(21_000);
  });

  it('stores the time on quiz answers', () => {
    let progress = emptyProgress(NOW, 'UTC');
    for (const item of skills.filter(
      (candidate) => candidate.courseId === 'python-foundations',
    ))
      progress = masterSkill(progress, item.id, NOW);
    progress = startQuiz(
      { ...progress, totalXp: 1000 },
      'python-foundations',
      NOW,
    );
    const quiz = activeQuiz(progress)!;
    const { question } = quizQuestion(quiz.questions[0])!;
    const typed =
      question.type === 'choice' ? question.answer : 'not the answer';
    const answered = answerQuiz(
      progress,
      quiz.id,
      0,
      typed,
      NOW + 30_000,
      undefined,
      undefined,
      30_000,
    );
    expect(answered.attempts.at(-1)).toMatchObject({
      mode: 'quiz',
      quizId: quiz.id,
      elapsedMs: 30_000,
    });
    // An older caller without a time records none.
    const untimed = answerQuiz(progress, quiz.id, 0, typed, NOW + 30_000);
    expect(untimed.attempts.at(-1)!.elapsedMs).toBeUndefined();
  });

  it('caps placement answer times like every other attempt', () => {
    let progress = startDiagnostic(
      emptyProgress(NOW, 'UTC'),
      'python-foundations',
      NOW,
    );
    const current = activeDiagnostic(progress)!.current!;
    const { question } = diagnosticQuestion(current)!;
    const response = question.type === 'choice' ? question.answer : 'x';
    progress = answerDiagnostic(
      progress,
      activeDiagnostic(progress)!.id,
      response,
      NOW + MINUTE,
      2 * 60 * MINUTE,
    );
    expect(progress.diagnostics![0].answers[0].elapsedMs).toBe(MAX_ANSWER_MS);
  });

  it('rejects a saved time that is negative, fractional, or over the cap', () => {
    const state = recordLearningAnswer(createState(), {
      skillId: skill.id,
      questionId: choice.id,
      correct: true,
      mode: 'learn',
      elapsedMs: 1_000,
    });
    for (const invalid of [-1, 1.5, MAX_ANSWER_MS + 1, '1000', null]) {
      const bad = JSON.parse(JSON.stringify(state));
      bad.progress.attempts[0].elapsedMs = invalid;
      expect(
        () => parseStateUpdate({ state: bad, revision: 0 }),
        String(invalid),
      ).toThrow(/elapsedMs/);
    }
    const edge = JSON.parse(JSON.stringify(state));
    edge.progress.attempts[0].elapsedMs = MAX_ANSWER_MS;
    expect(
      parseStateUpdate({ state: edge, revision: 0 }).state.progress.attempts[0]
        .elapsedMs,
    ).toBe(MAX_ANSWER_MS);
  });
});

/** A state as an earlier schema saved it: no answer times anywhere. */
function savedAt(version: number, state: LearnerState) {
  const old = JSON.parse(JSON.stringify(state));
  old.version = version;
  old.progress.version = version;
  for (const attempt of old.progress.attempts) delete attempt.elapsedMs;
  return old;
}

describe('state version 9', () => {
  const learned = (() => {
    let state = createState();
    for (const question of point.questions.slice(0, 2))
      state = recordLearningAnswer(state, {
        skillId: skill.id,
        questionId: question.id,
        correct: true,
        mode: 'learn',
      });
    return state;
  })();

  it('is the current version', () => {
    expect(skill.prerequisites).toEqual([]);
    expect(STATE_VERSION).toBe(9);
    expect(createState().version).toBe(9);
    expect(emptyProgress(NOW, 'UTC').version).toBe(9);
  });

  it('migrates a version 8 state to version 9 without inventing times', () => {
    const v8 = savedAt(8, learned);
    const migrated = migrateState(v8);
    expect(migrated.version).toBe(9);
    expect(migrated.progress.version).toBe(9);
    expect(migrated.progress.attempts).toEqual(v8.progress.attempts);
    expect(
      migrated.progress.attempts.every(
        (a: Attempt) => a.elapsedMs === undefined,
      ),
    ).toBe(true);
    expect(migrated.cards).toEqual(v8.cards);
    // Migration is idempotent.
    expect(migrateState(migrated)).toBe(migrated);
    // The server accepts and migrates it the same way.
    const parsed = parseStateUpdate({ state: v8, revision: 3 });
    expect(parsed.revision).toBe(3);
    expect(parsed.state.version).toBe(9);
    expect(parsed.state.progress.attempts).toEqual(v8.progress.attempts);
  });

  it('loads every older version, 1 through 8', () => {
    for (let version = 1; version <= 8; version++) {
      const loaded = parseStateUpdate({
        state: savedAt(version, learned),
        revision: 0,
      }).state;
      expect(loaded.version, String(version)).toBe(STATE_VERSION);
      expect(loaded.progress.version, String(version)).toBe(STATE_VERSION);
      expect(isMastered(loaded.progress, skill.id)).toBe(false);
      expect(loaded.progress.attempts).toHaveLength(2);
    }
    expect(() =>
      parseStateUpdate({ state: savedAt(10, learned), revision: 0 }),
    ).toThrow(/version/);
  });

  it('merges a version 8 device with a version 9 device, keeping both histories', () => {
    const v8 = savedAt(8, learned);
    const timed = recordLearningAnswer(learned, {
      skillId: skill.id,
      questionId: point.questions[2].id,
      correct: true,
      mode: 'learn',
      elapsedMs: 7_000,
    });
    for (const merged of [mergeStates(v8, timed), mergeStates(timed, v8)]) {
      expect(merged.version).toBe(STATE_VERSION);
      expect(merged.progress.attempts).toHaveLength(3);
      expect(merged.progress.attempts.at(-1)!.elapsedMs).toBe(7_000);
    }
  });
});

describe('average answer time', () => {
  const attempt = (
    questionId: string,
    elapsedMs?: number,
    skillId = skill.id,
  ): Attempt => ({
    id: crypto.randomUUID(),
    skillId,
    questionId,
    correct: true,
    mode: 'learn',
    usedHint: false,
    at: new Date(NOW).toISOString(),
    xp: 0,
    ...(elapsedMs !== undefined ? { elapsedMs } : {}),
  });

  it('averages timed answers to questions of the skill', () => {
    expect(
      averageAnswerTime(
        [
          attempt(choice.id, 10_000),
          attempt(point.questions[1].id, 20_001),
          // Untimed (older) answers, code runs, and other skills do not count.
          attempt(choice.id),
          attempt(code.id, 400_000),
          attempt('other-q', 90_000, 'other-skill'),
        ],
        skill,
      ),
    ).toEqual({ ms: 15_001, count: 2 });
    expect(averageAnswerTime([attempt(choice.id)], skill)).toBeNull();
    expect(averageAnswerTime([], skill)).toBeNull();
  });

  it('formats seconds and minutes', () => {
    expect(formatAnswerTime(400)).toBe('0 s');
    expect(formatAnswerTime(8_400)).toBe('8 s');
    expect(formatAnswerTime(59_400)).toBe('59 s');
    expect(formatAnswerTime(65_000)).toBe('1 min 5 s');
    expect(formatAnswerTime(MAX_ANSWER_MS)).toBe('10 min');
  });
});
