# Cloudflare deployment

Public application: [lessdumb.nicocerond.workers.dev](https://lessdumb.nicocerond.workers.dev).

The Cloudflare build uses Astro's official Workers adapter, Workers Static Assets, and the `lessdumb` D1 database. Better Auth's native D1 adapter stores accounts, sessions, and credential rate limits. Learner progress is scoped to the authenticated user and stored separately with atomic revision checks. Python and scientific package assets are served from the deployment. Rust/C++ source uses the existing Compiler Explorer service.

## Deploy

**Every push to `main` deploys automatically.** After the `verify` and `cloudflare` CI jobs pass, the `deploy` job in `.github/workflows/ci.yml` applies pending production D1 migrations and runs `npm run deploy:cloudflare`. It authenticates with the `CLOUDFLARE_API_TOKEN` repository secret: a Cloudflare API token with Workers Scripts Edit and D1 Edit on this account. A newer push to `main` never cancels a deploy in progress.

To deploy by hand, or to set up another account, use Node 24 or newer and the repository's locked dependencies. Authenticate Wrangler to the intended account, then check `account_id`, the D1 database ID, and the public `BETTER_AUTH_URL` in `wrangler.jsonc` before deploying to another account.

```sh
npm ci
npx wrangler login
npx wrangler whoami
npm run db:migrate:cloudflare
npx wrangler secret put BETTER_AUTH_SECRET
npm run deploy:cloudflare
```

Supply a randomly generated signing secret of at least 32 characters at the secret prompt. Keep it stable across releases. It belongs in Cloudflare's secret store, never Git, a public variable, or the browser. The deployment script builds first; Astro generates `dist/server/wrangler.json` and Wrangler discovers it through `.wrangler/deploy/config.json`. No deployment token is committed; CI reads it from the repository secret.

`migrations/0001_accounts_and_progress.sql` contains the Better Auth 1.7.7 account schema generated from an empty database with its documented migration API. `0002_compressed_progress.sql` adds an encoding marker. Apply migrations before deploying code that requires them. Do not rerun the schema generator to overwrite historical migrations when upgrading Better Auth; add and review a new migration instead.

The production database starts empty. Local accounts, cookies, signing secrets, and device-only progress are not copied into it. Guest progress on the localhost origin remains on that origin; an exported progress backup can be imported through Settings on the public application.

## Local Workers verification

Create an ignored `.dev.vars` file for isolated test credentials:

```dotenv
BETTER_AUTH_URL=http://127.0.0.1:4333
BETTER_AUTH_SECRET=local-worker-test-secret-at-least-32-characters
```

Then run:

```sh
npm run build:cloudflare
npx wrangler d1 migrations apply lessdumb --local
LESSDUMB_E2E_URL=http://127.0.0.1:4333 npm run test:e2e -- --config playwright.cloudflare.config.ts
```

Playwright starts the foreground preview with its native `webServer` lifecycle, waits for HTTP readiness, and stops it after the browser suite. The documented `--ignore-lock` preview flag keeps the test server in the foreground when Astro detects an agent; Playwright exclusively owns the configured port. CI does not run this browser suite for now; it builds the Worker and applies local D1 migrations, with a 15-minute job limit, and cancels superseded runs. Preview uses local workerd and D1; it does not use the production database. Create `.dev.vars` **before building**: the Cloudflare Vite plugin stages these local values into the generated preview configuration. They are not a deployment secret source. The default `npm run build` and `npm start` remain the Node/SQLite version. Both builds use `dist`, so rebuild for the intended target before running or deploying it.

## Runtime and storage

D1 writes use a conditional insert or update followed by a read in one atomic `batch`. Concurrent first saves or updates at the same revision have exactly one winner; stale requests receive the current snapshot instead of overwriting it. Account ownership is always derived from the Better Auth session.

D1 progress is gzip-compressed using the runtime's native `CompressionStream` and stored as base64. This preserves the existing 4 MiB request contract and the complete catalog with correction cards while staying below D1's 2 MB row limit. Uncompressed legacy rows remain readable and are upgraded on their next save. A compressed value above 1.9 MB returns HTTP 413 without changing the previous revision. Finite storage limits still apply.

Workers password hashing uses Better Auth's documented password hook with native Node-compatible scrypt. Its N=16384, r=16, p=1, 64-byte key, Unicode normalization, salt representation, and stored hash format match Better Auth's default. Tests verify compatibility in both directions. The hook avoids the slower pure JavaScript fallback selected by Worker bundling; it does not reduce password work factors.

Activity writer IDs are initialized inside a request or browser event rather than at module evaluation, as Workers prohibits global-scope random generation. Compiler requests use `redirect: 'manual'`; redirects are rejected as non-success responses and learner source is never forwarded to a redirected host.

## Free services and boundaries

This deployment requires no paid-only Cloudflare bindings, KV, R2, Images, or managed email. No paid subscription is activated by the deployment commands. Workers and D1 have free quotas; existing account billing and usage beyond allowances remain governed by the account's plan. The documented Workers Free allowance is 100,000 dynamic requests/day with 10 ms CPU/request; D1 Free has 5 million rows read/day, 100,000 rows written/day, and 5 GB total storage, with a 500 MB per-database cap. Exceeding free allowances can interrupt service. Static asset requests do not count as dynamic Worker invocations when served directly.

Credential rate limits use D1. Compiler concurrency and request buckets are per Worker isolate, not a global distributed quota. Compiler Explorer is a shared external free service and can be unavailable. Email verification and password recovery delivery remain unconfigured. AnkiConnect runs on the learner's computer and needs their desktop Anki profile, plugin, and browser permission; deployment testing does not establish a connection to every learner's Anki installation.

Documentation consulted: [Astro Cloudflare adapter](https://docs.astro.build/en/guides/integrations-guide/cloudflare/), [Better Auth databases and D1](https://better-auth.com/docs/concepts/database), [Better Auth security and password hooks](https://better-auth.com/docs/reference/security), [D1 batch transactions](https://developers.cloudflare.com/d1/worker-api/d1-database/), [D1 limits](https://developers.cloudflare.com/d1/platform/limits/), [Workers web standards](https://developers.cloudflare.com/workers/runtime-apis/web-standards/), [Workers Request](https://developers.cloudflare.com/workers/runtime-apis/request/), [Workers limits](https://developers.cloudflare.com/workers/platform/limits/), [static asset billing](https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/).
