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
      'Build a complex condition from small, readable comparisons. Parentheses help communicate the grouping. When a range has an upper and lower limit, both limits must hold, so combine them with and. Python also lets you chain the two comparisons: 10 <= n <= 20 means 10 <= n and n <= 20.',
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
      choice(
        'What is printed?',
        ['negative', 'non-negative', 'True', 'n < 0'],
        0,
        'n < 0 is True for -4, so the expression produces the value written before if.',
        'Evaluate the condition, then pick the matching side.',
        'n = -4\nsign = "negative" if n < 0 else "non-negative"\nprint(sign)',
      ),
      choice(
        'Which line sets fee to 0 when member is True and to 5 otherwise?',
        [
          'fee = if member 0 else 5',
          'fee = 0 else 5 if member',
          'fee = 0 if member else 5',
          'fee = member if 0 else 5',
        ],
        2,
        'The value for a true condition comes first, then if and the condition, then else and the other value.',
        'The pattern is A if condition else B.',
      ),
      choice(
        'What is printed?',
        ['14', '5', '7', '12'],
        1,
        '7 > 10 is False, so only the else side, 7 - 2, is evaluated.',
        'Only one side is evaluated.',
        'x = 7\nprint(x * 2 if x > 10 else x - 2)',
      ),
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
      choice(
        'Which value counts as false in a condition?',
        ['[0]', '"False"', '0', '" "'],
        2,
        'Zero is falsy. The others are a one-item list and nonempty strings, which are truthy.',
        'Zero and empty values are false; anything with contents is true.',
      ),
      choice(
        'What is printed?',
        ['Hi', 'Who?', 'Hi\nWho?', 'Nothing'],
        1,
        'The empty string is falsy, so the else branch runs.',
        'An empty string counts as false.',
        'name = ""\nif name:\n    print("Hi")\nelse:\n    print("Who?")',
      ),
      choice(
        'best holds either a score, possibly 0, or None. Which condition is True only when there is no score yet?',
        ['if not best:', 'if best == 0:', 'if best:', 'if best is None:'],
        3,
        'is None is True only for None; not best would also be True for a real score of 0.',
        'Do not let a falsy score look missing.',
      ),
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
      choice(
        'What is printed?',
        ['11 4', '4 11', '7 4', '22 4'],
        0,
        'max finds 11 in the list, and min compares its three separate arguments to find 4.',
        'min and max work on a list or on several arguments.',
        'print(max([4, 11, 7]), min(4, 11, 7))',
      ),
      choice(
        'Which expression computes the mean of a nonempty list values?',
        [
          'max(values) - min(values)',
          'sum(values) // 2',
          'sum(values) / len(values)',
          'len(values) / sum(values)',
        ],
        2,
        'The mean is the total divided by the number of values.',
        'Divide the total by the count.',
      ),
      choice(
        'What is printed?',
        ['-7 3.14', '7 3.14', '7 3.1', '13 3.14'],
        1,
        'abs turns -7 into 7, and round keeps two decimal places of 3.14159.',
        'abs removes the sign; the second argument of round counts decimal places.',
        'print(abs(3 - 10), round(3.14159, 2))',
      ),
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
      choice(
        'What is printed?',
        [
          "['a', 'b', 'c']",
          "['a', 'b', '', 'c']",
          "['a,b,,c']",
          "['a', 'b', ',', 'c']",
        ],
        1,
        'Splitting at each comma leaves an empty string between the two neighboring commas.',
        'With an explicit separator, empty pieces are kept.',
        'print("a,b,,c".split(","))',
      ),
      choice(
        'What is printed?',
        ['HELLO', 'Hello', 'hello', 'None'],
        2,
        'upper returns a new string, but the result is never assigned, so word is unchanged.',
        'String methods do not change the original string.',
        'word = "hello"\nword.upper()\nprint(word)',
      ),
      choice(
        'parts is ["2024", "06", "01"]. Which expression produces "2024-06-01"?',
        [
          'parts.join("-")',
          '"-".join(parts)',
          '"-".split(parts)',
          'parts + "-"',
        ],
        1,
        'join is called on the separator and receives the list of strings.',
        'The separator comes before .join.',
      ),
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
    'tuples',
    'sequences',
    'Group values in a tuple',
    'Store a fixed record of values and compare records.',
    ['indexing', 'comparisons'],
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
      choice(
        'What is printed?',
        ['Ada', '36', '("Ada", 36)', 'An error'],
        1,
        'Index 1 is the second item, 36.',
        'Tuple indexes start at 0, like list indexes.',
        'record = ("Ada", 36)\nprint(record[1])',
      ),
      choice(
        'point is (1, 2). What happens when point[0] = 5 runs?',
        [
          'point becomes (5, 2)',
          'point becomes (1, 5)',
          'A TypeError is raised',
          'A new tuple (5,) is created',
        ],
        2,
        'Tuples are immutable, so assigning to an item raises TypeError.',
        'A tuple cannot be changed after it is created.',
      ),
      choice(
        'Which comparison is True?',
        [
          '(2, 1) < (1, 9)',
          '(3, 4) < (3, 2)',
          '(5, 5) < (5, 5)',
          '(1, 8) < (2, 0)',
        ],
        3,
        'The first items 1 and 2 differ, so 1 < 2 decides the comparison.',
        'Compare first items; look further only on a tie.',
      ),
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
      choice(
        'What is printed?',
        ['4 9', '9 4', '9 9', '4 4'],
        1,
        'The right side (9, 4) is built from the old values first and then unpacked into a and b.',
        'Evaluate the whole right side before assigning.',
        'a, b = 4, 9\na, b = b, a\nprint(a, b)',
      ),
      choice(
        'What does x, y = (1, 2, 3) do?',
        [
          'Makes x 1 and y (2, 3)',
          'Makes x 1 and y 2',
          'Raises ValueError',
          'Makes x (1, 2) and y 3',
        ],
        2,
        'Two names cannot receive three items, so unpacking fails.',
        'Count the names and the items.',
      ),
      choice(
        'What is printed?',
        ['2\n5', '6\n5', '11', '(2, 3)\n(5, 1)'],
        1,
        'Each pair is unpacked into price and qty and multiplied: 2 * 3, then 5 * 1.',
        'Unpack each pair, then use both parts.',
        'for price, qty in [(2, 3), (5, 1)]:\n    print(price * qty)',
      ),
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
      choice(
        'What is printed?',
        [
          "[(1, 'a'), (2, 'b')]",
          "[(0, 'a'), (1, 'b')]",
          '[0, 1]',
          "[('a', 0), ('b', 1)]",
        ],
        1,
        'enumerate starts at 0 and puts the position first in each pair.',
        'Positions come first and start at zero.',
        'print(list(enumerate(["a", "b"])))',
      ),
      choice(
        'What is printed?',
        [
          "[(1, 'x'), (2, 'y')]",
          "[(1, 'x'), (2, 'y'), (3, None)]",
          "[1, 'x', 2, 'y']",
          "[(1, 2, 3), ('x', 'y')]",
        ],
        0,
        'zip stops when the shorter list runs out, so 3 has no partner and is dropped.',
        'zip pairs by position and stops at the shorter input.',
        'print(list(zip([1, 2, 3], ["x", "y"])))',
      ),
      choice(
        'Which loop gives the position and the value of each task?',
        [
          'for task in range(tasks):',
          'for i, task in zip(tasks):',
          'for i in tasks:',
          'for i, task in enumerate(tasks):',
        ],
        3,
        'enumerate yields (position, item) pairs that unpack into i and task.',
        'One of these functions adds positions.',
      ),
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
      choice(
        'What is printed?',
        ['1\n2', '1\n2\n3', '1\n2\n4', '3\n4'],
        0,
        'When x is 3 the loop ends, before 3 is printed.',
        'break leaves the loop at once.',
        'for x in [1, 2, 3, 4]:\n    if x == 3:\n        break\n    print(x)',
      ),
      choice(
        'What is printed?',
        ['1\n2', '3', '1\n2\n4', '1\n2\n3\n4'],
        2,
        'continue skips only the iteration for 3; the loop goes on to 4.',
        'continue moves on to the next item.',
        'for x in [1, 2, 3, 4]:\n    if x == 3:\n        continue\n    print(x)',
      ),
      choice(
        'A break runs inside an inner loop that is nested in an outer loop. What ends?',
        [
          'Both loops',
          'Only the inner loop',
          'Only the outer loop',
          'The whole program',
        ],
        1,
        'break affects only the loop that directly contains it; the outer loop continues with its next item.',
        'Which loop directly encloses the break?',
      ),
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
      choice(
        'What is [False] * 3?',
        ['[False]', '[0, 0, 0]', '[False, False, False]', 'False'],
        2,
        'Repeating a one-item list gives a list with three copies of its item.',
        'The list is repeated end to end.',
      ),
      choice(
        'What is printed?',
        ['[0, 0, 5, 0]', '[5, 5, 5, 5]', '[0, 5, 0, 0]', '[0, 0, 0, 0, 5]'],
        0,
        'Only index 2 changes; the other slots stay 0.',
        'Indexing updates exactly one slot.',
        'slots = [0] * 4\nslots[2] += 5\nprint(slots)',
      ),
      choice(
        'Digits run from 0 through 9. Which list has exactly one counter for each digit?',
        ['[0] * 9', '[0] * 10', '[10] * 0', '[0, 9]'],
        1,
        'Indexes 0 through 9 need ten slots.',
        'Count the indexes you must store.',
      ),
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
      choice(
        'What is printed?',
        ['8', '10', '9', '6'],
        1,
        'table[2] is [9, 10], and index 1 of that row is 10.',
        'Apply the indexes from left to right.',
        'table = [[5, 6], [7, 8], [9, 10]]\nprint(table[2][1])',
      ),
      choice(
        'For grid = [[1, 2, 3], [4, 5, 6]], what are len(grid) and len(grid[0])?',
        ['3 and 2', '2 and 3', '6 and 3', '2 and 2'],
        1,
        'There are two rows, and the first row has three items.',
        'len(grid) counts rows, not cells.',
      ),
      choice(
        'What is printed?',
        ['[11, 21, 12, 22]', '[11, 12, 21, 22]', '[11, 22]', '[33]'],
        0,
        'For a = 1 the inner loop adds 10 and then 20 before a becomes 2.',
        'The inner loop finishes for each outer value.',
        'sums = []\nfor a in [1, 2]:\n    for b in [10, 20]:\n        sums.append(a + b)\nprint(sums)',
      ),
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
      'Accessing a missing key with brackets raises KeyError. data.get(key, default) returns a default instead. The in operator checks keys, not values. del data[key] removes a key and its value; deleting a missing key also raises KeyError. Dictionary keys must be hashable; strings and integers are common choices.',
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
      choice(
        'What is printed?',
        ['4', '3', '2', '1'],
        2,
        'The distinct values are 4 and 2.',
        'Duplicates are stored once.',
        'print(len(set([4, 4, 2, 4])))',
      ),
      choice(
        'Which expression creates an empty set?',
        ['{}', '[]', '{None}', 'set()'],
        3,
        '{} creates an empty dictionary, so an empty set needs set().',
        'Braces alone mean a dictionary.',
      ),
      choice(
        'a = {1, 2, 3} and b = {3, 4}. Which expression equals {1, 2}?',
        ['a & b', 'a | b', 'a - b', 'b - a'],
        2,
        'a - b keeps the members of a that are not in b.',
        'Difference removes the second set from the first.',
      ),
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
      choice(
        'What is printed?',
        ['3 4', '(3, 4)', '3', '[3, 4]'],
        1,
        'return 3, 4 returns the tuple (3, 4), which print shows with parentheses.',
        'A comma in return builds a tuple.',
        'def pair():\n    return 3, 4\n\nprint(pair())',
      ),
      choice(
        'What is printed?',
        ['7', '(7, 10)', '10', '2'],
        2,
        'stats returns (7, 10); p receives the second item.',
        'Unpack in order.',
        'def stats(a, b):\n    return a + b, a * b\n\ns, p = stats(2, 5)\nprint(p)',
      ),
      choice(
        'person() returns name, age. Which statement stores the two parts in separate names?',
        [
          'name = age = person()',
          'name, age = person()',
          'person(name, age)',
          'name + age = person()',
        ],
        1,
        'Unpacking the returned tuple assigns each part to its own name.',
        'Unpack the returned tuple.',
      ),
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
      choice(
        'What must a recursive function have so that it can stop?',
        [
          'A while loop around the call',
          'A base case that returns without calling itself',
          'At least two parameters',
          'A print statement',
        ],
        1,
        'The base case answers directly, which ends the chain of calls.',
        'Something must return without recursing.',
      ),
      choice(
        'What is printed?',
        ['4', '0', '10', '24'],
        2,
        'total(4) is 4 + 3 + 2 + 1 + 0, which is 10.',
        'Unfold each call until n is 0.',
        'def total(n):\n    if n == 0:\n        return 0\n    return n + total(n - 1)\n\nprint(total(4))',
      ),
      choice(
        'What is printed?',
        ['3\n2\n1', '1\n2\n3', '3', '0\n1\n2\n3'],
        1,
        'Each call prints only after the smaller call returns, so 1 is printed first.',
        'The print comes after the recursive call.',
        'def show(n):\n    if n == 0:\n        return\n    show(n - 1)\n    print(n)\n\nshow(3)',
      ),
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
      choice(
        'Which expression builds four independent empty lists?',
        ['[[]] * 4', '[] * 4', '[[] for _ in range(4)]', '[[], 4]'],
        2,
        'The comprehension evaluates [] once per iteration, creating a new list each time.',
        'Each row needs its own list.',
      ),
      choice(
        'What is printed?',
        [
          '[[0, 0], [5, 0], [0, 0]]',
          '[[5, 0], [5, 0], [5, 0]]',
          '[[5, 5], [0, 0], [0, 0]]',
          '[[0, 0], [0, 0], [5, 0]]',
        ],
        1,
        'All three rows are the same list, so the change appears in each of them.',
        'Repeating a list of lists repeats one inner list.',
        'g = [[0] * 2] * 3\ng[1][0] = 5\nprint(g)',
      ),
      choice(
        'What is printed?',
        ['[0, 1, 2]', '[10, 11, 12]', '[1, 11, 21]', '[20, 21, 22]'],
        1,
        'Row 1 is built with r = 1, giving 10, 11 and 12.',
        'The outer comprehension builds rows; the inner one builds the cells of a row.',
        'grid = [[r * 10 + c for c in range(3)] for r in range(2)]\nprint(grid[1])',
      ),
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
      choice(
        'What is printed?',
        ['[2, 4, 6]', '6', '12', '9'],
        2,
        'The doubled values 2, 4 and 6 are added: 12.',
        'sum consumes each produced value.',
        'print(sum(n * 2 for n in [1, 2, 3]))',
      ),
      choice(
        'What does all(x > 0 for x in []) return?',
        ['False', 'True', 'None', 'It raises ValueError'],
        1,
        'With no items, nothing fails the test, so all returns True.',
        'all looks for a counterexample.',
      ),
      choice(
        'What is printed?',
        ['False False', 'True True', 'True False', 'False True'],
        2,
        'tree is longer than 3 letters, so any is True; a has length 1, so all is False.',
        'Compare at least one with every one.',
        'words = ["sky", "tree", "a"]\nprint(any(len(w) > 3 for w in words), all(len(w) > 1 for w in words))',
      ),
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
      choice(
        'What is printed?',
        ['[1, 2, 3]', '[3, 1, 2]', 'None', 'An error'],
        2,
        'list.sort() sorts the list in place and returns None.',
        'Check what sort() returns, not what it does.',
        'nums = [3, 1, 2]\nresult = nums.sort()\nprint(result)',
      ),
      choice(
        'What is printed?',
        [
          "['fig', 'pear', 'Apple']",
          "['Apple', 'fig', 'pear']",
          "['Apple', 'pear', 'fig']",
          "['apple', 'fig', 'pear']",
        ],
        1,
        'Uppercase letters come before lowercase ones, so Apple is first; then fig comes before pear.',
        'Compare first characters; capitals sort first.',
        'print(sorted(["pear", "Apple", "fig"]))',
      ),
      choice(
        'Which expression returns a new list of scores from highest to lowest without changing scores?',
        [
          'scores.sort(reverse=True)',
          'reversed(scores)',
          'sorted(scores)[0]',
          'sorted(scores, reverse=True)',
        ],
        3,
        'sorted makes a new list, and reverse=True orders it from highest to lowest.',
        'One option sorts in place; another does not sort at all.',
      ),
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
      choice(
        'What is printed?',
        [
          "['banana', 'fig', 'kiwi']",
          '[3, 4, 6]',
          "['fig', 'kiwi', 'banana']",
          "['banana', 'kiwi', 'fig']",
        ],
        2,
        'The words are ordered by their lengths 3, 4 and 6, but the words themselves are returned.',
        'The key decides the order; the items are returned.',
        'print(sorted(["kiwi", "fig", "banana"], key=len))',
      ),
      choice(
        'Which key sorts (name, age) pairs from oldest to youngest?',
        [
          'key=lambda p: p[1]',
          'key=lambda p: -p[1]',
          'key=lambda p: p[0]',
          'key=lambda p: -p[0]',
        ],
        1,
        'Negating the age makes larger ages sort first in ascending order.',
        'Negate the numeric field to reverse it.',
      ),
      choice(
        'What is printed?',
        ["(1, 'z')", "'a'", "(2, 'a')", "(3, 'c')"],
        2,
        'The key compares the letters, and a is the smallest, so its whole tuple is returned.',
        'min returns the item, not the key.',
        'print(min([(3, "c"), (1, "z"), (2, "a")], key=lambda t: t[1]))',
      ),
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
      choice(
        'What is printed?',
        ['4', '7', '1', '3'],
        2,
        '5 is 101 and 3 is 011; only the lowest bit is set in both.',
        'Line up the binary digits.',
        'print(5 & 3)',
      ),
      choice(
        'What is 1 << 4?',
        ['5', '4', '8', '16'],
        3,
        'Shifting 1 left by four places gives 2 ** 4.',
        'Each left shift doubles the value.',
      ),
      choice(
        'Which expression is nonzero exactly when bit 2 of x is set?',
        ['x | (1 << 2)', 'x & (1 << 2)', 'x ^ 2', 'x >> 2'],
        1,
        '1 << 2 has only bit 2 set, and & keeps that bit only if x has it.',
        'Mask a single bit with &.',
      ),
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
      choice(
        'After import math, how do you call its sqrt function?',
        ['sqrt(9)', 'math(sqrt, 9)', 'math.sqrt(9)', 'import sqrt(9)'],
        2,
        'A plain import keeps the module name, so you write math. before the function.',
        'Reach into the module with a dot.',
      ),
      choice(
        'What is printed?',
        ['6', '5', '5.9', '5.0'],
        1,
        'floor rounds down to the whole number 5.',
        'floor never rounds up.',
        'from math import floor\nprint(floor(5.9))',
      ),
      choice(
        'Which line lets you call statistics.mean as st.mean?',
        [
          'from statistics import st',
          'import st from statistics',
          'statistics = import st',
          'import statistics as st',
        ],
        3,
        'as gives the imported module a shorter name.',
        'Look for the alias keyword.',
      ),
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
      choice(
        'What is printed?',
        ['1 3', '4 3', '1 4', '3 4'],
        0,
        'popleft removes 1 from the left end, and three items remain.',
        'append adds at the right; popleft removes from the left.',
        'from collections import deque\nq = deque([1, 2, 3])\nq.append(4)\nprint(q.popleft(), len(q))',
      ),
      choice(
        'What is printed?',
        ['2 None', '1 0', '2 0', '2 1'],
        2,
        'x appears twice, and a missing key in a Counter reads as 0.',
        'Counter answers 0 for unseen items.',
        'from collections import Counter\nc = Counter(["x", "y", "x"])\nprint(c["x"], c["w"])',
      ),
      choice(
        'Why use deque.popleft() rather than list.pop(0) for a long queue?',
        [
          'popleft removes the newest item instead',
          'pop(0) shifts every other item, so it slows down as the list grows',
          'A list cannot remove its first item',
          'A deque keeps its items sorted',
        ],
        1,
        'Removing from the front of a list moves all later items; a deque removes from either end quickly.',
        'Think about what happens to the remaining items.',
      ),
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
      choice(
        'What is printed?',
        ['1 3', '5 1', '1 5', '8 5'],
        0,
        'heapify puts 1 at the front; after it is popped, 3 is the next smallest.',
        'Each pop removes the current smallest.',
        'import heapq\nh = [5, 1, 8, 3]\nheapq.heapify(h)\nprint(heapq.heappop(h), heapq.heappop(h))',
      ),
      choice(
        'After heapq.heapify(items), what is guaranteed?',
        [
          'The whole list is sorted',
          'items[-1] is the largest item',
          'items[0] is the smallest item',
          'The order of items is unchanged',
        ],
        2,
        'A heap guarantees only that the smallest item is at index 0.',
        'A heap is only partly ordered.',
      ),
      choice(
        'How do you get the largest values first from heapq?',
        [
          'Call heapq.heappop(heap, reverse=True)',
          'Push negated values and negate each popped value',
          'Read heap[-1] instead of heap[0]',
          'Sort the heap after each push',
        ],
        1,
        'heapq pops the smallest, and the smallest negated value belongs to the largest original value.',
        'heapq only knows how to find the smallest item.',
      ),
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
      choice(
        'What is printed?',
        ['1', '3', '2', '4'],
        2,
        '2 and 4 are smaller than 5, so 5 would be inserted at index 2.',
        'Count the items smaller than x.',
        'from bisect import bisect_left\nprint(bisect_left([2, 4, 6, 8], 5))',
      ),
      choice(
        'What is printed?',
        ['1 4', '1 3', '0 3', '2 4'],
        0,
        'The three 7s start at index 1, so the left point is 1 and the right point is 4.',
        'bisect_right lands after the equal items.',
        'from bisect import bisect_left, bisect_right\nvalues = [3, 7, 7, 7, 9]\nprint(bisect_left(values, 7), bisect_right(values, 7))',
      ),
      choice(
        'What must be true of values before calling bisect_left(values, x)?',
        [
          'values must contain x',
          'values must be sorted in ascending order',
          'values must have no duplicates',
          'values must have an even length',
        ],
        1,
        'Binary search relies on ascending order; x does not need to be present.',
        'Binary search halves a sorted range.',
      ),
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
      choice(
        'What is printed?',
        ['2', '5', '10', '7'],
        3,
        'a.size is 2 and b.size is 5; each object stores its own value.',
        'Each object has its own attributes.',
        'class Box:\n    def __init__(self, size):\n        self.size = size\n\na = Box(2)\nb = Box(5)\nprint(a.size + b.size)',
      ),
      choice(
        'Inside __init__, what does self refer to?',
        [
          'The class definition',
          'The new object being created',
          'The first argument the caller passes',
          'A global variable',
        ],
        1,
        'Python passes the new object as self, so self.attribute stores data on it.',
        'The caller never passes self.',
      ),
      choice(
        'What is printed?',
        ['4\n4', '4\n9', '9\n9', '9\n4'],
        1,
        'Changing b.count changes only b; a keeps 4.',
        'Separate objects keep separate attributes.',
        'class Tally:\n    def __init__(self, count):\n        self.count = count\n\na = Tally(4)\nb = Tally(4)\nb.count = 9\nprint(a.count)\nprint(b.count)',
      ),
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
      choice(
        'What is printed?',
        ['2', '5', '7', '0'],
        2,
        'Each add returns the same object, so both additions update one total.',
        'Returning self lets calls chain on one object.',
        'class Tally:\n    def __init__(self):\n        self.total = 0\n\n    def add(self, n):\n        self.total += n\n        return self\n\nt = Tally().add(2).add(5)\nprint(t.total)',
      ),
      choice(
        'In model.fit(data), which value does the method receive as self?',
        ['data', 'The class MeanModel', 'model', 'Nothing; self is optional'],
        2,
        'Calling a method through an object passes that object as self.',
        'Look at what comes before the dot.',
      ),
      choice(
        'Why does a scikit-learn model have attributes such as coef_ only after fit?',
        [
          'fit learns them from the data and stores them on the model',
          'The constructor deletes them',
          'They are settings passed to the constructor',
          'predict creates them',
        ],
        0,
        'Names ending in an underscore hold values learned by fit.',
        'Settings come before fit; learned values come from fit.',
      ),
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
