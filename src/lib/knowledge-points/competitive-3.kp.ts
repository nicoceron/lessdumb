import {
  choose,
  predictOutput,
  typeNumber,
  typeOutput,
  type KnowledgePointModule,
} from './authoring';

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
        typeOutput(
          'What does this program print?',
          `cache = {}
for position, budget, answer in [(2, 1, 4), (2, 5, 9), (2, 1, 4)]:
    cache[position] = answer
print(cache)`,
          '{2: 4}',
          'All three stores use key 2, so each overwrites the last; the final store writes 4.',
        ),
        typeOutput(
          'What does this program print?',
          `cache = {}
for position, budget, answer in [(2, 1, 4), (2, 5, 9), (2, 1, 4)]:
    cache[(position, budget)] = answer
print(len(cache))`,
          '2',
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
        typeOutput(
          'What does this program print?',
          `cache = {}
cache[(1, 4)] = 10
cache[(1, 4)] = 12
print(cache[(1, 4)], len(cache))`,
          '12 1',
          'The second assignment uses an equal tuple, so it replaces the value under the same single key.',
        ),
        choose(
          'Which value cannot be used as a dictionary key?',
          ['(2, 7)', '[2, 7]', '"2,7"', '27'],
          1,
          'A list is mutable and therefore unhashable; tuples, strings, and integers are hashable.',
        ),
        typeOutput(
          'What does this program print?',
          `states = [[0, 5], [0, 5], [1, 5]]
keys = [(position, budget) for position, budget in states]
print(keys[0] == keys[1], keys[0] == keys[2])`,
          'True False',
          'Tuples built from equal values are equal; (0, 5) and (1, 5) differ in position.',
        ),
        typeOutput(
          'What does this program print?',
          `cache = {}
for state in [[2, 3], [3, 2], [2, 3]]:
    key = (state[0], state[1])
    if key in cache:
        cache[key] += 1
    else:
        cache[key] = 1
print(cache)`,
          '{(2, 3): 2, (3, 2): 1}',
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
        typeOutput(
          'What does this program print?',
          `def route_boundary(remaining):
    if remaining == 0:
        return 1
    if remaining < 0:
        return 0
    return None

print([route_boundary(r) for r in [0, -1, 0]])`,
          '[1, 0, 1]',
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
        typeNumber(
          'A counting recurrence adds the counts of smaller states. If the zero state returned 0 instead of 1, what would every count become?',
          0,
          'Every count is ultimately a sum of base values; with no base value of 1, all sums are 0.',
        ),
        typeOutput(
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
          '2',
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
        typeOutput(
          'What does this program print?',
          `def route_boundary(remaining):
    if remaining == 0:
        return 1
    if remaining < 0:
        return 0
    return None

print([route_boundary(r) for r in [2, -2, 0]])`,
          '[None, 0, 1]',
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
        typeOutput(
          'This helper merges two cases. What does it print?',
          `def boundary(remaining):
    if remaining <= 0:
        return 1
    return None

print([boundary(r) for r in [-1, 0, 1]])`,
          '[1, 1, None]',
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
        typeOutput(
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
          '6\n15\n[3, 2, 1, 5, 4]',
          'solve(5) computes only 5 and 4; it finds state 3 already stored by the first call.',
        ),
        typeOutput(
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
          '6',
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
            'Yes, the cache computes every state exactly once',
            'Yes, as long as the cache is a plain dictionary',
            'No, f(t) calls f(t + 1), which calls f(t) before it is stored',
            'No, dictionaries cannot store negative keys',
          ],
          2,
          'Answers are stored only when complete; a state that depends on itself never completes, so the recursion never finishes.',
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
        typeOutput(
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
          '9\n9',
          'The cache outlives the first call, so solve(0) finds the stored 9 for the second list.',
        ),
        typeOutput(
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
          '9\n3',
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
        typeOutput(
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
          '8',
          'With moves of 1 and 2 the counts are 1, 1, 2, 3, 5, 8 for distances 0 through 5.',
        ),
        typeOutput(
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
          '3',
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
            'Each route must use every allowed move exactly once',
            'Adding is faster than multiplying large counts',
            'Each route starts with exactly one move, so groups are disjoint',
            'The cache can only store sums, not products',
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
        typeOutput(
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
          '3 11',
          'Small states such as 1 and 0 are recomputed on several branches, giving 11 calls for only 3 routes.',
        ),
        typeOutput(
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
          '3 7',
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
            'Skips the repeated call entirely',
            'Nothing useful: no answer is stored yet',
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
        typeOutput(
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
          '5\n5',
          'The cache key is only r, so the second call returns the answer stored for the old moves.',
        ),
        typeOutput(
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
          '5\n1',
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
            'The cache is full; clear it between the calls',
            'Integers overflow; switch the counts to floats',
            'The recursion is 100000 calls deep; fill a table bottom-up',
            'The base case is wrong; return 0 at zero instead',
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
        typeOutput(
          'What does this program print?',
          `table = [float("inf")] * (5 + 1)
table[0] = 0
print(len(table), table[0], table[5])`,
          '6 0 inf',
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
        typeOutput(
          'This table is meant to cover totals 0 through 3. What does it print?',
          `target = 3
table = [float("inf")] * target
table[0] = 0
print(table)`,
          '[0, inf, inf]',
          'Multiplying by target gives only three entries, so there is no index for total 3.',
        ),
        typeNumber(
          'How many entries does a table for exact totals 0 through 10 need?',
          11,
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
        typeOutput(
          'Total 4 can be reached with 3 packets, but this table was filled with zeros. What does it print?',
          `table = [0] * 5
table[4] = min(table[4], 3)
print(table[4])`,
          '0',
          'min(0, 3) keeps the false starting value 0.',
        ),
        typeOutput(
          'What does this program print?',
          `table = [float("inf")] * 5
table[0] = 0
table[4] = min(table[4], 3)
print(table)`,
          '[0, inf, inf, inf, 3]',
          'Infinity loses to the real candidate 3, and the untouched totals stay unreached.',
        ),
        typeOutput(
          'What does this program print?',
          `unreachable = float("inf")
print(unreachable + 1, min(unreachable + 1, 7))`,
          'inf 7',
          'Adding 1 to infinity is still infinity, and any finite value is smaller.',
        ),
        choose(
          'Why is 0 a bad starting value for unreached totals in a minimum-count table?',
          [
            'Python cannot store 0 next to infinity in a list',
            'It makes dp[0] look unreachable to later totals',
            'It looks like a free answer, so min never replaces it',
            'It turns every final answer into infinity',
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
        typeOutput(
          'What does this program print?',
          `def relax_packet(current, previous):
    return min(current, previous + 1)

print(relax_packet(6, 3), relax_packet(3, 3))`,
          '4 3',
          'First the candidate 4 beats 6. Second, the candidate 4 loses to the current 3.',
        ),
        typeOutput(
          'What does this program print?',
          `current = float("inf")
for previous in [5, 2, 4]:
    current = min(current, previous + 1)
print(current)`,
          '3',
          'The candidates are 6, 3, and 5, and the running minimum keeps 3.',
        ),
        typeNumber(
          'Total 7 currently needs 3 packets. Total 3 needs 1 packet. After relaxing total 7 with a size-4 packet, what is its count?',
          2,
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
        typeOutput(
          'What does this program print?',
          `inf = float("inf")
def relax_packet(current, previous):
    return min(current, previous + 1)

print(relax_packet(inf, 0), relax_packet(5, inf))`,
          '1 5',
          'A reachable total 0 proposes 1 packet. An unreachable predecessor proposes infinity, so 5 stays.',
        ),
        typeOutput(
          'What does this program print?',
          `inf = float("inf")
dp = [0, inf, inf, inf, inf]
dp[3] = min(dp[3], dp[0] + 1)
dp[4] = min(dp[4], dp[1] + 1)
print(dp[3], dp[4])`,
          '1 inf',
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
        typeOutput(
          'What does this program print?',
          `inf = float("inf")
best = inf
for previous in [inf, inf, 2]:
    best = min(best, previous + 1)
print(best)`,
          '3',
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
        typeOutput(
          'What does this program print?',
          `def one_two_table(target):
    dp = [0] * (target + 1)
    for total in range(1, target + 1):
        dp[total] = dp[total - 1] + 1
        if total >= 2:
            dp[total] = min(dp[total], dp[total - 2] + 1)
    return dp

print(one_two_table(5))`,
          '[0, 1, 1, 2, 2, 3]',
          'Using as many 2s as possible, totals 0 through 5 need 0, 1, 1, 2, 2, and 3 packets.',
        ),
        typeOutput(
          'This loop fills totals from high to low. What does it print?',
          `dp = [0] + [float("inf")] * 4
for total in range(4, 0, -1):
    dp[total] = dp[total - 1] + 1
print(dp)`,
          '[0, 1, inf, inf, inf]',
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
        typeOutput(
          'This loop has no size guard. What does it print?',
          `dp = [0] * 4
for total in range(1, 4):
    dp[total] = min(dp[total - 1], dp[total - 3]) + 1
print(dp)`,
          '[0, 1, 1, 1]',
          'At totals 1 and 2, dp[-2] and dp[-1] wrap around to entries that are still 0.',
        ),
        typeOutput(
          'What does this program print?',
          `dp = [0] * 4
for total in range(1, 4):
    dp[total] = dp[total - 1] + 1
    if total >= 3:
        dp[total] = min(dp[total], dp[total - 3] + 1)
print(dp)`,
          '[0, 1, 2, 1]',
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
        typeOutput(
          'What does this program print?',
          `dp = [0, 1, 2, 1]
total = 2
size = 3
if total >= size:
    print(dp[total - size] + 1)
else:
    print("skip")`,
          'skip',
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
        typeOutput(
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
          '2',
          'Two size-4 packets make 8. Starting with 5 would need 5 + 1 + 1 + 1, four packets.',
        ),
        typeNumber(
          'Sizes are [1, 3, 4] and dp[5] = 2, dp[3] = 1, dp[2] = 2. What is dp[6]?',
          2,
          'The candidates are dp[5] + 1 = 3, dp[3] + 1 = 2, and dp[2] + 1 = 3; the minimum is 2.',
        ),
        choose(
          'What does the inner loop over sizes compute for one total t?',
          [
            'The sum of dp[t - s] over all fitting sizes s',
            'The best last packet: min of dp[t - s] + 1 over fitting s',
            'The largest packet size s that still fits in t',
            'Whether t is an exact multiple of every size s',
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
        typeOutput(
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
          '-1 2',
          '14 is not a sum of 6s and 10s, while 16 = 6 + 10.',
        ),
        typeOutput(
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
          '0 -1',
          'Total 0 is reachable with zero packets; with no sizes, nothing else is.',
        ),
        choose(
          'Why convert infinity to -1 only after the table is complete?',
          [
            'Python cannot print infinity inside a list',
            'Infinity comparisons are slower than integer ones',
            '-1 in the table would look like a cheap predecessor',
            '-1 is reserved for dp[0] during the loop',
          ],
          2,
          'A predecessor of -1 proposes -1 + 1 = 0 packets, which beats every real answer.',
        ),
        typeOutput(
          'This table writes -1 for unreachable totals from the start. What does it print?',
          `dp = [0, -1, -1, -1]
for total in range(1, 4):
    for size in [2]:
        if size <= total:
            dp[total] = min(dp[total], dp[total - size] + 1)
print(dp)`,
          '[0, -1, -1, -1]',
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
        typeOutput(
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
          '5 2',
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
            'Both items, which together weigh exactly 4',
            'The weight-2 item taken twice, weighing 4',
            'The weight-3 item alone, leaving 1 unit unused',
            'No item; 7 is a bonus for unused capacity',
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
            'No, a valid answer must weigh exactly 10',
            'Only if no remaining item weighs exactly 2',
            'Only when all items have equal values',
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
        typeOutput(
          'What does this program print?',
          `def capacity_values(capacity):
    return [0] * (capacity + 1)

table = capacity_values(3)
print(len(table), table[3])`,
          '4 0',
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
        typeOutput(
          'What does this program print?',
          `def capacity_values(capacity):
    return [0] * (capacity + 1)

first = capacity_values(2)
first[2] = 5
second = capacity_values(2)
print(first, second)`,
          '[0, 0, 5] [0, 0, 0]',
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
        typeOutput(
          'What does this program print?',
          `def item_choice(previous, capacity, weight, value):
    if weight > capacity:
        return previous[capacity]
    return max(previous[capacity], previous[capacity - weight] + value)

print(item_choice([0, 3, 3, 6, 6], 4, 3, 5))`,
          '8',
          'Taking leaves capacity 1, worth 3, plus 5 gives 8, which beats skipping at 6.',
        ),
        typeOutput(
          'What does this program print?',
          `def item_choice(previous, capacity, weight, value):
    if weight > capacity:
        return previous[capacity]
    return max(previous[capacity], previous[capacity - weight] + value)

print(item_choice([0, 4, 4, 8, 8], 4, 2, 3))`,
          '8',
          'Taking gives previous[2] + 3 = 7, which loses to skipping at 8.',
        ),
        typeNumber(
          'previous = [0, 0, 6, 6, 8, 8], capacity 5, and the item has weight 3 and value 4. What does taking the item propose?',
          10,
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
        typeOutput(
          'This version has no fit check. What does it print?',
          `def unguarded(previous, capacity, weight, value):
    return max(previous[capacity], previous[capacity - weight] + value)

print(unguarded([0, 2, 2, 5], 1, 3, 9))`,
          '11',
          'capacity - weight is -2, and previous[-2] is 2, so the impossible take is scored as 2 + 9.',
        ),
        typeOutput(
          'What does this program print?',
          `def item_choice(previous, capacity, weight, value):
    if weight > capacity:
        return previous[capacity]
    return max(previous[capacity], previous[capacity - weight] + value)

previous = [0, 1, 1, 4]
print(item_choice(previous, 1, 2, 3), item_choice(previous, 2, 2, 3), item_choice(previous, 3, 2, 3))`,
          '1 3 4',
          'Capacity 1 cannot hold the item. Capacity 2 takes it for 3. At capacity 3, taking gives 1 + 3 = 4, tying the skip value 4.',
        ),
        choose(
          'Why must both alternatives read from the table before this item was considered?',
          [
            'The new table is empty until every item is read',
            'Reading an updated entry could count the same item twice',
            'Previous tables are sorted, so lookups are faster',
            'It makes the available capacity larger',
          ],
          1,
          'An entry that already includes this item, plus the item again, would use it twice.',
        ),
        choose(
          'The item weighs 6 and the capacity is 4. What is the best value after deciding this item?',
          [
            '0, since a too-heavy item resets the value',
            'previous[4] + value, counting the item anyway',
            'previous[-2] + value, reading from the end',
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
        typeOutput(
          'What does this program print?',
          `def apply_one_item(previous, weight, value):
    dp = previous[:]
    for capacity in range(len(dp) - 1, weight - 1, -1):
        dp[capacity] = max(dp[capacity], dp[capacity - weight] + value)
    return dp

print(apply_one_item([0, 0, 0, 0, 0, 0, 0], 2, 3))`,
          '[0, 0, 3, 3, 3, 3, 3]',
          'Every capacity from 2 up holds one copy, worth 3.',
        ),
        typeOutput(
          'This pass runs capacities upward. What does it print?',
          `dp = [0, 0, 0, 0, 0, 0, 0]
weight, value = 2, 3
for capacity in range(weight, len(dp)):
    dp[capacity] = max(dp[capacity], dp[capacity - weight] + value)
print(dp)`,
          '[0, 0, 3, 3, 6, 6, 9]',
          'Capacity 4 reads the already updated dp[2] and adds the item again; capacity 6 ends with three copies.',
        ),
        choose(
          'During a descending pass for weight 3, capacity 7 reads dp[4]. What does dp[4] still hold?',
          [
            'The value after this item was already added',
            'The final answer for capacity 4',
            'The value before this item, since 4 is visited later',
            'An undefined value until the pass ends',
          ],
          2,
          'Capacities are visited 7, 6, 5, 4, ..., so dp[4] has not been touched when capacity 7 reads it.',
        ),
        typeOutput(
          'What does this program print?',
          `def apply_one_item(previous, weight, value):
    dp = previous[:]
    for capacity in range(len(dp) - 1, weight - 1, -1):
        dp[capacity] = max(dp[capacity], dp[capacity - weight] + value)
    return dp

print(apply_one_item([0, 2, 2, 2, 2], 1, 5))`,
          '[0, 5, 7, 7, 7]',
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
        typeOutput(
          'This version does not copy. What does it print?',
          `def apply_in_place(previous, weight, value):
    dp = previous
    for capacity in range(len(dp) - 1, weight - 1, -1):
        dp[capacity] = max(dp[capacity], dp[capacity - weight] + value)
    return dp

old = [0, 0, 0]
new = apply_in_place(old, 1, 4)
print(old)`,
          '[0, 4, 4]',
          'dp = previous names the same list, so the caller’s old stage is overwritten.',
        ),
        choose(
          'Why does the loop stop at capacity = weight instead of continuing down to 0?',
          [
            'Smaller capacities cannot hold the item, so they stay as is',
            'Capacity 0 is the answer and must not be touched',
            'Python ranges with step -1 cannot reach 0',
            'Smaller capacities must be reset to 0 separately',
          ],
          0,
          'Below the weight, only skipping is possible, which leaves the entry unchanged.',
        ),
        typeOutput(
          'What does this program print?',
          `def apply_one_item(previous, weight, value):
    dp = previous[:]
    for capacity in range(len(dp) - 1, weight - 1, -1):
        dp[capacity] = max(dp[capacity], dp[capacity - weight] + value)
    return dp

print(apply_one_item([0, 3, 3], 4, 10))`,
          '[0, 3, 3]',
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
        typeOutput(
          'What does this program print?',
          `def best_value(items, capacity):
    dp = [0] * (capacity + 1)
    for weight, value in items:
        for limit in range(capacity, weight - 1, -1):
            dp[limit] = max(dp[limit], dp[limit - weight] + value)
    return dp[capacity]

print(best_value([(1, 2), (2, 3), (3, 5)], 4))`,
          '7',
          'Weights 1 and 3 fit together for 2 + 5 = 7. All three items weigh 6, and weights 2 and 3 weigh 5.',
        ),
        typeOutput(
          'What does this program print?',
          `def best_table(items, capacity):
    dp = [0] * (capacity + 1)
    for weight, value in items:
        for limit in range(capacity, weight - 1, -1):
            dp[limit] = max(dp[limit], dp[limit - weight] + value)
    return dp

print(best_table([(3, 4), (1, 1), (2, 3)], 4))`,
          '[0, 1, 3, 4, 5]',
          'Capacity 3 holds weight 3 or weights 1 + 2, both worth 4. Capacity 4 holds weights 3 and 1 for 5.',
        ),
        choose(
          'After processing the first k items, what does dp[c] hold?',
          [
            'The best value using item k alone, within weight c',
            'The best value using all n items, within weight c',
            'The best value using only the first k items, within weight c',
            'The total weight of the first k items, capped at c',
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
        typeOutput(
          'This version runs capacities upward. What does it print?',
          `def best_value(items, capacity):
    dp = [0] * (capacity + 1)
    for weight, value in items:
        for limit in range(weight, capacity + 1):
            dp[limit] = max(dp[limit], dp[limit - weight] + value)
    return dp[capacity]

print(best_value([(3, 4)], 6))`,
          '8',
          'Capacity 6 reads dp[3], which already contains this item, so the item is counted twice.',
        ),
        typeOutput(
          'What does this program print?',
          `def best_value(items, capacity):
    dp = [0] * (capacity + 1)
    for weight, value in items:
        for limit in range(capacity, weight - 1, -1):
            dp[limit] = max(dp[limit], dp[limit - weight] + value)
    return dp[capacity]

print(best_value([(3, 4), (3, 4)], 6))`,
          '8',
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
        typeOutput(
          'What does this program print?',
          `def best_value(items, capacity):
    dp = [0] * (capacity + 1)
    for weight, value in items:
        for limit in range(capacity, weight - 1, -1):
            dp[limit] = max(dp[limit], dp[limit - weight] + value)
    return dp[capacity]

print(best_value([(5, 10), (4, 7), (3, 5)], 7))`,
          '12',
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
            '20 items with weights below 10 and capacity 50',
            'An empty item list and capacity 100',
          ],
          1,
          'The table needs one entry per capacity unit, so a capacity near 10^12 is far too large, even with only 3 items.',
        ),
        typeOutput(
          'What does this program print?',
          `def best_value(items, capacity):
    dp = [0] * (capacity + 1)
    for weight, value in items:
        for limit in range(capacity, weight - 1, -1):
            dp[limit] = max(dp[limit], dp[limit - weight] + value)
    return dp[capacity]

print(best_value([(7, 50), (2, 3)], 5))`,
          '3',
          'The weight-7 item does not fit capacity 5, so only the value-3 item is taken.',
        ),
        typeOutput(
          'What does this program print?',
          `def best_value(items, capacity):
    dp = [0] * (capacity + 1)
    for weight, value in items:
        for limit in range(capacity, weight - 1, -1):
            dp[limit] = max(dp[limit], dp[limit - weight] + value)
    return dp[capacity]

print(best_value([(1, 9)], 0), best_value([], 0))`,
          '0 0',
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
        typeOutput(
          'What does this program print?',
          `def is_subsequence(wanted, source):
    matched = 0
    for value in source:
        if matched < len(wanted) and wanted[matched] == value:
            matched += 1
    return matched == len(wanted)

print(is_subsequence([1, 3], [3, 1, 2, 3]), is_subsequence([3, 1, 3], [3, 1, 2]))`,
          'True False',
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
        typeOutput(
          'What does this program print?',
          `wanted = [2, 2, 5]
source = [2, 5, 2, 5]
matched = 0
for value in source:
    if matched < len(wanted) and wanted[matched] == value:
        matched += 1
print(matched)`,
          '3',
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
        typeOutput(
          'What does this program print?',
          `def is_subsequence(wanted, source):
    matched = 0
    for value in source:
        if matched < len(wanted) and wanted[matched] == value:
            matched += 1
    return matched == len(wanted)

print(is_subsequence([7, 7, 7], [7, 3, 7]), is_subsequence([7, 7], [7, 3, 7]))`,
          'False True',
          'The source has only two 7s, enough for [7, 7] but not [7, 7, 7].',
        ),
        choose(
          'Without the matched < len(wanted) check, what happens for wanted [1] and source [1, 1]?',
          [
            'It returns False, since the source is longer',
            'It matches 1 twice and returns True',
            'After matching, it reads wanted[1] and raises IndexError',
            'Nothing changes; the result is still True',
          ],
          2,
          'Once matched is 1, the next comparison reads wanted[1], which does not exist.',
        ),
        choose(
          'Why is it safe to match each wanted element at its earliest possible source position?',
          [
            'Later positions are never needed once one match is found',
            'An earlier match leaves as many later positions for the rest',
            'It sorts the source so later matches are easier',
            'It lets one position match two wanted elements',
          ],
          1,
          'Any match found later could be swapped for the earlier one without blocking the remaining elements.',
        ),
        typeOutput(
          'What does this program print?',
          `def is_subsequence(wanted, source):
    matched = 0
    for value in source:
        if matched < len(wanted) and wanted[matched] == value:
            matched += 1
    return matched == len(wanted)

print(is_subsequence("aa", "banana"), is_subsequence("aaa", "banana"), is_subsequence("aaaa", "banana"))`,
          'True True False',
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
        typeOutput(
          'What does this program print?',
          `from bisect import bisect_left

print(bisect_left([2, 6, 6, 8], 6), bisect_left([2, 6, 6, 8], 7))`,
          '1 3',
          'The first entry >= 6 is at index 1; the first entry >= 7 is the 8 at index 3.',
        ),
        typeOutput(
          'What does this program print?',
          `from bisect import bisect_left

print(bisect_left([3, 5, 8], 1), bisect_left([3, 5, 8], 9))`,
          '0 3',
          'Every tail is >= 1, so the answer is 0. No tail is >= 9, so the answer is len(tails) = 3.',
        ),
        choose(
          'tails = [2, 5, 8] and the new value is 5. Why does bisect_left return 1 rather than 2?',
          [
            'bisect_left always returns a smaller index',
            'Index 2 is out of range for a list of length 3',
            'Equal values are skipped and never stored in tails',
            'An equal 5 cannot extend a strictly increasing subsequence',
          ],
          3,
          'Only tails strictly below the value can be extended, so the search stops at the equal tail.',
        ),
        choose(
          'bisect_left([1, 3, 6], 10) returns 3. What does that tell the tails update?',
          [
            'Every tail is smaller, so 10 extends the longest length',
            '10 replaces tails[3], the current last tail',
            '10 is a duplicate of an existing tail',
            '10 is too large to use and is discarded',
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
        typeOutput(
          'What does this program print?',
          `from bisect import bisect_left, bisect_right

tails = [4, 4, 4]
print(bisect_left(tails, 4), bisect_right(tails, 4))`,
          '0 3',
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
        typeOutput(
          'What does this program print?',
          `from bisect import bisect_left

tails = [2, 5, 9]
positions = []
for value in [1, 5, 6, 10]:
    positions.append(bisect_left(tails, value))
print(positions)`,
          '[0, 1, 2, 3]',
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
        typeOutput(
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
          '[3, 6, 7]',
          '7 replaces the first tail >= 7, which is 9; the length stays 3.',
        ),
        typeOutput(
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
          '[5]\n[1]\n[1, 6]',
          '1 replaces 5 as the best length-1 ending, and 6 extends it to length 2.',
        ),
        choose(
          'Why replace a tail with a smaller value instead of keeping the old one?',
          [
            'It shortens the subsequence to save space',
            'It keeps the list unsorted for later searches',
            'A smaller ending can be extended by more future values',
            'It removes duplicates from the input',
          ],
          2,
          'Every value that can follow the old ending can also follow the smaller one, and possibly more.',
        ),
        typeOutput(
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
          '[2, 5, 9]',
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
        typeOutput(
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
          '[2, 8]',
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
        typeOutput(
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
          '[1, 5, 9] [1, 3, 9]',
          'tails[:] copies the list, so only new changes; 3 replaces 5.',
        ),
        choose(
          'The input so far is [5, 6, 2] and tails = [2, 6]. Then 7 arrives and is appended. What does that guarantee?',
          [
            'Some increasing subsequence of length 3 now exists',
            '2, 6, 7 appears in that order in the input',
            'Length 2 is no longer possible in the input',
            '7 replaced 6 as the best length-2 ending',
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
        typeOutput(
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
          '3',
          '2, 3, 4 is strictly increasing. The final 1 replaces 2 without adding a length.',
        ),
        typeOutput(
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
          '[5, 6, 8]',
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
        typeOutput(
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
          '3',
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
        typeOutput(
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
          '3',
          'Strictly increasing allows only one of each value: 2, 3, 4.',
        ),
        typeOutput(
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
          '5',
          'bisect_right lets equal values extend, so the whole non-decreasing list counts.',
        ),
        choose(
          'Which input gives different answers for the bisect_left and bisect_right versions?',
          ['[1, 2, 3]', '[3, 2, 1]', '[1, 1, 2]', '[]'],
          2,
          'Strictly, [1, 1, 2] gives 2; non-decreasing, it gives 3. The other inputs have no equal values to disagree on.',
        ),
        typeOutput(
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
          '1 2',
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
        typeOutput(
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
          '0 1',
          'An empty list has no tails. In a decreasing list each value replaces the single tail.',
        ),
        typeOutput(
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
          '3',
          '-3, -1, 0 and -3, -2, 0 both have length 3; -1 and -2 cannot both be used.',
        ),
        choose(
          'What does len(tails) equal after the whole input is processed?',
          [
            'The number of distinct values in the input',
            'The largest value seen in the input',
            'The length of a longest strictly increasing subsequence',
            'The number of tail replacements performed',
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
        typeOutput(
          'What does this program print?',
          `def intervals_overlap(first, second):
    return max(first[0], second[0]) < min(first[1], second[1])

print(intervals_overlap((2, 6), (6, 9)), intervals_overlap((2, 7), (6, 9)))`,
          'False True',
          'The first pair shares no point: 6 < 6 is False. The second shares [6, 7).',
        ),
        typeOutput(
          'What does this program print?',
          `def intervals_overlap(first, second):
    return max(first[0], second[0]) < min(first[1], second[1])

print(intervals_overlap((0, 10), (3, 4)), intervals_overlap((5, 6), (1, 2)))`,
          'True False',
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
            'Yes, both bookings contain the time 10',
            'Yes, touching bookings always conflict',
            'No, the first ends as the second starts',
            'Only if they are listed in sorted order',
          ],
          2,
          'The first booking excludes 10, so no moment belongs to both.',
        ),
        typeOutput(
          'What does this program print?',
          `def closed_overlap(first, second):
    return max(first[0], second[0]) <= min(first[1], second[1])

print(closed_overlap((3, 5), (5, 7)), closed_overlap((3, 5), (6, 7)))`,
          'True False',
          'Closed intervals [3, 5] and [5, 7] share 5. [3, 5] and [6, 7] leave a gap.',
        ),
        choose(
          'Which points do the closed intervals [2, 5] and [5, 8] share?',
          ['None', 'All of [2, 8]', 'Only the point 5', 'The interval [5, 8)'],
          2,
          'Both closed intervals include 5, and no other point lies in both.',
        ),
        typeOutput(
          'What does this program print?',
          `def half_open_overlap(first, second):
    return max(first[0], second[0]) < min(first[1], second[1])

results = []
for first, second in [((-5, -1), (-3, 2)), ((-5, -3), (-3, 0)), ((0, 1), (0, 1))]:
    results.append(half_open_overlap(first, second))
print(results)`,
          '[True, False, True]',
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
        typeOutput(
          'What does this program print?',
          `print(sorted([(6, 7), (2, 9), (4, 5)]))`,
          '[(2, 9), (4, 5), (6, 7)]',
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
            'Sorting removes overlapping intervals before the scan',
            'A later interval may start earlier and connect passed spans',
            'Arrival order is usually reversed, and sorting fixes it',
            'Merging needs unique starts, and sorting groups them',
          ],
          1,
          'Without sorted starts, the scan cannot know that no future interval reaches back before the current span.',
        ),
        typeOutput(
          'What does this program print?',
          `print(sorted([(5, 6), (1, 2), (0, 10)]))`,
          '[(0, 10), (1, 2), (5, 6)]',
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
        typeOutput(
          'What does this program print?',
          `print(sorted([(3, 9), (3, 4), (3, 6)]))`,
          '[(3, 4), (3, 6), (3, 9)]',
          'All starts are equal, so the ends decide the order.',
        ),
        typeOutput(
          'What does this program print?',
          `intervals = [(4, 7), (1, 5)]
result = intervals.sort()
print(result, intervals)`,
          'None [(1, 5), (4, 7)]',
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
        typeOutput(
          'What does this program print?',
          `def merge_next(current, following):
    if following[0] <= current[1]:
        return [(current[0], max(current[1], following[1]))]
    return [current, following]

print(merge_next((1, 6), (3, 8)))
print(merge_next((1, 6), (7, 8)))`,
          '[(1, 8)]\n[(1, 6), (7, 8)]',
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
            '<= is faster to evaluate than <',
            'Half-open intervals include their end',
            'Touching spans share no point, yet leave no gap',
          ],
          3,
          'Overlap asks for a shared point; union asks only whether the covered region is continuous.',
        ),
        typeOutput(
          'What does this program print?',
          `def merge_next(current, following):
    if following[0] <= current[1]:
        return [(current[0], max(current[1], following[1]))]
    return [current, following]

print(merge_next((-4, -2), (-1, 3)))`,
          '[(-4, -2), (-1, 3)]',
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
        typeOutput(
          'This version takes the end of the following interval. What does it print?',
          `def merge_next(current, following):
    if following[0] <= current[1]:
        return [(current[0], following[1])]
    return [current, following]

print(merge_next((0, 10), (2, 4)))`,
          '[(0, 4)]',
          'Replacing the end with 4 drops the covered region [4, 10).',
        ),
        typeOutput(
          'What does this program print?',
          `def merge_next(current, following):
    if following[0] <= current[1]:
        return [(current[0], max(current[1], following[1]))]
    return [current, following]

print(merge_next((0, 10), (2, 4)))`,
          '[(0, 10)]',
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
        typeOutput(
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
          '[(1, 3), (4, 9)]',
          '(1, 2) and (2, 3) touch, giving (1, 3). (4, 6) starts after 3, and (5, 9) extends it to (4, 9).',
        ),
        typeOutput(
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
          '[(0, 1), (3, 5), (10, 12)]',
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
            'Earlier spans end before it, and later bookings start no earlier',
            'Earlier spans are deleted from the list after each step',
            'The last span is always the longest one so far',
            'Only merged[-1] can be changed in a Python list',
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
        typeOutput(
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
          '[(1, 3), (3, 5)]',
          '3 < 3 is False, so the touching booking starts a separate span.',
        ),
        typeOutput(
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
          '[(2, 6), (8, 12)]',
          'The nested (4, 6) shrinks the span to end at 6, so (8, 12) no longer looks connected.',
        ),
        typeOutput(
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
          '[(0, 1), (3, 6)]',
          'The duplicate starts inside the open span and extends it to max(6, 6) = 6.',
        ),
        choose(
          'When should the scan keep touching spans such as [1, 3) and [3, 5) separate?',
          [
            'Never; touching spans must always merge into one',
            'Only when the bookings arrive unsorted',
            'When the output must keep them apart, using < instead of <=',
            'Only when some endpoints are negative',
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
        typeOutput(
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
          '[(1, 2), (5, 6)]',
          'list.sort() reorders the caller’s list, so data changes even though only the result was wanted.',
        ),
        typeOutput(
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
          '[] [(4, 9)]',
          'An empty input leaves merged empty; a single booking is appended unchanged.',
        ),
        typeOutput(
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
          '[(5, 8)]',
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
        typeOutput(
          'What does this program print?',
          `def finish_order(intervals):
    return sorted(intervals, key=lambda interval: (interval[1], interval[0]))

print(finish_order([(1, 8), (0, 3), (4, 6)]))`,
          '[(0, 3), (4, 6), (1, 8)]',
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
        typeNumber(
          'Sorting by start picks (0, 100) first from (0, 100), (1, 2), and (3, 4). How many activities does that schedule hold?',
          1,
          'Both short activities overlap (0, 100), so nothing else fits; earliest finish would fit 2.',
        ),
        typeOutput(
          'What does this program print?',
          `intervals = [(0, 100), (1, 2), (3, 4)]
print(sorted(intervals)[0], sorted(intervals, key=lambda iv: (iv[1], iv[0]))[0])`,
          '(0, 100) (1, 2)',
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
        typeOutput(
          'What does this program print?',
          `print(sorted([(4, 6), (2, 6), (5, 6)], key=lambda iv: (iv[1], iv[0])))`,
          '[(2, 6), (4, 6), (5, 6)]',
          'All ends are 6, so the starts decide the order.',
        ),
        typeOutput(
          'This key uses only the end. What does it print?',
          `print(sorted([(4, 6), (2, 6)], key=lambda iv: iv[1]))`,
          '[(4, 6), (2, 6)]',
          'The keys tie, and a stable sort keeps tied items in their input order.',
        ),
        typeOutput(
          'What does this program print?',
          `sessions = [(5, 9), (0, 2)]
ordered = sorted(sessions, key=lambda s: (s[1], s[0]))
print(sessions[0], ordered[0])`,
          '(5, 9) (0, 2)',
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
        typeOutput(
          'What does this program print?',
          `def compatible_starts(last_end, candidates):
    return [start >= last_end for start in candidates]

print(compatible_starts(3, [3, 2, 7]))`,
          '[True, False, True]',
          'A start equal to the last end is compatible; 2 starts before it.',
        ),
        choose(
          'The last selected activity is [2, 6). Which candidate is compatible?',
          ['[5, 9)', '[6, 8)', '[1, 3)', '[4, 6)'],
          1,
          'Only [6, 8) starts at or after 6.',
        ),
        typeOutput(
          'What does this program print?',
          `def compatible_starts(last_end, candidates):
    return [start >= last_end for start in candidates]

print(compatible_starts(-5, [-1, -6, -5]))`,
          '[True, False, True]',
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
        typeOutput(
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
          '2',
          '(0, 5) is accepted first, which rejects (1, 2) and (2, 3); only (5, 6) follows.',
        ),
        typeOutput(
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
          '3',
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
            'A stricter compatibility test using > instead',
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
        typeOutput(
          'What does this program print?',
          `def exchange_preserves(greedy_end, old_end, later_starts):
    return all(start < old_end or start >= greedy_end for start in later_starts)

print(exchange_preserves(2, 5, [5, 7, 1]), exchange_preserves(6, 5, [5]))`,
          'True False',
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
        typeOutput(
          'The replacement ends later than the original. What does this program print?',
          `greedy_end, old_end = 9, 7
later = [7, 8, 9, 12]
print([start >= greedy_end for start in later if start >= old_end])`,
          '[False, False, True, True]',
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
        typeOutput(
          'What does this program print?',
          `def exchange_preserves(greedy_end, old_end, later_starts):
    return all(start < old_end or start >= greedy_end for start in later_starts)

print(exchange_preserves(4, 4, [1, 4, 9]), exchange_preserves(9, 2, []))`,
          'True True',
          'Equal ends change nothing. With no later starts, all([]) is True.',
        ),
        typeOutput(
          'What does this program print?',
          `old_end, greedy_end = 6, 8
print([start < old_end or start >= greedy_end for start in [5, 6, 8]])`,
          '[True, False, True]',
          'Start 6 was feasible after 6 but not after 8, so its implication fails.',
        ),
        choose(
          'Why do starts below old_end not matter to the exchange?',
          [
            'They did not fit after the original first activity',
            'They are always feasible after the new one',
            'Sorting removes them before the exchange',
            'They cannot overlap any other activity',
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
        typeOutput(
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
          '3',
          'The greedy takes (1, 2), (2, 5), and (6, 9); each other session overlaps one of these.',
        ),
        typeOutput(
          'What does this program print?',
          `def chosen_sessions(sessions):
    chosen = []
    for start, end in sorted(sessions, key=lambda session: session[1]):
        if not chosen or start >= chosen[-1][1]:
            chosen.append((start, end))
    return chosen

print(chosen_sessions([(3, 8), (1, 4), (4, 6), (6, 9), (8, 10)]))`,
          '[(1, 4), (4, 6), (6, 9)]',
          'After (6, 9) is accepted, (8, 10) starts before 9, so it is rejected.',
        ),
        choose(
          'Sessions are (0, 5), (1, 3), and (4, 6). Which does the earliest-finish greedy select?',
          [
            '(0, 5) and (4, 6)',
            '(1, 3) only',
            '(1, 3) and (4, 6)',
            '(0, 5), (1, 3), and (4, 6)',
          ],
          2,
          '(1, 3) ends first; (0, 5) overlaps it, and (4, 6) starts after 3.',
        ),
        choose(
          'Why does sorting by end make one pass enough?',
          [
            'Each decision uses a final last end, so none is revisited',
            'Sorting removes overlapping sessions before the scan',
            'Sessions with equal ends are skipped as duplicates',
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
            'Only the later sessions that start before 5',
            'Every later session, since each starts at 8 or later',
            'Nothing; the swap must be rechecked by brute force',
            'The total duration of the schedule',
          ],
          1,
          'Later sessions already started at or after 8, so an end of 5 cannot conflict with them.',
        ),
        typeOutput(
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
          'True False',
          'The replacement ends at 4, after the next session’s start 3, so the swap breaks the schedule.',
        ),
        choose(
          'After the first exchange, how does the argument handle the remaining sessions?',
          [
            'It sorts them by start and checks each pair',
            'It assumes the remaining sessions are already optimal',
            'It repeats the exchange on the sessions after the chosen one',
            'It removes the longest one and starts over',
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
        typeOutput(
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
          '1',
          'The two sessions that start before 0 are rejected; only (1, 3) passes, although all three fit together.',
        ),
        typeOutput(
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
          '3',
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
        typeOutput(
          'What does this program print?',
          `def displacement(a, b):
    return (b[0] - a[0], b[1] - a[1])

print(displacement((3, -1), (0, 5)))`,
          '(-3, 6)',
          '0 - 3 = -3 and 5 - (-1) = 6.',
        ),
        typeOutput(
          'What does this program print?',
          `def displacement(a, b):
    return (b[0] - a[0], b[1] - a[1])

print(displacement((2, 2), (5, 7)), displacement((5, 7), (2, 2)))`,
          '(3, 5) (-3, -5)',
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
        typeOutput(
          'What does this program print?',
          `def displacement(a, b):
    return (b[0] - a[0], b[1] - a[1])

print(displacement((1, 2), (4, 4)), displacement((101, -48), (104, -46)))`,
          '(3, 2) (3, 2)',
          'The second pair is the first pair shifted by (100, -50), which cancels in the subtraction.',
        ),
        typeOutput(
          'What does this program print?',
          `def displacement(a, b):
    return (b[0] - a[0], b[1] - a[1])

print(displacement((10**18, 5), (10**18 + 7, 5)))`,
          '(7, 0)',
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
          [
            '(0.2, 0)',
            '(0.20000000000000001, 0)',
            '(0.2, 0.0)',
            '(0.19999999999999998, 0)',
          ],
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
        typeOutput(
          'What does this program print?',
          `def cross_product(u, v):
    return u[0] * v[1] - u[1] * v[0]

print(cross_product((2, 5), (4, 1)))`,
          '-18',
          '2 * 1 - 5 * 4 = 2 - 20 = -18. 13 would be the dot product.',
        ),
        typeOutput(
          'What does this program print?',
          `def cross_product(u, v):
    return u[0] * v[1] - u[1] * v[0]

print(cross_product((1, 3), (2, 0)), cross_product((2, 0), (1, 3)))`,
          '-6 6',
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
        typeOutput(
          'What does this program print?',
          `def cross_product(u, v):
    return u[0] * v[1] - u[1] * v[0]

print(cross_product((5, 0), (2, 4)) / 2)`,
          '10.0',
          'The cross product is 20, twice the triangle area; dividing with / gives the float 10.0.',
        ),
        typeOutput(
          'What does this program print?',
          `def cross_product(u, v):
    return u[0] * v[1] - u[1] * v[0]

print(cross_product((3, -6), (-1, 2)))`,
          '0',
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
            'Vertical vectors always give a cross product of 0',
            'It ignores the y coordinate of a vertical vector',
            'Python converts vertical vectors to floats',
            'It only multiplies and subtracts, never dividing by an x gap',
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
        typeOutput(
          'What does this program print?',
          `def turn(a, b, c):
    cross = (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0])
    return (cross > 0) - (cross < 0)

print(turn((1, 1), (4, 1), (2, -3)))`,
          '-1',
          'b - a = (3, 0) and c - a = (1, -4); 3 * (-4) - 0 * 1 = -12, a right turn.',
        ),
        typeOutput(
          'What does this program print?',
          `def turn(a, b, c):
    cross = (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0])
    return (cross > 0) - (cross < 0)

print(turn((0, 0), (1, 2), (2, 4)), turn((0, 0), (1, 2), (1, 3)))`,
          '0 1',
          '(2, 4) lies on the line through (1, 2). For (1, 3), 1 * 3 - 2 * 1 = 1 is positive.',
        ),
        typeOutput(
          'What does this program print?',
          `signs = []
for cross in [-7, 0, 9]:
    signs.append((cross > 0) - (cross < 0))
print(signs)`,
          '[-1, 0, 1]',
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
        typeOutput(
          'What does this program print?',
          `def turn(a, b, c):
    cross = (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0])
    return (cross > 0) - (cross < 0)

print(turn((5, 5), (5, 5), (8, 1)))`,
          '0',
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
        typeOutput(
          'What does this program print?',
          `def turn(a, b, c):
    cross = (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0])
    return (cross > 0) - (cross < 0)

print(turn((1, 1), (3, 2), (-1, 0)))`,
          '0',
          'c - a = (-2, -1) is exactly opposite to b - a = (2, 1), so the points are collinear.',
        ),
        choose(
          'turn(a, b, c) returns 0. Which conclusion is justified?',
          [
            'a, b, and c lie on one line, possibly repeated',
            'c lies on the segment between a and b',
            'The angle at b is exactly a right angle',
            'All three points are the same point',
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
        typeOutput(
          'What does this program print?',
          `def turn_signs(points):
    signs = []
    for index in range(len(points) - 2):
        a, b, c = points[index:index + 3]
        cross = (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0])
        signs.append((cross > 0) - (cross < 0))
    return signs

print(turn_signs([(0, 0), (2, 0), (2, 2), (4, 2)]))`,
          '[1, -1]',
          'Right then up turns left; up then right turns right.',
        ),
        typeOutput(
          'What does this program print?',
          `def turn_signs(points):
    signs = []
    for index in range(len(points) - 2):
        a, b, c = points[index:index + 3]
        cross = (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0])
        signs.append((cross > 0) - (cross < 0))
    return signs

print(turn_signs([(0, 0), (1, 1), (2, 2), (3, 1)]))`,
          '[0, -1]',
          'The first three points are collinear. From (1, 1) through (2, 2), the path then bends right to (3, 1).',
        ),
        typeNumber(
          'A path has 7 points. How many signs does turn_signs return?',
          5,
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
        typeOutput(
          'What does this program print?',
          `print(list(range(len([(0, 0)]) - 2)), list(range(len([(0, 0), (1, 1), (2, 2), (3, 3)]) - 2)))`,
          '[] [0, 1]',
          'range(-1) is empty. Four points give the two starting indices 0 and 1.',
        ),
        typeOutput(
          'What does this program print?',
          `points = [(0, 0), (1, 0), (1, 1), (0, 1)]
a, b, c = points[1:4]
print(a, c)`,
          '(1, 0) (0, 1)',
          'The slice holds indices 1, 2, and 3, so a is (1, 0) and c is (0, 1).',
        ),
        typeOutput(
          'What does this program print?',
          `def turn_signs(points):
    signs = []
    for index in range(len(points) - 2):
        a, b, c = points[index:index + 3]
        cross = (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0])
        signs.append((cross > 0) - (cross < 0))
    return signs

print(turn_signs([(3, 3), (3, 3), (3, 3)]))`,
          '[0]',
          'Three points form one triple, and repeated points give a zero cross product.',
        ),
        choose(
          'Why does range(len(points) - 2) never cause an index error for 0, 1, or 2 points?',
          [
            'Python pads short lists with (0, 0) points',
            'A range with stop 0 or less is empty, so the body never runs',
            'Slicing clips every out-of-range index automatically',
            'len returns at least 3 for any list of points',
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
        typeOutput(
          'What does this program print?',
          `def turn_signs(points):
    signs = []
    for index in range(len(points) - 2):
        a, b, c = points[index:index + 3]
        cross = (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0])
        signs.append((cross > 0) - (cross < 0))
    return signs

print(turn_signs([(0, 0), (10**15, 1), (2 * 10**15, 3)]))`,
          '[1]',
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
        typeOutput(
          'The points (0, 0), (3, 0.3), and (1, 0.1) lie on one line. What does this slope comparison print?',
          `slope_ab = (0.3 - 0.0) / (3 - 0)
slope_ac = (0.1 - 0.0) / (1 - 0)
print(slope_ab == slope_ac)`,
          'False',
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

const numberTheory: KnowledgePointModule = {
  'cp-gcd-divisibility': [
    {
      title: 'Test divisibility with a zero remainder',
      explanation: [
        'A positive integer d divides an integer a when a % d == 0, meaning a is an exact multiple of d. In Python, a % d with positive d is never negative, so the same test works for negative a.',
        'Zero is a multiple of every positive d, since 0 = d × 0. So every positive d divides 0.',
      ],
      example: {
        code: `def divides(divisor, value):
    return value % divisor == 0

print(divides(4, 28), divides(4, 30))
print(divides(5, 0), divides(3, -12))`,
        output: 'True False\nTrue True',
        explanation:
          '28 is 4 × 7, while 30 leaves remainder 2. Zero and -12 are exact multiples of 5 and 3.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          `print(-12 % 5, 0 % 7, 18 % 6)`,
          '3 0 0',
          'With a positive divisor Python returns a remainder from 0 to 4: -12 = 5 × (-3) + 3.',
        ),
        typeOutput(
          'What does this program print?',
          `def divides(divisor, value):
    return value % divisor == 0

print(divides(6, -42), divides(6, 15))`,
          'True False',
          '-42 is 6 × (-7), an exact multiple. 15 leaves remainder 3.',
        ),
        choose(
          'Does 9 divide 0?',
          [
            'No, 0 has no divisors',
            'Only when 9 is prime',
            'Yes, because 0 = 9 × 0',
            'It is undefined',
          ],
          2,
          '0 % 9 == 0, so 0 is a multiple of 9 like every other multiple.',
        ),
        choose(
          'Which value of a makes a % 4 == 0 true?',
          ['6', '-8', '2', '-6'],
          1,
          '-8 = 4 × (-2). -6 % 4 is 2, so -6 is not a multiple of 4.',
        ),
      ],
    },
    {
      title: 'Require a common divisor to divide both numbers',
      explanation: [
        'A common divisor of a and b divides each of them, so both remainders must be zero: a % d == 0 and b % d == 0. A divisor of only one number is not common.',
        'The number 1 divides every integer, so every pair has at least one common divisor; the gcd is the largest of them.',
      ],
      example: {
        code: `def is_common_divisor(a, b, divisor):
    return a % divisor == 0 and b % divisor == 0

common = []
for d in [1, 2, 3, 4, 6, 8, 12]:
    if is_common_divisor(24, 36, d):
        common.append(d)
print(common)`,
        output: '[1, 2, 3, 4, 6, 12]',
        explanation:
          '8 divides 24 but leaves remainder 4 on 36, so it is not common. The largest common candidate is 12.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          `def is_common_divisor(a, b, divisor):
    return a % divisor == 0 and b % divisor == 0

common = []
for d in [1, 2, 3, 4, 5, 6, 10, 15]:
    if is_common_divisor(20, 30, d):
        common.append(d)
print(common)`,
          '[1, 2, 5, 10]',
          '3, 6, and 15 do not divide 20, and 4 does not divide 30.',
        ),
        typeOutput(
          'What does this program print?',
          `def is_common_divisor(a, b, divisor):
    return a % divisor == 0 and b % divisor == 0

print(is_common_divisor(0, 0, 7), is_common_divisor(0, 9, 2))`,
          'True False',
          '7 divides 0 twice over. 2 divides 0 but not 9.',
        ),
        choose(
          'A program uses or instead of and in the common-divisor test. What does it wrongly accept?',
          [
            'Only 1, which divides every number',
            'A divisor of just one number, such as 8 for 24 and 36',
            'Nothing; and and or agree for remainders',
            'Only negative divisors of the two numbers',
          ],
          1,
          'With or, one zero remainder is enough, so 8 passes because it divides 24.',
        ),
        typeNumber(
          'Which positive integer divides every pair of integers?',
          1,
          'Every integer is a multiple of 1, so 1 is always a common divisor.',
        ),
      ],
    },
  ],

  'cp-gcd-remainder-step': [
    {
      title: 'Replace (a, b) with (b, a % b)',
      explanation: [
        'a % b equals a minus a multiple of b. Any number that divides both a and b also divides that difference, and any number that divides b and a % b divides a again. So (a, b) and (b, a % b) have exactly the same common divisors, and the same gcd.',
        'When a < b, a % b is a itself, so the step simply swaps the pair.',
      ],
      example: {
        code: `def euclid_step(a, b):
    return (b, a % b)

print(euclid_step(84, 36))
print(euclid_step(7, 30))`,
        output: '(36, 12)\n(30, 7)',
        explanation:
          '84 = 2 × 36 + 12. For (7, 30), the remainder is 7, so the step only swaps.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          `def euclid_step(a, b):
    return (b, a % b)

print(euclid_step(50, 15))`,
          '(15, 5)',
          '50 = 3 × 15 + 5, so the new pair is (15, 5).',
        ),
        typeOutput(
          'What does this program print?',
          `a, b = 48, 18
a, b = b, a % b
print(a, b)
a, b = b, a % b
print(a, b)`,
          '18 12\n12 6',
          '48 % 18 = 12, then 18 % 12 = 6.',
        ),
        choose(
          'Why do (a, b) and (b, a % b) have the same common divisors?',
          [
            'a % b is always prime, so it adds no new divisors',
            'Both pairs have the same sum, so the same divisors',
            'a % b is a minus a multiple of b, so shared divisors carry over',
            'b always divides a, so the pair barely changes',
          ],
          2,
          'Subtracting multiples of b cannot create or destroy a divisor shared with b.',
        ),
        typeOutput(
          'What does this program print?',
          `def euclid_step(a, b):
    return (b, a % b)

print(euclid_step(7, 30))`,
          '(30, 7)',
          '7 % 30 is 7, so a smaller first value is just swapped into second place.',
        ),
      ],
    },
    {
      title: 'Shrink the second value until a zero remainder',
      explanation: [
        'The remainder a % b is always smaller than b, so each step makes the second value strictly smaller. A nonnegative value cannot shrink forever, so it eventually reaches 0.',
        'A zero remainder means b divides a. At that point the pair is (b, 0), and b is a common divisor of the original pair.',
      ],
      example: {
        code: `def euclid_step(a, b):
    return (b, a % b)

step1 = euclid_step(30, 18)
step2 = euclid_step(step1[0], step1[1])
step3 = euclid_step(step2[0], step2[1])
print(step1, step2, step3)`,
        output: '(18, 12) (12, 6) (6, 0)',
        explanation:
          'The second value goes 18, 12, 6, 0. The final remainder is 0 because 6 divides 12.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          `def euclid_step(a, b):
    return (b, a % b)

step1 = euclid_step(21, 8)
step2 = euclid_step(step1[0], step1[1])
step3 = euclid_step(step2[0], step2[1])
print(step1, step2, step3)`,
          '(8, 5) (5, 3) (3, 2)',
          '21 % 8 = 5, 8 % 5 = 3, and 5 % 3 = 2.',
        ),
        choose(
          'After a step from (a, b) with b > 0, how does the new second value compare with b?',
          [
            'It is larger than b, since a was larger',
            'It is smaller than b, so the steps must end',
            'It equals b until a reaches 0',
            'It can be negative when a is smaller',
          ],
          1,
          'A remainder after dividing by b is between 0 and b - 1.',
        ),
        typeOutput(
          'What does this program print?',
          `def euclid_step(a, b):
    return (b, a % b)

print(euclid_step(45, 15), 45 % 15 == 0)`,
          '(15, 0) True',
          '15 divides 45 exactly, so the remainder is 0 after one step.',
        ),
        choose(
          'A step produces (9, 0). What does that say about the previous pair (a, 9)?',
          [
            'a is prime, since only 9 remains',
            'a equals 0, matching the zero remainder',
            'They share no divisor except 1',
            '9 divides a, so 9 is a common divisor of the pair',
          ],
          3,
          'a % 9 == 0 means a is a multiple of 9, and 9 divides itself.',
        ),
      ],
    },
  ],

  'cp-gcd-lcm-zero': [
    {
      title: 'Divide by the gcd before multiplying',
      explanation: [
        'For nonzero a and b, lcm(a, b) = |a × b| / gcd(a, b). Writing it as (a // g) * b gives the same value, because g divides a exactly, and keeps the intermediate number smaller than a * b.',
        'abs makes the result nonnegative when an input is negative.',
      ],
      example: {
        code: `def lcm_from_gcd(a, b, divisor):
    if a == 0 or b == 0:
        return 0
    return abs((a // divisor) * b)

print(lcm_from_gcd(18, 30, 6))
print(lcm_from_gcd(-12, 18, 6))`,
        output: '90\n36',
        explanation:
          '18 // 6 = 3 and 3 × 30 = 90. For -12, the product -36 is made nonnegative by abs.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          `def lcm_from_gcd(a, b, divisor):
    if a == 0 or b == 0:
        return 0
    return abs((a // divisor) * b)

print(lcm_from_gcd(8, 12, 4), lcm_from_gcd(7, 5, 1))`,
          '24 35',
          '8 // 4 × 12 = 24. Coprime numbers have lcm equal to their product.',
        ),
        typeOutput(
          'What does this program print?',
          `def lcm_from_gcd(a, b, divisor):
    if a == 0 or b == 0:
        return 0
    return abs((a // divisor) * b)

print(lcm_from_gcd(-4, 10, 2))`,
          '20',
          '-4 // 2 = -2, times 10 is -20, and abs gives 20.',
        ),
        choose(
          'Why compute (a // g) * b instead of (a * b) // g?',
          [
            'The two formulas give different answers',
            'Division must always come last',
            '(a * b) // g divides by zero',
            'The intermediate value stays smaller',
          ],
          3,
          'Both are exact; dividing first just avoids building the large product a * b.',
        ),
        typeNumber(
          'a = 12, b = 18, and gcd(a, b) = 6. What is lcm(a, b)?',
          36,
          '12 // 6 × 18 = 36, the smallest positive multiple of both.',
        ),
      ],
    },
    {
      title: 'Return 0 whenever an input is zero',
      explanation: [
        'The only common multiple of 0 and another number is 0, so lcm(a, 0) is defined as 0. Return it before dividing.',
        'The early return matters most for (0, 0): its gcd is 0, and dividing by it would raise ZeroDivisionError.',
      ],
      example: {
        code: `def lcm_from_gcd(a, b, divisor):
    if a == 0 or b == 0:
        return 0
    return abs((a // divisor) * b)

print(lcm_from_gcd(0, 15, 15))
print(lcm_from_gcd(0, 0, 0))`,
        output: '0\n0',
        explanation:
          'Both calls return before the division, so the zero gcd of (0, 0) is never used as a divisor.',
      },
      questions: [
        choose(
          'Without the zero check, what does lcm_from_gcd(0, 0, 0) do?',
          [
            'It returns 0, since 0 // 0 is treated as 0',
            'It raises ZeroDivisionError when dividing by the gcd 0',
            'It returns 1, the identity for multiplication',
            'It loops forever looking for a common multiple',
          ],
          1,
          '0 // 0 is a division by zero, which Python rejects.',
        ),
        typeOutput(
          'What does this program print?',
          `def lcm_from_gcd(a, b, divisor):
    if a == 0 or b == 0:
        return 0
    return abs((a // divisor) * b)

print(lcm_from_gcd(0, 0, 0), lcm_from_gcd(-7, 0, 7))`,
          '0 0',
          'Either input being zero returns 0 immediately.',
        ),
        choose(
          'Why is lcm(0, 15) defined as 0?',
          [
            '15 divides 0, so the answer is 15',
            'It avoids negative values',
            '0 is the only common multiple of 0 and 15',
            'The gcd is 0',
          ],
          2,
          'Every multiple of 0 is 0, so no positive common multiple exists.',
        ),
        typeOutput(
          'What does this program print?',
          `def lcm_from_gcd(a, b, divisor):
    if a == 0 or b == 0:
        return 0
    return abs((a // divisor) * b)

print(lcm_from_gcd(5, 0, 5), lcm_from_gcd(-6, -4, 2))`,
          '0 12',
          'The zero input gives 0. -6 // 2 = -3, times -4 is 12.',
        ),
      ],
    },
  ],

  'cp-gcd': [
    {
      title: 'Loop Euclid’s step until the remainder is zero',
      explanation: [
        'Repeat (x, y) = (y, x % y) while y is nonzero. Each step keeps the gcd unchanged, and y shrinks every time, so the loop ends with y = 0. Then gcd(x, 0) = x, so x is the answer.',
        'The number of steps is O(log(max(a, b))): even numbers near 10^18 need fewer than 100 steps.',
      ],
      example: {
        code: `def gcd(a, b):
    x, y = abs(a), abs(b)
    while y:
        x, y = y, x % y
        print(x, y)
    return x

print(gcd(252, 105))`,
        output: '105 42\n42 21\n21 0\n21',
        explanation:
          '252 % 105 = 42, 105 % 42 = 21, and 42 % 21 = 0, leaving 21.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          `def gcd(a, b):
    x, y = abs(a), abs(b)
    while y:
        x, y = y, x % y
    return x

print(gcd(84, 120))`,
          '12',
          'The pairs are (120, 84), (84, 36), (36, 12), (12, 0).',
        ),
        typeOutput(
          'What does this program print?',
          `x, y = 13, 8
steps = 0
while y:
    x, y = y, x % y
    steps += 1
print(x, steps)`,
          '1 5',
          'The pairs are (8, 5), (5, 3), (3, 2), (2, 1), (1, 0): five steps to reach gcd 1.',
        ),
        choose(
          'When y becomes 0, why is x the gcd?',
          [
            'Another step would divide by zero, so x is final',
            'x is then always 1, the smallest divisor',
            'gcd(x, 0) = x, and every step kept the gcd unchanged',
            'The pair starts repeating, so x is a fixed point',
          ],
          2,
          'x divides itself and 0, and nothing larger divides x.',
        ),
        choose(
          'About how many remainder steps does Euclid need for numbers near 10^18?',
          [
            'About 10^9, the square root of the input',
            'Fewer than about 90, since it is logarithmic',
            'About 10^18, one step per unit of the input',
            'Exactly 2, one step per argument',
          ],
          1,
          'Remainders shrink at least as fast as Fibonacci numbers fall, so the step count is O(log n).',
        ),
      ],
    },
    {
      title: 'Normalize signs and zeros first',
      explanation: [
        'Common divisors ignore sign, so take abs of both inputs before the loop. Without it, Python’s % with a negative divisor can leave a negative result.',
        'Zeros need no special case in the loop: gcd(a, 0) = |a|, and gcd(0, 0) is defined as 0 because every positive integer divides 0, so there is no largest one.',
      ],
      example: {
        code: `def gcd(a, b):
    x, y = abs(a), abs(b)
    while y:
        x, y = y, x % y
    return x

print(gcd(-12, 18), gcd(0, -7), gcd(0, 0))`,
        output: '6 7 0',
        explanation:
          'Signs are removed first. With a zero input the loop runs at most once, leaving the other absolute value.',
      },
      questions: [
        typeOutput(
          'This version skips abs. What does it print?',
          `def gcd_raw(a, b):
    while b:
        a, b = b, a % b
    return a

print(gcd_raw(12, -18))`,
          '-6',
          '12 % -18 is -6 in Python, and the loop ends at -6, a negative "gcd".',
        ),
        typeOutput(
          'What does this program print?',
          `def gcd(a, b):
    x, y = abs(a), abs(b)
    while y:
        x, y = y, x % y
    return x

print(gcd(0, -7), gcd(0, 0))`,
          '7 0',
          'gcd(0, -7) is |-7| = 7. gcd(0, 0) is 0 by convention, and the loop never runs.',
        ),
        choose(
          'Why is gcd(0, 0) defined as 0 rather than as a largest common divisor?',
          [
            '0 is prime, so it has no larger divisor',
            'Every positive integer divides 0, so no largest one exists',
            'Otherwise the loop would run forever on (0, 0)',
            'Python cannot compute a gcd involving 0',
          ],
          1,
          'With no largest common divisor, 0 is the convention that keeps formulas like the lcm consistent.',
        ),
        typeOutput(
          'What does this program print?',
          `def gcd(a, b):
    x, y = abs(a), abs(b)
    while y:
        x, y = y, x % y
    return x

print(gcd(-8, -20))`,
          '4',
          'After abs, the pairs are (20, 8), (8, 4), (4, 0).',
        ),
      ],
    },
    {
      title: 'Derive the lcm from the gcd',
      explanation: [
        'Once the gcd g is known, lcm = |(a // g) × b| for nonzero a and b, and 0 if either is zero. For positive a and b this means gcd × lcm = a × b.',
        'Computing both in one function reuses the loop and keeps the zero cases in one place.',
      ],
      example: {
        code: `def gcd_lcm(a, b):
    x, y = abs(a), abs(b)
    while y:
        x, y = y, x % y
    multiple = 0 if a == 0 or b == 0 else abs((a // x) * b)
    return x, multiple

print(gcd_lcm(4, 6))
print(gcd_lcm(-9, 12))
print(gcd_lcm(0, 5))`,
        output: '(2, 12)\n(3, 36)\n(5, 0)',
        explanation:
          '4 // 2 × 6 = 12. -9 // 3 × 12 = -36, made nonnegative. A zero input gives lcm 0.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          `def gcd_lcm(a, b):
    x, y = abs(a), abs(b)
    while y:
        x, y = y, x % y
    multiple = 0 if a == 0 or b == 0 else abs((a // x) * b)
    return x, multiple

print(gcd_lcm(21, 6))`,
          '(3, 42)',
          'gcd(21, 6) = 3, and 21 // 3 × 6 = 42.',
        ),
        typeOutput(
          'What does this program print?',
          `def gcd_lcm(a, b):
    x, y = abs(a), abs(b)
    while y:
        x, y = y, x % y
    multiple = 0 if a == 0 or b == 0 else abs((a // x) * b)
    return x, multiple

print(gcd_lcm(10, 10), gcd_lcm(1, 9))`,
          '(10, 10) (1, 9)',
          'Equal numbers are their own gcd and lcm. 1 divides 9, so the lcm is 9.',
        ),
        choose(
          'For positive a and b, which identity holds?',
          [
            'gcd + lcm = a + b',
            'lcm = gcd²',
            'lcm = a + b - gcd',
            'gcd × lcm = a × b',
          ],
          3,
          'lcm = a × b / gcd, so multiplying back by the gcd gives the product.',
        ),
        typeOutput(
          'What does this program print?',
          `def gcd_lcm(a, b):
    x, y = abs(a), abs(b)
    while y:
        x, y = y, x % y
    multiple = 0 if a == 0 or b == 0 else abs((a // x) * b)
    return x, multiple

print(gcd_lcm(0, 0), gcd_lcm(-7, 0))`,
          '(0, 0) (7, 0)',
          'Both calls skip the division because an input is zero; the gcd of -7 and 0 is 7.',
        ),
      ],
    },
  ],

  'cp-modular-residue': [
    {
      title: 'Read a % m as a residue from 0 to m - 1',
      explanation: [
        'For a positive modulus m, Python’s a % m is always between 0 and m - 1, even when a is negative: -1 % 7 is 6, not -1.',
        'Two integers have the same residue exactly when their difference is a multiple of m. The residue names that whole class of numbers.',
      ],
      example: {
        code: `print(17 % 5, -17 % 5, -5 % 5)`,
        output: '2 3 0',
        explanation:
          '17 = 3 × 5 + 2. -17 = -4 × 5 + 3. -5 is an exact multiple of 5.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          `print(-1 % 7, -8 % 7, 15 % 7)`,
          '6 6 1',
          '-1 and -8 differ by 7, so they share residue 6. 15 = 2 × 7 + 1.',
        ),
        choose(
          'When do two integers have the same residue modulo m?',
          [
            'Only when they are equal integers',
            'When their sum is a multiple of m',
            'When their difference is a multiple of m',
            'When both are between 0 and m - 1',
          ],
          2,
          'Adding or subtracting multiples of m does not change the residue.',
        ),
        typeOutput(
          'What does this program print?',
          `print(23 % 10 == 3 % 10, -7 % 10 == 3 % 10)`,
          'True True',
          '23 - 3 = 20 and 3 - (-7) = 10 are both multiples of 10.',
        ),
        typeOutput(
          'What does this program print?',
          `print(12 % 1, -5 % 1)`,
          '0 0',
          'Every integer is a multiple of 1, so modulo 1 the only residue is 0.',
        ),
      ],
    },
    {
      title: 'Reduce operands before multiplying',
      explanation: [
        'Replacing a factor with its residue changes the product by a multiple of m, so (a % m) * (b % m) % m equals (a * b) % m. Reduce first to keep the numbers being multiplied below m.',
        'The final % m is still needed: the product of two residues can be as large as (m - 1)², well above m.',
      ],
      example: {
        code: `def product_residue(a, b, modulus):
    return (a % modulus) * (b % modulus) % modulus

print(product_residue(123, 456, 10))
print(123 * 456 % 10)`,
        output: '8\n8',
        explanation:
          'Only the last digits matter modulo 10: 3 × 6 = 18, which leaves 8, the same as the full product.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          `def product_residue(a, b, modulus):
    return (a % modulus) * (b % modulus) % modulus

print(product_residue(-3, 4, 7))`,
          '2',
          '-3 % 7 = 4, and 4 × 4 = 16 leaves 2, matching -12 % 7.',
        ),
        typeOutput(
          'What does this program print?',
          `def product_residue(a, b, modulus):
    return (a % modulus) * (b % modulus) % modulus

print(product_residue(10**30, 10**30, 9))`,
          '1',
          'Every power of 10 leaves 1 modulo 9, so the product leaves 1 × 1 = 1.',
        ),
        choose(
          'Why reduce the operands before multiplying?',
          [
            'It keeps intermediate values small without changing the residue',
            'It changes the residue to a smaller, simpler one',
            'It is needed only when an operand is negative',
            'It makes the modulus behave like a prime',
          ],
          0,
          'Reduction removes multiples of m, which never affect the final residue.',
        ),
        typeOutput(
          'What does this program print?',
          `print((6 % 7) * (5 % 7), (6 % 7) * (5 % 7) % 7)`,
          '30 2',
          'The product of residues is 30, which is not itself a residue; one more % 7 gives 2.',
        ),
      ],
    },
  ],

  'cp-modular-square-step': [
    {
      title: 'Move one base factor into the result when the exponent is odd',
      explanation: [
        'Fast exponentiation keeps a state (result, base, exponent) that stands for result × base^exponent mod m. Each step must keep that value unchanged.',
        'When the exponent is odd, base^e = base × base^(e - 1), so one factor moves into the result. The remaining even power can then be rewritten with a squared base.',
      ],
      example: {
        code: `def power_step(result, base, exponent, modulus):
    if exponent % 2:
        result = result * base % modulus
    else:
        result %= modulus
    return (result, base * base % modulus, exponent // 2)

print(power_step(1, 5, 3, 11))`,
        output: '(5, 3, 1)',
        explanation:
          'The odd exponent moves a 5 into the result. The base becomes 25 % 11 = 3, and 3 // 2 = 1.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          `def power_step(result, base, exponent, modulus):
    if exponent % 2:
        result = result * base % modulus
    else:
        result %= modulus
    return (result, base * base % modulus, exponent // 2)

print(power_step(1, 3, 6, 7))`,
          '(1, 2, 3)',
          'The exponent is even, so the result stays 1. The base becomes 9 % 7 = 2 and 6 halves to 3.',
        ),
        typeOutput(
          'What does this program print?',
          `def power_step(result, base, exponent, modulus):
    if exponent % 2:
        result = result * base % modulus
    else:
        result %= modulus
    return (result, base * base % modulus, exponent // 2)

print(power_step(2, 4, 3, 10))`,
          '(8, 6, 1)',
          'The odd exponent moves a 4 into the result: 2 × 4 = 8. The base becomes 16 % 10 = 6.',
        ),
        choose(
          'Modulo 13, which value does the state (result, base, exponent) = (3, 5, 4) stand for?',
          [
            '3 + 5 × 4 mod 13',
            '5^(3 × 4) mod 13',
            '(3 × 5)^4 mod 13',
            '3 × 5^4 mod 13',
          ],
          3,
          'The state always means result × base^exponent modulo m.',
        ),
        choose(
          'Why does an odd exponent move one base factor into the result before halving?',
          [
            'Odd exponents cannot be squared, so one factor is dropped',
            'base^e = base × (base²)^((e - 1) / 2), leaving one factor',
            'It keeps the result even, which squaring requires',
            'It resets the base to 1 before the next square',
          ],
          1,
          'Only an even exponent splits evenly into squares; the extra factor must go somewhere.',
        ),
      ],
    },
    {
      title: 'Square the base and halve the exponent',
      explanation: [
        'After any odd factor is moved, base^e with an even e equals (base²)^(e / 2). So the step replaces the base with base * base % m and the exponent with e // 2, and result × base^exponent keeps the same residue.',
        'Halving takes about log₂(e) steps to reach 0, instead of e multiplications.',
      ],
      example: {
        code: `def power_step(result, base, exponent, modulus):
    if exponent % 2:
        result = result * base % modulus
    else:
        result %= modulus
    return (result, base * base % modulus, exponent // 2)

state = (1, 3, 5)
print(state[0] * state[1] ** state[2] % 7)
state = power_step(state[0], state[1], state[2], 7)
print(state, state[0] * state[1] ** state[2] % 7)`,
        output: '5\n(3, 2, 2) 5',
        explanation:
          '3^5 = 243 leaves 5 modulo 7. After the step, 3 × 2² = 12 also leaves 5: the represented value is unchanged.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          `def power_step(result, base, exponent, modulus):
    if exponent % 2:
        result = result * base % modulus
    else:
        result %= modulus
    return (result, base * base % modulus, exponent // 2)

state = (1, 2, 5)
state = power_step(state[0], state[1], state[2], 13)
state = power_step(state[0], state[1], state[2], 13)
state = power_step(state[0], state[1], state[2], 13)
print(state)`,
          '(6, 9, 0)',
          'The states are (2, 4, 2), (2, 3, 1), then (6, 9, 0). With exponent 0 the result 6 is 2^5 = 32 modulo 13.',
        ),
        choose(
          'Starting from exponent 13 and halving with //, which exponents does the process see?',
          [
            '13, 6.5, 3.25, ...',
            '13, 12, 11, ..., 0',
            '13, 6, 3, 1, 0',
            '13, 7, 4, 2, 1',
          ],
          2,
          'Floor division drops the remainder each time; the dropped 1 is what the odd case handled.',
        ),
        typeOutput(
          'What does this program print?',
          `def power_step(result, base, exponent, modulus):
    if exponent % 2:
        result = result * base % modulus
    else:
        result %= modulus
    return (result, base * base % modulus, exponent // 2)

print(power_step(9, -3, 4, 5))`,
          '(4, 4, 2)',
          'The even case reduces 9 to 4. (-3)² = 9 leaves 4 modulo 5.',
        ),
        typeNumber(
          'How many halving steps take exponent 1000 down to 0?',
          10,
          '1000, 500, 250, 125, 62, 31, 15, 7, 3, 1, 0: ten steps, about log₂(1000).',
        ),
      ],
    },
  ],

  'cp-modular-inverse-condition': [
    {
      title: 'An inverse exists exactly when gcd(b, m) = 1',
      explanation: [
        'An inverse of b modulo m is an x with b × x % m == 1. If b and m share a factor d > 1, every b × x and every multiple of m are multiples of d, so b × x can never leave remainder 1.',
        'When gcd(b, m) = 1, an inverse always exists, even for a composite modulus. math.gcd checks the condition directly.',
      ],
      example: {
        code: `from math import gcd

def has_modular_inverse(value, modulus):
    return gcd(value, modulus) == 1

print(has_modular_inverse(7, 12), has_modular_inverse(8, 12))
print(7 * 7 % 12)`,
        output: 'True False\n1',
        explanation:
          '7 is coprime to 12, and indeed 7 × 7 = 49 leaves 1. 8 shares the factor 4 with 12.',
      },
      questions: [
        typeOutput(
          'This program searches for inverses of 3 and 4 modulo 10. What does it print?',
          `found3 = []
found4 = []
x = 0
while x < 10:
    if 3 * x % 10 == 1:
        found3.append(x)
    if 4 * x % 10 == 1:
        found4.append(x)
    x += 1
print(found3, found4)`,
          '[7] []',
          '3 × 7 = 21 leaves 1. Every multiple of 4 is even, so it never leaves 1 modulo 10.',
        ),
        typeOutput(
          'What does this program print?',
          `from math import gcd

def has_modular_inverse(value, modulus):
    return gcd(value, modulus) == 1

print(has_modular_inverse(9, 20), has_modular_inverse(15, 20))`,
          'True False',
          '9 and 20 share no factor. 15 and 20 share 5.',
        ),
        choose(
          'Modulus 9 is composite. Which value has an inverse modulo 9?',
          ['3', '6', '0', '4'],
          3,
          'gcd(4, 9) = 1, and 4 × 7 = 28 leaves 1. 3, 6, and 0 share the factor 3 with 9.',
        ),
        choose(
          'Why can 6 not have an inverse modulo 15?',
          [
            '6 is even, and 15 is odd',
            'They share the factor 3, so 6x mod 15 is a multiple of 3',
            '15 is composite, so no value is invertible',
            '6 is less than half of 15',
          ],
          1,
          'A remainder that is always a multiple of 3 can never be 1.',
        ),
      ],
    },
    {
      title: 'Do not assume the modulus is prime',
      explanation: [
        'For a prime modulus, every residue except 0 is invertible. For a composite modulus, only the residues coprime to it are, so the gcd test is the general rule.',
        'math.gcd ignores signs, so negative values work, and 0 is never invertible because gcd(0, m) = m. A shortcut that is valid only for primes cannot replace the gcd condition.',
      ],
      example: {
        code: `from math import gcd

units = []
for value in [0, 1, 2, 3, 4, 5, 6, 7]:
    if gcd(value, 8) == 1:
        units.append(value)
print(units)`,
        output: '[1, 3, 5, 7]',
        explanation:
          'Modulo 8, the odd residues are invertible and the even ones share the factor 2.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          `from math import gcd

units = []
for value in [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]:
    if gcd(value, 10) == 1:
        units.append(value)
print(units)`,
          '[1, 3, 7, 9]',
          'Residues sharing 2 or 5 with 10 are excluded, including 5.',
        ),
        typeOutput(
          'What does this program print?',
          `from math import gcd

def has_modular_inverse(value, modulus):
    return gcd(value, modulus) == 1

print(has_modular_inverse(-3, 10), has_modular_inverse(0, 7))`,
          'True False',
          'gcd(-3, 10) = 1, so -3 is invertible (its residue is 7). gcd(0, 7) = 7.',
        ),
        choose(
          'Modulus 13 is prime. Which residues have inverses?',
          [
            'Only 1',
            'Every residue, including 0',
            'Every residue except 0',
            'Only odd residues',
          ],
          2,
          'A prime shares no factor with 1 through 12, but gcd(0, 13) = 13.',
        ),
        choose(
          'A solution divides by b modulo m by computing pow(b, m - 2, m) for every m. When can that be wrong?',
          [
            'When m is not prime, or b is a multiple of m',
            'Only when b is negative or zero',
            'Never; it works for every modulus',
            'Only when m is even and b is odd',
          ],
          0,
          'That formula comes from Fermat’s little theorem, which needs a prime modulus and b not divisible by it.',
        ),
      ],
    },
  ],

  'cp-modular': [
    {
      title: 'Exponentiate by repeated squaring',
      explanation: [
        'Start with result = 1, the base reduced modulo m, and the full exponent. While the exponent is nonzero, move one base factor into the result if the exponent is odd, then square the base and halve the exponent.',
        'The invariant result × base^exponent ≡ original_base^original_exponent (mod m) holds after every iteration, and the loop runs O(log e) times.',
      ],
      example: {
        code: `def mod_power(base, exponent, modulus):
    result = 1 % modulus
    base %= modulus
    while exponent:
        if exponent % 2:
            result = result * base % modulus
        base = base * base % modulus
        exponent //= 2
        print(result, base, exponent)
    return result

print(mod_power(3, 13, 7))`,
        output: '3 2 6\n3 4 3\n5 2 1\n3 4 0\n3',
        explanation:
          '13 is 1101 in binary, so factors are moved in at the steps where the exponent is odd. Four iterations replace twelve multiplications.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          `def mod_power(base, exponent, modulus):
    result = 1 % modulus
    base %= modulus
    while exponent:
        if exponent % 2:
            result = result * base % modulus
        base = base * base % modulus
        exponent //= 2
    return result

print(mod_power(2, 10, 1000))`,
          '24',
          '2^10 = 1024, which leaves 24 modulo 1000.',
        ),
        typeOutput(
          'What does this program print?',
          `def mod_power(base, exponent, modulus):
    result = 1 % modulus
    base %= modulus
    while exponent:
        if exponent % 2:
            result = result * base % modulus
        base = base * base % modulus
        exponent //= 2
    return result

print(mod_power(5, 3, 13))`,
          '8',
          '5^3 = 125 = 9 × 13 + 8.',
        ),
        choose(
          'About how many loop iterations does mod_power take for exponent 10^18?',
          ['About 10^9', 'About 18', 'About 10^18', 'About 60'],
          3,
          'Each iteration halves the exponent, and log₂(10^18) is about 60.',
        ),
        choose(
          'Which invariant does each iteration keep?',
          [
            'result ≡ base^(original_exponent - exponent) (mod m)',
            'result × base^exponent ≡ original_base^original_exponent (mod m)',
            'result × exponent ≡ original_base × original_exponent',
            'base^exponent ≡ original_base^original_exponent (mod m)',
          ],
          1,
          'Moving a factor and squaring the base both preserve the represented power.',
        ),
      ],
    },
    {
      title: 'Get the empty product, modulus 1, and negative bases right',
      explanation: [
        'Exponent 0 is the empty product, so the answer is 1, even for base 0. Start the result at 1 % m, not 1: when m = 1 the only residue is 0, and the loop never runs to fix a wrong starting value.',
        'Reducing the base first turns a negative base into its residue, so every later product stays in range.',
      ],
      example: {
        code: `def mod_power(base, exponent, modulus):
    result = 1 % modulus
    base %= modulus
    while exponent:
        if exponent % 2:
            result = result * base % modulus
        base = base * base % modulus
        exponent //= 2
    return result

print(mod_power(0, 0, 7), mod_power(9, 0, 1), mod_power(-2, 3, 5))`,
        output: '1 0 2',
        explanation:
          '0^0 is the empty product 1. Modulo 1 everything is 0. (-2)^3 = -8 leaves 2 modulo 5.',
      },
      questions: [
        typeOutput(
          'The first function starts its result at 1. What does this program print?',
          `def starts_at_one(base, exponent, modulus):
    result = 1
    base %= modulus
    while exponent:
        if exponent % 2:
            result = result * base % modulus
        base = base * base % modulus
        exponent //= 2
    return result

def mod_power(base, exponent, modulus):
    result = 1 % modulus
    base %= modulus
    while exponent:
        if exponent % 2:
            result = result * base % modulus
        base = base * base % modulus
        exponent //= 2
    return result

print(starts_at_one(5, 0, 1), mod_power(5, 0, 1))`,
          '1 0',
          'With exponent 0 the loop never runs, so the first version returns 1, which is not a residue modulo 1.',
        ),
        typeOutput(
          'What does this program print?',
          `def mod_power(base, exponent, modulus):
    result = 1 % modulus
    base %= modulus
    while exponent:
        if exponent % 2:
            result = result * base % modulus
        base = base * base % modulus
        exponent //= 2
    return result

print(mod_power(-3, 3, 10))`,
          '3',
          '-3 becomes 7, and 7^3 = 343 leaves 3, matching -27 % 10.',
        ),
        typeOutput(
          'What does this program print?',
          `def mod_power(base, exponent, modulus):
    result = 1 % modulus
    base %= modulus
    while exponent:
        if exponent % 2:
            result = result * base % modulus
        base = base * base % modulus
        exponent //= 2
    return result

print(mod_power(0, 0, 7), mod_power(7, 3, 7), mod_power(8, 3, 7))`,
          '1 0 1',
          '0^0 is 1. 7 is 0 modulo 7. 8 is 1 modulo 7, so 8^3 leaves 1.',
        ),
        choose(
          'Why initialize the result to 1 % modulus instead of 1?',
          [
            'To make negative bases positive before the loop',
            'To skip the loop when the exponent is odd',
            '1 is not a valid residue for any modulus',
            'Modulo 1 every residue is 0, so exponent 0 must return 0',
          ],
          3,
          '1 % 1 is 0, the correct answer for every power modulo 1.',
        ),
      ],
    },
    {
      title: 'Divide only by invertible values',
      explanation: [
        'Modular division multiplies by an inverse, which exists only when gcd(b, m) = 1. Python’s pow(b, -1, m) returns that inverse for coprime inputs.',
        'The shortcut pow(b, p - 2, p) gives the inverse only for a prime p that does not divide b. For a composite modulus it is not guaranteed to return an inverse.',
      ],
      example: {
        code: `from math import gcd

b, m = 7, 12
if gcd(b, m) == 1:
    inverse = pow(b, -1, m)
    print(inverse, b * inverse % m)`,
        output: '7 1',
        explanation:
          'gcd(7, 12) = 1, so the inverse exists. Here 7 is its own inverse, since 49 leaves 1 modulo 12.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          `print(pow(3, -1, 11), 3 * pow(3, -1, 11) % 11)`,
          '4 1',
          '3 × 4 = 12 leaves 1 modulo 11, so 4 is the inverse of 3.',
        ),
        typeOutput(
          'Modulus 12 is composite. What does this program print?',
          `print(pow(5, 12 - 2, 12), pow(5, -1, 12))`,
          '1 5',
          'The prime-only shortcut gives 1, but 5 × 1 is not 1 modulo 12. The real inverse is 5, since 25 leaves 1.',
        ),
        choose(
          'To compute (a / b) mod m, which condition must hold?',
          [
            'm must be prime',
            'b < m',
            'gcd(b, m) = 1',
            'a must be divisible by b as integers',
          ],
          2,
          'Division means multiplying by b’s inverse, which exists exactly when b and m are coprime.',
        ),
        choose(
          'When does pow(b, p - 2, p) give b’s inverse modulo p?',
          [
            'When p is prime and b is not a multiple of p',
            'For every modulus p, prime or composite',
            'When b is even and p is odd',
            'When b > p, so the exponent stays positive',
          ],
          0,
          'The shortcut relies on Fermat’s little theorem, which needs a prime p not dividing b.',
        ),
      ],
    },
  ],

  'cp-sieve-candidate-table': [
    {
      title: 'Give every integer from 0 to the limit its own entry',
      explanation: [
        'A sieve table is a list of booleans where index n says whether n is still a prime candidate. To include the limit itself, the table needs limit + 1 entries.',
        'Every entry starts as True. A True entry means "not ruled out yet", not "prime": later marking removes the composites.',
      ],
      example: {
        code: `def prime_candidates(limit):
    table = [True] * (limit + 1)
    table[0] = False
    if limit >= 1:
        table[1] = False
    return table

table = prime_candidates(6)
print(table)
print(len(table))`,
        output: '[False, False, True, True, True, True, True]\n7',
        explanation:
          'Indices 0 through 6 give seven entries. 4 and 6 are still candidates until marking runs.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          `def prime_candidates(limit):
    table = [True] * (limit + 1)
    table[0] = False
    if limit >= 1:
        table[1] = False
    return table

table = prime_candidates(4)
print(len(table), table[4])`,
          '5 True',
          'Five entries cover 0 through 4, and 4 has not been ruled out yet.',
        ),
        choose(
          'In table = prime_candidates(limit), what does table[9] describe?',
          [
            'The ninth prime',
            'Whether 9 is still a prime candidate',
            'The number of primes up to 9',
            'Whether 10 is prime',
          ],
          1,
          'The index is the number itself, and the entry is its candidate status.',
        ),
        choose(
          'Why does the table for limit 30 need 31 entries?',
          [
            'One extra entry stores the count of primes',
            'Primes start at 1',
            'The last entry is a sentinel',
            'Indices run from 0 to 30 inclusive',
          ],
          3,
          'Index 30 must exist so that 30 itself can be tested.',
        ),
        typeOutput(
          'What does this program print?',
          `def prime_candidates(limit):
    table = [True] * (limit + 1)
    table[0] = False
    if limit >= 1:
        table[1] = False
    return table

count = 0
for flag in prime_candidates(10):
    if flag:
        count += 1
print(count)`,
          '9',
          'Before marking, every number from 2 to 10 is a candidate; only 4 of them will turn out prime.',
        ),
      ],
    },
    {
      title: 'Exclude 0 and 1, and guard tiny limits',
      explanation: [
        'Primes are greater than 1, so entries 0 and 1 are set to False before any marking. Every other entry stays True for now.',
        'For limit 0 the table has only index 0, so writing table[1] would raise IndexError. Check limit >= 1 first.',
      ],
      example: {
        code: `def prime_candidates(limit):
    table = [True] * (limit + 1)
    table[0] = False
    if limit >= 1:
        table[1] = False
    return table

print(prime_candidates(0))
print(prime_candidates(1))`,
        output: '[False]\n[False, False]',
        explanation:
          'Limit 0 has a single entry. Limit 1 has entries for 0 and 1, both excluded.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          `def prime_candidates(limit):
    table = [True] * (limit + 1)
    table[0] = False
    if limit >= 1:
        table[1] = False
    return table

print(prime_candidates(3))`,
          '[False, False, True, True]',
          'Four entries cover 0 through 3; 0 and 1 are excluded, 2 and 3 remain.',
        ),
        choose(
          'Why check limit >= 1 before writing table[1]?',
          [
            'Index 1 is always prime and stays True',
            'To skip even numbers when the limit is small',
            'For limit 0 the table has only index 0',
            'table[1] cannot be changed after creation',
          ],
          2,
          'A one-entry list has no index 1, so the assignment would fail.',
        ),
        choose(
          'prime_candidates(9)[9] is True. What does that mean?',
          [
            '9 is prime, since it passed the table check',
            '9 has not been ruled out yet; marking will remove it',
            'The table is wrong, since 9 = 3 × 3',
            '9 is the limit, so it is never marked',
          ],
          1,
          'The candidate table is only the starting point; composites are marked later.',
        ),
        typeOutput(
          'What does this program print?',
          `def prime_candidates(limit):
    table = [True] * (limit + 1)
    table[0] = False
    if limit >= 1:
        table[1] = False
    return table

print(prime_candidates(2))`,
          '[False, False, True]',
          'Three entries cover 0 through 2, and 2 is the first candidate.',
        ),
      ],
    },
  ],

  'cp-sieve-square-start': [
    {
      title: 'Begin a prime’s marking at p × p',
      explanation: [
        'A composite multiple k × p with k < p has a prime factor smaller than p, so an earlier pass already marked it. The first multiple that only p can be responsible for is p × p.',
        'Starting at p × p instead of 2p gives the same result with less work.',
      ],
      example: {
        code: `def square_multiples(prime, limit):
    return list(range(prime * prime, limit + 1, prime))

print(square_multiples(5, 40))`,
        output: '[25, 30, 35, 40]',
        explanation:
          '10, 15, and 20 were already marked by 2 or 3, so the pass for 5 starts at 25.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          `def square_multiples(prime, limit):
    return list(range(prime * prime, limit + 1, prime))

print(square_multiples(7, 70))`,
          '[49, 56, 63, 70]',
          'The pass starts at 49 and steps by 7 up to and including 70.',
        ),
        choose(
          'When the sieve reaches p = 5, why is 15 already marked?',
          [
            '15 = 3 × 5 was marked during the pass for 3',
            '15 is prime, so it was never a candidate',
            '15 is larger than 5², so the pass skips it',
            'The pass for 5 starts at 15 and marks it',
          ],
          0,
          'Every multiple of 5 below 25 has a factor 2 or 3, handled by earlier passes.',
        ),
        typeOutput(
          'Starting at 2p also works but repeats work. What does this program print?',
          `print(list(range(2 * 3, 16, 3)), list(range(3 * 3, 16, 3)))`,
          '[6, 9, 12, 15] [9, 12, 15]',
          '6 is already marked by 2, so starting at 9 skips one redundant write.',
        ),
        typeNumber(
          'For prime p = 11, which number is the first one its pass must mark?',
          121,
          'Smaller multiples of 11 have a factor below 11, so 11 × 11 = 121 is the first new one.',
        ),
      ],
    },
    {
      title: 'Step by p and include the limit',
      explanation: [
        'Consecutive multiples of p differ by p, so the range steps by p. range excludes its stop, so the stop must be limit + 1 to include the limit itself.',
        'If p × p is already above the limit, the range is empty, and the pass marks nothing.',
      ],
      example: {
        code: `def square_multiples(prime, limit):
    return list(range(prime * prime, limit + 1, prime))

print(square_multiples(5, 25))
print(square_multiples(5, 24))`,
        output: '[25]\n[]',
        explanation:
          'With limit 25 the square itself is included. With limit 24 the pass starts beyond the limit.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          `print(list(range(4, 12, 2)), list(range(4, 12 + 1, 2)))`,
          '[4, 6, 8, 10] [4, 6, 8, 10, 12]',
          'The stop is excluded, so only the second range reaches 12.',
        ),
        typeOutput(
          'What does this program print?',
          `def square_multiples(prime, limit):
    return list(range(prime * prime, limit + 1, prime))

print(square_multiples(2, 9))`,
          '[4, 6, 8]',
          'Starting at 4 and stepping by 2, the next value 10 would pass the limit 9.',
        ),
        choose(
          'A pass for p = 3 uses step 1 instead of 3. What goes wrong?',
          [
            'It skips 9 and starts marking at 10',
            'It marks every number from 9 up, including primes like 11',
            'It marks nothing, since the step is too small',
            'It marks only the even numbers from 9 up',
          ],
          1,
          'Only multiples of 3 should be marked; a step of 1 visits every number.',
        ),
        typeOutput(
          'What does this program print?',
          `def square_multiples(prime, limit):
    return list(range(prime * prime, limit + 1, prime))

print(square_multiples(11, 100))`,
          '[]',
          '121 is already above 100, so the range is empty.',
        ),
      ],
    },
  ],

  'cp-sieve-factor-bound': [
    {
      title: 'Every composite up to n has a factor at most √n',
      explanation: [
        'If n = a × b with both a and b greater than √n, then a × b > n, a contradiction. So a composite n has a factor no larger than √n.',
        'That is why searching for factors, or running sieve passes, can stop once p × p exceeds n: a number with no factor up to √n is prime.',
      ],
      example: {
        code: `def smallest_factor(n):
    candidate = 2
    while candidate * candidate <= n:
        if n % candidate == 0:
            return candidate
        candidate += 1
    return n

print(smallest_factor(91))
print(smallest_factor(97))`,
        output: '7\n97',
        explanation:
          '91 = 7 × 13 is found by 7, below √91 ≈ 9.5. 97 has no factor up to 9, so it is prime and returns itself.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          `def smallest_factor(n):
    candidate = 2
    while candidate * candidate <= n:
        if n % candidate == 0:
            return candidate
        candidate += 1
    return n

print(smallest_factor(221))`,
          '13',
          '221 = 13 × 17, and 13 × 13 = 169 is still within the bound.',
        ),
        typeOutput(
          'What does this program print?',
          `def smallest_factor(n):
    candidate = 2
    while candidate * candidate <= n:
        if n % candidate == 0:
            return candidate
        candidate += 1
    return n

print(smallest_factor(49), smallest_factor(53))`,
          '7 53',
          '7 × 7 = 49 is included by <=. 53 has no factor up to 7, so it is prime.',
        ),
        choose(
          'Suppose 100 = a × b with both a and b greater than 10. What follows?',
          [
            'a or b must be prime',
            'a = b',
            'a × b > 100, a contradiction',
            'Nothing; such factors are common',
          ],
          2,
          'Two factors above √100 multiply to more than 100.',
        ),
        typeNumber(
          'To find every prime up to 1,000,000, up to which candidate are sieve passes needed?',
          1000,
          '√1,000,000 = 1,000; every composite up to the limit has a factor at most 1,000.',
        ),
      ],
    },
    {
      title: 'Compare squares as integers',
      explanation: [
        'Write the bound as candidate * candidate <= limit. Integer multiplication is exact, and <= includes a candidate whose square equals the limit, such as 7 for 49.',
        'A floating-point square root can round slightly below the true root for large numbers, so the integer comparison is the safer test.',
      ],
      example: {
        code: `def sieve_factor_candidates(limit):
    result = []
    candidate = 2
    while candidate * candidate <= limit:
        result.append(candidate)
        candidate += 1
    return result

print(sieve_factor_candidates(49))
print(sieve_factor_candidates(48))`,
        output: '[2, 3, 4, 5, 6, 7]\n[2, 3, 4, 5, 6]',
        explanation: '7 × 7 = 49 is within the first bound but not the second.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          `def sieve_factor_candidates(limit):
    result = []
    candidate = 2
    while candidate * candidate <= limit:
        result.append(candidate)
        candidate += 1
    return result

print(sieve_factor_candidates(35))`,
          '[2, 3, 4, 5]',
          '5 × 5 = 25 <= 35, while 6 × 6 = 36 is too large.',
        ),
        typeOutput(
          'What does this program print?',
          `def sieve_factor_candidates(limit):
    result = []
    candidate = 2
    while candidate * candidate <= limit:
        result.append(candidate)
        candidate += 1
    return result

print(sieve_factor_candidates(8), sieve_factor_candidates(9))`,
          '[2] [2, 3]',
          '3 × 3 = 9 exceeds 8 but equals 9, so only the second list includes 3.',
        ),
        choose(
          'Why write candidate * candidate <= limit instead of candidate <= limit ** 0.5?',
          [
            'Integer products are exact; a float root can round down',
            'It is the only way to write a while loop',
            'Floats cannot be compared with integers',
            'It excludes the square root itself from the bound',
          ],
          0,
          'An exact integer test never loses the boundary candidate to rounding.',
        ),
        typeOutput(
          'What does this program print?',
          `candidate = 2
while (candidate + 1) * (candidate + 1) <= 30:
    candidate += 1
print(candidate)`,
          '5',
          '5 × 5 = 25 fits within 30, but 6 × 6 = 36 does not.',
        ),
      ],
    },
  ],

  'cp-sieve': [
    {
      title: 'Mark the multiples of each remaining prime',
      explanation: [
        'Scan p upward. If table[p] is still True, p is prime, so mark p × p, p × p + p, and so on as composite. If table[p] is False, p is composite and its multiples are already marked by its prime factors.',
        'After the scan, the True entries are exactly the primes, collected in increasing order.',
      ],
      example: {
        code: `def primes_up_to(limit):
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

print(primes_up_to(30))`,
        output: '[2, 3, 5, 7, 11, 13, 17, 19, 23, 29]',
        explanation:
          'Passes for 2, 3, and 5 remove every composite up to 30; 4 is skipped because it is already marked.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
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

print(primes_up_to(25))`,
          '[2, 3, 5, 7, 11, 13, 17, 19, 23]',
          'The pass for 5 starts at 25 and marks it; 1 was excluded from the start.',
        ),
        typeOutput(
          'What does this program print?',
          `limit = 50
prime = [True] * (limit + 1)
prime[0] = prime[1] = False
processed = []
p = 2
while p * p <= limit:
    if prime[p]:
        processed.append(p)
        for multiple in range(p * p, limit + 1, p):
            prime[multiple] = False
    p += 1
print(processed)`,
          '[2, 3, 5, 7]',
          'p runs up to 7, since 7 × 7 = 49 <= 50. 4 and 6 are skipped because they are already marked.',
        ),
        choose(
          'When p = 4 comes up, prime[4] is False. Why skip its marking pass?',
          [
            '4 is a perfect square, so its pass is redundant',
            '4 × 4 always exceeds the limit at that point',
            'Every multiple of 4 is a multiple of 2, already marked',
            'Multiples of 4 were never candidates at all',
          ],
          2,
          'A composite p’s multiples all share its smaller prime factors, which have already been processed.',
        ),
        typeOutput(
          'What does this program print?',
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

print(len(primes_up_to(100)))`,
          '25',
          'There are 25 primes up to 100, the last being 97.',
        ),
      ],
    },
    {
      title: 'Stop at √n and start at p²',
      explanation: [
        'The outer loop needs only p with p × p <= n, because any composite up to n has a prime factor at most √n. Using < instead of <= skips the pass for p = √n and leaves p² unmarked when n is a perfect square.',
        'Starting each pass at p × p rather than 2p does not change the result; it only skips multiples that smaller primes already marked.',
      ],
      example: {
        code: `def primes_up_to(limit):
    prime = [True] * (limit + 1)
    prime[0] = prime[1] = False
    p = 2
    while p * p <= limit:
        if prime[p]:
            for multiple in range(p * p, limit + 1, p):
                prime[multiple] = False
        p += 1
    return [value for value in range(2, limit + 1) if prime[value]]

def primes_strict(limit):
    prime = [True] * (limit + 1)
    prime[0] = prime[1] = False
    p = 2
    while p * p < limit:
        if prime[p]:
            for multiple in range(p * p, limit + 1, p):
                prime[multiple] = False
        p += 1
    return [value for value in range(2, limit + 1) if prime[value]]

print(primes_up_to(49)[-3:])
print(primes_strict(49)[-3:])`,
        output: '[41, 43, 47]\n[43, 47, 49]',
        explanation:
          'With <, the loop stops before p = 7, so 49 = 7 × 7 is never marked and is reported as prime.',
      },
      questions: [
        typeOutput(
          'This version uses < in the outer loop. What does it print?',
          `def primes_strict(limit):
    prime = [True] * (limit + 1)
    prime[0] = prime[1] = False
    p = 2
    while p * p < limit:
        if prime[p]:
            for multiple in range(p * p, limit + 1, p):
                prime[multiple] = False
        p += 1
    return [value for value in range(2, limit + 1) if prime[value]]

print(primes_strict(25)[-2:])`,
          '[23, 25]',
          'The loop stops at p = 4, so the pass for 5 never marks 25.',
        ),
        typeOutput(
          'This program counts marking writes when passes start at p² and at 2p. What does it print?',
          `def count_marks(limit, start_at_square):
    prime = [True] * (limit + 1)
    marks = 0
    p = 2
    while p * p <= limit:
        if prime[p]:
            start = p * p if start_at_square else 2 * p
            for multiple in range(start, limit + 1, p):
                prime[multiple] = False
                marks += 1
        p += 1
    return marks

print(count_marks(30, True), count_marks(30, False))`,
          '24 28',
          'Starting at 2p rewrites 6, 10, 15, and 20, which earlier passes had already marked.',
        ),
        typeNumber(
          'n = 120. What is the largest p whose marking pass runs?',
          7,
          '7 × 7 = 49 <= 120 and 11 × 11 = 121 > 120; 8, 9, and 10 are composite, so they are skipped.',
        ),
        choose(
          'A number q <= n survives every pass for primes p <= √n. Why must q be prime?',
          [
            'A composite q has a prime factor <= √n, so some pass marked it',
            'Every survivor is odd, and odd numbers above 2 are prime',
            'q is larger than √n, so no smaller number divides it',
            'The passes never mark primes, so unmarked means prime',
          ],
          0,
          'The factor bound guarantees some pass reaches every composite.',
        ),
      ],
    },
    {
      title: 'Build one table for many bounded queries',
      explanation: [
        'The sieve does O(n log log n) marking work and stores O(n) booleans. Once built, the table answers "is q prime?" for any q <= n with a single lookup, so it pays off when there are many queries.',
        'Limits below 2 have no primes. For a single huge number, a table up to that number would be far too large; test it directly instead.',
      ],
      example: {
        code: `def prime_table(limit):
    prime = [True] * (limit + 1)
    prime[0] = False
    if limit >= 1:
        prime[1] = False
    p = 2
    while p * p <= limit:
        if prime[p]:
            for multiple in range(p * p, limit + 1, p):
                prime[multiple] = False
        p += 1
    return prime

table = prime_table(100)
print([q for q in [1, 2, 51, 97] if table[q]])`,
        output: '[2, 97]',
        explanation:
          'One table answers all four queries. 1 is not prime and 51 = 3 × 17.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
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

print(primes_up_to(0), primes_up_to(3))`,
          '[] [2, 3]',
          'Limits below 2 return immediately. The bound 3 is inclusive.',
        ),
        typeOutput(
          'What does this program print?',
          `def prime_table(limit):
    prime = [True] * (limit + 1)
    prime[0] = False
    if limit >= 1:
        prime[1] = False
    p = 2
    while p * p <= limit:
        if prime[p]:
            for multiple in range(p * p, limit + 1, p):
                prime[multiple] = False
        p += 1
    return prime

table = prime_table(100)
print([q for q in [0, 49, 53, 91] if table[q]])`,
          '[53]',
          '49 = 7 × 7 and 91 = 7 × 13 are marked by the pass for 7.',
        ),
        choose(
          'You must test 100,000 numbers, each at most 10^6, for primality. What is the better plan?',
          [
            'Build one sieve table up to 10^6 and look each number up',
            'Run a separate sieve up to each number',
            'Trial-divide each number by every smaller number',
            'Sieve only up to 100,000',
          ],
          0,
          'One O(n log log n) build plus constant-time lookups beats repeating the work per query.',
        ),
        choose(
          'Why is a sieve a poor way to test one number near 10^15?',
          [
            'It cannot handle odd numbers',
            'Its marking takes O(1) time',
            'It needs a table with about 10^15 entries',
            'It only finds primes below 1,000',
          ],
          2,
          'The table size grows with the limit, which is far too much memory here.',
        ),
      ],
    },
  ],

  'cp-combination-boundaries': [
    {
      title: 'Count the empty and the full selection once',
      explanation: [
        'C(n, k) counts the ways to choose k of n distinct items, ignoring order. Choosing nothing can be done in exactly one way, and so can choosing everything: C(n, 0) = C(n, n) = 1.',
        'This holds for n = 0 too: from no items there is exactly one selection, the empty one.',
      ],
      example: {
        code: `def choose_boundary(n, k):
    if k < 0 or k > n:
        return 0
    if k == 0 or k == n:
        return 1
    return None

print(choose_boundary(5, 0), choose_boundary(5, 5), choose_boundary(0, 0))`,
        output: '1 1 1',
        explanation:
          'Empty and full selections each count once, including the empty selection from no items.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          `def choose_boundary(n, k):
    if k < 0 or k > n:
        return 0
    if k == 0 or k == n:
        return 1
    return None

print([choose_boundary(3, k) for k in [0, 1, 3]])`,
          '[1, None, 1]',
          'k = 1 is an interior state that still needs a recurrence; the ends count once each.',
        ),
        typeNumber(
          'In how many ways can all 6 of 6 items be chosen?',
          1,
          'There is only one selection containing every item; order does not matter.',
        ),
        choose(
          'Why is C(0, 0) = 1?',
          [
            'Zero items give zero possible selections',
            'Choosing nothing from nothing is one selection',
            'It is undefined, and 1 is a placeholder',
            'Because 0 × 0 = 1 by convention',
          ],
          1,
          'The empty selection exists even when there are no items.',
        ),
        typeOutput(
          'What does this program print?',
          `def choose_boundary(n, k):
    if k < 0 or k > n:
        return 0
    if k == 0 or k == n:
        return 1
    return None

print(choose_boundary(7, 7), choose_boundary(7, 0), choose_boundary(7, 6))`,
          '1 1 None',
          'Choosing all or none counts once. k = 6 is a valid interior state.',
        ),
      ],
    },
    {
      title: 'Return 0 for impossible selections',
      explanation: [
        'Choosing a negative number of items, or more items than exist, is impossible, so C(n, k) = 0 when k < 0 or k > n. Recurrences reach such states at their edges, and 0 makes them contribute nothing.',
        'Check the impossible cases first. Then 0 and n are the boundaries, and every other k is an interior state that needs computation.',
      ],
      example: {
        code: `def choose_boundary(n, k):
    if k < 0 or k > n:
        return 0
    if k == 0 or k == n:
        return 1
    return None

print([choose_boundary(2, k) for k in [-1, 0, 1, 2, 3]])`,
        output: '[0, 1, None, 1, 0]',
        explanation:
          'Outside 0 through 2 the count is 0; the ends count once; k = 1 still needs a recurrence.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          `def choose_boundary(n, k):
    if k < 0 or k > n:
        return 0
    if k == 0 or k == n:
        return 1
    return None

print([choose_boundary(4, k) for k in [5, -2, 2]])`,
          '[0, 0, None]',
          '5 > 4 and -2 < 0 are impossible; 2 is interior.',
        ),
        typeNumber(
          'What is C(3, 5)?',
          0,
          'There is no way to choose 5 items from 3.',
        ),
        typeOutput(
          'This version checks the boundaries in a different order. What does it print?',
          `def bad_boundary(n, k):
    if k == 0 or k == n:
        return 1
    if k > n:
        return 0
    return None

print(bad_boundary(3, -1), bad_boundary(3, 4))`,
          'None 0',
          'It never tests k < 0, so -1 is wrongly treated as an interior state.',
        ),
        choose(
          'Why should C(n, k) return 0, rather than raise an error, when k > n?',
          [
            'Raising errors is slower than returning a value',
            'It means k and n were passed in the wrong order',
            'Recurrences reach such states, which add no selections',
            'It avoids returning negative counts later',
          ],
          2,
          'For example, C(n - 1, k) with k = n is reached by Pascal’s rule and must add 0.',
        ),
      ],
    },
  ],

  'cp-combination-pascal-step': [
    {
      title: 'Split selections by one item: include or exclude',
      explanation: [
        'Fix one distinguished item. A selection of k items from n either excludes it, choosing all k from the other n - 1 items, or includes it, choosing k - 1 more. The two groups do not overlap, so C(n, k) = C(n - 1, k) + C(n - 1, k - 1).',
        'Applied to a whole row, each interior entry of the next row is the sum of the two entries above it, and both ends are 1.',
      ],
      example: {
        code: `def next_pascal_row(previous, modulus):
    result = [1 % modulus]
    for index in range(1, len(previous)):
        result.append((previous[index - 1] + previous[index]) % modulus)
    result.append(1 % modulus)
    return result

print(next_pascal_row([1, 4, 6, 4, 1], 100))`,
        output: '[1, 5, 10, 10, 5, 1]',
        explanation: 'For example C(5, 2) = C(4, 1) + C(4, 2) = 4 + 6 = 10.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          `def next_pascal_row(previous, modulus):
    result = [1 % modulus]
    for index in range(1, len(previous)):
        result.append((previous[index - 1] + previous[index]) % modulus)
    result.append(1 % modulus)
    return result

print(next_pascal_row([1, 5, 10, 10, 5, 1], 1000))`,
          '[1, 6, 15, 20, 15, 6, 1]',
          'Each interior entry adds its two neighbors above: 1 + 5, 5 + 10, 10 + 10, and so on.',
        ),
        choose(
          'C(5, 2) = C(4, 1) + C(4, 2). What does the C(4, 1) term count?',
          [
            'Selections that exclude it, choosing 2 from the other 4',
            'Selections that include it, choosing 1 more from the other 4',
            'Selections of exactly 1 item from all 5 items',
            'Orderings of the 2 chosen items among 4',
          ],
          1,
          'Including the item uses up one slot, leaving 1 to choose from the remaining 4.',
        ),
        choose(
          'Which two entries of row 6 add up to C(7, 3)?',
          [
            'C(6, 3) and C(6, 4)',
            'C(7, 2) and C(6, 3)',
            'C(6, 2) and C(6, 3)',
            'C(6, 3) twice',
          ],
          2,
          'Excluding the item gives C(6, 3); including it gives C(6, 2).',
        ),
        typeOutput(
          'What does this program print?',
          `def next_pascal_row(previous, modulus):
    result = [1 % modulus]
    for index in range(1, len(previous)):
        result.append((previous[index - 1] + previous[index]) % modulus)
    result.append(1 % modulus)
    return result

row = [1]
for _ in range(4):
    row = next_pascal_row(row, 1000)
print(row)`,
          '[1, 4, 6, 4, 1]',
          'Four steps from row 0 reach row 4, whose entries are C(4, 0) through C(4, 4).',
        ),
      ],
    },
    {
      title: 'Reduce the sums modulo any positive modulus',
      explanation: [
        'Addition respects residues, so each new entry can be reduced modulo m as it is built, keeping numbers small. The ends use 1 % m, which is 0 when m = 1.',
        'The method only adds, so it never needs an inverse. It works for composite moduli exactly as for primes.',
      ],
      example: {
        code: `def next_pascal_row(previous, modulus):
    result = [1 % modulus]
    for index in range(1, len(previous)):
        result.append((previous[index - 1] + previous[index]) % modulus)
    result.append(1 % modulus)
    return result

print(next_pascal_row([1, 4, 6, 4, 1], 6))`,
        output: '[1, 5, 4, 4, 5, 1]',
        explanation:
          'The true row is 1, 5, 10, 10, 5, 1; modulo 6, the tens become 4.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          `def next_pascal_row(previous, modulus):
    result = [1 % modulus]
    for index in range(1, len(previous)):
        result.append((previous[index - 1] + previous[index]) % modulus)
    result.append(1 % modulus)
    return result

print(next_pascal_row([1, 3, 3, 1], 4))`,
          '[1, 0, 2, 0, 1]',
          'Row 4 is 1, 4, 6, 4, 1, which leaves 1, 0, 2, 0, 1 modulo 4.',
        ),
        typeOutput(
          'What does this program print?',
          `def next_pascal_row(previous, modulus):
    result = [1 % modulus]
    for index in range(1, len(previous)):
        result.append((previous[index - 1] + previous[index]) % modulus)
    result.append(1 % modulus)
    return result

print(next_pascal_row([0, 0], 1))`,
          '[0, 0, 0]',
          'Modulo 1 every value, including the boundary 1, is 0.',
        ),
        choose(
          'Why does this method work for a composite modulus such as 12?',
          [
            'Composite moduli make every value invertible',
            'It only adds and reduces; it never divides',
            '12 is close to a prime',
            'It works only for even moduli',
          ],
          1,
          'Division modulo 12 can fail, but addition modulo any positive m is always valid.',
        ),
        typeNumber(
          'C(10, 5) = 252. If every row is reduced modulo 10, what is the entry for C(10, 5)?',
          2,
          'Reducing during addition gives the same residue as reducing the exact count: 252 % 10 = 2.',
        ),
      ],
    },
  ],

  'cp-combination-descending-row': [
    {
      title: 'Update counts from the highest k down to 1',
      explanation: [
        'With one list for the row, adding an item sets dp[k] = dp[k] + dp[k - 1]. Updating k from high to low means dp[k - 1] still holds the previous row when it is read.',
        'Updating upward would read a dp[k - 1] that already counts the new item, using it twice and overcounting, the same issue as reusing a 0/1 knapsack item.',
      ],
      example: {
        code: `def add_counting_item(previous, modulus):
    dp = previous[:]
    for selected in range(len(dp) - 1, 0, -1):
        dp[selected] = (dp[selected] + dp[selected - 1]) % modulus
    return dp

print(add_counting_item([1, 3, 3, 1], 100))`,
        output: '[1, 4, 6, 4]',
        explanation:
          'Row 3 becomes the first four entries of row 4: each count adds the old count one position to its left.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          `def add_counting_item(previous, modulus):
    dp = previous[:]
    for selected in range(len(dp) - 1, 0, -1):
        dp[selected] = (dp[selected] + dp[selected - 1]) % modulus
    return dp

print(add_counting_item([1, 2, 1, 0], 100))`,
          '[1, 3, 3, 1]',
          'Downward: index 3 gets 0 + 1, index 2 gets 1 + 2, index 1 gets 2 + 1.',
        ),
        typeOutput(
          'This loop updates upward. What does it print?',
          `dp = [1, 2, 1, 0]
for k in range(1, len(dp)):
    dp[k] = dp[k] + dp[k - 1]
print(dp)`,
          '[1, 3, 4, 4]',
          'Index 2 reads the already updated 3 instead of 2, so the counts grow too fast.',
        ),
        choose(
          'In a downward update, when k = 2 is processed, which row does dp[1] hold?',
          [
            'The new row, since index 2 was just updated',
            'A mix of the previous and the new row',
            'Zero, since the row is cleared for each item',
            'The previous row, since index 1 is updated later',
          ],
          3,
          'Index 1 has not been touched yet, so it still describes the row before the new item.',
        ),
        choose(
          'Starting from [1, 0, 0] and adding an item n times, what do the three entries become?',
          [
            'C(1, 0), C(1, 1), C(1, 2)',
            'C(n, 0), C(n, 1), C(n, 2)',
            'n, n - 1, n - 2',
            '1, n, n × n',
          ],
          1,
          'Each item addition turns row i into row i + 1, truncated to its first three entries.',
        ),
      ],
    },
    {
      title: 'Keep entry zero fixed and the row truncated',
      explanation: [
        'The loop stops at index 1, so dp[0] never changes: C(n, 0) stays 1 (or 1 % m) for every n. The list keeps only the entries up to the k that is needed, so the row does not grow.',
        'Copying with previous[:] leaves the caller’s row unchanged.',
      ],
      example: {
        code: `def add_counting_item(previous, modulus):
    dp = previous[:]
    for selected in range(len(dp) - 1, 0, -1):
        dp[selected] = (dp[selected] + dp[selected - 1]) % modulus
    return dp

row = [1, 0, 0]
for _ in range(5):
    row = add_counting_item(row, 1000)
print(row)`,
        output: '[1, 5, 10]',
        explanation:
          'After five items the entries are C(5, 0), C(5, 1), and C(5, 2), without storing the rest of row 5.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          `def add_counting_item(previous, modulus):
    dp = previous[:]
    for selected in range(len(dp) - 1, 0, -1):
        dp[selected] = (dp[selected] + dp[selected - 1]) % modulus
    return dp

row = [1, 0, 0, 0]
for _ in range(6):
    row = add_counting_item(row, 1000)
print(row)`,
          '[1, 6, 15, 20]',
          'Six items give C(6, 0) through C(6, 3); the list stays four entries long.',
        ),
        typeOutput(
          'What does this program print?',
          `def add_counting_item(previous, modulus):
    dp = previous[:]
    for selected in range(len(dp) - 1, 0, -1):
        dp[selected] = (dp[selected] + dp[selected - 1]) % modulus
    return dp

row = [1, 0, 0]
for _ in range(5):
    row = add_counting_item(row, 4)
print(row)`,
          '[1, 1, 2]',
          'C(5, 1) = 5 and C(5, 2) = 10 leave 1 and 2 modulo 4.',
        ),
        choose(
          'Why does dp[0] never change?',
          [
            'Python lists cannot change index 0 in place',
            'It is reset to 1 at the start of each pass',
            'The loop stops at index 1, and C(n, 0) = 1 for every n',
            'The loop skips even indices, including 0',
          ],
          2,
          'range(len(dp) - 1, 0, -1) excludes 0, which is correct because the empty selection always counts once.',
        ),
        typeOutput(
          'What does this program print?',
          `def add_counting_item(previous, modulus):
    dp = previous[:]
    for selected in range(len(dp) - 1, 0, -1):
        dp[selected] = (dp[selected] + dp[selected - 1]) % modulus
    return dp

a = [1, 4, 6]
b = add_counting_item(a, 10)
print(a, b)`,
          '[1, 4, 6] [1, 5, 0]',
          'The copy is updated: 6 + 4 = 10 leaves 0 modulo 10, and 4 + 1 = 5. a is unchanged.',
        ),
      ],
    },
  ],

  'cp-combinatorics': [
    {
      title: 'Build C(n, k) one item at a time',
      explanation: [
        'Start with dp = [1, 0, ..., 0] of length k + 1: with no items, only the empty selection exists. Adding items one by one with a downward update makes dp[r] equal C(i, r) after i items.',
        'With only i items, no selection larger than i exists yet, so the update can start at min(i, k). After n items, dp[k] is C(n, k).',
      ],
      example: {
        code: `def choose_trace(n, k):
    dp = [1] + [0] * k
    for count in range(1, n + 1):
        for selected in range(min(count, k), 0, -1):
            dp[selected] = dp[selected] + dp[selected - 1]
        print(dp)
    return dp[k]

print(choose_trace(4, 2))`,
        output: '[1, 1, 0]\n[1, 2, 1]\n[1, 3, 3]\n[1, 4, 6]\n6',
        explanation:
          'Each line is the start of the next Pascal row. After four items, dp[2] = C(4, 2) = 6.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
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

print(choose_mod(7, 3, 1000))`,
          '35',
          'C(7, 3) = 35. 210 counts ordered selections.',
        ),
        typeOutput(
          'What does this program print?',
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

print(choose_mod(10, 3, 7))`,
          '1',
          'C(10, 3) = 120 = 17 × 7 + 1.',
        ),
        choose(
          'After processing i items, what does dp[r] hold?',
          [
            'C(n, r) already',
            'The number of items left',
            'C(i, i)',
            'C(i, r) modulo the modulus',
          ],
          3,
          'Each item turns row i - 1 into row i, so the table always describes the items processed so far.',
        ),
        choose(
          'Why does the inner loop start at min(count, k)?',
          [
            'With count items, no larger selection exists yet',
            'To keep the table sorted by selection size',
            'To skip dp[0], which never changes anyway',
            'Because k is always smaller than count here',
          ],
          0,
          'Entries above count are still 0 and would stay 0, so they need no update.',
        ),
      ],
    },
    {
      title: 'Use symmetry and the boundary cases',
      explanation: [
        'Choosing k items is the same as choosing the n - k to leave out, so C(n, k) = C(n, n - k). Replacing k with min(k, n - k) keeps the table short.',
        'k outside 0..n returns 0 before any table is built. dp[0] starts at 1 % modulus, so modulus 1 gives 0 even for C(0, 0).',
      ],
      example: {
        code: `def choose_mod(n, k, modulus):
    if k < 0 or k > n:
        return 0
    k = min(k, n - k)
    dp = [0] * (k + 1)
    dp[0] = 1 % modulus
    for count in range(1, n + 1):
        for selected in range(min(count, k), 0, -1):
            dp[selected] = (dp[selected] + dp[selected - 1]) % modulus
    return dp[k]

print(choose_mod(8, 6, 1000), choose_mod(5, 6, 7), choose_mod(0, 0, 7))`,
        output: '28 0 1',
        explanation:
          'C(8, 6) is computed as C(8, 2) = 28 with a three-entry table. 6 of 5 is impossible, and C(0, 0) is the empty selection.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
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

print(choose_mod(9, 7, 1000), choose_mod(9, 2, 1000))`,
          '36 36',
          'Leaving out 2 of 9 is the same as choosing 7, so both are C(9, 2) = 36.',
        ),
        typeOutput(
          'What does this program print?',
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

print(choose_mod(4, -1, 5), choose_mod(4, 4, 5), choose_mod(0, 0, 1))`,
          '0 1 0',
          'k = -1 is impossible. C(4, 4) = 1. Modulo 1, even the empty selection’s count is 0.',
        ),
        typeNumber(
          'For C(1000, 997), how many entries does the table have after symmetry?',
          4,
          'min(997, 3) = 3, so the table holds dp[0] through dp[3].',
        ),
        choose(
          'Why does choose_mod(0, 0, 1) return 0 instead of 1?',
          [
            'C(0, 0) is 0, since there are no items',
            'k = 0 is outside the valid range for n = 0',
            'dp[0] starts at 1 % 1, and every residue modulo 1 is 0',
            'The loop subtracts 1 from dp[0] once',
          ],
          2,
          'The count is 1, but its residue modulo 1 is 0.',
        ),
      ],
    },
    {
      title: 'Avoid modular division for arbitrary moduli',
      explanation: [
        'The factorial formula n! / (k! (n - k)!) needs division, and modulo m that means multiplying by an inverse of k! (n - k)!. When that product shares a factor with m, no inverse exists, so the formula cannot be used.',
        'Pascal’s rule only adds, so it works for every positive modulus. It costs O(n × min(k, n - k)) additions and O(min(k, n - k)) memory, which is fine for n in the hundreds.',
      ],
      example: {
        code: `from math import gcd

def choose_mod(n, k, modulus):
    if k < 0 or k > n:
        return 0
    k = min(k, n - k)
    dp = [0] * (k + 1)
    dp[0] = 1 % modulus
    for count in range(1, n + 1):
        for selected in range(min(count, k), 0, -1):
            dp[selected] = (dp[selected] + dp[selected - 1]) % modulus
    return dp[k]

fact = [1, 1, 2, 6, 24, 120, 720]
print(fact[6] % 10, gcd(fact[2] * fact[4], 10))
print(choose_mod(6, 2, 10))`,
        output: '0 2\n5',
        explanation:
          'Modulo 10, 6! leaves 0 and the denominator 2! × 4! = 48 shares 2 with 10, so division fails. Pascal’s rule still gives C(6, 2) = 15, residue 5.',
      },
      questions: [
        choose(
          'Computing C(n, k) mod 12 as n! times an inverse of k!(n - k)! fails when...',
          [
            'n is even, so the numerator n! is even',
            'k is larger than n - k',
            'k!(n - k)! shares a factor with 12, so it has no inverse',
            'The true count C(n, k) is greater than 12',
          ],
          2,
          'An inverse modulo 12 exists only for values coprime to 12.',
        ),
        typeOutput(
          'What does this program print?',
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

print(choose_mod(12, 6, 8))`,
          '4',
          'C(12, 6) = 924 = 115 × 8 + 4, computed without any division.',
        ),
        choose(
          'Roughly how much work does choose_mod(500, 3, m) do?',
          [
            'About 500 × 3 additions',
            'About 500² additions',
            'About 3 additions',
            'About 2^500 additions',
          ],
          0,
          'Each of the 500 items updates at most 3 entries.',
        ),
        typeOutput(
          'What does this program print?',
          `from math import comb

def choose_mod(n, k, modulus):
    if k < 0 or k > n:
        return 0
    k = min(k, n - k)
    dp = [0] * (k + 1)
    dp[0] = 1 % modulus
    for count in range(1, n + 1):
        for selected in range(min(count, k), 0, -1):
            dp[selected] = (dp[selected] + dp[selected - 1]) % modulus
    return dp[k]

print(choose_mod(20, 10, 7), comb(20, 10) % 7)`,
          '5 5',
          'Reducing during every addition gives the same residue as reducing the exact count 184756.',
        ),
      ],
    },
  ],
};

// Python functions shared by several range-query programs below.
const fenwickPrefix = `def fenwick_prefix(tree, end):
    total = 0
    while end > 0:
        total += tree[end]
        end -= end & -end
    return total`;

const fenwickAdd = `def fenwick_add(tree, index, delta):
    result = tree[:]
    internal = index + 1
    while internal < len(result):
        result[internal] += delta
        internal += internal & -internal
    return result`;

const fenwickRangeSums = `def range_sums(values, operations):
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
    return answers`;

const fenwickBuild = `def build_tree(values):
    n = len(values)
    tree = [0] * (n + 1)
    for index, value in enumerate(values):
        internal = index + 1
        while internal <= n:
            tree[internal] += value
            internal += internal & -internal
    return tree`;

const leafSize = `def leaf_size(count):
    size = 1
    while size < count:
        size *= 2
    return size`;

const leafLayout = `def minimum_leaf_layout(values):
    size = 1
    while size < len(values):
        size *= 2
    tree = [float("inf")] * (2 * size)
    tree[size:size + len(values)] = values
    return (size, tree)`;

const buildParents = `def build_minimum_parents(tree, size):
    result = tree[:]
    for node in range(size - 1, 0, -1):
        result[node] = min(result[2 * node], result[2 * node + 1])
    return result`;

const queryNodes = `def query_nodes(size, left, right):
    left += size
    right += size
    nodes = []
    while left < right:
        if left % 2:
            nodes.append(left)
            left += 1
        if right % 2:
            right -= 1
            nodes.append(right)
        left //= 2
        right //= 2
    return nodes`;

const queryMinimum = `def build(values):
    size = 1
    while size < len(values):
        size *= 2
    tree = [float("inf")] * (2 * size)
    tree[size:size + len(values)] = values
    for node in range(size - 1, 0, -1):
        tree[node] = min(tree[2 * node], tree[2 * node + 1])
    return size, tree

def query_minimum(tree, size, left, right):
    if left == right:
        return None
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
    return best`;

const rangeMinima = `def range_minima(values, operations):
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
    return answers`;

const doubledJumps = `def doubled_jumps(previous):
    return [-1 if ancestor == -1 else previous[ancestor] for ancestor in previous]`;

const liftingTable = `def lifting_table(parents, rows):
    table = [parents[:]]
    for _ in range(rows - 1):
        previous = table[-1]
        table.append([-1 if a == -1 else previous[a] for a in previous])
    return table

def jump_ancestor(table, vertex, steps):
    n = len(table[0])
    if steps >= n:
        return -1
    bit = 0
    while steps and vertex != -1:
        if steps & 1:
            vertex = table[bit][vertex]
        steps >>= 1
        bit += 1
    return vertex`;

const kthAncestors = `def kth_ancestors(parents, queries):
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
    return answers`;

const reversedAdjacency = `def reversed_adjacency(n, edges):
    reverse = [[] for _ in range(n)]
    for source, target in edges:
        reverse[target].append(source)
    return reverse`;

const finishOrder = `def dfs_finish_order(graph):
    seen = [False] * len(graph)
    order = []
    for root in range(len(graph)):
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
    return order`;

const collectComponents = `def collect_reverse_components(reverse, order):
    seen = [False] * len(reverse)
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
    return sorted(groups)`;

const sccGroups = `def scc_groups(n, edges):
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
    return sorted(groups)`;

const condense = `def condensed_edges(groups, n, edges):
    component = [0] * n
    index = 0
    for group in groups:
        for vertex in group:
            component[vertex] = index
        index += 1
    result = []
    for source, target in edges:
        pair = (component[source], component[target])
        if pair[0] != pair[1] and pair not in result:
            result.append(pair)
    return sorted(result)`;

const range: KnowledgePointModule = {
  'cp-fenwick-lowbit': [
    {
      title: 'Isolate the lowest set bit with i & -i',
      explanation: [
        'In binary, i & -i keeps only the lowest 1 bit of a positive integer i. For 12 (1100) it gives 4 (100); for any odd number it gives 1.',
        'This value, called lowbit(i), is always a power of two, and it is the block size a Fenwick tree assigns to internal index i.',
      ],
      example: {
        code: `print([i & -i for i in [3, 10, 16, 20, 7]])
print(bin(20), bin(20 & -20))`,
        output: '[1, 2, 16, 4, 1]\n0b10100 0b100',
        explanation:
          '20 is 10100 in binary, so its lowest set bit is 100, which is 4. Odd numbers end in a 1 bit.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          `print(24 & -24, 9 & -9, 32 & -32)`,
          '8 1 32',
          '24 = 11000 keeps 1000 = 8; 9 is odd; 32 is already a single bit.',
        ),
        typeNumber(
          'What is lowbit(40)?',
          8,
          '40 is 101000 in binary, and its lowest set bit is 1000 = 8.',
        ),
        choose(
          'Which numbers all have lowbit 4?',
          ['4, 8, 16', '4, 12, 20', '2, 4, 6', '4, 5, 6'],
          1,
          '4 = 100, 12 = 1100, and 20 = 10100 all end in exactly two zero bits.',
        ),
        typeOutput(
          'What does this program print?',
          `print([i & -i for i in range(1, 9)])`,
          '[1, 2, 1, 4, 1, 2, 1, 8]',
          'Odd numbers give 1, numbers ending in 10 give 2, and the powers of two give themselves.',
        ),
      ],
    },
    {
      title: 'Read lowbit(i) as the block that ends at i',
      explanation: [
        'A Fenwick tree uses internal indices starting at 1. tree[i] stores the sum of the lowbit(i) positions ending at i: positions i - lowbit(i) + 1 through i.',
        'Index 0 has lowbit 0, so it covers nothing, and a walk that adds or subtracts lowbit from 0 never moves. That is why internal indexing starts at 1.',
      ],
      example: {
        code: `for i in range(1, 9):
    size = i & -i
    print(i, list(range(i - size + 1, i + 1)))`,
        output:
          '1 [1]\n2 [1, 2]\n3 [3]\n4 [1, 2, 3, 4]\n5 [5]\n6 [5, 6]\n7 [7]\n8 [1, 2, 3, 4, 5, 6, 7, 8]',
        explanation:
          'Odd indices cover only themselves. Powers of two cover everything from 1 up to themselves.',
      },
      questions: [
        choose(
          'Which internal positions does tree[12] cover?',
          ['1 through 12', '12 only', '9 through 12', '8 through 12'],
          2,
          'lowbit(12) = 4, so the block holds the four positions ending at 12.',
        ),
        typeNumber(
          'Values 3, 1, 4, 1, 5, 9 sit at internal positions 1 through 6. What does tree[6] store?',
          14,
          'lowbit(6) = 2, so tree[6] sums positions 5 and 6: 5 + 9.',
        ),
        typeOutput(
          'What does this program print?',
          `index = 0
for step in range(3):
    index = index + (index & -index)
print(index)`,
          '0',
          '0 & -0 is 0, so adding it never moves the index.',
        ),
        choose(
          'Why does a Fenwick tree start internal indices at 1?',
          [
            'Python lists start counting at index 1',
            'lowbit(0) is 0, so walks from index 0 never move',
            'Index 0 stores the total sum of all values',
            '1 is the smallest block size a node can have',
          ],
          1,
          'Every positive index has a nonzero lowbit, so walks always make progress.',
        ),
      ],
    },
  ],

  'cp-fenwick-prefix-walk': [
    {
      title: 'Subtract lowbit to collect disjoint blocks',
      explanation: [
        'To sum internal positions 1 through end, start at end, add tree[end], then subtract lowbit(end) to jump to the block just before it. Repeat until the index reaches 0.',
        'The blocks visited are disjoint and together cover exactly 1 through end. Each step clears one set bit, so there are at most about log₂(n) steps.',
      ],
      example: {
        code: `end = 13
path = []
while end > 0:
    path.append(end)
    end -= end & -end
print(path)`,
        output: '[13, 12, 8]',
        explanation:
          'tree[13] covers 13, tree[12] covers 9 through 12, and tree[8] covers 1 through 8.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          `end = 7
path = []
while end > 0:
    path.append(end)
    end -= end & -end
print(path)`,
          '[7, 6, 4]',
          '7 = 111 in binary; clearing one low bit at a time gives 6 and then 4.',
        ),
        typeOutput(
          'What does this program print?',
          `end = 16
path = []
while end > 0:
    path.append(end)
    end -= end & -end
print(path)`,
          '[16]',
          'tree[16] already covers positions 1 through 16, so one block is enough.',
        ),
        choose(
          'A prefix walk from end = 11 visits 11, 10, and 8. Which positions does each block cover?',
          [
            '11: 1–11; 10: 1–10; 8: 1–8',
            '11: 11; 10: 10; 8: 8',
            '11: 9–11; 10: 9–10; 8: 1–8',
            '11: 11; 10: 9–10; 8: 1–8',
          ],
          3,
          'The lowbits are 1, 2, and 8, so the blocks are disjoint and cover 1 through 11.',
        ),
        choose(
          'At most how many blocks does a prefix walk visit when n = 1,000,000?',
          [
            'About 1,000, the square root of n',
            'About 500,000, half of the positions',
            'About 20, one per set bit',
            'Exactly 1, the block that ends at end',
          ],
          2,
          'Each step clears one bit of end, and numbers below 2^20 have at most 20 bits.',
        ),
      ],
    },
    {
      title: 'Map the public prefix [0, end) to internal end',
      explanation: [
        'The public array is zero-based, while internal positions start at 1, so public index p lives at internal position p + 1. The public prefix [0, end) is therefore internal positions 1 through end, and the walk starts at end itself.',
        'An empty prefix, end = 0, reads no blocks and returns 0.',
      ],
      example: {
        code: `${fenwickPrefix}

tree = [0, 4, 5, 3, 10, 6, 11]
print([fenwick_prefix(tree, end) for end in range(7)])`,
        output: '[0, 4, 5, 8, 10, 16, 21]',
        explanation:
          'This tree stores the values 4, 1, 3, 2, 6, 5. Each entry is the sum of the first end values.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          `${fenwickPrefix}

tree = [0, 4, 5, 3, 10, 6, 11]
print(fenwick_prefix(tree, 3), fenwick_prefix(tree, 6))`,
          '8 21',
          'end = 3 adds tree[3] + tree[2] = 8; end = 6 adds tree[6] + tree[4] = 21.',
        ),
        choose(
          'Which values does the public prefix [0, 4) cover?',
          [
            'values[0] through values[4], at internal 1–5',
            'values[1] through values[4], at internal 2–5',
            'values[0] through values[3], at internal 0–3',
            'values[0] through values[3], at internal 1–4',
          ],
          3,
          'Half-open [0, 4) has four values, stored at internal positions 1 through 4.',
        ),
        typeOutput(
          'The second function starts one position too far. What does this program print?',
          `${fenwickPrefix}

def shifted_prefix(tree, end):
    return fenwick_prefix(tree, end + 1)

tree = [0, 4, 5, 3, 10, 6, 11]
print(fenwick_prefix(tree, 3), shifted_prefix(tree, 3))`,
          '8 10',
          'Starting at internal 4 includes public index 3, which [0, 3) excludes.',
        ),
        typeOutput(
          'What does this program print?',
          `${fenwickPrefix}

tree = [0, 5, 3, 0, 6]
print(fenwick_prefix(tree, 4), fenwick_prefix(tree, 2), fenwick_prefix(tree, 0))`,
          '6 3 0',
          'tree[4] already holds the whole prefix of four values, tree[2] the first two, and end = 0 reads nothing.',
        ),
      ],
    },
  ],

  'cp-fenwick-update-walk': [
    {
      title: 'Add lowbit to climb to every containing block',
      explanation: [
        'Changing one position changes every block that contains it. Starting at that position’s internal index, adding lowbit jumps to the next larger block that also covers it. Repeat until the index passes n.',
        'The prefix walk moves left through disjoint blocks; the update walk moves right through nested ones. Both take O(log n) steps.',
      ],
      example: {
        code: `n = 8
internal = 3
path = []
while internal <= n:
    path.append(internal)
    internal += internal & -internal
print(path)`,
        output: '[3, 4, 8]',
        explanation:
          'Position 3 lies in tree[3] (just 3), tree[4] (1 through 4), and tree[8] (1 through 8).',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          `n = 8
internal = 5
path = []
while internal <= n:
    path.append(internal)
    internal += internal & -internal
print(path)`,
          '[5, 6, 8]',
          '5 + 1 = 6, then 6 + 2 = 8; the next jump would pass n.',
        ),
        typeOutput(
          'What does this program print?',
          `n = 6
internal = 1
path = []
while internal <= n:
    path.append(internal)
    internal += internal & -internal
print(path)`,
          '[1, 2, 4]',
          'The jump from 4 lands on 8, past n = 6, so the walk stops.',
        ),
        choose(
          'With n = 16, a point update at internal position 6 changes which blocks?',
          ['6 only', '6, 4, and 0', '6, 7, and 8', '6, 8, and 16'],
          3,
          'lowbit(6) = 2 leads to 8, and lowbit(8) = 8 leads to 16.',
        ),
        choose(
          'Why does the update walk add lowbit while the prefix walk subtracts it?',
          [
            'Either direction works for both; the choice is a convention',
            'Updates climb to larger containing blocks; prefixes step to earlier disjoint ones',
            'Adding lowbit is cheaper, and updates are the slower operation',
            'Subtracting lowbit from an update index would make it negative',
          ],
          1,
          'The two walks answer different questions: which blocks contain a position, and which blocks tile a prefix.',
        ),
      ],
    },
    {
      title: 'Convert the public index and update a copy',
      explanation: [
        'A public, zero-based index p starts the update at internal p + 1. Forgetting the + 1 updates the wrong position, and for p = 0 it starts at 0, where the walk never moves.',
        'The delta can be negative. Working on tree[:] leaves the caller’s tree unchanged, and the walk stops when the index reaches the list length.',
      ],
      example: {
        code: `${fenwickAdd}

tree = [0, 4, 5, 3, 10, 6, 11]
print(fenwick_add(tree, 2, 5))`,
        output: '[0, 4, 5, 8, 15, 6, 11]',
        explanation:
          'Public index 2 is internal 3. The walk updates tree[3] and tree[4]; the next index, 8, is past the end.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          `${fenwickAdd}

tree = [0, 4, 5, 3, 10, 6, 11]
print(fenwick_add(tree, 0, -4))`,
          '[0, 0, 1, 3, 6, 6, 11]',
          'Public index 0 is internal 1, contained in tree[1], tree[2], and tree[4].',
        ),
        typeOutput(
          'This version forgets the + 1. What does it print for public index 2?',
          `def wrong_add(tree, index, delta):
    result = tree[:]
    internal = index
    while internal < len(result):
        result[internal] += delta
        internal += internal & -internal
    return result

tree = [0, 4, 5, 3, 10, 6, 11]
print(wrong_add(tree, 2, 5))`,
          '[0, 4, 10, 3, 15, 6, 11]',
          'Internal 2 is public index 1, so the change lands on the wrong value.',
        ),
        choose(
          'An update for public index 0 forgets the + 1. What happens?',
          [
            'It updates internal 1 anyway, by rounding up',
            'It raises IndexError for index 0',
            'The index stays 0 forever, since 0 & -0 is 0',
            'It updates every block once and stops',
          ],
          2,
          'The walk adds lowbit(0) = 0 each time, so the loop never ends.',
        ),
        typeOutput(
          'What does this program print?',
          `${fenwickAdd}

old = [0, 7]
new = fenwick_add(old, 0, -2)
print(old, new)`,
          '[0, 7] [0, 5]',
          'The function changes a copy, so old keeps its original value.',
        ),
      ],
    },
  ],

  'cp-fenwick': [
    {
      title: 'Build the tree with one point addition per value',
      explanation: [
        'Start from an all-zero tree of n + 1 entries and add each value at its own position. Afterwards tree[i] holds the sum of its block, and tree[n] for n a power of two holds the total.',
        'n point additions cost O(n log n), and the tree uses O(n) storage.',
      ],
      example: {
        code: `${fenwickBuild}

print(build_tree([2, 1, 4, 3]))`,
        output: '[0, 2, 3, 4, 10]',
        explanation:
          'tree[2] covers the first two values (3), tree[3] only the third (4), and tree[4] all four (10).',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          `${fenwickBuild}

print(build_tree([1, 2, 3, 4, 5]))`,
          '[0, 1, 3, 3, 10, 5]',
          'Blocks: 1 → 1, 2 → 1 + 2, 3 → 3, 4 → 1 + 2 + 3 + 4, 5 → 5.',
        ),
        typeOutput(
          'What does this program print?',
          `${fenwickBuild}

print(build_tree([5, 5, 5, 5, 5, 5, 5, 5]))`,
          '[0, 5, 10, 5, 20, 5, 10, 5, 40]',
          'Each tree[i] holds lowbit(i) copies of 5.',
        ),
        choose(
          'Building a Fenwick tree with n point additions costs...',
          ['O(n²)', 'O(log n)', 'O(n³)', 'O(n log n)'],
          3,
          'Each of the n additions walks O(log n) blocks.',
        ),
        choose(
          'After building a tree for 8 values, which entry holds the sum of all of them?',
          ['tree[1]', 'tree[8]', 'tree[0]', 'tree[4]'],
          1,
          'lowbit(8) = 8, so tree[8] covers positions 1 through 8.',
        ),
      ],
    },
    {
      title: 'Answer [left, right) as prefix(right) - prefix(left)',
      explanation: [
        'prefix(end) sums the public range [0, end). The values in [left, right) are those in [0, right) but not in [0, left), so the range sum is prefix(right) - prefix(left).',
        'When left == right the two prefixes are equal and the sum is 0. Subtraction works because sums can be undone; a minimum, for example, cannot.',
      ],
      example: {
        code: `${fenwickRangeSums}

print(range_sums([3, 1, 5, 2, 4], [("sum", 1, 4), ("sum", 2, 2), ("sum", 0, 5)]))`,
        output: '[8, 0, 15]',
        explanation:
          '[1, 4) holds 1, 5, 2. The empty range gives 0, and [0, 5) is the whole list.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          `${fenwickRangeSums}

print(range_sums([4, -2, 7, 1], [("sum", 0, 2), ("sum", 1, 4)]))`,
          '[2, 6]',
          '[0, 2) holds 4 and -2; [1, 4) holds -2, 7, and 1.',
        ),
        choose(
          'Which expression sums values[2] through values[5], inclusive?',
          [
            'prefix(5) - prefix(2)',
            'prefix(5) - prefix(1)',
            'prefix(6) - prefix(2)',
            'prefix(6) - prefix(3)',
          ],
          2,
          'Inclusive 2 through 5 is the half-open range [2, 6).',
        ),
        typeOutput(
          'What does this program print?',
          `${fenwickRangeSums}

print(range_sums([9, 9], [("sum", 1, 1), ("sum", 0, 0)]))`,
          '[0, 0]',
          'Both ranges are empty, so each is the difference of two equal prefixes.',
        ),
        choose(
          'Why can a Fenwick tree answer range sums by subtraction while range minima cannot?',
          [
            'Minimums are always negative, so they cancel',
            'Sums can be undone by subtraction; a minimum cannot',
            'Fenwick trees store only positive values',
            'Subtraction is faster than taking a min',
          ],
          1,
          'Knowing the minimum of [0, left) does not let you remove those values from the minimum of [0, right).',
        ),
      ],
    },
    {
      title: 'Interleave updates and queries in O(log n)',
      explanation: [
        'Each ("add", index, delta) walks the containing blocks, and each ("sum", left, right) walks two prefixes. Both cost O(log n), so a mixed sequence of q operations costs O((n + q) log n) including the build.',
        'A later sum sees every earlier addition inside its range, and none outside it.',
      ],
      example: {
        code: `${fenwickRangeSums}

operations = [("sum", 0, 4), ("add", 1, 5), ("sum", 0, 2), ("add", 3, -3), ("sum", 2, 4)]
print(range_sums([2, 1, 4, 3], operations))`,
        output: '[10, 8, 4]',
        explanation:
          'The total starts at 10. Index 1 becomes 6, so [0, 2) sums to 8. Index 3 becomes 0, so [2, 4) sums to 4.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          `${fenwickRangeSums}

operations = [("add", 0, 4), ("sum", 0, 3), ("add", 2, -1), ("sum", 1, 3)]
print(range_sums([1, 1, 1], operations))`,
          '[7, 1]',
          'The values become 5, 1, 1, summing to 7; then index 2 drops to 0, leaving 1 in [1, 3).',
        ),
        typeOutput(
          'What does this program print?',
          `${fenwickRangeSums}

print(range_sums([7, 8], [("add", 1, 0)]))`,
          '[]',
          'Only sum operations produce answers, and there are none.',
        ),
        choose(
          'There are 10^5 values and 10^5 operations. How do rebuilt prefix sums compare with a Fenwick tree?',
          [
            'Rebuilding: about 10^10 steps; Fenwick: about 3.4 × 10^6',
            'Both cost about 10^5 steps, one per operation',
            'Fenwick: about 10^10 steps; rebuilding: about 10^5',
            'Rebuilding is faster when there are updates',
          ],
          0,
          'Each rebuild is O(n); each Fenwick operation is about 2 × 17 block visits.',
        ),
        choose(
          'An operation ("add", 2, 5) runs. What does a later ("sum", 0, 2) see?',
          [
            'The sum grows by 5',
            'No change, since [0, 2) excludes index 2',
            'The sum grows by 10',
            'An error, since index 2 changed',
          ],
          1,
          'The half-open range covers indices 0 and 1 only.',
        ),
      ],
    },
  ],

  'cp-segment-leaf-layout': [
    {
      title: 'Pad the leaf count to a power of two',
      explanation: [
        'An iterative segment tree uses a leaf count size that is a power of two at least n. Double size from 1 until it reaches n; an empty input keeps size 1.',
        'The tree list has 2 × size entries. Since size < 2n for n >= 1, that is fewer than 4n entries.',
      ],
      example: {
        code: `${leafSize}

for count in [1, 3, 4, 5, 9]:
    print(count, leaf_size(count))`,
        output: '1 1\n3 4\n4 4\n5 8\n9 16',
        explanation:
          'Exact powers of two are kept; any other count rounds up to the next power.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          `${leafSize}

print(leaf_size(6), leaf_size(16), leaf_size(17))`,
          '8 16 32',
          '6 rounds up to 8, 16 is already a power of two, and 17 needs 32.',
        ),
        typeOutput(
          'What does this program print?',
          `${leafSize}

print(leaf_size(0), leaf_size(2))`,
          '1 2',
          'size starts at 1 and never drops below it; 2 is already a power of two.',
        ),
        choose(
          'A tree with leaf size 8 stores how many list entries?',
          ['8', '15, one per tree node', '16, with index 0 unused', '9'],
          2,
          'Leaves fill indices 8 through 15, internal nodes 1 through 7, and index 0 is spare.',
        ),
        choose(
          'How much space does padding to a power of two use for n >= 1 values?',
          [
            'Exactly n entries, one per value',
            'Fewer than 4n entries, since size < 2n',
            'About n² entries, one per pair',
            'About n log n entries, n per level',
          ],
          1,
          'size is at most double n, and the list holds 2 × size entries.',
        ),
      ],
    },
    {
      title: 'Place the values at index size and pad with the identity',
      explanation: [
        'Real values occupy tree[size] through tree[size + n - 1]; every other entry starts as infinity. For minima, min(x, infinity) = x, so padding never changes an answer.',
        'The padding must be the identity of the combine operation: infinity for minimum, 0 for sum.',
      ],
      example: {
        code: `${leafLayout}

size, tree = minimum_leaf_layout([5, 2, 9, 4, 7])
print(size)
print(tree[size:])`,
        output: '8\n[5, 2, 9, 4, 7, inf, inf, inf]',
        explanation:
          'Five values need eight leaves; the three unused leaves hold infinity.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          `${leafLayout}

size, tree = minimum_leaf_layout([6, 1])
print(tree)`,
          '[inf, inf, 6, 1]',
          'size is 2, so the leaves start at index 2 in a list of four entries.',
        ),
        typeOutput(
          'What does this program print?',
          `print(min(3, float("inf")), min(float("inf"), float("inf")))`,
          '3 inf',
          'Infinity never wins a minimum against a real value.',
        ),
        choose(
          'Why would padding with 0 break a minimum tree over positive values?',
          [
            'A list of infinities cannot also hold 0',
            '0 compares as larger than infinity in Python',
            '0 could become the minimum of a range that contains padding',
            'It changes the leaf size to the next power of two',
          ],
          2,
          'A node mixing real leaves and padding would report 0, a value not in the array.',
        ),
        typeNumber(
          'For a segment tree of sums, which padding value is neutral?',
          0,
          'x + 0 = x, just as min(x, infinity) = x for minima.',
        ),
      ],
    },
  ],

  'cp-segment-parent-build': [
    {
      title: 'Find children at 2i and 2i + 1',
      explanation: [
        'With the root at index 1, node i has children 2i and 2i + 1, and its parent is i // 2. Leaves are indices size through 2 × size - 1, so public index p is leaf size + p.',
        'Index 0 is unused; starting the root at 1 is what makes these formulas exact.',
      ],
      example: {
        code: `for node in [1, 2, 3]:
    print(node, 2 * node, 2 * node + 1)
print(6 // 2, 7 // 2)`,
        output: '1 2 3\n2 4 5\n3 6 7\n3 3',
        explanation: 'Nodes 6 and 7 are siblings: both have parent 3.',
      },
      questions: [
        typeNumber(
          'With size 8, which node is the parent of leaf 13?',
          6,
          '13 // 2 = 6; node 6 has children 12 and 13.',
        ),
        typeOutput(
          'What does this program print?',
          `size = 8
node = size + 3
path = []
while node:
    path.append(node)
    node //= 2
print(path)`,
          '[11, 5, 2, 1]',
          'Public index 3 is leaf 11; halving climbs through its ancestors to the root.',
        ),
        choose(
          'With size 4, which leaves lie under node 3?',
          [
            'Leaves 4 and 5, public indices 0 and 1',
            'Leaves 7 and 8, public indices 3 and 4',
            'All four leaves, public indices 0 to 3',
            'Leaves 6 and 7, public indices 2 and 3',
          ],
          3,
          'Node 3 has children 6 and 7, which are leaves when size = 4.',
        ),
        choose(
          'Why is index 0 left unused?',
          [
            'Python lists cannot store a node at index 0',
            'With the root at 1, children are exactly 2i and 2i + 1',
            'It holds the number of real values',
            'It must stay infinity to pad the leaves',
          ],
          1,
          'A root at 0 would have children 0 and 1, breaking the formula.',
        ),
      ],
    },
    {
      title: 'Build parents from size - 1 down to 1',
      explanation: [
        'Each internal node stores the minimum of its two children. Processing nodes from size - 1 down to 1 guarantees both children are final before their parent reads them, because children always have larger indices.',
        'After the build, every node holds the minimum of its interval, and node 1 holds the minimum of the whole array.',
      ],
      example: {
        code: `${buildParents}

inf = float("inf")
print(build_minimum_parents([inf, inf, inf, inf, 6, 2, 8, 5], 4))`,
        output: '[inf, 2, 2, 5, 6, 2, 8, 5]',
        explanation:
          'Node 3 = min(8, 5) and node 2 = min(6, 2) are built before the root min(2, 5).',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          `${buildParents}

inf = float("inf")
print(build_minimum_parents([inf, inf, inf, inf, 7, 3, 9, inf], 4))`,
          '[inf, 3, 3, 9, 7, 3, 9, inf]',
          'The padding leaf loses to 9, so node 3 holds 9.',
        ),
        typeOutput(
          'This loop builds parents upward from node 1. What does it print?',
          `inf = float("inf")
tree = [inf, inf, inf, inf, 7, 3, 9, 4]
for node in range(1, 4):
    tree[node] = min(tree[2 * node], tree[2 * node + 1])
print(tree[1])`,
          'inf',
          'Node 1 is computed while nodes 2 and 3 still hold their starting infinity.',
        ),
        typeNumber(
          'After building a minimum tree on [4, 8, 1, 6, 3], what is tree[1]?',
          1,
          'The root holds the minimum of every real value; padding is infinity.',
        ),
        typeOutput(
          'This builds a sum tree the same way. What does it print?',
          `tree = [0, 0, 0, 0, 1, 2, 3, 4]
for node in range(3, 0, -1):
    tree[node] = tree[2 * node] + tree[2 * node + 1]
print(tree)`,
          '[0, 10, 3, 7, 1, 2, 3, 4]',
          'Nodes 3 and 2 sum their leaves to 7 and 3, then the root sums them to 10.',
        ),
      ],
    },
  ],

  'cp-segment-query-boundaries': [
    {
      title: 'Collect boundary nodes while climbing',
      explanation: [
        'Move [left, right) to leaf indices by adding size. If left is odd, it is a right child whose parent would also cover a position outside the range, so take it alone and move left one step right. If right is odd, the node just before it is a left child to take alone.',
        'Then halve both boundaries and repeat while left < right. The collected nodes are disjoint, cover exactly the range, and number at most about 2 log₂ n.',
      ],
      example: {
        code: `${queryNodes}

print(query_nodes(8, 1, 7))`,
        output: '[9, 14, 5, 6]',
        explanation:
          'Leaf 9 is position 1 and leaf 14 is position 6. Node 5 covers positions 2–3 and node 6 covers 4–5.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          `${queryNodes}

print(query_nodes(8, 0, 8))`,
          '[1]',
          'The whole array is exactly node 1’s interval, so the boundaries meet at the root.',
        ),
        typeOutput(
          'What does this program print?',
          `${queryNodes}

print(query_nodes(8, 2, 5))`,
          '[12, 5]',
          'Right boundary 13 is odd, so leaf 12 (position 4) is taken; node 5 then covers positions 2 and 3.',
        ),
        choose(
          'Why is an odd left boundary taken by itself before moving up?',
          [
            'Odd nodes are always leaves, so they cannot move up',
            'Every left boundary is odd, so it is always taken alone',
            'Odd nodes hold the minimum of their parent’s interval',
            'It is a right child, so its parent also covers a position outside',
          ],
          3,
          'That extra position lies outside the range, so the parent cannot be used.',
        ),
        choose(
          'At most how many nodes does one query collect?',
          ['About n', 'Exactly 2', 'About 2 log₂ n', 'About n / 2'],
          2,
          'Each level contributes at most one node per boundary.',
        ),
      ],
    },
    {
      title: 'Combine the collected minima and handle empty ranges',
      explanation: [
        'The range minimum is the minimum of the collected nodes’ summaries, starting from infinity. An empty range [left, left) has no values, so the query returns None instead of infinity.',
        'Prefix minima cannot answer this by subtraction: the minimum of [0, left) can hide everything inside the range.',
      ],
      example: {
        code: `${queryMinimum}

size, tree = build([5, 3, 8, 6])
print(query_minimum(tree, size, 0, 4))
print(query_minimum(tree, size, 2, 4))
print(query_minimum(tree, size, 1, 1))`,
        output: '3\n6\nNone',
        explanation:
          'The whole range has minimum 3, positions 2 and 3 have minimum 6, and [1, 1) is empty.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          `${queryMinimum}

size, tree = build([7, 2, 9, 4])
print(query_minimum(tree, size, 2, 3), query_minimum(tree, size, 0, 1))`,
          '9 7',
          'Each range holds a single position: index 2 is 9 and index 0 is 7.',
        ),
        typeOutput(
          'What does this program print?',
          `${queryMinimum}

size, tree = build([7, 2, 9, 4])
print(query_minimum(tree, size, 3, 3), query_minimum(tree, size, 0, 3))`,
          'None 2',
          '[3, 3) is empty. [0, 3) holds 7, 2, and 9.',
        ),
        choose(
          'The prefix minima of [1, 9, 8] are [1, 1, 1]. What do they say about the minimum of [1, 3)?',
          [
            'Nothing, since index 0’s 1 hides the range',
            'It is 1, the last prefix minimum',
            'It is 0, from subtracting 1 - 1',
            'It is 8, read from the prefix at 3',
          ],
          0,
          'The true answer is 8, but both prefixes report 1, and minima cannot be subtracted.',
        ),
        typeOutput(
          'What does this program print?',
          `${queryMinimum}

size, tree = build([5, 1, 4])
print(query_minimum(tree, size, 2, 4))`,
          '4',
          'The range includes the padding leaf, but min(4, infinity) is 4.',
        ),
      ],
    },
  ],

  'cp-segment-tree': [
    {
      title: 'Assign a point and repair its ancestors',
      explanation: [
        'To set public index p, overwrite leaf size + p, then walk to the root with node //= 2, recomputing each node as the minimum of its children. Only those O(log n) nodes contain the changed position.',
        'Assignment replaces the old value; it does not add to it.',
      ],
      example: {
        code: `inf = float("inf")
size = 4
tree = [inf, 1, 4, 1, 4, 7, 1, 9]
node = size + 2
tree[node] = 8
node //= 2
while node:
    tree[node] = min(tree[2 * node], tree[2 * node + 1])
    node //= 2
print(tree)`,
        output: '[inf, 4, 4, 8, 4, 7, 8, 9]',
        explanation:
          'Leaf 6 changes from 1 to 8, so node 3 becomes min(8, 9) = 8 and the root becomes min(4, 8) = 4.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          `${rangeMinima}

print(range_minima([6, 3, 5, 8], [("min", 0, 4), ("set", 1, 9), ("min", 0, 4)]))`,
          '[3, 5]',
          'After index 1 becomes 9, the smallest value left is 5.',
        ),
        choose(
          'With size 8, assigning public index 5 recomputes which internal nodes?',
          ['6, 3, and 1', '13 only', '5, 2, and 1', 'Every node'],
          0,
          'Leaf 13 has ancestors 6, 3, and 1.',
        ),
        typeOutput(
          'What does this program print?',
          `${rangeMinima}

print(range_minima([5], [("set", 0, 7), ("min", 0, 1)]))`,
          '[7]',
          'set replaces the value 5 with 7; it does not add.',
        ),
        choose(
          'What does one point assignment cost?',
          ['O(n)', 'O(log n)', 'O(1)', 'O(n log n)'],
          1,
          'It updates one leaf and one node per level above it.',
        ),
      ],
    },
    {
      title: 'Query half-open ranges between updates',
      explanation: [
        'A ("min", left, right) operation covers positions left through right - 1, collecting boundary nodes as before. An empty range returns None, even on an empty array.',
        'Queries always see the latest assignments, because every assignment repairs all affected nodes immediately.',
      ],
      example: {
        code: `${rangeMinima}

print(range_minima([8, 3, 6, 1, 9], [("min", 3, 5), ("min", 4, 4), ("min", 0, 1)]))`,
        output: '[1, None, 8]',
        explanation:
          '[3, 5) holds 1 and 9; [4, 4) is empty; [0, 1) holds only 8.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          `${rangeMinima}

print(range_minima([2, 7, 5, 4, 6], [("min", 1, 3), ("min", 2, 5)]))`,
          '[5, 4]',
          '[1, 3) holds 7 and 5; [2, 5) holds 5, 4, and 6.',
        ),
        typeOutput(
          'What does this program print?',
          `${rangeMinima}

print(range_minima([], [("min", 0, 0)]))`,
          '[None]',
          'The empty query is answered before the tree is ever read.',
        ),
        choose(
          'Which positions does ("min", 1, 4) cover?',
          ['1, 2, 3, and 4', '1, 2, and 3', '2, 3, and 4', '1 and 4'],
          1,
          'Half-open ranges include left and exclude right.',
        ),
        typeOutput(
          'What does this program print?',
          `${rangeMinima}

operations = [("min", 1, 1), ("set", 2, 1), ("min", 0, 2), ("min", 2, 3)]
print(range_minima([5, 5, 5], operations))`,
          '[None, 5, 1]',
          'The update at index 2 is outside [0, 2) but inside [2, 3).',
        ),
      ],
    },
    {
      title: 'Choose an associative combine and its identity',
      explanation: [
        'A segment tree works for any associative combine: min, max, or sum. Padding uses the combine’s identity, the value that changes nothing: infinity for min, -infinity for max, 0 for sum.',
        'Associativity matters because a query combines node summaries in groupings that differ from a simple left-to-right scan. Building costs O(n), and each operation O(log n).',
      ],
      example: {
        code: `def build(values, combine, identity):
    size = 1
    while size < len(values):
        size *= 2
    tree = [identity] * (2 * size)
    tree[size:size + len(values)] = values
    for node in range(size - 1, 0, -1):
        tree[node] = combine(tree[2 * node], tree[2 * node + 1])
    return tree

print(build([3, 8, 2], min, float("inf"))[1])
print(build([3, 8, 2], max, float("-inf"))[1])`,
        output: '2\n8',
        explanation:
          'The same code builds a minimum tree or a maximum tree depending on the combine and identity passed in.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          `def build(values, combine, identity):
    size = 1
    while size < len(values):
        size *= 2
    tree = [identity] * (2 * size)
    tree[size:size + len(values)] = values
    for node in range(size - 1, 0, -1):
        tree[node] = combine(tree[2 * node], tree[2 * node + 1])
    return tree

print(build([3, 8, 2], max, float("-inf")))`,
          '[-inf, 8, 8, 2, 3, 8, 2, -inf]',
          'The padding leaf is -infinity, so node 3 keeps 2 and the root keeps 8.',
        ),
        choose(
          'Which combine and identity pair is wrong?',
          [
            'min with identity infinity',
            'sum with identity 0',
            'max with identity infinity',
            'max with identity -infinity',
          ],
          2,
          'max(x, infinity) is infinity, so that padding would swamp every real value.',
        ),
        choose(
          'Why must the combine operation be associative?',
          [
            'Python only accepts associative functions as arguments',
            'Queries group node summaries differently from a left-to-right scan',
            'So the unused padding leaves can be skipped',
            'So the leaves stay in sorted order after updates',
          ],
          1,
          'Only an associative combine gives the same answer for every grouping of the same values.',
        ),
        choose(
          'Building a segment tree for n values costs...',
          ['O(n log n)', 'O(n²)', 'O(log n)', 'O(n)'],
          3,
          'Each of fewer than 2 × size nodes is computed once from its two children.',
        ),
      ],
    },
  ],

  'cp-lifting-parent-row': [
    {
      title: 'Store each vertex’s immediate parent in row 0',
      explanation: [
        'A parent-pointer forest stores parents[v], the vertex one edge above v, with -1 for a root. This list is row 0 of a binary-lifting table: the ancestor 2^0 = 1 step up.',
        'Indices are labels, not depths. A parent may have a larger index than its child, and a forest may have several roots.',
      ],
      example: {
        code: `parents = [2, 2, -1, 1]
print(parents[3], parents[parents[3]])`,
        output: '1 2',
        explanation:
          'Vertex 3’s parent is 1, and 1’s parent is 2, so two lookups find 3’s grandparent.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          `parents = [-1, 0, 0, 2, 2]
print(parents[4], parents[parents[4]])`,
          '2 0',
          'Vertex 4’s parent is 2, and 2’s parent is the root 0.',
        ),
        choose(
          'parents = [3, -1, 1, -1]. Which vertices are roots?',
          ['0 and 2', 'Only 1', 'Only 3', '1 and 3'],
          3,
          'Roots are exactly the vertices whose entry is -1.',
        ),
        choose(
          'parents = [2, 2, -1]. Is it valid for vertex 0’s parent to have a larger index?',
          [
            'No, parents must come before children',
            'Yes, because indices are labels, not depths',
            'Only for roots',
            'Only when there is a single root',
          ],
          1,
          'Any acyclic assignment of parents is a valid forest, whatever the numbering.',
        ),
        typeOutput(
          'What does this program print?',
          `parents = [1, -1, 1, 0]
print(parents[3], parents[parents[3]], parents[parents[parents[3]]])`,
          '0 1 -1',
          'From 3 the chain goes to 0, then 1, then past the root to -1.',
        ),
      ],
    },
    {
      title: 'Guard the -1 sentinel and copy the row',
      explanation: [
        '-1 means "no ancestor", but Python reads parents[-1] as the last entry without complaint. Always check for -1 before using a value as an index.',
        'Build the table from parents[:], a copy, so constructing later rows never changes the caller’s forest.',
      ],
      example: {
        code: `parents = [-1, 0, 1]
root_parent = parents[0]
print(root_parent)
print(parents[root_parent])`,
        output: '-1\n1',
        explanation:
          'The root has no parent, yet parents[-1] silently returns 1, a made-up "grandparent".',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          `parents = [-1, 0, 0, 1]
print(parents[parents[0]])`,
          '1',
          'parents[0] is -1, and parents[-1] is the last entry, 1.',
        ),
        typeOutput(
          'What does this program print?',
          `parents = [-1, 0, 0, 1]
v = 0
above = parents[v]
if above != -1:
    above = parents[above]
print(above)`,
          '-1',
          'The guard stops at the root, so the missing grandparent stays -1.',
        ),
        typeOutput(
          'What does this program print?',
          `parents = [-1, 0, 1]
row = parents[:]
row[2] = -1
print(parents, row)`,
          '[-1, 0, 1] [-1, 0, -1]',
          'parents[:] makes a separate list, so only row changes.',
        ),
        choose(
          'Why does the table start from a copy of the parent list?',
          [
            'Copied lists are faster to index than originals',
            'Later table construction must not change the caller’s forest',
            'The copy removes the -1 entries for roots',
            'Python forbids reading a list passed as an argument',
          ],
          1,
          'The caller may still need the original parent pointers after preprocessing.',
        ),
      ],
    },
  ],

  'cp-lifting-compose-jumps': [
    {
      title: 'Follow the previous row twice to double the distance',
      explanation: [
        'If previous[v] is the ancestor d steps above v, then previous[previous[v]] is 2d steps above. Row j + 1 is built from row j this way, so row j jumps 2^j edges.',
        'Each new row is one list comprehension over the previous row.',
      ],
      example: {
        code: `${doubledJumps}

print(doubled_jumps([-1, 0, 1, 2, 3, 4]))`,
        output: '[-1, -1, 0, 1, 2, 3]',
        explanation:
          'On a chain, each vertex’s two-step ancestor is the vertex two positions earlier.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          `${doubledJumps}

print(doubled_jumps([-1, 0, 0, 1, 2]))`,
          '[-1, -1, -1, 0, 0]',
          'Vertices 3 and 4 have grandparent 0; vertices 1 and 2 have none.',
        ),
        typeOutput(
          'What does this program print?',
          `${doubledJumps}

chain = [-1, 0, 1, 2, 3, 4, 5]
print(doubled_jumps(doubled_jumps(chain)))`,
          '[-1, -1, -1, -1, 0, 1, 2]',
          'Doubling twice gives four-step ancestors: vertex 6 reaches 2.',
        ),
        typeNumber(
          'Row j jumps 2^j edges. How far does row 5 jump?',
          32,
          'Each row doubles the previous distance: 1, 2, 4, 8, 16, 32.',
        ),
        choose(
          'How is up[j + 1][v] computed from row j?',
          [
            'up[j][v] + up[j][v], or -1 if up[j][v] is -1',
            'up[0][up[j][v]], or -1 if up[j][v] is -1',
            '2 * up[j][v], or -1 if up[j][v] is -1',
            'up[j][up[j][v]], or -1 if up[j][v] is -1',
          ],
          3,
          'Jumping 2^j twice moves 2^(j + 1) edges; vertex labels are not distances, so they cannot be added.',
        ),
      ],
    },
    {
      title: 'Keep missing ancestors missing',
      explanation: [
        'If the first jump already leaves the tree (-1), there is no ancestor twice as far either. The comprehension checks for -1 before indexing, so the doubled entry stays -1.',
        'Without the check, previous[-1] reads the last vertex’s entry and invents an ancestor for a root.',
      ],
      example: {
        code: `previous = [-1, 0, 1]
print([previous[a] for a in previous])
print([-1 if a == -1 else previous[a] for a in previous])`,
        output: '[1, -1, 0]\n[-1, -1, 0]',
        explanation:
          'The unguarded row claims the root 0 has a two-step ancestor 1; the guarded row keeps -1.',
      },
      questions: [
        typeOutput(
          'This version has no -1 check. What does it print?',
          `previous = [-1, 0, 0, 2]
print([previous[a] for a in previous])`,
          '[2, -1, -1, 0]',
          'The root’s -1 reads previous[-1] = 2, inventing an ancestor.',
        ),
        typeOutput(
          'What does this program print?',
          `${doubledJumps}

print(doubled_jumps([-1, 0, 0, 2]))`,
          '[-1, -1, -1, 0]',
          'Only vertex 3 has a grandparent, 0; every other entry stays missing.',
        ),
        typeNumber(
          'Vertex v has up[2][v] = -1. What is up[3][v]?',
          -1,
          'If no ancestor exists 4 steps up, none exists 8 steps up.',
        ),
        typeOutput(
          'This forest has two roots. What does the program print?',
          `${doubledJumps}

print(doubled_jumps([-1, 0, -1, 2, 3]))`,
          '[-1, -1, -1, -1, 2]',
          'Only vertex 4 is two steps below anything: 4 → 3 → 2.',
        ),
      ],
    },
  ],

  'cp-lifting-query-bits': [
    {
      title: 'Use row j for each set bit j of the distance',
      explanation: [
        'Any distance k is a sum of distinct powers of two, one per set bit. For each set bit j, replace the current vertex with table[j][vertex]. After processing some bits, the vertex has moved exactly the distance those bits represent.',
        'The jumps can be taken in any order, because they only add up distances along one path toward the root.',
      ],
      example: {
        code: `${liftingTable}

table = lifting_table([-1, 0, 1, 2, 3, 4, 5, 6], 3)
print(jump_ancestor(table, 7, 5))`,
        output: '2',
        explanation:
          '5 = 101 in binary: one step takes 7 to 6, then a four-step jump takes 6 to 2.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          `${liftingTable}

table = lifting_table([-1, 0, 1, 2, 3, 4, 5, 6], 3)
print(jump_ancestor(table, 7, 6))`,
          '1',
          '6 = 110: a two-step jump takes 7 to 5, then a four-step jump takes 5 to 1.',
        ),
        typeOutput(
          'What does this program print?',
          `${liftingTable}

table = lifting_table([-1, 0, 1, 2, 3, 4, 5, 6], 3)
print(jump_ancestor(table, 7, 3), jump_ancestor(table, 5, 0))`,
          '4 5',
          'Three steps from 7 reach 4; zero steps leave 5 where it is.',
        ),
        choose(
          'Which rows answer a jump of 13?',
          [
            'Rows 1, 3, and 4',
            'Row 13',
            'Rows 0, 2, and 3',
            'Rows 0 through 3',
          ],
          2,
          '13 = 1101 in binary: 1 + 4 + 8.',
        ),
        choose(
          'Does processing the bits from high to low instead of low to high change the answer?',
          [
            'Yes, only high to low reaches the right vertex',
            'Only for even distances, which split evenly',
            'Yes, only low to high matches the table rows',
            'No, the jumps add up to the same distance either way',
          ],
          3,
          'Every jump moves toward the root, so the order of the pieces does not matter.',
        ),
      ],
    },
    {
      title: 'Reject distances of n or more and stop at -1',
      explanation: [
        'In a forest of n vertices, any upward path has at most n - 1 edges, so k >= n has no ancestor. Check this first: a huge k has set bits beyond the last table row.',
        'If a jump lands on -1, stop; the ancestor does not exist, and reading table[j][-1] would return a wrong entry. Zero steps return the original vertex.',
      ],
      example: {
        code: `${liftingTable}

table = lifting_table([-1, 0, 1, 2, 3, 4, 5, 6], 3)
print(jump_ancestor(table, 2, 5))
print(jump_ancestor(table, 7, 100))`,
        output: '-1\n-1',
        explanation:
          'Vertex 2 has only two ancestors, so the loop stops at -1. 100 >= 8 is rejected before any lookup.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          `${liftingTable}

table = lifting_table([-1, 0, 1, 2, 3, 4, 5, 6], 3)
print(jump_ancestor(table, 3, 3), jump_ancestor(table, 3, 4))`,
          '0 -1',
          'Vertex 3 is exactly three steps below the root, so four steps go past it.',
        ),
        choose(
          'Without the steps >= n check, what happens for steps = 2**40 on a table with 3 rows?',
          [
            'It returns -1, since the loop stops at -1',
            'It returns the root of the vertex’s tree',
            'It reaches bit 40 and indexes a row that does not exist',
            'It loops forever, since steps never reaches 0',
          ],
          2,
          'Bits 0 through 39 are unset, so the vertex stays valid until table[40] is read.',
        ),
        choose(
          'Why is k >= n always -1 in an n-vertex forest?',
          [
            'Roots are stored at index n, past every vertex',
            'The table has n rows, so larger k has no row',
            'Python truncates k to n, which lands on a root',
            'An upward path never repeats a vertex, so it has under n edges',
          ],
          3,
          'The forest is acyclic, so a path cannot revisit a vertex.',
        ),
        typeOutput(
          'What does this program print?',
          `${liftingTable}

table = lifting_table([-1, 0, 1, 2, 3, 4, 5, 6], 3)
print(jump_ancestor(table, 6, 0), jump_ancestor(table, 0, 1))`,
          '6 -1',
          'Zero steps return the vertex itself; the root has no parent.',
        ),
      ],
    },
  ],

  'cp-binary-lifting': [
    {
      title: 'Build max(1, n.bit_length()) doubling rows',
      explanation: [
        'Only distances below n need answers, and those fit in n.bit_length() bits, so that many rows suffice; max(1, ...) keeps at least the parent row. Row 0 is a copy of parents, and each later row doubles the previous one.',
        'The table has O(log n) rows of n entries, so preprocessing costs O(n log n) time and space.',
      ],
      example: {
        code: `parents = [-1, 0, 0, 1, 3]
n = len(parents)
up = [parents[:]]
for _ in range(1, max(1, n.bit_length())):
    previous = up[-1]
    up.append([-1 if parent == -1 else previous[parent] for parent in previous])
for row in up:
    print(row)`,
        output: '[-1, 0, 0, 1, 3]\n[-1, -1, -1, 0, 1]\n[-1, -1, -1, -1, -1]',
        explanation:
          '5 needs 3 bits, so there are rows for 1, 2, and 4 steps. No vertex here is 4 steps deep.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          `print((5).bit_length(), (8).bit_length(), (1).bit_length())`,
          '3 4 1',
          '5 = 101 has 3 bits, 8 = 1000 has 4, and 1 has 1.',
        ),
        typeNumber(
          'A forest has 1,000 vertices. How many rows does the table need?',
          10,
          'Distances up to 999 fit in 10 bits, since 2^10 = 1024.',
        ),
        typeOutput(
          'What does this program print?',
          `parents = [-1, 0, 1, 1, 2]
previous = parents[:]
print([-1 if parent == -1 else previous[parent] for parent in previous])`,
          '[-1, -1, 0, 0, 1]',
          'Row 1 holds two-step ancestors: 2 and 3 reach 0, and 4 reaches 1.',
        ),
        choose(
          'What do preprocessing time and space grow like?',
          ['O(n)', 'O(n²)', 'O(log n)', 'O(n log n)'],
          3,
          'There are about log₂ n rows, each with n entries.',
        ),
      ],
    },
    {
      title: 'Answer each kth-ancestor query bit by bit',
      explanation: [
        'For a query (vertex, k), walk the bits of k from low to high and follow row j for each set bit j. Each query takes O(log n) jumps, however large the tree is.',
        'Parents may have larger indices than their children, and the forest may have several roots; the table handles both without changes.',
      ],
      example: {
        code: `${kthAncestors}

print(kth_ancestors([-1, 0, 1, 2, 3, 4], [(5, 3), (5, 5), (4, 1), (2, 0)]))`,
        output: '[2, 0, 3, 2]',
        explanation:
          'On the chain 5 → 4 → 3 → 2 → 1 → 0, three steps from 5 reach 2 and five steps reach the root.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          `${kthAncestors}

print(kth_ancestors([2, 2, -1, 0, 3], [(4, 2), (4, 3), (1, 1)]))`,
          '[0, 2, 2]',
          'The chain is 4 → 3 → 0 → 2, and 1’s parent is 2.',
        ),
        typeOutput(
          'This forest has two roots. What does the program print?',
          `${kthAncestors}

print(kth_ancestors([-1, 0, -1, 2, 3], [(4, 2), (4, 3), (1, 2)]))`,
          '[2, -1, -1]',
          '4 → 3 → 2 reaches root 2 in two steps; a third step leaves the tree. Vertex 1 is one step below its root.',
        ),
        choose(
          'A query asks for the 6th ancestor. Which rows does it use?',
          ['Rows 0 and 6', 'Row 6', 'Rows 1 and 2', 'Rows 0, 1, and 2'],
          2,
          '6 = 110 in binary: 2 + 4.',
        ),
        choose(
          'How long does each query take?',
          [
            'O(n), one step per vertex',
            'O(k), one step per edge climbed',
            'O(1), a single table lookup',
            'O(log n), one jump per set bit',
          ],
          3,
          'k < n has at most about log₂ n bits, one jump per set bit.',
        ),
      ],
    },
    {
      title: 'Handle k = 0, missing ancestors, and huge k',
      explanation: [
        'k = 0 returns the vertex itself. Any k >= n returns -1 immediately, even if k has a hundred digits. During a walk, reaching -1 stops the loop, so -1 is never used as an index.',
        'An empty forest builds one empty row and accepts only an empty query list.',
      ],
      example: {
        code: `${kthAncestors}

print(kth_ancestors([-1], [(0, 0), (0, 1), (0, 10**30)]))`,
        output: '[0, -1, -1]',
        explanation:
          'Zero steps stay at the root; one step or a huge number of steps leave the tree.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          `${kthAncestors}

print(kth_ancestors([-1, 0, 1], [(2, 0), (2, 2), (2, 3), (2, 10**18)]))`,
          '[2, 0, -1, -1]',
          'Vertex 2 is two steps below the root, so 3 or more steps return -1.',
        ),
        typeOutput(
          'This table is built without the -1 check. What does it print for the root’s two-step ancestor?',
          `parents = [-1, 0, 1]
previous = parents[:]
row1 = [previous[parent] for parent in previous]
print(row1[0])`,
          '1',
          'previous[-1] is 1, so the root appears to have a two-step ancestor.',
        ),
        choose(
          'Why check steps >= n before reading the table?',
          [
            'Large k has bits past the last row, and its answer is -1',
            'To make k smaller before splitting it into bits',
            'Because every root is stored at index n',
            'To sort the queries by distance first',
          ],
          0,
          'The check is both a shortcut and a guard against indexing missing rows.',
        ),
        choose(
          'What does kth_ancestors([], []) return?',
          ['[-1]', 'An IndexError', 'None', '[]'],
          3,
          'One empty row is built, and with no queries the answer list stays empty.',
        ),
      ],
    },
  ],

  'cp-scc-reverse-edges': [
    {
      title: 'Flip the direction of every edge',
      explanation: [
        'The reverse of a directed graph turns each edge source → target into target → source. In adjacency form, reverse[v] lists every vertex that had an edge into v.',
        'Reversing twice restores the original graph, and a vertex that can reach v in the original is reachable from v in the reverse.',
      ],
      example: {
        code: `${reversedAdjacency}

print(reversed_adjacency(4, [(0, 1), (0, 2), (2, 3), (3, 0)]))`,
        output: '[[3], [0], [0], [2]]',
        explanation:
          'Each target collects its original sources: 0 was entered from 3, and 1 and 2 from 0.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          `${reversedAdjacency}

print(reversed_adjacency(3, [(1, 0), (2, 0), (0, 2)]))`,
          '[[1, 2], [], [0]]',
          'Vertex 0 had edges from 1 and 2, and vertex 2 had an edge from 0.',
        ),
        choose(
          'What does reversing a directed graph twice give?',
          [
            'An undirected graph',
            'A graph with no edges',
            'The original graph',
            'A graph with every edge doubled',
          ],
          2,
          'Each edge is flipped and then flipped back.',
        ),
        choose(
          'In the reversed graph, what does reverse[v] list?',
          [
            'Vertices that v points to in the original',
            'Vertices with an original edge into v',
            'All vertices reachable from v',
            'Vertices with no edges',
          ],
          1,
          'The original target v stores its sources as outgoing neighbors.',
        ),
        typeOutput(
          'What does this program print?',
          `${reversedAdjacency}

print(reversed_adjacency(3, [(2, 1), (1, 0)]))`,
          '[[1], [2], []]',
          'The chain 2 → 1 → 0 becomes 0 → 1 → 2.',
        ),
      ],
    },
    {
      title: 'Keep isolated vertices, duplicates, and self-loops',
      explanation: [
        'Allocate one separate list per vertex, even for vertices no edge touches; each is still a vertex of the graph. [[] for _ in range(n)] creates n different lists, while [[]] * n repeats one shared list.',
        'Duplicate edges reverse into duplicate entries, and a self-loop v → v stays a self-loop.',
      ],
      example: {
        code: `${reversedAdjacency}

print(reversed_adjacency(4, [(1, 1), (0, 1), (0, 1)]))`,
        output: '[[], [1, 0, 0], [], []]',
        explanation:
          'Vertex 1 keeps its self-loop and both copies of the edge from 0. Vertices 2 and 3 keep empty lists.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          `${reversedAdjacency}

print(reversed_adjacency(3, [(2, 2), (0, 2)]))`,
          '[[], [], [2, 0]]',
          'Both edges end at 2, so reverse[2] lists 2 itself and then 0.',
        ),
        typeOutput(
          'What does this program print?',
          `reverse = [[]] * 3
reverse[1].append(0)
print(reverse)`,
          '[[0], [0], [0]]',
          '[[]] * 3 repeats one list three times, so appending through any slot changes all of them.',
        ),
        choose(
          'Why allocate a list for vertex 3 when no edge touches it?',
          [
            'To store its edge count for later',
            'It is not needed; isolated vertices are skipped',
            'Only in case a self-loop is added later',
            'It is still a vertex and forms its own component',
          ],
          3,
          'Later passes iterate over every vertex and index reverse[v] for each one.',
        ),
        choose(
          'The edge 0 → 1 appears twice. What should reverse[1] contain?',
          ['[0, 0]', '[0]', '[]', '[1, 1]'],
          0,
          'Each copy of the edge is reversed separately, preserving multiplicity.',
        ),
      ],
    },
  ],

  'cp-scc-finish-order': [
    {
      title: 'Record a vertex when all its neighbors are done',
      explanation: [
        'Depth-first search finishes a vertex only after every neighbor it can still discover has finished. Finishing order therefore lists a vertex after everything it discovered, unlike discovery order, which lists it first.',
        'SCC algorithms need finishing order, not discovery order.',
      ],
      example: {
        code: `${finishOrder}

print(dfs_finish_order([[1, 2], [3], [], []]))`,
        output: '[3, 1, 2, 0]',
        explanation:
          'Discovery order is 0, 1, 3, 2, but 3 finishes first, then 1, then 2, and the root 0 last.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          `${finishOrder}

print(dfs_finish_order([[2], [0], []]))`,
          '[2, 0, 1]',
          'From root 0, vertex 2 finishes before 0. Root 1 starts later and finds 0 already seen.',
        ),
        typeOutput(
          'What does this program print?',
          `${finishOrder}

print(dfs_finish_order([[1], [2], [0]]))`,
          '[2, 1, 0]',
          'The search goes 0 → 1 → 2, finds 0 already seen, and finishes in reverse.',
        ),
        choose(
          'Where does a vertex appear in finishing order relative to the vertices it discovered?',
          ['Before them', 'In input order', 'After them', 'Always last'],
          2,
          'A vertex finishes only after every vertex it discovered has finished.',
        ),
        choose(
          'Discovery order for [[1, 2], [], []] is 0, 1, 2. What is its finishing order?',
          ['0, 1, 2', '2, 1, 0', '0, 2, 1', '1, 2, 0'],
          3,
          '1 and 2 have no neighbors and finish immediately; 0 finishes after both.',
        ),
      ],
    },
    {
      title: 'Pause each vertex with a (vertex, next_index) frame',
      explanation: [
        'An explicit stack replaces recursion. Each frame (vertex, next_index) remembers which neighbor to try next, so the search can descend into a neighbor and later resume exactly where it left off.',
        'A vertex is marked seen when it is pushed, so cycles, self-loops, and duplicate edges never push it twice. The stack is an ordinary list, so long chains do not hit Python’s recursion limit.',
      ],
      example: {
        code: `${finishOrder}

graph = [[i + 1] for i in range(2999)] + [[]]
order = dfs_finish_order(graph)
print(order[:3], len(order))`,
        output: '[2999, 2998, 2997] 3000',
        explanation:
          'A 3000-vertex chain would exceed the default recursion limit, but the frame stack handles it.',
      },
      questions: [
        choose(
          'The top frame is (4, 2). What does it mean?',
          [
            'Vertex 4 has exactly 2 neighbors left to examine',
            'Vertex 4 was the second vertex discovered',
            'Vertex 2 is the parent that pushed vertex 4',
            'Vertex 4 has tried neighbors 0 and 1 and tries index 2 next',
          ],
          3,
          'next_index counts how many of the vertex’s neighbors have been examined.',
        ),
        typeOutput(
          'What does this program print?',
          `${finishOrder}

print(dfs_finish_order([[2, 2], [1], [0]]))`,
          '[2, 0, 1]',
          'The duplicate edge to 2 and the self-loop at 1 find seen vertices, so nothing is pushed twice.',
        ),
        choose(
          'Python raises RecursionError around depth 1,000. Why does the frame stack avoid it?',
          [
            'Frames are smaller than function calls',
            'Frames live in an ordinary list, not on the call stack',
            'It visits fewer vertices than recursion does',
            'Python allows deeper loops than calls',
          ],
          1,
          'A list can grow as large as memory allows.',
        ),
        choose(
          'Why mark a vertex seen when it is pushed rather than when it finishes?',
          [
            'Otherwise a cycle could push an open vertex a second time',
            'To record its finishing time as early as possible',
            'Marking early makes the seen list faster to read',
            'So isolated vertices are skipped by the outer loop',
          ],
          0,
          'An open vertex reached again through a cycle must not get a second frame.',
        ),
      ],
    },
  ],

  'cp-scc-reverse-components': [
    {
      title: 'Search the reversed graph in decreasing finish order',
      explanation: [
        'Take the vertices in reversed finishing order. Each still-unseen vertex starts a traversal of the reversed graph, and everything that traversal reaches is one strongly connected component.',
        'The vertex that finished last belongs to a component that no other remaining component can reach, so following reversed edges from it cannot escape into another component.',
      ],
      example: {
        code: `${collectComponents}

reverse = [[1], [0], [1, 3], [2]]
print(collect_reverse_components(reverse, [3, 2, 1, 0]))`,
        output: '[[0, 1], [2, 3]]',
        explanation:
          'The original edges are 0 ↔ 1, 1 → 2, and 2 ↔ 3. Starting from 0 collects {0, 1}; the next unseen root, 2, collects {2, 3}.',
      },
      questions: [
        typeOutput(
          'The original edges are 0 → 1, 1 → 0, and 2 → 0, with finishing order [1, 0, 2]. What does this print?',
          `${collectComponents}

print(collect_reverse_components([[1, 2], [0], []], [1, 0, 2]))`,
          '[[0, 1], [2]]',
          'Root 2 has no reversed edges, so it is alone; root 0 then collects 1.',
        ),
        typeOutput(
          'This version walks the finishing order forward instead of reversed. What does it print?',
          `def wrong_components(reverse, order):
    seen = [False] * len(reverse)
    groups = []
    for root in order:
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

print(wrong_components([[1, 2], [0], []], [1, 0, 2]))`,
          '[[0, 1, 2]]',
          'Starting from 1 reaches 0 and then 2, merging a vertex that cannot be reached back.',
        ),
        choose(
          'Why does the second pass follow reversed edges?',
          [
            'Reversed lists are shorter, so they are faster to follow',
            'Original edges would miss the isolated vertices',
            'Reversing the edges sorts the components by size',
            'From the chosen root they reach only vertices that can reach it',
          ],
          3,
          'Combined with the finishing order, reversed reachability stops at the component boundary.',
        ),
        choose(
          'Which vertex starts the second pass?',
          [
            'The vertex that finished last in the first pass',
            'Vertex 0, since it starts both passes',
            'The vertex that finished first in the first pass',
            'The vertex with the most outgoing edges',
          ],
          0,
          'reversed(order) begins with the last vertex to finish.',
        ),
      ],
    },
    {
      title: 'Keep visited marks across roots and sort the groups',
      explanation: [
        'Visited marks are shared by the whole second pass. A vertex collected into one component is skipped when a later root reaches it, which keeps components separate.',
        'A vertex with no cycle through it is still its own singleton component. Sorting each group and then the list of groups gives one deterministic answer.',
      ],
      example: {
        code: `${collectComponents}

print(collect_reverse_components([[], [], []], [0, 1, 2]))`,
        output: '[[0], [1], [2]]',
        explanation: 'With no edges, every vertex is its own component.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          `${collectComponents}

print(collect_reverse_components([[0]], [0]))`,
          '[[0]]',
          'The self-loop leads back to a seen vertex, so the component is just [0].',
        ),
        choose(
          'A vertex has no self-loop and lies on no cycle. Which SCC contains it?',
          [
            'No SCC',
            'Its own singleton SCC',
            'The SCC of its parent',
            'Every SCC',
          ],
          1,
          'Every vertex belongs to exactly one SCC, possibly of size one.',
        ),
        typeOutput(
          'What does this program print?',
          `groups = [[3, 2], [1]]
print(sorted([sorted(group) for group in groups]))`,
          '[[1], [2, 3]]',
          'Each group is sorted first, then the groups are ordered by their first elements.',
        ),
        choose(
          'If the visited marks were reset for each new root in the second pass, what would go wrong?',
          [
            'A traversal could re-collect vertices from an earlier component',
            'Nothing, since each root starts a new component',
            'Isolated vertices would no longer form components',
            'The finishing order would be read in reverse',
          ],
          0,
          'Reversed edges can lead into components that were already collected; only the shared marks stop that.',
        ),
      ],
    },
  ],

  'cp-scc': [
    {
      title: 'Group vertices by mutual reachability',
      explanation: [
        'Two vertices are in the same strongly connected component when each can reach the other. Reaching in one direction is not enough. Every vertex belongs to exactly one SCC, possibly alone.',
        'A component with two or more vertices contains a directed cycle; a singleton contains one only through a self-loop.',
      ],
      example: {
        code: `${sccGroups}

print(scc_groups(4, [(0, 1), (1, 2), (2, 1), (2, 3)]))`,
        output: '[[0], [1, 2], [3]]',
        explanation:
          '1 and 2 reach each other. 0 reaches them but cannot be reached back, and 3 reaches nothing.',
      },
      questions: [
        choose(
          'The edges are 0 → 1, 1 → 2, 2 → 0, and 2 → 3. Which partition is correct?',
          [
            '[[0, 1, 2, 3]]',
            '[[0], [1], [2], [3]]',
            '[[0, 1], [2, 3]]',
            '[[0, 1, 2], [3]]',
          ],
          3,
          '0, 1, and 2 lie on one cycle; 3 cannot reach back.',
        ),
        typeOutput(
          'What does this program print?',
          `${sccGroups}

print(scc_groups(4, [(0, 1), (1, 2), (2, 3)]))`,
          '[[0], [1], [2], [3]]',
          'A one-way chain has no cycle, so every vertex is its own component.',
        ),
        choose(
          'u reaches v, but v cannot reach u. Are they in one SCC?',
          [
            'Yes, one direction is enough',
            'Only if they are adjacent',
            'No, both directions are required',
            'Only if u < v',
          ],
          2,
          'Strong connectivity requires paths both ways.',
        ),
        typeOutput(
          'What does this program print?',
          `${sccGroups}

print(scc_groups(5, [(0, 1), (1, 0), (3, 4), (4, 3), (1, 3)]))`,
          '[[0, 1], [2], [3, 4]]',
          'The edge 1 → 3 joins the two cycles in one direction only; isolated 2 is its own group.',
        ),
      ],
    },
    {
      title: 'Run Kosaraju’s two passes',
      explanation: [
        'Pass one runs DFS on the original graph and records finishing order. Pass two builds the reversed graph and traverses it in decreasing finishing order; each new traversal collects one whole SCC.',
        'Both passes touch each vertex and edge a constant number of times, so the algorithm runs in O(V + E), plus sorting for deterministic output.',
      ],
      example: {
        code: `${sccGroups}

print(scc_groups(5, [(0, 1), (1, 2), (2, 0), (3, 2), (3, 4), (4, 3)]))`,
        output: '[[0, 1, 2], [3, 4]]',
        explanation:
          '0, 1, 2 form one cycle and 3, 4 another; the edge 3 → 2 goes one way only.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          `${sccGroups}

print(scc_groups(6, [(0, 1), (1, 2), (2, 0), (2, 3), (3, 4), (4, 5), (5, 3)]))`,
          '[[0, 1, 2], [3, 4, 5]]',
          'Two separate cycles are joined by the one-way edge 2 → 3.',
        ),
        choose(
          'What does the first DFS pass give the second pass?',
          [
            'The finished components, ready to sort',
            'A finishing order that picks where each traversal starts',
            'The reversed graph, built during the search',
            'The number of components to look for',
          ],
          1,
          'The order is what keeps each reversed traversal inside one component.',
        ),
        choose(
          'What is the running time of the two passes?',
          [
            'O(V × E), one search per vertex',
            'O(V²), from the adjacency lists',
            'O(E log E), from sorting the edges',
            'O(V + E), plus sorting for the output',
          ],
          3,
          'Each pass visits every vertex once and examines every edge once.',
        ),
        typeOutput(
          'What does this program print?',
          `${sccGroups}

print(scc_groups(3, [(0, 0), (0, 1), (0, 1), (1, 2)]))`,
          '[[0], [1], [2]]',
          'A self-loop and duplicate edges create no path back from 1 to 0.',
        ),
      ],
    },
    {
      title: 'Contract the components into a DAG',
      explanation: [
        'Replace each SCC with a single vertex and keep one edge between different components when any original edge connects them. The result has no directed cycle: a cycle between two components would make them mutually reachable, so they would be one component.',
        'The contracted graph can then be processed with DAG tools, such as a topological order of groups.',
      ],
      example: {
        code: `${sccGroups}

${condense}

edges = [(0, 1), (1, 0), (1, 2), (2, 3), (3, 2), (3, 4)]
groups = scc_groups(5, edges)
print(groups)
print(condensed_edges(groups, 5, edges))`,
        output: '[[0, 1], [2, 3], [4]]\n[(0, 1), (1, 2)]',
        explanation:
          'Component 0 = {0, 1}, 1 = {2, 3}, and 2 = {4}. Edges inside a component disappear, leaving a chain of groups.',
      },
      questions: [
        choose(
          'After contraction, components A and B have edges A → B and B → A. What must be true?',
          [
            'The original graph has a self-loop',
            'A and B are both singleton components',
            'They were really one SCC, so the partition is wrong',
            'Nothing unusual; DAGs can contain such pairs',
          ],
          2,
          'Paths both ways mean every vertex of A and B is mutually reachable.',
        ),
        typeOutput(
          'What does this program print?',
          `${condense}

edges = [(0, 1), (1, 0), (0, 2), (1, 2), (2, 3)]
print(condensed_edges([[0, 1], [2], [3]], 4, edges))`,
          '[(0, 1), (1, 2)]',
          'Edges inside {0, 1} vanish, and the two edges into vertex 2 become one group edge.',
        ),
        choose(
          'Every SCC of a 7-vertex graph is a singleton. What does that say about the graph?',
          [
            'It has no edges between vertices',
            'It is strongly connected as a whole',
            'Every vertex has a self-loop',
            'Apart from possible self-loops, it is a DAG',
          ],
          3,
          'Any cycle through two or more vertices would form a larger component.',
        ),
        choose(
          'Which question can be answered on the contracted DAG?',
          [
            'Ordering groups of mutually dependent tasks topologically',
            'Finding the shortest edge inside each group',
            'Counting the self-loops of every vertex',
            'Sorting the original vertices by their index',
          ],
          0,
          'Within a group tasks depend on each other cyclically, but the groups themselves form a DAG.',
        ),
      ],
    },
  ],
};

export const knowledgePoints: KnowledgePointModule = {
  ...dynamic,
  ...strategy,
  ...numberTheory,
  ...range,
};
