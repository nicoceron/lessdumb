import { withExerciseId } from './exercise';
import type {
  CodeQuestion,
  Course,
  CurriculumCatalog,
  Skill,
  Unit,
} from '../curriculum';
const exercise = (
  prompt: string,
  starterCode: string,
  solution: string,
  tests: string,
  explanation: string,
  hint: string,
): Omit<CodeQuestion, 'id'> => ({
  type: 'code',
  prompt,
  starterCode,
  solution,
  tests,
  explanation,
  hint,
});

function skill(
  id: string,
  unitId: string,
  title: string,
  summary: string,
  prerequisites: string[],
  paragraphs: string[],
  example: Skill['lesson']['example'],
  /** The code exercise; choice practice lives in knowledge points. */
  exercises: Omit<CodeQuestion, 'id'>[],
  cards: [string, string][],
): Omit<Skill, 'order'> {
  return {
    id,
    unitId,
    title,
    summary,
    prerequisites,
    courseId: 'python-foundations',
    domain: 'programming',
    estimatedMinutes: 8,
    assessment: { requiredTypes: ['code', 'choice'], reviewAnswers: 2 },
    lesson: { paragraphs, example },
    questions: withExerciseId(id, exercises),
    flashcards: cards.map(([front, back], index) => ({
      id: `${id}-card${index + 1}`,
      skillId: id,
      front,
      back,
    })),
  };
}

const pythonUnits: Unit[] = [
  {
    id: 'first-programs',
    title: 'First programs',
    description: 'Turn ideas into values and visible output.',
    courseId: 'python-foundations',
  },
  {
    id: 'decisions',
    title: 'Make decisions',
    description: 'Compare values and choose a path.',
    courseId: 'python-foundations',
  },
  {
    id: 'sequences',
    title: 'Work with sequences',
    description: 'Store items, access them, and repeat actions.',
    courseId: 'python-foundations',
  },
  {
    id: 'iteration',
    title: 'Build with loops',
    description: 'Accumulate results and transform collections.',
    courseId: 'python-foundations',
  },
  {
    id: 'organize',
    title: 'Organize your code',
    description: 'Use mappings and reusable functions.',
    courseId: 'python-foundations',
  },
  {
    id: 'solve',
    title: 'Solve real problems',
    description: 'Combine your skills into tested solutions.',
    courseId: 'python-foundations',
  },
  {
    id: 'toolkit',
    title: 'Sort and use bits',
    description:
      'Order data with sorted and key functions, and work in binary.',
    courseId: 'python-foundations',
  },
  {
    id: 'library',
    title: 'Use the standard library',
    description:
      'Import modules for math, queues, counts, heaps, and searching.',
    courseId: 'python-foundations',
  },
  {
    id: 'objects',
    title: 'Model data with classes',
    description: 'Define objects with their own attributes and methods.',
    courseId: 'python-foundations',
  },
];

const curriculum = [
  skill(
    'print-output',
    'first-programs',
    'Your first output',
    'Make Python say something and follow execution order.',
    [],
    [
      'Python runs statements from top to bottom. A statement is one instruction. The print() function writes a value to the output so you can see what your program is doing.',
      'Text values are strings. Put literal text between matching single or double quotes. The quotes tell Python where the text starts and ends; they are not printed. Each print() call ends its output with a new line by default.',
    ],
    {
      code: 'print("Hello, Python!")\nprint("One small step.")',
      output: 'Hello, Python!\nOne small step.',
      explanation:
        'The first statement finishes before the second one begins. Both quoted strings become visible output.',
    },
    [
      exercise(
        'Print Hello, lessdumb! on one line, then I can learn Python. on the next line.',
        '# Write two print statements below.\n',
        'print("Hello, lessdumb!")\nprint("I can learn Python.")',
        'assert __lessdumb_output.strip() == "Hello, lessdumb!\\nI can learn Python.", "Print the two requested lines in order."',
        'Two print calls produce two lines. The exclamation mark and period are part of the strings.',
        'Place each requested sentence in quotes inside print().',
      ),
    ],
    [
      ['What does print("Hello") output?', 'Hello, without the quote marks.'],
      [
        'In what order does Python execute ordinary statements?',
        'From top to bottom.',
      ],
    ],
  ),

  skill(
    'variables',
    'first-programs',
    'Names and variables',
    'Give values names and update them deliberately.',
    ['print-output'],
    [
      'An assignment such as score = 3 gives the name score a value. The equals sign means “assign,” not “these two sides are mathematically equal.” Later expressions can use that name instead of repeating the value.',
      'Reassignment replaces the value associated with a name. Python evaluates the right-hand side first, then updates the left-hand side. Use readable names with letters, digits, and underscores; a name cannot begin with a digit.',
    ],
    {
      code: 'score = 3\nscore = score + 2\nprint(score)',
      output: '5',
      explanation:
        'The old score, 3, is used to calculate 3 + 2. Only then does score become 5.',
    },
    [
      exercise(
        'Create a variable named points with value 10. Then add 5 to points using its existing value.',
        '# Create points, then update it.\n',
        'points = 10\npoints = points + 5',
        'assert points == 15, "points should hold 15 after the update."',
        'The reassignment uses the original points value and replaces it with 15.',
        'Use points = points + 5 after your first assignment.',
      ),
    ],
    [
      [
        'What does x = x + 1 do?',
        'It evaluates the old value of x plus 1, then assigns that result to x.',
      ],
      [
        'What is the usual Python style for a multiword variable name?',
        'Use lowercase words separated by underscores, for example daily_score.',
      ],
    ],
  ),

  skill(
    'numbers',
    'first-programs',
    'Numbers and arithmetic',
    'Choose arithmetic operators and predict their results.',
    ['variables'],
    [
      'Integers represent whole numbers; floats represent numbers with a decimal component. Python provides +, -, *, and / for addition, subtraction, multiplication, and division. Division with / produces a float, even when the result is a whole number.',
      'Use // for floor division, % for the remainder, and ** for powers. Multiplication and division happen before addition and subtraction. Parentheses let you make the intended grouping explicit.',
    ],
    {
      code: 'minutes = 137\nhours = minutes // 60\nremaining = minutes % 60\nprint(hours, remaining)',
      output: '2 17',
      explanation:
        'There are two complete groups of 60 minutes, with 17 minutes remaining.',
    },
    [
      exercise(
        'A box holds 6 apples. You have 29 apples. Set full_boxes to the number of complete boxes and leftover to the remaining apples.',
        'apples = 29\nbox_size = 6\n# Set full_boxes and leftover.\n',
        'apples = 29\nbox_size = 6\nfull_boxes = apples // box_size\nleftover = apples % box_size',
        'assert full_boxes == 4, "There should be 4 complete boxes."\nassert leftover == 5, "There should be 5 apples left."',
        'Floor division counts complete boxes, and modulo counts what remains.',
        'Use // for full boxes and % for leftovers.',
      ),
    ],
    [
      [
        'How do / and // differ?',
        '/ performs division and returns a float; // performs floor division.',
      ],
      [
        'What does n % d calculate?',
        'The remainder after division by d. For positive integers, it is what remains after forming complete groups of d.',
      ],
    ],
  ),

  skill(
    'strings',
    'first-programs',
    'Build strings',
    'Combine text and format values into readable messages.',
    ['numbers'],
    [
      'A string is a sequence of characters. You can join strings using +, but both operands must be strings. The len() function returns the number of characters, including spaces.',
      'An f-string begins with f before the opening quote. Expressions inside braces are evaluated and inserted into the text. This is a readable way to combine text with numbers without manually converting every value.',
    ],
    {
      code: 'name = "Mira"\nstreak = 3\nmessage = f"{name}: {streak} days"\nprint(message)',
      output: 'Mira: 3 days',
      explanation:
        'The names inside braces are replaced by their current values.',
    },
    [
      exercise(
        'Create label with exactly the text Lina has 4 badges using the variables below.',
        'name = "Lina"\nbadges = 4\n# Set label.\n',
        'name = "Lina"\nbadges = 4\nlabel = f"{name} has {badges} badges"',
        'assert label == "Lina has 4 badges", "Use the name and badge count in the requested message."',
        'The f-string inserts the string name and integer badges into one message.',
        'Start your string with f and put the variable names in braces.',
      ),
    ],
    [
      ['What does len("a b") return?', '3. Spaces count as characters.'],
      [
        'How do you insert a value into an f-string?',
        'Put the expression inside braces, for example f"Score: {score}".',
      ],
    ],
  ),

  skill(
    'types',
    'decisions',
    'Types and conversion',
    'Recognize values and convert them when a task requires it.',
    ['strings'],
    [
      'Values have types. Common built-in types include int for whole numbers, float for decimal numbers, str for text, and bool for True or False. A string containing digits is still text until you convert it.',
      'Use int(), float(), and str() to convert suitable values. int("12") returns the number 12. Conversions can fail when the content does not fit the requested type: int("twelve") raises ValueError.',
    ],
    {
      code: 'text = "12"\ncount = int(text)\nprint(count + 3)\nprint(str(count) + " apples")',
      output: '15\n12 apples',
      explanation:
        'The first expression uses numerical addition. The second converts the number to text before concatenating.',
    },
    [
      exercise(
        'Convert price_text to a float and quantity_text to an integer. Set total to their product.',
        'price_text = "2.5"\nquantity_text = "4"\n# Set total.\n',
        'price_text = "2.5"\nquantity_text = "4"\ntotal = float(price_text) * int(quantity_text)',
        'assert total == 10.0, "Convert the text values before multiplying."\nassert isinstance(total, float), "total should be a float."',
        'A float price multiplied by an integer quantity gives a float total.',
        'Use float(price_text) and int(quantity_text).',
      ),
    ],
    [
      [
        'Why is "7" + "2" equal to "72"?',
        'Both operands are strings, so + concatenates text.',
      ],
      [
        'How can you turn a string such as "7" into an integer?',
        'Use int("7"), which returns 7.',
      ],
    ],
  ),

  skill(
    'comparisons',
    'decisions',
    'Compare values',
    'Turn questions about values into True or False.',
    ['types'],
    [
      'A comparison produces a boolean: True or False. Use == for equality, != for inequality, and <, <=, >, or >= for ordered comparisons. The assignment operator = and the comparison operator == do different jobs.',
      'Boundary conditions matter. age >= 18 includes age 18; age > 18 does not. Before writing a comparison, say its meaning in ordinary words and test a value exactly at the boundary.',
    ],
    {
      code: 'age = 18\nprint(age >= 18)\nprint(age > 18)\nprint(age == 18)',
      output: 'True\nFalse\nTrue',
      explanation:
        'The inclusive comparison and equality are true at 18; the strict comparison is false.',
    },
    [
      exercise(
        'Set passed to a boolean that is True when score is at least 60. Use a comparison rather than a quoted string.',
        'score = 60\n# Set passed.\n',
        'score = 60\npassed = score >= 60',
        'assert passed is True, "The score 60 must pass the inclusive boundary."',
        'The >= comparison includes exactly 60 and returns a boolean.',
        'Use >= so the boundary score passes.',
      ),
    ],
    [
      [
        'What is the difference between = and ==?',
        '= assigns a value to a name; == compares two values for equality.',
      ],
      ['Which comparison expresses “at least 10”?', 'value >= 10.'],
    ],
  ),

  skill(
    'boolean-logic',
    'decisions',
    'Combine conditions',
    'Use and, or, and not to express decision rules.',
    ['comparisons'],
    [
      'and is True only when both conditions are true. or is True when at least one condition is true. not reverses a condition: not True is False, and not False is True.',
      'Build a complex condition from small, readable comparisons. Parentheses help communicate the grouping. When a range has an upper and lower limit, both limits must hold, so combine them with and. Python also lets you chain the two comparisons: 10 <= n <= 20 means 10 <= n and n <= 20.',
    ],
    {
      code: 'age = 21\nhas_ticket = True\ncan_enter = age >= 18 and has_ticket\nprint(can_enter)',
      output: 'True',
      explanation: 'The age condition and the ticket condition both hold.',
    },
    [
      exercise(
        'Set eligible to True only when age is at least 16 and consent is True.',
        'age = 16\nconsent = True\n# Set eligible.\n',
        'age = 16\nconsent = True\neligible = age >= 16 and consent',
        'assert eligible is True, "Both eligibility conditions hold."',
        'and combines the age check with consent.',
        'Both requirements must hold, so use and.',
      ),
    ],
    [
      ['When is a and b true?', 'Only when both a and b are true.'],
      [
        'What does not do to a boolean?',
        'It reverses it: not True is False, and not False is True.',
      ],
    ],
  ),

  skill(
    'conditionals',
    'decisions',
    'Choose a branch',
    'Run different code for different conditions.',
    ['comparisons'],
    [
      'An if statement runs its indented body only when its condition is true. An else body runs when the if condition is false. The colon starts a block; indentation shows which statements belong to it.',
      'Use elif to check another condition after an earlier condition fails. In an if/elif/else chain, Python runs only the first matching branch. Put narrower or higher-threshold conditions first when their ranges overlap.',
    ],
    {
      code: 'score = 82\nif score >= 90:\n    grade = "A"\nelif score >= 70:\n    grade = "B"\nelse:\n    grade = "C"\nprint(grade)',
      output: 'B',
      explanation:
        'The score fails the 90 test, passes the 70 test, and skips the else branch.',
    },
    [
      exercise(
        'Set label to "even" when number is even and "odd" otherwise.',
        'number = 7\n# Choose label with if/else.\n',
        'number = 7\nif number % 2 == 0:\n    label = "even"\nelse:\n    label = "odd"',
        'assert label == "odd", "7 is odd because its remainder after division by 2 is 1."',
        'An even integer has remainder 0 when divided by 2.',
        'Test number % 2 == 0, then write an else branch.',
      ),
    ],
    [
      [
        'What happens in an if/elif/else chain?',
        'Python runs the first matching branch, or else if none of the conditions match.',
      ],
      [
        'What punctuation and layout start an if block?',
        'A colon after the condition and an indented body.',
      ],
    ],
  ),

  skill(
    'conditional-expressions',
    'decisions',
    'Choose a value inline',
    'Pick one of two values with a conditional expression.',
    ['conditionals'],
    [
      'A conditional expression chooses between two values in one line: value_if_true if condition else value_if_false. Read it as “this value if the condition holds, otherwise that value.” Because it produces a value, it can appear on the right of =, inside print(), or anywhere else an expression is allowed.',
      'Python evaluates the condition first and then only the chosen side. Both sides are required: there is no form without else. Use it for a simple choice between two values; when a branch needs several statements, or there are more than two outcomes, an if/elif/else block is clearer.',
    ],
    {
      code: 'temperature = 31\nadvice = "stay inside" if temperature > 30 else "go outside"\nprint(advice)\nfiles = 1\nprint("1 file" if files == 1 else f"{files} files")',
      output: 'stay inside\n1 file',
      explanation:
        '31 > 30 is True, so advice receives the first value. files == 1 is True, so print receives "1 file" and the other side is never evaluated.',
    },
    [
      exercise(
        'In one assignment, set parity to "even" when number is divisible by 2 and to "odd" otherwise. Use a conditional expression.',
        'number = 14\n# Set parity in one line.\n',
        'number = 14\nparity = "even" if number % 2 == 0 else "odd"',
        'assert parity == "even", "14 has remainder 0 when divided by 2."',
        'The condition number % 2 == 0 is True, so the expression produces "even".',
        'Write parity = "even" if number % 2 == 0 else "odd".',
      ),
    ],
    [
      [
        'How do you read a if condition else b?',
        'Use a when the condition is true; otherwise use b.',
      ],
      [
        'When is an if/else block clearer than a conditional expression?',
        'When a branch needs several statements or there are more than two outcomes.',
      ],
    ],
  ),

  skill(
    'lists',
    'sequences',
    'Collect values in lists',
    'Store an ordered collection under one name.',
    ['comparisons'],
    [
      'A list stores an ordered collection of values between square brackets, with commas between items. An empty list is []. Lists can contain several types, although collections of similar items are often easier to work with.',
      'len(items) gives the number of items, not their total. The in operator tests whether a value is present. Order matters: [1, 2] and [2, 1] are different lists.',
    ],
    {
      code: 'colors = ["blue", "green", "red"]\nprint(len(colors))\nprint("green" in colors)',
      output: '3\nTrue',
      explanation: 'The list holds three strings, and green is one of them.',
    },
    [
      exercise(
        'Create a list named temperatures containing 18, 21, and 19 in that order. Set count to its length.',
        '# Set temperatures and count.\n',
        'temperatures = [18, 21, 19]\ncount = len(temperatures)',
        'assert temperatures == [18, 21, 19], "Keep all three temperatures in the requested order."\nassert count == 3, "count should contain the number of readings."',
        'The list keeps the order, and len() returns the number of readings.',
        'Use square brackets for the list and len() for its length.',
      ),
    ],
    [
      ['What does len(a_list) count?', 'The number of items in the list.'],
      [
        'How do you test whether item is in values?',
        'Use item in values; it produces True or False.',
      ],
    ],
  ),

  skill(
    'truthiness',
    'sequences',
    'Test for empty or missing values',
    'Use values directly as conditions and check for None.',
    ['conditionals', 'boolean-logic', 'lists'],
    [
      'Any value can be used as a condition. False, None, 0, 0.0, the empty string "", and the empty list [] count as false; almost everything else counts as true. So if items: means “if items is not empty,” and if not name: means “if name is empty.” bool(value) shows the result directly: bool(0) is False, while bool([0]) is True because that list has one item.',
      'None is the value Python uses for “nothing here.” Test for it with is None or is not None. Prefer that explicit test when a falsy value is legitimate: a best score of 0 is still a score, so if best is None: is right where if not best: would also treat 0 as missing. In arithmetic, True and False act as 1 and 0, so True + True is 2.',
    ],
    {
      code: 'tasks = []\nif not tasks:\n    print("Nothing to do")\nbest = 0\nif best is None:\n    print("No score yet")\nelse:\n    print(f"Best: {best}")',
      output: 'Nothing to do\nBest: 0',
      explanation:
        'An empty list is falsy, so not tasks is True. best is 0, not None, so the else branch reports the real score.',
    },
    [
      exercise(
        'Set inbox_status to "empty" if inbox has no items and to "new" otherwise, using the list itself as the condition. Set score_status to "missing" only if score is None, and to "recorded" otherwise.',
        'inbox = []\nscore = 0\n# Set inbox_status and score_status.\n',
        'inbox = []\nscore = 0\nif inbox:\n    inbox_status = "new"\nelse:\n    inbox_status = "empty"\nif score is None:\n    score_status = "missing"\nelse:\n    score_status = "recorded"',
        'assert inbox_status == "empty", "An empty list is falsy."\nassert score_status == "recorded", "0 is a real score; only None means missing."',
        'The empty list takes the else branch, and is None keeps the legitimate score 0.',
        'Use if inbox: for the list and if score is None: for the score.',
      ),
    ],
    [
      [
        'Which common values are falsy?',
        'False, None, 0, 0.0, the empty string "", and the empty list [].',
      ],
      [
        'Why write x is None instead of not x?',
        'not x is also True for 0 or an empty value, which may be legitimate; is None checks only for a missing value.',
      ],
    ],
  ),

  skill(
    'number-builtins',
    'sequences',
    'Summarize numbers with built-ins',
    'Use sum, min, max, abs, and round instead of hand-written loops.',
    ['lists'],
    [
      'sum(values) adds the numbers in a list, and len(values) counts them, so sum(values) / len(values) is their mean. min(values) and max(values) return the smallest and largest item. Both also accept separate arguments: max(3, 8) is 8. sum([]) is 0, but min([]) and max([]) raise ValueError because an empty list has no smallest item.',
      'abs(x) is the distance from zero: abs(-7) and abs(7) are both 7, so abs(a - b) is the gap between two numbers in either order. round(x, digits) rounds to that many decimal places, and round(x) gives the nearest whole number. float("inf") is larger than every number, which makes it a safe starting value for a running minimum such as best = min(best, value).',
    ],
    {
      code: 'scores = [72, 95, 88]\nprint(sum(scores) / len(scores))\nprint(min(scores), max(scores))\nprint(abs(70 - 95), round(2.678, 1))',
      output: '85.0\n72 95\n25 2.7',
      explanation:
        'The total 255 divided by 3 is 85.0. The extremes are 72 and 95. The gap between 70 and 95 is 25, and 2.678 rounds to 2.7.',
    },
    [
      exercise(
        'Set spread to the largest reading minus the smallest reading, and average to the mean of the readings rounded to one decimal place.',
        'readings = [12.5, 9.0, 14.25, 10.0]\n# Set spread and average.\n',
        'readings = [12.5, 9.0, 14.25, 10.0]\nspread = max(readings) - min(readings)\naverage = round(sum(readings) / len(readings), 1)',
        'assert spread == 5.25, "14.25 - 9.0 is 5.25."\nassert average == 11.4, "The mean 11.4375 rounds to 11.4."',
        'max and min give the extremes, and round(…, 1) keeps one decimal place of the mean.',
        'Use max(readings) - min(readings) and round(sum(readings) / len(readings), 1).',
      ),
    ],
    [
      [
        'How do you compute the mean of a nonempty list values?',
        'sum(values) / len(values).',
      ],
      [
        'What do sum([]) and min([]) do?',
        'sum([]) returns 0; min([]) raises ValueError.',
      ],
    ],
  ),

  skill(
    'string-methods',
    'sequences',
    'Clean and split text',
    'Change case, trim, replace, split, and join strings.',
    ['lists'],
    [
      'Strings have methods: functions attached to a value and called with a dot. text.lower() and text.upper() change case, text.strip() removes spaces and newlines from both ends, and text.replace(old, new) swaps every occurrence of old. Strings never change in place: each method returns a new string, so assign the result if you want to keep it.',
      'text.split() breaks text into a list of words at any run of whitespace. text.split(",") splits at every comma instead and keeps the empty piece between two neighboring commas. The reverse is separator.join(words), which glues a list of strings together with the separator between them: "-".join(["a", "b"]) is "a-b". join accepts only strings, so convert numbers with str() first.',
    ],
    {
      code: 'line = "  Ada Lovelace  "\nclean = line.strip()\nprint(clean.upper())\nwords = clean.split()\nprint(words)\nprint("_".join(words).lower())',
      output: "ADA LOVELACE\n['Ada', 'Lovelace']\nada_lovelace",
      explanation:
        'strip removes the outer spaces, split makes a two-word list, and join followed by lower builds a lowercase identifier.',
    },
    [
      exercise(
        'Set key to entry with the surrounding spaces removed, all letters lowercase, and each remaining space replaced by an underscore. Set word_count to the number of words in entry.',
        'entry = "  Data Science 101 "\n# Set key and word_count.\n',
        'entry = "  Data Science 101 "\nkey = entry.strip().lower().replace(" ", "_")\nword_count = len(entry.split())',
        'assert key == "data_science_101", "Strip, lowercase, then replace spaces."\nassert word_count == 3, "split() finds three words."\nassert entry == "  Data Science 101 ", "Methods return new strings; entry stays the same."',
        'Each method returns a new string, so the calls chain from left to right; split() ignores the extra spaces.',
        'Chain entry.strip().lower().replace(" ", "_") and use len(entry.split()).',
      ),
    ],
    [
      [
        'Does text.upper() change text?',
        'No. Strings never change in place; it returns a new uppercase string.',
      ],
      ['How do you turn ["a", "b"] into "a, b"?', '", ".join(["a", "b"]).'],
    ],
  ),

  skill(
    'indexing',
    'sequences',
    'Access by index',
    'Retrieve list items and string characters by position.',
    ['lists'],
    [
      'Python sequence indices start at zero: the first item is at index 0, the second at index 1. Use brackets after the sequence name, for example colors[0]. Strings also support indexing, which returns one character.',
      'Negative indices count backward from the end: -1 selects the last item, -2 the second-last. An index outside the available positions raises IndexError. For a nonempty sequence, the last positive index is len(sequence) - 1.',
    ],
    {
      code: 'tools = ["pen", "book", "lamp"]\nprint(tools[0])\nprint(tools[-1])\nprint("code"[1])',
      output: 'pen\nlamp\no',
      explanation:
        'Index 0 is the first item, -1 is the last, and character index 1 is the second character.',
    },
    [
      exercise(
        'Set first to the first item in names and last to the last item, using indexing.',
        'names = ["Ivo", "Uma", "Zoe"]\n# Set first and last.\n',
        'names = ["Ivo", "Uma", "Zoe"]\nfirst = names[0]\nlast = names[-1]',
        'assert first == "Ivo", "The first item is at index 0."\nassert last == "Zoe", "The last item can be accessed with -1."',
        'Zero selects the first position, and negative one selects the final position.',
        'Use names[0] and names[-1].',
      ),
    ],
    [
      ['At which index is the first sequence item?', 'Index 0.'],
      [
        'What does sequence[-1] select?',
        'The last item of a nonempty sequence.',
      ],
    ],
  ),

  skill(
    'tuples',
    'sequences',
    'Group values in a tuple',
    'Store a fixed record of values and compare records.',
    ['indexing'],
    [
      'A tuple is an ordered, fixed group of values written with commas, usually inside parentheses: point = (3, 4). Index it like a list, so point[0] is 3, and len(point) counts its items. A one-item tuple needs a trailing comma, (5,), because (5) is just the number 5 in parentheses.',
      'Tuples are immutable: point[0] = 9 raises TypeError. Use a tuple for a record whose parts belong together, such as (row, col) or (name, score), and a list for a collection that grows. Tuples compare item by item from the left: (1, 9) < (2, 0) is True because 1 < 2 settles it, and the second items matter only when the first ones are equal.',
    ],
    {
      code: 'point = (3, 4)\nprint(point[0] + point[1])\nprint(len(point))\nprint((2, 9) < (3, 0))\nprint((2, 9) < (2, 5))',
      output: '7\n2\nTrue\nFalse',
      explanation:
        'Indexing reads 3 and 4. The first comparison is settled by 2 < 3; the second ties on 2 and then compares 9 < 5.',
    },
    [
      exercise(
        'Each tuple is (hour, minute). Set start_hour to the hour of a using indexing, and is_earlier to whether a comes before b, using a single tuple comparison.',
        'a = (9, 30)\nb = (10, 15)\n# Set start_hour and is_earlier.\n',
        'a = (9, 30)\nb = (10, 15)\nstart_hour = a[0]\nis_earlier = a < b',
        'assert start_hour == 9, "The hour is the first item."\nassert is_earlier is True, "9 < 10 decides the comparison."',
        'Index 0 holds the hour, and tuple comparison checks hours before minutes.',
        'Use a[0] and a < b.',
      ),
    ],
    [
      [
        'How do you write a tuple with one item?',
        'With a trailing comma, for example (5,).',
      ],
      [
        'How does Python compare (a1, a2) with (b1, b2)?',
        'It compares a1 with b1; only if they are equal does it compare a2 with b2.',
      ],
    ],
  ),

  skill(
    'for-loops',
    'sequences',
    'Repeat with for',
    'Perform one action for every item in a collection.',
    ['lists'],
    [
      'A for loop assigns each item from a collection to a loop variable, one at a time, then runs its indented body. The loop ends after the collection is exhausted. Choose a singular variable name such as color when iterating over colors.',
      'The body can contain multiple statements. Each body statement runs once for each item. A loop over an empty list runs its body zero times, which is useful when thinking through edge cases.',
      'To collect results, start with an empty list before the loop. results.append(value) adds one value to the end of results. The dot selects the list operation named append; parentheses supply the value to add. Calling append inside the loop builds a result list in iteration order.',
    ],
    {
      code: 'colors = ["blue", "gold"]\nfor color in colors:\n    print(f"Choose {color}")',
      output: 'Choose blue\nChoose gold',
      explanation:
        'color first refers to blue and then to gold. The body runs for each value.',
    },
    [
      exercise(
        'Build doubled by looping over numbers and appending twice each number. The list must preserve the original order.',
        'numbers = [3, 1, 5]\ndoubled = []\n# Your for loop goes here.\n',
        'numbers = [3, 1, 5]\ndoubled = []\nfor number in numbers:\n    doubled.append(number * 2)',
        'assert doubled == [6, 2, 10], "Double each input value in its original order."',
        'append() adds one result to the end of the list during each iteration.',
        'Inside your for loop, use doubled.append(number * 2).',
      ),
    ],
    [
      [
        'What does for item in items do?',
        'It assigns each item to the loop variable in turn and runs the indented body once per item.',
      ],
      ['How many iterations does an empty list produce?', 'Zero.'],
    ],
  ),

  skill(
    'unpacking',
    'sequences',
    'Unpack several values at once',
    'Assign the parts of a tuple to separate names, also inside loops.',
    ['tuples', 'for-loops'],
    [
      'Unpacking assigns each item of a tuple or list to its own name in one step: row, col = (2, 5) makes row 2 and col 5. The number of names must match the number of items, or Python raises ValueError. Writing values separated by commas also builds a tuple, so a, b = 1, 2 packs and unpacks in one line.',
      'Python evaluates the whole right side before changing any name, so a, b = b, a swaps two values without a temporary variable. A for loop can unpack each item too: for name, score in pairs: assigns both parts of each pair on every iteration.',
    ],
    {
      code: 'pairs = [("Ada", 3), ("Lin", 5)]\nfor name, score in pairs:\n    print(name, score)\nlow, high = 8, 2\nlow, high = high, low\nprint(low, high)',
      output: 'Ada 3\nLin 5\n2 8',
      explanation:
        'Each pair is split into name and score. The swap builds (2, 8) from the old values first and then assigns it.',
    },
    [
      exercise(
        'For each (name, minutes) pair in sessions, append the string "NAME: MINUTES" to labels, for example "Ada: 25". Unpack the pair in the for statement.',
        'sessions = [("Ada", 25), ("Lin", 40)]\nlabels = []\n# Loop and append.\n',
        'sessions = [("Ada", 25), ("Lin", 40)]\nlabels = []\nfor name, minutes in sessions:\n    labels.append(f"{name}: {minutes}")',
        'assert labels == ["Ada: 25", "Lin: 40"], "Format each name with its minutes, in order."',
        'Unpacking gives both parts of each pair a readable name inside the loop.',
        'Write for name, minutes in sessions: and append an f-string.',
      ),
    ],
    [
      ['How do you swap the values of a and b?', 'a, b = b, a.'],
      [
        'What happens if the number of names does not match the number of items?',
        'Python raises ValueError.',
      ],
    ],
  ),

  skill(
    'ranges',
    'sequences',
    'Count with range',
    'Generate precise sequences of integers for loops.',
    ['for-loops'],
    [
      'range(stop) produces integers starting at 0 and ending before stop. range(4) therefore produces 0, 1, 2, 3. The stop value is excluded; this aligns with zero-based list positions.',
      'range(start, stop, step) lets you choose a beginning and a step size. The default step is 1. A negative step can count downward. Use list(range(...)) when you want to see all the generated values together.',
    ],
    {
      code: 'for number in range(2, 7, 2):\n    print(number)',
      output: '2\n4\n6',
      explanation: 'Start at 2, add 2 each time, and stop before 7.',
    },
    [
      exercise(
        'Set even_numbers to a list of even integers from 2 through 10, inclusive, using range().',
        '# Set even_numbers.\n',
        'even_numbers = list(range(2, 11, 2))',
        'assert even_numbers == [2, 4, 6, 8, 10], "Include 10 by choosing a stop value after it."',
        'Using 11 as the excluded stop permits 10 to be included.',
        'Start at 2, stop before 11, and step by 2.',
      ),
    ],
    [
      [
        'Does range include its stop argument?',
        'No. The stop value is excluded.',
      ],
      ['What does range(2, 8, 2) produce?', '2, 4, 6.'],
    ],
  ),

  skill(
    'zip-enumerate',
    'sequences',
    'Loop with enumerate and zip',
    'Get positions with enumerate and walk two lists together with zip.',
    ['unpacking', 'ranges'],
    [
      'enumerate(items) pairs each item with its position: for i, item in enumerate(items) gives i = 0 with the first item, i = 1 with the second, and so on. A second argument changes the first number, so enumerate(items, 1) counts from 1. Use it instead of for i in range(len(items)) whenever you need both the position and the value.',
      'zip(a, b) pairs the items at the same position in two sequences: for x, y in zip(xs, ys) visits xs[0] with ys[0], then xs[1] with ys[1]. It stops when the shorter input runs out, silently dropping the extra items. Both functions produce their pairs one at a time; wrap them in list() to see all the pairs at once.',
    ],
    {
      code: 'names = ["Ada", "Lin"]\nscores = [90, 75]\nfor i, name in enumerate(names):\n    print(i, name)\nfor name, score in zip(names, scores):\n    print(f"{name}: {score}")',
      output: '0 Ada\n1 Lin\nAda: 90\nLin: 75',
      explanation:
        'enumerate supplies the positions 0 and 1; zip pairs each name with the score at the same position.',
    },
    [
      exercise(
        'Use zip to fill totals with price * quantity for each matching pair. Use enumerate to fill labels with strings like "1. pen", numbered from 1.',
        'items = ["pen", "cup"]\nprices = [2, 5]\nquantities = [3, 1]\ntotals = []\nlabels = []\n# Fill totals and labels.\n',
        'items = ["pen", "cup"]\nprices = [2, 5]\nquantities = [3, 1]\ntotals = []\nlabels = []\nfor price, quantity in zip(prices, quantities):\n    totals.append(price * quantity)\nfor number, item in enumerate(items, 1):\n    labels.append(f"{number}. {item}")',
        'assert totals == [6, 5], "Multiply the price and quantity at each position."\nassert labels == ["1. pen", "2. cup"], "Number the items from 1."',
        'zip pairs matching prices and quantities, and enumerate(items, 1) numbers the items from 1.',
        'Loop over zip(prices, quantities), then over enumerate(items, 1).',
      ),
    ],
    [
      [
        'What does enumerate(items) yield?',
        '(position, item) pairs, starting at position 0 unless another start is given.',
      ],
      ['When does zip(a, b) stop?', 'When the shorter input runs out.'],
    ],
  ),

  skill(
    'accumulators',
    'iteration',
    'Accumulate a result',
    'Combine many values into a running total or count.',
    ['for-loops', 'conditionals'],
    [
      'An accumulator keeps a result as a loop progresses. Initialize it before the loop, then update it inside the body. For a sum or count, start at 0. Initializing inside the loop would reset it every iteration.',
      'A conditional accumulator updates only when an item meets a rule. For example, count how many temperatures are above a threshold. Test an empty input: a sum or count should usually remain 0.',
      'For a numeric accumulator, total += number is shorthand for total = total + number. Similarly, count += 1 increases the count by one. The same shorthand works with other operators: total *= 2, n //= 10, and n %= 7. The name must already have a value before any such update.',
    ],
    {
      code: 'total = 0\nfor number in [2, 5, 3]:\n    total = total + number\nprint(total)',
      output: '10',
      explanation: 'total moves from 0 to 2, then 7, then 10.',
    },
    [
      exercise(
        'Set total_positive to the sum of only the positive values in numbers. Zero and negative values must not contribute.',
        'numbers = [-2, 5, 0, 3, -1]\ntotal_positive = 0\n# Accumulate the positive numbers.\n',
        'numbers = [-2, 5, 0, 3, -1]\ntotal_positive = 0\nfor number in numbers:\n    if number > 0:\n        total_positive += number',
        'assert total_positive == 8, "Only 5 and 3 should contribute."',
        'The total starts at zero and increases only for values greater than zero.',
        'Place the update inside an if number > 0 block.',
      ),
    ],
    [
      [
        'Where should you initialize an accumulator?',
        'Before the loop, so it is not reset on each iteration.',
      ],
      ['What does total += n mean?', 'total = total + n.'],
    ],
  ),

  skill(
    'while-loops',
    'iteration',
    'Repeat while a condition holds',
    'Control repetition with a condition that changes.',
    ['conditionals'],
    [
      'A while loop checks a condition before every iteration. If the condition is true, the indented body runs; if false, the loop ends. Unlike a for loop, a while loop does not require a collection of items.',
      'The body normally changes something used by the condition. If the condition can never become false, the loop runs forever. Trace the changing value and test its boundary to verify that the loop terminates.',
      'For numbers, count -= 1 is shorthand for count = count - 1, while count += 1 means count = count + 1. These updates can move a loop variable toward the value that makes its condition false.',
    ],
    {
      code: 'count = 3\nwhile count > 0:\n    print(count)\n    count -= 1\nprint("Go!")',
      output: '3\n2\n1\nGo!',
      explanation:
        'Each iteration decreases count. When count becomes zero, the condition is false.',
    },
    [
      exercise(
        'Starting with savings = 0, add 7 each iteration until savings is at least 20. Count the number of iterations in weeks.',
        'savings = 0\nweeks = 0\n# Use a while loop.\n',
        'savings = 0\nweeks = 0\nwhile savings < 20:\n    savings += 7\n    weeks += 1',
        'assert savings == 21, "Stop at the first total reaching at least 20."\nassert weeks == 3, "It takes three additions of 7."',
        'The loop stops after savings progresses through 7, 14, and 21.',
        'Use savings < 20 and update both savings and weeks inside the body.',
      ),
    ],
    [
      [
        'When can a while loop run zero times?',
        'When its condition is false before the first iteration.',
      ],
      [
        'How do you prevent an accidental infinite while loop?',
        'Ensure the body updates values so that the condition can eventually become false.',
      ],
    ],
  ),

  skill(
    'break-continue',
    'iteration',
    'Stop or skip inside a loop',
    'Leave a loop early with break and skip an iteration with continue.',
    ['while-loops', 'for-loops'],
    [
      'break ends the innermost loop immediately; execution continues with the first statement after that loop. continue skips the rest of the current iteration and goes straight to the next one. Both are normally placed inside an if, so they act only when a condition holds.',
      'while True: repeats until a break runs. It suits loops whose stopping test is easiest to write in the middle of the body; make sure some path always reaches the break. When loops are nested, break and continue affect only the loop that directly contains them.',
    ],
    {
      code: 'for n in [4, 7, -1, 9]:\n    if n < 0:\n        break\n    if n % 2 == 0:\n        continue\n    print(n)\nprint("done")',
      output: '7\ndone',
      explanation:
        '4 is skipped by continue, 7 is printed, and -1 triggers break, so 9 is never visited.',
    },
    [
      exercise(
        'Use while True and break to find the first positive whole number n whose square is greater than limit. Set first to that n.',
        'limit = 50\nn = 1\n# Loop with while True and break.\n',
        'limit = 50\nn = 1\nwhile True:\n    if n * n > limit:\n        break\n    n += 1\nfirst = n',
        'assert first == 8, "8 * 8 = 64 is the first square above 50."',
        'The loop increases n until n * n exceeds 50, then break leaves the loop with n at 8.',
        'Inside while True, break when n * n > limit; otherwise add 1 to n.',
      ),
    ],
    [
      [
        'How do break and continue differ?',
        'break ends the loop; continue skips to the next iteration.',
      ],
      [
        'In nested loops, which loop does break end?',
        'Only the innermost loop that contains it.',
      ],
    ],
  ),

  skill(
    'list-mutation',
    'iteration',
    'Change a list',
    'Add, replace, and remove items deliberately.',
    ['indexing', 'for-loops'],
    [
      'Lists are mutable: their contents can change. append(value) adds one item to the end, items[index] = value replaces one item, and pop() removes and returns the final item.',
      'Two variables can refer to the same list. If b = a, changes through b are visible through a. Use a.copy() when you want a separate shallow list. Prefer building a new list when filtering instead of removing items while iterating over the original.',
    ],
    {
      code: 'tasks = ["read", "practice"]\ntasks.append("review")\ntasks[0] = "plan"\nfinished = tasks.pop()\nprint(tasks)\nprint(finished)',
      output: "['plan', 'practice']\nreview",
      explanation:
        'append adds review, indexed assignment changes read, and pop removes review.',
    },
    [
      exercise(
        'Copy original into a separate list named updated. Replace its first item with 9, then append 4. Leave original unchanged.',
        'original = [1, 2, 3]\n# Create and change updated.\n',
        'original = [1, 2, 3]\nupdated = original.copy()\nupdated[0] = 9\nupdated.append(4)',
        'assert original == [1, 2, 3], "Do not modify the original list."\nassert updated == [9, 2, 3, 4], "Replace the first item, then append 4."\nassert updated is not original, "Create a separate list."',
        'copy() creates a distinct list so the changes do not affect the original.',
        'Start with updated = original.copy().',
      ),
    ],
    [
      [
        'How do append() and pop() change a list?',
        'append(value) adds at the end; pop() removes and returns the last item.',
      ],
      [
        'Does b = a copy a list?',
        'No. Both names refer to the same list. a.copy() creates a separate shallow list.',
      ],
    ],
  ),

  skill(
    'list-repetition',
    'iteration',
    'Make a list of repeated values',
    'Create fixed-size tables with [value] * n and update slots by index.',
    ['list-mutation', 'accumulators'],
    [
      '[value] * n builds a list holding n copies of value: [0] * 4 is [0, 0, 0, 0]. It is the quick way to make one slot per position before a loop fills them, such as a counter for every possible value or a seen flag for every item. Plan the size first: to use indexes 0 through n you need n + 1 slots.',
      'Update one slot by index, as in counts[i] += 1 or seen[i] = True. The + operator joins two lists into a new list, so [0] * 2 + [5] is [0, 0, 5]. Repetition works the same way for any simple value, such as False or None.',
    ],
    {
      code: 'rolls = [3, 1, 3, 6, 3]\ncounts = [0] * 7\nfor roll in rolls:\n    counts[roll] += 1\nprint(counts)\nprint(counts[3])',
      output: '[0, 1, 0, 3, 0, 0, 1]\n3',
      explanation:
        'Seven slots cover indexes 0 to 6. Each roll adds one to the slot whose index is the rolled value.',
    },
    [
      exercise(
        'Grades are whole numbers from 0 to 5. Set tally to a list of six zeros, then add 1 to tally[grade] for each grade in grades.',
        'grades = [5, 3, 5, 0, 2, 5]\n# Build tally.\n',
        'grades = [5, 3, 5, 0, 2, 5]\ntally = [0] * 6\nfor grade in grades:\n    tally[grade] += 1',
        'assert tally == [1, 0, 1, 1, 0, 3], "Count each grade in the slot with its value."',
        'Six slots cover grades 0 to 5, and each grade increments its own slot.',
        'Start with tally = [0] * 6 and use tally[grade] += 1 in the loop.',
      ),
    ],
    [
      ['What is [0] * 3?', '[0, 0, 0].'],
      ['How many slots do you need for indexes 0 through n?', 'n + 1.'],
    ],
  ),

  skill(
    'nested-lists',
    'iteration',
    'Work with lists of lists',
    'Index into rows and columns and loop over every cell.',
    ['list-mutation'],
    [
      'A list can contain other lists. A grid stored as rows is a list of row lists: grid = [[1, 2, 3], [4, 5, 6]]. grid[1] is the whole second row, and grid[1][2] indexes into that row to get 6. len(grid) counts the rows, and len(grid[0]) counts the items in the first row.',
      'grid[r][c] = value changes one cell of the existing grid. A loop inside another loop visits every cell: the outer loop picks a row, and the inner loop runs completely over that row before the outer loop moves on. Rows may have different lengths, so loop over each row itself rather than assuming a fixed width.',
    ],
    {
      code: 'grid = [[1, 2], [3, 4]]\nprint(grid[1][0])\ngrid[0][1] = 9\ncells = []\nfor row in grid:\n    for value in row:\n        cells.append(value)\nprint(cells)',
      output: '3\n[1, 9, 3, 4]',
      explanation:
        'grid[1][0] is the first item of the second row. After the update, the nested loop collects the cells row by row.',
    },
    [
      exercise(
        'Set center to the middle cell of board, then change its bottom-right cell to "X". Finally, fill flat with every cell, row by row, using nested loops.',
        'board = [["a", "b", "c"], ["d", "e", "f"], ["g", "h", "i"]]\nflat = []\n# Set center, update board, and fill flat.\n',
        'board = [["a", "b", "c"], ["d", "e", "f"], ["g", "h", "i"]]\nflat = []\ncenter = board[1][1]\nboard[2][2] = "X"\nfor row in board:\n    for cell in row:\n        flat.append(cell)',
        'assert center == "e", "The middle cell is row 1, column 1."\nassert board[2] == ["g", "h", "X"], "Change only the bottom-right cell."\nassert flat == ["a", "b", "c", "d", "e", "f", "g", "h", "X"], "Visit the rows in order, then the cells in each row."',
        'Two indexes select one cell, and nested loops visit the grid row by row.',
        'Use board[1][1], then board[2][2] = "X", then a loop over each row inside a loop over board.',
      ),
    ],
    [
      [
        'What does grid[r][c] select?',
        'Row r of grid, then item c of that row.',
      ],
      [
        'In nested loops, how often does the inner loop run?',
        'Completely, once for every iteration of the outer loop.',
      ],
    ],
  ),

  skill(
    'slicing',
    'iteration',
    'Take a slice',
    'Select a contiguous part of a list or string.',
    ['indexing'],
    [
      'sequence[start:stop] selects items from start up to, but not including, stop. Omitting start means the beginning; omitting stop means the end. Slicing works with both lists and strings.',
      'A third part gives the step: values[::2] selects every second item, and values[::-1] reverses the sequence. A slice extending beyond the end is shortened to the available items instead of raising IndexError.',
    ],
    {
      code: 'word = "python"\nprint(word[1:4])\nprint(word[:2])\nprint(word[::-1])',
      output: 'yth\npy\nnohtyp',
      explanation:
        'Indices 1, 2, and 3 produce yth. A step of -1 traverses backward.',
    },
    [
      exercise(
        'Set middle to the three middle values [20, 30, 40] using a slice of values. Set reversed_values to all values in reverse order.',
        'values = [10, 20, 30, 40, 50]\n# Set middle and reversed_values.\n',
        'values = [10, 20, 30, 40, 50]\nmiddle = values[1:4]\nreversed_values = values[::-1]',
        'assert middle == [20, 30, 40], "Select indices 1 through 3."\nassert reversed_values == [50, 40, 30, 20, 10], "Reverse the entire sequence."',
        'The stop 4 is excluded, while step -1 reverses all items.',
        'Use [1:4] for the middle and [::-1] for the reverse.',
      ),
    ],
    [
      [
        'Does sequence[start:stop] include stop?',
        'No. It includes start and excludes stop.',
      ],
      [
        'What does sequence[::-1] do?',
        'It returns the sequence in reverse order.',
      ],
    ],
  ),

  skill(
    'dictionaries',
    'organize',
    'Map keys to values',
    'Look up named data and handle missing keys.',
    ['accumulators'],
    [
      'A dictionary maps unique keys to values. Create one with braces and key: value pairs, such as {"name": "Ada", "score": 10}. Retrieve a value with data[key] and assign a value with data[key] = new_value.',
      'Accessing a missing key with brackets raises KeyError. data.get(key, default) returns a default instead. The in operator checks keys, not values. del data[key] removes a key and its value; deleting a missing key also raises KeyError. Dictionary keys must be hashable; strings and integers are common choices.',
    ],
    {
      code: 'scores = {"Ada": 10, "Lin": 8}\nscores["Ada"] = 12\nprint(scores["Ada"])\nprint(scores.get("Sam", 0))',
      output: '12\n0',
      explanation:
        'Ada already has a key, so assignment replaces its value. Missing Sam receives the default 0.',
    },
    [
      exercise(
        'Create inventory with apples = 3 and pears = 2. Increase apples by 4. Set oranges to the count of the missing oranges key, defaulting to 0.',
        '# Create and update inventory, then set oranges.\n',
        'inventory = {"apples": 3, "pears": 2}\ninventory["apples"] += 4\noranges = inventory.get("oranges", 0)',
        'assert inventory == {"apples": 7, "pears": 2}, "Add 4 to apples without changing pears."\nassert oranges == 0, "A missing fruit should default to zero."',
        'Dictionary assignment changes one key, and get() handles the missing fruit.',
        'Use inventory["apples"] += 4 and inventory.get("oranges", 0).',
      ),
    ],
    [
      [
        'What does key in a_dictionary check?',
        'Whether key exists among the dictionary keys.',
      ],
      [
        'How do you safely provide a value for a missing key?',
        'Use dictionary.get(key, default).',
      ],
    ],
  ),

  skill(
    'dictionary-loops',
    'organize',
    'Loop through mappings',
    'Iterate through keys, values, or key-value pairs.',
    ['dictionaries', 'unpacking'],
    [
      'Looping directly over a dictionary visits its keys. .values() visits the values. .items() visits key-value pairs, which can be unpacked into two loop variables such as for name, score in scores.items().',
      'Choose the view that matches the task. To sum scores, values() is sufficient. To build messages containing both names and scores, use items(). Avoid adding or removing dictionary keys while iterating over that dictionary.',
    ],
    {
      code: 'scores = {"Ada": 8, "Lin": 10}\nfor name, score in scores.items():\n    print(f"{name}: {score}")',
      output: 'Ada: 8\nLin: 10',
      explanation:
        'Each pair is unpacked so the loop has access to both the key and its associated value.',
    },
    [
      exercise(
        'Build a list named passed_names containing the names whose score is at least 60. Preserve dictionary insertion order.',
        'scores = {"Ada": 80, "Bo": 55, "Cy": 60}\npassed_names = []\n# Loop over names and scores.\n',
        'scores = {"Ada": 80, "Bo": 55, "Cy": 60}\npassed_names = []\nfor name, score in scores.items():\n    if score >= 60:\n        passed_names.append(name)',
        'assert passed_names == ["Ada", "Cy"], "Include Ada and the boundary score for Cy."',
        'items() supplies the name alongside its score; the inclusive comparison selects Ada and Cy.',
        'Unpack scores.items() into name and score, then test score >= 60.',
      ),
    ],
    [
      [
        'How do you iterate through dictionary values?',
        'Use for value in dictionary.values().',
      ],
      [
        'How do you iterate through dictionary key-value pairs?',
        'Use for key, value in dictionary.items().',
      ],
    ],
  ),

  skill(
    'sets',
    'organize',
    'Keep unique values in a set',
    'Remove duplicates, test membership, and combine groups.',
    ['dictionaries'],
    [
      'A set holds unique values, with no order and no indexes. Build one from a list with set(values), or write its members in braces, such as {1, 2}. An empty set must be written set(), because {} is an empty dictionary. Adding a value that is already present changes nothing, so len(a_set) counts distinct values.',
      'value in a_set stays fast even for huge sets, which makes sets ideal for “have I seen this?” checks; add a member with a_set.add(value). Combine sets with | (in either set), & (in both), and - (in the first but not the second). Like dictionary keys, members must be hashable: numbers and strings work, lists do not.',
    ],
    {
      code: 'visits = ["home", "blog", "home", "about"]\nunique = set(visits)\nprint(len(unique))\nprint("blog" in unique)\nunique.add("home")\nprint(len(unique))\nprint({1, 2, 3} & {2, 3, 4} == {2, 3})',
      output: '3\nTrue\n3\nTrue',
      explanation:
        'The duplicate home is stored once, adding it again changes nothing, and & keeps only the shared members.',
    },
    [
      exercise(
        'Set unique_count to the number of different tags, and shared to the set of tags that appear in both tags and featured.',
        'tags = ["ai", "web", "ai", "data"]\nfeatured = ["data", "cloud", "web"]\n# Set unique_count and shared.\n',
        'tags = ["ai", "web", "ai", "data"]\nfeatured = ["data", "cloud", "web"]\nunique_count = len(set(tags))\nshared = set(tags) & set(featured)',
        'assert unique_count == 3, "ai, web and data are distinct."\nassert shared == {"web", "data"}, "Keep only the tags present in both lists."',
        'A set drops duplicate tags, and & keeps the members found in both sets.',
        'Use len(set(tags)) and set(tags) & set(featured).',
      ),
    ],
    [
      ['How do you write an empty set?', 'set(). {} is an empty dictionary.'],
      [
        'What do |, & and - mean for sets?',
        'Union (in either), intersection (in both), and difference (in the first only).',
      ],
    ],
  ),

  skill(
    'functions',
    'organize',
    'Define a function',
    'Give a reusable block of code a name.',
    ['strings'],
    [
      'A function packages a reusable block of code. Define one with def, a name, parentheses, and a colon, followed by an indented body. Defining a function does not execute its body; a call such as greet() does.',
      'A parameter is a name in a function definition that receives an input. An argument is the value passed in a call. A variable assigned inside a function is normally local to that call, keeping temporary work separate from other code.',
    ],
    {
      code: 'def greet(name):\n    print(f"Hello, {name}!")\n\ngreet("Ada")\ngreet("Lin")',
      output: 'Hello, Ada!\nHello, Lin!',
      explanation:
        'The same function body runs twice with a different value assigned to the parameter name.',
    },
    [
      exercise(
        'Define a function named greet with one parameter name. It should print Hello, NAME! using the supplied name.',
        'def greet(name):\n    # Write the function body.\n    pass\n',
        'def greet(name):\n    print(f"Hello, {name}!")',
        'import io, contextlib\n_capture = io.StringIO()\nwith contextlib.redirect_stdout(_capture):\n    greet("Ada")\n    greet("Lin")\nassert _capture.getvalue().strip() == "Hello, Ada!\\nHello, Lin!", "The function must use each supplied name."',
        'The function formats its parameter into the greeting each time it is called.',
        'Indent a print() statement beneath def and use an f-string.',
      ),
    ],
    [
      [
        'Does defining a function run its body?',
        'No. The body runs when the function is called.',
      ],
      [
        'How do a parameter and an argument differ?',
        'A parameter is a name in the definition; an argument is a value supplied in a call.',
      ],
    ],
  ),

  skill(
    'return-values',
    'organize',
    'Return a result',
    'Make a function produce a value its caller can use.',
    ['functions', 'conditionals'],
    [
      'return sends a value back to the caller and immediately exits the function. Printing displays output; returning provides data that can be assigned, tested, or combined with other results.',
      'If a function reaches its end without a return value, it returns None. Use early returns to handle a special case before the main calculation. A statement after an unconditional return in the same path is never reached.',
    ],
    {
      code: 'def double(number):\n    return number * 2\n\nresult = double(6)\nprint(result + 1)',
      output: '13',
      explanation:
        'The function returns 12. The caller stores it in result and adds 1.',
    },
    [
      exercise(
        'Define absolute_value(number). Return number when it is nonnegative and -number when it is negative.',
        'def absolute_value(number):\n    # Return the magnitude of number.\n    pass\n',
        'def absolute_value(number):\n    if number < 0:\n        return -number\n    return number',
        'assert absolute_value(-7) == 7, "Handle a negative input."\nassert absolute_value(4) == 4, "Keep a positive input unchanged."\nassert absolute_value(0) == 0, "Zero is a valid boundary case."',
        'The conditional negates negative values; nonnegative values are returned directly.',
        'Use an if for negative numbers and return on both paths.',
      ),
    ],
    [
      [
        'How do print() and return differ?',
        'print() displays output; return gives a value to the caller and exits the function.',
      ],
      [
        'What is returned when a function has no explicit return value?',
        'None.',
      ],
    ],
  ),

  skill(
    'multiple-returns',
    'organize',
    'Return several values',
    'Return a tuple from a function and unpack it at the call.',
    ['unpacking', 'return-values'],
    [
      'A function can hand back several results at once by returning a tuple: return low, high. The comma builds the tuple; parentheses are optional. This keeps related results together instead of forcing the caller to call two functions.',
      'The caller usually unpacks the result right away: low, high = bounds(values). Use exactly as many names as the function returns, or Python raises ValueError. If you keep the whole tuple in one name instead, read its parts by index, such as result[0].',
    ],
    {
      code: 'def split_minutes(total):\n    return total // 60, total % 60\n\nhours, minutes = split_minutes(135)\nprint(hours, minutes)\nprint(split_minutes(59))',
      output: '2 15\n(0, 59)',
      explanation:
        'The function returns the tuple (2, 15), which the caller unpacks. Printing a returned tuple directly shows its parentheses.',
    },
    [
      exercise(
        'Define divide(a, b) so that it returns two values: the floor quotient a // b and the remainder a % b, in that order.',
        'def divide(a, b):\n    # Return the quotient and the remainder.\n    pass\n',
        'def divide(a, b):\n    return a // b, a % b',
        'assert divide(17, 5) == (3, 2), "17 is 3 groups of 5 with 2 left."\nassert divide(4, 4) == (1, 0), "An exact division leaves 0."\nq, r = divide(9, 2)\nassert (q, r) == (4, 1), "The result must unpack into two names."',
        'Returning a // b, a % b builds a tuple that the caller can unpack.',
        'Write return a // b, a % b.',
      ),
    ],
    [
      [
        'How does a Python function return two values?',
        'It returns a tuple, for example return low, high.',
      ],
      [
        'How does a caller use both returned values?',
        'By unpacking them: low, high = bounds(values).',
      ],
    ],
  ),

  skill(
    'recursion',
    'organize',
    'Call a function from itself',
    'Solve a problem through a smaller version of the same problem.',
    ['return-values'],
    [
      'A recursive function calls itself on a smaller version of its problem. It needs a base case that returns an answer directly, and a recursive case that moves the input toward that base case. If the input never reaches the base case, the calls never stop and Python raises RecursionError.',
      'Each call has its own parameters and local variables, and it waits for the call it made to return before it continues. factorial(3) calls factorial(2), which calls factorial(1); the answers then come back in reverse order: 1, then 2 × 1, then 3 × 2. A function may also define a helper function inside its body. The helper can read the parameters and variables of the enclosing function, which keeps a recursive helper close to the data it needs.',
    ],
    {
      code: 'def factorial(n):\n    if n <= 1:\n        return 1\n    return n * factorial(n - 1)\n\nprint(factorial(4))',
      output: '24',
      explanation:
        'factorial(4) waits for factorial(3), which waits for factorial(2) and factorial(1). The returned values multiply back up: 1, 2, 6, 24.',
    },
    [
      exercise(
        'Define digit_sum(n) recursively for a nonnegative integer n: 0 has digit sum 0, and otherwise the digit sum is the last digit, n % 10, plus the digit sum of n // 10.',
        'def digit_sum(n):\n    # Add a base case and a recursive case.\n    pass\n',
        'def digit_sum(n):\n    if n == 0:\n        return 0\n    return n % 10 + digit_sum(n // 10)',
        'assert digit_sum(0) == 0, "The base case is 0."\nassert digit_sum(7) == 7, "A single digit is its own sum."\nassert digit_sum(1234) == 10, "1 + 2 + 3 + 4 is 10."\nassert digit_sum(9005) == 14, "Zeros add nothing."',
        'n // 10 removes the last digit, so every call moves toward the base case 0.',
        'Return 0 when n == 0; otherwise return n % 10 + digit_sum(n // 10).',
      ),
    ],
    [
      [
        'What are the two parts of a recursive function?',
        'A base case that answers directly and a recursive case that calls the function on a smaller input.',
      ],
      [
        'What happens if recursion never reaches its base case?',
        'The calls continue until Python raises RecursionError.',
      ],
    ],
  ),

  skill(
    'parameters',
    'solve',
    'Design useful inputs',
    'Call functions with positional, keyword, and default arguments.',
    ['return-values', 'list-mutation', 'truthiness'],
    [
      'A function can accept several parameters. Positional arguments match parameters in order; keyword arguments name the parameter they fill. A default value makes an argument optional when the caller omits it.',
      'Put parameters without defaults before parameters with defaults. Use immutable default values such as numbers, strings, or None. A mutable default like [] is created once and can accidentally share state across calls.',
    ],
    {
      code: 'def price_total(price, quantity=1):\n    return price * quantity\n\nprint(price_total(5))\nprint(price_total(quantity=3, price=5))',
      output: '5\n15',
      explanation:
        'The first call uses the default quantity. Keyword arguments make the second call explicit.',
    },
    [
      exercise(
        'Define total_cost(price, quantity=1, discount=0). Return price * quantity - discount. Support omitted defaults and keyword calls.',
        'def total_cost(price, quantity=1, discount=0):\n    pass\n',
        'def total_cost(price, quantity=1, discount=0):\n    return price * quantity - discount',
        'assert total_cost(8) == 8, "Use the default quantity and discount."\nassert total_cost(8, 3) == 24, "Support positional quantity."\nassert total_cost(price=8, quantity=3, discount=5) == 19, "Support keyword arguments."',
        'Each input has one clear role; defaults supply a single item and no discount.',
        'Return the product of price and quantity, then subtract discount.',
      ),
    ],
    [
      [
        'How does a default parameter behave?',
        'Its default value is used when the caller omits that argument.',
      ],
      [
        'Why should a mutable default such as [] usually be avoided?',
        'The same default object is reused across calls, so changes can persist unexpectedly.',
      ],
    ],
  ),

  skill(
    'comprehensions',
    'solve',
    'Transform and filter',
    'Build a list with an expression and an optional condition.',
    ['for-loops', 'conditionals'],
    [
      'A list comprehension builds a new list from an iterable. The form is [expression for item in items]. The expression gives the new value, and the for part supplies the original items.',
      'Add if condition at the end to keep only selected items: [n * 2 for n in numbers if n > 0]. The condition applies to the original item before the result is added. Keep comprehensions short; a normal loop is clearer for complicated multi-step work.',
    ],
    {
      code: 'numbers = [-2, 1, 3, 0]\nsquares = [n * n for n in numbers if n > 0]\nprint(squares)',
      output: '[1, 9]',
      explanation:
        'Only 1 and 3 pass the condition. Their squares become the new list.',
    },
    [
      exercise(
        'Set long_lengths to the lengths of words with at least four characters, preserving order. Use a list comprehension.',
        'words = ["sun", "moon", "planet", "a"]\n# Set long_lengths.\n',
        'words = ["sun", "moon", "planet", "a"]\nlong_lengths = [len(word) for word in words if len(word) >= 4]',
        'assert long_lengths == [4, 6], "Keep moon and planet, then calculate their lengths."',
        'The condition selects words first, and len(word) is the result placed in the list.',
        'Use len(word) as the expression and len(word) >= 4 as the filter.',
      ),
    ],
    [
      [
        'What is the general form of a list comprehension?',
        '[expression for item in items], optionally followed by if condition.',
      ],
      [
        'Where does a list comprehension filter go?',
        'After the for clause, for example [n for n in values if n > 0].',
      ],
    ],
  ),

  skill(
    'build-nested-lists',
    'solve',
    'Build grids safely',
    'Create independent rows with a comprehension instead of repeating one list.',
    ['nested-lists', 'list-repetition', 'comprehensions', 'ranges'],
    [
      'To build a grid of zeros with rows rows and cols columns, make a fresh row for each row index: [[0] * cols for _ in range(rows)]. The underscore is a conventional name for a loop variable that the expression does not use. The same pattern with [] gives n separate empty lists: [[] for _ in range(n)]. The row expression may also use the loop variable, or be a comprehension itself.',
      'Do not write [[0] * cols] * rows. Repeating a list that contains a list repeats a reference to the same inner list, not new rows: every row is the same list, so changing grid[0][0] changes the first cell of every row. [0] * cols is safe because a number cannot change in place; assigning to a slot replaces it.',
    ],
    {
      code: 'safe = [[0] * 3 for _ in range(2)]\nsafe[0][0] = 7\nprint(safe)\nshared = [[0] * 3] * 2\nshared[0][0] = 7\nprint(shared)',
      output: '[[7, 0, 0], [0, 0, 0]]\n[[7, 0, 0], [7, 0, 0]]',
      explanation:
        'The comprehension builds two separate rows. Repeating the outer list makes both rows the same list, so one change shows up twice.',
    },
    [
      exercise(
        'Set seats to a grid of 3 rows and 4 columns filled with "." strings, with independent rows. Then mark the seat in row 1, column 2 with "X".',
        '# Build seats, then mark one seat.\n',
        'seats = [["."] * 4 for _ in range(3)]\nseats[1][2] = "X"',
        'assert seats == [[".", ".", ".", "."], [".", ".", "X", "."], [".", ".", ".", "."]], "Mark only row 1, column 2."\nassert seats[0] is not seats[2], "Each row must be its own list."',
        'The comprehension creates a new row for every row index, so marking one seat changes one row.',
        'Use [["."] * 4 for _ in range(3)], then seats[1][2] = "X".',
      ),
    ],
    [
      [
        'How do you build a grid of zeros with rows rows and cols columns?',
        '[[0] * cols for _ in range(rows)].',
      ],
      [
        'Why is [[0] * cols] * rows wrong?',
        'Every row is the same inner list, so changing one row changes all of them.',
      ],
    ],
  ),

  skill(
    'generator-expressions',
    'solve',
    'Feed a loop into sum, any, and all',
    'Pass generator expressions to functions that consume values one at a time.',
    ['comprehensions', 'number-builtins'],
    [
      'A generator expression looks like a list comprehension without the square brackets: sum(x * x for x in values). It produces its values one at a time for the function that consumes them, so no intermediate list is built. When it is the only argument, the parentheses of the call are enough, and it can end with an if filter just like a comprehension.',
      'any(...) returns True if at least one value is true, and all(...) returns True only if every value is true. Both stop as soon as the answer is known. For an empty input, any returns False and all returns True, because no item breaks the rule. min and max accept generator expressions too.',
    ],
    {
      code: 'scores = [72, 95, 88]\nprint(sum(s - 70 for s in scores))\nprint(any(s > 90 for s in scores))\nprint(all(s >= 75 for s in scores))',
      output: '45\nTrue\nFalse',
      explanation:
        'The differences 2, 25 and 18 sum to 45. One score is above 90, but 72 fails the test for all.',
    },
    [
      exercise(
        'Using generator expressions, set total_sq to the sum of the squares of values, and has_negative to whether any value is negative.',
        'values = [3, -1, 2]\n# Set total_sq and has_negative.\n',
        'values = [3, -1, 2]\ntotal_sq = sum(v * v for v in values)\nhas_negative = any(v < 0 for v in values)',
        'assert total_sq == 14, "9 + 1 + 4 is 14."\nassert has_negative is True, "-1 is negative."',
        'sum adds each square as it is produced, and any stops at the first negative value.',
        'Use sum(v * v for v in values) and any(v < 0 for v in values).',
      ),
    ],
    [
      [
        'What does a generator expression look like?',
        'A comprehension without square brackets, for example sum(x * x for x in values).',
      ],
      [
        'What do any([]) and all([]) return?',
        'any([]) is False; all([]) is True.',
      ],
    ],
  ),

  skill(
    'errors',
    'solve',
    'Handle expected failures',
    'Read errors and recover from invalid input.',
    ['return-values'],
    [
      'An exception reports a failure during execution. Read the final line of a traceback for the exception type and message, then locate the indicated line of your code. A ValueError often means a conversion received unsuitable content; a NameError often means a name is missing or misspelled.',
      'Use try/except to handle an expected failure. Put the operation that can fail in try and catch the specific exception you know how to handle. Broadly catching every exception can hide programming errors that should be fixed. Your own code can report a failure with raise ValueError("message"), which stops the function just as a built-in error would.',
    ],
    {
      code: 'def parse_count(text):\n    try:\n        return int(text)\n    except ValueError:\n        return 0\n\nprint(parse_count("12"))\nprint(parse_count("oops"))',
      output: '12\n0',
      explanation:
        'The successful conversion returns 12. The invalid text raises ValueError, which the except branch handles.',
    },
    [
      exercise(
        'Define parse_integer(text). Return int(text) when possible; return None if converting the text raises ValueError.',
        'def parse_integer(text):\n    # Handle invalid integer text.\n    pass\n',
        'def parse_integer(text):\n    try:\n        return int(text)\n    except ValueError:\n        return None',
        'assert parse_integer("14") == 14, "Convert valid integer text."\nassert parse_integer("-3") == -3, "Handle negative integers."\nassert parse_integer("bad") is None, "Return None for invalid text."\nassert parse_integer("") is None, "An empty string is invalid too."',
        'Only the ValueError conversion failure becomes None; valid values are returned.',
        'Place int(text) inside try and return None from except ValueError.',
      ),
    ],
    [
      [
        'Which exception is raised by int("hello")?',
        'ValueError, because the text cannot be converted to an integer.',
      ],
      [
        'Why catch a specific exception type?',
        'It handles an expected failure without hiding unrelated programming errors.',
      ],
    ],
  ),

  skill(
    'problem-solving',
    'solve',
    'Build a word counter',
    'Combine functions, loops, dictionaries, and boundary tests.',
    ['dictionaries', 'return-values'],
    [
      'Before coding, state the input and output clearly. For a word counter, the input is a list of words and the output is a dictionary mapping each word to its frequency. Work through a tiny example by hand, then choose the data structure that matches the result.',
      'Build the solution one step at a time: initialize an empty dictionary, visit each word, read its previous count with a default of zero, and add one. Test an empty list, repeated words, and several different words. Small assertions document the behavior and expose mistakes early.',
    ],
    {
      code: 'def count_words(words):\n    counts = {}\n    for word in words:\n        counts[word] = counts.get(word, 0) + 1\n    return counts\n\nprint(count_words(["code", "learn", "code"]))',
      output: "{'code': 2, 'learn': 1}",
      explanation:
        'The first occurrence starts from zero. Later occurrences increase the stored count.',
    },
    [
      exercise(
        'Define count_words(words), returning a dictionary of word frequencies. Treat uppercase and lowercase as different words. Do not modify the input list.',
        'def count_words(words):\n    # Build and return the frequency dictionary.\n    pass\n',
        'def count_words(words):\n    counts = {}\n    for word in words:\n        counts[word] = counts.get(word, 0) + 1\n    return counts',
        'assert count_words([]) == {}, "Handle an empty input."\nassert count_words(["a", "b", "a"]) == {"a": 2, "b": 1}, "Count repeated words."\nassert count_words(["Hi", "hi"]) == {"Hi": 1, "hi": 1}, "Case is significant."\n_original = ["x", "x", "y"]\nassert count_words(_original) == {"x": 2, "y": 1}\nassert _original == ["x", "x", "y"], "Keep the input unchanged."',
        'Each word updates one dictionary entry, and the result is returned after the loop.',
        'Use counts[word] = counts.get(word, 0) + 1 inside a loop.',
      ),
    ],
    [
      [
        'What edge cases should a frequency counter test?',
        'Empty input, repeated values, multiple distinct values, and any specified case sensitivity.',
      ],
      [
        'How do you increment a dictionary count for a possibly unseen key?',
        'counts[key] = counts.get(key, 0) + 1.',
      ],
    ],
  ),

  skill(
    'sorting',
    'toolkit',
    'Sort a list',
    'Choose between sorted() and list.sort(), in either direction.',
    ['parameters'],
    [
      'sorted(values) returns a new list in ascending order and leaves values unchanged. values.sort() reorders the list itself and returns None, so result = values.sort() stores None. Strings sort character by character, and every uppercase letter comes before every lowercase letter, so "Zoe" sorts before "ada".',
      'Pass the keyword argument reverse=True to either one for descending order. reversed(values) walks a sequence backward without sorting it; wrap it in list() to see the items. Sorting compares items with <, so a list that mixes numbers and strings cannot be sorted and raises TypeError.',
    ],
    {
      code: 'values = [5, 2, 9, 2]\nprint(sorted(values))\nprint(values)\nvalues.sort(reverse=True)\nprint(values)\nprint(list(reversed([1, 2, 3])))',
      output: '[2, 2, 5, 9]\n[5, 2, 9, 2]\n[9, 5, 2, 2]\n[3, 2, 1]',
      explanation:
        'sorted returns a copy and leaves values alone. sort(reverse=True) then reorders values itself. reversed only reverses the existing order.',
    },
    [
      exercise(
        'Set ranked to a new list of points from highest to lowest, leaving points unchanged. Then sort names in place.',
        'points = [40, 85, 62, 85]\nnames = ["Zoe", "ada", "Lin"]\n# Set ranked, then sort names.\n',
        'points = [40, 85, 62, 85]\nnames = ["Zoe", "ada", "Lin"]\nranked = sorted(points, reverse=True)\nnames.sort()',
        'assert ranked == [85, 85, 62, 40], "Sort the points from highest to lowest."\nassert points == [40, 85, 62, 85], "Do not change points."\nassert names == ["Lin", "Zoe", "ada"], "Sort names itself; capitals come first."',
        'sorted returns a new descending list, while sort reorders names in place.',
        'Use sorted(points, reverse=True) and names.sort().',
      ),
    ],
    [
      [
        'How do sorted(values) and values.sort() differ?',
        'sorted returns a new sorted list; sort reorders values in place and returns None.',
      ],
      [
        'How do you sort in descending order?',
        'Pass reverse=True to sorted or sort.',
      ],
    ],
  ),

  skill(
    'key-functions',
    'toolkit',
    'Sort by a key',
    'Order and pick items by a computed key written with lambda.',
    ['sorting', 'tuples', 'number-builtins'],
    [
      'key= tells sorted, list.sort, min, and max what to compare. The key is a function applied to each item; the items are ordered by those results, but the original items are what you get back. sorted(words, key=len) orders words by length, and max(words, key=len) returns the longest word itself, not its length.',
      'lambda builds a small unnamed function inline: lambda pair: pair[1] takes a pair and returns its second item. Return a tuple to order by several fields: key=lambda p: (p[1], p[0]) sorts by the second field and breaks ties with the first. Negate a number in the key to reverse just that field. Python sorts are stable: items with equal keys keep their original order.',
    ],
    {
      code: 'people = [("Ada", 36), ("Lin", 29), ("Bo", 36)]\nprint(sorted(people, key=lambda p: p[1]))\nprint(max(people, key=lambda p: p[1]))\nprint(sorted(people, key=lambda p: (-p[1], p[0])))',
      output:
        "[('Lin', 29), ('Ada', 36), ('Bo', 36)]\n('Ada', 36)\n[('Ada', 36), ('Bo', 36), ('Lin', 29)]",
      explanation:
        'Ages decide the first order, and Ada stays ahead of Bo on the tie. max returns the first pair with the top age. The tuple key sorts ages downward and names upward.',
    },
    [
      exercise(
        'Set by_price to products sorted by price, the second field, keeping tied products in their original order. Set priciest to the product with the highest price.',
        'products = [("pen", 3), ("book", 12), ("cup", 3)]\n# Set by_price and priciest.\n',
        'products = [("pen", 3), ("book", 12), ("cup", 3)]\nby_price = sorted(products, key=lambda p: p[1])\npriciest = max(products, key=lambda p: p[1])',
        'assert by_price == [("pen", 3), ("cup", 3), ("book", 12)], "Sort by price; pen stays ahead of cup."\nassert priciest == ("book", 12), "Return the whole product."',
        'A stable sort keeps pen before cup, and max returns the whole product with the largest key.',
        'Use key=lambda p: p[1] with both sorted and max.',
      ),
    ],
    [
      [
        'What does key=len do in sorted(words, key=len)?',
        'It orders the words by their lengths and returns the words.',
      ],
      [
        'How do you sort by one field and break ties with another?',
        'Return a tuple key, for example key=lambda p: (p[1], p[0]).',
      ],
    ],
  ),

  skill(
    'bitwise',
    'toolkit',
    'Work with bits',
    'Read binary and use &, |, ^, ~, << and >> on integers.',
    ['numbers'],
    [
      'Integers are stored in binary. bin(13) shows 0b1101: reading from the right, the bits are worth 1, 2, 4, and 8, so 13 = 8 + 4 + 1. Bitwise operators act on each bit position separately: & keeps a bit only if it is set in both numbers, | keeps it if it is set in either, and ^ keeps it if it is set in exactly one.',
      'x << k shifts every bit left by k places, which multiplies by 2 ** k; x >> k shifts right and drops the lowest k bits, like x // 2 ** k. 1 << k has only bit k set, so x & (1 << k) is nonzero exactly when bit k of x is set. ~x flips every bit and equals -x - 1, so mask & ~bit clears one bit. Shifts bind more loosely than + and -: 1 << k + 1 means 1 << (k + 1).',
    ],
    {
      code: 'a = 12\nb = 10\nprint(bin(a), bin(b))\nprint(a & b, a | b, a ^ b)\nprint(1 << 3, a >> 2)',
      output: '0b1100 0b1010\n8 14 6\n8 3',
      explanation:
        '1100 & 1010 is 1000 (8), | gives 1110 (14), and ^ gives 0110 (6). 1 << 3 is 8, and 12 >> 2 drops two bits to leave 3.',
    },
    [
      exercise(
        'Set flags to 5 with bit 1 turned on (use |), low to the lowest two bits of 13 (use & with 3), and half to 13 shifted right by one place.',
        '# Set flags, low, and half.\n',
        'flags = 5 | (1 << 1)\nlow = 13 & 3\nhalf = 13 >> 1',
        'assert flags == 7, "5 is 101; turning on bit 1 gives 111."\nassert low == 1, "13 is 1101; its lowest two bits are 01."\nassert half == 6, "1101 shifted right is 110."',
        '| turns a bit on, & 3 keeps the last two bits, and >> 1 halves with floor division.',
        'Use 5 | (1 << 1), 13 & 3 and 13 >> 1.',
      ),
    ],
    [
      [
        'What does x & (1 << k) test?',
        'Whether bit k of x is set: the result is nonzero exactly then.',
      ],
      [
        'What do x << k and x >> k compute for a nonnegative x?',
        'x * 2 ** k and x // 2 ** k.',
      ],
    ],
  ),

  skill(
    'imports',
    'library',
    'Import a module',
    'Load standard-library code with import, from, and as.',
    ['numbers'],
    [
      'A module is a file of ready-made Python code. import math loads the math module, and a dot reaches its contents: math.sqrt(16) is 4.0 and math.pi is about 3.14159. math.floor and math.ceil round down or up to a whole number, and math.inf is a value larger than every number. Put imports at the top of a program so readers see its dependencies first.',
      'from math import gcd brings one name in directly, so you can call gcd(12, 18) without the math. prefix. import numpy as np loads a module under a shorter alias, a convention you will see in data code. Importing only makes names available; a misspelled module name raises ModuleNotFoundError.',
    ],
    {
      code: 'import math\nfrom math import gcd\nprint(math.sqrt(49))\nprint(math.ceil(7 / 2), math.floor(7 / 2))\nprint(gcd(12, 18))',
      output: '7.0\n4 3\n6',
      explanation:
        'sqrt returns a float. 3.5 rounds up to 4 and down to 3. gcd was imported by name, so it needs no prefix.',
    },
    [
      exercise(
        'Import math. Set hypotenuse to the length of the long side of a right triangle with legs 6 and 8, using math.sqrt, and boxes to the number of boxes of 12 needed for 50 items, using math.ceil.',
        '# Import math, then set hypotenuse and boxes.\n',
        'import math\nhypotenuse = math.sqrt(6 ** 2 + 8 ** 2)\nboxes = math.ceil(50 / 12)',
        'assert hypotenuse == 10.0, "sqrt(36 + 64) is 10.0."\nassert boxes == 5, "Four boxes hold 48, so 50 items need 5."\nassert isinstance(boxes, int), "ceil returns a whole number."',
        'sqrt finds the square root of 100, and ceil rounds 4.17 up to 5 boxes.',
        'Use math.sqrt(6 ** 2 + 8 ** 2) and math.ceil(50 / 12).',
      ),
    ],
    [
      [
        'How do import math and from math import sqrt differ?',
        'The first needs math.sqrt; the second lets you call sqrt directly.',
      ],
      [
        'What does import numpy as np do?',
        'It imports numpy under the alias np.',
      ],
    ],
  ),

  skill(
    'collections-module',
    'library',
    'Queue and count with collections',
    'Use deque for first-in, first-out queues and Counter for tallies.',
    ['imports', 'dictionaries', 'list-mutation'],
    [
      'from collections import deque gives a double-ended queue. append adds to the right end and popleft removes from the left end, both quickly, which makes deque the right tool for first-in, first-out work. A list can do the same with pop(0), but that shifts every remaining item and becomes slow for long lists. deque(items) starts a queue from existing items.',
      'Counter counts hashable items: Counter(["a", "b", "a"]) behaves like the dictionary {"a": 2, "b": 1}. Looking up a missing key returns 0 instead of raising KeyError, so counts[item] += 1 works without get. Like any dictionary, it supports in, len, and lookup by key.',
    ],
    {
      code: 'from collections import deque, Counter\nqueue = deque(["Ada", "Lin"])\nqueue.append("Bo")\nprint(queue.popleft())\nprint(len(queue))\ndrinks = Counter(["tea", "coffee", "tea"])\nprint(drinks["tea"], drinks["juice"])',
      output: 'Ada\n2\n2 0',
      explanation:
        'Bo joins at the right and Ada leaves from the left. Counter stores 2 for tea and answers 0 for juice, which never appeared.',
    },
    [
      exercise(
        'Set tally to a Counter of votes, then set yes_votes to the count for "yes" and maybe_votes to the count for "maybe". Then make line a deque of waiting, append "Zed", and set served to the person removed from the front.',
        'from collections import Counter, deque\nvotes = ["yes", "no", "yes", "yes"]\nwaiting = ["Ana", "Ben"]\n# Count the votes, then serve the queue.\n',
        'from collections import Counter, deque\nvotes = ["yes", "no", "yes", "yes"]\nwaiting = ["Ana", "Ben"]\ntally = Counter(votes)\nyes_votes = tally["yes"]\nmaybe_votes = tally["maybe"]\nline = deque(waiting)\nline.append("Zed")\nserved = line.popleft()',
        'assert yes_votes == 3, "yes appears three times."\nassert maybe_votes == 0, "A missing key counts as 0."\nassert served == "Ana", "The first person waiting is served first."\nassert list(line) == ["Ben", "Zed"], "Zed joins at the back."',
        'Counter tallies the votes, and the deque serves people in the order they arrived.',
        'Use Counter(votes) and deque(waiting), then append and popleft.',
      ),
    ],
    [
      [
        'Which deque methods form a first-in, first-out queue?',
        'append to add at the right end and popleft to remove from the left end.',
      ],
      [
        'What does a Counter return for a missing key?',
        '0, instead of raising KeyError.',
      ],
    ],
  ),

  skill(
    'heapq-module',
    'library',
    'Take the smallest item with heapq',
    'Keep a priority queue in a list with heappush and heappop.',
    ['imports', 'tuples', 'list-mutation'],
    [
      'A heap is a list arranged so that its smallest item is always at index 0. After import heapq, heapq.heappush(heap, item) adds an item and heapq.heappop(heap) removes and returns the smallest, each in about log n steps. heapq.heapify(items) rearranges an existing list into a heap in place. The rest of the list is not sorted; only heap[0] is guaranteed.',
      'Push tuples to attach data to a priority: (priority, name) pairs come out in priority order, and tuple comparison breaks ties with the next field. heapq always pops the smallest item, so to get the largest first, push negated priorities and negate them again when you pop.',
    ],
    {
      code: 'import heapq\ntasks = []\nheapq.heappush(tasks, (3, "write"))\nheapq.heappush(tasks, (1, "plan"))\nheapq.heappush(tasks, (2, "test"))\nprint(tasks[0])\nprint(heapq.heappop(tasks))\nprint(heapq.heappop(tasks))',
      output: "(1, 'plan')\n(1, 'plan')\n(2, 'test')",
      explanation:
        'The smallest tuple sits at index 0. Each heappop removes the current smallest, so the tasks come out by priority.',
    },
    [
      exercise(
        'Turn times into a heap with heapify, then set first_two to a list of the two smallest times, removed in order with heappop.',
        'import heapq\ntimes = [42, 17, 30, 8]\n# Heapify, then pop twice.\n',
        'import heapq\ntimes = [42, 17, 30, 8]\nheapq.heapify(times)\nfirst_two = [heapq.heappop(times), heapq.heappop(times)]',
        'assert first_two == [8, 17], "Pop the smallest, then the next smallest."\nassert len(times) == 2, "Two times remain in the heap."\nassert times[0] == 30, "The heap keeps its smallest remaining item first."',
        'heapify arranges the list so that each heappop returns the current smallest time.',
        'Call heapq.heapify(times), then heapq.heappop(times) twice.',
      ),
    ],
    [
      [
        'What does heapq.heappop(heap) return?',
        'The smallest item, which it also removes.',
      ],
      [
        'How do you attach data to a priority in a heap?',
        'Push (priority, data) tuples; the smallest priority comes out first.',
      ],
    ],
  ),

  skill(
    'bisect-module',
    'library',
    'Search a sorted list with bisect',
    'Find insertion points and count values with binary search.',
    ['imports', 'sorting'],
    [
      'from bisect import bisect_left gives a binary search over a sorted list. bisect_left(values, x) returns the first index where x could be inserted while keeping values sorted: every item before that index is smaller than x. It needs only about log n comparisons, but the list must already be sorted in ascending order, or the answer is meaningless.',
      'bisect_right(values, x) returns the index just after any items equal to x. The difference bisect_right(values, x) - bisect_left(values, x) counts the copies of x, and bisect_left(values, x) on its own counts the items smaller than x. insort(values, x) inserts x at its sorted position.',
    ],
    {
      code: 'from bisect import bisect_left, bisect_right\nscores = [10, 20, 20, 30]\nprint(bisect_left(scores, 20))\nprint(bisect_right(scores, 20))\nprint(bisect_left(scores, 25))',
      output: '1\n3\n3',
      explanation:
        'The 20s occupy indexes 1 and 2, so the left insertion point is 1 and the right one is 3. 25 belongs before 30, at index 3.',
    },
    [
      exercise(
        'prices is sorted. Set cheaper to the number of prices below 50, and fifties to the number of prices equal to exactly 50, using bisect_left and bisect_right.',
        'from bisect import bisect_left, bisect_right\nprices = [10, 25, 50, 50, 80]\n# Set cheaper and fifties.\n',
        'from bisect import bisect_left, bisect_right\nprices = [10, 25, 50, 50, 80]\ncheaper = bisect_left(prices, 50)\nfifties = bisect_right(prices, 50) - bisect_left(prices, 50)',
        'assert cheaper == 2, "10 and 25 are below 50."\nassert fifties == 2, "50 appears twice."',
        'The left insertion point counts smaller items, and the gap between the two points counts copies.',
        'Use bisect_left(prices, 50) and subtract it from bisect_right(prices, 50).',
      ),
    ],
    [
      [
        'What does bisect_left(values, x) count in a sorted list?',
        'How many items are smaller than x.',
      ],
      [
        'How do you count copies of x in a sorted list?',
        'bisect_right(values, x) - bisect_left(values, x).',
      ],
    ],
  ),

  skill(
    'decorators',
    'library',
    'Wrap a function with a decorator',
    'Read @ syntax, and cache a function’s results with functools.cache.',
    ['imports', 'recursion', 'key-functions'],
    [
      'Functions are values: sorted(words, key=len) hands len to sorted without calling it. A decorator is a function that receives a function and returns something to use in its place. Writing @label on the line above def double(x): means double = label(double). Python creates double, passes it to label once while the def runs, and binds the name double to whatever label returns.',
      'from functools import cache gives you a ready-made decorator. @cache wraps a function so that it remembers the result for each argument it has seen: a repeated call returns the stored result without running the body again. That makes a recursive function such as fib fast, because each fib(n) is computed only once.',
    ],
    {
      code: 'from functools import cache\n\n@cache\ndef square(n):\n    print("computing", n)\n    return n * n\n\nprint(square(4))\nprint(square(4))\nprint(square(5))',
      output: 'computing 4\n16\n16\ncomputing 5\n25',
      explanation:
        'The first square(4) runs the body and stores 16. The second call finds 4 already stored and returns 16 without printing. 5 is a new argument, so the body runs again.',
    },
    [
      exercise(
        'count_paths(n) counts the ways to climb n stairs taking 1 or 2 steps at a time. Import cache from functools and decorate count_paths with @cache so that count_paths(60) finishes quickly.',
        'def count_paths(n):\n    if n <= 1:\n        return 1\n    return count_paths(n - 1) + count_paths(n - 2)\n',
        'from functools import cache\n\n@cache\ndef count_paths(n):\n    if n <= 1:\n        return 1\n    return count_paths(n - 1) + count_paths(n - 2)',
        'assert hasattr(count_paths, "cache_info"), "Decorate count_paths with @cache."\nassert count_paths(1) == 1\nassert count_paths(4) == 5, "1+1+1+1, 1+1+2, 1+2+1, 2+1+1 and 2+2."\nassert count_paths(60) == 2504730781961, "Each smaller staircase should be computed once."',
        'With @cache, each count_paths(k) is computed once and reused, so the recursion makes about 60 calls instead of trillions.',
        'Write from functools import cache at the top and @cache on the line above def count_paths.',
      ),
    ],
    [
      [
        'What does @name on the line above def f(): mean?',
        'f = name(f): the decorator receives the function, and its return value replaces f.',
      ],
      [
        'What does @cache from functools do?',
        'It stores each result by its arguments, so a repeated call returns the stored result without running the body.',
      ],
    ],
  ),

  skill(
    'classes',
    'objects',
    'Define a class',
    'Create objects that store their own attributes.',
    ['parameters'],
    [
      'A class is a blueprint for objects. class Point: starts a definition, and the special method __init__ runs each time you create an object by calling the class, as in p = Point(3, 4). Its first parameter, self, is the new object; self.x = x stores an attribute on it. Read an attribute with a dot: p.x.',
      'Each object keeps its own attributes, so changing a.x leaves b.x alone. __init__ takes parameters like any function, including defaults and keyword arguments, as in Point(y=1, x=2). Create objects by calling the class name; you never call __init__ yourself, and you never pass self.',
    ],
    {
      code: 'class Point:\n    def __init__(self, x, y=0):\n        self.x = x\n        self.y = y\n\na = Point(3, 4)\nb = Point(5)\nb.y = 2\nprint(a.x + a.y)\nprint(b.x, b.y)',
      output: '7\n5 2',
      explanation:
        'Each call to Point creates a separate object. b starts with the default y of 0 until its own attribute is set to 2.',
    },
    [
      exercise(
        'Define a class Book whose __init__ takes title and pages, with pages defaulting to 100, and stores both as attributes. Then set novel to Book("Dune", 412).',
        '# Define Book, then create novel.\n',
        'class Book:\n    def __init__(self, title, pages=100):\n        self.title = title\n        self.pages = pages\n\nnovel = Book("Dune", 412)',
        'assert novel.title == "Dune" and novel.pages == 412, "Store both attributes."\nassert Book("Notes").pages == 100, "pages defaults to 100."\nassert Book(pages=5, title="Zine").title == "Zine", "Support keyword arguments."',
        '__init__ copies each parameter onto self, and the default fills in a missing page count.',
        'Write def __init__(self, title, pages=100): and assign self.title and self.pages.',
      ),
    ],
    [
      [
        'When does __init__ run?',
        'Each time you create an object by calling the class.',
      ],
      [
        'What is self?',
        'The object a method is working on; Python passes it automatically.',
      ],
    ],
  ),

  skill(
    'methods',
    'objects',
    'Give objects methods',
    'Write methods that use and update attributes, in the fit-then-predict style.',
    ['classes', 'number-builtins'],
    [
      'A method is a function defined inside a class. Its first parameter is self, and calling obj.method(arg) runs it with self set to obj. A method can read attributes, update them, and return a value. A method that returns self allows chained calls on the same object, such as Tally().add(2).add(3).',
      'Libraries such as scikit-learn follow one pattern. Settings go to the constructor, often as keyword arguments. fit(data) learns from the data, stores what it learned in attributes whose names end with an underscore, such as mean_, and returns self. Later methods, such as predict or transform, use those learned attributes, so calling them before fit fails.',
    ],
    {
      code: 'class MeanModel:\n    def __init__(self, offset=0):\n        self.offset = offset\n\n    def fit(self, values):\n        self.mean_ = sum(values) / len(values)\n        return self\n\n    def predict(self):\n        return self.mean_ + self.offset\n\nmodel = MeanModel(offset=1).fit([2, 4, 6])\nprint(model.mean_)\nprint(model.predict())',
      output: '4.0\n5.0',
      explanation:
        'fit stores the learned mean 4.0 and returns the same object, so model is the fitted model. predict adds the offset setting.',
    },
    [
      exercise(
        'Complete the class RangeScaler. fit(values) stores the smallest value in min_ and the largest in max_, then returns self. transform(x) returns (x - min_) / (max_ - min_).',
        'class RangeScaler:\n    def fit(self, values):\n        pass\n\n    def transform(self, x):\n        pass\n',
        'class RangeScaler:\n    def fit(self, values):\n        self.min_ = min(values)\n        self.max_ = max(values)\n        return self\n\n    def transform(self, x):\n        return (x - self.min_) / (self.max_ - self.min_)',
        'scaler = RangeScaler()\nassert scaler.fit([2, 6, 10]) is scaler, "fit returns the same object."\nassert scaler.min_ == 2 and scaler.max_ == 10, "Store the learned range."\nassert scaler.transform(6) == 0.5, "6 is halfway between 2 and 10."\nassert RangeScaler().fit([0, 4]).transform(1) == 0.25, "Chaining works after fit."',
        'fit learns the range and returns self; transform uses the learned attributes.',
        'Store min(values) and max(values) on self in fit, return self, then use them in transform.',
      ),
    ],
    [
      ['What does a method receive as self?', 'The object it was called on.'],
      [
        'What does fit usually do in scikit-learn style code?',
        'It learns values from data, stores them in attributes ending in _, and returns self.',
      ],
    ],
  ),
];

const pythonSkills: Skill[] = curriculum.map((item, index) => ({
  ...item,
  order: index,
}));
const pythonCourses: Course[] = [
  {
    id: 'python-foundations',
    title: 'Python foundations',
    description:
      'From your first print statement to classes and the standard library. Learn by writing real Python, then keep it with spaced practice.',
    domain: 'programming',
    language: 'python',
    skillIds: pythonSkills.map((item) => item.id),
  },
];

export const pythonFoundationsCatalog: CurriculumCatalog = {
  courses: pythonCourses,
  units: pythonUnits,
  skills: pythonSkills,
};
