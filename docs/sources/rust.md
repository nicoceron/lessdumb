# Rust curriculum sources and execution boundaries

The Rust course contains **128 focused skills in 32 four-skill topics**, with **512 original questions, 128 Rust implementation exercises, 128 executable examples, and 256 original flashcards**. Each skill isolates one rule, traces a complete program, checks an implementation decision, and requires an independently written function or type-backed operation. Every implementation exercise displays its canonical assertion contract above the editor. The topic metadata groups the visible graph; explicit prerequisites determine eligibility.

The course starts at `rust-main` without requiring Python. Its graph includes real branches: optional-value fundamentals precede optional UTF-8 operations; enum patterns precede recoverable errors; error propagation precedes optional-error transposition. Ownership and slice foundations feed both abstraction and systems work. A failed ancestor blocks its dependents while unrelated mastered branches retain their evidence.

The ten units cover first programs; ownership and borrowing; records, enums, Option and Result; vectors, maps and sets; generics, traits, lifetimes, closures and iterators; modules, Cargo concepts and test contracts; smart pointers and interior mutability; threads, synchronization, atomics, Send/Sync and async mechanics; unsafe invariants, C boundaries, binary layouts and storage costs; and algorithm applications plus a four-step length-prefixed binary codec.

## Primary references

Read before authoring, on 2026-10-02:

- [The Rust Programming Language](https://doc.rust-lang.org/book/) for the instructional map and language fundamentals.
- [Ownership and borrowing](https://doc.rust-lang.org/book/ch04-00-understanding-ownership.html) for move, borrow, and allocation relationships.
- [Fearless concurrency](https://doc.rust-lang.org/book/ch16-00-concurrency.html) for threads, channels, shared ownership, and Send/Sync contracts.
- [Async fundamentals](https://doc.rust-lang.org/book/ch17-00-async-await.html) for future-based task progress and the distinction between concurrency and parallelism.
- [Rust Reference](https://doc.rust-lang.org/reference/) for stable language semantics.
- [Cargo Book](https://doc.rust-lang.org/cargo/) for package, crate, compilation, and testing concepts.
- [Standard library Poll](https://doc.rust-lang.org/std/task/enum.Poll.html) for Pending, Ready, and wakeup obligations.
- [Standard library raw-slice safety contract](https://doc.rust-lang.org/std/slice/fn.from_raw_parts.html) for alignment, initialization, allocation, aliasing, and lifetime obligations.
- [Rustonomicon](https://doc.rust-lang.org/nomicon/) for unsafe boundary design.

The curriculum text, questions, programs, and cards are independently authored. These links support topic selection and semantic checks; no book chapter, exercise bank, proprietary solution, or paid tutorial is imported.

## What the assessments execute

All exercises are single-file, standard-library-only Rust, compatible with edition 2021. Learner code defines functions or local types; the system appends a catalog-owned `fn main` assertion harness. Complete lesson examples contain their own `fn main` and print a deterministic Debug-formatted result. No dependency installation is necessary for these examples.

Thread examples use bounded spawn/join or scoped-thread operations. Shared-state examples lock before access, join workers, and avoid timing assumptions, sleeps, filesystem operations, and network access. Atomic examples assess individual operation semantics and valid ordering choices; their deterministic output does not prove an arbitrary concurrent algorithm correct.

Async examples execute `ready`, a finite custom Pending-to-Ready future, pinning, and a ready-only await composition through explicit polling. They demonstrate the language and Future contracts. They do not implement a production executor, asynchronous network client, Tokio integration, or persistent service.

Cargo examples assess crate-name normalization, the three numeric components of a basic version, conditional compilation, and testable library calculations. The version parser deliberately excludes prerelease/build metadata and does not implement the full semantic-version specification. The browser does not create multi-file Cargo workspaces or download crates. C interoperability examples cover `repr(C)`, a locally defined C-ABI function, validated C strings, and explicit byte order; they do not link an external C library. Rust ecosystem breadth extends beyond this course.

## Trusted-reference verification

`tests/rust-curriculum.test.ts` compiles only checked-in teaching material through a local `rustc` process. Solutions, starters, and examples are batched into isolated Rust modules, keeping compiler invocations bounded. It checks all 128 solution assertion harnesses, all 128 exact example outputs, all 128 unfinished starters, and every unresolved function in a batch of empty submissions. Native verification used rustc 1.96.1 and edition 2021. The runtime integration separately verifies the configured remote compiler; native reference proof is not evidence that every example has run remotely.

The course tests also simulate completion of all 128 nodes through the shared engine, mixed code/choice due review, prerequisite failure and repair, and independent learner state. These checks establish the finite catalog and its implemented policy. They do not establish unlimited exercise variation, personal fitted scheduling weights, exhaustive input correctness, or industrial unsafe-code assurance. Learner submissions are not executed by these native reference checks.
