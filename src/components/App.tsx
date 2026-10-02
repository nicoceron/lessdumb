import {
  useEffect,
  useRef,
  useState,
  lazy,
  Suspense,
  type ReactNode,
} from 'react';
import {
  ArrowDownToLine,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  Code2,
  Flame,
  GitBranch,
  GraduationCap,
  Layers,
  Link2,
  LoaderCircle,
  LockKeyhole,
  LogOut,
  Menu,
  Play,
  RotateCcw,
  Settings2,
  Target,
  Terminal,
  X,
  Zap,
} from 'lucide-react';
const CodeMirror = lazy(() => import('@uiw/react-codemirror'));
import { python } from '@codemirror/lang-python';
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
  recordLesson,
  selectQuestion,
  coursePath,
} from '../lib/learning';
import { createAnkiClient, exportCardsTsv, type AnkiClient } from '../lib/anki';
import { authClient } from '../lib/account';
import { runPython, type PythonResult } from '../lib/python';
import { recordLearningAnswer, type LearnerState } from '../lib/state';
import { useLearner } from './useLearner';

const navigation = [
  { page: 'today', label: 'Today', icon: GraduationCap, href: '/' },
  { page: 'courses', label: 'My learning', icon: BookOpen, href: '/courses' },
  { page: 'graph', label: 'Knowledge graph', icon: GitBranch, href: '/graph' },
  { page: 'cards', label: 'Flashcards', icon: Layers, href: '/cards' },
  { page: 'lab', label: 'Python lab', icon: Terminal, href: '/lab' },
];
function Btn({
  children,
  onClick,
  secondary = false,
  disabled = false,
}: {
  children: ReactNode;
  onClick?: () => void;
  secondary?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      className={secondary ? 'btn secondary' : 'btn'}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
function Pill({ children }: { children: ReactNode }) {
  return <span className="pill">{children}</span>;
}
function masteryStatus(state: LearnerState, skill: Skill) {
  const p = getSkillState(state.progress, skill.id);
  return p.mastery >= 1
    ? 'Mastered'
    : p.attempts > 0 || p.lessonSeen
      ? 'In progress'
      : isUnlocked(state.progress, skill.id)
        ? 'Ready to learn'
        : 'Locked';
}
function download(name: string, data: string, type = 'application/json') {
  const url = URL.createObjectURL(new Blob([data], { type }));
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
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
  const [menu, setMenu] = useState(false);
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
  useEffect(() => setMenu(false), [routeKey]);

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
      <aside className={`sidebar ${menu ? 'open' : ''}`}>
        <a href="/" className="wordmark">
          <span className="logo-mark">
            <span>l</span>
            <span>d</span>
          </span>
          lessdumb<span className="logo-dot">.</span>
        </a>
        <nav aria-label="Main navigation">
          {navigation.map((item) => (
            <a
              key={item.page}
              href={item.href}
              className={`nav-item ${page === item.page || (page === 'learn' && item.page === 'today') ? 'active' : ''}`}
            >
              <item.icon size={17} />
              <span>{item.label}</span>
              {item.page === 'cards' && pendingCards.length > 0 && (
                <b>{pendingCards.length}</b>
              )}
            </a>
          ))}
          <a
            className={`nav-item ${page === 'settings' ? 'active' : ''}`}
            href="/settings"
          >
            <Settings2 size={17} />
            <span>Settings & connections</span>
          </a>
        </nav>
      </aside>
      {menu && (
        <button
          className="menu-backdrop"
          aria-label="Close menu"
          onClick={() => setMenu(false)}
        />
      )}
      <div className="main-shell">
        <header className="topbar">
          <button
            className="menu-button"
            aria-label="Open navigation"
            onClick={() => setMenu(!menu)}
          >
            <Menu size={22} />
          </button>
          <div className="breadcrumb">
            Your workspace <ChevronRight size={13} />
            <strong>
              {page === 'learn'
                ? 'Practice'
                : (navigation.find((n) => n.page === page)?.label ??
                  'Settings')}
            </strong>
          </div>
          <div className="topbar-right">
            <span className="live-label">
              <i />
              {ready ? sync : 'Loading your workspace…'}
            </span>
            <span className="streak-chip">
              <Flame size={16} />
              {stats.streak} day streak
            </span>
            <button
              className="top-avatar"
              aria-label="Open account"
              onClick={() => setAccountOpen(true)}
            >
              {name.slice(0, 1).toUpperCase()}
              <span className="account-name sr-only">
                {session.data?.user.name ?? 'Your learning space'}
              </span>
            </button>
          </div>
        </header>
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
            <>
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
                  <a className="btn" href="/">
                    Back to Today <ArrowRight size={17} />
                  </a>
                </div>
              )}
            </>
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
        <AccountModal
          close={() => setAccountOpen(false)}
          user={session.data?.user}
        />
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
        <a className="text-link" href="/graph">
          Explore graph <GitBranch size={16} />
        </a>
      </div>
      <div className="ma-dashboard">
        <aside className="ma-progress-column">
          <section className="ma-panel ma-course-summary">
            <label htmlFor="active-course">CURRENT COURSE</label>
            <select
              id="active-course"
              value={course.id}
              onChange={(e) =>
                update((s) => ({ ...s, activeCourseId: e.target.value }))
              }
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
            <div className="ma-course-percent">
              <strong>{percent}%</strong>
              <span>
                {courseStats.mastered} / {course.skillIds.length} skills
                mastered
              </span>
            </div>
            <div className="progress-track">
              <i style={{ width: `${percent}%` }} />
            </div>
            <a className="text-link" href="/courses">
              Course details <ChevronRight size={14} />
            </a>
          </section>
          <section className="ma-panel ma-xp-panel">
            <div className="ma-total-xp">
              <small>TOTAL EARNED</small>
              <strong>{stats.totalXp} XP</strong>
            </div>
            <div className="ma-today-xp">
              <small>TODAY</small>
              <div className="progress-track">
                <i
                  style={{
                    width: `${Math.min(100, (stats.todayXp / state.dailyGoal) * 100)}%`,
                  }}
                />
              </div>
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
          </section>
          <section className="ma-panel ma-retention">
            <h3>Spaced practice</h3>
            <p>{stats.dueCount} skills due for review</p>
            <a href="/cards">
              <Layers size={16} />
              {state.cards.length} automatically created Anki cards{' '}
              <ChevronRight size={14} />
            </a>
          </section>
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
                <article
                  className={`ma-panel ma-task ${index === 0 ? 'primary-task' : ''}`}
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
                        <span className="prerequisite-badge">Prerequisite</span>
                      )}
                    </strong>
                    <span>Up to {xp} XP</span>
                  </div>
                  <h3>{skill.title}</h3>
                  <p>{skill.summary}</p>
                  {(index === 0 || p.mastery > 0) && (
                    <div className="task-progress">
                      <div className="progress-track">
                        <i style={{ width: `${p.mastery * 100}%` }} />
                      </div>
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
                  <a
                    className={index === 0 ? 'btn' : 'text-link'}
                    href={`/learn?skill=${skill.id}&mode=${review ? 'review' : 'learn'}&course=${course.id}`}
                  >
                    {p.lessonSeen ? 'Continue learning' : 'Start learning'}{' '}
                    <ArrowRight size={15} />
                  </a>
                </article>
              );
            })
          ) : (
            <div className="ma-panel ma-task">
              <CheckCircle2 />
              <h3>All caught up</h3>
              <p>
                You have completed this course path. Choose another course or
                return when a review is due.
              </p>
              <a className="btn" href="/courses">
                Choose a course
              </a>
            </div>
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

function LearningSession({
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
        <a className="btn" href="/graph">
          See your growing graph <ArrowRight size={17} />
        </a>
        <a className="text-link" href="/lab">
          Try a project in the Python lab
        </a>
      </div>
    );
  if (!skill || !available)
    return (
      <div className="empty-state">
        <LockKeyhole />
        <h1>{skill ? 'Build the foundation first.' : 'Skill not found.'}</h1>
        <p>Prerequisites give every new idea somewhere to land.</p>
        <a className="btn" href="/graph">
          Explore the knowledge graph <ArrowRight size={18} />
        </a>
      </div>
    );
  return (
    <>
      <div className="session-top">
        <a href="/" className="text-link">
          <X size={18} />
          Leave session
        </a>
        <span>
          <Zap size={16} />
          {sessionXp} XP this session
        </span>
      </div>
      <div className="session-progress">
        <i
          style={{
            width: `${(mode === 'review' ? reviewFraction : progress!.mastery) * 100}%`,
          }}
        />
      </div>
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
        <article className="lesson-paper">
          <span className="page-eyebrow">A NEW PIECE OF THE PICTURE</span>
          <h1>{skill.title}</h1>
          <p className="lesson-summary">{skill.summary}</p>
          {skill.lesson.paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
          <div className="code-example">
            <div>
              <Code2 size={15} />
              {skill.lesson.example.label ??
                (skill.lesson.example.kind === 'text'
                  ? 'Worked scenario'
                  : 'Python')}
            </div>
            <pre>{skill.lesson.example.code}</pre>
            <div className="example-output">
              <small>
                {skill.lesson.example.kind === 'text' ? 'DECISION' : 'OUTPUT'}
              </small>
              <pre>{skill.lesson.example.output}</pre>
            </div>
          </div>
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
        </article>
      ) : (
        question && (
          <article className="question-paper">
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
              <pre className="question-code">{question.code}</pre>
            )}
            {question.type === 'choice' ? (
              <div className="answer-options">
                {question.choices.map((choice, index) => (
                  <button
                    key={index}
                    onClick={() => setSelected(index)}
                    disabled={!!feedback}
                    className={`answer-option ${selected === index ? 'selected' : ''} ${feedback && question.answer === index ? 'correct' : ''} ${feedback && selected === index && !feedback.correct ? 'incorrect' : ''}`}
                  >
                    <span>{String.fromCharCode(65 + index)}</span>
                    <pre>{choice}</pre>
                    {feedback && question.answer === index && (
                      <Check size={18} />
                    )}
                  </button>
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
                  <div className="runner-output">
                    <small>
                      {skill.lesson.example.kind === 'text'
                        ? 'DECISION'
                        : 'OUTPUT'}
                    </small>
                    <pre>{output.output || '(no output)'}</pre>
                    {output.error && (
                      <p className="error-text">{output.error}</p>
                    )}
                  </div>
                )}
              </>
            )}
            {hint && (
              <div className="hint-panel">
                <CircleHelp size={17} />
                <p>
                  {question.hint}
                  <small>
                    Practice with a hint helps you learn. An independent answer
                    earns XP and proves mastery.
                  </small>
                </p>
              </div>
            )}
            {feedback && (
              <div
                className={`feedback ${feedback.correct ? 'success' : 'retry'}`}
              >
                <CheckCircle2 size={23} />
                <div>
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
                    <details>
                      <summary>Understand a worked solution</summary>
                      <pre>{question.solution}</pre>
                    </details>
                  )}
                  {!feedback.correct && (
                    <small>A flashcard is saved to help this one stick.</small>
                  )}
                </div>
              </div>
            )}
            <div className="question-actions">
              <button
                className="text-link"
                onClick={() => setHint(true)}
                disabled={running || hint || !!feedback}
              >
                <CircleHelp size={17} />
                Give me a hint
              </button>
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
          </article>
        )
      )}
      <div className="session-footnote">
        <GitBranch size={15} />
        Every skill is connected. Master this one to unlock the next.
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
            <article
              className={`ma-panel ma-catalog-card ${expanded === c.id ? 'selected' : ''}`}
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
              <div className="progress-track">
                <i
                  style={{
                    width: `${(stats.mastered / c.skillIds.length) * 100}%`,
                  }}
                />
              </div>
              <small>
                {stats.mastered} / {c.skillIds.length} skills mastered ·{' '}
                {needed} prerequisite skills remaining
              </small>
              <div className="ma-catalog-actions">
                <button
                  className="btn"
                  onClick={() => {
                    update((s) => ({ ...s, activeCourseId: c.id }));
                    setExpanded(c.id);
                  }}
                >
                  {active ? 'Selected' : 'Set learning goal'}
                  <Check size={14} />
                </button>
                <button className="text-link" onClick={() => setExpanded(c.id)}>
                  View topics <ChevronRight size={15} />
                </button>
              </div>
            </article>
          );
        })}
      </div>
      <div className="section-heading">
        <h2>{course.title} · Topics</h2>
        <a href={`/graph?course=${course.id}`}>
          View prerequisite graph <GitBranch size={16} />
        </a>
      </div>
      {units
        .filter((u) => u.courseId === course.id)
        .map((unit, index) => (
          <section className="unit-card" key={unit.id}>
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
          </section>
        ))}
    </>
  );
}
function PageTitle({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <>
      <div className="page-eyebrow">
        <span className="eyebrow-line" />
        {eyebrow}
      </div>
      <div className="page-heading compact">
        <div>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
      </div>
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
        <label className="graph-course-filter">
          <span className="sr-only">Graph course</span>
          <select
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
            <option value="all">All courses</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="sr-only">Find a skill</span>
          <input
            placeholder="Find a skill…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
        <div className="graph-zoom">
          <button
            onClick={() => setZoom((z) => Math.max(0.65, z - 0.15))}
            aria-label="Zoom out"
          >
            −
          </button>
          <span>{Math.round(zoom * 100)}%</span>
          <button
            onClick={() => setZoom((z) => Math.min(1.6, z + 0.15))}
            aria-label="Zoom in"
          >
            +
          </button>
        </div>
      </div>
      <div className="graph-layout">
        <section className="graph-canvas">
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
          <div className="graph-scroll" ref={viewport}>
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
          </div>
        </section>
        <aside className="graph-detail">
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
            <div className="progress-track">
              <i
                style={{
                  width: `${getSkillState(state.progress, selected.id).mastery * 100}%`,
                }}
              />
            </div>
          </div>
          <h3>Builds on</h3>
          {selected.prerequisites.length ? (
            selected.prerequisites.map((id) => (
              <button
                className="connection-link"
                key={id}
                onClick={() => selectSkill(skillById[id])}
              >
                <GitBranch size={14} />
                {skillById[id].title}
                <small>
                  {courses.find((c) => c.id === skillById[id].courseId)?.title}
                </small>
                <ChevronRight size={13} />
              </button>
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
              <button
                className="connection-link"
                key={s.id}
                onClick={() => selectSkill(s)}
              >
                {s.title}
                <ChevronRight size={13} />
              </button>
            ))}
          {!skills.some((s) => s.prerequisites.includes(selected.id)) && (
            <p className="detail-note">
              Connect these ideas in your own projects.
            </p>
          )}
          {isUnlocked(state.progress, selected.id) ? (
            <a className="btn" href={`/learn?skill=${selected.id}`}>
              Practice this skill <ArrowRight size={16} />
            </a>
          ) : (
            <div className="locked-note">
              <LockKeyhole size={16} />
              Master the prerequisites to unlock.
            </div>
          )}
        </aside>
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

function Cards({
  state,
  connect,
  syncCards,
  busy,
  live,
  message,
}: {
  state: LearnerState;
  connect: () => void;
  syncCards: () => void;
  busy: boolean;
  live: boolean;
  message: string;
}) {
  const [filter, setFilter] = useState('all');
  const [flipped, setFlipped] = useState<string | null>(null);
  const visible = state.cards.filter(
    (c) => filter === 'all' || c.status === filter,
  );
  return (
    <>
      <PageTitle
        eyebrow="MAKE YOUR LEARNING LAST"
        title="Your automatic memory bank."
        description="Cards from your mastered skills and useful mistakes. No manual copying."
      />
      <div className="cards-overview">
        <div className="card-metric">
          <strong>{state.cards.length}</strong>
          <span>cards created</span>
        </div>
        <div className="card-metric">
          <strong>
            {state.cards.filter((c) => c.status === 'synced').length}
          </strong>
          <span>saved to Anki</span>
        </div>
        <div className="card-metric">
          <strong>
            {state.cards.filter((c) => c.status === 'pending').length}
          </strong>
          <span>waiting to sync</span>
        </div>
        <Btn onClick={live ? syncCards : connect} disabled={busy}>
          {busy ? (
            <LoaderCircle size={17} className="spin" />
          ) : (
            <Link2 size={17} />
          )}
          {live ? 'Sync cards' : 'Connect Anki'}
        </Btn>
      </div>
      <div className="connection-banner">
        <span className={`connection-dot ${live ? 'connected' : ''}`} />
        <p>
          {message ||
            (state.anki.connected
              ? `Saved connection: ${state.anki.profile}. Connect this session to resume automatic sync.`
              : 'Connect to your Anki desktop profile. Anki then syncs your cards to your AnkiWeb account.')}
        </p>
        <a href="/settings">
          Setup guide <ArrowRight size={15} />
        </a>
      </div>
      <div className="card-tabs" role="group" aria-label="Filter cards">
        {['all', 'pending', 'synced'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={f === filter ? 'selected' : ''}
          >
            {f === 'all'
              ? 'All cards'
              : f === 'pending'
                ? 'Waiting to sync'
                : 'In Anki'}
          </button>
        ))}
        <button
          className="text-link export-cards"
          onClick={() =>
            download(
              'lessdumb-cards.tsv',
              exportCardsTsv(state.cards),
              'text/tab-separated-values',
            )
          }
          disabled={!state.cards.length}
        >
          <ArrowDownToLine size={16} />
          Export for Anki
        </button>
      </div>
      {visible.length ? (
        <div className="flashcard-grid">
          {visible.map((card) => (
            <button
              key={card.id}
              className={`flashcard ${flipped === card.id ? 'flipped' : ''}`}
              onClick={() => setFlipped(flipped === card.id ? null : card.id)}
            >
              <div>
                <Pill>
                  {card.kind === 'mastery' ? 'BREAKTHROUGH' : 'USEFUL MISTAKE'}
                </Pill>
                <span className={`card-sync ${card.status}`}>
                  {card.status === 'synced' ? (
                    <Check size={14} />
                  ) : (
                    <RotateCcw size={13} />
                  )}
                </span>
              </div>
              <pre>{flipped === card.id ? card.back : card.front}</pre>
              <footer>
                <span>{card.skillName}</span>
                <small>
                  {flipped === card.id ? 'Show question' : 'Reveal answer'} ↻
                </small>
              </footer>
              {card.lastError && (
                <small className="error-text">{card.lastError}</small>
              )}
            </button>
          ))}
        </div>
      ) : (
        <div className="empty-state cards-empty">
          <Layers size={34} />
          <h2>
            {state.cards.length
              ? 'All clear here.'
              : 'Your first breakthrough belongs here.'}
          </h2>
          <p>
            Master a skill or learn from a mistake.
            <br />
            We’ll turn the important bits into cards for you.
          </p>
          <a className="btn" href="/learn">
            Learn something new <ArrowRight size={17} />
          </a>
        </div>
      )}
    </>
  );
}

function Settings({
  state,
  update,
  connect,
  disconnect,
  live,
  busy,
  message,
  accountOpen,
  retrySync,
}: {
  state: LearnerState;
  update: (fn: (s: LearnerState) => LearnerState) => void;
  connect: (apiKey?: string) => void;
  disconnect: () => void;
  live: boolean;
  busy: boolean;
  message: string;
  accountOpen: () => void;
  retrySync: () => void;
}) {
  const [apiKey, setApiKey] = useState('');
  const [deck, setDeck] = useState(state.anki.deck);
  const [backupMessage, setBackupMessage] = useState('');
  return (
    <>
      <PageTitle
        eyebrow="MAKE THIS SPACE YOURS"
        title="A few good connections."
        description="Your account, your daily rhythm, and your memory bank."
      />
      <div className="settings-grid">
        <section className="settings-card">
          <span className="settings-icon">
            <GraduationCap size={23} />
          </span>
          <h2>Your lessdumb account</h2>
          <p>
            Create a free account to keep your knowledge graph and progress
            across devices.
          </p>
          <Btn onClick={accountOpen}>
            Manage account <ArrowRight size={17} />
          </Btn>
          <button className="text-link" onClick={retrySync}>
            <RotateCcw size={14} />
            Retry progress sync
          </button>
        </section>
        <section className="settings-card">
          <span className="settings-icon">
            <Target size={23} />
          </span>
          <h2>A sustainable daily goal</h2>
          <p>
            Show up consistently. You can adjust your goal as you find your
            rhythm.
          </p>
          <div className="goal-options">
            {[25, 50, 100].map((x) => (
              <button
                key={x}
                className={state.dailyGoal === x ? 'selected' : ''}
                onClick={() => update((s) => ({ ...s, dailyGoal: x }))}
              >
                <strong>{x} XP</strong>
                <small>
                  {x === 25
                    ? 'A small step'
                    : x === 50
                      ? 'Steady progress'
                      : 'A deeper session'}
                </small>
              </button>
            ))}
          </div>
        </section>
        <section className="settings-card anki-settings">
          <span className="settings-icon">
            <Layers size={23} />
          </span>
          <div className="settings-card-heading">
            <h2>Connect your Anki account</h2>
            <Pill>{live ? 'CONNECTED' : 'DESKTOP CONNECTION'}</Pill>
          </div>
          <p>
            lessdumb creates cards in your desktop profile. Anki’s own sync
            sends them to the AnkiWeb account connected to that profile.
          </p>
          <ol className="setup-steps">
            <li>
              <span>1</span>
              <div>
                <strong>Open Anki desktop</strong>
                <p>
                  Sign in to your AnkiWeb account through Anki’s Sync button.
                  Complete email verification if Anki asks.
                </p>
              </div>
            </li>
            <li>
              <span>2</span>
              <div>
                <strong>Install AnkiConnect</strong>
                <p>
                  In Anki: Tools → Add-ons → Get Add-ons. Enter{' '}
                  <code>2055492159</code> and restart Anki.
                </p>
              </div>
            </li>
            <li>
              <span>3</span>
              <div>
                <strong>Connect this learning space</strong>
                <p>
                  Click below, then allow this site when Anki asks. Keep Anki
                  open for automatic card creation.
                </p>
              </div>
            </li>
          </ol>
          <div className="anki-config">
            <label>
              Anki deck
              <input
                value={deck}
                onChange={(e) => setDeck(e.target.value)}
                onBlur={() => {
                  if (deck.trim())
                    update((s) => ({
                      ...s,
                      anki: { ...s.anki, deck: deck.trim() },
                    }));
                }}
                placeholder="lessdumb::Learning"
              />
            </label>
            <label>
              API key <small>(only if configured in AnkiConnect)</small>
              <input
                type="password"
                autoComplete="off"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Optional · stays in this session"
              />
            </label>
          </div>
          <div className="settings-actions">
            <Btn onClick={() => connect(apiKey)} disabled={busy}>
              {busy ? (
                <LoaderCircle className="spin" size={17} />
              ) : (
                <Link2 size={17} />
              )}
              Connect Anki
            </Btn>
            {live && (
              <Btn secondary onClick={disconnect}>
                Disconnect
              </Btn>
            )}
            <a
              href="https://github.com/ankiultimate/anki-connect"
              target="_blank"
              rel="noreferrer"
              className="text-link"
            >
              AnkiConnect documentation ↗
            </a>
          </div>
          {message && (
            <div className="connection-banner">
              <p>{message}</p>
            </div>
          )}
          <small className="settings-footnote">
            Your AnkiWeb password stays in Anki. New connections require your
            permission in Anki desktop.
          </small>
        </section>
        <section className="settings-card">
          <span className="settings-icon">
            <ArrowDownToLine size={23} />
          </span>
          <h2>Your progress, in your hands</h2>
          <p>
            Export a portable copy of your graph progress and generated cards.
          </p>
          <Btn
            secondary
            onClick={() => {
              download('lessdumb-backup.json', JSON.stringify(state, null, 2));
              setBackupMessage('Backup downloaded. Keep it somewhere safe.');
            }}
          >
            Export backup <ArrowDownToLine size={16} />
          </Btn>
          {backupMessage && <small>{backupMessage}</small>}
        </section>
      </div>
    </>
  );
}

function PythonLab() {
  const [code, setCode] = useState(
    '# A little space to experiment.\nname = "world"\nprint(f"Hello, {name}!")',
  );
  const [result, setResult] = useState<PythonResult | null>(null);
  const [busy, setBusy] = useState(false);
  async function run() {
    setBusy(true);
    setResult(await runPython(code));
    setBusy(false);
  }
  return (
    <>
      <PageTitle
        eyebrow="CURIOSITY NEEDS A PLAYGROUND"
        title="Try an idea."
        description="Real Python, right in your browser. Experiment without affecting your mastery."
      />
      <section className="lab-card">
        <div className="editor-label">
          <span>
            <Code2 size={16} />
            Python playground
          </span>
          <small>Independent, isolated runs</small>
        </div>
        <Suspense
          fallback={
            <div className="editor-loading">Preparing the code editor…</div>
          }
        >
          <CodeMirror
            value={code}
            extensions={[python()]}
            height="370px"
            onChange={setCode}
            aria-label="Python playground editor"
          />
        </Suspense>
        <div className="lab-actions">
          <span>Execution stops after 30 seconds.</span>
          <Btn onClick={run} disabled={busy}>
            {busy ? (
              <LoaderCircle className="spin" size={17} />
            ) : (
              <Play size={17} />
            )}{' '}
            {busy ? 'Running Python…' : 'Run Python'}
          </Btn>
        </div>
        <div className="runner-output">
          <small>OUTPUT</small>
          <pre>{result?.output || 'Your output will appear here.'}</pre>
          {result?.error && <p className="error-text">{result.error}</p>}
        </div>
      </section>
    </>
  );
}

function AccountModal({
  close,
  user,
}: {
  close: () => void;
  user?: { name: string; email: string };
}) {
  const [register, setRegister] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    dialog.current?.showModal();
    return () => dialog.current?.close();
  }, []);
  async function submit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const result = register
        ? await authClient.signUp.email({ name, email, password })
        : await authClient.signIn.email({ email, password });
      if (result.error)
        setError(result.error.message ?? 'Could not connect your account.');
      else close();
    } catch {
      setError('Could not reach the server. Please try again.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <dialog ref={dialog} className="account-modal" onCancel={close}>
      <button
        className="modal-close"
        onClick={close}
        aria-label="Close account dialog"
      >
        <X size={20} />
      </button>
      <span className="modal-icon">
        <GraduationCap size={27} />
      </span>
      {user ? (
        <>
          <h2>Your learning space.</h2>
          <p>
            {user.name}
            <br />
            {user.email}
          </p>
          <div className="account-connected">
            <CheckCircle2 size={19} />
            Your progress is connected to your account.
          </div>
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <Btn
            secondary
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              setError('');
              try {
                const result = await authClient.signOut();
                if (result.error)
                  setError(
                    result.error.message ??
                      'Could not sign out. Please try again.',
                  );
                else close();
              } catch {
                setError('Could not reach the server. Please try again.');
              } finally {
                setBusy(false);
              }
            }}
          >
            <LogOut size={17} />
            {busy ? 'Signing out…' : 'Sign out'}
          </Btn>
        </>
      ) : (
        <>
          <h2>{register ? 'Make yourself at home.' : 'Welcome back.'}</h2>
          <p>
            Your progress, your graph, your small wins.
            <br />
            Keep them together with a free account.
          </p>
          <form onSubmit={submit}>
            {register && (
              <label>
                Your name
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  placeholder="What should we call you?"
                  maxLength={80}
                />
              </label>
            )}
            <label>
              Email
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                placeholder="you@example.com"
              />
            </label>
            <label>
              Password
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={register ? 'new-password' : 'current-password'}
                placeholder="At least 8 characters"
              />
            </label>
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
            <button className="btn" type="submit" disabled={busy}>
              {busy ? (
                <LoaderCircle className="spin" size={17} />
              ) : (
                <>
                  {register ? 'Create free account' : 'Sign in'}
                  <ArrowRight size={17} />
                </>
              )}
            </button>
          </form>
          <button
            className="switch-account"
            onClick={() => {
              setRegister(!register);
              setError('');
            }}
          >
            {register
              ? 'Already have an account? Sign in'
              : 'New here? Create an account'}
          </button>
        </>
      )}
    </dialog>
  );
}
