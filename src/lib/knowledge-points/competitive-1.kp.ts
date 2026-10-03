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
};
