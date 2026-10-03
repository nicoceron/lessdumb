import { choose, predictOutput, type KnowledgePointModule } from '.';

// Competitive Programming, part 3: dynamic programming, strategy, number
// theory, and range queries. Programs are complete Python scripts.

const dynamic: KnowledgePointModule = {
  'cp-memo-state-key': [
    {
      title: 'Key a state by every input that changes its answer',
      explanation: [
        'A memoization cache maps a state key to the answer for that state. If two states with different answers share one key, the second store overwrites the first, and later lookups return the wrong answer.',
        'List every input that can change the answer. When a route depends on both the position and the remaining budget, the key must contain both values, not just the position.',
      ],
      example: {
        code: `by_position = {}
by_state = {}
for position, budget, answer in [(3, 2, 1), (3, 8, 5)]:
    by_position[position] = answer
    by_state[(position, budget)] = answer
print(by_position)
print(by_state)`,
        output: '{3: 5}\n{(3, 2): 1, (3, 8): 5}',
        explanation:
          'Keyed by position alone, the budget-8 answer replaces the budget-2 answer. The (position, budget) key keeps the two states apart.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `cache = {}
for position, budget, answer in [(2, 1, 4), (2, 5, 9), (2, 1, 4)]:
    cache[position] = answer
print(cache)`,
          ['{2: 9}', '{2: 4}', '{(2, 1): 4, (2, 5): 9}', '{2: 4, 2: 9}'],
          1,
          'All three stores use key 2, so each overwrites the last; the final store writes 4.',
        ),
        predictOutput(
          'What does this program print?',
          `cache = {}
for position, budget, answer in [(2, 1, 4), (2, 5, 9), (2, 1, 4)]:
    cache[(position, budget)] = answer
print(len(cache))`,
          ['1', '3', '6', '2'],
          3,
          'There are two distinct (position, budget) keys; the repeated state (2, 1) reuses its key.',
        ),
        choose(
          'count(row, col, steps_left) returns a number that depends on all three arguments. Which cache key is safe?',
          [
            '(row, col)',
            'row + col + steps_left',
            '(row, col, steps_left)',
            'steps_left',
          ],
          2,
          'Only the full tuple separates every state. A sum collides: (1, 2, 3) and (3, 2, 1) both give 6.',
        ),
        choose(
          'Two calls reach position 4, first with budget 1 and then with budget 2. The cache is keyed by position only. What happens on the second call?',
          [
            'It reuses the budget-1 answer, which may be wrong',
            'It computes a fresh answer automatically',
            'Python raises a KeyError',
            'It stores both answers under key 4',
          ],
          0,
          'Key 4 is already present, so the stored budget-1 answer is returned even though budget 2 may allow more.',
        ),
      ],
    },
    {
      title: 'Build hashable keys that match equal states',
      explanation: [
        'Dictionary keys must be hashable. A tuple of integers works; a list does not, because lists can change after being stored. Convert list-shaped states to tuples before using them as keys.',
        'Equal states must produce equal keys, and order inside the tuple matters: (2, 3) and (3, 2) are different keys. Keep the fields in one fixed order.',
      ],
      example: {
        code: `def route_keys(states):
    return [(position, budget) for position, budget in states]

keys = route_keys([[3, 2], [3, 8], [3, 2]])
cache = {}
for key in keys:
    cache[key] = "seen"
print(keys)
print(len(cache))`,
        output: '[(3, 2), (3, 8), (3, 2)]\n2',
        explanation:
          'Each list becomes a tuple. The repeated state produces an equal tuple, so the cache holds only two keys.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `cache = {}
cache[(1, 4)] = 10
cache[(1, 4)] = 12
print(cache[(1, 4)], len(cache))`,
          ['10 1', '12 2', '12 1', '10 2'],
          2,
          'The second assignment uses an equal tuple, so it replaces the value under the same single key.',
        ),
        choose(
          'Which value cannot be used as a dictionary key?',
          ['(2, 7)', '[2, 7]', '"2,7"', '27'],
          1,
          'A list is mutable and therefore unhashable; tuples, strings, and integers are hashable.',
        ),
        predictOutput(
          'What does this program print?',
          `states = [[0, 5], [0, 5], [1, 5]]
keys = [(position, budget) for position, budget in states]
print(keys[0] == keys[1], keys[0] == keys[2])`,
          ['True False', 'False False', 'True True', 'False True'],
          0,
          'Tuples built from equal values are equal; (0, 5) and (1, 5) differ in position.',
        ),
        predictOutput(
          'What does this program print?',
          `cache = {}
for state in [[2, 3], [3, 2], [2, 3]]:
    key = (state[0], state[1])
    if key in cache:
        cache[key] += 1
    else:
        cache[key] = 1
print(cache)`,
          [
            '{(2, 3): 3}',
            '{(2, 3): 1, (3, 2): 1}',
            '{(2, 3): 2, (3, 2): 1, (2, 3): 1}',
            '{(2, 3): 2, (3, 2): 1}',
          ],
          3,
          'Order inside a tuple matters, so (3, 2) is its own key, while the repeated (2, 3) increments one counter.',
        ),
      ],
    },
  ],

  'cp-memo-base-cases': [
    {
      title: 'Count a finished state as one completion',
      explanation: [
        'When counting exact routes, a remaining distance of zero means the route is already complete. There is exactly one way to finish it: take no further steps. So the zero state returns 1, not 0.',
        'Counting recurrences add the counts of smaller states. If the finished state returned 0, every sum would be built from zeros and every count would be 0.',
      ],
      example: {
        code: `def route_boundary(remaining):
    if remaining == 0:
        return 1
    if remaining < 0:
        return 0
    return None

print(route_boundary(0))
print(route_boundary(-3))`,
        output: '1\n0',
        explanation:
          'Zero remaining is one completed route. A negative remainder is a route that overshot, so it contributes nothing.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `def route_boundary(remaining):
    if remaining == 0:
        return 1
    if remaining < 0:
        return 0
    return None

print([route_boundary(r) for r in [0, -1, 0]])`,
          ['[0, 0, 0]', '[1, 1, 1]', '[1, 0, 1]', '[0, 1, 0]'],
          2,
          'Each zero is one finished route, and the negative remainder counts zero.',
        ),
        choose(
          'A route of exact length 4 has used all 4 units. How many ways remain to finish it?',
          [
            'Zero, since nothing is left to do',
            'One: take no more steps',
            'Four, one for each unit used',
            'It depends on the step sizes',
          ],
          1,
          'The empty continuation is one way to finish, regardless of which step sizes exist.',
        ),
        choose(
          'A counting recurrence adds the counts of smaller states. If the zero state returned 0 instead of 1, what would every count become?',
          ['0', '1', 'Unchanged', 'Negative'],
          0,
          'Every count is ultimately a sum of base values; with no base value of 1, all sums are 0.',
        ),
        predictOutput(
          'What does this program print?',
          `def route_boundary(remaining):
    if remaining == 0:
        return 1
    if remaining < 0:
        return 0
    return None

total = 0
for r in [-2, 0, -1, 0]:
    total += route_boundary(r)
print(total)`,
          ['0', '4', '-3', '2'],
          3,
          'The two zeros contribute 1 each, and the two negative remainders contribute 0.',
        ),
      ],
    },
    {
      title: 'Separate an overshoot from an unfinished state',
      explanation: [
        'A negative remainder means the last step jumped past the target, so that branch counts 0. A positive remainder is not a failure: it still needs more steps, so the boundary helper cannot decide it yet.',
        'This helper returns None for a positive state to say "a transition must compute this". Merging cases, such as treating every remainder at or below zero as finished, counts overshoots as successes.',
      ],
      example: {
        code: `def route_boundary(remaining):
    if remaining == 0:
        return 1
    if remaining < 0:
        return 0
    return None

print([route_boundary(value) for value in [3, -1, 0]])`,
        output: '[None, 0, 1]',
        explanation:
          'Three units remain, so that state is unfinished. The overshoot counts zero and the exact finish counts one.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `def route_boundary(remaining):
    if remaining == 0:
        return 1
    if remaining < 0:
        return 0
    return None

print([route_boundary(r) for r in [2, -2, 0]])`,
          ['[2, 0, 1]', '[None, 0, 1]', '[None, 1, 0]', '[1, 0, 1]'],
          1,
          'A positive remainder still needs transitions, a negative one overshot, and zero is complete.',
        ),
        choose(
          'With steps of size 2, a walk with 3 units remaining jumps to 1 remaining, then to -1. What does the boundary report at -1?',
          [
            '1, because the walk ended',
            'None, because it is unfinished',
            '0, because the walk overshot',
            '-1, the size of the overshoot',
          ],
          2,
          'A negative remainder means the walk passed the exact target, so it contributes no route.',
        ),
        choose(
          'A helper returned 0 for every positive remainder instead of None. What would a caller wrongly conclude about remaining = 3?',
          [
            'That 3 overshot the target',
            'That exactly one route finishes from 3',
            'That 3 needs more steps',
            'That no route can finish from 3',
          ],
          3,
          '0 means "no completions", which is false for a state that may still finish with more steps.',
        ),
        predictOutput(
          'This helper merges two cases. What does it print?',
          `def boundary(remaining):
    if remaining <= 0:
        return 1
    return None

print([boundary(r) for r in [-1, 0, 1]])`,
          ['[1, 1, None]', '[0, 1, None]', '[1, 0, None]', '[None, 1, None]'],
          0,
          'remaining <= 0 is true for -1, so the overshoot is wrongly counted as a finished route.',
        ),
      ],
    },
  ],

  'cp-memo-cache-scope': [
    {
      title: 'Store an answer after computing it, then reuse it',
      explanation: [
        'A memoized function checks the cache first. On a miss it computes the answer, stores it, and returns it; on a hit it returns the stored answer without repeating the work.',
        'Store only completed answers. Caching does not rescue a recurrence that calls back into a state that is still being computed: that state has nothing stored yet, so the recursion continues.',
      ],
      example: {
        code: `calls = []
cache = {0: 0}
def solve(t):
    if t not in cache:
        calls.append(t)
        cache[t] = t + solve(t - 1)
    return cache[t]

print(solve(4))
print(solve(3))
print(calls)`,
        output: '10\n6\n[4, 3, 2, 1]',
        explanation:
          'solve(4) computes and stores states 4 down to 1. solve(3) is then a cache hit, so calls gains nothing new.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `calls = []
cache = {0: 0}
def solve(t):
    if t not in cache:
        calls.append(t)
        cache[t] = t + solve(t - 1)
    return cache[t]

print(solve(3))
print(solve(5))
print(calls)`,
          [
            '6\n15\n[3, 2, 1, 5, 4, 3, 2, 1]',
            '6\n15\n[5, 4, 3, 2, 1]',
            '6\n15\n[3, 2, 1, 5, 4]',
            '6\n9\n[3, 2, 1, 5, 4]',
          ],
          2,
          'solve(5) computes only 5 and 4; it finds state 3 already stored by the first call.',
        ),
        predictOutput(
          'What does this program print?',
          `calls = []
cache = {0: 0}
def solve(t):
    if t not in cache:
        calls.append(t)
        cache[t] = t + solve(t - 1)
    return cache[t]

solve(6)
solve(6)
print(len(calls))`,
          ['12', '7', '1', '6'],
          3,
          'The first call computes states 6 down to 1. The second call is a cache hit, and state 0 was stored from the start.',
        ),
        choose(
          'A helper writes cache[t] = 0 as a placeholder before recursing, planning to fill it in later. Another call reads cache[t] in between. What does it get?',
          [
            'The correct answer for t',
            '0, an unfinished placeholder',
            'A KeyError',
            'None',
          ],
          1,
          'The lookup succeeds, so it returns the placeholder as if it were a finished answer.',
        ),
        choose(
          'f(t) calls both f(t - 1) and f(t + 1), and memoizes its results. Does the cache guarantee that f finishes?',
          [
            'Yes, every state is computed once',
            'Yes, as long as the cache is a dictionary',
            'No, f(t) waits on f(t + 1), which calls f(t) before any answer is stored',
            'No, dictionaries cannot store negative keys',
          ],
          2,
          'Answers are stored only when complete; a state that depends on itself never completes, so recursion never reaches a base case.',
        ),
      ],
    },
    {
      title: 'Tie the cache lifetime to one input',
      explanation: [
        'When answers depend on data passed to a public function, create the cache inside that function and define the recursive helper there too. Each public call then starts with an empty cache.',
        'A cache created once at module level survives between calls. If its keys do not include the data, a later call with different data finds an old key and returns a stale answer.',
      ],
      example: {
        code: `def suffix_total(values):
    cache = {}
    def solve(i):
        if i == len(values):
            return 0
        if i not in cache:
            cache[i] = values[i] + solve(i + 1)
        return cache[i]
    return solve(0)

print(suffix_total([1, 2, 3]))
print(suffix_total([10, 20]))`,
        output: '6\n30',
        explanation:
          'Each call builds its own cache. A shared module-level cache would already hold key 0 with answer 6 and return 6 for the second list.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `cache = {}
def suffix_total(values):
    def solve(i):
        if i == len(values):
            return 0
        if i not in cache:
            cache[i] = values[i] + solve(i + 1)
        return cache[i]
    return solve(0)

print(suffix_total([4, 5]))
print(suffix_total([1, 1, 1]))`,
          ['9\n3', '9\n9', '9\n12', '3\n3'],
          1,
          'The cache outlives the first call, so solve(0) finds the stored 9 for the second list.',
        ),
        predictOutput(
          'What does this program print?',
          `def suffix_total(values):
    cache = {}
    def solve(i):
        if i == len(values):
            return 0
        if i not in cache:
            cache[i] = values[i] + solve(i + 1)
        return cache[i]
    return solve(0)

print(suffix_total([4, 5]))
print(suffix_total([1, 1, 1]))`,
          ['9\n9', '9\n12', '3\n3', '9\n3'],
          3,
          'The cache is created inside each call, so the second list is summed from scratch.',
        ),
        choose(
          'Which cache can safely be shared across calls to a public function?',
          [
            'One keyed only by an index into the input list',
            'Any dictionary created at module level',
            'None: a cache must never outlive one call',
            'One whose keys include every argument that changes the answer',
          ],
          3,
          'If the key fully describes the state, a stored answer is correct whenever that key appears again.',
        ),
        choose(
          'best(i) depends on the list prices passed to plan(prices). Where should best’s cache dictionary be created?',
          [
            'Inside plan, before defining best',
            'At module level, once',
            'Inside best, at the start of every call',
            'In the caller, after plan returns',
          ],
          0,
          'A cache inside plan lives for exactly one prices list. A cache inside best would be recreated on every recursive call and never reused.',
        ),
      ],
    },
  ],

  'cp-memoization': [
    {
      title: 'Write the recurrence from the first move',
      explanation: [
        'Every route that covers r units starts with exactly one move. Grouping routes by that first move splits them into groups that do not overlap, so their counts add: with moves of 1 and 3, ways(r) = ways(r - 1) + ways(r - 3).',
        'The base cases from earlier finish the definition: ways(0) = 1 for the empty route and 0 for a negative remainder. @cache stores each completed ways(r).',
      ],
      example: {
        code: `from functools import cache

def routes(distance):
    @cache
    def ways(remaining):
        if remaining == 0:
            return 1
        if remaining < 0:
            return 0
        return ways(remaining - 1) + ways(remaining - 3)
    return ways(distance)

print([routes(d) for d in range(7)])`,
        output: '[1, 1, 1, 2, 3, 4, 6]',
        explanation:
          'Each entry adds the counts three and one positions earlier, for example 6 = 4 + 2 at distance 6.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `from functools import cache

def routes(distance):
    @cache
    def ways(r):
        if r == 0:
            return 1
        if r < 0:
            return 0
        return ways(r - 1) + ways(r - 2)
    return ways(distance)

print(routes(5))`,
          ['5', '8', '13', '6'],
          1,
          'With moves of 1 and 2 the counts are 1, 1, 2, 3, 5, 8 for distances 0 through 5.',
        ),
        predictOutput(
          'What does this program print?',
          `from functools import cache

def routes(distance):
    @cache
    def ways(r):
        if r == 0:
            return 1
        if r < 0:
            return 0
        return ways(r - 2) + ways(r - 3)
    return ways(distance)

print(routes(7))`,
          ['1', '2', '5', '3'],
          3,
          'The ordered routes are 2+2+3, 2+3+2, and 3+2+2; the order of moves makes them different routes.',
        ),
        choose(
          'Moves are +1, +2, or +4. Which recurrence counts ordered routes for remaining r?',
          [
            'ways(r - 1) * ways(r - 2) * ways(r - 4)',
            'ways(r - 1) + ways(r - 2) + ways(r - 4)',
            'ways(r - 4) + 3',
            'ways(r + 1) + ways(r + 2) + ways(r + 4)',
          ],
          1,
          'Each route begins with exactly one of the three moves, so the three disjoint groups are added.',
        ),
        choose(
          'Why are the counts for different first moves added rather than multiplied?',
          [
            'Each route must use every move once',
            'Adding is faster than multiplying',
            'Each route starts with exactly one move, so the groups do not overlap',
            'The cache can only store sums',
          ],
          2,
          'Disjoint groups of routes are counted by adding their sizes. Multiplying counts combinations of independent choices.',
        ),
      ],
    },
    {
      title: 'Reuse cached states instead of repeating calls',
      explanation: [
        'Without a cache, ways(r) recomputes the same smaller states many times, and the number of calls grows exponentially. With @cache, each distinct state is evaluated once and later calls return the stored answer.',
        'For moves of 1 and 3, the distinct states are distance, distance - 1, ..., 0 plus the two negative states -1 and -2, so the work is O(distance).',
      ],
      example: {
        code: `from functools import cache

def count_evaluations(distance):
    evaluated = []
    @cache
    def ways(r):
        evaluated.append(r)
        if r == 0:
            return 1
        if r < 0:
            return 0
        return ways(r - 1) + ways(r - 3)
    ways(distance)
    return len(evaluated)

print(count_evaluations(6))`,
        output: '9',
        explanation:
          'The body runs once for each of the states 6 down to 0 and for -1 and -2: nine evaluations.',
      },
      questions: [
        predictOutput(
          'This version has no cache. What does it print?',
          `evaluated = []
def ways(r):
    evaluated.append(r)
    if r == 0:
        return 1
    if r < 0:
        return 0
    return ways(r - 1) + ways(r - 3)

print(ways(4), len(evaluated))`,
          ['3 7', '3 11', '3 5', '11 3'],
          1,
          'Small states such as 1 and 0 are recomputed on several branches, giving 11 calls for only 3 routes.',
        ),
        predictOutput(
          'This version caches each state. What does it print?',
          `from functools import cache

evaluated = []
@cache
def ways(r):
    evaluated.append(r)
    if r == 0:
        return 1
    if r < 0:
        return 0
    return ways(r - 1) + ways(r - 3)

print(ways(4), len(evaluated))`,
          ['3 11', '3 5', '3 7', '7 3'],
          2,
          'The states 4, 3, 2, 1, 0, -1, and -2 are each evaluated once.',
        ),
        choose(
          'With @cache, how does the number of evaluated states grow with distance for moves of 1 and 3?',
          ['O(1)', 'O(distance)', 'O(distance²)', 'O(2^distance)'],
          1,
          'Each value from distance down to -2 is evaluated once, which is about distance + 3 states.',
        ),
        choose(
          'While ways(r) is still running, it calls ways(r) again with exactly the same argument. What does @cache do?',
          [
            'Returns the cached answer for r',
            'Returns 0 for the repeated call',
            'Skips the repeated call',
            'Nothing useful: no answer is stored yet, so recursion repeats',
          ],
          3,
          'The answer is stored only after the call returns, so an unfinished state is not in the cache.',
        ),
      ],
    },
    {
      title: 'Keep the cache inside the call and watch recursion depth',
      explanation: [
        'When the recurrence depends on data passed in, such as the list of allowed moves, define the @cache helper inside the public function. A cached function at module level would keep answers computed for different data.',
        '@cache needs hashable arguments, so pass tuples rather than lists. Recursion depth grows with the distance; for very deep chains, compute the same states bottom-up with a loop instead.',
      ],
      example: {
        code: `from functools import cache

def routes(distance, moves):
    @cache
    def ways(r):
        if r == 0:
            return 1
        if r < 0:
            return 0
        total = 0
        for move in moves:
            total += ways(r - move)
        return total
    return ways(distance)

print(routes(4, [1, 3]))
print(routes(4, [2]))`,
        output: '3\n1',
        explanation:
          'Each call to routes creates a new cached helper for its own moves. A shared cache would have returned 3 again for the second call.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `from functools import cache

moves = [1, 2]
@cache
def ways(r):
    if r == 0:
        return 1
    if r < 0:
        return 0
    total = 0
    for move in moves:
        total += ways(r - move)
    return total

print(ways(4))
moves = [4]
print(ways(4))`,
          ['5\n1', '5\n2', '1\n1', '5\n5'],
          3,
          'The cache key is only r, so the second call returns the answer stored for the old moves.',
        ),
        predictOutput(
          'What does this program print?',
          `from functools import cache

def routes(distance, moves):
    @cache
    def ways(r):
        if r == 0:
            return 1
        if r < 0:
            return 0
        total = 0
        for move in moves:
            total += ways(r - move)
        return total
    return ways(distance)

print(routes(4, [1, 2]))
print(routes(4, [4]))`,
          ['5\n5', '5\n1', '5\n2', '1\n1'],
          1,
          'Each call builds a fresh cached helper, so moves [4] gives the single route 4.',
        ),
        choose(
          'A @cache function raises TypeError because one argument is a list. What should the state use instead?',
          [
            'A tuple of the same values',
            'A longer list',
            'A dictionary of the values',
            'A set of the list positions',
          ],
          0,
          '@cache stores arguments as dictionary keys, so they must be hashable; a tuple is, while lists, dictionaries, and sets are not.',
        ),
        choose(
          'count_routes(100000) uses this recursive memoized helper and fails before finishing. What is the likely cause and fix?',
          [
            'The cache is full; clear it between calls',
            'Integers overflow; use floats',
            'The recursion is about 100000 calls deep; fill a table bottom-up instead',
            'The base case is wrong; return 0 at zero',
          ],
          2,
          'Each pending call adds a stack frame, and Python limits recursion depth. A loop over increasing states has no such limit.',
        ),
      ],
    },
  ],

  'cp-dp-table-base': [
    {
      title: 'Give the reachable start a cost of zero',
      explanation: [
        'In a minimum-packet table, dp[t] means the fewest packets totaling exactly t. Before any packet is placed, only total 0 is reached, and it costs 0 packets, so dp[0] = 0.',
        'The table needs one entry for every total from 0 through target, which is target + 1 entries. A table of length target has no entry for the target itself.',
      ],
      example: {
        code: `def packet_table(target):
    table = [float("inf")] * (target + 1)
    table[0] = 0
    return table

print(packet_table(4))`,
        output: '[0, inf, inf, inf, inf]',
        explanation:
          'Five entries cover totals 0 through 4. Only total 0 starts reachable.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `table = [float("inf")] * (5 + 1)
table[0] = 0
print(len(table), table[0], table[5])`,
          ['5 0 inf', '6 inf inf', '6 0 inf', '5 0 0'],
          2,
          'Six entries cover totals 0 through 5; index 0 is set to 0 and index 5 stays infinity.',
        ),
        choose(
          'Which total is reachable before any packet is placed?',
          [
            'Total 1, with one packet',
            'Total 0, with zero packets',
            'The target total',
            'No total',
          ],
          1,
          'Placing no packets reaches exactly total 0 at a cost of 0.',
        ),
        predictOutput(
          'This table is meant to cover totals 0 through 3. What does it print?',
          `target = 3
table = [float("inf")] * target
table[0] = 0
print(table)`,
          [
            '[0, inf, inf, inf]',
            '[inf, inf, inf]',
            '[0, 0, 0]',
            '[0, inf, inf]',
          ],
          3,
          'Multiplying by target gives only three entries, so there is no index for total 3.',
        ),
        choose(
          'How many entries does a table for exact totals 0 through 10 need?',
          ['10', '11', '9', '20'],
          1,
          'Counting both endpoints, 0 through 10 is eleven totals.',
        ),
      ],
    },
    {
      title: 'Mark unreached totals with infinity',
      explanation: [
        'In a minimum problem, every unreached total needs a value that any real answer beats. Infinity works: min(inf, 3) is 3. Starting with 0 would claim a free solution, and min would never replace it.',
        'Infinity also stays infinite under + 1, so an unreachable total can never make another total look reachable.',
      ],
      example: {
        code: `wrong = [0] * 4
right = [float("inf")] * 4
right[0] = 0
print(min(wrong[3], 2))
print(min(right[3], 2))`,
        output: '0\n2',
        explanation:
          'The zero-filled table keeps a false answer of 0 packets. The infinity-filled table accepts the real candidate 2.',
      },
      questions: [
        predictOutput(
          'Total 4 can be reached with 3 packets, but this table was filled with zeros. What does it print?',
          `table = [0] * 5
table[4] = min(table[4], 3)
print(table[4])`,
          ['3', '4', 'inf', '0'],
          3,
          'min(0, 3) keeps the false starting value 0.',
        ),
        predictOutput(
          'What does this program print?',
          `table = [float("inf")] * 5
table[0] = 0
table[4] = min(table[4], 3)
print(table)`,
          [
            '[0, inf, inf, inf, 3]',
            '[0, 0, 0, 0, 3]',
            '[0, inf, inf, inf, inf]',
            '[3, inf, inf, inf, 3]',
          ],
          0,
          'Infinity loses to the real candidate 3, and the untouched totals stay unreached.',
        ),
        predictOutput(
          'What does this program print?',
          `unreachable = float("inf")
print(unreachable + 1, min(unreachable + 1, 7))`,
          ['inf inf', 'inf 7', '1 1', 'inf 8'],
          1,
          'Adding 1 to infinity is still infinity, and any finite value is smaller.',
        ),
        choose(
          'Why is 0 a bad starting value for unreached totals in a minimum-count table?',
          [
            'Python cannot store 0 in a list',
            'It makes dp[0] unreachable',
            'It looks like a free optimal answer, so min never replaces it',
            'It turns every answer into infinity',
          ],
          2,
          'No packet count is below 0, so a false 0 survives every comparison.',
        ),
      ],
    },
  ],

  'cp-dp-single-relaxation': [
    {
      title: 'Propose one more packet and keep the smaller count',
      explanation: [
        'If a smaller total t - s is reached with previous packets, adding one packet of size s reaches t with previous + 1 packets. That is a candidate, not automatically the answer.',
        'Relaxation keeps min(current, previous + 1): a better answer found earlier survives, and a better candidate replaces a worse one.',
      ],
      example: {
        code: `def relax_packet(current, previous):
    return min(current, previous + 1)

print(relax_packet(4, 1))
print(relax_packet(2, 5))`,
        output: '2\n2',
        explanation:
          'In the first call the candidate 1 + 1 = 2 beats 4. In the second, the current 2 beats the candidate 6.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `def relax_packet(current, previous):
    return min(current, previous + 1)

print(relax_packet(6, 3), relax_packet(3, 3))`,
          ['3 3', '4 3', '4 4', '7 4'],
          1,
          'First the candidate 4 beats 6. Second, the candidate 4 loses to the current 3.',
        ),
        predictOutput(
          'What does this program print?',
          `current = float("inf")
for previous in [5, 2, 4]:
    current = min(current, previous + 1)
print(current)`,
          ['5', '2', '6', '3'],
          3,
          'The candidates are 6, 3, and 5, and the running minimum keeps 3.',
        ),
        choose(
          'Total 7 currently needs 3 packets. Total 3 needs 1 packet. After relaxing total 7 with a size-4 packet, what is its count?',
          ['3', '2', '1', '4'],
          1,
          'The candidate is dp[3] + 1 = 2, which beats the current 3.',
        ),
        choose(
          'Why does relaxation take min(current, candidate) instead of always assigning the candidate?',
          [
            'Candidates are always larger',
            'min converts infinity to zero',
            'The candidate is only valid for dp[0]',
            'Another predecessor may already give fewer packets',
          ],
          3,
          'current may come from a different packet size that is better; assigning blindly would lose it.',
        ),
      ],
    },
    {
      title: 'Let unreachable predecessors propose nothing',
      explanation: [
        'An unreachable predecessor holds infinity, and infinity + 1 is still infinity, so its candidate never wins a min. The current value survives unchanged.',
        'This is why infinity, not a sentinel such as -1, marks unreachable totals inside the table: -1 + 1 would propose a false 0-packet solution.',
      ],
      example: {
        code: `inf = float("inf")
def relax_packet(current, previous):
    return min(current, previous + 1)

print(relax_packet(4, inf))
print(relax_packet(inf, inf))`,
        output: '4\ninf',
        explanation:
          'An unreachable predecessor cannot improve 4. When both are unreachable, the total stays unreachable.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `inf = float("inf")
def relax_packet(current, previous):
    return min(current, previous + 1)

print(relax_packet(inf, 0), relax_packet(5, inf))`,
          ['inf 5', '1 inf', '1 5', '0 5'],
          2,
          'A reachable total 0 proposes 1 packet. An unreachable predecessor proposes infinity, so 5 stays.',
        ),
        predictOutput(
          'What does this program print?',
          `inf = float("inf")
dp = [0, inf, inf, inf, inf]
dp[3] = min(dp[3], dp[0] + 1)
dp[4] = min(dp[4], dp[1] + 1)
print(dp[3], dp[4])`,
          ['1 inf', '1 2', '1 1', 'inf inf'],
          0,
          'dp[0] is reachable, so total 3 gets 1 packet. dp[1] is unreachable, so total 4 stays infinity.',
        ),
        choose(
          'A buggy table stores -1 for unreachable totals instead of infinity. What does relaxing from such a predecessor propose?',
          [
            'Infinity',
            'Nothing, because -1 is skipped',
            'An error',
            '0 packets, a false free answer',
          ],
          3,
          '-1 + 1 is 0, which beats every real packet count.',
        ),
        predictOutput(
          'What does this program print?',
          `inf = float("inf")
best = inf
for previous in [inf, inf, 2]:
    best = min(best, previous + 1)
print(best)`,
          ['inf', '2', '3', '1'],
          2,
          'The two unreachable predecessors propose infinity; the reachable one proposes 3.',
        ),
      ],
    },
  ],

  'cp-dp-dependency-order': [
    {
      title: 'Fill totals in increasing order',
      explanation: [
        'Every transition for total t reads t - s for a positive size s, which is a smaller total. Filling totals from 0 upward guarantees each predecessor is already final when it is read.',
        'Filling in the wrong order reads entries that are still at their starting values, so correct answers never propagate. Sizes of zero would make dp[t] depend on itself, which is why sizes must be positive.',
      ],
      example: {
        code: `def one_four_table(target):
    dp = [0] * (target + 1)
    for total in range(1, target + 1):
        dp[total] = dp[total - 1] + 1
        if total >= 4:
            dp[total] = min(dp[total], dp[total - 4] + 1)
    return dp

print(one_four_table(8))`,
        output: '[0, 1, 2, 3, 1, 2, 3, 4, 2]',
        explanation:
          'Each total reads totals 1 and 4 smaller, which were filled earlier in the loop. Total 8 uses two size-4 packets.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `def one_two_table(target):
    dp = [0] * (target + 1)
    for total in range(1, target + 1):
        dp[total] = dp[total - 1] + 1
        if total >= 2:
            dp[total] = min(dp[total], dp[total - 2] + 1)
    return dp

print(one_two_table(5))`,
          [
            '[0, 1, 2, 3, 4, 5]',
            '[0, 1, 1, 2, 2, 3]',
            '[0, 1, 1, 1, 1, 1]',
            '[1, 1, 2, 2, 3, 3]',
          ],
          1,
          'Using as many 2s as possible, totals 0 through 5 need 0, 1, 1, 2, 2, and 3 packets.',
        ),
        predictOutput(
          'This loop fills totals from high to low. What does it print?',
          `dp = [0] + [float("inf")] * 4
for total in range(4, 0, -1):
    dp[total] = dp[total - 1] + 1
print(dp)`,
          [
            '[0, 1, 2, 3, 4]',
            '[0, inf, inf, inf, inf]',
            '[0, 1, inf, inf, inf]',
            '[0, 4, 3, 2, 1]',
          ],
          2,
          'Totals 4, 3, and 2 read predecessors that are still infinity; only total 1 reads the finished dp[0].',
        ),
        choose(
          'When dp[9] is computed with sizes 2 and 5, which entries must already be final?',
          [
            'dp[11] and dp[14]',
            'dp[7] and dp[4]',
            'dp[2] and dp[5]',
            'dp[8] only',
          ],
          1,
          'The last packet is 2 or 5, so the predecessors are 9 - 2 = 7 and 9 - 5 = 4.',
        ),
        choose(
          'Why are packet sizes of zero excluded?',
          [
            'Zero cannot be stored in a list',
            'Zero-size packets make every total unreachable',
            'range cannot start at zero',
            'dp[t] would depend on dp[t], which is not final yet',
          ],
          3,
          'A size-0 transition reads the same total it is computing, so increasing order no longer guarantees a finished predecessor.',
        ),
      ],
    },
    {
      title: 'Guard predecessors that fall below zero',
      explanation: [
        'A packet of size s can end at total t only when t >= s. Without that check, t - s is negative, and Python reads dp[-1] or dp[-2] from the end of the list instead of raising an error.',
        'Those silent wrap-around reads use unrelated totals and produce wrong answers, so every transition checks its size before reading.',
      ],
      example: {
        code: `dp = [0, 1, 2]
total = 2
print(dp[total - 3])
print(total >= 3)`,
        output: '2\nFalse',
        explanation:
          'dp[-1] is the last entry, not an error. The guard is False, so the size-3 transition must be skipped at total 2.',
      },
      questions: [
        predictOutput(
          'This loop has no size guard. What does it print?',
          `dp = [0] * 4
for total in range(1, 4):
    dp[total] = min(dp[total - 1], dp[total - 3]) + 1
print(dp)`,
          [
            '[0, 1, 2, 1]',
            '[0, 1, 1, 1]',
            '[0, 1, 2, 3]',
            'An IndexError is raised',
          ],
          1,
          'At totals 1 and 2, dp[-2] and dp[-1] wrap around to entries that are still 0.',
        ),
        predictOutput(
          'What does this program print?',
          `dp = [0] * 4
for total in range(1, 4):
    dp[total] = dp[total - 1] + 1
    if total >= 3:
        dp[total] = min(dp[total], dp[total - 3] + 1)
print(dp)`,
          ['[0, 1, 1, 1]', '[0, 1, 2, 3]', '[0, 1, 2, 1]', '[0, 1, 1, 2]'],
          2,
          'Totals 1 and 2 use only size 1. Total 3 can use one size-3 packet.',
        ),
        choose(
          'Total is 2 and the packet size is 5. What should the transition do?',
          [
            'Read dp[-3]',
            'Skip it, since 2 - 5 is negative',
            'Set dp[2] to 0',
            'Set dp[2] to infinity permanently',
          ],
          1,
          'A size-5 packet cannot end at total 2, so this size contributes no candidate.',
        ),
        predictOutput(
          'What does this program print?',
          `dp = [0, 1, 2, 1]
total = 2
size = 3
if total >= size:
    print(dp[total - size] + 1)
else:
    print("skip")`,
          ['2', '1', 'skip', '3'],
          2,
          'The guard 2 >= 3 is False, so the program prints skip instead of reading dp[-1].',
        ),
      ],
    },
  ],

  'cp-tabulation': [
    {
      title: 'Try every packet size at every total',
      explanation: [
        'For each total t, the last packet has some size s <= t. The best count with that last packet is dp[t - s] + 1, so dp[t] is the minimum of those candidates over all fitting sizes.',
        'An inner loop over the sizes performs one relaxation per size. Because totals are filled in increasing order, every dp[t - s] it reads is final.',
      ],
      example: {
        code: `def packet_table(sizes, target):
    dp = [float("inf")] * (target + 1)
    dp[0] = 0
    for total in range(1, target + 1):
        for size in sizes:
            if size <= total:
                dp[total] = min(dp[total], dp[total - size] + 1)
    return dp

print(packet_table([2, 5], 9))`,
        output: '[0, inf, 1, inf, 2, 1, 3, 2, 4, 3]',
        explanation:
          'Odd totals below 5 stay unreachable. Total 7 is 5 + 2 (two packets), and total 9 is 5 + 2 + 2 (three packets).',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `def packet_table(sizes, target):
    dp = [float("inf")] * (target + 1)
    dp[0] = 0
    for total in range(1, target + 1):
        for size in sizes:
            if size <= total:
                dp[total] = min(dp[total], dp[total - size] + 1)
    return dp

print(packet_table([3, 4], 8))`,
          [
            '[0, inf, inf, 1, 1, 2, 2, 2, 2]',
            '[0, inf, inf, 1, 1, inf, 2, 2, 2]',
            '[0, 1, 2, 1, 1, 2, 2, 2, 2]',
            '[0, inf, inf, 1, 1, inf, 2, 2, 3]',
          ],
          1,
          'Total 5 cannot be made from 3s and 4s. Totals 6, 7, and 8 are 3+3, 3+4, and 4+4.',
        ),
        predictOutput(
          'What does this program print?',
          `def min_packets(sizes, target):
    dp = [float("inf")] * (target + 1)
    dp[0] = 0
    for total in range(1, target + 1):
        for size in sizes:
            if size <= total:
                dp[total] = min(dp[total], dp[total - size] + 1)
    return -1 if dp[target] == float("inf") else dp[target]

print(min_packets([1, 4, 5], 8))`,
          ['4', '3', '2', '1'],
          2,
          'Two size-4 packets make 8. Starting with 5 would need 5 + 1 + 1 + 1, four packets.',
        ),
        choose(
          'Sizes are [1, 3, 4] and dp[5] = 2, dp[3] = 1, dp[2] = 2. What is dp[6]?',
          ['3', '1', '4', '2'],
          3,
          'The candidates are dp[5] + 1 = 3, dp[3] + 1 = 2, and dp[2] + 1 = 3; the minimum is 2.',
        ),
        choose(
          'What does the inner loop over sizes compute for one total t?',
          [
            'The sum of dp[t - s] over all sizes',
            'The best last packet: the minimum of dp[t - s] + 1 over fitting sizes s',
            'The largest size that fits in t',
            'Whether t is divisible by every size',
          ],
          1,
          'Each fitting size proposes one candidate count, and min keeps the best.',
        ),
      ],
    },
    {
      title: 'Report an unreachable target as -1 at the end',
      explanation: [
        'Some targets cannot be made from the given sizes, so their entries stay infinity. Convert that to the contract’s -1 only after the whole table is filled.',
        'Writing -1 inside the table would make it look like a cheap predecessor: -1 + 1 = 0 would beat every real count. The edge cases follow from the table: target 0 needs 0 packets, and an empty size list reaches only 0.',
      ],
      example: {
        code: `def min_packets(sizes, target):
    dp = [float("inf")] * (target + 1)
    dp[0] = 0
    for total in range(1, target + 1):
        for size in sizes:
            if size <= total:
                dp[total] = min(dp[total], dp[total - size] + 1)
    return -1 if dp[target] == float("inf") else dp[target]

print(min_packets([4, 6], 9))
print(min_packets([], 0))`,
        output: '-1\n0',
        explanation:
          'Sums of 4s and 6s are even, so 9 stays infinity and becomes -1. Target 0 needs no packets even with no sizes.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `def min_packets(sizes, target):
    dp = [float("inf")] * (target + 1)
    dp[0] = 0
    for total in range(1, target + 1):
        for size in sizes:
            if size <= total:
                dp[total] = min(dp[total], dp[total - size] + 1)
    return -1 if dp[target] == float("inf") else dp[target]

print(min_packets([6, 10], 14), min_packets([6, 10], 16))`,
          ['2 2', '-1 -1', 'inf 2', '-1 2'],
          3,
          '14 is not a sum of 6s and 10s, while 16 = 6 + 10.',
        ),
        predictOutput(
          'What does this program print?',
          `def min_packets(sizes, target):
    dp = [float("inf")] * (target + 1)
    dp[0] = 0
    for total in range(1, target + 1):
        for size in sizes:
            if size <= total:
                dp[total] = min(dp[total], dp[total - size] + 1)
    return -1 if dp[target] == float("inf") else dp[target]

print(min_packets([], 0), min_packets([], 3))`,
          ['0 -1', '-1 -1', '0 0', '1 -1'],
          0,
          'Total 0 is reachable with zero packets; with no sizes, nothing else is.',
        ),
        choose(
          'Why convert infinity to -1 only after the table is complete?',
          [
            'Python cannot print infinity',
            'Infinity is slower to compare',
            '-1 inside the table would look like a cheap predecessor during relaxation',
            '-1 is reserved for dp[0]',
          ],
          2,
          'A predecessor of -1 proposes -1 + 1 = 0 packets, which beats every real answer.',
        ),
        predictOutput(
          'This table writes -1 for unreachable totals from the start. What does it print?',
          `dp = [0, -1, -1, -1]
for total in range(1, 4):
    for size in [2]:
        if size <= total:
            dp[total] = min(dp[total], dp[total - size] + 1)
print(dp)`,
          [
            '[0, -1, 1, -1]',
            '[0, -1, -1, -1]',
            '[0, -1, 1, 0]',
            '[0, 1, 1, 2]',
          ],
          1,
          'min(-1, 1) keeps -1 at total 2, so the real one-packet answer is lost.',
        ),
      ],
    },
    {
      title: 'Count the table’s work and see where largest-first fails',
      explanation: [
        'With m sizes and target T, the table performs at most m relaxations for each of T totals: O(mT) time and O(T) storage. The work grows linearly with the target.',
        'The table considers every last packet, so it finds optima that a largest-packet-first rule misses. With sizes [1, 3, 4] and target 6, largest-first uses 4 + 1 + 1, while the table finds 3 + 3.',
      ],
      example: {
        code: `def largest_first(sizes_desc, target):
    count = 0
    for size in sizes_desc:
        while target >= size:
            target -= size
            count += 1
    return count

def min_packets(sizes, target):
    dp = [float("inf")] * (target + 1)
    dp[0] = 0
    for total in range(1, target + 1):
        for size in sizes:
            if size <= total:
                dp[total] = min(dp[total], dp[total - size] + 1)
    return -1 if dp[target] == float("inf") else dp[target]

print(largest_first([4, 3, 1], 6))
print(min_packets([4, 3, 1], 6))`,
        output: '3\n2',
        explanation:
          'Taking 4 first leaves 2, which needs two 1s. The table also tries 3 as the last packet and finds 3 + 3.',
      },
      questions: [
        choose(
          'sizes has m entries and target is T. At most how many relaxations does the table perform?',
          ['About m + T', 'About T²', 'About m × T', 'About 2^m'],
          2,
          'Each of the T totals tries each of the m sizes once.',
        ),
        predictOutput(
          'What does this program print?',
          `def largest_first(sizes_desc, target):
    count = 0
    for size in sizes_desc:
        while target >= size:
            target -= size
            count += 1
    return count

def min_packets(sizes, target):
    dp = [float("inf")] * (target + 1)
    dp[0] = 0
    for total in range(1, target + 1):
        for size in sizes:
            if size <= total:
                dp[total] = min(dp[total], dp[total - size] + 1)
    return -1 if dp[target] == float("inf") else dp[target]

print(largest_first([6, 5, 1], 10), min_packets([6, 5, 1], 10))`,
          ['2 2', '5 5', '2 5', '5 2'],
          3,
          'Largest-first takes 6 and then four 1s. The table finds 5 + 5.',
        ),
        choose(
          'Which input makes largest-first miss the optimum while the table finds it?',
          [
            'Sizes [1, 2, 4], target 6',
            'Sizes [1, 5, 10], target 20',
            'Sizes [1, 3, 4], target 6',
            'Sizes [2], target 6',
          ],
          2,
          'Largest-first gives 4 + 1 + 1, but 3 + 3 uses only two packets. The other inputs are solved optimally by largest-first.',
        ),
        choose(
          'With the same 5 sizes, the target grows from 1,000 to 1,000,000. How does the table’s running time change?',
          [
            'About 1,000 times longer',
            'About the same',
            'About 1,000,000 times longer',
            'About 10 times longer',
          ],
          0,
          'Time is O(mT); with m fixed, multiplying T by 1,000 multiplies the work by about 1,000.',
        ),
      ],
    },
  ],

  'cp-knapsack-capacity-state': [
    {
      title: 'Read dp[c] as the best value within capacity c',
      explanation: [
        'In 0/1 knapsack, dp[c] is the greatest value of a selection whose total weight is at most c. The selection does not have to fill the capacity; some space may stay unused.',
        'Because any selection that fits capacity c also fits every larger capacity, the table never decreases as c grows.',
      ],
      example: {
        code: `# items (weight, value): (2, 5) and (3, 7)
best = [0, 0, 5, 7, 7, 12]
print(best[4], best[5])`,
        output: '7 12',
        explanation:
          'Both items weigh 5 together, so capacity 4 keeps the weight-3 item and leaves 1 unit unused. Capacity 5 holds both.',
      },
      questions: [
        choose(
          'With items (2, 5) and (3, 7), best[4] = 7. Which selection achieves it?',
          [
            'Both items, weighing exactly 4',
            'The weight-2 item twice',
            'The weight-3 item alone, leaving 1 unit unused',
            'No item; 7 is a capacity bonus',
          ],
          2,
          'Under "at most 4", unused space is allowed, and the weight-3 item is worth more than the weight-2 item.',
        ),
        choose(
          'Under the at-most meaning, how does best[6] compare with best[5]?',
          [
            'best[6] can be smaller than best[5]',
            'best[6] >= best[5]',
            'They are always equal',
            'best[6] is always best[5] + 1',
          ],
          1,
          'Any selection that fits within 5 also fits within 6, so the larger bound is never worse.',
        ),
        predictOutput(
          'One item has weight 4 and value 9. What at-most table does this build for capacities 0 through 6?',
          `capacities = [0, 1, 2, 3, 4, 5, 6]
best = []
for capacity in capacities:
    if capacity >= 4:
        best.append(9)
    else:
        best.append(0)
print(best)`,
          [
            '[0, 0, 0, 0, 9, 0, 0]',
            '[0, 0, 0, 0, 9, 18, 27]',
            '[9, 9, 9, 9, 9, 9, 9]',
            '[0, 0, 0, 0, 9, 9, 9]',
          ],
          3,
          'Every capacity of at least 4 can hold the item, leaving any extra space unused.',
        ),
        choose(
          'Capacity is 10 and the best selection weighs 8. Is it a valid answer for best[10]?',
          [
            'Yes, because "at most 10" allows unused space',
            'No, it must weigh exactly 10',
            'Only if no item weighs 2',
            'Only when all values are equal',
          ],
          0,
          'The state bounds the weight from above; it does not require filling the bag.',
        ),
      ],
    },
    {
      title: 'Start every capacity at zero',
      explanation: [
        'Choosing no items has weight 0, which fits under every capacity, and is worth 0. So before any item is considered, every entry of the table is 0.',
        'This differs from an exact-weight table, where only dp[0] is reachable at first and the other entries must be marked unreachable.',
      ],
      example: {
        code: `def capacity_values(capacity):
    return [0] * (capacity + 1)

print(capacity_values(4))
print(capacity_values(0))`,
        output: '[0, 0, 0, 0, 0]\n[0]',
        explanation:
          'Capacities 0 through 4 all start with the empty selection, worth 0. Capacity 0 still has one entry.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `def capacity_values(capacity):
    return [0] * (capacity + 1)

table = capacity_values(3)
print(len(table), table[3])`,
          ['3 0', '4 inf', '4 0', '3 inf'],
          2,
          'Capacities 0 through 3 need four entries, and each starts at 0.',
        ),
        choose(
          'Why is 0 a correct starting value for every capacity, while the minimum-packet table needed infinity?',
          [
            'Knapsack values can never exceed 0',
            'Infinity cannot be compared with values',
            'Every exact weight is already reachable',
            'Taking no items fits every capacity and is worth 0',
          ],
          3,
          'Under "at most c", the empty selection is feasible everywhere, so 0 is a real achievable value.',
        ),
        choose(
          'Which initialization would represent "best value with weight exactly c" instead?',
          [
            'dp[0] = 0 and every other entry marked unreachable',
            'Every entry 0',
            'Every entry equal to its capacity',
            'dp[0] unreachable and every other entry 0',
          ],
          0,
          'Before any item is chosen, only weight exactly 0 is achieved.',
        ),
        predictOutput(
          'What does this program print?',
          `def capacity_values(capacity):
    return [0] * (capacity + 1)

first = capacity_values(2)
first[2] = 5
second = capacity_values(2)
print(first, second)`,
          [
            '[0, 0, 5] [0, 0, 5]',
            '[0, 0, 5] [0, 0, 0]',
            '[0, 0, 0] [0, 0, 0]',
            '[5, 5, 5] [0, 0, 0]',
          ],
          1,
          'Each call builds a new list, so changing first does not affect second.',
        ),
      ],
    },
  ],

  'cp-knapsack-take-skip': [
    {
      title: 'Compare skipping an item with taking it once',
      explanation: [
        'For one item (weight, value) and capacity c, there are two choices. Skipping keeps previous[c]. Taking uses weight units, leaving c - weight for the earlier items, and is worth previous[c - weight] + value.',
        'The best value after deciding the item is the larger of the two.',
      ],
      example: {
        code: `def item_choice(previous, capacity, weight, value):
    if weight > capacity:
        return previous[capacity]
    return max(previous[capacity], previous[capacity - weight] + value)

print(item_choice([0, 0, 4, 4, 6], 4, 2, 3))`,
        output: '7',
        explanation:
          'Skipping gives 6. Taking leaves capacity 2, worth 4, plus the item’s 3, which is 7.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `def item_choice(previous, capacity, weight, value):
    if weight > capacity:
        return previous[capacity]
    return max(previous[capacity], previous[capacity - weight] + value)

print(item_choice([0, 3, 3, 6, 6], 4, 3, 5))`,
          ['6', '11', '8', '5'],
          2,
          'Taking leaves capacity 1, worth 3, plus 5 gives 8, which beats skipping at 6.',
        ),
        predictOutput(
          'What does this program print?',
          `def item_choice(previous, capacity, weight, value):
    if weight > capacity:
        return previous[capacity]
    return max(previous[capacity], previous[capacity - weight] + value)

print(item_choice([0, 4, 4, 8, 8], 4, 2, 3))`,
          ['7', '11', '3', '8'],
          3,
          'Taking gives previous[2] + 3 = 7, which loses to skipping at 8.',
        ),
        choose(
          'previous = [0, 0, 6, 6, 8, 8], capacity 5, and the item has weight 3 and value 4. What does taking the item propose?',
          ['12', '10', '8', '4'],
          1,
          'Taking reads previous[5 - 3] = 6 and adds 4. Adding to previous[5] would ignore the item’s weight.',
        ),
        choose(
          'An item (w, v) fits at capacity c. Which expression gives the best value after deciding it?',
          [
            'previous[c] + v',
            'max(previous[c], previous[c] + v)',
            'max(previous[c], previous[c - w] + v)',
            'previous[c - w] + previous[c]',
          ],
          2,
          'Skipping keeps previous[c]; taking leaves c - w units for earlier items and adds v.',
        ),
      ],
    },
    {
      title: 'Skip an item that does not fit, reading only the previous stage',
      explanation: [
        'If weight > capacity, the item cannot be taken, and the answer is previous[capacity]. Check this first: capacity - weight would be negative, and Python would silently read from the end of the list.',
        'Both choices read from the previous stage, the table before this item. Reading a table that already includes this item could count it twice.',
      ],
      example: {
        code: `def item_choice(previous, capacity, weight, value):
    if weight > capacity:
        return previous[capacity]
    return max(previous[capacity], previous[capacity - weight] + value)

print(item_choice([0, 2, 2, 5], 1, 3, 9))`,
        output: '2',
        explanation:
          'A weight-3 item cannot fit in capacity 1, so the value stays at previous[1] = 2.',
      },
      questions: [
        predictOutput(
          'This version has no fit check. What does it print?',
          `def unguarded(previous, capacity, weight, value):
    return max(previous[capacity], previous[capacity - weight] + value)

print(unguarded([0, 2, 2, 5], 1, 3, 9))`,
          ['2', '11', 'An IndexError is raised', '9'],
          1,
          'capacity - weight is -2, and previous[-2] is 2, so the impossible take is scored as 2 + 9.',
        ),
        predictOutput(
          'What does this program print?',
          `def item_choice(previous, capacity, weight, value):
    if weight > capacity:
        return previous[capacity]
    return max(previous[capacity], previous[capacity - weight] + value)

previous = [0, 1, 1, 4]
print(item_choice(previous, 1, 2, 3), item_choice(previous, 2, 2, 3), item_choice(previous, 3, 2, 3))`,
          ['7 3 4', '1 3 7', '4 4 4', '1 3 4'],
          3,
          'Capacity 1 cannot hold the item. Capacity 2 takes it for 3. At capacity 3, taking gives 1 + 3 = 4, tying the skip value 4.',
        ),
        choose(
          'Why must both alternatives read from the table before this item was considered?',
          [
            'The new table is always empty',
            'Reading an updated entry could count the same item twice',
            'Previous tables are sorted',
            'It makes the capacity larger',
          ],
          1,
          'An entry that already includes this item, plus the item again, would use it twice.',
        ),
        choose(
          'The item weighs 6 and the capacity is 4. What is the best value after deciding this item?',
          [
            '0, since the item is too heavy',
            'previous[4] + value',
            'previous[-2] + value',
            'previous[4], since the item cannot be taken',
          ],
          3,
          'An item that does not fit leaves the best value unchanged; it does not reset it.',
        ),
      ],
    },
  ],

  'cp-knapsack-descending-pass': [
    {
      title: 'Run capacities downward in one table',
      explanation: [
        'To decide one item inside a single table, visit capacities from high to low. When capacity c reads dp[c - weight], that smaller entry has not been updated yet in this pass, so it still describes the previous stage.',
        'Visiting capacities upward would read an entry that already includes this item and add the item again, allowing unlimited copies.',
      ],
      example: {
        code: `def apply_one_item(previous, weight, value):
    dp = previous[:]
    for capacity in range(len(dp) - 1, weight - 1, -1):
        dp[capacity] = max(dp[capacity], dp[capacity - weight] + value)
    return dp

print(apply_one_item([0, 0, 0, 0, 0, 0, 0], 3, 4))`,
        output: '[0, 0, 0, 4, 4, 4, 4]',
        explanation:
          'Capacity 6 reads dp[3] before dp[3] is updated, so even capacity 6 holds only one copy of the item.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `def apply_one_item(previous, weight, value):
    dp = previous[:]
    for capacity in range(len(dp) - 1, weight - 1, -1):
        dp[capacity] = max(dp[capacity], dp[capacity - weight] + value)
    return dp

print(apply_one_item([0, 0, 0, 0, 0, 0, 0], 2, 3))`,
          [
            '[0, 0, 3, 3, 6, 6, 9]',
            '[0, 0, 3, 3, 3, 3, 3]',
            '[0, 0, 3, 0, 0, 0, 0]',
            '[0, 0, 3, 6, 9, 12, 15]',
          ],
          1,
          'Every capacity from 2 up holds one copy, worth 3.',
        ),
        predictOutput(
          'This pass runs capacities upward. What does it print?',
          `dp = [0, 0, 0, 0, 0, 0, 0]
weight, value = 2, 3
for capacity in range(weight, len(dp)):
    dp[capacity] = max(dp[capacity], dp[capacity - weight] + value)
print(dp)`,
          [
            '[0, 0, 3, 3, 3, 3, 3]',
            '[0, 0, 3, 0, 0, 0, 0]',
            '[0, 0, 3, 3, 6, 6, 9]',
            '[0, 0, 3, 6, 9, 12, 15]',
          ],
          2,
          'Capacity 4 reads the already updated dp[2] and adds the item again; capacity 6 ends with three copies.',
        ),
        choose(
          'During a descending pass for weight 3, capacity 7 reads dp[4]. What does dp[4] still hold?',
          [
            'The value after this item was added',
            'The final answer',
            'The value before this item, since capacity 4 is updated later in the pass',
            'An undefined value',
          ],
          2,
          'Capacities are visited 7, 6, 5, 4, ..., so dp[4] has not been touched when capacity 7 reads it.',
        ),
        predictOutput(
          'What does this program print?',
          `def apply_one_item(previous, weight, value):
    dp = previous[:]
    for capacity in range(len(dp) - 1, weight - 1, -1):
        dp[capacity] = max(dp[capacity], dp[capacity - weight] + value)
    return dp

print(apply_one_item([0, 2, 2, 2, 2], 1, 5))`,
          [
            '[0, 5, 10, 15, 20]',
            '[0, 5, 7, 12, 17]',
            '[0, 2, 2, 2, 2]',
            '[0, 5, 7, 7, 7]',
          ],
          3,
          'Each capacity combines the earlier stage’s value 2 with one copy of the new item; an upward pass would stack copies.',
        ),
      ],
    },
    {
      title: 'Stop at the item weight and copy the stage',
      explanation: [
        'range(len(dp) - 1, weight - 1, -1) visits capacities from the largest down to weight itself. Capacities below the weight cannot hold the item, so they keep their values; an item heavier than every capacity leaves the table unchanged.',
        'previous[:] makes a separate list, so the caller’s previous stage is not modified. Assigning dp = previous would only give the same list a second name.',
      ],
      example: {
        code: `def apply_one_item(previous, weight, value):
    dp = previous[:]
    for capacity in range(len(dp) - 1, weight - 1, -1):
        dp[capacity] = max(dp[capacity], dp[capacity - weight] + value)
    return dp

old = [0, 0, 4, 4]
print(apply_one_item(old, 3, 6))
print(apply_one_item(old, 5, 9))
print(old)`,
        output: '[0, 0, 4, 6]\n[0, 0, 4, 4]\n[0, 0, 4, 4]',
        explanation:
          'The weight-3 item improves only capacity 3. The weight-5 item fits nowhere. old is unchanged because each call works on a copy.',
      },
      questions: [
        predictOutput(
          'Which capacities does the pass visit for weight 2 in a table of length 6?',
          `weight = 2
print(list(range(6 - 1, weight - 1, -1)))`,
          ['[5, 4, 3, 2, 1]', '[6, 5, 4, 3, 2]', '[5, 4, 3, 2]', '[5, 4, 3]'],
          2,
          'The stop value weight - 1 = 1 is excluded, so the last capacity visited is 2.',
        ),
        predictOutput(
          'This version does not copy. What does it print?',
          `def apply_in_place(previous, weight, value):
    dp = previous
    for capacity in range(len(dp) - 1, weight - 1, -1):
        dp[capacity] = max(dp[capacity], dp[capacity - weight] + value)
    return dp

old = [0, 0, 0]
new = apply_in_place(old, 1, 4)
print(old)`,
          ['[0, 0, 0]', '[0, 4, 8]', '[4, 4, 4]', '[0, 4, 4]'],
          3,
          'dp = previous names the same list, so the caller’s old stage is overwritten.',
        ),
        choose(
          'Why does the loop stop at capacity = weight instead of continuing down to 0?',
          [
            'Smaller capacities cannot hold the item, so they keep their values',
            'Capacity 0 is always the answer',
            'Python ranges cannot reach 0',
            'Smaller capacities must be reset to 0',
          ],
          0,
          'Below the weight, only skipping is possible, which leaves the entry unchanged.',
        ),
        predictOutput(
          'What does this program print?',
          `def apply_one_item(previous, weight, value):
    dp = previous[:]
    for capacity in range(len(dp) - 1, weight - 1, -1):
        dp[capacity] = max(dp[capacity], dp[capacity - weight] + value)
    return dp

print(apply_one_item([0, 3, 3], 4, 10))`,
          ['[0, 3, 13]', '[0, 3, 3]', '[10, 3, 3]', '[0, 13, 13]'],
          1,
          'range(2, 3, -1) is empty, so the weight-4 item changes nothing.',
        ),
      ],
    },
  ],

  'cp-knapsack': [
    {
      title: 'Decide the items one at a time',
      explanation: [
        'The knapsack table processes items in sequence. After the first k items have been processed, dp[c] is the best value using only those k items with total weight at most c.',
        'Each item applies one descending pass, so the final entry dp[capacity] considers every subset of all the items. The order of the items does not change that final optimum.',
      ],
      example: {
        code: `def best_value(items, capacity):
    dp = [0] * (capacity + 1)
    for weight, value in items:
        for limit in range(capacity, weight - 1, -1):
            dp[limit] = max(dp[limit], dp[limit - weight] + value)
        print(dp)
    return dp[capacity]

print(best_value([(2, 3), (3, 4)], 5))`,
        output: '[0, 0, 3, 3, 3, 3]\n[0, 0, 3, 4, 4, 7]\n7',
        explanation:
          'After the first item, every capacity of at least 2 is worth 3. The second item adds capacities 3 and 4 worth 4, and capacity 5 holds both items for 7.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `def best_value(items, capacity):
    dp = [0] * (capacity + 1)
    for weight, value in items:
        for limit in range(capacity, weight - 1, -1):
            dp[limit] = max(dp[limit], dp[limit - weight] + value)
    return dp[capacity]

print(best_value([(1, 2), (2, 3), (3, 5)], 4))`,
          ['10', '8', '5', '7'],
          3,
          'Weights 1 and 3 fit together for 2 + 5 = 7. All three items weigh 6, and weights 2 and 3 weigh 5.',
        ),
        predictOutput(
          'What does this program print?',
          `def best_table(items, capacity):
    dp = [0] * (capacity + 1)
    for weight, value in items:
        for limit in range(capacity, weight - 1, -1):
            dp[limit] = max(dp[limit], dp[limit - weight] + value)
    return dp

print(best_table([(3, 4), (1, 1), (2, 3)], 4))`,
          [
            '[0, 1, 3, 4, 5]',
            '[0, 1, 3, 4, 8]',
            '[0, 1, 1, 4, 5]',
            '[0, 1, 3, 4, 4]',
          ],
          0,
          'Capacity 3 holds weight 3 or weights 1 + 2, both worth 4. Capacity 4 holds weights 3 and 1 for 5.',
        ),
        choose(
          'After processing the first k items, what does dp[c] hold?',
          [
            'The best value using item k alone',
            'The best value using all items',
            'The best value using only the first k items, with weight at most c',
            'The total weight of the first k items',
          ],
          2,
          'Each pass adds one more item to the set of items the table may use.',
        ),
        choose(
          'Does the order of the items in the input change the final best value?',
          [
            'Yes, items must be sorted by weight',
            'No, every subset of the items is still considered',
            'Yes, items must be sorted by value',
            'Only when two items have equal weight',
          ],
          1,
          'Each item gets one take-or-skip decision regardless of its position, so the final table covers all subsets.',
        ),
      ],
    },
    {
      title: 'Use each item at most once',
      explanation: [
        'Because each pass runs capacities downward, dp[limit - weight] still belongs to the stage before the current item, so an item can be counted at most once.',
        'Equal pairs in the input are still different items. Two copies of (2, 5) can both be taken, while a single (2, 5) gives value 5 even when the capacity has room for two.',
      ],
      example: {
        code: `def best_value(items, capacity):
    dp = [0] * (capacity + 1)
    for weight, value in items:
        for limit in range(capacity, weight - 1, -1):
            dp[limit] = max(dp[limit], dp[limit - weight] + value)
    return dp[capacity]

print(best_value([(2, 5)], 4))
print(best_value([(2, 5), (2, 5)], 4))`,
        output: '5\n10',
        explanation:
          'One item cannot fill the second half of the capacity. Two distinct items with the same pair can.',
      },
      questions: [
        predictOutput(
          'This version runs capacities upward. What does it print?',
          `def best_value(items, capacity):
    dp = [0] * (capacity + 1)
    for weight, value in items:
        for limit in range(weight, capacity + 1):
            dp[limit] = max(dp[limit], dp[limit - weight] + value)
    return dp[capacity]

print(best_value([(3, 4)], 6))`,
          ['4', '0', '8', '12'],
          2,
          'Capacity 6 reads dp[3], which already contains this item, so the item is counted twice.',
        ),
        predictOutput(
          'What does this program print?',
          `def best_value(items, capacity):
    dp = [0] * (capacity + 1)
    for weight, value in items:
        for limit in range(capacity, weight - 1, -1):
            dp[limit] = max(dp[limit], dp[limit - weight] + value)
    return dp[capacity]

print(best_value([(3, 4), (3, 4)], 6))`,
          ['4', '12', '0', '8'],
          3,
          'The two equal pairs are separate items, and together they weigh exactly 6.',
        ),
        choose(
          'If the inner loop ran capacities upward, which problem would the table solve?',
          [
            'Each item at most once',
            'Unlimited copies of each item',
            'Exactly one item in total',
            'The lightest subset of items',
          ],
          1,
          'An upward pass reads entries that already include the current item, so the item can be stacked repeatedly.',
        ),
        predictOutput(
          'What does this program print?',
          `def best_value(items, capacity):
    dp = [0] * (capacity + 1)
    for weight, value in items:
        for limit in range(capacity, weight - 1, -1):
            dp[limit] = max(dp[limit], dp[limit - weight] + value)
    return dp[capacity]

print(best_value([(5, 10), (4, 7), (3, 5)], 7))`,
          ['10', '17', '12', '22'],
          2,
          'Weights 4 and 3 fit together for 12. Weights 5 and 4 would weigh 9, over the capacity.',
        ),
      ],
    },
    {
      title: 'Budget the table by capacity and handle empty cases',
      explanation: [
        'n items and capacity W cost O(nW) time and O(W) storage. That is fast when W is moderate, even if there are far too many subsets to try, but it depends on the numeric capacity, so huge weights make the table too large.',
        'Edge cases fall out of the table: no items or capacity 0 give 0, and an item heavier than the capacity is never taken.',
      ],
      example: {
        code: `def best_value(items, capacity):
    dp = [0] * (capacity + 1)
    for weight, value in items:
        for limit in range(capacity, weight - 1, -1):
            dp[limit] = max(dp[limit], dp[limit - weight] + value)
    return dp[capacity]

print(best_value([(9, 100), (3, 4)], 4))
print(best_value([], 8))
print(best_value([(1, 9)], 0))`,
        output: '4\n0\n0',
        explanation:
          'The weight-9 item never fits, so only the weight-3 item counts. No items, or no capacity, give the empty selection.',
      },
      questions: [
        choose(
          'There are 30 items and the capacity is 1,000,000. About how many table updates does the method perform?',
          [
            'About 1 million',
            'About 30',
            'About 2^30, roughly 1 billion',
            'About 30 million',
          ],
          3,
          'Each of the 30 items updates up to 1,000,000 capacities.',
        ),
        choose(
          'Which input makes this capacity table a poor choice?',
          [
            '1,000 items with capacity 1,000',
            '3 items with weights and capacity near 10^12',
            '20 items with capacity 50',
            'An empty item list',
          ],
          1,
          'The table needs one entry per capacity unit, so a capacity near 10^12 is far too large, even with only 3 items.',
        ),
        predictOutput(
          'What does this program print?',
          `def best_value(items, capacity):
    dp = [0] * (capacity + 1)
    for weight, value in items:
        for limit in range(capacity, weight - 1, -1):
            dp[limit] = max(dp[limit], dp[limit - weight] + value)
    return dp[capacity]

print(best_value([(7, 50), (2, 3)], 5))`,
          ['50', '53', '3', '0'],
          2,
          'The weight-7 item does not fit capacity 5, so only the value-3 item is taken.',
        ),
        predictOutput(
          'What does this program print?',
          `def best_value(items, capacity):
    dp = [0] * (capacity + 1)
    for weight, value in items:
        for limit in range(capacity, weight - 1, -1):
            dp[limit] = max(dp[limit], dp[limit - weight] + value)
    return dp[capacity]

print(best_value([(1, 9)], 0), best_value([], 0))`,
          ['0 0', '9 0', '0 9', '9 9'],
          0,
          'Capacity 0 holds nothing, so both calls return the empty selection’s value.',
        ),
      ],
    },
  ],

  'cp-subsequence-order': [
    {
      title: 'Keep the order but allow gaps',
      explanation: [
        'A subsequence takes elements in their original order and may skip elements between them. A subarray must be contiguous. So [5, 4] is a subsequence of [5, 1, 4] but not a subarray, and [4, 5] is neither.',
        'To test a candidate, scan the source once and advance a counter each time the next wanted element appears. The candidate is a subsequence when the counter reaches its length; the empty list always is.',
      ],
      example: {
        code: `def is_subsequence(wanted, source):
    matched = 0
    for value in source:
        if matched < len(wanted) and wanted[matched] == value:
            matched += 1
    return matched == len(wanted)

print(is_subsequence([3, 9], [3, 1, 9]))
print(is_subsequence([9, 3], [3, 1, 9]))`,
        output: 'True\nFalse',
        explanation:
          '3 then 9 appear in that order with a gap. In [9, 3], 9 never appears before a later 3.',
      },
      questions: [
        choose(
          'Which list is a subsequence of [5, 1, 4, 2] but not a subarray?',
          ['[1, 4]', '[4, 5]', '[5, 4]', '[2, 5]'],
          2,
          '5 and 4 appear in order with 1 between them. [1, 4] is contiguous, and the others reverse the order.',
        ),
        predictOutput(
          'What does this program print?',
          `def is_subsequence(wanted, source):
    matched = 0
    for value in source:
        if matched < len(wanted) and wanted[matched] == value:
            matched += 1
    return matched == len(wanted)

print(is_subsequence([1, 3], [3, 1, 2, 3]), is_subsequence([3, 1, 3], [3, 1, 2]))`,
          ['True False', 'False False', 'True True', 'False True'],
          0,
          'The first 3 is skipped while waiting for 1, then the last 3 matches. The second check never finds a final 3.',
        ),
        choose(
          'Is [] a subsequence of [7, 8]?',
          [
            'No, it has no matching values',
            'Only if the source is empty',
            'Yes, by selecting nothing',
            'Only after sorting',
          ],
          2,
          'Selecting no elements trivially preserves order; the match counter is already 0 = len([]).',
        ),
        predictOutput(
          'What does this program print?',
          `wanted = [2, 2, 5]
source = [2, 5, 2, 5]
matched = 0
for value in source:
    if matched < len(wanted) and wanted[matched] == value:
        matched += 1
print(matched)`,
          ['2', '1', '4', '3'],
          3,
          'The scan matches 2, skips the first 5, matches the second 2, then matches the final 5.',
        ),
      ],
    },
    {
      title: 'Use a separate source position for every selected element',
      explanation: [
        'Each wanted element needs its own position in the source, so [2, 2] needs two 2s. Matching each wanted element at its earliest possible position is safe: it leaves at least as many later positions for the rest.',
        'The check matched < len(wanted) stops the scan from reading past the end of wanted once every element is matched. The same scan works on strings.',
      ],
      example: {
        code: `def is_subsequence(wanted, source):
    matched = 0
    for value in source:
        if matched < len(wanted) and wanted[matched] == value:
            matched += 1
    return matched == len(wanted)

print(is_subsequence([4, 4], [4, 1]))
print(is_subsequence([4, 4], [4, 1, 4]))`,
        output: 'False\nTrue',
        explanation:
          'One 4 cannot be used twice. With a second 4 later in the source, both wanted elements are matched.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `def is_subsequence(wanted, source):
    matched = 0
    for value in source:
        if matched < len(wanted) and wanted[matched] == value:
            matched += 1
    return matched == len(wanted)

print(is_subsequence([7, 7, 7], [7, 3, 7]), is_subsequence([7, 7], [7, 3, 7]))`,
          ['True True', 'False True', 'False False', 'True False'],
          1,
          'The source has only two 7s, enough for [7, 7] but not [7, 7, 7].',
        ),
        choose(
          'Without the matched < len(wanted) check, what happens for wanted [1] and source [1, 1]?',
          [
            'It returns False',
            'It matches 1 twice and returns True',
            'After the first match it reads wanted[1] and raises IndexError',
            'Nothing changes',
          ],
          2,
          'Once matched is 1, the next comparison reads wanted[1], which does not exist.',
        ),
        choose(
          'Why is it safe to match each wanted element at its earliest possible source position?',
          [
            'Later positions are never needed',
            'An earlier match leaves at least as many later positions for the rest',
            'It sorts the source',
            'It lets one position match twice',
          ],
          1,
          'Any match found later could be swapped for the earlier one without blocking the remaining elements.',
        ),
        predictOutput(
          'What does this program print?',
          `def is_subsequence(wanted, source):
    matched = 0
    for value in source:
        if matched < len(wanted) and wanted[matched] == value:
            matched += 1
    return matched == len(wanted)

print(is_subsequence("aa", "banana"), is_subsequence("aaa", "banana"), is_subsequence("aaaa", "banana"))`,
          [
            'True False False',
            'True True True',
            'False False False',
            'True True False',
          ],
          3,
          'banana has three a characters at separate positions, enough for "aaa" but not "aaaa".',
        ),
      ],
    },
  ],

  'cp-lis-tail-position': [
    {
      title: 'Find the first tail that is not smaller',
      explanation: [
        'The tails list is sorted. For a new value, bisect_left(tails, value) returns the first index whose entry is greater than or equal to value. Every entry before that index is strictly smaller.',
        'If every entry is smaller, the result is len(tails), the position just past the end: the value can extend the longest length found so far.',
      ],
      example: {
        code: `from bisect import bisect_left

tails = [1, 4, 4, 9]
print(bisect_left(tails, 4))
print(bisect_left(tails, 5))
print(bisect_left(tails, 12))`,
        output: '1\n3\n4',
        explanation:
          '4 is found at its first occurrence. 5 lands before 9. 12 is larger than every tail, so the result is len(tails).',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `from bisect import bisect_left

print(bisect_left([2, 6, 6, 8], 6), bisect_left([2, 6, 6, 8], 7))`,
          ['2 3', '1 2', '1 3', '3 3'],
          2,
          'The first entry >= 6 is at index 1; the first entry >= 7 is the 8 at index 3.',
        ),
        predictOutput(
          'What does this program print?',
          `from bisect import bisect_left

print(bisect_left([3, 5, 8], 1), bisect_left([3, 5, 8], 9))`,
          ['-1 3', '0 3', '0 2', '-1 2'],
          1,
          'Every tail is >= 1, so the answer is 0. No tail is >= 9, so the answer is len(tails) = 3.',
        ),
        choose(
          'tails = [2, 5, 8] and the new value is 5. Why does bisect_left return 1 rather than 2?',
          [
            'bisect_left always returns a smaller index',
            'Index 2 is out of range',
            'Equal values are skipped entirely',
            'A 5 cannot follow an equal 5 in a strictly increasing subsequence',
          ],
          3,
          'Only tails strictly below the value can be extended, so the search stops at the equal tail.',
        ),
        choose(
          'bisect_left([1, 3, 6], 10) returns 3. What does that tell the tails update?',
          [
            'Every tail is smaller, so 10 extends the longest length',
            '10 replaces tails[3]',
            '10 is a duplicate',
            '10 should be discarded',
          ],
          0,
          'An index equal to len(tails) means no tail is >= 10, so 10 starts a new, longer length.',
        ),
      ],
    },
    {
      title: 'Choose the search that matches strictness',
      explanation: [
        'bisect_left stops at the first entry >= value, so an equal value lands on the equal tail. This keeps the subsequence strictly increasing: equal values never extend each other.',
        'bisect_right stops at the first entry > value, after any equal entries. It suits non-decreasing subsequences, where an equal value may follow.',
      ],
      example: {
        code: `from bisect import bisect_left, bisect_right

tails = [1, 3, 3, 7]
print(bisect_left(tails, 3), bisect_right(tails, 3))`,
        output: '1 3',
        explanation:
          'bisect_left stops before the equal 3s; bisect_right stops after them.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `from bisect import bisect_left, bisect_right

tails = [4, 4, 4]
print(bisect_left(tails, 4), bisect_right(tails, 4))`,
          ['3 0', '0 0', '0 3', '1 3'],
          2,
          'Every entry equals 4, so the left search stops at the start and the right search at the end.',
        ),
        choose(
          'Which search lets equal values extend a non-decreasing subsequence?',
          [
            'bisect_left',
            'list.index',
            'A search for the first smaller tail',
            'bisect_right',
          ],
          3,
          'bisect_right skips past equal tails, so an equal value can be placed after them.',
        ),
        predictOutput(
          'What does this program print?',
          `from bisect import bisect_left

tails = [2, 5, 9]
positions = []
for value in [1, 5, 6, 10]:
    positions.append(bisect_left(tails, value))
print(positions)`,
          ['[0, 2, 2, 3]', '[0, 1, 2, 3]', '[-1, 1, 2, 3]', '[0, 1, 1, 2]'],
          1,
          '1 is below every tail, 5 matches index 1, 6 lands before 9, and 10 is past the end.',
        ),
        choose(
          'For a strictly increasing subsequence, 5 arrives and tails = [1, 5, 7]. Which position does bisect_left choose?',
          [
            'Index 2, replacing 7',
            'Index 1, the equal 5',
            'Index 3, appending',
            'Index 0, replacing 1',
          ],
          1,
          'The first tail >= 5 is the existing 5; replacing it with an equal value changes nothing.',
        ),
      ],
    },
  ],

  'cp-lis-tail-update': [
    {
      title: 'Replace one tail or append a new length',
      explanation: [
        'tails[k] is the smallest ending value found so far for an increasing subsequence of length k + 1. A new value replaces the first tail >= it, lowering that ending, or is appended when every tail is smaller.',
        'Lower endings are better: a subsequence ending in 6 can be extended by 7, while one ending in 9 cannot. Each update changes exactly one entry or adds one.',
      ],
      example: {
        code: `from bisect import bisect_left

def update_tails(tails, value):
    result = tails[:]
    position = bisect_left(result, value)
    if position == len(result):
        result.append(value)
    else:
        result[position] = value
    return result

print(update_tails([1, 4, 8], 5))
print(update_tails([1, 4, 8], 9))`,
        output: '[1, 4, 5]\n[1, 4, 8, 9]',
        explanation:
          '5 gives length 3 a lower ending than 8. 9 is larger than every tail, so it creates length 4.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `from bisect import bisect_left

def update_tails(tails, value):
    result = tails[:]
    position = bisect_left(result, value)
    if position == len(result):
        result.append(value)
    else:
        result[position] = value
    return result

print(update_tails([3, 6, 9], 7))`,
          ['[3, 6, 7, 9]', '[3, 6, 9, 7]', '[3, 7, 9]', '[3, 6, 7]'],
          3,
          '7 replaces the first tail >= 7, which is 9; the length stays 3.',
        ),
        predictOutput(
          'What does this program print?',
          `from bisect import bisect_left

def update_tails(tails, value):
    result = tails[:]
    position = bisect_left(result, value)
    if position == len(result):
        result.append(value)
    else:
        result[position] = value
    return result

tails = []
for value in [5, 1, 6]:
    tails = update_tails(tails, value)
    print(tails)`,
          [
            '[5]\n[1, 5]\n[1, 5, 6]',
            '[5]\n[1]\n[1, 6]',
            '[5]\n[5, 1]\n[5, 1, 6]',
            '[5]\n[5]\n[5, 6]',
          ],
          1,
          '1 replaces 5 as the best length-1 ending, and 6 extends it to length 2.',
        ),
        choose(
          'Why replace a tail with a smaller value instead of keeping the old one?',
          [
            'It shortens the subsequence',
            'It keeps the list unsorted',
            'A smaller ending can be extended by more future values',
            'It removes duplicates from the input',
          ],
          2,
          'Every value that can follow the old ending can also follow the smaller one, and possibly more.',
        ),
        predictOutput(
          'What does this program print?',
          `from bisect import bisect_left

def update_tails(tails, value):
    result = tails[:]
    position = bisect_left(result, value)
    if position == len(result):
        result.append(value)
    else:
        result[position] = value
    return result

print(update_tails([2, 5, 9], 2))`,
          ['[2, 5, 9]', '[2, 2, 5, 9]', '[2, 5, 9, 2]', '[2, 2, 9]'],
          0,
          'The equal 2 is found at index 0 and replaced by itself, so the tails do not change.',
        ),
      ],
    },
    {
      title: 'Read the tails as best endings, not one subsequence',
      explanation: [
        'Different entries of tails can come from different subsequences. After [5, 6, 1], tails is [1, 6]: the 1 ends a length-1 subsequence and the 6 ends the length-2 subsequence 5, 6. The pair 1, 6 itself is not in order in the input.',
        'The length of tails is still correct, which is all the length algorithm needs. Update a copy so the caller’s list stays unchanged.',
      ],
      example: {
        code: `from bisect import bisect_left

def update_tails(tails, value):
    result = tails[:]
    position = bisect_left(result, value)
    if position == len(result):
        result.append(value)
    else:
        result[position] = value
    return result

tails = []
for value in [5, 6, 1]:
    tails = update_tails(tails, value)
print(tails, len(tails))`,
        output: '[1, 6] 2',
        explanation:
          'The length 2 is right (5, 6), even though 1 comes after 6 in the input.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `from bisect import bisect_left

def update_tails(tails, value):
    result = tails[:]
    position = bisect_left(result, value)
    if position == len(result):
        result.append(value)
    else:
        result[position] = value
    return result

tails = []
for value in [4, 8, 2]:
    tails = update_tails(tails, value)
print(tails)`,
          ['[4, 8]', '[2, 8]', '[2, 4, 8]', '[2]'],
          1,
          '2 replaces 4 as the best length-1 ending; 8 still ends the length-2 subsequence 4, 8.',
        ),
        choose(
          'After processing [4, 8, 2], tails = [2, 8]. Is 2, 8 an increasing subsequence of the input?',
          [
            'Yes, because tails always lists one real subsequence',
            'No, so the length must be 1',
            'Yes, because tails is sorted',
            'No, 2 comes after 8, but the length 2 is still correct',
          ],
          3,
          'Each entry is the best ending for its own length; together they need not form one subsequence.',
        ),
        predictOutput(
          'What does this program print?',
          `from bisect import bisect_left

def update_tails(tails, value):
    result = tails[:]
    position = bisect_left(result, value)
    if position == len(result):
        result.append(value)
    else:
        result[position] = value
    return result

old = [1, 5, 9]
new = update_tails(old, 3)
print(old, new)`,
          [
            '[1, 3, 9] [1, 3, 9]',
            '[1, 5, 9] [1, 3, 5, 9]',
            '[1, 5, 9] [1, 3, 9]',
            '[1, 5, 9] [1, 5, 9]',
          ],
          2,
          'tails[:] copies the list, so only new changes; 3 replaces 5.',
        ),
        choose(
          'The input so far is [5, 6, 2] and tails = [2, 6]. Then 7 arrives and is appended. What does that guarantee?',
          [
            'Some increasing subsequence of length 3 exists in the input so far',
            '2, 6, 7 appears in that order in the input',
            'Length 2 is no longer possible',
            '7 replaced 6',
          ],
          0,
          '7 extends the subsequence that ends in 6, which is 5, 6, 7; the 2 is not part of it.',
        ),
      ],
    },
  ],

  'cp-subsequences': [
    {
      title: 'Trace tails through a whole list',
      explanation: [
        'Start with an empty tails list. For each value in order, bisect_left finds the first tail >= value; replace it, or append when the search returns len(tails). The final length of tails is the length of a longest strictly increasing subsequence.',
        'The list stays sorted after every update, which is what makes the binary search valid.',
      ],
      example: {
        code: `from bisect import bisect_left

def final_tails(values):
    tails = []
    for value in values:
        position = bisect_left(tails, value)
        if position == len(tails):
            tails.append(value)
        else:
            tails[position] = value
    return tails

tails = final_tails([3, 1, 4, 1, 5, 9, 2])
print(tails, len(tails))`,
        output: '[1, 2, 5, 9] 4',
        explanation:
          'For example 1, 4, 5, 9 has length 4. The late 2 only lowers the length-2 ending.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
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

print(increasing_length([6, 2, 8, 3, 4, 1]))`,
          ['2', '4', '3', '6'],
          2,
          '2, 3, 4 is strictly increasing. The final 1 replaces 2 without adding a length.',
        ),
        predictOutput(
          'What does this program print?',
          `from bisect import bisect_left

def final_tails(values):
    tails = []
    for value in values:
        position = bisect_left(tails, value)
        if position == len(tails):
            tails.append(value)
        else:
            tails[position] = value
    return tails

print(final_tails([5, 7, 6, 8, 6]))`,
          ['[5, 6, 6, 8]', '[5, 7, 8]', '[5, 6, 8, 6]', '[5, 6, 8]'],
          3,
          '6 lowers the length-2 ending from 7; the last 6 lands on the equal tail and changes nothing.',
        ),
        choose(
          'After 1, 2, 3 the tails are [1, 2, 3]. Then 0 arrives. What happens?',
          [
            '0 replaces 1, and the length stays 3',
            '0 is appended, and the length becomes 4',
            'The tails reset to [0]',
            '0 is ignored',
          ],
          0,
          'The first tail >= 0 is 1, so 0 becomes the best length-1 ending.',
        ),
        predictOutput(
          'What does this program print?',
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

print(increasing_length([9, 1, 8, 2, 7, 3]))`,
          ['2', '3', '6', '4'],
          1,
          '1, 2, 3 is the longest strictly increasing choice; each larger value lands before an earlier one.',
        ),
      ],
    },
    {
      title: 'Keep the subsequence strict with bisect_left',
      explanation: [
        'Strictly increasing means each next value is greater, so equal values cannot extend each other. bisect_left places an equal value on the equal tail, which keeps the length unchanged.',
        'Switching to bisect_right lets an equal value land after equal tails, which computes the longest non-decreasing subsequence instead. Check which one the problem asks for.',
      ],
      example: {
        code: `from bisect import bisect_left, bisect_right

def longest(values, search):
    tails = []
    for value in values:
        position = search(tails, value)
        if position == len(tails):
            tails.append(value)
        else:
            tails[position] = value
    return len(tails)

print(longest([4, 4, 4], bisect_left))
print(longest([4, 4, 4], bisect_right))`,
        output: '1\n3',
        explanation:
          'Strictly, equal 4s give only one element. Non-decreasing, all three 4s can be used.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
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

print(increasing_length([2, 2, 3, 3, 4]))`,
          ['5', '2', '4', '3'],
          3,
          'Strictly increasing allows only one of each value: 2, 3, 4.',
        ),
        predictOutput(
          'This version uses bisect_right. What does it print?',
          `from bisect import bisect_right

def length(values):
    tails = []
    for value in values:
        position = bisect_right(tails, value)
        if position == len(tails):
            tails.append(value)
        else:
            tails[position] = value
    return len(tails)

print(length([2, 2, 3, 3, 4]))`,
          ['3', '5', '4', '2'],
          1,
          'bisect_right lets equal values extend, so the whole non-decreasing list counts.',
        ),
        choose(
          'Which input gives different answers for the bisect_left and bisect_right versions?',
          ['[1, 2, 3]', '[3, 2, 1]', '[1, 1, 2]', '[]'],
          2,
          'Strictly, [1, 1, 2] gives 2; non-decreasing, it gives 3. The other inputs have no equal values to disagree on.',
        ),
        predictOutput(
          'What does this program print?',
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

print(increasing_length([5, 5, 5, 5]), increasing_length([5, 6, 5, 6]))`,
          ['1 2', '4 4', '1 4', '4 2'],
          0,
          'Equal values never extend each other, so four 5s give 1, and 5, 6, 5, 6 gives 2.',
        ),
      ],
    },
    {
      title: 'Know the cost and the boundary inputs',
      explanation: [
        'Each value costs one binary search over at most n tails, so the method takes O(n log n) time and O(n) storage. Trying every earlier position for every value, the direct approach, takes O(n²).',
        'Boundary inputs follow from the updates: an empty list gives 0, a strictly decreasing list gives 1 because every value replaces the single tail, and negative values work like any others.',
      ],
      example: {
        code: `from bisect import bisect_left

def increasing_length(values):
    tails = []
    for value in values:
        position = bisect_left(tails, value)
        if position == len(tails):
            tails.append(value)
        else:
            tails[position] = value
    return len(tails)

print(increasing_length([]))
print(increasing_length([9, 7, 4, 2]))
print(increasing_length([-5, -2, -3, 0]))`,
        output: '0\n1\n3',
        explanation:
          'No values give no tails. Each smaller value replaces the only tail. -5, -3, 0 is a strictly increasing choice.',
      },
      questions: [
        choose(
          'The input has 200,000 values. Why prefer tails with binary search over checking every earlier position?',
          [
            'It uses less than O(n) memory',
            'About 3.5 million steps instead of n² = 40 billion',
            'It also returns the subsequence itself',
            'Checking earlier positions cannot handle duplicates',
          ],
          1,
          'n log n is about 200,000 × 18, while n² is 4 × 10^10.',
        ),
        predictOutput(
          'What does this program print?',
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

print(increasing_length([]), increasing_length([8, 6, 3]))`,
          ['0 3', '1 1', '0 0', '0 1'],
          3,
          'An empty list has no tails. In a decreasing list each value replaces the single tail.',
        ),
        predictOutput(
          'What does this program print?',
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

print(increasing_length([-3, -1, -2, 0]))`,
          ['4', '3', '2', '1'],
          1,
          '-3, -1, 0 and -3, -2, 0 both have length 3; -1 and -2 cannot both be used.',
        ),
        choose(
          'What does len(tails) equal after the whole input is processed?',
          [
            'The number of distinct values',
            'The largest value in the input',
            'The length of a longest strictly increasing subsequence',
            'The number of replacements performed',
          ],
          2,
          'Appends happen exactly when a longer increasing subsequence becomes possible, so the length tracks the optimum.',
        ),
      ],
    },
  ],
};

export const knowledgePoints: KnowledgePointModule = {
  ...dynamic,
};
