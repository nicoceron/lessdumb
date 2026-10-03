import { choose, predictOutput, type KnowledgePointModule } from './authoring';

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
  'cpp-sort-order': [
    {
      title: 'Sort a whole range in place',
      explanation: [
        'std::sort(v.begin(), v.end()) (from <algorithm>) rearranges the elements of the range into ascending order. It works in place: the vector itself changes, and duplicate values are kept.',
      ],
      example: {
        language: 'cpp',
        code: `#include <algorithm>
#include <iostream>
#include <vector>
int main() {
  std::vector<int> prices{9, 2, 4, 2};
  std::sort(prices.begin(), prices.end());
  for (int price : prices) std::cout << price << " ";
  std::cout << "\\n";
}`,
        output: '2 2 4 9',
        explanation:
          'The same vector now holds its four values in ascending order; both copies of 2 are still there.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `#include <algorithm>
#include <iostream>
#include <vector>
int main() {
  std::vector<int> v{5, -1, 3};
  std::sort(v.begin(), v.end());
  std::cout << v.front() << " " << v.back() << "\\n";
}`,
          ['5 3', '-1 5', '5 -1', '-1 3'],
          1,
          'After sorting, the smallest value is at the front and the largest at the back.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <algorithm>
#include <iostream>
#include <vector>
int main() {
  std::vector<int> v{4, 4, 1};
  std::sort(v.begin(), v.end());
  for (int x : v) std::cout << x << " ";
  std::cout << "\\n";
}`,
          ['1 4', '4 4 1', '1 4 4', '4 1'],
          2,
          'sort only reorders; it keeps every element, including the duplicate 4.',
        ),
        choose(
          'After `std::sort(v.begin(), v.end());`, what has happened to v?',
          [
            'Nothing; sort returns a new sorted vector',
            'v holds only its distinct values, ascending',
            'v is now in descending order',
            'v itself now holds its elements in ascending order',
          ],
          3,
          'sort works in place through the iterators and returns nothing; ascending order is the default.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <algorithm>
#include <iostream>
#include <vector>
int main() {
  std::vector<int> v{30, 10, 20, 10};
  std::sort(v.begin(), v.end());
  std::cout << v[1] << " " << v[2] << "\\n";
}`,
          ['10 20', '20 30', '10 10', '30 10'],
          0,
          'The sorted vector is 10 10 20 30, so indexes 1 and 2 hold 10 and 20.',
        ),
      ],
    },
    {
      title: 'Sort only part of a range',
      explanation: [
        'sort accepts any half-open iterator range, not only a whole container. std::sort(v.begin(), v.begin() + 3) sorts the first three elements and leaves the rest exactly where they were.',
      ],
      example: {
        language: 'cpp',
        code: `#include <algorithm>
#include <iostream>
#include <vector>
int main() {
  std::vector<int> v{8, 5, 9, 1, 3};
  std::sort(v.begin(), v.begin() + 3);
  for (int x : v) std::cout << x << " ";
  std::cout << "\\n";
}`,
        output: '5 8 9 1 3',
        explanation:
          'Only 8, 5 and 9 are inside the range, so they become 5 8 9. The 1 and 3 after it are untouched.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `#include <algorithm>
#include <iostream>
#include <vector>
int main() {
  std::vector<int> v{6, 2, 7, 1};
  std::sort(v.begin(), v.begin() + 2);
  for (int x : v) std::cout << x << " ";
  std::cout << "\\n";
}`,
          ['1 2 6 7', '2 6 7 1', '2 6 1 7', '6 2 1 7'],
          1,
          'The range covers only the first two elements, so 6 and 2 swap and 7, 1 stay as they were.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <algorithm>
#include <iostream>
#include <vector>
int main() {
  std::vector<int> v{9, 4, 8, 3};
  std::sort(v.begin() + 1, v.end());
  for (int x : v) std::cout << x << " ";
  std::cout << "\\n";
}`,
          ['3 4 8 9', '4 8 9 3', '9 8 4 3', '9 3 4 8'],
          3,
          'The range starts at index 1, so 9 stays first and the other three are sorted.',
        ),
        choose(
          'Which call sorts only the last two elements of a five-element vector v?',
          [
            'std::sort(v.begin() + 2, v.end())',
            'std::sort(v.end() - 2, v.end())',
            'std::sort(v.end() - 2, v.end() + 1)',
            'std::sort(v.begin(), v.begin() + 2)',
          ],
          1,
          'v.end() - 2 is the first of the last two elements, and v.end() ends the range. The other ranges cover three elements, run past the end, or cover the first two.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <algorithm>
#include <iostream>
#include <vector>
int main() {
  std::vector<int> v{3, 1, 2};
  std::sort(v.begin(), v.begin() + 1);
  for (int x : v) std::cout << x << " ";
  std::cout << "\\n";
}`,
          ['1 2 3', '1 3 2', '3 1 2', '3 2 1'],
          2,
          'A one-element range is already sorted, so nothing moves.',
        ),
      ],
    },
    {
      title: 'Sort descending with a strict comparator',
      explanation: [
        'A third argument supplies the ordering. std::greater<int>() (from <functional>) compares with >, so std::sort(v.begin(), v.end(), std::greater<int>()) sorts in descending order.',
        'The comparator must be strict: it must return false when two elements are equal. A comparison with <= or >= breaks that rule, and sort may then misbehave or even read outside the range.',
      ],
      example: {
        language: 'cpp',
        code: `#include <algorithm>
#include <functional>
#include <iostream>
#include <vector>
int main() {
  std::vector<int> v{4, 9, 1};
  std::sort(v.begin(), v.end(), std::greater<int>());
  for (int x : v) std::cout << x << " ";
  std::cout << "\\n";
}`,
        output: '9 4 1',
        explanation:
          'With std::greater, an element comes first when it is larger, so the result is descending.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `#include <algorithm>
#include <functional>
#include <iostream>
#include <vector>
int main() {
  std::vector<int> v{2, 8, 5, 8};
  std::sort(v.begin(), v.end(), std::greater<int>());
  for (int x : v) std::cout << x << " ";
  std::cout << "\\n";
}`,
          ['2 5 8 8', '8 5 2', '8 8 5 2', '8 2 5 8'],
          2,
          'Descending order keeps both 8s, which come first.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <algorithm>
#include <functional>
#include <iostream>
#include <vector>
int main() {
  std::vector<int> v{-3, 0, -7};
  std::sort(v.begin(), v.end(), std::greater<int>());
  std::cout << v.front() << "\\n";
}`,
          ['-7', '0', '-3', '7'],
          1,
          'The largest value comes first in descending order, and 0 is larger than any negative number.',
        ),
        choose(
          'Why is a comparator written with >= unsafe for std::sort?',
          [
            'It sorts ascending instead of descending',
            'It is slower than > but otherwise equivalent',
            'It says an element comes before itself, breaking the strict ordering sort requires',
            'It removes equal elements',
          ],
          2,
          'For equal elements a >= comparator returns true both ways, which violates the strict weak ordering sort relies on.',
        ),
        choose(
          'Which call sorts a vector<int> v from largest to smallest?',
          [
            'std::sort(v.begin(), v.end(), std::greater<int>())',
            'std::sort(v.end(), v.begin())',
            'std::sort(v.begin(), v.end())',
            'std::sort(v.begin(), v.end(), std::less<int>())',
          ],
          0,
          'std::greater orders larger values first. Swapping the iterators does not reverse the order; it is an invalid range.',
        ),
      ],
    },
  ],
  'cpp-binary-search': [
    {
      title: 'Ask whether a sorted range contains a value',
      explanation: [
        'std::binary_search(first, last, value) returns true if value occurs in the sorted range [first, last). It halves the range at each step, so it needs about log2(n) comparisons instead of examining every element.',
        'It answers only yes or no; it does not report where the value is.',
      ],
      example: {
        language: 'cpp',
        code: `#include <algorithm>
#include <iostream>
#include <vector>
int main() {
  std::vector<int> v{2, 4, 9};
  std::cout << std::binary_search(v.begin(), v.end(), 4) << " " << std::binary_search(v.begin(), v.end(), 5) << "\\n";
}`,
        output: '1 0',
        explanation:
          'The vector is already sorted. 4 is present and 5 is not, and a bool prints as 1 or 0.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `#include <algorithm>
#include <iostream>
#include <vector>
int main() {
  std::vector<int> v{1, 3, 5, 7};
  std::cout << std::binary_search(v.begin(), v.end(), 7) << " " << std::binary_search(v.begin(), v.end(), 0) << "\\n";
}`,
          ['1 0', '3 -1', '0 1', '1 1'],
          0,
          '7 is present and 0 is not. binary_search returns a bool, not a position.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <algorithm>
#include <iostream>
#include <vector>
int main() {
  std::vector<int> v{9, 2, 4};
  std::sort(v.begin(), v.end());
  std::cout << std::binary_search(v.begin(), v.end(), 9) << "\\n";
}`,
          ['0', '2', '1', '9'],
          2,
          'After sorting, the range is 2 4 9, and 9 is found.',
        ),
        choose(
          'What does std::binary_search return?',
          [
            'The index of the value, or -1',
            'An iterator to the value',
            'The number of times the value occurs',
            'true if the value is in the range, otherwise false',
          ],
          3,
          'It reports only presence, as a bool.',
        ),
        predictOutput(
          'How many queries are found?',
          `#include <algorithm>
#include <iostream>
#include <vector>
int main() {
  std::vector<int> v{10, 20, 30};
  std::vector<int> queries{20, 25, 30, 5};
  int found = 0;
  for (int q : queries)
    if (std::binary_search(v.begin(), v.end(), q)) ++found;
  std::cout << found << "\\n";
}`,
          ['3', '2', '1', '4'],
          1,
          'Only 20 and 30 occur exactly; binary_search does not accept nearby values.',
        ),
      ],
    },
    {
      title: 'Search with the order the range was sorted by',
      explanation: [
        'binary_search assumes the range is already sorted by the same comparison it uses. On an unsorted range it can answer false for a value that is present, because it discards halves based on an order that is not there.',
        'If the range was sorted with a custom comparator, such as std::greater<int>() for descending order, pass that same comparator to binary_search.',
      ],
      example: {
        language: 'cpp',
        code: `#include <algorithm>
#include <functional>
#include <iostream>
#include <vector>
int main() {
  std::vector<int> v{3, 8, 1, 6};
  std::sort(v.begin(), v.end(), std::greater<int>());
  std::cout << std::binary_search(v.begin(), v.end(), 6, std::greater<int>()) << "\\n";
}`,
        output: '1',
        explanation:
          'The range is 8 6 3 1, sorted descending, and the search uses the same std::greater ordering, so it finds 6.',
      },
      questions: [
        choose(
          'A vector holds {7, 1, 5}, unsorted. What can be said about `std::binary_search(v.begin(), v.end(), 7)`?',
          [
            'It returns true because 7 is present',
            'It returns false because the vector is unsorted',
            'Its result cannot be trusted, because the sorted-input precondition is broken',
            'It sorts the vector first, then searches',
          ],
          2,
          'binary_search never sorts or checks its input; on unsorted data it may skip the half that contains the value.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <algorithm>
#include <functional>
#include <iostream>
#include <vector>
int main() {
  std::vector<int> v{4, 10, 7};
  std::sort(v.begin(), v.end(), std::greater<int>());
  std::cout << std::binary_search(v.begin(), v.end(), 7, std::greater<int>()) << " " << std::binary_search(v.begin(), v.end(), 5, std::greater<int>()) << "\\n";
}`,
          ['0 1', '1 1', '1 0', '7 0'],
          2,
          'Sorting and searching use the same descending order, so 7 is found and 5 correctly is not.',
        ),
        choose(
          'A vector was sorted with std::greater<int>(). Which search call is correct?',
          [
            'std::binary_search(v.begin(), v.end(), x)',
            'std::binary_search(v.begin(), v.end(), x, std::greater<int>())',
            'std::binary_search(v.end(), v.begin(), x)',
            'std::binary_search(v.begin(), v.end(), -x)',
          ],
          1,
          'The search must use the ordering the range is sorted by; the default < assumes ascending order.',
        ),
        choose(
          'Why does binary_search not fall back to checking every element when the input is unsorted?',
          [
            'It compares only about log2(n) elements, relying on sorted order to skip the rest',
            'It does check every element, but in reverse order',
            'It sorts a copy first and searches that',
            'It reports an error for unsorted input',
          ],
          0,
          'Skipping half the range at each step is the whole point; it is valid only because the order guarantees the skipped half cannot contain the value.',
        ),
      ],
    },
    {
      title: 'Sort once, then search many times',
      explanation: [
        'Sorting costs about n log n comparisons and each binary search about log n. When many queries hit the same data, sort once and then search for each query; sorting again for every query wastes that work.',
      ],
      example: {
        language: 'cpp',
        code: `#include <algorithm>
#include <iostream>
#include <vector>
int main() {
  std::vector<int> allowed{42, 7, 19, 3};
  std::sort(allowed.begin(), allowed.end());
  std::vector<int> requests{19, 20, 3};
  for (int r : requests)
    std::cout << r << (std::binary_search(allowed.begin(), allowed.end(), r) ? " yes" : " no") << "\\n";
}`,
        output: '19 yes\n20 no\n3 yes',
        explanation:
          'The list is sorted once to 3 7 19 42, then each request is answered with one binary search.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `#include <algorithm>
#include <iostream>
#include <vector>
int main() {
  std::vector<int> allowed{5, 1, 9};
  std::sort(allowed.begin(), allowed.end());
  std::vector<int> requests{9, 2};
  for (int r : requests) std::cout << std::binary_search(allowed.begin(), allowed.end(), r) << " ";
  std::cout << "\\n";
}`,
          ['1 0', '0 1', '1 1', '2 0'],
          0,
          '9 is in the sorted list 1 5 9; 2 is not.',
        ),
        predictOutput(
          'How many queries are found?',
          `#include <algorithm>
#include <iostream>
#include <vector>
int main() {
  std::vector<int> data{15, 3, 8, 12};
  std::sort(data.begin(), data.end());
  std::vector<int> queries{8, 9, 15, 3, 4};
  int found = 0;
  for (int q : queries)
    if (std::binary_search(data.begin(), data.end(), q)) ++found;
  std::cout << found << "\\n";
}`,
          ['2', '4', '3', '5'],
          2,
          '8, 15 and 3 are present; 9 and 4 are not.',
        ),
        choose(
          'A program answers 1,000 membership queries on 100,000 values that never change. Which plan fits?',
          [
            'Sort before every query, then binary_search',
            'binary_search the unsorted vector',
            'Sort after all the queries are answered',
            'Sort once, then binary_search for each query',
          ],
          3,
          'One sort pays for all the queries; every other plan either repeats the sort or searches unsorted data.',
        ),
      ],
    },
  ],
  'cpp-accumulate-seed': [
    {
      title: 'Add a range to a starting value',
      explanation: [
        'std::accumulate(first, last, init) (from <numeric>) starts a running total at init, adds each element in turn, and returns the total. The seed is part of the result: a seed of 10 adds 10 to the sum, and an empty range returns the seed itself.',
      ],
      example: {
        language: 'cpp',
        code: `#include <iostream>
#include <numeric>
#include <vector>
int main() {
  std::vector<int> v{3, 4, 5};
  std::cout << std::accumulate(v.begin(), v.end(), 0) << " " << std::accumulate(v.begin(), v.end(), 100) << "\\n";
}`,
        output: '12 112',
        explanation:
          'The elements add up to 12. Starting from 100 instead of 0 gives 112.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `#include <iostream>
#include <numeric>
#include <vector>
int main() {
  std::vector<int> v{2, 7, 1};
  std::cout << std::accumulate(v.begin(), v.end(), 5) << "\\n";
}`,
          ['10', '15', '5', '17'],
          1,
          'The elements sum to 10, and the seed 5 is added to that total.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <iostream>
#include <numeric>
#include <vector>
int main() {
  std::vector<int> empty;
  std::cout << std::accumulate(empty.begin(), empty.end(), 7) << "\\n";
}`,
          ['0', '-1', '7', '1'],
          2,
          'With no elements to add, accumulate returns the seed unchanged.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <iostream>
#include <numeric>
#include <vector>
int main() {
  std::vector<int> v{10, 20, 30};
  std::cout << std::accumulate(v.begin() + 1, v.end(), 0) << "\\n";
}`,
          ['60', '30', '40', '50'],
          3,
          'The range starts at index 1, so only 20 and 30 are added.',
        ),
        choose(
          'What is the third argument of std::accumulate?',
          [
            'The starting value of the running total, included in the result',
            'The number of elements to add',
            'The index to start from',
            'A value to skip while adding',
          ],
          0,
          'accumulate begins with init and adds every element of the range to it.',
        ),
      ],
    },
    {
      title: 'The seed sets the running total’s type',
      explanation: [
        'accumulate keeps its running total in the type of init, not in the element type. With an int seed of 0, every partial sum of doubles is converted back to int, so the fraction is lost at each step. Seed with 0.0 to sum doubles.',
      ],
      example: {
        language: 'cpp',
        code: `#include <iostream>
#include <numeric>
#include <vector>
int main() {
  std::vector<double> parts{1.5, 2.5};
  std::cout << std::accumulate(parts.begin(), parts.end(), 0) << " " << std::accumulate(parts.begin(), parts.end(), 0.0) << "\\n";
}`,
        output: '3 4',
        explanation:
          'With seed 0, the total is an int: 0 + 1.5 becomes 1, then 1 + 2.5 becomes 3. With seed 0.0 the total stays a double and reaches 4.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `#include <iostream>
#include <numeric>
#include <vector>
int main() {
  std::vector<double> halves{0.5, 0.5, 0.5, 0.5};
  std::cout << std::accumulate(halves.begin(), halves.end(), 0) << "\\n";
}`,
          ['2', '0', '1', '4'],
          1,
          'Each step computes 0 + 0.5 and stores it back in an int, which truncates to 0, so the total never grows.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <iostream>
#include <numeric>
#include <vector>
int main() {
  std::vector<double> parts{1.9, 1.9};
  std::cout << std::accumulate(parts.begin(), parts.end(), 0) << "\\n";
}`,
          ['3.8', '3', '2', '4'],
          2,
          '0 + 1.9 truncates to 1, then 1 + 1.9 = 2.9 truncates to 2. Truncation happens at every step, not once at the end.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <iostream>
#include <numeric>
#include <vector>
int main() {
  std::vector<double> parts{2.25, 0.75};
  std::cout << std::accumulate(parts.begin(), parts.end(), 0.0) << "\\n";
}`,
          ['2', '3.75', '3', '2.25'],
          2,
          'A double seed keeps the fractions: 2.25 + 0.75 is exactly 3, which prints as 3.',
        ),
        choose(
          '`std::accumulate(prices.begin(), prices.end(), 0)` sums a vector<double>. What is wrong?',
          [
            'Nothing; the result is converted to double at the end',
            'accumulate cannot sum doubles',
            'The seed must be the first element',
            'The running total is an int, so each partial sum loses its fraction',
          ],
          3,
          'The literal 0 is an int, so the total is an int throughout. Use 0.0.',
        ),
      ],
    },
    {
      title: 'Seed wide enough for the total',
      explanation: [
        'The same rule applies to integers. Adding two ints near 2,000,000,000 in an int total overflows, which is undefined behavior. A long long seed, 0LL, makes every partial sum a long long, so the total fits.',
        'Converting the result afterwards cannot help: by then the overflow has already happened inside accumulate.',
      ],
      example: {
        language: 'cpp',
        code: `#include <iostream>
#include <numeric>
#include <vector>
int main() {
  std::vector<int> volumes{2000000000, 2000000000};
  long long total = std::accumulate(volumes.begin(), volumes.end(), 0LL);
  std::cout << total << "\\n";
}`,
        output: '4000000000',
        explanation:
          'The seed is a long long, so each addition happens in long long, and 4,000,000,000 fits.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `#include <iostream>
#include <numeric>
#include <vector>
int main() {
  std::vector<int> v{2000000000, 1000000000, 500000000};
  std::cout << std::accumulate(v.begin(), v.end(), 0LL) << "\\n";
}`,
          ['-794967296', '3500000000', '2147483647', '3.5e+09'],
          1,
          'With a long long seed, every partial sum fits, and the exact total prints.',
        ),
        choose(
          'Which call correctly sums a vector<int> whose total may exceed 3,000,000,000?',
          [
            'long long total = std::accumulate(v.begin(), v.end(), 0);',
            'static_cast<long long>(std::accumulate(v.begin(), v.end(), 0))',
            'std::accumulate(v.begin(), v.end(), 0LL)',
            'std::accumulate(v.begin(), v.end(), 0u)',
          ],
          2,
          'Only a long long seed makes the additions themselves wide. The other forms widen after the int total has overflowed, or wrap at about 4.29 billion.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <iostream>
#include <numeric>
#include <vector>
int main() {
  std::vector<int> v{1, 2, 2};
  double mean = std::accumulate(v.begin(), v.end(), 0.0) / v.size();
  std::cout << mean << "\\n";
}`,
          ['1', '1.66667', '1.67', '2'],
          1,
          'The double seed makes the total 5.0, so the division is floating-point: 5 / 3 prints as 1.66667.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <iostream>
#include <numeric>
#include <vector>
int main() {
  std::vector<int> v{1, 2, 4};
  std::cout << std::accumulate(v.begin(), v.end(), 0LL) / 2 << "\\n";
}`,
          ['3.5', '4', '7', '3'],
          3,
          'The total 7 is a long long, so dividing by 2 is integer division and gives 3.',
        ),
      ],
    },
  ],
  'cpp-algorithms': [
    {
      title: 'std::remove compacts but does not shrink',
      explanation: [
        'std::remove(first, last, value) (from <algorithm>) moves every element not equal to value toward the front, keeping their order, and returns an iterator to the new logical end. It cannot change the vector’s size, because it receives only iterators, not the vector.',
        'Elements from the returned iterator to end() are leftovers with unspecified values. The number kept is the distance from begin() to the returned iterator.',
      ],
      example: {
        language: 'cpp',
        code: `#include <algorithm>
#include <iostream>
#include <vector>
int main() {
  std::vector<int> v{2, 3, 2, 4};
  auto logical_end = std::remove(v.begin(), v.end(), 2);
  std::cout << v.size() << " " << (logical_end - v.begin()) << "\\n";
  for (auto it = v.begin(); it != logical_end; ++it) std::cout << *it << " ";
  std::cout << "\\n";
}`,
        output: '4 2\n3 4',
        explanation:
          'The vector still has 4 elements, but only the first 2, 3 and 4, are kept values.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `#include <algorithm>
#include <iostream>
#include <vector>
int main() {
  std::vector<int> v{5, 1, 5, 5, 2};
  auto logical_end = std::remove(v.begin(), v.end(), 5);
  std::cout << v.size() << " " << (logical_end - v.begin()) << "\\n";
}`,
          ['2 2', '5 3', '5 2', '2 5'],
          2,
          'remove does not shrink the vector, which still has 5 elements; only 1 and 2 are kept.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <algorithm>
#include <iostream>
#include <vector>
int main() {
  std::vector<int> v{7, 0, 8, 0, 9};
  auto logical_end = std::remove(v.begin(), v.end(), 0);
  for (auto it = v.begin(); it != logical_end; ++it) std::cout << *it << " ";
  std::cout << "\\n";
}`,
          ['7 0 8 0 9', '9 8 7', '8 9', '7 8 9'],
          3,
          'The kept values are moved to the front in their original order.',
        ),
        choose(
          'Why can std::remove not shrink the vector?',
          [
            'It receives only iterators, so it cannot call the vector’s member functions',
            'Shrinking would invalidate the returned iterator',
            'It shrinks only const vectors',
            'It does shrink the vector when nothing is removed',
          ],
          0,
          'Algorithms work on iterator ranges. Changing size needs the container itself, through erase.',
        ),
        predictOutput(
          'Nothing matches. What does this program print?',
          `#include <algorithm>
#include <iostream>
#include <vector>
int main() {
  std::vector<int> v{1, 2};
  auto logical_end = std::remove(v.begin(), v.end(), 9);
  std::cout << (logical_end == v.end()) << "\\n";
}`,
          ['0', '1', '2', '9'],
          1,
          'Every element is kept, so the logical end is the real end.',
        ),
      ],
    },
    {
      title: 'Erase the leftover tail',
      explanation: [
        'The erase-remove idiom finishes the job: v.erase(std::remove(v.begin(), v.end(), x), v.end()); erases everything from the logical end to the real end, so size() drops to the number of kept elements. The kept elements stay in their original relative order.',
      ],
      example: {
        language: 'cpp',
        code: `#include <algorithm>
#include <iostream>
#include <vector>
int main() {
  std::vector<int> v{2, 3, 2, 4};
  v.erase(std::remove(v.begin(), v.end(), 2), v.end());
  std::cout << v.size() << ":";
  for (int x : v) std::cout << " " << x;
  std::cout << "\\n";
}`,
        output: '2: 3 4',
        explanation:
          'remove compacts 3 and 4 to the front, and erase deletes the two leftovers, so the vector really has two elements.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `#include <algorithm>
#include <iostream>
#include <vector>
int main() {
  std::vector<int> v{1, 9, 1, 9, 1};
  v.erase(std::remove(v.begin(), v.end(), 1), v.end());
  std::cout << v.size() << ":";
  for (int x : v) std::cout << " " << x;
  std::cout << "\\n";
}`,
          ['2: 9 9', '3: 1 1 1', '5: 9 9 1 9 1', '2: 9 1'],
          0,
          'All three 1s are removed and the tail erased, leaving the two 9s.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <algorithm>
#include <iostream>
#include <vector>
int main() {
  std::vector<int> v{3, 3, 3};
  v.erase(std::remove(v.begin(), v.end(), 3), v.end());
  std::cout << v.size() << " " << v.empty() << "\\n";
}`,
          ['3 0', '1 0', '0 1', '0 0'],
          2,
          'Every element matched, so the logical end is begin() and erase removes everything.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <algorithm>
#include <iostream>
#include <vector>
int main() {
  std::vector<int> v{4, 5};
  v.erase(std::remove(v.begin(), v.end(), 6), v.end());
  std::cout << v.size() << "\\n";
}`,
          ['1', '0', '6', '2'],
          3,
          'Nothing matches 6, so remove returns end() and erasing the empty range [end, end) changes nothing.',
        ),
        choose(
          'Which statement removes every 0 from vector<int> v and shrinks it?',
          [
            'std::remove(v.begin(), v.end(), 0);',
            'v.erase(std::remove(v.begin(), v.end(), 0), v.end());',
            'v.erase(v.begin(), std::remove(v.begin(), v.end(), 0));',
            'v.erase(std::remove(v.begin(), v.end(), 0));',
          ],
          1,
          'Erase from the logical end to the real end. The third form erases the kept values instead, and the last erases only one element.',
        ),
      ],
    },
    {
      title: 'Pass both iterators to erase',
      explanation: [
        'v.erase(it) with one argument erases a single element. Forgetting the second argument, as in v.erase(std::remove(...)), erases only the first leftover, so the vector keeps stale elements whenever two or more values were removed.',
        'Worse, when nothing matches, remove returns end(), and erase(end()) is undefined behavior. Always write v.erase(std::remove(...), v.end()).',
      ],
      example: {
        language: 'cpp',
        code: `#include <algorithm>
#include <iostream>
#include <vector>
int main() {
  std::vector<int> v{2, 3, 2, 4, 2};
  v.erase(std::remove(v.begin(), v.end(), 2));
  std::vector<int> w{2, 3, 2, 4, 2};
  w.erase(std::remove(w.begin(), w.end(), 2), w.end());
  std::cout << v.size() << " " << w.size() << "\\n";
}`,
        output: '4 2',
        explanation:
          'Three 2s were removed, but the one-argument erase deleted only one leftover, so v still has 4 elements. w is correct.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `#include <algorithm>
#include <iostream>
#include <vector>
int main() {
  std::vector<int> v{8, 1, 8, 8};
  v.erase(std::remove(v.begin(), v.end(), 8));
  std::cout << v.size() << "\\n";
}`,
          ['1', '3', '2', '4'],
          1,
          'Only 1 is kept, but erase with one iterator deletes a single leftover, leaving 3 elements.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <algorithm>
#include <iostream>
#include <vector>
int main() {
  std::vector<int> v{8, 1, 8, 8};
  v.erase(std::remove(v.begin(), v.end(), 8), v.end());
  std::cout << v.size() << "\\n";
}`,
          ['3', '0', '1', '4'],
          2,
          'Erasing from the logical end to end() removes all three leftovers.',
        ),
        choose(
          'What does `v.erase(std::remove(v.begin(), v.end(), x));` do when x does not occur in v?',
          [
            'Nothing, because no element matches',
            'It erases the last element',
            'It throws std::out_of_range',
            'It calls erase(end()), which is undefined behavior',
          ],
          3,
          'remove returns end() when nothing matches, and erasing the element at end() is invalid because there is none.',
        ),
        predictOutput(
          'Exactly one element matches. What does this program print?',
          `#include <algorithm>
#include <iostream>
#include <vector>
int main() {
  std::vector<int> v{5, 6, 7};
  v.erase(std::remove(v.begin(), v.end(), 6));
  for (int x : v) std::cout << x << " ";
  std::cout << "\\n";
}`,
          ['5 7', '5 6', '5 7 7', '7'],
          0,
          'With one match there is one leftover, so the one-argument erase happens to work. That is why this bug hides in tests with a single match.',
        ),
      ],
    },
  ],
  'cpp-lambda-value-capture': [
    {
      title: 'Write and call a lambda',
      explanation: [
        'A lambda expression creates an unnamed function object. [] starts the capture list, (int x) lists the parameters, and the body in braces computes the result. Store the lambda with auto and call it like a function.',
        'Creating a lambda does not run it; the body runs each time the lambda is called.',
      ],
      example: {
        language: 'cpp',
        code: `#include <iostream>
int main() {
  auto twice = [](int x) { return x * 2; };
  std::cout << twice(4) << " " << twice(-3) << "\\n";
}`,
        output: '8 -6',
        explanation:
          'twice holds the lambda. Each call runs its body with the given argument.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `#include <iostream>
int main() {
  auto add = [](int a, int b) { return a + b; };
  std::cout << add(2, 5) * 3 << "\\n";
}`,
          ['17', '21', '10', '7'],
          1,
          'add(2, 5) returns 7 first, and then the result is multiplied by 3.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <iostream>
int main() {
  auto inc = [](int x) { return x + 1; };
  std::cout << inc(inc(5)) << "\\n";
}`,
          ['6', '5', '7', '11'],
          2,
          'The inner call returns 6, and the outer call adds one more.',
        ),
        choose(
          'In `auto f = [](int x) { return x * x; };`, what is f?',
          [
            'The int returned by the lambda',
            'A pointer to x',
            'A copy of the variable x',
            'A function object that can be called as f(3)',
          ],
          3,
          'The lambda expression produces a callable object; nothing is computed until f is called.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <iostream>
int main() {
  int value = 3;
  auto bump = [](int x) { return x + 10; };
  std::cout << value << "\\n";
}`,
          ['3', '13', '10', '0'],
          0,
          'Defining bump does not call it, and nothing passes value to it, so value is still 3.',
        ),
      ],
    },
    {
      title: '[value] copies the variable when the lambda is created',
      explanation: [
        'To use a local variable inside a lambda, name it in the capture list. [value] captures by value: the lambda stores its own copy, taken at the moment the lambda is created.',
        'Later changes to the original variable do not reach that copy, so every call sees the snapshot.',
      ],
      example: {
        language: 'cpp',
        code: `#include <iostream>
int main() {
  int limit = 4;
  auto saved = [limit] { return limit; };
  limit += 10;
  std::cout << saved() << " " << limit << "\\n";
}`,
        output: '4 14',
        explanation:
          'saved copied 4 when it was created. Adding 10 to limit afterwards changes only the original.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `#include <iostream>
int main() {
  int rate = 3;
  auto cost = [rate](int n) { return n * rate; };
  rate = 5;
  std::cout << cost(2) << "\\n";
}`,
          ['10', '6', '15', '5'],
          1,
          'cost captured rate when it was 3, so cost(2) is 2 * 3.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <iostream>
int main() {
  int rate = 3;
  rate = 5;
  auto cost = [rate](int n) { return n * rate; };
  std::cout << cost(2) << "\\n";
}`,
          ['6', '15', '3', '10'],
          3,
          'This time the lambda is created after the change, so its copy holds 5.',
        ),
        choose(
          'A lambda is created with [count] while count is 2. Afterwards count becomes 9. What does the lambda see when it is called?',
          [
            '9, the current value',
            '0, because captured copies start empty',
            '2, the copy made when the lambda was created',
            '11, the sum of both values',
          ],
          2,
          'A by-value capture is a snapshot taken at creation.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <iostream>
int main() {
  int base = 10;
  int bonus = 1;
  auto score = [base](int points) { return base + points; };
  base = 20;
  bonus = 5;
  std::cout << score(bonus) << "\\n";
}`,
          ['25', '21', '15', '11'],
          2,
          'base was captured as 10, while bonus is passed as an argument at the call, when it is 5.',
        ),
      ],
    },
    {
      title: 'Each lambda keeps its own snapshot',
      explanation: [
        'Each lambda expression makes its copy when it is evaluated, so two lambdas created at different times hold different snapshots of the same variable, and neither follows later changes.',
        'A by-value capture is also read-only inside the lambda by default, so calling the lambda cannot change its snapshot either.',
      ],
      example: {
        language: 'cpp',
        code: `#include <iostream>
int main() {
  int price = 100;
  auto morning = [price] { return price; };
  price = 120;
  auto noon = [price] { return price; };
  price = 90;
  std::cout << morning() << " " << noon() << " " << price << "\\n";
}`,
        output: '100 120 90',
        explanation:
          'morning copied 100 and noon copied 120. The final change to 90 affects only price.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `#include <iostream>
int main() {
  int level = 1;
  auto a = [level] { return level * 10; };
  level = 2;
  auto b = [level] { return level * 10; };
  level = 3;
  std::cout << a() + b() << "\\n";
}`,
          ['30', '60', '40', '20'],
          0,
          'a holds 1 and b holds 2, so the calls return 10 and 20.',
        ),
        predictOutput(
          'The lambda captures a reference variable by value. What does this program print?',
          `#include <iostream>
int main() {
  int value = 4;
  int& alias = value;
  auto snap = [alias] { return alias; };
  value = 8;
  std::cout << snap() << "\\n";
}`,
          ['8', '4', '0', '12'],
          1,
          'Capturing alias by value copies the int it refers to, 4. The copy does not follow value afterwards.',
        ),
        choose(
          'Inside `[total] { total += 1; return total; }`, why does the compiler reject total += 1?',
          [
            'total must be captured with auto',
            'Lambdas cannot contain more than one statement',
            'total is a parameter, not a capture',
            'A by-value capture is read-only inside the lambda unless the lambda is marked mutable',
          ],
          3,
          'The captured copy is const inside an ordinary lambda.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <iostream>
int main() {
  int x = 2;
  auto f = [x](int y) { return x * y; };
  x = f(3);
  std::cout << x << " " << f(3) << "\\n";
}`,
          ['6 18', '6 6', '2 6', '18 18'],
          1,
          'Assigning f(3) to x changes the original to 6, but the lambda’s copy is still 2, so f(3) is 6 again.',
        ),
      ],
    },
  ],
  'cpp-lambda-reference-capture': [
    {
      title: '[&value] reads the live variable',
      explanation: [
        '[&value] captures by reference: the lambda refers to the original variable instead of copying it. Each call reads the variable’s current value, so changes made after the lambda was created are visible.',
      ],
      example: {
        language: 'cpp',
        code: `#include <iostream>
int main() {
  int value = 4;
  auto live = [&value] { return value; };
  value += 3;
  std::cout << live() << "\\n";
}`,
        output: '7',
        explanation: 'live reads value at the call, after it has become 7.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `#include <iostream>
int main() {
  int rate = 3;
  auto cost = [&rate](int n) { return n * rate; };
  rate = 5;
  std::cout << cost(2) << "\\n";
}`,
          ['6', '10', '15', '5'],
          1,
          'The reference capture sees rate’s current value, 5.',
        ),
        predictOutput(
          'One variable is captured by value and one by reference. What does this program print?',
          `#include <iostream>
int main() {
  int a = 1;
  int b = 1;
  auto f = [a, &b] { return a * 10 + b; };
  a = 2;
  b = 2;
  std::cout << f() << "\\n";
}`,
          ['11', '21', '12', '22'],
          2,
          'a was copied as 1; b is read live as 2.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <iostream>
int main() {
  int level = 1;
  auto read = [&level] { return level; };
  int before = read();
  level = 9;
  std::cout << before << " " << read() << "\\n";
}`,
          ['1 1', '9 9', '9 1', '1 9'],
          3,
          'before stored the result of the first call. The second call reads the updated level.',
        ),
        choose(
          'A lambda must always report the current value of a counter that keeps changing. Which capture fits?',
          ['[&counter]', '[counter]', '[]', '[counter = 0]'],
          0,
          'Only a reference capture reads the variable at each call; the others hold fixed copies or nothing.',
        ),
      ],
    },
    {
      title: 'Change the original through a reference capture',
      explanation: [
        'A reference capture can also modify the original. [&count] { ++count; } increments the caller’s variable each time it is called. No mutable keyword is needed, because the lambda changes the referenced variable, not a copy it owns.',
      ],
      example: {
        language: 'cpp',
        code: `#include <iostream>
int main() {
  int count = 0;
  auto tick = [&count] { ++count; };
  tick();
  tick();
  tick();
  std::cout << count << "\\n";
}`,
        output: '3',
        explanation: 'Each call increments the same variable, count.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `#include <iostream>
int main() {
  int total = 5;
  auto add = [&total](int x) { total += x; };
  add(2);
  add(3);
  std::cout << total << "\\n";
}`,
          ['5', '8', '10', '7'],
          2,
          'Both calls add to the original total: 5 + 2 + 3.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <iostream>
int main() {
  int n = 1;
  auto snapshot = [n] { return n; };
  auto grow = [&n] { n *= 4; };
  grow();
  std::cout << n << " " << snapshot() << "\\n";
}`,
          ['4 4', '1 1', '4 1', '1 4'],
          2,
          'grow changes the original n to 4. snapshot copied n before that and still holds 1.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <iostream>
int main() {
  int stock = 10;
  auto take = [&stock](int k) {
    stock -= k;
    return stock;
  };
  int left = take(3);
  take(4);
  std::cout << left << " " << stock << "\\n";
}`,
          ['7 3', '3 3', '7 7', '10 3'],
          0,
          'left saved the 7 returned by the first call. The second call reduces stock itself to 3.',
        ),
        choose(
          'Why does `[&count] { ++count; }` compile without mutable while `[count] { ++count; }` does not?',
          [
            'Reference captures are always mutable copies',
            'The reference version changes the caller’s variable; the value version would change the lambda’s own read-only copy',
            '++ is defined only for references',
            'The value version needs a return statement',
          ],
          1,
          'mutable concerns the lambda’s own copies. A reference capture owns no copy to modify.',
        ),
      ],
    },
    {
      title: 'A captured reference must outlive the lambda',
      explanation: [
        'A reference capture stores no copy, so it is valid only while the original variable exists. A lambda that captures a function’s local or parameter by reference and is returned from that function refers to a destroyed variable; calling it is undefined behavior.',
        'When a lambda may outlive the scope it was created in, capture by value. A function can return a lambda by declaring its return type as auto.',
      ],
      example: {
        language: 'cpp',
        code: `#include <iostream>
auto make_scaler(int factor) {
  return [factor](int x) { return x * factor; };
}
int main() {
  auto triple = make_scaler(3);
  std::cout << triple(5) << "\\n";
}`,
        output: '15',
        explanation:
          'factor ends when make_scaler returns. Capturing it by value copies 3 into the lambda, so triple still works afterwards. With [&factor], triple would refer to a destroyed parameter.',
      },
      questions: [
        choose(
          'Calling the lambda returned by `auto make() { int local = 5; return [&local] { return local; }; }` is unsafe. Why?',
          [
            'Lambdas cannot be returned from functions',
            'local must be const to be captured',
            'local is destroyed when make returns, so the lambda refers to a dead variable',
            'The lambda copies local twice',
          ],
          2,
          'The reference outlives the object it names. Capturing local by value would fix it.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <iostream>
auto make_adder(int offset) {
  return [offset](int x) { return x + offset; };
}
int main() {
  auto add4 = make_adder(4);
  auto add9 = make_adder(9);
  std::cout << add4(10) << " " << add9(10) << "\\n";
}`,
          ['14 19', '19 19', '14 14', '13 19'],
          0,
          'Each call to make_adder creates a separate lambda with its own copy of offset.',
        ),
        choose(
          'Which lambda is safe to store and call after the current function returns?',
          [
            '[&total] { return total; } where total is a local',
            '[&] { return total; } where total is a local',
            '[&total] { return total + 1; } where total is a parameter',
            '[total] { return total; } where total is a local',
          ],
          3,
          'Only the by-value capture keeps its own copy after the local is destroyed.',
        ),
      ],
    },
  ],
  'cpp-lambda-predicate': [
    {
      title: 'count_if counts the elements a predicate accepts',
      explanation: [
        'A predicate is a callable that takes one element and returns bool. std::count_if(first, last, pred) (from <algorithm>) calls pred on every element of the range and counts the true results.',
        'The count has a signed integer type, std::ptrdiff_t; static_cast<int> converts it when an int is wanted.',
      ],
      example: {
        language: 'cpp',
        code: `#include <algorithm>
#include <iostream>
#include <vector>
int main() {
  std::vector<int> changes{3, -1, 4, -5, 0};
  int drops = static_cast<int>(std::count_if(changes.begin(), changes.end(), [](int x) { return x < 0; }));
  std::cout << drops << "\\n";
}`,
        output: '2',
        explanation:
          'The predicate is true for -1 and -5 only; 0 is not less than 0.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `#include <algorithm>
#include <iostream>
#include <vector>
int main() {
  std::vector<int> v{2, 7, 4, 9, 6};
  std::cout << std::count_if(v.begin(), v.end(), [](int x) { return x > 5; }) << "\\n";
}`,
          ['2', '3', '5', '4'],
          1,
          '7, 9 and 6 are greater than 5.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <algorithm>
#include <iostream>
#include <vector>
int main() {
  std::vector<int> v{0, 1, 0, 0};
  std::cout << std::count_if(v.begin(), v.end(), [](int x) { return x == 0; }) << "\\n";
}`,
          ['1', '4', '0', '3'],
          3,
          'Three elements are equal to 0.',
        ),
        choose(
          'What must a predicate passed to count_if return for each element?',
          [
            'A bool saying whether to count the element',
            'The element itself',
            'The running count',
            'The index of the element',
          ],
          0,
          'count_if adds one for every true result; the predicate only decides.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <algorithm>
#include <iostream>
#include <vector>
int main() {
  std::vector<int> v{-1, -2, 3, -4};
  std::cout << std::count_if(v.begin() + 1, v.end(), [](int x) { return x < 0; }) << "\\n";
}`,
          ['3', '1', '2', '4'],
          2,
          'The range starts at index 1, so -1 is not examined; -2 and -4 are counted.',
        ),
      ],
    },
    {
      title: 'Capture the threshold the predicate needs',
      explanation: [
        'A predicate often needs an outside value, such as a threshold. Capture it: [threshold](int x) { return x > threshold; }. Because the capture is by value, the predicate holds a snapshot and is safe to keep or pass along.',
        'Read the comparison carefully: > excludes elements equal to the threshold, while >= includes them.',
      ],
      example: {
        language: 'cpp',
        code: `#include <algorithm>
#include <iostream>
#include <vector>
int main() {
  std::vector<int> v{1, 5, 8, 5};
  int threshold = 5;
  std::cout << std::count_if(v.begin(), v.end(), [threshold](int x) { return x > threshold; }) << " " << std::count_if(v.begin(), v.end(), [threshold](int x) { return x >= threshold; }) << "\\n";
}`,
        output: '1 3',
        explanation:
          'Only 8 is strictly greater than 5. With >=, both 5s also count.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `#include <algorithm>
#include <iostream>
#include <vector>
int main() {
  std::vector<int> v{10, 20, 30, 20};
  int limit = 20;
  std::cout << std::count_if(v.begin(), v.end(), [limit](int x) { return x >= limit; }) << "\\n";
}`,
          ['1', '2', '3', '4'],
          2,
          '20, 30 and the second 20 are at least 20.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <algorithm>
#include <iostream>
#include <vector>
int main() {
  std::vector<int> v{10, 20, 30, 20};
  int limit = 20;
  std::cout << std::count_if(v.begin(), v.end(), [limit](int x) { return x > limit; }) << "\\n";
}`,
          ['1', '3', '2', '0'],
          0,
          'Only 30 is strictly greater than 20.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <algorithm>
#include <iostream>
#include <vector>
int main() {
  std::vector<int> v{1, 5, 12};
  int limit = 2;
  auto above = [limit](int x) { return x > limit; };
  limit = 10;
  std::cout << std::count_if(v.begin(), v.end(), above) << "\\n";
}`,
          ['1', '2', '3', '0'],
          1,
          'above captured limit when it was 2, so 5 and 12 count. The later change to 10 does not reach the copy.',
        ),
        choose(
          'A filter counts readings strictly above max_ok. Which predicate is right?',
          [
            '[max_ok](int r) { return r >= max_ok; }',
            '[](int r) { return r > max_ok; }',
            '[max_ok](int r) { return max_ok > r; }',
            '[max_ok](int r) { return r > max_ok; }',
          ],
          3,
          'The predicate must capture max_ok and compare with >. Without the capture, max_ok cannot be used in the body.',
        ),
      ],
    },
    {
      title: 'find_if returns the first match',
      explanation: [
        'std::find_if(first, last, pred) returns an iterator to the first element for which pred is true, or last if none matches. As with any search, compare the result with end() before dereferencing it.',
      ],
      example: {
        language: 'cpp',
        code: `#include <algorithm>
#include <iostream>
#include <vector>
int main() {
  std::vector<int> v{4, 9, 2, 11};
  auto big = std::find_if(v.begin(), v.end(), [](int x) { return x > 8; });
  auto huge = std::find_if(v.begin(), v.end(), [](int x) { return x > 20; });
  std::cout << *big << " " << (huge == v.end()) << "\\n";
}`,
        output: '9 1',
        explanation:
          '9 is the first element above 8, even though 11 also matches. Nothing is above 20, so huge equals end().',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `#include <algorithm>
#include <iostream>
#include <vector>
int main() {
  std::vector<int> v{3, 6, 8};
  auto it = std::find_if(v.begin(), v.end(), [](int x) { return x > 5; });
  std::cout << (it == v.end() ? -1 : *it) << "\\n";
}`,
          ['8', '6', '2', '-1'],
          1,
          'find_if stops at the first match, 6.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <algorithm>
#include <iostream>
#include <vector>
int main() {
  std::vector<int> v{5, 0, -2, -7};
  auto it = std::find_if(v.begin(), v.end(), [](int x) { return x < 0; });
  std::cout << (it - v.begin()) << "\\n";
}`,
          ['2', '3', '-2', '1'],
          0,
          'The first negative element, -2, is at index 2.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <algorithm>
#include <iostream>
#include <vector>
int main() {
  std::vector<int> v{1, 2, 3};
  int limit = 3;
  auto it = std::find_if(v.begin(), v.end(), [limit](int x) { return x > limit; });
  std::cout << (it == v.end() ? -1 : *it) << "\\n";
}`,
          ['3', '0', '-1', '1'],
          2,
          'No element is greater than 3, so find_if returns end() and the fallback prints.',
        ),
        choose(
          'What do count_if and find_if return for the same predicate?',
          [
            'Both return the number of matches',
            'count_if returns the first match; find_if returns every match',
            'Both return iterators',
            'count_if returns how many elements match; find_if returns an iterator to the first match or end()',
          ],
          3,
          'count_if examines every element; find_if stops at the first match.',
        ),
      ],
    },
  ],
  'cpp-lambdas': [
    {
      title: 'An init capture creates a new closure member',
      explanation: [
        'An init capture, [name = expression], declares a new variable inside the closure and initializes it from any expression when the lambda is created. It captures a computed value or gives a capture a new name.',
      ],
      example: {
        language: 'cpp',
        code: `#include <iostream>
int main() {
  int a = 2;
  int b = 3;
  auto scale = [sum = a + b](int x) { return x * sum; };
  a = 100;
  std::cout << scale(2) << "\\n";
}`,
        output: '10',
        explanation:
          'sum was initialized once to 5 when the lambda was created; changing a afterwards has no effect.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `#include <iostream>
int main() {
  int width = 4;
  auto area = [w = width * 2](int h) { return w * h; };
  width = 1;
  std::cout << area(3) << "\\n";
}`,
          ['12', '3', '24', '6'],
          2,
          'w was computed as 8 when area was created, so area(3) is 24.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <iostream>
int main() {
  int count = 7;
  auto next = [n = count] { return n + 1; };
  std::cout << next() << " " << count << "\\n";
}`,
          ['8 7', '8 8', '7 7', '7 8'],
          0,
          'n is a copy of count, so the call returns 8 and count is unchanged.',
        ),
        choose(
          'What does the init capture in `[limit = max * 2] { return limit; }` create?',
          [
            'A reference to max',
            'A parameter named limit',
            'A new closure member named limit, initialized once from max * 2',
            'A copy of max that updates when max changes',
          ],
          2,
          'An init capture is evaluated once, when the lambda is created, and stored in the closure.',
        ),
      ],
    },
    {
      title: 'Move a unique_ptr into the closure',
      explanation: [
        'A std::unique_ptr cannot be copied, so the capture [owner] does not compile. An init capture can move it instead: [held = std::move(owner)] transfers ownership into the closure.',
        'Afterwards owner is empty (equal to nullptr), and the closure is the only owner.',
      ],
      example: {
        language: 'cpp',
        code: `#include <iostream>
#include <memory>
#include <utility>
int main() {
  auto owner = std::make_unique<int>(12);
  auto read = [held = std::move(owner)] { return *held; };
  std::cout << read() << " " << (owner == nullptr) << "\\n";
}`,
        output: '12 1',
        explanation:
          'held now owns the int 12. The move left owner empty, so the comparison prints 1.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `#include <iostream>
#include <memory>
#include <utility>
int main() {
  auto owner = std::make_unique<int>(5);
  auto doubled = [held = std::move(owner)] { return *held * 2; };
  std::cout << doubled() << " " << (owner == nullptr) << "\\n";
}`,
          ['10 0', '10 1', '5 1', '0 1'],
          1,
          'The closure owns the 5 and returns 10; the moved-from owner is empty.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <iostream>
#include <memory>
#include <utility>
int main() {
  auto owner = std::make_unique<int>(7);
  auto task = [held = std::move(owner)] { return *held + 1; };
  std::cout << (owner ? *owner : -1) << " " << task() << "\\n";
}`,
          ['7 8', '-1 7', '-1 8', '0 8'],
          2,
          'owner was emptied by the move, so the guard prints -1. The closure still reads its 7 and adds 1.',
        ),
        choose(
          'Why does `[owner] { return *owner; }` fail to compile when owner is a std::unique_ptr<int>?',
          [
            'Capturing by value would copy the unique_ptr, and unique_ptr cannot be copied',
            'Lambdas cannot dereference pointers',
            'owner must be captured as [&owner]',
            'unique_ptr cannot be used inside functions',
          ],
          0,
          'A unique_ptr can only be moved. An init capture with std::move expresses the transfer.',
        ),
        choose(
          'After `auto f = [held = std::move(owner)] { return *held; };`, which statement about owner is true?',
          [
            'owner still points to the same int as held',
            'owner is empty; dereferencing it is undefined behavior',
            'owner was destroyed and cannot be named any more',
            'owner holds a copy of the int',
          ],
          1,
          'Moving a unique_ptr transfers the pointer and leaves the source equal to nullptr. The variable still exists, but has nothing to dereference.',
        ),
      ],
    },
    {
      title: 'The closure owns the object until it is destroyed',
      explanation: [
        'Once ownership moves into a closure, the owned object lives exactly as long as the closure. When the closure goes out of scope, its unique_ptr member is destroyed and deletes the object, once.',
        'Capturing a local unique_ptr by reference instead ties the closure to that local; if the closure outlives the local’s scope, it refers to a destroyed owner.',
      ],
      example: {
        language: 'cpp',
        code: `#include <iostream>
#include <memory>
#include <utility>
struct Probe {
  int& released;
  explicit Probe(int& count) : released(count) {}
  ~Probe() { ++released; }
};
int main() {
  int released = 0;
  {
    auto owner = std::make_unique<Probe>(released);
    auto task = [held = std::move(owner)] { return held->released; };
    std::cout << task() << " ";
  }
  std::cout << released << "\\n";
}`,
        output: '0 1',
        explanation:
          'Inside the block the Probe is alive, so the count is 0. Leaving the block destroys task, whose member deletes the Probe exactly once; the empty owner deletes nothing.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `#include <iostream>
#include <memory>
#include <utility>
struct Probe {
  int& released;
  explicit Probe(int& count) : released(count) {}
  ~Probe() { ++released; }
};
int main() {
  int released = 0;
  auto owner = std::make_unique<Probe>(released);
  {
    auto task = [held = std::move(owner)] { return held != nullptr; };
    std::cout << task() << " ";
  }
  std::cout << released << " " << (owner == nullptr) << "\\n";
}`,
          ['1 0 1', '1 1 0', '1 1 1', '0 0 1'],
          2,
          'The closure owned the Probe and was destroyed at the end of the block, releasing it. owner, declared outside, is empty because it was moved from.',
        ),
        predictOutput(
          'This closure captures the owner by reference. What does this program print?',
          `#include <iostream>
#include <memory>
struct Probe {
  int& released;
  explicit Probe(int& count) : released(count) {}
  ~Probe() { ++released; }
};
int main() {
  int released = 0;
  auto owner = std::make_unique<Probe>(released);
  {
    auto peek = [&owner] { return owner != nullptr; };
    std::cout << peek() << " ";
  }
  std::cout << released << "\\n";
}`,
          ['1 1', '1 0', '0 0', '0 1'],
          1,
          'The closure only refers to owner, so destroying the closure releases nothing; owner still owns the Probe.',
        ),
        choose(
          'A callback must keep a unique_ptr’s object alive after the function that created the callback returns. Which capture fits?',
          [
            '[&owner]',
            '[held = owner.get()]',
            '[owner]',
            '[held = std::move(owner)]',
          ],
          3,
          'Moving the owner into the closure makes the closure responsible for the object. A reference or raw pointer would dangle, and [owner] does not compile.',
        ),
      ],
    },
  ],
  'cpp-function-template': [
    {
      title: 'One template, one function per type',
      explanation: [
        'A function template is a pattern: template<class T> T twice(T x) { return x + x; } defines twice for any type T that supports +. Each call instantiates the pattern for its argument type, so twice(3) uses an int version and twice(1.25) a double version.',
      ],
      example: {
        language: 'cpp',
        code: `#include <iostream>
template<class T> T twice(T x) { return x + x; }
int main() {
  std::cout << twice(3) << " " << twice(1.25) << "\\n";
}`,
        output: '6 2.5',
        explanation:
          'The compiler generates twice<int> for 3 and twice<double> for 1.25.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `#include <iostream>
template<class T> T square(T x) { return x * x; }
int main() {
  std::cout << square(5) << " " << square(0.5) << "\\n";
}`,
          ['25 0', '25 0.25', '25 0.5', '10 1'],
          1,
          'square<int>(5) is 25 and square<double>(0.5) is 0.25; each call keeps its own type.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <iostream>
template<class T> T larger(T a, T b) { return a < b ? b : a; }
int main() {
  std::cout << larger(3, 8) << " " << larger(2.5, -1.5) << "\\n";
}`,
          ['8 2.5', '3 2.5', '8 -1.5', '8 2'],
          0,
          'Each instantiation compares two values of its own type and returns the larger.',
        ),
        choose(
          'What does the compiler do with `template<class T> T twice(T x)` when a program calls twice(4) and twice(4.5)?',
          [
            'Converts both calls to double',
            'Uses one function that checks the type at run time',
            'Reports an error because T would have two types',
            'Generates two functions, one for int and one for double',
          ],
          3,
          'Each distinct T produces its own instantiation at compile time.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <iostream>
template<class T> T at_least(T x, T low) { return x < low ? low : x; }
int main() {
  std::cout << at_least(-4, 0) << " " << at_least(2.5, 1.0) << "\\n";
}`,
          ['-4 2.5', '0 1', '0 2.5', '-4 1'],
          2,
          '-4 is below 0, so 0 is returned. 2.5 is above 1.0, so it is returned unchanged.',
        ),
      ],
    },
    {
      title: 'The type decides what the operators do',
      explanation: [
        'Inside an instantiation, T is a real type, and operators behave as they do for that type. A template that divides performs integer division when T is int and floating-point division when T is double, from the same source text.',
        'The body must also make sense for each type it is used with. An operation the type does not support is an error in that instantiation only.',
      ],
      example: {
        language: 'cpp',
        code: `#include <iostream>
template<class T> T average(T a, T b) { return (a + b) / 2; }
int main() {
  std::cout << average(3, 4) << " " << average(3.0, 4.0) << "\\n";
}`,
        output: '3 3.5',
        explanation:
          'average<int> divides 7 by 2 with integer division, giving 3. average<double> gives 3.5.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `#include <iostream>
template<class T> T half(T x) { return x / 2; }
int main() {
  std::cout << half(7) << " " << half(7.0) << "\\n";
}`,
          ['3.5 3.5', '3 3', '4 3.5', '3 3.5'],
          3,
          'half<int> truncates 3.5 to 3; half<double> keeps 3.5.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <iostream>
template<class T> T half(T x) { return x / 2; }
int main() {
  std::cout << half(-7) << "\\n";
}`,
          ['-4', '-3', '-3.5', '3'],
          1,
          'T is int, and integer division truncates toward zero, so -3.5 becomes -3.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <iostream>
template<class T> T ratio(T a, T b) { return a / b; }
int main() {
  std::cout << ratio(1, 4) * 4 << " " << ratio(1.0, 4.0) * 4 << "\\n";
}`,
          ['1 1', '0 0', '0 1', '0.25 1'],
          2,
          'ratio<int>(1, 4) is 0, and 0 * 4 is 0. ratio<double> gives 0.25, and 0.25 * 4 is 1.',
        ),
        choose(
          'Why can one template return 3 for one call and 3.5 for another?',
          [
            'Each call instantiates the template for its argument type, and int division truncates',
            'Templates round their results',
            'The second call casts the result after dividing',
            'Templates always compute in double and convert back',
          ],
          0,
          'The same expression means integer division in the int instantiation and floating-point division in the double one.',
        ),
      ],
    },
  ],
  'cpp-template-deduction': [
    {
      title: 'T is deduced from the arguments',
      explanation: [
        'When a function template is called without angle brackets, the compiler deduces T by matching each parameter with its argument’s type: mid(1, 2) deduces T = int, and mid(1.0, 2.0) deduces T = double. The deduced type is then used everywhere T appears, including the return type.',
        'Only the arguments matter. Storing the result in a double does not change a T that was deduced as int.',
      ],
      example: {
        language: 'cpp',
        code: `#include <iostream>
template<class T> T mid(T a, T b) { return (a + b) / 2; }
int main() {
  double r = mid(1, 2);
  std::cout << mid(1.0, 2.0) << " " << r << "\\n";
}`,
        output: '1.5 1',
        explanation:
          'mid(1.0, 2.0) deduces double and returns 1.5. mid(1, 2) deduces int and returns 1 before the result is converted to the double r.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `#include <iostream>
template<class T> T mid(T a, T b) { return (a + b) / 2; }
int main() {
  double result = mid(4, 7);
  std::cout << result << "\\n";
}`,
          ['5.5', '5', '6', '5.0'],
          1,
          'Both arguments are int, so T is int and the division truncates to 5. The double variable receives 5.',
        ),
        choose(
          'For `template<class T> T add(T a, T b)`, what is T in the call add(4, 9)?',
          [
            'double',
            'It depends on where the result is stored',
            'int',
            'long long',
          ],
          2,
          'Both arguments are int literals, so T is deduced as int.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <iostream>
template<class T> T mid(T a, T b) { return (a + b) / 2; }
int main() {
  double price = 2.5;
  int qty = 2;
  std::cout << mid(price, 4.5) << " " << mid(qty, 5) << "\\n";
}`,
          ['3.5 3.5', '3.5 3', '3 3', '7 7'],
          1,
          'The first call deduces double and gives 3.5; the second deduces int and truncates 3.5 to 3.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <iostream>
template<class T> T scale(T x, T factor) { return x * factor; }
int main() {
  std::cout << scale(3, 2) << " " << scale(0.5, 3.0) << "\\n";
}`,
          ['6 1', '6 1.5', '6.0 1.5', '5 3.5'],
          1,
          'scale(3, 2) deduces int; scale(0.5, 3.0) deduces double, so the result keeps its fraction.',
        ),
      ],
    },
    {
      title: 'Resolve conflicting deductions explicitly',
      explanation: [
        'If two parameters both use T, every argument must deduce the same T. add(1, 2.5) deduces int from 1 and double from 2.5, so the call does not compile; deduction never tries conversions.',
        'Supplying the type explicitly, as in add<double>(1, 2.5), skips deduction: T is double, and 1 is converted to 1.0 like an ordinary function argument. Explicit arguments can also narrow: add<int>(1, 2.5) converts 2.5 to 2, which compilers usually warn about.',
      ],
      example: {
        language: 'cpp',
        code: `#include <iostream>
template<class T> T add(T a, T b) { return a + b; }
int main() {
  std::cout << add<double>(3, 0.5) << " " << add<int>(3, 0.5) << "\\n";
}`,
        output: '3.5 3',
        explanation:
          'With T = double, 3 becomes 3.0 and the sum is 3.5. With T = int, 0.5 becomes 0 and the sum is 3.',
      },
      questions: [
        choose(
          'Why does add(1, 2.5) fail for `template<class T> T add(T a, T b)`?',
          [
            'Templates cannot take literals',
            'T is deduced as int from 1 and as double from 2.5, and the deductions conflict',
            'The sum would overflow',
            'A double cannot be added to an int',
          ],
          1,
          'Each argument deduces T independently, and the two results must agree.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <iostream>
template<class T> T add(T a, T b) { return a + b; }
int main() {
  std::cout << add<double>(1, 2.5) << "\\n";
}`,
          ['3', '3.5', '4', '2.5'],
          1,
          'T is double, so 1 becomes 1.0 and the sum is 3.5.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <iostream>
template<class T> T add(T a, T b) { return a + b; }
int main() {
  std::cout << add<int>(1, 2.5) << "\\n";
}`,
          ['3.5', '4', '2', '3'],
          3,
          'T is int, so 2.5 is converted to 2 before the addition.',
        ),
        choose(
          'Which call compiles and returns 7.5 for `template<class T> T add(T a, T b)`?',
          [
            'add(5, 2.5)',
            'add<int>(5, 2.5)',
            'add<double>(5, 2.5)',
            'add(5.0, 2)',
          ],
          2,
          'add(5, 2.5) and add(5.0, 2) have conflicting deductions; add<int> drops the fraction.',
        ),
      ],
    },
  ],
  'cpp-class-template': [
    {
      title: 'A class template makes a family of types',
      explanation: [
        'template<class T> struct Slot { T value; }; describes a struct for any type T. Slot<int> and Slot<double> are distinct, complete types, each made by substituting its argument for T. Brace initialization works as for any aggregate struct.',
      ],
      example: {
        language: 'cpp',
        code: `#include <iostream>
template<class T> struct Slot {
  T value;
};
int main() {
  Slot<int> count{7};
  Slot<double> weight{2.5};
  std::cout << count.value + 1 << " " << weight.value * 2 << "\\n";
}`,
        output: '8 5',
        explanation:
          'count.value is an int and weight.value a double; each member has the type chosen in the angle brackets.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `#include <iostream>
template<class T> struct Pair {
  T first;
  T second;
};
int main() {
  Pair<int> p{3, 4};
  Pair<double> q{0.5, 1.5};
  std::cout << p.first + p.second << " " << q.first + q.second << "\\n";
}`,
          ['7 2', '7 1', '7 2.0', '34 0.51.5'],
          0,
          'Pair<int> holds two ints and Pair<double> two doubles; 0.5 + 1.5 is 2, which prints as 2.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <iostream>
template<class T> struct Slot {
  T value;
};
int main() {
  Slot<int> a{9};
  Slot<double> b{9};
  std::cout << a.value / 2 << " " << b.value / 2 << "\\n";
}`,
          ['4.5 4.5', '4 4', '4 4.5', '5 4.5'],
          2,
          'a.value is the int 9, so integer division gives 4. b.value is the double 9.0, so the result is 4.5.',
        ),
        choose(
          'How are Slot<int> and Slot<double> related?',
          [
            'They are one type with a run-time flag',
            'Slot<double> is derived from Slot<int>',
            'Slot<int> converts automatically to Slot<double>',
            'They are two distinct types generated from one template',
          ],
          3,
          'Each template argument produces a separate class type.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <iostream>
template<class T> struct Slot {
  T value;
};
int main() {
  Slot<double> s{3};
  std::cout << s.value / 2 << "\\n";
}`,
          ['1', '1.5', '2', '0'],
          1,
          'The member is a double, so the int 3 is stored as 3.0 and dividing by 2 gives 1.5.',
        ),
      ],
    },
    {
      title: 'Member functions use T too',
      explanation: [
        'Member functions of a class template can use T. In template<class T> struct Range { T low; T high; T width() { return high - low; } };, width returns an int for Range<int> and a double for Range<double>.',
      ],
      example: {
        language: 'cpp',
        code: `#include <iostream>
template<class T> struct Range {
  T low;
  T high;
  T width() { return high - low; }
};
int main() {
  Range<int> days{3, 10};
  Range<double> span{0.5, 2.0};
  std::cout << days.width() << " " << span.width() << "\\n";
}`,
        output: '7 1.5',
        explanation: 'Each instantiation computes the width in its own type.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `#include <iostream>
template<class T> struct Box {
  T value;
  T doubled() { return value * 2; }
};
int main() {
  Box<int> b{21};
  std::cout << b.doubled() << "\\n";
}`,
          ['21', '42', '2', '212'],
          1,
          'doubled multiplies the member by 2 in the instantiated type.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <iostream>
template<class T> struct Scale {
  T factor;
  T apply(T x) { return x * factor; }
};
int main() {
  Scale<int> s{3};
  Scale<double> d{0.5};
  std::cout << s.apply(4) << " " << d.apply(3) << "\\n";
}`,
          ['12 1', '7 3.5', '12 1.5', '12 3'],
          2,
          'Scale<double>::apply takes a double, so 3 becomes 3.0 and the result is 1.5.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <iostream>
template<class T> struct Range {
  T low;
  T high;
  T width() { return high - low; }
};
int main() {
  Range<int> a{1, 4};
  Range<double> b{1, 4};
  std::cout << a.width() / 2 << " " << b.width() / 2 << "\\n";
}`,
          ['1.5 1.5', '1 1', '2 1.5', '1 1.5'],
          3,
          'Both widths are 3, but in Range<int> it is an int, so dividing by 2 gives 1.',
        ),
        choose(
          'In `template<class T> struct Box { T value; T get() { return value; } };`, what is the return type of get() for Box<double>?',
          ['double', 'int', 'T, decided at run time', 'auto'],
          0,
          'T is replaced by double throughout the instantiation, including member function signatures.',
        ),
      ],
    },
    {
      title: 'Each object keeps its own state',
      explanation: [
        'Every object of a class template type has its own members. Two Counter<int> objects count independently, and a copy is a separate object from then on. Keep per-object state in members, not in a variable shared by every object.',
      ],
      example: {
        language: 'cpp',
        code: `#include <iostream>
template<class T> struct Counter {
  T count;
  void add(T amount) { count += amount; }
};
int main() {
  Counter<int> a{0};
  Counter<int> b{10};
  a.add(2);
  b.add(2);
  a.add(5);
  std::cout << a.count << " " << b.count << "\\n";
}`,
        output: '7 12',
        explanation:
          'a and b each have their own count member, so their updates do not mix.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `#include <iostream>
template<class T> struct Counter {
  T count;
  void add(T amount) { count += amount; }
};
int main() {
  Counter<double> c{0.5};
  Counter<int> d{1};
  c.add(0.25);
  c.add(0.25);
  d.add(2);
  std::cout << c.count << " " << d.count << "\\n";
}`,
          ['1 3', '0.75 3', '1 2', '1.0 3'],
          0,
          'c adds two quarters to 0.5, reaching 1, which prints as 1. d goes from 1 to 3.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <iostream>
template<class T> struct Counter {
  T count;
  void add(T amount) { count += amount; }
};
int main() {
  Counter<int> a{1};
  Counter<int> b = a;
  b.add(4);
  std::cout << a.count << " " << b.count << "\\n";
}`,
          ['5 5', '1 1', '1 5', '5 1'],
          2,
          'b is a copy, so it has its own count; changing it leaves a at 1.',
        ),
        choose(
          'A design stores every Counter<int>’s count in one global int. What goes wrong?',
          [
            'Globals cannot be used inside templates',
            'All counters share one value, so updating one changes what every counter reports',
            'Each counter gets its own copy of the global',
            'Counter<int> and Counter<double> stop compiling',
          ],
          1,
          'Per-object state must live in members; a shared variable makes distinct objects indistinguishable.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <iostream>
template<class T> struct Counter {
  T count;
  void add(T amount) { count += amount; }
};
int main() {
  Counter<int> whole{0};
  Counter<double> part{0};
  whole.add(3);
  part.add(1.5);
  whole.add(1);
  std::cout << whole.count << " " << part.count << "\\n";
}`,
          ['4 1.5', '4 1', '3 1.5', '4.5 1.5'],
          0,
          'Each object accumulates only its own additions, in its own type.',
        ),
      ],
    },
  ],
  'cpp-templates': [
    {
      title: 'A forwarding reference accepts both categories',
      explanation: [
        'In template<class T> int relay(T&& value), the parameter T&& is a forwarding reference. It binds to an lvalue, with T deduced as int&, and to an rvalue, with T deduced as plain int.',
        'Inside the function, value has a name, so the expression value is always an lvalue. Passing it on unchanged selects the lvalue overload even when the caller passed a temporary.',
      ],
      example: {
        language: 'cpp',
        code: `#include <iostream>
int category(int&) { return 1; }
int category(int&&) { return 2; }
template<class T> int relay(T&& value) { return category(value); }
int main() {
  int x = 4;
  std::cout << relay(x) << " " << relay(5) << "\\n";
}`,
        output: '1 1',
        explanation:
          'relay accepts both x and the temporary 5, but inside relay the named parameter is an lvalue, so category(int&) runs both times.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `#include <iostream>
int category(int&) { return 1; }
int category(int&&) { return 2; }
template<class T> int relay(T&& value) { return category(value); }
int main() {
  int x = 4;
  std::cout << category(x) << " " << category(5) << " " << relay(5) << "\\n";
}`,
          ['1 2 2', '1 1 1', '2 2 1', '1 2 1'],
          3,
          'Called directly, the temporary 5 selects int&&. Through relay it arrives as a named parameter, an lvalue.',
        ),
        choose(
          'In `template<class T> void f(T&& v)`, what is T when f is called with an int variable x?',
          ['int', 'int&', 'int&&', 'const int'],
          1,
          'For an lvalue argument, a forwarding reference deduces T as an lvalue reference type.',
        ),
        choose(
          'Inside `template<class T> int relay(T&& value)`, why does category(value) pick the int& overload even for relay(5)?',
          [
            '5 is converted to an lvalue before the call',
            'T&& always means an lvalue reference',
            'value has a name, so the expression value is an lvalue',
            'Overloads taking int&& are never selected from templates',
          ],
          2,
          'Value category belongs to expressions, and a named variable is an lvalue whatever its declared type.',
        ),
      ],
    },
    {
      title: 'std::forward<T> restores the caller’s category',
      explanation: [
        'std::forward<T>(value) (from <utility>) casts value back to the category the caller supplied: an lvalue stays an lvalue, and an rvalue becomes an rvalue again. It can do this because T records the category, int& for lvalues and plain int for rvalues.',
        'Always forward with the deduced template parameter, std::forward<T>, not a hand-written type.',
      ],
      example: {
        language: 'cpp',
        code: `#include <iostream>
#include <utility>
int category(int&) { return 1; }
int category(int&&) { return 2; }
template<class T> int dispatch(T&& value) { return category(std::forward<T>(value)); }
int main() {
  int x = 4;
  std::cout << dispatch(x) << " " << dispatch(5) << "\\n";
}`,
        output: '1 2',
        explanation:
          'For x, T is int& and forward yields an lvalue. For 5, T is int and forward yields an rvalue.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `#include <iostream>
#include <utility>
int category(int&) { return 1; }
int category(int&&) { return 2; }
template<class T> int dispatch(T&& value) { return category(std::forward<T>(value)); }
int main() {
  int a = 1;
  std::cout << dispatch(a) << " " << dispatch(a + 1) << "\\n";
}`,
          ['1 1', '2 2', '1 2', '2 1'],
          2,
          'a is an lvalue, but a + 1 produces a temporary, an rvalue, and forward preserves each.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <iostream>
#include <utility>
int category(int&) { return 1; }
int category(int&&) { return 2; }
template<class T> int dispatch(T&& value) { return category(std::forward<T>(value)); }
int main() {
  int a = 1;
  std::cout << dispatch(std::move(a)) << " " << dispatch(a) << "\\n";
}`,
          ['2 1', '2 2', '1 1', '1 2'],
          0,
          'std::move(a) is an rvalue expression for that call only; naming a again later gives an lvalue.',
        ),
        choose(
          'Which body passes value on with the category the caller used?',
          [
            'return category(value);',
            'return category(std::move(value));',
            'return category(static_cast<int&>(value));',
            'return category(std::forward<T>(value));',
          ],
          3,
          'Only std::forward<T> uses the deduced T to choose between lvalue and rvalue.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <iostream>
#include <utility>
int category(int&) { return 1; }
int category(int&&) { return 2; }
template<class T> int dispatch(T&& value) { return category(std::forward<T>(value)); }
int main() {
  int stored = 3;
  int total = dispatch(stored) + dispatch(7) + dispatch(stored);
  std::cout << total << "\\n";
}`,
          ['4', '5', '6', '3'],
          0,
          'The two calls with stored return 1 each and the temporary 7 returns 2.',
        ),
      ],
    },
    {
      title: 'Forward arguments instead of moving them',
      explanation: [
        'Replacing std::forward<T> with std::move turns every argument into an rvalue, including the caller’s named variables. A move-aware receiver may then take over an object the caller still intends to use.',
        'std::move is for an object you own and are finished with. std::forward<T> is for passing on an argument received through T&&.',
      ],
      example: {
        language: 'cpp',
        code: `#include <iostream>
#include <utility>
int category(int&) { return 1; }
int category(int&&) { return 2; }
template<class T> int moving(T&& value) { return category(std::move(value)); }
template<class T> int forwarding(T&& value) { return category(std::forward<T>(value)); }
int main() {
  int x = 4;
  std::cout << moving(x) << " " << forwarding(x) << "\\n";
}`,
        output: '2 1',
        explanation:
          'moving casts the caller’s lvalue x to an rvalue; forwarding keeps it an lvalue.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `#include <iostream>
#include <utility>
int category(int&) { return 1; }
int category(int&&) { return 2; }
template<class T> int moving(T&& value) { return category(std::move(value)); }
template<class T> int forwarding(T&& value) { return category(std::forward<T>(value)); }
int main() {
  int x = 4;
  std::cout << moving(x) << " " << moving(5) << " " << forwarding(5) << "\\n";
}`,
          ['1 2 2', '1 2 1', '2 2 2', '2 2 1'],
          2,
          'moving makes everything an rvalue, and forwarding keeps the temporary 5 an rvalue.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <iostream>
#include <utility>
void store(const int&) { std::cout << "copy "; }
void store(int&&) { std::cout << "move "; }
template<class T> void relay(T&& value) { store(std::forward<T>(value)); }
int main() {
  int a = 1;
  relay(a);
  relay(2);
  relay(std::move(a));
  std::cout << "\\n";
}`,
          [
            'copy move copy',
            'move move move',
            'copy copy move',
            'copy move move',
          ],
          3,
          'a is forwarded as an lvalue and copied; the temporary and std::move(a) arrive as rvalues and select the moving overload.',
        ),
        choose(
          'A wrapper applies std::move to its forwarding-reference parameter before passing it to a function that moves from rvalues. What can happen when a caller passes a named object it keeps using?',
          [
            'Nothing; std::move affects only temporaries',
            'The program fails to compile',
            'The object is copied twice',
            'The caller’s object may be moved from and left in an unspecified state',
          ],
          3,
          'std::move unconditionally produces an rvalue, so the receiver is allowed to take the caller’s resources.',
        ),
        choose(
          'When is std::move the right tool rather than std::forward<T>?',
          [
            'When the code owns a named object and is finished with it',
            'When passing on a T&& parameter in a template',
            'Whenever the argument might be an lvalue',
            'Never; std::forward replaces std::move',
          ],
          0,
          'move expresses "I am done with this object"; forward expresses "pass this on as the caller gave it".',
        ),
      ],
    },
  ],
};
