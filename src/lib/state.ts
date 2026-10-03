import {
  applyAttempt,
  currentLessonAttempt,
  dateKey,
  emptyProgress,
  isMastered,
  MAX_RECENT_ATTEMPTS,
  type EvidenceUpdate,
  type ImplicitCredit,
  type Placement,
  type Attempt,
  type AttemptInput,
  type LessonAttempt,
  type Progress,
  type SkillProgress,
} from './learning';
import type { GraphCatalog, SkillOutline } from './curriculum';
import { defaultCatalog, skillById } from './catalog-index';
import { contentOf } from './content';
import { plainProse } from './math-text';
import { acceptedAnswer } from './typed-answer';
import { mergeQuizzes, type Quiz } from './quiz';
import { mergeDiagnostics } from './placement';
import {
  evidenceIdFor,
  findQuestion,
  hasKnowledgePoints,
  hasLessonEvidence,
  legacyQuestionIds,
  lessonEvidenceIds,
  masteryFraction,
  reviewCycleComplete,
} from './lesson-plan';
import {
  acquisitionMemory,
  legacyMemory,
  reviewMemory,
  type MemoryState,
} from './retention';
import { activityTotals, mergeActivity } from './activity';
import type { AnkiCard } from './anki';

export interface QueuedCard extends AnkiCard {
  status: 'pending' | 'synced';
  noteId?: number;
  lastError?: string;
}
/**
 * Version 2 adds knowledge-point lesson attempts, cooldowns and task XP;
 * version 3 adds quizzes; version 4 adds implicit review credit; version 5
 * adds placement diagnostics.
 */
export interface LearnerState {
  version: 5;
  progress: Progress;
  dailyGoal: number;
  /** Optional for backward compatibility with existing saved accounts. */
  activeCourseId?: string;
  cards: QueuedCard[];
  anki: { connected: boolean; profile: string | null; deck: string };
  createdAt: number;
  updatedAt: number;
}
export function createState(): LearnerState {
  return {
    version: 5,
    progress: emptyProgress(),
    dailyGoal: 50,
    activeCourseId: 'python-foundations',
    cards: [],
    anki: { connected: false, profile: null, deck: 'lessdumb::Learning' },
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

/**
 * Record an answer against the current state without replacing concurrent
 * work. The skill's content must be loaded: mistake and mastery cards carry
 * its text.
 */
export function recordLearningAnswer(
  state: LearnerState,
  input: AttemptInput,
): LearnerState {
  const progress = applyAttempt(state.progress, input);
  // A stable attempt identity can be replayed by a state updater or save retry.
  if (progress === state.progress) return state;
  const skill = contentOf(skillById[input.skillId]);
  if (!skill)
    throw new Error(`Load ${input.skillId} before recording its answers.`);
  const question = findQuestion(skill, input.questionId)!;
  const cards = [...state.cards];
  const cardIds = new Set(cards.map((card) => card.id));
  const add = (card: QueuedCard) => {
    if (cardIds.has(card.id)) return;
    cardIds.add(card.id);
    cards.push(card);
  };

  if (!input.correct) {
    add({
      id: `mistake:${skill.id}:${question.id}`,
      skillId: skill.id,
      skillName: skill.title,
      kind: 'mistake',
      front: `${plainProse(question.prompt)}${question.type !== 'code' && question.code ? `\n\n${question.code}` : ''}`,
      back: `${
        question.type === 'code'
          ? question.solution
          : question.type !== 'choice'
            ? acceptedAnswer(question)
            : question.checksOutput
              ? question.choices[question.answer]
              : plainProse(question.choices[question.answer])
      }\n\n${plainProse(question.explanation)}`,
      status: 'pending',
    });
  }
  if (isMastered(progress, skill.id) && !isMastered(state.progress, skill.id)) {
    for (const card of skill.flashcards) {
      add({
        ...card,
        skillName: skill.title,
        kind: 'mastery',
        status: 'pending',
      });
    }
  }
  return { ...state, progress, cards };
}

// Task XP rides on the answer that completed the task: one lesson reward per
// skill, one review reward per due cycle. Older events paid per question.
const LESSON_REWARD = '#lesson';
const learnRewardKey = (skillId: string, questionId: string) =>
  JSON.stringify([skillId, questionId]);
const attemptLearnKey = (attempt: Attempt) =>
  learnRewardKey(
    attempt.skillId,
    attempt.outcome === 'lesson-passed' ? LESSON_REWARD : attempt.questionId,
  );
const reviewRewardKey = (attempt: Attempt) =>
  attempt.mode === 'review' && attempt.reviewDueAt !== undefined
    ? JSON.stringify([
        attempt.skillId,
        attempt.outcome === 'review-passed' ? '#review' : attempt.questionId,
        attempt.reviewDueAt,
      ])
    : null;

/** A saved state from an earlier schema: before quizzes, or before knowledge points. */
export type LegacyLearnerState = Omit<LearnerState, 'version' | 'progress'> & {
  version: 1 | 2 | 3 | 4;
  progress: Omit<Progress, 'version'> & { version: 1 | 2 | 3 | 4 };
};

/**
 * Bring a saved state to the current schema and catalog. Idempotent, so it
 * runs on every load and merge: a skill that gains knowledge points after an
 * account was saved still keeps its mastery.
 */
export function migrateState(
  state: LearnerState | LegacyLearnerState,
  catalog: GraphCatalog = defaultCatalog,
): LearnerState {
  const progress = normalizeProgress(
    state.progress.version === 5
      ? (state.progress as Progress)
      : { ...state.progress, version: 5 },
    catalog,
  );
  if (state.version === 5 && progress === state.progress)
    return state as LearnerState;
  return { ...state, version: 5, progress };
}

/** Converts legacy evidence for skills now taught through knowledge points. */
export function normalizeProgress(
  progress: Progress,
  catalog: GraphCatalog = defaultCatalog,
): Progress {
  let skills: Record<string, SkillProgress> | undefined;
  for (const skill of catalog.skills) {
    const state = progress.skills[skill.id];
    if (!state || !hasKnowledgePoints(skill)) continue;
    let next = state;
    // Mastered under the four-question lesson: every one of its questions
    // is evidence. Credit its points once; a later observation of a point
    // (pass or fail) has an evidence checkpoint and is left alone.
    const legacyMastered = legacyQuestionIds(skill).every((id) =>
      state.questionIds.includes(id),
    );
    const missing = legacyMastered
      ? lessonEvidenceIds(skill).filter(
          (id) =>
            !state.questionIds.includes(id) && !state.evidenceUpdates?.[id],
        )
      : [];
    if (missing.length) {
      const at = state.lastPracticedAt ?? 0;
      const questionIds = [...state.questionIds, ...missing];
      next = {
        ...next,
        questionIds,
        evidenceUpdates: {
          ...state.evidenceUpdates,
          ...Object.fromEntries(
            missing.map((id) => [
              id,
              { at, sequence: state.attempts, correct: true },
            ]),
          ),
        },
        mastery: masteryFraction(skill, questionIds),
      };
    }
    // A cycle's legacy choice answers no longer count toward its review.
    const reviewQuestionIds = next.reviewQuestionIds.filter(
      (id) => evidenceIdFor(skill, id) !== undefined,
    );
    if (reviewQuestionIds.length !== next.reviewQuestionIds.length)
      next = { ...next, reviewQuestionIds };
    if (next !== state) (skills ??= { ...progress.skills })[skill.id] = next;
  }
  return skills ? { ...progress, skills } : progress;
}

/** A demotion or confirmation outlasts the bare placement it ends. */
function mergePlacement(
  left?: Placement,
  right?: Placement,
): Placement | undefined {
  if (!left || !right) return left ?? right;
  const settled = (placement: Placement) =>
    placement.demotedAt ?? placement.confirmedAt ?? placement.at;
  if (left.at !== right.at) return right.at > left.at ? right : left;
  if (left.demotedAt !== undefined || right.demotedAt !== undefined)
    return (left.demotedAt ?? Infinity) <= (right.demotedAt ?? Infinity)
      ? left
      : right;
  return settled(right) > settled(left) ? right : left;
}

/** The more recent implicit credit; on a tie, the later due date. */
function latestCredit(
  left?: ImplicitCredit,
  right?: ImplicitCredit,
): ImplicitCredit | undefined {
  if (!left || !right) return left ?? right;
  return right.at > left.at ||
    (right.at === left.at && right.dueAt > left.dueAt)
    ? right
    : left;
}

/** One lesson attempt from two snapshots; any later failure discards it. */
function mergeLessonAttempt(
  a: SkillProgress,
  b: SkillProgress,
  lessonFailedAt: number | undefined,
): LessonAttempt | undefined {
  const valid = [a, b]
    .map((state) => currentLessonAttempt({ ...state, lessonFailedAt }))
    .filter((attempt): attempt is LessonAttempt => !!attempt);
  if (valid.length < 2) return valid[0];
  const [left, right] = valid;
  if (left.startedAt !== right.startedAt)
    return left.startedAt > right.startedAt ? left : right;
  const steps: LessonAttempt['steps'] = {};
  for (const id of new Set([
    ...Object.keys(left.steps),
    ...Object.keys(right.steps),
  ])) {
    const x = left.steps[id],
      y = right.steps[id];
    steps[id] = {
      correct: [...new Set([...(x?.correct ?? []), ...(y?.correct ?? [])])],
      incorrect: Math.max(x?.incorrect ?? 0, y?.incorrect ?? 0),
    };
  }
  return { startedAt: left.startedAt, steps };
}

/** Quiz XP is recorded on finished quizzes rather than on answers. */
function quizRewards(quizzes: Quiz[] = [], timeZone: string) {
  return quizzes
    .filter((quiz) => quiz.completedAt !== undefined && (quiz.earned ?? 0) > 0)
    .map((quiz) => ({
      day: dateKey(quiz.completedAt!, timeZone),
      xp: quiz.earned!,
    }));
}

function representedXp(progress: Progress) {
  const learnRewards = new Set<string>();
  const reviewRewards = new Set<string>();
  const daily: Record<string, number> = {};
  let total = 0;
  for (const attempt of [...progress.attempts].sort(
    (a, b) => a.at.localeCompare(b.at) || a.id.localeCompare(b.id),
  )) {
    if (attempt.xp <= 0 || !attempt.correct || attempt.usedHint) continue;
    if (attempt.mode === 'learn') {
      const key = attemptLearnKey(attempt);
      if (learnRewards.has(key)) continue;
      learnRewards.add(key);
    }
    const reviewKey = reviewRewardKey(attempt);
    if (reviewKey) {
      if (reviewRewards.has(reviewKey)) continue;
      reviewRewards.add(reviewKey);
    }
    const day = dateKey(attempt.at, progress.timeZone);
    daily[day] = (daily[day] ?? 0) + attempt.xp;
    total += attempt.xp;
  }
  for (const reward of quizRewards(progress.quizzes, progress.timeZone)) {
    daily[reward.day] = (daily[reward.day] ?? 0) + reward.xp;
    total += reward.xp;
  }
  const historicalLearnRewards = Object.entries(progress.skills).flatMap(
    ([id, skill]) =>
      [
        ...skill.rewardedQuestionIds,
        ...(skill.lessonRewarded ? [LESSON_REWARD] : []),
      ]
        .map((questionId) => learnRewardKey(id, questionId))
        .filter((key) => !learnRewards.has(key)),
  );
  return { daily, total, historicalLearnRewards };
}

function reconcileXp(
  local: Progress,
  remote: Progress,
  merged: Attempt[],
  timeZone: string,
  quizzes: Quiz[] = [],
) {
  const representedLocal = representedXp(local);
  const representedRemote = representedXp(remote);
  // Rewards absent from a truncated log already belong to its preserved historical totals.
  const historicalRewards = new Set([
    ...representedLocal.historicalLearnRewards,
    ...representedRemote.historicalLearnRewards,
  ]);
  const creditedLearnRewards = new Set<string>();
  const creditedReviewRewards = new Set<string>();
  const representedDaily: Record<string, number> = {};
  let representedTotal = 0;
  const attempts = merged.map((attempt) => {
    let xp = attempt.correct && !attempt.usedHint ? attempt.xp : 0;
    if (xp > 0 && attempt.mode === 'learn') {
      const key = attemptLearnKey(attempt);
      if (historicalRewards.has(key) || creditedLearnRewards.has(key)) xp = 0;
      else creditedLearnRewards.add(key);
    }
    const reviewKey = reviewRewardKey(attempt);
    if (xp > 0 && reviewKey) {
      if (creditedReviewRewards.has(reviewKey)) xp = 0;
      else creditedReviewRewards.add(reviewKey);
    }
    const day = dateKey(attempt.at, timeZone);
    representedDaily[day] = (representedDaily[day] ?? 0) + xp;
    representedTotal += xp;
    return xp === attempt.xp ? attempt : { ...attempt, xp };
  });
  // Each quiz pays once, however many devices recorded it.
  for (const reward of quizRewards(quizzes, timeZone)) {
    representedDaily[reward.day] =
      (representedDaily[reward.day] ?? 0) + reward.xp;
    representedTotal += reward.xp;
  }
  const days = new Set([
    ...Object.keys(local.dailyXp),
    ...Object.keys(remote.dailyXp),
    ...Object.keys(representedDaily),
  ]);
  const dailyXp = Object.fromEntries(
    [...days].map((day) => [
      day,
      (representedDaily[day] ?? 0) +
        Math.max(
          0,
          (local.dailyXp[day] ?? 0) - (representedLocal.daily[day] ?? 0),
          (remote.dailyXp[day] ?? 0) - (representedRemote.daily[day] ?? 0),
        ),
    ]),
  );
  const preservedHistory = Math.max(
    0,
    local.totalXp - representedLocal.total,
    remote.totalXp - representedRemote.total,
  );
  const totalXp = Math.max(
    local.totalXp,
    remote.totalXp,
    representedTotal + preservedHistory,
    Object.values(dailyXp).reduce((sum, xp) => sum + xp, 0),
  );
  return { attempts, dailyXp, totalXp };
}

/** Newer retrieval wins; simultaneous outcomes choose conservative, stable ties. */
function compareMemory(left: MemoryState, right: MemoryState): number {
  return (
    right.lastReviewAt - left.lastReviewAt ||
    right.lapses - left.lapses ||
    left.stability - right.stability ||
    right.difficulty - left.difficulty ||
    left.scheduledDays - right.scheduledDays ||
    left.dueAt - right.dueAt ||
    right.reps - left.reps ||
    right.elapsedDays - left.elapsedDays
  );
}

export function mergeStates(
  localState: LearnerState | LegacyLearnerState,
  remoteState: LearnerState | LegacyLearnerState,
  catalog: GraphCatalog = defaultCatalog,
): LearnerState {
  const local = migrateState(localState, catalog);
  const remote = migrateState(remoteState, catalog);
  const recent = local.updatedAt > remote.updatedAt ? local : remote;
  const skillById = Object.fromEntries(
    catalog.skills.map((skill) => [skill.id, skill]),
  );
  const attemptsById = new Map<string, Attempt>();
  for (const attempt of [
    ...remote.progress.attempts,
    ...local.progress.attempts,
  ])
    attemptsById.set(attempt.id, attempt);
  const quizzes = mergeQuizzes(local.progress.quizzes, remote.progress.quizzes);
  const diagnostics = mergeDiagnostics(
    local.progress.diagnostics,
    remote.progress.diagnostics,
  );
  const xp = reconcileXp(
    local.progress,
    remote.progress,
    [...attemptsById.values()].sort(
      (a, b) => a.at.localeCompare(b.at) || a.id.localeCompare(b.id),
    ),
    recent.progress.timeZone,
    quizzes,
  );
  const { attempts } = xp;
  const skillIds = new Set([
    ...Object.keys(local.progress.skills),
    ...Object.keys(remote.progress.skills),
  ]);
  const skills = Object.fromEntries(
    [...skillIds].map((id) => {
      const a = local.progress.skills[id],
        b = remote.progress.skills[id];
      if (!a || !b) return [id, a ?? b];
      const latest =
        (a.lastPracticedAt ?? 0) > (b.lastPracticedAt ?? 0) ? a : b;
      const history = attempts.filter((attempt) => attempt.skillId === id);
      const localHistory = local.progress.attempts.filter(
        (event) => event.skillId === id,
      );
      const remoteHistory = remote.progress.attempts.filter(
        (event) => event.skillId === id,
      );
      const activity =
        a.activity && b.activity
          ? mergeActivity(a.activity, b.activity)
          : (a.activity ?? b.activity);
      const counters = activity
        ? activityTotals(activity)
        : { attempts: 0, correct: 0 };
      const attemptCount = Math.max(
        a.attempts,
        b.attempts,
        history.length,
        counters.attempts,
      );
      const skillSnapshot = (
        progress: Progress,
        snapshot: typeof a,
        events: Attempt[],
      ): Progress => {
        // Quiz XP belongs to the learner, not to one skill.
        const represented = representedXp({
          ...progress,
          quizzes: undefined,
          attempts: events,
          skills: { [id]: snapshot },
        });
        return {
          ...progress,
          quizzes: undefined,
          attempts: events,
          skills: { [id]: snapshot },
          totalXp: snapshot.totalXp ?? represented.total,
          dailyXp: snapshot.dailyXp ?? represented.daily,
        };
      };
      const skillXp = reconcileXp(
        skillSnapshot(local.progress, a, localHistory),
        skillSnapshot(remote.progress, b, remoteHistory),
        history,
        recent.progress.timeZone,
      );
      const definition = skillById[id];
      // Answers give evidence for their lesson step. A knowledge point is
      // only proven by a completed lesson, whose checkpoints carry it.
      const pointLesson = !!definition && hasKnowledgePoints(definition);
      const evidenceOf = (questionId: string) =>
        (definition && evidenceIdFor(definition, questionId)) ?? questionId;
      const evidence = new Set([...a.questionIds, ...b.questionIds]);
      // Quiz answers are retrieval checks: a miss schedules a review, it
      // does not remove lesson evidence.
      for (const attempt of history) {
        if (attempt.mode === 'quiz') continue;
        if (!attempt.correct) evidence.delete(evidenceOf(attempt.questionId));
        else if (!pointLesson && !attempt.usedHint && attempt.mode === 'learn')
          evidence.add(attempt.questionId);
      }
      const evidenceUpdates: Record<string, EvidenceUpdate> = {};
      for (const source of [a.evidenceUpdates ?? {}, b.evidenceUpdates ?? {}]) {
        for (const [questionId, update] of Object.entries(source)) {
          const existing = evidenceUpdates[questionId];
          if (
            !existing ||
            update.at > existing.at ||
            (update.at === existing.at &&
              (update.sequence > existing.sequence ||
                (update.sequence === existing.sequence && !update.correct)))
          )
            evidenceUpdates[questionId] = update;
        }
      }
      for (const [questionId, update] of Object.entries(evidenceUpdates)) {
        const newer = history.findLast(
          (event) =>
            event.mode !== 'quiz' &&
            evidenceOf(event.questionId) === questionId &&
            Date.parse(event.at) > update.at &&
            (!event.correct ||
              (!pointLesson && !event.usedHint && event.mode === 'learn')),
        );
        const correct = newer ? newer.correct : update.correct;
        if (newer)
          evidenceUpdates[questionId] = {
            at: Date.parse(newer.at),
            sequence: attemptCount,
            correct,
          };
        if (correct) evidence.add(questionId);
        else evidence.delete(questionId);
      }
      const mastery = definition
        ? hasLessonEvidence(definition, [...evidence])
          ? 1
          : Math.min(0.99, masteryFraction(definition, [...evidence]))
        : latest.mastery;
      const newlyMastered = mastery === 1 && latest.mastery < 1;
      const lastPracticedAt =
        Math.max(a.lastPracticedAt ?? 0, b.lastPracticedAt ?? 0) || null;
      // Lesson reads can be newer than retrieval. Preserve the newest memory
      // event independently, rather than replacing it with an older snapshot.
      let memory =
        a.memory && b.memory
          ? compareMemory(a.memory, b.memory) <= 0
            ? a.memory
            : b.memory
          : (a.memory ?? b.memory);
      let dueAt = mastery < 1 ? null : latest.dueAt;
      let intervalDays = mastery < 1 ? 0 : latest.intervalDays;
      let reviewCount = Math.max(a.reviewCount, b.reviewCount);
      let reviewQuestionIds = mastery < 1 ? [] : latest.reviewQuestionIds;
      let reviewHadHint = mastery < 1 ? false : latest.reviewHadHint;
      if (
        mastery === 1 &&
        memory &&
        (!latest.memory || compareMemory(memory, latest.memory) < 0)
      ) {
        dueAt = memory.dueAt;
        intervalDays = memory.scheduledDays;
        reviewQuestionIds = [];
        reviewHadHint = false;
      }
      if (newlyMastered && lastPracticedAt !== null) {
        memory = acquisitionMemory(lastPracticedAt, memory);
        dueAt = memory.dueAt;
        intervalDays = 1;
        reviewQuestionIds = [];
        reviewHadHint = false;
      } else if (
        definition &&
        mastery === 1 &&
        a.dueAt !== null &&
        a.dueAt === b.dueAt &&
        a.reviewCount === b.reviewCount
      ) {
        // Two devices may supply different independent answers to the same
        // due cycle. Union that evidence and schedule it exactly once.
        reviewQuestionIds = [
          ...new Set([...a.reviewQuestionIds, ...b.reviewQuestionIds]),
        ];
        reviewHadHint = !!a.reviewHadHint || !!b.reviewHadHint;
        if (
          lastPracticedAt !== null &&
          lastPracticedAt >= a.dueAt &&
          reviewCycleComplete(definition, reviewQuestionIds)
        ) {
          memory = reviewMemory(
            legacyMemory({ ...latest, memory }, lastPracticedAt),
            lastPracticedAt,
            reviewHadHint ? 'hard' : 'pass',
          );
          dueAt = memory.dueAt;
          intervalDays = memory.scheduledDays;
          reviewCount += 1;
          reviewQuestionIds = [];
          reviewHadHint = false;
        }
      }
      // Implicit credit from either device applies while no real review has
      // happened since; a lapse or a later review supersedes it.
      const implicitCredit = latestCredit(a.implicitCredit, b.implicitCredit);
      if (
        mastery === 1 &&
        implicitCredit &&
        memory &&
        implicitCredit.basis === memory.lastReviewAt &&
        // Direct practice since the credit (a review, a lesson, a quiz
        // miss) decides the due date instead.
        implicitCredit.at >= (lastPracticedAt ?? 0) &&
        dueAt !== null &&
        implicitCredit.dueAt > dueAt &&
        reviewQuestionIds.length === 0
      )
        dueAt = implicitCredit.dueAt;
      let consecutiveCorrect = 0;
      for (const attempt of [...history].reverse()) {
        if (!attempt.correct || attempt.usedHint) break;
        consecutiveCorrect += 1;
      }
      const lessonFailedAt =
        a.lessonFailedAt === undefined && b.lessonFailedAt === undefined
          ? undefined
          : Math.max(a.lessonFailedAt ?? 0, b.lessonFailedAt ?? 0);
      const lessonAttempt =
        mastery === 1 ? undefined : mergeLessonAttempt(a, b, lessonFailedAt);
      const {
        lessonAttempt: _attempt,
        implicitCredit: _credit,
        placement: _placement,
        ...rest
      } = latest;
      const placement = mergePlacement(a.placement, b.placement);
      return [
        id,
        {
          ...rest,
          ...(placement ? { placement } : {}),
          ...(implicitCredit ? { implicitCredit } : {}),
          ...(lessonAttempt ? { lessonAttempt } : {}),
          ...(lessonFailedAt !== undefined ? { lessonFailedAt } : {}),
          ...(a.lessonRewarded || b.lessonRewarded
            ? { lessonRewarded: true }
            : {}),
          lessonSeen: a.lessonSeen || b.lessonSeen,
          attempts: attemptCount,
          correct: Math.min(
            attemptCount,
            Math.max(
              a.correct,
              b.correct,
              history.filter((attempt) => attempt.correct).length,
              counters.correct,
            ),
          ),
          consecutiveCorrect: history.length
            ? consecutiveCorrect
            : latest.consecutiveCorrect,
          questionIds: [...evidence],
          ...(Object.keys(evidenceUpdates).length ? { evidenceUpdates } : {}),
          ...(a.totalXp !== undefined || b.totalXp !== undefined
            ? { totalXp: skillXp.totalXp, dailyXp: skillXp.dailyXp }
            : {}),
          mastery,
          lastPracticedAt,
          ...(activity ? { activity } : {}),
          reviewCount,
          intervalDays,
          dueAt,
          reviewQuestionIds,
          ...(memory ? { memory } : {}),
          ...(reviewHadHint !== undefined ? { reviewHadHint } : {}),
          // A later failure can remove mastery evidence, but must not erase awarded XP.
          rewardedQuestionIds: [
            ...new Set([...a.rewardedQuestionIds, ...b.rewardedQuestionIds]),
          ],
          learnedAt:
            a.learnedAt && b.learnedAt
              ? a.learnedAt < b.learnedAt
                ? a.learnedAt
                : b.learnedAt
              : (a.learnedAt ??
                b.learnedAt ??
                (newlyMastered && lastPracticedAt !== null
                  ? new Date(lastPracticedAt).toISOString()
                  : null)),
        },
      ];
    }),
  );
  const cards = new Map<string, QueuedCard>();
  for (const source of [remote, local]) {
    for (const sourceCard of source.cards) {
      // Anki note IDs belong to the profile that supplied them.
      const {
        noteId: _noteId,
        lastError: _lastError,
        ...pendingCard
      } = sourceCard;
      const card: QueuedCard =
        source.anki.profile === recent.anki.profile
          ? sourceCard
          : { ...pendingCard, status: 'pending' };
      const existing = cards.get(card.id);
      cards.set(card.id, existing?.status === 'synced' ? existing : card);
    }
  }
  const lastActivityDate =
    [local.progress.lastActivityDate, remote.progress.lastActivityDate]
      .filter((day): day is string => day !== null)
      .sort()
      .at(-1) ?? null;
  const activitySource =
    local.progress.lastActivityDate === lastActivityDate &&
    remote.progress.lastActivityDate !== lastActivityDate
      ? local
      : remote;
  // Reconciliation itself can complete mastery when devices supplied
  // different answers. Cards need the skill's text: skills whose content is
  // not loaded are queued once it is (see missingMasteryCards).
  return queueMasteryCards(
    {
      ...recent,
      progress: {
        ...recent.progress,
        skills,
        ...xp,
        ...(quizzes.length ? { quizzes } : {}),
        ...(diagnostics.length ? { diagnostics } : {}),
        attempts: xp.attempts.slice(-MAX_RECENT_ATTEMPTS),
        lastActivityDate,
        streak: activitySource.progress.streak,
      },
      cards: [...cards.values()],
      createdAt: Math.min(local.createdAt, remote.createdAt),
      updatedAt: Math.max(local.updatedAt, remote.updatedAt),
    },
    catalog,
  );
}

/** Mastered skills whose mastery cards are not all queued yet. */
export function missingMasteryCards(
  state: LearnerState,
  catalog: GraphCatalog = defaultCatalog,
): SkillOutline[] {
  const queued = new Set(state.cards.map((card) => card.id));
  return catalog.skills.filter((skill) => {
    const progress = state.progress.skills[skill.id];
    return (
      !!progress &&
      // Placement earns no cards, even once its first review confirms it.
      (!progress.placement || progress.placement.demotedAt !== undefined) &&
      skill.flashcards.some((card) => !queued.has(card.id)) &&
      hasLessonEvidence(skill, progress.questionIds)
    );
  });
}

/**
 * Queue the mastery cards of every mastered skill whose content is loaded.
 * Returns the same state when nothing is added.
 */
export function queueMasteryCards(
  state: LearnerState,
  catalog: GraphCatalog = defaultCatalog,
): LearnerState {
  const added: QueuedCard[] = [];
  for (const outline of missingMasteryCards(state, catalog)) {
    const skill = contentOf(outline);
    if (!skill) continue;
    const queued = new Set(state.cards.map((card) => card.id));
    for (const card of skill.flashcards)
      if (!queued.has(card.id))
        added.push({
          ...card,
          skillName: skill.title,
          kind: 'mastery',
          status: 'pending',
        });
  }
  return added.length ? { ...state, cards: [...state.cards, ...added] } : state;
}
