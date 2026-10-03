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
            'operator[] throws when the key is absent, so it needs a try block',
            'operator[] may insert, so a const map does not offer it',
            'find sorts the entries first, so it is faster than operator[]',
            'find is the only lookup that accepts a const key argument',
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
  int position = 0;
  for (int id : arrivals) {
    auto result = first_seen.emplace(id, position);
    if (result.second) ++inserted;
    ++position;
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
            '2, because the hash table keeps keys in ascending order',
            '9, because the first key inserted always comes first',
            '5, because hashing places the middle key at the front',
            'Whichever key the hash table places first; do not rely on it',
          ],
          3,
          'unordered_map promises neither sorted nor insertion order. Its first element depends on hashing and bucket layout.',
        ),
        choose(
          'Which way of printing counts from an unordered_map gives the same output on every standard library?',
          [
            'Print entries from begin() to end(), which follows key order',
            'Print the count of each key from a vector of queries, in order',
            'Print begin()->first first, since it is the most common key',
            'Print entries in reverse, from the last bucket to the first',
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
            'An unordered_map cannot be iterated with a range-for loop',
            'The input order is fixed, so ties resolve the same way everywhere',
            'Iterating an unordered_map while reading counts erases them',
            'counts[vote] only compiles inside a loop over the vector',
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
            'The map keeps keys sorted, so the lowest price is at begin()',
            'The map caches the most recently inserted price at begin()',
            'Reading begin() scans every entry to find the minimum price',
            'The map sorts its entries only at the moment begin() is called',
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
            'The total number of login events',
            'The number of distinct users',
            'The number of repeated logins only',
            'The largest user ID that logged in',
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
            'Each check becomes a fast ordered lookup instead of a full scan',
            'A set check also removes the matched ID from the allowed list',
            'An int cannot be compared directly with vector elements',
            'A set keeps the IDs in the order they were originally listed',
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
          `#include <deque>
#include <iostream>
int main() {
  std::deque<int> d{2, 3};
  d.push_front(1);
  d.push_back(4);
  std::cout << d[0] << " " << d[1] << " " << d[2] << " " << d[3];
  std::cout << "\\n";
}`,
          ['2 3 1 4', '1 2 3 4', '4 3 2 1', '2 3 4 1'],
          1,
          'Indexing runs from the current front, which is the 1 added by push_front.',
        ),
        choose(
          'Why is `int* p = &d[0]; std::cout << p[3];` wrong for a std::deque<int> d with five elements?',
          [
            'Taking the address of a deque element is not allowed',
            'Elements may sit in separate blocks, so p[3] need not be d[3]',
            'p[3] counts from the back of the deque, not the front',
            'Deque elements are const, so reading through p is an error',
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
        code: `#include <deque>
#include <iostream>
#include <vector>
int main() {
  std::vector<int> values{5, 1, 8, 3};
  std::deque<int> d;
  for (int value : values) {
    if (value < 4) d.push_front(value);
    else d.push_back(value);
  }
  for (int value : d) std::cout << value << " ";
  std::cout << "\\n";
}`,
        output: '3 1 5 8',
        explanation:
          'Small values go to the front, so the later 3 ends up ahead of the earlier 1. Large values are appended in arrival order.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `#include <deque>
#include <iostream>
#include <vector>
int main() {
  std::vector<int> values{2, 7, 1, 9};
  std::deque<int> d;
  for (int value : values) {
    if (value < 5) d.push_front(value);
    else d.push_back(value);
  }
  for (int value : d) std::cout << value << " ";
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
            'A deque inserts cheaply at both ends; a vector shifts everything to insert at the front',
            'A deque keeps its elements sorted, so history and events stay in time order',
            'A vector cannot grow after construction, so new events would not fit',
            'A deque stores everything contiguously, so it indexes faster than a vector',
          ],
          0,
          'Front insertion is the deque’s strength. A vector’s push at the front costs time proportional to its size.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <deque>
#include <iostream>
#include <vector>
int main() {
  std::vector<int> values{1, 2, 3};
  std::deque<int> d;
  for (int value : values) d.push_front(value);
  for (int value : d) std::cout << value << " ";
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
        'Calling front, back, pop_front or pop_back on an empty deque is undefined behavior; there is no exception to catch. Check empty() first and decide what an empty deque should produce. Putting the check and the pop together in one helper function makes the rule hard to forget.',
        'Each pop shrinks size() by one, so after as many pops as there were elements, empty() is true.',
      ],
      example: {
        language: 'cpp',
        code: `#include <deque>
#include <iostream>
int take(std::deque<int>& jobs) {
  if (jobs.empty()) return -1;
  int job = jobs.front();
  jobs.pop_front();
  return job;
}
int main() {
  std::deque<int> jobs{4, 2};
  std::cout << take(jobs) << " ";
  std::cout << take(jobs) << " ";
  std::cout << take(jobs) << "\\n";
}`,
        output: '4 2 -1',
        explanation:
          'The first two calls take the two jobs. The third finds the deque empty and returns -1 instead of popping.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `#include <deque>
#include <iostream>
int main() {
  std::deque<int> d{1, 2, 3};
  d.pop_front();
  d.pop_back();
  std::cout << d.size() << " " << d.empty() << " ";
  d.pop_front();
  std::cout << d.size() << " " << d.empty() << "\\n";
}`,
          ['1 0 0 1', '2 0 1 0', '1 1 0 0', '1 0 0 0'],
          0,
          'Two pops leave one element; the third pop empties the deque, so empty() becomes true.',
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
        predictOutput(
          'What does this program print?',
          `#include <deque>
#include <iostream>
int take_last(std::deque<int>& d) {
  if (d.empty()) return 0;
  int value = d.back();
  d.pop_back();
  return value;
}
int main() {
  std::deque<int> d{3, 4};
  int total = take_last(d);
  total += take_last(d);
  total += take_last(d);
  std::cout << total << "\\n";
}`,
          ['8', '4', '7', '3'],
          2,
          'The calls take 4, then 3, then find the deque empty and add the fallback 0.',
        ),
        choose(
          'What happens if pop_front is called on an empty std::deque?',
          [
            'Nothing; the call is ignored when the deque is empty',
            'It throws std::out_of_range, which the caller can catch',
            'Undefined behavior; the program must check empty() first',
            'It returns -1 to signal that nothing was removed',
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
int next_turn(std::deque<int>& turns) {
  int player = turns.front();
  turns.pop_front();
  turns.push_back(player);
  return player;
}
int main() {
  std::deque<int> turns{1, 2, 3};
  std::cout << next_turn(turns) << " ";
  std::cout << next_turn(turns) << " ";
  std::cout << next_turn(turns) << " ";
  std::cout << next_turn(turns) << "\\n";
}`,
        output: '1 2 3 1',
        explanation:
          'Each player moves from the front to the back after their turn, so play cycles back to 1 on the fourth call. The deque never becomes empty, because every popped player is pushed back.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `#include <deque>
#include <iostream>
int next_turn(std::deque<int>& turns) {
  int player = turns.front();
  turns.pop_front();
  turns.push_back(player);
  return player;
}
int main() {
  std::deque<int> turns{7, 8};
  std::cout << next_turn(turns) << " ";
  std::cout << next_turn(turns) << " ";
  std::cout << next_turn(turns) << "\\n";
}`,
          ['7 8 7', '7 7 7', '7 8 8', '8 7 8'],
          0,
          'The two players alternate: 7, then 8, then 7 again.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <deque>
#include <iostream>
int next_turn(std::deque<int>& turns) {
  int player = turns.front();
  turns.pop_front();
  turns.push_back(player);
  return player;
}
int main() {
  std::deque<int> turns{1, 2, 3};
  next_turn(turns);
  next_turn(turns);
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
void work_once(std::deque<int>& work) {
  if (work.empty()) return;
  int left = work.front() - 1;
  work.pop_front();
  if (left > 0) work.push_back(left);
}
int main() {
  std::deque<int> work{2, 1};
  work_once(work);
  std::cout << work.size() << " ";
  work_once(work);
  work_once(work);
  std::cout << work.size() << "\\n";
}`,
          ['1 0', '2 0', '2 1', '3 0'],
          1,
          'The 2 runs once and returns to the back as 1, so two jobs wait. The next two calls finish both 1s.',
        ),
        choose(
          'In a rotation step, why must the code read front() before calling pop_front()?',
          [
            'pop_front returns void and destroys the element, so its value is gone',
            'front() becomes unavailable after any push_back to the same deque',
            'pop_front moves the element to the back, so front() is still valid',
            'Reading front afterwards returns the same element, so order is irrelevant',
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
          ['emplace', 'operator[]', 'size', 'pop'],
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
  q.pop();
  std::cout << q.front() << " " << q.size() << "\\n";
}`,
          ['9 2', '3 2', '7 3', '3 3'],
          1,
          'Values leave in the order they were pushed, so removing one exposes 3, with two elements left.',
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
  std::cout << orders.front() << " ";
  orders.pop();
  std::cout << orders.front() << " ";
  orders.pop();
  std::cout << orders.front() << "\\n";
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
int serve(std::queue<int>& q) {
  if (q.empty()) return -1;
  int item = q.front();
  q.pop();
  return item;
}
int main() {
  std::queue<int> q;
  q.push(2);
  q.push(8);
  q.push(5);
  int a = serve(q);
  int b = serve(q);
  int c = serve(q);
  std::cout << a << " " << b << " " << c << "\\n";
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
void step(std::queue<int>& work) {
  if (work.empty()) {
    std::cout << "done ";
    return;
  }
  int item = work.front();
  work.pop();
  std::cout << item << " ";
  if (item > 1) work.push(item - 1);
}
int main() {
  std::queue<int> work;
  work.push(3);
  work.push(1);
  step(work);
  step(work);
  step(work);
  step(work);
  step(work);
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
void step(std::queue<int>& work) {
  if (work.empty()) {
    std::cout << "done ";
    return;
  }
  int item = work.front();
  work.pop();
  std::cout << item << " ";
  if (item > 1) work.push(item - 1);
}
int main() {
  std::queue<int> work;
  work.push(2);
  work.push(2);
  step(work);
  step(work);
  step(work);
  step(work);
  step(work);
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
void step(std::queue<int>& work) {
  if (work.empty()) {
    std::cout << "done ";
    return;
  }
  int item = work.front();
  work.pop();
  std::cout << item << " ";
  if (item > 1) work.push(item - 1);
}
int main() {
  std::queue<int> work;
  work.push(1);
  work.push(3);
  step(work);
  step(work);
  step(work);
  step(work);
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
int process(std::queue<int>& work) {
  if (work.empty()) return 0;
  int item = work.front();
  work.pop();
  if (item > 1) {
    work.push(item - 1);
    work.push(item - 1);
  }
  return 1;
}
int main() {
  std::queue<int> work;
  work.push(2);
  int served = process(work);
  served += process(work);
  served += process(work);
  served += process(work);
  served += process(work);
  std::cout << served << "\\n";
}`,
          ['5', '2', '3', '4'],
          2,
          'The 2 is served and adds two 1s; those two are served and add nothing. The remaining calls find the queue empty and return 0.',
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
            'It sorts ascending instead of descending, reversing the result',
            'It is slower than > but always produces the same order',
            'It says equal elements come before each other, breaking strict ordering',
            'It removes equal elements, so duplicates disappear from the result',
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
            'The index of the value, or -1 when it is absent',
            'An iterator to the value, or end() when it is absent',
            'The number of times the value occurs in the range',
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
            'It returns true, because 7 is present somewhere in the vector',
            'It returns false, because binary_search rejects unsorted input',
            'Its result cannot be trusted, because the input is not sorted',
            'It sorts the vector first, then searches the sorted copy',
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
            'std::binary_search(v.begin(), v.end(), x, std::less<int>())',
            'std::binary_search(v.begin(), v.end(), x, std::greater<int>())',
            'std::binary_search(v.end(), v.begin(), x, std::greater<int>())',
            'std::binary_search(v.begin(), v.end(), -x, std::less<int>())',
          ],
          1,
          'The search must use the ordering the range is sorted by; the default < assumes ascending order.',
        ),
        choose(
          'Why does binary_search not fall back to checking every element when the input is unsorted?',
          [
            'It compares only about log2(n) elements and relies on order to skip the rest',
            'It checks every element, but only after first reversing the range',
            'It sorts a copy of the range first and then searches that copy',
            'It reports an error as soon as it meets an out-of-order pair',
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
            'The starting value of the total, included in the result',
            'The number of elements to add, counted from first',
            'The index of the first element to include in the sum',
            'A value that is skipped whenever an element equals it',
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
            'It receives only iterators, so it cannot call the vector’s erase',
            'Shrinking would invalidate the iterator that remove returns',
            'It shrinks the vector only when it is declared const',
            'It does shrink the vector, but only when nothing matched',
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
          'Erase from the logical end to the real end. Erasing from v.begin() to that point removes the kept values instead, and erase with one iterator removes only one element.',
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
            'Nothing happens, because no element matches x',
            'It erases the last element of the vector',
            'It throws std::out_of_range for the missing value',
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
            'The int that the lambda returns for x',
            'A pointer to the lambda’s parameter x',
            'A copy of a variable named x from main',
            'A function object that f(3) can call',
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
            'total must be captured with auto to be changed',
            'Lambdas cannot contain more than one statement',
            'total is a parameter of the lambda, not a capture',
            'A by-value capture is read-only unless the lambda is mutable',
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
            'Reference captures are mutable copies, so nothing is const',
            'The reference version changes the caller’s variable, not a copy',
            '++ is defined only for references, never for captured copies',
            'The value version needs a return statement to compile',
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
            'Lambdas cannot be returned from functions by value',
            'local must be declared const before it can be captured',
            'local is destroyed when make returns, so the lambda dangles',
            'The lambda copies local twice, so the result is doubled',
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
            'The element itself, which count_if then adds',
            'The running count so far, increased by one',
            'The index of the element within the range',
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
            'Both return the number of matching elements',
            'count_if returns the first match; find_if returns all matches',
            'Both return iterators to the first matching element',
            'count_if returns a count; find_if returns the first match or end()',
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
            'A reference to max that is read on every call',
            'A parameter named limit that callers must pass',
            'A closure member named limit, set once from max * 2',
            'A copy of max that updates whenever max changes',
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
            'Capturing by value would copy the unique_ptr, which is not allowed',
            'Lambdas cannot dereference pointers captured from main',
            'owner must be captured as [&owner] because it owns memory',
            'unique_ptr cannot be used inside any lambda body',
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
          'Two closures each own a Probe. What does this program print?',
          `#include <iostream>
#include <memory>
struct Probe {
  int& released;
  explicit Probe(int& count) : released(count) {}
  ~Probe() { ++released; }
};
int main() {
  int released = 0;
  auto first = [held = std::make_unique<Probe>(released)] { return held->released; };
  {
    auto second = [held = std::make_unique<Probe>(released)] { return held->released; };
    std::cout << second() << " ";
  }
  std::cout << released << " " << first() << "\\n";
}`,
          ['0 2 2', '0 1 1', '0 0 0', '1 1 1'],
          1,
          'Only second is destroyed at the end of the block, releasing its Probe. first still owns its Probe, which reads the shared count, 1.',
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
            'Each call instantiates its own version, and int division truncates',
            'Templates round their results to the nearest whole number',
            'The second call casts the result to double after dividing',
            'Templates compute in double and convert back for int callers',
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
            'Templates cannot take literal arguments such as 2.5',
            'T is deduced as int and as double, and the two conflict',
            'The sum of an int and a double would overflow T',
            'A double cannot be added to an int inside a template',
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
        'A struct can also contain member functions: functions declared inside it that use its members directly and are called as object.name(). In a class template they can use T. In template<class T> struct Range { T low; T high; T width() { return high - low; } };, width returns an int for Range<int> and a double for Range<double>.',
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
            'Globals cannot be used inside member functions of templates',
            'All counters share one value, so updating one changes every counter',
            'Each counter gets its own private copy of the global automatically',
            'Counter<int> and Counter<double> would stop compiling',
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
            'Nothing; std::move only affects temporaries',
            'The program fails to compile at the call',
            'The object is copied twice instead of once',
            'The caller’s object may be moved from',
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
  'cpp-integral-concept': [
    {
      title: 'std::integral accepts only integer types',
      explanation: [
        'A concept is a named compile-time test on a type. std::integral<T> (from <concepts>) is true for the built-in integer types, such as int, long long, unsigned, char and bool, and false for floating-point types such as double.',
        'Writing template<std::integral T> constrains a template: it accepts only argument types that satisfy the concept. The concept itself is a compile-time bool, so it can also be printed.',
      ],
      example: {
        language: 'cpp',
        code: `#include <concepts>
#include <iostream>
template<std::integral T> T remainder(T value) { return value % 2; }
int main() {
  std::cout << remainder(7) << " " << remainder(10LL) << "\\n";
  std::cout << std::integral<int> << " " << std::integral<double> << "\\n";
}`,
        output: '1 0\n1 0',
        explanation:
          'int and long long satisfy std::integral, so both calls compile; % gives the remainder after integer division. The concept is true for int and false for double.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `#include <concepts>
#include <iostream>
int main() {
  std::cout << std::integral<long long> << " " << std::integral<double> << "\\n";
}`,
          ['1 0', '1 1', '0 0', '0 1'],
          0,
          'long long is an integer type; double is a floating-point type.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <concepts>
#include <iostream>
int main() {
  std::cout << std::integral<bool> << " " << std::integral<char> << "\\n";
}`,
          ['0 0', '0 1', '1 0', '1 1'],
          3,
          'bool and char are both integral types in C++, so both tests are true.',
        ),
        choose(
          'Which call is rejected by `template<std::integral T> T half(T value)`?',
          ['half(9)', 'half(9LL)', 'half(9u)', 'half(9.0)'],
          3,
          '9.0 is a double, which does not satisfy std::integral; the other arguments are integer types.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <concepts>
#include <iostream>
template<std::integral T> T half(T value) { return value / 2; }
int main() {
  std::cout << half(9) << " " << half(-9) << "\\n";
}`,
          ['4.5 -4.5', '4 -4', '4 -5', '5 -5'],
          1,
          'T is int in both calls, so the division truncates toward zero.',
        ),
      ],
    },
    {
      title: 'A constraint states what the body needs',
      explanation: [
        'A constraint is checked at the call, before the body is instantiated. A call with an unsuitable type is rejected with a message naming the failed concept, instead of an error deep inside the template.',
        'Match the constraint to what the body really needs. % works only on integers, so a remainder function should require std::integral.',
      ],
      example: {
        language: 'cpp',
        code: `#include <concepts>
#include <iostream>
template<std::integral T> T tens(T value) { return value / 10; }
int main() {
  std::cout << tens(507) << " " << tens(4000000000LL) << " " << tens(99u) << "\\n";
}`,
        output: '50 400000000 9',
        explanation:
          'int, long long and unsigned all satisfy std::integral, and each call divides in its own type.',
      },
      questions: [
        choose(
          'remainder requires std::integral. What does the compiler report for remainder(7.5)?',
          [
            'Nothing; it returns 1.5',
            'The call does not satisfy the std::integral constraint',
            'Nothing; it truncates 7.5 to 7 and returns 1',
            'A run-time error when the call executes',
          ],
          1,
          'Constraints are compile-time checks on the argument type; no conversion to an integer type is attempted.',
        ),
        choose(
          'A function computes value % divisor. Which template head states its real requirement?',
          [
            'template<class T>',
            'template<std::floating_point T>',
            'template<std::integral T>',
            'template<class T> requires true',
          ],
          2,
          '% needs integer operands, which std::integral guarantees. The unconstrained forms accept double and then fail inside the body.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <concepts>
#include <iostream>
template<std::integral T> T tens(T value) { return value / 10; }
int main() {
  std::cout << tens(507) << " " << tens(-38) << "\\n";
}`,
          ['50 -3', '50.7 -3.8', '51 -4', '50 -4'],
          0,
          'Integer division truncates toward zero for both signs.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <concepts>
#include <iostream>
template<std::integral T> int next(T value) { return static_cast<int>(value) + 1; }
int main() {
  std::cout << next(true) << " " << next(41) << "\\n";
}`,
          ['1 42', '0 42', '2 42', 'true 42'],
          2,
          'bool satisfies std::integral, and true converts to the int 1, so next(true) is 2.',
        ),
      ],
    },
  ],
  'cpp-requires-expression': [
    {
      title: 'A requires expression tests whether code compiles',
      explanation: [
        'A requires expression lists expressions that must be valid for a type: requires(const T& value) { value.size(); }. The expressions are only checked, never run. Naming it as a concept gives the test a name: template<class T> concept HasSize = requires(const T& value) { value.size(); };',
        'HasSize<std::vector<int>> is true because a vector has size(); HasSize<int> is false. Every listed requirement must be valid for the concept to hold.',
      ],
      example: {
        language: 'cpp',
        code: `#include <iostream>
#include <vector>
template<class T> concept HasSize = requires(const T& value) { value.size(); };
int main() {
  std::cout << HasSize<std::vector<int>> << " " << HasSize<int> << "\\n";
}`,
        output: '1 0',
        explanation:
          'vector<int> has a size() member and int does not. No size() is actually called.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `#include <iostream>
#include <vector>
template<class T> concept HasFront = requires(const T& value) { value.front(); };
int main() {
  std::cout << HasFront<std::vector<int>> << " " << HasFront<double> << "\\n";
}`,
          ['1 1', '0 0', '0 1', '1 0'],
          3,
          'A vector has front(); a double has no members at all.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <iostream>
#include <vector>
template<class T> concept Addable = requires(T a, T b) { a + b; };
int main() {
  std::cout << Addable<int> << " " << Addable<std::vector<int>> << "\\n";
}`,
          ['1 0', '1 1', '0 1', '0 0'],
          0,
          'Two ints can be added; std::vector defines no + operator.',
        ),
        choose(
          'What does `requires(const T& v) { v.size(); }` do with v.size()?',
          [
            'Calls it once to check that it returns a positive value',
            'Calls it for every element',
            'Checks only that the expression would compile for T',
            'Stores its result for later use',
          ],
          2,
          'A requires expression is unevaluated; it asks only whether the code is well formed.',
        ),
        choose(
          'A concept requires `{ v.size(); v[0]; }`. A type has size() but no operator[]. Does it satisfy the concept?',
          [
            'Yes; one valid requirement is enough',
            'No; every listed requirement must be valid',
            'Yes, but only if size() returns 0',
            'It depends on the values stored',
          ],
          1,
          'The requirements are combined with "and"; one invalid expression makes the concept false.',
        ),
      ],
    },
    {
      title: 'Constrain a template with your own concept',
      explanation: [
        'A named concept constrains a template exactly like std::integral: template<HasSize T> int count(const T& items). The body may then use items.size(), and a type without size() is rejected at the call.',
        'State the operations the body really uses. A constraint on some unrelated property admits types the body cannot handle and rejects types it could.',
      ],
      example: {
        language: 'cpp',
        code: `#include <iostream>
#include <vector>
template<class T> concept HasSize = requires(const T& value) { value.size(); };
template<HasSize T> int count(const T& items) { return static_cast<int>(items.size()); }
int main() {
  std::vector<int> a{4, 8, 15};
  std::vector<double> b;
  std::cout << count(a) << " " << count(b) << "\\n";
}`,
        output: '3 0',
        explanation:
          'Both vector types satisfy HasSize, so count accepts them and returns their sizes.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `#include <iostream>
#include <vector>
template<class T> concept HasSize = requires(const T& value) { value.size(); };
template<HasSize T> int count(const T& items) { return static_cast<int>(items.size()); }
int main() {
  std::vector<int> a{1, 2};
  std::vector<double> b{0.5, 1.5, 2.5};
  std::cout << count(a) << " " << count(b) << "\\n";
}`,
          ['2 3', '3 2', '2 4.5', '1 2'],
          0,
          'count returns the number of elements of each vector, whatever their element type.',
        ),
        choose(
          '`template<HasSize T> int count(const T& c)`, where HasSize requires value.size(). What happens with count(42)?',
          [
            'It returns 0, because int has no elements',
            'It returns 1, because an int is one value',
            'It returns 42, the value of the argument',
            'The call is rejected: int does not satisfy HasSize',
          ],
          3,
          'int has no size() member, so the constraint fails and the template is not used.',
        ),
        choose(
          'A template body calls items.size() and items[0]. Which constraint matches it?',
          [
            'template<std::integral T>, since sizes are integers',
            'A concept requiring only items + items',
            'A concept requiring items.size() and items[0]',
            'No constraint can express member operations',
          ],
          2,
          'The concept should list exactly the expressions the body uses.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <iostream>
#include <vector>
template<class T> concept Indexable = requires(const T& c) {
  c.size();
  c[0];
};
template<Indexable T> int first_or(const T& c, int fallback) {
  return c.size() > 0 ? static_cast<int>(c[0]) : fallback;
}
int main() {
  std::vector<int> full{7, 2};
  std::vector<int> empty;
  std::cout << first_or(full, -1) << " " << first_or(empty, -1) << "\\n";
}`,
          ['7 0', '7 -1', '2 -1', '-1 -1'],
          1,
          'Both vectors satisfy Indexable. The empty one takes the fallback instead of reading c[0].',
        ),
      ],
    },
  ],
  'cpp-if-constexpr': [
    {
      title: 'if constexpr picks a branch for each type',
      explanation: [
        'Type traits from <type_traits>, such as std::is_integral_v<T> and std::is_signed_v<T>, are compile-time bools that describe a type. Note that std::is_signed_v is true for floating-point types too.',
        'if constexpr (condition) evaluates its constant condition when the template is instantiated and keeps only the selected branch for that type.',
      ],
      example: {
        language: 'cpp',
        code: `#include <iostream>
#include <type_traits>
template<class T> int kind(T) {
  if constexpr (std::is_integral_v<T>) return 1;
  else return 2;
}
int main() {
  std::cout << kind(5) << " " << kind(5.0) << "\\n";
}`,
        output: '1 2',
        explanation:
          'kind<int> keeps only the first branch and kind<double> only the second; nothing is tested at run time.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `#include <iostream>
#include <type_traits>
template<class T> int sign_kind(T) {
  if constexpr (std::is_signed_v<T>) return -1;
  else return 1;
}
int main() {
  std::cout << sign_kind(3) << " " << sign_kind(3u) << "\\n";
}`,
          ['1 1', '-1 -1', '-1 1', '1 -1'],
          2,
          'int is signed and unsigned is not, whatever the values passed.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <iostream>
#include <type_traits>
int main() {
  std::cout << std::is_signed_v<double> << " " << std::is_integral_v<double> << "\\n";
}`,
          ['0 0', '1 0', '0 1', '1 1'],
          1,
          'Floating-point types can hold negative values, so they count as signed, but they are not integral.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <iostream>
#include <type_traits>
template<class T> T step(T value) {
  if constexpr (std::is_integral_v<T>) return value + 1;
  else return value + 0.5;
}
int main() {
  std::cout << step(2) << " " << step(2.0) << "\\n";
}`,
          ['3 2.5', '3 3', '2.5 2.5', '3 3.0'],
          0,
          'The int instantiation adds 1 and the double instantiation adds 0.5.',
        ),
        choose(
          'When is the condition of an if constexpr evaluated?',
          [
            'Each time the function runs, before the branch',
            'Only when the condition turns out to be true',
            'At link time, when the program is assembled',
            'At compile time, when the template is instantiated',
          ],
          3,
          'The condition must be a constant expression, and the choice is fixed per instantiation.',
        ),
      ],
    },
    {
      title: 'The discarded branch is not instantiated',
      explanation: [
        'Inside a template, the branch an if constexpr does not select is discarded for that instantiation: its code is not checked against T. A branch may therefore use an operation that only some types support, such as % (the remainder after integer division), which double does not have.',
        'An ordinary if compiles both branches for every T, so the same code with a plain if fails for double even though that branch would never run.',
      ],
      example: {
        language: 'cpp',
        code: `#include <iostream>
#include <type_traits>
template<class T> T trim(T value) {
  if constexpr (std::is_integral_v<T>) return value - value % 10;
  else return value;
}
int main() {
  std::cout << trim(347) << " " << trim(3.47) << "\\n";
}`,
        output: '340 3.47',
        explanation:
          'For int, the first branch removes the last digit. For double, that branch is discarded, so value % 10 is never compiled for double.',
      },
      questions: [
        choose(
          '`template<class T> T f(T v) { if (std::is_integral_v<T>) return v % 2; else return v; }` Why does f(2.5) fail to compile?',
          [
            'A plain if keeps both branches, and v % 2 is invalid for double',
            'is_integral_v cannot be used as the condition of an if',
            'f must return int, so the double return path is rejected',
            'The else branch needs a cast back to T before returning',
          ],
          0,
          'The condition is false for double, but a plain if still compiles the unused branch.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <iostream>
#include <type_traits>
template<class T> T trim(T value) {
  if constexpr (std::is_integral_v<T>) return value - value % 10;
  else return value;
}
int main() {
  std::cout << trim(1995) << " " << trim(19.95) << "\\n";
}`,
          ['1990 19.9', '1995 19.95', '1990 10', '1990 19.95'],
          3,
          'Only the int instantiation drops the last digit; the double passes through unchanged.',
        ),
        choose(
          '`template<class T> T f(T v) { if (std::is_integral_v<T>) return v % 2; else return v; }` fails to compile for double. Which change makes it compile for both int and double?',
          [
            'Make v a reference parameter',
            'Replace if with if constexpr',
            'Cast the result to double',
            'Add return 0; at the end',
          ],
          1,
          'if constexpr discards the % branch for double, so it is never checked for that type.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <iostream>
#include <type_traits>
template<class T> long long magnitude(T value) {
  long long widened = value;
  if constexpr (std::is_signed_v<T>) return widened < 0 ? -widened : widened;
  else return widened;
}
int main() {
  std::cout << magnitude(-7) << " " << magnitude(4000000000u) << "\\n";
}`,
          ['-7 4000000000', '7 4000000000', '7 -294967296', '7 0'],
          1,
          'The signed instantiation negates -7. The unsigned one keeps only the else branch and returns the value as is.',
        ),
      ],
    },
    {
      title: 'Widen first, then branch on signedness',
      explanation: [
        'Negating the most negative int overflows, because its positive value does not fit in int. Converting to long long first makes the negation safe.',
        'Combined with if constexpr on std::is_signed_v, the negation code exists only for signed types, and unsigned values are returned unchanged.',
      ],
      example: {
        language: 'cpp',
        code: `#include <iostream>
#include <limits>
#include <type_traits>
template<class T> long long magnitude(T value) {
  long long widened = value;
  if constexpr (std::is_signed_v<T>) return widened < 0 ? -widened : widened;
  else return widened;
}
int main() {
  std::cout << magnitude(std::numeric_limits<int>::min()) << " " << magnitude(7u) << "\\n";
}`,
        output: '2147483648 7',
        explanation:
          'The minimum int is -2147483648. Its magnitude does not fit in int but fits in long long, so widening first avoids overflow.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `#include <iostream>
#include <type_traits>
template<class T> long long magnitude(T value) {
  long long widened = value;
  if constexpr (std::is_signed_v<T>) return widened < 0 ? -widened : widened;
  else return widened;
}
int main() {
  std::cout << magnitude(-12) << " " << magnitude(12) << "\\n";
}`,
          ['-12 12', '12 -12', '12 12', '0 12'],
          2,
          'Both calls use the signed branch; only the negative value is negated.',
        ),
        choose(
          'Why does magnitude convert to long long before negating?',
          [
            'Negating the minimum int would overflow inside int',
            'long long arithmetic is faster than int arithmetic',
            'if constexpr only works with long long conditions',
            'Unsigned values cannot be returned from a template',
          ],
          0,
          'int ranges from -2147483648 to 2147483647, so -(-2147483648) needs a wider type.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <iostream>
#include <type_traits>
template<class T> T flip(T value) {
  if constexpr (std::is_signed_v<T>) return -value;
  else return value;
}
int main() {
  std::cout << flip(-3) << " " << flip(3u) << " " << flip(1.5) << "\\n";
}`,
          ['3 3 -1.5', '3 3 1.5', '-3 3 -1.5', '3 -3 -1.5'],
          0,
          'int and double are signed, so they are negated; unsigned is returned unchanged.',
        ),
      ],
    },
  ],
  'cpp-concepts': [
    {
      title: 'The more constrained template wins',
      explanation: [
        'When two templates both match a call, overload resolution prefers the more constrained one. With template<class T> int classify(T) and template<std::integral T> int classify(T), classify(4) picks the std::integral version, while classify(2.5) can use only the unconstrained one.',
      ],
      example: {
        language: 'cpp',
        code: `#include <concepts>
#include <iostream>
template<class T> int classify(T) { return 1; }
template<std::integral T> int classify(T) { return 2; }
int main() {
  std::cout << classify(4) << " " << classify(2.5) << "\\n";
}`,
        output: '2 1',
        explanation:
          'int satisfies std::integral, so the constrained overload is preferred. double satisfies only the unconstrained one.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `#include <concepts>
#include <iostream>
template<class T> int describe(T) { return 0; }
template<std::integral T> int describe(T) { return 1; }
int main() {
  std::cout << describe(7LL) << " " << describe(7.0f) << " " << describe(true) << "\\n";
}`,
          ['1 0 0', '0 0 1', '1 1 1', '1 0 1'],
          3,
          'long long and bool are integral, so they get the constrained overload; float does not.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <concepts>
#include <iostream>
template<class T> int classify(T) { return 1; }
template<std::integral T> int classify(T) { return 2; }
int main() {
  std::cout << classify(1) + classify(1.5) + classify(2) << "\\n";
}`,
          ['4', '5', '6', '3'],
          1,
          'The two int calls return 2 each and the double call returns 1.',
        ),
        choose(
          'Both `template<class T> int f(T)` and `template<std::integral T> int f(T)` are declared. Which runs for f(3)?',
          [
            'The unconstrained one, because it was declared first',
            'Neither; the call is ambiguous',
            'The std::integral one, because it is more constrained',
            'Both, one after the other',
          ],
          2,
          'Declaration order does not matter; a satisfied, more constrained template is preferred.',
        ),
        choose(
          'Two templates differ only in return type: `template<std::integral T> int g(T)` and `template<std::integral T> long g(T)`. What happens when g(1) is called?',
          [
            'The call is ambiguous; return types do not distinguish overloads',
            'The long version is chosen because it can hold larger values',
            'The int version is chosen because the argument 1 is an int',
            'The compiler picks one of the two templates at random',
          ],
          0,
          'Overload resolution looks at parameters and constraints, not at the return type.',
        ),
      ],
    },
    {
      title: 'Non-overlapping constraints split the types',
      explanation: [
        'Overloads with constraints that never overlap, such as std::integral and std::floating_point, divide the types between them: each call matches exactly one. A type that satisfies neither matches nothing, and the call does not compile unless an unconstrained overload exists.',
      ],
      example: {
        language: 'cpp',
        code: `#include <concepts>
#include <iostream>
template<std::integral T> int bucket(T) { return 1; }
template<std::floating_point T> int bucket(T) { return 2; }
int main() {
  std::cout << bucket(3) << " " << bucket(3.0) << " " << bucket('x') << "\\n";
}`,
        output: '1 2 1',
        explanation: '3 and the char x are integral; 3.0 is floating-point.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `#include <concepts>
#include <iostream>
template<std::integral T> int bucket(T) { return 1; }
template<std::floating_point T> int bucket(T) { return 2; }
int main() {
  std::cout << bucket(0.5f) << " " << bucket(10u) << " " << bucket(false) << "\\n";
}`,
          ['2 1 2', '2 1 1', '1 1 1', '2 2 1'],
          1,
          'float is floating-point; unsigned and bool are integral.',
        ),
        choose(
          'Only the std::integral and std::floating_point overloads of bucket exist. What happens for a call with a struct argument?',
          [
            'No overload matches, so the call does not compile',
            'It picks the integral overload as the default',
            'It picks the floating-point overload as a fallback',
            'It compiles and returns 0 for unknown types',
          ],
          0,
          'A struct satisfies neither concept, and there is no unconstrained fallback.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <concepts>
#include <iostream>
template<std::integral T> int bucket(T) { return 1; }
template<std::floating_point T> int bucket(T) { return 2; }
int main() {
  std::cout << bucket(1) + bucket(2.0) + bucket(3) * 10 << "\\n";
}`,
          ['13', '31', '40', '14'],
          0,
          'bucket(1) is 1, bucket(2.0) is 2, and bucket(3) * 10 is 10.',
        ),
        choose(
          "With these two overloads, what does bucket('a') return?",
          [
            '2, because characters are stored as numbers',
            'Nothing; the call does not compile',
            '0',
            '1, because char is an integral type',
          ],
          3,
          'char is one of the integer types and satisfies std::integral.',
        ),
      ],
    },
    {
      title: 'A concept built on another is more specific',
      explanation: [
        'std::signed_integral<T> is defined as std::integral<T> plus being signed, so it subsumes std::integral. With overloads constrained by std::integral and std::signed_integral, a signed type such as int picks the signed_integral overload, and unsigned or bool falls back to the plain integral one.',
        'This preference comes from how the concepts are defined, not from the order the overloads are written.',
      ],
      example: {
        language: 'cpp',
        code: `#include <concepts>
#include <iostream>
template<std::integral T> int rank(T) { return 1; }
template<std::signed_integral T> int rank(T) { return 2; }
int main() {
  std::cout << rank(-3) << " " << rank(3u) << "\\n";
}`,
        output: '2 1',
        explanation:
          'int satisfies both, and signed_integral is more specific. unsigned satisfies only std::integral.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `#include <concepts>
#include <iostream>
template<std::integral T> int rank(T) { return 1; }
template<std::signed_integral T> int rank(T) { return 2; }
int main() {
  std::cout << rank(5) << " " << rank(5u) << " " << rank(5LL) << "\\n";
}`,
          ['2 2 2', '1 1 1', '2 1 2', '2 1 1'],
          2,
          'int and long long are signed integer types; unsigned is not signed.',
        ),
        choose(
          'Why is rank(-3) not ambiguous, even though int satisfies both constraints?',
          [
            'The signed overload is written second, so it wins ties',
            'signed_integral is built on integral, so it is more constrained',
            'A negative argument always prefers the signed overload',
            'The compiler picks the first template that matches',
          ],
          1,
          'Subsumption makes signed_integral strictly more specific, so it wins whenever both match.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <concepts>
#include <iostream>
template<std::integral T> int rank(T) { return 1; }
template<std::signed_integral T> int rank(T) { return 2; }
int main() {
  std::cout << rank(true) << " " << rank(-1LL) << "\\n";
}`,
          ['2 2', '1 1', '2 1', '1 2'],
          3,
          'bool is integral but not signed, so it gets rank 1; long long is signed.',
        ),
      ],
    },
  ],
  'cpp-static-assert': [
    {
      title: 'static_assert checks a condition while compiling',
      explanation: [
        'static_assert(condition, "message") evaluates its condition during compilation. If the condition is true, nothing happens, and nothing is printed at run time. If it is false, compilation stops with the message. The message may be omitted.',
        'The fixed-width types from <cstdint>, such as std::uint32_t, have exactly the number of bits in their names, which is a typical thing to check.',
      ],
      example: {
        language: 'cpp',
        code: `#include <cstdint>
#include <iostream>
static_assert(sizeof(std::uint32_t) == 4, "uint32_t must be 4 bytes");
int main() {
  static_assert(2 + 2 == 4);
  std::cout << "running\\n";
}`,
        output: 'running',
        explanation:
          'Both conditions are true, so the program compiles; the assertions produce no output of their own.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `#include <cstdint>
#include <iostream>
static_assert(sizeof(std::uint16_t) == 2);
int main() {
  std::cout << sizeof(std::uint16_t) << "\\n";
}`,
          ['16', '2', '4', '1'],
          1,
          'sizeof counts bytes, and a 16-bit type occupies 2 bytes; the static_assert passes silently.',
        ),
        choose(
          'What happens when a static_assert condition is false?',
          [
            'The program prints the message and keeps running',
            'The program aborts when it reaches that line',
            'Compilation fails with the message',
            'The assertion is skipped in release builds',
          ],
          2,
          'The check happens in the compiler, so a false condition means there is no program to run.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <cstdint>
#include <iostream>
static_assert(sizeof(std::uint8_t) == 1);
static_assert(sizeof(std::uint64_t) == 8);
int main() {
  std::cout << sizeof(std::uint8_t) + sizeof(std::uint64_t) << "\\n";
}`,
          ['72', '16', '2', '9'],
          3,
          'The sizes are 1 and 8 bytes; 72 would be the total in bits.',
        ),
        choose(
          'A static_assert passes. What does it add to the program’s output?',
          [
            'Nothing; it has no run-time effect',
            'Its message',
            'The digit 1',
            'A line saying the check passed',
          ],
          0,
          'static_assert exists only during compilation.',
        ),
      ],
    },
    {
      title: 'The condition must be a constant expression',
      explanation: [
        'The compiler must know the condition’s value, so it must be a constant expression: literals, sizeof, and variables declared constexpr with constant initializers. A function parameter or anything computed while the program runs cannot be used, because its value does not exist yet during compilation.',
        'Check run-time values with ordinary code, such as an if.',
      ],
      example: {
        language: 'cpp',
        code: `#include <iostream>
constexpr int slots = 8;
constexpr int slot_bytes = 16;
static_assert(slots * slot_bytes <= 256, "buffer too large");
int main() {
  std::cout << slots * slot_bytes << "\\n";
}`,
        output: '128',
        explanation:
          'slots and slot_bytes are constexpr, so their product is known while compiling and can be checked.',
      },
      questions: [
        choose(
          'Which static_assert compiles inside `int pick(int index)`?',
          [
            'static_assert(index < 4);',
            'static_assert(index == index);',
            'static_assert(sizeof(int) >= sizeof(char));',
            'static_assert(pick(0) == 0);',
          ],
          2,
          'Only sizeof(int) is known during compilation. index is a run-time parameter, and pick is not constexpr.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <iostream>
constexpr int width = 6;
constexpr int height = 4;
static_assert(width * height == 24);
int main() {
  std::cout << width * height / 5 << "\\n";
}`,
          ['4.8', '24', '4', '5'],
          2,
          'The assertion passes, and 24 / 5 is integer division, giving 4.',
        ),
        choose(
          'A program reads a buffer size from a config file at startup. How should it check that the size is at most 4096?',
          [
            'static_assert(size <= 4096); right after reading it',
            'Declare size constexpr once it has been read',
            'static_assert(sizeof(size) <= 4096); at startup',
            'An ordinary run-time check, such as an if statement',
          ],
          3,
          'The size exists only at run time, so only run-time code can check it.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <cstdint>
#include <iostream>
static_assert(sizeof(std::int64_t) == 8);
int main() {
  std::cout << static_cast<int>(sizeof(std::int64_t)) * 8 << "\\n";
}`,
          ['64', '8', '512', '16'],
          0,
          'An int64_t is 8 bytes, which is 64 bits.',
        ),
      ],
    },
    {
      title: 'Guard size assumptions the standard does not promise',
      explanation: [
        'C++ fixes only some sizes: sizeof(char) is 1, and fixed-width types such as std::int32_t and std::uint64_t have exactly 32 and 64 bits. Other sizes, such as sizeof(int) or sizeof(long), vary between platforms.',
        'When code depends on such a size, a static_assert turns a silent assumption into a compile-time check that fails on a platform where it is false.',
      ],
      example: {
        language: 'cpp',
        code: `#include <cstdint>
#include <iostream>
static_assert(sizeof(std::int32_t) * 2 == sizeof(std::int64_t));
int main() {
  std::cout << sizeof(char) << " " << sizeof(std::int32_t) << "\\n";
}`,
        output: '1 4',
        explanation:
          'Both sizes are guaranteed, so the assertion holds on every platform that provides these types.',
      },
      questions: [
        choose(
          'Which size is not fixed by the C++ standard?',
          [
            'sizeof(char)',
            'sizeof(unsigned char)',
            'sizeof(std::int8_t)',
            'sizeof(long)',
          ],
          3,
          'long is 4 bytes on some platforms and 8 on others; the other sizes are fixed.',
        ),
        choose(
          'A wire-format header struct must be exactly 16 bytes. Which line documents and enforces that?',
          [
            'static_assert(sizeof(Header) == 16);',
            'if (sizeof(Header) != 16) return;',
            '// Header is 16 bytes',
            'A run-time check at the end of main',
          ],
          0,
          'Only static_assert stops the build on a platform where the layout differs.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <cstdint>
#include <iostream>
int main() {
  std::cout << sizeof(std::uint8_t) * 8 << " " << sizeof(std::uint32_t) * 8 << "\\n";
}`,
          ['1 4', '8 32', '8 8', '64 256'],
          1,
          'Multiplying the byte sizes by 8 gives the bit widths in the type names.',
        ),
      ],
    },
  ],
  'cpp-constexpr-function': [
    {
      title: 'A constexpr function can run while compiling',
      explanation: [
        'Marking a function constexpr allows a call with constant arguments to be evaluated during compilation. The result can then be used where a constant is required, such as in a static_assert or to initialize a constexpr variable.',
      ],
      example: {
        language: 'cpp',
        code: `#include <iostream>
constexpr int square(int value) { return value * value; }
static_assert(square(4) == 16);
int main() {
  constexpr int area = square(6);
  std::cout << area << "\\n";
}`,
        output: '36',
        explanation:
          'square(4) is evaluated by the compiler for the assertion, and square(6) initializes the constant area.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `#include <iostream>
constexpr int cube(int value) { return value * value * value; }
int main() {
  constexpr int c = cube(3);
  static_assert(c == 27);
  std::cout << c + 1 << "\\n";
}`,
          ['27', '10', '28', '9'],
          2,
          'cube(3) is 27, computed during compilation, and the program prints 28.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <iostream>
constexpr int add_tax(int cents) { return cents + cents / 10; }
static_assert(add_tax(100) == 110);
int main() {
  std::cout << add_tax(55) << "\\n";
}`,
          ['60', '60.5', '61', '55'],
          0,
          '55 / 10 is integer division, giving 5, so the result is 60.',
        ),
        choose(
          'Which use requires the call to be evaluated during compilation?',
          [
            'int y = square(n) + square(2);',
            'int x = square(n);',
            'static_assert(square(3) == 9);',
            'return square(n) * 2;',
          ],
          2,
          'A static_assert condition must be a constant expression; the other uses accept run-time values.',
        ),
      ],
    },
    {
      title: 'The same function also runs at run time',
      explanation: [
        'constexpr permits compile-time evaluation; it does not force it. Called with a run-time value, such as a parameter, a constexpr function simply runs like any other function.',
        'What cannot work is storing such a call in a constexpr variable: constexpr int s = square(n); requires n to be a constant.',
      ],
      example: {
        language: 'cpp',
        code: `#include <iostream>
constexpr int square(int value) { return value * value; }
int total_area(int side) { return square(side) + square(2); }
int main() {
  std::cout << total_area(5) << "\\n";
}`,
        output: '29',
        explanation:
          'square(side) runs at run time with the parameter 5; square(2) may be folded by the compiler. Both give ordinary results: 25 + 4.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `#include <iostream>
constexpr int square(int value) { return value * value; }
int main() {
  int n = 7;
  int s = square(n);
  std::cout << s << "\\n";
}`,
          ['14', '7', '49', '0'],
          2,
          'n is an ordinary variable, so the call runs at run time and returns 49.',
        ),
        choose(
          '`int n = read_input(); constexpr int s = square(n);` Why does this not compile?',
          [
            'square cannot be called with a variable argument',
            'n is not a constant, so square(n) cannot initialize a constexpr variable',
            'constexpr variables must be declared at namespace scope',
            'square returns int, which constexpr variables cannot hold',
          ],
          1,
          'A constexpr variable needs a value known during compilation, and n is read at run time.',
        ),
        choose(
          'Does marking a function constexpr guarantee that every call is computed during compilation?',
          [
            'Yes; the compiler computes every call to it',
            'Yes, unless the function takes parameters',
            'No; constexpr functions run only at run time',
            'No; only calls in constant contexts are guaranteed',
          ],
          3,
          'Calls with run-time arguments run normally; constant contexts such as static_assert force compile-time evaluation.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <iostream>
constexpr int half(int value) { return value / 2; }
int main() {
  int x = 9;
  constexpr int fixed = half(9);
  std::cout << fixed + half(x) << "\\n";
}`,
          ['8', '9', '4', '10'],
          0,
          'half(9) is 4 both as a compile-time constant and as a run-time call, so the sum is 8.',
        ),
      ],
    },
  ],
  'cpp-consteval-function': [
    {
      title: 'consteval requires a compile-time result',
      explanation: [
        'A consteval function is an immediate function: every call must produce a constant during compilation. Call it with literals or constexpr values, and use the result to initialize a constexpr variable or in a static_assert.',
        '1 << n shifts the bits of 1 left by n places, which equals 2 to the power n, so capacity(3) is 8.',
      ],
      example: {
        language: 'cpp',
        code: `#include <iostream>
consteval int capacity(int exponent) { return 1 << exponent; }
static_assert(capacity(4) == 16);
int main() {
  constexpr int count = capacity(3);
  std::cout << count << "\\n";
}`,
        output: '8',
        explanation:
          'Both calls have constant arguments, so the compiler evaluates them: 2 to the power 4 and 2 to the power 3.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `#include <iostream>
consteval int kib(int n) { return n * 1024; }
int main() {
  constexpr int size = kib(4);
  std::cout << size << "\\n";
}`,
          ['4', '1028', '4096', '1024'],
          2,
          'kib(4) is computed during compilation as 4 * 1024.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <iostream>
consteval int capacity(int exponent) { return 1 << exponent; }
int main() {
  constexpr int total = capacity(5) + capacity(0);
  std::cout << total << "\\n";
}`,
          ['32', '33', '5', '6'],
          1,
          '1 << 5 is 32 and 1 << 0 is 1.',
        ),
        choose(
          'Which call to `consteval int twice(int v)` is valid?',
          [
            'twice(n), where n is a function parameter',
            'twice(read()), where read returns user input',
            'twice(x), where x is an ordinary int variable',
            'twice(21)',
          ],
          3,
          'Only the literal argument is a constant expression.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <iostream>
consteval int capacity(int exponent) { return 1 << exponent; }
int main() {
  constexpr int base = 3;
  constexpr int cap = capacity(base);
  std::cout << cap << " " << base << "\\n";
}`,
          ['8 3', '6 3', '9 3', '3 8'],
          0,
          'base is constexpr, so capacity(base) is a valid immediate call giving 8.',
        ),
      ],
    },
    {
      title: 'consteval rejects run-time arguments',
      explanation: [
        'The difference from constexpr shows with run-time values. A constexpr function called with a parameter just runs at run time; a consteval function called with a parameter is a compile error, because no constant can be produced.',
        'Use consteval when a value must be fixed at build time, such as a table size, and constexpr when the same function should also serve run-time inputs.',
      ],
      example: {
        language: 'cpp',
        code: `#include <iostream>
constexpr int scale(int value) { return value * 10; }
consteval int fixed_scale(int value) { return value * 10; }
int runtime(int value) { return scale(value); }
int main() {
  constexpr int built = fixed_scale(4);
  std::cout << built << " " << runtime(5) << "\\n";
}`,
        output: '40 50',
        explanation:
          'runtime may call the constexpr scale with its parameter. Calling fixed_scale(value) there would not compile.',
      },
      questions: [
        choose(
          'Given `consteval int sq(int v)`, a function `int f(int n)` calls sq(n). What happens?',
          [
            'It compiles and runs at run time, like constexpr',
            'It compiles, and sq(n) always returns 0',
            'It is a compile error, because n is not a constant',
            'It is evaluated once, when f is first called',
          ],
          2,
          'An immediate function call must be a constant expression, and n is a run-time parameter.',
        ),
        choose(
          'A function must also accept values read at run time. Which keyword fits?',
          [
            'constexpr',
            'consteval',
            'static_assert',
            'Either one; they behave the same',
          ],
          0,
          'constexpr allows both compile-time and run-time calls; consteval allows only compile-time ones.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <iostream>
constexpr int scale(int value) { return value * 10; }
consteval int fixed_scale(int value) { return value * 10; }
int main() {
  constexpr int a = fixed_scale(2);
  int b = scale(3);
  std::cout << a + b << "\\n";
}`,
          ['23', '5', '60', '50'],
          3,
          'a is 20 and b is 30.',
        ),
        choose(
          'Why would a library mark a buffer-size function consteval?',
          [
            'To make it run faster when called at run time',
            'To guarantee the size is fixed during compilation',
            'To allow it to read configuration files at startup',
            'To let it throw exceptions during compilation',
          ],
          1,
          'consteval turns any attempt to compute the size from run-time data into a compile error.',
        ),
      ],
    },
  ],
  'cpp-constexpr': [
    {
      title: 'Build a lookup table during compilation',
      explanation: [
        'std::array<int, N> (from <array>) is a fixed-size array whose length N is part of its type. A constexpr function may declare a local std::array, fill it in a loop, and return it.',
        'constexpr auto values = table(); then builds the whole table during compilation, and the program only reads it.',
      ],
      example: {
        language: 'cpp',
        code: `#include <array>
#include <iostream>
constexpr std::array<int, 4> table() {
  std::array<int, 4> result{};
  for (int i = 0; i < 4; ++i) result[i] = i * i;
  return result;
}
int main() {
  constexpr auto values = table();
  std::cout << values[2] << " " << values[3] << "\\n";
}`,
        output: '4 9',
        explanation: 'The table holds 0, 1, 4 and 9, computed by the compiler.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `#include <array>
#include <iostream>
constexpr std::array<int, 5> table() {
  std::array<int, 5> result{};
  for (int i = 0; i < 5; ++i) result[i] = i * 10;
  return result;
}
int main() {
  constexpr auto values = table();
  std::cout << values[4] << "\\n";
}`,
          ['50', '4', '40', '10'],
          2,
          'Index 4 holds 4 * 10; indexes start at 0, so 50 is never stored.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <array>
#include <iostream>
constexpr std::array<int, 5> running() {
  std::array<int, 5> result{};
  for (int i = 1; i < 5; ++i) result[i] = result[i - 1] + i;
  return result;
}
int main() {
  constexpr auto values = running();
  std::cout << values[4] << "\\n";
}`,
          ['10', '4', '15', '6'],
          0,
          'The entries are 0, 1, 3, 6 and 10: each adds its index to the previous entry.',
        ),
        choose(
          'What does `constexpr auto values = table();` achieve?',
          [
            'table() runs again every time values is read',
            'The table is computed while compiling and stored as a constant',
            'values refers to the local array inside table()',
            'The table is computed lazily, the first time it is used',
          ],
          1,
          'A constexpr variable must be initialized by a constant expression, so table() runs in the compiler.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <array>
#include <iostream>
constexpr std::array<int, 4> table() {
  std::array<int, 4> result{};
  for (int i = 0; i < 4; ++i) result[i] = i * i;
  return result;
}
int main() {
  constexpr auto values = table();
  static_assert(values[1] == 1);
  std::cout << values.size() << "\\n";
}`,
          ['3', '16', '5', '4'],
          3,
          'size() is the N in std::array<int, 4>, whatever the entries contain.',
        ),
      ],
    },
    {
      title: 'Check a run-time index against size()',
      explanation: [
        'The table is fixed, but the index often arrives at run time. operator[] does not check bounds, so compare the index with values.size() first; valid indexes run from 0 to size() - 1.',
        'With a std::size_t index, a negative number cannot slip through: -1 converted to std::size_t wraps to a huge value, which fails the check.',
      ],
      example: {
        language: 'cpp',
        code: `#include <array>
#include <cstddef>
#include <iostream>
constexpr std::array<int, 4> table() {
  std::array<int, 4> result{};
  for (int i = 0; i < 4; ++i) result[i] = i * i;
  return result;
}
int lookup(std::size_t index) {
  constexpr auto values = table();
  return index < values.size() ? values[index] : -1;
}
int main() {
  std::cout << lookup(3) << " " << lookup(4) << "\\n";
}`,
        output: '9 -1',
        explanation:
          'Index 3 is the last valid one. Index 4 equals size(), so the guard returns -1 instead of reading past the end.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `#include <array>
#include <cstddef>
#include <iostream>
constexpr std::array<int, 4> table() {
  std::array<int, 4> result{};
  for (int i = 0; i < 4; ++i) result[i] = i * i;
  return result;
}
int lookup(std::size_t index) {
  constexpr auto values = table();
  return index < values.size() ? values[index] : -1;
}
int main() {
  std::cout << lookup(0) << " " << lookup(5) << "\\n";
}`,
          ['0 -1', '1 -1', '0 25', '-1 -1'],
          0,
          'Index 0 holds 0 * 0. Index 5 is out of range, so the fallback is returned.',
        ),
        predictOutput(
          'A negative index is converted to std::size_t. What does this program print?',
          `#include <array>
#include <cstddef>
#include <iostream>
constexpr std::array<int, 4> table() {
  std::array<int, 4> result{};
  for (int i = 0; i < 4; ++i) result[i] = i * i;
  return result;
}
int lookup(std::size_t index) {
  constexpr auto values = table();
  return index < values.size() ? values[index] : -1;
}
int main() {
  std::cout << lookup(static_cast<std::size_t>(-1)) << "\\n";
}`,
          ['9', '0', '1', '-1'],
          3,
          '-1 wraps to the largest std::size_t value, which is not less than 4, so the guard rejects it.',
        ),
        choose(
          'A table has 4 entries. Which guard is correct before reading values[i]?',
          [
            'i <= values.size()',
            'i < values.size() - 1',
            'i < values.size()',
            'values[i] != 0',
          ],
          2,
          'Valid indexes are 0 to 3. <= admits 4, and size() - 1 wrongly excludes 3.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <array>
#include <cstddef>
#include <iostream>
constexpr std::array<int, 4> table() {
  std::array<int, 4> result{};
  for (int i = 0; i < 4; ++i) result[i] = i * i;
  return result;
}
int main() {
  constexpr auto values = table();
  int sum = 0;
  for (std::size_t i = 0; i < values.size(); ++i) sum += values[i];
  std::cout << sum << "\\n";
}`,
          ['30', '14', '9', '6'],
          1,
          '0 + 1 + 4 + 9 is 14; the half-open loop stops before index 4.',
        ),
      ],
    },
    {
      title: 'Verify the table while compiling',
      explanation: [
        'Because the table is a constant, static_assert can check its entries, so a wrong formula fails the build instead of producing wrong answers later. Indexes that arrive at run time still need the run-time bounds check.',
      ],
      example: {
        language: 'cpp',
        code: `#include <array>
#include <cstddef>
#include <iostream>
constexpr std::array<int, 5> powers() {
  std::array<int, 5> result{};
  int value = 1;
  for (int i = 0; i < 5; ++i) {
    result[i] = value;
    value *= 2;
  }
  return result;
}
constexpr auto table = powers();
static_assert(table[4] == 16);
int lookup(std::size_t index) { return index < table.size() ? table[index] : -1; }
int main() {
  std::cout << lookup(3) << " " << lookup(5) << "\\n";
}`,
        output: '8 -1',
        explanation:
          'The table holds 1, 2, 4, 8 and 16, and the build checks the last entry. Index 5 is out of range at run time.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `#include <array>
#include <cstddef>
#include <iostream>
constexpr std::array<int, 5> powers() {
  std::array<int, 5> result{};
  int value = 1;
  for (int i = 0; i < 5; ++i) {
    result[i] = value;
    value *= 2;
  }
  return result;
}
constexpr auto table = powers();
static_assert(table[0] == 1);
int lookup(std::size_t index) { return index < table.size() ? table[index] : -1; }
int main() {
  std::cout << lookup(0) + lookup(4) << "\\n";
}`,
          ['16', '17', '32', '33'],
          1,
          'table[0] is 1 and table[4] is 16.',
        ),
        choose(
          'What does `static_assert(table[4] == 16);` protect against?',
          [
            'An out-of-range index arriving at run time',
            'The table being modified while the program runs',
            'An integer overflow inside the lookup function',
            'A wrong table formula, caught while compiling',
          ],
          3,
          'It checks the computed contents once, in the compiler; run-time indexes need their own check.',
        ),
        choose(
          'Why is `static_assert(table[i] > 0);` invalid inside `int lookup(std::size_t i)`?',
          [
            'table cannot be indexed inside a static_assert',
            'i is a run-time parameter, so table[i] is not constant',
            'static_assert accepts only == comparisons',
            'table is not constexpr, so it cannot be read',
          ],
          1,
          'The index is unknown during compilation, so the condition cannot be evaluated there.',
        ),
      ],
    },
  ],
  'cpp-function-object': [
    {
      title: 'operator() makes an object callable',
      explanation: [
        'A struct that defines operator() can be called like a function. Its members carry configuration: with struct Offset { int amount; int operator()(int value) const { return value + amount; } };, Offset add3{3}; makes add3(5) return 8.',
        'The const after the parameter list promises that calling the object does not change its members.',
      ],
      example: {
        language: 'cpp',
        code: `#include <iostream>
struct Offset {
  int amount;
  int operator()(int value) const { return value + amount; }
};
int main() {
  Offset add3{3};
  Offset minus2{-2};
  std::cout << add3(5) << " " << minus2(3) << "\\n";
}`,
        output: '8 1',
        explanation:
          'Both objects run the same operator(), each with its own amount.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `#include <iostream>
struct Multiply {
  int factor;
  int operator()(int value) const { return value * factor; }
};
int main() {
  Multiply triple{3};
  std::cout << triple(4) + triple(1) << "\\n";
}`,
          ['12', '7', '15', '13'],
          2,
          'triple(4) is 12 and triple(1) is 3.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <iostream>
struct Line {
  int slope;
  int intercept;
  int operator()(int x) const { return slope * x + intercept; }
};
int main() {
  Line f{2, 1};
  std::cout << f(3) << " " << f(0) << "\\n";
}`,
          ['7 1', '9 1', '7 0', '5 2'],
          0,
          'f(x) computes 2 * x + 1 from the members set at initialization.',
        ),
        choose(
          'What makes `callback(4)` valid when callback is an object of a struct?',
          [
            'The struct has an int member',
            'The struct is initialized with braces',
            'The struct defines operator()',
            'The struct name ends in Callback',
          ],
          2,
          'Call syntax on an object invokes its operator().',
        ),
        predictOutput(
          'What does this program print?',
          `#include <iostream>
struct Offset {
  int amount;
  int operator()(int value) const { return value + amount; }
};
int apply_twice(Offset step, int value) { return step(step(value)); }
int main() {
  std::cout << apply_twice(Offset{4}, 1) << "\\n";
}`,
          ['5', '8', '6', '9'],
          3,
          'The object is passed like any value and called twice: 1 + 4 + 4.',
        ),
      ],
    },
    {
      title: 'Calls can update the object’s own state',
      explanation: [
        'Without const, operator() may change members, so the object remembers earlier calls. Each object has its own state: two counters advance independently, and a copy starts from the state at the moment it was made.',
      ],
      example: {
        language: 'cpp',
        code: `#include <iostream>
struct Counter {
  int count;
  int operator()() {
    count += 1;
    return count;
  }
};
int main() {
  Counter a{0};
  Counter b{10};
  a();
  a();
  std::cout << a() << " " << b() << "\\n";
}`,
        output: '3 11',
        explanation: 'a has been called three times; b once, starting from 10.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `#include <iostream>
struct Counter {
  int count;
  int operator()() {
    count += 1;
    return count;
  }
};
int main() {
  Counter c{5};
  c();
  c();
  std::cout << c.count << "\\n";
}`,
          ['5', '6', '2', '7'],
          3,
          'Each call adds 1 to the member, starting from 5.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <iostream>
struct Counter {
  int count;
  int operator()() {
    count += 1;
    return count;
  }
};
int main() {
  Counter a{0};
  a();
  Counter b = a;
  b();
  b();
  std::cout << a.count << " " << b.count << "\\n";
}`,
          ['1 3', '3 3', '1 2', '3 1'],
          0,
          'b copied a’s count of 1 and then counted on alone; a is unaffected.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <iostream>
struct Total {
  int sum;
  int operator()(int value) {
    sum += value;
    return sum;
  }
};
int main() {
  Total t{0};
  t(4);
  t(6);
  std::cout << t(-3) << "\\n";
}`,
          ['-3', '7', '10', '13'],
          1,
          'The running sum is 4, then 10, then 7.',
        ),
        choose(
          'A function object counts how often it is called. Why must its operator() not be marked const?',
          [
            'A const operator() cannot modify members, and counting does',
            'const member functions are not allowed to return an int',
            'const objects of a struct type can never be called',
            'It must be const, or the count resets after every call',
          ],
          0,
          'const promises the call leaves the object unchanged, which a counter cannot keep.',
        ),
      ],
    },
  ],
  'cpp-std-function': [
    {
      title: 'std::function holds any callable with the right signature',
      explanation: [
        'std::function<int(int)> (from <functional>) can store any callable that accepts an int and returns an int: a lambda, a function object, or a plain function. Calling the std::function calls whatever it currently holds.',
        'The signature is written as the return type followed by the parameter types in parentheses. Because the concrete callable type is hidden, code that receives a std::function does not need to know what kind of callable it is.',
      ],
      example: {
        language: 'cpp',
        code: `#include <functional>
#include <iostream>
int negate(int x) { return -x; }
struct Offset {
  int amount;
  int operator()(int x) const { return x + amount; }
};
int main() {
  std::function<int(int)> f = [](int x) { return x * 3; };
  std::cout << f(4) << " ";
  f = negate;
  std::cout << f(4) << " ";
  f = Offset{10};
  std::cout << f(4) << "\\n";
}`,
        output: '12 -4 14',
        explanation:
          'The same variable holds a lambda, then a function, then a function object, and each call uses the current one.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `#include <functional>
#include <iostream>
int main() {
  std::function<int(int, int)> combine = [](int a, int b) { return a * 10 + b; };
  std::cout << combine(4, 2) << "\\n";
}`,
          ['42', '24', '6', '8'],
          0,
          'The stored lambda computes 4 * 10 + 2.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <functional>
#include <iostream>
struct Offset {
  int amount;
  int operator()(int x) const { return x + amount; }
};
int main() {
  std::function<int(int)> f = [](int x) { return x + 1; };
  int first = f(f(1));
  f = Offset{5};
  std::cout << first << " " << f(1) << "\\n";
}`,
          ['3 3', '2 6', '3 6', '3 2'],
          2,
          'f(f(1)) uses the lambda twice to reach 3. After the reassignment, f(1) uses Offset and gives 6.',
        ),
        choose(
          'Which callable can be stored in std::function<int(int)>?',
          [
            '[](int a, int b) { return a + b; }',
            '[]() { return 7; }',
            'An int variable holding 7',
            '[](int x) { return x * 2; }',
          ],
          3,
          'Only the one-parameter lambda takes one int and returns an int; the others have the wrong parameters or are not callable.',
        ),
        choose(
          'What does it mean for a function receiving a std::function<int(int)> parameter?',
          [
            'It can call the argument without knowing its concrete type',
            'It can receive only lambdas, not functions or objects',
            'It must know the argument’s concrete type to call it',
            'It always discards the argument’s return value',
          ],
          0,
          'std::function erases the concrete callable type behind the common signature.',
        ),
      ],
    },
    {
      title: 'Captured state travels with the stored callable',
      explanation: [
        'Storing a lambda or function object in a std::function stores a copy of it, including any captured values or members. A by-value capture is the snapshot taken when the lambda was created, even if the original variable changes before the call.',
      ],
      example: {
        language: 'cpp',
        code: `#include <functional>
#include <iostream>
int main() {
  int bonus = 5;
  std::function<int(int)> score = [bonus](int base) { return base + bonus; };
  bonus = 50;
  std::cout << score(10) << "\\n";
}`,
        output: '15',
        explanation:
          'The stored lambda copied bonus as 5; the later change does not reach it.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `#include <functional>
#include <iostream>
int main() {
  int rate = 2;
  std::function<int(int)> f = [rate](int x) { return x * rate; };
  rate = 3;
  f = [rate](int x) { return x * rate; };
  std::cout << f(5) << "\\n";
}`,
          ['10', '25', '15', '5'],
          2,
          'The second lambda was created after rate became 3, and it replaced the first.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <functional>
#include <iostream>
struct Offset {
  int amount;
  int operator()(int x) const { return x + amount; }
};
int main() {
  Offset off{1};
  std::function<int(int)> f = off;
  off.amount = 100;
  std::cout << f(1) << "\\n";
}`,
          ['101', '1', '100', '2'],
          3,
          'f holds its own copy of off, made when it was assigned, with amount 1.',
        ),
        choose(
          'A std::function is assigned a lambda that captures limit by value. Later limit changes. What does the stored callable use?',
          [
            'The new value of limit',
            'The value limit had when the lambda was created',
            'Zero',
            'Whatever value the previous call used',
          ],
          1,
          'The lambda’s capture is a copy, and the std::function stores a copy of the lambda.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <functional>
#include <iostream>
int main() {
  int n = 4;
  auto base = [n](int x) { return x + n; };
  std::function<int(int)> a = base;
  std::function<int(int)> b = base;
  n = 9;
  std::cout << a(1) + b(1) << "\\n";
}`,
          ['10', '20', '15', '5'],
          0,
          'Both copies hold the snapshot n = 4, so each call returns 5.',
        ),
      ],
    },
  ],
  'cpp-empty-callback': [
    {
      title: 'A std::function can be empty',
      explanation: [
        'A default-constructed std::function holds no callable. In a condition it converts to bool: false while empty, true once something is assigned. Assigning nullptr empties it again.',
      ],
      example: {
        language: 'cpp',
        code: `#include <functional>
#include <iostream>
int main() {
  std::function<int(int)> hook;
  if (hook) std::cout << "set\\n";
  else std::cout << "empty\\n";
  hook = [](int x) { return x + 2; };
  if (hook) std::cout << hook(5) << "\\n";
}`,
        output: 'empty\n7',
        explanation:
          'hook starts empty, so the first test is false. After the assignment it holds a lambda and can be called.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `#include <functional>
#include <iostream>
int main() {
  std::function<void()> f;
  std::cout << (f ? "set" : "empty") << " ";
  f = [] {};
  std::cout << (f ? "set" : "empty") << "\\n";
}`,
          ['set set', 'empty empty', 'set empty', 'empty set'],
          3,
          'Default construction gives an empty function; any assigned callable, even one that does nothing, makes it non-empty.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <functional>
#include <iostream>
int main() {
  std::function<int()> f = [] { return 4; };
  std::cout << (f ? f() : -1) << " ";
  f = nullptr;
  std::cout << (f ? f() : -1) << "\\n";
}`,
          ['4 -1', '4 4', '-1 -1', '4 0'],
          0,
          'Assigning nullptr removes the stored callable.',
        ),
        choose(
          'What does `if (callback)` test when callback is a std::function?',
          [
            'Whether the callable returns true',
            'Whether the callable has been called before',
            'Whether the std::function currently holds a callable',
            'Whether the callable takes no arguments',
          ],
          2,
          'The bool conversion reports presence, not anything about the callable’s result.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <functional>
#include <iostream>
int outcome(bool configured, int value) {
  std::function<int(int)> callback;
  if (configured) callback = [](int x) { return x + 2; };
  return callback ? callback(value) : -1;
}
int main() {
  std::cout << outcome(true, 5) << " " << outcome(false, 5) << "\\n";
}`,
          ['7 7', '7 -1', '-1 7', '7 5'],
          1,
          'Only the configured call stores a lambda; the other keeps the empty function and returns the fallback.',
        ),
      ],
    },
    {
      title: 'Guard every call to an optional callback',
      explanation: [
        'Calling an empty std::function does not quietly do nothing: it throws std::bad_function_call. An optional callback therefore needs an explicit rule for absence, such as skipping the call or using a default result, checked before every invocation.',
      ],
      example: {
        language: 'cpp',
        code: `#include <functional>
#include <iostream>
int notify(std::function<int(int)> hook, int value) {
  if (hook) return hook(value);
  return value;
}
int main() {
  std::function<int(int)> none;
  std::function<int(int)> doubler = [](int x) { return x * 2; };
  std::cout << notify(none, 6) << " " << notify(doubler, 6) << "\\n";
}`,
        output: '6 12',
        explanation:
          'Without a hook, notify returns the value unchanged; with one, it returns the hook’s result.',
      },
      questions: [
        choose(
          'What happens when an empty std::function<int(int)> is called?',
          [
            'It returns 0',
            'It returns its argument unchanged',
            'The program fails to compile',
            'It throws std::bad_function_call',
          ],
          3,
          'Emptiness is a run-time state, and invoking it is reported with an exception.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <functional>
#include <iostream>
int main() {
  std::function<int(int)> first = [](int x) { return x + 1; };
  std::function<int(int)> second;
  std::function<int(int)> third = [](int x) { return x * 10; };
  int value = 2;
  if (first) value = first(value);
  if (second) value = second(value);
  if (third) value = third(value);
  std::cout << value << "\\n";
}`,
          ['3', '30', '12', '0'],
          1,
          'The empty second stage is skipped, so 2 becomes 3 and then 30.',
        ),
        choose(
          'A logger accepts an optional formatting callback. Which design handles a missing callback?',
          [
            'Check if (format) before calling, and use default formatting otherwise',
            'Call it unconditionally; an empty function does nothing',
            'Assign nullptr to it before calling',
            'Call it twice to make sure it is set',
          ],
          0,
          'An explicit check with a default keeps the logger working whether or not a callback was supplied.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <functional>
#include <iostream>
int call_or(std::function<int(int)> hook, int value) {
  return hook ? hook(value) : -1;
}
int main() {
  std::function<int(int)> hook = [](int x) { return x + 2; };
  int before = call_or(hook, 5);
  hook = nullptr;
  std::cout << before << " " << call_or(hook, 5) << "\\n";
}`,
          ['7 7', '-1 -1', '7 -1', '7 5'],
          2,
          'The first call uses the lambda; after hook is emptied, the guard returns the fallback.',
        ),
      ],
    },
  ],
  'cpp-callbacks': [
    {
      title: 'A mutable lambda keeps state between calls',
      explanation: [
        'A lambda’s captured copies are read-only unless the lambda is declared mutable. With [value = start]() mutable { return ++value; }, each call changes the closure’s own copy, so the closure remembers earlier calls. The original variable is untouched.',
      ],
      example: {
        language: 'cpp',
        code: `#include <iostream>
int main() {
  int start = 2;
  auto next = [value = start]() mutable { return ++value; };
  next();
  std::cout << next() << " " << start << "\\n";
}`,
        output: '4 2',
        explanation:
          'The closure’s copy goes from 2 to 3 to 4. start itself stays 2.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `#include <iostream>
int main() {
  auto tick = [n = 0]() mutable {
    n += 5;
    return n;
  };
  tick();
  tick();
  std::cout << tick() << "\\n";
}`,
          ['5', '0', '10', '15'],
          3,
          'The closure keeps n between calls: 5, 10, 15.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <iostream>
int main() {
  auto a = [n = 0]() mutable { return ++n; };
  auto b = [n = 0]() mutable { return ++n; };
  a();
  a();
  std::cout << a() << " " << b() << "\\n";
}`,
          ['3 1', '3 4', '1 1', '3 3'],
          0,
          'a and b are separate closures, each with its own n.',
        ),
        choose(
          'Why does `[count = 0]() { return ++count; }` fail to compile?',
          [
            'count must be captured by reference to be changed',
            'Its call operator is const by default, so copies are read-only',
            'Init captures cannot be modified, even with mutable',
            'A lambda without parameters cannot return a value',
          ],
          1,
          'mutable lifts that restriction for the closure’s own copies.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <iostream>
int main() {
  int total = 10;
  auto add = [total](int x) mutable {
    total += x;
    return total;
  };
  add(5);
  std::cout << add(5) << " " << total << "\\n";
}`,
          ['20 20', '15 10', '20 10', '15 15'],
          2,
          'The closure’s copy reaches 20 over two calls; the outer total is never modified.',
        ),
      ],
    },
    {
      title: 'Copies of a callback have independent state',
      explanation: [
        'Copying a closure, or a std::function that holds one, copies its captured values. After the copy, each object updates its own state, so calling one does not advance the other. The copy starts from whatever state the original had at the moment of copying.',
      ],
      example: {
        language: 'cpp',
        code: `#include <functional>
#include <iostream>
int main() {
  std::function<int()> first = [value = 2]() mutable { return ++value; };
  auto second = first;
  int a = first();
  int b = second();
  std::cout << a << " " << b << "\\n";
}`,
        output: '3 3',
        explanation:
          'second copied value as 2 before either call, so each copy increments its own 2 to 3.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `#include <functional>
#include <iostream>
int main() {
  std::function<int()> first = [value = 0]() mutable { return ++value; };
  first();
  first();
  auto second = first;
  first();
  std::cout << first() << " " << second() << "\\n";
}`,
          ['4 3', '4 5', '4 1', '2 3'],
          0,
          'second copied the state 2. first then reaches 4, and second’s first call takes its own copy to 3.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <functional>
#include <iostream>
int main() {
  std::function<int()> first = [value = 0]() mutable { return ++value; };
  auto second = first;
  first();
  second();
  std::cout << second() << " " << first() << "\\n";
}`,
          ['2 3', '3 4', '2 2', '1 2'],
          2,
          'Each copy has been called twice by the time its value is printed.',
        ),
        choose(
          'Two std::function copies are made from one counting lambda. Calls through one copy should be visible through the other. Does copying achieve that?',
          [
            'Yes; copies share their captured values',
            'Yes, but only for std::function, not for lambdas',
            'No; copying a mutable lambda does not compile',
            'No; each copy holds its own captured values',
          ],
          3,
          'Copies are independent. Sharing must be arranged deliberately, for example through a pointer to one counter.',
        ),
      ],
    },
    {
      title: 'Share state deliberately through a pointer',
      explanation: [
        'When several callbacks must update one value, capture something that refers to it. An init capture of a pointer, [p = &total], copies only the address, so every copy of the callback updates the same total. That total must outlive every callback that uses it.',
        'A closure that owns a std::unique_ptr cannot be stored in std::function at all: std::function requires a copyable callable, and such a closure cannot be copied.',
      ],
      example: {
        language: 'cpp',
        code: `#include <functional>
#include <iostream>
int main() {
  int total = 0;
  std::function<void(int)> add = [p = &total](int x) { *p += x; };
  auto copy = add;
  add(3);
  copy(4);
  std::cout << total << "\\n";
}`,
        output: '7',
        explanation:
          'Both callbacks hold the same address, so both updates land in total.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `#include <iostream>
int main() {
  int shared = 0;
  auto a = [p = &shared] { ++*p; };
  auto b = a;
  a();
  b();
  b();
  std::cout << shared << "\\n";
}`,
          ['1', '2', '3', '0'],
          2,
          'a and b copy the pointer, not the counter, so all three calls increment shared.',
        ),
        predictOutput(
          'One callback keeps a private count and also updates a shared one. What does this program print?',
          `#include <functional>
#include <iostream>
int main() {
  int shared = 0;
  std::function<int()> f = [p = &shared, own = 0]() mutable {
    ++*p;
    return ++own;
  };
  auto g = f;
  f();
  f();
  std::cout << g() << " " << shared << "\\n";
}`,
          ['3 3', '1 3', '3 1', '1 1'],
          1,
          'own is copied, so g’s count starts at 0 and returns 1. The pointer is shared, so all three calls increment shared.',
        ),
        choose(
          'Why can `[held = std::move(owner)] { return *held; }` not be assigned to a std::function<int()>?',
          [
            'std::function cannot store lambdas that have captures',
            'The lambda returns int& instead of int',
            'held would have to be a raw pointer to be captured',
            'std::function needs a copyable callable; this closure is not',
          ],
          3,
          'Copying the std::function would require copying the unique_ptr, which is not allowed.',
        ),
        choose(
          'A callback captures [p = &count], where count is a local, and is stored in an object that outlives that function. What is the problem?',
          [
            'The pointer dangles once count is destroyed',
            'Each copy of the callback counts separately',
            'Pointers cannot be captured',
            'There is no problem',
          ],
          0,
          'Sharing through a pointer requires the pointed-to object to live at least as long as every callback.',
        ),
      ],
    },
  ],
  'cpp-optional-value': [
    {
      title: 'An optional holds a value or nothing',
      explanation: [
        'std::optional<int> (from <optional>) holds either one int or no value. A default-constructed optional is empty. Assigning an int stores it; has_value() reports which state the optional is in.',
        'value_or(fallback) returns the stored value, or fallback when the optional is empty. A stored 0 is still a value, not an empty optional.',
      ],
      example: {
        language: 'cpp',
        code: `#include <iostream>
#include <optional>
int main() {
  std::optional<int> reading;
  std::cout << reading.has_value() << " " << reading.value_or(-1) << "\\n";
  reading = 7;
  std::cout << reading.has_value() << " " << reading.value_or(-1) << "\\n";
}`,
        output: '0 -1\n1 7',
        explanation:
          'reading starts empty, so value_or returns the fallback. After the assignment it holds 7.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `#include <iostream>
#include <optional>
int main() {
  std::optional<int> price = 12;
  std::cout << price.has_value() << " " << price.value_or(0) << "\\n";
}`,
          ['1 0', '0 12', '1 12', '12 12'],
          2,
          'price holds 12, so it has a value and value_or ignores the fallback.',
        ),
        predictOutput(
          'The optional holds 0. What does this program print?',
          `#include <iostream>
#include <optional>
int main() {
  std::optional<int> count = 0;
  std::cout << count.has_value() << " " << count.value_or(5) << "\\n";
}`,
          ['0 5', '1 5', '0 0', '1 0'],
          3,
          'Storing 0 is storing a value. Only an empty optional uses the fallback.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <iostream>
#include <optional>
int main() {
  bool available = false;
  std::optional<int> result;
  if (available) result = 9;
  std::cout << result.value_or(-1) << "\\n";
}`,
          ['-1', '9', '0', '1'],
          0,
          'The assignment is skipped, so result stays empty and the fallback prints.',
        ),
        choose(
          'What does a default-constructed std::optional<int> contain?',
          ['The int 0', 'No value', 'An indeterminate int', 'The int -1'],
          1,
          'Default construction gives an empty optional; it does not invent an int.',
        ),
      ],
    },
    {
      title: 'Check before reading the value',
      explanation: [
        'An optional converts to bool in a condition: if (slot) is true when it holds a value. After that check, *slot reads the value. Reading *slot from an empty optional is undefined behavior; slot.value() instead throws std::bad_optional_access.',
        'Assigning std::nullopt, or calling reset(), empties an optional again.',
      ],
      example: {
        language: 'cpp',
        code: `#include <iostream>
#include <optional>
int main() {
  std::optional<int> slot = 4;
  if (slot) std::cout << *slot + 1 << "\\n";
  slot = std::nullopt;
  if (slot) std::cout << *slot << "\\n";
  else std::cout << "cleared\\n";
}`,
        output: '5\ncleared',
        explanation:
          'The first check succeeds and *slot reads 4. After std::nullopt, the check fails and the else branch runs.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `#include <iostream>
#include <optional>
int main() {
  std::optional<int> a = 3;
  std::optional<int> b;
  int total = 0;
  if (a) total += *a;
  if (b) total += *b;
  std::cout << total << "\\n";
}`,
          ['0', '3', '6', '4'],
          1,
          'Only a holds a value; the guard skips reading the empty b.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <iostream>
#include <optional>
int main() {
  std::optional<int> v = 8;
  v.reset();
  std::cout << v.has_value() << " " << v.value_or(1) << "\\n";
}`,
          ['1 8', '0 8', '0 1', '1 1'],
          2,
          'reset empties the optional, so the fallback 1 is returned.',
        ),
        choose(
          'Which expression is undefined behavior when opt is an empty std::optional<int>?',
          ['opt.has_value()', 'opt.value_or(0)', 'opt = 5', '*opt'],
          3,
          '* assumes a value is present and does not check.',
        ),
        choose(
          'How do opt.value() and *opt differ when opt is empty?',
          [
            'value() throws bad_optional_access; *opt is undefined',
            'Both quietly return 0 for an empty optional',
            'value() returns 0, while *opt throws an exception',
            'There is no difference; both check for a value',
          ],
          0,
          'value() is the checked access; * is unchecked.',
        ),
      ],
    },
  ],
  'cpp-optional-search': [
    {
      title: 'Return std::nullopt when a search fails',
      explanation: [
        'A search that may find nothing can return std::optional<int>: return the index when found, and return std::nullopt otherwise. Every index, including 0, is then a genuine result, and absence has its own state.',
        'The caller tests the optional before reading it.',
      ],
      example: {
        language: 'cpp',
        code: `#include <iostream>
#include <optional>
#include <vector>
std::optional<int> find_index(const std::vector<int>& values, int target) {
  for (int i = 0; i < static_cast<int>(values.size()); ++i)
    if (values[i] == target) return i;
  return std::nullopt;
}
int main() {
  std::vector<int> ids{4, 8};
  auto hit = find_index(ids, 4);
  auto miss = find_index(ids, 5);
  std::cout << hit.has_value() << " " << *hit << " " << miss.has_value() << "\\n";
}`,
        output: '1 0 0',
        explanation:
          '4 is found at index 0, which is a real answer. 5 is not found, so the second optional is empty.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `#include <iostream>
#include <optional>
#include <vector>
std::optional<int> find_index(const std::vector<int>& values, int target) {
  for (int i = 0; i < static_cast<int>(values.size()); ++i)
    if (values[i] == target) return i;
  return std::nullopt;
}
int main() {
  std::vector<int> ids{7, 3, 7};
  std::cout << find_index(ids, 7).value_or(-1) << "\\n";
}`,
          ['2', '0', '1', '-1'],
          1,
          'The loop returns at the first match, index 0.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <iostream>
#include <optional>
#include <vector>
std::optional<int> find_index(const std::vector<int>& values, int target) {
  for (int i = 0; i < static_cast<int>(values.size()); ++i)
    if (values[i] == target) return i;
  return std::nullopt;
}
int main() {
  std::vector<int> ids{5, 3};
  auto result = find_index(ids, 3);
  if (result) std::cout << "at " << *result << "\\n";
  else std::cout << "missing\\n";
}`,
          ['at 3', 'missing', 'at 1', 'at 2'],
          2,
          '3 is at index 1; the optional reports the index, not the value.',
        ),
        predictOutput(
          'How many targets are found?',
          `#include <iostream>
#include <optional>
#include <vector>
std::optional<int> find_index(const std::vector<int>& values, int target) {
  for (int i = 0; i < static_cast<int>(values.size()); ++i)
    if (values[i] == target) return i;
  return std::nullopt;
}
int main() {
  std::vector<int> ids{0, 6, 9};
  std::vector<int> targets{0, 5, 9};
  int found = 0;
  for (int target : targets)
    if (find_index(ids, target)) ++found;
  std::cout << found << "\\n";
}`,
          ['1', '3', '0', '2'],
          3,
          'Target 0 is found at index 0. The optional holds 0, which still counts as present, so 0 and 9 are both found.',
        ),
        choose(
          'Why does find_index return std::optional<int> rather than a plain int?',
          [
            'Absence gets its own state instead of a marker like -1',
            'optional is faster to return than a plain int from a loop',
            'An int cannot be returned from inside a for loop body',
            'optional sorts the matches so the caller sees the smallest index',
          ],
          0,
          'The empty state is separate from every int, so a marker such as -1 cannot be mistaken for an index.',
        ),
      ],
    },
    {
      title: 'A sentinel value can collide with real data',
      explanation: [
        'Returning a special value such as 0 or -1 for "not found" works only when that value can never be a real answer. When it can, the caller cannot tell a genuine result from a failure.',
        'An optional keeps the two apart: the found value, whatever it is, lives inside it, and failure is the empty state.',
      ],
      example: {
        language: 'cpp',
        code: `#include <iostream>
#include <optional>
#include <vector>
int first_below_sentinel(const std::vector<int>& values, int limit) {
  for (int value : values)
    if (value < limit) return value;
  return -1;
}
std::optional<int> first_below(const std::vector<int>& values, int limit) {
  for (int value : values)
    if (value < limit) return value;
  return std::nullopt;
}
int main() {
  std::vector<int> temps{3, -1, -4};
  std::cout << first_below_sentinel(temps, 0) << " " << first_below_sentinel(temps, -5) << "\\n";
  std::cout << first_below(temps, 0).has_value() << " " << first_below(temps, -5).has_value() << "\\n";
}`,
        output: '-1 -1\n1 0',
        explanation:
          'The sentinel version prints -1 both for the real reading -1 and for "nothing below -5". The optional version distinguishes them.',
      },
      questions: [
        predictOutput(
          'Index 0 holds a free item priced 0. What does this program print?',
          `#include <iostream>
#include <vector>
int price_at(const std::vector<int>& prices, int index) {
  if (index < static_cast<int>(prices.size())) return prices[index];
  return 0;
}
int main() {
  std::vector<int> prices{0, 5};
  std::cout << price_at(prices, 0) << " " << price_at(prices, 7) << "\\n";
}`,
          ['0 0', '0 -1', '5 0', '0 5'],
          0,
          'The real price 0 and the "no such item" marker 0 print identically, so the caller cannot tell them apart.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <iostream>
#include <optional>
#include <vector>
std::optional<int> price_at(const std::vector<int>& prices, int index) {
  if (index < static_cast<int>(prices.size())) return prices[index];
  return std::nullopt;
}
int main() {
  std::vector<int> prices{0, 5};
  std::cout << price_at(prices, 0).has_value() << " " << price_at(prices, 7).has_value() << "\\n";
}`,
          ['0 0', '1 1', '0 1', '1 0'],
          3,
          'The free item is a present value; the missing index is the empty optional.',
        ),
        choose(
          'A function returns -1 when no matching temperature is found. Why is this risky?',
          [
            '-1 cannot be returned from a function returning int',
            'Callers always ignore negative values, so -1 is dropped',
            '-1 can be a real temperature, so absence looks like a match',
            'It is not risky as long as the vector is sorted first',
          ],
          2,
          'A sentinel must lie outside the domain of real answers; temperatures can be -1.',
        ),
      ],
    },
  ],
  'cpp-variant-alternatives': [
    {
      title: 'A variant holds exactly one alternative',
      explanation: [
        'std::variant<int, std::string> (from <variant>) holds either an int or a std::string, one at a time. index() reports which alternative is active, counting from 0 in the order the types are listed. Assigning a value of another alternative switches to it.',
        'A default-constructed variant holds a value-initialized first alternative, here the int 0.',
      ],
      example: {
        language: 'cpp',
        code: `#include <iostream>
#include <string>
#include <variant>
int main() {
  std::variant<int, std::string> cell;
  std::cout << cell.index() << " " << std::get<int>(cell) << "\\n";
  cell = std::string("abc");
  std::cout << cell.index() << "\\n";
}`,
        output: '0 0\n1',
        explanation:
          'cell starts as the int 0. After the string is assigned, the active alternative is index 1.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `#include <iostream>
#include <string>
#include <variant>
int main() {
  std::variant<int, std::string> v = 8;
  v = std::string("hi");
  v = 3;
  std::cout << v.index() << " " << std::get<int>(v) << "\\n";
}`,
          ['1 3', '0 8', '0 3', '1 8'],
          2,
          'The last assignment makes the int alternative active again, holding 3.',
        ),
        predictOutput(
          'The int alternative is listed second here. What does this program print?',
          `#include <iostream>
#include <variant>
int main() {
  std::variant<double, int> v = 4;
  std::cout << v.index() << "\\n";
}`,
          ['0', '4', '2', '1'],
          3,
          '4 is an int, and int is the second listed alternative, index 1.',
        ),
        choose(
          'How many values does a std::variant<int, std::string> hold at once?',
          [
            'Exactly one, of whichever alternative is active',
            'One int and one string, side by side',
            'Any number of strings, plus one int',
            'Both, but only the last assigned may be read',
          ],
          0,
          'A variant stores one active alternative and tracks which one it is.',
        ),
        choose(
          'What does a default-constructed std::variant<int, std::string> hold?',
          [
            'An empty string',
            'Nothing',
            'The int 0',
            'Both an int and a string',
          ],
          2,
          'Default construction value-initializes the first listed alternative.',
        ),
      ],
    },
    {
      title: 'Query the active type before getting it',
      explanation: [
        'std::holds_alternative<T>(v) tests whether T is the active alternative. std::get<T>(v) returns the value when T is active and throws std::bad_variant_access when it is not; it never converts one alternative into another.',
        'Test first, then get the matching type.',
      ],
      example: {
        language: 'cpp',
        code: `#include <iostream>
#include <string>
#include <variant>
int measure(const std::variant<int, std::string>& value) {
  if (std::holds_alternative<int>(value)) return std::get<int>(value);
  return static_cast<int>(std::get<std::string>(value).size());
}
int main() {
  std::variant<int, std::string> a = 8;
  std::variant<int, std::string> b = std::string("abc");
  std::cout << measure(a) << " " << measure(b) << "\\n";
}`,
        output: '8 3',
        explanation:
          'a holds an int, which is returned directly. b holds a string, so its length is returned.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `#include <iostream>
#include <string>
#include <variant>
int measure(const std::variant<int, std::string>& value) {
  if (std::holds_alternative<int>(value)) return std::get<int>(value);
  return static_cast<int>(std::get<std::string>(value).size());
}
int main() {
  std::variant<int, std::string> a = std::string("hello");
  std::variant<int, std::string> b = 2;
  std::cout << measure(a) + measure(b) << "\\n";
}`,
          ['7', '2', '5', '3'],
          0,
          'The string contributes its length 5 and the int contributes 2.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <iostream>
#include <string>
#include <variant>
int main() {
  std::variant<int, std::string> v = 1;
  v = std::string("x");
  std::cout << std::holds_alternative<int>(v) << " " << std::holds_alternative<std::string>(v) << "\\n";
}`,
          ['1 0', '1 1', '0 1', '0 0'],
          2,
          'After the assignment only the string alternative is active.',
        ),
        choose(
          'v holds the string "7". What does std::get<int>(v) do?',
          [
            'Returns 7',
            'Returns 0',
            'Converts the string to an int',
            'Throws std::bad_variant_access',
          ],
          3,
          'get checks the active alternative and refuses a type that is not active.',
        ),
        predictOutput(
          'The variant holds the text 42. What does this program print?',
          `#include <iostream>
#include <string>
#include <variant>
int measure(const std::variant<int, std::string>& value) {
  if (std::holds_alternative<int>(value)) return std::get<int>(value);
  return static_cast<int>(std::get<std::string>(value).size());
}
int main() {
  std::variant<int, std::string> v = std::string("42");
  std::cout << measure(v) << "\\n";
}`,
          ['42', '2', '0', '4'],
          1,
          'The active alternative is a two-character string, so measure returns its length, not a parsed number.',
        ),
      ],
    },
  ],
  'cpp-optional': [
    {
      title: 'std::visit calls a visitor with the active value',
      explanation: [
        'std::visit(visitor, v) calls visitor with whatever v currently holds. A convenient visitor is a lambda with an auto parameter, [](const auto& x) { ... }, which works like a template: it is compiled once for each alternative.',
        'Because of that, the visitor’s body must be valid for every alternative, not just the one active at run time.',
      ],
      example: {
        language: 'cpp',
        code: `#include <iostream>
#include <variant>
int main() {
  std::variant<int, double> v = 3;
  std::visit([](const auto& x) { std::cout << x * 2 << "\\n"; }, v);
  v = 1.25;
  std::visit([](const auto& x) { std::cout << x * 2 << "\\n"; }, v);
}`,
        output: '6\n2.5',
        explanation:
          'The first visit receives the int 3; the second receives the double 1.25. x * 2 is valid for both types.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `#include <iostream>
#include <string>
#include <variant>
int main() {
  std::variant<int, std::string> v = std::string("ok");
  std::visit([](const auto& x) { std::cout << x << "\\n"; }, v);
}`,
          ['0', '1', 'ok', '2'],
          2,
          'The visitor receives the active string and prints it; printing works for both alternatives.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <iostream>
#include <variant>
int main() {
  std::variant<int, double> v = 2.6;
  int doubled = std::visit([](const auto& x) { return static_cast<int>(x * 2); }, v);
  std::cout << doubled << "\\n";
}`,
          ['5', '6', '5.2', '4'],
          0,
          'The double 2.6 is doubled to 5.2 and then converted to the int 5.',
        ),
        choose(
          'A variant<int, std::string> is visited with [](const auto& x) { return x + 1; }. Why does this not compile?',
          [
            'Lambdas cannot be used as visitors for std::visit',
            'x must not be const when a variant holds a string',
            'The visitor must suit every alternative, and string + 1 fails',
            'std::visit requires at least two variants to compare',
          ],
          2,
          'visit instantiates the visitor for each alternative, whichever one is active.',
        ),
        choose(
          'Which alternative’s value does std::visit pass to the visitor?',
          [
            'The first alternative listed',
            'The one currently active',
            'Every alternative, in order',
            'The last one assigned when compiling',
          ],
          1,
          'visit dispatches on the variant’s run-time state.',
        ),
      ],
    },
    {
      title: 'Branch on the alternative’s type with if constexpr',
      explanation: [
        'When alternatives need different code, name the parameter’s type: using T = std::decay_t<decltype(item)>;. decltype(item) is const std::string& for a string, and std::decay_t strips the const and the reference.',
        'Then if constexpr (std::is_same_v<T, int>) selects a branch per alternative. The discarded branch is not instantiated, so item.size() can appear in the string branch only.',
      ],
      example: {
        language: 'cpp',
        code: `#include <iostream>
#include <string>
#include <type_traits>
#include <variant>
int main() {
  auto measure = [](const auto& item) -> int {
    using T = std::decay_t<decltype(item)>;
    if constexpr (std::is_same_v<T, int>) return item;
    else return static_cast<int>(item.size());
  };
  std::variant<int, std::string> value = 5;
  int a = std::visit(measure, value);
  value = std::string("abcd");
  std::cout << a << " " << std::visit(measure, value) << "\\n";
}`,
        output: '5 4',
        explanation:
          'For the int, the first branch returns it. For the string, the else branch returns its length.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `#include <iostream>
#include <string>
#include <type_traits>
#include <variant>
int main() {
  auto measure = [](const auto& item) -> int {
    using T = std::decay_t<decltype(item)>;
    if constexpr (std::is_same_v<T, int>) return item;
    else return static_cast<int>(item.size());
  };
  std::variant<int, std::string> value = std::string("abcd");
  int a = std::visit(measure, value);
  value = 9;
  std::cout << a << " " << std::visit(measure, value) << "\\n";
}`,
          ['9 4', '4 9', '4 4', '0 9'],
          1,
          'The string gives its length 4; then the int 9 is returned as is.',
        ),
        choose(
          'Why does the visitor need if constexpr rather than a plain if?',
          [
            'A plain if would compile item.size() for the int alternative too',
            'A plain if cannot compare two types with is_same_v',
            'if constexpr makes the visitor run faster at run time',
            'std::visit forbids ordinary if statements in visitors',
          ],
          0,
          'Only if constexpr discards the branch that is invalid for the current alternative.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <iostream>
#include <string>
#include <type_traits>
#include <variant>
int main() {
  auto code = [](const auto& item) -> int {
    using T = std::decay_t<decltype(item)>;
    if constexpr (std::is_same_v<T, int>) return 1;
    else if constexpr (std::is_same_v<T, double>) return 2;
    else return 3;
  };
  std::variant<int, double, std::string> v = 2.5;
  int a = std::visit(code, v);
  v = std::string("z");
  int b = std::visit(code, v);
  v = 7;
  std::cout << a << " " << b << " " << std::visit(code, v) << "\\n";
}`,
          ['1 2 3', '2 1 3', '3 2 1', '2 3 1'],
          3,
          'The active alternatives are double, then string, then int.',
        ),
        choose(
          'What is std::decay_t<decltype(item)> when item is a const std::string&?',
          ['const std::string&', 'std::string&', 'std::string', 'char'],
          2,
          'decay_t removes the reference and the const, leaving the plain type to compare.',
        ),
      ],
    },
  ],
  'cpp-throw-catch': [
    {
      title: 'throw jumps to a matching catch',
      explanation: [
        'throw creates an exception object and leaves the current code immediately: statements after the throw in the try block do not run. Control passes to a catch handler whose type matches, and after the handler finishes, execution continues after the whole try/catch statement.',
        'Standard exception types such as std::invalid_argument and std::runtime_error come from <stdexcept>.',
      ],
      example: {
        language: 'cpp',
        code: `#include <iostream>
#include <stdexcept>
int main() {
  try {
    std::cout << "start ";
    throw std::invalid_argument("negative");
    std::cout << "unreached ";
  } catch (const std::invalid_argument&) {
    std::cout << "handled ";
  }
  std::cout << "after\\n";
}`,
        output: 'start handled after',
        explanation:
          'The throw skips the rest of the try block, the handler runs, and the program continues after the try/catch.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `#include <iostream>
#include <stdexcept>
int main() {
  int value = 5;
  try {
    if (value < 0) throw std::invalid_argument("negative");
    std::cout << "ok ";
  } catch (const std::invalid_argument&) {
    std::cout << "bad ";
  }
  std::cout << "end\\n";
}`,
          ['ok end', 'bad end', 'ok bad end', 'end'],
          0,
          'Nothing is thrown, so the try block finishes and the handler is skipped.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <iostream>
#include <stdexcept>
int main() {
  int value = -2;
  try {
    if (value < 0) throw std::invalid_argument("negative");
    std::cout << "ok ";
  } catch (const std::invalid_argument&) {
    std::cout << "bad ";
  }
  std::cout << "end\\n";
}`,
          ['ok end', 'ok bad end', 'bad end', 'bad'],
          2,
          'The throw skips "ok", the handler prints "bad", and execution continues after the try/catch.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <iostream>
#include <stdexcept>
int checked(int value) {
  if (value < 0) throw std::invalid_argument("negative");
  return value * 2;
}
int main() {
  int total = 0;
  try {
    total += checked(3);
    total += checked(-1);
    total += checked(5);
  } catch (const std::invalid_argument&) {
    total += 100;
  }
  std::cout << total << "\\n";
}`,
          ['116', '16', '106', '6'],
          2,
          'checked(3) adds 6. checked(-1) throws, so checked(5) never runs, and the handler adds 100.',
        ),
        choose(
          'After a catch block finishes, where does execution continue?',
          [
            'At the statement after the throw',
            'At the start of the try block',
            'After the whole try/catch statement',
            'Nowhere; the program ends',
          ],
          2,
          'Exceptions do not resume; the code after the throw is abandoned.',
        ),
      ],
    },
    {
      title: 'Handlers match by type; catch by const reference',
      explanation: [
        'Each catch names a type, and the first handler whose type matches the thrown object runs; a handler for a different type is skipped. Catch standard exceptions by const reference, as in catch (const std::runtime_error& e), so nothing is copied and the exact thrown object is kept.',
        'e.what() returns the message given when the exception was created.',
      ],
      example: {
        language: 'cpp',
        code: `#include <iostream>
#include <stdexcept>
int main() {
  try {
    throw std::runtime_error("disk full");
  } catch (const std::invalid_argument& e) {
    std::cout << "invalid: " << e.what() << "\\n";
  } catch (const std::runtime_error& e) {
    std::cout << "runtime: " << e.what() << "\\n";
  }
}`,
        output: 'runtime: disk full',
        explanation:
          'The invalid_argument handler does not match a runtime_error, so the second handler runs.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `#include <iostream>
#include <stdexcept>
int main() {
  try {
    throw std::invalid_argument("bad id");
  } catch (const std::invalid_argument& e) {
    std::cout << "invalid: " << e.what() << "\\n";
  } catch (const std::runtime_error& e) {
    std::cout << "runtime: " << e.what() << "\\n";
  }
}`,
          [
            'runtime: bad id',
            'invalid: bad id',
            'invalid: invalid_argument',
            'bad id',
          ],
          1,
          'The first handler matches the thrown type and prints its message.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <iostream>
#include <stdexcept>
int main() {
  try {
    throw std::out_of_range("index 9");
  } catch (const std::out_of_range& e) {
    std::cout << e.what() << "\\n";
  }
}`,
          ['out_of_range', 'std::out_of_range: index 9', '9', 'index 9'],
          3,
          'what() returns exactly the message passed to the constructor.',
        ),
        choose(
          'Why catch with const std::runtime_error& rather than by value?',
          [
            'Handlers that catch by value never match anything',
            'A reference avoids a copy and keeps the derived type intact',
            'const is required for e.what() to compile at all',
            'A reference makes the handler run twice for safety',
          ],
          1,
          'Catching by value copies the object and, for a derived exception, slices it to the handler’s type.',
        ),
        choose(
          'A function throws std::invalid_argument, and the only nearby handler is catch (const std::out_of_range&). What happens?',
          [
            'That handler runs anyway, because all exceptions match',
            'The exception is converted to out_of_range first',
            'The handler is skipped and the exception keeps propagating',
            'The throw statement is ignored and execution continues',
          ],
          2,
          'Only a matching handler can catch it; otherwise the search continues outward.',
        ),
      ],
    },
    {
      title: 'Exceptions propagate out of called functions',
      explanation: [
        'A function that throws does not return. The exception passes up through each caller until an enclosing try has a matching handler.',
        'Work done before the throw is not undone: output already printed and changes made through reference parameters remain.',
      ],
      example: {
        language: 'cpp',
        code: `#include <iostream>
#include <stdexcept>
void deposit(int& balance, int amount) {
  if (amount < 0) throw std::invalid_argument("negative deposit");
  balance += amount;
}
int main() {
  int balance = 10;
  try {
    deposit(balance, 5);
    deposit(balance, -3);
    deposit(balance, 7);
  } catch (const std::invalid_argument& e) {
    std::cout << e.what() << "\\n";
  }
  std::cout << balance << "\\n";
}`,
        output: 'negative deposit\n15',
        explanation:
          'The first deposit happens. The second throws before changing anything, so the third never runs, and main’s handler prints the message.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `#include <iostream>
#include <stdexcept>
void deposit(int& balance, int amount) {
  if (amount < 0) throw std::invalid_argument("negative deposit");
  balance += amount;
}
int main() {
  int balance = 0;
  try {
    deposit(balance, 4);
    deposit(balance, 6);
    deposit(balance, -1);
    deposit(balance, 2);
  } catch (const std::invalid_argument&) {
  }
  std::cout << balance << "\\n";
}`,
          ['12', '10', '0', '11'],
          1,
          'The two deposits before the throw stay applied; the last deposit is never reached.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <iostream>
#include <stdexcept>
int checked(int value) {
  if (value < 0) throw std::invalid_argument("negative");
  return value;
}
int sum(int a, int b) {
  int x = checked(a);
  int y = checked(b);
  return x + y;
}
int main() {
  try {
    std::cout << sum(2, 3) << " ";
    std::cout << sum(-2, 3) << " ";
  } catch (const std::invalid_argument&) {
    std::cout << "caught";
  }
  std::cout << "\\n";
}`,
          ['5 caught', '5 1 caught', 'caught', '5 3 caught'],
          0,
          'The second sum throws from checked and leaves sum without returning, so nothing more is printed before the handler.',
        ),
        choose(
          'A helper throws, its caller has no try block, and main wraps the call in a try with a matching catch. Where is the exception handled?',
          [
            'In the helper, which catches its own exceptions',
            'In the caller, which receives a default value',
            'Nowhere; an exception without a nearby try is lost',
            'In main’s handler, after leaving the helper and caller',
          ],
          3,
          'The exception unwinds through every function without a matching handler.',
        ),
      ],
    },
  ],
  'cpp-bounds-exception': [
    {
      title: 'at() checks the index; [] does not',
      explanation: [
        'v.at(i) returns the element at index i after checking that i < v.size(); if the check fails, it throws std::out_of_range. v[i] performs no check: an invalid index is undefined behavior, not an exception.',
        'Use at() when the interface promises checked access, and handle the exception deliberately.',
      ],
      example: {
        language: 'cpp',
        code: `#include <iostream>
#include <stdexcept>
#include <vector>
int main() {
  std::vector<int> levels{4, 9};
  std::cout << levels.at(1) << "\\n";
  try {
    std::cout << levels.at(2) << "\\n";
  } catch (const std::out_of_range&) {
    std::cout << "out of range\\n";
  }
}`,
        output: '9\nout of range',
        explanation:
          'Index 1 is valid. Index 2 equals size(), so at() throws before anything is printed for it.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `#include <iostream>
#include <stdexcept>
#include <vector>
int main() {
  std::vector<int> v{1, 2, 3};
  int value = -1;
  try {
    value = v.at(3);
  } catch (const std::out_of_range&) {
  }
  std::cout << value << "\\n";
}`,
          ['3', '0', '-1', '1'],
          2,
          'at(3) throws before the assignment, so value keeps -1.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <iostream>
#include <stdexcept>
#include <vector>
int main() {
  std::vector<int> v{7};
  try {
    std::cout << v.at(0) << " ";
    std::cout << v.at(1) << " ";
  } catch (const std::out_of_range&) {
    std::cout << "stop";
  }
  std::cout << "\\n";
}`,
          ['7 stop', '7 0 stop', 'stop', '7 7 stop'],
          0,
          'Index 0 is valid. Index 1 throws, so the handler prints stop.',
        ),
        choose(
          'What does v[5] do when v has 3 elements?',
          [
            'Throws std::out_of_range, like at()',
            'Returns 0 for any missing element',
            'Returns the last element instead',
            'Undefined behavior; [] does not check',
          ],
          3,
          'Only at() checks; [] trusts the caller.',
        ),
        choose(
          'Which access reports an invalid index with an exception?',
          ['v[i]', 'v.front()', 'v.at(i)', '*(v.begin() + i)'],
          2,
          'at() is the checked accessor; the others assume a valid position.',
        ),
      ],
    },
    {
      title: 'The last valid index is size() - 1',
      explanation: [
        'Valid indexes run from 0 to size() - 1, so at(size()) always throws; this off-by-one is the most common out_of_range. An empty vector has no valid index at all.',
        'size() is unsigned, so size() - 1 on an empty vector wraps around to a huge number, which at() also rejects.',
      ],
      example: {
        language: 'cpp',
        code: `#include <iostream>
#include <stdexcept>
#include <vector>
int main() {
  std::vector<int> v{3, 6, 9};
  try {
    std::cout << v.at(v.size() - 1) << "\\n";
    std::cout << v.at(v.size()) << "\\n";
  } catch (const std::out_of_range&) {
    std::cout << "past the end\\n";
  }
}`,
        output: '9\npast the end',
        explanation:
          'size() - 1 is the last element. size() itself is one past the end.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `#include <cstddef>
#include <iostream>
#include <stdexcept>
#include <vector>
int safe_get(const std::vector<int>& values, std::size_t index) {
  try {
    return values.at(index);
  } catch (const std::out_of_range&) {
    return -1;
  }
}
int main() {
  std::vector<int> v{8};
  std::cout << safe_get(v, 0) << " " << safe_get(v, 1) << "\\n";
}`,
          ['8 8', '8 0', '-1 -1', '8 -1'],
          3,
          'With one element, index 0 is the only valid index.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <iostream>
#include <stdexcept>
#include <vector>
int main() {
  std::vector<int> v;
  try {
    std::cout << v.at(v.size() - 1) << "\\n";
  } catch (const std::out_of_range&) {
    std::cout << "no last element\\n";
  }
}`,
          ['0', '-1', 'no last element', '18446744073709551615'],
          2,
          'size() - 1 wraps to the largest size_t value on an empty vector, and at() rejects it.',
        ),
        choose(
          'A vector has 4 elements. Which call throws?',
          ['v.at(0)', 'v.at(3)', 'v.at(4)', 'v.at(2)'],
          2,
          'Valid indexes are 0 to 3.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <iostream>
#include <stdexcept>
#include <vector>
int main() {
  std::vector<int> v;
  try {
    std::cout << v.at(0) << "\\n";
  } catch (const std::out_of_range&) {
    std::cout << "empty\\n";
  }
}`,
          ['0', 'empty', '-1', 'garbage'],
          1,
          'An empty vector has no index 0, so at(0) throws.',
        ),
      ],
    },
  ],
  'cpp-strong-guarantee': [
    {
      title: 'Validate before changing anything',
      explanation: [
        'An operation gives the strong exception guarantee when, if it fails, all observable state is exactly as it was before the call. The simplest way to achieve it is to perform every check that can throw first, and modify state only after all of them pass.',
      ],
      example: {
        language: 'cpp',
        code: `#include <iostream>
#include <stdexcept>
void set_price(int& price, int replacement) {
  if (replacement < 0) throw std::invalid_argument("negative price");
  price = replacement;
}
int main() {
  int price = 4;
  try {
    set_price(price, 9);
    set_price(price, -2);
  } catch (const std::invalid_argument&) {
  }
  std::cout << price << "\\n";
}`,
        output: '9',
        explanation:
          'The first call succeeds. The second throws before the assignment, so price keeps 9.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `#include <iostream>
#include <stdexcept>
void set_price(int& price, int replacement) {
  if (replacement < 0) throw std::invalid_argument("negative price");
  price = replacement;
}
int main() {
  int price = 5;
  try {
    set_price(price, -1);
  } catch (const std::invalid_argument&) {
  }
  std::cout << price << "\\n";
}`,
          ['-1', '0', '5', '4'],
          2,
          'The check throws before anything is assigned.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <iostream>
#include <stdexcept>
void set_range(int& low, int& high, int new_low, int new_high) {
  if (new_low > new_high) throw std::invalid_argument("inverted");
  low = new_low;
  high = new_high;
}
int main() {
  int low = 1;
  int high = 5;
  try {
    set_range(low, high, 2, 8);
    set_range(low, high, 9, 3);
  } catch (const std::invalid_argument&) {
  }
  std::cout << low << " " << high << "\\n";
}`,
          ['9 3', '2 8', '1 5', '9 8'],
          1,
          'The valid update is applied; the inverted one is rejected before either member changes.',
        ),
        choose(
          'What does the strong exception guarantee promise when an operation throws?',
          [
            'The program continues as if the operation had succeeded',
            'No exception ever leaves the operation',
            'Observable state is exactly as it was before the call',
            'Partial changes are completed later',
          ],
          2,
          'Failure has no visible effect: commit-or-nothing.',
        ),
        choose(
          'Which ordering gives set_price the strong guarantee?',
          [
            'Validate and throw if invalid, then assign',
            'Assign, then validate and throw if invalid',
            'Assign 0 first, then validate',
            'Assign, and validate after returning',
          ],
          0,
          'Every throwing step must come before the first modification.',
        ),
      ],
    },
    {
      title: 'Changing before validating leaks partial updates',
      explanation: [
        'If a function modifies some state and then throws, the caller sees a half-finished update. Clearing a destination before validating its replacement, or updating one of two related values before checking them together, leaves the object in a state nobody asked for.',
      ],
      example: {
        language: 'cpp',
        code: `#include <iostream>
#include <stdexcept>
void set_range_unsafe(int& low, int& high, int new_low, int new_high) {
  low = new_low;
  if (new_low > new_high) throw std::invalid_argument("inverted");
  high = new_high;
}
int main() {
  int low = 1;
  int high = 5;
  try {
    set_range_unsafe(low, high, 9, 3);
  } catch (const std::invalid_argument&) {
    std::cout << "rejected ";
  }
  std::cout << low << " " << high << "\\n";
}`,
        output: 'rejected 9 5',
        explanation:
          'The update was rejected, yet low already changed to 9, leaving an inverted range 9..5.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `#include <iostream>
#include <stdexcept>
void replace(int& destination, int replacement) {
  destination = 0;
  if (replacement < 0) throw std::invalid_argument("negative");
  destination = replacement;
}
int main() {
  int destination = 4;
  try {
    replace(destination, -2);
  } catch (const std::invalid_argument&) {
  }
  std::cout << destination << "\\n";
}`,
          ['4', '0', '-2', '2'],
          1,
          'The destination was cleared before the check failed, so the old value is lost.',
        ),
        predictOutput(
          'The same unsafe function gets valid input. What does this program print?',
          `#include <iostream>
#include <stdexcept>
void set_range_unsafe(int& low, int& high, int new_low, int new_high) {
  low = new_low;
  if (new_low > new_high) throw std::invalid_argument("inverted");
  high = new_high;
}
int main() {
  int low = 1;
  int high = 5;
  set_range_unsafe(low, high, 2, 8);
  std::cout << low << " " << high << "\\n";
}`,
          ['1 5', '2 5', '2 8', '8 2'],
          2,
          'With valid input nothing throws, so the bug is invisible; tests must include a failing case.',
        ),
        choose(
          'A transfer function subtracts from the source account, then validates the destination and throws. What does a caller observe after catching?',
          [
            'Both balances unchanged, as before the call',
            'Both balances updated, as if it succeeded',
            'The destination credited twice, the source once',
            'Money removed from the source, added nowhere',
          ],
          3,
          'The subtraction happened before the throw and was never undone.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <iostream>
#include <stdexcept>
void record(int& count, int& total, int amount) {
  ++count;
  if (amount < 0) throw std::invalid_argument("negative");
  total += amount;
}
int main() {
  int count = 0;
  int total = 0;
  try {
    record(count, total, 5);
    record(count, total, -1);
  } catch (const std::invalid_argument&) {
  }
  std::cout << count << " " << total << "\\n";
}`,
          ['1 5', '2 5', '2 4', '1 4'],
          1,
          'count was incremented before the failed check, so it no longer matches the one amount recorded in total.',
        ),
      ],
    },
    {
      title: 'Work on a copy, then commit',
      explanation: [
        'When checks happen during the work rather than before it, compute the new state in a local copy and assign it to the real object only at the end. If anything throws earlier, the caller’s object was never touched.',
      ],
      example: {
        language: 'cpp',
        code: `#include <iostream>
#include <stdexcept>
void apply_changes(int& balance, int first, int second) {
  int updated = balance;
  updated += first;
  if (updated < 0) throw std::invalid_argument("overdrawn");
  updated += second;
  if (updated < 0) throw std::invalid_argument("overdrawn");
  balance = updated;
}
int main() {
  int balance = 10;
  try {
    apply_changes(balance, -4, -8);
  } catch (const std::invalid_argument&) {
    std::cout << "rejected ";
  }
  std::cout << balance << "\\n";
  apply_changes(balance, -4, 3);
  std::cout << balance << "\\n";
}`,
        output: 'rejected 10\n9',
        explanation:
          'The first call fails at the second check, but only the local copy had changed. The second call passes both checks and commits 9.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `#include <iostream>
#include <stdexcept>
void apply_changes(int& balance, int first, int second) {
  int updated = balance;
  updated += first;
  if (updated < 0) throw std::invalid_argument("overdrawn");
  updated += second;
  if (updated < 0) throw std::invalid_argument("overdrawn");
  balance = updated;
}
int main() {
  int balance = 5;
  try {
    apply_changes(balance, 3, -10);
  } catch (const std::invalid_argument&) {
  }
  std::cout << balance << "\\n";
}`,
          ['5', '-2', '8', '0'],
          0,
          'The copy reached 8 and then -2, which throws; balance was never assigned.',
        ),
        predictOutput(
          'This version changes balance directly. What does it print?',
          `#include <iostream>
#include <stdexcept>
void apply_in_place(int& balance, int first, int second) {
  balance += first;
  if (balance < 0) throw std::invalid_argument("overdrawn");
  balance += second;
  if (balance < 0) throw std::invalid_argument("overdrawn");
}
int main() {
  int balance = 5;
  try {
    apply_in_place(balance, 3, -10);
  } catch (const std::invalid_argument&) {
  }
  std::cout << balance << "\\n";
}`,
          ['5', '8', '-2', '0'],
          2,
          'Both changes were applied to the real balance before the second check threw.',
        ),
        choose(
          'Why does working on a local copy give the strong guarantee?',
          [
            'Local copies cannot throw',
            'The caller’s object is assigned only after every check has passed',
            'Assignment undoes earlier changes',
            'The compiler rolls back the caller’s object automatically',
          ],
          1,
          'All risky steps touch only the copy; the single commit at the end cannot fail.',
        ),
      ],
    },
  ],
  'cpp-exceptions': [
    {
      title: 'noexcept reports a declared contract',
      explanation: [
        'Declaring int f() noexcept promises that f never throws. The noexcept operator, noexcept(expression), is a compile-time bool: true when the expression is declared not to throw.',
        'A function without the noexcept specifier counts as potentially throwing, even if its body could never throw. Built-in operations on ints are non-throwing.',
      ],
      example: {
        language: 'cpp',
        code: `#include <iostream>
int read_value() noexcept { return 7; }
int may_fail() { return 8; }
int main() {
  std::cout << noexcept(read_value()) << " " << noexcept(may_fail()) << "\\n";
}`,
        output: '1 0',
        explanation:
          'read_value is declared noexcept. may_fail cannot actually throw, but it makes no promise, so the operator reports false.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `#include <iostream>
int a() noexcept { return 1; }
int b() { return 2; }
int main() {
  std::cout << noexcept(a()) << " " << noexcept(b()) << " " << noexcept(a() + b()) << "\\n";
}`,
          ['1 0 1', '1 1 0', '1 0 0', '0 0 0'],
          2,
          'An expression is non-throwing only if every call in it is; b() makes the sum potentially throwing.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <iostream>
int main() {
  int x = 3;
  std::cout << noexcept(x + 1) << " " << noexcept(x * 2) << "\\n";
}`,
          ['1 1', '0 0', '4 6', '1 0'],
          0,
          'Built-in arithmetic on ints never throws, and noexcept yields a bool, not the value.',
        ),
        choose(
          'Function g has no noexcept specifier, and its body only adds two ints. What is noexcept(g())?',
          [
            'true, because the body cannot throw',
            'It does not compile',
            'It depends on the arguments',
            'false, because g is not declared noexcept',
          ],
          3,
          'The operator reads the declaration, not the body.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <iostream>
int c() noexcept(false) { return 0; }
int d() noexcept(true) { return 0; }
int main() {
  std::cout << noexcept(c()) << " " << noexcept(d()) << "\\n";
}`,
          ['1 0', '0 1', '0 0', '1 1'],
          1,
          'noexcept(false) declares a potentially throwing function; noexcept(true) is the same as plain noexcept.',
        ),
      ],
    },
    {
      title: 'The operand of noexcept is not evaluated',
      explanation: [
        'Like sizeof, the noexcept operator only inspects its operand; it never runs it. Any side effect written inside noexcept(...) does not happen.',
      ],
      example: {
        language: 'cpp',
        code: `#include <iostream>
int main() {
  int counter = 0;
  bool safe = noexcept(++counter);
  std::cout << safe << " " << counter << "\\n";
}`,
        output: '1 0',
        explanation:
          'Incrementing an int cannot throw, so the result is true, but the increment never executes.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `#include <iostream>
int touch(int& value) noexcept { return ++value; }
int main() {
  int x = 5;
  bool b = noexcept(touch(x));
  std::cout << b << " " << x << "\\n";
}`,
          ['1 6', '1 5', '0 5', '6 5'],
          1,
          'touch is declared noexcept, but it is not called, so x stays 5.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <iostream>
int risky(int& value) { return ++value; }
int main() {
  int x = 5;
  std::cout << noexcept(risky(x)) << " " << x << "\\n";
}`,
          ['0 6', '1 5', '1 6', '0 5'],
          3,
          'risky is not declared noexcept, and the call inside the operator never runs.',
        ),
        choose(
          'What happens to side effects in the expression inside noexcept(...)?',
          [
            'They happen once, as for any expression',
            'They happen only if the result is true',
            'They never happen; the operand is not evaluated',
            'They happen during compilation instead',
          ],
          2,
          'noexcept is an unevaluated context, like sizeof and decltype.',
        ),
      ],
    },
    {
      title: 'Breaking a noexcept promise terminates the program',
      explanation: [
        'noexcept is a contract, not a recovery mechanism. If an exception escapes a function declared noexcept, the program calls std::terminate; no caller’s catch block ever sees it.',
        'Mark a function noexcept only when it cannot throw, or when it catches everything that could be thrown inside it.',
      ],
      example: {
        language: 'cpp',
        code: `#include <iostream>
#include <stdexcept>
int safe_parse(int value) noexcept {
  try {
    if (value < 0) throw std::invalid_argument("negative");
    return value;
  } catch (const std::invalid_argument&) {
    return 0;
  }
}
int main() {
  std::cout << safe_parse(7) << " " << safe_parse(-7) << " " << noexcept(safe_parse(1)) << "\\n";
}`,
        output: '7 0 1',
        explanation:
          'The exception is caught inside safe_parse, so nothing escapes and the noexcept promise holds.',
      },
      questions: [
        choose(
          'An exception escapes a function declared noexcept, and the caller has a matching catch. What happens?',
          [
            'The caller’s matching handler runs as usual',
            'The function returns 0 and execution continues',
            'std::terminate is called; the handler never runs',
            'The exception is silently discarded at the boundary',
          ],
          2,
          'The noexcept boundary stops propagation by ending the program.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <iostream>
#include <stdexcept>
int safe_parse(int value) noexcept {
  try {
    if (value < 0) throw std::invalid_argument("negative");
    return value;
  } catch (const std::invalid_argument&) {
    return 0;
  }
}
int main() {
  std::cout << safe_parse(-3) + safe_parse(4) << "\\n";
}`,
          ['1', '-3', '7', '4'],
          3,
          'The negative input is handled inside the function and becomes 0.',
        ),
        choose(
          'When is marking a function noexcept appropriate?',
          [
            'When it cannot throw, or catches everything inside',
            'Whenever it is always called inside a try block',
            'To make its exceptions easier for callers to catch',
            'Only for functions whose return type is void',
          ],
          0,
          'The promise must be true for every call, because a violation ends the program.',
        ),
        choose(
          'A function declared noexcept calls a helper that may throw and catches nothing. What does noexcept(f()) report?',
          [
            'false, because the helper may throw',
            'It does not compile',
            'true, because f is declared noexcept',
            'It depends on the helper’s arguments',
          ],
          2,
          'The operator trusts the declaration; if the helper does throw at run time, the program terminates.',
        ),
      ],
    },
  ],
  'cpp-virtual-dispatch': [
    {
      title: 'A virtual call uses the object’s real type',
      explanation: [
        'A derived class is written struct Triangle : Shape { ... }. When the base declares a member function virtual and the derived class overrides it, a call through a reference to the base, such as const Shape&, runs the version for the object’s actual type.',
        'Without virtual, the call is chosen from the reference’s type instead. (Bases used this way also declare a virtual destructor, covered in its own lesson.)',
      ],
      example: {
        language: 'cpp',
        code: `#include <iostream>
struct Shape {
  virtual ~Shape() = default;
  virtual int sides() const { return 0; }
};
struct Triangle : Shape {
  int sides() const override { return 3; }
};
int main() {
  Triangle t;
  const Shape& view = t;
  std::cout << view.sides() << "\\n";
}`,
        output: '3',
        explanation:
          'view has type const Shape&, but it refers to a Triangle, so the Triangle override runs.',
      },
      questions: [
        predictOutput(
          'id is not virtual here. What does this program print?',
          `#include <iostream>
struct Base {
  int id() const { return 1; }
};
struct Derived : Base {
  int id() const { return 2; }
};
int main() {
  Derived d;
  const Base& b = d;
  std::cout << b.id() << " " << d.id() << "\\n";
}`,
          ['2 2', '1 2', '1 1', '2 1'],
          1,
          'A non-virtual call is chosen from the static type: through Base& it runs Base::id.',
        ),
        predictOutput(
          'Now id is virtual. What does this program print?',
          `#include <iostream>
struct Base {
  virtual ~Base() = default;
  virtual int id() const { return 1; }
};
struct Derived : Base {
  int id() const override { return 2; }
};
int main() {
  Derived d;
  const Base& b = d;
  std::cout << b.id() << " " << d.id() << "\\n";
}`,
          ['2 2', '1 2', '1 1', '2 1'],
          0,
          'The virtual call through b dispatches to the Derived override.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <iostream>
struct Shape {
  virtual ~Shape() = default;
  virtual int sides() const { return 0; }
};
struct Triangle : Shape {
  int sides() const override { return 3; }
};
struct Square : Shape {
  int sides() const override { return 4; }
};
int count(const Shape& shape) { return shape.sides(); }
int main() {
  Triangle t;
  Square s;
  std::cout << count(t) << " " << count(s) << "\\n";
}`,
          ['0 0', '3 3', '3 4', '4 3'],
          2,
          'One function written against Shape runs each object’s own override.',
        ),
        choose(
          'Through `const Base& view = derived;`, which version of a virtual function runs?',
          [
            'Base’s, because view has type Base',
            'Both, base first',
            'Whichever was declared first',
            'Derived’s, because the object is a Derived',
          ],
          3,
          'Virtual dispatch follows the dynamic type of the object.',
        ),
      ],
    },
    {
      title: 'override catches signature mistakes',
      explanation: [
        'A derived function overrides a virtual function only if its signature matches exactly, including const. If it differs, it is a new, unrelated function, and calls through the base still run the base version.',
        'Writing override asks the compiler to check: a function marked override that matches no virtual base function is an error.',
      ],
      example: {
        language: 'cpp',
        code: `#include <iostream>
struct Base {
  virtual ~Base() = default;
  virtual int read() const { return 1; }
};
struct Derived : Base {
  int read() { return 2; }
};
int main() {
  Derived d;
  const Base& view = d;
  std::cout << view.read() << " " << d.read() << "\\n";
}`,
        output: '1 2',
        explanation:
          'Derived::read lacks const, so it does not override. The call through view still runs Base::read. Adding override would have turned this into a compile error.',
      },
      questions: [
        predictOutput(
          'The derived parameter type differs. What does this program print?',
          `#include <iostream>
struct Base {
  virtual ~Base() = default;
  virtual int scale(int x) const { return x; }
};
struct Derived : Base {
  int scale(long) const { return 99; }
};
int main() {
  Derived d;
  const Base& view = d;
  std::cout << view.scale(5) << "\\n";
}`,
          ['99', '5', '0', '10'],
          1,
          'scale(long) is a different function, so the virtual scale(int) is not overridden.',
        ),
        choose(
          'What does adding override to `int read()` (missing const) in Derived do?',
          [
            'Nothing; override is only documentation for readers',
            'It makes calls through Base run Derived::read anyway',
            'It adds the missing const to Derived::read automatically',
            'It causes a compile error: nothing virtual matches',
          ],
          3,
          'override turns a silent mismatch into a compile error.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <iostream>
struct Base {
  virtual ~Base() = default;
  virtual int read() const { return 1; }
};
struct Derived : Base {
  int read() const override { return 2; }
};
int main() {
  Derived d;
  const Base& view = d;
  std::cout << view.read() << " " << d.read() << "\\n";
}`,
          ['1 2', '1 1', '2 2', '2 1'],
          2,
          'With the matching const signature, Derived::read overrides and both calls run it.',
        ),
        choose(
          'Which declaration in Derived overrides `virtual int read() const` in Base?',
          [
            'int read();',
            'int read() const override;',
            'int read(int) const override;',
            'virtual int read();',
          ],
          1,
          'Name, parameters and const must all match.',
        ),
      ],
    },
    {
      title: 'Program against an abstract interface',
      explanation: [
        'virtual int price(int units) const = 0; declares a pure virtual function. A class with one is abstract: it cannot be instantiated, and every concrete derived class must override the function.',
        'Code written against const Pricer& then works with every implementation, including ones written later.',
      ],
      example: {
        language: 'cpp',
        code: `#include <iostream>
struct Pricer {
  virtual ~Pricer() = default;
  virtual int price(int units) const = 0;
};
struct Flat : Pricer {
  int fee;
  explicit Flat(int f) : fee(f) {}
  int price(int) const override { return fee; }
};
struct PerUnit : Pricer {
  int rate;
  explicit PerUnit(int r) : rate(r) {}
  int price(int units) const override { return rate * units; }
};
int quote(const Pricer& pricer, int units) { return pricer.price(units); }
int main() {
  Flat flat(50);
  PerUnit per_unit(7);
  std::cout << quote(flat, 10) << " " << quote(per_unit, 10) << "\\n";
}`,
        output: '50 70',
        explanation:
          'quote knows only the Pricer interface; each object supplies its own price rule.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `#include <iostream>
struct Pricer {
  virtual ~Pricer() = default;
  virtual int price(int units) const = 0;
};
struct Flat : Pricer {
  int fee;
  explicit Flat(int f) : fee(f) {}
  int price(int) const override { return fee; }
};
struct PerUnit : Pricer {
  int rate;
  explicit PerUnit(int r) : rate(r) {}
  int price(int units) const override { return rate * units; }
};
int quote(const Pricer& pricer, int units) { return pricer.price(units); }
int main() {
  Flat flat(20);
  PerUnit per_unit(4);
  std::cout << quote(flat, 3) + quote(per_unit, 3) << "\\n";
}`,
          ['32', '72', '24', '60'],
          0,
          'The flat fee ignores the units (20); per-unit pricing gives 4 * 3 = 12.',
        ),
        choose(
          'Why does `Pricer p;` fail to compile?',
          [
            'Pricer has no user-written constructor',
            'Pricer has a pure virtual function, so it is abstract',
            'Pricer’s destructor is virtual, which forbids objects',
            'Pricer objects must be created with new instead',
          ],
          1,
          'An abstract class can only be used as the base of a concrete class.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <iostream>
struct Pricer {
  virtual ~Pricer() = default;
  virtual int price(int units) const = 0;
};
struct PerUnit : Pricer {
  int rate;
  explicit PerUnit(int r) : rate(r) {}
  int price(int units) const override { return rate * units; }
};
int quote(const Pricer& pricer, int units) { return pricer.price(units); }
int main() {
  PerUnit cheap(2);
  PerUnit dear(5);
  std::cout << quote(cheap, 4) << " " << quote(dear, 4) << "\\n";
}`,
          ['20 20', '8 8', '8 20', '2 5'],
          2,
          'Both objects use the same override with their own rate.',
        ),
        choose(
          'A new pricing rule is needed. What must change in quote(const Pricer&, int)?',
          [
            'Nothing; a new class overriding price works with it',
            'quote needs a new overload for the new pricing class',
            'Pricer must be edited to list every derived class',
            'quote must check the object’s type before calling',
          ],
          0,
          'That independence from concrete types is the point of the interface.',
        ),
      ],
    },
  ],
  'cpp-virtual-destruction': [
    {
      title: 'A virtual destructor runs the derived cleanup',
      explanation: [
        'std::unique_ptr<Base> owner = std::make_unique<Derived>(); deletes its object through a Base* when owner is destroyed. If Base’s destructor is virtual, that delete runs ~Derived first and then ~Base.',
        'If Base’s destructor is not virtual, deleting a Derived through a Base* is undefined behavior; typically the derived cleanup is skipped.',
      ],
      example: {
        language: 'cpp',
        code: `#include <iostream>
#include <memory>
struct Base {
  virtual ~Base() { std::cout << "~Base\\n"; }
};
struct Derived : Base {
  ~Derived() override { std::cout << "~Derived\\n"; }
};
int main() {
  {
    std::unique_ptr<Base> owner = std::make_unique<Derived>();
  }
  std::cout << "done\\n";
}`,
        output: '~Derived\n~Base\ndone',
        explanation:
          'Leaving the block destroys owner. The virtual destructor dispatches to ~Derived, which then runs ~Base.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `#include <iostream>
#include <memory>
struct Base {
  virtual ~Base() = default;
};
struct Derived : Base {
  int& count;
  explicit Derived(int& c) : count(c) {}
  ~Derived() override { ++count; }
};
int main() {
  int released = 0;
  {
    std::unique_ptr<Base> owner = std::make_unique<Derived>(released);
  }
  std::cout << released << "\\n";
}`,
          ['0', '1', '2', '-1'],
          1,
          'Destroying owner runs ~Derived through the virtual destructor, which increments the counter once.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <iostream>
#include <memory>
struct A {
  virtual ~A() { std::cout << "A "; }
};
struct B : A {
  ~B() override { std::cout << "B "; }
};
struct C : B {
  ~C() override { std::cout << "C "; }
};
int main() {
  {
    std::unique_ptr<A> owner = std::make_unique<C>();
  }
  std::cout << "\\n";
}`,
          ['A B C', 'C B A', 'C A', 'A'],
          1,
          'Destruction runs from the most derived class back to the base.',
        ),
        choose(
          'A Base without a virtual destructor owns a Derived through std::unique_ptr<Base>. What happens when the pointer is destroyed?',
          [
            'Only ~Base runs, which is safe because Base owns nothing',
            '~Derived runs automatically anyway, then ~Base',
            'Compilation fails, because unique_ptr requires virtual',
            'Undefined behavior: deleting through Base* needs virtual',
          ],
          3,
          'The delete must find the most derived destructor, which requires virtual dispatch.',
        ),
        predictOutput(
          'The owner is cleared early. What does this program print?',
          `#include <iostream>
#include <memory>
struct Base {
  virtual ~Base() { std::cout << "~Base\\n"; }
};
struct Derived : Base {
  ~Derived() override { std::cout << "~Derived\\n"; }
};
int main() {
  std::unique_ptr<Base> owner = std::make_unique<Derived>();
  owner = nullptr;
  std::cout << "after reset\\n";
}`,
          [
            'after reset\n~Derived\n~Base',
            '~Base\nafter reset',
            '~Derived\n~Base\nafter reset',
            'after reset',
          ],
          2,
          'Assigning nullptr deletes the owned object immediately, before the next line runs.',
        ),
      ],
    },
    {
      title: 'Declare the base destructor virtual once',
      explanation: [
        'Once a base declares virtual ~Base() = default;, every derived destructor is virtual too, whether it is written out or generated. A class meant to own derived objects through base pointers needs that one declaration.',
        'When the exact type is known, as for a local Derived variable, the right destructors run either way; the virtual destructor matters for deletion through a base pointer.',
      ],
      example: {
        language: 'cpp',
        code: `#include <iostream>
#include <memory>
struct Base {
  virtual ~Base() = default;
};
struct Logger : Base {
  int& closed;
  explicit Logger(int& c) : closed(c) {}
  ~Logger() override { ++closed; }
};
int main() {
  int closed = 0;
  {
    std::unique_ptr<Base> a = std::make_unique<Logger>(closed);
    std::unique_ptr<Base> b = std::make_unique<Logger>(closed);
  }
  std::cout << closed << "\\n";
}`,
        output: '2',
        explanation:
          'Each owner deletes its own Logger through Base*, and each ~Logger runs.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `#include <iostream>
#include <memory>
struct Base {
  virtual ~Base() = default;
};
struct Logger : Base {
  int& closed;
  explicit Logger(int& c) : closed(c) {}
  ~Logger() override { ++closed; }
};
int main() {
  int closed = 0;
  std::unique_ptr<Base> a = std::make_unique<Logger>(closed);
  std::unique_ptr<Base> b = std::make_unique<Logger>(closed);
  a = nullptr;
  std::cout << closed << "\\n";
}`,
          ['0', '2', '1', '3'],
          2,
          'Only a’s Logger has been deleted when the count is printed; b still owns its object.',
        ),
        choose(
          'Which base declaration makes destroying derived objects through std::unique_ptr<Base> safe?',
          [
            '~Base() noexcept = default;',
            'virtual Base() = default;',
            'virtual void close() = 0;',
            'virtual ~Base() = default;',
          ],
          3,
          'The destructor itself must be virtual; constructors cannot be virtual.',
        ),
        predictOutput(
          'The Derived object here is a local variable. What does this program print?',
          `#include <iostream>
struct Base {
  ~Base() { std::cout << "~Base "; }
};
struct Derived : Base {
  ~Derived() { std::cout << "~Derived "; }
};
int main() {
  {
    Derived d;
  }
  std::cout << "\\n";
}`,
          ['~Base', '~Derived ~Base', '~Base ~Derived', '~Derived'],
          1,
          'The exact type is known, so both destructors run in order even without virtual.',
        ),
        choose(
          'Why is the virtual destructor needed for std::unique_ptr<Base> but not for a local Derived variable?',
          [
            'Deleting through Base* must find ~Derived at run time; a local’s type is known',
            'Local variables are never destroyed, so no destructor is needed',
            'unique_ptr cannot call a destructor that is not virtual at all',
            'It is needed in both cases, or ~Derived is skipped for locals too',
          ],
          0,
          'Virtual dispatch is required only when the static type differs from the object’s real type.',
        ),
      ],
    },
  ],
  'cpp-avoid-slicing': [
    {
      title: 'Copying into a base value slices the object',
      explanation: [
        'Base copy = derived; copies only the Base part of the object into a new, genuine Base. The derived members and behavior are gone, so a virtual call on copy runs Base’s version.',
        'A reference, const Base& ref = derived;, copies nothing and keeps dynamic dispatch.',
      ],
      example: {
        language: 'cpp',
        code: `#include <iostream>
struct Base {
  virtual ~Base() = default;
  virtual int read() const { return 1; }
};
struct Derived : Base {
  int read() const override { return 2; }
};
int main() {
  Derived object;
  Base copy = object;
  const Base& view = object;
  std::cout << copy.read() << " " << view.read() << "\\n";
}`,
        output: '1 2',
        explanation:
          'copy is a separate Base object; view still refers to the Derived.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `#include <iostream>
struct Base {
  virtual ~Base() = default;
  virtual int value() const { return 0; }
};
struct Derived : Base {
  int extra;
  explicit Derived(int e) : extra(e) {}
  int value() const override { return extra; }
};
int main() {
  Derived d(5);
  Base copy = d;
  const Base& ref = d;
  std::cout << copy.value() << " " << ref.value() << "\\n";
}`,
          ['5 5', '0 0', '5 0', '0 5'],
          3,
          'The copy has no extra member and runs Base::value; the reference reaches the Derived.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <iostream>
struct Base {
  virtual ~Base() = default;
  virtual int read() const { return 1; }
};
struct Derived : Base {
  int read() const override { return 2; }
};
int main() {
  Derived d;
  Base b;
  b = d;
  std::cout << b.read() << "\\n";
}`,
          ['1', '2', '3', '0'],
          0,
          'Assigning to an existing Base copies only the base part; b stays a Base.',
        ),
        choose(
          'Why does a sliced copy run Base’s version of a virtual function?',
          [
            'Virtual calls are disabled on any copied object',
            'The copy is a genuine Base; the derived part was never copied',
            'The compiler chooses the version by declaration order',
            'The copy still refers to the original Derived object',
          ],
          1,
          'A Base object has Base’s dynamic type, whatever it was copied from.',
        ),
      ],
    },
    {
      title: 'Pass polymorphic objects by reference',
      explanation: [
        'A parameter of type Base, passed by value, slices every derived argument. A const Base& parameter refers to the caller’s object and keeps virtual dispatch.',
      ],
      example: {
        language: 'cpp',
        code: `#include <iostream>
struct Base {
  virtual ~Base() = default;
  virtual int read() const { return 1; }
};
struct Derived : Base {
  int read() const override { return 2; }
};
int by_value(Base item) { return item.read(); }
int by_ref(const Base& item) { return item.read(); }
int main() {
  Derived d;
  std::cout << by_value(d) << " " << by_ref(d) << "\\n";
}`,
        output: '1 2',
        explanation:
          'by_value receives a sliced Base copy; by_ref sees the Derived object.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `#include <iostream>
struct Base {
  virtual ~Base() = default;
  virtual int read() const { return 1; }
};
struct Two : Base {
  int read() const override { return 2; }
};
struct Three : Base {
  int read() const override { return 3; }
};
int by_ref(const Base& item) { return item.read(); }
int main() {
  Two a;
  Three b;
  std::cout << by_ref(a) << " " << by_ref(b) << "\\n";
}`,
          ['1 1', '2 3', '3 2', '2 2'],
          1,
          'The reference parameter preserves each argument’s dynamic type.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <iostream>
struct Base {
  virtual ~Base() = default;
  virtual int read() const { return 1; }
};
struct Two : Base {
  int read() const override { return 2; }
};
struct Three : Base {
  int read() const override { return 3; }
};
int by_value(Base item) { return item.read(); }
int main() {
  Two a;
  Three b;
  std::cout << by_value(a) + by_value(b) << "\\n";
}`,
          ['5', '4', '2', '6'],
          2,
          'Both arguments are sliced to Base, so each call returns 1.',
        ),
        choose(
          'Which parameter type keeps virtual dispatch for every derived argument?',
          ['Base', 'Base copy', 'const Base&', 'Derived'],
          2,
          'Only a reference (or pointer) avoids creating a new Base object.',
        ),
        choose(
          'A function takes Base by value and is called with a Derived. What does the function receive?',
          [
            'A new Base copied from the Derived’s base part',
            'The whole Derived object, including its members',
            'A reference to the caller’s Derived object',
            'Nothing; the call does not compile at all',
          ],
          0,
          'Pass-by-value copy-constructs a Base, slicing the argument.',
        ),
      ],
    },
  ],
  'cpp-polymorphism': [
    {
      title: 'Store a collaborator as a member',
      explanation: [
        'Composition builds an object from other objects: struct Processor { Scale scale; int result() const { return scale.apply(2); } }; holds a Scale and delegates part of its work to it. Processor{{3}} initializes the member with nested braces.',
      ],
      example: {
        language: 'cpp',
        code: `#include <iostream>
struct Scale {
  int factor;
  int apply(int x) const { return factor * x; }
};
struct Processor {
  Scale scale;
  int result() const { return scale.apply(2); }
};
int main() {
  Processor processor{{3}};
  std::cout << processor.result() << "\\n";
}`,
        output: '6',
        explanation:
          'The inner braces build the Scale member with factor 3, and result asks it to scale 2.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `#include <iostream>
struct Tax {
  int percent;
  int on(int amount) const { return amount * percent / 100; }
};
struct Invoice {
  Tax tax;
  int net;
  int total() const { return net + tax.on(net); }
};
int main() {
  Invoice invoice{{20}, 50};
  std::cout << invoice.total() << "\\n";
}`,
          ['70', '60', '10', '50'],
          1,
          'The Tax member computes 20% of 50, which is 10, added to the net 50.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <iostream>
struct Scale {
  int factor;
  int apply(int x) const { return factor * x; }
};
struct Processor {
  Scale scale;
  int result() const { return scale.apply(2); }
};
int main() {
  Processor a{{3}};
  Processor b{{5}};
  std::cout << a.result() << " " << b.result() << "\\n";
}`,
          ['6 6', '3 5', '10 6', '6 10'],
          3,
          'Each Processor owns its own Scale with its own factor.',
        ),
        choose(
          'Processor contains a Scale member and calls scale.apply. What is the relationship?',
          [
            'Processor is a Scale',
            'Processor has a Scale',
            'Scale is a Processor',
            'Processor overrides Scale',
          ],
          1,
          'A member expresses "has-a"; inheritance expresses "is-a".',
        ),
      ],
    },
    {
      title: 'Inherit for an interface; compose for an implementation',
      explanation: [
        'Use public inheritance when the derived type must be usable wherever the base interface is expected. To reuse a helper’s code, hold the helper as a member instead: inheriting from it would make all its public members part of your type’s interface and tie your type to it.',
      ],
      example: {
        language: 'cpp',
        code: `#include <iostream>
struct Counter {
  int count;
  void add() { ++count; }
};
struct Session {
  Counter requests;
  void handle() { requests.add(); }
  int handled() const { return requests.count; }
};
int main() {
  Session session{{0}};
  session.handle();
  session.handle();
  std::cout << session.handled() << "\\n";
}`,
        output: '2',
        explanation:
          'Session uses a Counter internally; callers see only handle and handled, not add or count.',
      },
      questions: [
        choose(
          'A Report class needs a Formatter’s helper function but should not be usable as a Formatter. Which design fits?',
          [
            'struct Report : Formatter { ... };',
            'struct Formatter : Report { ... };',
            'struct Report { Formatter formatter; ... };',
            'Copy the helper into a global function',
          ],
          2,
          'A member gives Report the behavior without claiming that a Report is a Formatter.',
        ),
        choose(
          'When is public inheritance the right tool?',
          [
            'When the derived type must work wherever the base is expected',
            'Whenever one class needs to reuse another class’s code',
            'When two classes happen to have members with the same names',
            'Only when the base class has no virtual functions at all',
          ],
          0,
          'Inheritance is a promise of substitutability, not just a way to share code.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <iostream>
struct Counter {
  int count;
  void add() { ++count; }
};
struct Session {
  Counter requests;
  void handle() { requests.add(); }
  int handled() const { return requests.count; }
};
int main() {
  Session first{{0}};
  Session second{{0}};
  first.handle();
  first.handle();
  second.handle();
  first.handle();
  std::cout << first.handled() << " " << second.handled() << "\\n";
}`,
          ['4 0', '3 1', '1 3', '4 4'],
          1,
          'Each Session has its own Counter member.',
        ),
        choose(
          'Session inherits publicly from Counter only to reuse add(). What is the drawback?',
          [
            'Callers can call add() on a Session directly, bypassing handle()',
            'Session can no longer call add() from inside handle()',
            'Inheritance makes every call to add() slower at run time',
            'There is none; inheritance and a member behave the same',
          ],
          0,
          'Public inheritance exposes the helper’s whole interface as part of Session’s.',
        ),
      ],
    },
  ],
  'cpp-declaration-definition': [
    {
      title: 'Declare before use, define once',
      explanation: [
        'A declaration such as int twice(int value); introduces a function’s name and signature so that code can call it. A definition supplies the body. A call may appear before the definition as long as a declaration comes first.',
        'The compiler checks each call against the declaration; the linker later connects the call to the single definition, which may appear later in the file or in another source file.',
      ],
      example: {
        language: 'cpp',
        code: `#include <iostream>
int twice(int value);
int main() {
  std::cout << twice(21) << "\\n";
}
int twice(int value) { return value * 2; }`,
        output: '42',
        explanation:
          'The declaration above main makes the call valid; the definition below main supplies the body.',
      },
      questions: [
        predictOutput(
          'The same function is declared twice. What does this program print?',
          `#include <iostream>
int add(int a, int b);
int add(int a, int b);
int main() {
  std::cout << add(2, 3) << "\\n";
}
int add(int a, int b) { return a + b; }`,
          ['5', '10', '23', '6'],
          0,
          'Repeating a declaration is allowed; there is still exactly one definition.',
        ),
        choose(
          'main calls total() before total’s definition, which appears later in the file. What must come before main?',
          [
            'A second definition of total',
            'A declaration such as int total();',
            'Nothing; the compiler reads ahead',
            'An #include of a header named total',
          ],
          1,
          'The compiler reads top to bottom and needs a declaration before the first call.',
        ),
        choose(
          'A function is declared and called but never defined anywhere in the program. When is the problem reported?',
          [
            'At compile time, at the declaration',
            'At run time, when the call executes',
            'At link time, as an undefined reference',
            'Never; the call returns 0',
          ],
          2,
          'Each call compiles against the declaration; only the linker discovers that no definition exists.',
        ),
        predictOutput(
          'The declaration omits the parameter names. What does this program print?',
          `#include <iostream>
int area(int, int);
int main() {
  std::cout << area(3, 4) << "\\n";
}
int area(int width, int height) { return width * height; }`,
          ['7', '34', '0', '12'],
          3,
          'Parameter names in a declaration are optional; only the types form the signature.',
        ),
      ],
    },
    {
      title: 'The declaration and definition must match',
      explanation: [
        'A definition matches a declaration only if the signature is identical. If the parameter types differ, the "definition" is really a separate overload. Callers that use the declared signature then find no definition, and the link fails, or they quietly reach a different overload than intended.',
        'An ordinary function must be defined exactly once in the whole program.',
      ],
      example: {
        language: 'cpp',
        code: `#include <iostream>
int scale(int value);
double scale(double value) { return value * 3; }
int scale(int value) { return value * 2; }
int main() {
  std::cout << scale(5) << " " << scale(5.0) << "\\n";
}`,
        output: '10 15',
        explanation:
          'scale(double) is a different function from the declared scale(int). Each call picks the overload that matches its argument.',
      },
      questions: [
        choose(
          'A header declares int adjust(int);, but the source file defines int adjust(double v) { ... }. A caller writes adjust(4). What happens?',
          [
            'adjust(double) is called, with 4 converted to 4.0',
            'The compiler merges the two into one function',
            'The call compiles and returns 0 at run time',
            'It calls adjust(int), which has no definition: link error',
          ],
          3,
          'The caller sees only the declared int version; the double function is an unrelated overload.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <iostream>
int scale(int value);
double scale(double value) { return value * 3; }
int scale(int value) { return value * 2; }
int main() {
  std::cout << scale(2) << " " << scale(2.5) << "\\n";
}`,
          ['4 7', '4 5', '6 7.5', '4 7.5'],
          3,
          'scale(2) uses the int version; scale(2.5) uses the double version, which returns 7.5.',
        ),
        choose(
          'Which pair is a matching declaration and definition?',
          [
            'int f(int); and int f(long x) { ... }',
            'int f(int); and int f(int x) { ... }',
            'int f(int); and int f() { ... }',
            'int f(int); and int f(int x, int y) { ... }',
          ],
          1,
          'Only identical parameter types make the definition belong to the declaration.',
        ),
        choose(
          'How many times may an ordinary (non-inline) function be defined in a whole program?',
          [
            'Once per source file that calls it',
            'Any number of times, if the bodies match',
            'Exactly once',
            'Twice: once declared and once defined',
          ],
          2,
          'The one-definition rule allows many declarations but a single definition.',
        ),
      ],
    },
  ],
  'cpp-namespace-qualified': [
    {
      title: 'Qualify a name with its namespace',
      explanation: [
        'namespace pricing { ... } groups names under pricing. Outside the namespace, a member is named pricing::adjust. Two namespaces can each contain an adjust without conflict, because their qualified names differ; std::cout works the same way.',
      ],
      example: {
        language: 'cpp',
        code: `#include <iostream>
namespace pricing {
int adjust(int value) { return value + 3; }
}
namespace shipping {
int adjust(int value) { return value * 2; }
}
int main() {
  std::cout << pricing::adjust(4) << " " << shipping::adjust(4) << "\\n";
}`,
        output: '7 8',
        explanation: 'The qualifier picks which adjust runs.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `#include <iostream>
namespace pricing {
int adjust(int value) { return value + 3; }
}
namespace shipping {
int adjust(int value) { return value * 2; }
}
int main() {
  std::cout << shipping::adjust(pricing::adjust(1)) << "\\n";
}`,
          ['5', '8', '6', '4'],
          1,
          'The inner call gives 1 + 3 = 4, and the outer call doubles it.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <iostream>
namespace config {
int limit = 10;
}
int limit = 3;
int main() {
  std::cout << limit + config::limit << "\\n";
}`,
          ['20', '6', '13', '10'],
          2,
          'The unqualified limit is the outer one, 3; config::limit is 10.',
        ),
        choose(
          'Two libraries both define a function named parse. How can one program use both?',
          [
            'Each library uses its own namespace; callers write lib_a::parse or lib_b::parse',
            'Rename one of the two functions at run time, before the first call',
            'Call parse twice and keep whichever result the second call returns',
            'It is impossible; one library has to be removed from the program',
          ],
          0,
          'Namespaces make otherwise identical names distinct.',
        ),
        choose(
          'What does std:: mean in std::cout?',
          [
            'cout is a standard type',
            'cout is a static variable',
            'cout is defined in the current file',
            'cout is declared in namespace std',
          ],
          3,
          'The standard library places its names in namespace std.',
        ),
      ],
    },
    {
      title: 'Unqualified names are found from the inside out',
      explanation: [
        'Inside namespace pricing, a plain adjust finds pricing::adjust first, which hides an adjust declared in an enclosing scope. Outside, the plain name means the outer one.',
        'A using-declaration, using pricing::adjust;, brings one name into the current scope. using namespace pricing; brings every name, which can make calls ambiguous when two namespaces declare the same name.',
      ],
      example: {
        language: 'cpp',
        code: `#include <iostream>
int adjust(int value) { return value - 1; }
namespace pricing {
int adjust(int value) { return value + 3; }
int final_price(int value) { return adjust(value) * 10; }
}
int main() {
  std::cout << pricing::final_price(2) << " " << adjust(2) << "\\n";
}`,
        output: '50 1',
        explanation:
          'Inside pricing, adjust means pricing::adjust: (2 + 3) * 10. In main, the plain adjust is the outer one.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `#include <iostream>
int adjust(int value) { return value - 1; }
namespace pricing {
int adjust(int value) { return value + 3; }
int final_price(int value) { return adjust(value) * 10; }
}
int main() {
  std::cout << pricing::final_price(1) << " " << adjust(1) << "\\n";
}`,
          ['0 0', '40 0', '40 4', '0 4'],
          1,
          'final_price uses pricing::adjust, giving 40; main’s plain adjust subtracts 1.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <iostream>
int adjust(int value) { return value - 1; }
namespace pricing {
int adjust(int value) { return value + 3; }
}
int main() {
  std::cout << adjust(2) << " ";
  using pricing::adjust;
  std::cout << adjust(2) << "\\n";
}`,
          ['5 5', '1 1', '1 5', '5 1'],
          2,
          'Before the using-declaration the outer adjust is found; after it, pricing::adjust hides the outer one in main.',
        ),
        choose(
          '`using namespace a; using namespace b;` and both a and b declare int f(int). What happens with f(1)?',
          [
            'a::f is called because it was listed first',
            'b::f is called because it was listed last',
            'Both are called',
            'The call is ambiguous and does not compile',
          ],
          3,
          'Both names become visible equally, and nothing prefers one over the other.',
        ),
        choose(
          'Why do style guides discourage `using namespace std;` in header files?',
          [
            'It injects every std name into each file that includes it',
            'It makes every standard library function slower',
            'It is not valid C++ inside a header file',
            'It hides std::cout from the files that include it',
          ],
          0,
          'A header’s using-directive affects code its author never sees.',
        ),
      ],
    },
  ],
  'cpp-internal-linkage': [
    {
      title: 'An unnamed namespace keeps a helper private to its file',
      explanation: [
        'Each source file is compiled separately as a translation unit. An ordinary function has external linkage: the linker can connect it to calls from any file. A function inside an unnamed namespace, namespace { ... }, has internal linkage: it is used by its plain name in its own file and is invisible to every other file.',
        'Marking a namespace-scope function static has the same effect.',
      ],
      example: {
        language: 'cpp',
        code: `#include <iostream>
namespace {
int private_adjust(int value) { return value + 4; }
}
int public_price(int value) { return private_adjust(value) * 2; }
int main() {
  std::cout << public_price(5) << "\\n";
}`,
        output: '18',
        explanation:
          'public_price can be called from other files; private_adjust only from this one. Here they compute (5 + 4) * 2.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `#include <iostream>
static int square(int value) { return value * value; }
int main() {
  std::cout << square(3) + square(4) << "\\n";
}`,
          ['49', '25', '14', '7'],
          1,
          'static only limits square to this file; within it, square works normally: 9 + 16.',
        ),
        choose(
          'How is a function in an unnamed namespace called from the same file?',
          [
            'By its plain name, with no qualification',
            'As anonymous::name',
            'Only through a function pointer',
            'It cannot be called',
          ],
          0,
          'The unnamed namespace’s members are visible in the enclosing scope of that file.',
        ),
        choose(
          'Which functions can code in other source files call?',
          [
            'Only functions in unnamed namespaces',
            'Only static functions',
            'Every function in the program, whatever its linkage',
            'Functions with external linkage, declared where they are used',
          ],
          3,
          'Internal linkage hides a name from the linker’s view of other files.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <iostream>
namespace {
int calls = 0;
}
int track() {
  calls += 1;
  return calls;
}
int main() {
  track();
  track();
  std::cout << track() << "\\n";
}`,
          ['1', '0', '3', '2'],
          2,
          'calls is a file-private variable that persists between calls.',
        ),
      ],
    },
    {
      title: 'Internal linkage prevents clashing definitions',
      explanation: [
        'If two source files each define int helper(int) with external linkage, the program contains two definitions of one function. That violates the one-definition rule, and the link typically fails with a duplicate symbol.',
        'Giving each file’s helper internal linkage makes them two unrelated functions, each private to its own file.',
      ],
      example: {
        language: 'cpp',
        code: `#include <iostream>
// a.cpp could hold: namespace { int helper(int v) { return v + 1; } }
// b.cpp could hold: namespace { int helper(int v) { return v * 10; } }
// Each file sees only its own helper. This program is a.cpp's view.
namespace {
int helper(int value) { return value + 1; }
}
int a_result(int value) { return helper(value); }
int main() {
  std::cout << a_result(4) << "\\n";
}`,
        output: '5',
        explanation:
          'With internal linkage, a.cpp’s helper and b.cpp’s helper never meet at link time, so both files can use the name.',
      },
      questions: [
        choose(
          'a.cpp and b.cpp both define `int helper(int v)` at namespace scope with external linkage and different bodies. What happens when they are linked?',
          [
            'The linker picks one definition at random',
            'Each file uses its own definition automatically',
            'It breaks the one-definition rule; linking usually fails',
            'The second definition overrides the first one',
          ],
          2,
          'External linkage means both definitions name the same function.',
        ),
        choose(
          'Which fix lets each file keep its own private helper?',
          [
            'Declare helper once in a shared header file',
            'Put each helper in an unnamed namespace, or make it static',
            'Rename main in one of the two source files',
            'Mark only one of the two helper definitions inline',
          ],
          1,
          'Internal linkage makes the two definitions distinct entities.',
        ),
        choose(
          'A header declares `int helper(int);`, and helper is defined in an unnamed namespace in util.cpp. main.cpp includes the header and calls helper. What happens?',
          [
            'Linking fails: the helper is internal to util.cpp, so the declaration has no definition',
            'It works, because the header declares helper for every file that includes it',
            'The compiler copies the definition from util.cpp into main.cpp automatically',
            'It compiles and links, but helper returns 0 when called from main.cpp',
          ],
          0,
          'The header promises an externally linked helper that no file provides.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <iostream>
namespace {
int helper(int value) { return value * 3; }
}
int first(int value) { return helper(value) + 1; }
int second(int value) { return helper(value) - 1; }
int main() {
  std::cout << first(2) << " " << second(2) << "\\n";
}`,
          ['6 6', '7 5', '7 7', '5 7'],
          1,
          'Both public functions in this file share the private helper.',
        ),
      ],
    },
  ],
  'cpp-build': [
    {
      title: 'inline allows one identical definition per file',
      explanation: [
        'A header is copied into every source file that includes it. An ordinary function or variable defined in a header would therefore be defined once per file, breaking the one-definition rule. Marking it inline permits a definition in each file, and the program behaves as if there were one entity.',
        'inline constexpr int offset = 5; is a header-safe constant. constexpr functions and member functions defined inside a class are implicitly inline.',
      ],
      example: {
        language: 'cpp',
        code: `#include <iostream>
namespace defaults {
inline constexpr int offset = 5;
inline int with_offset(int value) { return value + offset; }
}
int main() {
  std::cout << defaults::with_offset(3) << " " << defaults::offset << "\\n";
}`,
        output: '8 5',
        explanation:
          'Both definitions could live in a header shared by many files; inline makes that legal.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `#include <iostream>
namespace fees {
inline constexpr int base = 2;
inline int total(int units) { return base + units * 3; }
}
int main() {
  std::cout << fees::total(4) << "\\n";
}`,
          ['14', '20', '12', '9'],
          0,
          'total computes 2 + 4 * 3, with multiplication first.',
        ),
        choose(
          'A header defines `int helper() { return 1; }` without inline, and two .cpp files include it. What happens?',
          [
            'Each file gets a private copy automatically',
            'The compiler merges the two copies',
            'Headers cannot contain function definitions',
            'Two definitions of helper exist, so linking fails',
          ],
          3,
          'Including the header twice produces two external definitions of the same function.',
        ),
        choose(
          'Which header-level definition can be included in many files safely?',
          [
            'int limit = 10;',
            'inline constexpr int limit = 10;',
            'int limit() { return 10; }',
            'double limit = 10.0;',
          ],
          1,
          'Only the inline definition may appear once in every file that includes it.',
        ),
        choose(
          'Which functions are implicitly inline?',
          [
            'constexpr functions and members defined inside a class',
            'Every function that returns a value of any type',
            'Only functions declared inside unnamed namespaces',
            'Functions that are declared inside main itself',
          ],
          0,
          'Those are commonly defined in headers, so the language makes them inline automatically.',
        ),
      ],
    },
    {
      title: 'Every definition of an inline entity must be identical',
      explanation: [
        'inline does not merge different definitions. Every file must see exactly the same definition. If two files compile different versions, for example from different header versions, the program has undefined behavior, usually with no diagnostic: different calls may silently use different versions.',
        'Keep the definition in one header that every user includes.',
      ],
      example: {
        language: 'cpp',
        code: `#include <iostream>
namespace limits {
inline constexpr int max_orders = 3;
}
int remaining(int placed) { return limits::max_orders - placed; }
int main() {
  std::cout << remaining(1) << " " << remaining(3) << "\\n";
}`,
        output: '2 0',
        explanation:
          'Every file that includes the header sees the same max_orders, so they all agree on the limit.',
      },
      questions: [
        choose(
          'a.cpp sees `inline int fee() { return 2; }` and b.cpp sees `inline int fee() { return 3; }`. What is guaranteed?',
          [
            'Calls return 2 in a.cpp and 3 in b.cpp',
            'The linker always reports the mismatch as an error',
            'Nothing: the ODR is violated and no diagnostic is required',
            'The larger value is used everywhere in the program',
          ],
          2,
          'The program is ill-formed, and the toolchain is not required to notice.',
        ),
        choose(
          'How do teams keep every definition of an inline entity identical?',
          [
            'Copy it by hand into each source file',
            'Give each file its own slightly different version',
            'Define it once in a header that every user includes',
            'Mark it extern in each file',
          ],
          2,
          'One source of truth guarantees identical definitions.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <iostream>
constexpr int fee(int units) { return units * 2 + 1; }
namespace pricing {
inline constexpr int base = fee(2);
}
int main() {
  std::cout << pricing::base + fee(1) << "\\n";
}`,
          ['6', '8', '7', '5'],
          1,
          'base is fee(2) = 5 and fee(1) is 3.',
        ),
        choose(
          'At namespace scope in a header, how does `inline constexpr int limit = 5;` differ from `static constexpr int limit = 5;`?',
          [
            'inline gives one shared entity; static gives each file its own copy',
            'They are identical in every way, including the number of copies',
            'static gives one shared entity; inline gives each file its own copy',
            'inline lets limit change at run time, while static keeps it fixed',
          ],
          0,
          'static gives internal linkage, so each file has a separate variable; inline keeps one entity.',
        ),
      ],
    },
  ],
  'cpp-assert-contract': [
    {
      title: 'assert checks a condition the code relies on',
      explanation: [
        'assert(condition), from <cassert>, evaluates the condition while the program runs. If it is true, nothing happens and nothing is printed. If it is false, the program prints a diagnostic naming the file, line and expression, then aborts.',
        'Use it to state assumptions the surrounding code depends on, such as a result the function has just computed.',
      ],
      example: {
        language: 'cpp',
        code: `#include <cassert>
#include <iostream>
int add_fee(int value) {
  int result = value + 2;
  assert(result == value + 2);
  return result;
}
int main() {
  std::cout << add_fee(5) << "\\n";
}`,
        output: '7',
        explanation:
          'The assertion holds, so it has no visible effect, and the result prints normally.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `#include <cassert>
#include <iostream>
int main() {
  int a = 4;
  assert(a > 0);
  std::cout << a * 3 << "\\n";
}`,
          ['1', '12', '4', '112'],
          1,
          'A passing assert prints nothing, and the program continues.',
        ),
        choose(
          'What happens when an assert condition is false in a build where assertions are enabled?',
          [
            'A warning is printed and the program continues',
            'The enclosing function returns false',
            'Compilation fails',
            'The program prints a diagnostic and aborts',
          ],
          3,
          'assert is a run-time check that stops the program on failure.',
        ),
        choose(
          'Which is a good use of assert?',
          [
            'assert(index < size) where callers guarantee a valid index',
            'assert(file_opened) to handle a missing file at run time',
            'assert(password_correct) to reject a bad login attempt',
            'assert(input >= 0) as the only check on user input',
          ],
          0,
          'assert documents a programmer’s assumption; failures that users can cause need real handling.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <cassert>
#include <iostream>
bool is_positive(int value) { return value > 0; }
int main() {
  assert(is_positive(3));
  std::cout << is_positive(-1) << "\\n";
}`,
          ['1', 'false', '0', '-1'],
          2,
          'The assertion passes; the printed call returns false, shown as 0.',
        ),
      ],
    },
    {
      title: 'NDEBUG removes assertions',
      explanation: [
        'When the macro NDEBUG is defined, as in many release builds, assert expands to nothing: its condition is not even evaluated. So an assert must never contain work the program needs, and it cannot be the only defense against bad input.',
        'Do the work in its own statement and let the assert check only the result. Validate external input with ordinary code that runs in every build, and keep assert for conditions that indicate a bug.',
      ],
      example: {
        language: 'cpp',
        code: `#include <cassert>
#include <iostream>
int parse_count(int raw) { return raw * 2; }
int main() {
  int count = parse_count(21);
  assert(count == 42);
  std::cout << count << "\\n";
}`,
        output: '42',
        explanation:
          'The call happens in its own statement, so it runs in every build. The assert only checks the result; removing it under NDEBUG changes nothing else.',
      },
      questions: [
        choose(
          'A program contains `assert(++attempts < 5);`. What changes in a build with NDEBUG defined?',
          [
            'Nothing; the increment and check still happen',
            'The assertion becomes a compile-time check',
            'attempts is never incremented: the expression is gone',
            'attempts is incremented twice, once per check',
          ],
          2,
          'With NDEBUG, assert(expr) does not evaluate expr, side effects included.',
        ),
        choose(
          'A server checks client-supplied sizes only with assert. What is the risk?',
          [
            'With NDEBUG the check disappears and bad sizes pass',
            'assert is too slow for code that handles requests',
            'assert rejects valid sizes that are larger than 0',
            'There is no risk, because asserts always run',
          ],
          0,
          'Input validation must run in every build.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <cassert>
#include <iostream>
int total_items(int boxes) { return boxes * 6; }
int main() {
  int items = total_items(4);
  assert(items == 24);
  std::cout << items + total_items(1) << "\\n";
}`,
          ['24', '6', '25', '30'],
          3,
          'The assertion holds and prints nothing; the output is 24 + 6.',
        ),
        choose(
          'Where should a side effect, such as reading the next token, go?',
          [
            'Inside the assert, to keep the code to one line',
            'In its own statement; the assert checks only the result',
            'Inside a static_assert, so it runs while compiling',
            'Nowhere; assertions cannot be used with variables',
          ],
          1,
          'Then removing the assert in release builds removes only the check.',
        ),
      ],
    },
  ],
  'cpp-boundary-case': [
    {
      title: 'Decide what an empty input produces',
      explanation: [
        'Before reading front(), back() or [0], decide what the function returns for an empty vector, and handle that case first. front() on an empty vector is undefined behavior, not an exception.',
        'Boundary values also hide in initial values: starting a maximum at 0 silently assumes the input contains something at least 0.',
      ],
      example: {
        language: 'cpp',
        code: `#include <iostream>
#include <vector>
int first_or(const std::vector<int>& values, int fallback) {
  if (values.empty()) return fallback;
  return values.front();
}
int main() {
  std::cout << first_or({8, 2}, -1) << " " << first_or({}, -1) << "\\n";
}`,
        output: '8 -1',
        explanation:
          'The empty case is answered before front() could be reached.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `#include <iostream>
#include <vector>
int last_or(const std::vector<int>& values) {
  return values.empty() ? -1 : values.back();
}
int main() {
  std::cout << last_or({3, 5, 7}) << " " << last_or({}) << "\\n";
}`,
          ['7 -1', '3 -1', '7 0', '7 7'],
          0,
          'back() is read only for the nonempty vector.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <iostream>
#include <vector>
int largest(const std::vector<int>& values) {
  if (values.empty()) return -1;
  int best = values.front();
  for (int value : values)
    if (value > best) best = value;
  return best;
}
int main() {
  std::cout << largest({4, 9, 2}) << " " << largest({}) << "\\n";
}`,
          ['9 0', '4 -1', '9 -1', '2 -1'],
          2,
          'The maximum starts from a real element, and the empty case returns the agreed -1.',
        ),
        choose(
          'What does values.front() do when values is empty?',
          [
            'Returns 0',
            'Throws std::out_of_range',
            'Returns -1',
            'Undefined behavior',
          ],
          3,
          'front() has a nonempty precondition and does not check it.',
        ),
        predictOutput(
          'This version starts best at 0. What does it print?',
          `#include <iostream>
#include <vector>
int largest(const std::vector<int>& values) {
  int best = 0;
  for (int value : values)
    if (value > best) best = value;
  return best;
}
int main() {
  std::cout << largest({-4, -2}) << "\\n";
}`,
          ['-2', '-4', '0', '-1'],
          2,
          'No element exceeds the starting 0, so the function reports a value that is not in the input.',
        ),
      ],
    },
    {
      title: 'Test the boundaries with assertions',
      explanation: [
        'A function’s contract names its result for each boundary: empty input, a single element, all-equal elements, negative values. A test states each case with an assertion, so a regression stops the test at the exact failing case.',
      ],
      example: {
        language: 'cpp',
        code: `#include <cassert>
#include <iostream>
#include <vector>
int largest(const std::vector<int>& values) {
  if (values.empty()) return -1;
  int best = values.front();
  for (int value : values)
    if (value > best) best = value;
  return best;
}
int main() {
  assert(largest({}) == -1);
  assert(largest({5}) == 5);
  assert(largest({-4, -2}) == -2);
  assert(largest({3, 3}) == 3);
  std::cout << "boundary checks passed\\n";
}`,
        output: 'boundary checks passed',
        explanation:
          'Every assertion holds, so the program reaches the final line.',
      },
      questions: [
        choose(
          'Which input most directly tests that largest does not assume a starting value of 0?',
          ['{3, 8}', '{0}', '{-4, -2}', '{9, 9}'],
          2,
          'Only an all-negative input exposes a maximum that starts at 0.',
        ),
        choose(
          'A test suite checks largest only on {4, 9, 2}. Which bug could it miss?',
          [
            'Reading front() of an empty vector',
            'Returning the smallest value',
            'Ignoring the element 9',
            'Returning the size',
          ],
          0,
          'The other bugs change the answer for this input; the empty case is never exercised.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <iostream>
#include <vector>
int second_or(const std::vector<int>& values) {
  return values.size() < 2 ? -1 : values[1];
}
int main() {
  std::cout << second_or({7}) << " " << second_or({7, 4}) << "\\n";
}`,
          ['7 4', '-1 7', '-1 -1', '-1 4'],
          3,
          'A one-element vector has no index 1, so the guard answers -1.',
        ),
        choose(
          'Which set of inputs covers the boundaries of a function that returns the first element or -1?',
          ['{} and {5}', '{1, 2} and {3, 4}', '{5, 5, 5}', '{100}'],
          0,
          'The empty and single-element cases are where the guard and the read meet.',
        ),
      ],
    },
  ],
  'cpp-property-test': [
    {
      title: 'Check that an inverse undoes an operation',
      explanation: [
        'A round-trip property says that applying an operation and then its inverse gives back the original. std::reverse (from <algorithm>) applied twice restores a range. A test keeps a copy of the input and compares with ==, which for vectors compares sizes and every element.',
      ],
      example: {
        language: 'cpp',
        code: `#include <algorithm>
#include <iostream>
#include <vector>
int main() {
  std::vector<int> values{4, 5, 6};
  auto original = values;
  std::reverse(values.begin(), values.end());
  std::cout << (values == original) << " ";
  std::reverse(values.begin(), values.end());
  std::cout << (values == original) << "\\n";
}`,
        output: '0 1',
        explanation:
          'After one reverse the order differs; after the second, the copy and the vector match again.',
      },
      questions: [
        predictOutput(
          'The input reads the same backwards. What does this program print?',
          `#include <algorithm>
#include <iostream>
#include <vector>
int main() {
  std::vector<int> values{1, 2, 1};
  auto original = values;
  std::reverse(values.begin(), values.end());
  std::cout << (values == original) << "\\n";
}`,
          ['0', '1', '3', '2'],
          1,
          'Reversing a palindrome changes nothing, so this input cannot tell one reverse from two.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <iostream>
#include <vector>
int main() {
  std::vector<int> values{3, -1, 8};
  auto original = values;
  for (int& v : values) v += 3;
  for (int& v : values) v -= 3;
  std::cout << (values == original) << "\\n";
}`,
          ['0', '3', '1', '-1'],
          2,
          'Subtracting 3 exactly undoes adding 3 for these ints.',
        ),
        choose(
          'Why does the round-trip test keep a separate copy named original?',
          [
            'The operation works in place, so the copy keeps the original to compare',
            'Vectors cannot be compared with == unless one of them is a copy',
            'Copying the vector first makes std::reverse run faster',
            'auto requires a copy whenever a vector is passed to an algorithm',
          ],
          0,
          'A vector copy is independent, so later changes to values do not affect it.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <algorithm>
#include <iostream>
#include <vector>
int main() {
  std::vector<int> values{1, 2, 3};
  std::reverse(values.begin(), values.end());
  for (int v : values) std::cout << v << " ";
  std::cout << "\\n";
}`,
          ['1 2 3', '3 1 2', '2 1 3', '3 2 1'],
          3,
          'One reverse puts the elements in the opposite order.',
        ),
      ],
    },
    {
      title: 'One example is not a proof',
      explanation: [
        'A property should hold for every valid input, so test many varied inputs, including boundaries. An operation that is not truly invertible may pass one convenient example and fail others.',
        'Halving and then doubling an int, x / 2 * 2, round-trips for even numbers but not for odd ones, because integer division discards the remainder.',
      ],
      example: {
        language: 'cpp',
        code: `#include <iostream>
#include <vector>
int main() {
  std::vector<int> inputs{8, 7, 0, -6, -3};
  int failures = 0;
  for (int x : inputs)
    if (x / 2 * 2 != x) ++failures;
  std::cout << failures << "\\n";
}`,
        output: '2',
        explanation:
          '7 becomes 6 and -3 becomes -2; the even inputs round-trip.',
      },
      questions: [
        predictOutput(
          'This test uses only even inputs. What does it print?',
          `#include <iostream>
#include <vector>
int main() {
  std::vector<int> inputs{10, 4, 2};
  int failures = 0;
  for (int x : inputs)
    if (x / 2 * 2 != x) ++failures;
  std::cout << failures << "\\n";
}`,
          ['0', '1', '3', '2'],
          0,
          'Every even number survives the round trip, so this test finds no failure and wrongly suggests the property always holds.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <iostream>
#include <vector>
int main() {
  std::vector<int> inputs{1, 2, 3, 4, 5};
  int failures = 0;
  for (int x : inputs)
    if (x / 2 * 2 != x) ++failures;
  std::cout << failures << "\\n";
}`,
          ['2', '5', '3', '0'],
          2,
          'The odd inputs 1, 3 and 5 lose their remainder.',
        ),
        choose(
          'A round-trip test passes for the single input 4. What can you conclude?',
          [
            'The property holds for every integer input',
            'The operation is its own inverse for all values',
            'The test is wrong, because one input is too few',
            'Only that it holds for 4; other inputs may fail',
          ],
          3,
          'A finite set of examples shows the property only for those examples.',
        ),
        choose(
          'Which input set best tests that reversing twice restores a vector?',
          [
            '{1, 2, 3}, {4, 5, 6} and {7, 8, 9}',
            '{}, {7}, {1, 2} and {3, 1, 2}',
            '{5, 5, 5}, {6, 6} and {9, 9, 9, 9}',
            '{} on its own, since it is the boundary',
          ],
          1,
          'It covers empty, single-element, even and odd lengths, with distinct values that reveal order changes.',
        ),
      ],
    },
  ],
  'cpp-testing': [
    {
      title: 'Floating-point results are rounded',
      explanation: [
        'A double stores a binary fraction, so many decimal values, such as 0.1, are stored as close approximations. 0.1 + 0.2 is therefore not exactly the double nearest 0.3, and == reports false.',
        'std::cout shows six significant digits by default, so both values print as 0.3 even though they differ.',
      ],
      example: {
        language: 'cpp',
        code: `#include <iostream>
int main() {
  double sum = 0.1 + 0.2;
  std::cout << sum << " " << (sum == 0.3) << "\\n";
}`,
        output: '0.3 0',
        explanation:
          'The sum prints as 0.3 but differs from 0.3 in its last bits, so the comparison is false.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `#include <iostream>
int main() {
  double a = 0.1 * 3;
  std::cout << (a == 0.3) << "\\n";
}`,
          ['1', '0', '0.3', '3'],
          1,
          'The rounding error in 0.1 is multiplied, so the product is not exactly the stored 0.3.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <iostream>
int main() {
  std::cout << (0.5 + 0.25 == 0.75) << "\\n";
}`,
          ['0', '0.75', '1', '0.5'],
          2,
          '0.5, 0.25 and 0.75 are exact binary fractions, so this sum is exact. The issue is representation, not == itself.',
        ),
        choose(
          'Why does `0.1 + 0.2 == 0.3` evaluate to false?',
          [
            'The + operator truncates doubles to a fixed precision',
            '== cannot compare doubles and always returns false',
            'std::cout rounds the values before they are compared',
            'The values are stored as nearby binary approximations',
          ],
          3,
          'Each literal and the sum are rounded to the nearest double.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <iostream>
int main() {
  std::cout << 0.1 + 0.2 << " " << (0.1 + 0.2 > 0.3) << "\\n";
}`,
          ['0.3 1', '0.3 0', '0.30000000000000004 1', '0.3 0.3'],
          0,
          'The default output rounds to six digits, while the comparison sees that the sum is slightly larger.',
        ),
      ],
    },
    {
      title: 'Compare within a tolerance',
      explanation: [
        'Test a numeric result by checking that its distance from the expected value is small: std::abs(actual - expected) <= tolerance, with std::abs from <cmath>. The absolute value matters: without it, any result below the expected value would pass.',
        'The tolerance must suit the computation, and a negative tolerance makes no sense.',
      ],
      example: {
        language: 'cpp',
        code: `#include <cmath>
#include <iostream>
bool within(double actual, double expected, double tolerance) {
  return tolerance >= 0 && std::abs(actual - expected) <= tolerance;
}
int main() {
  std::cout << within(0.1 + 0.2, 0.3, 1e-12) << " " << within(1.0, 1.1, 0.01) << "\\n";
}`,
        output: '1 0',
        explanation:
          'The rounding error is far below 1e-12; 1.0 and 1.1 differ by 0.1, more than 0.01.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `#include <cmath>
#include <iostream>
bool within(double actual, double expected, double tolerance) {
  return tolerance >= 0 && std::abs(actual - expected) <= tolerance;
}
int main() {
  std::cout << within(2.0, 2.05, 0.1) << " " << within(2.0, 2.05, 0.01) << "\\n";
}`,
          ['1 1', '0 0', '0 1', '1 0'],
          3,
          'The difference 0.05 fits within 0.1 but not within 0.01.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <cmath>
#include <iostream>
bool within(double actual, double expected, double tolerance) {
  return tolerance >= 0 && std::abs(actual - expected) <= tolerance;
}
int main() {
  std::cout << within(1.0, 1.0, -1.0) << "\\n";
}`,
          ['1', '0', '-1', '2'],
          1,
          'Equal values still fail, because a negative tolerance is rejected as invalid.',
        ),
        choose(
          'Which assertion checks that a computed average is 2.5 within 1e-9?',
          [
            'assert(avg == 2.5);',
            'assert(avg - 2.5 <= 1e-9);',
            'assert(std::abs(avg - 2.5) <= 1e-9);',
            'assert(std::abs(avg) <= 2.5 + 1e-9);',
          ],
          2,
          'Only the absolute difference bounds the error in both directions.',
        ),
        predictOutput(
          'This version forgets std::abs. What does it print?',
          `#include <iostream>
bool within_wrong(double actual, double expected, double tolerance) {
  return actual - expected <= tolerance;
}
int main() {
  std::cout << within_wrong(1.0, 5.0, 0.1) << "\\n";
}`,
          ['0', '1', '-4', '4'],
          1,
          '1.0 - 5.0 is -4, which is below 0.1, so a result that is far off still passes.',
        ),
      ],
    },
    {
      title: 'Test a computed result with a justified tolerance',
      explanation: [
        'A numeric test computes the result, then asserts closeness to an expected value written to a known precision. If the expected value is written to six decimal places, a tolerance around 1e-6 is justified; a much tighter one rejects correct results.',
        'Integer arithmetic before the conversion is not rounding error: 7 / 2 is already 3 before it becomes a double, and no tolerance should hide that.',
      ],
      example: {
        language: 'cpp',
        code: `#include <cassert>
#include <cmath>
#include <iostream>
double average(int total, int count) { return static_cast<double>(total) / count; }
int main() {
  double result = average(7, 3);
  assert(std::abs(result - 2.333333) <= 1e-6);
  std::cout << result << "\\n";
}`,
        output: '2.33333',
        explanation:
          'The cast makes the division floating-point. The expected value has six decimals, so 1e-6 is a fitting tolerance, and the assertion passes.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `#include <cmath>
#include <iostream>
double average(int total, int count) { return static_cast<double>(total) / count; }
int main() {
  std::cout << (std::abs(average(1, 3) - 0.333333) <= 1e-5) << "\\n";
}`,
          ['1', '0', '0.333333', '3'],
          0,
          'The true value differs from 0.333333 by about 3e-7, well within 1e-5.',
        ),
        predictOutput(
          'The tolerance is now 1e-9. What does this program print?',
          `#include <cmath>
#include <iostream>
double average(int total, int count) { return static_cast<double>(total) / count; }
int main() {
  std::cout << (std::abs(average(1, 3) - 0.333333) <= 1e-9) << "\\n";
}`,
          ['1', '0.333333', '0', '1e-09'],
          2,
          'The expected value itself is only accurate to about 3e-7, so a 1e-9 tolerance rejects a correct result.',
        ),
        choose(
          'An expected value is written to 6 decimal places. Which tolerance is justified?',
          [
            '0, because the computed result must be exact',
            'About 1e-6, matching the expected value’s precision',
            '1, since a large tolerance can never be wrong',
            'A negative tolerance, to make the check strict',
          ],
          1,
          'The tolerance should reflect how precisely the expected value is known.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <cmath>
#include <iostream>
int main() {
  double avg = 7 / 2;
  std::cout << (std::abs(avg - 3.5) <= 1e-9) << "\\n";
}`,
          ['1', '3.5', '3', '0'],
          3,
          '7 / 2 is integer division, giving 3 before the conversion, so the test correctly fails.',
        ),
      ],
    },
  ],
  'cpp-auto-parameters': [
    {
      title: 'An auto parameter accepts any argument type',
      explanation: [
        'Writing auto for a lambda parameter makes the lambda generic. The compiler handles each call separately: twice(3) builds a version of the body for int, and twice(1.25) builds another for double. Each version keeps its argument’s type, so the int call returns an int and the double call returns a double.',
        'A parameter declared int instead converts every argument to int before the body runs, so a double argument loses its fraction.',
      ],
      example: {
        language: 'cpp',
        code: `#include <iostream>
int main() {
  auto twice = [](auto value) { return value + value; };
  std::cout << twice(3) << " " << twice(1.25) << "\\n";
}`,
        output: '6 2.5',
        explanation:
          'twice(3) runs the int version and returns 6; twice(1.25) runs the double version and returns 2.5.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `#include <iostream>
int main() {
  auto half = [](auto v) { return v / 2; };
  std::cout << half(7) << " " << half(7.0) << "\\n";
}`,
          ['3.5 3.5', '3 3', '3 3.5', '3.5 3'],
          2,
          'half(7) divides two ints and truncates to 3; half(7.0) divides a double and gives 3.5.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <iostream>
int main() {
  auto add = [](auto a, auto b) { return a + b; };
  std::cout << add(2, 3) << " " << add(2, 0.5) << "\\n";
}`,
          ['5 2.5', '5 2', '5 3', '5.0 2.5'],
          0,
          'Each auto parameter takes its own argument’s type. 2 + 0.5 mixes int and double, so the result is the double 2.5.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <iostream>
int main() {
  auto twice = [](int v) { return v + v; };
  auto generic = [](auto v) { return v + v; };
  std::cout << twice(2.5) << " " << generic(2.5) << "\\n";
}`,
          ['5 5', '4 4', '5 4', '4 5'],
          3,
          'The int parameter turns 2.5 into 2 before adding; the auto parameter keeps the double.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <iostream>
int main() {
  auto same = [](auto a, auto b) { return a == b; };
  std::cout << same(1, 1.0) << " " << same(3, 4) << "\\n";
}`,
          ['0 0', '1 0', '1 1', '0 1'],
          1,
          'Comparing int 1 with double 1.0 converts to a common type and finds them equal; 3 and 4 differ.',
        ),
      ],
    },
    {
      title: 'Read arguments with const auto&',
      explanation: [
        'auto value copies each argument. For a large argument such as a std::vector, write const auto& instead: the parameter refers to the caller’s object without copying it, and const forbids changing it through that reference.',
        'Generic lambdas often take two const auto& parameters, as a comparator does. The same lambda then works for ints, doubles, or the elements and vectors you pass to it, as long as the body’s operations exist for those types.',
      ],
      example: {
        language: 'cpp',
        code: `#include <iostream>
#include <vector>
int main() {
  auto first = [](const auto& items) { return items[0]; };
  std::vector<int> counts{4, 8};
  std::vector<double> prices{2.5, 1.0};
  std::cout << first(counts) << " " << first(prices) << "\\n";
}`,
        output: '4 2.5',
        explanation:
          'The same lambda reads element 0 of a vector of ints and of a vector of doubles, without copying either vector.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `#include <iostream>
#include <vector>
int main() {
  auto last = [](const auto& items) { return items[items.size() - 1]; };
  std::vector<int> a{1, 2, 3};
  std::vector<double> b{0.5, 0.25};
  std::cout << last(a) << " " << last(b) << "\\n";
}`,
          ['1 0.5', '3 0.5', '2 0.25', '3 0.25'],
          3,
          'items.size() - 1 is the last index in each vector, whatever its element type.',
        ),
        choose(
          'Which parameter lets a generic lambda read a large vector without copying it and without being able to change it?',
          [
            'auto items',
            'const auto& items',
            'auto& items',
            'const auto items',
          ],
          1,
          'auto and const auto copy the argument; auto& avoids the copy but allows changes.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <iostream>
int main() {
  auto less = [](const auto& a, const auto& b) { return a < b; };
  std::cout << less(2, 9) << " " << less(2.5, 0.5) << "\\n";
}`,
          ['1 0', '0 1', '1 1', '0 0'],
          0,
          '2 < 9 is true; 2.5 < 0.5 is false. One comparator handles both types.',
        ),
        choose(
          'What happens when [](const auto& items) { items[0] = 0; } is called with a std::vector<int>?',
          [
            'It sets the caller’s first element to 0',
            'It changes a private copy and leaves the caller’s vector alone',
            'It does not compile, because items is a reference to const',
            'It compiles only when the vector is empty',
          ],
          2,
          'const forbids assigning through the reference, and the error appears when the body is compiled for std::vector<int>.',
        ),
      ],
    },
  ],
  'cpp-decltype-decay': [
    {
      title: 'decltype names the declared type of a variable',
      explanation: [
        'decltype(x) is the type x was declared with. After int count = 3;, decltype(count) is int, so decltype(count) copy = count; declares another int. For a reference declared int& alias = count;, decltype(alias) is int&, reference included, and for const int limit = 5; it is const int.',
        'std::is_same_v<A, B>, from <type_traits>, is true only when A and B are exactly the same type, so it shows what decltype produced.',
      ],
      example: {
        language: 'cpp',
        code: `#include <iostream>
#include <type_traits>
int main() {
  int count = 3;
  int& alias = count;
  decltype(count) copy = count;
  copy += 1;
  std::cout << std::is_same_v<decltype(count), int> << " "
            << std::is_same_v<decltype(alias), int> << " "
            << std::is_same_v<decltype(alias), int&> << " " << count << " " << copy << "\\n";
}`,
        output: '1 0 1 3 4',
        explanation:
          'decltype(count) is int, so copy is an independent int: it becomes 4 while count stays 3. decltype(alias) is int&, which is not the same type as int.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `#include <iostream>
int main() {
  double rate = 0.5;
  decltype(rate) doubled = rate * 2;
  std::cout << doubled / 4 << "\\n";
}`,
          ['0', '1', '0.25', '0.5'],
          2,
          'decltype(rate) is double, so doubled is 1.0 and 1.0 / 4 is 0.25. An int would have given 0.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <iostream>
#include <type_traits>
int main() {
  int total = 7;
  int& ref = total;
  std::cout << std::is_same_v<decltype(ref), int> << std::is_same_v<decltype(ref), int&> << "\\n";
}`,
          ['10', '01', '11', '00'],
          1,
          'ref was declared as int&, and decltype keeps the reference.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <iostream>
#include <type_traits>
int main() {
  const int limit = 5;
  std::cout << std::is_same_v<decltype(limit), int> << " " << std::is_same_v<decltype(limit), const int> << "\\n";
}`,
          ['1 0', '1 1', '0 0', '0 1'],
          3,
          'decltype keeps const, so the declared type is const int, not int.',
        ),
        choose(
          'alias is declared int& alias = count;. What does decltype(alias) other = count; declare?',
          [
            'Another reference to count',
            'A new int initialized with a copy of count',
            'A pointer to count',
            'Nothing; decltype cannot declare variables',
          ],
          0,
          'decltype(alias) is int&, so other is a second reference bound to count.',
        ),
      ],
    },
    {
      title: 'std::decay_t strips const and references',
      explanation: [
        'std::decay_t<T>, from <type_traits>, is the plain type a by-value copy of T would have: it removes a reference and then a top-level const. std::decay_t<const int&> is int, and std::decay_t<int> stays int.',
        'This matters in generic lambdas. Inside [](const auto& x) { ... }, decltype(x) for an int argument is const int&, which is not the same type as int. Compare std::decay_t<decltype(x)> with int instead, and give it a short name with using T = std::decay_t<decltype(x)>;.',
      ],
      example: {
        language: 'cpp',
        code: `#include <iostream>
#include <type_traits>
int main() {
  auto describe = [](const auto& x) {
    std::cout << std::is_same_v<decltype(x), int> << " "
              << std::is_same_v<std::decay_t<decltype(x)>, int> << "\\n";
  };
  describe(42);
}`,
        output: '0 1',
        explanation:
          'decltype(x) is const int&, so the first test fails. After decay_t removes const and &, the type is int.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `#include <iostream>
#include <type_traits>
int main() {
  std::cout << std::is_same_v<std::decay_t<const double&>, double> << " "
            << std::is_same_v<std::decay_t<int&>, int> << "\\n";
}`,
          ['0 0', '1 0', '0 1', '1 1'],
          3,
          'decay_t removes the reference and the const in both cases, leaving double and int.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <iostream>
#include <type_traits>
int main() {
  auto check = [](const auto& x) {
    using T = std::decay_t<decltype(x)>;
    std::cout << std::is_same_v<T, int> << std::is_same_v<T, double> << "\\n";
  };
  check(2.5);
  check(7);
}`,
          ['01\n10', '10\n01', '00\n00', '01\n01'],
          0,
          '2.5 is a double and 7 is an int; T names the plain type of each argument.',
        ),
        choose(
          'Inside [](const auto& x) { ... } called with an int, why is std::is_same_v<decltype(x), int> false?',
          [
            'The int argument is converted to double inside a generic lambda',
            'decltype(x) is const int&, which differs from int until decay_t strips const and &',
            'is_same_v compares values, and x is not equal to int',
            'decltype works only on variables declared outside the lambda',
          ],
          1,
          'The parameter is a reference to const, and decltype reports that full type.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <iostream>
#include <type_traits>
int main() {
  using T = std::decay_t<const int&>;
  T value = 5;
  value += 1;
  std::cout << value << "\\n";
}`,
          ['5', 'Compilation fails', '1', '6'],
          3,
          'T is plain int, without const, so value can be changed. A const int would reject +=.',
        ),
      ],
    },
    {
      title: 'Choose behavior by the deduced type',
      explanation: [
        'Combine the two: name the plain type with using T = std::decay_t<decltype(x)>; and branch on std::is_same_v<T, int>. An ordinary if works when every branch compiles for every argument type, as with arithmetic that works on both int and double.',
      ],
      example: {
        language: 'cpp',
        code: `#include <iostream>
#include <type_traits>
int main() {
  auto cents = [](const auto& amount) {
    using T = std::decay_t<decltype(amount)>;
    long long result = 0;
    if (std::is_same_v<T, int>) {
      result = amount;
    } else {
      result = static_cast<long long>(amount * 100 + 0.5);
    }
    return result;
  };
  std::cout << cents(250) << " " << cents(1.5) << "\\n";
}`,
        output: '250 150',
        explanation:
          'An int amount already counts cents. A double amount counts dollars, so it is scaled by 100 and rounded.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `#include <iostream>
#include <type_traits>
int main() {
  auto cents = [](const auto& amount) {
    using T = std::decay_t<decltype(amount)>;
    long long result = 0;
    if (std::is_same_v<T, int>) {
      result = amount;
    } else {
      result = static_cast<long long>(amount * 100 + 0.5);
    }
    return result;
  };
  std::cout << cents(75) << " " << cents(0.25) << "\\n";
}`,
          ['7500 25', '75 0', '75 25', '7500 0'],
          2,
          '75 is an int and is kept; 0.25 is a double and becomes 25 cents.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <iostream>
#include <type_traits>
int main() {
  auto label = [](const auto& v) {
    using T = std::decay_t<decltype(v)>;
    if (std::is_same_v<T, double>) {
      std::cout << "real ";
    } else {
      std::cout << "whole ";
    }
  };
  label(3);
  label(3.0);
  label(-1);
  std::cout << "\\n";
}`,
          [
            'whole whole whole',
            'real real whole',
            'whole real real',
            'whole real whole',
          ],
          3,
          '3 and -1 are ints, and 3.0 is a double, whatever their values.',
        ),
        choose(
          'A generic lambda tests std::is_same_v<decltype(x), int> on a const auto& parameter and never takes the int branch. Which test fixes it?',
          [
            'std::is_same_v<decltype(x), int&>',
            'std::is_same_v<x, int>',
            'std::is_same_v<std::decay_t<decltype(x)>, int>',
            'std::is_same_v<decltype(x), auto>',
          ],
          2,
          'decltype(x) is const int&; only its decayed type equals int.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <iostream>
#include <type_traits>
int main() {
  auto is_int = [](const auto& v) { return std::is_same_v<std::decay_t<decltype(v)>, int>; };
  std::cout << is_int(1) + is_int(2.0) + is_int(3) + is_int('a') << "\\n";
}`,
          ['3', '2', '4', '1'],
          1,
          '1 and 3 are ints. 2.0 is a double, and the character literal is a char, a different type from int.',
        ),
      ],
    },
  ],
  'cpp-mutable-lambda': [
    {
      title: 'mutable lets a lambda change its own copy',
      explanation: [
        'A by-value capture is read-only inside the lambda, so [count] { ++count; } does not compile. Writing mutable after the parameter list lifts that restriction: [count]() mutable { return ++count; } changes the closure’s own copy.',
        'That copy lives inside the closure object, so a change persists from one call to the next. The original variable is untouched, because the closure never refers to it.',
      ],
      example: {
        language: 'cpp',
        code: `#include <iostream>
int main() {
  int count = 0;
  auto tick = [count]() mutable { return ++count; };
  int first = tick();
  int second = tick();
  std::cout << first << " " << second << " " << count << "\\n";
}`,
        output: '1 2 0',
        explanation:
          'Each call increments the closure’s copy, so the results are 1 and then 2. The original count is still 0.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `#include <iostream>
int main() {
  int total = 10;
  auto add = [total](int x) mutable {
    total += x;
    return total;
  };
  add(5);
  int result = add(1);
  std::cout << result << " " << total << "\\n";
}`,
          ['11 10', '16 10', '16 16', '11 16'],
          1,
          'The closure’s copy grows to 15 and then 16; the original total stays 10.',
        ),
        choose(
          'Why does [count] { ++count; } fail to compile?',
          [
            'count must be captured by reference to be read at all',
            'Lambdas cannot use the ++ operator',
            'count is copied only when the lambda is called',
            'A by-value capture is read-only unless the lambda is mutable',
          ],
          3,
          'Without mutable, the closure’s copies are const inside its body.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <iostream>
int main() {
  int start = 3;
  auto next = [start]() mutable {
    start *= 2;
    return start;
  };
  next();
  next();
  int third = next();
  std::cout << third << " " << start << "\\n";
}`,
          ['24 3', '6 3', '24 24', '12 3'],
          0,
          'The copy doubles on every call: 6, 12, then 24. The original start is still 3.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <iostream>
int main() {
  int n = 0;
  auto step = [n]() mutable {
    n += 5;
    return n;
  };
  int last = 0;
  for (int i = 0; i < 4; ++i) last = step();
  std::cout << last << " " << n << "\\n";
}`,
          ['5 0', '20 20', '0 0', '20 0'],
          3,
          'Four calls add 5 each time to the closure’s copy. n in main never changes.',
        ),
      ],
    },
    {
      title: 'Choose a mutable copy or a reference capture',
      explanation: [
        'Decide by who should see the change. [&count] changes the caller’s variable and needs no mutable, because the lambda modifies the variable it refers to, not a copy it owns. [count]() mutable changes only the closure’s copy.',
        'Use a reference capture when the caller needs the result afterwards; use mutable when the state belongs to the lambda, as in a generator that hands out the next ID.',
      ],
      example: {
        language: 'cpp',
        code: `#include <iostream>
int main() {
  int shared = 0;
  int own = 0;
  auto by_ref = [&shared] { ++shared; };
  auto by_copy = [own]() mutable { return ++own; };
  by_ref();
  by_ref();
  by_copy();
  int seen = by_copy();
  std::cout << shared << " " << own << " " << seen << "\\n";
}`,
        output: '2 0 2',
        explanation:
          'by_ref changed shared itself. by_copy counted to 2 in its own copy and left own at 0.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `#include <iostream>
int main() {
  int a = 1;
  auto ref = [&a] { a *= 3; };
  auto copy = [a]() mutable {
    a *= 3;
    return a;
  };
  ref();
  int c = copy();
  std::cout << a << " " << c << "\\n";
}`,
          ['3 9', '1 3', '3 3', '9 3'],
          2,
          'copy took its snapshot, 1, when it was created, before ref() tripled a to 3. copy() returns 1 * 3.',
        ),
        choose(
          'A lambda must count events so that main can print the total afterwards. Which lambda fits?',
          [
            '[events]() mutable { ++events; }',
            '[&events] { ++events; }',
            '[events] { return events + 1; }',
            '[events] { ++events; }',
          ],
          1,
          'Only the reference capture changes the variable main prints; the others change or read a copy.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <iostream>
int main() {
  int hits = 0;
  auto record = [hits]() mutable { ++hits; };
  record();
  record();
  std::cout << hits << "\\n";
}`,
          ['0', '2', '1', '3'],
          0,
          'record increments its own copy; main’s hits is never changed.',
        ),
        choose(
          'Why does [&total] { total += 5; } compile without mutable?',
          [
            'mutable is implied for any lambda that uses +=',
            'Reference captures are copied when the lambda is called',
            'total becomes a global variable inside the lambda',
            'It changes the variable it refers to, not a copy stored in the closure',
          ],
          3,
          'mutable is about the closure’s own copies; a reference capture owns no copy.',
        ),
      ],
    },
    {
      title: 'Each copy of a closure keeps its own state',
      explanation: [
        'A lambda object can be copied like any other value. auto backup = counter; copies the closure together with its current captured state, and from then on the two copies change independently.',
        'This matters when code stores or passes the lambda by value: the copy that gets called advances, and the original does not.',
      ],
      example: {
        language: 'cpp',
        code: `#include <iostream>
int main() {
  int n = 0;
  auto counter = [n]() mutable { return ++n; };
  counter();
  auto copy = counter;
  copy();
  copy();
  int a = counter();
  int b = copy();
  std::cout << a << " " << b << "\\n";
}`,
        output: '2 4',
        explanation:
          'copy started from counter’s state after one call. Its two calls do not reach counter, whose next call returns 2; copy’s third call returns 4.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `#include <iostream>
int main() {
  int n = 10;
  auto a = [n]() mutable {
    n -= 1;
    return n;
  };
  auto b = a;
  a();
  a();
  int x = a();
  int y = b();
  std::cout << x << " " << y << "\\n";
}`,
          ['7 7', '9 9', '7 9', '6 9'],
          2,
          'b was copied before any call, so its first call returns 9 while a has reached 7.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <iostream>
int main() {
  int n = 0;
  auto gen = [n]() mutable {
    n += 2;
    return n;
  };
  auto saved = gen;
  gen();
  gen();
  auto later = gen;
  int x = saved();
  int y = later();
  std::cout << x << " " << y << "\\n";
}`,
          ['6 6', '2 2', '6 2', '2 6'],
          3,
          'saved copied the starting state, so it returns 2. later copied the state after two calls, so it returns 6.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <iostream>
int main() {
  int n = 0;
  auto counter = [n]() mutable { return ++n; };
  counter();
  counter();
  counter();
  auto backup = counter;
  counter();
  counter();
  std::cout << backup() << "\\n";
}`,
          ['4', '6', '1', '3'],
          0,
          'backup copied the state after three calls, so its next call returns 4; counter’s later calls do not reach it.',
        ),
      ],
    },
  ],
  'cpp-generic-lambdas': [
    {
      title: 'One closure shares its captures across argument types',
      explanation: [
        'A generic lambda is a single closure object. Calling it with an int and then with a double runs two compiled versions of its body, but both versions read and write the same captured variables, so mutable state accumulates across every call, whatever the argument type. A parameter the body never reads can be left unnamed, as in (const auto&).',
      ],
      example: {
        language: 'cpp',
        code: `#include <iostream>
int main() {
  int calls = 0;
  auto count = [calls](const auto&) mutable {
    calls += 1;
    return calls;
  };
  int a = count(7);
  int b = count(2.5);
  int c = count(3);
  std::cout << a << " " << b << " " << c << " " << calls << "\\n";
}`,
        output: '1 2 3 0',
        explanation:
          'The int and double calls share one captured counter, so it reaches 3. main’s calls is untouched because the lambda owns a copy.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `#include <iostream>
int main() {
  double sum = 0;
  auto add = [sum](const auto& value) mutable {
    sum += value;
    return sum;
  };
  add(2);
  add(0.5);
  double total = add(1);
  std::cout << total << " " << sum << "\\n";
}`,
          ['1 0', '3.5 3.5', '3.5 0', '1 3.5'],
          2,
          'All three calls add to the same captured sum, whatever the argument type; main’s sum stays 0.',
        ),
        choose(
          'A mutable generic lambda is called with ints and with doubles. How many copies of its captured state exist?',
          [
            'One, shared by the versions of the body for every argument type',
            'One per argument type, created by each compiled version',
            'One per call, created when the call starts',
            'None, because generic lambdas cannot capture',
          ],
          0,
          'The closure object holds the captures once; each compiled body works on those same members.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <iostream>
int main() {
  int seen = 0;
  auto note = [seen](const auto& value) mutable {
    seen += 1;
    return seen * 10 + value;
  };
  note(1);
  note(1.5);
  std::cout << note(2) << "\\n";
}`,
          ['12', '22', '32', '30'],
          2,
          'The third call is the closure’s third, so seen is 3 and the result is 3 * 10 + 2.',
        ),
      ],
    },
    {
      title: 'Combine type dispatch with a running total',
      explanation: [
        'Put the pieces together: keep the shared total in the capture list, mark the lambda mutable, name the argument’s plain type with using T = std::decay_t<decltype(x)>;, and branch on it. One lambda can then accept cents as ints and dollars as doubles and keep a single running total.',
      ],
      example: {
        language: 'cpp',
        code: `#include <iostream>
#include <type_traits>
int main() {
  long long total = 0;
  auto add = [total](const auto& amount) mutable {
    using T = std::decay_t<decltype(amount)>;
    if (std::is_same_v<T, int>) {
      total += amount;
    } else {
      total += static_cast<long long>(amount * 100 + 0.5);
    }
    return total;
  };
  add(250);
  add(1.5);
  std::cout << add(99) << "\\n";
}`,
        output: '499',
        explanation:
          '250 cents, then 1.5 dollars as 150 cents, then 99 cents: one total of 499.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `#include <iostream>
#include <type_traits>
int main() {
  long long total = 0;
  auto add = [total](const auto& amount) mutable {
    using T = std::decay_t<decltype(amount)>;
    if (std::is_same_v<T, int>) {
      total += amount;
    } else {
      total += static_cast<long long>(amount * 100 + 0.5);
    }
    return total;
  };
  add(0.25);
  std::cout << add(5) << "\\n";
}`,
          ['5', '25', '30', '530'],
          2,
          '0.25 dollars adds 25 cents, and the int 5 adds 5 more, all in one total.',
        ),
        predictOutput(
          'This version tests decltype directly. What does it print?',
          `#include <iostream>
#include <type_traits>
int main() {
  long long total = 0;
  auto add = [total](const auto& amount) mutable {
    if (std::is_same_v<decltype(amount), int>) {
      total += amount;
    } else {
      total += static_cast<long long>(amount * 100 + 0.5);
    }
    return total;
  };
  std::cout << add(3) << "\\n";
}`,
          ['3', '300', '0', '303'],
          1,
          'decltype(amount) is const int&, never int, so the int 3 is treated as dollars and becomes 300.',
        ),
        choose(
          'Two generic lambdas each keep a captured total. One is called with ints, the other with doubles. How do you get one combined total?',
          [
            'Call one lambda for both kinds, so a single closure keeps the total',
            'Mark both lambdas mutable, which makes them share captures',
            'Capture the total by value in both lambdas',
            'Use auto instead of const auto& for the parameters',
          ],
          0,
          'Each closure owns its own captures; only one closure holds one total.',
        ),
      ],
    },
  ],
};
