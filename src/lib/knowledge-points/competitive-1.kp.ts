import { choose, predictOutput, type KnowledgePointModule } from '.';

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
};
