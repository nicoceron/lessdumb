import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
import { Dashboard } from './learn-dashboard';
import { Courses } from './courses-page';
const LearningSession = lazy(() => import('./learning-session'));
const Cards = lazy(() =>
  import('./secondary-pages').then((m) => ({ default: m.Cards })),
);
const Settings = lazy(() =>
  import('./secondary-pages').then((m) => ({ default: m.Settings })),
);
const CodeLab = lazy(() =>
  import('./secondary-pages').then((m) => ({ default: m.CodeLab })),
);
const AccountModal = lazy(() =>
  import('./secondary-pages').then((m) => ({ default: m.AccountModal })),
);
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect, useRef, useState, lazy, Suspense } from 'react';
import {
  ArrowRight,
  ChevronRight,
  GitBranch,
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
} from '../lib/curriculum';
import { getSkillState, isUnlocked, coursePath } from '../lib/learning';
import { authClient } from '../lib/account';
import { createAnkiClient, type AnkiClient } from '../lib/anki';
import { type LearnerState } from '../lib/state';
import { legacyMemory, recallProbability } from '../lib/retention';
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
  const activeLanguage = courses.find(
    (course) => course.id === state.activeCourseId,
  )?.language;
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
  const pendingCards = state.cards.filter((c) => c.status === 'pending');

  async function signOut() {
    try {
      const result = await authClient.signOut();
      // The account dialog shows the error and offers another attempt.
      if (result.error) setAccountOpen(true);
    } catch {
      setAccountOpen(true);
    }
  }

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
        email={session.data?.user.email}
        sync={ready ? sync : 'Loading your workspace…'}
        pending={pendingCards.length}
        accountOpen={() => setAccountOpen(true)}
        signOut={signOut}
      />
      <div className="main-shell">
        <main
          id="main"
          className={`main-content ${page === 'learn' ? 'learning-content' : ''}`}
        >
          {!ready ? (
            session.error && !session.data ? (
              <Card role="alert" className="mx-auto max-w-xl">
                <CardHeader>
                  <CardTitle>
                    <h1>Couldn’t check your account.</h1>
                  </CardTitle>
                  <CardDescription>
                    Your learning space will open when the account connection is
                    restored.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={session.refetch}>
                    <RotateCcw className="size-4" /> Retry account connection
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="loading-space">
                <LoaderCircle className="spin" />
                Preparing your learning space…
              </div>
            )
          ) : (
            <Suspense
              fallback={
                <Skeleton
                  className="h-96 w-full"
                  aria-label="Loading workspace"
                />
              }
            >
              {page === 'today' && <Dashboard state={state} />}
              {page === 'learn' && (
                <LearningSession
                  key={`${routeKey}:${session.data?.user.id ?? 'guest'}`}
                  state={state}
                  update={update}
                  userId={session.data?.user.id}
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
                  sync={sync}
                  signedIn={!!session.data}
                />
              )}
              {page === 'lab' && (
                <CodeLab
                  key={session.data?.user.id ?? 'guest'}
                  userId={session.data?.user.id}
                  initialLanguage={
                    activeLanguage === 'rust' || activeLanguage === 'cpp'
                      ? activeLanguage
                      : 'python'
                  }
                />
              )}
              {page === '404' && (
                <div className="empty-state">
                  <h1>Page not found</h1>
                  <Button asChild variant="default">
                    <a href="/">
                      Back to Learn <ArrowRight size={17} />
                    </a>
                  </Button>
                </div>
              )}
            </Suspense>
          )}
        </main>
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
  const [allConnections, setAllConnections] = useState(false);
  const visible = coursePath(filter === 'all' ? undefined : filter);
  const graphUnits = units.filter((u) =>
    visible.some((s) => s.unitId === u.id),
  );
  function selectSkill(skill: Skill) {
    setSelected(skill);
    if (!visible.some((s) => s.id === skill.id)) setFilter(skill.courseId);
  }
  // Atomic topics occupy a row with their concept stages and application.
  // Bound columns so a growing curriculum remains readable on small screens.
  const positions: Record<string, { x: number; y: number }> = {};
  const unitRows: Record<string, number> = {};
  let row = 0;
  for (const unit of graphUnits) {
    unitRows[unit.id] = row;
    const peers = visible.filter((p) => p.unitId === unit.id);
    peers.forEach((s, index) => {
      positions[s.id] = {
        x: 145 + (index % 4) * 245,
        y: 100 + (row + Math.floor(index / 4)) * 155,
      };
    });
    row += Math.ceil(peers.length / 4) + 0.35;
  }
  const width =
    Math.max(650, ...Object.values(positions).map((p) => p.x)) + 145;
  const height = row * 155 + 45;
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

  const topicMembers = new Set(
    visible
      .filter((item) =>
        selected.topicId
          ? item.topicId === selected.topicId
          : item.id === selected.id,
      )
      .map((item) => item.id),
  );
  // Transitive edges remain enforced by the engine; the focused display can
  // omit them to reveal the actual concept chain.
  const ancestorCache = new Map<string, Set<string>>();
  function prerequisiteAncestors(id: string): Set<string> {
    const cached = ancestorCache.get(id);
    if (cached) return cached;
    const result = new Set<string>();
    ancestorCache.set(id, result);
    for (const parent of skillById[id].prerequisites) {
      result.add(parent);
      prerequisiteAncestors(parent).forEach((ancestor) => result.add(ancestor));
    }
    return result;
  }
  return (
    <>
      <PageTitle title="Knowledge graph" />
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
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto h-6 text-xs"
              aria-pressed={allConnections}
              onClick={() => setAllConnections(!allConnections)}
            >
              {allConnections ? 'Focus this topic' : 'Show all connections'}
            </Button>
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
                  const contextual =
                    topicMembers.has(skill.id) || topicMembers.has(dep);
                  if (
                    !allConnections &&
                    (!contextual ||
                      skill.prerequisites.some(
                        (other) =>
                          other !== dep &&
                          prerequisiteAncestors(other).has(dep),
                      ))
                  )
                    return null;
                  const from = positions[dep],
                    to = positions[skill.id];
                  const lit =
                    topicMembers.has(skill.id) &&
                    (topicMembers.has(dep) ||
                      selected.prerequisites.includes(dep));
                  const horizontal = Math.abs(from.y - to.y) < 1;
                  return (
                    <path
                      key={`${dep}-${skill.id}`}
                      d={
                        horizontal
                          ? `M${from.x + 20} ${from.y}L${to.x - 22} ${to.y}`
                          : `M${from.x} ${from.y + 20}C${from.x} ${from.y + 76},${to.x} ${to.y - 76},${to.x} ${to.y - 22}`
                      }
                      stroke={lit ? '#3479bc' : '#d8e2ec'}
                      strokeWidth={lit ? 2 : 1.5}
                      opacity={lit ? 1 : contextual ? 0.5 : 0.12}
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
                  y={35 + unitRows[u.id] * 155}
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
          {selected.stage && (
            <div className="mb-3 flex flex-wrap gap-2">
              <Badge variant="secondary">
                Step {selected.stage} of {selected.stageCount}
              </Badge>
              <Badge variant="outline">
                {selected.stage === selected.stageCount
                  ? selected.courseId === 'competitive-programming'
                    ? 'Apply the algorithm'
                    : 'Apply the concept'
                  : 'One concept'}
              </Badge>
            </div>
          )}
          <p>{selected.summary}</p>
          {getSkillState(state.progress, selected.id).mastery === 1 &&
            !isUnlocked(state.progress, selected.id) && (
              <p className="detail-note">
                Your earlier evidence is saved. Complete or restore the
                prerequisite evidence before practicing this skill again.
              </p>
            )}
          {selected.topicId && (
            <div className="mb-5">
              <p className="detail-note">
                Topic:{' '}
                {selected.topicTitle ?? skillById[selected.topicId].title}
              </p>
              <div
                aria-label="Topic learning steps"
                className="mt-3 flex flex-col gap-1"
              >
                {skills
                  .filter((item) => item.topicId === selected.topicId)
                  .map((item) => (
                    <Button
                      asChild
                      key={item.id}
                      variant={item.id === selected.id ? 'secondary' : 'ghost'}
                      className="h-auto justify-start whitespace-normal px-2 py-2 text-left text-xs"
                    >
                      <a
                        href={`/graph?skill=${item.id}`}
                        aria-current={
                          item.id === selected.id ? 'step' : undefined
                        }
                      >
                        <span className="shrink-0 font-mono text-muted-foreground">
                          {item.stage}.
                        </span>
                        {item.title}
                      </a>
                    </Button>
                  ))}
              </div>
            </div>
          )}
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
          {getSkillState(state.progress, selected.id).mastery === 1 &&
            (() => {
              const p = getSkillState(state.progress, selected.id);
              if (p.dueAt === null) return null;
              return (
                <div className="mb-5 rounded-lg border bg-muted/30 p-3 text-sm">
                  <p className="font-medium">
                    Your next review: {new Date(p.dueAt).toLocaleDateString()}
                  </p>
                  <p className="mt-1 text-muted-foreground">
                    Estimated recall:{' '}
                    {Math.round(
                      recallProbability(
                        legacyMemory(p, Date.now()),
                        Date.now(),
                      ) * 100,
                    )}
                    %. Your independent answers, hints, and mistakes shape this
                    schedule.
                  </p>
                </div>
              );
            })()}
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
    </>
  );
}
