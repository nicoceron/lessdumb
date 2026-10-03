import { quantitativeCatalog } from './courses/quantitative';
import { dataAnalysisCatalog } from './courses/data-analysis';
import { machineLearningCatalog } from './courses/machine-learning';
import { dataSystemsCatalog } from './courses/data-systems';
import { competitiveProgrammingCatalog } from './courses/competitive-programming';
import { rustCatalog } from './courses/rust';
import { cppCatalog } from './courses/cpp';
import {
  attachKnowledgePoints,
  knowledgePointRegistryErrors,
  knowledgePointSkillIds,
} from './knowledge-points';
export type Domain = 'programming' | 'mathematics' | 'physics' | 'language';
export type CodeLanguage = 'python' | 'rust' | 'cpp';

export interface Course {
  id: string;
  title: string;
  description: string;
  domain: Domain;
  language?: string;
  skillIds: string[];
  /** Public topic references, never part of a learner's private progress. */
  resources?: { label: string; url: string }[];
}

export interface Unit {
  id: string;
  title: string;
  description: string;
  courseId: string;
}

interface QuestionBase {
  id: string;
  prompt: string;
  explanation: string;
  hint: string;
}

export interface ChoiceQuestion extends QuestionBase {
  type: 'choice';
  code?: string;
  choices: string[];
  answer: number;
  /** The correct choice is exactly what `code` prints; catalog tests run it. */
  checksOutput?: boolean;
}

export interface CodeQuestion extends QuestionBase {
  type: 'code';
  /** Omitted in existing accounts/catalogs means Python. */
  language?: CodeLanguage;
  starterCode: string;
  solution: string;
  /** Learner-visible behavior checks, separate from the reference solution. */
  contract?: string;
  /** Authored assertions/harness in the question's actual language. */
  tests: string;
}

export type Question = ChoiceQuestion | CodeQuestion;

export interface Flashcard {
  id: string;
  skillId: string;
  front: string;
  back: string;
}

export interface LessonExample {
  code: string;
  output: string;
  explanation: string;
  kind?: 'code' | 'text';
  label?: string;
  language?: CodeLanguage;
}

/**
 * One separately practiced idea inside a skill: a short explanation, a fully
 * worked example, then interchangeable practice questions on that idea only.
 */
export interface KnowledgePoint {
  id: string;
  title: string;
  explanation: string[];
  example: LessonExample;
  questions: Question[];
}

export interface Skill {
  id: string;
  courseId: string;
  domain: Domain;
  unitId: string;
  title: string;
  summary: string;
  prerequisites: string[];
  order: number;
  estimatedMinutes: number;
  /** Optional atomic sequence metadata; prerequisites remain the unlock authority. */
  topicId?: string;
  /** Topic name when it differs from the title of the topic's final stage. */
  topicTitle?: string;
  stage?: number;
  stageCount?: number;
  lesson: {
    paragraphs: string[];
    example: LessonExample;
  };
  /** Ordered knowledge points; the lesson teaches and practices each in turn. */
  knowledgePoints?: KnowledgePoint[];
  questions: Question[];
  flashcards: Flashcard[];
  /** Subject-specific evidence needed within a spaced review cycle. */
  assessment?: { requiredTypes: Question['type'][]; reviewAnswers: number };
}

export interface CurriculumCatalog {
  courses: Course[];
  units: Unit[];
  skills: Skill[];
}

const choice = (
  prompt: string,
  choices: string[],
  answer: number,
  explanation: string,
  hint: string,
  code?: string,
): Omit<ChoiceQuestion, 'id'> => ({
  type: 'choice',
  prompt,
  choices,
  answer,
  explanation,
  hint,
  ...(code ? { code } : {}),
});
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
  questions: (Omit<ChoiceQuestion, 'id'> | Omit<CodeQuestion, 'id'>)[],
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
    questions: questions.map((question, index) => ({
      ...question,
      id: `${id}-q${index + 1}`,
    })),
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
      choice(
        'What does this program print?',
        ['Python', '"Python"', 'print("Python")', 'Nothing'],
        0,
        'print() displays the contents of the string, without its quote marks.',
        'The quotes mark a string; they are not part of its content.',
        'print("Python")',
      ),
      choice(
        'Which statement prints the text Ready?',
        ['print(Ready)', 'Print("Ready")', 'print("Ready")', '"print Ready"'],
        2,
        'Python names are case-sensitive, and literal text needs quotes.',
        'Use the lowercase function name and quoted text.',
      ),
      choice(
        'What is the output, in order?',
        ['2\n1', '1\n2', '12', '3'],
        1,
        'Statements run top to bottom, and separate print calls make separate lines.',
        'Read one line of code at a time.',
        'print(1)\nprint(2)',
      ),
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
      choice(
        'What is printed?',
        ['4', '6', '10', 'An error'],
        1,
        'points is assigned 4, then reassigned the result of 4 + 2.',
        'Evaluate the right side using the previous value.',
        'points = 4\npoints = points + 2\nprint(points)',
      ),
      choice(
        'Which is a valid Python variable name?',
        ['2_score', 'daily score', 'daily_score', 'daily-score'],
        2,
        'Underscores can connect words in a variable name. Spaces and hyphens cannot.',
        'A name may contain underscores but cannot start with a digit.',
      ),
      choice(
        'What is printed?',
        ['8', '3', '11', '5'],
        0,
        'saved keeps the earlier value 8. Changing count does not change saved.',
        'An integer assignment copies the value associated with the name at that moment.',
        'count = 8\nsaved = count\ncount = 3\nprint(saved)',
      ),
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
      choice(
        'What value does 3 + 2 * 4 produce?',
        ['20', '11', '14', '24'],
        1,
        'Multiplication happens first: 2 * 4 is 8, then 3 + 8 is 11.',
        'Perform multiplication before addition.',
      ),
      choice(
        'What is printed?',
        ['2 1', '2.5 1', '2 0', '3 1'],
        0,
        '7 // 3 counts two complete groups. 7 % 3 is the remaining 1.',
        'Floor division and remainder answer different questions.',
        'print(7 // 3, 7 % 3)',
      ),
      choice(
        'Which expression squares the number 5?',
        ['5 ^ 2', '5 * 2', '5 ** 2', '5 / 2'],
        2,
        'The ** operator means exponentiation. ^ has a different meaning in Python.',
        'Python uses two asterisks for powers.',
      ),
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
    ['variables'],
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
      choice(
        'What is the value of len("red fox")?',
        ['6', '7', '8', '2'],
        1,
        'There are three letters, a space, and three more letters: seven characters.',
        'The space counts as a character.',
      ),
      choice(
        'What is printed?',
        ['Hi, Ana', 'Hi, name', 'Hi, {name}', 'An error'],
        0,
        'An f-string evaluates name inside the braces.',
        'The f prefix enables expression substitution.',
        'name = "Ana"\nprint(f"Hi, {name}")',
      ),
      choice(
        'Which expression produces the string ababab?',
        ['"ab" + 3', '"ab" * 3', '"ab" ** 3', '3 + "ab"'],
        1,
        'Multiplying a string by an integer repeats its content.',
        'String repetition uses the multiplication operator.',
      ),
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
    ['numbers', 'strings'],
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
      choice(
        'What is the type of "42"?',
        ['int', 'float', 'str', 'bool'],
        2,
        'Quotes create a string even when its characters are digits.',
        'Look at whether the value is quoted.',
      ),
      choice(
        'What is printed?',
        ['82', '10', '8 + 2', 'An error'],
        1,
        'int("8") is the integer 8, so adding 2 produces 10.',
        'Convert the text before doing arithmetic.',
        'print(int("8") + 2)',
      ),
      choice(
        'Which conversion fails?',
        ['str(5)', 'float("2.5")', 'int("hello")', 'int("7")'],
        2,
        'The word hello is not a valid integer representation.',
        'int() needs a string containing a valid whole number.',
      ),
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
      choice(
        'What is printed?',
        ['True', 'False', '8', 'An error'],
        0,
        'The != operator tests inequality. 8 is not equal to 5.',
        'Read != as “is not equal to.”',
        'print(8 != 5)',
      ),
      choice(
        'Which comparison includes a score of exactly 70?',
        ['score > 70', 'score < 70', 'score >= 70', 'score = 70'],
        2,
        '>= means greater than or equal to, so it includes the boundary.',
        'The condition needs both “greater” and “equal.”',
      ),
      choice(
        'What is printed?',
        ['True', 'False', '4', 'None'],
        1,
        'The integer 4 and the string "4" are different values of different types.',
        'A string of digits is still text.',
        'print(4 == "4")',
      ),
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
      'Build a complex condition from small, readable comparisons. Parentheses help communicate the grouping. When a range has an upper and lower limit, both limits must hold, so combine them with and.',
    ],
    {
      code: 'age = 21\nhas_ticket = True\ncan_enter = age >= 18 and has_ticket\nprint(can_enter)',
      output: 'True',
      explanation: 'The age condition and the ticket condition both hold.',
    },
    [
      choice(
        'What does True and False evaluate to?',
        ['True', 'False', 'None', 'An error'],
        1,
        'and requires both sides to be true.',
        'One false condition is enough to make and false.',
      ),
      choice(
        'What does False or True evaluate to?',
        ['False', 'None', 'True', 'An error'],
        2,
        'or needs at least one true condition.',
        'Only one condition must be true for or.',
      ),
      choice(
        'What is printed?',
        ['True', 'False', '12', 'An error'],
        0,
        '12 is at least 10 and at most 20, so both conditions hold.',
        'Check the lower and upper boundaries separately.',
        'n = 12\nprint(n >= 10 and n <= 20)',
      ),
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
      choice(
        'What is printed?',
        ['cold', 'warm', 'cold\nwarm', 'Nothing'],
        1,
        'The condition 25 < 20 is false, so the else branch runs.',
        'Evaluate the condition before choosing a branch.',
        'temperature = 25\nif temperature < 20:\n    print("cold")\nelse:\n    print("warm")',
      ),
      choice(
        'What shows that a statement belongs inside an if body?',
        [
          'An ending semicolon',
          'Quotation marks',
          'Indentation',
          'Capital letters',
        ],
        2,
        'Python uses indentation to define blocks.',
        'Look for the leading spaces on body statements.',
      ),
      choice(
        'How many branches can execute in one if/elif/else chain?',
        [
          'All true branches',
          'Exactly two',
          'At most one',
          'None are ever skipped',
        ],
        2,
        'The chain stops after the first matching branch.',
        'The elif conditions are checked only if earlier conditions failed.',
      ),
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
    'lists',
    'sequences',
    'Collect values in lists',
    'Store an ordered collection under one name.',
    ['types'],
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
      choice(
        'What is len([4, 8, 12])?',
        ['24', '12', '3', '2'],
        2,
        'len() counts items; there are three.',
        'Count the comma-separated items.',
      ),
      choice(
        'Which expression creates an empty list?',
        ['{}', '[]', '()', '""'],
        1,
        'Square brackets construct a list; no values means it is empty.',
        'Lists use square brackets.',
      ),
      choice(
        'What is printed?',
        ['True', 'False', '2', 'An error'],
        0,
        '2 is present in the list, so membership is true.',
        'The in operator tests whether an item is present.',
        'print(2 in [1, 2, 3])',
      ),
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
      choice(
        'What is ["a", "b", "c"][1]?',
        ['a', 'b', 'c', 'An error'],
        1,
        'The first item is index 0, making index 1 the second item.',
        'Python positions start at zero.',
      ),
      choice(
        'What is printed?',
        ['10', '20', '30', 'An error'],
        2,
        'Index -1 retrieves the final item.',
        'Negative indices count from the end.',
        'values = [10, 20, 30]\nprint(values[-1])',
      ),
      choice(
        'Which index is outside a list of three items?',
        ['0', '1', '2', '3'],
        3,
        'The valid nonnegative indices are 0, 1, and 2.',
        'The highest positive index is one less than the length.',
      ),
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
      choice(
        'How many times does this loop print?',
        ['1', '2', '3', '4'],
        2,
        'The list contains three items, so the body executes three times.',
        'One iteration happens per item.',
        'for number in [2, 4, 6]:\n    print(number)',
      ),
      choice(
        'What is printed?',
        ['4\n5', '8\n10', '9', 'Nothing'],
        1,
        'The body doubles each item independently.',
        'Substitute each list item into x.',
        'for x in [4, 5]:\n    print(x * 2)',
      ),
      choice(
        'How many times does the body of for x in [] run?',
        ['Zero', 'Once', 'Forever', 'It always raises an error'],
        0,
        'An empty collection has no items to assign to the loop variable.',
        'There is nothing to iterate over.',
      ),
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
      choice(
        'What is list(range(4))?',
        ['[1, 2, 3, 4]', '[0, 1, 2, 3]', '[0, 1, 2, 3, 4]', '[4]'],
        1,
        'range(4) starts at 0 and excludes its stop value, 4.',
        'The stop value is never included.',
      ),
      choice(
        'What is list(range(3, 6))?',
        ['[3, 4, 5]', '[3, 4, 5, 6]', '[0, 1, 2]', '[6, 5, 4]'],
        0,
        'The start is included, and the stop is excluded.',
        'Begin at 3 and stop before 6.',
      ),
      choice(
        'What is printed?',
        ['3\n2\n1', '3\n2\n1\n0', '0\n1\n2', 'Nothing'],
        0,
        'The negative step counts downward, still excluding the stop value 0.',
        'Subtract 1 each time.',
        'for n in range(3, 0, -1):\n    print(n)',
      ),
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
    'accumulators',
    'iteration',
    'Accumulate a result',
    'Combine many values into a running total or count.',
    ['for-loops', 'conditionals'],
    [
      'An accumulator keeps a result as a loop progresses. Initialize it before the loop, then update it inside the body. For a sum or count, start at 0. Initializing inside the loop would reset it every iteration.',
      'A conditional accumulator updates only when an item meets a rule. For example, count how many temperatures are above a threshold. Test an empty input: a sum or count should usually remain 0.',
      'For a numeric accumulator, total += number is shorthand for total = total + number. Similarly, count += 1 increases the count by one. The name must already have a value before either update.',
    ],
    {
      code: 'total = 0\nfor number in [2, 5, 3]:\n    total = total + number\nprint(total)',
      output: '10',
      explanation: 'total moves from 0 to 2, then 7, then 10.',
    },
    [
      choice(
        'Where should a running total be initialized?',
        [
          'Before the loop',
          'Inside every iteration',
          'Only after the loop',
          'It never needs initialization',
        ],
        0,
        'The initial value must exist before the first update and must not reset between updates.',
        'You want one total shared across iterations.',
      ),
      choice(
        'What is printed?',
        ['1', '2', '3', '6'],
        1,
        'Only 4 and 7 are greater than 3, so count is incremented twice.',
        'Count matching items, not the sum of their values.',
        'count = 0\nfor n in [1, 4, 7]:\n    if n > 3:\n        count += 1\nprint(count)',
      ),
      choice(
        'What does this code print?',
        ['None', 'An error', '0', '1'],
        2,
        'The empty loop performs no updates, leaving the initial value 0.',
        'Consider whether any iteration runs.',
        'total = 0\nfor n in []:\n    total += n\nprint(total)',
      ),
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
      choice(
        'When is a while condition checked?',
        [
          'Only after the first iteration',
          'Before every iteration',
          'Only once',
          'After the program ends',
        ],
        1,
        'Python checks the condition before entering or repeating the body.',
        'The body may run zero times.',
      ),
      choice(
        'What is printed?',
        ['0', '1', '3', '4'],
        2,
        'n progresses through 0, 1, 2, and 3. The condition fails at 3.',
        'Stop when n < 3 is false.',
        'n = 0\nwhile n < 3:\n    n += 1\nprint(n)',
      ),
      choice(
        'Which change prevents this loop from running forever?',
        [
          'Print x twice',
          'Add x -= 1 inside the loop',
          'Remove the condition',
          'Change the print text',
        ],
        1,
        'Decreasing a positive x eventually makes x > 0 false.',
        'The condition needs a value that changes toward termination.',
        'x = 2\nwhile x > 0:\n    print(x)',
      ),
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
      choice(
        'What does values.append(9) do?',
        [
          'Replaces the first item',
          'Adds 9 at the end',
          'Sorts the list',
          'Returns a new list',
        ],
        1,
        'append mutates the existing list by adding one final item.',
        'Append means add to the end.',
      ),
      choice(
        'What is printed?',
        ['[1]', '[1, 2]', '[2]', 'An error'],
        1,
        'a and b refer to the same list, so appending through b changes the list a sees.',
        'Assigning a list to another name does not copy its contents.',
        'a = [1]\nb = a\nb.append(2)\nprint(a)',
      ),
      choice(
        'What value does [4, 5, 6].pop() return?',
        ['4', '5', '6', 'None'],
        2,
        'Without an index, pop removes and returns the last item.',
        'Which item is at the end?',
      ),
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
      choice(
        'What is [10, 20, 30, 40][1:3]?',
        ['[10, 20, 30]', '[20, 30]', '[20, 30, 40]', '[10, 40]'],
        1,
        'The slice includes positions 1 and 2, but excludes position 3.',
        'The stop index is excluded.',
      ),
      choice(
        'What is "planet"[:3]?',
        ['pla', 'plan', 'net', 'lan'],
        0,
        'With no start given, Python starts at 0 and stops before 3.',
        'Select indices 0, 1, and 2.',
      ),
      choice(
        'Which slice reverses a list?',
        ['items[1:]', 'items[:1]', 'items[::2]', 'items[::-1]'],
        3,
        'A step of -1 walks from the end toward the beginning.',
        'Use a negative step.',
      ),
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
      'Accessing a missing key with brackets raises KeyError. data.get(key, default) returns a default instead. The in operator checks keys, not values. Dictionary keys must be hashable; strings and integers are common choices.',
    ],
    {
      code: 'scores = {"Ada": 10, "Lin": 8}\nscores["Ada"] = 12\nprint(scores["Ada"])\nprint(scores.get("Sam", 0))',
      output: '12\n0',
      explanation:
        'Ada already has a key, so assignment replaces its value. Missing Sam receives the default 0.',
    },
    [
      choice(
        'What is printed?',
        ['Ada', '10', 'name', 'An error'],
        0,
        'The key name maps to the string Ada.',
        'Use the key to look up the associated value.',
        'person = {"name": "Ada", "age": 10}\nprint(person["name"])',
      ),
      choice(
        'What does {"a": 1}.get("b", 0) return?',
        ['1', '"b"', '0', 'It raises KeyError'],
        2,
        'The missing key b uses the supplied default 0.',
        'get() can provide a fallback.',
      ),
      choice(
        'What does "red" in {"color": "red"} test?',
        [
          'Whether red is a value',
          'Whether red is a key',
          'Whether the dictionary is nonempty',
          'Whether red is a string',
        ],
        1,
        'Membership on a dictionary checks its keys.',
        'The only key in this dictionary is color.',
      ),
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
    ['dictionaries'],
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
      choice(
        'What does for key in data iterate over?',
        ['Keys', 'Values', 'Indices', 'Only the first entry'],
        0,
        'A direct dictionary loop visits each key.',
        'The loop variable receives the keys by default.',
      ),
      choice(
        'Which view gives both keys and values?',
        ['data.keys()', 'data.values()', 'data.items()', 'data.pairs()'],
        2,
        'items() provides each entry as a key-value pair.',
        'The method is called items().',
      ),
      choice(
        'What is printed?',
        ['2', '5', '8', 'ab'],
        1,
        'values() yields 2 and 3; the accumulator sums them to 5.',
        'Add the values rather than the keys.',
        'total = 0\nfor value in {"a": 2, "b": 3}.values():\n    total += value\nprint(total)',
      ),
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
      choice(
        'What happens when Python executes a def statement?',
        [
          'The body always runs immediately',
          'The function is defined for later calls',
          'Python ends the program',
          'Every variable becomes global',
        ],
        1,
        'def creates the function; its body runs when the function is called.',
        'Definition and invocation are separate steps.',
      ),
      choice(
        'In def greet(name), what is name?',
        ['An argument', 'A parameter', 'A keyword', 'A module'],
        1,
        'A name in the definition is a parameter; a passed value in a call is an argument.',
        'The definition names the input slot.',
      ),
      choice(
        'What is printed?',
        ['Hi\nHi', 'Nothing', 'Hi', 'An error'],
        2,
        'The body runs once because there is one call.',
        'Count calls, not definitions.',
        'def hello():\n    print("Hi")\n\nhello()',
      ),
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
      choice(
        'What does return do?',
        [
          'Only writes text to the screen',
          'Sends a value to the caller and exits the function',
          'Repeats the function forever',
          'Changes every global variable',
        ],
        1,
        'Returning hands a result back and stops the current call.',
        'The caller receives the returned value.',
      ),
      choice(
        'What is printed?',
        ['4', '5', '9', 'None'],
        1,
        'The first return exits the function, so the second return is not reached.',
        'The first unconditional return ends the call.',
        'def value():\n    return 5\n    return 4\n\nprint(value())',
      ),
      choice(
        'What is returned by a function with no explicit return?',
        ['0', 'False', 'None', 'An empty string'],
        2,
        'Python returns None when execution reaches the function end without a return value.',
        'No explicit result means None.',
      ),
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
    'parameters',
    'solve',
    'Design useful inputs',
    'Call functions with positional, keyword, and default arguments.',
    ['return-values', 'list-mutation'],
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
      choice(
        'What is printed?',
        ['2', '4', '6', 'An error'],
        1,
        'With no second argument, multiplier uses the default value 2.',
        'A missing optional argument uses its default.',
        'def scale(value, multiplier=2):\n    return value * multiplier\n\nprint(scale(2))',
      ),
      choice(
        'Which call uses keyword arguments?',
        ['area(3, 4)', 'area(width=3, height=4)', 'area[3, 4]', 'area = 3, 4'],
        1,
        'Keyword arguments use parameter names followed by = and a value.',
        'Look for parameter_name=value inside a call.',
      ),
      choice(
        'Why is a list usually a poor default parameter value?',
        [
          'Lists cannot contain numbers',
          'It is shared across calls and may retain changes',
          'Lists cannot be passed to functions',
          'It makes Python stop',
        ],
        1,
        'Default objects are created once at definition time, so a mutated list can persist between calls.',
        'Think about when the default object is created.',
      ),
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
      choice(
        'What is [n + 1 for n in [2, 4]]?',
        ['[2, 4]', '[3, 5]', '[1, 1]', '[6]'],
        1,
        'The expression n + 1 is evaluated for each item.',
        'Apply the expression once to 2 and once to 4.',
      ),
      choice(
        'Which comprehension keeps only even values?',
        [
          '[n for n in values if n % 2 == 0]',
          '[n % 2 for n in values]',
          '[n for n in values if n > 2]',
          '[values for n in 2]',
        ],
        0,
        'The filter keeps values whose remainder after division by 2 is zero.',
        'Put the condition after the for clause.',
      ),
      choice(
        'What is printed?',
        ['[2, 6]', '[-4, 2, 6]', '[1, 3]', '[True, True]'],
        0,
        'The filter excludes -2; the expression doubles the remaining 1 and 3.',
        'Filter the original values, then transform the ones kept.',
        'print([n * 2 for n in [-2, 1, 3] if n > 0])',
      ),
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
    'errors',
    'solve',
    'Handle expected failures',
    'Read errors and recover from invalid input.',
    ['return-values'],
    [
      'An exception reports a failure during execution. Read the final line of a traceback for the exception type and message, then locate the indicated line of your code. A ValueError often means a conversion received unsuitable content; a NameError often means a name is missing or misspelled.',
      'Use try/except to handle an expected failure. Put the operation that can fail in try and catch the specific exception you know how to handle. Broadly catching every exception can hide programming errors that should be fixed.',
    ],
    {
      code: 'def parse_count(text):\n    try:\n        return int(text)\n    except ValueError:\n        return 0\n\nprint(parse_count("12"))\nprint(parse_count("oops"))',
      output: '12\n0',
      explanation:
        'The successful conversion returns 12. The invalid text raises ValueError, which the except branch handles.',
    },
    [
      choice(
        'What exception does int("apple") raise?',
        ['NameError', 'IndexError', 'ValueError', 'KeyError'],
        2,
        'The conversion is given an invalid string representation for an integer.',
        'The value is unsuitable for conversion.',
      ),
      choice(
        'Where should the operation that may fail be placed?',
        [
          'In the try block',
          'Only after except',
          'Before def',
          'Inside a quoted string',
        ],
        0,
        'try executes the operation, and except handles the specified exception if one occurs.',
        'The try block is the guarded operation.',
      ),
      choice(
        'Why catch ValueError instead of every exception?',
        [
          'It makes invalid input valid',
          'It prevents unrelated programming errors from being hidden',
          'It disables all tracebacks globally',
          'It repeats the code automatically',
        ],
        1,
        'A specific handler addresses the expected failure while letting unexpected bugs surface.',
        'Handle the failure you understand.',
      ),
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
      choice(
        'Which structure best stores a count for each distinct word?',
        ['One integer', 'A dictionary', 'One boolean', 'A fixed output string'],
        1,
        'A dictionary associates each word key with its integer count.',
        'You need to map a word to a count.',
      ),
      choice(
        'Why use counts.get(word, 0)?',
        [
          'To delete the word',
          'To convert the word to a number',
          'To start unseen words with a count of zero',
          'To sort all words',
        ],
        2,
        'The default 0 handles a word that has not appeared yet.',
        'The first occurrence has no stored count.',
      ),
      choice(
        'What should count_words([]) return?',
        ['None', '{}', '{"": 1}', 'It must raise an error'],
        1,
        'An empty input has no words, so the appropriate result is an empty mapping.',
        'The loop has no iterations.',
      ),
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
      'From your first print statement to a tested word counter. Learn by writing real Python, then keep it with spaced practice.',
    domain: 'programming',
    language: 'python',
    skillIds: pythonSkills.map((item) => item.id),
  },
];

const extensions = [
  quantitativeCatalog,
  dataAnalysisCatalog,
  machineLearningCatalog,
  dataSystemsCatalog,
  competitiveProgrammingCatalog,
  rustCatalog,
  cppCatalog,
];
export const courses: Course[] = [
  ...pythonCourses,
  ...extensions.flatMap((c) => c.courses),
];
export const units: Unit[] = [
  ...pythonUnits,
  ...extensions.flatMap((c) => c.units),
];
export const skills: Skill[] = [
  ...pythonSkills,
  ...extensions.flatMap((c) => c.skills),
].map(attachKnowledgePoints);
export const skillById: Record<string, Skill> = Object.fromEntries(
  skills.map((item) => [item.id, item]),
);

export const allFlashcards: Flashcard[] = skills.flatMap(
  (item) => item.flashcards,
);
export const defaultCatalog: CurriculumCatalog = { courses, units, skills };

/** Defaults adapt to the available assessments, so choice-only subjects need no code runtime. */
export function assessmentPolicy(
  item: Skill,
): NonNullable<Skill['assessment']> {
  return (
    item.assessment ?? {
      requiredTypes: [
        ...new Set(item.questions.map((question) => question.type)),
      ],
      reviewAnswers: Math.min(2, item.questions.length),
    }
  );
}

/** Checks the registry contract before any scheduler or graph renderer uses it. */
export function validateCurriculum(
  registry: Skill[] = skills,
  catalog: Pick<CurriculumCatalog, 'courses' | 'units'> = defaultCatalog,
): string[] {
  const errors: string[] = [];
  const ids = new Set(registry.map((item) => item.id));
  if (ids.size !== registry.length) errors.push('Skill IDs must be unique.');
  if (
    new Set(catalog.courses.map((course) => course.id)).size !==
    catalog.courses.length
  )
    errors.push('Course IDs must be unique.');
  if (
    new Set(catalog.units.map((unit) => unit.id)).size !== catalog.units.length
  )
    errors.push('Unit IDs must be unique.');
  for (const course of catalog.courses) {
    if (new Set(course.skillIds).size !== course.skillIds.length)
      errors.push(`${course.id}: duplicate member skill IDs.`);
    for (const id of course.skillIds)
      if (!ids.has(id))
        errors.push(`${course.id}: unknown member skill ${id}.`);
  }
  for (const unit of catalog.units)
    if (!catalog.courses.some((course) => course.id === unit.courseId))
      errors.push(`${unit.id}: unknown course ${unit.courseId}.`);
  const questions = new Set<string>();
  const cards = new Set<string>();
  for (const item of registry) {
    if (!catalog.courses.some((course) => course.id === item.courseId))
      errors.push(`${item.id}: unknown course ${item.courseId}.`);
    else if (
      !catalog.courses
        .find((course) => course.id === item.courseId)!
        .skillIds.includes(item.id)
    )
      errors.push(`${item.id}: missing from its course's member skills.`);
    if (
      !catalog.units.some(
        (unit) => unit.id === item.unitId && unit.courseId === item.courseId,
      )
    )
      errors.push(`${item.id}: unknown unit ${item.unitId}.`);
    for (const prerequisite of item.prerequisites)
      if (!ids.has(prerequisite))
        errors.push(`${item.id}: unknown prerequisite ${prerequisite}.`);
    const courseLanguage = catalog.courses.find(
      (course) => course.id === item.courseId,
    )?.language;
    if (
      item.lesson.example.language !== undefined &&
      !['python', 'rust', 'cpp'].includes(item.lesson.example.language)
    )
      errors.push(`${item.id}: unsupported example language.`);
    if (
      item.lesson.example.kind !== 'text' &&
      ['rust', 'cpp'].includes(courseLanguage ?? '') &&
      item.lesson.example.language !== courseLanguage
    )
      errors.push(`${item.id}: example language must match its course.`);
    if (
      item.topicId !== undefined ||
      item.stage !== undefined ||
      item.stageCount !== undefined
    ) {
      const topic = registry.find((candidate) => candidate.id === item.topicId);
      if (
        !topic ||
        topic.courseId !== item.courseId ||
        topic.unitId !== item.unitId
      )
        errors.push(`${item.id}: invalid stage topic.`);
      if (
        !Number.isInteger(item.stage) ||
        !Number.isInteger(item.stageCount) ||
        item.stage! < 1 ||
        item.stageCount! < 2 ||
        item.stage! > item.stageCount!
      )
        errors.push(`${item.id}: invalid stage position.`);
      const members = registry.filter(
        (candidate) => candidate.topicId === item.topicId,
      );
      if (
        members.length !== item.stageCount ||
        new Set(members.map((member) => member.stage)).size !==
          item.stageCount ||
        members.some((member) => member.stageCount !== item.stageCount)
      )
        errors.push(`${item.id}: incomplete stage sequence.`);
    }
    if (!item.questions.length)
      errors.push(`${item.id}: missing assessment questions.`);
    // The launched Python course retains its authored four-question assessment standard.
    if (item.courseId === 'python-foundations') {
      if (!item.questions.some((question) => question.type === 'code'))
        errors.push(`${item.id}: missing executable exercise.`);
      if (
        item.questions.filter((question) => question.type === 'choice').length <
        3
      )
        errors.push(`${item.id}: needs three choice questions.`);
    }
    const policy = assessmentPolicy(item);
    if (
      !Number.isInteger(policy.reviewAnswers) ||
      policy.reviewAnswers < 1 ||
      policy.reviewAnswers > item.questions.length
    )
      errors.push(`${item.id}: invalid review answer count.`);
    if (
      !policy.requiredTypes.length ||
      new Set(policy.requiredTypes).size !== policy.requiredTypes.length
    )
      errors.push(
        `${item.id}: assessment types must be nonempty and distinct.`,
      );
    if (policy.requiredTypes.length > policy.reviewAnswers)
      errors.push(
        `${item.id}: review answer count cannot cover all required types.`,
      );
    for (const type of policy.requiredTypes)
      if (!item.questions.some((question) => question.type === type))
        errors.push(`${item.id}: missing required assessment type ${type}.`);
    const points = item.knowledgePoints ?? [];
    if (
      item.knowledgePoints !== undefined &&
      (points.length < 2 || points.length > 5)
    )
      errors.push(`${item.id}: needs two to five knowledge points.`);
    for (const point of points) {
      if (!point.title.trim() || !point.explanation.some((p) => p.trim()))
        errors.push(`${point.id}: needs a title and an explanation.`);
      if (point.questions.length < 3)
        errors.push(`${point.id}: needs at least three practice questions.`);
      if (
        point.example.kind !== 'text' &&
        ['rust', 'cpp'].includes(courseLanguage ?? '') &&
        point.example.language !== courseLanguage
      )
        errors.push(`${point.id}: example language must match its course.`);
      for (const question of point.questions)
        if (
          question.type === 'choice' &&
          (question.choices.length < 4 ||
            new Set(question.choices.map((c) => c.trim())).size !==
              question.choices.length)
        )
          errors.push(`${question.id}: needs four or more distinct choices.`);
    }
    for (const question of [
      ...item.questions,
      ...points.flatMap((point) => point.questions),
    ]) {
      if (
        question.type === 'choice' &&
        question.checksOutput &&
        !question.code?.trim()
      )
        errors.push(`${question.id}: output questions need code to run.`);
      if (questions.has(question.id))
        errors.push(`Duplicate question ID ${question.id}.`);
      questions.add(question.id);
      if (
        question.type === 'choice' &&
        (!Number.isInteger(question.answer) ||
          question.answer < 0 ||
          question.answer >= question.choices.length)
      )
        errors.push(`${question.id}: invalid answer index.`);
      if (
        question.type === 'code' &&
        (!question.tests.trim() || !question.solution.trim())
      )
        errors.push(`${question.id}: missing tests or solution.`);
      if (
        question.type === 'code' &&
        question.language !== undefined &&
        !['python', 'rust', 'cpp'].includes(question.language)
      )
        errors.push(`${question.id}: unsupported code language.`);
      if (
        question.type === 'code' &&
        ['rust', 'cpp'].includes(courseLanguage ?? '') &&
        question.language !== courseLanguage
      )
        errors.push(`${question.id}: code language must match its course.`);
    }
    for (const card of item.flashcards) {
      if (cards.has(card.id)) errors.push(`Duplicate flashcard ID ${card.id}.`);
      cards.add(card.id);
      if (card.skillId !== item.id) errors.push(`${card.id}: wrong skill ID.`);
    }
  }
  const byId = Object.fromEntries(registry.map((item) => [item.id, item]));
  const visiting = new Set<string>();
  const visited = new Set<string>();
  function visit(id: string) {
    if (visiting.has(id)) {
      errors.push(`Prerequisite cycle at ${id}.`);
      return;
    }
    if (visited.has(id) || !byId[id]) return;
    visiting.add(id);
    byId[id].prerequisites.forEach(visit);
    visiting.delete(id);
    visited.add(id);
  }
  registry.forEach((item) => visit(item.id));
  if (errors.some((error) => error.startsWith('Prerequisite cycle')))
    return errors;
  // Edges list direct requirements only. An edge already implied through
  // another prerequisite hides the real structure and narrows no frontier.
  const ancestors = new Map<string, Set<string>>();
  function ancestorsOf(id: string): Set<string> {
    const cached = ancestors.get(id);
    if (cached) return cached;
    const result = new Set<string>();
    for (const parent of byId[id]?.prerequisites ?? []) {
      result.add(parent);
      ancestorsOf(parent).forEach((ancestor) => result.add(ancestor));
    }
    ancestors.set(id, result);
    return result;
  }
  for (const item of registry) {
    if (new Set(item.prerequisites).size !== item.prerequisites.length)
      errors.push(`${item.id}: duplicate prerequisite.`);
    for (const prerequisite of item.prerequisites) {
      const parent = byId[prerequisite];
      if (parent?.courseId === item.courseId && parent.order >= item.order)
        errors.push(
          `${item.id}: teaching order places it before prerequisite ${prerequisite}.`,
        );
      const via = item.prerequisites.find(
        (other) =>
          other !== prerequisite && ancestorsOf(other).has(prerequisite),
      );
      if (via)
        errors.push(
          `${item.id}: prerequisite ${prerequisite} is already implied by ${via}.`,
        );
    }
  }
  return errors;
}

/** Authored knowledge points must name catalog skills, once each. */
export function validateKnowledgePointRegistry(): string[] {
  return [
    ...knowledgePointRegistryErrors,
    ...knowledgePointSkillIds
      .filter((id) => !skillById[id])
      .map((id) => `${id}: knowledge points for an unknown skill.`),
  ];
}
