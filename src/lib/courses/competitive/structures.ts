import type { Skill } from '../../curriculum';
import {
  choice,
  exercise,
  skill,
  withLargeCase,
  withoutShortcuts,
} from './shared';

export const competitiveStructures: Skill[] = [
  skill(
    'cp-stacks',
    'cp-structures',
    'Undo the most recent action',
    'Use a last-in, first-out invariant to replay a reversible history.',
    ['cp-stack-peek', 'cp-stack-pop', 'cp-complexity'],
    [
      'A stack exposes the most recently added item first. Use a Python list: append pushes onto its right end, pop removes that end, and stack[-1] inspects it. After each command, the stack should contain exactly the actions that remain active, in their original order.',
      'For an undo command, remove only the latest active action. If the stack is empty, decide what undo means before coding; this lesson ignores it. Test emptiness before pop because removing from an empty list raises IndexError. A queue would remove the oldest action and implement a different rule.',
      'Processing n commands takes O(n) amortized time because each command causes at most one push or pop. The stack can contain n items, so auxiliary space is O(n). Stack operations at the right end avoid the shifting cost of repeatedly removing a list’s first item.',
    ],
    `history = []
for command in ["draft", "review", "UNDO", "publish"]:
    if command == "UNDO":
        if history:
            history.pop()
    else:
        history.append(command)
print(history)
print(history[-1])`,
    `['draft', 'publish']
publish`,
    'Undo removes review, the latest active action; draft remains before publish.',
    [
      choice(
        'What remains after push("a"), push("b"), pop(), push("c")?',
        ['["b", "c"]', '["a", "c"]', '["c", "a"]', '["a", "b", "c"]'],
        1,
        'pop removes b, which was pushed most recently. The surviving order is a then c.',
        'Track the rightmost item after every operation.',
      ),
      choice(
        'Which guard makes an ignored empty undo safe?',
        [
          'if stack: stack.pop()',
          'if not stack: stack.pop()',
          'stack.pop(0)',
          'stack[-1].pop()',
        ],
        0,
        'An empty list is false, so the guard prevents an invalid pop.',
        'Only remove an item when one exists.',
      ),
      choice(
        'Why is a list stack useful for n undoable commands?',
        [
          'It sorts each command automatically.',
          'It limits memory to one item.',
          'It always removes the oldest action.',
          'Each command needs at most one amortized O(1) end operation.',
        ],
        3,
        'The total number of end operations is at most n; a growing list can still require O(n) space.',
        'Count pushes and pops rather than repeatedly scanning history.',
      ),
      exercise(
        'Implement replay(tokens). Each string other than "#" records an action; "#" undoes the most recent recorded action, or does nothing when there is none. Return a new list of surviving strings in recording order. Preserve tokens, including duplicate actions.',
        `def replay(tokens):
    # Maintain the surviving actions as a stack.
    pass`,
        `def replay(tokens):
    active = []
    for token in tokens:
        if token == "#":
            if active:
                active.pop()
        else:
            active.append(token)
    return active`,
        `assert replay([]) == [], "An empty history stays empty."
assert replay(["#", "#"]) == [], "Ignore undo when nothing is active."
assert replay(["red", "blue", "#", "green"]) == ["red", "green"], "Undo the latest action."
assert replay(["a", "a", "#"]) == ["a"], "Duplicate actions are separate stack entries."
assert replay(["a", "b", "#", "#", "#", "c"]) == ["c"], "Repeated undo can exhaust the history."
source = ["x", "y", "#"]
assert replay(source) == ["x"]
assert source == ["x", "y", "#"], "Do not mutate the input."`,
        'The list contains exactly the currently active actions. Each undo changes only its right end.',
        'Append ordinary strings; for "#", pop only if the result list is nonempty.',
      ),
    ],
    [
      [
        'What invariant defines a stack?',
        'The last item pushed is the first item popped: last in, first out.',
      ],
      [
        'How do you safely ignore undo on an empty Python stack?',
        'Check if stack before stack.pop(); use append and pop at the list’s right end.',
      ],
    ],
  ),
  skill(
    'cp-monotonic-stack',
    'cp-structures',
    'Resolve pending values in order',
    'Keep unresolved indices in a monotonic stack to avoid repeated scans.',
    ['cp-stack-operation-budget', 'cp-complexity'],
    [
      'Suppose every measurement needs the first strictly greater measurement to its right. A left-to-right scan keeps indices whose answer is still unknown. Their values are nonincreasing from the bottom to the top: a new value removes every smaller value on top before joining the stack.',
      'When the current value pops an old index, it is that index’s first greater value: all intervening values already failed to exceed it. Use < in the popping condition for strictly greater answers. Equal values stay pending because equality does not satisfy the question.',
      'Although a while loop sits inside a for loop, each index enters once and leaves at most once. Total time is O(n), with O(n) space for the stack and answers. Indices left in the stack have no greater value to their right, so their default answer remains None.',
    ],
    `values = [4, 2, 2, 6, 3]
answer = [None] * len(values)
pending = []
for index, value in enumerate(values):
    while pending and values[pending[-1]] < value:
        answer[pending.pop()] = value
    pending.append(index)
print(answer)`,
    '[6, 6, 6, None, None]',
    'The value 6 resolves all three earlier pending measurements; 3 resolves none.',
    [
      choice(
        'For [3, 3, 5], what are the first strictly greater values to the right?',
        ['[3, 5, None]', '[5, None, None]', '[5, 5, None]', '[5, 5, 5]'],
        2,
        'Neither 3 is strictly greater than the other; 5 is the first qualifying value for both.',
        'Equality must leave an index unresolved.',
      ),
      choice(
        'What does an index left on the stack after the full scan mean?',
        [
          'No strictly greater value occurs to its right.',
          'It was never inspected.',
          'It must contain the global minimum.',
          'Its answer is the immediately next value.',
        ],
        0,
        'Any later strictly greater value would have popped and answered it.',
        'The stack holds pending answers.',
      ),
      choice(
        'Why does the nested scan still take O(n) time?',
        [
          'Every while loop runs exactly once.',
          'Each index is pushed once and popped at most once.',
          'Python runs nested loops in parallel.',
          'The values must already be sorted.',
        ],
        1,
        'Charging each push and pop to its index bounds all stack operations by 2n.',
        'Count operations over the entire run.',
      ),
      exercise(
        'Implement later_larger(values) for a list of integers. Return one result per index: the value at the first later index with a strictly greater value, or None if none exists. Preserve values. Equal measurements do not count. A hidden case with 200,000 values must finish within 3 seconds.',
        `def later_larger(values):
    # Store unresolved indices, not only their values.
    pass`,
        `def later_larger(values):
    result = [None] * len(values)
    pending = []
    for index, value in enumerate(values):
        while pending and values[pending[-1]] < value:
            result[pending.pop()] = value
        pending.append(index)
    return result`,
        withLargeCase(
          `assert later_larger([]) == [], "Handle an empty sequence."
assert later_larger([7]) == [None], "A final value has no later answer."
assert later_larger([2, 7, 4, 9]) == [7, 9, 9, None], "Choose the first greater value, not the maximum."
assert later_larger([4, 4, 6]) == [6, 6, None], "Equal values do not resolve each other."
assert later_larger([9, 6, 3]) == [None, None, None], "Decreasing values stay pending."
assert later_larger([-3, -5, -2]) == [-2, -2, None], "Ordering also works for negative values."
source = [1, 2]
assert later_larger(source) == [2, None]
assert source == [1, 2], "Preserve the source."`,
          `_noise = _numbers(200000, 0, 3, 101)
_values = [4 * abs(i - 100000) + _noise[i] for i in range(200000)]
_result, _seconds = _timed(later_larger, _values)
assert _checksum(_result) == 2138251954847895676, "The 200,000-value case returned wrong answers."
_check_time(_seconds, "The 200,000-value case", "Keep unresolved indices on a stack instead of scanning forward from every index.")`,
        ),
        'Indices allow the algorithm to place each answer at its original position when a later value resolves it.',
        'While the current value is greater than the top pending value, pop its index and fill that answer.',
      ),
    ],
    [
      [
        'Why can a monotonic-stack scan with a nested while loop be O(n)?',
        'Each index is pushed once and popped at most once, so total stack work is linear.',
      ],
      [
        'Which comparison resolves a strictly greater value to the right?',
        'Pop while the old value < the current value; equality stays pending.',
      ],
    ],
  ),
  skill(
    'cp-heaps',
    'cp-structures',
    'Take the cheapest available item',
    'Maintain a minimum priority without sorting again after each change.',
    ['cp-heap-updates', 'cp-sort-key'],
    [
      'A min-heap preserves one ordering rule: every parent is no larger than its children. The smallest item is therefore heap[0], but the entire list need not be sorted. Python’s heapq functions maintain this rule using an ordinary list.',
      'heapify rearranges an existing list in O(n) time. heappush adds an item and heappop removes the minimum, each in O(log n) time for a heap of n items. Check that the heap is nonempty before popping. Copy an input list before heapifying when its caller needs the original order.',
      'Heaps are useful when priorities change as work arrives. With n items and e interleaved arrivals and removals, building a heap then updating it costs O(n + e log n); re-sorting or scanning for the minimum after every event costs O(n) or more per event. Tuple priorities compare later fields when earlier fields tie; include a comparable tie-breaker if payload objects themselves cannot be ordered.',
    ],
    `import heapq
jobs = [8, 2, 5]
heapq.heapify(jobs)
heapq.heappush(jobs, 3)
print(heapq.heappop(jobs))
print(heapq.heappop(jobs))
print(jobs[0])`,
    `2
3
5`,
    'After an inserted priority 3, the next removals are 2 and 3; 5 becomes the minimum.',
    [
      choice(
        'Which statement is guaranteed by a nonempty Python min-heap?',
        [
          'Every adjacent pair is sorted.',
          'The largest value is at index 0.',
          'All values are distinct.',
          'Index 0 contains a smallest value.',
        ],
        3,
        'Only the parent-child invariant is required; arbitrary adjacent positions need not be ordered.',
        'Distinguish the root guarantee from a completely sorted sequence.',
      ),
      choice(
        'What is the cost of heapify on an existing n-item list?',
        ['O(n)', 'O(n²)', 'O(1)', 'O(n log n) in every case'],
        0,
        'Bottom-up heap construction is linear; pushing n items one at a time has a different bound.',
        'Building from an existing array is not n independent insertions.',
      ),
      choice(
        'A heap stores (priority, payload) and two priorities tie. What can go wrong?',
        [
          'The heap necessarily loses one item.',
          'heappop returns both items together.',
          'Python may try to compare payloads that cannot be ordered.',
          'Tuple heaps silently switch to a max-heap.',
        ],
        2,
        'Tuple comparison continues to the next field on a tie. A unique numeric counter avoids comparing payloads.',
        'Consider what tuple comparison does after equal first fields.',
      ),
      exercise(
        'Implement take_cheapest(stock, events). stock is a list of integer prices already available. Each event is ("add", price), which makes one more item available, or ("take",), which removes the cheapest available item and records its price, or records None when nothing is available. Return the recorded results in event order, preserving duplicates and both inputs. Use a heap: a hidden case with 100,000 items and 200,000 events must finish within 3 seconds.',
        `import heapq

def take_cheapest(stock, events):
    pass`,
        `import heapq

def take_cheapest(stock, events):
    heap = list(stock)
    heapq.heapify(heap)
    taken = []
    for event in events:
        if event[0] == "add":
            heapq.heappush(heap, event[1])
        elif heap:
            taken.append(heapq.heappop(heap))
        else:
            taken.append(None)
    return taken`,
        withLargeCase(
          `assert take_cheapest([], []) == [], "No events record nothing."
assert take_cheapest([], [("take",)]) == [None], "Nothing is available to take."
assert take_cheapest([8, 2, 5], [("take",), ("take",)]) == [2, 5], "Take the cheapest items in order."
assert take_cheapest([8, 2], [("add", 1), ("take",), ("take",)]) == [1, 2], "A new arrival can be the cheapest."
assert take_cheapest([3], [("add", 3), ("take",), ("take",), ("take",)]) == [3, 3, None], "Equal prices are separate items."
assert take_cheapest([-2, 4], [("take",), ("add", -7), ("add", 9), ("take",), ("take",)]) == [-2, -7, 4]
stock = [8, 3, 6]
events = [("take",), ("add", 1)]
assert take_cheapest(stock, events) == [3]
assert stock == [8, 3, 6] and events == [("take",), ("add", 1)], "Heapify a copy, not the caller's list."`,
          `_stock = _numbers(100000, 1, 10**6, 111)
_kinds = _numbers(200000, 0, 1, 112)
_prices = _numbers(200000, 1, 10**6, 113)
_events = [("add", _prices[i]) if _kinds[i] else ("take",) for i in range(200000)]
_result, _seconds = _timed(take_cheapest, _stock, _events)
assert _checksum(_result) == 2178764430499123940, "The 200,000-event case returned wrong prices."
_check_time(_seconds, "The 200,000-event case", "Keep the available prices in a heap instead of searching or re-sorting them for every event.")`,
        ),
        'heapify builds the starting heap from a copy, each arrival is one heappush, and each take is one heappop, so the minimum is always available in O(log n).',
        'Heapify list(stock), then push on "add" and pop on "take", recording None when the heap is empty.',
      ),
    ],
    [
      [
        'What does a min-heap guarantee?',
        'Every parent is no greater than its children; the root holds a minimum, but the array need not be sorted.',
      ],
      [
        'What are the main heapq operation costs?',
        'heapify: O(n); heappush and heappop: O(log n); reading heap[0]: O(1).',
      ],
    ],
  ),
  skill(
    'cp-tries',
    'cp-structures',
    'Share prefixes without losing words',
    'Represent common character paths and keep word endings explicit.',
    ['cp-trie-prefix-count', 'cp-hashing'],
    [
      'A trie stores a word as a path of character edges from a root. Words with the same prefix reuse that path. A node must also record whether a complete word ends there: a path for "oakwood" does not by itself prove that "oak" was inserted.',
      'Dictionaries can map each character to its child node. A separate end marker or field distinguishes complete words from prefixes. For prefix occurrence counts, store how many inserted words pass through every node, including the root. Count duplicates separately only when the input contract treats words as occurrences.',
      'Building from W words totaling L characters takes O(W + L) expected time and O(L + 1) space, assuming expected O(1) dictionary access. Counting W matters when some words are empty. A prefix query of length p takes O(p + 1) expected time. The empty prefix reaches the root and matches every inserted occurrence, even an empty word.',
    ],
    `root = {}
for word in ["oak", "oar", "oakwood"]:
    node = root
    for letter in word:
        if letter not in node:
            node[letter] = {}
        node = node[letter]
    node[None] = True

def contains(word):
    node = root
    for letter in word:
        if letter not in node:
            return False
        node = node[letter]
    return None in node

print(contains("oa"))
print(contains("oak"))`,
    `False
True`,
    'The path oa exists, but only oak has an end marker at its final node.',
    [
      choice(
        'Only "campus" was inserted. What proves that "camp" is also a stored word?',
        [
          'Its characters form a path.',
          'Its final node has an explicit word-ending marker.',
          'It is shorter than campus.',
          'Its first letter is stored at the root.',
        ],
        1,
        'A character path proves a prefix exists; the end marker proves a whole word was inserted.',
        'A word boundary is separate from the existence of children.',
      ),
      choice(
        'If occurrences ["go", "gone", "go"] are counted, how many match prefix "go"?',
        ['1', '2', '4', '3'],
        3,
        'All three input occurrences have that prefix; duplicate go contributes twice under this contract.',
        'Count occurrences, not distinct spellings.',
      ),
      choice(
        'What is the expected cost of querying one length-p prefix in a built dictionary trie?',
        [
          'O(p)',
          'O(number of complete words)',
          'O(L²)',
          'O(1) for every prefix length',
        ],
        0,
        'The query follows one dictionary edge per prefix character.',
        'No other branches need to be scanned.',
      ),
      exercise(
        'Implement prefix_counts(words, prefixes). words and prefixes are lists of strings. Return, for each prefix in order, how many word occurrences start with it. Count repeated words separately; the empty prefix matches every occurrence, including an empty word. Matching is case-sensitive. Preserve both lists. Build one trie with a count at each node: a hidden case with 60,000 words and 60,000 prefixes must finish within 3 seconds.',
        `def prefix_counts(words, prefixes):
    # Each node can contain "count" and a separate "children" dictionary.
    pass`,
        `def prefix_counts(words, prefixes):
    root = {"count": 0, "children": {}}
    for word in words:
        node = root
        node["count"] += 1
        for letter in word:
            children = node["children"]
            if letter not in children:
                children[letter] = {"count": 0, "children": {}}
            node = children[letter]
            node["count"] += 1
    answers = []
    for prefix in prefixes:
        node = root
        for letter in prefix:
            node = node["children"].get(letter)
            if node is None:
                break
        answers.append(0 if node is None else node["count"])
    return answers`,
        withLargeCase(
          `assert prefix_counts([], [""]) == [0], "No inserted occurrences means no matches."
assert prefix_counts(["oak"], []) == [], "No prefixes produce no answers."
assert prefix_counts(["fern", "ferry", "fig", "oak"], ["fer", "f", "o"]) == [2, 3, 1], "Follow each complete prefix."
assert prefix_counts(["go", "gone", "go"], ["go", "gon"]) == [3, 1], "Duplicates count separately."
assert prefix_counts(["", "a", "ab"], ["", "a", "ab"]) == [3, 2, 1], "The root counts all occurrences."
assert prefix_counts(["a", "ab"], ["abc", "b"]) == [0, 0], "A missing path has no matches."
assert prefix_counts(["a", "A"], ["A"]) == [1], "Character matching is case-sensitive."
words = ["pin", "pine"]
prefixes = ["pin", "pine", "pines"]
assert prefix_counts(words, prefixes) == [2, 1, 0]
assert words == ["pin", "pine"] and prefixes == ["pin", "pine", "pines"], "Preserve both lists."`,
          `def _words(count, longest, seed):
    lengths = _numbers(count, 0, longest, seed)
    letters = _numbers(sum(lengths), 0, 3, seed + 1)
    words = []
    position = 0
    for length in lengths:
        words.append("".join("abcd"[letter] for letter in letters[position:position + length]))
        position += length
    return words
_words_in = _words(60000, 10, 121)
_prefixes = _words(60000, 6, 123)
_result, _seconds = _timed(prefix_counts, _words_in, _prefixes)
assert _checksum(_result) == 539032640718016891, "The 60,000-query case returned wrong counts."
_check_time(_seconds, "The 60,000-query case", "Build the trie once and walk one path per prefix instead of comparing every word with every prefix.")`,
        ),
        'Incrementing every traversed node gives the count for precisely that prefix, so after one build each query follows only its own path; the root represents the empty prefix.',
        'Insert each occurrence character by character while incrementing counts, then follow each queried prefix from the root.',
      ),
    ],
    [
      [
        'Why does a trie need a word-ending marker?',
        'A path may be only a prefix of another word; the marker distinguishes a stored complete word.',
      ],
      [
        'What does a trie node’s prefix occurrence count represent?',
        'The number of inserted occurrences whose paths pass through that node; the root counts the empty prefix.',
      ],
    ],
  ),
  skill(
    'cp-recursion',
    'cp-trees',
    'Define a shrinking subproblem',
    'Combine a terminating base case with a smaller recursive call.',
    ['cp-recursive-shrink', 'cp-recursive-combine'],
    [
      'A recursive function solves a problem using a smaller problem of the same kind. Its base case returns without another call. Its recursive step must move toward that case for every allowed input; otherwise the call chain never finishes.',
      'To calculate an integer power with a nonnegative exponent, halve the exponent, compute that half-power once, and square it. An odd exponent needs one extra multiplication by the base. Reusing the half-result matters: calling the same recursive computation twice creates unnecessary branching.',
      'Halving gives O(log e) recursive depth and arithmetic operations for exponent e > 0; actual integer multiplication cost also grows with the answer’s bit length. Python limits recursive depth, so a linear chain over a huge exponent is unsuitable. Here exponents are at most 10⁹, giving about 30 halving steps; deep tree and graph lessons use explicit stacks instead.',
    ],
    `def power(base, exponent):
    if exponent == 0:
        return 1
    half = power(base, exponent // 2)
    result = half * half
    if exponent % 2:
        result *= base
    return result

print(power(3, 5))
print(power(-2, 4))
print(power(0, 0))`,
    `243
16
1`,
    'The zero-exponent contract returns 1, and each nonzero call halves its exponent.',
    [
      choice(
        'Which property is necessary for a terminating recursive step?',
        [
          'It must print its current argument.',
          'It must call itself twice.',
          'It must approach a reachable base case.',
          'It must keep every argument unchanged.',
        ],
        2,
        'A decreasing measure, such as the nonnegative exponent, establishes progress toward termination.',
        'Identify what becomes smaller.',
      ),
      choice(
        'Why save half = power(base, exponent // 2) before multiplying half * half?',
        [
          'It changes an odd exponent into an even answer.',
          'It computes the same smaller problem only once.',
          'It removes the need for a base case.',
          'It limits the base to positive numbers.',
        ],
        1,
        'Reusing the returned value avoids two identical recursive subcomputations.',
        'A stored result can be used twice without making two calls.',
      ),
      choice(
        'What is the call depth when a positive exponent is halved at every step?',
        ['O(e²)', 'O(e)', 'Exactly one call for every input', 'O(log e)'],
        3,
        'After about log₂(e) halvings the exponent reaches zero.',
        'Compare repeated subtraction with repeated halving.',
      ),
      exercise(
        'Implement binary_power(base, exponent), returning the integer base raised to exponent. base is an integer and exponent is an integer from 0 through 10⁹. Define every zero exponent, including 0⁰, as 1. Use one recursive half-power per level; do not recurse once per exponent step. The checks count Python calls: binary_power(1, 10**9) must make at least 30 recursive calls, so ** and pow alone are not accepted.',
        `def binary_power(base, exponent):
    # Base case, smaller call, and combination.
    pass`,
        `def binary_power(base, exponent):
    if exponent == 0:
        return 1
    half = binary_power(base, exponent // 2)
    result = half * half
    if exponent % 2:
        result *= base
    return result`,
        `assert binary_power(3, 5) == 243, "Handle an odd exponent."
assert binary_power(-2, 6) == 64, "An even exponent removes the negative sign."
assert binary_power(-3, 3) == -27, "An odd exponent preserves a negative sign."
assert binary_power(0, 7) == 0, "A positive power of zero is zero."
assert binary_power(0, 0) == 1, "Use the stated zero-exponent contract."
assert binary_power(9, 0) == 1
assert binary_power(1, 1_000_000_000) == 1, "Halve the exponent instead of making a deep linear call chain."
import sys as _sys

def _python_calls(function, *arguments):
    calls = 0
    def profile(frame, event, argument):
        nonlocal calls
        if event == "call":
            calls += 1
    _sys.setprofile(profile)
    try:
        result = function(*arguments)
    finally:
        _sys.setprofile(None)
    return result, calls

_result, _calls = _python_calls(binary_power, 1, 10**9)
assert _result == 1
assert _calls >= 30, f"binary_power(1, 10**9) made {_calls} Python call(s). Compute it from a recursive half power: a 30-bit exponent needs about 30 calls, so ** and pow alone are not accepted."`,
        'The recursive result supplies the even portion of the power; the odd case contributes one additional base factor.',
        'Return 1 at exponent 0; square one recursive result for exponent // 2, then multiply by base if the exponent is odd.',
      ),
    ],
    [
      [
        'What proves a recursive function will terminate?',
        'A reachable base case and a measure that strictly moves toward it on every recursive call.',
      ],
      [
        'Why does recursive exponentiation by squaring have logarithmic depth?',
        'Each call halves the nonnegative exponent and reuses one computed half-power.',
      ],
    ],
  ),
  skill(
    'cp-backtracking',
    'cp-trees',
    'Explore a choice and undo it',
    'Enumerate possibilities while restoring the state before the next branch.',
    [
      'cp-choice-undo',
      'cp-path-snapshot',
      'cp-remaining-capacity',
      'cp-recursion',
      'cp-enumerate-index-pairs',
    ],
    [
      'Backtracking explores a tree of decisions. Maintain a path describing the decisions already made. To explore one branch, append a choice, recurse into the smaller remaining problem, then pop that choice so the next branch starts from the same parent state.',
      'When choosing k distinct indices from 0 through n-1, keep the path increasing and let the next search begin after the last choice. This generates each combination once rather than generating every permutation. Save path.copy() at a complete solution; saving path itself would share a mutable list that later branches change.',
      'Prune when too few indices remain to fill the path. Enumerating and copying all results takes O((k+1) × C(n, k)) time and output space, including the one empty selection when k=0. Auxiliary search space is O(k+1), excluding the returned results. This exercise uses n ≤ 12 so recursion stays shallow and enumeration remains small.',
    ],
    `def choices(n, k):
    result = []
    path = []
    def visit(start):
        if len(path) == k:
            result.append(path.copy())
            return
        needed = k - len(path)
        for index in range(start, n - needed + 1):
            path.append(index)
            visit(index + 1)
            path.pop()
    visit(0)
    return result

print(choices(3, 2))`,
    '[[0, 1], [0, 2], [1, 2]]',
    'The increasing next index prevents repeated choices and duplicate permutations.',
    [
      choice(
        'Why call path.pop() after exploring one appended choice?',
        [
          'To sort the completed result.',
          'To erase every earlier decision.',
          'To restore the parent path before trying another branch.',
          'To count the number of solutions.',
        ],
        2,
        'The next branch must inherit exactly the decisions that existed before the appended choice.',
        'Every reversible change needs a matching undo.',
      ),
      choice(
        'Why store path.copy() when a combination is complete?',
        [
          'To preserve a snapshot while the working path changes later.',
          'To make the result recursive.',
          'To reverse every combination.',
          'To prevent integers from being comparable.',
        ],
        0,
        'A copied list is a separate result; references to the same working list would all change together.',
        'Consider aliasing when lists are mutable.',
      ),
      choice(
        'A path needs three more indices, but only two remain. What should the search do?',
        [
          'Repeat the final index.',
          'Record an incomplete path.',
          'Search all permutations anyway.',
          'Prune the branch because it cannot reach a valid result.',
        ],
        3,
        'The remaining capacity proves no completion exists under the distinct-index contract.',
        'Check feasibility before making another recursive call.',
      ),
      exercise(
        'Implement choose_channels(n, k) for integers 0 ≤ k ≤ n ≤ 12. Return every k-element selection from indices 0 through n-1. Each selection must be increasing, and the outer list must be in lexicographic order. Choosing zero indices returns [[]]. Use backtracking and preserve a separate snapshot for each result. The checks disable itertools.combinations, permutations, and product.',
        `def choose_channels(n, k):
    pass`,
        `def choose_channels(n, k):
    result = []
    path = []
    def search(start):
        if len(path) == k:
            result.append(path.copy())
            return
        needed = k - len(path)
        for index in range(start, n - needed + 1):
            path.append(index)
            search(index + 1)
            path.pop()
    search(0)
    return result`,
        withoutShortcuts(
          'import itertools',
          'itertools',
          [
            'combinations',
            'permutations',
            'product',
            'combinations_with_replacement',
          ],
          'This exercise asks you to build the selections by backtracking, so itertools combinations, permutations, and product are disabled during the checks.',
          `assert choose_channels(0, 0) == [[]], "There is one empty selection."
assert choose_channels(4, 0) == [[]], "Choosing none is valid."
assert choose_channels(3, 2) == [[0, 1], [0, 2], [1, 2]], "Generate increasing selections once."
assert choose_channels(4, 1) == [[0], [1], [2], [3]], "Keep lexicographic order."
assert choose_channels(4, 3) == [[0, 1, 2], [0, 1, 3], [0, 2, 3], [1, 2, 3]]
assert choose_channels(12, 12) == [list(range(12))], "Handle a full selection without deep recursion."
selections = choose_channels(3, 1)
selections[0].append(99)
assert selections[1:] == [[1], [2]], "Save independent lists, not aliases of the working path."`,
        ),
        'Increasing indices eliminate permutations of the same selection; append, recurse, and pop preserve the search invariant.',
        'Track a path and next allowed index. Stop at length k, copy the path, and restore it after every branch.',
      ),
    ],
    [
      [
        'What is the basic backtracking pattern?',
        'Choose, explore, then undo the choice before exploring a sibling branch.',
      ],
      [
        'How do increasing indices avoid duplicate combinations?',
        'Each selection has exactly one increasing order, so its different permutations are never generated.',
      ],
    ],
  ),
  skill(
    'cp-bst',
    'cp-trees',
    'Follow a search tree’s ordering',
    'Use subtree bounds to search without visiting every node.',
    ['cp-bst-branch', 'cp-bst-candidate', 'cp-complexity'],
    [
      'A strict binary search tree stores distinct keys. Every key in a node’s left subtree is smaller than its key; every key in the right subtree is larger. This condition applies to whole subtrees, not just immediate children. Here a node is (key, left, right), and an absent child is None.',
      'Searching compares the target with the current key and follows only the side that can contain it. To find the largest key at most a limit, remember the current key when it qualifies, then try the right subtree for a better one. If the key is too large, only the left subtree can help.',
      'A search takes O(h) time for height h and can use O(1) auxiliary space with a loop. A balanced tree has logarithmic height; an unbalanced chain can have height n. Being a search tree does not automatically make the tree balanced. Iterative search also avoids a deep Python recursion chain.',
    ],
    `tree = (9, (4, None, (6, None, None)), (13, None, None))

def contains(node, target):
    while node is not None:
        key, left, right = node
        if target == key:
            return True
        node = left if target < key else right
    return False

print(contains(tree, 6))
print(contains(tree, 7))`,
    `True
False`,
    'Each comparison discards a whole subtree; a missing child ends an unsuccessful search.',
    [
      choice(
        'A node has key 8. Which requirement must its left subtree satisfy?',
        [
          'Only its direct child must be below 8.',
          'Every key in the subtree must be below 8.',
          'Every key must be above 8.',
          'Its keys must have even parity.',
        ],
        1,
        'A deeper key of 11 in the left subtree would violate the search invariant even if the direct child were 4.',
        'The ordering rule is inherited by descendants.',
      ),
      choice(
        'While finding the largest key ≤ 10, the current key is 7. What is the useful next step?',
        [
          'Return 7 immediately without inspecting another key.',
          'Search only left and forget 7.',
          'Record 7 as a candidate and search right for a better qualifying key.',
          'Visit both entire subtrees unconditionally.',
        ],
        2,
        'A larger qualifying key can only be to the right; 7 remains a fallback if none exists.',
        'Maintain the best valid key found so far.',
      ),
      choice(
        'What is the worst-case search time for an unbalanced n-node BST?',
        ['O(n)', 'Always O(log n)', 'O(1)', 'O(n²) for one search'],
        0,
        'A chain of n nodes has height n, and a search can follow the entire chain.',
        'Separate the ordering invariant from balance.',
      ),
      exercise(
        'Implement bst_floor(tree, limit). tree is a valid strict binary search tree of distinct integer keys, represented by nested (key, left, right) tuples; an absent node is None. Return the largest stored key ≤ limit, or None if no key qualifies. Use an iterative search so a tall valid tree does not exceed Python’s recursion limit. A hidden case runs 100,000 searches in a balanced tree of about 150,000 keys and must finish within 3 seconds.',
        `def bst_floor(tree, limit):
    pass`,
        `def bst_floor(tree, limit):
    best = None
    node = tree
    while node is not None:
        key, left, right = node
        if key <= limit:
            best = key
            node = right
        else:
            node = left
    return best`,
        withLargeCase(
          `tree = (9, (4, (1, None, None), (6, None, None)), (13, (11, None, None), None))
assert bst_floor(None, 5) is None, "An empty tree has no qualifying key."
assert bst_floor(tree, 0) is None, "The limit may lie below every key."
assert bst_floor(tree, 9) == 9, "An exact key qualifies."
assert bst_floor(tree, 8) == 6, "Keep the best lower key after a missing branch."
assert bst_floor(tree, 100) == 13, "The maximum key qualifies for a large limit."
assert bst_floor((-3, (-8, None, None), (2, None, None)), -4) == -8
chain = None
for key in range(1599, -1, -1):
    chain = (key, None, chain)
assert bst_floor(chain, 1600) == 1599, "Traverse tall trees iteratively."`,
          `def _build(keys, low, high):
    if low >= high:
        return None
    middle = (low + high) // 2
    return (keys[middle], _build(keys, low, middle), _build(keys, middle + 1, high))
_keys = sorted(set(_numbers(150000, -10**9, 10**9, 131)))
_tree = _build(_keys, 0, len(_keys))
_limits = _numbers(100000, -10**9 - 10, 10**9 + 10, 132)
def _run():
    return [bst_floor(_tree, limit) for limit in _limits]
_result, _seconds = _timed(_run)
assert _checksum(_result) == 49589883230479068, "100,000 searches in a 150,000-key tree returned wrong floors."
_check_time(_seconds, "100,000 searches in a 150,000-key tree", "Follow one branch per comparison instead of visiting every node.")`,
        ),
        'A qualifying node replaces the best candidate, then only its right subtree can improve the answer.',
        'Keep best=None and move one child at a time; update best whenever the current key is within the limit.',
      ),
    ],
    [
      [
        'What ordering applies to a strict binary search tree?',
        'All keys in the left subtree are smaller; all keys in the right subtree are larger, at every node.',
      ],
      [
        'Does a BST guarantee O(log n) search?',
        'Only when its height is logarithmic; an unbalanced chain can require O(n) time.',
      ],
    ],
  ),
  skill(
    'cp-tree-traversal',
    'cp-trees',
    'Finish descendants before their parent',
    'Use iterative postorder to compute an aggregate for each subtree.',
    ['cp-preorder-frontier', 'cp-postorder-combine', 'cp-recursion'],
    [
      'Traversal order should match the dependency of the computation. Preorder handles a node before its descendants; postorder handles descendants first. A subtree size is 1 plus the sizes of all child subtrees, so the parent can be completed only after its children.',
      'Represent a rooted tree with children[u], a list of child vertex indices. A valid nonempty input here has root 0, vertices 0 through n-1, one parent per other vertex, and all vertices reachable from 0. Cycles and shared children violate the tree contract; treating such a graph as a tree would repeat work or loop.',
      'An explicit stack can hold (vertex, ready) events. The first event schedules a later completion event and the children’s first events; the completion event combines their finished results. Each node is processed a constant number of times, giving O(n) time and O(n) auxiliary space, including the size array. A long chain remains safe without recursive calls.',
    ],
    `children = [[1, 2], [3], [], []]
sizes = [0] * len(children)
stack = [(0, False)]
while stack:
    vertex, ready = stack.pop()
    if ready:
        sizes[vertex] = 1 + sum(sizes[child] for child in children[vertex])
    else:
        stack.append((vertex, True))
        for child in children[vertex]:
            stack.append((child, False))
print(sizes)`,
    '[4, 2, 1, 1]',
    'Vertex 3 finishes before vertex 1, and both child subtrees finish before root 0.',
    [
      choice(
        'Which traversal order directly supports a parent aggregate that depends on child results?',
        [
          'Random order without storage',
          'Preorder only',
          'Sorted vertex labels',
          'Postorder',
        ],
        3,
        'Postorder completes descendants before the parent that combines their results.',
        'Put dependencies before the value that uses them.',
      ),
      choice(
        'For a leaf, what is its subtree size under the 1 + sum(child sizes) rule?',
        ['0', '1', 'The total number of graph edges', 'Its parent’s size'],
        1,
        'A leaf has no child contribution and counts itself once.',
        'The empty sum is zero.',
      ),
      choice(
        'Why use explicit completion events on a very tall tree?',
        [
          'They avoid a Python call stack proportional to tree height.',
          'They make every tree balanced.',
          'They remove all input edges.',
          'They turn a cyclic graph into a valid tree.',
        ],
        0,
        'The work is stored in an ordinary list stack; the input must still satisfy the tree contract.',
        'An explicit stack and the interpreter call stack are different storage mechanisms.',
      ),
      exercise(
        'Implement subtree_sizes(children). For a nonempty input, children describes a valid rooted tree on vertices 0 through len(children)-1, rooted at 0: no cycles, every other vertex has one parent, and every vertex is reachable. Return each vertex’s subtree size, including itself. An empty input returns []. Use an iterative traversal to support tall trees. Preserve children. A hidden tall tree with 100,000 vertices must finish within 3 seconds.',
        `def subtree_sizes(children):
    pass`,
        `def subtree_sizes(children):
    if not children:
        return []
    sizes = [0] * len(children)
    stack = [(0, False)]
    while stack:
        vertex, ready = stack.pop()
        if ready:
            sizes[vertex] = 1 + sum(sizes[child] for child in children[vertex])
        else:
            stack.append((vertex, True))
            for child in children[vertex]:
                stack.append((child, False))
    return sizes`,
        withLargeCase(
          `assert subtree_sizes([]) == [], "Handle an empty tree."
assert subtree_sizes([[]]) == [1], "A single root counts itself."
assert subtree_sizes([[1, 2], [3], [], []]) == [4, 2, 1, 1], "Combine completed child subtrees."
assert subtree_sizes([[1, 2, 3], [], [], []]) == [4, 1, 1, 1], "Trees need not be binary."
source = [[2], [], [1]]
assert subtree_sizes(source) == [3, 1, 2], "Vertex labels do not dictate traversal order."
assert source == [[2], [], [1]], "Preserve the tree."
chain = [[index + 1] for index in range(1599)] + [[]]
assert subtree_sizes(chain) == list(range(1600, 0, -1)), "Do not recurse through a tall chain."`,
          `_back = _numbers(100000, 1, 3, 141)
_children = [[] for _ in range(100000)]
for _vertex in range(1, 100000):
    _children[max(0, _vertex - _back[_vertex])].append(_vertex)
_result, _seconds = _timed(subtree_sizes, _children)
assert _checksum(_result) == 594500027001685296, "The 100,000-vertex tree returned wrong sizes."
_check_time(_seconds, "The 100,000-vertex tree", "Combine finished child sizes in one postorder pass instead of searching every subtree separately.")`,
        ),
        'Completion events wait below child events on the stack, so every required child size exists before its parent is calculated.',
        'Push a completion marker for a node, then its children. At completion, add one to the sum of the child sizes.',
      ),
    ],
    [
      [
        'When is postorder the useful tree traversal order?',
        'When a node’s answer depends on completed answers from its descendants.',
      ],
      [
        'How can a list stack simulate recursive postorder?',
        'Push a later completion event for the node, then first-visit events for its children.',
      ],
    ],
  ),
  skill(
    'cp-graph-models',
    'cp-graphs',
    'Give every vertex a place',
    'Build an adjacency representation with explicit direction and multiplicity.',
    ['cp-undirected-edge'],
    [
      'A graph models vertices and edges. Number vertices 0 through n-1 and allocate one neighbor list for every vertex, including isolated ones. An edge list alone cannot reveal an isolated vertex, so n is part of the input contract.',
      'For a directed edge u → v, append v only to neighbors[u]. For an undirected edge, append each endpoint to the other’s list. Retaining parallel edges preserves multiplicity; under this convention an undirected self-loop contributes two entries at its vertex. State these choices before using degrees or counting edges.',
      'Adjacency lists require O(n + m) space and construction time for m input edges. A matrix instead allocates O(n²) cells and offers direct edge lookup. Create independent inner lists with a comprehension: [[]] * n aliases one list, so appending to one vertex would change all vertices.',
    ],
    `n = 4
edges = [(0, 1), (1, 2)]
neighbors = [[] for _ in range(n)]
for first, second in edges:
    neighbors[first].append(second)
    neighbors[second].append(first)
print(neighbors)
print(neighbors[3])`,
    `[[1], [0, 2], [1], []]
[]`,
    'Both directions of each undirected edge are represented, and isolated vertex 3 still exists.',
    [
      choice(
        'How is directed edge 2 → 5 represented in an adjacency list?',
        [
          'Append 2 to neighbors[5] only.',
          'Append 5 to neighbors[2] only.',
          'Delete isolated vertices first.',
          'Append every vertex to both lists.',
        ],
        1,
        'Outgoing neighbors of 2 include 5; the reverse edge is not implied.',
        'The arrow identifies the source and destination.',
      ),
      choice(
        'Why can [[]] * n be incorrect for adjacency lists?',
        [
          'The outer list has length zero.',
          'It automatically sorts edges.',
          'It shares the same mutable inner list across vertices.',
          'It allocates n independent empty lists.',
        ],
        2,
        'List repetition repeats references. A comprehension evaluates [] separately for every vertex.',
        'Think about which list append changes.',
      ),
      choice(
        'A graph has n=5 and only edge (0, 1). Which vertices must its representation include?',
        [
          'Only 0',
          'Only 0 and 1',
          'Only vertices of odd degree',
          'All five vertices, including 2, 3, and 4',
        ],
        3,
        'Isolated vertices remain part of the graph even though they have no neighbor entries.',
        'The vertex count is independent of the edge list.',
      ),
      exercise(
        'Implement make_neighbors(n, edges, directed=False). n is nonnegative; each edge is a (u, v) pair of valid vertex indices 0 through n-1. Return n independent adjacency lists in input-edge order. Directed edges add v at u only; undirected edges add both directions. Preserve parallel edges, and store an undirected self-loop twice. Preserve edges. With n=0, edges is empty.',
        `def make_neighbors(n, edges, directed=False):
    pass`,
        `def make_neighbors(n, edges, directed=False):
    neighbors = [[] for _ in range(n)]
    for first, second in edges:
        neighbors[first].append(second)
        if not directed:
            neighbors[second].append(first)
    return neighbors`,
        `assert make_neighbors(0, []) == [], "Handle an empty vertex set."
assert make_neighbors(3, []) == [[], [], []], "Keep isolated vertices."
assert make_neighbors(4, [(0, 2), (2, 1)]) == [[2], [2], [0, 1], []]
assert make_neighbors(3, [(0, 2), (2, 1)], True) == [[2], [], [1]], "Directed edges have no implicit reverse."
assert make_neighbors(2, [(0, 1), (0, 1)]) == [[1, 1], [0, 0]], "Keep parallel-edge multiplicity."
assert make_neighbors(1, [(0, 0)]) == [[0, 0]], "An undirected loop contributes twice."
neighbors = make_neighbors(3, [])
neighbors[0].append(2)
assert neighbors[1:] == [[], []], "Allocate independent inner lists."
source = [(1, 0)]
assert make_neighbors(2, source) == [[1], [0]]
assert source == [(1, 0)], "Preserve the edge list."`,
        'Allocating the vertex lists first preserves isolated vertices; the directed flag determines whether reverse entries are added.',
        'Create a fresh list for every vertex and append each edge according to the direction contract.',
      ),
    ],
    [
      [
        'What must an adjacency-list contract specify?',
        'Vertex IDs, directed or undirected edges, and whether parallel edges and self-loops are retained.',
      ],
      [
        'Why allocate one list per vertex rather than only per edge endpoint?',
        'Isolated vertices still exist and must have empty neighbor lists.',
      ],
    ],
  ),
  skill(
    'cp-dfs',
    'cp-graphs',
    'Reach vertices without revisiting cycles',
    'Use an explicit depth-first work stack and a discovery set.',
    [
      'cp-dfs-frontier',
      'cp-dfs-cycle-guard',
      'cp-directed-edge',
      'while-loops',
    ],
    [
      'Depth-first search follows pending work with a stack. For reachability, start from one vertex, repeatedly pop a discovered vertex, and push its undiscovered outgoing neighbors. It reaches only vertices connected by a directed path from the start; it does not automatically cover other components.',
      'Mark a vertex as discovered when pushing it. Then each vertex enters the work stack at most once, even if several edges reach it. A visited set also stops cycles, self-loops, and parallel edges from scheduling repeated work. An explicit stack avoids recursion depth failures on long paths.',
      'For an adjacency-list graph, the reachable search costs O(Vᵣ + Eᵣ), where Vᵣ counts reached vertices and Eᵣ counts outgoing entries scanned from them. Auxiliary storage is O(Vᵣ). DFS establishes reachability, but its first path is not generally the fewest-edge path; use BFS for that guarantee.',
    ],
    `graph = [[1], [2], [0, 3], [], []]
seen = {0}
stack = [0]
while stack:
    vertex = stack.pop()
    for neighbor in graph[vertex]:
        if neighbor not in seen:
            seen.add(neighbor)
            stack.append(neighbor)
print(sorted(seen))`,
    '[0, 1, 2, 3]',
    'The cycle through 0, 1, and 2 terminates because discovered vertices are not pushed again; vertex 4 is unreachable.',
    [
      choice(
        'When should this reachability search mark a newly found neighbor?',
        [
          'Only after every graph vertex is visited.',
          'Whenever it is popped, allowing duplicate pushes.',
          'When it is pushed for the first time.',
          'Only when it has no outgoing edges.',
        ],
        2,
        'Marking on discovery prevents multiple pending copies of the same vertex.',
        'Several edges may discover the same neighbor before it is processed.',
      ),
      choice(
        'What does DFS from one source guarantee?',
        [
          'Discovery of every vertex reachable from that source.',
          'The minimum weighted path to every vertex.',
          'An ordering that always obeys all directed edges.',
          'That the entire graph is connected.',
        ],
        0,
        'DFS explores all reachable outgoing edges, but disconnected or directionally unreachable vertices stay unseen.',
        'Separate reachability from shortest-path and ordering problems.',
      ),
      choice(
        'Why is a visited set necessary when the graph contains 0 → 1 → 0?',
        [
          'It forces vertex labels to be sorted.',
          'It removes the cycle from the input.',
          'It changes edges to undirected edges.',
          'It prevents scheduling already discovered vertices forever.',
        ],
        3,
        'The search may scan the back edge, but it does not push vertex 0 again.',
        'An edge to a seen vertex creates no new work.',
      ),
      exercise(
        'Implement reachable_count(graph, start). graph is an adjacency list on vertices 0 through len(graph)-1; every neighbor index is valid and edges may be directed, repeated, or cyclic. For a nonempty graph, start is valid. Return how many distinct vertices are reachable from start, including start. For graph=[] return 0. Preserve graph and use an iterative stack. A hidden graph with 200,000 vertices must finish within 3 seconds.',
        `def reachable_count(graph, start):
    pass`,
        `def reachable_count(graph, start):
    if not graph:
        return 0
    seen = {start}
    stack = [start]
    while stack:
        vertex = stack.pop()
        for neighbor in graph[vertex]:
            if neighbor not in seen:
                seen.add(neighbor)
                stack.append(neighbor)
    return len(seen)`,
        withLargeCase(
          `assert reachable_count([], 0) == 0, "Handle an empty graph."
assert reachable_count([[]], 0) == 1, "Count the source itself."
assert reachable_count([[1], [2], [0, 3], [], []], 0) == 4, "Stop cycles and omit unreachable vertices."
assert reachable_count([[1], [], [0]], 1) == 1, "Follow outgoing edges only."
assert reachable_count([[0, 1, 1], [0]], 0) == 2, "Repeated edges and self-loops do not add vertices."
chain = [[index + 1] for index in range(1599)] + [[]]
assert reachable_count(chain, 0) == 1600, "Use a stack instead of a deep recursive chain."
source = [[1], []]
assert reachable_count(source, 0) == 2
assert source == [[1], []], "Preserve the graph."`,
          `_targets = _numbers(400000, 0, 199999, 151)
_graph = [[] for _ in range(200000)]
for _index in range(400000):
    _graph[_index // 2].append(_targets[_index])
_result, _seconds = _timed(reachable_count, _graph, 0)
assert _result == 159287, "The 200,000-vertex graph returned the wrong count."
_check_time(_seconds, "The 200,000-vertex graph", "Keep discovered vertices in a set so each membership test is constant time.")`,
        ),
        'The discovery set counts each reachable vertex once, while the stack records reachable work still to process.',
        'Initialize seen with start. Add an unseen neighbor to seen before pushing it.',
      ),
    ],
    [
      [
        'How does an iterative DFS avoid infinite work on a cycle?',
        'Track discovered vertices and push a vertex only on its first discovery.',
      ],
      [
        'Does the first path found by DFS guarantee a fewest-edge route?',
        'No. DFS finds reachability; BFS supplies the fewest-edge guarantee for unit-cost edges.',
      ],
    ],
  ),
  skill(
    'cp-bfs',
    'cp-graphs',
    'Expand one edge layer at a time',
    'Use a queue to compute fewest-edge distances in an unweighted graph.',
    ['cp-bfs-layer-distance', 'cp-directed-edge', 'while-loops'],
    [
      'Breadth-first search processes discovered vertices in first-in, first-out order. Starting at distance zero, a vertex at distance d discovers unseen neighbors at distance d+1. The queue processes earlier layers before later ones, so a vertex’s first assigned distance is the fewest number of edges from the source.',
      'Use collections.deque: append adds new work on the right and popleft removes the oldest work on the left. Mark the distance when enqueueing, so cycles and multiple incoming edges do not enqueue duplicates. A Python list’s pop(0) shifts remaining entries and can make queue work unnecessarily expensive.',
      'The distance array covers all vertices; use -1 for those unreachable from the source. With adjacency lists, initialization and scanning cost O(V + E) time and O(V) auxiliary space. This shortest-path guarantee assumes every edge contributes the same unit cost; unequal weights require a different algorithm.',
    ],
    `from collections import deque
graph = [[1, 2], [3], [3], [], []]
distance = [-1] * len(graph)
distance[0] = 0
queue = deque([0])
while queue:
    vertex = queue.popleft()
    for neighbor in graph[vertex]:
        if distance[neighbor] == -1:
            distance[neighbor] = distance[vertex] + 1
            queue.append(neighbor)
print(distance)`,
    '[0, 1, 1, 2, -1]',
    'Both distance-one vertices are processed before distance-two vertex 3; isolated vertex 4 remains unreachable.',
    [
      choice(
        'When does ordinary BFS guarantee shortest-path distances?',
        [
          'When vertices have alphabetical labels.',
          'When every edge has the same unit cost.',
          'For arbitrary negative edge weights.',
          'Only when every vertex has two neighbors.',
        ],
        1,
        'BFS orders paths by edge count, which matches cost when every edge contributes one unit.',
        'Ask whether one extra edge always adds the same cost.',
      ),
      choice(
        'Which deque operations implement the queue used by BFS?',
        [
          'append and pop from the right',
          'appendleft and popleft only',
          'sort and pop',
          'append on the right and popleft on the left',
        ],
        3,
        'The oldest queued vertex leaves first, while newly discovered vertices join the back.',
        'First in should be first out.',
      ),
      choice(
        'Why assign a neighbor’s distance before enqueueing it?',
        [
          'It records discovery and prevents duplicate queue entries.',
          'It makes the graph acyclic.',
          'It guarantees all vertices are reachable.',
          'It sorts every neighbor list.',
        ],
        0,
        'Other edges can now see that the neighbor was already discovered.',
        'Use the distance array as the visited marker.',
      ),
      exercise(
        'Implement hop_distances(graph, source). graph is an adjacency list with valid vertex indices 0 through len(graph)-1; edges may be directed, cyclic, repeated, or self-loops. Every edge costs one hop. For a nonempty graph source is valid. Return the fewest-hop distance to each vertex, using -1 for unreachable vertices. An empty graph returns []. Preserve graph. A hidden graph with 100,000 vertices must finish within 3 seconds.',
        `from collections import deque

def hop_distances(graph, source):
    pass`,
        `from collections import deque

def hop_distances(graph, source):
    if not graph:
        return []
    distance = [-1] * len(graph)
    distance[source] = 0
    queue = deque([source])
    while queue:
        vertex = queue.popleft()
        for neighbor in graph[vertex]:
            if distance[neighbor] == -1:
                distance[neighbor] = distance[vertex] + 1
                queue.append(neighbor)
    return distance`,
        withLargeCase(
          `assert hop_distances([], 0) == [], "Handle an empty graph."
assert hop_distances([[]], 0) == [0], "The source is zero hops away."
assert hop_distances([[1, 2], [3], [3], [], []], 0) == [0, 1, 1, 2, -1], "Unreachable vertices keep -1."
assert hop_distances([[1], [2], [0, 3], []], 2) == [1, 2, 0, 1], "Cycles do not require revisiting."
assert hop_distances([[0, 1, 1], [2], []], 0) == [0, 1, 2], "Ignore duplicate discoveries."
assert hop_distances([[1], [], [0]], 1) == [-1, 0, -1], "Respect edge direction."
source = [[1], []]
assert hop_distances(source, 0) == [0, 1]
assert source == [[1], []], "Preserve the graph."`,
          `_jumps = _numbers(200000, -3, 3, 161)
_graph = [[] for _ in range(100000)]
for _vertex in range(100000):
    for _next in (_vertex + _jumps[2 * _vertex], _vertex + 1, _vertex + _jumps[2 * _vertex + 1]):
        if 0 <= _next < 100000:
            _graph[99999 - _vertex].append(99999 - _next)
_result, _seconds = _timed(hop_distances, _graph, 99999)
assert _checksum(_result) == 1412230198499059278, "The 100,000-vertex graph returned wrong distances."
_check_time(_seconds, "The 100,000-vertex graph", "Expand each vertex once in queue order instead of relaxing every edge repeatedly.")`,
        ),
        'A FIFO queue finishes a distance layer before the next one, and the first discovered distance never needs revision for unit-cost edges.',
        'Initialize all distances to -1, set source to 0, and enqueue a neighbor only while its distance is still -1.',
      ),
    ],
    [
      [
        'What invariant gives BFS a fewest-edge guarantee?',
        'The FIFO queue processes vertices in nondecreasing distance layers, so first discovery is a shortest hop count.',
      ],
      [
        'How should an unreachable vertex appear in this BFS distance array?',
        'As -1; the source is 0, and discovered neighbors get their parent distance plus 1.',
      ],
    ],
  ),
  skill(
    'cp-grids',
    'cp-graphs',
    'Treat cells as graph vertices',
    'Scan every cell and flood-fill each newly found land component.',
    ['cp-grid-component'],
    [
      'A grid is an implicit graph: each land cell is a vertex, and two land cells share an edge when they differ by one row or one column. Cells that touch only at a corner are not neighbors under the four-direction contract, so they belong to different islands unless another land route joins them.',
      'One flood fill from a land cell reaches exactly its island. To find every island, scan the cells in row order and start a new flood fill only from land that no earlier search discovered. Share one discovered set across all searches: a cell claimed by an earlier island is never counted again, so the number of searches started is the number of islands, and each search’s discovered-cell count is that island’s size.',
      'Check 0 ≤ row < rows and 0 ≤ column < columns before indexing a neighbor, because a negative index wraps to the opposite border. Use an explicit stack so a long island cannot exceed Python’s recursion limit. Each cell is discovered at most once and has at most four neighbors, so an R-by-C grid takes O(RC) time even when one island covers most of it; restarting a search from every land cell would repeat whole islands and take O((RC)²) time.',
    ],
    `grid = [[1, 1, 0, 0],
        [0, 1, 0, 1],
        [1, 0, 0, 1]]
rows, cols = len(grid), len(grid[0])
seen = set()
sizes = []
for row in range(rows):
    for col in range(cols):
        if grid[row][col] == 1 and (row, col) not in seen:
            seen.add((row, col))
            pending = [(row, col)]
            size = 0
            while pending:
                r, c = pending.pop()
                size += 1
                for nr, nc in [(r - 1, c), (r + 1, c), (r, c - 1), (r, c + 1)]:
                    if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == 1 and (nr, nc) not in seen:
                        seen.add((nr, nc))
                        pending.append((nr, nc))
            sizes.append(size)
print(sizes)`,
    '[3, 2, 1]',
    'The scan starts searches at (0, 0), (1, 3), and (2, 0). Each search claims its whole island, so later cells of the same island are skipped.',
    [
      choice(
        'In the grid [[1, 0], [0, 1]], how many four-direction islands are there?',
        ['1', '2', '4', '0'],
        1,
        'The two land cells touch only at a corner, which is not a move, so each is its own island.',
        'Diagonal contact is not an edge.',
      ),
      choice(
        'Why does the scan share one discovered set across all flood fills?',
        [
          'So the largest island is always found first.',
          'So diagonal cells join the same island.',
          'So each island is counted once, when the scan first reaches it.',
          'So the grid can be modified in place.',
        ],
        2,
        'Cells claimed by an earlier search are skipped, so only the first cell the scan meets on each island starts a search.',
        'Ask what stops a second search from starting on the same island.',
      ),
      choice(
        'What is the running time of the shared-discovery scan on an R-by-C grid?',
        ['O(R + C)', 'O(RC)', 'O((RC)²)', 'O(RC log RC)'],
        1,
        'Every cell is scanned once and discovered at most once, and each discovery checks at most four neighbors.',
        'Count how often one cell can be discovered.',
      ),
      exercise(
        'Implement island_summary(grid). grid is [] or a rectangular list of equal-length rows containing 0 (water) and 1 (land). An island is a maximal group of land cells joined by up, down, left, or right moves; diagonal contact does not join cells. Return (island_count, largest_island_size), or (0, 0) when there is no land. Preserve grid. Share one discovered set across iterative flood fills: a hidden 400-by-400 grid must finish within 3 seconds.',
        `def island_summary(grid):
    # Scan every cell; flood-fill land that no earlier search discovered.
    pass`,
        `def island_summary(grid):
    rows = len(grid)
    cols = len(grid[0]) if grid else 0
    seen = set()
    count = 0
    largest = 0
    for row in range(rows):
        for col in range(cols):
            if grid[row][col] != 1 or (row, col) in seen:
                continue
            count += 1
            seen.add((row, col))
            pending = [(row, col)]
            size = 0
            while pending:
                r, c = pending.pop()
                size += 1
                for nr, nc in [(r - 1, c), (r + 1, c), (r, c - 1), (r, c + 1)]:
                    if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == 1 and (nr, nc) not in seen:
                        seen.add((nr, nc))
                        pending.append((nr, nc))
            largest = max(largest, size)
    return count, largest`,
        withLargeCase(
          `assert island_summary([]) == (0, 0), "An empty grid has no islands."
assert island_summary([[0, 0], [0, 0]]) == (0, 0), "Water alone has no islands."
assert island_summary([[1]]) == (1, 1)
assert island_summary([[1, 0], [0, 1]]) == (2, 1), "Diagonal contact does not join cells."
assert island_summary([[1, 1, 0, 0], [0, 1, 0, 1], [1, 0, 0, 1]]) == (3, 3)
assert island_summary([[1, 0, 1]]) == (2, 1), "Do not wrap across a border."
assert island_summary([[1], [0], [1]]) == (2, 1)
ring = [[1, 1, 1], [1, 0, 1], [1, 1, 1]]
assert island_summary(ring) == (1, 8), "Land around water is still one island."
assert ring == [[1, 1, 1], [1, 0, 1], [1, 1, 1]], "Preserve the grid."
snake = [[1] * 60 if r % 2 == 0 else ([0] * 59 + [1] if r % 4 == 1 else [1] + [0] * 59) for r in range(60)]
assert island_summary(snake) == (1, 1830), "Use an explicit stack for a long island."`,
          `_cells = _numbers(160000, 0, 99, 171)
_grid = [[1 if _cells[r * 400 + c] < 66 else 0 for c in range(400)] for r in range(400)]
_result, _seconds = _timed(island_summary, _grid)
assert _result == (2075, 100907), "The 400-by-400 grid returned the wrong summary."
_check_time(_seconds, "The 400-by-400 grid", "Share one discovered set so each land cell is searched once, instead of restarting a search from every land cell.")`,
        ),
        'A shared discovered set schedules each land cell exactly once across all searches, so the scan is O(RC) and every search it starts is a new island.',
        'Scan cells in row order. At undiscovered land, count an island and flood-fill it with a stack, marking cells when you schedule them.',
      ),
    ],
    [
      [
        'How do you count the islands in a grid?',
        'Scan every cell and start a flood fill only from land no earlier search discovered; each search started is one island.',
      ],
      [
        'Why can unchecked negative grid indices join cells that are not adjacent?',
        'Negative indices wrap to the final row or column, inventing a move across the border.',
      ],
    ],
  ),
  skill(
    'cp-topological',
    'cp-paths',
    'Schedule dependencies or find a cycle',
    'Remove zero-indegree vertices and detect when no complete ordering exists.',
    [
      'cp-release-dependency',
      'cp-fifo-frontier',
      'cp-graph-models',
      'while-loops',
    ],
    [
      'In a directed dependency graph, edge u → v means u must appear before v. A topological order places every vertex once while respecting every edge. Such an order exists exactly when the graph has no directed cycle; several valid orders may exist.',
      'Kahn’s algorithm counts incoming edges, then queues every zero-indegree vertex. Removing a queued vertex releases its outgoing edges; when a neighbor’s remaining indegree becomes zero, that neighbor becomes ready. Parallel edges must be counted and removed with matching multiplicity.',
      'If fewer than n vertices are removed, the unreleased part contains a cycle, so return None rather than a partial schedule. The initial queue must include isolated vertices and ready vertices in every component. With adjacency lists and a deque, total time is O(n + m) and auxiliary space is O(n + m), including the graph.',
    ],
    `from collections import deque
n = 4
edges = [(0, 2), (1, 2), (2, 3)]
graph = [[] for _ in range(n)]
indegree = [0] * n
for source, target in edges:
    graph[source].append(target)
    indegree[target] += 1
queue = deque(vertex for vertex in range(n) if indegree[vertex] == 0)
order = []
while queue:
    vertex = queue.popleft()
    order.append(vertex)
    for neighbor in graph[vertex]:
        indegree[neighbor] -= 1
        if indegree[neighbor] == 0:
            queue.append(neighbor)
print(order if len(order) == n else None)`,
    '[0, 1, 2, 3]',
    'Vertices 0 and 1 are initially ready; vertex 2 must wait for both prerequisites.',
    [
      choice(
        'Under edge u → v meaning a prerequisite, what must every topological order satisfy?',
        [
          'v must precede u.',
          'u and v must be adjacent.',
          'u must precede v.',
          'Vertices must be sorted numerically.',
        ],
        2,
        'Each directed edge imposes an earlier-to-later ordering constraint.',
        'Read the edge as prerequisite followed by dependent.',
      ),
      choice(
        'Kahn’s algorithm processes only three of five vertices. What should a complete-schedule function return?',
        [
          'The three-vertex prefix as a successful schedule.',
          'None, because a cycle prevents a full order.',
          'A duplicate of the last processed vertex.',
          'The remaining vertices in arbitrary order.',
        ],
        1,
        'A partial schedule does not satisfy the requirement to order all vertices.',
        'Compare the processed count with n.',
      ),
      choice(
        'Why should the initial ready queue inspect every vertex?',
        [
          'To include isolated vertices and zero-indegree vertices in all components.',
          'To make every vertex have indegree zero.',
          'To reverse all dependency edges.',
          'To ensure the answer is unique.',
        ],
        0,
        'A topological order covers the whole graph, including disconnected components.',
        'A single chosen source does not represent the entire schedule.',
      ),
      exercise(
        'Implement dependency_order(n, edges). n is nonnegative, and each (u, v) pair uses valid vertices 0 through n-1 and requires u before v. Return any topological order containing every vertex exactly once, or None if a directed cycle exists. For n=0 return []. Keep isolated vertices; parallel edges and self-loops are allowed. Preserve edges. A hidden graph with 100,000 vertices and 400,000 edges must finish within 3 seconds.',
        `from collections import deque

def dependency_order(n, edges):
    pass`,
        `from collections import deque

def dependency_order(n, edges):
    graph = [[] for _ in range(n)]
    indegree = [0] * n
    for source, target in edges:
        graph[source].append(target)
        indegree[target] += 1
    queue = deque(vertex for vertex in range(n) if indegree[vertex] == 0)
    result = []
    while queue:
        vertex = queue.popleft()
        result.append(vertex)
        for neighbor in graph[vertex]:
            indegree[neighbor] -= 1
            if indegree[neighbor] == 0:
                queue.append(neighbor)
    return result if len(result) == n else None`,
        withLargeCase(
          `def valid_order(order, n, edges):
    if not isinstance(order, list) or sorted(order) != list(range(n)):
        return False
    position = {vertex: index for index, vertex in enumerate(order)}
    return all(position[u] < position[v] for u, v in edges)

assert dependency_order(0, []) == [], "The empty graph has an empty order."
assert valid_order(dependency_order(4, []), 4, []), "Keep all isolated vertices."
edges = [(0, 2), (1, 2), (2, 3)]
assert valid_order(dependency_order(4, edges), 4, edges), "Respect every prerequisite."
assert dependency_order(3, [(0, 1), (1, 2), (2, 0)]) is None, "A directed cycle has no valid order."
assert dependency_order(3, [(0, 0)]) is None, "A self-loop blocks the complete order."
assert dependency_order(4, [(1, 2), (2, 1)]) is None, "An isolated ready vertex must not hide a cycle elsewhere."
parallel = [(0, 1), (0, 1), (1, 2)]
assert valid_order(dependency_order(3, parallel), 3, parallel), "Match parallel-edge indegree increments and decrements."
assert edges == [(0, 2), (1, 2), (2, 3)], "Preserve the edge list."`,
          `_key = _numbers(100000, 0, 10**9, 181)
_rank = sorted(range(100000), key=lambda vertex: _key[vertex])
_starts = _numbers(300000, 0, 99998, 182)
_gaps = _numbers(300000, 1, 50, 183)
_edges = [(_rank[_starts[i]], _rank[min(99999, _starts[i] + _gaps[i])]) for i in range(300000)]
_edges += [(_rank[i], _rank[i + 1]) for i in range(99999)]
def _valid(order):
    if not isinstance(order, list) or len(order) != 100000:
        return False
    position = [0] * 100000
    for index, vertex in enumerate(order):
        position[vertex] = index
    return sorted(order) == list(range(100000)) and all(position[u] < position[v] for u, v in _edges)
_result, _seconds = _timed(dependency_order, 100000, _edges)
assert _valid(_result), "The 100,000-vertex graph returned an invalid order."
_check_time(_seconds, "The 100,000-vertex graph", "Release each vertex once with indegree counts instead of rescanning the edges for a ready vertex.")`,
        ),
        'Zero remaining indegree means every prerequisite has been released. The final vertex count distinguishes a full order from a cyclic blockage.',
        'Count indegrees, queue every zero, release each outgoing edge once, and reject an incomplete result.',
      ),
    ],
    [
      [
        'When does a directed graph have a topological order?',
        'Exactly when it is acyclic; every edge’s source must occur before its destination.',
      ],
      [
        'How does Kahn’s algorithm detect a cycle?',
        'After repeatedly removing zero-indegree vertices, fewer than n processed vertices means a cycle remains.',
      ],
    ],
  ),
  skill(
    'cp-dijkstra',
    'cp-paths',
    'Relax routes in best-known order',
    'Use a heap to solve directed shortest paths with nonnegative weights.',
    ['cp-minimum-distance-work', 'cp-graph-models', 'errors'],
    [
      'Dijkstra’s algorithm maintains the best known distance to each vertex. The source starts at zero and other distances start unknown. Relaxing u → v with weight w means replacing distance[v] when distance[u] + w is a smaller known route.',
      'A min-heap chooses the smallest tentative distance next. With nonnegative weights, a current minimum cannot be improved by extending a longer route through a negative step. Reject negative edges; ordinary Dijkstra is not a valid general shortest-path algorithm for them. Zero-weight edges and cycles are allowed.',
      'The simple heap implementation pushes a new entry for every improvement instead of updating an old entry. Skip a popped entry when its distance no longer matches the current best value. Return None for unreachable vertices. With parallel edges allowed, a safe lazy-heap bound is O((V + E) log(V + E + 1)) time and O(V + E) space.',
    ],
    `import heapq
graph = [
    [(1, 9), (2, 2)],
    [(3, 4)],
    [(1, 1), (3, 8)],
    [],
    [],
]
distance = [None] * len(graph)
distance[0] = 0
heap = [(0, 0)]
while heap:
    cost, vertex = heapq.heappop(heap)
    if cost != distance[vertex]:
        continue
    for neighbor, weight in graph[vertex]:
        candidate = cost + weight
        if distance[neighbor] is None or candidate < distance[neighbor]:
            distance[neighbor] = candidate
            heapq.heappush(heap, (candidate, neighbor))
print(distance)`,
    '[0, 3, 2, 7, None]',
    'The indirect route through 2 improves vertex 1 from cost 9 to 3, making the old heap entry stale.',
    [
      choice(
        'Which edge weights satisfy this Dijkstra contract?',
        [
          'Only strictly positive weights',
          'Arbitrary positive and negative weights',
          'Only weights equal to one',
          'Nonnegative weights, including zero',
        ],
        3,
        'Zero is permitted; negative edges invalidate the usual minimum-distance argument.',
        'A route extension must never reduce its cost by a negative edge.',
      ),
      choice(
        'The heap pops (12, u), but distance[u] is now 7. What should the algorithm do?',
        [
          'Restore distance[u] to 12.',
          'Skip this stale entry.',
          'Delete every edge leaving u.',
          'Mark every unreachable vertex as 12.',
        ],
        1,
        'A better entry already represents the current route; scanning from the stale distance is unnecessary.',
        'Compare a heap snapshot with the current distance array.',
      ),
      choice(
        'What does relaxing edge u → v with weight w attempt?',
        [
          'Improve v with distance[u] + w.',
          'Replace u with the greatest outgoing weight.',
          'Decrease every graph weight by w.',
          'Require u and v to have equal distances.',
        ],
        0,
        'A known route to u can be extended by the edge cost to form a candidate route to v.',
        'A path’s cost is the sum of its edge weights.',
      ),
      exercise(
        'Implement shortest_costs(n, edges, source). n is positive; vertices are 0 through n-1, source is valid, and edges contains directed (u, v, weight) triples with valid endpoints and integer weights. Return minimum costs from source, using None for unreachable vertices. Parallel edges, self-loops, and zero-weight cycles are allowed. Raise ValueError if any weight is negative, even in an unreachable component. Preserve edges. A hidden graph with 50,000 vertices and 250,000 edges must finish within 3 seconds.',
        `import heapq

def shortest_costs(n, edges, source):
    pass`,
        `import heapq

def shortest_costs(n, edges, source):
    graph = [[] for _ in range(n)]
    for first, second, weight in edges:
        if weight < 0:
            raise ValueError("Dijkstra requires nonnegative weights")
        graph[first].append((second, weight))
    distance = [None] * n
    distance[source] = 0
    heap = [(0, source)]
    while heap:
        cost, vertex = heapq.heappop(heap)
        if cost != distance[vertex]:
            continue
        for neighbor, weight in graph[vertex]:
            candidate = cost + weight
            if distance[neighbor] is None or candidate < distance[neighbor]:
                distance[neighbor] = candidate
                heapq.heappush(heap, (candidate, neighbor))
    return distance`,
        withLargeCase(
          `assert shortest_costs(1, [], 0) == [0], "A lone source has cost zero."
edges = [(0, 1, 9), (0, 2, 2), (2, 1, 1), (1, 3, 4), (2, 3, 8)]
assert shortest_costs(5, edges, 0) == [0, 3, 2, 7, None], "Improve old routes and retain unreachable markers."
assert shortest_costs(3, [(0, 1, 0), (1, 0, 0), (1, 2, 5)], 0) == [0, 0, 5], "Zero cycles are permitted."
assert shortest_costs(2, [(0, 1, 8), (0, 1, 3), (0, 0, 4)], 0) == [0, 3], "Choose the cheaper parallel edge."
assert shortest_costs(3, [(2, 0, 4)], 2) == [4, None, 0], "Respect source and direction."
try:
    shortest_costs(3, [(1, 2, -1)], 0)
except ValueError:
    pass
else:
    assert False, "Reject every negative edge, including unreachable ones."
assert edges == [(0, 1, 9), (0, 2, 2), (2, 1, 1), (1, 3, 4), (2, 3, 8)], "Preserve edges."`,
          `_u = _numbers(150000, 0, 49999, 191)
_v = _numbers(150000, 0, 49999, 192)
_w = _numbers(150000, 0, 10**6, 193)
_edges = [(_u[i], _v[i], _w[i]) for i in range(150000)]
_edges += [(i + 1, i, 1) for i in range(49998, -1, -1)]
_edges += [(i, i + 1, 3) for i in range(49998, -1, -1)]
_result, _seconds = _timed(shortest_costs, 50000, _edges, 0)
assert _checksum(_result) == 1645433355848269451, "The 50,000-vertex graph returned wrong costs."
_check_time(_seconds, "The 50,000-vertex graph", "Settle vertices in heap order instead of relaxing every edge in rounds.")`,
        ),
        'Validating all edges establishes the nonnegative precondition before exploration. Heap entries propose routes; the distance array decides which proposals are still current.',
        'Build outgoing weighted lists, reject negative weights, then relax from matching minimum heap entries.',
      ),
    ],
    [
      [
        'Why reject negative edges for ordinary Dijkstra?',
        'Its minimum-distance argument relies on route extensions having nonnegative cost.',
      ],
      [
        'How does a lazy Dijkstra heap recognize an outdated entry?',
        'Its popped cost differs from the vertex’s current best distance; skip that entry.',
      ],
    ],
  ),
  skill(
    'cp-dsu',
    'cp-paths',
    'Merge connected sets efficiently',
    'Track undirected components with representatives, sizes, and path compression.',
    ['cp-compress-path', 'cp-union-size', 'cp-undirected-edge'],
    [
      'Disjoint set union maintains a partition of vertices. Each set has a representative root; find(vertex) follows parent links to that root. Initially every vertex belongs to its own set, so n vertices mean n components even before any edge arrives.',
      'For an undirected connection u—v, find both roots. If they differ, attach the smaller set’s root to the larger root, update its size, and decrease the component count once. A repeated edge, self-loop, or edge inside an existing component changes no membership. This structure answers connectivity, not shortest paths or directed reachability.',
      'Path compression shortens parent chains during find. An iterative variant redirects a vertex to its grandparent as it climbs. Combined with union by size, operations take amortized O(α(n)) time, where inverse Ackermann grows extremely slowly; it is not a literal worst-case O(1) promise. Initialization costs O(n), and parent and size arrays require O(n) space.',
    ],
    `n = 5
parent = list(range(n))
size = [1] * n
components = n
def find(vertex):
    while parent[vertex] != vertex:
        parent[vertex] = parent[parent[vertex]]
        vertex = parent[vertex]
    return vertex

counts = []
for first, second in [(0, 1), (2, 3), (1, 2), (0, 3), (4, 4)]:
    a, b = find(first), find(second)
    if a != b:
        if size[a] < size[b]:
            a, b = b, a
        parent[b] = a
        size[a] += size[b]
        components -= 1
    counts.append(components)
print(counts)`,
    '[4, 3, 2, 2, 2]',
    'The first three edges merge separate sets; the final two create no new connection between components.',
    [
      choice(
        'When should adding an undirected edge decrease the DSU component count?',
        [
          'Whenever the endpoints have different numeric labels.',
          'For every edge, including repeated edges.',
          'Only when the endpoint representatives differ.',
          'Only when the edge has positive weight.',
        ],
        2,
        'Different representatives identify separate sets; an internal edge does not merge components.',
        'Compare roots rather than endpoint labels.',
      ),
      choice(
        'What does union by size attach?',
        [
          'The smaller set’s root below the larger set’s root.',
          'Every member directly to the smallest vertex label.',
          'The larger root below a random non-root vertex.',
          'A new copy of the entire smaller set.',
        ],
        0,
        'Attaching roots preserves the partition and avoids copying every member.',
        'Size is a property of the representative set.',
      ),
      choice(
        'Which question is ordinary DSU designed to answer?',
        [
          'What is the minimum directed route cost?',
          'What is the topological order?',
          'How many hops connect two vertices?',
          'Do two vertices belong to the same undirected component?',
        ],
        3,
        'Equal representatives establish component membership, without recording a particular route.',
        'A partition does not store ordered paths.',
      ),
      exercise(
        'Implement component_counts(n, edges). n is nonnegative and starts with n isolated vertices, numbered 0 through n-1. edges is a sequence of undirected (u, v) connections with valid endpoints; when n=0 it is empty. Return the number of connected components after each edge, in input order. Repeated edges and self-loops must not decrease the count again. Preserve edges. Use iterative find, path compression, and union by size. A hidden case with 100,000 vertices and 200,000 edges must finish within 3 seconds.',
        `def component_counts(n, edges):
    pass`,
        `def component_counts(n, edges):
    parent = list(range(n))
    size = [1] * n
    components = n
    result = []
    def find(vertex):
        while parent[vertex] != vertex:
            parent[vertex] = parent[parent[vertex]]
            vertex = parent[vertex]
        return vertex
    for first, second in edges:
        a, b = find(first), find(second)
        if a != b:
            if size[a] < size[b]:
                a, b = b, a
            parent[b] = a
            size[a] += size[b]
            components -= 1
        result.append(components)
    return result`,
        withLargeCase(
          `assert component_counts(0, []) == [], "No edges produce no snapshots."
assert component_counts(4, []) == [], "Return counts after edges, not an initial snapshot."
assert component_counts(1, [(0, 0), (0, 0)]) == [1, 1], "Self-loops do not merge sets."
assert component_counts(4, [(0, 1), (2, 3), (1, 2)]) == [3, 2, 1], "Merge separate components."
assert component_counts(3, [(0, 1), (1, 0), (1, 2), (0, 2)]) == [2, 2, 1, 1], "Repeated and internal edges do not merge again."
source = [(1, 2), (0, 1)]
assert component_counts(4, source) == [3, 2], "Isolated vertices remain components."
assert source == [(1, 2), (0, 1)], "Preserve the input connections."`,
          `_a = _numbers(100000, 0, 99999, 201)
_b = _numbers(100000, 0, 99999, 202)
_edges = [(i, i + 1) for i in range(49999)] + [(_a[i], _b[i]) for i in range(100000)] + [(0, _a[i]) for i in range(50000)]
_result, _seconds = _timed(component_counts, 100000, _edges)
assert _checksum(_result) == 403053540933972930, "The 200,000-edge case returned wrong counts."
_check_time(_seconds, "The 200,000-edge case", "Use union by size and path compression instead of relabeling or walking long parent chains.")`,
        ),
        'Only a union between different representatives joins two components; all other edge types leave the partition unchanged.',
        'Start the count at n, compare roots for each edge, and decrement only after a successful root merge.',
      ),
    ],
    [
      [
        'What does a DSU representative identify?',
        'One disjoint set; two vertices are in the same component exactly when find returns the same root.',
      ],
      [
        'Why combine path compression with union by size?',
        'They keep parent chains short and give amortized O(α(n)) operations without copying set members.',
      ],
    ],
  ),
  skill(
    'cp-mst',
    'cp-paths',
    'Connect every vertex at minimum cost',
    'Use Kruskal’s edge order and disjoint sets to build a spanning tree.',
    ['cp-edge-weight-order', 'cp-spanning-completion', 'cp-dsu'],
    [
      'A spanning tree connects all n vertices of an undirected graph without a cycle, using n-1 edges when n > 0. A minimum spanning tree minimizes the sum of its chosen edge weights. It is different from minimizing routes from one source: an MST is a network-wide connection objective.',
      'Kruskal’s algorithm sorts edges from cheapest to most expensive. Accept an edge only when its endpoints belong to different DSU components. This merges the components without creating a cycle. The cheapest available edge across a component boundary is safe by the cut property: some minimum spanning tree can include it.',
      'Parallel edges and negative weights are allowed; self-loops never connect different components. If fewer than n-1 edges can be accepted, the graph is disconnected and no spanning tree exists. Return None in that case; for n=0 or n=1, the empty tree costs zero. With sorting and DSU, time is O(n + m log(m+1) + mα(n)) and space is O(n + m).',
    ],
    `edges = [(0, 1, 6), (1, 2, 1), (0, 2, 4), (2, 3, 2), (1, 3, 8)]
parent = list(range(4))
size = [1] * 4
def find(vertex):
    while parent[vertex] != vertex:
        parent[vertex] = parent[parent[vertex]]
        vertex = parent[vertex]
    return vertex

cost = 0
chosen = 0
for first, second, weight in sorted(edges, key=lambda edge: edge[2]):
    a, b = find(first), find(second)
    if a != b:
        if size[a] < size[b]:
            a, b = b, a
        parent[b] = a
        size[a] += size[b]
        cost += weight
        chosen += 1
print(cost if chosen == 3 else None)`,
    '7',
    'Weights 1, 2, and 4 connect all four vertices; heavier edges would be unnecessary or create cycles.',
    [
      choice(
        'Why does Kruskal reject an edge whose endpoints already share a DSU root?',
        [
          'Its weight must be negative.',
          'Adding it would create a cycle in the chosen forest.',
          'It must be the most expensive graph edge.',
          'It would make a vertex isolated.',
        ],
        1,
        'The chosen forest already has a path between those endpoints, so another edge closes a cycle.',
        'DSU tracks connectivity of the accepted edges.',
      ),
      choice(
        'What does a minimum spanning tree minimize?',
        [
          'The shortest route from vertex 0 to every vertex separately.',
          'The number of input edges.',
          'The total weight of an acyclic network connecting every vertex.',
          'The largest vertex label.',
        ],
        2,
        'The objective is the sum of selected network edges, not every source-to-vertex path.',
        'Distinguish a connection objective from a route objective.',
      ),
      choice(
        'Kruskal accepts fewer than n-1 edges after considering all edges, with n > 1. What follows?',
        [
          'The graph is disconnected, so no spanning tree exists.',
          'The accepted prefix is necessarily a spanning tree.',
          'Negative edges must have appeared.',
          'All equal-weight edges must be accepted.',
        ],
        0,
        'If the selected forest cannot merge to one component, some vertices cannot be connected by the input graph.',
        'A tree on n vertices needs n-1 successful merges.',
      ),
      exercise(
        'Implement minimum_link_cost(n, edges). n is nonnegative; edges contains undirected (u, v, weight) triples with valid vertex indices 0 through n-1 and integer weights. Return the minimum total cost of a spanning tree, or None if the graph is disconnected. For n=0 or n=1 return 0. Parallel edges, self-loops, ties, and negative weights are allowed. Preserve edges. Use Kruskal with DSU. A hidden graph with 50,000 vertices and 200,000 edges must finish within 3 seconds.',
        `def minimum_link_cost(n, edges):
    pass`,
        `def minimum_link_cost(n, edges):
    if n <= 1:
        return 0
    parent = list(range(n))
    size = [1] * n
    def find(vertex):
        while parent[vertex] != vertex:
            parent[vertex] = parent[parent[vertex]]
            vertex = parent[vertex]
        return vertex
    total = 0
    chosen = 0
    for first, second, weight in sorted(edges, key=lambda edge: edge[2]):
        a, b = find(first), find(second)
        if a != b:
            if size[a] < size[b]:
                a, b = b, a
            parent[b] = a
            size[a] += size[b]
            total += weight
            chosen += 1
    return total if chosen == n - 1 else None`,
        withLargeCase(
          `assert minimum_link_cost(0, []) == 0, "The empty tree has cost zero."
assert minimum_link_cost(1, [(0, 0, -9)]) == 0, "A loop is not needed to span one vertex."
edges = [(0, 1, 6), (1, 2, 1), (0, 2, 4), (2, 3, 2), (1, 3, 8)]
assert minimum_link_cost(4, edges) == 7, "Choose the cheapest connecting forest."
assert minimum_link_cost(3, [(0, 1, 2)]) is None, "Do not report a disconnected forest as a tree."
assert minimum_link_cost(3, [(0, 0, -100), (0, 1, -3), (1, 2, 2), (0, 2, 8)]) == -1, "Negative connecting edges are allowed; self-loops are ignored."
assert minimum_link_cost(2, [(0, 1, 7), (0, 1, 2)]) == 2, "Select the cheaper parallel edge."
assert minimum_link_cost(3, [(0, 1, 4), (1, 2, 4), (0, 2, 4)]) == 8, "Equal weights can yield several valid trees."
assert edges == [(0, 1, 6), (1, 2, 1), (0, 2, 4), (2, 3, 2), (1, 3, 8)], "Preserve the edge list."`,
          `_u = _numbers(150000, 0, 49999, 211)
_v = _numbers(150000, 0, 49999, 212)
_w = _numbers(150000, -1000, 10**6, 213)
_edges = [(_u[i], _v[i], _w[i]) for i in range(150000)] + [(i, i + 1, 10**6 + i) for i in range(49999)]
_result, _seconds = _timed(minimum_link_cost, 50000, _edges)
assert _result == 10005199259, "The 50,000-vertex graph returned the wrong cost."
_check_time(_seconds, "The 50,000-vertex graph", "Join components with a disjoint-set forest instead of relabeling vertices.")`,
        ),
        'Sorted edge consideration plus successful DSU merges yields an acyclic minimum-cost forest; n-1 accepted edges certify that it spans every vertex.',
        'Sort by weight, accept only edges joining different roots, accumulate their weights, and verify the final merge count.',
      ),
    ],
    [
      [
        'What does Kruskal’s algorithm accept?',
        'Edges in increasing weight order whose endpoints currently belong to different components.',
      ],
      [
        'How do you distinguish an MST from a disconnected minimum spanning forest?',
        'For n > 0, a spanning tree requires exactly n-1 accepted edges; otherwise return no spanning tree.',
      ],
    ],
  ),
];
