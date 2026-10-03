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

`migrations/0001_accounts_and_progress.sql` contains the Better Auth 1.7.7 account schema generated from an empty database with its documented migration API. `0002_compressed_progress.sql` adds an encoding marker. `0003_email_budget.sql` adds the daily email counters. Apply migrations before deploying code that requires them. Do not rerun the schema generator to overwrite historical migrations when upgrading Better Auth; add and review a new migration instead.

The production database starts empty. Local accounts, cookies, signing secrets, and device-only progress are not copied into it. Guest progress on the localhost origin remains on that origin; an exported progress backup can be imported through Settings on the public application.

## Turn on email

Password reset and email verification are built in but off: the Worker has no `EMAIL` binding and no `EMAIL_FROM`, so the app hides both features and their endpoints answer `EMAIL_NOT_ENABLED` ([behavior](backend.md#email-password-reset-and-verification)). Email Sending (Cloudflare Email Service, public beta) is included in Workers Paid: 3,000 emails a month, then $0.35 per 1,000. The app caps itself at 90 a day.

The owner turns it on:

1. **Pick the sending domain**, a zone on this Cloudflare account (for example a subdomain such as `mail.hypers.dev`). Onboarding adds DNS records (SPF, DKIM, DMARC) to that zone.
2. **Onboard it to Email Service.** Either `npx wrangler login` (the current login lacks the email scopes), then `npx wrangler email sending enable <domain>`; or in the dashboard, **Compute → Email Service**, onboard the domain for sending.
3. **Edit `wrangler.jsonc`**: add the binding (the one-line change) and the sender:

   ```jsonc
   "send_email": [{ "name": "EMAIL" }],
   "vars": {
     "BETTER_AUTH_URL": "https://lessdumb.nicocerond.workers.dev",
     "EMAIL_FROM": "lessdumb <noreply@<domain>>",
   },
   ```

   The sender must be on the onboarded domain. Mail stays off if either the binding or a valid `EMAIL_FROM` is missing.

4. **Merge to `main`.** CI applies migrations and deploys. Then confirm by hand once: request a password reset for a real account and check that the email arrives.

The binding is left out of `wrangler.jsonc` until then. A config with it passes `wrangler deploy --dry-run`, and the local preview simulates it (messages are written under `.wrangler/tmp/email/`, nothing is sent), but whether a real deploy accepts a `send_email` binding before any domain is onboarded could not be verified without changing the account, so it waits for step 3. If the first deploy with the binding fails on a permission error, give the `CLOUDFLARE_API_TOKEN` token the Email Sending permission as well; this was not testable from here.

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

## Python runtime caching

Workers static assets are sent with `Cache-Control: public, max-age=0, must-revalidate` by default, so the browser asks the server about every file before using its copy. For Python that meant `pyodide.asm.wasm` (9.6 MB, 3.5 MB compressed), `python_stdlib.zip` (2.5 MB) and the package wheels (scipy alone is 14 MB), once per page load.

`scripts/copy-python.mjs` therefore puts the runtime in `public/pyodide/<version>-<hash>/`: the Pyodide version and the first ten hex digits of the SHA-256 of the lockfile it serves, which pins every wheel. The name changes whenever any file in the directory could, including a change to the package list without a Pyodide upgrade. Older directories are removed, so only the current runtime is deployed. `public/_headers` gives `/pyodide/:version/*` `Cache-Control: public, max-age=31536000, immutable`; a placeholder never matches `/`, so the rule covers only files inside a versioned directory. The worker (`/python-worker.mjs`) and `/pyodide/current.mjs`, the small generated module that names the current directory, keep the default revalidation. A local `npm run build:cloudflare` preview served the versioned files with the immutable header and `current.mjs`, the worker and the existing `_headers` entries as before.

Open tabs during a deploy:

- **Tabs from before the versioned layout** keep working without a reload. Their code starts `/python-worker.mjs` for each run, and the new worker, which still accepts their messages, loads the new directory. Only a run that was loading Python at the moment of the deploy can miss a file at the old flat path. It then reports that Python could not load: an infrastructure error, which is never scored, and the next attempt works.
- **Later deploys that change the runtime or packages** leave the old directory behind. A tab's spare worker has already loaded Python and its exercise's packages, so its run usually works. If that run needs a file it had not loaded yet, it fails the same way, without scoring, and the next spare loads the new directory. Deploys that do not change the runtime keep the directory name, so open tabs are unaffected.

## Free services and boundaries

This deployment requires no paid-only Cloudflare bindings, KV, R2, or Images. Managed email (Email Service, Workers Paid) is optional and off until configured. No paid subscription is activated by the deployment commands. Workers and D1 have free quotas; existing account billing and usage beyond allowances remain governed by the account's plan. The documented Workers Free allowance is 100,000 dynamic requests/day with 10 ms CPU/request; D1 Free has 5 million rows read/day, 100,000 rows written/day, and 5 GB total storage, with a 500 MB per-database cap. Exceeding free allowances can interrupt service. Static asset requests do not count as dynamic Worker invocations when served directly.

Credential rate limits use D1. Compiler concurrency and request buckets are per Worker isolate, not a global distributed quota. Compiler Explorer is a shared external free service and can be unavailable. Email verification and password recovery stay off until a sending domain is onboarded (see [Turn on email](#turn-on-email)). AnkiConnect runs on the learner's computer and needs their desktop Anki profile, plugin, and browser permission; deployment testing does not establish a connection to every learner's Anki installation.

Documentation consulted: [Email Service Workers API](https://developers.cloudflare.com/email-service/api/send-emails/workers-api/), [Email Service send bindings](https://developers.cloudflare.com/email-service/configuration/send-bindings/), [Email Service local development](https://developers.cloudflare.com/email-service/local-development/sending/), [Astro Cloudflare adapter](https://docs.astro.build/en/guides/integrations-guide/cloudflare/), [Better Auth databases and D1](https://better-auth.com/docs/concepts/database), [Better Auth security and password hooks](https://better-auth.com/docs/reference/security), [D1 batch transactions](https://developers.cloudflare.com/d1/worker-api/d1-database/), [D1 limits](https://developers.cloudflare.com/d1/platform/limits/), [Workers web standards](https://developers.cloudflare.com/workers/runtime-apis/web-standards/), [Workers Request](https://developers.cloudflare.com/workers/runtime-apis/request/), [Workers limits](https://developers.cloudflare.com/workers/platform/limits/), [static asset billing](https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/).
