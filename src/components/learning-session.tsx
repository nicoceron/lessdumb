import { useEffect, useRef, useState, lazy, Suspense } from 'react';
import {
  ArrowRight,
  Check,
  CheckCircle2,
  CircleHelp,
  Code2,
  GitBranch,
  LoaderCircle,
  LockKeyhole,
  Play,
  X,
  Zap,
} from 'lucide-react';
import { python } from '@codemirror/lang-python';
import {
  courses,
  skills,
  skillById,
  units,
  assessmentPolicy,
} from '../lib/curriculum';
import {
  getSkillState,
  isUnlocked,
  nextTask,
  recordLesson,
  selectQuestion,
} from '../lib/learning';
import { runPython, type PythonResult } from '../lib/python';
import { recordLearningAnswer, type LearnerState } from '../lib/state';
import { Btn, Pill } from './shared';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
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

export default function LearningSession({
  state,
  update,
}: {
  state: LearnerState;
  update: (fn: (s: LearnerState) => LearnerState) => void;
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
  const [questionId, setQuestionId] = useState<string | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [code, setCode] = useState('');
  const [feedback, setFeedback] = useState<{
    correct: boolean;
    text: string;
  } | null>(null);
  const [hint, setHint] = useState(false);
  const [running, setRunning] = useState(false);
  const [output, setOutput] = useState<PythonResult | null>(null);
  const [sessionAttemptIds, setSessionAttemptIds] = useState<string[]>([]);
  const sessionAttempts = state.progress.attempts.filter((a) =>
    sessionAttemptIds.includes(a.id),
  );
  const sessionCount = sessionAttempts.length;
  const sessionXp = sessionAttempts.reduce((n, a) => n + a.xp, 0);
  const live = useRef(true);
  const gradingGeneration = useRef(0);
  const activeRun = useRef<symbol | null>(null);
  useEffect(() => {
    live.current = true;
    return () => {
      live.current = false;
      gradingGeneration.current++;
      activeRun.current = null;
    };
  }, []);
  useEffect(() => {
    gradingGeneration.current++;
  }, [skillId, questionId]);
  const skill = skillById[skillId];
  const progress = skill ? getSkillState(state.progress, skillId) : null;
  const available = skill && isUnlocked(state.progress, skillId);
  const question = skill?.questions.find((q) => q.id === questionId);
  const showingLesson = skill && !progress?.lessonSeen && mode === 'learn';
  const reviewPolicy = skill
    ? assessmentPolicy(skill)
    : { requiredTypes: [], reviewAnswers: 1 };
  const reviewCount = progress?.reviewQuestionIds.length ?? 0;
  const missingReviewTypes = reviewPolicy.requiredTypes.filter(
    (type) =>
      !progress?.reviewQuestionIds.some(
        (id) => skill.questions.find((q) => q.id === id)?.type === type,
      ),
  );
  const reviewFraction = Math.min(
    1,
    reviewCount / reviewPolicy.reviewAnswers,
    (reviewPolicy.requiredTypes.length - missingReviewTypes.length) /
      (reviewPolicy.requiredTypes.length || 1),
  );

  function chooseQuestion(id = skillId, nextMode = mode) {
    const s = skillById[id];
    const q = selectQuestion(state.progress, s, nextMode);
    setQuestionId(q.id);
    setSelected(null);
    setCode(q.type === 'code' ? q.starterCode : '');
    setFeedback(null);
    setHint(false);
    setOutput(null);
  }
  useEffect(() => {
    if (skill && !showingLesson && !questionId) chooseQuestion();
  }, [skillId, showingLesson]);
  function startPractice() {
    update((s) => ({ ...s, progress: recordLesson(s.progress, skillId) }));
    chooseQuestion();
  }
  function record(correct: boolean) {
    if (!question || feedback || !live.current) return;
    const attemptId = crypto.randomUUID();
    const input = {
      skillId,
      questionId: question.id,
      correct,
      mode,
      usedHint: hint,
      attemptId,
    };
    update((s) =>
      live.current && isUnlocked(s.progress, skillId)
        ? recordLearningAnswer(s, input)
        : s,
    );
    setSessionAttemptIds((ids) => [...ids, attemptId]);
    setFeedback({ correct, text: question.explanation });
  }
  async function checkCode() {
    if (!question || question.type !== 'code' || activeRun.current) return;
    const token = Symbol('Python run');
    activeRun.current = token;
    const generation = gradingGeneration.current;
    setRunning(true);
    const result = await runPython(code, question.tests);
    if (
      !live.current ||
      activeRun.current !== token ||
      gradingGeneration.current !== generation
    )
      return;
    activeRun.current = null;
    setOutput(result);
    setRunning(false);
    if (!result.infrastructure) record(result.passed);
  }
  function next() {
    const p = getSkillState(state.progress, skillId);
    if (
      (mode === 'learn' && p.mastery >= 1) ||
      (mode === 'review' &&
        (p.mastery < 1 ||
          (p.reviewQuestionIds.length === 0 &&
            p.dueAt &&
            p.dueAt > Date.now())))
    ) {
      const task = nextTask(state.progress, new Date(), goal);
      if (task) {
        setSkillId(task.skillId);
        setMode(task.mode);
        setQuestionId(null);
        setFeedback(null);
        setHint(false);
        setOutput(null);
        chooseQuestion(task.skillId, task.mode);
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
          <a href="/lab">Try a project in the Python lab</a>
        </Button>
      </div>
    );
  if (!skill || !available)
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
  return (
    <>
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
      <Progress
        className="mb-6"
        value={(mode === 'review' ? reviewFraction : progress!.mastery) * 100}
        aria-label="Session progress"
      />
      <div className="lesson-meta">
        <Pill>
          {mode === 'review'
            ? 'SPACED REVIEW'
            : courses.find((c) => c.id === skill.courseId)?.title}
        </Pill>
        <span>
          {units.find((u) => u.id === skill.unitId)?.title} / {skill.title}
        </span>
      </div>
      {showingLesson ? (
        <Card className="gap-0 lesson-paper">
          <span className="page-eyebrow">A NEW PIECE OF THE PICTURE</span>
          <h1>{skill.title}</h1>
          <p className="lesson-summary">{skill.summary}</p>
          {skill.lesson.paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
          <CodeBlock
            code={skill.lesson.example.code}
            language={skill.lesson.example.kind === 'text' ? 'text' : 'python'}
            highlight={skill.lesson.example.kind !== 'text'}
            defaultWrap
            className="my-6"
          >
            <CodeBlockHeader>
              <CodeBlockTitle>
                {skill.lesson.example.label ??
                  (skill.lesson.example.kind === 'text'
                    ? 'Worked scenario'
                    : 'Python')}
              </CodeBlockTitle>
              <CodeBlockCopyButton className="ml-auto" />
            </CodeBlockHeader>
          </CodeBlock>
          <CodeBlock
            code={skill.lesson.example.output}
            language="text"
            highlight={false}
            defaultWrap
            className="mb-6"
          >
            <CodeBlockHeader>
              <CodeBlockTitle>
                {skill.lesson.example.kind === 'text' ? 'DECISION' : 'OUTPUT'}
              </CodeBlockTitle>
            </CodeBlockHeader>
          </CodeBlock>
          <p>{skill.lesson.example.explanation}</p>
          <div className="lesson-actions">
            <span>
              <CircleHelp size={16} />
              Read, then retrieve. That’s where learning happens.
            </span>
            <Btn onClick={startPractice}>
              Let’s try it <ArrowRight size={18} />
            </Btn>
          </div>
        </Card>
      ) : (
        question && (
          <Card className="gap-0 question-paper">
            <div className="question-top">
              <span className="page-eyebrow">
                {question.type === 'code'
                  ? 'PUT IT INTO PRACTICE'
                  : 'A MOMENT OF RETRIEVAL'}
              </span>
              <span>
                {mode === 'review'
                  ? Math.min(reviewCount, reviewPolicy.reviewAnswers)
                  : progress!.questionIds.length}{' '}
                /{' '}
                {mode === 'review'
                  ? assessmentPolicy(skill).reviewAnswers
                  : skill.questions.length}{' '}
                {mode === 'review' ? 'review checks' : 'learning checks'}
                {mode === 'review' &&
                  missingReviewTypes.length > 0 &&
                  ` · ${missingReviewTypes.join(' + ')} evidence required`}
              </span>
            </div>
            <h1>{question.prompt}</h1>
            {question.type === 'choice' && question.code && (
              <CodeBlock
                code={question.code}
                language="python"
                defaultWrap
                className="my-5"
              />
            )}
            {question.type === 'choice' ? (
              <div className="answer-options">
                {question.choices.map((choice, index) => (
                  <Button
                    variant="outline"
                    key={index}
                    onClick={() => setSelected(index)}
                    disabled={!!feedback}
                    aria-pressed={selected === index}
                    className={`answer-option h-auto w-full justify-start whitespace-normal py-4 text-left ${selected === index ? 'border-primary bg-primary/5' : ''} ${feedback && question.answer === index ? 'border-success bg-success/10' : ''} ${feedback && selected === index && !feedback.correct ? 'border-destructive bg-destructive/10' : ''}`}
                  >
                    <Badge variant="outline" className="shrink-0 font-mono">
                      {String.fromCharCode(65 + index)}
                    </Badge>
                    <pre>{choice}</pre>
                    {feedback && question.answer === index && (
                      <Check size={18} />
                    )}
                  </Button>
                ))}
              </div>
            ) : (
              <>
                <div className="editor-label">
                  <span>
                    <Code2 size={16} />
                    Your Python code
                  </span>
                  <small>Runs on your device</small>
                </div>
                <Suspense
                  fallback={
                    <div className="editor-loading">
                      Preparing the code editor…
                    </div>
                  }
                >
                  <CodeMirror
                    value={code}
                    extensions={[python()]}
                    height="230px"
                    onChange={setCode}
                    editable={!feedback && !running}
                    aria-label="Python code editor"
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
                        <AlertDescription>{output.error}</AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}
              </>
            )}
            {hint && (
              <Alert className="my-4 border-primary/20 bg-primary/5">
                <CircleHelp />
                <AlertDescription>
                  <p>{question.hint}</p>
                  <p className="mt-2 text-xs">
                    Practice with a hint helps you learn. An independent answer
                    earns XP and proves mastery.
                  </p>
                </AlertDescription>
              </Alert>
            )}
            {feedback && (
              <Alert
                className={`my-5 ${feedback.correct ? 'border-success/25 bg-success/5' : 'border-warning/40 bg-warning/10'}`}
                role="status"
              >
                <CheckCircle2 size={23} />
                <AlertDescription>
                  <strong>
                    {feedback.correct
                      ? hint
                        ? 'You’ve got the idea. Try it independently next.'
                        : mode === 'review'
                          ? progress!.reviewQuestionIds.length === 0 &&
                            progress!.dueAt &&
                            progress!.dueAt > Date.now()
                            ? 'Review complete. That connection is stronger.'
                            : 'Good retrieval. Keep this connection fresh.'
                          : progress!.mastery >= 1
                            ? 'Skill mastered. A new connection made.'
                            : 'That’s a small win.'
                      : 'A useful mistake. Let’s work through it.'}
                  </strong>
                  <p>{feedback.text}</p>
                  {!feedback.correct && question.type === 'code' && (
                    <Accordion type="single" collapsible className="mt-3">
                      <AccordionItem value="solution">
                        <AccordionTrigger>
                          Understand a worked solution
                        </AccordionTrigger>
                        <AccordionContent>
                          <CodeBlock
                            code={question.solution}
                            language="python"
                            defaultWrap
                          />
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  )}
                  {!feedback.correct && (
                    <small>A flashcard is saved to help this one stick.</small>
                  )}
                </AlertDescription>
              </Alert>
            )}
            <div className="question-actions">
              <Button
                variant="link"
                className="text-link"
                onClick={() => setHint(true)}
                disabled={running || hint || !!feedback}
              >
                <CircleHelp size={17} />
                Give me a hint
              </Button>
              {feedback ? (
                <Btn onClick={next}>
                  Continue <ArrowRight size={18} />
                </Btn>
              ) : question.type === 'choice' ? (
                <Btn
                  onClick={() => record(selected === question.answer)}
                  disabled={selected === null}
                >
                  Check answer <ArrowRight size={18} />
                </Btn>
              ) : (
                <Btn onClick={checkCode} disabled={running || !code.trim()}>
                  {running ? (
                    <>
                      <LoaderCircle className="spin" size={17} />
                      Running Python…
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
        )
      )}
      <div className="session-footnote">
        <GitBranch size={15} />
        Every skill is connected. Master this one to unlock the next.
      </div>
    </>
  );
}
