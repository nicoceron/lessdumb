import type { Skill } from '../../curriculum';
import {
  skill,
  choice,
  exercise,
  withLargeCase,
  withoutShortcuts,
} from './shared';

export const competitiveFoundations: Skill[] = [
  skill(
    'cp-complexity',
    'cp-foundations',
    'Count algorithm work',
    'Estimate how time and memory grow before choosing an approach.',
    ['cp-work-pairs', 'cp-work-doubling', 'multiple-returns'],
    [
      'Complexity describes how resource use grows with input size n. A scan that does constant work per element takes O(n) time; two complete nested scans take O(n²). Consecutive stages add their costs, and the fastest-growing term usually determines the asymptotic bound. These bounds compare growth, not exact seconds on a particular computer.',
      'A useful loop invariant explains the work already done. After i iterations of a scan, i elements have been processed; after i rows of an n-by-n pair scan, i × n pairs have been checked. A probe that doubles from 1 reaches n after about log₂(n) rounds. Doubling n roughly doubles a scan, quadruples a pair scan, and adds one doubling round.',
      'Time and space are separate. A nested loop can take quadratic time while storing only a few counters. An extra array of n values needs O(n) additional space even if creating it takes only linear time. Start from the input constraints and count the dominant operations; a smaller constant does not turn quadratic growth into linear growth.',
    ],
    'n = 6\nchecks = 0\nfor i in range(n):\n    for j in range(n):\n        checks += 1\nprobe = 1\nrounds = 0\nwhile probe < n:\n    probe *= 2\n    rounds += 1\nprint(checks)\nprint(rounds)',
    '36\n3',
    'The pair scan checks 6 × 6 combinations. The probe visits 1, 2, 4, and 8, requiring three doublings.',
    [
      choice(
        'What does this program print?',
        ['4', '8', '16', '32'],
        2,
        'Each of four outer iterations performs four inner iterations: 16 checks.',
        'Multiply the two iteration counts.',
        'n = 4\nchecks = 0\nfor i in range(n):\n    for j in range(n):\n        checks += 1\nprint(checks)',
      ),
      choice(
        'A routine scans n values, then scans them again. What is its time complexity?',
        ['O(n)', 'O(n²)', 'O(log n)', 'O(1)'],
        0,
        'Two consecutive scans cost n + n operations, so the growth is linear.',
        'Consecutive loops add; nested loops multiply.',
      ),
      choice(
        'A pair scan keeps only counters and reads an existing array. What is its additional space?',
        ['O(n²)', 'O(1)', 'O(n)', 'O(log n)'],
        1,
        'The counters occupy constant additional space regardless of how many pairs are visited.',
        'Count new storage, not loop iterations.',
      ),
      exercise(
        'Implement work_counts(n) for a nonnegative integer n. Return a tuple: the number of checks in a length-n scan, the number in a full n-by-n ordered pair scan, and the number of doublings from 1 needed to reach at least n. Compute counts without performing the pair scan. A hidden case with n = 10¹² must finish within 3 seconds.',
        'def work_counts(n):\n    # Return the two check counts and the doubling count.\n    pass',
        'def work_counts(n):\n    probe = 1\n    rounds = 0\n    while probe < n:\n        probe *= 2\n        rounds += 1\n    return (n, n * n, rounds)',
        withLargeCase(
          'assert work_counts(0) == (0, 0, 0)\nassert work_counts(1) == (1, 1, 0)\nassert work_counts(2) == (2, 4, 1)\nassert work_counts(6) == (6, 36, 3)\nassert work_counts(8) == (8, 64, 3)\nassert work_counts(9) == (9, 81, 4)\nassert work_counts(1000000) == (1000000, 1000000000000, 20)',
          `_result, _seconds = _timed(work_counts, 10**12)
assert _result == (1000000000000, 1000000000000000000000000, 40), "work_counts(10**12) returned the wrong counts."
_check_time(_seconds, "work_counts(10**12)", "Compute the pair count with a formula instead of performing the scan.")`,
        ),
        'The hypothetical scan counts are n and n². Computing those formulas is cheap; this function itself takes O(log(n + 1)) time and O(1) additional space.',
        'Use formulas for the first two counts, and repeatedly double a probe while it is smaller than n.',
      ),
    ],
    [
      [
        'How do consecutive and nested loops combine work?',
        'Consecutive stages add their costs; full independent nested scans multiply their iteration counts.',
      ],
      [
        'Why can quadratic time use constant additional space?',
        'Repeated work can reuse a fixed number of counters without storing a result for every pair.',
      ],
    ],
  ),
  skill(
    'cp-input',
    'cp-foundations',
    'Parse a text case',
    'Separate whitespace tokens, convert types, and respect the input format.',
    ['cp-input-count'],
    [
      'Contest input is text with a declared structure. text.split() separates whitespace-delimited tokens and treats spaces, tabs, and newlines alike. Every resulting token is still a string. Convert a token with int(...) before integer arithmetic; concatenating two numeric-looking strings does not add their values.',
      'When the first token declares a count n, use it to interpret the following n values. The parsing invariant is that each consumed token has one known role in the format. Do not accidentally count the size marker as a measurement. Here the precondition is a well-formed case with exactly n following integers; format validation is a separate task.',
      'Our function-based exercises receive a text argument, so they need no input() calls or console interaction. Splitting and converting take O(L) time for L characters and O(L) storage for the tokens and returned values. Handle an empty text argument explicitly when the function contract allows it, and format outputs separately from parsing.',
    ],
    'text = "3\\n5 -2 8\\n"\ntokens = text.split()\nn = int(tokens[0])\nreadings = [int(token) for token in tokens[1:1 + n]]\nprint(n)\nprint(readings)\nprint(sum(readings))',
    '3\n[5, -2, 8]\n11',
    'The leading 3 describes three readings; it is not included in their total.',
    [
      choice(
        'What does text.split() return for "4\\n7\\t9"?',
        [
          '[4, 7, 9]',
          '["4", "7", "9"]',
          '["4\\n7\\t9"]',
          '["4", "\\n", "7", "\\t", "9"]',
        ],
        1,
        'With no separator argument, split uses runs of whitespace and returns string tokens.',
        'Tokenization does not convert numbers.',
      ),
      choice(
        'What does this program print?',
        ['9', '45', 'An empty string', 'A TypeError'],
        1,
        'Both tokens are strings, so + concatenates them into "45".',
        'Check the types before applying +.',
        'tokens = "4 5".split()\nprint(tokens[0] + tokens[1])',
      ),
      choice(
        'A format starts with a value count. Which invariant helps parse it correctly?',
        [
          'Every token is an output line',
          'All whitespace must be a single space',
          'The count token is also the first value',
          'Consumed tokens have been assigned their declared roles',
        ],
        3,
        'Knowing whether a token is a count or a value prevents shifting the interpretation.',
        'Keep the size marker separate from the payload.',
      ),
      exercise(
        'Implement parse_readings(text). A nonblank case contains a nonnegative count n followed by exactly n integer tokens; return those integers as a list. Whitespace may include spaces, tabs, or newlines. For blank text, return []. Assume nonblank cases follow the declared format.',
        'def parse_readings(text):\n    # Split the text and return the declared readings as integers.\n    pass',
        'def parse_readings(text):\n    tokens = text.split()\n    if not tokens:\n        return []\n    count = int(tokens[0])\n    return [int(token) for token in tokens[1:1 + count]]',
        'assert parse_readings("") == []\nassert parse_readings("  \\n\\t ") == []\nassert parse_readings("0") == []\nassert parse_readings("3\\n5 -2 8\\n") == [5, -2, 8]\nassert parse_readings(" 2\\t-7   0 ") == [-7, 0]\nassert parse_readings("1\\n42") == [42]\nassert parse_readings("4 1 1 1 1") == [1, 1, 1, 1]',
        'The empty case is handled before indexing tokens[0]. Converting the size marker and slicing the following tokens keeps format and payload separate.',
        'Use tokens = text.split(); check for no tokens before reading the first one.',
      ),
    ],
    [
      [
        'Does str.split() convert numeric tokens?',
        'No. It returns strings; convert with int(...) or another requested type.',
      ],
      [
        'What is the role of a leading count in an input format?',
        'It describes how many payload values to read and is not itself one of those values.',
      ],
    ],
  ),
  skill(
    'cp-simulation',
    'cp-foundations',
    'Simulate a state machine',
    'Turn each event into one precise state update.',
    [
      'cp-state-transition',
      'cp-state-bounds',
      'cp-state-peak',
      'cp-complexity',
    ],
    [
      'Simulation follows a process one event at a time. Define the state before writing the loop: for a capped meter, keep its current level and the highest level reached. Specify each transition exactly: up adds two subject to a ceiling, down removes one subject to zero, and reset returns the current level to zero.',
      'After processing the first i commands, the level must equal the real process at that point, and the peak must be the greatest level reached so far. Update the current level first, then update the peak. A reset changes the present level; it does not erase the historical peak. This invariant provides a direct way to check the order of your statements.',
      'For m commands, a constant-cost update per command gives O(m) time and O(1) additional space. Assume the ceiling is nonnegative and commands belong to the declared set. Boundary cases include no commands, a zero ceiling, and repeated downward commands at zero. Simulation is useful when transitions are cheap enough for the input limit; enormous repeated processes may need another method.',
    ],
    'commands = ["up", "up", "down", "reset", "up"]\nceiling = 3\nlevel = 0\npeak = 0\nfor command in commands:\n    if command == "up":\n        level = min(ceiling, level + 2)\n    elif command == "down":\n        level = max(0, level - 1)\n    else:\n        level = 0\n    peak = max(peak, level)\nprint(level)\nprint(peak)',
    '2\n3',
    'The second upward command hits the ceiling; reset clears the current level while preserving the peak.',
    [
      choice(
        'Why should the peak be updated after applying a command?',
        [
          'To include the newly reached state',
          'To erase previous states',
          'To make resets increase the peak',
          'To skip ceiling checks',
        ],
        0,
        'The state after the transition may be a new maximum and must be included.',
        'The event may change the value you want to measure.',
      ),
      choice(
        'What does this program print?',
        ['0', '2', '3', '4'],
        2,
        'The meter moves 0 → 0 → 2 → 3, with the last increase capped.',
        'Apply each transition in order.',
        'level = 0\nfor command in ["down", "up", "up"]:\n    if command == "up":\n        level = min(3, level + 2)\n    else:\n        level = max(0, level - 1)\nprint(level)',
      ),
      choice(
        'There are m commands and each transition does constant work. What is the running time?',
        ['O(1)', 'O(log m)', 'O(m²)', 'O(m)'],
        3,
        'Processing every command once gives linear time.',
        'Count the number of transitions.',
      ),
      exercise(
        'Implement simulate_meter(commands, ceiling). Start level and peak at 0. "up" adds 2 capped at ceiling; "down" subtracts 1 floored at 0; "reset" sets the current level to 0. Return (final_level, peak). Assume ceiling >= 0 and all commands are one of these three strings.',
        'def simulate_meter(commands, ceiling):\n    # Process commands and return the final level and historical peak.\n    pass',
        'def simulate_meter(commands, ceiling):\n    level = 0\n    peak = 0\n    for command in commands:\n        if command == "up":\n            level = min(ceiling, level + 2)\n        elif command == "down":\n            level = max(0, level - 1)\n        else:\n            level = 0\n        peak = max(peak, level)\n    return (level, peak)',
        'assert simulate_meter([], 8) == (0, 0)\nassert simulate_meter(["up", "up", "down"], 3) == (2, 3)\nassert simulate_meter(["down", "down"], 5) == (0, 0)\nassert simulate_meter(["up", "reset"], 10) == (0, 2)\nassert simulate_meter(["up", "reset", "up"], 0) == (0, 0)\nassert simulate_meter(["up", "up", "down", "reset", "up"], 3) == (2, 3)\nassert simulate_meter(["up", "up", "up", "down"], 20) == (5, 6)',
        'Two state variables are sufficient. The peak update happens after each clamped transition and never decreases.',
        'Initialize both counters to zero; use min/max for the boundaries and keep peak separate from level.',
      ),
    ],
    [
      [
        'What should a simulation loop invariant describe?',
        'The exact state after the events already processed, including any running summaries.',
      ],
      [
        'Does resetting a current value reset its historical maximum?',
        'Only if the specification says so. Keep current state and history as separate variables.',
      ],
    ],
  ),
  skill(
    'cp-enumeration',
    'cp-foundations',
    'Enumerate candidates completely',
    'Build a correct baseline by checking every valid candidate once.',
    ['cp-enumerate-index-pairs', 'cp-enumerate-score', 'cp-enumerate-best'],
    [
      'Enumeration lists every candidate in a search space, evaluates each one, and keeps the best valid result. For the smallest gap between two positions in an unsorted list, candidates are index pairs i < j. This restriction excludes pairing an item with itself and avoids visiting the same unordered pair twice.',
      'The invariant is that best equals the smallest gap among the pairs already visited. Start without a best value, because lists shorter than two have no pair at all. After evaluating a new pair, replace best only when its gap is smaller. Correctness follows from complete coverage: the optimal pair must occur among the enumerated candidates.',
      'There are n(n − 1)/2 unordered pairs, so constant-cost scoring gives O(n²) time and O(1) additional space. Enumeration is an excellent reference for small inputs and for checking a faster method. It is not automatically suitable for large constraints; the next decision is whether ordering or another invariant can eliminate most candidates safely.',
    ],
    'values = [14, 3, 9, 11]\nbest = None\nfor i in range(len(values)):\n    for j in range(i + 1, len(values)):\n        gap = abs(values[i] - values[j])\n        if best is None or gap < best:\n            best = gap\nprint(best)',
    '2',
    'The gap between 9 and 11 is the smallest of the six distinct-index pairs.',
    [
      choice(
        'How many unordered distinct-index pairs are there in a list of five values?',
        ['5', '10', '20', '25'],
        1,
        'The count is 5 × 4 / 2 = 10.',
        'Choose two different indices; ignore their order.',
      ),
      choice(
        'Why enumerate only j > i for an unordered pair problem?',
        [
          'It skips all duplicate values',
          'It guarantees the list is sorted',
          'It uses every index exactly once',
          'It avoids self-pairs and mirrored duplicates',
        ],
        3,
        'Each unordered pair appears exactly once as its smaller index followed by its larger index.',
        'Compare (i, j) with (j, i).',
      ),
      choice(
        'What does this program print?',
        ['0', '3', '6', 'None'],
        0,
        'The equal values at different indices form a valid pair with gap zero.',
        'Equal values are allowed when their indices differ.',
        'values = [8, 8, 14]\nbest = None\nfor i in range(len(values)):\n    for j in range(i + 1, len(values)):\n        gap = abs(values[i] - values[j])\n        if best is None or gap < best:\n            best = gap\nprint(best)',
      ),
      exercise(
        'Implement smallest_pair_gap(values) for a list of integers. Return the minimum absolute difference between values at two distinct indices, or None if fewer than two values exist. Do not change the input list. Build the exhaustive pair-enumeration baseline.',
        'def smallest_pair_gap(values):\n    # Check all unordered distinct-index pairs and track the best gap.\n    pass',
        'def smallest_pair_gap(values):\n    best = None\n    for i in range(len(values)):\n        for j in range(i + 1, len(values)):\n            gap = abs(values[i] - values[j])\n            if best is None or gap < best:\n                best = gap\n    return best',
        'assert smallest_pair_gap([]) is None\nassert smallest_pair_gap([9]) is None\nassert smallest_pair_gap([14, 3, 9, 11]) == 2\nassert smallest_pair_gap([8, 8, 14]) == 0\nassert smallest_pair_gap([-7, -2, 5]) == 5\nassert smallest_pair_gap([20, -5]) == 25\nvalues = [5, 1, 9]\nassert smallest_pair_gap(values) == 4\nassert values == [5, 1, 9], "Do not modify the input list."',
        'The loops visit every valid pair exactly once. None distinguishes no candidate from a legitimate gap of zero.',
        'Start best at None, loop j from i + 1, and minimize abs(values[i] - values[j]).',
      ),
    ],
    [
      [
        'What proves a brute-force optimum is correct?',
        'Every valid candidate is evaluated, and the running best is optimal among those already checked.',
      ],
      [
        'How many unordered pairs of distinct indices does an n-element list have?',
        'n(n − 1)/2, giving quadratic growth for constant-cost pair scoring.',
      ],
    ],
  ),
  skill(
    'cp-sorting',
    'cp-collections',
    'Order records with a key',
    'Make order and tie-breaking rules explicit.',
    ['cp-sort-stability'],
    [
      'Sorting arranges values according to a comparison rule. sorted(values) creates a new list; values.sort() changes the original list and returns None. Supply a key function for records: lambda job: expression defines a short function that returns the expression for each job. A tuple key is compared field by field, so (deadline, -effort) orders earlier deadlines first and larger effort first within the same deadline.',
      'The result must preserve all records while making their keys nondecreasing. Python sorting is stable: records with equal keys keep their original relative order. Stability is useful when arrival order is meaningful; it does not invent an additional tie-breaker. Include every intended tie-breaker in the key and leave genuine ties in their original order.',
      'With constant-cost keys and comparisons, sorting n records takes O(n log n) worst-case time. Returning a newly sorted list needs O(n) storage. Ordering can expose neighboring candidates or enable a later linear scan, but that scan does not remove the cost of first sorting the data. Preserve the input when a function contract requires it.',
    ],
    'jobs = [(4, 2, "oak"), (2, 3, "fern"), (4, 5, "pine")]\nordered = sorted(jobs, key=lambda job: (job[0], -job[1]))\nprint(ordered)\nprint(jobs[0])',
    "[(2, 3, 'fern'), (4, 5, 'pine'), (4, 2, 'oak')]\n(4, 2, 'oak')",
    'Deadline 2 comes first. At deadline 4, effort 5 precedes effort 2. The original list is unchanged.',
    [
      choice(
        'What does this program print?',
        ['[1, 3, 5]', 'None', '[5, 1, 3]', 'True'],
        1,
        'list.sort modifies values in place and returns None.',
        'Separate the changed list from the method result.',
        'values = [5, 1, 3]\nresult = values.sort()\nprint(result)',
      ),
      choice(
        'Which key sorts (deadline, effort, label) by deadline ascending, then effort descending?',
        [
          '(job[1], job[0])',
          '(-job[0], job[1])',
          '(job[0], -job[1])',
          'job[2]',
        ],
        2,
        'The first key field selects ascending deadline; negating effort reverses its numeric order within ties.',
        'Tuple comparisons examine the first field before the second.',
      ),
      choice(
        'Two records have equal sort keys. What does a stable sort preserve?',
        [
          'Their original relative order',
          'Their labels in alphabetic order',
          'Their numeric values in descending order',
          'Only the last record',
        ],
        0,
        'Stability retains the original order among records with identical keys.',
        'An equal key does not authorize a new tie-breaker.',
      ),
      exercise(
        'Implement order_jobs(jobs). Each record is a tuple (deadline, effort, label), with integer deadline and effort. Return a new list ordered by deadline ascending, then effort descending. Preserve the input and retain arrival order for equal keys.',
        'def order_jobs(jobs):\n    # Return a sorted copy using the requested two-part key.\n    pass',
        'def order_jobs(jobs):\n    return sorted(jobs, key=lambda job: (job[0], -job[1]))',
        'assert order_jobs([]) == []\nassert order_jobs([(2, 7, "only")]) == [(2, 7, "only")]\nassert order_jobs([(4, 2, "oak"), (2, 3, "fern"), (4, 5, "pine")]) == [(2, 3, "fern"), (4, 5, "pine"), (4, 2, "oak")]\nassert order_jobs([(1, 3, "z"), (1, 3, "a")]) == [(1, 3, "z"), (1, 3, "a")]\nassert order_jobs([(-2, 1, "x"), (-2, 4, "y"), (0, 8, "z")]) == [(-2, 4, "y"), (-2, 1, "x"), (0, 8, "z")]\njobs = [(3, 1, "first"), (1, 9, "second")]\nassert order_jobs(jobs) == [(1, 9, "second"), (3, 1, "first")]\nassert jobs == [(3, 1, "first"), (1, 9, "second")]',
        'sorted creates a separate list. Its tuple key implements the requested tie-breaking rule, and equal keys retain their input order.',
        'Use sorted with key=lambda job: (job[0], -job[1]); do not include the label as an extra tie-breaker.',
      ),
    ],
    [
      [
        'How do sorted(values) and values.sort() differ?',
        'sorted returns a new sorted list; list.sort changes the existing list and returns None.',
      ],
      [
        'What does sorting stability guarantee?',
        'Records with equal keys keep their original relative order.',
      ],
    ],
  ),
  skill(
    'cp-hashing',
    'cp-collections',
    'Index values with hash tables',
    'Use membership and frequency maps to avoid repeated scans.',
    ['cp-hash-filter', 'cp-complexity'],
    [
      'A hash table associates a key with a stored value. Python dictionaries support key lookup and sets support membership. If you repeatedly search a list from the beginning, n lookups can cost O(n²); expected constant-time hash lookups can turn many such routines into an expected O(n) scan. Keys must be hashable, such as strings or integers; ordinary lists are not dictionary keys.',
      'For a frequency map, the invariant is that counts[key] equals the occurrences of that key in the processed prefix. counts.get(key, 0) supplies zero for a first occurrence. Increment once per item, then inspect the resulting counts to answer questions about duplicates or multiplicities. A set alone records presence and cannot distinguish two occurrences from ten.',
      'For n items with u distinct keys, building a frequency map takes expected O(n) time and O(u) storage. Hashing has worst cases, so O(1) lookup is an expected bound rather than a universal guarantee. Choose the representation from the question: presence needs a set; counts or associated records need a dictionary.',
    ],
    'labels = ["north", "west", "north", "north"]\ncounts = {}\nfor label in labels:\n    counts[label] = counts.get(label, 0) + 1\nprint(counts)\nprint(counts.get("south", 0))',
    "{'north': 3, 'west': 1}\n0",
    'The map keeps multiplicity for each encountered label and reports zero for a missing label.',
    [
      choice(
        'What information is lost if a frequency dictionary is replaced by a set?',
        [
          'Whether a label ever appeared',
          'The number of times each label appeared',
          'Whether membership can be checked',
          'Whether strings can be stored',
        ],
        1,
        'A set stores unique keys but does not store their counts.',
        'Presence and multiplicity are different questions.',
      ),
      choice(
        'What does this program print?',
        ['0', '1', '2', 'A KeyError'],
        2,
        'The two occurrences of "a" each add one, starting from the default zero.',
        'Trace the count after each token.',
        'counts = {}\nfor token in ["a", "b", "a"]:\n    counts[token] = counts.get(token, 0) + 1\nprint(counts["a"])',
      ),
      choice(
        'Which statement correctly describes ordinary hash-table lookup?',
        [
          'Expected O(1), with possible worse cases',
          'Always O(log n)',
          'Always O(n²)',
          'Always O(1), without exceptions',
        ],
        0,
        'Hash tables normally provide expected constant-time operations, but collisions can make the worst case slower.',
        'Keep expected behavior separate from worst-case guarantees.',
      ),
      exercise(
        'Implement repeat_report(labels) for a list of hashable labels. Return a dictionary containing only labels that occur at least twice, mapped to their full occurrence counts. Return {} for no repetitions and leave the input unchanged. A hidden case with 200,000 labels must finish within 3 seconds.',
        'def repeat_report(labels):\n    # Count labels, then keep those with at least two occurrences.\n    pass',
        'def repeat_report(labels):\n    counts = {}\n    for label in labels:\n        counts[label] = counts.get(label, 0) + 1\n    repeated = {}\n    for label, count in counts.items():\n        if count >= 2:\n            repeated[label] = count\n    return repeated',
        withLargeCase(
          'assert repeat_report([]) == {}\nassert repeat_report(["a", "b", "c"]) == {}\nassert repeat_report(["north", "west", "north", "north"]) == {"north": 3}\nassert repeat_report([2, -1, 2, -1, 0]) == {2: 2, -1: 2}\nassert repeat_report(["x"] * 5) == {"x": 5}\nlabels = ["p", "q", "q", "p", "r"]\nassert repeat_report(labels) == {"p": 2, "q": 2}\nassert labels == ["p", "q", "q", "p", "r"]',
          `_labels = _numbers(200000, 0, 150000, 11)
_result, _seconds = _timed(repeat_report, _labels)
assert _checksum(sorted(_result.items())) == 1332624839871332808, "The 200,000-label case returned the wrong report."
_check_time(_seconds, "The 200,000-label case", "Count every label in one pass with a dictionary instead of calling count() for each label.")`,
        ),
        'One scan maintains the frequency invariant; a scan over the u keys filters the map. Expected time is O(n + u), or O(n), with O(u) additional space.',
        'Use get(label, 0) + 1 while counting, then keep dictionary entries whose count is at least two.',
      ),
    ],
    [
      [
        'When should you use a set instead of a frequency dictionary?',
        'Use a set for presence; use a dictionary when counts or associated values matter.',
      ],
      [
        'What invariant does a frequency-map scan maintain?',
        'Each stored count equals that key’s occurrences in the prefix processed so far.',
      ],
    ],
  ),
  skill(
    'cp-linked-lists',
    'cp-collections',
    'Follow linked nodes',
    'Traverse next references rather than assuming contiguous storage.',
    ['cp-link-count', 'unpacking'],
    [
      'A linked list stores a value and a next reference in each node. Nodes need not occupy neighboring positions. In this lesson a dictionary maps a node ID to a tuple (value, next_id); None marks the end. The head is the first node ID, and following references determines the list order, regardless of dictionary insertion order.',
      'Before each iteration, current identifies the next unvisited node, and the output contains the values already visited in link order. Read its value and next reference, append the value, then continue from the next ID. Use current is not None rather than a truthiness test: the valid node ID 0 must still be visited.',
      'Assume the chain is finite and acyclic and that every referenced node exists. Under expected constant-time dictionary lookup, visiting k reachable nodes takes O(k) time. Traversal uses O(1) state beyond the O(k) returned list. Cycles require a separate detection strategy; without the acyclic precondition, this simple loop need not terminate.',
    ],
    'nodes = {"end": (9, None), "start": (4, "end")}\ncurrent = "start"\nvalues = []\nwhile current is not None:\n    value, current = nodes[current]\n    values.append(value)\nprint(values)',
    '[4, 9]',
    'The start reference is followed before end even though end was inserted into the dictionary first.',
    [
      choice(
        'What determines the traversal order of a linked list?',
        [
          'Dictionary insertion order',
          'Alphabetic node IDs',
          'The head and next references',
          'The smallest stored value',
        ],
        2,
        'The links encode the sequence; storage order is unrelated.',
        'Follow the next field from the head.',
      ),
      choice(
        'Why test current is not None instead of while current?',
        [
          'It sorts the nodes',
          'It still visits the valid ID 0',
          'It detects all cycles',
          'It prevents every missing-key error',
        ],
        1,
        'Zero is false in a truthiness test but may be a legitimate node identifier.',
        'The terminal sentinel is None, not every false value.',
      ),
      choice(
        'What does this program print?',
        ['[8, 5, 3]', '[8, 3, 5]', '[3, 5, 8]', '[5, 3]'],
        0,
        'Starting at a follows c and then b, so the values are 8, 5, and 3.',
        'Use the stored next IDs rather than the dictionary’s key order.',
        'nodes = {"a": (8, "c"), "b": (3, None), "c": (5, "b")}\ncurrent = "a"\nvalues = []\nwhile current is not None:\n    value, current = nodes[current]\n    values.append(value)\nprint(values)',
      ),
      exercise(
        'Implement chain_values(nodes, head). nodes maps node IDs to (value, next_id) tuples, and None ends the chain. Return the reachable values in link order. A None head returns []. Assume the reachable chain is finite, acyclic, and has no missing IDs. Do not modify nodes.',
        'def chain_values(nodes, head):\n    # Follow next references until the None sentinel.\n    pass',
        'def chain_values(nodes, head):\n    values = []\n    current = head\n    while current is not None:\n        value, current = nodes[current]\n        values.append(value)\n    return values',
        'assert chain_values({}, None) == []\nassert chain_values({"a": (7, None)}, "a") == [7]\nassert chain_values({0: (7, 1), 1: (8, None)}, 0) == [7, 8]\nassert chain_values({"a": (8, "c"), "b": (3, None), "c": (5, "b")}, "a") == [8, 5, 3]\nassert chain_values({"unused": (99, None), "head": (2, None)}, "head") == [2]\nnodes = {"p": (4, "q"), "q": (4, None)}\nassert chain_values(nodes, "p") == [4, 4]\nassert nodes == {"p": (4, "q"), "q": (4, None)}',
        'Reading the tuple advances current while preserving its value for the output. The explicit None check supports every valid ID, including zero.',
        'Initialize current = head; unpack value, next_id from nodes[current], append the value, and advance.',
      ),
    ],
    [
      [
        'What is the linked-list traversal invariant?',
        'The output contains the visited prefix in link order, and current identifies the next node to visit.',
      ],
      [
        'What preconditions make a simple next-reference loop terminate safely?',
        'The reachable chain is acyclic, ends at None, and every referenced node exists.',
      ],
    ],
  ),
  skill(
    'cp-strings',
    'cp-collections',
    'Normalize and count characters',
    'Define the alphabet before aggregating text.',
    ['cp-text-filter', 'cp-hash-frequency', 'cp-complexity'],
    [
      'String algorithms start with a precise definition of a character and the equivalences the task allows. Here the alphabet is the 26 ASCII letters a–z; uppercase ASCII letters count as their lowercase equivalents, and every other character is ignored. That rule differs from counting every Unicode letter or treating punctuation as meaningful.',
      'Scan characters and normalize each accepted one before updating its count. The invariant is that the map records the accepted letters in the processed prefix, already normalized. Python strings are immutable, so methods such as lower() return a new string rather than changing the original. Only ASCII uppercase characters need conversion for this contract.',
      'For L characters, a single scan takes O(L) time under ordinary dictionary lookup. At most 26 keys are stored, so the auxiliary space is O(1) for this fixed alphabet. For an unbounded token vocabulary, that space bound would become O(u) instead. Text normalization is part of the specification, not a universal improvement to apply blindly.',
    ],
    'text = "Cab? C!"\ncounts = {}\nfor char in text:\n    if "A" <= char <= "Z":\n        char = char.lower()\n    if "a" <= char <= "z":\n        counts[char] = counts.get(char, 0) + 1\nprint(counts)\nprint(text)',
    "{'c': 2, 'a': 1, 'b': 1}\nCab? C!",
    'The map merges C with c, ignores punctuation and spaces, and leaves the input string unchanged.',
    [
      choice(
        'What does this program print?',
        ['cat', 'CAT', 'Cat', 'None'],
        1,
        'lower returns a new string; the original value remains "CAT" when the result is not assigned.',
        'String methods do not mutate the existing string.',
        'text = "CAT"\ntext.lower()\nprint(text)',
      ),
      choice(
        'For a count map restricted to the 26 ASCII letters, what is the storage bound in terms of text length L?',
        ['O(L²)', 'O(L)', 'O(1)', 'O(log L)'],
        2,
        'The number of possible keys is bounded by 26, independently of L.',
        'The accepted alphabet is fixed.',
      ),
      choice(
        'A task distinguishes "A" from "a". Should you lowercase before counting?',
        [
          'Yes, normalization is always harmless',
          'Only when the input is long',
          'Yes, because dictionaries ignore case',
          'No, that would merge distinct task values',
        ],
        3,
        'Normalization must preserve the distinctions required by the specification.',
        'An equivalence must be authorized by the task.',
      ),
      exercise(
        'Implement letter_inventory(text). Return a dictionary counting ASCII letters a–z, ignoring case for ASCII A–Z. Ignore digits, punctuation, whitespace, and non-ASCII characters. Store only letters that appear. Do not alter the input text.',
        'def letter_inventory(text):\n    # Normalize accepted ASCII letters and count them.\n    pass',
        'def letter_inventory(text):\n    counts = {}\n    for char in text:\n        if "A" <= char <= "Z":\n            char = char.lower()\n        if "a" <= char <= "z":\n            counts[char] = counts.get(char, 0) + 1\n    return counts',
        'assert letter_inventory("") == {}\nassert letter_inventory("123 !\\n") == {}\nassert letter_inventory("Cab? C!") == {"c": 2, "a": 1, "b": 1}\nassert letter_inventory("AaZz") == {"a": 2, "z": 2}\nassert letter_inventory("éİßA") == {"a": 1}\nassert letter_inventory("one TWO") == {"o": 2, "n": 1, "e": 1, "t": 1, "w": 1}\ntext = "Bee-2"\nassert letter_inventory(text) == {"b": 1, "e": 2}\nassert text == "Bee-2"',
        'The ASCII checks define the accepted alphabet before counting. Converting only A–Z avoids accidentally interpreting non-ASCII lowercase expansions as accepted input.',
        'Check A <= char <= Z before lowercasing, then count only a <= char <= z.',
      ),
    ],
    [
      [
        'Why must normalization follow the task specification?',
        'It can merge values that the task needs to distinguish, such as uppercase and lowercase letters.',
      ],
      [
        'Why can a character count map use constant space?',
        'When the accepted alphabet has a fixed bound, the number of possible stored keys is also fixed.',
      ],
    ],
  ),
  skill(
    'cp-prefix-sums',
    'cp-linear',
    'Answer range totals with prefixes',
    'Precompute cumulative totals and subtract two boundaries per query.',
    ['cp-prefix-build', 'cp-prefix-query', 'cp-complexity'],
    [
      'A prefix sum stores a total for each boundary between elements. Define prefix[0] = 0 and prefix[i + 1] = prefix[i] + values[i]. The invariant is that prefix[i] equals the sum of the first i values. This extra zero makes empty ranges and ranges beginning at index zero follow the same formula as every other range.',
      'Use half-open ranges [left, right): left is included and right is excluded. The range total is prefix[right] − prefix[left], because the earlier prefix cancels everything before left. This identity works with negative values too; it does not require totals to increase. Require 0 ≤ left ≤ right ≤ n, where n is the list length.',
      'Building the prefix table takes O(n) time and O(n) space. Each query then costs O(1), so q queries take O(n + q) time overall. This table describes a fixed list: changing one element can invalidate many later prefix entries. Choose it when many range queries justify preprocessing, rather than rebuilding it for each query.',
    ],
    'values = [6, -2, 5, 1]\nprefix = [0]\nfor value in values:\n    prefix.append(prefix[-1] + value)\nprint(prefix)\nprint(prefix[3] - prefix[1])',
    '[0, 6, 4, 9, 10]\n3',
    'The range [1, 3) contains -2 and 5. Subtracting the total before index 1 from the total before index 3 gives 3.',
    [
      choice(
        'Why does a prefix table begin with an extra zero?',
        [
          'To remove negative input values',
          'To make every query include index zero',
          'To represent the boundary before any values',
          'To double the number of queries',
        ],
        2,
        'The zero is the total of the empty prefix and represents boundary 0.',
        'Prefixes describe boundaries, not just elements.',
      ),
      choice(
        'What does this program print?',
        ['1', '5', '7', '8'],
        1,
        'prefix[3] - prefix[1] is 8 - 3 = 5, covering indices 1 and 2.',
        'The right boundary is excluded.',
        'values = [3, -2, 7]\nprefix = [0]\nfor value in values:\n    prefix.append(prefix[-1] + value)\nprint(prefix[3] - prefix[1])',
      ),
      choice(
        'After O(n) preprocessing, how long do q valid range-sum queries take?',
        ['O(nq)', 'O(q²)', 'O(n log q)', 'O(q)'],
        3,
        'Each query performs two table reads and a subtraction, independent of range length.',
        'Count work after the table already exists.',
      ),
      exercise(
        'Implement range_totals(values, queries). values is a list of integers; queries is a list of (left, right) half-open ranges with 0 <= left <= right <= len(values). Return their sums in query order using one prefix table. Empty ranges have total 0. Do not change either input. A hidden case with 200,000 values and 200,000 queries must finish within 3 seconds.',
        'def range_totals(values, queries):\n    # Build one prefix table, then answer every half-open query.\n    pass',
        'def range_totals(values, queries):\n    prefix = [0]\n    for value in values:\n        prefix.append(prefix[-1] + value)\n    totals = []\n    for left, right in queries:\n        totals.append(prefix[right] - prefix[left])\n    return totals',
        withLargeCase(
          'assert range_totals([], []) == []\nassert range_totals([], [(0, 0)]) == [0]\nassert range_totals([6, -2, 5, 1], [(1, 3), (0, 4), (2, 2), (4, 4)]) == [3, 10, 0, 0]\nassert range_totals([-4, 4, -1], [(0, 2), (1, 3), (0, 3)]) == [0, 3, -1]\nassert range_totals([8], [(0, 1), (0, 0), (1, 1)]) == [8, 0, 0]\nvalues = [2, 7, -3]\nqueries = [(0, 3), (1, 2)]\nassert range_totals(values, queries) == [6, 7]\nassert values == [2, 7, -3]\nassert queries == [(0, 3), (1, 2)]',
          `_values = _numbers(200000, -1000, 1000, 21)
_ends = _numbers(400000, 0, 200000, 22)
_queries = [(min(_ends[i], _ends[i + 1]), max(_ends[i], _ends[i + 1])) for i in range(0, 400000, 2)]
_result, _seconds = _timed(range_totals, _values, _queries)
assert _checksum(_result) == 1583528261156788488, "The 200,000-query case returned wrong totals."
_check_time(_seconds, "The 200,000-query case", "Answer each query from the prefix table instead of re-adding its range.")`,
        ),
        'The prefix invariant proves the subtraction formula. The result list preserves query order; preprocessing happens only once.',
        'Start prefix at [0], append cumulative totals, and use prefix[right] - prefix[left] for each query.',
      ),
    ],
    [
      [
        'What does prefix[i] represent when prefix[0] = 0?',
        'The sum of values at indices 0 through i − 1, or the first i elements.',
      ],
      [
        'How do you sum a half-open range [left, right) from prefix totals?',
        'Subtract prefix[left] from prefix[right]. Empty ranges then produce zero automatically.',
      ],
    ],
  ),
  skill(
    'cp-difference-arrays',
    'cp-linear',
    'Batch range changes with differences',
    'Mark where an addition starts and stops, then reconstruct once.',
    ['cp-difference-recover'],
    [
      'A difference array represents changes between neighboring values. For a zero-filled list, adding delta to the half-open range [left, right) needs only two boundary marks: difference[left] += delta and difference[right] -= delta. The first mark activates the addition and the second cancels it before the excluded right endpoint.',
      'Store n + 1 difference entries for n output values, so an update ending at n has a valid cancellation slot. During reconstruction, the running sum at position i equals the sum of all additions active there. This invariant follows because every interval has contributed its start mark and only intervals ending earlier have contributed their cancellation marks. Empty updates [i, i) cancel themselves immediately.',
      'With u updates, marking boundaries and taking one prefix scan costs O(n + u) time and O(n) additional space, excluding the returned list. Negative deltas work without a separate rule. Require n ≥ 0 and 0 ≤ left ≤ right ≤ n. This method is for batched changes followed by reconstruction; it does not provide immediate arbitrary online range queries.',
    ],
    'size = 5\nupdates = [(1, 4, 3), (0, 2, 2)]\ndifference = [0] * (size + 1)\nfor left, right, delta in updates:\n    difference[left] += delta\n    difference[right] -= delta\nvalues = []\nrunning = 0\nfor index in range(size):\n    running += difference[index]\n    values.append(running)\nprint(values)',
    '[2, 5, 3, 3, 0]',
    'The two additions overlap at index 1, producing 5. The cancellation at boundary 4 prevents the first addition from reaching index 4.',
    [
      choice(
        'For a half-open addition [left, right), where is the negative cancellation mark placed?',
        [
          'At right',
          'At right - 1',
          'At left - 1',
          'At every position in the range',
        ],
        0,
        'The mark at right cancels the addition before the first excluded position.',
        'Ask where the update must stop affecting values.',
      ),
      choice(
        'What does this program print?',
        ['[4, 4, 4]', '[0, 4, 4]', '[4, 4, 0]', '[4, 0, 0]'],
        2,
        'The +4 starts at boundary 0 and the -4 ends it at boundary 2, so only indices 0 and 1 change.',
        'Carry a running total of the boundary marks.',
        'difference = [4, 0, -4, 0]\nvalues = []\nrunning = 0\nfor index in range(3):\n    running += difference[index]\n    values.append(running)\nprint(values)',
      ),
      choice(
        'Why allocate n + 1 difference entries for n output values?',
        [
          'To output an extra zero',
          'To store every possible pair',
          'To make updates quadratic',
          'To allow cancellation at boundary n',
        ],
        3,
        'A range may end just past the last output position, at boundary n.',
        'The last boundary is not an output element.',
      ),
      exercise(
        'Implement apply_additions(size, updates). Begin with size zeros. Each (left, right, delta) adds delta to the half-open range [left, right). Return the final integer list using a difference array. Assume size >= 0 and all boundaries satisfy 0 <= left <= right <= size. Leave updates unchanged. A hidden case with 200,000 positions and 200,000 updates must finish within 3 seconds.',
        'def apply_additions(size, updates):\n    # Mark start/end changes, then reconstruct the size output values.\n    pass',
        'def apply_additions(size, updates):\n    difference = [0] * (size + 1)\n    for left, right, delta in updates:\n        difference[left] += delta\n        difference[right] -= delta\n    values = []\n    running = 0\n    for index in range(size):\n        running += difference[index]\n        values.append(running)\n    return values',
        withLargeCase(
          'assert apply_additions(0, []) == []\nassert apply_additions(0, [(0, 0, 5)]) == []\nassert apply_additions(4, []) == [0, 0, 0, 0]\nassert apply_additions(5, [(1, 4, 3), (0, 2, 2)]) == [2, 5, 3, 3, 0]\nassert apply_additions(3, [(0, 3, 7), (1, 2, -9)]) == [7, -2, 7]\nassert apply_additions(3, [(1, 1, 100), (3, 3, -4)]) == [0, 0, 0]\nupdates = [(0, 1, -2), (1, 3, 4)]\nassert apply_additions(3, updates) == [-2, 4, 4]\nassert updates == [(0, 1, -2), (1, 3, 4)]',
          `_ends = _numbers(400000, 0, 200000, 31)
_deltas = _numbers(200000, -50, 50, 32)
_updates = [(min(_ends[2 * i], _ends[2 * i + 1]), max(_ends[2 * i], _ends[2 * i + 1]), _deltas[i]) for i in range(200000)]
_result, _seconds = _timed(apply_additions, 200000, _updates)
assert _checksum(_result) == 1683390223532082913, "The 200,000-update case returned wrong values."
_check_time(_seconds, "The 200,000-update case", "Mark each update at its two boundaries and reconstruct once instead of looping over every range.")`,
        ),
        'Boundary changes add independently, including overlaps and negative deltas. A single prefix scan combines all currently active additions.',
        'Allocate size + 1 zeros; add delta at left and subtract it at right, then accumulate only the first size entries.',
      ),
    ],
    [
      [
        'How does a difference array encode adding delta on [left, right)?',
        'Add delta at left and subtract delta at right, then take prefix sums to reconstruct values.',
      ],
      [
        'What invariant explains difference-array reconstruction?',
        'The running sum at each position equals all interval additions currently active there.',
      ],
    ],
  ),
  skill(
    'cp-two-pointers',
    'cp-linear',
    'Discard candidates with two pointers',
    'Use sorted order to count or reject whole groups of pairs.',
    [
      'cp-pointer-discard',
      'cp-pointer-count-block',
      'while-loops',
      'ranges',
      'cp-sort-copy',
    ],
    [
      'Two pointers mark the ends of a remaining candidate interval. For an ascending list, let left point at its smallest remaining value and right at its largest. We want the number of distinct-index pairs whose sum is at most a limit. Values may repeat or be negative; the required property is sorted order.',
      'If values[left] + values[right] fits, the left value fits with every value between left + 1 and right. Count right − left pairs and advance left. If the sum is too large, even the smallest remaining value cannot pair with right, so discard right. The invariant is that all pairs outside the remaining interval have been counted or proved invalid, and every pair inside remains undecided.',
      'Each step moves one pointer inward, giving O(n) time and O(1) additional space for an already sorted list. When starting from unsorted data, sorting adds O(n log n) time and may require a copy. Duplicate values at different indices still form distinct pairs. Moving a pointer is justified by the order proof, not merely by hoping the next pair will fit.',
    ],
    'values = [1, 4, 6, 9]\nlimit = 10\nleft = 0\nright = len(values) - 1\ncount = 0\nwhile left < right:\n    if values[left] + values[right] <= limit:\n        count += right - left\n        left += 1\n    else:\n        right -= 1\nprint(count)',
    '4',
    'The first value pairs with all three later values; the pair 4 + 6 supplies the fourth valid pair.',
    [
      choice(
        'Why can a fitting outer pair contribute right - left pairs at once?',
        [
          'The list contains no duplicates',
          'Every middle value is no larger than the right value',
          'Every pair has the same sum',
          'The pointers are adjacent',
        ],
        1,
        'Sorted order guarantees that replacing the right value with an earlier one cannot increase this pair sum.',
        'Hold the left value fixed and compare the possible partners.',
      ),
      choice(
        'Which precondition makes these two-pointer eliminations valid?',
        [
          'All values are positive',
          'All values are distinct',
          'The number of values is even',
          'The values are sorted ascending',
        ],
        3,
        'The comparisons depend on smallest and largest remaining values being at the interval boundaries.',
        'The proof uses order, including when values are negative.',
      ),
      choice(
        'What does this program print?',
        ['2', '3', '1', '0'],
        0,
        'The valid pairs are 1 + 2 and 1 + 5. The pair 2 + 5 exceeds 6.',
        'Count pairs by indices, with each unordered pair visited once.',
        'values = [1, 2, 5]\nleft = 0\nright = len(values) - 1\ncount = 0\nwhile left < right:\n    if values[left] + values[right] <= 6:\n        count += right - left\n        left += 1\n    else:\n        right -= 1\nprint(count)',
      ),
      exercise(
        'Implement count_light_pairs(sorted_values, limit). sorted_values is an ascending list of integers. Return the number of unordered pairs of distinct indices whose values sum to at most limit. Count duplicate values at different indices separately. Use two pointers and do not change the input. A hidden case with 200,000 values must finish within 3 seconds.',
        'def count_light_pairs(sorted_values, limit):\n    # Count proven-fitting partners or discard the largest remaining value.\n    pass',
        'def count_light_pairs(sorted_values, limit):\n    left = 0\n    right = len(sorted_values) - 1\n    count = 0\n    while left < right:\n        if sorted_values[left] + sorted_values[right] <= limit:\n            count += right - left\n            left += 1\n        else:\n            right -= 1\n    return count',
        withLargeCase(
          'assert count_light_pairs([], 10) == 0\nassert count_light_pairs([4], 10) == 0\nassert count_light_pairs([1, 4, 6, 9], 10) == 4\nassert count_light_pairs([2, 2, 2], 4) == 3\nassert count_light_pairs([-4, -1, 2, 5], 1) == 4\nassert count_light_pairs([3, 6, 9], 2) == 0\nassert count_light_pairs([1, 2, 3, 4], 100) == 6\nvalues = [-5, 0, 3]\nassert count_light_pairs(values, 0) == 2\nassert values == [-5, 0, 3]',
          `_values = sorted(_numbers(200000, -10**6, 10**6, 41))
_result, _seconds = _timed(count_light_pairs, _values, 12345)
assert _result == 10149814211, "The 200,000-value case returned the wrong count."
_check_time(_seconds, "The 200,000-value case", "Count a whole block of partners per pointer move instead of testing every pair.")`,
        ),
        'Every counted block shares the same left endpoint, so advancing left prevents double counting. A too-large outer sum proves that the current right value has no remaining valid partner.',
        'If the outer sum fits, add right - left and advance left; otherwise decrease right.',
      ),
    ],
    [
      [
        'What justifies discarding right when the smallest-plus-largest sum is too large?',
        'Every other remaining partner is at least as large as the smallest, so none can make that right endpoint fit.',
      ],
      [
        'Why is this inward two-pointer scan linear?',
        'Each pointer moves only inward, so there are at most n − 1 pointer advances.',
      ],
    ],
  ),
  skill(
    'cp-sliding-window',
    'cp-linear',
    'Maintain a valid sliding window',
    'Track frequencies while finding the longest contiguous segment.',
    ['cp-window-repair', 'cp-complexity'],
    [
      'A sliding window is a contiguous section of a sequence, represented by a left boundary and a moving right boundary. To find the longest section containing at most k distinct labels, add each new right label to a frequency map. If the map contains too many labels, remove values from the left until the window is valid again.',
      'The map must describe exactly the current window: decrement each removed label and use del counts[label] to delete its entry when the count reaches zero. After shrinking, every earlier left boundary would still violate the distinct-label limit, so the current valid window is the longest one ending at this right position. Recording its length maintains the best length seen among all processed right endpoints.',
      'Both boundaries move forward at most n times, so the nested-looking shrink loop still gives expected O(n) time. A valid window has at most k distinct keys; the temporary expanded window can have k + 1, so auxiliary space is O(min(n, k + 1)). This proof depends on the chosen constraint: removing labels cannot increase the number of distinct labels. Other window problems require their own validity rule.',
    ],
    'labels = "abacba"\nmax_types = 2\ncounts = {}\nleft = 0\nbest = 0\nfor right in range(len(labels)):\n    label = labels[right]\n    counts[label] = counts.get(label, 0) + 1\n    while len(counts) > max_types:\n        old = labels[left]\n        counts[old] -= 1\n        if counts[old] == 0:\n            del counts[old]\n        left += 1\n    best = max(best, right - left + 1)\nprint(best)',
    '3',
    'The valid segment "aba" contains two distinct labels and has length three. No longer segment meets the limit.',
    [
      choice(
        'Why delete a frequency entry when its count reaches zero?',
        [
          'To sort the window',
          'To increase the number of distinct labels',
          'To make map size equal the number of labels still present',
          'To remove all copies of the label from the input',
        ],
        2,
        'A zero-count key would falsely contribute to len(counts) even though its label has left the window.',
        'The map represents the current window only.',
      ),
      choice(
        'Why can a shrinking loop inside a right-endpoint loop still run in linear time?',
        [
          'Each boundary advances at most n times in total',
          'The inner loop is never executed',
          'Dictionary entries are automatically sorted',
          'The input has no repeated labels',
        ],
        0,
        'The left boundary never restarts or moves backward, so all its advances total at most n.',
        'Count pointer advances across the whole run, not per outer iteration.',
      ),
      choice(
        'What does this program print?',
        ['0', '2', '3', '1'],
        3,
        'Removing the only red occurrence deletes its key, leaving only blue present.',
        'Zero-count keys must not represent present labels.',
        'counts = {"red": 1, "blue": 2}\ncounts["red"] -= 1\nif counts["red"] == 0:\n    del counts["red"]\nprint(len(counts))',
      ),
      exercise(
        'Implement longest_variety(labels, max_types). labels is a list of hashable labels and max_types is a nonnegative integer. Return the maximum length of a contiguous segment with at most max_types distinct labels. Empty input or max_types == 0 returns 0. Use a frequency map and moving boundaries; leave labels unchanged. A hidden case with 200,000 labels must finish within 3 seconds.',
        'def longest_variety(labels, max_types):\n    # Expand right, shrink until valid, and retain the best valid length.\n    pass',
        'def longest_variety(labels, max_types):\n    if max_types == 0:\n        return 0\n    counts = {}\n    left = 0\n    best = 0\n    for right in range(len(labels)):\n        label = labels[right]\n        counts[label] = counts.get(label, 0) + 1\n        while len(counts) > max_types:\n            old = labels[left]\n            counts[old] -= 1\n            if counts[old] == 0:\n                del counts[old]\n            left += 1\n        best = max(best, right - left + 1)\n    return best',
        withLargeCase(
          'assert longest_variety([], 3) == 0\nassert longest_variety(["a", "b"], 0) == 0\nassert longest_variety(["a", "a", "a", "a"], 1) == 4\nassert longest_variety(list("abacba"), 2) == 3\nassert longest_variety(["red", "blue", "red", "green", "blue"], 2) == 3\nassert longest_variety([1, 2, 3, 1], 5) == 4\nassert longest_variety([1, 2, 1, 2, 3], 2) == 4\nlabels = [1, 1, 2, 2, 3]\nassert longest_variety(labels, 1) == 2\nassert labels == [1, 1, 2, 2, 3]',
          `_noise = _numbers(200000, 0, 3, 51)
_labels = [i // 1000 + _noise[i] for i in range(200000)]
_result, _seconds = _timed(longest_variety, _labels, 20)
assert _result == 17021, "The 200,000-label case returned the wrong length."
_check_time(_seconds, "The 200,000-label case", "Move both window boundaries forward with a frequency map instead of rescanning from every start.")`,
        ),
        'The frequency invariant ensures that len(counts) is the actual distinct count. Each right endpoint contributes its longest valid window, and taking their maximum covers the optimum.',
        'Increment the incoming label, shrink while len(counts) is too large, and delete any outgoing label whose count becomes zero.',
      ),
    ],
    [
      [
        'What must a sliding-window frequency map represent?',
        'Exactly the labels in the current window, with zero-count keys removed.',
      ],
      [
        'What makes the at-most-k-distinct window repair valid?',
        'Removing elements cannot increase distinct count, and both window boundaries move only forward.',
      ],
    ],
  ),
  skill(
    'cp-binary-search',
    'cp-search',
    'Find an ordered boundary',
    'Keep a half-open candidate interval and preserve the first possible answer.',
    ['cp-binary-sentinel', 'while-loops'],
    [
      'Binary search discards half of an ordered search interval with each comparison. For an ascending list, a lower-bound search finds the first index whose value is at least a target. If no value qualifies, return n, the boundary just past the list. This definition handles duplicates precisely instead of returning an arbitrary matching index.',
      'Maintain a half-open interval [low, high), initially [0, n). All indices before low are known to contain values smaller than the target, and all indices at or after high are known to qualify. Examine mid = (low + high) // 2. If its value is too small, move low to mid + 1; otherwise move high to mid, preserving mid as a possible first answer. When low equals high, that boundary satisfies the invariant.',
      'The interval shrinks on every step, so a list of n values takes O(log(n + 1)) time and O(1) extra space. Sorted order is essential; binary search does not make arbitrary data searchable. A returned n is a valid boundary but not a valid list index. Check for it before retrieving a matching value.',
    ],
    'values = [2, 5, 5, 11]\ntarget = 5\nlow = 0\nhigh = len(values)\nwhile low < high:\n    mid = (low + high) // 2\n    if values[mid] < target:\n        low = mid + 1\n    else:\n        high = mid\nprint(low)',
    '1',
    'Both indices 1 and 2 hold 5; retaining qualifying midpoints finds the first one.',
    [
      choice(
        'A qualifying midpoint might be the first answer. Which update preserves it?',
        ['low = mid + 1', 'high = mid - 1', 'high = mid', 'low = high + 1'],
        2,
        'Setting the excluded high boundary to mid records that mid qualifies while searching for any earlier qualifying index.',
        'Do not discard the possible boundary by moving below it.',
      ),
      choice(
        'What does this program print?',
        ['1', '2', '3', '7'],
        1,
        'The first value at least 7 is 10 at index 2.',
        'Search for a boundary, not necessarily an exact match.',
        'values = [3, 6, 10]\nlow = 0\nhigh = len(values)\nwhile low < high:\n    mid = (low + high) // 2\n    if values[mid] < 7:\n        low = mid + 1\n    else:\n        high = mid\nprint(low)',
      ),
      choice(
        'A lower-bound function returns len(values). What does this mean?',
        [
          'The last item matches the target',
          'The input must be empty',
          'The list should be indexed at that position',
          'No item is at least the target',
        ],
        3,
        'The boundary after all elements means every value is smaller than the target.',
        'A boundary can sit just beyond the valid element indices.',
      ),
      exercise(
        'Implement first_at_least(values, target). values is an ascending list of integers. Return the first index i with values[i] >= target, or len(values) if none exists. Return 0 for an empty list. Use binary search, handle duplicates, and preserve the input. The checks disable the bisect module, and a hidden case of 100,000 searches in 200,000 values must finish within 3 seconds.',
        'def first_at_least(values, target):\n    # Find the first qualifying boundary in [0, len(values)].\n    pass',
        'def first_at_least(values, target):\n    low = 0\n    high = len(values)\n    while low < high:\n        mid = (low + high) // 2\n        if values[mid] < target:\n            low = mid + 1\n        else:\n            high = mid\n    return low',
        withoutShortcuts(
          'import bisect',
          'bisect',
          [
            'bisect_left',
            'bisect_right',
            'bisect',
            'insort_left',
            'insort_right',
            'insort',
          ],
          'This exercise asks you to write the binary search yourself, so the bisect module is disabled during the checks.',
          withLargeCase(
            'assert first_at_least([], 5) == 0\nassert first_at_least([2, 5, 5, 11], 5) == 1\nassert first_at_least([2, 5, 5, 11], 6) == 3\nassert first_at_least([2, 5, 5, 11], 12) == 4\nassert first_at_least([2, 5, 5, 11], -1) == 0\nassert first_at_least([4, 4, 4], 4) == 0\nassert first_at_least([-8, -3, 0, 2], -4) == 1\nvalues = [7]\nassert first_at_least(values, 7) == 0\nassert first_at_least(values, 8) == 1\nassert values == [7]',
            `_values = sorted(_numbers(200000, -10**9, 10**9, 61))
_targets = _numbers(100000, -10**9 - 5, 10**9 + 5, 62)
def _run():
    return [first_at_least(_values, target) for target in _targets]
_result, _seconds = _timed(_run)
assert _checksum(_result) == 1870136244434542145, "The 100,000-search case returned wrong boundaries."
_check_time(_seconds, "The 100,000-search case", "Halve the candidate interval on each step instead of scanning the list.")`,
          ),
        ),
        'The half-open interval avoids special handling for an empty list. The invariant keeps all too-small values to the left and qualifying values on the right until one boundary remains.',
        'Initialize high to len(values); move low past too-small midpoints, and set high to qualifying midpoints.',
      ),
    ],
    [
      [
        'What does a lower-bound search return?',
        'The first index with value ≥ target, or n when no value qualifies.',
      ],
      [
        'What invariant supports lower-bound binary search?',
        'Indices before low are too small; indices at or after high qualify; [low, high) remains undecided.',
      ],
    ],
  ),
  skill(
    'cp-search-answer',
    'cp-search',
    'Search a monotone answer space',
    'Separate a feasibility test from the search for the smallest feasible limit.',
    ['cp-capacity-bounds', 'cp-binary-search'],
    [
      'Sometimes the answer is a numeric limit rather than an element in a sorted list. Suppose nonnegative loads must be kept in their given order and partitioned into at most m consecutive, nonempty groups. We want the smallest possible maximum group total. For a proposed capacity, feasibility has a monotone boundary: an arrangement that fits at one capacity still fits at every larger capacity.',
      'Test a capacity greedily by putting each next load in the current group whenever it fits; otherwise open a new group. With nonnegative loads, taking the longest fitting prefix cannot force more groups than stopping that group earlier. The invariant is that the processed prefix has been assigned in order with every group total within the capacity. If too many groups are needed, the capacity is infeasible. A load greater than capacity also makes the test fail.',
      'The smallest search bound is the largest single load, and the total of all loads is a feasible upper bound when m ≥ 1. Binary search retains a feasible high bound and moves past infeasible midpoints. For total S, O(n) work per test gives O(n log(S + 1)) time and O(1) additional space. Empty input has answer zero. The nonnegative-load precondition matters: cancellation from later negative loads would invalidate this greedy rule.',
    ],
    'def minimum_capacity(weights, max_groups):\n    if not weights:\n        return 0\n    def fits(capacity):\n        groups = 1\n        current = 0\n        for weight in weights:\n            if weight > capacity:\n                return False\n            if current + weight > capacity:\n                groups += 1\n                current = weight\n            else:\n                current += weight\n        return groups <= max_groups\n    low = max(weights)\n    high = sum(weights)\n    while low < high:\n        mid = (low + high) // 2\n        if fits(mid):\n            high = mid\n        else:\n            low = mid + 1\n    return low\n\nprint(minimum_capacity([3, 5, 2, 4], 2))',
    '8',
    'Capacity 8 permits groups [3, 5] and [2, 4]. Capacity 7 requires three groups. The nested fits function checks one capacity using the enclosing weights and group limit.',
    [
      choice(
        'Why is capacity feasibility monotone for this partition task?',
        [
          'A grouping that fits still fits at every larger capacity',
          'Larger capacities always force more groups',
          'Every capacity below the largest load fits',
          'Input order changes with the capacity',
        ],
        0,
        'Increasing a permitted maximum cannot invalidate the same grouping.',
        'Keep the grouping fixed while increasing its allowance.',
      ),
      choice(
        'For nonempty nonnegative loads and at least one permitted group, which capacity is always feasible?',
        [
          'Zero',
          'The average rounded down',
          'The total of all loads',
          'The smallest load',
        ],
        2,
        'One group containing every load has a total equal to the overall sum.',
        'An upper bound needs a concrete feasible arrangement.',
      ),
      choice(
        'Why does the greedy test open a group only when the next load would exceed capacity?',
        [
          'It sorts the loads automatically',
          'With nonnegative loads, extending a fitting prefix cannot increase the minimum groups needed',
          'Every valid solution has equal-sized groups',
          'It allows oversized individual loads',
        ],
        1,
        'Taking the longest fitting prefix covers at least as many loads as an earlier cut without consuming an extra group.',
        'Compare a greedy first cut with an earlier valid cut.',
      ),
      exercise(
        'Implement minimum_capacity(weights, max_groups). weights is an ordered list of nonnegative integer loads and max_groups >= 1. Split all loads into at most max_groups nonempty consecutive groups and return the smallest possible maximum group sum. Empty weights returns 0. Use a monotone feasibility test with binary search; preserve the input order and list. A hidden case with 50,000 loads up to 10⁶ must finish within 3 seconds.',
        'def minimum_capacity(weights, max_groups):\n    # Greedily test capacities and search for the smallest feasible one.\n    pass',
        'def minimum_capacity(weights, max_groups):\n    if not weights:\n        return 0\n    def fits(capacity):\n        groups = 1\n        current = 0\n        for weight in weights:\n            if weight > capacity:\n                return False\n            if current + weight > capacity:\n                groups += 1\n                current = weight\n            else:\n                current += weight\n        return groups <= max_groups\n    low = max(weights)\n    high = sum(weights)\n    while low < high:\n        mid = (low + high) // 2\n        if fits(mid):\n            high = mid\n        else:\n            low = mid + 1\n    return low',
        withLargeCase(
          'assert minimum_capacity([], 1) == 0\nassert minimum_capacity([3, 5, 2, 4], 2) == 8\nassert minimum_capacity([4, 1, 7, 2], 2) == 9\nassert minimum_capacity([0, 0], 2) == 0\nassert minimum_capacity([6], 4) == 6\nassert minimum_capacity([2, 3, 4], 1) == 9\nassert minimum_capacity([2, 3, 4], 3) == 4\nassert minimum_capacity([0, 4, 0, 5, 0], 2) == 5\nweights = [5, 2, 3]\nassert minimum_capacity(weights, 2) == 5\nassert weights == [5, 2, 3]',
          `_weights = _numbers(50000, 0, 10**6, 71)
_result, _seconds = _timed(minimum_capacity, _weights, 40)
assert _result == 625574761, "The 50,000-load case returned the wrong capacity."
_check_time(_seconds, "The 50,000-load case", "Binary-search the capacity with the greedy feasibility test instead of trying capacities one at a time.")`,
        ),
        'The greedy test decides feasibility in one scan. Binary search locates its false-to-true boundary between the largest item and the total sum; zero loads and extra allowed groups obey the same rule.',
        'For a candidate capacity, start a new group only when adding the next load would overflow. Search from max(weights) to sum(weights), handling [] first.',
      ),
    ],
    [
      [
        'What property permits binary search over possible answers?',
        'Feasibility must change monotonically: once an answer is feasible, every larger allowed limit stays feasible.',
      ],
      [
        'Why require nonnegative loads for greedy consecutive capacity grouping?',
        'Without nonnegativity, later negative loads could cancel an apparent overflow and invalidate greedy cuts.',
      ],
    ],
  ),
  skill(
    'cp-compression',
    'cp-search',
    'Replace coordinates with ordered ranks',
    'Reduce sparse values to compact indices while preserving comparisons.',
    ['cp-compress-translate', 'cp-hashing'],
    [
      'Coordinate compression replaces each distinct value with its position in a sorted list of distinct values. set(values) removes repeated keys; sorted(...) orders the remaining values. Assign ranks 0, 1, 2, and so on, then use a dictionary to translate every original value. Equal values receive the same rank, and smaller values receive smaller ranks.',
      'The translation invariant is that every processed item has been replaced by the rank of its original value while retaining its original position. Compression changes the representation, not the sequence order. A large negative coordinate and a large positive one become small valid array indices, without allocating storage for every integer between them.',
      'Compression preserves equality and ordering, but not numeric distances: neighboring ranks need not represent coordinates one unit apart. Keep the sorted original values when lengths, gaps, or areas matter. For n input values and u distinct values, sorting takes O(n log n) as a simple bound, translation takes expected O(n), and storage is O(n + u) including the returned list.',
    ],
    'values = [-1000, 50, -1000, 8]\nunique = sorted(set(values))\nranks = {}\nfor index in range(len(unique)):\n    ranks[unique[index]] = index\ncompressed = []\nfor value in values:\n    compressed.append(ranks[value])\nprint(unique)\nprint(compressed)',
    '[-1000, 8, 50]\n[0, 2, 0, 1]',
    'The repeated -1000 shares rank 0; 8 and 50 receive ranks 1 and 2 even though their original gaps are unequal.',
    [
      choice(
        'What is the rank-compressed sequence for [12, -2, 12, 5]?',
        ['[0, 1, 0, 2]', '[2, 0, 2, 1]', '[12, 0, 12, 5]', '[0, 1, 2, 3]'],
        1,
        'Sorted distinct values are [-2, 5, 12], so their ranks are 0, 1, and 2.',
        'Rank distinct values numerically, then translate in original order.',
      ),
      choice(
        'Which property is not preserved by ordinary coordinate compression?',
        [
          'Equality of values',
          'Ordering of values',
          'The number of distinct values',
          'Numeric distances between values',
        ],
        3,
        'Ranks record order; a rank difference of one can correspond to any original gap.',
        'Compare coordinates 10 and 1000 with ranks 0 and 1.',
      ),
      choice(
        'Why build a value-to-rank dictionary after sorting distinct values?',
        [
          'To translate original values with expected constant-time lookups',
          'To recover every distance automatically',
          'To reverse the original sequence',
          'To create a separate rank for every repeated occurrence',
        ],
        0,
        'The map avoids scanning the sorted unique list again for each original item.',
        'Precompute the association you repeatedly need.',
      ),
      exercise(
        'Implement compress_values(values) for a list of integers. Give the smallest distinct value rank 0, the next rank 1, and so on. Return the ranks in the original sequence order. Equal values must have equal ranks. Preserve the input list. A hidden case with 250,000 values must finish within 3 seconds.',
        'def compress_values(values):\n    # Sort distinct values, map them to ranks, and translate the original list.\n    pass',
        'def compress_values(values):\n    unique = sorted(set(values))\n    ranks = {}\n    for index in range(len(unique)):\n        ranks[unique[index]] = index\n    compressed = []\n    for value in values:\n        compressed.append(ranks[value])\n    return compressed',
        withLargeCase(
          'assert compress_values([]) == []\nassert compress_values([900]) == [0]\nassert compress_values([-1000, 50, -1000, 8]) == [0, 2, 0, 1]\nassert compress_values([7, 7, 7]) == [0, 0, 0]\nassert compress_values([-5, -1, -3]) == [0, 2, 1]\nassert compress_values([9, 4, 1]) == [2, 1, 0]\nassert compress_values([1, 4, 9]) == [0, 1, 2]\nvalues = [12, -2, 12, 5]\nassert compress_values(values) == [2, 0, 2, 1]\nassert values == [12, -2, 12, 5]',
          `_values = _numbers(200000, -10**9, 10**9, 81) + _numbers(50000, -100, 100, 82)
_result, _seconds = _timed(compress_values, _values)
assert _checksum(_result) == 365298159280422661, "The 250,000-value case returned wrong ranks."
_check_time(_seconds, "The 250,000-value case", "Map each distinct value to its rank with a dictionary instead of searching the sorted list for every value.")`,
        ),
        'The dictionary assigns one ordered rank per distinct value. Translating the original list, rather than returning the sorted list, preserves positions and repeated occurrences.',
        'Build unique = sorted(set(values)); assign each entry its index, then look up every original value.',
      ),
    ],
    [
      [
        'Which relations does coordinate compression preserve?',
        'Equality and order; repeated values share a rank and smaller values have smaller ranks.',
      ],
      [
        'Why must original coordinates be retained for measuring lengths?',
        'Rank differences do not equal original coordinate distances.',
      ],
    ],
  ),
  skill(
    'cp-sweep-line',
    'cp-search',
    'Sweep interval boundary events',
    'Sort starts and ends, then maintain the active count.',
    ['cp-sweep-ties', 'cp-sweep-active', 'cp-complexity'],
    [
      'A sweep processes only the coordinates where state changes. For half-open intervals [start, end), a start activates one interval and an end deactivates one. Store events as (coordinate, change), using +1 for starts and -1 for ends, then sort them by coordinate. Unlike a dense difference array, this representation does not require one entry for every possible coordinate.',
      'The active-count invariant is that the running total matches the intervals covering the swept position after its boundary events have been applied. Half-open intervals that end at x do not overlap intervals starting at x, so process end events before start events at equal coordinates. Python tuple sorting accomplishes this because -1 precedes +1. Ignore empty intervals with start == end; they occupy no position and should never increase the count.',
      'For n intervals, sorting up to 2n events costs O(n log n) time and the scan costs O(n); event storage is O(n). Assume start ≤ end. The maximum active count needs only event order, but computing total occupied length would also need the actual coordinate gaps. State the endpoint convention before choosing tie order, since closed intervals require a different rule.',
    ],
    'intervals = [(0, 4), (2, 6), (4, 7)]\nevents = []\nfor start, end in intervals:\n    if start < end:\n        events.append((start, 1))\n        events.append((end, -1))\nevents.sort()\nactive = 0\nbest = 0\nfor coordinate, change in events:\n    active += change\n    best = max(best, active)\nprint(best)',
    '2',
    'At coordinate 4, the first interval ends before the third begins. The peak remains two, rather than counting a false three-way overlap at that boundary.',
    [
      choice(
        'At a shared endpoint x for half-open intervals, which event order avoids false overlap?',
        [
          'Starts before ends',
          'All events are ignored',
          'Ends before starts',
          'The largest interval first',
        ],
        2,
        'Intervals ending at x exclude x; process their departures before new intervals at x arrive.',
        'Compare [0, 3) with [3, 5).',
      ),
      choice(
        'Why should an interval [x, x) be ignored when measuring overlap?',
        [
          'It contains no positions',
          'It covers every coordinate',
          'Its length cannot be represented',
          'It should count twice',
        ],
        0,
        'A half-open interval with equal boundaries is empty and contributes no active occupancy.',
        'The left endpoint is included only when it lies before the excluded right endpoint.',
      ),
      choice(
        'What is the overall time bound for sorting and scanning 2n interval events?',
        ['O(1)', 'O(n)', 'O(n²)', 'O(n log n)'],
        3,
        'The linear scan follows the O(n log n) event sort, which determines the overall bound.',
        'Include preprocessing when reporting the whole algorithm.',
      ),
      exercise(
        'Implement maximum_overlap(intervals). Each integer pair (start, end) describes the half-open interval [start, end), with start <= end. Return the greatest number of intervals active at any coordinate. Empty intervals contribute nothing; intervals meeting only at an endpoint do not overlap. Use sorted boundary events and preserve intervals. A hidden case with 100,000 intervals must finish within 3 seconds.',
        'def maximum_overlap(intervals):\n    # Sort boundary events with ends before starts, then track peak occupancy.\n    pass',
        'def maximum_overlap(intervals):\n    events = []\n    for start, end in intervals:\n        if start < end:\n            events.append((start, 1))\n            events.append((end, -1))\n    events.sort()\n    active = 0\n    best = 0\n    for coordinate, change in events:\n        active += change\n        best = max(best, active)\n    return best',
        withLargeCase(
          'assert maximum_overlap([]) == 0\nassert maximum_overlap([(4, 4), (0, 0)]) == 0\nassert maximum_overlap([(0, 4), (2, 6), (4, 7)]) == 2\nassert maximum_overlap([(1, 3), (3, 5)]) == 1\nassert maximum_overlap([(2, 8), (2, 8), (2, 8)]) == 3\nassert maximum_overlap([(-4, -1), (-2, 2), (2, 5)]) == 2\nassert maximum_overlap([(0, 5), (1, 5), (2, 5), (5, 7), (5, 8)]) == 3\nintervals = [(9, 11), (0, 10), (4, 4)]\nassert maximum_overlap(intervals) == 2\nassert intervals == [(9, 11), (0, 10), (4, 4)]',
          `_starts = _numbers(100000, -10**9, 10**9, 91)
_lengths = _numbers(100000, 0, 10**8, 92)
_intervals = [(_starts[i], _starts[i] + _lengths[i]) for i in range(100000)]
_result, _seconds = _timed(maximum_overlap, _intervals)
assert _result == 4646, "The 100,000-interval case returned the wrong overlap."
_check_time(_seconds, "The 100,000-interval case", "Sort the boundary events once instead of counting active intervals at every endpoint.")`,
        ),
        'Every nonempty interval creates balanced activation and cancellation events. Sorting changes of -1 before +1 at ties respects the half-open convention and prevents endpoint-only overlap.',
        'Ignore start == end; create (start, 1) and (end, -1), sort the tuples, and accumulate the largest active count.',
      ),
    ],
    [
      [
        'How does a sweep line represent half-open intervals?',
        'A +1 event at each start and a −1 event at each end, processed in coordinate order.',
      ],
      [
        'Why do half-open interval ends precede starts at the same coordinate?',
        'The ending interval excludes that coordinate, so it must leave before a starting interval enters.',
      ],
    ],
  ),
];
