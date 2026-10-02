import {
  applyAttempt,
  dateKey,
  emptyProgress,
  isMastered,
  MAX_RECENT_ATTEMPTS,
  type EvidenceUpdate,
  type Attempt,
  type AttemptInput,
  type Progress,
} from './learning';
import {
  assessmentPolicy,
  defaultCatalog,
  type CurriculumCatalog,
} from './curriculum';
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
export interface LearnerState {
  version: 1;
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
    version: 1,
    progress: emptyProgress(),
    dailyGoal: 50,
    activeCourseId: 'python-foundations',
    cards: [],
    anki: { connected: false, profile: null, deck: 'lessdumb::Learning' },
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

/** Record an answer against the current state without replacing concurrent work. */
export function recordLearningAnswer(
  state: LearnerState,
  input: AttemptInput,
): LearnerState {
  const progress = applyAttempt(state.progress, input);
  // A stable attempt identity can be replayed by a state updater or save retry.
  if (progress === state.progress) return state;
  const skill = defaultCatalog.skills.find(
    (candidate) => candidate.id === input.skillId,
  )!;
  const question = skill.questions.find(
    (candidate) => candidate.id === input.questionId,
  )!;
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
      front: `${question.prompt}${question.type === 'choice' && question.code ? `\n\n${question.code}` : ''}`,
      back:
        question.type === 'choice'
          ? `${question.choices[question.answer]}\n\n${question.explanation}`
          : `${question.solution}\n\n${question.explanation}`,
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

const learnRewardKey = (skillId: string, questionId: string) =>
  JSON.stringify([skillId, questionId]);
const reviewRewardKey = (attempt: Attempt) =>
  attempt.mode === 'review' && attempt.reviewDueAt !== undefined
    ? JSON.stringify([attempt.skillId, attempt.questionId, attempt.reviewDueAt])
    : null;

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
      const key = learnRewardKey(attempt.skillId, attempt.questionId);
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
  const historicalLearnRewards = Object.entries(progress.skills).flatMap(
    ([id, skill]) =>
      skill.rewardedQuestionIds
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
      const key = learnRewardKey(attempt.skillId, attempt.questionId);
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
  local: LearnerState,
  remote: LearnerState,
  catalog: CurriculumCatalog = defaultCatalog,
): LearnerState {
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
  const xp = reconcileXp(
    local.progress,
    remote.progress,
    [...attemptsById.values()].sort(
      (a, b) => a.at.localeCompare(b.at) || a.id.localeCompare(b.id),
    ),
    recent.progress.timeZone,
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
        const represented = representedXp({
          ...progress,
          attempts: events,
          skills: { [id]: snapshot },
        });
        return {
          ...progress,
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
      const evidence = new Set([...a.questionIds, ...b.questionIds]);
      for (const attempt of history) {
        if (!attempt.correct) evidence.delete(attempt.questionId);
        else if (!attempt.usedHint && attempt.mode === 'learn')
          evidence.add(attempt.questionId);
      }
      const definition = skillById[id];
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
            event.questionId === questionId &&
            Date.parse(event.at) > update.at &&
            (!event.correct || (!event.usedHint && event.mode === 'learn')),
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
        ? definition.questions.filter((question) => evidence.has(question.id))
            .length / definition.questions.length
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
        const policy = assessmentPolicy(definition);
        if (
          lastPracticedAt !== null &&
          lastPracticedAt >= a.dueAt &&
          reviewQuestionIds.length >= policy.reviewAnswers &&
          policy.requiredTypes.every((type) =>
            reviewQuestionIds.some(
              (id) =>
                definition.questions.find((q) => q.id === id)?.type === type,
            ),
          )
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
      let consecutiveCorrect = 0;
      for (const attempt of [...history].reverse()) {
        if (!attempt.correct || attempt.usedHint) break;
        consecutiveCorrect += 1;
      }
      return [
        id,
        {
          ...latest,
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
  // Reconciliation itself can complete mastery when devices supplied different answers.
  for (const [id, progress] of Object.entries(skills)) {
    const definition = skillById[id];
    if (
      definition &&
      definition.questions.every((question) =>
        progress.questionIds.includes(question.id),
      )
    ) {
      for (const card of definition.flashcards) {
        if (!cards.has(card.id))
          cards.set(card.id, {
            ...card,
            skillName: definition.title,
            kind: 'mastery',
            status: 'pending',
          });
      }
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
  return {
    ...recent,
    progress: {
      ...recent.progress,
      skills,
      ...xp,
      attempts: xp.attempts.slice(-MAX_RECENT_ATTEMPTS),
      lastActivityDate,
      streak: activitySource.progress.streak,
    },
    cards: [...cards.values()],
    createdAt: Math.min(local.createdAt, remote.createdAt),
    updatedAt: Math.max(local.updatedAt, remote.updatedAt),
  };
}
