# Accounts and saved progress

lessdumb runs locally on Astro Node with Better Auth's SQLite adapter and publicly on Cloudflare Workers with Better Auth's D1 adapter. See [Cloudflare deployment](cloudflare.md) for setup and runtime details. Accounts use email and password, scrypt password hashes, HttpOnly SameSite=Lax session cookies, and Better Auth's origin/CSRF protections. Sign-up signs the learner in; signing out revokes the server session. Better Auth owns credentials and sessions. Workers uses its documented native scrypt password hook with the same format and parameters as the default hash.

## Email: password reset and verification

Password reset and email verification use Better Auth's documented callbacks (`emailAndPassword.sendResetPassword`, `emailVerification.sendVerificationEmail` with `sendOnSignUp` and `autoSignInAfterVerification`). **Email is off by default.** It turns on only when the server has a mail transport and a sender: on Workers, the Cloudflare Email Service `EMAIL` binding plus the `EMAIL_FROM` variable ([turning email on](cloudflare.md#turn-on-email)). The Node server has no mail transport, so it always runs with email off.

The server renders an "email enabled" flag into the app (`data-email` on the app shell) and the UI follows it:

- **Email off:** no "Forgot password?" link, no "Verify your email" notice, no resend action. `/api/auth/request-password-reset`, `/reset-password`, `/reset-password/:token`, `/send-verification-email`, and `/verify-email` return HTTP 400 with `code: "EMAIL_NOT_ENABLED"` and a plain message, rather than pretending to send. Sign-up never sends anything; addresses stay unverified.
- **Email on:** the sign-in dialog offers "Forgot password?", which emails a one-time reset link valid for 1 hour. The link passes through Better Auth's `/reset-password/:token` check and lands on `/reset-password?token=…`, where the learner chooses a new password. A successful reset revokes every existing session (`revokeSessionsOnPasswordReset`), so the learner signs in again with the new password. Sign-up sends a verification link valid for 24 hours. Verification never blocks signing in or learning (`requireEmailVerification: false`); until it is done, the account dialog shows an unobtrusive "Verify your email" notice with a "Resend link" action. The link marks the address verified, signs that browser in, and returns to `/?notice=email-verified`; an expired or forged link returns with `error=` and the app says so.

`src/lib/server/mail.ts` has one `sendMail({ to, subject, text, html })`. It never throws: a missing transport or sender, a failed delivery, or a spent budget is logged and returned as a result, so sign-up and reset requests never fail because of email. Logs name only the recipient's domain. Real deliveries skip reserved names from RFC 2606 and RFC 6761 (`example.com`, `example.net`, `example.org`, and any `.test`, `.example`, `.invalid`, or `.localhost` domain), so test and smoke accounts never bounce.

Two limits protect the Email Service quota (3,000 a month on Workers Paid): Better Auth allows 3 reset and 3 verification requests per client address per minute, and the D1 `email_budget` table (migration `0003`) caps real deliveries at 90 a day overall and 5 a day per recipient. The budget fails closed: if it cannot be checked, the message is held. Recipients are stored as SHA-256 hashes and rows expire after two days.

## Account deletion

Better Auth's `deleteUser` is enabled. The account dialog has a "Delete account" action that asks for the password; the server requires it for every deletion, however fresh the session (10 attempts per minute). A `beforeDelete` hook deletes the learner's `learner_state` row in SQLite or D1 first, then Better Auth deletes the user, accounts, and sessions. A failure in the hook leaves the account intact so the learner can retry. The browser then removes its cached copy of that account's progress and opens a fresh document with a confirmation. Guest progress on the device is not touched. The same email can register again as a new, empty account.

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

`/api/auth/*` mounts Better Auth's handler directly. The browser uses its documented React client through `src/lib/account.ts`: `authClient.signUp.email`, `authClient.signIn.email`, `authClient.useSession`, `authClient.signOut`, `authClient.requestPasswordReset`, `authClient.resetPassword`, `authClient.sendVerificationEmail`, and `authClient.deleteUser`.

Better Auth's database-backed limits remain enabled: general routes allow 100 requests per 60 seconds, sign-in and sign-up allow 10 each, password-reset and verification requests allow 3 each, account deletion allows 10, and the documented `/get-session` custom rule allows 600 reads per 60 seconds for navigation, focus refreshes, and multiple tabs. The read quota is finite and separate from credential attempts. Without a trusted client-IP header, Better Auth uses its shared fallback bucket for each route; deployments behind a proxy should configure trusted IP handling according to its documentation.

An initial failed session lookup (429, server error, or network failure) leaves ownership unresolved. The app offers an account retry and does not open or write a guest workspace. Better Auth retains previously validated session data on non-401 errors; a successful null response or HTTP 401 resolves unauthenticated ownership. Cached progress alone never establishes an authenticated account.

Successful sign-out uses Better Auth's documented `fetchOptions.onSuccess` callback to reload the current route after the server revokes the session. The fresh document preserves the page location and prevents the SDK's previous account from remaining visible when its follow-up session fetch fails. Failed sign-out leaves the current document and account in place and reports the error.

`GET /api/state` requires a valid session and returns `{ state, revision }`. A new account has `{ state: null, revision: 0 }`.

`PUT /api/state` requires a valid session, same-origin JSON request, and `{ state, revision }`. The server validates the versioned learner state and performs an atomic compare-and-swap. A successful save returns the stored state and the next revision. A stale revision returns HTTP 409 with the current `{ state, revision }`, so a stale tab cannot silently overwrite progress from another device. The client exposes this as `StateConflictError`.

Browser reads and writes include `X-Lessdumb-User` with the account the tab believes is active. If the cookie now belongs to another account, the server rejects the request with HTTP 401 and the client refreshes its session. The header only asserts identity; the server always chooses the storage scope from the authenticated session.

`POST /api/code` supports Rust and C++ for guests and signed-in learners. It requires same-origin JSON containing `{ language, code, skillId?, questionId? }`. For an exercise, the server verifies the catalog identifiers/language and appends its authored assertions. Clients cannot choose compiler flags, provider URLs, files, or replacement tests. Lab runs omit exercise identifiers and do not award mastery. Signed-in calls include the same `X-Lessdumb-User` ownership guard, and stale-account calls return HTTP 401 before reaching the compiler. No learner state is written by this endpoint.

The server uses Compiler Explorer's documented free public API with pinned GCC 15.2/C++20 and rustc 1.96.0/Rust 2021. Only source and fixed execution settings leave the server; account data and cookies are never forwarded. Learner code does not execute on the application host. Exercises require successful compiler/execution exit codes plus an unpredictable, server-authored completion marker after their assertions. This rejects a function that exits zero before its checks finish; the marker is removed before UI output. Strict source/body/response limits, a request deadline, bounded concurrency, and per-process rate limits protect the adapter. Runtime or assertion errors are failed answers; service, connection, ownership, cancellation, or transport failures are infrastructure and must not change mastery. See [compiled execution](compiled-code.md) for exact limits and the deployment boundary of process-local quotas.

The browser maintains separate guest and per-account caches. Unknown cloud revisions block account saves until a successful load; Retry and reconnect load the server state first. Guest progress migrates only into an empty account, and the original guest copy is removed after a durable account save. Merges preserve distinct attempts and permanent XP ledgers, reconcile chronological answer evidence, and keep later failures as failures.

Learner state uses generic skill IDs and a versioned structure. Authentication never accepts a client-supplied user ID: all reads and writes are scoped to `session.user.id`. This supports future subject catalogs without changing account isolation. Anki API keys stay on the browser and are never accepted in the learner-state schema.

## Per-learner engine behavior

The knowledge graph and authored questions are shared course data. The engine receives a particular learner's `Progress` on every call: mastery, prerequisite unlocking, the next task, review due dates, XP, and streaks are derived from that state. Account-specific goals, course selection, and Anki queues live in the same versioned learner state. The engine does not maintain a process-wide mutable learner record.

Progression and Python grading are trusted client-side calculations. Rust/C++ execution is verified through the server's canonical harness and Compiler Explorer response, but there is no signed grade receipt or server-side progression ledger. The state endpoint enforces authentication, ownership, shape, request limits, and revision consistency; it does not certify every claimed correct answer. This is suitable for the current personal-learning MVP, and differs from server-authoritative examination or competitive scoring.

The schema permits up to 5,000 retained attempts for older clients and a 4 MiB state request. The local-cache reader shares this limit and checks UTF-8 byte size. Cards are stored by reference since state version 8 ([cards in learner state](anki.md#cards-in-learner-state)), so lesson text never counts against the limit. The full 721-skill catalog, completed with a mistake and repair on every question its lessons serve, produces a 1,875,265-byte snapshot (45% of the limit, 149 KB gzipped) with all 5,997 mastery/mistake cards; when cards copied their text it was 4,104,654 bytes (98%). A real authenticated save/read regression covers this state and requires at least 25% headroom (`tests/backend.test.ts`). A production-built browser regression also verifies guest reload, account migration/cloud save, and account cache retention while the state endpoint fails. The engine compacts recent diagnostic events to 2,000 while preserving question evidence checkpoints, permanent reward ledgers, XP/calendar totals, per-runtime grow-only activity counters, and FSRS memory. Writer contributions remain for convergent offline merges and are subject to the finite payload limit. Older snapshots without writer provenance remain readable, but independently divergent legacy histories cannot always be reconstructed exactly. Full historical event archiving is not implemented; see [account isolation](account-isolation.md) for persistence boundaries.

## Verification

`npm test` includes real account/session persistence, per-account isolation, stale-cookie rejection, revision conflicts, schema validation, and progress reconciliation tests. `LESSDUMB_E2E_URL=http://127.0.0.1:4321 npm run test:e2e` runs browser tests against a running local server; these exercise failed cloud loads, retry behavior, and account switches in another tab. Browser tests create unique test accounts in that server's ignored database.

`tests/mail.test.ts` covers disabled mail, reserved-domain skips, sender parsing, delivery failures, the budget, and message content. `tests/account-email.test.ts` drives the real Better Auth handler with email off (every email route refuses) and on, through an injected capturing transport (verification on sign-up, resend, invalid links, reset through the emailed link with session revocation and one-time tokens, unknown emails, failed delivery) and checks that deletion requires the password and removes the user, sessions, and progress. `tests/cloudflare-backend.test.ts` checks D1 progress deletion and the budget, including concurrent sends.

The rate-limit regression uses the real Better Auth handler and SQLite: 600 session reads succeed and the next returns 429 with a retry header, while the eleventh credential attempt is still rejected. Adapter tests cover initial rate-limit, outage, and network errors, retained authenticated data, retry, and confirmed unauthenticated responses.

The compiled endpoint suite uses injected transport for canonical harness selection, language mismatches, source-only forwarding, owner changes, compiler/runtime exit codes, malformed responses, source/body limits, cancellation, provider outages, rate limits, and concurrency. Separate live probes compiled and executed both languages successfully and verified compiler errors and assertion failures without executing learner code on the host.

## Documentation consulted

- [Better Auth Astro integration](https://better-auth.com/docs/integrations/astro)
- [Better Auth SQLite adapter](https://better-auth.com/docs/adapters/sqlite)
- [Better Auth programmatic migrations](https://better-auth.com/docs/concepts/database#programmatic-migrations)
- [Better Auth email and password](https://better-auth.com/docs/authentication/email-password)
- [Better Auth email verification](https://better-auth.com/docs/concepts/email)
- [Better Auth user deletion](https://better-auth.com/docs/concepts/users-accounts#delete-user)
- [Better Auth hooks](https://better-auth.com/docs/concepts/hooks)
- [Better Auth security](https://better-auth.com/docs/reference/security)
- [Better Auth client](https://better-auth.com/docs/concepts/client)
- [Better Auth rate limits](https://better-auth.com/docs/concepts/rate-limit)
- [Better Auth sessions](https://better-auth.com/docs/concepts/session-management)
- [Astro Node adapter](https://docs.astro.build/en/guides/integrations-guide/node/)
- [Compiler Explorer REST API](https://github.com/compiler-explorer/compiler-explorer/blob/main/docs/API.md)
