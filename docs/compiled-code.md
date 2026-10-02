# Rust and C++ execution

Python continues to execute in a separate, terminable Pyodide browser worker.
Rust and C++ use Compiler Explorer's documented public API. No learner program
is executed by the lessdumb Node process or directly on the machine hosting it.
There is no paid provider, API key, external crate installation, or billing path.

The browser calls `runCode(code, tests, language, context)`. For a compiled
exercise, `context` includes `skillId`, `questionId`, the signed-in `userId` when
present, and an optional local `AbortSignal`. The server accepts source and
catalog identifiers only. It selects the catalog assessment, verifies its
language, and appends the authored harness. Browser-supplied tests, compiler
flags, files, URLs, or user identifiers in the request body are rejected.
Saved examples are checked against their catalog source. Code lab runs omit
assessment identifiers and provide execution feedback without mastery credit.

Rust and C++ exercises show the canonical authored checks in a separate,
syntax-highlighted required-behavior block. The function signature, expected
results, and finite boundary cases are therefore available before submission.
This display does not reveal the reference implementation or the per-run
completion nonce.

Compiler Explorer receives only source code (including the authored tests),
the language, fixed flags, and execution options. Account identifiers, cookies,
progress, flashcards, and passwords are never forwarded. Source code leaves
the browser and the application's host to use this free service; do not put
secrets in exercises. `allowStoreCodeDebug` is false, and the adapter never
creates a persistent short link. Compiler Explorer's own caching and service
policies still apply.

The pinned compilers are GCC 15.2 (`g152`) with C++20, assertions enabled and
`-pthread`, and rustc 1.96.0 (`r1960`) with Rust 2021. Exercises use the standard
library. They do not depend on network access, persistent files, external
packages, or devices. The provider's sandbox controls process limits. The
adapter adds a 35-second request deadline, four concurrent jobs per Node
process, 30 requests per minute per account or guest network address, 24 KB
source and 40 KB request bounds, a 128 KB provider response bound, and capped
plain-text output. Rate limit counters are bounded and exist only in memory.
Production with multiple server processes must place a shared rate limit in
front of the endpoint if it needs a fleet-wide quota.

Only successful compilation (`buildResult.code === 0`), confirmed execution
(`didExecute === true`), successful execution (`code === 0`), and completion of
the canonical assessment harness produce a passing exercise result. The server
creates an unpredictable 128-bit nonce per run and appends a fully qualified
print statement after the authored assertions, immediately before the final
brace of the harness's `main`. The trusted authoring contract places `main` last
and lets it finish normally; learner source is never parsed or rewritten. The
exact completion line must appear once. It is checked before output truncation
and removed from displayed output. Returning exit status zero from a learner
function via `std::exit(0)` or `std::process::exit(0)` cannot prove completion.
A printed "passed" string cannot replace any of these checks. Lab programs and
saved examples have execution feedback and use compile/execution status only.
Compiler diagnostics, assertion failures, runtime errors, empty work, missing
assessment completion proof, and
confirmed execution timeouts are observed failed answers. HTTP errors,
service capacity, malformed responses, missing execution, build transport
timeouts, network failure, account changes, and cancellation are infrastructure
failures. The learning session must leave mastery unchanged for these failures.
An `X-Lessdumb-User` guard compares the current session with the originating
learner, so a tab whose cookie changed cannot grade on another account.
The normal client-side prerequisite gate still applies; this endpoint provides
execution feedback, not certified grading or an anti-cheat boundary.

The implementation follows the official
[Compiler Explorer REST API](https://github.com/compiler-explorer/compiler-explorer/blob/main/docs/API.md),
including `executorRequest`, `filters.execute`, language IDs, compiler IDs, and
`allowStoreCodeDebug`. Live verification on 2026-10-02 compiled and executed
both a C++20 program and a Rust 2021 program with zero compiler and execution
exit codes. A Rust `std::thread::spawn`/`join` assertion also executed successfully.
Separate live probes in each language verified a compiler error (compiler exit
1, no execution), and a failed assertion (compiler exit 0; C++ execution exit
134 and Rust execution exit 101). These response shapes are regression-tested.
Four additional calls through the production-built `/api/code` endpoint verified
that both authored solutions pass while both early-exit-zero functions fail.
No completion token remained in the displayed output.
Unit tests use injected transport responses, including compiler and runtime
failures, spoofed stdout, outages, cancellation, body bounds, rate limits,
concurrency, canonical harness selection, and account ownership. They do not
send every test run to the shared free provider.

The public service can change availability, compiler versions, quotas, or
terms. An outage therefore blocks compiled execution while preserving learner
evidence. Updating compiler IDs requires checking the live compiler listing,
executing both language probes, and rechecking the authored catalog with those
language standards.
