# lessdumb

Learn deliberately. Remember automatically.

lessdumb is a working adaptive learning MVP built with Astro, React, shadcn/ui, and free ReUI components. It combines a prerequisite knowledge graph, original lessons, real Python exercises, evidence-based progression, spaced review, account persistence, and automatic Anki card creation. The application runs locally with free tools and no paid backend dependency.

## Quickstart

Requirements: **Node.js 22.12 or newer** and npm. **Python 3** is also needed to run the curriculum verification tests; learners execute Python in the browser and do not need a local Python installation.

```sh
npm ci
npm run dev
```

Open [http://127.0.0.1:4321](http://127.0.0.1:4321). The install script copies the pinned Pyodide core and downloads official NumPy, pandas, scikit-learn, and dependency wheels, verifying their SHA-256 hashes against Pyodide’s lockfile. Subsequent setup reuses verified local files. Python execution and these packages are served from this application; learner code is not sent to a runtime CDN.

If port 4321 is occupied, keep the server and authentication origins aligned:

```sh
BETTER_AUTH_URL=http://127.0.0.1:4322 npx astro dev --host 127.0.0.1 --port 4322
```

Then open [http://127.0.0.1:4322](http://127.0.0.1:4322). Use the same hostname and port consistently when signing in. `npm ci` already performs the Python asset-copy step for the direct Astro command.

## What you can do

- **Today:** follow the next adaptive task, set a daily XP goal, and see your practice history and streak.
- **My learning:** choose from 301 connected skills across six courses through short explanations, examples, prediction questions, and executable exercises.
- **Knowledge graph:** inspect prerequisites, see mastery and availability, search skills, and explore their connections.
- **Flashcards:** receive recall cards after mastery and correction cards after mistakes; connect Anki or export a tab-separated deck.
- **Python lab:** experiment with real Python in a separate playground without changing mastery.
- **Accounts and settings:** create an email/password account, save progress across browsers using the same server, configure Anki, and export a JSON backup.

You can start as a guest. Guest progress is saved on the device; creating a new account can carry that progress into the account. Signed-in learners retain a device copy while account sync is unavailable and can retry from Settings.

## Connected course catalog

| Course                   |  Skills | Questions | Executable exercises | Anki cards |
| ------------------------ | ------: | --------: | -------------------: | ---------: |
| Python foundations       |      24 |        96 |                   24 |         48 |
| Quantitative foundations |       5 |        20 |                    5 |         10 |
| Python for Data Analysis |      24 |        96 |                   24 |         48 |
| Machine Learning         |      28 |       112 |                   21 |         56 |
| Data Systems             |      28 |       112 |                    0 |         56 |
| Competitive Programming  |     192 |       768 |                  192 |        384 |
| **Total**                | **301** | **1,204** |              **266** |    **602** |

Selecting a course saves a learning goal. The scheduler includes its prerequisite ancestors across courses, so missing foundations become real tasks rather than a dead end. The graph offers course paths with supporting prerequisites and an all-course view. Each node retains a domain and course identity, and its detail panel navigates both prerequisite and dependent edges.

The three supplied books inform concept coverage; lessons, examples, questions, datasets, and cards are original. Source notes record exact scope: [data analysis](docs/sources/data-analysis.md), [machine learning](docs/sources/machine-learning.md), and [data systems](docs/sources/data-systems.md). The supplied data-systems early release contains chapters 1–8. The seven neural architecture skills assess concepts using choices and small Python analogues; the browser runtime does not execute TensorFlow/Keras training. This is a focused course catalog, not a reproduction of the books or their full exercise sets.

Competitive Programming draws its topic paths from the supplied USACO and NeetCode reference inventories. Its 12 units cover contest reasoning, collections, prefix/window techniques, search, stacks/heaps/tries, recursion/trees, graph traversal, routes/connectivity, dynamic programming, greedy/bitmask/geometry techniques, number theory, and dynamic range queries. Each of its 48 algorithm topics has three individually taught and assessed concepts followed by the original application skill: 192 nodes with 768 checks. Stable application IDs and earned evidence remain; newly added concepts require their own proof. Every node has a real Python function assessment and connects to existing Python foundations; geometry also uses the quantitative vector branch. The course exposes the public USACO Guide and NeetCode roadmap. [Source and graph mapping](docs/sources/competitive-programming.md) records the inspected references and scope.

The dashboard layout follows the compact course/progress/task pattern visible in [Math Academy’s official public dashboard screenshot](https://www.mathacademy.com/img/screenshots/student-dashboard.png), with independent branding and implementation.

## Python foundations

The curriculum contains **24 original skills, 96 questions, 24 runnable code exercises, and 48 mastery flashcards**, plus correction cards generated from mistakes. Each skill has three choice/prediction questions and one executable exercise.

| Unit                | Skills                                                                                     |
| ------------------- | ------------------------------------------------------------------------------------------ |
| First programs      | Your first output; Names and variables; Numbers and arithmetic; Build strings              |
| Make decisions      | Types and conversion; Compare values; Combine conditions; Choose a branch                  |
| Work with sequences | Collect values in lists; Access by index; Repeat with for; Count with range                |
| Build with loops    | Accumulate a result; Repeat while a condition holds; Change a list; Take a slice           |
| Organize your code  | Map keys to values; Loop through mappings; Define a function; Return a result              |
| Solve real problems | Design useful inputs; Transform and filter; Handle expected failures; Build a word counter |

Skills unlock through their graph prerequisites rather than an arbitrary calendar. Mastery requires a correct answer to **all four distinct questions without a hint**, including a passing Python exercise. Repeating one question cannot unlock a skill or farm learn XP. Hints support practice but do not count as independent mastery evidence.

Initial mastery schedules a review one day later. A due review cycle needs two distinct independent answers, including executable code. Later spacing uses FSRS-6 memory state per learner and skill, with a 90% target retention and a 365-day maximum. Independent review cycles strengthen memory; cycles needing a hint receive Hard rather than Good. Defaults are shared model parameters, not individually fitted weights. A mistake removes the relevant answer evidence and prompts remediation; it does not erase unrelated prerequisite knowledge. XP and streaks reflect practice in the learner's timezone.

See [the engine audit](docs/engine-audit.md), [per-user isolation evidence](docs/account-isolation.md), [interface components](docs/ui-components.md), and [the learning design](docs/learning-design.md) for the evidence model, scheduling rules, sources, and limitations. The supplied _The Math Academy Way_ informed the prerequisite/mastery/retrieval design. lessdumb uses its own content and scheduler and does not claim parity with Math Academy's proprietary algorithms or outcomes.

## Real Python in the browser

Exercises and the lab use **Pyodide**, a WebAssembly Python runtime, through a dedicated Web Worker. Exercise assertions run against the learner's actual variables, functions, and captured output. Each run gets a separate namespace and worker; execution is terminated after 30 seconds so an infinite loop does not block the application. Learner code is not executed on the account server.

The editor uses CodeMirror with Python syntax support. The bundled runtime is a substantial download on first use. General-purpose third-party package installation is outside this MVP.

## Free accounts and persistence

The Astro Node server uses **Better Auth's documented SQLite adapter** for email/password accounts. Authentication uses the library's password hashing, sessions, and origin protections. Progress reads and writes are scoped to the signed-in account; versioned revisions detect stale saves, and the client combines progress before retrying a conflict.

On the first account request, the server initializes:

- `data/lessdumb.sqlite`: account records, sessions, and learner state.
- `data/auth-secret`: a generated local signing secret so sessions survive a restart.

The `data/` directory is ignored by Git. Keep it to preserve local accounts and progress. No Supabase project or external account provider is required. The default local setup trusts `http://localhost:4321` and `http://127.0.0.1:4321`; set `BETTER_AUTH_URL` when changing the origin.

The MVP does not send verification or password-reset emails. Email is a login identifier and is not marked as verified. Read [backend documentation](docs/backend.md) for the account API, migrations, and server configuration.

## Connect your Anki account

lessdumb connects to **Anki desktop through AnkiConnect**. Anki desktop synchronizes its collection with the AnkiWeb account attached to that profile. lessdumb does not log into AnkiWeb directly or ask for an AnkiWeb password.

1. Install the free [Anki desktop application](https://apps.ankiweb.net/) and open the profile you want to use.
2. In Anki, select **Tools → Add-ons → Get Add-ons**, enter **2055492159**, and restart Anki.
3. Use Anki's **Sync** button to connect that profile to your AnkiWeb account.
4. Keep Anki open. In lessdumb Settings or Flashcards, choose **Connect Anki** and approve the website origin in Anki if requested.
5. Check the connected profile name. New cards sync automatically into `lessdumb::Learning` while the connection is active.

Cards have stable identities, so retries find or update existing notes. Failed cards remain queued for retry. Profile changes stop sending until you reconnect. A saved connection must be reconnected in a new browser session; an optional AnkiConnect API key stays in that session. Use Anki's own Sync to upload locally created cards to AnkiWeb.

The [complete Anki guide](docs/anki.md) covers setup, permissions, profiles, optional API keys, note types, troubleshooting, and the documented API. The Flashcards page also exports TSV for manual Anki import.

## Build and run the server

```sh
npm run build
npm start
```

`npm start` defaults to **127.0.0.1:4321** and respects an explicitly configured `HOST` or `PORT`. For a production host, set these **runtime environment variables**:

| Variable              | Purpose                                                                   |
| --------------------- | ------------------------------------------------------------------------- |
| `NODE_ENV=production` | Enables production configuration checks.                                  |
| `BETTER_AUTH_URL`     | The application's public origin, for example `https://learn.example.com`. |
| `BETTER_AUTH_SECRET`  | A stable, randomly generated secret of at least 32 characters.            |
| `LESSDUMB_DATA_DIR`   | An absolute path to persistent writable storage for SQLite.               |
| `HOST`, `PORT`        | Optional listening address and port; defaults are `127.0.0.1` and `4321`. |

Generate the signing secret once and retain it in the host's environment configuration. The production backend rejects missing auth URL/secret settings. A standalone Node process reads environment variables supplied by the host or shell; exporting them is required unless your process manager loads them.

For a different listening address or port:

```sh
HOST=0.0.0.0 PORT=8080 npm start
```

This command assumes the production variables above are already configured. Serve the public origin over HTTPS and retain the persistent data directory. SQLite suits one Node server instance. A host with disposable storage cannot retain accounts; horizontal scaling needs a supported shared database and a migration of learner state. No public deployment is implied by running a local build.

## Verification

```sh
npm run check
npm test
npm run build
```

Run the complete checks, including formatting, with:

```sh
npm run verify
```

The Vitest suites cover curriculum graph integrity and reachability, distinct mastery evidence, hints, remediation, question rotation, spacing, XP replay resistance, timezone/streak boundaries, state merging, account isolation, revision conflicts, Python execution handling, and the Anki integration protocol. Native Python checks the foundation curriculum. Real Pyodide executes all 266 code solutions and 273 executable lesson examples, including scientific packages; all empty submissions must fail. Scenario examples use explicit text presentation rather than Python execution.

For browser tests, install Chromium once, leave the development server running, and use another terminal:

```sh
npx playwright install chromium
npm run test:e2e
```

To test an alternative server origin:

```sh
LESSDUMB_E2E_URL=http://127.0.0.1:4322 npm run test:e2e
```

Playwright uses an already running server; it does not start one automatically. Browser account tests create test accounts in that server's database. The full suite respects the production signup quota by waiting for Better Auth's retry header; it does not disable account rate limits. Anki protocol tests simulate the local API; a real desktop connection and an AnkiWeb upload remain separate integration checks.

The October 2, 2026 granular Competitive Programming and FSRS release passed **652 Vitest tests, 23 Playwright tests, formatting, type checks, and the production build**. Browser coverage includes atomic topic stages, adaptive review interleaving, two authenticated learners with different mastery/review/mistake histories, durable guest migration, delayed account and Anki responses, real NumPy/scikit-learn execution, real prefix/Fenwick grading with earned cards, prerequisite lapse gating, and Sheet/Dialog keyboard focus with deliberately delayed hydration.

## Project structure

```text
src/components/App.tsx          Workspace, course goals, knowledge graph
src/components/learning-session.tsx  Lessons, assessment, real Python grading
src/components/secondary-pages.tsx   Flashcards, settings, account Dialog, Python lab
src/components/ui/              shadcn/ui source components
src/components/reui/            Free ReUI Stepper and CodeBlock
src/components/useLearner.ts    Device persistence and account synchronization
src/lib/curriculum.ts           Original course, unit, skill, question, card registry
src/lib/learning.ts             Mastery evidence, task selection, review, XP, streaks
src/lib/retention.ts            Per-learner FSRS memory and recall estimates
src/lib/activity.ts             Durable offline answer counters
src/lib/python.ts              Terminable Python worker client
public/python-worker.mjs       Real Pyodide execution and exercise assertions
src/lib/anki.ts                 Documented AnkiConnect client and note identity
src/lib/state.ts                Versioned learner state and conflict merging
src/lib/server/                SQLite auth, state storage, API validation
src/pages/api/                 Auth and learner-state endpoints
src/styles/global.css          Application styling and responsive layout
scripts/copy-python.mjs         Prepares pinned runtime and hash-verified scientific wheels
scripts/serve.mjs               Starts the built server with configurable host/port
tests/                         Unit, integration, and browser tests
docs/                          Learning, backend, and Anki implementation notes
```

## Growing the knowledge graph

Courses, units, and skills have stable IDs. Skills declare a domain, course, unit, and explicit prerequisite IDs; a course lists its member skills. To add content, add an original catalog module under `src/lib/courses/` and register it in `src/lib/curriculum.ts`, author its questions and cards, and run the graph validator and tests to catch missing references and cycles. Keep published IDs stable so saved progress and Anki notes continue to refer to the same concepts.

The graph, scheduler, and account-state model support additional programming languages, mathematics, physics, and natural languages. Skills can declare an assessment policy with required review question types and an answer count. Choice-only math or vocabulary skills can be mastered and reviewed without Python; the launched Python course explicitly requires code and choice evidence in its reviews. Learning functions also accept an optional catalog for independent subject registries, with cross-course prerequisites validated as one graph.

The implemented catalog includes Python, quantitative foundations, Python for Data Analysis, Machine Learning, Data Systems, and Competitive Programming. Mathematics, physics, and natural-language domains can extend the same graph with stable IDs and appropriate assessments.

## MVP boundaries

The scheduler uses transparent default intervals rather than a calibrated personalized memory model. Each skill has four authored questions, with no placement test, unlimited generated question bank, or automatic transfer credit between subjects. Account email delivery/recovery and a backup-import interface are not implemented. The app provides exports, local persistence, and same-server account sync; it does not provision hosting or a managed cloud service.
