import { useId, useMemo, useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { courses, skillById, type Course } from '../lib/curriculum';
import {
  courseMastery,
  estimateCompletion,
  formatClockTime,
  formatDayHeading,
  formatMonthYear,
  groupByDay,
  quizTask,
  taskHistory,
  taskQueue,
  todayXp,
  weekXp,
  type DashboardTask,
  type HistoryEntry,
  type QuizTask,
  type WeekDay,
} from '../lib/dashboard';
import { type LearnerState } from '../lib/state';
import { ProgressRing } from './progress-ring';

const courseTitle = (id: string) =>
  courses.find((course) => course.id === id)?.title ?? '';
const HISTORY_PAGE = 20;

export function Dashboard({ state }: { state: LearnerState }) {
  const course =
    courses.find((c) => c.id === state.activeCourseId) ?? courses[0];
  const { progress, dailyGoal } = state;
  const view = useMemo(() => {
    const now = Date.now();
    return {
      mastery: courseMastery(progress, course),
      estimate: estimateCompletion(progress, dailyGoal, course.id, now),
      tasks: taskQueue(progress, course.id, now),
      quiz: quizTask(progress, course.id),
      today: todayXp(progress, now),
      week: weekXp(progress, now),
      history: taskHistory(progress),
    };
  }, [progress, dailyGoal, course]);
  // undefined follows the first task; null means every card is collapsed.
  const [selected, setSelected] = useState<string | null | undefined>();
  const open =
    selected === null
      ? null
      : view.tasks.some((task) => task.skill.id === selected)
        ? selected
        : (view.tasks[0]?.skill.id ?? null);
  return (
    <>
      <h1 className="sr-only">Learn</h1>
      <div className="ma-dashboard">
        <aside className="ma-progress-column" aria-label="Progress">
          <CourseCard
            course={course}
            percent={view.mastery.percent}
            estimate={view.estimate}
          />
          <XpCard
            total={progress.totalXp}
            today={view.today}
            goal={dailyGoal}
            week={view.week}
          />
        </aside>
        <div className="ma-task-column">
          <section aria-labelledby="tasks-heading">
            <h2 id="tasks-heading" className="sr-only">
              Tasks
            </h2>
            {!progress.attempts.length && !progress.diagnostics?.length && (
              <div className="ma-panel ma-task ma-placement-offer">
                <h3>Already know some of {course.title}?</h3>
                <p className="ma-muted">
                  An optional placement test skips the lessons you can already
                  do. Or start from the beginning with the first lesson below.
                </p>
                <Button asChild size="sm" variant="outline">
                  <a href={`/learn?placement=${course.id}`}>
                    Take the placement test
                  </a>
                </Button>
              </div>
            )}
            {view.tasks.length || view.quiz ? (
              <ol className="ma-task-list">
                {view.quiz && (
                  <li>
                    <QuizCard quiz={view.quiz} activeCourseId={course.id} />
                  </li>
                )}
                {view.tasks.map((task) => (
                  <li key={task.skill.id}>
                    <TaskCard
                      task={task}
                      activeCourseId={course.id}
                      open={open === task.skill.id}
                      toggle={() =>
                        setSelected(
                          open === task.skill.id ? null : task.skill.id,
                        )
                      }
                    />
                  </li>
                ))}
              </ol>
            ) : (
              <div className="ma-panel ma-task ma-empty-tasks">
                <CheckCircle2 size={20} aria-hidden="true" />
                <div>
                  <h3>
                    {view.estimate.status === 'complete'
                      ? 'Course complete'
                      : 'No tasks right now'}
                  </h3>
                  <p>
                    Reviews appear here when they are due.{' '}
                    <a href="/courses">Choose another course</a>
                  </p>
                </div>
              </div>
            )}
          </section>
          <History
            entries={view.history}
            timeZone={progress.timeZone}
            activeCourseId={course.id}
          />
        </div>
      </div>
    </>
  );
}

function CourseCard({
  course,
  percent,
  estimate,
}: {
  course: Course;
  percent: number;
  estimate: ReturnType<typeof estimateCompletion>;
}) {
  return (
    <section
      className="ma-panel ma-course-card"
      aria-labelledby="active-course-name"
    >
      <div className="ma-course-card-top">
        <h2 id="active-course-name">
          <a href={`/courses?course=${course.id}`}>{course.title}</a>
        </h2>
        <ProgressRing value={percent} label="Course progress" />
      </div>
      <p className="ma-estimate">
        {estimate.status === 'estimated' ? (
          <>Estimated completion is {formatMonthYear(estimate.dateKey)}</>
        ) : estimate.status === 'complete' ? (
          'Course complete'
        ) : (
          <>
            <a href="/settings">Set a daily XP goal</a> to estimate completion
          </>
        )}
      </p>
    </section>
  );
}

/** Round the axis up to 1, 2, 4, 5, or 10 times a power of ten. */
function axisMax(value: number) {
  const target = Math.max(10, value);
  const step = 10 ** Math.floor(Math.log10(target));
  return [1, 2, 4, 5, 10].map((n) => n * step).find((n) => n >= target)!;
}

function XpCard({
  total,
  today,
  goal,
  week,
}: {
  total: number;
  today: number;
  goal: number;
  week: WeekDay[];
}) {
  const weekTotal = week.reduce((sum, day) => sum + day.xp, 0);
  const max = axisMax(Math.max(goal, ...week.map((day) => day.xp)));
  return (
    <section className="ma-panel ma-xp-card" aria-label="XP">
      <div className="ma-xp-block ma-xp-total">
        <h3 className="ma-label">Total earned</h3>
        <strong>{total.toLocaleString('en-US')} XP</strong>
      </div>
      <div className="ma-xp-block">
        <h3 className="ma-label">Today</h3>
        <div className="ma-today">
          <Progress
            value={goal > 0 ? Math.min(100, (today / goal) * 100) : 0}
            aria-label="Daily XP goal"
            className="h-2"
          />
          <span>
            {today}/{goal} XP
          </span>
        </div>
      </div>
      <div className="ma-xp-block">
        <div className="ma-week-heading">
          <h3 className="ma-label">This week</h3>
          <strong>{weekTotal} XP</strong>
        </div>
        <div className="week-chart" aria-hidden="true">
          <div className="week-axis">
            <span>{max}</span>
            <span>{max / 2}</span>
            <span>0</span>
          </div>
          <div className="week-plot">
            {week.map((day) => (
              <div
                key={day.key}
                className={`week-column ${day.today ? 'is-today' : ''}`}
                title={`${formatDayHeading(day.key)}: ${day.xp} XP`}
              >
                {day.xp > 0 && (
                  <span
                    className="week-bar"
                    style={{
                      height: `${Math.min(100, (day.xp / max) * 100)}%`,
                    }}
                  />
                )}
              </div>
            ))}
          </div>
          <span />
          <div className="week-days">
            {week.map((day) => (
              <span key={day.key} className={day.today ? 'is-today' : ''}>
                {day.label}
              </span>
            ))}
          </div>
        </div>
        <ul className="sr-only">
          {week
            .filter((day) => !day.future)
            .map((day) => (
              <li key={day.key}>
                {formatDayHeading(day.key)}: {day.xp} XP
              </li>
            ))}
        </ul>
      </div>
    </section>
  );
}

type TaskKind = 'learn' | 'review' | 'quiz' | 'assessment';
const taskLabels: Record<TaskKind, string> = {
  learn: 'Lesson',
  review: 'Review',
  quiz: 'Quiz',
  assessment: 'Assessment',
};

function TaskType({ mode }: { mode: TaskKind }) {
  return (
    <span className="ma-task-type">
      {mode === 'review' ? (
        <RotateCcw size={15} aria-hidden="true" />
      ) : mode === 'learn' ? (
        <BookOpen size={15} aria-hidden="true" />
      ) : (
        <ClipboardCheck size={15} aria-hidden="true" />
      )}
      {taskLabels[mode]}
    </span>
  );
}

/** A quiz is earned by recent work and checks it without lesson material. */
function QuizCard({
  quiz,
  activeCourseId,
}: {
  quiz: QuizTask;
  activeCourseId: string;
}) {
  const minutes = Math.round((quiz.questions * 90) / 60);
  return (
    <article className="ma-panel ma-task ma-quiz-task is-open">
      <h3>
        <span className="ma-task-toggle">
          <span className="ma-task-meta">
            <TaskType mode="quiz" />
            <span className="ma-task-xp">{quiz.xp} XP</span>
          </span>
          <span className="ma-task-title">Quiz {quiz.number}</span>
        </span>
      </h3>
      <div className="ma-task-detail">
        <p className="ma-muted">
          {quiz.questions} questions from skills you have learned · {minutes}{' '}
          minute limit. Lessons and explanations stay hidden until you finish.
        </p>
        <Button asChild className="ma-task-action">
          <a href={`/learn?quiz=next&course=${activeCourseId}`}>
            {quiz.started ? 'Resume quiz' : 'Start quiz'}
          </a>
        </Button>
      </div>
    </article>
  );
}

function TaskCard({
  task,
  activeCourseId,
  open,
  toggle,
}: {
  task: DashboardTask;
  activeCourseId: string;
  open: boolean;
  toggle: () => void;
}) {
  const id = useId();
  const { skill, mode } = task;
  const percent = Math.round(task.progress * 100);
  return (
    <article className={`ma-panel ma-task ${open ? 'is-open' : ''}`}>
      <h3>
        <button
          type="button"
          className="ma-task-toggle"
          aria-expanded={open}
          aria-controls={`${id}-detail`}
          onClick={toggle}
        >
          <span className="ma-task-meta">
            <TaskType mode={mode} />
            <span className="ma-task-xp">{task.xp} XP</span>
          </span>
          {skill.courseId !== activeCourseId && (
            <span className="ma-course-label">
              {courseTitle(skill.courseId)}
            </span>
          )}
          <span className="ma-task-title">{skill.title}</span>
        </button>
      </h3>
      {open && (
        <div id={`${id}-detail`} className="ma-task-detail">
          <div className="ma-task-progress">
            <Progress
              value={percent}
              aria-label={`${skill.title} progress`}
              className="h-2"
            />
            <span>{percent}%</span>
          </div>
          <h4 className="ma-label">Prerequisites</h4>
          {skill.prerequisites.length ? (
            <ul className="ma-prerequisites">
              {skill.prerequisites.map((prerequisite) => (
                <li key={prerequisite}>
                  <CheckCircle2 size={15} aria-hidden="true" />
                  <a href={`/graph?skill=${prerequisite}`}>
                    {skillById[prerequisite]?.title ?? prerequisite}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="ma-muted">None</p>
          )}
          <Button asChild className="ma-task-action">
            <a
              href={`/learn?skill=${skill.id}&mode=${mode}&course=${activeCourseId}`}
            >
              {task.started ? 'Resume' : 'Start'}
            </a>
          </Button>
        </div>
      )}
    </article>
  );
}

function History({
  entries,
  timeZone,
  activeCourseId,
}: {
  entries: HistoryEntry[];
  timeZone: string;
  activeCourseId: string;
}) {
  const [limit, setLimit] = useState(HISTORY_PAGE);
  const days = groupByDay(entries.slice(0, limit), timeZone);
  return (
    <section className="ma-history" aria-labelledby="history-heading">
      <h2 id="history-heading" className="sr-only">
        History
      </h2>
      {!entries.length && (
        <p className="ma-muted">Completed lessons and reviews appear here.</p>
      )}
      {days.map((day) => (
        <div key={day.key} className="ma-history-day">
          <h3 className="ma-history-date">{formatDayHeading(day.key)}</h3>
          <ul className="ma-history-list">
            {day.entries.map((entry) => (
              <li key={entry.id} className="ma-panel ma-history-item">
                <span className="ma-task-meta">
                  <TaskType
                    mode={
                      entry.kind === 'quiz'
                        ? 'assessment'
                        : entry.kind === 'review'
                          ? 'review'
                          : 'learn'
                    }
                  />
                  <span className="ma-task-xp">
                    {entry.earned}/{entry.possible} XP
                  </span>
                </span>
                {entry.skill && entry.skill.courseId !== activeCourseId && (
                  <span className="ma-course-label">
                    {courseTitle(entry.skill.courseId)}
                  </span>
                )}
                {entry.skill ? (
                  <a
                    className="ma-task-title"
                    href={`/graph?skill=${entry.skill.id}`}
                  >
                    {entry.skill.title}
                  </a>
                ) : (
                  <a
                    className="ma-task-title"
                    href={`/learn?quiz=${encodeURIComponent(entry.quizId!)}`}
                  >
                    {entry.title}
                  </a>
                )}
                <span className="ma-completed-at">
                  Completed @ {formatClockTime(entry.at, timeZone)}
                  {entry.credited
                    ? ` · + reviewed ${entry.credited} prerequisite${entry.credited === 1 ? '' : 's'}`
                    : ''}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ))}
      {entries.length > limit && (
        <Button
          variant="outline"
          className="self-start"
          onClick={() => setLimit((value) => value + HISTORY_PAGE)}
        >
          Show more
        </Button>
      )}
    </section>
  );
}
