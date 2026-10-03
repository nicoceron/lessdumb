import { choose, predictOutput, type KnowledgePointModule } from '.';

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
};
