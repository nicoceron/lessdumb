import type {
  AnswerQuestion,
  GraphCatalog,
  Question,
  Skill,
  SkillOutline,
} from './curriculum';
import { defaultCatalog } from './catalog-index';
import { contentOf } from './content';
import { estimateCompletion, type CompletionEstimate } from './dashboard';
import {
  chooseVariant,
  coursePath,
  DAY_MS,
  getSkillState,
  isMastered,
  isUnlocked,
  type Progress,
  type SkillProgress,
} from './learning';
import { lessonSteps } from './lesson-plan';
import { acquisitionMemory } from './retention';
import { gradeAnswer } from './typed-answer';
import { questionVariant } from './variants';

// An adaptive placement diagnostic. It is a transparent heuristic, not Math
// Academy's calibrated model: each skill on the course path has a probability
// that the learner already knows it. An answer updates the tested skill by
// Bayes' rule with fixed slip and guess rates; because an edge means "uses",
// a correct answer also raises the skill's ancestors and a wrong one lowers
// its descendants, more weakly with each hop. The next question goes to the
// uncertain skill that best splits the uncertain region of the graph.

/** At most this many questions. */
export const DIAGNOSTIC_MAX_QUESTIONS = 48;
/** At most this many questions on one skill. */
const QUESTIONS_PER_SKILL = 2;
/** Probability a learner who knows a skill still answers wrongly. */
const SLIP = 0.1;
/** Each hop through the graph keeps this share of an answer's evidence. */
const HOP = 0.85;
/** Classified as known at or above, and as not known at or below. */
export const KNOWN = 0.85;
export const UNKNOWN = 0.15;
/** Correct answers slower than this count as half the evidence. */
export const SLOW_ANSWER_MS = 60_000;
/**
 * Chance of typing a correct answer without knowing the skill. Far below a
 * four-way choice, but not zero: some outputs are a guessable True or 0.
 */
export const TYPED_GUESS = 0.1;
/** Placed skills' first reviews spread over at most this many days. */
const MAX_REVIEW_SPREAD_DAYS = 14;
const REVIEWS_PER_DAY = 8;
const MAX_SAVED_DIAGNOSTICS = 10;

export interface DiagnosticQuestion {
  skillId: string;
  questionId: string;
  /** Seeds the shuffled choice order. */
  presentation: number;
  /** The variant number asked, for a generated question (see variants.ts). */
  variant?: number;
}

export interface DiagnosticAnswer extends DiagnosticQuestion {
  /** The authored choice index, or the text typed for a typed question. */
  answer: number | string;
  correct: boolean;
  at: number;
  /** Time from showing the question to submitting it, measured by the page. */
  elapsedMs?: number;
}

export interface Diagnostic {
  id: string;
  courseId: string;
  startedAt: number;
  answers: DiagnosticAnswer[];
  /** The question on screen, so an interrupted test resumes on it. */
  current?: DiagnosticQuestion;
  completedAt?: number;
  /** Skills placed out of when the test ended. */
  placed?: string[];
}

type Now = Date | number;
const time = (now: Now) => (now instanceof Date ? now.getTime() : now);

interface PathModel {
  skills: SkillOutline[];
  byId: Map<string, SkillOutline>;
  /** Ancestors and descendants within the path, with hop distance. */
  ancestors: Map<string, Map<string, number>>;
  descendants: Map<string, Map<string, number>>;
}

const models = new WeakMap<GraphCatalog, Map<string, PathModel>>();

function pathModel(courseId: string, catalog: GraphCatalog): PathModel {
  let perCatalog = models.get(catalog);
  if (!perCatalog) models.set(catalog, (perCatalog = new Map()));
  const cached = perCatalog.get(courseId);
  if (cached) return cached;
  const skills = coursePath(courseId, catalog);
  const byId = new Map(skills.map((skill) => [skill.id, skill]));
  const ancestors = new Map<string, Map<string, number>>();
  const ancestorsOf = (id: string): Map<string, number> => {
    const known = ancestors.get(id);
    if (known) return known;
    const result = new Map<string, number>();
    for (const parent of byId.get(id)?.prerequisites ?? []) {
      if (!byId.has(parent)) continue;
      result.set(parent, 1);
      for (const [ancestor, hops] of ancestorsOf(parent))
        result.set(
          ancestor,
          Math.min(result.get(ancestor) ?? Infinity, hops + 1),
        );
    }
    ancestors.set(id, result);
    return result;
  };
  const descendants = new Map<string, Map<string, number>>(
    skills.map((skill) => [skill.id, new Map()]),
  );
  for (const skill of skills)
    for (const [ancestor, hops] of ancestorsOf(skill.id))
      descendants.get(ancestor)!.set(skill.id, hops);
  const model = { skills, byId, ancestors, descendants };
  perCatalog.set(courseId, model);
  return model;
}

/** Chosen and typed questions from a skill's knowledge points; no code editor. */
function answerQuestions(skill: SkillOutline) {
  return (skill.knowledgePoints ?? []).flatMap((point) =>
    point.questions.filter((question) => question.type !== 'code'),
  );
}

/**
 * The guessing rate of a question: one over its number of choices, or
 * TYPED_GUESS for a typed question. The placement session loads every course
 * on the path first, so the content is available.
 */
function guessRate(skill: SkillOutline, questionId?: string): number {
  const questions = (contentOf(skill)?.knowledgePoints ?? []).flatMap(
    (point) => point.questions,
  );
  const question: Question | undefined = questionId
    ? questions.find((item) => item.id === questionId)
    : questions.find((item) => item.type !== 'code');
  if (question?.type === 'numeric' || question?.type === 'text')
    return TYPED_GUESS;
  return 1 / (question?.type === 'choice' ? question.choices.length : 4);
}

/**
 * The question a placement slot asks, with its content. Undefined for an
 * unknown question or while its skill's course is not loaded.
 */
export function diagnosticQuestion(
  slot: Pick<DiagnosticQuestion, 'skillId' | 'questionId' | 'variant'>,
  catalog: GraphCatalog = defaultCatalog,
): { skill: Skill; question: AnswerQuestion } | undefined {
  const outline = catalog.skills.find((item) => item.id === slot.skillId);
  const skill = outline && contentOf(outline);
  const question = skill?.knowledgePoints
    ?.flatMap((point) => point.questions)
    .find((item) => item.id === slot.questionId);
  return skill && question && question.type !== 'code'
    ? { skill, question: questionVariant(question, slot.variant) }
    : undefined;
}

const odds = (p: number) => p / (1 - p);
const probability = (o: number) => o / (1 + o);
const clamp = (p: number) => Math.min(0.999, Math.max(0.001, p));

/**
 * Each path skill's probability of being known after these answers. Skills
 * with real mastery evidence start at certainty; others at even odds.
 */
export function beliefs(
  progress: Progress,
  diagnostic: Pick<Diagnostic, 'courseId' | 'answers'>,
  catalog: GraphCatalog = defaultCatalog,
): Map<string, number> {
  const model = pathModel(diagnostic.courseId, catalog);
  const belief = new Map<string, number>();
  for (const skill of model.skills)
    belief.set(skill.id, isMastered(progress, skill.id, catalog) ? 0.999 : 0.5);
  const update = (id: string, ratio: number) => {
    if (isMastered(progress, id, catalog)) return;
    belief.set(id, clamp(probability(odds(belief.get(id)!) * ratio)));
  };
  for (const answer of diagnostic.answers) {
    const skill = model.byId.get(answer.skillId);
    if (!skill) continue;
    const guess = guessRate(skill, answer.questionId);
    // Likelihood ratio of "known" against "not known" for this answer.
    let ratio = answer.correct ? (1 - SLIP) / guess : SLIP / (1 - guess);
    if (answer.correct && (answer.elapsedMs ?? 0) > SLOW_ANSWER_MS)
      ratio = Math.sqrt(ratio);
    update(skill.id, ratio);
    const related = answer.correct
      ? model.ancestors.get(skill.id)!
      : model.descendants.get(skill.id)!;
    for (const [id, hops] of related) update(id, ratio ** (HOP ** hops));
  }
  return belief;
}

const uncertain = (p: number) => p > UNKNOWN && p < KNOWN;

/**
 * The next question, or null when the test should stop: every skill is
 * classified, the question cap is reached, or nothing uncertain can be asked.
 * The chosen skill is the one whose answer is expected to settle the most
 * uncertain skills (weighing a correct and a wrong answer by their chance);
 * ties go to the skill that splits the uncertain region most evenly.
 */
export function nextDiagnosticQuestion(
  progress: Progress,
  diagnostic: Pick<Diagnostic, 'courseId' | 'answers'>,
  catalog: GraphCatalog = defaultCatalog,
): DiagnosticQuestion | null {
  if (diagnostic.answers.length >= DIAGNOSTIC_MAX_QUESTIONS) return null;
  const model = pathModel(diagnostic.courseId, catalog);
  const belief = beliefs(progress, diagnostic, catalog);
  const asked = new Map<string, number>();
  const used = new Set<string>();
  for (const answer of diagnostic.answers) {
    asked.set(answer.skillId, (asked.get(answer.skillId) ?? 0) + 1);
    used.add(answer.questionId);
  }
  const candidates = model.skills.filter(
    (skill) =>
      uncertain(belief.get(skill.id)!) &&
      (asked.get(skill.id) ?? 0) < QUESTIONS_PER_SKILL &&
      answerQuestions(skill).some((question) => !used.has(question.id)),
  );
  if (!candidates.length) return null;
  const fixed = (id: string) => isMastered(progress, id, catalog);
  // Skills an answer would newly classify, if it were correct or wrong.
  const classified = (skill: SkillOutline, correct: boolean) => {
    const guess = guessRate(skill);
    const ratio = correct ? (1 - SLIP) / guess : SLIP / (1 - guess);
    const related = correct
      ? model.ancestors.get(skill.id)!
      : model.descendants.get(skill.id)!;
    let count = 0;
    for (const [id, hops] of [[skill.id, 0] as const, ...related]) {
      const p = belief.get(id)!;
      if (fixed(id) || !uncertain(p)) continue;
      if (!uncertain(clamp(probability(odds(p) * ratio ** (HOP ** hops)))))
        count++;
    }
    return count;
  };
  // Expected number of skills one answer settles, by its chance of being right.
  const gain = new Map(
    candidates.map((skill) => {
      const p = belief.get(skill.id)!;
      const guess = guessRate(skill);
      const right = p * (1 - SLIP) + (1 - p) * guess;
      return [
        skill.id,
        right * classified(skill, true) +
          (1 - right) * classified(skill, false),
      ];
    }),
  );
  const split = (skill: SkillOutline) => {
    const count = (related: Map<string, number>) =>
      [...related.keys()].filter((id) => uncertain(belief.get(id)!)).length;
    return Math.min(
      count(model.ancestors.get(skill.id)!),
      count(model.descendants.get(skill.id)!),
    );
  };
  const best = [...candidates].sort(
    (a, b) =>
      gain.get(b.id)! - gain.get(a.id)! ||
      split(b) - split(a) ||
      Math.abs(belief.get(a.id)! - 0.5) - Math.abs(belief.get(b.id)! - 0.5) ||
      a.order - b.order,
  )[0];
  const question = answerQuestions(best).find((item) => !used.has(item.id))!;
  const variant = chooseVariant(progress, best, question.id);
  return {
    skillId: best.id,
    questionId: question.id,
    presentation: diagnostic.answers.length,
    ...(variant !== undefined ? { variant } : {}),
  };
}

export function activeDiagnostic(progress: Progress): Diagnostic | undefined {
  return (progress.diagnostics ?? []).findLast(
    (diagnostic) => diagnostic.completedAt === undefined,
  );
}

function replace(progress: Progress, diagnostic: Diagnostic): Diagnostic[] {
  const list = progress.diagnostics ?? [];
  return list.some((item) => item.id === diagnostic.id)
    ? list.map((item) => (item.id === diagnostic.id ? diagnostic : item))
    : [...list, diagnostic].slice(-MAX_SAVED_DIAGNOSTICS);
}

/** Start (or resume) a placement test for a course. */
export function startDiagnostic(
  progress: Progress,
  courseId: string,
  now: Now = Date.now(),
  catalog: GraphCatalog = defaultCatalog,
): Progress {
  const active = activeDiagnostic(progress);
  if (active?.courseId === courseId) return progress;
  const at = time(now);
  const diagnostic: Diagnostic = {
    id: `diagnostic-${courseId}-${at}`,
    courseId,
    startedAt: at,
    answers: [],
  };
  // Starting another course's test ends the unfinished one without placing.
  const base: Progress = active
    ? {
        ...progress,
        diagnostics: replace(progress, {
          ...active,
          current: undefined,
          completedAt: at,
          placed: [],
        }),
      }
    : progress;
  const first = nextDiagnosticQuestion(base, diagnostic, catalog);
  if (!first)
    return finishDiagnostic(
      { ...base, diagnostics: replace(base, diagnostic) },
      diagnostic.id,
      at,
      catalog,
    );
  return {
    ...base,
    diagnostics: replace(base, { ...diagnostic, current: first }),
  };
}

/**
 * Record the answer to the current question (a choice index, or the text
 * typed for a typed question), then ask the next or finish. A typed response
 * that cannot be graded is rejected rather than counted wrong.
 */
export function answerDiagnostic(
  progress: Progress,
  diagnosticId: string,
  answer: number | string,
  now: Now = Date.now(),
  elapsedMs?: number,
  catalog: GraphCatalog = defaultCatalog,
): Progress {
  const diagnostic = progress.diagnostics?.find(
    (item) => item.id === diagnosticId,
  );
  if (!diagnostic?.current || diagnostic.completedAt !== undefined)
    return progress;
  const found = diagnosticQuestion(diagnostic.current, catalog);
  if (!found) throw new Error('This placement question is not in the catalog.');
  const correct = gradeAnswer(found.question, answer);
  const at = time(now);
  const answered: Diagnostic = {
    ...diagnostic,
    current: undefined,
    answers: [
      ...diagnostic.answers,
      {
        ...diagnostic.current,
        answer,
        correct,
        at,
        ...(elapsedMs !== undefined &&
        Number.isFinite(elapsedMs) &&
        elapsedMs >= 0
          ? { elapsedMs: Math.round(elapsedMs) }
          : {}),
      },
    ],
  };
  const next = nextDiagnosticQuestion(progress, answered, catalog);
  const updated = {
    ...progress,
    diagnostics: replace(progress, {
      ...answered,
      ...(next ? { current: next } : {}),
    }),
  };
  return next ? updated : finishDiagnostic(updated, diagnosticId, at, catalog);
}

/**
 * Skills to place out of: classified as known, not already mastered, with no
 * earlier real answers (real evidence wins), and whose every path ancestor is
 * mastered or placed too.
 */
export function placementsFor(
  progress: Progress,
  diagnostic: Pick<Diagnostic, 'courseId' | 'answers'>,
  catalog: GraphCatalog = defaultCatalog,
): SkillOutline[] {
  const model = pathModel(diagnostic.courseId, catalog);
  const belief = beliefs(progress, diagnostic, catalog);
  const placed = new Set<string>();
  const ready = (id: string) =>
    isMastered(progress, id, catalog) || placed.has(id);
  // Path order puts every prerequisite before its dependents.
  for (const skill of [...model.skills].sort(
    (a, b) => model.ancestors.get(a.id)!.size - model.ancestors.get(b.id)!.size,
  )) {
    const state = progress.skills[skill.id];
    if (
      belief.get(skill.id)! >= KNOWN &&
      !isMastered(progress, skill.id, catalog) &&
      (!state || (state.attempts === 0 && !state.lessonSeen)) &&
      lessonSteps(skill).length > 0 &&
      skill.prerequisites.every((id) => ready(id))
    )
      placed.add(skill.id);
  }
  return model.skills.filter((skill) => placed.has(skill.id));
}

/**
 * End the test and place the learner. Placed skills count as mastered for
 * unlocking with no XP or cards. Their first reviews spread over the coming
 * days, the most advanced first; failing one returns the skill to learning.
 */
export function finishDiagnostic(
  progress: Progress,
  diagnosticId: string,
  now: Now = Date.now(),
  catalog: GraphCatalog = defaultCatalog,
): Progress {
  const diagnostic = progress.diagnostics?.find(
    (item) => item.id === diagnosticId,
  );
  if (!diagnostic || diagnostic.completedAt !== undefined) return progress;
  const at = time(now);
  const model = pathModel(diagnostic.courseId, catalog);
  const placed = placementsFor(progress, diagnostic, catalog).sort(
    (a, b) =>
      model.descendants.get(a.id)!.size - model.descendants.get(b.id)!.size ||
      b.order - a.order,
  );
  const spread = Math.min(
    MAX_REVIEW_SPREAD_DAYS,
    Math.max(1, Math.ceil(placed.length / REVIEWS_PER_DAY)),
  );
  const skills = { ...progress.skills };
  placed.forEach((skill, index) => {
    const days = 1 + Math.floor((index * spread) / placed.length);
    const old = getSkillState(progress, skill.id);
    const evidence = lessonSteps(skill).map((step) => step.id);
    const memory = {
      ...acquisitionMemory(at),
      dueAt: at + days * DAY_MS,
      scheduledDays: days,
    };
    const state: SkillProgress = {
      ...old,
      questionIds: [...new Set([...old.questionIds, ...evidence])],
      evidenceUpdates: {
        ...old.evidenceUpdates,
        ...Object.fromEntries(
          evidence.map((id) => [
            id,
            { at, sequence: old.attempts, correct: true },
          ]),
        ),
      },
      mastery: 1,
      memory,
      intervalDays: days,
      dueAt: memory.dueAt,
      reviewQuestionIds: [],
      learnedAt: old.learnedAt ?? new Date(at).toISOString(),
      lastPracticedAt: at,
      placement: { at, diagnosticId },
    };
    skills[skill.id] = state;
  });
  return {
    ...progress,
    skills,
    diagnostics: replace(progress, {
      ...diagnostic,
      current: undefined,
      completedAt: at,
      placed: placed.map((skill) => skill.id),
    }),
  };
}

/** One diagnostic from two devices: a finished copy wins, then more answers. */
export function mergeDiagnostics(
  left: Diagnostic[] = [],
  right: Diagnostic[] = [],
): Diagnostic[] {
  const byId = new Map<string, Diagnostic>();
  for (const diagnostic of [...left, ...right]) {
    const existing = byId.get(diagnostic.id);
    if (!existing) byId.set(diagnostic.id, diagnostic);
    else if (
      (existing.completedAt !== undefined) !==
      (diagnostic.completedAt !== undefined)
    )
      byId.set(
        diagnostic.id,
        existing.completedAt !== undefined ? existing : diagnostic,
      );
    else if (diagnostic.answers.length > existing.answers.length)
      byId.set(diagnostic.id, diagnostic);
  }
  return [...byId.values()]
    .sort((a, b) => a.startedAt - b.startedAt || a.id.localeCompare(b.id))
    .slice(-MAX_SAVED_DIAGNOSTICS);
}

/** Share of the path already classified, for the progress indicator. */
export function diagnosticProgress(
  progress: Progress,
  diagnostic: Pick<Diagnostic, 'courseId' | 'answers'>,
  catalog: GraphCatalog = defaultCatalog,
): number {
  const belief = beliefs(progress, diagnostic, catalog);
  const values = [...belief.values()];
  return values.length
    ? values.filter((p) => !uncertain(p)).length / values.length
    : 1;
}

export interface PlacementReport {
  placed: SkillOutline[];
  /** Ready-to-learn skills on the path: where learning starts. */
  frontier: SkillOutline[];
  /** Unmastered path skills from other courses that the course builds on. */
  supporting: SkillOutline[];
  estimate: CompletionEstimate;
}

/** What a finished diagnostic found, and where learning goes next. */
export function placementReport(
  progress: Progress,
  diagnostic: Diagnostic,
  dailyGoal: number,
  now: Now = Date.now(),
  catalog: GraphCatalog = defaultCatalog,
): PlacementReport {
  const model = pathModel(diagnostic.courseId, catalog);
  const placed = new Set(diagnostic.placed ?? []);
  const open = model.skills.filter(
    (skill) => !isMastered(progress, skill.id, catalog),
  );
  const courseFirst = (a: SkillOutline, b: SkillOutline) =>
    Number(b.courseId === diagnostic.courseId) -
      Number(a.courseId === diagnostic.courseId) || a.order - b.order;
  return {
    placed: model.skills.filter((skill) => placed.has(skill.id)),
    frontier: open
      .filter((skill) => isUnlocked(progress, skill.id, catalog))
      .sort(courseFirst),
    supporting: open.filter((skill) => skill.courseId !== diagnostic.courseId),
    estimate: estimateCompletion(
      progress,
      dailyGoal,
      diagnostic.courseId,
      now,
      catalog,
    ),
  };
}
