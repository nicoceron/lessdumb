import { useEffect, useRef, useState, lazy, Suspense } from 'react';
import {
  ArrowDownToLine,
  ArrowRight,
  Check,
  CheckCircle2,
  Code2,
  GraduationCap,
  Layers,
  Link2,
  LoaderCircle,
  LogOut,
  Mail,
  Play,
  RotateCcw,
  Target,
  X,
} from 'lucide-react';
import { exportCardsTsv } from '../lib/anki';
import { cardBlocks } from '../lib/card-text';
import {
  authClient,
  NOTICE_PARAM,
  PASSWORD_RESET_NOTICE,
  type AccountUser,
} from '../lib/account';
import { type PythonResult } from '../lib/python';
import type { CodeLanguage } from '../lib/curriculum';
import { runCode } from '../lib/code-runner';
import { codeLanguage, codeLanguageLabels } from '../lib/code-language';
import { type LearnerState, type QueuedCard } from '../lib/state';
import { InlineText } from './inline-text';
import { Pill, PageTitle, download } from './shared';
import { Button } from './ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './ui/card';
import { Alert, AlertAction, AlertDescription, AlertTitle } from './ui/alert';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { NativeSelect, NativeSelectOption } from './ui/native-select';
import { Separator } from './ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ToggleGroup, ToggleGroupItem } from './ui/toggle-group';
import {
  Stepper,
  StepperContent,
  StepperIndicator,
  StepperItem,
  StepperNav,
  StepperPanel,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from './reui/stepper';
import {
  CodeBlock,
  CodeBlockCopyButton,
  CodeBlockHeader,
  CodeBlockTitle,
} from './reui/code-block/code-block';

const CodeEditor = lazy(() => import('./code-editor'));

/**
 * One side of a card. A mistake card made since CEN-128 is prose with code
 * blocks: prose typesets its math, code stays as written. Older cards and
 * mastery cards are plain text and show as written, TeX source included.
 */
function CardFace({
  card,
  side,
}: {
  card: QueuedCard;
  side: 'front' | 'back';
}) {
  if (!card.format)
    return (
      <pre className="w-full flex-1 font-mono text-sm leading-relaxed break-words whitespace-pre-wrap">
        {card[side]}
      </pre>
    );
  const blocks = cardBlocks(card[side]);
  return (
    <span className="flex w-full flex-1 flex-col gap-3 text-sm leading-relaxed">
      {blocks.map((block, index) =>
        block.kind === 'code' ? (
          <code
            key={index}
            className="block font-mono break-words whitespace-pre-wrap"
          >
            {block.text}
          </code>
        ) : (
          <span key={index} className="block break-words whitespace-pre-wrap">
            <InlineText text={block.text} />
          </span>
        ),
      )}
    </span>
  );
}

export function Cards({
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
  const metrics = [
    { value: state.cards.length, label: 'cards created' },
    {
      value: state.cards.filter((c) => c.status === 'synced').length,
      label: 'saved to Anki',
    },
    {
      value: state.cards.filter((c) => c.status === 'pending').length,
      label: 'waiting to sync',
    },
  ];
  return (
    <>
      <PageTitle
        title="Flashcards"
        description="Cards are created when you master a skill or answer a question incorrectly."
      />
      <div className="grid gap-4 sm:grid-cols-3">
        {metrics.map((metric) => (
          <Card key={metric.label}>
            <CardContent className="flex flex-col gap-1">
              <strong className="text-3xl font-semibold tracking-tight">
                {metric.value}
              </strong>
              <span className="text-sm text-muted-foreground">
                {metric.label}
              </span>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="my-5">
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
              {live ? <CheckCircle2 size={18} /> : <Link2 size={18} />}
            </span>
            <div className="min-w-0 space-y-1">
              <Pill>{live ? 'CONNECTED' : 'DESKTOP CONNECTION'}</Pill>
              <p className="text-sm text-muted-foreground" role="status">
                {message ||
                  (state.anki.connected
                    ? `Saved connection: ${state.anki.profile}. Connect this session to resume automatic sync.`
                    : 'Connect to your Anki desktop profile. Anki then syncs your cards to your AnkiWeb account.')}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <Button variant="outline" asChild>
              <a href="/settings">
                Setup guide <ArrowRight size={15} />
              </a>
            </Button>
            <Button onClick={live ? syncCards : connect} disabled={busy}>
              {busy ? (
                <LoaderCircle size={17} className="animate-spin" />
              ) : (
                <Link2 size={17} />
              )}
              {live ? 'Sync cards' : 'Connect Anki'}
            </Button>
          </div>
        </CardContent>
      </Card>
      <Tabs value={filter} onValueChange={setFilter} className="gap-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <TabsList aria-label="Filter cards">
            {['all', 'pending', 'synced'].map((f) => (
              <TabsTrigger key={f} value={f}>
                {f === 'all'
                  ? 'All cards'
                  : f === 'pending'
                    ? 'Waiting to sync'
                    : 'In Anki'}
              </TabsTrigger>
            ))}
          </TabsList>
          <Button
            variant="outline"
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
          </Button>
        </div>
        <TabsContent value={filter}>
          {visible.length ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {visible.map((card) => (
                <Card key={card.id} className="gap-0 py-0">
                  <Button
                    variant="ghost"
                    className="flashcard h-full min-h-56 w-full flex-col items-stretch justify-between gap-5 rounded-xl p-5 text-left whitespace-normal"
                    aria-pressed={flipped === card.id}
                    onClick={() =>
                      setFlipped(flipped === card.id ? null : card.id)
                    }
                  >
                    <span className="flex items-center justify-between gap-2">
                      <Pill>
                        {card.kind === 'mastery'
                          ? 'BREAKTHROUGH'
                          : 'USEFUL MISTAKE'}
                      </Pill>
                      <span
                        className="text-muted-foreground"
                        aria-label={
                          card.status === 'synced'
                            ? 'Saved to Anki'
                            : 'Waiting to sync'
                        }
                      >
                        {card.status === 'synced' ? (
                          <Check size={14} />
                        ) : (
                          <RotateCcw size={13} />
                        )}
                      </span>
                    </span>
                    <CardFace
                      card={card}
                      side={flipped === card.id ? 'back' : 'front'}
                    />
                    <span className="flex items-end justify-between gap-3 text-xs text-muted-foreground">
                      <span>{card.skillName}</span>
                      <span className="shrink-0 text-primary">
                        {flipped === card.id
                          ? 'Show question'
                          : 'Reveal answer'}{' '}
                        ↻
                      </span>
                    </span>
                    {card.lastError && (
                      <span className="text-xs text-destructive">
                        {card.lastError}
                      </span>
                    )}
                  </Button>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex min-h-72 flex-col items-center justify-center gap-4 py-8 text-center">
                <Layers className="size-9 text-primary" />
                <h2 className="text-lg font-semibold">
                  {state.cards.length
                    ? 'No cards in this view'
                    : 'No cards yet'}
                </h2>
                <Button asChild>
                  <a href="/">
                    Go to Learn <ArrowRight size={17} />
                  </a>
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </>
  );
}

export function Settings({
  state,
  update,
  connect,
  disconnect,
  live,
  busy,
  message,
  accountOpen,
  retrySync,
  sync,
  signedIn,
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
  sync: string;
  signedIn: boolean;
}) {
  const [apiKey, setApiKey] = useState('');
  const [deck, setDeck] = useState(state.anki.deck);
  const [backupMessage, setBackupMessage] = useState('');
  const [setupStep, setSetupStep] = useState(live ? 3 : 1);
  useEffect(() => {
    if (live) setSetupStep(3);
  }, [live]);
  const setupTitles = [
    'Open Anki desktop',
    'Install AnkiConnect',
    'Connect this learning space',
  ];
  return (
    <>
      <PageTitle title="Settings" />
      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <GraduationCap className="mb-2 size-6 text-primary" />
            <CardTitle>
              <h2>Account</h2>
            </CardTitle>
            <CardDescription>
              {signedIn
                ? 'Progress is saved to your account and this device.'
                : 'Progress is saved on this device. Sign in to keep it across devices.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-2">
            <p className="w-full text-sm text-muted-foreground" role="status">
              {sync}
            </p>
            <Button onClick={accountOpen}>
              {signedIn ? 'Manage account' : 'Sign in or create account'}{' '}
              <ArrowRight size={17} />
            </Button>
            <Button variant="outline" onClick={retrySync}>
              <RotateCcw size={14} />
              Retry progress sync
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Target className="mb-2 size-6 text-primary" />
            <CardTitle>
              <h2>Daily XP goal</h2>
            </CardTitle>
            <CardDescription>
              Sets today’s target and the estimated completion date on Learn.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ToggleGroup
              type="single"
              variant="outline"
              value={String(state.dailyGoal)}
              onValueChange={(value) => {
                if (value) update((s) => ({ ...s, dailyGoal: Number(value) }));
              }}
              aria-label="Daily XP goal"
              className="grid w-full grid-cols-3 gap-2"
            >
              {[25, 50, 100].map((x) => (
                <ToggleGroupItem
                  key={x}
                  value={String(x)}
                  className="h-auto min-w-0 flex-col gap-1 px-1 py-3 data-[state=on]:border-primary data-[state=on]:bg-secondary data-[state=on]:text-primary"
                >
                  <strong>{x} XP</strong>
                  <small className="text-xs text-muted-foreground">
                    {x === 25
                      ? 'A small step'
                      : x === 50
                        ? 'Steady progress'
                        : 'A deeper session'}
                  </small>
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader>
            <Layers className="mb-2 size-6 text-primary" />
            <div className="flex flex-wrap items-center justify-between gap-2">
              <CardTitle>
                <h2>Anki</h2>
              </CardTitle>
              <Pill>{live ? 'CONNECTED' : 'DESKTOP CONNECTION'}</Pill>
            </div>
            <CardDescription>
              lessdumb creates cards in your desktop profile. Anki’s own sync
              sends them to the AnkiWeb account connected to that profile.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Stepper
              value={setupStep}
              onValueChange={setSetupStep}
              className="space-y-4"
            >
              <StepperNav>
                <div
                  className="flex w-full items-start gap-2"
                  role="tablist"
                  aria-label="Anki setup steps"
                >
                  {setupTitles.map((title, index) => (
                    <StepperItem
                      key={title}
                      step={index + 1}
                      completed={live}
                      className="min-w-0 flex-1 items-start"
                    >
                      <StepperTrigger className="flex w-full flex-col gap-2 text-center">
                        <StepperIndicator>{index + 1}</StepperIndicator>
                        <StepperTitle className="max-w-36 text-xs whitespace-normal sm:text-sm">
                          {title}
                        </StepperTitle>
                      </StepperTrigger>
                      {index < setupTitles.length - 1 && (
                        <StepperSeparator className="mt-3 shrink-0" />
                      )}
                    </StepperItem>
                  ))}
                </div>
              </StepperNav>
              <StepperPanel className="rounded-lg border bg-muted/40 p-4 text-sm text-muted-foreground">
                <StepperContent value={1}>
                  <div
                    role="tabpanel"
                    id="stepper-panel-1"
                    aria-labelledby="stepper-tab-1"
                  >
                    Sign in to your AnkiWeb account through Anki’s Sync button.
                    Complete email verification if Anki asks.
                  </div>
                </StepperContent>
                <StepperContent value={2}>
                  <div
                    role="tabpanel"
                    id="stepper-panel-2"
                    aria-labelledby="stepper-tab-2"
                  >
                    In Anki: Tools → Add-ons → Get Add-ons. Enter{' '}
                    <code className="rounded bg-secondary px-1.5 py-0.5 font-mono text-primary">
                      2055492159
                    </code>{' '}
                    and restart Anki.
                  </div>
                </StepperContent>
                <StepperContent value={3}>
                  <div
                    role="tabpanel"
                    id="stepper-panel-3"
                    aria-labelledby="stepper-tab-3"
                  >
                    Click below, then allow this site when Anki asks. Keep Anki
                    open for automatic card creation.
                  </div>
                </StepperContent>
              </StepperPanel>
            </Stepper>
            <Separator />
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="anki-deck">Anki deck</Label>
                <Input
                  id="anki-deck"
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
              </div>
              <div className="space-y-2">
                <Label htmlFor="anki-api-key">API key</Label>
                <Input
                  id="anki-api-key"
                  type="password"
                  autoComplete="off"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Optional · stays in this session"
                  aria-describedby="anki-api-key-help"
                />
                <p
                  id="anki-api-key-help"
                  className="text-xs text-muted-foreground"
                >
                  Only if configured in AnkiConnect. Stays in this session.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button onClick={() => connect(apiKey)} disabled={busy}>
                {busy ? (
                  <LoaderCircle className="animate-spin" size={17} />
                ) : (
                  <Link2 size={17} />
                )}
                Connect Anki
              </Button>
              {live && (
                <Button variant="outline" onClick={disconnect}>
                  Disconnect
                </Button>
              )}
              <Button variant="link" className="h-auto px-0" asChild>
                <a
                  href="https://github.com/ankiultimate/anki-connect"
                  target="_blank"
                  rel="noreferrer"
                >
                  AnkiConnect documentation ↗
                </a>
              </Button>
            </div>
            {message && (
              <Alert role="status">
                <Link2 />
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter className="text-xs text-muted-foreground">
            Your AnkiWeb password stays in Anki. New connections require your
            permission in Anki desktop.
          </CardFooter>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader>
            <ArrowDownToLine className="mb-2 size-6 text-primary" />
            <CardTitle>
              <h2>Backup</h2>
            </CardTitle>
            <CardDescription>
              Export a portable copy of your graph progress and generated cards.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              onClick={() => {
                download(
                  'lessdumb-backup.json',
                  JSON.stringify(state, null, 2),
                );
                setBackupMessage('Backup downloaded. Keep it somewhere safe.');
              }}
            >
              Export backup <ArrowDownToLine size={16} />
            </Button>
            {backupMessage && (
              <span className="text-sm text-muted-foreground" role="status">
                {backupMessage}
              </span>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

export function CodeLab({
  userId,
  initialLanguage = 'python',
}: {
  userId?: string;
  initialLanguage?: CodeLanguage;
}) {
  const [language, setLanguage] = useState<CodeLanguage>(() =>
    codeLanguage(
      new URLSearchParams(window.location.search).get('language') ??
        initialLanguage,
    ),
  );
  const [programs, setPrograms] = useState<Record<CodeLanguage, string>>({
    python:
      '# A little space to experiment.\nname = "world"\nprint(f"Hello, {name}!")',
    rust: 'fn main() {\n    let name = "world";\n    println!("Hello, {name}!");\n}',
    cpp: '#include <iostream>\n#include <string>\n\nint main() {\n    std::string name = "world";\n    std::cout << "Hello, " << name << "!\\n";\n}',
  });
  const code = programs[language];
  const setCode = (value: string) =>
    setPrograms((saved) => ({ ...saved, [language]: value }));
  const [result, setResult] = useState<PythonResult | null>(null);
  const [busy, setBusy] = useState(false);
  const runGeneration = useRef(0);
  const controller = useRef<AbortController | null>(null);
  useEffect(
    () => () => {
      runGeneration.current += 1;
      controller.current?.abort();
    },
    [],
  );
  async function run() {
    if (busy) return;
    const generation = ++runGeneration.current;
    controller.current = new AbortController();
    setBusy(true);
    const output = await runCode(code, '', language, {
      userId,
      signal: controller.current.signal,
    });
    if (generation !== runGeneration.current) return;
    setResult(output);
    setBusy(false);
  }
  return (
    <>
      <PageTitle
        title="Code lab"
        description="Run Python, Rust, or C++. Runs here do not affect mastery."
      />
      <Card>
        <CardHeader className="flex flex-wrap items-center justify-between gap-2 sm:flex-row">
          <CardTitle className="flex items-center gap-2">
            <Code2 className="size-4 text-primary" />
            {codeLanguageLabels[language]} playground
          </CardTitle>
          <span className="text-xs text-muted-foreground">
            Independent, isolated runs
          </span>
        </CardHeader>
        <CardContent className="min-w-0 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <Label htmlFor="lab-language">Language</Label>
            <NativeSelect
              id="lab-language"
              aria-label="Playground language"
              value={language}
              disabled={busy}
              onChange={(event) => {
                setLanguage(codeLanguage(event.target.value));
                setResult(null);
              }}
            >
              {Object.entries(codeLanguageLabels).map(([value, label]) => (
                <NativeSelectOption key={value} value={value}>
                  {label}
                </NativeSelectOption>
              ))}
            </NativeSelect>
            <p className="text-xs text-muted-foreground">
              {language === 'python'
                ? 'Python runs on your device.'
                : 'Only your code is sent to Compiler Explorer’s free sandbox.'}
            </p>
          </div>
          <div className="overflow-hidden rounded-lg border">
            <Suspense
              fallback={
                <div className="flex h-72 items-center justify-center gap-2 text-sm text-muted-foreground">
                  <LoaderCircle className="size-4 animate-spin" />
                  Preparing the code editor…
                </div>
              }
            >
              <CodeEditor
                language={language}
                value={code}
                height="370px"
                onChange={setCode}
                editable={!busy}
                aria-label={`${codeLanguageLabels[language]} playground editor`}
              />
            </Suspense>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs text-muted-foreground">
              {language === 'python'
                ? 'Execution stops after 30 seconds.'
                : 'Compilation and execution have bounded time limits.'}
            </span>
            <Button onClick={run} disabled={busy}>
              {busy ? (
                <LoaderCircle className="animate-spin" size={17} />
              ) : (
                <Play size={17} />
              )}
              {busy
                ? `Running ${codeLanguageLabels[language]}…`
                : `Run ${codeLanguageLabels[language]}`}
            </Button>
          </div>
          <div className="runner-output space-y-3" aria-live="polite">
            <CodeBlock
              code={
                result
                  ? result.output || '(no output)'
                  : 'Your output will appear here.'
              }
              language="text"
              highlight={false}
              defaultWrap
              label={`${codeLanguageLabels[language]} output`}
              className="max-h-80 overflow-auto"
            >
              <CodeBlockHeader>
                <CodeBlockTitle>OUTPUT</CodeBlockTitle>
                <CodeBlockCopyButton className="ml-auto" />
              </CodeBlockHeader>
            </CodeBlock>
            {result?.error && (
              <Alert variant="destructive">
                <AlertDescription className="break-words whitespace-pre-wrap">
                  {result.error}
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
}

export type AccountView = 'register' | 'sign-in' | 'forgot';

export function AccountModal({
  close,
  user,
  emailEnabled,
  initialView = 'register',
}: {
  close: () => void;
  user?: AccountUser;
  /** Without email, nothing that depends on it (reset, verification) is shown. */
  emailEnabled: boolean;
  initialView?: AccountView;
}) {
  const [view, setView] = useState<AccountView>(
    initialView === 'forgot' && !emailEnabled ? 'sign-in' : initialView,
  );
  const register = view === 'register';
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [deleting, setDeleting] = useState(false);
  const requestGeneration = useRef(0);
  const returnFocus = useRef(
    typeof document !== 'undefined' &&
      document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null,
  );
  useEffect(
    () => () => {
      requestGeneration.current += 1;
    },
    [],
  );
  function show(next: AccountView) {
    setView(next);
    setError('');
    setNotice('');
  }
  /** Runs one account request; a newer request or closing the dialog ignores it. */
  async function run(
    action: () => Promise<{ error: { message?: string } | null }>,
    fallback: string,
    done: () => void,
  ) {
    if (busy) return;
    const generation = ++requestGeneration.current;
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const result = await action();
      if (generation !== requestGeneration.current) return;
      if (result.error) setError(result.error.message ?? fallback);
      else done();
    } catch {
      if (generation === requestGeneration.current)
        setError('Could not reach the server. Please try again.');
    } finally {
      if (generation === requestGeneration.current) setBusy(false);
    }
  }
  function submit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (view === 'forgot')
      return run(
        () => authClient.requestPasswordReset(email),
        'Could not send a reset link.',
        () =>
          setNotice(
            'If an account uses that email, a link to reset your password is on its way. It expires in 1 hour.',
          ),
      );
    return run(
      () =>
        register
          ? authClient.signUp.email({ name, email, password })
          : authClient.signIn.email({ email, password }),
      'Could not connect your account.',
      close,
    );
  }
  function signOut() {
    return run(
      () => authClient.signOut(),
      'Could not sign out. Please try again.',
      close,
    );
  }
  function resendVerification() {
    if (!user) return;
    return run(
      () => authClient.sendVerificationEmail(user.email),
      'Could not send the verification email.',
      () => setNotice(`We sent a new verification link to ${user.email}.`),
    );
  }
  function deleteAccount(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user) return;
    // On success the account client leaves this page for a fresh document.
    return run(
      () => authClient.deleteUser(user.id, password),
      'Could not delete your account.',
      () => {},
    );
  }
  return (
    <Dialog open onOpenChange={(open) => !open && close()}>
      <DialogContent
        showCloseButton={false}
        className="account-modal max-h-[calc(100dvh-2rem)] overflow-y-auto p-6 sm:max-w-md"
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          if (returnFocus.current?.isConnected) returnFocus.current.focus();
        }}
      >
        <DialogClose asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            className="absolute top-3 right-3"
            aria-label="Close account dialog"
          >
            <X size={20} />
          </Button>
        </DialogClose>
        <span className="flex size-12 items-center justify-center rounded-xl bg-secondary text-primary">
          <GraduationCap size={27} />
        </span>
        <DialogHeader>
          <DialogTitle className="text-xl">
            {user
              ? 'Your learning space.'
              : view === 'forgot'
                ? 'Reset your password.'
                : register
                  ? 'Make yourself at home.'
                  : 'Welcome back.'}
          </DialogTitle>
          <DialogDescription>
            {user ? (
              <>
                {user.name}
                <br />
                {user.email}
              </>
            ) : view === 'forgot' ? (
              'Enter your account email and we’ll send you a link to choose a new password.'
            ) : (
              <>
                Your progress, your graph, your small wins.
                <br />
                Keep them together with a free account.
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        {user ? (
          <>
            <Alert role="status">
              <CheckCircle2 size={19} />
              <AlertDescription>
                Your progress is connected to your account.
              </AlertDescription>
            </Alert>
            {emailEnabled && !user.emailVerified && (
              <Alert role="status">
                <Mail size={19} />
                <AlertTitle>Verify your email</AlertTitle>
                <AlertDescription>
                  Open the link we sent to {user.email}. You can keep learning
                  meanwhile.
                </AlertDescription>
                <AlertAction>
                  <Button
                    variant="outline"
                    size="xs"
                    disabled={busy}
                    onClick={resendVerification}
                  >
                    Resend link
                  </Button>
                </AlertAction>
              </Alert>
            )}
            {notice && (
              <Alert role="status">
                <AlertDescription>{notice}</AlertDescription>
              </Alert>
            )}
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {deleting ? (
              <form
                onSubmit={deleteAccount}
                className="space-y-4"
                aria-label="Delete account"
              >
                <p className="text-sm text-muted-foreground">
                  This permanently deletes your account and all of its saved
                  progress. It can’t be undone.
                </p>
                <div className="space-y-2">
                  <Label htmlFor="delete-password">Password</Label>
                  <Input
                    id="delete-password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    disabled={busy}
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button type="submit" variant="destructive" disabled={busy}>
                    {busy && (
                      <LoaderCircle className="animate-spin" size={17} />
                    )}
                    {busy ? 'Deleting…' : 'Delete account permanently'}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    disabled={busy}
                    onClick={() => {
                      setDeleting(false);
                      setPassword('');
                      setError('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <>
                <Button variant="outline" disabled={busy} onClick={signOut}>
                  {busy ? (
                    <LoaderCircle className="animate-spin" size={17} />
                  ) : (
                    <LogOut size={17} />
                  )}
                  {busy ? 'Signing out…' : 'Sign out'}
                </Button>
                <Button
                  variant="ghost"
                  className="text-destructive"
                  disabled={busy}
                  onClick={() => {
                    setDeleting(true);
                    setError('');
                    setNotice('');
                  }}
                >
                  Delete account
                </Button>
              </>
            )}
          </>
        ) : (
          <>
            <form onSubmit={submit} className="space-y-4">
              {register && (
                <div className="space-y-2">
                  <Label htmlFor="account-name">Your name</Label>
                  <Input
                    id="account-name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="name"
                    placeholder="What should we call you?"
                    maxLength={80}
                    disabled={busy}
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="account-email">Email</Label>
                <Input
                  id="account-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  placeholder="you@example.com"
                  disabled={busy}
                />
              </div>
              {view !== 'forgot' && (
                <div className="space-y-2">
                  <Label htmlFor="account-password">Password</Label>
                  <Input
                    id="account-password"
                    type="password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete={
                      register ? 'new-password' : 'current-password'
                    }
                    placeholder="At least 8 characters"
                    disabled={busy}
                  />
                  {view === 'sign-in' && emailEnabled && (
                    <Button
                      type="button"
                      variant="link"
                      size="sm"
                      className="h-auto px-0"
                      disabled={busy}
                      onClick={() => show('forgot')}
                    >
                      Forgot password?
                    </Button>
                  )}
                </div>
              )}
              {notice && (
                <Alert role="status">
                  <AlertDescription>{notice}</AlertDescription>
                </Alert>
              )}
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <Button className="w-full" type="submit" disabled={busy}>
                {busy ? (
                  <>
                    <LoaderCircle className="animate-spin" size={17} />
                    {view === 'forgot'
                      ? 'Sending…'
                      : register
                        ? 'Creating your account…'
                        : 'Signing in…'}
                  </>
                ) : (
                  <>
                    {view === 'forgot'
                      ? 'Send reset link'
                      : register
                        ? 'Create free account'
                        : 'Sign in'}
                    <ArrowRight size={17} />
                  </>
                )}
              </Button>
            </form>
            <Separator />
            <Button
              variant="link"
              className="h-auto whitespace-normal"
              disabled={busy}
              onClick={() => show(view === 'sign-in' ? 'register' : 'sign-in')}
            >
              {view === 'forgot'
                ? 'Back to sign in'
                : register
                  ? 'Already have an account? Sign in'
                  : 'New here? Create an account'}
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

/** `/reset-password?token=…`, reached from the reset email through Better Auth. */
export function ResetPassword({
  emailEnabled,
  openAccount,
}: {
  emailEnabled: boolean;
  openAccount: (view: AccountView) => void;
}) {
  const [params] = useState(() => new URLSearchParams(window.location.search));
  const token = params.get('token') ?? '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function submit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    if (password !== confirm) {
      setError('The two passwords don’t match.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const result = await authClient.resetPassword(token, password);
      if (!result.error) {
        // Resetting signs out every session, so start from a fresh document.
        window.location.assign(`/?${NOTICE_PARAM}=${PASSWORD_RESET_NOTICE}`);
        return;
      }
      setError(result.error.message ?? 'Could not change your password.');
    } catch {
      setError('Could not reach the server. Please try again.');
    }
    setBusy(false);
  }
  const unavailable = !emailEnabled
    ? 'Email isn’t enabled on this server, so passwords can’t be reset by email.'
    : !token || params.has('error')
      ? 'This reset link is invalid or has expired. Request a new one.'
      : '';
  return (
    <>
      <PageTitle title="Choose a new password" />
      <Card className="max-w-md">
        <CardContent className="space-y-4">
          {unavailable ? (
            <>
              <Alert variant="destructive">
                <AlertDescription>{unavailable}</AlertDescription>
              </Alert>
              {emailEnabled && (
                <Button onClick={() => openAccount('forgot')}>
                  Request a new link
                </Button>
              )}
            </>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">New password</Label>
                <Input
                  id="new-password"
                  type="password"
                  required
                  minLength={8}
                  maxLength={128}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
                  disabled={busy}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm new password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  required
                  minLength={8}
                  maxLength={128}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  autoComplete="new-password"
                  disabled={busy}
                />
              </div>
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <Button type="submit" disabled={busy}>
                {busy && <LoaderCircle className="animate-spin" size={17} />}
                {busy ? 'Saving…' : 'Set new password'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </>
  );
}
