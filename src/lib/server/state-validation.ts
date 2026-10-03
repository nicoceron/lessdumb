import { courses } from '../catalog-index';
import { migrateState, type LearnerState } from '../state';
import { MAX_SAVED_QUIZZES } from '../quiz';
import { activityTotals, type ActivityState } from '../activity';
import { TYPED_RESPONSE_MAX_LENGTH } from '../typed-answer';
import { MAX_VARIANT_SEED } from '../variants';

/** The full current catalog plus every mastery/mistake card fits with headroom. */
export const MAX_STATE_BODY_BYTES = 4 * 1024 * 1024;

export class StateValidationError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
    this.name = 'StateValidationError';
  }
}

function fail(path: string, expected: string): never {
  throw new StateValidationError(`${path} must be ${expected}.`);
}
function object(
  value: unknown,
  path: string,
  keys?: string[],
): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    return fail(path, 'an object');
  const result = value as Record<string, unknown>;
  for (const key of Object.keys(result)) {
    if (
      ['__proto__', 'prototype', 'constructor'].includes(key) ||
      (keys && !keys.includes(key))
    )
      fail(`${path}.${key}`, 'a supported field');
  }
  return result;
}
function number(
  value: unknown,
  path: string,
  min = 0,
  max = Number.MAX_SAFE_INTEGER,
  integer = true,
): number {
  if (
    typeof value !== 'number' ||
    !Number.isFinite(value) ||
    value < min ||
    value > max ||
    (integer && !Number.isSafeInteger(value))
  )
    return fail(
      path,
      `a ${integer ? 'whole ' : ''}number between ${min} and ${max}`,
    );
  return value;
}
function string(
  value: unknown,
  path: string,
  max = 256,
  nonempty = true,
): string {
  if (
    typeof value !== 'string' ||
    value.length > max ||
    (nonempty && !value.trim())
  )
    return fail(
      path,
      `a ${nonempty ? 'nonempty ' : ''}string with at most ${max} characters`,
    );
  return value;
}
/** A choice index, or the text typed for a typed question. */
function answer(value: unknown, path: string): number | string {
  return typeof value === 'string'
    ? string(value, path, TYPED_RESPONSE_MAX_LENGTH)
    : number(value, path, 0, 100);
}
function boolean(value: unknown, path: string): boolean {
  if (typeof value !== 'boolean') return fail(path, 'a boolean');
  return value;
}
function timestamp(
  value: unknown,
  path: string,
  nullable = false,
): number | null {
  if (nullable && value === null) return null;
  return number(value, path, 0, 8_640_000_000_000_000);
}
function array(value: unknown, path: string, max: number): unknown[] {
  if (!Array.isArray(value) || value.length > max)
    return fail(path, `an array with at most ${max} items`);
  return value;
}
function strings(value: unknown, path: string, max = 1000): string[] {
  const values = array(value, path, max).map((item, index) =>
    string(item, `${path}[${index}]`),
  );
  if (new Set(values).size !== values.length)
    fail(path, 'an array of distinct IDs');
  return values;
}
function date(value: unknown, path: string, nullable = false): string | null {
  if (nullable && value === null) return null;
  const result = string(value, path, 10);
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(result) ||
    !Number.isFinite(Date.parse(result)) ||
    new Date(result).toISOString().slice(0, 10) !== result
  )
    fail(path, 'a date in YYYY-MM-DD format');
  return result;
}

function isoTimestamp(
  value: unknown,
  path: string,
  nullable = false,
): string | null {
  if (nullable && value === null) return null;
  const result = string(value, path, 35);
  if (
    !Number.isFinite(Date.parse(result)) ||
    new Date(result).toISOString() !== result
  )
    fail(path, 'an ISO UTC timestamp');
  return result;
}

const SKILL_FIELDS = [
  'lessonSeen',
  'attempts',
  'correct',
  'questionIds',
  'rewardedQuestionIds',
  'reviewQuestionIds',
  'consecutiveCorrect',
  'mastery',
  'intervalDays',
  'dueAt',
  'lastPracticedAt',
  'reviewCount',
  'learnedAt',
  'lastQuestionId',
  'memory',
  'reviewHadHint',
  'evidenceUpdates',
  'totalXp',
  'dailyXp',
  'activity',
  'lessonAttempt',
  'lessonFailedAt',
  'lessonRewarded',
  'implicitCredit',
  'placement',
];

function validateSkill(value: unknown, path: string) {
  const skill = object(value, path, SKILL_FIELDS);
  boolean(skill.lessonSeen, `${path}.lessonSeen`);
  const attempts = number(skill.attempts, `${path}.attempts`);
  number(skill.correct, `${path}.correct`, 0, attempts);
  number(skill.consecutiveCorrect, `${path}.consecutiveCorrect`, 0, attempts);
  number(skill.reviewCount, `${path}.reviewCount`, 0, attempts);
  number(skill.mastery, `${path}.mastery`, 0, 1, false);
  number(skill.intervalDays, `${path}.intervalDays`, 0, 36_500, false);
  strings(skill.questionIds, `${path}.questionIds`);
  strings(skill.rewardedQuestionIds, `${path}.rewardedQuestionIds`);
  strings(skill.reviewQuestionIds, `${path}.reviewQuestionIds`);
  timestamp(skill.dueAt, `${path}.dueAt`, true);
  timestamp(skill.lastPracticedAt, `${path}.lastPracticedAt`, true);
  isoTimestamp(skill.learnedAt, `${path}.learnedAt`, true);
  if (skill.lastQuestionId !== null)
    string(skill.lastQuestionId, `${path}.lastQuestionId`);
  if (skill.reviewHadHint !== undefined)
    boolean(skill.reviewHadHint, `${path}.reviewHadHint`);
  if (skill.memory !== undefined) {
    const m = object(skill.memory, `${path}.memory`, [
      'algorithm',
      'dueAt',
      'lastReviewAt',
      'stability',
      'difficulty',
      'elapsedDays',
      'scheduledDays',
      'reps',
      'lapses',
    ]);
    if (m.algorithm !== 'fsrs-6') fail(`${path}.memory.algorithm`, 'fsrs-6');
    timestamp(m.dueAt, `${path}.memory.dueAt`);
    timestamp(m.lastReviewAt, `${path}.memory.lastReviewAt`);
    number(m.stability, `${path}.memory.stability`, 0.001, 36_500, false);
    number(m.difficulty, `${path}.memory.difficulty`, 1, 10, false);
    number(m.elapsedDays, `${path}.memory.elapsedDays`, 0, 100_000_000);
    number(m.scheduledDays, `${path}.memory.scheduledDays`, 1, 36_500);
    number(m.reps, `${path}.memory.reps`, 1);
    number(m.lapses, `${path}.memory.lapses`, 0);
  }
  if (skill.totalXp !== undefined) number(skill.totalXp, `${path}.totalXp`);
  if (skill.lessonRewarded !== undefined)
    boolean(skill.lessonRewarded, `${path}.lessonRewarded`);
  if (skill.placement !== undefined) {
    const at = `${path}.placement`;
    const placement = object(skill.placement, at, [
      'at',
      'diagnosticId',
      'confirmedAt',
      'demotedAt',
    ]);
    const placedAt = timestamp(placement.at, `${at}.at`)!;
    string(placement.diagnosticId, `${at}.diagnosticId`, 128);
    for (const key of ['confirmedAt', 'demotedAt'] as const)
      if (placement[key] !== undefined) {
        const when = timestamp(placement[key], `${at}.${key}`)!;
        if (when < placedAt) fail(`${at}.${key}`, 'after the placement');
      }
  }
  if (skill.implicitCredit !== undefined) {
    const at = `${path}.implicitCredit`;
    const credit = object(skill.implicitCredit, at, [
      'at',
      'day',
      'from',
      'weight',
      'basis',
      'dueBefore',
      'dueAt',
    ]);
    timestamp(credit.at, `${at}.at`);
    date(credit.day, `${at}.day`);
    string(credit.from, `${at}.from`);
    const weight = number(credit.weight, `${at}.weight`, 0, 1, false);
    if (weight <= 0) fail(`${at}.weight`, 'greater than 0');
    timestamp(credit.basis, `${at}.basis`);
    const before = timestamp(credit.dueBefore, `${at}.dueBefore`)!;
    const after = timestamp(credit.dueAt, `${at}.dueAt`)!;
    if (after < before) fail(`${at}.dueAt`, 'no earlier than dueBefore');
  }
  if (skill.lessonFailedAt !== undefined)
    timestamp(skill.lessonFailedAt, `${path}.lessonFailedAt`);
  if (skill.lessonAttempt !== undefined) {
    const lesson = object(skill.lessonAttempt, `${path}.lessonAttempt`, [
      'startedAt',
      'steps',
    ]);
    timestamp(lesson.startedAt, `${path}.lessonAttempt.startedAt`);
    const steps = object(lesson.steps, `${path}.lessonAttempt.steps`);
    if (Object.keys(steps).length > 100)
      fail(`${path}.lessonAttempt.steps`, 'at most 100 lesson steps');
    for (const [id, value] of Object.entries(steps)) {
      string(id, `${path}.lessonAttempt.steps ID`);
      const step = object(value, `${path}.lessonAttempt.steps.${id}`, [
        'correct',
        'incorrect',
      ]);
      strings(step.correct, `${path}.lessonAttempt.steps.${id}.correct`, 100);
      number(step.incorrect, `${path}.lessonAttempt.steps.${id}.incorrect`);
    }
  }
  if (skill.activity !== undefined) {
    const activity = object(skill.activity, `${path}.activity`, [
      'version',
      'baseline',
      'writers',
    ]);
    if (activity.version !== 1) fail(`${path}.activity.version`, '1');
    const validateCount = (value: unknown, countPath: string) => {
      const count = object(value, countPath, ['attempts', 'correct']);
      const attempts = number(count.attempts, `${countPath}.attempts`);
      number(count.correct, `${countPath}.correct`, 0, attempts);
    };
    validateCount(activity.baseline, `${path}.activity.baseline`);
    const writers = object(activity.writers, `${path}.activity.writers`);
    if (Object.keys(writers).length > 10_000)
      fail(`${path}.activity.writers`, 'at most 10000 writer counters');
    for (const [id, value] of Object.entries(writers)) {
      if (!/^[a-zA-Z0-9_-]{1,128}$/.test(id))
        fail(`${path}.activity writer`, 'a safe writer ID');
      validateCount(value, `${path}.activity.writers.${id}`);
    }
    let totals;
    try {
      totals = activityTotals(activity as unknown as ActivityState);
    } catch {
      fail(`${path}.activity`, 'valid safe counters');
    }
    if (
      totals.attempts > attempts ||
      totals.correct > (skill.correct as number)
    )
      fail(`${path}.activity`, 'counters within skill totals');
  }
  if (skill.dailyXp !== undefined) {
    const days = object(skill.dailyXp, `${path}.dailyXp`);
    if (Object.keys(days).length > 36_500)
      fail(`${path}.dailyXp`, 'at most 36500 days');
    for (const [day, xp] of Object.entries(days)) {
      date(day, `${path}.dailyXp date`);
      number(xp, `${path}.dailyXp.${day}`);
    }
  }
  if (skill.evidenceUpdates !== undefined) {
    const updates = object(skill.evidenceUpdates, `${path}.evidenceUpdates`);
    if (Object.keys(updates).length > 1000)
      fail(`${path}.evidenceUpdates`, 'at most 1000 evidence checkpoints');
    for (const [id, value] of Object.entries(updates)) {
      string(id, `${path}.evidenceUpdates ID`);
      const update = object(value, `${path}.evidenceUpdates.${id}`, [
        'at',
        'sequence',
        'correct',
      ]);
      timestamp(update.at, `${path}.evidenceUpdates.${id}.at`);
      number(update.sequence, `${path}.evidenceUpdates.${id}.sequence`);
      boolean(update.correct, `${path}.evidenceUpdates.${id}.correct`);
    }
  }
}

function validateCard(value: unknown, path: string): string {
  const card = object(value, path, [
    'id',
    'skillId',
    'skillName',
    'front',
    'back',
    'kind',
    'status',
    'noteId',
    'lastError',
  ]);
  const id = string(card.id, `${path}.id`);
  string(card.skillId, `${path}.skillId`);
  string(card.skillName, `${path}.skillName`);
  string(card.front, `${path}.front`, 100_000);
  string(card.back, `${path}.back`, 100_000);
  if (card.kind !== 'mastery' && card.kind !== 'mistake')
    fail(`${path}.kind`, 'mastery or mistake');
  if (card.status !== 'pending' && card.status !== 'synced')
    fail(`${path}.status`, 'pending or synced');
  if (card.noteId !== undefined) number(card.noteId, `${path}.noteId`, 1);
  if (card.lastError !== undefined)
    string(card.lastError, `${path}.lastError`, 2048, false);
  return id;
}

function validateProgress(value: unknown) {
  const path = 'state.progress';
  const progress = object(value, path, [
    'version',
    'skills',
    'totalXp',
    'dailyXp',
    'lastActivityDate',
    'streak',
    'attempts',
    'timeZone',
    'quizzes',
    'diagnostics',
  ]);
  if (![1, 2, 3, 4, 5].includes(progress.version as number))
    fail(`${path}.version`, '1 to 5');
  if (progress.diagnostics !== undefined) {
    const ids = array(progress.diagnostics, `${path}.diagnostics`, 10).map(
      (diagnostic, index) =>
        validateDiagnostic(diagnostic, `${path}.diagnostics[${index}]`),
    );
    if (new Set(ids).size !== ids.length)
      fail(`${path}.diagnostics`, 'an array of distinct diagnostic IDs');
  }
  if (progress.quizzes !== undefined) {
    const ids = array(
      progress.quizzes,
      `${path}.quizzes`,
      MAX_SAVED_QUIZZES,
    ).map((quiz, index) => validateQuiz(quiz, `${path}.quizzes[${index}]`));
    if (new Set(ids).size !== ids.length)
      fail(`${path}.quizzes`, 'an array of distinct quiz IDs');
  }
  number(progress.totalXp, `${path}.totalXp`);
  number(progress.streak, `${path}.streak`);
  date(progress.lastActivityDate, `${path}.lastActivityDate`, true);
  const timeZone = string(progress.timeZone, `${path}.timeZone`, 100);
  try {
    new Intl.DateTimeFormat('en', { timeZone });
  } catch {
    fail(`${path}.timeZone`, 'a supported IANA time zone');
  }
  const skills = object(progress.skills, `${path}.skills`);
  if (Object.keys(skills).length > 10_000)
    fail(`${path}.skills`, 'at most 10000 skills');
  for (const [id, skill] of Object.entries(skills)) {
    string(id, `${path}.skills key`);
    validateSkill(skill, `${path}.skills.${id}`);
  }
  const dailyXp = object(progress.dailyXp, `${path}.dailyXp`);
  if (Object.keys(dailyXp).length > 36_500)
    fail(`${path}.dailyXp`, 'at most 36500 dates');
  for (const [day, xp] of Object.entries(dailyXp)) {
    date(day, `${path}.dailyXp key`);
    number(xp, `${path}.dailyXp.${day}`);
  }
  const attemptIds = array(progress.attempts, `${path}.attempts`, 5000).map(
    (attempt, index) => validateAttempt(attempt, `${path}.attempts[${index}]`),
  );
  if (new Set(attemptIds).size !== attemptIds.length)
    fail(`${path}.attempts`, 'an array of distinct attempt IDs');
}

function validateDiagnosticQuestion(
  value: unknown,
  path: string,
  answered: boolean,
) {
  const question = object(
    value,
    path,
    answered
      ? [
          'skillId',
          'questionId',
          'presentation',
          'answer',
          'correct',
          'at',
          'elapsedMs',
          'variant',
        ]
      : ['skillId', 'questionId', 'presentation', 'variant'],
  );
  string(question.skillId, `${path}.skillId`);
  string(question.questionId, `${path}.questionId`);
  number(question.presentation, `${path}.presentation`);
  if (question.variant !== undefined)
    number(question.variant, `${path}.variant`, 0, MAX_VARIANT_SEED);
  if (answered) {
    answer(question.answer, `${path}.answer`);
    boolean(question.correct, `${path}.correct`);
    timestamp(question.at, `${path}.at`);
    if (question.elapsedMs !== undefined)
      number(question.elapsedMs, `${path}.elapsedMs`, 0, 24 * 3_600_000);
  }
}

function validateDiagnostic(value: unknown, path: string): string {
  const diagnostic = object(value, path, [
    'id',
    'courseId',
    'startedAt',
    'answers',
    'current',
    'completedAt',
    'placed',
  ]);
  const id = string(diagnostic.id, `${path}.id`, 160);
  string(diagnostic.courseId, `${path}.courseId`, 128);
  const startedAt = timestamp(diagnostic.startedAt, `${path}.startedAt`)!;
  array(diagnostic.answers, `${path}.answers`, 60).forEach((answer, index) =>
    validateDiagnosticQuestion(answer, `${path}.answers[${index}]`, true),
  );
  if (diagnostic.current !== undefined)
    validateDiagnosticQuestion(diagnostic.current, `${path}.current`, false);
  if (diagnostic.completedAt !== undefined) {
    const completedAt = timestamp(
      diagnostic.completedAt,
      `${path}.completedAt`,
    )!;
    if (completedAt < startedAt) fail(`${path}.completedAt`, 'after the start');
    if (diagnostic.current !== undefined)
      fail(`${path}.current`, 'absent once the test has ended');
  }
  if (diagnostic.placed !== undefined)
    strings(diagnostic.placed, `${path}.placed`, 2000);
  return id;
}

function validateQuiz(value: unknown, path: string): string {
  const quiz = object(value, path, [
    'id',
    'number',
    'courseId',
    'createdAt',
    'timeLimitMs',
    'xpMark',
    'possible',
    'questions',
    'completedAt',
    'earned',
  ]);
  const id = string(quiz.id, `${path}.id`, 128);
  number(quiz.number, `${path}.number`, 1);
  string(quiz.courseId, `${path}.courseId`, 128);
  const createdAt = timestamp(quiz.createdAt, `${path}.createdAt`)!;
  number(quiz.timeLimitMs, `${path}.timeLimitMs`, 1, 24 * 3_600_000);
  number(quiz.xpMark, `${path}.xpMark`);
  const possible = number(quiz.possible, `${path}.possible`, 0, 1000);
  const questions = array(quiz.questions, `${path}.questions`, 20);
  if (!questions.length) fail(`${path}.questions`, 'a nonempty array');
  questions.forEach((value, index) => {
    const at = `${path}.questions[${index}]`;
    const question = object(value, at, [
      'skillId',
      'questionId',
      'presentation',
      'answer',
      'correct',
      'answeredAt',
      'variant',
    ]);
    string(question.skillId, `${at}.skillId`);
    string(question.questionId, `${at}.questionId`);
    number(question.presentation, `${at}.presentation`);
    if (question.variant !== undefined)
      number(question.variant, `${at}.variant`, 0, MAX_VARIANT_SEED);
    if (question.answer !== undefined && question.answer !== null)
      answer(question.answer, `${at}.answer`);
    if (question.correct !== undefined)
      boolean(question.correct, `${at}.correct`);
    if ((question.answer === undefined) !== (question.correct === undefined))
      fail(at, 'answered and graded together');
    if (question.answeredAt !== undefined)
      timestamp(question.answeredAt, `${at}.answeredAt`);
  });
  if ((quiz.completedAt === undefined) !== (quiz.earned === undefined))
    fail(path, 'completed and scored together');
  if (quiz.completedAt !== undefined) {
    const completedAt = timestamp(quiz.completedAt, `${path}.completedAt`)!;
    if (completedAt < createdAt) fail(`${path}.completedAt`, 'after creation');
    number(quiz.earned, `${path}.earned`, 0, possible);
  }
  return id;
}

function validateAttempt(value: unknown, path: string): string {
  const attempt = object(value, path, [
    'id',
    'skillId',
    'questionId',
    'correct',
    'mode',
    'usedHint',
    'at',
    'xp',
    'reviewDueAt',
    'outcome',
    'quizId',
    'credited',
    'response',
    'variant',
  ]);
  const id = string(attempt.id, `${path}.id`);
  string(attempt.skillId, `${path}.skillId`);
  string(attempt.questionId, `${path}.questionId`);
  boolean(attempt.correct, `${path}.correct`);
  boolean(attempt.usedHint, `${path}.usedHint`);
  if (!['learn', 'review', 'quiz'].includes(attempt.mode as string))
    fail(`${path}.mode`, 'learn, review or quiz');
  if (attempt.quizId !== undefined) string(attempt.quizId, `${path}.quizId`);
  if (attempt.response !== undefined)
    string(attempt.response, `${path}.response`, TYPED_RESPONSE_MAX_LENGTH);
  if (attempt.variant !== undefined)
    number(attempt.variant, `${path}.variant`, 0, MAX_VARIANT_SEED);
  if (attempt.credited !== undefined)
    strings(attempt.credited, `${path}.credited`, 100);
  isoTimestamp(attempt.at, `${path}.at`);
  number(attempt.xp, `${path}.xp`, 0, 10_000);
  if (attempt.reviewDueAt !== undefined)
    timestamp(attempt.reviewDueAt, `${path}.reviewDueAt`);
  if (
    attempt.outcome !== undefined &&
    !['lesson-passed', 'lesson-failed', 'review-passed'].includes(
      attempt.outcome as string,
    )
  )
    fail(`${path}.outcome`, 'a task outcome');
  return id;
}

export function parseStateUpdate(value: unknown): {
  state: LearnerState;
  revision: number;
} {
  const body = object(value, 'request', ['state', 'revision']);
  const revision = number(
    body.revision,
    'revision',
    0,
    Number.MAX_SAFE_INTEGER - 1,
  );
  const state = object(body.state, 'state', [
    'version',
    'progress',
    'dailyGoal',
    'activeCourseId',
    'cards',
    'anki',
    'createdAt',
    'updatedAt',
  ]);
  // Version 1 accounts predate knowledge-point lessons; they migrate on read.
  if (![1, 2, 3, 4, 5].includes(state.version as number))
    fail('state.version', '1 to 5');
  number(state.dailyGoal, 'state.dailyGoal', 1, 10_000);
  if (state.activeCourseId !== undefined)
    string(state.activeCourseId, 'state.activeCourseId', 128);
  timestamp(state.createdAt, 'state.createdAt');
  timestamp(state.updatedAt, 'state.updatedAt');
  validateProgress(state.progress);
  const cardIds = array(state.cards, 'state.cards', 10_000).map((card, index) =>
    validateCard(card, `state.cards[${index}]`),
  );
  if (new Set(cardIds).size !== cardIds.length)
    fail('state.cards', 'an array of distinct card IDs');
  const anki = object(state.anki, 'state.anki', [
    'connected',
    'profile',
    'deck',
  ]);
  boolean(anki.connected, 'state.anki.connected');
  if (anki.profile !== null) string(anki.profile, 'state.anki.profile', 256);
  string(anki.deck, 'state.anki.deck', 256);
  const parsed = migrateState(body.state as LearnerState);
  const normalized =
    parsed.activeCourseId &&
    !courses.some((c) => c.id === parsed.activeCourseId)
      ? { ...parsed, activeCourseId: courses[0].id }
      : parsed;
  return { state: normalized, revision };
}
