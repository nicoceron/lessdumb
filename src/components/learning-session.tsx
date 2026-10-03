import {
  useEffect,
  useRef,
  useState,
  lazy,
  Suspense,
  type ReactNode,
} from 'react';
import {
  ArrowRight,
  Check,
  CheckCircle2,
  CircleX,
  Code2,
  Lightbulb,
  LoaderCircle,
  LockKeyhole,
  Play,
  X,
  Zap,
} from 'lucide-react';
import { ChoiceText, InlineText } from './inline-text';
import { TypedAnswerInput, TypedAnswerResult } from './typed-answer';
import type {
  CodeLanguage,
  KnowledgePoint,
  LessonExample,
  Question,
  Skill,
} from '../lib/curriculum';
import { courses, skills, skillById, units } from '../lib/catalog-index';
import { loadedSkill, loadSkill } from '../lib/content';
import { useSkillContent } from './use-content';
import {
  getSkillState,
  isMastered,
  isUnlocked,
  lessonState,
  nextTask,
  selectQuestion,
  type Attempt,
  type LessonStepProgress,
  type LessonStepStatus,
  type Progress,
} from '../lib/learning';
import {
  evidenceIdFor,
  findQuestion,
  hasKnowledgePoints,
  lessonSteps,
  POINT_PASS_CORRECT,
  reviewProgress,
  reviewRequirement,
  stepFor,
  type LessonStep,
} from '../lib/lesson-plan';
import { choiceLetter, choiceOrder } from '../lib/choice-order';
import { gradeTyped, isTyped } from '../lib/typed-answer';
import { questionVariant } from '../lib/variants';
import { type PythonResult } from '../lib/python';
import { runCode } from '../lib/code-runner';
import { codeLanguage, codeLanguageLabels } from '../lib/code-language';
import { recordLearningAnswer, type LearnerState } from '../lib/state';
import { Btn, ContentLoading } from './shared';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import {
  CodeBlock,
  CodeBlockHeader,
  CodeBlockTitle,
  CodeBlockCopyButton,
} from '@/components/reui/code-block/code-block';
// CodeMirror and its grammar download only once the exercise is on screen.
const CodeEditor = lazy(() => import('./code-editor'));

type Mode = 'learn' | 'review';

// A lesson is one page that grows downward, as in Math Academy: the skill's
// introduction, then for each knowledge point reached its explanation, worked
// example, and questions, then the code exercise. Answered questions stay on
// the page; Continue appends the next question or the next point below.
// Reviews stack their questions the same way, without lesson material.

/** One question on the page. Answered ones stay, frozen, above the live one. */
interface Entry {
  key: string;
  skillId: string;
  mode: Mode;
  questionId: string;
  /** The lesson step (knowledge point or code exercise) it gives evidence for. */
  stepId: string;
  /** Its position among this attempt's answers on the step, from 1. */
  number: number;
  /** How often it had been answered when shown; it fixes the choice order. */
  presentation: number;
  /** The seed of the variant shown, for a generated question. */
  variant?: number;
  /** The authored index of the selected choice, whatever position it shows at. */
  selected: number | null;
  /** What the learner typed, for a numeric or text question. */
  response: string;
  /** Why the typed response could not be graded; it is not a miss. */
  invalid: string | null;
  code: string;
  output: PythonResult | null;
  feedback: { correct: boolean; attemptId: string } | null;
}

/** Answers already recorded on each step of the attempt when the page opened. */
type Resumed = Record<string, LessonStepProgress>;

interface FocusRequest {
  id: string;
  /** Scroll this element into view instead, such as a new point's section. */
  scrollTo?: string;
  block?: ScrollLogicalPosition;
  /** Scroll to the top of the page instead of to the element. */
  top?: boolean;
  /** Only scroll; leave keyboard focus where it is. */
  scrollOnly?: boolean;
}

const TITLE_ID = 'lesson-title';
const END_ID = 'lesson-end';
const stepDomId = (stepId: string) => `step-${stepId}`;
const stepTitleId = (stepId: string) => `step-${stepId}-title`;
const promptId = (key: string) => `prompt-${key}`;
const continueId = (key: string) => `continue-${key}`;

/** How often a question has been answered; it seeds a fresh choice order. */
function presentationOf(progress: Progress, questionId: string) {
  return progress.attempts.filter((a) => a.questionId === questionId).length;
}

/** The question an entry shows: for a generated one, its recorded variant. */
function entryQuestion(skill: Skill, entry: Entry): Question | undefined {
  const question = findQuestion(skill, entry.questionId);
  return question && questionVariant(question, entry.variant);
}

function attemptById(progress: Progress, id: string): Attempt | undefined {
  for (let index = progress.attempts.length - 1; index >= 0; index--)
    if (progress.attempts[index].id === id) return progress.attempts[index];
  return undefined;
}

function courseLanguageOf(skill: Skill): CodeLanguage {
  return codeLanguage(
    courses.find((course) => course.id === skill.courseId)?.language,
  );
}

/** The next question the engine serves for this skill, as a page entry. */
function buildEntry(
  progress: Progress,
  skill: Skill,
  mode: Mode,
  previous?: Entry | null,
): Entry {
  const question = selectQuestion(progress, skill, mode);
  const stepId = evidenceIdFor(skill, question.id) ?? question.id;
  const answers =
    mode === 'learn'
      ? lessonState(progress, skill).attempt?.steps[stepId]
      : undefined;
  // A retried code exercise keeps the learner's code so it can be fixed.
  const keepCode =
    question.type === 'code' &&
    previous?.questionId === question.id &&
    previous.code.trim() !== '';
  return {
    key: crypto.randomUUID(),
    skillId: skill.id,
    mode,
    questionId: question.id,
    stepId,
    number: answers ? answers.correct.length + answers.incorrect + 1 : 1,
    presentation: presentationOf(progress, question.id),
    ...(question.variant !== undefined ? { variant: question.variant } : {}),
    selected: null,
    response: '',
    invalid: null,
    code:
      question.type === 'code'
        ? keepCode
          ? previous!.code
          : question.starterCode
        : '',
    output: null,
    feedback: null,
  };
}

function resumedAnswers(progress: Progress, skill: Skill | undefined): Resumed {
  if (!skill || !hasKnowledgePoints(skill)) return {};
  return lessonState(progress, skill).attempt?.steps ?? {};
}

function reducedMotion() {
  return (
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

function WorkedExample({
  example,
  language,
}: {
  example: LessonExample;
  language: CodeLanguage;
}) {
  const text = example.kind === 'text';
  return (
    <div className="lesson-example">
      <CodeBlock
        code={example.code}
        language={text ? 'text' : language}
        highlight={!text}
        defaultWrap
        className="lesson-example-code"
      >
        <CodeBlockHeader>
          <CodeBlockTitle>
            {example.label ??
              (text ? 'SCENARIO' : codeLanguageLabels[language])}
          </CodeBlockTitle>
          <CodeBlockCopyButton className="ml-auto" />
        </CodeBlockHeader>
      </CodeBlock>
      <div className="worked-result">
        <div className="worked-result-label">
          <Check size={16} /> {text ? 'Decision' : 'Output'}
        </div>
        <CodeBlock
          code={example.output}
          language="text"
          highlight={false}
          defaultWrap
        />
      </div>
      <p className="lesson-teaching-text">
        <InlineText text={example.explanation} />
      </p>
    </div>
  );
}

/** A point's explanation and its clearly labelled, fully worked example. */
function PointTeaching({
  id,
  explanation,
  example,
  language,
}: {
  id: string;
  explanation: string[];
  example: LessonExample;
  language: CodeLanguage;
}) {
  return (
    <>
      <div className="lesson-explanation">
        {explanation.map((paragraph, index) => (
          <p className="lesson-teaching-text" key={index}>
            <InlineText text={paragraph} />
          </p>
        ))}
      </div>
      <div className="lesson-worked" role="group" aria-labelledby={id}>
        <h3 id={id} className="lesson-worked-heading">
          <Lightbulb size={16} aria-hidden="true" /> Worked example
        </h3>
        <WorkedExample example={example} language={language} />
      </div>
    </>
  );
}

type SessionProps = {
  state: LearnerState;
  update: (fn: (s: LearnerState) => LearnerState) => void;
  userId?: string;
};

function sessionGoal(state: LearnerState, params: URLSearchParams) {
  return (
    courses.find((c) => c.id === params.get('course'))?.id ??
    skillById[params.get('skill') ?? '']?.courseId ??
    courses.find((c) => c.id === state.activeCourseId)?.id ??
    courses[0].id
  );
}

/** The task the page opens on: the requested skill or the scheduler's next. */
function openingTask(state: LearnerState, params: URLSearchParams) {
  const suggested = nextTask(
    state.progress,
    new Date(),
    sessionGoal(state, params),
    undefined,
    { reviewsOnly: params.get('mode') === 'review' && !params.get('skill') },
  );
  const id = params.get('skill') ?? suggested?.skillId ?? skills[0].id;
  const mode: Mode =
    params.get('mode') === 'review'
      ? 'review'
      : !params.get('skill') || suggested?.skillId === params.get('skill')
        ? (suggested?.mode ?? 'learn')
        : 'learn';
  const complete =
    !params.get('skill') &&
    (!suggested ||
      (params.get('mode') === 'review' && suggested.mode !== 'review'));
  return { skillId: id, mode, complete };
}

/**
 * Loads the opening skill's content, then shows the page. Lesson content is
 * downloaded per unit; the scheduler only needs the graph index.
 */
export default function LearningSession(props: SessionProps) {
  const [opening] = useState(() =>
    openingTask(props.state, new URLSearchParams(window.location.search)),
  );
  const content = useSkillContent([opening.skillId]);
  if (skillById[opening.skillId] && !content.ready)
    return <ContentLoading error={content.error} retry={content.retry} />;
  return <LessonPage {...props} opening={opening} />;
}

function LessonPage({
  state,
  update,
  userId,
  opening,
}: SessionProps & { opening: ReturnType<typeof openingTask> }) {
  const params = new URLSearchParams(window.location.search);
  const goal = sessionGoal(state, params);
  // /learn?mode=review is a review session: it never switches to a lesson.
  // Elsewhere reviews interleave with lessons, as on Learn.
  const reviewSession = params.get('mode') === 'review' && !params.get('skill');
  const [initial] = useState(opening);
  const [skillId, setSkillId] = useState(initial.skillId);
  const [mode, setMode] = useState<Mode>(initial.mode);
  const [complete, setComplete] = useState(initial.complete);
  // The live question, then everything answered on this page before it.
  const [current, setCurrent] = useState<Entry | null>(() => {
    const first = loadedSkill(initial.skillId);
    return first && !initial.complete && isUnlocked(state.progress, first.id)
      ? buildEntry(state.progress, first, initial.mode)
      : null;
  });
  const [history, setHistory] = useState<Entry[]>([]);
  const [resumed, setResumed] = useState<Resumed>(() =>
    initial.mode === 'learn'
      ? resumedAnswers(state.progress, loadedSkill(initial.skillId))
      : {},
  );
  const [running, setRunning] = useState(false);
  const [sessionAttemptIds, setSessionAttemptIds] = useState<string[]>([]);
  const sessionAttempts = state.progress.attempts.filter((a) =>
    sessionAttemptIds.includes(a.id),
  );
  const sessionCount = sessionAttempts.length;
  const sessionXp = sessionAttempts.reduce((n, a) => n + a.xp, 0);
  const live = useRef(true);
  const gradingGeneration = useRef(0);
  const activeRun = useRef<symbol | null>(null);
  const activeController = useRef<AbortController | null>(null);
  const pendingFocus = useRef<FocusRequest | null>(null);
  // Continue waits while the next task's course content downloads.
  const advancing = useRef(false);
  const [advanceError, setAdvanceError] = useState(false);
  const endAnnounced = useRef<string | null>(null);
  useEffect(() => {
    live.current = true;
    return () => {
      live.current = false;
      gradingGeneration.current++;
      activeRun.current = null;
      activeController.current?.abort();
    };
  }, []);
  useEffect(() => {
    gradingGeneration.current++;
  }, [skillId, current?.key]);

  const skill = loadedSkill(skillId);
  const courseLanguage = skill ? courseLanguageOf(skill) : 'python';
  const available = !!skill && isUnlocked(state.progress, skillId);
  const currentSkill = current ? loadedSkill(current.skillId) : undefined;
  const question =
    current && currentSkill
      ? (entryQuestion(currentSkill, current) ?? null)
      : null;
  const language =
    question?.type === 'code'
      ? codeLanguage(question.language)
      : courseLanguage;
  const pointLesson = !!skill && hasKnowledgePoints(skill);
  const lesson = skill ? lessonState(state.progress, skill) : null;
  const recorded = current?.feedback
    ? attemptById(state.progress, current.feedback.attemptId)
    : undefined;
  const failed = recorded?.outcome === 'lesson-failed';
  const finished = recorded?.outcome === 'lesson-passed';
  const ended = failed || finished || complete;

  // A page opened on an attempt in progress starts at its current point.
  useEffect(() => {
    if (
      current &&
      mode === 'learn' &&
      skill &&
      lessonSteps(skill).findIndex((step) => step.id === current.stepId) > 0
    )
      pendingFocus.current = {
        id: stepDomId(current.stepId),
        block: 'start',
        scrollOnly: true,
      };
  }, []);
  // Keep a question on the page whenever the session has one to ask.
  useEffect(() => {
    if (!current && !complete && skill && available)
      setCurrent(buildEntry(state.progress, skill, mode));
  }, [current, complete, skill, available]);
  // New content is scrolled into view and focused, so keyboard and
  // screen-reader users land on it; smooth unless motion is reduced.
  useEffect(() => {
    if (
      (failed || finished) &&
      current?.feedback &&
      endAnnounced.current !== current.feedback.attemptId
    ) {
      endAnnounced.current = current.feedback.attemptId;
      pendingFocus.current = { id: END_ID, block: 'nearest' };
    }
    const target = pendingFocus.current;
    if (!target) return;
    const element = document.getElementById(target.id);
    if (!element) return;
    pendingFocus.current = null;
    const behavior: ScrollBehavior = reducedMotion() ? 'auto' : 'smooth';
    if (!target.scrollOnly) element.focus({ preventScroll: true });
    if (target.top) window.scrollTo({ top: 0, behavior });
    else
      (
        (target.scrollTo && document.getElementById(target.scrollTo)) ||
        element
      ).scrollIntoView({
        behavior: target.scrollOnly ? 'auto' : behavior,
        block: target.block ?? 'start',
      });
  });

  function patchCurrent(key: string, patch: Partial<Entry>) {
    setCurrent((entry) =>
      entry && entry.key === key ? { ...entry, ...patch } : entry,
    );
  }
  function record(correct: boolean, patch: Partial<Entry> = {}) {
    if (!current || !question || current.feedback || !live.current) return;
    const attemptId = crypto.randomUUID();
    const input = {
      skillId: current.skillId,
      questionId: question.id,
      correct,
      mode: current.mode,
      attemptId,
      ...(isTyped(question) ? { response: current.response } : {}),
      ...(current.variant !== undefined ? { variant: current.variant } : {}),
    };
    update((s) =>
      live.current && isUnlocked(s.progress, input.skillId)
        ? recordLearningAnswer(s, input)
        : s,
    );
    setSessionAttemptIds((ids) => [...ids, attemptId]);
    patchCurrent(current.key, { ...patch, feedback: { correct, attemptId } });
  }
  /** Grade a typed answer; one that is not a number asks again instead. */
  function submitTyped() {
    if (!current || !question || !isTyped(question) || current.feedback) return;
    const grade = gradeTyped(question, current.response);
    if (grade.status === 'invalid') {
      patchCurrent(current.key, { invalid: grade.message });
      return;
    }
    // The field is replaced by the result: keep keyboard focus on Continue.
    pendingFocus.current = { id: continueId(current.key), block: 'nearest' };
    record(grade.status === 'correct', { invalid: null });
  }
  async function checkCode() {
    if (!current || !question || question.type !== 'code' || activeRun.current)
      return;
    const token = Symbol('Code run');
    activeRun.current = token;
    const controller = new AbortController();
    activeController.current = controller;
    const generation = gradingGeneration.current;
    setRunning(true);
    const result = await runCode(current.code, question.tests, language, {
      skillId: current.skillId,
      questionId: question.id,
      userId,
      signal: controller.signal,
    });
    if (
      !live.current ||
      activeRun.current !== token ||
      gradingGeneration.current !== generation
    )
      return;
    activeRun.current = null;
    activeController.current = null;
    setRunning(false);
    if (result.infrastructure) patchCurrent(current.key, { output: result });
    else record(result.passed, { output: result });
  }
  /** Start a new page for another task: a lesson, or reviews after a lesson. */
  function openTask(id: string, nextMode: Mode, entry: Entry) {
    setHistory([]);
    setSkillId(id);
    setMode(nextMode);
    setResumed(
      nextMode === 'learn'
        ? resumedAnswers(state.progress, loadedSkill(id))
        : {},
    );
    setCurrent(entry);
    pendingFocus.current = { id: TITLE_ID, top: true };
  }
  async function next() {
    if (!current?.feedback || !skill || failed || advancing.current) return;
    const p = getSkillState(state.progress, skillId);
    const mastered = isMastered(state.progress, skillId);
    if (
      (mode === 'learn' && mastered) ||
      (mode === 'review' &&
        (!params.get('skill') ||
          !mastered ||
          (p.reviewQuestionIds.length === 0 &&
            p.dueAt &&
            p.dueAt > Date.now())))
    ) {
      const task = nextTask(state.progress, new Date(), goal, undefined, {
        reviewsOnly: reviewSession,
      });
      if (task && !(reviewSession && task.mode !== 'review')) {
        // The next task may come from another course: load its content first.
        let target = loadedSkill(task.skillId);
        if (!target) {
          advancing.current = true;
          try {
            target = await loadSkill(skillById[task.skillId]);
          } catch {
            setAdvanceError(true);
            return;
          } finally {
            advancing.current = false;
          }
          if (!live.current) return;
          setAdvanceError(false);
        }
        const entry = buildEntry(state.progress, target, task.mode, current);
        if (mode === 'review' && task.mode === 'review') {
          // Reviews keep stacking on the same page, whichever skill is next.
          setHistory((entries) => [...entries, current]);
          setSkillId(task.skillId);
          setCurrent(entry);
          pendingFocus.current = { id: promptId(entry.key) };
        } else openTask(task.skillId, task.mode, entry);
        return;
      }
      setHistory((entries) => [...entries, current]);
      setCurrent(null);
      setComplete(true);
      pendingFocus.current = { id: END_ID, block: 'nearest' };
      return;
    }
    const entry = buildEntry(state.progress, skill, mode, current);
    setHistory((entries) => [...entries, current]);
    setCurrent(entry);
    // A passed point appends the next point's section; otherwise the next
    // question is appended under the one just answered.
    pendingFocus.current =
      mode === 'learn' && entry.stepId !== current.stepId
        ? { id: stepTitleId(entry.stepId), scrollTo: stepDomId(entry.stepId) }
        : { id: promptId(entry.key) };
  }

  if (complete && !history.length && !current)
    return (
      <div className="empty-state">
        <CheckCircle2 size={38} />
        <h1>
          {params.get('mode') === 'review'
            ? 'Your reviews are all caught up.'
            : 'A foundation worth building on.'}
        </h1>
        <p>
          {sessionCount
            ? `${sessionCount} learning checks. ${sessionXp} XP earned this session.`
            : 'Come back when your next spaced review is due.'}
        </p>
        <Button asChild variant="default">
          <a href="/graph">
            See your growing graph <ArrowRight size={17} />
          </a>
        </Button>
        <Button asChild variant="link" className="h-auto justify-start p-0">
          <a href={`/lab?language=${courseLanguage}`}>
            Try a project in the code lab
          </a>
        </Button>
      </div>
    );
  if (!skill || (!available && !history.length && !ended))
    return (
      <div className="empty-state">
        <LockKeyhole />
        <h1>{skill ? 'Build the foundation first.' : 'Skill not found.'}</h1>
        <p>Prerequisites give every new idea somewhere to land.</p>
        <Button asChild variant="default">
          <a href="/graph">
            Explore the knowledge graph <ArrowRight size={18} />
          </a>
        </Button>
      </div>
    );

  const pageEntries = current ? [...history, current] : history;
  const steps = lesson?.steps ?? [];
  const stepIndex = (id: string) =>
    steps.findIndex(({ step: item }) => item.id === id);
  const currentStepIndex =
    current && mode === 'learn' ? stepIndex(current.stepId) : -1;
  /** Passed in this attempt or earlier, including before a failure ended it. */
  function stepPassed(index: number) {
    const { step: item, status } = steps[index];
    if (status === 'done' || status === 'passed') return true;
    const correct = new Set(resumed[item.id]?.correct ?? []);
    for (const entry of pageEntries)
      if (entry.stepId === item.id && entry.feedback?.correct)
        correct.add(entry.questionId);
    return correct.size >= (item.kind === 'point' ? POINT_PASS_CORRECT : 1);
  }

  const markers = lessonMarkers();
  function lessonMarkers() {
    if (!skill || !lesson) return [];
    if (mode === 'review') {
      const requirement = reviewRequirement(skill);
      const { done, total } = reviewProgress(
        skill,
        getSkillState(state.progress, skill.id).reviewQuestionIds,
      );
      return Array.from({ length: total }, (_, index) => ({
        id: `review-${index}`,
        label:
          requirement.code && index === total - 1
            ? 'Code'
            : `Question ${index + 1}`,
        status:
          index < done
            ? 'done'
            : index === done && !ended && current
              ? 'current'
              : 'todo',
      }));
    }
    return steps.map(({ step: item }, index) => ({
      id: item.id,
      label: item.title,
      status: stepPassed(index)
        ? 'done'
        : !ended && index === currentStepIndex
          ? 'current'
          : 'todo',
    }));
  }

  function questionCard(entry: Entry, label: string, extra?: ReactNode) {
    const owner = loadedSkill(entry.skillId);
    const item = owner ? entryQuestion(owner, entry) : undefined;
    if (!owner || !item) return null;
    const isLive = entry.key === current?.key;
    const attempt = entry.feedback
      ? attemptById(state.progress, entry.feedback.attemptId)
      : undefined;
    const ownerLanguage = courseLanguageOf(owner);
    return (
      <QuestionCard
        key={entry.key}
        entry={entry}
        question={item}
        label={label}
        live={isLive}
        courseLanguage={ownerLanguage}
        language={
          item.type === 'code' ? codeLanguage(item.language) : ownerLanguage
        }
        running={isLive && running}
        outcome={attempt?.outcome}
        xp={attempt?.xp ?? 0}
        // A finished or failed lesson ends here; its result follows below.
        canContinue={
          isLive &&
          attempt?.outcome !== 'lesson-passed' &&
          attempt?.outcome !== 'lesson-failed'
        }
        onSelect={(index) => patchCurrent(entry.key, { selected: index })}
        onResponse={(response) =>
          patchCurrent(entry.key, { response, invalid: null })
        }
        onCode={(code) => patchCurrent(entry.key, { code })}
        onSubmit={() =>
          item.type === 'choice'
            ? record(entry.selected === item.answer)
            : submitTyped()
        }
        onRun={checkCode}
        onContinue={next}
        after={extra}
      />
    );
  }

  function learnContent() {
    if (!skill || !lesson) return null;
    const paragraphs = skill.lesson.paragraphs.length
      ? skill.lesson.paragraphs
      : [skill.summary];
    const pointCount = skill.knowledgePoints?.length ?? 0;
    const hasCode = steps.some(({ step: item }) => item.kind === 'code');
    let frontier = currentStepIndex;
    for (const entry of history)
      frontier = Math.max(frontier, stepIndex(entry.stepId));
    if (frontier < 0) {
      const next = steps.findIndex(({ status }) => status === 'current');
      frontier = next >= 0 ? next : steps.length - 1;
    }
    return (
      <>
        <section aria-label="Introduction" className="lesson-introduction">
          {paragraphs.map((paragraph, index) => (
            <p className="lesson-teaching-text" key={index}>
              <InlineText text={paragraph} />
            </p>
          ))}
          {pointLesson && (
            <p className="lesson-plan-note">
              {pointCount} knowledge {pointCount === 1 ? 'point' : 'points'}
              {hasCode ? ', then a code exercise' : ''}. Two correct answers
              pass a point. Three wrong answers on one point end the attempt,
              and the lesson comes back later.
            </p>
          )}
        </section>
        {pointLesson ? (
          steps
            .slice(0, frontier + 1)
            .map(({ step: item, status }, index) =>
              stepSection(item, status, index),
            )
        ) : (
          <LegacySection
            skill={skill}
            language={courseLanguage}
            cards={pageEntries.map((entry) =>
              questionCard(
                entry,
                findQuestion(skill, entry.questionId)?.type === 'code'
                  ? 'Code exercise'
                  : 'Question',
              ),
            )}
          />
        )}
      </>
    );
  }

  function stepSection(
    item: LessonStep,
    status: LessonStepStatus,
    index: number,
  ) {
    if (!skill) return null;
    const passed = stepPassed(index);
    const entries = pageEntries.filter((entry) => entry.stepId === item.id);
    const earlier = resumed[item.id];
    const earlierCount = earlier
      ? earlier.correct.length + earlier.incorrect
      : 0;
    const point = item.point;
    const pointCount = skill.knowledgePoints?.length ?? 0;
    return (
      <section
        key={item.id}
        id={stepDomId(item.id)}
        className={`lesson-step${passed ? ' is-passed' : ''}`}
        aria-labelledby={stepTitleId(item.id)}
      >
        <Card className="lesson-paper lesson-point gap-0">
          <div className="lesson-point-head">
            <div>
              <span className="lesson-point-eyebrow">
                {point
                  ? `Knowledge point ${index + 1} of ${pointCount}`
                  : 'Code exercise'}
              </span>
              <h2 id={stepTitleId(item.id)} tabIndex={-1}>
                {item.title}
              </h2>
            </div>
            {passed && (
              <Badge
                variant="outline"
                className="lesson-passed border-emerald-200 bg-emerald-50 text-emerald-800"
              >
                <Check size={13} aria-hidden="true" /> Passed
              </Badge>
            )}
          </div>
          {point ? (
            <PointTeaching
              id={`${stepDomId(item.id)}-example`}
              explanation={point.explanation}
              example={point.example}
              language={codeLanguage(point.example.language ?? courseLanguage)}
            />
          ) : (
            <p className="lesson-teaching-text">
              Write and run real {codeLanguageLabels[stepLanguage(item)]}. A
              wrong run can be fixed and run again; it costs XP but does not end
              the attempt.
            </p>
          )}
          {earlierCount > 0 && status !== 'done' && (
            <p className="lesson-earlier-note">
              Answered earlier in this attempt: {earlier!.correct.length}{' '}
              correct, {earlier!.incorrect} incorrect.
            </p>
          )}
        </Card>
        {entries.map((entry) =>
          questionCard(
            entry,
            point
              ? `Question ${entry.number}`
              : entry.number > 1
                ? `Code exercise, try ${entry.number}`
                : 'Code exercise',
          ),
        )}
      </section>
    );
  }

  function stepLanguage(item: LessonStep): CodeLanguage {
    const exercise = item.questions[0];
    return exercise?.type === 'code'
      ? codeLanguage(exercise.language)
      : courseLanguage;
  }

  function reviewContent() {
    const multiSkill =
      new Set(pageEntries.map((entry) => entry.skillId)).size > 1;
    return (
      <section aria-label="Review questions" className="review-stack">
        <p className="lesson-plan-note">
          Answer from memory. After you answer, you can reread the point the
          question came from.
        </p>
        {pageEntries.map((entry, index) => {
          const owner = loadedSkill(entry.skillId);
          const point = owner ? stepFor(owner, entry.stepId)?.point : undefined;
          const label = `Question ${index + 1}${multiSkill && owner ? ` · ${owner.title}` : ''}`;
          return questionCard(
            entry,
            label,
            entry.feedback && point && owner ? (
              <RereadPoint
                entryKey={entry.key}
                point={point}
                language={codeLanguage(
                  point.example.language ?? courseLanguageOf(owner),
                )}
              />
            ) : undefined,
          );
        })}
      </section>
    );
  }

  return (
    <div className="lesson-workspace lesson-page lesson-flow">
      <div className="session-top">
        <Button asChild variant="link" className="h-auto justify-start p-0">
          <a href="/">
            <X size={18} />
            Leave session
          </a>
        </Button>
      </div>
      <header className="lesson-heading">
        <div className="lesson-course-path">
          <span>{courses.find((c) => c.id === skill.courseId)?.title}</span>
          <span aria-hidden="true">/</span>
          <span>{units.find((u) => u.id === skill.unitId)?.title}</span>
        </div>
        <h1 id={TITLE_ID} tabIndex={-1}>
          {skill.title}
        </h1>
        <div className="lesson-session-stats">
          <Badge variant="secondary">
            {mode === 'review' ? 'Review' : 'Lesson'}
          </Badge>
          {skill.stage && (
            <Badge variant="outline">
              Step {skill.stage} of {skill.stageCount}
            </Badge>
          )}
        </div>
      </header>
      <div className="lesson-progress-bar">
        {markers.length > 0 && (
          <ol
            className="lesson-markers"
            aria-label={
              mode === 'review' ? 'Review progress' : 'Lesson progress'
            }
          >
            {markers.map((marker, index) => (
              <li
                key={marker.id}
                className={`lesson-marker is-${marker.status}`}
                aria-current={marker.status === 'current' ? 'step' : undefined}
                title={marker.label}
              >
                <span className="lesson-marker-dot" aria-hidden="true">
                  {marker.status === 'done' ? <Check size={13} /> : index + 1}
                </span>
                <span className="lesson-marker-label">
                  {marker.label}
                  <span className="sr-only">
                    {marker.status === 'done'
                      ? ', complete'
                      : marker.status === 'current'
                        ? ', current'
                        : ''}
                  </span>
                </span>
              </li>
            ))}
          </ol>
        )}
        <span className="lesson-session-xp">
          <Zap size={15} aria-hidden="true" />
          {sessionXp} XP this session
        </span>
      </div>
      {mode === 'learn' ? learnContent() : reviewContent()}
      {advanceError && (
        <Alert variant="destructive" role="alert">
          <AlertDescription>
            The next lesson could not be downloaded. Check your connection, then
            press Continue again.
          </AlertDescription>
        </Alert>
      )}
      {failed && (
        <Card
          id={END_ID}
          tabIndex={-1}
          role="region"
          aria-labelledby={`${END_ID}-title`}
          className="lesson-paper lesson-result is-failed gap-0"
        >
          <CircleX size={30} aria-hidden="true" />
          <h2 id={`${END_ID}-title`}>
            Lesson failed — you’ll see it again later
          </h2>
          <p>
            Three answers on one knowledge point were incorrect, so this
            attempt’s progress was reset. Everything you read and answered is
            still above. When {skill.title} returns, it starts from the first
            point.
          </p>
          <Button asChild className="self-start">
            <a href="/">
              Back to Today <ArrowRight size={16} />
            </a>
          </Button>
        </Card>
      )}
      {(finished || (complete && (history.length > 0 || current))) && (
        <Card
          id={END_ID}
          tabIndex={-1}
          role="region"
          aria-labelledby={`${END_ID}-title`}
          className="lesson-paper lesson-result is-complete gap-0"
        >
          <CheckCircle2 size={30} aria-hidden="true" />
          <h2 id={`${END_ID}-title`}>
            {complete
              ? params.get('mode') === 'review'
                ? 'Your reviews are all caught up.'
                : 'A foundation worth building on.'
              : 'Lesson complete'}
          </h2>
          {finished && (
            <p>
              {recorded!.xp > 0
                ? `You earned ${recorded!.xp} XP.`
                : 'No new XP: you earned this lesson’s XP before.'}{' '}
              {skill.title} is mastered. Its next review is due tomorrow.
            </p>
          )}
          {complete ? (
            <>
              <p>
                {sessionCount} learning checks. {sessionXp} XP earned this
                session.
              </p>
              <div className="lesson-result-actions">
                <Button asChild>
                  <a href="/graph">
                    See your growing graph <ArrowRight size={17} />
                  </a>
                </Button>
                <Button
                  asChild
                  variant="link"
                  className="h-auto justify-start p-0"
                >
                  <a href={`/lab?language=${courseLanguage}`}>
                    Try a project in the code lab
                  </a>
                </Button>
              </div>
            </>
          ) : (
            <Btn onClick={next}>
              Next task <ArrowRight size={16} />
            </Btn>
          )}
        </Card>
      )}
    </div>
  );
}

/** A skill without knowledge points: its one worked example, then practice. */
function LegacySection({
  skill,
  language,
  cards,
}: {
  skill: Skill;
  language: CodeLanguage;
  cards: ReactNode[];
}) {
  return (
    <section className="lesson-step" aria-labelledby="legacy-practice">
      <Card className="lesson-paper lesson-point gap-0">
        <div className="lesson-point-head">
          <h2 id="legacy-practice">Practice</h2>
        </div>
        <div className="lesson-worked" role="group" aria-labelledby="legacy-ex">
          <h3 id="legacy-ex" className="lesson-worked-heading">
            <Lightbulb size={16} aria-hidden="true" /> Worked example
          </h3>
          <WorkedExample
            example={skill.lesson.example}
            language={codeLanguage(skill.lesson.example.language ?? language)}
          />
        </div>
      </Card>
      {cards}
    </section>
  );
}

/** Optional rereading for a review question, after it has been answered. */
function RereadPoint({
  entryKey,
  point,
  language,
}: {
  entryKey: string;
  point: KnowledgePoint;
  language: CodeLanguage;
}) {
  return (
    <Accordion type="single" collapsible className="lesson-reread">
      <AccordionItem value="reread" className="border-0">
        <AccordionTrigger>Reread: {point.title}</AccordionTrigger>
        <AccordionContent>
          <PointTeaching
            id={`reread-${entryKey}`}
            explanation={point.explanation}
            example={point.example}
            language={language}
          />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

function QuestionCard({
  entry,
  question,
  label,
  live,
  courseLanguage,
  language,
  running,
  outcome,
  xp,
  canContinue,
  onSelect,
  onResponse,
  onCode,
  onSubmit,
  onRun,
  onContinue,
  after,
}: {
  entry: Entry;
  question: Question;
  label: string;
  /** The question being answered now; answered ones above it are frozen. */
  live: boolean;
  courseLanguage: CodeLanguage;
  language: CodeLanguage;
  running: boolean;
  outcome?: string;
  xp: number;
  canContinue: boolean;
  onSelect: (index: number) => void;
  onResponse: (response: string) => void;
  onCode: (code: string) => void;
  onSubmit: () => void;
  onRun: () => void;
  onContinue: () => void;
  after?: ReactNode;
}) {
  const { feedback, selected, response, code, output } = entry;
  const answered = !!feedback;
  const order =
    question.type === 'choice' ? choiceOrder(question, entry.presentation) : [];
  const title = feedback
    ? outcome === 'lesson-passed'
      ? 'Lesson complete'
      : outcome === 'review-passed'
        ? 'Review complete'
        : feedback.correct
          ? 'Correct'
          : 'Incorrect'
    : '';
  return (
    <Card
      className={`gap-0 question-paper lesson-question${answered ? (feedback.correct ? ' is-correct' : ' is-incorrect') : ''}`}
      data-state={live ? 'current' : 'answered'}
      role="group"
      aria-labelledby={promptId(entry.key)}
    >
      <div className="question-top">
        <span className="page-eyebrow">{label}</span>
        {answered && !live && (
          <span
            className={`question-result ${feedback.correct ? 'is-correct' : 'is-incorrect'}`}
          >
            {feedback.correct ? (
              <CheckCircle2 size={15} aria-hidden="true" />
            ) : (
              <CircleX size={15} aria-hidden="true" />
            )}
            {feedback.correct ? 'Correct' : 'Incorrect'}
          </span>
        )}
      </div>
      <h3 id={promptId(entry.key)} className="question-prompt" tabIndex={-1}>
        <InlineText text={question.prompt} />
      </h3>
      {question.type !== 'code' && question.code && (
        <CodeBlock
          code={question.code}
          language={courseLanguage}
          defaultWrap
          className="mb-5"
        />
      )}
      {isTyped(question) ? (
        answered ? (
          <TypedAnswerResult
            question={question}
            response={response}
            correct={feedback.correct}
          />
        ) : (
          <TypedAnswerInput
            question={question}
            value={response}
            error={entry.invalid}
            disabled={!live}
            onChange={onResponse}
            onSubmit={onSubmit}
          />
        )
      ) : question.type === 'choice' ? (
        <div className="answer-options" role="group" aria-label="Choices">
          {order.map((index, position) => {
            const chosen = selected === index;
            const right = answered && question.answer === index;
            return (
              <Button
                variant="outline"
                key={index}
                data-choice={index}
                onClick={() => onSelect(index)}
                disabled={answered || !live}
                aria-pressed={chosen}
                className={`answer-option h-auto w-full justify-start whitespace-normal py-4 text-left disabled:opacity-100 ${chosen ? 'border-primary bg-primary/5' : ''} ${right ? 'border-success bg-success/10' : ''} ${answered && chosen && !feedback.correct ? 'border-destructive bg-destructive/10' : ''}`}
              >
                <Badge variant="outline" className="shrink-0 font-mono">
                  {choiceLetter(position)}
                </Badge>
                <pre>
                  <ChoiceText question={question} index={index} />
                </pre>
                {answered && (chosen || right) && (
                  <span className="answer-marks">
                    {chosen && <span className="answer-tag">Your answer</span>}
                    {right && (
                      <>
                        <Check size={18} aria-hidden="true" />
                        <span className="sr-only">Correct answer</span>
                      </>
                    )}
                  </span>
                )}
              </Button>
            );
          })}
        </div>
      ) : (
        <>
          {question.contract && live && (
            <CodeBlock
              code={question.contract}
              language={language}
              defaultWrap
              className="my-5"
              aria-label="Required behavior checks"
            >
              <CodeBlockHeader>
                <CodeBlockTitle>REQUIRED BEHAVIOR</CodeBlockTitle>
                <CodeBlockCopyButton className="ml-auto" />
              </CodeBlockHeader>
            </CodeBlock>
          )}
          {live ? (
            <>
              <div className="editor-label">
                <span>
                  <Code2 size={16} />
                  Your {codeLanguageLabels[language]} code
                </span>
                <small>
                  {language === 'python'
                    ? 'Runs on your device'
                    : 'Only your code is sent to Compiler Explorer’s free sandbox'}
                </small>
              </div>
              <Suspense
                fallback={
                  <div className="editor-loading">
                    Preparing the code editor…
                  </div>
                }
              >
                <CodeEditor
                  language={language}
                  wrap
                  value={code}
                  height="230px"
                  onChange={onCode}
                  editable={!answered && !running}
                  aria-label={`${codeLanguageLabels[language]} code editor`}
                  basicSetup={{ lineNumbers: true, foldGutter: false }}
                />
              </Suspense>
            </>
          ) : (
            <CodeBlock
              code={code || '(empty)'}
              language={language}
              defaultWrap
              className="my-4"
            >
              <CodeBlockHeader>
                <CodeBlockTitle>YOUR CODE</CodeBlockTitle>
              </CodeBlockHeader>
            </CodeBlock>
          )}
          {output && (
            <div className="mt-4 space-y-3">
              <CodeBlock
                code={output.output || '(no output)'}
                language="text"
                highlight={false}
                defaultWrap
              >
                <CodeBlockHeader>
                  <CodeBlockTitle>OUTPUT</CodeBlockTitle>
                </CodeBlockHeader>
              </CodeBlock>
              {output.error && (
                <Alert variant="destructive" role={live ? 'alert' : undefined}>
                  <AlertDescription className="break-words whitespace-pre-wrap">
                    {output.error}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </>
      )}
      {/* The live question announces its result; answered ones stay quiet. */}
      <div
        className="question-feedback"
        aria-live={live ? 'polite' : undefined}
      >
        {feedback && (
          <Alert
            className={`my-5 ${feedback.correct ? 'border-success/25 bg-success/5' : 'border-destructive/30 bg-destructive/5'}`}
            role={live ? 'status' : undefined}
          >
            {feedback.correct ? <CheckCircle2 size={23} /> : <CircleX />}
            <AlertDescription>
              <strong>
                {title}
                {xp > 0 && ` · +${xp} XP`}
              </strong>
              <p>
                <InlineText text={question.explanation} />
              </p>
              {!feedback.correct && question.type === 'code' && (
                <Accordion type="single" collapsible className="mt-3">
                  <AccordionItem value="solution">
                    <AccordionTrigger>Show a worked solution</AccordionTrigger>
                    <AccordionContent>
                      <CodeBlock
                        code={question.solution}
                        language={language}
                        defaultWrap
                      />
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              )}
              {!feedback.correct && (
                <small>This question was added to your flashcards.</small>
              )}
            </AlertDescription>
          </Alert>
        )}
      </div>
      {after}
      {live && (!answered || canContinue) && (
        <div className="question-actions">
          {answered ? (
            <Btn id={continueId(entry.key)} onClick={onContinue}>
              Continue <ArrowRight size={18} />
            </Btn>
          ) : question.type === 'choice' ? (
            <Btn onClick={onSubmit} disabled={selected === null}>
              Submit
            </Btn>
          ) : isTyped(question) ? (
            <Btn onClick={onSubmit} disabled={!response.trim()}>
              Submit
            </Btn>
          ) : (
            <Btn onClick={onRun} disabled={running || !code.trim()}>
              {running ? (
                <>
                  <LoaderCircle className="spin" size={17} />
                  Running {codeLanguageLabels[language]}…
                </>
              ) : (
                <>
                  <Play size={17} />
                  Run & check
                </>
              )}
            </Btn>
          )}
        </div>
      )}
    </Card>
  );
}
