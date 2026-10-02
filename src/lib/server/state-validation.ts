import { courses } from '../curriculum';
import type { LearnerState } from '../state';

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
  ]);
  if (progress.version !== 1) fail(`${path}.version`, '1');
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
  ]);
  const id = string(attempt.id, `${path}.id`);
  string(attempt.skillId, `${path}.skillId`);
  string(attempt.questionId, `${path}.questionId`);
  boolean(attempt.correct, `${path}.correct`);
  boolean(attempt.usedHint, `${path}.usedHint`);
  if (attempt.mode !== 'learn' && attempt.mode !== 'review')
    fail(`${path}.mode`, 'learn or review');
  isoTimestamp(attempt.at, `${path}.at`);
  number(attempt.xp, `${path}.xp`, 0, 10_000);
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
  if (state.version !== 1) fail('state.version', '1');
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
  const parsed = body.state as LearnerState;
  const normalized =
    parsed.activeCourseId &&
    !courses.some((c) => c.id === parsed.activeCourseId)
      ? { ...parsed, activeCourseId: courses[0].id }
      : parsed;
  return { state: normalized, revision };
}
