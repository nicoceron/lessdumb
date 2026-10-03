import type { Skill } from '../../curriculum';
import { choice, exercise, skill } from './shared';

type ConceptQuestion = [string, string[], number, string, string];
type AtomicSkill = {
  id: string;
  unit: string;
  title: string;
  parents: string[];
  summary: string;
  lesson: [string, string];
  signature: string;
  prompt: string;
  solution: string;
  tests: string;
  call: string;
  output: string;
  questions: [ConceptQuestion, ConceptQuestion, ConceptQuestion];
  cards: [string, string][];
};

// These are separately taught and assessed steps. The catalog puts the original
// integration exercise after the final step; these nodes never depend on it.
function atom(spec: AtomicSkill): Skill {
  return {
    ...skill(
      spec.id,
      spec.unit,
      spec.title,
      spec.summary,
      spec.parents,
      spec.lesson,
      `${spec.solution}\n\n${spec.call}`,
      spec.output,
      spec.lesson[1],
      [
        ...spec.questions.map((question) => choice(...question)),
        exercise(
          spec.prompt,
          `${spec.signature}\n    pass`,
          spec.solution,
          spec.tests,
          spec.lesson[1],
          spec.summary,
        ),
      ],
      spec.cards,
    ),
    estimatedMinutes: 5,
  };
}

export const competitiveStructureStages: Record<string, string[]> = {
  'cp-stacks': ['cp-stack-push', 'cp-stack-peek', 'cp-stack-pop'],
  'cp-monotonic-stack': [
    'cp-pending-indices',
    'cp-strict-stack-pop',
    'cp-stack-operation-budget',
  ],
  'cp-heaps': ['cp-heap-invariant', 'cp-heap-build', 'cp-heap-updates'],
  'cp-tries': ['cp-trie-path', 'cp-trie-word-end', 'cp-trie-prefix-count'],
  'cp-recursion': [
    'cp-recursive-base',
    'cp-recursive-shrink',
    'cp-recursive-combine',
  ],
  'cp-backtracking': [
    'cp-choice-undo',
    'cp-path-snapshot',
    'cp-remaining-capacity',
  ],
  'cp-bst': ['cp-bst-bounds', 'cp-bst-branch', 'cp-bst-candidate'],
  'cp-tree-traversal': [
    'cp-tree-children',
    'cp-preorder-frontier',
    'cp-postorder-combine',
  ],
  'cp-graph-models': [
    'cp-vertex-lists',
    'cp-directed-edge',
    'cp-undirected-edge',
  ],
  'cp-dfs': ['cp-discover-once', 'cp-dfs-frontier', 'cp-dfs-cycle-guard'],
  'cp-bfs': ['cp-fifo-frontier', 'cp-bfs-discovery', 'cp-bfs-layer-distance'],
  'cp-grids': ['cp-grid-bounds', 'cp-grid-passability', 'cp-grid-component'],
  'cp-topological': [
    'cp-incoming-counts',
    'cp-zero-indegree',
    'cp-release-dependency',
  ],
  'cp-dijkstra': [
    'cp-distance-relaxation',
    'cp-stale-distance',
    'cp-minimum-distance-work',
  ],
  'cp-dsu': ['cp-parent-root', 'cp-compress-path', 'cp-union-size'],
  'cp-mst': [
    'cp-edge-weight-order',
    'cp-forest-cycle-check',
    'cp-spanning-completion',
  ],
};

export const competitiveMicroStructures: Skill[] = [
  atom({
    id: 'cp-stack-push',
    unit: 'cp-structures',
    title: 'Push one stack entry',
    parents: ['parameters'],
    summary: 'Append at the right end while preserving earlier entries.',
    lesson: [
      'A stack stores entries from oldest at the left to newest at the right. Pushing one value appends it; it does not replace an equal value or reorder the earlier history.',
      'Copy the caller’s list when the function promises a new stack. append then adds exactly one entry. Duplicate values remain distinct actions.',
    ],
    signature: 'def push_entry(stack, value):',
    prompt:
      'Implement push_entry(stack, value). Return a new list containing all stack entries followed by value. Preserve stack; repeated values are separate entries.',
    solution: `def push_entry(stack, value):
    result = stack.copy()
    result.append(value)
    return result`,
    tests: `assert push_entry([], "a") == ["a"]
assert push_entry([2, 2], 2) == [2, 2, 2]
source = [3, 1]
result = push_entry(source, 4)
assert result == [3, 1, 4]
assert source == [3, 1]
result.append(9)
assert source == [3, 1]`,
    call: 'print(push_entry(["draft", "check"], "save"))',
    output: "['draft', 'check', 'save']",
    questions: [
      [
        'Which entry is newest in ["a", "b", "c"]?',
        ['a', 'b', 'c'],
        2,
        'The rightmost entry c was pushed last.',
        'Read from oldest to newest.',
      ],
      [
        'What does pushing 2 onto [2] produce?',
        ['[2]', '[2, 2]', '[]'],
        1,
        'Pushing adds an occurrence even when its value repeats.',
        'Entries are actions, not a set.',
      ],
      [
        'Which operation adds at a list’s right end?',
        ['append(value)', 'pop()', 'sort()'],
        0,
        'append adds one value after existing entries.',
        'Preserve the earlier order.',
      ],
    ],
    cards: [
      [
        'Where does a list stack push a new entry?',
        'At the right end with append(value).',
      ],
      [
        'Does pushing an equal value replace the old entry?',
        'No. Each push adds a separate entry.',
      ],
    ],
  }),
  atom({
    id: 'cp-stack-peek',
    unit: 'cp-structures',
    title: 'Inspect the newest stack entry',
    parents: ['cp-stack-push'],
    summary: 'Read the rightmost entry without removing it.',
    lesson: [
      'Peeking returns the newest stack entry while leaving the stack unchanged. In a Python list that entry is stack[-1].',
      'An empty stack has no top. Check emptiness before indexing and use the stated empty result; in this exercise it is None.',
    ],
    signature: 'def peek_entry(stack):',
    prompt:
      'Implement peek_entry(stack) for integer entries. Return the rightmost integer or None for an empty list. Do not remove or change any entry.',
    solution: `def peek_entry(stack):
    if not stack:
        return None
    return stack[-1]`,
    tests: `assert peek_entry([]) is None
assert peek_entry([0]) == 0
assert peek_entry([9, -2, 9]) == 9
source = [2, 5]
assert peek_entry(source) == 5
assert source == [2, 5]`,
    call: 'print(peek_entry([7, 2]))\nprint(peek_entry([]))',
    output: '2\nNone',
    questions: [
      [
        'How is the top of a nonempty list stack read?',
        ['stack[0]', 'stack[-1]', 'len(stack)'],
        1,
        'Index -1 selects the rightmost entry.',
        'The latest entry is on the right.',
      ],
      [
        'After peeking at [4, 8], what should remain?',
        ['[4]', '[8]', '[4, 8]'],
        2,
        'Peeking does not change the stored entries.',
        'Inspection has no removal.',
      ],
      [
        'What must happen before reading stack[-1]?',
        [
          'Check that the stack is nonempty.',
          'Sort the stack.',
          'Append None.',
        ],
        0,
        'Indexing an empty list is invalid.',
        'There must be an entry to inspect.',
      ],
    ],
    cards: [
      [
        'How do you peek at a nonempty Python list stack?',
        'Read stack[-1] without popping.',
      ],
      ['Why guard a stack peek?', 'An empty list has no valid final index.'],
    ],
  }),
  atom({
    id: 'cp-stack-pop',
    unit: 'cp-structures',
    title: 'Remove one stack entry safely',
    parents: ['cp-stack-push'],
    summary: 'Undo exactly the most recent entry and handle emptiness.',
    lesson: [
      'Popping removes the rightmost entry, so every earlier entry keeps its order. This is the last-in, first-out rule.',
      'For an ignored empty undo, pop only when the list is nonempty. Returning a copied remainder makes the function’s mutation contract explicit.',
    ],
    signature: 'def undo_one(stack):',
    prompt:
      'Implement undo_one(stack). Return a new list with its last entry removed. If stack is empty, return []. Preserve the input and remove only one occurrence.',
    solution: `def undo_one(stack):
    result = stack.copy()
    if result:
        result.pop()
    return result`,
    tests: `assert undo_one([]) == []
assert undo_one([4]) == []
assert undo_one([3, 3, 1]) == [3, 3]
source = [1, 2]
assert undo_one(source) == [1]
assert source == [1, 2]`,
    call: 'print(undo_one(["open", "edit", "save"]))\nprint(undo_one([]))',
    output: "['open', 'edit']\n[]",
    questions: [
      [
        'Which entry does pop() remove from [5, 6, 7]?',
        ['5', '6', '7'],
        2,
        'A pop without an index removes the final entry.',
        'Undo the most recent push.',
      ],
      [
        'Which guard safely ignores an empty undo?',
        [
          'if result: result.pop()',
          'if not result: result.pop()',
          'result.pop(0)',
        ],
        0,
        'The guard removes only when an entry exists.',
        'An empty list is false.',
      ],
      [
        'After undoing one entry from ["x", "x"], what remains?',
        ['[]', '["x"]', '["x", "x"]'],
        1,
        'One occurrence is removed; the earlier identical action remains.',
        'Undo once.',
      ],
    ],
    cards: [
      [
        'Which stack entry does pop() remove?',
        'The newest entry at the right end.',
      ],
      ['How can an empty undo do nothing?', 'Guard pop with if stack.'],
    ],
  }),
  atom({
    id: 'cp-pending-indices',
    unit: 'cp-structures',
    title: 'Store an unresolved index',
    parents: ['cp-stack-push', 'comprehensions'],
    summary: 'Retain positions so a later answer can reach its original slot.',
    lesson: [
      'An unresolved answer belongs to an original index. A pending stack therefore stores indices rather than only values; values[index] retrieves the associated measurement.',
      'Even equal measurements have different answer slots. Keeping both indices prevents a duplicate value from losing its identity.',
    ],
    signature: 'def pending_values(values, pending):',
    prompt:
      'Implement pending_values(values, pending). pending contains valid indices into values. Return the corresponding values in the same pending order, preserving duplicates and both inputs.',
    solution: `def pending_values(values, pending):
    return [values[index] for index in pending]`,
    tests: `assert pending_values([], []) == []
assert pending_values([8, 3, 8], [0, 2]) == [8, 8]
assert pending_values([4, 7, 1], [2, 0]) == [1, 4]
values = [9, 2]
pending = [1, 0]
assert pending_values(values, pending) == [2, 9]
assert values == [9, 2] and pending == [1, 0]`,
    call: 'print(pending_values([6, 2, 6, 1], [0, 2, 3]))',
    output: '[6, 6, 1]',
    questions: [
      [
        'Why store indices in a pending-answer stack?',
        [
          'To know each answer’s destination.',
          'To sort all values.',
          'To discard duplicate values.',
        ],
        0,
        'The original position identifies the answer slot.',
        'An answer belongs to a position.',
      ],
      [
        'For values=[5, 5], can indices 0 and 1 both be pending?',
        [
          'No; they are equal.',
          'Yes; they have separate answer slots.',
          'Only index 1 can be pending.',
        ],
        1,
        'Equal values still occupy different positions.',
        'Separate identity from value.',
      ],
      [
        'With values=[4, 9, 2] and pending=[0, 2], which values are pending?',
        ['[0, 2]', '[9, 2]', '[4, 2]'],
        2,
        'Look up each stored index in the original list.',
        'Use values[index].',
      ],
    ],
    cards: [
      [
        'What does an unresolved index identify?',
        'Its original answer slot and its measurement via values[index].',
      ],
      [
        'Why keep indices for equal pending values?',
        'Equal values can still need answers at different positions.',
      ],
    ],
  }),
  atom({
    id: 'cp-strict-stack-pop',
    unit: 'cp-structures',
    title: 'Resolve only strictly smaller entries',
    parents: [
      'cp-pending-indices',
      'cp-stack-peek',
      'cp-stack-pop',
      'while-loops',
    ],
    summary: 'Pop a pending suffix only while its value is strictly smaller.',
    lesson: [
      'In a stack of nonincreasing pending values, a new value resolves smaller entries from the top. Stop when the stack is empty or its top value is at least the new value.',
      'For a strictly greater answer, equality must not resolve an entry. The popping comparison is old < current, never old <= current.',
    ],
    signature: 'def resolve_smaller(values, pending, current):',
    prompt:
      'Implement resolve_smaller(values, pending, current). pending is a list of valid indices whose values are nonincreasing from bottom to top. Return (remaining_indices, popped_indices), with popped indices in actual pop order. Remove only top entries whose value is strictly below current. Preserve inputs.',
    solution: `def resolve_smaller(values, pending, current):
    remaining = pending.copy()
    popped = []
    while remaining and values[remaining[-1]] < current:
        popped.append(remaining.pop())
    return remaining, popped`,
    tests: `assert resolve_smaller([], [], 4) == ([], [])
assert resolve_smaller([8, 5, 5, 2], [0, 1, 2, 3], 5) == ([0, 1, 2], [3])
assert resolve_smaller([7, 4, 1], [0, 1, 2], 9) == ([], [2, 1, 0])
assert resolve_smaller([6, 3], [0, 1], -1) == ([0, 1], [])
source = [0, 1]
assert resolve_smaller([4, 2], source, 3) == ([0], [1])
assert source == [0, 1]`,
    call: 'print(resolve_smaller([8, 4, 4, 1], [0, 1, 2, 3], 4))',
    output: '([0, 1, 2], [3])',
    questions: [
      [
        'Which comparison resolves a strictly smaller top?',
        ['old <= current', 'old < current', 'old > current'],
        1,
        'Equality does not satisfy strictly greater.',
        'Keep equal values pending.',
      ],
      [
        'For pending values [9, 6, 3] and current=7, what pop order occurs?',
        ['9, then 6', '3 only', '3, then 6'],
        2,
        'Pop 3 and 6; stop at 9.',
        'Start at the right end.',
      ],
      [
        'Why stop when the top is at least current?',
        [
          'The nonincreasing stack has no smaller value below that top.',
          'Every answer is complete.',
          'Current must be the maximum.',
        ],
        0,
        'Values below the top are at least as large as it.',
        'Use the stack invariant.',
      ],
    ],
    cards: [
      [
        'What comparison is used for a strictly greater future answer?',
        'Pop pending entries while their old value < the current value.',
      ],
      [
        'What happens to equal pending values?',
        'They remain unresolved because equality is not strictly greater.',
      ],
    ],
  }),
  atom({
    id: 'cp-stack-operation-budget',
    unit: 'cp-structures',
    title: 'Count each index’s stack work',
    parents: ['cp-strict-stack-pop', 'accumulators'],
    summary: 'Charge each push and pop to the index that caused it.',
    lesson: [
      'A nested popping loop does not automatically make a scan quadratic. In this monotonic scan an index is pushed once and, after removal, never pushed again.',
      'If n indices are pushed and p are popped, the total stack work is n+p, at most 2n. The final pending count is n-p.',
    ],
    signature: 'def stack_budget(values):',
    prompt:
      'Implement stack_budget(values). Scan integer values left to right, popping smaller pending values before pushing the current index. Return (push_count, pop_count, final_pending_count). Equal values stay pending. Preserve values.',
    solution: `def stack_budget(values):
    pending = []
    pops = 0
    for index, value in enumerate(values):
        while pending and values[pending[-1]] < value:
            pending.pop()
            pops += 1
        pending.append(index)
    return len(values), pops, len(pending)`,
    tests: `assert stack_budget([]) == (0, 0, 0)
assert stack_budget([5, 4, 3]) == (3, 0, 3)
assert stack_budget([1, 2, 3]) == (3, 2, 1)
assert stack_budget([2, 2]) == (2, 0, 2)
assert stack_budget([4, 1, 3, 6]) == (4, 3, 1)
source = [2, 1, 4]
assert stack_budget(source) == (3, 2, 1)
assert source == [2, 1, 4]`,
    call: 'print(stack_budget([5, 2, 3, 7]))',
    output: '(4, 3, 1)',
    questions: [
      [
        'How many times is one index pushed in a one-pass monotonic scan?',
        ['Once.', 'n times.', 'Once per pop.'],
        0,
        'The for loop handles its index once.',
        'Indices do not return after removal.',
      ],
      [
        'If 8 indices are pushed and 5 popped, how many remain?',
        ['13', '3', '5'],
        1,
        'Every pop removes one of the 8 pushes.',
        'Subtract removals from additions.',
      ],
      [
        'What bounds the total number of pushes plus pops for n indices?',
        ['n squared', 'Only one operation', 'At most 2n'],
        2,
        'There are n pushes and at most n pops.',
        'Charge work to individual indices.',
      ],
    ],
    cards: [
      [
        'Why is total monotonic-stack work linear?',
        'Each index is pushed once and popped at most once.',
      ],
      ['After n pushes and p pops, how many entries remain?', 'n - p entries.'],
    ],
  }),
  atom({
    id: 'cp-heap-invariant',
    unit: 'cp-structures',
    title: 'Check a minimum heap’s local rule',
    parents: ['indexing', 'ranges', 'return-values'],
    summary: 'Require every parent to be no larger than either child.',
    lesson: [
      'A zero-indexed minimum heap places a parent at index i and its children at 2*i+1 and 2*i+2 when those indices exist. Each parent must be no larger than either child.',
      'The minimum is at index zero, but sibling entries need not be ordered. Checking the local parent-child comparisons is sufficient; checking whether the whole list is sorted would reject valid heaps.',
    ],
    signature: 'def is_min_heap(values):',
    prompt:
      'Implement is_min_heap(values) for a list of integers. Return True exactly when every existing child is at least its parent. Empty and one-entry heaps are valid. Preserve values.',
    solution: `def is_min_heap(values):
    for child in range(1, len(values)):
        parent = (child - 1) // 2
        if values[parent] > values[child]:
            return False
    return True`,
    tests: `assert is_min_heap([]) is True
assert is_min_heap([4]) is True
assert is_min_heap([1, 5, 2, 7, 6, 3]) is True
assert is_min_heap([1, 4, 2, 3]) is False
assert is_min_heap([2, 2, 2]) is True
assert is_min_heap([-5, -2, -4]) is True`,
    call: 'print(is_min_heap([1, 5, 2]))\nprint(is_min_heap([1, 5, 2, 3]))',
    output: 'True\nFalse',
    questions: [
      [
        'Where is the minimum in a nonempty minimum heap?',
        ['At index 0.', 'At the last index.', 'At every leaf.'],
        0,
        'The parent-child rule carries the minimum to the root.',
        'Follow smaller parents upward.',
      ],
      [
        'Is [1, 5, 2] a valid minimum heap?',
        [
          'No; it is not sorted.',
          'Yes; both children are at least 1.',
          'Only when 5 is removed.',
        ],
        1,
        'The siblings 5 and 2 need not be sorted.',
        'Compare children to the parent.',
      ],
      [
        'What is the parent index of child index 5?',
        ['5', '3', '2'],
        2,
        '(5-1)//2 is 2.',
        'Use (child-1)//2.',
      ],
    ],
    cards: [
      [
        'What is the minimum-heap invariant?',
        'Every parent value is no larger than its children.',
      ],
      [
        'Must a minimum heap’s entire list be sorted?',
        'No. Only parent-child ordering is required.',
      ],
    ],
  }),
  atom({
    id: 'cp-heap-build',
    unit: 'cp-structures',
    title: 'Build a heap from existing entries',
    parents: ['cp-heap-invariant', 'cp-complexity'],
    summary: 'Heapify a copy before inspecting its minimum.',
    lesson: [
      'heapq.heapify rearranges a list in place into a minimum heap. It does not return a newly ordered list, and it does not completely sort that list.',
      'Copy the input before heapifying when the original order must survive. The resulting root is the minimum; an empty input needs a separate return value before root access.',
    ],
    signature: 'def heap_minimum(values):',
    prompt:
      'Implement heap_minimum(values). Build a minimum heap from a copy using heapq.heapify, then return its root. Return None for an empty list. Preserve the integer input list.',
    solution: `def heap_minimum(values):
    import heapq
    heap = values.copy()
    heapq.heapify(heap)
    return heap[0] if heap else None`,
    tests: `assert heap_minimum([]) is None
assert heap_minimum([7]) == 7
assert heap_minimum([8, -2, 5, -2]) == -2
source = [9, 1, 4]
assert heap_minimum(source) == 1
assert source == [9, 1, 4]`,
    call: 'print(heap_minimum([8, 3, 7, 2]))\nprint(heap_minimum([]))',
    output: '2\nNone',
    questions: [
      [
        'What does heapq.heapify(heap) change?',
        [
          'The supplied list in place.',
          'Only a returned new list.',
          'The numeric values themselves.',
        ],
        0,
        'heapify rearranges its argument.',
        'Copy first if order belongs to the caller.',
      ],
      [
        'Why copy values before heapifying?',
        [
          'To make all values positive.',
          'To preserve the caller’s list order.',
          'To reverse the priorities.',
        ],
        1,
        'The separate heap can be rearranged without touching values.',
        'Mutation is part of the API.',
      ],
      [
        'What is heapify’s time cost for n entries?',
        ['O(n squared)', 'O(1) for any n', 'O(n)'],
        2,
        'Bottom-up heap construction is linear.',
        'Building a heap differs from sorting.',
      ],
    ],
    cards: [
      [
        'Does heapify return the newly arranged heap?',
        'No. It rearranges the supplied list in place.',
      ],
      [
        'How can heap construction preserve the caller’s sequence?',
        'Copy the sequence, then heapify the copy.',
      ],
    ],
  }),
  atom({
    id: 'cp-heap-updates',
    unit: 'cp-structures',
    title: 'Push a priority and pop the minimum',
    parents: ['cp-heap-build'],
    summary: 'Maintain heap order across one insertion and removal.',
    lesson: [
      'heappush inserts one value while preserving the heap rule. heappop removes and returns the current minimum, which may be the value just inserted.',
      'A push followed by a pop is safe even for an initially empty heap because the push supplies an entry first. The caller’s heap can be copied when a new remainder is required.',
    ],
    signature: 'def push_then_take(values, incoming):',
    prompt:
      'Implement push_then_take(values, incoming). Build a heap from integer values, push incoming, and remove the minimum. Return (removed_minimum, sorted_remaining_values). Preserve values. Use heapq push and pop to practice the updates.',
    solution: `def push_then_take(values, incoming):
    import heapq
    heap = values.copy()
    heapq.heapify(heap)
    heapq.heappush(heap, incoming)
    removed = heapq.heappop(heap)
    return removed, sorted(heap)`,
    tests: `assert push_then_take([], 4) == (4, [])
assert push_then_take([5, 2], 1) == (1, [2, 5])
assert push_then_take([5, 2], 8) == (2, [5, 8])
assert push_then_take([3, 3], 3) == (3, [3, 3])
source = [-2, 7]
assert push_then_take(source, 0) == (-2, [0, 7])
assert source == [-2, 7]`,
    call: 'print(push_then_take([8, 2, 5], 1))',
    output: '(1, [2, 5, 8])',
    questions: [
      [
        'After pushing 1 into a heap of 2 and 8, what does the next pop return?',
        ['8', '1', '2'],
        1,
        'The new entry is now the minimum.',
        'Consider all entries after insertion.',
      ],
      [
        'Can an inserted value be removed immediately?',
        [
          'No; only older entries leave.',
          'Only if the heap was empty.',
          'Yes; if it is the minimum.',
        ],
        2,
        'Heap removal follows priority rather than arrival time.',
        'A heap is not a queue.',
      ],
      [
        'Which updates preserve minimum-heap order?',
        [
          'heapq.heappush and heapq.heappop',
          'append and pop(0) without repair',
          'Reversing after every push',
        ],
        0,
        'The heapq operations restore the parent-child rule.',
        'Use the documented heap API.',
      ],
    ],
    cards: [
      [
        'What does heappop remove from a minimum heap?',
        'The smallest current entry.',
      ],
      [
        'Why use heappush rather than plain append on a heap?',
        'heappush preserves the heap invariant after insertion.',
      ],
    ],
  }),
  atom({
    id: 'cp-trie-path',
    unit: 'cp-structures',
    title: 'Follow one character path',
    parents: ['dictionaries', 'parameters'],
    summary: 'Advance through one child dictionary per character.',
    lesson: [
      'A trie represents a string as consecutive character edges. Here each node is a dictionary whose keys are characters and whose values are child nodes.',
      'A missing child means the requested path is absent. The empty string follows no edges, so its path always exists at the root. A path alone does not yet prove that a complete word was inserted.',
    ],
    signature: 'def has_character_path(root, text):',
    prompt:
      'Implement has_character_path(root, text). root is a nested character dictionary representing a trie without end markers. Return whether every character edge of text exists. Empty text returns True. Preserve root.',
    solution: `def has_character_path(root, text):
    node = root
    for letter in text:
        if letter not in node:
            return False
        node = node[letter]
    return True`,
    tests: `root = {"c": {"a": {"t": {}}}, "d": {}}
assert has_character_path(root, "") is True
assert has_character_path(root, "ca") is True
assert has_character_path(root, "cat") is True
assert has_character_path(root, "cats") is False
assert has_character_path(root, "C") is False
assert has_character_path({}, "x") is False
assert root == {"c": {"a": {"t": {}}}, "d": {}}`,
    call: 'print(has_character_path({"p": {"i": {"n": {}}}}, "pi"))\nprint(has_character_path({}, "pi"))',
    output: 'True\nFalse',
    questions: [
      [
        'How many edges does a length-4 path follow?',
        ['1', '4', 'Every trie edge'],
        1,
        'One character chooses one edge.',
        'Read the string one character at a time.',
      ],
      [
        'What happens when a requested character child is missing?',
        [
          'The root is reset.',
          'The next character is skipped.',
          'The path does not exist.',
        ],
        2,
        'The missing edge stops the requested path.',
        'No unrelated branch can replace that edge.',
      ],
      [
        'Does the empty path exist in an empty root?',
        ['Yes.', 'No.', 'Only if a letter is stored.'],
        0,
        'No edges are required to stay at the root.',
        'An empty path has zero steps.',
      ],
    ],
    cards: [
      [
        'How does a trie follow a string?',
        'Follow one character child at each step.',
      ],
      [
        'What does a missing character edge prove?',
        'The requested path is absent.',
      ],
    ],
  }),
  atom({
    id: 'cp-trie-word-end',
    unit: 'cp-structures',
    title: 'Distinguish a word from its prefix',
    parents: ['cp-trie-path'],
    summary: 'Mark a complete word separately from existing child paths.',
    lesson: [
      'If cat is inserted, the paths c and ca also exist. They are not automatically complete stored words. An end marker at the final node distinguishes a word from an unfinished prefix.',
      'Use a separate boolean field end and a children dictionary so marker metadata cannot collide with character keys. For the empty word, the end marker belongs to the root.',
    ],
    signature: 'def contains_word(root, word):',
    prompt:
      'Implement contains_word(root, word). Every node has fields end (boolean) and children (a character-to-node dictionary). Return True only if the word’s full path exists and its final end flag is True. Preserve root; words are case-sensitive.',
    solution: `def contains_word(root, word):
    node = root
    for letter in word:
        if letter not in node["children"]:
            return False
        node = node["children"][letter]
    return node["end"]`,
    tests: `root = {"end": False, "children": {"a": {"end": True, "children": {"b": {"end": True, "children": {}}}}}}
assert contains_word(root, "a") is True
assert contains_word(root, "ab") is True
assert contains_word(root, "abc") is False
assert contains_word(root, "") is False
assert contains_word(root, "A") is False
prefix = {"end": False, "children": {"a": {"end": False, "children": {"b": {"end": True, "children": {}}}}}}
assert contains_word(prefix, "a") is False
assert contains_word({"end": True, "children": {}}, "") is True`,
    call: 'print(contains_word({"end": False, "children": {"a": {"end": False, "children": {}}}}, "a"))',
    output: 'False',
    questions: [
      [
        'Inserting only "river" makes "riv" what?',
        [
          'A stored complete word automatically.',
          'A prefix path, not necessarily a stored word.',
          'A missing path.',
        ],
        1,
        'Its path exists but lacks a word-ending marker.',
        'Path existence and word membership differ.',
      ],
      [
        'Where is an empty word’s end marker stored?',
        ['On its first character.', 'Nowhere.', 'At the root.'],
        2,
        'An empty word ends before taking an edge.',
        'Its final node is the root.',
      ],
      [
        'Why separate children from the end field?',
        [
          'To keep node metadata distinct from character edges.',
          'To alphabetically sort every word.',
          'To forbid single-letter words.',
        ],
        0,
        'Separate fields avoid mixing a marker with valid characters.',
        'Metadata is not a character.',
      ],
    ],
    cards: [
      [
        'Why is a trie end marker necessary?',
        'An existing path may be only a prefix of a stored word.',
      ],
      ['Where does a trie mark the empty word?', 'At the root node.'],
    ],
  }),
  atom({
    id: 'cp-trie-prefix-count',
    unit: 'cp-structures',
    title: 'Read a prefix’s occurrence count',
    parents: ['cp-trie-word-end'],
    summary: 'Use the count at the reached node, including repeated words.',
    lesson: [
      'A trie node can store how many inserted word occurrences passed through it. That count is the number of words beginning with its path, including duplicates.',
      'A prefix query follows its path and reads that node’s count. A missing path returns zero; the root’s count answers the empty-prefix query.',
    ],
    signature: 'def stored_prefix_count(root, prefix):',
    prompt:
      'Implement stored_prefix_count(root, prefix). Nodes have count (nonnegative occurrence count) and children (character-to-node dictionary). Return the reached node’s count, or 0 if the path is missing. Empty prefix uses root.count. Preserve the supplied trie.',
    solution: `def stored_prefix_count(root, prefix):
    node = root
    for letter in prefix:
        if letter not in node["children"]:
            return 0
        node = node["children"][letter]
    return node["count"]`,
    tests: `root = {"count": 4, "children": {"a": {"count": 3, "children": {"b": {"count": 2, "children": {}}}}}}
assert stored_prefix_count(root, "") == 4
assert stored_prefix_count(root, "a") == 3
assert stored_prefix_count(root, "ab") == 2
assert stored_prefix_count(root, "abc") == 0
assert stored_prefix_count(root, "A") == 0
assert stored_prefix_count({"count": 0, "children": {}}, "") == 0`,
    call: 'print(stored_prefix_count({"count": 3, "children": {"g": {"count": 2, "children": {}}}}, "g"))',
    output: '2',
    questions: [
      [
        'If "go" is inserted twice and "gone" once, what is the count at prefix "go"?',
        ['1', '2', '3'],
        2,
        'All three occurrences follow that prefix.',
        'Count occurrences rather than distinct spellings.',
      ],
      [
        'Which node answers an empty-prefix query?',
        ['The root.', 'The longest word’s final node.', 'No node.'],
        0,
        'Every occurrence begins with the empty prefix.',
        'No character step is needed.',
      ],
      [
        'What does a missing prefix path return?',
        ['The root count.', '0.', 'The previous node count.'],
        1,
        'No inserted occurrence follows the missing edge.',
        'The full prefix must exist.',
      ],
    ],
    cards: [
      [
        'What does a trie prefix count include?',
        'Every inserted occurrence following that prefix, including duplicates.',
      ],
      ['Which count answers an empty prefix?', 'The root’s occurrence count.'],
    ],
  }),
  atom({
    id: 'cp-recursive-base',
    unit: 'cp-trees',
    title: 'Return at the base case',
    parents: ['return-values'],
    summary: 'Recognize a result that needs no smaller call.',
    lesson: [
      'A recursive definition needs a base case whose answer is already known. For a nonnegative integer exponent, base**0 is defined as 1, including the stated contest convention for 0**0.',
      'Test the base case before making another call. This tiny function returns 1 for exponent zero and None when another step is still required; it isolates termination from the later combination.',
    ],
    signature: 'def power_base_case(exponent):',
    prompt:
      'Implement power_base_case(exponent) for a nonnegative integer exponent. Return 1 when exponent is 0; otherwise return None. This function only recognizes the base case.',
    solution: `def power_base_case(exponent):
    if exponent == 0:
        return 1
    return None`,
    tests: `assert power_base_case(0) == 1
assert power_base_case(1) is None
assert power_base_case(2) is None
assert power_base_case(10**9) is None`,
    call: 'print(power_base_case(0))\nprint(power_base_case(5))',
    output: '1\nNone',
    questions: [
      [
        'What does a recursive base case do?',
        [
          'Calls itself forever.',
          'Returns without another recursive call.',
          'Sorts all inputs.',
        ],
        1,
        'The base case stops that call chain.',
        'Its result is already known.',
      ],
      [
        'Which exponent is the base case for a nonnegative power?',
        ['1 only', 'Every even exponent', '0'],
        2,
        'The zero exponent has answer 1.',
        'The recursive measure eventually reaches zero.',
      ],
      [
        'When should the base case be checked?',
        [
          'Before making the recursive call.',
          'After infinitely many calls.',
          'Only for negative input.',
        ],
        0,
        'Checking first prevents another call at the stopping point.',
        'Termination must happen before further work.',
      ],
    ],
    cards: [
      [
        'What distinguishes a recursive base case?',
        'It returns a known result without making another recursive call.',
      ],
      [
        'What is the zero-exponent result for binary power?',
        '1, including the stated 0**0 convention.',
      ],
    ],
  }),
  atom({
    id: 'cp-recursive-shrink',
    unit: 'cp-trees',
    title: 'Make the recursive measure smaller',
    parents: ['cp-recursive-base', 'cp-complexity'],
    summary: 'Halve a positive exponent until it reaches zero.',
    lesson: [
      'A recursive step must approach the base case. Integer halving changes every positive exponent e into e//2, which is strictly smaller and still nonnegative.',
      'Repeated halving reaches zero after logarithmically many steps. This function records the arguments that a single recursive chain would use, without yet calculating a power.',
    ],
    signature: 'def halving_arguments(exponent):',
    prompt:
      'Implement halving_arguments(exponent) for a nonnegative integer. Return a list starting at exponent, repeatedly replacing it by exponent//2, and ending with exactly one 0. For exponent=0 return [0].',
    solution: `def halving_arguments(exponent):
    arguments = [exponent]
    while exponent:
        exponent //= 2
        arguments.append(exponent)
    return arguments`,
    tests: `assert halving_arguments(0) == [0]
assert halving_arguments(1) == [1, 0]
assert halving_arguments(9) == [9, 4, 2, 1, 0]
assert halving_arguments(8) == [8, 4, 2, 1, 0]
assert len(halving_arguments(10**9)) <= 31
assert halving_arguments(10**9)[-1] == 0`,
    call: 'print(halving_arguments(13))',
    output: '[13, 6, 3, 1, 0]',
    questions: [
      [
        'For exponent 7, what is the smaller argument after integer halving?',
        ['14', '7', '3'],
        2,
        '7//2 equals 3.',
        'Use integer division.',
      ],
      [
        'Why does halving a positive integer make progress?',
        [
          'The new nonnegative integer is strictly smaller.',
          'It always becomes negative.',
          'It preserves the argument.',
        ],
        0,
        'For e>0, e//2 is below e and can reach zero.',
        'Check a decreasing measure.',
      ],
      [
        'How many halving steps are needed as e grows?',
        ['O(e squared)', 'O(log e)', 'O(e) always'],
        1,
        'Each step removes about one binary digit.',
        'The measure shrinks by a factor.',
      ],
    ],
    cards: [
      [
        'What makes integer halving a terminating recursive step?',
        'For every positive e, e//2 is a smaller nonnegative integer.',
      ],
      [
        'What is the depth of a repeated-halving chain?',
        'O(log e) for positive e.',
      ],
    ],
  }),
  atom({
    id: 'cp-recursive-combine',
    unit: 'cp-trees',
    title: 'Combine one computed half-power',
    parents: ['parameters'],
    summary: 'Square the returned half-power and supply an odd factor.',
    lesson: [
      'If half is base**(exponent//2), then half*half supplies the even part of the power. An odd exponent requires one extra multiplication by base.',
      'Reuse the half-result twice instead of making the same smaller call twice. This exercise receives the already computed half so that it assesses only the combination rule.',
    ],
    signature: 'def combine_power(base, exponent, half):',
    prompt:
      'Implement combine_power(base, exponent, half). exponent is a positive integer and half is already base**(exponent//2). Return half squared, multiplied by base once more when exponent is odd. Do not recompute the smaller power.',
    solution: `def combine_power(base, exponent, half):
    result = half * half
    if exponent % 2:
        result *= base
    return result`,
    tests: `assert combine_power(3, 4, 9) == 81
assert combine_power(3, 5, 9) == 243
assert combine_power(-2, 3, -2) == -8
assert combine_power(0, 1, 1) == 0
assert combine_power(7, 1, 1) == 7
assert combine_power(-2, 6, -8) == 64`,
    call: 'print(combine_power(2, 5, 4))\nprint(combine_power(2, 4, 4))',
    output: '32\n16',
    questions: [
      [
        'How is an even exponent’s result combined from half?',
        ['half + half', 'half * half', 'half * exponent'],
        1,
        'Squaring doubles the exponent represented by half.',
        'Multiply two equal half-powers.',
      ],
      [
        'What extra factor is needed for an odd exponent?',
        ['exponent', 'half again', 'base'],
        2,
        'The floor-halved exponent leaves one base factor unpaired.',
        'One exponent unit remains.',
      ],
      [
        'Why save one smaller recursive result?',
        [
          'It can be reused without calculating the same subproblem twice.',
          'It removes every base case.',
          'It forces a positive base.',
        ],
        0,
        'Reuse avoids duplicate calls.',
        'A returned value can be multiplied by itself.',
      ],
    ],
    cards: [
      [
        'How is an even power combined from a half-power?',
        'Square the one computed half-power.',
      ],
      [
        'What does an odd exponent add to exponentiation by squaring?',
        'One extra multiplication by the original base.',
      ],
    ],
  }),
  atom({
    id: 'cp-choice-undo',
    unit: 'cp-trees',
    title: 'Undo a branch’s local choice',
    parents: ['parameters'],
    summary: 'Restore the parent path before trying a sibling.',
    lesson: [
      'Backtracking temporarily appends a choice to a working path. After exploring that branch, pop the appended choice so the next branch starts at the same parent state.',
      'A sibling must not inherit the preceding sibling’s temporary choice. This one-level trace practices append, observe, pop before introducing a whole recursive search.',
    ],
    signature: 'def sibling_paths(parent, choices):',
    prompt:
      'Implement sibling_paths(parent, choices). For each choice in order, append it temporarily to a working copy of parent, save that resulting path, and undo the append. Return the saved sibling paths. Preserve both inputs and keep duplicate choices.',
    solution: `def sibling_paths(parent, choices):
    working = parent.copy()
    result = []
    for value in choices:
        working.append(value)
        result.append(working.copy())
        working.pop()
    return result`,
    tests: `assert sibling_paths([], []) == []
assert sibling_paths([1], [2, 3]) == [[1, 2], [1, 3]]
assert sibling_paths([], [4, 4]) == [[4], [4]]
parent = [0]
choices = [1, 2]
assert sibling_paths(parent, choices) == [[0, 1], [0, 2]]
assert parent == [0] and choices == [1, 2]`,
    call: 'print(sibling_paths(["root"], ["left", "right"]))',
    output: "[['root', 'left'], ['root', 'right']]",
    questions: [
      [
        'Why undo an appended branch choice?',
        [
          'To restore the parent before the next sibling.',
          'To erase every result.',
          'To sort the choices.',
        ],
        0,
        'Sibling branches must begin from the same parent state.',
        'Temporary changes belong to one branch.',
      ],
      [
        'Parent=[0]; choices=1 then 2. What should the second branch contain?',
        ['[0, 1, 2]', '[0, 2]', '[2]'],
        1,
        'Undo 1 before trying 2.',
        'Preserve the parent only.',
      ],
      [
        'Which operation reverses a just-completed append at the right end?',
        ['sort()', 'clear()', 'pop()'],
        2,
        'pop removes exactly the temporary final choice.',
        'Undo one local change.',
      ],
    ],
    cards: [
      [
        'What is the choose-explore-undo invariant?',
        'After undo, the working path equals the original parent path.',
      ],
      [
        'Why must a sibling not inherit a previous sibling’s choice?',
        'Each branch represents a different decision from the same parent.',
      ],
    ],
  }),
  atom({
    id: 'cp-path-snapshot',
    unit: 'cp-trees',
    title: 'Save an independent path snapshot',
    parents: ['parameters'],
    summary: 'Copy the working list before later branches mutate it.',
    lesson: [
      'Saving a reference to a mutable path does not preserve its current contents. Later appends and pops change the same list observed by every alias.',
      'path.copy() creates a separate list for a completed result. With integer entries, a shallow copy is sufficient: the entries themselves are immutable.',
    ],
    signature: 'def save_path(paths, current):',
    prompt:
      'Implement save_path(paths, current). paths is a list of lists of integers. Return a new outer list with a copy of current appended. Preserve paths and current. The newly saved path must not change if current is later mutated; existing paths need not be deep-copied.',
    solution: `def save_path(paths, current):
    result = paths.copy()
    result.append(current.copy())
    return result`,
    tests: `assert save_path([], []) == [[]]
current = [1, 2]
paths = [[9]]
saved = save_path(paths, current)
current.append(3)
assert saved == [[9], [1, 2]]
assert paths == [[9]]
assert saved is not paths
saved[-1].append(4)
assert current == [1, 2, 3]`,
    call: 'path = [2, 5]\nsaved = save_path([], path)\npath.pop()\nprint(saved)\nprint(path)',
    output: '[[2, 5]]\n[2]',
    questions: [
      [
        'What does storing path itself retain?',
        [
          'A frozen snapshot.',
          'A reference to the same mutable list.',
          'Only its length.',
        ],
        1,
        'Later mutations are visible through that alias.',
        'Assignment does not copy a list.',
      ],
      [
        'How should a completed integer path be saved?',
        [
          'Clear it first.',
          'Save only its final entry.',
          'Append path.copy().',
        ],
        2,
        'The separate list preserves the completed contents.',
        'The result must outlive working-state changes.',
      ],
      [
        'Why is a shallow copy enough for integer path entries?',
        [
          'Integers are immutable.',
          'Every list is immutable.',
          'It automatically copies every nested object.',
        ],
        0,
        'Only the working container needs a separate identity.',
        'The contract excludes nested mutable entries.',
      ],
    ],
    cards: [
      [
        'How can a completed backtracking path survive later mutations?',
        'Store path.copy() as a separate result list.',
      ],
      [
        'What goes wrong when several results alias the working path?',
        'They all reflect later changes to that same list.',
      ],
    ],
  }),
  atom({
    id: 'cp-remaining-capacity',
    unit: 'cp-trees',
    title: 'Prune when too few choices remain',
    parents: ['parameters'],
    summary: 'Compare needed entries with available distinct indices.',
    lesson: [
      'Suppose a selection needs k entries and already contains chosen entries. It needs k-chosen more; with indices start through n-1, only n-start choices remain.',
      'The branch is feasible exactly when the number still needed is at most the number available. Equality is feasible: every remaining index must then be selected.',
    ],
    signature: 'def can_complete(n, start, chosen, k):',
    prompt:
      'Implement can_complete(n, start, chosen, k). Inputs satisfy 0<=start<=n and 0<=chosen<=k<=n. Return whether a partial selection of chosen entries can reach length k using distinct indices start through n-1.',
    solution: `def can_complete(n, start, chosen, k):
    return k - chosen <= n - start`,
    tests: `assert can_complete(5, 3, 1, 4) is False
assert can_complete(5, 3, 2, 4) is True
assert can_complete(5, 5, 4, 4) is True
assert can_complete(0, 0, 0, 0) is True
assert can_complete(4, 4, 0, 1) is False
assert can_complete(7, 2, 0, 5) is True`,
    call: 'print(can_complete(6, 4, 1, 4))\nprint(can_complete(6, 4, 2, 4))',
    output: 'False\nTrue',
    questions: [
      [
        'Need 3 more entries, but only 2 indices remain. What should happen?',
        [
          'Prune the branch.',
          'Repeat the last index.',
          'Record an incomplete selection.',
        ],
        0,
        'Distinct remaining indices cannot supply all three entries.',
        'Check feasibility before exploring.',
      ],
      [
        'How many indices remain from start through n-1?',
        ['n+start', 'n-start', 'start'],
        1,
        'That half-open range has length n-start.',
        'Count the unprocessed suffix.',
      ],
      [
        'Is a branch feasible when needed equals remaining?',
        ['Never.', 'Only for k=0.', 'Yes; choose every remaining index.'],
        2,
        'Equality supplies exactly enough choices.',
        'Insufficient means strictly fewer.',
      ],
    ],
    cards: [
      [
        'When can a distinct-index combination branch be pruned?',
        'When k - chosen > n - start.',
      ],
      [
        'Does exact remaining capacity permit completion?',
        'Yes. Every remaining index must be selected.',
      ],
    ],
  }),
  atom({
    id: 'cp-bst-bounds',
    unit: 'cp-trees',
    title: 'Respect an inherited search-tree bound',
    parents: ['parameters', 'boolean-logic'],
    summary: 'Apply strict lower and upper bounds to every descendant key.',
    lesson: [
      'A strict binary search tree requires every left descendant to be smaller and every right descendant to be larger. Descendants inherit all ancestor bounds, not just their immediate parent’s comparison.',
      'Represent missing lower or upper bounds by None. A candidate key must be strictly inside every supplied bound; equality violates a tree of distinct keys.',
    ],
    signature: 'def key_inside_bounds(key, lower, upper):',
    prompt:
      'Implement key_inside_bounds(key, lower, upper). key is an integer; each bound is an integer or None for an absent bound. Return whether lower < key < upper for all bounds that exist. Bound equality is invalid.',
    solution: `def key_inside_bounds(key, lower, upper):
    if lower is not None and key <= lower:
        return False
    if upper is not None and key >= upper:
        return False
    return True`,
    tests: `assert key_inside_bounds(5, None, None) is True
assert key_inside_bounds(5, 2, 8) is True
assert key_inside_bounds(8, 2, 8) is False
assert key_inside_bounds(2, 2, 8) is False
assert key_inside_bounds(11, None, 9) is False
assert key_inside_bounds(-3, -8, None) is True
assert key_inside_bounds(0, 0, None) is False`,
    call: 'print(key_inside_bounds(11, 4, 9))\nprint(key_inside_bounds(6, 4, 9))',
    output: 'False\nTrue',
    questions: [
      [
        'A node lies in the left subtree of key 9. Can a deeper descendant have key 11?',
        [
          'Yes, if its parent is below 9.',
          'No; the inherited upper bound is 9.',
          'Only at even depth.',
        ],
        1,
        'The ancestor’s ordering constraint applies to the entire subtree.',
        'Keep every ancestor bound.',
      ],
      [
        'In a strict BST, can a key equal its lower bound?',
        ['Always.', 'Only at a leaf.', 'No.'],
        2,
        'The bound is strict because stored keys are distinct.',
        'Use > rather than >=.',
      ],
      [
        'What does an absent bound mean?',
        [
          'That side places no constraint on the key.',
          'The key must be zero.',
          'The node must be absent.',
        ],
        0,
        'None represents no lower or upper restriction.',
        'Missing bound differs from missing node.',
      ],
    ],
    cards: [
      [
        'Do BST bounds apply only to direct children?',
        'No. Every descendant inherits the ancestor’s strict bounds.',
      ],
      [
        'May a strict BST key equal an inherited bound?',
        'No. It must lie strictly inside every existing bound.',
      ],
    ],
  }),
  atom({
    id: 'cp-bst-branch',
    unit: 'cp-trees',
    title: 'Choose the only possible search branch',
    parents: ['cp-bst-bounds'],
    summary: 'Use one comparison to discard a whole subtree.',
    lesson: [
      'At a BST node, equality finds the target. A smaller target can occur only in the left subtree; a larger target can occur only in the right subtree.',
      'This decision relies on the subtree ordering already learned. It is independent of tree balance: even a tall chain permits the same correct branch decision.',
    ],
    signature: 'def search_branch(key, target):',
    prompt:
      'Implement search_branch(key, target) for integer keys. Return "found" for equality, "left" when target < key, and "right" when target > key.',
    solution: `def search_branch(key, target):
    if target == key:
        return "found"
    if target < key:
        return "left"
    return "right"`,
    tests: `assert search_branch(8, 8) == "found"
assert search_branch(8, 3) == "left"
assert search_branch(8, 12) == "right"
assert search_branch(-3, -8) == "left"
assert search_branch(0, 1) == "right"`,
    call: 'print(search_branch(9, 6))\nprint(search_branch(9, 9))',
    output: 'left\nfound',
    questions: [
      [
        'At key 10, where could target 4 occur?',
        [
          'Only in the left subtree.',
          'Only in the right subtree.',
          'Only at the current node.',
        ],
        0,
        'Every right-descendant key is greater than 10.',
        'Compare target to the node key.',
      ],
      [
        'What should equality return?',
        ['left', 'found', 'right'],
        1,
        'The current key is already the target.',
        'Do not discard an exact match.',
      ],
      [
        'Does a correct branch decision prove that the tree is balanced?',
        ['Yes.', 'Only for positive keys.', 'No.'],
        2,
        'Ordering and balance are different properties.',
        'A chain can still obey BST ordering.',
      ],
    ],
    cards: [
      [
        'Which BST branch can contain a target below the current key?',
        'Only the left subtree.',
      ],
      [
        'What should BST search do on an exact key match?',
        'Stop with the found result.',
      ],
    ],
  }),
  atom({
    id: 'cp-bst-candidate',
    unit: 'cp-trees',
    title: 'Keep a valid floor candidate',
    parents: ['cp-enumerate-best', 'parameters'],
    summary: 'Replace the saved candidate only with a larger qualifying key.',
    lesson: [
      'A floor query asks for the largest stored key no greater than a limit. The saved candidate is either None or the largest qualifying key encountered so far.',
      'A too-large key cannot improve that candidate. A qualifying key replaces the candidate only when it is larger; None is absence, not a numeric zero.',
    ],
    signature: 'def improve_floor(best, key, limit):',
    prompt:
      'Implement improve_floor(best, key, limit). best is None or a valid integer candidate <= limit. Return the larger qualifying candidate after inspecting integer key. Keep best when key > limit or key is no larger than best.',
    solution: `def improve_floor(best, key, limit):
    if key <= limit and (best is None or key > best):
        return key
    return best`,
    tests: `assert improve_floor(None, 4, 6) == 4
assert improve_floor(None, 8, 6) is None
assert improve_floor(4, 5, 6) == 5
assert improve_floor(4, 3, 6) == 4
assert improve_floor(4, 6, 6) == 6
assert improve_floor(-5, -2, 0) == -2
assert improve_floor(None, 0, 0) == 0`,
    call: 'print(improve_floor(4, 7, 10))\nprint(improve_floor(7, 13, 10))',
    output: '7\n7',
    questions: [
      [
        'Best=4, limit=10, new key=7. What is the new best?',
        ['4', '7', '10'],
        1,
        '7 qualifies and is better than 4.',
        'Keep the largest qualifying key.',
      ],
      [
        'Best=7, limit=10, new key=13. What happens?',
        ['Use 13.', 'Erase best.', 'Keep 7.'],
        2,
        '13 exceeds the limit, so it cannot qualify.',
        'A candidate must remain valid.',
      ],
      [
        'Why use None when no floor key has been found?',
        [
          'Zero may itself be a valid stored key.',
          'Every tree excludes zero.',
          'None is larger than all integers.',
        ],
        0,
        'A numeric sentinel could be confused with real data.',
        'Absence is distinct from a key value.',
      ],
    ],
    cards: [
      [
        'What invariant does a floor candidate maintain?',
        'The largest encountered key that is no greater than the limit.',
      ],
      [
        'Does a key above the limit improve a floor candidate?',
        'No. It is ineligible regardless of its size.',
      ],
    ],
  }),
  atom({
    id: 'cp-tree-children',
    unit: 'cp-trees',
    title: 'Identify a node’s existing children',
    parents: ['comprehensions', 'return-values'],
    summary: 'Separate an absent child from a real subtree.',
    lesson: [
      'A binary node is represented here as (key, left, right), and an absent node is None. A real child can itself have a zero or negative key; only None denotes absence.',
      'Return existing children in left-to-right order. This is a small structural step used before deciding the traversal’s scheduling order.',
    ],
    signature: 'def existing_children(node):',
    prompt:
      'Implement existing_children(node). node is None or a (key, left, right) tuple. Return its non-None child subtrees in left-to-right order. An absent node returns []. Do not traverse descendants or change the input.',
    solution: `def existing_children(node):
    if node is None:
        return []
    key, left, right = node
    return [child for child in (left, right) if child is not None]`,
    tests: `assert existing_children(None) == []
assert existing_children((4, None, None)) == []
left = (0, None, None)
right = (-1, None, None)
assert existing_children((8, left, right)) == [left, right]
assert existing_children((8, None, right)) == [right]
assert existing_children((8, left, None)) == [left]`,
    call: 'print(existing_children((7, (0, None, None), None)))',
    output: '[(0, None, None)]',
    questions: [
      [
        'What denotes an absent child in this tuple contract?',
        ['A key of 0.', 'An empty string.', 'None.'],
        2,
        'None alone denotes absence.',
        'A zero-valued node is still a real node.',
      ],
      [
        'Which order should existing_children preserve?',
        [
          'Left child before right child.',
          'Larger key first.',
          'Random order.',
        ],
        0,
        'The structural contract is left-to-right.',
        'Keys do not determine traversal order.',
      ],
      [
        'Does reading a node’s children require visiting their descendants?',
        ['Always.', 'No.', 'Only for zero keys.'],
        1,
        'The tuple already supplies its immediate children.',
        'Keep this step local.',
      ],
    ],
    cards: [
      [
        'What represents an absent tuple-tree node?',
        'None; a node with key zero is still present.',
      ],
      [
        'What are a tuple-tree node’s immediate children?',
        'The left and right subtree fields, excluding None.',
      ],
    ],
  }),
  atom({
    id: 'cp-preorder-frontier',
    unit: 'cp-trees',
    title: 'Schedule left before right with a stack',
    parents: ['cp-tree-children', 'cp-stack-pop'],
    summary: 'Push children in reverse visit order.',
    lesson: [
      'A stack processes the last pushed child first. To visit left before right, push the right child before the left child.',
      'The returned stack below is bottom-to-top. Existing pending work stays below the new children; absent children are not added.',
    ],
    signature: 'def schedule_children(pending, left, right):',
    prompt:
      'Implement schedule_children(pending, left, right). pending is a stack of labels from bottom to top; left and right are labels or None for absence. Return a copied stack with present right then present left pushed. Preserve pending.',
    solution: `def schedule_children(pending, left, right):
    result = pending.copy()
    if right is not None:
        result.append(right)
    if left is not None:
        result.append(left)
    return result`,
    tests: `assert schedule_children([], "L", "R") == ["R", "L"]
assert schedule_children(["old"], None, "R") == ["old", "R"]
assert schedule_children([], 0, None) == [0]
assert schedule_children([], None, None) == []
source = [2]
assert schedule_children(source, 3, 4) == [2, 4, 3]
assert source == [2]`,
    call: 'pending = schedule_children([], "left", "right")\nprint(pending.pop())\nprint(pending.pop())',
    output: 'left\nright',
    questions: [
      [
        'Which child is pushed first to process left first?',
        ['Left.', 'Right.', 'Neither.'],
        1,
        'The later left push sits on top.',
        'A stack reverses insertion order.',
      ],
      [
        'With stack ["old", "R", "L"], what is processed next?',
        ['old', 'R', 'L'],
        2,
        'The top is the final entry L.',
        'Pop the right end.',
      ],
      [
        'Should an absent child be pushed?',
        ['No.', 'Yes, as a real node.', 'Only when both are absent.'],
        0,
        'None has no subtree to process.',
        'Schedule only existing work.',
      ],
    ],
    cards: [
      [
        'How does a stack schedule left before right?',
        'Push the right child first, then the left child.',
      ],
      [
        'Why reverse desired order when pushing onto a traversal stack?',
        'The last pushed item is processed first.',
      ],
    ],
  }),
  atom({
    id: 'cp-postorder-combine',
    unit: 'cp-trees',
    title: 'Combine already computed child heights',
    parents: ['parameters'],
    summary: 'Calculate the parent only after its children have answers.',
    lesson: [
      'Postorder processes children before combining a parent’s answer. With an absent child height of 0, a real node’s height is 1 plus the larger child height.',
      'The combination requires both child results. A leaf therefore has height 1; using the sum would measure a different quantity rather than the longest root-to-leaf path.',
    ],
    signature: 'def combine_height(left_height, right_height):',
    prompt:
      'Implement combine_height(left_height, right_height) for already computed nonnegative child heights. Return the real parent node’s height in nodes. An absent child has height 0, so a leaf receives (0, 0).',
    solution: `def combine_height(left_height, right_height):
    return 1 + max(left_height, right_height)`,
    tests: `assert combine_height(0, 0) == 1
assert combine_height(3, 0) == 4
assert combine_height(0, 5) == 6
assert combine_height(2, 2) == 3
assert combine_height(4, 7) == 8`,
    call: 'print(combine_height(2, 4))\nprint(combine_height(0, 0))',
    output: '5\n1',
    questions: [
      [
        'When can a parent’s height be combined?',
        [
          'Before either child is known.',
          'Only at the root.',
          'After both child heights are known.',
        ],
        2,
        'The recurrence requires both child results.',
        'Children supply the subproblem answers.',
      ],
      [
        'For child heights 2 and 5, what is the parent height?',
        ['6', '8', '5'],
        0,
        '1+max(2,5) equals 6.',
        'Height follows the longer branch.',
      ],
      [
        'What is a leaf’s height in nodes?',
        ['0', '1', '2'],
        1,
        'Both absent children have height zero; the leaf contributes one.',
        'The current node counts.',
      ],
    ],
    cards: [
      [
        'What order supports combining subtree results?',
        'Postorder: compute children before their parent.',
      ],
      [
        'What is a real node’s height from its child heights?',
        '1 + max(left_height, right_height), with absence height 0.',
      ],
    ],
  }),
  atom({
    id: 'cp-vertex-lists',
    unit: 'cp-graphs',
    title: 'Allocate a neighbor list for every vertex',
    parents: ['comprehensions', 'ranges', 'return-values', 'list-mutation'],
    summary: 'Keep isolated vertices and avoid shared inner lists.',
    lesson: [
      'An adjacency list on n vertices needs n neighbor lists even when no edges exist. A vertex with no neighbors is still represented by an empty list at its own index.',
      'Create a fresh inner list for each vertex. Repeating one inner list with [[]]*n aliases the same object, so changing one vertex would incorrectly change others.',
    ],
    signature: 'def empty_graph(n):',
    prompt:
      'Implement empty_graph(n) for integer n>=0. Return n independent empty neighbor lists for vertices 0 through n-1. Changing one returned list must not change another.',
    solution: `def empty_graph(n):
    return [[] for _ in range(n)]`,
    tests: `assert empty_graph(0) == []
assert empty_graph(1) == [[]]
graph = empty_graph(4)
assert graph == [[], [], [], []]
graph[0].append(2)
assert graph == [[2], [], [], []]
graph[3].append(1)
assert graph[1:3] == [[], []]`,
    call: 'graph = empty_graph(3)\ngraph[0].append(2)\nprint(graph)',
    output: '[[2], [], []]',
    questions: [
      [
        'How many lists represent a graph with 5 vertices and no edges?',
        ['0', '1', '5'],
        2,
        'Each vertex needs its own empty neighbor list.',
        'Isolated vertices still exist.',
      ],
      [
        'Which construction gives independent inner lists?',
        [
          '[[] for _ in range(n)]',
          '[[]] * n',
          'One list shared by every vertex',
        ],
        0,
        'The comprehension creates a new list per iteration.',
        'Avoid repeated references to one mutable object.',
      ],
      [
        'What goes wrong with [[]]*3?',
        [
          'It omits vertex 0.',
          'All three entries alias the same list.',
          'It creates a sorted graph.',
        ],
        1,
        'Mutation through one entry appears through every alias.',
        'Repetition copies references.',
      ],
    ],
    cards: [
      [
        'How is an isolated adjacency-list vertex represented?',
        'By its own empty neighbor list.',
      ],
      [
        'Why avoid [[]]*n for neighbor lists?',
        'It repeats references to one shared mutable list.',
      ],
    ],
  }),
  atom({
    id: 'cp-directed-edge',
    unit: 'cp-graphs',
    title: 'Insert a directed edge in one direction',
    parents: ['cp-vertex-lists', 'parameters'],
    summary: 'Record u to v without inventing a reverse route.',
    lesson: [
      'A directed edge u→v adds v to u’s outgoing neighbor list. It does not add u to v’s list; reachability follows the stated edge direction.',
      'Copy each inner list when returning a changed graph. Keep parallel edges and self-loops if the graph’s contract retains them.',
    ],
    signature: 'def add_directed(graph, u, v):',
    prompt:
      'Implement add_directed(graph, u, v). graph is an adjacency list and u,v are valid vertex indices. Return a graph copy with one v appended to vertex u only. Preserve all existing neighbor order, duplicates, self-loops, and the original graph.',
    solution: `def add_directed(graph, u, v):
    result = [neighbors.copy() for neighbors in graph]
    result[u].append(v)
    return result`,
    tests: `assert add_directed([[], []], 0, 1) == [[1], []]
assert add_directed([[1], []], 0, 1) == [[1, 1], []]
assert add_directed([[]], 0, 0) == [[0]]
source = [[1], [], []]
result = add_directed(source, 1, 2)
assert result == [[1], [2], []]
assert source == [[1], [], []]
result[0].append(2)
assert source == [[1], [], []]`,
    call: 'print(add_directed([[], [], []], 2, 0))',
    output: '[[], [], [0]]',
    questions: [
      [
        'For u→v, which list receives a new neighbor?',
        ['Only v’s list.', 'Only u’s list.', 'Every vertex list.'],
        1,
        'v is an outgoing neighbor of u.',
        'Read the arrow’s direction.',
      ],
      [
        'Does a directed 0→1 imply 1→0?',
        ['Always.', 'Only when there are two vertices.', 'No.'],
        2,
        'The reverse route requires another explicit edge.',
        'Direction belongs to the contract.',
      ],
      [
        'Why copy inner neighbor lists before appending?',
        [
          'To preserve the original graph.',
          'To remove all loops.',
          'To sort vertex labels.',
        ],
        0,
        'A copied outer list alone would still alias the original inner lists.',
        'The mutation occurs inside one list.',
      ],
    ],
    cards: [
      [
        'How is a directed u→v adjacency entry stored?',
        'Append v to u’s outgoing neighbor list only.',
      ],
      [
        'Does a directed edge grant reverse reachability?',
        'No. A reverse edge must be supplied separately.',
      ],
    ],
  }),
  atom({
    id: 'cp-undirected-edge',
    unit: 'cp-graphs',
    title: 'Insert both incidences of an undirected edge',
    parents: ['cp-directed-edge'],
    summary: 'Store symmetric entries while retaining multiplicity.',
    lesson: [
      'An undirected edge {u,v} can be traversed from either endpoint. Append v to u’s neighbor list and u to v’s list.',
      'Under this incidence-list contract a self-loop contributes two entries to the same list. A repeated edge contributes another pair; it is not silently deduplicated.',
    ],
    signature: 'def add_undirected(graph, u, v):',
    prompt:
      'Implement add_undirected(graph, u, v). Return a copied adjacency list with v appended to u and u appended to v. Preserve the input and existing order. Retain repeated edges; when u==v, append the vertex twice.',
    solution: `def add_undirected(graph, u, v):
    result = [neighbors.copy() for neighbors in graph]
    result[u].append(v)
    result[v].append(u)
    return result`,
    tests: `assert add_undirected([[], []], 0, 1) == [[1], [0]]
assert add_undirected([[1], [0]], 0, 1) == [[1, 1], [0, 0]]
assert add_undirected([[]], 0, 0) == [[0, 0]]
source = [[], [], []]
result = add_undirected(source, 0, 2)
assert result == [[2], [], [0]]
assert source == [[], [], []]
result[1].append(0)
assert source[1] == []`,
    call: 'print(add_undirected([[], [], []], 0, 2))\nprint(add_undirected([[]], 0, 0))',
    output: '[[2], [], [0]]\n[[0, 0]]',
    questions: [
      [
        'How many adjacency incidences does one undirected edge add?',
        ['One.', 'Two.', 'n.'],
        1,
        'Each endpoint stores the other as a neighbor.',
        'Record both traversal directions.',
      ],
      [
        'Under this contract, how is a self-loop stored?',
        [
          'It is discarded.',
          'Only one incidence.',
          'Two incidences in the same list.',
        ],
        2,
        'Both endpoint insertions address the same vertex.',
        'Follow both appends even when u equals v.',
      ],
      [
        'What happens when the same undirected edge is inserted twice?',
        [
          'Both occurrences are retained.',
          'The earlier edge disappears.',
          'The graph becomes directed.',
        ],
        0,
        'Parallel-edge multiplicity is part of the contract.',
        'Do not silently convert to a set.',
      ],
    ],
    cards: [
      [
        'How is an undirected adjacency edge recorded?',
        'Append each endpoint to the other’s neighbor list.',
      ],
      [
        'What does an undirected self-loop add under the incidence contract?',
        'Two entries to its own neighbor list.',
      ],
    ],
  }),
  atom({
    id: 'cp-discover-once',
    unit: 'cp-graphs',
    title: 'Mark a vertex when scheduling it',
    parents: ['cp-hash-membership', 'cp-stack-push'],
    summary: 'Schedule a newly discovered vertex only once.',
    lesson: [
      'A discovered set records work already scheduled, not just work already finished. Mark a vertex when pushing it so another edge cannot schedule a duplicate before the first copy is processed.',
      'This function practices one discovery operation. It returns independent copies of seen and pending, then adds the vertex only when it was previously unseen.',
    ],
    signature: 'def discover_vertex(seen, pending, vertex):',
    prompt:
      'Implement discover_vertex(seen, pending, vertex). seen is a set of discovered integer vertices and pending is a stack. Return (new_seen, new_pending), adding vertex to both only if it is absent from seen. Preserve both inputs.',
    solution: `def discover_vertex(seen, pending, vertex):
    new_seen = seen.copy()
    new_pending = pending.copy()
    if vertex not in new_seen:
        new_seen.add(vertex)
        new_pending.append(vertex)
    return new_seen, new_pending`,
    tests: `assert discover_vertex(set(), [], 2) == ({2}, [2])
assert discover_vertex({2}, [2], 2) == ({2}, [2])
assert discover_vertex({0}, [], 0) == ({0}, [])
seen = {0}
pending = [0]
assert discover_vertex(seen, pending, 1) == ({0, 1}, [0, 1])
assert seen == {0} and pending == [0]`,
    call: 'seen, pending = discover_vertex({0}, [0], 1)\nseen, pending = discover_vertex(seen, pending, 1)\nprint(sorted(seen))\nprint(pending)',
    output: '[0, 1]\n[0, 1]',
    questions: [
      [
        'When should this reachability search mark a neighbor?',
        [
          'When it is scheduled.',
          'Only after the full graph finishes.',
          'Only if it has no neighbors.',
        ],
        0,
        'Marking on scheduling prevents duplicate pending work.',
        'Several edges may reach the same vertex.',
      ],
      [
        'If vertex 4 is already seen, what does discovery do?',
        ['Pushes it again.', 'Adds no new work.', 'Clears the stack.'],
        1,
        'Already discovered vertices need no duplicate entry.',
        'Seen includes pending vertices.',
      ],
      [
        'Why can marking only at pop time create duplicate stack entries?',
        [
          'The graph must be empty.',
          'Every vertex is removed.',
          'Several edges can schedule it before its first pop.',
        ],
        2,
        'Until that first pop it appears unseen to other discoverers.',
        'Pending work must also be marked.',
      ],
    ],
    cards: [
      [
        'When is a vertex marked in a discover-once traversal?',
        'When it is first scheduled or pushed.',
      ],
      [
        'What does the discovered set include?',
        'Both processed vertices and vertices already pending.',
      ],
    ],
  }),
  atom({
    id: 'cp-dfs-frontier',
    unit: 'cp-graphs',
    title: 'Take the newest depth-first work',
    parents: ['cp-stack-pop'],
    summary: 'Use a last-in, first-out frontier for depth-first exploration.',
    lesson: [
      'Depth-first work uses a stack: the newest scheduled vertex is selected next. This tends to continue the latest branch before older pending branches.',
      'The frontier is not a distance ranking. A stack’s next vertex comes from scheduling order, so DFS cannot infer a fewest-edge path from first discovery.',
    ],
    signature: 'def take_depth_first(pending):',
    prompt:
      'Implement take_depth_first(pending). Return (next_vertex, remaining_stack) after removing the newest entry from a copy. For an empty stack return (None, []). Vertex labels are integers, including 0. Preserve pending.',
    solution: `def take_depth_first(pending):
    remaining = pending.copy()
    if not remaining:
        return None, remaining
    return remaining.pop(), remaining`,
    tests: `assert take_depth_first([]) == (None, [])
assert take_depth_first([0]) == (0, [])
assert take_depth_first([1, 4, 2]) == (2, [1, 4])
source = [5, 7]
assert take_depth_first(source) == (7, [5])
assert source == [5, 7]`,
    call: 'print(take_depth_first([0, 3, 1]))',
    output: '(1, [0, 3])',
    questions: [
      [
        'Which pending vertex does a DFS stack select?',
        [
          'The smallest label.',
          'The newest scheduled vertex.',
          'The oldest scheduled vertex.',
        ],
        1,
        'The rightmost stack entry is popped next.',
        'DFS uses last in, first out.',
      ],
      [
        'Pending=[0, 4, 2]. Which entry is next?',
        ['0', '4', '2'],
        2,
        '2 is the top stack entry.',
        'Use the final position.',
      ],
      [
        'Does a DFS frontier guarantee shortest unweighted distances?',
        ['No.', 'Always.', 'Only when labels are sorted.'],
        0,
        'Its ordering follows branch scheduling rather than distance layers.',
        'Reachability and shortest distance differ.',
      ],
    ],
    cards: [
      [
        'What frontier order does depth-first search use?',
        'Last in, first out: process the newest pending vertex.',
      ],
      [
        'Does first discovery in DFS imply minimum edge distance?',
        'No. DFS explores branches rather than distance layers.',
      ],
    ],
  }),
  atom({
    id: 'cp-dfs-cycle-guard',
    unit: 'cp-graphs',
    title: 'Ignore edges to discovered vertices',
    parents: ['cp-discover-once'],
    summary: 'Expand a vertex without repeating cycles or parallel edges.',
    lesson: [
      'When scanning a vertex’s outgoing neighbors, ignore neighbors already discovered. A self-loop, back edge, or repeated edge may be scanned, but creates no extra pending copy.',
      'Mark each newly scheduled neighbor immediately. In this local expansion, even duplicate neighbor entries contribute only one new vertex.',
    ],
    signature: 'def unseen_neighbors(neighbors, seen):',
    prompt:
      'Implement unseen_neighbors(neighbors, seen). Return the distinct previously unseen neighbor vertices in first-occurrence order. Ignore vertices in seen and repeated neighbor entries. Preserve both inputs; this returns new work for one expansion.',
    solution: `def unseen_neighbors(neighbors, seen):
    discovered = seen.copy()
    result = []
    for vertex in neighbors:
        if vertex not in discovered:
            discovered.add(vertex)
            result.append(vertex)
    return result`,
    tests: `assert unseen_neighbors([], set()) == []
assert unseen_neighbors([0, 0], {0}) == []
assert unseen_neighbors([2, 1, 2, 0, 3], {0, 1}) == [2, 3]
assert unseen_neighbors([4, 4, 5], set()) == [4, 5]
seen = {1}
neighbors = [1, 2, 2]
assert unseen_neighbors(neighbors, seen) == [2]
assert seen == {1} and neighbors == [1, 2, 2]`,
    call: 'print(unseen_neighbors([0, 2, 2, 3, 0], {0}))',
    output: '[2, 3]',
    questions: [
      [
        'What should an edge back to an already discovered vertex schedule?',
        ['Nothing new.', 'The vertex forever.', 'Every graph vertex.'],
        0,
        'The vertex already has a discovery or completed expansion.',
        'Scanning an edge does not require new work.',
      ],
      [
        'For neighbors [2, 2] with 2 unseen initially, how many new entries are scheduled?',
        ['0', '1', '2'],
        1,
        'The first occurrence marks 2; the second sees it already discovered.',
        'Update the guard immediately.',
      ],
      [
        'Why does the guard handle a self-loop?',
        [
          'Self-loops are shortest routes.',
          'It deletes the graph.',
          'The current vertex was discovered before its expansion.',
        ],
        2,
        'An edge to itself finds an already marked vertex.',
        'Scheduling starts by marking the vertex.',
      ],
    ],
    cards: [
      [
        'What does a traversal do with an edge to a discovered vertex?',
        'It scans the edge but schedules no duplicate work.',
      ],
      [
        'How are parallel outgoing edges prevented from duplicating work?',
        'Mark the neighbor at its first scheduled occurrence.',
      ],
    ],
  }),
  atom({
    id: 'cp-fifo-frontier',
    unit: 'cp-graphs',
    title: 'Take the oldest breadth-first work',
    parents: ['list-mutation', 'return-values', 'boolean-logic'],
    summary: 'Use a queue so earlier discoveries are processed first.',
    lesson: [
      'A breadth-first frontier is a queue: append new work at the right and remove the oldest work at the left. This is first in, first out.',
      'collections.deque supplies append and popleft without shifting all remaining entries. This local queue exercise returns its remainder as a list for a clear assessment contract.',
    ],
    signature: 'def take_breadth_first(pending):',
    prompt:
      'Implement take_breadth_first(pending). pending is a list of queued integer vertices, oldest first. Use collections.deque to return (oldest_vertex, remaining_list). Return (None, []) when empty and preserve pending.',
    solution: `def take_breadth_first(pending):
    from collections import deque
    queue = deque(pending)
    if not queue:
        return None, []
    vertex = queue.popleft()
    return vertex, list(queue)`,
    tests: `assert take_breadth_first([]) == (None, [])
assert take_breadth_first([0]) == (0, [])
assert take_breadth_first([4, 1, 7]) == (4, [1, 7])
source = [2, 3]
assert take_breadth_first(source) == (2, [3])
assert source == [2, 3]`,
    call: 'print(take_breadth_first([0, 3, 1]))',
    output: '(0, [3, 1])',
    questions: [
      [
        'Which pending vertex does a BFS queue select?',
        ['The newest.', 'The largest label.', 'The oldest.'],
        2,
        'First in, first out selects the earliest queued vertex.',
        'Use arrival order.',
      ],
      [
        'Which deque operation removes from the left?',
        ['popleft()', 'pop()', 'append()'],
        0,
        'popleft removes the oldest queued entry.',
        'New work is appended at the right.',
      ],
      [
        'Why use deque rather than repeated list.pop(0)?',
        [
          'It sorts priorities.',
          'It avoids shifting the remaining list on each front removal.',
          'It limits the graph to two vertices.',
        ],
        1,
        'Deque end operations do not repeatedly shift the full frontier.',
        'A wide frontier makes shifting costly.',
      ],
    ],
    cards: [
      [
        'What frontier order does breadth-first search use?',
        'First in, first out: process the oldest queued vertex.',
      ],
      [
        'Which deque operations implement a FIFO frontier?',
        'append at the right, popleft at the left.',
      ],
    ],
  }),
  atom({
    id: 'cp-bfs-discovery',
    unit: 'cp-graphs',
    title: 'Queue a neighbor only at first discovery',
    parents: ['cp-fifo-frontier', 'cp-discover-once'],
    summary: 'Mark new queue entries before another edge can repeat them.',
    lesson: [
      'When BFS scans outgoing neighbors, queue each neighbor only if it has not been discovered. Add it to seen immediately when appending, not when it is later removed.',
      'This keeps one queued copy per vertex even when several parents or parallel edges reach it. Existing pending entries keep their FIFO order.',
    ],
    signature: 'def queue_neighbors(pending, seen, neighbors):',
    prompt:
      'Implement queue_neighbors(pending, seen, neighbors). Return (new_pending, new_seen), appending previously unseen neighbors in their supplied order and marking each immediately. Preserve all inputs, ignore repeated discoveries, and keep existing queue order.',
    solution: `def queue_neighbors(pending, seen, neighbors):
    queue = pending.copy()
    discovered = seen.copy()
    for vertex in neighbors:
        if vertex not in discovered:
            discovered.add(vertex)
            queue.append(vertex)
    return queue, discovered`,
    tests: `assert queue_neighbors([], set(), []) == ([], set())
assert queue_neighbors([1], {0, 1}, [1, 2, 2, 3]) == ([1, 2, 3], {0, 1, 2, 3})
assert queue_neighbors([], {0}, [0, 0]) == ([], {0})
pending = [2]
seen = {0, 2}
neighbors = [3, 2, 3]
assert queue_neighbors(pending, seen, neighbors) == ([2, 3], {0, 2, 3})
assert pending == [2] and seen == {0, 2} and neighbors == [3, 2, 3]`,
    call: 'pending, seen = queue_neighbors([1], {0, 1}, [2, 2, 3])\nprint(pending)\nprint(sorted(seen))',
    output: '[1, 2, 3]\n[0, 1, 2, 3]',
    questions: [
      [
        'When does BFS mark a newly queued vertex?',
        [
          'Immediately on enqueue.',
          'Only after all other vertices finish.',
          'Never for duplicate edges.',
        ],
        0,
        'Immediate marking prevents later edges from duplicating pending work.',
        'Pending vertices are already discovered.',
      ],
      [
        'For neighbors [2, 2] with 2 unseen, how many copies enter the queue?',
        ['2', '1', '0'],
        1,
        'The first edge marks 2; the second is ignored.',
        'Test the updated discovered set.',
      ],
      [
        'Where do newly discovered neighbors go relative to old pending work?',
        ['Before it.', 'They replace it.', 'After it.'],
        2,
        'Appending preserves first in, first out.',
        'Older queued work must stay earlier.',
      ],
    ],
    cards: [
      [
        'When should BFS mark a neighbor as discovered?',
        'When it is first appended to the queue.',
      ],
      [
        'Why does BFS discovery marking happen before dequeue?',
        'To avoid several queued copies from multiple incoming edges.',
      ],
    ],
  }),
  atom({
    id: 'cp-bfs-layer-distance',
    unit: 'cp-graphs',
    title: 'Assign the next breadth-first distance layer',
    parents: ['cp-bfs-discovery'],
    summary: 'Give a first-discovered neighbor its parent’s distance plus one.',
    lesson: [
      'In an unweighted graph, crossing one edge adds one to the path length. If a dequeued vertex has distance d, its first-discovered neighbors receive d+1.',
      'BFS processes distance layers in order, so a previously assigned distance is not replaced by a later route. This function practices one expansion; -1 marks an undiscovered vertex.',
    ],
    signature: 'def assign_next_layer(distances, vertex, neighbors):',
    prompt:
      'Implement assign_next_layer(distances, vertex, neighbors). distances contains -1 for undiscovered vertices and nonnegative assigned distances; vertex is valid and already discovered. For each valid neighbor with distance -1, assign distances[vertex]+1. Return a new list; preserve existing assignments and all inputs.',
    solution: `def assign_next_layer(distances, vertex, neighbors):
    result = distances.copy()
    for neighbor in neighbors:
        if result[neighbor] == -1:
            result[neighbor] = result[vertex] + 1
    return result`,
    tests: `assert assign_next_layer([0, -1, -1], 0, [1, 2]) == [0, 1, 1]
assert assign_next_layer([0, 1, -1], 1, [0, 2, 2]) == [0, 1, 2]
assert assign_next_layer([0], 0, [0]) == [0]
assert assign_next_layer([3, -1], 0, []) == [3, -1]
source = [0, 1, -1, -1]
assert assign_next_layer(source, 1, [2]) == [0, 1, 2, -1]
assert source == [0, 1, -1, -1]`,
    call: 'print(assign_next_layer([0, 1, -1, -1], 1, [2, 3]))',
    output: '[0, 1, 2, 2]',
    questions: [
      [
        'A first-discovered neighbor of a distance-4 vertex receives which distance?',
        ['4', '8', '5'],
        2,
        'One unweighted edge contributes one additional step.',
        'Add one to the parent distance.',
      ],
      [
        'Should a later BFS route replace an already assigned unweighted distance?',
        ['No.', 'Always.', 'Only when the vertex label is smaller.'],
        0,
        'Layer order guarantees the first discovery has minimum edge distance.',
        'Do not reassign discovered vertices.',
      ],
      [
        'What does -1 mean in this distance contract?',
        [
          'A negative edge weight.',
          'The vertex is undiscovered.',
          'The vertex is the source.',
        ],
        1,
        'Assigned path lengths are nonnegative; -1 is the separate absence marker.',
        'Source distance is zero.',
      ],
    ],
    cards: [
      [
        'What distance does BFS assign a newly discovered neighbor?',
        'The current vertex’s distance plus one edge.',
      ],
      [
        'Why can BFS keep a vertex’s first unweighted distance?',
        'The FIFO frontier processes increasing distance layers.',
      ],
    ],
  }),
  atom({
    id: 'cp-grid-bounds',
    unit: 'cp-graphs',
    title: 'Keep four-neighbor coordinates inside the grid',
    parents: ['parameters', 'boolean-logic'],
    summary: 'Filter up, down, left, and right using row and column bounds.',
    lesson: [
      'A grid cell is a (row, column) vertex. In four-neighbor movement its candidates are up, down, left, and right; diagonals are not part of this contract.',
      'Keep a candidate only when 0<=row<rows and 0<=column<cols. Check bounds before indexing because Python’s negative indices otherwise wrap to the opposite end.',
    ],
    signature: 'def bounded_neighbors(rows, cols, row, col):',
    prompt:
      'Implement bounded_neighbors(rows, cols, row, col). rows,cols are positive and the source cell is valid. Return valid four-neighbor coordinates in up, down, left, right order. Do not include diagonals or the source cell.',
    solution: `def bounded_neighbors(rows, cols, row, col):
    result = []
    for nr, nc in [(row - 1, col), (row + 1, col), (row, col - 1), (row, col + 1)]:
        if 0 <= nr < rows and 0 <= nc < cols:
            result.append((nr, nc))
    return result`,
    tests: `assert bounded_neighbors(1, 1, 0, 0) == []
assert bounded_neighbors(3, 3, 1, 1) == [(0, 1), (2, 1), (1, 0), (1, 2)]
assert bounded_neighbors(2, 3, 0, 0) == [(1, 0), (0, 1)]
assert bounded_neighbors(1, 3, 0, 1) == [(0, 0), (0, 2)]
assert bounded_neighbors(3, 1, 1, 0) == [(0, 0), (2, 0)]`,
    call: 'print(bounded_neighbors(3, 4, 0, 3))',
    output: '[(1, 3), (0, 2)]',
    questions: [
      [
        'Which movement is excluded by four-neighbor connectivity?',
        ['One row upward.', 'A diagonal step.', 'One column rightward.'],
        1,
        'Only up, down, left, and right are allowed.',
        'Both coordinates must not change together.',
      ],
      [
        'Why check for a negative row before indexing?',
        [
          'Python always rejects negative indices.',
          'It sorts the grid.',
          'Negative Python indices can wrap to a different row.',
        ],
        2,
        'An unchecked -1 selects the last row rather than an invalid neighbor.',
        'Grid geometry and Python indexing differ.',
      ],
      [
        'What condition makes column c valid?',
        ['0 <= c < cols', '0 <= c <= cols', 'c > cols'],
        0,
        'The final valid column is cols-1.',
        'Use a half-open bound.',
      ],
    ],
    cards: [
      [
        'What moves define four-neighbor grid connectivity?',
        'Up, down, left, and right; no diagonals.',
      ],
      [
        'Why guard grid coordinates before Python indexing?',
        'Negative indices may wrap instead of indicating an invalid cell.',
      ],
    ],
  }),
  atom({
    id: 'cp-grid-passability',
    unit: 'cp-graphs',
    title: 'Filter neighbor cells by passability',
    parents: ['cp-grid-bounds'],
    summary: 'Keep only valid neighboring land cells.',
    lesson: [
      'Being inside the grid does not make a cell traversable. In this binary-grid contract 1 is land and 0 is a blocked cell.',
      'Apply the boundary check before reading the cell value, then keep only land. This step does not yet track visited cells; discovery belongs to the component search.',
    ],
    signature: 'def land_neighbors(grid, row, col):',
    prompt:
      'Implement land_neighbors(grid, row, col). grid is a nonempty rectangular binary grid and (row,col) is valid. Return neighboring cells with value 1 in up, down, left, right order, excluding out-of-bounds coordinates. Preserve grid.',
    solution: `def land_neighbors(grid, row, col):
    rows, cols = len(grid), len(grid[0])
    result = []
    for nr, nc in [(row - 1, col), (row + 1, col), (row, col - 1), (row, col + 1)]:
        if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == 1:
            result.append((nr, nc))
    return result`,
    tests: `assert land_neighbors([[1]], 0, 0) == []
assert land_neighbors([[1, 0], [1, 1]], 0, 0) == [(1, 0)]
assert land_neighbors([[0, 1, 0], [1, 1, 1], [0, 0, 0]], 1, 1) == [(0, 1), (1, 0), (1, 2)]
assert land_neighbors([[0, 0], [0, 0]], 0, 0) == []
source = [[1, 1]]
assert land_neighbors(source, 0, 0) == [(0, 1)]
assert source == [[1, 1]]`,
    call: 'print(land_neighbors([[1, 0, 1], [1, 1, 0]], 1, 1))',
    output: '[(1, 0)]',
    questions: [
      [
        'Which valid neighbor can be traversed under the binary-grid contract?',
        ['Any neighbor.', 'Only a cell with value 1.', 'Only a diagonal 0.'],
        1,
        '1 is land and 0 is blocked.',
        'Check passability after geometry.',
      ],
      [
        'Which condition should be checked before grid[nr][nc]?',
        [
          'Whether the whole grid is sorted.',
          'Whether nr equals nc.',
          'Whether nr,nc are in bounds.',
        ],
        2,
        'Bounds make the indexing correspond to a real neighboring cell.',
        'Do not read an invalid candidate.',
      ],
      [
        'Does passability alone prevent revisiting a land cell?',
        [
          'No; discovery tracking is still required.',
          'Yes, automatically.',
          'Only for square grids.',
        ],
        0,
        'A traversable cell can be reached by several routes.',
        'Separate allowed movement from visited state.',
      ],
    ],
    cards: [
      [
        'What two checks decide whether a grid neighbor is usable?',
        'It is in bounds and its cell is passable.',
      ],
      [
        'Does a land-cell check replace a visited set?',
        'No. Passability and discovery tracking serve different purposes.',
      ],
    ],
  }),
  atom({
    id: 'cp-grid-component',
    unit: 'cp-graphs',
    title: 'Explore one connected land component',
    parents: ['cp-grid-passability', 'cp-dfs'],
    summary: 'Count land reachable from one starting cell.',
    lesson: [
      'A component search from one land cell reaches exactly the cells connected to that start by allowed land-to-land moves. Other islands must be started separately.',
      'Store discovered coordinates in a set and mark them when scheduling. This search returns one component’s size, leaving the grid unchanged so an outer scan can later count all components.',
    ],
    signature: 'def land_component_size(grid, row, col):',
    prompt:
      'Implement land_component_size(grid, row, col). grid is a rectangular binary grid. Return 0 for an empty grid, empty rows, or a blocked valid start; otherwise count distinct 1-cells reachable by up/down/left/right moves from the valid start. Preserve grid and use an iterative search.',
    solution: `def land_component_size(grid, row, col):
    if not grid or not grid[0] or grid[row][col] == 0:
        return 0
    rows, cols = len(grid), len(grid[0])
    seen = {(row, col)}
    pending = [(row, col)]
    while pending:
        r, c = pending.pop()
        for nr, nc in [(r - 1, c), (r + 1, c), (r, c - 1), (r, c + 1)]:
            if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == 1 and (nr, nc) not in seen:
                seen.add((nr, nc))
                pending.append((nr, nc))
    return len(seen)`,
    tests: `assert land_component_size([], 0, 0) == 0
assert land_component_size([[]], 0, 0) == 0
assert land_component_size([[0]], 0, 0) == 0
assert land_component_size([[1]], 0, 0) == 1
assert land_component_size([[1, 0], [0, 1]], 0, 0) == 1
source = [[1, 1, 0], [1, 0, 1]]
assert land_component_size(source, 0, 0) == 3
assert land_component_size(source, 1, 2) == 1
assert source == [[1, 1, 0], [1, 0, 1]]
assert land_component_size([[1] * 1500], 0, 0) == 1500`,
    call: 'print(land_component_size([[1, 1, 0], [0, 1, 1], [1, 0, 0]], 0, 0))',
    output: '4',
    questions: [
      [
        'Does one component search count all islands automatically?',
        [
          'Yes.',
          'No; only the start’s connected land.',
          'Only when using a stack.',
        ],
        1,
        'Disconnected land cannot be reached from this start.',
        'The outer scan supplies additional starts.',
      ],
      [
        'For [[1,0],[0,1]], how large is the top-left four-neighbor component?',
        ['2', '4', '1'],
        2,
        'The other land cell is only diagonal and is not connected.',
        'Diagonals are excluded.',
      ],
      [
        'Why mark a coordinate when scheduling it?',
        [
          'To avoid repeated work through multiple land routes.',
          'To turn water into land.',
          'To sort the grid.',
        ],
        0,
        'A discovered set prevents cycles from rescheduling cells.',
        'Components may contain loops.',
      ],
    ],
    cards: [
      [
        'What does a component search from one land cell reach?',
        'Only land connected to that start by allowed moves.',
      ],
      [
        'How does an iterative grid search avoid duplicate cells?',
        'Mark each coordinate at first scheduling and skip discovered neighbors.',
      ],
    ],
  }),
  atom({
    id: 'cp-incoming-counts',
    unit: 'cp-paths',
    title: 'Count a vertex’s incoming dependencies',
    parents: ['cp-directed-edge', 'accumulators'],
    summary: 'Count every directed edge into its destination.',
    lesson: [
      'A topological ordering places each edge’s source before its destination. The indegree of a vertex counts its incoming edges: the dependencies that must be removed before it becomes ready.',
      'Count every adjacency entry, including parallel edges. An isolated vertex has indegree zero; a self-loop gives its vertex a positive incoming count.',
    ],
    signature: 'def incoming_counts(graph):',
    prompt:
      'Implement incoming_counts(graph). graph is a directed adjacency list with valid vertex indices. Return each vertex’s number of incoming entries, retaining repeated edges and self-loops. Preserve graph.',
    solution: `def incoming_counts(graph):
    counts = [0] * len(graph)
    for neighbors in graph:
        for vertex in neighbors:
            counts[vertex] += 1
    return counts`,
    tests: `assert incoming_counts([]) == []
assert incoming_counts([[], [], []]) == [0, 0, 0]
assert incoming_counts([[1, 1], [2], []]) == [0, 2, 1]
assert incoming_counts([[0]]) == [1]
source = [[2], [2], []]
assert incoming_counts(source) == [0, 0, 2]
assert source == [[2], [2], []]`,
    call: 'print(incoming_counts([[2], [2, 3], [3], []]))',
    output: '[0, 0, 2, 2]',
    questions: [
      [
        'What does indegree count?',
        [
          'Incoming edge entries.',
          'Outgoing edge entries only.',
          'All vertices.',
        ],
        0,
        'Each source-to-destination edge contributes to its destination.',
        'Count prerequisites pointing in.',
      ],
      [
        'Two parallel edges enter vertex 3. How much do they add to indegree?',
        ['0', '2', '1'],
        1,
        'Both entries must later be removed under this contract.',
        'Retain multiplicity consistently.',
      ],
      [
        'What is the indegree of an isolated vertex?',
        ['1', 'The graph size', '0'],
        2,
        'No incoming entries point to it.',
        'A vertex can exist without edges.',
      ],
    ],
    cards: [
      [
        'What does a directed vertex’s indegree measure?',
        'Its number of incoming edge entries.',
      ],
      [
        'How do parallel incoming edges affect indegree?',
        'Each occurrence contributes one.',
      ],
    ],
  }),
  atom({
    id: 'cp-zero-indegree',
    unit: 'cp-paths',
    title: 'Select vertices with no remaining prerequisites',
    parents: ['cp-incoming-counts'],
    summary: 'Start a topological frontier from all zero incoming counts.',
    lesson: [
      'A vertex with zero remaining indegree has no unprocessed incoming dependency. It can enter the ready frontier before any still-blocked vertex.',
      'Include every zero-indegree vertex, including isolated vertices and separate components. If a nonempty remaining graph has none, it cannot finish by repeatedly removing ready vertices.',
    ],
    signature: 'def ready_vertices(indegrees):',
    prompt:
      'Implement ready_vertices(indegrees) for a list of nonnegative incoming counts. Return all indices whose count is zero in increasing vertex-index order. Preserve indegrees.',
    solution: `def ready_vertices(indegrees):
    return [vertex for vertex, count in enumerate(indegrees) if count == 0]`,
    tests: `assert ready_vertices([]) == []
assert ready_vertices([0, 0, 0]) == [0, 1, 2]
assert ready_vertices([2, 0, 1, 0]) == [1, 3]
assert ready_vertices([1, 1]) == []
source = [0, 3]
assert ready_vertices(source) == [0]
assert source == [0, 3]`,
    call: 'print(ready_vertices([0, 2, 0, 1, 0]))',
    output: '[0, 2, 4]',
    questions: [
      [
        'Which vertex is ready in counts [2,0,1]?',
        ['0', '1', '2'],
        1,
        'Vertex 1 has no remaining incoming dependency.',
        'Look for zero.',
      ],
      [
        'Should isolated vertices enter the ready frontier?',
        [
          'Never.',
          'Only after a neighbor.',
          'Yes; their incoming count is zero.',
        ],
        2,
        'They have no unmet prerequisites.',
        'Topological ordering must still include them.',
      ],
      [
        'What does an empty ready frontier with unprocessed vertices indicate in Kahn’s algorithm?',
        [
          'The remaining directed graph contains a cycle.',
          'All vertices are already processed.',
          'Every edge has negative weight.',
        ],
        0,
        'A remaining acyclic graph must have a zero-indegree vertex.',
        'No dependency can be removed next.',
      ],
    ],
    cards: [
      [
        'When is a topological vertex ready?',
        'When its remaining incoming count is zero.',
      ],
      [
        'Are isolated vertices included in a topological frontier?',
        'Yes. They have no incoming dependencies.',
      ],
    ],
  }),
  atom({
    id: 'cp-release-dependency',
    unit: 'cp-paths',
    title: 'Release neighbors when their final dependency leaves',
    parents: ['cp-zero-indegree'],
    summary:
      'Decrement each outgoing incidence and detect its transition to zero.',
    lesson: [
      'Processing a ready vertex removes each of its outgoing edges. Decrement the destination’s remaining incoming count once for each outgoing incidence.',
      'Enqueue a destination exactly when its count becomes zero. With parallel edges the first decrement may leave it blocked; only the final required removal releases it.',
    ],
    signature: 'def release_edges(indegrees, outgoing):',
    prompt:
      'Implement release_edges(indegrees, outgoing). outgoing lists the destination indices of edges being removed from one ready vertex. Counts are nonnegative and contain at least the listed multiplicity for each destination. Return (new_counts, newly_ready_indices) in their zero-transition order. Preserve inputs.',
    solution: `def release_edges(indegrees, outgoing):
    counts = indegrees.copy()
    ready = []
    for vertex in outgoing:
        counts[vertex] -= 1
        if counts[vertex] == 0:
            ready.append(vertex)
    return counts, ready`,
    tests: `assert release_edges([], []) == ([], [])
assert release_edges([0, 1, 2], [1, 2]) == ([0, 0, 1], [1])
assert release_edges([0, 2], [1, 1]) == ([0, 0], [1])
assert release_edges([0, 1, 1], [2, 1]) == ([0, 0, 0], [2, 1])
counts = [0, 3]
edges = [1, 1]
assert release_edges(counts, edges) == ([0, 1], [])
assert counts == [0, 3] and edges == [1, 1]`,
    call: 'print(release_edges([0, 1, 2, 1], [2, 1, 2]))',
    output: '([0, 0, 0, 1], [1, 2])',
    questions: [
      [
        'A neighbor has remaining count 3; one incoming edge is removed. Is it ready?',
        [
          'Yes immediately.',
          'No; its count becomes 2.',
          'Only if its label is 3.',
        ],
        1,
        'Two dependencies still remain.',
        'Ready means zero, not merely smaller.',
      ],
      [
        'When should a neighbor enter the ready queue?',
        [
          'Whenever its count is positive.',
          'Only at the start.',
          'At the transition to zero.',
        ],
        2,
        'The last dependency removal makes it ready.',
        'Enqueue once when all prerequisites have left.',
      ],
      [
        'If two parallel edges are removed, how many decrements occur?',
        ['Two.', 'One.', 'Zero.'],
        0,
        'The indegree counted both occurrences, so both must be removed.',
        'Count and remove using the same edge contract.',
      ],
    ],
    cards: [
      [
        'How does processing a topological vertex update its outgoing neighbors?',
        'Decrement each destination’s indegree once per outgoing edge entry.',
      ],
      [
        'When does an outgoing neighbor become newly ready?',
        'Exactly when its remaining indegree reaches zero.',
      ],
    ],
  }),
  atom({
    id: 'cp-distance-relaxation',
    unit: 'cp-paths',
    title: 'Improve one tentative weighted distance',
    parents: ['cp-enumerate-best', 'cp-bfs-layer-distance'],
    summary: 'Replace a distance only when a candidate route is shorter.',
    lesson: [
      'Relaxing an edge from a vertex at distance d across weight w proposes candidate d+w for its destination. Keep the proposal only when it improves the destination’s best known distance.',
      'Here None means no route has been found, so any candidate initializes it. Dijkstra’s later ordering guarantee requires nonnegative edge weights; this step assumes that restriction.',
    ],
    signature: 'def relax_distance(current, source_distance, weight):',
    prompt:
      'Implement relax_distance(current, source_distance, weight). current is None or a nonnegative distance; source_distance and weight are nonnegative integers. Return the better of current and source_distance+weight, treating None as undiscovered.',
    solution: `def relax_distance(current, source_distance, weight):
    candidate = source_distance + weight
    if current is None or candidate < current:
        return candidate
    return current`,
    tests: `assert relax_distance(None, 4, 3) == 7
assert relax_distance(10, 4, 3) == 7
assert relax_distance(5, 4, 3) == 5
assert relax_distance(7, 4, 3) == 7
assert relax_distance(None, 0, 0) == 0
assert relax_distance(0, 2, 0) == 0`,
    call: 'print(relax_distance(12, 3, 4))\nprint(relax_distance(None, 0, 5))',
    output: '7\n5',
    questions: [
      [
        'From distance 6 across weight 4, what route distance is proposed?',
        ['2', '24', '10'],
        2,
        'Distances along the route add.',
        'Add the edge weight.',
      ],
      [
        'Current=8 and candidate=11. What is retained?',
        ['8', '11', 'None'],
        0,
        'The existing shorter route remains best.',
        'Relaxation keeps the minimum.',
      ],
      [
        'What weight restriction supports ordinary Dijkstra?',
        [
          'Every weight is exactly 1.',
          'Every weight is nonnegative.',
          'Every weight is negative.',
        ],
        1,
        'Nonnegative edges preserve the priority-based distance guarantee.',
        'Later edges must not decrease a settled route.',
      ],
    ],
    cards: [
      [
        'What candidate does weighted-edge relaxation propose?',
        'source_distance + edge_weight.',
      ],
      [
        'When does a candidate replace the stored distance?',
        'When none is stored or the candidate is strictly smaller.',
      ],
    ],
  }),
  atom({
    id: 'cp-stale-distance',
    unit: 'cp-paths',
    title: 'Recognize a stale heap distance',
    parents: ['cp-distance-relaxation', 'cp-heap-updates'],
    summary: 'Skip a queued proposal that no longer matches the best distance.',
    lesson: [
      'A better route can be pushed without removing the old proposal from the heap. When the old entry is later popped, its distance differs from the vertex’s current best label.',
      'Compare the entry’s queued distance with the stored distance. A mismatch is stale work and should not expand outgoing edges; an equal entry is current.',
    ],
    signature: 'def is_current_distance(entry, distances):',
    prompt:
      'Implement is_current_distance(entry, distances). entry is (queued_distance, vertex) with a valid vertex index. distances contains nonnegative distances or None. Return whether the queued distance equals that vertex’s current stored distance. Preserve inputs.',
    solution: `def is_current_distance(entry, distances):
    queued_distance, vertex = entry
    return queued_distance == distances[vertex]`,
    tests: `assert is_current_distance((7, 1), [0, 7]) is True
assert is_current_distance((9, 1), [0, 7]) is False
assert is_current_distance((0, 0), [0]) is True
assert is_current_distance((2, 0), [None]) is False
assert is_current_distance((4, 0), [8]) is False
source = [0, 3]
assert is_current_distance((3, 1), source) is True
assert source == [0, 3]`,
    call: 'print(is_current_distance((9, 1), [0, 4]))\nprint(is_current_distance((4, 1), [0, 4]))',
    output: 'False\nTrue',
    questions: [
      [
        'A heap entry says distance 9, but the stored best is 4. What is that entry?',
        ['Current.', 'Stale.', 'A new graph edge.'],
        1,
        'The proposal was superseded by the better label.',
        'Compare entry and stored distance.',
      ],
      [
        'Should a stale entry expand outgoing edges?',
        ['Always.', 'Only for even labels.', 'No.'],
        2,
        'Its distance is no longer the best known route.',
        'Discard obsolete work.',
      ],
      [
        'Why can stale entries exist in a heap-based Dijkstra implementation?',
        [
          'A new better entry can be pushed while the old one remains queued.',
          'Every heap is unsorted by priority.',
          'Vertices cannot have more than one route.',
        ],
        0,
        'Lazy replacement avoids searching inside the heap to delete old proposals.',
        'The distance array tracks the current truth.',
      ],
    ],
    cards: [
      [
        'How is a stale Dijkstra heap entry recognized?',
        'Its queued distance differs from the vertex’s stored best distance.',
      ],
      [
        'What should Dijkstra do with a stale entry?',
        'Skip it without expanding outgoing edges.',
      ],
    ],
  }),
  atom({
    id: 'cp-minimum-distance-work',
    unit: 'cp-paths',
    title: 'Select the smallest current distance proposal',
    parents: ['cp-stale-distance', 'cp-sort-key'],
    summary: 'Pop heap proposals until one matches its stored distance.',
    lesson: [
      'Dijkstra’s frontier orders (distance, vertex) proposals by distance. Use a minimum heap to remove the smallest proposal first, rather than FIFO or depth-first scheduling.',
      'Skip stale proposals as they appear. The first remaining current entry is the smallest valid queued distance; if every proposal is stale, no usable work remains.',
    ],
    signature: 'def next_distance_entry(entries, distances):',
    prompt:
      'Implement next_distance_entry(entries, distances). entries contains (nonnegative_distance, valid_vertex) tuples. Return the smallest tuple whose distance matches distances[vertex], or None when none match. Use heapq and preserve both inputs. Tuple ordering breaks equal-distance ties by vertex.',
    solution: `def next_distance_entry(entries, distances):
    import heapq
    heap = entries.copy()
    heapq.heapify(heap)
    while heap:
        distance, vertex = heapq.heappop(heap)
        if distance == distances[vertex]:
            return distance, vertex
    return None`,
    tests: `assert next_distance_entry([], []) is None
assert next_distance_entry([(9, 1), (4, 1), (6, 2)], [0, 4, 6]) == (4, 1)
assert next_distance_entry([(1, 0), (2, 1)], [3, None]) is None
assert next_distance_entry([(0, 1), (0, 0)], [0, 0]) == (0, 0)
entries = [(8, 0), (2, 0), (1, 1)]
distances = [2, 4]
assert next_distance_entry(entries, distances) == (2, 0)
assert entries == [(8, 0), (2, 0), (1, 1)] and distances == [2, 4]`,
    call: 'print(next_distance_entry([(1, 2), (6, 1), (3, 2)], [0, 6, 3]))',
    output: '(3, 2)',
    questions: [
      [
        'Which valid proposal should Dijkstra select next?',
        [
          'The newest proposal.',
          'The smallest distance proposal.',
          'The largest vertex label.',
        ],
        1,
        'The frontier is ranked by tentative distance.',
        'Use a minimum priority queue.',
      ],
      [
        'The smallest heap entry is stale. What happens next?',
        [
          'It must be expanded anyway.',
          'Every current distance is erased.',
          'Discard it and pop again.',
        ],
        2,
        'Stale entries do not supply usable work.',
        'Continue until a current proposal or an empty heap.',
      ],
      [
        'How do equal-distance integer tuples compare?',
        [
          'By vertex in the second field.',
          'Only by insertion time.',
          'They cannot be compared.',
        ],
        0,
        'Python tuples compare subsequent fields when earlier fields tie.',
        'The payload here is an integer vertex.',
      ],
    ],
    cards: [
      [
        'How is the next usable Dijkstra proposal selected?',
        'Pop the minimum heap and skip stale distance labels.',
      ],
      [
        'What frontier order distinguishes Dijkstra from BFS?',
        'Minimum tentative weighted distance rather than FIFO arrival.',
      ],
    ],
  }),
  atom({
    id: 'cp-parent-root',
    unit: 'cp-paths',
    title: 'Follow parent links to a component root',
    parents: ['cp-link-count'],
    summary: 'Stop at the representative whose parent is itself.',
    lesson: [
      'A disjoint-set parent forest gives each vertex one parent. A root points to itself; following parent links from a member reaches its component’s representative.',
      'The parent array is assumed to be a valid forest, not an arbitrary directed graph. Iterative following handles tall valid chains without recursive-call depth failures.',
    ],
    signature: 'def component_root(parent, vertex):',
    prompt:
      'Implement component_root(parent, vertex). parent is a valid nonempty disjoint-set forest with valid parent indices and roots satisfying parent[root]==root; vertex is valid. Return its root using an iterative loop. Preserve parent.',
    solution: `def component_root(parent, vertex):
    while parent[vertex] != vertex:
        vertex = parent[vertex]
    return vertex`,
    tests: `assert component_root([0], 0) == 0
assert component_root([0, 0, 1, 3], 2) == 0
assert component_root([0, 0, 1, 3], 3) == 3
assert component_root([2, 2, 2], 0) == 2
chain = [0] + list(range(1499))
assert component_root(chain, 1499) == 0
source = [0, 0, 1]
assert component_root(source, 2) == 0
assert source == [0, 0, 1]`,
    call: 'print(component_root([0, 0, 1, 3], 2))\nprint(component_root([0, 0, 1, 3], 3))',
    output: '0\n3',
    questions: [
      [
        'What identifies a disjoint-set root?',
        [
          'Its parent points to itself.',
          'It has the smallest numeric label always.',
          'It has no array entry.',
        ],
        0,
        'The self-parent is the stopping condition.',
        'Follow parent links until they stop changing.',
      ],
      [
        'In parent=[0,0,1], what is the root of vertex 2?',
        ['2', '0', '1'],
        1,
        '2 points to 1, then 1 points to root 0.',
        'Trace the full chain.',
      ],
      [
        'Why use an iterative find on a tall parent forest?',
        [
          'It sorts the components.',
          'It changes the graph to directed.',
          'It avoids Python recursion-depth failures.',
        ],
        2,
        'The loop follows the chain without recursive calls.',
        'Forest height may be large before compression.',
      ],
    ],
    cards: [
      [
        'What is a disjoint-set representative?',
        'The root reached by parent links, whose parent is itself.',
      ],
      [
        'Why must a parent-find contract require a forest?',
        'Arbitrary parent cycles might never reach a self-parent root.',
      ],
    ],
  }),
  atom({
    id: 'cp-compress-path',
    unit: 'cp-paths',
    title: 'Shortcut a discovered parent path',
    parents: ['cp-parent-root'],
    summary: 'Point every traversed member directly to its unchanged root.',
    lesson: [
      'Path compression first finds a member’s root, then redirects every vertex on that search path to the same root. The component membership does not change.',
      'Only the traversed path is rewritten. Separate components and off-path branches keep their parent entries; future searches on the compressed path need fewer hops.',
    ],
    signature: 'def compressed_parent(parent, vertex):',
    prompt:
      'Implement compressed_parent(parent, vertex). parent is a valid nonempty disjoint-set forest and vertex is valid. Return a copied parent array with every vertex along vertex’s original path pointing directly to its root. Preserve the original and leave all off-path entries unchanged.',
    solution: `def compressed_parent(parent, vertex):
    result = parent.copy()
    root = vertex
    while result[root] != root:
        root = result[root]
    while result[vertex] != vertex:
        next_vertex = result[vertex]
        result[vertex] = root
        vertex = next_vertex
    return result`,
    tests: `assert compressed_parent([0], 0) == [0]
assert compressed_parent([0, 0, 1, 2, 4], 3) == [0, 0, 0, 0, 4]
assert compressed_parent([0, 0, 1, 2, 4], 1) == [0, 0, 1, 2, 4]
assert compressed_parent([2, 0, 2, 3], 1) == [2, 2, 2, 3]
source = [0, 0, 1, 2]
assert compressed_parent(source, 3) == [0, 0, 0, 0]
assert source == [0, 0, 1, 2]
chain = [0] + list(range(1499))
assert compressed_parent(chain, 1499) == [0] * 1500`,
    call: 'print(compressed_parent([0, 0, 1, 2, 4], 3))',
    output: '[0, 0, 0, 0, 4]',
    questions: [
      [
        'Does path compression change which component contains a vertex?',
        ['Always.', 'No.', 'Only when its root is zero.'],
        1,
        'It preserves the same root while shortening parent paths.',
        'Compression changes representation, not connectivity.',
      ],
      [
        'Which entries does this compression rewrite?',
        [
          'Every component root.',
          'Every graph edge.',
          'Only the searched parent path.',
        ],
        2,
        'Off-path entries are unchanged by this operation.',
        'Follow and shortcut one discovered path.',
      ],
      [
        'Why save the old next parent before rewriting an entry?',
        [
          'To continue along the original path.',
          'To sort labels.',
          'To create a second component.',
        ],
        0,
        'The shortcut would otherwise lose the next original link.',
        'Traverse before forgetting the old connection.',
      ],
    ],
    cards: [
      [
        'What does path compression redirect?',
        'Every member on the searched parent path directly to the same root.',
      ],
      [
        'Does path compression merge components?',
        'No. It only shortens paths inside an existing component.',
      ],
    ],
  }),
  atom({
    id: 'cp-union-size',
    unit: 'cp-paths',
    title: 'Attach the smaller root under the larger root',
    parents: ['cp-parent-root'],
    summary: 'Merge two components while controlling parent-tree growth.',
    lesson: [
      'Once two component roots are known, union by size links the smaller component’s root under the larger component’s root. Add both sizes at the surviving root.',
      'If the roots are already equal, no merge occurs. In this contract equal sizes keep the first root; the non-root size entry may retain its old value because only root sizes are consulted.',
    ],
    signature: 'def join_roots(parent, sizes, first, second):',
    prompt:
      'Implement join_roots(parent, sizes, first, second). first and second are valid roots in a disjoint-set forest; sizes stores correct positive component sizes at roots. Return copied (parent, sizes) arrays after union by size. Equal sizes keep first as root. Same-root input leaves both arrays unchanged. Preserve inputs; leave the attached root’s obsolete size entry unchanged.',
    solution: `def join_roots(parent, sizes, first, second):
    new_parent = parent.copy()
    new_sizes = sizes.copy()
    if first == second:
        return new_parent, new_sizes
    if new_sizes[first] < new_sizes[second]:
        first, second = second, first
    new_parent[second] = first
    new_sizes[first] += new_sizes[second]
    return new_parent, new_sizes`,
    tests: `assert join_roots([0, 1], [1, 1], 0, 1) == ([0, 0], [2, 1])
assert join_roots([0, 1, 1], [1, 2, 1], 0, 1) == ([1, 1, 1], [1, 3, 1])
assert join_roots([0, 0, 2], [2, 1, 1], 0, 2) == ([0, 0, 0], [3, 1, 1])
assert join_roots([0, 0], [2, 1], 0, 0) == ([0, 0], [2, 1])
parent = [0, 1]
sizes = [1, 1]
assert join_roots(parent, sizes, 1, 0) == ([1, 1], [1, 2])
assert parent == [0, 1] and sizes == [1, 1]`,
    call: 'print(join_roots([0, 1, 1], [1, 2, 1], 0, 1))',
    output: '([1, 1, 1], [1, 3, 1])',
    questions: [
      [
        'Which component root becomes a child under union by size?',
        ['The larger one.', 'The smaller one.', 'Both roots.'],
        1,
        'Attaching the smaller component limits depth growth.',
        'Compare root sizes before linking.',
      ],
      [
        'What happens when both arguments name the same root?',
        [
          'Its size doubles.',
          'It points to another random root.',
          'No merge occurs.',
        ],
        2,
        'They already belong to one component.',
        'Do not count membership twice.',
      ],
      [
        'Where is the merged size stored?',
        [
          'At the surviving root.',
          'At every vertex.',
          'Only at the attached non-root.',
        ],
        0,
        'Future union comparisons consult representative sizes.',
        'Root sizes describe components.',
      ],
    ],
    cards: [
      [
        'What root does union by size attach?',
        'The smaller component’s root under the larger component’s root.',
      ],
      [
        'How is the surviving root’s size updated?',
        'Add the two previous component sizes; same-root input does nothing.',
      ],
    ],
  }),
  atom({
    id: 'cp-edge-weight-order',
    unit: 'cp-paths',
    title: 'Order candidate edges by cost',
    parents: ['cp-sort-key'],
    summary: 'Rank undirected candidates by weight before a forest scan.',
    lesson: [
      'Kruskal’s algorithm considers candidate edges from lowest weight to highest. An edge is represented here by (u, v, weight), so the weight is the third field rather than the first.',
      'A deterministic tie rule makes traces reproducible. Sort by weight, then u, then v; parallel edges and negative weights remain valid candidates.',
    ],
    signature: 'def order_weighted_edges(edges):',
    prompt:
      'Implement order_weighted_edges(edges). Return a new list of (u,v,weight) tuples sorted by (weight,u,v). Preserve edges and retain all duplicate occurrences. Vertex labels and weights are integers; negative weights are allowed.',
    solution: `def order_weighted_edges(edges):
    return sorted(edges, key=lambda edge: (edge[2], edge[0], edge[1]))`,
    tests: `assert order_weighted_edges([]) == []
assert order_weighted_edges([(0, 1, 8), (1, 2, 3)]) == [(1, 2, 3), (0, 1, 8)]
assert order_weighted_edges([(2, 3, 1), (0, 2, 1), (0, 1, 1)]) == [(0, 1, 1), (0, 2, 1), (2, 3, 1)]
assert order_weighted_edges([(0, 1, 2), (0, 1, 2)]) == [(0, 1, 2), (0, 1, 2)]
source = [(0, 2, 0), (0, 1, -3)]
assert order_weighted_edges(source) == [(0, 1, -3), (0, 2, 0)]
assert source == [(0, 2, 0), (0, 1, -3)]`,
    call: 'print(order_weighted_edges([(0, 1, 7), (1, 2, 2), (0, 2, 4)]))',
    output: '[(1, 2, 2), (0, 2, 4), (0, 1, 7)]',
    questions: [
      [
        'Which field ranks (u,v,weight) edges in Kruskal’s scan?',
        ['u', 'weight', 'v'],
        1,
        'Candidate cost is the third tuple field.',
        'Representations determine indexing.',
      ],
      [
        'How should negative edge weights be ordered?',
        [
          'Always last.',
          'They must be erased.',
          'Normally, before larger weights.',
        ],
        2,
        'Minimum spanning forests permit negative edge costs.',
        'This differs from Dijkstra’s weight restriction.',
      ],
      [
        'What happens to duplicate edge occurrences during this ordering step?',
        ['All are retained.', 'Only one survives.', 'They become self-loops.'],
        0,
        'Ordering does not silently deduplicate candidates.',
        'Cycle filtering is a separate step.',
      ],
    ],
    cards: [
      [
        'In what order does Kruskal inspect candidate edges?',
        'Nondecreasing edge weight.',
      ],
      [
        'Are negative edge weights valid in an MST?',
        'Yes. They are ordered by cost like other edges.',
      ],
    ],
  }),
  atom({
    id: 'cp-forest-cycle-check',
    unit: 'cp-paths',
    title: 'Reject an edge inside one forest component',
    parents: ['cp-undirected-edge'],
    summary: 'Accept an edge only when it joins two distinct components.',
    lesson: [
      'Selected edges form a forest. Adding an edge whose endpoints already share a component would close a cycle; an edge between different components joins them safely.',
      'This tiny exercise represents components by equal labels and relabels the second component on acceptance. The full algorithm uses the already learned disjoint-set structure for efficient finds and unions.',
    ],
    signature: 'def accept_component_edge(labels, u, v):',
    prompt:
      'Implement accept_component_edge(labels, u, v). Equal integer labels identify the same component of an existing forest; u,v are valid vertices. If their labels are equal, return (False, a copy of labels). Otherwise return (True, new_labels), replacing every occurrence of v’s old label with u’s label. Preserve labels.',
    solution: `def accept_component_edge(labels, u, v):
    first, second = labels[u], labels[v]
    if first == second:
        return False, labels.copy()
    return True, [first if label == second else label for label in labels]`,
    tests: `assert accept_component_edge([0, 1, 2], 0, 1) == (True, [0, 0, 2])
assert accept_component_edge([0, 0, 2], 0, 1) == (False, [0, 0, 2])
assert accept_component_edge([7], 0, 0) == (False, [7])
assert accept_component_edge([4, 9, 9, 8], 0, 2) == (True, [4, 4, 4, 8])
source = [2, 5, 5]
assert accept_component_edge(source, 1, 0) == (True, [5, 5, 5])
assert source == [2, 5, 5]`,
    call: 'print(accept_component_edge([0, 0, 2, 2], 1, 2))',
    output: '(True, [0, 0, 0, 0])',
    questions: [
      [
        'Which candidate edge can be safely added to a forest?',
        [
          'One joining two different components.',
          'One inside the same component.',
          'Every self-loop.',
        ],
        0,
        'A cross-component edge connects without closing a cycle.',
        'Compare endpoint representatives.',
      ],
      [
        'Why reject a self-loop?',
        [
          'It has two different components.',
          'Its endpoint is already connected to itself.',
          'Its weight is always negative.',
        ],
        1,
        'It adds a cycle and no new connectivity.',
        'Both endpoints are the same vertex.',
      ],
      [
        'After accepting a cross-component edge, what must happen?',
        [
          'Erase every other component.',
          'Sort vertex labels.',
          'Merge the two components.',
        ],
        2,
        'Later cycle checks must see the new connectivity.',
        'Acceptance changes the forest partition.',
      ],
    ],
    cards: [
      [
        'When would a candidate edge create a forest cycle?',
        'When both endpoints already belong to the same component.',
      ],
      [
        'What follows accepting a cross-component edge?',
        'Merge those two components for later cycle checks.',
      ],
    ],
  }),
  atom({
    id: 'cp-spanning-completion',
    unit: 'cp-paths',
    title: 'Recognize a completed spanning tree',
    parents: ['cp-forest-cycle-check'],
    summary: 'Check whether an acyclic selected forest has enough edges.',
    lesson: [
      'An acyclic forest on n positive vertices is a spanning tree exactly when it has n-1 selected edges. If fewer were accepted after all candidates, some components remain disconnected.',
      'This completion check assumes cycle filtering was already performed. Merely counting arbitrary edges is insufficient: a cyclic selection could have n-1 edges yet leave another vertex isolated. Empty and singleton graphs have cost zero under this course’s convention.',
    ],
    signature: 'def completed_forest_cost(n, selected_weights):',
    prompt:
      'Implement completed_forest_cost(n, selected_weights). n>=0 and selected_weights are the costs of an already validated acyclic forest on those n vertices. Return the total cost if it is spanning, otherwise None. For n=0 the list is empty and the result is 0; one vertex also needs no edges. Preserve the list. Negative costs are allowed.',
    solution: `def completed_forest_cost(n, selected_weights):
    if len(selected_weights) != max(0, n - 1):
        return None
    return sum(selected_weights)`,
    tests: `assert completed_forest_cost(0, []) == 0
assert completed_forest_cost(1, []) == 0
assert completed_forest_cost(2, []) is None
assert completed_forest_cost(2, [0]) == 0
assert completed_forest_cost(4, [2, 3]) is None
assert completed_forest_cost(4, [-4, 1, 2]) == -1
source = [3, 5]
assert completed_forest_cost(3, source) == 8
assert source == [3, 5]`,
    call: 'print(completed_forest_cost(4, [2, 5, 1]))\nprint(completed_forest_cost(4, [2, 5]))',
    output: '8\nNone',
    questions: [
      [
        'How many accepted forest edges span 6 vertices?',
        ['6', '5', '12'],
        1,
        'An acyclic connected n-vertex tree has n-1 edges.',
        'One fewer edge than vertices.',
      ],
      [
        'Why is edge count alone insufficient for arbitrary selected edges?',
        [
          'Every edge has equal cost.',
          'Trees cannot have negative weights.',
          'The selection might contain a cycle and leave a vertex isolated.',
        ],
        2,
        'The n-1 rule requires an already acyclic forest.',
        'State the invariant supporting the completion test.',
      ],
      [
        'After scanning all candidates, an acyclic forest has fewer than n-1 edges. What does that mean?',
        [
          'The graph could not be spanned.',
          'It is automatically minimum and connected.',
          'The edge sum must be zero.',
        ],
        0,
        'The accepted components were not all joined.',
        'A disconnected input produces a forest.',
      ],
    ],
    cards: [
      [
        'When is an acyclic forest on n>0 vertices spanning?',
        'When it has n-1 accepted edges.',
      ],
      [
        'What does too few accepted edges mean after Kruskal’s scan?',
        'The input cannot connect all vertices; return the disconnected result.',
      ],
    ],
  }),
];
