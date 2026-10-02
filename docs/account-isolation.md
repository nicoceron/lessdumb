# Per-user learning engine audit

## Data ownership

Course content is shared and immutable. Learner data is not: each request to the progression engine receives one learner's `Progress`. It contains answer evidence, permanent reward IDs, attempt history, review state, dates, and XP. The surrounding `LearnerState` carries that learner's goal, selected course, cards, and Anki preferences.

The authenticated server chooses the database key from Better Auth's validated session. A request body cannot supply an owner. Query parameters do not select another learner. `X-Lessdumb-User` only confirms the browser's expected active account and rejects a stale cookie/account combination. SQLite transactions enforce revision checks before storing an account snapshot.

The browser loads `lessdumb.guest` for a guest and `lessdumb.account.<id>` for an authenticated learner. Owner checks happen during render and inside state updates, before a previous account's state can be written under a new account. Account changes abort old save operations, invalidate generations, and reject late load/save continuations. Local caches support offline work; they are ordinary browser storage, not encrypted private vaults.

Guest progress migrates only to an empty account. A claim prevents another account from importing that same pending guest snapshot. The guest copy is removed only after a durable account write, and only if it still equals the imported snapshot. Signing out restores a separate guest workspace rather than treating account progress as guest progress.

## Verified scenarios

`tests/backend.test.ts` uses the real Better Auth handler, real scrypt authentication, real session cookies, and a temporary SQLite file. The two-account engine regression verifies:

- One learner has a mastered Python skill with a due review; another has systems mastery evidence removed by a wrong answer and is scheduled to relearn.
- Their goals, selected courses, deck names, attempt histories, and mastery/mistake cards remain different after independent writes and reads.
- Completing the first learner's review advances only that learner's interval, review count, and XP; the second account's state and revision remain unchanged.
- An authenticated learner cannot select the other account using an identity header, query parameter, or extra body owner field.

`tests/engine-users.spec.ts` uses two actual authenticated browser contexts and visible learning controls. One learner masters a systems skill; the other makes a Python mistake. It checks separate cards and preferences after reload, advances the first learner's clock to a due review, completes that review, and confirms the other learner remains unchanged. A second browser regression learns as a guest, verifies a durable import into the first account, signs out, opens a new empty account, and confirms no guest/account progress crosses into it.

`tests/account-sync.spec.ts` covers failed cloud loads, retry/merge preservation, an old tab holding another account's cookie, and a delayed account response crossing an account switch. `tests/anki-account.spec.ts` separately exercises delayed Anki connection and synchronization ownership. The pure answer helper tests ensure an async grade applies to current state without replacing unrelated work or duplicating an event/card.

## Enforcement and limits

Python grading and progression run on the client, using the official Pyodide runtime. The server validates ownership, request shape, request size, and revisions. It does not re-execute submitted code or independently certify scores. A learner with access to developer tools can alter their own claimed state; this MVP provides personal-learning persistence rather than a server-authoritative examination system.

Requests are limited to 2 MiB, and retained attempt logs are limited to 5,000 entries. The engine currently retains all attempts. Long-running use beyond those limits requires a deliberate history-compaction or event-storage migration; this audit does not change retention behavior.

The authenticated account tests do not prove public deployment, multi-instance SQLite operation, email verification/recovery delivery, or AnkiWeb cloud upload. Those are separate integration/deployment concerns.
