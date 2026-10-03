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

export const knowledgePoints: KnowledgePointModule = {
  ...threads,
};
