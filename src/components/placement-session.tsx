import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Compass, X } from 'lucide-react';
import { courses } from '../lib/curriculum';
import { choiceLetter, choiceOrder } from '../lib/choice-order';
import { codeLanguage } from '../lib/code-language';
import { formatMonthYear } from '../lib/dashboard';
import {
  activeDiagnostic,
  answerDiagnostic,
  DIAGNOSTIC_MAX_QUESTIONS,
  diagnosticProgress,
  diagnosticQuestion,
  placementReport,
  startDiagnostic,
  type Diagnostic,
} from '../lib/placement';
import { type LearnerState } from '../lib/state';
import { ChoiceText, InlineText } from './inline-text';
import { Btn } from './shared';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CodeBlock } from '@/components/reui/code-block/code-block';

const languageOf = (courseId: string) =>
  codeLanguage(courses.find((course) => course.id === courseId)?.language);
const SHOWN_SKILLS = 8;

/**
 * An optional, adaptive placement test for one course: questions without
 * feedback, then a report of what was placed and where learning starts.
 */
export default function PlacementSession({
  state,
  update,
}: {
  state: LearnerState;
  update: (fn: (s: LearnerState) => LearnerState) => void;
}) {
  const params = new URLSearchParams(window.location.search);
  const course =
    courses.find((c) => c.id === params.get('placement')) ??
    courses.find((c) => c.id === state.activeCourseId) ??
    courses[0];
  const [diagnosticId, setDiagnosticId] = useState<string | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const shownAt = useRef(Date.now());
  const running = activeDiagnostic(state.progress);
  const diagnostic: Diagnostic | undefined = diagnosticId
    ? state.progress.diagnostics?.find((item) => item.id === diagnosticId)
    : running?.courseId === course.id
      ? running
      : undefined;
  // Keep showing this test once it ends, for its report.
  useEffect(() => {
    if (!diagnosticId && diagnostic) setDiagnosticId(diagnostic.id);
  }, [diagnosticId, diagnostic?.id]);
  const questionKey = diagnostic?.current
    ? `${diagnostic.current.questionId}-${diagnostic.answers.length}`
    : '';
  useEffect(() => {
    shownAt.current = Date.now();
    setSelected(null);
  }, [questionKey]);

  if (!diagnostic)
    return (
      <div className="lesson-workspace lesson-page">
        <PlacementHeading title={`Placement test: ${course.title}`} />
        <Card className="lesson-paper lesson-intro gap-0">
          <section
            aria-label="Placement instructions"
            className="lesson-section"
          >
            <p className="lesson-teaching-text">
              Already know some of this? Answer questions from {course.title}{' '}
              and the courses it builds on, and skip the lessons you can already
              do. The test adapts to your answers and takes at most{' '}
              {DIAGNOSTIC_MAX_QUESTIONS} questions; you will not see whether
              each answer is right.
            </p>
            <p className="lesson-teaching-text">
              Skills you place out of unlock what comes next and come back as
              short reviews over the next few days. Placement earns no XP, and
              you can stop and resume at any time.
            </p>
          </section>
          <div className="lesson-actions">
            <Button asChild variant="outline">
              <a href="/">Skip: start from the beginning</a>
            </Button>
            <Btn
              onClick={() =>
                update((s) => ({
                  ...s,
                  activeCourseId: course.id,
                  progress: startDiagnostic(s.progress, course.id, Date.now()),
                }))
              }
            >
              Start placement test <ArrowRight size={16} />
            </Btn>
          </div>
        </Card>
      </div>
    );

  if (diagnostic.completedAt !== undefined)
    return <PlacementResult state={state} diagnostic={diagnostic} />;

  const found = diagnostic.current && diagnosticQuestion(diagnostic.current);
  if (!found) return <PlacementResult state={state} diagnostic={diagnostic} />;
  const { skill, question } = found;
  const order = choiceOrder(question, diagnostic.current!.presentation);
  const settled = Math.round(
    diagnosticProgress(state.progress, diagnostic) * 100,
  );
  return (
    <div className="lesson-workspace lesson-page">
      <div className="session-top">
        <Button asChild variant="link" className="h-auto justify-start p-0">
          <a href="/">
            <X size={18} />
            Stop for now
          </a>
        </Button>
        <span>Question {diagnostic.answers.length + 1}</span>
      </div>
      <PlacementHeading title={`Placement test: ${course.title}`} />
      <div className="placement-progress">
        <Progress value={settled} aria-label="Placement progress" />
        <span>{settled}% of the course placed</span>
      </div>
      <Card className="gap-0 question-paper">
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
        <div className="question-actions">
          <Btn
            disabled={selected === null}
            onClick={() => {
              if (selected === null) return;
              const answer = selected;
              const elapsed = Date.now() - shownAt.current;
              setSelected(null);
              update((s) => ({
                ...s,
                progress: answerDiagnostic(
                  s.progress,
                  diagnostic.id,
                  answer,
                  Date.now(),
                  elapsed,
                ),
              }));
            }}
          >
            Submit
          </Btn>
        </div>
      </Card>
    </div>
  );
}

function PlacementHeading({ title }: { title: string }) {
  return (
    <header className="lesson-heading">
      <h1>{title}</h1>
      <div className="lesson-session-stats">
        <Badge variant="secondary">Placement</Badge>
      </div>
    </header>
  );
}

function SkillList({ label, items }: { label: string; items: string[] }) {
  if (!items.length) return null;
  const shown = items.slice(0, SHOWN_SKILLS);
  return (
    <section aria-label={label} className="placement-list">
      <h2>{label}</h2>
      <ul>
        {shown.map((title) => (
          <li key={title}>{title}</li>
        ))}
        {items.length > shown.length && (
          <li className="ma-muted">and {items.length - shown.length} more</li>
        )}
      </ul>
    </section>
  );
}

function PlacementResult({
  state,
  diagnostic,
}: {
  state: LearnerState;
  diagnostic: Diagnostic;
}) {
  const report = placementReport(state.progress, diagnostic, state.dailyGoal);
  const course = courses.find((item) => item.id === diagnostic.courseId);
  return (
    <div className="lesson-workspace lesson-page">
      <PlacementHeading title={`Placement test: ${course?.title ?? ''}`} />
      <Card className="lesson-paper placement-report gap-0" role="status">
        <Compass size={28} aria-hidden="true" />
        <h2>
          You placed out of {report.placed.length} skill
          {report.placed.length === 1 ? '' : 's'}
        </h2>
        <p>
          {diagnostic.answers.length} questions answered.{' '}
          {report.placed.length
            ? 'They count as learned and come back as short reviews over the next few days; missing one sends it back to its lesson.'
            : 'You start from the beginning of the course.'}
        </p>
        <p>
          {report.estimate.status === 'estimated'
            ? `At your daily goal of ${state.dailyGoal} XP, you are on track to finish in ${formatMonthYear(report.estimate.dateKey)}.`
            : report.estimate.status === 'complete'
              ? 'Every lesson in this course is complete.'
              : 'Set a daily XP goal to estimate a finish date.'}
        </p>
        <Button asChild className="self-start">
          <a href="/">
            Start learning <ArrowRight size={16} />
          </a>
        </Button>
      </Card>
      <SkillList
        label="Where you start"
        items={report.frontier.map((skill) => skill.title)}
      />
      <SkillList
        label="Foundations from supporting courses"
        items={report.supporting.map(
          (skill) =>
            `${skill.title} (${courses.find((c) => c.id === skill.courseId)?.title ?? ''})`,
        )}
      />
      <SkillList
        label="Placed out of"
        items={report.placed.map((skill) => skill.title)}
      />
    </div>
  );
}
