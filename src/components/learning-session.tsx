import { useEffect, useRef, useState, lazy, Suspense } from 'react';
import {
  ArrowRight,
  Check,
  CheckCircle2,
  CircleX,
  Code2,
  LoaderCircle,
  LockKeyhole,
  Play,
  X,
  Zap,
} from 'lucide-react';
import {
  courses,
  skills,
  skillById,
  units,
  type CodeLanguage,
  type LessonExample,
  type Question,
  type Skill,
} from '../lib/curriculum';
import {
  getSkillState,
  isMastered,
  isUnlocked,
  lessonState,
  nextTask,
  recordLesson,
  selectQuestion,
  type Progress,
} from '../lib/learning';
import {
  evidenceIdFor,
  findQuestion,
  hasKnowledgePoints,
  reviewProgress,
  reviewRequirement,
  stepFor,
} from '../lib/lesson-plan';
import { choiceLetter, choiceOrder } from '../lib/choice-order';
import { type PythonResult } from '../lib/python';
import { runCode } from '../lib/code-runner';
import {
  codeLanguage,
  codeLanguageLabels,
  editorLanguage,
} from '../lib/code-language';
import { recordLearningAnswer, type LearnerState } from '../lib/state';
import { Btn } from './shared';
import LessonPlayer from './lesson-player';
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
const CodeMirror = lazy(() => import('@uiw/react-codemirror'));

type Stage = 'intro' | 'question' | 'failed';

/** The page a learn or review task opens on. */
function initialStage(
  progress: Progress,
  skill: Skill,
  mode: 'learn' | 'review',
): Stage {
  if (mode === 'review' || isMastered(progress, skill.id)) return 'question';
  // A knowledge-point lesson opens on its introduction unless an attempt is
  // under way; a legacy lesson shows its slides until they have been read.
  return hasKnowledgePoints(skill)
    ? lessonState(progress, skill).attempt
      ? 'question'
      : 'intro'
    : getSkillState(progress, skill.id).lessonSeen
      ? 'question'
      : 'intro';
}

/** How often a question has been answered; it seeds a fresh choice order. */
function presentationOf(progress: Progress, questionId: string) {
  return progress.attempts.filter((a) => a.questionId === questionId).length;
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
      <p className="lesson-teaching-text">{example.explanation}</p>
    </div>
  );
}

export default function LearningSession({
  state,
  update,
  userId,
}: {
  state: LearnerState;
  update: (fn: (s: LearnerState) => LearnerState) => void;
  userId?: string;
}) {
  const params = new URLSearchParams(window.location.search);
  const goal =
    courses.find((c) => c.id === params.get('course'))?.id ??
    skillById[params.get('skill') ?? '']?.courseId ??
    courses.find((c) => c.id === state.activeCourseId)?.id ??
    courses[0].id;
  const suggested = nextTask(state.progress, new Date(), goal);
  const [skillId, setSkillId] = useState(
    params.get('skill') ?? suggested?.skillId ?? skills[0].id,
  );
  const [mode, setMode] = useState<'learn' | 'review'>(
    params.get('mode') === 'review'
      ? 'review'
      : !params.get('skill') || suggested?.skillId === params.get('skill')
        ? (suggested?.mode ?? 'learn')
        : 'learn',
  );
  const [complete, setComplete] = useState(
    !params.get('skill') &&
      (!suggested ||
        (params.get('mode') === 'review' && suggested.mode !== 'review')),
  );
  const [stage, setStage] = useState<Stage>(() =>
    skillById[skillId]
      ? initialStage(state.progress, skillById[skillId], mode)
      : 'question',
  );
  const [questionId, setQuestionId] = useState<string | null>(null);
  const [presentation, setPresentation] = useState(0);
  // Answers already given on this question's lesson step in this attempt.
  const [stepAnswers, setStepAnswers] = useState(0);
  // The point's teaching starts open for its first question, then folds away.
  const [teachingOpen, setTeachingOpen] = useState(true);
  // The authored index of the selected choice, whatever position it shows at.
  const [selected, setSelected] = useState<number | null>(null);
  const [code, setCode] = useState('');
  const [feedback, setFeedback] = useState<{
    correct: boolean;
    attemptId: string;
  } | null>(null);
  const [running, setRunning] = useState(false);
  const [output, setOutput] = useState<PythonResult | null>(null);
  const [slideIndex, setSlideIndex] = useState(0);
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
  }, [skillId, questionId]);
  const skill = skillById[skillId];
  const courseLanguage = codeLanguage(
    courses.find((course) => course.id === skill?.courseId)?.language,
  );
  const progress = skill ? getSkillState(state.progress, skillId) : null;
  const available = skill && isUnlocked(state.progress, skillId);
  const question = skill && questionId ? findQuestion(skill, questionId) : null;
  const language =
    question?.type === 'code'
      ? codeLanguage(question.language)
      : courseLanguage;
  const pointLesson = !!skill && hasKnowledgePoints(skill);
  const lesson = skill ? lessonState(state.progress, skill) : null;
  const step =
    skill && question
      ? stepFor(skill, evidenceIdFor(skill, question.id) ?? '')
      : undefined;
  const recorded = feedback
    ? state.progress.attempts.find((a) => a.id === feedback.attemptId)
    : undefined;

  function chooseQuestion(id = skillId, nextMode = mode) {
    const s = skillById[id];
    const q = selectQuestion(state.progress, s, nextMode);
    const answers = lessonState(state.progress, s).attempt?.steps[
      evidenceIdFor(s, q.id) ?? ''
    ];
    setQuestionId(q.id);
    setPresentation(presentationOf(state.progress, q.id));
    const answered =
      nextMode === 'learn' && answers
        ? answers.correct.length + answers.incorrect
        : 0;
    setStepAnswers(answered);
    setTeachingOpen(answered === 0);
    setSelected(null);
    setCode(q.type === 'code' ? q.starterCode : '');
    setFeedback(null);
    setOutput(null);
  }
  useEffect(() => {
    if (skill && available && stage === 'question' && !questionId)
      chooseQuestion();
  }, [skillId, stage]);
  function startLesson() {
    if (!progress?.lessonSeen && mode === 'learn')
      update((s) => ({ ...s, progress: recordLesson(s.progress, skillId) }));
    setStage('question');
    if (!question) chooseQuestion();
  }
  function record(correct: boolean) {
    if (!question || feedback || !live.current) return;
    const attemptId = crypto.randomUUID();
    const input = {
      skillId,
      questionId: question.id,
      correct,
      mode,
      attemptId,
    };
    update((s) =>
      live.current && isUnlocked(s.progress, skillId)
        ? recordLearningAnswer(s, input)
        : s,
    );
    setSessionAttemptIds((ids) => [...ids, attemptId]);
    setFeedback({ correct, attemptId });
  }
  async function checkCode() {
    if (!question || question.type !== 'code' || activeRun.current) return;
    const token = Symbol('Code run');
    activeRun.current = token;
    const controller = new AbortController();
    activeController.current = controller;
    const generation = gradingGeneration.current;
    setRunning(true);
    const result = await runCode(code, question.tests, language, {
      skillId,
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
    setOutput(result);
    setRunning(false);
    if (!result.infrastructure) record(result.passed);
  }
  function next() {
    if (recorded?.outcome === 'lesson-failed') {
      setStage('failed');
      return;
    }
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
      const task = nextTask(state.progress, new Date(), goal);
      if (
        task &&
        !(params.get('mode') === 'review' && task.mode !== 'review')
      ) {
        const nextStage = initialStage(
          state.progress,
          skillById[task.skillId],
          task.mode,
        );
        setSkillId(task.skillId);
        setMode(task.mode);
        setQuestionId(null);
        setSelected(null);
        setCode('');
        setFeedback(null);
        setOutput(null);
        setSlideIndex(0);
        setStage(nextStage);
        if (nextStage === 'question') chooseQuestion(task.skillId, task.mode);
        return;
      }
      setComplete(true);
      return;
    }
    chooseQuestion();
  }

  if (complete)
    return (
      <div className="empty-state">
        <CheckCircle2 size={38} />
        <h1>
          {params.get('mode') === 'review'
            ? 'Your reviews are all caught up.'
            : 'Nothing else is ready right now.'}
        </h1>
        <p>
          {sessionCount
            ? `${sessionCount} answers. ${sessionXp} XP earned this session.`
            : 'Come back when your next spaced review is due.'}
        </p>
        <Button asChild variant="default">
          <a href="/graph">
            See your knowledge graph <ArrowRight size={17} />
          </a>
        </Button>
        <Button asChild variant="link" className="h-auto justify-start p-0">
          <a href={`/lab?language=${courseLanguage}`}>
            Try a project in the code lab
          </a>
        </Button>
      </div>
    );
  if (!skill || !available)
    return (
      <div className="empty-state">
        <LockKeyhole />
        <h1>{skill ? 'Build the foundation first.' : 'Skill not found.'}</h1>
        <p>Master this skill’s prerequisites to unlock it.</p>
        <Button asChild variant="default">
          <a href="/graph">
            Explore the knowledge graph <ArrowRight size={18} />
          </a>
        </Button>
      </div>
    );
  if (stage === 'failed')
    return (
      <div className="lesson-workspace lesson-page">
        <Card className="lesson-result gap-0" role="status">
          <CircleX size={34} />
          <h1>Lesson failed — you’ll see it again later</h1>
          <p>
            Three answers on one knowledge point were incorrect, so this
            attempt’s progress was reset. When {skill.title} returns, it starts
            from the first point.
          </p>
          <Button asChild>
            <a href="/">
              Back to Today <ArrowRight size={16} />
            </a>
          </Button>
        </Card>
      </div>
    );

  const markers = lessonMarkers();
  function lessonMarkers() {
    if (!skill || !progress || !lesson) return [];
    if (mode === 'review') {
      const requirement = reviewRequirement(skill);
      const { done, total } = reviewProgress(skill, progress.reviewQuestionIds);
      return Array.from({ length: total }, (_, index) => ({
        id: `review-${index}`,
        label:
          requirement.code && index === total - 1
            ? 'Code'
            : `Question ${index + 1}`,
        status:
          index < done
            ? 'done'
            : index === done && stage === 'question'
              ? 'current'
              : 'todo',
      }));
    }
    return lesson.steps.map(({ step: item, status }) => ({
      id: item.id,
      label: item.title,
      status:
        status === 'done' || status === 'passed'
          ? 'done'
          : stage === 'question' &&
              (pointLesson ? status === 'current' : step?.id === item.id)
            ? 'current'
            : 'todo',
    }));
  }
  const point = step?.point;

  return (
    <div className="lesson-workspace lesson-page">
      <div className="session-top">
        <Button asChild variant="link" className="h-auto justify-start p-0">
          <a href="/">
            <X size={18} />
            Leave session
          </a>
        </Button>
        <span>
          <Zap size={16} />
          {sessionXp} XP this session
        </span>
      </div>
      <header className="lesson-heading">
        <div className="lesson-course-path">
          <span>{courses.find((c) => c.id === skill.courseId)?.title}</span>
          <span aria-hidden="true">/</span>
          <span>{units.find((u) => u.id === skill.unitId)?.title}</span>
        </div>
        <h1>{skill.title}</h1>
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
      {markers.length > 0 && (
        <ol
          className="lesson-markers"
          aria-label={mode === 'review' ? 'Review progress' : 'Lesson progress'}
        >
          {markers.map((marker, index) => (
            <li
              key={marker.id}
              className={`lesson-marker is-${marker.status}`}
              aria-current={marker.status === 'current' ? 'step' : undefined}
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
      {stage === 'intro' ? (
        pointLesson ? (
          <Card className="lesson-paper lesson-intro gap-0">
            <section aria-label="Introduction" className="lesson-section">
              {(skill.lesson.paragraphs.length
                ? skill.lesson.paragraphs
                : [skill.summary]
              ).map((paragraph, index) => (
                <p className="lesson-teaching-text" key={index}>
                  {paragraph}
                </p>
              ))}
            </section>
            <div className="lesson-actions">
              <span>
                {skill.knowledgePoints!.length} knowledge points
                {lesson?.steps.some(({ step: item }) => item.kind === 'code')
                  ? ', then a code exercise'
                  : ''}
              </span>
              <Btn onClick={startLesson}>
                Start lesson <ArrowRight size={16} />
              </Btn>
            </div>
          </Card>
        ) : (
          <LessonPlayer
            skill={skill}
            slideIndex={slideIndex}
            onSlideChange={setSlideIndex}
            onPractice={startLesson}
            returningToPractice={false}
          />
        )
      ) : (
        <>
          {point && mode === 'learn' && (
            <PointTeaching
              title={point.title}
              explanation={point.explanation}
              example={point.example}
              language={codeLanguage(point.example.language ?? courseLanguage)}
              open={teachingOpen}
              onOpenChange={setTeachingOpen}
            />
          )}
          {question && (
            <QuestionCard
              key={`${question.id}-${presentation}`}
              question={question}
              label={
                mode === 'review'
                  ? 'Review question'
                  : point
                    ? `Question ${stepAnswers + 1}`
                    : question.type === 'code'
                      ? 'Code exercise'
                      : 'Question'
              }
              presentation={presentation}
              courseLanguage={courseLanguage}
              language={language}
              selected={selected}
              onSelect={setSelected}
              code={code}
              onCode={setCode}
              running={running}
              output={output}
              feedback={feedback}
              outcome={recorded?.outcome}
              xp={recorded?.xp ?? 0}
              onSubmit={() =>
                question.type === 'choice' &&
                record(selected === question.answer)
              }
              onRun={checkCode}
              onContinue={next}
            />
          )}
        </>
      )}
    </div>
  );
}

function PointTeaching({
  title,
  explanation,
  example,
  language,
  open,
  onOpenChange,
}: {
  title: string;
  explanation: string[];
  example: LessonExample;
  language: CodeLanguage;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Card className="lesson-paper lesson-point gap-0">
      <h2>{title}</h2>
      <Accordion
        type="single"
        collapsible
        value={open ? 'point' : ''}
        onValueChange={(value) => onOpenChange(value === 'point')}
      >
        <AccordionItem value="point" className="border-0">
          <AccordionTrigger>Explanation and worked example</AccordionTrigger>
          <AccordionContent>
            <section aria-label="Explanation" className="lesson-section">
              {explanation.map((paragraph, index) => (
                <p className="lesson-teaching-text" key={index}>
                  {paragraph}
                </p>
              ))}
              <h3 className="lesson-example-heading">Worked example</h3>
              <WorkedExample example={example} language={language} />
            </section>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
}

function QuestionCard({
  question,
  label,
  presentation,
  courseLanguage,
  language,
  selected,
  onSelect,
  code,
  onCode,
  running,
  output,
  feedback,
  outcome,
  xp,
  onSubmit,
  onRun,
  onContinue,
}: {
  question: Question;
  label: string;
  presentation: number;
  courseLanguage: CodeLanguage;
  language: CodeLanguage;
  selected: number | null;
  onSelect: (index: number) => void;
  code: string;
  onCode: (code: string) => void;
  running: boolean;
  output: PythonResult | null;
  feedback: { correct: boolean } | null;
  outcome?: string;
  xp: number;
  onSubmit: () => void;
  onRun: () => void;
  onContinue: () => void;
}) {
  const order =
    question.type === 'choice' ? choiceOrder(question, presentation) : [];
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
    <Card className="gap-0 question-paper">
      <div className="question-top">
        <span className="page-eyebrow">{label}</span>
      </div>
      <h1>{question.prompt}</h1>
      {question.type === 'choice' && question.code && (
        <CodeBlock
          code={question.code}
          language={courseLanguage}
          defaultWrap
          className="my-5"
        />
      )}
      {question.type === 'choice' ? (
        <div className="answer-options" role="group" aria-label="Choices">
          {order.map((index, position) => (
            <Button
              variant="outline"
              key={index}
              data-choice={index}
              onClick={() => onSelect(index)}
              disabled={!!feedback}
              aria-pressed={selected === index}
              className={`answer-option h-auto w-full justify-start whitespace-normal py-4 text-left ${selected === index ? 'border-primary bg-primary/5' : ''} ${feedback && question.answer === index ? 'border-success bg-success/10' : ''} ${feedback && selected === index && !feedback.correct ? 'border-destructive bg-destructive/10' : ''}`}
            >
              <Badge variant="outline" className="shrink-0 font-mono">
                {choiceLetter(position)}
              </Badge>
              <pre>{question.choices[index]}</pre>
              {feedback && question.answer === index && <Check size={18} />}
            </Button>
          ))}
        </div>
      ) : (
        <>
          {question.contract && (
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
              <div className="editor-loading">Preparing the code editor…</div>
            }
          >
            <CodeMirror
              value={code}
              extensions={[editorLanguage(language)]}
              height="230px"
              onChange={onCode}
              editable={!feedback && !running}
              aria-label={`${codeLanguageLabels[language]} code editor`}
              basicSetup={{ lineNumbers: true, foldGutter: false }}
            />
          </Suspense>
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
                <Alert variant="destructive">
                  <AlertDescription className="break-words whitespace-pre-wrap">
                    {output.error}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </>
      )}
      {feedback && (
        <Alert
          className={`my-5 ${feedback.correct ? 'border-success/25 bg-success/5' : 'border-destructive/30 bg-destructive/5'}`}
          role="status"
        >
          {feedback.correct ? <CheckCircle2 size={23} /> : <CircleX />}
          <AlertDescription>
            <strong>
              {title}
              {xp > 0 && ` · +${xp} XP`}
            </strong>
            <p>{question.explanation}</p>
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
      <div className="question-actions">
        {feedback ? (
          <Btn onClick={onContinue}>
            Continue <ArrowRight size={18} />
          </Btn>
        ) : question.type === 'choice' ? (
          <Btn onClick={onSubmit} disabled={selected === null}>
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
    </Card>
  );
}
