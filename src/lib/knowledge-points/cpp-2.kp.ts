import { choose, predictOutput, type KnowledgePointModule } from '.';

// C++ units cpp-containers, cpp-generic, cpp-errors and cpp-tooling.
export const knowledgePoints: KnowledgePointModule = {
  'cpp-map-find': [
    {
      title: 'Find a key and check the result against end',
      explanation: [
        'm.find(key) searches a std::map and returns an iterator. When the key is present, the iterator refers to that entry: it->first is the key and it->second is its mapped value. When the key is absent, find returns m.end().',
        'end() is a position past the last entry, not an entry, so compare the result with end() before reading it->second.',
      ],
      example: {
        language: 'cpp',
        code: `#include <iostream>
#include <map>
int main() {
  std::map<int, int> stock{{3, 40}, {7, 15}};
  auto hit = stock.find(7);
  if (hit != stock.end()) std::cout << hit->first << " has " << hit->second << "\\n";
  auto miss = stock.find(5);
  std::cout << (miss == stock.end()) << "\\n";
}`,
        output: '7 has 15\n1',
        explanation:
          'Key 7 is present, so hit refers to the entry {7, 15}. Key 5 is absent, so miss equals end() and the comparison prints 1.',
      },
      questions: [
        predictOutput(
          'Key 4 is in the map. What does this program print?',
          `#include <iostream>
#include <map>
int main() {
  std::map<int, int> ages{{1, 30}, {4, 52}, {9, 18}};
  auto it = ages.find(4);
  std::cout << it->first << " " << it->second << "\\n";
}`,
          ['52 4', '1 52', '4 52', '1 30'],
          2,
          'find(4) returns an iterator to the entry whose key is 4; first is that key and second is its value, 52.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <iostream>
#include <map>
int main() {
  std::map<int, int> price{{10, 99}, {20, 45}};
  auto it = price.find(15);
  if (it == price.end()) std::cout << "none\\n";
  else std::cout << it->second << "\\n";
}`,
          ['45', 'none', '99', '0'],
          1,
          'No key equals 15. find looks for an exact key, not the nearest one, so it returns end() and the first branch runs.',
        ),
        choose(
          '`auto it = m.find(k);` may not find k. Which next line reads the value safely?',
          [
            'if (it != nullptr) std::cout << it->second;',
            'std::cout << it->second;',
            'if (it != m.end()) std::cout << it->second;',
            'if (it->second != 0) std::cout << it->second;',
          ],
          2,
          'A miss is reported by end(), not by a null pointer, and end() must not be dereferenced, even to test its value.',
        ),
        choose(
          'What does std::map::find return when the key is absent?',
          [
            'A null pointer',
            'An iterator to the next larger key',
            'An iterator to a new entry holding 0',
            'The end() iterator',
          ],
          3,
          'find reports a miss with end(). It never inserts and never moves to a neighbouring key.',
        ),
      ],
    },
    {
      title: 'Look up without changing the map',
      explanation: [
        'find only searches. m[key] behaves differently: when key is missing, it inserts key with a value-initialized mapped value (0 for int) and returns a reference to that new value. A read through [] can therefore grow the map.',
        'Use find when a lookup must not change the map. For the same reason, operator[] is not available on a const map.',
      ],
      example: {
        language: 'cpp',
        code: `#include <iostream>
#include <map>
int main() {
  std::map<int, int> votes{{1, 4}};
  auto it = votes.find(2);
  std::cout << (it == votes.end()) << " " << votes.size() << "\\n";
  int third = votes[3];
  std::cout << third << " " << votes.size() << "\\n";
}`,
        output: '1 1\n0 2',
        explanation:
          'find(2) misses and leaves one entry. Reading votes[3] inserts key 3 with value 0, so the size becomes 2.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `#include <iostream>
#include <map>
int main() {
  std::map<int, int> seen{{5, 1}};
  int count = seen[8];
  std::cout << count << " " << seen.size() << "\\n";
}`,
          ['0 1', '1 2', '0 2', '8 2'],
          2,
          'seen[8] inserts key 8 with value 0 and returns that 0, so the map now has two entries.',
        ),
        predictOutput(
          'This version uses find. What does it print?',
          `#include <iostream>
#include <map>
int main() {
  std::map<int, int> seen{{5, 1}};
  auto it = seen.find(8);
  std::cout << (it == seen.end()) << " " << seen.size() << "\\n";
}`,
          ['1 1', '1 2', '0 1', '0 2'],
          0,
          'find misses, so the comparison prints 1, and it inserts nothing, so the size stays 1.',
        ),
        predictOutput(
          'The program only means to check for key 3. What does it print?',
          `#include <iostream>
#include <map>
int main() {
  std::map<int, int> limits{{1, 10}, {2, 20}};
  if (limits[3] == 0) std::cout << "missing ";
  std::cout << limits.size() << "\\n";
}`,
          ['missing 2', '2', 'missing 3', '3'],
          2,
          'The check itself inserts key 3 with value 0, so the condition is true and the map grows to three entries.',
        ),
        choose(
          'A function takes `const std::map<int, int>& m` and must read key 7 if it exists. Why must it use find rather than m[7]?',
          [
            'operator[] throws when the key is absent',
            'operator[] may insert, so a const map does not offer it',
            'find sorts the entries before it searches',
            'find is defined only for const maps',
          ],
          1,
          'Because [] can insert a missing key, it is a non-const operation. find works on a const map and never changes it.',
        ),
      ],
    },
    {
      title: 'Answer several lookups with a fallback',
      explanation: [
        'A lookup loop calls find once per query and decides what a miss means: skip it, count it, or use a fallback value. A stored value of 0 is still a hit; only end() means the key is absent.',
      ],
      example: {
        language: 'cpp',
        code: `#include <iostream>
#include <map>
#include <vector>
int main() {
  std::map<int, int> rate{{1, 5}, {3, 8}};
  std::vector<int> queries{3, 2, 1};
  int total = 0;
  for (int key : queries) {
    auto it = rate.find(key);
    if (it != rate.end()) total += it->second;
  }
  std::cout << total << " " << rate.size() << "\\n";
}`,
        output: '13 2',
        explanation:
          'Keys 3 and 1 hit and add 8 and 5. Key 2 misses and is skipped, and find never adds it, so the map still has 2 entries.',
      },
      questions: [
        predictOutput(
          'Key 2 is stored with the value 0. What does this program print?',
          `#include <iostream>
#include <map>
#include <vector>
int main() {
  std::map<int, int> stock{{2, 0}, {4, 6}};
  std::vector<int> queries{1, 2, 3, 4};
  int missing = 0;
  for (int key : queries)
    if (stock.find(key) == stock.end()) ++missing;
  std::cout << missing << "\\n";
}`,
          ['3', '2', '1', '4'],
          1,
          'Only keys 1 and 3 are absent. Key 2 is present even though its value is 0.',
        ),
        predictOutput(
          'This loop reads with [] instead of find. What does it print?',
          `#include <iostream>
#include <map>
#include <vector>
int main() {
  std::map<int, int> stock{{2, 5}};
  std::vector<int> queries{1, 2, 3};
  int total = 0;
  for (int key : queries) total += stock[key];
  std::cout << total << " " << stock.size() << "\\n";
}`,
          ['5 1', '5 2', '0 3', '5 3'],
          3,
          'The total is 5, but reading keys 1 and 3 through [] inserts them, so the map ends with three entries.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <iostream>
#include <map>
#include <vector>
int main() {
  std::map<int, int> code{{10, 1}, {30, 3}};
  std::vector<int> queries{30, 20, 10};
  for (int key : queries) {
    auto it = code.find(key);
    std::cout << (it == code.end() ? -1 : it->second) << " ";
  }
  std::cout << "\\n";
}`,
          ['3 -1 1', '1 -1 3', '3 0 1', '3 1'],
          0,
          'Queries are answered in query order, not key order, and the miss for 20 prints the fallback -1.',
        ),
        choose(
          'Which loop body counts how many query keys k are present in m without changing m?',
          [
            'if (m[k] != 0) ++count;',
            'if (m.find(k) != m.end()) ++count;',
            'if (m.find(k) != nullptr) ++count;',
            'if (m.find(k)->second) ++count;',
          ],
          1,
          'Comparing with end() counts every present key, including those whose value is 0, and find never inserts.',
        ),
      ],
    },
  ],
  'cpp-map-insert': [
    {
      title: 'emplace keeps an existing value',
      explanation: [
        'm.emplace(key, value) inserts a new entry only when key is not already present. If the key exists, emplace leaves the stored value unchanged; it does not overwrite.',
        'm.at(key) reads the value of a key that must be present and throws std::out_of_range if it is not. Assignment through m[key] = value is the operation that overwrites.',
      ],
      example: {
        language: 'cpp',
        code: `#include <iostream>
#include <map>
int main() {
  std::map<int, int> limits;
  limits.emplace(1, 50);
  limits.emplace(1, 80);
  std::cout << limits.at(1) << " " << limits.size() << "\\n";
  limits[1] = 80;
  std::cout << limits.at(1) << "\\n";
}`,
        output: '50 1\n80',
        explanation:
          'The second emplace finds key 1 already present and changes nothing. Only the assignment through [] replaces 50 with 80.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `#include <iostream>
#include <map>
int main() {
  std::map<int, int> owner;
  owner.emplace(7, 3);
  owner.emplace(7, 9);
  owner.emplace(8, 9);
  std::cout << owner.at(7) << " " << owner.size() << "\\n";
}`,
          ['9 2', '3 2', '3 3', '9 3'],
          1,
          'Key 7 keeps its first value 3. Key 8 is new, so the map holds two entries.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <iostream>
#include <map>
int main() {
  std::map<int, int> price{{4, 10}};
  price[4] = 12;
  price.emplace(4, 15);
  std::cout << price.at(4) << "\\n";
}`,
          ['10', '15', '12', '27'],
          2,
          'Assignment through [] replaced 10 with 12. The later emplace finds key 4 and changes nothing.',
        ),
        choose(
          'A config map must keep the first value seen for each key and ignore later duplicates. Which call fits?',
          [
            'm[key] = value;',
            'm.at(key) = value;',
            'm.find(key)->second = value;',
            'm.emplace(key, value);',
          ],
          3,
          'emplace inserts only missing keys, so the first value stays. [] = overwrites, and at or find on a missing key throws or dereferences end().',
        ),
        predictOutput(
          'What does this program print?',
          `#include <iostream>
#include <map>
#include <stdexcept>
int main() {
  std::map<int, int> slots;
  slots.emplace(2, 6);
  try {
    std::cout << slots.at(3) << "\\n";
  } catch (const std::out_of_range&) {
    std::cout << "absent\\n";
  }
}`,
          ['0', 'absent', '6', '3'],
          1,
          'at never inserts. Key 3 is missing, so at throws out_of_range and the handler prints absent.',
        ),
      ],
    },
    {
      title: 'Read whether emplace inserted',
      explanation: [
        'emplace returns a pair. Its .second is a bool that is true only when this call inserted a new entry. Its .first is an iterator to the entry with that key: the new one, or the existing one that blocked the insert.',
        'Use .second whenever duplicates matter. The key is present afterwards in both cases, so checking for the key cannot tell you whether your value was stored.',
      ],
      example: {
        language: 'cpp',
        code: `#include <iostream>
#include <map>
int main() {
  std::map<int, int> orders;
  auto first = orders.emplace(5, 100);
  auto again = orders.emplace(5, 200);
  std::cout << first.second << " " << again.second << "\\n";
  std::cout << again.first->second << "\\n";
}`,
        output: '1 0\n100',
        explanation:
          'The first emplace inserts, so its bool is true. The second is blocked; its iterator points at the existing entry, whose value is still 100.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `#include <iostream>
#include <map>
int main() {
  std::map<int, int> ids{{3, 1}};
  auto result = ids.emplace(4, 1);
  std::cout << result.second << " " << ids.size() << "\\n";
}`,
          ['0 1', '0 2', '1 2', '1 1'],
          2,
          'Key 4 is new, so the insert succeeds. Equal mapped values do not matter; only keys are compared.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <iostream>
#include <map>
int main() {
  std::map<int, int> ids{{3, 1}};
  auto result = ids.emplace(3, 9);
  std::cout << result.second << " " << result.first->second << "\\n";
}`,
          ['1 9', '0 9', '0 1', '1 1'],
          2,
          'Key 3 already exists, so nothing is inserted and .second is false. .first refers to the existing entry, whose value is still 1.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <iostream>
#include <map>
#include <vector>
int main() {
  std::vector<int> arrivals{4, 2, 4, 4, 7};
  std::map<int, int> first_seen;
  int inserted = 0;
  for (int i = 0; i < static_cast<int>(arrivals.size()); ++i) {
    auto result = first_seen.emplace(arrivals[i], i);
    if (result.second) ++inserted;
  }
  std::cout << inserted << " " << first_seen.at(4) << "\\n";
}`,
          ['3 0', '5 3', '3 3', '2 0'],
          0,
          'Three distinct keys were inserted. The later emplaces of 4 were blocked, so 4 keeps the index of its first arrival, 0.',
        ),
        choose(
          'After `auto r = m.emplace(k, v);` the code must know whether v was stored. What should it test?',
          [
            'Whether m.find(k) != m.end()',
            'Whether r.first->second == v',
            'Whether r.second is true',
            'Whether m.size() is greater than 0',
          ],
          2,
          'The key is present after either outcome, and an existing value may happen to equal v. Only r.second records whether this call inserted.',
        ),
      ],
    },
  ],
  'cpp-unordered-frequency': [
    {
      title: 'Count occurrences with ++counts[value]',
      explanation: [
        'std::unordered_map stores key-value pairs in a hash table, which gives average constant-time lookup. To count values, write ++counts[value]: the first time a value appears, [] inserts it with count 0 and ++ makes it 1.',
        'Each later occurrence finds the existing entry and increments it, so after one pass every distinct value maps to how often it appeared.',
      ],
      example: {
        language: 'cpp',
        code: `#include <iostream>
#include <unordered_map>
#include <vector>
int main() {
  std::vector<int> rolls{6, 2, 6, 6, 3};
  std::unordered_map<int, int> counts;
  for (int roll : rolls) ++counts[roll];
  std::cout << counts[6] << " " << counts[2] << " " << counts.size() << "\\n";
}`,
        output: '3 1 3',
        explanation:
          '6 appears three times and 2 once. There are three distinct values, so the map holds three entries.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `#include <iostream>
#include <unordered_map>
#include <vector>
int main() {
  std::vector<int> codes{7, 7, 1, 7, 1};
  std::unordered_map<int, int> counts;
  for (int code : codes) ++counts[code];
  std::cout << counts[7] << " " << counts[1] << "\\n";
}`,
          ['2 3', '1 1', '3 2', '3 5'],
          2,
          '7 occurs three times and 1 occurs twice; each occurrence adds one to its own entry.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <iostream>
#include <unordered_map>
#include <vector>
int main() {
  std::vector<int> codes{4, 9, 4};
  std::unordered_map<int, int> counts;
  for (int code : codes) ++counts[code];
  std::cout << counts.size() << " " << codes.size() << "\\n";
}`,
          ['3 3', '2 3', '2 2', '3 2'],
          1,
          'The map has one entry per distinct value (4 and 9), while the vector still holds all three inputs.',
        ),
        predictOutput(
          'The program reads a value that never occurred. What does it print?',
          `#include <iostream>
#include <unordered_map>
#include <vector>
int main() {
  std::vector<int> codes{5, 5};
  std::unordered_map<int, int> counts;
  for (int code : codes) ++counts[code];
  int eights = counts[8];
  std::cout << eights << " " << counts.size() << "\\n";
}`,
          ['0 1', '1 2', '2 1', '0 2'],
          3,
          'Reading counts[8] inserts 8 with count 0, so the map grows from one entry to two.',
        ),
        choose(
          'Why does `++counts[value]` work even the first time value appears?',
          [
            'unordered_map stores a zero for every possible int in advance',
            '[] inserts the missing key with a value-initialized count of 0 before ++ runs',
            '++ on a missing entry throws, and the loop skips that value',
            'The compiler rewrites the expression as emplace(value, 1)',
          ],
          1,
          'operator[] creates the entry with value 0 and returns a reference to it, which ++ then increments to 1.',
        ),
      ],
    },
    {
      title: 'Read counts without relying on hash order',
      explanation: [
        'To read a count without inserting, use find and treat end() as a count of zero, just as with std::map.',
        'An unordered_map does not keep keys sorted, and its iteration order depends on the hash table, not on the values or the order of insertion. Do not treat begin() as the smallest key or print entries in iteration order when output must be predictable; query the keys you need in an order you choose.',
      ],
      example: {
        language: 'cpp',
        code: `#include <iostream>
#include <unordered_map>
#include <vector>
int main() {
  std::vector<int> words{12, 40, 12};
  std::unordered_map<int, int> counts;
  for (int word : words) ++counts[word];
  std::vector<int> queries{40, 12, 99};
  for (int key : queries) {
    auto it = counts.find(key);
    std::cout << key << ":" << (it == counts.end() ? 0 : it->second) << "\\n";
  }
}`,
        output: '40:1\n12:2\n99:0',
        explanation:
          'The program prints in the order of queries, which it controls. 99 was never counted, so find returns end() and the fallback 0 is printed without inserting 99.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `#include <iostream>
#include <unordered_map>
#include <vector>
int main() {
  std::vector<int> ids{3, 8, 3, 3};
  std::unordered_map<int, int> counts;
  for (int id : ids) ++counts[id];
  auto it = counts.find(5);
  std::cout << (it == counts.end() ? 0 : it->second) << " " << counts.size() << "\\n";
}`,
          ['0 3', '1 2', '0 2', '3 2'],
          2,
          '5 was never counted, so find returns end() and 0 is printed. find inserts nothing, so only 3 and 8 are stored.',
        ),
        choose(
          'An unordered_map<int, int> holds counts for keys 9, 2 and 5. What does `counts.begin()->first` give?',
          [
            '2, the smallest key',
            '9, the first key inserted',
            '5, the middle key',
            'Whichever key the hash table places first, which the program should not rely on',
          ],
          3,
          'unordered_map promises neither sorted nor insertion order. Its first element depends on hashing and bucket layout.',
        ),
        choose(
          'Which way of printing counts from an unordered_map gives the same output on every standard library?',
          [
            'Print entries from begin() to end()',
            'Print the count of each key taken from a vector of queries, in that order',
            'Print begin()->first as the most common key',
            'Print the entry reached last by iteration',
          ],
          1,
          'Iteration order is unspecified, so only an order the program chooses, such as a query list, is predictable.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <iostream>
#include <unordered_map>
#include <vector>
int main() {
  std::vector<int> ids{6, 1, 6};
  std::unordered_map<int, int> counts;
  for (int id : ids) ++counts[id];
  std::vector<int> queries{1, 6};
  for (int key : queries) {
    auto it = counts.find(key);
    std::cout << (it == counts.end() ? 0 : it->second) << " ";
  }
  std::cout << "\\n";
}`,
          ['2 1', '1 2', '1 1', '6 1'],
          1,
          'The loop follows the query order: 1 occurred once, then 6 occurred twice.',
        ),
      ],
    },
    {
      title: 'Pick the most frequent value predictably',
      explanation: [
        'Counting and choosing a winner are separate steps. First count every value in one pass. Then scan the input again in its own order and replace the current best only when a count is strictly larger.',
        'Scanning the input, not the hash table, makes ties predictable: among equally frequent values, the one that appears first in the input wins.',
      ],
      example: {
        language: 'cpp',
        code: `#include <iostream>
#include <unordered_map>
#include <vector>
int main() {
  std::vector<int> votes{4, 9, 9, 4, 2};
  std::unordered_map<int, int> counts;
  for (int vote : votes) ++counts[vote];
  int best = votes[0];
  for (int vote : votes)
    if (counts[vote] > counts[best]) best = vote;
  std::cout << best << " " << counts[best] << "\\n";
}`,
        output: '4 2',
        explanation:
          '4 and 9 both appear twice. During the scan, 9’s count is never strictly larger than 4’s, so the earlier value 4 stays the winner.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `#include <iostream>
#include <unordered_map>
#include <vector>
int main() {
  std::vector<int> votes{3, 5, 5, 3, 5};
  std::unordered_map<int, int> counts;
  for (int vote : votes) ++counts[vote];
  int best = votes[0];
  for (int vote : votes)
    if (counts[vote] > counts[best]) best = vote;
  std::cout << best << " " << counts[best] << "\\n";
}`,
          ['3 2', '5 3', '5 2', '3 3'],
          1,
          '5 occurs three times and 3 twice, so 5 replaces the starting value 3.',
        ),
        predictOutput(
          'Two values tie. What does this program print?',
          `#include <iostream>
#include <unordered_map>
#include <vector>
int main() {
  std::vector<int> votes{8, 1, 1, 8};
  std::unordered_map<int, int> counts;
  for (int vote : votes) ++counts[vote];
  int best = votes[0];
  for (int vote : votes)
    if (counts[vote] > counts[best]) best = vote;
  std::cout << best << " " << counts[best] << "\\n";
}`,
          ['8 2', '1 2', '8 4', '1 1'],
          0,
          'Both values occur twice. A strictly larger count is required to replace the best, so the first value, 8, stays.',
        ),
        predictOutput(
          'This scan uses >= instead of >. What does it print?',
          `#include <iostream>
#include <unordered_map>
#include <vector>
int main() {
  std::vector<int> votes{8, 1, 8, 1};
  std::unordered_map<int, int> counts;
  for (int vote : votes) ++counts[vote];
  int best = votes[0];
  for (int vote : votes)
    if (counts[vote] >= counts[best]) best = vote;
  std::cout << best << " " << counts[best] << "\\n";
}`,
          ['8 2', '8 4', '1 4', '1 2'],
          3,
          'With >=, every later value with an equal count takes over, so the last tied value scanned, 1, wins.',
        ),
        choose(
          'Why does the winner scan loop over the input vector rather than over the unordered_map?',
          [
            'An unordered_map cannot be iterated',
            'The input has a fixed order, so ties resolve the same way on every run and library',
            'Iterating an unordered_map erases its counts',
            'counts[vote] works only inside a loop over the vector',
          ],
          1,
          'The vector’s order is defined by the program; the hash table’s order is not, so a scan over it could pick different tied winners.',
        ),
      ],
    },
  ],
  'cpp-maps': [
    {
      title: 'A map iterates in ascending key order',
      explanation: [
        'std::map keeps its entries sorted by key, whatever order they were inserted in. Iterating from begin() to end() visits the keys in ascending order, and each key appears once.',
      ],
      example: {
        language: 'cpp',
        code: `#include <iostream>
#include <map>
int main() {
  std::map<int, int> levels;
  levels[105] = 8;
  levels[101] = 2;
  levels[103] = 5;
  for (auto it = levels.begin(); it != levels.end(); ++it)
    std::cout << it->first << " ";
  std::cout << "\\n";
}`,
        output: '101 103 105',
        explanation:
          'The keys were inserted as 105, 101, 103, but a map keeps them sorted, so iteration prints them in ascending order.',
      },
      questions: [
        predictOutput(
          'This loop prints mapped values, not keys. What does it print?',
          `#include <iostream>
#include <map>
int main() {
  std::map<int, int> stock;
  stock[30] = 1;
  stock[10] = 2;
  stock[20] = 3;
  for (auto it = stock.begin(); it != stock.end(); ++it)
    std::cout << it->second << " ";
  std::cout << "\\n";
}`,
          ['1 2 3', '2 3 1', '3 2 1', '1 3 2'],
          1,
          'Entries are visited by ascending key, 10, 20, 30, so their values print as 2 3 1.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <iostream>
#include <map>
int main() {
  std::map<int, int> stock;
  stock[4] = 1;
  stock[2] = 7;
  stock[4] = 9;
  for (auto it = stock.begin(); it != stock.end(); ++it)
    std::cout << it->first << "=" << it->second << " ";
  std::cout << "\\n";
}`,
          ['4=1 2=7 4=9', '4=9 2=7', '2=7 4=9', '2=7 4=1'],
          2,
          'Assigning to key 4 again replaces its value instead of adding a second entry, and the keys print in ascending order.',
        ),
        choose(
          'Keys 50, 10 and 30 are inserted into a std::map in that order. In what order does a begin-to-end loop visit them?',
          [
            '50, 10, 30',
            '50, 30, 10',
            'In an order set by hashing',
            '10, 30, 50',
          ],
          3,
          'A std::map is ordered by key with <, so iteration is always ascending.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <iostream>
#include <map>
#include <vector>
int main() {
  std::vector<int> rolls{5, 3, 5, 1};
  std::map<int, int> counts;
  for (int roll : rolls) ++counts[roll];
  for (auto it = counts.begin(); it != counts.end(); ++it)
    std::cout << it->first << ":" << it->second << " ";
  std::cout << "\\n";
}`,
          ['5:2 3:1 1:1', '3:1 5:2 1:1', '1:1 3:1 5:2', '1:1 3:1 5:1'],
          2,
          'Each distinct roll gets one entry, 5 is counted twice, and the entries come out in ascending key order.',
        ),
      ],
    },
    {
      title: 'Read the smallest key from begin',
      explanation: [
        'Because entries are sorted, begin() refers to the entry with the smallest key: begin()->first is the minimum key and begin()->second its value. No search is needed.',
        'In an empty map, begin() equals end(), and reading through it is undefined behavior. Check empty() first and decide what an empty map should produce.',
      ],
      example: {
        language: 'cpp',
        code: `#include <iostream>
#include <map>
int main() {
  std::map<int, int> asks{{105, 8}, {101, 2}, {103, 5}};
  if (asks.empty()) std::cout << "no asks\\n";
  else std::cout << asks.begin()->first << " x" << asks.begin()->second << "\\n";
  std::map<int, int> bids;
  std::cout << (bids.empty() ? -1 : bids.begin()->first) << "\\n";
}`,
        output: '101 x2\n-1',
        explanation:
          'The smallest ask key is 101, stored with 2. bids is empty, so the check selects the fallback -1 instead of reading begin().',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `#include <iostream>
#include <map>
int main() {
  std::map<int, int> deadlines{{17, 3}, {9, 1}, {12, 4}};
  std::cout << deadlines.begin()->first << " " << deadlines.begin()->second << "\\n";
}`,
          ['17 3', '9 3', '12 4', '9 1'],
          3,
          'begin() is the entry with the smallest key, 9, and that entry’s value is 1.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <iostream>
#include <map>
int main() {
  std::map<int, int> book;
  book[2] = 1;
  book[-4] = 6;
  std::cout << book.begin()->first << "\\n";
}`,
          ['-4', '2', '6', '1'],
          0,
          'Keys are compared as numbers, so -4 sorts before 2, regardless of insertion order.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <iostream>
#include <map>
int main() {
  std::map<int, int> waiting;
  std::cout << (waiting.empty() ? -1 : waiting.begin()->first) << " " << waiting.size() << "\\n";
}`,
          ['0 0', '-1 1', '-1 0', '0 1'],
          2,
          'The map is empty, so the guard selects -1 and nothing is read from begin(). Its size is 0.',
        ),
        choose(
          'A function returns the smallest key of a std::map<int, int> m that might be empty, or -1. Which body is correct?',
          [
            'return m.begin()->first;',
            'return m.end()->first;',
            'return m.size() ? m.end()->first : -1;',
            'return m.empty() ? -1 : m.begin()->first;',
          ],
          3,
          'The smallest key is at begin(), and the emptiness check must come first. end() never refers to an entry.',
        ),
      ],
    },
    {
      title: 'Track the best level as entries change',
      explanation: [
        'Assigning through [] adds a new key or replaces an existing value, and the map stays sorted after every change. An order book can therefore store ask prices as keys and always read the best (lowest) ask from begin().',
        'A value copied out of the map is a snapshot: it does not change when later keys arrive.',
      ],
      example: {
        language: 'cpp',
        code: `#include <iostream>
#include <map>
int main() {
  std::map<int, int> asks;
  asks[103] = 4;
  std::cout << asks.begin()->first << "\\n";
  asks[101] = 2;
  std::cout << asks.begin()->first << "\\n";
  asks[103] = 9;
  std::cout << asks.begin()->first << " " << asks.size() << "\\n";
}`,
        output: '103\n101\n101 2',
        explanation:
          'The lower ask 101 becomes the new begin(). Updating 103 changes its quantity but adds no entry, so the best ask stays 101 and the size stays 2.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `#include <iostream>
#include <map>
int main() {
  std::map<int, int> asks{{50, 1}};
  asks[48] = 3;
  asks[52] = 7;
  std::cout << asks.begin()->first << " " << asks.begin()->second << "\\n";
}`,
          ['52 7', '50 1', '48 3', '48 1'],
          2,
          '48 is the lowest key after the inserts, and its quantity is 3.',
        ),
        predictOutput(
          'The program adds the quantities of the two best asks. What does it print?',
          `#include <iostream>
#include <map>
int main() {
  std::map<int, int> asks{{12, 5}, {10, 2}, {11, 4}};
  auto it = asks.begin();
  int size = it->second;
  ++it;
  size += it->second;
  std::cout << size << "\\n";
}`,
          ['7', '9', '6', '11'],
          2,
          'The two smallest keys are 10 and 11, with quantities 2 and 4. Initializer order does not matter.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <iostream>
#include <map>
int main() {
  std::map<int, int> bids;
  int best = bids.empty() ? 0 : bids.begin()->first;
  bids[7] = 1;
  bids[3] = 1;
  std::cout << best << " " << bids.begin()->first << "\\n";
}`,
          ['3 3', '0 7', '0 3', '7 3'],
          2,
          'best was computed while the map was empty, so it holds the fallback 0 and does not update. begin() now refers to key 3.',
        ),
        choose(
          'An order book stores ask prices as std::map keys. Why is reading the best (lowest) ask cheap?',
          [
            'The map keeps keys sorted, so the lowest price is always at begin()',
            'The map remembers the most recently inserted price',
            'Reading begin() scans every entry for the minimum',
            'The map sorts itself only when begin() is called',
          ],
          0,
          'Ordering is maintained on every insertion, so the minimum is always the first entry.',
        ),
      ],
    },
  ],
  'cpp-set-membership': [
    {
      title: 'A set stores each value once, in order',
      explanation: [
        'std::set<int> holds distinct values. insert adds a value only if it is not already present, so duplicates collapse and size() counts distinct values. Iteration visits the values in ascending order.',
      ],
      example: {
        language: 'cpp',
        code: `#include <iostream>
#include <set>
int main() {
  std::set<int> tags;
  tags.insert(8);
  tags.insert(3);
  tags.insert(8);
  std::cout << tags.size() << ":";
  for (auto it = tags.begin(); it != tags.end(); ++it) std::cout << " " << *it;
  std::cout << "\\n";
}`,
        output: '2: 3 8',
        explanation:
          'The second insert of 8 changes nothing, so two values remain, and they print in ascending order.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `#include <iostream>
#include <set>
int main() {
  std::set<int> seen;
  seen.insert(5);
  seen.insert(5);
  seen.insert(1);
  seen.insert(5);
  std::cout << seen.size() << "\\n";
}`,
          ['2', '4', '3', '1'],
          0,
          'Four inserts were made, but only the distinct values 1 and 5 are stored.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <iostream>
#include <set>
int main() {
  std::set<int> ids;
  ids.insert(30);
  ids.insert(-2);
  ids.insert(14);
  for (auto it = ids.begin(); it != ids.end(); ++it) std::cout << *it << " ";
  std::cout << "\\n";
}`,
          ['30 -2 14', '30 14 -2', '-2 14 30', '14 30 -2'],
          2,
          'A set iterates in ascending order, not insertion order.',
        ),
        choose(
          'A log records every login, including repeated logins by the same user ID. What does inserting all the user IDs into a std::set and reading size() give?',
          [
            'The total number of logins',
            'The number of distinct users who logged in',
            'The number of repeated logins',
            'The largest user ID',
          ],
          1,
          'Repeated IDs collapse into one element, so size() counts distinct users, not events.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <iostream>
#include <set>
#include <vector>
int main() {
  std::vector<int> events{4, 4, 9, 4, 9};
  std::set<int> users;
  for (int event : events) users.insert(event);
  std::cout << events.size() << " " << users.size() << "\\n";
}`,
          ['5 5', '2 5', '5 3', '5 2'],
          3,
          'The vector keeps all five events; the set keeps only the distinct values 4 and 9.',
        ),
      ],
    },
    {
      title: 'Test membership with contains',
      explanation: [
        's.contains(x) (C++20) returns true when x is in the set, and s.count(x) answers the same question with 1 or 0. Neither call changes the set.',
        'A set can be built from a range in one step: std::set<int> s(v.begin(), v.end());. After that, each membership test is a fast ordered lookup instead of a scan of the vector.',
      ],
      example: {
        language: 'cpp',
        code: `#include <iostream>
#include <set>
#include <vector>
int main() {
  std::vector<int> allowed{3, 7, 7, 12};
  std::set<int> lookup(allowed.begin(), allowed.end());
  std::cout << lookup.contains(7) << " " << lookup.contains(5) << "\\n";
  std::cout << lookup.count(12) << " " << lookup.size() << "\\n";
}`,
        output: '1 0\n1 3',
        explanation:
          '7 is present and 5 is not. count(12) is 1, never more, and the duplicate 7 collapsed, so three values are stored.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `#include <iostream>
#include <set>
#include <vector>
int main() {
  std::vector<int> blocked{2, 9, 2};
  std::set<int> lookup(blocked.begin(), blocked.end());
  std::cout << lookup.count(2) << " " << lookup.contains(4) << "\\n";
}`,
          ['1 0', '2 0', '0 1', '2 1'],
          0,
          'The duplicate 2 collapsed, so count(2) is 1. 4 is absent, so contains prints 0.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <iostream>
#include <set>
#include <vector>
int main() {
  std::set<int> lookup{4, 8, 15};
  std::vector<int> queries{8, 16, 4, 23};
  int hits = 0;
  for (int query : queries)
    if (lookup.contains(query)) ++hits;
  std::cout << hits << " " << lookup.size() << "\\n";
}`,
          ['4 3', '2 5', '2 3', '1 3'],
          2,
          '8 and 4 are present. contains never inserts, so the set still has three values.',
        ),
        choose(
          'Which expression checks whether 7 is in `std::set<int> s` without adding it?',
          ['s.insert(7)', 's[7] != 0', '*s.begin() == 7', 's.contains(7)'],
          3,
          'contains only queries. insert adds, sets have no operator[], and begin() is just the smallest element.',
        ),
        choose(
          'A program checks 10,000 IDs against a list of 500 allowed IDs. Why build a std::set from the list first?',
          [
            'Each check becomes a fast ordered lookup instead of a scan of all 500 entries',
            'A set check also removes the ID from the allowed list',
            'An int cannot be compared with vector elements',
            'A set keeps the IDs in the order they were listed',
          ],
          0,
          'A set lookup takes logarithmic time, while searching an unsorted vector examines every element in the worst case.',
        ),
      ],
    },
    {
      title: 'Remember what has been seen',
      explanation: [
        'A set can record which values a scan has already met. For each value, test contains before inserting: a value that is already present is a repeat, and size() counts the distinct values seen so far.',
      ],
      example: {
        language: 'cpp',
        code: `#include <iostream>
#include <set>
#include <vector>
int main() {
  std::vector<int> stream{6, 2, 9, 2, 6};
  std::set<int> seen;
  int first_repeat = -1;
  for (int value : stream) {
    if (seen.contains(value) && first_repeat == -1) first_repeat = value;
    seen.insert(value);
  }
  std::cout << first_repeat << " " << seen.size() << "\\n";
}`,
        output: '2 3',
        explanation:
          'The scan reaches the second 2 before the second 6, so 2 is the first repeat. The set ends with the three distinct values 2, 6 and 9.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `#include <iostream>
#include <set>
#include <vector>
int main() {
  std::vector<int> stream{4, 1, 1, 4, 7};
  std::set<int> seen;
  int first_repeat = -1;
  for (int value : stream) {
    if (seen.contains(value) && first_repeat == -1) first_repeat = value;
    seen.insert(value);
  }
  std::cout << first_repeat << " " << seen.size() << "\\n";
}`,
          ['4 3', '1 3', '1 5', '4 2'],
          1,
          'The second 1 arrives before the second 4, so 1 is the first repeat; 1, 4 and 7 are distinct.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <iostream>
#include <set>
#include <vector>
int main() {
  std::vector<int> stream{5, 8, 3};
  std::set<int> seen;
  int first_repeat = -1;
  for (int value : stream) {
    if (seen.contains(value) && first_repeat == -1) first_repeat = value;
    seen.insert(value);
  }
  std::cout << first_repeat << " " << seen.size() << "\\n";
}`,
          ['-1 3', '3 3', '-1 0', '5 3'],
          0,
          'No value occurs twice, so first_repeat keeps its starting value -1, and all three values are stored.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <iostream>
#include <set>
#include <vector>
int main() {
  std::vector<int> stream{3, 3, 8, 3, 1, 8};
  std::set<int> seen;
  for (int value : stream) {
    if (seen.count(value) == 0) std::cout << value << " ";
    seen.insert(value);
  }
  std::cout << "\\n";
}`,
          ['1 3 8', '8 1', '3 8 1', '3 1 8'],
          2,
          'Each value prints only the first time it is met, in stream order; the set’s sorted order does not affect what the loop prints.',
        ),
        choose(
          'Inside such a scan, the code calls insert(value) before testing contains(value). What goes wrong?',
          [
            'Nothing; the order of the two calls does not matter',
            'contains is then always true, so every value looks like a repeat',
            'insert throws because the value is already present',
            'The set stops keeping its values sorted',
          ],
          1,
          'After inserting, the value is always present, so the test can no longer distinguish new values from repeats.',
        ),
      ],
    },
  ],
  'cpp-set-lower-bound': [
    {
      title: 'Find the first element not less than a target',
      explanation: [
        's.lower_bound(t) returns an iterator to the first element that is not less than t, that is, greater than or equal to t. If t is present, that is t itself; otherwise it is the next larger element.',
        'Because a set is sorted, this is a fast search rather than a scan.',
      ],
      example: {
        language: 'cpp',
        code: `#include <iostream>
#include <set>
int main() {
  std::set<int> slots{3, 8, 12};
  std::cout << *slots.lower_bound(8) << " " << *slots.lower_bound(9) << " " << *slots.lower_bound(1) << "\\n";
}`,
        output: '8 12 3',
        explanation:
          '8 is present, so it is returned. 9 is absent and the next larger element is 12. Every element is at least 1, so the first one, 3, is returned. Each target here has a qualifying element.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `#include <iostream>
#include <set>
int main() {
  std::set<int> marks{10, 20, 30};
  std::cout << *marks.lower_bound(20) << "\\n";
}`,
          ['30', '10', '20', '1'],
          2,
          '20 is present, and an equal element is not less than the target, so lower_bound returns 20 itself.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <iostream>
#include <set>
int main() {
  std::set<int> marks{10, 20, 30};
  std::cout << *marks.lower_bound(21) << "\\n";
}`,
          ['20', '30', '21', '10'],
          1,
          'No element equals 21, and the first element greater than it is 30.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <iostream>
#include <set>
int main() {
  std::set<int> temps{-5, 0, 5};
  std::cout << *temps.lower_bound(-7) << "\\n";
}`,
          ['-5', '0', '-7', '5'],
          0,
          '-5 is the smallest element and it is not less than -7, so it qualifies first.',
        ),
        choose(
          'For `std::set<int> s{2, 4, 6}`, which element does `s.lower_bound(4)` refer to?',
          [
            '2, the largest element below 4',
            '4, the first element not less than 4',
            '6, the first element greater than 4',
            'None; it returns end() because 4 is not smaller than 4',
          ],
          1,
          'lower_bound accepts equality: the first element with !(element < 4) is 4.',
        ),
      ],
    },
    {
      title: 'Handle the end result',
      explanation: [
        'If every element is less than t, lower_bound returns end(). Dereferencing end() is undefined behavior, so compare with end() first and choose a fallback, just as after find.',
      ],
      example: {
        language: 'cpp',
        code: `#include <iostream>
#include <set>
int main() {
  std::set<int> slots{3, 8, 12};
  auto it = slots.lower_bound(13);
  std::cout << (it == slots.end() ? -1 : *it) << "\\n";
  it = slots.lower_bound(12);
  std::cout << (it == slots.end() ? -1 : *it) << "\\n";
}`,
        output: '-1\n12',
        explanation:
          'All elements are below 13, so the first search returns end() and the fallback is printed. 12 qualifies for the second search.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `#include <iostream>
#include <set>
int main() {
  std::set<int> sizes{4, 9};
  auto it = sizes.lower_bound(10);
  std::cout << (it == sizes.end() ? -1 : *it) << "\\n";
}`,
          ['9', '-1', '10', '4'],
          1,
          'Both elements are less than 10, so lower_bound returns end() and the fallback -1 prints. It does not fall back to the largest element.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <iostream>
#include <set>
int main() {
  std::set<int> sizes{4, 9};
  auto it = sizes.lower_bound(9);
  std::cout << (it == sizes.end() ? -1 : *it) << "\\n";
}`,
          ['-1', '4', '9', '10'],
          2,
          '9 is the last element, and it is not less than 9, so lower_bound returns it rather than end().',
        ),
        predictOutput(
          'How many queries can be served?',
          `#include <iostream>
#include <set>
#include <vector>
int main() {
  std::set<int> slots{5, 15};
  std::vector<int> queries{1, 15, 16, 6};
  int served = 0;
  for (int query : queries)
    if (slots.lower_bound(query) != slots.end()) ++served;
  std::cout << served << "\\n";
}`,
          ['2', '3', '4', '1'],
          1,
          'Queries 1, 15 and 6 find 5, 15 and 15. Only 16 is above every slot.',
        ),
        choose(
          '`auto it = s.lower_bound(t);` Which condition must hold before reading *it?',
          ['it != s.begin()', '*it >= t', 'it != s.end()', 't <= *s.begin()'],
          2,
          'Only end() is unreadable. Testing *it >= t would itself dereference end() when no element qualifies.',
        ),
      ],
    },
    {
      title: 'Serve each query with the next available element',
      explanation: [
        'find answers "is t present?", while lower_bound answers "what is the first element at or after t?". For scheduling, the second question is usually the right one: each request takes the next available time, and end() means nothing is left.',
      ],
      example: {
        language: 'cpp',
        code: `#include <iostream>
#include <set>
#include <vector>
int main() {
  std::set<int> departures{540, 600, 690};
  std::vector<int> arrivals{530, 600, 700};
  for (int t : arrivals) {
    auto it = departures.lower_bound(t);
    if (it == departures.end()) std::cout << "none\\n";
    else std::cout << *it - t << "\\n";
  }
}`,
        output: '10\n0\nnone',
        explanation:
          'Each arrival waits for the first departure at or after it: 540 is 10 after 530, 600 leaves exactly at 600, and nothing leaves at or after 700.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `#include <iostream>
#include <set>
#include <vector>
int main() {
  std::set<int> departures{100, 130};
  std::vector<int> arrivals{90, 131};
  for (int t : arrivals) {
    auto it = departures.lower_bound(t);
    if (it == departures.end()) std::cout << "none\\n";
    else std::cout << *it - t << "\\n";
  }
}`,
          ['10\n1', '0\nnone', '10\nnone', '10\n-1'],
          2,
          '90 waits 10 for the 100 departure. 131 is after the last departure, so lower_bound returns end().',
        ),
        choose(
          'A set holds {5, 10}. For the target 7, what do find(7) and lower_bound(7) return?',
          [
            'Both return end()',
            'find returns end(); lower_bound refers to 10',
            'Both refer to 10',
            'find refers to 5; lower_bound refers to 10',
          ],
          1,
          'find needs an exact match and misses. lower_bound returns the first element at or above 7, which is 10.',
        ),
        predictOutput(
          'What is the total waiting time?',
          `#include <iostream>
#include <set>
#include <vector>
int main() {
  std::set<int> departures{20, 50};
  std::vector<int> arrivals{20, 21, 45};
  int total = 0;
  for (int t : arrivals) {
    auto it = departures.lower_bound(t);
    if (it != departures.end()) total += *it - t;
  }
  std::cout << total << "\\n";
}`,
          ['34', '64', '29', '0'],
          0,
          'The waits are 0 (20 leaves at 20), 29 (21 waits for 50) and 5 (45 waits for 50), totalling 34.',
        ),
      ],
    },
  ],
  'cpp-heap-top': [
    {
      title: 'top() is the largest element',
      explanation: [
        'std::priority_queue<int> (from <queue>) arranges its elements so that top() is always the largest. push adds an element in any order; top reads the current maximum without removing it. Unlike a set, a priority_queue keeps duplicates.',
        'It can also be built from a range: std::priority_queue<int> heap(v.begin(), v.end());',
      ],
      example: {
        language: 'cpp',
        code: `#include <iostream>
#include <queue>
int main() {
  std::priority_queue<int> heap;
  heap.push(4);
  heap.push(9);
  heap.push(2);
  heap.push(9);
  std::cout << heap.top() << " " << heap.size() << "\\n";
}`,
        output: '9 4',
        explanation:
          'The largest value, 9, is on top, and both copies of 9 are kept, so the heap holds four elements.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `#include <iostream>
#include <queue>
int main() {
  std::priority_queue<int> heap;
  heap.push(3);
  heap.push(11);
  heap.push(7);
  std::cout << heap.top() << "\\n";
}`,
          ['3', '7', '11', '21'],
          2,
          'top() returns the maximum, 11, not the first or the last value pushed.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <iostream>
#include <queue>
#include <vector>
int main() {
  std::vector<int> changes{-4, -1, -9};
  std::priority_queue<int> heap(changes.begin(), changes.end());
  std::cout << heap.top() << "\\n";
}`,
          ['-9', '-1', '-4', '9'],
          1,
          'Among negative numbers the largest is the one closest to zero, -1.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <iostream>
#include <queue>
int main() {
  std::priority_queue<int> heap;
  heap.push(5);
  heap.push(5);
  heap.push(2);
  std::cout << heap.top() << " " << heap.size() << "\\n";
}`,
          ['5 3', '5 2', '2 3', '2 2'],
          0,
          'A priority_queue keeps duplicates, so all three values are stored and 5 is on top.',
        ),
        choose(
          'A priority_queue<int> receives 6, 8, 1 and then 4. What does top() return?',
          [
            '6, the first value pushed',
            '4, the last value pushed',
            '8, the largest value',
            '1, the smallest value',
          ],
          2,
          'The default priority_queue orders by value, so the maximum is on top regardless of arrival order.',
        ),
      ],
    },
    {
      title: 'Pop the top only from a nonempty heap',
      explanation: [
        'pop() removes the current top and returns nothing, so read top() first if you need the value. The next top is the next largest element, so reading and popping repeatedly yields the values in descending order.',
        'Calling top() or pop() on an empty priority_queue is undefined behavior. Check empty() before each read.',
      ],
      example: {
        language: 'cpp',
        code: `#include <iostream>
#include <queue>
#include <vector>
int main() {
  std::vector<int> bids{40, 75, 60};
  std::priority_queue<int> heap(bids.begin(), bids.end());
  for (int i = 0; i < 4; ++i) {
    if (heap.empty()) std::cout << "empty\\n";
    else {
      std::cout << heap.top() << "\\n";
      heap.pop();
    }
  }
}`,
        output: '75\n60\n40\nempty',
        explanation:
          'Each pass prints and removes the current maximum. On the fourth pass the heap is empty, so the guard prints empty instead of calling top().',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `#include <iostream>
#include <queue>
#include <vector>
int main() {
  std::vector<int> values{3, 8, 5};
  std::priority_queue<int> heap(values.begin(), values.end());
  heap.pop();
  std::cout << heap.top() << "\\n";
}`,
          ['3', '8', '5', '16'],
          2,
          'pop removes the maximum 8, and the next largest, 5, becomes the top.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <iostream>
#include <queue>
#include <vector>
int main() {
  std::vector<int> values{10, 30, 20, 30};
  std::priority_queue<int> heap(values.begin(), values.end());
  for (int i = 0; i < 2; ++i) {
    std::cout << heap.top() << " ";
    heap.pop();
  }
  std::cout << "\\n";
}`,
          ['30 20', '30 30', '10 30', '30 10'],
          1,
          'Duplicates stay: after one 30 is popped, the other 30 is still the largest.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <iostream>
#include <queue>
int main() {
  std::priority_queue<int> heap;
  heap.push(7);
  for (int i = 0; i < 2; ++i) {
    if (heap.empty()) std::cout << -1 << " ";
    else {
      std::cout << heap.top() << " ";
      heap.pop();
    }
  }
  std::cout << "\\n";
}`,
          ['7 7', '-1 7', '7 0', '7 -1'],
          3,
          'The first pass reads and removes 7. The second pass finds the heap empty and prints the fallback.',
        ),
        choose(
          'Why does `int best = heap.pop();` fail to compile?',
          [
            'pop returns void; read top() before calling pop()',
            'pop needs the index of the element to remove',
            'pop can be called only on an empty heap',
            'The result of pop must be stored with auto',
          ],
          0,
          'pop only removes. The value must be read with top() while it is still in the heap.',
        ),
      ],
    },
    {
      title: 'Take the k largest values',
      explanation: [
        'To process the k largest items, push everything and then repeat k times: check that the heap is not empty, read top(), and pop(). The size check keeps the loop safe when there are fewer than k items.',
      ],
      example: {
        language: 'cpp',
        code: `#include <iostream>
#include <queue>
#include <vector>
int main() {
  std::vector<int> scores{12, 30, 7, 25, 18};
  std::priority_queue<int> heap(scores.begin(), scores.end());
  int total = 0;
  for (int i = 0; i < 3; ++i) {
    if (heap.size() > 0) {
      total += heap.top();
      heap.pop();
    }
  }
  std::cout << total << " " << heap.size() << "\\n";
}`,
        output: '73 2',
        explanation:
          'The three largest scores are 30, 25 and 18, which sum to 73. The two smaller scores remain in the heap.',
      },
      questions: [
        predictOutput(
          'The loop takes the two largest values. What does it print?',
          `#include <iostream>
#include <queue>
#include <vector>
int main() {
  std::vector<int> values{5, 1, 9, 3};
  std::priority_queue<int> heap(values.begin(), values.end());
  int total = 0;
  for (int i = 0; i < 2; ++i) {
    if (heap.size() > 0) {
      total += heap.top();
      heap.pop();
    }
  }
  std::cout << total << "\\n";
}`,
          ['6', '14', '10', '18'],
          1,
          'The two largest values are 9 and 5, not the first two in the vector.',
        ),
        predictOutput(
          'Only two values exist, but the loop asks for three. What does it print?',
          `#include <iostream>
#include <queue>
#include <vector>
int main() {
  std::vector<int> values{4, 6};
  std::priority_queue<int> heap(values.begin(), values.end());
  int total = 0;
  for (int i = 0; i < 3; ++i) {
    if (heap.size() > 0) {
      total += heap.top();
      heap.pop();
    }
  }
  std::cout << total << " " << heap.size() << "\\n";
}`,
          ['10 0', '10 1', '16 0', '6 0'],
          0,
          'Both values are taken; on the third pass the heap is empty and the guard skips the read.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <iostream>
#include <queue>
#include <vector>
int main() {
  std::vector<int> values{2, 8, 8, 5};
  std::priority_queue<int> heap(values.begin(), values.end());
  for (int i = 0; i < 3; ++i) {
    std::cout << heap.top() << " ";
    heap.pop();
  }
  std::cout << "\\n";
}`,
          ['8 5 2', '8 8 5', '2 5 8', '8 2 5'],
          1,
          'Values come out largest first, and the duplicate 8 is popped twice before 5.',
        ),
        choose(
          'A dashboard shows the sum of the 3 largest of n readings, and n may be 0. Which loop body is safe?',
          [
            'total += heap.top(); heap.pop();',
            'heap.pop(); total += heap.top();',
            'if (heap.size() > 0) { total += heap.top(); heap.pop(); }',
            'if (heap.top() > 0) { total += heap.top(); heap.pop(); }',
          ],
          2,
          'Only the size check prevents top() and pop() on an empty heap. Testing heap.top() itself already reads it.',
        ),
      ],
    },
  ],
  'cpp-sets': [
    {
      title: 'std::greater puts the smallest value on top',
      explanation: [
        'priority_queue takes three template arguments: the element type, the underlying container, and a comparator. The default comparator puts the largest value on top. std::priority_queue<int, std::vector<int>, std::greater<int>>, with std::greater from <functional>, reverses that, so top() is the smallest value.',
      ],
      example: {
        language: 'cpp',
        code: `#include <functional>
#include <iostream>
#include <queue>
#include <vector>
int main() {
  std::priority_queue<int, std::vector<int>, std::greater<int>> deadlines;
  deadlines.push(14);
  deadlines.push(9);
  deadlines.push(30);
  std::cout << deadlines.top() << "\\n";
}`,
        output: '9',
        explanation:
          'With std::greater the heap is a min heap, so the smallest deadline, 9, is on top.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `#include <functional>
#include <iostream>
#include <queue>
#include <vector>
int main() {
  std::vector<int> values{4, 9, 2, 7};
  std::priority_queue<int, std::vector<int>, std::greater<int>> heap(values.begin(), values.end());
  std::cout << heap.top() << "\\n";
}`,
          ['9', '2', '4', '7'],
          1,
          'The std::greater comparator makes the smallest value, 2, the top.',
        ),
        predictOutput(
          'Both heaps receive the same values. What does this program print?',
          `#include <functional>
#include <iostream>
#include <queue>
#include <vector>
int main() {
  std::vector<int> values{6, -3, 11};
  std::priority_queue<int> high(values.begin(), values.end());
  std::priority_queue<int, std::vector<int>, std::greater<int>> low(values.begin(), values.end());
  std::cout << high.top() << " " << low.top() << "\\n";
}`,
          ['11 -3', '-3 11', '6 6', '11 6'],
          0,
          'The default heap shows the maximum and the std::greater heap shows the minimum.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <functional>
#include <iostream>
#include <queue>
#include <vector>
int main() {
  std::priority_queue<int, std::vector<int>, std::greater<int>> heap;
  heap.push(5);
  heap.push(5);
  heap.push(8);
  std::cout << heap.top() << " " << heap.size() << "\\n";
}`,
          ['8 3', '5 2', '5 3', '8 2'],
          2,
          'The minimum, 5, is on top, and the duplicate is kept, so three elements are stored.',
        ),
        choose(
          'Which declaration makes top() return the smallest int?',
          [
            'std::priority_queue<int>',
            'std::priority_queue<int, std::vector<int>, std::less<int>>',
            'std::priority_queue<int, std::vector<int>, std::greater<int>>',
            'std::priority_queue<std::greater<int>>',
          ],
          2,
          'The comparator is the third template argument; std::greater<int> gives a min heap. std::less<int> is the default max heap.',
        ),
      ],
    },
    {
      title: 'Popping a min heap gives ascending order',
      explanation: [
        'Popping a min heap repeatedly yields values in ascending order, the reverse of a max heap. As before, pop() returns nothing, and the heap must not be empty when you call top() or pop().',
      ],
      example: {
        language: 'cpp',
        code: `#include <functional>
#include <iostream>
#include <queue>
#include <vector>
int main() {
  std::vector<int> due{50, 20, 40};
  std::priority_queue<int, std::vector<int>, std::greater<int>> heap(due.begin(), due.end());
  for (int i = 0; i < 3; ++i) {
    std::cout << heap.top() << " ";
    heap.pop();
  }
  std::cout << "\\n";
}`,
        output: '20 40 50',
        explanation:
          'Each pop removes the current minimum, so the values come out smallest first.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `#include <functional>
#include <iostream>
#include <queue>
#include <vector>
int main() {
  std::vector<int> due{9, 1, 5};
  std::priority_queue<int, std::vector<int>, std::greater<int>> heap(due.begin(), due.end());
  for (int i = 0; i < 2; ++i) {
    std::cout << heap.top() << " ";
    heap.pop();
  }
  std::cout << "\\n";
}`,
          ['9 5', '1 9', '5 1', '1 5'],
          3,
          'The two smallest values come out in ascending order: 1, then 5.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <functional>
#include <iostream>
#include <queue>
#include <vector>
int main() {
  std::vector<int> due{3, 3, 1};
  std::priority_queue<int, std::vector<int>, std::greater<int>> heap(due.begin(), due.end());
  for (int i = 0; i < 2; ++i) {
    std::cout << heap.top() << " ";
    heap.pop();
  }
  std::cout << "\\n";
}`,
          ['1 3', '3 3', '1 1', '3 1'],
          0,
          '1 is the minimum and comes out first; then one of the two 3s is on top.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <functional>
#include <iostream>
#include <queue>
#include <vector>
int main() {
  std::vector<int> due{8, 2, 6, 2};
  std::priority_queue<int, std::vector<int>, std::greater<int>> heap(due.begin(), due.end());
  heap.pop();
  std::cout << heap.top() << " " << heap.size() << "\\n";
}`,
          ['6 3', '8 3', '2 3', '2 4'],
          2,
          'pop removes one 2. The other 2 is still the minimum, and three elements remain.',
        ),
      ],
    },
    {
      title: 'Choose the heap direction from the priority rule',
      explanation: [
        'Pick the comparator from what must be served first. Highest bid first needs the largest value on top, which is the default. Earliest deadline or lowest price first needs the smallest value on top, which needs std::greater<int>. The wrong direction serves items in exactly the wrong order.',
      ],
      example: {
        language: 'cpp',
        code: `#include <functional>
#include <iostream>
#include <queue>
#include <vector>
int main() {
  std::vector<int> bids{101, 99, 103};
  std::vector<int> deadlines{17, 12, 20};
  std::priority_queue<int> best_bid(bids.begin(), bids.end());
  std::priority_queue<int, std::vector<int>, std::greater<int>> next_due(deadlines.begin(), deadlines.end());
  std::cout << best_bid.top() << " " << next_due.top() << "\\n";
}`,
        output: '103 12',
        explanation:
          'Bids are served highest first, so the default heap fits. Deadlines are served earliest first, so the std::greater heap fits.',
      },
      questions: [
        choose(
          'A scheduler must always run the job with the earliest start time, stored as the smallest number. Which container fits?',
          [
            'std::priority_queue<int>',
            'std::priority_queue<int> with times pushed in sorted order',
            'std::priority_queue<int, std::vector<int>, std::greater<int>>',
            'std::priority_queue<int, std::vector<int>, std::less<int>>',
          ],
          2,
          'Only the std::greater heap keeps the smallest value on top; push order does not change a heap’s ordering.',
        ),
        predictOutput(
          'This scheduler should serve the earliest deadline. What does it serve first?',
          `#include <iostream>
#include <queue>
int main() {
  std::priority_queue<int> deadlines;
  deadlines.push(14);
  deadlines.push(9);
  deadlines.push(30);
  std::cout << deadlines.top() << "\\n";
}`,
          ['9', '14', '30', '53'],
          2,
          'The default heap puts the largest value on top, so it serves the latest deadline, the opposite of the intended rule.',
        ),
        choose(
          'An exchange must match the highest bid first. Which heap fits?',
          [
            'std::priority_queue<int>, the default max heap',
            'A std::greater<int> min heap',
            'A min heap with the bids negated twice',
            'Either; the heap direction only affects speed',
          ],
          0,
          'The default comparator keeps the maximum on top, which is the highest bid.',
        ),
        predictOutput(
          'A new deadline arrives after one has been served. What does this program print?',
          `#include <functional>
#include <iostream>
#include <queue>
#include <vector>
int main() {
  std::priority_queue<int, std::vector<int>, std::greater<int>> due;
  due.push(12);
  due.push(20);
  std::cout << due.top() << "\\n";
  due.pop();
  due.push(4);
  due.push(15);
  std::cout << due.top() << "\\n";
}`,
          ['12\n4', '12\n15', '12\n20', '20\n4'],
          0,
          '12 is served first. After 4 and 15 arrive, 4 is the smallest remaining deadline.',
        ),
      ],
    },
  ],
  'cpp-deque-front-back': [
    {
      title: 'Add at either end of a deque',
      explanation: [
        'std::deque<int> is a double-ended queue. push_back appends at the end, as with a vector, and push_front inserts at the beginning. front() reads the first element and back() the last.',
      ],
      example: {
        language: 'cpp',
        code: `#include <deque>
#include <iostream>
int main() {
  std::deque<int> line;
  line.push_back(5);
  line.push_front(2);
  line.push_back(9);
  std::cout << line.front() << " " << line.back() << " " << line.size() << "\\n";
}`,
        output: '2 9 3',
        explanation:
          '2 was inserted before 5, and 9 after it, so the deque is 2, 5, 9.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `#include <deque>
#include <iostream>
int main() {
  std::deque<int> d;
  d.push_front(1);
  d.push_front(2);
  d.push_front(3);
  std::cout << d.front() << " " << d.back() << "\\n";
}`,
          ['1 3', '3 1', '1 1', '3 3'],
          1,
          'Each push_front goes before the current front, so the deque is 3, 2, 1.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <deque>
#include <iostream>
int main() {
  std::deque<int> d;
  d.push_back(4);
  d.push_front(7);
  d.push_back(1);
  std::cout << d.front() << " " << d.back() << "\\n";
}`,
          ['4 1', '7 4', '7 1', '1 7'],
          2,
          'The deque becomes 7, 4, 1: 7 went to the front and 1 to the back.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <deque>
#include <iostream>
int main() {
  std::deque<int> d{3, 4};
  d.push_front(2);
  d.push_back(5);
  std::cout << d.size() << " " << d.front() << "\\n";
}`,
          ['4 2', '4 3', '2 2', '4 5'],
          0,
          'Both pushes add an element, giving 2, 3, 4, 5.',
        ),
        choose(
          'Which operation does std::deque offer that std::vector does not?',
          ['push_back', 'size', 'push_front', 'back'],
          2,
          'Both containers append at the back; only a deque inserts at the front without shifting every element.',
        ),
      ],
    },
    {
      title: 'Index a deque from its current front',
      explanation: [
        'A deque supports d[i] and size(), counting from the front. After push_front, every existing element’s index grows by one, because index 0 is always the current front.',
        'Unlike a vector, a deque does not keep all its elements in one contiguous block, so pointer arithmetic from &d[0] is not a valid way to reach other elements. Use indices or iterators.',
      ],
      example: {
        language: 'cpp',
        code: `#include <deque>
#include <iostream>
int main() {
  std::deque<int> d{10, 20};
  std::cout << d[0] << "\\n";
  d.push_front(5);
  std::cout << d[0] << " " << d[1] << "\\n";
}`,
        output: '10\n5 10',
        explanation:
          'Before the push, index 0 holds 10. After push_front(5), 5 is at index 0 and 10 has moved to index 1.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `#include <deque>
#include <iostream>
int main() {
  std::deque<int> d{4, 6};
  d.push_front(9);
  std::cout << d[1] << "\\n";
}`,
          ['6', '9', '4', '3'],
          2,
          'The deque is now 9, 4, 6, so index 1 holds 4.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <cstddef>
#include <deque>
#include <iostream>
int main() {
  std::deque<int> d{2, 3};
  d.push_front(1);
  d.push_back(4);
  for (std::size_t i = 0; i < d.size(); ++i) std::cout << d[i] << " ";
  std::cout << "\\n";
}`,
          ['2 3 1 4', '1 2 3 4', '4 3 2 1', '2 3 4 1'],
          1,
          'Indexing runs from the current front, which is the 1 added by push_front.',
        ),
        choose(
          'Why is `int* p = &d[0]; std::cout << p[3];` wrong for a std::deque<int> d with five elements?',
          [
            'The address of d[0] cannot be taken',
            'A deque may store elements in separate blocks, so p[3] need not be d[3]',
            'p[3] counts from the back of the deque',
            'Deque elements are always const',
          ],
          1,
          'Pointer arithmetic is valid only inside one array. A deque’s elements can span several blocks, so use d[3] instead.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <deque>
#include <iostream>
int main() {
  std::deque<int> d{8};
  d.push_front(6);
  d.push_front(4);
  std::cout << d[2] << "\\n";
}`,
          ['4', '6', '2', '8'],
          3,
          'The deque is 4, 6, 8. The original element has been pushed back to index 2.',
        ),
      ],
    },
    {
      title: 'Build a sequence from both ends',
      explanation: [
        'Because a deque grows cheaply at both ends, a loop can decide for each item whether it belongs at the front or the back. The final order then depends on those decisions and on arrival order.',
      ],
      example: {
        language: 'cpp',
        code: `#include <cstddef>
#include <deque>
#include <iostream>
#include <vector>
int main() {
  std::vector<int> values{5, 1, 8, 3};
  std::deque<int> d;
  for (int value : values) {
    if (value < 4) d.push_front(value);
    else d.push_back(value);
  }
  for (std::size_t i = 0; i < d.size(); ++i) std::cout << d[i] << " ";
  std::cout << "\\n";
}`,
        output: '3 1 5 8',
        explanation:
          'Small values go to the front, so the later 3 ends up ahead of the earlier 1. Large values are appended in arrival order.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `#include <cstddef>
#include <deque>
#include <iostream>
#include <vector>
int main() {
  std::vector<int> values{2, 7, 1, 9};
  std::deque<int> d;
  for (int value : values) {
    if (value < 5) d.push_front(value);
    else d.push_back(value);
  }
  for (std::size_t i = 0; i < d.size(); ++i) std::cout << d[i] << " ";
  std::cout << "\\n";
}`,
          ['2 1 7 9', '1 2 7 9', '2 7 1 9', '9 7 2 1'],
          1,
          '2 goes to the front, then 1 goes in front of it; 7 and 9 are appended in order.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <deque>
#include <iostream>
#include <vector>
int main() {
  std::vector<int> values{1, 2, 3, 4};
  std::deque<int> d;
  for (int value : values) {
    if (value > 2) d.push_front(value);
    else d.push_back(value);
  }
  std::cout << d.front() << " " << d.back() << "\\n";
}`,
          ['1 4', '3 2', '4 2', '4 1'],
          2,
          'The deque grows as 1, then 1 2, then 3 1 2, then 4 3 1 2.',
        ),
        choose(
          'A log viewer prepends older history and appends new events. Why is a deque a better fit than a vector?',
          [
            'A deque inserts efficiently at both ends; a vector must shift every element to insert at the front',
            'A deque keeps its elements sorted',
            'A vector cannot grow after construction',
            'A deque stores all elements contiguously, so it indexes faster',
          ],
          0,
          'Front insertion is the deque’s strength. A vector’s push at the front costs time proportional to its size.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <cstddef>
#include <deque>
#include <iostream>
#include <vector>
int main() {
  std::vector<int> values{1, 2, 3};
  std::deque<int> d;
  for (int value : values) d.push_front(value);
  for (std::size_t i = 0; i < d.size(); ++i) std::cout << d[i] << " ";
  std::cout << "\\n";
}`,
          ['1 2 3', '3 2 1', '3 1 2', '1 3 2'],
          1,
          'Pushing every value to the front reverses the arrival order.',
        ),
      ],
    },
  ],
  'cpp-deque-pop': [
    {
      title: 'Read an end before popping it',
      explanation: [
        'pop_front removes the first element and pop_back removes the last. Both return nothing, so copy front() or back() into a variable before popping if you need the value.',
      ],
      example: {
        language: 'cpp',
        code: `#include <deque>
#include <iostream>
int main() {
  std::deque<int> tasks{8, 3, 5};
  int first = tasks.front();
  tasks.pop_front();
  tasks.pop_back();
  std::cout << first << " " << tasks.front() << " " << tasks.size() << "\\n";
}`,
        output: '8 3 1',
        explanation:
          'first saved 8 before it was removed. Popping both ends leaves only 3.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `#include <deque>
#include <iostream>
int main() {
  std::deque<int> d{4, 7, 1};
  d.pop_front();
  std::cout << d.front() << " " << d.back() << "\\n";
}`,
          ['7 1', '4 1', '4 7', '1 7'],
          0,
          'pop_front removed 4, so the deque is 7, 1.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <deque>
#include <iostream>
int main() {
  std::deque<int> d{2, 9};
  int last = d.back();
  d.pop_back();
  std::cout << last << " " << d.size() << "\\n";
}`,
          ['2 1', '9 2', '9 1', '2 2'],
          2,
          'last copied 9 before pop_back removed it, and one element remains.',
        ),
        predictOutput(
          'The code meant to save the item it removes. What does it print?',
          `#include <deque>
#include <iostream>
int main() {
  std::deque<int> d{6, 1};
  d.pop_front();
  int removed = d.front();
  std::cout << removed << "\\n";
}`,
          ['6', '1', '0', '7'],
          1,
          'front() was read after the pop, so it returns the new front, 1. The removed 6 is gone.',
        ),
        choose(
          'What does `tasks.pop_front()` return?',
          [
            'The removed front element',
            'Nothing; its return type is void',
            'The new front element',
            'The new size of the deque',
          ],
          1,
          'pop_front only removes. Read front() first if the value is needed.',
        ),
      ],
    },
    {
      title: 'Never pop an empty deque',
      explanation: [
        'Calling front, back, pop_front or pop_back on an empty deque is undefined behavior; there is no exception to catch. Check empty() first and decide what an empty deque should produce.',
        'When draining in a loop, remember that each pop shrinks size(). A condition such as i < d.size() changes while the loop runs, so take the count once before the loop or test empty() on each step.',
      ],
      example: {
        language: 'cpp',
        code: `#include <deque>
#include <iostream>
int main() {
  std::deque<int> jobs{4, 2};
  for (int i = 0; i < 3; ++i) {
    if (jobs.empty()) std::cout << "idle\\n";
    else {
      std::cout << jobs.front() << "\\n";
      jobs.pop_front();
    }
  }
}`,
        output: '4\n2\nidle',
        explanation:
          'Two passes take the two jobs. On the third pass the deque is empty, so the guard prints idle instead of popping.',
      },
      questions: [
        predictOutput(
          'The loop is meant to empty the deque. What does it print?',
          `#include <cstddef>
#include <deque>
#include <iostream>
int main() {
  std::deque<int> d{1, 2, 3, 4};
  for (std::size_t i = 0; i < d.size(); ++i) d.pop_front();
  std::cout << d.size() << "\\n";
}`,
          ['0', '2', '1', '4'],
          1,
          'Each pass increases i and shrinks size(): after two pops, i is 2 and size() is 2, so the loop stops early.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <cstddef>
#include <deque>
#include <iostream>
int main() {
  std::deque<int> d{1, 2, 3, 4};
  std::size_t count = d.size();
  for (std::size_t i = 0; i < count; ++i) d.pop_front();
  std::cout << d.size() << " " << d.empty() << "\\n";
}`,
          ['0 1', '2 0', '0 0', '4 1'],
          0,
          'The count is fixed at 4 before the loop, so all four elements are popped and empty() is true.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <deque>
#include <iostream>
int take(std::deque<int>& d) {
  if (d.empty()) return -1;
  int value = d.front();
  d.pop_front();
  return value;
}
int main() {
  std::deque<int> d{5, 6};
  int a = take(d);
  int b = take(d);
  int c = take(d);
  std::cout << a << " " << b << " " << c << "\\n";
}`,
          ['5 6 6', '6 5 -1', '5 -1 -1', '5 6 -1'],
          3,
          'The first two calls take 5 and 6. The third finds the deque empty and returns -1 without popping.',
        ),
        choose(
          'What happens if pop_front is called on an empty std::deque?',
          [
            'Nothing; the call is ignored',
            'It throws std::out_of_range',
            'Undefined behavior, so the program must check empty() first',
            'It returns -1',
          ],
          2,
          'pop_front has a precondition that the deque is nonempty; breaking it is undefined behavior, not a reported error.',
        ),
      ],
    },
    {
      title: 'Rotate work between the ends',
      explanation: [
        'Popping from one end and pushing to the other turns a deque into a rotation: take the front item, use it, and push it to the back if it needs another turn. Always read front() before pop_front().',
      ],
      example: {
        language: 'cpp',
        code: `#include <deque>
#include <iostream>
int main() {
  std::deque<int> turns{1, 2, 3};
  for (int step = 0; step < 4; ++step) {
    int player = turns.front();
    turns.pop_front();
    turns.push_back(player);
    std::cout << player << " ";
  }
  std::cout << "\\n";
}`,
        output: '1 2 3 1',
        explanation:
          'Each player moves from the front to the back after their turn, so play cycles back to 1 on the fourth step.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `#include <deque>
#include <iostream>
int main() {
  std::deque<int> turns{7, 8};
  for (int step = 0; step < 3; ++step) {
    int player = turns.front();
    turns.pop_front();
    turns.push_back(player);
    std::cout << player << " ";
  }
  std::cout << "\\n";
}`,
          ['7 8 7', '7 7 7', '7 8 8', '8 7 8'],
          0,
          'The two players alternate: 7, then 8, then 7 again.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <deque>
#include <iostream>
int main() {
  std::deque<int> turns{1, 2, 3};
  for (int step = 0; step < 2; ++step) {
    int player = turns.front();
    turns.pop_front();
    turns.push_back(player);
  }
  std::cout << turns.front() << " " << turns.back() << "\\n";
}`,
          ['1 3', '2 1', '3 2', '3 1'],
          2,
          'After two rotations the deque is 3, 1, 2.',
        ),
        predictOutput(
          'Each number is the work left on a job. What does this program print?',
          `#include <deque>
#include <iostream>
int main() {
  std::deque<int> work{2, 1};
  int steps = 0;
  for (int i = 0; i < 5; ++i) {
    if (work.size() > 0) {
      int left = work.front() - 1;
      work.pop_front();
      if (left > 0) work.push_back(left);
      ++steps;
    }
  }
  std::cout << steps << " " << work.size() << "\\n";
}`,
          ['5 0', '3 0', '2 1', '3 1'],
          1,
          'The 2 runs once and returns as 1, the original 1 finishes, then the returned 1 finishes: three steps, and nothing is left.',
        ),
        choose(
          'In a rotation step, why must the code read front() before calling pop_front()?',
          [
            'pop_front returns void and destroys the element, so its value is gone afterwards',
            'front() becomes unavailable after any push_back',
            'pop_front moves the element to the back automatically',
            'Reading front afterwards returns the same element anyway',
          ],
          0,
          'After pop_front the element no longer exists, and front() would return the next element.',
        ),
      ],
    },
  ],
  'cpp-queue-fifo': [
    {
      title: 'Push at the back, take from the front',
      explanation: [
        'std::queue<int> (from <queue>) is an adapter, by default over a deque, that allows only first-in-first-out use: push adds at the back, front reads the oldest element, pop removes it, and back reads the newest. It has no indexing and no iteration.',
      ],
      example: {
        language: 'cpp',
        code: `#include <iostream>
#include <queue>
int main() {
  std::queue<int> pending;
  pending.push(4);
  pending.push(9);
  pending.push(2);
  std::cout << pending.front() << " " << pending.back() << "\\n";
  pending.pop();
  std::cout << pending.front() << " " << pending.size() << "\\n";
}`,
        output: '4 2\n9 2',
        explanation:
          '4 arrived first, so it is at the front, and 2 arrived last. pop removes 4, which makes 9 the front.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `#include <iostream>
#include <queue>
int main() {
  std::queue<int> q;
  q.push(3);
  q.push(1);
  q.push(6);
  q.pop();
  std::cout << q.front() << "\\n";
}`,
          ['3', '6', '1', '10'],
          2,
          'pop removes the oldest element, 3, so 1 is now at the front.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <iostream>
#include <queue>
int main() {
  std::queue<int> q;
  q.push(5);
  q.push(8);
  q.pop();
  q.push(2);
  std::cout << q.front() << " " << q.back() << "\\n";
}`,
          ['5 2', '8 2', '2 8', '8 5'],
          1,
          'After 5 is removed, 8 is the oldest and 2 the newest.',
        ),
        choose(
          'Which operation does std::queue<int> not provide?',
          ['back', 'operator[]', 'size', 'pop'],
          1,
          'A queue exposes only its two ends; there is no access by position.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <iostream>
#include <queue>
#include <vector>
int main() {
  std::vector<int> input{7, 3, 9};
  std::queue<int> q;
  for (int value : input) q.push(value);
  for (int i = 0; i < 2; ++i) {
    std::cout << q.front() << " ";
    q.pop();
  }
  std::cout << "\\n";
}`,
          ['9 3', '3 7', '7 3', '3 9'],
          2,
          'Values leave in the order they were pushed: 7, then 3.',
        ),
      ],
    },
    {
      title: 'A queue serves arrival order, not priority',
      explanation: [
        'A queue never looks at the values. The element pushed first is served first, even if a later element is larger or more urgent. When service must follow a priority instead, a priority_queue is the right adapter; choosing between them is choosing the service contract.',
      ],
      example: {
        language: 'cpp',
        code: `#include <iostream>
#include <queue>
int main() {
  std::queue<int> orders;
  orders.push(30);
  orders.push(99);
  orders.push(10);
  for (int i = 0; i < 3; ++i) {
    std::cout << orders.front() << " ";
    orders.pop();
  }
  std::cout << "\\n";
}`,
        output: '30 99 10',
        explanation:
          'The orders come out exactly in arrival order. The larger 99 does not jump ahead of 30.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `#include <iostream>
#include <queue>
int main() {
  std::queue<int> q;
  q.push(2);
  q.push(8);
  q.push(5);
  for (int i = 0; i < 3; ++i) {
    std::cout << q.front() << " ";
    q.pop();
  }
  std::cout << "\\n";
}`,
          ['8 5 2', '2 5 8', '2 8 5', '5 8 2'],
          2,
          'A queue preserves arrival order and never sorts.',
        ),
        choose(
          'Support tickets must be answered in the order they arrive. Which container matches that rule?',
          [
            'std::priority_queue<int> keyed by severity',
            'std::queue<int>',
            'std::set<int> of ticket numbers',
            'A min heap of ticket severities',
          ],
          1,
          'Only a FIFO queue serves strictly by arrival; the other choices reorder by value.',
        ),
        choose(
          'A program pushes severities 3, 9 and then 1 into a std::queue<int>. What does front() return?',
          [
            '9, the most severe',
            '1, the least severe',
            '3, the first pushed',
            '1, the last pushed',
          ],
          2,
          'front() is always the oldest element; severity plays no part.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <iostream>
#include <queue>
int main() {
  std::queue<int> q;
  q.push(1);
  q.push(2);
  q.pop();
  q.push(3);
  std::cout << q.front() << " " << q.back() << " " << q.size() << "\\n";
}`,
          ['2 3 2', '1 3 2', '3 2 2', '2 3 3'],
          0,
          '1 left first, leaving 2 as the oldest and 3 as the newest of two elements.',
        ),
      ],
    },
    {
      title: 'Process a queue that grows while it runs',
      explanation: [
        'Processing an item can create more work: serve the front item, then push any follow-up items to the back. They wait behind everything already queued, so earlier arrivals finish first. Check that the queue is not empty before each front and pop.',
      ],
      example: {
        language: 'cpp',
        code: `#include <iostream>
#include <queue>
int main() {
  std::queue<int> work;
  work.push(3);
  work.push(1);
  for (int step = 0; step < 5; ++step) {
    if (work.empty()) std::cout << "done ";
    else {
      int item = work.front();
      work.pop();
      std::cout << item << " ";
      if (item > 1) work.push(item - 1);
    }
  }
  std::cout << "\\n";
}`,
        output: '3 1 2 1 done',
        explanation:
          'Serving 3 adds a 2 behind the waiting 1. The 1 is served next, then the 2, which adds a final 1. On the fifth step nothing is left.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `#include <iostream>
#include <queue>
int main() {
  std::queue<int> work;
  work.push(2);
  work.push(2);
  for (int step = 0; step < 5; ++step) {
    if (work.empty()) std::cout << "done ";
    else {
      int item = work.front();
      work.pop();
      std::cout << item << " ";
      if (item > 1) work.push(item - 1);
    }
  }
  std::cout << "\\n";
}`,
          ['2 1 2 1 done', '2 2 1 1 done', '2 1 1 2 done', '2 2 1 1 1'],
          1,
          'Both original 2s are served before either follow-up 1, because the follow-ups join the back.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <iostream>
#include <queue>
int main() {
  std::queue<int> work;
  work.push(1);
  work.push(3);
  for (int step = 0; step < 4; ++step) {
    if (work.empty()) std::cout << "done ";
    else {
      int item = work.front();
      work.pop();
      std::cout << item << " ";
      if (item > 1) work.push(item - 1);
    }
  }
  std::cout << "\\n";
}`,
          ['3 2 1 1', '1 3 1 2', '1 2 3 1', '1 3 2 1'],
          3,
          '1 is served first. The 3 then produces 2, and the 2 produces 1, each served in turn.',
        ),
        choose(
          'A follow-up item is pushed while three items are already waiting. When is it served?',
          [
            'Next, because it is the newest',
            'After the three waiting items',
            'Before any waiting item with a smaller value',
            'Never, because pushes during processing are ignored',
          ],
          1,
          'push always adds at the back, so the new item waits for everything queued before it.',
        ),
        predictOutput(
          'Each item larger than 1 creates two smaller items. How many items are served?',
          `#include <iostream>
#include <queue>
int main() {
  std::queue<int> work;
  work.push(2);
  int served = 0;
  for (int step = 0; step < 6; ++step) {
    if (work.size() > 0) {
      int item = work.front();
      work.pop();
      ++served;
      if (item > 1) {
        work.push(item - 1);
        work.push(item - 1);
      }
    }
  }
  std::cout << served << "\\n";
}`,
          ['6', '2', '3', '4'],
          2,
          'The 2 is served and adds two 1s; those two are served and add nothing. The remaining steps find the queue empty.',
        ),
      ],
    },
  ],
  'cpp-deque': [
    {
      title: 'Enforce the capacity before pushing',
      explanation: [
        'A deque grows whenever you push; it never refuses an element because of an application rule. If a buffer may hold at most capacity items, the code must compare size() with capacity before each push and decide what happens to an item that does not fit.',
        'Waiting for memory allocation to fail is not a policy: by then the process may be using far more memory than intended.',
      ],
      example: {
        language: 'cpp',
        code: `#include <cstddef>
#include <deque>
#include <iostream>
#include <vector>
int main() {
  std::vector<int> incoming{5, 8, 1, 4};
  std::size_t capacity = 3;
  std::deque<int> buffer;
  int rejected = 0;
  for (int item : incoming) {
    if (buffer.size() == capacity) ++rejected;
    else buffer.push_back(item);
  }
  std::cout << buffer.size() << " " << rejected << " " << buffer.back() << "\\n";
}`,
        output: '3 1 1',
        explanation:
          'The first three items fill the buffer. When 4 arrives, size() equals capacity, so 4 is rejected and the last accepted item is 1.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `#include <cstddef>
#include <deque>
#include <iostream>
#include <vector>
int main() {
  std::vector<int> incoming{1, 2, 3, 4, 5};
  std::size_t capacity = 2;
  std::deque<int> buffer;
  int rejected = 0;
  for (int item : incoming) {
    if (buffer.size() == capacity) ++rejected;
    else buffer.push_back(item);
  }
  std::cout << buffer.size() << " " << rejected << "\\n";
}`,
          ['5 0', '2 3', '2 2', '3 2'],
          1,
          'Two items fit; the other three each find the buffer full.',
        ),
        predictOutput(
          'A capacity is declared but never checked. What does this program print?',
          `#include <cstddef>
#include <deque>
#include <iostream>
#include <vector>
int main() {
  std::vector<int> incoming{1, 2, 3, 4, 5};
  std::size_t capacity = 2;
  std::deque<int> buffer;
  for (int item : incoming) buffer.push_back(item);
  std::cout << buffer.size() << " " << capacity << "\\n";
}`,
          ['2 2', '0 2', '3 2', '5 2'],
          3,
          'A deque has no limit of its own, so all five items are stored. The capacity variable has no effect unless the code checks it.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <cstddef>
#include <deque>
#include <iostream>
#include <vector>
int main() {
  std::vector<int> incoming{7, 7};
  std::size_t capacity = 0;
  std::deque<int> buffer;
  int rejected = 0;
  for (int item : incoming) {
    if (buffer.size() == capacity) ++rejected;
    else buffer.push_back(item);
  }
  std::cout << buffer.size() << " " << rejected << "\\n";
}`,
          ['0 2', '1 1', '2 0', '0 0'],
          0,
          'With capacity 0, the empty buffer is already full, so every item is rejected.',
        ),
        choose(
          'A message buffer must never hold more than 1,000 messages. What enforces that with std::deque?',
          [
            'Constructing the deque with 1,000 elements',
            'Catching std::bad_alloc when the deque grows too large',
            'Checking size() against 1,000 before every push_back',
            'Calling shrink_to_fit after each push',
          ],
          2,
          'Only an explicit check before pushing applies the application’s limit; the container has none.',
        ),
      ],
    },
    {
      title: 'Get the full-buffer comparison right',
      explanation: [
        'Check before pushing, and treat size() == capacity (or size() >= capacity) as full. Writing the check as size() > capacity lets one extra item in, because the buffer is only over capacity after a push has already happened. Equivalently, accept while size() < capacity.',
      ],
      example: {
        language: 'cpp',
        code: `#include <cstddef>
#include <deque>
#include <iostream>
#include <vector>
int main() {
  std::vector<int> incoming{1, 2, 3, 4};
  std::size_t capacity = 2;
  std::deque<int> strict;
  std::deque<int> loose;
  for (int item : incoming) {
    if (strict.size() < capacity) strict.push_back(item);
    if (loose.size() <= capacity) loose.push_back(item);
  }
  std::cout << strict.size() << " " << loose.size() << "\\n";
}`,
        output: '2 3',
        explanation:
          'strict stops at 2. loose still accepts when its size equals 2, so it ends with 3 items, one over the limit.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `#include <cstddef>
#include <deque>
#include <iostream>
#include <vector>
int main() {
  std::vector<int> incoming{1, 2, 3, 4, 5};
  std::size_t capacity = 3;
  std::deque<int> buffer;
  int dropped = 0;
  for (int item : incoming) {
    if (buffer.size() > capacity) ++dropped;
    else buffer.push_back(item);
  }
  std::cout << buffer.size() << " " << dropped << "\\n";
}`,
          ['3 2', '4 1', '5 0', '3 1'],
          1,
          'With >, a buffer holding exactly 3 still accepts, so it reaches 4 before anything is dropped.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <cstddef>
#include <deque>
#include <iostream>
#include <vector>
int main() {
  std::vector<int> incoming{1, 2, 3, 4, 5};
  std::size_t capacity = 3;
  std::deque<int> buffer;
  int dropped = 0;
  for (int item : incoming) {
    if (buffer.size() >= capacity) ++dropped;
    else buffer.push_back(item);
  }
  std::cout << buffer.size() << " " << dropped << "\\n";
}`,
          ['3 2', '4 1', '2 3', '3 1'],
          0,
          'With >=, a buffer holding 3 counts as full, so exactly 3 items are kept and 2 are dropped.',
        ),
        choose(
          'With capacity 4, which condition, checked before push_back, correctly means the buffer is full?',
          [
            'buffer.size() > 4',
            'buffer.size() + 1 == 4',
            'buffer.back() == 4',
            'buffer.size() == 4',
          ],
          3,
          'The buffer is full when it already holds 4 items; > 4 would admit a fifth.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <cstddef>
#include <deque>
#include <iostream>
#include <vector>
int main() {
  std::vector<int> incoming{9, 8};
  std::size_t capacity = 1;
  std::deque<int> buffer;
  for (int item : incoming)
    if (buffer.size() < capacity) buffer.push_back(item);
  std::cout << buffer.front() << " " << buffer.size() << "\\n";
}`,
          ['8 1', '9 2', '9 1', '8 2'],
          2,
          'The first item fills the single slot; 8 arrives when size() is no longer less than 1.',
        ),
      ],
    },
    {
      title: 'Stop reading once the buffer is full',
      explanation: [
        'Another policy is to stop reading input as soon as the buffer is full and leave the rest for later. break leaves the loop immediately, so the remaining items are not examined at all. That differs from rejecting each extra item, which reads and discards every one of them.',
      ],
      example: {
        language: 'cpp',
        code: `#include <cstddef>
#include <deque>
#include <iostream>
#include <vector>
int main() {
  std::vector<int> incoming{6, 2, 9, 4};
  std::size_t capacity = 2;
  std::deque<int> buffer;
  int examined = 0;
  for (int item : incoming) {
    ++examined;
    if (buffer.size() == capacity) break;
    buffer.push_back(item);
  }
  std::cout << buffer.size() << " " << examined << "\\n";
}`,
        output: '2 3',
        explanation:
          '6 and 2 fill the buffer. The loop examines 9, finds the buffer full and breaks, so 4 is never examined.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `#include <cstddef>
#include <deque>
#include <iostream>
#include <vector>
int main() {
  std::vector<int> incoming{1, 2, 3, 4, 5};
  std::size_t capacity = 3;
  std::deque<int> buffer;
  int examined = 0;
  for (int item : incoming) {
    ++examined;
    if (buffer.size() == capacity) break;
    buffer.push_back(item);
  }
  std::cout << buffer.size() << " " << examined << "\\n";
}`,
          ['3 5', '3 4', '3 3', '4 4'],
          1,
          'Three items fill the buffer; the fourth is examined, the check fails, and the loop ends before the fifth.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <cstddef>
#include <deque>
#include <iostream>
#include <vector>
int main() {
  std::vector<int> incoming{1, 2};
  std::size_t capacity = 10;
  std::deque<int> buffer;
  int examined = 0;
  for (int item : incoming) {
    ++examined;
    if (buffer.size() == capacity) break;
    buffer.push_back(item);
  }
  std::cout << buffer.size() << " " << examined << "\\n";
}`,
          ['2 2', '10 2', '2 10', '0 2'],
          0,
          'The buffer never fills, so the loop simply runs out of input after two items.',
        ),
        predictOutput(
          'This version rejects instead of stopping. What does it print?',
          `#include <cstddef>
#include <deque>
#include <iostream>
#include <vector>
int main() {
  std::vector<int> incoming{1, 2, 3, 4, 5};
  std::size_t capacity = 3;
  std::deque<int> buffer;
  int examined = 0;
  int rejected = 0;
  for (int item : incoming) {
    ++examined;
    if (buffer.size() == capacity) ++rejected;
    else buffer.push_back(item);
  }
  std::cout << rejected << " " << examined << "\\n";
}`,
          ['1 4', '2 5', '0 5', '2 3'],
          1,
          'Without break, every item is examined; the last two find the buffer full and are rejected.',
        ),
        choose(
          'Input arrives faster than it can be processed, and unread input must stay unread for the next round. Which policy fits?',
          [
            'Push every item and trim the buffer later',
            'Reject and discard each item that does not fit',
            'Break out of the reading loop as soon as the buffer is full',
            'Raise the capacity whenever the buffer fills',
          ],
          2,
          'Stopping the read leaves the remaining input untouched; rejecting would consume and lose it.',
        ),
      ],
    },
  ],
};
