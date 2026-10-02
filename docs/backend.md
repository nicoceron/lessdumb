# Accounts and saved progress

lessdumb runs an Astro Node server with Better Auth's official SQLite adapter. Accounts use email and password, scrypt password hashes, HttpOnly SameSite=Lax session cookies, and Better Auth's origin/CSRF protections. Sign-up signs the learner in; signing out revokes the server session. No custom password or session implementation is used.

The MVP has no paid provider dependency. It does not send verification or password-reset emails. An email address serves as a login identifier and is not marked as verified. Production email delivery and recovery can be added using Better Auth's documented callbacks when an email provider is configured.

## Local development

Run `npm install` and `npm run dev`, then open `http://127.0.0.1:4321`. On the first account request, the server creates `data/lessdumb.sqlite`, runs Better Auth's documented `getMigrations` API with the auth configuration, and adds a `learner_state` table. Migration completes before the auth instance starts its schema validation. The entire `data/` directory is ignored by Git. A randomly generated local signing secret is saved in `data/auth-secret` with owner-only file permissions so sessions keep working after a restart. Preserve that file together with the database.

Set `BETTER_AUTH_URL` if the local port or origin changes. The default trusts only `http://localhost:4321` and `http://127.0.0.1:4321`.

## Server deployment

Build with `npm run build`, then run `npm start` on a Node host. Set these runtime environment variables:

```sh
BETTER_AUTH_URL=https://your-lessdumb-host.example
BETTER_AUTH_SECRET=<random secret of at least 32 characters>
LESSDUMB_DATA_DIR=/absolute/path/to/persistent/data
```

The production server rejects a missing URL or signing secret. Use a persistent data directory and back it up. SQLite fits a single Node instance; a host that discards local files will discard accounts and progress. Migrating to Postgres later uses Better Auth's supported database adapter plus a normal migration of the application state table. Never commit the database or signing secret.

## API

`/api/auth/*` mounts Better Auth's handler directly. The browser uses its documented React client through `src/lib/account.ts`: `authClient.signUp.email`, `authClient.signIn.email`, `authClient.useSession`, and `authClient.signOut`.

`GET /api/state` requires a valid session and returns `{ state, revision }`. A new account has `{ state: null, revision: 0 }`.

`PUT /api/state` requires a valid session, same-origin JSON request, and `{ state, revision }`. The server validates the versioned learner state and performs an atomic compare-and-swap. A successful save returns the stored state and the next revision. A stale revision returns HTTP 409 with the current `{ state, revision }`, so a stale tab cannot silently overwrite progress from another device. The client exposes this as `StateConflictError`.

Browser reads and writes include `X-Lessdumb-User` with the account the tab believes is active. If the cookie now belongs to another account, the server rejects the request with HTTP 401 and the client refreshes its session. The header only asserts identity; the server always chooses the storage scope from the authenticated session.

The browser maintains separate guest and per-account caches. Unknown cloud revisions block account saves until a successful load; Retry and reconnect load the server state first. Guest progress migrates only into an empty account, and the original guest copy is removed after a durable account save. Merges preserve distinct attempts and permanent XP ledgers, reconcile chronological answer evidence, and keep later failures as failures.

Learner state uses generic skill IDs and a versioned structure. Authentication never accepts a client-supplied user ID: all reads and writes are scoped to `session.user.id`. This supports future subject catalogs without changing account isolation. Anki API keys stay on the browser and are never accepted in the learner-state schema.

## Per-learner engine behavior

The knowledge graph and authored questions are shared course data. The engine receives a particular learner's `Progress` on every call: mastery, prerequisite unlocking, the next task, review due dates, XP, and streaks are derived from that state. Account-specific goals, course selection, and Anki queues live in the same versioned learner state. The engine does not maintain a process-wide mutable learner record.

Grading and progression are trusted client-side calculations. The server enforces authentication, ownership, state shape, request limits, and revision consistency; it does not independently execute submissions or certify that every claimed correct answer was earned. This is suitable for the current personal-learning MVP, and differs from server-authoritative examination or competitive scoring.

The schema currently permits up to 5,000 retained attempts and a 2 MiB state request. The engine keeps its attempt history rather than silently dropping it. Reaching either limit prevents a cloud save, so long-term history compaction or event storage needs an explicit migration. The current course and review tests do not constitute a retention policy beyond those limits.

## Verification

`npm test` includes real account/session persistence, per-account isolation, stale-cookie rejection, revision conflicts, schema validation, and progress reconciliation tests. `LESSDUMB_E2E_URL=http://127.0.0.1:4321 npm run test:e2e` runs browser tests against a running local server; these exercise failed cloud loads, retry behavior, and account switches in another tab. Browser tests create unique test accounts in that server's ignored database.

## Documentation consulted

- [Better Auth Astro integration](https://better-auth.com/docs/integrations/astro)
- [Better Auth SQLite adapter](https://better-auth.com/docs/adapters/sqlite)
- [Better Auth programmatic migrations](https://better-auth.com/docs/concepts/database#programmatic-migrations)
- [Better Auth email and password](https://better-auth.com/docs/authentication/email-password)
- [Better Auth security](https://better-auth.com/docs/reference/security)
- [Better Auth client](https://better-auth.com/docs/concepts/client)
- [Astro Node adapter](https://docs.astro.build/en/guides/integrations-guide/node/)
