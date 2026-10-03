import type { Skill } from '../../curriculum';
import {
  exercise,
  insideWith,
  skill,
  withLargeCase,
  withoutShortcuts,
} from './shared';

export const competitiveAdvanced: Skill[] = [
  skill(
    'cp-memoization',
    'cp-dynamic',
    'Memoize repeated states',
    'Define a recursive state once and cache its answer for later calls.',
    [
      'cp-memo-state-key',
      'cp-memo-base-cases',
      'cp-memo-cache-scope',
      'imports',
    ],
    [
      'Dynamic programming applies when different decision paths lead to the same subproblem. Define a state using all information that determines its answer. For a route with advances of one or three units, ways(remaining) counts ordered advance sequences that cover exactly remaining units. The empty route contributes one way at zero; a negative remainder contributes none.',
      'The recurrence is ways(r) = ways(r - 1) + ways(r - 3). A cache stores the completed answer for each r, so repeated calls reuse it. functools.cache requires hashable arguments. Create the cached helper inside the public function when it depends on that call’s input; otherwise cached answers could outlive the data that made them valid.',
      'The dependency must make progress toward a base case: a cache alone cannot resolve a cycle of unfinished recursive calls. This example accepts integer distances from 0 through 200 to keep recursion depth modest. It evaluates O(distance) states with O(distance) cache entries and stack depth, assuming constant-time integer arithmetic. For much deeper chains, use bottom-up iteration.',
    ],
    `from functools import cache

def routes(distance):
    @cache
    def ways(remaining):
        if remaining == 0:
            return 1
        if remaining < 0:
            return 0
        return ways(remaining - 1) + ways(remaining - 3)
    return ways(distance)

print(routes(5))
print(routes(0))`,
    '4\n1',
    'The four length-five routes use five ones, or place one three before, between, or after two ones. The empty sequence covers distance zero.',
    [
      exercise(
        'Implement count_routes(distance) for an integer 0 <= distance <= 200. Count ordered sequences of advances of size 1 or 3 whose sum is exactly distance. The empty sequence counts once for distance zero. Use a memoized recurrence. count_routes(200) must finish within 3 seconds.',
        'def count_routes(distance):\n    # Cache answers for remaining distances.\n    pass\n',
        `from functools import cache

def count_routes(distance):
    @cache
    def count(remaining):
        if remaining == 0:
            return 1
        if remaining < 0:
            return 0
        return count(remaining - 1) + count(remaining - 3)
    return count(distance)`,
        withLargeCase(
          `assert count_routes(0) == 1, "Count the empty route."
assert count_routes(1) == 1
assert count_routes(2) == 1
assert count_routes(3) == 2, "One three or three ones."
assert count_routes(5) == 4
assert count_routes(6) == 6
assert count_routes(10) == 28
expected = [1]
for distance in range(1, 41):
    expected.append(expected[distance - 1] + (expected[distance - 3] if distance >= 3 else 0))
assert count_routes(40) == expected[40], "Reuse repeated states on longer routes."`,
          `_result, _seconds = _timed(count_routes, 200)
assert _result == 972248041367800504724352407998099, "count_routes(200) returned the wrong count."
_check_time(_seconds, "count_routes(200)", "Cache each remaining distance so it is computed once.")`,
        ),
        'Each nonempty route ends in either a one-unit or three-unit advance. Cache the answer for the remaining distance so each state is solved once.',
        'Use a nested helper with @cache, return 1 at zero and 0 below zero, then add the two smaller states.',
      ),
    ],
    [
      [
        'What is the central invariant of memoization?',
        'A cached key identifies one subproblem, and its stored value is that subproblem’s completed answer.',
      ],
      [
        'Does memoization make recursive dependency cycles safe?',
        'No. Dependencies must terminate, or cycles need an explicit algorithm.',
      ],
    ],
  ),

  skill(
    'cp-tabulation',
    'cp-dynamic',
    'Build a table in dependency order',
    'Compute smaller states before the larger states that depend on them.',
    ['cp-dp-dependency-order', 'conditional-expressions'],
    [
      'Tabulation writes dynamic-programming answers into a table without recursive calls. First give every entry a precise meaning. Here dp[t] is the minimum number of packets needed to total exactly t units, using unlimited packets from a list of positive integer sizes. dp[0] is zero, while an unreachable total starts at infinity.',
      'For each total t in increasing order, try every size s <= t and improve dp[t] with dp[t - s] + 1. Positivity guarantees t - s < t, so every dependency is already final. Adding one to infinity remains infinity; after the table is complete, convert an unreachable final entry to -1.',
      'The input contract allows an empty size list and a nonnegative target; zero or negative sizes are excluded because they break this dependency order. With m sizes and target T, time is O(mT) and storage is O(T). This method handles sizes for which taking the largest available packet first would miss the optimum.',
    ],
    `def min_packets(sizes, target):
    dp = [float("inf")] * (target + 1)
    dp[0] = 0
    for total in range(1, target + 1):
        for size in sizes:
            if size <= total:
                dp[total] = min(dp[total], dp[total - size] + 1)
    return -1 if dp[target] == float("inf") else dp[target]

print(min_packets([3, 5], 11))
print(min_packets([3, 5], 7))`,
    '3\n-1',
    'Two size-three packets and one size-five packet total eleven. No nonnegative combination of those sizes totals seven.',
    [
      exercise(
        'Implement min_packets(sizes, target). sizes is a list of positive integers, each usable any number of times; target is an integer from 0 through 5000. Return the minimum number of packets totaling exactly target, or -1 when impossible. An empty list reaches only zero. Hidden cases with targets near 5,000 must finish within 3 seconds.',
        'def min_packets(sizes, target):\n    # Fill a table for exact totals.\n    pass\n',
        `def min_packets(sizes, target):
    dp = [float("inf")] * (target + 1)
    dp[0] = 0
    for total in range(1, target + 1):
        for size in sizes:
            if size <= total:
                dp[total] = min(dp[total], dp[total - size] + 1)
    return -1 if dp[target] == float("inf") else dp[target]`,
        withLargeCase(
          `assert min_packets([], 0) == 0
assert min_packets([], 7) == -1
assert min_packets([1, 4, 6], 8) == 2, "Greedy largest-first is insufficient."
assert min_packets([3, 5], 11) == 3
assert min_packets([4, 6], 7) == -1
assert min_packets([9], 18) == 2, "Packet sizes may be reused."
assert min_packets([2, 2, 7], 9) == 2
assert min_packets([8, 3], 0) == 0
assert min_packets([7, 11], 121) == 11`,
          `_sizes = sorted(set(_numbers(30, 7, 400, 301)))
def _run():
    return [min_packets(_sizes, 4999), min_packets(_sizes, 5000), min_packets([2, 4], 4999)]
_result, _seconds = _timed(_run)
assert _result == [13, 13, -1], "The 5,000-total cases returned wrong counts."
_check_time(_seconds, "Three 5,000-total cases", "Fill one table entry per total instead of recomputing smaller totals recursively.")`,
        ),
        'The table stores the optimum for every exact total. Trying every possible last packet preserves all choices without enumerating whole sequences.',
        'Initialize dp[0] to zero, fill totals from 1 upward, and relax from dp[total - size].',
      ),
    ],
    [
      [
        'How do you choose a tabulation order?',
        'Process each state only after the states it depends on have been computed.',
      ],
      [
        'How can a minimum-cost DP mark an unreachable state?',
        'Use infinity, then translate it to the required failure value at the boundary.',
      ],
    ],
  ),

  skill(
    'cp-knapsack',
    'cp-dynamic',
    'Choose each item at most once',
    'Use a descending capacity loop to preserve 0/1 knapsack states.',
    ['cp-knapsack-descending-pass', 'unpacking'],
    [
      'In 0/1 knapsack, each item has a positive integer weight and a nonnegative value, and can be selected at most once. dp[c] means the greatest value achievable with total weight at most c after the items processed so far. Starting all entries at zero permits choosing nothing; the result need not fill the capacity exactly.',
      'For an item (weight, value), update dp[c] = max(dp[c], dp[c - weight] + value). Iterate c from capacity down to weight. Descending order ensures dp[c - weight] still belongs to the previous item stage, so the current item cannot be taken twice. An ascending loop could read a state already improved by the same item, which instead permits unlimited reuse.',
      'For n items and capacity W, this compressed table uses O(nW) time and O(W) storage. It is useful when W is moderate, even if the number of possible subsets is huge. These bounds depend on the numeric capacity, so large weights may require a different state definition. Empty item lists and capacity zero return zero.',
    ],
    `def best_value(items, capacity):
    dp = [0] * (capacity + 1)
    for weight, value in items:
        for limit in range(capacity, weight - 1, -1):
            dp[limit] = max(dp[limit], dp[limit - weight] + value)
    return dp[capacity]

print(best_value([(2, 5), (3, 7), (4, 8)], 5))
print(best_value([(2, 5)], 4))`,
    '12\n5',
    'The first two items fit together for value twelve. The single item in the second call is available only once, despite space for two copies.',
    [
      exercise(
        'Implement best_value(items, capacity). Each (weight, value) pair is a distinct item, even when pairs repeat. Weights are positive integers, values are nonnegative integers, and 0 <= capacity <= 5000. Return the greatest total value with weight at most capacity, using each item at most once. Preserve items. A hidden case with 100 items and capacity 5,000 must finish within 3 seconds.',
        'def best_value(items, capacity):\n    # Update capacities downward for each item.\n    pass\n',
        `def best_value(items, capacity):
    dp = [0] * (capacity + 1)
    for weight, value in items:
        for limit in range(capacity, weight - 1, -1):
            dp[limit] = max(dp[limit], dp[limit - weight] + value)
    return dp[capacity]`,
        withLargeCase(
          `assert best_value([], 8) == 0
assert best_value([(1, 9)], 0) == 0
assert best_value([(2, 5)], 4) == 5, "Do not reuse the same item."
assert best_value([(2, 5), (2, 5)], 4) == 10, "Equal pairs can be distinct items."
assert best_value([(2, 5), (3, 7), (4, 8)], 5) == 12
assert best_value([(9, 100), (3, 4)], 4) == 4
assert best_value([(2, 0), (3, 6)], 5) == 6
items = [(4, 9), (3, 7), (2, 4)]
assert best_value(items, 6) == 13
assert items == [(4, 9), (3, 7), (2, 4)], "Preserve the input list."`,
          `_items = list(zip(_numbers(100, 1, 800, 311), _numbers(100, 0, 1000, 312)))
_result, _seconds = _timed(best_value, _items, 5000)
assert _result == 21297, "The 100-item case returned the wrong value."
_check_time(_seconds, "The 100-item case", "Fill one capacity table per item instead of trying every subset of items.")`,
        ),
        'A descending pass separates the previous item stage from the current stage without storing a second table.',
        'Use range(capacity, weight - 1, -1), then compare skipping with taking the item once.',
      ),
    ],
    [
      [
        'Which capacity direction enforces 0/1 knapsack with one table?',
        'Descending capacity, so the transition reads a state from before the current item.',
      ],
      [
        'What are compressed 0/1 knapsack’s time and space bounds?',
        'O(nW) time and O(W) space for n items and capacity W.',
      ],
    ],
  ),

  skill(
    'cp-subsequences',
    'cp-dynamic',
    'Track increasing subsequence tails',
    'Find a strictly increasing subsequence length without storing every path.',
    ['cp-lis-tail-update', 'ranges'],
    [
      'A subsequence preserves original order but may skip elements; a substring or subarray is contiguous. For a strictly increasing subsequence, every next value must be greater, so equal values cannot extend it. A direct DP stores the best length ending at each position and tries earlier smaller values, using O(n²) time.',
      'The faster method stores tails[length - 1], the smallest ending value found for any increasing subsequence of that length in the processed prefix. A smaller tail leaves at least as much room for future extension. The tails list stays sorted. For each value, bisect_left finds the first tail greater than or equal to it: replace that tail, or append if no such tail exists.',
      'Replacing an equal tail preserves strictness; bisect_right would instead allow equal values to extend a nondecreasing subsequence. The tails entries need not belong to one actual subsequence, but its length is the correct optimum. For a list of comparable integers, time is O(n log n) and storage is O(n). An empty input has length zero.',
    ],
    `from bisect import bisect_left

def increasing_length(values):
    tails = []
    for value in values:
        position = bisect_left(tails, value)
        if position == len(tails):
            tails.append(value)
        else:
            tails[position] = value
    return len(tails)

print(increasing_length([7, 2, 5, 3, 6, 6, 9]))
print(increasing_length([4, 4, 4]))`,
    '4\n1',
    'For example, 2, 3, 6, 9 is strictly increasing. Equal fours can provide only a single element.',
    [
      exercise(
        'Implement increasing_length(values), returning the length of a longest strictly increasing subsequence of an integer list. Elements may repeat or be negative. Preserve values, return 0 for an empty list, and use sorted tails with binary search. A hidden case with 200,000 values must finish within 3 seconds.',
        'def increasing_length(values):\n    # Keep the smallest tail for each subsequence length.\n    pass\n',
        `from bisect import bisect_left

def increasing_length(values):
    tails = []
    for value in values:
        position = bisect_left(tails, value)
        if position == len(tails):
            tails.append(value)
        else:
            tails[position] = value
    return len(tails)`,
        withLargeCase(
          `assert increasing_length([]) == 0
assert increasing_length([5]) == 1
assert increasing_length([4, 4, 4]) == 1, "Increasing is strict."
assert increasing_length([5, 4, 3, 2]) == 1
assert increasing_length([3, 1, 1, 2]) == 2
assert increasing_length([-3, -2, -2, 0, -1, 4]) == 4
assert increasing_length([7, 2, 5, 3, 6, 6, 9]) == 4
values = [2, 8, 3, 9, 4]
assert increasing_length(values) == 3
assert values == [2, 8, 3, 9, 4], "Preserve the input."
assert increasing_length(list(range(1000))) == 1000`,
          `_values = _numbers(200000, -10**9, 10**9, 321)
_result, _seconds = _timed(increasing_length, _values)
assert _result == 874, "The 200,000-value case returned the wrong length."
_check_time(_seconds, "The 200,000-value case", "Keep the smallest tail for each length and binary-search it instead of comparing every earlier value.")`,
        ),
        'Replacing a tail improves its future extension opportunities without losing any achievable length.',
        'Use bisect_left(tails, value), append at the end, and otherwise replace that position.',
      ),
    ],
    [
      [
        'Why does strict LIS use bisect_left?',
        'It replaces the first tail >= value, preventing equal values from extending a subsequence.',
      ],
      [
        'Is the final tails list necessarily one actual subsequence?',
        'No. Its entries summarize best endings for different lengths; its length is the LIS length.',
      ],
    ],
  ),

  skill(
    'cp-intervals',
    'cp-strategy',
    'Merge occupied intervals',
    'Sort intervals and maintain one unfinished union span.',
    ['cp-interval-merge-step'],
    [
      'An interval must have a clear endpoint convention. Here each booking is half-open [start, end): it includes start and excludes end, with integer start < end. Touching bookings such as [1, 3) and [3, 5) do not overlap, but their union is the single continuous span [1, 5), so this merge task combines touching spans too.',
      'Sort by start, then keep the latest merged span. If the next start is <= its end, extend the end to the larger endpoint. Otherwise the previous span is complete and a new one begins. The invariant is that all earlier output spans are final and the last span contains the union of every booking connected to it so far.',
      'Sorting costs O(n log n), and the scan costs O(n). The result uses O(n) space; sorted(...) also leaves the original list unchanged. Nested intervals require max(old_end, new_end), since the next interval may end earlier. Empty input returns an empty list. Change <= to < only when the desired representation keeps touching spans separate.',
    ],
    `def merge_bookings(bookings):
    merged = []
    for start, end in sorted(bookings):
        if merged and start <= merged[-1][1]:
            merged[-1] = (merged[-1][0], max(merged[-1][1], end))
        else:
            merged.append((start, end))
    return merged

print(merge_bookings([(6, 8), (1, 4), (3, 5), (5, 6), (2, 3)]))`,
    '[(1, 8)]',
    'Overlap, nesting, and touching endpoints connect all the bookings into one continuous occupied span.',
    [
      exercise(
        'Implement merge_bookings(bookings) for half-open integer intervals (start, end) with start < end. Return a sorted list of tuples representing their union, merging both overlapping and touching bookings. Support negative endpoints and empty input; preserve the input list. A hidden case with 100,000 bookings must finish within 3 seconds.',
        'def merge_bookings(bookings):\n    # Scan a sorted copy and extend the latest span.\n    pass\n',
        `def merge_bookings(bookings):
    merged = []
    for start, end in sorted(bookings):
        if merged and start <= merged[-1][1]:
            merged[-1] = (merged[-1][0], max(merged[-1][1], end))
        else:
            merged.append((start, end))
    return merged`,
        withLargeCase(
          `assert merge_bookings([]) == []
assert merge_bookings([(2, 7)]) == [(2, 7)]
assert merge_bookings([(1, 3), (3, 5)]) == [(1, 5)], "Merge touching spans."
assert merge_bookings([(2, 10), (4, 6)]) == [(2, 10)], "Preserve a containing span."
assert merge_bookings([(8, 10), (1, 2), (5, 7)]) == [(1, 2), (5, 7), (8, 10)]
assert merge_bookings([(-5, -2), (-3, 0), (4, 6)]) == [(-5, 0), (4, 6)]
bookings = [(6, 8), (1, 4), (3, 5), (5, 6), (2, 3)]
assert merge_bookings(bookings) == [(1, 8)]
assert bookings == [(6, 8), (1, 4), (3, 5), (5, 6), (2, 3)]
assert merge_bookings([(1, 4), (1, 4)]) == [(1, 4)]`,
          `_starts = _numbers(100000, -10**9, 10**9, 331)
_lengths = _numbers(100000, 1, 20000, 332)
_bookings = [(_starts[i], _starts[i] + _lengths[i]) for i in range(100000)]
_result, _seconds = _timed(merge_bookings, _bookings)
assert _checksum(_result) == 1927797419062957549, "The 100,000-booking case returned the wrong union."
_check_time(_seconds, "The 100,000-booking case", "Sort once and extend the latest merged span instead of merging pairs repeatedly.")`,
        ),
        'After sorting, only the most recent span can connect to the next booking. Extending by the maximum end handles nested intervals correctly.',
        'Use sorted(bookings), merge when start <= merged[-1][1], and keep tuple outputs.',
      ),
    ],
    [
      [
        'Which endpoint convention does [start, end) use?',
        'It includes start and excludes end; touching intervals have no overlap.',
      ],
      [
        'How does an interval-union scan handle a nested interval?',
        'Keep the earlier start and use max(current_end, next_end).',
      ],
    ],
  ),

  skill(
    'cp-greedy',
    'cp-strategy',
    'Prove an earliest-finish choice',
    'Use an exchange argument to justify maximum interval scheduling.',
    ['cp-greedy-exchange-boundary', 'accumulators'],
    [
      'A greedy algorithm commits to a local choice without reconsidering it. That commitment needs a proof matching the objective. For the maximum number of compatible sessions on one resource, each session is a half-open interval [start, end) with start < end. Sessions may touch, and all sessions have equal value: maximizing total duration or weighted value is a different problem.',
      'Sort sessions by end time and accept a session when its start is at least the end of the last accepted session. The selected schedule remains compatible. To justify the choice, replace the first session of an optimal remaining schedule with the earliest-finishing available session. It ends no later, so every later session in that schedule remains feasible. Repeat the exchange for the remaining sessions.',
      'Sorting takes O(n log n), followed by an O(n) scan. Use None for the initial end rather than zero, so sessions at negative times are considered. An empty input gives zero. Earliest start and shortest duration lack this exchange guarantee; counterexamples can reject a greedy rule, while the exchange argument establishes this one.',
    ],
    `def max_sessions(sessions):
    end_of_last = None
    count = 0
    for start, end in sorted(sessions, key=lambda session: session[1]):
        if end_of_last is None or start >= end_of_last:
            count += 1
            end_of_last = end
    return count

print(max_sessions([(0, 8), (1, 3), (3, 5), (5, 7)]))
print(max_sessions([(-6, -4), (-4, -1), (0, 2)]))`,
    '3\n3',
    'Choosing the earliest finish admits three short sessions instead of the long one. Touching sessions and negative times remain valid.',
    [
      exercise(
        'Implement max_sessions(sessions), returning the maximum number of pairwise compatible half-open sessions (start, end), with integer start < end. Each session is available once and has equal value. Touching endpoints are compatible, times may be negative, and the input must remain unchanged. A hidden case with 100,000 sessions must finish within 3 seconds.',
        'def max_sessions(sessions):\n    # Accept feasible sessions in earliest-finish order.\n    pass\n',
        `def max_sessions(sessions):
    end_of_last = None
    count = 0
    for start, end in sorted(sessions, key=lambda session: session[1]):
        if end_of_last is None or start >= end_of_last:
            count += 1
            end_of_last = end
    return count`,
        withLargeCase(
          `assert max_sessions([]) == 0
assert max_sessions([(2, 5)]) == 1
assert max_sessions([(0, 8), (1, 3), (3, 5), (5, 7)]) == 3
assert max_sessions([(0, 3), (1, 3), (2, 3)]) == 1
assert max_sessions([(-6, -4), (-4, -1), (0, 2)]) == 3
assert max_sessions([(0, 2), (2, 4), (4, 6)]) == 3, "Touching endpoints are compatible."
assert max_sessions([(1, 10), (2, 3), (4, 5), (6, 7), (8, 9)]) == 4
sessions = [(5, 9), (0, 2), (2, 5)]
assert max_sessions(sessions) == 3
assert sessions == [(5, 9), (0, 2), (2, 5)]`,
          `_starts = _numbers(100000, -10**9, 10**9, 341)
_lengths = _numbers(100000, 1, 10**7, 342)
_sessions = [(_starts[i], _starts[i] + _lengths[i]) for i in range(100000)]
_result, _seconds = _timed(max_sessions, _sessions)
assert _result == 3525, "The 100,000-session case returned the wrong count."
_check_time(_seconds, "The 100,000-session case", "Sort by finish time and accept compatible sessions greedily instead of trying subsets.")`,
        ),
        'Each accepted session ends as early as possible for the next choice, and an exchange with an optimal schedule proves no session count is lost.',
        'Sort using the end field. Accept the first session, then accept when start >= end_of_last.',
      ),
    ],
    [
      [
        'What must accompany a greedy choice?',
        'A correctness argument showing the local choice can belong to an optimal solution.',
      ],
      [
        'Why is earliest finish safe for unweighted interval scheduling?',
        'Replacing an optimal first session with one ending no later preserves every later session.',
      ],
    ],
  ),

  skill(
    'cp-bitmasks',
    'cp-strategy',
    'Encode subsets with bits',
    'Update a selection mask and enumerate only its submasks.',
    [
      'cp-bit-set-clear',
      'cp-bit-submask-step',
      'cp-enumeration',
      'zip-enumerate',
    ],
    [
      'For n indexed items, a nonnegative integer mask encodes a selection: bit i is one exactly when item i is selected. Test membership with mask & (1 << i). Set a bit with mask | (1 << i) and clear it with mask & ~(1 << i); both are idempotent, so repeating a change leaves the mask unchanged. The zero mask is the empty selection, and equal values at different indices stay distinct items.',
      'The subsets of the current selection are exactly the submasks of its mask. Start at sub = mask, process it, stop after processing zero, and otherwise step with sub = (sub - 1) & mask. The walk visits each of the 2ᵏ submasks of a k-item selection once, in decreasing order, and never a subset that uses an unselected item. To score a submask, scan the item positions and add the values whose bits are set; negative values are fine because the mask records membership, not magnitude.',
      'Looping over range(1 << n) and discarding masks outside the selection costs 2ⁿ steps per query even when only k items are selected. With 20 items and at most 10 selected, the submask walk takes at most 1,024 steps where the full range takes 1,048,576. Python integers are not fixed-width, so a complement used as a finite set must be restricted with ((1 << n) - 1) & ~mask.',
    ],
    `values = [4, -1, 3, 2]
mask = 0
for index in [0, 2, 3]:
    mask |= 1 << index
mask &= ~(1 << 3)
matches = []
sub = mask
while True:
    total = 0
    for position in range(len(values)):
        if sub & (1 << position):
            total += values[position]
    if total == 7:
        matches.append(sub)
    if sub == 0:
        break
    sub = (sub - 1) & mask
print(mask, matches)`,
    '5 [5]',
    'Setting items 0, 2, and 3 and then clearing item 3 leaves mask 5 (binary 101). Its submasks are 5, 4, 1, and 0, and only 5 (items 0 and 2) sums to 7.',
    [
      exercise(
        'Implement selection_counts(values, changes, target). values holds at most 20 integers, which may be negative, zero, or repeated. The selection starts empty. Each change (index, present) sets item index in the selection mask when present is True and clears it when False; repeating a change has no effect. At most 10 items are selected at any time. After each change, count the submasks of the current selection whose selected values sum to target, including the empty submask, and return the counts in change order. Preserve both lists. Walk submasks with (sub - 1) & mask: a hidden case with 20 items and 500 changes must finish within 3 seconds.',
        `def selection_counts(values, changes, target):
    # Keep one mask; after each change, walk its submasks.
    pass`,
        `def selection_counts(values, changes, target):
    mask = 0
    counts = []
    for index, present in changes:
        if present:
            mask |= 1 << index
        else:
            mask &= ~(1 << index)
        count = 0
        sub = mask
        while True:
            total = 0
            for position, value in enumerate(values):
                if sub & (1 << position):
                    total += value
            if total == target:
                count += 1
            if sub == 0:
                break
            sub = (sub - 1) & mask
        counts.append(count)
    return counts`,
        withLargeCase(
          `assert selection_counts([], [], 0) == []
assert selection_counts([5], [(0, True)], 0) == [1], "The empty submask sums to zero."
assert selection_counts([5], [(0, True), (0, True)], 5) == [1, 1], "Setting a set bit changes nothing."
assert selection_counts([2, 2], [(0, True), (1, True)], 2) == [1, 2], "Equal values at different indices are distinct items."
assert selection_counts([3, -1, 4, 1], [(0, True), (2, True), (1, True), (0, False)], 3) == [1, 1, 2, 1], "Count only submasks of the current selection."
assert selection_counts([1, 2, 3], [(1, False), (2, True)], 0) == [1, 1], "Clearing an absent item changes nothing."
assert selection_counts([0, 0, 0], [(0, True), (1, True), (2, True)], 0) == [2, 4, 8]
values = [1] * 20
changes = [(index, True) for index in range(10)]
assert selection_counts(values, changes, 3)[-1] == 120
assert values == [1] * 20 and changes == [(index, True) for index in range(10)], "Preserve both lists."`,
          `_values = _numbers(20, -60, 60, 701)
_selected = set()
_changes = []
for _pick in _numbers(3000, 0, 19, 702):
    if _pick in _selected:
        _selected.discard(_pick)
        _changes.append((_pick, False))
    elif len(_selected) < 10:
        _selected.add(_pick)
        _changes.append((_pick, True))
    if len(_changes) == 500:
        break
_result, _seconds = _timed(selection_counts, _values, _changes, 40)
assert _checksum(_result) == 1292453565480001866, "The 500-change case returned wrong counts."
_check_time(_seconds, "The 500-change case", "Walk only the submasks of the current selection instead of every mask below 1 << 20.")`,
        ),
        'Set and clear keep one mask equal to the current selection, and the submask walk visits each subset of that selection exactly once, so every count neither omits nor repeats a choice.',
        'Update the mask with | or & ~. Then start at sub = mask, count matching totals, stop after zero, and step with (sub - 1) & mask.',
      ),
    ],
    [
      [
        'How do you visit every subset of a selection mask exactly once?',
        'Start at sub = mask, process it, stop after zero, and otherwise step with sub = (sub - 1) & mask.',
      ],
      [
        'Why walk submasks instead of every mask below 1 << n?',
        'A k-item selection has only 2ᵏ submasks; scanning all 2ⁿ masks wastes work on subsets that use unselected items.',
      ],
    ],
  ),
  skill(
    'cp-geometry',
    'cp-strategy',
    'Use orientation predicates',
    'Classify left, right, and collinear turns with an integer cross product.',
    ['cp-geometry-turn-sign', 'slicing'],
    [
      'Many geometry algorithms depend on a reliable orientation test rather than angles. For points A, B, and C, form vectors B - A and C - A. Their two-dimensional cross product is (Bx - Ax)(Cy - Ay) - (By - Ay)(Cx - Ax). In ordinary Cartesian coordinates, a positive result puts C to the left of directed line A → B, a negative result to the right, and zero on the line.',
      'The cross product is the signed doubled triangle area. Integer coordinates allow exact comparisons in Python, including large values, without computing slopes or dividing by a horizontal difference. Repeated points or three collinear points produce zero. If screen coordinates increase downward, the visual meaning of left and right reverses; the algebraic formula stays the same.',
      'For a path of n integer-coordinate points, classify each consecutive triple independently. The invariant is that each reported sign belongs to exactly one triple in path order. Each test uses O(1) arithmetic operations; producing all signs costs O(n) time and O(n) result space, under constant-time arithmetic assumptions. This predicate is a building block for hulls and segment tests, not by itself a complete intersection algorithm.',
    ],
    `def orientation(a, b, c):
    cross = (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0])
    return (cross > 0) - (cross < 0)

print(orientation((0, 0), (3, 0), (2, 2)))
print(orientation((0, 0), (0, 4), (2, 1)))
print(orientation((1, 1), (2, 2), (4, 4)))`,
    '1\n-1\n0',
    'The first triple turns left, the second right, and the third stays on one line in Cartesian coordinates.',
    [
      exercise(
        'Implement turn_signs(points). points is a list of (x, y) integer tuples in Cartesian coordinates. Return one sign for every consecutive triple: 1 for a left turn, -1 for a right turn, and 0 for collinear or repeated points. Return [] for fewer than three points and preserve the input.',
        'def turn_signs(points):\n    # Use the cross product for each consecutive triple.\n    pass\n',
        `def turn_signs(points):
    signs = []
    for index in range(len(points) - 2):
        a, b, c = points[index:index + 3]
        cross = (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0])
        signs.append((cross > 0) - (cross < 0))
    return signs`,
        `assert turn_signs([]) == []
assert turn_signs([(1, 2), (3, 4)]) == []
assert turn_signs([(0, 0), (3, 0), (2, 2)]) == [1]
assert turn_signs([(0, 0), (0, 4), (2, 1)]) == [-1]
assert turn_signs([(1, 1), (2, 2), (4, 4)]) == [0]
assert turn_signs([(0, 0), (2, 2), (2, 2)]) == [0]
assert turn_signs([(0, 0), (10**12, 0), (10**12, 1)]) == [1]
points = [(0, 0), (2, 0), (2, 2), (4, 2), (6, 2)]
assert turn_signs(points) == [1, -1, 0]
assert points == [(0, 0), (2, 0), (2, 2), (4, 2), (6, 2)]`,
        'Subtract the first point to form two vectors, then classify the signed cross product without division.',
        'For each triple compute dx1 * dy2 - dy1 * dx2. Compare it with zero to produce -1, 0, or 1.',
      ),
    ],
    [
      [
        'What does a zero orientation cross product mean?',
        'The points are collinear, including cases with repeated points.',
      ],
      [
        'What does the 2D cross product measure geometrically?',
        'Signed doubled triangle area; its sign gives the orientation.',
      ],
    ],
  ),
  skill(
    'cp-gcd',
    'cp-number-theory',
    'Reduce with the Euclidean algorithm',
    'Compute greatest common divisors and derive least common multiples safely.',
    [
      'cp-gcd-remainder-step',
      'cp-gcd-lcm-zero',
      'while-loops',
      'conditional-expressions',
    ],
    [
      'The greatest common divisor gcd(a, b) is the largest positive integer dividing both numbers, except that gcd(0, 0) is defined as zero. Normalize signs with abs. Euclid’s invariant is gcd(a, b) = gcd(b, a % b): subtracting any multiple of b does not change the common divisors.',
      'Repeatedly replace (a, b) with (b, a % b) until b becomes zero; the remaining a is the gcd. The nonzero second argument decreases, so the process terminates. For nonnegative inputs it takes O(log(max(a, b))) remainder operations when at least one input is nonzero, and O(1) extra variables. Actual arithmetic costs also depend on integer bit length.',
      'The least common multiple satisfies lcm(a, b) = abs((a // gcd(a, b)) * b) when both values are nonzero. Divide before multiplying to keep intermediate values smaller. If either argument is zero, define the lcm as zero and skip the division, including for (0, 0). Python’s math.gcd and math.lcm implement these conventions, but writing Euclid makes the invariant visible.',
    ],
    `def gcd_lcm(a, b):
    x, y = abs(a), abs(b)
    while y:
        x, y = y, x % y
    multiple = 0 if a == 0 or b == 0 else abs((a // x) * b)
    return x, multiple

print(gcd_lcm(18, 30))
print(gcd_lcm(-12, 18))
print(gcd_lcm(0, 0))`,
    '(6, 90)\n(6, 36)\n(0, 0)',
    'Signs do not change common divisors or the nonnegative lcm. The all-zero case avoids division by zero.',
    [
      exercise(
        'Implement gcd_lcm(a, b) for arbitrary integer arguments. Return a tuple (gcd, lcm), both nonnegative. Define gcd(0, 0) = 0 and lcm = 0 whenever either argument is zero. Use the Euclidean remainder loop for the gcd. The checks disable math.gcd and math.lcm, and a hidden case of 20,000 pairs up to 10¹⁸ must finish within 3 seconds.',
        'def gcd_lcm(a, b):\n    # Normalize signs, run Euclid, then handle the lcm.\n    pass\n',
        `def gcd_lcm(a, b):
    x, y = abs(a), abs(b)
    while y:
        x, y = y, x % y
    multiple = 0 if a == 0 or b == 0 else abs((a // x) * b)
    return x, multiple`,
        withoutShortcuts(
          'import math',
          'math',
          ['gcd', 'lcm'],
          'This exercise asks you to write the Euclidean loop yourself, so math.gcd and math.lcm are disabled during the checks.',
          withLargeCase(
            `assert gcd_lcm(18, 30) == (6, 90)
assert gcd_lcm(-12, 18) == (6, 36)
assert gcd_lcm(-8, -20) == (4, 40)
assert gcd_lcm(0, 15) == (15, 0)
assert gcd_lcm(-7, 0) == (7, 0)
assert gcd_lcm(0, 0) == (0, 0), "Avoid dividing by zero."
assert gcd_lcm(13, 17) == (1, 221)
assert gcd_lcm(21, 21) == (21, 21)
assert gcd_lcm(10**12, 10**12 + 1) == (1, 10**12 * (10**12 + 1))`,
            `_fibonacci = [1, 1]
while len(_fibonacci) < 88:
    _fibonacci.append(_fibonacci[-1] + _fibonacci[-2])
_pairs = list(zip(_numbers(20000, -10**18, 10**18, 351), _numbers(20000, -10**18, 10**18, 352)))
_pairs += [(_fibonacci[i + 1], _fibonacci[i]) for i in range(80)] + [(10**18, 1), (1, 10**18)]
def _run():
    return [gcd_lcm(a, b) for a, b in _pairs]
_result, _seconds = _timed(_run)
assert _checksum(_result) == 1176360124805248735, "The 20,000-pair case returned wrong results."
_check_time(_seconds, "The 20,000-pair case", "Replace (a, b) with (b, a % b) instead of subtracting or trying every divisor.")`,
          ),
        ),
        'Each remainder update preserves the gcd and reduces the second nonnegative argument. Derive the lcm only after checking for zero inputs.',
        'Start x, y = abs(a), abs(b), then use x, y = y, x % y while y is nonzero.',
      ),
    ],
    [
      [
        'What invariant drives Euclid’s algorithm?',
        'gcd(a, b) = gcd(b, a % b) for b != 0.',
      ],
      [
        'How do you compute the lcm safely when zeros are allowed?',
        'Return 0 if either input is 0; otherwise use abs((a // gcd(a, b)) * b).',
      ],
    ],
  ),

  skill(
    'cp-modular',
    'cp-number-theory',
    'Compute with modular powers',
    'Reduce intermediate values and square a base to process exponent bits.',
    ['cp-modular-square-step', 'cp-modular-inverse-condition'],
    [
      'For a positive modulus m, Python a % m is the representative from 0 through m - 1, including when a is negative. Addition and multiplication can be reduced after every operation: ((a % m) * (b % m)) % m equals (a * b) % m. This keeps intermediate values bounded without changing the residue.',
      'To compute aᵉ mod m for a nonnegative integer exponent, keep a result, a squared base, and the unprocessed exponent. If the exponent is odd, multiply the result by the current base; square the base and halve the exponent. The invariant is result * base**remaining ≡ original_a**original_e (mod m). There are O(log(e + 1)) iterations and O(1) extra variables.',
      'Initialize result as 1 % m so exponent zero works even for m = 1, where every residue is zero. Modular division is not ordinary integer division: a denominator b has an inverse only when gcd(b, m) = 1. Python pow(b, -1, m) can compute that inverse for coprime inputs. The shortcut pow(b, p - 2, p) requires prime p and b not divisible by p; it is invalid as a general composite-modulus rule.',
    ],
    `def mod_power(base, exponent, modulus):
    result = 1 % modulus
    base %= modulus
    while exponent:
        if exponent % 2:
            result = result * base % modulus
        base = base * base % modulus
        exponent //= 2
    return result

print(mod_power(2, 20, 1000))
print(mod_power(-2, 3, 5))
print(mod_power(9, 0, 1))`,
    '576\n2\n0',
    'Squaring processes a large exponent in a few iterations. Negative bases normalize correctly, and modulus one has only residue zero.',
    [
      exercise(
        'Implement mod_power(base, exponent, modulus) using repeated squaring. base is any integer, exponent is a nonnegative integer, and modulus is a positive integer. Return the residue in [0, modulus). Treat exponent zero as the empty product, including base zero. Support modulus 1. The checks disable three-argument pow, and a hidden case of 10,000 powers with exponents up to 10¹⁸ must finish within 3 seconds.',
        'def mod_power(base, exponent, modulus):\n    # Consume exponent bits while reducing every multiplication.\n    pass\n',
        `def mod_power(base, exponent, modulus):
    result = 1 % modulus
    base %= modulus
    while exponent:
        if exponent % 2:
            result = result * base % modulus
        base = base * base % modulus
        exponent //= 2
    return result`,
        insideWith(
          `import builtins as _builtins
import contextlib as _contextlib

_small_powers = {(base, exponent): pow(base, exponent, 12) for base in [-8, -1, 0, 2, 13] for exponent in range(10)}
_message = "This exercise asks you to implement repeated squaring, so three-argument pow is disabled during the checks."

@_contextlib.contextmanager
def _without_modular_pow():
    original = _builtins.pow
    for value in list(globals().values()):
        assert value is not original, _message
    def two_argument_pow(base, exponent, mod=None):
        if mod is not None:
            raise AssertionError(_message)
        return original(base, exponent)
    _builtins.pow = two_argument_pow
    try:
        yield
    finally:
        _builtins.pow = original`,
          '_without_modular_pow()',
          withLargeCase(
            `assert mod_power(2, 20, 1000) == 576
assert mod_power(-2, 3, 5) == 2
assert mod_power(9, 0, 7) == 1
assert mod_power(0, 0, 7) == 1, "Use the empty-product convention."
assert mod_power(0, 5, 7) == 0
assert mod_power(9, 0, 1) == 0
assert mod_power(123, 500, 1) == 0
assert mod_power(7, 10**9, 97) == 61, "Consume exponent bits instead of multiplying a billion times."
for base in [-8, -1, 0, 2, 13]:
    for exponent in range(10):
        assert mod_power(base, exponent, 12) == _small_powers[(base, exponent)]`,
            `_bases = _numbers(10000, -10**12, 10**12, 361)
_exponents = _numbers(10000, 0, 10**18, 362)
_moduli = _numbers(10000, 1, 10**9, 363)
def _run():
    return [mod_power(_bases[i], _exponents[i], _moduli[i]) for i in range(10000)]
_result, _seconds = _timed(_run)
assert _checksum(_result) == 1223432634806913176, "The 10,000-power case returned wrong residues."
_check_time(_seconds, "The 10,000-power case", "Square the base and halve the exponent instead of multiplying once per exponent step.")`,
          ),
        ),
        'Each step preserves the modular-power invariant while removing one exponent bit. Reducing both multiplications keeps residues bounded.',
        'Start at 1 % modulus. For an odd exponent multiply the result, then square the base and use exponent //= 2.',
      ),
    ],
    [
      [
        'When does a modular inverse of b modulo m exist?',
        'Exactly when gcd(b, m) = 1.',
      ],
      [
        'Why does repeated squaring take logarithmically many iterations?',
        'Each iteration halves the remaining exponent, processing one binary digit.',
      ],
    ],
  ),

  skill(
    'cp-sieve',
    'cp-number-theory',
    'Mark primes in a bounded range',
    'Use one primality table instead of testing every number independently.',
    [
      'cp-sieve-candidate-table',
      'cp-sieve-square-start',
      'cp-sieve-factor-bound',
      'comprehensions',
    ],
    [
      'The Sieve of Eratosthenes finds every prime from two through an integer bound n. Create a boolean table of length n + 1, initially true, and mark zero and one false. A remaining true entry is a candidate prime. The contract here permits 0 <= n <= 100000; bounds below two return an empty result.',
      'For each still-true p with p * p <= n, mark p * p, p * p + p, and later multiples false. Starting at p² is safe because any smaller composite multiple of p has a smaller factor and has already been marked. Every composite up to n has a prime factor at most √n, so no composite remains after the scan.',
      'The marking invariant is that multiples of all processed primes are excluded. The sieve uses O(n log log n) marking time and O(n) storage, plus an O(n) scan to collect results. A table is ideal for many bounded primality queries; allocating a table up to one enormous isolated number would be wasteful.',
    ],
    `def primes_up_to(limit):
    if limit < 2:
        return []
    prime = [True] * (limit + 1)
    prime[0] = prime[1] = False
    p = 2
    while p * p <= limit:
        if prime[p]:
            for multiple in range(p * p, limit + 1, p):
                prime[multiple] = False
        p += 1
    return [value for value in range(2, limit + 1) if prime[value]]

print(primes_up_to(20))
print(primes_up_to(1))`,
    '[2, 3, 5, 7, 11, 13, 17, 19]\n[]',
    'Zero and one are excluded, and composite multiples are removed. The upper bound is inclusive.',
    [
      exercise(
        'Implement primes_up_to(limit) with a sieve. limit is an integer from 0 through 5000000. Return all prime integers <= limit in increasing order. Return [] below two, exclude zero and one, and begin each prime’s marking at its square. A hidden case with limit 5,000,000 must finish within 1.5 seconds.',
        'def primes_up_to(limit):\n    # Mark a bounded primality table.\n    pass\n',
        `def primes_up_to(limit):
    if limit < 2:
        return []
    prime = [True] * (limit + 1)
    prime[0] = prime[1] = False
    p = 2
    while p * p <= limit:
        if prime[p]:
            for multiple in range(p * p, limit + 1, p):
                prime[multiple] = False
        p += 1
    return [value for value in range(2, limit + 1) if prime[value]]`,
        withLargeCase(
          `assert primes_up_to(0) == []
assert primes_up_to(1) == []
assert primes_up_to(2) == [2], "The bound is inclusive."
assert primes_up_to(4) == [2, 3]
assert primes_up_to(20) == [2, 3, 5, 7, 11, 13, 17, 19]
assert primes_up_to(49) == [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47], "Mark prime squares."
assert primes_up_to(97)[-1] == 97
result = primes_up_to(1000)
assert len(result) == 168 and result[-1] == 997
assert result == sorted(set(result)), "Return each prime once in order."`,
          `_result, _seconds = _timed(primes_up_to, 5000000)
assert _checksum(_result) == 1620756028218592251, "primes_up_to(5000000) returned the wrong primes."
_check_time(_seconds, "primes_up_to(5000000)", "Mark multiples in one table instead of testing each number by trial division.", 1.5)`,
        ),
        'Each prime marks its composite multiples. Processing through its square bound suffices to eliminate every composite in the table.',
        'Handle limit < 2 first, allocate limit + 1 entries, and mark with range(p * p, limit + 1, p).',
      ),
    ],
    [
      [
        'Where should a sieve begin marking multiples of a prime p?',
        'At p²; smaller composite multiples were already marked by smaller primes.',
      ],
      [
        'What are the standard sieve’s time and space bounds?',
        'O(n log log n) time and O(n) space for bound n.',
      ],
    ],
  ),

  skill(
    'cp-combinatorics',
    'cp-number-theory',
    'Count combinations with Pascal states',
    'Build binomial coefficients modulo any positive modulus without division.',
    ['cp-combination-descending-row'],
    [
      'The binomial coefficient C(n, k) counts unordered selections of k distinct indexed items from n. Divide the selections according to whether they contain one distinguished item: C(n, k) = C(n - 1, k) + C(n - 1, k - 1). The boundary C(n, 0) = 1 counts the empty selection, and C(n, k) = 0 when k < 0 or k > n.',
      'A one-dimensional Pascal table starts with dp[0] = 1 % modulus and other entries zero. After processing i items, dp[r] equals C(i, r) modulo the modulus. Update r downward so dp[r - 1] still belongs to the previous row. Symmetry C(n, k) = C(n, n - k) allows a shorter table.',
      'For 0 <= n <= 500, this addition-only method uses O(n·(1 + min(k, n - k))) time and O(1 + min(k, n - k)) storage for valid k, and works with any positive integer modulus, including composite values and one. The added one covers the outer-loop work even when k is zero or n. Factorial-based division modulo m would require invertible denominators. Do not apply a prime-modulus inverse shortcut to arbitrary moduli, or when a factorial denominator is divisible by that prime.',
    ],
    `def choose_mod(n, k, modulus):
    if k < 0 or k > n:
        return 0
    k = min(k, n - k)
    dp = [0] * (k + 1)
    dp[0] = 1 % modulus
    for count in range(1, n + 1):
        for selected in range(min(count, k), 0, -1):
            dp[selected] = (dp[selected] + dp[selected - 1]) % modulus
    return dp[k]

print(choose_mod(6, 2, 10))
print(choose_mod(0, 0, 7))
print(choose_mod(5, 6, 7))`,
    '5\n1\n0',
    'There are fifteen two-item selections from six items, giving residue five modulo ten. Empty and impossible selections use explicit boundaries.',
    [
      exercise(
        'Implement choose_mod(n, k, modulus) using Pascal’s recurrence. n is an integer from 0 through 500, k is any integer, and modulus is a positive integer. Return C(n, k) % modulus, or 0 when k is outside [0, n]. Support composite moduli and modulus 1 without modular division. The checks disable math.comb, math.perm, and math.factorial, and hidden n = 500 cases must finish within 3 seconds.',
        'def choose_mod(n, k, modulus):\n    # Build a compressed Pascal table, updating downward.\n    pass\n',
        `def choose_mod(n, k, modulus):
    if k < 0 or k > n:
        return 0
    k = min(k, n - k)
    dp = [0] * (k + 1)
    dp[0] = 1 % modulus
    for count in range(1, n + 1):
        for selected in range(min(count, k), 0, -1):
            dp[selected] = (dp[selected] + dp[selected - 1]) % modulus
    return dp[k]`,
        withoutShortcuts(
          `import math
_pascal = [[1]]
for _row in range(1, 21):
    _previous = _pascal[-1]
    _pascal.append([1] + [_previous[k - 1] + _previous[k] for k in range(1, _row)] + [1])`,
          'math',
          ['comb', 'perm', 'factorial'],
          'This exercise asks you to build Pascal rows yourself, so math.comb, math.perm, and math.factorial are disabled during the checks.',
          withLargeCase(
            `assert choose_mod(0, 0, 7) == 1
assert choose_mod(6, 2, 10) == 5
assert choose_mod(6, 4, 10) == 5, "Use combination symmetry."
assert choose_mod(5, -1, 7) == 0
assert choose_mod(5, 6, 7) == 0
assert choose_mod(8, 0, 9) == 1
assert choose_mod(8, 8, 9) == 1
assert choose_mod(0, 0, 1) == 0
assert choose_mod(12, 6, 8) == 4, "Composite moduli need no inverse."
for n in range(21):
    for k in range(n + 1):
        for modulus in [1, 4, 13]:
            assert choose_mod(n, k, modulus) == _pascal[n][k] % modulus`,
            `def _run():
    return [choose_mod(500, 250, 10**9 + 7), choose_mod(500, 137, 1000), choose_mod(499, 300, 2**61 - 1)]
_result, _seconds = _timed(_run)
assert _result == [515561345, 0, 2102609650960852793], "The n = 500 cases returned wrong residues."
_check_time(_seconds, "Three n = 500 cases", "Build Pascal rows with one table instead of recursing on both smaller counts.")`,
          ),
        ),
        'The include/exclude partition produces Pascal’s recurrence. Descending updates preserve the previous row, and addition works for every positive modulus.',
        'Reject invalid k, initialize the empty selection, then add dp[r - 1] to dp[r] in descending r order.',
      ),
    ],
    [
      [
        'What does C(n, k) count?',
        'Unordered k-item selections from n distinct indexed items; C(n, 0) = 1.',
      ],
      [
        'Why is Pascal DP safe for composite moduli?',
        'It uses addition and reduction only, so no denominator needs an inverse.',
      ],
    ],
  ),

  skill(
    'cp-fenwick',
    'cp-range',
    'Maintain sums with a Fenwick tree',
    'Support point additions and half-open range sums in logarithmic time.',
    [
      'cp-fenwick-prefix-walk',
      'cp-fenwick-update-walk',
      'cp-prefix-query',
      'list-repetition',
      'zip-enumerate',
    ],
    [
      'Ordinary prefix sums answer range sums quickly, but changing one value can force many prefix entries to change. A Fenwick tree stores partial sums in overlapping power-of-two blocks. With a 1-based internal index i, tree[i] covers exactly lowbit(i) entries ending at i, where lowbit(i) = i & -i.',
      'The public array remains zero-based. Adding delta at public index p starts internally at i = p + 1 and repeatedly adds lowbit(i) to visit every stored block containing that position. A prefix query for public [0, end) starts internally at i = end and repeatedly subtracts lowbit(i), combining disjoint blocks. Never start an update at internal zero: its lowbit is zero and the loop would not advance.',
      'A sum over [left, right) is prefix(right) - prefix(left); empty ranges sum to zero. The function below accepts valid point-add and sum operations, including negative values and deltas. Each operation costs O(log n), storage is O(n), and building by n point additions costs O(n log n). Keep the indexing conversion at the public boundary to make the invariant easy to check.',
    ],
    `def range_sums(values, operations):
    n = len(values)
    tree = [0] * (n + 1)
    def add(index, delta):
        index += 1
        while index <= n:
            tree[index] += delta
            index += index & -index
    def prefix(end):
        total = 0
        while end > 0:
            total += tree[end]
            end -= end & -end
        return total
    for index, value in enumerate(values):
        add(index, value)
    answers = []
    for kind, left, right in operations:
        if kind == "add":
            add(left, right)
        else:
            answers.append(prefix(right) - prefix(left))
    return answers

print(range_sums([2, 1, 4, 3], [("sum", 1, 4), ("add", 2, 5), ("sum", 0, 3)]))`,
    '[8, 12]',
    'The first sum uses indices one through three. Adding five to index two changes the subsequent prefix total without rebuilding all prefixes.',
    [
      exercise(
        'Implement range_sums(values, operations) using a Fenwick tree. values is an integer list. Each operation is ("add", index, delta), with 0 <= index < len(values), or ("sum", left, right), with 0 <= left <= right <= len(values). Return sum answers in operation order. Ranges are half-open [left, right); empty ranges sum to zero. Additions may be negative. Preserve values. A hidden case with 200,000 values and 200,000 operations must finish within 3 seconds.',
        'def range_sums(values, operations):\n    # Convert public indices to a 1-based Fenwick representation.\n    pass\n',
        `def range_sums(values, operations):
    n = len(values)
    tree = [0] * (n + 1)
    def add(index, delta):
        index += 1
        while index <= n:
            tree[index] += delta
            index += index & -index
    def prefix(end):
        total = 0
        while end > 0:
            total += tree[end]
            end -= end & -end
        return total
    for index, value in enumerate(values):
        add(index, value)
    answers = []
    for kind, left, right in operations:
        if kind == "add":
            add(left, right)
        else:
            answers.append(prefix(right) - prefix(left))
    return answers`,
        withLargeCase(
          `assert range_sums([], []) == []
assert range_sums([], [("sum", 0, 0)]) == [0]
assert range_sums([5], [("sum", 0, 1), ("add", 0, -7), ("sum", 0, 1)]) == [5, -2]
assert range_sums([2, 1, 4, 3], [("sum", 1, 4), ("add", 2, 5), ("sum", 0, 3)]) == [8, 12]
assert range_sums([1, -3, 6], [("sum", 1, 1), ("sum", 0, 3), ("add", 2, -6), ("sum", 2, 3)]) == [0, 4, 0]
values = [3, 1, 5, 2, 4]
operations = [("add", 0, 2), ("add", 4, -3), ("sum", 0, 5), ("sum", 1, 4), ("sum", 4, 5)]
assert range_sums(values, operations) == [14, 8, 1]
assert values == [3, 1, 5, 2, 4], "Preserve the source array."
assert range_sums([7, 8], [("add", 1, 0)]) == []`,
          `_values = _numbers(200000, -1000, 1000, 401)
_kinds = _numbers(200000, 0, 1, 402)
_xs = _numbers(200000, 0, 200000, 403)
_ys = _numbers(200000, 0, 200000, 404)
_operations = [("add", min(_xs[i], 199999), _ys[i] % 2001 - 1000) if _kinds[i] else ("sum", min(_xs[i], _ys[i]), max(_xs[i], _ys[i])) for i in range(200000)]
_result, _seconds = _timed(range_sums, _values, _operations)
assert _checksum(_result) == 207961389645802781, "The 200,000-operation case returned wrong sums."
_check_time(_seconds, "The 200,000-operation case", "Walk the Fenwick tree in O(log n) per operation instead of re-adding each range.")`,
        ),
        'Fenwick blocks preserve their sums under point additions. Prefix queries partition the requested prefix into disjoint stored blocks, and subtraction yields the range.',
        'Use index + 1 for updates, end for prefix queries, and i & -i to move between blocks.',
      ),
    ],
    [
      [
        'What does Fenwick tree[i] store with 1-based internal indexing?',
        'The sum of lowbit(i) entries ending at internal position i, with lowbit(i) = i & -i.',
      ],
      [
        'How do Fenwick point updates and prefix queries move?',
        'Updates add lowbit(i); prefix queries subtract it. Public update p starts at p + 1.',
      ],
    ],
  ),

  skill(
    'cp-segment-tree',
    'cp-range',
    'Combine ranges with a segment tree',
    'Maintain range minima under point assignment using associative summaries.',
    ['cp-segment-query-boundaries'],
    [
      'A segment tree stores an associative summary of each interval, combining two child summaries into their parent. For range minima, the combine operation is min and the identity is infinity. Pad the leaf count to a power of two, fill unused leaves with infinity, and build parents upward. The invariant is that every node stores the minimum of the real values in its interval.',
      'Point assignment changes one leaf and recomputes its ancestors. An iterative query uses a half-open range [left, right): move the boundaries to leaf positions, include a left node when the left boundary is a right child, include the node just before an odd right boundary, then move both boundaries upward. The included nodes form disjoint pieces of exactly the requested range.',
      'Building costs O(n) time and space, and each point assignment or range query costs O(log n). Unlike sums, minima cannot be recovered by subtracting two prefix minima, which motivates a general range structure. In this function, an empty query returns None, including on an empty array. Input values are integers, assignments use valid indices, and queries satisfy 0 <= left <= right <= n.',
    ],
    `def range_minima(values, operations):
    size = 1
    while size < len(values):
        size *= 2
    tree = [float("inf")] * (2 * size)
    tree[size:size + len(values)] = values
    for node in range(size - 1, 0, -1):
        tree[node] = min(tree[2 * node], tree[2 * node + 1])
    answers = []
    for kind, left, right in operations:
        if kind == "set":
            node = size + left
            tree[node] = right
            node //= 2
            while node:
                tree[node] = min(tree[2 * node], tree[2 * node + 1])
                node //= 2
        elif left == right:
            answers.append(None)
        else:
            left += size
            right += size
            best = float("inf")
            while left < right:
                if left % 2:
                    best = min(best, tree[left])
                    left += 1
                if right % 2:
                    right -= 1
                    best = min(best, tree[right])
                left //= 2
                right //= 2
            answers.append(best)
    return answers

print(range_minima([8, 3, 6, 1, 9], [("min", 0, 3), ("set", 1, 7), ("min", 0, 3), ("min", 3, 5)]))`,
    '[3, 6, 1]',
    'Setting index one to seven changes ancestors, and the minimum of [0, 3) rises from three to six. The last query covers only indices three and four.',
    [
      exercise(
        'Implement range_minima(values, operations) with a segment tree. values is an integer list. Operations are ("set", index, value) for valid indices, or ("min", left, right) with 0 <= left <= right <= len(values). Return query answers in order, using half-open [left, right) ranges and None for empty ranges. Assignments replace rather than add. Preserve values. A hidden case with 200,000 values and 120,000 operations must finish within 3 seconds.',
        'def range_minima(values, operations):\n    # Build a minimum tree, then apply assignments and queries.\n    pass\n',
        `def range_minima(values, operations):
    size = 1
    while size < len(values):
        size *= 2
    tree = [float("inf")] * (2 * size)
    tree[size:size + len(values)] = values
    for node in range(size - 1, 0, -1):
        tree[node] = min(tree[2 * node], tree[2 * node + 1])
    answers = []
    for kind, left, right in operations:
        if kind == "set":
            node = size + left
            tree[node] = right
            node //= 2
            while node:
                tree[node] = min(tree[2 * node], tree[2 * node + 1])
                node //= 2
        elif left == right:
            answers.append(None)
        else:
            left += size
            right += size
            best = float("inf")
            while left < right:
                if left % 2:
                    best = min(best, tree[left])
                    left += 1
                if right % 2:
                    right -= 1
                    best = min(best, tree[right])
                left //= 2
                right //= 2
            answers.append(best)
    return answers`,
        withLargeCase(
          `assert range_minima([], []) == []
assert range_minima([], [("min", 0, 0)]) == [None]
assert range_minima([7], [("min", 0, 1), ("set", 0, -2), ("min", 0, 1), ("min", 1, 1)]) == [7, -2, None]
assert range_minima([8, 3, 6, 1, 9], [("min", 0, 3), ("set", 1, 7), ("min", 0, 3), ("min", 3, 5)]) == [3, 6, 1]
assert range_minima([1, 9, 8], [("min", 1, 3)]) == [8], "Exclude values before left."
assert range_minima([4, -3, 2], [("min", 0, 3), ("set", 1, 10), ("min", 0, 3)]) == [-3, 2]
values = [5, 5, 5, 5, 5]
assert range_minima(values, [("set", 4, 1), ("min", 0, 4), ("min", 4, 5), ("min", 2, 2)]) == [5, 1, None]
assert values == [5, 5, 5, 5, 5]
assert range_minima([1, 2], [("set", 0, 3)]) == []`,
          `_values = _numbers(200000, -10**9, 10**9, 411)
_kinds = _numbers(120000, 0, 1, 412)
_xs = _numbers(120000, 0, 200000, 413)
_ys = _numbers(120000, 0, 200000, 414)
_zs = _numbers(120000, -10**9, 10**9, 415)
_operations = [("set", min(_xs[i], 199999), _zs[i]) if _kinds[i] else ("min", min(_xs[i], _ys[i]), max(_xs[i], _ys[i])) for i in range(120000)]
_result, _seconds = _timed(range_minima, _values, _operations)
assert _checksum(_result) == 19758530507032262, "The 120,000-operation case returned wrong minima."
_check_time(_seconds, "The 120,000-operation case", "Combine O(log n) boundary nodes per query instead of scanning the whole range.")`,
        ),
        'Each assignment restores the ancestor-minimum invariant. The query collects disjoint tree intervals covering exactly the requested half-open range.',
        'Use infinity for padding, rebuild parents after a set, and move query endpoints upward while consuming odd boundaries.',
      ),
    ],
    [
      [
        'What properties does a segment-tree summary need?',
        'An associative combine operation and a suitable identity for empty pieces.',
      ],
      [
        'What do [left, right) segment queries include?',
        'Indices left through right - 1; an equal-endpoint range is empty.',
      ],
    ],
  ),

  skill(
    'cp-binary-lifting',
    'cp-range',
    'Jump through ancestor powers',
    'Precompute doubling steps and answer bounded-tree ancestor queries safely.',
    ['cp-lifting-query-bits', 'unpacking', 'number-builtins', 'break-continue'],
    [
      'Binary lifting preprocesses repeated jumps in a parent-pointer forest. parents[v] is v’s immediate parent, with -1 for every root; the parent pointers must be acyclic and all other parents must be valid vertex indices. up[j][v] stores the ancestor 2ʲ steps above v. The base row is parents, and the next row composes two jumps from the preceding row.',
      'To answer the kth ancestor, split nonnegative k into binary bits. For each set bit j, replace the current vertex with up[j][vertex]. The invariant is that the current vertex has moved by exactly the processed bit distances. Stop at -1; never index a row with -1, since Python would silently select its last entry. For k = 0, the answer is the original vertex.',
      'A forest of n vertices has fewer than n parent edges on any chain. Therefore k >= n immediately returns -1, even for a huge k, avoiding access beyond the table. max(1, n.bit_length()) rows suffice for smaller k. Preprocessing uses O(n log n) time and space, and each query uses O(log n) time. An empty forest supports an empty query list only; query vertices otherwise must be valid.',
    ],
    `def kth_ancestors(parents, queries):
    n = len(parents)
    up = [parents[:]]
    for _ in range(1, max(1, n.bit_length())):
        previous = up[-1]
        up.append([-1 if parent == -1 else previous[parent] for parent in previous])
    answers = []
    for vertex, steps in queries:
        if steps >= n:
            answers.append(-1)
            continue
        bit = 0
        while steps and vertex != -1:
            if steps & 1:
                vertex = up[bit][vertex]
            steps >>= 1
            bit += 1
        answers.append(vertex)
    return answers

print(kth_ancestors([-1, 0, 0, 1, 3], [(4, 0), (4, 2), (4, 3), (4, 4), (0, 1)]))`,
    '[4, 1, 0, -1, -1]',
    'Vertex four follows the chain 4 → 3 → 1 → 0. A zero-step query stays at four, and moving above the root returns -1.',
    [
      exercise(
        'Implement kth_ancestors(parents, queries). parents describes an acyclic forest: each parent is -1 for a root or a valid vertex index. Each query (vertex, k) uses a valid vertex and nonnegative integer k; k may be arbitrarily large. Return the kth ancestor for each query, -1 if absent, and the vertex itself for k = 0. Empty parents comes with no queries. Use a doubling table and preserve parents. A hidden case with 100,000 vertices and 100,000 queries must finish within 3 seconds.',
        'def kth_ancestors(parents, queries):\n    # Precompute 2**j jumps, preserving -1 roots.\n    pass\n',
        `def kth_ancestors(parents, queries):
    n = len(parents)
    up = [parents[:]]
    for _ in range(1, max(1, n.bit_length())):
        previous = up[-1]
        up.append([-1 if parent == -1 else previous[parent] for parent in previous])
    answers = []
    for vertex, steps in queries:
        if steps >= n:
            answers.append(-1)
            continue
        bit = 0
        while steps and vertex != -1:
            if steps & 1:
                vertex = up[bit][vertex]
            steps >>= 1
            bit += 1
        answers.append(vertex)
    return answers`,
        withLargeCase(
          `assert kth_ancestors([], []) == []
assert kth_ancestors([-1], [(0, 0), (0, 1), (0, 10**50)]) == [0, -1, -1]
assert kth_ancestors([-1, 0, 0, 1, 3], [(4, 0), (4, 2), (4, 3), (4, 4), (0, 1)]) == [4, 1, 0, -1, -1]
assert kth_ancestors([2, 2, -1], [(0, 1), (0, 2), (1, 0)]) == [2, -1, 1], "Parents need not precede children."
assert kth_ancestors([-1, 0, -1, 2], [(1, 1), (3, 1), (3, 2)]) == [0, 2, -1]
parents = [-1] + list(range(19))
assert kth_ancestors(parents, [(19, 16), (19, 19), (19, 20), (19, 10**100)]) == [3, 0, -1, -1]
assert parents == [-1] + list(range(19)), "Preserve parent pointers."`,
          `_back = _numbers(100000, 1, 3, 421)
_parents = [-1] + [max(-1, vertex - _back[vertex]) for vertex in range(1, 100000)]
_queries = list(zip(_numbers(100000, 0, 99999, 422), _numbers(100000, 0, 100000, 423)))
_result, _seconds = _timed(kth_ancestors, _parents, _queries)
assert _checksum(_result) == 1356393175373117166, "The 100,000-query case returned wrong ancestors."
_check_time(_seconds, "The 100,000-query case", "Jump by powers of two from a doubling table instead of stepping one parent at a time.")`,
        ),
        'Each doubling row composes two existing jumps, guarding the -1 sentinel. Query bits select disjoint jump lengths; k >= n has no ancestor in an acyclic forest.',
        'Store the parent row first, compose each row through the previous row, then consume k bits while the current vertex exists.',
      ),
    ],
    [
      [
        'How is a binary-lifting row computed?',
        'up[j][v] = up[j - 1][up[j - 1][v]], unless the intermediate ancestor is -1.',
      ],
      [
        'How do you avoid table overflow for a huge ancestor distance?',
        'In an acyclic n-vertex forest, k >= n has no ancestor; return -1 before table lookups.',
      ],
    ],
  ),

  skill(
    'cp-scc',
    'cp-range',
    'Group mutual reachability',
    'Find strongly connected components and separate directed cycles from DAG structure.',
    ['cp-scc-reverse-components', 'cp-topological'],
    [
      'A strongly connected component (SCC) is a maximal group of directed-graph vertices in which every vertex can reach every other. Reachability in one direction is insufficient. Every vertex belongs to exactly one SCC, including isolated vertices. A component with at least two vertices contains a directed cycle; a singleton contains a cycle only if it has a self-loop.',
      'Kosaraju’s algorithm first runs DFS on the original graph and records each vertex when its traversal finishes. Then reverse every edge and explore vertices in decreasing finishing order. Each second-pass traversal finds one whole SCC. Finishing order isolates a source component of the remaining original component graph, so reversed traversal cannot escape it. Use explicit DFS frames to record completion after all neighbors, rather than recording discovery order.',
      'Contracting SCCs into one vertex each produces a DAG: a cycle between distinct components would make them mutually reachable and therefore one component. Both DFS passes use O(V + E) time and O(V + E) graph storage. The function uses iterative stacks to avoid Python recursion depth limits. Sorting vertices within groups and groups lexicographically makes results deterministic and adds up to O(V log V) reporting time. Edges may repeat or be self-loops, with vertices numbered 0 through n - 1.',
    ],
    `def scc_groups(n, edges):
    graph = [[] for _ in range(n)]
    reverse = [[] for _ in range(n)]
    for source, target in edges:
        graph[source].append(target)
        reverse[target].append(source)
    seen = [False] * n
    order = []
    for root in range(n):
        if seen[root]:
            continue
        seen[root] = True
        stack = [(root, 0)]
        while stack:
            vertex, next_index = stack[-1]
            if next_index == len(graph[vertex]):
                order.append(vertex)
                stack.pop()
            else:
                neighbor = graph[vertex][next_index]
                stack[-1] = (vertex, next_index + 1)
                if not seen[neighbor]:
                    seen[neighbor] = True
                    stack.append((neighbor, 0))
    seen = [False] * n
    groups = []
    for root in reversed(order):
        if seen[root]:
            continue
        seen[root] = True
        stack = [root]
        group = []
        while stack:
            vertex = stack.pop()
            group.append(vertex)
            for neighbor in reverse[vertex]:
                if not seen[neighbor]:
                    seen[neighbor] = True
                    stack.append(neighbor)
        groups.append(sorted(group))
    return sorted(groups)

edges = [(0, 1), (1, 0), (1, 2), (2, 3), (3, 2), (3, 4)]
print(scc_groups(5, edges))`,
    '[[0, 1], [2, 3], [4]]',
    'Vertices zero and one are mutually reachable, as are two and three. One-way edges connect those groups to each other and to vertex four.',
    [
      exercise(
        'Implement scc_groups(n, edges) for a directed graph on vertices 0 through n - 1, with n >= 0. Every edge endpoint is valid; duplicate edges and self-loops are allowed. Return the SCC partition as sorted lists of vertex indices, with the groups sorted lexicographically. Include isolated vertices, return [] for n = 0, and use iterative graph traversals to support long chains. A hidden graph with 50,000 vertices and about 150,000 edges must finish within 3 seconds.',
        'def scc_groups(n, edges):\n    # Record DFS finishing order, then explore the reversed graph.\n    pass\n',
        `def scc_groups(n, edges):
    graph = [[] for _ in range(n)]
    reverse = [[] for _ in range(n)]
    for source, target in edges:
        graph[source].append(target)
        reverse[target].append(source)
    seen = [False] * n
    order = []
    for root in range(n):
        if seen[root]:
            continue
        seen[root] = True
        stack = [(root, 0)]
        while stack:
            vertex, next_index = stack[-1]
            if next_index == len(graph[vertex]):
                order.append(vertex)
                stack.pop()
            else:
                neighbor = graph[vertex][next_index]
                stack[-1] = (vertex, next_index + 1)
                if not seen[neighbor]:
                    seen[neighbor] = True
                    stack.append((neighbor, 0))
    seen = [False] * n
    groups = []
    for root in reversed(order):
        if seen[root]:
            continue
        seen[root] = True
        stack = [root]
        group = []
        while stack:
            vertex = stack.pop()
            group.append(vertex)
            for neighbor in reverse[vertex]:
                if not seen[neighbor]:
                    seen[neighbor] = True
                    stack.append(neighbor)
        groups.append(sorted(group))
    return sorted(groups)`,
        withLargeCase(
          `assert scc_groups(0, []) == []
assert scc_groups(3, []) == [[0], [1], [2]], "Include isolated vertices."
assert scc_groups(1, [(0, 0), (0, 0)]) == [[0]]
assert scc_groups(3, [(0, 1), (1, 0), (1, 2)]) == [[0, 1], [2]]
assert scc_groups(4, [(0, 1), (1, 2), (2, 0), (2, 3)]) == [[0, 1, 2], [3]]
assert scc_groups(5, [(0, 1), (1, 0), (1, 2), (2, 3), (3, 2), (3, 4)]) == [[0, 1], [2, 3], [4]]
assert scc_groups(5, [(4, 1), (1, 4), (4, 1), (2, 3)]) == [[0], [1, 4], [2], [3]]
assert scc_groups(1500, [(i, i + 1) for i in range(1499)]) == [[i] for i in range(1500)], "Avoid recursive depth limits."
assert scc_groups(1500, [(i, (i + 1) % 1500) for i in range(1500)]) == [list(range(1500))]`,
          `_cuts = sorted(set(_numbers(2500, 1, 49999, 431)))
_bounds = [0] + _cuts + [50000]
_edges = [(i, i + 1) for i in range(49999)]
for _first, _last in zip(_bounds, _bounds[1:]):
    if _last - _first > 1 and _first % 3:
        _edges.append((_last - 1, _first))
_sources = _numbers(100000, 0, 49999, 432)
_hops = _numbers(100000, 1, 400, 433)
_edges += [(_sources[i], min(49999, _sources[i] + _hops[i])) for i in range(100000)]
_result, _seconds = _timed(scc_groups, 50000, _edges)
assert _checksum(_result) == 1230589931274524807, "The 50,000-vertex graph returned wrong groups."
_check_time(_seconds, "The 50,000-vertex graph", "Use two linear passes (finishing order, then the reversed graph) instead of a search from every vertex.")`,
        ),
        'Finishing order on the original graph followed by reversed-edge traversals separates the maximal mutual-reachability groups. Explicit stacks handle deep graphs.',
        'In the first pass, save a (vertex, next-neighbor-index) frame so a vertex enters order only after all neighbors finish. Traverse reverse edges in reversed(order).',
      ),
    ],
    [
      [
        'What defines a strongly connected component?',
        'A maximal group of vertices mutually reachable by directed paths.',
      ],
      [
        'Why is an SCC condensation graph a DAG?',
        'A cycle among distinct components would make them mutually reachable and merge them into one SCC.',
      ],
    ],
  ),
];
