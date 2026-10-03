import {
  choose,
  part,
  typeNumber,
  typeOutput,
  typeSetupOutput,
  type MultistepModule,
} from './authoring';

// Multistep problems for C++ (CEN-163). The setup's code is a complete C++20
// program; an output part without code asks what it prints, and an output
// part with code is a complete program of its own. Catalog tests compile and
// run both with clang++ or g++.

export const multistepProblems: MultistepModule = {
  'cpp-determinism': [
    {
      title: 'Apply risk events exactly once',
      setup: {
        text: [
          'A risk engine applies trade events `(id, quantity)` to a position that must stay within ±100. A repeated id is skipped, and an event that would break the limit is rejected, but its id still counts as seen.',
        ],
        code: `#include <iostream>
#include <set>
#include <utility>
#include <vector>

int main() {
    std::set<int> seen;
    long long position = 0;
    const long long limit = 100;
    std::vector<std::pair<int, long long>> events = {
        {1, 60}, {2, 30}, {1, 60}, {3, 50}, {4, -40}};
    for (const auto& [id, quantity] : events) {
        if (!seen.insert(id).second) {
            continue;
        }
        long long next = position + quantity;
        if (next > limit || next < -limit) {
            continue;
        }
        position = next;
    }
    std::cout << position << " " << seen.size() << "\\n";
}`,
      },
      parts: [
        part(
          'cpp-idempotent-message-kp1',
          choose(
            'What is `seen.insert(id).second` when event 1 arrives the second time?',
            [
              '`false`: 1 is already in the set',
              '`true`: the insert replaces the old 1',
              '`false`: the set is full after two ids',
              '`true`: a set may hold 1 twice',
            ],
            0,
            '`insert` returns a pair whose `second` tells whether the value was new. A set already holding 1 leaves it alone and reports `false`.',
          ),
        ),
        part(
          'cpp-position-bound-kp1',
          typeNumber(
            'What position would event 3 leave if it were applied?',
            140,
            'The position is 90 after events 1 and 2, and $90 + 50 = 140$ is above the limit of 100, so it is rejected.',
          ),
        ),
        part(
          'cpp-determinism-kp2',
          typeSetupOutput(
            'What does the program print?',
            '50 4',
            'Events 1, 2, and 4 apply: $60 + 30 - 40 = 50$. All four distinct ids were inserted, including the rejected event 3.',
          ),
        ),
        part(
          'cpp-structured-bindings-kp3',
          choose(
            'What does `const auto& [id, quantity]` do in the loop?',
            [
              'Names the two members of each pair, without copying it',
              'Copies each pair into two new variables that it may then change',
              'Sorts the events by id before visiting them',
              'Skips any event whose quantity is negative',
            ],
            0,
            'A structured binding gives names to the parts of each element; `const auto&` binds to the element itself, read-only.',
          ),
        ),
      ],
    },
  ],
  'cpp-callbacks': [
    {
      title: 'Count with copied and shared callbacks',
      setup: {
        text: [
          '`counter` keeps its own count in a mutable lambda. `stored` is a copy of it made before any call, and `shared` counts through a reference to a variable of `main`.',
        ],
        code: `#include <functional>
#include <iostream>

int main() {
    int calls = 0;
    auto counter = [count = 0]() mutable { return ++count; };
    std::function<int()> stored = counter;
    counter();
    counter();
    auto shared = [&calls]() { return ++calls; };
    shared();
    std::cout << counter() << " " << stored() << " " << shared() << "\\n";
}`,
      },
      parts: [
        part(
          'cpp-mutable-lambda-kp1',
          typeNumber(
            'What does the first call to `counter()` return?',
            1,
            'The closure starts with its own `count` at 0, and `mutable` lets the call increment it to 1.',
          ),
        ),
        part(
          'cpp-callbacks-kp2',
          typeSetupOutput(
            'What does the program print?',
            '3 1 2',
            '`counter` reaches 3 on its third call. `stored` copied the closure while its count was 0, so its first call returns 1. `shared` changes `calls` itself: 2.',
          ),
        ),
        part(
          'cpp-lambda-reference-capture-kp2',
          typeNumber(
            'What is `calls` at the end of `main`?',
            2,
            'The reference capture changes the original variable, once per call of `shared`.',
          ),
        ),
        part(
          'cpp-callbacks-kp3',
          choose(
            'How could `counter` and `stored` share one count?',
            [
              'Capture a pointer or reference to a single count',
              'Mark the lambda `mutable` a second time',
              'Copy the lambda into `stored` after each call',
              'Declare `count` as `const int` in the capture',
            ],
            0,
            'Each copy of a closure carries its own captured values; only an indirection to one object makes the state shared.',
          ),
        ),
      ],
    },
  ],
  'cpp-digit-palindrome': [
    {
      title: 'Check numbers that read the same backwards',
      setup: {
        text: [
          '`palindrome` writes a number’s digits as text without its sign, reverses a copy, and compares the two. `std::cout` prints `true` as 1 and `false` as 0.',
        ],
        code: `#include <algorithm>
#include <cstdlib>
#include <iostream>
#include <string>

bool palindrome(int value) {
    std::string digits = std::to_string(std::abs(value));
    std::string reversed = digits;
    std::reverse(reversed.begin(), reversed.end());
    return digits == reversed;
}

int main() {
    std::cout << palindrome(1221) << " " << palindrome(-121) << " "
              << palindrome(120) << "\\n";
}`,
      },
      parts: [
        part(
          'cpp-to-string-kp1',
          typeOutput(
            'What does this program print?',
            `#include <iostream>
#include <string>

int main() {
    std::string text = std::to_string(-121);
    std::cout << text.size() << " " << text << "\\n";
}`,
            '4 -121',
            '`std::to_string` keeps the minus sign, so the text has four characters.',
          ),
        ),
        part(
          'cpp-abs-value-kp1',
          typeNumber(
            'What is `std::abs(-121)`?',
            121,
            'The magnitude drops the sign, so the digits can be compared without a leading minus.',
          ),
        ),
        part(
          'cpp-digit-palindrome-kp2',
          typeSetupOutput(
            'What does the program print?',
            '1 1 0',
            '1221 reverses to itself; −121 becomes 121, which does too; 120 reverses to 021, which differs.',
          ),
        ),
        part(
          'cpp-reverse-range-kp2',
          typeOutput(
            'What does this program print?',
            `#include <algorithm>
#include <iostream>
#include <string>

int main() {
    std::string digits = "12345";
    std::reverse(digits.begin() + 1, digits.end() - 1);
    std::cout << digits << "\\n";
}`,
            '14325',
            'The range skips the first and last characters, so only 2, 3, and 4 are reversed in place.',
          ),
        ),
      ],
    },
  ],
  'cpp-iterators': [
    {
      title: 'Remove items while walking a vector',
      setup: {
        text: [
          'The loop removes every age above 10 from the vector while it walks it, keeping the rest in their order.',
        ],
        code: `#include <iostream>
#include <vector>

int main() {
    std::vector<int> ages = {5, 12, 3, 15, 7};
    for (auto it = ages.begin(); it != ages.end();) {
        if (*it > 10) {
            it = ages.erase(it);
        } else {
            ++it;
        }
    }
    std::cout << ages.size() << ": " << ages[0] << " " << ages[1] << " "
              << ages[2] << "\\n";
}`,
      },
      parts: [
        part(
          'cpp-vectors-kp1',
          typeNumber(
            'Right after 12 is erased, what is `ages[1]`?',
            3,
            'Erasing closes the gap: every later element moves one place forward, so 3 is now at index 1.',
          ),
        ),
        part(
          'cpp-iterators-kp2',
          choose(
            'Why is `it` set to what `erase` returns instead of being incremented?',
            [
              'The erased iterator is invalid; `erase` returns the next one',
              'Incrementing would always skip the first element of the vector',
              '`erase` moves `it` back to the start of the vector',
              'Iterators cannot be incremented inside a loop',
            ],
            0,
            'After `erase`, the old iterator must not be used at all. The returned iterator points at the element that followed the erased one.',
          ),
        ),
        part(
          'cpp-iterators-kp3',
          typeSetupOutput(
            'What does the program print?',
            '3: 5 3 7',
            '12 and 15 are removed; erasing keeps the remaining elements in their original order.',
          ),
        ),
        part(
          'cpp-reallocation-invalidation-kp1',
          choose(
            'A program saves `int* first = &ages[0];`, then calls `push_back` when the size equals the capacity. What about `first`?',
            [
              'It may dangle: the elements can move to new storage',
              'It still points at the first element, wherever it is',
              'It now points at the newly added last element',
              'It becomes a null pointer that is safe to test',
            ],
            0,
            'Growing past the capacity reallocates, moving every element; pointers and iterators into the old storage are invalid.',
          ),
        ),
      ],
    },
  ],
  'cpp-frame-length': [
    {
      title: 'Check that a whole frame has arrived',
      setup: {
        text: [
          'Frames start with a two-byte big-endian length. `frame_length` returns that length once the header and the whole payload have arrived, and −1 until then.',
        ],
        code: `#include <cstddef>
#include <cstdint>
#include <iostream>
#include <span>
#include <vector>

int frame_length(std::span<const std::uint8_t> bytes) {
    if (bytes.size() < 2) {
        return -1;
    }
    int length = bytes[0] * 256 + bytes[1];
    if (bytes.size() - 2 < static_cast<std::size_t>(length)) {
        return -1;
    }
    return length;
}

int main() {
    std::vector<std::uint8_t> full = {0, 3, 7, 8, 9};
    std::vector<std::uint8_t> partial = {0, 3, 7};
    std::cout << frame_length(full) << " " << frame_length(partial) << "\\n";
}`,
      },
      parts: [
        part(
          'cpp-big-endian-word-kp1',
          typeNumber(
            'A header holds the bytes `[2, 1]`. What length does it announce?',
            513,
            'The high byte comes first: $2 \\times 256 + 1 = 513$.',
          ),
        ),
        part(
          'cpp-frame-length-kp2',
          typeSetupOutput(
            'What does the program print?',
            '3 -1',
            'Both buffers announce 3 payload bytes. `full` has all three after the header; `partial` has only one, so it is not complete yet.',
          ),
        ),
        part(
          'cpp-frame-length-kp1',
          choose(
            'Why does `frame_length` check `bytes.size() < 2` first?',
            [
              'Reading `bytes[1]` before two bytes arrive is out of range',
              'Frames shorter than two bytes are always valid',
              'The length must be known before the span is made',
              'A span cannot hold fewer than two elements',
            ],
            0,
            'The length needs both header bytes; with fewer, indexing would read past the end of the received data.',
          ),
        ),
        part(
          'cpp-span-size-kp2',
          choose(
            'Why can `frame_length(full)` take a `std::vector` when its parameter is a `std::span`?',
            [
              'A span views any contiguous elements without copying them',
              'The vector is copied into a new span for the call',
              'A span is another name for a vector of bytes',
              'The compiler converts the span into a vector',
            ],
            0,
            'A span borrows a pointer and a size, so arrays and vectors of the element type all fit; the vector must outlive the call.',
          ),
        ),
      ],
    },
  ],
  'cpp-tie-break-order': [
    {
      title: 'Rank bids by price, then by id',
      setup: {
        text: [
          'An exchange ranks bids by highest price first. Bids at the same price are ranked by lower id first, so the order never depends on how the input happened to be arranged.',
        ],
        code: `#include <algorithm>
#include <iostream>
#include <utility>
#include <vector>

int main() {
    // Each bid is (price, id).
    std::vector<std::pair<int, int>> bids = {{101, 7}, {103, 2}, {101, 3}, {99, 1}};
    std::sort(bids.begin(), bids.end(), [](const auto& a, const auto& b) {
        if (a.first != b.first) {
            return a.first > b.first;
        }
        return a.second < b.second;
    });
    std::cout << bids[0].second << " " << bids[1].second << " "
              << bids[2].second << " " << bids[3].second << "\\n";
}`,
      },
      parts: [
        part(
          'cpp-pair-members-kp1',
          typeNumber(
            'Before sorting, what is `bids[2].second`?',
            3,
            'The third pair is `{101, 3}`, and `.second` is its id.',
          ),
        ),
        part(
          'cpp-tie-break-order-kp2',
          typeSetupOutput(
            'What does the program print?',
            '2 3 7 1',
            'Prices descend: 103, then the two bids at 101 with id 3 before id 7, then 99.',
          ),
        ),
        part(
          'cpp-sort-order-kp3',
          choose(
            'Why does the comparator use `a.first > b.first` rather than `>=`?',
            [
              'A comparator must be strict: equal items compare false',
              'With `>=`, ties would always come out in input order',
              '`>=` sorts the prices from lowest to highest instead',
              '`std::sort` does not accept the `>=` operator',
            ],
            0,
            '`std::sort` needs a strict weak ordering; returning true for equal elements breaks it and is undefined behavior.',
          ),
        ),
        part(
          'cpp-auto-parameters-kp2',
          choose(
            'What does `const auto& a` let the comparator do?',
            [
              'Read each pair without copying it, whatever its type',
              'Change the pairs in place while they are sorted',
              'Accept only pairs of `int`, checked at run time',
              'Store a copy of every pair it compares',
            ],
            0,
            '`auto` deduces the element type, and `const auto&` binds to it read-only, so no pair is copied per comparison.',
          ),
        ),
      ],
    },
  ],
  'cpp-order-book': [
    {
      title: 'Read the spread of an order book',
      setup: {
        text: [
          'Each side of a small order book maps a price to the total size waiting there. A `std::map` keeps its keys sorted from low to high.',
        ],
        code: `#include <iostream>
#include <map>

int main() {
    // Price levels: price to total size.
    std::map<int, int> bids = {{99, 5}, {100, 2}, {98, 7}};
    std::map<int, int> asks = {{102, 4}, {101, 1}, {105, 3}};
    int best_bid = bids.rbegin()->first;
    int best_ask = asks.begin()->first;
    std::cout << best_bid << " " << best_ask << " " << best_ask - best_bid << "\\n";
}`,
      },
      parts: [
        part(
          'cpp-book-best-bid-kp1',
          typeNumber(
            'What is the best bid?',
            100,
            'The best bid is the highest price, the map’s last key, which `rbegin()` points to.',
          ),
        ),
        part(
          'cpp-order-book-kp1',
          typeSetupOutput(
            'What does the program print?',
            '100 101 1',
            'The best ask is the lowest ask, the first key: 101. The spread is $101 - 100 = 1$.',
          ),
        ),
        part(
          'cpp-book-best-bid-kp2',
          choose(
            'What must the code check before reading `bids.rbegin()->first`?',
            [
              'That `bids` is not empty',
              'That `bids` is sorted',
              'That the best bid is positive',
              'That `asks` has three levels',
            ],
            0,
            'On an empty map, `rbegin()` equals `rend()`, and dereferencing it is undefined behavior.',
          ),
        ),
        part(
          'cpp-order-book-kp2',
          choose(
            'A bid at 103 is added. What should the spread function do now?',
            [
              'Report no spread: the book is crossed',
              'Report a spread of −2 as usual',
              'Report a spread of 2, the absolute value',
              'Report the old spread of 1 until a trade',
            ],
            0,
            'With the best bid above the best ask, the book is crossed: those orders should have traded, so a spread is meaningless.',
          ),
        ),
      ],
    },
  ],
  'cpp-book-add-level': [
    {
      title: 'Aggregate orders into price levels',
      setup: {
        text: [
          'Orders `(price, size)` are added to their price level. An order with a size of zero or less is rejected before it touches the book.',
        ],
        code: `#include <iostream>
#include <map>
#include <utility>
#include <vector>

int main() {
    std::map<int, int> levels;
    // Each order is (price, size).
    std::vector<std::pair<int, int>> orders = {
        {100, 5}, {101, 2}, {100, 3}, {99, 0}, {101, -1}};
    int rejected = 0;
    for (const auto& [price, size] : orders) {
        if (size <= 0) {
            ++rejected;
            continue;
        }
        levels[price] += size;
    }
    std::cout << levels.size() << " " << levels[100] << " " << rejected << "\\n";
}`,
      },
      parts: [
        part(
          'cpp-unordered-frequency-kp1',
          typeNumber(
            'For a price not yet in the map, what does `levels[price]` hold just before `+= size` adds to it?',
            0,
            '`operator[]` inserts a missing key with a value-initialized `int`, 0, so adding works for new and existing levels alike.',
          ),
        ),
        part(
          'cpp-book-add-level-kp1',
          typeNumber(
            'What total size is at price 101?',
            2,
            'Only the order of size 2 is added; the order of size −1 is rejected.',
          ),
        ),
        part(
          'cpp-book-add-level-kp2',
          typeSetupOutput(
            'What does the program print?',
            '2 8 2',
            'Two levels exist, 100 and 101; level 100 holds $5 + 3 = 8$; the orders of size 0 and −1 were rejected, so no level 99 was created.',
          ),
        ),
      ],
    },
  ],
};
