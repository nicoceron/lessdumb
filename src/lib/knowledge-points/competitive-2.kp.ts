import { choose, predictOutput, type KnowledgePointModule } from './authoring';

/** Joins program lines so multi-line Python stays readable in source. */
const lines = (...source: string[]) => source.join('\n');

// Shared program fragments. Each question still prints a complete program.
const replayLoop = (commands: string) =>
  lines(
    'history = []',
    `for command in ${commands}:`,
    '    if command == "UNDO":',
    '        if history:',
    '            history.pop()',
    '    else:',
    '        history.append(command)',
  );

const countedReplay = (commands: string) =>
  lines(
    'history = []',
    'ignored = 0',
    `for command in ${commands}:`,
    '    if command == "UNDO":',
    '        if history:',
    '            history.pop()',
    '        else:',
    '            ignored += 1',
    '    else:',
    '        history.append(command)',
  );

const operationReplay = (commands: string) =>
  lines(
    `commands = ${commands}`,
    'history = []',
    'operations = 0',
    'for command in commands:',
    '    if command == "UNDO":',
    '        if history:',
    '            history.pop()',
    '            operations += 1',
    '    else:',
    '        history.append(command)',
    '        operations += 1',
  );

const nextGreater = (values: string) =>
  lines(
    `values = ${values}`,
    'answer = [None] * len(values)',
    'pending = []',
    'for index in range(len(values)):',
    '    while pending and values[pending[-1]] < values[index]:',
    '        answer[pending.pop()] = values[index]',
    '    pending.append(index)',
  );

const budgetScan = (values: string) =>
  lines(
    `values = ${values}`,
    'pending = []',
    'pops = 0',
    'for index in range(len(values)):',
    '    while pending and values[pending[-1]] < values[index]:',
    '        pending.pop()',
    '        pops += 1',
    '    pending.append(index)',
  );

const isMinHeap = lines(
  'def is_min_heap(values):',
  '    for child in range(1, len(values)):',
  '        parent = (child - 1) // 2',
  '        if values[parent] > values[child]:',
  '            return False',
  '    return True',
  '',
);

const hasPath = lines(
  'def has_path(root, text):',
  '    node = root',
  '    for letter in text:',
  '        if letter not in node:',
  '            return False',
  '        node = node[letter]',
  '    return True',
  '',
);

const containsWord = lines(
  'def contains_word(root, word):',
  '    node = root',
  '    for letter in word:',
  '        if letter not in node["children"]:',
  '            return False',
  '        node = node["children"][letter]',
  '    return node["end"]',
  '',
);

const insertWord = lines(
  'def insert(root, word):',
  '    node = root',
  '    for letter in word:',
  '        if letter not in node["children"]:',
  '            node["children"][letter] = {"end": False, "children": {}}',
  '        node = node["children"][letter]',
  '    node["end"] = True',
  '',
  'root = {"end": False, "children": {}}',
);

const prefixCount = lines(
  'def prefix_count(root, prefix):',
  '    node = root',
  '    for letter in prefix:',
  '        if letter not in node["children"]:',
  '            return 0',
  '        node = node["children"][letter]',
  '    return node["count"]',
  '',
);

const countingInsert = lines(
  'def insert(root, word):',
  '    node = root',
  '    node["count"] += 1',
  '    for letter in word:',
  '        if letter not in node["children"]:',
  '            node["children"][letter] = {"count": 0, "children": {}}',
  '        node = node["children"][letter]',
  '        node["count"] += 1',
  '',
  'root = {"count": 0, "children": {}}',
);

const trieBuilder = (words: string) =>
  lines(
    'root = {"end": False, "children": {}}',
    'created = 0',
    `for word in ${words}:`,
    '    node = root',
    '    for letter in word:',
    '        if letter not in node["children"]:',
    '            node["children"][letter] = {"end": False, "children": {}}',
    '            created += 1',
    '        node = node["children"][letter]',
    '    node["end"] = True',
  );

const wordTrie = (words: string) =>
  lines(
    'root = {"end": False, "children": {}}',
    `for word in ${words}:`,
    '    node = root',
    '    for letter in word:',
    '        if letter not in node["children"]:',
    '            node["children"][letter] = {"end": False, "children": {}}',
    '        node = node["children"][letter]',
    '    node["end"] = True',
    '',
    'def walk(text):',
    '    node = root',
    '    for letter in text:',
    '        if letter not in node["children"]:',
    '            return None',
    '        node = node["children"][letter]',
    '    return node',
    '',
  );

const countTrie = (words: string) =>
  lines(
    'root = {"count": 0, "children": {}}',
    `for word in ${words}:`,
    '    node = root',
    '    node["count"] += 1',
    '    for letter in word:',
    '        if letter not in node["children"]:',
    '            node["children"][letter] = {"count": 0, "children": {}}',
    '        node = node["children"][letter]',
    '        node["count"] += 1',
    '',
    'def starts_with(prefix):',
    '    node = root',
    '    for letter in prefix:',
    '        if letter not in node["children"]:',
    '            return 0',
    '        node = node["children"][letter]',
    '    return node["count"]',
    '',
  );

const baseAnswer = lines(
  'def base_answer(exponent):',
  '    if exponent == 0:',
  '        return 1',
  '    return None',
  '',
);

const halvingSteps = lines(
  'def halving_steps(exponent):',
  '    steps = 0',
  '    while exponent > 0:',
  '        exponent = exponent // 2',
  '        steps += 1',
  '    return steps',
  '',
);

const combinePower = lines(
  'def combine_power(base, exponent, half):',
  '    result = half * half',
  '    if exponent % 2 == 1:',
  '        result = result * base',
  '    return result',
  '',
);

const powerFunction = lines(
  'def power(base, exponent):',
  '    if exponent == 0:',
  '        return 1',
  '    half = power(base, exponent // 2)',
  '    result = half * half',
  '    if exponent % 2 == 1:',
  '        result = result * base',
  '    return result',
  '',
);

const tracedPower = lines(
  'def power(base, exponent):',
  '    if exponent == 0:',
  '        return 1',
  '    half = power(base, exponent // 2)',
  '    result = half * half',
  '    if exponent % 2 == 1:',
  '        result = result * base',
  '    print(exponent, result)',
  '    return result',
  '',
);

const callDepth = lines(
  'def depth(exponent):',
  '    if exponent == 0:',
  '        return 1',
  '    return 1 + depth(exponent // 2)',
  '',
);

const canComplete = lines(
  'def can_complete(n, start, chosen, k):',
  '    return k - chosen <= n - start',
  '',
);

const combinations = (save: string) =>
  lines(
    'def combinations(n, k):',
    '    result = []',
    '    path = []',
    '',
    '    def visit(start):',
    '        if len(path) == k:',
    `            result.append(${save})`,
    '            return',
    '        for index in range(start, n):',
    '            path.append(index)',
    '            visit(index + 1)',
    '            path.pop()',
    '',
    '    visit(0)',
    '    return result',
    '',
  );

const countVisits = lines(
  'def visits(n, k, prune):',
  '    count = [0]',
  '    path = []',
  '',
  '    def visit(start):',
  '        count[0] += 1',
  '        if len(path) == k:',
  '            return',
  '        stop = n',
  '        if prune:',
  '            stop = n - (k - len(path)) + 1',
  '        for index in range(start, stop):',
  '            path.append(index)',
  '            visit(index + 1)',
  '            path.pop()',
  '',
  '    visit(0)',
  '    return count[0]',
  '',
);

const insideBounds = lines(
  'def inside(key, lower, upper):',
  '    if lower is not None and key <= lower:',
  '        return False',
  '    if upper is not None and key >= upper:',
  '        return False',
  '    return True',
  '',
);

const searchBranch = lines(
  'def branch(key, target):',
  '    if target == key:',
  '        return "found"',
  '    if target < key:',
  '        return "left"',
  '    return "right"',
  '',
);

const improveFloor = lines(
  'def improve_floor(best, key, limit):',
  '    if key <= limit and (best is None or key > best):',
  '        return key',
  '    return best',
  '',
);

const sampleTree =
  'tree = (20, (10, (5, None, None), (15, None, None)), (30, None, (40, None, None)))';

const treeContains = lines(
  'def contains(node, target):',
  '    while node is not None:',
  '        key, left, right = node',
  '        if target == key:',
  '            return True',
  '        if target < key:',
  '            node = left',
  '        else:',
  '            node = right',
  '    return False',
  '',
);

const treeFloor = lines(
  'def floor(node, limit):',
  '    best = None',
  '    while node is not None:',
  '        key, left, right = node',
  '        if key <= limit:',
  '            best = key',
  '            node = right',
  '        else:',
  '            node = left',
  '    return best',
  '',
);

const searchSteps = lines(
  'def steps(node, target):',
  '    count = 0',
  '    while node is not None:',
  '        key, left, right = node',
  '        count += 1',
  '        if target == key:',
  '            return count',
  '        if target < key:',
  '            node = left',
  '        else:',
  '            node = right',
  '    return count',
  '',
);

const existingChildren = lines(
  'def existing_children(node):',
  '    if node is None:',
  '        return []',
  '    key, left, right = node',
  '    return [child for child in (left, right) if child is not None]',
  '',
);

const preorderLoop = (tree: string) =>
  lines(
    `tree = ${tree}`,
    'order = []',
    'stack = [tree]',
    'while stack:',
    '    key, left, right = stack.pop()',
    '    order.append(key)',
    '    if right is not None:',
    '        stack.append(right)',
    '    if left is not None:',
    '        stack.append(left)',
  );

const combineHeight = lines(
  'def combine_height(left_height, right_height):',
  '    return 1 + max(left_height, right_height)',
  '',
);

/** Iterative postorder over children lists; `onReady` runs after a size is set. */
const eventSizes = (children: string, onReady = '', onPop = '') =>
  lines(
    `children = ${children}`,
    'sizes = [0] * len(children)',
    'stack = [(0, False)]',
    ...(onPop ? ['events = 0'] : []),
    'while stack:',
    '    vertex, ready = stack.pop()',
    ...(onPop ? [`    ${onPop}`] : []),
    '    if ready:',
    '        total = 1',
    '        for child in children[vertex]:',
    '            total += sizes[child]',
    '        sizes[vertex] = total',
    ...(onReady ? [`        ${onReady}`] : []),
    '    else:',
    '        stack.append((vertex, True))',
    '        for child in children[vertex]:',
    '            stack.append((child, False))',
  );

export const knowledgePoints: KnowledgePointModule = {
  // ---------------------------------------------------------------- stacks
  'cp-stack-push': [
    {
      title: 'Push a value onto the right end',
      explanation: [
        'A list used as a stack keeps its oldest entry at the left and its newest at the right. Pushing calls append, which adds exactly one entry at the right end and leaves every earlier entry where it was.',
        'A push never replaces or merges an equal value: pushing "dry" twice records two separate actions.',
      ],
      example: {
        code: lines(
          'stack = ["wash", "dry"]',
          'stack.append("fold")',
          'stack.append("dry")',
          'print(stack)',
          'print(len(stack))',
        ),
        output: "['wash', 'dry', 'fold', 'dry']\n4",
        explanation:
          'Each append adds one entry at the right. The second "dry" is a new action, so the stack grows to four entries.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          lines(
            'stack = [3]',
            'stack.append(8)',
            'stack.append(3)',
            'print(stack)',
          ),
          ['[3, 8]', '[3, 3, 8]', '[3, 8, 3]', '[8, 3, 3]'],
          2,
          'Each append adds to the right end, and the repeated 3 is kept as its own entry.',
        ),
        choose(
          'The stack ["a", "b"] has "b" as its newest entry. Which list results from pushing "c"?',
          ['["c", "a", "b"]', '["a", "b", "c"]', '["a", "c"]', '["c", "b"]'],
          1,
          'A push appends at the newest end; the earlier entries keep their positions.',
        ),
        predictOutput(
          'What is printed?',
          lines(
            'moves = []',
            'for step in ["up", "up", "left"]:',
            '    moves.append(step)',
            'print(len(moves))',
            'print(moves)',
          ),
          [
            "3\n['up', 'up', 'left']",
            "2\n['up', 'left']",
            "3\n['left', 'up', 'up']",
            "1\n['left']",
          ],
          0,
          'Three pushes add three entries in arrival order; equal values are not merged.',
        ),
        choose(
          'Which statement pushes value onto a list stack whose newest entry is at the right end?',
          [
            'stack[-1] = value',
            'stack[0] = value',
            'stack = [value]',
            'stack.append(value)',
          ],
          3,
          'append adds a new rightmost entry; the other statements overwrite an entry or discard the stack.',
        ),
      ],
    },
    {
      title: 'Push onto a copy when the caller keeps the original',
      explanation: [
        'A function that promises a new stack must not change the list it was given. Writing result = stack only creates a second name for the same list, so appending through either name changes both.',
        'stack.copy() makes a separate list with the same entries. Appending to the copy leaves the caller’s stack exactly as it was.',
      ],
      example: {
        code: lines(
          'def push_entry(stack, value):',
          '    result = stack.copy()',
          '    result.append(value)',
          '    return result',
          '',
          'before = [1, 2]',
          'after = push_entry(before, 5)',
          'print(before)',
          'print(after)',
        ),
        output: '[1, 2]\n[1, 2, 5]',
        explanation:
          'The append changes only the copy, so before keeps two entries while after has the new top 5.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          lines(
            'def push_entry(stack, value):',
            '    result = stack',
            '    result.append(value)',
            '    return result',
            '',
            'history = ["a"]',
            'newer = push_entry(history, "b")',
            'print(history)',
          ),
          ["['a']", "['a', 'b']", "['b']", "['b', 'a']"],
          1,
          'result is another name for history, so the append changes the caller’s list too.',
        ),
        predictOutput(
          'What is printed?',
          lines(
            'def push_entry(stack, value):',
            '    result = stack.copy()',
            '    result.append(value)',
            '    return result',
            '',
            'base = [4]',
            'first = push_entry(base, 4)',
            'second = push_entry(base, 9)',
            'print(first)',
            'print(second)',
          ),
          [
            '[4, 4]\n[4, 4, 9]',
            '[4]\n[4, 9]',
            '[4, 9]\n[4, 9]',
            '[4, 4]\n[4, 9]',
          ],
          3,
          'Each call copies the unchanged base [4] before appending, so the two results are independent.',
        ),
        choose(
          'push_entry must return a new stack and leave its argument unchanged. Which first line inside it makes that possible?',
          [
            'result = stack.copy()',
            'result = stack',
            'result = []',
            'result = stack[-1]',
          ],
          0,
          'copy() keeps every existing entry in a separate list; plain assignment aliases, and [] loses the history.',
        ),
        choose(
          'What should push_entry([7, 7], 7) return?',
          ['[7]', '[7, 7]', '[7, 7, 7]', '[7, 7, 7, 7]'],
          2,
          'One push adds exactly one entry; repeated values are separate entries, not merged.',
        ),
      ],
    },
  ],
  'cp-stack-peek': [
    {
      title: 'Read the newest entry with stack[-1]',
      explanation: [
        'Peeking reads the top of the stack without removing it. With the newest entry at the right end of a list, that entry is stack[-1].',
        'Reading an index changes nothing, so peeking twice gives the same value and the stack keeps its length.',
      ],
      example: {
        code: lines(
          'stack = [4, 9, 2]',
          'top = stack[-1]',
          'print(top)',
          'print(stack)',
        ),
        output: '2\n[4, 9, 2]',
        explanation:
          'Index -1 names the rightmost entry, 2. The list is unchanged after the read.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          lines(
            'stack = ["x", "y", "z"]',
            'print(stack[-1])',
            'print(len(stack))',
          ),
          ['x\n3', 'z\n3', 'z\n2', 'y\n3'],
          1,
          'stack[-1] is the newest entry z, and reading it leaves all three entries in place.',
        ),
        predictOutput(
          'What is printed?',
          lines(
            'stack = [5]',
            'stack.append(1)',
            'stack.append(8)',
            'print(stack[-1])',
            'print(stack[0])',
          ),
          ['8\n5', '5\n8', '8\n1', '1\n5'],
          0,
          '8 was pushed last, so it is at index -1; the oldest entry 5 stays at index 0.',
        ),
        choose(
          'Which expression reads a list stack’s newest entry without changing the list?',
          ['stack.pop()', 'stack[0]', 'stack[len(stack)]', 'stack[-1]'],
          3,
          'stack[-1] only reads the rightmost entry; pop() removes it, stack[0] is the oldest, and stack[len(stack)] is out of range.',
        ),
        predictOutput(
          'What does this program print?',
          lines(
            'stack = [3, 6]',
            'first = stack[-1]',
            'second = stack[-1]',
            'print(first, second, len(stack))',
          ),
          ['6 3 0', '3 3 2', '6 6 2', '6 3 1'],
          2,
          'Peeking does not remove anything, so both reads see 6 and the length stays 2.',
        ),
      ],
    },
    {
      title: 'Check for an empty stack before peeking',
      explanation: [
        'An empty stack has no top, and [][-1] raises IndexError. Test the stack first with if not stack: and return the contract’s empty result, such as None.',
        'Keep that empty result distinct from real entries. A stack whose top is 0 is not empty, so test the list itself rather than the value at its top.',
      ],
      example: {
        code: lines(
          'def peek_entry(stack):',
          '    if not stack:',
          '        return None',
          '    return stack[-1]',
          '',
          'print(peek_entry([0]))',
          'print(peek_entry([]))',
        ),
        output: '0\nNone',
        explanation:
          '[0] is nonempty, so its real top 0 is returned. Only the empty list reaches return None.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          lines(
            'def peek_entry(stack):',
            '    if not stack:',
            '        return None',
            '    return stack[-1]',
            '',
            'print(peek_entry([5, 0]))',
            'print(peek_entry([]))',
          ),
          ['0\nNone', '5\nNone', 'None\nNone', '0\n0'],
          0,
          'The first stack is nonempty, so its top 0 is returned; only the empty list gives None.',
        ),
        choose(
          'What happens when a program evaluates [][-1]?',
          [
            'It returns None',
            'It returns 0',
            'It raises IndexError',
            'It returns []',
          ],
          2,
          'An empty list has no index -1, so Python raises IndexError; the emptiness check must come first.',
        ),
        choose(
          'Which test correctly decides that a list stack has no top?',
          [
            'if stack[-1] is None:',
            'if not stack:',
            'if stack[-1] == 0:',
            'if len(stack) == 1:',
          ],
          1,
          'An empty list is falsy. The other tests index an empty list or mistake a real entry for emptiness.',
        ),
        predictOutput(
          'What is printed?',
          lines(
            'def peek_or(stack, default):',
            '    if not stack:',
            '        return default',
            '    return stack[-1]',
            '',
            'print(peek_or([], -1))',
            'print(peek_or([-1, 4], 0))',
          ),
          ['0\n4', '-1\n-1', 'None\n4', '-1\n4'],
          3,
          'The empty stack returns the supplied default -1; the nonempty stack returns its top 4.',
        ),
      ],
    },
  ],
  'cp-stack-pop': [
    {
      title: 'Pop removes the newest entry',
      explanation: [
        'pop() removes the rightmost entry and returns it. Every earlier entry keeps its order, so the entry pushed last is the first to leave: last in, first out.',
        'Each pop removes exactly one entry, even when equal values sit beneath it.',
      ],
      example: {
        code: lines(
          'stack = ["open", "type", "save"]',
          'last = stack.pop()',
          'print(last)',
          'print(stack)',
        ),
        output: "save\n['open', 'type']",
        explanation:
          'save was pushed last, so pop() removes and returns it; open and type stay in order.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          lines(
            'stack = [1, 2, 3]',
            'stack.pop()',
            'stack.append(9)',
            'print(stack)',
          ),
          ['[1, 2, 3, 9]', '[2, 3, 9]', '[1, 2, 9]', '[9, 1, 2]'],
          2,
          'pop() removes 3 from the right end, then append puts 9 in that position.',
        ),
        predictOutput(
          'What is printed?',
          lines(
            'stack = ["a", "b", "c"]',
            'print(stack.pop())',
            'print(stack.pop())',
          ),
          ['c\nb', 'a\nb', 'c\nc', 'b\na'],
          0,
          'Each pop removes the current newest entry: first c, then b.',
        ),
        choose(
          'Values were pushed in the order 4, 7, 1. In what order do three pops return them?',
          ['4, 7, 1', '7, 1, 4', '1, 4, 7', '1, 7, 4'],
          3,
          'Last in, first out: 1 leaves first, then 7, then 4.',
        ),
        predictOutput(
          'What does this program print?',
          lines(
            'stack = [6, 6, 2]',
            'stack.pop()',
            'stack.pop()',
            'print(stack)',
          ),
          ['[]', '[6]', '[6, 6]', '[2]'],
          1,
          'The first pop removes 2 and the second removes one 6; the bottom 6 remains.',
        ),
      ],
    },
    {
      title: 'Undo only when an entry exists',
      explanation: [
        'Calling pop() on an empty list raises IndexError. When an undo with nothing to undo should be ignored, pop only inside if stack:.',
        'If the function returns a new remainder, copy first and pop the copy. The caller’s history then stays intact.',
      ],
      example: {
        code: lines(
          'def undo_one(stack):',
          '    result = stack.copy()',
          '    if result:',
          '        result.pop()',
          '    return result',
          '',
          'print(undo_one([3, 8]))',
          'print(undo_one([]))',
        ),
        output: '[3]\n[]',
        explanation:
          'The nonempty copy loses its top 8. The empty copy fails the check and is returned unchanged instead of raising.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          lines(
            'def undo_one(stack):',
            '    result = stack.copy()',
            '    if result:',
            '        result.pop()',
            '    return result',
            '',
            'steps = ["cut"]',
            'once = undo_one(steps)',
            'twice = undo_one(once)',
            'print(once, twice, steps)',
          ),
          [
            '[] [] []',
            "['cut'] [] ['cut']",
            "[] [] ['cut']",
            "[] None ['cut']",
          ],
          2,
          'The first undo empties a copy; the second sees an empty list and returns it. steps itself is never changed.',
        ),
        choose(
          'Which statement ignores an undo when there is nothing to remove?',
          [
            'if stack: stack.pop()',
            'if not stack: stack.pop()',
            'while stack: stack.pop()',
            'stack.pop() or None',
          ],
          0,
          'It pops only a nonempty stack. The second pops only an empty one, the loop removes every entry, and the last still pops an empty list.',
        ),
        predictOutput(
          'What is printed?',
          lines(
            'stack = [1, 2]',
            'removed = 0',
            'for _ in range(4):',
            '    if stack:',
            '        stack.pop()',
            '        removed += 1',
            'print(removed, stack)',
          ),
          ['4 []', '3 []', '2 [1]', '2 []'],
          3,
          'Only two entries exist; the last two undos find an empty stack and are skipped.',
        ),
        choose(
          'undo_one([]) must ignore the undo. What should it return?',
          ['None', '[None]', '[]', '[0]'],
          2,
          'Ignoring the undo means the remainder is the same empty stack, not a placeholder value.',
        ),
      ],
    },
  ],
  'cp-stacks': [
    {
      title: 'Replay commands so undo removes the latest action',
      explanation: [
        'An undo history is a stack: each ordinary command is pushed, and UNDO pops the most recent action that is still active. After every command, the stack holds exactly the active actions in the order they were made.',
        'Trace a command list by keeping the stack on paper. An undo never reaches past the top, so older actions survive until everything newer has been undone.',
      ],
      example: {
        code: lines(
          replayLoop(
            '["red", "blue", "UNDO", "green", "UNDO", "UNDO", "black"]',
          ),
          'print(history)',
        ),
        output: "['black']",
        explanation:
          'blue is undone first, then green, then red. black is the only action still active.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          lines(
            replayLoop('["a", "b", "c", "UNDO", "UNDO", "d"]'),
            'print(history)',
          ),
          ["['c', 'd']", "['a', 'b', 'd']", "['a', 'd']", "['d']"],
          2,
          'The two undos remove c and then b, the newest active actions; d is pushed onto the remaining a.',
        ),
        predictOutput(
          'What is printed?',
          lines(
            replayLoop('["x", "y", "UNDO", "z", "UNDO"]'),
            'print(history)',
            'print(len(history))',
          ),
          ["['x']\n1", "['y']\n1", "['x', 'z']\n2", '[]\n0'],
          0,
          'Each undo removes the action pushed just before it, y and then z, leaving only x.',
        ),
        choose(
          'Active actions are ["draft", "review"], oldest first. If undo removed from the front like a queue, what would wrongly remain?',
          ['["draft"]', '[]', '["review"]', '["draft", "review"]'],
          2,
          'A front removal deletes draft, the oldest action, instead of the latest action review.',
        ),
        predictOutput(
          'What does this program print?',
          lines(
            replayLoop('["cut", "paste", "UNDO", "bold"]'),
            'print(len(history))',
            'print(history[-1])',
          ),
          ['3\nbold', '2\nbold', '2\npaste', '1\nbold'],
          1,
          'The undo removes paste, so the active actions are cut and bold, with bold on top.',
        ),
      ],
    },
    {
      title: 'Ignore an undo when no action is active',
      explanation: [
        'An undo can arrive before any action or after every action has been undone. Decide the rule before coding; here such an undo is ignored, and the program counts how often that happens.',
        'The check if history: must come before pop(), because popping an empty list raises IndexError. Tests should include an undo as the very first command.',
      ],
      example: {
        code: lines(
          countedReplay('["UNDO", "plant", "UNDO", "UNDO", "water"]'),
          'print(history)',
          'print(ignored)',
        ),
        output: "['water']\n2",
        explanation:
          'The first undo and the third find an empty history and are ignored; plant is undone, and water is the only active action.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          lines(
            countedReplay('["a", "UNDO", "UNDO", "b", "UNDO", "UNDO"]'),
            'print(history, ignored)',
          ),
          ['[] 3', "['b'] 2", '[] 1', '[] 2'],
          3,
          'a and b are each undone once; the undo right after each of those finds nothing, so two are ignored.',
        ),
        choose(
          'The if history: check is deleted and the first command is UNDO. What happens?',
          [
            'pop() returns None and the loop continues',
            'pop() raises IndexError on the empty list',
            'The next push is cancelled instead',
            'The UNDO is skipped automatically',
          ],
          1,
          'Popping an empty list is an error in Python; nothing skips it unless the program checks first.',
        ),
        choose(
          'An undo with nothing active must be ignored. Which test input exposes a program that forgot that rule?',
          [
            '["a", "UNDO"]',
            '["a", "b"]',
            '["UNDO", "a"]',
            '["a", "b", "UNDO"]',
          ],
          2,
          'Only that input undoes while the history is empty; the others always have an action to remove.',
        ),
        predictOutput(
          'This history must never lose its base entry. What is printed?',
          lines(
            'history = ["base"]',
            'for command in ["UNDO", "UNDO", "top"]:',
            '    if command == "UNDO":',
            '        if len(history) > 1:',
            '            history.pop()',
            '    else:',
            '        history.append(command)',
            'print(history)',
          ),
          ["['top']", "['base', 'top']", "['base']", "['base', 'base', 'top']"],
          1,
          'The check refuses to pop the last remaining entry, so both undos are ignored and top is pushed onto base.',
        ),
      ],
    },
    {
      title: 'Bound the replay at one stack operation per command',
      explanation: [
        'Each command causes at most one push or one pop, and both work at the right end of the list in amortized O(1) time. Replaying n commands therefore takes O(n) time.',
        'The history can hold up to n entries when no undo occurs, so it needs O(n) space. Removing from the front with pop(0) would instead shift every remaining entry and undo the wrong action.',
      ],
      example: {
        code: lines(
          operationReplay('["a", "b", "UNDO", "c", "UNDO", "UNDO", "UNDO"]'),
          'print(len(commands), operations)',
        ),
        output: '7 6',
        explanation:
          'Six commands each did one end operation and the last undo found nothing, so the work never exceeds the number of commands.',
      },
      questions: [
        choose(
          'A replay processes n commands, each a push or a checked undo. What is its total running time?',
          ['O(n log n)', 'O(n²)', 'O(n)', 'O(log n)'],
          2,
          'Every command does constant work at the list’s right end, so the total is linear.',
        ),
        choose(
          'Why should undo call history.pop() rather than history.pop(0) on a list kept oldest first?',
          [
            'pop(0) removes the oldest action and shifts the rest',
            'pop(0) raises an error on every list',
            'pop() sorts the remaining history first',
            'pop(0) is faster on long histories',
          ],
          0,
          'Index 0 holds the oldest action, and removing it moves every later entry; pop() removes the newest in amortized O(1).',
        ),
        choose(
          'At most how many entries can the history hold after n commands?',
          ['1', 'n / 2', 'n²', 'n'],
          3,
          'If no command is an undo, every command adds one entry, so the stack needs O(n) space.',
        ),
        predictOutput(
          'How many stack operations does this replay perform?',
          lines(
            operationReplay('["x", "UNDO", "UNDO", "y", "z", "UNDO"]'),
            'print(operations, len(history))',
          ),
          ['6 1', '5 1', '5 2', '3 1'],
          1,
          'Three pushes and two successful pops make five operations; the ignored undo costs no stack work, leaving y.',
        ),
      ],
    },
  ],
  // ------------------------------------------------------ monotonic stack
  'cp-pending-indices': [
    {
      title: 'Store indices, not values, for answers still owed',
      explanation: [
        'When a scan must later write an answer for an earlier position, the pending stack stores that position’s index. values[index] recovers the measurement, and answer[index] is where the result goes.',
        'A stack of bare values cannot tell where an answer belongs, especially when two positions hold the same value.',
      ],
      example: {
        code: lines(
          'values = [6, 2, 6, 1]',
          'pending = [0, 2, 3]',
          'print([values[index] for index in pending])',
        ),
        output: '[6, 6, 1]',
        explanation:
          'Indices 0 and 2 both hold 6, yet they remain separate pending positions with separate answer slots.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          lines(
            'values = [4, 9, 2]',
            'pending = [0, 2]',
            'print([values[index] for index in pending])',
          ),
          ['[0, 2]', '[4, 9]', '[9, 2]', '[4, 2]'],
          3,
          'Each stored index is looked up in values: index 0 gives 4 and index 2 gives 2.',
        ),
        choose(
          'values = [5, 5]. Can indices 0 and 1 both be pending at once?',
          [
            'No, equal values share one entry',
            'Yes, each has its own answer slot',
            'Only index 1, the newer one',
            'Only index 0, the older one',
          ],
          1,
          'Pending entries are positions; equal measurements at different positions still need separate answers.',
        ),
        predictOutput(
          'What is printed?',
          lines(
            'values = [7, 3, 7]',
            'answer = [None, None, None]',
            'pending = [0, 1]',
            'answer[pending.pop()] = 10',
            'print(answer)',
          ),
          [
            '[10, None, None]',
            '[None, None, 10]',
            '[None, 10, None]',
            '[10, 10, None]',
          ],
          2,
          'pop() removes index 1, the newest pending position, so the answer is written into slot 1.',
        ),
        choose(
          'A pending stack stores values instead of indices. What can the scan no longer do?',
          [
            'Write each answer into its original slot',
            'Compare pending values with the current value',
            'Push a new entry onto the stack',
            'Pop the newest pending entry',
          ],
          0,
          'Values still compare, push and pop normally, but without the index there is no way to know which answer slot to fill.',
        ),
      ],
    },
    {
      title: 'Read pending values in stack order',
      explanation: [
        '[values[index] for index in pending] lists the pending measurements in the same order as the stack, from bottom to top. Repeated values stay in the result, one per index.',
        'Because a left-to-right scan pushes each index when it reaches it, and pops only from the top, the indices on the stack increase from bottom to top. The top is always the most recently scanned pending position.',
      ],
      example: {
        code: lines(
          'def pending_values(values, pending):',
          '    return [values[index] for index in pending]',
          '',
          'print(pending_values([8, 1, 5, 1], [0, 2, 3]))',
          'print(pending_values([8, 1, 5, 1], []))',
        ),
        output: '[8, 5, 1]\n[]',
        explanation:
          'The comprehension visits indices 0, 2 and 3 in stack order and reads their values. An empty stack has no pending values.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          lines(
            'def pending_values(values, pending):',
            '    return [values[index] for index in pending]',
            '',
            'print(pending_values([3, 9, 4, 9], [1, 3]))',
          ),
          ['[9]', '[1, 3]', '[9, 9]', '[3, 4]'],
          2,
          'Both pending positions hold 9; the comprehension keeps one value per index, so 9 appears twice.',
        ),
        predictOutput(
          'What is printed?',
          lines(
            'values = [2, 6, 1]',
            'pending = []',
            'for index in range(len(values)):',
            '    pending.append(index)',
            'print(pending[-1], values[pending[-1]])',
          ),
          ['1 2', '2 1', '0 2', '2 6'],
          1,
          'The scan pushes indices 0, 1, 2 in order, so the top is index 2, whose value is 1.',
        ),
        choose(
          'A left-to-right scan pushes each index when it reaches it and pops only from the top. How are the indices on the stack arranged?',
          [
            'Increasing from bottom to top',
            'Decreasing from bottom to top',
            'In order of their values',
            'In no particular order',
          ],
          0,
          'Later indices are pushed later and removals happen only at the top, so the remaining indices stay increasing.',
        ),
        predictOutput(
          'What does this program print?',
          lines(
            'def pending_values(values, pending):',
            '    return [values[index] for index in pending]',
            '',
            'print(pending_values(["a", "b", "c"], [0, 2]))',
          ),
          ["['a', 'b', 'c']", '[0, 2]', "['b']", "['a', 'c']"],
          3,
          'Index 0 reads "a" and index 2 reads "c"; index 1 is not pending, so "b" is skipped.',
        ),
      ],
    },
  ],
  'cp-strict-stack-pop': [
    {
      title: 'Pop while the top is strictly smaller',
      explanation: [
        'Pending values sit on the stack in nonincreasing order from bottom to top. A new value current resolves entries from the top: while the stack is nonempty and values[pending[-1]] < current, pop.',
        'The loop stops at the first top that is at least current. Every entry below it is at least as large, so none of them could be resolved either.',
      ],
      example: {
        code: lines(
          'values = [9, 6, 3, 1]',
          'pending = [0, 1, 2, 3]',
          'current = 5',
          'popped = []',
          'while pending and values[pending[-1]] < current:',
          '    popped.append(pending.pop())',
          'print(popped)',
          'print(pending)',
        ),
        output: '[3, 2]\n[0, 1]',
        explanation:
          'Values 1 and 3 are below 5 and leave from the top. The top value 6 is not smaller, so the loop stops before it.',
      },
      questions: [
        predictOutput(
          'Which values are popped, in order?',
          lines(
            'values = [9, 6, 3]',
            'pending = [0, 1, 2]',
            'popped = []',
            'while pending and values[pending[-1]] < 7:',
            '    popped.append(values[pending.pop()])',
            'print(popped)',
          ),
          ['[9, 6]', '[3]', '[6, 3]', '[3, 6]'],
          3,
          'The top 3 leaves first, then 6; 9 is not below 7, so popping stops.',
        ),
        choose(
          'The stack’s top value is 8 and current is 5. What does the loop do?',
          [
            'Stops without popping',
            'Pops 8 and keeps checking',
            'Pops every entry below 8',
            'Pushes 5 under 8',
          ],
          0,
          'The top is not smaller than 5, and the stack is nonincreasing, so nothing below can be smaller.',
        ),
        predictOutput(
          'What is printed?',
          lines(
            'values = [4, 2, 2]',
            'pending = [0, 1, 2]',
            'while pending and values[pending[-1]] < 3:',
            '    pending.pop()',
            'print(pending)',
          ),
          ['[0, 1]', '[]', '[0]', '[0, 1, 2]'],
          2,
          'Both 2s are below 3 and are popped; 4 is not, so only index 0 remains.',
        ),
        predictOutput(
          'What does this program print?',
          lines(
            'values = [5, 2]',
            'pending = [0, 1]',
            'count = 0',
            'while pending and values[pending[-1]] < 10:',
            '    pending.pop()',
            '    count += 1',
            'print(count, pending)',
          ),
          ['1 [0]', '2 []', '2 [0]', '0 [0, 1]'],
          1,
          'Both values are below 10, so both entries pop; the pending check then stops the loop on the empty stack.',
        ),
      ],
    },
    {
      title: 'Leave equal values pending',
      explanation: [
        'For a strictly greater answer, an equal value is not an answer. The popping test must be old < current; using <= would resolve equal entries with a value that is not larger.',
        'The emptiness check must come first in the condition: pending and values[pending[-1]] < current. Because and stops at a false left side, an empty stack is never indexed.',
      ],
      example: {
        code: lines(
          'values = [8, 4, 4, 1]',
          'pending = [0, 1, 2, 3]',
          'while pending and values[pending[-1]] < 4:',
          '    pending.pop()',
          'print(pending)',
        ),
        output: '[0, 1, 2]',
        explanation:
          'Only the 1 is strictly below 4. Both 4s stay pending because 4 < 4 is false.',
      },
      questions: [
        predictOutput(
          'This loop uses <= instead of <. What does it print?',
          lines(
            'values = [8, 4, 4, 1]',
            'pending = [0, 1, 2, 3]',
            'while pending and values[pending[-1]] <= 4:',
            '    pending.pop()',
            'print(pending)',
          ),
          ['[0, 1, 2]', '[0]', '[0, 1]', '[]'],
          1,
          'With <=, both equal 4s also pop, wrongly treating 4 as greater than 4.',
        ),
        choose(
          'Each answer must be the first strictly greater value. Which loop condition is correct?',
          [
            'while values[pending[-1]] < current and pending:',
            'while pending and values[pending[-1]] <= current:',
            'while pending and values[pending[-1]] > current:',
            'while pending and values[pending[-1]] < current:',
          ],
          3,
          'It checks emptiness before indexing and pops only strictly smaller values.',
        ),
        choose(
          'Why must pending appear before values[pending[-1]] in the condition?',
          [
            'and skips the comparison when the stack is empty',
            'Python evaluates and from right to left',
            'An empty list compares as smaller',
            'It makes the loop run at least once',
          ],
          0,
          'and stops at a false left operand, so an empty stack is never indexed.',
        ),
        predictOutput(
          'What is printed?',
          lines(
            'values = [3, 3, 3]',
            'pending = [0, 1]',
            'while pending and values[pending[-1]] < values[2]:',
            '    pending.pop()',
            'pending.append(2)',
            'print(pending)',
          ),
          ['[2]', '[0, 2]', '[0, 1, 2]', '[1, 2]'],
          2,
          'No pending 3 is strictly below the new 3, so nothing pops and index 2 joins the stack.',
        ),
      ],
    },
  ],
  'cp-stack-operation-budget': [
    {
      title: 'Charge each pop to the index it removes',
      explanation: [
        'A while loop inside a for loop looks quadratic, but in a one-pass monotonic scan every index is pushed once. Once popped, it is never pushed again, so it can be popped at most once.',
        'Count the work by index rather than by loop iteration: n pushes plus p pops, where p ≤ n. The total is at most 2n.',
      ],
      example: {
        code: lines(
          budgetScan('[3, 1, 2, 5, 4]'),
          'print(len(values), pops, len(values) + pops)',
        ),
        output: '5 3 8',
        explanation:
          'Five indices are pushed once each, and three of them are later popped once each: eight stack operations, below 2 × 5.',
      },
      questions: [
        choose(
          'How many times can a single index be popped during one left-to-right monotonic scan?',
          [
            'At most once',
            'Once per later value',
            'Exactly n times',
            'Once per loop iteration',
          ],
          0,
          'An index is pushed only when the scan reaches it, so after one pop it is gone for good.',
        ),
        choose(
          'A scan over 6 values performs 4 pops in total. How many push and pop operations happened altogether?',
          ['6', '10', '24', '36'],
          1,
          'Each of the 6 indices is pushed once, and 4 pops are added: 6 + 4 = 10.',
        ),
        predictOutput(
          'How many pops does this scan make?',
          lines(budgetScan('[1, 2, 3, 4]'), 'print(len(values), pops)'),
          ['4 6', '4 0', '4 3', '4 4'],
          2,
          'Each new value pops only the single previous index, so there are three pops, not 1 + 2 + 3.',
        ),
        choose(
          'Why is the nested while loop not O(n²) in total?',
          [
            'The while loop runs at most once per value',
            'The values must already be sorted',
            'Python stops nested loops after n steps',
            'Total pops cannot exceed total pushes, which is n',
          ],
          3,
          'One value may pop many entries, but each entry was pushed once, so all pops together are at most n.',
        ),
      ],
    },
    {
      title: 'Relate pushes, pops and what remains',
      explanation: [
        'Every pushed index is either popped later or still pending at the end. With n pushes and p pops, exactly n − p indices remain on the stack.',
        'Those remaining indices never met a value that resolved them. Checking pushes − pops against the final stack length is a quick way to verify a trace.',
      ],
      example: {
        code: lines(
          budgetScan('[6, 1, 4, 4, 2]'),
          'print(len(values), pops, len(pending))',
        ),
        output: '5 1 4',
        explanation:
          'Only the 1 is ever resolved. Five pushes minus one pop leaves four pending indices, including both 4s.',
      },
      questions: [
        choose(
          'A scan pushes 8 indices and pops 5 of them. How many indices are still pending at the end?',
          ['13', '5', '8', '3'],
          3,
          'Every push not matched by a pop remains: 8 − 5 = 3.',
        ),
        predictOutput(
          'What does this program print?',
          lines(budgetScan('[2, 2, 2]'), 'print(pops, len(pending))'),
          ['2 1', '0 3', '3 0', '1 2'],
          1,
          'Equal values never pop each other under <, so all three indices stay pending.',
        ),
        predictOutput(
          'What is printed?',
          lines(budgetScan('[9, 7, 8, 1, 10]'), 'print(pops, len(pending))'),
          ['4 1', '3 2', '5 0', '4 0'],
          0,
          '8 resolves 7, and 10 resolves 1, 8 and 9; four pops leave only index 4 pending.',
        ),
        choose(
          'At the end of a scan the stack holds 2 indices, and 7 pops happened. How many values were scanned?',
          ['5', '7', '9', '14'],
          2,
          'Each scanned index is pushed once, so n = pops + remaining = 7 + 2 = 9.',
        ),
      ],
    },
  ],
  'cp-monotonic-stack': [
    {
      title: 'Find each first strictly greater value to the right',
      explanation: [
        'Scan left to right, keeping indices whose answer is unknown. When the current value is strictly greater than the value at the top index, it is that index’s answer: pop the index and write the value into its slot. Then push the current index.',
        'An index popped by current gets current as its first greater value because every value between them was not greater; otherwise that value would already have popped it.',
      ],
      example: {
        code: lines(nextGreater('[2, 7, 3, 1, 5]'), 'print(answer)'),
        output: '[7, None, 5, 5, None]',
        explanation:
          '7 resolves index 0 at once. 5 resolves the 1 and then the 3 but not 7, so 7 and the final 5 have no greater value to their right.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          lines(nextGreater('[3, 3, 5]'), 'print(answer)'),
          ['[3, 5, None]', '[5, None, None]', '[5, 5, 5]', '[5, 5, None]'],
          3,
          'The equal 3 does not resolve the first 3; 5 later resolves both.',
        ),
        predictOutput(
          'What is printed?',
          lines(nextGreater('[1, 4, 2, 6]'), 'print(answer)'),
          [
            '[4, 6, 6, None]',
            '[4, 2, 6, None]',
            '[4, 6, 6, 6]',
            '[2, 6, 6, None]',
          ],
          0,
          '4 answers index 0 immediately; 6 later answers both 2 and 4, which were waiting on the stack.',
        ),
        choose(
          'For [6, 1, 2, 9], why is 9 the answer for index 0 even though 1 and 2 come first?',
          [
            '9 is the largest value in the list',
            'Neither 1 nor 2 is greater than 6',
            'Index 0 is always popped last',
            'The stack is sorted before the scan',
          ],
          1,
          'The answer is the first later value above 6; 1 and 2 fail that test, so index 0 waits until 9.',
        ),
        predictOutput(
          'Which indices are still pending after the scan?',
          lines(nextGreater('[5, 3, 4, 1]'), 'print(pending)'),
          ['[3]', '[0, 2, 3]', '[0, 1, 2, 3]', '[0, 3]'],
          1,
          'Only index 1 is resolved (by 4). Indices 0, 2 and 3 never see a greater value later.',
        ),
      ],
    },
    {
      title: 'Keep the pending values nonincreasing',
      explanation: [
        'After each step, the values at the pending indices are nonincreasing from bottom to top. A new value removes every smaller top before it is pushed, so it never sits above something smaller than itself.',
        'Indices still on the stack after the scan have no strictly greater value to their right, so their answer stays None. Equal values remain pending together.',
      ],
      example: {
        code: lines(
          'values = [8, 3, 5, 5, 2]',
          'pending = []',
          'for index in range(len(values)):',
          '    while pending and values[pending[-1]] < values[index]:',
          '        pending.pop()',
          '    pending.append(index)',
          '    print([values[i] for i in pending])',
        ),
        output: '[8]\n[8, 3]\n[8, 5]\n[8, 5, 5]\n[8, 5, 5, 2]',
        explanation:
          'Each printed stack is nonincreasing. The first 5 removes the smaller 3, but the second 5 stays above the first because it is not strictly greater.',
      },
      questions: [
        choose(
          'Pending values are [9, 6, 6, 2] from bottom to top, and 6 arrives. What are the pending values after it is pushed?',
          ['[9, 6, 6, 6]', '[9, 6]', '[9, 6, 6, 2, 6]', '[6]'],
          0,
          '6 removes the smaller 2, stops at the equal 6, and then joins the stack.',
        ),
        predictOutput(
          'Which values are still pending at the end?',
          lines(
            'values = [1, 5, 2, 4, 3]',
            'pending = []',
            'for index in range(len(values)):',
            '    while pending and values[pending[-1]] < values[index]:',
            '        pending.pop()',
            '    pending.append(index)',
            'print([values[i] for i in pending])',
          ),
          ['[1, 5, 2, 4, 3]', '[5, 4, 3]', '[3]', '[5, 3]'],
          1,
          'Every value that later met a larger one was popped; 5, 4 and 3 never did.',
        ),
        choose(
          'Which pending stack, listed bottom to top by value, can never occur in this scan?',
          ['[7, 7, 1]', '[9, 4, 2]', '[3, 8]', '[5]'],
          2,
          '8 would have popped the smaller 3 before being pushed, so a smaller value never sits below a larger one.',
        ),
        predictOutput(
          'What does this program print?',
          lines(nextGreater('[2, 2, 2]'), 'print(answer)'),
          [
            '[2, 2, None]',
            '[2, 2, 2]',
            '[None, None, 2]',
            '[None, None, None]',
          ],
          3,
          'No value is strictly greater than an equal 2, so every index stays pending and keeps None.',
        ),
      ],
    },
    {
      title: 'Count the scan as linear work',
      explanation: [
        'Each index is pushed once and popped at most once, so the whole scan does at most 2n stack operations: O(n) time. The answer list and the stack use O(n) space.',
        'Checking every later value for every index would take O(n²) comparisons. The stack avoids that because a resolved index is never examined again.',
      ],
      example: {
        code: lines(
          'values = [5, 4, 3, 2, 1, 6]',
          'pending = []',
          'operations = 0',
          'for index in range(len(values)):',
          '    while pending and values[pending[-1]] < values[index]:',
          '        pending.pop()',
          '        operations += 1',
          '    pending.append(index)',
          '    operations += 1',
          'print(operations)',
        ),
        output: '11',
        explanation:
          'Six pushes and five pops make 11 operations, within 2 × 6, even though the final 6 alone pops five entries.',
      },
      questions: [
        choose(
          'What is the running time of the monotonic-stack scan over n values?',
          ['O(n²)', 'O(n log n)', 'O(n)', 'O(log n)'],
          2,
          'At most n pushes and n pops happen in total, so the scan is linear.',
        ),
        choose(
          'The last value of a 1,000-value list pops 999 entries in one step. Why is the scan still linear overall?',
          [
            'Those entries were each pushed once and leave only once',
            'One step can never pop more than two entries',
            'Python runs the while loop in constant time',
            'The list must have been sorted beforehand',
          ],
          0,
          'The 999 pops are paid for by 999 earlier pushes; no index can be popped again later.',
        ),
        choose(
          'A brute-force solution checks every later value for every index. How many comparisons can it make on n values?',
          ['O(n)', 'O(log n)', 'O(1)', 'O(n²)'],
          3,
          'Index i may scan up to n − i − 1 later values, which sums to about n²/2.',
        ),
        predictOutput(
          'How many stack operations does this scan perform?',
          lines(
            'values = [1, 2, 3]',
            'pending = []',
            'operations = 0',
            'for index in range(len(values)):',
            '    while pending and values[pending[-1]] < values[index]:',
            '        pending.pop()',
            '        operations += 1',
            '    pending.append(index)',
            '    operations += 1',
            'print(operations)',
          ),
          ['3', '5', '6', '9'],
          1,
          'Each new value pops the single previous index: three pushes and two pops make five operations.',
        ),
      ],
    },
  ],
  // ----------------------------------------------------------------- heaps
  'cp-heap-invariant': [
    {
      title: 'Locate a heap node’s parent and children',
      explanation: [
        'A minimum heap is stored in an ordinary list. The entry at index i has children at 2*i+1 and 2*i+2 when those indices exist, and every index c > 0 has its parent at (c-1)//2.',
        'Index 0 is the root. No links are stored: positions alone determine the tree, so a child index past the end of the list means that child does not exist.',
      ],
      example: {
        code: lines(
          'heap = [1, 4, 2, 9, 5]',
          'i = 1',
          'print(heap[2 * i + 1], heap[2 * i + 2])',
          'print(heap[(4 - 1) // 2])',
        ),
        output: '9 5\n4',
        explanation:
          'Index 1 has children at 3 and 4 (values 9 and 5). Index 4’s parent is (4 − 1) // 2 = 1, which holds 4.',
      },
      questions: [
        choose(
          'What is the parent index of index 5?',
          ['2', '3', '4', '1'],
          0,
          '(5 − 1) // 2 = 2.',
        ),
        choose(
          'In a 6-entry heap, which indices are the children of index 2?',
          ['3 and 4', '5 only', '4 and 5', '5 and 6'],
          1,
          'The formulas give 5 and 6, but index 6 does not exist in a 6-entry list, so only 5 is a child.',
        ),
        predictOutput(
          'What does this program print?',
          lines(
            'heap = [2, 6, 3, 8, 7, 4]',
            'child = 5',
            'print(heap[(child - 1) // 2])',
          ),
          ['6', '4', '3', '2'],
          2,
          'Index 5’s parent is (5 − 1) // 2 = 2, which holds 3.',
        ),
        predictOutput(
          'Which indices have no children?',
          lines(
            'heap = [1, 3, 5, 4, 8]',
            'for i in range(len(heap)):',
            '    if 2 * i + 1 >= len(heap):',
            '        print(i)',
          ),
          ['3\n4', '4', '1\n2\n3\n4', '2\n3\n4'],
          3,
          'An index has no children when its left child 2*i+1 is past the end; that holds for 2, 3 and 4.',
        ),
      ],
    },
    {
      title: 'Check only parent–child pairs',
      explanation: [
        'A list is a minimum heap when every parent is no larger than each of its existing children. Checking each index c from 1 upward against its parent (c-1)//2 covers every pair once.',
        'The rule is local. Siblings can appear in any order and the list need not be sorted, yet the smallest value is always at index 0.',
      ],
      example: {
        code: lines(
          isMinHeap,
          'print(is_min_heap([2, 9, 3, 10]))',
          'print(is_min_heap([2, 9, 3, 8, 1]))',
        ),
        output: 'True\nFalse',
        explanation:
          'The first list is not sorted, but every child is at least its parent. In the second, 8 sits below its parent 9.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          lines(
            isMinHeap,
            'print(is_min_heap([1, 5, 2]))',
            'print(is_min_heap([3, 1, 4]))',
          ),
          ['False\nFalse', 'True\nTrue', 'False\nTrue', 'True\nFalse'],
          3,
          '[1, 5, 2] keeps both children at least 1 even though it is unsorted; in [3, 1, 4] the child 1 is below its parent 3.',
        ),
        choose(
          'Which list is a valid minimum heap?',
          ['[4, 2, 6]', '[1, 7, 3, 2]', '[0, 5, 1, 6, 9]', '[3, 3, 1]'],
          2,
          'Every child of 0 and of 5 is at least its parent; each other list has a child smaller than its parent.',
        ),
        choose(
          'A heap check compares every element with the next one and rejects any decrease. What goes wrong?',
          [
            'It accepts heaps with a small leaf',
            'It rejects valid heaps whose siblings are out of order',
            'It never looks at the root',
            'It needs a sorted copy first',
          ],
          1,
          'A heap such as [1, 5, 2] decreases from 5 to 2 between siblings, yet satisfies every parent–child rule.',
        ),
        predictOutput(
          'What is printed?',
          lines(isMinHeap, 'print(is_min_heap([7]))', 'print(is_min_heap([]))'),
          ['True\nTrue', 'False\nFalse', 'True\nFalse', 'False\nTrue'],
          0,
          'With fewer than two entries the loop has no child to check, so both lists are valid heaps.',
        ),
      ],
    },
  ],
  'cp-heap-build': [
    {
      title: 'heapify rearranges the list in place',
      explanation: [
        'heapq.heapify(heap) reorders an existing list into a minimum heap. It changes that list in place and returns None, so the result must be read from the list itself.',
        'After heapify, heap[0] is a smallest value, but the rest of the list is usually not sorted. Building the heap this way takes O(n) time.',
      ],
      example: {
        code: lines(
          'import heapq',
          'heap = [8, 3, 7, 2]',
          'result = heapq.heapify(heap)',
          'print(result)',
          'print(heap[0])',
        ),
        output: 'None\n2',
        explanation:
          'heapify returns None; the list itself now has its minimum 2 at index 0.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          lines(
            'import heapq',
            'values = [5, 1, 4]',
            'print(heapq.heapify(values))',
          ),
          ['[1, 5, 4]', '[1, 4, 5]', 'None', '1'],
          2,
          'heapify works in place and returns None, so printing its return value prints None.',
        ),
        predictOutput(
          'What is printed?',
          lines(
            'import heapq',
            'heap = [9, 4, 6, 1]',
            'heapq.heapify(heap)',
            'print(heap[0], len(heap))',
          ),
          ['9 4', '1 4', '1 3', '4 4'],
          1,
          'heapify moves the minimum 1 to index 0 and keeps all four entries.',
        ),
        choose(
          'After heapq.heapify(heap) on a list of n numbers, what is guaranteed?',
          [
            'heap[0] is a smallest value',
            'The whole list is sorted ascending',
            'heap[-1] is the largest value',
            'Duplicate values are removed',
          ],
          0,
          'heapify establishes only the heap rule, which puts a minimum at the root.',
        ),
        choose(
          'What does heapify cost on an existing list of n values?',
          ['O(n log n)', 'O(n²)', 'O(log n)', 'O(n)'],
          3,
          'Building a heap in place takes linear time, cheaper than sorting the list.',
        ),
      ],
    },
    {
      title: 'Heapify a copy and handle the empty list',
      explanation: [
        'Because heapify reorders its argument, call it on values.copy() when the caller still needs the original order.',
        'An empty list has no root, and heap[0] would raise IndexError. Return the contract’s empty result, such as None, before reading the root.',
      ],
      example: {
        code: lines(
          'import heapq',
          '',
          'def heap_minimum(values):',
          '    if not values:',
          '        return None',
          '    heap = values.copy()',
          '    heapq.heapify(heap)',
          '    return heap[0]',
          '',
          'data = [6, 2, 9]',
          'print(heap_minimum(data))',
          'print(data)',
          'print(heap_minimum([]))',
        ),
        output: '2\n[6, 2, 9]\nNone',
        explanation:
          'The copy is reordered, so data keeps its order. The empty list returns None without reading an index.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          lines(
            'import heapq',
            'data = [7, 5, 3]',
            'heap = data',
            'heapq.heapify(heap)',
            'print(data[0])',
          ),
          ['7', '3', '5', 'None'],
          1,
          'heap and data name the same list, so heapify reorders data too and its first entry becomes 3.',
        ),
        predictOutput(
          'What is printed?',
          lines(
            'import heapq',
            'data = [7, 5, 3]',
            'heap = data.copy()',
            'heapq.heapify(heap)',
            'print(data[0], heap[0])',
          ),
          ['3 3', '7 7', '7 3', '3 7'],
          2,
          'Only the copy is reordered, so data still starts with 7 while the heap’s root is 3.',
        ),
        choose(
          'A function must find the minimum of values without changing values. Which first steps are correct?',
          [
            'heap = values; heapq.heapify(heap)',
            'heap = heapq.heapify(values)',
            'heapq.heapify(values); heap = values.copy()',
            'heap = values.copy(); heapq.heapify(heap)',
          ],
          3,
          'Only copying before heapify leaves values untouched; the others reorder values or keep heapify’s None.',
        ),
        choose(
          'heap_minimum([]) must return None. What goes wrong if it skips the emptiness check?',
          [
            'heap[0] raises IndexError',
            'heapify raises an error',
            'It returns 0',
            'The copy raises an error',
          ],
          0,
          'heapify and copy both accept an empty list, but reading index 0 of an empty list raises IndexError.',
        ),
      ],
    },
  ],
  'cp-heap-updates': [
    {
      title: 'heappush keeps the heap rule',
      explanation: [
        'heapq.heappush(heap, value) adds one value and moves it up past larger parents, so the list remains a minimum heap. If the new value is the smallest, it becomes heap[0].',
        'heap.append(value) skips that repair and can leave a small value below a larger parent.',
      ],
      example: {
        code: lines(
          'import heapq',
          'heap = [3, 5, 4]',
          'heapq.heappush(heap, 1)',
          'print(heap[0])',
          'print(len(heap))',
        ),
        output: '1\n4',
        explanation:
          '1 is smaller than every existing value, so heappush moves it up to the root.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          lines(
            'import heapq',
            'heap = [2, 6, 8]',
            'heapq.heappush(heap, 7)',
            'print(heap[0])',
          ),
          ['7', '2', '6', '8'],
          1,
          '7 is not smaller than the minimum 2, so 2 stays at the root.',
        ),
        predictOutput(
          'What is printed?',
          lines(
            'import heapq',
            'heap = []',
            'for value in [5, 9, 1, 3]:',
            '    heapq.heappush(heap, value)',
            'print(heap[0])',
          ),
          ['5', '3', '1', '9'],
          2,
          'Each push keeps the heap rule, so the overall minimum 1 ends at the root.',
        ),
        choose(
          'Why use heapq.heappush instead of heap.append for a heap?',
          [
            'append raises an error on heaps',
            'heappush also sorts the entire list',
            'append removes the current minimum',
            'heappush restores the parent–child rule after adding',
          ],
          3,
          'heappush moves the new value up until its parent is no larger; append leaves it wherever it lands.',
        ),
        predictOutput(
          'What does this program print?',
          lines('heap = [2, 4, 3]', 'heap.append(1)', 'print(heap[0])'),
          ['2', '1', '4', '3'],
          0,
          'append only adds 1 at the end; nothing moves it to the root, so heap[0] is still 2 and the heap rule is broken.',
        ),
      ],
    },
    {
      title: 'heappop removes the current minimum',
      explanation: [
        'heapq.heappop(heap) removes and returns heap[0], then repairs the heap so the next smallest value moves to the root.',
        'A value pushed a moment ago can leave first if it is the smallest. Popping an empty heap raises IndexError, so push first or check the length.',
      ],
      example: {
        code: lines(
          'import heapq',
          'heap = [8, 2, 5]',
          'heapq.heapify(heap)',
          'heapq.heappush(heap, 1)',
          'print(heapq.heappop(heap))',
          'print(heapq.heappop(heap))',
        ),
        output: '1\n2',
        explanation:
          'The pushed 1 is the minimum and leaves first; the repaired heap then gives up 2.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          lines(
            'import heapq',
            'heap = [4, 7, 9]',
            'heapq.heapify(heap)',
            'heapq.heappush(heap, 6)',
            'print(heapq.heappop(heap))',
            'print(heapq.heappop(heap))',
          ),
          ['4\n7', '6\n4', '4\n6', '9\n7'],
          2,
          'Pops return the two smallest values present, 4 and then the newly pushed 6.',
        ),
        predictOutput(
          'What is printed?',
          lines(
            'import heapq',
            'heap = []',
            'heapq.heappush(heap, 3)',
            'print(heapq.heappop(heap), len(heap))',
          ),
          ['3 0', '3 1', 'None 0', '0 3'],
          0,
          'The push supplies an entry, so the pop is safe; it returns 3 and leaves the heap empty.',
        ),
        choose(
          'A heap holds 2 and 8. After pushing 1, what does the next heappop return?',
          ['2', '1', '8', 'None'],
          1,
          'heappop always returns the current minimum, and the newly pushed 1 is smaller than 2.',
        ),
        predictOutput(
          'What does this program print?',
          lines(
            'import heapq',
            'heap = [6, 1, 6, 3]',
            'heapq.heapify(heap)',
            'order = []',
            'while heap:',
            '    order.append(heapq.heappop(heap))',
            'print(order)',
          ),
          ['[1, 3, 6]', '[1, 6, 6, 3]', '[6, 1, 6, 3]', '[1, 3, 6, 6]'],
          3,
          'Each pop takes the current minimum, so the values come out ascending and both 6s are kept.',
        ),
      ],
    },
  ],
  'cp-heaps': [
    {
      title: 'Take the cheapest item while work keeps arriving',
      explanation: [
        'A heap lets a program repeatedly take the cheapest available item even as new items arrive. Push each arrival with heappush and take the cheapest with heappop; nothing is ever fully sorted.',
        'To trace a heap program, track which values are in the heap rather than the exact list layout: each pop returns the smallest value currently present.',
      ],
      example: {
        code: lines(
          'import heapq',
          'jobs = [8, 2, 5]',
          'heapq.heapify(jobs)',
          'done = [heapq.heappop(jobs)]',
          'heapq.heappush(jobs, 1)',
          'heapq.heappush(jobs, 7)',
          'done.append(heapq.heappop(jobs))',
          'done.append(heapq.heappop(jobs))',
          'print(done)',
          'print(jobs[0])',
        ),
        output: '[2, 1, 5]\n7',
        explanation:
          '2 leaves first. After 1 and 7 arrive, the heap holds 8, 5, 1 and 7, so 1 and then 5 leave, and 7 becomes the minimum.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          lines(
            'import heapq',
            'heap = [4, 9]',
            'heapq.heapify(heap)',
            'taken = []',
            'for arrival in [6, 1, 8]:',
            '    heapq.heappush(heap, arrival)',
            '    taken.append(heapq.heappop(heap))',
            'print(taken)',
          ),
          ['[1, 4, 6]', '[4, 1, 6]', '[6, 1, 8]', '[4, 6, 8]'],
          1,
          'After 6 arrives the minimum is 4; after 1 arrives it is 1; after 8 arrives the heap holds 9, 6, 8, so 6 leaves.',
        ),
        predictOutput(
          'What is printed?',
          lines(
            'import heapq',
            'heap = []',
            'for value in [5, 3, 9]:',
            '    heapq.heappush(heap, value)',
            'heapq.heappop(heap)',
            'heapq.heappush(heap, 4)',
            'print(heapq.heappop(heap), heap[0])',
          ),
          ['3 4', '5 4', '4 9', '4 5'],
          3,
          '3 is removed first. Then 4 joins 5 and 9, so 4 is popped and 5 becomes the root.',
        ),
        choose(
          'A program must repeatedly remove the cheapest pending job while new jobs keep arriving. Why is a heap better than sorting after every arrival?',
          [
            'Each push and pop costs O(log n) instead of a full re-sort',
            'A heap keeps every job in ascending order',
            'Sorting cannot handle duplicate costs',
            'A heap removes the newest job first',
          ],
          0,
          'Re-sorting costs O(n log n) per change, while a heap update costs only O(log n).',
        ),
        choose(
          'After several pushes and pops, heap is [2, 7, 3, 9]. Which value will the next heappop return?',
          ['9', '7', '2', '3'],
          2,
          'The root heap[0] is always a minimum, and heappop returns it.',
        ),
      ],
    },
    {
      title: 'Break ties with a tuple priority',
      explanation: [
        'Heap entries can be tuples such as (cost, name). Tuples compare by their first field and look at the next field only when the first fields tie, so the cheapest cost leaves first and ties fall to the second field.',
        'Every compared field must be orderable. If two entries tie on cost and their payloads cannot be compared, such as two dictionaries, heapq raises TypeError. Put a comparable tie-breaker, such as an arrival number, before the payload.',
      ],
      example: {
        code: lines(
          'import heapq',
          'heap = []',
          'heapq.heappush(heap, (3, "paint"))',
          'heapq.heappush(heap, (1, "sand"))',
          'heapq.heappush(heap, (3, "dust"))',
          'while heap:',
          '    cost, task = heapq.heappop(heap)',
          '    print(cost, task)',
        ),
        output: '1 sand\n3 dust\n3 paint',
        explanation:
          'Cost 1 leaves first. The two cost-3 tasks tie, so their names decide: "dust" comes before "paint".',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          lines(
            'import heapq',
            'heap = []',
            'for entry in [(2, "b"), (2, "a"), (1, "z")]:',
            '    heapq.heappush(heap, entry)',
            'names = []',
            'while heap:',
            '    names.append(heapq.heappop(heap)[1])',
            'print(names)',
          ),
          [
            "['z', 'a', 'b']",
            "['z', 'b', 'a']",
            "['a', 'b', 'z']",
            "['b', 'a', 'z']",
          ],
          0,
          'Cost 1 comes first; the cost-2 tie is broken by name, and "a" is smaller than "b".',
        ),
        predictOutput(
          'What is printed?',
          lines(
            'import heapq',
            'heap = []',
            'arrival = 0',
            'for cost, name in [(5, "x"), (2, "y"), (5, "w")]:',
            '    heapq.heappush(heap, (cost, arrival, name))',
            '    arrival += 1',
            'names = []',
            'while heap:',
            '    names.append(heapq.heappop(heap)[2])',
            'print(names)',
          ),
          [
            "['y', 'w', 'x']",
            "['y', 'x', 'w']",
            "['x', 'y', 'w']",
            "['x', 'w', 'y']",
          ],
          1,
          'Arrival numbers are unique, so the equal costs leave in arrival order and the names are never compared.',
        ),
        choose(
          'A heap holds (4, {"id": 1}) and (4, {"id": 2}). What happens when Python must order them?',
          [
            'The first one pushed wins',
            'The smaller id is chosen',
            'They are merged into one entry',
            'TypeError: dictionaries cannot be compared',
          ],
          3,
          'The costs tie, so Python compares the dictionaries next, and dictionaries do not support <.',
        ),
        choose(
          'Jobs must leave by lowest cost and, among equal costs, by earliest arrival. Which heap entry achieves that?',
          [
            '(arrival, cost, job)',
            '(job, cost, arrival)',
            '(cost, arrival, job)',
            '(cost, job, arrival)',
          ],
          2,
          'Cost is compared first, and the unique arrival number settles ties before the job is ever compared.',
        ),
      ],
    },
    {
      title: 'Account for heap costs and empty pops',
      explanation: [
        'heapify costs O(n); each heappush and heappop costs O(log n). Building once and popping k times therefore costs O(n + k log n), far less than re-sorting after every change.',
        'Before each pop, make sure the heap is nonempty: popping an empty list raises IndexError. When k may exceed the number of items, stop as soon as the heap runs out.',
      ],
      example: {
        code: lines(
          'import heapq',
          '',
          'def smallest(values, k):',
          '    heap = values.copy()',
          '    heapq.heapify(heap)',
          '    result = []',
          '    while heap and len(result) < k:',
          '        result.append(heapq.heappop(heap))',
          '    return result',
          '',
          'print(smallest([7, 3, 9, 3], 3))',
          'print(smallest([4], 5))',
        ),
        output: '[3, 3, 7]\n[4]',
        explanation:
          'Three pops give the three smallest values, keeping both 3s. With one item and k = 5, the loop stops when the heap is empty.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          lines(
            'import heapq',
            '',
            'def smallest(values, k):',
            '    heap = values.copy()',
            '    heapq.heapify(heap)',
            '    result = []',
            '    while heap and len(result) < k:',
            '        result.append(heapq.heappop(heap))',
            '    return result',
            '',
            'print(smallest([5, 1, 8], 0))',
            'print(smallest([], 2))',
          ),
          ['[]\n[]', '[1]\n[]', '[1, 5, 8]\n[]', '[]\nNone'],
          0,
          'k = 0 stops before any pop, and an empty heap stops at once; both return an empty list.',
        ),
        choose(
          'A heap of n items is built once and then popped k times. What is the total cost?',
          ['O(n log n + k)', 'O(n + k log n)', 'O(n · k)', 'O(k log k)'],
          1,
          'heapify is O(n), and each of the k pops is O(log n).',
        ),
        predictOutput(
          'What is printed?',
          lines(
            'import heapq',
            '',
            'def smallest(values, k):',
            '    heap = values.copy()',
            '    heapq.heapify(heap)',
            '    result = []',
            '    while heap and len(result) < k:',
            '        result.append(heapq.heappop(heap))',
            '    return result',
            '',
            'print(smallest([6, 2, 6, 2], 3))',
          ),
          ['[2, 6]', '[2, 6, 6]', '[2, 2, 6]', '[2, 2]'],
          2,
          'Duplicates are separate heap entries, so the three smallest are 2, 2 and 6.',
        ),
        choose(
          'What happens if a program calls heapq.heappop on an empty list?',
          [
            'It returns None',
            'It returns 0',
            'It returns an empty list',
            'It raises IndexError',
          ],
          3,
          'There is no minimum to remove, so heappop raises IndexError; check the heap first.',
        ),
      ],
    },
  ],
  // ----------------------------------------------------------------- tries
  'cp-trie-path': [
    {
      title: 'Follow one child per character',
      explanation: [
        'A trie stores strings as paths from a root. Here each node is a dictionary that maps a character to its child node, so the path for "pin" is root["p"]["i"]["n"].',
        'Following text takes one dictionary step per character. A length-4 string follows exactly 4 edges, whatever else the trie holds.',
      ],
      example: {
        code: lines(
          'root = {"p": {"i": {"n": {}, "t": {}}}}',
          'node = root',
          'for letter in "pi":',
          '    node = node[letter]',
          'print(list(node.keys()))',
        ),
        output: "['n', 't']",
        explanation:
          'p and then i are followed from the root. The node reached has two children, n and t, so "pin" and "pit" continue from here.',
      },
      questions: [
        choose(
          'How many child steps does following "lake" from the root take?',
          ['1', '3', '4', 'One per node in the trie'],
          2,
          'Each character is one edge, so a 4-letter string takes exactly 4 steps.',
        ),
        predictOutput(
          'What does this program print?',
          lines(
            'root = {"c": {"a": {"t": {}, "r": {}}, "o": {}}}',
            'print(list(root["c"].keys()))',
          ),
          ["['a', 'o']", "['c']", "['t', 'r']", "['a', 't', 'r', 'o']"],
          0,
          'The node for "c" has only its direct children a and o; t and r sit one level deeper.',
        ),
        predictOutput(
          'What is printed?',
          lines(
            'root = {"d": {"o": {"g": {}}}}',
            'node = root',
            'for letter in "do":',
            '    node = node[letter]',
            'print("g" in node, "o" in node)',
          ),
          ['False True', 'True True', 'False False', 'True False'],
          3,
          'After following d and o, the node’s only child is g; o was the edge used to get here, not a child of this node.',
        ),
        choose(
          'Which expression reaches the node for the path "ab"?',
          [
            'root["ab"]',
            'root["a"]["b"]',
            'root["b"]["a"]',
            'root["a"] + root["b"]',
          ],
          1,
          'Each character is a separate key, looked up in order from the root.',
        ),
      ],
    },
    {
      title: 'Report a missing child as a missing path',
      explanation: [
        'Before stepping, check letter in node. If the child is missing, the path does not exist and the search can stop at once.',
        'The empty string takes no steps, so its path exists even in an empty trie. A path existing only means some inserted string started this way; it does not yet say that this exact word was inserted.',
      ],
      example: {
        code: lines(
          hasPath,
          'trie = {"s": {"u": {"n": {}}}}',
          'print(has_path(trie, "su"))',
          'print(has_path(trie, "sum"))',
          'print(has_path(trie, ""))',
        ),
        output: 'True\nFalse\nTrue',
        explanation:
          '"su" follows two existing edges. "sum" fails at m because the u node has only n. The empty string takes no steps.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          lines(
            hasPath,
            'print(has_path({"a": {"b": {}}}, "abc"))',
            'print(has_path({}, ""))',
          ),
          ['False\nTrue', 'True\nTrue', 'False\nFalse', 'True\nFalse'],
          0,
          '"abc" fails at c because the b node is empty; the empty string needs no steps, even in an empty trie.',
        ),
        predictOutput(
          'How many steps succeed before the path breaks?',
          lines(
            'def steps_taken(root, text):',
            '    node = root',
            '    steps = 0',
            '    for letter in text:',
            '        if letter not in node:',
            '            return steps',
            '        node = node[letter]',
            '        steps += 1',
            '    return steps',
            '',
            'print(steps_taken({"r": {"e": {"d": {}}}}, "rest"))',
          ),
          ['4', '3', '2', '0'],
          2,
          'r and e exist, but the e node has no s child, so the walk stops after two steps.',
        ),
        choose(
          'The trie holds only "planet". Does the path for "plan" exist?',
          [
            'No, "plan" was never inserted',
            'Yes, it is a prefix of "planet"',
            'Only if "plan" ends at a leaf',
            'No, paths exist only for full words',
          ],
          1,
          'Inserting "planet" created every prefix path, including p-l-a-n; whether "plan" is a word is a separate question.',
        ),
        choose(
          'Why does a lookup check letter in node before node = node[letter]?',
          [
            'It sorts the children alphabetically',
            'Dictionaries cannot hold single letters',
            'It adds the missing child automatically',
            'Indexing a missing key raises KeyError',
          ],
          3,
          'Reading a missing dictionary key is an error, so the check turns a missing child into a clean False.',
        ),
      ],
    },
  ],
  'cp-trie-word-end': [
    {
      title: 'A path is not a word without an end mark',
      explanation: [
        'Inserting "cat" creates the paths c, ca and cat, but only cat was inserted. The trie needs a separate end mark at the final node of each inserted word.',
        'Give each node two fields: end, a boolean, and children, a dictionary of character edges. A word is stored exactly when its path exists and the final node has end set to True.',
      ],
      example: {
        code: lines(
          containsWord,
          'leaf = {"end": True, "children": {}}',
          'trie = {"end": False, "children": {"o": {"end": False, "children": {"x": leaf}}}}',
          'print(contains_word(trie, "ox"))',
          'print(contains_word(trie, "o"))',
        ),
        output: 'True\nFalse',
        explanation:
          'Both paths exist, but only the x node is marked as the end of a word, so "o" is just a prefix.',
      },
      questions: [
        choose(
          'Only "river" was inserted. What is "riv"?',
          [
            'A stored word, because its path exists',
            'A missing path',
            'A prefix path, but not a stored word',
            'A stored word whose end is False',
          ],
          2,
          'Inserting "river" created the path for "riv", but no end mark was set there.',
        ),
        predictOutput(
          'This trie holds "go" and "gone". What does the program print?',
          lines(
            containsWord,
            'e = {"end": True, "children": {}}',
            'n = {"end": False, "children": {"e": e}}',
            'o = {"end": True, "children": {"n": n}}',
            'trie = {"end": False, "children": {"g": {"end": False, "children": {"o": o}}}}',
            'print(contains_word(trie, "go"), contains_word(trie, "gon"), contains_word(trie, "gone"))',
          ),
          [
            'True True True',
            'True False True',
            'False False True',
            'True False False',
          ],
          1,
          '"go" and "gone" end at marked nodes. "gon" has a path but its final node is not marked.',
        ),
        choose(
          'Why keep end and children as separate fields instead of storing the end mark among the character keys?',
          [
            'So the mark cannot collide with a character edge',
            'So stored words are sorted automatically',
            'So every node becomes a leaf',
            'So one-letter words are forbidden',
          ],
          0,
          'Separate fields keep node data apart from the edges, so no character can be mistaken for the mark.',
        ),
        predictOutput(
          'What is printed?',
          lines(
            containsWord,
            'root = {"end": True, "children": {}}',
            'print(contains_word(root, ""), contains_word(root, "a"))',
          ),
          ['False False', 'True True', 'False True', 'True False'],
          3,
          'The empty word follows no edges, so its mark is the root’s end, which is True; "a" has no path.',
        ),
      ],
    },
    {
      title: 'Mark the end when inserting a word',
      explanation: [
        'Insertion walks the word one character at a time, creating any missing child as {"end": False, "children": {}}. After the last character it sets end to True on the node it reached.',
        'Shared prefixes reuse existing nodes, so inserting "tea" after "ten" adds only the a node. The empty word sets end on the root itself.',
      ],
      example: {
        code: lines(
          insertWord,
          'insert(root, "ten")',
          'insert(root, "tea")',
          'e = root["children"]["t"]["children"]["e"]',
          'print(list(e["children"].keys()))',
          'print(e["end"])',
        ),
        output: "['n', 'a']\nFalse",
        explanation:
          '"tea" reuses the t and e nodes and adds a beside n. "te" was never inserted, so the e node stays unmarked.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          lines(
            insertWord,
            'insert(root, "an")',
            'insert(root, "a")',
            'a = root["children"]["a"]',
            'print(a["end"], len(a["children"]))',
          ),
          ['False 1', 'True 1', 'True 0', 'False 2'],
          1,
          'Inserting "a" reuses the existing a node and marks it; its child n is still there.',
        ),
        predictOutput(
          'How many children does the node for "ba" have?',
          lines(
            insertWord,
            'for word in ["bat", "bad", "ban"]:',
            '    insert(root, word)',
            'print(len(root["children"]["b"]["children"]["a"]["children"]))',
          ),
          ['1', '2', '9', '3'],
          3,
          'All three words share b and a, then branch into t, d and n.',
        ),
        choose(
          'insert(root, "") is called on a fresh trie. What changes?',
          [
            'Nothing, because the word is empty',
            'A child with key "" is created',
            'root["end"] becomes True',
            'An error is raised',
          ],
          2,
          'The loop runs zero times, so the node reached is the root, and its end is set.',
        ),
        choose(
          'The trie already holds "seat". Then "sea" is inserted. What does insertion do?',
          [
            'Sets end on the existing a node, adding no nodes',
            'Builds a second s, e, a path beside the first',
            'Adds a new leaf below t',
            'Creates three new nodes for s, e and a',
          ],
          0,
          'Every character of "sea" already has a node, so insertion only marks the a node as a word end.',
        ),
      ],
    },
  ],
  'cp-trie-prefix-count': [
    {
      title: 'Read a prefix count from the node reached',
      explanation: [
        'A node can store count: how many inserted word occurrences pass through it. Every word that starts with the node’s path passes through it, so count answers how many words start with that prefix.',
        'A prefix query follows the path and returns the reached node’s count. A missing child means no inserted word has that prefix, so the answer is 0. The empty prefix reaches the root, whose count is the total number of words.',
      ],
      example: {
        code: lines(
          prefixCount,
          'x = {"count": 1, "children": {}}',
          'a = {"count": 2, "children": {"x": x}}',
          'b = {"count": 1, "children": {}}',
          'trie = {"count": 3, "children": {"a": a, "b": b}}',
          'print(prefix_count(trie, "a"))',
          'print(prefix_count(trie, "ay"))',
          'print(prefix_count(trie, ""))',
        ),
        output: '2\n0\n3',
        explanation:
          'Two words pass through a. No node exists for "ay", so the answer is 0. The root counts all three words.',
      },
      questions: [
        choose(
          '"go" is inserted twice and "gone" once. What count is stored at the node for "go"?',
          ['1', '2', '3', '4'],
          2,
          'All three occurrences pass through the go node: two end there and one continues to gone.',
        ),
        predictOutput(
          'What does this program print?',
          lines(
            prefixCount,
            'x = {"count": 1, "children": {}}',
            'a = {"count": 2, "children": {"x": x}}',
            'b = {"count": 1, "children": {}}',
            'trie = {"count": 3, "children": {"a": a, "b": b}}',
            'print(prefix_count(trie, "ax"), prefix_count(trie, "b"), prefix_count(trie, "c"))',
          ),
          ['1 1 0', '2 1 0', '1 1 3', '1 0 0'],
          0,
          'The ax and b nodes each count one word; there is no c child, so that query returns 0.',
        ),
        choose(
          'Which node answers the query for the empty prefix?',
          [
            'The deepest node',
            'No node; the answer is 0',
            'The root’s first child',
            'The root',
          ],
          3,
          'The empty prefix follows no edges, so it ends at the root, which every insertion passes through.',
        ),
        choose(
          'A prefix query hits a missing child halfway through the prefix. What should it return?',
          [
            'The count of the last node reached',
            '0',
            'The root’s count',
            'None',
          ],
          1,
          'No inserted word contains the full prefix, so the number of words starting with it is 0.',
        ),
      ],
    },
    {
      title: 'Count every occurrence during insertion',
      explanation: [
        'Insertion adds 1 to count at every node it passes through, root included. The root’s count therefore equals the number of insertions, and a repeated word adds to the same nodes again.',
        'Counting only at each word’s final node would answer a different question: how many times that exact word was inserted, not how many words start with a prefix.',
      ],
      example: {
        code: lines(
          countingInsert,
          'for word in ["ink", "in", "ice", "ink"]:',
          '    insert(root, word)',
          'print(root["count"])',
          'print(root["children"]["i"]["children"]["n"]["count"])',
        ),
        output: '4\n3',
        explanation:
          'All four insertions pass the root. Three of them, "ink" twice and "in", pass through the node for "in".',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          lines(
            countingInsert,
            'for word in ["to", "tea", "to"]:',
            '    insert(root, word)',
            't = root["children"]["t"]',
            'print(t["count"], t["children"]["o"]["count"], t["children"]["e"]["count"])',
          ),
          ['3 2 1', '2 1 1', '3 1 1', '3 2 2'],
          0,
          'All three words pass t; "to" twice passes o, and only "tea" passes e.',
        ),
        predictOutput(
          'What is printed?',
          lines(
            countingInsert,
            'for word in ["", "a"]:',
            '    insert(root, word)',
            'print(root["count"], root["children"]["a"]["count"])',
          ),
          ['1 1', '2 1', '2 2', '1 0'],
          1,
          'Both insertions add 1 at the root, including the empty word; only "a" reaches the a node.',
        ),
        choose(
          'Insertion increments count only at each word’s final node. What does the count at the node for "re" then measure?',
          [
            'How many words start with "re"',
            'How many children the node has',
            'How many times "re" itself was inserted',
            'How many letters "re" has',
          ],
          2,
          'Only insertions ending exactly at that node add to it, so it counts copies of "re" alone.',
        ),
        choose(
          'After 50 insertions, some repeated and one of them empty, what is the root’s count?',
          [
            'The number of distinct words',
            '49, excluding the empty word',
            'The number of root children',
            '50',
          ],
          3,
          'Every insertion, repeated or empty, adds 1 at the root.',
        ),
      ],
    },
  ],
  'cp-tries': [
    {
      title: 'Share prefixes while building the trie',
      explanation: [
        'Insert each word by walking its characters from the root and creating a child only when the character is missing. Words with a common prefix share that part of the path, so each distinct prefix is stored once.',
        'Counting the nodes created shows the sharing: every distinct nonempty prefix of the inserted words becomes exactly one node below the root.',
      ],
      example: {
        code: lines(trieBuilder('["car", "cat", "cart"]'), 'print(created)'),
        output: '5',
        explanation:
          '"car" creates c, a and r; "cat" shares ca and adds t; "cart" shares car and adds its own t. Five nodes hold ten letters.',
      },
      questions: [
        predictOutput(
          'How many nodes does this build create?',
          lines(trieBuilder('["dog", "dot", "do", "dig"]'), 'print(created)'),
          ['6', '11', '7', '4'],
          0,
          '"dog" adds 3 nodes, "dot" adds t, "do" adds none, and "dig" adds i and g: 6 in all.',
        ),
        predictOutput(
          'What is printed?',
          lines(trieBuilder('["a", "a", "ab"]'), 'print(created)'),
          ['3', '2', '4', '1'],
          1,
          'The first "a" creates one node, the repeat creates none, and "ab" adds b.',
        ),
        choose(
          '"trip", "trim" and "trick" are inserted. Which prefix is stored once and shared by all three?',
          ['"t" only', '"trip"', '"tri"', '"trick"'],
          2,
          'All three words begin with t-r-i and only then branch, so that path is shared.',
        ),
        choose(
          'A trie is built from W words with L letters in total. At most how many nodes are created below the root?',
          ['W', 'W × L', 'L²', 'L'],
          3,
          'Each letter creates at most one node, and shared prefixes create fewer.',
        ),
      ],
    },
    {
      title: 'Answer word and prefix queries on one trie',
      explanation: [
        'A word query and a prefix query walk the same path. A word query then checks the end mark; a prefix query only needs the path to exist.',
        'In a trie built from "oak" and "oakwood", "oakw" is a prefix but not a word, while "oak" is both.',
      ],
      example: {
        code: lines(
          wordTrie('["oak", "oakwood"]'),
          'for text in ["oak", "oakw", "oaks"]:',
          '    node = walk(text)',
          '    print(text, node is not None, node is not None and node["end"])',
        ),
        output: 'oak True True\noakw True False\noaks False False',
        explanation:
          '"oak" reaches a marked node. "oakw" reaches an unmarked node inside "oakwood". "oaks" falls off the trie at s.',
      },
      questions: [
        predictOutput(
          'Which texts are stored words?',
          lines(
            wordTrie('["bee", "been"]'),
            'def is_word(text):',
            '    node = walk(text)',
            '    return node is not None and node["end"]',
            '',
            'print(is_word("be"), is_word("bee"), is_word("beer"))',
          ),
          [
            'True True False',
            'False True False',
            'False True True',
            'True True True',
          ],
          1,
          '"be" is only a prefix, "bee" is marked, and "beer" has no r child after "bee".',
        ),
        choose(
          'A trie holds "pancake" and "pan". Which statement about it is correct?',
          [
            '"pa" is a stored word',
            '"pancakes" is a prefix',
            '"panc" is a prefix but not a word',
            '"pan" is a prefix but not a word',
          ],
          2,
          '"panc" lies on the path of "pancake" without an end mark; "pan" is marked, and "pancakes" runs past the path.',
        ),
        predictOutput(
          'Which queries have an existing path?',
          lines(
            wordTrie('["map", "maple"]'),
            'print([walk(text) is not None for text in ["ma", "mapl", "maps", ""]])',
          ),
          [
            '[True, True, False, True]',
            '[False, False, False, True]',
            '[True, True, False, False]',
            '[True, False, False, True]',
          ],
          0,
          '"ma" and "mapl" lie on stored paths and "" reaches the root; "maps" has no s child.',
        ),
        choose(
          'In a trie where "" was never inserted, the empty string is checked as a word. What decides the answer?',
          [
            'True, because every path starts at the root',
            'An error, because there is no first letter',
            'True, if any word was inserted',
            'False, from the root’s unset end mark',
          ],
          3,
          'The empty word ends at the root, and the root is marked only if "" itself was inserted.',
        ),
      ],
    },
    {
      title: 'Count prefix matches and their cost',
      explanation: [
        'With a count at every node, the number of inserted occurrences that start with a prefix takes a single walk: follow the prefix and read the count, or return 0 if a child is missing. Repeated words count separately because each insertion adds 1 along its path.',
        'Building from W words with L letters in total takes O(W + L) expected time, one dictionary step per letter plus the root update per word. A query of length p then takes O(p + 1), however many words are stored.',
      ],
      example: {
        code: lines(
          countTrie('["go", "gone", "go", "got"]'),
          'print(starts_with("go"), starts_with("gon"), starts_with("gox"), starts_with(""))',
        ),
        output: '4 1 0 4',
        explanation:
          'All four occurrences start with "go"; only "gone" continues with n; nothing continues with x; the root counts every insertion.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          lines(
            countTrie('["red", "re", "rest", "red"]'),
            'print(starts_with("re"), starts_with("red"), starts_with("res"))',
          ),
          ['3 2 1', '4 1 1', '4 2 1', '2 2 1'],
          2,
          'All four start with "re", the two "red" occurrences both count, and only "rest" starts with "res".',
        ),
        choose(
          'A trie stores 10,000 words. How long does counting the words that start with a 5-letter prefix take?',
          ['O(10,000)', 'O(5)', 'O(5 × 10,000)', 'O(log 10,000)'],
          1,
          'The query walks five edges and reads one count; the number of stored words does not matter.',
        ),
        choose(
          'Words ["", "a", "ab"] are inserted with counts. What does the empty-prefix query return?',
          ['3', '2', '0', '1'],
          0,
          'Every insertion, including the empty word, adds 1 at the root.',
        ),
        predictOutput(
          'What is printed?',
          lines(
            countTrie('["x", "y", "x"]'),
            'print(starts_with("x"), starts_with("z"))',
          ),
          ['1 0', '2 None', '3 0', '2 0'],
          3,
          'The repeated "x" passes the x node twice, and the missing z child gives 0.',
        ),
      ],
    },
  ],
  // ------------------------------------------------------------- recursion
  'cp-recursive-base': [
    {
      title: 'Return a known answer at the base case',
      explanation: [
        'A recursive definition rests on a base case: an input whose answer is already known, so the function returns it without another call. For a power with a nonnegative exponent, exponent 0 is the base case and its answer is 1, including 0 ** 0 under this course’s convention.',
        'Every other exponent still needs more work. A function that only recognizes the base case can return a marker such as None for those inputs.',
      ],
      example: {
        code: lines(
          baseAnswer,
          'print(base_answer(0))',
          'print(base_answer(3))',
          'print(base_answer(1))',
        ),
        output: '1\nNone\nNone',
        explanation:
          'Only exponent 0 has an answer known without further work. Exponent 1 still needs one multiplication by the base.',
      },
      questions: [
        choose(
          'Which exponent is the base case for computing base ** exponent with a nonnegative integer exponent?',
          ['1', 'Every even exponent', '0', 'The largest exponent'],
          2,
          'Any base to the power 0 is 1, so exponent 0 needs no further work.',
        ),
        predictOutput(
          'What does this program print?',
          lines(baseAnswer, 'print(base_answer(2), base_answer(0))'),
          ['None 1', '1 1', 'None 0', '2 1'],
          0,
          'Exponent 2 is not the base case, so it gets None; exponent 0 returns the known answer 1.',
        ),
        predictOutput(
          'What is printed?',
          'print(0 ** 0, 5 ** 0)',
          ['0 1', '1 1', '0 0', '1 5'],
          1,
          'Python, like this course’s convention, defines every zero exponent as 1, including 0 ** 0.',
        ),
        choose(
          'What makes a case a base case?',
          [
            'It is the largest input allowed',
            'It calls the function twice',
            'It prints its argument',
            'It returns without making another recursive call',
          ],
          3,
          'A base case already knows its answer, so it ends the chain of calls.',
        ),
      ],
    },
    {
      title: 'Test the base case before any step',
      explanation: [
        'return ends a call immediately, so lines after a returning base case never run for the base input. That is why the base test comes first: any later step, such as shrinking the exponent, runs only for inputs that need it.',
        'If a step runs before the test, the base input may be changed into something the test no longer recognizes.',
      ],
      example: {
        code: lines(
          'def describe(exponent):',
          '    if exponent == 0:',
          '        return "base"',
          '    print("needs work")',
          '    return "step"',
          '',
          'print(describe(0))',
          'print(describe(4))',
        ),
        output: 'base\nneeds work\nstep',
        explanation:
          'For 0 the function returns at once and never prints "needs work". For 4 the test fails, so the later lines run.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          lines(
            'def check(n):',
            '    if n == 0:',
            '        return "done"',
            '    print("working on", n)',
            '    return "more"',
            '',
            'print(check(0))',
          ),
          ['done', 'working on 0\ndone', 'working on 0\nmore', 'more'],
          0,
          'The base test matches and returns "done" before the print line is reached.',
        ),
        predictOutput(
          'This function shrinks its argument before testing it. What does it print?',
          lines(
            'def step(n):',
            '    n = n - 1',
            '    if n == 0:',
            '        return "base"',
            '    return n',
            '',
            'print(step(0))',
          ),
          ['base', '0', '-1', 'None'],
          2,
          'The step turns 0 into −1 before the test, so the base case is missed; testing first would have returned "base".',
        ),
        choose(
          'A power function returns 1 when exponent == 0 and otherwise halves the exponent. Where must the zero test go?',
          [
            'After the halving step',
            'Before any step that shrinks the exponent',
            'At the end of the function',
            'Inside the multiplication',
          ],
          1,
          'The base input must be recognized before anything changes it.',
        ),
        predictOutput(
          'What is printed?',
          lines(
            'def power_step(exponent):',
            '    if exponent == 0:',
            '        return 1',
            '    return exponent // 2',
            '',
            'print(power_step(0), power_step(9))',
          ),
          ['0 4', '1 4.5', '1 None', '1 4'],
          3,
          '0 returns the base answer 1; 9 skips the test and returns the halved argument 4.',
        ),
      ],
    },
  ],
  'cp-recursive-shrink': [
    {
      title: 'Halve the exponent toward zero',
      explanation: [
        'A recursive step must move every allowed input closer to the base case. For a positive integer e, e // 2 is strictly smaller and still nonnegative, so repeated halving must eventually reach 0.',
        'A step that does not always shrink, such as (e + 1) // 2, which leaves 1 at 1, would repeat the same input forever.',
      ],
      example: {
        code: lines(
          'exponent = 13',
          'arguments = [exponent]',
          'while exponent > 0:',
          '    exponent = exponent // 2',
          '    arguments.append(exponent)',
          'print(arguments)',
        ),
        output: '[13, 6, 3, 1, 0]',
        explanation:
          'Each halving rounds down, so 13 becomes 6, then 3, then 1, and finally the base case 0.',
      },
      questions: [
        choose(
          'For exponent 7, what is the next argument after integer halving?',
          ['3', '3.5', '4', '14'],
          0,
          '7 // 2 rounds down to 3; integer halving never produces a fraction.',
        ),
        predictOutput(
          'What does this program print?',
          lines(
            'exponent = 20',
            'arguments = [exponent]',
            'while exponent > 0:',
            '    exponent = exponent // 2',
            '    arguments.append(exponent)',
            'print(arguments)',
          ),
          [
            '[20, 10, 5, 2, 1]',
            '[10, 5, 2, 1, 0]',
            '[20, 10, 5, 2, 1, 0]',
            '[20, 10, 5, 3, 2, 1, 0]',
          ],
          2,
          'The list starts with 20 and ends with the base case 0; 5 // 2 rounds down to 2.',
        ),
        choose(
          'Which step reaches exponent 0 from every positive integer exponent?',
          [
            '(exponent + 1) // 2',
            'exponent // 2',
            'exponent * 2',
            'exponent % 2',
          ],
          1,
          'exponent // 2 is always smaller for positive values; the others stall at 1 or grow.',
        ),
        predictOutput(
          'What is printed?',
          lines(
            'exponent = 5',
            'for _ in range(5):',
            '    exponent = (exponent + 1) // 2',
            'print(exponent)',
          ),
          ['0', '3', '2', '1'],
          3,
          'At 1, (1 + 1) // 2 is 1 again, so this step stalls and never reaches the base case 0.',
        ),
      ],
    },
    {
      title: 'Count the halving steps',
      explanation: [
        'Each halving cuts the exponent at least in half, so a positive exponent e reaches 0 after about log₂ e + 1 steps: 1 needs one step, 2 and 3 need two, and 4 through 7 need three.',
        'A recursive chain whose argument halves at each level therefore has O(log e) depth, while a chain that subtracts 1 each time has depth e.',
      ],
      example: {
        code: lines(
          halvingSteps,
          'print(halving_steps(1), halving_steps(7), halving_steps(8))',
        ),
        output: '1 3 4',
        explanation:
          '7 goes 3, 1, 0 in three steps; 8 needs one more because it goes 4, 2, 1, 0.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          lines(halvingSteps, 'print(halving_steps(1000))'),
          ['500', '9', '10', '1000'],
          2,
          '1000 halves through 500, 250, 125, 62, 31, 15, 7, 3, 1 and 0: ten steps.',
        ),
        choose(
          'How does the number of halving steps grow with the exponent e?',
          ['O(e)', 'O(log e)', 'O(e²)', 'O(1)'],
          1,
          'Doubling e adds only one more halving step, which is logarithmic growth.',
        ),
        predictOutput(
          'What is printed?',
          lines(
            'e = 16',
            'down = 0',
            'while e > 0:',
            '    e -= 1',
            '    down += 1',
            'e = 16',
            'halves = 0',
            'while e > 0:',
            '    e //= 2',
            '    halves += 1',
            'print(down, halves)',
          ),
          ['16 4', '5 16', '8 5', '16 5'],
          3,
          'Subtracting 1 takes 16 steps, while halving goes 8, 4, 2, 1, 0 in five steps.',
        ),
        choose(
          'Exponents go up to 10⁹. About how deep is a recursive chain that halves the exponent at each level?',
          [
            'About 30 levels',
            'About 10⁹ levels',
            'About 500 million levels',
            'Exactly 9 levels',
          ],
          0,
          '2³⁰ is just over 10⁹, so about 30 halvings reach 0.',
        ),
      ],
    },
  ],
  'cp-recursive-combine': [
    {
      title: 'Square the half-power for an even exponent',
      explanation: [
        'If half equals base ** (exponent // 2), then half * half equals base ** (2 * (exponent // 2)). For an even exponent that is exactly base ** exponent.',
        'Combining multiplies the half-result by itself. Adding it to itself, or multiplying it by the exponent, computes something else.',
      ],
      example: {
        code: lines(
          'base = 3',
          'exponent = 4',
          'half = base ** (exponent // 2)',
          'print(half)',
          'print(half * half)',
        ),
        output: '9\n81',
        explanation: 'half is 3 ** 2 = 9, and 9 * 9 = 81 = 3 ** 4.',
      },
      questions: [
        choose(
          'half is 2 ** 3 = 8. What is 2 ** 6?',
          ['16', '64', '48', '11'],
          1,
          '2 ** 6 is (2 ** 3) * (2 ** 3) = 8 * 8 = 64.',
        ),
        predictOutput(
          'What does this program print?',
          lines(
            'def combine_even(half):',
            '    return half * half',
            '',
            'print(combine_even(5), combine_even(1))',
          ),
          ['10 2', '25 2', '10 1', '25 1'],
          3,
          'Combining squares the half-result: 5 * 5 = 25 and 1 * 1 = 1.',
        ),
        choose(
          'For exponent 10, which smaller exponent does half use?',
          ['9', '10', '5', '20'],
          2,
          'half is base ** (10 // 2) = base ** 5, and squaring it gives base ** 10.',
        ),
        predictOutput(
          'What is printed?',
          lines(
            'base = -2',
            'half = base ** 2',
            'print(half * half, base ** 4)',
          ),
          ['16 16', '-16 16', '16 -16', '-16 -16'],
          0,
          'half is 4, and 4 * 4 = 16, which matches (−2) ** 4 because the exponent is even.',
        ),
      ],
    },
    {
      title: 'Supply the extra factor for an odd exponent',
      explanation: [
        'For an odd exponent, exponent // 2 drops one: 7 // 2 is 3, and 3 + 3 is only 6. half * half then covers all but one factor, so multiply once more by base.',
        'Test oddness with exponent % 2 == 1. Reuse the single half value twice instead of computing the smaller power again.',
      ],
      example: {
        code: lines(
          combinePower,
          'print(combine_power(2, 7, 8))',
          'print(combine_power(2, 6, 8))',
        ),
        output: '128\n64',
        explanation:
          'Both use half = 2 ** 3 = 8. Exponent 7 is odd, so 64 is multiplied by 2 once more.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          lines(combinePower, 'print(combine_power(3, 5, 9))'),
          ['81', '243', '729', '27'],
          1,
          'half is 3 ** 2 = 9; 9 * 9 = 81 covers four factors, and the odd exponent adds one more 3.',
        ),
        predictOutput(
          'What is printed?',
          lines(
            combinePower,
            'print(combine_power(10, 3, 10), combine_power(10, 2, 10))',
          ),
          ['100 100', '1000 1000', '1000 100', '100 1000'],
          2,
          'Both have half = 10. Exponent 3 is odd and gets an extra factor of 10; exponent 2 does not.',
        ),
        choose(
          'Exponent 9 is computed from half = base ** 4. Which combination is correct?',
          [
            'half * half',
            'half * base',
            'half * half * 9',
            'half * half * base',
          ],
          3,
          'half * half gives base ** 8, and one more base makes base ** 9.',
        ),
        choose(
          'Why compute half once and multiply half * half, rather than computing the smaller power twice?',
          [
            'Both computations would solve the same subproblem',
            'Computing it twice gives a different answer',
            'Python cannot call a function twice in one line',
            'half * half is valid only for even exponents',
          ],
          0,
          'The two halves are identical, so one computation reused twice saves all the repeated work.',
        ),
      ],
    },
  ],
  'cp-recursion': [
    {
      title: 'Write a function that calls itself on a smaller input',
      explanation: [
        'A recursive function solves a problem by calling itself on a smaller version of the same problem. It needs a base case that returns without a call and a recursive step that moves toward that base case.',
        'Fast power combines the earlier ideas: return 1 at exponent 0; otherwise compute half = power(base, exponent // 2) once, square it, and multiply by base once more when the exponent is odd.',
      ],
      example: {
        code: lines(
          powerFunction,
          'print(power(3, 5))',
          'print(power(-2, 3))',
          'print(power(0, 0))',
        ),
        output: '243\n-8\n1',
        explanation:
          'Each call halves the exponent until the base case returns 1; the odd exponents 5 and 3 each pick up an extra factor on the way back.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          lines(powerFunction, 'print(power(2, 10), power(5, 0))'),
          ['1024 1', '1024 0', '512 1', '20 1'],
          0,
          '2 ** 10 is 1024, and any exponent 0 hits the base case and returns 1.',
        ),
        predictOutput(
          'Which exponents does this recursion receive, in order?',
          lines(
            'def power(base, exponent):',
            '    print(exponent)',
            '    if exponent == 0:',
            '        return 1',
            '    half = power(base, exponent // 2)',
            '    result = half * half',
            '    if exponent % 2 == 1:',
            '        result = result * base',
            '    return result',
            '',
            'power(2, 6)',
          ),
          ['6\n3\n1', '0\n1\n3\n6', '6\n3\n1\n0', '6\n5\n4\n3\n2\n1\n0'],
          2,
          'Each call prints before recursing, so the exponents appear as they shrink: 6, 3, 1 and finally the base case 0.',
        ),
        choose(
          'Which property must every recursive step have so that the calls finish?',
          [
            'It must print its argument',
            'It must call itself twice',
            'It must keep the argument unchanged',
            'It must move toward a reachable base case',
          ],
          3,
          'Only progress toward a base case guarantees that the chain of calls ends.',
        ),
        predictOutput(
          'This version forgets the odd factor. What does it print?',
          lines(
            'def power(base, exponent):',
            '    if exponent == 0:',
            '        return 1',
            '    half = power(base, exponent // 2)',
            '    return half * half',
            '',
            'print(power(2, 3), power(2, 4))',
          ),
          ['8 16', '1 1', '4 16', '8 8'],
          1,
          'Without the odd factor, power(2, 1) returns 1 * 1 = 1, and every larger call only squares that 1.',
        ),
      ],
    },
    {
      title: 'Trace return values back up the calls',
      explanation: [
        'Each call waits for its smaller call to return, then finishes its own combination. The deepest call returns first, and results flow back up in the reverse order of the calls.',
        'For power(2, 5) the calls use exponents 5, 2, 1 and 0. Returning upward they produce 1, then 2, then 4, then 32.',
      ],
      example: {
        code: lines(tracedPower, 'power(2, 5)'),
        output: '1 2\n2 4\n5 32',
        explanation:
          'Exponent 0 returns 1 without printing. Exponent 1 makes 1 · 1 · 2 = 2, exponent 2 makes 2 · 2 = 4, and exponent 5 makes 4 · 4 · 2 = 32.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          lines(tracedPower, 'power(3, 4)'),
          [
            '4 81\n2 9\n1 3',
            '1 3\n2 9\n4 81',
            '1 3\n2 6\n4 12',
            '1 3\n2 9\n3 27\n4 81',
          ],
          1,
          'The calls are 4, 2, 1, 0. Results print as calls finish, deepest first: 3, then 9, then 81.',
        ),
        choose(
          'In power(2, 5), which call returns its value first?',
          [
            'The call with exponent 5',
            'The call with exponent 2',
            'The call with exponent 0',
            'All calls return together',
          ],
          2,
          'Every other call is still waiting for a smaller call; the base case has nothing to wait for.',
        ),
        predictOutput(
          'What is printed?',
          lines(tracedPower, 'power(5, 3)'),
          ['3 125\n1 5', '1 5\n2 25\n3 125', '1 5\n3 25', '1 5\n3 125'],
          3,
          '3 // 2 is 1, so there is no exponent-2 call. Exponent 1 gives 5, and exponent 3 gives 5 · 5 · 5 = 125.',
        ),
        choose(
          'power(base, 1) returns base. Which steps produce that value?',
          [
            'half is power(base, 0) = 1, then 1 · 1 · base',
            'A base case returns base directly',
            'half is power(base, 1), then half · half',
            'Exponent 1 skips the odd-factor test',
          ],
          0,
          '1 // 2 is 0, which returns 1; squaring gives 1, and the odd exponent multiplies in base.',
        ),
      ],
    },
    {
      title: 'Keep the call depth logarithmic',
      explanation: [
        'Each call halves the exponent, so a positive exponent e leads to about log₂ e + 2 calls in total: one per halving plus the base case. Exponents up to 10⁹ need only about 31 calls.',
        'Python stops recursion at about 1,000 nested calls by default. A version that subtracts 1 per call would fail long before 10⁹, and a version that calls power twice per level instead of reusing half does about e calls of work.',
      ],
      example: {
        code: lines(callDepth, 'print(depth(1), depth(8), depth(1000000000))'),
        output: '2 5 31',
        explanation:
          'depth counts the calls in the chain. 8 goes 4, 2, 1, 0; 10⁹ needs 30 halvings plus the base-case call.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          lines(callDepth, 'print(depth(1000))'),
          ['10', '11', '1000', '500'],
          1,
          '1000 takes ten halvings to reach 0, and the base-case call adds one more.',
        ),
        choose(
          'A different power function recurses on exponent - 1. What happens for exponent 10⁹ in Python?',
          [
            'It exceeds the recursion depth limit',
            'It finishes in about 30 calls',
            'It returns 1 immediately',
            'It runs as fast as halving',
          ],
          0,
          'It would need a billion nested calls, far beyond Python’s limit of about 1,000.',
        ),
        choose(
          'A version computes power(base, exponent // 2) * power(base, exponent // 2) without saving half. How does its number of calls grow?',
          [
            'It stays O(log e)',
            'It halves',
            'It grows to about e calls',
            'It becomes about log² e',
          ],
          2,
          'Every level doubles the number of calls, and log₂ e doublings make about e calls.',
        ),
        predictOutput(
          'How many calls does the doubled version make?',
          lines(
            'calls = [0]',
            '',
            'def slow_power(base, exponent):',
            '    calls[0] += 1',
            '    if exponent == 0:',
            '        return 1',
            '    result = slow_power(base, exponent // 2) * slow_power(base, exponent // 2)',
            '    if exponent % 2 == 1:',
            '        result = result * base',
            '    return result',
            '',
            'print(slow_power(2, 8), calls[0])',
          ),
          ['256 5', '256 8', '256 16', '256 31'],
          3,
          'The answer is right, but each level calls twice: 1 + 2 + 4 + 8 + 16 = 31 calls instead of 5.',
        ),
      ],
    },
  ],
  // ---------------------------------------------------------- backtracking
  'cp-choice-undo': [
    {
      title: 'Undo the temporary choice before the next sibling',
      explanation: [
        'Backtracking builds a working path by appending a choice, exploring with it, and then popping it off. The pop restores the parent path, so the next sibling choice starts from the same state.',
        'Without the pop, each sibling inherits every earlier sibling’s choice.',
      ],
      example: {
        code: lines(
          'working = ["root"]',
          'for choice in ["left", "right"]:',
          '    working.append(choice)',
          '    print(working)',
          '    working.pop()',
          'print(working)',
        ),
        output: "['root', 'left']\n['root', 'right']\n['root']",
        explanation:
          'left is removed before right is tried, so each branch is the parent plus one choice, and the parent is restored at the end.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          lines(
            'working = [0]',
            'for value in [1, 2, 3]:',
            '    working.append(value)',
            '    print(working)',
            '    working.pop()',
          ),
          [
            '[0, 1]\n[0, 1, 2]\n[0, 1, 2, 3]',
            '[0, 1]\n[0, 2]\n[0, 3]',
            '[1]\n[2]\n[3]',
            '[0, 1]\n[0, 2]\n[0, 2, 3]',
          ],
          1,
          'Each value is appended to the parent [0], printed, and removed before the next value.',
        ),
        predictOutput(
          'This loop forgets the pop. What is printed?',
          lines(
            'working = ["s"]',
            'for value in ["a", "b"]:',
            '    working.append(value)',
            '    print(working)',
          ),
          [
            "['s', 'a']\n['s', 'b']",
            "['a']\n['b']",
            "['s', 'a']\n['s', 'a', 'b']",
            "['s', 'a', 'b']\n['s', 'a', 'b']",
          ],
          2,
          'a is never removed, so the second branch wrongly inherits it.',
        ),
        choose(
          'Which operation undoes an append made just before it?',
          [
            'working.pop()',
            'working.pop(0)',
            'working.clear()',
            'working.sort()',
          ],
          0,
          'pop() removes the rightmost entry, which is exactly the one append added.',
        ),
        choose(
          'The parent path is [5]. Choices 1 and then 2 are explored with append, explore, pop. What is the path while choice 2 is explored?',
          ['[5, 1, 2]', '[2]', '[5, 1]', '[5, 2]'],
          3,
          'Choice 1 was popped, so choice 2 is appended to the restored parent [5].',
        ),
      ],
    },
    {
      title: 'Restore the parent after every branch',
      explanation: [
        'The rule append, explore, pop keeps an invariant: after a branch finishes, the working path is exactly what it was before the branch started, even when the exploration inside appends and pops choices of its own.',
        'So after all siblings have been tried, the path equals the parent path again, and the caller can continue from it.',
      ],
      example: {
        code: lines(
          'path = []',
          'for first in ["a", "b"]:',
          '    path.append(first)',
          '    for second in ["x", "y"]:',
          '        path.append(second)',
          '        print(path)',
          '        path.pop()',
          '    path.pop()',
          'print(path)',
        ),
        output: "['a', 'x']\n['a', 'y']\n['b', 'x']\n['b', 'y']\n[]",
        explanation:
          'Each inner pop restores [first], and each outer pop restores the empty path, so b starts as cleanly as a did.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          lines(
            'path = [9]',
            'for a in [1, 2]:',
            '    path.append(a)',
            '    for b in [3, 4]:',
            '        path.append(b)',
            '        path.pop()',
            '    path.pop()',
            'print(path, len(path))',
          ),
          ['[9] 1', '[9, 2, 4] 3', '[] 0', '[9, 1, 2] 3'],
          0,
          'Every append is matched by a pop, so the path returns to its starting value [9].',
        ),
        predictOutput(
          'The inner pop is missing. What is printed?',
          lines(
            'path = []',
            'for a in ["p", "q"]:',
            '    path.append(a)',
            '    for b in ["r"]:',
            '        path.append(b)',
            '    path.pop()',
            'print(path)',
          ),
          ['[]', "['p', 'q']", "['q']", "['p', 'q', 'r']"],
          1,
          'Each outer pop removes r instead of a, so p and q are both left behind.',
        ),
        choose(
          'After a branch that appends and pops correctly finishes, what must the working path equal?',
          [
            'The longest path explored',
            'An empty list',
            'The path the branch started from',
            'The last saved result',
          ],
          2,
          'Every append inside the branch was undone, so the path is back to its starting state.',
        ),
        choose(
          'One branch appends twice but pops only once. What happens to the next sibling?',
          [
            'It starts from the correct parent',
            'It starts from an empty path',
            'It raises IndexError',
            'It starts with one leftover choice',
          ],
          3,
          'The unmatched append stays on the path, so the sibling begins with an extra entry.',
        ),
      ],
    },
  ],
  'cp-path-snapshot': [
    {
      title: 'A saved reference keeps changing',
      explanation: [
        'results.append(path) stores the same list object, not its current contents. When the working path changes later, every stored reference shows the change.',
        'In backtracking the path ends up empty, so saved references usually all look empty by the end.',
      ],
      example: {
        code: lines(
          'path = [2, 5]',
          'results = []',
          'results.append(path)',
          'path.pop()',
          'path.append(7)',
          'print(results)',
        ),
        output: '[[2, 7]]',
        explanation:
          'results holds the path list itself, so it shows the path’s current contents [2, 7], not the [2, 5] it held when saved.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          lines(
            'path = []',
            'saved = []',
            'for value in [1, 2]:',
            '    path.append(value)',
            '    saved.append(path)',
            '    path.pop()',
            'print(saved)',
          ),
          ['[[1], [2]]', '[[], []]', '[[1, 2], [1, 2]]', '[[2], [2]]'],
          1,
          'Both entries are the same path list, which is empty after the final pop.',
        ),
        choose(
          'What does results.append(path) store?',
          [
            'A frozen copy of path',
            'Only the last entry of path',
            'A reference to the same list',
            'The length of path',
          ],
          2,
          'Appending a list stores that list object, so later changes to it are visible through results.',
        ),
        predictOutput(
          'What is printed?',
          lines(
            'path = ["a"]',
            'first = path',
            'path.append("b")',
            'print(first)',
            'print(len(first))',
          ),
          ["['a', 'b']\n2", "['a']\n1", "['b']\n1", "['a']\n2"],
          0,
          'first and path name one list, so the append is visible through first.',
        ),
        choose(
          'A search saves path itself at each solution and finishes with path empty. What do the saved results look like?',
          [
            'Each solution as it was found',
            'Only the first solution',
            'Only the longest solution',
            'Empty lists, all one object',
          ],
          3,
          'Every saved entry is the working path, which ends empty.',
        ),
      ],
    },
    {
      title: 'Save path.copy() at a solution',
      explanation: [
        'path.copy() creates a new list holding the entries present at that moment. Later appends and pops on path do not touch the copy.',
        'A shallow copy is enough when the entries are integers or strings, because those values cannot change in place; only the list holding them changes.',
      ],
      example: {
        code: lines(
          'path = []',
          'saved = []',
          'for value in [1, 2]:',
          '    path.append(value)',
          '    saved.append(path.copy())',
          '    path.pop()',
          'print(saved)',
          'print(path)',
        ),
        output: '[[1], [2]]\n[]',
        explanation:
          'Each copy freezes the path as it was, so both solutions survive while the working path returns to empty.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          lines(
            'path = [4]',
            'snapshot = path.copy()',
            'path.append(6)',
            'path.pop(0)',
            'print(snapshot, path)',
          ),
          ['[4, 6] [6]', '[6] [6]', '[4] [6]', '[4] [4, 6]'],
          2,
          'The snapshot was taken before either change, so it keeps [4] while path becomes [6].',
        ),
        predictOutput(
          'What is printed?',
          lines(
            'def save_path(paths, current):',
            '    result = paths.copy()',
            '    result.append(current.copy())',
            '    return result',
            '',
            'current = [3, 1]',
            'saved = save_path([[0]], current)',
            'current.append(8)',
            'print(saved)',
          ),
          ['[[0], [3, 1]]', '[[0], [3, 1, 8]]', '[[3, 1]]', '[[0, 3, 1]]'],
          0,
          'The saved entry is a copy of current, so the later append does not reach it.',
        ),
        choose(
          'Why is a shallow path.copy() enough when the path holds integers?',
          [
            'Integer lists are immutable',
            'Integers cannot be changed in place',
            'copy() also copies nested lists',
            'Python copies integers on every append',
          ],
          1,
          'The copy has its own list, and the integers inside it can never be modified.',
        ),
        choose(
          'Which line correctly records a finished combination while the search continues?',
          [
            'results.append(path)',
            'results = path',
            'results.append(path[-1])',
            'results.append(path.copy())',
          ],
          3,
          'Only a copy keeps the combination after the working path changes.',
        ),
      ],
    },
  ],
  'cp-remaining-capacity': [
    {
      title: 'Count what is still needed and still available',
      explanation: [
        'A selection of k distinct indices that already holds chosen entries still needs k − chosen more. If the next index it may use is start, the indices start through n − 1 remain: n − start of them.',
        'These two numbers describe any partial selection, whatever was chosen so far.',
      ],
      example: {
        code: lines(
          'n = 6',
          'k = 4',
          'start = 3',
          'chosen = 2',
          'print(k - chosen, n - start)',
        ),
        output: '2 3',
        explanation:
          'Two more indices are needed, and indices 3, 4 and 5 are still available.',
      },
      questions: [
        choose(
          'n = 10 and the next usable index is 7. How many indices remain?',
          ['7', '4', '3', '17'],
          2,
          'Indices 7, 8 and 9 remain: 10 − 7 = 3.',
        ),
        predictOutput(
          'What does this program print?',
          lines(
            'n = 8',
            'k = 5',
            'start = 6',
            'chosen = 3',
            'print(k - chosen, n - start)',
          ),
          ['2 2', '3 2', '2 3', '5 2'],
          0,
          'Two more are needed (5 − 3), and indices 6 and 7 remain (8 − 6).',
        ),
        choose(
          'A selection needs k = 4 entries and has chosen 1. How many more must it pick?',
          ['4', '5', '1', '3'],
          3,
          'It still needs k − chosen = 4 − 1 = 3.',
        ),
        predictOutput(
          'What is printed?',
          lines(
            'n = 7',
            'start = 4',
            'print(list(range(start, n)), n - start)',
          ),
          ['[4, 5, 6, 7] 4', '[4, 5, 6] 3', '[5, 6] 2', '[0, 1, 2, 3] 4'],
          1,
          'range(start, n) stops before n, so indices 4, 5 and 6 remain: n − start = 3.',
        ),
      ],
    },
    {
      title: 'Prune when too few indices remain',
      explanation: [
        'A branch can still succeed exactly when needed ≤ available, that is k − chosen ≤ n − start. If more are needed than remain, no choice of later indices can finish the selection, so the search should stop exploring that branch.',
        'Equality is feasible: every remaining index must then be taken. Pruning early skips whole subtrees that could never produce a result.',
      ],
      example: {
        code: lines(
          canComplete,
          'print(can_complete(7, 5, 1, 4))',
          'print(can_complete(7, 5, 2, 4))',
          'print(can_complete(7, 7, 4, 4))',
        ),
        output: 'False\nTrue\nTrue',
        explanation:
          'The first branch needs 3 but only 2 remain. The second needs exactly the 2 that remain. The third needs nothing more.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          lines(
            canComplete,
            'print(can_complete(5, 3, 0, 3), can_complete(5, 3, 1, 3))',
          ),
          ['True True', 'False False', 'True False', 'False True'],
          3,
          'The first needs 3 with only 2 left; the second needs 2 with 2 left, which is feasible.',
        ),
        choose(
          'n = 9, start = 7, and the selection still needs 3 more indices. What should the search do with this branch?',
          [
            'Keep it, since 7 is below 9',
            'Prune it; only 2 indices remain',
            'Reuse index 8 twice',
            'Save the partial selection',
          ],
          1,
          'Only indices 7 and 8 remain, and distinct indices cannot be reused.',
        ),
        choose(
          'For a branch, needed equals available. What does that mean?',
          [
            'Every remaining index must be chosen',
            'The branch must be pruned',
            'The selection is already complete',
            'Any one remaining index finishes it',
          ],
          0,
          'The branch is feasible, but only by taking all of the remaining indices.',
        ),
        predictOutput(
          'Which starting positions are still feasible?',
          lines(
            'n = 6',
            'k = 3',
            'chosen = 1',
            'print([start for start in range(n + 1) if k - chosen <= n - start])',
          ),
          [
            '[0, 1, 2, 3]',
            '[0, 1, 2, 3, 4, 5]',
            '[0, 1, 2, 3, 4]',
            '[4, 5, 6]',
          ],
          2,
          'Two more are needed, so at least two indices must remain: n − start ≥ 2 means start ≤ 4.',
        ),
      ],
    },
  ],
  'cp-backtracking': [
    {
      title: 'Enumerate combinations with append, recurse, pop',
      explanation: [
        'To list every way to choose k of the indices 0 through n − 1, keep a working path. At each level, try each allowed next index: append it, recurse to fill the rest, then pop it so the next choice starts from the same parent.',
        'Starting the next level after the last chosen index keeps every path increasing. Each combination is then produced once, in lexicographic order, instead of once per ordering.',
      ],
      example: {
        code: lines(combinations('path.copy()'), 'print(combinations(4, 2))'),
        output: '[[0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]]',
        explanation:
          'Each path starts after its previous index, so [1, 0] is never produced, and the six pairs appear in lexicographic order.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          lines(combinations('path.copy()'), 'print(combinations(3, 2))'),
          [
            '[[0, 1], [0, 2], [1, 2]]',
            '[[0, 1], [1, 0], [0, 2], [2, 0], [1, 2], [2, 1]]',
            '[[0, 1], [1, 2]]',
            '[[0, 1], [0, 2], [1, 2], [2, 2]]',
          ],
          0,
          'Each pair appears once in increasing order; visit(index + 1) prevents reversed and repeated indices.',
        ),
        predictOutput(
          'How many combinations are listed?',
          lines(combinations('path.copy()'), 'print(len(combinations(5, 3)))'),
          ['60', '10', '15', '20'],
          1,
          'There are C(5, 3) = 10 increasing triples; 60 would count every ordering.',
        ),
        predictOutput(
          'What is printed?',
          lines(
            combinations('path.copy()'),
            'print(combinations(3, 0))',
            'print(combinations(2, 3))',
          ),
          ['[]\n[]', '[[]]\n[[]]', '[[]]\n[]', '[]\n[[]]'],
          2,
          'Choosing zero indices has one answer, the empty selection. Choosing 3 of 2 indices has none.',
        ),
        choose(
          'Why does the recursive call use visit(index + 1) rather than visit(start)?',
          [
            'To count the solutions',
            'To stop the recursion at depth 1',
            'To reverse the final result',
            'To keep each path increasing so no combination repeats',
          ],
          3,
          'Later choices must come after the current index, so each set of indices appears in one order only.',
        ),
      ],
    },
    {
      title: 'Snapshot complete paths and restore the parent',
      explanation: [
        'When the path reaches length k, save path.copy(). The working path keeps changing as other branches are explored, so saving path itself would leave every result pointing at one list that ends empty.',
        'The pop after each recursive call is what makes the next snapshot correct: whenever control returns to a level, the path holds exactly that level’s parent choices.',
      ],
      example: {
        code: lines(combinations('path'), 'print(combinations(3, 2))'),
        output: '[[], [], []]',
        explanation:
          'All three saved entries are the same path list, which is empty once the search finishes. Saving path.copy() would keep [0, 1], [0, 2] and [1, 2].',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          lines(
            'path = []',
            '',
            'def visit(start, n, k):',
            '    if len(path) == k:',
            '        print(path)',
            '        return',
            '    for index in range(start, n):',
            '        path.append(index)',
            '        visit(index + 1, n, k)',
            '        path.pop()',
            '',
            'visit(0, 3, 1)',
            'print(path)',
          ),
          [
            '[0]\n[0, 1]\n[0, 1, 2]\n[0, 1, 2]',
            '[0]\n[1]\n[2]\n[]',
            '[0]\n[1]\n[2]\n[2]',
            '[0, 1, 2]\n[]',
          ],
          1,
          'Printing happens at each leaf, and each pop restores the empty parent before the next index is tried.',
        ),
        predictOutput(
          'This search forgets the pop. What is printed?',
          lines(
            'path = []',
            'result = []',
            '',
            'def visit(start, n, k):',
            '    if len(path) == k:',
            '        result.append(path.copy())',
            '        return',
            '    for index in range(start, n):',
            '        path.append(index)',
            '        visit(index + 1, n, k)',
            '',
            'visit(0, 3, 1)',
            'print(result)',
          ),
          ['[[0], [1], [2]]', '[[0], [0, 1], [0, 1, 2]]', '[[0]]', '[]'],
          2,
          'After [0] is saved, 0 is never removed, so the path is too long at every later check and nothing else is saved.',
        ),
        choose(
          'A search saved result.append(path) at each of three solutions. What does result show when the search finishes?',
          [
            'Three different combinations',
            'The last combination three times',
            'The first combination three times',
            'Three empty lists, all one object',
          ],
          3,
          'Each entry is the working path itself, and that path ends empty.',
        ),
        choose(
          'Right after visit(index + 1) returns inside the loop, before the pop, what does path hold?',
          [
            'The parent choices plus index',
            'Only the parent choices',
            'An empty list',
            'A complete combination',
          ],
          0,
          'The deeper call undid everything it added, so only this level’s append of index remains.',
        ),
      ],
    },
    {
      title: 'Prune branches that cannot be completed',
      explanation: [
        'If a branch needs more indices than remain, it cannot reach length k. Stop the loop early with range(start, n − needed + 1), where needed = k − len(path): any later first choice would leave too few indices.',
        'Pruning skips dead branches but never a valid combination. Listing all results still takes O((k + 1) · C(n, k)) time, because each of the C(n, k) results is copied, and the path itself uses O(k) extra space.',
      ],
      example: {
        code: lines(
          countVisits,
          'print(visits(5, 3, False), visits(5, 3, True))',
        ),
        output: '26 20',
        explanation:
          'Both versions find the same 10 combinations, but the pruned search never enters the 6 dead prefixes, such as [3] or [0, 4], that leave too few indices.',
      },
      questions: [
        choose(
          'n = 6, k = 4, and the path already holds 1 index. What is the largest index the pruned loop tries next?',
          ['5', '4', '3', '2'],
          2,
          'needed = 3, so the loop is range(start, 6 − 3 + 1) = range(start, 4), whose last index is 3.',
        ),
        predictOutput(
          'What does this program print?',
          lines(countVisits, 'print(visits(4, 2, False), visits(4, 2, True))'),
          ['10 10', '11 10', '11 6', '16 10'],
          1,
          'Without pruning the search also enters the dead prefix [3]; pruning skips just that one call.',
        ),
        choose(
          'Does pruning with range(start, n − needed + 1) ever skip a valid combination?',
          [
            'Yes, the ones using index n − 1',
            'Yes, whenever k is larger than n / 2',
            'No, because it never changes the loop bounds',
            'No, it skips only branches that cannot be completed',
          ],
          3,
          'Any first choice past that bound leaves fewer indices than are still needed.',
        ),
        choose(
          'Listing every k-element combination of n indices returns C(n, k) lists of length k. Which cost bound fits?',
          ['O((k + 1) · C(n, k))', 'O(n)', 'O(k log n)', 'O(n^k · k!)'],
          0,
          'Copying each of the C(n, k) results costs O(k + 1), and that output dominates the search.',
        ),
      ],
    },
  ],
  // ---------------------------------------------------- binary search trees
  'cp-bst-bounds': [
    {
      title: 'Every descendant inherits its ancestors’ bounds',
      explanation: [
        'In a strict binary search tree, every key in a node’s left subtree is smaller than the node’s key, and every key in its right subtree is larger. That applies to all descendants, not only to the immediate children.',
        'So a node deep in the tree must lie strictly between the nearest ancestor it went right from and the nearest ancestor it went left from. Going left at 9 and then right at 4 confines a key to the open interval (4, 9).',
      ],
      example: {
        code: lines(
          insideBounds,
          '# a node reached by going left at 9, then right at 4',
          'print(inside(6, 4, 9))',
          'print(inside(11, 4, 9))',
          'print(inside(3, 4, 9))',
        ),
        output: 'True\nFalse\nFalse',
        explanation:
          '11 is above its parent 4, but it sits in 9’s left subtree, so it breaks the inherited upper bound 9. 3 breaks the lower bound 4.',
      },
      questions: [
        choose(
          'The root is 20. A node is reached by going right at 20 and then left at 30. Which key may it hold?',
          ['15', '25', '35', '30'],
          1,
          'It must be above 20 and below 30, and only 25 lies strictly between them.',
        ),
        choose(
          'From the root, a search goes left at 50, right at 10, then right at 25. What open interval must the next key lie in?',
          ['(25, 50)', '(10, 25)', '(10, 50)', '(25, ∞)'],
          0,
          'Going left at 50 sets the upper bound 50, and the latest right turn at 25 sets the lower bound 25.',
        ),
        predictOutput(
          'What does this program print?',
          lines(
            insideBounds,
            'print(inside(7, None, 8), inside(7, 7, None), inside(-3, None, None))',
          ),
          [
            'True True True',
            'False False True',
            'True False False',
            'True False True',
          ],
          3,
          '7 is below 8; 7 equals its lower bound, which fails; with no bounds any key fits.',
        ),
        choose(
          'Which tree passes a check of each node against its parent, yet is not a valid search tree?',
          [
            'Root 10, left child 5, and 5’s left child 2',
            'Root 10, right child 15, and 15’s left child 12',
            'Root 10, left child 5, and 5’s right child 12',
            'Root 10, right child 15, and 15’s right child 20',
          ],
          2,
          '12 is larger than its parent 5, but it lies in 10’s left subtree, where every key must be below 10.',
        ),
      ],
    },
    {
      title: 'Test a key against optional strict bounds',
      explanation: [
        'Represent a missing bound by None: the root has neither, and a node on the leftmost path has no lower bound. A key is valid when it is strictly greater than an existing lower bound and strictly smaller than an existing upper bound.',
        'Equality fails, because keys are distinct and a key equal to an ancestor’s key fits on neither side of it. Test lower is not None before comparing, since a number cannot be compared with None.',
      ],
      example: {
        code: lines(
          insideBounds,
          'print(inside(5, 5, None))',
          'print(inside(5, None, None))',
          'print(inside(0, -1, 1))',
        ),
        output: 'False\nTrue\nTrue',
        explanation:
          '5 equals its lower bound, so it fails. With no bounds, 5 fits. 0 lies strictly between −1 and 1.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          lines(
            insideBounds,
            'print(inside(9, 2, 9), inside(2, 2, 9), inside(3, 2, 9))',
          ),
          [
            'True True True',
            'False False True',
            'True False True',
            'False True True',
          ],
          1,
          'Both bounds are strict, so 9 and 2 fail by equality; only 3 lies strictly inside.',
        ),
        choose(
          'Why check lower is not None before testing key <= lower?',
          [
            'Comparing a number with None raises TypeError',
            'None is treated as zero',
            'It makes the test faster',
            'None is larger than every number',
          ],
          0,
          'Python cannot order an int and None, so the missing bound must be skipped rather than compared.',
        ),
        choose(
          'A node has bounds lower = 4 and upper = None. Which key is allowed?',
          ['4', '3', '-4', '100'],
          3,
          'It must be strictly above 4 and has no upper limit, so only 100 qualifies.',
        ),
        predictOutput(
          'What is printed?',
          lines(insideBounds, 'print(inside(0, None, 0), inside(-5, None, 0))'),
          ['True True', 'False False', 'False True', 'True False'],
          2,
          '0 equals the upper bound and fails; −5 is strictly below it.',
        ),
      ],
    },
  ],
  'cp-bst-branch': [
    {
      title: 'Compare once to choose a side',
      explanation: [
        'At a search-tree node with key k, a target equal to k is found. A smaller target can only be in the left subtree, because every right descendant is larger than k; a larger target can only be on the right.',
        'One comparison discards the entire other subtree. That is what lets a search follow a single path instead of visiting every node.',
      ],
      example: {
        code: lines(
          searchBranch,
          'print(branch(9, 6))',
          'print(branch(9, 12))',
          'print(branch(9, 9))',
        ),
        output: 'left\nright\nfound',
        explanation:
          '6 is smaller than 9, so only the left subtree can hold it; 12 can only be on the right; 9 is the node itself.',
      },
      questions: [
        choose(
          'At a node with key 15, the target is 21. Which part of the tree can still contain it?',
          [
            'Only the left subtree',
            'Only the right subtree',
            'Either subtree',
            'Only the current node',
          ],
          1,
          'Every left descendant is below 15, so a larger target can only be on the right.',
        ),
        predictOutput(
          'What does this program print?',
          lines(
            searchBranch,
            'print(branch(-2, -5), branch(0, 0), branch(3, 4))',
          ),
          [
            'right found left',
            'left left right',
            'left found right',
            'right found right',
          ],
          2,
          '−5 is smaller than −2, 0 equals 0, and 4 is larger than 3.',
        ),
        choose(
          'Why can a target smaller than the node’s key not be in its right subtree?',
          [
            'Every right-subtree key is larger than the node’s key',
            'The right subtree is always empty',
            'Right children are visited last',
            'Smaller keys are stored only at leaves',
          ],
          0,
          'The ordering rule covers the whole right subtree, so nothing there is smaller.',
        ),
        predictOutput(
          'What is printed?',
          lines(searchBranch, 'print([branch(50, t) for t in [10, 50, 70]])'),
          [
            "['right', 'found', 'left']",
            "['left', 'left', 'right']",
            "['left', 'right', 'right']",
            "['left', 'found', 'right']",
          ],
          3,
          '10 goes left, 50 is found, and 70 goes right.',
        ),
      ],
    },
    {
      title: 'Branch decisions do not depend on balance',
      explanation: [
        'The left-or-right rule works on any valid search tree, balanced or not. In a tall chain such as 1 → 2 → 3 → 4, where each node is the right child of the previous one, every decision is still correct; the search just needs more of them.',
        'A search makes one decision per node on its path, so the number of decisions is at most the tree’s height. Balance changes how many decisions are needed, never which side is correct.',
      ],
      example: {
        code: lines(
          searchBranch,
          '# keys on a right-leaning chain: 1 -> 2 -> 3 -> 4 -> 5',
          'made = []',
          'for key in [1, 2, 3, 4]:',
          '    made.append(branch(key, 4))',
          'print(made)',
        ),
        output: "['right', 'right', 'right', 'found']",
        explanation:
          'Each decision is correct even though the tree is a chain; reaching 4 simply takes four decisions.',
      },
      questions: [
        choose(
          'A search tree is a single chain of 1,000 nodes. What is true about searching it?',
          [
            'The branch decisions become unreliable',
            'Decisions stay correct, but a search may need 1,000',
            'It must be rebalanced before searching',
            'Each search needs exactly one decision',
          ],
          1,
          'The ordering rule still holds at every node; only the path length grows.',
        ),
        predictOutput(
          'Each key below is the left child of the one before it. What is printed?',
          lines(
            searchBranch,
            'made = []',
            'for key in [50, 40, 30]:',
            '    made.append(branch(key, 30))',
            'print(made)',
          ),
          [
            "['right', 'right', 'found']",
            "['left', 'found']",
            "['left', 'left', 'found']",
            "['found']",
          ],
          2,
          '30 is below 50 and 40, so the search goes left twice and then finds it.',
        ),
        choose(
          'What bounds the number of branch decisions in one search?',
          [
            'The number of keys smaller than the target',
            'The number of leaves',
            'Always 2',
            'The height of the tree',
          ],
          3,
          'Each decision moves one level down, so a path can have at most height-many nodes.',
        ),
        choose(
          'Target 3 is searched at a node with key 8, once in a balanced tree and once in a long chain. Which side does each search take there?',
          [
            'Left in both trees',
            'Left in the balanced tree, right in the chain',
            'Right in both trees',
            'It depends on the tree’s height',
          ],
          0,
          'The decision depends only on comparing 3 with 8, not on the tree’s shape.',
        ),
      ],
    },
  ],
  'cp-bst-candidate': [
    {
      title: 'Keep the largest key that fits under the limit',
      explanation: [
        'A floor query asks for the largest stored key that is at most limit. While examining keys one at a time, keep best: None until some key qualifies, and afterwards the largest qualifying key seen so far.',
        'A key larger than limit can never be the answer, so it leaves best unchanged. A qualifying key replaces best only when it is larger.',
      ],
      example: {
        code: lines(
          improveFloor,
          'best = None',
          'for key in [3, 12, 8, 5]:',
          '    best = improve_floor(best, key, 10)',
          'print(best)',
        ),
        output: '8',
        explanation:
          '3 starts the candidate, 12 is above the limit, 8 improves it, and 5 is smaller than 8.',
      },
      questions: [
        choose(
          'best = 6, limit = 9, and the next key is 9. What is best afterwards?',
          ['6', '9', 'None', '15'],
          1,
          '9 is at most the limit and larger than 6, so it becomes the new best.',
        ),
        predictOutput(
          'What does this program print?',
          lines(
            improveFloor,
            'best = None',
            'for key in [15, 11, 20]:',
            '    best = improve_floor(best, key, 10)',
            'print(best)',
          ),
          ['11', '10', '15', 'None'],
          3,
          'Every key is above 10, so none qualifies and best stays None.',
        ),
        predictOutput(
          'What is printed?',
          lines(
            improveFloor,
            'print(improve_floor(7, 13, 10), improve_floor(7, 2, 10))',
          ),
          ['13 2', '7 2', '7 7', 'None 7'],
          2,
          '13 exceeds the limit and 2 is smaller than 7, so best stays 7 both times.',
        ),
        choose(
          'Why start best at None rather than 0?',
          [
            '0 might be a real qualifying key',
            'None is larger than every integer',
            'Floor queries never return 0',
            '0 cannot be compared with keys',
          ],
          0,
          'None means no key has qualified, while 0 could be a stored answer or wrongly beat negative keys.',
        ),
      ],
    },
    {
      title: 'Treat None as no answer yet',
      explanation: [
        'None means no key has qualified. In the test best is None or key > best, the None check comes first: comparing an integer with None raises TypeError, and or skips the comparison once best is None.',
        'When every key exceeds the limit, best stays None, which is the correct answer. Starting from 0 instead would invent a key that was never stored and would hide negative answers.',
      ],
      example: {
        code: lines(
          improveFloor,
          'best = None',
          'for key in [-4, -9, 2]:',
          '    best = improve_floor(best, key, -1)',
          'print(best)',
        ),
        output: '-4',
        explanation:
          '−4 qualifies first, −9 is smaller, and 2 exceeds the limit −1. Starting at 0 would have hidden the answer, since 0 is larger than every qualifying key.',
      },
      questions: [
        predictOutput(
          'This version starts best at 0. What does it print?',
          lines(
            'best = 0',
            'for key in [-4, -9, 2]:',
            '    if key <= -1 and key > best:',
            '        best = key',
            'print(best)',
          ),
          ['-4', '0', '-9', '2'],
          1,
          'No qualifying key beats 0, so the program reports 0, a key that was never stored.',
        ),
        predictOutput(
          'What is printed?',
          lines(
            improveFloor,
            'print(improve_floor(None, 5, 5), improve_floor(None, 6, 5))',
          ),
          ['5 None', '5 5', 'None None', '5 6'],
          0,
          '5 qualifies and replaces None; 6 exceeds the limit, so best stays None.',
        ),
        choose(
          'Which condition safely decides whether key should replace best?',
          [
            'key > best or best is None',
            'key <= limit and key > best',
            'key <= limit and (best is None or key > best)',
            'best is None and key <= limit',
          ],
          2,
          'It checks the limit and tests None before comparing; the others compare with None or never improve best.',
        ),
        choose(
          'Every stored key is greater than limit. What should a floor query return?',
          ['0', 'The smallest stored key', 'limit itself', 'None'],
          3,
          'No key qualifies, so the answer is the absence marker None.',
        ),
      ],
    },
  ],
  'cp-bst': [
    {
      title: 'Search a tuple tree by following one path',
      explanation: [
        'Represent a node as (key, left, right), with None for an absent child. To search, compare the target with the current key: stop when equal, otherwise move to left when the target is smaller and to right when it is larger. Reaching None means the key is not stored.',
        'A while loop is enough. Each step follows one branch, so the search visits a single root-to-leaf path at most.',
      ],
      example: {
        code: lines(
          sampleTree,
          '',
          treeContains,
          'print(contains(tree, 15))',
          'print(contains(tree, 35))',
        ),
        output: 'True\nFalse',
        explanation:
          '15 is found by going left at 20 and right at 10. 35 goes right at 20, right at 30, then left at 40 into None.',
      },
      questions: [
        predictOutput(
          'Which keys does each search visit?',
          lines(
            sampleTree,
            '',
            'def visited(node, target):',
            '    keys = []',
            '    while node is not None:',
            '        key, left, right = node',
            '        keys.append(key)',
            '        if target == key:',
            '            return keys',
            '        if target < key:',
            '            node = left',
            '        else:',
            '            node = right',
            '    return keys',
            '',
            'print(visited(tree, 5))',
            'print(visited(tree, 33))',
          ),
          [
            '[20, 10, 5]\n[20, 30, 40]',
            '[5]\n[40]',
            '[20, 10, 5]\n[20, 30]',
            '[20, 10, 15, 5]\n[20, 30, 40]',
          ],
          0,
          'Each search follows one path. 33 passes 30, then goes left at 40 into None after visiting it.',
        ),
        predictOutput(
          'What is printed?',
          lines(
            sampleTree,
            '',
            treeContains,
            'print(contains(tree, 40), contains(tree, 10), contains(tree, 12))',
          ),
          [
            'True True True',
            'True False False',
            'False True False',
            'True True False',
          ],
          3,
          '40 and 10 are stored. 12 goes left at 20, right at 10, then left at 15 into None.',
        ),
        choose(
          'A search reaches None. What does that tell you?',
          [
            'The target is in the other subtree',
            'The target is not stored in the tree',
            'The tree is unbalanced',
            'The target is the smallest key',
          ],
          1,
          'Every comparison ruled out the other side, so the only place the target could be is empty.',
        ),
        choose(
          'Which tuple is a valid strict search tree?',
          [
            '(5, (7, None, None), None)',
            '(5, (2, None, (6, None, None)), None)',
            '(5, (2, None, (4, None, None)), (8, None, None))',
            '(5, None, (5, None, None))',
          ],
          2,
          'Every left-subtree key (2, 4) is below 5 and the right key 8 is above it; the others break the rule somewhere.',
        ),
      ],
    },
    {
      title: 'Find the largest key at most a limit',
      explanation: [
        'For a floor query, walk down from the root. If the current key is at most limit, it is a candidate: record it, then go right, because only larger keys could beat it. If the key is too large, go left, since only smaller keys can qualify.',
        'When the walk reaches None, the last recorded candidate is the answer, or None if no key qualified. Like plain search, this follows a single path.',
      ],
      example: {
        code: lines(
          sampleTree,
          '',
          treeFloor,
          'print(floor(tree, 17), floor(tree, 30), floor(tree, 3))',
        ),
        output: '15 30 None',
        explanation:
          'For 17: 20 is too big, 10 qualifies, then 15 improves it. For 30: 20 then 30 qualify. For 3: every key on the path is too big.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          lines(
            sampleTree,
            '',
            treeFloor,
            'print(floor(tree, 39), floor(tree, 12))',
          ),
          ['40 15', '30 10', '30 15', '20 10'],
          1,
          'For 39, 20 and 30 qualify but 40 does not. For 12, 10 qualifies and 15 is too big.',
        ),
        choose(
          'The current key is 12 and the limit is 25. What should the floor search do?',
          [
            'Return 12 immediately',
            'Record 12 and continue left',
            'Record 12 and continue right',
            'Skip 12 and continue left',
          ],
          2,
          '12 qualifies, and a better answer can only be larger, which means the right subtree.',
        ),
        choose(
          'The current key is 50 and the limit is 25. Why go left without recording 50?',
          [
            '50 is too large, and only smaller keys can qualify',
            '50 might still be the answer later',
            'The right subtree is always empty',
            'Left keys are larger than 50',
          ],
          0,
          'A key above the limit can never be the floor, and everything to its right is larger still.',
        ),
        predictOutput(
          'Which candidates are recorded on the way down?',
          lines(
            sampleTree,
            '',
            'def floor_trace(node, limit):',
            '    candidates = []',
            '    while node is not None:',
            '        key, left, right = node',
            '        if key <= limit:',
            '            candidates.append(key)',
            '            node = right',
            '        else:',
            '            node = left',
            '    return candidates',
            '',
            'print(floor_trace(tree, 35))',
          ),
          ['[30]', '[20, 30, 40]', '[40, 30]', '[20, 30]'],
          3,
          '20 and 30 qualify and send the search right; 40 is too big, and its left child is None.',
        ),
      ],
    },
    {
      title: 'Relate search time to tree height',
      explanation: [
        'Each step moves one level down, so a search takes O(h) time on a tree of height h, and the loop uses O(1) extra space. A balanced tree with n keys has height about log₂ n.',
        'Search-tree order does not make a tree balanced. Inserting keys in sorted order produces a chain of height n, so a search can take O(n) steps. A loop also avoids Python’s recursion limit on such tall trees.',
      ],
      example: {
        code: lines(
          searchSteps,
          'chain = None',
          'for key in [5, 4, 3, 2, 1]:',
          '    chain = (key, None, chain)',
          'balanced = (3, (2, (1, None, None), None), (4, None, (5, None, None)))',
          'print(steps(chain, 5), steps(balanced, 5))',
        ),
        output: '5 3',
        explanation:
          'Both trees hold 1 through 5 and are valid. The chain has height 5, so finding 5 takes five steps; the shallower tree needs three.',
      },
      questions: [
        choose(
          'What is the worst-case time to search an n-node search tree that is a single chain?',
          ['O(log n)', 'O(1)', 'O(n)', 'O(n²)'],
          2,
          'The chain has height n, and a search may walk all of it.',
        ),
        predictOutput(
          'What does this program print?',
          lines(
            searchSteps,
            'chain = None',
            'for key in [8, 7, 6, 5, 4, 3, 2, 1]:',
            '    chain = (key, None, chain)',
            'print(steps(chain, 8), steps(chain, 0))',
          ),
          ['8 1', '8 8', '7 0', '1 8'],
          0,
          '8 is at the bottom of the chain. 0 is smaller than the root 1, whose left child is None, so that search ends after one step.',
        ),
        choose(
          'Keys 1, 2, …, n are inserted in increasing order into an initially empty search tree. What shape results?',
          [
            'A balanced tree of height log n',
            'A chain of height n',
            'A tree with every key at one level',
            'An invalid search tree',
          ],
          1,
          'Each new key is larger than all earlier ones, so it always becomes the right child of the previous key.',
        ),
        choose(
          'Why search a tree that may be a 100,000-node chain with a while loop instead of recursion?',
          [
            'Recursion would give wrong answers',
            'A loop makes the tree balanced',
            'Loops visit fewer nodes than recursion',
            'Deep recursion exceeds Python’s recursion limit',
          ],
          3,
          'A recursive search would nest one call per level, far beyond Python’s default limit of about 1,000.',
        ),
      ],
    },
  ],
  // ------------------------------------------------------- tree traversal
  'cp-tree-children': [
    {
      title: 'Unpack a node and spot an absent child',
      explanation: [
        'A binary node here is a tuple (key, left, right), and an absent child is None. Unpacking with key, left, right = node gives the three parts.',
        'Only None means absent. A child whose key is 0 or negative, or that is itself a leaf like (0, None, None), is a real node.',
      ],
      example: {
        code: lines(
          'node = (7, (0, None, None), None)',
          'key, left, right = node',
          'print(key)',
          'print(left is None, right is None)',
        ),
        output: '7\nFalse True',
        explanation:
          'The left child is a real leaf with key 0; only the right child is absent.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          lines(
            'node = (3, None, (-1, None, None))',
            'key, left, right = node',
            'print(left, right[0])',
          ),
          ['None -1', '-1 None', 'None None', '3 -1'],
          0,
          'The left child is absent, and the right child is a real node whose key is −1.',
        ),
        choose(
          'In this tuple representation, what marks an absent child?',
          ['A key of 0', 'An empty tuple', 'None', 'A negative key'],
          2,
          'Any tuple is a real node, whatever its key; only None means no child.',
        ),
        predictOutput(
          'How many real children does each node have?',
          lines(
            'def count_children(node):',
            '    key, left, right = node',
            '    return len([child for child in (left, right) if child is not None])',
            '',
            'print(count_children((5, (0, None, None), (2, None, None))), count_children((8, None, None)))',
          ),
          ['1 0', '2 0', '2 2', '0 0'],
          1,
          'Both children of 5 are real even though one has key 0; the leaf 8 has none.',
        ),
        choose(
          'Which node has exactly one real child?',
          [
            '(4, None, None)',
            '(4, (1, None, None), (6, None, None))',
            '(0, None, None)',
            '(4, (0, None, None), None)',
          ],
          3,
          'Its left child is a real node with key 0, and its right child is None.',
        ),
      ],
    },
    {
      title: 'List existing children from left to right',
      explanation: [
        'A comprehension over (left, right) that keeps the children that are not None returns the real children in left-to-right order. A leaf gives [], and so does an absent node, so callers can treat both alike.',
        'Listing children reads only one node. It does not look at grandchildren or deeper descendants; a traversal decides when to visit those.',
      ],
      example: {
        code: lines(
          existingChildren,
          'print(existing_children((1, None, (2, None, None))))',
          'print(existing_children(None))',
        ),
        output: '[(2, None, None)]\n[]',
        explanation:
          'Only the real right child is listed. An absent node has no children at all.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          lines(
            existingChildren,
            'print(len(existing_children((4, (2, (1, None, None), None), (6, None, None)))))',
          ),
          ['3', '4', '2', '1'],
          2,
          'Only the direct children 2 and 6 are listed; the grandchild 1 is not.',
        ),
        predictOutput(
          'What is printed?',
          lines(
            existingChildren,
            'print([child[0] for child in existing_children((10, (5, None, None), (15, None, None)))])',
          ),
          ['[15, 5]', '[5, 15]', '[10, 5, 15]', '[5]'],
          1,
          'The children keep left-to-right order, and the parent’s own key is not included.',
        ),
        choose(
          'What should existing_children return for a leaf such as (9, None, None)?',
          ['[None, None]', '[9]', 'None', '[]'],
          3,
          'A leaf has no real children, so the list is empty.',
        ),
        choose(
          'existing_children(node) is called on the root of a 100-node tree. How many nodes does it inspect?',
          [
            'Only the root itself',
            'All 100 nodes',
            'The root and every leaf',
            'The nodes on the longest path',
          ],
          0,
          'It unpacks one tuple and checks two fields; descendants are not visited.',
        ),
      ],
    },
  ],
  'cp-preorder-frontier': [
    {
      title: 'Push right before left to visit left first',
      explanation: [
        'A stack returns the most recently pushed entry first. To process a node’s left child before its right child, push the right child first and the left child second.',
        'Skip absent children: a pushed None would later be popped as if it were a node.',
      ],
      example: {
        code: lines(
          'pending = ["old"]',
          'left, right = "L", "R"',
          'if right is not None:',
          '    pending.append(right)',
          'if left is not None:',
          '    pending.append(left)',
          'print(pending)',
          'print(pending.pop())',
        ),
        output: "['old', 'R', 'L']\nL",
        explanation:
          'L is pushed last, so it is on top and processed next; R waits above the older work.',
      },
      questions: [
        choose(
          'Which child should be pushed first so that the left child is processed first?',
          [
            'The left child',
            'Either one',
            'The right child',
            'The parent again',
          ],
          2,
          'The child pushed second sits on top, so the left child must be pushed after the right.',
        ),
        predictOutput(
          'What does this program print?',
          lines(
            'pending = []',
            'for child in ["A", "B"]:',
            '    pending.append(child)',
            'print(pending.pop(), pending.pop())',
          ),
          ['A B', 'B A', 'A A', 'B B'],
          1,
          'B was pushed last, so it is popped first.',
        ),
        predictOutput(
          'What is printed?',
          lines(
            'pending = ["x"]',
            'left, right = "L", None',
            'if right is not None:',
            '    pending.append(right)',
            'if left is not None:',
            '    pending.append(left)',
            'print(pending)',
          ),
          ["['x', None, 'L']", "['L', 'x']", "['x', 'L', None]", "['x', 'L']"],
          3,
          'The absent right child is skipped, and L goes on top of the existing work.',
        ),
        choose(
          'The stack holds ["P", "Q", "R2", "L2"] from bottom to top. After two pops, which entry is on top?',
          ['Q', 'P', 'R2', 'L2'],
          0,
          'The pops remove L2 and then R2, leaving Q on top.',
        ),
      ],
    },
    {
      title: 'Produce a preorder with an explicit stack',
      explanation: [
        'Preorder visits a node, then its whole left subtree, then its right subtree. With a stack: pop a node, record its key, then push its right and left children. The left child is popped next, and the right child waits underneath until the left subtree is finished.',
        'Older pending work stays below newer children, so a node’s right subtree is handled only after everything pushed for its left subtree has been popped.',
      ],
      example: {
        code: lines(
          preorderLoop('(1, (2, (4, None, None), None), (3, None, None))'),
          'print(order)',
        ),
        output: '[1, 2, 4, 3]',
        explanation:
          'After 1, the left child 2 is on top; its child 4 is pushed above 3, so the whole left subtree finishes before 3.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          lines(
            preorderLoop(
              '(5, (3, (1, None, None), (4, None, None)), (8, None, None))',
            ),
            'print(order)',
          ),
          [
            '[5, 3, 1, 4, 8]',
            '[5, 8, 3, 4, 1]',
            '[1, 3, 4, 5, 8]',
            '[5, 3, 8, 1, 4]',
          ],
          0,
          'The root comes first, then the entire left subtree 3, 1, 4, then the right child 8.',
        ),
        predictOutput(
          'This loop pushes the left child first. What does it print?',
          lines(
            'tree = (1, (2, (4, None, None), None), (3, None, None))',
            'order = []',
            'stack = [tree]',
            'while stack:',
            '    key, left, right = stack.pop()',
            '    order.append(key)',
            '    if left is not None:',
            '        stack.append(left)',
            '    if right is not None:',
            '        stack.append(right)',
            'print(order)',
          ),
          ['[1, 2, 4, 3]', '[1, 3, 2, 4]', '[4, 2, 3, 1]', '[1, 2, 3, 4]'],
          1,
          'The right child ends on top, so 3 is visited before the left subtree.',
        ),
        choose(
          'After the root is popped and its two children pushed, the stack holds [right, left]. When is right popped?',
          [
            'Immediately after left',
            'Before left',
            'Never',
            'After the whole left subtree is popped',
          ],
          3,
          'Everything pushed while handling the left subtree sits above right, so it all comes off first.',
        ),
        predictOutput(
          'What is printed?',
          lines(
            'tree = (1, (2, None, None), (3, None, None))',
            'stack = [tree]',
            'while stack:',
            '    key, left, right = stack.pop()',
            '    if right is not None:',
            '        stack.append(right)',
            '    if left is not None:',
            '        stack.append(left)',
            '    print(key, [node[0] for node in stack])',
          ),
          [
            '1 [2, 3]\n3 [2]\n2 []',
            '1 [3, 2]\n3 [2]\n2 []',
            '1 [3, 2]\n2 [3]\n3 []',
            '1 [2, 3]\n2 [3]\n3 []',
          ],
          2,
          'After 1, the stack is [3, 2] with 2 on top; popping 2 leaves [3]; then 3 is popped.',
        ),
      ],
    },
  ],
  'cp-postorder-combine': [
    {
      title: 'Height is one more than the taller child',
      explanation: [
        'Measure height in nodes: the number of nodes on the longest downward path from a node to a leaf. Counting an absent child as height 0, a real node’s height is 1 + max(left_height, right_height), so a leaf has height 1.',
        'The max matters: only the taller side determines the longest path. Adding the two heights would count nodes on two different paths.',
      ],
      example: {
        code: lines(
          combineHeight,
          'print(combine_height(2, 4))',
          'print(combine_height(0, 0))',
          'print(combine_height(3, 0))',
        ),
        output: '5\n1\n4',
        explanation:
          'The taller child decides each result: 4 + 1, then a leaf’s 0 + 1, then 3 + 1.',
      },
      questions: [
        choose(
          'The left child has height 3 and the right child is absent. What is the parent’s height?',
          ['3', '4', '1', '0'],
          1,
          'The absent child counts as 0, so the height is 1 + max(3, 0) = 4.',
        ),
        predictOutput(
          'What does this program print?',
          lines(
            combineHeight,
            'print(combine_height(1, 1), combine_height(4, 2))',
          ),
          ['3 7', '2 4', '1 5', '2 5'],
          3,
          '1 + max(1, 1) = 2 and 1 + max(4, 2) = 5.',
        ),
        choose(
          'Under this convention, which pair of child heights does a leaf receive?',
          ['(0, 0)', '(1, 1)', '(None, None)', '(1, 0)'],
          0,
          'Both children are absent and count as height 0, which gives the leaf height 1.',
        ),
        predictOutput(
          'What is printed?',
          lines(
            'def wrong_height(left_height, right_height):',
            '    return 1 + left_height + right_height',
            '',
            'print(wrong_height(2, 2), 1 + max(2, 2))',
          ),
          ['3 3', '5 5', '5 3', '3 5'],
          2,
          'Adding counts nodes from both subtrees, which no single downward path contains; the max gives the true height 3.',
        ),
      ],
    },
    {
      title: 'Combine a parent only after its children',
      explanation: [
        'A parent’s height needs both child heights, so the children must be finished first. Processing children before their parent is postorder.',
        'Working bottom-up through a small tree, leaves get 1, their parents get 2 or more, and the root is finished last.',
      ],
      example: {
        code: lines(
          combineHeight,
          '# a has children b and c; b has one child d',
          'd = combine_height(0, 0)',
          'c = combine_height(0, 0)',
          'b = combine_height(d, 0)',
          'a = combine_height(b, c)',
          'print(d, c, b, a)',
        ),
        output: '1 1 2 3',
        explanation:
          'd and c are leaves. b can be combined once d is known, and a only after both b and c.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          lines(
            combineHeight,
            '# r has children x and y; y has children p and q; p has child s',
            's = combine_height(0, 0)',
            'p = combine_height(s, 0)',
            'q = combine_height(0, 0)',
            'y = combine_height(p, q)',
            'x = combine_height(0, 0)',
            'r = combine_height(x, y)',
            'print(r)',
          ),
          ['3', '6', '4', '5'],
          2,
          'The longest path is r, y, p, s: four nodes.',
        ),
        choose(
          'Why can’t the root’s height be computed first?',
          [
            'The root has no key',
            'It needs its children’s heights, which are unknown yet',
            'Python evaluates trees from the bottom',
            'Roots always have height 1',
          ],
          1,
          'The combination uses both child heights, so they must already be computed.',
        ),
        choose(
          'Node a has children b and c, and b has child d. In which order can their heights be computed?',
          ['d, b, c, a', 'a, b, c, d', 'a, b, d, c', 'b, d, a, c'],
          0,
          'Each node comes after all of its children: d before b, and b and c before a.',
        ),
        predictOutput(
          'What is printed?',
          lines(
            combineHeight,
            'height = 0',
            'for _ in range(4):',
            '    height = combine_height(height, 0)',
            'print(height)',
          ),
          ['3', '0', '8', '4'],
          3,
          'Each step adds one parent above the previous chain, so four nodes give height 4.',
        ),
      ],
    },
  ],
  'cp-tree-traversal': [
    {
      title: 'Choose postorder when a parent depends on its children',
      explanation: [
        'A traversal order should follow the computation’s dependencies. A subtree size is 1 plus the sizes of all child subtrees, so each parent can be finished only after its children: postorder.',
        'Here a rooted tree is given as children[u], the list of u’s child vertices, with root 0. A short recursive version shows the dependency directly: each call returns only after all of its children have returned.',
      ],
      example: {
        code: lines(
          'children = [[1, 2], [3], [], []]',
          '',
          'def size(vertex):',
          '    total = 1',
          '    for child in children[vertex]:',
          '        total += size(child)',
          '    print(vertex, total)',
          '    return total',
          '',
          'size(0)',
        ),
        output: '3 1\n1 2\n2 1\n0 4',
        explanation:
          'Each vertex prints only after its children return, so 3 finishes before 1, and the root 0 finishes last with size 4.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          lines(
            'children = [[1], [2, 3], [], []]',
            '',
            'def size(vertex):',
            '    total = 1',
            '    for child in children[vertex]:',
            '        total += size(child)',
            '    print(vertex, total)',
            '    return total',
            '',
            'size(0)',
          ),
          [
            '0 4\n1 3\n2 1\n3 1',
            '2 1\n3 1\n1 3\n0 4',
            '2 1\n3 1\n1 2\n0 3',
            '3 1\n2 1\n1 3\n0 4',
          ],
          1,
          'Leaves 2 and 3 finish first, in child order; then 1 with size 3, and the root last with 4.',
        ),
        choose(
          'Which computation needs postorder rather than preorder?',
          [
            'Counting the nodes in every subtree',
            'Writing each node’s depth from the root',
            'Copying the root’s label to every node',
            'Listing nodes as they are first reached',
          ],
          0,
          'A subtree count needs the children’s counts first; the others flow from the root downward.',
        ),
        predictOutput(
          'What is printed?',
          lines(
            'children = [[1, 2, 3], [], [4], [], []]',
            'sizes = [0] * len(children)',
            '',
            'def fill(vertex):',
            '    sizes[vertex] = 1',
            '    for child in children[vertex]:',
            '        fill(child)',
            '        sizes[vertex] += sizes[child]',
            '',
            'fill(0)',
            'print(sizes)',
          ),
          [
            '[4, 1, 2, 1, 1]',
            '[5, 0, 1, 0, 0]',
            '[5, 1, 2, 1, 1]',
            '[1, 1, 2, 1, 1]',
          ],
          2,
          'Vertex 2 owns itself and 4; the root adds 1 + 1 + 2 + 1 = 5.',
        ),
        choose(
          'Root 0 has children 1 and 2. Vertex 1 has 4 descendants, and vertex 2 is a leaf. What is the size of vertex 0’s subtree?',
          ['6', '5', '8', '7'],
          3,
          'Vertex 1’s subtree has 5 vertices, vertex 2’s has 1, and the root adds itself: 7.',
        ),
      ],
    },
    {
      title: 'Replace recursion with completion events',
      explanation: [
        'A very tall tree, such as a 100,000-vertex chain, would exceed Python’s recursion limit. An explicit stack of (vertex, ready) events avoids that. Popping (v, False) pushes (v, True) first and then (child, False) for each child; because the stack is last in, first out, every child’s work finishes before (v, True) is popped.',
        'Popping (v, True) combines the children’s finished sizes: 1 plus the sum of sizes[child] over v’s children.',
      ],
      example: {
        code: lines(
          eventSizes('[[1, 2], [], [3], []]', 'print("done", vertex)'),
          'print(sizes)',
        ),
        output: 'done 3\ndone 2\ndone 1\ndone 0\n[4, 1, 2, 1]',
        explanation:
          'Child 2 was pushed last, so its subtree finishes first. The root’s completion event was pushed before every child event, so it is popped last.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          lines(eventSizes('[[1], [2], []]'), 'print(sizes)'),
          ['[1, 2, 3]', '[3, 2, 1]', '[3, 1, 1]', '[1, 1, 1]'],
          1,
          'In the chain 0 → 1 → 2, vertex 2 finishes first with 1, then 1 with 2, then the root with 3.',
        ),
        choose(
          'Why is (vertex, True) pushed before the children’s (child, False) events?',
          [
            'So it is popped after all of the children’s work',
            'So the parent is finished first',
            'So children are visited in sorted order',
            'So each vertex is pushed only once',
          ],
          0,
          'Everything pushed later, including all descendant events, is popped before it.',
        ),
        predictOutput(
          'In what order are the vertices finished?',
          lines(eventSizes('[[1, 2], [], []]', 'print(vertex)')),
          ['0\n1\n2', '1\n2\n0', '2\n1\n0', '0\n2\n1'],
          2,
          'Child 2 is pushed last and finishes first, then child 1, and the root last.',
        ),
        choose(
          'How many stack events does each vertex cause in this traversal?',
          [
            'One',
            'One per descendant',
            'One per edge in the whole tree',
            'Two: a first visit and a completion',
          ],
          3,
          'Each vertex is pushed once as (v, False) and once as (v, True).',
        ),
      ],
    },
    {
      title: 'Rely on the tree contract and linear cost',
      explanation: [
        'Each vertex is pushed and popped twice, and each child list is scanned once when expanded and once when combined, so the traversal takes O(n) time and O(n) extra space for the stack and the sizes.',
        'That bound relies on a real rooted tree: root 0, one parent for every other vertex, every vertex reachable, no cycles. A vertex listed under two parents is counted twice, and a cycle would push events forever.',
      ],
      example: {
        code: lines(eventSizes('[[1, 2], [3], [3], []]'), 'print(sizes)'),
        output: '[5, 2, 2, 1]',
        explanation:
          'Vertex 3 is listed under both 1 and 2, so it is processed twice and counted in both subtrees: the root reports 5 vertices in a 4-vertex graph.',
      },
      questions: [
        choose(
          'For a valid tree with n vertices, how many stack events does the iterative traversal pop?',
          ['n', '2n', 'n²', 'n log n'],
          1,
          'Every vertex contributes a first-visit event and a completion event.',
        ),
        choose(
          'What is the time complexity of computing all subtree sizes this way?',
          ['O(n²)', 'O(n log n)', 'O(n)', 'O(h), the height'],
          2,
          'A constant number of events per vertex and two scans of each child list make linear work.',
        ),
        predictOutput(
          'How many events are popped?',
          lines(
            eventSizes('[[1, 2, 3], [], [], []]', '', 'events += 1'),
            'print(events)',
          ),
          ['4', '7', '16', '8'],
          3,
          'Four vertices each cause two events, a first visit and a completion.',
        ),
        choose(
          'children = [[1], [0]] is passed in, so vertices 0 and 1 list each other as children. What happens?',
          [
            'The stack never empties',
            'Both sizes become 2',
            'The root size is 1',
            'Vertex 1 is skipped',
          ],
          0,
          'Expanding 0 pushes 1, and expanding 1 pushes 0 again, so new events appear forever.',
        ),
      ],
    },
  ],
};
