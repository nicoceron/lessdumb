import { choose, predictOutput, type KnowledgePointModule } from './authoring';

// Competitive Programming, part 1: foundations, collections, linear scans and search.
export const knowledgePoints: KnowledgePointModule = {
  'cp-work-scan': [
    {
      title: 'Count visits, not values',
      explanation: [
        'A scan visits every item of a list once. To measure its work, keep a counter that starts at 0 and add 1 on each visit. The counter answers "how many items were checked"; it does not depend on how large, small, negative or repeated the items are.',
      ],
      example: {
        code: 'checks = 0\nfor value in [40, -7, 0, 15]:\n    checks += 1\nprint(checks)',
        output: '4',
        explanation:
          'Each of the four visits adds 1. The values themselves never enter the counter, so their sum (48) is irrelevant.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'checks = 0\nfor value in [9, 9, 9]:\n    checks += 1\nprint(checks)',
          ['27', '9', '3', '1'],
          2,
          'Three visits add 1 each. The repeated value 9 is never added to the counter.',
        ),
        predictOutput(
          'This scan keeps a work counter and a running total. What does it print?',
          'checks = 0\ntotal = 0\nfor value in [6, -2, 5, 1, 0]:\n    checks += 1\n    total += value\nprint(checks)\nprint(total)',
          ['10\n5', '4\n10', '5\n10', '5\n14'],
          2,
          'There are five visits, including the one for 0. The total of the values is a separate quantity: 6 - 2 + 5 + 1 + 0 = 10.',
        ),
        choose(
          'A scan does one check per item. How many checks does it make on a list of 250 values?',
          ['125', '251', '250', '62,500'],
          2,
          'One check per visited item gives exactly as many checks as items.',
        ),
        choose(
          'Which change makes a one-pass scan perform more checks?',
          [
            'Adding two more items to the list',
            'Making every value ten times larger',
            'Replacing negative values with zeros',
            'Sorting the list before scanning',
          ],
          0,
          'Scan work depends only on how many items are visited, not on what the items are.',
        ),
      ],
    },
    {
      title: 'The counter tracks the visits so far',
      explanation: [
        'After i visits the counter equals i. This invariant says exactly how much work has been done at every moment of the scan. Before the first visit the counter is 0, so an empty list leaves it at 0. Because every item costs the same, a list twice as long takes twice as many checks.',
      ],
      example: {
        code: 'checks = 0\nprint(checks)\nfor value in [5, 8, 2]:\n    checks += 1\n    print(checks)',
        output: '0\n1\n2\n3',
        explanation:
          'The first line is the count before any visit. Each later line is printed right after a visit, so after i visits it shows i.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'checks = 0\nfor value in []:\n    checks += 1\nprint(checks)',
          ['1', 'None', 'Nothing is printed', '0'],
          3,
          'The loop body never runs for an empty list, so the counter keeps its starting value 0, which is then printed.',
        ),
        predictOutput(
          'What does this program print?',
          'checks = 0\nfor value in [7, 3, 7, 1]:\n    checks += 1\n    print(checks)',
          ['1\n2\n3\n4', '0\n1\n2\n3', '7\n3\n7\n1', '7\n10\n17\n18'],
          0,
          'The counter is printed after it is increased, so the lines show 1 through 4 visits; the values are never used.',
        ),
        choose(
          'Scanning 1,000 items takes 4 ms. About how long should a scan of 2,000 similar items take?',
          ['About 4 ms', 'About 8 ms', 'About 16 ms', 'About 5 ms'],
          1,
          'Scan work grows in proportion to the number of items, so twice the items take about twice the time.',
        ),
        choose(
          'Partway through a scan, checks equals 6. What does that tell you?',
          [
            'The list has exactly six items',
            'The current value is 6',
            'The values seen so far add up to 6',
            'Six items have been visited so far',
          ],
          3,
          'The counter is increased once per visit, so it records visits completed so far, not the list length or the values.',
        ),
      ],
    },
  ],
  'cp-work-pairs': [
    {
      title: 'Nested complete loops multiply',
      explanation: [
        'When an inner loop runs completely for every pass of an outer loop, each outer pass contributes the whole inner count. An outer loop of size r around an inner loop of size c performs r × c inner actions. If either size is 0, there are no pairs at all.',
      ],
      example: {
        code: 'checks = 0\nfor row in range(3):\n    for column in range(4):\n        checks += 1\nprint(checks)',
        output: '12',
        explanation:
          'Each of the 3 rows runs all 4 columns: 4 + 4 + 4 = 3 × 4 = 12.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'checks = 0\nfor row in range(5):\n    for column in range(2):\n        checks += 1\nprint(checks)',
          ['7', '25', '5', '10'],
          3,
          'Five outer passes each run two inner actions: 5 × 2 = 10.',
        ),
        predictOutput(
          'What does this program print?',
          'checks = 0\nfor row in range(4):\n    for column in range(0):\n        checks += 1\nprint(checks)',
          ['4', '1', '16', '0'],
          3,
          'The inner loop has size 0, so no outer pass performs any inner action: 4 × 0 = 0.',
        ),
        choose(
          'An outer loop over 6 shelves contains a complete inner loop over 8 slots. How many shelf-slot checks happen?',
          ['14', '36', '64', '48'],
          3,
          'Every shelf checks all 8 slots, so the counts multiply: 6 × 8 = 48.',
        ),
        predictOutput(
          'The count is printed after each complete row. What is the output?',
          'checks = 0\nfor row in range(3):\n    for column in range(2):\n        checks += 1\n    print(checks)',
          ['2\n4\n6', '1\n2\n3', '2\n2\n2', '3\n6\n9'],
          0,
          'After i complete rows, i × 2 inner actions have run, and the counter is never reset between rows.',
        ),
      ],
    },
    {
      title: 'Loops in sequence add, and counting is not storing',
      explanation: [
        'Two loops placed one after the other run separately, so their work adds: a items followed by b items cost a + b. Only nesting multiplies. Counting pairs also does not mean storing them: one counter can tally r × c pairs while keeping a single number in memory.',
      ],
      example: {
        code: 'checks = 0\nfor i in range(3):\n    checks += 1\nfor j in range(4):\n    checks += 1\nprint(checks)',
        output: '7',
        explanation:
          'The loops are siblings, not nested: 3 visits, then 4 more, for 3 + 4 = 7.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'checks = 0\nfor i in range(5):\n    checks += 1\nfor j in range(5):\n    checks += 1\nprint(checks)',
          ['25', '10', '5', '11'],
          1,
          'The second loop starts after the first finishes, so the work adds: 5 + 5 = 10.',
        ),
        predictOutput(
          'One loop runs alone, then a nested pair follows. What is printed?',
          'checks = 0\nfor i in range(2):\n    checks += 1\nfor i in range(3):\n    for j in range(3):\n        checks += 1\nprint(checks)',
          ['18', '8', '11', '15'],
          2,
          'The first loop adds 2, and the nested loops add 3 × 3 = 9 afterwards, for 2 + 9 = 11.',
        ),
        choose(
          'A nested loop counts 1,000 × 1,000 pairs with one integer counter. Which statement is true?',
          [
            'It does a million checks but stores one count',
            'It must store a million pairs to count them',
            'It does 2,000 checks in total',
            'It needs one counter for every pair',
          ],
          0,
          'Time counts the inner actions (10⁶), while memory holds only the single counter.',
        ),
        choose(
          'Which loop structure performs a × b actions rather than a + b?',
          [
            'A loop over a items, then a loop over b items',
            'Two loops over a items, one after another',
            'A loop over b items inside a loop over a items',
            'One loop over a items that also prints b',
          ],
          2,
          'Only nesting repeats the whole inner loop for every outer pass, which multiplies the counts.',
        ),
      ],
    },
  ],
  'cp-work-doubling': [
    {
      title: 'Double a probe until it reaches the target',
      explanation: [
        'Start a probe at 1 and multiply it by 2 while it is still below a target. Each doubling is one step. For target 20 the probe takes the values 1, 2, 4, 8, 16, 32, so five doublings are needed: the fifth produces 32, the first probe that is at least 20.',
      ],
      example: {
        code: 'probe = 1\nsteps = 0\nwhile probe < 20:\n    probe *= 2\n    steps += 1\nprint(steps)\nprint(probe)',
        output: '5\n32',
        explanation:
          'The loop stops as soon as probe is no longer below 20. That happens after the fifth doubling, at 32.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'probe = 1\nsteps = 0\nwhile probe < 6:\n    probe *= 2\n    steps += 1\nprint(steps)',
          ['2', '6', '4', '3'],
          3,
          'The probe goes 1 → 2 → 4 → 8. The third doubling is the first to reach at least 6.',
        ),
        predictOutput(
          'What does this program print?',
          'probe = 1\nsteps = 0\nwhile probe < 16:\n    probe *= 2\n    steps += 1\nprint(steps)',
          ['5', '4', '8', '16'],
          1,
          'The probe goes 1, 2, 4, 8, 16. After the fourth doubling it equals 16, which is no longer below 16, so the loop stops.',
        ),
        predictOutput(
          'Each probe is printed before it doubles. What is the output?',
          'probe = 1\nwhile probe < 10:\n    print(probe)\n    probe *= 2',
          ['2\n4\n8\n16', '1\n2\n4\n8', '1\n2\n4\n8\n16', '1\n2\n3\n4'],
          1,
          'Probes 1, 2, 4 and 8 are below 10 and get printed. The probe 16 fails the loop test, so it is never printed.',
        ),
        choose(
          'A probe starts at 1 and doubles. What is its value after 6 doublings?',
          ['64', '12', '32', '7'],
          0,
          'After k doublings the probe is 2 to the power k, and 2⁶ = 64.',
        ),
      ],
    },
    {
      title: 'Doubling steps grow logarithmically',
      explanation: [
        'After k doublings the probe equals 2 to the power k, so reaching a target n takes about log₂(n) steps. Doubling the target adds at most one more step, which is why this count grows so slowly. A target of 0 or 1 is already reached by the starting probe, so it needs 0 steps.',
      ],
      example: {
        code: 'for target in [1, 50, 100, 200]:\n    probe = 1\n    steps = 0\n    while probe < target:\n        probe *= 2\n        steps += 1\n    print(steps)',
        output: '0\n6\n7\n8',
        explanation:
          'Target 1 needs no doubling. Targets 50, 100 and 200 are reached at 64, 128 and 256: each doubling of the target adds one step.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'probe = 1\nsteps = 0\nwhile probe < 1:\n    probe *= 2\n    steps += 1\nprint(steps)',
          ['1', '0', '2', '-1'],
          1,
          'The starting probe 1 is not below 1, so the loop body never runs and steps stays 0.',
        ),
        choose(
          'Reaching target 1,000 takes 10 doublings from 1. About how many does target 2,000 take?',
          ['20', '11', '100', '1,000'],
          1,
          'Doubling the target needs only one more doubling of the probe.',
        ),
        choose(
          'Which loop finishes after about log₂(n) iterations?',
          [
            'while probe < n: probe += 2',
            'while probe < n: probe *= 2',
            'for i in range(n): probe *= 2',
            'for i in range(n): count += 1',
          ],
          1,
          'Multiplying by a fixed factor covers the distance to n in logarithmically many steps; adding 2 or looping over range(n) takes about n steps.',
        ),
        predictOutput(
          'Two targets that differ by one are checked. What is printed?',
          'for target in [64, 65]:\n    probe = 1\n    steps = 0\n    while probe < target:\n        probe *= 2\n        steps += 1\n    print(steps)',
          ['6\n6', '7\n7', '32\n33', '6\n7'],
          3,
          'Target 64 is reached exactly at 2⁶. Target 65 needs one more doubling, to 128.',
        ),
      ],
    },
  ],
  'cp-complexity': [
    {
      title: 'Name the growth of each loop shape',
      explanation: [
        'Complexity describes how work grows with the input size n, ignoring exact seconds. A loop with constant work per item is O(n); a complete n-by-n nested loop is O(n²); a probe that doubles until it reaches n is O(log n).',
        'Stages that run one after another add their costs, and the fastest-growing term decides the bound: O(n) + O(n²) is O(n²), and two separate scans are still O(n).',
      ],
      example: {
        code: 'n = 8\nchecks = 0\nfor i in range(n):\n    checks += 1\nfor i in range(n):\n    for j in range(n):\n        checks += 1\nprobe = 1\nwhile probe < n:\n    probe *= 2\n    checks += 1\nprint(checks)',
        output: '75',
        explanation:
          'The scan adds 8, the pair loop 64 and the doubling loop 3, for 75. As n grows the n² term dominates, so the program is O(n²).',
      },
      questions: [
        choose(
          'A routine scans n values once, then runs a complete n-by-n pair loop. What is its time complexity?',
          ['O(n²)', 'O(n)', 'O(n³)', 'O(n + log n)'],
          0,
          'The costs add to n + n², and the n² term dominates as n grows.',
        ),
        choose(
          'Which loop shape is O(log n)?',
          [
            'A scan that visits each item once',
            'A probe that doubles from 1 until it reaches n',
            'A loop over every pair i, j of positions',
            'Three scans of the list, one after another',
          ],
          1,
          'Doubling reaches n after about log₂(n) rounds; the other shapes take n, n² and 3n steps.',
        ),
        predictOutput(
          'What does this program print?',
          'n = 5\nchecks = 0\nfor i in range(n):\n    checks += 1\nfor i in range(n):\n    checks += 1\nprobe = 1\nwhile probe < n:\n    probe *= 2\n    checks += 1\nprint(checks)',
          ['13', '28', '10', '12'],
          0,
          'The two scans add 5 + 5, and the probe needs 3 doublings (1, 2, 4, 8) to reach 5: 10 + 3 = 13.',
        ),
        choose(
          'Two stages cost 3n and n² + 5 operations. Which bound describes the whole program?',
          ['O(3n + 5)', 'O(n³)', 'O(n)', 'O(n²)'],
          3,
          'Costs add to n² + 3n + 5; the fastest-growing term n² gives the bound, and constants are dropped.',
        ),
      ],
    },
    {
      title: 'Predict what happens when n doubles',
      explanation: [
        'Growth classes predict the effect of a bigger input. Doubling n roughly doubles an O(n) scan, multiplies an O(n²) pair loop by four, and adds only one round to an O(log n) doubling loop.',
        'This is how constraints choose an approach: for n = 200,000, an O(n²) method needs about 4 × 10¹⁰ steps, far too many, while an O(n) method needs 200,000.',
      ],
      example: {
        code: 'for n in [10, 20]:\n    pairs = 0\n    for i in range(n):\n        for j in range(n):\n            pairs += 1\n    rounds = 0\n    probe = 1\n    while probe < n:\n        probe *= 2\n        rounds += 1\n    print(pairs)\n    print(rounds)',
        output: '100\n4\n400\n5',
        explanation:
          'Going from n = 10 to n = 20 multiplies the pair count by four (100 to 400) but adds only one doubling round (4 to 5).',
      },
      questions: [
        choose(
          'An O(n²) routine takes 2 seconds for n = 10,000. Roughly how long for n = 20,000?',
          ['8 seconds', '4 seconds', '2 seconds', '3 seconds'],
          0,
          'Doubling n multiplies n² by four, so the time grows from about 2 to about 8 seconds.',
        ),
        choose(
          'An O(log n) doubling loop takes 17 rounds for some n. About how many rounds for 2n?',
          ['18', '34', '17', '289'],
          0,
          'Doubling the target adds one doubling round.',
        ),
        predictOutput(
          'What does this program print?',
          'small = 0\nfor i in range(6):\n    for j in range(6):\n        small += 1\nlarge = 0\nfor i in range(12):\n    for j in range(12):\n        large += 1\nprint(large // small)',
          ['2', '8', '4', '144'],
          2,
          'The pair loops perform 36 and 144 checks. Doubling n multiplies a quadratic count by 4.',
        ),
        choose(
          'n can reach 100,000 and the budget is about 10⁸ simple steps. Which plan fits?',
          [
            'One scan followed by a doubling loop',
            'Checking all n² ordered pairs once',
            'Running the n² pair loop twice',
            'Checking every pair, then every triple',
          ],
          0,
          'A scan plus a doubling loop costs about 10⁵ + 17 steps; n² alone is already 10¹⁰.',
        ),
      ],
    },
    {
      title: 'Separate time from extra space',
      explanation: [
        'Time counts operations; space counts the extra memory an algorithm keeps beyond its input. A full pair loop that only updates a few counters takes O(n²) time but O(1) additional space. Building a new list of n results needs O(n) extra space even though it costs only O(n) time.',
        'Constant factors do not change a class: 3n checks are still O(n), and a pair loop that skips half the pairs is still O(n²).',
      ],
      example: {
        code: 'values = [4, 1, 3]\npairs = 0\nfor i in range(len(values)):\n    for j in range(len(values)):\n        pairs += 1\ndoubled = []\nfor value in values:\n    doubled.append(value * 2)\nprint(pairs)\nprint(len(doubled))',
        output: '9\n3',
        explanation:
          'The pair loop does 9 checks with one counter: O(n²) time, O(1) extra space. The doubled list stores 3 new values: O(n) extra space.',
      },
      questions: [
        choose(
          'A function checks every pair i, j of an n-item list and keeps only a running best. What is its additional space?',
          ['O(1)', 'O(n²)', 'O(n)', 'O(log n)'],
          0,
          'However many pairs it checks, it keeps a fixed number of variables.',
        ),
        choose(
          'A loop over pairs i < j performs n(n − 1)/2 checks, about half of n². What is its time complexity?',
          ['O(n)', 'O(n log n)', 'Less than O(n²), because of the ½', 'O(n²)'],
          3,
          'The factor ½ is a constant; the count still grows with n², so the class is O(n²).',
        ),
        choose(
          'A function returns a new list containing each input value squared. What are its time and extra space?',
          [
            'O(n) time, O(1) space',
            'O(n) time, O(n) space',
            'O(n²) time, O(n) space',
            'O(1) time, O(n) space',
          ],
          1,
          'It visits each value once and stores one new value per input value.',
        ),
        predictOutput(
          'The inner loop starts after i. What does this program print?',
          'n = 6\nchecks = 0\nfor i in range(n):\n    for j in range(i + 1, n):\n        checks += 1\nprint(checks)',
          ['36', '15', '30', '21'],
          1,
          'The inner loop runs 5, 4, 3, 2, 1 and 0 times: 15 = 6 · 5 / 2. That is about n²/2, which is still O(n²).',
        ),
      ],
    },
  ],
  'cp-input-tokens': [
    {
      title: 'split() cuts text at any whitespace',
      explanation: [
        'text.split() with no argument breaks text wherever there is whitespace: spaces, tabs (\\t) and newlines (\\n) all count. A run of several whitespace characters acts as one separator, and whitespace at the start or end creates no empty tokens.',
      ],
      example: {
        code: 'text = "  12   7\\n\\t-3 "\nprint(text.split())\nprint(len(text.split()))',
        output: "['12', '7', '-3']\n3",
        explanation:
          'The spaces, the newline and the tab only separate fields. Three fields remain, with no empty strings for the extra whitespace.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'print("4  8\\n15".split())',
          [
            "['4', '8', '15']",
            "['4', '', '8', '15']",
            "['4  8', '15']",
            '[4, 8, 15]',
          ],
          0,
          'The double space and the newline are both separators, and the tokens stay strings.',
        ),
        predictOutput(
          'What does this program print?',
          'print(len("\\n  \\t \\n".split()))',
          ['1', '4', '6', '0'],
          3,
          'The text contains only whitespace, so there are no fields and split() returns an empty list.',
        ),
        predictOutput(
          'What does this program print?',
          'tokens = " 5 9 ".split()\nprint(len(tokens))',
          ['4', '3', '2', '1'],
          2,
          'Leading and trailing spaces do not create empty tokens; only 5 and 9 remain.',
        ),
        choose(
          'Contest input puts each number on its own line. Why can one call to text.split() still read them all?',
          [
            'Newlines are whitespace, so split() separates at them',
            'split() reads only the first line of the text',
            'split() returns one token per line, not per number',
            'The lines must be joined with spaces first',
          ],
          0,
          'With no argument, split() treats spaces, tabs and newlines alike as separators.',
        ),
      ],
    },
    {
      title: 'Tokens are still strings',
      explanation: [
        'Every token split() returns is a string, even when it looks like a number. Printing the token list shows quotes, the integer 7 is not a member of it, and + on two tokens joins their characters instead of adding. Tokenizing only finds where fields begin and end; converting and interpreting them comes later.',
      ],
      example: {
        code: 'tokens = "12 7".split()\nprint(tokens)\nprint(7 in tokens)\nprint("7" in tokens)',
        output: "['12', '7']\nFalse\nTrue",
        explanation:
          'The list holds the strings "12" and "7". The integer 7 is a different value from the string "7", so the first membership test is False.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'print(3 in "1 2 3".split())',
          ['True', 'False', '3', "['3']"],
          1,
          'split() produced strings, and the integer 3 is not equal to the string "3".',
        ),
        predictOutput(
          'What does this program print?',
          'tokens = "8 -1".split()\nprint(tokens == [8, -1])\nprint(tokens == ["8", "-1"])',
          ['True\nFalse', 'False\nTrue', 'True\nTrue', 'False\nFalse'],
          1,
          'The tokens are the strings "8" and "-1", so only the comparison with a list of strings is True.',
        ),
        choose(
          'A program splits "6 4" and combines the two tokens with +. Why does it get "64" instead of 10?',
          [
            'split() reverses the order of the digits',
            'The tokens are strings, and + joins strings',
            'The + operator always joins numbers',
            'split() returns the whole text as one token',
          ],
          1,
          'Tokens keep their text type; adding two strings concatenates them.',
        ),
        choose(
          'Which job does split() do on contest input?',
          [
            'It converts numeric fields into integers',
            'It decides which field is the count',
            'It removes the minus sign from negative values',
            'It finds where each text field begins and ends',
          ],
          3,
          'Tokenizing separates fields; conversion and assigning roles are later steps.',
        ),
      ],
    },
  ],
  'cp-input-integers': [
    {
      title: 'int() turns numeric text into a number',
      explanation: [
        'int("42") converts the string "42" into the integer 42. The difference matters because + joins strings but adds integers. A leading minus sign and zero are ordinary valid integer text: int("-7") is -7 and int("0") is 0.',
      ],
      example: {
        code: 'a = "15"\nb = "-4"\nprint(a + b)\nprint(int(a) + int(b))',
        output: '15-4\n11',
        explanation:
          'Joining the strings gives the text 15-4. Converting first gives the integers 15 and -4, which add to 11.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'print(int("9") + int("6"))',
          ['15', '96', '69', '"15"'],
          0,
          'Both strings are converted first, so + adds the integers 9 and 6.',
        ),
        predictOutput(
          'What does this program print?',
          'x = "3"\ny = "-8"\nprint(x + y)',
          ['-5', '11', '-83', '3-8'],
          3,
          'x and y are still strings, so + joins their characters.',
        ),
        predictOutput(
          'What does this program print?',
          'print(int("0") * 5 + int("-2"))',
          ['3', '-10', '-2', '2'],
          2,
          'int("0") is 0 and int("-2") is -2, so the result is 0 * 5 + (-2) = -2.',
        ),
        choose(
          'Which expression evaluates to the integer 20?',
          [
            '"10" + "10"',
            'int("10") + int("10")',
            'int("10" + "10")',
            '"20" * 1',
          ],
          1,
          'Converting each string first makes + add numbers. Joining first would give "1010", and int of that is 1010.',
        ),
      ],
    },
    {
      title: 'Convert every token before computing',
      explanation: [
        'A list of numeric strings is converted item by item, for example with [int(token) for token in tokens] or by appending int(token) in a loop. The new list keeps the same order and length; only the type of each item changes. Convert before arithmetic or comparisons: strings compare character by character, so "10" < "9" is True.',
      ],
      example: {
        code: 'tokens = ["8", "-3", "10"]\nvalues = [int(token) for token in tokens]\nprint(values)\nprint(sum(values))',
        output: '[8, -3, 10]\n15',
        explanation:
          'The comprehension produces the integers in the same order, and sum() can then add them.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'tokens = ["5", "0", "-5", "7"]\nvalues = [int(token) for token in tokens]\nprint(sum(values))',
          ['7', '17', '12', '-7'],
          0,
          'The converted values are 5, 0, -5 and 7, which add to 7.',
        ),
        predictOutput(
          'What does this program print?',
          'tokens = ["4", "12", "7"]\nvalues = []\nfor token in tokens:\n    values.append(int(token))\nprint(values)',
          ["['4', '12', '7']", '[4, 7, 12]', '[4, 12, 7]', '23'],
          2,
          'Each token is converted and appended in order, so the list holds integers without quotes, in the original order.',
        ),
        predictOutput(
          'What does this program print?',
          'print("10" < "9")\nprint(10 < 9)',
          ['False\nFalse', 'False\nTrue', 'True\nTrue', 'True\nFalse'],
          3,
          'Strings compare character by character, and "1" comes before "9". As integers, 10 is not less than 9.',
        ),
        choose(
          'Five tokens are converted with [int(token) for token in tokens]. What changes?',
          [
            'Repeated values are merged into one entry',
            'Each item becomes an integer; order and length stay',
            'The items are rearranged into ascending order',
            'Negative tokens are left out of the result',
          ],
          1,
          'A comprehension makes one new item per token, in the same order.',
        ),
      ],
    },
  ],
  'cp-input-count': [
    {
      title: 'The first token is a count, not a value',
      explanation: [
        'In a counted format the first token says how many values follow. For "3 40 50 60" the count is 3 and the payload is 40, 50, 60. Convert the count with int(tokens[0]) and keep it out of the data: it describes the readings rather than being one of them.',
      ],
      example: {
        code: 'tokens = "3 40 50 60".split()\ncount = int(tokens[0])\nvalues = [int(token) for token in tokens[1:]]\nprint(count)\nprint(values)',
        output: '3\n[40, 50, 60]',
        explanation:
          'Position 0 holds the count. The slice from position 1 holds the three readings.',
      },
      questions: [
        predictOutput(
          'This program totals a counted input. What does it print?',
          'tokens = "2 9 4".split()\nvalues = [int(token) for token in tokens]\nprint(sum(values))',
          ['15', '13', '2', '94'],
          0,
          'The program forgets to skip the count, so it adds 2 + 9 + 4 = 15. The two readings alone total 13.',
        ),
        choose(
          'For the counted input "4 15 -2 8 0", which list is the payload?',
          [
            '[15, -2, 8, 0]',
            '[4, 15, -2, 8]',
            '[15, -2, 8]',
            '[4, 15, -2, 8, 0]',
          ],
          0,
          'The leading 4 announces four readings, which are the next four fields.',
        ),
        choose(
          'Why is it wrong to average every token of the counted input "2 6 8"?',
          [
            'The tokens would already be integers',
            'The count 2 would be averaged as if it were a reading',
            'An average needs an even number of values',
            'split() would drop the first token',
          ],
          1,
          'The first token describes the data; only 6 and 8 are readings.',
        ),
        predictOutput(
          'What does this program print?',
          'tokens = "2 5 -5".split()\ncount = int(tokens[0])\npayload = tokens[1:]\nprint(count == len(payload))\nprint(payload)',
          [
            "False\n['5', '-5']",
            'True\n[5, -5]',
            "True\n['2', '5', '-5']",
            "True\n['5', '-5']",
          ],
          3,
          'Two payload tokens follow the count, and the slice holds them as unconverted strings.',
        ),
      ],
    },
    {
      title: 'Slice exactly count fields after the count',
      explanation: [
        'The payload occupies positions 1 through count, which is the slice tokens[1:1 + count]. Slicing by the declared count, rather than taking everything after position 0, leaves trailing fields such as a label or a second section alone. A count of 0 gives an empty slice, and blank text has no count at all, so check len(tokens) == 0 before reading tokens[0].',
      ],
      example: {
        code: 'tokens = "2 8 5 99".split()\ncount = int(tokens[0])\nprint(tokens[1:1 + count])\nprint(tokens[1:])',
        output: "['8', '5']\n['8', '5', '99']",
        explanation:
          'The declared count selects exactly two fields. Taking everything after the count would also swallow the trailing 99.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'tokens = "3 4 1 6 7 2".split()\ncount = int(tokens[0])\nprint([int(token) for token in tokens[1:1 + count]])',
          ['[4, 1, 6, 7, 2]', '[3, 4, 1]', '[4, 1, 6]', '[4, 1]'],
          2,
          'The slice starts after the count and stops after three fields, at position 4.',
        ),
        predictOutput(
          'What does this program print?',
          'tokens = "0 12 13".split()\ncount = int(tokens[0])\nprint(tokens[1:1 + count])',
          ["['12', '13']", '[]', "['0']", "['12']"],
          1,
          'A declared count of 0 makes the slice tokens[1:1], which is empty; 12 and 13 are trailing fields.',
        ),
        choose(
          'tokens[0] holds a count n. Which slice wrongly drops the last payload value?',
          ['tokens[1:1 + n]', 'tokens[1:]', 'tokens[1:n]', 'tokens[0:n + 1]'],
          2,
          'tokens[1:n] stops before position n, so it holds only n - 1 payload fields.',
        ),
        predictOutput(
          'What does this program print?',
          'tokens = "   \\n".split()\nif len(tokens) == 0:\n    print([])\nelse:\n    count = int(tokens[0])\n    print(tokens[1:1 + count])',
          ["['']", '[0]', '[]', "['\\n']"],
          2,
          'Whitespace-only text has no tokens, so the guard prints an empty payload instead of reading a missing count.',
        ),
      ],
    },
  ],
  'cp-input': [
    {
      title: 'Parse a counted case from multi-line text',
      explanation: [
        'Contest input is text with a declared structure. Split the whole text once: lines, spaces and tabs all separate tokens. Convert the leading count, then convert exactly that many following tokens, and only then compute with them.',
      ],
      example: {
        code: 'text = "4\\n10 -3\\n7 0\\n"\ntokens = text.split()\nn = int(tokens[0])\nreadings = [int(token) for token in tokens[1:1 + n]]\nprint(readings)\nprint(sum(readings))',
        output: '[10, -3, 7, 0]\n14',
        explanation:
          'The line breaks do not matter to split(). The leading 4 selects four readings, which total 14.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'text = "3\\n2 2\\n9\\n"\ntokens = text.split()\nn = int(tokens[0])\nreadings = [int(token) for token in tokens[1:1 + n]]\nprint(sum(readings))',
          ['13', '16', '11', '229'],
          0,
          'The readings are 2, 2 and 9. The count 3 is not one of them, and the repeated 2 is counted twice.',
        ),
        predictOutput(
          'What does this program print?',
          'text = "2 5\\n8 1"\ntokens = text.split()\nn = int(tokens[0])\nprint([int(token) for token in tokens[1:1 + n]])',
          ['[5, 8, 1]', "['5', '8']", '[2, 5]', '[5, 8]'],
          3,
          'The count 2 selects the next two tokens, across the line break, and converts them; the trailing 1 is ignored.',
        ),
        predictOutput(
          'What does this program print?',
          'text = "3\\n1 2 3\\n"\nprint(len(text.split()))',
          ['4', '3', '2', '9'],
          0,
          'All whitespace separates tokens, so the count and the three readings give four tokens, not one per line.',
        ),
        choose(
          'A case is "5" on one line followed by five integers spread over two lines. What must the parser do about the line breaks?',
          [
            'Split each line separately and join the results',
            'Remove every newline with strip() first',
            'Read only the first line, since it holds the count',
            'Nothing: split() treats a newline like a space',
          ],
          3,
          'split() with no argument separates on any whitespace, so the layout of lines does not matter.',
        ),
      ],
    },
    {
      title: 'Give every consumed token exactly one role',
      explanation: [
        'A parsing invariant: every token consumed so far has been given exactly one role in the format, such as count or value. Keep a position pos pointing at the next unread token. After reading a count n at pos, the values are tokens[pos + 1:pos + 1 + n] and the next unread token is at pos + 1 + n.',
        'This matters as soon as a case holds more than one section, for example two lists, each preceded by its own count.',
      ],
      example: {
        code: 'tokens = "2 5 8 3 1 1 4".split()\npos = 0\nfirst_count = int(tokens[pos])\nfirst = [int(t) for t in tokens[pos + 1:pos + 1 + first_count]]\npos = pos + 1 + first_count\nsecond_count = int(tokens[pos])\nsecond = [int(t) for t in tokens[pos + 1:pos + 1 + second_count]]\nprint(first)\nprint(second)',
        output: '[5, 8]\n[1, 1, 4]',
        explanation:
          'The first count 2 claims positions 1 and 2, so the second count is at position 3 and claims the last three tokens.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'tokens = "1 9 2 4 6".split()\npos = 0\ncount = int(tokens[pos])\npos = pos + 1 + count\ncount = int(tokens[pos])\nprint([int(t) for t in tokens[pos + 1:pos + 1 + count]])',
          ['[2, 4]', '[9, 2]', '[6]', '[4, 6]'],
          3,
          'The first section is the count 1 and the value 9. The next count, 2, is at position 2 and claims 4 and 6.',
        ),
        predictOutput(
          'What does this program print?',
          'tokens = "3 7 7 7 0".split()\npos = 0\ncount = int(tokens[pos])\npos = pos + 1 + count\nprint(pos)\nprint(tokens[pos])',
          ['3\n7', '4\n7', '5\n0', '4\n0'],
          3,
          'The count and its three values occupy positions 0 to 3, so the next unread token is at position 4.',
        ),
        choose(
          'A case reads "2 6 1 3 ...". A parser takes the second count from tokens[2]. What went wrong?',
          [
            'Nothing: position 2 holds the second count',
            'It skipped the first count entirely',
            'It converted the tokens too early',
            'It treated a payload value as the second count',
          ],
          3,
          'The first count 2 claims positions 1 and 2, so tokens[2] is a value; the second count is at position 3.',
        ),
        choose(
          'Why does a parser need each declared count when a case contains two sections?',
          [
            'To know which tokens should be sorted',
            'To decide whether tokens are strings or integers',
            'To skip whitespace that appears inside numbers',
            'To know where one section ends and the next count begins',
          ],
          3,
          'Without the count, nothing in the token list marks where the first section stops.',
        ),
      ],
    },
    {
      title: 'Edge cases and the cost of parsing',
      explanation: [
        'Blank text has no tokens, so there is no count to read: check before indexing tokens[0]. A count of 0 is valid and gives an empty payload. Convert with int() before arithmetic, because "4" + "5" is "45".',
        'Splitting and converting text of length L takes O(L) time and O(L) space for the tokens. Parsing once is cheap; splitting the same text again inside a loop multiplies that cost.',
      ],
      example: {
        code: 'for text in ["", "0\\n", "1\\n-6"]:\n    tokens = text.split()\n    if len(tokens) == 0:\n        print([])\n    else:\n        n = int(tokens[0])\n        print([int(t) for t in tokens[1:1 + n]])',
        output: '[]\n[]\n[-6]',
        explanation:
          'Blank text never reads tokens[0]. A count of 0 yields an empty payload. The last case has one reading, -6.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'tokens = "2 4 5".split()\nprint(tokens[1] + tokens[2])\nprint(int(tokens[1]) + int(tokens[2]))',
          ['9\n9', '45\n9', '9\n45', '45\n45'],
          1,
          'Unconverted tokens are joined as text; converted ones are added as numbers.',
        ),
        predictOutput(
          'What does this program print?',
          'tokens = "0 8 8".split()\nn = int(tokens[0])\nprint(len(tokens[1:1 + n]))',
          ['2', '0', '1', '3'],
          1,
          'The declared count is 0, so the payload slice is empty even though more tokens follow.',
        ),
        choose(
          'Why must blank text be checked before reading tokens[0]?',
          [
            'split() returns None for blank text',
            'Its token list is empty, so tokens[0] raises IndexError',
            'int() cannot convert any first token',
            'Blank text is split into a single empty token',
          ],
          1,
          'Whitespace-only text splits into [], which has no position 0.',
        ),
        choose(
          'Each of q queries calls text.split() on the whole input of length L again. What does parsing cost in total?',
          ['O(L)', 'O(q + L)', 'O(log L)', 'O(q · L)'],
          3,
          'Every query repeats the O(L) split, so the work multiplies. Splitting once and reusing the tokens costs O(L).',
        ),
      ],
    },
  ],
  'cp-state-transition': [
    {
      title: 'Apply one command to the current level',
      explanation: [
        'A transition rule says what one event does to the state. Here "up" adds 2, "down" subtracts 1, and "reset" sets the level to 0. One command changes the level exactly once, and there are no bounds yet: nothing stops the level from going below 0.',
      ],
      example: {
        code: 'def advance(level, command):\n    if command == "up":\n        return level + 2\n    elif command == "down":\n        return level - 1\n    else:\n        return 0\n\nprint(advance(7, "up"))\nprint(advance(0, "down"))\nprint(advance(-3, "reset"))',
        output: '9\n-1\n0',
        explanation:
          'up turns 7 into 9; down takes 0 to -1 because nothing stops it; reset ignores the old level -3 and returns 0.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'def advance(level, command):\n    if command == "up":\n        return level + 2\n    elif command == "down":\n        return level - 1\n    else:\n        return 0\n\nprint(advance(4, "down"))',
          ['2', '3', '5', '0'],
          1,
          'down subtracts exactly 1 from the current level 4.',
        ),
        predictOutput(
          'What does this program print?',
          'def advance(level, command):\n    if command == "up":\n        return level + 2\n    elif command == "down":\n        return level - 1\n    else:\n        return 0\n\nprint(advance(-5, "up"))',
          ['-3', '-7', '3', '2'],
          0,
          'up adds 2 to the current level: -5 + 2 = -3.',
        ),
        predictOutput(
          'What does this program print?',
          'def advance(level, command):\n    if command == "up":\n        return level + 2\n    elif command == "down":\n        return level - 1\n    else:\n        return 0\n\nprint(advance(0, "down"))',
          ['0', '1', '-2', '-1'],
          3,
          'This transition has no floor, so down takes 0 to -1.',
        ),
        choose(
          'The level is 12 when "reset" arrives. What is the level afterwards?',
          ['11', '10', '12', '0'],
          3,
          'reset replaces the level with 0; it does not subtract a fixed amount.',
        ),
      ],
    },
    {
      title: 'Feed each new state into the next transition',
      explanation: [
        'Events arrive in sequence, and each transition starts from the state the previous one produced, so the level is reassigned after every command. A reset discards the old level completely: commands before the last reset no longer affect the current level.',
      ],
      example: {
        code: 'def advance(level, command):\n    if command == "up":\n        return level + 2\n    elif command == "down":\n        return level - 1\n    else:\n        return 0\n\nlevel = 1\nlevel = advance(level, "up")\nlevel = advance(level, "up")\nlevel = advance(level, "down")\nprint(level)',
        output: '4',
        explanation:
          'The level goes 1 → 3 → 5 → 4. Each call receives the level produced by the call before it.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'def advance(level, command):\n    if command == "up":\n        return level + 2\n    elif command == "down":\n        return level - 1\n    else:\n        return 0\n\nlevel = 0\nlevel = advance(level, "up")\nlevel = advance(level, "down")\nlevel = advance(level, "down")\nlevel = advance(level, "up")\nprint(level)',
          ['1', '2', '4', '0'],
          1,
          'The level goes 0 → 2 → 1 → 0 → 2.',
        ),
        predictOutput(
          'What does this program print?',
          'def advance(level, command):\n    if command == "up":\n        return level + 2\n    elif command == "down":\n        return level - 1\n    else:\n        return 0\n\nlevel = 5\nlevel = advance(level, "down")\nlevel = advance(level, "reset")\nlevel = advance(level, "up")\nprint(level)',
          ['2', '6', '0', '1'],
          0,
          'The level goes 5 → 4 → 0 → 2. The reset erases the earlier level before up is applied.',
        ),
        predictOutput(
          'What does this program print?',
          'def advance(level, command):\n    if command == "up":\n        return level + 2\n    elif command == "down":\n        return level - 1\n    else:\n        return 0\n\nlevel = 2\nlevel = advance(level, "reset")\nlevel = advance(level, "down")\nlevel = advance(level, "down")\nprint(level)',
          ['0', '-2', '1', '-3'],
          1,
          'reset gives 0, and the two unbounded downs give -1 and then -2.',
        ),
        choose(
          'Commands up, up, reset, down arrive in that order. What is the final level, whatever the starting level was?',
          ['0', '3', 'It depends on the starting level', '-1'],
          3,
          'The reset sets the level to 0 regardless of history, and the final down gives -1.',
        ),
      ],
    },
  ],
  'cp-state-bounds': [
    {
      title: 'Clamp with max for the floor and min for the ceiling',
      explanation: [
        'max(a, b) returns the larger of two numbers and min(a, b) the smaller. To keep a value inside the inclusive interval [0, ceiling], raise anything below 0 with max(0, value), then lower anything above the ceiling with min(ceiling, ...). Values already inside the interval pass through unchanged.',
      ],
      example: {
        code: 'ceiling = 6\nfor value in [-3, 4, 11]:\n    print(min(ceiling, max(0, value)))',
        output: '0\n4\n6',
        explanation:
          '-3 is raised to the floor 0, 4 is already inside, and 11 is lowered to the ceiling 6.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'print(min(10, max(0, -7)))',
          ['0', '-7', '10', '7'],
          0,
          'max(0, -7) raises the value to 0, and min(10, 0) leaves it there.',
        ),
        predictOutput(
          'What does this program print?',
          'print(min(10, max(0, 13)))',
          ['13', '0', '10', '3'],
          2,
          'max(0, 13) is 13, and the ceiling lowers it to 10.',
        ),
        predictOutput(
          'What does this program print?',
          'print(min(5, max(0, 5)))',
          ['4', '5', '0', '6'],
          1,
          'The interval is inclusive, so a value equal to the ceiling is kept.',
        ),
        choose(
          'Which expression keeps value inside [0, ceiling] for ceiling >= 0?',
          [
            'max(ceiling, min(0, value))',
            'min(ceiling, max(0, value))',
            'min(0, max(ceiling, value))',
            'max(0, min(value, 0))',
          ],
          1,
          'max with 0 enforces the floor and min with the ceiling enforces the cap; the swapped versions push values outside the interval.',
        ),
      ],
    },
    {
      title: 'Clamp after the proposed transition',
      explanation: [
        'Bounds protect an invariant: after every step, 0 <= level <= ceiling. Compute the proposed level from the transition first, then clamp it. Clamping before the change cannot stop the change from crossing a bound. With a ceiling of 0, every value clamps to 0.',
      ],
      example: {
        code: 'ceiling = 5\nlevel = 4\nproposed = level + 2\nlevel = min(ceiling, max(0, proposed))\nprint(proposed)\nprint(level)',
        output: '6\n5',
        explanation:
          'The transition proposes 6, which breaks the cap; clamping afterwards restores the invariant with level 5.',
      },
      questions: [
        predictOutput(
          'This program clamps in the wrong place. What does it print?',
          'ceiling = 5\nlevel = 4\nlevel = min(ceiling, max(0, level))\nlevel = level + 2\nprint(level)',
          ['6', '5', '4', '7'],
          0,
          'Clamping 4 changes nothing, and the later +2 pushes the level to 6, past the ceiling.',
        ),
        predictOutput(
          'What does this program print?',
          'ceiling = 0\nfor proposed in [9, -2, 0]:\n    print(min(ceiling, max(0, proposed)))',
          ['9\n0\n0', '0\n-2\n0', '9\n-2\n0', '0\n0\n0'],
          3,
          'With ceiling 0 the interval [0, 0] holds a single value, so every proposal clamps to 0.',
        ),
        predictOutput(
          'What does this program print?',
          'ceiling = 3\nlevel = 0\nlevel = min(ceiling, max(0, level - 1))\nlevel = min(ceiling, max(0, level + 2))\nprint(level)',
          ['1', '2', '3', '0'],
          1,
          'The first step proposes -1 and clamps it to 0; the second proposes 2, which is inside the bounds.',
        ),
        choose(
          'Every step is clamped to [0, 7]. Which statement holds after each step?',
          ['level < 7', '0 <= level <= 7', '0 < level <= 7', 'level is 0 or 7'],
          1,
          'Clamping to an inclusive interval guarantees both bounds, and both endpoints are allowed.',
        ),
      ],
    },
  ],
  'cp-state-peak': [
    {
      title: 'Update the peak after every observation',
      explanation: [
        'A historical peak is the largest level seen so far. Start it at 0 for nonnegative levels and, after each observation, replace it with max(peak, level). The update never lowers peak, so after i observations it equals the largest of those i levels.',
      ],
      example: {
        code: 'peak = 0\nfor level in [3, 1, 6, 2]:\n    peak = max(peak, level)\n    print(peak)',
        output: '3\n3\n6\n6',
        explanation:
          'The peak rises to 3, stays at 3 when 1 arrives, rises to 6, and stays at 6.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'peak = 0\nfor level in [4, 9, 9, 1]:\n    peak = max(peak, level)\nprint(peak)',
          ['1', '23', '4', '9'],
          3,
          'The largest observation is 9; later smaller levels do not lower the peak.',
        ),
        predictOutput(
          'What does this program print?',
          'peak = 0\nfor level in [0, 2, 1]:\n    peak = max(peak, level)\n    print(peak)',
          ['0\n2\n1', '0\n1\n2', '2\n2\n2', '0\n2\n2'],
          3,
          'The peak is printed after each update: 0, then 2, and it stays 2 when 1 arrives.',
        ),
        choose(
          'Which update keeps peak equal to the largest level seen so far?',
          [
            'peak = level',
            'peak = max(peak, level)',
            'peak = peak + level',
            'peak = min(peak, level)',
          ],
          1,
          'Taking the maximum keeps earlier evidence and includes the new level.',
        ),
        predictOutput(
          'What does this program print?',
          'peak = 0\nfor level in [5, 3, 8, 7, 8]:\n    peak = max(peak, level)\nprint(peak)',
          ['7', '8', '5', '31'],
          1,
          'The peak reaches 8 at the third observation; the repeated 8 does not change it.',
        ),
      ],
    },
    {
      title: 'The peak survives drops and resets',
      explanation: [
        'Keep peak as its own variable, separate from the current level. A later drop or reset changes the current level but cannot undo a maximum that already happened. With no observations at all, peak keeps its starting value 0.',
      ],
      example: {
        code: 'level = 0\npeak = 0\nfor change in [4, -3, 5, -6]:\n    level = level + change\n    peak = max(peak, level)\nprint(level)\nprint(peak)',
        output: '0\n6',
        explanation:
          'The level goes 4, 1, 6, 0. The final level is 0, but the peak remembers 6.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'level = 0\npeak = 0\nfor change in [2, 2, -4, 1]:\n    level = level + change\n    peak = max(peak, level)\nprint(level)\nprint(peak)',
          ['4\n4', '1\n1', '1\n4', '1\n5'],
          2,
          'The level goes 2, 4, 0, 1. It ends at 1, while the peak keeps the 4 reached earlier.',
        ),
        predictOutput(
          'What does this program print?',
          'peak = 0\nfor level in []:\n    peak = max(peak, level)\nprint(peak)',
          ['None', '-1', 'Nothing is printed', '0'],
          3,
          'With no observations the loop never runs, so peak keeps its starting value 0.',
        ),
        predictOutput(
          'This program tries to track a peak. What does it print?',
          'peak = 0\nfor level in [7, 2, 0]:\n    peak = level\nprint(peak)',
          ['7', '9', '2', '0'],
          3,
          'Assigning peak = level replaces the old value every time, so it only remembers the last level.',
        ),
        choose(
          'A meter reaches 9 and later resets to 0. What is the historical peak after the reset?',
          ['0', '1', 'None', '9'],
          3,
          'A reset changes the current level, not the maximum that was already reached.',
        ),
      ],
    },
  ],
  'cp-simulation': [
    {
      title: 'Apply bounded transitions command by command',
      explanation: [
        'Simulation follows a process one event at a time. Here a meter starts at 0; "up" adds 2 but is capped at the ceiling, "down" subtracts 1 but is floored at 0, and "reset" sets the level to 0. Each command starts from the level the previous command produced.',
      ],
      example: {
        code: 'ceiling = 4\nlevel = 0\nfor command in ["up", "up", "up", "down", "down"]:\n    if command == "up":\n        level = min(ceiling, level + 2)\n    elif command == "down":\n        level = max(0, level - 1)\n    else:\n        level = 0\n    print(level)',
        output: '2\n4\n4\n3\n2',
        explanation:
          'The third up proposes 6 and is capped at 4. The two downs then give 3 and 2.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'ceiling = 5\nlevel = 0\nfor command in ["up", "up", "up", "down"]:\n    if command == "up":\n        level = min(ceiling, level + 2)\n    elif command == "down":\n        level = max(0, level - 1)\n    else:\n        level = 0\nprint(level)',
          ['5', '4', '6', '3'],
          1,
          'The level goes 2, 4, then 5 (6 is capped), then 4.',
        ),
        predictOutput(
          'What does this program print?',
          'ceiling = 3\nlevel = 0\nfor command in ["down", "down", "up"]:\n    if command == "up":\n        level = min(ceiling, level + 2)\n    elif command == "down":\n        level = max(0, level - 1)\n    else:\n        level = 0\nprint(level)',
          ['0', '2', '1', '3'],
          1,
          'Both downs are floored at 0, so the final up starts from 0 and gives 2.',
        ),
        predictOutput(
          'What does this program print?',
          'ceiling = 6\nlevel = 0\nfor command in ["up", "reset", "up", "up"]:\n    if command == "up":\n        level = min(ceiling, level + 2)\n    elif command == "down":\n        level = max(0, level - 1)\n    else:\n        level = 0\nprint(level)',
          ['4', '6', '2', '0'],
          0,
          'The reset clears the first 2, so only the last two ups count: 0 → 2 → 4.',
        ),
        choose(
          'The ceiling is 1. What level does a single "up" from 0 produce?',
          ['2', '1', '0', '3'],
          1,
          'up proposes 2, and the ceiling caps it at 1.',
        ),
      ],
    },
    {
      title: 'Update the peak after the level',
      explanation: [
        'Track two pieces of state: the current level and the highest level reached. After processing i commands, level must equal the real meter at that point and peak must be the largest level reached so far. Update the level first and the peak second, so that the newly reached level is included. Resets change the level but never the peak.',
      ],
      example: {
        code: 'ceiling = 5\nlevel = 0\npeak = 0\nfor command in ["up", "up", "reset", "up", "down"]:\n    if command == "up":\n        level = min(ceiling, level + 2)\n    elif command == "down":\n        level = max(0, level - 1)\n    else:\n        level = 0\n    peak = max(peak, level)\nprint(level)\nprint(peak)',
        output: '1\n4',
        explanation:
          'The levels are 2, 4, 0, 2, 1. The meter ends at 1, while the peak keeps the 4 reached before the reset.',
      },
      questions: [
        predictOutput(
          'This loop updates the peak first. What does it print?',
          'level = 0\npeak = 0\nfor command in ["up", "up"]:\n    peak = max(peak, level)\n    level = min(10, level + 2)\nprint(peak)',
          ['4', '2', '0', '6'],
          1,
          'The peak is taken before each change, so it never sees the final level 4; it records only 0 and 2.',
        ),
        predictOutput(
          'What does this program print?',
          'ceiling = 3\nlevel = 0\npeak = 0\nfor command in ["up", "up", "down", "reset"]:\n    if command == "up":\n        level = min(ceiling, level + 2)\n    elif command == "down":\n        level = max(0, level - 1)\n    else:\n        level = 0\n    peak = max(peak, level)\nprint(level)\nprint(peak)',
          ['0\n0', '0\n4', '3\n3', '0\n3'],
          3,
          'The levels are 2, 3 (capped), 2, 0. The final level is 0 and the peak is the capped 3.',
        ),
        predictOutput(
          'What does this program print?',
          'ceiling = 5\nlevel = 0\npeak = 0\nfor command in ["up", "up", "up", "down", "reset", "up"]:\n    if command == "up":\n        level = min(ceiling, level + 2)\n    elif command == "down":\n        level = max(0, level - 1)\n    else:\n        level = 0\n    peak = max(peak, level)\nprint(peak)',
          ['6', '2', '5', '4'],
          2,
          'The third up is capped at 5, which is the highest level ever reached; the reset does not erase it.',
        ),
        choose(
          'Why must peak be a separate variable from level?',
          [
            'level can never exceed the ceiling anyway',
            'Python cannot update two values in one loop',
            'A reset lowers level but must not erase the highest level',
            'peak decides which command comes next',
          ],
          2,
          'level describes the present and peak summarizes the history; one variable cannot do both.',
        ),
      ],
    },
    {
      title: 'Edge cases and the cost of a simulation',
      explanation: [
        'Test the edges of the rules: no commands (level and peak stay 0), a ceiling of 0 (every up is capped back to 0), and repeated downs at 0 (the floor holds). Each command does constant work, so m commands take O(m) time and O(1) extra space.',
        'Simulation is the right tool when each step is cheap and the number of steps fits the time limit. A process with 10¹⁸ steps cannot be stepped through one by one.',
      ],
      example: {
        code: 'def simulate(commands, ceiling):\n    level = 0\n    peak = 0\n    for command in commands:\n        if command == "up":\n            level = min(ceiling, level + 2)\n        elif command == "down":\n            level = max(0, level - 1)\n        else:\n            level = 0\n        peak = max(peak, level)\n    return (level, peak)\n\nprint(simulate([], 5))\nprint(simulate(["up", "up"], 0))\nprint(simulate(["down", "down", "up"], 1))',
        output: '(0, 0)\n(0, 0)\n(1, 1)',
        explanation:
          'No commands leave (0, 0). With ceiling 0 every up is capped at 0. Downs at 0 stay at 0, and the final up is capped at 1.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'def simulate(commands, ceiling):\n    level = 0\n    peak = 0\n    for command in commands:\n        if command == "up":\n            level = min(ceiling, level + 2)\n        elif command == "down":\n            level = max(0, level - 1)\n        else:\n            level = 0\n        peak = max(peak, level)\n    return (level, peak)\n\nprint(simulate(["up", "down", "down", "down"], 9))',
          ['(-1, 2)', '(0, 0)', '(2, 2)', '(0, 2)'],
          3,
          'The level goes 2, 1, 0, 0: the floor stops the third down. The peak keeps the earlier 2.',
        ),
        predictOutput(
          'What does this program print?',
          'def simulate(commands, ceiling):\n    level = 0\n    peak = 0\n    for command in commands:\n        if command == "up":\n            level = min(ceiling, level + 2)\n        elif command == "down":\n            level = max(0, level - 1)\n        else:\n            level = 0\n        peak = max(peak, level)\n    return (level, peak)\n\nprint(simulate(["up", "up", "up"], 0))',
          ['(6, 6)', '(0, 0)', '(2, 2)', '(0, 6)'],
          1,
          'With ceiling 0 every up is capped at 0, so neither the level nor the peak ever rises.',
        ),
        choose(
          'A simulation handles m commands with constant work each and stores only level and peak. What are its time and extra space?',
          [
            'O(m) time, O(1) space',
            'O(m) time, O(m) space',
            'O(m²) time, O(1) space',
            'O(1) time, O(1) space',
          ],
          0,
          'One constant-cost update per command gives O(m) time, and two variables are O(1) space.',
        ),
        choose(
          'A machine repeats a cheap 3-step cycle 10¹⁸ times. Why is stepping through every event a poor plan?',
          [
            'The number of steps, not their cost, is too large',
            'Each step becomes expensive after many repeats',
            'The peak cannot be stored for that many steps',
            'Simulation only works for at most three states',
          ],
          0,
          'Even constant-time steps add up: 10¹⁸ of them far exceed any time limit.',
        ),
      ],
    },
  ],
  'cp-enumerate-index-pairs': [
    {
      title: 'Start the inner index after the outer one',
      explanation: [
        'To visit each unordered pair of different positions once, let i run over every position and let j run from i + 1 to the end. Requiring i < j excludes self-pairs such as (2, 2) and mirrored repeats such as (1, 0) after (0, 1).',
      ],
      example: {
        code: 'pairs = []\nfor i in range(4):\n    for j in range(i + 1, 4):\n        pairs.append((i, j))\nprint(pairs)',
        output: '[(0, 1), (0, 2), (0, 3), (1, 2), (1, 3), (2, 3)]',
        explanation:
          'Position 0 pairs with 1, 2, 3; position 1 with 2, 3; position 2 with 3; position 3 has no later partner.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'pairs = []\nfor i in range(3):\n    for j in range(i + 1, 3):\n        pairs.append((i, j))\nprint(pairs)',
          [
            '[(0, 1), (0, 2), (1, 2)]',
            '[(0, 0), (0, 1), (0, 2), (1, 1), (1, 2), (2, 2)]',
            '[(0, 1), (1, 0), (0, 2), (2, 0), (1, 2), (2, 1)]',
            '[(0, 1), (1, 2)]',
          ],
          0,
          'j always starts after i, so each pair of different positions appears once with the smaller index first.',
        ),
        choose(
          'With n = 5, which pair can the loops for i in range(n) and for j in range(i + 1, n) never produce?',
          ['(0, 4)', '(1, 3)', '(3, 1)', '(2, 3)'],
          2,
          'Every generated pair has i < j, so (3, 1) only appears as (1, 3).',
        ),
        predictOutput(
          'This inner loop starts at i instead of i + 1. What does it print?',
          'count = 0\nfor i in range(3):\n    for j in range(i, 3):\n        count += 1\nprint(count)',
          ['3', '6', '9', '4'],
          1,
          'Starting at i adds the self-pairs (0, 0), (1, 1) and (2, 2) to the three real pairs.',
        ),
        choose(
          'A search for two different items uses for j in range(n) inside for i in range(n). What goes wrong?',
          [
            'It misses the last item and the first pair',
            'It pairs items with themselves and visits each pair twice',
            'It only ever compares neighboring positions',
            'It only works when the list is sorted',
          ],
          1,
          'Without i < j the loops produce (i, i) and both (i, j) and (j, i).',
        ),
      ],
    },
    {
      title: 'There are n(n − 1)/2 pairs of positions',
      explanation: [
        'With i < j, position 0 has n − 1 later partners, position 1 has n − 2, and so on, giving n(n − 1)/2 pairs. Pairs are about positions, not values: two equal values at different positions still form a pair. Lists of length 0 or 1 have no pairs.',
      ],
      example: {
        code: 'values = [7, 7, 7]\ncount = 0\nfor i in range(len(values)):\n    for j in range(i + 1, len(values)):\n        count += 1\nprint(count)',
        output: '3',
        explanation:
          'Three positions give 3 · 2 / 2 = 3 pairs: (0, 1), (0, 2) and (1, 2). Equal values do not remove any of them.',
      },
      questions: [
        choose(
          'How many pairs i < j exist in a list of 6 values?',
          ['30', '15', '36', '6'],
          1,
          '6 · 5 / 2 = 15. Thirty would count each pair twice, and 36 would include self-pairs too.',
        ),
        predictOutput(
          'What does this program print?',
          'values = [5]\ncount = 0\nfor i in range(len(values)):\n    for j in range(i + 1, len(values)):\n        count += 1\nprint(count)',
          ['0', '1', '5', '-1'],
          0,
          'For i = 0 the inner range(1, 1) is empty: a single position has no partner.',
        ),
        predictOutput(
          'What does this program print?',
          'values = [2, 9, 2, 2]\nsame = 0\nfor i in range(len(values)):\n    for j in range(i + 1, len(values)):\n        if values[i] == values[j]:\n            same += 1\nprint(same)',
          ['1', '2', '3', '6'],
          2,
          'The 2s sit at positions 0, 2 and 3, which form three different pairs of positions.',
        ),
        choose(
          'A list grows from 100 to 200 items. About how many times more pairs i < j are there?',
          [
            'About 2 times',
            'Exactly 100 more',
            'About 4 times',
            'About 8 times',
          ],
          2,
          'The count n(n − 1)/2 grows with n², so doubling n roughly quadruples it.',
        ),
      ],
    },
  ],
  'cp-enumerate-score': [
    {
      title: 'Score a pair with the absolute gap',
      explanation: [
        'A candidate is a choice to consider; its score says how good it is. For two positions i and j of a list, the gap score is abs(values[i] - values[j]). abs() removes the sign, so the order of the subtraction does not matter.',
      ],
      example: {
        code: 'values = [12, 5, 20]\nprint(abs(values[0] - values[1]))\nprint(abs(values[1] - values[0]))\nprint(abs(values[1] - values[2]))',
        output: '7\n7\n15',
        explanation:
          '12 - 5 and 5 - 12 differ only in sign, so both gaps are 7. The values 5 and 20 are 15 apart.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'values = [-4, 6]\nprint(abs(values[0] - values[1]))',
          ['-10', '2', '-2', '10'],
          3,
          '-4 - 6 is -10, and abs() makes the distance 10.',
        ),
        predictOutput(
          'What does this program print?',
          'values = [3, 8, 3]\nprint(abs(values[2] - values[0]))',
          ['2', '0', '5', '6'],
          1,
          'Both positions hold 3. The score depends on the values, not on how far apart the positions are.',
        ),
        choose(
          'Which expression gives the same score no matter which position is written first?',
          [
            'values[i] - values[j]',
            'values[j] - values[i]',
            'abs(values[i]) - abs(values[j])',
            'abs(values[i] - values[j])',
          ],
          3,
          'Only the absolute difference is symmetric; plain subtraction changes sign when the order flips.',
        ),
        predictOutput(
          'What does this program print?',
          'def gap(values, i, j):\n    return abs(values[i] - values[j])\n\nprint(gap([10, -10, 4], 0, 1))',
          ['0', '-20', '20', '1'],
          2,
          '10 - (-10) is 20; the gap is a distance, so it is never negative.',
        ),
      ],
    },
    {
      title: 'Keep the score separate from candidate generation',
      explanation: [
        'Write the score as its own function of one candidate. The loops that generate pairs stay the same whatever the objective, so switching from "smallest gap" to "largest sum" changes only the scoring function. Scoring one pair takes constant time and constant extra space.',
      ],
      example: {
        code: 'def gap(values, i, j):\n    return abs(values[i] - values[j])\n\ndef total(values, i, j):\n    return values[i] + values[j]\n\nvalues = [6, 1, 9]\nprint(gap(values, 0, 2))\nprint(total(values, 0, 2))',
        output: '3\n15',
        explanation:
          'The same candidate (0, 2) gets a different score under each objective: a gap of 3 and a sum of 15.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'def gap(values, i, j):\n    return abs(values[i] - values[j])\n\ndef total(values, i, j):\n    return values[i] + values[j]\n\nvalues = [4, -2, 7]\nprint(gap(values, 1, 2))\nprint(total(values, 1, 2))',
          ['5\n9', '9\n5', '9\n9', '-9\n5'],
          1,
          'The candidate (1, 2) holds -2 and 7: their gap is 9 and their sum is 5.',
        ),
        choose(
          'A task changes from "smallest gap" to "smallest product". What must change in a well-separated enumeration?',
          [
            'Only the loops that generate pairs',
            'Both the loops and the scoring function',
            'The list must be sorted before scoring',
            'Only the scoring function',
          ],
          3,
          'The candidates are still all pairs i < j; only how each pair is judged changes.',
        ),
        predictOutput(
          'What does this program print?',
          'def gap(values, i, j):\n    return abs(values[i] - values[j])\n\nvalues = [5, 5, 1]\nprint(gap(values, 0, 1) + gap(values, 1, 2))',
          ['4', '8', '0', '5'],
          0,
          'The first pair holds equal values and scores 0; the second scores 4.',
        ),
        choose(
          'How much extra memory does scoring one candidate pair need?',
          ['O(n)', 'O(n²)', 'O(log n)', 'O(1)'],
          3,
          'It reads two values and computes one number, independent of the list length.',
        ),
      ],
    },
  ],
  'cp-enumerate-best': [
    {
      title: 'Start with no best, then improve it',
      explanation: [
        'While minimizing, keep best equal to the smallest score visited so far. Before any visit there is no best, which None represents. The test best is None or score < best accepts the first score and afterwards accepts only strict improvements. Because or stops at a true left side, score < best is never evaluated while best is None.',
      ],
      example: {
        code: 'best = None\nfor score in [8, 11, 3, 5]:\n    if best is None or score < best:\n        best = score\n    print(best)',
        output: '8\n8\n3\n3',
        explanation:
          'The first score 8 fills the empty state. 11 is not better, 3 is, and 5 is not.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'best = None\nfor score in [6, 2, 9, 2]:\n    if best is None or score < best:\n        best = score\nprint(best)',
          ['6', '9', '2', '19'],
          2,
          '6 starts the minimum, 2 improves it, and neither 9 nor the second 2 is strictly smaller.',
        ),
        predictOutput(
          'What does this program print?',
          'best = None\nfor score in [5, 7, 4]:\n    if best is None or score < best:\n        best = score\n    print(best)',
          ['5\n5\n4', '5\n7\n4', 'None\n5\n5', '4\n4\n4'],
          0,
          'best is printed after each update: 5 is accepted, 7 is rejected, 4 improves it.',
        ),
        predictOutput(
          'What does this program print?',
          'best = None\nfor score in []:\n    if best is None or score < best:\n        best = score\nprint(best)',
          ['None', '0', '-1', 'Nothing is printed'],
          0,
          'No candidate is visited, so best keeps the empty state None.',
        ),
        choose(
          'Why does the condition check best is None before score < best?',
          [
            'None is smaller than every possible score',
            'The first score must be accepted while no best exists',
            'It makes the loop skip the first score',
            'It makes later comparisons run faster',
          ],
          1,
          'The first candidate has nothing to beat, and comparing a number with None would fail.',
        ),
      ],
    },
    {
      title: 'Avoid fake starting values and decide ties',
      explanation: [
        'Starting a minimum at 0 claims a perfect score before anything is checked: if every real score is positive, nothing beats it and the answer is wrong. Starting at None keeps the empty state honest, and an empty input correctly reports None. The strict < also settles ties: the first candidate to reach the best score is kept.',
      ],
      example: {
        code: 'best = 0\nfor score in [7, 4, 9]:\n    if score < best:\n        best = score\nprint(best)',
        output: '0',
        explanation:
          'This starts at 0, so no positive score is smaller and the program reports 0, even though the true minimum is 4.',
      },
      questions: [
        predictOutput(
          'This minimum starts from a guessed value. What does it print?',
          'best = 100\nfor score in [150, 120]:\n    if score < best:\n        best = score\nprint(best)',
          ['100', '120', '150', 'None'],
          0,
          'The guess 100 is below every real score, so it is never replaced and the program reports a score that no candidate had.',
        ),
        predictOutput(
          'What does this program print?',
          'position = 0\nbest = None\nbest_position = None\nfor score in [5, 3, 8, 3]:\n    if best is None or score < best:\n        best = score\n        best_position = position\n    position += 1\nprint(best_position)',
          ['3', '1', '2', '0'],
          1,
          'The 3 at position 1 sets the best; the later 3 at position 3 is not strictly smaller, so it does not replace it.',
        ),
        choose(
          'All scores are positive. What goes wrong if best starts at 0 instead of None?',
          [
            'The first score is skipped but the rest work',
            'The first comparison raises an error',
            'The result becomes the largest score',
            'No score is below 0, so the result stays 0',
          ],
          3,
          'A fake perfect score can never be improved by real candidates.',
        ),
        choose(
          'With the update rule score < best, which candidate is kept when two candidates tie for the best score?',
          [
            'The one visited last',
            'Neither; best becomes None',
            'Both, stored in a list',
            'The one visited first',
          ],
          3,
          'The later tie is not strictly smaller, so the earlier candidate stays.',
        ),
      ],
    },
  ],
  'cp-enumeration': [
    {
      title: 'Enumerate, score and keep the best',
      explanation: [
        'Complete enumeration combines three parts: generate every candidate (pairs i < j), score each one (abs(values[i] - values[j])), and keep the best score seen so far, starting from None. For the smallest gap in an unsorted list, that is two nested loops around one score and one update.',
      ],
      example: {
        code: 'values = [20, 4, 15, 9]\nbest = None\nfor i in range(len(values)):\n    for j in range(i + 1, len(values)):\n        gap = abs(values[i] - values[j])\n        if best is None or gap < best:\n            best = gap\nprint(best)',
        output: '5',
        explanation:
          'The six gaps are 16, 5, 11, 11, 5 and 6. The smallest is 5 (from 20 and 15, and again from 4 and 9).',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'values = [7, 1, 12, 3]\nbest = None\nfor i in range(len(values)):\n    for j in range(i + 1, len(values)):\n        gap = abs(values[i] - values[j])\n        if best is None or gap < best:\n            best = gap\nprint(best)',
          ['2', '6', '4', '11'],
          0,
          'The closest values are 1 and 3, at positions 1 and 3. They are not neighbors, so only a complete enumeration finds them.',
        ),
        predictOutput(
          'What does this program print?',
          'values = [10, 3, 10]\nbest = None\nfor i in range(len(values)):\n    for j in range(i + 1, len(values)):\n        gap = abs(values[i] - values[j])\n        if best is None or gap < best:\n            best = gap\nprint(best)',
          ['7', '3', '0', 'None'],
          2,
          'Positions 0 and 2 hold equal values, so their gap 0 is the minimum.',
        ),
        predictOutput(
          'This enumeration looks for the largest pair sum. What does it print?',
          'values = [4, -1, 6, 2]\nbest = None\nfor i in range(len(values)):\n    for j in range(i + 1, len(values)):\n        total = values[i] + values[j]\n        if best is None or total > best:\n            best = total\nprint(best)',
          ['12', '10', '11', '8'],
          1,
          'The best pair is 4 and 6. Pairing 6 with itself (12) is excluded by i < j.',
        ),
        choose(
          'Why is the enumerated minimum gap guaranteed to be correct?',
          [
            'The list is sorted before the pairs are scored',
            'The closest values always sit at neighboring positions',
            'The first pair visited always has the smallest gap',
            'Every pair i < j is scored, so the optimal pair is among them',
          ],
          3,
          'Complete coverage means no candidate is skipped, so the best one cannot be missed.',
        ),
      ],
    },
    {
      title: 'Track the winning candidate, not just its score',
      explanation: [
        'Often the answer is the winning pair itself. Store best_pair next to best and replace both together. After each visited pair, best is the smallest gap among the visited pairs and best_pair is a pair that achieves it; with strict <, it is the first such pair in visiting order.',
      ],
      example: {
        code: 'values = [9, 2, 14, 5]\nbest = None\nbest_pair = None\nfor i in range(len(values)):\n    for j in range(i + 1, len(values)):\n        gap = abs(values[i] - values[j])\n        if best is None or gap < best:\n            best = gap\n            best_pair = (i, j)\nprint(best)\nprint(best_pair)',
        output: '3\n(1, 3)',
        explanation:
          'The gaps in visiting order are 7, 5, 4, 12, 3, 9. The pair (1, 3), holding 2 and 5, gives the smallest gap 3.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'values = [6, 10, 8, 1]\nbest = None\nbest_pair = None\nfor i in range(len(values)):\n    for j in range(i + 1, len(values)):\n        gap = abs(values[i] - values[j])\n        if best is None or gap < best:\n            best = gap\n            best_pair = (i, j)\nprint(best_pair)',
          ['(1, 2)', '(0, 2)', '(2, 0)', '(6, 8)'],
          1,
          'Pairs (0, 2) and (1, 2) both have gap 2. With strict <, the first one visited, (0, 2), stays.',
        ),
        predictOutput(
          'This version uses <= in the update. What does it print?',
          'values = [6, 10, 8, 1]\nbest = None\nbest_pair = None\nfor i in range(len(values)):\n    for j in range(i + 1, len(values)):\n        gap = abs(values[i] - values[j])\n        if best is None or gap <= best:\n            best = gap\n            best_pair = (i, j)\nprint(best_pair)',
          ['(0, 2)', '(0, 1)', '(1, 2)', '(2, 1)'],
          2,
          'With <=, a later tie replaces the earlier one, so (1, 2) overwrites (0, 2).',
        ),
        predictOutput(
          'What does this program print?',
          'values = [5, 1, 4]\nbest = None\nbest_pair = None\nfor i in range(len(values)):\n    for j in range(i + 1, len(values)):\n        gap = abs(values[i] - values[j])\n        if best is None or gap < best:\n            best = gap\n            best_pair = (i, j)\nprint(best)\nprint(best_pair)',
          ['1\n(2, 0)', '1\n(0, 2)', '3\n(1, 2)', '1\n(5, 4)'],
          1,
          'The gaps are 4, 1 and 3. The best pair stores positions (0, 2), not the values 5 and 4.',
        ),
        choose(
          'The loops have visited some of the pairs. What does best equal at that moment?',
          [
            'The smallest gap among all pairs of the list',
            'The gap of the most recently visited pair',
            'The smallest value visited so far',
            'The smallest gap among the pairs visited so far',
          ],
          3,
          'The invariant covers only visited pairs; it describes the whole list once the loops finish.',
        ),
      ],
    },
    {
      title: 'Cost and edge cases of enumeration',
      explanation: [
        'There are n(n − 1)/2 pairs, so constant-time scoring gives O(n²) time and O(1) extra space. That makes enumeration a reliable reference for small inputs and a checker for faster methods, but n = 10⁵ means about 5 × 10⁹ pairs, which is too slow.',
        'Lists with fewer than two values have no pairs, so best stays None. Duplicate values give a gap of 0, which no other pair can beat.',
      ],
      example: {
        code: 'for values in [[], [8], [8, 8, 1]]:\n    best = None\n    for i in range(len(values)):\n        for j in range(i + 1, len(values)):\n            gap = abs(values[i] - values[j])\n            if best is None or gap < best:\n                best = gap\n    print(best)',
        output: 'None\nNone\n0',
        explanation:
          'The empty list and the single value have no pairs, so best stays None. The duplicate 8s give gap 0.',
      },
      questions: [
        choose(
          'n can be 100,000. About how many pairs would a complete enumeration score?',
          ['About 10⁵', 'About 2 × 10¹⁰', 'About 1.7 × 10⁶', 'About 5 × 10⁹'],
          3,
          'n(n − 1)/2 is about 10¹⁰ / 2, which is far beyond a typical time limit.',
        ),
        predictOutput(
          'What does this program print?',
          'values = [3, 9, 1, 4, 6]\nscored = 0\nfor i in range(len(values)):\n    for j in range(i + 1, len(values)):\n        scored += 1\nprint(scored)',
          ['25', '10', '20', '5'],
          1,
          'Five positions have 5 · 4 / 2 = 10 pairs with i < j.',
        ),
        choose(
          'Why is enumeration still useful when it is too slow for the full constraints?',
          [
            'It becomes linear after its first pass',
            'It is faster than sorting on every input',
            'It gives trusted answers on small inputs to check a faster method',
            'It needs no extra memory, so it scales to any n',
          ],
          2,
          'Its correctness is easy to argue, so it is the baseline that faster solutions are tested against.',
        ),
        predictOutput(
          'What does this program print?',
          'for values in [[4], [-1, -1]]:\n    best = None\n    for i in range(len(values)):\n        for j in range(i + 1, len(values)):\n            gap = abs(values[i] - values[j])\n            if best is None or gap < best:\n                best = gap\n    print(best)',
          ['0\n0', 'None\n0', 'None\nNone', '4\n0'],
          1,
          'One value has no pair, so best stays None. Two equal values give gap 0.',
        ),
      ],
    },
  ],
  'cp-sort-copy': [
    {
      title: 'sorted() returns a new list',
      explanation: [
        'sorted(values) builds a new list holding the same items in ascending order and leaves values exactly as it was. Sorting only rearranges: repeated items stay repeated and no item changes. Use sorted() when the original order still matters later.',
      ],
      example: {
        code: 'values = [7, 2, 7, -1]\nordered = sorted(values)\nprint(ordered)\nprint(values)',
        output: '[-1, 2, 7, 7]\n[7, 2, 7, -1]',
        explanation:
          'The new list holds the four items in ascending order, both 7s included. The original list keeps its order.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'values = [3, 1, 2]\nordered = sorted(values)\nprint(values)',
          ['[1, 2, 3]', 'None', '[2, 1, 3]', '[3, 1, 2]'],
          3,
          'sorted() put the ordered items in a new list; values itself was not changed.',
        ),
        predictOutput(
          'What does this program print?',
          'print(sorted([5, -2, 5, 0]))',
          ['[-2, 0, 5]', '[0, -2, 5, 5]', '[5, 5, 0, -2]', '[-2, 0, 5, 5]'],
          3,
          'Ascending order puts -2 first, and both copies of 5 remain.',
        ),
        predictOutput(
          'What does this program print?',
          'print(sorted(["pear", "fig", "apple"]))',
          [
            "['apple', 'fig', 'pear']",
            "['fig', 'pear', 'apple']",
            "['pear', 'fig', 'apple']",
            "['fig', 'apple', 'pear']",
          ],
          0,
          'Strings sort alphabetically, character by character, not by length.',
        ),
        choose(
          "A function needs the scores in order but must not disturb the caller's list. Which line should it use?",
          [
            'scores.sort()',
            'ordered = scores.sort()',
            'ordered = scores',
            'ordered = sorted(scores)',
          ],
          3,
          'sorted() returns an ordered copy. scores.sort() rearranges the caller’s list, and assigning its result stores None.',
        ),
      ],
    },
    {
      title: 'list.sort() changes the list and returns None',
      explanation: [
        'values.sort() rearranges the existing list in place and returns None, so result = values.sort() stores None rather than the sorted list. Any other name that refers to the same list sees the new order too. Either way, comparison sorting of n items costs O(n log n) time.',
      ],
      example: {
        code: 'values = [9, 4, 6]\nresult = values.sort()\nprint(result)\nprint(values)',
        output: 'None\n[4, 6, 9]',
        explanation: 'The method reorders values itself and hands back None.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'scores = [30, 10, 20]\nalias = scores\nscores.sort()\nprint(alias)',
          ['[10, 20, 30]', '[30, 10, 20]', 'None', '[30, 20, 10]'],
          0,
          'alias and scores name the same list, so sorting it in place is visible through both names.',
        ),
        predictOutput(
          'What does this program print?',
          'values = [2, 8, 5]\nordered = values.sort()\nprint(ordered)',
          ['[2, 5, 8]', '[2, 8, 5]', '[]', 'None'],
          3,
          'list.sort() returns None; the sorted order lives in values, not in ordered.',
        ),
        predictOutput(
          'What does this program print?',
          'a = [3, 1, 2]\nb = sorted(a)\na.append(0)\nprint(b)',
          ['[0, 1, 2, 3]', '[1, 2, 3]', '[3, 1, 2, 0]', 'None'],
          1,
          'b is a separate new list, so appending to a later does not affect it.',
        ),
        choose(
          'How long does sorting n items take with sorted() or with list.sort()?',
          [
            'O(n log n) for both',
            'O(n) for sorted(), because it only copies',
            'O(1) for list.sort(), because it works in place',
            'O(n²) for both, on every input',
          ],
          0,
          'Both perform a comparison sort; working in place changes the memory used, not the comparison cost.',
        ),
      ],
    },
  ],
  'cp-sort-key': [
    {
      title: 'Tuples compare field by field',
      explanation: [
        'Python compares tuples one field at a time: the first fields decide, and a later field is examined only when every earlier field ties. Sorting a list of (deadline, effort) tuples therefore orders by deadline and uses effort only to break deadline ties.',
      ],
      example: {
        code: 'records = [(3, 2), (1, 9), (3, 1), (2, 5)]\nprint(sorted(records))\nprint((2, 100) < (3, 0))',
        output: '[(1, 9), (2, 5), (3, 1), (3, 2)]\nTrue',
        explanation:
          'Deadlines 1, 2, 3 decide the order; effort only separates the two records with deadline 3. A smaller first field wins no matter how large the second one is.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'print(sorted([(2, 1), (1, 5), (2, 0)]))',
          [
            '[(2, 0), (2, 1), (1, 5)]',
            '[(1, 5), (2, 1), (2, 0)]',
            '[(2, 0), (1, 5), (2, 1)]',
            '[(1, 5), (2, 0), (2, 1)]',
          ],
          3,
          'The first field 1 comes first; the two records with first field 2 are then ordered by their second fields.',
        ),
        predictOutput(
          'What does this program print?',
          'print((4, 1) < (3, 9))',
          ['True', '(3, 9)', '(4, 1)', 'False'],
          3,
          'The first fields already differ, and 4 is not less than 3, so the second fields are never compared.',
        ),
        choose(
          'Which tuple comes first in ascending order?',
          ['(1, 50)', '(2, -9)', '(2, -8)', '(3, 0)'],
          0,
          'The smallest first field decides, regardless of the second field.',
        ),
        choose(
          'When does Python examine the second fields while comparing two tuples?',
          [
            'Always, before the first fields',
            'Only when the tuples contain negatives',
            'Only when the first fields are equal',
            'Only when the tuples differ in length',
          ],
          2,
          'Comparison is lexicographic: later fields only break ties in earlier ones.',
        ),
      ],
    },
    {
      title: 'A key function decides the order',
      explanation: [
        'sorted(records, key=f) compares f(record) instead of each record itself. A lambda writes a short key function inline: lambda record: (record[0], -record[1]) sorts by the first field ascending and, among equal first fields, by the second field descending, because negating a number reverses its order. The records returned are the original records, not their keys.',
      ],
      example: {
        code: 'tasks = [(2, 4), (1, 3), (2, 8), (1, 6)]\nprint(sorted(tasks, key=lambda task: (task[0], -task[1])))\nprint(sorted(tasks, key=lambda task: task[1]))',
        output:
          '[(1, 6), (1, 3), (2, 8), (2, 4)]\n[(1, 3), (2, 4), (1, 6), (2, 8)]',
        explanation:
          'The first key groups by the first field and puts larger second fields first. The second key ignores the first field and orders by the second field alone.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'records = [(5, 1), (5, 4), (2, 2)]\nprint(sorted(records, key=lambda r: (r[0], -r[1])))',
          [
            '[(2, 2), (5, 4), (5, 1)]',
            '[(2, 2), (5, 1), (5, 4)]',
            '[(5, 4), (5, 1), (2, 2)]',
            '[(2, -2), (5, -4), (5, -1)]',
          ],
          0,
          'The first field 2 comes first. Among the two records with 5, the negated second field puts 4 before 1. The records themselves are not changed.',
        ),
        predictOutput(
          'What does this program print?',
          'people = [("ann", 3), ("bo", 1), ("cy", 2)]\nprint(sorted(people, key=lambda p: p[1]))',
          [
            "[('ann', 3), ('bo', 1), ('cy', 2)]",
            "[('bo', 1), ('cy', 2), ('ann', 3)]",
            '[1, 2, 3]',
            "[('ann', 3), ('cy', 2), ('bo', 1)]",
          ],
          1,
          'The key compares only the numbers, but sorted() returns the whole records in that order.',
        ),
        choose(
          'Records are (deadline, effort). Which key sorts by effort descending, then deadline ascending?',
          ['(r[0], -r[1])', '(-r[1], r[0])', '(r[1], -r[0])', '(-r[0], r[1])'],
          1,
          'Effort must be the first key field and negated; deadline breaks ties in its normal direction.',
        ),
        choose(
          'What does sorted(records, key=lambda r: (r[0], -r[1])) return?',
          [
            'The original records, reordered',
            'The key tuples, in sorted order',
            'Records whose second field is negated',
            'None, because the key changes the list',
          ],
          0,
          'The key is used only for comparisons; the result holds the records themselves.',
        ),
      ],
    },
  ],
  'cp-sort-stability': [
    {
      title: 'Equal keys keep their arrival order',
      explanation: [
        'Python sorting is stable: when two records have equal keys, they appear in the result in the same relative order as in the input. Sorting tickets by priority alone therefore keeps arrival order inside each priority.',
      ],
      example: {
        code: 'tickets = [(2, "c"), (1, "x"), (2, "a"), (1, "b")]\nprint(sorted(tickets, key=lambda t: t[0]))',
        output: "[(1, 'x'), (1, 'b'), (2, 'c'), (2, 'a')]",
        explanation:
          'Within priority 1, x arrived before b; within priority 2, c arrived before a. Both orders survive the sort.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'items = [(3, "p"), (1, "q"), (3, "r"), (1, "s")]\nprint(sorted(items, key=lambda t: t[0]))',
          [
            "[(1, 'q'), (1, 's'), (3, 'p'), (3, 'r')]",
            "[(1, 's'), (1, 'q'), (3, 'r'), (3, 'p')]",
            "[(1, 'q'), (3, 'p'), (1, 's'), (3, 'r')]",
            "[(3, 'p'), (3, 'r'), (1, 'q'), (1, 's')]",
          ],
          0,
          'The key groups by the number, and within each group the records stay in arrival order: q before s, p before r.',
        ),
        predictOutput(
          'What does this program print?',
          'words = ["kiwi", "fig", "plum", "pea"]\nprint(sorted(words, key=lambda w: len(w)))',
          [
            "['pea', 'fig', 'kiwi', 'plum']",
            "['fig', 'pea', 'plum', 'kiwi']",
            "['fig', 'pea', 'kiwi', 'plum']",
            "['kiwi', 'fig', 'plum', 'pea']",
          ],
          2,
          'Words of equal length keep their input order: fig before pea and kiwi before plum. They are not alphabetized.',
        ),
        choose(
          'Orders arrive as (priority, id): (2, 7), (1, 4), (2, 3). After a stable sort by priority alone, how are the two priority-2 orders arranged?',
          [
            '3 before 7',
            '7 before 3',
            'In an unpredictable order',
            'Only one of them remains',
          ],
          1,
          'They tie on the key, so the one that arrived first, id 7, stays first.',
        ),
        choose(
          'Does a stable sort keep the whole input order?',
          [
            'No, only the relative order of equal keys',
            'Yes, every record stays where it was',
            'Only for records that contain strings',
            'Only when all keys are distinct',
          ],
          0,
          'Records with different keys move to their sorted positions; stability only governs ties.',
        ),
      ],
    },
    {
      title: 'Stability versus an explicit tie-breaker',
      explanation: [
        'Adding a field to the key changes the contract: with key (priority, label), ties are alphabetized instead of kept in arrival order. Use the key alone when arrival order should decide ties, and add fields only for tie-breakers the task asks for. Stability also allows sorting in passes: sort by the secondary field first, then stably by the primary field.',
      ],
      example: {
        code: 'tickets = [(2, "c"), (1, "x"), (2, "a")]\nprint(sorted(tickets, key=lambda t: t[0]))\nprint(sorted(tickets, key=lambda t: (t[0], t[1])))',
        output:
          "[(1, 'x'), (2, 'c'), (2, 'a')]\n[(1, 'x'), (2, 'a'), (2, 'c')]",
        explanation:
          'The first sort keeps c before a, as they arrived. The second key adds the label, so the tie is broken alphabetically and a comes first.',
      },
      questions: [
        predictOutput(
          'This program sorts in two passes. What does it print?',
          'people = [("dan", 30), ("amy", 25), ("cal", 30), ("bea", 25)]\nby_name = sorted(people, key=lambda p: p[0])\nby_age = sorted(by_name, key=lambda p: p[1])\nprint(by_age)',
          [
            "[('bea', 25), ('amy', 25), ('dan', 30), ('cal', 30)]",
            "[('amy', 25), ('bea', 25), ('dan', 30), ('cal', 30)]",
            "[('amy', 25), ('bea', 25), ('cal', 30), ('dan', 30)]",
            "[('amy', 25), ('cal', 30), ('bea', 25), ('dan', 30)]",
          ],
          2,
          'The second sort is by age, and equal ages keep the order of the first pass, which was alphabetical.',
        ),
        predictOutput(
          'What does this program print?',
          'rows = [(1, "z"), (1, "m"), (0, "q")]\nprint(sorted(rows, key=lambda t: (t[0], t[1])))',
          [
            "[(0, 'q'), (1, 'z'), (1, 'm')]",
            "[(1, 'm'), (1, 'z'), (0, 'q')]",
            "[(1, 'z'), (1, 'm'), (0, 'q')]",
            "[(0, 'q'), (1, 'm'), (1, 'z')]",
          ],
          3,
          'The label is part of the key, so the tie at 1 is broken alphabetically rather than by arrival.',
        ),
        choose(
          'A queue serves requests by priority, and by arrival among equal priorities. Requests are (priority, name). Which key should the sort use?',
          [
            'The priority alone',
            '(priority, name)',
            'The whole request tuple',
            '(priority, len(name))',
          ],
          0,
          'Stability already keeps arrival order for ties; adding the name would reorder them.',
        ),
        choose(
          'Records must end up ordered by city, and by name within each city, using two stable sorts. Which order of passes works?',
          [
            'Sort by name first, then by city',
            'Sort by city first, then by name',
            'Either order gives the same result',
            'Sort by city twice, then by name',
          ],
          0,
          'The last pass decides the main order; stability then preserves the name order from the earlier pass within each city.',
        ),
      ],
    },
  ],
  'cp-sorting': [
    {
      title: 'Choose sorted() or sort(), then write the key',
      explanation: [
        'Sorting records takes two decisions. First, sorted(records) returns a new list and keeps the input, while records.sort() reorders the input and returns None. Second, the key states the order: (job[0], -job[1]) puts earlier deadlines first and, within a deadline, larger efforts first.',
      ],
      example: {
        code: 'jobs = [(3, 1, "ink"), (1, 4, "map"), (3, 6, "oar")]\nordered = sorted(jobs, key=lambda job: (job[0], -job[1]))\nprint(ordered)\nprint(jobs[0])',
        output: "[(1, 4, 'map'), (3, 6, 'oar'), (3, 1, 'ink')]\n(3, 1, 'ink')",
        explanation:
          'Deadline 1 comes first. At deadline 3, effort 6 precedes effort 1. The input list still starts with the ink job.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'jobs = [(2, 5, "a"), (1, 1, "b"), (2, 9, "c")]\nordered = sorted(jobs, key=lambda job: (job[0], -job[1]))\nfor job in ordered:\n    print(job[2])',
          ['b\na\nc', 'a\nc\nb', 'c\na\nb', 'b\nc\na'],
          3,
          'Deadline 1 (b) comes first; at deadline 2 the larger effort 9 (c) precedes 5 (a).',
        ),
        predictOutput(
          'What does this program print?',
          'jobs = [(4, 2), (1, 3)]\nresult = jobs.sort()\nprint(result)\nprint(jobs)',
          [
            'None\n[(1, 3), (4, 2)]',
            '[(1, 3), (4, 2)]\n[(1, 3), (4, 2)]',
            'None\n[(4, 2), (1, 3)]',
            '[(1, 3), (4, 2)]\n[(4, 2), (1, 3)]',
          ],
          0,
          'sort() reorders jobs in place and returns None.',
        ),
        choose(
          'Records are (score, time). Rank by score descending, then by time ascending. Which key?',
          ['(r[0], -r[1])', '(-r[0], -r[1])', '(-r[0], r[1])', '(r[1], -r[0])'],
          2,
          'Score is the primary field and is negated for descending order; time breaks ties ascending.',
        ),
        choose(
          'A function returns records ordered by deadline, and the caller still needs the original order afterwards. What should it use?',
          [
            'records.sort(key=...)',
            'sorted(records, key=...)',
            'records.reverse()',
            'records = records.sort(key=...)',
          ],
          1,
          'Only sorted() leaves the input untouched; sort() reorders it, and its return value is None.',
        ),
      ],
    },
    {
      title: 'Ties keep arrival order unless the key says otherwise',
      explanation: [
        'The result contains every record, arranged so that keys never decrease. Records with equal keys keep their arrival order because the sort is stable; the sort does not invent an extra tie-breaker. If the task wants ties broken by a label, the label must be part of the key.',
      ],
      example: {
        code: 'jobs = [(2, 5, "elm"), (1, 5, "ash"), (2, 5, "bay"), (2, 7, "fir")]\nfor job in sorted(jobs, key=lambda job: (job[0], -job[1])):\n    print(job[2])',
        output: 'ash\nfir\nelm\nbay',
        explanation:
          'ash has the earliest deadline. At deadline 2, fir has the largest effort; elm and bay tie completely, so they stay in arrival order.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'jobs = [(1, 2, "q"), (1, 2, "a"), (0, 9, "z")]\nfor job in sorted(jobs, key=lambda job: (job[0], -job[1])):\n    print(job[2])',
          ['z\na\nq', 'q\na\nz', 'a\nq\nz', 'z\nq\na'],
          3,
          'z has the earliest deadline. q and a have equal keys, so they keep their arrival order.',
        ),
        predictOutput(
          'The label is now part of the key. What does this program print?',
          'jobs = [(2, 5, "elm"), (1, 5, "ash"), (2, 5, "bay"), (2, 7, "fir")]\nfor job in sorted(jobs, key=lambda job: (job[0], -job[1], job[2])):\n    print(job[2])',
          [
            'ash\nfir\nelm\nbay',
            'ash\nbay\nelm\nfir',
            'ash\nfir\nbay\nelm',
            'fir\nash\nbay\nelm',
          ],
          2,
          'With the label in the key, the tie between elm and bay is broken alphabetically.',
        ),
        choose(
          'Two records have identical keys. Where does the one that arrived first end up after sorted(..., key=...)?',
          [
            'After the other one',
            'Wherever its label sorts',
            'Before the other one',
            'It is removed as a duplicate',
          ],
          2,
          'Stability keeps tied records in their input order.',
        ),
        choose(
          'Twelve records contain only 5 distinct keys. How many records does sorted(records, key=...) return?',
          ['5', '7', '12', '1'],
          2,
          'Sorting rearranges records; it never merges records with equal keys.',
        ),
      ],
    },
    {
      title: 'What sorting costs and what it enables',
      explanation: [
        'Sorting n records with constant-cost keys takes O(n log n) time, and sorted() uses O(n) extra space for the new list. Sorting often pays for itself by placing related candidates next to each other: in sorted numbers, the closest pair is always a neighboring pair, so checking the n − 1 neighbor gaps replaces checking all n(n − 1)/2 pairs. The total is still O(n log n), because the sort comes first.',
      ],
      example: {
        code: 'ordered = sorted([31, 4, 18, 9, 27])\nprint(ordered)\nprint(ordered[1] - ordered[0])\nprint(ordered[2] - ordered[1])\nprint(ordered[3] - ordered[2])\nprint(ordered[4] - ordered[3])',
        output: '[4, 9, 18, 27, 31]\n5\n9\n9\n4',
        explanation:
          'After sorting, only four neighboring gaps need checking. The smallest, 4 between 27 and 31, is the closest pair of the whole list.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'ordered = sorted([12, 3, 8])\nprint(ordered[1] - ordered[0])\nprint(ordered[2] - ordered[1])',
          ['9\n5', '-9\n5', '4\n5', '5\n4'],
          3,
          'The sorted list is [3, 8, 12], so the neighbor gaps are 5 and 4.',
        ),
        choose(
          'After sorting 6 numbers, how many neighboring gaps must be checked to find the closest pair?',
          ['5', '15', '6', '30'],
          0,
          'Six sorted values have five neighboring pairs, instead of 15 pairs overall.',
        ),
        choose(
          'Sorting n values and then scanning the neighbor gaps costs how much time overall?',
          ['O(n log n)', 'O(n)', 'O(n²)', 'O(log n)'],
          0,
          'The O(n) scan is added to the O(n log n) sort, and the sort dominates.',
        ),
        choose(
          'Why is the closest pair of sorted values always a neighboring pair?',
          [
            'Sorting removes all duplicate values',
            'Neighbors in the original input are always closest',
            'Sorting makes every gap the same size',
            'Any value lying between two others is at least as close to each',
          ],
          3,
          'If a < b < c, then b - a and c - b are both at most c - a, so a non-neighbor pair never wins.',
        ),
      ],
    },
  ],
  'cp-hash-membership': [
    {
      title: 'A set keeps one copy of each value',
      explanation: [
        'A set stores distinct values. set() creates an empty set, seen.add(value) inserts a value, and adding a value that is already present changes nothing. len(seen) counts distinct values, and value in seen asks whether a value has appeared.',
      ],
      example: {
        code: 'seen = set()\nfor label in ["oak", "elm", "oak", "ash", "elm"]:\n    seen.add(label)\nprint(len(seen))\nprint("ash" in seen)\nprint("fir" in seen)',
        output: '3\nTrue\nFalse',
        explanation:
          'Five additions store three distinct labels. ash was added; fir never was.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'seen = set()\nfor value in [4, 4, 4, 1]:\n    seen.add(value)\nprint(len(seen))',
          ['4', '2', '3', '1'],
          1,
          'The repeated 4 is stored once, so the set holds 4 and 1.',
        ),
        predictOutput(
          'What does this program print?',
          'print(len(set([7, -7, 7, 0])))',
          ['4', '3', '2', '1'],
          1,
          '7 and -7 are different values; only the second 7 is a duplicate.',
        ),
        predictOutput(
          'What does this program print?',
          'seen = set()\nseen.add("a")\nseen.add("a")\nprint("a" in seen)\nprint(len(seen))',
          ['True\n2', 'False\n1', 'False\n0', 'True\n1'],
          3,
          'The second add finds "a" already present, so the set still has one member.',
        ),
        choose(
          'A task asks only whether each visitor ID has appeared before. Why is a set enough?',
          [
            'Sets remember the order of every visit',
            'Sets count repeated IDs automatically',
            'Sets keep every duplicate occurrence',
            'Only presence matters, not how many times',
          ],
          3,
          'A set answers "seen or not" and deliberately forgets multiplicity.',
        ),
      ],
    },
    {
      title: 'Detect repeats with membership; members must be hashable',
      explanation: [
        'Testing value in seen before adding the value tells whether it appeared earlier in the scan, in expected O(1) time per test. Building the set takes expected O(n) time and O(u) space for u distinct values. Set members must be hashable: integers, strings and tuples work, but a list cannot be a member because it can change.',
      ],
      example: {
        code: 'seen = set()\nfor value in [5, 3, 8, 3, 5]:\n    if value in seen:\n        print(value)\n    seen.add(value)',
        output: '3\n5',
        explanation:
          'Each value is tested before it is added. The second 3 and the second 5 find themselves already present.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'seen = set()\nfor value in [2, 9, 2, 2, 9]:\n    if value in seen:\n        print(value)\n    seen.add(value)',
          ['2\n9', '9\n2', '2\n9\n2\n2\n9', '2\n2\n9'],
          3,
          'Every occurrence after the first is reported: the second and third 2, then the second 9.',
        ),
        predictOutput(
          'This loop adds before it tests. What does it print?',
          'seen = set()\nrepeats = 0\nfor value in [1, 6, 4]:\n    seen.add(value)\n    if value in seen:\n        repeats += 1\nprint(repeats)',
          ['0', '1', '2', '3'],
          3,
          'Adding first makes every value look like a repeat, even though all three are distinct.',
        ),
        choose(
          'Which value cannot be added to a set?',
          ['(1, 2)', '"12"', '12', '[1, 2]'],
          3,
          'Lists are mutable and unhashable; tuples, strings and integers are hashable.',
        ),
        choose(
          'A set is built from n values that contain u distinct ones. How much space does it use?',
          ['O(n²)', 'O(u)', 'O(1)', 'O(n log n)'],
          1,
          'The set stores each distinct value once, however often it repeats.',
        ),
      ],
    },
  ],
  'cp-hash-frequency': [
    {
      title: 'Count with counts.get(value, 0) + 1',
      explanation: [
        'A frequency map stores counts[value], the number of times value has appeared. counts.get(value, 0) returns 0 for a value not seen yet, so counts[value] = counts.get(value, 0) + 1 handles first and later occurrences with the same line. Printed keys appear in the order of their first occurrence.',
      ],
      example: {
        code: 'counts = {}\nfor word in ["go", "stop", "go", "go", "wait"]:\n    counts[word] = counts.get(word, 0) + 1\nprint(counts)',
        output: "{'go': 3, 'stop': 1, 'wait': 1}",
        explanation:
          'go is counted three times. stop and wait start from the default 0 and reach 1.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'counts = {}\nfor value in [4, 1, 4, 1, 4]:\n    counts[value] = counts.get(value, 0) + 1\nprint(counts)',
          ['{1: 2, 4: 3}', '{4: 3, 1: 2}', '{4: 1, 1: 1}', '{4: 2, 1: 3}'],
          1,
          '4 appears three times and 1 twice; 4 is printed first because it occurred first.',
        ),
        predictOutput(
          'What does this program print?',
          'counts = {"x": 2}\ncounts["y"] = counts.get("y", 0) + 1\ncounts["x"] = counts.get("x", 0) + 1\nprint(counts)',
          [
            "{'x': 3, 'y': 1}",
            "{'x': 1, 'y': 1}",
            "{'y': 1, 'x': 3}",
            "{'x': 2, 'y': 1}",
          ],
          0,
          'y is new and gets 0 + 1. x already has 2, so it becomes 3 and keeps its position.',
        ),
        predictOutput(
          'What does this program print?',
          'counts = {}\nfor color in ["red", "blue", "red", "red"]:\n    counts[color] = counts.get(color, 0) + 1\nprint(counts["red"])',
          ['1', '4', '2', '3'],
          3,
          'Each of the three "red" observations adds one to the same key.',
        ),
        choose(
          'Why write counts.get(value, 0) + 1 instead of counts[value] + 1?',
          [
            'counts[value] raises KeyError for a new value',
            'get() keeps the keys sorted while counting',
            'counts[value] + 1 would add two instead of one',
            'get() prevents duplicate keys from being created',
          ],
          0,
          'Brackets require the key to exist; get() supplies the missing count 0.',
        ),
      ],
    },
    {
      title: 'The map matches the processed prefix',
      explanation: [
        'The invariant of a frequency scan: after processing the first i items, every count equals that value’s occurrences among those i items, and the counts add up to i. A set cannot provide this, because it records only presence: one occurrence and ten look the same.',
      ],
      example: {
        code: 'counts = {}\nfor value in [7, 2, 7]:\n    counts[value] = counts.get(value, 0) + 1\n    print(counts)',
        output: '{7: 1}\n{7: 1, 2: 1}\n{7: 2, 2: 1}',
        explanation:
          'Each printed map describes exactly the items processed so far.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'counts = {}\nfor value in [1, 1, 2]:\n    counts[value] = counts.get(value, 0) + 1\n    print(counts)',
          [
            '{1: 2, 2: 1}\n{1: 2, 2: 1}\n{1: 2, 2: 1}',
            '{1: 1}\n{1: 1}\n{1: 1, 2: 1}',
            '{1: 1}\n{1: 2}\n{1: 2, 2: 1}',
            '{1: 1}\n{1: 2}\n{2: 1}',
          ],
          2,
          'After each item, the map counts the prefix processed so far; earlier keys are kept.',
        ),
        predictOutput(
          'What does this program print?',
          'counts = {}\nseen = set()\nfor value in [6, 6, 6]:\n    counts[value] = counts.get(value, 0) + 1\n    seen.add(value)\nprint(counts[6])\nprint(len(seen))',
          ['3\n3', '3\n1', '1\n1', '1\n3'],
          1,
          'The map counts all three occurrences, while the set stores 6 once.',
        ),
        choose(
          'A frequency scan has processed the first 10 items. Which statement is true?',
          [
            'Its counts add up to 10',
            'It has exactly 10 keys',
            'Every count is at most 1',
            'It already counts the unprocessed items',
          ],
          0,
          'Each processed item adds exactly one to one count; repeated items share a key.',
        ),
        choose(
          'A task asks how often the most common value appears. Why is a set not enough?',
          [
            'Sets cannot hold integer values',
            'A set loses values that appear only once',
            'Sets are slower than lists for lookups',
            'A set records presence, not how many times',
          ],
          3,
          'Multiplicities need a count per value, which a dictionary stores.',
        ),
      ],
    },
  ],
  'cp-hash-filter': [
    {
      title: 'Scan items() and keep entries that pass a test',
      explanation: [
        'Once counts is complete, for value, count in counts.items() visits one (key, count) entry per distinct key. To filter, write an entry into a new dictionary only when its count passes the test. The result can only have as many keys as counts, or fewer.',
      ],
      example: {
        code: 'counts = {"oak": 3, "elm": 1, "ash": 2, "fir": 1}\nkept = {}\nfor tree, count in counts.items():\n    if count >= 2:\n        kept[tree] = count\nprint(kept)',
        output: "{'oak': 3, 'ash': 2}",
        explanation:
          'Only oak and ash have counts of at least two; they enter kept in the order they are visited.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'counts = {5: 1, 8: 4, 2: 2}\nkept = {}\nfor value, count in counts.items():\n    if count >= 2:\n        kept[value] = count\nprint(kept)',
          ['{8: 4}', '{8: 4, 2: 2}', '{5: 1}', '{2: 2, 8: 4}'],
          1,
          'The entries for 8 and 2 pass the threshold and keep their order from counts.',
        ),
        predictOutput(
          'This filter keeps values that appear exactly once. What does it print?',
          'counts = {"a": 2, "b": 1, "c": 1}\nonce = {}\nfor value, count in counts.items():\n    if count == 1:\n        once[value] = count\nprint(once)',
          [
            "{'b': 1, 'c': 1}",
            "{'a': 2}",
            "{'a': 2, 'b': 1, 'c': 1}",
            "{'b': 1}",
          ],
          0,
          'b and c each have count 1; a appears twice and is left out.',
        ),
        predictOutput(
          'What does this program print?',
          'counts = {"x": 3, "y": 3, "z": 1}\nqualifying = 0\nfor key, count in counts.items():\n    if count >= 3:\n        qualifying += 1\nprint(qualifying)',
          ['6', '3', '1', '2'],
          3,
          'Two keys, x and y, meet the threshold. Adding their counts would answer a different question.',
        ),
        choose(
          'What does each step of for key, count in counts.items() receive?',
          [
            'One key together with its count',
            'Only the next key',
            'Only the next count',
            'The position of an input item',
          ],
          0,
          'items() yields (key, value) pairs, which the loop unpacks into two names.',
        ),
      ],
    },
    {
      title: 'Filter into a new dictionary, after counting is done',
      explanation: [
        'Deleting keys from a dictionary while looping over it raises RuntimeError, because the dictionary changes size during iteration. Writing the kept entries into a new dictionary avoids that and leaves counts intact for other questions. Keep the two steps separate: finish counting first, then ask questions about the completed counts.',
      ],
      example: {
        code: 'counts = {"red": 1, "blue": 3}\nfrequent = {}\nfor color, count in counts.items():\n    if count > 1:\n        frequent[color] = count\nprint(frequent)\nprint(counts)',
        output: "{'blue': 3}\n{'red': 1, 'blue': 3}",
        explanation:
          'The filtered result holds only blue, and counts still holds both entries.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'def at_least(counts, threshold):\n    kept = {}\n    for key, count in counts.items():\n        if count >= threshold:\n            kept[key] = count\n    return kept\n\ncounts = {"a": 4, "b": 2, "c": 5}\nprint(at_least(counts, 4))\nprint(len(counts))',
          [
            "{'a': 4, 'c': 5}\n2",
            "{'c': 5}\n3",
            "{'a': 4, 'c': 5}\n3",
            "{'a': 4, 'b': 2, 'c': 5}\n3",
          ],
          2,
          'a and c pass the threshold 4 (inclusive), and counts keeps all three of its entries.',
        ),
        predictOutput(
          'This program filters while it is still counting. What does it print?',
          'counts = {}\nonce = {}\nfor value in [9, 4, 9]:\n    counts[value] = counts.get(value, 0) + 1\n    if counts[value] == 1:\n        once[value] = 1\nprint(once)',
          ['{4: 1}', '{9: 2, 4: 1}', '{9: 1, 4: 1}', '{}'],
          2,
          '9 is judged before its second copy arrives, so it is wrongly kept. Filtering the completed counts would keep only 4.',
        ),
        choose(
          'What happens if a loop over counts.items() deletes entries from counts as it goes?',
          [
            'The deleted keys are skipped and it works',
            'Python silently loops over a copy instead',
            'Python raises RuntimeError because the size changed',
            'The loop restarts from the first key',
          ],
          2,
          'A dictionary must not change size while it is being iterated.',
        ),
        choose(
          'Why build a new dictionary for the filtered entries?',
          [
            'It keeps the original counts intact',
            'A dictionary cannot lose keys once added',
            'A new dictionary is sorted by count',
            'It sets every count to the threshold',
          ],
          0,
          'The source map stays complete for later questions, and nothing changes during the loop.',
        ),
      ],
    },
  ],
  'cp-hashing': [
    {
      title: 'Replace repeated list searches with hash lookups',
      explanation: [
        'value in some_list checks items one by one: O(n) per lookup, so n lookups cost O(n²). A set or dictionary answers membership in expected O(1) time, so building it once and querying n times costs expected O(n) overall. Keys must be hashable: strings, integers and tuples, not lists.',
      ],
      example: {
        code: 'stock = ["pen", "ink", "pad", "ink"]\navailable = set(stock)\nfound = 0\nfor request in ["ink", "cap", "pen", "ink"]:\n    if request in available:\n        found += 1\nprint(found)\nprint(len(available))',
        output: '3\n3',
        explanation:
          'Three requests are in stock (ink twice and pen); cap is not. The set holds three distinct items.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'banned = set([4, 9])\nblocked = 0\nfor value in [4, 1, 9, 9, 2]:\n    if value in banned:\n        blocked += 1\nprint(blocked)',
          ['3', '2', '5', '1'],
          0,
          'Every occurrence of a banned value counts: 4 once and 9 twice.',
        ),
        choose(
          'A program checks 10⁵ queries with value in some_list, where the list holds 10⁵ items. Roughly how many comparisons can that take?',
          ['About 10¹⁰', 'About 10⁵', 'About 2 × 10⁵', 'About 17'],
          0,
          'Each list search can scan all 10⁵ items, and there are 10⁵ searches.',
        ),
        choose(
          'Which of these can be a dictionary key?',
          ['["red", 3]', '{"red": 3}', '[("red", 3)]', '("red", 3)'],
          3,
          'A tuple of hashable values is hashable; lists and dictionaries are mutable and cannot be keys.',
        ),
        choose(
          'Why is a hash lookup described as expected O(1) rather than always O(1)?',
          [
            'It is always O(log n) in Python',
            'Rare collisions can make a lookup slower',
            'It is O(1) only after sorting the keys',
            'It is O(1) only for integer keys',
          ],
          1,
          'Typical inputs spread keys well, but hashing has worse cases.',
        ),
      ],
    },
    {
      title: 'Count once, then answer questions from the counts',
      explanation: [
        'Build the frequency map in one pass with counts[key] = counts.get(key, 0) + 1. Then answer questions about the completed counts—which keys repeat, which appear exactly once, how often a given key occurs—with lookups and a pass over counts.items(). counts.get(key, 0) also answers for keys that never appeared.',
      ],
      example: {
        code: 'labels = ["n", "w", "n", "s", "n", "w"]\ncounts = {}\nfor label in labels:\n    counts[label] = counts.get(label, 0) + 1\nrepeated = {}\nfor label, count in counts.items():\n    if count >= 2:\n        repeated[label] = count\nprint(repeated)\nprint(counts.get("e", 0))',
        output: "{'n': 3, 'w': 2}\n0",
        explanation:
          'n and w repeat; s does not. The missing label e reports the default 0.',
      },
      questions: [
        predictOutput(
          'This program keeps the values that occur exactly once, in input order. What does it print?',
          'values = [4, 7, 4, 2, 7, 9]\ncounts = {}\nfor value in values:\n    counts[value] = counts.get(value, 0) + 1\nunique = []\nfor value in values:\n    if counts[value] == 1:\n        unique.append(value)\nprint(unique)',
          ['[4, 7, 2, 9]', '[4, 7]', '[2]', '[2, 9]'],
          3,
          'The second pass uses the completed counts, so 4 and 7 are rejected even at their first occurrence.',
        ),
        predictOutput(
          'What does this program print?',
          'counts = {}\nfor word in ["up", "up", "down"]:\n    counts[word] = counts.get(word, 0) + 1\nfor query in ["up", "left", "down"]:\n    print(counts.get(query, 0))',
          ['2\n1', '2\n0\n1', '1\n0\n1', '2\nNone\n1'],
          1,
          'Each query is one lookup; the missing word left gets the default 0.',
        ),
        predictOutput(
          'This program counts copies beyond the first. What does it print?',
          'counts = {}\nfor value in [1, 2, 2, 3, 3, 3]:\n    counts[value] = counts.get(value, 0) + 1\nextra = 0\nfor value, count in counts.items():\n    extra += count - 1\nprint(extra)',
          ['6', '2', '3', '5'],
          2,
          'The extra copies are 0 for 1, 1 for 2 and 2 for 3.',
        ),
        choose(
          'Which question needs a dictionary of counts rather than a set?',
          [
            'Has "n" appeared at all?',
            'How many distinct labels are there?',
            'Is "e" missing from the input?',
            'How many times does "n" appear?',
          ],
          3,
          'Only the multiplicity question needs counts; the others are about presence.',
        ),
      ],
    },
    {
      title: 'Choose the structure from the question, and know its costs',
      explanation: [
        'Presence needs a set; multiplicities or data attached to each key need a dictionary. For n items with u distinct keys, building either takes expected O(n) time and O(u) space. The space follows the number of distinct keys, not the number of items.',
      ],
      example: {
        code: 'words = ["to", "be", "or", "not", "to", "be"]\ndistinct = set(words)\ncounts = {}\nfor word in words:\n    counts[word] = counts.get(word, 0) + 1\nprint(len(words))\nprint(len(distinct))\nprint(len(counts))\nprint(counts["to"])',
        output: '6\n4\n4\n2',
        explanation:
          'Both hash structures hold u = 4 keys for n = 6 items, but only the dictionary can say that "to" appears twice.',
      },
      questions: [
        choose(
          'A million readings contain only 50 distinct values. How many entries does their frequency map hold?',
          ['About a million', 'About 10¹²', 'About 50', 'About 20'],
          2,
          'One entry per distinct key, however many times each repeats.',
        ),
        choose(
          'A task asks whether any ID appears twice in a list of n IDs. Which approach runs in expected O(n) time?',
          [
            'Scan once, testing and adding IDs to a set',
            'For each ID, search the rest of the list',
            'Compare every pair of IDs for equality',
            'Sort a copy, then check every pair again',
          ],
          0,
          'Each set test and insertion is expected O(1), so one scan is expected O(n).',
        ),
        predictOutput(
          'What does this program print?',
          'items = ["a", "b", "a"]\nprint(len(set(items)))\ncounts = {}\nfor item in items:\n    counts[item] = counts.get(item, 0) + 1\nprint(counts)',
          [
            "3\n{'a': 2, 'b': 1}",
            "2\n{'a': 1, 'b': 1}",
            "2\n{'b': 1, 'a': 2}",
            "2\n{'a': 2, 'b': 1}",
          ],
          3,
          'The set holds the two distinct items; the dictionary also records that a appeared twice.',
        ),
        choose(
          'Each label arrives with a price, and the task asks for the total price per label. Which structure fits?',
          [
            'A set of the labels seen so far',
            'A sorted list of all the prices',
            'A set of (label, price) pairs',
            'A dictionary from label to running total',
          ],
          3,
          'Data attached to each key needs a dictionary; a set only records presence.',
        ),
      ],
    },
  ],
  'cp-link-next': [
    {
      title: 'A node record holds a value and a next ID',
      explanation: [
        'Here a linked list is stored as a dictionary from node IDs to records (value, next_id). nodes[node_id][0] is the stored value and nodes[node_id][1] is the ID of the next node, or None at the end. Reading next_id performs one link step; it does not visit anything beyond it.',
      ],
      example: {
        code: 'nodes = {"a": (7, "c"), "b": (2, None), "c": (5, "b")}\nprint(nodes["a"][0])\nprint(nodes["a"][1])\nprint(nodes["b"][1])',
        output: '7\nc\nNone',
        explanation:
          'Node a stores 7 and points to c. Node b points to None, so it ends the chain.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'nodes = {1: (40, 3), 2: (10, None), 3: (25, 2)}\nprint(nodes[3][1])',
          ['2', '25', '4', 'None'],
          0,
          'Field 1 of node 3’s record is its next ID, 2. It is not the next integer and not the stored value.',
        ),
        predictOutput(
          'What does this program print?',
          'nodes = {1: (40, 3), 2: (10, None), 3: (25, 2)}\nprint(nodes[1][0])',
          ['3', '40', '1', '25'],
          1,
          'Field 0 of the record is the stored value; 3 is where the chain goes next.',
        ),
        choose(
          'In the record (8, "q"), which part says where the chain goes next?',
          [
            '"q"',
            '8',
            'The record’s position in the dictionary',
            'The next key in insertion order',
          ],
          0,
          'A record is (value, next_id), so the second field is the link.',
        ),
        choose(
          'nodes[x][1] is None. What does that mean?',
          [
            'Node x stores the value None',
            'Node x does not exist',
            'Node x is the last node of its chain',
            'The chain starts again at the head',
          ],
          2,
          'None in the next field is the end sentinel.',
        ),
      ],
    },
    {
      title: 'Follow links, not dictionary order',
      explanation: [
        'The order of a linked list comes from its next references, not from the order the dictionary stores keys and not from neighboring integer IDs. To reach the node after next, read a next ID and use it as the key of another lookup: nodes[nodes[x][1]].',
      ],
      example: {
        code: 'nodes = {"x": (1, "z"), "y": (3, None), "z": (2, "y")}\nafter_x = nodes["x"][1]\nprint(after_x)\nprint(nodes[after_x][0])\nprint(nodes[nodes[after_x][1]][0])',
        output: 'z\n2\n3',
        explanation:
          'x links to z (value 2), and z links to y (value 3), even though y was stored before z.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'nodes = {10: (6, 30), 20: (9, None), 30: (4, 20)}\nsecond = nodes[10][1]\nprint(nodes[second][0])',
          ['9', '30', '4', '6'],
          2,
          'Node 10 links to 30, whose value is 4. Node 20 comes next in the dictionary but not in the chain.',
        ),
        predictOutput(
          'What does this program print?',
          'nodes = {10: (6, 30), 20: (9, None), 30: (4, 20)}\nprint(nodes[nodes[10][1]][1])',
          ['30', 'None', '20', '9'],
          2,
          'nodes[10][1] is 30, and node 30’s next ID is 20.',
        ),
        choose(
          'A dictionary was filled in the order "tail", "mid", "head". What decides the list order starting from head?',
          [
            'The insertion order: tail, mid, head',
            'The alphabetical order of the IDs',
            'The order of the stored values',
            'The next references, starting at head',
          ],
          3,
          'Each record names its successor; storage order is irrelevant.',
        ),
        predictOutput(
          'What does this program print?',
          'nodes = {0: ("go", 2), 1: ("stop", None), 2: ("wait", 1)}\nprint(nodes[nodes[0][1]][0])',
          ['stop', 'go', 'wait', '2'],
          2,
          'Node 0 links to node 2, whose value is "wait".',
        ),
      ],
    },
  ],
  'cp-link-sentinel': [
    {
      title: 'Test the end with is None',
      explanation: [
        'A chain ends where the next reference is None, so the end test is node_id is None. It is True only for None itself. Valid IDs such as 0, "" (the empty string) or False are not None, even though Python treats them as false in conditions.',
      ],
      example: {
        code: 'for node_id in [0, None, "", "a7"]:\n    print(node_id is None)',
        output: 'False\nTrue\nFalse\nFalse',
        explanation:
          'Only the second ID is the sentinel. 0 and "" are ordinary values that merely count as false.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'node_id = 0\nprint(node_id is None)',
          ['False', 'True', '0', 'None'],
          0,
          '0 is an integer, not the None object.',
        ),
        predictOutput(
          'What does this program print?',
          'for node_id in ["", None, 5]:\n    if node_id is None:\n        print("end")\n    else:\n        print("node")',
          [
            'end\nend\nnode',
            'node\nnode\nnode',
            'end\nnode\nend',
            'node\nend\nnode',
          ],
          3,
          'Only None is the end; the empty string and 5 are node IDs.',
        ),
        choose(
          'Which test is True exactly when node_id is the end sentinel None?',
          ['not node_id', 'node_id == 0', 'node_id == ""', 'node_id is None'],
          3,
          'Identity with None matches only None; the others also match valid IDs or miss None.',
        ),
        choose(
          'Node IDs are the integers 0 to 9, and None ends a chain. Is ID 0 an end marker?',
          [
            'No, 0 is a valid node ID',
            'Yes, because 0 counts as false',
            'Only when it is the head',
            'Only when its value is 0',
          ],
          0,
          'The sentinel is None; 0 is just the first ID.',
        ),
      ],
    },
    {
      title: 'Truthiness tests stop at valid IDs',
      explanation: [
        'Tests such as if not node_id or while node_id use truthiness: they treat 0, "" and False as if they were the end. A chain that legitimately uses ID 0 would be cut short before visiting that node. Compare against the specified sentinel exactly instead of relying on falsy values.',
      ],
      example: {
        code: 'for node_id in [3, 0, None]:\n    if not node_id:\n        print("truthiness says end")\n    if node_id is None:\n        print("sentinel says end")',
        output: 'truthiness says end\ntruthiness says end\nsentinel says end',
        explanation:
          'For 3 neither test fires. For 0 only the truthiness test fires—wrongly. For None both agree.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'stops = 0\nfor node_id in [0, 4, "", None, "b"]:\n    if not node_id:\n        stops = stops + 1\nprint(stops)',
          ['1', '2', '5', '3'],
          3,
          'Truthiness treats 0, "" and None as false, so three IDs look like the end; only one is.',
        ),
        predictOutput(
          'What does this program print?',
          'stops = 0\nfor node_id in [0, 4, "", None, "b"]:\n    if node_id is None:\n        stops = stops + 1\nprint(stops)',
          ['1', '3', '0', '2'],
          0,
          'Only the actual sentinel None matches.',
        ),
        choose(
          'A traversal detects the end with if not current, and the head ID is 0. What happens?',
          [
            'It visits every node normally',
            'It raises an error at node 0',
            'It stops before visiting the head',
            'It skips only the last node',
          ],
          2,
          '0 is falsy, so the head is mistaken for the end and nothing is visited.',
        ),
        choose(
          'Which valid IDs does the test not node_id wrongly treat as the end?',
          [
            'Only None',
            'Every string ID',
            '0 and the empty string',
            'Negative integers',
          ],
          2,
          '0 and "" are falsy; negative numbers and nonempty strings are truthy.',
        ),
      ],
    },
  ],
  'cp-link-count': [
    {
      title: 'Advance a cursor until None',
      explanation: [
        'Set current to the head and count to 0. While current is not None, count the current node and replace current with its next ID, nodes[current][1]. Each pass visits exactly one node and moves exactly one link forward.',
      ],
      example: {
        code: 'nodes = {"p": (4, "r"), "q": (8, None), "r": (6, "q")}\ncurrent = "p"\ncount = 0\nwhile current is not None:\n    count += 1\n    print(current)\n    current = nodes[current][1]\nprint(count)',
        output: 'p\nr\nq\n3',
        explanation:
          'The cursor visits p, r and q by following links, then reaches None after three passes.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'nodes = {1: (5, 4), 2: (0, None), 3: (7, 2), 4: (9, 2)}\ncurrent = 1\ncount = 0\nwhile current is not None:\n    count += 1\n    current = nodes[current][1]\nprint(count)',
          ['4', '2', '3', '5'],
          2,
          'From node 1 the links visit 1, 4 and 2. Node 3 is stored but never reached.',
        ),
        predictOutput(
          'What does this program print?',
          'nodes = {"s": (1, "t"), "t": (2, "u"), "u": (3, None)}\ncurrent = "t"\nwhile current is not None:\n    print(current)\n    current = nodes[current][1]',
          ['s\nt\nu', 't\nu\nNone', 't\nu', 'u'],
          2,
          'The walk starts at t, so s is never visited, and None is a stop signal, not a node.',
        ),
        predictOutput(
          'What does this program print?',
          'nodes = {"a": (1, None)}\ncurrent = None\ncount = 0\nwhile current is not None:\n    count += 1\n    current = nodes[current][1]\nprint(count)',
          ['1', 'None', '2', '0'],
          3,
          'A None head means the chain is empty: the loop test fails immediately.',
        ),
        choose(
          'After k passes of the loop, what does current hold?',
          [
            'The ID of the k-th node that was visited',
            'The ID of the next unvisited node, or None',
            'The number k',
            'The head ID, unchanged',
          ],
          1,
          'Each pass counts one node and then moves current past it.',
        ),
      ],
    },
    {
      title: 'Count only what is reachable',
      explanation: [
        'The count is the number of nodes reachable from the head, which can be smaller than len(nodes): records that no link reaches are never visited. A head of None gives 0, and a head ID of 0 still counts because the test is is not None. The loop ends only if the reachable chain is finite and acyclic; with a cycle it never reaches None.',
      ],
      example: {
        code: 'nodes = {0: (8, 5), 5: (3, None), 9: (1, 0)}\nfor head in [0, 9, None]:\n    current = head\n    count = 0\n    while current is not None:\n        count += 1\n        current = nodes[current][1]\n    print(count)',
        output: '2\n3\n0',
        explanation:
          'From 0 the chain is 0, 5. From 9 it is 9, 0, 5. From None it is empty.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'nodes = {"a": (1, "b"), "b": (2, None), "c": (3, "a"), "d": (4, None)}\ncurrent = "a"\ncount = 0\nwhile current is not None:\n    count += 1\n    current = nodes[current][1]\nprint(count)\nprint(len(nodes))',
          ['2\n4', '4\n4', '2\n2', '3\n4'],
          0,
          'Only a and b are reachable from a; the dictionary stores four records.',
        ),
        predictOutput(
          'This loop uses a truthiness test. What does it print?',
          'nodes = {0: (5, 1), 1: (6, None)}\ncurrent = 0\ncount = 0\nwhile current:\n    count += 1\n    current = nodes[current][1]\nprint(count)',
          ['2', '1', 'None', '0'],
          3,
          'The head ID 0 is falsy, so the loop body never runs.',
        ),
        choose(
          'Node a links to b, and b links back to a. What happens when counting from a?',
          [
            'The loop never reaches None and never ends',
            'It counts 2 nodes and then stops',
            'It raises KeyError immediately',
            'It returns 0 because there is no end',
          ],
          0,
          'The cursor alternates between a and b forever; the simple loop needs an acyclic chain.',
        ),
        choose(
          'A dictionary holds 7 node records. From the head, the links pass through 3 of them and reach None. What is the chain length?',
          ['7', '4', '10', '3'],
          3,
          'Only reachable nodes belong to the chain.',
        ),
      ],
    },
  ],
  'cp-linked-lists': [
    {
      title: 'Collect values in link order',
      explanation: [
        'Traversal reads each node’s record, appends its value and moves to its next ID. value, current = nodes[current] unpacks both parts of the record at once. The result lists the values in link order from the head, regardless of dictionary insertion order or the sorted order of the IDs.',
      ],
      example: {
        code: 'nodes = {"end": (9, None), "mid": (6, "end"), "start": (4, "mid")}\ncurrent = "start"\nvalues = []\nwhile current is not None:\n    value, current = nodes[current]\n    values.append(value)\nprint(values)',
        output: '[4, 6, 9]',
        explanation:
          'The walk follows start → mid → end, the reverse of the order the records were stored in.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'nodes = {3: ("c", 1), 1: ("a", None), 2: ("b", 3)}\ncurrent = 2\nvalues = []\nwhile current is not None:\n    value, current = nodes[current]\n    values.append(value)\nprint(values)',
          [
            "['b', 'c', 'a']",
            "['c', 'a', 'b']",
            "['a', 'b', 'c']",
            "['b', 'c']",
          ],
          0,
          'From 2 the links go to 3 and then 1, which ends the chain.',
        ),
        predictOutput(
          'What does this program print?',
          'nodes = {3: ("c", 1), 1: ("a", None), 2: ("b", 3)}\ncurrent = 3\nvalues = []\nwhile current is not None:\n    value, current = nodes[current]\n    values.append(value)\nprint(values)',
          ["['c', 'a', 'b']", "['a']", "['c', 'a']", "['b', 'c', 'a']"],
          2,
          'Starting at 3 skips node 2, which only links into the chain from outside.',
        ),
        predictOutput(
          'What does this program print?',
          'nodes = {"a": (5, "c"), "b": (100, None), "c": (7, None)}\ncurrent = "a"\ntotal = 0\nwhile current is not None:\n    value, current = nodes[current]\n    total += value\nprint(total)',
          ['12', '112', '107', '5'],
          0,
          'The chain is a → c → end, so only 5 and 7 are added; b is unreachable.',
        ),
        choose(
          'What decides the order of the returned values?',
          [
            'The order the keys were inserted',
            'The sorted order of the node IDs',
            'The head and the chain of next IDs',
            'The sorted order of the values',
          ],
          2,
          'Traversal follows links; nothing else about storage matters.',
        ),
      ],
    },
    {
      title: 'The traversal invariant',
      explanation: [
        'Before each pass, values holds the values of the nodes already visited, in link order, and current is the ID of the next unvisited node, or None when the chain is done. One pass extends values by exactly one node and moves current one link forward, so the invariant stays true. The test is current is not None, so a node with ID 0 is still visited.',
      ],
      example: {
        code: 'nodes = {7: ("x", 2), 2: ("y", 0), 0: ("z", None)}\ncurrent = 7\nvalues = []\nwhile current is not None:\n    print(values)\n    value, current = nodes[current]\n    values.append(value)\nprint(values)',
        output: "[]\n['x']\n['x', 'y']\n['x', 'y', 'z']",
        explanation:
          'Each printed list is the visited prefix before a pass. Node 0 is visited because 0 is not None.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'nodes = {"h": (1, "k"), "k": (2, None)}\ncurrent = "h"\nwhile current is not None:\n    value, current = nodes[current]\n    print(current)',
          ['h\nk', 'h\nk\nNone', '1\n2', 'k\nNone'],
          3,
          'After each pass current names the next unvisited node; after the last node it is None.',
        ),
        predictOutput(
          'What does this program print?',
          'nodes = {0: (4, 1), 1: (8, None)}\ncurrent = 0\nvalues = []\nwhile current is not None:\n    value, current = nodes[current]\n    values.append(value)\nprint(values)',
          ['[]', '[8]', '[4, 8]', '[4]'],
          2,
          'The head ID 0 is not None, so both nodes are visited.',
        ),
        choose(
          'Just before the third pass of the loop, what does values contain?',
          [
            'The first three values in link order',
            'Every value of the chain',
            'The first two values in link order',
            'The two most recently inserted values',
          ],
          2,
          'Two passes have completed, and each appended one value.',
        ),
        predictOutput(
          'This version tests while current. What does it print?',
          'nodes = {0: (4, 1), 1: (8, None)}\ncurrent = 0\nvalues = []\nwhile current:\n    value, current = nodes[current]\n    values.append(value)\nprint(values)',
          ['[4, 8]', '[]', '[8]', '[4]'],
          1,
          'The falsy head ID 0 stops the loop before any node is visited.',
        ),
      ],
    },
    {
      title: 'Preconditions and cost of traversal',
      explanation: [
        'Visiting k reachable nodes takes O(k) time with expected O(1) dictionary lookups, plus O(k) space for the returned list. A None head returns []. The simple loop relies on two preconditions: every referenced ID exists (otherwise nodes[current] raises KeyError) and the chain has no cycle (otherwise it never reaches None). Detecting cycles needs a separate strategy.',
      ],
      example: {
        code: 'def chain_values(nodes, head):\n    values = []\n    current = head\n    while current is not None:\n        value, current = nodes[current]\n        values.append(value)\n    return values\n\nnodes = {"a": (1, "b"), "b": (2, None), "c": (3, "a")}\nprint(chain_values(nodes, None))\nprint(chain_values(nodes, "c"))\nprint(chain_values(nodes, "b"))',
        output: '[]\n[3, 1, 2]\n[2]',
        explanation:
          'A None head yields an empty list. From c the walk covers the whole chain; from b only its last node.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'def chain_values(nodes, head):\n    values = []\n    current = head\n    while current is not None:\n        value, current = nodes[current]\n        values.append(value)\n    return values\n\nnodes = {"a": (1, "b"), "b": (2, None), "c": (3, "a")}\nprint(chain_values(nodes, "a"))',
          ['[1, 2, 3]', '[3, 1, 2]', '[1]', '[1, 2]'],
          3,
          'From a the chain is a → b; node c links into a but is not reachable from it.',
        ),
        choose(
          'A record is ("q", "zz"), but no node "zz" exists. What happens when the traversal reaches that record?',
          [
            'The loop treats "zz" as the end of the chain',
            'The traversal jumps to the next stored key',
            'The next lookup, nodes["zz"], raises KeyError',
            'The value "q" is silently dropped',
          ],
          2,
          'The loop looks up every next ID it receives; a missing ID breaks the precondition.',
        ),
        choose(
          'k nodes are reachable from the head. What does collecting their values cost?',
          [
            'O(k) time and O(k) space for the list',
            'O(1) time, since each lookup is O(1)',
            'O(k²) time because of the dictionary',
            'O(k log k) time to keep them in order',
          ],
          0,
          'One expected O(1) lookup and one append per visited node.',
        ),
        choose(
          'Which precondition guarantees that the while loop terminates?',
          [
            'Every stored value is a positive integer',
            'The IDs were inserted in link order',
            'The dictionary has fewer than 10⁶ keys',
            'The reachable chain is acyclic and ends at None',
          ],
          3,
          'Termination needs the walk to reach None, which a cycle prevents.',
        ),
      ],
    },
  ],
  'cp-text-alphabet': [
    {
      title: 'Range comparisons define the ASCII letters',
      explanation: [
        'Characters compare by their code points, and the ASCII letters form two unbroken runs: "A" to "Z" and "a" to "z". The test "A" <= ch <= "Z" or "a" <= ch <= "z" is True for exactly those 52 characters, and False for digits, spaces, punctuation and every letter outside ASCII.',
      ],
      example: {
        code: 'for ch in ["Q", "q", "5", "[", "ñ"]:\n    print("A" <= ch <= "Z" or "a" <= ch <= "z")',
        output: 'True\nTrue\nFalse\nFalse\nFalse',
        explanation:
          'Q and q fall in the two letter runs. "5", the bracket that follows "Z" in ASCII, and the non-ASCII ñ do not.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'accepted = 0\nfor ch in ["H", "i", "!", "2", "u"]:\n    if "A" <= ch <= "Z" or "a" <= ch <= "z":\n        accepted = accepted + 1\nprint(accepted)',
          ['3', '2', '5', '4'],
          0,
          'H, i and u are ASCII letters; the exclamation mark and the digit are not.',
        ),
        predictOutput(
          'What does this program print?',
          'ch = "_"\nprint("A" <= ch <= "Z" or "a" <= ch <= "z")',
          ['True', '_', 'False', 'None'],
          2,
          'The underscore lies between "Z" and "a" in ASCII, outside both letter runs.',
        ),
        choose(
          'Why is "A" <= ch <= "z" a wrong single test for ASCII letters?',
          [
            'It accepts symbols that sit between "Z" and "a"',
            'It rejects every lowercase letter a–z',
            'It rejects the end letters "A" and "z"',
            'Strings cannot be compared using <=',
          ],
          0,
          'The two letter runs are not adjacent; six punctuation characters sit between them.',
        ),
        choose(
          'Which character passes "A" <= ch <= "Z" or "a" <= ch <= "z"?',
          ['"é"', '"7"', '"k"', '" "'],
          2,
          'Only k lies in one of the two ASCII letter runs.',
        ),
      ],
    },
    {
      title: 'The alphabet is part of the contract',
      explanation: [
        'ch.isalpha() answers a broader question: it is True for letters of any script, such as "é", "ß" or "Ж". When a task accepts only ASCII letters, use the explicit range test; when it accepts every letter, isalpha() is right. Decide membership from the problem statement before transforming any character.',
      ],
      example: {
        code: 'for ch in ["é", "Ж", "b"]:\n    print(ch.isalpha())\n    print("A" <= ch <= "Z" or "a" <= ch <= "z")',
        output: 'True\nFalse\nTrue\nFalse\nTrue\nTrue',
        explanation:
          'All three are letters to isalpha(), but only b is an ASCII letter.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'ch = "ß"\nprint(ch.isalpha())\nprint("a" <= ch <= "z")',
          ['False\nFalse', 'True\nTrue', 'True\nFalse', 'False\nTrue'],
          2,
          'ß is a letter, so isalpha() is True, but it is not in the ASCII run a–z.',
        ),
        predictOutput(
          'What does this program print?',
          'by_isalpha = 0\nby_range = 0\nfor ch in ["A", "ñ", "o", "3"]:\n    if ch.isalpha():\n        by_isalpha = by_isalpha + 1\n    if "A" <= ch <= "Z" or "a" <= ch <= "z":\n        by_range = by_range + 1\nprint(by_isalpha)\nprint(by_range)',
          ['2\n2', '3\n3', '3\n2', '4\n2'],
          2,
          'isalpha() accepts A, ñ and o; the ASCII range test rejects ñ. Neither accepts 3.',
        ),
        choose(
          'A task says: count the ASCII letters a–z and A–Z. Why is ch.isalpha() the wrong test?',
          [
            'It rejects the uppercase letters A–Z',
            'It accepts the digits 0–9 as letters',
            'It also accepts letters outside ASCII, like "é"',
            'It changes the character that it tests',
          ],
          2,
          'isalpha() follows Unicode, which is broader than the alphabet the task defines.',
        ),
        choose(
          'A task accepts letters from any language. Which test fits?',
          [
            '"a" <= ch <= "z"',
            '"A" <= ch <= "Z" or "a" <= ch <= "z"',
            'ch != " "',
            'ch.isalpha()',
          ],
          3,
          'Here the broader Unicode test is exactly the contract.',
        ),
      ],
    },
  ],
  'cp-text-normalization': [
    {
      title: 'lower() returns a new string',
      explanation: [
        'Strings are immutable: ch.lower() returns a new lowercased string and leaves ch unchanged. Calling text.lower() without storing the result has no lasting effect. Characters that have no lowercase form, such as digits and punctuation, come back unchanged.',
      ],
      example: {
        code: 'word = "MaP"\nlowered = word.lower()\nprint(lowered)\nprint(word)',
        output: 'map\nMaP',
        explanation:
          'lowered holds the new string "map"; word still holds "MaP".',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'ch = "R"\nch.lower()\nprint(ch)',
          ['r', 'None', "'R'", 'R'],
          3,
          'The lowercased result was discarded, and the string in ch cannot change.',
        ),
        predictOutput(
          'What does this program print?',
          'ch = "R"\nch = ch.lower()\nprint(ch)',
          ['R', 'None', "'r'", 'r'],
          3,
          'Assigning the result back makes ch name the new lowercase string.',
        ),
        predictOutput(
          'What does this program print?',
          'print("b".lower())\nprint("7".lower())\nprint("!".lower())',
          ['b\n7\n!', 'B\n7\n!', 'b\nNone\nNone', 'None\n7\n!'],
          0,
          'Characters without a case come back unchanged; lowercase b stays b.',
        ),
        choose(
          'After text = "ABC" and a call text.lower() whose result is discarded, what is text?',
          ['"abc"', 'None', '""', '"ABC"'],
          3,
          'String methods return new strings; the original is never modified.',
        ),
      ],
    },
    {
      title: 'Lowercase only ASCII uppercase letters',
      explanation: [
        'lower() knows about every script, and some characters change in surprising ways: "İ".lower() becomes two characters, and the Kelvin sign "\\u212a" lowercases to the ASCII letter "k". To merge only the cases the task allows, convert a character only when "A" <= ch <= "Z" and leave everything else unchanged.',
      ],
      example: {
        code: 'for ch in ["Q", "é", "4"]:\n    if "A" <= ch <= "Z":\n        ch = ch.lower()\n    print(ch)\nprint("K".lower() == "k")\nprint(len("İ".lower()))',
        output: 'q\né\n4\nTrue\n2',
        explanation:
          'Only Q is converted. The last two lines show why an unrestricted lower() is risky: a non-ASCII character can turn into an ASCII letter, and one character can become two.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'ch = "K"\nprint(ch.lower() == "k")\nif "A" <= ch <= "Z":\n    ch = ch.lower()\nprint(ch == "k")',
          ['True\nTrue', 'False\nFalse', 'True\nFalse', 'False\nTrue'],
          2,
          'An unrestricted lower() turns the Kelvin sign into an ASCII k, but the restricted rule leaves the non-ASCII character alone.',
        ),
        predictOutput(
          'What does this program print?',
          'print(len("İ".lower()))',
          ['2', '1', '0', '3'],
          0,
          'Lowercasing this dotted capital I produces i followed by a combining dot: two characters.',
        ),
        predictOutput(
          'What does this program print?',
          'def normalize(ch):\n    if "A" <= ch <= "Z":\n        return ch.lower()\n    return ch\n\nprint(normalize("D"))\nprint(normalize("d"))\nprint(normalize("?"))',
          ['d\nd\n?', 'd\nD\n?', 'D\nd\n?', 'd\nd\nNone'],
          0,
          'D is converted; d and ? are returned unchanged rather than dropped.',
        ),
        choose(
          'Why restrict lowercasing to "A" <= ch <= "Z" in an ASCII-only task?',
          [
            'lower() raises an error on non-ASCII text',
            'lower() is slower than a range comparison',
            'Some non-ASCII characters lowercase into ASCII letters',
            'lower() turns digits into letters',
          ],
          2,
          'An unrestricted lower() could make a rejected character look like an accepted letter.',
        ),
      ],
    },
  ],
  'cp-text-filter': [
    {
      title: 'Normalize first, then accept a–z',
      explanation: [
        'Process each character in two steps: first lowercase it if it is ASCII uppercase, then keep it only if it lies in "a" to "z". The order matters: testing a–z before normalizing would drop every uppercase letter.',
      ],
      example: {
        code: 'accepted = []\nfor ch in "Hi, Bo!":\n    if "A" <= ch <= "Z":\n        ch = ch.lower()\n    if "a" <= ch <= "z":\n        accepted.append(ch)\nprint(accepted)',
        output: "['h', 'i', 'b', 'o']",
        explanation:
          'H and B are lowercased and kept; the comma, the space and the exclamation mark fail the a–z test.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'accepted = []\nfor ch in "Ax-7y":\n    if "A" <= ch <= "Z":\n        ch = ch.lower()\n    if "a" <= ch <= "z":\n        accepted.append(ch)\nprint(accepted)',
          [
            "['x', 'y']",
            "['A', 'x', 'y']",
            "['a', 'x', 'y']",
            "['a', 'x', '-', '7', 'y']",
          ],
          2,
          'A is normalized to a before the test; the dash and the digit are rejected.',
        ),
        predictOutput(
          'This loop tests before it normalizes. What does it print?',
          'accepted = []\nfor ch in "Go Up":\n    if "a" <= ch <= "z":\n        accepted.append(ch)\n    if "A" <= ch <= "Z":\n        ch = ch.lower()\nprint(accepted)',
          [
            "['g', 'o', 'u', 'p']",
            "['o', 'p']",
            "['G', 'o', 'U', 'p']",
            "['g', 'u']",
          ],
          1,
          'G and U fail the a–z test before they are lowercased, so they are lost.',
        ),
        predictOutput(
          'What does this program print?',
          'accepted = []\nfor ch in "ÉtÉ":\n    if "A" <= ch <= "Z":\n        ch = ch.lower()\n    if "a" <= ch <= "z":\n        accepted.append(ch)\nprint(accepted)',
          ["['t']", "['é', 't', 'é']", "['e', 't', 'e']", '[]'],
          0,
          'É is not ASCII, so it is neither lowercased by the restricted rule nor accepted.',
        ),
        choose(
          'Why lowercase before testing "a" <= ch <= "z"?',
          [
            'Lowercasing removes punctuation from the text',
            'The range test raises an error on uppercase letters',
            'Otherwise uppercase letters fail the test and are lost',
            'Lowercase letters are processed faster',
          ],
          2,
          'Only normalized letters fall in the accepted range.',
        ),
      ],
    },
    {
      title: 'Keep order and repetitions',
      explanation: [
        'The accepted list is the text rewritten in the task’s alphabet: same order, every repetition kept, only rejected characters removed. After each input character, it holds exactly the accepted, normalized characters of the processed prefix. Counting or grouping them is a separate, later step.',
      ],
      example: {
        code: 'accepted = []\nfor ch in "Noon!":\n    if "A" <= ch <= "Z":\n        ch = ch.lower()\n    if "a" <= ch <= "z":\n        accepted.append(ch)\n    print(len(accepted))\nprint(accepted)',
        output: "1\n2\n3\n4\n4\n['n', 'o', 'o', 'n']",
        explanation:
          'The length grows for N, o, o and n, then stays at 4 for the exclamation mark. Both o’s are kept.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'accepted = []\nfor ch in "AaAa":\n    if "A" <= ch <= "Z":\n        ch = ch.lower()\n    if "a" <= ch <= "z":\n        accepted.append(ch)\nprint(accepted)',
          [
            "['a']",
            "['a', 'a']",
            "['a', 'a', 'a', 'a']",
            "['A', 'a', 'A', 'a']",
          ],
          2,
          'Every A becomes a, and repetitions are kept rather than merged.',
        ),
        predictOutput(
          'What does this program print?',
          'accepted = []\nfor ch in "1 2 3 go":\n    if "A" <= ch <= "Z":\n        ch = ch.lower()\n    if "a" <= ch <= "z":\n        accepted.append(ch)\nprint(len(accepted))',
          ['2', '8', '5', '0'],
          0,
          'Only g and o are letters; digits and spaces are rejected.',
        ),
        predictOutput(
          'What does this program print?',
          'accepted = []\nfor ch in "B?b":\n    if "A" <= ch <= "Z":\n        ch = ch.lower()\n    if "a" <= ch <= "z":\n        accepted.append(ch)\n    print(accepted)',
          [
            "['b']\n['b']\n['b', 'b']",
            "['b']\n['b', '?']\n['b', '?', 'b']",
            "['B']\n['B']\n['B', 'b']",
            "['b']\n[]\n['b']",
          ],
          0,
          'The list is printed after each character: B adds b, ? adds nothing, and b adds a second b.',
        ),
        choose(
          'For the text "Mississippi", how many characters does the accepted list hold?',
          ['11', '4', '1', '10'],
          0,
          'All 11 characters are letters, and repetitions are kept.',
        ),
      ],
    },
  ],
  'cp-strings': [
    {
      title: 'Count normalized letters with a map',
      explanation: [
        'A letter inventory combines the filter pipeline with a frequency map: for each character, lowercase it if it is ASCII uppercase, skip it unless it is in a–z, and otherwise increment counts[ch]. The map always records the accepted, normalized letters of the processed prefix.',
      ],
      example: {
        code: 'counts = {}\nfor ch in "Abba, Bob!":\n    if "A" <= ch <= "Z":\n        ch = ch.lower()\n    if "a" <= ch <= "z":\n        counts[ch] = counts.get(ch, 0) + 1\nprint(counts)',
        output: "{'a': 2, 'b': 4, 'o': 1}",
        explanation:
          'A and a merge into a: 2. The four b’s (three lowercase, one uppercase) merge into b: 4. Punctuation and spaces are skipped.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'counts = {}\nfor ch in "Go, go!":\n    if "A" <= ch <= "Z":\n        ch = ch.lower()\n    if "a" <= ch <= "z":\n        counts[ch] = counts.get(ch, 0) + 1\nprint(counts)',
          [
            "{'G': 1, 'o': 2, 'g': 1}",
            "{'g': 2, 'o': 2}",
            "{'g': 2, 'o': 2, ',': 1, '!': 1}",
            "{'g': 1, 'o': 2}",
          ],
          1,
          'G is normalized to g before counting, and punctuation never reaches the map.',
        ),
        predictOutput(
          'What does this program print?',
          'counts = {}\nfor ch in "Zoo":\n    if "A" <= ch <= "Z":\n        ch = ch.lower()\n    if "a" <= ch <= "z":\n        counts[ch] = counts.get(ch, 0) + 1\nprint(counts["o"])\nprint(counts.get("z", 0))',
          ['2\n0', '2\n1', '1\n1', '2\nNone'],
          1,
          'Z is counted as z, so the lookup finds 1 rather than the default.',
        ),
        predictOutput(
          'What does this program print?',
          'counts = {}\nfor ch in "Aa Bb!":\n    if "A" <= ch <= "Z":\n        ch = ch.lower()\n    if "a" <= ch <= "z":\n        counts[ch] = counts.get(ch, 0) + 1\nprint(len(counts))',
          ['4', '2', '6', '5'],
          1,
          'After normalization only the keys a and b exist.',
        ),
        choose(
          'Why lowercase each letter before counting it?',
          [
            'So punctuation is counted as letters',
            'So the map keeps its keys sorted',
            'So the input text is changed in place',
            'So "A" and "a" increment the same key',
          ],
          3,
          'Normalization makes equivalent characters share one key.',
        ),
      ],
    },
    {
      title: 'The specification decides what counts as equal',
      explanation: [
        'Normalization is part of the problem statement, not a free improvement. A case-insensitive task merges "A" with "a"; a case-sensitive task must keep them apart, and lowercasing would merge values the task treats as different. Two texts have the same inventory exactly when their count maps are equal, which is how an anagram check under these rules works.',
      ],
      example: {
        code: 'def inventory(text):\n    counts = {}\n    for ch in text:\n        if "A" <= ch <= "Z":\n            ch = ch.lower()\n        if "a" <= ch <= "z":\n            counts[ch] = counts.get(ch, 0) + 1\n    return counts\n\nprint(inventory("Listen!") == inventory("Silent"))\nprint(inventory("Ab") == inventory("ab"))',
        output: 'True\nTrue',
        explanation:
          'Both comparisons hold under the ASCII case-insensitive rule: the maps have the same keys with the same counts, and key order does not matter for ==.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'def inventory(text):\n    counts = {}\n    for ch in text:\n        if "A" <= ch <= "Z":\n            ch = ch.lower()\n        if "a" <= ch <= "z":\n            counts[ch] = counts.get(ch, 0) + 1\n    return counts\n\nprint(inventory("Dusty") == inventory("study"))\nprint(inventory("aab") == inventory("abb"))',
          ['True\nFalse', 'True\nTrue', 'False\nFalse', 'False\nTrue'],
          0,
          'Dusty and study use the same letters once each. aab and abb share letters but not counts.',
        ),
        predictOutput(
          'This program counts without normalizing. What does it print?',
          'counts = {}\nfor ch in "AaA":\n    counts[ch] = counts.get(ch, 0) + 1\nprint(counts)',
          ["{'a': 3}", "{'A': 3}", "{'a': 1, 'A': 2}", "{'A': 2, 'a': 1}"],
          3,
          'Without normalization A and a are different keys; A appeared first.',
        ),
        choose(
          'A password checker treats "Q" and "q" as different symbols. Should it lowercase before counting?',
          [
            'Yes, normalization is always harmless',
            'No, that would merge symbols the task keeps apart',
            'Yes, because dictionaries ignore case',
            'Only when the password is long',
          ],
          1,
          'The specification defines equality; this one is case-sensitive.',
        ),
        choose(
          'Which pair has equal inventories under the ASCII case-insensitive rule?',
          [
            '"Pool" and "Polo!o"',
            '"Abc" and "ab"',
            '"Night" and "thing!"',
            '"Café" and "face"',
          ],
          2,
          'Night and thing use n, i, g, h, t once each; é is not an ASCII letter, so Café lacks the e.',
        ),
      ],
    },
    {
      title: 'Cost and space with a fixed alphabet',
      explanation: [
        'One pass over L characters with constant work per character takes O(L) time. Because at most 26 keys can ever be stored, the map uses O(1) extra space for this fixed alphabet; counting arbitrary words instead would need O(u) space for u distinct words. The input string itself never changes, since strings are immutable.',
      ],
      example: {
        code: 'text = "Banana bread, BANANA!"\ncounts = {}\nfor ch in text:\n    if "A" <= ch <= "Z":\n        ch = ch.lower()\n    if "a" <= ch <= "z":\n        counts[ch] = counts.get(ch, 0) + 1\nprint(len(text))\nprint(len(counts))\nprint(text)',
        output: '21\n6\nBanana bread, BANANA!',
        explanation:
          'Twenty-one characters produce only six keys: b, a, n, r, e, d. The original text is printed unchanged.',
      },
      questions: [
        choose(
          'A text has 10⁶ characters. At most how many keys can its ASCII letter inventory hold?',
          ['26', '52', '10⁶', '256'],
          0,
          'After normalization only a–z can be keys.',
        ),
        choose(
          'How does the inventory’s extra space grow with the text length L?',
          [
            'O(L), one key per character',
            'O(L²), for pairs of characters',
            'O(log L), for the counts',
            'O(1), since at most 26 keys exist',
          ],
          3,
          'The number of keys is bounded by the alphabet, not by L.',
        ),
        choose(
          'The task changes to counting whole words, with u distinct words. What space does the map need?',
          ['O(u)', 'O(1)', 'O(26)', 'O(u²)'],
          0,
          'An unbounded vocabulary means one key per distinct word.',
        ),
        predictOutput(
          'What does this program print?',
          'text = "CAT"\ncounts = {}\nfor ch in text:\n    ch = ch.lower()\n    counts[ch] = counts.get(ch, 0) + 1\nprint(text)',
          ['cat', 'CAT', 'Cat', "{'c': 1, 'a': 1, 't': 1}"],
          1,
          'Reassigning the loop variable ch never changes text.',
        ),
      ],
    },
  ],
  'cp-prefix-boundaries': [
    {
      title: 'n values have n + 1 boundaries',
      explanation: [
        'Picture the gaps around a list’s values: one before the first value, one between each pair of neighbors, and one after the last. A list of n values has n + 1 such prefix boundaries, numbered 0 to n. Boundary i separates the first i values from the rest.',
      ],
      example: {
        code: 'values = [10, 20, 30, 40]\nprint(len(values))\nprint(len(values) + 1)\nprint(list(range(len(values) + 1)))',
        output: '4\n5\n[0, 1, 2, 3, 4]',
        explanation:
          'Four values have five boundaries: before 10, between each neighbor pair, and after 40.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'values = [6, 6]\nprint(list(range(len(values) + 1)))',
          ['[0, 1]', '[0, 1, 2]', '[1, 2]', '[0, 1, 2, 3]'],
          1,
          'Two values have three boundaries, numbered 0, 1 and 2.',
        ),
        choose(
          'How many prefix boundaries does a list of 8 values have?',
          ['8', '7', '9', '16'],
          2,
          'One boundary before each value plus one after the last: 8 + 1.',
        ),
        choose(
          'Which values lie before boundary 3 of [5, 1, 8, 2]?',
          ['5, 1 and 8', '5 and 1', '8 alone', '5, 1, 8 and 2'],
          0,
          'Boundary i separates the first i values from the rest.',
        ),
        predictOutput(
          'What does this program print?',
          'values = []\nprint(list(range(len(values) + 1)))',
          ['[]', '[0, 1]', '[0]', 'None'],
          2,
          'Even an empty list has one boundary, boundary 0.',
        ),
      ],
    },
    {
      title: 'Boundary 0 is the empty prefix',
      explanation: [
        'Boundary i stands for the first i values, and its prefix total is their sum. Boundary 0 covers no values, so its total is 0; boundary n covers the whole list. Keeping boundary 0 means a range that starts at the very first value needs no special case.',
      ],
      example: {
        code: 'values = [4, 7, -2]\ntotal = 0\nprint(total)\nfor value in values:\n    total = total + value\n    print(total)',
        output: '0\n4\n11\n9',
        explanation:
          'The first line is the total at boundary 0. Each later line is the total at the next boundary, after one more value.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'total = 0\nprint(total)\nfor value in [5, -5, 2]:\n    total = total + value\n    print(total)',
          ['0\n5\n0\n2', '5\n0\n2', '0\n5\n10\n12', '5\n0\n2\n2'],
          0,
          'Four boundaries give four totals: 0, then 5, 0 and 2 as each value is included.',
        ),
        choose(
          'What is the prefix total at boundary 0?',
          [
            'The first value',
            '0',
            'The total of all values',
            'It is undefined',
          ],
          1,
          'Boundary 0 covers no values, and an empty sum is 0.',
        ),
        choose(
          'values = [3, 9, 4]. What is the prefix total at boundary 2?',
          ['16', '13', '4', '12'],
          3,
          'Boundary 2 covers the first two values, 3 and 9.',
        ),
        choose(
          'Why keep boundary 0 even though no value lies before it?',
          [
            'It stores a second copy of the first value',
            'It marks the position after the last value',
            'Ranges that start at index 0 need no special case',
            'It keeps the prefix totals increasing',
          ],
          2,
          'Every range can then be expressed with two boundaries, including ones that start at the beginning.',
        ),
      ],
    },
  ],
  'cp-prefix-build': [
    {
      title: 'Append the previous total plus the next value',
      explanation: [
        'Start with prefix = [0], the total at boundary 0. For each value, append prefix[-1] + value: the newest total extended by one more value. After processing i values, prefix has i + 1 entries and prefix[-1] is their total.',
      ],
      example: {
        code: 'prefix = [0]\nfor value in [3, 5, 2]:\n    prefix.append(prefix[-1] + value)\n    print(prefix)',
        output: '[0, 3]\n[0, 3, 8]\n[0, 3, 8, 10]',
        explanation:
          'Each new entry adds one value to the last entry: 0 + 3, 3 + 5, 8 + 2.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'prefix = [0]\nfor value in [2, 2, 2]:\n    prefix.append(prefix[-1] + value)\nprint(prefix)',
          ['[2, 4, 6]', '[0, 2, 2, 2]', '[0, 2, 4]', '[0, 2, 4, 6]'],
          3,
          'The table keeps the starting 0 and gains one running total per value.',
        ),
        predictOutput(
          'What does this program print?',
          'prefix = [0]\nfor value in [10, 1]:\n    prefix.append(prefix[-1] + value)\nprint(len(prefix))\nprint(prefix[-1])',
          ['3\n11', '2\n11', '3\n1', '2\n10'],
          0,
          'Two values give three boundaries, and the last entry is the total of both.',
        ),
        choose(
          'prefix is [0, 6, 9] and the next value is 4. What is appended?',
          ['4', '10', '13', '19'],
          2,
          'The newest total is prefix[-1] = 9, and 9 + 4 = 13.',
        ),
        predictOutput(
          'This build uses the wrong entry. What does it print?',
          'prefix = [0]\nfor value in [3, 5, 2]:\n    prefix.append(prefix[0] + value)\nprint(prefix)',
          ['[0, 3, 5, 2]', '[0, 3, 8, 10]', '[3, 5, 2]', '[0, 3, 8]'],
          0,
          'prefix[0] is always 0, so nothing accumulates; the running total must come from prefix[-1].',
        ),
      ],
    },
    {
      title: 'Totals can fall, and an empty list gives [0]',
      explanation: [
        'A prefix table records sums, not sorted values: a negative value makes the next total smaller than the one before it. With no values the loop never runs and the table is just [0]. Building visits each value once, so it takes O(n) time and O(n) extra space.',
      ],
      example: {
        code: 'for values in [[4, -6, 9], []]:\n    prefix = [0]\n    for value in values:\n        prefix.append(prefix[-1] + value)\n    print(prefix)',
        output: '[0, 4, -2, 7]\n[0]',
        explanation:
          'The -6 drops the total from 4 to -2. The empty list keeps only the boundary-0 total.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'prefix = [0]\nfor value in [-3, -3, 5]:\n    prefix.append(prefix[-1] + value)\nprint(prefix)',
          [
            '[0, 3, 6, 11]',
            '[0, -3, -6, 5]',
            '[-3, -6, -1]',
            '[0, -3, -6, -1]',
          ],
          3,
          'Each entry is the previous total plus the next value, signs included.',
        ),
        predictOutput(
          'What does this program print?',
          'prefix = [0]\nfor value in []:\n    prefix.append(prefix[-1] + value)\nprint(len(prefix))',
          ['0', '1', 'None', '2'],
          1,
          'No value is appended, so only boundary 0 remains.',
        ),
        choose(
          'Must the entries of a prefix table increase from left to right?',
          [
            'Yes, running totals only ever grow',
            'No, a negative value makes the total fall',
            'Only when the input list is sorted',
            'Only after the first entry',
          ],
          1,
          'The table stores sums; a negative value lowers the sum.',
        ),
        choose(
          'Building a prefix table for n values takes how much time and extra space?',
          [
            'O(n²) time and O(n) space',
            'O(n) time and O(n) space',
            'O(n) time and O(1) space',
            'O(log n) time and O(n) space',
          ],
          1,
          'One append per value, and the table stores n + 1 numbers.',
        ),
      ],
    },
  ],
  'cp-prefix-query': [
    {
      title: 'Subtract two boundaries',
      explanation: [
        'The sum of the half-open range [left, right) is prefix[right] - prefix[left]. prefix[right] totals everything before position right, and subtracting prefix[left] cancels exactly the values before left, leaving positions left through right - 1.',
      ],
      example: {
        code: 'values = [4, -6, 9, 2]\nprefix = [0, 4, -2, 7, 9]\nprint(prefix[3] - prefix[1])\nprint(prefix[4] - prefix[0])',
        output: '3\n9',
        explanation:
          'The first query covers positions 1 and 2 (-6 + 9 = 3). The second covers the whole list.',
      },
      questions: [
        predictOutput(
          'The values are [5, 2, 5, 1]. What does this program print?',
          'prefix = [0, 5, 7, 12, 13]\nprint(prefix[3] - prefix[1])',
          ['12', '7', '5', '8'],
          1,
          'The range [1, 3) holds positions 1 and 2, whose values 2 and 5 add to 7.',
        ),
        predictOutput(
          'What does this program print?',
          'def range_sum(prefix, left, right):\n    return prefix[right] - prefix[left]\n\nprefix = [0, 2, 9, 6]\nprint(range_sum(prefix, 0, 2))',
          ['7', '6', '9', '2'],
          2,
          'A range starting at 0 subtracts prefix[0] = 0, leaving the total of the first two values.',
        ),
        choose(
          'Which expression gives the sum of values[left] through values[right - 1]?',
          [
            'prefix[right] - prefix[left]',
            'prefix[left] - prefix[right]',
            'prefix[right - 1] - prefix[left]',
            'prefix[right] + prefix[left]',
          ],
          0,
          'The later boundary minus the earlier one leaves exactly the half-open range.',
        ),
        choose(
          'prefix = [0, 3, 8, 10]. Which range has sum 7?',
          ['[0, 2)', '[2, 3)', '[1, 3)', '[0, 3)'],
          2,
          'prefix[3] - prefix[1] = 10 - 3 = 7.',
        ),
      ],
    },
    {
      title: 'Empty ranges, the end boundary and inclusive queries',
      explanation: [
        'Valid queries satisfy 0 <= left <= right <= n. When left == right the range is empty and the difference is 0. right may equal n, the boundary after the last value, even though the last index is n - 1. An inclusive query [a, b] is the half-open range [a, b + 1), so its sum is prefix[b + 1] - prefix[a].',
      ],
      example: {
        code: 'prefix = [0, 4, -2, 7]\nprint(prefix[2] - prefix[2])\nprint(prefix[3] - prefix[2])\na = 0\nb = 1\nprint(prefix[b + 1] - prefix[a])',
        output: '0\n9\n-2',
        explanation:
          'Equal boundaries cancel to 0. right = 3 = n is valid. The inclusive range [0, 1] becomes [0, 2).',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'prefix = [0, 6, 1, 5]\nprint(prefix[1] - prefix[1])',
          ['6', '1', '0', '-6'],
          2,
          'left equals right, so the range is empty and its sum is 0.',
        ),
        predictOutput(
          'The values are [6, -5, 4]. What does this program print?',
          'prefix = [0, 6, 1, 5]\na = 1\nb = 2\nprint(prefix[b + 1] - prefix[a])',
          ['-5', '-1', '5', '4'],
          1,
          'The inclusive range [1, 2] holds -5 and 4; it becomes the half-open [1, 3).',
        ),
        choose(
          'A list has 5 values. Which query is invalid for its prefix table?',
          ['[0, 5)', '[3, 6)', '[2, 2)', '[4, 5)'],
          1,
          'Boundaries run from 0 to 5; boundary 6 does not exist.',
        ),
        choose(
          'To sum the inclusive range from index 2 to index 4, which subtraction is right?',
          [
            'prefix[4] - prefix[2]',
            'prefix[5] - prefix[2]',
            'prefix[4] - prefix[1]',
            'prefix[5] - prefix[3]',
          ],
          1,
          'Inclusive [2, 4] is half-open [2, 5).',
        ),
      ],
    },
  ],
  'cp-prefix-sums': [
    {
      title: 'Build once, answer many queries',
      explanation: [
        'Range sums combine the two steps: build prefix with prefix[0] = 0 and prefix[i + 1] = prefix[i] + values[i], then answer each half-open query [left, right) with prefix[right] - prefix[left]. The table is built once and reused for every query.',
      ],
      example: {
        code: 'values = [6, -2, 5, 1]\nprefix = [0]\nfor value in values:\n    prefix.append(prefix[-1] + value)\nfor left, right in [(1, 3), (0, 4), (2, 2)]:\n    print(prefix[right] - prefix[left])',
        output: '3\n10\n0',
        explanation:
          'The table [0, 6, 4, 9, 10] answers all three queries with one subtraction each; the empty range gives 0.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'values = [3, -2, 7]\nprefix = [0]\nfor value in values:\n    prefix.append(prefix[-1] + value)\nfor left, right in [(0, 2), (1, 3)]:\n    print(prefix[right] - prefix[left])',
          ['8\n5', '1\n7', '-2\n5', '1\n5'],
          3,
          '[0, 2) holds 3 and -2; [1, 3) holds -2 and 7.',
        ),
        predictOutput(
          'What does this program print?',
          'values = [4, 4, 4, 4]\nprefix = [0]\nfor value in values:\n    prefix.append(prefix[-1] + value)\nprint(prefix[4] - prefix[1])',
          ['16', '8', '12', '4'],
          2,
          'The range [1, 4) covers three of the four values.',
        ),
        predictOutput(
          'What does this program print?',
          'prefix = [0]\nfor value in [-1, 5, -3, 2]:\n    prefix.append(prefix[-1] + value)\nprint(prefix)',
          [
            '[-1, 4, 1, 3]',
            '[0, 1, 6, 9, 11]',
            '[0, -1, 4, 1, 3]',
            '[0, -1, 5, -3, 2]',
          ],
          2,
          'Each entry is a running total, starting from the boundary-0 total 0.',
        ),
        choose(
          'Queries are half-open (left, right) pairs. Which query returns the total of an entire list of n values?',
          ['(0, n - 1)', '(1, n)', '(1, n + 1)', '(0, n)'],
          3,
          'Boundary 0 is before the first value and boundary n is after the last.',
        ),
      ],
    },
    {
      title: 'Why the formula works for every range',
      explanation: [
        'The invariant prefix[i] = sum of the first i values makes every query one subtraction: the first right values minus the first left values leaves exactly positions left to right − 1. The identity needs no increasing totals, so negative values are fine, and the leading 0 lets ranges that start at index 0 follow the same rule.',
      ],
      example: {
        code: 'values = [5, -8, 3, 6]\nprefix = [0]\nfor value in values:\n    prefix.append(prefix[-1] + value)\nleft = 1\nright = 4\ndirect = 0\nfor index in range(left, right):\n    direct += values[index]\nprint(prefix[right] - prefix[left])\nprint(direct)',
        output: '1\n1',
        explanation:
          'Adding positions 1, 2 and 3 directly gives the same 1 as the single subtraction.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'values = [7, -7, 2]\nprefix = [0]\nfor value in values:\n    prefix.append(prefix[-1] + value)\nprint(prefix[2] - prefix[0])',
          ['7', '-7', '2', '0'],
          3,
          'The first two values cancel; the leading 0 makes this query an ordinary subtraction.',
        ),
        predictOutput(
          'This table omits the leading 0 and tries to total the whole list. What does it print?',
          'values = [4, 1, 3]\nprefix = []\ntotal = 0\nfor value in values:\n    total += value\n    prefix.append(total)\nprint(prefix[2] - prefix[0])',
          ['8', '7', '3', '4'],
          3,
          'Without boundary 0, prefix[0] already includes the first value, so subtracting it drops the 4.',
        ),
        choose(
          'prefix[5] - prefix[2] is the sum of which positions?',
          ['2, 3, 4 and 5', '3, 4 and 5', '3 and 4', '2, 3 and 4'],
          3,
          'It is the half-open range [2, 5).',
        ),
        choose(
          'Why do negative values not break prefix-sum queries?',
          [
            'Negative values are skipped while building',
            'Queries take absolute values first',
            'The subtraction identity holds for any integers',
            'The table is sorted before querying',
          ],
          2,
          'Cancelling the first left values works the same whatever their signs.',
        ),
      ],
    },
    {
      title: 'When a prefix table pays off',
      explanation: [
        'Building the table costs O(n) time and O(n) space, and each query is then O(1), so q queries cost O(n + q). Summing every query directly costs up to O(n) each, O(n · q) in total. The table describes a fixed list: changing one value invalidates every later prefix entry, so tasks with frequent updates need a different structure.',
      ],
      example: {
        code: 'values = [2, 7, 1, 8, 2, 8]\nprefix = [0]\nfor value in values:\n    prefix.append(prefix[-1] + value)\nfor left, right in [(0, 6), (1, 4), (3, 6)]:\n    print(prefix[right] - prefix[left])\nvalues[0] = 100\nprint(prefix[6] - prefix[0])',
        output: '28\n16\n18\n28',
        explanation:
          'Three queries cost three subtractions. After values[0] changes, the old table still reports 28: it is stale.',
      },
      questions: [
        choose(
          'There are 10⁵ values and 10⁵ queries, each covering most of the list. About how many steps does summing each query directly take?',
          ['About 2 × 10⁵', 'About 10⁵', 'About 1.7 × 10⁶', 'About 10¹⁰'],
          3,
          'Up to 10⁵ additions for each of 10⁵ queries.',
        ),
        choose(
          'With a prefix table, about how many steps do the same 10⁵ values and 10⁵ queries take?',
          ['About 10¹⁰', 'About 2 × 10⁵', 'About 10⁵', 'About 1.7 × 10⁶'],
          1,
          'One pass to build plus one subtraction per query: O(n + q).',
        ),
        predictOutput(
          'What does this program print?',
          'values = [1, 2, 3]\nprefix = [0]\nfor value in values:\n    prefix.append(prefix[-1] + value)\nvalues[2] = 10\nprint(prefix[3] - prefix[0])',
          ['6', '13', '3', '10'],
          0,
          'The table was built before the change, so it still describes [1, 2, 3].',
        ),
        choose(
          'A task alternates 10⁵ times between changing one value and asking a range sum. Why is a plain prefix table a poor fit?',
          [
            'Prefix tables cannot hold negative values',
            'Each change forces many prefix entries to be rebuilt',
            'Range sums need the values sorted',
            'Queries would read values from the wrong list',
          ],
          1,
          'A change at position i alters every prefix entry after i.',
        ),
      ],
    },
  ],
  'cp-difference-events': [
    {
      title: '+delta at left, −delta at right',
      explanation: [
        'To add delta to every position of the half-open range [left, right), record two boundary events: +delta at left, where the change starts, and −delta at right, where it stops. A running total over the positions then carries the change from left up to, but not including, right.',
      ],
      example: {
        code: 'left = 1\nright = 3\ndelta = 5\nmarks = [0, 0, 0, 0, 0]\nmarks[left] = marks[left] + delta\nmarks[right] = marks[right] - delta\nprint(marks)\nrunning = 0\neffect = []\nfor change in marks:\n    running = running + change\n    effect.append(running)\nprint(effect)',
        output: '[0, 5, 0, -5, 0]\n[0, 5, 5, 0, 0]',
        explanation:
          'The two marks encode the whole update. The running total switches the 5 on at position 1 and off again at position 3.',
      },
      questions: [
        choose(
          'Adding 6 to the half-open range [2, 7) needs which pair of events?',
          [
            '+6 at 2 and -6 at 6',
            '+6 at 2 and -6 at 8',
            '+6 at 2 and -6 at 7',
            '-6 at 2 and +6 at 7',
          ],
          2,
          'The change starts at left and is cancelled at the excluded boundary right.',
        ),
        predictOutput(
          'What does this program print?',
          'def range_events(left, right, delta):\n    return [(left, delta), (right, -delta)]\n\nprint(range_events(0, 3, -2))',
          [
            '[(0, -2), (3, 2)]',
            '[(0, -2), (3, -2)]',
            '[(0, 2), (3, -2)]',
            '[(0, -2), (2, 2)]',
          ],
          0,
          'The start event carries delta itself; the cancellation is its negation, which here is +2.',
        ),
        predictOutput(
          'What does this program print?',
          'running = 0\nfor change in [0, 3, 0, -3]:\n    running = running + change\n    print(running)',
          ['0\n3\n0\n-3', '0\n3\n3\n-3', '0\n3\n3\n0', '3\n3\n0\n0'],
          2,
          'The +3 at position 1 stays in effect until the -3 at position 3 cancels it.',
        ),
        choose(
          'Why is the cancellation placed at right and not at right - 1?',
          [
            'Position right - 1 cannot hold an event',
            'right is excluded, so the change must be off there',
            'At right - 1 the change would be applied twice',
            'It keeps the list of events sorted',
          ],
          1,
          'Position right - 1 is still inside the range and must keep the change.',
        ),
      ],
    },
    {
      title: 'Empty ranges cancel and negative deltas work the same',
      explanation: [
        'If left equals right, both events land on the same boundary and cancel to nothing, which is correct for an empty range. A negative delta uses the identical rule: its cancellation −delta is positive. Encoding always costs exactly two events, however long the range is.',
      ],
      example: {
        code: 'def mark(size, left, right, delta):\n    marks = []\n    for position in range(size):\n        marks.append(0)\n    marks[left] = marks[left] + delta\n    marks[right] = marks[right] - delta\n    return marks\n\nprint(mark(5, 2, 2, 7))\nprint(mark(5, 1, 4, -3))',
        output: '[0, 0, 0, 0, 0]\n[0, -3, 0, 0, 3]',
        explanation:
          'The empty range [2, 2) leaves every mark at 0. The negative update starts with -3 and is cancelled by +3.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'def mark(size, left, right, delta):\n    marks = []\n    for position in range(size):\n        marks.append(0)\n    marks[left] = marks[left] + delta\n    marks[right] = marks[right] - delta\n    return marks\n\nprint(mark(4, 0, 3, -5))',
          [
            '[-5, 0, 0, -5]',
            '[-5, 0, 0, 5]',
            '[5, 0, 0, -5]',
            '[-5, -5, -5, 0]',
          ],
          1,
          'The start mark is the delta -5, and the cancellation at 3 is +5.',
        ),
        predictOutput(
          'What does this program print?',
          'def mark(size, left, right, delta):\n    marks = []\n    for position in range(size):\n        marks.append(0)\n    marks[left] = marks[left] + delta\n    marks[right] = marks[right] - delta\n    return marks\n\nprint(mark(3, 1, 1, 9))',
          ['[0, 0, 0]', '[0, 9, 0]', '[0, 9, -9]', '[0, -9, 0]'],
          0,
          'Both events land on boundary 1 and cancel: the range [1, 1) is empty.',
        ),
        choose(
          'How many events does adding 1 to the range [0, 1000000) need?',
          ['1,000,000', '1,000,001', '1', '2'],
          3,
          'One start event and one cancellation, independent of the range length.',
        ),
        choose(
          'An update adds -4 to [3, 8). What is the event at boundary 8?',
          ['-4', '+4', '0', '-8'],
          1,
          'The cancellation is the negation of the delta.',
        ),
      ],
    },
  ],
  'cp-difference-batch': [
    {
      title: 'One table of n + 1 entries collects every update',
      explanation: [
        'For n positions, start a difference table of n + 1 zeros. [0] * (n + 1) builds that list by repeating 0. For each update (left, right, delta), add delta at left and subtract delta at right. The extra entry at index n exists for updates whose right boundary is n, the end of the list.',
      ],
      example: {
        code: 'n = 4\ndiff = [0] * (n + 1)\nfor left, right, delta in [(0, 2, 3), (1, 4, 5)]:\n    diff[left] += delta\n    diff[right] -= delta\nprint(diff)',
        output: '[3, 5, -3, 0, -5]',
        explanation:
          'The second update ends at boundary 4 = n, so its cancellation needs the extra fifth entry.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'n = 3\ndiff = [0] * (n + 1)\nfor left, right, delta in [(0, 3, 2)]:\n    diff[left] += delta\n    diff[right] -= delta\nprint(diff)',
          ['[2, 0, 0, -2]', '[2, 0, -2]', '[2, 2, 2, 0]', '[2, 0, 0, 2]'],
          0,
          'The update covers the whole list, so its cancellation lands in the extra entry at index 3.',
        ),
        predictOutput(
          'What does this program print?',
          'diff = [0] * 6\nfor left, right, delta in [(1, 3, 4), (3, 5, 1)]:\n    diff[left] += delta\n    diff[right] -= delta\nprint(diff)',
          [
            '[0, 4, 0, -4, 0, -1]',
            '[0, 4, 0, -3, 0, -1]',
            '[0, 4, 4, 1, 1, 0]',
            '[0, 4, 0, 1, 0, -1]',
          ],
          1,
          'At boundary 3 the first update’s -4 and the second update’s +1 combine to -3.',
        ),
        choose(
          'Why does a difference table for n positions need n + 1 entries?',
          [
            'Entry 0 is reserved for the list length',
            'Updates ending at n need a cancellation slot',
            'Each update writes three separate entries',
            'Entry n stores the sum of all the deltas',
          ],
          1,
          'right may equal n, and diff[n] must exist to receive -delta.',
        ),
        predictOutput(
          'What does this program print?',
          'print([0] * (2 + 1))',
          ['[0, 0]', '[0, 0, 0]', '[0]', '0'],
          1,
          'Multiplying a one-item list by 3 repeats its item three times.',
        ),
      ],
    },
    {
      title: 'Overlapping updates add at shared boundaries',
      explanation: [
        'Events at the same boundary simply add, so overlaps, repeated updates and one range ending where another starts all combine automatically. Each update costs two writes however long its range is, so u updates take O(u) time after the O(n) table is created.',
      ],
      example: {
        code: 'diff = [0] * 6\nfor left, right, delta in [(0, 3, 2), (3, 5, 4), (0, 3, 2)]:\n    diff[left] += delta\n    diff[right] -= delta\nprint(diff)',
        output: '[4, 0, 0, 0, 0, -4]',
        explanation:
          'Boundary 0 receives +2 twice. At boundary 3, -2, +4 and -2 cancel to 0: the effect is 4 on both sides of it, so no change is recorded there.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'diff = [0] * 4\nfor left, right, delta in [(1, 3, 5), (1, 3, 5)]:\n    diff[left] += delta\n    diff[right] -= delta\nprint(diff)',
          [
            '[0, 5, 0, -5]',
            '[0, 10, 10, 0]',
            '[0, 10, 0, -10]',
            '[0, 5, 5, -10]',
          ],
          2,
          'The repeated update adds its events again: +5 + 5 at 1 and -5 - 5 at 3.',
        ),
        predictOutput(
          'What does this program print?',
          'diff = [0] * 5\nfor left, right, delta in [(0, 2, 3), (2, 4, 3)]:\n    diff[left] += delta\n    diff[right] -= delta\nprint(diff)',
          [
            '[3, 0, -3, 0, -3]',
            '[3, 0, 3, 0, -3]',
            '[3, 0, 0, 0, -3]',
            '[3, 3, 3, 3, 0]',
          ],
          2,
          'At boundary 2 the first update ends and the second starts with the same delta, so they cancel.',
        ),
        choose(
          'Two updates both start at boundary 2, with deltas 3 and -1. What is the combined entry at 2?',
          ['3', '2', '-1', '4'],
          1,
          'Events at the same boundary add: 3 + (-1).',
        ),
        choose(
          'u updates each cover up to n positions. How many table writes does marking them take?',
          ['u · n', 'n + 1', 'u²', '2u'],
          3,
          'Two boundary writes per update, regardless of range length.',
        ),
      ],
    },
  ],
  'cp-difference-recover': [
    {
      title: 'A running sum turns events back into values',
      explanation: [
        'Scan the real positions 0 to n − 1 from left to right, adding each difference entry to a running total. At position i, running equals the total delta of all ranges covering i: every range that starts at or before i has added its +delta, and every range that ends at or before i has removed it again.',
      ],
      example: {
        code: 'diff = [3, 5, -3, 0, -5]\nrunning = 0\nvalues = []\nfor i in range(len(diff) - 1):\n    running += diff[i]\n    values.append(running)\nprint(values)',
        output: '[3, 8, 5, 5]',
        explanation:
          'The 3 is active at positions 0 and 1, the 5 at positions 1 to 3, giving 3, 8, 5, 5.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'diff = [2, 0, -2, 0]\nrunning = 0\nvalues = []\nfor i in range(len(diff) - 1):\n    running += diff[i]\n    values.append(running)\nprint(values)',
          ['[2, 0, -2]', '[2, 2, 0, 0]', '[2, 2, 0]', '[2, 2, 2]'],
          2,
          'The running sum keeps the +2 for positions 0 and 1; the -2 at position 2 switches it off.',
        ),
        predictOutput(
          'What does this program print?',
          'diff = [-1, 4, 0, 1, -4]\nrunning = 0\nvalues = []\nfor i in range(len(diff) - 1):\n    running += diff[i]\n    values.append(running)\nprint(values)',
          [
            '[-1, 4, 0, 1]',
            '[-1, 3, 3, 4, 0]',
            '[1, 5, 5, 6]',
            '[-1, 3, 3, 4]',
          ],
          3,
          'Each value is the cumulative sum of the entries up to its position.',
        ),
        predictOutput(
          'What does this program print?',
          'diff = [1, 1, -2]\nrunning = 0\nfor i in range(len(diff) - 1):\n    running += diff[i]\n    print(running)',
          ['1\n2\n0', '1\n1', '2\n0', '1\n2'],
          3,
          'Two real positions are reconstructed; the last entry is the sentinel.',
        ),
        choose(
          'At position i of the reconstruction, what does running equal?',
          [
            'The total delta of the ranges covering i',
            'The difference entry stored at i',
            'The total of every delta in the table',
            'The number of ranges that start at i',
          ],
          0,
          'Starts at or before i are added in; ends at or before i are cancelled out.',
        ),
      ],
    },
    {
      title: 'The sentinel is not a position',
      explanation: [
        'The last entry of an n + 1 table sits after the final position; it only cancels ranges that reach the end. Reconstruction therefore produces n values by looping over range(len(diff) - 1). Including the sentinel would add an extra value, which is 0 whenever every update was recorded as a balanced pair. A one-entry table describes zero positions and recovers [].',
      ],
      example: {
        code: 'diff = [4, 0, -4]\nrunning = 0\nfor i in range(len(diff)):\n    running += diff[i]\nprint(running)\nvalues = []\nrunning = 0\nfor i in range(len(diff) - 1):\n    running += diff[i]\n    values.append(running)\nprint(values)',
        output: '0\n[4, 4]',
        explanation:
          'Summing every entry, sentinel included, gives 0. The two real positions both hold 4.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'diff = [7]\nrunning = 0\nvalues = []\nfor i in range(len(diff) - 1):\n    running += diff[i]\n    values.append(running)\nprint(values)',
          ['[7]', '[]', '[0]', 'None'],
          1,
          'A one-entry table has only the sentinel, so there are no real positions.',
        ),
        predictOutput(
          'This loop also visits the sentinel. What does it print?',
          'diff = [2, 1, 0, -3]\nrunning = 0\nvalues = []\nfor i in range(len(diff)):\n    running += diff[i]\n    values.append(running)\nprint(values)',
          ['[2, 3, 3]', '[2, 1, 0, -3]', '[2, 3, 3, -3]', '[2, 3, 3, 0]'],
          3,
          'The extra iteration appends a fourth value, 0, for a position that does not exist.',
        ),
        choose(
          'A difference table has 9 entries. How many values does it describe?',
          ['9', '10', '7', '8'],
          3,
          'n + 1 entries describe n positions.',
        ),
        choose(
          'Every update was recorded as +delta at left and −delta at right. What do all entries add up to, sentinel included?',
          ['0', 'The sum of all deltas', 'The last real value', 'n + 1'],
          0,
          'Each update contributes delta and -delta, which cancel.',
        ),
      ],
    },
  ],
  'cp-difference-arrays': [
    {
      title: 'Mark boundaries, then reconstruct once',
      explanation: [
        'A difference array applies many range additions in two phases. First mark each update with difference[left] += delta and difference[right] -= delta in a table of size n + 1; then rebuild all n values with one running sum. No update ever touches the positions inside its range.',
      ],
      example: {
        code: 'size = 6\nupdates = [(0, 4, 1), (2, 6, 10), (3, 3, 99)]\ndifference = [0] * (size + 1)\nfor left, right, delta in updates:\n    difference[left] += delta\n    difference[right] -= delta\nvalues = []\nrunning = 0\nfor index in range(size):\n    running += difference[index]\n    values.append(running)\nprint(values)',
        output: '[1, 1, 11, 11, 10, 10]',
        explanation:
          'Positions 0–3 get 1, positions 2–5 get 10, and the empty range [3, 3) contributes nothing.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'def apply(size, updates):\n    difference = [0] * (size + 1)\n    for left, right, delta in updates:\n        difference[left] += delta\n        difference[right] -= delta\n    values = []\n    running = 0\n    for index in range(size):\n        running += difference[index]\n        values.append(running)\n    return values\n\nprint(apply(4, [(1, 3, 2)]))',
          ['[0, 2, 2, 0]', '[0, 2, 2, 2]', '[0, 2, 0, -2]', '[2, 2, 2, 0]'],
          0,
          'Only positions 1 and 2 lie in [1, 3).',
        ),
        predictOutput(
          'What does this program print?',
          'def apply(size, updates):\n    difference = [0] * (size + 1)\n    for left, right, delta in updates:\n        difference[left] += delta\n        difference[right] -= delta\n    values = []\n    running = 0\n    for index in range(size):\n        running += difference[index]\n        values.append(running)\n    return values\n\nprint(apply(5, [(0, 5, 1), (1, 2, 4)]))',
          [
            '[1, 5, 5, 1, 1]',
            '[1, 5, 1, 1, 1]',
            '[1, 4, 0, 0, 0]',
            '[5, 5, 1, 1, 1]',
          ],
          1,
          'Every position gets 1, and only position 1 also gets 4.',
        ),
        predictOutput(
          'What does this program print?',
          'def apply(size, updates):\n    difference = [0] * (size + 1)\n    for left, right, delta in updates:\n        difference[left] += delta\n        difference[right] -= delta\n    values = []\n    running = 0\n    for index in range(size):\n        running += difference[index]\n        values.append(running)\n    return values\n\nprint(apply(3, [(0, 3, -2), (0, 1, 2)]))',
          ['[-2, -2, -2]', '[0, -2, -2]', '[0, 0, -2]', '[2, -2, -2]'],
          1,
          'At position 0 the -2 and +2 cancel; positions 1 and 2 keep only the -2.',
        ),
        choose(
          'Which entries of the difference table does one update (left, right, delta) change?',
          [
            'Only difference[left] and difference[right]',
            'Every entry from left to right - 1',
            'Every entry from left to right',
            'Only difference[left]',
          ],
          0,
          'The range interior is never written; the running sum fills it in later.',
        ),
      ],
    },
    {
      title: 'Why the running sum is right',
      explanation: [
        'Invariant of the rebuild: when the scan reaches position i, every update with left <= i has added its delta and every update with right <= i has removed it again, so running is the total of the updates whose range contains i. Overlaps add, negative deltas subtract, and empty ranges [i, i) cancel before they affect anything.',
      ],
      example: {
        code: 'size = 5\nupdates = [(1, 4, 3), (0, 2, -1)]\ndirect = [0] * size\nfor left, right, delta in updates:\n    for index in range(left, right):\n        direct[index] += delta\ndifference = [0] * (size + 1)\nfor left, right, delta in updates:\n    difference[left] += delta\n    difference[right] -= delta\nvalues = []\nrunning = 0\nfor index in range(size):\n    running += difference[index]\n    values.append(running)\nprint(direct)\nprint(values)',
        output: '[-1, 2, 3, 3, 0]\n[-1, 2, 3, 3, 0]',
        explanation:
          'Touching every covered position directly and reconstructing from boundary marks give the same list.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'size = 4\ndifference = [0] * (size + 1)\nfor left, right, delta in [(0, 2, 5), (1, 4, -2)]:\n    difference[left] += delta\n    difference[right] -= delta\nrunning = 0\nfor index in range(size):\n    running += difference[index]\n    print(running)',
          ['5\n-2\n-5\n0', '5\n3\n-2\n-2', '5\n3\n3\n-2', '5\n3\n-2\n0'],
          1,
          'Position 0 has only +5; position 1 has both updates; positions 2 and 3 have only -2.',
        ),
        choose(
          'Updates are (0, 5, 2), (3, 8, 4) and (6, 6, 9). What is the value at position 4?',
          ['2', '6', '15', '4'],
          1,
          'Position 4 lies in [0, 5) and [3, 8); the empty range [6, 6) covers nothing.',
        ),
        choose(
          'At position i of the rebuild, which updates have contributed both their +delta and their −delta?',
          [
            'Those with left <= i',
            'Those with left > i',
            'Those whose range contains i',
            'Those with right <= i',
          ],
          3,
          'Their cancellation boundary has already been passed, so they no longer affect i.',
        ),
        predictOutput(
          'What does this program print?',
          'def apply(size, updates):\n    difference = [0] * (size + 1)\n    for left, right, delta in updates:\n        difference[left] += delta\n        difference[right] -= delta\n    values = []\n    running = 0\n    for index in range(size):\n        running += difference[index]\n        values.append(running)\n    return values\n\nprint(apply(4, [(2, 2, 5), (0, 4, 1)]))',
          ['[1, 1, 1, 1]', '[1, 1, 6, 1]', '[1, 1, 6, 6]', '[6, 1, 1, 1]'],
          0,
          'The empty range [2, 2) marks +5 and -5 on the same boundary, so only the 1 remains.',
        ),
      ],
    },
    {
      title: 'Batch cost, and when to use it',
      explanation: [
        'Marking u updates costs O(u), creating the table O(n), and the single reconstruction O(n): O(n + u) time and O(n) extra space. Applying each update directly costs up to O(n) per update, O(n · u) in total. The trade-off: values are known only after the final scan, so a task that asks for values between updates needs another approach.',
      ],
      example: {
        code: 'size = 1000\nupdates = []\nfor k in range(500):\n    updates.append((0, size, 1))\ndirect_writes = 0\nfor left, right, delta in updates:\n    direct_writes += right - left\nprint(direct_writes)\nprint(2 * len(updates) + size)',
        output: '500000\n2000',
        explanation:
          'Applying 500 full-length updates directly touches 500,000 positions; marking needs 1,000 writes plus one 1,000-position scan.',
      },
      questions: [
        choose(
          'There are 10⁵ positions and 10⁵ updates, each covering most of the list. About how much work does applying them directly take?',
          [
            'About 10¹⁰ steps',
            'About 2 × 10⁵ steps',
            'About 10⁵ steps',
            'About 1.7 × 10⁶ steps',
          ],
          0,
          'Up to 10⁵ positions per update, times 10⁵ updates.',
        ),
        choose(
          'With a difference array, what is the total time for n positions and u updates?',
          ['O(n · u)', 'O(u log n)', 'O(n + u)', 'O(n²)'],
          2,
          'Two writes per update plus one O(n) reconstruction.',
        ),
        choose(
          'A task asks for one position’s value after every single update, interleaved with the updates. Why is a single difference array a poor fit?',
          [
            'Values exist only after the final reconstruction',
            'It cannot store updates with negative deltas',
            'It needs all the updates sorted by left first',
            'It needs O(n²) memory for the interleaving',
          ],
          0,
          'Reading a value needs a prefix scan, which would have to be redone after each update.',
        ),
        predictOutput(
          'What does this program print?',
          'updates = [(0, 10, 1), (2, 9, 4), (5, 6, 7)]\ndirect = 0\nfor left, right, delta in updates:\n    direct += right - left\nprint(direct)\nprint(2 * len(updates))',
          ['30\n6', '18\n3', '18\n6', '12\n6'],
          2,
          'Direct application touches 10 + 7 + 1 positions; marking writes two entries per update.',
        ),
      ],
    },
  ],
  'cp-pointer-endpoints': [
    {
      title: 'Two indices mark the remaining candidates',
      explanation: [
        'In an ascending list, left = 0 and right = len(values) - 1 point at the smallest and the largest value. Together they describe the remaining candidate interval: every pair of positions inside it is still undecided. values[left] + values[right] is the sum of the outer pair.',
      ],
      example: {
        code: 'values = [-5, 1, 4, 10]\nleft = 0\nright = len(values) - 1\nprint(right)\nprint(values[left])\nprint(values[right])\nprint(values[left] + values[right])',
        output: '3\n-5\n10\n5',
        explanation:
          'right is the last index, 3. The outer pair holds the smallest and largest values, -5 and 10.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'values = [2, 3, 8, 9, 12]\nright = len(values) - 1\nprint(right)',
          ['5', '4', '12', '3'],
          1,
          'Five values have indices 0 to 4; right is an index, not a value.',
        ),
        predictOutput(
          'What does this program print?',
          'values = [-7, 0, 3]\nleft = 0\nright = len(values) - 1\nprint(values[left] + values[right])',
          ['-4', '-7', '3', '10'],
          0,
          'The outer pair is -7 and 3, which sum to -4.',
        ),
        choose(
          'In an ascending list, what do values[left] and values[right] hold at the start?',
          [
            'The two smallest values in the list',
            'The two values in the middle',
            'The smallest and the largest values',
            'The first value and the second value',
          ],
          2,
          'left starts at index 0 and right at the last index.',
        ),
        predictOutput(
          'The pointers have moved inward. What does this program print?',
          'values = [1, 4, 6]\nleft = 1\nright = 2\nprint(values[left] + values[right])',
          ['7', '3', '5', '10'],
          3,
          'The pointers are indices; the values at indices 1 and 2 are 4 and 6.',
        ),
      ],
    },
    {
      title: 'left < right means two different positions',
      explanation: [
        'A pair needs two different positions, so a pair search continues only while left < right. When left == right both indices point at the same item, which would pair it with itself. A list with fewer than two items has no pair at all, while equal values at different positions still form a valid pair.',
      ],
      example: {
        code: 'values = [4, 4]\nleft = 0\nright = len(values) - 1\nprint(left < right)\nprint(values[left] + values[right])\nsingle = [9]\nprint(0 < len(single) - 1)',
        output: 'True\n8\nFalse',
        explanation:
          'The two 4s sit at different positions, so they form a pair. A single item has right = 0 = left, so no pair exists.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'values = [7]\nleft = 0\nright = len(values) - 1\nprint(left < right)',
          ['False', 'True', '0', '7'],
          0,
          'With one item, right is 0, the same position as left.',
        ),
        predictOutput(
          'What does this program print?',
          'values = []\nprint(0 < len(values) - 1)',
          ['False', 'True', '-1', 'None'],
          0,
          'For an empty list right would be -1, so there is no pair.',
        ),
        choose(
          'Why does a pair search require left < right rather than left <= right?',
          [
            'left <= right would skip the last item',
            'Equal values can never form a pair',
            'left < right keeps the list sorted',
            'left == right would pair an item with itself',
          ],
          3,
          'At left == right only one position remains.',
        ),
        choose(
          'values = [5, 5, 5]. Do positions 0 and 2 form a valid candidate pair?',
          [
            'No, equal values never pair',
            'Only after removing duplicates',
            'Only if the list is unsorted',
            'Yes, they are different positions',
          ],
          3,
          'Pairs are about positions; equal values at different positions count.',
        ),
      ],
    },
  ],
  'cp-pointer-discard': [
    {
      title: 'If the outer pair is too heavy, right has no partner',
      explanation: [
        'Suppose the task counts pairs whose sum is at most limit. If values[left] + values[right] > limit, then values[right] is too large even with the smallest remaining partner, values[left]. Every other remaining partner is at least as large, so values[right] fits with nobody: decrease right to discard it.',
      ],
      example: {
        code: 'values = [2, 5, 7, 12]\nleft = 0\nright = 3\nlimit = 10\nif values[left] + values[right] > limit:\n    right -= 1\nprint(right)\nprint(values[left] + values[right])',
        output: '2\n9',
        explanation:
          '2 + 12 exceeds 10, so 12 cannot pair with anything. The new outer pair 2 + 7 is checked next.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'values = [1, 3, 9]\nleft = 0\nright = 2\nif values[left] + values[right] > 8:\n    right -= 1\nprint(right)',
          ['1', '2', '0', '3'],
          0,
          '1 + 9 = 10 exceeds 8, so 9 is discarded and right moves to index 1.',
        ),
        predictOutput(
          'What does this program print?',
          'values = [1, 3, 9]\nleft = 0\nright = 2\nif values[left] + values[right] > 10:\n    right -= 1\nprint(right)',
          ['1', '3', '0', '2'],
          3,
          '1 + 9 = 10 is not greater than 10, so nothing is discarded.',
        ),
        predictOutput(
          'What does this program print?',
          'def discard(values, left, right, limit):\n    if values[left] + values[right] > limit:\n        return right - 1\n    return right\n\nvalues = [-4, -1, 6, 8]\nprint(discard(values, 0, 3, 3))\nprint(discard(values, 0, 3, 4))',
          ['2\n3', '2\n2', '3\n3', '3\n2'],
          0,
          '-4 + 8 = 4 exceeds 3 but not 4, so only the first call discards right.',
        ),
        choose(
          'The outer sum exceeds the limit. Why can values[right] be discarded for good?',
          [
            'Even its smallest possible partner is too heavy',
            'The largest value is never part of a pair',
            'Its sum with every partner equals the limit',
            'It has already been counted with left',
          ],
          0,
          'values[left] is the smallest remaining value; if even that fails, every partner fails.',
        ),
      ],
    },
    {
      title: 'The proof needs sorted order and discards only right',
      explanation: [
        'The argument relies on ascending order: values[left] must be the smallest remaining value. Negative numbers are fine, since only comparisons are used. The proof does not justify discarding left: left failed only with the largest partner and may still fit with a smaller one.',
      ],
      example: {
        code: 'values = [3, 6, 9]\nlimit = 10\nprint(values[0] + values[2] > limit)\nprint(values[0] + values[1] <= limit)',
        output: 'True\nTrue',
        explanation:
          '3 fails with 9 but fits with 6. Only the right endpoint can be ruled out.',
      },
      questions: [
        choose(
          'In the unsorted list [9, 2, 7], left = 0, right = 2 and the limit is 10. Why is discarding right unsafe here?',
          [
            'The outer sum 16 is below the limit',
            'Unsorted lists have no candidate pairs',
            'right should be increased instead',
            'values[left] is not the smallest, and 7 fits with 2',
          ],
          3,
          'The proof needs values[left] to be the smallest remaining value; here 2 is smaller.',
        ),
        predictOutput(
          'What does this program print?',
          'values = [-6, -2, 3]\nleft = 0\nright = 2\nif values[left] + values[right] > -4:\n    right -= 1\nprint(right)',
          ['1', '2', '0', '3'],
          0,
          '-6 + 3 = -3 exceeds -4, so 3 is discarded; negative values do not change the rule.',
        ),
        choose(
          'In a sorted list the outer sum exceeds the limit. Which endpoint may be discarded?',
          ['Only right', 'Only left', 'Both of them', 'Neither of them'],
          0,
          'Only right is proven to have no partner; left may fit with a smaller right.',
        ),
        predictOutput(
          'What does this program print?',
          'values = [1, 4, 8]\nlimit = 7\nprint(values[0] + values[2] <= limit)\nprint(values[0] + values[1] <= limit)',
          ['False\nTrue', 'False\nFalse', 'True\nTrue', 'True\nFalse'],
          0,
          'The left value 1 fails with 8 but fits with 4, so discarding left would lose a valid pair.',
        ),
      ],
    },
  ],
  'cp-pointer-count-block': [
    {
      title: 'A fitting outer pair certifies right − left pairs',
      explanation: [
        'If values[left] + values[right] <= limit, then left also fits with every position from left + 1 to right, because in sorted order those partners are no larger than values[right]. That block holds right − left partners, which can all be counted at once without checking them one by one.',
      ],
      example: {
        code: 'values = [1, 2, 4, 6, 9]\nleft = 0\nright = 3\nlimit = 8\nif values[left] + values[right] <= limit:\n    print(right - left)',
        output: '3',
        explanation:
          '1 + 6 fits, so 1 also fits with 2 and 4: three partners in total.',
      },
      questions: [
        choose(
          'left = 2 and right = 7, and the outer pair fits. How many pairs does left contribute?',
          ['5', '6', '7', '4'],
          0,
          'The partners are positions 3 through 7: right − left of them.',
        ),
        predictOutput(
          'What does this program print?',
          'values = [0, 3, 5, 6]\nleft = 0\nright = 3\nif values[left] + values[right] <= 6:\n    print(right - left)\nelse:\n    print(0)',
          ['4', '1', '3', '0'],
          2,
          '0 + 6 fits, certifying the partners at positions 1, 2 and 3.',
        ),
        predictOutput(
          'What does this program print?',
          'values = [0, 3, 5, 6]\nleft = 0\nright = 3\nif values[left] + values[right] <= 5:\n    print(right - left)\nelse:\n    print(0)',
          ['3', '2', '0', '1'],
          2,
          '0 + 6 exceeds 5, so this check certifies no block.',
        ),
        choose(
          'Why do all partners between left + 1 and right fit once the outer pair fits?',
          [
            'They all hold the same value',
            'Partners nearer left always have smaller sums than the outer pair',
            'The limit grows as right moves',
            'In sorted order none of them exceeds values[right]',
          ],
          3,
          'Each such partner is at most values[right], so its sum with values[left] is at most the fitting outer sum.',
        ),
      ],
    },
    {
      title: 'Count the block, then advance left',
      explanation: [
        'After counting right − left pairs for left, every pair that uses left has been decided, so advance left by one; staying put would count the same block again. Duplicate values at different positions are separate partners, and each one counts.',
      ],
      example: {
        code: 'values = [2, 2, 2, 5]\nleft = 0\nright = 2\nlimit = 4\ncount = 0\nif values[left] + values[right] <= limit:\n    count = count + (right - left)\n    left = left + 1\nprint(count)\nprint(left)',
        output: '2\n1',
        explanation:
          'The first 2 pairs with the 2s at positions 1 and 2. Then left moves on, so these pairs are never counted again.',
      },
      questions: [
        predictOutput(
          'This loop never advances left. What does it print?',
          'values = [1, 2, 3]\nleft = 0\nright = 2\ncount = 0\nfor step in [1, 2]:\n    if values[left] + values[right] <= 5:\n        count = count + (right - left)\nprint(count)',
          ['2', '3', '4', '1'],
          2,
          'The same block of two pairs is counted on both steps because left stays at 0.',
        ),
        predictOutput(
          'What does this program print?',
          'values = [3, 3, 3]\nleft = 0\nright = 2\ncount = 0\nif values[left] + values[right] <= 6:\n    count = count + (right - left)\nprint(count)',
          ['1', '2', '3', '0'],
          1,
          'The equal values at positions 1 and 2 are two separate partners.',
        ),
        choose(
          'After counting the block for left, which move avoids counting those pairs again?',
          [
            'Decrease right by one',
            'Reset right to the end',
            'Keep both pointers still',
            'Advance left by one',
          ],
          3,
          'All pairs using left are decided, so left is done.',
        ),
        choose(
          'values = [4, 4, 4, 4], left = 0, right = 3 and the limit is 8. How many partners does the block certify?',
          ['1', '3', '4', '6'],
          1,
          '4 + 4 fits, so left pairs with all three later positions.',
        ),
      ],
    },
  ],
  'cp-two-pointers': [
    {
      title: 'Run the loop: count a block or discard right',
      explanation: [
        'Counting pairs with sum at most limit repeats one decision while left < right: if the outer pair fits, count right − left pairs and advance left; otherwise discard right. Each step settles one endpoint, and the loop stops when the pointers meet.',
      ],
      example: {
        code: 'values = [1, 3, 4, 7, 8]\nlimit = 9\nleft = 0\nright = len(values) - 1\ncount = 0\nwhile left < right:\n    if values[left] + values[right] <= limit:\n        count += right - left\n        left += 1\n    else:\n        right -= 1\nprint(count)',
        output: '5',
        explanation:
          '1 + 8 fits (4 pairs). Then 8 and 7 are discarded against 3, and 3 + 4 fits (1 pair): 5 in total.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'def count_pairs(values, limit):\n    left = 0\n    right = len(values) - 1\n    count = 0\n    while left < right:\n        if values[left] + values[right] <= limit:\n            count += right - left\n            left += 1\n        else:\n            right -= 1\n    return count\n\nprint(count_pairs([2, 3, 5, 8], 8))',
          ['2', '4', '6', '3'],
          3,
          '8 is discarded first; then 2 + 5 fits (2 pairs) and 3 + 5 fits (1 pair).',
        ),
        predictOutput(
          'What does this program print?',
          'def count_pairs(values, limit):\n    left = 0\n    right = len(values) - 1\n    count = 0\n    while left < right:\n        if values[left] + values[right] <= limit:\n            count += right - left\n            left += 1\n        else:\n            right -= 1\n    return count\n\nprint(count_pairs([1, 1, 1], 2))',
          ['1', '2', '6', '3'],
          3,
          'Every pair fits: 2 pairs for the first 1 and 1 for the second, all counted as blocks.',
        ),
        predictOutput(
          'What does this program print?',
          'def count_pairs(values, limit):\n    left = 0\n    right = len(values) - 1\n    count = 0\n    while left < right:\n        if values[left] + values[right] <= limit:\n            count += right - left\n            left += 1\n        else:\n            right -= 1\n    return count\n\nprint(count_pairs([5, 6, 7], 10))',
          ['1', '0', '3', '2'],
          1,
          'Even the smallest value fails with each larger one, so right is discarded until the pointers meet.',
        ),
        choose(
          'What does each loop step do to the candidate interval [left, right]?',
          [
            'Shrinks it to half its size',
            'Leaves it unchanged when a pair fits',
            'Shrinks it by exactly one endpoint',
            'Moves both endpoints inward',
          ],
          2,
          'A fitting pair advances left; otherwise right moves. Never both, never neither.',
        ),
      ],
    },
    {
      title: 'The invariant: outside decided, inside undecided',
      explanation: [
        'Before each step, every pair with an endpoint outside [left, right] has been counted or proved invalid, and every pair inside is still undecided. Counting a fitting block settles all pairs that use left; discarding settles all pairs that use right. When the pointers meet, no undecided pair remains, so count is complete.',
      ],
      example: {
        code: 'values = [1, 2, 6, 7]\nlimit = 8\nleft = 0\nright = 3\ncount = 0\nwhile left < right:\n    print((left, right, count))\n    if values[left] + values[right] <= limit:\n        count += right - left\n        left += 1\n    else:\n        right -= 1\nprint((left, right, count))',
        output: '(0, 3, 0)\n(1, 3, 3)\n(1, 2, 3)\n(2, 2, 4)',
        explanation:
          'Each line shows the undecided interval and the pairs settled so far. 1 + 7 fits (3 pairs), 7 is discarded against 2, then 2 + 6 fits (1 pair).',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'values = [2, 4, 5, 9]\nlimit = 7\nleft = 0\nright = 3\ncount = 0\nwhile left < right:\n    print((left, right, count))\n    if values[left] + values[right] <= limit:\n        count += right - left\n        left += 1\n    else:\n        right -= 1\nprint((left, right, count))',
          [
            '(0, 3, 0)\n(1, 3, 3)\n(1, 2, 3)\n(1, 1, 3)',
            '(0, 3, 0)\n(0, 2, 2)\n(1, 2, 2)\n(1, 1, 2)',
            '(0, 3, 0)\n(0, 2, 0)\n(1, 2, 2)\n(2, 2, 3)',
            '(0, 3, 0)\n(0, 2, 0)\n(1, 2, 2)\n(1, 1, 2)',
          ],
          3,
          '9 is discarded first. Then 2 + 5 fits (2 pairs) and 4 + 5 does not, so 5 is discarded and the pointers meet.',
        ),
        choose(
          'The loop has just discarded right. Which pairs did that step decide?',
          [
            'Only the single pair (left, right)',
            'Every remaining pair that uses the old right',
            'Every remaining pair that uses left',
            'None; it only moved a pointer',
          ],
          1,
          'The proof showed the old right fits with no remaining partner.',
        ),
        choose(
          'When the loop ends with left == right, why is count complete?',
          [
            'Every value has been added to count',
            'left and right have swapped their roles',
            'No undecided pair remains inside the interval',
            'The largest value has been counted twice',
          ],
          2,
          'An interval with one position contains no pair, and everything outside was settled.',
        ),
        predictOutput(
          'What does this program print?',
          'def count_pairs(values, limit):\n    left = 0\n    right = len(values) - 1\n    count = 0\n    while left < right:\n        if values[left] + values[right] <= limit:\n            count += right - left\n            left += 1\n        else:\n            right -= 1\n    return count\n\nprint(count_pairs([-3, 0, 2, 4, 5], 2))',
          ['4', '6', '5', '3'],
          2,
          '-3 fits with all four others; then 0 fits only with 2 after 5 and 4 are discarded.',
        ),
      ],
    },
    {
      title: 'Cost and the sorted precondition',
      explanation: [
        'Each step moves one pointer inward, so at most n − 1 steps run: O(n) time and O(1) extra space on an already sorted list. Unsorted input must be sorted first, which adds O(n log n) time. The discard and block rules are valid only because of sorted order; on unsorted data they give wrong counts.',
      ],
      example: {
        code: 'def count_pairs(values, limit):\n    left = 0\n    right = len(values) - 1\n    count = 0\n    while left < right:\n        if values[left] + values[right] <= limit:\n            count += right - left\n            left += 1\n        else:\n            right -= 1\n    return count\n\nprint(count_pairs([7, 1, 5, 2], 7))\nprint(count_pairs([1, 2, 5, 7], 7))',
        output: '0\n3',
        explanation:
          'The same four numbers give 0 when unsorted (every step wrongly discards right) and the correct 3 when sorted.',
      },
      questions: [
        choose(
          'At most how many loop steps does the two-pointer count take on n values?',
          ['n − 1', 'n²', 'n(n − 1)/2', 'log n'],
          0,
          'Each step shrinks the interval by one position, from n positions down to one.',
        ),
        choose(
          'The input arrives unsorted. What is the total time to sort it and then count with two pointers?',
          ['O(n)', 'O(n log n)', 'O(n²)', 'O(log n)'],
          1,
          'The O(n log n) sort dominates the O(n) scan.',
        ),
        predictOutput(
          'The list here is not sorted. What does this program print?',
          'def count_pairs(values, limit):\n    left = 0\n    right = len(values) - 1\n    count = 0\n    while left < right:\n        if values[left] + values[right] <= limit:\n            count += right - left\n            left += 1\n        else:\n            right -= 1\n    return count\n\nprint(count_pairs([4, 1, 3], 5))',
          ['2', '1', '3', '0'],
          1,
          'The loop discards 3, counts the pair 4 + 1, and stops, missing 1 + 3. On unsorted input the answer is wrong.',
        ),
        predictOutput(
          'What does this program print?',
          'def count_pairs(values, limit):\n    left = 0\n    right = len(values) - 1\n    count = 0\n    while left < right:\n        if values[left] + values[right] <= limit:\n            count += right - left\n            left += 1\n        else:\n            right -= 1\n    return count\n\nprint(count_pairs([1, 2, 3, 4], 100))',
          ['4', '3', '6', '10'],
          2,
          'Every pair fits, so the blocks 3 + 2 + 1 cover all 4 · 3 / 2 pairs.',
        ),
      ],
    },
  ],
  'cp-window-counts': [
    {
      title: 'Count exactly the labels in [left, right)',
      explanation: [
        'A window [left, right) contains the labels at positions left through right − 1, which is the slice labels[left:right]. Its frequency map must count exactly those labels: not the whole input, and not every label seen earlier.',
      ],
      example: {
        code: 'labels = ["a", "b", "a", "c", "a"]\ncounts = {}\nfor label in labels[1:4]:\n    counts[label] = counts.get(label, 0) + 1\nprint(counts)',
        output: "{'b': 1, 'a': 1, 'c': 1}",
        explanation:
          'Positions 1, 2 and 3 hold b, a and c. The a’s at positions 0 and 4 lie outside the window.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'labels = [5, 5, 7, 5]\ncounts = {}\nfor label in labels[0:3]:\n    counts[label] = counts.get(label, 0) + 1\nprint(counts)',
          ['{5: 3, 7: 1}', '{5: 2, 7: 1}', '{5: 2}', '{7: 1, 5: 2}'],
          1,
          'The window [0, 3) excludes the last 5.',
        ),
        choose(
          'Which positions belong to the window [2, 5)?',
          ['2, 3 and 4', '2, 3, 4 and 5', '3, 4 and 5', '2 and 5'],
          0,
          'Half-open: left is included and right is excluded.',
        ),
        predictOutput(
          'What does this program print?',
          'labels = ["x", "y", "x", "y"]\ncounts = {}\nfor label in labels[1:3]:\n    counts[label] = counts.get(label, 0) + 1\nprint(counts)',
          [
            "{'x': 2, 'y': 2}",
            "{'y': 1}",
            "{'x': 1, 'y': 2}",
            "{'y': 1, 'x': 1}",
          ],
          3,
          'Only positions 1 and 2 are counted, and y comes first because it is first in the window.',
        ),
        choose(
          'The window is [3, 7). Which loop counts exactly its labels?',
          [
            'for label in labels[3:7]',
            'for label in labels[3:8]',
            'for label in labels[4:7]',
            'for label in labels',
          ],
          0,
          'The slice uses the same half-open boundaries as the window.',
        ),
      ],
    },
    {
      title: 'Map size is the distinct labels; counts add up to the length',
      explanation: [
        'When the map stores only labels that are present, len(counts) is the number of distinct labels in the window, and the counts add up to the window length right − left. A repeated label raises its count without adding a key. An empty window has an empty map.',
      ],
      example: {
        code: 'labels = ["r", "g", "r", "r", "b"]\ncounts = {}\nfor label in labels[0:4]:\n    counts[label] = counts.get(label, 0) + 1\nprint(len(counts))\nprint(counts["r"] + counts["g"])',
        output: '2\n4',
        explanation:
          'The window of length 4 holds two distinct labels, and their counts 3 and 1 add up to 4.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'labels = [1, 2, 1, 1, 3]\ncounts = {}\nfor label in labels[1:5]:\n    counts[label] = counts.get(label, 0) + 1\nprint(len(counts))',
          ['4', '5', '2', '3'],
          3,
          'The window holds 2, 1, 1, 3: four labels but three distinct ones.',
        ),
        predictOutput(
          'What does this program print?',
          'labels = ["a", "b", "c"]\ncounts = {}\nfor label in labels[2:2]:\n    counts[label] = counts.get(label, 0) + 1\nprint(counts)',
          ["{'c': 0}", 'None', '{}', "{'c': 1}"],
          2,
          'The window [2, 2) is empty, so no label is counted and no key is created.',
        ),
        choose(
          'A window of length 6 has a map with 4 keys. What must its counts add up to?',
          ['4', '6', '10', '24'],
          1,
          'Every position in the window adds one to some count.',
        ),
        choose(
          'What does len(counts) report for a window map that stores only present labels?',
          [
            'The length of the window',
            'The total of all the counts',
            'The number of distinct labels in the window',
            'The number of labels seen so far',
          ],
          2,
          'One key per distinct label currently in the window.',
        ),
      ],
    },
  ],
  'cp-window-remove': [
    {
      title: 'Decrement the outgoing label; delete it at zero',
      explanation: [
        'When the left boundary moves past a label, subtract one from its count. If copies of it remain in the window, keep the key. If the count reaches zero, remove the key with del counts[label].',
      ],
      example: {
        code: 'counts = {"a": 2, "b": 1}\nfor outgoing in ["a", "b"]:\n    counts[outgoing] -= 1\n    if counts[outgoing] == 0:\n        del counts[outgoing]\n    print(counts)',
        output: "{'a': 1, 'b': 1}\n{'a': 1}",
        explanation:
          'One a remains after the first removal, so its key stays. b’s last copy leaves, so its key is deleted.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'counts = {"x": 3}\ncounts["x"] -= 1\nif counts["x"] == 0:\n    del counts["x"]\nprint(counts)',
          ['{}', "{'x': 3}", "{'x': 2}", "{'x': 0}"],
          2,
          'Two copies of x remain, so the key stays with count 2.',
        ),
        predictOutput(
          'What does this program print?',
          'counts = {"x": 1, "y": 4}\ncounts["x"] -= 1\nif counts["x"] == 0:\n    del counts["x"]\nprint(counts)',
          ["{'x': 0, 'y': 4}", "{'y': 3}", "{'y': 4}", '{}'],
          2,
          'The last x left the window, so its key is deleted; y is untouched.',
        ),
        choose(
          'Which statement removes the key label from the dictionary counts?',
          [
            'counts.remove(label)',
            'del counts[label]',
            'counts[label] = None',
            'counts.pop()',
          ],
          1,
          'del with a key removes that entry; dictionaries have no remove method.',
        ),
        predictOutput(
          'What does this program print?',
          'counts = {"p": 2, "q": 1}\nfor outgoing in ["p", "p"]:\n    counts[outgoing] -= 1\n    if counts[outgoing] == 0:\n        del counts[outgoing]\nprint(len(counts))',
          ['2', '0', '3', '1'],
          3,
          'Both copies of p leave, so its key is deleted and only q remains.',
        ),
      ],
    },
    {
      title: 'Zero entries make the distinct count lie',
      explanation: [
        'If a key stays at count 0, len(counts) still includes it, so the map claims a label is present when no copy is left. Deleting at zero keeps len(counts) equal to the number of distinct labels in the window. Sliding a window one step is then: add the incoming label, remove the outgoing one.',
      ],
      example: {
        code: 'kept = {"a": 1, "b": 1}\nkept["a"] -= 1\nprint(len(kept))\ndeleted = {"a": 1, "b": 1}\ndeleted["a"] -= 1\nif deleted["a"] == 0:\n    del deleted["a"]\nprint(len(deleted))',
        output: '2\n1',
        explanation:
          'Both maps describe a window containing only b, but only the one that deleted the zero entry reports 1 distinct label.',
      },
      questions: [
        predictOutput(
          'This program slides a window from [0, 3) to [1, 4). What does it print?',
          'labels = ["a", "b", "a", "c"]\ncounts = {}\nfor label in labels[0:3]:\n    counts[label] = counts.get(label, 0) + 1\ncounts["c"] = counts.get("c", 0) + 1\ncounts["a"] -= 1\nif counts["a"] == 0:\n    del counts["a"]\nprint(counts)',
          [
            "{'a': 1, 'b': 1, 'c': 1}",
            "{'b': 1, 'c': 1}",
            "{'a': 2, 'b': 1, 'c': 1}",
            "{'a': 1, 'b': 1}",
          ],
          0,
          'c enters and one a leaves; another a is still in the window, so its key stays.',
        ),
        predictOutput(
          'This map keeps zero entries. What does it print?',
          'counts = {"q": 1, "r": 2}\ncounts["q"] -= 1\nprint(len(counts))',
          ['1', '3', '2', '0'],
          2,
          'The zero entry for q still counts as a key, although only r is present.',
        ),
        choose(
          'A window map keeps zero-count keys instead of deleting them. What goes wrong?',
          [
            'The counts stop adding up to the window length',
            'len(counts) overstates the distinct labels present',
            'Labels that are present get lost',
            'The map becomes sorted by count',
          ],
          1,
          'Each zero entry is a key for a label that is no longer in the window.',
        ),
        choose(
          'Which updates slide a window one step to the right?',
          [
            'Clear the map and count the incoming label',
            'Add the incoming label only',
            'Remove the outgoing label only',
            'Add the incoming label and remove the outgoing one',
          ],
          3,
          'The window gains one position on the right and loses one on the left.',
        ),
      ],
    },
  ],
  'cp-window-repair': [
    {
      title: 'Shrink from the left while there are too many labels',
      explanation: [
        'After the right boundary adds a label, the window may hold more than k distinct labels. Repair it by removing labels[left] and advancing left, repeating while len(counts) > k. Each removal decrements a count and deletes the key at zero.',
      ],
      example: {
        code: 'labels = ["a", "a", "b", "c"]\ncounts = {"a": 2, "b": 1, "c": 1}\nleft = 0\nwhile len(counts) > 2:\n    old = labels[left]\n    counts[old] -= 1\n    if counts[old] == 0:\n        del counts[old]\n    left += 1\n    print(counts)\nprint(left)',
        output: "{'a': 1, 'b': 1, 'c': 1}\n{'b': 1, 'c': 1}\n2",
        explanation:
          'Removing the first a leaves another a, so three labels remain. Removing the second a deletes its key and the window becomes valid at left = 2.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'def repair(labels, k):\n    counts = {}\n    for label in labels:\n        counts[label] = counts.get(label, 0) + 1\n    left = 0\n    while len(counts) > k:\n        old = labels[left]\n        counts[old] -= 1\n        if counts[old] == 0:\n            del counts[old]\n        left += 1\n    return left\n\nprint(repair(["x", "y", "z"], 2))',
          ['1', '2', '0', '3'],
          0,
          'Removing x leaves y and z, which meets the limit.',
        ),
        predictOutput(
          'What does this program print?',
          'def repair(labels, k):\n    counts = {}\n    for label in labels:\n        counts[label] = counts.get(label, 0) + 1\n    left = 0\n    while len(counts) > k:\n        old = labels[left]\n        counts[old] -= 1\n        if counts[old] == 0:\n            del counts[old]\n        left += 1\n    return left\n\nprint(repair(["p", "q", "p", "q", "r"], 2))',
          ['1', '3', '2', '4'],
          1,
          'The first p and the first q leave without removing a key; only removing the second p deletes p.',
        ),
        predictOutput(
          'What does this program print?',
          'def repair(labels, k):\n    counts = {}\n    for label in labels:\n        counts[label] = counts.get(label, 0) + 1\n    left = 0\n    while len(counts) > k:\n        old = labels[left]\n        counts[old] -= 1\n        if counts[old] == 0:\n            del counts[old]\n        left += 1\n    return left\n\nprint(repair(["m", "m", "n"], 2))',
          ['0', '1', '2', '3'],
          0,
          'Two distinct labels already meet the limit, so nothing is removed.',
        ),
        choose(
          'Removing the leftmost label did not reduce the number of distinct labels. How can that happen?',
          [
            'The label was added twice by mistake',
            'Removing a label always raises the distinct count',
            'The map was not kept sorted',
            'Another copy of that label is still in the window',
          ],
          3,
          'A key disappears only when its last copy leaves.',
        ),
      ],
    },
    {
      title: 'Stop at the first valid boundary',
      explanation: [
        'Removing labels never increases the number of distinct labels, so the shrinking loop always makes progress toward a valid window. Stop as soon as len(counts) <= k: that left boundary gives the longest valid window ending at the current right boundary. With k = 0, every label has to leave.',
      ],
      example: {
        code: 'def repair(labels, k):\n    counts = {}\n    for label in labels:\n        counts[label] = counts.get(label, 0) + 1\n    left = 0\n    while len(counts) > k:\n        old = labels[left]\n        counts[old] -= 1\n        if counts[old] == 0:\n            del counts[old]\n        left += 1\n    return left\n\nlabels = ["a", "b", "b", "c", "b"]\nleft = repair(labels, 2)\nprint(left)\nprint(labels[left:])',
        output: "1\n['b', 'b', 'c', 'b']",
        explanation:
          'Removing a already leaves only b and c, so the loop stops at left = 1 and keeps the longest valid suffix.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'def repair(labels, k):\n    counts = {}\n    for label in labels:\n        counts[label] = counts.get(label, 0) + 1\n    left = 0\n    while len(counts) > k:\n        old = labels[left]\n        counts[old] -= 1\n        if counts[old] == 0:\n            del counts[old]\n        left += 1\n    return left\n\nlabels = ["a", "b", "c", "c"]\nleft = repair(labels, 1)\nprint(labels[left:])',
          ["['c', 'c']", "['c']", "['b', 'c', 'c']", "['a', 'b', 'c', 'c']"],
          0,
          'a and b must leave; both c’s remain because the window is valid as soon as only c is left.',
        ),
        predictOutput(
          'What does this program print?',
          'def repair(labels, k):\n    counts = {}\n    for label in labels:\n        counts[label] = counts.get(label, 0) + 1\n    left = 0\n    while len(counts) > k:\n        old = labels[left]\n        counts[old] -= 1\n        if counts[old] == 0:\n            del counts[old]\n        left += 1\n    return left\n\nlabels = ["a", "b"]\nleft = repair(labels, 0)\nprint(labels[left:])',
          ['[]', "['b']", "['a', 'b']", "['a']"],
          0,
          'With k = 0 no label may stay, so left moves past both.',
        ),
        choose(
          'Why stop at the first left boundary where the window becomes valid?',
          [
            'It keeps the shortest valid window ending at right',
            'It guarantees every label is unique',
            'It keeps the longest valid window ending at right',
            'Continuing would make the window invalid again',
          ],
          2,
          'Any further removal would only shorten a window that is already valid.',
        ),
        choose(
          'Why is the shrinking loop guaranteed to finish?',
          [
            'Every removal lowers the distinct count by one',
            'The loop always runs exactly k times',
            'Dictionaries delete zero entries automatically',
            'Each pass moves left forward through a finite list',
          ],
          3,
          'In the worst case left passes every label and the map becomes empty.',
        ),
      ],
    },
  ],
  'cp-sliding-window': [
    {
      title: 'Expand right, repair left, record the length',
      explanation: [
        'The longest segment with at most k distinct labels combines the window operations. For each right boundary, add labels[right] to the map; while the map has more than k keys, remove labels[left] and advance left; then the window from left to right is valid, and right − left + 1 is a candidate length.',
      ],
      example: {
        code: 'def longest(labels, k):\n    counts = {}\n    left = 0\n    best = 0\n    for right in range(len(labels)):\n        label = labels[right]\n        counts[label] = counts.get(label, 0) + 1\n        while len(counts) > k:\n            old = labels[left]\n            counts[old] -= 1\n            if counts[old] == 0:\n                del counts[old]\n            left += 1\n        best = max(best, right - left + 1)\n    return best\n\nprint(longest([1, 2, 1, 3, 3, 1, 2], 2))',
        output: '4',
        explanation:
          'The best window is 1, 3, 3, 1 (positions 2 to 5). Every time a third label enters, the left side shrinks until only two labels remain.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'def longest(labels, k):\n    counts = {}\n    left = 0\n    best = 0\n    for right in range(len(labels)):\n        label = labels[right]\n        counts[label] = counts.get(label, 0) + 1\n        while len(counts) > k:\n            old = labels[left]\n            counts[old] -= 1\n            if counts[old] == 0:\n                del counts[old]\n            left += 1\n        best = max(best, right - left + 1)\n    return best\n\nprint(longest(["x", "y", "x", "x", "z"], 2))',
          ['4', '3', '5', '2'],
          0,
          'x, y, x, x is valid with length 4; when z enters, x and y cannot both stay.',
        ),
        predictOutput(
          'What does this program print?',
          'def longest(labels, k):\n    counts = {}\n    left = 0\n    best = 0\n    for right in range(len(labels)):\n        label = labels[right]\n        counts[label] = counts.get(label, 0) + 1\n        while len(counts) > k:\n            old = labels[left]\n            counts[old] -= 1\n            if counts[old] == 0:\n                del counts[old]\n            left += 1\n        best = max(best, right - left + 1)\n    return best\n\nprint(longest(["a", "b", "c", "d"], 1))',
          ['0', '4', '2', '1'],
          3,
          'All labels differ, so any window with one distinct label has length 1.',
        ),
        predictOutput(
          'What does this program print?',
          'def longest(labels, k):\n    counts = {}\n    left = 0\n    best = 0\n    for right in range(len(labels)):\n        label = labels[right]\n        counts[label] = counts.get(label, 0) + 1\n        while len(counts) > k:\n            old = labels[left]\n            counts[old] -= 1\n            if counts[old] == 0:\n                del counts[old]\n            left += 1\n        best = max(best, right - left + 1)\n    return best\n\nprint(longest([7, 8, 7, 9, 9, 9], 2))',
          ['4', '3', '5', '6'],
          0,
          'When 9 enters, the window shrinks to 7, 9 and then grows to 7, 9, 9, 9.',
        ),
        choose(
          'Why is right − left + 1 recorded only after the shrinking loop?',
          [
            'The shrinking loop also changes right',
            'Before the loop the window is always empty',
            'Only then is the window guaranteed valid',
            'It avoids counting the label at right',
          ],
          2,
          'Before repair the window may hold k + 1 distinct labels.',
        ),
      ],
    },
    {
      title: 'Why the repaired window is the best for its right end',
      explanation: [
        'After shrinking, any left boundary further left would include labels that were just removed, and those windows have too many distinct labels. So the window [left, right] is the longest valid one ending at right, and the best over all right ends is the answer. Because adding labels on the right never lowers the distinct count, left never needs to move back.',
      ],
      example: {
        code: 'labels = ["a", "b", "a", "c", "c"]\nk = 2\ncounts = {}\nleft = 0\nfor right in range(len(labels)):\n    label = labels[right]\n    counts[label] = counts.get(label, 0) + 1\n    while len(counts) > k:\n        old = labels[left]\n        counts[old] -= 1\n        if counts[old] == 0:\n            del counts[old]\n        left += 1\n    print(right - left + 1)',
        output: '1\n2\n3\n2\n3',
        explanation:
          'The lengths for each right end are 1, 2, 3, then 2 after c forces both a and b out of the way, then 3.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'labels = ["p", "q", "q", "r", "p"]\nk = 2\ncounts = {}\nleft = 0\nfor right in range(len(labels)):\n    label = labels[right]\n    counts[label] = counts.get(label, 0) + 1\n    while len(counts) > k:\n        old = labels[left]\n        counts[old] -= 1\n        if counts[old] == 0:\n            del counts[old]\n        left += 1\n    print(right - left + 1)',
          ['1\n2\n3\n3\n2', '1\n2\n3\n3\n3', '1\n2\n3\n1\n2', '1\n2\n3\n4\n5'],
          0,
          'When r enters, removing p leaves q, q, r. When p returns, both q’s must leave, leaving r, p.',
        ),
        choose(
          'After the repair, could a window with the same right end but a smaller left be valid?',
          [
            'Yes, as long as it is shorter than before',
            'Yes, whenever k is larger than the window',
            'No, it would include the labels just removed',
            'Only when some labels repeat inside it',
          ],
          2,
          'The loop removed exactly the labels that made the window invalid.',
        ),
        choose(
          'Why does left never need to move back to the left?',
          [
            'The map forgets every label that left has passed',
            'right moves back whenever left moves forward',
            'Windows always get shorter as right grows',
            'Extending right never lowers the distinct count',
          ],
          3,
          'A start that was invalid for an earlier right end stays invalid for later ones.',
        ),
        predictOutput(
          'What does this program print?',
          'labels = [1, 1, 2, 3]\nk = 2\ncounts = {}\nleft = 0\nfor right in range(len(labels)):\n    label = labels[right]\n    counts[label] = counts.get(label, 0) + 1\n    while len(counts) > k:\n        old = labels[left]\n        counts[old] -= 1\n        if counts[old] == 0:\n            del counts[old]\n        left += 1\n    print(left)',
          ['0\n0\n0\n2', '0\n0\n0\n1', '0\n1\n2\n3', '0\n0\n0\n3'],
          0,
          'When 3 enters, both 1s must leave before only two labels remain.',
        ),
      ],
    },
    {
      title: 'Linear time despite the nested loop',
      explanation: [
        'The inner while loop looks nested, but left only moves forward and advances at most n times over the whole run, while right advances n times. The total work is expected O(n). The map holds at most k + 1 keys at any moment, so the extra space is O(min(n, k + 1)). With k = 0 or an empty list the answer is 0.',
      ],
      example: {
        code: 'labels = ["a", "b", "c", "d", "e", "f"]\nk = 1\ncounts = {}\nleft = 0\nremovals = 0\nfor right in range(len(labels)):\n    label = labels[right]\n    counts[label] = counts.get(label, 0) + 1\n    while len(counts) > k:\n        old = labels[left]\n        counts[old] -= 1\n        if counts[old] == 0:\n            del counts[old]\n        left += 1\n        removals += 1\nprint(removals)\nprint(left)',
        output: '5\n5',
        explanation:
          'Even in this worst case each label is removed at most once: 5 removals in total, not one inner scan per right end.',
      },
      questions: [
        choose(
          'Over a whole run on n labels, how many removals can the inner loop perform in total?',
          ['At most n', 'At most n²', 'Exactly k', 'At most n · k'],
          0,
          'Each removal advances left, and left can advance at most n times.',
        ),
        choose(
          'What is the extra space of the frequency map when at most k distinct labels are allowed?',
          ['O(min(n, k + 1))', 'O(n²)', 'O(1) for every k', 'O(n · k)'],
          0,
          'The map briefly holds k + 1 keys before a repair, and never more keys than labels.',
        ),
        predictOutput(
          'What does this program print?',
          'def longest(labels, k):\n    counts = {}\n    left = 0\n    best = 0\n    for right in range(len(labels)):\n        label = labels[right]\n        counts[label] = counts.get(label, 0) + 1\n        while len(counts) > k:\n            old = labels[left]\n            counts[old] -= 1\n            if counts[old] == 0:\n                del counts[old]\n            left += 1\n        best = max(best, right - left + 1)\n    return best\n\nprint(longest([], 2))\nprint(longest(["a", "b"], 0))',
          ['0\n1', '0\n2', '0\n0', 'None\n0'],
          2,
          'An empty list has no window, and with k = 0 every label is removed as soon as it enters.',
        ),
        predictOutput(
          'What does this program print?',
          'labels = [1, 2, 3, 1, 2, 3]\nk = 2\ncounts = {}\nleft = 0\nremovals = 0\nfor right in range(len(labels)):\n    label = labels[right]\n    counts[label] = counts.get(label, 0) + 1\n    while len(counts) > k:\n        old = labels[left]\n        counts[old] -= 1\n        if counts[old] == 0:\n            del counts[old]\n        left += 1\n        removals += 1\nprint(removals)',
          ['6', '2', '4', '8'],
          2,
          'From the third label on, each new label forces exactly one removal.',
        ),
      ],
    },
  ],
  'cp-binary-midpoint': [
    {
      title: 'Floor division picks an index inside [low, high)',
      explanation: [
        'A half-open candidate interval [low, high) holds the indices low through high − 1. When low < high, mid = (low + high) // 2 always lies inside it: // rounds down to a whole number, so mid is at least low and strictly below high.',
      ],
      example: {
        code: 'def midpoint(low, high):\n    return (low + high) // 2\n\nprint(midpoint(2, 7))\nprint(midpoint(0, 4))\nprint(midpoint(5, 6))',
        output: '4\n2\n5',
        explanation:
          '9 // 2 rounds 4.5 down to 4. Every result lies inside its interval, including the one-index interval [5, 6).',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'print((3 + 8) // 2)',
          ['5.5', '6', '5', '11'],
          2,
          '11 // 2 rounds 5.5 down to the index 5.',
        ),
        predictOutput(
          'What does this program print?',
          'low = 10\nhigh = 13\nmid = (low + high) // 2\nprint(mid)\nprint(low <= mid < high)',
          ['11\nTrue', '11.5\nTrue', '12\nTrue', '11\nFalse'],
          0,
          '23 // 2 is 11, which is one of the candidates 10, 11 and 12.',
        ),
        choose(
          'Why compute the midpoint with // instead of /?',
          [
            '// rounds up, so mid never equals low',
            '/ is too slow when the integers are large',
            '// lets mid equal high when needed',
            '/ gives floats like 5.5, which are not indices',
          ],
          3,
          'Floor division keeps the midpoint a whole number that can index a list.',
        ),
        choose(
          'Which indices are candidates in the interval [6, 9)?',
          ['6, 7, 8 and 9', '7 and 8', '6, 7 and 8', '7, 8 and 9'],
          2,
          'Half-open: low is included and high is excluded.',
        ),
      ],
    },
    {
      title: 'One-index and empty intervals',
      explanation: [
        'For a one-index interval [low, low + 1), the midpoint is low itself, the only candidate. When low == high the interval is empty: there is nothing to examine, and (low + high) // 2 would equal high, which lies outside the interval. A search therefore checks low < high before it reads values[mid].',
      ],
      example: {
        code: 'low = 4\nhigh = 5\nprint((low + high) // 2)\nlow = 5\nhigh = 5\nprint(low < high)',
        output: '4\nFalse',
        explanation:
          'The one-index interval [4, 5) examines index 4. The interval [5, 5) is empty, so the search must stop.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'print((9 + 10) // 2)',
          ['9', '10', '9.5', '19'],
          0,
          '19 // 2 rounds down to 9, the only index in [9, 10).',
        ),
        predictOutput(
          'What does this program print?',
          'low = 3\nhigh = 3\nmid = (low + high) // 2\nprint(low <= mid < high)',
          ['True', '3', 'False', 'None'],
          2,
          'The interval [3, 3) is empty, so no midpoint can lie inside it.',
        ),
        choose(
          'When should a search stop instead of examining a midpoint?',
          [
            'When low < high',
            'When mid is 0',
            'When values repeat',
            'When low == high',
          ],
          3,
          'An empty interval has no candidate left to examine.',
        ),
        choose(
          'The interval [0, 2) has two candidates. Which one does the midpoint pick?',
          ['Index 0', 'Index 2', 'Index 0.5', 'Index 1'],
          3,
          '(0 + 2) // 2 is 1, which is inside the interval.',
        ),
      ],
    },
  ],
  'cp-binary-update': [
    {
      title: 'Skip a too-small midpoint, keep a qualifying one',
      explanation: [
        'A lower-bound search looks for the first index whose value is at least target in an ascending list. If values[mid] < target, mid and every index before it are too small, so set low = mid + 1. Otherwise mid qualifies and might be the first answer, so set high = mid, which keeps it in the undecided interval.',
      ],
      example: {
        code: 'values = [1, 4, 4, 8, 9]\ntarget = 5\nlow = 0\nhigh = 5\nmid = (low + high) // 2\nif values[mid] < target:\n    low = mid + 1\nelse:\n    high = mid\nprint(low)\nprint(high)',
        output: '3\n5',
        explanation:
          'The midpoint 2 holds 4, which is below 5, so indices 0 to 2 are ruled out and the interval becomes [3, 5).',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'values = [2, 5, 5, 9]\ntarget = 5\nlow = 0\nhigh = 4\nmid = (low + high) // 2\nif values[mid] < target:\n    low = mid + 1\nelse:\n    high = mid\nprint(low)\nprint(high)',
          ['3\n4', '0\n1', '0\n2', '2\n4'],
          2,
          'values[2] = 5 qualifies, so high becomes 2 and index 2 stays a possible answer.',
        ),
        predictOutput(
          'What does this program print?',
          'values = [1, 3, 6, 7, 10]\ntarget = 7\nlow = 0\nhigh = 5\nmid = (low + high) // 2\nif values[mid] < target:\n    low = mid + 1\nelse:\n    high = mid\nprint(low)\nprint(high)',
          ['2\n5', '3\n5', '0\n2', '3\n4'],
          1,
          'values[2] = 6 is below 7, so low moves past the midpoint to 3.',
        ),
        choose(
          'values[mid] is less than target. Which update is correct?',
          ['low = mid', 'low = mid + 1', 'high = mid', 'high = mid - 1'],
          1,
          'mid itself is too small, so the new interval must exclude it.',
        ),
        choose(
          'values[mid] is at least target. Why use high = mid rather than high = mid - 1?',
          [
            'mid is known to be too small',
            'mid may itself be the first answer',
            'high must always stay even',
            'mid - 1 could be negative',
          ],
          1,
          'Excluding mid could throw away the answer.',
        ),
      ],
    },
    {
      title: 'Every correct update shrinks the interval',
      explanation: [
        'Both updates strictly shrink a nonempty interval: low = mid + 1 moves past mid, and high = mid drops at least the last index because mid < high. A wrong update such as low = mid can leave a one-index interval unchanged, because there mid equals low, and the search would repeat forever.',
      ],
      example: {
        code: 'low = 4\nhigh = 5\nmid = (low + high) // 2\nprint(mid)\nprint(high - mid)\nprint(high - (mid + 1))',
        output: '4\n1\n0',
        explanation:
          'In [4, 5) the midpoint is 4. Setting low = mid would keep one candidate forever; low = mid + 1 empties the interval.',
      },
      questions: [
        predictOutput(
          'This loop uses a wrong update. What does it print?',
          'low = 0\nhigh = 1\nfor attempt in [1, 2, 3]:\n    mid = (low + high) // 2\n    low = mid\nprint(low)\nprint(high)',
          ['0\n1', '1\n1', '3\n1', '0\n0'],
          0,
          'mid is always 0, so low = mid never changes anything: the interval is stuck.',
        ),
        predictOutput(
          'What does this program print?',
          'low = 3\nhigh = 8\nmid = (low + high) // 2\nhigh = mid\nprint(high - low)',
          ['5', '3', '4', '2'],
          3,
          'mid is 5, so the interval shrinks from [3, 8) to [3, 5), which has two indices.',
        ),
        choose(
          'Why does low = mid + 1 always make progress?',
          [
            'mid is always larger than the old high value',
            'It halves the value of high on every step',
            'It sets low equal to the target value itself',
            'mid is at least low, so low rises above its old value',
          ],
          3,
          'The new low is greater than the old one, so the interval loses at least one index.',
        ),
        choose(
          'high - low is 1 and the midpoint qualifies. What is high - low after high = mid?',
          ['0', '1', '2', '-1'],
          0,
          'With one index, mid equals low, so high = mid empties the interval.',
        ),
      ],
    },
  ],
  'cp-binary-sentinel': [
    {
      title: 'A result of n means that no element qualifies',
      explanation: [
        'A lower-bound result is a boundary between 0 and n, not always an element index. If it equals n = len(values), no element is at least the target, and reading values[n] would raise IndexError. Check index < len(values) before reading the element.',
      ],
      example: {
        code: 'values = [3, 6, 9]\nfor index in [1, 3]:\n    if index < len(values):\n        print(values[index])\n    else:\n        print("none")',
        output: '6\nnone',
        explanation:
          'Index 1 is an element. Index 3 is the boundary after the list, which means "no qualifying value".',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'values = [2, 4]\nindex = 2\nif index < len(values):\n    print(values[index])\nelse:\n    print("none")',
          ['4', '2', 'IndexError', 'none'],
          3,
          'The boundary 2 equals the length, so it is checked before any read and reported as absence.',
        ),
        predictOutput(
          'What does this program print?',
          'values = [5, 7, 7]\nindex = 1\nif index < len(values):\n    print(values[index])\nelse:\n    print("none")',
          ['none', '5', '1', '7'],
          3,
          'Index 1 is inside the list, so its value is read.',
        ),
        choose(
          'A lower bound for target 50 in [10, 20, 30] returns 3. What does that mean?',
          [
            'No value is at least 50',
            'The value 30 qualifies',
            'The answer is at index 2',
            'The list must be re-sorted',
          ],
          0,
          'The boundary after the list says every value is smaller than the target.',
        ),
        choose(
          'What must happen before reading values[index] from a lower-bound result?',
          [
            'Subtract one from index',
            'Sort the values in reverse',
            'Check that index > 0',
            'Check that index < len(values)',
          ],
          3,
          'Only results below n refer to elements.',
        ),
      ],
    },
    {
      title: 'Edge boundaries, and what a boundary counts',
      explanation: [
        'For an empty list the only boundary is 0, which already equals n. A target no larger than the first value gives boundary 0, which is a valid index. Because every value before the boundary is smaller than the target, the boundary also counts: index values are below the target, and len(values) − index are at least it.',
      ],
      example: {
        code: 'values = [2, 5, 5, 9]\nindex = 1\nprint(index)\nprint(len(values) - index)\nempty = []\nprint(0 == len(empty))',
        output: '1\n3\nTrue',
        explanation:
          'The lower bound of 5 is 1: one value is below 5 and three are at least 5. For an empty list, 0 is both the only boundary and n.',
      },
      questions: [
        choose(
          'What is the lower-bound result for any target in an empty list?',
          ['-1', '1', '0', 'None'],
          2,
          'The interval [0, 0) is empty from the start, and 0 is its only boundary.',
        ),
        choose(
          'values = [4, 6, 8]. What is the lower bound for target 1?',
          ['1', '0', '3', '-1'],
          1,
          'Every value is at least 1, so the first qualifying index is 0.',
        ),
        predictOutput(
          'The lower bound of 3 in this list is index 1. What does this program print?',
          'values = [1, 3, 3, 3, 7]\nindex = 1\nprint(len(values) - index)',
          ['3', '1', '5', '4'],
          3,
          'Every value from index 1 on is at least 3: the three 3s and the 7.',
        ),
        choose(
          'A lower bound for target t returns 6 on a list of 10 values. How many values are smaller than t?',
          ['4', '6', '5', '7'],
          1,
          'All indices before the boundary hold values smaller than the target.',
        ),
      ],
    },
  ],
  'cp-binary-search': [
    {
      title: 'Loop until the interval is empty',
      explanation: [
        'The full lower-bound search repeats the midpoint step while low < high, starting from [0, n). When the loop ends, low == high is the first index whose value is at least target, or n if there is none. With duplicates it finds the first copy, not an arbitrary one.',
      ],
      example: {
        code: 'def lower_bound(values, target):\n    low = 0\n    high = len(values)\n    while low < high:\n        mid = (low + high) // 2\n        if values[mid] < target:\n            low = mid + 1\n        else:\n            high = mid\n    return low\n\nvalues = [3, 7, 7, 7, 12]\nprint(lower_bound(values, 7))\nprint(lower_bound(values, 8))\nprint(lower_bound(values, 13))',
        output: '1\n4\n5',
        explanation:
          'The first 7 is at index 1. The first value at least 8 is 12, at index 4. Nothing is at least 13, so the result is n = 5.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'def lower_bound(values, target):\n    low = 0\n    high = len(values)\n    while low < high:\n        mid = (low + high) // 2\n        if values[mid] < target:\n            low = mid + 1\n        else:\n            high = mid\n    return low\n\nprint(lower_bound([1, 2, 2, 2, 5], 2))',
          ['2', '3', '1', '0'],
          2,
          'Qualifying midpoints are kept, so the search settles on the first 2.',
        ),
        predictOutput(
          'What does this program print?',
          'def lower_bound(values, target):\n    low = 0\n    high = len(values)\n    while low < high:\n        mid = (low + high) // 2\n        if values[mid] < target:\n            low = mid + 1\n        else:\n            high = mid\n    return low\n\nprint(lower_bound([10, 20, 30], 25))',
          ['1', '3', '2', '25'],
          2,
          'The first value at least 25 is 30, at index 2.',
        ),
        predictOutput(
          'What does this program print?',
          'def lower_bound(values, target):\n    low = 0\n    high = len(values)\n    while low < high:\n        mid = (low + high) // 2\n        if values[mid] < target:\n            low = mid + 1\n        else:\n            high = mid\n    return low\n\nprint(lower_bound([4, 8], 9))',
          ['1', '2', '-1', '0'],
          1,
          'No value is at least 9, so the result is the boundary n = 2.',
        ),
        choose(
          'Several values equal the target. Which index does this search return?',
          [
            'The last index holding the target',
            'Any index that holds the target',
            'The first index holding the target',
            'The index just after the last copy',
          ],
          2,
          'A qualifying midpoint becomes high, so the search keeps moving toward earlier copies.',
        ),
      ],
    },
    {
      title: 'Trace the invariant',
      explanation: [
        'Throughout the loop, every index before low holds a value smaller than target, and every index at or after high holds a value at least target; only [low, high) is undecided. Each step moves one boundary and keeps both facts true. When the interval is empty, low sits exactly at the border between the two groups.',
      ],
      example: {
        code: 'values = [2, 4, 4, 6, 9, 11]\ntarget = 5\nlow = 0\nhigh = len(values)\nwhile low < high:\n    mid = (low + high) // 2\n    if values[mid] < target:\n        low = mid + 1\n    else:\n        high = mid\n    print((low, high))',
        output: '(0, 3)\n(2, 3)\n(3, 3)',
        explanation:
          '6 at index 3 qualifies, so high drops to 3. Then 4 at index 1 and 4 at index 2 are too small, so low rises to 3.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'values = [1, 3, 5, 7]\ntarget = 6\nlow = 0\nhigh = len(values)\nwhile low < high:\n    mid = (low + high) // 2\n    if values[mid] < target:\n        low = mid + 1\n    else:\n        high = mid\n    print((low, high))',
          [
            '(3, 4)\n(3, 3)',
            '(0, 2)\n(2, 2)',
            '(2, 4)\n(3, 3)',
            '(3, 4)\n(4, 4)',
          ],
          0,
          '5 at index 2 is too small, so low becomes 3; 7 at index 3 qualifies, so high becomes 3.',
        ),
        choose(
          'During the search, what is known about the indices before low?',
          [
            'Their values are all smaller than target',
            'Their values are all at least target',
            'They have not been examined yet',
            'They hold copies of the target',
          ],
          0,
          'low only moves past midpoints proven too small, and the list is sorted.',
        ),
        predictOutput(
          'What does this program print?',
          'values = [1, 2, 3, 4, 5, 6, 7, 8]\ntarget = 100\nlow = 0\nhigh = len(values)\nsteps = 0\nwhile low < high:\n    mid = (low + high) // 2\n    steps += 1\n    if values[mid] < target:\n        low = mid + 1\n    else:\n        high = mid\nprint(steps)',
          ['3', '8', '4', '7'],
          0,
          'The undecided interval shrinks from 8 to 3, then 1, then 0 indices: three steps.',
        ),
        choose(
          'The loop has ended with low == high == 4. What does index 4 mark?',
          [
            'The last position whose value is below target',
            'The midpoint of the whole list',
            'The number of steps the loop took',
            'The first position whose value is at least target',
          ],
          3,
          'Everything before 4 is smaller and everything from 4 on qualifies.',
        ),
      ],
    },
    {
      title: 'Cost and the sorted precondition',
      explanation: [
        'Each step removes about half of the undecided interval, so a list of n values needs O(log(n + 1)) steps and O(1) extra space; a million values take about 20 steps. The list must be sorted ascending: on unsorted data the discarded halves were never proven, and the result is meaningless. The returned n is a valid boundary but not a valid index.',
      ],
      example: {
        code: 'def lower_bound(values, target):\n    low = 0\n    high = len(values)\n    while low < high:\n        mid = (low + high) // 2\n        if values[mid] < target:\n            low = mid + 1\n        else:\n            high = mid\n    return low\n\nprint(lower_bound([9, 1, 7, 3], 3))\nprint(lower_bound([1, 3, 7, 9], 3))',
        output: '2\n1',
        explanation:
          'On the unsorted list the search returns 2 even though 9 at index 0 is already at least 3. Sorted, it correctly returns 1.',
      },
      questions: [
        choose(
          'About how many steps does a lower-bound search take on 10⁶ sorted values?',
          ['About 1,000', 'About 20', 'About 10⁶', 'About 500,000'],
          1,
          'Halving 10⁶ reaches 1 after about log₂(10⁶) ≈ 20 steps.',
        ),
        choose(
          'Why can binary search not be used on an unsorted list?',
          [
            'It would visit every element twice',
            'It needs the length to be a power of two',
            'An unsorted list has no midpoint',
            'One comparison says nothing about the discarded half',
          ],
          3,
          'The update rules rely on all earlier values being smaller and all later values being larger.',
        ),
        predictOutput(
          'What does this program print?',
          'def lower_bound(values, target):\n    low = 0\n    high = len(values)\n    while low < high:\n        mid = (low + high) // 2\n        if values[mid] < target:\n            low = mid + 1\n        else:\n            high = mid\n    return low\n\nprint(lower_bound([5, 5, 5], 5))\nprint(lower_bound([5, 5, 5], 6))',
          ['0\n3', '0\n2', '2\n3', '1\n3'],
          0,
          'Every value qualifies for 5, so the answer is 0; none qualifies for 6, so the answer is n.',
        ),
        predictOutput(
          'What does this program print?',
          'def lower_bound(values, target):\n    low = 0\n    high = len(values)\n    while low < high:\n        mid = (low + high) // 2\n        if values[mid] < target:\n            low = mid + 1\n        else:\n            high = mid\n    return low\n\nvalues = [1, 4, 4, 6, 8]\nprint(len(values) - lower_bound(values, 5))',
          ['3', '2', '1', '5'],
          1,
          'The lower bound of 5 is 3, so the two values from index 3 on are at least 5.',
        ),
      ],
    },
  ],
  'cp-capacity-groups': [
    {
      title: 'Greedily extend the current group',
      explanation: [
        'Loads must stay in order and be split into consecutive groups, each with a total of at most capacity. Test a capacity greedily: add the next load to the current group if it fits; otherwise close the group and start a new one with that load. With nonnegative loads, filling each group as far as possible never needs more groups than any other valid split.',
      ],
      example: {
        code: 'weights = [4, 3, 5, 2, 6]\ncapacity = 8\ngroups = 1\ncurrent = 0\nfor weight in weights:\n    if current + weight > capacity:\n        groups += 1\n        current = weight\n    else:\n        current += weight\n    print(current)\nprint(groups)',
        output: '4\n7\n5\n7\n6\n3',
        explanation:
          '4 and 3 share a group (7). 5 would make 12, so it opens a second group; 2 joins it (7). 6 would make 13, so it opens a third.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'def groups_for(weights, capacity):\n    groups = 1\n    current = 0\n    for weight in weights:\n        if current + weight > capacity:\n            groups += 1\n            current = weight\n        else:\n            current += weight\n    return groups\n\nprint(groups_for([2, 2, 2, 2], 4))',
          ['4', '1', '3', '2'],
          3,
          'Each group holds two loads of 2 exactly at capacity.',
        ),
        predictOutput(
          'What does this program print?',
          'def groups_for(weights, capacity):\n    groups = 1\n    current = 0\n    for weight in weights:\n        if current + weight > capacity:\n            groups += 1\n            current = weight\n        else:\n            current += weight\n    return groups\n\nprint(groups_for([5, 1, 1, 5], 6))',
          ['3', '4', '1', '2'],
          3,
          '5 + 1 reaches 6; the next 1 overflows and starts a group that the last 5 then fills to 6.',
        ),
        predictOutput(
          'What does this program print?',
          'def groups_for(weights, capacity):\n    groups = 1\n    current = 0\n    for weight in weights:\n        if current + weight > capacity:\n            groups += 1\n            current = weight\n        else:\n            current += weight\n    return groups\n\nprint(groups_for([3, 6, 3], 8))',
          ['2', '1', '3', '4'],
          2,
          '3 + 6 and 6 + 3 both exceed 8, so every load sits in its own group.',
        ),
        choose(
          'When does the greedy test open a new group?',
          [
            'When adding the next load would exceed capacity',
            'After every load, to keep the groups small',
            'Whenever two neighboring loads differ',
            'Whenever the current group holds two loads',
          ],
          0,
          'A group is closed only when the next load cannot join it.',
        ),
      ],
    },
    {
      title: 'Oversized loads, empty input and nonnegative loads',
      explanation: [
        'A single load larger than capacity can never fit, because loads cannot be split, so that capacity is impossible and the test reports None. With no loads, zero groups are needed. The greedy rule also needs nonnegative loads: with a negative load, a later load could cancel an apparent overflow, so closing a group early could be a mistake.',
      ],
      example: {
        code: 'def groups_for(weights, capacity):\n    if len(weights) == 0:\n        return 0\n    groups = 1\n    current = 0\n    for weight in weights:\n        if weight > capacity:\n            return None\n        if current + weight > capacity:\n            groups += 1\n            current = weight\n        else:\n            current += weight\n    return groups\n\nprint(groups_for([], 5))\nprint(groups_for([2, 9, 1], 5))\nprint(groups_for([0, 5, 0, 5], 5))',
        output: '0\nNone\n2',
        explanation:
          'No loads need no groups. The 9 cannot fit in capacity 5. Zero loads ride along for free, so the last case needs two groups.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'def groups_for(weights, capacity):\n    if len(weights) == 0:\n        return 0\n    groups = 1\n    current = 0\n    for weight in weights:\n        if weight > capacity:\n            return None\n        if current + weight > capacity:\n            groups += 1\n            current = weight\n        else:\n            current += weight\n    return groups\n\nprint(groups_for([4, 4, 4], 3))',
          ['3', '4', 'None', '0'],
          2,
          'Every load exceeds the capacity 3, so the capacity is impossible.',
        ),
        predictOutput(
          'What does this program print?',
          'def groups_for(weights, capacity):\n    if len(weights) == 0:\n        return 0\n    groups = 1\n    current = 0\n    for weight in weights:\n        if weight > capacity:\n            return None\n        if current + weight > capacity:\n            groups += 1\n            current = weight\n        else:\n            current += weight\n    return groups\n\nprint(groups_for([3], 3))',
          ['None', '0', '2', '1'],
          3,
          'A load equal to the capacity fits exactly in one group.',
        ),
        choose(
          'Why does a load larger than the capacity make that capacity impossible?',
          [
            'Larger loads must always come first',
            'Loads cannot be split across groups',
            'Groups must all have equal totals',
            'The test allows only two groups',
          ],
          1,
          'The oversized load needs a group of its own that still exceeds the capacity.',
        ),
        choose(
          'Why does the greedy overflow rule require nonnegative loads?',
          [
            'Negative loads cannot be added to totals',
            'A later negative load could cancel an apparent overflow',
            'Negative loads make the list unsorted',
            'Zero loads would be counted twice',
          ],
          1,
          'With negatives, a total that is too large now could become acceptable later.',
        ),
      ],
    },
  ],
  'cp-capacity-feasible': [
    {
      title: 'Turn the group count into True or False',
      explanation: [
        'With a budget of max_groups groups, a capacity is feasible when no load is oversized and the greedy test needs at most max_groups groups. That gives a yes-or-no predicate for each proposed capacity, which is exactly what a search over capacities needs.',
      ],
      example: {
        code: 'def fits(weights, max_groups, capacity):\n    groups = 1\n    current = 0\n    for weight in weights:\n        if weight > capacity:\n            return False\n        if current + weight > capacity:\n            groups += 1\n            current = weight\n        else:\n            current += weight\n    return groups <= max_groups\n\nprint(fits([3, 5, 2, 4], 2, 8))\nprint(fits([3, 5, 2, 4], 2, 7))',
        output: 'True\nFalse',
        explanation:
          'Capacity 8 allows [3, 5] and [2, 4]. Capacity 7 needs three groups, which exceeds the budget of two.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'def fits(weights, max_groups, capacity):\n    groups = 1\n    current = 0\n    for weight in weights:\n        if weight > capacity:\n            return False\n        if current + weight > capacity:\n            groups += 1\n            current = weight\n        else:\n            current += weight\n    return groups <= max_groups\n\nprint(fits([4, 4, 4, 4], 2, 8))',
          ['True', 'False', '2', 'None'],
          0,
          'Two groups of 4 + 4 fit exactly, which meets the budget.',
        ),
        predictOutput(
          'What does this program print?',
          'def fits(weights, max_groups, capacity):\n    groups = 1\n    current = 0\n    for weight in weights:\n        if weight > capacity:\n            return False\n        if current + weight > capacity:\n            groups += 1\n            current = weight\n        else:\n            current += weight\n    return groups <= max_groups\n\nprint(fits([4, 4, 4, 4], 2, 7))',
          ['True', 'False', '4', 'None'],
          1,
          'With capacity 7 each load needs its own group: four groups exceed the budget of two.',
        ),
        predictOutput(
          'What does this program print?',
          'def fits(weights, max_groups, capacity):\n    groups = 1\n    current = 0\n    for weight in weights:\n        if weight > capacity:\n            return False\n        if current + weight > capacity:\n            groups += 1\n            current = weight\n        else:\n            current += weight\n    return groups <= max_groups\n\nprint(fits([1, 9, 1], 3, 8))',
          ['True', 'None', 'False', '3'],
          2,
          'The load 9 exceeds the capacity, so no number of groups helps.',
        ),
        choose(
          'The greedy test needs 3 groups and the budget is 3. Is the capacity feasible?',
          [
            'No, it must use fewer groups',
            'Yes, 3 is within the budget',
            'Only if every group is full',
            'Only for sorted loads',
          ],
          1,
          'Feasibility asks for at most max_groups groups.',
        ),
      ],
    },
    {
      title: 'Feasibility is monotone in the capacity',
      explanation: [
        'If a grouping fits at capacity c, the very same grouping fits at any larger capacity, so feasibility can only change from False to True as capacity grows, never back. Listed over increasing capacities, the predicate is a run of False followed by a run of True; the smallest feasible capacity is the first True.',
      ],
      example: {
        code: 'def fits(weights, max_groups, capacity):\n    groups = 1\n    current = 0\n    for weight in weights:\n        if weight > capacity:\n            return False\n        if current + weight > capacity:\n            groups += 1\n            current = weight\n        else:\n            current += weight\n    return groups <= max_groups\n\nfor capacity in [5, 6, 7, 8, 9]:\n    print(fits([3, 5, 2, 4], 2, capacity))',
        output: 'False\nFalse\nFalse\nTrue\nTrue',
        explanation:
          'Capacities 5 to 7 all need more than two groups. From 8 on, two groups are enough.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'def fits(weights, max_groups, capacity):\n    groups = 1\n    current = 0\n    for weight in weights:\n        if weight > capacity:\n            return False\n        if current + weight > capacity:\n            groups += 1\n            current = weight\n        else:\n            current += weight\n    return groups <= max_groups\n\nfor capacity in [3, 4, 5, 6]:\n    print(fits([2, 2, 2], 2, capacity))',
          [
            'False\nTrue\nTrue\nTrue',
            'False\nTrue\nFalse\nTrue',
            'True\nTrue\nTrue\nTrue',
            'False\nFalse\nTrue\nTrue',
          ],
          0,
          'Capacity 3 needs three groups; from 4 on, [2, 2] and [2] fit in two.',
        ),
        choose(
          'For capacities in increasing order, which sequence of fits results is possible?',
          [
            'True, False, True, True',
            'False, True, False, True',
            'False, False, True, True',
            'True, True, False, False',
          ],
          2,
          'Once feasible, every larger capacity stays feasible.',
        ),
        choose(
          'fits is True at capacity 12. What can you conclude about capacity 15?',
          [
            'It is infeasible',
            'It needs more groups',
            'Nothing can be concluded',
            'It is also feasible',
          ],
          3,
          'The grouping that worked at 12 still works at 15.',
        ),
        choose(
          'Why does a grouping that fits at capacity c also fit at c + 1?',
          [
            'Larger capacities always use fewer loads',
            'The greedy test re-sorts the loads',
            'The budget of groups grows with capacity',
            'Every group total is still within the larger limit',
          ],
          3,
          'Raising the limit cannot make an accepted total too large.',
        ),
      ],
    },
  ],
  'cp-capacity-bounds': [
    {
      title: 'The largest load and the total bracket the answer',
      explanation: [
        'For nonempty, nonnegative loads, every feasible capacity is at least max(weights), because the largest load must fit in some group. And sum(weights) is always feasible when at least one group is allowed: put every load in one group. So the smallest feasible capacity lies in [max(weights), sum(weights)].',
      ],
      example: {
        code: 'weights = [7, 2, 5, 1]\nprint(max(weights))\nprint(sum(weights))',
        output: '7\n15',
        explanation:
          'No capacity below 7 can hold the load 7, and 15 always works with a single group.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'weights = [4, 9, 3]\nprint(max(weights))\nprint(sum(weights))',
          ['3\n16', '9\n9', '4\n16', '9\n16'],
          3,
          'The lower bound is the largest load and the upper bound is the total.',
        ),
        choose(
          'Why can no capacity below the largest load be feasible?',
          [
            'The total would exceed the budget',
            'Groups would need equal totals',
            'That load could not fit in any group',
            'The loads would have to be sorted',
          ],
          2,
          'Loads are indivisible, so each one must fit within the capacity.',
        ),
        choose(
          'Why is the total of all loads always feasible when max_groups >= 1?',
          [
            'One group can hold every load',
            'It equals the largest load',
            'Each group then holds one load',
            'It doubles the smallest load',
          ],
          0,
          'A single group of everything has exactly the total.',
        ),
        choose(
          'Loads are [6, 6, 6]. Which interval must contain the smallest feasible capacity?',
          ['[0, 18]', '[6, 6]', '[6, 18]', '[1, 6]'],
          2,
          'From the largest load to the total.',
        ),
      ],
    },
    {
      title: 'Edge cases of the bounds',
      explanation: [
        'With no loads there is nothing to place, so the bounds are (0, 0). The group budget decides where in the range the answer falls: with one group the answer is the total, and with at least as many groups as loads every load can sit alone, so the answer is the largest load. Extra groups never push the answer below the largest load.',
      ],
      example: {
        code: 'def bounds(weights):\n    if len(weights) == 0:\n        return (0, 0)\n    return (max(weights), sum(weights))\n\nprint(bounds([]))\nprint(bounds([5]))\nprint(bounds([2, 8, 3]))',
        output: '(0, 0)\n(5, 5)\n(8, 13)',
        explanation:
          'Empty input uses (0, 0). A single load is both bounds. Otherwise the range runs from the largest load to the total.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'def bounds(weights):\n    if len(weights) == 0:\n        return (0, 0)\n    return (max(weights), sum(weights))\n\nprint(bounds([0, 0]))',
          ['(0, 1)', '(0, 0)', '(None, None)', '(1, 0)'],
          1,
          'Both the largest load and the total are 0.',
        ),
        choose(
          'Loads are [3, 8, 2] and only 1 group is allowed. What is the smallest feasible capacity?',
          ['13', '8', '3', '11'],
          0,
          'One group must hold everything, so the answer is the total.',
        ),
        choose(
          'Loads are [3, 8, 2] and 3 groups are allowed. What is the smallest feasible capacity?',
          ['13', '5', '3', '8'],
          3,
          'Each load can sit alone, so only the largest load matters.',
        ),
        choose(
          'The budget grows from 9 to 10 groups for 5 loads. Can the answer fall below the largest load?',
          [
            'Yes, by about one tenth',
            'Yes, down to the average load',
            'No, the largest load must still fit',
            'Only if the loads are sorted',
          ],
          2,
          'The largest load is a lower bound for every budget.',
        ),
      ],
    },
  ],
  'cp-search-answer': [
    {
      title: 'Binary search the capacity with the feasibility test',
      explanation: [
        'The smallest feasible capacity is the first True of a monotone predicate, so binary search can run over the answer itself. Search [max(weights), sum(weights)]: if fits(mid), mid might be the answer, so set high = mid; otherwise set low = mid + 1. When low meets high, that capacity is the smallest feasible one. Here fits is defined inside the function so that it can use weights and max_groups directly.',
      ],
      example: {
        code: 'def smallest_capacity(weights, max_groups):\n    if len(weights) == 0:\n        return 0\n    def fits(capacity):\n        groups = 1\n        current = 0\n        for weight in weights:\n            if weight > capacity:\n                return False\n            if current + weight > capacity:\n                groups += 1\n                current = weight\n            else:\n                current += weight\n        return groups <= max_groups\n    low = max(weights)\n    high = sum(weights)\n    while low < high:\n        mid = (low + high) // 2\n        if fits(mid):\n            high = mid\n        else:\n            low = mid + 1\n    return low\n\nprint(smallest_capacity([7, 2, 5, 10, 8], 2))',
        output: '18',
        explanation:
          'The best split is [7, 2, 5] and [10, 8]: capacity 18. Every smaller capacity needs a third group.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'def smallest_capacity(weights, max_groups):\n    if len(weights) == 0:\n        return 0\n    def fits(capacity):\n        groups = 1\n        current = 0\n        for weight in weights:\n            if weight > capacity:\n                return False\n            if current + weight > capacity:\n                groups += 1\n                current = weight\n            else:\n                current += weight\n        return groups <= max_groups\n    low = max(weights)\n    high = sum(weights)\n    while low < high:\n        mid = (low + high) // 2\n        if fits(mid):\n            high = mid\n        else:\n            low = mid + 1\n    return low\n\nprint(smallest_capacity([1, 2, 3, 4, 5], 2))',
          ['10', '15', '9', '5'],
          2,
          'The split [1, 2, 3, 4] and [5] needs 10, but [1, 2, 3] and [4, 5] needs only 9.',
        ),
        predictOutput(
          'What does this program print?',
          'def smallest_capacity(weights, max_groups):\n    if len(weights) == 0:\n        return 0\n    def fits(capacity):\n        groups = 1\n        current = 0\n        for weight in weights:\n            if weight > capacity:\n                return False\n            if current + weight > capacity:\n                groups += 1\n                current = weight\n            else:\n                current += weight\n        return groups <= max_groups\n    low = max(weights)\n    high = sum(weights)\n    while low < high:\n        mid = (low + high) // 2\n        if fits(mid):\n            high = mid\n        else:\n            low = mid + 1\n    return low\n\nprint(smallest_capacity([4, 4, 4, 4], 4))',
          ['16', '4', '8', '1'],
          1,
          'With one group per load, the answer is the largest load.',
        ),
        predictOutput(
          'What does this program print?',
          'def smallest_capacity(weights, max_groups):\n    if len(weights) == 0:\n        return 0\n    def fits(capacity):\n        groups = 1\n        current = 0\n        for weight in weights:\n            if weight > capacity:\n                return False\n            if current + weight > capacity:\n                groups += 1\n                current = weight\n            else:\n                current += weight\n        return groups <= max_groups\n    low = max(weights)\n    high = sum(weights)\n    while low < high:\n        mid = (low + high) // 2\n        if fits(mid):\n            high = mid\n        else:\n            low = mid + 1\n    return low\n\nprint(smallest_capacity([4, 4, 4, 4], 1))',
          ['4', '8', '12', '16'],
          3,
          'A single group must hold everything.',
        ),
        choose(
          'fits(mid) is True. Which update keeps the answer inside [low, high]?',
          ['low = mid + 1', 'high = mid - 1', 'high = mid', 'low = mid'],
          2,
          'mid is feasible and may be the smallest feasible capacity, so it must stay in range.',
        ),
      ],
    },
    {
      title: 'Trace the bounds of the answer search',
      explanation: [
        'Invariant: high is always feasible (it starts at the total) and every capacity below low is infeasible (it starts at the largest load). Each step tests one midpoint and moves one bound, so the smallest feasible capacity stays inside [low, high] until the bounds meet.',
      ],
      example: {
        code: 'def fits(weights, max_groups, capacity):\n    groups = 1\n    current = 0\n    for weight in weights:\n        if weight > capacity:\n            return False\n        if current + weight > capacity:\n            groups += 1\n            current = weight\n        else:\n            current += weight\n    return groups <= max_groups\n\nweights = [3, 5, 2, 4]\nlow = max(weights)\nhigh = sum(weights)\nprint((low, high))\nwhile low < high:\n    mid = (low + high) // 2\n    if fits(weights, 2, mid):\n        high = mid\n    else:\n        low = mid + 1\n    print((low, high))',
        output: '(5, 14)\n(5, 9)\n(8, 9)\n(8, 8)',
        explanation:
          'The search starts at (5, 14). 9 is feasible, 7 is not, 8 is: the bounds close in on 8.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'def fits(weights, max_groups, capacity):\n    groups = 1\n    current = 0\n    for weight in weights:\n        if weight > capacity:\n            return False\n        if current + weight > capacity:\n            groups += 1\n            current = weight\n        else:\n            current += weight\n    return groups <= max_groups\n\nweights = [6, 2, 3]\nlow = max(weights)\nhigh = sum(weights)\nprint((low, high))\nwhile low < high:\n    mid = (low + high) // 2\n    if fits(weights, 2, mid):\n        high = mid\n    else:\n        low = mid + 1\n    print((low, high))',
          [
            '(6, 11)\n(9, 11)\n(10, 11)\n(11, 11)',
            '(6, 11)\n(6, 8)\n(7, 8)\n(8, 8)',
            '(6, 11)\n(6, 8)\n(6, 7)\n(6, 6)',
            '(6, 11)\n(6, 8)\n(6, 7)\n(7, 7)',
          ],
          2,
          'Capacities 8, 7 and 6 are all feasible ([6] and [2, 3]), so high keeps falling until it meets low at 6.',
        ),
        choose(
          'Throughout the search, which statement about high is true?',
          [
            'high is always infeasible',
            'high always equals the total',
            'high is always a feasible capacity',
            'high is always the largest load',
          ],
          2,
          'It starts at the total and only ever moves to midpoints that tested feasible.',
        ),
        choose(
          'fits(mid) is False. Why is low = mid + 1 safe?',
          [
            'By monotonicity, every capacity up to mid is infeasible',
            'mid + 1 is then always a feasible capacity',
            'The answer must then be the total of the loads',
            'Loads larger than mid are removed from the list',
          ],
          0,
          'If mid fails, every smaller capacity fails too.',
        ),
        predictOutput(
          'What does this program print?',
          'def fits(weights, max_groups, capacity):\n    groups = 1\n    current = 0\n    for weight in weights:\n        if weight > capacity:\n            return False\n        if current + weight > capacity:\n            groups += 1\n            current = weight\n        else:\n            current += weight\n    return groups <= max_groups\n\nweights = [3, 5, 2, 4]\nlow = max(weights)\nhigh = sum(weights)\ntests = 0\nwhile low < high:\n    mid = (low + high) // 2\n    tests += 1\n    if fits(weights, 2, mid):\n        high = mid\n    else:\n        low = mid + 1\nprint(tests)',
          ['10', '9', '3', '14'],
          2,
          'The search tests 9, 7 and 8, instead of trying every capacity from 5 to 14.',
        ),
      ],
    },
    {
      title: 'Cost and preconditions of the answer search',
      explanation: [
        'Each feasibility test is one O(n) scan, and the search over [max, total] needs O(log(S + 1)) tests for total S, so the method costs O(n log(S + 1)) time and O(1) extra space. Trying every capacity upward from the largest load could take O(n · S). The method relies on nonnegative loads for the greedy test and on monotone feasibility; empty input returns 0.',
      ],
      example: {
        code: 'def fits(weights, max_groups, capacity):\n    groups = 1\n    current = 0\n    for weight in weights:\n        if weight > capacity:\n            return False\n        if current + weight > capacity:\n            groups += 1\n            current = weight\n        else:\n            current += weight\n    return groups <= max_groups\n\nweights = [7, 2, 5, 10, 8]\ncapacity = max(weights)\nlinear_tests = 1\nwhile not fits(weights, 2, capacity):\n    capacity += 1\n    linear_tests += 1\nlow = max(weights)\nhigh = sum(weights)\nbinary_tests = 0\nwhile low < high:\n    mid = (low + high) // 2\n    binary_tests += 1\n    if fits(weights, 2, mid):\n        high = mid\n    else:\n        low = mid + 1\nprint(capacity)\nprint(linear_tests)\nprint(low)\nprint(binary_tests)',
        output: '18\n9\n18\n4',
        explanation:
          'Both methods find 18, but trying capacities upward needs 9 tests while binary search needs 4. The gap grows quickly with the total.',
      },
      questions: [
        choose(
          'There are 10⁵ loads with total S ≈ 10⁹. About how many greedy scans does the binary search run?',
          ['About 10⁵', 'About 30', 'About 10⁹', 'About 1,000'],
          1,
          'log₂(10⁹) is about 30.',
        ),
        choose(
          'What is the overall time of the answer search for n loads with total S?',
          ['O(n · (S + 1))', 'O(n log(S + 1))', 'O(log(S + 1))', 'O(n² log S)'],
          1,
          'O(log(S + 1)) tests, each an O(n) scan.',
        ),
        predictOutput(
          'What does this program print?',
          'def smallest_capacity(weights, max_groups):\n    if len(weights) == 0:\n        return 0\n    def fits(capacity):\n        groups = 1\n        current = 0\n        for weight in weights:\n            if weight > capacity:\n                return False\n            if current + weight > capacity:\n                groups += 1\n                current = weight\n            else:\n                current += weight\n        return groups <= max_groups\n    low = max(weights)\n    high = sum(weights)\n    while low < high:\n        mid = (low + high) // 2\n        if fits(mid):\n            high = mid\n        else:\n            low = mid + 1\n    return low\n\nprint(smallest_capacity([], 3))\nprint(smallest_capacity([9], 3))',
          ['0\n3', '0\n9', 'None\n9', '0\n27'],
          1,
          'Empty input needs no capacity, and a single load needs exactly its own size.',
        ),
        choose(
          'Some loads are negative. Why is this method no longer trustworthy?',
          [
            'Binary search cannot handle negative midpoints',
            'The total becomes smaller than every load',
            'Negative loads make the list unsorted',
            'The greedy test may close a group that a later load would shrink',
          ],
          3,
          'The greedy proof needs totals that never decrease as loads are added.',
        ),
      ],
    },
  ],
  'cp-compress-unique': [
    {
      title: 'sorted(set(values)) lists each coordinate once, in order',
      explanation: [
        'Coordinate compression starts from the distinct coordinates in ascending order. set(values) keeps one copy of each value, and sorted(...) returns those values as an ascending list. Negative and widely separated values are ordered like any others.',
      ],
      example: {
        code: 'values = [40, -3, 40, 7, -3]\nprint(sorted(set(values)))',
        output: '[-3, 7, 40]',
        explanation:
          'Five values contain three distinct coordinates, listed from smallest to largest.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'print(sorted(set([8, -1, 8, 4])))',
          ['[-1, 4, 8]', '[-1, 4, 8, 8]', '[8, -1, 4]', '[0, 1, 2]'],
          0,
          'The duplicate 8 is stored once, and the rest are sorted.',
        ),
        predictOutput(
          'What does this program print?',
          'print(len(sorted(set([5, 5, 5, 5]))))',
          ['4', '5', '1', '0'],
          2,
          'Four copies of one coordinate leave a single distinct value.',
        ),
        predictOutput(
          'What does this program print?',
          'values = [3, 1, 3]\nunique = sorted(set(values))\nprint(values)',
          ['[1, 3]', '[3, 1, 3]', '[1, 3, 3]', '[3, 1]'],
          1,
          'set() and sorted() build new objects; the original list is unchanged.',
        ),
        choose(
          'Why remove duplicates before assigning ranks?',
          [
            'Duplicates would make sorting fail',
            'Equal coordinates must share one rank',
            'Ranks must preserve the gaps between values',
            'Each occurrence needs its own rank',
          ],
          1,
          'Each distinct coordinate gets exactly one position in the vocabulary.',
        ),
      ],
    },
    {
      title: 'Why both steps are needed',
      explanation: [
        'A set has no guaranteed order, so it must be sorted before positions mean anything; sorting alone keeps the duplicates. The unique list is a vocabulary: its length u is the number of ranks, at most n. It does not translate the original sequence yet; that is a later step.',
      ],
      example: {
        code: 'values = [12, -5, 12, 0]\nprint(sorted(values))\nprint(sorted(set(values)))\nprint(len(sorted(set(values))))',
        output: '[-5, 0, 12, 12]\n[-5, 0, 12]\n3',
        explanation:
          'Sorting alone keeps both 12s. Removing duplicates first leaves three coordinates, so there will be three ranks.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'values = [6, 2, 6]\nprint(sorted(values))\nprint(sorted(set(values)))',
          [
            '[2, 6]\n[2, 6]',
            '[2, 6, 6]\n[2, 6, 6]',
            '[2, 6, 6]\n[2, 6]',
            '[6, 2, 6]\n[2, 6]',
          ],
          2,
          'Only the version built from a set drops the duplicate.',
        ),
        choose(
          'Why is set(values) alone not enough to assign ranks?',
          [
            'A set has no guaranteed ascending order',
            'A set keeps every duplicate',
            'Sets cannot hold negative numbers',
            'A set changes the original list',
          ],
          0,
          'Ranks are positions in ascending order, which only sorting provides.',
        ),
        choose(
          'Ten values contain 4 distinct coordinates. How many ranks will there be?',
          ['10', '6', '4', '14'],
          2,
          'One rank per distinct coordinate.',
        ),
        predictOutput(
          'What does this program print?',
          'unique = sorted(set([100, -100, 0, 100]))\nprint(unique[0])\nprint(unique[-1])',
          ['100\n100', '-100\n0', '-100\n100', '0\n100'],
          2,
          'The vocabulary runs from the smallest to the largest coordinate.',
        ),
      ],
    },
  ],
  'cp-compress-ranks': [
    {
      title: 'A rank is a position in the unique list',
      explanation: [
        'Each coordinate’s rank is its zero-based index in the sorted unique list. Building a dictionary ranks[coordinate] = index once makes every later translation an expected O(1) lookup instead of a search through the list.',
      ],
      example: {
        code: 'unique = [-3, 7, 40]\nranks = {}\nfor index in range(len(unique)):\n    ranks[unique[index]] = index\nprint(ranks)\nprint(ranks[40])',
        output: '{-3: 0, 7: 1, 40: 2}\n2',
        explanation:
          'Each coordinate maps to its position in the vocabulary: 40 is third, so its rank is 2.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'unique = [2, 9, 15, 30]\nranks = {}\nfor index in range(len(unique)):\n    ranks[unique[index]] = index\nprint(ranks[15])',
          ['3', '2', '15', '1'],
          1,
          '15 is at index 2 of the unique list.',
        ),
        predictOutput(
          'What does this program print?',
          'unique = [-8, 0, 5]\nranks = {}\nfor index in range(len(unique)):\n    ranks[unique[index]] = index\nprint(ranks)',
          [
            '{-8: 0, 0: 1, 5: 2}',
            '{0: -8, 1: 0, 2: 5}',
            '{-8: 1, 0: 2, 5: 3}',
            '{-8: 0, 0: 0, 5: 5}',
          ],
          0,
          'Keys are coordinates and values are their zero-based positions.',
        ),
        choose(
          'What rank does the smallest distinct coordinate receive?',
          ['1', '-1', '0', 'Its own value'],
          2,
          'It is first in the ascending list, at index 0.',
        ),
        choose(
          'Why build a coordinate-to-rank dictionary instead of searching the unique list each time?',
          [
            'The list would otherwise lose its order',
            'Dictionaries store the distances between values',
            'Searching would change the ranks',
            'Each lookup becomes expected O(1)',
          ],
          3,
          'A list search is O(u) per lookup; a dictionary lookup is expected constant time.',
        ),
      ],
    },
    {
      title: 'Ranks keep order, not distance',
      explanation: [
        'If x < y then ranks[x] < ranks[y], and equal values have equal ranks, so every comparison between coordinates gives the same answer on their ranks. Distances are not kept: 10 and 1,000 may receive neighboring ranks. The largest rank is u − 1 for u distinct coordinates.',
      ],
      example: {
        code: 'unique = [10, 1000, 1001]\nranks = {}\nfor index in range(len(unique)):\n    ranks[unique[index]] = index\nprint(ranks[1000] - ranks[10])\nprint(1000 - 10)\nprint(ranks[1001] - ranks[1000])',
        output: '1\n990\n1',
        explanation:
          'A gap of 990 and a gap of 1 both become a rank difference of 1.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'unique = [-50, 3, 4, 900]\nranks = {}\nfor index in range(len(unique)):\n    ranks[unique[index]] = index\nprint(ranks[900] - ranks[-50])',
          ['950', '4', '897', '3'],
          3,
          'The ranks are 0 and 3; the real distance of 950 is not kept.',
        ),
        choose(
          'ranks[x] < ranks[y]. What do you know about the coordinates?',
          [
            'y - x = 1',
            'x and y are neighbors in the input',
            'x < y',
            'x is negative',
          ],
          2,
          'Ranks preserve order, and nothing more.',
        ),
        choose(
          'Coordinates 5 and 500 receive neighboring ranks. What does that tell you?',
          [
            'They differ by exactly one',
            'No other distinct coordinate lies between them',
            'They are next to each other in the input',
            'The ranking contains a mistake',
          ],
          1,
          'Neighboring ranks mean neighbors in sorted order of the distinct values.',
        ),
        predictOutput(
          'What does this program print?',
          'values = [7, 7, 3, 9, 3, 1]\nunique = sorted(set(values))\nranks = {}\nfor index in range(len(unique)):\n    ranks[unique[index]] = index\nprint(ranks[9])',
          ['5', '2', '3', '9'],
          2,
          'The vocabulary is [1, 3, 7, 9], so 9 is at index 3.',
        ),
      ],
    },
  ],
  'cp-compress-translate': [
    {
      title: 'Translate every occurrence in its original position',
      explanation: [
        'After building the rank map, scan the original sequence and append ranks[value] for each occurrence. The output has the same length and order as the input and repeats a rank wherever the input repeats a value; only the representation changes.',
      ],
      example: {
        code: 'values = [40, -3, 40, 7]\nranks = {-3: 0, 7: 1, 40: 2}\ntranslated = []\nfor value in values:\n    translated.append(ranks[value])\nprint(translated)',
        output: '[2, 0, 2, 1]',
        explanation:
          'Each occurrence becomes its rank in place: both 40s become 2.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'values = [9, 1, 9]\nranks = {1: 0, 9: 1}\ntranslated = []\nfor value in values:\n    translated.append(ranks[value])\nprint(translated)',
          ['[0, 1]', '[1, 0, 1]', '[0, 1, 1]', '[9, 1, 9]'],
          1,
          'Order and repetition are kept; only the values are replaced.',
        ),
        predictOutput(
          'What does this program print?',
          'values = [5, 5, 5]\nranks = {5: 0}\ntranslated = []\nfor value in values:\n    translated.append(ranks[value])\nprint(translated)',
          ['[0]', '[0, 1, 2]', '[5, 5, 5]', '[0, 0, 0]'],
          3,
          'Every occurrence of 5 maps to the same rank 0.',
        ),
        choose(
          'What is the length of the translated sequence?',
          [
            'The number of distinct values',
            'The largest rank plus one',
            'The size of the rank map',
            'The length of the original sequence',
          ],
          3,
          'One rank is appended per original occurrence.',
        ),
        choose(
          'A function returns sorted(set(values)) instead of the translated ranks. What does it lose?',
          [
            'The original order and repeated occurrences',
            'The ascending order of the values',
            'The smallest coordinate of the input',
            'Nothing; both answers are equal',
          ],
          0,
          'The vocabulary describes the distinct values, not the sequence.',
        ),
      ],
    },
    {
      title: 'Ranks as compact list indices',
      explanation: [
        'Translated ranks run from 0 to u − 1, so they can index a list of length u even when the original coordinates are huge or negative. Counting occurrences per coordinate, for example, needs u counters instead of one for every possible coordinate.',
      ],
      example: {
        code: 'values = [1000000, -7, 1000000, 42]\nranks = {-7: 0, 42: 1, 1000000: 2}\ncounts = [0, 0, 0]\nfor value in values:\n    counts[ranks[value]] += 1\nprint(counts)',
        output: '[1, 1, 2]',
        explanation:
          'Three counters cover the coordinates -7, 42 and 1000000; the million appears twice.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'values = [-5, 8, -5, -5]\nranks = {-5: 0, 8: 1}\ncounts = [0, 0]\nfor value in values:\n    counts[ranks[value]] += 1\nprint(counts)',
          ['[1, 3]', '[2, 1]', '[3, 1]', '[3, 1, 0]'],
          2,
          'Counter 0 belongs to -5, which appears three times.',
        ),
        choose(
          'Coordinates range from -10⁹ to 10⁹, with 5 distinct values. How long must a list indexed by rank be?',
          ['2 × 10⁹ + 1', '10⁹', '10', '5'],
          3,
          'Ranks run from 0 to u − 1.',
        ),
        predictOutput(
          'What does this program print?',
          'unique = [-7, 42, 1000000]\ncompressed = [2, 0, 2, 1]\nrestored = []\nfor rank in compressed:\n    restored.append(unique[rank])\nprint(restored)',
          [
            '[1000000, -7, 1000000, 42]',
            '[-7, 42, 1000000]',
            '[2, 0, 2, 1]',
            '[-7, 42, -7, 1000000]',
          ],
          0,
          'Indexing the vocabulary with each rank recovers the original coordinates in order.',
        ),
        choose(
          'Why can a translated rank be used directly as a list index?',
          [
            'Ranks equal the original coordinates',
            'Ranks are always positive coordinates',
            'Every rank lies between 0 and u − 1',
            'Lists accept any integer as an index',
          ],
          2,
          'They are exactly the positions of a length-u list.',
        ),
      ],
    },
  ],
  'cp-compression': [
    {
      title: 'Unique, rank, translate',
      explanation: [
        'Coordinate compression chains three steps: sorted(set(values)) gives the ordered vocabulary, a dictionary maps each coordinate to its index, and a pass over the original values replaces each one with its rank. Equal values get equal ranks and smaller values get smaller ranks.',
      ],
      example: {
        code: 'def compress(values):\n    unique = sorted(set(values))\n    ranks = {}\n    for index in range(len(unique)):\n        ranks[unique[index]] = index\n    result = []\n    for value in values:\n        result.append(ranks[value])\n    return result\n\nprint(compress([300, -2, 300, 15, -2]))',
        output: '[2, 0, 2, 1, 0]',
        explanation:
          'The vocabulary is [-2, 15, 300], so 300 becomes 2, -2 becomes 0 and 15 becomes 1, each in its original position.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'def compress(values):\n    unique = sorted(set(values))\n    ranks = {}\n    for index in range(len(unique)):\n        ranks[unique[index]] = index\n    result = []\n    for value in values:\n        result.append(ranks[value])\n    return result\n\nprint(compress([7, 3, 7, 11]))',
          ['[0, 1, 2, 3]', '[1, 0, 2, 3]', '[1, 0, 1, 2]', '[7, 3, 7, 11]'],
          2,
          'The vocabulary [3, 7, 11] gives ranks 0, 1 and 2; both 7s get rank 1.',
        ),
        predictOutput(
          'What does this program print?',
          'def compress(values):\n    unique = sorted(set(values))\n    ranks = {}\n    for index in range(len(unique)):\n        ranks[unique[index]] = index\n    result = []\n    for value in values:\n        result.append(ranks[value])\n    return result\n\nprint(compress([-1, -1, -1]))',
          ['[0, 1, 2]', '[-1, -1, -1]', '[0]', '[0, 0, 0]'],
          3,
          'One distinct value means one rank, repeated for every occurrence.',
        ),
        predictOutput(
          'What does this program print?',
          'def compress(values):\n    unique = sorted(set(values))\n    ranks = {}\n    for index in range(len(unique)):\n        ranks[unique[index]] = index\n    result = []\n    for value in values:\n        result.append(ranks[value])\n    return result\n\nprint(compress([50, 40, 30, 20]))',
          ['[0, 1, 2, 3]', '[20, 30, 40, 50]', '[4, 3, 2, 1]', '[3, 2, 1, 0]'],
          3,
          'Ranks follow value order, while the output keeps the input order.',
        ),
        choose(
          'Which step makes equal input values share one rank?',
          [
            'Sorting the original sequence',
            'Appending in the original order',
            'Looping over range(len(unique))',
            'Building the set of distinct values',
          ],
          3,
          'The set gives every distinct value exactly one entry in the vocabulary.',
        ),
      ],
    },
    {
      title: 'What compression preserves',
      explanation: [
        'Compression preserves equality and order: x < y exactly when rank(x) < rank(y), and every item keeps its original position. It does not preserve distances, so neighboring ranks can be far apart in value. When gaps, lengths or areas matter, keep the sorted unique list and look the real coordinates up from the ranks.',
      ],
      example: {
        code: 'def compress(values):\n    unique = sorted(set(values))\n    ranks = {}\n    for index in range(len(unique)):\n        ranks[unique[index]] = index\n    result = []\n    for value in values:\n        result.append(ranks[value])\n    return result\n\nvalues = [-1000, 50, -1000, 8]\nunique = sorted(set(values))\ncompressed = compress(values)\nprint(compressed)\nprint(unique[compressed[1]] - unique[compressed[3]])\nprint(compressed[1] - compressed[3])',
        output: '[0, 2, 0, 1]\n42\n1',
        explanation:
          '50 and 8 are 42 apart, but their ranks differ by only 1. The real gap comes from looking the coordinates up in unique.',
      },
      questions: [
        choose(
          'Which property of the original values is lost by compression?',
          [
            'Which values are equal',
            'Which value is smaller',
            'The distances between values',
            'The position of each item',
          ],
          2,
          'Ranks keep equality, order and position, but not gaps.',
        ),
        predictOutput(
          'What does this program print?',
          'def compress(values):\n    unique = sorted(set(values))\n    ranks = {}\n    for index in range(len(unique)):\n        ranks[unique[index]] = index\n    result = []\n    for value in values:\n        result.append(ranks[value])\n    return result\n\ncompressed = compress([5, 100, 6])\nprint(compressed[1] - compressed[0])',
          ['95', '1', '2', '100'],
          2,
          'The ranks are [0, 2, 1]; the gap of 95 between 5 and 100 becomes 2.',
        ),
        choose(
          'Two items have ranks 3 and 7 after compression. What is guaranteed about their original values?',
          [
            'They differ by exactly 4',
            'They are 4 positions apart in the input',
            'The first is smaller than the second',
            'Both of them are positive',
          ],
          2,
          'Ranks preserve order only.',
        ),
        predictOutput(
          'What does this program print?',
          'unique = [2, 10, 11]\nstart_rank = 0\nend_rank = 2\nprint(unique[end_rank] - unique[start_rank])\nprint(end_rank - start_rank)',
          ['2\n2', '9\n9', '11\n2', '9\n2'],
          3,
          'A real length needs the coordinates 2 and 11, not their ranks.',
        ),
      ],
    },
    {
      title: 'Cost and payoff of compression',
      explanation: [
        'For n values with u distinct ones, building the set takes expected O(n), sorting it O(u log u) (at most O(n log n)), building the rank map O(u), and translating expected O(n). Storage is O(n + u) including the result. The payoff: later lists can have length u instead of spanning the whole coordinate range.',
      ],
      example: {
        code: 'def compress(values):\n    unique = sorted(set(values))\n    ranks = {}\n    for index in range(len(unique)):\n        ranks[unique[index]] = index\n    result = []\n    for value in values:\n        result.append(ranks[value])\n    return result\n\nvalues = [1000000000, -1000000000, 0, 1000000000]\ncompressed = compress(values)\nprint(compressed)\nprint(max(compressed) + 1)\nprint(1000000000 - (-1000000000) + 1)',
        output: '[2, 0, 1, 2]\n3\n2000000001',
        explanation:
          'Three slots replace the two billion and one slots a list indexed by raw coordinate would need.',
      },
      questions: [
        choose(
          'Which step dominates the running time of compressing n values?',
          [
            'Building the set of values',
            'Appending each translated rank',
            'Sorting the distinct values',
            'Creating the empty dictionary',
          ],
          2,
          'Sorting costs O(u log u); every other step is linear.',
        ),
        choose(
          'A counting list indexed by compressed rank needs how many entries for n values with u distinct ones?',
          ['n', 'max(values) + 1', 'u', 'max(values) - min(values) + 1'],
          2,
          'One counter per distinct coordinate.',
        ),
        predictOutput(
          'What does this program print?',
          'def compress(values):\n    unique = sorted(set(values))\n    ranks = {}\n    for index in range(len(unique)):\n        ranks[unique[index]] = index\n    result = []\n    for value in values:\n        result.append(ranks[value])\n    return result\n\nprint(len(compress([3, 3, 9, 1, 9])))',
          ['3', '2', '5', '9'],
          2,
          'The result has one rank per input value, duplicates included.',
        ),
        choose(
          'Why does compression save memory for coordinates like 10⁹ and −10⁹?',
          [
            'The coordinates are stored as smaller numbers',
            'Sets compress the integers they store',
            'Sorting removes the largest values',
            'Lists need only u slots, not one per possible coordinate',
          ],
          3,
          'Only distinct coordinates get a slot.',
        ),
      ],
    },
  ],
  'cp-sweep-events': [
    {
      title: 'Each interval makes a start event and an end event',
      explanation: [
        'For the half-open interval [start, end), record (start, 1) where one more interval becomes active and (end, -1) where it stops being active. Unlike a difference table, the events are a short list of (coordinate, change) pairs, so huge coordinates need no huge list.',
      ],
      example: {
        code: 'events = []\nfor start, end in [(2, 6), (5, 9)]:\n    events.append((start, 1))\n    events.append((end, -1))\nprint(events)',
        output: '[(2, 1), (6, -1), (5, 1), (9, -1)]',
        explanation:
          'Two intervals give four events, in input order; sorting them is a separate step.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'events = []\nfor start, end in [(0, 3)]:\n    events.append((start, 1))\n    events.append((end, -1))\nprint(events)',
          [
            '[(0, 1), (2, -1)]',
            '[(0, -1), (3, 1)]',
            '[(0, 1), (3, 1)]',
            '[(0, 1), (3, -1)]',
          ],
          3,
          'The interval becomes active at 0 and stops at its excluded end 3.',
        ),
        predictOutput(
          'What does this program print?',
          'events = []\nfor start, end in [(10, 12), (1, 4)]:\n    events.append((start, 1))\n    events.append((end, -1))\nprint(events)',
          [
            '[(10, 1), (12, -1), (1, 1), (4, -1)]',
            '[(1, 1), (4, -1), (10, 1), (12, -1)]',
            '[(10, 1), (1, 1), (12, -1), (4, -1)]',
            '[(10, 1), (12, 1), (1, 1), (4, 1)]',
          ],
          0,
          'Events are appended in input order, a start and an end per interval; nothing is sorted yet.',
        ),
        choose(
          'Intervals reach coordinates near 10¹². Why use events instead of a difference table?',
          [
            'A difference table cannot hold negative changes',
            'Events never need to be sorted afterwards',
            'Events give each coordinate its own slot',
            'Events store only coordinates where something changes',
          ],
          3,
          'A table would need a slot for every coordinate up to 10¹².',
        ),
        choose(
          'What does the event (end, -1) mean?',
          [
            'One interval starts at end',
            'The coordinate end is removed',
            'Every interval ends at end',
            'One interval stops being active at end',
          ],
          3,
          'Each end event cancels exactly one start event.',
        ),
      ],
    },
    {
      title: 'Skip empty intervals, keep repeated ones',
      explanation: [
        'An interval with start == end covers no coordinate, so it should create no events; testing start < end skips it. Identical intervals each represent another occupant, so each one adds its own pair. A list of m nonempty intervals always produces 2m events.',
      ],
      example: {
        code: 'events = []\nfor start, end in [(3, 3), (1, 5), (1, 5)]:\n    if start < end:\n        events.append((start, 1))\n        events.append((end, -1))\nprint(events)\nprint(len(events))',
        output: '[(1, 1), (5, -1), (1, 1), (5, -1)]\n4',
        explanation:
          'The empty interval adds nothing. The two identical intervals each add their own start and end.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'events = []\nfor start, end in [(4, 4), (0, 2)]:\n    if start < end:\n        events.append((start, 1))\n        events.append((end, -1))\nprint(events)',
          [
            '[(0, 1), (2, -1)]',
            '[(4, 1), (4, -1), (0, 1), (2, -1)]',
            '[(4, 1), (0, 1), (2, -1)]',
            '[]',
          ],
          0,
          '[4, 4) is empty and skipped; [0, 2) adds its two events.',
        ),
        predictOutput(
          'What does this program print?',
          'events = []\nfor start, end in [(1, 2), (1, 2), (5, 5), (0, 9)]:\n    if start < end:\n        events.append((start, 1))\n        events.append((end, -1))\nprint(len(events))',
          ['8', '4', '3', '6'],
          3,
          'Three nonempty intervals, including the repeated one, give six events.',
        ),
        choose(
          'Two identical intervals [2, 7) appear in the input. How many events should they produce?',
          ['2', '4', '1', '0'],
          1,
          'Each interval is a separate occupant with its own start and end.',
        ),
        choose(
          'Why must [5, 5) produce no events?',
          [
            'Its events would be out of order',
            'It would count as two intervals',
            'Its end comes before its start',
            'It covers no coordinate',
          ],
          3,
          'A half-open interval with equal endpoints is empty.',
        ),
      ],
    },
  ],
  'cp-sweep-ties': [
    {
      title: 'Sort by coordinate, departures before arrivals',
      explanation: [
        'Sorting (coordinate, change) tuples orders events by coordinate, and at equal coordinates by change. Because -1 < 1, ordinary tuple sorting puts departures before arrivals at a shared coordinate, which is exactly the half-open convention.',
      ],
      example: {
        code: 'events = [(4, 1), (9, -1), (1, 1), (4, -1)]\nprint(sorted(events))',
        output: '[(1, 1), (4, -1), (4, 1), (9, -1)]',
        explanation:
          'At coordinate 4 the departure (-1) is placed before the arrival (1).',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'print(sorted([(5, 1), (3, -1), (5, -1), (3, 1)]))',
          [
            '[(3, 1), (3, -1), (5, 1), (5, -1)]',
            '[(3, -1), (3, 1), (5, -1), (5, 1)]',
            '[(3, -1), (5, -1), (3, 1), (5, 1)]',
            '[(5, 1), (3, -1), (5, -1), (3, 1)]',
          ],
          1,
          'Coordinates decide first; within a coordinate, -1 sorts before 1.',
        ),
        choose(
          'At one coordinate, which event does ordinary tuple sorting place first?',
          [
            'The arrival, +1',
            'Whichever came first in the input',
            'The departure, -1',
            'The one from the longer interval',
          ],
          2,
          'The second field breaks the tie, and -1 < 1.',
        ),
        predictOutput(
          'This sort uses only the coordinate as its key. What does it print?',
          'print(sorted([(4, 1), (4, -1)], key=lambda e: e[0]))',
          ['[(4, -1), (4, 1)]', '[(4, 1), (4, -1)]', '[(4, 0)]', '[(4, -1)]'],
          1,
          'The key ignores the change, so the stable sort keeps the arrival first, which is wrong for half-open intervals.',
        ),
        choose(
          'Which key sorts events by coordinate with departures first?',
          [
            'lambda e: (e[1], e[0])',
            'lambda e: e[1]',
            'lambda e: (e[0], -e[1])',
            'lambda e: (e[0], e[1])',
          ],
          3,
          'Coordinate first, then the change in its natural order.',
        ),
      ],
    },
    {
      title: 'Why the tie rule matters, and when it flips',
      explanation: [
        '[1, 3) and [3, 5) touch but do not overlap, because the first excludes 3. Processing the departure at 3 before the arrival keeps the active count from briefly reaching 2. Closed intervals [1, 3] and [3, 5] do share 3; for them arrivals must come first, which the key (coordinate, -change) achieves.',
      ],
      example: {
        code: 'events = [(1, 1), (3, -1), (3, 1), (5, -1)]\nprint(sorted(events))\nprint(sorted(events, key=lambda e: (e[0], -e[1])))',
        output:
          '[(1, 1), (3, -1), (3, 1), (5, -1)]\n[(1, 1), (3, 1), (3, -1), (5, -1)]',
        explanation:
          'The first order suits half-open intervals; the negated change puts arrivals first, as closed intervals need.',
      },
      questions: [
        choose(
          'Do the half-open intervals [2, 6) and [6, 8) overlap?',
          [
            'Yes, at coordinate 6',
            'No, the first excludes 6',
            'Yes, from 2 to 8',
            'Only if they are sorted',
          ],
          1,
          'The first interval stops just before 6, where the second begins.',
        ),
        choose(
          'Do the closed intervals [2, 6] and [6, 8] overlap?',
          [
            'Yes, both contain 6',
            'No, they only touch',
            'Only at coordinate 7',
            'Only after sorting',
          ],
          0,
          'Closed intervals include their endpoints.',
        ),
        predictOutput(
          'What does this program print?',
          'print(sorted([(6, -1), (6, 1), (2, 1), (8, -1)], key=lambda e: (e[0], -e[1])))',
          [
            '[(2, 1), (6, -1), (6, 1), (8, -1)]',
            '[(2, 1), (6, 1), (6, -1), (8, -1)]',
            '[(8, -1), (6, 1), (6, -1), (2, 1)]',
            '[(2, 1), (8, -1), (6, 1), (6, -1)]',
          ],
          1,
          'Negating the change puts the arrival before the departure at coordinate 6.',
        ),
        choose(
          'With the wrong tie order for half-open intervals, what goes wrong at a shared endpoint?',
          [
            'The ending interval is never removed',
            'The count briefly includes both intervals',
            'The starting interval is skipped',
            'The events lose their coordinates',
          ],
          1,
          'The arrival is counted before the departure that should precede it.',
        ),
      ],
    },
  ],
  'cp-sweep-active': [
    {
      title: 'Running active count and its peak',
      explanation: [
        'Scan the sorted events with active = 0 and peak = 0. For each event, add its change to active, then set peak = max(peak, active). After each event, active is the number of intervals covering the positions just after that coordinate, and peak is the largest such number so far.',
      ],
      example: {
        code: 'active = 0\npeak = 0\nfor coordinate, change in [(0, 1), (2, 1), (3, -1), (4, 1), (6, -1), (7, -1)]:\n    active += change\n    peak = max(peak, active)\n    print(active)\nprint(peak)',
        output: '1\n2\n1\n2\n1\n0\n2',
        explanation:
          'The count rises to 2 twice and finishes at 0; the peak remembers 2.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'active = 0\npeak = 0\nfor coordinate, change in [(1, 1), (2, 1), (3, 1), (4, -1), (5, -1), (6, -1)]:\n    active += change\n    peak = max(peak, active)\nprint(peak)',
          ['6', '1', '3', '0'],
          2,
          'Three arrivals come before any departure, so three intervals are active at once.',
        ),
        predictOutput(
          'What does this program print?',
          'active = 0\nfor coordinate, change in [(0, 1), (5, -1), (5, 1), (9, -1)]:\n    active += change\n    print(active)',
          ['1\n1\n2\n1', '1\n0\n1\n0', '1\n0\n1\n1', '0\n1\n0\n1'],
          1,
          'The departure at 5 is processed before the arrival, so the count dips to 0 between them.',
        ),
        choose(
          'Why update the peak right after each change?',
          [
            'So departures can raise the peak',
            'So the events stay sorted',
            'So the final count becomes zero',
            'So the newly reached count is included',
          ],
          3,
          'The peak must see every count the sweep reaches.',
        ),
        choose(
          'What does active mean right after the events at coordinate x are applied?',
          [
            'The total number of intervals in the input',
            'The number of events processed so far',
            'The coordinate x itself',
            'The number of intervals covering positions just after x',
          ],
          3,
          'Arrivals at x have started and departures at x have ended.',
        ),
      ],
    },
    {
      title: 'Order matters, and the stream ends at zero',
      explanation: [
        'The scan trusts its input order. If an arrival were processed before a departure at a shared coordinate, active would briefly count an interval that has already ended, and the peak could be too large. In a complete stream from valid intervals every +1 has a matching −1, so active finishes at 0.',
      ],
      example: {
        code: 'good = [(1, 1), (3, -1), (3, 1), (5, -1)]\nbad = [(1, 1), (3, 1), (3, -1), (5, -1)]\nfor events in [good, bad]:\n    active = 0\n    peak = 0\n    for coordinate, change in events:\n        active += change\n        peak = max(peak, active)\n    print(peak)',
        output: '1\n2',
        explanation:
          'Both streams describe [1, 3) and [3, 5). Only the correctly ordered one reports that they never overlap.',
      },
      questions: [
        predictOutput(
          'The events are in the wrong tie order. What does this program print?',
          'active = 0\npeak = 0\nfor coordinate, change in [(2, 1), (4, 1), (4, -1), (8, -1)]:\n    active += change\n    peak = max(peak, active)\nprint(peak)',
          ['2', '1', '3', '0'],
          0,
          'The arrival at 4 is counted before the departure at 4, inflating the peak for [2, 4) and [4, 8).',
        ),
        predictOutput(
          'What does this program print?',
          'active = 0\npeak = 0\nfor coordinate, change in [(0, 1), (1, 1), (2, -1), (3, -1)]:\n    active += change\n    peak = max(peak, active)\nprint(active)',
          ['0', '2', '1', '-1'],
          0,
          'Two arrivals and two departures balance out.',
        ),
        choose(
          'A sweep ends with active = 2 after its last event. What does that suggest?',
          [
            'Two intervals overlapped at the peak',
            'Some end events are missing from the stream',
            'The events were sorted correctly',
            'The maximum overlap is 2',
          ],
          1,
          'A complete stream of valid intervals always returns to 0.',
        ),
        choose(
          'The intervals are [0, 4) and [4, 6). What peak does a correctly ordered sweep report?',
          ['2', '1', '0', '6'],
          1,
          'They only touch at 4, where the departure is processed first.',
        ),
      ],
    },
  ],
  'cp-sweep-line': [
    {
      title: 'Generate, sort, sweep',
      explanation: [
        'A sweep finds the maximum number of overlapping half-open intervals in three steps: turn each nonempty interval into (start, 1) and (end, -1), sort the events, then scan them while tracking the active count and its peak. Only coordinates where something changes are visited.',
      ],
      example: {
        code: 'def most_overlap(intervals):\n    events = []\n    for start, end in intervals:\n        if start < end:\n            events.append((start, 1))\n            events.append((end, -1))\n    events.sort()\n    active = 0\n    best = 0\n    for coordinate, change in events:\n        active += change\n        best = max(best, active)\n    return best\n\nprint(most_overlap([(1, 5), (2, 6), (4, 8), (7, 9)]))',
        output: '3',
        explanation:
          'At coordinate 4 the first three intervals are all active, before the first one ends at 5.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'def most_overlap(intervals):\n    events = []\n    for start, end in intervals:\n        if start < end:\n            events.append((start, 1))\n            events.append((end, -1))\n    events.sort()\n    active = 0\n    best = 0\n    for coordinate, change in events:\n        active += change\n        best = max(best, active)\n    return best\n\nprint(most_overlap([(0, 10), (2, 3), (4, 5)]))',
          ['3', '1', '2', '10'],
          2,
          'The long interval overlaps each short one, but the short ones never overlap each other.',
        ),
        predictOutput(
          'What does this program print?',
          'def most_overlap(intervals):\n    events = []\n    for start, end in intervals:\n        if start < end:\n            events.append((start, 1))\n            events.append((end, -1))\n    events.sort()\n    active = 0\n    best = 0\n    for coordinate, change in events:\n        active += change\n        best = max(best, active)\n    return best\n\nprint(most_overlap([(1, 4), (2, 5), (3, 6)]))',
          ['2', '3', '6', '1'],
          1,
          'All three are active from 3 until the first one ends at 4.',
        ),
        predictOutput(
          'What does this program print?',
          'def most_overlap(intervals):\n    events = []\n    for start, end in intervals:\n        if start < end:\n            events.append((start, 1))\n            events.append((end, -1))\n    events.sort()\n    active = 0\n    best = 0\n    for coordinate, change in events:\n        active += change\n        best = max(best, active)\n    return best\n\nprint(most_overlap([]))\nprint(most_overlap([(5, 9)]))',
          ['0\n1', '0\n2', 'None\n1', '1\n1'],
          0,
          'No intervals means no overlap; a single interval reaches a count of 1.',
        ),
        choose(
          'Why sort the events before scanning them?',
          [
            'Sorting removes the empty intervals',
            'Sorting merges overlapping intervals',
            'The peak has to be found first',
            'The active count is only right in coordinate order',
          ],
          3,
          'The running count must follow positions from left to right.',
        ),
      ],
    },
    {
      title: 'Ties and empty intervals',
      explanation: [
        'Half-open intervals that meet at x do not overlap there, so ends at x must be processed before starts at x; tuple sorting does this because -1 < 1. Empty intervals [x, x) occupy nothing and are skipped before they create events. State the endpoint convention first: closed intervals need the opposite tie order.',
      ],
      example: {
        code: 'def most_overlap(intervals):\n    events = []\n    for start, end in intervals:\n        if start < end:\n            events.append((start, 1))\n            events.append((end, -1))\n    events.sort()\n    active = 0\n    best = 0\n    for coordinate, change in events:\n        active += change\n        best = max(best, active)\n    return best\n\nprint(most_overlap([(0, 3), (3, 6), (6, 9)]))\nprint(most_overlap([(2, 2), (2, 2), (1, 3)]))',
        output: '1\n1',
        explanation:
          'Back-to-back intervals never overlap, and empty intervals add nothing to the count.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'def most_overlap(intervals):\n    events = []\n    for start, end in intervals:\n        if start < end:\n            events.append((start, 1))\n            events.append((end, -1))\n    events.sort()\n    active = 0\n    best = 0\n    for coordinate, change in events:\n        active += change\n        best = max(best, active)\n    return best\n\nprint(most_overlap([(1, 3), (3, 5), (2, 4)]))',
          ['3', '1', '4', '2'],
          3,
          'At 3 the first interval ends before the second starts, so the count never exceeds 2.',
        ),
        predictOutput(
          'What does this program print?',
          'def most_overlap(intervals):\n    events = []\n    for start, end in intervals:\n        if start < end:\n            events.append((start, 1))\n            events.append((end, -1))\n    events.sort()\n    active = 0\n    best = 0\n    for coordinate, change in events:\n        active += change\n        best = max(best, active)\n    return best\n\nprint(most_overlap([(4, 4), (4, 4), (4, 4)]))',
          ['3', '0', '1', '6'],
          1,
          'Every interval is empty, so no events are created.',
        ),
        choose(
          'Meetings are half-open intervals [start, end). One ends at 10 and another starts at 10. Do they need two rooms at 10?',
          [
            'No, the first has ended at 10',
            'Yes, both are active at 10',
            'Only if they are equally long',
            'Only if they started together',
          ],
          0,
          'The end coordinate is excluded from the first meeting.',
        ),
        predictOutput(
          'This sweep sorts arrivals first, as for closed intervals. What does it print?',
          'events = []\nfor start, end in [(0, 3), (3, 6)]:\n    events.append((start, 1))\n    events.append((end, -1))\nevents.sort(key=lambda e: (e[0], -e[1]))\nactive = 0\nbest = 0\nfor coordinate, change in events:\n    active += change\n    best = max(best, active)\nprint(best)',
          ['1', '2', '0', '3'],
          1,
          'With arrivals first, both intervals are counted at 3, which models closed intervals sharing that point.',
        ),
      ],
    },
    {
      title: 'Cost, and what the peak ignores',
      explanation: [
        'For n intervals there are at most 2n events: sorting them costs O(n log n), the scan O(n), and the events need O(n) space, however large the coordinates are. The peak depends only on the order of events; measuring the total covered length would also need the gaps between consecutive event coordinates.',
      ],
      example: {
        code: 'def most_overlap(intervals):\n    events = []\n    for start, end in intervals:\n        if start < end:\n            events.append((start, 1))\n            events.append((end, -1))\n    events.sort()\n    active = 0\n    best = 0\n    for coordinate, change in events:\n        active += change\n        best = max(best, active)\n    return best\n\nprint(most_overlap([(1, 4), (2, 6)]))\nprint(most_overlap([(1000000, 4000000), (2000000, 6000000)]))',
        output: '2\n2',
        explanation:
          'Scaling every coordinate by a million changes neither the work nor the answer.',
      },
      questions: [
        choose(
          'What is the time to compute the maximum overlap of n intervals with a sweep?',
          ['O(n)', 'O(n log n)', 'O(n²)', 'O(max coordinate)'],
          1,
          'Sorting the 2n events dominates the linear scan.',
        ),
        choose(
          'Coordinates reach 10¹⁸ but there are only 10⁵ intervals. How much memory do the events use?',
          [
            'O(10¹⁸) slots',
            'O(n), about 2 × 10⁵ events',
            'O(n²) pairs of intervals',
            'O(log 10¹⁸) entries',
          ],
          1,
          'Two events per interval, independent of coordinate size.',
        ),
        predictOutput(
          'What does this program print?',
          'def most_overlap(intervals):\n    events = []\n    for start, end in intervals:\n        if start < end:\n            events.append((start, 1))\n            events.append((end, -1))\n    events.sort()\n    active = 0\n    best = 0\n    for coordinate, change in events:\n        active += change\n        best = max(best, active)\n    return best\n\nprint(most_overlap([(5, 6), (5, 600)]))\nprint(most_overlap([(5, 6), (7, 600)]))',
          ['2\n2', '2\n1', '1\n1', '595\n594'],
          1,
          'The peak counts simultaneous intervals, not lengths: the first pair shares [5, 6), the second pair never meets.',
        ),
        choose(
          'A task asks for the total length covered by at least one interval. What must the sweep add?',
          [
            'A second sort by interval length',
            'A larger tie-breaking key',
            'Nothing; the peak already gives it',
            'The gaps between consecutive event coordinates',
          ],
          3,
          'Length needs distances between events, which the peak never uses.',
        ),
      ],
    },
  ],
};
