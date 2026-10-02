import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  NativeSelect,
  NativeSelectOption,
} from '@/components/ui/native-select';
import { Progress } from '@/components/ui/progress';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Pill, PageTitle } from './shared';
import { WorkspaceHeader } from './workspace-header';
const LearningSession = lazy(() => import('./learning-session'));
const Cards = lazy(() =>
  import('./secondary-pages').then((m) => ({ default: m.Cards })),
);
const Settings = lazy(() =>
  import('./secondary-pages').then((m) => ({ default: m.Settings })),
);
const PythonLab = lazy(() =>
  import('./secondary-pages').then((m) => ({ default: m.PythonLab })),
);
const AccountModal = lazy(() =>
  import('./secondary-pages').then((m) => ({ default: m.AccountModal })),
);
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect, useRef, useState, lazy, Suspense } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronRight,
  GitBranch,
  Layers,
  LoaderCircle,
  LockKeyhole,
  RotateCcw,
} from 'lucide-react';
import {
  courses,
  skills,
  skillById,
  units,
  type Skill,
  assessmentPolicy,
} from '../lib/curriculum';
import {
  getSkillState,
  getStats,
  isUnlocked,
  nextTask,
  coursePath,
} from '../lib/learning';
import { createAnkiClient, type AnkiClient } from '../lib/anki';
import { type LearnerState } from '../lib/state';
import { useLearner } from './useLearner';

function masteryStatus(state: LearnerState, skill: Skill) {
  if (!isUnlocked(state.progress, skill.id)) return 'Locked';
  const p = getSkillState(state.progress, skill.id);
  return p.mastery >= 1
    ? 'Mastered'
    : p.attempts > 0 || p.lessonSeen
      ? 'In progress'
      : 'Ready to learn';
}
export default function App({
  page,
  routeKey,
}: {
  page: string;
  routeKey: string;
}) {
  const learner = useLearner();
  const { state, update, ready, session, sync } = learner;
  const [accountOpen, setAccountOpen] = useState(false);
  const [ankiMessage, setAnkiMessage] = useState('');
  const [ankiBusy, setAnkiBusy] = useState(false);
  const [ankiLive, setAnkiLive] = useState(false);
  const client = useRef<AnkiClient | null>(null);
  const syncing = useRef<object | null>(null);
  const ankiGeneration = useRef(0);
  const accountOwner = useRef<string | null>(null);
  accountOwner.current = session.data?.user.id ?? null;
  const stateRef = useRef(state);
  stateRef.current = state;
  const [flushVersion, setFlushVersion] = useState(0);
  const stats = getStats(state.progress);
  const pendingCards = state.cards.filter((c) => c.status === 'pending');
  const task = nextTask(
    state.progress,
    new Date(),
    courses.find((c) => c.id === state.activeCourseId)?.id ?? courses[0].id,
  );
  const name = session.data?.user.name?.split(' ')[0] ?? 'Learner';

  async function syncCards() {
    if (!ready || !client.current || syncing.current) return;
    const generation = ankiGeneration.current;
    const owner = accountOwner.current;
    const request = {};
    const current = () =>
      generation === ankiGeneration.current && owner === accountOwner.current;
    const cards = stateRef.current.cards.filter((c) => c.status === 'pending');
    if (!cards.length) return;
    syncing.current = request;
    setAnkiBusy(true);
    try {
      const activeClient = client.current;
      const result = await activeClient.syncCards(cards, {
        deck: stateRef.current.anki.deck,
      });
      if (!current()) return;
      if (!activeClient.getConnection()) setAnkiLive(false);
      update((s) => ({
        ...s,
        cards: s.cards.map((card) => {
          const success = result.synced.find((r) => r.cardId === card.id);
          const fail = result.failed.find((r) => r.cardId === card.id);
          return success
            ? {
                ...card,
                status: 'synced',
                noteId: success.noteId,
                lastError: undefined,
              }
            : fail
              ? { ...card, lastError: fail.error }
              : card;
        }),
      }));
      setAnkiMessage(
        result.failed.length
          ? result.failed[0].error
          : `${result.synced.length} card${result.synced.length === 1 ? '' : 's'} saved to Anki.`,
      );
    } catch (error) {
      if (current())
        setAnkiMessage(
          error instanceof Error
            ? error.message
            : 'Anki sync failed. Retry with Anki open.',
        );
    } finally {
      if (syncing.current === request) syncing.current = null;
      if (current()) {
        setAnkiBusy(false);
        if (
          stateRef.current.cards.some(
            (c) =>
              c.status === 'pending' &&
              !cards.some((original) => original.id === c.id),
          )
        )
          setFlushVersion((v) => v + 1);
      }
    }
  }
  async function connectAnki(apiKey?: string) {
    const generation = ++ankiGeneration.current;
    const owner = accountOwner.current;
    const current = () =>
      generation === ankiGeneration.current && owner === accountOwner.current;
    client.current?.disconnect();
    client.current = null;
    syncing.current = null;
    setAnkiLive(false);
    setAnkiBusy(true);
    setAnkiMessage('Connecting to Anki desktop…');
    const next = createAnkiClient({ apiKey });
    try {
      const connection = await next.connect();
      if (!current()) {
        next.disconnect();
        return;
      }
      client.current = next;
      setAnkiLive(true);
      setFlushVersion((v) => v + 1);
      update((s) => ({
        ...s,
        cards:
          s.anki.profile !== connection.activeProfile
            ? s.cards.map((card) => ({
                ...card,
                status: 'pending',
                noteId: undefined,
                lastError: undefined,
              }))
            : s.cards,
        anki: { ...s.anki, connected: true, profile: connection.activeProfile },
      }));
      setAnkiMessage(
        `Connected to “${connection.activeProfile}”. New cards will sync automatically.`,
      );
    } catch (error) {
      next.disconnect();
      if (current()) {
        setAnkiLive(false);
        setAnkiMessage(
          error instanceof Error ? error.message : 'Could not connect to Anki.',
        );
      }
    } finally {
      if (current()) setAnkiBusy(false);
    }
  }
  useEffect(() => {
    if (ready && ankiLive && pendingCards.length && !syncing.current)
      void syncCards();
  }, [ready, ankiLive, pendingCards.map((c) => c.id).join('|'), flushVersion]);
  useEffect(() => {
    ankiGeneration.current += 1;
    syncing.current = null;
    client.current?.disconnect();
    client.current = null;
    setAnkiLive(false);
    setAnkiBusy(false);
    setAnkiMessage('');
  }, [session.data?.user.id]);

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <WorkspaceHeader
        page={page}
        name={session.data?.user.name ?? 'Your learning space'}
        sync={ready ? sync : 'Loading your workspace…'}
        streak={stats.streak}
        pending={pendingCards.length}
        accountOpen={() => setAccountOpen(true)}
      />
      <div className="main-shell">
        <main
          id="main"
          className={`main-content ${page === 'learn' ? 'learning-content' : ''}`}
        >
          {!ready ? (
            <div className="loading-space">
              <LoaderCircle className="spin" />
              Preparing your learning space…
            </div>
          ) : (
            <Suspense
              fallback={
                <Skeleton
                  className="h-96 w-full"
                  aria-label="Loading workspace"
                />
              }
            >
              {page === 'today' && (
                <Dashboard
                  state={state}
                  name={name}
                  stats={stats}
                  task={task}
                  update={update}
                />
              )}
              {page === 'learn' && (
                <LearningSession
                  key={`${routeKey}:${session.data?.user.id ?? 'guest'}`}
                  state={state}
                  update={update}
                />
              )}
              {page === 'courses' && <Courses state={state} update={update} />}
              {page === 'graph' && (
                <KnowledgeGraph key={routeKey} state={state} />
              )}
              {page === 'cards' && (
                <Cards
                  state={state}
                  connect={() => connectAnki()}
                  syncCards={syncCards}
                  busy={ankiBusy}
                  live={ankiLive}
                  message={ankiMessage}
                />
              )}
              {page === 'settings' && (
                <Settings
                  state={state}
                  update={update}
                  connect={connectAnki}
                  disconnect={() => {
                    ankiGeneration.current += 1;
                    syncing.current = null;
                    client.current?.disconnect();
                    client.current = null;
                    setAnkiLive(false);
                    setAnkiBusy(false);
                    update((s) => ({
                      ...s,
                      anki: { ...s.anki, connected: false, profile: null },
                    }));
                    setAnkiMessage(
                      'Anki disconnected. Your cards are still saved here.',
                    );
                  }}
                  live={ankiLive}
                  busy={ankiBusy}
                  message={ankiMessage}
                  accountOpen={() => setAccountOpen(true)}
                  retrySync={learner.retrySync}
                />
              )}
              {page === 'lab' && <PythonLab />}
              {page === '404' && (
                <div className="empty-state">
                  <h1>This page wandered off.</h1>
                  <Button asChild variant="default">
                    <a href="/">
                      Back to Today <ArrowRight size={17} />
                    </a>
                  </Button>
                </div>
              )}
            </Suspense>
          )}
        </main>
        <footer className="app-footer">
          <span>A little better, every day.</span>
          <span>
            lessdumb · Connected learning <i>↗</i>
          </span>
        </footer>
      </div>
      {accountOpen && (
        <Suspense fallback={null}>
          <AccountModal
            close={() => setAccountOpen(false)}
            user={session.data?.user}
          />
        </Suspense>
      )}
    </div>
  );
}

type Stats = ReturnType<typeof getStats>;
type Task = ReturnType<typeof nextTask>;
function Dashboard({
  state,
  name,
  stats,
  task,
  update,
}: {
  state: LearnerState;
  name: string;
  stats: Stats;
  task: Task;
  update: (fn: (s: LearnerState) => LearnerState) => void;
}) {
  const course =
    courses.find((c) => c.id === state.activeCourseId) ?? courses[0];
  const courseStats = getStats(state.progress, new Date(), course.id);
  const percent = Math.round(
    (courseStats.mastered / course.skillIds.length) * 100,
  );
  const path = coursePath(course.id);
  const candidates = path.filter(
    (s) =>
      isUnlocked(state.progress, s.id) &&
      (getSkillState(state.progress, s.id).mastery < 1 ||
        (getSkillState(state.progress, s.id).dueAt ?? Infinity) <= Date.now()),
  );
  const queue = [
    ...(task ? [skillById[task.skillId]] : []),
    ...candidates.filter((s) => s.id !== task?.skillId),
  ].slice(0, 5);
  const week = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - 6 + index);
    const key = new Intl.DateTimeFormat('en-CA', {
      timeZone: state.progress.timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(date);
    return {
      day: date.toLocaleDateString('en', { weekday: 'narrow' }),
      xp: state.progress.dailyXp[key] ?? 0,
    };
  });
  return (
    <>
      <div className="ma-page-title">
        <div>
          <h1>Learn</h1>
          <p>Welcome back, {name}. Your next tasks are ready.</p>
        </div>
        <Button asChild variant="link" className="h-auto justify-start p-0">
          <a href="/graph">
            Explore graph <GitBranch size={16} />
          </a>
        </Button>
      </div>
      <div className="ma-dashboard">
        <aside className="ma-progress-column">
          <Card className="gap-0 ma-panel ma-course-summary">
            <Label htmlFor="active-course">CURRENT COURSE</Label>
            <NativeSelect
              className="w-full"
              id="active-course"
              value={course.id}
              onChange={(e) =>
                update((s) => ({ ...s, activeCourseId: e.target.value }))
              }
            >
              {courses.map((c) => (
                <NativeSelectOption key={c.id} value={c.id}>
                  {c.title}
                </NativeSelectOption>
              ))}
            </NativeSelect>
            <div className="ma-course-percent">
              <strong>{percent}%</strong>
              <span>
                {courseStats.mastered} / {course.skillIds.length} skills
                mastered
              </span>
            </div>
            <Progress value={percent} aria-label="Course mastery" />
            <Button asChild variant="link" className="h-auto justify-start p-0">
              <a href="/courses">
                Course details <ChevronRight size={14} />
              </a>
            </Button>
          </Card>
          <Card className="gap-0 ma-panel ma-xp-panel">
            <div className="ma-total-xp">
              <small>TOTAL EARNED</small>
              <strong>{stats.totalXp} XP</strong>
            </div>
            <div className="ma-today-xp">
              <small>TODAY</small>
              <Progress
                value={Math.min(100, (stats.todayXp / state.dailyGoal) * 100)}
                aria-label="Daily XP goal"
              />
              <span>
                {stats.todayXp} / {state.dailyGoal} XP
              </span>
            </div>
            <div className="ma-week-xp">
              <small>THIS WEEK</small>
              <strong>{week.reduce((n, d) => n + d.xp, 0)} XP</strong>
              <div className="week-bars">
                {week.map((d, i) => (
                  <div key={i}>
                    <span
                      className="week-bar"
                      style={{
                        height: `${Math.max(3, Math.min(85, (d.xp / state.dailyGoal) * 85))}px`,
                      }}
                      title={`${d.xp} XP`}
                    />
                    <small>{d.day}</small>
                  </div>
                ))}
              </div>
            </div>
          </Card>
          <Card className="gap-0 ma-panel ma-retention">
            <h3>Spaced practice</h3>
            <p>{stats.dueCount} skills due for review</p>
            <a href="/cards">
              <Layers size={16} />
              {state.cards.length} automatically created Anki cards{' '}
              <ChevronRight size={14} />
            </a>
          </Card>
        </aside>
        <section className="ma-task-column" aria-label="Learning tasks">
          <div className="ma-task-heading">
            <h2>Your learning tasks</h2>
            <span>{course.title}</span>
          </div>
          {queue.length ? (
            queue.map((skill, index) => {
              const p = getSkillState(state.progress, skill.id);
              const review = p.mastery >= 1;
              const prerequisite = skill.courseId !== course.id;
              const earned = p.rewardedQuestionIds;
              const xp = review
                ? skill.questions
                    .filter((q) => !p.reviewQuestionIds.includes(q.id))
                    .map((q) => (q.type === 'code' ? 8 : 5))
                    .sort((a, b) => b - a)
                    .slice(
                      0,
                      Math.max(
                        0,
                        assessmentPolicy(skill).reviewAnswers -
                          p.reviewQuestionIds.length,
                      ),
                    )
                    .reduce((n, x) => n + x, 0)
                : skill.questions
                    .filter((q) => !earned.includes(q.id))
                    .reduce((n, q) => n + (q.type === 'code' ? 15 : 10), 0);
              return (
                <Card
                  className={`gap-0 ma-panel ma-task ${index === 0 ? 'primary-task' : ''}`}
                  key={skill.id}
                >
                  <div className="ma-task-meta">
                    <strong>
                      {review ? (
                        <RotateCcw size={17} />
                      ) : (
                        <BookOpen size={17} />
                      )}{' '}
                      {review
                        ? 'Review'
                        : p.lessonSeen
                          ? 'Resume lesson'
                          : 'Lesson'}
                      {prerequisite && (
                        <Badge
                          variant="outline"
                          className="text-warning-foreground bg-warning/15"
                        >
                          Prerequisite
                        </Badge>
                      )}
                    </strong>
                    <span>Up to {xp} XP</span>
                  </div>
                  <h3>{skill.title}</h3>
                  <p>{skill.summary}</p>
                  {(index === 0 || p.mastery > 0) && (
                    <div className="task-progress">
                      <Progress
                        value={p.mastery * 100}
                        aria-label={`${skill.title} mastery`}
                      />
                      <span>{Math.round(p.mastery * 100)}%</span>
                    </div>
                  )}
                  {index === 0 && (
                    <div className="ma-task-detail">
                      <small>
                        {prerequisite
                          ? 'FROM ' +
                            courses
                              .find((c) => c.id === skill.courseId)
                              ?.title.toUpperCase()
                          : 'PREREQUISITES'}
                      </small>
                      {skill.prerequisites.length ? (
                        <div className="ma-prerequisites">
                          {skill.prerequisites.map((id) => (
                            <a key={id} href={`/graph?skill=${id}`}>
                              <Check size={14} />
                              {skillById[id].title}
                            </a>
                          ))}
                        </div>
                      ) : (
                        <p>No prerequisites. Start here.</p>
                      )}
                      {task && <p className="task-reason">{task.reason}</p>}
                    </div>
                  )}
                  <Button
                    asChild
                    variant={index === 0 ? 'default' : 'link'}
                    className={
                      index === 0
                        ? 'self-start px-4'
                        : 'h-auto self-start justify-start p-0'
                    }
                  >
                    <a
                      href={`/learn?skill=${skill.id}&mode=${review ? 'review' : 'learn'}&course=${course.id}`}
                    >
                      {p.lessonSeen ? 'Continue learning' : 'Start learning'}{' '}
                      <ArrowRight size={15} />
                    </a>
                  </Button>
                </Card>
              );
            })
          ) : (
            <Card className="gap-0 ma-panel ma-task">
              <CheckCircle2 />
              <h3>All caught up</h3>
              <p>
                You have completed this course path. Choose another course or
                return when a review is due.
              </p>
              <Button asChild variant="default">
                <a href="/courses">Choose a course</a>
              </Button>
            </Card>
          )}
          <div className="ma-graph-note">
            <GitBranch size={20} />
            <div>
              <strong>Every task has a place in your graph.</strong>
              <p>
                Missing prerequisites are included in your learning path across
                courses.
              </p>
            </div>
            <a href="/graph" aria-label="Explore your knowledge graph">
              <ArrowRight size={18} />
            </a>
          </div>
        </section>
      </div>
    </>
  );
}

function Courses({
  state,
  update,
}: {
  state: LearnerState;
  update: (fn: (s: LearnerState) => LearnerState) => void;
}) {
  const [expanded, setExpanded] = useState(
    state.activeCourseId ?? courses[0].id,
  );
  const course = courses.find((c) => c.id === expanded) ?? courses[0];
  return (
    <>
      <PageTitle
        eyebrow="COURSE CATALOG"
        title="Your learning, connected."
        description="Choose your destination. The graph finds the prerequisites you need."
      />
      <div className="ma-course-grid">
        {courses.map((c) => {
          const stats = getStats(state.progress, new Date(), c.id);
          const active = c.id === (state.activeCourseId ?? courses[0].id);
          const cross = coursePath(c.id).filter((s) => s.courseId !== c.id);
          const needed = cross.filter(
            (s) => getSkillState(state.progress, s.id).mastery < 1,
          ).length;
          return (
            <Card
              className={`gap-0 ma-panel ma-catalog-card ${expanded === c.id ? 'selected' : ''}`}
              key={c.id}
            >
              <div className="ma-catalog-meta">
                <span>
                  {c.domain === 'mathematics' ? 'MATHEMATICS' : 'COMPUTING'}
                </span>
                {active && <Pill>ACTIVE COURSE</Pill>}
              </div>
              <h2>{c.title}</h2>
              <p>{c.description}</p>
              <Progress
                value={(stats.mastered / c.skillIds.length) * 100}
                aria-label={`${c.title} mastery`}
              />
              <small>
                {stats.mastered} / {c.skillIds.length} skills mastered ·{' '}
                {needed} prerequisite skills remaining
              </small>
              <div className="ma-catalog-actions">
                <Button
                  className="h-9"
                  onClick={() => {
                    update((s) => ({ ...s, activeCourseId: c.id }));
                    setExpanded(c.id);
                  }}
                >
                  {active ? 'Selected' : 'Set learning goal'}
                  <Check size={14} />
                </Button>
                <Button
                  variant="link"
                  className="text-link"
                  onClick={() => setExpanded(c.id)}
                >
                  View topics <ChevronRight size={15} />
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
      <div className="section-heading">
        <h2>{course.title} · Topics</h2>
        <a href={`/graph?course=${course.id}`}>
          View prerequisite graph <GitBranch size={16} />
        </a>
      </div>
      {course.resources?.length ? (
        <Card className="mb-5 gap-3 p-4">
          <div>
            <h3 className="text-sm font-semibold">
              Explore the reference topic paths
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Practice here, then explore the broader topic guides.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {course.resources.map((resource) => (
              <Button key={resource.url} variant="outline" size="sm" asChild>
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {resource.label} <ArrowUpRight size={14} />
                </a>
              </Button>
            ))}
          </div>
        </Card>
      ) : null}
      {units
        .filter((u) => u.courseId === course.id)
        .map((unit, index) => (
          <Card className="gap-0 unit-card" key={unit.id}>
            <div className="unit-heading">
              <span>{String(index + 1).padStart(2, '0')}</span>
              <div>
                <h2>{unit.title}</h2>
                <p>{unit.description}</p>
              </div>
            </div>
            <div className="skill-list">
              {skills
                .filter((s) => s.unitId === unit.id)
                .map((skill) => {
                  const status = masteryStatus(state, skill);
                  return (
                    <a
                      key={skill.id}
                      href={
                        status === 'Locked'
                          ? `/graph?skill=${skill.id}`
                          : `/learn?skill=${skill.id}`
                      }
                    >
                      <span
                        className={`skill-status ${status.replaceAll(' ', '-').toLowerCase()}`}
                      >
                        {status === 'Mastered' ? (
                          <Check size={15} />
                        ) : status === 'Locked' ? (
                          <LockKeyhole size={13} />
                        ) : (
                          <span />
                        )}
                      </span>
                      <div>
                        <strong>{skill.title}</strong>
                        <small>{skill.summary}</small>
                      </div>
                      <span className="skill-list-state">{status}</span>
                      <ChevronRight size={16} />
                    </a>
                  );
                })}
            </div>
          </Card>
        ))}
    </>
  );
}
function KnowledgeGraph({ state }: { state: LearnerState }) {
  const params = new URLSearchParams(window.location.search);
  const requested = skillById[params.get('skill') ?? ''];
  const initialCourse =
    requested?.courseId ??
    courses.find((c) => c.id === params.get('course'))?.id ??
    courses.find((c) => c.id === state.activeCourseId)?.id ??
    courses[0].id;
  const [selected, setSelected] = useState(
    requested ?? skills.find((s) => s.courseId === initialCourse)!,
  );
  const [search, setSearch] = useState('');
  const [zoom, setZoom] = useState(1);
  const [filter, setFilter] = useState(initialCourse);
  const visible = coursePath(filter === 'all' ? undefined : filter);
  const graphUnits = units.filter((u) =>
    visible.some((s) => s.unitId === u.id),
  );
  function selectSkill(skill: Skill) {
    setSelected(skill);
    if (!visible.some((s) => s.id === skill.id)) setFilter(skill.courseId);
  }
  const positions = Object.fromEntries(
    visible.map((s) => {
      const row = graphUnits.findIndex((u) => u.id === s.unitId);
      const peers = visible.filter((p) => p.unitId === s.unitId);
      const col = peers.findIndex((p) => p.id === s.id);
      return [s.id, { x: 145 + col * 245, y: 100 + row * 155 }];
    }),
  );
  const width =
    Math.max(650, ...Object.values(positions).map((p) => p.x)) + 145;
  const height = graphUnits.length * 155 + 45;
  const viewport = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const container = viewport.current;
    const position = positions[selected.id];
    if (!container || !position) return;
    container.scrollTop = Math.max(
      0,
      position.y * zoom - container.clientHeight / 2,
    );
    container.scrollLeft = Math.max(
      0,
      position.x * zoom - container.clientWidth / 2,
    );
  }, [selected.id, filter, zoom]);

  const ancestors = new Set<string>();
  function visit(id: string) {
    for (const dep of skillById[id].prerequisites) {
      if (!ancestors.has(dep)) {
        ancestors.add(dep);
        visit(dep);
      }
    }
  }
  visit(selected.id);
  return (
    <>
      <PageTitle
        eyebrow="SEE HOW IT ALL FITS TOGETHER"
        title="Your knowledge graph."
        description="Build on what you know. See what it makes possible."
      />
      <div className="graph-toolbar">
        <Label className="graph-course-filter">
          <span className="sr-only">Graph course</span>
          <NativeSelect
            className="w-full"
            aria-label="Graph course"
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value);
              const first =
                coursePath(
                  e.target.value === 'all' ? undefined : e.target.value,
                ).find((s) => s.courseId === e.target.value) ?? skills[0];
              setSelected(first);
            }}
          >
            <NativeSelectOption value="all">All courses</NativeSelectOption>
            {courses.map((c) => (
              <NativeSelectOption key={c.id} value={c.id}>
                {c.title}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </Label>
        <Label>
          <span className="sr-only">Find a skill</span>
          <Input
            placeholder="Find a skill…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </Label>
        <div className="graph-zoom">
          <Button
            variant="ghost"
            onClick={() => setZoom((z) => Math.max(0.65, z - 0.15))}
            aria-label="Zoom out"
          >
            −
          </Button>
          <span>{Math.round(zoom * 100)}%</span>
          <Button
            variant="ghost"
            onClick={() => setZoom((z) => Math.min(1.6, z + 0.15))}
            aria-label="Zoom in"
          >
            +
          </Button>
        </div>
      </div>
      <div className="graph-layout">
        <Card className="gap-0 p-0 graph-canvas">
          <div className="graph-legend">
            <span>
              <i className="mastered" />
              Mastered
            </span>
            <span>
              <i className="available" />
              Ready
            </span>
            <span>
              <i />
              Locked
            </span>
            <small>Click a skill to explore its connections</small>
          </div>
          <ScrollArea
            className="h-[620px] w-full max-sm:h-[380px]"
            viewportRef={viewport}
            viewportClassName="graph-scroll"
          >
            <svg
              className="knowledge-svg"
              viewBox={`0 0 ${width} ${height}`}
              style={{
                width: `${width * zoom}px`,
                height: `${height * zoom}px`,
              }}
              role="group"
              aria-label="Cross-course prerequisite knowledge graph"
            >
              <defs>
                <marker
                  id="arrow"
                  markerWidth="7"
                  markerHeight="7"
                  refX="6"
                  refY="3"
                  orient="auto"
                >
                  <path d="M0 0L6 3L0 6" fill="none" stroke="#b9c6ba" />
                </marker>
              </defs>
              {visible.flatMap((skill) =>
                skill.prerequisites.map((dep) => {
                  const from = positions[dep],
                    to = positions[skill.id];
                  const lit =
                    ancestors.has(dep) &&
                    (ancestors.has(skill.id) || selected.id === skill.id);
                  return (
                    <path
                      key={`${dep}-${skill.id}`}
                      d={`M${from.x} ${from.y + 20}C${from.x} ${from.y + 76},${to.x} ${to.y - 76},${to.x} ${to.y - 22}`}
                      stroke={lit ? '#3479bc' : '#d8e2ec'}
                      strokeWidth={lit ? 2 : 1.5}
                      fill="none"
                      markerEnd="url(#arrow)"
                    />
                  );
                }),
              )}
              {graphUnits.map((u, i) => (
                <text
                  className="graph-unit-label"
                  key={u.id}
                  x="12"
                  y={35 + i * 155}
                >
                  {String(i + 1).padStart(2, '0')} / {u.title.toUpperCase()}
                </text>
              ))}
              {visible.map((skill) => {
                const p = positions[skill.id],
                  status = masteryStatus(state, skill),
                  focused = selected.id === skill.id;
                const matches =
                  !search ||
                  skill.title.toLowerCase().includes(search.toLowerCase());
                return (
                  <g
                    className={`graph-node ${focused ? 'focused' : ''} ${status === 'Locked' ? 'locked' : ''}`}
                    key={skill.id}
                    role="button"
                    tabIndex={0}
                    aria-label={`${skill.title}: ${status}`}
                    aria-pressed={focused}
                    onClick={() => selectSkill(skill)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        selectSkill(skill);
                      }
                    }}
                    style={{ opacity: matches ? 1 : 0.22 }}
                  >
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={focused ? 24 : 20}
                      fill={
                        status === 'Mastered'
                          ? '#3479bc'
                          : status === 'Locked'
                            ? '#f2f4ef'
                            : '#e9f3ff'
                      }
                      stroke={
                        focused
                          ? '#3479bc'
                          : status === 'Locked'
                            ? '#d5ddd3'
                            : '#7ba7d0'
                      }
                      strokeWidth={focused ? 2 : 1.5}
                    />
                    <text
                      x={p.x}
                      y={p.y + 5}
                      textAnchor="middle"
                      fill={status === 'Mastered' ? '#fff' : '#3479bc'}
                      fontSize="13"
                    >
                      {status === 'Mastered'
                        ? '✓'
                        : status === 'Locked'
                          ? '·'
                          : skill.order + 1}
                    </text>
                    <text
                      x={p.x}
                      y={p.y + 43}
                      textAnchor="middle"
                      className="graph-node-label"
                    >
                      {skill.title}
                    </text>
                  </g>
                );
              })}
            </svg>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </Card>
        <Card className="gap-0 graph-detail">
          <span className="detail-icon">
            <GitBranch size={24} />
          </span>
          <Pill>{masteryStatus(state, selected)}</Pill>
          <small className="graph-course-name">
            {courses.find((c) => c.id === selected.courseId)?.title}
          </small>
          <h2>{selected.title}</h2>
          <p>{selected.summary}</p>
          <div className="detail-progress">
            <span>Mastery</span>
            <strong>
              {Math.round(
                getSkillState(state.progress, selected.id).mastery * 100,
              )}
              %
            </strong>
            <Progress
              value={getSkillState(state.progress, selected.id).mastery * 100}
              aria-label="Selected skill mastery"
            />
          </div>
          <h3>Builds on</h3>
          {selected.prerequisites.length ? (
            selected.prerequisites.map((id) => (
              <Button
                variant="ghost"
                className="connection-link h-auto min-h-9 justify-start whitespace-normal px-0 py-2 text-left"
                key={id}
                onClick={() => selectSkill(skillById[id])}
              >
                <GitBranch size={14} />
                {skillById[id].title}
                <small>
                  {courses.find((c) => c.id === skillById[id].courseId)?.title}
                </small>
                <ChevronRight size={13} />
              </Button>
            ))
          ) : (
            <p className="detail-note">
              Your starting point. No prerequisites needed.
            </p>
          )}
          <h3>Opens the door to</h3>
          {skills
            .filter((s) => s.prerequisites.includes(selected.id))
            .map((s) => (
              <Button
                variant="ghost"
                className="connection-link h-auto min-h-9 justify-start whitespace-normal px-0 py-2 text-left"
                key={s.id}
                onClick={() => selectSkill(s)}
              >
                {s.title}
                <ChevronRight size={13} />
              </Button>
            ))}
          {!skills.some((s) => s.prerequisites.includes(selected.id)) && (
            <p className="detail-note">
              Connect these ideas in your own projects.
            </p>
          )}
          {isUnlocked(state.progress, selected.id) ? (
            <Button asChild variant="default">
              <a href={`/learn?skill=${selected.id}`}>
                Practice this skill <ArrowRight size={16} />
              </a>
            </Button>
          ) : (
            <div className="locked-note">
              <LockKeyhole size={16} />
              Master the prerequisites to unlock.
            </div>
          )}
        </Card>
      </div>
      <div className="future-subjects">
        <GitBranch size={23} />
        <div>
          <h3>One graph. Many ways to grow.</h3>
          <p>
            Courses and skills have subject identities and explicit
            prerequisites. New domains can connect to the same graph.
          </p>
        </div>
      </div>
    </>
  );
}
