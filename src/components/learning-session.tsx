import { useEffect, useRef, useState, lazy, Suspense } from 'react';
import {
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  CircleHelp,
  ChevronRight,
  Code2,
  GitBranch,
  LoaderCircle,
  Lightbulb,
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
  assessmentPolicy,
} from '../lib/curriculum';
import {
  getSkillState,
  isUnlocked,
  nextTask,
  recordLesson,
  selectQuestion,
} from '../lib/learning';
import { type PythonResult } from '../lib/python';
import { runCode } from '../lib/code-runner';
import {
  codeLanguage,
  codeLanguageLabels,
  editorLanguage,
} from '../lib/code-language';
import { recordLearningAnswer, type LearnerState } from '../lib/state';
import { Btn } from './shared';
import LessonPlayer, { lessonIntroductionCount } from './lesson-player';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  const [questionId, setQuestionId] = useState<string | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [code, setCode] = useState('');
  const [feedback, setFeedback] = useState<{
    correct: boolean;
    text: string;
  } | null>(null);
  const [hint, setHint] = useState(false);
  const [referenceUsed, setReferenceUsed] = useState(false);
  const [running, setRunning] = useState(false);
  const [output, setOutput] = useState<PythonResult | null>(null);
  const [lessonOpen, setLessonOpen] = useState(false);
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
  useEffect(() => {
    setLessonOpen(false);
    setSlideIndex(0);
  }, [skillId]);
  const skill = skillById[skillId];
  const courseLanguage = codeLanguage(
    courses.find((course) => course.id === skill?.courseId)?.language,
  );
  const progress = skill ? getSkillState(state.progress, skillId) : null;
  const available = skill && isUnlocked(state.progress, skillId);
  const question = skill?.questions.find((q) => q.id === questionId);
  const language =
    question?.type === 'code'
      ? codeLanguage(question.language)
      : courseLanguage;
  const showingLesson =
    skill && (lessonOpen || (!progress?.lessonSeen && mode === 'learn'));
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
    setReferenceUsed(false);
    setOutput(null);
  }
  useEffect(() => {
    if (skill && !showingLesson && !questionId) chooseQuestion();
  }, [skillId, showingLesson]);
  function startPractice() {
    if (!progress?.lessonSeen && mode === 'learn') {
      update((s) => ({ ...s, progress: recordLesson(s.progress, skillId) }));
    }
    if (!question) {
      chooseQuestion();
    }
    setLessonOpen(false);
  }
  function openLesson(index = 0) {
    if (running) return;
    // Looking up teaching material during an unanswered assessment is help.
    // Keep its answer, editor buffer, and assisted status when returning.
    if (question && !feedback && (progress?.lessonSeen || mode === 'review')) {
      setHint(true);
      setReferenceUsed(true);
    }
    setSlideIndex(index);
    setLessonOpen(true);
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
    const p = getSkillState(state.progress, skillId);
    if (
      (mode === 'learn' && p.mastery >= 1) ||
      (mode === 'review' &&
        (!params.get('skill') ||
          p.mastery < 1 ||
          (p.reviewQuestionIds.length === 0 &&
            p.dueAt &&
            p.dueAt > Date.now())))
    ) {
      const task = nextTask(state.progress, new Date(), goal);
      if (
        task &&
        !(params.get('mode') === 'review' && task.mode !== 'review')
      ) {
        setSkillId(task.skillId);
        setMode(task.mode);
        setQuestionId(null);
        setSelected(null);
        setCode('');
        setFeedback(null);
        setHint(false);
        setReferenceUsed(false);
        setOutput(null);
        setLessonOpen(false);
        setSlideIndex(0);
        if (
          task.mode !== 'learn' ||
          getSkillState(state.progress, task.skillId).lessonSeen
        ) {
          chooseQuestion(task.skillId, task.mode);
        }
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
        <p>Prerequisites give every new idea somewhere to land.</p>
        <Button asChild variant="default">
          <a href="/graph">
            Explore the knowledge graph <ArrowRight size={18} />
          </a>
        </Button>
      </div>
    );
  return (
    <div className="lesson-workspace">
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
      <header className="lesson-banner">
        <div>
          <div className="lesson-course-path">
            <span>{courses.find((c) => c.id === skill.courseId)?.title}</span>
            <ChevronRight size={13} />
            <span>{units.find((u) => u.id === skill.unitId)?.title}</span>
          </div>
          <strong>{skill.title}</strong>
        </div>
        <div className="lesson-session-stats">
          {skill.stage && (
            <Badge variant="secondary">
              Step {skill.stage} of {skill.stageCount}
            </Badge>
          )}
          <Badge variant="secondary">
            {mode === 'review' ? 'Spaced review' : 'Learn'}
          </Badge>
        </div>
      </header>
      <div className="lesson-workspace-grid">
        <div className="lesson-stage">
          <Tabs
            className="lesson-mode-tabs"
            value={showingLesson ? 'lesson' : 'practice'}
            onValueChange={(value) =>
              value === 'lesson' ? openLesson() : startPractice()
            }
          >
            <TabsList aria-label="Lesson mode">
              <TabsTrigger value="lesson" disabled={running}>
                <BookOpen size={15} /> Lesson
              </TabsTrigger>
              <TabsTrigger value="practice" disabled={running}>
                <CheckCircle2 size={15} /> Practice
              </TabsTrigger>
            </TabsList>
            <TabsContent value="lesson">
              {showingLesson && (
                <LessonPlayer
                  skill={skill}
                  slideIndex={slideIndex}
                  onSlideChange={setSlideIndex}
                  onPractice={startPractice}
                  returningToPractice={!!question}
                />
              )}
            </TabsContent>
            <TabsContent value="practice">
              {question && (
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
                      language={courseLanguage}
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
                          <Badge
                            variant="outline"
                            className="shrink-0 font-mono"
                          >
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
                          <div className="editor-loading">
                            Preparing the code editor…
                          </div>
                        }
                      >
                        <CodeMirror
                          value={code}
                          extensions={[editorLanguage(language)]}
                          height="230px"
                          onChange={setCode}
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
                  {hint && (
                    <Alert className="my-4 border-primary/20 bg-primary/5">
                      <CircleHelp />
                      <AlertDescription>
                        <p>
                          {referenceUsed
                            ? 'You opened lesson material for this question. Try it again without help to prove the skill.'
                            : question.hint}
                        </p>
                        <p className="mt-2 text-xs">
                          Help supports practice. An independent answer earns XP
                          and proves mastery.
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
                                  language={language}
                                  defaultWrap
                                />
                              </AccordionContent>
                            </AccordionItem>
                          </Accordion>
                        )}
                        {!feedback.correct && (
                          <small>
                            A flashcard is saved to help this one stick.
                          </small>
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
                      <Btn
                        onClick={checkCode}
                        disabled={running || !code.trim()}
                      >
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
              )}
            </TabsContent>
          </Tabs>
        </div>
        <Card className="lesson-outline gap-0">
          <h2>In this lesson</h2>
          <nav className="lesson-outline-nav" aria-label="Lesson outline">
            <Button
              variant="ghost"
              className="lesson-outline-step"
              onClick={() => openLesson(0)}
              disabled={running}
              aria-current={
                showingLesson && slideIndex < lessonIntroductionCount(skill)
                  ? 'step'
                  : undefined
              }
            >
              <BookOpen size={17} />
              <span>Introduction</span>
            </Button>
            <Button
              variant="ghost"
              className="lesson-outline-step"
              onClick={() => openLesson(lessonIntroductionCount(skill))}
              disabled={running}
              aria-current={
                showingLesson && slideIndex >= lessonIntroductionCount(skill)
                  ? 'step'
                  : undefined
              }
            >
              <Lightbulb size={17} />
              <span>
                {skill.lesson.example.kind === 'text'
                  ? 'Worked scenario'
                  : 'Worked example'}
              </span>
            </Button>
            <Button
              variant="ghost"
              className="lesson-outline-step"
              onClick={startPractice}
              disabled={running}
              aria-current={!showingLesson ? 'step' : undefined}
            >
              <CheckCircle2 size={17} />
              <span>Practice</span>
            </Button>
          </nav>
          <div className="lesson-context-bar">
            <span>
              {mode === 'review' ? 'Review evidence' : 'Mastery checks'}
            </span>
            <strong>
              {mode === 'review' ? reviewCount : progress!.questionIds.length} /{' '}
              {mode === 'review'
                ? reviewPolicy.reviewAnswers
                : skill.questions.length}
            </strong>
          </div>
          <Progress
            value={
              (mode === 'review' ? reviewFraction : progress!.mastery) * 100
            }
            aria-label="Session progress"
          />
          <ol className="lesson-evidence-list">
            {skill.questions.map((item, index) => {
              const earned = (
                mode === 'review'
                  ? progress!.reviewQuestionIds
                  : progress!.questionIds
              ).includes(item.id);
              const current = !showingLesson && questionId === item.id;
              return (
                <li
                  key={item.id}
                  className={`lesson-evidence-item ${earned ? 'is-complete' : ''} ${current ? 'is-current' : ''}`}
                  aria-current={current ? 'step' : undefined}
                >
                  <span>{earned ? <Check size={13} /> : index + 1}</span>
                  <span>
                    {item.type === 'code'
                      ? 'Write the code'
                      : `Check ${index + 1}`}
                  </span>
                  <small>
                    {earned ? 'Proven' : current ? 'Current' : 'Not proven'}
                  </small>
                </li>
              );
            })}
          </ol>
          <p className="lesson-outline-note">
            Correct, independent answers prove this skill. Reading and worked
            examples help you prepare.
          </p>
          {!showingLesson && question && !feedback && (
            <p className="lesson-outline-note">
              Opening the lesson or example counts as help for your current
              answer.
            </p>
          )}
          <Button asChild variant="link" className="lesson-connection">
            <a href={`/graph?skill=${skill.id}&course=${goal}`}>
              <GitBranch size={15} /> View prerequisites
            </a>
          </Button>
        </Card>
      </div>
      <div className="session-footnote">
        <GitBranch size={15} />
        Every skill is connected. Master this one to unlock the next.
      </div>
    </div>
  );
}
