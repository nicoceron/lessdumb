import { choose, predictOutput, type KnowledgePointModule } from './authoring';

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

const strategy: KnowledgePointModule = {
  'cp-interval-overlap': [
    {
      title: 'Test overlap with the larger start and the smaller end',
      explanation: [
        'Two half-open intervals [a, b) and [c, d) share the region from the later start to the earlier end: [max(a, c), min(b, d)). They overlap exactly when that region is nonempty, which is max(a, c) < min(b, d).',
        'This one test covers partial overlap, containment, and disjoint intervals in either order, so there is no need for separate cases.',
      ],
      example: {
        code: `def intervals_overlap(first, second):
    return max(first[0], second[0]) < min(first[1], second[1])

print(intervals_overlap((1, 5), (3, 8)))
print(max(1, 3), min(5, 8))`,
        output: 'True\n3 5',
        explanation:
          'The shared region runs from the later start 3 to the earlier end 5, and 3 < 5, so it is nonempty.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `def intervals_overlap(first, second):
    return max(first[0], second[0]) < min(first[1], second[1])

print(intervals_overlap((2, 6), (6, 9)), intervals_overlap((2, 7), (6, 9)))`,
          ['True True', 'False False', 'True False', 'False True'],
          3,
          'The first pair shares no point: 6 < 6 is False. The second shares [6, 7).',
        ),
        predictOutput(
          'What does this program print?',
          `def intervals_overlap(first, second):
    return max(first[0], second[0]) < min(first[1], second[1])

print(intervals_overlap((0, 10), (3, 4)), intervals_overlap((5, 6), (1, 2)))`,
          ['True False', 'False False', 'True True', 'False True'],
          0,
          'A contained interval overlaps its container. The second pair is disjoint even though it is listed in reverse order.',
        ),
        choose(
          'Two half-open intervals [a, b) and [c, d) overlap. Which region do they share?',
          [
            '[min(a, c), max(b, d))',
            '[max(a, c), min(b, d))',
            '[a, d)',
            '[c, b)',
          ],
          1,
          'A shared point must be after both starts and before both ends.',
        ),
        choose(
          'A program reports overlap whenever first.end > second.start. Which pair does it report wrongly?',
          [
            '(1, 4) and (3, 6)',
            '(1, 4) and (4, 6)',
            '(2, 9) and (3, 4)',
            '(5, 8) and (1, 3)',
          ],
          3,
          '8 > 1 is true, but (1, 3) ends before (5, 8) starts. Checking one end against one start ignores the other order.',
        ),
      ],
    },
    {
      title: 'Match the comparison to the endpoint convention',
      explanation: [
        'A half-open interval [a, b) excludes its end, so [1, 4) and [4, 6) touch without sharing a point; the test uses a strict <. Closed intervals [a, b] include both ends, so [1, 4] and [4, 6] share the point 4, and the test becomes <=.',
        'Decide which convention the problem uses before writing the comparison; the formula is otherwise the same.',
      ],
      example: {
        code: `def half_open_overlap(first, second):
    return max(first[0], second[0]) < min(first[1], second[1])

def closed_overlap(first, second):
    return max(first[0], second[0]) <= min(first[1], second[1])

print(half_open_overlap((1, 4), (4, 6)))
print(closed_overlap((1, 4), (4, 6)))`,
        output: 'False\nTrue',
        explanation:
          'The shared region would start and end at 4. A half-open region [4, 4) is empty, while a closed region [4, 4] contains 4.',
      },
      questions: [
        choose(
          'Meeting bookings are half-open: [9, 10) and [10, 11). Do they conflict?',
          [
            'Yes, both contain 10',
            'Yes, because they touch',
            'No, the first ends as the second starts',
            'Only if they are sorted',
          ],
          2,
          'The first booking excludes 10, so no moment belongs to both.',
        ),
        predictOutput(
          'What does this program print?',
          `def closed_overlap(first, second):
    return max(first[0], second[0]) <= min(first[1], second[1])

print(closed_overlap((3, 5), (5, 7)), closed_overlap((3, 5), (6, 7)))`,
          ['False False', 'True False', 'True True', 'False True'],
          1,
          'Closed intervals [3, 5] and [5, 7] share 5. [3, 5] and [6, 7] leave a gap.',
        ),
        choose(
          'Which points do the closed intervals [2, 5] and [5, 8] share?',
          ['None', 'All of [2, 8]', 'Only the point 5', 'The interval [5, 8)'],
          2,
          'Both closed intervals include 5, and no other point lies in both.',
        ),
        predictOutput(
          'What does this program print?',
          `def half_open_overlap(first, second):
    return max(first[0], second[0]) < min(first[1], second[1])

results = []
for first, second in [((-5, -1), (-3, 2)), ((-5, -3), (-3, 0)), ((0, 1), (0, 1))]:
    results.append(half_open_overlap(first, second))
print(results)`,
          [
            '[True, True, True]',
            '[False, False, True]',
            '[True, False, False]',
            '[True, False, True]',
          ],
          3,
          'Negative endpoints behave like any others. The middle pair only touches at -3; identical intervals overlap.',
        ),
      ],
    },
  ],

  'cp-interval-start-order': [
    {
      title: 'Sort intervals by start before scanning',
      explanation: [
        'A left-to-right scan needs every later interval to start no earlier than the current one. sorted(intervals) orders tuples by their first field, the start, which provides that guarantee.',
        'Arrival order gives no such promise: an interval that arrives last may start first and connect spans that were already passed.',
      ],
      example: {
        code: `intervals = [(4, 9), (1, 3), (2, 8)]
print(sorted(intervals))`,
        output: '[(1, 3), (2, 8), (4, 9)]',
        explanation:
          'Tuples compare by their first field first, so the intervals come out in increasing start order.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `print(sorted([(6, 7), (2, 9), (4, 5)]))`,
          [
            '[(4, 5), (6, 7), (2, 9)]',
            '[(2, 9), (4, 5), (6, 7)]',
            '[(6, 7), (2, 9), (4, 5)]',
            '[(2, 9), (6, 7), (4, 5)]',
          ],
          1,
          'Sorting tuples compares starts first: 2, 4, then 6. Sorting by end would give a different order.',
        ),
        choose(
          'After sorting by start, what is guaranteed about the interval that follows (3, 8)?',
          [
            'Its start is at least 8',
            'Its end is at least 8',
            'Its start is at least 3',
            'It overlaps (3, 8)',
          ],
          2,
          'Sorting orders starts only; the next interval may still begin before or after 8.',
        ),
        choose(
          'Why sort before merging instead of scanning in arrival order?',
          [
            'Sorting removes overlaps',
            'A later-arriving interval may start earlier and connect spans already passed',
            'Arrival order is always reversed',
            'Merging requires unique starts',
          ],
          1,
          'Without sorted starts, the scan cannot know that no future interval reaches back before the current span.',
        ),
        predictOutput(
          'What does this program print?',
          `print(sorted([(5, 6), (1, 2), (0, 10)]))`,
          [
            '[(1, 2), (5, 6), (0, 10)]',
            '[(5, 6), (1, 2), (0, 10)]',
            '[(0, 10), (5, 6), (1, 2)]',
            '[(0, 10), (1, 2), (5, 6)]',
          ],
          3,
          'The long interval starts at 0, so it comes first even though it ends last.',
        ),
      ],
    },
    {
      title: 'Break start ties by end and keep the input intact',
      explanation: [
        'When two starts are equal, tuple comparison moves on to the second field, so equal starts are ordered by end. Duplicates are kept: sorting reorders, it never removes.',
        'sorted returns a new list and leaves the original unchanged. list.sort() sorts in place and returns None, so its result must not be used as the sorted list.',
      ],
      example: {
        code: `intervals = [(2, 5), (1, 4), (2, 3), (1, 4)]
ordered = sorted(intervals)
print(ordered)
print(intervals)`,
        output:
          '[(1, 4), (1, 4), (2, 3), (2, 5)]\n[(2, 5), (1, 4), (2, 3), (1, 4)]',
        explanation:
          'Equal starts are ordered by end, both copies of (1, 4) remain, and the original list keeps its order.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `print(sorted([(3, 9), (3, 4), (3, 6)]))`,
          [
            '[(3, 9), (3, 4), (3, 6)]',
            '[(3, 9), (3, 6), (3, 4)]',
            '[(3, 4), (3, 6), (3, 9)]',
            '[(3, 4)]',
          ],
          2,
          'All starts are equal, so the ends decide the order.',
        ),
        predictOutput(
          'What does this program print?',
          `intervals = [(4, 7), (1, 5)]
result = intervals.sort()
print(result, intervals)`,
          [
            '[(1, 5), (4, 7)] [(4, 7), (1, 5)]',
            'None [(1, 5), (4, 7)]',
            '[(1, 5), (4, 7)] [(1, 5), (4, 7)]',
            'None [(4, 7), (1, 5)]',
          ],
          1,
          'list.sort() reorders the list itself and returns None.',
        ),
        choose(
          'Two bookings are both (2, 3). What should the ordering step do with them?',
          [
            'Keep only one, since they are equal',
            'Merge them into (2, 6)',
            'Raise an error',
            'Keep both; sorting never removes items',
          ],
          3,
          'Deciding what duplicates mean is the merge step’s job; sorting only reorders.',
        ),
        choose(
          'Which call sorts intervals by start and then by end?',
          [
            'sorted(intervals), since tuples compare start, then end',
            'sorted(intervals, key=lambda iv: iv[1])',
            'sorted(intervals, key=lambda iv: iv[0] + iv[1])',
            'sorted(intervals, reverse=True)',
          ],
          0,
          'Tuple comparison is already lexicographic. Sorting by end or by a sum loses the start order.',
        ),
      ],
    },
  ],

  'cp-interval-merge-step': [
    {
      title: 'Merge when the next start reaches the current end',
      explanation: [
        'With intervals sorted by start, compare the next interval with the current covered region. If next_start <= current_end, no gap separates them, so their union is one interval; otherwise a gap begins and the next interval stays separate.',
        'Touching half-open regions such as [1, 4) and [4, 8) do not overlap, but their union [1, 8) is still one continuous interval, which is why the union test uses <= rather than <.',
      ],
      example: {
        code: `def merge_next(current, following):
    if following[0] <= current[1]:
        return [(current[0], max(current[1], following[1]))]
    return [current, following]

print(merge_next((2, 5), (5, 9)))
print(merge_next((2, 5), (6, 9)))`,
        output: '[(2, 9)]\n[(2, 5), (6, 9)]',
        explanation:
          'The first pair touches at 5, so the union is one span. The second pair leaves the gap [5, 6).',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `def merge_next(current, following):
    if following[0] <= current[1]:
        return [(current[0], max(current[1], following[1]))]
    return [current, following]

print(merge_next((1, 6), (3, 8)))
print(merge_next((1, 6), (7, 8)))`,
          [
            '[(1, 8)]\n[(1, 8)]',
            '[(1, 6), (3, 8)]\n[(1, 6), (7, 8)]',
            '[(1, 8)]\n[(1, 6), (7, 8)]',
            '[(3, 6)]\n[(1, 6), (7, 8)]',
          ],
          2,
          '3 <= 6 joins the first pair into (1, 8). 7 > 6 leaves a gap, so the second pair stays separate.',
        ),
        choose(
          'The current region is [4, 7) and the next is [7, 10). Should a union merge join them?',
          [
            'No, they do not intersect',
            'Yes, into [4, 10), since no gap separates them',
            'Yes, into [4, 7)',
            'No, starts must differ by more than 1',
          ],
          1,
          'Every point from 4 up to 10 is covered by one of them, so the union is the single span [4, 10).',
        ),
        choose(
          'Why does a union merge use next_start <= current_end while an overlap test uses <?',
          [
            'Union and overlap are the same test',
            '<= is faster than <',
            'Half-open intervals include their end',
            'Touching spans share no point, but their union has no gap',
          ],
          3,
          'Overlap asks for a shared point; union asks only whether the covered region is continuous.',
        ),
        predictOutput(
          'What does this program print?',
          `def merge_next(current, following):
    if following[0] <= current[1]:
        return [(current[0], max(current[1], following[1]))]
    return [current, following]

print(merge_next((-4, -2), (-1, 3)))`,
          ['[(-4, -2), (-1, 3)]', '[(-4, 3)]', '[(-2, -1)]', '[(-1, 3)]'],
          0,
          '-1 > -2, so the gap [-2, -1) keeps the intervals separate.',
        ),
      ],
    },
    {
      title: 'Keep the larger end when one interval contains the next',
      explanation: [
        'The next interval may end before the current one, as with [1, 9) and [3, 5). Its end must not replace the current end; the merged end is max(current_end, next_end).',
        'The merged start can stay current_start, because sorting guarantees the next interval starts no earlier.',
      ],
      example: {
        code: `def merge_next(current, following):
    if following[0] <= current[1]:
        return [(current[0], max(current[1], following[1]))]
    return [current, following]

print(merge_next((1, 9), (3, 5)))`,
        output: '[(1, 9)]',
        explanation: '[3, 5) lies inside [1, 9), so the union is still [1, 9).',
      },
      questions: [
        predictOutput(
          'This version takes the end of the following interval. What does it print?',
          `def merge_next(current, following):
    if following[0] <= current[1]:
        return [(current[0], following[1])]
    return [current, following]

print(merge_next((0, 10), (2, 4)))`,
          ['[(0, 10)]', '[(0, 4)]', '[(2, 4)]', '[(0, 10), (2, 4)]'],
          1,
          'Replacing the end with 4 drops the covered region [4, 10).',
        ),
        predictOutput(
          'What does this program print?',
          `def merge_next(current, following):
    if following[0] <= current[1]:
        return [(current[0], max(current[1], following[1]))]
    return [current, following]

print(merge_next((0, 10), (2, 4)))`,
          ['[(0, 4)]', '[(2, 4)]', '[(0, 10), (2, 4)]', '[(0, 10)]'],
          3,
          'max keeps the longer reach 10, so the contained interval adds nothing.',
        ),
        choose(
          'The current region is [2, 12) and the next is [5, 7). What is the merged region?',
          ['[2, 7)', '[5, 12)', '[2, 12)', '[5, 7)'],
          2,
          'The start stays 2 and the end is max(12, 7) = 12.',
        ),
        choose(
          'Why can the merged region keep current_start without comparing starts?',
          [
            'Sorting guarantees the next start is no earlier',
            'Starts are always zero',
            'The next interval is always shorter',
            'max already compared the starts',
          ],
          0,
          'Intervals are processed in increasing start order, so current_start is the smaller start.',
        ),
      ],
    },
  ],

  'cp-intervals': [
    {
      title: 'Scan sorted intervals with one open span',
      explanation: [
        'Sort the bookings by start and keep a merged list. For each booking, if its start is <= the end of the last merged span, extend that span to the larger end; otherwise append the booking as a new span.',
        'Only the last span can still grow. Every earlier span ends before the last span starts, and all later bookings start even later, so earlier spans are final.',
      ],
      example: {
        code: `def merge_bookings(bookings):
    merged = []
    for start, end in sorted(bookings):
        if merged and start <= merged[-1][1]:
            merged[-1] = (merged[-1][0], max(merged[-1][1], end))
        else:
            merged.append((start, end))
        print(merged)
    return merged

merge_bookings([(5, 7), (1, 3), (2, 4), (8, 9)])`,
        output:
          '[(1, 3)]\n[(1, 4)]\n[(1, 4), (5, 7)]\n[(1, 4), (5, 7), (8, 9)]',
        explanation:
          '(2, 4) extends (1, 3). (5, 7) starts after 4, so it opens a new span, and (8, 9) does the same.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `def merge_bookings(bookings):
    merged = []
    for start, end in sorted(bookings):
        if merged and start <= merged[-1][1]:
            merged[-1] = (merged[-1][0], max(merged[-1][1], end))
        else:
            merged.append((start, end))
    return merged

print(merge_bookings([(4, 6), (1, 2), (5, 9), (2, 3)]))`,
          [
            '[(1, 3), (4, 9)]',
            '[(1, 2), (2, 3), (4, 9)]',
            '[(1, 9)]',
            '[(1, 3), (4, 6), (5, 9)]',
          ],
          0,
          '(1, 2) and (2, 3) touch, giving (1, 3). (4, 6) starts after 3, and (5, 9) extends it to (4, 9).',
        ),
        predictOutput(
          'What does this program print?',
          `def merge_bookings(bookings):
    merged = []
    for start, end in sorted(bookings):
        if merged and start <= merged[-1][1]:
            merged[-1] = (merged[-1][0], max(merged[-1][1], end))
        else:
            merged.append((start, end))
    return merged

print(merge_bookings([(10, 12), (0, 1), (3, 5)]))`,
          [
            '[(10, 12), (0, 1), (3, 5)]',
            '[(0, 12)]',
            '[(0, 1), (3, 5), (10, 12)]',
            '[(0, 5), (10, 12)]',
          ],
          2,
          'No booking reaches the next start, so the output is the three bookings in sorted order.',
        ),
        choose(
          'Mid-scan, merged = [(1, 4), (6, 9)] and the next sorted booking is (7, 12). What changes?',
          [
            'A new span (7, 12) is appended',
            'The first span becomes (1, 12)',
            'Nothing',
            'The last span becomes (6, 12)',
          ],
          3,
          '7 <= 9, so the last span extends to max(9, 12) = 12.',
        ),
        choose(
          'Why is each booking compared only with the last merged span?',
          [
            'Earlier spans end before the last span starts, and later bookings start no earlier',
            'Earlier spans are deleted after each step',
            'The last span is always the longest',
            'Python lists only allow access to [-1]',
          ],
          0,
          'A sorted booking that cannot reach the last span cannot reach any earlier, already-closed span.',
        ),
      ],
    },
    {
      title: 'Handle touching, nested, and duplicate bookings',
      explanation: [
        'Three cases break naive merges. Touching bookings such as [1, 3) and [3, 5) join because the test is <=. A nested booking inside the current span must not shrink it, which max prevents. Duplicate bookings simply extend a span to the end it already has.',
        'If a problem wants touching spans kept apart, change <= to <; the rest of the scan is unchanged.',
      ],
      example: {
        code: `def merge_bookings(bookings):
    merged = []
    for start, end in sorted(bookings):
        if merged and start <= merged[-1][1]:
            merged[-1] = (merged[-1][0], max(merged[-1][1], end))
        else:
            merged.append((start, end))
    return merged

print(merge_bookings([(1, 3), (3, 5)]))
print(merge_bookings([(2, 10), (4, 6)]))`,
        output: '[(1, 5)]\n[(2, 10)]',
        explanation:
          'The touching bookings form one occupied span. The nested booking leaves the containing span unchanged.',
      },
      questions: [
        predictOutput(
          'This version uses < instead of <=. What does it print?',
          `def merge_strict(bookings):
    merged = []
    for start, end in sorted(bookings):
        if merged and start < merged[-1][1]:
            merged[-1] = (merged[-1][0], max(merged[-1][1], end))
        else:
            merged.append((start, end))
    return merged

print(merge_strict([(1, 3), (3, 5)]))`,
          ['[(1, 5)]', '[(1, 3), (3, 5)]', '[(3, 5)]', '[(1, 3)]'],
          1,
          '3 < 3 is False, so the touching booking starts a separate span.',
        ),
        predictOutput(
          'This version replaces the end instead of taking max. What does it print?',
          `def merge_bookings(bookings):
    merged = []
    for start, end in sorted(bookings):
        if merged and start <= merged[-1][1]:
            merged[-1] = (merged[-1][0], end)
        else:
            merged.append((start, end))
    return merged

print(merge_bookings([(2, 10), (4, 6), (8, 12)]))`,
          ['[(2, 12)]', '[(2, 10), (8, 12)]', '[(2, 6)]', '[(2, 6), (8, 12)]'],
          3,
          'The nested (4, 6) shrinks the span to end at 6, so (8, 12) no longer looks connected.',
        ),
        predictOutput(
          'What does this program print?',
          `def merge_bookings(bookings):
    merged = []
    for start, end in sorted(bookings):
        if merged and start <= merged[-1][1]:
            merged[-1] = (merged[-1][0], max(merged[-1][1], end))
        else:
            merged.append((start, end))
    return merged

print(merge_bookings([(3, 6), (3, 6), (0, 1)]))`,
          [
            '[(0, 1), (3, 6)]',
            '[(0, 1), (3, 6), (3, 6)]',
            '[(0, 6)]',
            '[(0, 1), (3, 12)]',
          ],
          0,
          'The duplicate starts inside the open span and extends it to max(6, 6) = 6.',
        ),
        choose(
          'When should the scan keep touching spans such as [1, 3) and [3, 5) separate?',
          [
            'Never; touching spans must always merge',
            'Only when the input is unsorted',
            'When the required output keeps touching spans apart; then use < instead of <=',
            'Only when endpoints are negative',
          ],
          2,
          'Whether touching spans merge is a choice about the output representation, controlled by the comparison.',
        ),
      ],
    },
    {
      title: 'Account for sorting and the input contract',
      explanation: [
        'Sorting n bookings costs O(n log n) and the scan costs O(n), so sorting dominates. The merged list uses O(n) space.',
        'sorted(bookings) leaves the caller’s list unchanged, while bookings.sort() would reorder it. Skipping the sort breaks correctness, and an empty input returns an empty list without special handling.',
      ],
      example: {
        code: `def merge_bookings(bookings):
    merged = []
    for start, end in sorted(bookings):
        if merged and start <= merged[-1][1]:
            merged[-1] = (merged[-1][0], max(merged[-1][1], end))
        else:
            merged.append((start, end))
    return merged

bookings = [(6, 8), (1, 2)]
print(merge_bookings(bookings))
print(bookings)
print(merge_bookings([]))`,
        output: '[(1, 2), (6, 8)]\n[(6, 8), (1, 2)]\n[]',
        explanation:
          'The result is sorted, the caller’s list keeps its order, and an empty input never enters the loop.',
      },
      questions: [
        choose(
          'Merging n bookings: which step dominates the running time?',
          [
            'The scan, at O(n²)',
            'Appending spans, at O(n²)',
            'Taking max, at O(log n)',
            'Sorting, at O(n log n)',
          ],
          3,
          'The scan touches each booking once; sorting costs the extra log factor.',
        ),
        predictOutput(
          'This version sorts the list in place. What does it print?',
          `def merge_in_place(bookings):
    bookings.sort()
    merged = []
    for start, end in bookings:
        if merged and start <= merged[-1][1]:
            merged[-1] = (merged[-1][0], max(merged[-1][1], end))
        else:
            merged.append((start, end))
    return merged

data = [(5, 6), (1, 2)]
merge_in_place(data)
print(data)`,
          ['[(5, 6), (1, 2)]', '[(1, 2), (5, 6)]', '[]', 'None'],
          1,
          'list.sort() reorders the caller’s list, so data changes even though only the result was wanted.',
        ),
        predictOutput(
          'What does this program print?',
          `def merge_bookings(bookings):
    merged = []
    for start, end in sorted(bookings):
        if merged and start <= merged[-1][1]:
            merged[-1] = (merged[-1][0], max(merged[-1][1], end))
        else:
            merged.append((start, end))
    return merged

print(merge_bookings([]), merge_bookings([(4, 9)]))`,
          ['[] [(4, 9)]', 'None [(4, 9)]', '[] []', '[(0, 0)] [(4, 9)]'],
          0,
          'An empty input leaves merged empty; a single booking is appended unchanged.',
        ),
        predictOutput(
          'This version forgets to sort. What does it print?',
          `def merge_unsorted(bookings):
    merged = []
    for start, end in bookings:
        if merged and start <= merged[-1][1]:
            merged[-1] = (merged[-1][0], max(merged[-1][1], end))
        else:
            merged.append((start, end))
    return merged

print(merge_unsorted([(5, 8), (1, 6)]))`,
          ['[(1, 8)]', '[(1, 6), (5, 8)]', '[(5, 8)]', '[(5, 8), (1, 6)]'],
          2,
          '(1, 6) passes the start test against (5, 8), but the span keeps start 5, losing the covered region [1, 5).',
        ),
      ],
    },
  ],

  'cp-greedy-finish-order': [
    {
      title: 'Consider the earliest-finishing activity first',
      explanation: [
        'To fit as many non-overlapping activities as possible, look at activities in order of finish time. An activity that ends earlier leaves at least as much time for everything after it.',
        'Start time is the wrong key: an activity that starts first may run so long that it blocks many short ones.',
      ],
      example: {
        code: `def finish_order(intervals):
    return sorted(intervals, key=lambda interval: (interval[1], interval[0]))

print(finish_order([(0, 9), (2, 4), (5, 7)]))`,
        output: '[(2, 4), (5, 7), (0, 9)]',
        explanation:
          'The long activity (0, 9) starts first but finishes last, so it is considered last.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `def finish_order(intervals):
    return sorted(intervals, key=lambda interval: (interval[1], interval[0]))

print(finish_order([(1, 8), (0, 3), (4, 6)]))`,
          [
            '[(0, 3), (1, 8), (4, 6)]',
            '[(1, 8), (4, 6), (0, 3)]',
            '[(0, 3), (4, 6), (1, 8)]',
            '[(4, 6), (0, 3), (1, 8)]',
          ],
          2,
          'The ends are 3, 6, and 8, so that is the order.',
        ),
        choose(
          'Activities (0, 10), (1, 3), (3, 5), and (6, 8) compete for one room. Which should be considered first to fit the most?',
          [
            '(0, 10), the earliest start',
            '(1, 3), the earliest finish',
            '(6, 8), the latest start',
            'Any of them; order does not matter',
          ],
          1,
          'Finishing at 3 leaves the most room; (0, 10) would block every other activity.',
        ),
        choose(
          'Sorting by start picks (0, 100) first from (0, 100), (1, 2), and (3, 4). How many activities does that schedule hold?',
          ['1', '2', '3', '0'],
          0,
          'Both short activities overlap (0, 100), so nothing else fits; earliest finish would fit 2.',
        ),
        predictOutput(
          'What does this program print?',
          `intervals = [(0, 100), (1, 2), (3, 4)]
print(sorted(intervals)[0], sorted(intervals, key=lambda iv: (iv[1], iv[0]))[0])`,
          [
            '(0, 100) (0, 100)',
            '(1, 2) (1, 2)',
            '(1, 2) (0, 100)',
            '(0, 100) (1, 2)',
          ],
          3,
          'Plain sorting puts the earliest start first; the finish key puts the earliest end first.',
        ),
      ],
    },
    {
      title: 'Break finish ties by start, deterministically',
      explanation: [
        'Several activities can end at the same time. The key (end, start) sorts by end and then by start, so the result does not depend on input order.',
        'With only the end as the key, ties keep their input order, because Python’s sort is stable. sorted returns a new list and keeps duplicates, leaving the caller’s list unchanged.',
      ],
      example: {
        code: `def finish_order(intervals):
    return sorted(intervals, key=lambda interval: (interval[1], interval[0]))

print(finish_order([(3, 5), (1, 5), (2, 4)]))`,
        output: '[(2, 4), (1, 5), (3, 5)]',
        explanation:
          '(2, 4) ends first. The two activities ending at 5 are ordered by start.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `print(sorted([(4, 6), (2, 6), (5, 6)], key=lambda iv: (iv[1], iv[0])))`,
          [
            '[(2, 6), (4, 6), (5, 6)]',
            '[(4, 6), (2, 6), (5, 6)]',
            '[(5, 6), (4, 6), (2, 6)]',
            '[(6, 2), (6, 4), (6, 5)]',
          ],
          0,
          'All ends are 6, so the starts decide the order.',
        ),
        predictOutput(
          'This key uses only the end. What does it print?',
          `print(sorted([(4, 6), (2, 6)], key=lambda iv: iv[1]))`,
          [
            '[(2, 6), (4, 6)]',
            '[(6, 4), (6, 2)]',
            '[(2, 6)]',
            '[(4, 6), (2, 6)]',
          ],
          3,
          'The keys tie, and a stable sort keeps tied items in their input order.',
        ),
        predictOutput(
          'What does this program print?',
          `sessions = [(5, 9), (0, 2)]
ordered = sorted(sessions, key=lambda s: (s[1], s[0]))
print(sessions[0], ordered[0])`,
          ['(0, 2) (0, 2)', '(5, 9) (0, 2)', '(5, 9) (5, 9)', '(0, 2) (5, 9)'],
          1,
          'sorted builds a new list, so sessions keeps its original first item.',
        ),
        choose(
          'How does the key (iv[1], iv[0]) order (4, 7) and (2, 7)?',
          [
            '(4, 7) first, because it appears first',
            'It drops one as a duplicate',
            'By start only',
            '(2, 7) first, because equal ends compare starts',
          ],
          3,
          'The first key fields tie at 7, so the second field, the start, decides.',
        ),
      ],
    },
  ],

  'cp-greedy-compatibility': [
    {
      title: 'Accept a candidate that starts at or after the last end',
      explanation: [
        'A schedule on one resource stays valid when each new activity starts at or after the end of the last accepted one. For half-open activities the test is start >= last_end.',
        'Equality is allowed: an activity [2, 6) excludes 6, so another can begin exactly at 6.',
      ],
      example: {
        code: `def compatible_starts(last_end, candidates):
    return [start >= last_end for start in candidates]

print(compatible_starts(6, [4, 6, 9]))`,
        output: '[False, True, True]',
        explanation:
          'A start of 4 would overlap the activity ending at 6; starts of 6 or later are compatible.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `def compatible_starts(last_end, candidates):
    return [start >= last_end for start in candidates]

print(compatible_starts(3, [3, 2, 7]))`,
          [
            '[False, False, True]',
            '[True, True, True]',
            '[True, False, True]',
            '[False, True, False]',
          ],
          2,
          'A start equal to the last end is compatible; 2 starts before it.',
        ),
        choose(
          'The last selected activity is [2, 6). Which candidate is compatible?',
          ['[5, 9)', '[6, 8)', '[1, 3)', '[4, 6)'],
          1,
          'Only [6, 8) starts at or after 6.',
        ),
        predictOutput(
          'What does this program print?',
          `def compatible_starts(last_end, candidates):
    return [start >= last_end for start in candidates]

print(compatible_starts(-5, [-1, -6, -5]))`,
          [
            '[False, True, True]',
            '[True, True, False]',
            '[False, False, True]',
            '[True, False, True]',
          ],
          3,
          'Negative times compare like any integers: -1 and -5 are >= -5, while -6 is not.',
        ),
        choose(
          'Why is a candidate starting exactly at last_end compatible for half-open activities?',
          [
            'Both activities include that moment',
            'Equal times are ignored',
            'The earlier activity excludes its end',
            'Only activities of equal length can touch',
          ],
          2,
          'The earlier activity stops just before last_end, so no moment is shared.',
        ),
      ],
    },
    {
      title: 'Separate feasibility from optimality',
      explanation: [
        'The compatibility test keeps a schedule valid, but it does not say which candidates to take. Accepting every compatible activity in input order gives different counts for different orders.',
        'Getting the maximum requires a justified order, such as earliest finish first. Starting last_end at negative infinity accepts the first candidate whatever its time.',
      ],
      example: {
        code: `def count_feasible(order):
    last_end = float("-inf")
    count = 0
    for start, end in order:
        if start >= last_end:
            count += 1
            last_end = end
    return count

print(count_feasible([(0, 9), (1, 3), (4, 6)]))
print(count_feasible([(1, 3), (4, 6), (0, 9)]))`,
        output: '1\n2',
        explanation:
          'Both schedules are valid, but taking the long activity first blocks the two short ones.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `def count_feasible(order):
    last_end = float("-inf")
    count = 0
    for start, end in order:
        if start >= last_end:
            count += 1
            last_end = end
    return count

print(count_feasible([(0, 5), (1, 2), (2, 3), (5, 6)]))`,
          ['4', '3', '1', '2'],
          3,
          '(0, 5) is accepted first, which rejects (1, 2) and (2, 3); only (5, 6) follows.',
        ),
        predictOutput(
          'What does this program print?',
          `def count_feasible(order):
    last_end = float("-inf")
    count = 0
    for start, end in order:
        if start >= last_end:
            count += 1
            last_end = end
    return count

print(count_feasible([(1, 2), (2, 3), (0, 5), (5, 6)]))`,
          ['3', '2', '4', '1'],
          0,
          'The two short activities are accepted, (0, 5) is rejected, and (5, 6) fits after 3.',
        ),
        choose(
          'Every selected activity passed the start >= last_end check. What does that guarantee?',
          [
            'The schedule has the maximum possible size',
            'The activities are sorted by length',
            'The schedule has no overlaps',
            'Every activity was selected',
          ],
          2,
          'The check prevents overlaps; it says nothing about whether a larger schedule exists.',
        ),
        choose(
          'A rule scans candidates in input order and keeps every compatible one. What is missing to make it optimal?',
          [
            'A stricter compatibility test using >',
            'A justified selection order, such as earliest finish first',
            'Removing activities with negative times',
            'Nothing; feasibility implies optimality',
          ],
          1,
          'The same check yields different counts in different orders, so the order needs its own justification.',
        ),
      ],
    },
  ],

  'cp-greedy-exchange-boundary': [
    {
      title: 'An earlier finish keeps every later start feasible',
      explanation: [
        'Suppose an optimal schedule begins with an activity ending at old_end, and the greedy choice ends at greedy_end <= old_end. Every later activity in that schedule starts at or after old_end, so it also starts at or after greedy_end.',
        'Swapping in the greedy choice therefore keeps the rest of the schedule valid and the same size. If greedy_end were later than old_end, some later activity could stop fitting.',
      ],
      example: {
        code: `def exchange_preserves(greedy_end, old_end, later_starts):
    return all(start < old_end or start >= greedy_end for start in later_starts)

print(exchange_preserves(4, 6, [6, 8]))
print(exchange_preserves(7, 6, [6, 8]))`,
        output: 'True\nFalse',
        explanation:
          'Ending at 4 instead of 6 keeps both later starts valid. Ending at 7 breaks the activity that starts at 6.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `def exchange_preserves(greedy_end, old_end, later_starts):
    return all(start < old_end or start >= greedy_end for start in later_starts)

print(exchange_preserves(2, 5, [5, 7, 1]), exchange_preserves(6, 5, [5]))`,
          ['True True', 'False False', 'True False', 'False True'],
          2,
          'Ending at 2 keeps starts 5 and 7 valid. Ending at 6 breaks the start at 5.',
        ),
        choose(
          'An optimal schedule is [0, 7) then [7, 9). Greedy picks [1, 4) first instead. Is [7, 9) still feasible after [1, 4)?',
          [
            'No, because [1, 4) starts later',
            'Yes, because 7 >= 4',
            'No, because 7 < 7 is false',
            'Only if [1, 4) is longer',
          ],
          1,
          'The greedy activity ends at 4, before 7, so the second activity still fits.',
        ),
        choose(
          'Replacing a first activity that ends at old_end with one ending at new_end is always safe when...',
          [
            'new_end > old_end',
            'the new activity starts earlier',
            'both activities have equal length',
            'new_end <= old_end',
          ],
          3,
          'Only an end that is no later guarantees that every later start remains valid.',
        ),
        predictOutput(
          'The replacement ends later than the original. What does this program print?',
          `greedy_end, old_end = 9, 7
later = [7, 8, 9, 12]
print([start >= greedy_end for start in later if start >= old_end])`,
          [
            '[True, True, True, True]',
            '[False, False, True, True]',
            '[False, True, True, True]',
            '[True, True, False, False]',
          ],
          1,
          'Starts 7 and 8 fit after the old end but not after 9, so a later end can break continuations.',
        ),
      ],
    },
    {
      title: 'Write the implication as not old, or new',
      explanation: [
        'The exchange claim is: if a start was feasible after the old end, it is feasible after the new end. "old implies new" is false only when old is True and new is False, so it equals (not old) or new.',
        'For a start, old is start >= old_end and new is start >= greedy_end, which gives start < old_end or start >= greedy_end. all(...) checks every start, and an empty list passes vacuously.',
      ],
      example: {
        code: `greedy_end, old_end = 3, 7
for start in [1, 5, 7]:
    old_ok = start >= old_end
    new_ok = start >= greedy_end
    print(start, old_ok, new_ok, (not old_ok) or new_ok)`,
        output: '1 False False True\n5 False True True\n7 True True True',
        explanation:
          'Starts 1 and 5 were not feasible after the old end, so they impose no requirement. Start 7 stays feasible.',
      },
      questions: [
        choose(
          'Which combination violates "old feasible implies new feasible"?',
          [
            'old False, new False',
            'old False, new True',
            'old True, new True',
            'old True, new False',
          ],
          3,
          'An implication fails only when its premise holds and its conclusion does not.',
        ),
        predictOutput(
          'What does this program print?',
          `def exchange_preserves(greedy_end, old_end, later_starts):
    return all(start < old_end or start >= greedy_end for start in later_starts)

print(exchange_preserves(4, 4, [1, 4, 9]), exchange_preserves(9, 2, []))`,
          ['True False', 'True True', 'False True', 'False False'],
          1,
          'Equal ends change nothing. With no later starts, all([]) is True.',
        ),
        predictOutput(
          'What does this program print?',
          `old_end, greedy_end = 6, 8
print([start < old_end or start >= greedy_end for start in [5, 6, 8]])`,
          [
            '[True, True, True]',
            '[False, False, True]',
            '[True, False, True]',
            '[True, False, False]',
          ],
          2,
          'Start 6 was feasible after 6 but not after 8, so its implication fails.',
        ),
        choose(
          'Why do starts below old_end not matter to the exchange?',
          [
            'They were not feasible after the original first activity anyway',
            'They are always feasible after the new one',
            'Sorting removes them',
            'They cannot overlap anything',
          ],
          0,
          'Such starts are not part of any continuation of the original schedule, so the premise is false.',
        ),
      ],
    },
  ],

  'cp-greedy': [
    {
      title: 'Select sessions by earliest finish',
      explanation: [
        'Sort sessions by end time. Walk through them and accept a session when its start is at least the end of the last accepted session. The accepted sessions never overlap.',
        'Each accepted session is the earliest-finishing session compatible with the ones before it, which is the local choice the exchange argument justifies.',
      ],
      example: {
        code: `def chosen_sessions(sessions):
    chosen = []
    for start, end in sorted(sessions, key=lambda session: session[1]):
        if not chosen or start >= chosen[-1][1]:
            chosen.append((start, end))
    return chosen

print(chosen_sessions([(0, 6), (1, 2), (3, 5), (2, 4), (5, 7)]))`,
        output: '[(1, 2), (2, 4), (5, 7)]',
        explanation:
          'By end time the order is (1, 2), (2, 4), (3, 5), (0, 6), (5, 7). (3, 5) and (0, 6) overlap the chosen (2, 4).',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `def max_sessions(sessions):
    end_of_last = None
    count = 0
    for start, end in sorted(sessions, key=lambda session: session[1]):
        if end_of_last is None or start >= end_of_last:
            count += 1
            end_of_last = end
    return count

print(max_sessions([(0, 3), (2, 5), (4, 7), (6, 9), (1, 2)]))`,
          ['2', '5', '4', '3'],
          3,
          'The greedy takes (1, 2), (2, 5), and (6, 9); each other session overlaps one of these.',
        ),
        predictOutput(
          'What does this program print?',
          `def chosen_sessions(sessions):
    chosen = []
    for start, end in sorted(sessions, key=lambda session: session[1]):
        if not chosen or start >= chosen[-1][1]:
            chosen.append((start, end))
    return chosen

print(chosen_sessions([(3, 8), (1, 4), (4, 6), (6, 9), (8, 10)]))`,
          [
            '[(1, 4), (4, 6), (6, 9)]',
            '[(1, 4), (4, 6), (8, 10)]',
            '[(1, 4), (3, 8), (8, 10)]',
            '[(1, 4), (4, 6), (6, 9), (8, 10)]',
          ],
          0,
          'After (6, 9) is accepted, (8, 10) starts before 9, so it is rejected.',
        ),
        choose(
          'Sessions are (0, 5), (1, 3), and (4, 6). Which does the earliest-finish greedy select?',
          ['(0, 5) only', '(1, 3) only', '(1, 3) and (4, 6)', 'All three'],
          2,
          '(1, 3) ends first; (0, 5) overlaps it, and (4, 6) starts after 3.',
        ),
        choose(
          'Why does sorting by end make one pass enough?',
          [
            'Each session is compared once with the last accepted end, which is final',
            'Sorting removes overlapping sessions',
            'Sessions with equal ends are skipped',
            'The pass is repeated until nothing changes',
          ],
          0,
          'Once a session is accepted or rejected, later sessions end no earlier, so the decision never needs revisiting.',
        ),
      ],
    },
    {
      title: 'Justify the choice with an exchange',
      explanation: [
        'Take any optimal schedule. Its first session ends no earlier than the earliest-finishing session, so replacing that first session with the greedy one keeps every later session feasible and keeps the count.',
        'Repeat the argument on the sessions compatible with the chosen one. Step by step, the optimal schedule turns into the greedy schedule without losing a session, so the greedy count is optimal.',
      ],
      example: {
        code: `def valid(schedule):
    last_end = float("-inf")
    for start, end in schedule:
        if start < last_end:
            return False
        last_end = end
    return True

optimal = [(0, 4), (4, 6), (7, 9)]
greedy_first = (1, 3)
exchanged = [greedy_first, optimal[1], optimal[2]]
print(valid(optimal), valid(exchanged), len(exchanged))`,
        output: 'True True 3',
        explanation:
          'The greedy session ends at 3, before the old end 4, so the remaining sessions still fit and the size stays 3.',
      },
      questions: [
        choose(
          'An optimal schedule’s first session ends at 8. The earliest-finishing session ends at 5. What does swapping it in preserve?',
          [
            'Only sessions that start before 5',
            'Every later session, since each starts at or after 8, which is after 5',
            'Nothing; the swap must be rechecked by brute force',
            'The total duration of the schedule',
          ],
          1,
          'Later sessions already started at or after 8, so an end of 5 cannot conflict with them.',
        ),
        predictOutput(
          'This replacement ends later than the session it replaces. What does the program print?',
          `def valid(schedule):
    last_end = float("-inf")
    for start, end in schedule:
        if start < last_end:
            return False
        last_end = end
    return True

optimal = [(0, 3), (3, 5)]
exchanged = [(1, 4), optimal[1]]
print(valid(optimal), valid(exchanged))`,
          ['True True', 'False True', 'False False', 'True False'],
          3,
          'The replacement ends at 4, after the next session’s start 3, so the swap breaks the schedule.',
        ),
        choose(
          'After the first exchange, how does the argument handle the remaining sessions?',
          [
            'It sorts them by start',
            'It assumes they are already optimal',
            'It repeats the exchange on the sessions compatible with the chosen one',
            'It removes the longest one',
          ],
          2,
          'The remaining problem has the same form, so the same exchange applies again.',
        ),
        choose(
          'For which objective does this exchange argument break?',
          [
            'Maximizing the number of sessions when some touch',
            'Maximizing total reward when sessions have different rewards',
            'Maximizing the number of sessions at negative times',
            'Maximizing the number of sessions with equal ends',
          ],
          1,
          'Swapping in an earlier-finishing session can lower the total reward, so the count-based exchange no longer applies.',
        ),
      ],
    },
    {
      title: 'Handle negative times, touching sessions, and cost',
      explanation: [
        'Start end_of_last as None, not 0. With 0, every session that starts before time 0 is wrongly rejected. Touching sessions are compatible because the test is start >= end_of_last.',
        'Sorting costs O(n log n) and the scan O(n). Other natural rules, such as earliest start or shortest duration, have counterexamples; only the earliest-finish rule has the exchange guarantee.',
      ],
      example: {
        code: `def max_sessions(sessions):
    end_of_last = None
    count = 0
    for start, end in sorted(sessions, key=lambda session: session[1]):
        if end_of_last is None or start >= end_of_last:
            count += 1
            end_of_last = end
    return count

def starts_at_zero(sessions):
    end_of_last = 0
    count = 0
    for start, end in sorted(sessions, key=lambda session: session[1]):
        if start >= end_of_last:
            count += 1
            end_of_last = end
    return count

sessions = [(-3, -1), (-1, 0), (-5, -2)]
print(max_sessions(sessions))
print(starts_at_zero(sessions))`,
        output: '2\n0',
        explanation:
          'The correct version takes (-5, -2) and then (-1, 0). Starting at 0 rejects every session, since all start before 0.',
      },
      questions: [
        predictOutput(
          'This version starts end_of_last at 0. What does it print?',
          `def starts_at_zero(sessions):
    end_of_last = 0
    count = 0
    for start, end in sorted(sessions, key=lambda session: session[1]):
        if start >= end_of_last:
            count += 1
            end_of_last = end
    return count

print(starts_at_zero([(-4, -2), (-2, 1), (1, 3)]))`,
          ['3', '1', '0', '2'],
          1,
          'The two sessions that start before 0 are rejected; only (1, 3) passes, although all three fit together.',
        ),
        predictOutput(
          'What does this program print?',
          `def max_sessions(sessions):
    end_of_last = None
    count = 0
    for start, end in sorted(sessions, key=lambda session: session[1]):
        if end_of_last is None or start >= end_of_last:
            count += 1
            end_of_last = end
    return count

print(max_sessions([(0, 2), (2, 4), (4, 6), (1, 5)]))`,
          ['2', '4', '3', '1'],
          2,
          'The touching sessions (0, 2), (2, 4), and (4, 6) are all compatible; (1, 5) overlaps them.',
        ),
        choose(
          'Sessions are (0, 5), (4, 7), and (6, 11). Shortest-first takes (4, 7) first. How many sessions does it fit, compared with earliest-finish?',
          ['2 versus 2', '1 versus 3', '1 versus 2', '2 versus 3'],
          2,
          '(4, 7) overlaps both others, so shortest-first fits 1; earliest-finish takes (0, 5) and then (6, 11).',
        ),
        choose(
          'How long does max_sessions take on n sessions?',
          [
            'O(n²), since every pair is compared',
            'O(n), one scan only',
            'O(2^n), every subset',
            'O(n log n): one sort, then one scan',
          ],
          3,
          'The scan does constant work per session after sorting.',
        ),
      ],
    },
  ],

  'cp-geometry-displacement': [
    {
      title: 'Subtract the start from the end, coordinate by coordinate',
      explanation: [
        'The vector from point a to point b is b - a: (b.x - a.x, b.y - a.y). It records how far to move horizontally and vertically to get from a to b.',
        'Direction matters. The vector from b to a has every coordinate negated.',
      ],
      example: {
        code: `def displacement(a, b):
    return (b[0] - a[0], b[1] - a[1])

print(displacement((1, 4), (6, 2)))
print(displacement((6, 2), (1, 4)))`,
        output: '(5, -2)\n(-5, 2)',
        explanation:
          'Going from (1, 4) to (6, 2) moves 5 right and 2 down. The reverse trip negates both moves.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `def displacement(a, b):
    return (b[0] - a[0], b[1] - a[1])

print(displacement((3, -1), (0, 5)))`,
          ['(3, -6)', '(-3, 6)', '(3, 4)', '(-3, 4)'],
          1,
          '0 - 3 = -3 and 5 - (-1) = 6.',
        ),
        predictOutput(
          'What does this program print?',
          `def displacement(a, b):
    return (b[0] - a[0], b[1] - a[1])

print(displacement((2, 2), (5, 7)), displacement((5, 7), (2, 2)))`,
          [
            '(3, 5) (3, 5)',
            '(7, 9) (7, 9)',
            '(-3, -5) (3, 5)',
            '(3, 5) (-3, -5)',
          ],
          3,
          'Reversing the direction negates each coordinate.',
        ),
        choose(
          'Which vector goes from A = (4, 1) to B = (1, 3)?',
          ['(-3, 2)', '(3, -2)', '(5, 4)', '(-3, -2)'],
          0,
          'B - A = (1 - 4, 3 - 1) = (-3, 2).',
        ),
        choose(
          'How is the vector from B to A related to the vector from A to B?',
          [
            'They are equal',
            'Its coordinates are swapped',
            'Each coordinate is negated',
            'It is doubled',
          ],
          2,
          'A - B = -(B - A).',
        ),
      ],
    },
    {
      title: 'Displacement does not depend on the origin',
      explanation: [
        'Shifting both points by the same offset adds that offset to b and to a, and the subtraction cancels it. So the displacement between two points is the same wherever they sit.',
        'With integer coordinates, Python’s subtraction is exact even for huge values. Float coordinates can pick up rounding error, which is why geometry code prefers integers when the input allows it.',
      ],
      example: {
        code: `def displacement(a, b):
    return (b[0] - a[0], b[1] - a[1])

print(displacement((0, 0), (3, 4)))
print(displacement((10, 10), (13, 14)))
print(displacement((10**20, 0), (10**20 + 1, -2)))`,
        output: '(3, 4)\n(3, 4)\n(1, -2)',
        explanation:
          'Moving both points by (10, 10) leaves the vector unchanged, and huge integers subtract exactly.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `def displacement(a, b):
    return (b[0] - a[0], b[1] - a[1])

print(displacement((1, 2), (4, 4)), displacement((101, -48), (104, -46)))`,
          [
            '(3, 2) (3, 2)',
            '(3, 2) (103, -46)',
            '(3, 2) (-3, -2)',
            '(3, 2) (100, -50)',
          ],
          0,
          'The second pair is the first pair shifted by (100, -50), which cancels in the subtraction.',
        ),
        predictOutput(
          'What does this program print?',
          `def displacement(a, b):
    return (b[0] - a[0], b[1] - a[1])

print(displacement((10**18, 5), (10**18 + 7, 5)))`,
          ['(0, 0)', '(7.0, 0)', '(7, 0)', '(1e18, 0)'],
          2,
          'Python integers have no fixed size, so the difference 7 is exact.',
        ),
        choose(
          'Both points move right by 9 units. What happens to the displacement between them?',
          [
            'Its x coordinate grows by 9',
            'It does not change',
            'Both coordinates grow by 9',
            'It reverses direction',
          ],
          1,
          'The 9 is added to both x coordinates and cancels in b.x - a.x.',
        ),
        predictOutput(
          'These coordinates are floats. What does this program print?',
          `def displacement(a, b):
    return (b[0] - a[0], b[1] - a[1])

print(displacement((0.1, 0), (0.3, 0)))`,
          ['(0.2, 0)', '(0.3, 0)', '(0.2, 0.0)', '(0.19999999999999998, 0)'],
          3,
          '0.1 and 0.3 are not stored exactly as floats, so their difference is not exactly 0.2.',
        ),
      ],
    },
  ],

  'cp-geometry-cross-product': [
    {
      title: 'Compute u.x * v.y - u.y * v.x',
      explanation: [
        'The 2D cross product of vectors u and v is the single number u.x * v.y - u.y * v.x. Unlike the dot product, which adds matching coordinates’ products, it pairs each x with the other vector’s y and subtracts.',
        'Order matters: cross(v, u) = -cross(u, v).',
      ],
      example: {
        code: `def cross_product(u, v):
    return u[0] * v[1] - u[1] * v[0]

print(cross_product((3, 1), (1, 2)))
print(cross_product((1, 2), (3, 1)))`,
        output: '5\n-5',
        explanation:
          '3 * 2 - 1 * 1 = 5. Swapping the vectors swaps the two products, negating the result.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `def cross_product(u, v):
    return u[0] * v[1] - u[1] * v[0]

print(cross_product((2, 5), (4, 1)))`,
          ['18', '13', '-18', '22'],
          2,
          '2 * 1 - 5 * 4 = 2 - 20 = -18. 13 would be the dot product.',
        ),
        predictOutput(
          'What does this program print?',
          `def cross_product(u, v):
    return u[0] * v[1] - u[1] * v[0]

print(cross_product((1, 3), (2, 0)), cross_product((2, 0), (1, 3)))`,
          ['6 6', '-6 6', '6 -6', '-6 -6'],
          1,
          '1 * 0 - 3 * 2 = -6, and swapping the arguments negates it.',
        ),
        choose(
          'How does swapping the two arguments change the cross product?',
          [
            'It leaves it unchanged',
            'It doubles it',
            'It negates it',
            'It makes it zero',
          ],
          2,
          'u.x * v.y - u.y * v.x becomes v.x * u.y - v.y * u.x, the same products subtracted the other way.',
        ),
        choose(
          'Which expression is the dot product rather than the cross product?',
          [
            'u.x * v.y - u.y * v.x',
            'u.y * v.x - u.x * v.y',
            'abs(u.x * v.y - u.y * v.x)',
            'u.x * v.x + u.y * v.y',
          ],
          3,
          'The dot product multiplies matching coordinates and adds; the cross product mixes them and subtracts.',
        ),
      ],
    },
    {
      title: 'Read the sign and the doubled area',
      explanation: [
        'In Cartesian coordinates, a positive cross product means v points counterclockwise from u, a negative one clockwise, and zero means the vectors are parallel or one is zero.',
        'The absolute value is twice the area of the triangle formed by u and v from a common origin. The formula uses only multiplication and subtraction, so vertical vectors need no special case.',
      ],
      example: {
        code: `def cross_product(u, v):
    return u[0] * v[1] - u[1] * v[0]

print(cross_product((4, 0), (0, 3)))
print(cross_product((2, 1), (4, 2)))`,
        output: '12\n0',
        explanation:
          'The right triangle with legs 4 and 3 has area 6, doubled to 12. (4, 2) is parallel to (2, 1), giving 0.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `def cross_product(u, v):
    return u[0] * v[1] - u[1] * v[0]

print(cross_product((5, 0), (2, 4)) / 2)`,
          ['20', '10', '10.0', '5.0'],
          2,
          'The cross product is 20, twice the triangle area; dividing with / gives the float 10.0.',
        ),
        predictOutput(
          'What does this program print?',
          `def cross_product(u, v):
    return u[0] * v[1] - u[1] * v[0]

print(cross_product((3, -6), (-1, 2)))`,
          ['12', '0', '-12', '-15'],
          1,
          '3 * 2 - (-6) * (-1) = 6 - 6 = 0: the vectors point in opposite directions along one line.',
        ),
        choose(
          'cross(u, v) > 0 in Cartesian coordinates. Where does v point relative to u?',
          [
            'Counterclockwise from u, to its left',
            'Clockwise from u, to its right',
            'In the same direction as u',
            'Exactly opposite to u',
          ],
          0,
          'A positive sign means a counterclockwise turn from u to v; parallel vectors give 0.',
        ),
        choose(
          'Why does the integer cross product handle a vertical vector like (0, 5) without trouble?',
          [
            'Vertical vectors always give 0',
            'It ignores the y coordinate',
            'Python converts vertical vectors to floats',
            'It uses only multiplication and subtraction, never division by an x difference',
          ],
          3,
          'A slope would divide by 0 for a vertical vector; the cross product never divides.',
        ),
      ],
    },
  ],

  'cp-geometry-turn-sign': [
    {
      title: 'Combine B - A and C - A into one turn sign',
      explanation: [
        'To classify the turn at points a, b, c, take the vectors b - a and c - a and compute their cross product. Positive means c lies to the left of the directed line a → b, negative means right, and zero means the three points are collinear.',
        '(cross > 0) - (cross < 0) turns the number into 1, -1, or 0, because True and False count as 1 and 0.',
      ],
      example: {
        code: `def turn(a, b, c):
    cross = (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0])
    return (cross > 0) - (cross < 0)

print(turn((0, 0), (2, 0), (3, 1)))`,
        output: '1',
        explanation:
          'b - a = (2, 0) and c - a = (3, 1); the cross product 2 * 1 - 0 * 3 = 2 is positive, a left turn.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `def turn(a, b, c):
    cross = (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0])
    return (cross > 0) - (cross < 0)

print(turn((1, 1), (4, 1), (2, -3)))`,
          ['1', '0', '-12', '-1'],
          3,
          'b - a = (3, 0) and c - a = (1, -4); 3 * (-4) - 0 * 1 = -12, a right turn.',
        ),
        predictOutput(
          'What does this program print?',
          `def turn(a, b, c):
    cross = (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0])
    return (cross > 0) - (cross < 0)

print(turn((0, 0), (1, 2), (2, 4)), turn((0, 0), (1, 2), (1, 3)))`,
          ['0 1', '1 1', '0 -1', '1 0'],
          0,
          '(2, 4) lies on the line through (1, 2). For (1, 3), 1 * 3 - 2 * 1 = 1 is positive.',
        ),
        predictOutput(
          'What does this program print?',
          `signs = []
for cross in [-7, 0, 9]:
    signs.append((cross > 0) - (cross < 0))
print(signs)`,
          ['[-7, 0, 9]', '[False, False, True]', '[-1, 0, 1]', '[1, 0, 1]'],
          2,
          'Subtracting the two comparisons gives 1 - 0, 0 - 0, or 0 - 1.',
        ),
        choose(
          'Walking from A = (0, 0) to B = (0, 5), on which side is C = (3, 2)?',
          [
            'Left, since the cross product is positive',
            'Right, since the cross product is negative',
            'On the line',
            'It cannot be decided without slopes',
          ],
          1,
          '(0, 5) × (3, 2) = 0 * 2 - 5 * 3 = -15, so C is to the right of the upward walk.',
        ),
      ],
    },
    {
      title: 'Treat zero, repeated points, and screen axes carefully',
      explanation: [
        'A zero result means a, b, and c lie on one line, but it does not say c is between a and b; c can be behind a or beyond b. Repeated points also give zero, because one of the vectors is (0, 0).',
        'The sign rule assumes Cartesian axes with y increasing upward. On a screen where y increases downward, the same formula still runs, but a result of 1 looks like a clockwise turn.',
      ],
      example: {
        code: `def turn(a, b, c):
    cross = (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0])
    return (cross > 0) - (cross < 0)

print(turn((0, 0), (2, 2), (2, 2)))
print(turn((0, 0), (3, 3), (-1, -1)))`,
        output: '0\n0',
        explanation:
          'Repeated points give a zero vector. (-1, -1) is on the line through (0, 0) and (3, 3), but behind the start.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `def turn(a, b, c):
    cross = (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0])
    return (cross > 0) - (cross < 0)

print(turn((5, 5), (5, 5), (8, 1)))`,
          ['1', '-1', '0', '-4'],
          2,
          'a and b are the same point, so b - a is (0, 0) and the cross product is 0.',
        ),
        choose(
          'On a screen where y increases downward, turn returns 1. How does the turn look on screen?',
          [
            'Counterclockwise',
            'Straight',
            'It depends on the x coordinates',
            'Clockwise',
          ],
          3,
          'Flipping the y axis mirrors the picture, so the same algebraic sign appears as the opposite rotation.',
        ),
        predictOutput(
          'What does this program print?',
          `def turn(a, b, c):
    cross = (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0])
    return (cross > 0) - (cross < 0)

print(turn((1, 1), (3, 2), (-1, 0)))`,
          ['-1', '0', '1', '2'],
          1,
          'c - a = (-2, -1) is exactly opposite to b - a = (2, 1), so the points are collinear.',
        ),
        choose(
          'turn(a, b, c) returns 0. Which conclusion is justified?',
          [
            'a, b, and c lie on one line, possibly with repeated points',
            'c lies between a and b',
            'The points form a right angle',
            'All three points are equal',
          ],
          0,
          'Zero only says the vectors are parallel or zero; where c lies on the line needs another test.',
        ),
      ],
    },
  ],

  'cp-geometry': [
    {
      title: 'Classify every consecutive triple of a path',
      explanation: [
        'For a path of points, each consecutive triple (p[i], p[i + 1], p[i + 2]) has its own turn sign. A path of n points has n - 2 triples, and the signs come out in path order.',
        'Walking around a convex polygon counterclockwise gives a left turn, 1, at every corner; a right turn reveals a dent.',
      ],
      example: {
        code: `def turn_signs(points):
    signs = []
    for index in range(len(points) - 2):
        a, b, c = points[index:index + 3]
        cross = (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0])
        signs.append((cross > 0) - (cross < 0))
    return signs

print(turn_signs([(0, 0), (4, 0), (4, 3), (0, 3)]))`,
        output: '[1, 1]',
        explanation:
          'Going right and then up is a left turn, and going up and then left is another left turn.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `def turn_signs(points):
    signs = []
    for index in range(len(points) - 2):
        a, b, c = points[index:index + 3]
        cross = (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0])
        signs.append((cross > 0) - (cross < 0))
    return signs

print(turn_signs([(0, 0), (2, 0), (2, 2), (4, 2)]))`,
          ['[1, 1]', '[-1, 1]', '[1, -1]', '[1, 0]'],
          2,
          'Right then up turns left; up then right turns right.',
        ),
        predictOutput(
          'What does this program print?',
          `def turn_signs(points):
    signs = []
    for index in range(len(points) - 2):
        a, b, c = points[index:index + 3]
        cross = (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0])
        signs.append((cross > 0) - (cross < 0))
    return signs

print(turn_signs([(0, 0), (1, 1), (2, 2), (3, 1)]))`,
          ['[0, -1]', '[0, 1]', '[1, -1]', '[-1]'],
          0,
          'The first three points are collinear. From (1, 1) through (2, 2), the path then bends right to (3, 1).',
        ),
        choose(
          'A path has 7 points. How many signs does turn_signs return?',
          ['7', '6', '3', '5'],
          3,
          'Triples start at indices 0 through 4, which is 7 - 2 = 5 triples.',
        ),
        choose(
          'A walk goes counterclockwise around a convex polygon. Which signs appear at its corners?',
          ['All -1', 'All 1', 'Alternating 1 and -1', 'All 0'],
          1,
          'Every corner of a convex polygon turns the same way, and counterclockwise means left turns.',
        ),
      ],
    },
    {
      title: 'Return nothing for short paths and keep the input intact',
      explanation: [
        'range(len(points) - 2) is empty when there are fewer than three points, including the empty path where the stop is -2, so short inputs return [] without special cases.',
        'points[index:index + 3] copies three points into a, b, c without changing the list, so the caller’s path is preserved.',
      ],
      example: {
        code: `def turn_signs(points):
    signs = []
    for index in range(len(points) - 2):
        a, b, c = points[index:index + 3]
        cross = (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0])
        signs.append((cross > 0) - (cross < 0))
    return signs

print(turn_signs([]))
print(turn_signs([(1, 2), (3, 4)]))`,
        output: '[]\n[]',
        explanation: 'Neither input has a triple, so the loop body never runs.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `print(list(range(len([(0, 0)]) - 2)), list(range(len([(0, 0), (1, 1), (2, 2), (3, 3)]) - 2)))`,
          ['[] [0, 1, 2]', '[-1] [0, 1]', '[] [0, 1]', '[0] [0, 1]'],
          2,
          'range(-1) is empty. Four points give the two starting indices 0 and 1.',
        ),
        predictOutput(
          'What does this program print?',
          `points = [(0, 0), (1, 0), (1, 1), (0, 1)]
a, b, c = points[1:4]
print(a, c)`,
          ['(0, 0) (1, 1)', '(1, 0) (1, 1)', '(0, 0) (0, 1)', '(1, 0) (0, 1)'],
          3,
          'The slice holds indices 1, 2, and 3, so a is (1, 0) and c is (0, 1).',
        ),
        predictOutput(
          'What does this program print?',
          `def turn_signs(points):
    signs = []
    for index in range(len(points) - 2):
        a, b, c = points[index:index + 3]
        cross = (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0])
        signs.append((cross > 0) - (cross < 0))
    return signs

print(turn_signs([(3, 3), (3, 3), (3, 3)]))`,
          ['[0]', '[]', '[1]', '[0, 0, 0]'],
          0,
          'Three points form one triple, and repeated points give a zero cross product.',
        ),
        choose(
          'Why does range(len(points) - 2) never cause an index error for 0, 1, or 2 points?',
          [
            'Python pads short lists with zeros',
            'A range whose stop is 0 or less is empty, so the body never runs',
            'Slicing clips every index automatically',
            'len always returns at least 3',
          ],
          1,
          'range(0), range(-1), and range(-2) produce no values.',
        ),
      ],
    },
    {
      title: 'Prefer exact integer orientation to slopes',
      explanation: [
        'Comparing slopes divides by an x difference, which fails for vertical segments and introduces float rounding. The cross product needs only integer multiplication and subtraction, so it is exact for coordinates of any size.',
        'Orientation is a building block. It classifies one turn; tasks like segment intersection combine several orientation tests with boundary checks.',
      ],
      example: {
        code: `a, b, c = (2, 0), (2, 5), (0, 1)
cross = (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0])
print(cross)
print(b[0] - a[0])`,
        output: '10\n0',
        explanation:
          'A slope through a and b would divide by 0. The cross product is 10, so c is to the left of the upward segment.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          `def turn_signs(points):
    signs = []
    for index in range(len(points) - 2):
        a, b, c = points[index:index + 3]
        cross = (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0])
        signs.append((cross > 0) - (cross < 0))
    return signs

print(turn_signs([(0, 0), (10**15, 1), (2 * 10**15, 3)]))`,
          ['[0]', '[-1]', '[]', '[1]'],
          3,
          'The cross product is 10^15 * 3 - 1 * 2 * 10^15 = 10^15, exactly positive.',
        ),
        choose(
          'A slope-based test divides by B.x - A.x. Which segment breaks it?',
          [
            'A horizontal segment such as (0, 3) to (4, 3)',
            'A vertical segment such as (2, 0) to (2, 5)',
            'A diagonal such as (0, 0) to (3, 3)',
            'A segment with negative coordinates',
          ],
          1,
          'A vertical segment has B.x - A.x = 0.',
        ),
        predictOutput(
          'The points (0, 0), (3, 0.3), and (1, 0.1) lie on one line. What does this slope comparison print?',
          `slope_ab = (0.3 - 0.0) / (3 - 0)
slope_ac = (0.1 - 0.0) / (1 - 0)
print(slope_ab == slope_ac)`,
          ['True', '0.1', 'False', 'An error is raised'],
          2,
          '0.3 / 3 rounds to 0.09999999999999999, which is not equal to 0.1, so float slopes miss the collinearity.',
        ),
        choose(
          'What does a single orientation test not decide by itself?',
          [
            'Whether C is to the left of A → B',
            'Whether three points are collinear',
            'Whether two segments intersect',
            'Whether a turn is clockwise in Cartesian axes',
          ],
          2,
          'Intersection needs several orientation tests plus checks for collinear and touching cases.',
        ),
      ],
    },
  ],
};

export const knowledgePoints: KnowledgePointModule = {
  ...dynamic,
  ...strategy,
};
