import { useEffect, useState } from 'react';
import {
  ArrowRight,
  Check,
  CheckCircle2,
  CircleX,
  ClipboardCheck,
  Timer,
  X,
} from 'lucide-react';
import { courses, skillById } from '../lib/catalog-index';
import { choiceLetter, choiceOrder } from '../lib/choice-order';
import { codeLanguage } from '../lib/code-language';
import {
  activeQuiz,
  answerQuiz,
  finishQuiz,
  quizDeadline,
  quizQuestion,
  quizStatus,
  startQuiz,
  type Quiz,
} from '../lib/quiz';
import { type LearnerState } from '../lib/state';
import { ChoiceText, InlineText } from './inline-text';
import { TypedAnswerInput } from './typed-answer';
import { acceptedAnswer, gradeTyped } from '../lib/typed-answer';
import type { AnswerQuestion } from '../lib/curriculum';
import { Btn, ContentLoading } from './shared';
import { useCourseContent } from './use-content';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { CodeBlock } from '@/components/reui/code-block/code-block';

const languageOf = (courseId: string) =>
  codeLanguage(courses.find((course) => course.id === courseId)?.language);

function clock(ms: number) {
  const seconds = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

/**
 * A timed quiz: one question at a time with no lesson material or feedback,
 * then the score and every question's result with its explanation.
 */
export default function QuizSession({
  state,
  update,
}: {
  state: LearnerState;
  update: (fn: (s: LearnerState) => LearnerState) => void;
}) {
  const params = new URLSearchParams(window.location.search);
  const requested = params.get('quiz');
  const courseId =
    courses.find((c) => c.id === params.get('course'))?.id ??
    courses.find((c) => c.id === state.activeCourseId)?.id ??
    courses[0].id;
  const [quizId, setQuizId] = useState<string | null>(
    requested && requested !== 'next' ? requested : null,
  );
  const [selected, setSelected] = useState<number | null>(null);
  const [response, setResponse] = useState('');
  const [invalid, setInvalid] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const quizzes = state.progress.quizzes ?? [];
  const running = activeQuiz(state.progress);
  const quiz: Quiz | undefined = quizId
    ? quizzes.find((item) => item.id === quizId)
    : running;
  // Keep showing this quiz once it ends, rather than the next one.
  useEffect(() => {
    if (!quizId && running) setQuizId(running.id);
  }, [quizId, running?.id]);
  const finished = quiz?.completedAt !== undefined;
  // Questions and explanations are lesson content, loaded per course.
  const content = useCourseContent(
    (quiz?.questions ?? []).map((slot) => skillById[slot.skillId]?.courseId),
  );
  useEffect(() => {
    if (!quiz || finished) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [quiz?.id, finished]);
  useEffect(() => {
    if (quiz && !finished && now >= quizDeadline(quiz))
      update((s) => ({
        ...s,
        progress: finishQuiz(s.progress, quiz.id, Date.now()),
      }));
  }, [now, quiz?.id, finished]);

  if (!quiz) {
    const status = quizStatus(state.progress, courseId);
    if (status.kind !== 'available')
      return (
        <div className="empty-state">
          <ClipboardCheck size={38} />
          <h1>No quiz yet</h1>
          <p>
            {status.kind === 'waiting'
              ? `Your next quiz unlocks after ${status.xpToGo} more XP of lessons and reviews.`
              : 'Quizzes draw on skills you have mastered in this course. Master a few more first.'}
          </p>
          <Button asChild>
            <a href="/">
              Back to Learn <ArrowRight size={16} />
            </a>
          </Button>
        </div>
      );
    const minutes = Math.round((status.questions * 90) / 60);
    return (
      <div className="lesson-workspace lesson-page">
        <QuizHeading title={`Quiz ${status.number}`} />
        <Card className="lesson-paper lesson-intro gap-0">
          <section aria-label="Quiz instructions" className="lesson-section">
            <p className="lesson-teaching-text">
              {status.questions} questions from skills you have learned, up to{' '}
              {status.xp} XP. You have {minutes} minutes.
            </p>
            <p className="lesson-teaching-text">
              Lessons and explanations stay hidden until you finish. Any skill
              you miss comes back as a review right away.
            </p>
          </section>
          <div className="lesson-actions">
            <span>
              {status.questions} questions · {minutes} min
            </span>
            <Btn
              onClick={() =>
                update((s) => ({
                  ...s,
                  progress: startQuiz(s.progress, courseId, Date.now()),
                }))
              }
            >
              Start quiz <ArrowRight size={16} />
            </Btn>
          </div>
        </Card>
      </div>
    );
  }

  if (!content.ready)
    return <ContentLoading error={content.error} retry={content.retry} />;
  if (finished) return <QuizResults quiz={quiz} />;

  const index = quiz.questions.findIndex((slot) => slot.answer === undefined);
  const slot = quiz.questions[index];
  const found = slot && quizQuestion(slot);
  if (!slot || !found) return <QuizResults quiz={quiz} />;
  const { skill, question } = found;
  const order =
    question.type === 'choice' ? choiceOrder(question, slot.presentation) : [];
  const remaining = quizDeadline(quiz) - now;
  function submit() {
    let answer: number | string;
    if (question.type === 'choice') {
      if (selected === null) return;
      answer = selected;
    } else {
      const grade = gradeTyped(question, response);
      if (grade.status === 'invalid') {
        setInvalid(grade.message);
        return;
      }
      answer = response;
    }
    setSelected(null);
    setResponse('');
    setInvalid(null);
    update((s) => ({
      ...s,
      progress: answerQuiz(s.progress, quiz!.id, index, answer, Date.now()),
    }));
  }
  return (
    <div className="lesson-workspace lesson-page">
      <div className="session-top">
        <Button asChild variant="link" className="h-auto justify-start p-0">
          <a href="/">
            <X size={18} />
            Leave quiz
          </a>
        </Button>
        <span role="timer" aria-label="Time left">
          <Timer size={16} />
          {clock(remaining)} left
        </span>
      </div>
      <QuizHeading title={`Quiz ${quiz.number}`} />
      <Card className="gap-0 question-paper">
        <div className="question-top">
          <span className="page-eyebrow">
            Question {index + 1} of {quiz.questions.length}
          </span>
        </div>
        <h1>
          <InlineText text={question.prompt} />
        </h1>
        {question.code && (
          <CodeBlock
            code={question.code}
            language={languageOf(skill.courseId)}
            defaultWrap
            className="my-5"
          />
        )}
        {question.type === 'choice' ? (
          <div className="answer-options" role="group" aria-label="Choices">
            {order.map((choice, position) => (
              <Button
                variant="outline"
                key={choice}
                data-choice={choice}
                onClick={() => setSelected(choice)}
                aria-pressed={selected === choice}
                className={`answer-option h-auto w-full justify-start whitespace-normal py-4 text-left ${selected === choice ? 'border-primary bg-primary/5' : ''}`}
              >
                <Badge variant="outline" className="shrink-0 font-mono">
                  {choiceLetter(position)}
                </Badge>
                <pre>
                  <ChoiceText question={question} index={choice} />
                </pre>
              </Button>
            ))}
          </div>
        ) : (
          <TypedAnswerInput
            key={`${quiz.id}-${index}`}
            question={question}
            value={response}
            error={invalid}
            onChange={(value) => {
              setResponse(value);
              setInvalid(null);
            }}
            onSubmit={submit}
          />
        )}
        <div className="question-actions">
          <Btn
            disabled={
              question.type === 'choice' ? selected === null : !response.trim()
            }
            onClick={submit}
          >
            Submit
          </Btn>
        </div>
      </Card>
    </div>
  );
}

function QuizHeading({ title }: { title: string }) {
  return (
    <header className="lesson-heading">
      <h1>{title}</h1>
      <div className="lesson-session-stats">
        <Badge variant="secondary">Quiz</Badge>
      </div>
    </header>
  );
}

function QuizResults({ quiz }: { quiz: Quiz }) {
  const correct = quiz.questions.filter((slot) => slot.correct).length;
  const missed = [
    ...new Set(
      quiz.questions
        .filter((slot) => !slot.correct)
        .map((slot) => quizQuestion(slot)?.skill.title)
        .filter(Boolean),
    ),
  ];
  return (
    <div className="lesson-workspace lesson-page">
      <QuizHeading title={`Quiz ${quiz.number}`} />
      <Card className="lesson-paper quiz-score gap-0" role="status">
        <h2>
          {correct} of {quiz.questions.length} correct
        </h2>
        <p>
          {quiz.earned ?? 0}/{quiz.possible} XP
        </p>
        {missed.length > 0 && <p>Due for review now: {missed.join(', ')}.</p>}
        <Button asChild className="self-start">
          <a href="/">
            Back to Learn <ArrowRight size={16} />
          </a>
        </Button>
      </Card>
      <ol className="quiz-results" aria-label="Question results">
        {quiz.questions.map((slot, index) => {
          const found = quizQuestion(slot);
          if (!found) return null;
          const { question } = found;
          return (
            <li key={`${slot.questionId}-${index}`}>
              <Card
                className={`lesson-paper quiz-result gap-0 ${slot.correct ? 'is-correct' : 'is-incorrect'}`}
              >
                <p className="quiz-result-status">
                  {slot.correct ? (
                    <CheckCircle2 size={18} aria-hidden="true" />
                  ) : (
                    <CircleX size={18} aria-hidden="true" />
                  )}
                  Question {index + 1}: {slot.correct ? 'Correct' : 'Incorrect'}
                </p>
                <h3>
                  <InlineText text={question.prompt} />
                </h3>
                {question.code && (
                  <CodeBlock
                    code={question.code}
                    language={languageOf(found.skill.courseId)}
                    defaultWrap
                  />
                )}
                <p>
                  Your answer:{' '}
                  {slot.answer === null || slot.answer === undefined ? (
                    'No answer (time ran out)'
                  ) : (
                    <AnswerText question={question} answer={slot.answer} />
                  )}
                </p>
                {!slot.correct && (
                  <p>
                    <Check size={15} aria-hidden="true" /> Correct answer:{' '}
                    <AnswerText question={question} />
                  </p>
                )}
                <p className="lesson-teaching-text">
                  <InlineText text={question.explanation} />
                </p>
              </Card>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/** A chosen or typed answer as text; without `answer`, the correct one. */
function AnswerText({
  question,
  answer,
}: {
  question: AnswerQuestion;
  answer?: number | string;
}) {
  if (question.type === 'choice')
    return (
      <ChoiceText
        question={question}
        index={typeof answer === 'number' ? answer : question.answer}
      />
    );
  const text = typeof answer === 'string' ? answer : acceptedAnswer(question);
  const unit = question.type === 'numeric' && question.unit;
  return (
    <code className="typed-answer-text">
      {text}
      {unit ? ` ${unit}` : ''}
    </code>
  );
}
