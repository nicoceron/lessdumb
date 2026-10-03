import {
  choose,
  part,
  typeNumber,
  typeOutput,
  typeSetupOutput,
  type MultistepModule,
} from './authoring';

// Multistep problems for Rust (CEN-163). The setup's code is a complete
// program; an output part without code asks what it prints, and an output
// part with code is a complete program of its own. Catalog tests compile and
// run both with rustc.

export const multistepProblems: MultistepModule = {
  'rust-atomic-fetch': [
    {
      title: 'Hand out ticket numbers',
      setup: {
        text: [
          'A counter hands out ticket numbers from 100. `main` takes two tickets itself, then four threads take ten each.',
        ],
        code: `use std::sync::atomic::{AtomicU32, Ordering};

static NEXT: AtomicU32 = AtomicU32::new(100);

fn ticket() -> u32 {
    NEXT.fetch_add(1, Ordering::Relaxed)
}

fn main() {
    let first = ticket();
    let second = ticket();
    let mut workers = Vec::new();
    for _ in 0..4 {
        workers.push(std::thread::spawn(|| {
            for _ in 0..10 {
                ticket();
            }
        }));
    }
    for worker in workers {
        worker.join().unwrap();
    }
    println!("{} {} {}", first, second, NEXT.load(Ordering::Relaxed));
}`,
      },
      parts: [
        part(
          'rust-atomic-fetch-kp1',
          typeNumber(
            'What does the first call to `ticket()` return?',
            100,
            '`fetch_add` adds 1 and returns the value from before the addition, so the first ticket is 100.',
          ),
        ),
        part(
          'rust-atomic-fetch-kp2',
          typeSetupOutput(
            'What does the program print?',
            '100 101 142',
            'Each `fetch_add` is one indivisible step, so no increment is lost: 2 tickets in `main` and 40 in the threads move the counter from 100 to 142.',
          ),
        ),
        part(
          'rust-atomic-load-store-kp2',
          choose(
            'Why can the spawned closures call `ticket()` without moving or cloning anything?',
            [
              '`NEXT` is a static, which lives for the whole program',
              'Atomics are copied into each thread when it starts',
              '`fetch_add` pauses the other threads while it runs',
              'Closures given to `spawn` may borrow any local data',
            ],
            0,
            'A static lives as long as the program, so every thread may use it; a local would have to be moved or shared through an `Arc`.',
          ),
        ),
        part(
          'rust-thread-move-kp1',
          choose(
            'If `main` skipped the `join` calls, what could the last number be?',
            [
              'Anything from 102 to 142, depending on timing',
              'Always 142, since the threads start first',
              'Always 102, since no thread has run yet',
              'Nothing: the program would not compile',
            ],
            0,
            'Without `join`, `main` may read the counter while the threads are still taking tickets.',
          ),
        ),
      ],
    },
  ],
  'rust-compare-exchange': [
    {
      title: 'Claim a slot only once',
      setup: {
        text: [
          'A slot is free while it holds 0. `claim` stores a caller’s ID only if the slot is still free, in one atomic step.',
        ],
        code: `use std::sync::atomic::{AtomicU32, Ordering};

static OWNER: AtomicU32 = AtomicU32::new(0);

fn claim(id: u32) -> bool {
    OWNER
        .compare_exchange(0, id, Ordering::SeqCst, Ordering::SeqCst)
        .is_ok()
}

fn main() {
    let a = claim(7);
    let b = claim(9);
    println!("{} {} {}", a, b, OWNER.load(Ordering::SeqCst));
}`,
      },
      parts: [
        part(
          'rust-compare-exchange-kp1',
          typeSetupOutput(
            'What does the program print?',
            'true false 7',
            'The first claim finds 0 and stores 7. The second expects 0 but finds 7, so it changes nothing and returns `Err`.',
          ),
        ),
        part(
          'rust-atomic-load-store-kp1',
          typeNumber(
            'If `OWNER.store(0, Ordering::SeqCst);` ran between the two claims, what would `OWNER` hold at the end?',
            9,
            'Storing 0 frees the slot, so the second claim finds what it expects and stores 9.',
          ),
        ),
        part(
          'rust-compare-exchange-kp2',
          typeOutput(
            'What does this program print?',
            `use std::sync::atomic::{AtomicU32, Ordering};

static LEVEL: AtomicU32 = AtomicU32::new(3);

fn main() {
    let mut current = LEVEL.load(Ordering::SeqCst);
    loop {
        let next = current * 2;
        match LEVEL.compare_exchange(current, next, Ordering::SeqCst, Ordering::SeqCst) {
            Ok(old) => {
                println!("{} -> {}", old, next);
                break;
            }
            Err(actual) => current = actual,
        }
    }
}`,
            '3 -> 6',
            'With no other thread changing `LEVEL`, the first exchange succeeds and returns the old value 3. Under contention, `Err` would hand back the new value to retry from.',
          ),
        ),
      ],
    },
  ],
  'rust-mutex': [
    {
      title: 'Withdraw from a shared balance',
      setup: {
        text: [
          'Three threads each withdraw from one balance. The balance sits in a `Mutex` inside an `Arc`, and every thread gets its own `Arc` clone.',
        ],
        code: `fn main() {
    let balance = std::sync::Arc::new(std::sync::Mutex::new(100));
    let mut handles = Vec::new();
    for amount in [10, 20, 30] {
        let account = std::sync::Arc::clone(&balance);
        handles.push(std::thread::spawn(move || {
            *account.lock().unwrap() -= amount;
        }));
    }
    for handle in handles {
        handle.join().unwrap();
    }
    let left = *balance.lock().unwrap();
    println!("{} {}", left, std::sync::Arc::strong_count(&balance));
}`,
      },
      parts: [
        part(
          'rust-arc-kp1',
          typeNumber(
            'How many `Arc` handles to the balance are created in all, counting `balance` itself?',
            4,
            '`Arc::new` makes one, and each of the three loop passes adds a clone: a new owner of the same value, not a copy.',
          ),
        ),
        part(
          'rust-mutex-kp1',
          choose(
            'What does `account.lock()` do while another thread holds the lock?',
            [
              'It waits until the other thread releases the lock',
              'It returns an error so the thread can try later',
              'It gives this thread a copy of the balance to change',
              'It takes the lock away from the other thread',
            ],
            0,
            'A `Mutex` grants one guard at a time; `lock` blocks until the current guard is dropped.',
          ),
        ),
        part(
          'rust-mutex-kp2',
          typeSetupOutput(
            'What does the program print?',
            '40 1',
            'All three withdrawals happen, one at a time: $100 - 60 = 40$. Each thread’s clone was dropped when it finished, so only `balance` still owns the value.',
          ),
        ),
        part(
          'rust-thread-move-kp2',
          choose(
            'Why does each thread receive its own `Arc` clone through `move`?',
            [
              'A spawned thread must own what it uses',
              'A `Mutex` can be locked once per clone',
              'Cloning the `Arc` copies the balance',
              'Without `move`, the lock is skipped',
            ],
            0,
            'A spawned thread may outlive the stack frame that started it, so it cannot borrow `balance`; it owns a clone instead.',
          ),
        ),
      ],
    },
  ],
  'rust-channels': [
    {
      title: 'Collect messages from two senders',
      setup: {
        text: [
          'Two threads send numbers through one channel, each with its own sender. `main` waits for each thread, then reads every message.',
        ],
        code: `fn main() {
    let (tx, rx) = std::sync::mpsc::channel();
    let tx2 = tx.clone();
    let a = std::thread::spawn(move || {
        for n in [1, 2, 3] {
            tx.send(n).unwrap();
        }
    });
    a.join().unwrap();
    let b = std::thread::spawn(move || {
        tx2.send(10).unwrap();
    });
    b.join().unwrap();
    let mut received = Vec::new();
    for n in rx {
        received.push(n);
    }
    println!("{:?}", received);
}`,
      },
      parts: [
        part(
          'rust-channels-kp1',
          typeSetupOutput(
            'What does the program print?',
            '[1, 2, 3, 10]',
            'Messages arrive in the order they were sent; the first thread finishes all three sends before the second thread starts.',
          ),
        ),
        part(
          'rust-thread-move-kp2',
          choose(
            'Why does each closure need `move`?',
            [
              'Each thread must own the sender it uses',
              'Senders can only be used inside `main`',
              'A `move` closure sends faster than a borrow',
              'The receiver is moved into both threads',
            ],
            0,
            'A spawned thread may outlive `main`’s frame, so it takes ownership of `tx` or `tx2`; `rx` stays in `main`.',
          ),
        ),
        part(
          'rust-channels-kp2',
          choose(
            'Suppose `main` kept `tx2` and the second thread used a new clone of it. What would the `for n in rx` loop do?',
            [
              'Wait forever, since a sender still exists',
              'End after the four messages, as before',
              'End at once, since the threads have finished',
              'Panic, since a channel cannot have three senders',
            ],
            0,
            'Receiving ends only when every sender is gone. A sender still alive in `main` could send more, so the loop keeps waiting.',
          ),
        ),
      ],
    },
  ],
  'rust-scoped-threads': [
    {
      title: 'Sum two halves in parallel',
      setup: {
        text: [
          'Two scoped threads sum the two halves of an array, and the scope returns both results.',
        ],
        code: `fn main() {
    let data = [4, 8, 15, 16, 23, 42];
    let left = &data[..3];
    let right = &data[3..];
    let (a, b) = std::thread::scope(|s| {
        let first = s.spawn(|| left.iter().sum::<i32>());
        let second = s.spawn(|| right.iter().sum::<i32>());
        (first.join().unwrap(), second.join().unwrap())
    });
    println!("{} {} {}", a, b, a + b);
}`,
      },
      parts: [
        part(
          'rust-scoped-threads-kp1',
          choose(
            'Why may these threads borrow `left` and `right` without `move`?',
            [
              'The scope waits for its threads, so `data` outlives them',
              'Arrays of integers are always copied into a thread',
              'Slices are owned values, so borrowing is not needed',
              'The sums finish before the threads are started',
            ],
            0,
            '`std::thread::scope` returns only after every thread spawned in it has finished, so the borrowed data is still alive throughout.',
          ),
        ),
        part(
          'rust-scoped-threads-kp2',
          typeSetupOutput(
            'What does the program print?',
            '27 81 108',
            'Each result comes back through its own handle, so `a` is always the left sum, $4 + 8 + 15 = 27$, whichever thread finishes first.',
          ),
        ),
        part(
          'rust-thread-move-kp1',
          choose(
            'With `std::thread::spawn` instead of a scope, what does the program need to get each sum back?',
            [
              'An owned copy of each half moved in, and `join` for the result',
              'Only `join`, since spawned threads may borrow local arrays',
              'A static array, since threads cannot return values',
              'Nothing else: `spawn` waits for the thread before returning',
            ],
            0,
            'An unscoped thread may outlive `data`, so it must own its input, and `join` returns the value its closure produced.',
          ),
        ),
      ],
    },
  ],
  'rust-frame-encode': [
    {
      title: 'Frame a message',
      setup: {
        text: [
          'A protocol sends each message as a frame: a two-byte big-endian length, then the payload bytes.',
        ],
        code: `fn encode(payload: &[u8]) -> Result<Vec<u8>, String> {
    if payload.len() > 65535 {
        return Err(String::from("payload too long"));
    }
    let length = payload.len();
    let mut frame = Vec::with_capacity(2 + length);
    frame.push((length / 256) as u8);
    frame.push((length % 256) as u8);
    frame.extend(payload.iter().copied());
    Ok(frame)
}

fn main() {
    let frame = encode(&[7, 8, 9]).unwrap();
    println!("{:?}", frame);
}`,
      },
      parts: [
        part(
          'rust-frame-encode-kp1',
          typeSetupOutput(
            'What does the program print?',
            '[0, 3, 7, 8, 9]',
            'The header comes first: a length of 3 is the bytes 0 and 3 in big-endian order, followed by the payload.',
          ),
        ),
        part(
          'rust-frame-header-kp1',
          typeNumber(
            'A frame starts with the bytes `[1, 44]`. What payload length does the header announce?',
            300,
            'Big-endian puts the high byte first: $1 \\times 256 + 44 = 300$.',
          ),
        ),
        part(
          'rust-capacity-kp1',
          typeNumber(
            'For a 300-byte payload, what is the frame’s `len()`?',
            302,
            '`len` counts the elements pushed: 2 header bytes plus 300 payload bytes, which is also the capacity reserved up front.',
          ),
        ),
        part(
          'rust-frame-encode-kp2',
          choose(
            'Why does `encode` reject payloads longer than 65535 bytes?',
            [
              'Two header bytes cannot announce a longer length',
              'A `Vec<u8>` cannot hold more than 65535 bytes',
              'Longer payloads would need a little-endian header',
              'The receiver reads at most one frame per second',
            ],
            0,
            'Two bytes hold at most $256 \\times 256 - 1 = 65535$; a longer length would be cut off and the receiver would read the wrong frame boundary.',
          ),
        ),
      ],
    },
  ],
  'rust-test-contract': [
    {
      title: 'Turn a report into something testable',
      setup: {
        text: [
          '`label` turns a score into a word, and `main` prints the word for three scores. Only the function’s return value can be checked by a test.',
        ],
        code: `fn label(score: u32) -> String {
    if score >= 90 {
        String::from("great")
    } else if score >= 60 {
        String::from("pass")
    } else {
        String::from("retry")
    }
}

fn main() {
    for score in [95, 60, 12] {
        println!("{}", label(score));
    }
}`,
      },
      parts: [
        part(
          'rust-test-contract-kp3',
          typeSetupOutput(
            'What does the program print?',
            `great
pass
retry`,
            '95 reaches the first branch, 60 is exactly the pass mark, and 12 falls through to the last.',
          ),
        ),
        part(
          'rust-test-contract-kp1',
          choose(
            'Which assertion checks `label` directly in a test?',
            [
              '`assert_eq!(label(60), "pass");`',
              '`assert_eq!(main(), "pass");`',
              '`assert!(println!("pass"));`',
              '`assert_eq!(label, "pass");`',
            ],
            0,
            'A test compares what a function returns. `main` returns nothing, and printing produces no value to compare.',
          ),
        ),
        part(
          'rust-test-attribute-kp4',
          choose(
            'What does `cargo test` do with this program’s `main`?',
            [
              'It does not run it; it runs the `#[test]` functions',
              'It runs `main` first, then every `#[test]` function',
              'It runs `main` and checks that nothing panicked',
              'It refuses to build a crate that has a `main`',
            ],
            0,
            '`cargo run` runs `main`; `cargo test` builds a test harness that runs each `#[test]` function instead.',
          ),
        ),
        part(
          'rust-assertions-kp2',
          typeOutput(
            'What does this program print?',
            `fn main() {
    let got = String::from("pass");
    assert_ne!(got, "retry");
    assert_eq!(got.len(), 4);
    println!("checked {}", got);
}`,
            'checked pass',
            'Both assertions hold, so neither panics and the program reaches its last line.',
          ),
        ),
      ],
    },
  ],
  'rust-deadlock-scope': [
    {
      title: 'Release a lock before taking it again',
      setup: {
        text: [
          'A queue sits in a `Mutex`. The code sorts it and reads the smallest item inside a block, then locks it again to push a new item.',
        ],
        code: `fn main() {
    let queue = std::sync::Mutex::new(vec![3, 1, 2]);
    let first = {
        let mut guard = queue.lock().unwrap();
        guard.sort();
        guard[0]
    };
    queue.lock().unwrap().push(first * 10);
    println!("{:?}", queue.lock().unwrap());
}`,
      },
      parts: [
        part(
          'rust-deadlock-scope-kp1',
          choose(
            'When is the lock taken inside the block released?',
            [
              'When `guard` is dropped at the end of the block',
              'When `guard.sort()` returns',
              'When `main` returns at the end of the program',
              'Never, until `unlock` is called explicitly',
            ],
            0,
            'A guard holds the lock until it is dropped, and a variable is dropped at the end of its block.',
          ),
        ),
        part(
          'rust-deadlock-scope-kp1',
          typeSetupOutput(
            'What does the program print?',
            '[1, 2, 3, 10]',
            'The block sorts the queue and returns its smallest item, 1; with the lock released, the next line pushes 10.',
          ),
        ),
        part(
          'rust-mutex-kp1',
          choose(
            'If `guard` were declared directly in `main`, living to the end, what would the next `queue.lock()` do?',
            [
              'Never return: this thread already holds the lock',
              'Return a second guard to the same queue',
              'Return an error that `unwrap` turns into 0',
              'Release the first guard, then lock again',
            ],
            0,
            'A `Mutex` hands out one guard at a time, even to the same thread, so a second `lock` while the first guard lives deadlocks or panics.',
          ),
        ),
      ],
    },
  ],
};
