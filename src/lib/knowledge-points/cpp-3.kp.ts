import {
  choose,
  predictOutput,
  typeOutput,
  type KnowledgePointModule,
} from './authoring';

/** Strips the indentation shared by every line of an indented code block. */
function cpp(block: string): string {
  const lines = block.replace(/^\n/, '').trimEnd().split('\n');
  const indent = Math.min(
    ...lines.filter((line) => line.trim()).map((line) => line.search(/\S/)),
  );
  return lines.map((line) => line.slice(indent)).join('\n');
}

// Executed programs never `return` a value (the batch runner turns main into
// a void function and rejects any `return <value>`), so workers report through
// references, promises, or standard function objects, and condition-variable
// waits use the explicit `while (!condition) cv.wait(lock);` loop.

const threads: KnowledgePointModule = {
  'cpp-thread-join': [
    {
      title: 'Start a worker and wait for it with join',
      explanation: [
        'Constructing a std::thread with a callable starts running that callable on a new thread, alongside the code that created it. Calling join() on the thread object blocks the caller until the worker has finished.',
        'Finishing join() also makes everything the worker wrote visible to the joining thread, so a value the worker stored through a reference capture can be read safely on the next line.',
      ],
      example: {
        language: 'cpp',
        code: cpp(`
          #include <iostream>
          #include <thread>
          int main() {
            int side = 6;
            int area = 0;
            std::thread worker([side, &area] { area = side * side; });
            worker.join();
            std::cout << area << "\\n";
          }
        `),
        output: '36',
        explanation:
          'The worker writes 36 into area through its reference capture. main reads area only after join() returns, when the write is finished and visible.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          cpp(`
            #include <iostream>
            #include <thread>
            int main() {
              int total = 10;
              std::thread worker([&total] { total += 5; });
              worker.join();
              total *= 2;
              std::cout << total << "\\n";
            }
          `),
          '30',
          'join() returns only after the worker has added 5, so main doubles 15 and prints 30.',
        ),
        typeOutput(
          'Each worker is joined before the next one is created. What is printed?',
          cpp(`
            #include <iostream>
            #include <thread>
            int main() {
              int value = 1;
              std::thread first([&value] { value = value * 3; });
              first.join();
              std::thread second([&value] { value = value + 4; });
              second.join();
              std::cout << value << "\\n";
            }
          `),
          '7',
          'first has finished (value is 3) before second even starts, so second adds 4 to 3.',
        ),
        choose(
          'Why may main read `area` immediately after `worker.join()` returns?',
          [
            'join() waits for the worker to finish and makes its writes visible to main',
            'join() copies the worker’s local variables back into main',
            'A std::thread runs its callable to the end before its constructor returns',
            'Reading an int never conflicts with another thread writing it',
          ],
          0,
          'join() both waits for completion and synchronizes with it, so the finished write happens before main’s read.',
        ),
        choose(
          'What is wrong with this program?',
          [
            'It always prints 0, because the worker only starts at join()',
            'It always prints 42, because the worker starts immediately',
            'main’s read can overlap the worker’s write, which is a data race',
            'It does not compile, because result must be captured by value',
          ],
          2,
          'Nothing orders the worker’s write before main’s read until join(), so the accesses race and the behavior is undefined.',
          cpp(`
            int result = 0;
            std::thread worker([&result] { result = 42; });
            std::cout << result << "\\n";
            worker.join();
          `),
        ),
      ],
    },
    {
      title: 'Join every thread exactly once before it is destroyed',
      explanation: [
        'A std::thread that has started a worker is joinable until join() is called. Destroying a thread object while it is still joinable calls std::terminate and ends the whole program, so every started thread must be joined before its object goes out of scope.',
        'join() can be called only once: afterwards the object is no longer joinable, and a second join() throws std::system_error. Code that starts a thread inside a helper should join it before the helper finishes.',
      ],
      example: {
        language: 'cpp',
        code: cpp(`
          #include <iostream>
          #include <thread>
          int main() {
            int total = 0;
            auto add_four = [&total] {
              std::thread worker([&total] { total += 4; });
              worker.join();
            };
            add_four();
            add_four();
            std::cout << total << "\\n";
          }
        `),
        output: '8',
        explanation:
          'Each call starts a worker and joins it before the local thread object is destroyed at the end of the lambda body. Both workers finish, so total is 8.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          cpp(`
            #include <iostream>
            #include <thread>
            int main() {
              int runs = 0;
              auto run_once = [&runs] {
                std::thread worker([&runs] { runs += 2; });
                worker.join();
              };
              run_once();
              run_once();
              run_once();
              std::cout << runs << "\\n";
            }
          `),
          '6',
          'Each of the three calls starts a worker that adds 2 and joins it, so runs reaches 6.',
        ),
        choose(
          'A function starts `std::thread worker(task);` and returns without calling join(). What happens when `worker` is destroyed?',
          [
            'The destructor waits for task to finish',
            'std::terminate is called and the program ends',
            'task is cancelled and the function returns normally',
            'The thread keeps running on its own',
          ],
          1,
          'Destroying a joinable std::thread calls std::terminate; the thread must be joined first.',
        ),
        choose(
          'What happens at the second call to join()?',
          [
            'It returns at once, because the worker already finished',
            'It runs the empty lambda a second time on a new thread',
            'It throws std::system_error: worker is no longer joinable',
            'It blocks forever waiting for a worker that will not run',
          ],
          2,
          'After the first join() the object is not joinable, and join() on a non-joinable thread throws std::system_error.',
          cpp(`
            std::thread worker([] {});
            worker.join();
            worker.join();
          `),
        ),
        choose(
          'Where must `worker.join();` go for this lambda to be correct?',
          [
            'At line A, before out is read',
            'At line B, after out is read',
            'Anywhere, as long as it runs before main ends',
            'Nowhere: the end of the lambda joins the thread',
          ],
          0,
          'Joining at A finishes the write before the read and before worker is destroyed; joining at B leaves the read racing with the write.',
          cpp(`
            auto publish = [&out] {
              std::thread worker([&out] { out = 99; });
              // line A
              int copy = out;
              // line B
            };
          `),
        ),
      ],
    },
  ],
  'cpp-thread-input-copy': [
    {
      title: 'Capture inputs by value to give the worker a snapshot',
      explanation: [
        'A lambda that captures a variable by value stores its own copy when the lambda is created. If that lambda is handed to a std::thread, the worker reads the copy, so the caller may keep changing the original without racing with the worker.',
        'Capturing the same input by reference would make the worker read the caller’s live variable; any caller write before join() is then a data race, and the value the worker sees is unpredictable.',
      ],
      example: {
        language: 'cpp',
        code: cpp(`
          #include <iostream>
          #include <thread>
          int main() {
            int limit = 5;
            int seen = 0;
            std::thread worker([limit, &seen] { seen = limit; });
            limit = 50;
            worker.join();
            std::cout << seen << " " << limit << "\\n";
          }
        `),
        output: '5 50',
        explanation:
          'The closure copied limit as 5 before the thread started. main’s later assignment changes only its own variable, so the worker reports 5.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          cpp(`
            #include <iostream>
            #include <thread>
            int main() {
              int price = 100;
              int quoted = 0;
              std::thread worker([price, &quoted] { quoted = price + 1; });
              price = 200;
              worker.join();
              std::cout << quoted << "\\n";
            }
          `),
          '101',
          'The worker uses its own copy of price, taken as 100 when the lambda was created.',
        ),
        typeOutput(
          'size changes before and after the worker is created. What is printed?',
          cpp(`
            #include <iostream>
            #include <thread>
            int main() {
              int size = 3;
              int report = 0;
              size = 4;
              std::thread worker([size, &report] { report = size * 10; });
              size = 9;
              worker.join();
              std::cout << report << "\\n";
            }
          `),
          '40',
          'The copy is taken when the lambda is created: after size became 4 and before it became 9.',
        ),
        choose(
          'main keeps changing `size` while the worker runs. Which capture list lets the worker read size safely and still report into `out`?',
          ['[&size, &out]', '[&]', '[&size, out]', '[size, &out]'],
          3,
          'size is copied, so main’s writes never touch the worker’s input; out is captured by reference so main can read the report after join().',
        ),
        choose(
          'What can be said about result after join()?',
          [
            'It is always 2, because the worker copied level first',
            'It is always 14, because main writes before the worker reads',
            'Nothing: main’s write to level races with the worker’s read',
            'It is 0, because the worker runs only after join()',
          ],
          2,
          'level is captured by reference and main assigns it while the worker may be reading it, which is a data race.',
          cpp(`
            int level = 1;
            int result = 0;
            std::thread worker([&level, &result] { result = level * 2; });
            level = 7;
            worker.join();
          `),
        ),
      ],
    },
    {
      title: 'std::thread copies the arguments you pass to it',
      explanation: [
        'std::thread also accepts arguments after the callable: `std::thread worker(task, a, b)`. The constructor copies each argument into storage owned by the new thread before it returns, and the worker receives those copies.',
        'Because the copies are made immediately, later changes to the caller’s variables do not reach the worker. To pass a real reference, wrap the variable in std::ref from <functional>; a parameter of type int& cannot bind to the thread’s copy, so passing a plain variable to it does not compile.',
      ],
      example: {
        language: 'cpp',
        code: cpp(`
          #include <iostream>
          #include <thread>
          int main() {
            int base = 7;
            int doubled = 0;
            std::thread worker([&doubled](int n) { doubled = n * 2; }, base);
            base = 100;
            worker.join();
            std::cout << doubled << "\\n";
          }
        `),
        output: '14',
        explanation:
          'The constructor copied base as 7 before main changed it, so the worker doubles 7.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          cpp(`
            #include <iostream>
            #include <thread>
            int main() {
              int start = 2;
              int result = 0;
              std::thread worker([&result](int a, int b) { result = a * 10 + b; }, start, start + 1);
              start = 9;
              worker.join();
              std::cout << result << "\\n";
            }
          `),
          '23',
          'Both arguments are evaluated and copied when the thread is constructed: a is 2 and b is 3.',
        ),
        typeOutput(
          'What does this program print?',
          cpp(`
            #include <functional>
            #include <iostream>
            #include <thread>
            int main() {
              int hits = 1;
              std::thread worker([](int& h) { h += 5; }, std::ref(hits));
              worker.join();
              std::cout << hits << "\\n";
            }
          `),
          '6',
          'std::ref passes a reference to hits itself, so the worker’s += 5 changes main’s variable.',
        ),
        choose(
          'Why does this line fail to compile?',
          [
            'Lambdas with parameters cannot run on a thread',
            'std::thread accepts at most one argument after the callable',
            'total must be declared const first',
            'The thread passes its own copy of total, which cannot bind to int&',
          ],
          3,
          'std::thread stores a copy and passes it as a temporary; a non-const int& parameter cannot bind to it, so std::ref(total) is required.',
          cpp(`
            std::thread worker([](int& count) { ++count; }, total);
          `),
        ),
        typeOutput(
          'One argument is passed as a copy and one through std::ref. What is printed?',
          cpp(`
            #include <functional>
            #include <iostream>
            #include <thread>
            int main() {
              int a = 1;
              int b = 1;
              std::thread worker([](int x, int& y) { x += 10; y += 10; }, a, std::ref(b));
              worker.join();
              std::cout << a << " " << b << "\\n";
            }
          `),
          '1 11',
          'x is the thread’s own copy of a, so a stays 1; y refers to b, which becomes 11.',
        ),
      ],
    },
  ],
  'cpp-parallel-partitions': [
    {
      title: 'Give each worker its own output variable',
      explanation: [
        'A data race happens when two threads access the same object at the same time, at least one access is a write, and nothing orders them. It is undefined behavior, not merely an unlucky value.',
        'Writes to different objects never race. Giving each worker its own output variable lets the workers run at the same time without any lock; main combines the outputs after joining every worker.',
      ],
      example: {
        language: 'cpp',
        code: cpp(`
          #include <iostream>
          #include <thread>
          int main() {
            int left = 0;
            int right = 0;
            std::thread a([&left] { left = 1 + 2 + 3; });
            std::thread b([&right] { right = 4 + 5 + 6; });
            a.join();
            b.join();
            std::cout << left + right << "\\n";
          }
        `),
        output: '21',
        explanation:
          'a writes only left and b writes only right, so they never race. After both joins main adds 6 and 15.',
      },
      questions: [
        typeOutput(
          'The workers are joined in reverse order. What is printed?',
          cpp(`
            #include <iostream>
            #include <thread>
            int main() {
              int x = 0;
              int y = 0;
              int z = 0;
              std::thread a([&x] { x = 2 * 5; });
              std::thread b([&y] { y = 3 * 5; });
              std::thread c([&z] { z = 4 * 5; });
              c.join();
              b.join();
              a.join();
              std::cout << x << " " << y << " " << z << "\\n";
            }
          `),
          '10 15 20',
          'Each worker writes only its own variable; the join order does not change which value lands where.',
        ),
        typeOutput(
          'What does this program print?',
          cpp(`
            #include <iostream>
            #include <thread>
            int main() {
              int base = 8;
              int up = 0;
              int down = 0;
              std::thread a([base, &up] { up = base + 1; });
              std::thread b([base, &down] { down = base - 1; });
              a.join();
              b.join();
              std::cout << up * down << "\\n";
            }
          `),
          '63',
          'up is 9 and down is 7, each written by its own worker, so the product is 63.',
        ),
        choose(
          'Two workers both run `total += 5;` on the same plain int at the same time, with no lock. What does the language guarantee?',
          [
            'total ends at 10',
            'total ends at 5',
            'Nothing: the unsynchronized writes are a data race',
            'The second worker waits for the first automatically',
          ],
          2,
          'Both workers read and write one non-atomic object without ordering, so the program has undefined behavior.',
        ),
        choose(
          'Which design lets two workers produce a combined count without a data race and without a mutex?',
          [
            'Both workers add into one shared int as soon as they finish',
            'Each worker writes its own int; main adds them after joining both',
            'Each worker reads the other’s int while it runs',
            'main adds the two ints right away, then joins the workers later',
          ],
          1,
          'Separate outputs never conflict, and reading them after the joins orders the reads after the writes.',
        ),
      ],
    },
    {
      title: 'Share read-only inputs and combine outputs after join',
      explanation: [
        'Several threads may read the same object at once, as long as no thread writes it while they run. A shared read-only input therefore needs no protection, while each output still needs a single writer.',
        'Reading a worker’s output is safe only after that worker has been joined. Combining partial results earlier reads a variable that may still be being written.',
      ],
      example: {
        language: 'cpp',
        code: cpp(`
          #include <iostream>
          #include <thread>
          int main() {
            const int mid = 40;
            int bid = 0;
            int ask = 0;
            std::thread bids([&mid, &bid] { bid = mid - 1; });
            std::thread asks([&mid, &ask] { ask = mid + 1; });
            bids.join();
            asks.join();
            std::cout << bid << " " << ask << "\\n";
          }
        `),
        output: '39 41',
        explanation:
          'Both workers read mid, which nobody writes, and each writes its own output. main reads the outputs after both joins.',
      },
      questions: [
        choose(
          'Which pair of accesses is a data race?',
          [
            'Two threads read limit at the same time, with no lock at all',
            'One thread writes x while another reads x, with nothing ordering them',
            'One thread writes x while another writes y',
            'A worker writes x, main joins that worker, and then main reads x',
          ],
          1,
          'A race needs a conflicting pair (at least one write) on the same object with nothing ordering them.',
        ),
        choose(
          'At which marked line may main first read `a_sum + b_sum` safely?',
          ['line 1', 'line 2', 'line 3', 'Any of them'],
          2,
          'Only after both joins are both writes finished and ordered before main’s read.',
          cpp(`
            int a_sum = 0;
            int b_sum = 0;
            std::thread a([&a_sum] { a_sum = 10; });
            std::thread b([&b_sum] { b_sum = 20; });
            // line 1
            a.join();
            // line 2
            b.join();
            // line 3
          `),
        ),
        typeOutput(
          'What does this program print?',
          cpp(`
            #include <iostream>
            #include <thread>
            int main() {
              const int qty = 4;
              int buy_cost = 0;
              int sell_cost = 0;
              int fee = 0;
              std::thread buy([&qty, &buy_cost] { buy_cost = qty * 25; });
              std::thread sell([&qty, &sell_cost] { sell_cost = qty * 27; });
              std::thread fees([&qty, &fee] { fee = qty * 1; });
              buy.join();
              sell.join();
              fees.join();
              std::cout << sell_cost - buy_cost - fee << "\\n";
            }
          `),
          '4',
          'The workers produce 100, 108 and 4 from the shared read-only qty; 108 - 100 - 4 is 4.',
        ),
        choose(
          'Three workers read the same `const int threshold` and each writes its own result. What protection does threshold need?',
          [
            'A mutex around every read of threshold by every worker',
            'None, because no thread writes threshold while they run',
            'Each worker must capture threshold by reference',
            'An atomic, because three threads read it at the same time',
          ],
          1,
          'Concurrent reads of an object that nobody writes are not a data race.',
        ),
      ],
    },
  ],
  'cpp-threads': [
    {
      title: 'std::jthread joins when it is destroyed',
      explanation: [
        'std::jthread (C++20, in <thread>) starts a worker just like std::thread, but its destructor joins the worker if it is still joinable. Leaving the scope that owns a jthread therefore waits for the worker to finish.',
        'This removes the std::terminate trap of a forgotten join(): code after the closing brace can read the worker’s results, because the destructor has already waited.',
      ],
      example: {
        language: 'cpp',
        code: cpp(`
          #include <iostream>
          #include <thread>
          int main() {
            int result = 0;
            {
              std::jthread worker([&result] { result = 9 * 9; });
            }
            std::cout << result << "\\n";
          }
        `),
        output: '81',
        explanation:
          'The closing brace destroys worker, and its destructor joins. By the time main prints, result is 81.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          cpp(`
            #include <iostream>
            #include <thread>
            int main() {
              int a = 0;
              int b = 0;
              {
                std::jthread first([&a] { a = 12; });
                std::jthread second([&b] { b = 30; });
              }
              std::cout << a + b << "\\n";
            }
          `),
          '42',
          'Both jthreads are joined when the inner scope ends, so both writes are finished before the print.',
        ),
        typeOutput(
          'What does this program print?',
          cpp(`
            #include <iostream>
            #include <thread>
            int main() {
              int total = 0;
              auto add = [&total] {
                std::jthread worker([&total] { total += 7; });
              };
              add();
              add();
              std::cout << total << "\\n";
            }
          `),
          '14',
          'Each call’s jthread joins at the end of the lambda body, so the two workers run one after another and add 14.',
        ),
        choose(
          'What happens at the closing brace of the scope that owns a still-running std::jthread?',
          [
            'The worker is detached and keeps running on its own',
            'std::terminate is called',
            'The destructor waits for the worker to finish',
            'The worker is stopped instantly without waiting',
          ],
          2,
          'The jthread destructor requests a stop and then joins, so it waits for the worker to return.',
        ),
        choose(
          'A std::thread and a std::jthread are both still joinable when they are destroyed. What happens?',
          [
            'Both call std::terminate, because neither one was joined first',
            'Both join automatically in their destructors',
            'The std::thread joins; the std::jthread detaches',
            'The std::thread calls std::terminate; the std::jthread joins',
          ],
          3,
          'Only std::jthread’s destructor joins; destroying a joinable std::thread terminates the program.',
        ),
      ],
    },
    {
      title: 'Declare what the worker uses before the jthread',
      explanation: [
        'Local objects are destroyed in the reverse order of their declarations. A jthread declared after the data its worker uses is destroyed first, so it joins while that data is still alive.',
        'If the data is declared after the jthread, the data is destroyed first and the still-running worker may write to an object that no longer exists.',
      ],
      example: {
        language: 'cpp',
        code: cpp(`
          #include <iostream>
          #include <thread>
          struct Report {
            int value = 0;
            ~Report() { std::cout << "report " << value << "\\n"; }
          };
          int main() {
            {
              Report report;
              std::jthread worker([&report] { report.value = 12; });
            }
            std::cout << "done\\n";
          }
        `),
        output: 'report 12\ndone',
        explanation:
          'worker was declared last, so it is destroyed first and joins. Only then is report destroyed, printing the finished value 12.',
      },
      questions: [
        typeOutput(
          'Each Tally prints its count when it is destroyed. What is printed?',
          cpp(`
            #include <iostream>
            #include <thread>
            struct Tally {
              int count = 0;
              ~Tally() { std::cout << count << "\\n"; }
            };
            int main() {
              Tally a;
              Tally b;
              std::jthread wa([&a] { a.count = 3; });
              std::jthread wb([&b] { b.count = 4; });
            }
          `),
          '4\n3',
          'Destruction runs in reverse: wb and wa join first, then b prints 4 and a prints 3.',
        ),
        choose(
          'What is wrong with this order of declarations?',
          [
            'Nothing: the jthread joins before anything is destroyed',
            'result dies before worker joins, so the worker may write to a dead object',
            'A default-constructed jthread cannot be given a worker by assignment later',
            'result is copied into the worker, so the write is lost',
          ],
          1,
          'result is declared after worker, so it is destroyed first; worker only joins afterwards.',
          cpp(`
            std::jthread worker;
            int result = 0;
            worker = std::jthread([&result] { result = 5; });
          `),
        ),
        typeOutput(
          'What does this program print?',
          cpp(`
            #include <iostream>
            #include <thread>
            struct Log {
              int lines = 0;
              ~Log() { std::cout << "log " << lines << "\\n"; }
            };
            int main() {
              Log log;
              {
                std::jthread writer([&log] { log.lines = 2; });
              }
              std::cout << "after " << log.lines << "\\n";
            }
          `),
          'after 2\nlog 2',
          'The inner jthread joins at its closing brace, so main sees 2; log is destroyed last, at the end of main.',
        ),
        choose(
          'A jthread’s worker adds into an int named total. Where should total be declared?',
          [
            'After the jthread in the same scope, so total is destroyed first',
            'Inside the worker lambda',
            'Before the jthread in the same scope, or in an enclosing scope',
            'Anywhere, because a jthread copies everything it uses',
          ],
          2,
          'Declared earlier (or further out), total is destroyed after the jthread has joined.',
        ),
      ],
    },
  ],
  'cpp-lock-guard': [
    {
      title: 'A lock_guard holds the mutex for exactly one scope',
      explanation: [
        'A std::mutex (in <mutex>) can be held by only one thread at a time. std::lock_guard locks the mutex in its constructor and unlocks it in its destructor, so the code from its declaration to the end of its scope runs while the thread holds the mutex.',
        'Because the unlock happens in the destructor, it also happens when the scope is left early or by an exception. Two threads that guard their updates with the same mutex take turns, so neither update is lost.',
      ],
      example: {
        language: 'cpp',
        code: cpp(`
          #include <iostream>
          #include <mutex>
          #include <thread>
          int main() {
            std::mutex m;
            int total = 0;
            std::thread a([&m, &total] {
              std::lock_guard<std::mutex> lock(m);
              total += 5;
            });
            std::thread b([&m, &total] {
              std::lock_guard<std::mutex> lock(m);
              total += 7;
            });
            a.join();
            b.join();
            std::cout << total << "\\n";
          }
        `),
        output: '12',
        explanation:
          'Whichever worker locks m first finishes its update before the other can enter, so both additions land and total is 12.',
      },
      questions: [
        typeOutput(
          'Three workers multiply under the same mutex, in an unknown order. What is printed?',
          cpp(`
            #include <iostream>
            #include <mutex>
            #include <thread>
            int main() {
              std::mutex m;
              int product = 1;
              std::thread a([&m, &product] { std::lock_guard<std::mutex> lock(m); product *= 2; });
              std::thread b([&m, &product] { std::lock_guard<std::mutex> lock(m); product *= 3; });
              std::thread c([&m, &product] { std::lock_guard<std::mutex> lock(m); product *= 5; });
              a.join();
              b.join();
              c.join();
              std::cout << product << "\\n";
            }
          `),
          '30',
          'Each multiplication runs alone under m, and multiplication order does not matter, so the result is 2 * 3 * 5.',
        ),
        choose(
          'When does a std::lock_guard release its mutex?',
          [
            'Only when unlock() is called on it',
            'Right after the next statement',
            'When its scope ends, by any path, including an exception',
            'When the thread that created it finishes running its function',
          ],
          2,
          'lock_guard has no unlock member; its destructor unlocks when the scope is left by any path.',
        ),
        choose(
          'What does the lock_guard protect in this worker?',
          [
            'The update total += 1, which follows the guard in the lambda',
            'Nothing: it unlocks at its closing brace, before the update',
            'Every access to total in the program',
            'The whole lambda body, because the guard is created inside it',
          ],
          1,
          'The guard lives only inside the inner braces, so the mutex is already released when total is updated.',
          cpp(`
            std::thread a([&m, &total] {
              { std::lock_guard<std::mutex> lock(m); }
              total += 1;
            });
          `),
        ),
        typeOutput(
          'What does this program print?',
          cpp(`
            #include <iostream>
            #include <mutex>
            #include <thread>
            int main() {
              std::mutex m;
              int orders = 0;
              int fills = 0;
              std::thread a([&m, &orders, &fills] {
                std::lock_guard<std::mutex> lock(m);
                orders += 3;
                fills += 1;
              });
              std::thread b([&m, &orders, &fills] {
                std::lock_guard<std::mutex> lock(m);
                orders += 2;
                fills += 2;
              });
              a.join();
              b.join();
              std::cout << orders << " " << fills << "\\n";
            }
          `),
          '5 3',
          'Both locked updates complete in some order, giving orders 3 + 2 and fills 1 + 2.',
        ),
      ],
    },
    {
      title: 'Every access to shared data uses the same mutex',
      explanation: [
        'A mutex protects data only by agreement: it excludes threads that lock that same mutex. A thread that reads or writes the data without locking, or that locks a different mutex, is not excluded and still races.',
        'Choose one mutex for each piece of shared state and lock it on every path that touches the state, including reads. A reader that locks sees the state entirely before or entirely after a writer’s locked update, never halfway.',
      ],
      example: {
        language: 'cpp',
        code: cpp(`
          #include <iostream>
          #include <mutex>
          #include <thread>
          int main() {
            std::mutex m;
            int stock = 10;
            int sold = 0;
            int counted = 0;
            std::thread seller([&m, &stock, &sold] {
              std::lock_guard<std::mutex> lock(m);
              stock -= 4;
              sold += 4;
            });
            std::thread auditor([&m, &stock, &sold, &counted] {
              std::lock_guard<std::mutex> lock(m);
              counted = stock + sold;
            });
            seller.join();
            auditor.join();
            std::cout << counted << "\\n";
          }
        `),
        output: '10',
        explanation:
          'The auditor runs either before the seller (10 + 0) or after it (6 + 4), never in the middle, so it always counts 10.',
      },
      questions: [
        choose(
          'Why does this not protect total?',
          [
            'lock_guard needs an explicit unlock call before the lambda returns',
            'total must be captured by value',
            'Each worker locks a different mutex, so neither excludes the other',
            'A mutex can only protect global variables',
          ],
          2,
          'Exclusion only happens between threads locking the same mutex object; here each lambda creates a new one.',
          cpp(`
            std::thread a([&total] { std::mutex m; std::lock_guard<std::mutex> lock(m); total += 1; });
            std::thread b([&total] { std::mutex m; std::lock_guard<std::mutex> lock(m); total += 1; });
          `),
        ),
        choose(
          'Writers lock m before changing balance, but a reporting thread reads balance without locking. What is the result?',
          [
            'The read is safe, because only writers need the lock',
            'The read waits automatically for the writers',
            'The read always sees the oldest balance',
            'The read races with the writes: undefined behavior',
          ],
          3,
          'A read that does not take m is not ordered with the writes, so a write and the read form a data race.',
        ),
        predictOutput(
          'The checker locks the same mutex as the mover. What does it record?',
          cpp(`
            #include <iostream>
            #include <mutex>
            #include <thread>
            int main() {
              std::mutex m;
              int cash = 50;
              int owed = 30;
              int difference = -1;
              std::thread mover([&m, &cash, &owed] {
                std::lock_guard<std::mutex> lock(m);
                cash -= 20;
                owed -= 20;
              });
              std::thread checker([&m, &cash, &owed, &difference] {
                std::lock_guard<std::mutex> lock(m);
                difference = cash - owed;
              });
              mover.join();
              checker.join();
              std::cout << difference << "\\n";
            }
          `),
          ['0', '40', '20', '30'],
          2,
          'The checker sees 50 - 30 or 30 - 10; both are 20, because it can never run between the two subtractions.',
        ),
        choose(
          'Which statement about protecting `shared` with mutex m is correct?',
          [
            'Only threads that lock m are excluded from each other',
            'Locking m stops every other thread in the program',
            'Locking m makes every variable in the scope atomic',
            'Only threads that write shared need to lock m',
          ],
          0,
          'A mutex is a protocol: it serializes exactly the threads that lock it, so every access must take it.',
        ),
      ],
    },
  ],
  'cpp-mutex-counter': [
    {
      title: 'Lock the whole read-modify-write',
      explanation: [
        '`++total` is three steps: read the value, add one, write it back. If two threads interleave those steps, both can read the same old value and one increment disappears. With a plain int that interleaving is a data race and undefined behavior.',
        'Holding one mutex across the whole read, add and write makes each increment indivisible with respect to other threads using that mutex, so the final count equals the number of increments.',
      ],
      example: {
        language: 'cpp',
        code: cpp(`
          #include <iostream>
          #include <mutex>
          #include <thread>
          int main() {
            std::mutex m;
            int total = 0;
            auto work = [&m, &total] {
              for (int i = 0; i < 1000; ++i) {
                std::lock_guard<std::mutex> lock(m);
                ++total;
              }
            };
            std::thread a(work);
            std::thread b(work);
            a.join();
            b.join();
            std::cout << total << "\\n";
          }
        `),
        output: '2000',
        explanation:
          'Every ++total runs while holding m, so none of the 2000 increments can be lost.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          cpp(`
            #include <iostream>
            #include <mutex>
            #include <thread>
            int main() {
              std::mutex m;
              int total = 0;
              auto work = [&m, &total] {
                for (int i = 0; i < 4; ++i) {
                  std::lock_guard<std::mutex> lock(m);
                  total += i;
                }
              };
              std::thread a(work);
              std::thread b(work);
              a.join();
              b.join();
              std::cout << total << "\\n";
            }
          `),
          '12',
          'Each worker adds 0 + 1 + 2 + 3 = 6 under the lock, and two workers give 12.',
        ),
        typeOutput(
          'Three workers share one counter. What is printed?',
          cpp(`
            #include <iostream>
            #include <mutex>
            #include <thread>
            int main() {
              std::mutex m;
              int total = 0;
              auto work = [&m, &total] {
                for (int i = 0; i < 250; ++i) {
                  std::lock_guard<std::mutex> lock(m);
                  total += 2;
                }
              };
              std::thread a(work);
              std::thread b(work);
              std::thread c(work);
              a.join();
              b.join();
              c.join();
              std::cout << total << "\\n";
            }
          `),
          '1500',
          'Each worker adds 2 a total of 250 times (500), and none of the locked updates is lost: 3 * 500.',
        ),
        choose(
          'Two threads run this lambda. Why can the final total be less than 2000?',
          [
            'The lock is held too long, so the other thread times out',
            'Both threads can read the same old total before either writes',
            'A lock_guard cannot be created inside a loop body like this one',
            'seen is a single variable shared by both of the threads',
          ],
          1,
          'The read of total happens before the lock, so the read-modify-write is split; that read also races with the other thread’s write.',
          cpp(`
            auto work = [&m, &total] {
              for (int i = 0; i < 1000; ++i) {
                int seen = total;
                std::lock_guard<std::mutex> lock(m);
                total = seen + 1;
              }
            };
          `),
        ),
        choose(
          'Two threads each run `++count;` 1000 times on a plain int with no lock. What does C++ guarantee about count?',
          [
            'It ends at exactly 2000',
            'It ends at exactly 1000',
            'It ends somewhere between 1000 and 2000, depending on timing',
            'Nothing: it has a data race, so behavior is undefined',
          ],
          3,
          'In practice the total is often below 2000, but a data race means the language promises nothing at all.',
        ),
      ],
    },
    {
      title: 'Do private work outside the lock, then merge once',
      explanation: [
        'Only the shared update needs the mutex. A worker can accumulate into a local variable that no other thread sees, then lock once to add its local result to the shared total.',
        'The final value is the same as locking for every step, but each thread takes the lock once instead of once per element, so the threads spend far less time waiting for each other.',
      ],
      example: {
        language: 'cpp',
        code: cpp(`
          #include <iostream>
          #include <mutex>
          #include <thread>
          int main() {
            std::mutex m;
            int total = 0;
            int locks = 0;
            auto add_range = [&m, &total, &locks](int begin, int end) {
              int local = 0;
              for (int i = begin; i < end; ++i) local += i;
              std::lock_guard<std::mutex> lock(m);
              total += local;
              ++locks;
            };
            std::thread a([&add_range] { add_range(0, 50); });
            std::thread b([&add_range] { add_range(50, 100); });
            a.join();
            b.join();
            std::cout << total << " " << locks << "\\n";
          }
        `),
        output: '4950 2',
        explanation:
          'Each worker sums its half of 0..99 privately and locks once to merge, so the total is 4950 after only 2 lock acquisitions.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          cpp(`
            #include <iostream>
            #include <mutex>
            #include <thread>
            int main() {
              std::mutex m;
              int total = 0;
              auto add_range = [&m, &total](int begin, int end) {
                int local = 0;
                for (int i = begin; i < end; ++i) local += i;
                std::lock_guard<std::mutex> lock(m);
                total += local;
              };
              std::thread a([&add_range] { add_range(0, 10); });
              std::thread b([&add_range] { add_range(10, 20); });
              a.join();
              b.join();
              std::cout << total << "\\n";
            }
          `),
          '190',
          'The half-open ranges cover 0 through 19 exactly once: 45 + 145 = 190.',
        ),
        typeOutput(
          'One worker locks per item and the other merges once. What is printed?',
          cpp(`
            #include <iostream>
            #include <mutex>
            #include <thread>
            int main() {
              std::mutex m;
              int total = 0;
              int locks = 0;
              auto per_item = [&m, &total, &locks] {
                for (int i = 0; i < 5; ++i) {
                  std::lock_guard<std::mutex> lock(m);
                  total += 1;
                  ++locks;
                }
              };
              auto batched = [&m, &total, &locks] {
                int local = 0;
                for (int i = 0; i < 5; ++i) local += 1;
                std::lock_guard<std::mutex> lock(m);
                total += local;
                ++locks;
              };
              std::thread a(per_item);
              std::thread b(batched);
              a.join();
              b.join();
              std::cout << total << " " << locks << "\\n";
            }
          `),
          '10 6',
          'Both workers contribute 5 to total, but per_item locks 5 times and batched locks once: 6 locks.',
        ),
        choose(
          'Why does each worker sum into `local` before locking?',
          [
            'local is atomic, so updating it needs no lock at all',
            'It removes the need for the mutex altogether',
            'It forces the workers to run one after the other, avoiding races',
            'Only the final merge touches shared state, so it locks once per worker',
          ],
          3,
          'local is private to its thread; only the merge into total needs mutual exclusion.',
        ),
        choose(
          'Two threads call this on different ranges. What is true?',
          [
            'Correct, but one worker waits while the other runs its whole loop',
            'The result can lose updates, because the loop is not atomic',
            'It deadlocks, because the lock is held across a loop',
            'It is faster than summing into a local first',
          ],
          0,
          'Holding the lock for the whole loop is correct but serializes the workers, removing the benefit of running them in parallel.',
          cpp(`
            auto add_range = [&m, &total](int begin, int end) {
              std::lock_guard<std::mutex> lock(m);
              for (int i = begin; i < end; ++i) total += i;
            };
          `),
        ),
      ],
    },
  ],
  'cpp-scoped-two-locks': [
    {
      title: 'Take two mutexes at once with std::scoped_lock',
      explanation: [
        'If one thread locks mutex a and then waits for b, while another thread holds b and waits for a, neither can continue: a deadlock, in which both threads block forever.',
        'std::scoped_lock (in <mutex>) takes several mutexes at once, as in `std::scoped_lock lock(a, b);`. It uses a deadlock-avoidance algorithm, so threads may even list the mutexes in different orders, and it unlocks all of them when its scope ends.',
      ],
      example: {
        language: 'cpp',
        code: cpp(`
          #include <iostream>
          #include <mutex>
          #include <thread>
          int main() {
            std::mutex cash_mutex;
            std::mutex stock_mutex;
            int cash = 100;
            int stock = 5;
            std::thread buy([&] {
              std::scoped_lock lock(cash_mutex, stock_mutex);
              cash -= 20;
              stock += 1;
            });
            std::thread sell([&] {
              std::scoped_lock lock(stock_mutex, cash_mutex);
              stock -= 2;
              cash += 45;
            });
            buy.join();
            sell.join();
            std::cout << cash << " " << stock << "\\n";
          }
        `),
        output: '125 4',
        explanation:
          'Each update runs holding both mutexes, and scoped_lock cannot deadlock even though the two threads list them in opposite orders: cash is 100 - 20 + 45 and stock is 5 + 1 - 2.',
      },
      questions: [
        choose(
          'What can happen when these two threads run at the same time?',
          [
            'Each thread holds one mutex and waits forever for the other',
            'The second lock_guard throws, because its mutex is busy',
            'The threads always run one after another, so it is safe',
            'The mutexes unlock automatically after a timeout',
          ],
          0,
          't1 can hold a while t2 holds b; then each waits for the mutex the other holds, a deadlock.',
          cpp(`
            std::thread t1([&] {
              std::lock_guard<std::mutex> first(a);
              std::lock_guard<std::mutex> second(b);
            });
            std::thread t2([&] {
              std::lock_guard<std::mutex> first(b);
              std::lock_guard<std::mutex> second(a);
            });
          `),
        ),
        typeOutput(
          'Two transfers run in opposite directions. What is printed?',
          cpp(`
            #include <iostream>
            #include <mutex>
            #include <thread>
            int main() {
              std::mutex ma;
              std::mutex mb;
              int a = 50;
              int b = 30;
              std::thread to_b([&] { std::scoped_lock lock(ma, mb); a -= 10; b += 10; });
              std::thread to_a([&] { std::scoped_lock lock(mb, ma); b -= 5; a += 5; });
              to_b.join();
              to_a.join();
              std::cout << a << " " << b << "\\n";
            }
          `),
          '45 35',
          'Both transfers complete under both locks: a is 50 - 10 + 5 and b is 30 + 10 - 5.',
        ),
        choose(
          'Which statement describes `std::scoped_lock lock(m1, m2);`?',
          [
            'It locks m1 and then m2, always in exactly the order written',
            'It locks whichever mutex is free and skips the other',
            'It takes both without deadlock and releases both at scope exit',
            'It must be followed by unlock() on each mutex',
          ],
          2,
          'scoped_lock uses the same deadlock-avoidance algorithm as std::lock and is an RAII owner of all its mutexes.',
        ),
        choose(
          'Two functions must each lock mutexes x and y. Which change removes the deadlock risk?',
          [
            'Lock x in one function and y in the other',
            'Lock them in opposite orders so each thread gets one',
            'Add a short sleep between the two lock_guards',
            'Use `std::scoped_lock lock(x, y);` in both functions',
          ],
          3,
          'Acquiring both through scoped_lock avoids the hold-one-wait-for-the-other cycle.',
        ),
      ],
    },
    {
      title: 'Hold both locks for the whole two-part update',
      explanation: [
        'Some invariants span two pieces of guarded state, such as money moving between two accounts: the sum must never appear to change. If a transfer locks one account, updates it, unlocks, and then locks the other, another thread can observe the money missing from both.',
        'Holding both mutexes for the entire update, and having readers lock both as well, means every reader sees the state entirely before or entirely after the transfer.',
      ],
      example: {
        language: 'cpp',
        code: cpp(`
          #include <iostream>
          #include <mutex>
          #include <thread>
          int main() {
            std::mutex ma;
            std::mutex mb;
            int a = 50;
            int b = 30;
            int audited = 0;
            std::thread transfer([&] {
              std::scoped_lock lock(ma, mb);
              a -= 20;
              b += 20;
            });
            std::thread audit([&] {
              std::scoped_lock lock(mb, ma);
              audited = a + b;
            });
            transfer.join();
            audit.join();
            std::cout << audited << "\\n";
          }
        `),
        output: '80',
        explanation:
          'The audit holds both locks, so it runs entirely before the transfer (50 + 30) or entirely after it (30 + 50).',
      },
      questions: [
        predictOutput(
          'Three accounts are guarded by three mutexes. What does the audit record?',
          cpp(`
            #include <iostream>
            #include <mutex>
            #include <thread>
            int main() {
              std::mutex mx;
              std::mutex my;
              std::mutex mz;
              int x = 10;
              int y = 20;
              int z = 30;
              int total = 0;
              std::thread move([&] {
                std::scoped_lock lock(mx, mz);
                z -= 15;
                x += 15;
              });
              std::thread audit([&] {
                std::scoped_lock lock(mx, my, mz);
                total = x + y + z;
              });
              move.join();
              audit.join();
              std::cout << total << "\\n";
            }
          `),
          ['45', '60', '75', '30'],
          1,
          'The audit holds every mutex the move uses, so it never sees z reduced without x increased; the sum is always 60.',
        ),
        choose(
          'With a = 50 and b = 30, which values can audited end up with?',
          ['Only 80', 'Only 60', 'Either 80 or 60', 'Any value from 30 to 80'],
          2,
          'Between the two locked blocks, a has lost 20 and b has not yet gained it; an audit there records 60.',
          cpp(`
            std::thread transfer([&] {
              { std::lock_guard<std::mutex> lock(ma); a -= 20; }
              { std::lock_guard<std::mutex> lock(mb); b += 20; }
            });
            std::thread audit([&] {
              std::scoped_lock lock(ma, mb);
              audited = a + b;
            });
          `),
        ),
        choose(
          'Why must the auditor lock both mutexes too?',
          [
            'Reads never need locks; only the transfer that writes does',
            'Otherwise it could read mid-transfer, racing with the writes',
            'scoped_lock refuses to lock a single mutex',
            'Locking both forces the audit to run before the transfer',
          ],
          1,
          'Exclusion only applies between threads that lock the same mutexes, and unlocked reads of written data are data races.',
        ),
        typeOutput(
          'What does this program print?',
          cpp(`
            #include <iostream>
            #include <mutex>
            #include <thread>
            int main() {
              std::mutex m_available;
              std::mutex m_reserved;
              int available = 12;
              int reserved = 0;
              int seen = 0;
              std::thread reserve([&] {
                std::scoped_lock lock(m_available, m_reserved);
                available -= 5;
                reserved += 5;
              });
              std::thread check([&] {
                std::scoped_lock lock(m_reserved, m_available);
                seen = available + reserved;
              });
              reserve.join();
              check.join();
              std::cout << seen << "\\n";
            }
          `),
          '12',
          'Both threads hold both mutexes, so the check sees 12 + 0 or 7 + 5: always 12.',
        ),
      ],
    },
  ],
  'cpp-mutex': [
    {
      title: 'unique_lock knows whether it owns the mutex',
      explanation: [
        'std::unique_lock is a more flexible owner than lock_guard. It locks in its constructor and unlocks in its destructor, but it also has unlock() and lock() members, and owns_lock() reports whether it currently holds the mutex.',
        'Constructing it with std::defer_lock associates the mutex without locking it. The destructor unlocks only if the lock is owned at that moment, and calling unlock() when it does not own the mutex throws std::system_error.',
      ],
      example: {
        language: 'cpp',
        code: cpp(`
          #include <iostream>
          #include <mutex>
          int main() {
            std::mutex m;
            std::unique_lock<std::mutex> lock(m);
            std::cout << lock.owns_lock() << " ";
            lock.unlock();
            std::cout << lock.owns_lock() << " ";
            lock.lock();
            std::cout << lock.owns_lock() << "\\n";
          }
        `),
        output: '1 0 1',
        explanation:
          'The constructor locks m, unlock() releases it and lock() takes it again; owns_lock() tracks each step.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          cpp(`
            #include <iostream>
            #include <mutex>
            int main() {
              std::mutex m;
              std::unique_lock<std::mutex> lock(m, std::defer_lock);
              std::cout << lock.owns_lock() << " ";
              lock.lock();
              std::cout << lock.owns_lock() << "\\n";
            }
          `),
          '0 1',
          'std::defer_lock leaves m unlocked at construction; the explicit lock() then takes it.',
        ),
        choose(
          'What happens at the second unlock()?',
          [
            'Nothing; unlocking twice is harmless',
            'It unlocks m a second time, letting two threads in',
            'It throws std::system_error: the lock no longer owns m',
            'It locks m again',
          ],
          2,
          'unique_lock::unlock requires ownership; without it the call throws std::system_error.',
          cpp(`
            std::unique_lock<std::mutex> lock(m);
            lock.unlock();
            lock.unlock();
          `),
        ),
        choose(
          'A unique_lock that is not currently holding its mutex goes out of scope. What does its destructor do?',
          [
            'Nothing, because it unlocks only a mutex it owns',
            'It unlocks the mutex anyway, whether or not it owns it',
            'It throws std::system_error',
            'It locks and then unlocks the mutex',
          ],
          0,
          'The destructor checks ownership and unlocks only when owns_lock() is true.',
        ),
        typeOutput(
          'What does this program print?',
          cpp(`
            #include <iostream>
            #include <mutex>
            #include <thread>
            int main() {
              std::mutex m;
              int total = 0;
              std::thread worker([&m, &total] {
                std::unique_lock<std::mutex> lock(m);
                total += 1;
                lock.unlock();
                lock.lock();
                total += 10;
              });
              worker.join();
              std::unique_lock<std::mutex> check(m);
              std::cout << total << " " << check.owns_lock() << "\\n";
            }
          `),
          '11 1',
          'The worker’s lock unlocks when its lambda ends, so main can lock m; total received both additions.',
        ),
      ],
    },
    {
      title: 'Unlock around private work, never in the middle of an update',
      explanation: [
        'unique_lock lets a thread give up the mutex while it does work that touches no shared state, so other threads are not kept waiting, and lock again before it touches shared state.',
        'Unlocking between reading shared state and writing a result based on it breaks the update in two: another thread can change the value in between, and the write then overwrites that change with a stale result.',
      ],
      example: {
        language: 'cpp',
        code: cpp(`
          #include <iostream>
          #include <mutex>
          #include <thread>
          int main() {
            std::mutex m;
            int total = 0;
            auto add_square = [&m, &total](int input) {
              std::unique_lock<std::mutex> lock(m, std::defer_lock);
              int squared = input * input;
              lock.lock();
              total += squared;
            };
            std::thread a([&add_square] { add_square(3); });
            std::thread b([&add_square] { add_square(4); });
            a.join();
            b.join();
            std::cout << total << "\\n";
          }
        `),
        output: '25',
        explanation:
          'Each worker computes its square without the lock and holds m only for the shared update, so the total is 9 + 16.',
      },
      questions: [
        choose(
          'Two threads run this with different amounts. What can go wrong?',
          [
            'Nothing, because every read and write of total happens while holding m',
            'A unique_lock cannot be locked again after unlock()',
            'It deadlocks at the second lock()',
            'total can change while unlocked, and the write then overwrites that change',
          ],
          3,
          'Both threads can read the same total, release the lock, and then each write its own seen + amount; one addition is lost.',
          cpp(`
            std::unique_lock<std::mutex> lock(m);
            int seen = total;
            lock.unlock();
            int next = seen + amount;
            lock.lock();
            total = next;
          `),
        ),
        typeOutput(
          'What does this program print?',
          cpp(`
            #include <iostream>
            #include <mutex>
            #include <thread>
            int main() {
              std::mutex m;
              int total = 100;
              auto apply = [&m, &total](int points) {
                std::unique_lock<std::mutex> lock(m, std::defer_lock);
                int bonus = points * 2;
                lock.lock();
                total += bonus;
                lock.unlock();
              };
              std::thread a([&apply] { apply(5); });
              std::thread b([&apply] { apply(7); });
              a.join();
              b.join();
              std::cout << total << "\\n";
            }
          `),
          '124',
          'Each worker adds twice its points under the lock: 100 + 10 + 14.',
        ),
        choose(
          'Which work may a thread do between `lock.unlock()` and the next `lock.lock()`?',
          [
            'Work on its own local variables only',
            'Reads of the shared state, but not writes',
            'Writes to the shared state, since the lock will be taken again',
            'Anything, because the unique_lock still owns the mutex',
          ],
          0,
          'While unlocked, shared state may be changed by others; touching it at all would race.',
        ),
        choose(
          'Why does add_square use std::unique_lock instead of std::lock_guard?',
          [
            'lock_guard cannot lock a std::mutex',
            'unique_lock can start unlocked and lock later',
            'unique_lock makes computing squared atomic',
            'lock_guard cannot be used inside a lambda',
          ],
          1,
          'lock_guard always locks at construction and offers no lock()/unlock(); unique_lock supports deferred locking.',
          cpp(`
            auto add_square = [&m, &total](int input) {
              std::unique_lock<std::mutex> lock(m, std::defer_lock);
              int squared = input * input;
              lock.lock();
              total += squared;
            };
          `),
        ),
      ],
    },
  ],
};

const signals: KnowledgePointModule = {
  'cpp-wait-predicate': [
    {
      title: 'Wait in a loop until the shared condition holds',
      explanation: [
        'A std::condition_variable (in <condition_variable>) lets a thread sleep until another thread reports a change. The waiter holds a std::unique_lock on the mutex that guards the shared state, checks the condition, and calls cv.wait(lock) only while the condition is false.',
        'wait can return although nothing changed (a spurious wakeup), and a notification can arrive before the waiter starts waiting. Rechecking in a loop, `while (!ready) cv.wait(lock);`, handles both: the thread continues only when the state really says so. `cv.wait(lock, [&] { return ready; })` is the same loop written as one call.',
      ],
      example: {
        language: 'cpp',
        code: cpp(`
          #include <condition_variable>
          #include <iostream>
          #include <mutex>
          #include <thread>
          int main() {
            std::mutex m;
            std::condition_variable cv;
            bool ready = false;
            int payload = 0;
            std::thread producer([&] {
              std::lock_guard<std::mutex> lock(m);
              payload = 21;
              ready = true;
              cv.notify_one();
            });
            std::unique_lock<std::mutex> lock(m);
            while (!ready) cv.wait(lock);
            int result = payload * 2;
            lock.unlock();
            producer.join();
            std::cout << result << "\\n";
          }
        `),
        output: '42',
        explanation:
          'If the producer runs first, ready is already true and main never waits; otherwise main waits until the producer sets ready. Either way main reads payload 21 under the lock.',
      },
      questions: [
        typeOutput(
          'No other thread exists. What does this program print?',
          cpp(`
            #include <condition_variable>
            #include <iostream>
            #include <mutex>
            int main() {
              std::mutex m;
              std::condition_variable cv;
              int items = 3;
              std::unique_lock<std::mutex> lock(m);
              while (items == 0) cv.wait(lock);
              std::cout << items << "\\n";
            }
          `),
          '3',
          'The condition is already satisfied, so the loop body never runs and the program prints 3 without waiting.',
        ),
        typeOutput(
          'The producer may notify before main starts waiting. What is printed?',
          cpp(`
            #include <condition_variable>
            #include <iostream>
            #include <mutex>
            #include <thread>
            int main() {
              std::mutex m;
              std::condition_variable cv;
              int count = 0;
              std::thread producer([&] {
                std::lock_guard<std::mutex> lock(m);
                count = 5;
                cv.notify_one();
              });
              std::unique_lock<std::mutex> lock(m);
              while (count < 5) cv.wait(lock);
              int seen = count;
              lock.unlock();
              producer.join();
              std::cout << seen << "\\n";
            }
          `),
          '5',
          'An early notification is lost, but the loop checks count first; it is already 5, so main does not wait.',
        ),
        choose(
          'Why is the condition checked in a while loop around cv.wait(lock) rather than in an if?',
          [
            'A loop makes wait return sooner',
            'An if would keep the mutex locked during the whole wait, blocking the producer',
            'wait can return with the condition still false, so it must be rechecked',
            'The loop is what calls notify_one',
          ],
          2,
          'Spurious wakeups (and wakeups for a state another thread already consumed) return from wait with the condition still false.',
        ),
        choose(
          'Which call is equivalent to `while (!ready) cv.wait(lock);`?',
          [
            'cv.wait(lock);',
            'cv.wait(lock, [&] { return !ready; });',
            'if (!ready) cv.wait(lock);',
            'cv.wait(lock, [&] { return ready; });',
          ],
          3,
          'The predicate overload loops until the predicate returns true, so the predicate is the condition to wait for: ready.',
        ),
      ],
    },
    {
      title: 'The condition is shared state, not the notification',
      explanation: [
        'A notification carries no data and is not remembered: notify_one with no thread waiting does nothing. The fact that work is ready must therefore live in shared variables, such as a bool or a count, protected by the same mutex the waiter locks.',
        'A waiter that relies on having been notified, instead of checking that state, can sleep forever after a notification that came early, or carry on with nothing ready after a spurious wakeup.',
      ],
      example: {
        language: 'cpp',
        code: cpp(`
          #include <condition_variable>
          #include <iostream>
          #include <mutex>
          #include <thread>
          int main() {
            std::mutex m;
            std::condition_variable cv;
            bool ready = false;
            std::thread producer([&] {
              std::lock_guard<std::mutex> lock(m);
              ready = true;
              cv.notify_one();
            });
            producer.join();
            std::unique_lock<std::mutex> lock(m);
            while (!ready) cv.wait(lock);
            std::cout << "proceed\\n";
          }
        `),
        output: 'proceed',
        explanation:
          'The notification was sent before anyone waited and was lost, but ready is true, so the loop never waits.',
      },
      questions: [
        choose(
          'What happens in this program?',
          [
            'wait returns at once, because the earlier notification was stored for it',
            'wait can block forever: the early notification is lost and no state records it',
            'It throws, because notify_one was called without a lock',
            'It does not compile without a predicate',
          ],
          1,
          'Notifications are not queued; with no state, nothing tells the waiter the event already happened.',
          cpp(`
            std::thread producer([&] { cv.notify_one(); });
            producer.join();
            std::unique_lock<std::mutex> lock(m);
            cv.wait(lock);
          `),
        ),
        typeOutput(
          'The producer finishes before main checks. What is printed?',
          cpp(`
            #include <condition_variable>
            #include <iostream>
            #include <mutex>
            #include <thread>
            int main() {
              std::mutex m;
              std::condition_variable cv;
              int jobs = 0;
              std::thread producer([&] {
                {
                  std::lock_guard<std::mutex> lock(m);
                  jobs += 1;
                }
                cv.notify_one();
                {
                  std::lock_guard<std::mutex> lock(m);
                  jobs += 1;
                }
                cv.notify_one();
              });
              producer.join();
              std::unique_lock<std::mutex> lock(m);
              while (jobs == 0) cv.wait(lock);
              std::cout << jobs << "\\n";
            }
          `),
          '2',
          'Both notifications were lost, but the count recorded both jobs, and main reads it without waiting.',
        ),
        choose(
          'What should a waiting thread check before deciding that data is available?',
          [
            'That cv.wait has returned',
            'The guarded state, such as a count or flag, under the mutex',
            'That notify_one has been called at least once',
            'Nothing, because cv.wait returns only after a notification',
          ],
          1,
          'Only the guarded state says whether data exists; wait can return spuriously and notifications can be missed.',
        ),
        choose(
          'Which variable is a correct condition for a consumer waiting on cv with mutex m?',
          [
            'A local bool inside the consumer',
            'A bool the producer sets without any lock',
            'A bool the producer sets while holding m',
            'The value returned by notify_one',
          ],
          2,
          'The condition must be shared and guarded by the same mutex; notify_one returns nothing at all.',
        ),
      ],
    },
  ],
  'cpp-notify-after-state': [
    {
      title: 'Change the state under the mutex, then notify',
      explanation: [
        'The producer side has two steps: lock the mutex and update the shared state, then call notify_one() to wake one waiter or notify_all() to wake every waiter. Notifying after the locked block ends lets the woken thread take the mutex at once.',
        'Updating the state under the same mutex the waiter uses is what makes the handoff reliable: the waiter either sees the new state when it checks, or is already waiting and is woken by the notification.',
      ],
      example: {
        language: 'cpp',
        code: cpp(`
          #include <condition_variable>
          #include <iostream>
          #include <mutex>
          #include <thread>
          int main() {
            std::mutex m;
            std::condition_variable cv;
            bool ready = false;
            int payload = 0;
            std::thread producer([&] {
              {
                std::lock_guard<std::mutex> lock(m);
                payload = 12;
                ready = true;
              }
              cv.notify_one();
            });
            std::unique_lock<std::mutex> lock(m);
            while (!ready) cv.wait(lock);
            int result = payload;
            lock.unlock();
            producer.join();
            std::cout << result << "\\n";
          }
        `),
        output: '12',
        explanation:
          'The producer sets payload and ready while holding m and notifies after releasing it; main proceeds only once ready is true and reads 12.',
      },
      questions: [
        typeOutput(
          'Two consumers wait for the same flag. What is printed?',
          cpp(`
            #include <condition_variable>
            #include <iostream>
            #include <mutex>
            #include <thread>
            int main() {
              std::mutex m;
              std::condition_variable cv;
              bool ready = false;
              int price = 0;
              int seen_a = 0;
              int seen_b = 0;
              std::thread a([&] {
                std::unique_lock<std::mutex> lock(m);
                while (!ready) cv.wait(lock);
                seen_a = price;
              });
              std::thread b([&] {
                std::unique_lock<std::mutex> lock(m);
                while (!ready) cv.wait(lock);
                seen_b = price + 1;
              });
              {
                std::lock_guard<std::mutex> lock(m);
                price = 70;
                ready = true;
              }
              cv.notify_all();
              a.join();
              b.join();
              std::cout << seen_a << " " << seen_b << "\\n";
            }
          `),
          '70 71',
          'notify_all wakes both consumers, and each sees ready true together with price 70.',
        ),
        choose(
          'A producer must wake every consumer waiting on the same condition. Which call does that?',
          [
            'notify_one()',
            'unlock() on each consumer’s lock',
            'notify_all()',
            'notify_one() once, before updating the state',
          ],
          2,
          'notify_all unblocks every thread currently waiting on the condition variable.',
        ),
        choose(
          'The consumer locks m and waits with `while (!ready) cv.wait(lock);`. What is wrong with this producer?',
          [
            'It should call notify_all',
            'It must notify first and set ready afterwards, so no wakeup is missed',
            'Nothing, because notify_one synchronizes the write',
            'It writes ready without locking m, racing with the consumer’s read',
          ],
          3,
          'The consumer reads ready under m; a write without m is an unsynchronized conflicting access.',
          cpp(`
            std::thread producer([&] {
              ready = true;
              cv.notify_one();
            });
          `),
        ),
        choose(
          'In which order should a producer act?',
          [
            'Lock m, set the state, unlock, then notify',
            'Notify, then lock m and set the state',
            'Set the state without the lock, then lock m and notify',
            'Lock m and notify, then set the state after unlocking',
          ],
          0,
          'The state change must be guarded by m and must happen before the notification that announces it.',
        ),
      ],
    },
    {
      title: 'Publish the payload together with the flag',
      explanation: [
        'The waiter treats the condition as permission to read the payload. So the payload must be written before, or together with, the condition inside the same locked block. The waiter, which holds the mutex when it sees the condition true, then also sees the finished payload.',
        'Setting the condition first and filling in the payload later, in a separate locked block or with no lock at all, lets the waiter wake up and read a half-written result.',
      ],
      example: {
        language: 'cpp',
        code: cpp(`
          #include <condition_variable>
          #include <iostream>
          #include <mutex>
          #include <thread>
          int main() {
            std::mutex m;
            std::condition_variable cv;
            bool ready = false;
            int bid = 0;
            int ask = 0;
            std::thread producer([&] {
              {
                std::lock_guard<std::mutex> lock(m);
                bid = 99;
                ask = 101;
                ready = true;
              }
              cv.notify_one();
            });
            std::unique_lock<std::mutex> lock(m);
            while (!ready) cv.wait(lock);
            int spread = ask - bid;
            lock.unlock();
            producer.join();
            std::cout << spread << "\\n";
          }
        `),
        output: '2',
        explanation:
          'bid, ask and ready change in one locked block, so a consumer that sees ready also sees both prices.',
      },
      questions: [
        choose(
          'What can the consumer observe with this producer?',
          [
            'Always the final payload, because ready is set under the lock',
            'ready true while payload still holds its old value',
            'ready false forever',
            'A compile error',
          ],
          1,
          'Between the two locked blocks ready is already true, so a consumer can wake and read the old payload.',
          cpp(`
            std::thread producer([&] {
              { std::lock_guard<std::mutex> lock(m); ready = true; }
              cv.notify_one();
              { std::lock_guard<std::mutex> lock(m); payload = 5; }
            });
          `),
        ),
        typeOutput(
          'What does this program print?',
          cpp(`
            #include <condition_variable>
            #include <iostream>
            #include <mutex>
            #include <thread>
            int main() {
              std::mutex m;
              std::condition_variable cv;
              bool ready = false;
              int quantity = 0;
              int price = 0;
              std::thread producer([&] {
                {
                  std::lock_guard<std::mutex> lock(m);
                  quantity = 4;
                  price = 25;
                  ready = true;
                }
                cv.notify_one();
              });
              std::unique_lock<std::mutex> lock(m);
              while (!ready) cv.wait(lock);
              int notional = quantity * price;
              lock.unlock();
              producer.join();
              std::cout << notional << "\\n";
            }
          `),
          '100',
          'quantity, price and ready are published in one locked block, so the consumer computes 4 * 25.',
        ),
        choose(
          'Which producer is correct for a consumer that waits for ready under m and then reads payload?',
          [
            'Lock m; set payload, then ready; unlock; notify_one()',
            'Lock m; set ready; unlock; set payload; notify_one()',
            'notify_one(); then lock m and set payload and ready',
            'Set ready and payload without the lock; notify_one()',
          ],
          0,
          'Only the first publishes the payload with the flag under m and notifies after the change.',
        ),
        typeOutput(
          'What does this program print?',
          cpp(`
            #include <condition_variable>
            #include <iostream>
            #include <mutex>
            #include <thread>
            int main() {
              std::mutex m;
              std::condition_variable cv;
              int version = 0;
              int low = 0;
              int high = 0;
              std::thread producer([&] {
                {
                  std::lock_guard<std::mutex> lock(m);
                  low = 3;
                  high = 9;
                  version = 1;
                }
                cv.notify_one();
              });
              std::unique_lock<std::mutex> lock(m);
              while (version == 0) cv.wait(lock);
              int range = high - low;
              lock.unlock();
              producer.join();
              std::cout << range << "\\n";
            }
          `),
          '6',
          'version changes in the same locked block as low and high, so the consumer sees 9 - 3.',
        ),
      ],
    },
  ],
  'cpp-wait-unlocks': [
    {
      title: 'wait releases the mutex while it sleeps',
      explanation: [
        'cv.wait(lock) does three things: it unlocks the mutex owned by lock, blocks until notified (or woken spuriously), and locks the mutex again before it returns. That is why wait takes a std::unique_lock rather than a lock_guard: it must be able to unlock and relock.',
        'Because the mutex is free while the waiter sleeps, the producer can lock that same mutex to change the state. If waiting kept the mutex locked, the producer could never make the condition true.',
      ],
      example: {
        language: 'cpp',
        code: cpp(`
          #include <condition_variable>
          #include <iostream>
          #include <mutex>
          #include <thread>
          int main() {
            std::mutex m;
            std::condition_variable cv;
            bool done = false;
            int result = 0;
            std::unique_lock<std::mutex> lock(m);
            std::thread worker([&] {
              std::lock_guard<std::mutex> guard(m);
              result = 5 + 2;
              done = true;
              cv.notify_one();
            });
            while (!done) cv.wait(lock);
            int seen = result;
            lock.unlock();
            worker.join();
            std::cout << seen << "\\n";
          }
        `),
        output: '7',
        explanation:
          'main locks m before the worker starts, so the worker can only get m once main’s wait releases it; the worker then sets done and main wakes holding m again.',
      },
      questions: [
        typeOutput(
          'main holds m when the helper starts. What is printed?',
          cpp(`
            #include <condition_variable>
            #include <iostream>
            #include <mutex>
            #include <thread>
            int main() {
              std::mutex m;
              std::condition_variable cv;
              int stage = 0;
              std::unique_lock<std::mutex> lock(m);
              std::thread helper([&] {
                std::lock_guard<std::mutex> guard(m);
                stage = 2;
                cv.notify_one();
              });
              while (stage == 0) cv.wait(lock);
              stage = stage * 10;
              int seen = stage;
              lock.unlock();
              helper.join();
              std::cout << seen << "\\n";
            }
          `),
          '20',
          'wait releases m, so the helper can set stage to 2; main wakes, relocks and multiplies by 10.',
        ),
        choose(
          'What state is the mutex in while a thread is blocked inside cv.wait(lock)?',
          [
            'Locked by the waiting thread',
            'Unlocked, so other threads can lock it',
            'Locked by the thread that will notify',
            'Destroyed until the notification arrives',
          ],
          1,
          'wait atomically releases the mutex when it blocks and reacquires it before returning.',
        ),
        choose(
          'Why does condition_variable::wait take a std::unique_lock rather than a std::lock_guard?',
          [
            'lock_guard cannot lock a std::mutex',
            'unique_lock is always faster',
            'lock_guard would notify the waiting thread automatically on unlock',
            'wait must unlock and relock the mutex, and lock_guard cannot',
          ],
          3,
          'Only unique_lock exposes unlock and lock, which wait uses around the blocking interval.',
        ),
        choose(
          'When cv.wait(lock) returns, what is true?',
          [
            'The mutex is locked again, but the condition must still be checked',
            'The mutex is unlocked and the condition is true',
            'The mutex is locked again and the condition is guaranteed to be true',
            'The thread that notified has finished',
          ],
          0,
          'wait always returns holding the mutex, but a return can be spurious, so the loop checks the condition again.',
        ),
      ],
    },
    {
      title: 'Wait on the mutex that guards the condition',
      explanation: [
        'The unique_lock passed to wait must own the same mutex the producer locks to change the condition. Checking the condition and starting to wait then happen as one step with respect to the producer, so a change cannot slip in between and be missed.',
        'A waiter that locks a different mutex gets no such guarantee. A waiter that also holds some other lock while it waits keeps that lock: wait releases only the one mutex it was given, and any thread needing the other lock stays blocked.',
      ],
      example: {
        language: 'cpp',
        code: cpp(`
          #include <condition_variable>
          #include <iostream>
          #include <mutex>
          #include <thread>
          int main() {
            std::mutex m;
            std::condition_variable cv;
            int arrived = 0;
            auto arrive = [&] {
              std::lock_guard<std::mutex> guard(m);
              arrived += 1;
              cv.notify_one();
            };
            std::thread a(arrive);
            std::thread b(arrive);
            std::unique_lock<std::mutex> lock(m);
            while (arrived < 2) cv.wait(lock);
            int seen = arrived;
            lock.unlock();
            a.join();
            b.join();
            std::cout << seen << "\\n";
          }
        `),
        output: '2',
        explanation:
          'Both arrivals and the waiter use m, so main’s check of arrived can never miss an update; it continues once both have arrived.',
      },
      questions: [
        choose(
          'The consumer waits using mutex other; the producer sets ready under mutex m. What is wrong?',
          [
            'Nothing, any mutex works with a condition variable',
            'Its reads of ready are not ordered with the producer’s write, so they race',
            'cv.wait only accepts the first mutex it was ever used with',
            'The producer must lock other instead of m when it sets ready and notifies',
          ],
          1,
          'The condition must be read and written under one mutex, and that mutex must be the one passed to wait.',
          cpp(`
            // consumer
            std::unique_lock<std::mutex> lock(other);
            while (!ready) cv.wait(lock);
            // producer
            { std::lock_guard<std::mutex> guard(m); ready = true; }
            cv.notify_one();
          `),
        ),
        typeOutput(
          'Three threads arrive with different weights. What is printed?',
          cpp(`
            #include <condition_variable>
            #include <iostream>
            #include <mutex>
            #include <thread>
            int main() {
              std::mutex m;
              std::condition_variable cv;
              int total = 0;
              auto arrive = [&](int weight) {
                std::lock_guard<std::mutex> guard(m);
                total += weight;
                cv.notify_one();
              };
              std::thread a([&arrive] { arrive(1); });
              std::thread b([&arrive] { arrive(2); });
              std::thread c([&arrive] { arrive(4); });
              std::unique_lock<std::mutex> lock(m);
              while (total < 7) cv.wait(lock);
              int seen = total;
              lock.unlock();
              a.join();
              b.join();
              c.join();
              std::cout << seen << "\\n";
            }
          `),
          '7',
          'main keeps waiting until all three weights have been added under m.',
        ),
        choose(
          'A consumer holds a lock_guard on log_m and then waits on cv with a unique_lock on m. The producer needs log_m before it can set the condition. What happens?',
          [
            'The producer proceeds, because wait releases every mutex the thread holds',
            'wait releases log_m because it was locked first',
            'The producer blocks on log_m, so the condition never changes',
            'The program does not compile',
          ],
          2,
          'wait releases only m; log_m stays locked, so the producer can never reach the state change.',
        ),
        typeOutput(
          'Two threads hand off turns using one mutex. What is printed?',
          cpp(`
            #include <condition_variable>
            #include <iostream>
            #include <mutex>
            #include <thread>
            int main() {
              std::mutex m;
              std::condition_variable cv;
              int stage = 0;
              int log = 0;
              std::thread worker([&] {
                std::unique_lock<std::mutex> lock(m);
                stage = 1;
                log = log * 10 + 1;
                cv.notify_one();
                while (stage != 2) cv.wait(lock);
                log = log * 10 + 3;
              });
              {
                std::unique_lock<std::mutex> lock(m);
                while (stage != 1) cv.wait(lock);
                log = log * 10 + 2;
                stage = 2;
              }
              cv.notify_one();
              worker.join();
              std::cout << log << "\\n";
            }
          `),
          '123',
          'Each wait releases m so the other side can run: the worker records 1, main records 2, then the worker records 3.',
        ),
      ],
    },
  ],
  'cpp-condition-variables': [
    {
      title: 'Wake consumers for data or for shutdown',
      explanation: [
        'A consumer that waits only for "the queue is not empty" sleeps forever once the producer has finished, because no more items will arrive. Add a closed flag to the guarded state and wait while the queue is empty and not closed: `while (!closed && queue.empty()) cv.wait(lock);`.',
        'When the loop ends, check which case it is: if an item is available, take it; otherwise the queue is empty and closed, and the consumer should stop.',
      ],
      example: {
        language: 'cpp',
        code: cpp(`
          #include <condition_variable>
          #include <deque>
          #include <iostream>
          #include <mutex>
          #include <thread>
          int main() {
            std::mutex m;
            std::condition_variable cv;
            std::deque<int> queue;
            bool closed = false;
            int taken = -1;
            std::thread producer([&] {
              {
                std::lock_guard<std::mutex> lock(m);
                closed = true;
              }
              cv.notify_all();
            });
            std::unique_lock<std::mutex> lock(m);
            while (!closed && queue.empty()) cv.wait(lock);
            if (!queue.empty()) taken = queue.front();
            lock.unlock();
            producer.join();
            std::cout << taken << "\\n";
          }
        `),
        output: '-1',
        explanation:
          'The producer closes without pushing anything. The consumer’s wait ends because closed is true, finds the queue empty and keeps taken at -1 instead of sleeping forever.',
      },
      questions: [
        typeOutput(
          'The producer pushes two items and closes in one locked block. What is printed?',
          cpp(`
            #include <condition_variable>
            #include <deque>
            #include <iostream>
            #include <mutex>
            #include <thread>
            int main() {
              std::mutex m;
              std::condition_variable cv;
              std::deque<int> queue;
              bool closed = false;
              std::thread producer([&] {
                {
                  std::lock_guard<std::mutex> lock(m);
                  queue.push_back(4);
                  queue.push_back(9);
                  closed = true;
                }
                cv.notify_all();
              });
              std::unique_lock<std::mutex> lock(m);
              while (!closed && queue.empty()) cv.wait(lock);
              int size = queue.size();
              int sum = queue.front() + queue.back();
              lock.unlock();
              producer.join();
              std::cout << size << " " << sum << "\\n";
            }
          `),
          '2 13',
          'The consumer can only see the state before the block (and keeps waiting) or after it, with both items queued.',
        ),
        choose(
          'A consumer waits with `while (queue.empty()) cv.wait(lock);`. The producer’s last item is taken by another consumer, and then the producer stops for good. What happens to this consumer?',
          [
            'It wakes up automatically when the producer thread ends and is joined',
            'It receives the last item as well',
            'It throws when the producer’s thread object is destroyed',
            'It sleeps forever: no item will arrive and nothing else ends the wait',
          ],
          3,
          'Its condition can only become true through a new item, so without a closed flag nothing can release it.',
        ),
        choose(
          'After `while (!closed && queue.empty()) cv.wait(lock);` ends, how should the consumer tell data from shutdown?',
          [
            'If closed is true, stop at once, even if some items remain in the queue',
            'Take an item if one is queued; otherwise it is closed and empty, so stop',
            'Always take queue.front()',
            'Check whether notify_all was called',
          ],
          1,
          'Items queued before the close are still data; only an empty, closed queue means stop.',
        ),
        typeOutput(
          'The queue is already closed but still holds an item. What is printed?',
          cpp(`
            #include <condition_variable>
            #include <deque>
            #include <iostream>
            #include <mutex>
            int main() {
              std::mutex m;
              std::condition_variable cv;
              std::deque<int> queue;
              bool closed = true;
              queue.push_back(8);
              std::unique_lock<std::mutex> lock(m);
              while (!closed && queue.empty()) cv.wait(lock);
              int taken = -1;
              if (!queue.empty()) taken = queue.front();
              std::cout << taken << "\\n";
            }
          `),
          '8',
          'The wait loop ends at once, and the item queued before the close is still delivered.',
        ),
      ],
    },
    {
      title: 'Close under the lock and wake every consumer',
      explanation: [
        'Closing is a change to the guarded state like any other: set closed while holding the mutex, then call notify_all(). notify_one would wake a single consumer and leave the others asleep on a queue that will never fill.',
        'Consumers keep taking the items that are still queued (front() reads one, pop_front() removes it) and stop only when they find the queue both closed and empty, so no item pushed before the close is lost.',
      ],
      example: {
        language: 'cpp',
        code: cpp(`
          #include <condition_variable>
          #include <deque>
          #include <iostream>
          #include <mutex>
          #include <thread>
          int main() {
            std::mutex m;
            std::condition_variable cv;
            std::deque<int> queue;
            bool closed = false;
            int got_a = 0;
            int got_b = 0;
            auto consume = [&](int& got) {
              std::unique_lock<std::mutex> lock(m);
              while (!closed && queue.empty()) cv.wait(lock);
              if (!queue.empty()) {
                got = queue.front();
                queue.pop_front();
              }
            };
            std::thread a([&] { consume(got_a); });
            std::thread b([&] { consume(got_b); });
            {
              std::lock_guard<std::mutex> lock(m);
              queue.push_back(5);
              closed = true;
            }
            cv.notify_all();
            a.join();
            b.join();
            std::cout << got_a + got_b << "\\n";
          }
        `),
        output: '5',
        explanation:
          'notify_all wakes both consumers. One takes the 5; the other finds the queue closed and empty and stops. Both finish, and the total is 5.',
      },
      questions: [
        choose(
          'Three consumers wait on cv. The producer sets closed = true under the lock and calls notify_one(). What happens?',
          [
            'All three wake and stop',
            'None wake, because closing is not a notification',
            'One wakes and stops; the other two can sleep forever',
            'notify_one wakes every waiter once closed is true',
          ],
          2,
          'notify_one unblocks at most one waiter; the rest never re-check the condition.',
        ),
        typeOutput(
          'Two consumers each take at most one item. What is printed?',
          cpp(`
            #include <condition_variable>
            #include <deque>
            #include <iostream>
            #include <mutex>
            #include <thread>
            int main() {
              std::mutex m;
              std::condition_variable cv;
              std::deque<int> queue;
              bool closed = false;
              int got_a = 0;
              int got_b = 0;
              auto consume = [&](int& got) {
                std::unique_lock<std::mutex> lock(m);
                while (!closed && queue.empty()) cv.wait(lock);
                if (!queue.empty()) {
                  got = queue.front();
                  queue.pop_front();
                }
              };
              std::thread a([&] { consume(got_a); });
              std::thread b([&] { consume(got_b); });
              {
                std::lock_guard<std::mutex> lock(m);
                queue.push_back(3);
                queue.push_back(4);
                closed = true;
              }
              cv.notify_all();
              a.join();
              b.join();
              std::cout << got_a + got_b << "\\n";
            }
          `),
          '7',
          'Each consumer takes one of the two queued items before noticing the close, so together they get 3 + 4.',
        ),
        choose(
          'Which shutdown sequence is correct for consumers that wait on cv with mutex m?',
          [
            'Lock m, set closed = true, unlock, then notify_all()',
            'Set closed = true without the lock, then notify_all()',
            'Lock m, set closed = true, unlock, then notify_one()',
            'notify_all(), then lock m and set closed = true',
          ],
          0,
          'The flag must change under m before the notification, and every waiter must be woken.',
        ),
        typeOutput(
          'The queue is closed with two items left. One consumer takes at most one item. What is printed?',
          cpp(`
            #include <condition_variable>
            #include <deque>
            #include <iostream>
            #include <mutex>
            int main() {
              std::mutex m;
              std::condition_variable cv;
              std::deque<int> queue;
              queue.push_back(1);
              queue.push_back(2);
              bool closed = true;
              int taken = -1;
              std::unique_lock<std::mutex> lock(m);
              while (!closed && queue.empty()) cv.wait(lock);
              if (!queue.empty()) {
                taken = queue.front();
                queue.pop_front();
              }
              int left = queue.size();
              std::cout << taken << " " << left << "\\n";
            }
          `),
          '1 1',
          'Closing does not discard queued items: the consumer takes the front item 1, and 2 remains for the next consumer.',
        ),
      ],
    },
  ],
};

const atomics: KnowledgePointModule = {
  'cpp-atomic-load-store': [
    {
      title: 'An atomic can be read and written by several threads at once',
      explanation: [
        'std::atomic<int> (in <atomic>) wraps an int so that each load() and store() is indivisible and never a data race, even when one thread stores while another loads. A reader sees either the old value or the new one, never a torn mixture.',
        'Plain assignment and reading also work on an atomic (`a = 5;` and `int v = a;`); they are store and load calls written as operators.',
      ],
      example: {
        language: 'cpp',
        code: cpp(`
          #include <atomic>
          #include <iostream>
          #include <thread>
          int main() {
            std::atomic<int> latest{0};
            std::thread writer([&latest] { latest.store(42); });
            writer.join();
            std::cout << latest.load() << "\\n";
          }
        `),
        output: '42',
        explanation:
          'The worker stores 42 into the atomic; after the join, main’s load reads it.',
      },
      questions: [
        typeOutput(
          'Two workers store into the same atomic at the same time. What is printed?',
          cpp(`
            #include <atomic>
            #include <iostream>
            #include <thread>
            int main() {
              std::atomic<int> status{0};
              std::thread a([&status] { status.store(7); });
              std::thread b([&status] { status.store(7); });
              a.join();
              b.join();
              std::cout << status.load() << "\\n";
            }
          `),
          '7',
          'Concurrent stores to an atomic are not a data race; both store 7, so 7 is the final value.',
        ),
        typeOutput(
          'What does this program print?',
          cpp(`
            #include <atomic>
            #include <iostream>
            int main() {
              std::atomic<int> level{3};
              level = 8;
              int copy = level;
              level.store(copy + 1);
              std::cout << copy << " " << level.load() << "\\n";
            }
          `),
          '8 9',
          'Assignment stores 8, reading into copy loads 8, and the explicit store writes 9.',
        ),
        choose(
          'One thread stores 5 into std::atomic<int> x (previously 1) while another thread loads x. What can the load return?',
          [
            'Either 1 or 5',
            'A mix of bits from 1 and 5',
            'Always 5',
            'Anything, because the accesses race',
          ],
          0,
          'Atomic loads and stores are indivisible, so the load returns one of the values actually stored.',
        ),
        choose(
          'Which declaration makes concurrent reads and writes of `ticks` free of data races?',
          [
            'int ticks = 0;',
            'volatile int ticks = 0;',
            'static int ticks = 0;',
            'std::atomic<int> ticks{0};',
          ],
          3,
          'volatile and static say nothing about concurrent access; only std::atomic makes the accesses race-free.',
        ),
      ],
    },
    {
      title: 'An atomic protects only itself',
      explanation: [
        'Atomicity applies to the atomic object alone. Making a counter or flag atomic does not make other plain variables safe to share: a plain int written by one thread and read by another still needs a join, a lock, or a deliberate ordering protocol between the two accesses.',
        'Whether a flag can announce that other data is ready depends on memory ordering, which later skills cover. Until then, read plain shared data only after a join or under a mutex.',
      ],
      example: {
        language: 'cpp',
        code: cpp(`
          #include <atomic>
          #include <iostream>
          #include <thread>
          int main() {
            std::atomic<int> done{0};
            int payload = 0;
            std::thread worker([&done, &payload] {
              payload = 64;
              done.store(1);
            });
            worker.join();
            std::cout << done.load() << " " << payload << "\\n";
          }
        `),
        output: '1 64',
        explanation:
          'Here the join is what makes payload safe to read; the atomic done only guarantees race-free access to done itself.',
      },
      questions: [
        choose(
          'Is main’s read of payload safe?',
          [
            'Yes, because ready is atomic',
            'Yes, because the worker writes payload before it stores ready',
            'No: payload is plain, and nothing orders main’s read after the write',
            'No, because ready.store must be the first statement',
          ],
          2,
          'main never even looks at ready before reading payload, so the plain write and read race.',
          cpp(`
            std::atomic<int> ready{0};
            int payload = 0;
            std::thread writer([&] { payload = 5; ready.store(1); });
            std::cout << payload << "\\n";
            writer.join();
          `),
        ),
        choose(
          'Two threads each run `hits = hits + 1;` on a plain int and `calls.store(1);` on an atomic. Which accesses race?',
          [
            'Only the stores to calls',
            'Only the accesses to hits',
            'Both',
            'Neither, because the atomic store protects the whole lambda',
          ],
          1,
          'The atomic store is race-free; the plain read-modify-write of hits is not protected by it.',
        ),
        typeOutput(
          'What does this program print?',
          cpp(`
            #include <atomic>
            #include <iostream>
            #include <thread>
            int main() {
              std::atomic<int> finished{0};
              int a_out = 0;
              int b_out = 0;
              std::thread a([&finished, &a_out] { a_out = 3; finished.store(1); });
              std::thread b([&finished, &b_out] { b_out = 4; finished.store(1); });
              a.join();
              b.join();
              std::cout << a_out + b_out << " " << finished.load() << "\\n";
            }
          `),
          '7 1',
          'Each worker has its own output, read after the joins; both store 1 into finished, which stays 1.',
        ),
        choose(
          'What does declaring `std::atomic<int> count` guarantee?',
          [
            'Every variable written in the same thread is published with count',
            'Threads that use count run one at a time',
            'Loads and stores of count itself never race',
            'count can no longer change after it has been read',
          ],
          2,
          'The guarantee covers operations on count; other data needs its own synchronization.',
        ),
      ],
    },
  ],
  'cpp-atomic-fetch-add': [
    {
      title: 'fetch_add adds in one step and returns the old value',
      explanation: [
        'x.fetch_add(n) adds n to an atomic as one indivisible read-modify-write and returns the value x held just before the addition. fetch_sub works the same way for subtraction.',
        'The operators ++, --, += and -= on an atomic are single read-modify-writes too. Watch their results: x++ and fetch_add give the old value, while ++x and x += n give the new one.',
      ],
      example: {
        language: 'cpp',
        code: cpp(`
          #include <atomic>
          #include <iostream>
          int main() {
            std::atomic<int> counter{10};
            int before = counter.fetch_add(5);
            int after = counter.load();
            std::cout << before << " " << after << "\\n";
          }
        `),
        output: '10 15',
        explanation: 'fetch_add returns the 10 it found and leaves 15 behind.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          cpp(`
            #include <atomic>
            #include <iostream>
            int main() {
              std::atomic<int> tickets{3};
              int first = tickets.fetch_add(1);
              int second = tickets.fetch_add(1);
              std::cout << first << " " << second << " " << tickets.load() << "\\n";
            }
          `),
          '3 4 5',
          'Each fetch_add returns the value before its own addition: 3, then 4, leaving 5.',
        ),
        typeOutput(
          'What does this program print?',
          cpp(`
            #include <atomic>
            #include <iostream>
            int main() {
              std::atomic<int> stock{20};
              int old = stock.fetch_sub(6);
              int now = (stock -= 4);
              std::cout << old << " " << now << "\\n";
            }
          `),
          '20 10',
          'fetch_sub returns the old 20; -= returns the new value, 14 - 4 = 10.',
        ),
        typeOutput(
          'What does this program print?',
          cpp(`
            #include <atomic>
            #include <iostream>
            int main() {
              std::atomic<int> n{7};
              int a = n++;
              int b = ++n;
              std::cout << a << " " << b << "\\n";
            }
          `),
          '7 9',
          'n++ yields the old 7 (n becomes 8); ++n yields the new 9.',
        ),
        choose(
          'Two threads call `next.fetch_add(1)` at the same moment while next is 4. What do they receive?',
          [
            'Both receive 4',
            'Both receive 5',
            'One receives 4 and the other 5',
            'One receives 5 and the other 6',
          ],
          2,
          'The two read-modify-writes happen one after the other, so they see 4 and 5 in some order.',
        ),
      ],
    },
    {
      title: 'A load followed by a store is not an atomic increment',
      explanation: [
        'Writing `x.store(x.load() + 1)` performs two separate atomic operations. Another thread’s update can land between the load and the store, and the store then overwrites it with a stale result, so increments are lost even though x is atomic.',
        'Use a single read-modify-write (fetch_add, ++ or +=) whenever the new value depends on the old one. Each one acts on the latest value, so concurrent updates are never lost.',
      ],
      example: {
        language: 'cpp',
        code: cpp(`
          #include <atomic>
          #include <iostream>
          #include <thread>
          int main() {
            std::atomic<int> total{0};
            std::thread a([&total] { total.fetch_add(5); });
            std::thread b([&total] { total.fetch_add(7); });
            std::thread c([&total] { total.fetch_add(9); });
            a.join();
            b.join();
            c.join();
            std::cout << total.load() << "\\n";
          }
        `),
        output: '21',
        explanation:
          'Each fetch_add applies to the current value, whatever order the workers run in, so all three additions land.',
      },
      questions: [
        choose(
          'x starts at 0. Which final values of x are possible?',
          ['Only 2', 'Only 1', 'Any value, because of a data race', '1 or 2'],
          3,
          'Both threads can load 0 before either stores, so both store 1; otherwise the result is 2. Atomics prevent a data race, not the lost update.',
          cpp(`
            std::thread a([&x] { x.store(x.load() + 1); });
            std::thread b([&x] { x.store(x.load() + 1); });
          `),
        ),
        typeOutput(
          'What does this program print?',
          cpp(`
            #include <atomic>
            #include <iostream>
            #include <thread>
            int main() {
              std::atomic<int> balance{100};
              std::thread pay([&balance] { balance.fetch_sub(30); });
              std::thread earn([&balance] { balance.fetch_add(45); });
              pay.join();
              earn.join();
              std::cout << balance.load() << "\\n";
            }
          `),
          '115',
          'Both read-modify-writes apply in some order: 100 - 30 + 45 = 115.',
        ),
        choose(
          'Which statement increments an atomic counter correctly when several threads do it at once?',
          [
            'counter.store(counter.load() + 1);',
            'int v = counter; counter = v + 1;',
            'counter.fetch_add(1);',
            'counter.load() + 1;',
          ],
          2,
          'Only fetch_add reads and writes in one indivisible step.',
        ),
        typeOutput(
          'Each worker records the value fetch_add returned. What is printed?',
          cpp(`
            #include <atomic>
            #include <iostream>
            #include <thread>
            int main() {
              std::atomic<int> next{0};
              int got_a = -1;
              int got_b = -1;
              std::thread a([&next, &got_a] { got_a = next.fetch_add(1); });
              std::thread b([&next, &got_b] { got_b = next.fetch_add(1); });
              a.join();
              b.join();
              std::cout << got_a + got_b << " " << next.load() << "\\n";
            }
          `),
          '1 2',
          'One worker gets 0 and the other 1, in either order, so the sum is always 1 and next ends at 2.',
        ),
      ],
    },
  ],
  'cpp-atomic-compare-exchange': [
    {
      title:
        'compare_exchange_strong writes only if the value is what you expected',
      explanation: [
        'x.compare_exchange_strong(expected, desired) compares x with expected. If they are equal it stores desired and returns true. If not, it leaves x unchanged, copies x’s current value into expected, and returns false. The comparison and the store happen as one indivisible step.',
        'expected is passed by reference precisely so that a failed attempt reports what the value really was. The bool result prints as 1 or 0.',
      ],
      example: {
        language: 'cpp',
        code: cpp(`
          #include <atomic>
          #include <iostream>
          int main() {
            std::atomic<int> seat{0};
            int expected = 0;
            bool won = seat.compare_exchange_strong(expected, 7);
            std::cout << won << " " << seat.load() << " " << expected << "\\n";
          }
        `),
        output: '1 7 0',
        explanation:
          'seat held the expected 0, so 7 is stored, the call returns true, and expected is left unchanged.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          cpp(`
            #include <atomic>
            #include <iostream>
            int main() {
              std::atomic<int> owner{3};
              int expected = 0;
              bool won = owner.compare_exchange_strong(expected, 9);
              std::cout << won << " " << owner.load() << " " << expected << "\\n";
            }
          `),
          '0 3 3',
          'owner holds 3, not 0, so nothing is stored and expected is refreshed to 3.',
        ),
        typeOutput(
          'What does this program print?',
          cpp(`
            #include <atomic>
            #include <iostream>
            int main() {
              std::atomic<int> v{5};
              int e1 = 5;
              int e2 = 5;
              bool first = v.compare_exchange_strong(e1, 6);
              bool second = v.compare_exchange_strong(e2, 7);
              std::cout << first << second << " " << v.load() << " " << e2 << "\\n";
            }
          `),
          '10 6 6',
          'The first call succeeds (v becomes 6); the second expects 5, finds 6, fails, and refreshes e2 to 6.',
        ),
        predictOutput(
          'Two threads race to claim an empty slot. How many of them win?',
          cpp(`
            #include <atomic>
            #include <iostream>
            #include <thread>
            int main() {
              std::atomic<int> slot{0};
              int wins_a = 0;
              int wins_b = 0;
              std::thread a([&slot, &wins_a] {
                int expected = 0;
                wins_a = slot.compare_exchange_strong(expected, 1);
              });
              std::thread b([&slot, &wins_b] {
                int expected = 0;
                wins_b = slot.compare_exchange_strong(expected, 2);
              });
              a.join();
              b.join();
              std::cout << wins_a + wins_b << "\\n";
            }
          `),
          ['1', '0', '2', 'Either 1 or 2'],
          0,
          'Only the first exchange finds 0; the second then sees 1 or 2 and fails, so exactly one thread wins.',
        ),
        choose(
          'After a failed compare_exchange_strong(expected, desired), what does expected hold?',
          [
            'Its original value, unchanged',
            'The desired value',
            'Zero',
            'The atomic’s current value',
          ],
          3,
          'On failure the call loads the current value into expected.',
        ),
      ],
    },
    {
      title: 'Recompute the desired value from the refreshed expected',
      explanation: [
        'When a compare-exchange fails, expected now holds the current value. A second attempt must compute its desired value from that refreshed expected; reusing an old desired would store a result based on stale data, even if the exchange then succeeds.',
        'Resetting expected to the old guess before trying again simply fails again. (Repeating attempts in a loop is the subject of a later skill.)',
      ],
      example: {
        language: 'cpp',
        code: cpp(`
          #include <atomic>
          #include <iostream>
          int main() {
            std::atomic<int> value{10};
            int expected = 7;
            bool first = value.compare_exchange_strong(expected, expected * 2);
            bool second = value.compare_exchange_strong(expected, expected * 2);
            std::cout << first << " " << second << " " << value.load() << "\\n";
          }
        `),
        output: '0 1 20',
        explanation:
          'The first call compares 10 with 7, fails and refreshes expected to 10. The second call computes desired as 20 from the refreshed value and succeeds.',
      },
      questions: [
        typeOutput(
          'A second claimant tries the same slot. What is printed?',
          cpp(`
            #include <atomic>
            #include <iostream>
            int main() {
              std::atomic<int> owner{0};
              int first_try = 0;
              owner.compare_exchange_strong(first_try, 4);
              int second_try = 0;
              bool won = owner.compare_exchange_strong(second_try, 8);
              std::cout << won << " " << second_try << "\\n";
            }
          `),
          '0 4',
          'The second claim fails, and second_try reports the current owner, 4.',
        ),
        typeOutput(
          'desired was computed once, from a stale guess. What is printed?',
          cpp(`
            #include <atomic>
            #include <iostream>
            int main() {
              std::atomic<int> v{6};
              int expected = 5;
              int desired = expected + 1;
              bool first = v.compare_exchange_strong(expected, desired);
              bool second = v.compare_exchange_strong(expected, desired);
              std::cout << first << " " << second << " " << v.load() << "\\n";
            }
          `),
          '0 1 6',
          'The retry succeeds but stores the stale desired 6, so the intended increment of the current value never happens.',
        ),
        choose(
          'A thread wants to add 3 to an atomic with compare_exchange_strong, and its first attempt fails. What must it do before trying again?',
          [
            'Reset expected to its original guess',
            'Compute the new desired value from the refreshed expected',
            'Store the old desired value directly with store()',
            'Reuse the same desired value, since only expected changed',
          ],
          1,
          'expected now holds the current value; desired must be that value plus 3.',
        ),
        typeOutput(
          'expected is reset to the old guess before the second attempt. What is printed?',
          cpp(`
            #include <atomic>
            #include <iostream>
            int main() {
              std::atomic<int> state{1};
              int expected = 1;
              state.compare_exchange_strong(expected, 2);
              expected = 1;
              bool again = state.compare_exchange_strong(expected, 3);
              std::cout << again << " " << state.load() << " " << expected << "\\n";
            }
          `),
          '0 2 2',
          'state is already 2, so expecting 1 fails; expected is refreshed to 2 and state stays 2.',
        ),
      ],
    },
  ],
  'cpp-relaxed-counter': [
    {
      title: 'Relaxed operations are still atomic',
      explanation: [
        'Atomic operations take an optional memory order. std::memory_order_relaxed keeps the operation indivisible, and all threads agree on one order of modifications to that single atomic, but it orders nothing else.',
        'That is all a pure counter needs: concurrent fetch_add(1, std::memory_order_relaxed) calls never lose an increment, and once the counting threads are joined a load sees the full total.',
      ],
      example: {
        language: 'cpp',
        code: cpp(`
          #include <atomic>
          #include <iostream>
          #include <thread>
          int main() {
            std::atomic<int> hits{0};
            std::thread a([&hits] {
              hits.fetch_add(1, std::memory_order_relaxed);
              hits.fetch_add(1, std::memory_order_relaxed);
            });
            std::thread b([&hits] { hits.fetch_add(3, std::memory_order_relaxed); });
            a.join();
            b.join();
            std::cout << hits.load(std::memory_order_relaxed) << "\\n";
          }
        `),
        output: '5',
        explanation:
          'Relaxed fetch_add is still one indivisible read-modify-write, so all three additions count.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          cpp(`
            #include <atomic>
            #include <iostream>
            #include <thread>
            int main() {
              std::atomic<int> total{0};
              std::thread a([&total] { total.fetch_add(2, std::memory_order_relaxed); });
              std::thread b([&total] { total.fetch_add(4, std::memory_order_relaxed); });
              std::thread c([&total] { total.fetch_add(6, std::memory_order_relaxed); });
              a.join();
              b.join();
              c.join();
              std::cout << total.load(std::memory_order_relaxed) << "\\n";
            }
          `),
          '12',
          'Relaxed ordering does not weaken atomicity; no addition is lost, so the total is 2 + 4 + 6.',
        ),
        typeOutput(
          'What does this program print?',
          cpp(`
            #include <atomic>
            #include <iostream>
            int main() {
              std::atomic<int> c{8};
              int old = c.fetch_add(2, std::memory_order_relaxed);
              std::cout << old << " " << c.load(std::memory_order_relaxed) << "\\n";
            }
          `),
          '8 10',
          'A relaxed fetch_add still returns the previous value, 8, and leaves 10.',
        ),
        choose(
          'What does std::memory_order_relaxed give up compared with the default ordering?',
          [
            'Atomicity: concurrent relaxed increments can be lost under contention',
            'The single modification order of that atomic',
            'Ordering of other memory around it; the operation stays atomic',
            'Nothing; relaxed is simply faster',
          ],
          2,
          'Relaxed keeps the operation indivisible and its own modification order, but creates no ordering for other data.',
        ),
        choose(
          'Several threads count processed messages with fetch_add(1, relaxed). When is the total guaranteed to be complete?',
          [
            'As soon as any thread finishes',
            'After all counting threads have been joined',
            'Never, because relaxed counts are approximate',
            'Only if every load is relaxed as well',
          ],
          1,
          'Every increment counts; joining the counting threads ensures they have all happened before the final load.',
        ),
      ],
    },
    {
      title: 'A relaxed flag does not publish other data',
      explanation: [
        'Because relaxed operations order only themselves, a thread that sees a relaxed store of a flag learns nothing about plain writes made before that store. If a reader waits until a relaxed load of the flag returns 1 and then reads a plain payload, that read still races with the writer.',
        'Use relaxed only when the atomic’s own value is all that matters, as with statistics counters. When a flag must announce that other data is ready, a stronger ordering is needed.',
      ],
      example: {
        language: 'cpp',
        code: cpp(`
          #include <atomic>
          #include <iostream>
          #include <thread>
          int main() {
            std::atomic<int> processed{0};
            int last_value = 0;
            std::thread worker([&processed, &last_value] {
              last_value = 30;
              processed.fetch_add(1, std::memory_order_relaxed);
            });
            worker.join();
            std::cout << processed.load(std::memory_order_relaxed) << " " << last_value << "\\n";
          }
        `),
        output: '1 30',
        explanation:
          'The relaxed counter is exact, and main reads last_value safely because the join, not the relaxed counter, orders the read after the write.',
      },
      questions: [
        choose(
          'A writer sets a plain payload to 42 and then does ready.store(1, relaxed). A reader waits until ready.load(relaxed) returns 1 and then reads payload. What is wrong?',
          [
            'Nothing: once ready is 1, payload is 42',
            'The reader can never see 1, because relaxed stores are not visible to other threads',
            'A relaxed flag does not order payload, so the read of payload races with the write',
            'ready must be a plain int for this to work',
          ],
          2,
          'Relaxed operations create no happens-before edge, so the payload write is not ordered before the read.',
        ),
        choose(
          'Which job is a good fit for memory_order_relaxed?',
          [
            'Signalling that a plain buffer has been filled',
            'Counting handled requests, read after the workers are joined',
            'Telling a reader that a configuration struct is ready',
            'Protecting a plain int that two threads increment',
          ],
          1,
          'A counter needs atomicity but no ordering of other data; the others all publish other data.',
        ),
        typeOutput(
          'One worker stores twice with relaxed ordering. What is printed?',
          cpp(`
            #include <atomic>
            #include <iostream>
            #include <thread>
            int main() {
              std::atomic<int> phase{0};
              std::thread w([&phase] {
                phase.store(1, std::memory_order_relaxed);
                phase.store(2, std::memory_order_relaxed);
              });
              w.join();
              std::cout << phase.load(std::memory_order_relaxed) << "\\n";
            }
          `),
          '2',
          'Stores to one atomic keep their order in its modification order, and after the join the last one, 2, is seen.',
        ),
        choose(
          'Two threads each make 1000 relaxed fetch_add(1) calls on one atomic. After both are joined, the total is:',
          [
            'Exactly 2000',
            'Somewhere between 1000 and 2000',
            'Undefined, because relaxed operations race',
            'Exactly 1000',
          ],
          0,
          'Relaxed read-modify-writes are atomic, so no increment is lost.',
        ),
      ],
    },
  ],
  'cpp-atomics': [
    {
      title: 'Count events from many threads with fetch_add',
      explanation: [
        'When several workers count events into one total, each event should be one fetch_add on a shared atomic. However the threads interleave, no increment is lost, so after every worker is joined the total equals the number of events.',
        'Counting does not depend on order, so memory_order_relaxed is enough for the increments; the joins make the final total visible to the reader.',
      ],
      example: {
        language: 'cpp',
        code: cpp(`
          #include <atomic>
          #include <iostream>
          #include <thread>
          int main() {
            std::atomic<int> total{0};
            auto worker = [&total] {
              for (int i = 0; i < 1000; ++i) total.fetch_add(1, std::memory_order_relaxed);
            };
            std::thread a(worker);
            std::thread b(worker);
            std::thread c(worker);
            a.join();
            b.join();
            c.join();
            std::cout << total.load() << "\\n";
          }
        `),
        output: '3000',
        explanation:
          'Each of the 3000 fetch_add calls is indivisible, so the joined total is exact.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          cpp(`
            #include <atomic>
            #include <iostream>
            #include <thread>
            int main() {
              std::atomic<int> total{0};
              auto worker = [&total] {
                for (int i = 0; i < 5; ++i) total.fetch_add(i, std::memory_order_relaxed);
              };
              std::thread a(worker);
              std::thread b(worker);
              a.join();
              b.join();
              std::cout << total.load() << "\\n";
            }
          `),
          '20',
          'Each worker adds 0 + 1 + 2 + 3 + 4 = 10, and both workers’ additions land.',
        ),
        typeOutput(
          'What does this program print?',
          cpp(`
            #include <atomic>
            #include <iostream>
            #include <thread>
            int main() {
              std::atomic<int> orders{0};
              std::atomic<int> cancels{0};
              auto worker = [&orders, &cancels] {
                for (int i = 0; i < 6; ++i) orders.fetch_add(1, std::memory_order_relaxed);
                for (int i = 0; i < 2; ++i) cancels.fetch_add(1, std::memory_order_relaxed);
              };
              std::thread a(worker);
              std::thread b(worker);
              a.join();
              b.join();
              std::cout << orders.load() - cancels.load() << "\\n";
            }
          `),
          '8',
          'Two workers record 12 orders and 4 cancels, so the difference is 8.',
        ),
        choose(
          'Four workers each call fetch_add(1) 250 times on one atomic. What does main read after joining all four?',
          ['Some value up to 1000', '250', '1000', '4'],
          2,
          'Every atomic increment counts, so the joined total is 4 * 250.',
        ),
        choose(
          'Why can this counter finish below 2000 when two threads run worker?',
          [
            'store needs memory_order_relaxed to avoid losing increments',
            'Atomics cannot be used inside loops',
            'total must be joined before it is read, or the count looks low',
            'Each load-then-store pair can overwrite another thread’s increment',
          ],
          3,
          'Two separate atomic operations leave a gap in which the other thread’s update is lost.',
          cpp(`
            auto worker = [&total] {
              for (int i = 0; i < 1000; ++i) total.store(total.load() + 1);
            };
          `),
        ),
      ],
    },
    {
      title: 'Count locally, publish once per worker',
      explanation: [
        'A common shape gives each worker its own slice of the input as a half-open range and lets it accumulate in a local variable, then add that local result to the shared atomic with one fetch_add. The total is the same as adding per element, and the shared atomic is touched once per worker.',
        'The slices must not overlap: with [0, 50) and [50, 100), every index belongs to exactly one worker.',
      ],
      example: {
        language: 'cpp',
        code: cpp(`
          #include <atomic>
          #include <iostream>
          #include <thread>
          int main() {
            std::atomic<int> volume{0};
            auto add_slice = [&volume](int begin, int end) {
              int local = 0;
              for (int i = begin; i < end; ++i) local += i;
              volume.fetch_add(local, std::memory_order_relaxed);
            };
            std::thread a([&add_slice] { add_slice(1, 6); });
            std::thread b([&add_slice] { add_slice(6, 11); });
            a.join();
            b.join();
            std::cout << volume.load() << "\\n";
          }
        `),
        output: '55',
        explanation:
          'The slices cover 1 through 10 exactly once; each worker publishes its partial sum (15 and 40) with a single fetch_add.',
      },
      questions: [
        typeOutput(
          'A second atomic counts the publishing calls. What is printed?',
          cpp(`
            #include <atomic>
            #include <iostream>
            #include <thread>
            int main() {
              std::atomic<int> items{0};
              std::atomic<int> calls{0};
              auto count_slice = [&items, &calls](int begin, int end) {
                int local = 0;
                for (int i = begin; i < end; ++i) local += 1;
                items.fetch_add(local, std::memory_order_relaxed);
                calls.fetch_add(1, std::memory_order_relaxed);
              };
              std::thread a([&count_slice] { count_slice(0, 3); });
              std::thread b([&count_slice] { count_slice(3, 10); });
              a.join();
              b.join();
              std::cout << items.load() << " " << calls.load() << "\\n";
            }
          `),
          '10 2',
          'The slices hold 3 and 7 indices, and each worker touches calls once.',
        ),
        typeOutput(
          'The two slices overlap. What is printed?',
          cpp(`
            #include <atomic>
            #include <iostream>
            #include <thread>
            int main() {
              std::atomic<int> total{0};
              auto add_slice = [&total](int begin, int end) {
                int local = 0;
                for (int i = begin; i < end; ++i) local += i;
                total.fetch_add(local, std::memory_order_relaxed);
              };
              std::thread a([&add_slice] { add_slice(0, 5); });
              std::thread b([&add_slice] { add_slice(4, 9); });
              a.join();
              b.join();
              std::cout << total.load() << "\\n";
            }
          `),
          '40',
          'Index 4 is in both slices, so it is counted twice: 10 + 30 = 40 instead of 36.',
        ),
        choose(
          'Compared with calling fetch_add for every element, what does accumulating into local and adding once change?',
          [
            'The final total',
            'Whether there is a data race on local',
            'How often the shared atomic is touched',
            'The order in which the workers finish',
          ],
          2,
          'local is private to its worker, so only the single fetch_add touches shared state.',
        ),
        choose(
          'Worker A handles indices [0, 50) and worker B handles [50, 100). Which statement is true?',
          [
            'Index 50 is counted twice, once by each worker',
            'Index 50 is skipped',
            'Index 100 is counted by B as its last element',
            'Every index from 0 to 99 is counted exactly once',
          ],
          3,
          'Half-open ranges that share an endpoint partition the indices with no gap and no overlap.',
        ),
      ],
    },
  ],
};

const ordering: KnowledgePointModule = {
  'cpp-release-acquire': [
    {
      title: 'A release store and an acquire load publish data',
      explanation: [
        'A writer prepares plain data and then stores a flag with std::memory_order_release. A reader that loads the flag with std::memory_order_acquire and sees the value that store wrote synchronizes with the writer: every write the writer made before the release store is visible to the reader after its acquire load.',
        'So the reader waits until it observes the flag, for example `while (ready.load(std::memory_order_acquire) == 0) std::this_thread::yield();`, and only then reads the payload, which can stay a plain variable.',
      ],
      example: {
        language: 'cpp',
        code: cpp(`
          #include <atomic>
          #include <iostream>
          #include <thread>
          int main() {
            int payload = 0;
            std::atomic<int> ready{0};
            std::thread producer([&payload, &ready] {
              payload = 17;
              ready.store(1, std::memory_order_release);
            });
            while (ready.load(std::memory_order_acquire) == 0) std::this_thread::yield();
            int seen = payload;
            producer.join();
            std::cout << seen << "\\n";
          }
        `),
        output: '17',
        explanation:
          'main’s acquire load eventually reads the 1 written by the release store, so the earlier write of 17 is visible when main reads payload.',
      },
      questions: [
        typeOutput(
          'The writer fills two plain fields before releasing the flag. What is printed?',
          cpp(`
            #include <atomic>
            #include <iostream>
            #include <thread>
            int main() {
              int price = 0;
              int size = 0;
              std::atomic<int> ready{0};
              std::thread writer([&] {
                price = 101;
                size = 5;
                ready.store(1, std::memory_order_release);
              });
              while (ready.load(std::memory_order_acquire) == 0) std::this_thread::yield();
              int notional = price * size;
              writer.join();
              std::cout << notional << "\\n";
            }
          `),
          '505',
          'Both field writes come before the release store, so the acquiring reader sees both.',
        ),
        choose(
          'Which pair of orderings lets a reader safely read a plain payload after it sees the flag?',
          [
            'release store, acquire load',
            'relaxed store, relaxed load',
            'acquire store, release load',
            'release store, relaxed load',
          ],
          0,
          'The release store and an acquire load that reads its value form the synchronizes-with edge.',
        ),
        choose(
          'A reader acquires the flag and sees 1. What does it know about payload?',
          [
            'payload is 9',
            'payload is still 0',
            'Nothing: that write comes after the release, so reading payload races',
            'payload is 9, because acquire waits for all of the writer’s writes',
          ],
          2,
          'Only writes before the release store are published by it.',
          cpp(`
            // writer
            ready.store(1, std::memory_order_release);
            payload = 9;
          `),
        ),
        typeOutput(
          'The reader waits for version 2. What is printed?',
          cpp(`
            #include <atomic>
            #include <iostream>
            #include <thread>
            int main() {
              int data = 0;
              std::atomic<int> version{0};
              std::thread writer([&data, &version] {
                data = 6 * 7;
                version.store(2, std::memory_order_release);
              });
              while (version.load(std::memory_order_acquire) != 2) std::this_thread::yield();
              int seen = data;
              writer.join();
              std::cout << seen << " " << version.load() << "\\n";
            }
          `),
          '42 2',
          'Seeing 2 means the release store was read, so data’s value 42 is visible.',
        ),
      ],
    },
    {
      title: 'The acquire must read the released value',
      explanation: [
        'The guarantee is tied to values: an acquire load synchronizes with a release store only if it reads the value that store wrote. A reader that loads the flag before the writer stores it sees the old value and learns nothing about the payload.',
        'That is why the reader checks the flag’s value before touching the payload. Loading with acquire but ignoring the result, and then reading the payload anyway, is still a data race. A writer can also publish in stages; a reader that has seen stage 1 may rely only on what was written before stage 1 was released.',
      ],
      example: {
        language: 'cpp',
        code: cpp(`
          #include <atomic>
          #include <iostream>
          #include <thread>
          int main() {
            int first = 0;
            int second = 0;
            std::atomic<int> stage{0};
            std::thread writer([&first, &second, &stage] {
              first = 10;
              stage.store(1, std::memory_order_release);
              second = 20;
              stage.store(2, std::memory_order_release);
            });
            while (stage.load(std::memory_order_acquire) != 2) std::this_thread::yield();
            int total = first + second;
            writer.join();
            std::cout << total << "\\n";
          }
        `),
        output: '30',
        explanation:
          'Waiting for 2 covers both writes. A reader that stopped at stage 1 could rely on first only; reading second would race.',
      },
      questions: [
        choose(
          'The reader never checks flag before reading payload. Is the read of payload safe?',
          [
            'Yes, the acquire load synchronized with the writer when it ran',
            'Yes, as long as payload is an int',
            'No: only an acquire that reads the released value orders the payload',
            'No, because an acquire load cannot be saved in a variable',
          ],
          2,
          'Synchronization only happens if the acquire actually reads the release store’s value.',
          cpp(`
            // reader
            int flag = ready.load(std::memory_order_acquire);
            int value = payload;
          `),
        ),
        choose(
          'With the staged writer from the example, a reader waits until stage is at least 1 and then reads first and second. Which read is safe?',
          ['Both', 'Neither', 'Only second', 'Only first'],
          3,
          'Stage 1 was released after first was written but before second was.',
        ),
        typeOutput(
          'The reader keeps loading until it sees a nonzero value. What is printed?',
          cpp(`
            #include <atomic>
            #include <iostream>
            #include <thread>
            int main() {
              int table = 0;
              std::atomic<int> published{0};
              std::thread writer([&table, &published] {
                table = 300;
                published.store(table / 100, std::memory_order_release);
              });
              int seen = 0;
              while (seen == 0) seen = published.load(std::memory_order_acquire);
              int result = table + seen;
              writer.join();
              std::cout << result << "\\n";
            }
          `),
          '303',
          'The loop ends only after reading the released 3, which makes table’s 300 visible.',
        ),
        choose(
          'An acquire load returns 0, the value the flag had before the writer’s release store. What does the reader know about the payload?',
          [
            'That it has been written',
            'That it is still 0',
            'That the writer has already finished its work',
            'Nothing yet; it must not read the payload',
          ],
          3,
          'Reading the old value creates no synchronization with the writer.',
        ),
      ],
    },
  ],
  'cpp-seq-cst': [
    {
      title: 'Default atomic operations are sequentially consistent',
      explanation: [
        'Atomic operations without an explicit order use std::memory_order_seq_cst. A seq_cst store also acts as a release and a seq_cst load as an acquire; in addition, all seq_cst operations on all atomics fit into one global order that every thread agrees on.',
        'That single order rules out outcomes that release and acquire alone allow. In the store-buffer pattern each thread stores to one flag and then loads the other; with seq_cst, at least one of the two loads must see the other thread’s store.',
      ],
      example: {
        language: 'cpp',
        code: cpp(`
          #include <atomic>
          #include <iostream>
          #include <thread>
          int main() {
            std::atomic<int> x{0};
            std::atomic<int> y{0};
            int r1 = 0;
            int r2 = 0;
            std::thread a([&] {
              x.store(1);
              r1 = y.load();
            });
            std::thread b([&] {
              y.store(1);
              r2 = x.load();
            });
            a.join();
            b.join();
            std::cout << (r1 + r2 >= 1) << "\\n";
          }
        `),
        output: '1',
        explanation:
          'In the single total order, one of the two stores comes first, so the other thread’s later load sees it: r1 and r2 cannot both be 0.',
      },
      questions: [
        predictOutput(
          'Every operation is seq_cst. Can both loads read 0?',
          cpp(`
            #include <atomic>
            #include <iostream>
            #include <thread>
            int main() {
              std::atomic<int> x{0};
              std::atomic<int> y{0};
              int r1 = 0;
              int r2 = 0;
              std::thread a([&] {
                x.store(1, std::memory_order_seq_cst);
                r1 = y.load(std::memory_order_seq_cst);
              });
              std::thread b([&] {
                y.store(1, std::memory_order_seq_cst);
                r2 = x.load(std::memory_order_seq_cst);
              });
              a.join();
              b.join();
              std::cout << (r1 == 0 && r2 == 0) << "\\n";
            }
          `),
          ['1', '0', '0 or 1', 'Undefined'],
          1,
          'The total order of seq_cst operations forbids both loads missing both stores, so the expression is always false.',
        ),
        choose(
          'Which store-buffer outcome becomes possible if the stores use release and the loads use acquire instead of seq_cst?',
          [
            'r1 == 1 and r2 == 1',
            'r1 == 1 and r2 == 0',
            'None; the outcomes are identical',
            'r1 == 0 and r2 == 0',
          ],
          3,
          'Release and acquire do not order a store before a later load of a different atomic, so both loads may miss.',
        ),
        choose(
          'Which statement about memory_order_seq_cst is correct?',
          [
            'It makes racing accesses to nearby plain variables safe as well',
            'All seq_cst operations fit one order that every thread agrees on',
            'It lets the compiler skip atomicity for speed',
            'It is weaker than acquire for loads',
          ],
          1,
          'seq_cst adds a single total order on top of acquire/release semantics.',
        ),
        typeOutput(
          'The flag uses default operations. What is printed?',
          cpp(`
            #include <atomic>
            #include <iostream>
            #include <thread>
            int main() {
              int payload = 0;
              std::atomic<int> ready{0};
              std::thread w([&payload, &ready] {
                payload = 8;
                ready.store(1);
              });
              while (ready.load() == 0) std::this_thread::yield();
              int seen = payload;
              w.join();
              std::cout << seen << "\\n";
            }
          `),
          '8',
          'Default stores and loads are seq_cst, which includes release and acquire, so payload is published.',
        ),
      ],
    },
    {
      title: 'seq_cst orders atomics, not racing plain variables',
      explanation: [
        'seq_cst is the strongest ordering, but it applies to atomic operations. Two threads that update the same plain variable without other synchronization still have a data race, even if each also performs seq_cst atomic operations nearby.',
        'A seq_cst counter therefore cannot replace a mutex for other shared data. Plain data is safe only when every conflicting pair of accesses is ordered by a join, a lock, or a store and load that publish it.',
      ],
      example: {
        language: 'cpp',
        code: cpp(`
          #include <atomic>
          #include <iostream>
          #include <thread>
          int main() {
            std::atomic<int> started{0};
            int a_out = 0;
            int b_out = 0;
            std::thread a([&started, &a_out] {
              started.fetch_add(1);
              a_out = 5;
            });
            std::thread b([&started, &b_out] {
              started.fetch_add(1);
              b_out = 6;
            });
            a.join();
            b.join();
            std::cout << started.load() << " " << a_out * b_out << "\\n";
          }
        `),
        output: '2 30',
        explanation:
          'The seq_cst counter is exact; the plain outputs are safe because each has one writer and is read after the joins.',
      },
      questions: [
        choose(
          'Two threads each run `counter.fetch_add(1); total = total + 1;` where counter is an atomic and total a plain int. Which statement is true?',
          [
            'total ends at 2, because fetch_add is seq_cst and orders everything',
            'Both total and counter may end at 1',
            'The updates to total race; only counter is guaranteed to reach 2',
            'The program does not compile',
          ],
          2,
          'seq_cst orders the atomic operations, but the plain updates to total are still unsynchronized.',
        ),
        choose(
          'A team replaces the mutex around a shared std::string with a seq_cst atomic counter incremented before each access. What changes?',
          [
            'Nothing is lost; seq_cst orders the string accesses too',
            'The string accesses race: the counter does not keep threads apart',
            'The string becomes atomic',
            'The string accesses now run one at a time, in counter order',
          ],
          1,
          'Incrementing a counter does not exclude other threads from the string the way a lock does.',
        ),
        typeOutput(
          'Each worker records the value fetch_add returned. What is printed?',
          cpp(`
            #include <atomic>
            #include <iostream>
            #include <thread>
            int main() {
              std::atomic<int> next{0};
              int a = 0;
              int b = 0;
              int c = 0;
              std::thread ta([&next, &a] { a = next.fetch_add(1); });
              std::thread tb([&next, &b] { b = next.fetch_add(1); });
              std::thread tc([&next, &c] { c = next.fetch_add(1); });
              ta.join();
              tb.join();
              tc.join();
              std::cout << a + b + c << " " << next.load() << "\\n";
            }
          `),
          '3 3',
          'The three workers receive 0, 1 and 2 in some order, so the sum is 3 and next ends at 3.',
        ),
        choose(
          'When is memory_order_relaxed enough instead of the default seq_cst?',
          [
            'When it only counts something and no other data depends on it',
            'Whenever the atomic is an int',
            'When the atomic announces to readers that a filled buffer is ready',
            'Never, because relaxed loses increments',
          ],
          0,
          'If no other data is published through the atomic, its own atomicity is all that is needed.',
        ),
      ],
    },
  ],
  'cpp-memory-ordering': [
    {
      title: 'Retry compare_exchange_weak in a loop',
      explanation: [
        'compare_exchange_weak behaves like compare_exchange_strong but may fail even when the values are equal (a spurious failure). That is harmless inside a loop, which is where it is meant to be used: `while (!x.compare_exchange_weak(expected, desired)) {}` keeps trying until the exchange succeeds.',
        'Each failure stores the current value in expected, so the next attempt compares against fresh data. Writing desired as an expression of expected, such as `expected + 3`, recomputes it on every attempt.',
      ],
      example: {
        language: 'cpp',
        code: cpp(`
          #include <atomic>
          #include <iostream>
          int main() {
            std::atomic<int> counter{4};
            int expected = counter.load();
            while (!counter.compare_exchange_weak(expected, expected + 3)) {
            }
            std::cout << counter.load() << "\\n";
          }
        `),
        output: '7',
        explanation:
          'Any spurious failure just repeats the attempt; the successful exchange replaces 4 with 4 + 3.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          cpp(`
            #include <atomic>
            #include <iostream>
            int main() {
              std::atomic<int> v{6};
              int expected = v.load();
              while (!v.compare_exchange_weak(expected, expected * 2)) {
              }
              std::cout << v.load() << " " << expected << "\\n";
            }
          `),
          '12 6',
          'The successful exchange stores 12 and leaves expected at the value it matched, 6.',
        ),
        typeOutput(
          'The loop starts from a stale guess. What is printed?',
          cpp(`
            #include <atomic>
            #include <iostream>
            int main() {
              std::atomic<int> v{10};
              int expected = 0;
              while (!v.compare_exchange_weak(expected, expected + 1)) {
              }
              std::cout << v.load() << "\\n";
            }
          `),
          '11',
          'The first attempt fails and refreshes expected to 10; the retry stores 10 + 1.',
        ),
        choose(
          'Why is compare_exchange_weak normally used in a loop?',
          [
            'It always fails on the first try and succeeds on the second',
            'It does not update expected when it fails',
            'It can fail spuriously even when the value matches',
            'It succeeds only with memory_order_relaxed',
          ],
          2,
          'Spurious failures are allowed for weak, so a single call is not a reliable answer.',
        ),
        choose(
          'When is compare_exchange_strong the better choice?',
          [
            'For one attempt whose failure means something, with no loop',
            'Inside a retry loop that recomputes desired on every attempt',
            'Never; weak is always better',
            'When expected is a constant',
          ],
          0,
          'strong fails only when the value really differs, which a one-shot claim or check needs.',
        ),
      ],
    },
    {
      title: 'Recompute desired from expected on every attempt',
      explanation: [
        'In a retry loop, desired must be derived from the refreshed expected each time around. Then concurrent updates by other threads are never lost: every successful exchange applies its change to the value it actually replaced.',
        'Computing desired once, before the loop, from an earlier read means a later success writes a value based on stale state and silently undoes the other threads’ updates.',
      ],
      example: {
        language: 'cpp',
        code: cpp(`
          #include <atomic>
          #include <iostream>
          #include <thread>
          int main() {
            std::atomic<int> total{0};
            auto add = [&total](int amount) {
              int expected = total.load();
              while (!total.compare_exchange_weak(expected, expected + amount)) {
              }
            };
            std::thread a([&add] {
              int i = 0;
              while (i < 500) {
                add(2);
                ++i;
              }
            });
            std::thread b([&add] {
              int i = 0;
              while (i < 500) {
                add(3);
                ++i;
              }
            });
            a.join();
            b.join();
            std::cout << total.load() << "\\n";
          }
        `),
        output: '2500',
        explanation:
          'Whenever the other thread changes total first, the exchange fails, expected is refreshed and the sum is recomputed, so all 1000 additions land: 1000 + 1500.',
      },
      questions: [
        choose(
          'Two threads run this at once. What can go wrong?',
          [
            'Nothing, because the loop keeps retrying until the exchange succeeds',
            'The loop can never succeed',
            'A retry can store a sum computed from a stale value, losing an addition',
            'It deadlocks',
          ],
          2,
          'desired is fixed before the loop; after expected is refreshed the exchange can succeed with an outdated sum.',
          cpp(`
            int expected = total.load();
            int desired = expected + amount;
            while (!total.compare_exchange_weak(expected, desired)) {
            }
          `),
        ),
        typeOutput(
          'desired is computed before the loop from a stale guess. What is printed?',
          cpp(`
            #include <atomic>
            #include <iostream>
            int main() {
              std::atomic<int> v{5};
              int expected = 3;
              int desired = expected + 10;
              while (!v.compare_exchange_weak(expected, desired)) {
              }
              std::cout << v.load() << "\\n";
            }
          `),
          '13',
          'The retry matches the refreshed 5 but stores the stale 13 instead of the intended 5 + 10.',
        ),
        typeOutput(
          'raise_to keeps the highest value seen. What is printed?',
          cpp(`
            #include <atomic>
            #include <iostream>
            int main() {
              std::atomic<int> high{40};
              auto raise_to = [&high](int candidate) {
                int expected = high.load();
                while (expected < candidate && !high.compare_exchange_weak(expected, candidate)) {
                }
              };
              raise_to(30);
              int after_low = high.load();
              raise_to(55);
              std::cout << after_low << " " << high.load() << "\\n";
            }
          `),
          '40 55',
          '30 is not above 40, so the loop stops without exchanging; 55 is higher and replaces 40.',
        ),
        typeOutput(
          'Three threads each add 1 ten times through a retry loop. What is printed?',
          cpp(`
            #include <atomic>
            #include <iostream>
            #include <thread>
            int main() {
              std::atomic<int> total{0};
              auto work = [&total] {
                int i = 0;
                while (i < 10) {
                  int expected = total.load();
                  while (!total.compare_exchange_weak(expected, expected + 1)) {
                  }
                  ++i;
                }
              };
              std::thread a(work);
              std::thread b(work);
              std::thread c(work);
              a.join();
              b.join();
              c.join();
              std::cout << total.load() << "\\n";
            }
          `),
          '30',
          'Each successful exchange adds 1 to the current value, so all 30 additions land.',
        ),
      ],
    },
  ],
};

const futures: KnowledgePointModule = {
  'cpp-async-result': [
    {
      title: 'std::async returns a future; get() waits for the result',
      explanation: [
        'std::async (in <future>) runs a callable and returns a std::future<T>, a handle to the value the callable will produce. Calling get() on the future waits until the result is ready and returns it.',
        'Arguments after the callable are passed to it, as with std::thread. The programs here use standard function objects from <functional>, such as std::multiplies<int>{}, which returns its two arguments multiplied; a lambda that returns a value works the same way.',
      ],
      example: {
        language: 'cpp',
        code: cpp(`
          #include <functional>
          #include <future>
          #include <iostream>
          int main() {
            std::future<int> product = std::async(std::launch::async, std::multiplies<int>{}, 6, 7);
            std::cout << product.get() << "\\n";
          }
        `),
        output: '42',
        explanation:
          'The task multiplies 6 by 7 on another thread; get() waits for it and returns 42.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          cpp(`
            #include <functional>
            #include <future>
            #include <iostream>
            int main() {
              std::future<int> sum = std::async(std::launch::async, std::plus<int>{}, 40, 2);
              std::future<int> diff = std::async(std::launch::async, std::minus<int>{}, 40, 2);
              std::cout << sum.get() << " " << diff.get() << "\\n";
            }
          `),
          '42 38',
          'Each future holds its own task’s result: 40 + 2 and 40 - 2.',
        ),
        choose(
          'What type is task, and what does result hold?',
          [
            'std::future<int>; 81',
            'int; 81',
            'std::thread; 9',
            'std::future<int>; 9',
          ],
          0,
          'std::async returns a future of the callable’s return type, and get() yields the returned 81.',
          cpp(`
            auto task = std::async(std::launch::async, [](int n) { return n * n; }, 9);
            int result = task.get();
          `),
        ),
        typeOutput(
          'The task returns nothing but writes through a reference. What is printed?',
          cpp(`
            #include <future>
            #include <iostream>
            int main() {
              int written = 0;
              std::future<void> done = std::async(std::launch::async, [&written] { written = 15; });
              done.get();
              std::cout << written << "\\n";
            }
          `),
          '15',
          'get() returns only after the task has finished, and its writes are visible afterwards.',
        ),
        choose(
          'What does future::get() do if the asynchronous call has not finished yet?',
          [
            'Returns a default value of 0',
            'Throws std::future_error, because the result is missing',
            'Blocks until the result is ready, then returns it',
            'Starts a second copy of the task',
          ],
          2,
          'get() waits for the shared state to become ready.',
        ),
      ],
    },
    {
      title: 'Choose the launch policy explicitly',
      explanation: [
        'std::launch::async runs the callable on a new thread right away. std::launch::deferred runs nothing until get() or wait() is called on the future, and then runs it on the calling thread. Calling std::async with no policy lets the implementation pick either, so it does not guarantee concurrency.',
        'A deferred task that is never waited on never runs at all.',
      ],
      example: {
        language: 'cpp',
        code: cpp(`
          #include <future>
          #include <iostream>
          int main() {
            int calls = 0;
            std::future<void> task = std::async(std::launch::deferred, [&calls] { calls += 1; });
            int before = calls;
            task.get();
            std::cout << before << " " << calls << "\\n";
          }
        `),
        output: '0 1',
        explanation:
          'A deferred task does not start at the std::async call; it runs inside get(), on main’s own thread.',
      },
      questions: [
        typeOutput(
          'The deferred future is destroyed without being waited on. What is printed?',
          cpp(`
            #include <future>
            #include <iostream>
            int main() {
              int runs = 0;
              {
                std::future<void> task = std::async(std::launch::deferred, [&runs] { runs += 5; });
              }
              std::cout << runs << "\\n";
            }
          `),
          '0',
          'Nobody called get() or wait(), so the deferred task never ran.',
        ),
        typeOutput(
          'Only one of two deferred tasks is waited on. What is printed?',
          cpp(`
            #include <future>
            #include <iostream>
            int main() {
              int a = 0;
              int b = 0;
              auto first = std::async(std::launch::deferred, [&a] { a = 3; });
              auto second = std::async(std::launch::deferred, [&b] { b = 4; });
              second.get();
              std::cout << a << " " << b << "\\n";
            }
          `),
          '0 4',
          'Deferred tasks run only when their own future is waited on, so only second has run.',
        ),
        choose(
          'Code calls `std::async(work)` with no launch policy and assumes work starts on another thread at once. Why is that wrong?',
          [
            'Without a policy, async always runs work immediately on the caller',
            'The implementation may defer work until get(), then run it on the caller',
            'Without a policy async never runs the work',
            'async without a policy throws',
          ],
          1,
          'The default policy is async | deferred, leaving the choice to the implementation.',
        ),
        choose(
          'Which policy guarantees the callable starts on a new thread without waiting for get()?',
          [
            'std::launch::deferred',
            'No policy',
            'std::launch::async | std::launch::deferred',
            'std::launch::async',
          ],
          3,
          'Only launch::async alone requires asynchronous execution.',
        ),
      ],
    },
  ],
  'cpp-promise-value': [
    {
      title: 'A promise sets the value its future receives',
      explanation: [
        'std::promise<T> is the writing end of a one-shot channel, and promise.get_future() returns the reading end, a std::future<T>. When some thread calls promise.set_value(v), the future becomes ready and its get() returns v.',
        'Unlike std::async, a promise lets any code decide when and where the result is produced, for example a worker thread that is handed the promise. Writes the worker made before set_value are visible to the thread whose get() returned.',
      ],
      example: {
        language: 'cpp',
        code: cpp(`
          #include <future>
          #include <iostream>
          #include <thread>
          int main() {
            std::promise<int> answer;
            std::future<int> result = answer.get_future();
            std::thread worker([&answer] { answer.set_value(6 * 7); });
            int value = result.get();
            worker.join();
            std::cout << value << "\\n";
          }
        `),
        output: '42',
        explanation:
          'main blocks in get() until the worker calls set_value(42) on the promise.',
      },
      questions: [
        typeOutput(
          'The worker writes a plain detail before fulfilling the promise. What is printed?',
          cpp(`
            #include <future>
            #include <iostream>
            #include <thread>
            int main() {
              int detail = 0;
              std::promise<int> done;
              std::future<int> status = done.get_future();
              std::thread worker([&detail, &done] {
                detail = 250;
                done.set_value(1);
              });
              int code = status.get();
              int seen = detail;
              worker.join();
              std::cout << code << " " << seen << "\\n";
            }
          `),
          '1 250',
          'set_value synchronizes with the get() that returns its value, so the earlier write of detail is visible.',
        ),
        typeOutput(
          'The quoter fulfills ask before bid. What is printed?',
          cpp(`
            #include <future>
            #include <iostream>
            #include <thread>
            int main() {
              std::promise<int> bid;
              std::promise<int> ask;
              std::future<int> bid_f = bid.get_future();
              std::future<int> ask_f = ask.get_future();
              std::thread quoter([&bid, &ask] {
                ask.set_value(103);
                bid.set_value(100);
              });
              int spread = ask_f.get() - bid_f.get();
              quoter.join();
              std::cout << spread << "\\n";
            }
          `),
          '3',
          'Each future receives its own promise’s value, whatever order they were set in: 103 - 100.',
        ),
        choose(
          'How does a thread obtain the value another thread passes to promise.set_value?',
          [
            'By reading the promise object directly',
            'By joining the thread that set it, which returns the value',
            'From the return value of set_value',
            'Through the future returned by get_future(), using get()',
          ],
          3,
          'The promise only writes; the associated future is how the value is read.',
        ),
        choose(
          'A future’s get() is called before any thread has called set_value on its promise. What happens?',
          [
            'get() returns 0',
            'get() blocks until set_value is called',
            'get() throws immediately',
            'get() returns the previous value',
          ],
          1,
          'get() waits for the shared state to become ready.',
        ),
      ],
    },
    {
      title: 'Fulfill each promise exactly once',
      explanation: [
        'A promise delivers one result. A second set_value on the same promise throws std::future_error (promise already satisfied), and a future’s get() may be called only once: afterwards the future no longer refers to the result.',
        'If a promise is destroyed without ever being fulfilled, its future does not wait forever; get() throws std::future_error reporting a broken promise. So results that come from different workers need one promise each.',
      ],
      example: {
        language: 'cpp',
        code: cpp(`
          #include <future>
          #include <iostream>
          #include <thread>
          int main() {
            std::promise<int> left;
            std::promise<int> right;
            std::future<int> left_f = left.get_future();
            std::future<int> right_f = right.get_future();
            std::thread a([&left] { left.set_value(20); });
            std::thread b([&right] { right.set_value(22); });
            int total = left_f.get() + right_f.get();
            a.join();
            b.join();
            std::cout << total << "\\n";
          }
        `),
        output: '42',
        explanation:
          'Each worker fulfills its own promise exactly once, and each future is read once.',
      },
      questions: [
        choose(
          'What happens when set_value is called a second time on the same promise?',
          [
            'The future’s value is replaced',
            'The second value is queued and delivered by a second get()',
            'std::future_error is thrown: the promise is already satisfied',
            'Nothing; the call is ignored',
          ],
          2,
          'A promise’s shared state can be made ready only once.',
        ),
        choose(
          'A promise is destroyed without set_value ever being called. What does get() on its future do?',
          [
            'Blocks forever, since no value will ever arrive',
            'Throws std::future_error reporting a broken promise',
            'Returns 0',
            'Returns the last value set on any promise',
          ],
          1,
          'Destroying an unsatisfied promise stores a broken_promise error in the shared state.',
        ),
        choose(
          'What is wrong with this code?',
          [
            'Nothing; both reads get the same value',
            'The second get() blocks until a second set_value arrives',
            'get() must be called on the promise instead',
            'A std::future can be read once; the second get() is invalid',
          ],
          3,
          'get() releases the shared state, so the future is no longer valid afterwards.',
          cpp(`
            std::future<int> f = p.get_future();
            p.set_value(4);
            int a = f.get();
            int b = f.get();
          `),
        ),
        typeOutput(
          'What does this program print?',
          cpp(`
            #include <future>
            #include <iostream>
            #include <thread>
            int main() {
              std::promise<int> rows;
              std::promise<int> cols;
              std::future<int> rows_f = rows.get_future();
              std::future<int> cols_f = cols.get_future();
              std::thread a([&rows] { rows.set_value(7); });
              std::thread b([&cols] { cols.set_value(5); });
              int cells = rows_f.get() * cols_f.get();
              a.join();
              b.join();
              std::cout << cells << "\\n";
            }
          `),
          '35',
          'Each future receives its own promise’s single value: 7 * 5.',
        ),
      ],
    },
  ],
  'cpp-future-exception': [
    {
      title: 'get() rethrows the task’s exception',
      explanation: [
        'If the callable run by std::async throws, the exception does not escape on the worker thread. It is stored in the future, and the call to get() rethrows it in the thread that asks for the result.',
        'So the try block belongs around get(), the point where the result, or the failure, is delivered.',
      ],
      example: {
        language: 'cpp',
        code: cpp(`
          #include <future>
          #include <iostream>
          #include <stdexcept>
          int main() {
            std::future<void> task = std::async(std::launch::async, [] {
              throw std::runtime_error("feed down");
            });
            try {
              task.get();
              std::cout << "ok\\n";
            } catch (const std::runtime_error& error) {
              std::cout << "caught " << error.what() << "\\n";
            }
          }
        `),
        output: 'caught feed down',
        explanation:
          'The task’s exception is stored in the future; get() rethrows it in main, where the handler catches it.',
      },
      questions: [
        typeOutput(
          'input is negative. What is printed?',
          cpp(`
            #include <future>
            #include <iostream>
            #include <stdexcept>
            int main() {
              int result = 0;
              int input = -4;
              auto task = std::async(std::launch::async, [&result, input] {
                if (input < 0) throw std::invalid_argument("negative");
                result = input * 2;
              });
              try {
                task.get();
                std::cout << result << "\\n";
              } catch (const std::invalid_argument& error) {
                std::cout << "rejected " << error.what() << "\\n";
              }
            }
          `),
          'rejected negative',
          'The task throws before assigning result; get() rethrows, and the handler prints its message.',
        ),
        typeOutput(
          'input is positive. What is printed?',
          cpp(`
            #include <future>
            #include <iostream>
            #include <stdexcept>
            int main() {
              int result = 0;
              int input = 5;
              auto task = std::async(std::launch::async, [&result, input] {
                if (input < 0) throw std::invalid_argument("negative");
                result = input * 2;
              });
              try {
                task.get();
                std::cout << result << "\\n";
              } catch (const std::invalid_argument& error) {
                std::cout << "rejected " << error.what() << "\\n";
              }
            }
          `),
          '10',
          'No exception is thrown; get() returns after the task has stored 10.',
        ),
        choose(
          'Where should the try block go to handle an exception thrown inside a std::async task?',
          [
            'Inside the task only; the caller can never see it',
            'Around the std::async call itself, where the task is started',
            'Nowhere; std::async terminates the program',
            'Around the call to get(), where the exception is rethrown',
          ],
          3,
          'The exception surfaces only when the result is requested.',
        ),
        choose(
          'A std::async task throws, and the caller never calls get(). What happens to the exception?',
          [
            'It terminates the program at once',
            'It stays stored in the future and is discarded with it',
            'It is rethrown in the caller when the future is destroyed',
            'It is printed to the console',
          ],
          1,
          'The stored exception is only rethrown by get(); destroying the future discards it.',
        ),
      ],
    },
    {
      title: 'A failed get() skips the rest of the try block',
      explanation: [
        'get() rethrows the stored exception object, so control jumps from get() straight to the matching catch handler, exactly as if the task had thrown in the caller. Statements after get() in the try block do not run, and any variable the task would have filled keeps its earlier value.',
        'A plain std::thread offers no such path: an exception that escapes a thread’s callable calls std::terminate. A future carries the failure back to whoever waits for the result.',
      ],
      example: {
        language: 'cpp',
        code: cpp(`
          #include <future>
          #include <iostream>
          #include <stdexcept>
          int main() {
            int steps = 0;
            auto task = std::async(std::launch::async, [] {
              throw std::invalid_argument("bad size");
            });
            try {
              steps += 1;
              task.get();
              steps += 10;
            } catch (const std::invalid_argument& error) {
              steps += 100;
            }
            std::cout << steps << "\\n";
          }
        `),
        output: '101',
        explanation:
          'steps += 1 runs, get() rethrows, steps += 10 is skipped and the handler adds 100.',
      },
      questions: [
        typeOutput(
          'This time the task does not throw. What is printed?',
          cpp(`
            #include <future>
            #include <iostream>
            #include <stdexcept>
            int main() {
              int steps = 0;
              bool fail = false;
              auto task = std::async(std::launch::async, [fail] {
                if (fail) throw std::invalid_argument("bad size");
              });
              try {
                steps += 1;
                task.get();
                steps += 10;
              } catch (const std::invalid_argument& error) {
                steps += 100;
              }
              std::cout << steps << "\\n";
            }
          `),
          '11',
          'get() returns normally, so the whole try block runs and the handler does not.',
        ),
        typeOutput(
          'The first task fails and the second succeeds. What is printed?',
          cpp(`
            #include <future>
            #include <iostream>
            #include <stdexcept>
            int main() {
              int total = 0;
              auto first = std::async(std::launch::async, [] { throw std::runtime_error("first"); });
              auto second = std::async(std::launch::async, [&total] { total += 5; });
              second.get();
              try {
                first.get();
                total += 100;
              } catch (const std::runtime_error& error) {
                total += 1000;
              }
              std::cout << total << "\\n";
            }
          `),
          '1005',
          'second adds 5; first.get() rethrows, so += 100 is skipped and the handler adds 1000.',
        ),
        choose(
          'An exception escapes the callable of a plain std::thread. What happens?',
          [
            'join() rethrows it in the joining thread',
            'std::terminate is called',
            'It is stored until the thread object is destroyed',
            'It is silently ignored',
          ],
          1,
          'std::thread has no channel for exceptions; an escaping exception terminates the program.',
        ),
        choose(
          'A task throws before it assigns `result`. After get() rethrows, what does result hold?',
          [
            'The value the task would have computed',
            'Zero, set by get()',
            'The value it held before the task ran',
            'Nothing readable until the future is destroyed',
          ],
          2,
          'The assignment never ran, so result keeps whatever value it had.',
        ),
      ],
    },
  ],
  'cpp-futures': [
    {
      title: 'shared_future lets several readers get the same result',
      explanation: [
        'A std::future can be read once. Calling share() on it gives a std::shared_future, which can be copied. Every copy refers to the same shared state, and get() may be called on each copy any number of times.',
        'After share() the original future is empty, so all reads go through the shared_future copies. Giving each thread its own copy is the usual pattern.',
      ],
      example: {
        language: 'cpp',
        code: cpp(`
          #include <future>
          #include <iostream>
          int main() {
            std::promise<int> source;
            std::shared_future<int> first = source.get_future().share();
            std::shared_future<int> second = first;
            source.set_value(4);
            std::cout << first.get() + second.get() + first.get() << "\\n";
          }
        `),
        output: '12',
        explanation:
          'Both copies see the same value 4, and get() may be repeated: 4 + 4 + 4.',
      },
      questions: [
        typeOutput(
          'Each consumer thread copies the shared_future. What is printed?',
          cpp(`
            #include <future>
            #include <iostream>
            #include <thread>
            int main() {
              std::promise<int> price;
              std::shared_future<int> ready = price.get_future().share();
              int a_out = 0;
              int b_out = 0;
              std::thread a([ready, &a_out] { a_out = ready.get() + 1; });
              std::thread b([ready, &b_out] { b_out = ready.get() * 2; });
              price.set_value(50);
              a.join();
              b.join();
              std::cout << a_out << " " << b_out << "\\n";
            }
          `),
          '51 100',
          'Both consumers wait for the same value 50 and compute 51 and 100.',
        ),
        choose(
          'Two threads must both read one result. Why is a plain std::future not enough?',
          [
            'A future cannot be passed to a thread',
            'A future’s get() may be called only once',
            'A future cannot hold an int',
            'A future’s get() does not wait',
          ],
          1,
          'The first get() consumes an ordinary future’s result.',
        ),
        choose(
          'What is wrong with this code?',
          [
            'Nothing; f and s both read the value',
            'share() copies the value into s, so it is s.get() that fails instead',
            'After share(), f no longer holds the result, so f.get() is invalid',
            's must be read before f',
          ],
          2,
          'share() moves the shared state out of f into the shared_future.',
          cpp(`
            std::future<int> f = p.get_future();
            std::shared_future<int> s = f.share();
            p.set_value(3);
            int x = f.get();
          `),
        ),
        typeOutput(
          'What does this program print?',
          cpp(`
            #include <future>
            #include <iostream>
            int main() {
              std::promise<int> p;
              std::shared_future<int> s = p.get_future().share();
              p.set_value(7);
              std::shared_future<int> t = s;
              std::cout << s.get() * t.get() << " " << s.get() << "\\n";
            }
          `),
          '49 7',
          'Every read of every copy returns 7, so the product is 49 and a third read still gives 7.',
        ),
      ],
    },
    {
      title: 'One promise can release many waiting threads',
      explanation: [
        'Because every copy of a shared_future waits on the same shared state, one set_value releases all waiting readers at once. A promise with a shared_future is a simple one-time start signal, or a broadcast of a single result.',
        'The promise is still fulfilled only once. Readers that need a stream of values need a queue with a condition variable instead.',
      ],
      example: {
        language: 'cpp',
        code: cpp(`
          #include <future>
          #include <iostream>
          #include <thread>
          int main() {
            std::promise<int> start;
            std::shared_future<int> go = start.get_future().share();
            int a_out = 0;
            int b_out = 0;
            int c_out = 0;
            std::thread a([go, &a_out] { a_out = go.get() + 1; });
            std::thread b([go, &b_out] { b_out = go.get() + 2; });
            std::thread c([go, &c_out] { c_out = go.get() + 3; });
            start.set_value(10);
            a.join();
            b.join();
            c.join();
            std::cout << a_out + b_out + c_out << "\\n";
          }
        `),
        output: '36',
        explanation:
          'All three workers wait on copies of one shared_future; the single set_value(10) releases all of them.',
      },
      questions: [
        typeOutput(
          'One promise broadcasts a limit to two workers. What is printed?',
          cpp(`
            #include <future>
            #include <iostream>
            #include <thread>
            int main() {
              std::promise<int> limit;
              std::shared_future<int> value = limit.get_future().share();
              int buy_cap = 0;
              int sell_cap = 0;
              std::thread buy([value, &buy_cap] { buy_cap = value.get() - 10; });
              std::thread sell([value, &sell_cap] { sell_cap = value.get() - 20; });
              limit.set_value(100);
              buy.join();
              sell.join();
              std::cout << buy_cap << " " << sell_cap << "\\n";
            }
          `),
          '90 80',
          'Both workers receive 100 from the same shared state.',
        ),
        choose(
          'A team wants to send a new price to waiting threads every second. Is a promise with a shared_future a good fit?',
          [
            'Yes, call set_value every second with the newest price',
            'Yes, as long as each thread copies the shared_future',
            'No, because shared_future cannot cross threads',
            'No: a promise is fulfilled once, so it sends one value',
          ],
          3,
          'A second set_value throws; a stream of values needs a queue.',
        ),
        choose(
          'Three threads hold copies of one shared_future. What does a single set_value on the promise do?',
          [
            'Wakes only the first thread that called get()',
            'Makes the result available to all three copies',
            'Must be repeated once per copy',
            'Throws, because there are several readers',
          ],
          1,
          'All copies share one state, which becomes ready once for everyone.',
        ),
        typeOutput(
          'A shared_future is made from a std::async result. What is printed?',
          cpp(`
            #include <functional>
            #include <future>
            #include <iostream>
            #include <thread>
            int main() {
              std::shared_future<int> base =
                  std::async(std::launch::async, std::multiplies<int>{}, 3, 4).share();
              int up = 0;
              int down = 0;
              std::thread a([base, &up] { up = base.get() + 1; });
              std::thread b([base, &down] { down = base.get() - 1; });
              a.join();
              b.join();
              std::cout << up + down << "\\n";
            }
          `),
          '24',
          'Both threads read the same 12, giving 13 and 11.',
        ),
      ],
    },
  ],
};

const memoryModels: KnowledgePointModule = {
  'cpp-page-offset': [
    {
      title: 'Split an address into page number and offset',
      explanation: [
        'Memory is managed in fixed-size pages. In a model with page size P, address A lies in page number A / P, at offset A % P from the start of that page, using unsigned integer division and remainder.',
        'The page size is an input to the model, not a constant of nature: 4096 bytes is common, but systems also use 16384-byte and larger pages. Keep it as a named value.',
      ],
      example: {
        language: 'cpp',
        code: cpp(`
          #include <cstddef>
          #include <iostream>
          int main() {
            std::size_t page_size = 256;
            std::size_t address = 1000;
            std::cout << address / page_size << " " << address % page_size << "\\n";
          }
        `),
        output: '3 232',
        explanation:
          'Three whole pages cover 768 bytes, so address 1000 is in page 3 at offset 1000 - 768 = 232.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          cpp(`
            #include <cstddef>
            #include <iostream>
            int main() {
              std::size_t page_size = 4096;
              std::size_t address = 8200;
              std::cout << address / page_size << " " << address % page_size << "\\n";
            }
          `),
          '2 8',
          'Two pages cover 8192 bytes, so the address is in page 2 at offset 8.',
        ),
        typeOutput(
          'The address sits exactly on a page boundary. What is printed?',
          cpp(`
            #include <cstddef>
            #include <iostream>
            int main() {
              std::size_t page_size = 256;
              std::size_t address = 512;
              std::cout << address / page_size << " " << address % page_size << "\\n";
            }
          `),
          '2 0',
          'An offset is always below the page size: 512 is the first byte of page 2, offset 0.',
        ),
        typeOutput(
          'The same address is split under two page sizes. What is printed?',
          cpp(`
            #include <cstddef>
            #include <iostream>
            int main() {
              std::size_t address = 3000;
              std::size_t large_page = 4096;
              std::size_t small_page = 1024;
              std::cout << address % large_page << " " << address % small_page << "\\n";
            }
          `),
          '3000 952',
          '3000 fits inside the first 4096-byte page; with 1024-byte pages it is 952 bytes into page 2.',
        ),
        choose(
          'Why should the page size be a named input rather than the literal 4096 repeated through the code?',
          [
            '4096 is the page size on every system, so the literal is always right',
            'Literals cannot be used with %',
            'Named values make % faster',
            'Page sizes differ between systems, so the model must state its own',
          ],
          3,
          'A model is only correct for the page size it assumes, and that assumption should be explicit.',
        ),
      ],
    },
    {
      title: 'Guard the page size and rebuild the address',
      explanation: [
        'Division or remainder by zero is undefined behavior, so a model that takes the page size as input must reject 0 before computing A / P or A % P.',
        'The split loses nothing: page * P + offset gives the original address back, and address - offset is the first byte of its page.',
      ],
      example: {
        language: 'cpp',
        code: cpp(`
          #include <cstddef>
          #include <iostream>
          int main() {
            std::size_t page_size = 0;
            std::size_t address = 70;
            if (page_size == 0) {
              std::cout << "invalid page size\\n";
            } else {
              std::cout << address % page_size << "\\n";
            }
          }
        `),
        output: 'invalid page size',
        explanation:
          'The check runs before any division, so a zero page size is reported instead of evaluating 70 % 0.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          cpp(`
            #include <cstddef>
            #include <iostream>
            int main() {
              std::size_t page_size = 100;
              std::size_t address = 1234;
              std::size_t page = address / page_size;
              std::size_t offset = address % page_size;
              std::cout << page << " " << offset << " " << page * page_size + offset << "\\n";
            }
          `),
          '12 34 1234',
          'Page 12 at offset 34; recombining 12 * 100 + 34 gives back 1234.',
        ),
        choose(
          'What does `address % page_size` do when page_size is 0?',
          [
            'Returns address',
            'Returns 0',
            'Throws std::domain_error',
            'It is undefined behavior',
          ],
          3,
          'Integer division and remainder by zero are undefined, so the divisor must be checked first.',
        ),
        typeOutput(
          'What does this program print?',
          cpp(`
            #include <cstddef>
            #include <iostream>
            int main() {
              std::size_t page_size = 64;
              std::size_t address = 130;
              if (page_size == 0) {
                std::cout << "invalid page size\\n";
              } else {
                std::cout << address % page_size << "\\n";
              }
            }
          `),
          '2',
          'The page size is valid, and 130 is 2 bytes past the start of page 2 (128).',
        ),
        typeOutput(
          'What does this program print?',
          cpp(`
            #include <cstddef>
            #include <iostream>
            int main() {
              std::size_t page_size = 256;
              std::size_t address = 777;
              std::size_t offset = address % page_size;
              std::cout << address - offset << " " << offset << "\\n";
            }
          `),
          '768 9',
          '777 is 9 bytes into the page that starts at 3 * 256 = 768.',
        ),
      ],
    },
  ],
  'cpp-page-translation': [
    {
      title: 'Look up the frame and keep the offset',
      explanation: [
        'A page table maps virtual page numbers to physical frame numbers. To translate an address, split it into page and offset, look up the page’s frame, and rebuild the address as frame * page_size + offset. The offset passes through unchanged.',
        'In this model the page table is a std::vector<int>: the index is the page number and the element is its frame number.',
      ],
      example: {
        language: 'cpp',
        code: cpp(`
          #include <cstddef>
          #include <iostream>
          #include <vector>
          int main() {
            constexpr std::size_t page_size = 256;
            std::vector<int> frames = {4, 9, 2};
            std::size_t address = 300;
            std::size_t page = address / page_size;
            std::size_t offset = address % page_size;
            std::size_t physical = static_cast<std::size_t>(frames[page]) * page_size + offset;
            std::cout << page << " " << offset << " " << physical << "\\n";
          }
        `),
        output: '1 44 2348',
        explanation:
          'Address 300 is page 1, offset 44. Page 1 maps to frame 9, so the physical address is 9 * 256 + 44.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          cpp(`
            #include <cstddef>
            #include <iostream>
            #include <vector>
            int main() {
              constexpr std::size_t page_size = 256;
              std::vector<int> frames = {7, 3, 5};
              std::size_t address = 600;
              std::size_t page = address / page_size;
              std::size_t offset = address % page_size;
              std::cout << static_cast<std::size_t>(frames[page]) * page_size + offset << "\\n";
            }
          `),
          '1368',
          '600 is page 2, offset 88; page 2 maps to frame 5, giving 5 * 256 + 88.',
        ),
        typeOutput(
          'What does this program print?',
          cpp(`
            #include <cstddef>
            #include <iostream>
            #include <vector>
            int main() {
              constexpr std::size_t page_size = 100;
              std::vector<int> frames = {6};
              std::size_t address = 10;
              std::size_t page = address / page_size;
              std::size_t offset = address % page_size;
              std::cout << static_cast<std::size_t>(frames[page]) * page_size + offset << "\\n";
            }
          `),
          '610',
          'Page 0 maps to frame 6, and the offset 10 is kept: 600 + 10.',
        ),
        choose(
          'Which part of a virtual address is copied unchanged into the physical address?',
          [
            'The page number',
            'Both the page number and the offset',
            'The offset within the page',
            'Neither; both are replaced by the frame',
          ],
          2,
          'Translation replaces the page number with a frame number and keeps the position within the page.',
        ),
        typeOutput(
          'What does this program print?',
          cpp(`
            #include <cstddef>
            #include <iostream>
            #include <vector>
            int main() {
              constexpr std::size_t page_size = 1024;
              std::vector<int> frames = {1, 0, 3};
              std::size_t address = 2050;
              std::size_t page = address / page_size;
              std::size_t offset = address % page_size;
              std::cout << static_cast<std::size_t>(frames[page]) * page_size + offset << "\\n";
            }
          `),
          '3074',
          '2050 is page 2, offset 2; page 2 maps to frame 3: 3072 + 2.',
        ),
      ],
    },
    {
      title: 'Reject pages the table does not map',
      explanation: [
        'A page number at or beyond frames.size() has no entry, and reading frames[page] there is undefined behavior; operator[] does not check. A table may also mark a page as unmapped, here with a negative frame number. Both cases must be checked before the frame is used.',
        'Report such an address as a fault instead of computing a physical address from whatever memory happens to be there.',
      ],
      example: {
        language: 'cpp',
        code: cpp(`
          #include <cstddef>
          #include <iostream>
          #include <vector>
          int main() {
            constexpr std::size_t page_size = 100;
            std::vector<int> frames = {5, -1};
            std::size_t address = 150;
            std::size_t page = address / page_size;
            if (page >= frames.size()) {
              std::cout << "fault: no entry\\n";
            } else if (frames[page] < 0) {
              std::cout << "fault: unmapped\\n";
            } else {
              std::cout << static_cast<std::size_t>(frames[page]) * page_size + address % page_size << "\\n";
            }
          }
        `),
        output: 'fault: unmapped',
        explanation:
          'Page 1 exists in the table, but its frame is -1, so the translation reports a fault.',
      },
      questions: [
        typeOutput(
          'With the same table, address 250 is translated. What is printed?',
          cpp(`
            #include <cstddef>
            #include <iostream>
            #include <vector>
            int main() {
              constexpr std::size_t page_size = 100;
              std::vector<int> frames = {5, -1};
              std::size_t address = 250;
              std::size_t page = address / page_size;
              if (page >= frames.size()) {
                std::cout << "fault: no entry\\n";
              } else if (frames[page] < 0) {
                std::cout << "fault: unmapped\\n";
              } else {
                std::cout << static_cast<std::size_t>(frames[page]) * page_size + address % page_size << "\\n";
              }
            }
          `),
          'fault: no entry',
          'Page 2 is past the end of a two-entry table, so the first check reports it before frames[2] is read.',
        ),
        typeOutput(
          'Address 40 is translated with the same table. What is printed?',
          cpp(`
            #include <cstddef>
            #include <iostream>
            #include <vector>
            int main() {
              constexpr std::size_t page_size = 100;
              std::vector<int> frames = {5, -1};
              std::size_t address = 40;
              std::size_t page = address / page_size;
              if (page >= frames.size()) {
                std::cout << "fault: no entry\\n";
              } else if (frames[page] < 0) {
                std::cout << "fault: unmapped\\n";
              } else {
                std::cout << static_cast<std::size_t>(frames[page]) * page_size + address % page_size << "\\n";
              }
            }
          `),
          '540',
          'Page 0 maps to frame 5, so the address becomes 500 + 40.',
        ),
        typeOutput(
          'Address 199 is translated with the same table. What is printed?',
          cpp(`
            #include <cstddef>
            #include <iostream>
            #include <vector>
            int main() {
              constexpr std::size_t page_size = 100;
              std::vector<int> frames = {5, -1};
              std::size_t address = 199;
              std::size_t page = address / page_size;
              if (page >= frames.size()) {
                std::cout << "fault: no entry\\n";
              } else if (frames[page] < 0) {
                std::cout << "fault: unmapped\\n";
              } else {
                std::cout << static_cast<std::size_t>(frames[page]) * page_size + address % page_size << "\\n";
              }
            }
          `),
          'fault: unmapped',
          '199 is the last byte of page 1, which has an entry marked unmapped.',
        ),
        choose(
          'Why must `page < frames.size()` be checked before reading frames[page]?',
          [
            'frames[page] throws std::out_of_range when page is too large',
            'Reading past the end of the vector is undefined behavior',
            'The check makes translation faster',
            'Pages beyond the table map to frame 0',
          ],
          1,
          'operator[] performs no bounds check, so an out-of-range index reads memory that is not an element.',
        ),
      ],
    },
  ],
  'cpp-aligned-size': [
    {
      title: 'Round a size up to the next multiple of the alignment',
      explanation: [
        'Allocators often hand out sizes that are multiples of an alignment A. To round a byte count n up: if n % A is 0, n is already aligned; otherwise add A - n % A. Rounding must go up, never down, or the block would be smaller than requested.',
        'For n = 13 and A = 8 the remainder is 5, so 3 bytes are added and the result is 16.',
      ],
      example: {
        language: 'cpp',
        code: cpp(`
          #include <cstddef>
          #include <iostream>
          int main() {
            std::size_t bytes = 13;
            std::size_t alignment = 8;
            std::size_t remainder = bytes % alignment;
            std::size_t rounded = bytes;
            if (remainder != 0) rounded = bytes + (alignment - remainder);
            std::cout << rounded << "\\n";
          }
        `),
        output: '16',
        explanation:
          '13 leaves remainder 5, so 8 - 5 = 3 bytes of padding make it 16.',
      },
      questions: [
        typeOutput(
          'The size is already a multiple. What is printed?',
          cpp(`
            #include <cstddef>
            #include <iostream>
            int main() {
              std::size_t bytes = 16;
              std::size_t alignment = 8;
              std::size_t remainder = bytes % alignment;
              std::size_t rounded = bytes;
              if (remainder != 0) rounded = bytes + (alignment - remainder);
              std::cout << rounded << "\\n";
            }
          `),
          '16',
          'The remainder is 0, so no padding is added.',
        ),
        typeOutput(
          'What does this program print?',
          cpp(`
            #include <cstddef>
            #include <iostream>
            int main() {
              std::size_t bytes = 33;
              std::size_t alignment = 16;
              std::size_t remainder = bytes % alignment;
              std::size_t rounded = bytes;
              if (remainder != 0) rounded = bytes + (alignment - remainder);
              std::cout << rounded << "\\n";
            }
          `),
          '48',
          '33 leaves remainder 1, so 15 bytes are added to reach 48.',
        ),
        typeOutput(
          'A zero-byte request is rounded. What is printed?',
          cpp(`
            #include <cstddef>
            #include <iostream>
            int main() {
              std::size_t bytes = 0;
              std::size_t alignment = 4;
              std::size_t remainder = bytes % alignment;
              std::size_t rounded = bytes;
              if (remainder != 0) rounded = bytes + (alignment - remainder);
              std::cout << rounded << "\\n";
            }
          `),
          '0',
          '0 is a multiple of every positive alignment, so it stays 0.',
        ),
        choose(
          'A programmer rounds with `bytes / alignment * alignment`. What goes wrong for 13 bytes and alignment 8?',
          [
            'It gives 16, the next multiple of 8, which is correct',
            'It gives 8, smaller than the 13 bytes requested',
            'It gives 13 unchanged',
            'It divides by zero',
          ],
          1,
          'Integer division truncates, so this rounds down and the block would be too small.',
        ),
      ],
    },
    {
      title: 'Check that rounding cannot wrap around',
      explanation: [
        'std::size_t arithmetic wraps around past its maximum. If bytes is close to that maximum, bytes + extra wraps to a tiny number, and an allocator would hand out a block far too small. Check `bytes > max - extra` before adding, using std::numeric_limits<std::size_t>::max() from <limits>.',
        'An alignment of 0 has no multiples and must be rejected before the remainder is computed.',
      ],
      example: {
        language: 'cpp',
        code: cpp(`
          #include <cstddef>
          #include <iostream>
          #include <limits>
          int main() {
            std::size_t max = std::numeric_limits<std::size_t>::max();
            std::size_t bytes = max - 2;
            std::size_t alignment = 8;
            std::size_t remainder = bytes % alignment;
            std::size_t extra = 0;
            if (remainder != 0) extra = alignment - remainder;
            if (bytes > max - extra) {
              std::cout << "too large\\n";
            } else {
              std::cout << bytes + extra << "\\n";
            }
          }
        `),
        output: 'too large',
        explanation:
          'max - 2 needs 3 bytes of padding, but only 2 values remain before the maximum, so the request is rejected instead of wrapping.',
      },
      questions: [
        typeOutput(
          'This version adds without checking. What is printed?',
          cpp(`
            #include <cstddef>
            #include <iostream>
            #include <limits>
            int main() {
              std::size_t bytes = std::numeric_limits<std::size_t>::max();
              std::size_t alignment = 2;
              std::size_t extra = alignment - bytes % alignment;
              std::size_t wrapped = bytes + extra;
              std::cout << wrapped << "\\n";
            }
          `),
          '0',
          'The maximum is odd, so extra is 1, and max + 1 wraps around to 0.',
        ),
        typeOutput(
          'What does this program print?',
          cpp(`
            #include <cstddef>
            #include <iostream>
            int main() {
              std::size_t bytes = 100;
              std::size_t alignment = 0;
              if (alignment == 0) {
                std::cout << "invalid alignment\\n";
              } else {
                std::size_t remainder = bytes % alignment;
                std::cout << remainder << "\\n";
              }
            }
          `),
          'invalid alignment',
          'The zero alignment is rejected before the remainder is computed, so no division by zero happens.',
        ),
        choose(
          'Why compare `bytes > max - extra` instead of computing bytes + extra and checking whether the sum is too big?',
          [
            'Signed overflow would throw an exception',
            'The comparison is faster to compute but gives the same answer',
            'Unsigned addition wraps, so a too-big sum can look small',
            'max - extra can overflow',
          ],
          2,
          'After wrapping, the sum carries no sign of the overflow; the subtraction form never wraps because extra <= max.',
        ),
        typeOutput(
          'What does this program print?',
          cpp(`
            #include <cstddef>
            #include <iostream>
            #include <limits>
            int main() {
              std::size_t max = std::numeric_limits<std::size_t>::max();
              std::size_t bytes = 100;
              std::size_t alignment = 64;
              std::size_t remainder = bytes % alignment;
              std::size_t extra = 0;
              if (remainder != 0) extra = alignment - remainder;
              if (bytes > max - extra) {
                std::cout << "too large\\n";
              } else {
                std::cout << bytes + extra << "\\n";
              }
            }
          `),
          '128',
          '100 needs 28 bytes of padding, which fits easily, so the result is 128.',
        ),
      ],
    },
  ],
  'cpp-addressing': [
    {
      title: 'A static local survives between calls',
      explanation: [
        'An ordinary local variable is created fresh every time its function runs. A local declared static is initialized once, the first time control passes its declaration, and keeps its value for the rest of the program.',
        'So a static counter inside a function or lambda counts across all calls, while an ordinary one starts over each time.',
      ],
      example: {
        language: 'cpp',
        code: cpp(`
          #include <iostream>
          int main() {
            auto call = [] {
              int fresh = 0;
              static int kept = 0;
              fresh += 1;
              kept += 1;
              std::cout << fresh << kept << " ";
            };
            call();
            call();
            call();
            std::cout << "\\n";
          }
        `),
        output: '11 12 13',
        explanation:
          'fresh is recreated as 0 on every call and always reaches 1; kept is initialized once and keeps counting.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          cpp(`
            #include <iostream>
            int main() {
              auto next_id = [] {
                static int id = 100;
                id += 1;
                std::cout << id << " ";
              };
              next_id();
              next_id();
              std::cout << "\\n";
            }
          `),
          '101 102',
          'id starts at 100 once and keeps each increment between calls.',
        ),
        typeOutput(
          'start changes between the two calls. What is printed?',
          cpp(`
            #include <iostream>
            int main() {
              int start = 5;
              auto report = [&start] {
                static int first_seen = start;
                std::cout << first_seen << " ";
              };
              report();
              start = 9;
              report();
              std::cout << "\\n";
            }
          `),
          '5 5',
          'The static initializer runs only on the first call, when start was 5.',
        ),
        choose(
          'A function declares `static int calls = 0;` and then increments calls. What value does the third call see just before incrementing?',
          ['0', '3', '2', 'An indeterminate value'],
          2,
          'The first two calls left calls at 2, and the initializer does not run again.',
        ),
        typeOutput(
          'Two lambdas each declare their own static. What is printed?',
          cpp(`
            #include <iostream>
            int main() {
              auto a = [] {
                static int n = 0;
                n += 1;
                std::cout << n << " ";
              };
              auto b = [] {
                static int n = 0;
                n += 10;
                std::cout << n << " ";
              };
              a();
              b();
              a();
              b();
              std::cout << "\\n";
            }
          `),
          '1 10 2 20',
          'Each lambda has its own static n, and each keeps its value between that lambda’s calls.',
        ),
      ],
    },
    {
      title: 'Hidden persistent state makes calls depend on history',
      explanation: [
        'Because a static local remembers earlier calls, the same call with the same arguments can give different results depending on what ran before. That is right for something meant to persist, such as an ID generator, but wrong for scratch work that each call should start from scratch.',
        'Per-call state belongs in ordinary locals or parameters; state that persists should be deliberate and visible.',
      ],
      example: {
        language: 'cpp',
        code: cpp(`
          #include <iostream>
          int main() {
            auto sum_pair = [](int a, int b, int& out) {
              static int scratch = 0;
              scratch += a;
              scratch += b;
              out = scratch;
            };
            int first = 0;
            int second = 0;
            sum_pair(2, 3, first);
            sum_pair(2, 3, second);
            std::cout << first << " " << second << "\\n";
          }
        `),
        output: '5 10',
        explanation:
          'The static scratch keeps 5 from the first call, so the identical second call reports 10.',
      },
      questions: [
        typeOutput(
          'scratch is now an ordinary local. What is printed?',
          cpp(`
            #include <iostream>
            int main() {
              auto sum_pair = [](int a, int b, int& out) {
                int scratch = 0;
                scratch += a;
                scratch += b;
                out = scratch;
              };
              int first = 0;
              int second = 0;
              sum_pair(2, 3, first);
              sum_pair(2, 3, second);
              std::cout << first << " " << second << "\\n";
            }
          `),
          '5 5',
          'An ordinary local starts at 0 on every call, so identical calls give identical results.',
        ),
        typeOutput(
          'What does this program print?',
          cpp(`
            #include <iostream>
            int main() {
              auto label = [](int& out) {
                static int calls = 0;
                calls += 1;
                out = calls * 100;
              };
              int a = 0;
              int b = 0;
              int c = 0;
              label(a);
              label(b);
              label(c);
              std::cout << a << " " << b << " " << c << "\\n";
            }
          `),
          '100 200 300',
          'Each call sees the count left by the previous calls, so the labels grow.',
        ),
        choose(
          'A test calls parse(line) twice with the same line and gets different results. Which cause fits?',
          [
            'parse keeps per-call scratch data in a static local',
            'parse uses an ordinary local variable for its scratch data',
            'parse takes line by value',
            'parse is called from main',
          ],
          0,
          'Only persistent state can make the same input produce different outputs.',
        ),
        choose(
          'Which variable should be a static local?',
          [
            'A running sum used only during one call',
            'A temporary buffer for formatting one message',
            'A counter handing out unique request IDs for the run',
            'The loop index of a search',
          ],
          2,
          'The ID counter must persist between calls; the others are per-call scratch state.',
        ),
      ],
    },
  ],
  'cpp-contiguous-traversal': [
    {
      title: 'Vector elements sit next to each other',
      explanation: [
        'A std::vector stores its elements contiguously: element i + 1 lives immediately after element i. v.data() returns a pointer to the first element, data() + i points at element i, and subtracting two element pointers gives the number of elements between them, not bytes.',
        'Visiting elements in index order touches memory in address order, the access pattern that caches and hardware prefetchers handle best.',
      ],
      example: {
        language: 'cpp',
        code: cpp(`
          #include <cstddef>
          #include <iostream>
          #include <vector>
          int main() {
            std::vector<int> v = {2, 3, 4};
            const int* p = v.data();
            int sum = 0;
            for (std::size_t i = 0; i < v.size(); ++i) sum += *(p + i);
            std::cout << sum << " " << p[2] << "\\n";
          }
        `),
        output: '9 4',
        explanation:
          'p + i walks the contiguous elements in order; p[2] is the same as *(p + 2), the third element.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          cpp(`
            #include <iostream>
            #include <vector>
            int main() {
              std::vector<int> v = {10, 20, 30, 40, 50};
              std::cout << &v[3] - &v[0] << "\\n";
            }
          `),
          '3',
          'Pointer subtraction counts elements: element 3 is three elements after element 0.',
        ),
        typeOutput(
          'What does this program print?',
          cpp(`
            #include <iostream>
            #include <vector>
            int main() {
              std::vector<int> v = {5, 1, 7, 3};
              const int* first = v.data();
              const int* last = v.data() + v.size();
              int count = 0;
              int total = 0;
              for (const int* p = first; p != last; ++p) {
                ++count;
                total += *p;
              }
              std::cout << count << " " << total << "\\n";
            }
          `),
          '4 16',
          'The loop stops at the one-past-the-end pointer after visiting all four elements.',
        ),
        choose(
          'Which statement about a std::vector<int> v with 5 elements is guaranteed?',
          [
            '&v[4] == v.data() + 4',
            'Each element is a separate heap allocation',
            'v.data() + 5 may be dereferenced',
            'The elements are stored in reverse order',
          ],
          0,
          'Contiguous storage means element i is at data() + i.',
        ),
        choose(
          'Why is summing a vector in index order usually faster than visiting the same elements in random order?',
          [
            'Random order changes the sum',
            'Index order lets the compiler skip all bounds checks on each access',
            'The compiler cannot add numbers out of order',
            'Sequential addresses fill whole cache lines and prefetch well',
          ],
          3,
          'Neighbouring elements arrive in the same cache line, and a predictable stride lets the hardware fetch ahead.',
        ),
      ],
    },
    {
      title: 'Pointer arithmetic stays inside one array',
      explanation: [
        'Pointer arithmetic is defined only within one array (a vector’s buffer counts) and the position one past its end. Stepping from one vector’s pointer into another vector, or into a separate variable, is undefined behavior, even if the objects happen to be adjacent in memory.',
        'The one-past-the-end pointer may be compared and used as a stop marker, but never dereferenced.',
      ],
      example: {
        language: 'cpp',
        code: cpp(`
          #include <iostream>
          #include <vector>
          int main() {
            std::vector<int> left = {1, 2};
            std::vector<int> right = {3, 4, 5};
            int total = 0;
            for (const int* p = left.data(); p != left.data() + left.size(); ++p) total += *p;
            for (const int* p = right.data(); p != right.data() + right.size(); ++p) total += *p;
            std::cout << total << "\\n";
          }
        `),
        output: '15',
        explanation:
          'Each vector is walked with its own begin and one-past-the-end pointers; no pointer crosses from one buffer into the other.',
      },
      questions: [
        choose(
          'left holds {1, 2}. What is wrong with this code?',
          [
            'p points at right[0], so total gains 3',
            'p is one past the end of left; dereferencing it is undefined',
            'p wraps around to left[0]',
            'Nothing; left.data() + 2 still points inside left’s storage',
          ],
          1,
          'left.data() + 2 is the one-past-the-end position: valid to form, invalid to read.',
          cpp(`
            const int* p = left.data() + 2;
            total += *p;
          `),
        ),
        choose(
          'Two vectors a and b happen to be adjacent in memory. Is `a.data() + a.size()` a valid way to reach b’s first element?',
          [
            'Yes, if the addresses match',
            'Yes, because vector storage is contiguous, so stepping across is fine',
            'No: a pointer into a may only stay within a and one past its end',
            'Only for vectors of int',
          ],
          2,
          'Contiguity holds within one vector; separate allocations are unrelated for pointer arithmetic.',
        ),
        typeOutput(
          'A pointer into the middle serves as the stop marker. What is printed?',
          cpp(`
            #include <iostream>
            #include <vector>
            int main() {
              std::vector<int> v = {9, 8, 7, 6, 5};
              const int* stop = v.data() + 3;
              int count = 0;
              for (const int* p = v.data(); p != stop; ++p) ++count;
              std::cout << count << " " << *(stop - 1) << "\\n";
            }
          `),
          '3 7',
          'The half-open range [data, data + 3) covers 9, 8 and 7; stop - 1 points at 7.',
        ),
        typeOutput(
          'What does this program print?',
          cpp(`
            #include <iostream>
            #include <vector>
            int main() {
              std::vector<int> v = {4, 6, 8, 10};
              int total = 0;
              for (const int* p = v.data() + 1; p != v.data() + 3; ++p) total += *p;
              std::cout << total << "\\n";
            }
          `),
          '14',
          'The pointers cover elements 1 and 2: 6 + 8.',
        ),
      ],
    },
  ],
  'cpp-cache-line-model': [
    {
      title: 'Count whole lines with ceiling division',
      explanation: [
        'Caches move memory in fixed-size lines. In a model where a range starts at the beginning of a line and lines are L bytes long, n bytes need ceil(n / L) lines. With unsigned integers: take n / L and add one line if n % L is not 0, or compute (n + L - 1) / L when that sum cannot overflow.',
        'A model like this counts lines touched; it says nothing about how long the accesses take.',
      ],
      example: {
        language: 'cpp',
        code: cpp(`
          #include <cstddef>
          #include <iostream>
          int main() {
            std::size_t bytes = 129;
            std::size_t line = 64;
            std::size_t lines = bytes / line;
            if (bytes % line != 0) lines += 1;
            std::cout << lines << "\\n";
          }
        `),
        output: '3',
        explanation:
          'Two full lines hold 128 bytes; the 129th byte needs a third line.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          cpp(`
            #include <cstddef>
            #include <iostream>
            int main() {
              std::size_t bytes = 128;
              std::size_t line = 64;
              std::size_t lines = bytes / line;
              if (bytes % line != 0) lines += 1;
              std::cout << lines << "\\n";
            }
          `),
          '2',
          '128 bytes fill exactly two lines, with no partial line left over.',
        ),
        typeOutput(
          'What does this program print?',
          cpp(`
            #include <cstddef>
            #include <iostream>
            int main() {
              std::size_t bytes = 1;
              std::size_t line = 64;
              std::size_t lines = bytes / line;
              if (bytes % line != 0) lines += 1;
              std::cout << lines << "\\n";
            }
          `),
          '1',
          'Even a single byte occupies a whole line.',
        ),
        typeOutput(
          'The rounding is written as one expression. What is printed?',
          cpp(`
            #include <cstddef>
            #include <iostream>
            int main() {
              std::size_t bytes = 200;
              std::size_t line = 64;
              std::cout << (bytes + line - 1) / line << "\\n";
            }
          `),
          '4',
          '(200 + 63) / 64 is 263 / 64, which truncates to 4: three full lines plus a partial one.',
        ),
        choose(
          'Why does `bytes / line` alone undercount?',
          [
            'Integer division drops the partial last line',
            'It overcounts by one line',
            'It divides by the wrong value',
            'It is already correct for every possible byte count',
          ],
          0,
          'The truncated quotient ignores the remainder bytes, which still need a line.',
        ),
      ],
    },
    {
      title: 'A range that starts mid-line can touch one more line',
      explanation: [
        'If a range does not start on a line boundary, count lines from the first and last byte instead: first = start / L, last = (start + n - 1) / L, and the range touches last - first + 1 lines (for n > 0). A 64-byte object that starts at offset 32 spans two 64-byte lines, not one.',
        'State both assumptions, the line size and the starting offset, whenever you quote a line count.',
      ],
      example: {
        language: 'cpp',
        code: cpp(`
          #include <cstddef>
          #include <iostream>
          int main() {
            std::size_t line = 64;
            std::size_t start = 32;
            std::size_t bytes = 64;
            std::size_t first = start / line;
            std::size_t last = (start + bytes - 1) / line;
            std::cout << last - first + 1 << "\\n";
          }
        `),
        output: '2',
        explanation: 'Bytes 32 to 95 begin in line 0 and end in line 1.',
      },
      questions: [
        typeOutput(
          'The object starts on a line boundary. What is printed?',
          cpp(`
            #include <cstddef>
            #include <iostream>
            int main() {
              std::size_t line = 64;
              std::size_t start = 0;
              std::size_t bytes = 64;
              std::size_t first = start / line;
              std::size_t last = (start + bytes - 1) / line;
              std::cout << last - first + 1 << "\\n";
            }
          `),
          '1',
          'Bytes 0 to 63 all lie in line 0.',
        ),
        typeOutput(
          'An 8-byte value starts at offset 60. What is printed?',
          cpp(`
            #include <cstddef>
            #include <iostream>
            int main() {
              std::size_t line = 64;
              std::size_t start = 60;
              std::size_t bytes = 8;
              std::size_t first = start / line;
              std::size_t last = (start + bytes - 1) / line;
              std::cout << last - first + 1 << "\\n";
            }
          `),
          '2',
          'Bytes 60 to 67 straddle the boundary at 64, so two lines are touched.',
        ),
        typeOutput(
          'The aligned count and the actual span are compared. What is printed?',
          cpp(`
            #include <cstddef>
            #include <iostream>
            int main() {
              std::size_t line = 64;
              std::size_t start = 10;
              std::size_t bytes = 120;
              std::size_t aligned = (bytes + line - 1) / line;
              std::size_t spanned = (start + bytes - 1) / line - start / line + 1;
              std::cout << aligned << " " << spanned << "\\n";
            }
          `),
          '2 3',
          '120 bytes would fit 2 aligned lines, but bytes 10 to 129 reach into line 2.',
        ),
        choose(
          'A model reports 1 line for a 16-byte object without saying where the object starts. What is missing?',
          [
            'The starting offset: a range that crosses a boundary touches 2 lines',
            'Nothing: 16 bytes always fit in one 64-byte line wherever they start',
            'The CPU frequency',
            'The number of threads',
          ],
          0,
          'The count depends on alignment as well as size.',
        ),
      ],
    },
  ],
  'cpp-row-major-index': [
    {
      title: 'Row r, column c lives at r * cols + c',
      explanation: [
        'A matrix stored in one flat std::vector in row-major order keeps each row contiguous: row 0’s elements first, then row 1’s, and so on. The element at row r, column c is at index r * cols + c, where cols, the row length, is the stride.',
        'Neighbours in a row are adjacent in memory; neighbours in a column are cols elements apart.',
      ],
      example: {
        language: 'cpp',
        code: cpp(`
          #include <cstddef>
          #include <iostream>
          #include <vector>
          int main() {
            std::vector<int> cells = {1, 2, 3, 4, 5, 6};
            std::size_t cols = 3;
            std::size_t r = 1;
            std::size_t c = 1;
            std::cout << cells[r * cols + c] << "\\n";
          }
        `),
        output: '5',
        explanation:
          'Row 1 starts at index 3; column 1 of it is index 4, which holds 5.',
      },
      questions: [
        typeOutput(
          'A 3 x 4 matrix holds 0 to 11. What is printed?',
          cpp(`
            #include <cstddef>
            #include <iostream>
            #include <vector>
            int main() {
              std::vector<int> cells = {0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11};
              std::size_t cols = 4;
              std::size_t r = 2;
              std::size_t c = 1;
              std::cout << cells[r * cols + c] << "\\n";
            }
          `),
          '9',
          'With 4 columns per row, row 2 starts at 8; column 1 is index 9.',
        ),
        typeOutput(
          'What does this program print?',
          cpp(`
            #include <cstddef>
            #include <iostream>
            int main() {
              std::size_t cols = 5;
              std::size_t here = 2 * cols + 3;
              std::size_t below = 3 * cols + 3;
              std::cout << here << " " << below - here << "\\n";
            }
          `),
          '13 5',
          'Cell (2, 3) is at 13, and the cell below it is one full row, 5 elements, further on.',
        ),
        choose(
          'In a row-major matrix with 4 rows and 6 columns, how far apart are (r, c) and (r + 1, c) in the flat vector?',
          ['1', '4', '6', '24'],
          2,
          'Moving down one row skips a whole row of cols = 6 elements.',
        ),
        typeOutput(
          'A 2 x 3 matrix is read with the correct formula and with a mixed-up one. What is printed?',
          cpp(`
            #include <cstddef>
            #include <iostream>
            #include <vector>
            int main() {
              std::vector<int> cells = {1, 2, 3, 4, 5, 6};
              std::size_t rows = 2;
              std::size_t cols = 3;
              std::size_t r = 0;
              std::size_t c = 2;
              std::cout << cells[r * cols + c] << " " << cells[c * rows + r] << "\\n";
            }
          `),
          '3 5',
          'The correct index for (0, 2) is 2; the column-major formula gives 4, a different cell.',
        ),
      ],
    },
    {
      title: 'Validate the shape before indexing',
      explanation: [
        'Indexing is only meaningful when r < rows, c < cols and cells.size() == rows * cols. A column index that is too large does not fail on its own: r * cols + c silently lands in the next row, or past the end of the vector.',
        'Check the shape and bounds first and report a failure, rather than reading whichever cell the formula reaches.',
      ],
      example: {
        language: 'cpp',
        code: cpp(`
          #include <cstddef>
          #include <iostream>
          #include <vector>
          int main() {
            std::vector<int> cells = {1, 2, 3, 4, 5, 6};
            std::size_t cols = 3;
            std::size_t r = 0;
            std::size_t c = 4;
            std::cout << "unchecked " << cells[r * cols + c] << "\\n";
            if (c >= cols) std::cout << "column out of range\\n";
          }
        `),
        output: 'unchecked 5\ncolumn out of range',
        explanation:
          'Column 4 does not exist in a 3-column row, yet the formula quietly reads index 4, which is row 1, column 1.',
      },
      questions: [
        choose(
          'For a 2 x 3 matrix, what does r * cols + c give for r = 1, c = 3, and why is that a problem?',
          [
            '4, a valid cell in row 1',
            '6, which is past the end of the 6-element vector',
            '3, the first cell of row 1',
            '6, which wraps around to cell 0 of the vector',
          ],
          1,
          '1 * 3 + 3 is 6, one past the last valid index 5.',
        ),
        typeOutput(
          'What does this program print?',
          cpp(`
            #include <cstddef>
            #include <iostream>
            #include <vector>
            int main() {
              std::vector<int> cells = {1, 2, 3, 4, 5};
              std::size_t rows = 2;
              std::size_t cols = 3;
              std::size_t r = 1;
              std::size_t c = 1;
              if (cells.size() != rows * cols) {
                std::cout << "bad shape\\n";
              } else if (r >= rows) {
                std::cout << "out of range\\n";
              } else if (c >= cols) {
                std::cout << "out of range\\n";
              } else {
                std::cout << cells[r * cols + c] << "\\n";
              }
            }
          `),
          'bad shape',
          'Five cells cannot form a 2 x 3 matrix, so the shape check fails first.',
        ),
        typeOutput(
          'What does this program print?',
          cpp(`
            #include <cstddef>
            #include <iostream>
            #include <vector>
            int main() {
              std::vector<int> cells = {1, 2, 3, 4, 5, 6};
              std::size_t rows = 2;
              std::size_t cols = 3;
              std::size_t r = 1;
              std::size_t c = 2;
              if (cells.size() != rows * cols) {
                std::cout << "bad shape\\n";
              } else if (r >= rows) {
                std::cout << "out of range\\n";
              } else if (c >= cols) {
                std::cout << "out of range\\n";
              } else {
                std::cout << cells[r * cols + c] << "\\n";
              }
            }
          `),
          '6',
          'All checks pass, and (1, 2) is index 5, the last cell.',
        ),
        choose(
          'Why check c < cols even when r * cols + c is less than cells.size()?',
          [
            'It prevents integer overflow',
            'operator[] needs the check in order to throw std::out_of_range',
            'An oversized column silently reads a cell in the next row',
            'It is not needed in that case',
          ],
          2,
          'An in-bounds flat index can still be the wrong logical cell.',
        ),
      ],
    },
  ],
  'cpp-locality': [
    {
      title: 'A structure of arrays keeps one field contiguous',
      explanation: [
        'An array of structures (AoS), such as a vector of Order records with price, size and id, interleaves all fields of each record. A structure of arrays (SoA) keeps one vector per field: all prices together, all sizes together.',
        'A loop that reads only prices touches only price bytes in the SoA layout, while in the AoS layout it drags every record’s unused fields through the cache too. In a simple model with 4-byte fields and 12-byte records, scanning prices covers 4 bytes per record in SoA but 12 in AoS.',
      ],
      example: {
        language: 'cpp',
        code: cpp(`
          #include <cstddef>
          #include <iostream>
          #include <vector>
          struct Book {
            std::vector<int> prices;
            std::vector<int> sizes;
          };
          int main() {
            Book book{{10, 20, 30}, {2, 3, 1}};
            long long total = 0;
            for (std::size_t i = 0; i < book.prices.size(); ++i)
              total += static_cast<long long>(book.prices[i]) * book.sizes[i];
            std::cout << total << "\\n";
          }
        `),
        output: '110',
        explanation:
          'Record i is the pair prices[i], sizes[i]; the notional is 20 + 60 + 30.',
      },
      questions: [
        typeOutput(
          'The loop reads prices to decide and sizes to add. What is printed?',
          cpp(`
            #include <cstddef>
            #include <iostream>
            #include <vector>
            int main() {
              std::vector<int> prices = {10, 20, 30};
              std::vector<int> sizes = {2, 3, 1};
              int total = 0;
              for (std::size_t i = 0; i < prices.size(); ++i)
                if (prices[i] > 15) total += sizes[i];
              std::cout << total << "\\n";
            }
          `),
          '4',
          'Records 1 and 2 have prices above 15; their sizes are 3 and 1.',
        ),
        typeOutput(
          'A model compares bytes covered when scanning one 8-byte field of 500 records. What is printed?',
          cpp(`
            #include <iostream>
            int main() {
              int records = 500;
              int field_bytes = 8;
              int record_bytes = 32;
              std::cout << records * field_bytes << " " << records * record_bytes << "\\n";
            }
          `),
          '4000 16000',
          'SoA covers 500 * 8 bytes of prices; AoS steps through whole 32-byte records.',
        ),
        choose(
          'A hot loop reads only the price of each order. Which layout reads fewer bytes?',
          [
            'A vector of Order structs with price, size and id',
            'A separate vector that holds only prices',
            'Both read exactly the same bytes',
            'A std::map from id to Order',
          ],
          1,
          'Only the price vector keeps the needed field densely packed.',
        ),
        choose(
          'When is an array of structures the better fit?',
          [
            'When a loop scans one field across all records',
            'Never; SoA is always faster',
            'When records have only one field, so there is nothing to split',
            'When each step uses most fields of one record together',
          ],
          3,
          'If every field of a record is needed at once, keeping them together uses the loaded bytes fully.',
        ),
      ],
    },
    {
      title: 'Keep the parallel arrays the same length',
      explanation: [
        'In SoA, record i is spread across several vectors, so every field vector must have the same length. If prices has 3 elements and sizes has 2, index 2 exists in one and not the other, and reading sizes[2] is undefined behavior.',
        'Check the lengths once before the loop, and add or remove a record in every field vector together.',
      ],
      example: {
        language: 'cpp',
        code: cpp(`
          #include <cstddef>
          #include <iostream>
          #include <vector>
          int main() {
            std::vector<int> prices = {10, 20, 30};
            std::vector<int> sizes = {2, 3};
            if (prices.size() != sizes.size()) {
              std::cout << "mismatched\\n";
            } else {
              int total = 0;
              for (std::size_t i = 0; i < prices.size(); ++i) total += prices[i] * sizes[i];
              std::cout << total << "\\n";
            }
          }
        `),
        output: 'mismatched',
        explanation:
          'The lengths differ, so the program reports it instead of reading a third size that does not exist.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          cpp(`
            #include <cstddef>
            #include <iostream>
            #include <vector>
            int main() {
              std::vector<int> prices = {5, 6};
              std::vector<int> sizes = {4, 3};
              if (prices.size() != sizes.size()) {
                std::cout << "mismatched\\n";
              } else {
                int total = 0;
                for (std::size_t i = 0; i < prices.size(); ++i) total += prices[i] * sizes[i];
                std::cout << total << "\\n";
              }
            }
          `),
          '38',
          'The lengths match, so the notional is 5 * 4 + 6 * 3.',
        ),
        choose(
          'A new order is added to prices but not to sizes. What goes wrong next?',
          [
            'sizes grows automatically to match',
            'Nothing, because the missing size is read as 0 by the loop',
            'A loop bounded by prices.size() reads past the end of sizes',
            'The new price is ignored',
          ],
          2,
          'The field vectors now disagree on how many records exist.',
        ),
        typeOutput(
          'What does this program print?',
          cpp(`
            #include <cstddef>
            #include <iostream>
            #include <vector>
            int main() {
              std::vector<int> prices = {1, 2, 3, 4};
              std::vector<int> sizes = {2, 0, 1, 3};
              if (prices.size() != sizes.size()) {
                std::cout << "mismatched\\n";
              } else {
                int total = 0;
                for (std::size_t i = 0; i < prices.size(); ++i) total += prices[i] * sizes[i];
                std::cout << total << "\\n";
              }
            }
          `),
          '17',
          'The products are 2, 0, 3 and 12, which add up to 17.',
        ),
        choose(
          'After checking prices.size() == sizes.size(), which loop bound is correct?',
          [
            'i <= prices.size()',
            'i < prices.size() + sizes.size()',
            'i < prices.size() - 1',
            'i < prices.size()',
          ],
          3,
          'Each index from 0 to size - 1 names one record in both vectors.',
        ),
      ],
    },
  ],
};

const layout: KnowledgePointModule = {
  'cpp-alignas-contract': [
    {
      title: 'alignas raises a type’s alignment',
      explanation: [
        'Every type has an alignment: its objects must start at an address that is a multiple of it, and alignof(T) reports it. Writing alignas(N) on a struct asks for a stricter alignment N, a power of two, so `struct alignas(64) Slot { int value; };` makes every Slot start on a 64-byte boundary.',
        'alignas can only strengthen alignment. Requesting less than the type naturally needs is an error, and a value larger than the implementation supports is rejected at compile time.',
      ],
      example: {
        language: 'cpp',
        code: cpp(`
          #include <iostream>
          struct alignas(64) Slot {
            int value;
          };
          int main() {
            Slot s{7};
            std::cout << alignof(Slot) << " " << s.value << "\\n";
          }
        `),
        output: '64 7',
        explanation:
          'alignof reports the requested 64; the member still holds the 7 it was initialized with.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          cpp(`
            #include <iostream>
            struct alignas(32) Packet {
              int id;
              int size;
            };
            int main() {
              std::cout << alignof(Packet) << "\\n";
            }
          `),
          '32',
          'The struct asks for 32-byte alignment, which is stricter than its int members need.',
        ),
        typeOutput(
          'What does this program print?',
          cpp(`
            #include <iostream>
            struct alignas(16) Small {
              int value;
            };
            struct alignas(128) Large {
              int value;
            };
            int main() {
              std::cout << alignof(Small) << " " << alignof(Large) << "\\n";
            }
          `),
          '16 128',
          'Each type reports the alignment its own alignas requested.',
        ),
        choose(
          'What does alignas(64) on a struct guarantee?',
          [
            'Its member values are rounded to multiples of 64',
            'The CPU’s cache line is 64 bytes',
            'Every object of the type starts at a multiple of 64',
            'Accesses to it are atomic',
          ],
          2,
          'alignas controls placement of objects, nothing else.',
        ),
        choose(
          'Why can `struct alignas(1) Pair { int a; int b; };` not lower Pair’s alignment below int’s?',
          [
            'alignas(1) is applied only at run time',
            'alignas can only make alignment stricter; weaker is ill-formed',
            'alignas accepts only 64',
            'It can; Pair becomes 1-byte aligned and its ints may be misaligned',
          ],
          1,
          'An alignment specifier may not request less than the entity would need without it.',
        ),
      ],
    },
    {
      title: 'An alignment request is not a hardware measurement',
      explanation: [
        'alignas(64) is often used because 64 bytes is a common cache-line size, but the program chose that number; it does not prove the cache line is 64 bytes on the machine running it. Lines of 128 bytes exist, for example.',
        'Treat such values as stated assumptions. std::hardware_destructive_interference_size in <new> gives the implementation’s suggestion, but it is still a compile-time guess for a target, not a measurement.',
      ],
      example: {
        language: 'cpp',
        code: cpp(`
          #include <iostream>
          struct alignas(64) Counter {
            int hits;
          };
          int main() {
            Counter a{3};
            Counter b{4};
            std::cout << a.hits + b.hits << " " << alignof(Counter) << "\\n";
          }
        `),
        output: '7 64',
        explanation:
          'Alignment changes where each Counter is placed, not the values it holds.',
      },
      questions: [
        choose(
          'A program declares `struct alignas(64) Slot` and claims this proves the CPU’s cache line is 64 bytes. What is wrong?',
          [
            'Nothing; alignas reads the cache line size from the CPU',
            'alignas(64) is invalid',
            'Cache lines are always 32 bytes',
            'alignas states the program’s choice; it measures nothing',
          ],
          3,
          'The number is an assumption written into the code.',
        ),
        choose(
          'What does alignas do to the value stored in a member?',
          [
            'Nothing; it only affects where objects are placed',
            'Rounds it up to a multiple of the alignment',
            'Sets it to zero',
            'Makes it atomic',
          ],
          0,
          'Alignment is about addresses, never about stored values.',
        ),
        typeOutput(
          'What does this program print?',
          cpp(`
            #include <iostream>
            struct alignas(128) Big {
              int v;
            };
            int main() {
              Big x{5};
              std::cout << alignof(Big) << " " << x.v << "\\n";
            }
          `),
          '128 5',
          'Big asks for 128-byte alignment, and its member keeps the value 5.',
        ),
        choose(
          'For `struct alignas(32) T { int v; };`, which statement about alignof(T) is guaranteed?',
          [
            'It equals sizeof(int)',
            'It equals 32',
            'It depends on the cache line size',
            'It equals 64',
          ],
          1,
          'The requested 32 is stricter than int’s alignment, so it becomes the type’s alignment.',
        ),
      ],
    },
  ],
  'cpp-padded-counter': [
    {
      title: 'Give each thread’s counter its own aligned slot',
      explanation: [
        'When two threads keep writing to different variables that share one cache line, each write forces that line to move between their cores. This false sharing slows both threads, although they never touch the same variable.',
        'Wrapping each counter in an alignas(64) struct places the counters at least 64 bytes apart, so on a machine with 64-byte lines they land on different lines. This changes performance only; the program’s results are the same either way.',
      ],
      example: {
        language: 'cpp',
        code: cpp(`
          #include <atomic>
          #include <iostream>
          #include <thread>
          struct alignas(64) Slot {
            std::atomic<int> value{0};
          };
          int main() {
            Slot left;
            Slot right;
            std::thread a([&left] { left.value.store(30); });
            std::thread b([&right] { right.value.store(12); });
            a.join();
            b.join();
            std::cout << left.value.load() + right.value.load() << "\\n";
          }
        `),
        output: '42',
        explanation:
          'Each worker writes only its own slot, and the slots sit on separate 64-byte boundaries; the sum is 30 + 12.',
      },
      questions: [
        typeOutput(
          'Three workers store into three padded slots. What is printed?',
          cpp(`
            #include <atomic>
            #include <iostream>
            #include <thread>
            struct alignas(64) Slot {
              std::atomic<int> value{0};
            };
            int main() {
              Slot a;
              Slot b;
              Slot c;
              std::thread ta([&a] { a.value.store(5); });
              std::thread tb([&b] { b.value.store(6); });
              std::thread tc([&c] { c.value.store(7); });
              ta.join();
              tb.join();
              tc.join();
              std::cout << a.value.load() + b.value.load() + c.value.load() << " " << alignof(Slot) << "\\n";
            }
          `),
          '18 64',
          'Each slot keeps its own value, and every Slot has the requested 64-byte alignment.',
        ),
        choose(
          'Two threads write to different ints that sit in the same 64-byte cache line. Is that a data race?',
          [
            'No: they are different objects; it can be slow but not wrong',
            'Yes: sharing a cache line makes it a data race',
            'Yes, unless both ints are atomic',
            'No, because ints are always written in one instruction',
          ],
          0,
          'Data races are about the same object; false sharing is a performance effect of sharing a line.',
        ),
        choose(
          'What does putting two counters in separate alignas(64) structs change?',
          [
            'Correctness, by preventing data races between the two counters',
            'The values the counters hold',
            'Only performance, by keeping them off one shared line',
            'Nothing at all on any machine',
          ],
          2,
          'Padding moves objects apart in memory; it does not synchronize anything.',
        ),
        choose(
          'Why can false sharing slow two threads that never touch each other’s variable?',
          [
            'The threads must take turns holding a hidden lock on the line',
            'Each variable is copied on every read',
            'The compiler inserts a mutex',
            'Each write makes the shared line move between their cores',
          ],
          3,
          'Coherence works per line, so writes to neighbours keep invalidating the other core’s copy.',
        ),
      ],
    },
    {
      title: 'Padding does not replace synchronization',
      explanation: [
        'Padding cannot fix a data race. If two threads write the same counter, it must still be atomic or protected by a mutex, however it is aligned. And a counter that only one thread writes, read after a join, needs no atomic at all, padded or not.',
        'Decide correctness first (who writes what, and how it is synchronized), then add alignment only where a measurement shows false sharing matters.',
      ],
      example: {
        language: 'cpp',
        code: cpp(`
          #include <iostream>
          #include <thread>
          struct alignas(64) Partial {
            int sum = 0;
          };
          int main() {
            Partial a_part;
            Partial b_part;
            std::thread a([&a_part] { a_part.sum = 1 + 2 + 3; });
            std::thread b([&b_part] { b_part.sum = 4 + 5; });
            a.join();
            b.join();
            std::cout << a_part.sum + b_part.sum << "\\n";
          }
        `),
        output: '15',
        explanation:
          'Each plain int has a single writer and is read after the joins, so no atomic is needed; the padding only keeps the two partials on separate lines.',
      },
      questions: [
        choose(
          'Two threads both increment the same plain int, which lives in its own alignas(64) struct. What is true?',
          [
            'Still a data race: padding separates objects, not accesses',
            'The padding makes the increments safe',
            'It is safe because no cache line is shared',
            'It is safe, but only on machines whose cache lines are 64 bytes',
          ],
          0,
          'Both threads access the very same int without synchronization.',
        ),
        choose(
          'Each worker writes only its own padded plain int, and main reads them after joining all workers. What synchronization is needed?',
          [
            'Each int must be atomic',
            'None beyond the joins',
            'A mutex around every write',
            'alignas(128) instead of 64',
          ],
          1,
          'Single-writer data read after join() is already correctly ordered.',
        ),
        typeOutput(
          'What does this program print?',
          cpp(`
            #include <iostream>
            #include <thread>
            struct alignas(64) Partial {
              int sum = 0;
            };
            int main() {
              Partial a_part;
              Partial b_part;
              std::thread a([&a_part] { a_part.sum = 10 * 2; });
              std::thread b([&b_part] { b_part.sum = 5 * 5; });
              a.join();
              b.join();
              std::cout << a_part.sum + b_part.sum << "\\n";
            }
          `),
          '45',
          'Each worker fills its own partial, and main adds them after the joins.',
        ),
        choose(
          'When should you add alignas padding to per-thread counters?',
          [
            'Always, because padding is what makes counters correct',
            'Instead of using atomics',
            'Only in single-threaded code',
            'When a measurement shows false sharing costs time',
          ],
          3,
          'Padding has a memory cost and only a performance benefit, so it should follow evidence.',
        ),
      ],
    },
  ],
  'cpp-layout-spacing': [
    {
      title: 'sizeof is always a multiple of alignof',
      explanation: [
        'Array elements are placed sizeof(T) bytes apart, and every element must be aligned. So the language makes sizeof(T) a multiple of alignof(T), adding padding at the end of the struct when needed. A struct alignas(64) with a single int member therefore occupies at least 64 bytes.',
        'In a model with given member sizes, the size is the members’ bytes rounded up to the next multiple of the alignment, and element i of an array starts at i * size.',
      ],
      example: {
        language: 'cpp',
        code: cpp(`
          #include <iostream>
          struct alignas(64) Counter {
            int value;
          };
          int main() {
            int member_bytes = 4;
            int alignment = 64;
            int size = (member_bytes + alignment - 1) / alignment * alignment;
            std::cout << size << " " << sizeof(Counter) % alignof(Counter) << "\\n";
          }
        `),
        output: '64 0',
        explanation:
          'The model rounds 4 bytes up to 64. For the real type, the language guarantees sizeof is a multiple of alignof, so the remainder is 0.',
      },
      questions: [
        predictOutput(
          'Members take 72 bytes in a 64-aligned struct. What size does the model give?',
          cpp(`
            #include <iostream>
            int main() {
              int member_bytes = 72;
              int alignment = 64;
              int size = (member_bytes + alignment - 1) / alignment * alignment;
              std::cout << size << "\\n";
            }
          `),
          ['72', '136', '128', '64'],
          2,
          '72 bytes need two 64-byte units, so the padded size is 128.',
        ),
        typeOutput(
          'An array holds 3 elements of a 128-byte type. What is printed?',
          cpp(`
            #include <iostream>
            int main() {
              int size = 128;
              int count = 3;
              std::cout << 2 * size << " " << count * size << "\\n";
            }
          `),
          '256 384',
          'Element 2 starts two strides in, at 256, and the array spans 3 * 128 bytes.',
        ),
        choose(
          'Why must sizeof(T) be a multiple of alignof(T)?',
          [
            'So the struct always fits in exactly one cache line',
            'So every element of a T array is correctly aligned',
            'Because sizeof counts cache lines',
            'It need not be',
          ],
          1,
          'Elements follow each other at sizeof(T) intervals, so the stride must preserve alignment.',
        ),
        typeOutput(
          'What does this program print?',
          cpp(`
            #include <iostream>
            struct alignas(32) Pair {
              int a;
              int b;
            };
            int main() {
              std::cout << sizeof(Pair) % alignof(Pair) << "\\n";
            }
          `),
          '0',
          'Whatever the exact size, it is a multiple of the alignment, so the remainder is 0.',
        ),
      ],
    },
    {
      title: 'A layout check is not a speed measurement',
      explanation: [
        'Checking sizeof and alignof confirms the layout you asked for, for example that counters are 64 bytes apart. It does not show the program got faster. Whether false sharing mattered, and whether padding helped, can only be learned by timing the real workload on the target machine.',
        'Padding also costs memory: 1,000 counters padded to 64 bytes use 64,000 bytes instead of 4,000, which can push other hot data out of the cache.',
      ],
      example: {
        language: 'cpp',
        code: cpp(`
          #include <iostream>
          int main() {
            int counters = 1000;
            int plain_bytes = 4;
            int padded_bytes = 64;
            std::cout << counters * plain_bytes << " " << counters * padded_bytes << "\\n";
          }
        `),
        output: '4000 64000',
        explanation:
          'Padding multiplies the memory used by the counters by 16 in this model.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          cpp(`
            #include <iostream>
            int main() {
              int counters = 256;
              int plain_bytes = 8;
              int padded_bytes = 128;
              std::cout << counters * plain_bytes << " " << counters * padded_bytes << "\\n";
            }
          `),
          '2048 32768',
          '256 plain 8-byte counters take 2048 bytes; padded to 128 bytes each they take 32768.',
        ),
        choose(
          'A test asserts sizeof(Slot) == 64, and the author concludes the hot loop is faster. What is missing?',
          [
            'A timing of the workload on the target machine',
            'Nothing; the size proves the speedup',
            'A check that alignof(Slot) is 32 rather than 64',
            'A larger alignas value',
          ],
          0,
          'A size check confirms layout, not performance.',
        ),
        choose(
          'What is a cost of padding every counter to 64 bytes?',
          [
            'Data races between neighbouring counters that share padding',
            'More memory, which can push other hot data out of the cache',
            'Slower compile times only',
            'Counters can no longer be atomic',
          ],
          1,
          'Padding inflates the footprint, and cache space is shared with everything else.',
        ),
        choose(
          'Which evidence shows that padding helped?',
          [
            'sizeof(Slot) % 64 == 0',
            'alignof(Slot) == 64',
            'The program still prints the same totals after the change',
            'Timing the real workload before and after, several times',
          ],
          3,
          'Only a measurement of the workload can show a speedup.',
        ),
      ],
    },
  ],
  'cpp-false-sharing': [
    {
      title: 'Equal line indices mean a shared line',
      explanation: [
        'In a line model with line size L and lines starting at multiples of L, byte offset a lies in line a / L. Two offsets share a line exactly when a / L == b / L.',
        'So two counters at offsets 0 and 8 share line 0 when lines are 64 bytes, while offsets 0 and 64 fall in lines 0 and 1.',
      ],
      example: {
        language: 'cpp',
        code: cpp(`
          #include <cstddef>
          #include <iostream>
          int main() {
            std::size_t line = 64;
            std::size_t a = 0;
            std::size_t b = 8;
            std::cout << a / line << " " << b / line << " " << (a / line == b / line) << "\\n";
          }
        `),
        output: '0 0 1',
        explanation:
          'Both offsets are below 64, so both are in line 0 and the comparison prints 1.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          cpp(`
            #include <cstddef>
            #include <iostream>
            int main() {
              std::size_t line = 64;
              std::size_t a = 60;
              std::size_t b = 68;
              std::cout << a / line << " " << b / line << " " << (a / line == b / line) << "\\n";
            }
          `),
          '0 1 0',
          'Only 8 bytes apart, but a boundary at 64 separates them: lines 0 and 1.',
        ),
        typeOutput(
          'What does this program print?',
          cpp(`
            #include <cstddef>
            #include <iostream>
            int main() {
              std::size_t line = 64;
              std::size_t a = 128;
              std::size_t b = 191;
              std::cout << a / line << " " << b / line << " " << (a / line == b / line) << "\\n";
            }
          `),
          '2 2 1',
          '128 to 191 is exactly line 2, so both offsets share it.',
        ),
        typeOutput(
          'The same two offsets are checked under two line sizes. What is printed?',
          cpp(`
            #include <cstddef>
            #include <iostream>
            int main() {
              std::size_t a = 0;
              std::size_t b = 64;
              std::cout << (a / 64 == b / 64) << " " << (a / 128 == b / 128) << "\\n";
            }
          `),
          '0 1',
          'With 64-byte lines they are in different lines; with 128-byte lines both are in line 0.',
        ),
        choose(
          'Two counters are 8 bytes apart. Do they share a 64-byte line?',
          [
            'Always, because 8 bytes is far less than one 64-byte line',
            'Never',
            'It depends on where they start: 56 and 64 straddle a line',
            'Only if both are atomic',
          ],
          2,
          'Sharing depends on the line indices, not just the distance.',
        ),
      ],
    },
    {
      title: 'A shared line matters only when threads write it',
      explanation: [
        'Sharing a line becomes false sharing only when at least one thread writes one variable while another thread uses a different variable on the same line. Data that every thread only reads can share lines freely.',
        'The model answers a layout question, which variables share a line. It does not measure coherence traffic or time; confirming a slowdown takes a benchmark.',
      ],
      example: {
        language: 'cpp',
        code: cpp(`
          #include <cstddef>
          #include <iostream>
          int main() {
            std::size_t line = 64;
            std::size_t first = 0;
            std::size_t second = 4;
            std::size_t third = 64;
            int shared_pairs = 0;
            if (first / line == second / line) shared_pairs += 1;
            if (first / line == third / line) shared_pairs += 1;
            if (second / line == third / line) shared_pairs += 1;
            std::cout << shared_pairs << "\\n";
          }
        `),
        output: '1',
        explanation:
          'Three per-thread counters form three pairs; only the counters at 0 and 4 share a line.',
      },
      questions: [
        typeOutput(
          'Counters sit at offsets 0, 16 and 32. What is printed?',
          cpp(`
            #include <cstddef>
            #include <iostream>
            int main() {
              std::size_t line = 64;
              std::size_t first = 0;
              std::size_t second = 16;
              std::size_t third = 32;
              int shared_pairs = 0;
              if (first / line == second / line) shared_pairs += 1;
              if (first / line == third / line) shared_pairs += 1;
              if (second / line == third / line) shared_pairs += 1;
              std::cout << shared_pairs << "\\n";
            }
          `),
          '3',
          'All three offsets are in line 0, so every pair shares it.',
        ),
        choose(
          'Two threads only read different constants that share a cache line. Is that false sharing?',
          [
            'No: reads alone let both cores keep a copy of the line',
            'Yes: any two threads on one line is false sharing',
            'Yes, if the constants are ints',
            'No, because constants are never cached',
          ],
          0,
          'The cost comes from writes invalidating other cores’ copies.',
        ),
        choose(
          'The model shows that two per-thread counters share a line. What does that prove?',
          [
            'That the program has a data race',
            'Only that they share a line in the model; any cost needs measuring',
            'That the program runs twice as slowly as a padded version would',
            'Nothing about the layout',
          ],
          1,
          'A layout model identifies candidates for false sharing, not its cost.',
        ),
        typeOutput(
          'The counters are padded to a 64-byte stride. What is printed?',
          cpp(`
            #include <cstddef>
            #include <iostream>
            int main() {
              std::size_t line = 64;
              std::size_t first = 0;
              std::size_t second = 64;
              std::size_t third = 128;
              int shared_pairs = 0;
              if (first / line == second / line) shared_pairs += 1;
              if (first / line == third / line) shared_pairs += 1;
              if (second / line == third / line) shared_pairs += 1;
              std::cout << shared_pairs << "\\n";
            }
          `),
          '0',
          'Each counter starts its own line, so no pair shares one.',
        ),
      ],
    },
  ],
};

const measurement: KnowledgePointModule = {
  'cpp-elapsed-duration': [
    {
      title: 'Elapsed time is a later time point minus an earlier one',
      explanation: [
        'One steady_clock reading is a time_point: a position on that clock’s timeline, not an amount of time. Subtracting two time points of the same clock, end - start, gives the duration between them, and the duration carries its unit with it.',
        'Convert only when you report: std::chrono::duration_cast<std::chrono::microseconds>(end - start).count() gives whole microseconds and drops any remainder.',
      ],
      example: {
        language: 'cpp',
        code: cpp(`
          #include <chrono>
          #include <iostream>
          int main() {
            std::chrono::steady_clock::time_point start{std::chrono::microseconds(100)};
            std::chrono::steady_clock::time_point end = start + std::chrono::microseconds(45);
            std::chrono::nanoseconds elapsed = end - start;
            std::cout << std::chrono::duration_cast<std::chrono::microseconds>(elapsed).count() << " us\\n";
          }
        `),
        output: '45 us',
        explanation:
          'end is 45 microseconds after start, so their difference is a duration of 45 microseconds.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          cpp(`
            #include <chrono>
            #include <iostream>
            int main() {
              std::chrono::steady_clock::time_point start{std::chrono::milliseconds(2000)};
              std::chrono::steady_clock::time_point end{std::chrono::milliseconds(9500)};
              std::chrono::nanoseconds elapsed = end - start;
              std::cout << std::chrono::duration_cast<std::chrono::milliseconds>(elapsed).count() << " ms = "
                        << std::chrono::duration_cast<std::chrono::seconds>(elapsed).count() << " s\\n";
            }
          `),
          '7500 ms = 7 s',
          'The difference is 7500 ms, and duration_cast to whole seconds drops the remainder, leaving 7 s.',
        ),
        typeOutput(
          'Three time points mark two phases. What is printed?',
          cpp(`
            #include <chrono>
            #include <iostream>
            int main() {
              std::chrono::steady_clock::time_point t0{std::chrono::milliseconds(10)};
              std::chrono::steady_clock::time_point t1 = t0 + std::chrono::milliseconds(25);
              std::chrono::steady_clock::time_point t2 = t1 + std::chrono::milliseconds(55);
              std::cout << std::chrono::duration_cast<std::chrono::milliseconds>(t1 - t0).count() << " "
                        << std::chrono::duration_cast<std::chrono::milliseconds>(t2 - t1).count() << " "
                        << std::chrono::duration_cast<std::chrono::milliseconds>(t2 - t0).count() << "\\n";
            }
          `),
          '25 55 80',
          'Each phase is the difference of its own end and start, and the total is t2 - t0.',
        ),
        choose(
          'A log line says "request took 1700000000123 ns". What most likely went wrong?',
          [
            'A single time point, time since the clock’s epoch, was logged instead of end - start',
            'The request really took that long',
            'The unit should have been microseconds',
            'duration_cast rounded the value up',
          ],
          0,
          'The number looks like a timestamp, about 53 years after 1970 in nanoseconds, not an interval.',
        ),
        typeOutput(
          'start was recorded in milliseconds and end in microseconds. What is printed?',
          cpp(`
            #include <chrono>
            #include <iostream>
            int main() {
              std::chrono::steady_clock::time_point start{std::chrono::milliseconds(2)};
              std::chrono::steady_clock::time_point end{std::chrono::microseconds(2500)};
              std::cout << std::chrono::duration_cast<std::chrono::microseconds>(end - start).count() << " us\\n";
            }
          `),
          '500 us',
          'Both time points store the clock’s own unit, so 2 ms and 2500 µs are compared correctly: 500 µs apart. Raw integers 2500 - 2 would have mixed units.',
        ),
      ],
    },
    {
      title: 'Use a monotonic clock and reject an end before the start',
      explanation: [
        'std::chrono::system_clock follows the wall clock, adjustments included, so an interval timed with it can come out negative or far too large. std::chrono::steady_clock never goes backwards, so it is the clock for durations.',
        'Time points that arrive from elsewhere, such as a log, carry no such promise. Time points of one clock compare like numbers, so check end < start and treat it as an error instead of reporting a negative duration.',
      ],
      example: {
        language: 'cpp',
        code: cpp(`
          #include <chrono>
          #include <iostream>
          int main() {
            std::chrono::steady_clock::time_point start{std::chrono::milliseconds(500)};
            std::chrono::steady_clock::time_point end{std::chrono::milliseconds(480)};
            if (end < start) {
              std::cout << "invalid interval\\n";
            } else {
              std::cout << std::chrono::duration_cast<std::chrono::milliseconds>(end - start).count() << "\\n";
            }
          }
        `),
        output: 'invalid interval',
        explanation:
          'An end before the start cannot be a real duration, so it is reported instead of printing -20.',
      },
      questions: [
        choose(
          'Which clock should time how long a function takes?',
          [
            'std::chrono::system_clock',
            'Either; they always agree',
            'std::chrono::steady_clock',
            'A clock that reads the calendar date',
          ],
          2,
          'steady_clock is monotonic, so adjustments to the system time cannot distort an interval.',
        ),
        typeOutput(
          'What does this program print?',
          cpp(`
            #include <chrono>
            #include <iostream>
            int main() {
              std::chrono::steady_clock::time_point start{std::chrono::milliseconds(700)};
              std::chrono::steady_clock::time_point end = start;
              if (end < start) {
                std::cout << "invalid interval\\n";
              } else {
                std::cout << std::chrono::duration_cast<std::chrono::milliseconds>(end - start).count() << "\\n";
              }
            }
          `),
          '0',
          'Equal time points are a valid interval of length 0.',
        ),
        choose(
          'Interval readings come from system_clock, and the clock is adjusted during the run. What can happen?',
          [
            'Nothing; system_clock never moves backwards',
            'The program stops',
            'The clock pauses until the adjustment finishes',
            'A measured interval can be negative or far too large',
          ],
          3,
          'system_clock follows the wall clock, adjustments included.',
        ),
        typeOutput(
          'What does this program print?',
          cpp(`
            #include <chrono>
            #include <iostream>
            int main() {
              std::chrono::steady_clock::time_point first = std::chrono::steady_clock::now();
              std::chrono::steady_clock::time_point second = std::chrono::steady_clock::now();
              std::cout << (second - first >= std::chrono::nanoseconds(0)) << " " << (second < first) << "\\n";
            }
          `),
          '1 0',
          'A later steady_clock reading is never earlier than an earlier one, so the difference is not negative.',
        ),
      ],
    },
  ],
  'cpp-median-samples': [
    {
      title: 'Sort a copy, then take the middle',
      explanation: [
        'The median of a set of samples is the middle value after sorting. For an odd count n it is element n / 2 of the sorted samples; for an even count it is the mean of elements n / 2 - 1 and n / 2.',
        'Sort a copy so the caller’s sample order is kept, and convert to double before averaging the two middle values so a .5 is not lost.',
      ],
      example: {
        language: 'cpp',
        code: cpp(`
          #include <algorithm>
          #include <iostream>
          #include <vector>
          int main() {
            std::vector<int> samples = {9, 2, 4};
            std::vector<int> sorted = samples;
            std::sort(sorted.begin(), sorted.end());
            std::cout << sorted[sorted.size() / 2] << " " << samples[0] << "\\n";
          }
        `),
        output: '4 9',
        explanation:
          'Sorted, the samples are 2, 4, 9, so the median is 4; the original vector still starts with 9.',
      },
      questions: [
        typeOutput(
          'There is an even number of samples. What is printed?',
          cpp(`
            #include <algorithm>
            #include <cstddef>
            #include <iostream>
            #include <vector>
            int main() {
              std::vector<int> samples = {1, 4, 2, 8};
              std::sort(samples.begin(), samples.end());
              std::size_t middle = samples.size() / 2;
              double median = (static_cast<double>(samples[middle - 1]) + samples[middle]) / 2;
              std::cout << median << "\\n";
            }
          `),
          '3',
          'Sorted, the middle two are 2 and 4, whose mean is 3; 3.75 would be the mean of all four.',
        ),
        typeOutput(
          'What does this program print?',
          cpp(`
            #include <algorithm>
            #include <cstddef>
            #include <iostream>
            #include <vector>
            int main() {
              std::vector<int> samples = {5, 1, 2, 8};
              std::sort(samples.begin(), samples.end());
              std::size_t middle = samples.size() / 2;
              double median = (static_cast<double>(samples[middle - 1]) + samples[middle]) / 2;
              std::cout << median << "\\n";
            }
          `),
          '3.5',
          'The middle values are 2 and 5; converting before dividing keeps the .5.',
        ),
        typeOutput(
          'One latency sample is an outlier. What is printed?',
          cpp(`
            #include <algorithm>
            #include <iostream>
            #include <vector>
            int main() {
              std::vector<int> samples = {12, 11, 950, 13, 10};
              std::sort(samples.begin(), samples.end());
              std::cout << samples[samples.size() / 2] << "\\n";
            }
          `),
          '12',
          'Sorted, the samples are 10, 11, 12, 13, 950; the middle one is 12.',
        ),
        choose(
          'Why is the median a better summary than the mean for latency samples with one 950 ms outlier?',
          [
            'One extreme sample barely moves the median but drags the mean',
            'The median is always smaller than the mean, so it looks better',
            'The mean cannot be computed for latencies',
            'The median ignores half of the samples',
          ],
          0,
          'The median depends only on the order of the samples, not on how extreme the largest is.',
        ),
      ],
    },
    {
      title: 'Define the empty case and branch on the count',
      explanation: [
        'With no samples there is no middle element; sorted[0] or sorted[sorted.size() / 2] would read past the end. Decide what empty input means, for example reporting "no samples", and check for it before sorting or indexing.',
        'Then a branch on sorted.size() % 2 selects the right formula for nonempty input.',
      ],
      example: {
        language: 'cpp',
        code: cpp(`
          #include <algorithm>
          #include <cstddef>
          #include <iostream>
          #include <vector>
          int main() {
            std::vector<int> samples;
            if (samples.empty()) {
              std::cout << "no samples\\n";
            } else {
              std::vector<int> sorted = samples;
              std::sort(sorted.begin(), sorted.end());
              std::size_t middle = sorted.size() / 2;
              if (sorted.size() % 2 == 1) {
                std::cout << sorted[middle] << "\\n";
              } else {
                std::cout << (static_cast<double>(sorted[middle - 1]) + sorted[middle]) / 2 << "\\n";
              }
            }
          }
        `),
        output: 'no samples',
        explanation:
          'The empty check runs first, so nothing is sorted or indexed.',
      },
      questions: [
        typeOutput(
          'The same program runs on one sample. What is printed?',
          cpp(`
            #include <algorithm>
            #include <cstddef>
            #include <iostream>
            #include <vector>
            int main() {
              std::vector<int> samples = {6};
              if (samples.empty()) {
                std::cout << "no samples\\n";
              } else {
                std::vector<int> sorted = samples;
                std::sort(sorted.begin(), sorted.end());
                std::size_t middle = sorted.size() / 2;
                if (sorted.size() % 2 == 1) {
                  std::cout << sorted[middle] << "\\n";
                } else {
                  std::cout << (static_cast<double>(sorted[middle - 1]) + sorted[middle]) / 2 << "\\n";
                }
              }
            }
          `),
          '6',
          'One sample is an odd count, and middle is index 0.',
        ),
        choose(
          'What does `sorted[sorted.size() / 2]` do for an empty vector?',
          [
            'Returns 0',
            'Throws std::out_of_range',
            'Reads past the end, which is undefined behavior',
            'Returns NaN, since there is no middle value',
          ],
          2,
          'The index is 0 but there is no element 0, and operator[] does not check.',
        ),
        typeOutput(
          'Two samples go through the same program. What is printed?',
          cpp(`
            #include <algorithm>
            #include <cstddef>
            #include <iostream>
            #include <vector>
            int main() {
              std::vector<int> samples = {20, 10};
              if (samples.empty()) {
                std::cout << "no samples\\n";
              } else {
                std::vector<int> sorted = samples;
                std::sort(sorted.begin(), sorted.end());
                std::size_t middle = sorted.size() / 2;
                if (sorted.size() % 2 == 1) {
                  std::cout << sorted[middle] << "\\n";
                } else {
                  std::cout << (static_cast<double>(sorted[middle - 1]) + sorted[middle]) / 2 << "\\n";
                }
              }
            }
          `),
          '15',
          'An even count averages the two middle values, 10 and 20.',
        ),
        typeOutput(
          'Three samples go through the same program. What is printed?',
          cpp(`
            #include <algorithm>
            #include <cstddef>
            #include <iostream>
            #include <vector>
            int main() {
              std::vector<int> samples = {7, 3, 9};
              if (samples.empty()) {
                std::cout << "no samples\\n";
              } else {
                std::vector<int> sorted = samples;
                std::sort(sorted.begin(), sorted.end());
                std::size_t middle = sorted.size() / 2;
                if (sorted.size() % 2 == 1) {
                  std::cout << sorted[middle] << "\\n";
                } else {
                  std::cout << (static_cast<double>(sorted[middle - 1]) + sorted[middle]) / 2 << "\\n";
                }
              }
            }
          `),
          '7',
          'Sorted, the samples are 3, 7, 9; the odd branch prints the middle value.',
        ),
      ],
    },
  ],
  'cpp-nearest-rank-percentile': [
    {
      title: 'Nearest rank picks sample ceil(p * n / 100)',
      explanation: [
        'Several percentile definitions exist, so a reported percentile should name its rule. The nearest-rank rule sorts n samples and returns the sample at 1-based rank ceil(p * n / 100), which is 0-based index rank - 1.',
        'With integers, ceil(p * n / 100) is (p * n + 99) / 100. For n = 4 and p = 50 the rank is 2, so p50 is the second smallest sample.',
      ],
      example: {
        language: 'cpp',
        code: cpp(`
          #include <algorithm>
          #include <cstddef>
          #include <iostream>
          #include <vector>
          int main() {
            std::vector<int> samples = {4, 1, 9, 2};
            std::sort(samples.begin(), samples.end());
            std::size_t p = 50;
            std::size_t rank = (p * samples.size() + 99) / 100;
            std::cout << rank << " " << samples[rank - 1] << "\\n";
          }
        `),
        output: '2 2',
        explanation:
          'Sorted, the samples are 1, 2, 4, 9. Rank ceil(50 * 4 / 100) = 2 selects 2.',
      },
      questions: [
        typeOutput(
          'The same samples are asked for p99. What is printed?',
          cpp(`
            #include <algorithm>
            #include <cstddef>
            #include <iostream>
            #include <vector>
            int main() {
              std::vector<int> samples = {4, 1, 9, 2};
              std::sort(samples.begin(), samples.end());
              std::size_t p = 99;
              std::size_t rank = (p * samples.size() + 99) / 100;
              std::cout << rank << " " << samples[rank - 1] << "\\n";
            }
          `),
          '4 9',
          'ceil(99 * 4 / 100) = ceil(3.96) = 4, the largest of four samples.',
        ),
        predictOutput(
          'Ten samples hold 1 to 10 in a shuffled order. What is p90?',
          cpp(`
            #include <algorithm>
            #include <cstddef>
            #include <iostream>
            #include <vector>
            int main() {
              std::vector<int> samples = {3, 10, 1, 7, 5, 9, 2, 8, 4, 6};
              std::sort(samples.begin(), samples.end());
              std::size_t p = 90;
              std::size_t rank = (p * samples.size() + 99) / 100;
              std::cout << samples[rank - 1] << "\\n";
            }
          `),
          ['10', '8', '9', '90'],
          2,
          'Rank ceil(90 * 10 / 100) = 9, and the ninth smallest of 1 to 10 is 9.',
        ),
        typeOutput(
          'What does this program print?',
          cpp(`
            #include <algorithm>
            #include <cstddef>
            #include <iostream>
            #include <vector>
            int main() {
              std::vector<int> samples = {4, 1, 9, 2};
              std::sort(samples.begin(), samples.end());
              std::size_t p = 25;
              std::size_t rank = (p * samples.size() + 99) / 100;
              std::cout << samples[rank - 1] << "\\n";
            }
          `),
          '1',
          'Rank ceil(25 * 4 / 100) = 1 selects the smallest sample.',
        ),
        choose(
          'A dashboard reports "p99 = 9 ms" computed from 4 samples. What should accompany it?',
          [
            'Nothing more',
            'The mean of the samples, so readers can see the typical latency',
            'The CPU model',
            'The sample count and the rule; with 4 samples, p99 is the max',
          ],
          3,
          'Without the count and rule, readers cannot tell how much the number means.',
        ),
      ],
    },
    {
      title: 'Validate the percentile and the sample count',
      explanation: [
        'Nearest rank is defined for 0 < p <= 100 and at least one sample. p = 0 gives rank 0, and rank - 1 with unsigned arithmetic wraps around to a huge index; an empty sample set has no rank at all. Reject both before indexing.',
        'With few samples, high percentiles collapse onto the maximum: for n = 4 every p above 75 selects the largest sample.',
      ],
      example: {
        language: 'cpp',
        code: cpp(`
          #include <algorithm>
          #include <cstddef>
          #include <iostream>
          #include <vector>
          int main() {
            std::vector<int> samples = {4, 1, 9, 2};
            std::size_t p = 0;
            if (samples.empty()) {
              std::cout << "no samples\\n";
            } else if (p == 0) {
              std::cout << "invalid percentile\\n";
            } else if (p > 100) {
              std::cout << "invalid percentile\\n";
            } else {
              std::sort(samples.begin(), samples.end());
              std::size_t rank = (p * samples.size() + 99) / 100;
              std::cout << samples[rank - 1] << "\\n";
            }
          }
        `),
        output: 'invalid percentile',
        explanation:
          'p = 0 is rejected before rank - 1 could wrap around to an enormous index.',
      },
      questions: [
        typeOutput(
          'p is 76 with four samples. What is printed?',
          cpp(`
            #include <algorithm>
            #include <cstddef>
            #include <iostream>
            #include <vector>
            int main() {
              std::vector<int> samples = {4, 1, 9, 2};
              std::size_t p = 76;
              if (samples.empty()) {
                std::cout << "no samples\\n";
              } else if (p == 0) {
                std::cout << "invalid percentile\\n";
              } else if (p > 100) {
                std::cout << "invalid percentile\\n";
              } else {
                std::sort(samples.begin(), samples.end());
                std::size_t rank = (p * samples.size() + 99) / 100;
                std::cout << samples[rank - 1] << "\\n";
              }
            }
          `),
          '9',
          'ceil(76 * 4 / 100) = ceil(3.04) = 4: any p above 75 picks the maximum of four samples.',
        ),
        typeOutput(
          'There are no samples. What is printed?',
          cpp(`
            #include <algorithm>
            #include <cstddef>
            #include <iostream>
            #include <vector>
            int main() {
              std::vector<int> samples;
              std::size_t p = 50;
              if (samples.empty()) {
                std::cout << "no samples\\n";
              } else if (p == 0) {
                std::cout << "invalid percentile\\n";
              } else if (p > 100) {
                std::cout << "invalid percentile\\n";
              } else {
                std::sort(samples.begin(), samples.end());
                std::size_t rank = (p * samples.size() + 99) / 100;
                std::cout << samples[rank - 1] << "\\n";
              }
            }
          `),
          'no samples',
          'The empty check comes first, so nothing is indexed.',
        ),
        choose(
          'With p == 0, what is rank - 1 as a std::size_t?',
          [
            'A huge number, because 0 - 1 wraps around',
            '-1, the index before the first sample',
            '0, since rank 0 is clamped to the first sample',
            '3, the index of the largest sample',
          ],
          0,
          'Unsigned arithmetic cannot go negative; it wraps to the maximum value.',
        ),
        typeOutput(
          'p is 101. What is printed?',
          cpp(`
            #include <algorithm>
            #include <cstddef>
            #include <iostream>
            #include <vector>
            int main() {
              std::vector<int> samples = {4, 1, 9, 2};
              std::size_t p = 101;
              if (samples.empty()) {
                std::cout << "no samples\\n";
              } else if (p == 0) {
                std::cout << "invalid percentile\\n";
              } else if (p > 100) {
                std::cout << "invalid percentile\\n";
              } else {
                std::sort(samples.begin(), samples.end());
                std::size_t rank = (p * samples.size() + 99) / 100;
                std::cout << samples[rank - 1] << "\\n";
              }
            }
          `),
          'invalid percentile',
          'p above 100 is outside the domain; unchecked, it would ask for a fifth sample.',
        ),
      ],
    },
  ],
  'cpp-measurement': [
    {
      title: 'Count operations to describe work',
      explanation: [
        'An operation-count model counts how many times the important step runs, for example how many cells a nested loop visits. It describes the algorithm’s work as a function of input size and gives the same answer on every machine.',
        'For r rows and c columns, a full nested loop visits r * c cells; a loop over one triangle of an n x n grid visits n * (n + 1) / 2.',
      ],
      example: {
        language: 'cpp',
        code: cpp(`
          #include <iostream>
          int main() {
            int rows = 3;
            int cols = 4;
            int visits = 0;
            for (int r = 0; r < rows; ++r)
              for (int c = 0; c < cols; ++c) visits += 1;
            std::cout << visits << "\\n";
          }
        `),
        output: '12',
        explanation: 'The inner loop runs 4 times for each of 3 rows.',
      },
      questions: [
        typeOutput(
          'The inner loop starts at the current row. What is printed?',
          cpp(`
            #include <iostream>
            int main() {
              int n = 4;
              int visits = 0;
              for (int r = 0; r < n; ++r)
                for (int c = r; c < n; ++c) visits += 1;
              std::cout << visits << "\\n";
            }
          `),
          '10',
          'The rows contribute 4, 3, 2 and 1 visits: 4 * 5 / 2.',
        ),
        typeOutput(
          'A grid pass is followed by a pass over the rows. What is printed?',
          cpp(`
            #include <iostream>
            int main() {
              int rows = 3;
              int cols = 4;
              int visits = 0;
              for (int r = 0; r < rows; ++r)
                for (int c = 0; c < cols; ++c) visits += 1;
              for (int r = 0; r < rows; ++r) visits += 1;
              std::cout << visits << "\\n";
            }
          `),
          '15',
          'The grid costs 12 visits and the extra pass 3 more.',
        ),
        choose(
          'A model says an algorithm makes 12 million comparisons. What can you conclude without measuring?',
          [
            'It takes 12 ms on any machine',
            'It takes 12 million nanoseconds',
            'How its work grows with input size, not how many milliseconds it takes',
            'It is faster on every machine than any algorithm that makes more comparisons',
          ],
          2,
          'A count describes work; converting it to time needs a measurement.',
        ),
        typeOutput(
          'The same loop runs for 3 rows and then 6 rows. What is printed?',
          cpp(`
            #include <iostream>
            int main() {
              int cols = 4;
              int small = 0;
              int large = 0;
              for (int r = 0; r < 3; ++r)
                for (int c = 0; c < cols; ++c) small += 1;
              for (int r = 0; r < 6; ++r)
                for (int c = 0; c < cols; ++c) large += 1;
              std::cout << small << " " << large << "\\n";
            }
          `),
          '12 24',
          'The work is rows * cols, so doubling the rows doubles the visits.',
        ),
      ],
    },
    {
      title: 'Report modeled work and measured time separately',
      explanation: [
        'Measured time depends on the machine, compiler, caches and load; an operation count does not. Keep them in separate, labeled fields, such as "work: 12 visits" and "time: 37 ns measured on machine X", rather than turning counts into invented nanoseconds.',
        'Two loops with the same count can run at different speeds, for instance when one visits memory contiguously and the other jumps by a large stride.',
      ],
      example: {
        language: 'cpp',
        code: cpp(`
          #include <iostream>
          int main() {
            int rows = 3;
            int cols = 4;
            int by_rows = 0;
            int by_cols = 0;
            for (int r = 0; r < rows; ++r)
              for (int c = 0; c < cols; ++c) by_rows += 1;
            for (int c = 0; c < cols; ++c)
              for (int r = 0; r < rows; ++r) by_cols += 1;
            std::cout << by_rows << " " << by_cols << "\\n";
          }
        `),
        output: '12 12',
        explanation:
          'Row-by-row and column-by-column orders do the same work; on a row-major array they still differ in locality, which only a timing can reveal.',
      },
      questions: [
        choose(
          'A report turns 1,000 loop visits into "1 microsecond" by assuming 1 ns per visit. What is wrong?',
          [
            'Nothing; 1 ns per visit is a safe estimate',
            'It presents an assumption as a measurement',
            'It should assume 2 ns per visit instead',
            'Visits cannot be counted reliably at all',
          ],
          1,
          'Keep the count as work and report time only from a real measurement.',
        ),
        typeOutput(
          'What does this program print?',
          cpp(`
            #include <iostream>
            int main() {
              int visits = 0;
              for (int r = 0; r < 4; ++r)
                for (int c = 0; c < 5; ++c) visits += 1;
              std::cout << "work: " << visits << " visits\\n";
            }
          `),
          'work: 20 visits',
          'The program counts 4 * 5 visits and labels them as work, not time.',
        ),
        choose(
          'Two loops both make 1,000,000 visits, and one runs 4 times faster. What explains this?',
          [
            'One of the two visit counts must be wrong, since time follows work',
            'Counting the visits itself changes the speed',
            'Different access patterns, contiguous versus strided',
            'Nothing can explain it when the counts match',
          ],
          2,
          'Equal work can still differ in cache behavior.',
        ),
        typeOutput(
          'A full grid and its triangle are compared for n = 10. What is printed?',
          cpp(`
            #include <iostream>
            int main() {
              int n = 10;
              int full = 0;
              int triangle = 0;
              for (int r = 0; r < n; ++r)
                for (int c = 0; c < n; ++c) full += 1;
              for (int r = 0; r < n; ++r)
                for (int c = r; c < n; ++c) triangle += 1;
              std::cout << full << " " << triangle << "\\n";
            }
          `),
          '100 55',
          'The full grid is 10 * 10; the triangle includes the diagonal: 10 * 11 / 2.',
        ),
      ],
    },
  ],
};

const orderBook: KnowledgePointModule = {
  'cpp-book-add-level': [
    {
      title: 'Add each order’s size to its price level',
      explanation: [
        'An order book shows, for each price, the total size resting there: a price level. Keeping the levels in a std::map<int, int> from price to total size, `levels[price] += size` creates a missing level with size 0 and then adds to it, so repeated prices accumulate.',
        'Prices here are integer ticks, which keeps the keys exact. To read a level that may not exist, use find: operator[] would insert an empty level as a side effect.',
      ],
      example: {
        language: 'cpp',
        code: cpp(`
          #include <iostream>
          #include <map>
          int main() {
            std::map<int, int> levels;
            levels[100] += 3;
            levels[101] += 8;
            levels[100] += 4;
            std::cout << levels[100] << " " << levels.size() << "\\n";
          }
        `),
        output: '7 2',
        explanation:
          'Both orders at 100 add into one level (3 + 4), and the book has two levels, 100 and 101.',
      },
      questions: [
        typeOutput(
          'Orders arrive as parallel price and size vectors. What is printed?',
          cpp(`
            #include <cstddef>
            #include <iostream>
            #include <map>
            #include <vector>
            int main() {
              std::vector<int> prices = {50, 51, 50, 52, 51};
              std::vector<int> sizes = {2, 5, 6, 1, 4};
              std::map<int, int> levels;
              for (std::size_t i = 0; i < prices.size(); ++i) levels[prices[i]] += sizes[i];
              std::cout << levels[50] << " " << levels[51] << " " << levels.size() << "\\n";
            }
          `),
          '8 9 3',
          'Sizes at the same price add up: 2 + 6 at 50 and 5 + 4 at 51, across three distinct prices.',
        ),
        typeOutput(
          'A missing level is looked up with find. What is printed?',
          cpp(`
            #include <iostream>
            #include <map>
            int main() {
              std::map<int, int> levels;
              levels[100] += 3;
              auto it = levels.find(99);
              int shown = 0;
              if (it != levels.end()) shown = it->second;
              std::cout << shown << " " << levels.size() << "\\n";
            }
          `),
          '0 1',
          'find reports that 99 is absent without inserting it, so the book still has one level.',
        ),
        choose(
          'What does `levels[price] += size` do when price has no level yet?',
          [
            'Creates the level with size 0, then adds size to it',
            'Throws std::out_of_range because the key is missing',
            'Does nothing, because the price has no level yet',
            'Adds size to the nearest existing price level',
          ],
          0,
          'operator[] value-initializes a missing mapped int to 0 before the addition.',
        ),
        typeOutput(
          'A missing level is read with operator[]. What is printed?',
          cpp(`
            #include <iostream>
            #include <map>
            int main() {
              std::map<int, int> levels;
              levels[100] += 3;
              int peek = levels[99];
              std::cout << peek << " " << levels.size() << "\\n";
            }
          `),
          '0 2',
          'operator[] inserted an empty level at 99 just to read it, so the book now has two levels.',
        ),
      ],
    },
    {
      title: 'Reject non-positive sizes before touching the book',
      explanation: [
        'A new order must have a positive size. Adding 0 creates an empty level that shows no liquidity, and adding a negative size can produce negative displayed liquidity, which no real book can have.',
        'Validate first and only then update the level, so a rejected order leaves the book exactly as it was.',
      ],
      example: {
        language: 'cpp',
        code: cpp(`
          #include <cstddef>
          #include <iostream>
          #include <map>
          #include <vector>
          int main() {
            std::vector<int> prices = {100, 101, 100};
            std::vector<int> sizes = {3, -2, 0};
            std::map<int, int> levels;
            int rejected = 0;
            for (std::size_t i = 0; i < prices.size(); ++i) {
              if (sizes[i] > 0) {
                levels[prices[i]] += sizes[i];
              } else {
                rejected += 1;
              }
            }
            std::cout << levels.size() << " " << levels[100] << " " << rejected << "\\n";
          }
        `),
        output: '1 3 2',
        explanation:
          'Only the first order is valid. The -2 and 0 orders are rejected before they can create or change a level.',
      },
      questions: [
        predictOutput(
          'This book adds every size without checking. What does it show at 101?',
          cpp(`
            #include <iostream>
            #include <map>
            int main() {
              std::map<int, int> levels;
              levels[101] += 4;
              levels[101] += -6;
              std::cout << levels[101] << "\\n";
            }
          `),
          ['-2', '4', '0', '6'],
          0,
          'Nothing stops the negative size, so the level shows impossible negative liquidity.',
        ),
        typeOutput(
          'What does this program print?',
          cpp(`
            #include <cstddef>
            #include <iostream>
            #include <map>
            #include <vector>
            int main() {
              std::vector<int> prices = {7, 8, 7, 9};
              std::vector<int> sizes = {5, 0, -1, 2};
              std::map<int, int> levels;
              int rejected = 0;
              for (std::size_t i = 0; i < prices.size(); ++i) {
                if (sizes[i] > 0) {
                  levels[prices[i]] += sizes[i];
                } else {
                  rejected += 1;
                }
              }
              std::cout << levels.size() << " " << rejected << "\\n";
            }
          `),
          '2 2',
          'Only the orders at 7 (size 5) and 9 (size 2) are accepted; the 0 and -1 orders are rejected and create no level.',
        ),
        choose(
          'Why is an order of size 0 rejected rather than added?',
          [
            'Adding 0 throws an exception from the map',
            'Size 0 means a market order, not a resting one',
            'It would double the size of the existing level',
            'It would create a level that shows no liquidity',
          ],
          3,
          'An empty level misrepresents the book; there is nothing to show at that price.',
        ),
        choose(
          'In which order should an add-order handler work?',
          [
            'Update the level, then validate and undo if needed',
            'Update the level and let the display hide negatives',
            'Validate the size, then update the level',
            'Validate only when the level already exists',
          ],
          2,
          'Validating first means a rejected order never changes the book.',
        ),
      ],
    },
  ],
  'cpp-book-cancel-level': [
    {
      title: 'A cancel reduces the level but never below zero',
      explanation: [
        'Cancelling removes resting size from a level: remaining = available - cancelled. A cancel can ask for more than is resting, for example because part of the order has already traded, but the level cannot go negative. A common contract clamps the result at 0.',
        'Compare before subtracting: if the cancel is smaller than what is available, subtract; otherwise the level becomes 0.',
      ],
      example: {
        language: 'cpp',
        code: cpp(`
          #include <iostream>
          int main() {
            int available = 10;
            int cancelled = 4;
            int remaining = 0;
            if (cancelled < available) remaining = available - cancelled;
            std::cout << remaining << "\\n";
          }
        `),
        output: '6',
        explanation:
          'The cancel is smaller than the level, so 4 is removed from 10.',
      },
      questions: [
        typeOutput(
          'The cancel is larger than the level. What is printed?',
          cpp(`
            #include <iostream>
            int main() {
              int available = 3;
              int cancelled = 9;
              int remaining = 0;
              if (cancelled < available) remaining = available - cancelled;
              std::cout << remaining << "\\n";
            }
          `),
          '0',
          'The over-cancel is clamped: the level becomes 0 rather than -6.',
        ),
        typeOutput(
          'The cancel equals the level. What is printed?',
          cpp(`
            #include <iostream>
            int main() {
              int available = 5;
              int cancelled = 5;
              int remaining = 0;
              if (cancelled < available) remaining = available - cancelled;
              std::cout << remaining << "\\n";
            }
          `),
          '0',
          'Cancelling everything that rests leaves an empty level.',
        ),
        typeOutput(
          'Three cancels hit one level in turn. What is printed?',
          cpp(`
            #include <iostream>
            int main() {
              int level = 12;
              int cancel = 5;
              if (cancel < level) level = level - cancel; else level = 0;
              std::cout << level << " ";
              cancel = 4;
              if (cancel < level) level = level - cancel; else level = 0;
              std::cout << level << " ";
              cancel = 6;
              if (cancel < level) level = level - cancel; else level = 0;
              std::cout << level << "\\n";
            }
          `),
          '7 3 0',
          '12 - 5 = 7 and 7 - 4 = 3; the last cancel asks for 6 of 3, so the level clamps to 0.',
        ),
        choose(
          'Why might a cancel ask for more than the level currently holds?',
          [
            'The book double counts every order it receives',
            'Cancels add size to the level instead of removing it',
            'It cannot happen with a correctly working book',
            'Some of the order may already have traded',
          ],
          3,
          'Fills and cancels race in real markets, so over-cancels must be handled.',
        ),
      ],
    },
    {
      title: 'Validate inputs and follow the stated over-cancel contract',
      explanation: [
        'Negative available or cancelled sizes are invalid input and should be rejected before any arithmetic. For an over-cancel, clamping to 0 and rejecting the cancel are both reasonable contracts; the code must implement the one that is stated.',
        'Comparing before subtracting matters even more for unsigned sizes: with unsigned arithmetic, 3 - 9 does not go negative but wraps around to a huge positive number.',
      ],
      example: {
        language: 'cpp',
        code: cpp(`
          #include <iostream>
          int main() {
            int available = 8;
            int cancelled = -3;
            if (available < 0) {
              std::cout << "invalid\\n";
            } else if (cancelled < 0) {
              std::cout << "invalid\\n";
            } else if (cancelled > available) {
              std::cout << "rejected\\n";
            } else {
              std::cout << available - cancelled << "\\n";
            }
          }
        `),
        output: 'invalid',
        explanation:
          'A negative cancel is caught by the validation before the over-cancel rule or any subtraction runs.',
      },
      questions: [
        typeOutput(
          'This handler rejects over-cancels. What does it print for a cancel of 9?',
          cpp(`
            #include <iostream>
            int main() {
              int available = 8;
              int cancelled = 9;
              if (available < 0) {
                std::cout << "invalid\\n";
              } else if (cancelled < 0) {
                std::cout << "invalid\\n";
              } else if (cancelled > available) {
                std::cout << "rejected\\n";
              } else {
                std::cout << available - cancelled << "\\n";
              }
            }
          `),
          'rejected',
          'Both inputs are valid, but the cancel exceeds the level, and this contract rejects it rather than clamping.',
        ),
        typeOutput(
          'The same handler receives a cancel of exactly 8. What is printed?',
          cpp(`
            #include <iostream>
            int main() {
              int available = 8;
              int cancelled = 8;
              if (available < 0) {
                std::cout << "invalid\\n";
              } else if (cancelled < 0) {
                std::cout << "invalid\\n";
              } else if (cancelled > available) {
                std::cout << "rejected\\n";
              } else {
                std::cout << available - cancelled << "\\n";
              }
            }
          `),
          '0',
          'Cancelling exactly what rests is allowed and leaves 0.',
        ),
        choose(
          'Sizes are stored as unsigned, and code computes available - cancelled with available = 3 and cancelled = 9. What is the result?',
          [
            '-6, the same as with signed sizes',
            '0, because unsigned values cannot go below zero',
            'A huge positive number, since unsigned math wraps',
            'A compile error for mixing the two sizes',
          ],
          2,
          'Unsigned arithmetic is modular, so the "negative" result wraps to a value near the maximum.',
        ),
        choose(
          'Which statement about the over-cancel contract is right?',
          [
            'Clamping and rejecting are both valid; code must follow the stated one',
            'Over-cancels must always produce negative levels',
            'Over-cancels should sometimes be clamped and sometimes ignored, at random',
            'The level must be deleted and recreated',
          ],
          0,
          'What matters is a clear, consistently implemented rule.',
        ),
      ],
    },
  ],
  'cpp-book-best-bid': [
    {
      title: 'The best bid is the last key of the map',
      explanation: [
        'A std::map keeps its keys in ascending order. In a bid book keyed by price, the best (highest) bid is therefore the last entry; rbegin() returns a reverse iterator to it, so rbegin()->first is its price and rbegin()->second its size.',
        'For asks the best price is the lowest, which is begin()->first.',
      ],
      example: {
        language: 'cpp',
        code: cpp(`
          #include <iostream>
          #include <map>
          int main() {
            std::map<int, int> bids = {{101, 2}, {105, 3}, {103, 8}};
            std::cout << bids.rbegin()->first << " " << bids.rbegin()->second << "\\n";
          }
        `),
        output: '105 3',
        explanation:
          'The map orders the prices 101, 103, 105; the last one, 105, has size 3.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          cpp(`
            #include <iostream>
            #include <map>
            int main() {
              std::map<int, int> bids = {{99, 4}, {97, 1}, {98, 6}};
              std::cout << bids.rbegin()->first << " " << bids.rbegin()->second << "\\n";
            }
          `),
          '99 4',
          'The highest bid price is 99, resting with size 4, whatever order the levels were listed in.',
        ),
        typeOutput(
          'What does this program print?',
          cpp(`
            #include <iostream>
            #include <map>
            int main() {
              std::map<int, int> asks = {{106, 1}, {104, 7}, {109, 2}};
              std::cout << asks.begin()->first << "\\n";
            }
          `),
          '104',
          'The best ask is the lowest price, the first key of the ascending map.',
        ),
        typeOutput(
          'Two new bid levels are added. What is printed?',
          cpp(`
            #include <iostream>
            #include <map>
            int main() {
              std::map<int, int> bids = {{100, 2}, {101, 3}};
              bids[103] += 1;
              bids[99] += 9;
              std::cout << bids.rbegin()->first << " " << bids.begin()->first << "\\n";
            }
          `),
          '103 99',
          'The map re-sorts on insertion: 103 is now the highest bid and 99 the lowest.',
        ),
        choose(
          'Why is the best ask at begin() but the best bid at rbegin()?',
          [
            'Asks are stored in reverse order, so begin() is their top',
            'Keys sort ascending; best ask is lowest, best bid is highest',
            'rbegin() is faster than begin() for maps of bids',
            'Bids are kept unsorted, so the last one inserted is best',
          ],
          1,
          'Both sides use the same ascending map; they differ in which end is best.',
        ),
      ],
    },
    {
      title: 'Check for an empty side first',
      explanation: [
        'On an empty map, rbegin() equals rend(), and dereferencing it is undefined behavior; the same holds for begin() on an empty ask side. Check empty() first.',
        'Then decide what an empty side means for the caller, for example printing "no bid" or returning a documented sentinel such as -1.',
      ],
      example: {
        language: 'cpp',
        code: cpp(`
          #include <iostream>
          #include <map>
          int main() {
            std::map<int, int> bids;
            if (bids.empty()) {
              std::cout << "no bid\\n";
            } else {
              std::cout << bids.rbegin()->first << "\\n";
            }
          }
        `),
        output: 'no bid',
        explanation:
          'The empty check prevents dereferencing an iterator that points at no element.',
      },
      questions: [
        choose(
          'What does `bids.rbegin()->first` do on an empty map?',
          [
            'Returns 0, the value of an empty level',
            'Throws std::out_of_range for the empty map',
            'It reads a missing element: undefined behavior',
            'Returns the lowest possible int as a sentinel',
          ],
          2,
          'An empty map has no last element, and iterators do not check.',
        ),
        typeOutput(
          'What does this program print?',
          cpp(`
            #include <iostream>
            #include <map>
            int main() {
              std::map<int, int> bids = {{100, 1}};
              if (bids.empty()) {
                std::cout << "no bid\\n";
              } else {
                std::cout << bids.rbegin()->first << "\\n";
              }
            }
          `),
          '100',
          'A single level is both the lowest and the highest bid.',
        ),
        typeOutput(
          'This version reports a missing bid as -1. What is printed?',
          cpp(`
            #include <iostream>
            #include <map>
            int main() {
              std::map<int, int> bids;
              int best = -1;
              if (!bids.empty()) best = bids.rbegin()->first;
              std::cout << best << "\\n";
            }
          `),
          '-1',
          'The book is empty, so the documented sentinel is kept.',
        ),
        choose(
          'Which check must come before reading the best bid?',
          [
            'bids.size() > 1',
            'bids.count(0) == 0',
            'bids.begin() == bids.rbegin()',
            'bids.empty() is false',
          ],
          3,
          'Any nonempty map has a last element to read.',
        ),
      ],
    },
  ],
  'cpp-order-book': [
    {
      title: 'The spread is best ask minus best bid',
      explanation: [
        'The quoted spread is the gap between the best ask (lowest sell price) and the best bid (highest buy price): spread = asks.begin()->first - bids.rbegin()->first. In a normal book it is positive.',
        'The mid price, (best bid + best ask) / 2, sits in the middle of the spread.',
      ],
      example: {
        language: 'cpp',
        code: cpp(`
          #include <iostream>
          #include <map>
          int main() {
            std::map<int, int> bids = {{100, 2}, {102, 1}};
            std::map<int, int> asks = {{105, 3}, {108, 4}};
            std::cout << asks.begin()->first - bids.rbegin()->first << "\\n";
          }
        `),
        output: '3',
        explanation: 'The best ask is 105 and the best bid is 102.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          cpp(`
            #include <iostream>
            #include <map>
            int main() {
              std::map<int, int> bids = {{99, 5}, {101, 2}};
              std::map<int, int> asks = {{104, 1}, {103, 6}};
              std::cout << asks.begin()->first - bids.rbegin()->first << "\\n";
            }
          `),
          '2',
          'The best ask is 103 and the best bid 101.',
        ),
        typeOutput(
          'The second number uses the wrong end of each side. What is printed?',
          cpp(`
            #include <iostream>
            #include <map>
            int main() {
              std::map<int, int> bids = {{98, 1}, {100, 1}};
              std::map<int, int> asks = {{101, 1}, {105, 1}};
              std::cout << asks.begin()->first - bids.rbegin()->first << " "
                        << asks.rbegin()->first - bids.begin()->first << "\\n";
            }
          `),
          '1 7',
          'The quoted spread is 101 - 100; the second expression measures the widest prices instead, 105 - 98.',
        ),
        typeOutput(
          'What does this program print?',
          cpp(`
            #include <iostream>
            #include <map>
            int main() {
              std::map<int, int> bids = {{100, 3}};
              std::map<int, int> asks = {{104, 2}};
              int bid = bids.rbegin()->first;
              int ask = asks.begin()->first;
              std::cout << ask - bid << " " << (bid + ask) / 2 << "\\n";
            }
          `),
          '4 102',
          'The spread is 4 ticks and the mid price is halfway between 100 and 104.',
        ),
        choose(
          'Which formula gives the quoted spread?',
          [
            'best bid − best ask',
            'highest ask − lowest bid',
            '(best ask + best bid) / 2',
            'best ask − best bid',
          ],
          3,
          'It is the distance from the highest bid up to the lowest ask.',
        ),
      ],
    },
    {
      title: 'Require both sides and an uncrossed book',
      explanation: [
        'A spread needs a best bid and a best ask. If either side is empty there is no spread; treating the missing side as price 0 produces a meaningless number.',
        'If the best ask is at or below the best bid, the book is locked or crossed: buyers and sellers agree on price, so those orders should already have traded. Report such a book as invalid instead of quoting a zero or negative spread.',
      ],
      example: {
        language: 'cpp',
        code: cpp(`
          #include <iostream>
          #include <map>
          int main() {
            std::map<int, int> bids = {{100, 2}};
            std::map<int, int> asks = {{99, 3}};
            if (bids.empty()) {
              std::cout << "no spread\\n";
            } else if (asks.empty()) {
              std::cout << "no spread\\n";
            } else if (asks.begin()->first <= bids.rbegin()->first) {
              std::cout << "crossed\\n";
            } else {
              std::cout << asks.begin()->first - bids.rbegin()->first << "\\n";
            }
          }
        `),
        output: 'crossed',
        explanation:
          'Someone is offering to sell at 99 while someone bids 100, so the book is crossed; -1 would be no real spread.',
      },
      questions: [
        typeOutput(
          'The bid side is empty. What is printed?',
          cpp(`
            #include <iostream>
            #include <map>
            int main() {
              std::map<int, int> bids;
              std::map<int, int> asks = {{105, 3}};
              if (bids.empty()) {
                std::cout << "no spread\\n";
              } else if (asks.empty()) {
                std::cout << "no spread\\n";
              } else if (asks.begin()->first <= bids.rbegin()->first) {
                std::cout << "crossed\\n";
              } else {
                std::cout << asks.begin()->first - bids.rbegin()->first << "\\n";
              }
            }
          `),
          'no spread',
          'Without a bid there is nothing to measure the ask against.',
        ),
        typeOutput(
          'What does this program print?',
          cpp(`
            #include <iostream>
            #include <map>
            int main() {
              std::map<int, int> bids = {{100, 2}};
              std::map<int, int> asks = {{103, 1}};
              if (bids.empty()) {
                std::cout << "no spread\\n";
              } else if (asks.empty()) {
                std::cout << "no spread\\n";
              } else if (asks.begin()->first <= bids.rbegin()->first) {
                std::cout << "crossed\\n";
              } else {
                std::cout << asks.begin()->first - bids.rbegin()->first << "\\n";
              }
            }
          `),
          '3',
          'Both sides exist and the ask is above the bid, so the spread is 3.',
        ),
        choose(
          'If an empty bid side were treated as price 0, what would a book with best ask 105 report?',
          [
            'A spread of 105 that looks like a wide market',
            'A spread of 0, since one side is missing',
            'A spread of -105, a crossed book',
            'No spread, because 0 is never a price',
          ],
          0,
          'The invented 0 turns "no data" into a plausible-looking but false number.',
        ),
        typeOutput(
          'Both sides sit at the same price. What is printed?',
          cpp(`
            #include <iostream>
            #include <map>
            int main() {
              std::map<int, int> bids = {{100, 1}};
              std::map<int, int> asks = {{100, 2}};
              if (bids.empty()) {
                std::cout << "no spread\\n";
              } else if (asks.empty()) {
                std::cout << "no spread\\n";
              } else if (asks.begin()->first <= bids.rbegin()->first) {
                std::cout << "crossed\\n";
              } else {
                std::cout << asks.begin()->first - bids.rbegin()->first << "\\n";
              }
            }
          `),
          'crossed',
          'An ask equal to the bid is a locked book, which this check reports with the crossed case.',
        ),
      ],
    },
  ],
};

const ringBuffers: KnowledgePointModule = {
  'cpp-ring-wrap': [
    {
      title: 'Advance an index with (i + 1) % capacity',
      explanation: [
        'A ring buffer reuses a fixed number of slots, numbered 0 to capacity - 1. After the last slot the index wraps back to 0. `(i + 1) % capacity` does exactly that: it adds one and wraps when the result reaches capacity.',
        'Advancing k steps at once is `(i + k) % capacity`.',
      ],
      example: {
        language: 'cpp',
        code: cpp(`
          #include <iostream>
          int main() {
            int capacity = 3;
            int i = 1;
            i = (i + 1) % capacity;
            std::cout << i << " ";
            i = (i + 1) % capacity;
            std::cout << i << " ";
            i = (i + 1) % capacity;
            std::cout << i << "\\n";
          }
        `),
        output: '2 0 1',
        explanation:
          'From 1 the index moves to 2, wraps from 2 to 0, then continues to 1.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          cpp(`
            #include <iostream>
            int main() {
              int capacity = 4;
              int i = 3;
              std::cout << (i + 1) % capacity << "\\n";
            }
          `),
          '0',
          'Slot 3 is the last of four, so the next index wraps to 0.',
        ),
        typeOutput(
          'What does this program print?',
          cpp(`
            #include <iostream>
            int main() {
              int capacity = 5;
              int i = 4;
              i = (i + 1) % capacity;
              std::cout << i << " ";
              i = (i + 1) % capacity;
              std::cout << i << "\\n";
            }
          `),
          '0 1',
          'From the last slot 4 the index wraps to 0 and then advances to 1.',
        ),
        typeOutput(
          'The index jumps 7 steps at once. What is printed?',
          cpp(`
            #include <iostream>
            int main() {
              int capacity = 4;
              int i = 2;
              int k = 7;
              std::cout << (i + k) % capacity << "\\n";
            }
          `),
          '1',
          '2 + 7 = 9, and 9 % 4 is 1: two full laps plus one more slot.',
        ),
        choose(
          'What happens if the index is advanced with i + 1 and no % capacity?',
          [
            'It walks past the last slot of the storage',
            'It wraps around automatically',
            'It stops at capacity - 1',
            'It resets to 0 when it reaches capacity',
          ],
          0,
          'Nothing brings the index back; it soon indexes outside the buffer.',
        ),
      ],
    },
    {
      title: 'Reject zero capacity and out-of-range indices',
      explanation: [
        'A ring with capacity 0 has no slots, and `% 0` is undefined behavior, so capacity must be positive. The current index must also be a real slot: 0 <= current < capacity.',
        'An index outside that range means the ring’s state is already corrupt; reporting it is safer than quietly wrapping it back into range.',
      ],
      example: {
        language: 'cpp',
        code: cpp(`
          #include <iostream>
          int main() {
            int capacity = 0;
            int current = 0;
            if (capacity <= 0) {
              std::cout << "invalid capacity\\n";
            } else if (current < 0) {
              std::cout << "invalid index\\n";
            } else if (current >= capacity) {
              std::cout << "invalid index\\n";
            } else {
              std::cout << (current + 1) % capacity << "\\n";
            }
          }
        `),
        output: 'invalid capacity',
        explanation:
          'The capacity check runs first, so % 0 is never evaluated.',
      },
      questions: [
        typeOutput(
          'The index equals the capacity. What is printed?',
          cpp(`
            #include <iostream>
            int main() {
              int capacity = 3;
              int current = 3;
              if (capacity <= 0) {
                std::cout << "invalid capacity\\n";
              } else if (current < 0) {
                std::cout << "invalid index\\n";
              } else if (current >= capacity) {
                std::cout << "invalid index\\n";
              } else {
                std::cout << (current + 1) % capacity << "\\n";
              }
            }
          `),
          'invalid index',
          'Slots run from 0 to 2, so 3 is not a slot of this ring.',
        ),
        typeOutput(
          'What does this program print?',
          cpp(`
            #include <iostream>
            int main() {
              int capacity = 3;
              int current = 2;
              if (capacity <= 0) {
                std::cout << "invalid capacity\\n";
              } else if (current < 0) {
                std::cout << "invalid index\\n";
              } else if (current >= capacity) {
                std::cout << "invalid index\\n";
              } else {
                std::cout << (current + 1) % capacity << "\\n";
              }
            }
          `),
          '0',
          'The inputs are valid, and the last slot wraps to 0.',
        ),
        choose(
          'What does `(i + 1) % capacity` do when capacity is 0?',
          [
            'Returns i + 1',
            'Returns 0',
            'Throws std::domain_error',
            'It is undefined behavior',
          ],
          3,
          'Remainder by zero is undefined, so capacity must be checked first.',
        ),
        choose(
          'Why reject current == capacity, even though (current + 1) % capacity would be a valid slot?',
          [
            'current is not a slot, so the state is already wrong',
            'It is not necessary, since the result is in range',
            'It would divide by zero when current equals capacity',
            'The result would be negative for the last slot',
          ],
          0,
          'Silently wrapping an impossible index hides a bug elsewhere.',
        ),
      ],
    },
  ],
  'cpp-ring-bounded-push': [
    {
      title: 'Track a write index and an occupied count',
      explanation: [
        'A ring buffer stores items in a fixed vector of slots. A push writes at the write index, advances it with (write + 1) % capacity, and increases the count of occupied slots.',
        'The count is needed because the write index alone cannot tell an empty ring from a full one: after capacity pushes, write is back where it started.',
      ],
      example: {
        language: 'cpp',
        code: cpp(`
          #include <cstddef>
          #include <iostream>
          #include <vector>
          int main() {
            std::vector<int> storage(4, 0);
            std::size_t write = 0;
            std::size_t count = 0;
            std::vector<int> input = {7, 8};
            for (std::size_t i = 0; i < input.size(); ++i) {
              storage[write] = input[i];
              write = (write + 1) % storage.size();
              count += 1;
            }
            std::cout << write << " " << count << " " << storage[1] << "\\n";
          }
        `),
        output: '2 2 8',
        explanation:
          '7 goes to slot 0 and 8 to slot 1; write now points at slot 2 and two slots are occupied.',
      },
      questions: [
        typeOutput(
          'The write index starts at slot 3 of 4. What is printed?',
          cpp(`
            #include <cstddef>
            #include <iostream>
            #include <vector>
            int main() {
              std::vector<int> storage(4, 0);
              std::size_t write = 3;
              std::size_t count = 0;
              std::vector<int> input = {5, 6};
              for (std::size_t i = 0; i < input.size(); ++i) {
                storage[write] = input[i];
                write = (write + 1) % storage.size();
                count += 1;
              }
              std::cout << write << " " << storage[0] << "\\n";
            }
          `),
          '1 6',
          '5 fills slot 3, the index wraps, 6 fills slot 0, and write ends at 1.',
        ),
        typeOutput(
          'Three items are pushed into an empty ring of capacity 3. What is printed?',
          cpp(`
            #include <cstddef>
            #include <iostream>
            #include <vector>
            int main() {
              std::vector<int> storage(3, 0);
              std::size_t write = 0;
              std::size_t count = 0;
              std::vector<int> input = {1, 2, 3};
              for (std::size_t i = 0; i < input.size(); ++i) {
                storage[write] = input[i];
                write = (write + 1) % storage.size();
                count += 1;
              }
              std::cout << write << " " << count << "\\n";
            }
          `),
          '0 3',
          'write wraps back to 0, exactly where it was when the ring was empty; only count shows it is full.',
        ),
        choose(
          'After 3 pushes into an empty ring of capacity 3, write is 0 again. Why keep a separate count?',
          [
            'The count is only kept for statistics and logging',
            'write must never return to 0 while items remain',
            'write is the same when empty and when full',
            'count replaces the storage once the ring is full',
          ],
          2,
          'Position alone is ambiguous after a full lap.',
        ),
        typeOutput(
          'What does this program print?',
          cpp(`
            #include <cstddef>
            #include <iostream>
            #include <vector>
            int main() {
              std::vector<int> storage(3, 0);
              std::size_t write = 0;
              std::size_t count = 0;
              std::vector<int> input = {1, 2};
              for (std::size_t i = 0; i < input.size(); ++i) {
                storage[write] = input[i];
                write = (write + 1) % storage.size();
                count += 1;
              }
              std::cout << storage[0] << " " << storage[1] << " " << storage[2] << "\\n";
            }
          `),
          '1 2 0',
          'Two pushes fill slots 0 and 1; slot 2 keeps its initial 0.',
        ),
      ],
    },
    {
      title: 'Reject a push into a full ring',
      explanation: [
        'A ring is full when count == capacity. A bounded ring must then reject the push and report it to the producer; writing anyway would overwrite the oldest unread item and lose it silently.',
        'Advance write and count only after a push is accepted, so a rejected push leaves the ring exactly as it was.',
      ],
      example: {
        language: 'cpp',
        code: cpp(`
          #include <cstddef>
          #include <iostream>
          #include <vector>
          int main() {
            std::vector<int> storage(3, 0);
            std::size_t write = 0;
            std::size_t count = 0;
            int rejected = 0;
            std::vector<int> input = {1, 2, 3, 4, 5};
            for (std::size_t i = 0; i < input.size(); ++i) {
              if (count == storage.size()) {
                rejected += 1;
              } else {
                storage[write] = input[i];
                write = (write + 1) % storage.size();
                count += 1;
              }
            }
            std::cout << count << " " << rejected << " " << storage[0] << "\\n";
          }
        `),
        output: '3 2 1',
        explanation:
          'The first three items fill the ring; 4 and 5 are rejected, so the oldest item 1 is still in slot 0.',
      },
      questions: [
        typeOutput(
          'Three items go into a ring of capacity 4. What is printed?',
          cpp(`
            #include <cstddef>
            #include <iostream>
            #include <vector>
            int main() {
              std::vector<int> storage(4, 0);
              std::size_t write = 0;
              std::size_t count = 0;
              int rejected = 0;
              std::vector<int> input = {1, 2, 3};
              for (std::size_t i = 0; i < input.size(); ++i) {
                if (count == storage.size()) {
                  rejected += 1;
                } else {
                  storage[write] = input[i];
                  write = (write + 1) % storage.size();
                  count += 1;
                }
              }
              std::cout << count << " " << rejected << " " << storage[0] << "\\n";
            }
          `),
          '3 0 1',
          'The ring never fills, so all three pushes are accepted.',
        ),
        typeOutput(
          'This ring writes without checking whether it is full. What is printed?',
          cpp(`
            #include <cstddef>
            #include <iostream>
            #include <vector>
            int main() {
              std::vector<int> storage(3, 0);
              std::size_t write = 0;
              std::vector<int> input = {1, 2, 3, 4, 5};
              for (std::size_t i = 0; i < input.size(); ++i) {
                storage[write] = input[i];
                write = (write + 1) % storage.size();
              }
              std::cout << storage[0] << " " << storage[1] << " " << storage[2] << "\\n";
            }
          `),
          '4 5 3',
          '4 and 5 wrap around and overwrite the unread 1 and 2.',
        ),
        choose(
          'A producer’s push finds count == capacity. What should a bounded ring do?',
          [
            'Overwrite the oldest unread value and report success',
            'Reject the push and report it to the producer',
            'Grow the storage',
            'Advance write but leave count unchanged',
          ],
          1,
          'A bounded ring keeps its capacity and makes the failure visible.',
        ),
        choose(
          'Why advance write only after a push is accepted?',
          [
            'write must always lead count by one slot',
            'It saves one modulo operation per rejected push',
            'It does not matter when write advances',
            'A rejected push must leave the ring exactly as it was',
          ],
          3,
          'Moving write for a rejected item would desynchronize the index from the stored data.',
        ),
      ],
    },
  ],
  'cpp-ring-fifo-pop': [
    {
      title: 'Pop at the read index, then advance it',
      explanation: [
        'A pop takes the item at the read index, advances read with (read + 1) % capacity, and decreases count. Because push advances write the same way, items come out in the order they went in: first in, first out.',
        'Draining the ring is a loop that pops while count is not 0.',
      ],
      example: {
        language: 'cpp',
        code: cpp(`
          #include <cstddef>
          #include <iostream>
          #include <vector>
          int main() {
            std::vector<int> storage(4, 0);
            std::size_t write = 0;
            std::size_t read = 0;
            std::size_t count = 0;
            std::vector<int> input = {1, 2, 3};
            for (std::size_t i = 0; i < input.size(); ++i) {
              storage[write] = input[i];
              write = (write + 1) % storage.size();
              count += 1;
            }
            while (count != 0) {
              std::cout << storage[read] << " ";
              read = (read + 1) % storage.size();
              count -= 1;
            }
            std::cout << "\\n";
          }
        `),
        output: '1 2 3',
        explanation:
          'read follows write around the ring, so the pops return 1, 2, 3.',
      },
      questions: [
        typeOutput(
          'Three items are pushed and one is popped. What is printed?',
          cpp(`
            #include <cstddef>
            #include <iostream>
            #include <vector>
            int main() {
              std::vector<int> storage(4, 0);
              std::size_t write = 0;
              std::size_t read = 0;
              std::size_t count = 0;
              std::vector<int> input = {5, 6, 7};
              for (std::size_t i = 0; i < input.size(); ++i) {
                storage[write] = input[i];
                write = (write + 1) % storage.size();
                count += 1;
              }
              int popped = storage[read];
              read = (read + 1) % storage.size();
              count -= 1;
              std::cout << popped << " " << read << " " << count << "\\n";
            }
          `),
          '5 1 2',
          'The oldest item, 5, comes out first; read moves to slot 1 and two items remain.',
        ),
        typeOutput(
          'Pushes and pops interleave in a ring of capacity 3. What is printed?',
          cpp(`
            #include <cstddef>
            #include <iostream>
            #include <vector>
            int main() {
              std::vector<int> storage(3, 0);
              std::size_t write = 0;
              std::size_t read = 0;
              std::size_t count = 0;
              storage[write] = 1;
              write = (write + 1) % storage.size();
              count += 1;
              storage[write] = 2;
              write = (write + 1) % storage.size();
              count += 1;
              std::cout << storage[read] << " ";
              read = (read + 1) % storage.size();
              count -= 1;
              storage[write] = 3;
              write = (write + 1) % storage.size();
              count += 1;
              storage[write] = 4;
              write = (write + 1) % storage.size();
              count += 1;
              while (count != 0) {
                std::cout << storage[read] << " ";
                read = (read + 1) % storage.size();
                count -= 1;
              }
              std::cout << "\\n";
            }
          `),
          '1 2 3 4',
          '4 wraps into slot 0, but read also wraps, so the items still come out in push order.',
        ),
        choose(
          'In which order does a ring buffer pop its items?',
          [
            'Most recent first',
            'In the order they were pushed',
            'Smallest first',
            'In storage-slot order starting at slot 0',
          ],
          1,
          'read and write move the same way around the ring, which gives FIFO order.',
        ),
        typeOutput(
          'Two items are pushed and both are popped. What is printed?',
          cpp(`
            #include <cstddef>
            #include <iostream>
            #include <vector>
            int main() {
              std::vector<int> storage(2, 0);
              std::size_t write = 0;
              std::size_t read = 0;
              std::size_t count = 0;
              std::vector<int> input = {9, 8};
              for (std::size_t i = 0; i < input.size(); ++i) {
                storage[write] = input[i];
                write = (write + 1) % storage.size();
                count += 1;
              }
              int total = 0;
              while (count != 0) {
                total += storage[read];
                read = (read + 1) % storage.size();
                count -= 1;
              }
              std::cout << total << " " << count << "\\n";
            }
          `),
          '17 0',
          'Both items are popped, so their sum is 17 and the ring is empty again.',
        ),
      ],
    },
    {
      title: 'Reject a pop from an empty ring',
      explanation: [
        'When count is 0 there is nothing to pop. The slot at read still holds whatever was last stored there, because popping only moves read and count; the slot is overwritten by a later push. Reading it would hand out a stale item a second time.',
        'An unchecked pop also breaks the bookkeeping: with a std::size_t count, count -= 1 from 0 wraps around to the largest value, and the ring looks full of garbage.',
      ],
      example: {
        language: 'cpp',
        code: cpp(`
          #include <cstddef>
          #include <iostream>
          #include <vector>
          int main() {
            std::vector<int> storage(2, 0);
            std::size_t write = 0;
            std::size_t read = 0;
            std::size_t count = 0;
            storage[write] = 42;
            write = (write + 1) % storage.size();
            count += 1;
            std::cout << storage[read] << " ";
            read = (read + 1) % storage.size();
            count -= 1;
            if (count == 0) {
              std::cout << "empty\\n";
            } else {
              std::cout << storage[read] << "\\n";
            }
          }
        `),
        output: '42 empty',
        explanation:
          'After the only item is popped, count is 0, so the second pop reports empty instead of reading a slot.',
      },
      questions: [
        typeOutput(
          'The second pop does not check count. What is printed?',
          cpp(`
            #include <cstddef>
            #include <iostream>
            #include <vector>
            int main() {
              std::vector<int> storage(1, 0);
              std::size_t read = 0;
              std::size_t count = 0;
              storage[0] = 5;
              count += 1;
              std::cout << storage[read] << " ";
              read = (read + 1) % storage.size();
              count -= 1;
              std::cout << storage[read] << "\\n";
              read = (read + 1) % storage.size();
              count -= 1;
            }
          `),
          '5 5',
          'The slot still holds 5, so the unchecked pop hands out the same item twice.',
        ),
        typeOutput(
          'This time the second pop checks count. What is printed?',
          cpp(`
            #include <cstddef>
            #include <iostream>
            #include <vector>
            int main() {
              std::vector<int> storage(1, 0);
              std::size_t read = 0;
              std::size_t count = 0;
              storage[0] = 5;
              count += 1;
              std::cout << storage[read] << " ";
              read = (read + 1) % storage.size();
              count -= 1;
              if (count == 0) {
                std::cout << "empty\\n";
              } else {
                std::cout << storage[read] << "\\n";
              }
            }
          `),
          '5 empty',
          'One item was pushed and popped; the check stops a second pop.',
        ),
        choose(
          'What does `count -= 1` do to a std::size_t count that is already 0?',
          [
            'It stays 0, because size_t cannot go lower',
            'It becomes -1, an empty marker',
            'It wraps to the largest std::size_t value',
            'It throws std::underflow_error',
          ],
          2,
          'Unsigned arithmetic wraps around instead of going negative.',
        ),
        choose(
          'After an item is popped, what happens to its slot?',
          [
            'It is cleared to 0 so stale data cannot leak',
            'It keeps its old value until a push overwrites it',
            'It is freed and later reallocated',
            'It is erased from the vector, shrinking it',
          ],
          1,
          'Popping only moves read and count; the storage itself is untouched.',
        ),
      ],
    },
  ],
  'cpp-ring-buffer': [
    {
      title: 'The producer publishes each slot with a release store',
      explanation: [
        'A single-producer, single-consumer (SPSC) ring can work without a mutex. The producer fills slot write % capacity and then stores write + 1 with memory_order_release. The consumer loads write with memory_order_acquire; once it sees a value larger than its own read position, the slot write is visible and the slot can be read.',
        'Here write and read keep counting up and only their remainder picks a slot. With exactly one producer, only one thread ever stores to write, so a plain store is enough; no read-modify-write is needed.',
      ],
      example: {
        language: 'cpp',
        code: cpp(`
          #include <atomic>
          #include <cstddef>
          #include <iostream>
          #include <thread>
          #include <vector>
          int main() {
            std::vector<int> slots(8, 0);
            std::atomic<std::size_t> write{0};
            std::thread producer([&slots, &write] {
              for (int value = 1; value <= 5; ++value) {
                std::size_t position = write.load(std::memory_order_relaxed);
                slots[position % slots.size()] = value * 10;
                write.store(position + 1, std::memory_order_release);
              }
            });
            int total = 0;
            std::size_t read = 0;
            while (read < 5) {
              while (write.load(std::memory_order_acquire) == read) std::this_thread::yield();
              total += slots[read % slots.size()];
              read += 1;
            }
            producer.join();
            std::cout << total << "\\n";
          }
        `),
        output: '150',
        explanation:
          'The ring has room for all five items, so only publication matters here: each acquire that sees a larger write makes the slot’s value visible, and the consumer adds 10 + 20 + 30 + 40 + 50.',
      },
      questions: [
        typeOutput(
          'The consumer records the order it receives items in. What is printed?',
          cpp(`
            #include <atomic>
            #include <cstddef>
            #include <iostream>
            #include <thread>
            #include <vector>
            int main() {
              std::vector<int> slots(4, 0);
              std::atomic<std::size_t> write{0};
              std::thread producer([&slots, &write] {
                for (int value = 1; value <= 3; ++value) {
                  std::size_t position = write.load(std::memory_order_relaxed);
                  slots[position % slots.size()] = value;
                  write.store(position + 1, std::memory_order_release);
                }
              });
              int encoded = 0;
              std::size_t read = 0;
              while (read < 3) {
                while (write.load(std::memory_order_acquire) == read) std::this_thread::yield();
                encoded = encoded * 10 + slots[read % slots.size()];
                read += 1;
              }
              producer.join();
              std::cout << encoded << "\\n";
            }
          `),
          '123',
          'The consumer reads positions 0, 1, 2 in order, and each holds its published value.',
        ),
        choose(
          'Why does the producer store write with memory_order_release after filling the slot?',
          [
            'To make the slot write itself atomic',
            'To wake the consumer up as soon as possible',
            'So an acquiring consumer also sees the slot',
            'So the producer can read write again later',
          ],
          2,
          'Release orders the earlier slot write before the index update that the consumer acquires.',
        ),
        choose(
          'The consumer loads write with memory_order_relaxed instead of acquire. What breaks?',
          [
            'Nothing; relaxed loads still see every earlier write',
            'Reading the slot can race with the producer’s write',
            'The loop never ends because relaxed values never update',
            'The producer deadlocks waiting for an acquire',
          ],
          1,
          'Without acquire there is no synchronizes-with edge, so the plain slot read is unordered with the write.',
        ),
        choose(
          'Why can write be updated with a plain store instead of fetch_add?',
          [
            'store is faster, and correctness does not matter here',
            'fetch_add cannot be used on std::size_t',
            'The consumer also writes to write',
            'Only the single producer ever modifies write',
          ],
          3,
          'With one writer there is no lost-update race to guard against.',
        ),
      ],
    },
    {
      title: 'The consumer releases read so slots can be reused',
      explanation: [
        'When the ring can fill, the producer must not overwrite a slot the consumer has not read. It acquire-loads read and waits while write - read == capacity. The consumer stores read + 1 with memory_order_release only after it has finished with the slot, so a producer that sees the new read value may safely reuse that slot.',
        'Each index has exactly one writer: the producer owns write and the consumer owns read. With two producers, both could load the same write position and fill the same slot, so this design is only correct for one producer and one consumer.',
      ],
      example: {
        language: 'cpp',
        code: cpp(`
          #include <atomic>
          #include <cstddef>
          #include <iostream>
          #include <thread>
          #include <vector>
          int main() {
            std::vector<int> slots(4, 0);
            std::atomic<std::size_t> write{0};
            std::atomic<std::size_t> read{0};
            std::thread producer([&] {
              for (int value = 1; value <= 5; ++value) {
                std::size_t position = write.load(std::memory_order_relaxed);
                while (position - read.load(std::memory_order_acquire) == slots.size()) std::this_thread::yield();
                slots[position % slots.size()] = value;
                write.store(position + 1, std::memory_order_release);
              }
            });
            int total = 0;
            for (int i = 0; i < 5; ++i) {
              std::size_t position = read.load(std::memory_order_relaxed);
              while (write.load(std::memory_order_acquire) == position) std::this_thread::yield();
              total += slots[position % slots.size()];
              read.store(position + 1, std::memory_order_release);
            }
            producer.join();
            std::cout << total << "\\n";
          }
        `),
        output: '15',
        explanation:
          'Item 5 must reuse slot 0; the producer waits until the consumer has released position 0, so no unread item is overwritten.',
      },
      questions: [
        typeOutput(
          'Six items pass through a ring with only 2 slots. What is printed?',
          cpp(`
            #include <atomic>
            #include <cstddef>
            #include <iostream>
            #include <thread>
            #include <vector>
            int main() {
              std::vector<int> slots(2, 0);
              std::atomic<std::size_t> write{0};
              std::atomic<std::size_t> read{0};
              std::thread producer([&] {
                for (int value = 1; value <= 6; ++value) {
                  std::size_t position = write.load(std::memory_order_relaxed);
                  while (position - read.load(std::memory_order_acquire) == slots.size()) std::this_thread::yield();
                  slots[position % slots.size()] = value;
                  write.store(position + 1, std::memory_order_release);
                }
              });
              int total = 0;
              for (int i = 0; i < 6; ++i) {
                std::size_t position = read.load(std::memory_order_relaxed);
                while (write.load(std::memory_order_acquire) == position) std::this_thread::yield();
                total += slots[position % slots.size()];
                read.store(position + 1, std::memory_order_release);
              }
              producer.join();
              std::cout << total << "\\n";
            }
          `),
          '21',
          'Every slot is reused several times, but never before it is read, so all six items arrive: 1 + 2 + ... + 6.',
        ),
        typeOutput(
          'The consumer records the order of four items through 2 slots. What is printed?',
          cpp(`
            #include <atomic>
            #include <cstddef>
            #include <iostream>
            #include <thread>
            #include <vector>
            int main() {
              std::vector<int> slots(2, 0);
              std::atomic<std::size_t> write{0};
              std::atomic<std::size_t> read{0};
              std::thread producer([&] {
                for (int value = 1; value <= 4; ++value) {
                  std::size_t position = write.load(std::memory_order_relaxed);
                  while (position - read.load(std::memory_order_acquire) == slots.size()) std::this_thread::yield();
                  slots[position % slots.size()] = value;
                  write.store(position + 1, std::memory_order_release);
                }
              });
              int encoded = 0;
              for (int i = 0; i < 4; ++i) {
                std::size_t position = read.load(std::memory_order_relaxed);
                while (write.load(std::memory_order_acquire) == position) std::this_thread::yield();
                encoded = encoded * 10 + slots[position % slots.size()];
                read.store(position + 1, std::memory_order_release);
              }
              producer.join();
              std::cout << encoded << "\\n";
            }
          `),
          '1234',
          'Slot reuse does not change FIFO order: positions are read 0, 1, 2, 3.',
        ),
        choose(
          'Why does the producer wait while write - read == capacity?',
          [
            'Every slot still holds an unread item',
            'The ring is empty, so there is nothing to send',
            'The consumer is waiting for the producer',
            'To keep write below capacity so the index never wraps',
          ],
          0,
          'The positions differ by capacity exactly when all slots are occupied.',
        ),
        choose(
          'Two producer threads share this ring, each doing load write, fill the slot, store write + 1. What goes wrong?',
          [
            'Nothing; the atomics make two producers safe',
            'The consumer reads every item twice in a row',
            'It deadlocks immediately on the first push',
            'Both can fill the same slot, losing an item',
          ],
          3,
          'The protocol relies on a single writer per index; multiple producers need a different design.',
        ),
      ],
    },
  ],
};

const protocols: KnowledgePointModule = {
  'cpp-big-endian-word': [
    {
      title: 'Big-endian puts the high byte first',
      explanation: [
        'Network protocols often send a 16-bit number as two bytes in big-endian order: the most significant (high) byte first, then the low byte. The value is high * 256 + low, which is the same as (high << 8) | low.',
        'Each byte is between 0 and 255, so two bytes encode values from 0 to 65535.',
      ],
      example: {
        language: 'cpp',
        code: cpp(`
          #include <iostream>
          int main() {
            unsigned high = 1;
            unsigned low = 2;
            std::cout << high * 256 + low << "\\n";
          }
        `),
        output: '258',
        explanation: 'The high byte 1 is worth 256, plus the low byte 2.',
      },
      questions: [
        typeOutput(
          'The bytes 18 and 52 arrive in that order. What is printed?',
          cpp(`
            #include <iostream>
            int main() {
              unsigned first = 18;
              unsigned second = 52;
              std::cout << first * 256 + second << "\\n";
            }
          `),
          '4660',
          '18 * 256 + 52 = 4660; 13330 is what the reversed byte order would give.',
        ),
        typeOutput(
          'What does this program print?',
          cpp(`
            #include <iostream>
            int main() {
              unsigned high = 0;
              unsigned low = 255;
              std::cout << high * 256 + low << "\\n";
            }
          `),
          '255',
          'A zero high byte contributes nothing, leaving 255.',
        ),
        typeOutput(
          'What does this program print?',
          cpp(`
            #include <iostream>
            int main() {
              unsigned high = 255;
              unsigned low = 255;
              std::cout << high * 256 + low << "\\n";
            }
          `),
          '65535',
          '255 * 256 + 255 = 65535, the largest 16-bit value.',
        ),
        choose(
          'In a big-endian two-byte field, which byte comes first?',
          [
            'The least significant (low) byte',
            'Whichever the host CPU uses',
            'The larger of the two values',
            'The most significant (high) byte',
          ],
          3,
          'Big-endian means "big end first".',
        ),
      ],
    },
    {
      title: 'Decode bytes explicitly instead of reinterpreting memory',
      explanation: [
        'Little-endian order sends the low byte first, so the same two bytes mean a different number: value = second * 256 + first. Host CPUs also differ in the order they store integers, so copying received bytes straight into a std::uint16_t gives a machine-dependent result. Explicit arithmetic gives the same answer everywhere.',
        'Received bytes are usually std::uint8_t (in <cstdint>). Printing one directly shows it as a character, so convert it to unsigned first, as the arithmetic does.',
      ],
      example: {
        language: 'cpp',
        code: cpp(`
          #include <cstdint>
          #include <iostream>
          int main() {
            std::uint8_t first = 1;
            std::uint8_t second = 2;
            unsigned big = static_cast<unsigned>(first) * 256 + second;
            unsigned little = static_cast<unsigned>(second) * 256 + first;
            std::cout << big << " " << little << "\\n";
          }
        `),
        output: '258 513',
        explanation:
          'The same bytes decode to 258 when the first is high and to 513 when the second is high.',
      },
      questions: [
        typeOutput(
          'Four bytes arrive in big-endian order: 0, 0, 1, 0. What is printed?',
          cpp(`
            #include <iostream>
            int main() {
              unsigned b0 = 0;
              unsigned b1 = 0;
              unsigned b2 = 1;
              unsigned b3 = 0;
              unsigned value = ((b0 * 256 + b1) * 256 + b2) * 256 + b3;
              std::cout << value << "\\n";
            }
          `),
          '256',
          'Only the third byte is set, and it is worth 256 in a four-byte big-endian number.',
        ),
        typeOutput(
          'What does this program print?',
          cpp(`
            #include <cstdint>
            #include <iostream>
            int main() {
              std::uint8_t b = 65;
              std::cout << b << " " << static_cast<unsigned>(b) << "\\n";
            }
          `),
          'A 65',
          'std::uint8_t is a character type, so streaming it prints the character with code 65; the cast prints the number.',
        ),
        choose(
          'Why not copy two received bytes into a std::uint16_t with memcpy and use it directly?',
          [
            'memcpy cannot copy two bytes',
            'It always produces the big-endian value',
            'The result depends on the host’s byte order',
            'A std::uint16_t cannot hold 65535',
          ],
          2,
          'The wire format is fixed; the host layout is not.',
        ),
        typeOutput(
          'The bytes 52 and 18 are a little-endian field. What is printed?',
          cpp(`
            #include <iostream>
            int main() {
              unsigned first = 52;
              unsigned second = 18;
              std::cout << second * 256 + first << "\\n";
            }
          `),
          '4660',
          'Little-endian puts the low byte first, so the value is 18 * 256 + 52.',
        ),
      ],
    },
  ],
  'cpp-frame-length': [
    {
      title: 'Read the two-byte length only when both bytes arrived',
      explanation: [
        'A length-prefixed frame starts with a 2-byte big-endian length, followed by that many payload bytes. A std::span<const std::uint8_t> can view the received buffer.',
        'Before reading bytes[0] and bytes[1], check that the span holds at least 2 bytes; a buffer can arrive in pieces, and indexing past its end is undefined behavior.',
      ],
      example: {
        language: 'cpp',
        code: cpp(`
          #include <cstdint>
          #include <iostream>
          #include <span>
          #include <vector>
          int main() {
            std::vector<std::uint8_t> buffer = {0, 3, 4, 5, 6};
            std::span<const std::uint8_t> bytes(buffer);
            if (bytes.size() < 2) {
              std::cout << "incomplete header\\n";
            } else {
              unsigned length = static_cast<unsigned>(bytes[0]) * 256 + bytes[1];
              std::cout << "length " << length << "\\n";
            }
          }
        `),
        output: 'length 3',
        explanation: 'The header bytes 0 and 3 announce a 3-byte payload.',
      },
      questions: [
        typeOutput(
          'Only one byte has arrived. What is printed?',
          cpp(`
            #include <cstdint>
            #include <iostream>
            #include <span>
            #include <vector>
            int main() {
              std::vector<std::uint8_t> buffer = {0};
              std::span<const std::uint8_t> bytes(buffer);
              if (bytes.size() < 2) {
                std::cout << "incomplete header\\n";
              } else {
                unsigned length = static_cast<unsigned>(bytes[0]) * 256 + bytes[1];
                std::cout << "length " << length << "\\n";
              }
            }
          `),
          'incomplete header',
          'Half a header is not enough to know the length.',
        ),
        typeOutput(
          'What does this program print?',
          cpp(`
            #include <cstdint>
            #include <iostream>
            #include <span>
            #include <vector>
            int main() {
              std::vector<std::uint8_t> buffer = {1, 4};
              std::span<const std::uint8_t> bytes(buffer);
              if (bytes.size() < 2) {
                std::cout << "incomplete header\\n";
              } else {
                unsigned length = static_cast<unsigned>(bytes[0]) * 256 + bytes[1];
                std::cout << "length " << length << "\\n";
              }
            }
          `),
          'length 260',
          'The header is complete: 1 * 256 + 4 = 260, even though no payload has arrived yet.',
        ),
        choose(
          'Why check bytes.size() >= 2 before decoding the length?',
          [
            'The length field is always at least 2',
            'std::span requires two bytes to exist',
            'It is only a performance hint for the parser',
            'bytes[1] of a 1-byte buffer is out of bounds',
          ],
          3,
          'span’s operator[] does not check, so the program must.',
        ),
        typeOutput(
          'The program compares the advertised length with what follows the header. What is printed?',
          cpp(`
            #include <cstdint>
            #include <iostream>
            #include <span>
            #include <vector>
            int main() {
              std::vector<std::uint8_t> buffer = {0, 2, 9, 9, 9};
              std::span<const std::uint8_t> bytes(buffer);
              if (bytes.size() < 2) {
                std::cout << "incomplete header\\n";
              } else {
                unsigned length = static_cast<unsigned>(bytes[0]) * 256 + bytes[1];
                std::cout << length << " " << bytes.size() - 2 << "\\n";
              }
            }
          `),
          '2 3',
          'The header asks for 2 payload bytes, and 3 bytes follow it.',
        ),
      ],
    },
    {
      title: 'The advertised length must fit in the received bytes',
      explanation: [
        'The length field is data from the network: it can claim more bytes than the buffer holds, because the frame is still arriving or because the sender is broken or malicious. Check 2 + length <= bytes.size() before reading any payload byte.',
        'Bytes after 2 + length belong to the next frame, whose header starts right there.',
      ],
      example: {
        language: 'cpp',
        code: cpp(`
          #include <cstddef>
          #include <cstdint>
          #include <iostream>
          #include <span>
          #include <vector>
          int main() {
            std::vector<std::uint8_t> buffer = {0, 5, 1, 2, 3};
            std::span<const std::uint8_t> bytes(buffer);
            unsigned length = static_cast<unsigned>(bytes[0]) * 256 + bytes[1];
            if (2 + length > bytes.size()) {
              std::cout << "incomplete payload\\n";
            } else {
              unsigned sum = 0;
              for (std::size_t i = 2; i < 2 + length; ++i) sum += bytes[i];
              std::cout << "complete " << sum << "\\n";
            }
          }
        `),
        output: 'incomplete payload',
        explanation:
          'The header promises 5 payload bytes, but only 3 arrived, so nothing past the buffer is read.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          cpp(`
            #include <cstddef>
            #include <cstdint>
            #include <iostream>
            #include <span>
            #include <vector>
            int main() {
              std::vector<std::uint8_t> buffer = {0, 2, 7, 8};
              std::span<const std::uint8_t> bytes(buffer);
              unsigned length = static_cast<unsigned>(bytes[0]) * 256 + bytes[1];
              if (2 + length > bytes.size()) {
                std::cout << "incomplete payload\\n";
              } else {
                unsigned sum = 0;
                for (std::size_t i = 2; i < 2 + length; ++i) sum += bytes[i];
                std::cout << "complete " << sum << "\\n";
              }
            }
          `),
          'complete 15',
          'Exactly 2 payload bytes follow the header, so the frame is complete: 7 + 8.',
        ),
        choose(
          'A buffer holds the bytes 0, 1, 9, 0, 2, 4, 5. At which index does the second frame’s header start?',
          ['Index 2', 'Index 3', 'Index 1', 'Index 5'],
          1,
          'The first frame is 2 header bytes plus 1 payload byte, so it occupies indices 0 to 2.',
        ),
        choose(
          'A frame header says 60000 bytes follow, but only 10 have arrived. What should the parser do?',
          [
            'Read all 60000 bytes anyway, as the header says',
            'Shrink the length to 10 and parse',
            'Treat it as incomplete; read nothing past the end',
            'Treat the 10 bytes as the whole payload',
          ],
          2,
          'An advertised length must be checked against what is actually there.',
        ),
        typeOutput(
          'One byte of the next frame has already arrived. What is printed?',
          cpp(`
            #include <cstddef>
            #include <cstdint>
            #include <iostream>
            #include <span>
            #include <vector>
            int main() {
              std::vector<std::uint8_t> buffer = {0, 1, 7, 99};
              std::span<const std::uint8_t> bytes(buffer);
              unsigned length = static_cast<unsigned>(bytes[0]) * 256 + bytes[1];
              if (2 + length > bytes.size()) {
                std::cout << "incomplete payload\\n";
              } else {
                std::cout << bytes[2] + 0 << " " << bytes.size() - (2 + length) << "\\n";
              }
            }
          `),
          '7 1',
          'The frame is complete with payload 7; the trailing 99 is the first byte of the next frame.',
        ),
      ],
    },
  ],
  'cpp-sequence-gap': [
    {
      title: 'Compare each message with the expected next number',
      explanation: [
        'Feeds number their messages 1, 2, 3, and so on. The consumer keeps the number it expects next. If a message carries that number, everything is in order and expected becomes that number + 1; any other number means something is wrong.',
        'This check is independent of payload validation: a message can have a perfect checksum and still arrive after a gap.',
      ],
      example: {
        language: 'cpp',
        code: cpp(`
          #include <iostream>
          int main() {
            unsigned expected = 10;
            unsigned received = 12;
            if (received == expected) {
              std::cout << "in order\\n";
            } else {
              std::cout << "gap\\n";
            }
          }
        `),
        output: 'gap',
        explanation:
          'Message 10 was expected but 12 arrived, so at least one message is missing.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          cpp(`
            #include <iostream>
            int main() {
              unsigned expected = 7;
              unsigned received = 7;
              if (received == expected) {
                std::cout << "in order\\n";
              } else {
                std::cout << "gap\\n";
              }
            }
          `),
          'in order',
          'The message carries exactly the expected number.',
        ),
        typeOutput(
          'Three messages arrive in turn. What is printed?',
          cpp(`
            #include <iostream>
            int main() {
              unsigned expected = 1;
              unsigned received = 1;
              if (received == expected) std::cout << "ok "; else std::cout << "gap ";
              expected = received + 1;
              received = 2;
              if (received == expected) std::cout << "ok "; else std::cout << "gap ";
              expected = received + 1;
              received = 4;
              if (received == expected) std::cout << "ok\\n"; else std::cout << "gap\\n";
            }
          `),
          'ok ok gap',
          'After 1 and 2 the consumer expects 3, so 4 reveals that message 3 is missing.',
        ),
        choose(
          'Every message’s checksum is valid. Does that prove no message was lost?',
          [
            'Yes, a valid checksum covers the whole stream',
            'No: only sequence numbers reveal a missing message',
            'Yes, if the checksums are strong enough',
            'No, because checksums are never reliable',
          ],
          1,
          'A dropped message leaves no trace in the messages that did arrive, except in their numbering.',
        ),
        choose(
          'Message 41 has just been processed in order. What should expected become?',
          ['41', '40', '42', '0'],
          2,
          'The next message in order carries 41 + 1.',
        ),
      ],
    },
    {
      title: 'Count missing messages and recognize old ones',
      explanation: [
        'If received > expected, the messages from expected to received - 1 are missing: received - expected of them. Record the gap and continue with expected = received + 1. If received < expected, the message is a duplicate or arrived late; it reveals no new gap.',
        'With unsigned numbers, compute received - expected only after checking received > expected; otherwise the subtraction wraps around to a huge number.',
      ],
      example: {
        language: 'cpp',
        code: cpp(`
          #include <iostream>
          int main() {
            unsigned expected = 10;
            unsigned received = 13;
            if (received > expected) {
              std::cout << "missing " << received - expected << ", next " << received + 1 << "\\n";
            } else if (received < expected) {
              std::cout << "duplicate\\n";
            } else {
              std::cout << "in order\\n";
            }
          }
        `),
        output: 'missing 3, next 14',
        explanation:
          'Messages 10, 11 and 12 never arrived; the consumer now expects 14.',
      },
      questions: [
        typeOutput(
          'An old message arrives. What is printed?',
          cpp(`
            #include <iostream>
            int main() {
              unsigned expected = 10;
              unsigned received = 8;
              if (received > expected) {
                std::cout << "missing " << received - expected << ", next " << received + 1 << "\\n";
              } else if (received < expected) {
                std::cout << "duplicate\\n";
              } else {
                std::cout << "in order\\n";
              }
            }
          `),
          'duplicate',
          '8 is below the expected 10, so it is a message the consumer has already moved past.',
        ),
        choose(
          'What does received - expected give for unsigned values received = 8 and expected = 10?',
          [
            '-2, the signed difference',
            '2, the distance between them',
            'A huge number: unsigned math wraps',
            '0, because the result is clamped',
          ],
          2,
          'Unsigned subtraction is modular, which is why the comparison must come first.',
        ),
        typeOutput(
          'Three messages arrive; the program totals the missing ones. What is printed?',
          cpp(`
            #include <iostream>
            int main() {
              unsigned expected = 5;
              unsigned missing = 0;
              unsigned received = 5;
              if (received > expected) missing += received - expected;
              if (received >= expected) expected = received + 1;
              received = 8;
              if (received > expected) missing += received - expected;
              if (received >= expected) expected = received + 1;
              received = 9;
              if (received > expected) missing += received - expected;
              if (received >= expected) expected = received + 1;
              std::cout << missing << " " << expected << "\\n";
            }
          `),
          '2 10',
          'Messages 6 and 7 are missing; after 9 the consumer expects 10.',
        ),
        choose(
          'Why is a duplicate (received < expected) not counted as a gap?',
          [
            'It is an old message; nothing new is missing',
            'It means the stream restarted',
            'Duplicates are always fatal errors',
            'Unsigned sequence numbers cannot be compared safely',
          ],
          0,
          'Gaps are about numbers that never arrived, not ones that arrive again.',
        ),
      ],
    },
  ],
  'cpp-protocol': [
    {
      title: 'Collapse each run into a character and a count',
      explanation: [
        'Run-length encoding (RLE) replaces each run of equal consecutive characters with the character and the run length, so "aaabbc" becomes "a3b2c1". A scan finds where each run ends, appends the character and std::to_string of the count, and continues at the next run.',
        'The inner loop must check end < input.size() before reading input[end], so the last run never reads past the end.',
      ],
      example: {
        language: 'cpp',
        code: cpp(`
          #include <cstddef>
          #include <iostream>
          #include <string>
          #include <string_view>
          int main() {
            std::string_view input = "aaabbc";
            std::string output;
            std::size_t i = 0;
            while (i < input.size()) {
              std::size_t end = i + 1;
              while (end < input.size() && input[end] == input[i]) ++end;
              output.push_back(input[i]);
              output += std::to_string(end - i);
              i = end;
            }
            std::cout << output << "\\n";
          }
        `),
        output: 'a3b2c1',
        explanation: 'The runs are aaa, bb and c, with lengths 3, 2 and 1.',
      },
      questions: [
        typeOutput(
          'The same encoder runs on "zzzz". What is printed?',
          cpp(`
            #include <cstddef>
            #include <iostream>
            #include <string>
            #include <string_view>
            int main() {
              std::string_view input = "zzzz";
              std::string output;
              std::size_t i = 0;
              while (i < input.size()) {
                std::size_t end = i + 1;
                while (end < input.size() && input[end] == input[i]) ++end;
                output.push_back(input[i]);
                output += std::to_string(end - i);
                i = end;
              }
              std::cout << output << "\\n";
            }
          `),
          'z4',
          'The whole input is one run of length 4.',
        ),
        typeOutput(
          'The same encoder runs on "abc". What is printed?',
          cpp(`
            #include <cstddef>
            #include <iostream>
            #include <string>
            #include <string_view>
            int main() {
              std::string_view input = "abc";
              std::string output;
              std::size_t i = 0;
              while (i < input.size()) {
                std::size_t end = i + 1;
                while (end < input.size() && input[end] == input[i]) ++end;
                output.push_back(input[i]);
                output += std::to_string(end - i);
                i = end;
              }
              std::cout << output << "\\n";
            }
          `),
          'a1b1c1',
          'Every character is its own run of length 1, so RLE makes this input longer.',
        ),
        typeOutput(
          'The same encoder runs on "xxyyyx". What is printed?',
          cpp(`
            #include <cstddef>
            #include <iostream>
            #include <string>
            #include <string_view>
            int main() {
              std::string_view input = "xxyyyx";
              std::string output;
              std::size_t i = 0;
              while (i < input.size()) {
                std::size_t end = i + 1;
                while (end < input.size() && input[end] == input[i]) ++end;
                output.push_back(input[i]);
                output += std::to_string(end - i);
                i = end;
              }
              std::cout << output << "\\n";
            }
          `),
          'x2y3x1',
          'The runs are xx, yyy and a final x.',
        ),
        choose(
          'Why must the inner loop test end < input.size() before input[end] == input[i]?',
          [
            'Otherwise the last run reads past the end of the view',
            'The comparison runs faster when it comes second',
            'It only matters for letters',
            'The order of the two tests does not matter with &&',
          ],
          0,
          '&& stops at the first false test, so the bounds check protects the read.',
        ),
      ],
    },
    {
      title: 'Separated repeats stay separate runs',
      explanation: [
        'RLE describes runs in input order, so "aba" encodes as "a1b1a1", not "a2b1". Merging all occurrences of a character counts frequencies instead; that loses the order and cannot be decoded back into the input.',
        "Decoding repeats each character by its count, in order. For single-digit counts, encoded[i + 1] - '0' turns the digit character into its number. Decoding a correct encoding gives back exactly the original input.",
      ],
      example: {
        language: 'cpp',
        code: cpp(`
          #include <cstddef>
          #include <iostream>
          #include <string>
          #include <string_view>
          int main() {
            std::string_view input = "aba";
            std::string output;
            std::size_t i = 0;
            while (i < input.size()) {
              std::size_t end = i + 1;
              while (end < input.size() && input[end] == input[i]) ++end;
              output.push_back(input[i]);
              output += std::to_string(end - i);
              i = end;
            }
            std::cout << output << "\\n";
          }
        `),
        output: 'a1b1a1',
        explanation: 'The b splits the two a characters into separate runs.',
      },
      questions: [
        typeOutput(
          'The encoder runs on "aabaa". What is printed?',
          cpp(`
            #include <cstddef>
            #include <iostream>
            #include <string>
            #include <string_view>
            int main() {
              std::string_view input = "aabaa";
              std::string output;
              std::size_t i = 0;
              while (i < input.size()) {
                std::size_t end = i + 1;
                while (end < input.size() && input[end] == input[i]) ++end;
                output.push_back(input[i]);
                output += std::to_string(end - i);
                i = end;
              }
              std::cout << output << "\\n";
            }
          `),
          'a2b1a2',
          'The two runs of a are separated by b, so they are encoded separately.',
        ),
        typeOutput(
          'This decoder expands character and count pairs. What is printed?',
          cpp(`
            #include <cstddef>
            #include <iostream>
            #include <string>
            #include <string_view>
            int main() {
              std::string_view encoded = "c3d1";
              std::string decoded;
              for (std::size_t i = 0; i + 1 < encoded.size(); i += 2) {
                int count = encoded[i + 1] - '0';
                for (int k = 0; k < count; ++k) decoded.push_back(encoded[i]);
              }
              std::cout << decoded << "\\n";
            }
          `),
          'cccd',
          'c is repeated 3 times and then d once, in order.',
        ),
        choose(
          'Why is "a2b1" a wrong encoding of "aba"?',
          [
            'Counts must come before characters',
            'b must be listed first because it is the odd one out',
            'It counts characters, not runs; it decodes to "aab"',
            'It is correct; RLE counts every occurrence',
          ],
          2,
          'Run-length encoding must preserve order to be reversible.',
        ),
        typeOutput(
          'This program counts the runs in "aabbbaa". What is printed?',
          cpp(`
            #include <cstddef>
            #include <iostream>
            #include <string_view>
            int main() {
              std::string_view input = "aabbbaa";
              int runs = 0;
              for (std::size_t i = 0; i < input.size(); ++i)
                if (i == 0 || input[i] != input[i - 1]) runs += 1;
              std::cout << runs << "\\n";
            }
          `),
          '3',
          'A new run starts at the first character and wherever the character changes: aa, bbb, aa.',
        ),
      ],
    },
  ],
};

const riskChecks: KnowledgePointModule = {
  'cpp-book-imbalance': [
    {
      title: 'Imbalance is (bid − ask) / (bid + ask), computed in double',
      explanation: [
        'Book imbalance compares the size resting on each side: (bid_size - ask_size) / (bid_size + ask_size). It runs from -1 (everything on the ask side) through 0 (balanced) to +1 (everything on the bid side).',
        'The sizes are integers, so convert to double before dividing; integer division would truncate every value strictly between -1 and 1 to 0.',
      ],
      example: {
        language: 'cpp',
        code: cpp(`
          #include <iostream>
          int main() {
            int bid_size = 3;
            int ask_size = 1;
            double imbalance = (static_cast<double>(bid_size) - ask_size) / (static_cast<double>(bid_size) + ask_size);
            std::cout << imbalance << "\\n";
          }
        `),
        output: '0.5',
        explanation:
          'The difference 2 divided by the total 4 gives 0.5: the book leans toward the bid.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          cpp(`
            #include <iostream>
            int main() {
              int bid_size = 1;
              int ask_size = 3;
              double imbalance = (static_cast<double>(bid_size) - ask_size) / (static_cast<double>(bid_size) + ask_size);
              std::cout << imbalance << "\\n";
            }
          `),
          '-0.5',
          'The ask side is larger, so the imbalance is negative: -2 / 4.',
        ),
        typeOutput(
          'The first value uses int division, the second double. What is printed?',
          cpp(`
            #include <iostream>
            int main() {
              int bid_size = 3;
              int ask_size = 1;
              int truncated = (bid_size - ask_size) / (bid_size + ask_size);
              double exact = (static_cast<double>(bid_size) - ask_size) / (static_cast<double>(bid_size) + ask_size);
              std::cout << truncated << " " << exact << "\\n";
            }
          `),
          '0 0.5',
          'Integer division truncates 2 / 4 to 0; converting first keeps 0.5.',
        ),
        typeOutput(
          'Only the bid side has size. What is printed?',
          cpp(`
            #include <iostream>
            int main() {
              int bid_size = 8;
              int ask_size = 0;
              double imbalance = (static_cast<double>(bid_size) - ask_size) / (static_cast<double>(bid_size) + ask_size);
              std::cout << imbalance << "\\n";
            }
          `),
          '1',
          'All the size is on the bid side, the +1 end of the scale.',
        ),
        choose(
          'What does an imbalance close to +1 mean?',
          [
            'Almost all displayed size is on the bid side',
            'Almost all displayed size is on the ask side',
            'Both sides are equal',
            'The spread is 1 tick',
          ],
          0,
          'The numerator approaches the total when the ask size is small.',
        ),
      ],
    },
    {
      title: 'Define the empty-book case and reject negative sizes',
      explanation: [
        'When both sides are 0 the denominator is 0. Division by zero is undefined behavior in C++ (on typical IEEE hardware 0.0 / 0.0 gives NaN, which then poisons later arithmetic), so the contract must say what an empty book reports; here it is 0, a neutral imbalance.',
        'Negative sizes are invalid input and are rejected before any arithmetic.',
      ],
      example: {
        language: 'cpp',
        code: cpp(`
          #include <iostream>
          int main() {
            int bid_size = 0;
            int ask_size = 0;
            if (bid_size < 0) {
              std::cout << "invalid\\n";
            } else if (ask_size < 0) {
              std::cout << "invalid\\n";
            } else if (bid_size + ask_size == 0) {
              std::cout << 0 << "\\n";
            } else {
              std::cout << (static_cast<double>(bid_size) - ask_size) / (static_cast<double>(bid_size) + ask_size) << "\\n";
            }
          }
        `),
        output: '0',
        explanation:
          'The empty book is handled before the division, using the contract’s value 0.',
      },
      questions: [
        typeOutput(
          'A negative bid size arrives. What is printed?',
          cpp(`
            #include <iostream>
            int main() {
              int bid_size = -2;
              int ask_size = 5;
              if (bid_size < 0) {
                std::cout << "invalid\\n";
              } else if (ask_size < 0) {
                std::cout << "invalid\\n";
              } else if (bid_size + ask_size == 0) {
                std::cout << 0 << "\\n";
              } else {
                std::cout << (static_cast<double>(bid_size) - ask_size) / (static_cast<double>(bid_size) + ask_size) << "\\n";
              }
            }
          `),
          'invalid',
          'The negative size is rejected before it can produce a value outside -1 to 1.',
        ),
        choose(
          'Without the zero check, what happens for an empty book?',
          [
            'The result is 0, since there is no size',
            'A std::domain_error exception is thrown',
            'A division by zero: undefined, often NaN',
            'The result is 1, since both sides are equal',
          ],
          2,
          'Both the numerator and the denominator are 0.',
        ),
        typeOutput(
          'What does this program print?',
          cpp(`
            #include <iostream>
            int main() {
              int bid_size = 5;
              int ask_size = 5;
              if (bid_size < 0) {
                std::cout << "invalid\\n";
              } else if (ask_size < 0) {
                std::cout << "invalid\\n";
              } else if (bid_size + ask_size == 0) {
                std::cout << 0 << "\\n";
              } else {
                std::cout << (static_cast<double>(bid_size) - ask_size) / (static_cast<double>(bid_size) + ask_size) << "\\n";
              }
            }
          `),
          '0',
          'Equal sizes give a difference of 0, a balanced book.',
        ),
        typeOutput(
          'What does this program print?',
          cpp(`
            #include <iostream>
            int main() {
              int bid_size = 2;
              int ask_size = 6;
              if (bid_size < 0) {
                std::cout << "invalid\\n";
              } else if (ask_size < 0) {
                std::cout << "invalid\\n";
              } else if (bid_size + ask_size == 0) {
                std::cout << 0 << "\\n";
              } else {
                std::cout << (static_cast<double>(bid_size) - ask_size) / (static_cast<double>(bid_size) + ask_size) << "\\n";
              }
            }
          `),
          '-0.5',
          'The difference -4 over the total 8 is -0.5.',
        ),
      ],
    },
  ],
  'cpp-notional-limit': [
    {
      title: 'Widen before multiplying',
      explanation: [
        'Notional in ticks is price_ticks * quantity. With two int operands the multiplication happens in int, which overflows past about 2.1 billion on common platforms, and signed overflow is undefined behavior.',
        'Convert one operand first, as in static_cast<long long>(price_ticks) * quantity, so the multiplication itself is done in long long. Converting the product afterwards is too late: the overflow has already happened.',
      ],
      example: {
        language: 'cpp',
        code: cpp(`
          #include <iostream>
          int main() {
            int price_ticks = 2000000000;
            int quantity = 2;
            long long notional = static_cast<long long>(price_ticks) * quantity;
            std::cout << notional << "\\n";
          }
        `),
        output: '4000000000',
        explanation:
          'The cast makes the multiplication a long long one, so 4 billion fits.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          cpp(`
            #include <iostream>
            int main() {
              int price_ticks = 125;
              int quantity = 4;
              long long notional = static_cast<long long>(price_ticks) * quantity;
              std::cout << notional << "\\n";
            }
          `),
          '500',
          'Notional is price times quantity: 125 * 4.',
        ),
        choose(
          'price is 2000000000 and quantity is 2, both int. What is wrong with this line?',
          [
            'Nothing; the long long target makes the multiplication wide',
            'price * quantity overflows in int before it is converted',
            'A long long cannot hold 4 billion',
            'The conversion happens twice',
          ],
          1,
          'The type of the variable receiving the result does not change how the multiplication is done.',
          cpp(`
            long long notional = price * quantity;
          `),
        ),
        predictOutput(
          'What does this program print?',
          cpp(`
            #include <iostream>
            int main() {
              int price_ticks = 50000;
              int quantity = 50000;
              long long notional = static_cast<long long>(price_ticks) * quantity;
              std::cout << notional << "\\n";
            }
          `),
          ['-1794967296', '250000000', '2500000000', 'Overflow'],
          2,
          'Widened first, 50000 * 50000 = 2.5 billion fits in long long.',
        ),
        choose(
          'Which expression computes the notional without int overflow?',
          [
            'static_cast<long long>(price * quantity)',
            'static_cast<long long>(price) * quantity',
            '(long long)(price * quantity)',
            'price * quantity * 1LL',
          ],
          1,
          'Only converting an operand before the first multiplication moves it to long long; in the last option price * quantity runs first, in int.',
        ),
      ],
    },
    {
      title: 'Compare against the limit, inclusive and validated',
      explanation: [
        'A notional limit accepts an order when its notional does not exceed the limit: notional <= limit, so an order exactly at the limit passes. Prices, quantities and limits below 0 are invalid input and are rejected first.',
        'Compute the notional in long long, then compare it with a long long limit.',
      ],
      example: {
        language: 'cpp',
        code: cpp(`
          #include <iostream>
          int main() {
            int price_ticks = 100;
            int quantity = 3;
            long long limit = 300;
            long long notional = static_cast<long long>(price_ticks) * quantity;
            if (price_ticks < 0) {
              std::cout << "invalid\\n";
            } else if (quantity < 0) {
              std::cout << "invalid\\n";
            } else if (limit < 0) {
              std::cout << "invalid\\n";
            } else if (notional <= limit) {
              std::cout << "accept\\n";
            } else {
              std::cout << "reject\\n";
            }
          }
        `),
        output: 'accept',
        explanation:
          'The notional is exactly 300, which does not exceed the limit.',
      },
      questions: [
        typeOutput(
          'The quantity rises to 4. What is printed?',
          cpp(`
            #include <iostream>
            int main() {
              int price_ticks = 100;
              int quantity = 4;
              long long limit = 300;
              long long notional = static_cast<long long>(price_ticks) * quantity;
              if (price_ticks < 0) {
                std::cout << "invalid\\n";
              } else if (quantity < 0) {
                std::cout << "invalid\\n";
              } else if (limit < 0) {
                std::cout << "invalid\\n";
              } else if (notional <= limit) {
                std::cout << "accept\\n";
              } else {
                std::cout << "reject\\n";
              }
            }
          `),
          'reject',
          '400 exceeds the 300 limit.',
        ),
        typeOutput(
          'What does this program print?',
          cpp(`
            #include <iostream>
            int main() {
              int price_ticks = 2000000000;
              int quantity = 2;
              long long limit = 4000000000;
              long long notional = static_cast<long long>(price_ticks) * quantity;
              if (price_ticks < 0) {
                std::cout << "invalid\\n";
              } else if (quantity < 0) {
                std::cout << "invalid\\n";
              } else if (limit < 0) {
                std::cout << "invalid\\n";
              } else if (notional <= limit) {
                std::cout << "accept\\n";
              } else {
                std::cout << "reject\\n";
              }
            }
          `),
          'accept',
          'Computed in long long, the notional is exactly 4 billion, which equals the limit.',
        ),
        typeOutput(
          'A negative quantity arrives. What is printed?',
          cpp(`
            #include <iostream>
            int main() {
              int price_ticks = 100;
              int quantity = -1;
              long long limit = 300;
              long long notional = static_cast<long long>(price_ticks) * quantity;
              if (price_ticks < 0) {
                std::cout << "invalid\\n";
              } else if (quantity < 0) {
                std::cout << "invalid\\n";
              } else if (limit < 0) {
                std::cout << "invalid\\n";
              } else if (notional <= limit) {
                std::cout << "accept\\n";
              } else {
                std::cout << "reject\\n";
              }
            }
          `),
          'invalid',
          'Without validation, -100 would pass the limit check; the quantity check rejects it first.',
        ),
        choose(
          'A limit says notional "may not exceed 300 ticks". Should an order with notional exactly 300 pass?',
          [
            'No; it must be strictly below 300',
            'Only if the price is even',
            'It depends on the time of day',
            'Yes; not exceeding 300 means <= 300',
          ],
          3,
          'The wording sets an inclusive bound, so the check is notional <= limit.',
        ),
      ],
    },
  ],
  'cpp-position-bound': [
    {
      title: 'Check the position the trade would leave',
      explanation: [
        'A position limit applies to where the position will be, not where it is now: next = position + delta, where buys add and sells subtract. A trade from a position that is within the limit can still end outside it.',
        'Compute next in long long, then allow the trade only if -limit <= next <= limit.',
      ],
      example: {
        language: 'cpp',
        code: cpp(`
          #include <iostream>
          int main() {
            int position = 4;
            int delta = 3;
            int limit = 10;
            long long next = static_cast<long long>(position) + delta;
            std::cout << next << " ";
            if (next > limit) {
              std::cout << "blocked\\n";
            } else if (next < -static_cast<long long>(limit)) {
              std::cout << "blocked\\n";
            } else {
              std::cout << "allowed\\n";
            }
          }
        `),
        output: '7 allowed',
        explanation:
          'The trade would leave a position of 7, inside the range -10 to 10.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          cpp(`
            #include <iostream>
            int main() {
              int position = 8;
              int delta = 3;
              int limit = 10;
              long long next = static_cast<long long>(position) + delta;
              std::cout << next << " ";
              if (next > limit) {
                std::cout << "blocked\\n";
              } else if (next < -static_cast<long long>(limit)) {
                std::cout << "blocked\\n";
              } else {
                std::cout << "allowed\\n";
              }
            }
          `),
          '11 blocked',
          'The current position 8 is fine, but the trade would take it to 11.',
        ),
        typeOutput(
          'A sell deepens a short position. What is printed?',
          cpp(`
            #include <iostream>
            int main() {
              int position = -8;
              int delta = -3;
              int limit = 10;
              long long next = static_cast<long long>(position) + delta;
              std::cout << next << " ";
              if (next > limit) {
                std::cout << "blocked\\n";
              } else if (next < -static_cast<long long>(limit)) {
                std::cout << "blocked\\n";
              } else {
                std::cout << "allowed\\n";
              }
            }
          `),
          '-11 blocked',
          'A short position of -11 breaks the lower bound -10.',
        ),
        typeOutput(
          'A large sell flips a long position to short. What is printed?',
          cpp(`
            #include <iostream>
            int main() {
              int position = 9;
              int delta = -15;
              int limit = 10;
              long long next = static_cast<long long>(position) + delta;
              std::cout << next << " ";
              if (next > limit) {
                std::cout << "blocked\\n";
              } else if (next < -static_cast<long long>(limit)) {
                std::cout << "blocked\\n";
              } else {
                std::cout << "allowed\\n";
              }
            }
          `),
          '-6 allowed',
          'The sell is large, but the resulting position -6 is within the limit.',
        ),
        choose(
          'Why check position + delta instead of the current position alone?',
          [
            'The limit applies to the position after the trade',
            'The current position is always zero at that point',
            'delta is always positive for a buy or a sell',
            'It is the same check written differently',
          ],
          0,
          'Risk is about the state the trade would create.',
        ),
      ],
    },
    {
      title: 'Check both bounds and widen before adding',
      explanation: [
        'A symmetric limit bounds long and short positions alike. Testing only next <= limit lets unbounded short positions through.',
        'Computing position + delta in int can overflow near the int range, and the shortcut std::abs(next) <= limit fails for the most negative int, whose magnitude does not fit in an int. Widening to long long before adding, and comparing against -static_cast<long long>(limit), avoids both problems.',
      ],
      example: {
        language: 'cpp',
        code: cpp(`
          #include <iostream>
          int main() {
            int position = -8;
            int delta = -5;
            int limit = 10;
            long long next = static_cast<long long>(position) + delta;
            bool upper_only = next <= limit;
            bool both = next <= limit && next >= -static_cast<long long>(limit);
            std::cout << upper_only << " " << both << "\\n";
          }
        `),
        output: '1 0',
        explanation:
          'A position of -13 passes a check of the upper bound alone, but fails the full symmetric check.',
      },
      questions: [
        predictOutput(
          'The position starts at the largest int. What is printed?',
          cpp(`
            #include <iostream>
            #include <limits>
            int main() {
              int position = std::numeric_limits<int>::max();
              int delta = 1;
              int limit = 10;
              long long next = static_cast<long long>(position) + delta;
              bool both = next <= limit && next >= -static_cast<long long>(limit);
              std::cout << next << " " << both << "\\n";
            }
          `),
          ['-2147483648 1', '2147483648 0', '2147483648 1', '0 0'],
          1,
          'Widened before adding, the sum is a true 2147483648, which is far above the limit.',
        ),
        typeOutput(
          'The position sits exactly on the lower bound. What is printed?',
          cpp(`
            #include <iostream>
            int main() {
              int position = -10;
              int delta = 0;
              int limit = 10;
              long long next = static_cast<long long>(position) + delta;
              bool upper_only = next <= limit;
              bool both = next <= limit && next >= -static_cast<long long>(limit);
              std::cout << upper_only << " " << both << "\\n";
            }
          `),
          '1 1',
          'Both bounds are inclusive, so -10 is allowed.',
        ),
        choose(
          'Why not test std::abs(position + delta) <= limit using int arithmetic?',
          [
            'std::abs only works on doubles, so the int is converted first',
            'The sum can overflow, and abs(INT_MIN) does not fit',
            'It is equivalent to the two-sided check',
            'abs makes the check one-sided again',
          ],
          1,
          'Both the addition and the absolute value can leave the int range.',
        ),
        choose(
          'A risk check only tests next <= limit. Which trades slip through?',
          [
            'Buys that push the position above limit',
            'Trades of size 0',
            'None',
            'Sells that push the position below -limit',
          ],
          3,
          'Without the lower bound, short positions can grow without limit.',
        ),
      ],
    },
  ],
  'cpp-risk': [
    {
      title: 'An event is expired when now >= deadline',
      explanation: [
        'Orders and quotes often carry a deadline. The contract must define the boundary exactly; here an event is expired when now >= deadline, so at the deadline itself it has already expired.',
        'The comparison produces a bool, which prints as 1 or 0.',
      ],
      example: {
        language: 'cpp',
        code: cpp(`
          #include <iostream>
          int main() {
            long long deadline = 100;
            long long now = 100;
            bool expired = now >= deadline;
            std::cout << expired << "\\n";
          }
        `),
        output: '1',
        explanation: 'At exactly the deadline, now >= deadline is true.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          cpp(`
            #include <iostream>
            int main() {
              long long deadline = 100;
              long long now = 99;
              bool expired = now >= deadline;
              std::cout << expired << "\\n";
            }
          `),
          '0',
          'One unit before the deadline the event is still live.',
        ),
        typeOutput(
          'Three times around the deadline are checked. What is printed?',
          cpp(`
            #include <iostream>
            int main() {
              long long deadline = 100;
              std::cout << (99 >= deadline) << " " << (100 >= deadline) << " " << (101 >= deadline) << "\\n";
            }
          `),
          '0 1 1',
          'Only the time before the deadline is live; the deadline itself counts as expired.',
        ),
        typeOutput(
          'Two possible contracts are compared at the boundary. What is printed?',
          cpp(`
            #include <iostream>
            int main() {
              long long deadline = 100;
              long long now = 100;
              std::cout << (now >= deadline) << " " << (now > deadline) << "\\n";
            }
          `),
          '1 0',
          'The two definitions disagree exactly at the deadline.',
        ),
        choose(
          'An order is valid "until 10:00:00", and a message stamped exactly 10:00:00 arrives. Why must the contract say whether it is still valid?',
          [
            'Times can never be exactly equal in practice',
            'Both definitions agree exactly at the boundary',
            'The clock decides at run time which one applies',
            'Only the definition decides it: >= and > differ there',
          ],
          3,
          'Boundaries are where off-by-one disagreements between systems appear.',
        ),
      ],
    },
    {
      title: 'Decide expiry from supplied event times',
      explanation: [
        'Code that decides expiry by sleeping and then reading the wall clock gives different answers on a slow or busy machine, so tests of the exact boundary become flaky. Pass the event time in as a value instead: the same inputs then give the same answer on every run.',
        'With supplied times, tests can probe deadline - 1, deadline and deadline + 1 exactly. A deadline is often computed as sent time plus a time-to-live.',
      ],
      example: {
        language: 'cpp',
        code: cpp(`
          #include <iostream>
          int main() {
            long long deadline = 50;
            long long first_event = 49;
            long long second_event = 50;
            std::cout << (first_event >= deadline) << (second_event >= deadline) << "\\n";
          }
        `),
        output: '01',
        explanation:
          'The event times come from the data, so the result is the same on every run: 49 is live and 50 is expired.',
      },
      questions: [
        typeOutput(
          'A message sent at 1000 lives for 250 units. What is printed?',
          cpp(`
            #include <iostream>
            int main() {
              long long sent = 1000;
              long long ttl = 250;
              long long now = 1249;
              long long deadline = sent + ttl;
              std::cout << deadline << " " << (now >= deadline) << "\\n";
            }
          `),
          '1250 0',
          'The deadline is 1250, and 1249 is one unit before it.',
        ),
        choose(
          'A test sleeps for 100 ms and then checks that an order with a 100 ms lifetime has expired. Why is the test flaky?',
          [
            'Sleeping is not allowed inside a C++ test',
            '100 ms is too short for a clock to measure',
            'Real timing varies around the boundary',
            'The order never expires while the test sleeps',
          ],
          2,
          'Real time is not exact enough to test an exact boundary.',
        ),
        typeOutput(
          'Three logged events are checked against one deadline. What is printed?',
          cpp(`
            #include <iostream>
            int main() {
              long long deadline = 60;
              long long a = 40;
              long long b = 60;
              long long c = 75;
              int expired = (a >= deadline) + (b >= deadline) + (c >= deadline);
              std::cout << expired << "\\n";
            }
          `),
          '2',
          'Each true comparison counts as 1: the events at 60 and 75 are expired.',
        ),
        choose(
          'Which inputs make good boundary tests for "expired when now >= deadline"?',
          [
            'Only a time long after the deadline',
            'A random time on each run',
            'The current wall-clock time',
            'deadline - 1, deadline and deadline + 1',
          ],
          3,
          'Those three values pin down exactly where the answer changes.',
        ),
      ],
    },
  ],
};

const pipelines: KnowledgePointModule = {
  'cpp-backpressure': [
    {
      title: 'A bounded queue accepts work only while below capacity',
      explanation: [
        'A pipeline stage with a bounded queue can accept new work only while queue.size() < capacity. When the queue is full it must refuse; the producer then knows to slow down, retry later or drop the item deliberately. That refusal signal is backpressure.',
        'Without it, a fast producer either grows the queue without bound or loses work silently.',
      ],
      example: {
        language: 'cpp',
        code: cpp(`
          #include <cstddef>
          #include <deque>
          #include <iostream>
          #include <vector>
          int main() {
            std::deque<int> queue;
            std::size_t capacity = 2;
            int accepted = 0;
            int refused = 0;
            std::vector<int> incoming = {5, 6, 7};
            for (std::size_t i = 0; i < incoming.size(); ++i) {
              if (queue.size() < capacity) {
                queue.push_back(incoming[i]);
                accepted += 1;
              } else {
                refused += 1;
              }
            }
            std::cout << accepted << " " << refused << " " << queue.back() << "\\n";
          }
        `),
        output: '2 1 6',
        explanation:
          '5 and 6 fill the queue; 7 is refused, so 6 is the last item queued.',
      },
      questions: [
        typeOutput(
          'Four items arrive at a queue of capacity 3. What is printed?',
          cpp(`
            #include <cstddef>
            #include <deque>
            #include <iostream>
            #include <vector>
            int main() {
              std::deque<int> queue;
              std::size_t capacity = 3;
              int accepted = 0;
              int refused = 0;
              std::vector<int> incoming = {1, 2, 3, 4};
              for (std::size_t i = 0; i < incoming.size(); ++i) {
                if (queue.size() < capacity) {
                  queue.push_back(incoming[i]);
                  accepted += 1;
                } else {
                  refused += 1;
                }
              }
              std::cout << accepted << " " << refused << " " << queue.back() << "\\n";
            }
          `),
          '3 1 3',
          'Three items fit; the fourth is refused, so 3 stays the last item.',
        ),
        typeOutput(
          'The queue has capacity 0. What is printed?',
          cpp(`
            #include <cstddef>
            #include <deque>
            #include <iostream>
            #include <vector>
            int main() {
              std::deque<int> queue;
              std::size_t capacity = 0;
              int accepted = 0;
              int refused = 0;
              std::vector<int> incoming = {1, 2, 3};
              for (std::size_t i = 0; i < incoming.size(); ++i) {
                if (queue.size() < capacity) {
                  queue.push_back(incoming[i]);
                  accepted += 1;
                } else {
                  refused += 1;
                }
              }
              std::cout << accepted << " " << refused << "\\n";
            }
          `),
          '0 3',
          'Nothing fits in a zero-capacity queue, so every item is refused.',
        ),
        choose(
          'What makes a full queue apply backpressure?',
          [
            'It tells the producer the item was refused',
            'It silently grows beyond its capacity',
            'It drops the oldest item and reports success',
            'It blocks the consumer',
          ],
          0,
          'Backpressure is a signal that travels back to the producer.',
        ),
        typeOutput(
          'A queue of capacity 3 already holds 3 items. What is printed?',
          cpp(`
            #include <cstddef>
            #include <deque>
            #include <iostream>
            int main() {
              std::deque<int> queue = {4, 5, 6};
              std::size_t capacity = 3;
              std::cout << (queue.size() < capacity) << "\\n";
            }
          `),
          '0',
          'The queue is full, so the check that allows a push is false.',
        ),
      ],
    },
    {
      title: 'Report acceptance to the producer',
      explanation: [
        'A push operation that returns nothing, or always reports success, leaves the producer unable to react to a full queue: items vanish without a trace. Make acceptance part of the contract, for example a bool result from try_push, or a bool out-parameter as below.',
        'The producer can then count, retry or deliberately drop refused items, and the loss is visible.',
      ],
      example: {
        language: 'cpp',
        code: cpp(`
          #include <cstddef>
          #include <deque>
          #include <iostream>
          void offer(std::deque<int>& queue, std::size_t capacity, int item, bool& accepted) {
            accepted = false;
            if (queue.size() < capacity) {
              queue.push_back(item);
              accepted = true;
            }
          }
          int main() {
            std::deque<int> queue;
            bool ok = false;
            int lost = 0;
            offer(queue, 1, 10, ok);
            if (!ok) lost += 1;
            offer(queue, 1, 20, ok);
            if (!ok) lost += 1;
            std::cout << queue.size() << " " << lost << "\\n";
          }
        `),
        output: '1 1',
        explanation:
          'The second offer is refused, and because offer reports it, the producer records one lost item.',
      },
      questions: [
        choose(
          'What is wrong with this push contract?',
          [
            'It reports success even when the item was discarded',
            'It never adds any items to the queue',
            'It throws when the queue is already full',
            'Nothing; a full queue is the producer’s problem',
          ],
          0,
          'The producer cannot tell an accepted item from a dropped one.',
          cpp(`
            bool try_push(std::deque<int>& queue, std::size_t capacity, int item) {
              if (queue.size() < capacity) queue.push_back(item);
              return true;
            }
          `),
        ),
        typeOutput(
          'Three items are offered to a queue of capacity 2. What is printed?',
          cpp(`
            #include <cstddef>
            #include <deque>
            #include <iostream>
            void offer(std::deque<int>& queue, std::size_t capacity, int item, bool& accepted) {
              accepted = false;
              if (queue.size() < capacity) {
                queue.push_back(item);
                accepted = true;
              }
            }
            int main() {
              std::deque<int> queue;
              bool ok = false;
              int lost = 0;
              offer(queue, 2, 1, ok);
              if (!ok) lost += 1;
              offer(queue, 2, 2, ok);
              if (!ok) lost += 1;
              offer(queue, 2, 3, ok);
              if (!ok) lost += 1;
              std::cout << queue.size() << " " << lost << "\\n";
            }
          `),
          '2 1',
          'Two items fit; the third is refused and counted as lost.',
        ),
        choose(
          'Which reactions to a refused item are reasonable for a producer?',
          [
            'Pretend it was accepted and move on',
            'Slow down, retry, or record it as dropped',
            'Push it anyway beyond the capacity limit',
            'Restart the consumer so it drains faster',
          ],
          1,
          'Any of those keeps the loss visible and the capacity respected.',
        ),
        typeOutput(
          'This version compares with <= instead of <. What is printed?',
          cpp(`
            #include <cstddef>
            #include <deque>
            #include <iostream>
            void offer(std::deque<int>& queue, std::size_t capacity, int item, bool& accepted) {
              accepted = false;
              if (queue.size() <= capacity) {
                queue.push_back(item);
                accepted = true;
              }
            }
            int main() {
              std::deque<int> queue;
              bool ok = false;
              offer(queue, 2, 1, ok);
              offer(queue, 2, 2, ok);
              offer(queue, 2, 3, ok);
              std::cout << queue.size() << "\\n";
            }
          `),
          '3',
          'With <= a queue holding 2 items still accepts one more, exceeding the capacity.',
        ),
      ],
    },
  ],
  'cpp-idempotent-message': [
    {
      title: 'insert(id).second says whether the id is new',
      explanation: [
        'Messages can be delivered more than once. A std::set<int> of processed message ids makes handling idempotent: seen.insert(id) returns a pair whose .second is true only if id was not already in the set. Apply the message only in that case, and a redelivery changes nothing.',
        'The set keeps each id once, so its size is the number of distinct messages handled.',
      ],
      example: {
        language: 'cpp',
        code: cpp(`
          #include <cstddef>
          #include <iostream>
          #include <set>
          #include <vector>
          int main() {
            std::vector<int> ids = {4, 8, 4, 9, 8};
            std::set<int> seen;
            int applied = 0;
            for (std::size_t i = 0; i < ids.size(); ++i)
              if (seen.insert(ids[i]).second) applied += 1;
            std::cout << applied << " " << seen.size() << "\\n";
          }
        `),
        output: '3 3',
        explanation:
          'The second deliveries of 4 and 8 are recognized and skipped.',
      },
      questions: [
        typeOutput(
          'Each message adds its amount to a balance. What is printed?',
          cpp(`
            #include <cstddef>
            #include <iostream>
            #include <set>
            #include <vector>
            int main() {
              std::vector<int> ids = {1, 2, 1};
              std::vector<int> amounts = {5, 7, 5};
              std::set<int> seen;
              int balance = 0;
              for (std::size_t i = 0; i < ids.size(); ++i)
                if (seen.insert(ids[i]).second) balance += amounts[i];
              std::cout << balance << "\\n";
            }
          `),
          '12',
          'Message 1 arrives twice but is applied once: 5 + 7.',
        ),
        typeOutput(
          'The same id is inserted twice. What is printed?',
          cpp(`
            #include <iostream>
            #include <set>
            int main() {
              std::set<int> seen;
              bool first = seen.insert(3).second;
              bool second = seen.insert(3).second;
              std::cout << first << second << "\\n";
            }
          `),
          '10',
          'The first insert adds 3; the second finds it already present.',
        ),
        choose(
          'What does `seen.insert(id).second` tell you?',
          [
            'The position of id within the set',
            'How many times id has been inserted so far',
            'Whether the set is still sorted after the insert',
            'Whether id was newly inserted or already present',
          ],
          3,
          'insert returns an iterator and a bool that reports whether insertion happened.',
        ),
        typeOutput(
          'One handler deduplicates and one does not. What is printed?',
          cpp(`
            #include <cstddef>
            #include <iostream>
            #include <set>
            #include <vector>
            int main() {
              std::vector<int> ids = {4, 8, 4, 9, 8};
              std::set<int> seen;
              int naive = 0;
              int deduplicated = 0;
              for (std::size_t i = 0; i < ids.size(); ++i) {
                naive += 10;
                if (seen.insert(ids[i]).second) deduplicated += 10;
              }
              std::cout << naive << " " << deduplicated << "\\n";
            }
          `),
          '50 30',
          'The naive handler applies all five deliveries; the deduplicating one applies three distinct messages.',
        ),
      ],
    },
    {
      title: 'Retries must reuse the same identity',
      explanation: [
        'Deduplication only works if a retry carries the same id as the original message. If the sender generates a fresh id for every retry, each copy looks new and is applied again.',
        'Ids must also be remembered for as long as retries can arrive; forgetting them too early lets a late retry through a second time.',
      ],
      example: {
        language: 'cpp',
        code: cpp(`
          #include <cstddef>
          #include <iostream>
          #include <set>
          #include <vector>
          int main() {
            std::vector<int> retried_ids = {100, 100, 100};
            std::set<int> seen;
            int balance = 0;
            for (std::size_t i = 0; i < retried_ids.size(); ++i)
              if (seen.insert(retried_ids[i]).second) balance += 25;
            std::cout << balance << "\\n";
          }
        `),
        output: '25',
        explanation:
          'All three deliveries reuse id 100, so the payment is applied once.',
      },
      questions: [
        typeOutput(
          'The sender gives each retry a fresh id. What is printed?',
          cpp(`
            #include <cstddef>
            #include <iostream>
            #include <set>
            #include <vector>
            int main() {
              std::vector<int> retried_ids = {200, 201, 202};
              std::set<int> seen;
              int balance = 0;
              for (std::size_t i = 0; i < retried_ids.size(); ++i)
                if (seen.insert(retried_ids[i]).second) balance += 25;
              std::cout << balance << "\\n";
            }
          `),
          '75',
          'Every retry looks like a new message, so the same payment is applied three times.',
        ),
        choose(
          'Each retry of a message gets a new random id. What does a deduplicating consumer do?',
          [
            'Applies the message once, as intended',
            'Rejects every copy as a duplicate',
            'Applies every retry, since each id is new',
            'Applies it exactly twice, then stops',
          ],
          2,
          'Deduplication can only recognize ids it has seen before.',
        ),
        choose(
          'The consumer forgets ids after one minute, but retries can arrive for five minutes. What can happen?',
          [
            'A late retry is applied a second time',
            'Nothing, since the retry already happened',
            'The set throws an exception',
            'All retries are rejected',
          ],
          0,
          'Once an id is forgotten, its next delivery looks new.',
        ),
        typeOutput(
          'A map remembers the amount first applied for each id. What is printed?',
          cpp(`
            #include <cstddef>
            #include <iostream>
            #include <map>
            #include <vector>
            int main() {
              std::vector<int> ids = {7, 7};
              std::vector<int> amounts = {30, 99};
              std::map<int, int> processed;
              for (std::size_t i = 0; i < ids.size(); ++i) processed.emplace(ids[i], amounts[i]);
              std::cout << processed[7] << " " << processed.size() << "\\n";
            }
          `),
          '30 1',
          'emplace does nothing for an existing key, so the first amount for id 7 is kept.',
        ),
      ],
    },
  ],
  'cpp-replay-events': [
    {
      title: 'Apply logged events in their recorded order',
      explanation: [
        'An event log records operations such as "set to 5" and "add 2". Replaying applies them to an initial state one by one, in the recorded order; each kind of event has one fixed meaning.',
        'Because nothing else affects the state, replaying the same log from the same initial state always produces the same result.',
      ],
      example: {
        language: 'cpp',
        code: cpp(`
          #include <iostream>
          void apply(int& state, char kind, int value) {
            if (kind == '=') state = value;
            if (kind == '+') state += value;
          }
          int main() {
            int state = 0;
            apply(state, '=', 5);
            apply(state, '+', 2);
            apply(state, '+', 3);
            std::cout << state << "\\n";
          }
        `),
        output: '10',
        explanation: 'The state is set to 5, then raised by 2 and by 3.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          cpp(`
            #include <iostream>
            void apply(int& state, char kind, int value) {
              if (kind == '=') state = value;
              if (kind == '+') state += value;
            }
            int main() {
              int state = 4;
              apply(state, '+', 6);
              apply(state, '=', 1);
              apply(state, '+', 2);
              std::cout << state << "\\n";
            }
          `),
          '3',
          'The set to 1 discards the earlier 10, and then 2 is added.',
        ),
        typeOutput(
          'The log also has subtraction events. What is printed?',
          cpp(`
            #include <iostream>
            void apply(int& state, char kind, int value) {
              if (kind == '=') state = value;
              if (kind == '+') state += value;
              if (kind == '-') state -= value;
            }
            int main() {
              int state = 0;
              apply(state, '=', 10);
              apply(state, '-', 4);
              apply(state, '+', 1);
              std::cout << state << "\\n";
            }
          `),
          '7',
          '10 - 4 + 1 = 7.',
        ),
        choose(
          'Why does replaying the same log always give the same state?',
          [
            'The compiler caches the result of the first replay',
            'All events commute, so order never matters',
            'It does not; replays vary from run to run',
            'Each event applies in recorded order with a fixed meaning',
          ],
          3,
          'Same inputs, same steps, same order: the result is determined.',
        ),
        typeOutput(
          'Two replicas start from different states and replay the same log. What is printed?',
          cpp(`
            #include <iostream>
            void apply(int& state, char kind, int value) {
              if (kind == '=') state = value;
              if (kind == '+') state += value;
            }
            int main() {
              int replica_a = 3;
              int replica_b = 100;
              apply(replica_a, '=', 5);
              apply(replica_a, '+', 2);
              apply(replica_b, '=', 5);
              apply(replica_b, '+', 2);
              std::cout << replica_a << " " << replica_b << "\\n";
            }
          `),
          '7 7',
          'The leading set overrides the different starting values, so both replicas end at 7.',
        ),
      ],
    },
    {
      title: 'Order matters for events that do not commute',
      explanation: [
        '"Set to 5, then add 2" ends at 7, but "add 2, then set to 5" ends at 5. Because set and add do not commute, the order of the log is part of its data.',
        'Sorting or regrouping events before replay, for example by value, can change the final state; replay must follow the recorded order.',
      ],
      example: {
        language: 'cpp',
        code: cpp(`
          #include <iostream>
          void apply(int& state, char kind, int value) {
            if (kind == '=') state = value;
            if (kind == '+') state += value;
          }
          int main() {
            int a = 0;
            apply(a, '=', 5);
            apply(a, '+', 2);
            int b = 0;
            apply(b, '+', 2);
            apply(b, '=', 5);
            std::cout << a << " " << b << "\\n";
          }
        `),
        output: '7 5',
        explanation:
          'The same two events in opposite orders give different states.',
      },
      questions: [
        typeOutput(
          'Two additions are applied in opposite orders. What is printed?',
          cpp(`
            #include <iostream>
            void apply(int& state, char kind, int value) {
              if (kind == '=') state = value;
              if (kind == '+') state += value;
            }
            int main() {
              int a = 0;
              apply(a, '+', 2);
              apply(a, '+', 5);
              int b = 0;
              apply(b, '+', 5);
              apply(b, '+', 2);
              std::cout << a << " " << b << "\\n";
            }
          `),
          '7 7',
          'Additions commute, so their order does not change the sum.',
        ),
        choose(
          'A tool sorts a log by value before replaying it. When can that change the final state?',
          [
            'Whenever set and add events are mixed',
            'Never, because sorting keeps every event',
            'Only when values are negative',
            'Only when the log is empty',
          ],
          0,
          'Moving a set before or after an add changes what the add applies to.',
        ),
        typeOutput(
          'The log is replayed in recorded order and in order of value. What is printed?',
          cpp(`
            #include <iostream>
            void apply(int& state, char kind, int value) {
              if (kind == '=') state = value;
              if (kind == '+') state += value;
            }
            int main() {
              int recorded = 0;
              apply(recorded, '=', 3);
              apply(recorded, '+', 4);
              apply(recorded, '=', 10);
              apply(recorded, '+', 1);
              int sorted = 0;
              apply(sorted, '+', 1);
              apply(sorted, '=', 3);
              apply(sorted, '+', 4);
              apply(sorted, '=', 10);
              std::cout << recorded << " " << sorted << "\\n";
            }
          `),
          '11 10',
          'In recorded order the last set is followed by +1; sorted, the set to 10 comes last.',
        ),
        choose(
          'Which pair of events gives the same result in either order?',
          [
            'set 3 and add 4',
            'set 3 and set 4',
            'add 3 and set 4',
            'add 3 and add 4',
          ],
          3,
          'Only the two additions commute; any pair with a set depends on order.',
        ),
      ],
    },
  ],
  'cpp-architecture': [
    {
      title: 'Replay only the events after the snapshot',
      explanation: [
        'A snapshot saves the state after the first `included` events of the log. Recovery starts from the snapshot and replays only events included, included + 1, …, size - 1.',
        'Replaying from event 0 on top of the snapshot applies the first events twice.',
      ],
      example: {
        language: 'cpp',
        code: cpp(`
          #include <cstddef>
          #include <iostream>
          #include <vector>
          int main() {
            std::vector<int> deltas = {3, 4, 5};
            int snapshot = 7;
            std::size_t included = 2;
            int state = snapshot;
            for (std::size_t i = included; i < deltas.size(); ++i) state += deltas[i];
            std::cout << state << "\\n";
          }
        `),
        output: '12',
        explanation:
          'The snapshot 7 already contains 3 + 4, so only the last delta 5 is replayed.',
      },
      questions: [
        typeOutput(
          'This recovery replays the whole log onto the snapshot. What is printed?',
          cpp(`
            #include <cstddef>
            #include <iostream>
            #include <vector>
            int main() {
              std::vector<int> deltas = {3, 4, 5};
              int snapshot = 7;
              int state = snapshot;
              for (std::size_t i = 0; i < deltas.size(); ++i) state += deltas[i];
              std::cout << state << "\\n";
            }
          `),
          '19',
          'The deltas 3 and 4 are counted twice: once in the snapshot and once in the replay.',
        ),
        typeOutput(
          'The snapshot already includes every event. What is printed?',
          cpp(`
            #include <cstddef>
            #include <iostream>
            #include <vector>
            int main() {
              std::vector<int> deltas = {1, 2};
              int snapshot = 3;
              std::size_t included = 2;
              int state = snapshot;
              for (std::size_t i = included; i < deltas.size(); ++i) state += deltas[i];
              std::cout << state << "\\n";
            }
          `),
          '3',
          'Nothing is left to replay, so the state is the snapshot.',
        ),
        typeOutput(
          'What does this program print?',
          cpp(`
            #include <cstddef>
            #include <iostream>
            #include <vector>
            int main() {
              std::vector<int> deltas = {10, -4, 6};
              int snapshot = 10;
              std::size_t included = 1;
              int state = snapshot;
              for (std::size_t i = included; i < deltas.size(); ++i) state += deltas[i];
              std::cout << state << "\\n";
            }
          `),
          '12',
          'The snapshot holds the first delta; replaying -4 and 6 gives 12.',
        ),
        choose(
          'What does included = 2 record about a snapshot?',
          [
            'The snapshot already reflects events 0 and 1',
            'Events 2 and later are in the snapshot',
            'The snapshot is two events old',
            'Two snapshots exist',
          ],
          0,
          'included is the boundary: events before it are inside the saved state.',
        ),
      ],
    },
    {
      title: 'Validate the snapshot boundary before replaying',
      explanation: [
        'included can never exceed the number of events in the log. If it does, the snapshot claims events the log does not have, because the log was truncated or the snapshot came from a different log. Report that before replaying.',
        'Without the check the replay loop simply runs zero times and returns the snapshot as if everything were consistent.',
      ],
      example: {
        language: 'cpp',
        code: cpp(`
          #include <cstddef>
          #include <iostream>
          #include <vector>
          int main() {
            std::vector<int> deltas = {1, 2, 3};
            int snapshot = 6;
            std::size_t included = 5;
            if (included > deltas.size()) {
              std::cout << "inconsistent snapshot\\n";
            } else {
              int state = snapshot;
              for (std::size_t i = included; i < deltas.size(); ++i) state += deltas[i];
              std::cout << state << "\\n";
            }
          }
        `),
        output: 'inconsistent snapshot',
        explanation: 'The snapshot claims 5 events, but the log only has 3.',
      },
      questions: [
        typeOutput(
          'The snapshot includes exactly all three events. What is printed?',
          cpp(`
            #include <cstddef>
            #include <iostream>
            #include <vector>
            int main() {
              std::vector<int> deltas = {2, 2, 2};
              int snapshot = 6;
              std::size_t included = 3;
              if (included > deltas.size()) {
                std::cout << "inconsistent snapshot\\n";
              } else {
                int state = snapshot;
                for (std::size_t i = included; i < deltas.size(); ++i) state += deltas[i];
                std::cout << state << "\\n";
              }
            }
          `),
          '6',
          'included equal to the log length is valid: nothing remains to replay.',
        ),
        typeOutput(
          'What does this program print?',
          cpp(`
            #include <cstddef>
            #include <iostream>
            #include <vector>
            int main() {
              std::vector<int> deltas = {1, 2, 3};
              int snapshot = 10;
              std::size_t included = 4;
              if (included > deltas.size()) {
                std::cout << "inconsistent snapshot\\n";
              } else {
                int state = snapshot;
                for (std::size_t i = included; i < deltas.size(); ++i) state += deltas[i];
                std::cout << state << "\\n";
              }
            }
          `),
          'inconsistent snapshot',
          'Four included events cannot come from a three-event log.',
        ),
        choose(
          'Without the check, what does the replay loop do when included is larger than the log?',
          [
            'It runs zero times, hiding the problem',
            'It throws an exception for the bad index',
            'It reads past the end of the log',
            'It replays the whole log from event 0',
          ],
          0,
          'The loop condition is false from the start, so the inconsistency goes unnoticed.',
        ),
        choose(
          'When could a snapshot claim more events than the log contains?',
          [
            'Never, since snapshots are taken from the log',
            'When the events are sorted before saving',
            'When the snapshot is empty or brand new',
            'The log was cut short, or is a different log',
          ],
          3,
          'Either way, state and log disagree and recovery must stop.',
        ),
      ],
    },
  ],
};

const determinism: KnowledgePointModule = {
  'cpp-tie-break-order': [
    {
      title: 'Add the id to the key to break price ties',
      explanation: [
        'Sorting orders by price alone leaves equal-price orders in an unspecified order: std::sort is not stable, so ties can come out differently on another library or with another input order. If the priority contract is "lower price first, then lower order id", the sort key must include both.',
        'A std::pair<int, int> (in <utility>) holds .first and .second and compares by .first, then by .second. Sorting (price, id) pairs with std::sort therefore gives exactly that total order, with no tie left to chance.',
      ],
      example: {
        language: 'cpp',
        code: cpp(`
          #include <algorithm>
          #include <cstddef>
          #include <iostream>
          #include <utility>
          #include <vector>
          int main() {
            std::vector<std::pair<int, int>> orders = {{100, 8}, {100, 3}, {101, 1}};
            std::sort(orders.begin(), orders.end());
            for (std::size_t i = 0; i < orders.size(); ++i) std::cout << orders[i].second << " ";
            std::cout << "\\n";
          }
        `),
        output: '3 8 1',
        explanation:
          'Both orders at 100 come before 101, and between them the lower id 3 wins.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          cpp(`
            #include <algorithm>
            #include <iostream>
            #include <utility>
            #include <vector>
            int main() {
              std::vector<std::pair<int, int>> orders = {{100, 2}, {99, 7}};
              std::sort(orders.begin(), orders.end());
              std::cout << orders.front().second << "\\n";
            }
          `),
          '7',
          'The lower price comes first, whatever the ids are.',
        ),
        typeOutput(
          'Three orders share one price. What is printed?',
          cpp(`
            #include <algorithm>
            #include <cstddef>
            #include <iostream>
            #include <utility>
            #include <vector>
            int main() {
              std::vector<std::pair<int, int>> orders = {{50, 9}, {50, 2}, {50, 5}};
              std::sort(orders.begin(), orders.end());
              for (std::size_t i = 0; i < orders.size(); ++i) std::cout << orders[i].second << " ";
              std::cout << "\\n";
            }
          `),
          '2 5 9',
          'With equal prices, the ids decide the order.',
        ),
        choose(
          'Two orders share price 100. After std::sort with this comparator, which comes first?',
          [
            'The one that arrived first, as in the input',
            'The one with the lower id, since ids differ',
            'Unspecified: std::sort may put either one first',
            'The one with the larger size in the order',
          ],
          2,
          'The comparator treats them as equal, and std::sort does not preserve the order of equal elements.',
          cpp(`
            std::sort(orders.begin(), orders.end(), [](const auto& a, const auto& b) {
              return a.first < b.first;
            });
          `),
        ),
        choose(
          'Which comparator implements "lower price first, then lower id"?',
          [
            'return a.first < b.first || a.second < b.second;',
            'return a.first != b.first ? a.first < b.first : a.second < b.second;',
            'return a.first != b.first ? a.first > b.first : a.second < b.second;',
            'return a.first == b.first ? a.first < b.first : a.second < b.second;',
          ],
          1,
          'It compares ids only when prices tie; <= is not a valid strict ordering for std::sort.',
        ),
      ],
    },
    {
      title: 'Encode mixed directions in the key',
      explanation: [
        'Bids are prioritized by highest price first, then earliest (lowest) id: the two fields sort in opposite directions. Sorting the pairs descending would also reverse the ids.',
        'One way is to build the key (-price, id) and sort ascending: negating the price puts the highest price first, while ids still ascend among equal prices.',
      ],
      example: {
        language: 'cpp',
        code: cpp(`
          #include <algorithm>
          #include <cstddef>
          #include <iostream>
          #include <utility>
          #include <vector>
          int main() {
            std::vector<std::pair<int, int>> bids = {{100, 8}, {102, 5}, {100, 3}};
            std::vector<std::pair<int, int>> keys(bids.size());
            for (std::size_t i = 0; i < bids.size(); ++i) keys[i] = {-bids[i].first, bids[i].second};
            std::sort(keys.begin(), keys.end());
            for (std::size_t i = 0; i < keys.size(); ++i) std::cout << keys[i].second << " ";
            std::cout << "\\n";
          }
        `),
        output: '5 3 8',
        explanation:
          'The highest bid 102 (id 5) comes first; at 100 the earlier id 3 precedes 8.',
      },
      questions: [
        typeOutput(
          'These bids are sorted without negating the price. What is printed?',
          cpp(`
            #include <algorithm>
            #include <cstddef>
            #include <iostream>
            #include <utility>
            #include <vector>
            int main() {
              std::vector<std::pair<int, int>> bids = {{100, 8}, {102, 5}, {100, 3}};
              std::sort(bids.begin(), bids.end());
              for (std::size_t i = 0; i < bids.size(); ++i) std::cout << bids[i].second << " ";
              std::cout << "\\n";
            }
          `),
          '3 8 5',
          'Ascending order puts the lowest bid first, the opposite of bid priority.',
        ),
        typeOutput(
          'Asks are prioritized by lowest price, then lowest id. What is printed?',
          cpp(`
            #include <algorithm>
            #include <cstddef>
            #include <iostream>
            #include <utility>
            #include <vector>
            int main() {
              std::vector<std::pair<int, int>> asks = {{105, 4}, {103, 9}, {103, 2}};
              std::sort(asks.begin(), asks.end());
              for (std::size_t i = 0; i < asks.size(); ++i) std::cout << asks[i].second << " ";
              std::cout << "\\n";
            }
          `),
          '2 9 4',
          'For asks both fields ascend, so the plain pair order is already the priority order.',
        ),
        typeOutput(
          'What does this program print?',
          cpp(`
            #include <algorithm>
            #include <cstddef>
            #include <iostream>
            #include <utility>
            #include <vector>
            int main() {
              std::vector<std::pair<int, int>> bids = {{99, 1}, {101, 7}, {101, 4}};
              std::vector<std::pair<int, int>> keys(bids.size());
              for (std::size_t i = 0; i < bids.size(); ++i) keys[i] = {-bids[i].first, bids[i].second};
              std::sort(keys.begin(), keys.end());
              for (std::size_t i = 0; i < keys.size(); ++i) std::cout << keys[i].second << " ";
              std::cout << "\\n";
            }
          `),
          '4 7 1',
          'Both 101 bids lead, the earlier id 4 first; the 99 bid comes last.',
        ),
        choose(
          'Why negate the price instead of sorting the pairs in descending order?',
          [
            'Negative numbers sort faster than positive ones do',
            'Descending order would also put later ids first at a tie',
            'std::sort cannot sort in descending order',
            'It makes the prices unique',
          ],
          1,
          'Only the price should be reversed; the id must keep ascending.',
        ),
      ],
    },
  ],
  'cpp-integer-money': [
    {
      title: 'Count money in integer ticks',
      explanation: [
        'A double stores binary fractions, so most decimal amounts are only approximated: 0.1 is stored as a nearby value, and 0.1 + 0.2 == 0.3 is false. Sums of such amounts drift.',
        'Storing amounts as integer counts of the smallest unit (cents, or price ticks) makes every addition and multiplication exact, as long as the values stay within the integer type’s range.',
      ],
      example: {
        language: 'cpp',
        code: cpp(`
          #include <iostream>
          int main() {
            int a_cents = 10;
            int b_cents = 20;
            std::cout << a_cents + b_cents << " " << (a_cents + b_cents == 30) << " " << (0.1 + 0.2 == 0.3) << "\\n";
          }
        `),
        output: '30 1 0',
        explanation:
          'The integer cents add exactly; the doubles do not quite reach the stored 0.3.',
      },
      questions: [
        typeOutput(
          'A fill of 4 lots at 125 ticks pays a 3-tick fee. What is printed?',
          cpp(`
            #include <iostream>
            int main() {
              int price_ticks = 125;
              int size = 4;
              int fee_ticks = 3;
              long long total = static_cast<long long>(price_ticks) * size + fee_ticks;
              std::cout << total << "\\n";
            }
          `),
          '503',
          'The notional 500 plus the fee 3, all in ticks, is exact.',
        ),
        typeOutput(
          'The same amounts are added as cents and as doubles. What is printed?',
          cpp(`
            #include <iostream>
            int main() {
              int cents = 10 + 20 + 30;
              double dollars = 0.1 + 0.2 + 0.3;
              std::cout << (cents == 60) << " " << (dollars == 0.6) << "\\n";
            }
          `),
          '1 0',
          'The integer sum is exact; the double sum lands slightly above the stored 0.6.',
        ),
        choose(
          'Why does `0.1 + 0.2 == 0.3` evaluate to false?',
          [
            '== never works on doubles, only on integers',
            '0.3 is rounded down to 0',
            '0.1 and 0.2 are stored as nearby binary fractions',
            'The addition overflows',
          ],
          2,
          'None of the three decimals is exactly representable in binary.',
        ),
        typeOutput(
          'A balance in cents is printed as dollars and cents. What is printed?',
          cpp(`
            #include <iostream>
            int main() {
              int balance_cents = 1234;
              balance_cents += 99;
              std::cout << balance_cents / 100 << "." << balance_cents % 100 << "\\n";
            }
          `),
          '13.33',
          '1234 + 99 = 1333 cents, which is 13 dollars and 33 cents.',
        ),
      ],
    },
    {
      title: 'Convert tick scales before mixing amounts',
      explanation: [
        'Integers are exact only when every amount uses the same unit. A price in cents (1/100) and a fee in units of 1/10000 cannot be added directly: 250 cents plus 75 fee units is not 325 of anything.',
        'Convert to the finer unit first (cents times 100), and keep the unit in each variable’s name so mismatches are visible.',
      ],
      example: {
        language: 'cpp',
        code: cpp(`
          #include <iostream>
          int main() {
            long long price_cents = 250;
            long long fee_units = 75;
            long long total_units = price_cents * 100 + fee_units;
            std::cout << total_units << "\\n";
          }
        `),
        output: '25075',
        explanation:
          '2.50 is 25000 units of 1/10000, and the 0.0075 fee is 75 more.',
      },
      questions: [
        typeOutput(
          'The first total mixes units, the second converts first. What is printed?',
          cpp(`
            #include <iostream>
            int main() {
              long long price_cents = 250;
              long long fee_units = 75;
              std::cout << price_cents + fee_units << " " << price_cents * 100 + fee_units << "\\n";
            }
          `),
          '325 25075',
          'Adding without conversion gives 325, which matches neither unit.',
        ),
        typeOutput(
          'A total in units of 1/10000 is split back into cents and leftover units. What is printed?',
          cpp(`
            #include <iostream>
            int main() {
              long long total_units = 25075;
              std::cout << total_units / 100 << " " << total_units % 100 << "\\n";
            }
          `),
          '250 75',
          '100 units make a cent: 250 whole cents and 75 units left over.',
        ),
        choose(
          'A price is in cents and a fee is in units of 1/10000. What must happen before adding them?',
          [
            'Divide the fee by 100 and drop the remainder',
            'Convert both to double',
            'Add them directly; integers are exact',
            'Multiply the cents by 100 to get 1/10000 units',
          ],
          3,
          'Moving to the finer unit loses nothing, while dropping the remainder would.',
        ),
        predictOutput(
          'One price is in quarter-ticks (0.25 each), the other in cents. Are they equal?',
          cpp(`
            #include <iostream>
            int main() {
              long long price_quarters = 401;
              long long other_cents = 10025;
              std::cout << (price_quarters * 25 == other_cents) << "\\n";
            }
          `),
          ['0', '1', '401', '10025'],
          1,
          '401 quarters is 100.25, which is 10025 cents; converted to one unit, they compare equal.',
        ),
      ],
    },
  ],
  'cpp-seeded-engine': [
    {
      title: 'The same engine and seed give the same sequence',
      explanation: [
        'std::mt19937 (in <random>) is a pseudo-random engine whose algorithm the C++ standard specifies completely. Seeded with the same value, it produces the same sequence on every conforming implementation; calling engine() returns the next value.',
        'Two engines with equal seeds therefore stay in lockstep, while different seeds give different sequences. A default-constructed engine uses a fixed default seed, so it is reproducible too.',
      ],
      example: {
        language: 'cpp',
        code: cpp(`
          #include <iostream>
          #include <random>
          int main() {
            std::mt19937 first(42);
            std::mt19937 second(42);
            int same = 0;
            for (int i = 0; i < 5; ++i)
              if (first() == second()) same += 1;
            std::cout << same << "\\n";
          }
        `),
        output: '5',
        explanation:
          'Both engines start from the same seed, so all five draws match.',
      },
      questions: [
        predictOutput(
          'The engines use different seeds. How many of the first five draws match?',
          cpp(`
            #include <iostream>
            #include <random>
            int main() {
              std::mt19937 first(1);
              std::mt19937 second(2);
              int same = 0;
              for (int i = 0; i < 5; ++i)
                if (first() == second()) same += 1;
              std::cout << same << "\\n";
            }
          `),
          ['5', '0', 'It changes from run to run', '1'],
          1,
          'Different seeds start different sequences, and the specified algorithm makes the result the same on every run.',
        ),
        typeOutput(
          'Both engines are default-constructed. What is printed?',
          cpp(`
            #include <iostream>
            #include <random>
            int main() {
              std::mt19937 first;
              std::mt19937 second;
              int same = 0;
              for (int i = 0; i < 3; ++i)
                if (first() == second()) same += 1;
              std::cout << same << "\\n";
            }
          `),
          '3',
          'A default-constructed engine always uses the same default seed.',
        ),
        choose(
          'The standard requires the 10000th value of a default-constructed std::mt19937 to be 4123659995. What does that guarantee?',
          [
            'Every conforming library gives the same mt19937 sequence',
            'The value is random and different on each run',
            'mt19937 is safe to use for cryptography',
            'Distributions built on it give the same results everywhere',
          ],
          0,
          'The engine algorithm is fixed by the standard, so its output is portable.',
        ),
        choose(
          'A simulation seeds std::mt19937 with the current time and does not log the seed. Why can a failing run not be reproduced?',
          [
            'mt19937 ignores the seed it is given',
            'Time-based seeds overflow the engine state',
            'It can always be reproduced from the time',
            'The seed changes every run and was not saved',
          ],
          3,
          'Reproducing a run needs the exact seed it used.',
        ),
      ],
    },
    {
      title: 'Record engine and seed; distributions may differ',
      explanation: [
        'Copying an engine copies its whole state, so the copy continues with exactly the values the original would produce next. To replay a run, record the engine type, the seed and how values were drawn.',
        'Distributions such as std::uniform_int_distribution are not specified step by step, so the same engine and seed can give different distribution results on different standard libraries. For results that must match everywhere, derive values from the raw engine output yourself, for example engine() % 6 + 1 for a die (slightly biased, but portable).',
      ],
      example: {
        language: 'cpp',
        code: cpp(`
          #include <iostream>
          #include <random>
          int main() {
            std::mt19937 engine(7);
            engine();
            engine();
            std::mt19937 copy = engine;
            int same = 0;
            for (int i = 0; i < 4; ++i)
              if (engine() == copy()) same += 1;
            std::cout << same << "\\n";
          }
        `),
        output: '4',
        explanation:
          'The copy is taken after two draws, so it continues from exactly the same point as the original.',
      },
      questions: [
        predictOutput(
          'The copy is taken first, and the original then draws once more. How many of the next four draws match?',
          cpp(`
            #include <iostream>
            #include <random>
            int main() {
              std::mt19937 engine(7);
              std::mt19937 copy = engine;
              engine();
              int same = 0;
              for (int i = 0; i < 4; ++i)
                if (engine() == copy()) same += 1;
              std::cout << same << "\\n";
            }
          `),
          ['4', '0', '3', '1'],
          1,
          'The two engines are now one step apart, so each comparison pairs different positions in the sequence.',
        ),
        typeOutput(
          'Two engines seeded 99 roll dice from raw output. How many of ten rolls match?',
          cpp(`
            #include <iostream>
            #include <random>
            int main() {
              std::mt19937 first(99);
              std::mt19937 second(99);
              int same = 0;
              for (int i = 0; i < 10; ++i)
                if (first() % 6 + 1 == second() % 6 + 1) same += 1;
              std::cout << same << "\\n";
            }
          `),
          '10',
          'The raw engine outputs are identical, and so is the arithmetic on them.',
        ),
        choose(
          'Two machines draw std::uniform_int_distribution<int>(1, 6) from std::mt19937(42). Which statement is true?',
          [
            'The engine outputs match; distribution results may not',
            'Both always match, because the engine and seed are the same',
            'Neither matches across the two machines',
            'Only the first value matches on both',
          ],
          0,
          'The engine is fully specified; the distribution’s algorithm is left to each library.',
        ),
        choose(
          'What must a bug report include so a random simulation can be replayed?',
          [
            'Only the seed, since every engine uses it the same way',
            'The engine type, the seed, and how values were drawn',
            'Only the time of the run and the machine',
            'The CPU model and compiler version',
          ],
          1,
          'The same seed in a different engine, or drawn through a different distribution, gives different values.',
        ),
      ],
    },
  ],
  'cpp-determinism': [
    {
      title: 'Deduplicate, check, then mutate',
      explanation: [
        'A risk-event handler combines the earlier pieces in a fixed order: skip an event whose id was already seen; compute the next position in long long; and assign it only if it stays within -limit to limit. The position is only ever assigned an accepted value, so a rejected event leaves it untouched.',
        'The result then depends only on the event sequence, the starting position and the limit.',
      ],
      example: {
        language: 'cpp',
        code: cpp(`
          #include <cstddef>
          #include <iostream>
          #include <set>
          #include <vector>
          int main() {
            std::vector<int> ids = {1, 1, 2, 3};
            std::vector<int> deltas = {3, 3, 9, -2};
            int limit = 5;
            std::set<int> seen;
            int position = 0;
            for (std::size_t i = 0; i < ids.size(); ++i) {
              if (seen.insert(ids[i]).second) {
                long long next = static_cast<long long>(position) + deltas[i];
                if (next >= -static_cast<long long>(limit) && next <= limit) position = static_cast<int>(next);
              }
            }
            std::cout << position << "\\n";
          }
        `),
        output: '1',
        explanation:
          'Event 1 moves the position to 3, its duplicate is skipped, event 2 would reach 12 and is rejected, and event 3 brings it to 1.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          cpp(`
            #include <cstddef>
            #include <iostream>
            #include <set>
            #include <vector>
            int main() {
              std::vector<int> ids = {1, 2, 3};
              std::vector<int> deltas = {4, 4, -6};
              int limit = 5;
              std::set<int> seen;
              int position = 0;
              for (std::size_t i = 0; i < ids.size(); ++i) {
                if (seen.insert(ids[i]).second) {
                  long long next = static_cast<long long>(position) + deltas[i];
                  if (next >= -static_cast<long long>(limit) && next <= limit) position = static_cast<int>(next);
                }
              }
              std::cout << position << "\\n";
            }
          `),
          '-2',
          'The second event would reach 8 and is rejected, so the last event starts from 4.',
        ),
        typeOutput(
          'The handler counts each outcome. What is printed?',
          cpp(`
            #include <cstddef>
            #include <iostream>
            #include <set>
            #include <vector>
            int main() {
              std::vector<int> ids = {7, 7, 8, 9};
              std::vector<int> deltas = {2, 2, -9, 1};
              int limit = 3;
              std::set<int> seen;
              int position = 0;
              int accepted = 0;
              int duplicates = 0;
              int rejected = 0;
              for (std::size_t i = 0; i < ids.size(); ++i) {
                if (seen.insert(ids[i]).second) {
                  long long next = static_cast<long long>(position) + deltas[i];
                  if (next >= -static_cast<long long>(limit) && next <= limit) {
                    position = static_cast<int>(next);
                    accepted += 1;
                  } else {
                    rejected += 1;
                  }
                } else {
                  duplicates += 1;
                }
              }
              std::cout << accepted << " " << duplicates << " " << rejected << " " << position << "\\n";
            }
          `),
          '2 1 1 3',
          '7 is accepted (2), its copy is a duplicate, 8 would reach -7 and is rejected, and 9 reaches exactly 3.',
        ),
        choose(
          'What is wrong with this handler?',
          [
            'Nothing; the rejection branch handles it',
            'A rejected delta is already in position',
            'It checks the limit twice for every event',
            'It rejects valid events at the limit',
          ],
          1,
          'The state is mutated before the check, so rejection would need an undo that is missing.',
          cpp(`
            position += delta;
            if (position > limit || position < -limit) {
              // reject the event
            }
          `),
        ),
        choose(
          'Why is this handler deterministic?',
          [
            'It uses a mutex around the position',
            'It sorts the events before applying them',
            'It reads the clock once per event',
            'Only the events, start and limit affect it',
          ],
          3,
          'No hidden input such as time or thread scheduling affects the outcome.',
        ),
      ],
    },
    {
      title: 'A rejected event’s id is still consumed',
      explanation: [
        'In this handler the id is recorded before the risk check, so a rejected event is marked as seen too. A redelivery of that same event is skipped as a duplicate rather than re-evaluated, even if the position has moved and it would now fit.',
        'That implements the contract "each event id gets exactly one decision". It keeps replays consistent: the same log always yields the same accept and reject decisions.',
      ],
      example: {
        language: 'cpp',
        code: cpp(`
          #include <cstddef>
          #include <iostream>
          #include <set>
          #include <vector>
          int main() {
            std::vector<int> ids = {5, 6, 5};
            std::vector<int> deltas = {9, -4, 9};
            int limit = 5;
            std::set<int> seen;
            int position = 0;
            for (std::size_t i = 0; i < ids.size(); ++i) {
              if (seen.insert(ids[i]).second) {
                long long next = static_cast<long long>(position) + deltas[i];
                if (next >= -static_cast<long long>(limit) && next <= limit) position = static_cast<int>(next);
              }
            }
            std::cout << position << "\\n";
          }
        `),
        output: '-4',
        explanation:
          'Event 5 is rejected but its id is recorded, so its redelivery is skipped even though -4 + 9 = 5 would now fit.',
      },
      questions: [
        typeOutput(
          'This variant records an id only when its event is accepted. What is printed?',
          cpp(`
            #include <cstddef>
            #include <iostream>
            #include <set>
            #include <vector>
            int main() {
              std::vector<int> ids = {5, 6, 5};
              std::vector<int> deltas = {9, -4, 9};
              int limit = 5;
              std::set<int> seen;
              int position = 0;
              for (std::size_t i = 0; i < ids.size(); ++i) {
                if (seen.count(ids[i]) == 0) {
                  long long next = static_cast<long long>(position) + deltas[i];
                  if (next >= -static_cast<long long>(limit) && next <= limit) {
                    position = static_cast<int>(next);
                    seen.insert(ids[i]);
                  }
                }
              }
              std::cout << position << "\\n";
            }
          `),
          '5',
          'The rejected event 5 was not recorded, so its redelivery is evaluated again and now fits.',
        ),
        choose(
          'Which contract does recording the id before the risk check implement?',
          [
            'Each event id gets exactly one decision',
            'Rejected events are retried until they are accepted',
            'Only accepted ids are remembered',
            'Ids are ignored',
          ],
          0,
          'Recording first makes the first decision final for that id.',
        ),
        typeOutput(
          'What does this program print?',
          cpp(`
            #include <cstddef>
            #include <iostream>
            #include <set>
            #include <vector>
            int main() {
              std::vector<int> ids = {1, 2, 1};
              std::vector<int> deltas = {2, 6, 2};
              int limit = 5;
              std::set<int> seen;
              int position = 0;
              for (std::size_t i = 0; i < ids.size(); ++i) {
                if (seen.insert(ids[i]).second) {
                  long long next = static_cast<long long>(position) + deltas[i];
                  if (next >= -static_cast<long long>(limit) && next <= limit) position = static_cast<int>(next);
                }
              }
              std::cout << position << "\\n";
            }
          `),
          '2',
          'Event 1 is accepted, event 2 would reach 8 and is rejected, and the redelivered event 1 is a duplicate.',
        ),
        choose(
          'Why does one decision per id help when the same log is replayed later?',
          [
            'It makes every replay faster',
            'It lets replays skip the risk check entirely',
            'It does not matter for replays at all',
            'Replays reach the same decisions every time',
          ],
          3,
          'Decisions depend only on the log, not on how often an event was redelivered.',
        ),
      ],
    },
  ],
};

export const knowledgePoints: KnowledgePointModule = {
  ...threads,
  ...signals,
  ...atomics,
  ...ordering,
  ...futures,
  ...memoryModels,
  ...layout,
  ...measurement,
  ...orderBook,
  ...ringBuffers,
  ...protocols,
  ...riskChecks,
  ...pipelines,
  ...determinism,
};
