import { choose, predictOutput, type KnowledgePointModule } from './authoring';

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
        predictOutput(
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
          ['25', '30', '20', '15'],
          1,
          'join() returns only after the worker has added 5, so main doubles 15 and prints 30.',
        ),
        predictOutput(
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
          ['15', '4', '7', '3'],
          2,
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
        predictOutput(
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
          ['2', '6', '0', '3'],
          1,
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
            'It runs the empty lambda a second time',
            'It throws std::system_error, because worker is no longer joinable',
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
        predictOutput(
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
          ['201', '101', '100', '200'],
          1,
          'The worker uses its own copy of price, taken as 100 when the lambda was created.',
        ),
        predictOutput(
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
          ['30', '90', '40', '0'],
          2,
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
            'It is always 2',
            'It is always 14',
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
        predictOutput(
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
          ['100', '32', '23', '93'],
          2,
          'Both arguments are evaluated and copied when the thread is constructed: a is 2 and b is 3.',
        ),
        predictOutput(
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
          ['6', '1', '5', '11'],
          0,
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
        predictOutput(
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
          ['11 11', '1 11', '11 1', '1 1'],
          1,
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
        predictOutput(
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
          ['20 15 10', '10 15 20', '45', '10 10 10'],
          1,
          'Each worker writes only its own variable; the join order does not change which value lands where.',
        ),
        predictOutput(
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
          ['64', '72', '56', '63'],
          3,
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
            'Both workers add into one shared int',
            'Each worker writes its own int; main adds them after joining both',
            'Each worker reads the other’s int while it runs',
            'main adds the two ints before joining the workers',
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
            'Two threads read limit at the same time',
            'One thread writes x while another reads x, with no join or lock between them',
            'One thread writes x while another writes y',
            'A worker writes x, main joins it, then main reads x',
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
        predictOutput(
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
          ['8', '12', '4', '0'],
          2,
          'The workers produce 100, 108 and 4 from the shared read-only qty; 108 - 100 - 4 is 4.',
        ),
        choose(
          'Three workers read the same `const int threshold` and each writes its own result. What protection does threshold need?',
          [
            'A mutex around every read of threshold',
            'None, because no thread writes threshold while they run',
            'Each worker must capture threshold by reference',
            'An atomic, because three threads read it',
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
        predictOutput(
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
          ['0', '12', '42', '30'],
          2,
          'Both jthreads are joined when the inner scope ends, so both writes are finished before the print.',
        ),
        predictOutput(
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
          ['7', '0', '21', '14'],
          3,
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
            'Both call std::terminate',
            'Both join automatically',
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
        predictOutput(
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
          ['3\n4', '4\n3', '0\n0', '0\n4'],
          1,
          'Destruction runs in reverse: wb and wa join first, then b prints 4 and a prints 3.',
        ),
        choose(
          'What is wrong with this order of declarations?',
          [
            'Nothing: the jthread joins before anything is destroyed',
            'result is destroyed before worker joins, so the worker may write to a dead object',
            'A default-constructed jthread cannot be assigned a new worker',
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
        predictOutput(
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
          ['log 2\nafter 2', 'after 0\nlog 2', 'after 2\nlog 2', 'after 2'],
          2,
          'The inner jthread joins at its closing brace, so main sees 2; log is destroyed last, at the end of main.',
        ),
        choose(
          'A jthread’s worker adds into an int named total. Where should total be declared?',
          [
            'After the jthread, so it is destroyed first',
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
        predictOutput(
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
          ['10', '30', '5', '6'],
          1,
          'Each multiplication runs alone under m, and multiplication order does not matter, so the result is 2 * 3 * 5.',
        ),
        choose(
          'When does a std::lock_guard release its mutex?',
          [
            'Only when unlock() is called on it',
            'Right after the next statement',
            'When its scope ends, including when an exception leaves the scope',
            'When the thread that created it finishes',
          ],
          2,
          'lock_guard has no unlock member; its destructor unlocks when the scope is left by any path.',
        ),
        choose(
          'What does the lock_guard protect in this worker?',
          [
            'The update total += 1',
            'Nothing: it unlocks at its own closing brace, before the update',
            'Every access to total in the program',
            'The whole lambda body',
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
        predictOutput(
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
          ['3 1', '2 2', '6 2', '5 3'],
          3,
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
            'lock_guard needs an explicit unlock call',
            'total must be captured by value',
            'Each worker locks its own separate mutex, so they never exclude each other',
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
            'The read races with the writes, so the program has undefined behavior',
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
        predictOutput(
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
          ['6', '20', '12', '8'],
          2,
          'Each worker adds 0 + 1 + 2 + 3 = 6 under the lock, and two workers give 12.',
        ),
        predictOutput(
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
          ['500', '750', '1000', '1500'],
          3,
          'Each worker adds 2 a total of 250 times (500), and none of the locked updates is lost: 3 * 500.',
        ),
        choose(
          'Two threads run this lambda. Why can the final total be less than 2000?',
          [
            'The lock is released too late',
            'Both threads can read the same old total before either writes, so increments are lost',
            'A lock_guard cannot be created inside a loop',
            'seen is shared between the two threads',
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
            'It ends somewhere between 1000 and 2000',
            'Nothing: the program has a data race and undefined behavior',
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
        predictOutput(
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
          ['210', '190', '45', '145'],
          1,
          'The half-open ranges cover 0 through 19 exactly once: 45 + 145 = 190.',
        ),
        predictOutput(
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
          ['10 10', '10 2', '10 6', '6 10'],
          2,
          'Both workers contribute 5 to total, but per_item locks 5 times and batched locks once: 6 locks.',
        ),
        choose(
          'Why does each worker sum into `local` before locking?',
          [
            'local is atomic, so it needs no lock',
            'It removes the need for the mutex altogether',
            'It forces the workers to run one after the other',
            'Only the final merge touches shared state, so the lock is taken once per worker',
          ],
          3,
          'local is private to its thread; only the merge into total needs mutual exclusion.',
        ),
        choose(
          'Two threads call this on different ranges. What is true?',
          [
            'The result is correct, but one worker waits while the other runs its whole loop',
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
        predictOutput(
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
          ['40 40', '45 35', '55 25', '50 30'],
          1,
          'Both transfers complete under both locks: a is 50 - 10 + 5 and b is 30 + 10 - 5.',
        ),
        choose(
          'Which statement describes `std::scoped_lock lock(m1, m2);`?',
          [
            'It locks m1 and then m2, always in that order',
            'It locks whichever mutex is free and skips the other',
            'It acquires both without deadlocking against other scoped_locks and releases both at scope exit',
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
            'Reads never need locks; only the transfer does',
            'Without both locks it could read during the transfer, and its reads would race with the writes',
            'scoped_lock refuses to lock a single mutex',
            'Locking both forces the audit to run before the transfer',
          ],
          1,
          'Exclusion only applies between threads that lock the same mutexes, and unlocked reads of written data are data races.',
        ),
        predictOutput(
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
          ['7', '17', '5', '12'],
          3,
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
        predictOutput(
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
          ['1 1', '0 1', '1 0', '0 0'],
          1,
          'std::defer_lock leaves m unlocked at construction; the explicit lock() then takes it.',
        ),
        choose(
          'What happens at the second unlock()?',
          [
            'Nothing; unlocking twice is harmless',
            'It unlocks m a second time, letting two threads in',
            'It throws std::system_error, because the lock no longer owns m',
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
            'It unlocks the mutex anyway',
            'It throws std::system_error',
            'It locks and then unlocks the mutex',
          ],
          0,
          'The destructor checks ownership and unlocks only when owns_lock() is true.',
        ),
        predictOutput(
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
          ['11 0', '1 1', '10 0', '11 1'],
          3,
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
            'Nothing, because every access to total holds m',
            'A unique_lock cannot be locked again after unlock()',
            'It deadlocks at the second lock()',
            'One thread’s addition can be overwritten, because total may change while the lock is released',
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
        predictOutput(
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
          ['112', '124', '114', '110'],
          1,
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
            'unique_lock can start unlocked and lock later within its scope',
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
        predictOutput(
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
          ['0', '3', 'Nothing: it waits forever', '1'],
          1,
          'The condition is already satisfied, so the loop body never runs and the program prints 3 without waiting.',
        ),
        predictOutput(
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
          ['0', 'Either 0 or 5', '5', 'Nothing: it waits forever'],
          2,
          'An early notification is lost, but the loop checks count first; it is already 5, so main does not wait.',
        ),
        choose(
          'Why is the condition checked in a while loop around cv.wait(lock) rather than in an if?',
          [
            'A loop makes wait return sooner',
            'An if would keep the mutex locked while waiting',
            'wait can return without a matching change, so the condition must be checked again',
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
            'wait returns at once, because the notification was stored',
            'wait can block forever: the notification came before anyone waited and there is no state to check',
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
        predictOutput(
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
          ['0', '1', 'Nothing: it waits forever', '2'],
          3,
          'Both notifications were lost, but the count recorded both jobs, and main reads it without waiting.',
        ),
        choose(
          'What should a waiting thread check before deciding that data is available?',
          [
            'That cv.wait has returned',
            'The shared state, such as a count or flag, while holding the mutex',
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
        predictOutput(
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
          ['0 1', '70 71', '70 1', '0 71'],
          1,
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
            'It must notify before it sets ready',
            'Nothing, because notify_one synchronizes the write',
            'It writes ready without locking m, which races with the consumer’s read',
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
            'Always the final payload',
            'ready set to true while payload still holds its old value',
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
        predictOutput(
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
          ['0', '25', '100', '4'],
          2,
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
        predictOutput(
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
          ['0', '9', '-3', '6'],
          3,
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
        predictOutput(
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
          ['0', 'Nothing: it deadlocks', '20', '2'],
          2,
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
            'lock_guard would notify automatically',
            'wait must unlock and later relock the mutex, which lock_guard cannot do',
          ],
          3,
          'Only unique_lock exposes unlock and lock, which wait uses around the blocking interval.',
        ),
        choose(
          'When cv.wait(lock) returns, what is true?',
          [
            'The mutex is locked again, but the condition must still be checked',
            'The mutex is unlocked and the condition is true',
            'The mutex is locked and the condition is guaranteed true',
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
            'The consumer’s reads of ready are not ordered with the producer’s write, so they race and can miss the change',
            'cv.wait only accepts the first mutex it was ever used with',
            'The producer must lock other instead of m when it notifies',
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
        predictOutput(
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
          ['1', '4', '3', '7'],
          3,
          'main keeps waiting until all three weights have been added under m.',
        ),
        choose(
          'A consumer holds a lock_guard on log_m and then waits on cv with a unique_lock on m. The producer needs log_m before it can set the condition. What happens?',
          [
            'The producer proceeds, because wait releases every mutex the thread holds',
            'wait releases log_m because it was locked first',
            'The producer blocks on log_m, so the condition never changes and both threads are stuck',
            'The program does not compile',
          ],
          2,
          'wait releases only m; log_m stays locked, so the producer can never reach the state change.',
        ),
        predictOutput(
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
          ['132', '123', '12', '213'],
          1,
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
        predictOutput(
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
          ['2 13', '0 0', '1 4', '2 9'],
          0,
          'The consumer can only see the state before the block (and keeps waiting) or after it, with both items queued.',
        ),
        choose(
          'A consumer waits with `while (queue.empty()) cv.wait(lock);`. The producer’s last item is taken by another consumer, and then the producer stops for good. What happens to this consumer?',
          [
            'It wakes up when the producer thread ends',
            'It receives the last item as well',
            'It throws when the producer’s thread object is destroyed',
            'It sleeps forever, because no item will arrive and nothing else ends the wait',
          ],
          3,
          'Its condition can only become true through a new item, so without a closed flag nothing can release it.',
        ),
        choose(
          'After `while (!closed && queue.empty()) cv.wait(lock);` ends, how should the consumer tell data from shutdown?',
          [
            'If closed is true, stop, even if items remain',
            'If the queue is not empty, take an item; otherwise it is closed and empty, so stop',
            'Always take queue.front()',
            'Check whether notify_all was called',
          ],
          1,
          'Items queued before the close are still data; only an empty, closed queue means stop.',
        ),
        predictOutput(
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
          ['-1', '8', '0', 'Nothing: it waits forever'],
          1,
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
        predictOutput(
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
          ['3', '4', '0', '7'],
          3,
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
        predictOutput(
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
          ['-1 2', '1 1', '2 1', '1 0'],
          1,
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
        predictOutput(
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
          ['14', '7', '0', 'Undefined: the stores race'],
          1,
          'Concurrent stores to an atomic are not a data race; both store 7, so 7 is the final value.',
        ),
        predictOutput(
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
          ['3 9', '8 8', '8 9', '9 9'],
          2,
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
            'Yes, because payload is written before ready',
            'No: payload is a plain int, and nothing orders main’s read after the worker’s write',
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
        predictOutput(
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
          ['7 2', '7 1', '0 1', '3 1'],
          1,
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
        predictOutput(
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
          ['4 5 5', '3 4 5', '3 3 5', '4 5 6'],
          1,
          'Each fetch_add returns the value before its own addition: 3, then 4, leaving 5.',
        ),
        predictOutput(
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
          ['14 10', '20 14', '20 10', '14 14'],
          2,
          'fetch_sub returns the old 20; -= returns the new value, 14 - 4 = 10.',
        ),
        predictOutput(
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
          ['7 8', '8 9', '8 8', '7 9'],
          3,
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
        predictOutput(
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
          ['70', '145', '115', '100'],
          2,
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
        predictOutput(
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
          ['0 2', '1 2', '2 2', '3 2'],
          1,
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
        predictOutput(
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
          ['0 3 0', '1 9 0', '0 3 3', '0 9 3'],
          2,
          'owner holds 3, not 0, so nothing is stored and expected is refreshed to 3.',
        ),
        predictOutput(
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
          ['11 7 5', '10 6 5', '01 7 6', '10 6 6'],
          3,
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
        predictOutput(
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
          ['1 8', '0 0', '0 8', '0 4'],
          3,
          'The second claim fails, and second_try reports the current owner, 4.',
        ),
        predictOutput(
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
          ['0 1 7', '0 1 6', '0 0 6', '1 1 6'],
          1,
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
        predictOutput(
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
          ['1 3 1', '0 2 1', '0 2 2', '1 3 2'],
          2,
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
        predictOutput(
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
          ['6', 'Any value up to 12', '12', '2'],
          2,
          'Relaxed ordering does not weaken atomicity; no addition is lost, so the total is 2 + 4 + 6.',
        ),
        predictOutput(
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
          ['10 10', '8 8', '10 12', '8 10'],
          3,
          'A relaxed fetch_add still returns the previous value, 8, and leaves 10.',
        ),
        choose(
          'What does std::memory_order_relaxed give up compared with the default ordering?',
          [
            'Atomicity: relaxed increments can be lost',
            'The single modification order of that atomic',
            'Ordering of other memory around the operation; the operation itself stays atomic',
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
        predictOutput(
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
          ['1', '1 or 2', '0', '2'],
          3,
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
        predictOutput(
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
          ['10', '30', '20', '8'],
          2,
          'Each worker adds 0 + 1 + 2 + 3 + 4 = 10, and both workers’ additions land.',
        ),
        predictOutput(
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
          ['4', '8', '16', '12'],
          1,
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
            'store needs memory_order_relaxed',
            'Atomics cannot be used inside loops',
            'total must be joined before it is read',
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
        predictOutput(
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
          ['10 2', '10 10', '7 2', '3 2'],
          0,
          'The slices hold 3 and 7 indices, and each worker touches calls once.',
        ),
        predictOutput(
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
          ['36', '40', '45', '30'],
          1,
          'Index 4 is in both slices, so it is counted twice: 10 + 30 = 40 instead of 36.',
        ),
        choose(
          'Compared with calling fetch_add for every element, what does accumulating into local and adding once change?',
          [
            'The final total',
            'Whether there is a data race on local',
            'How often the shared atomic is touched; the total is the same',
            'The order in which the workers finish',
          ],
          2,
          'local is private to its worker, so only the single fetch_add touches shared state.',
        ),
        choose(
          'Worker A handles indices [0, 50) and worker B handles [50, 100). Which statement is true?',
          [
            'Index 50 is counted twice',
            'Index 50 is skipped',
            'Index 100 is counted by B',
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
        predictOutput(
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
          ['0', 'Any of 0, 101 or 505', '101', '505'],
          3,
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
            'Nothing: the write comes after the release, so reading payload races with it',
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
        predictOutput(
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
          ['0 2', '42 0', '42 2', '6 2'],
          2,
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
            'Yes, the acquire load already synchronized',
            'Yes, as long as payload is an int',
            'No: unless the load returned the released value, nothing orders the payload write before the read',
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
        predictOutput(
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
          ['303', '300', '3', '0'],
          0,
          'The loop ends only after reading the released 3, which makes table’s 300 visible.',
        ),
        choose(
          'An acquire load returns 0, the value the flag had before the writer’s release store. What does the reader know about the payload?',
          [
            'That it has been written',
            'That it is still 0',
            'That the writer has finished',
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
            'It makes racing accesses to plain variables safe',
            'All seq_cst operations appear in one order that every thread agrees on',
            'It lets the compiler skip atomicity for speed',
            'It is weaker than acquire for loads',
          ],
          1,
          'seq_cst adds a single total order on top of acquire/release semantics.',
        ),
        predictOutput(
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
          ['0', '0 or 8', '8', 'Undefined'],
          2,
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
            'total ends at 2, because fetch_add is seq_cst',
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
            'The string accesses now race, because the counter does not keep the threads apart',
            'The string becomes atomic',
            'The accesses now run in counter order',
          ],
          1,
          'Incrementing a counter does not exclude other threads from the string the way a lock does.',
        ),
        predictOutput(
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
          ['0 3', '6 3', '3 2', '3 3'],
          3,
          'The three workers receive 0, 1 and 2 in some order, so the sum is 3 and next ends at 3.',
        ),
        choose(
          'When is memory_order_relaxed enough instead of the default seq_cst?',
          [
            'When the atomic only counts something and no other data depends on its value',
            'Whenever the atomic is an int',
            'When the atomic announces that a buffer is ready',
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
        predictOutput(
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
          ['12 12', '6 6', '6 12', '12 6'],
          3,
          'The successful exchange stores 12 and leaves expected at the value it matched, 6.',
        ),
        predictOutput(
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
          ['1', '11', '10', '0'],
          1,
          'The first attempt fails and refreshes expected to 10; the retry stores 10 + 1.',
        ),
        choose(
          'Why is compare_exchange_weak normally used in a loop?',
          [
            'It always fails on the first try',
            'It does not update expected when it fails',
            'It can fail spuriously even when the value matches, so it must be retried',
            'It succeeds only with memory_order_relaxed',
          ],
          2,
          'Spurious failures are allowed for weak, so a single call is not a reliable answer.',
        ),
        choose(
          'When is compare_exchange_strong the better choice?',
          [
            'For a single attempt whose failure means something, with no loop around it',
            'Inside a retry loop that recomputes desired',
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
            'Nothing, because the loop retries until it succeeds',
            'The loop can never succeed',
            'After a failure, the retry can store a total computed from a stale value, losing the other thread’s addition',
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
        predictOutput(
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
          ['15', '5', '3', '13'],
          3,
          'The retry matches the refreshed 5 but stores the stale 13 instead of the intended 5 + 10.',
        ),
        predictOutput(
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
          ['30 55', '40 55', '40 40', '30 30'],
          1,
          '30 is not above 40, so the loop stops without exchanging; 55 is higher and replaces 40.',
        ),
        predictOutput(
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
          ['10', 'Less than 30', '30', '20'],
          2,
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
        predictOutput(
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
          ['38 42', '42 38', '42 -38', '80 0'],
          1,
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
        predictOutput(
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
          ['0', '0 or 15', 'Undefined', '15'],
          3,
          'get() returns only after the task has finished, and its writes are visible afterwards.',
        ),
        choose(
          'What does future::get() do if the asynchronous call has not finished yet?',
          [
            'Returns a default value of 0',
            'Throws, because the result is missing',
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
        predictOutput(
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
          ['5', '0', '0 or 5', '10'],
          1,
          'Nobody called get() or wait(), so the deferred task never ran.',
        ),
        predictOutput(
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
          ['3 4', '3 0', '0 0', '0 4'],
          3,
          'Deferred tasks run only when their own future is waited on, so only second has run.',
        ),
        choose(
          'Code calls `std::async(work)` with no launch policy and assumes work starts on another thread at once. Why is that wrong?',
          [
            'Without a policy, async always runs work immediately on the caller',
            'The implementation may choose deferred, so work might not run until get() and then on the caller',
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
        predictOutput(
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
          ['1 0', '0 250', '1 250', '0 0'],
          2,
          'set_value synchronizes with the get() that returns its value, so the earlier write of detail is visible.',
        ),
        predictOutput(
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
          ['3', '-3', '103', '203'],
          0,
          'Each future receives its own promise’s value, whatever order they were set in: 103 - 100.',
        ),
        choose(
          'How does a thread obtain the value another thread passes to promise.set_value?',
          [
            'By reading the promise object directly',
            'By joining the thread that set it',
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
            'The second value is queued for a second get()',
            'std::future_error is thrown, because the promise is already satisfied',
            'Nothing; the call is ignored',
          ],
          2,
          'A promise’s shared state can be made ready only once.',
        ),
        choose(
          'A promise is destroyed without set_value ever being called. What does get() on its future do?',
          [
            'Blocks forever',
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
            'The second get() waits for a second set_value',
            'get() must be called on the promise instead',
            'A std::future can be read only once; the second get() is invalid',
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
        predictOutput(
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
          ['12', '35', '7', '5'],
          1,
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
        predictOutput(
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
          ['-8', '0', 'rejected negative', 'negative'],
          2,
          'The task throws before assigning result; get() rethrows, and the handler prints its message.',
        ),
        predictOutput(
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
          ['10', 'rejected negative', '0', '5'],
          0,
          'No exception is thrown; get() returns after the task has stored 10.',
        ),
        choose(
          'Where should the try block go to handle an exception thrown inside a std::async task?',
          [
            'Inside the task only; the caller can never see it',
            'Around the std::async call itself',
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
            'It is rethrown when the future is destroyed',
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
        predictOutput(
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
          ['111', '101', '11', '1'],
          2,
          'get() returns normally, so the whole try block runs and the handler does not.',
        ),
        predictOutput(
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
          ['105', '1105', '5', '1005'],
          3,
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
        predictOutput(
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
          ['50 100', '51 51', '0 0', '51 100'],
          3,
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
            'share() copies the value, so s.get() fails',
            'After share(), f no longer refers to the result, so f.get() is invalid',
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
        predictOutput(
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
          ['14 7', '7 7', '49 0', '49 7'],
          3,
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
        predictOutput(
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
          ['100 100', '80 90', '90 80', '0 0'],
          2,
          'Both workers receive 100 from the same shared state.',
        ),
        choose(
          'A team wants to send a new price to waiting threads every second. Is a promise with a shared_future a good fit?',
          [
            'Yes, call set_value every second',
            'Yes, as long as each thread copies the shared_future',
            'No, because shared_future cannot cross threads',
            'No: a promise can be fulfilled only once, so it delivers a single value',
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
        predictOutput(
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
          ['12', '24', '26', '13'],
          1,
          'Both threads read the same 12, giving 13 and 11.',
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
};
