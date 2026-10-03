import { choose, predictOutput, type KnowledgePointModule } from './authoring';

export const knowledgePoints: KnowledgePointModule = {
  'cpp-integer-values': [
    {
      title: 'Initialize an int before reading it',
      explanation: [
        'An int object stores a whole number. Give it a value when you declare it; reading a local int that was never initialized is undefined behavior, not zero.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\nint main() {\n  int apples = 7;\n  std::cout << apples << "\\n";\n}',
        output: '7',
        explanation:
          'apples is initialized with 7 when it is declared, so reading it prints 7.',
      },
      questions: [
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint main() {\n  int count = 12;\n  std::cout << count << "\\n";\n}',
          ['12', '0', 'count', 'Compilation fails'],
          0,
          'count holds the value it was initialized with.',
        ),
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint main() {\n  int level = -3;\n  std::cout << level << "\\n";\n}',
          ['3', '-3', '0', 'level'],
          1,
          'An int can hold negative whole numbers, and it prints with its sign.',
        ),
        choose(
          'Which declaration is safe to read on the next line?',
          ['int total;', 'int total = 0;', 'int total[];', 'int;'],
          1,
          'Only the initialized declaration has a defined value to read.',
        ),
        choose(
          'What does a local int declared as `int score;` contain before assignment?',
          [
            'Always 0',
            'Always -1',
            'An indeterminate value that must not be read',
            'The value from the previous run',
          ],
          2,
          'Local scalars have no automatic initial value; reading one is undefined behavior.',
        ),
      ],
    },
    {
      title: 'Copy a value into another int',
      explanation: [
        'Initializing one int from another copies the number. The two objects are then independent: changing one does not change the other.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\nint main() {\n  int incoming = 7;\n  int saved = incoming;\n  incoming = 9;\n  std::cout << saved << " " << incoming << "\\n";\n}',
        output: '7 9',
        explanation:
          'saved received a copy of 7. Assigning 9 to incoming afterwards leaves saved unchanged.',
      },
      questions: [
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint main() {\n  int a = 4;\n  int b = a;\n  a = 10;\n  std::cout << b << "\\n";\n}',
          ['10', '4', '14', '0'],
          1,
          'b copied 4 before a changed, and the copy does not follow a.',
        ),
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint main() {\n  int x = 2;\n  int y = x;\n  y = y + 5;\n  std::cout << x << " " << y << "\\n";\n}',
          ['7 7', '2 7', '2 2', '7 2'],
          1,
          'Changing the copy y does not affect x.',
        ),
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint main() {\n  int first = 5;\n  int second = first;\n  first = first * 3;\n  std::cout << first << " " << second << "\\n";\n}',
          ['15 15', '5 5', '15 5', '5 15'],
          2,
          'first becomes 15, while second still holds the 5 it copied.',
        ),
      ],
    },
  ],
  'cpp-arithmetic': [
    {
      title: 'Divide integers and drop the fraction',
      explanation: [
        'When both operands of / are integers, C++ performs integer division: the result is an int, and any fractional part is discarded rather than rounded. 7 / 2 is 3, and 9 / 10 is 0.',
        'Dividing an int by zero is undefined behavior, so a program must make sure the divisor is nonzero before it divides.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\nint main() {\n  std::cout << 17 / 5 << " " << 9 / 10 << "\\n";\n}',
        output: '3 0',
        explanation:
          '17 / 5 is 3.4 in mathematics, so integer division keeps 3. 9 / 10 is 0.9, so it keeps 0.',
      },
      questions: [
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint main() {\n  int total = 22;\n  int teams = 4;\n  std::cout << total / teams << "\\n";\n}',
          ['5.5', '5', '6', '4'],
          1,
          '22 / 4 is 5.5 in mathematics; integer division discards the .5 and keeps 5.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  std::cout << 3 / 4 << "\\n";\n}',
          ['0.75', '1', '3', '0'],
          3,
          '3 / 4 is less than one, and integer division discards the whole fraction, leaving 0.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  int pages = 50;\n  int per_sheet = 8;\n  std::cout << pages / per_sheet * per_sheet << "\\n";\n}',
          ['50', '56', '48', '6'],
          2,
          '50 / 8 is 6 after truncation, and 6 * 8 is 48: the discarded fraction does not come back.',
        ),
        choose(
          'Which expression evaluates to 3 with int operands?',
          ['8 / 3', '11 / 4', '7 / 2', '5 / 2'],
          2,
          '7 / 2 is 3.5, which truncates to 3. The others are 2.67, 2.75, and 2.5, which all truncate to 2.',
        ),
        choose(
          'What does C++ guarantee when a program evaluates 10 / 0 with int operands?',
          [
            'The result is 0',
            'The result is the largest int',
            'Nothing: the behavior is undefined',
            'The result is 10',
          ],
          2,
          'Integer division by zero is undefined behavior, so the program has no defined result at all.',
        ),
      ],
    },
    {
      title: 'Truncate negative quotients toward zero',
      explanation: [
        'Integer division always truncates toward zero. For a negative quotient that means rounding up: -7 / 2 is -3, not -4. The sign of the result follows the usual rule for division.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\nint main() {\n  std::cout << -7 / 2 << " " << 7 / -2 << "\\n";\n}',
        output: '-3 -3',
        explanation:
          'Both quotients are -3.5 in mathematics. Truncating toward zero drops the .5 and keeps -3.',
      },
      questions: [
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint main() {\n  int change = -9;\n  std::cout << change / 4 << "\\n";\n}',
          ['-2', '-3', '-2.25', '2'],
          0,
          '-9 / 4 is -2.25, and truncating toward zero gives -2.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  std::cout << -1 / 3 << "\\n";\n}',
          ['-1', '-0.333333', '0', '1'],
          2,
          '-1 / 3 is about -0.33, and truncating toward zero gives 0.',
        ),
        choose(
          'In which direction does integer division round a quotient such as -7.5?',
          [
            'Toward negative infinity, giving -8',
            'To the nearest integer, giving -8',
            'Away from zero, giving -8',
            'Toward zero, giving -7',
          ],
          3,
          'C++ integer division truncates toward zero for every sign combination.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  int a = -15;\n  int b = 4;\n  std::cout << a / b << " " << -a / b << "\\n";\n}',
          ['-4 3', '-3 3', '-3 4', '-4 4'],
          1,
          '-15 / 4 is -3.75, which truncates to -3; 15 / 4 is 3.75, which truncates to 3.',
        ),
      ],
    },
    {
      title: 'Take the remainder with %',
      explanation: [
        'a % b is the remainder left after integer division: a - (a / b) * b. Together, / and % split a quantity into whole groups and leftovers, such as minutes into hours and minutes.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\nint main() {\n  int minutes = 135;\n  std::cout << minutes / 60 << " h " << minutes % 60 << " min\\n";\n}',
        output: '2 h 15 min',
        explanation:
          '135 / 60 is 2 whole hours, and 135 - 2 * 60 leaves 15 minutes.',
      },
      questions: [
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint main() {\n  std::cout << 29 % 6 << "\\n";\n}',
          ['4', '5', '1', '24'],
          1,
          '29 / 6 is 4, and 29 - 4 * 6 leaves 5.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  int eggs = 40;\n  std::cout << eggs / 12 << " " << eggs % 12 << "\\n";\n}',
          ['4 3', '3 12', '3.33 4', '3 4'],
          3,
          '40 eggs fill 3 boxes of 12, which hold 36, so 4 eggs are left over.',
        ),
        choose(
          'After int r = n % 5; which value of r means that n is a multiple of 5?',
          ['5', '0', '1', 'n / 5'],
          1,
          'A multiple of 5 divides evenly, so nothing is left over and the remainder is 0.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  std::cout << 8 % 10 << "\\n";\n}',
          ['0', '2', '8', '10'],
          2,
          '8 / 10 is 0, so the whole 8 is left over as the remainder.',
        ),
      ],
    },
    {
      title: 'Predict the sign of a remainder',
      explanation: [
        'Because / truncates toward zero, a % b takes the sign of the left operand a. So -7 % 2 is -1, while 7 % -2 is 1.',
        'This matters when testing for odd numbers: n % 2 is -1 for a negative odd n, so comparing the remainder with 1 misses it. Compare with 0 instead.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\nint main() {\n  std::cout << -7 % 3 << " " << 7 % -3 << "\\n";\n}',
        output: '-1 1',
        explanation:
          '-7 / 3 is -2, and -7 - (-2 * 3) is -1. 7 / -3 is -2, and 7 - (-2 * -3) is 1. Each remainder has the sign of its left operand.',
      },
      questions: [
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint main() {\n  std::cout << -10 % 4 << "\\n";\n}',
          ['2', '-2', '-3', '6'],
          1,
          '-10 / 4 truncates to -2, and -10 - (-2 * 4) leaves -2.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  int n = -9;\n  std::cout << n % 2 << "\\n";\n}',
          ['-1', '1', '0', '-4'],
          0,
          '-9 / 2 truncates to -4, and -9 - (-4 * 2) leaves -1: the remainder keeps the sign of -9.',
        ),
        choose(
          'A program decides that n is odd when n % 2 equals 1. Why does it miss n = -5?',
          [
            'Because -5 % 2 is 0',
            'Because -5 % 2 is -1',
            'Because % rejects negative operands',
            'Because -5 % 2 is 1.5',
          ],
          1,
          'The remainder takes the sign of the left operand, so -5 % 2 is -1, not 1.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  std::cout << 14 % -5 << " " << -14 % 5 << "\\n";\n}',
          ['-4 4', '4 4', '4 -4', '-4 -4'],
          2,
          'Each remainder takes the sign of its left operand: 14 gives 4 and -14 gives -4.',
        ),
      ],
    },
  ],
  'cpp-explicit-casts': [
    {
      title: 'Convert an int to double before dividing',
      explanation: [
        'static_cast<double>(x) produces the double value of an int. When at least one operand of / is a double, C++ performs floating-point division and keeps the fraction.',
        'std::cout prints a double with up to six significant digits and drops a trailing .0, so 2.0 prints as 2.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\nint main() {\n  int total = 7;\n  int count = 2;\n  std::cout << static_cast<double>(total) / count << "\\n";\n}',
        output: '3.5',
        explanation:
          'total is converted to 7.0 first, so 7.0 / 2 is floating-point division and keeps the .5.',
      },
      questions: [
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint main() {\n  int sum = 9;\n  int n = 4;\n  std::cout << static_cast<double>(sum) / n << "\\n";\n}',
          ['2', '2.25', '2.0', '2.3'],
          1,
          'sum becomes 9.0, and 9.0 / 4 is 2.25.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  int a = 5;\n  std::cout << a / 2 << " " << static_cast<double>(a) / 2 << "\\n";\n}',
          ['2.5 2.5', '2 2', '2 2.5', '2.5 2'],
          2,
          'a / 2 is integer division and gives 2; converting a to double first gives 2.5.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  double share = static_cast<double>(6) / 3;\n  std::cout << share << "\\n";\n}',
          ['2.0', '2', '2.00', '3'],
          1,
          'The value is the double 2.0, and std::cout prints it without a trailing .0.',
        ),
        choose(
          'Which expression evaluates to 0.25?',
          [
            '1 / 4',
            'static_cast<double>(1 / 4)',
            'static_cast<double>(1) / 4',
            '1 % 4',
          ],
          2,
          'Only the third converts before dividing. 1 / 4 is 0 before any cast, and 1 % 4 is the remainder 1.',
        ),
      ],
    },
    {
      title: 'Cast before the division, not after it',
      explanation: [
        'A cast applies to the value it is given. static_cast<double>(7 / 2) converts the int 3, because the integer division has already discarded the fraction. Put the cast on an operand so the division itself happens in double.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\nint main() {\n  std::cout << static_cast<double>(7 / 2) << " " << static_cast<double>(7) / 2 << "\\n";\n}',
        output: '3 3.5',
        explanation:
          'In the first expression 7 / 2 is already 3 when the cast runs. In the second, 7.0 / 2 keeps the fraction.',
      },
      questions: [
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint main() {\n  int points = 11;\n  int games = 2;\n  double average = static_cast<double>(points / games);\n  std::cout << average << "\\n";\n}',
          ['5.5', '5', '6', '5.0'],
          1,
          'points / games is integer division and gives 5; converting 5 to double does not bring back the .5.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  int a = 3;\n  int b = 4;\n  std::cout << static_cast<double>(a) / b << " " << static_cast<double>(a / b) << "\\n";\n}',
          ['0.75 0.75', '0 0', '0.75 0', '0 0.75'],
          2,
          'Casting a first gives 3.0 / 4 = 0.75; casting a / b converts the already truncated 0.',
        ),
        choose(
          'A program computes static_cast<double>(total / count) and always gets whole numbers. Why?',
          [
            'The cast runs after integer division has discarded the fraction',
            'static_cast<double> always rounds its argument down',
            'A double cannot hold the fraction of an int quotient',
            'count must also be cast, or no cast has any effect',
          ],
          0,
          'The parentheses make total / count an int division first; only its truncated result is converted.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  int x = 10;\n  int y = 4;\n  double ratio = static_cast<double>(x) / y;\n  std::cout << ratio * 2 << "\\n";\n}',
          ['4', '6', '5.0', '5'],
          3,
          'ratio is 2.5, and 2.5 * 2 is the double 5, printed as 5.',
        ),
      ],
    },
    {
      title: 'Convert a double back to int',
      explanation: [
        'static_cast<int>(d) discards the fractional part of a double, truncating toward zero like integer division: 9.99 becomes 9 and -4.6 becomes -4. It does not round to the nearest whole number.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\nint main() {\n  double price = 7.85;\n  std::cout << static_cast<int>(price) << " " << static_cast<int>(-2.7) << "\\n";\n}',
        output: '7 -2',
        explanation:
          'Both conversions drop the fraction: 7.85 becomes 7, and -2.7 moves toward zero to -2.',
      },
      questions: [
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint main() {\n  std::cout << static_cast<int>(9.99) << "\\n";\n}',
          ['10', '9', '9.99', '9.9'],
          1,
          'The conversion discards .99 instead of rounding, leaving 9.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  double half = static_cast<double>(7) / 2;\n  std::cout << static_cast<int>(half * 3) << "\\n";\n}',
          ['10', '11', '10.5', '9'],
          0,
          'half is 3.5, half * 3 is 10.5, and converting to int drops the .5.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  std::cout << static_cast<int>(-4.6) << "\\n";\n}',
          ['-5', '-4.6', '4', '-4'],
          3,
          'The fraction is discarded toward zero, so -4.6 becomes -4, not -5.',
        ),
      ],
    },
  ],
  'cpp-bool-values': [
    {
      title: 'Compare for equality with == and !=',
      explanation: [
        'a == b is true when the values are equal, and a != b is true when they differ. Each comparison produces a bool, and std::cout prints a bool as 1 for true and 0 for false.',
        'Put a comparison in parentheses when printing it, because << would otherwise apply to a before == is evaluated.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\nint main() {\n  int a = 4;\n  int b = 4;\n  std::cout << (a == b) << " " << (a != b) << "\\n";\n}',
        output: '1 0',
        explanation:
          'a and b are equal, so a == b is true (printed 1) and a != b is false (printed 0).',
      },
      questions: [
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint main() {\n  int x = 3;\n  std::cout << (x == 5) << "\\n";\n}',
          ['false', '0', '1', '5'],
          1,
          '3 is not equal to 5, so the comparison is false, which std::cout prints as 0.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  int a = 7;\n  int b = 2;\n  std::cout << (a != b) << " " << (a == b + 5) << "\\n";\n}',
          ['1 0', '0 1', '1 1', 'true true'],
          2,
          '7 differs from 2, and b + 5 is 7, so both comparisons are true and print 1.',
        ),
        choose(
          'Why is the comparison written in parentheses in std::cout << (a == b);?',
          [
            'They turn the comparison result into an int',
            'Without them, << would apply first and the code would not compile',
            'They make == compare values instead of names',
            'They are only a style choice with no effect',
          ],
          1,
          'Without parentheses the expression is (std::cout << a) == b, which compares a stream with an int and does not compile.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  int count = 0;\n  std::cout << (count == 0) << (count != 0) << "\\n";\n}',
          ['01', '1 0', 'truefalse', '10'],
          3,
          'count == 0 is true and prints 1; count != 0 is false and prints 0, with no space between them.',
        ),
      ],
    },
    {
      title: 'Order values with <, <=, >, and >=',
      explanation: [
        'The ordering operators also produce bool. < and > are strict, so a value is not less than itself; <= and >= include equality.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\nint main() {\n  int score = 70;\n  std::cout << (score >= 70) << " " << (score > 70) << "\\n";\n}',
        output: '1 0',
        explanation:
          '70 >= 70 includes equality and is true; 70 > 70 is strict and is false.',
      },
      questions: [
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint main() {\n  int a = -3;\n  int b = 2;\n  std::cout << (a < b) << "\\n";\n}',
          ['1', '0', '-1', 'true'],
          0,
          '-3 is less than 2, so the comparison is true and prints 1.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  int limit = 10;\n  int used = 10;\n  std::cout << (used < limit) << " " << (used <= limit) << "\\n";\n}',
          ['1 1', '0 0', '0 1', '1 0'],
          2,
          'used equals limit, so the strict < is false and <= is true.',
        ),
        choose(
          'x holds 5. Which comparison is true?',
          ['x > 5', 'x < 5', 'x != 5', 'x >= 5'],
          3,
          'Only >= includes equality; > and < are strict, and x != 5 is false.',
        ),
      ],
    },
    {
      title: 'Store a comparison in a bool',
      explanation: [
        'A bool variable can hold a comparison result. The comparison is evaluated once, when the bool is initialized; later changes to the compared values do not update it.',
        'One = assigns and two == compare. Writing x = 5 where x == 5 was meant stores 5 in x instead of testing it.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\nint main() {\n  int age = 20;\n  bool adult = age >= 18;\n  std::cout << adult << "\\n";\n}',
        output: '1',
        explanation: '20 >= 18 is true, so adult holds true and prints 1.',
      },
      questions: [
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint main() {\n  int level = 3;\n  bool high = level > 5;\n  std::cout << high << "\\n";\n}',
          ['1', '0', '3', 'false'],
          1,
          '3 > 5 is false, and a false bool prints as 0.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  int a = 2;\n  int b = 9;\n  a = b;\n  std::cout << (a == b) << " " << a << "\\n";\n}',
          ['0 2', '1 9', '1 2', '0 9'],
          1,
          'a = b copies 9 into a, so the comparison is true and a prints 9.',
        ),
        choose(
          'What does x = 5 do when it is written where x == 5 was intended?',
          [
            'It compares x with 5 and leaves x unchanged',
            'It always produces false',
            'It stores 5 in x, and the expression has the value 5',
            'It fails to compile wherever it appears',
          ],
          2,
          'A single = is assignment: it changes x and yields the assigned value.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  int t = 8;\n  bool same = t == 8;\n  t = 9;\n  std::cout << same << "\\n";\n}',
          ['0', '9', '1', '8'],
          2,
          'same was computed while t was 8; changing t afterwards does not recompute it.',
        ),
      ],
    },
  ],
  'cpp-values': [
    {
      title: 'Read the limits of int',
      explanation: [
        'std::numeric_limits<int>::max() and min() from <limits> give the largest and smallest int. With the 32-bit int used by these compilers they are 2147483647 and -2147483648.',
        'Signed overflow, such as max() + 1, is undefined behavior: the language gives the program no meaning at all, so it must never be evaluated.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\n#include <limits>\nint main() {\n  std::cout << std::numeric_limits<int>::max() << "\\n";\n}',
        output: '2147483647',
        explanation:
          'On this compiler int has 32 bits, so the largest value is 2 to the 31st power minus 1.',
      },
      questions: [
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <limits>\nint main() {\n  int top = std::numeric_limits<int>::max();\n  std::cout << top - 7 << "\\n";\n}',
          ['2147483654', '2147483640', '-2147483641', '2147483647'],
          1,
          'Subtracting 7 from the maximum stays in range: 2147483647 - 7 is 2147483640.',
        ),
        choose(
          'What does the C++ standard say about evaluating std::numeric_limits<int>::max() + 1?',
          [
            'It wraps around to the minimum int',
            'It stays at the maximum int',
            'It produces a wider long value',
            'It is undefined behavior',
          ],
          3,
          'Signed integer overflow has no defined result, so a correct program checks before adding.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\n#include <limits>\nint main() {\n  int low = std::numeric_limits<int>::min();\n  std::cout << (low < 0) << " " << (low + 1 < 0) << "\\n";\n}',
          ['1 0', '0 1', '1 1', '0 0'],
          2,
          'The minimum is negative, and adding 1 to it stays in range and is still negative.',
        ),
      ],
    },
    {
      title: 'Check before adding a positive number',
      explanation: [
        'a + b overflows for a positive b exactly when a > max - b. Because b is positive, max - b cannot overflow, so the guard can be evaluated safely before the addition.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\n#include <limits>\nint main() {\n  int a = 2147483000;\n  int b = 1000;\n  if (b > 0 && a > std::numeric_limits<int>::max() - b) std::cout << "overflow\\n";\n  else std::cout << a + b << "\\n";\n}',
        output: 'overflow',
        explanation:
          'max - b is 2147482647, and a is larger, so a + b would pass the maximum. The guard rejects it without adding.',
      },
      questions: [
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <limits>\nint main() {\n  int a = 100;\n  int b = 50;\n  if (b > 0 && a > std::numeric_limits<int>::max() - b) std::cout << "reject\\n";\n  else std::cout << a + b << "\\n";\n}',
          ['reject', '150', '100', '50'],
          1,
          '100 is far below max - 50, so the guard passes and the sum 150 is printed.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\n#include <limits>\nint main() {\n  int a = std::numeric_limits<int>::max() - 5;\n  int b = 6;\n  bool fits = !(b > 0 && a > std::numeric_limits<int>::max() - b);\n  std::cout << fits << "\\n";\n}',
          ['1', '-1', '6', '0'],
          3,
          'a is max - 5, which is greater than max - 6, so the sum would overflow and fits is false.',
        ),
        choose(
          'Why does the guard compare a with max - b instead of checking whether a + b is greater than max?',
          [
            'Computing a + b would already overflow, which is undefined',
            'Subtraction is faster than addition',
            'An int sum cannot be compared with max',
            'max - b is shorter to write',
          ],
          0,
          'No int can be greater than max, and an overflowing a + b is undefined, so the check must avoid evaluating it.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\n#include <limits>\nint main() {\n  int a = std::numeric_limits<int>::max() - 6;\n  int b = 6;\n  if (a > std::numeric_limits<int>::max() - b) std::cout << "reject\\n";\n  else std::cout << (a + b == std::numeric_limits<int>::max()) << "\\n";\n}',
          ['reject', '0', '1', '2147483647'],
          2,
          'a equals max - 6, which is not greater than max - 6, so the sum is allowed and equals max exactly.',
        ),
      ],
    },
    {
      title: 'Check before adding a negative number',
      explanation: [
        'For a negative b the danger is going below the minimum: a + b underflows exactly when a < min - b. With b negative, min - b is larger than min and cannot overflow.',
        'A complete guard checks both directions before adding.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\n#include <limits>\nint main() {\n  int a = std::numeric_limits<int>::min() + 3;\n  int b = -5;\n  if (b < 0 && a < std::numeric_limits<int>::min() - b) std::cout << "underflow\\n";\n  else std::cout << a + b << "\\n";\n}',
        output: 'underflow',
        explanation:
          'min - b is min + 5, and a is only min + 3, so adding -5 would go below the minimum.',
      },
      questions: [
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <limits>\nint main() {\n  int a = -20;\n  int b = -7;\n  if (b < 0 && a < std::numeric_limits<int>::min() - b) std::cout << "underflow\\n";\n  else std::cout << a + b << "\\n";\n}',
          ['underflow', '-13', '-27', '27'],
          2,
          '-20 is far above min + 7, so the guard passes and the sum is -27.',
        ),
        choose(
          'b is negative. Which test detects that a + b would go below the minimum int?',
          ['a > max - b', 'a + b < min', 'a < min + b', 'a < min - b'],
          3,
          'min - b is safe to compute when b is negative. a + b < min would evaluate the overflowing sum, and min + b itself overflows.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\n#include <limits>\nint main() {\n  int a = std::numeric_limits<int>::min() + 2;\n  int b = -3;\n  bool safe = !(b > 0 && a > std::numeric_limits<int>::max() - b) &&\n              !(b < 0 && a < std::numeric_limits<int>::min() - b);\n  std::cout << safe << "\\n";\n}',
          ['1', '-1', '0', '2'],
          2,
          'a is min + 2, which is below min + 3, so adding -3 would underflow and safe is false.',
        ),
      ],
    },
  ],
  'cpp-unsigned-wrap': [
    {
      title: 'Watch unsigned values wrap around',
      explanation: [
        'unsigned int holds only non-negative values, and its arithmetic is defined modulo one more than its maximum. Going past the maximum wraps to 0, and going below 0 wraps to the maximum. Unlike signed overflow, this is well defined.',
        'Write unsigned literals with a u suffix, such as 3u.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\n#include <limits>\nint main() {\n  unsigned int top = std::numeric_limits<unsigned int>::max();\n  unsigned int next = top + 1u;\n  std::cout << next << "\\n";\n}',
        output: '0',
        explanation: 'One past the maximum wraps around to 0.',
      },
      questions: [
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <limits>\nint main() {\n  unsigned int zero = 0u;\n  unsigned int below = zero - 1u;\n  std::cout << (below == std::numeric_limits<unsigned int>::max()) << "\\n";\n}',
          ['0', '1', '-1', '4294967296'],
          1,
          'Subtracting 1 from 0 wraps to the maximum, so the comparison is true.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\n#include <limits>\nint main() {\n  unsigned int top = std::numeric_limits<unsigned int>::max();\n  std::cout << top + 3u << "\\n";\n}',
          ['2', '3', '4294967298', '-2'],
          0,
          'One step past the maximum is 0, so three steps past it is 2.',
        ),
        choose(
          'How does C++ define unsigned int arithmetic that goes past the maximum?',
          [
            'As undefined behavior, like signed overflow',
            'It stops at the maximum value',
            'It throws an exception',
            'Modulo one more than the maximum value',
          ],
          3,
          'Unsigned arithmetic always wraps modulo 2 to the number of bits.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  unsigned int a = 3u;\n  unsigned int b = 5u;\n  std::cout << (a - b > a) << "\\n";\n}',
          ['0', '4294967294', '1', '-2'],
          2,
          '3u - 5u wraps to a huge value, which is greater than 3, so the comparison prints 1.',
        ),
      ],
    },
    {
      title: 'Compare before subtracting unsigned values',
      explanation: [
        'An unsigned difference a - b wraps when b is larger than a, so it can never be negative. To find how far apart two unsigned values are, compare them first and subtract the smaller from the larger.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\nint main() {\n  unsigned int stock = 4u;\n  unsigned int order = 6u;\n  if (order > stock) std::cout << "short by " << order - stock << "\\n";\n  else std::cout << stock - order << "\\n";\n}',
        output: 'short by 2',
        explanation:
          'order is larger, so the program subtracts in the safe direction: 6 - 4 is 2.',
      },
      questions: [
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint main() {\n  unsigned int have = 10u;\n  unsigned int need = 3u;\n  if (need > have) std::cout << "short\\n";\n  else std::cout << have - need << "\\n";\n}',
          ['short', '-7', '13', '7'],
          3,
          'need is not larger than have, so the program prints 10 - 3.',
        ),
        choose(
          'With unsigned int a = 2u and b = 5u, why is a - b < 0u never true?',
          [
            'The compiler rejects comparisons of unsigned values with 0',
            'An unsigned result is never negative; a - b wraps to a large value',
            'a - b is computed as 3',
            'Every comparison with 0 is false',
          ],
          1,
          'Unsigned values have no negative range, so the difference wraps around instead of going below zero.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  unsigned int a = 2u;\n  unsigned int b = 5u;\n  unsigned int gap = a - b;\n  std::cout << (gap > 1000u) << "\\n";\n}',
          ['0', '-3', '1', '3'],
          2,
          '2u - 5u wraps to 4294967293, which is greater than 1000.',
        ),
      ],
    },
    {
      title: 'Reject a sum before it wraps',
      explanation: [
        'Wrapping is useful when modular arithmetic is the goal, but it silently turns a too-large total into a small one. A limit check written as used + extra <= limit can then accept a request it should reject. Check against the remaining room, max - used, before adding.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\n#include <limits>\nint main() {\n  unsigned int used = std::numeric_limits<unsigned int>::max() - 2u;\n  unsigned int extra = 5u;\n  if (extra > std::numeric_limits<unsigned int>::max() - used) std::cout << "rejected\\n";\n  else std::cout << used + extra << "\\n";\n}',
        output: 'rejected',
        explanation:
          'Only 2 more fit below the maximum, and extra is 5, so the program rejects before the sum wraps.',
      },
      questions: [
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <limits>\nint main() {\n  unsigned int used = 10u;\n  unsigned int extra = 5u;\n  if (extra > std::numeric_limits<unsigned int>::max() - used) std::cout << "rejected\\n";\n  else std::cout << used + extra << "\\n";\n}',
          ['rejected', '15', '5', '10'],
          1,
          'There is plenty of room above 10, so the program adds and prints 15.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\n#include <limits>\nint main() {\n  unsigned int used = std::numeric_limits<unsigned int>::max() - 2u;\n  unsigned int total = used + 5u;\n  std::cout << total << "\\n";\n}',
          ['4294967298', '3', '2', 'rejected'],
          2,
          'Two steps reach the maximum, one more wraps to 0, and two more reach 2.',
        ),
        choose(
          'A program accepts a request when used + extra <= limit, using unsigned ints. What goes wrong when used + extra passes the maximum?',
          [
            'The program stops with an overflow error',
            'The sum stays at the maximum, so the check rejects',
            'The sum wraps to a small value, so the check wrongly accepts',
            'Nothing, because unsigned sums cannot pass the maximum',
          ],
          2,
          'The wrapped sum is small and passes the comparison even though the real total exceeds the limit.',
        ),
      ],
    },
  ],
  'cpp-scoped-enums': [
    {
      title: 'Define and compare enum class values',
      explanation: [
        'enum class Light { Red, Green }; defines a new type whose only values are the named enumerators. Each enumerator is written with its type name, Light::Red, and values of the same enum compare with == and !=.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\nenum class Light { Red, Green };\nint main() {\n  Light now = Light::Green;\n  std::cout << (now == Light::Green) << " " << (now == Light::Red) << "\\n";\n}',
        output: '1 0',
        explanation:
          'now holds Light::Green, so the first comparison is true and the second is false.',
      },
      questions: [
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nenum class Door { Open, Closed };\nint main() {\n  Door d = Door::Closed;\n  std::cout << (d == Door::Open) << "\\n";\n}',
          ['1', 'Closed', '0', 'Door::Closed'],
          2,
          'd holds Door::Closed, which is not Door::Open, so the comparison prints 0.',
        ),
        choose(
          'Given enum class Side { Buy, Sell };, which declaration compiles?',
          [
            'Side s = Buy;',
            'Side s = 1;',
            'int s = Side::Sell;',
            'Side s = Side::Sell;',
          ],
          3,
          'Scoped enumerators need the Side:: prefix, and they neither come from nor convert to int implicitly.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\nenum class Mode { Fast, Safe };\nint main() {\n  Mode a = Mode::Safe;\n  Mode b = a;\n  std::cout << (a == b) << (b != Mode::Fast) << "\\n";\n}',
          ['10', '01', '11', '00'],
          2,
          'b copies Mode::Safe from a, so the values are equal and b is not Fast: both print 1.',
        ),
      ],
    },
    {
      title: 'Map enumerators to numbers explicitly',
      explanation: [
        'An enum class value does not convert to int on its own, so it cannot be printed or added to directly. When a number is needed, choose it explicitly, for example with the conditional operator.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\nenum class Side { Buy, Sell };\nint main() {\n  Side side = Side::Sell;\n  int sign = side == Side::Buy ? 1 : -1;\n  std::cout << sign * 5 << "\\n";\n}',
        output: '-5',
        explanation:
          'side is Sell, so the conditional chooses -1, and -1 * 5 is -5.',
      },
      questions: [
        choose(
          'What happens when this program is compiled?',
          [
            'It prints 1, the position of High',
            'It prints High, the enumerator name',
            'It does not compile: Level does not convert to int',
            'It prints Level::High in full',
          ],
          2,
          'std::cout has no way to print a scoped enumeration, because it does not convert implicitly to int.',
          '#include <iostream>\nenum class Level { Low, High };\nint main() {\n  Level level = Level::High;\n  std::cout << level << "\\n";\n}',
        ),
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nenum class Side { Buy, Sell };\nint main() {\n  Side s = Side::Buy;\n  int qty = 7;\n  std::cout << (s == Side::Buy ? qty : -qty) << "\\n";\n}',
          ['-7', '1', '7', '0'],
          2,
          's is Buy, so the conditional yields qty, which is 7.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\nenum class Fee { None, Flat };\nint main() {\n  Fee fee = Fee::Flat;\n  int cost = 100 + (fee == Fee::Flat ? 5 : 0);\n  std::cout << cost << "\\n";\n}',
          ['105', '100', '5', '101'],
          0,
          'fee is Flat, so 5 is added to 100.',
        ),
        choose(
          'Why does int x = Side::Buy + 1; fail to compile for enum class Side { Buy, Sell };?',
          [
            'Buy must be written as Side.Buy',
            'Scoped enumerators have no implicit conversion to int',
            'Values of an enum class cannot be compared',
            'The + operator needs double operands',
          ],
          1,
          'A scoped enumerator is not an int, so arithmetic on it does not compile.',
        ),
      ],
    },
    {
      title: 'Handle every alternative',
      explanation: [
        'When an enum has several alternatives, decide what each one means. A chain of conditional operators tests them in order; the final branch handles whatever is left, so a newly added enumerator silently falls into it unless the chain is updated.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\nenum class Signal { Stop, Slow, Go };\nint main() {\n  Signal s = Signal::Slow;\n  int speed = s == Signal::Stop ? 0 : s == Signal::Slow ? 30 : 60;\n  std::cout << speed << "\\n";\n}',
        output: '30',
        explanation:
          's is not Stop, so the second test runs; s is Slow, so speed is 30.',
      },
      questions: [
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nenum class Signal { Stop, Slow, Go };\nint main() {\n  Signal s = Signal::Go;\n  int speed = s == Signal::Stop ? 0 : s == Signal::Slow ? 30 : 60;\n  std::cout << speed << "\\n";\n}',
          ['0', '30', '60', '2'],
          2,
          'Go fails both tests, so the final branch gives 60.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\nenum class Tier { Basic, Plus, Pro };\nint main() {\n  Tier t = Tier::Basic;\n  int seats = t == Tier::Pro ? 10 : t == Tier::Plus ? 5 : 1;\n  std::cout << seats << "\\n";\n}',
          ['10', '1', '5', '0'],
          1,
          'Basic is neither Pro nor Plus, so the last branch gives 1 seat.',
        ),
        choose(
          'Someone adds Signal::Fast to the enum above but leaves the speed chain unchanged. What speed does Signal::Fast get?',
          [
            'A compile error',
            '0, from the first branch',
            'An unpredictable value',
            '60, from the final branch',
          ],
          3,
          'Fast fails the Stop and Slow tests, so it falls into the last branch: the chain must be updated deliberately.',
        ),
      ],
    },
  ],
  'cpp-types': [
    {
      title: 'Let auto deduce a type from its initializer',
      explanation: [
        'auto x = expression; gives x the type of the expression, so auto count = 5; declares an int. The initializer is required, because it is where the type comes from. The new variable is an ordinary independent object.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\nint main() {\n  int a = 4;\n  auto doubled = a * 2;\n  doubled += 1;\n  std::cout << doubled << " " << a << "\\n";\n}',
        output: '9 4',
        explanation:
          'doubled is an int initialized to 8; changing it to 9 does not affect a.',
      },
      questions: [
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint main() {\n  auto x = 7;\n  auto y = x;\n  y = y * 3;\n  std::cout << x << " " << y << "\\n";\n}',
          ['21 21', '7 21', '7 7', '21 7'],
          1,
          'y is a separate int copied from x, so only y becomes 21.',
        ),
        choose(
          'What type does n have after auto n = 3 + 4;?',
          ['int', 'auto', 'long', 'It depends on later assignments'],
          0,
          'auto takes the type of the initializer, and 3 + 4 is an int.',
        ),
        choose(
          'Why does the declaration auto total; fail to compile?',
          [
            'auto variables must be declared outside main',
            'total is a reserved word',
            'auto needs an initializer to deduce the type from',
            'auto can only declare references',
          ],
          2,
          'Without an initializer the compiler has nothing to deduce the type from.',
        ),
      ],
    },
    {
      title: 'Copy with auto, refer with auto&',
      explanation: [
        'Plain auto always makes a new value, even when the initializer is a reference. To make the new name refer to an existing object, write auto&.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\nint main() {\n  int balance = 50;\n  auto copy = balance;\n  auto& alias = balance;\n  copy += 10;\n  alias += 1;\n  std::cout << balance << " " << copy << "\\n";\n}',
        output: '51 60',
        explanation:
          'copy is an independent int, so adding 10 leaves balance alone. alias refers to balance, so adding 1 changes it to 51.',
      },
      questions: [
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint main() {\n  int stock = 8;\n  auto& ref = stock;\n  ref -= 3;\n  std::cout << stock << "\\n";\n}',
          ['8', '3', '5', '11'],
          2,
          'ref is another name for stock, so subtracting through it changes stock to 5.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  int level = 2;\n  int& r = level;\n  auto c = r;\n  c = 9;\n  std::cout << level << "\\n";\n}',
          ['9', '2', '11', '0'],
          1,
          'Plain auto drops the reference, so c is a copy of 2; assigning 9 to it leaves level unchanged.',
        ),
        choose(
          'You want x to be another name for total, so that x += 1 changes total. Which declaration does that?',
          [
            'auto x = total;',
            'int x = total;',
            'auto x = total + 0;',
            'auto& x = total;',
          ],
          3,
          'Only auto& declares a reference; the other declarations make independent copies.',
        ),
      ],
    },
    {
      title: 'Track copies and aliases together',
      explanation: [
        'When one program mixes auto and auto&, follow each name to the object it denotes: a reference changes the object it refers to, while a copy keeps the value it had when it was made.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\nint main() {\n  int x = 3;\n  auto& r = x;\n  auto v = r;\n  r += 4;\n  v += 1;\n  std::cout << x << " " << v << "\\n";\n}',
        output: '7 4',
        explanation:
          'v copied 3 before r changed x. r += 4 makes x 7, and v += 1 makes v 4.',
      },
      questions: [
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint main() {\n  int a = 1;\n  auto& b = a;\n  auto c = b;\n  b = 5;\n  std::cout << a << c << "\\n";\n}',
          ['55', '15', '51', '11'],
          2,
          'b changes a to 5, while c kept the copy 1 it was initialized with.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  int score = 10;\n  auto saved = score;\n  auto& live = score;\n  live = live * 2;\n  std::cout << saved + live << "\\n";\n}',
          ['30', '20', '40', '10'],
          0,
          'saved is 10, and live refers to score, which becomes 20, so the sum is 30.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  int n = 6;\n  auto& first = n;\n  auto& second = first;\n  second -= 2;\n  std::cout << n << " " << first << "\\n";\n}',
          ['6 6', '4 6', '6 4', '4 4'],
          3,
          'first and second both refer to n, so subtracting through second makes every name read 4.',
        ),
      ],
    },
  ],
  'cpp-char-values': [
    {
      title: 'Write characters with single quotes',
      explanation: [
        "A char holds a single character. A character literal is written in single quotes, such as 'B'; double quotes make a string literal instead, even for one character. std::cout prints a char as the character itself.",
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\nint main() {\n  char grade = \'B\';\n  std::cout << grade << "\\n";\n}',
        output: 'B',
        explanation:
          'grade holds the character B, and printing a char shows the character.',
      },
      questions: [
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint main() {\n  char c = \'x\';\n  std::cout << c << c << "\\n";\n}',
          ["'x''x'", 'xx', 'x', '120120'],
          1,
          'Each << prints the character x, with nothing between them.',
        ),
        choose(
          'Which declaration stores one character in a char?',
          ['char c = "A";', "char c = 'AB';", "char c = 'A';", 'char c = A;'],
          2,
          'Single quotes with exactly one character make a char literal. "A" is a string literal, and A alone is a name.',
        ),
        predictOutput(
          'What does this program print?',
          "#include <iostream>\nint main() {\n  char first = 'q';\n  char second = first;\n  first = 'r';\n  std::cout << first << second << \"\\n\";\n}",
          ['rr', 'qq', 'qr', 'rq'],
          3,
          'second copied q before first changed to r.',
        ),
      ],
    },
    {
      title: 'Treat a char as a small integer code',
      explanation: [
        "Every char has an integer code. These compilers use ASCII, where 'A' is 65 and 'a' is 97. Arithmetic on a char produces an int, so 'a' + 1 prints as 98; storing the result back in a char prints the character with that code.",
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\nint main() {\n  char letter = \'A\';\n  int code = letter;\n  char next = letter + 1;\n  std::cout << code << " " << next << "\\n";\n}',
        output: '65 B',
        explanation:
          'code holds the int 65. letter + 1 is 66, and storing it in a char makes the character B.',
      },
      questions: [
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint main() {\n  char c = \'a\';\n  std::cout << c + 1 << "\\n";\n}',
          ['b', 'a1', '98', '97'],
          2,
          'c + 1 is int arithmetic on the code 97, so the program prints the int 98, not a character.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  char c = \'a\';\n  char d = c + 2;\n  std::cout << d << "\\n";\n}',
          ['99', 'c', 'a2', 'b'],
          1,
          'Storing 97 + 2 in a char gives the character with code 99, which is c.',
        ),
        predictOutput(
          'What does this program print?',
          "#include <iostream>\nint main() {\n  char c = 'C';\n  int gap = c - 'A';\n  std::cout << gap << \"\\n\";\n}",
          ['2', '3', 'C', '67'],
          0,
          "The letter codes are consecutive, so 'C' - 'A' is 2.",
        ),
      ],
    },
    {
      title: 'Convert a digit character to its value',
      explanation: [
        "The digit characters '0' through '9' have consecutive codes, so c - '0' turns a digit character into its numeric value, and '0' + n turns a value from 0 to 9 back into a digit character.",
      ],
      example: {
        language: 'cpp',
        code: "#include <iostream>\nint main() {\n  char digit = '7';\n  int value = digit - '0';\n  std::cout << value * 2 << \"\\n\";\n}",
        output: '14',
        explanation: "'7' - '0' is 7, so value * 2 is 14.",
      },
      questions: [
        predictOutput(
          'What does this complete C++20 program print?',
          "#include <iostream>\nint main() {\n  char d = '4';\n  std::cout << (d - '0') + 1 << \"\\n\";\n}",
          ['53', '5', '41', '4'],
          1,
          "d - '0' is the value 4, and adding 1 gives 5. Adding 1 to the character code itself would give 53.",
        ),
        predictOutput(
          'What does this program print?',
          "#include <iostream>\nint main() {\n  char tens = '3';\n  char ones = '8';\n  int number = (tens - '0') * 10 + (ones - '0');\n  std::cout << number << \"\\n\";\n}",
          ['11', '83', '3858', '38'],
          3,
          'The digits convert to 3 and 8, and 3 * 10 + 8 is 38.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  int value = 6;\n  char digit = \'0\' + value;\n  std::cout << digit << "\\n";\n}',
          ['54', '06', '6', '0'],
          2,
          "'0' + 6 is the code of the character 6, and printing a char shows the character.",
        ),
        choose(
          "What does int value = '9'; store?",
          [
            'The number 9',
            "The character code of '9', which is 57 in ASCII",
            'Nothing, because the line does not compile',
            '0, because characters are not numbers',
          ],
          1,
          "A char converts to its integer code; use '9' - '0' to get the value 9.",
        ),
      ],
    },
  ],
  'cpp-sizeof-bytes': [
    {
      title: 'Ask sizeof for the size of a type',
      explanation: [
        'sizeof(type) gives the number of bytes the type occupies, as a std::size_t that the compiler knows before the program runs. sizeof(char) is 1 by definition.',
        'Other sizes are chosen by the implementation. An int is 4 bytes on the compilers used here, but the standard does not promise that everywhere.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\nint main() {\n  std::cout << sizeof(char) << " " << sizeof(int) << "\\n";\n}',
        output: '1 4',
        explanation:
          'A char is always 1 byte; on this compiler an int is 4 bytes.',
      },
      questions: [
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint main() {\n  std::cout << sizeof(char) * 10 << "\\n";\n}',
          ['10', '80', '1', '40'],
          0,
          'sizeof(char) is 1, so the product is 10.',
        ),
        choose(
          'Which size does the C++ standard guarantee on every implementation?',
          [
            'sizeof(int) is 4',
            'sizeof(long) is 8',
            'sizeof(char) is 1',
            'sizeof(int) equals sizeof(long)',
          ],
          2,
          'Only sizeof(char) == 1 is fixed by the standard; the other sizes vary between platforms.',
        ),
        predictOutput(
          'This compiler uses a 4-byte int. What does this program print?',
          '#include <iostream>\nint main() {\n  std::cout << sizeof(int) * 3 << "\\n";\n}',
          ['3', '12', '96', '24'],
          1,
          'Three 4-byte ints take 12 bytes. sizeof counts bytes, not bits.',
        ),
      ],
    },
    {
      title: 'Apply sizeof to an object',
      explanation: [
        "sizeof can also be applied to an object, and the result depends only on the object's type, never on the value it holds. A large int and a small int occupy the same number of bytes.",
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\nint main() {\n  char initial = \'Z\';\n  int big = 1000000;\n  std::cout << sizeof(initial) << " " << sizeof(big) << "\\n";\n}',
        output: '1 4',
        explanation:
          'initial is a char (1 byte) and big is an int (4 bytes here), whatever values they hold.',
      },
      questions: [
        predictOutput(
          'What does this complete C++20 program print on a compiler with a 4-byte int?',
          '#include <iostream>\nint main() {\n  int tiny = 1;\n  int huge = 2000000000;\n  std::cout << sizeof(tiny) << " " << sizeof(huge) << "\\n";\n}',
          ['1 4', '1 10', '4 8', '4 4'],
          3,
          'Both are ints, so both occupy the same 4 bytes regardless of their values.',
        ),
        choose(
          'What does sizeof(value) report for int value = 123456;?',
          [
            'The number of decimal digits in the value, 6',
            'The value itself, converted to std::size_t',
            'The bytes an int occupies, whatever it holds',
            'The number of bits set in the binary value',
          ],
          2,
          'sizeof depends only on the type of its operand.',
        ),
        predictOutput(
          'What does this program print?',
          "#include <iostream>\nint main() {\n  char a = 'x';\n  char b = 'y';\n  std::cout << sizeof(a) + sizeof(b) << \"\\n\";\n}",
          ['xy', '2', '241', '16'],
          1,
          'Each char is 1 byte, so the sum is 2.',
        ),
      ],
    },
    {
      title: 'Compute byte counts with sizeof',
      explanation: [
        'To find how many bytes several values need, multiply the count by sizeof of the type. Writing sizeof(int) instead of a hard-coded 4 keeps the calculation right on every platform.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\nint main() {\n  int readings = 25;\n  std::cout << readings * sizeof(int) << "\\n";\n}',
        output: '100',
        explanation: '25 ints of 4 bytes each need 100 bytes on this compiler.',
      },
      questions: [
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint main() {\n  int items = 8;\n  std::cout << items * sizeof(char) << "\\n";\n}',
          ['64', '1', '8', '32'],
          2,
          'Each char is 1 byte, so 8 chars need 8 bytes.',
        ),
        choose(
          'A buffer for n ints is sized as n * 4 bytes. What is the risk?',
          [
            'n * 4 overflows for every value of n',
            'sizeof cannot be used when sizing buffers',
            'None, because int is 4 bytes on every platform',
            'Where int is not 4 bytes, the buffer has the wrong size',
          ],
          3,
          'The size of int is implementation-defined; n * sizeof(int) adapts to it.',
        ),
        predictOutput(
          'What does this program print with a 4-byte int?',
          '#include <iostream>\nint main() {\n  int rows = 3;\n  int cols = 5;\n  std::cout << rows * cols * sizeof(int) << "\\n";\n}',
          ['15', '60', '480', '120'],
          1,
          '3 * 5 is 15 ints, and 15 * 4 is 60 bytes.',
        ),
      ],
    },
  ],
  'cpp-fixed-width-integers': [
    {
      title: 'Pick an exact-width type from <cstdint>',
      explanation: [
        '<cstdint> provides integer types with an exact number of bits: std::int8_t, std::int16_t, std::int32_t, and std::int64_t, and the unsigned std::uint8_t through std::uint64_t. Use them when a file format or protocol fixes the size of a field.',
        'An N-bit unsigned type holds 0 through 2 to the N minus 1, so std::uint16_t goes up to 65535.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\n#include <cstdint>\nint main() {\n  std::cout << sizeof(std::int16_t) << " " << sizeof(std::uint64_t) << "\\n";\n}',
        output: '2 8',
        explanation:
          'A 16-bit type is 2 bytes and a 64-bit type is 8 bytes, on every platform that provides them.',
      },
      questions: [
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <cstdint>\nint main() {\n  std::cout << sizeof(std::int32_t) * 8 << "\\n";\n}',
          ['4', '32', '8', '64'],
          1,
          'std::int32_t is 4 bytes, and 4 bytes of 8 bits each are 32 bits.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\n#include <cstdint>\n#include <limits>\nint main() {\n  std::cout << std::numeric_limits<std::uint16_t>::max() << "\\n";\n}',
          ['65536', '32767', '65535', '255'],
          2,
          'Sixteen unsigned bits hold up to 2 to the 16th minus 1, which is 65535.',
        ),
        choose(
          'A file format stores a count in exactly 4 bytes, unsigned. Which type matches it on every platform?',
          ['unsigned int', 'unsigned long', 'std::size_t', 'std::uint32_t'],
          3,
          'Only std::uint32_t is guaranteed to be exactly 32 bits; the others vary by platform.',
        ),
      ],
    },
    {
      title: 'Wrap exact-width unsigned values',
      explanation: [
        'Arithmetic on small types first promotes them to int, so a std::uint8_t sum can exceed 255 as an int. Converting the result back with static_cast<std::uint8_t> wraps it modulo 256, which is how the 8-bit field itself would behave.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\n#include <cstdint>\nint main() {\n  std::uint8_t level = 250;\n  level = static_cast<std::uint8_t>(level + 10);\n  std::cout << static_cast<int>(level) << "\\n";\n}',
        output: '4',
        explanation:
          'level + 10 is the int 260; stored back into 8 bits it wraps to 260 - 256 = 4.',
      },
      questions: [
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <cstdint>\nint main() {\n  std::uint8_t a = 200;\n  std::uint8_t b = 100;\n  std::uint8_t sum = static_cast<std::uint8_t>(a + b);\n  std::cout << static_cast<int>(sum) << "\\n";\n}',
          ['300', '255', '44', '0'],
          2,
          '200 + 100 is 300 as an int, and 300 - 256 leaves 44 when it is stored in 8 bits.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\n#include <cstdint>\nint main() {\n  std::uint8_t a = 200;\n  std::uint8_t b = 100;\n  std::cout << a + b << "\\n";\n}',
          ['300', '44', '255', '0'],
          0,
          'Both operands are promoted to int before adding, and the int sum 300 is printed without being stored back in 8 bits.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\n#include <cstdint>\nint main() {\n  std::uint16_t count = 65535;\n  count = static_cast<std::uint16_t>(count + 1);\n  std::cout << count << "\\n";\n}',
          ['65536', '1', '65535', '0'],
          3,
          'One past the 16-bit maximum wraps to 0 when stored back in std::uint16_t.',
        ),
      ],
    },
    {
      title: 'Print 8-bit values as numbers',
      explanation: [
        'std::uint8_t and std::int8_t are normally aliases for character types, so std::cout prints them as characters. Convert with static_cast<int> to print the number.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\n#include <cstdint>\nint main() {\n  std::uint8_t code = 65;\n  std::cout << code << " " << static_cast<int>(code) << "\\n";\n}',
        output: 'A 65',
        explanation:
          'Printed directly, 65 shows as the character A; converted to int, it shows as 65.',
      },
      questions: [
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <cstdint>\nint main() {\n  std::uint8_t v = 66;\n  std::cout << v << "\\n";\n}',
          ['66', 'B', '0x42', 'b'],
          1,
          'std::uint8_t prints as a character, and code 66 is B.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\n#include <cstdint>\nint main() {\n  std::uint8_t v = 55;\n  std::cout << static_cast<int>(v) + 1 << "\\n";\n}',
          ['8', '7', '56', '551'],
          2,
          'Converted to int, v is 55, and adding 1 gives the int 56.',
        ),
        choose(
          'Why does std::cout << value print a letter when value is a std::uint8_t holding 72?',
          [
            'std::uint8_t is usually unsigned char, so << prints it as a character',
            'std::cout prints every unsigned value as a character',
            '72 is out of range for std::uint8_t',
            'std::uint8_t can store only letters',
          ],
          0,
          'The stream chooses character output for char types, and std::uint8_t is a character type on these platforms.',
        ),
      ],
    },
  ],
  'cpp-type-facts': [
    {
      title: 'Test whether two types are the same',
      explanation: [
        'std::is_same_v<A, B> from <type_traits> is a bool constant that is true exactly when A and B are the same type. Two spellings of one type, such as unsigned and unsigned int, are the same type; two distinct types are different even when they have the same size.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\n#include <type_traits>\nint main() {\n  std::cout << std::is_same_v<int, int> << " " << std::is_same_v<int, long> << "\\n";\n}',
        output: '1 0',
        explanation:
          'int is the same type as itself; int and long are always distinct types.',
      },
      questions: [
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <type_traits>\nint main() {\n  std::cout << std::is_same_v<unsigned, unsigned int> << "\\n";\n}',
          ['0', 'true', '1', 'unsigned'],
          2,
          'unsigned is another spelling of unsigned int, so the trait is true.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\n#include <type_traits>\nint main() {\n  std::cout << std::is_same_v<char, signed char> << std::is_same_v<int, signed int> << "\\n";\n}',
          ['11', '10', '00', '01'],
          3,
          'char and signed char are always three distinct character types, while signed int is just int.',
        ),
        choose(
          'On a platform where int and long are both 4 bytes, what is std::is_same_v<int, long>?',
          [
            'true, because the sizes match',
            'false, because they are distinct types',
            'It depends on the stored values',
            'It does not compile',
          ],
          1,
          'Type identity does not depend on size: int and long stay different types.',
        ),
      ],
    },
    {
      title: 'Query properties of a type',
      explanation: [
        'Other traits answer yes-or-no questions: std::is_integral_v<T> for integer types (including char and bool), std::is_floating_point_v<T> for float and double, and std::is_signed_v<T> and std::is_unsigned_v<T> for signedness.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\n#include <cstdint>\n#include <type_traits>\nint main() {\n  std::cout << std::is_signed_v<std::int8_t> << std::is_unsigned_v<std::uint32_t> << std::is_integral_v<double> << "\\n";\n}',
        output: '110',
        explanation:
          'std::int8_t is signed, std::uint32_t is unsigned, and double is not an integer type.',
      },
      questions: [
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <type_traits>\nint main() {\n  std::cout << std::is_integral_v<char> << " " << std::is_floating_point_v<int> << "\\n";\n}',
          ['0 0', '1 1', '0 1', '1 0'],
          3,
          'char counts as an integer type, and int is not a floating-point type.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\n#include <cstddef>\n#include <type_traits>\nint main() {\n  std::cout << std::is_unsigned_v<std::size_t> << std::is_signed_v<double> << "\\n";\n}',
          ['11', '10', '01', '00'],
          0,
          'std::size_t is an unsigned integer type, and double can hold negative values, so it counts as signed.',
        ),
        choose(
          'Which trait is true for std::int16_t?',
          [
            'std::is_unsigned_v<std::int16_t>',
            'std::is_floating_point_v<std::int16_t>',
            'std::is_signed_v<std::int16_t>',
            'std::is_same_v<std::int16_t, std::uint16_t>',
          ],
          2,
          'std::int16_t is a signed integer type, distinct from its unsigned counterpart.',
        ),
      ],
    },
    {
      title: 'Check a type requirement at compile time',
      explanation: [
        'Traits and sizeof are constants known to the compiler, so they combine with && into a single requirement such as "exactly 2 bytes and unsigned". Stating the requirement this way is more reliable than assuming two types are interchangeable because their sizes match.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\n#include <cstdint>\n#include <type_traits>\nint main() {\n  bool fits_field = sizeof(std::uint16_t) == 2 && std::is_unsigned_v<std::uint16_t>;\n  std::cout << fits_field << "\\n";\n}',
        output: '1',
        explanation:
          'std::uint16_t is exactly 2 bytes and unsigned, so both parts are true.',
      },
      questions: [
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <cstdint>\n#include <type_traits>\nint main() {\n  bool ok = sizeof(std::int16_t) == 2 && std::is_unsigned_v<std::int16_t>;\n  std::cout << ok << "\\n";\n}',
          ['1', '0', '2', 'false'],
          1,
          'The size matches, but std::int16_t is signed, so the combined requirement is false.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\n#include <cstdint>\n#include <type_traits>\nint main() {\n  bool same = std::is_same_v<std::uint8_t, std::int8_t>;\n  bool equal_size = sizeof(std::uint8_t) == sizeof(std::int8_t);\n  std::cout << same << equal_size << "\\n";\n}',
          ['11', '00', '01', '10'],
          2,
          'The types differ in signedness, yet both are 1 byte: equal size does not make types the same.',
        ),
        choose(
          'When are std::is_same_v<A, B> and sizeof(T) worked out?',
          [
            'At compile time, as constants',
            'Each time the line runs',
            'When the program starts',
            'Only in debug builds',
          ],
          0,
          'Both depend only on types, which the compiler knows, so they are compile-time constants.',
        ),
      ],
    },
  ],
  'cpp-bit-shifts': [
    {
      title: 'Shift left to multiply by a power of two',
      explanation: [
        'x << k moves the bits of x left by k places, filling with zeros. For an unsigned value that multiplies by 2 to the power k, as long as no set bit is pushed off the top.',
        'When printing a shift, put it in parentheses: in std::cout << (1u << 3) the inner << is the shift, while without parentheses both << would send values to the stream.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\nint main() {\n  std::cout << (1u << 4) << " " << (3u << 2) << "\\n";\n}',
        output: '16 12',
        explanation:
          '1 shifted left 4 places is 16 (2 to the 4th), and 3 shifted left 2 places is 3 * 4 = 12.',
      },
      questions: [
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint main() {\n  unsigned x = 5u;\n  std::cout << (x << 3) << "\\n";\n}',
          ['15', '40', '5000', '8'],
          1,
          'Shifting left 3 places multiplies by 8, and 5 * 8 is 40.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  std::cout << (1u << 10) << "\\n";\n}',
          ['10', '20', '1024', '10000000000'],
          2,
          '1u << 10 is 2 to the 10th power, 1024; the zeros are binary, not decimal.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  std::cout << 1u << 3u << "\\n";\n}',
          ['8', '13', '1', '3'],
          1,
          'Without parentheses both << are stream insertions, so the program prints 1 and then 3.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  unsigned flags = 1u;\n  flags = flags << 2;\n  flags = flags << 1;\n  std::cout << flags << "\\n";\n}',
          ['3', '6', '4', '8'],
          3,
          'Shifting by 2 and then by 1 is a shift by 3 in total: 1 * 8 is 8.',
        ),
      ],
    },
    {
      title: 'Shift right to divide by a power of two',
      explanation: [
        'x >> k moves the bits right by k places; the k lowest bits fall off. For an unsigned value that equals x / 2 to the power k with the remainder discarded, just like integer division.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\nint main() {\n  std::cout << (40u >> 3) << " " << (13u >> 2) << "\\n";\n}',
        output: '5 3',
        explanation:
          '40 / 8 is 5. 13 / 4 is 3.25, and the shift discards the remainder, leaving 3.',
      },
      questions: [
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint main() {\n  unsigned bytes = 5000u;\n  std::cout << (bytes >> 10) << "\\n";\n}',
          ['4', '5', '4.88', '500'],
          0,
          'Shifting right by 10 divides by 1024: 5000 / 1024 is 4 after discarding the remainder.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  unsigned v = 7u;\n  std::cout << (v >> 1) << " " << (v >> 3) << "\\n";\n}',
          ['3.5 0.875', '3 0', '4 1', '3 1'],
          1,
          '7 / 2 is 3 and 7 / 8 is 0 once the fractions are discarded.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  unsigned v = 13u;\n  std::cout << ((v >> 2) << 2) << "\\n";\n}',
          ['13', '52', '3', '12'],
          3,
          'Shifting right then left clears the two lowest bits: 13 >> 2 is 3, and 3 << 2 is 12.',
        ),
      ],
    },
    {
      title: 'Keep shifts within the width',
      explanation: [
        'An unsigned int has 32 bits on these compilers. Bits shifted past the top are lost, so the result wraps like other unsigned arithmetic. The shift count itself must be smaller than the width: shifting a 32-bit value by 32 or more is undefined behavior, not zero.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\nint main() {\n  unsigned high = 1u << 31;\n  std::cout << high << " " << (high << 1) << "\\n";\n}',
        output: '2147483648 0',
        explanation:
          'Bit 31 is the top bit, worth 2147483648. Shifting it left once more pushes it out, leaving 0.',
      },
      questions: [
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint main() {\n  unsigned v = 3u << 31;\n  std::cout << v << "\\n";\n}',
          ['6442450944', '0', '2147483648', '3'],
          2,
          'Of the two set bits, only the lower one fits at position 31; the other is shifted out.',
        ),
        choose(
          'unsigned is 32 bits. What does unsigned w = 1u << 32; give?',
          [
            '0, because the only set bit is shifted out',
            '1, because the shift count wraps around to 0',
            '4294967296, the next power of two',
            'Undefined behavior, since the count must be below 32',
          ],
          3,
          'A shift count equal to or larger than the number of bits has no defined result.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  unsigned mask = 1u << 31;\n  std::cout << (mask >> 31) << "\\n";\n}',
          ['0', '1', '31', '2147483648'],
          1,
          'The top bit shifted right 31 places lands in bit 0, giving 1.',
        ),
      ],
    },
  ],
  'cpp-bit-masks': [
    {
      title: 'Write masks as hex and binary literals',
      explanation: [
        'A mask is a value whose set bits pick out the bits you care about. Write masks in hexadecimal with 0x, where each digit is 4 bits (0xFF is 255), or in binary with 0b (0b1010 is 10). std::cout still prints them in decimal.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\nint main() {\n  std::cout << 0xFF << " " << 0b1010 << " " << 0x10 << "\\n";\n}',
        output: '255 10 16',
        explanation:
          '0xFF is 15 * 16 + 15, 0b1010 is 8 + 2, and 0x10 is one sixteen.',
      },
      questions: [
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint main() {\n  std::cout << 0x20 << "\\n";\n}',
          ['20', '32', '0x20', '2'],
          1,
          'Hex 20 means 2 sixteens, which is 32 in decimal.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  std::cout << 0b111 << "\\n";\n}',
          ['111', '3', '7', '0b111'],
          2,
          'Binary 111 is 4 + 2 + 1, which prints as 7.',
        ),
        choose(
          'Which literal equals 15?',
          ['0x15', '0b15', '0xF0', '0b1111'],
          3,
          'Binary 1111 is 8 + 4 + 2 + 1. 0x15 is 21, 0xF0 is 240, and 0b15 is not a valid literal.',
        ),
      ],
    },
    {
      title: 'Keep selected bits with &',
      explanation: [
        'x & mask keeps a bit only where both x and mask have it set, so it extracts the masked bits and clears the rest. value & 0xFF keeps the lowest 8 bits, and (x & bit) != 0 tests whether one bit is set.',
        'Do not confuse & with &&: x && y only asks whether both are nonzero and yields a bool.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\nint main() {\n  unsigned value = 0x1234u;\n  std::cout << (value & 0xFFu) << " " << (value & 0xF0u) << "\\n";\n}',
        output: '52 48',
        explanation:
          'value & 0xFF keeps 0x34, which is 52; value & 0xF0 keeps only 0x30, which is 48.',
      },
      questions: [
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint main() {\n  unsigned v = 0b1101u;\n  std::cout << (v & 0b0110u) << "\\n";\n}',
          ['4', '6', '13', '15'],
          0,
          'Only bit 2 (value 4) is set in both 1101 and 0110.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  unsigned v = 300u;\n  std::cout << (v & 0xFFu) << "\\n";\n}',
          ['255', '300', '44', '0'],
          2,
          '300 is 256 + 44, and masking with 0xFF removes the 256 bit, leaving 44.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  unsigned flags = 0b1010u;\n  bool has_bit1 = (flags & 0b0010u) != 0u;\n  std::cout << has_bit1 << "\\n";\n}',
          ['0', '2', '10', '1'],
          3,
          'Bit 1 is set in 1010, so the masked value is 2, which is nonzero.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  unsigned a = 0b0100u;\n  unsigned b = 0b0011u;\n  std::cout << (a & b) << " " << (a && b) << "\\n";\n}',
          ['1 1', '0 1', '0 0', '7 1'],
          1,
          'a and b share no set bits, so a & b is 0; both are nonzero, so a && b is true.',
        ),
      ],
    },
    {
      title: 'Turn bits on with |',
      explanation: [
        'x | mask sets every bit that is set in mask and leaves the others as they were. Setting a bit that is already on changes nothing, unlike adding its value.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\nint main() {\n  unsigned flags = 0b0001u;\n  flags = flags | 0b0100u;\n  std::cout << flags << "\\n";\n}',
        output: '5',
        explanation:
          'Bit 2 is turned on next to bit 0, giving 0b0101, which is 5.',
      },
      questions: [
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint main() {\n  unsigned v = 0b1000u;\n  std::cout << (v | 0b0011u) << "\\n";\n}',
          ['8', '11', '3', '1011'],
          1,
          'The result has bits 3, 1, and 0 set: 8 + 2 + 1 is 11.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  unsigned v = 0b0101u;\n  std::cout << (v | 0b0100u) << "\\n";\n}',
          ['9', '4', '1', '5'],
          3,
          'Bit 2 is already set, so OR-ing it in again leaves 5 unchanged.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  unsigned high = 0x12u;\n  unsigned low = 0x34u;\n  std::cout << ((high * 256u) | low) << "\\n";\n}',
          ['70', '4608', '4660', '52'],
          2,
          'high * 256 is 0x1200, and OR-ing in 0x34 gives 0x1234, which is 4660.',
        ),
        choose(
          'Which expression sets bit 3 of x without changing any other bit?',
          ['x & 0b1000u', 'x | 0b1000u', 'x || 0b1000u', 'x + 0b1000u'],
          1,
          '| sets the bit whether or not it was already on; + would carry into higher bits if it was set.',
        ),
      ],
    },
  ],
  'cpp-bit-flags': [
    {
      title: 'Build a single-bit flag with 1u << k',
      explanation: [
        '1u << k is a value with only bit k set, so it serves as a named flag for one option. Several flags combine with |, and (x & flag) != 0 tests one of them.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\nint main() {\n  unsigned bold = 1u << 0;\n  unsigned underline = 1u << 3;\n  std::cout << (bold | underline) << "\\n";\n}',
        output: '9',
        explanation:
          'The flags are 1 and 8, and combining them with | gives 9.',
      },
      questions: [
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint main() {\n  unsigned bit5 = 1u << 5;\n  std::cout << bit5 << "\\n";\n}',
          ['5', '10', '32', '16'],
          2,
          'Only bit 5 is set, which is worth 2 to the 5th, 32.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  unsigned flags = (1u << 0) | (1u << 2);\n  std::cout << flags << "\\n";\n}',
          ['5', '3', '2', '4'],
          0,
          'Bits 0 and 2 are worth 1 and 4, so the combined flags are 5.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  unsigned flags = 0b1010u;\n  std::cout << ((flags & (1u << 1)) != 0u) << ((flags & (1u << 2)) != 0u) << "\\n";\n}',
          ['01', '11', '20', '10'],
          3,
          'In 1010, bit 1 is set and bit 2 is clear.',
        ),
      ],
    },
    {
      title: 'Toggle bits with ^',
      explanation: [
        'x ^ mask flips every bit that is set in mask: on bits turn off and off bits turn on. Toggling the same flag twice restores the original value. x ^= mask is the compound form.',
        'In C++ ^ is exclusive or, not a power operator: 2 ^ 3 is 1.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\nint main() {\n  unsigned flags = 0b0110u;\n  flags = flags ^ 0b0011u;\n  std::cout << flags << "\\n";\n}',
        output: '5',
        explanation:
          'Bit 1 was on and turns off; bit 0 was off and turns on. 0110 becomes 0101, which is 5.',
      },
      questions: [
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint main() {\n  std::cout << (2 ^ 3) << "\\n";\n}',
          ['8', '5', '1', '6'],
          2,
          '^ is exclusive or: 10 ^ 11 is 01 in binary, so the result is 1, not 2 cubed.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  unsigned v = 0b1100u;\n  v = v ^ (1u << 2);\n  std::cout << v << "\\n";\n}',
          ['8', '12', '16', '4'],
          0,
          'Bit 2 was set, so toggling it turns it off: 1100 becomes 1000, which is 8.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  unsigned v = 9u;\n  v ^= 4u;\n  v ^= 4u;\n  std::cout << v << "\\n";\n}',
          ['13', '1', '17', '9'],
          3,
          'Toggling the same bit twice undoes the first toggle, so v is 9 again.',
        ),
      ],
    },
    {
      title: 'Clear bits with & ~',
      explanation: [
        '~mask flips every bit of the mask, so x & ~mask keeps everything except the masked bits. That is how to clear a flag: x & ~(1u << k). Writing x & flag instead keeps only that flag.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\nint main() {\n  unsigned flags = 0b1111u;\n  flags = flags & ~(1u << 1);\n  std::cout << flags << "\\n";\n}',
        output: '13',
        explanation: 'Clearing bit 1 turns 1111 into 1101, which is 13.',
      },
      questions: [
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint main() {\n  unsigned v = 0b0111u;\n  std::cout << (v & ~0b0100u) << "\\n";\n}',
          ['3', '4', '7', '11'],
          0,
          'Bit 2 is cleared, so 0111 becomes 0011, which is 3.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  unsigned v = 0b1010u;\n  std::cout << (v & ~(1u << 0)) << "\\n";\n}',
          ['11', '8', '10', '0'],
          2,
          'Bit 0 is already clear, so clearing it again leaves 10 unchanged.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  unsigned v = 0b1010u;\n  std::cout << (v & (1u << 3)) << "\\n";\n}',
          ['2', '10', '0', '8'],
          3,
          'Without ~, the mask keeps only bit 3, so the result is 8 rather than v with bit 3 cleared.',
        ),
        choose(
          'Which expression clears bit k of x and leaves the other bits alone?',
          [
            'x & (1u << k)',
            'x ^ (1u << k)',
            'x & ~(1u << k)',
            'x | ~(1u << k)',
          ],
          2,
          '~ makes a mask with every bit set except bit k; & with it clears just that bit. ^ would set bit k if it was clear.',
        ),
      ],
    },
  ],
  'cpp-bits': [
    {
      title: 'Shift the wanted byte to the bottom',
      explanation: [
        'Number the bytes of a word from the least significant: byte 0 is bits 0 to 7, byte 1 is bits 8 to 15, and byte i starts at bit 8 * i. Shifting right by 8 * i moves byte i into the lowest position.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\n#include <cstdint>\nint main() {\n  std::uint32_t word = 0x1234u;\n  std::cout << (word >> 8) << "\\n";\n}',
        output: '18',
        explanation:
          'Shifting right 8 places drops byte 0 (0x34) and leaves 0x12, which is 18.',
      },
      questions: [
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <cstdint>\nint main() {\n  std::uint32_t word = 0xAB00u;\n  std::cout << (word >> 8) << "\\n";\n}',
          ['43776', '171', '11', '0'],
          1,
          'Byte 1 is 0xAB, and shifting it down gives 171.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\n#include <cstdint>\nint main() {\n  std::uint32_t w = 0x05000000u;\n  std::cout << (w >> 24) << "\\n";\n}',
          ['0', '24', '83886080', '5'],
          3,
          'The top byte is 0x05, and shifting right 24 places brings it to the bottom.',
        ),
        choose(
          'Counting from the least significant byte, at which bit does byte 2 of a 32-bit word start?',
          ['8', '24', '16', '2'],
          2,
          'Byte i starts at bit 8 * i, so byte 2 starts at bit 16.',
        ),
      ],
    },
    {
      title: 'Mask after shifting',
      explanation: [
        'After the shift, the higher bytes are still there above the wanted one. Masking with 0xFF keeps only the lowest 8 bits. The order matters: shift first, then mask; masking first would throw away the byte you wanted.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\n#include <cstdint>\nint main() {\n  std::uint32_t word = 0x123456u;\n  std::cout << ((word >> 8) & 0xFFu) << "\\n";\n}',
        output: '52',
        explanation: 'word >> 8 is 0x1234; masking keeps 0x34, which is 52.',
      },
      questions: [
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <cstdint>\nint main() {\n  std::uint32_t word = 0x123456u;\n  std::cout << (word >> 8) << "\\n";\n}',
          ['52', '18', '86', '4660'],
          3,
          'Without a mask, byte 2 is still present above byte 1: the result is 0x1234, 4660.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\n#include <cstdint>\nint main() {\n  std::uint32_t word = 0x123456u;\n  std::cout << ((word & 0xFFu) >> 8) << "\\n";\n}',
          ['52', '0', '86', '18'],
          1,
          'Masking first keeps only 0x56, and shifting that right 8 places leaves 0.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\n#include <cstdint>\nint main() {\n  std::uint32_t word = 0x0000FF01u;\n  std::cout << ((word >> 8) & 0xFFu) << " " << (word & 0xFFu) << "\\n";\n}',
          ['255 1', '1 255', '65281 1', '255 0'],
          0,
          'Byte 1 is 0xFF (255) and byte 0 is 0x01 (1).',
        ),
      ],
    },
    {
      title: 'Store the byte in std::uint8_t',
      explanation: [
        'A single byte fits in std::uint8_t. Convert the masked value with static_cast<std::uint8_t>, and convert it to int again when printing it as a number, because std::uint8_t prints as a character.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\n#include <cstdint>\nint main() {\n  std::uint32_t word = 0x11223344u;\n  std::uint8_t b1 = static_cast<std::uint8_t>((word >> 8) & 0xFFu);\n  std::cout << static_cast<int>(b1) << "\\n";\n}',
        output: '51',
        explanation: 'Byte 1 of 0x11223344 is 0x33, which is 51.',
      },
      questions: [
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <cstdint>\nint main() {\n  std::uint32_t word = 0x11223344u;\n  std::uint8_t top = static_cast<std::uint8_t>((word >> 24) & 0xFFu);\n  std::cout << static_cast<int>(top) << "\\n";\n}',
          ['68', '17', '11', '287454020'],
          1,
          'The top byte is 0x11, which is 17.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\n#include <cstdint>\nint main() {\n  std::uint32_t word = 0x4142u;\n  std::uint8_t high = static_cast<std::uint8_t>((word >> 8) & 0xFFu);\n  std::cout << high << "\\n";\n}',
          ['65', '41', 'A', 'B'],
          2,
          'Byte 1 is 0x41, which is 65, and a std::uint8_t prints as the character with that code: A.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\n#include <cstdint>\nint main() {\n  std::uint32_t word = 0x01020304u;\n  int sum = static_cast<int>(word & 0xFFu) + static_cast<int>((word >> 24) & 0xFFu);\n  std::cout << sum << "\\n";\n}',
          ['10', '7', '4', '5'],
          3,
          'Byte 0 is 4 and byte 3 is 1, so the sum is 5.',
        ),
      ],
    },
  ],
  'cpp-if-branches': [
    {
      title: 'Run a statement only when a condition holds',
      explanation: [
        'if (condition) statement; runs the statement only when the condition is true. Either way, execution then continues with the next statement after the if.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\nint main() {\n  int temperature = 31;\n  if (temperature > 30) std::cout << "hot\\n";\n  std::cout << "done\\n";\n}',
        output: 'hot\ndone',
        explanation:
          '31 > 30 is true, so hot is printed; done is printed in every case.',
      },
      questions: [
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint main() {\n  int stock = 0;\n  if (stock == 0) std::cout << "reorder\\n";\n  std::cout << "checked\\n";\n}',
          ['checked', 'reorder\nchecked', 'reorder', 'checked\nreorder'],
          1,
          'The condition is true, so reorder prints first, followed by the unconditional checked.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  int x = 4;\n  if (x > 10) std::cout << "big\\n";\n  std::cout << x << "\\n";\n}',
          ['big\n4', 'big', '4', '10'],
          2,
          '4 > 10 is false, so only the statement after the if runs.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  int points = 5;\n  if (points >= 5) points = points * 2;\n  std::cout << points << "\\n";\n}',
          ['5', '25', '7', '10'],
          3,
          '5 >= 5 is true, so points is doubled before it is printed.',
        ),
      ],
    },
    {
      title: 'Choose between two branches with else',
      explanation: [
        'if (condition) A else B runs exactly one of A and B. To run several statements in a branch, group them in braces { }.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\nint main() {\n  int balance = -20;\n  if (balance < 0) std::cout << "overdrawn\\n";\n  else std::cout << "ok\\n";\n}',
        output: 'overdrawn',
        explanation:
          'The condition is true, so the first branch runs and the else branch is skipped.',
      },
      questions: [
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint main() {\n  int n = 7;\n  if (n == 7) std::cout << "lucky\\n";\n  else std::cout << "plain\\n";\n}',
          ['plain', 'lucky\nplain', 'lucky', '7'],
          2,
          'n == 7 is true, so only the first branch runs.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  int a = 3;\n  int b = 3;\n  if (a > b) std::cout << a << "\\n";\n  else std::cout << b + 1 << "\\n";\n}',
          ['4', '3', '6', '3\n4'],
          0,
          'a > b is false when they are equal, so the else branch prints b + 1.',
        ),
        choose(
          'How many of the two branches of an if/else statement run each time it executes?',
          [
            'Both, when the condition is true',
            'Neither, when the condition is false',
            'Both, one after the other',
            'Exactly one',
          ],
          3,
          'The condition selects one branch; the other is skipped.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  int total = 0;\n  int qty = 3;\n  if (qty > 2) {\n    total = qty * 10;\n    std::cout << "bulk ";\n  } else {\n    total = qty * 12;\n  }\n  std::cout << total << "\\n";\n}',
          ['36', 'bulk 36', 'bulk 30', '30'],
          2,
          'qty > 2 is true, so both statements in the first block run: bulk is printed and total becomes 30.',
        ),
      ],
    },
    {
      title: 'Test several cases with else if',
      explanation: [
        'A chain of if / else if / else tests its conditions from top to bottom and runs the branch of the first one that is true; the rest are skipped. So the order of the tests matters.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\nint main() {\n  int value = -5;\n  if (value < 0) std::cout << -1 << "\\n";\n  else if (value > 0) std::cout << 1 << "\\n";\n  else std::cout << 0 << "\\n";\n}',
        output: '-1',
        explanation:
          'The first test is already true, so -1 is printed and the other branches are skipped.',
      },
      questions: [
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint main() {\n  int score = 85;\n  if (score >= 90) std::cout << "A\\n";\n  else if (score >= 80) std::cout << "B\\n";\n  else std::cout << "C\\n";\n}',
          ['A', 'B', 'C', 'B\nC'],
          1,
          '85 fails the first test and passes the second, so B is printed and the chain stops.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  int score = 95;\n  if (score >= 80) std::cout << "B\\n";\n  else if (score >= 90) std::cout << "A\\n";\n  else std::cout << "C\\n";\n}',
          ['A', 'A\nB', 'B', 'C'],
          2,
          'The first true test wins: 95 >= 80 is checked first, so B is printed even though 95 >= 90.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  int t = 15;\n  if (t < 0) std::cout << "ice\\n";\n  else if (t < 20) std::cout << "cool\\n";\n  else if (t < 10) std::cout << "cold\\n";\n  else std::cout << "warm\\n";\n}',
          ['cool', 'cold', 'warm', 'cool\ncold'],
          0,
          't < 20 is the first true test, so cool is printed and no later test runs.',
        ),
        choose(
          'In this chain, which value of n prints middle?\nif (n < 10) low; else if (n < 20) middle; else high;',
          ['5', '20', '25', '10'],
          3,
          '10 fails n < 10 and passes n < 20. 5 is low, and 20 and 25 are high.',
        ),
      ],
    },
  ],
  'cpp-logical-operators': [
    {
      title: 'Require both conditions with &&',
      explanation: [
        'a && b is true only when a and b are both true. Use it to require several conditions at once, such as a lower and an upper limit.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\nint main() {\n  int age = 25;\n  bool member = true;\n  std::cout << (age >= 18 && member) << "\\n";\n}',
        output: '1',
        explanation:
          'Both age >= 18 and member are true, so the result is true and prints 1.',
      },
      questions: [
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint main() {\n  int hour = 20;\n  std::cout << (hour >= 9 && hour < 17) << "\\n";\n}',
          ['1', '0', '20', 'false'],
          1,
          'hour >= 9 is true but hour < 17 is false, so && gives false, printed as 0.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  int a = 5;\n  int b = 5;\n  std::cout << (a == b && a > 0) << (a == b && b > 9) << "\\n";\n}',
          ['11', '01', '10', '00'],
          2,
          'Both parts of the first test are true; the second test fails because b > 9 is false.',
        ),
        choose(
          'When is a && b true?',
          [
            'When at least one of them is true',
            'When exactly one of them is true',
            'When a is true, whatever b is',
            'Only when both of them are true',
          ],
          3,
          '&& requires both operands to be true.',
        ),
      ],
    },
    {
      title: 'Accept either condition with ||',
      explanation: [
        'a || b is true when at least one operand is true, including when both are. It is false only when both are false.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\nint main() {\n  int day = 6;\n  std::cout << (day == 6 || day == 7) << "\\n";\n}',
        output: '1',
        explanation: 'day == 6 is true, which is enough for || to be true.',
      },
      questions: [
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint main() {\n  int code = 404;\n  std::cout << (code == 200 || code == 204) << "\\n";\n}',
          ['0', '1', '404', '2'],
          0,
          'Neither comparison is true, so || is false.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  bool rain = true;\n  bool snow = true;\n  std::cout << (rain || snow) << "\\n";\n}',
          ['0', '2', '1', 'true'],
          2,
          '|| is true when at least one operand is true, and that includes both being true.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  int x = -3;\n  std::cout << (x < 0 || x > 100) << (x > 0 || x == -3) << "\\n";\n}',
          ['10', '01', '00', '11'],
          3,
          'x < 0 makes the first test true, and x == -3 makes the second true.',
        ),
      ],
    },
    {
      title: 'Invert with ! and group with parentheses',
      explanation: [
        '!a is true when a is false. When && and || are mixed, && is applied first, so a || b && c means a || (b && c). Add parentheses whenever a different grouping is meant, and to make the intended one obvious.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\nint main() {\n  bool open = false;\n  int guests = 3;\n  std::cout << !open << " " << (!open || guests > 5) << "\\n";\n}',
        output: '1 1',
        explanation:
          'open is false, so !open is true; that alone makes the || expression true.',
      },
      questions: [
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint main() {\n  bool a = true;\n  bool b = false;\n  bool c = false;\n  std::cout << (a || b && c) << " " << ((a || b) && c) << "\\n";\n}',
          ['1 0', '0 0', '0 1', '1 1'],
          0,
          'The first groups as a || (b && c), which is true; the second requires c, which is false.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  int n = 4;\n  std::cout << !(n > 2) << "\\n";\n}',
          ['1', '-4', '0', '4'],
          2,
          'n > 2 is true, and ! inverts it to false, printed as 0.',
        ),
        choose(
          'How does C++ group the expression a || b && c?',
          [
            '(a || b) && c',
            'a || (b && c)',
            'Strictly left to right',
            'It needs parentheses to compile',
          ],
          1,
          '&& binds more tightly than ||, so b && c is grouped first.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  bool done = false;\n  bool failed = true;\n  std::cout << (!done && !failed) << "\\n";\n}',
          ['10', '1', '01', '0'],
          3,
          '!done is true but !failed is false, so && gives false.',
        ),
      ],
    },
  ],
  'cpp-conditional-operator': [
    {
      title: 'Choose one of two values with ?:',
      explanation: [
        'condition ? a : b is an expression: its value is a when the condition is true and b otherwise. It fits wherever a value is needed, such as an initializer.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\nint main() {\n  int a = 3;\n  int b = 9;\n  int larger = a > b ? a : b;\n  std::cout << larger << "\\n";\n}',
        output: '9',
        explanation:
          'a > b is false, so the expression takes the value after the colon, b.',
      },
      questions: [
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint main() {\n  int stock = 0;\n  int shown = stock > 0 ? stock : -1;\n  std::cout << shown << "\\n";\n}',
          ['0', '-1', '1', '-0'],
          1,
          'stock > 0 is false, so shown takes the second value, -1.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  int score = 75;\n  std::cout << (score >= 60 ? 1 : 0) << "\\n";\n}',
          ['75', '0', '60', '1'],
          3,
          '75 >= 60 is true, so the expression is 1.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  int x = -4;\n  int magnitude = x < 0 ? -x : x;\n  std::cout << magnitude << "\\n";\n}',
          ['-4', '16', '4', '0'],
          2,
          'x is negative, so the expression takes -x, which is 4.',
        ),
      ],
    },
    {
      title: 'Only the chosen operand is evaluated',
      explanation: [
        'The condition is evaluated first, and then only the selected operand is evaluated. Any effect in the other operand, such as an increment, does not happen.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\nint main() {\n  int count = 0;\n  int value = 5;\n  int r = value > 0 ? 10 : ++count;\n  std::cout << r << " " << count << "\\n";\n}',
        output: '10 0',
        explanation:
          'The condition is true, so ++count never runs and count stays 0.',
      },
      questions: [
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint main() {\n  int calls = 0;\n  int x = 2;\n  int y = x > 5 ? ++calls : calls + 100;\n  std::cout << y << " " << calls << "\\n";\n}',
          ['100 1', '1 1', '100 0', '101 1'],
          2,
          'x > 5 is false, so only calls + 100 is evaluated; the increment never happens.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  int a = 0;\n  int b = 0;\n  int pick = 1;\n  int r = pick == 1 ? ++a : ++b;\n  std::cout << a << b << r << "\\n";\n}',
          ['111', '101', '011', '100'],
          1,
          'Only ++a runs, so a and r are 1 while b stays 0.',
        ),
        choose(
          'Which statement about c ? x : y is true?',
          [
            'x and y are both evaluated, then one is chosen',
            'x is always evaluated, and y only when c is false',
            'Only the operand selected by c is evaluated',
            'y is evaluated before c',
          ],
          2,
          'C++ evaluates the condition and then exactly one of the two operands.',
        ),
      ],
    },
    {
      title: 'Parenthesize ?: inside larger expressions',
      explanation: [
        '?: has very low precedence, lower than + and <<. In base + vip ? 5 : 0 the condition is the whole base + vip. Wrap the conditional in parentheses when it is part of a bigger expression or printed with <<.',
        'The two result operands must have compatible types, such as two ints; an int and a string literal do not compile.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\nint main() {\n  int base = 10;\n  int bonus = 1;\n  std::cout << base + (bonus > 0 ? 5 : 0) << "\\n";\n}',
        output: '15',
        explanation:
          'The parentheses make the conditional a single operand of +, so 10 + 5 is printed.',
      },
      questions: [
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint main() {\n  int base = 10;\n  bool vip = false;\n  int total = base + vip ? 5 : 0;\n  std::cout << total << "\\n";\n}',
          ['10', '15', '5', '0'],
          2,
          'Without parentheses the condition is base + vip, which is 10 and therefore true, so total is 5.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  int n = 3;\n  int m = 2 * (n > 2 ? n : 2);\n  std::cout << m << "\\n";\n}',
          ['6', '4', '3', '2'],
          0,
          'n > 2 is true, so the parenthesized conditional is 3, and 2 * 3 is 6.',
        ),
        choose(
          'What is wrong with int r = flag ? 42 : "none";?',
          [
            'It always yields 42',
            'The two results have unrelated types, so it does not compile',
            'It yields the text none converted to an int',
            'Nothing; ?: accepts any two types',
          ],
          1,
          'The operands must convert to a common type, and an int and a string literal do not.',
        ),
      ],
    },
  ],
  'cpp-for-bounds': [
    {
      title: 'Count with a for loop',
      explanation: [
        'for (int i = 0; i < 3; ++i) body sets i to 0, checks i < 3 before each pass, runs the body, and then increments i. It stops as soon as the check is false.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\nint main() {\n  for (int i = 0; i < 3; ++i) std::cout << i;\n  std::cout << "\\n";\n}',
        output: '012',
        explanation:
          'The body runs for i = 0, 1, and 2; when i reaches 3 the check fails.',
      },
      questions: [
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint main() {\n  for (int i = 1; i <= 4; ++i) std::cout << i;\n  std::cout << "\\n";\n}',
          ['123', '1234', '01234', '234'],
          1,
          'i starts at 1 and the body runs while i <= 4, so 1 through 4 are printed.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  int total = 0;\n  for (int i = 0; i < 5; ++i) total += i;\n  std::cout << total << "\\n";\n}',
          ['15', '5', '10', '4'],
          2,
          'The loop adds 0 + 1 + 2 + 3 + 4, which is 10; 5 itself is never added.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  for (int i = 10; i > 7; --i) std::cout << i << ",";\n  std::cout << "\\n";\n}',
          ['10,9,8,', '10,9,8,7,', '9,8,7,', '10,9,'],
          0,
          'i counts down from 10 while i > 7, so 10, 9, and 8 are printed.',
        ),
      ],
    },
    {
      title: 'Use half-open bounds',
      explanation: [
        'A loop from start while i < end runs end - start times and never touches end itself. That matches positions 0 through size - 1 of a sequence with size elements. Writing <= runs one extra time.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\nint main() {\n  int half_open = 0;\n  for (int i = 0; i < 4; ++i) ++half_open;\n  int closed = 0;\n  for (int i = 0; i <= 4; ++i) ++closed;\n  std::cout << half_open << " " << closed << "\\n";\n}',
        output: '4 5',
        explanation:
          'i < 4 visits 0 through 3, four values; i <= 4 also visits 4, five values.',
      },
      questions: [
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint main() {\n  int n = 0;\n  for (int i = 3; i < 8; ++i) ++n;\n  std::cout << n << "\\n";\n}',
          ['5', '6', '8', '4'],
          0,
          'The loop visits 3, 4, 5, 6, and 7: end - start is 8 - 3 = 5.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  int n = 0;\n  for (int i = 2; i <= 6; ++i) ++n;\n  std::cout << n << "\\n";\n}',
          ['4', '6', '5', '7'],
          2,
          'With <= the end value is included: 2, 3, 4, 5, and 6 make five passes.',
        ),
        choose(
          'A sequence has size elements at positions 0 through size - 1. Which loop visits exactly those positions?',
          [
            'for (int i = 0; i <= size; ++i)',
            'for (int i = 1; i <= size; ++i)',
            'for (int i = 1; i < size; ++i)',
            'for (int i = 0; i < size; ++i)',
          ],
          3,
          'Starting at 0 and stopping before size covers every valid position and never size itself.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  int last = -1;\n  for (int i = 0; i < 6; ++i) last = i;\n  std::cout << last << "\\n";\n}',
          ['6', '5', '0', '-1'],
          1,
          'The last pass has i = 5; i = 6 fails the check before the body runs.',
        ),
      ],
    },
    {
      title: 'Predict loops that run zero times',
      explanation: [
        'The condition is checked before the first pass too. If it is already false, the body never runs. The update does not have to be ++i; i += 2 steps by two.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\nint main() {\n  int runs = 0;\n  for (int i = 5; i < 5; ++i) ++runs;\n  std::cout << runs << "\\n";\n}',
        output: '0',
        explanation: '5 < 5 is false from the start, so the body never runs.',
      },
      questions: [
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint main() {\n  int total = 100;\n  for (int i = 0; i < 0; ++i) total = 0;\n  std::cout << total << "\\n";\n}',
          ['0', '100', '1', '99'],
          1,
          '0 < 0 is false, so the assignment never runs and total keeps 100.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  int n = 0;\n  for (int i = 10; i < 3; ++i) ++n;\n  std::cout << n << "\\n";\n}',
          ['7', '-7', '0', '3'],
          2,
          'The loop would need i < 3, but i starts at 10, so it never runs.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  int sum = 0;\n  for (int i = 1; i < 6; i += 2) sum += i;\n  std::cout << sum << "\\n";\n}',
          ['15', '6', '4', '9'],
          3,
          'i takes the values 1, 3, and 5, and their sum is 9.',
        ),
      ],
    },
  ],
  'cpp-while-progress': [
    {
      title: 'Repeat while a condition holds',
      explanation: [
        'while (condition) body checks the condition, runs the body if it is true, and repeats. It suits loops where the number of passes is not known in advance.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\nint main() {\n  int n = 1;\n  while (n < 50) n = n * 3;\n  std::cout << n << "\\n";\n}',
        output: '81',
        explanation:
          'n goes 1, 3, 9, 27, 81. At 81 the check n < 50 fails and the loop ends.',
      },
      questions: [
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint main() {\n  int n = 20;\n  int steps = 0;\n  while (n > 0) {\n    n -= 6;\n    ++steps;\n  }\n  std::cout << steps << " " << n << "\\n";\n}',
          ['3 2', '4 -4', '4 2', '3 -4'],
          1,
          'n goes 20, 14, 8, 2, -4. Four passes run, and the loop stops once n is no longer positive.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  int value = 1000;\n  int halvings = 0;\n  while (value >= 100) {\n    value /= 2;\n    ++halvings;\n  }\n  std::cout << halvings << "\\n";\n}',
          ['3', '5', '10', '4'],
          3,
          'value goes 1000, 500, 250, 125, 62, so four halvings run.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  int n = 45;\n  int sum = 0;\n  while (n > 0) {\n    sum += n % 10;\n    n /= 10;\n  }\n  std::cout << sum << "\\n";\n}',
          ['45', '54', '9', '5'],
          2,
          'Each pass adds the last digit and removes it: 5 + 4 is 9.',
        ),
      ],
    },
    {
      title: 'Expect zero passes when the condition starts false',
      explanation: [
        'Because the condition is checked before every pass, including the first, a while loop whose condition is already false runs its body zero times.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\nint main() {\n  int count = 0;\n  int n = 1;\n  while (n > 1) {\n    n /= 2;\n    ++count;\n  }\n  std::cout << count << "\\n";\n}',
        output: '0',
        explanation:
          '1 > 1 is false, so the body never runs and count stays 0.',
      },
      questions: [
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint main() {\n  int x = 2;\n  while (x < 2) x = x * 10;\n  std::cout << x << "\\n";\n}',
          ['20', '2', '200', '0'],
          1,
          '2 < 2 is false at the start, so x is never multiplied.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  int digits = 0;\n  int n = 0;\n  while (n != 0) {\n    n /= 10;\n    ++digits;\n  }\n  std::cout << digits << "\\n";\n}',
          ['1', '10', '-1', '0'],
          3,
          'n is 0, so n != 0 is false immediately and the loop counts nothing.',
        ),
        choose(
          'How many times can the body of a while loop run?',
          [
            'At least once',
            'Exactly once per variable in the condition',
            'Zero or more times',
            'A count fixed before the loop starts',
          ],
          2,
          'If the condition is false at the first check, the body does not run at all.',
        ),
      ],
    },
    {
      title: 'Make progress on every pass',
      explanation: [
        'Each pass must change something the condition depends on, moving it toward false. If nothing changes, the condition stays true and the loop never ends.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\nint main() {\n  int remaining = 17;\n  int trips = 0;\n  while (remaining > 0) {\n    remaining -= 5;\n    ++trips;\n  }\n  std::cout << trips << "\\n";\n}',
        output: '4',
        explanation:
          'Every trip lowers remaining by 5: 17, 12, 7, 2, -3. After four trips the condition is false.',
      },
      questions: [
        choose(
          'What is wrong with this loop?',
          [
            'It never changes n, so it never stops',
            'It runs zero times',
            'It prints 10 once and stops',
            'n > 0 is not a valid condition',
          ],
          0,
          'n stays 10 forever, so n > 0 is always true and the loop never ends.',
          '#include <iostream>\nint main() {\n  int n = 10;\n  while (n > 0) {\n    std::cout << n << "\\n";\n  }\n}',
        ),
        choose(
          'Which statement in the body makes while (n != 0) { ...; } stop for every positive n?',
          ['n += 1;', 'n *= 10;', 'n /= 10;', 'n = n;'],
          2,
          'Dividing by 10 removes a digit each pass and reaches 0; the others never reach 0.',
        ),
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint main() {\n  int n = 1234;\n  int digits = 0;\n  while (n != 0) {\n    n /= 10;\n    ++digits;\n  }\n  std::cout << digits << "\\n";\n}',
          ['3', '4', '1234', '10'],
          1,
          'Four divisions by 10 bring 1234 down to 0, one per digit.',
        ),
      ],
    },
  ],
  'cpp-return-values': [
    {
      title: 'Define and call a function that returns a value',
      explanation: [
        'int twice(int x) { return x * 2; } defines a function that takes an int and gives back an int. A call such as twice(6) runs the body with x set to 6, and the call expression takes the returned value.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\nint twice(int x) {\n  return x * 2;\n}\nint main() {\n  std::cout << twice(6) << "\\n";\n}',
        output: '12',
        explanation:
          'twice(6) runs the body with x = 6 and returns 12, which main prints.',
      },
      questions: [
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint square(int n) {\n  return n * n;\n}\nint main() {\n  std::cout << square(5) + 1 << "\\n";\n}',
          ['36', '26', '25', '11'],
          1,
          'square(5) is 25, and adding 1 gives 26.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\nint area(int width, int height) {\n  return width * height;\n}\nint main() {\n  std::cout << area(3, 4) << " " << area(4, 3) << "\\n";\n}',
          ['7 7', '34 43', '12 12', '12 0'],
          2,
          'Arguments are matched to parameters in order, and both products are 12.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\nint next(int n) {\n  return n + 1;\n}\nint main() {\n  std::cout << next(next(next(0))) << "\\n";\n}',
          ['1', '0', '2', '3'],
          3,
          'The innermost call runs first: 0 becomes 1, then 2, then 3.',
        ),
      ],
    },
    {
      title: 'Parameters are copies',
      explanation: [
        "A parameter declared as int receives a copy of the caller's value. Assigning to the parameter changes only the copy; the caller sees a result only through the returned value.",
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\nint bump(int value) {\n  value = value + 10;\n  return value;\n}\nint main() {\n  int x = 5;\n  int y = bump(x);\n  std::cout << x << " " << y << "\\n";\n}',
        output: '5 15',
        explanation:
          'bump changed its own copy to 15 and returned it; x in main is still 5.',
      },
      questions: [
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint reset(int n) {\n  n = 0;\n  return n;\n}\nint main() {\n  int count = 7;\n  reset(count);\n  std::cout << count << "\\n";\n}',
          ['0', '7', '70', '-7'],
          1,
          'reset changed only its copy, and its returned 0 was not stored, so count is still 7.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\nint triple(int n) {\n  n *= 3;\n  return n;\n}\nint main() {\n  int a = 2;\n  int b = triple(a);\n  std::cout << a + b << "\\n";\n}',
          ['12', '6', '8', '4'],
          2,
          'a stays 2 and b receives 6, so the sum is 8.',
        ),
        choose(
          "A function receives int count by value and assigns count = 0. What happens to the caller's variable?",
          [
            'It becomes 0 as well',
            'It becomes indeterminate',
            'It is unchanged',
            'It changes only if count is returned',
          ],
          2,
          "The parameter is a separate copy; the caller's variable is never touched.",
        ),
      ],
    },
    {
      title: 'Use the returned value',
      explanation: [
        'A call is an expression whose value can be stored, printed, or combined with others. return ends the function immediately, and a result that the caller does not use is simply discarded.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\nint score(int hits, int misses) {\n  return hits * 3 - misses;\n}\nint main() {\n  int total = score(4, 2) + score(1, 0);\n  std::cout << total << "\\n";\n}',
        output: '13',
        explanation:
          'score(4, 2) is 10 and score(1, 0) is 3, and the two results add to 13.',
      },
      questions: [
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint span(int start, int end) {\n  return end - start;\n}\nint main() {\n  std::cout << span(3, 10) * 2 << "\\n";\n}',
          ['14', '7', '26', '-14'],
          0,
          'span(3, 10) is 7, and the call can be used in the larger expression 7 * 2.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\nint first(int a, int b) {\n  return a;\n  return b;\n}\nint main() {\n  std::cout << first(1, 2) << "\\n";\n}',
          ['2', '12', '1', '3'],
          2,
          'The first return ends the function, so the second never runs.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\nint doubled(int n) {\n  return n * 2;\n}\nint main() {\n  int x = 4;\n  doubled(x);\n  std::cout << x << "\\n";\n}',
          ['8', '0', '16', '4'],
          3,
          'The returned 8 is discarded, and x was passed by value, so x is still 4.',
        ),
      ],
    },
  ],
  'cpp-functions': [
    {
      title: 'Read a struct through a const reference',
      explanation: [
        "A parameter declared const Order& order refers to the caller's object instead of copying it, and const promises that the function only reads it. This is the usual way to pass a struct or other larger object that a function only inspects.",
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\nstruct Order {\n  int price;\n  int quantity;\n};\nint cost(const Order& order) {\n  return order.price * order.quantity;\n}\nint main() {\n  Order order{12, 3};\n  std::cout << cost(order) << "\\n";\n}',
        output: '36',
        explanation:
          'cost reads the members through the reference: 12 * 3 is 36.',
      },
      questions: [
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nstruct Box {\n  int w;\n  int h;\n  int d;\n};\nint volume(const Box& box) {\n  return box.w * box.h * box.d;\n}\nint main() {\n  Box box{2, 3, 4};\n  std::cout << volume(box) << "\\n";\n}',
          ['9', '24', '234', '20'],
          1,
          'The function multiplies the three members: 2 * 3 * 4 is 24.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\nstruct Point {\n  int x;\n  int y;\n};\nint sum(const Point& p) {\n  return p.x + p.y;\n}\nint main() {\n  Point a{3, -1};\n  Point b{10, 5};\n  std::cout << sum(a) + sum(b) << "\\n";\n}',
          ['15', '2', '17', '19'],
          2,
          'sum(a) is 2 and sum(b) is 15, so the total is 17.',
        ),
        choose(
          'Why take a struct parameter as const Order& rather than Order?',
          [
            "So the function can change the caller's order",
            'Because structs cannot be passed by value',
            'To avoid a copy while promising not to change it',
            'To give the function its own private copy',
          ],
          2,
          'A reference avoids copying, and const keeps the function from modifying the object through it.',
        ),
      ],
    },
    {
      title: 'Rely on const to block changes',
      explanation: [
        'Through a const reference the function cannot assign to the object; such code does not compile. The const applies only to that reference: the caller still owns the object and may change it, and the function then reads the new value.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\nstruct Counter {\n  int value;\n};\nint peek(const Counter& c) {\n  return c.value;\n}\nint main() {\n  Counter c{1};\n  int before = peek(c);\n  c.value = 9;\n  std::cout << before << " " << peek(c) << "\\n";\n}',
        output: '1 9',
        explanation:
          'peek only reads. main changes c between the calls, and the second call sees 9.',
      },
      questions: [
        choose(
          'What happens when this program is compiled?',
          [
            'It compiles and sets balance to 0',
            'It compiles but changes only a copy',
            'It compiles and returns the old balance',
            'It does not compile: account refers to a const Account',
          ],
          3,
          'Assigning to a member through a const reference is rejected by the compiler.',
          '#include <iostream>\nstruct Account {\n  int balance;\n};\nint drain(const Account& account) {\n  account.balance = 0;\n  return account.balance;\n}\nint main() {\n  Account a{50};\n  std::cout << drain(a) << "\\n";\n}',
        ),
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nstruct Tank {\n  int level;\n};\nint read(const Tank& tank) {\n  return tank.level;\n}\nint main() {\n  Tank tank{40};\n  tank.level += 5;\n  std::cout << read(tank) << "\\n";\n}',
          ['40', '5', '0', '45'],
          3,
          'main may change its own tank; read then sees the current level, 45.',
        ),
        choose(
          'What does a const reference parameter guarantee?',
          [
            'No code anywhere can change the object during the call',
            'The function cannot change the object through that reference',
            'The object is copied before the call',
            'The object can never change again',
          ],
          1,
          'const restricts what can be done through that name only; the object itself is not frozen.',
        ),
      ],
    },
    {
      title: 'Choose const& for reading and & for changing',
      explanation: [
        "Pick the parameter form from what the function does: const T& when it only reads, T& when changing the caller's object is the point, and plain T when it needs its own copy to modify freely.",
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\nstruct Score {\n  int points;\n};\nvoid add(Score& score, int extra) {\n  score.points += extra;\n}\nint total(const Score& score) {\n  return score.points;\n}\nint main() {\n  Score score{10};\n  add(score, 5);\n  std::cout << total(score) << "\\n";\n}',
        output: '15',
        explanation:
          "add takes Score& and changes the caller's score; total only reads it through const Score&.",
      },
      questions: [
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nstruct Wallet {\n  int cash;\n};\nvoid spend(Wallet& wallet, int amount) {\n  wallet.cash -= amount;\n}\nint left(const Wallet& wallet) {\n  return wallet.cash;\n}\nint main() {\n  Wallet wallet{50};\n  spend(wallet, 20);\n  spend(wallet, 5);\n  std::cout << left(wallet) << "\\n";\n}',
          ['50', '30', '25', '45'],
          2,
          'Both calls change the same wallet: 50 - 20 - 5 is 25.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\nstruct Pair {\n  int a;\n  int b;\n};\nint copy_sum(Pair p) {\n  p.a = 100;\n  return p.a + p.b;\n}\nint main() {\n  Pair p{1, 2};\n  int s = copy_sum(p);\n  std::cout << s << " " << p.a << "\\n";\n}',
          ['102 1', '102 100', '3 1', '3 100'],
          0,
          'The by-value parameter is a copy: the function sees 100 + 2, while the caller keeps a = 1.',
        ),
        choose(
          'A function only reads a Settings struct. Which parameter declaration fits best?',
          [
            'Settings& settings',
            'Settings settings',
            'const Settings settings',
            'const Settings& settings',
          ],
          3,
          'const Settings& avoids the copy and documents that the function will not modify it.',
        ),
      ],
    },
  ],
  'cpp-control': [
    {
      title: 'Return as soon as the answer is known',
      explanation: [
        'A return statement inside a loop ends the whole function at once: the remaining iterations and any statements after the loop are skipped. A search can therefore stop at the first match.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\n#include <vector>\nint first_negative(const std::vector<int>& values) {\n  for (int i = 0; i < static_cast<int>(values.size()); ++i)\n    if (values[i] < 0) return i;\n  return -1;\n}\nint main() {\n  std::cout << first_negative({4, -2, 7, -9}) << "\\n";\n}',
        output: '1',
        explanation:
          'The loop reaches -2 at position 1 and returns immediately, never looking at -9.',
      },
      questions: [
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <vector>\nint first_negative(const std::vector<int>& values) {\n  for (int i = 0; i < static_cast<int>(values.size()); ++i)\n    if (values[i] < 0) return i;\n  return -1;\n}\nint main() {\n  std::cout << first_negative({5, 3, -1}) << "\\n";\n}',
          ['2', '3', '-1', '0'],
          0,
          'The first negative value is at position 2.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\n#include <vector>\nint count_until_zero(const std::vector<int>& values) {\n  int count = 0;\n  for (int i = 0; i < static_cast<int>(values.size()); ++i) {\n    if (values[i] == 0) return count;\n    ++count;\n  }\n  return count;\n}\nint main() {\n  std::cout << count_until_zero({3, 8, 0, 4}) << "\\n";\n}',
          ['3', '2', '4', '1'],
          1,
          'Two values are counted before the 0 returns from the function; the 4 is never reached.',
        ),
        choose(
          'What happens to the rest of a loop when return runs inside it?',
          [
            'The loop finishes its remaining iterations first',
            'Only the current iteration ends',
            'The function ends immediately, skipping the rest',
            'The loop restarts from its first iteration',
          ],
          2,
          'return leaves the function, so nothing after it in the function runs.',
        ),
      ],
    },
    {
      title: 'Choose a sentinel that cannot be a real answer',
      explanation: [
        'When a search can fail, it needs a result that no successful search can produce. Positions start at 0, so 0 is a real answer; -1 is a common "not found" value because no position is negative.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\n#include <vector>\nint find(const std::vector<int>& values, int target) {\n  for (int i = 0; i < static_cast<int>(values.size()); ++i)\n    if (values[i] == target) return i;\n  return -1;\n}\nint main() {\n  std::cout << find({7, 8}, 7) << " " << find({7, 8}, 9) << "\\n";\n}',
        output: '0 -1',
        explanation:
          '7 is found at position 0, a real answer; 9 is missing, so the loop ends and -1 is returned.',
      },
      questions: [
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <vector>\nint find(const std::vector<int>& values, int target) {\n  for (int i = 0; i < static_cast<int>(values.size()); ++i)\n    if (values[i] == target) return i;\n  return -1;\n}\nint main() {\n  std::cout << find({4, 4, 4}, 4) << "\\n";\n}',
          ['-1', '2', '0', '3'],
          2,
          'The search returns at the first match, position 0.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\n#include <vector>\nint find(const std::vector<int>& values, int target) {\n  for (int i = 0; i < static_cast<int>(values.size()); ++i)\n    if (values[i] == target) return i;\n  return -1;\n}\nint main() {\n  std::cout << find({}, 1) << "\\n";\n}',
          ['0', '-1', '1', '-2'],
          1,
          'An empty vector gives the loop nothing to check, so the sentinel -1 is returned.',
        ),
        choose(
          'Why does find return -1 rather than 0 when the target is missing?',
          [
            '-1 makes the loop finish faster',
            'Functions returning int cannot return 0',
            'The compiler requires -1 for failure',
            '0 is a valid position, so it would be ambiguous',
          ],
          3,
          'A caller could not tell "found at 0" from "not found" if both returned 0.',
        ),
      ],
    },
    {
      title: 'Check the sentinel before using the result',
      explanation: [
        'The caller compares the result with the sentinel before treating it as a position. Only a result other than -1 may be used as an index.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\n#include <vector>\nint find(const std::vector<int>& values, int target) {\n  for (int i = 0; i < static_cast<int>(values.size()); ++i)\n    if (values[i] == target) return i;\n  return -1;\n}\nint main() {\n  int pos = find({3, 6, 9}, 9);\n  if (pos != -1) std::cout << "at " << pos << "\\n";\n  else std::cout << "missing\\n";\n}',
        output: 'at 2',
        explanation:
          '9 is at position 2, which is not the sentinel, so the program reports it.',
      },
      questions: [
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <vector>\nint find(const std::vector<int>& values, int target) {\n  for (int i = 0; i < static_cast<int>(values.size()); ++i)\n    if (values[i] == target) return i;\n  return -1;\n}\nint main() {\n  int pos = find({3, 6, 9}, 5);\n  if (pos != -1) std::cout << "at " << pos << "\\n";\n  else std::cout << "missing\\n";\n}',
          ['at -1', 'at 0', 'missing', 'at 3'],
          2,
          '5 is not present, so find returns -1 and the else branch runs.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\n#include <vector>\nint find(const std::vector<int>& values, int target) {\n  for (int i = 0; i < static_cast<int>(values.size()); ++i)\n    if (values[i] == target) return i;\n  return -1;\n}\nint main() {\n  std::vector<int> v{10, 20, 30, 20};\n  int pos = find(v, 20);\n  if (pos != -1) std::cout << pos << " " << v[pos] << "\\n";\n}',
          ['3 20', '2 30', '1 10', '1 20'],
          3,
          'The first 20 is at position 1, and v[1] is 20.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\n#include <vector>\nint find_last(const std::vector<int>& values, int target) {\n  int last = -1;\n  for (int i = 0; i < static_cast<int>(values.size()); ++i)\n    if (values[i] == target) last = i;\n  return last;\n}\nint main() {\n  std::cout << find_last({2, 5, 2, 7}, 2) << "\\n";\n}',
          ['0', '2', '-1', '1'],
          1,
          'Without an early return the loop keeps going, and last ends as the final match, position 2.',
        ),
      ],
    },
  ],
  'cpp-short-circuit': [
    {
      title: '&& skips its right side after a false left side',
      explanation: [
        'a && b evaluates a first. If a is false, the result must be false, so b is not evaluated at all. Any effect in b, such as an increment, then does not happen.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\nint main() {\n  int checks = 0;\n  bool ok = 2 > 5 && ++checks > 0;\n  std::cout << ok << " " << checks << "\\n";\n}',
        output: '0 0',
        explanation:
          '2 > 5 is false, so ++checks never runs and checks stays 0.',
      },
      questions: [
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint main() {\n  int checks = 0;\n  bool ok = 7 > 1 && ++checks > 0;\n  std::cout << ok << " " << checks << "\\n";\n}',
          ['1 0', '0 1', '0 0', '1 1'],
          3,
          'The left side is true, so the right side runs: checks becomes 1 and the result is true.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  int n = 0;\n  bool r = n != 0 && ++n > 0;\n  std::cout << r << n << "\\n";\n}',
          ['00', '11', '01', '10'],
          0,
          'n != 0 is false, so the increment is skipped and both values print as 0.',
        ),
        choose(
          'In a && b, when is b evaluated?',
          [
            'Always, before a',
            'Only when a is false',
            'Always, after a',
            'Only when a is true',
          ],
          3,
          'Only a true a leaves the answer open, so only then is b evaluated.',
        ),
      ],
    },
    {
      title: '|| skips its right side after a true left side',
      explanation: [
        'a || b also evaluates a first. If a is true, the result is already true, so b is skipped. b runs only when a is false.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\nint main() {\n  int calls = 0;\n  bool any = 3 > 1 || ++calls > 0;\n  std::cout << any << " " << calls << "\\n";\n}',
        output: '1 0',
        explanation: '3 > 1 is true, so ++calls is skipped and calls stays 0.',
      },
      questions: [
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint main() {\n  int n = 0;\n  bool r = 2 > 5 || ++n == 1;\n  std::cout << r << n << "\\n";\n}',
          ['01', '10', '11', '00'],
          2,
          'The left side is false, so ++n runs; n becomes 1 and the comparison is true.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  int n = 0;\n  bool r = n == 0 || ++n == 1;\n  std::cout << r << n << "\\n";\n}',
          ['11', '10', '01', '00'],
          1,
          'n == 0 is already true, so ++n is skipped and n stays 0.',
        ),
        choose(
          'In a || b, when is b skipped?',
          [
            'When a is false',
            'Never',
            'When a is true',
            'When b has no side effects',
          ],
          2,
          'A true a already decides the result, so b is not evaluated.',
        ),
      ],
    },
    {
      title: 'Put the guard on the left',
      explanation: [
        'Short-circuiting lets a safety check protect a risky operand: in count != 0 && total / count >= 10, the division runs only when count is nonzero. The guard must come first; written the other way round, the division runs before the check.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\nint main() {\n  int count = 0;\n  int total = 50;\n  bool high_average = count != 0 && total / count >= 10;\n  std::cout << high_average << "\\n";\n}',
        output: '0',
        explanation:
          'count != 0 is false, so the division by zero is never evaluated and the result is false.',
      },
      questions: [
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint main() {\n  int count = 5;\n  int total = 50;\n  std::cout << (count != 0 && total / count >= 10) << "\\n";\n}',
          ['0', '10', '1', '5'],
          2,
          'The guard passes, and 50 / 5 is 10, which is at least 10.',
        ),
        choose(
          'd may be 0. Which condition never divides by zero?',
          [
            'n / d > 3 && d != 0',
            'd != 0 && n / d > 3',
            'n / d > 3 || d == 0',
            'n / d > 3',
          ],
          1,
          'Only with the check on the left is the division skipped when d is 0.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  int d = 0;\n  int n = 9;\n  bool skip = d == 0 || n / d > 1;\n  std::cout << skip << "\\n";\n}',
          ['0', '9', '2', '1'],
          3,
          'd == 0 is true, so || stops there and the division never runs.',
        ),
        choose(
          'Why is total / count > 2 && count != 0 dangerous?',
          [
            'count != 0 is evaluated twice',
            '&& evaluates its operands from right to left',
            'It is always false',
            'The division runs before the check and can divide by zero',
          ],
          3,
          'The left operand is always evaluated first, so the division happens even when count is 0.',
        ),
      ],
    },
  ],
  'cpp-logic': [
    {
      title: 'Test both bounds with &&',
      explanation: [
        'A value is in the inclusive range from low to high when low <= value && value <= high. Each bound is its own comparison. Use < instead of <= for a bound that should be excluded.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\nint main() {\n  int value = 7;\n  std::cout << (1 <= value && value <= 10) << "\\n";\n}',
        output: '1',
        explanation: 'Both 1 <= 7 and 7 <= 10 are true.',
      },
      questions: [
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint main() {\n  int v = 10;\n  std::cout << (1 <= v && v <= 10) << (1 <= v && v < 10) << "\\n";\n}',
          ['11', '01', '10', '00'],
          2,
          '10 is inside the inclusive range, but v < 10 excludes it from the second.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  int age = 0;\n  std::cout << (1 <= age && age <= 120) << "\\n";\n}',
          ['1', '120', '-1', '0'],
          3,
          '0 fails the lower bound, so the range test is false.',
        ),
        choose(
          'Which expression is true exactly when x is from 5 to 9, both included?',
          [
            '5 < x && x < 9',
            '5 <= x || x <= 9',
            '5 <= x && x <= 9',
            'x >= 5 && x < 9',
          ],
          2,
          'Both bounds use <= and are joined with &&. With ||, every value would pass.',
        ),
      ],
    },
    {
      title: 'Avoid chained comparisons',
      explanation: [
        'low <= value <= high does not test a range in C++. The comparisons group left to right as (low <= value) <= high: the first one yields false or true, which become 0 or 1, and that number is compared with high, so the result is almost always true. Recent compilers reject the chained form; others accept it silently.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\nint main() {\n  int value = 50;\n  std::cout << ((1 <= value) <= 10) << " " << (1 <= value && value <= 10) << "\\n";\n}',
        output: '1 0',
        explanation:
          'Written with the grouping C++ uses, the first test compares true, which is 1, with 10 and says 1. The correct test says 0.',
      },
      questions: [
        predictOutput(
          'This program spells out how C++ groups 0 <= v <= 3. What does it print?',
          '#include <iostream>\nint main() {\n  int v = -5;\n  std::cout << ((0 <= v) <= 3) << "\\n";\n}',
          ['0', '1', '-5', '3'],
          1,
          '0 <= -5 is false, which is 0, and 0 <= 3 is true, so the grouped test prints 1 even though -5 is out of range.',
        ),
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint main() {\n  int v = 2;\n  std::cout << ((5 <= v) <= 9) << " " << (5 <= v && v <= 9) << "\\n";\n}',
          ['1 0', '0 0', '1 1', '0 1'],
          0,
          'The grouped form compares 0 with 9 and prints 1; the real range test fails the lower bound.',
        ),
        choose(
          'Why is 1 <= v <= 10 wrong in C++?',
          [
            'It checks only the upper bound, 10',
            'It evaluates v twice',
            'It compares the bool result of 1 <= v with 10',
            'It means the same as 1 <= v && v <= 10',
          ],
          2,
          'The comparisons group left to right, so the second one sees 0 or 1 instead of v.',
        ),
      ],
    },
    {
      title: 'Test for outside a range with ||',
      explanation: [
        'A value is outside the inclusive range when it is below low or above high: value < low || value > high. This is exactly the negation of the inside test, !(low <= value && value <= high).',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\nint main() {\n  int reading = 120;\n  std::cout << (reading < 0 || reading > 100) << "\\n";\n}',
        output: '1',
        explanation: '120 is above 100, so one side of || is true.',
      },
      questions: [
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint main() {\n  int v = 100;\n  std::cout << (v < 0 || v > 100) << "\\n";\n}',
          ['1', '100', '0', '-1'],
          2,
          '100 is the inclusive upper bound, so neither side is true.',
        ),
        choose(
          'Which expression is true exactly when x is outside the inclusive range 1 to 10?',
          [
            'x < 1 && x > 10',
            'x <= 1 || x >= 10',
            '!(x < 1) || x > 10',
            'x < 1 || x > 10',
          ],
          3,
          'No value is both below 1 and above 10, so && never works; <= and >= would wrongly exclude 1 and 10.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  int x = 15;\n  std::cout << !(1 <= x && x <= 10) << (x < 1 || x > 10) << "\\n";\n}',
          ['10', '01', '11', '00'],
          2,
          '15 is outside the range, and both forms of the outside test agree.',
        ),
      ],
    },
  ],
  'cpp-std-array': [
    {
      title: 'Declare and index a std::array',
      explanation: [
        'std::array<int, 3> from <array> holds exactly three ints. Elements are numbered from 0, so the last one is at size() - 1, and size() always returns 3. The size is part of the type, so a std::array never grows or shrinks.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\n#include <array>\nint main() {\n  std::array<int, 3> prices{4, 9, 2};\n  std::cout << prices[0] + prices[2] << " " << prices.size() << "\\n";\n}',
        output: '6 3',
        explanation:
          'prices[0] is 4 and prices[2] is 2; the array always holds 3 elements.',
      },
      questions: [
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <array>\nint main() {\n  std::array<int, 4> a{5, 6, 7, 8};\n  std::cout << a[1] << a[3] << "\\n";\n}',
          ['57', '68', '14', '56'],
          1,
          'Index 1 is the second element, 6, and index 3 is the fourth, 8.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\n#include <array>\nint main() {\n  std::array<int, 5> a{1, 2, 3, 4, 5};\n  std::cout << a[a.size() - 1] << "\\n";\n}',
          ['4', '6', '1', '5'],
          3,
          'size() is 5, so the last element is at index 4 and holds 5.',
        ),
        choose(
          'Which element is the last valid one of std::array<int, 6> a?',
          ['a[6]', 'a[7]', 'a[5]', 'a[1]'],
          2,
          'Six elements occupy indices 0 through 5.',
        ),
        choose(
          'What happens with values.push_back(4) when values is a std::array?',
          [
            'It appends 4 and the size grows by one',
            'It replaces the last element with 4',
            'It does not compile: a std::array has a fixed size',
            'It inserts 4 at the front',
          ],
          2,
          'std::array has no push_back, because its size is fixed by its type.',
        ),
      ],
    },
    {
      title: 'Start missing elements at zero',
      explanation: [
        'Elements without an initializer are set to zero: std::array<int, 4> a{7}; holds 7, 0, 0, 0, and a{} holds four zeros. Copying a std::array copies every element into an independent array.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\n#include <array>\nint main() {\n  std::array<int, 4> a{7};\n  std::cout << a[0] << a[1] << a[3] << "\\n";\n}',
        output: '700',
        explanation:
          'Only the first element was given; the remaining three start at 0.',
      },
      questions: [
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <array>\nint main() {\n  std::array<int, 3> counts{};\n  counts[1] += 2;\n  std::cout << counts[0] << counts[1] << counts[2] << "\\n";\n}',
          ['020', '222', '2', '002'],
          0,
          'All three counts start at 0, and only counts[1] becomes 2.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\n#include <array>\n#include <cstddef>\nint main() {\n  std::array<int, 5> a{1, 2};\n  int sum = 0;\n  for (std::size_t i = 0; i < a.size(); ++i) sum += a[i];\n  std::cout << sum << "\\n";\n}',
          ['15', '5', '3', '2'],
          2,
          'The array holds 1, 2, 0, 0, 0, so the sum is 3.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\n#include <array>\nint main() {\n  std::array<int, 2> a{4, 9};\n  std::array<int, 2> b = a;\n  b[0] = 0;\n  std::cout << a[0] << b[0] << "\\n";\n}',
          ['00', '44', '40', '04'],
          2,
          'b is an independent copy, so changing b[0] leaves a[0] at 4.',
        ),
      ],
    },
    {
      title: 'Loop over indices below size()',
      explanation: [
        'size() returns a std::size_t, the unsigned type used for sizes and indices, so the index variable is usually a std::size_t from <cstddef>. A loop with i < a.size() visits every element exactly once; i <= a.size() would read one past the end.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\n#include <array>\n#include <cstddef>\nint main() {\n  std::array<int, 4> scores{3, 8, 6, 1};\n  int total = 0;\n  for (std::size_t i = 0; i < scores.size(); ++i) total += scores[i];\n  std::cout << total << "\\n";\n}',
        output: '18',
        explanation: 'i takes 0, 1, 2, and 3, so all four scores are added.',
      },
      questions: [
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <array>\n#include <cstddef>\nint main() {\n  std::array<int, 4> a{2, 4, 6, 8};\n  for (std::size_t i = 0; i < a.size(); i += 2) std::cout << a[i];\n  std::cout << "\\n";\n}',
          ['48', '2468', '26', '246'],
          2,
          'Stepping by 2 visits indices 0 and 2, which hold 2 and 6.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\n#include <array>\n#include <cstddef>\nint main() {\n  std::array<int, 3> a{1, 2, 3};\n  for (std::size_t i = 0; i < a.size(); ++i) a[i] = a[i] * 10;\n  std::cout << a[0] + a[2] << "\\n";\n}',
          ['40', '4', '30', '60'],
          0,
          'Every element is multiplied by 10, so a[0] + a[2] is 10 + 30.',
        ),
        choose(
          'A loop over std::array<int, 4> a uses i <= a.size(). What goes wrong?',
          [
            'It skips a[0]',
            'It visits a[3] twice',
            'Nothing, because <= and < agree here',
            'It reads a[4], one past the last element',
          ],
          3,
          'With <= the final pass uses i = 4, which is not a valid index.',
        ),
      ],
    },
  ],
  'cpp-range-for': [
    {
      title: 'Visit every element in order',
      explanation: [
        'for (int x : a) runs its body once for each element of a, from first to last, with x holding that element. No index variable or bounds check is needed.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\n#include <array>\nint main() {\n  std::array<int, 4> a{3, 1, 4, 1};\n  for (int x : a) std::cout << x;\n  std::cout << "\\n";\n}',
        output: '3141',
        explanation:
          'The loop visits the four elements in order and prints each one.',
      },
      questions: [
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <array>\nint main() {\n  std::array<int, 3> a{2, 5, 7};\n  int sum = 0;\n  for (int x : a) sum += x;\n  std::cout << sum << "\\n";\n}',
          ['14', '7', '3', '257'],
          0,
          'Each element is added once: 2 + 5 + 7 is 14.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\n#include <array>\nint main() {\n  std::array<int, 4> a{1, 2, 3, 4};\n  int product = 1;\n  for (int x : a) product *= x;\n  std::cout << product << "\\n";\n}',
          ['10', '1', '24', '4'],
          2,
          'Multiplying all four elements gives 24.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\n#include <array>\nint main() {\n  std::array<int, 3> a{};\n  int visits = 0;\n  for (int x : a) visits += 1 + x;\n  std::cout << visits << "\\n";\n}',
          ['0', '1', '4', '3'],
          3,
          'The elements are all 0, but the body still runs once per element: three times.',
        ),
        choose(
          'How many times does the body of for (int x : a) run when a is a std::array<int, 6>?',
          ['5', '7', 'It depends on the values', '6'],
          3,
          'A range-based for loop runs once per element, and the array always has 6.',
        ),
      ],
    },
    {
      title: 'Remember the loop variable is a copy',
      explanation: [
        'In for (int x : a), x is a new int initialized from the current element. Changing x changes only that copy; the array keeps its values.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\n#include <array>\nint main() {\n  std::array<int, 3> a{1, 2, 3};\n  for (int x : a) x = x * 10;\n  std::cout << a[0] << a[1] << a[2] << "\\n";\n}',
        output: '123',
        explanation:
          'Each x was multiplied, but x is a copy, so the array still holds 1, 2, 3.',
      },
      questions: [
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <array>\nint main() {\n  std::array<int, 2> a{5, 6};\n  for (int x : a) x += 100;\n  std::cout << a[0] + a[1] << "\\n";\n}',
          ['211', '11', '111', '200'],
          1,
          'The additions changed only the copies, so the elements still add to 11.',
        ),
        choose(
          'In for (int x : values), what does x = 0; inside the body change?',
          [
            'The current element of values',
            'Every element of values',
            'Only the copy x for this pass',
            'Nothing, because it does not compile',
          ],
          2,
          'x is an independent int; assigning to it never reaches the array.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\n#include <array>\nint main() {\n  std::array<int, 3> a{4, 4, 4};\n  int changed = 0;\n  for (int x : a) {\n    x = 9;\n    changed += x;\n  }\n  std::cout << changed << " " << a[0] << "\\n";\n}',
          ['27 9', '12 4', '27 4', '12 9'],
          2,
          'Each copy becomes 9 and is added, giving 27, while a[0] stays 4.',
        ),
      ],
    },
  ],
  'cpp-loop-exits': [
    {
      title: 'Skip an element with continue',
      explanation: [
        'continue ends the current pass of the innermost loop and moves straight on to the next element (or, in a counting loop, to the update and the next check). Statements after it in the body are skipped for that pass only.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\n#include <array>\nint main() {\n  std::array<int, 5> a{4, -1, 3, -2, 5};\n  int sum = 0;\n  for (int x : a) {\n    if (x < 0) continue;\n    sum += x;\n  }\n  std::cout << sum << "\\n";\n}',
        output: '12',
        explanation: 'The negative values skip the addition; 4 + 3 + 5 is 12.',
      },
      questions: [
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <array>\nint main() {\n  std::array<int, 4> a{1, 2, 3, 4};\n  for (int x : a) {\n    if (x == 2) continue;\n    std::cout << x;\n  }\n  std::cout << "\\n";\n}',
          ['1', '134', '1234', '34'],
          1,
          'Only the pass for 2 is skipped; the loop carries on with 3 and 4.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\n#include <array>\nint main() {\n  std::array<int, 5> a{0, 7, 0, 7, 0};\n  int count = 0;\n  for (int x : a) {\n    if (x == 0) continue;\n    ++count;\n  }\n  std::cout << count << "\\n";\n}',
          ['3', '0', '5', '2'],
          3,
          'The three zeros are skipped, so only the two 7s are counted.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  for (int i = 1; i <= 5; ++i) {\n    if (i == 3) continue;\n    std::cout << i;\n  }\n  std::cout << "\\n";\n}',
          ['1245', '12', '12345', '45'],
          0,
          'In a counting loop, continue still runs ++i, so only 3 is skipped.',
        ),
      ],
    },
    {
      title: 'Leave the loop with break',
      explanation: [
        'break ends the innermost loop immediately. No later elements are visited, and execution continues after the loop.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\n#include <array>\nint main() {\n  std::array<int, 5> a{6, 2, 0, 9, 4};\n  int sum = 0;\n  for (int x : a) {\n    if (x == 0) break;\n    sum += x;\n  }\n  std::cout << sum << "\\n";\n}',
        output: '8',
        explanation:
          'The loop adds 6 and 2 and stops at the 0, so 9 and 4 are never visited.',
      },
      questions: [
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint main() {\n  for (int i = 1; i <= 10; ++i) {\n    if (i * i > 20) break;\n    std::cout << i;\n  }\n  std::cout << "\\n";\n}',
          ['12345', '4', '1234', '5'],
          2,
          '5 * 5 is the first square above 20, so the loop stops before printing 5.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\n#include <array>\nint main() {\n  std::array<int, 4> a{3, 3, 9, 3};\n  int seen = 0;\n  for (int x : a) {\n    ++seen;\n    if (x == 9) break;\n  }\n  std::cout << seen << "\\n";\n}',
          ['2', '4', '1', '3'],
          3,
          'The 9 is counted before break runs, so three elements are seen.',
        ),
        choose(
          'What does break do inside a for loop?',
          [
            'Skips the rest of this pass only',
            'Ends the loop immediately',
            'Restarts the loop from the beginning',
            'Ends the whole program',
          ],
          1,
          'break leaves the innermost loop; the code after the loop runs next.',
        ),
      ],
    },
    {
      title: 'Combine continue and break',
      explanation: [
        'One loop can use both: continue to ignore elements that do not matter and break to stop once the rest no longer matter. The order of the tests decides which rule wins when both could apply.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\n#include <array>\nint main() {\n  std::array<int, 6> readings{2, -3, 6, -1, 0, 9};\n  int total = 0;\n  for (int x : readings) {\n    if (x < 0) continue;\n    if (x == 0) break;\n    total += x;\n  }\n  std::cout << total << "\\n";\n}',
        output: '8',
        explanation:
          'Negative readings are skipped, the 0 ends the loop, and the 9 after it is never reached: 2 + 6 is 8.',
      },
      questions: [
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <array>\nint main() {\n  std::array<int, 6> readings{-2, -2, 5, 0, 5, 5};\n  int total = 0;\n  for (int x : readings) {\n    if (x < 0) continue;\n    if (x == 0) break;\n    total += x;\n  }\n  std::cout << total << "\\n";\n}',
          ['15', '5', '1', '11'],
          1,
          'Only the first 5 is added before the 0 stops the loop.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\n#include <array>\nint main() {\n  std::array<int, 4> a{3, -4, 0, 2};\n  int total = 0;\n  for (int x : a) {\n    if (x == 0) break;\n    if (x < 0) continue;\n    total += x;\n  }\n  std::cout << total << "\\n";\n}',
          ['5', '-1', '1', '3'],
          3,
          '3 is added, -4 is skipped, and 0 stops the loop before 2.',
        ),
        choose(
          'A loop should ignore negative readings and stop at the first 0. Which body is right?',
          [
            'if (x < 0) break; if (x == 0) continue; total += x;',
            'if (x == 0) continue; total += x;',
            'if (x < 0) continue; total += x; if (x == 0) continue;',
            'if (x < 0) continue; if (x == 0) break; total += x;',
          ],
          3,
          'continue skips one negative reading, and break ends the loop at the first 0.',
        ),
      ],
    },
  ],
  'cpp-arrays': [
    {
      title: 'Modify elements through int&',
      explanation: [
        'Declaring the loop variable as a reference, for (int& x : a), makes x another name for each element in turn, so assigning to x changes the array.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\n#include <array>\nint main() {\n  std::array<int, 3> a{1, 2, 3};\n  for (int& x : a) x *= 10;\n  std::cout << a[0] << " " << a[2] << "\\n";\n}',
        output: '10 30',
        explanation:
          'x refers to each element, so every element is multiplied by 10.',
      },
      questions: [
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <array>\nint main() {\n  std::array<int, 4> a{1, 1, 1, 1};\n  for (int& x : a) x += 2;\n  int sum = 0;\n  for (int x : a) sum += x;\n  std::cout << sum << "\\n";\n}',
          ['4', '8', '6', '12'],
          3,
          'Each element becomes 3, so the four elements add to 12.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\n#include <array>\nint main() {\n  std::array<int, 3> a{5, 6, 7};\n  for (int x : a) x = 0;\n  for (int& y : a) y -= 1;\n  std::cout << a[0] << a[1] << a[2] << "\\n";\n}',
          ['-1-1-1', '456', '000', '567'],
          1,
          'The first loop changes only copies; the second subtracts 1 from each real element.',
        ),
        choose(
          'Which loop doubles every element of std::array<int, 4> a?',
          [
            'for (int x : a) x *= 2;',
            'for (int& x : a) x * 2;',
            'for (int x : a) a = x * 2;',
            'for (int& x : a) x *= 2;',
          ],
          3,
          'Only a reference loop variable with an assignment changes the elements.',
        ),
      ],
    },
    {
      title: 'Use auto& to change and auto to copy',
      explanation: [
        'auto works in a range-based for too: for (auto& x : a) refers to each element, and for (auto x : a) copies each one. The & decides whether the loop can change the array.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\n#include <array>\nint main() {\n  std::array<int, 3> a{2, 4, 6};\n  for (auto& x : a) x = x - 1;\n  for (auto x : a) std::cout << x;\n  std::cout << "\\n";\n}',
        output: '135',
        explanation:
          'The auto& loop changes each element; the auto loop then reads the new values.',
      },
      questions: [
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <array>\nint main() {\n  std::array<int, 3> a{1, 2, 3};\n  for (auto x : a) x *= 5;\n  std::cout << a[1] << "\\n";\n}',
          ['10', '5', '2', '15'],
          2,
          'Plain auto copies each element, so the array is unchanged and a[1] is 2.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\n#include <array>\nint main() {\n  std::array<int, 4> a{4, 3, 2, 1};\n  int i = 0;\n  for (auto& x : a) {\n    x = i;\n    ++i;\n  }\n  std::cout << a[0] << a[3] << "\\n";\n}',
          ['41', '14', '03', '30'],
          2,
          'Each element is overwritten with its position, so a[0] is 0 and a[3] is 3.',
        ),
        choose(
          'How do for (auto x : a) and for (auto& x : a) differ?',
          [
            'They are identical',
            'The first copies each element; the second refers to each element',
            'The second copies each element; the first refers to each element',
            'auto& works only with arrays of int',
          ],
          1,
          'Without & the loop variable is a copy; with & it is another name for the element.',
        ),
      ],
    },
    {
      title: 'Build results in place',
      explanation: [
        'A reference loop can combine reading and writing each element, for example replacing every value with a running total. Only the reference form keeps the results in the array.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\n#include <array>\nint main() {\n  std::array<int, 4> a{1, 2, 3, 4};\n  int running = 0;\n  for (int& x : a) {\n    running += x;\n    x = running;\n  }\n  std::cout << a[0] << " " << a[1] << " " << a[2] << " " << a[3] << "\\n";\n}',
        output: '1 3 6 10',
        explanation:
          'Each element is replaced by the total so far: 1, 1 + 2, 1 + 2 + 3, and 1 + 2 + 3 + 4.',
      },
      questions: [
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <array>\nint main() {\n  std::array<int, 3> a{5, 5, 5};\n  int running = 0;\n  for (int& x : a) {\n    running += x;\n    x = running;\n  }\n  std::cout << a[2] << "\\n";\n}',
          ['5', '10', '15', '25'],
          2,
          'The last element becomes the full running total, 15.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\n#include <array>\nint main() {\n  std::array<int, 3> a{5, 5, 5};\n  int running = 0;\n  for (int x : a) {\n    running += x;\n    x = running;\n  }\n  std::cout << a[2] << "\\n";\n}',
          ['5', '15', '10', '0'],
          0,
          'The loop variable is a copy, so the totals are written only to copies and a[2] stays 5.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\n#include <array>\nint main() {\n  std::array<int, 3> a{3, 1, 2};\n  for (auto& x : a) x = x * x;\n  int sum = 0;\n  for (auto x : a) sum += x;\n  std::cout << sum << "\\n";\n}',
          ['6', '36', '12', '14'],
          3,
          'The elements become 9, 1, and 4, which add to 14.',
        ),
      ],
    },
  ],
  'cpp-function-overloads': [
    {
      title: 'Give overloads different parameter types',
      explanation: [
        'Several functions may share a name if their parameter lists differ. The compiler picks the overload whose parameters match the argument types: an int argument selects the int version, and a double argument selects the double version.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\nint describe(int x) {\n  return x * 2;\n}\ndouble describe(double x) {\n  return x / 2;\n}\nint main() {\n  std::cout << describe(6) << " " << describe(6.0) << "\\n";\n}',
        output: '12 3',
        explanation:
          '6 is an int, so the first overload doubles it; 6.0 is a double, so the second halves it.',
      },
      questions: [
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint scale(int x) {\n  return x * 10;\n}\ndouble scale(double x) {\n  return x * 100;\n}\nint main() {\n  std::cout << scale(2) << " " << scale(0.5) << "\\n";\n}',
          ['200 5', '20 50', '20 5', '200 50'],
          1,
          'scale(2) uses the int version (20) and scale(0.5) the double version (50).',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\nint kind(int) {\n  return 1;\n}\nint kind(double) {\n  return 2;\n}\nint main() {\n  std::cout << kind(3) << kind(3.0) << kind(7 / 2) << "\\n";\n}',
          ['122', '111', '212', '121'],
          3,
          '7 / 2 is integer division, so its type is int and it selects the first overload.',
        ),
        choose(
          'Which pair of declarations is a valid overload set?',
          [
            'int f(int); double f(int);',
            'int f(int x); int f(int y);',
            'int f(int); int f(double);',
            'double f(int); double f(int);',
          ],
          2,
          'Only the third pair differs in parameter types; parameter names and return types do not count.',
        ),
      ],
    },
    {
      title: 'Select an overload with a cast',
      explanation: [
        'Because the argument type picks the overload, converting the argument first changes which function runs: half(n) with an int n calls the int version, while half(static_cast<double>(n)) calls the double one. The return type alone can never distinguish two overloads.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\nint half(int x) {\n  return x / 2;\n}\ndouble half(double x) {\n  return x / 2;\n}\nint main() {\n  int n = 7;\n  std::cout << half(n) << " " << half(static_cast<double>(n)) << "\\n";\n}',
        output: '3 3.5',
        explanation:
          'The int version uses integer division; the cast selects the double version, which keeps the .5.',
      },
      questions: [
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint half(int x) {\n  return x / 2;\n}\ndouble half(double x) {\n  return x / 2;\n}\nint main() {\n  std::cout << half(9) << " " << half(9.0) << "\\n";\n}',
          ['4.5 4.5', '4 4', '4 4.5', '4.5 4'],
          2,
          '9 selects the int overload (4) and 9.0 the double overload (4.5).',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\ndouble area(double radius) {\n  return 3 * radius * radius;\n}\nint area(int side) {\n  return side * side;\n}\nint main() {\n  std::cout << area(2) + area(1.0) << "\\n";\n}',
          ['15', '7.0', '7', '6'],
          2,
          'area(2) is the int version, 4; area(1.0) is the double version, 3.0; the sum prints as 7.',
        ),
        choose(
          'Why do int f(int) and double f(int) fail to compile together?',
          [
            'Two functions cannot both return numbers',
            'Only the return types differ, and that cannot pick an overload',
            'double f(int) needs a cast in its body',
            'Only one function may ever be named f',
          ],
          1,
          'A call f(3) would match both equally, so the language rejects overloads that differ only in return type.',
        ),
      ],
    },
    {
      title: 'Overload on the number of parameters',
      explanation: [
        'Overloads may also differ in how many parameters they take. The compiler counts the arguments in the call and picks the matching version.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\nint total(int a, int b) {\n  return a + b;\n}\nint total(int a, int b, int c) {\n  return a + b + c;\n}\nint main() {\n  std::cout << total(1, 2) << " " << total(1, 2, 3) << "\\n";\n}',
        output: '3 6',
        explanation:
          'Two arguments select the two-parameter version, and three select the other.',
      },
      questions: [
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint count(int) {\n  return 1;\n}\nint count(int, int) {\n  return 2;\n}\nint main() {\n  std::cout << count(5) + count(5, 6) << "\\n";\n}',
          ['2', '4', '11', '3'],
          3,
          'One argument calls the version returning 1, two arguments the version returning 2.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\ndouble average(int a, int b) {\n  return (a + b) / 2.0;\n}\nint average(int a) {\n  return a;\n}\nint main() {\n  std::cout << average(3, 4) << " " << average(3) << "\\n";\n}',
          ['3 3', '3.5 3', '3.5 3.5', '7 3'],
          1,
          'The two-argument version divides by 2.0 and returns 3.5; the one-argument version returns 3.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\nint g(int) {\n  return 1;\n}\nint g(double) {\n  return 2;\n}\nint main() {\n  std::cout << g(2) * g(2.5) << "\\n";\n}',
          ['4', '1', '2', '5'],
          2,
          'g(2) picks the int version (1) and g(2.5) the double version (2), and 1 * 2 is 2.',
        ),
      ],
    },
  ],
  'cpp-default-arguments': [
    {
      title: 'Omit a trailing argument to use its default',
      explanation: [
        'int price(int base, int fee = 3) gives fee a default. A call that leaves out the fee argument uses 3; a call that supplies it uses the supplied value.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\nint price(int base, int fee = 3) {\n  return base + fee;\n}\nint main() {\n  std::cout << price(10) << " " << price(10, 0) << "\\n";\n}',
        output: '13 10',
        explanation:
          'price(10) uses the default fee of 3; price(10, 0) supplies 0.',
      },
      questions: [
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint seats(int people, int extra = 1) {\n  return people + extra;\n}\nint main() {\n  std::cout << seats(4) << "\\n";\n}',
          ['4', '5', '1', '41'],
          1,
          'extra is omitted, so its default 1 is added to 4.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\nint grow(int n, int step = 2) {\n  return n * step;\n}\nint main() {\n  std::cout << grow(5, 3) + grow(5) << "\\n";\n}',
          ['30', '20', '25', '15'],
          2,
          'grow(5, 3) is 15 and grow(5) uses step 2 for 10, so the sum is 25.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\nint f(int a, int b = 10) {\n  return a - b;\n}\nint main() {\n  std::cout << f(4, 0) << " " << f(4) << "\\n";\n}',
          ['-6 4', '4 4', '-6 -6', '4 -6'],
          3,
          'f(4, 0) is 4 - 0; f(4) uses b = 10, giving -6.',
        ),
      ],
    },
    {
      title: 'Put defaults after the required parameters',
      explanation: [
        'Arguments fill parameters from left to right, so only trailing parameters can have defaults. Once a parameter has a default, every parameter after it needs one too. A call cannot skip a middle argument.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\nint box(int w, int h = 2, int d = 3) {\n  return w * h * d;\n}\nint main() {\n  std::cout << box(1) << " " << box(1, 5) << " " << box(1, 5, 1) << "\\n";\n}',
        output: '6 15 5',
        explanation:
          'box(1) uses both defaults; box(1, 5) supplies h; box(1, 5, 1) supplies everything.',
      },
      questions: [
        choose(
          'Which declaration compiles?',
          [
            'int f(int a = 1, int b);',
            'int f(int a, int b = 1, int c);',
            'int f(int a = 1, int b, int c = 2);',
            'int f(int a, int b = 1);',
          ],
          3,
          'Only the last one gives defaults to trailing parameters alone.',
        ),
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint box(int w, int h = 2, int d = 3) {\n  return w * h * d;\n}\nint main() {\n  std::cout << box(2, 1) << "\\n";\n}',
          ['2', '6', '12', '4'],
          1,
          'w = 2 and h = 1 are supplied, and d keeps its default 3: 2 * 1 * 3 is 6.',
        ),
        choose(
          'With int box(int w, int h = 2, int d = 3), how can a call pass d = 9 and keep h at its default?',
          [
            'box(1, , 9), leaving h empty',
            'box(1, d = 9), naming the parameter',
            'box(1, 9), letting the compiler match d',
            'box(1, 2, 9), passing h explicitly',
          ],
          3,
          'Arguments fill parameters in order, so box(1, 9) would set h; h must be passed to reach d.',
        ),
      ],
    },
    {
      title: 'Let supplied arguments override defaults',
      explanation: [
        'A default is used only when its argument is missing from the call. A default value is fixed in the declaration; it does not come from a variable of the same name in the caller.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\nint timeout_ms(int seconds = 30) {\n  return seconds * 1000;\n}\nint main() {\n  std::cout << timeout_ms() << " " << timeout_ms(5) << "\\n";\n}',
        output: '30000 5000',
        explanation:
          'The empty call uses 30; the second call supplies 5, which replaces the default.',
      },
      questions: [
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint level(int n = 1) {\n  return n * n;\n}\nint main() {\n  std::cout << level() + level(3) << "\\n";\n}',
          ['2', '10', '18', '4'],
          1,
          'level() uses 1 and returns 1; level(3) returns 9.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\nint add(int a, int b = 5) {\n  return a + b;\n}\nint main() {\n  int b = 100;\n  std::cout << add(1) << "\\n";\n}',
          ['101', '1', '6', '105'],
          2,
          "The default is the 5 in the declaration; the caller's variable named b plays no part.",
        ),
        choose(
          'A caller passes every argument to a function that has defaults. Which values are used?',
          [
            'The defaults, for the parameters that have them',
            'The defaults, unless they are zero',
            'The larger of each default and argument',
            "The caller's arguments for every parameter",
          ],
          3,
          'Defaults fill in only missing arguments; supplied ones always win.',
        ),
      ],
    },
  ],
  'cpp-reference-alias': [
    {
      title: 'Give an existing int a second name',
      explanation: [
        'int& points = score; declares points as a reference: another name for the object score. Reading or assigning through either name uses the same int.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\nint main() {\n  int score = 10;\n  int& points = score;\n  points += 5;\n  std::cout << score << "\\n";\n}',
        output: '15',
        explanation:
          'points and score name the same int, so adding through points changes score.',
      },
      questions: [
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint main() {\n  int a = 3;\n  int& r = a;\n  r = 8;\n  std::cout << a << "\\n";\n}',
          ['3', '8', '11', '0'],
          1,
          'Assigning to r assigns to a, because r is another name for a.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  int a = 3;\n  int& r = a;\n  a = a * 4;\n  std::cout << r << "\\n";\n}',
          ['3', '4', '12', '7'],
          2,
          'Changes made through a are visible through r, since both name one object.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  int x = 1;\n  int& y = x;\n  int& z = y;\n  z += 9;\n  std::cout << x << y << "\\n";\n}',
          ['110', '101', '1', '1010'],
          3,
          'z is bound to the object y names, which is x, so x and y both read 10.',
        ),
      ],
    },
    {
      title: 'Tell a reference from a copy',
      explanation: [
        'int copy = value; makes a new int with the same value; later changes to either do not affect the other. int& ref = value; makes no new int at all, so the two names always agree.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\nint main() {\n  int total = 4;\n  int copy = total;\n  int& ref = total;\n  total = 9;\n  std::cout << copy << " " << ref << "\\n";\n}',
        output: '4 9',
        explanation:
          'copy kept the 4 it started with; ref names total, so it reads the new 9.',
      },
      questions: [
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint main() {\n  int a = 2;\n  int b = a;\n  int& c = a;\n  b += 10;\n  c += 100;\n  std::cout << a << " " << b << "\\n";\n}',
          ['102 12', '112 12', '2 12', '102 112'],
          0,
          'b is a separate copy that becomes 12; c names a, so a becomes 102.',
        ),
        choose(
          'After int& r = x;, what does r refer to?',
          [
            'A new int holding a copy of x',
            'The value x had at that moment',
            'The object x itself',
            'Whichever int was declared last',
          ],
          2,
          'A reference is bound to an existing object; it is not a new object with a copied value.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  int n = 5;\n  int m = n;\n  int& k = m;\n  k = 0;\n  std::cout << n << m << "\\n";\n}',
          ['00', '55', '50', '05'],
          2,
          'k names the copy m, so only m becomes 0; n keeps 5.',
        ),
      ],
    },
    {
      title: 'Bind a reference when it is declared',
      explanation: [
        'A reference must be bound to an object in its declaration, and that object must stay alive for as long as the reference is used. int& r; alone does not compile, and a plain int& cannot bind to a literal such as 5.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\nint main() {\n  int level = 1;\n  int& current = level;\n  ++current;\n  ++level;\n  std::cout << current << "\\n";\n}',
        output: '3',
        explanation: 'Both increments change the same int, so current reads 3.',
      },
      questions: [
        choose(
          'Why does int& r; on its own fail to compile?',
          [
            'References must be declared outside main',
            'int& is not a valid type',
            'A reference must be bound to an object when it is declared',
            'r is a reserved name',
          ],
          2,
          'There is no such thing as an unbound reference, so the initializer is required.',
        ),
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint main() {\n  int stock = 10;\n  int& shelf = stock;\n  --shelf;\n  --stock;\n  std::cout << shelf << " " << stock << "\\n";\n}',
          ['9 9', '9 8', '8 8', '10 8'],
          2,
          'Both decrements change the same object, which ends at 8.',
        ),
        choose(
          'Which declaration binds a reference correctly?',
          ['int& r = 5;', 'int& r;', 'int r& = total;', 'int& r = total;'],
          3,
          'A plain int& must bind to an existing int object such as total; a literal 5 is not one.',
        ),
      ],
    },
  ],
  'cpp-reference-parameter': [
    {
      title: "Change the caller's variable through int&",
      explanation: [
        "A parameter declared int& binds to the caller's argument instead of copying it. Assignments inside the function therefore change the caller's variable.",
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\nvoid add_bonus(int& score) {\n  score += 10;\n}\nint main() {\n  int score = 5;\n  add_bonus(score);\n  std::cout << score << "\\n";\n}',
        output: '15',
        explanation:
          "The parameter is another name for main's score, so adding 10 changes it.",
      },
      questions: [
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nvoid reset(int& n) {\n  n = 0;\n}\nint main() {\n  int count = 7;\n  reset(count);\n  std::cout << count << "\\n";\n}',
          ['7', '0', '70', '-7'],
          1,
          "n refers to count, so assigning 0 changes the caller's variable.",
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\nvoid twice(int& n) {\n  n *= 2;\n}\nint main() {\n  int a = 3;\n  twice(a);\n  twice(a);\n  std::cout << a << "\\n";\n}',
          ['6', '3', '9', '12'],
          3,
          'Each call doubles the same a: 3 becomes 6, then 12.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\nvoid copy_change(int n) {\n  n = 50;\n}\nvoid ref_change(int& n) {\n  n = 60;\n}\nint main() {\n  int a = 1;\n  int b = 2;\n  copy_change(a);\n  ref_change(b);\n  std::cout << a << " " << b << "\\n";\n}',
          ['50 60', '1 2', '1 60', '50 2'],
          2,
          'Only the reference parameter reaches the caller; the by-value parameter changes a copy.',
        ),
      ],
    },
    {
      title: 'Swap two variables through references',
      explanation: [
        "A function with two int& parameters can update two of the caller's variables. Swapping needs a temporary: save one value before overwriting it.",
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\nvoid swap_ints(int& a, int& b) {\n  int temp = a;\n  a = b;\n  b = temp;\n}\nint main() {\n  int x = 1;\n  int y = 2;\n  swap_ints(x, y);\n  std::cout << x << y << "\\n";\n}',
        output: '21',
        explanation:
          'temp keeps the old x while x receives y, and then y receives the saved value.',
      },
      questions: [
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nvoid bad_swap(int& a, int& b) {\n  a = b;\n  b = a;\n}\nint main() {\n  int x = 1;\n  int y = 2;\n  bad_swap(x, y);\n  std::cout << x << y << "\\n";\n}',
          ['21', '22', '12', '11'],
          1,
          'a = b overwrites x with 2 before it is saved, so b = a copies 2 back.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\nvoid swap_copies(int a, int b) {\n  int t = a;\n  a = b;\n  b = t;\n}\nint main() {\n  int x = 4;\n  int y = 9;\n  swap_copies(x, y);\n  std::cout << x << y << "\\n";\n}',
          ['94', '99', '44', '49'],
          3,
          'The parameters are copies, so the swap happens only inside the function.',
        ),
        choose(
          "A function must update two of the caller's ints. Which signature allows that?",
          [
            'void update(int a, int b)',
            'int update(int a, int b)',
            'void update(const int a, int b)',
            'void update(int& a, int& b)',
          ],
          3,
          "Only reference parameters bind to the caller's variables.",
        ),
      ],
    },
    {
      title: 'Make the mutation part of the contract',
      explanation: [
        'A function may both return a result and change an argument through a reference. Because callers cannot see that from a call alone, the function name and documentation should say so; a function that looks like a read-only query should not quietly modify its input.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\nint take(int& stock, int amount) {\n  stock -= amount;\n  return amount * 3;\n}\nint main() {\n  int stock = 10;\n  int cost = take(stock, 4);\n  std::cout << stock << " " << cost << "\\n";\n}',
        output: '6 12',
        explanation:
          "take lowers the caller's stock to 6 and returns the cost, 12.",
      },
      questions: [
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint next_ticket(int& counter) {\n  counter += 1;\n  return counter * 100;\n}\nint main() {\n  int c = 0;\n  next_ticket(c);\n  int t = next_ticket(c);\n  std::cout << c << " " << t << "\\n";\n}',
          ['1 100', '2 100', '2 200', '1 200'],
          2,
          'Both calls increment c, and the second returns 2 * 100.',
        ),
        choose(
          'A function named read_level(int& level) also sets level to 0. Why is that a problem?',
          [
            'int& parameters can never be changed',
            'The change is lost when the function returns',
            'Callers expect a read-only query, so the hidden change surprises them',
            'The program will not compile',
          ],
          2,
          'Nothing in the call shows the mutation, so it should be part of the stated contract or avoided.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\nvoid bump(int& a, int b) {\n  a += b;\n  b += a;\n}\nint main() {\n  int a = 1;\n  int b = 2;\n  bump(a, b);\n  std::cout << a << b << "\\n";\n}',
          ['35', '15', '12', '32'],
          3,
          "a is a reference and becomes 3; b is a copy, so the caller's b stays 2.",
        ),
      ],
    },
  ],
  'cpp-reference-reseat': [
    {
      title: 'Assign through a reference to change its object',
      explanation: [
        'After int& alias = first;, the statement alias = second; does not make alias refer to second. It copies the value of second into first, the object alias was bound to.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\nint main() {\n  int first = 1;\n  int second = 4;\n  int& alias = first;\n  alias = second;\n  std::cout << first << " " << second << "\\n";\n}',
        output: '4 4',
        explanation:
          'The assignment wrote 4 into first. second is unchanged and still 4.',
      },
      questions: [
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint main() {\n  int a = 10;\n  int b = 20;\n  int& r = a;\n  r = b;\n  b = 30;\n  std::cout << a << " " << r << "\\n";\n}',
          ['30 30', '20 20', '10 30', '20 30'],
          1,
          'r = b copied 20 into a. r still names a, so the later change to b does not show.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  int a = 1;\n  int b = 2;\n  int& r = a;\n  r = b;\n  r = 7;\n  std::cout << a << b << "\\n";\n}',
          ['17', '77', '72', '12'],
          2,
          'Both assignments go to a, which ends at 7; b is never changed.',
        ),
        choose(
          'r is a reference bound to a. What does r = b; do?',
          [
            'Makes r refer to b from now on',
            'Copies the value of a into b',
            'Swaps the values of a and b',
            'Copies the value of b into a',
          ],
          3,
          'Assignment through a reference assigns to the object it is bound to.',
        ),
      ],
    },
    {
      title: 'Keep a reference bound to its first object',
      explanation: [
        'A reference is bound once, when it is initialized, and can never be rebound. Code that needs to switch between objects uses a pointer instead.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\nint main() {\n  int x = 5;\n  int y = 8;\n  int& r = x;\n  r = y;\n  y = 100;\n  std::cout << x << " " << r << " " << y << "\\n";\n}',
        output: '8 8 100',
        explanation:
          'r = y copied 8 into x. r still names x, so it reads 8 even after y becomes 100.',
      },
      questions: [
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint main() {\n  int left = 3;\n  int right = 9;\n  int& r = left;\n  r = right;\n  r += 1;\n  std::cout << left << " " << right << "\\n";\n}',
          ['3 10', '10 10', '10 9', '9 10'],
          2,
          'r stays bound to left: it receives 9 and then becomes 10, while right stays 9.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  int a = 0;\n  int b = 5;\n  int& r = a;\n  r = b;\n  b = r + 1;\n  std::cout << a << b << "\\n";\n}',
          ['55', '56', '06', '66'],
          1,
          'a becomes 5 through r, and then b becomes a + 1, which is 6.',
        ),
        choose(
          'How can code make an existing reference refer to a different object?',
          [
            'Assign the other object to it',
            'Declare it again with the same name',
            'Write r = &other;',
            'It cannot; a reference is bound once, at initialization',
          ],
          3,
          'Every later assignment goes to the original object, never rebinding the reference.',
        ),
      ],
    },
  ],
  'cpp-pointer-address': [
    {
      title: 'Store an address and read through it',
      explanation: [
        '&value gives the address of value, and int* p = &value; stores it in a pointer. *p, the dereference, accesses the int that p points to.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\nint main() {\n  int value = 7;\n  int* p = &value;\n  std::cout << *p << "\\n";\n}',
        output: '7',
        explanation:
          'p holds the address of value, and *p reads the int stored there.',
      },
      questions: [
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint main() {\n  int stock = 12;\n  int* p = &stock;\n  std::cout << *p + 1 << "\\n";\n}',
          ['12', '13', '14', '1'],
          1,
          '*p reads 12, and adding 1 gives 13; the pointer itself is not changed.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  int a = 3;\n  int b = 9;\n  int* p = &b;\n  std::cout << *p << "\\n";\n}',
          ['3', '12', '9', '0'],
          2,
          'p holds the address of b, so *p reads 9.',
        ),
        choose(
          'In int* p = &value;, what does p hold?',
          [
            'A copy of value',
            'Another name for value',
            'The size of value',
            'The address of value',
          ],
          3,
          'A pointer stores an address; *p is how you reach the int at that address.',
        ),
      ],
    },
    {
      title: 'Write through a pointer',
      explanation: [
        '*p is the pointed-to object itself, so assigning to *p changes it. Changes made directly to the object are also visible through *p.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\nint main() {\n  int count = 3;\n  int* p = &count;\n  *p += 4;\n  std::cout << count << "\\n";\n}',
        output: '7',
        explanation: '*p is count, so adding 4 through it makes count 7.',
      },
      questions: [
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint main() {\n  int a = 1;\n  int* p = &a;\n  *p = 50;\n  std::cout << a << "\\n";\n}',
          ['1', '51', '50', '0'],
          2,
          'Assigning to *p assigns to a.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  int a = 2;\n  int* p = &a;\n  int b = *p;\n  *p = 8;\n  std::cout << a << " " << b << "\\n";\n}',
          ['8 8', '2 2', '2 8', '8 2'],
          3,
          'b copied 2 before the write; the write through p changes only a.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  int n = 5;\n  int* p = &n;\n  n = 6;\n  std::cout << *p * 2 << "\\n";\n}',
          ['12', '10', '6', '5'],
          0,
          'p points to n, so *p reads its current value 6.',
        ),
      ],
    },
    {
      title: 'Pass an address to a function',
      explanation: [
        "A function with an int* parameter receives an address and can read or write the caller's object through it. The pointed-to object must still be alive whenever the pointer is dereferenced.",
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\nvoid bump(int* target) {\n  *target += 1;\n}\nint main() {\n  int hits = 9;\n  bump(&hits);\n  std::cout << hits << "\\n";\n}',
        output: '10',
        explanation:
          'bump receives the address of hits and increments the int at that address.',
      },
      questions: [
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nvoid triple(int* p) {\n  *p = *p * 3;\n}\nint main() {\n  int v = 4;\n  triple(&v);\n  triple(&v);\n  std::cout << v << "\\n";\n}',
          ['12', '24', '4', '36'],
          3,
          'Each call triples the same v: 4, 12, 36.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\nint read(const int* p) {\n  return *p;\n}\nint main() {\n  int a = 7;\n  int b = 3;\n  std::cout << read(&a) - read(&b) << "\\n";\n}',
          ['4', '10', '-4', '73'],
          0,
          'read returns the pointed-to values, 7 and 3.',
        ),
        choose(
          'A pointer still holds the address of a local variable from a function that has returned. What happens if it is dereferenced?',
          [
            'It reads the last value stored there',
            'It reads 0',
            'Undefined behavior: that object no longer exists',
            "The compiler extends the local's lifetime",
          ],
          2,
          'The local was destroyed when its function returned; the address no longer names a live object.',
        ),
      ],
    },
  ],
  'cpp-references': [
    {
      title: "Return a reference to the caller's object",
      explanation: [
        "A function that returns int& gives back a reference, not a value. When it returns a reference parameter, the call names the caller's own variable, so it can even appear on the left of an assignment.",
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\nint& self(int& value) {\n  return value;\n}\nint main() {\n  int score = 4;\n  self(score) += 3;\n  std::cout << score << "\\n";\n}',
        output: '7',
        explanation:
          'self(score) names score itself, so adding 3 to the call changes score.',
      },
      questions: [
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint& alias_of(int& v) {\n  return v;\n}\nint main() {\n  int a = 1;\n  int& r = alias_of(a);\n  r = 20;\n  std::cout << a << "\\n";\n}',
          ['1', '20', '21', '0'],
          1,
          'The returned reference names a, so r is another name for a.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\nint copy_of(int& v) {\n  return v;\n}\nint main() {\n  int a = 1;\n  int r = copy_of(a);\n  r = 20;\n  std::cout << a << "\\n";\n}',
          ['20', '21', '1', '0'],
          2,
          'copy_of returns int, a copy of the value, so changing r leaves a alone.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\nint& alias_of(int& v) {\n  return v;\n}\nint main() {\n  int a = 5;\n  alias_of(alias_of(a)) *= 2;\n  std::cout << a << "\\n";\n}',
          ['5', '20', '25', '10'],
          3,
          'Each call passes the same reference through, so the multiplication changes a once.',
        ),
      ],
    },
    {
      title: 'Keep the returned reference or copy it',
      explanation: [
        'Storing a returned int& in an int& keeps an alias; storing it in a plain int copies the current value. The function decides what is returned, but the caller decides what to keep.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\nint& slot(int& v) {\n  return v;\n}\nint main() {\n  int level = 2;\n  int& live = slot(level);\n  int saved = slot(level);\n  level = 9;\n  std::cout << live << " " << saved << "\\n";\n}',
        output: '9 2',
        explanation:
          'live is a reference and sees the new 9; saved copied 2 before the change.',
      },
      questions: [
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint& slot(int& v) {\n  return v;\n}\nint main() {\n  int x = 3;\n  int copy = slot(x);\n  int& ref = slot(x);\n  ref += 1;\n  copy += 10;\n  std::cout << x << " " << copy << "\\n";\n}',
          ['14 13', '3 13', '4 4', '4 13'],
          3,
          'ref changes x to 4; copy is independent and becomes 13.',
        ),
        choose(
          'f returns int&. What is value after int value = f(x);?',
          [
            'Another name for x, bound by the call',
            'An independent int copied from x',
            'A pointer holding the address of x',
            'An int left uninitialized',
          ],
          1,
          'Initializing a plain int from a reference copies the referred value.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\nint& slot(int& v) {\n  return v;\n}\nint main() {\n  int a = 6;\n  slot(a) = 0;\n  std::cout << a << "\\n";\n}',
          ['6', '60', '0', '-6'],
          2,
          'slot(a) names a, so assigning 0 to the call assigns to a.',
        ),
      ],
    },
    {
      title: 'Never return a reference to a local',
      explanation: [
        'A returned reference is usable only while its object lives. A local variable, including a by-value parameter, is destroyed when the function returns, so a reference to it dangles. Return references only to objects the caller owns.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\nint& counter(int& storage) {\n  storage += 1;\n  return storage;\n}\nint main() {\n  int calls = 0;\n  counter(calls);\n  counter(calls) += 10;\n  std::cout << calls << "\\n";\n}',
        output: '12',
        explanation:
          "storage refers to main's calls, which outlives every use: two increments and the added 10 give 12.",
      },
      questions: [
        choose(
          'What is wrong with this function?',
          [
            'It returns a copy, so changes are lost',
            'Functions cannot return references',
            'local dies at return, so the reference dangles',
            'local must be declared const',
          ],
          2,
          'The caller would receive a reference to an object that no longer exists.',
          'int& make_value() {\n  int local = 5;\n  return local;\n}',
        ),
        choose(
          'Which function can safely return int&?',
          [
            'int& f() { int x = 1; return x; }',
            'int& f(int& x) { return x; }',
            'int& f(int x) { return x; }',
            'int& f() { int y = 2; int& r = y; return r; }',
          ],
          1,
          'Only the reference parameter names an object owned by the caller; the others refer to locals or a copy.',
        ),
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint& counter(int& storage) {\n  storage += 1;\n  return storage;\n}\nint main() {\n  int calls = 5;\n  int& r = counter(calls);\n  r *= 2;\n  std::cout << calls << "\\n";\n}',
          ['6', '10', '11', '12'],
          3,
          'counter makes calls 6 and returns a reference to it; doubling through r gives 12.',
        ),
      ],
    },
  ],
  'cpp-nullptr-guard': [
    {
      title: 'Represent "no object" with nullptr',
      explanation: [
        'A pointer that points to nothing holds nullptr. Comparing with nullptr tells whether an object is present. Dereferencing a null pointer is undefined behavior, so it must never happen.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\nint main() {\n  int* missing = nullptr;\n  int value = 4;\n  int* present = &value;\n  std::cout << (missing == nullptr) << (present == nullptr) << "\\n";\n}',
        output: '10',
        explanation:
          'missing holds nullptr; present holds the address of value.',
      },
      questions: [
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint main() {\n  int* p = nullptr;\n  int x = 3;\n  p = &x;\n  std::cout << (p != nullptr) << "\\n";\n}',
          ['0', '1', '3', 'nullptr'],
          1,
          'p was given the address of x, so it is no longer null.',
        ),
        choose(
          'p equals nullptr. What does evaluating *p do?',
          [
            'It yields 0',
            'It yields the last valid value',
            'It throws an exception',
            'It is undefined behavior',
          ],
          3,
          'There is no object to access, so the language gives the program no meaning.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  int* p = nullptr;\n  std::cout << (p == nullptr ? 1 : 2) << "\\n";\n}',
          ['2', '0', '1', 'nullptr'],
          2,
          'p is null, so the comparison is true and the first value is chosen.',
        ),
      ],
    },
    {
      title: 'Check before dereferencing',
      explanation: [
        'A function that accepts a pointer that may be null checks it first, for example p != nullptr ? *p : fallback. Only the selected operand is evaluated, so *p never runs for a null p.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\nint read_or(const int* p, int fallback) {\n  return p != nullptr ? *p : fallback;\n}\nint main() {\n  int x = 9;\n  std::cout << read_or(&x, -1) << " " << read_or(nullptr, -1) << "\\n";\n}',
        output: '9 -1',
        explanation:
          'The first call has a real address and reads 9; the second gets nullptr and returns the fallback.',
      },
      questions: [
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint read_or(const int* p, int fallback) {\n  return p != nullptr ? *p : fallback;\n}\nint main() {\n  int stock = 0;\n  std::cout << read_or(&stock, 50) << "\\n";\n}',
          ['50', '0', '-1', '1'],
          1,
          'The pointer is not null, so the stored 0 is read; the fallback is only for a missing object.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\nint read_or(const int* p, int fallback) {\n  return p != nullptr ? *p : fallback;\n}\nint main() {\n  std::cout << read_or(nullptr, 7) + read_or(nullptr, 3) << "\\n";\n}',
          ['0', '7', '3', '10'],
          3,
          'Both calls receive nullptr and return their fallbacks, 7 and 3.',
        ),
        choose(
          'p may be null. Which expression is safe?',
          [
            '*p != 0 ? *p : 0',
            '*p ? *p : 0',
            'p != nullptr ? *p : 0',
            '*p == nullptr ? 0 : *p',
          ],
          2,
          'Only this one tests the pointer before any dereference; the others dereference p first.',
        ),
      ],
    },
    {
      title: 'Use a pointer as a condition',
      explanation: [
        'A pointer converts to bool: true when it is non-null and false when it is nullptr. So p ? *p : -1 is a compact null check. The test is about the pointer, not about the value it points to.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\nint main() {\n  int value = 6;\n  int* p = &value;\n  std::cout << (p ? *p : -1) << "\\n";\n}',
        output: '6',
        explanation: 'p is non-null, so the condition is true and *p is read.',
      },
      questions: [
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint main() {\n  int* p = nullptr;\n  std::cout << (p ? *p : -1) << "\\n";\n}',
          ['0', '-1', '1', '6'],
          1,
          'A null pointer converts to false, so the fallback -1 is chosen.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  int a = 0;\n  int* p = &a;\n  std::cout << (p ? 10 : 20) << "\\n";\n}',
          ['20', '0', '10', '30'],
          2,
          'The pointer is non-null, so the condition is true even though the int it points to is 0.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  int a = 5;\n  int* p = &a;\n  p = nullptr;\n  std::cout << (p ? *p : 0) << " " << a << "\\n";\n}',
          ['5 5', '0 0', '5 0', '0 5'],
          3,
          'Setting p to nullptr changes the pointer only; a is still 5.',
        ),
      ],
    },
  ],
  'cpp-pointer-reseat': [
    {
      title: 'Point a pointer at a different object',
      explanation: [
        'Unlike a reference, a pointer variable can be assigned a new address at any time: p = &second; makes p point to second. Writes through p then go to the new object.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\nint main() {\n  int first = 1;\n  int second = 8;\n  int* p = &first;\n  p = &second;\n  std::cout << *p << "\\n";\n}',
        output: '8',
        explanation: 'After the assignment p holds the address of second.',
      },
      questions: [
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint main() {\n  int a = 3;\n  int b = 4;\n  int* p = &a;\n  *p = 10;\n  p = &b;\n  *p = 20;\n  std::cout << a << " " << b << "\\n";\n}',
          ['20 20', '10 4', '10 20', '3 20'],
          2,
          'The first write goes to a; after reseating, the second write goes to b.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  int a = 1;\n  int b = 2;\n  int* p = &a;\n  int* q = p;\n  p = &b;\n  std::cout << *q << *p << "\\n";\n}',
          ['22', '21', '11', '12'],
          3,
          'q copied the old address of a; only p was moved to b.',
        ),
        choose(
          'p is a pointer and r is a reference to a. How does p = &b; differ from r = b;?',
          [
            'Both make the name refer to b',
            "p = &b changes where p points; r = b copies b's value into a",
            'Both copy the value of b',
            'p = &b copies b into the object p pointed to',
          ],
          1,
          'Assigning a pointer changes the address it holds; assigning through a reference changes the referenced object.',
        ),
      ],
    },
    {
      title: 'Leave the old object alone when reseating',
      explanation: [
        "Moving a non-owning pointer to another object does nothing to the object it used to point at. The pointer only borrowed it; releasing or deleting it is not the pointer's job.",
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\nint main() {\n  int x = 5;\n  int y = 7;\n  int* p = &x;\n  p = &y;\n  *p += 1;\n  std::cout << x << " " << y << "\\n";\n}',
        output: '5 8',
        explanation: 'x keeps 5 after p moves away; only y is incremented.',
      },
      questions: [
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint main() {\n  int a = 1;\n  int b = 1;\n  int* p = &a;\n  *p += 1;\n  p = &b;\n  *p += 5;\n  std::cout << a << b << "\\n";\n}',
          ['66', '76', '26', '27'],
          2,
          'a received the first increment and keeps 2; b received the second and becomes 6.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  int a = 4;\n  int b = 6;\n  int* p = &a;\n  int* q = &b;\n  p = q;\n  *p = 0;\n  std::cout << a << " " << b << "\\n";\n}',
          ['0 6', '4 0', '0 0', '4 6'],
          1,
          'p = q copies the address of b, so the write goes to b and a is untouched.',
        ),
        choose(
          'A borrowed pointer is moved to point at another object. What should happen to the object it pointed at before?',
          [
            'It must be deleted',
            'It is reset to zero',
            'It is destroyed automatically',
            'Nothing; the pointer never owned it',
          ],
          3,
          'Reseating changes only the pointer; the old object belongs to whoever owns it.',
        ),
      ],
    },
    {
      title: 'Read through a pointer to const',
      explanation: [
        'const int* p can be pointed at different ints, but it cannot be used to change them: *p = 5; does not compile. The ints themselves may still change through their own names.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\nint main() {\n  int a = 2;\n  int b = 3;\n  const int* p = &a;\n  p = &b;\n  std::cout << *p << "\\n";\n}',
        output: '3',
        explanation:
          'Reseating a pointer to const is allowed; reading through it gives b.',
      },
      questions: [
        choose(
          'What happens when this program is compiled?',
          [
            'a becomes 5',
            'It does not compile: p points to const int',
            'p is moved to address 5',
            'It compiles but has no effect',
          ],
          1,
          'Through a pointer to const the pointed-to int can be read but not assigned.',
          '#include <iostream>\nint main() {\n  int a = 2;\n  const int* p = &a;\n  *p = 5;\n  std::cout << a << "\\n";\n}',
        ),
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint main() {\n  int a = 2;\n  const int* p = &a;\n  a = 9;\n  std::cout << *p << "\\n";\n}',
          ['2', '11', '0', '9'],
          3,
          'const restricts writes through p, not through a; p reads the new value 9.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\nint total(const int* x, const int* y) {\n  return *x + *y;\n}\nint main() {\n  int a = 4;\n  int b = 6;\n  const int* p = &a;\n  std::cout << total(p, &b);\n  p = &b;\n  std::cout << " " << total(p, &b) << "\\n";\n}',
          ['10 10', '10 12', '12 12', '4 6'],
          1,
          'First p points to a (4 + 6); after reseating it points to b (6 + 6).',
        ),
      ],
    },
  ],
  'cpp-pointers': [
    {
      title: 'Step a pointer through an array',
      explanation: [
        'a.data() returns a pointer to the first element of a std::array. Adding n to an element pointer moves it n elements forward (not n bytes), and ++p moves to the next element.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\n#include <array>\nint main() {\n  std::array<int, 3> a{10, 20, 30};\n  const int* p = a.data();\n  std::cout << *p << " " << *(p + 2) << "\\n";\n}',
        output: '10 30',
        explanation:
          'p points to element 0, and p + 2 points two elements later, to 30.',
      },
      questions: [
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <array>\nint main() {\n  std::array<int, 4> a{5, 6, 7, 8};\n  const int* p = a.data();\n  ++p;\n  std::cout << *p << "\\n";\n}',
          ['5', '6', '7', '9'],
          1,
          '++p moves one element forward, from 5 to 6.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\n#include <array>\nint main() {\n  std::array<int, 4> a{5, 6, 7, 8};\n  const int* p = a.data() + 3;\n  std::cout << *(p - 1) << "\\n";\n}',
          ['8', '6', '7', '5'],
          2,
          'p points to the last element, index 3; one element back is index 2, which holds 7.',
        ),
        choose(
          'p points to the first element of an int array. What does p + 2 point to?',
          [
            'The address two bytes later',
            'The value of element 0 plus 2',
            'Element 1',
            'The element at index 2',
          ],
          3,
          'Pointer arithmetic counts whole elements of the pointed-to type.',
        ),
      ],
    },
    {
      title: 'Stop at the one-past-the-end pointer',
      explanation: [
        'begin + size points just past the last element. That one-past-the-end pointer may be formed and compared, which makes it the natural stop marker for a loop, but it must never be dereferenced.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\n#include <array>\nint main() {\n  std::array<int, 3> a{1, 3, 5};\n  const int* begin = a.data();\n  const int* end = begin + a.size();\n  int total = 0;\n  for (const int* p = begin; p != end; ++p) total += *p;\n  std::cout << total << "\\n";\n}',
        output: '9',
        explanation:
          'p visits the three elements and stops when it reaches end, which is never read.',
      },
      questions: [
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <array>\nint main() {\n  std::array<int, 4> a{2, 2, 2, 2};\n  const int* end = a.data() + a.size();\n  int product = 1;\n  for (const int* p = a.data(); p != end; ++p) product *= *p;\n  std::cout << product << "\\n";\n}',
          ['8', '16', '2', '32'],
          1,
          'The loop multiplies all four elements: 2 * 2 * 2 * 2 is 16.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\n#include <array>\nint main() {\n  std::array<int, 5> a{};\n  const int* end = a.data() + a.size();\n  int steps = 0;\n  for (const int* p = a.data(); p != end; ++p) ++steps;\n  std::cout << steps << "\\n";\n}',
          ['4', '6', '0', '5'],
          3,
          'The pointer visits each of the 5 elements once before it equals end.',
        ),
        choose(
          'end is a.data() + a.size(). Which use of end is valid?',
          [
            'Reading *end as the last element',
            'Writing *end = 0',
            'Comparing p != end to stop a loop',
            'Reading *(end + 1)',
          ],
          2,
          'The one-past-the-end pointer is for comparisons only; dereferencing it is undefined.',
        ),
      ],
    },
    {
      title: 'Stay within the array',
      explanation: [
        'Pointer arithmetic is defined only from the first element through the one-past-the-end position of the same array. The last element is at begin + size - 1. Going outside that range, even without reading, is undefined behavior.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\n#include <array>\nint main() {\n  std::array<int, 4> a{4, 3, 2, 1};\n  const int* last = a.data() + a.size() - 1;\n  std::cout << *last << "\\n";\n}',
        output: '1',
        explanation: 'size - 1 is index 3, the last element.',
      },
      questions: [
        choose(
          'For std::array<int, 4> a, which pointer may be formed (though not dereferenced)?',
          ['a.data() + 5', 'a.data() - 1', 'a.data() + 4', 'a.data() + 10'],
          2,
          'a.data() + 4 is the one-past-the-end position; anything further out is undefined.',
        ),
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <array>\nint main() {\n  std::array<int, 5> a{1, 2, 3, 4, 5};\n  const int* p = a.data() + a.size();\n  --p;\n  --p;\n  std::cout << *p << "\\n";\n}',
          ['5', '3', '4', '2'],
          2,
          'p starts one past the end; two steps back reach index 3, which holds 4.',
        ),
        choose(
          'What happens if a loop dereferences the one-past-the-end pointer?',
          [
            'It reads the last element again',
            'It reads 0',
            'The loop stops automatically',
            'Undefined behavior',
          ],
          3,
          'There is no element at that position, so reading it has no defined result.',
        ),
      ],
    },
  ],
  'cpp-span-size': [
    {
      title: 'View existing elements with std::span',
      explanation: [
        'std::span<const int> from <span> refers to a contiguous run of ints owned by something else, such as a std::array. It stores only a pointer and a count, so making one copies no elements. size() and [] work as on the array.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\n#include <array>\n#include <span>\nint main() {\n  std::array<int, 4> a{2, 4, 6, 8};\n  std::span<const int> view = a;\n  std::cout << view.size() << " " << view[1] << "\\n";\n}',
        output: '4 4',
        explanation:
          'The span covers all four elements of a, and view[1] is the second one, 4.',
      },
      questions: [
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <array>\n#include <span>\nint main() {\n  std::array<int, 3> a{7, 8, 9};\n  std::span<const int> s = a;\n  std::cout << s[0] + s[2] << "\\n";\n}',
          ['16', '15', '24', '17'],
          0,
          'The span sees the array elements 7 and 9.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\n#include <array>\n#include <span>\nint main() {\n  std::array<int, 3> a{1, 2, 3};\n  std::span<int> s = a;\n  s[0] = 50;\n  std::cout << a[0] << "\\n";\n}',
          ['1', '51', '0', '50'],
          3,
          "A span of non-const int refers to the array's elements, so writing through it changes a.",
        ),
        choose(
          'What does a std::span<const int> store?',
          [
            'A copy of each element',
            'Only the first element',
            'A pointer to the elements and a count',
            'The elements together with a capacity',
          ],
          2,
          'A span is a lightweight view: where the elements start and how many there are.',
        ),
      ],
    },
    {
      title: 'Accept any contiguous ints with a span parameter',
      explanation: [
        "A function taking std::span<const int> accepts arrays of any length, and range-based for loops work on spans. The function reads the caller's elements directly.",
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\n#include <array>\n#include <span>\nint sum(std::span<const int> values) {\n  int total = 0;\n  for (int x : values) total += x;\n  return total;\n}\nint main() {\n  std::array<int, 2> small{1, 2};\n  std::array<int, 4> big{1, 2, 3, 4};\n  std::cout << sum(small) << " " << sum(big) << "\\n";\n}',
        output: '3 10',
        explanation:
          'One function serves both arrays, because each converts to a span of its own length.',
      },
      questions: [
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <array>\n#include <cstddef>\n#include <span>\nstd::size_t count(std::span<const int> values) {\n  return values.size();\n}\nint main() {\n  std::array<int, 6> a{};\n  std::cout << count(a) << "\\n";\n}',
          ['0', '6', '5', '24'],
          1,
          'The span covers all six elements; their values being 0 does not matter.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\n#include <array>\n#include <span>\nint sum(std::span<const int> values) {\n  int total = 0;\n  for (int x : values) total += x;\n  return total;\n}\nint main() {\n  std::array<int, 3> a{4, 5, 6};\n  std::cout << sum(a) << " " << sum({}) << "\\n";\n}',
          ['15 15', '0 0', '456 0', '15 0'],
          3,
          'The second call passes an empty span, so the loop adds nothing.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\n#include <array>\n#include <span>\nint first(std::span<const int> values) {\n  return values[0];\n}\nint main() {\n  std::array<int, 3> a{9, 8, 7};\n  a[0] = 1;\n  std::cout << first(a) << "\\n";\n}',
          ['9', '7', '1', '0'],
          2,
          'The span reads the array as it is at the call, after a[0] became 1.',
        ),
      ],
    },
    {
      title: 'Keep the elements alive while the span is used',
      explanation: [
        'A span owns nothing. It sees later changes to the elements, and it becomes dangling if the array it views is destroyed, for example when a function returns a span over its own local array.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\n#include <array>\n#include <span>\nint main() {\n  std::array<int, 3> a{1, 2, 3};\n  std::span<const int> view = a;\n  a[2] = 30;\n  int total = 0;\n  for (int x : view) total += x;\n  std::cout << total << "\\n";\n}',
        output: '33',
        explanation: 'The span reads the current elements 1, 2, and 30.',
      },
      questions: [
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <array>\n#include <span>\nint main() {\n  std::array<int, 2> a{5, 5};\n  std::span<const int> v = a;\n  a[0] = 0;\n  std::cout << v[0] + v[1] << "\\n";\n}',
          ['10', '0', '5', '55'],
          2,
          'v views a, so it sees the 0 written into a[0].',
        ),
        choose(
          'A function returns a std::span over a std::array that is a local variable of that function. What is wrong?',
          [
            'Nothing; the span keeps the array alive',
            'The array is destroyed at return, so the span dangles',
            'Spans cannot be returned from functions',
            'The span copies the array, wasting memory',
          ],
          1,
          'The span points into storage that no longer exists once the function returns.',
        ),
        choose(
          'Who owns the elements that a std::span refers to?',
          [
            'The span',
            'Every span that refers to them, jointly',
            'Nobody, because spans copy elements',
            'The array or container the span was made from',
          ],
          3,
          'The span borrows; the owner must outlive every use of the span.',
        ),
      ],
    },
  ],
  'cpp-span-subview': [
    {
      title: 'Take a tail with subspan(offset)',
      explanation: [
        's.subspan(offset) is a span of the elements from position offset to the end, so it has s.size() - offset elements. An offset equal to size() gives an empty span.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\n#include <array>\n#include <span>\nint main() {\n  std::array<int, 5> a{1, 2, 3, 4, 5};\n  std::span<const int> all = a;\n  std::span<const int> tail = all.subspan(2);\n  std::cout << tail.size() << " " << tail[0] << "\\n";\n}',
        output: '3 3',
        explanation:
          'Skipping two elements leaves 3, 4, 5: three elements starting with 3.',
      },
      questions: [
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <array>\n#include <span>\nint main() {\n  std::array<int, 4> a{10, 20, 30, 40};\n  std::span<const int> s = a;\n  std::span<const int> t = s.subspan(1);\n  std::cout << t[0] << " " << t.size() << "\\n";\n}',
          ['10 4', '20 4', '20 3', '30 3'],
          2,
          'The tail starts at 20 and has 4 - 1 = 3 elements.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\n#include <array>\n#include <span>\nint main() {\n  std::array<int, 3> a{1, 2, 3};\n  std::span<const int> s = a;\n  std::cout << s.subspan(3).size() << "\\n";\n}',
          ['0', '1', '3', '-1'],
          0,
          'An offset equal to the size is allowed and leaves no elements.',
        ),
        choose(
          'How many elements does s.subspan(k) contain when k <= s.size()?',
          ['k', 's.size()', 's.size() + k', 's.size() - k'],
          3,
          'The first k elements are skipped and the rest are kept.',
        ),
      ],
    },
    {
      title: 'Take a window with subspan(offset, count)',
      explanation: [
        's.subspan(offset, count) views count elements starting at offset. Like every span, it refers to the same storage: nothing is copied, and writes through a span of non-const elements reach the original array.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\n#include <array>\n#include <span>\nint main() {\n  std::array<int, 6> a{1, 2, 3, 4, 5, 6};\n  std::span<const int> s = a;\n  std::span<const int> window = s.subspan(2, 3);\n  int total = 0;\n  for (int x : window) total += x;\n  std::cout << total << "\\n";\n}',
        output: '12',
        explanation: 'The window holds 3, 4, and 5, which add to 12.',
      },
      questions: [
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <array>\n#include <span>\nint main() {\n  std::array<int, 4> a{9, 8, 7, 6};\n  std::span<const int> s = a;\n  std::span<const int> w = s.subspan(1, 2);\n  std::cout << w[0] << " " << w[1] << "\\n";\n}',
          ['9 8', '8 6', '7 6', '8 7'],
          3,
          'Two elements starting at index 1 are 8 and 7.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\n#include <array>\n#include <span>\nint main() {\n  std::array<int, 4> a{1, 1, 1, 1};\n  std::span<int> s = a;\n  std::span<int> mid = s.subspan(1, 2);\n  mid[0] = 5;\n  std::cout << a[1] << "\\n";\n}',
          ['1', '0', '5', '2'],
          2,
          'mid[0] is the same int as a[1], so the write changes the array.',
        ),
        choose(
          'Does taking a subspan copy elements?',
          [
            'Yes, into a new array',
            'Only when a count is given',
            'Only for spans of const elements',
            'No, it views part of the same storage',
          ],
          3,
          'A subspan is just a narrower view of the same elements.',
        ),
      ],
    },
    {
      title: 'Check the offset before calling subspan',
      explanation: [
        'Calling subspan with an offset larger than size() is undefined behavior; it does not clamp or throw. Compare the requested offset with size() first, and handle a bad request explicitly.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\n#include <array>\n#include <cstddef>\n#include <span>\nint main() {\n  std::array<int, 3> a{4, 5, 6};\n  std::span<const int> s = a;\n  std::size_t offset = 5;\n  if (offset > s.size()) std::cout << "bad offset\\n";\n  else std::cout << s.subspan(offset).size() << "\\n";\n}',
        output: 'bad offset',
        explanation:
          '5 is larger than the size 3, so the program reports it instead of calling subspan.',
      },
      questions: [
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <array>\n#include <cstddef>\n#include <span>\nint main() {\n  std::array<int, 3> a{4, 5, 6};\n  std::span<const int> s = a;\n  std::size_t offset = 1;\n  if (offset > s.size()) std::cout << "bad offset\\n";\n  else std::cout << s.subspan(offset).size() << "\\n";\n}',
          ['bad offset', '3', '2', '1'],
          2,
          'The offset is valid, and 3 - 1 elements remain.',
        ),
        choose(
          'What happens when s.subspan(offset) is called with offset > s.size()?',
          [
            'It returns an empty span',
            'It clamps offset to size()',
            'Undefined behavior',
            'It throws an exception',
          ],
          2,
          'subspan does not check its argument, so the caller must.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\n#include <cstddef>\n#include <span>\nint main() {\n  std::span<const int> empty;\n  std::size_t offset = 0;\n  if (offset > empty.size()) std::cout << "bad offset\\n";\n  else std::cout << empty.subspan(offset).size() << "\\n";\n}',
          ['0', 'bad offset', '1', '-1'],
          0,
          'An offset of 0 is valid even for an empty span, and the result is also empty.',
        ),
      ],
    },
  ],
  'cpp-string-view': [
    {
      title: 'View text without copying it',
      explanation: [
        'std::string_view from <string_view> refers to characters stored somewhere else, such as a string literal or a std::string, together with a length. Making one copies no characters, and size() and [] work as on a string.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\n#include <string_view>\nint main() {\n  std::string_view word = "lesson";\n  std::cout << word.size() << " " << word[0] << "\\n";\n}',
        output: '6 l',
        explanation:
          'The view covers the six characters of the literal, starting with l.',
      },
      questions: [
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <string_view>\nint main() {\n  std::string_view s = "C++20";\n  std::cout << s.size() << "\\n";\n}',
          ['4', '6', '5', '2'],
          2,
          "C, +, +, 2, and 0 are five characters; the literal's terminating null is not counted.",
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\n#include <string>\n#include <string_view>\nint main() {\n  std::string text = "hello";\n  std::string_view v = text;\n  std::cout << v[1] << v[4] << "\\n";\n}',
          ['ho', 'el', 'eo', 'lo'],
          2,
          'Index 1 is e and index 4 is o.',
        ),
        choose(
          'What does a std::string_view own?',
          [
            'A copy of the characters',
            'A null-terminated buffer of its own',
            'The std::string it was made from',
            'Nothing; it refers to characters stored elsewhere',
          ],
          3,
          'A view only borrows: it holds a pointer and a length.',
        ),
      ],
    },
    {
      title: 'Trust the stored length',
      explanation: [
        'A string_view knows its length, so it can cover part of a longer text or include \\0 characters, and it need not end with a null character. Use size(), never a scan for a terminator such as strlen.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\n#include <string_view>\nint main() {\n  std::string_view v("a\\0b", 3);\n  std::cout << v.size() << "\\n";\n}',
        output: '3',
        explanation:
          'The view was given length 3, so the embedded \\0 counts as one of its characters.',
      },
      questions: [
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <string_view>\nint main() {\n  std::string_view full = "abcdef";\n  std::string_view part(full.data(), 3);\n  std::cout << part << " " << part.size() << "\\n";\n}',
          ['abcdef 3', 'abc 6', 'abcdef 6', 'abc 3'],
          3,
          'part covers only the first 3 characters, and printing a view prints exactly those.',
        ),
        choose(
          'Why can strlen(view.data()) give the wrong length for a std::string_view?',
          [
            'strlen counts bytes, not characters',
            'data() returns a copy of the text',
            'The view need not end with a null character',
            'strlen does not accept pointers',
          ],
          2,
          "strlen searches for a terminator, but the view's length is stored separately.",
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\n#include <string_view>\nint main() {\n  std::string_view v("x\\0yz", 4);\n  std::cout << v.size() << "\\n";\n}',
          ['1', '3', '4', '2'],
          2,
          'The view has the length it was given, 4, including the \\0.',
        ),
      ],
    },
    {
      title: 'Narrow a view with substr',
      explanation: [
        'v.substr(pos, count) returns another string_view of count characters starting at pos; v.substr(pos) runs to the end. No characters are copied.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\n#include <string_view>\nint main() {\n  std::string_view date = "2026-10-02";\n  std::string_view year = date.substr(0, 4);\n  std::string_view day = date.substr(8);\n  std::cout << year << " " << day << "\\n";\n}',
        output: '2026 02',
        explanation:
          'year covers characters 0 through 3, and day covers everything from position 8.',
      },
      questions: [
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <string_view>\nint main() {\n  std::string_view s = "monday";\n  std::cout << s.substr(0, 3) << "\\n";\n}',
          ['mon', 'mond', 'day', 'onda'],
          0,
          'Three characters starting at position 0 are m, o, n.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\n#include <string_view>\nint main() {\n  std::string_view s = "lesson";\n  std::cout << s.substr(3) << " " << s.substr(3).size() << "\\n";\n}',
          ['sson 4', 'les 3', 'son 3', 'son 6'],
          2,
          'From position 3 to the end is son, three characters.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\n#include <string_view>\nint main() {\n  std::string_view s = "abcdef";\n  std::string_view mid = s.substr(2, 2);\n  std::cout << mid << mid.size() << "\\n";\n}',
          ['bc2', 'cde3', 'cd4', 'cd2'],
          3,
          'Two characters starting at position 2 are c and d.',
        ),
      ],
    },
  ],
  'cpp-views': [
    {
      title: 'Copy a view into an owning std::string',
      explanation: [
        'std::string owned(view); copies the viewed characters into a new string that owns them. From then on the string is independent of whatever the view referred to.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\n#include <string>\n#include <string_view>\nint main() {\n  std::string_view view = "label";\n  std::string owned(view);\n  std::cout << owned << " " << owned.size() << "\\n";\n}',
        output: 'label 5',
        explanation: 'owned holds its own copy of the five characters.',
      },
      questions: [
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <string>\n#include <string_view>\nint main() {\n  std::string original = "alpha";\n  std::string_view v = original;\n  std::string copy(v);\n  original = "beta";\n  std::cout << copy << "\\n";\n}',
          ['beta', 'alphabeta', 'alpha', 'al'],
          2,
          'copy took its own characters while original still said alpha.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\n#include <string>\n#include <string_view>\nint main() {\n  std::string_view v = "abcdef";\n  std::string part(v.substr(1, 3));\n  std::cout << part << part.size() << "\\n";\n}',
          ['bcd3', 'abc3', 'bcd6', 'bcde4'],
          0,
          'The view b, c, d is copied into a three-character string.',
        ),
        choose(
          'After std::string owned(view);, what happens to owned if the characters the view refers to change later?',
          [
            'owned changes along with them',
            'owned becomes an empty string',
            'owned keeps its own copy and is unaffected',
            'owned dangles like the view',
          ],
          2,
          'Constructing a std::string copies the characters into storage the string owns.',
        ),
      ],
    },
    {
      title: 'Return an owning string, not a view of a temporary',
      explanation: [
        'A view is only valid while its characters exist. A std::string temporary dies at the end of the full expression that created it, so a view initialized from one dangles. When text must outlive its source, keep or return a std::string.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\n#include <string>\n#include <string_view>\nstd::string make_label(std::string_view name) {\n  return std::string(name);\n}\nint main() {\n  std::string label = make_label("north");\n  std::cout << label << "\\n";\n}',
        output: 'north',
        explanation:
          'The function returns an owning copy, so label stays valid after the call.',
      },
      questions: [
        choose(
          'What is wrong with reading v after this line?',
          [
            'v copies the string, wasting memory',
            'The temporary string dies at the end of the statement, so v dangles',
            'string_view cannot be made from a std::string',
            'Nothing; v keeps the string alive',
          ],
          1,
          'A view does not extend the life of the string it refers to.',
          'std::string_view v = std::string("temp");',
        ),
        choose(
          'A function builds a local std::string and must give the text to its caller. What should it return?',
          [
            'A std::string_view of the local',
            "A pointer to the local's characters",
            'A reference to the local string',
            'A std::string',
          ],
          3,
          'Only a returned std::string owns its characters; the others would dangle once the local is destroyed.',
        ),
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <string>\n#include <string_view>\nstd::string keep(std::string_view v) {\n  return std::string(v);\n}\nint main() {\n  std::string a = keep("one");\n  std::string b = keep(a);\n  a = "two";\n  std::cout << b << "\\n";\n}',
          ['two', 'one', 'onetwo', 'o'],
          1,
          'b owns its own copy made while a said one.',
        ),
      ],
    },
  ],
  'cpp-duration-count': [
    {
      title: 'Make a duration and read its count',
      explanation: [
        '<chrono> provides duration types such as std::chrono::seconds and std::chrono::milliseconds. A duration stores a number of ticks of its unit, and count() returns that number. Durations of the same unit add and subtract like numbers.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\n#include <chrono>\nint main() {\n  std::chrono::milliseconds wait{250};\n  std::cout << wait.count() << "\\n";\n}',
        output: '250',
        explanation: 'wait holds 250 ticks of one millisecond each.',
      },
      questions: [
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <chrono>\nint main() {\n  std::chrono::seconds s{90};\n  std::cout << s.count() << "\\n";\n}',
          ['1', '90', '1.5', '90000'],
          1,
          "count() returns the ticks in the duration's own unit, seconds.",
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\n#include <chrono>\nint main() {\n  std::chrono::minutes m{3};\n  std::chrono::minutes more = m + std::chrono::minutes{2};\n  std::cout << more.count() << "\\n";\n}',
          ['300', '32', '5', '2'],
          2,
          'Adding two minute durations gives 5 minutes.',
        ),
        choose(
          'What does count() return for std::chrono::milliseconds d{1500};?',
          [
            '1.5, the value in seconds',
            '1, the whole seconds',
            '1500000, the microseconds',
            '1500, the number of millisecond ticks',
          ],
          3,
          "count() never converts; it reports the ticks of the duration's own unit.",
        ),
      ],
    },
    {
      title: 'Combine units without losing precision',
      explanation: [
        'Adding durations of different units produces the finer unit: seconds plus milliseconds is milliseconds. Converting to a finer unit is exact, so it happens implicitly.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\n#include <chrono>\nint main() {\n  std::chrono::milliseconds total = std::chrono::seconds{2} + std::chrono::milliseconds{300};\n  std::cout << total.count() << "\\n";\n}',
        output: '2300',
        explanation: '2 seconds are 2000 milliseconds, plus 300.',
      },
      questions: [
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <chrono>\nint main() {\n  std::chrono::milliseconds t = std::chrono::seconds{1} + std::chrono::milliseconds{1};\n  std::cout << t.count() << "\\n";\n}',
          ['2', '1.001', '11', '1001'],
          3,
          '1 second is 1000 milliseconds; adding 1 gives 1001.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\n#include <chrono>\nint main() {\n  std::chrono::seconds s = std::chrono::minutes{2};\n  std::cout << s.count() << "\\n";\n}',
          ['2', '0', '120', '7200'],
          2,
          'Two minutes convert exactly to 120 seconds.',
        ),
        choose(
          'Why is adding seconds.count() to millis.count() as plain numbers a bug?',
          [
            'count() values cannot be added together',
            'The sum is rounded to whole seconds',
            'The result is always zero',
            'The counts are in different units',
          ],
          3,
          'Plain numbers have lost their units; adding the durations themselves converts correctly.',
        ),
      ],
    },
    {
      title: 'Keep tick counts in long long',
      explanation: [
        'Tick counts grow quickly: one day is 86,400,000 milliseconds. The standard duration types use a wide signed integer, and long long, the widest standard integer type (64 bits here), is the natural place to keep a count. Durations may also be negative.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\n#include <chrono>\nint main() {\n  std::chrono::seconds day{86400};\n  std::chrono::milliseconds ms = day;\n  long long ticks = ms.count();\n  std::cout << ticks << "\\n";\n}',
        output: '86400000',
        explanation: 'One day converted to milliseconds is 86,400,000 ticks.',
      },
      questions: [
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <chrono>\nint main() {\n  std::chrono::hours h{2};\n  std::chrono::seconds s = h;\n  long long n = s.count();\n  std::cout << n << "\\n";\n}',
          ['120', '2', '7200', '720'],
          2,
          'Two hours are 7200 seconds.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\n#include <chrono>\nint main() {\n  std::chrono::milliseconds a{400};\n  std::chrono::milliseconds b{-150};\n  std::cout << (a + b).count() << "\\n";\n}',
          ['550', '-250', '400', '250'],
          3,
          'A negative duration subtracts: 400 + (-150) is 250.',
        ),
        choose(
          'Why is long long a good type for a millisecond count?',
          [
            'count() always returns a double',
            'Counts grow fast and can exceed a 32-bit int after a few weeks',
            'long long is required for negative durations',
            'int values cannot be printed',
          ],
          1,
          'About 2.1 billion milliseconds, under 25 days, already exceed a 32-bit int.',
        ),
      ],
    },
  ],
  'cpp-duration-cast': [
    {
      title: 'Convert to a coarser unit with duration_cast',
      explanation: [
        'Converting milliseconds to seconds can lose information, so it does not happen implicitly. std::chrono::duration_cast<std::chrono::seconds>(d) performs it explicitly and drops the fraction.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\n#include <chrono>\nint main() {\n  std::chrono::milliseconds ms{2700};\n  std::chrono::seconds s = std::chrono::duration_cast<std::chrono::seconds>(ms);\n  std::cout << s.count() << "\\n";\n}',
        output: '2',
        explanation:
          '2700 milliseconds are 2.7 seconds, and the cast keeps the whole 2.',
      },
      questions: [
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <chrono>\nint main() {\n  std::chrono::milliseconds ms{5999};\n  std::cout << std::chrono::duration_cast<std::chrono::seconds>(ms).count() << "\\n";\n}',
          ['6', '5', '5.999', '5999'],
          1,
          'The cast does not round: 5.999 seconds become 5.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\n#include <chrono>\nint main() {\n  std::chrono::seconds s{150};\n  std::cout << std::chrono::duration_cast<std::chrono::minutes>(s).count() << "\\n";\n}',
          ['2', '3', '2.5', '150'],
          0,
          '150 seconds are 2.5 minutes, and the cast keeps 2.',
        ),
        choose(
          'What happens when this code is compiled?',
          [
            's becomes 2 seconds, truncated',
            's becomes 3 seconds, rounded',
            's becomes 2.7 seconds, exactly',
            'It does not compile without duration_cast',
          ],
          3,
          'Implicit conversion is allowed only when it is exact, as when going to a finer unit.',
          'std::chrono::milliseconds ms{2700};\nstd::chrono::seconds s = ms;',
        ),
      ],
    },
    {
      title: 'Expect truncation toward zero',
      explanation: [
        'duration_cast to an integer-based unit truncates toward zero, just like integer division: -1500 milliseconds become -1 second, not -2.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\n#include <chrono>\nint main() {\n  std::chrono::milliseconds late{-1500};\n  std::cout << std::chrono::duration_cast<std::chrono::seconds>(late).count() << "\\n";\n}',
        output: '-1',
        explanation: '-1.5 seconds truncate toward zero to -1.',
      },
      questions: [
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <chrono>\nint main() {\n  std::chrono::milliseconds d{-2999};\n  std::cout << std::chrono::duration_cast<std::chrono::seconds>(d).count() << "\\n";\n}',
          ['-3', '-2.999', '-2', '2'],
          2,
          '-2.999 seconds truncate toward zero to -2.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\n#include <chrono>\nint main() {\n  std::chrono::seconds s{-90};\n  std::cout << std::chrono::duration_cast<std::chrono::minutes>(s).count() << "\\n";\n}',
          ['-1', '-2', '-1.5', '1'],
          0,
          '-1.5 minutes truncate toward zero to -1.',
        ),
        choose(
          'Which rounding does duration_cast use when converting to whole seconds?',
          [
            'To the nearest second',
            'Always down, toward negative infinity',
            'Toward zero, like integer division',
            'Always up',
          ],
          2,
          'The fraction is simply discarded.',
        ),
      ],
    },
    {
      title: 'Keep the remainder when it matters',
      explanation: [
        'To report whole seconds and leftover milliseconds, cast once and subtract: total - whole converts whole back to milliseconds exactly and leaves the remainder. Casting early and discarding the rest loses time.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\n#include <chrono>\nint main() {\n  std::chrono::milliseconds total{7250};\n  std::chrono::seconds whole = std::chrono::duration_cast<std::chrono::seconds>(total);\n  std::chrono::milliseconds rest = total - whole;\n  std::cout << whole.count() << " s " << rest.count() << " ms\\n";\n}',
        output: '7 s 250 ms',
        explanation: '7 whole seconds are 7000 milliseconds, leaving 250.',
      },
      questions: [
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <chrono>\nint main() {\n  std::chrono::milliseconds total{3999};\n  std::chrono::seconds whole = std::chrono::duration_cast<std::chrono::seconds>(total);\n  std::chrono::milliseconds rest = total - whole;\n  std::cout << whole.count() << " s " << rest.count() << " ms\\n";\n}',
          ['4 s 0 ms', '3 s 1 ms', '3 s 3999 ms', '3 s 999 ms'],
          3,
          'The cast keeps 3 seconds, and 3999 - 3000 leaves 999 milliseconds.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\n#include <chrono>\nint main() {\n  std::chrono::seconds total{125};\n  std::chrono::minutes m = std::chrono::duration_cast<std::chrono::minutes>(total);\n  std::chrono::seconds rest = total - m;\n  std::cout << m.count() << ":" << rest.count() << "\\n";\n}',
          ['2:05', '2:5', '2:125', '3:5'],
          1,
          'Two whole minutes leave 5 seconds, and count() prints 5 without a leading zero.',
        ),
        choose(
          'A report casts every duration to whole seconds before adding them up. What can go wrong?',
          [
            'duration_cast rounds up, so the total is too large',
            'Each cast drops its fraction, so the total can be too small',
            'Durations cannot be added after a cast',
            'Nothing; the total is exact',
          ],
          1,
          'Many dropped fractions add up; summing first and casting once loses at most one fraction.',
        ),
      ],
    },
  ],
  'cpp-time-points': [
    {
      title: 'Subtract time points to get a duration',
      explanation: [
        "A std::chrono::steady_clock::time_point marks an instant on that clock. Subtracting two of them gives the duration between them. Real programs read time points with now(); these examples build them at fixed offsets from the clock's starting point so their output is predictable.",
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\n#include <chrono>\nint main() {\n  std::chrono::steady_clock::time_point start{std::chrono::milliseconds{100}};\n  std::chrono::steady_clock::time_point end{std::chrono::milliseconds{145}};\n  std::cout << std::chrono::duration_cast<std::chrono::milliseconds>(end - start).count() << "\\n";\n}',
        output: '45',
        explanation:
          'The two instants are 45 milliseconds apart; the cast expresses the difference in milliseconds.',
      },
      questions: [
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <chrono>\nint main() {\n  std::chrono::steady_clock::time_point start{std::chrono::seconds{2}};\n  std::chrono::steady_clock::time_point end{std::chrono::seconds{5}};\n  std::cout << std::chrono::duration_cast<std::chrono::milliseconds>(end - start).count() << "\\n";\n}',
          ['3', '3000', '5000', '7000'],
          1,
          'The instants are 3 seconds apart, which is 3000 milliseconds.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\n#include <chrono>\nint main() {\n  std::chrono::steady_clock::time_point start{std::chrono::milliseconds{500}};\n  std::chrono::steady_clock::time_point end{std::chrono::milliseconds{200}};\n  std::cout << std::chrono::duration_cast<std::chrono::milliseconds>(end - start).count() << "\\n";\n}',
          ['300', '700', '0', '-300'],
          3,
          'end is earlier than start, so the difference is a negative duration.',
        ),
        choose(
          'What kind of value does end - start produce for two steady_clock time points?',
          [
            'Another time_point',
            'A plain long long',
            'A duration',
            'A double number of seconds',
          ],
          2,
          'The distance between two instants is a duration.',
        ),
      ],
    },
    {
      title: 'Move a time point by adding a duration',
      explanation: [
        "A time point plus or minus a duration is another time point, such as a deadline. time_since_epoch() gives the duration from the clock's starting point to the time point. Adding two time points does not compile, because instants cannot be added.",
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\n#include <chrono>\nint main() {\n  std::chrono::steady_clock::time_point start{std::chrono::seconds{10}};\n  std::chrono::steady_clock::time_point deadline = start + std::chrono::seconds{5};\n  std::cout << std::chrono::duration_cast<std::chrono::seconds>(deadline.time_since_epoch()).count() << "\\n";\n}',
        output: '15',
        explanation:
          'The deadline lies 5 seconds after an instant 10 seconds past the epoch.',
      },
      questions: [
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <chrono>\nint main() {\n  std::chrono::steady_clock::time_point start{std::chrono::milliseconds{1000}};\n  std::chrono::steady_clock::time_point later = start + std::chrono::milliseconds{250};\n  std::cout << std::chrono::duration_cast<std::chrono::milliseconds>(later.time_since_epoch()).count() << "\\n";\n}',
          ['250', '750', '1250', '1000'],
          2,
          'Moving 250 milliseconds past an instant at 1000 milliseconds gives 1250.',
        ),
        choose(
          'a and b are steady_clock time points and d is a duration. Which expression does not compile?',
          ['a - b', 'a + d', 'a - d', 'a + b'],
          3,
          'An instant plus a duration is meaningful; an instant plus an instant is not.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\n#include <chrono>\nint main() {\n  std::chrono::steady_clock::time_point start{std::chrono::seconds{20}};\n  std::chrono::steady_clock::time_point later = start + std::chrono::minutes{1};\n  std::cout << std::chrono::duration_cast<std::chrono::seconds>(later - start).count() << "\\n";\n}',
          ['60', '1', '80', '21'],
          0,
          'The two points are one minute apart, which is 60 seconds.',
        ),
      ],
    },
    {
      title: 'Express a difference in the unit you need',
      explanation: [
        'The same difference can be reported in several units: cast to seconds for whole seconds, or to milliseconds to keep more detail. Subtract time points only when both come from the same clock; each clock has its own starting point.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\n#include <chrono>\nint main() {\n  std::chrono::steady_clock::time_point a{std::chrono::milliseconds{1500}};\n  std::chrono::steady_clock::time_point b = a + std::chrono::milliseconds{2250};\n  std::cout << std::chrono::duration_cast<std::chrono::seconds>(b - a).count() << " " << std::chrono::duration_cast<std::chrono::milliseconds>(b - a).count() << "\\n";\n}',
        output: '2 2250',
        explanation:
          'The difference is 2250 milliseconds, which is 2 whole seconds.',
      },
      questions: [
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <chrono>\nint main() {\n  std::chrono::steady_clock::time_point a{std::chrono::milliseconds{3000}};\n  std::chrono::steady_clock::time_point b = a + std::chrono::milliseconds{999};\n  std::cout << std::chrono::duration_cast<std::chrono::seconds>(b - a).count() << " " << std::chrono::duration_cast<std::chrono::milliseconds>(b - a).count() << "\\n";\n}',
          ['1 999', '3 999', '0 3999', '0 999'],
          3,
          'The difference is 999 milliseconds, which is 0 whole seconds.',
        ),
        choose(
          'Why must both time points in end - start come from the same clock?',
          [
            'Only steady_clock time points can be subtracted',
            'Subtraction requires the two values to be equal',
            'Each clock counts from its own starting point',
            'The result would always be negative',
          ],
          2,
          'A difference is meaningful only when both instants are measured from the same origin; C++ does not even let the types mix.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\n#include <chrono>\nint main() {\n  std::chrono::steady_clock::time_point a{std::chrono::seconds{1}};\n  std::chrono::steady_clock::time_point b{std::chrono::milliseconds{1}};\n  std::cout << std::chrono::duration_cast<std::chrono::milliseconds>(a - b).count() << "\\n";\n}',
          ['0', '999', '1001', '-999'],
          1,
          'a is 1000 milliseconds past the epoch and b is 1, so they are 999 milliseconds apart.',
        ),
      ],
    },
  ],
  'cpp-chrono': [
    {
      title: 'Read steady_clock::now() and compare readings',
      explanation: [
        'std::chrono::steady_clock::now() returns the current time point. Its value changes from run to run, so programs compare or subtract readings instead of printing them. steady_clock::is_steady is true: its readings never decrease.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\n#include <chrono>\nint main() {\n  std::chrono::steady_clock::time_point first = std::chrono::steady_clock::now();\n  std::chrono::steady_clock::time_point second = std::chrono::steady_clock::now();\n  std::cout << (second >= first) << "\\n";\n}',
        output: '1',
        explanation:
          'The second reading is taken later on a clock that never goes backward, so it is not earlier.',
      },
      questions: [
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <chrono>\nint main() {\n  std::chrono::steady_clock::time_point a = std::chrono::steady_clock::now();\n  std::chrono::steady_clock::time_point b = std::chrono::steady_clock::now();\n  std::cout << (b - a >= std::chrono::nanoseconds{0}) << "\\n";\n}',
          ['0', '1', '-1', 'It varies'],
          1,
          'A later steady_clock reading minus an earlier one is never negative.',
        ),
        choose(
          'Why do these lessons never print the value of steady_clock::now() itself?',
          [
            'It is always 0 at startup',
            'Printing it resets the clock',
            'It differs on every run of the program',
            'It is measured in an unknown unit',
          ],
          2,
          'Only relationships between readings, such as their order or difference, are reproducible.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\n#include <chrono>\nint main() {\n  std::cout << std::chrono::steady_clock::is_steady << "\\n";\n}',
          ['0', 'true', 'steady', '1'],
          3,
          'is_steady is a bool constant, and a true bool prints as 1.',
        ),
      ],
    },
    {
      title: 'Choose steady_clock for intervals',
      explanation: [
        'system_clock follows the wall clock, which can be adjusted forward or backward, for example when the computer synchronizes its time. An interval measured with it can come out negative or too large. steady_clock is monotonic, so it is the clock for measuring how long something took.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\n#include <chrono>\nint main() {\n  std::chrono::steady_clock::time_point start = std::chrono::steady_clock::now();\n  long long work = 1;\n  work = work * 1000 + 7;\n  std::chrono::steady_clock::time_point end = std::chrono::steady_clock::now();\n  std::cout << (end - start >= std::chrono::steady_clock::duration::zero()) << " " << work << "\\n";\n}',
        output: '1 1007',
        explanation:
          'The measured interval is never negative on steady_clock, whatever happens to the wall clock.',
      },
      questions: [
        choose(
          'A program times an operation with system_clock and sometimes gets a negative duration. Why?',
          [
            'Subtracting time points is unreliable on every clock',
            'system_clock follows the wall clock, which can be set backward',
            'Durations overflow after one second',
            'The operation finished before it started',
          ],
          1,
          'Adjusting the wall clock between the readings moves system_clock, not the operation.',
        ),
        choose(
          'What does steady_clock guarantee that system_clock does not?',
          [
            'Its readings match the time of day',
            'It has nanosecond precision',
            'It starts at zero when the program starts',
            'Its readings never decrease',
          ],
          3,
          'Monotonic readings are exactly what interval measurement needs.',
        ),
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <chrono>\nint main() {\n  std::chrono::steady_clock::time_point a = std::chrono::steady_clock::now();\n  std::chrono::steady_clock::time_point b = a + std::chrono::seconds{2};\n  std::cout << (b > a) << (b - a == std::chrono::seconds{2}) << "\\n";\n}',
          ['10', '01', '11', '00'],
          2,
          'Whatever a is, b lies exactly 2 seconds after it.',
        ),
      ],
    },
    {
      title: 'Report an interval with an explicit unit',
      explanation: [
        'Before printing an interval, cast the difference to the unit you want and print the unit next to the number. A bare count() hides whether it means seconds, milliseconds, or clock ticks.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\n#include <chrono>\nint main() {\n  std::chrono::steady_clock::time_point start{std::chrono::microseconds{2000}};\n  std::chrono::steady_clock::time_point end{std::chrono::microseconds{5750}};\n  std::cout << std::chrono::duration_cast<std::chrono::milliseconds>(end - start).count() << " ms\\n";\n}',
        output: '3 ms',
        explanation:
          'The interval is 3750 microseconds, which is 3 whole milliseconds.',
      },
      questions: [
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <chrono>\nint main() {\n  std::chrono::steady_clock::time_point start{std::chrono::microseconds{2000}};\n  std::chrono::steady_clock::time_point end{std::chrono::microseconds{5750}};\n  std::cout << std::chrono::duration_cast<std::chrono::microseconds>(end - start).count() << " us\\n";\n}',
          ['3 us', '3750 us', '3.75 us', '5750 us'],
          1,
          'In microseconds the full interval, 3750, is kept.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\n#include <chrono>\nint main() {\n  std::chrono::steady_clock::time_point start{std::chrono::seconds{10}};\n  std::chrono::steady_clock::time_point end = start + std::chrono::milliseconds{1500};\n  std::cout << std::chrono::duration_cast<std::chrono::seconds>(end - start).count() << " s\\n";\n}',
          ['2 s', '1.5 s', '1500 s', '1 s'],
          3,
          'Casting 1.5 seconds to whole seconds truncates to 1.',
        ),
        choose(
          'A log line prints elapsed.count() with no unit. What is the problem?',
          [
            'count() is always in nanoseconds',
            'count() rounds the value',
            'A reader cannot tell what unit the number is in',
            'Nothing, because count() is in seconds',
          ],
          2,
          'The unit belongs to the duration type, which the printed number no longer shows.',
        ),
      ],
    },
  ],
  'cpp-aggregate-init': [
    {
      title: 'Fill members in declaration order with braces',
      explanation: [
        'A struct groups named members. For a simple struct with public members, Quote q{10, 3}; gives the values to the members in the order they are declared, and q.price reads a member.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\nstruct Quote {\n  int price;\n  int size;\n};\nint main() {\n  Quote q{10, 3};\n  std::cout << q.price << " " << q.size << "\\n";\n}',
        output: '10 3',
        explanation:
          'price is declared first, so it receives 10; size receives 3.',
      },
      questions: [
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nstruct Point {\n  int x;\n  int y;\n};\nint main() {\n  Point p{4, -2};\n  std::cout << p.y << " " << p.x << "\\n";\n}',
          ['4 -2', '-2 4', '-2 -2', '4 4'],
          1,
          'x is 4 and y is -2; the program prints y first.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\nstruct Size {\n  int width;\n  int height;\n};\nint main() {\n  Size s{3, 5};\n  std::cout << s.width * s.height << "\\n";\n}',
          ['8', '35', '53', '15'],
          3,
          'The members are 3 and 5, and their product is 15.',
        ),
        choose(
          'Given struct Item { int id; int qty; };, which member holds 2 after Item it{7, 2};?',
          [
            'id',
            'Both of them',
            'qty',
            'Neither; braces match members by name',
          ],
          2,
          'Values are matched to members by declaration order: id gets 7 and qty gets 2.',
        ),
      ],
    },
    {
      title: 'Expect zero for members without a value',
      explanation: [
        'Members left out of a brace list are set to zero, and Stats s{}; zeroes every member. A struct declared with no initializer at all, Stats s;, leaves int members indeterminate, so they must not be read before being assigned.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\nstruct Counter {\n  int hits;\n  int misses;\n};\nint main() {\n  Counter c{5};\n  std::cout << c.hits << " " << c.misses << "\\n";\n}',
        output: '5 0',
        explanation: 'Only hits was given a value; misses starts at 0.',
      },
      questions: [
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nstruct Totals {\n  int a;\n  int b;\n  int c;\n};\nint main() {\n  Totals t{1, 2};\n  std::cout << t.a + t.b + t.c << "\\n";\n}',
          ['3', '6', '2', '0'],
          0,
          'c was not given a value, so it is 0, and the sum is 1 + 2 + 0.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\nstruct Stats {\n  int count;\n  int sum;\n};\nint main() {\n  Stats s{};\n  s.count += 1;\n  std::cout << s.count << s.sum << "\\n";\n}',
          ['11', '00', '10', '1'],
          2,
          'Empty braces zero both members; then count becomes 1.',
        ),
        choose(
          'struct Pair { int a; int b; }; is declared inside main as Pair p; with no braces. What is p.a?',
          [
            '0, like a member left out of a brace list',
            '1',
            'The same value as p.b',
            'An indeterminate value that must not be read',
          ],
          3,
          'Without any initializer, int members are not set, so reading them is an error.',
        ),
      ],
    },
    {
      title: 'Copy structs and pass them by value',
      explanation: [
        'Copying a struct copies every member, and the copy is independent. A struct can be passed to and returned from functions by value like an int.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\nstruct Quote {\n  int price;\n  int size;\n};\nint notional(Quote q) {\n  return q.price * q.size;\n}\nint main() {\n  Quote q{10, 3};\n  Quote copy = q;\n  copy.size = 5;\n  std::cout << notional(q) << " " << notional(copy) << "\\n";\n}',
        output: '30 50',
        explanation:
          'copy starts with the same members, but changing its size leaves q unchanged.',
      },
      questions: [
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nstruct P {\n  int x;\n  int y;\n};\nint main() {\n  P a{1, 2};\n  P b = a;\n  b.x = 9;\n  std::cout << a.x << b.x << "\\n";\n}',
          ['99', '11', '19', '91'],
          2,
          'b is an independent copy, so only b.x becomes 9.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\nstruct Range {\n  int low;\n  int high;\n};\nRange make(int a, int b) {\n  return Range{a, b};\n}\nint width(Range r) {\n  return r.high - r.low;\n}\nint main() {\n  std::cout << width(make(3, 10)) << "\\n";\n}',
          ['7', '13', '-7', '30'],
          0,
          'make builds the struct {3, 10}, and width returns 10 - 3.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\nstruct Box {\n  int v;\n};\nint bump(Box b) {\n  b.v += 1;\n  return b.v;\n}\nint main() {\n  Box box{4};\n  int r = bump(box);\n  std::cout << r << box.v << "\\n";\n}',
          ['55', '44', '45', '54'],
          3,
          "bump changes its own copy and returns 5; the caller's box keeps 4.",
        ),
      ],
    },
  ],
  'cpp-constructor-init': [
    {
      title: 'Initialize members in a constructor',
      explanation: [
        'A constructor is a member function named after the struct that runs when an object is created. Holder(int x) : value(x) {} uses a member initializer list to initialize value from x. explicit stops the constructor from being used for silent conversions.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\nstruct Holder {\n  int value;\n  explicit Holder(int x) : value(x) {}\n};\nint main() {\n  Holder h(11);\n  std::cout << h.value << "\\n";\n}',
        output: '11',
        explanation:
          'Creating h runs the constructor with x = 11, which initializes value.',
      },
      questions: [
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nstruct Temp {\n  int celsius;\n  explicit Temp(int c) : celsius(c) {}\n};\nint main() {\n  Temp t(-4);\n  std::cout << t.celsius + 4 << "\\n";\n}',
          ['-4', '0', '4', '-8'],
          1,
          'celsius is initialized to -4, and adding 4 gives 0.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\nstruct Scaled {\n  int value;\n  explicit Scaled(int x) : value(x * 10) {}\n};\nint main() {\n  Scaled s(3);\n  std::cout << s.value << "\\n";\n}',
          ['3', '10', '13', '30'],
          3,
          'The initializer may be any expression: value starts as 3 * 10.',
        ),
        choose(
          'What does : value(x) do in Holder(int x) : value(x) {}?',
          [
            'Calls a function named value',
            'Assigns x after the body has run',
            'Initializes the member value from x before the body runs',
            'Declares a new local variable named value',
          ],
          2,
          'Entries in the member initializer list construct the members.',
        ),
      ],
    },
    {
      title: 'Know that initializers run before the body',
      explanation: [
        'Every member is initialized before the constructor body starts, so the body already sees the initialized values and can adjust them.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\nstruct Logged {\n  int value;\n  explicit Logged(int x) : value(x) {\n    std::cout << "body sees " << value << "\\n";\n  }\n};\nint main() {\n  Logged item(7);\n  std::cout << item.value << "\\n";\n}',
        output: 'body sees 7\n7',
        explanation: 'value is already 7 when the body prints it.',
      },
      questions: [
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nstruct Account {\n  int balance;\n  explicit Account(int start) : balance(start) {\n    balance += 100;\n  }\n};\nint main() {\n  Account a(5);\n  std::cout << a.balance << "\\n";\n}',
          ['5', '100', '105', '0'],
          2,
          'balance starts at 5 from the initializer, and the body adds 100.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\nstruct Doubler {\n  int v;\n  explicit Doubler(int x) : v(x) {\n    v = v * 2;\n  }\n};\nint main() {\n  Doubler d(6);\n  std::cout << d.v << "\\n";\n}',
          ['12', '6', '24', '0'],
          0,
          'v is 6 when the body starts, and the body doubles it.',
        ),
        choose(
          'When is a member that appears in the initializer list constructed?',
          [
            'After the constructor body finishes',
            'Only when it is first read',
            'When main starts',
            'Before the constructor body runs',
          ],
          3,
          'All members are initialized first; then the body runs.',
        ),
      ],
    },
    {
      title: 'Initialize members in declaration order',
      explanation: [
        'Members are always initialized in the order they are declared in the struct, whatever order the initializer list is written in. When one member is computed from another, declare the one it depends on first.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\nstruct Span {\n  int length;\n  int end;\n  Span(int start, int len) : length(len), end(start + length) {}\n};\nint main() {\n  Span s(10, 4);\n  std::cout << s.end << "\\n";\n}',
        output: '14',
        explanation:
          'length is declared first, so it already holds 4 when end is computed as 10 + 4.',
      },
      questions: [
        choose(
          'What is wrong with this struct?',
          [
            'Members cannot be initialized from other members',
            'end is declared first, so it reads length before length is initialized',
            'Nothing, because the initializer list order is used',
            'length must be listed first in the initializer list',
          ],
          1,
          'Declaration order wins: end is initialized first and reads an uninitialized length.',
          'struct Bad {\n  int end;\n  int length;\n  Bad(int start, int len) : length(len), end(start + length) {}\n};',
        ),
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nstruct Area {\n  int w;\n  int h;\n  int area;\n  Area(int a, int b) : w(a), h(b), area(w * h) {}\n};\nint main() {\n  Area x(3, 4);\n  std::cout << x.area << "\\n";\n}',
          ['7', '0', '12', '34'],
          2,
          'w and h are declared before area, so they hold 3 and 4 when area is computed.',
        ),
        choose(
          "In what order are a struct's members initialized?",
          [
            'The order of the initializer list',
            'Alphabetical order',
            'Reverse declaration order',
            'The order they are declared in the struct',
          ],
          3,
          'The initializer list order does not change it; compilers warn when the two differ.',
        ),
      ],
    },
  ],
  'cpp-destructor-scope': [
    {
      title: 'See a destructor run at scope exit',
      explanation: [
        'A destructor, written ~Name(), runs automatically when an object is destroyed. For a local object that happens when control leaves the block { } that declared it.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\nstruct Note {\n  ~Note() { std::cout << "closed\\n"; }\n};\nint main() {\n  {\n    Note n;\n    std::cout << "inside\\n";\n  }\n  std::cout << "after\\n";\n}',
        output: 'inside\nclosed\nafter',
        explanation:
          'n is destroyed at the closing brace of its block, before after is printed.',
      },
      questions: [
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nstruct Bell {\n  ~Bell() { std::cout << "ring\\n"; }\n};\nint main() {\n  std::cout << "start\\n";\n  {\n    Bell b;\n  }\n  std::cout << "end\\n";\n}',
          [
            'start\nend\nring',
            'start\nring\nend',
            'ring\nstart\nend',
            'start\nend',
          ],
          1,
          'b lives only inside the inner block, so ring appears before end.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\nstruct Bell {\n  ~Bell() { std::cout << "ring\\n"; }\n};\nint main() {\n  Bell a;\n  std::cout << "body\\n";\n}',
          ['ring\nbody', 'body', 'body\nring', 'ring'],
          2,
          "a is destroyed when main's body ends, after body is printed.",
        ),
        choose(
          "When does a local object's destructor run?",
          [
            'When delete is called on it',
            'When the program ends, for every object',
            'Only if the struct also has a constructor',
            'When control leaves the block that declared it',
          ],
          3,
          'Local objects are destroyed automatically at the end of their scope.',
        ),
      ],
    },
    {
      title: 'Record cleanup through a reference member',
      explanation: [
        'A struct can hold a reference to an outside variable, for example int& released;, and its destructor can update that variable. This makes the moment of destruction visible to the rest of the program.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\nstruct Guard {\n  int& released;\n  ~Guard() { ++released; }\n};\nint main() {\n  int released = 0;\n  {\n    Guard g{released};\n    std::cout << released << " ";\n  }\n  std::cout << released << "\\n";\n}',
        output: '0 1',
        explanation:
          'Inside the block the guard is still alive; leaving the block runs its destructor.',
      },
      questions: [
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nstruct Counter {\n  int& count;\n  ~Counter() { count += 10; }\n};\nint main() {\n  int total = 1;\n  {\n    Counter c{total};\n    total += 1;\n  }\n  std::cout << total << "\\n";\n}',
          ['2', '11', '1', '12'],
          3,
          'total becomes 2 inside the block, and the destructor adds 10 at its end.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\nstruct Guard {\n  int& released;\n  ~Guard() { ++released; }\n};\nint main() {\n  int n = 0;\n  {\n    Guard a{n};\n  }\n  {\n    Guard b{n};\n  }\n  std::cout << n << "\\n";\n}',
          ['1', '2', '0', '3'],
          1,
          'Each guard is destroyed at the end of its own block, so n is incremented twice.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\nstruct Guard {\n  int& released;\n  ~Guard() { ++released; }\n};\nint main() {\n  int n = 0;\n  {\n    Guard a{n};\n    std::cout << n;\n  }\n  std::cout << n << "\\n";\n}',
          ['11', '00', '01', '10'],
          2,
          'n is still 0 while the guard lives and becomes 1 when the block ends.',
        ),
      ],
    },
    {
      title: 'Let scope exit do the destroying',
      explanation: [
        'Each block destroys its own locals when it ends, innermost block first. Never call a destructor by hand on a local: scope exit would destroy the object a second time.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\nstruct Tag {\n  int id;\n  ~Tag() { std::cout << "end " << id << "\\n"; }\n};\nint main() {\n  Tag outer{1};\n  {\n    Tag inner{2};\n  }\n  std::cout << "between\\n";\n}',
        output: 'end 2\nbetween\nend 1',
        explanation:
          'inner dies at the end of its block; outer lives until the end of main.',
      },
      questions: [
        choose(
          'Code calls guard.~Guard() explicitly, and then the guard leaves its scope. What happens?',
          [
            'The second destruction is skipped automatically',
            'The explicit call is ignored',
            'The object is destroyed twice, which is undefined behavior',
            'The object is destroyed once, at the explicit call',
          ],
          2,
          'Scope exit always destroys the object, so a manual call means a second destruction.',
        ),
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nstruct Tag {\n  int id;\n  ~Tag() { std::cout << "end " << id << "\\n"; }\n};\nint main() {\n  Tag a{1};\n  {\n    Tag b{2};\n    {\n      Tag c{3};\n    }\n  }\n  std::cout << "x\\n";\n}',
          [
            'end 1\nend 2\nend 3\nx',
            'end 3\nend 2\nx\nend 1',
            'x\nend 3\nend 2\nend 1',
            'end 3\nx\nend 2\nend 1',
          ],
          1,
          'c and b end with their blocks, innermost first; a lasts until main ends.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\nstruct Tag {\n  int id;\n  ~Tag() { std::cout << "end " << id << "\\n"; }\n};\nint main() {\n  Tag outer{5};\n  {\n    Tag inner{6};\n    std::cout << "in\\n";\n  }\n}',
          [
            'in\nend 6\nend 5',
            'in\nend 5\nend 6',
            'end 6\nin\nend 5',
            'in\nend 6',
          ],
          0,
          'in is printed while both live; the inner block ends first, then main.',
        ),
      ],
    },
  ],
  'cpp-lifetime': [
    {
      title: 'Destroy locals in reverse order',
      explanation: [
        'Objects in one scope are destroyed in the reverse of the order they were constructed: the last one declared goes first. A later object may depend on an earlier one, so the earlier one must still exist while the later one is torn down.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\nstruct Tag {\n  int id;\n  ~Tag() { std::cout << id; }\n};\nint main() {\n  {\n    Tag a{1};\n    Tag b{2};\n    Tag c{3};\n  }\n  std::cout << "\\n";\n}',
        output: '321',
        explanation: 'Construction went 1, 2, 3, so destruction goes 3, 2, 1.',
      },
      questions: [
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nstruct Tag {\n  int id;\n  ~Tag() { std::cout << id; }\n};\nint main() {\n  {\n    Tag x{7};\n    Tag y{8};\n  }\n  std::cout << "\\n";\n}',
          ['78', '87', '7', '8'],
          1,
          'y was constructed last, so it is destroyed first.',
        ),
        choose(
          'Why are locals destroyed in the reverse order of construction?',
          [
            'The order is chosen at random by the compiler',
            'A later object may depend on an earlier one, which must outlive it',
            'The compiler sorts the objects by their size',
            'So that output appears in reverse order',
          ],
          1,
          'Reverse order guarantees that anything an object was built on still exists when it is destroyed.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\nstruct Tracker {\n  int& log;\n  int digit;\n  ~Tracker() { log = log * 10 + digit; }\n};\nint main() {\n  int log = 0;\n  {\n    Tracker first{log, 1};\n    Tracker second{log, 2};\n  }\n  std::cout << log << "\\n";\n}',
          ['12', '3', '0', '21'],
          3,
          'second is destroyed first and records 2; then first appends 1.',
        ),
      ],
    },
    {
      title: 'Follow destruction through nested blocks',
      explanation: [
        'A nested block destroys its own locals when it ends, before the enclosing block continues. Objects declared after that inner block are destroyed, in reverse order, together with the rest of the outer block.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\nstruct Tag {\n  int id;\n  ~Tag() { std::cout << id; }\n};\nint main() {\n  {\n    Tag a{1};\n    {\n      Tag b{2};\n    }\n    Tag c{3};\n  }\n  std::cout << "\\n";\n}',
        output: '231',
        explanation:
          "b ends with the inner block. At the outer block's end, c (declared last) goes before a.",
      },
      questions: [
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nstruct Tag {\n  int id;\n  ~Tag() { std::cout << id; }\n};\nint main() {\n  {\n    {\n      Tag a{1};\n    }\n    Tag b{2};\n    Tag c{3};\n  }\n  std::cout << "\\n";\n}',
          ['132', '321', '123', '312'],
          0,
          'a ends with its own block first; then c and b go in reverse order.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\nstruct Tracker {\n  int& log;\n  int digit;\n  ~Tracker() { log = log * 10 + digit; }\n};\nint main() {\n  int log = 0;\n  {\n    Tracker a{log, 4};\n    {\n      Tracker b{log, 5};\n    }\n    Tracker c{log, 6};\n  }\n  std::cout << log << "\\n";\n}',
          ['456', '654', '564', '546'],
          2,
          'b is recorded first, then c, then a.',
        ),
        choose(
          'Objects a, b, and c are declared in that order in one block. Which is destroyed first?',
          ['a', 'b', 'All of them at the same moment', 'c'],
          3,
          'The last one constructed is the first one destroyed.',
        ),
      ],
    },
    {
      title: 'Declare an owner before its borrowers',
      explanation: [
        "If one object's destructor uses another object, that other object must be declared first in the same scope, so that it is destroyed later. Declaring the borrower first would let the owner die while the borrower still needs it.",
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\nstruct Log {\n  int lines;\n};\nstruct Writer {\n  Log& log;\n  ~Writer() { log.lines += 1; }\n};\nint main() {\n  Log log{0};\n  {\n    Writer w{log};\n  }\n  std::cout << log.lines << "\\n";\n}',
        output: '1',
        explanation:
          "log outlives the writer, so the writer's destructor can safely record a line.",
      },
      questions: [
        choose(
          "Writer's destructor writes to a Log through a reference. Which declaration order in the same block is safe?",
          [
            'Writer first, then Log',
            'Log first, then Writer',
            'Either order works',
            'Neither, because references cannot be members',
          ],
          1,
          'The Log must be destroyed after the Writer, so it is declared before it.',
        ),
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nstruct Log {\n  int lines;\n};\nstruct Writer {\n  Log& log;\n  int n;\n  ~Writer() { log.lines += n; }\n};\nint main() {\n  Log log{0};\n  {\n    Writer a{log, 1};\n    Writer b{log, 10};\n  }\n  std::cout << log.lines << "\\n";\n}',
          ['1', '10', '11', '0'],
          2,
          'Both writers record their amounts when the block ends: 10 + 1.',
        ),
        choose(
          'Why is it a bug to declare a borrower before the object it borrows in the same block?',
          [
            'The borrower cannot be constructed',
            'References must always be declared last',
            'It wastes memory on an extra copy',
            'The owner dies first while the borrower still needs it',
          ],
          3,
          "Reverse destruction order would end the owner's lifetime while the borrower still refers to it.",
        ),
      ],
    },
  ],
  'cpp-member-functions': [
    {
      title: 'Call a member function on an object',
      explanation: [
        "A function declared inside a struct is a member function. It is called on one object, as c.add(5), and inside it a bare member name such as count means that object's member.",
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\nstruct Counter {\n  int count;\n  void add(int amount) { count += amount; }\n};\nint main() {\n  Counter c{0};\n  c.add(5);\n  c.add(2);\n  std::cout << c.count << "\\n";\n}',
        output: '7',
        explanation: "Each call adds to c's own count: 0 + 5 + 2.",
      },
      questions: [
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nstruct Wallet {\n  int cash;\n  void spend(int amount) { cash -= amount; }\n};\nint main() {\n  Wallet w{20};\n  w.spend(5);\n  w.spend(5);\n  std::cout << w.cash << "\\n";\n}',
          ['15', '10', '20', '5'],
          1,
          "Two calls each subtract 5 from w's cash.",
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\nstruct Rect {\n  int w;\n  int h;\n  int area() { return w * h; }\n};\nint main() {\n  Rect r{3, 4};\n  std::cout << r.area() << "\\n";\n}',
          ['7', '34', '0', '12'],
          3,
          "area uses r's members w and h.",
        ),
        choose(
          'Inside void add(int amount) { count += amount; }, which count changes?',
          [
            'A global variable named count',
            "Every Counter object's count member",
            'The count member of the object add was called on',
            'A local copy of count inside add',
          ],
          2,
          'A member name inside a member function refers to the member of the object the call is made on.',
        ),
      ],
    },
    {
      title: "Keep each object's members separate",
      explanation: [
        'Every object has its own copy of every member. A call on one object changes only that object, and copying an object gives the copy its own members.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\nstruct Counter {\n  int count;\n  void add(int amount) { count += amount; }\n};\nint main() {\n  Counter a{0};\n  Counter b{100};\n  a.add(1);\n  b.add(1);\n  std::cout << a.count << " " << b.count << "\\n";\n}',
        output: '1 101',
        explanation: 'Each call updates the object it was made on.',
      },
      questions: [
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nstruct Counter {\n  int count;\n  void add(int amount) { count += amount; }\n};\nint main() {\n  Counter a{5};\n  Counter b = a;\n  b.add(10);\n  std::cout << a.count << " " << b.count << "\\n";\n}',
          ['15 15', '5 5', '15 5', '5 15'],
          3,
          'b is a separate copy, so adding to it leaves a at 5.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\nstruct Counter {\n  int count;\n  void add(int amount) { count += amount; }\n};\nint main() {\n  Counter a{0};\n  Counter b{0};\n  a.add(3);\n  a.add(3);\n  b.add(1);\n  std::cout << a.count - b.count << "\\n";\n}',
          ['5', '6', '1', '7'],
          0,
          'a reaches 6 and b reaches 1.',
        ),
        choose(
          'Two Counter objects exist, and c1.add(5) is called. What happens to c2?',
          [
            'It also grows by 5',
            'It is reset to 0',
            'Nothing; only c1 changes',
            'It grows by 5 at its next call',
          ],
          2,
          'A member function call affects only the object it is called on.',
        ),
      ],
    },
    {
      title: 'Return values from member functions',
      explanation: [
        "Member functions can take parameters and return values like other functions, and they can combine the object's members with their arguments.",
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\nstruct Score {\n  int points;\n  int doubled() { return points * 2; }\n  void reset() { points = 0; }\n};\nint main() {\n  Score s{4};\n  int d = s.doubled();\n  s.reset();\n  std::cout << d << " " << s.points << "\\n";\n}',
        output: '8 0',
        explanation: 'd stores the returned 8 before reset sets points to 0.',
      },
      questions: [
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nstruct Tank {\n  int level;\n  void fill(int amount) { level += amount; }\n  int remaining(int capacity) { return capacity - level; }\n};\nint main() {\n  Tank t{30};\n  t.fill(20);\n  std::cout << t.remaining(100) << "\\n";\n}',
          ['70', '80', '150', '50'],
          3,
          'level becomes 50, and 100 - 50 leaves 50.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\nstruct Acc {\n  int total;\n  int add(int x) {\n    total += x;\n    return total;\n  }\n};\nint main() {\n  Acc a{0};\n  a.add(2);\n  std::cout << a.add(3) << "\\n";\n}',
          ['3', '5', '2', '0'],
          1,
          'The first call makes total 2, and the second returns 2 + 3.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\nstruct Score {\n  int points;\n  int doubled() { return points * 2; }\n};\nint main() {\n  Score s{3};\n  std::cout << s.doubled() + s.doubled() << " " << s.points << "\\n";\n}',
          ['12 12', '12 3', '6 3', '12 6'],
          1,
          'doubled only reads points, so both calls return 6 and points stays 3.',
        ),
      ],
    },
  ],
  'cpp-const-member-functions': [
    {
      title: 'Mark a reading member function const',
      explanation: [
        "Writing const after a member function's parameter list, as in int area() const, promises that it does not modify the object. Only such const member functions can be called on a const object.",
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\nstruct Rect {\n  int w;\n  int h;\n  int area() const { return w * h; }\n};\nint main() {\n  const Rect r{3, 4};\n  std::cout << r.area() << "\\n";\n}',
        output: '12',
        explanation:
          'r is const, and area is a const member function, so the call is allowed.',
      },
      questions: [
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nstruct Temp {\n  int c;\n  int doubled() const { return c * 2; }\n};\nint main() {\n  const Temp t{21};\n  std::cout << t.doubled() << "\\n";\n}',
          ['21', '23', '0', '42'],
          3,
          'The const member function reads c and returns 42.',
        ),
        choose(
          'Why does b.read() fail to compile here?',
          [
            'v must be declared private first',
            'read must return void instead of int',
            'read is not const, so a const Box cannot call it',
            'const objects cannot have any members',
          ],
          2,
          'Without const, the compiler must assume read might modify the object.',
          'struct Box {\n  int v;\n  int read() { return v; }\n};\nint main() {\n  const Box b{1};\n  b.read();\n}',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\nstruct Pair {\n  int a;\n  int b;\n  int sum() const { return a + b; }\n};\nint main() {\n  const Pair p{2, 5};\n  Pair q{1, 1};\n  std::cout << p.sum() << q.sum() << "\\n";\n}',
          ['72', '7', '2', '27'],
          0,
          'A const member function can be called on const and non-const objects alike.',
        ),
      ],
    },
    {
      title: 'Know that const member functions cannot modify',
      explanation: [
        'Inside a const member function, the members are read-only: assigning to one does not compile. Functions that change state stay non-const and can be called only on non-const objects.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\nstruct Meter {\n  int reading;\n  int peek() const { return reading; }\n  void tick() { reading += 1; }\n};\nint main() {\n  Meter m{9};\n  m.tick();\n  std::cout << m.peek() << "\\n";\n}',
        output: '10',
        explanation:
          'tick changes the reading, so it is not const; peek only reads it.',
      },
      questions: [
        choose(
          'What happens when this struct is compiled?',
          [
            'It compiles and peek increments reading',
            'It compiles, but the change is lost',
            'It compiles, and peek returns the old value',
            'It does not compile: a const member function cannot modify reading',
          ],
          3,
          'Members are read-only inside a const member function.',
          'struct Meter {\n  int reading;\n  int peek() const {\n    reading += 1;\n    return reading;\n  }\n};',
        ),
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nstruct Meter {\n  int reading;\n  int peek() const { return reading; }\n  void tick() { reading += 1; }\n};\nint main() {\n  Meter m{0};\n  m.tick();\n  m.tick();\n  int a = m.peek();\n  m.tick();\n  std::cout << a << m.peek() << "\\n";\n}',
          ['33', '22', '23', '13'],
          2,
          'a saved 2; one more tick makes the reading 3.',
        ),
        choose(
          'Given const Meter m{5};, which member functions can be called on m?',
          [
            'Both peek and tick, since m exists',
            'Only tick, which is not const',
            'Neither, because m is const',
            'Only peek, which is marked const',
          ],
          3,
          'A const object allows only const member functions.',
        ),
      ],
    },
    {
      title: 'Mix const and non-const objects',
      explanation: [
        'A non-const object can call both kinds of member functions; a const object, only the const ones. Copying a const object into a non-const one gives an independent object that can be changed.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\nstruct Gauge {\n  int level;\n  int read() const { return level; }\n  void set(int v) { level = v; }\n};\nint main() {\n  Gauge g{1};\n  const Gauge fixed{7};\n  g.set(fixed.read());\n  std::cout << g.read() << "\\n";\n}',
        output: '7',
        explanation: 'fixed can be read but not set; g copies its level.',
      },
      questions: [
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nstruct Gauge {\n  int level;\n  int read() const { return level; }\n  void set(int v) { level = v; }\n};\nint main() {\n  Gauge a{2};\n  const Gauge b{5};\n  a.set(a.read() + b.read());\n  std::cout << a.read() << "\\n";\n}',
          ['5', '2', '7', '10'],
          2,
          'a is set to 2 + 5.',
        ),
        choose(
          'With Gauge a{1}; and const Gauge b{2};, which call does not compile?',
          ['a.read()', 'a.set(3)', 'b.read()', 'b.set(3)'],
          3,
          'set is not const, so it cannot be called on the const object b.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\nstruct Gauge {\n  int level;\n  int read() const { return level; }\n  void set(int v) { level = v; }\n};\nint main() {\n  Gauge a{4};\n  const Gauge snapshot = a;\n  a.set(9);\n  std::cout << snapshot.read() << a.read() << "\\n";\n}',
          ['99', '44', '49', '94'],
          2,
          'snapshot is an independent const copy made while the level was 4.',
        ),
      ],
    },
  ],
  'cpp-const-correctness': [
    {
      title: 'Call only const members through const T&',
      explanation: [
        "A const T& parameter refers to the caller's object without copying it, and through it only const member functions can be called. A getter that is not marked const cannot be used there.",
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\nstruct Tally {\n  int total;\n  void add(int x) { total += x; }\n  int value() const { return total; }\n};\nint read(const Tally& t) {\n  return t.value();\n}\nint main() {\n  Tally t{3};\n  t.add(4);\n  std::cout << read(t) << "\\n";\n}',
        output: '7',
        explanation: 'read may call value because value is const.',
      },
      questions: [
        choose(
          'Why does this function not compile?',
          [
            'value() cannot be called twice',
            'add is not const, and t is a const reference',
            'Tally must be passed by value',
            'Negative arguments are not allowed',
          ],
          1,
          'Through const Tally& only const member functions are allowed, and add modifies the object.',
          'int reset(const Tally& t) {\n  t.add(-t.value());\n  return t.value();\n}',
        ),
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nstruct Tally {\n  int total;\n  void add(int x) { total += x; }\n  int value() const { return total; }\n};\nint twice(const Tally& t) {\n  return t.value() * 2;\n}\nint main() {\n  Tally t{5};\n  t.add(1);\n  std::cout << twice(t) << "\\n";\n}',
          ['10', '11', '6', '12'],
          3,
          'The tally is 6 when twice reads it.',
        ),
        choose(
          'A getter is not marked const. What happens when code calls it through a const T& parameter?',
          [
            'It works, because getters only read',
            'The call makes a copy first',
            'It does not compile',
            'The const version is generated automatically',
          ],
          2,
          'The compiler only knows what the declaration promises, and it does not promise const.',
        ),
      ],
    },
    {
      title: 'Use T& only for functions that change the object',
      explanation: [
        "Choose the parameter from the job: const T& for functions that only read, T& for functions whose purpose is to change the caller's object, and T by value for functions that need their own copy.",
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\nstruct Tally {\n  int total;\n  void add(int x) { total += x; }\n  int value() const { return total; }\n};\nvoid record(Tally& t, int x) {\n  t.add(x);\n}\nint read(const Tally& t) {\n  return t.value();\n}\nint main() {\n  Tally t{0};\n  record(t, 5);\n  record(t, 3);\n  std::cout << read(t) << "\\n";\n}',
        output: '8',
        explanation:
          'record needs to change the tally, so it takes Tally&; read only looks, so it takes const Tally&.',
      },
      questions: [
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nstruct Tally {\n  int total;\n  void add(int x) { total += x; }\n  int value() const { return total; }\n};\nvoid record(Tally& t, int x) {\n  t.add(x);\n}\nvoid copy_record(Tally t, int x) {\n  t.add(x);\n}\nint main() {\n  Tally t{1};\n  record(t, 2);\n  copy_record(t, 100);\n  std::cout << t.value() << "\\n";\n}',
          ['103', '1', '3', '101'],
          2,
          "Only record reaches the caller's tally; copy_record changes a copy.",
        ),
        choose(
          "Which signature fits a function that only reports a tally's value?",
          [
            'int report(Tally& t)',
            'void report(Tally& t, int x)',
            'int report(const Tally& t)',
            'int report(Tally t, int x)',
          ],
          2,
          'const Tally& avoids the copy and states that the function only reads.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\nstruct Tally {\n  int total;\n  void add(int x) { total += x; }\n  int value() const { return total; }\n};\nbool reached(const Tally& t, int goal) {\n  return t.value() >= goal;\n}\nint main() {\n  Tally t{0};\n  t.add(4);\n  std::cout << reached(t, 4) << reached(t, 5) << "\\n";\n}',
          ['11', '01', '00', '10'],
          3,
          'The tally is 4, which reaches a goal of 4 but not 5.',
        ),
      ],
    },
    {
      title: 'Give read-only access through const accessors',
      explanation: [
        'Marking every reading member function const is what lets the rest of the program pass objects around as const T&. Removing const from a getter breaks every read-only function that uses it.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\nstruct Wallet {\n  int cash;\n  int amount() const { return cash; }\n};\nint combined(const Wallet& a, const Wallet& b) {\n  return a.amount() + b.amount();\n}\nint main() {\n  Wallet x{5};\n  Wallet y{7};\n  std::cout << combined(x, y) << "\\n";\n}',
        output: '12',
        explanation:
          'combined reads both wallets through const references using the const accessor.',
      },
      questions: [
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nstruct Stock {\n  int units;\n  int count() const { return units; }\n  void sell() { units -= 1; }\n};\nint total(const Stock& a, const Stock& b) {\n  return a.count() + b.count();\n}\nint main() {\n  Stock s{3};\n  Stock t{4};\n  s.sell();\n  std::cout << total(s, t) << "\\n";\n}',
          ['7', '5', '6', '8'],
          2,
          's has 2 units after the sale, and t has 4.',
        ),
        choose(
          'A team removes const from every getter. What breaks?',
          [
            'The getters become slower',
            'Objects can no longer be copied',
            'Functions taking const T& can no longer call them',
            'Nothing breaks',
          ],
          2,
          'Through const T& only const member functions are callable.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\nstruct Stock {\n  int units;\n  int count() const { return units; }\n  void sell() { units -= 1; }\n};\nint total(const Stock& a, const Stock& b) {\n  return a.count() + b.count();\n}\nint main() {\n  const Stock fixed{10};\n  Stock live{10};\n  live.sell();\n  std::cout << total(fixed, live) << "\\n";\n}',
          ['20', '18', '10', '19'],
          3,
          'Both const and non-const objects bind to const Stock&; the total is 10 + 9.',
        ),
      ],
    },
  ],
  'cpp-members': [
    {
      title: 'Hide state behind private',
      explanation: [
        "In a class, members under private: can be used only by the class's own member functions, while members under public: are available to everyone. struct and class differ only in the default: struct members are public unless stated otherwise, class members private.",
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\nclass Gauge {\n public:\n  explicit Gauge(int cap) : cap_(cap), level_(0) {}\n  void add(int amount) {\n    level_ += amount;\n    if (level_ > cap_) level_ = cap_;\n  }\n  int level() const { return level_; }\n\n private:\n  int cap_;\n  int level_;\n};\nint main() {\n  Gauge g(10);\n  g.add(4);\n  g.add(3);\n  std::cout << g.level() << "\\n";\n}',
        output: '7',
        explanation:
          'Outside code changes the level only through add and reads it through level().',
      },
      questions: [
        choose(
          'Gauge is the class above. What happens with g.level_ = 50; in main?',
          [
            'level_ becomes 50',
            'It does not compile: level_ is private',
            'The assignment is ignored at run time',
            'level_ becomes 10, the cap',
          ],
          1,
          "Only Gauge's own member functions can access its private members.",
        ),
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nclass Gauge {\n public:\n  explicit Gauge(int cap) : cap_(cap), level_(0) {}\n  void add(int amount) {\n    level_ += amount;\n    if (level_ > cap_) level_ = cap_;\n  }\n  int level() const { return level_; }\n\n private:\n  int cap_;\n  int level_;\n};\nint main() {\n  Gauge g(10);\n  g.add(8);\n  g.add(5);\n  std::cout << g.level() << "\\n";\n}',
          ['13', '8', '5', '10'],
          3,
          '8 + 5 would be 13, but add caps the level at 10.',
        ),
        choose(
          'How do struct and class differ in C++?',
          [
            'Only classes can have member functions',
            'Only structs can have constructors',
            'Struct members default to public, class members to private',
            'They do not differ at all',
          ],
          2,
          'Apart from that default, the two keywords define the same kind of type.',
        ),
      ],
    },
    {
      title: 'Keep an invariant inside member functions',
      explanation: [
        'An invariant is a rule that must always hold, such as "the level stays between 0 and the cap". When the state is private, every change goes through member functions, so checking the rule there is enough to guarantee it everywhere.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\nclass Gauge {\n public:\n  explicit Gauge(int cap) : cap_(cap), level_(0) {}\n  void add(int amount) {\n    level_ += amount;\n    if (level_ > cap_) level_ = cap_;\n    if (level_ < 0) level_ = 0;\n  }\n  int level() const { return level_; }\n\n private:\n  int cap_;\n  int level_;\n};\nint main() {\n  Gauge g(5);\n  g.add(-3);\n  g.add(9);\n  std::cout << g.level() << "\\n";\n}',
        output: '5',
        explanation: '-3 is raised to 0, and 9 is lowered to the cap of 5.',
      },
      questions: [
        predictOutput(
          'This uses the Gauge class from the example. What does the program print?',
          '#include <iostream>\nclass Gauge {\n public:\n  explicit Gauge(int cap) : cap_(cap), level_(0) {}\n  void add(int amount) {\n    level_ += amount;\n    if (level_ > cap_) level_ = cap_;\n    if (level_ < 0) level_ = 0;\n  }\n  int level() const { return level_; }\n\n private:\n  int cap_;\n  int level_;\n};\nint main() {\n  Gauge g(5);\n  g.add(2);\n  g.add(-10);\n  g.add(1);\n  std::cout << g.level() << "\\n";\n}',
          ['-7', '0', '1', '3'],
          2,
          'The level goes 2, then is raised from -8 to 0, then becomes 1.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\nclass Gauge {\n public:\n  explicit Gauge(int cap) : cap_(cap), level_(0) {}\n  void add(int amount) {\n    level_ += amount;\n    if (level_ > cap_) level_ = cap_;\n    if (level_ < 0) level_ = 0;\n  }\n  int level() const { return level_; }\n\n private:\n  int cap_;\n  int level_;\n};\nint main() {\n  Gauge g(100);\n  g.add(60);\n  g.add(60);\n  g.add(-30);\n  std::cout << g.level() << "\\n";\n}',
          ['90', '100', '70', '120'],
          2,
          '60, then capped at 100, then 100 - 30.',
        ),
        choose(
          'Why can no caller ever see a Gauge level above its cap?',
          [
            'The compiler checks the cap at every call',
            'An int member cannot exceed the cap',
            'The destructor corrects any bad level',
            'Every change goes through add, which enforces the cap',
          ],
          3,
          'The state is private, so add is the only way in, and add checks the rule.',
        ),
      ],
    },
    {
      title: 'Read private state through const accessors',
      explanation: [
        'A const accessor such as int balance() const lets callers read private state without being able to change it. Changes go through member functions that can refuse invalid requests.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\nclass Account {\n public:\n  explicit Account(int start) : balance_(start) {}\n  bool withdraw(int amount) {\n    if (amount > balance_) return false;\n    balance_ -= amount;\n    return true;\n  }\n  int balance() const { return balance_; }\n\n private:\n  int balance_;\n};\nint main() {\n  Account a(50);\n  bool ok = a.withdraw(80);\n  std::cout << ok << " " << a.balance() << "\\n";\n}',
        output: '0 50',
        explanation: 'The withdrawal is refused, so the balance is unchanged.',
      },
      questions: [
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nclass Account {\n public:\n  explicit Account(int start) : balance_(start) {}\n  bool withdraw(int amount) {\n    if (amount > balance_) return false;\n    balance_ -= amount;\n    return true;\n  }\n  int balance() const { return balance_; }\n\n private:\n  int balance_;\n};\nint main() {\n  Account a(50);\n  bool first = a.withdraw(30);\n  bool second = a.withdraw(30);\n  std::cout << first << second << " " << a.balance() << "\\n";\n}',
          ['11 -10', '01 20', '10 20', '11 20'],
          2,
          'The first withdrawal leaves 20; the second asks for more than 20 and is refused.',
        ),
        choose(
          'Why does Account offer balance() instead of making balance_ public?',
          [
            'Because int members cannot be public',
            'To make the program run faster',
            'So callers can read it while every change must pass through withdraw',
            'Because const functions must return members',
          ],
          2,
          'Read access is safe to share; write access is kept behind the checking function.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\nclass Account {\n public:\n  explicit Account(int start) : balance_(start) {}\n  bool withdraw(int amount) {\n    if (amount > balance_) return false;\n    balance_ -= amount;\n    return true;\n  }\n  int balance() const { return balance_; }\n\n private:\n  int balance_;\n};\nint main() {\n  Account a(10);\n  Account b = a;\n  b.withdraw(4);\n  std::cout << a.balance() << " " << b.balance() << "\\n";\n}',
          ['6 6', '10 10', '6 10', '10 6'],
          3,
          'b is an independent copy, so only b loses 4.',
        ),
      ],
    },
  ],
  'cpp-scope-resource': [
    {
      title: 'Acquire in the constructor, release in the destructor',
      explanation: [
        'RAII ("resource acquisition is initialization") ties a resource to an object: the constructor acquires it and the destructor releases it. Because local objects are destroyed automatically, the resource is released when the owner\'s scope ends.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\nstruct Lease {\n  int& count;\n  explicit Lease(int& c) : count(c) { ++count; }\n  ~Lease() { --count; }\n};\nint main() {\n  int active = 0;\n  {\n    Lease lease(active);\n    std::cout << active << " ";\n  }\n  std::cout << active << "\\n";\n}',
        output: '1 0',
        explanation:
          'The lease counts as active while it lives and releases itself at the end of the block.',
      },
      questions: [
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nstruct Lease {\n  int& count;\n  explicit Lease(int& c) : count(c) { ++count; }\n  ~Lease() { --count; }\n};\nint main() {\n  int active = 0;\n  {\n    Lease a(active);\n    Lease b(active);\n    std::cout << active;\n  }\n  std::cout << active << "\\n";\n}',
          ['20', '21', '10', '22'],
          0,
          'Two leases are held inside the block, and both are released when it ends.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\nstruct Lease {\n  int& count;\n  explicit Lease(int& c) : count(c) { ++count; }\n  ~Lease() { --count; }\n};\nint main() {\n  int active = 0;\n  {\n    Lease a(active);\n    {\n      Lease b(active);\n      std::cout << active;\n    }\n    std::cout << active;\n  }\n  std::cout << active << "\\n";\n}',
          ['221', '211', '210', '200'],
          2,
          'Each lease is released at the end of its own block: 2, then 1, then 0.',
        ),
        choose(
          'In RAII, what makes the release happen at scope exit?',
          [
            'A release call written at the end of each block',
            'The garbage collector',
            "The owning object's destructor",
            'The return statement',
          ],
          2,
          'The destructor runs automatically when the owner is destroyed.',
        ),
      ],
    },
    {
      title: 'Release on every exit path',
      explanation: [
        "A function may leave a scope in several ways, such as an early return. The owner's destructor runs on each of them, so no path can forget the release, and no release call has to be written by hand.",
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\nstruct Lock {\n  int& held;\n  explicit Lock(int& h) : held(h) { held = 1; }\n  ~Lock() { held = 0; }\n};\nint work(int& state, int input) {\n  Lock lock(state);\n  if (input < 0) return -1;\n  return input * 2;\n}\nint main() {\n  int state = 0;\n  int r = work(state, -5);\n  std::cout << r << " " << state << "\\n";\n}',
        output: '-1 0',
        explanation:
          'The early return still destroys lock, which sets state back to 0.',
      },
      questions: [
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nstruct Lock {\n  int& held;\n  explicit Lock(int& h) : held(h) { held = 1; }\n  ~Lock() { held = 0; }\n};\nint work(int& state, int input) {\n  Lock lock(state);\n  if (input < 0) return -1;\n  return input * 2;\n}\nint main() {\n  int state = 0;\n  int r = work(state, 4);\n  std::cout << r << " " << state << "\\n";\n}',
          ['8 1', '8 0', '-1 0', '4 0'],
          1,
          'The normal return also destroys lock, so state is 0 again.',
        ),
        choose(
          'A function holds a Lease and has three return statements. How many release calls must be written?',
          [
            'Three, one before each return',
            'One, at the end of the function',
            'Two, before the early returns',
            'None; the destructor releases on every path',
          ],
          3,
          'Every way out of the scope destroys the owner.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\nstruct Lease {\n  int& count;\n  explicit Lease(int& c) : count(c) { ++count; }\n  ~Lease() { --count; }\n};\nint measure(int& active) {\n  Lease lease(active);\n  return active * 10;\n}\nint main() {\n  int a = 0;\n  int r = measure(a);\n  std::cout << r << " " << a << "\\n";\n}',
          ['10 1', '0 0', '10 0', '0 1'],
          2,
          'The return value is computed while the lease is held; the lease is released afterwards.',
        ),
      ],
    },
    {
      title: 'Release exactly once',
      explanation: [
        'Each resource needs exactly one owner that releases it. If two objects both believe they own it, it is released twice. A struct whose destructor releases something is copied member by member by default, and the copy releases again.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\nstruct Lease {\n  int& count;\n  explicit Lease(int& c) : count(c) { ++count; }\n  ~Lease() { --count; }\n};\nint main() {\n  int active = 0;\n  {\n    Lease a(active);\n  }\n  {\n    Lease b(active);\n  }\n  std::cout << active << "\\n";\n}',
        output: '0',
        explanation:
          'Each lease is acquired once and released once, so the count returns to 0.',
      },
      questions: [
        choose(
          'Two independent objects both close the same file handle in their destructors. What goes wrong?',
          [
            'The handle is never closed',
            'The handle is closed twice',
            'Nothing; the second close is ignored',
            'Neither object can be constructed',
          ],
          1,
          'Two owners mean two releases of one resource.',
        ),
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nstruct Counter {\n  int& releases;\n  ~Counter() { ++releases; }\n};\nint main() {\n  int releases = 0;\n  {\n    Counter a{releases};\n    Counter b = a;\n  }\n  std::cout << releases << "\\n";\n}',
          ['1', '0', '2', '3'],
          2,
          'The copy b also runs the destructor, so the release is counted twice.',
        ),
        choose(
          'Why should a resource owner acquire its resource in its constructor?',
          [
            'Constructors run faster than other functions',
            'So the destructor can be skipped',
            'So the object can be copied freely',
            'So that every existing owner really holds the resource',
          ],
          3,
          'If the object exists, it owns the resource; its destructor can then always release it.',
        ),
      ],
    },
  ],
  'cpp-exception-cleanup': [
    {
      title: 'Run destructors while an exception leaves a scope',
      explanation: [
        'When an exception is thrown, the program leaves each scope between the throw and the matching catch. Leaving those scopes destroys their completed local objects, in reverse order. This is called stack unwinding, and it runs before the catch block.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\n#include <stdexcept>\nstruct Note {\n  ~Note() { std::cout << "cleanup\\n"; }\n};\nint main() {\n  try {\n    Note n;\n    throw std::runtime_error("stop");\n  } catch (const std::runtime_error&) {\n    std::cout << "caught\\n";\n  }\n}',
        output: 'cleanup\ncaught',
        explanation:
          'n is destroyed as the exception leaves the try block, before the handler runs.',
      },
      questions: [
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <stdexcept>\nstruct Tag {\n  int id;\n  ~Tag() { std::cout << id; }\n};\nint main() {\n  try {\n    Tag a{1};\n    Tag b{2};\n    throw std::runtime_error("x");\n  } catch (const std::runtime_error&) {\n    std::cout << "!";\n  }\n  std::cout << "\\n";\n}',
          ['12!', '!21', '21!', '!'],
          2,
          'Unwinding destroys b and then a before the handler prints !.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\n#include <stdexcept>\nstruct Lease {\n  int& count;\n  explicit Lease(int& c) : count(c) { ++count; }\n  ~Lease() { --count; }\n};\nint main() {\n  int active = 0;\n  try {\n    Lease lease(active);\n    throw std::runtime_error("fail");\n  } catch (const std::runtime_error&) {\n    std::cout << active << "\\n";\n  }\n}',
          ['1', '-1', '2', '0'],
          3,
          'The lease is released during unwinding, before the handler reads active.',
        ),
        choose(
          'When does a catch block run relative to the destructors of objects in its try block?',
          [
            'Before them',
            'At the same time',
            "After them, because the try block's objects are destroyed first",
            'Never together, because the destructors are skipped',
          ],
          2,
          'Unwinding finishes before control enters the handler.',
        ),
      ],
    },
    {
      title: 'Destroy only objects that were completed',
      explanation: [
        'Unwinding destroys only objects whose construction finished. Statements after the throw never run, so objects declared there are never created and never destroyed. Objects in functions that the exception passes through are destroyed too, innermost first.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\n#include <stdexcept>\nstruct Tag {\n  int id;\n  ~Tag() { std::cout << id; }\n};\nint main() {\n  try {\n    Tag a{1};\n    throw std::runtime_error("x");\n    Tag b{2};\n  } catch (const std::runtime_error&) {\n    std::cout << "!";\n  }\n  std::cout << "\\n";\n}',
        output: '1!',
        explanation: 'b is never constructed, so only a is destroyed.',
      },
      questions: [
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <stdexcept>\nstruct Tag {\n  int id;\n  ~Tag() { std::cout << id; }\n};\nint main() {\n  try {\n    Tag a{5};\n    Tag b{6};\n    throw std::runtime_error("x");\n    Tag c{7};\n  } catch (const std::runtime_error&) {\n    std::cout << "!";\n  }\n  std::cout << "\\n";\n}',
          ['765!', '65!', '56!', '!65'],
          1,
          'c was never created; b and a are destroyed in reverse order.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\n#include <stdexcept>\nstruct Tag {\n  int id;\n  ~Tag() { std::cout << id; }\n};\nvoid step() {\n  Tag t{3};\n  throw std::runtime_error("x");\n}\nint main() {\n  try {\n    Tag outer{9};\n    step();\n  } catch (const std::runtime_error&) {\n    std::cout << "!";\n  }\n  std::cout << "\\n";\n}',
          ['93!', '3!9', '!39', '39!'],
          3,
          'The exception leaves step first, destroying t, then the try block, destroying outer.',
        ),
        choose(
          "An exception is thrown before Tag c is declared in a try block. Is c's destructor run?",
          [
            'Yes, every declared object is destroyed',
            'Only if Tag has a constructor',
            'No, because c was never constructed',
            'It depends on the catch block',
          ],
          2,
          'Only completed objects are destroyed during unwinding.',
        ),
      ],
    },
    {
      title: 'Keep destructors from throwing',
      explanation: [
        'Destructors run during unwinding, so they must not throw: a second exception while one is already in flight calls std::terminate and ends the program. Cleanup in a destructor should be written so that it cannot fail with an exception.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\n#include <stdexcept>\nstruct Lease {\n  int& count;\n  explicit Lease(int& c) : count(c) { ++count; }\n  ~Lease() { --count; }\n};\nint main() {\n  int active = 0;\n  try {\n    Lease a(active);\n    Lease b(active);\n    throw std::runtime_error("fail");\n  } catch (const std::runtime_error& e) {\n    std::cout << active << " " << e.what() << "\\n";\n  }\n}',
        output: '0 fail',
        explanation:
          'Both destructors release quietly during unwinding, and the handler sees the original message.',
      },
      questions: [
        choose(
          'What happens if a destructor throws while another exception is already unwinding the stack?',
          [
            'The second exception replaces the first',
            'Both exceptions are caught together',
            'std::terminate ends the program',
            'The second exception is ignored',
          ],
          2,
          'C++ cannot handle two exceptions at once, so it terminates.',
        ),
        choose(
          'Why should cleanup code in a destructor not throw?',
          [
            'Destructors may not contain any statements',
            'A throw during unwinding terminates the program',
            'The compiler rejects every throw there',
            'It makes the destructor run twice',
          ],
          1,
          'Destructors are exactly the code that runs while an exception is in flight.',
        ),
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <stdexcept>\nstruct Lease {\n  int& count;\n  explicit Lease(int& c) : count(c) { ++count; }\n  ~Lease() { --count; }\n};\nint main() {\n  int active = 0;\n  try {\n    Lease a(active);\n    {\n      Lease b(active);\n      std::cout << active;\n      throw std::runtime_error("x");\n    }\n  } catch (const std::runtime_error&) {\n    std::cout << active << "\\n";\n  }\n}',
          ['22', '21', '20', '02'],
          2,
          'Two leases are held when the exception is thrown; both are released before the handler prints.',
        ),
      ],
    },
  ],
  'cpp-noncopy-owner': [
    {
      title: 'Delete the copy operations of an exclusive owner',
      explanation: [
        'Owner(const Owner&) = delete; and Owner& operator=(const Owner&) = delete; remove copy construction and copy assignment. Any attempt to copy then fails to compile, and the traits std::is_copy_constructible_v and std::is_copy_assignable_v report false.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\n#include <type_traits>\nstruct Owner {\n  Owner() = default;\n  Owner(const Owner&) = delete;\n  Owner& operator=(const Owner&) = delete;\n};\nint main() {\n  std::cout << std::is_copy_constructible_v<Owner> << "\\n";\n}',
        output: '0',
        explanation:
          'With its copy constructor deleted, Owner cannot be copy-constructed.',
      },
      questions: [
        choose(
          'Owner is the struct above. What happens with Owner a; Owner b = a;?',
          [
            'b becomes a second owner of the resource',
            'b starts out empty, owning nothing',
            'a is moved into b, leaving a empty',
            'It does not compile: the copy constructor is deleted',
          ],
          3,
          'Copying needs the copy constructor, which no longer exists.',
        ),
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <type_traits>\nstruct Plain {\n  int v;\n};\nstruct Owner {\n  Owner() = default;\n  Owner(const Owner&) = delete;\n  Owner& operator=(const Owner&) = delete;\n};\nint main() {\n  std::cout << std::is_copy_constructible_v<Plain> << std::is_copy_constructible_v<Owner> << "\\n";\n}',
          ['11', '01', '00', '10'],
          3,
          'Plain keeps its default copy constructor; Owner deleted its own.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\n#include <type_traits>\nstruct Owner {\n  Owner() = default;\n  Owner(const Owner&) = delete;\n  Owner& operator=(const Owner&) = delete;\n};\nint main() {\n  std::cout << (!std::is_copy_constructible_v<Owner> && !std::is_copy_assignable_v<Owner>) << "\\n";\n}',
          ['0', '1', '2', '-1'],
          1,
          'Both copy operations are deleted, so both traits are false and both negations true.',
        ),
      ],
    },
    {
      title: 'See why default copies release twice',
      explanation: [
        'Without deleted copies, the compiler copies an owner member by member, so the copy refers to the same resource. When both are destroyed, the resource is released twice.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\nstruct Handle {\n  int& releases;\n  ~Handle() { ++releases; }\n};\nint main() {\n  int releases = 0;\n  {\n    Handle a{releases};\n    Handle b = a;\n  }\n  std::cout << releases << "\\n";\n}',
        output: '2',
        explanation:
          'One resource, two destructors: the release happens twice.',
      },
      questions: [
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nstruct Handle {\n  int& releases;\n  ~Handle() { ++releases; }\n};\nint main() {\n  int releases = 0;\n  {\n    Handle a{releases};\n    Handle b = a;\n    Handle c = b;\n  }\n  std::cout << releases << "\\n";\n}',
          ['1', '2', '3', '0'],
          2,
          'Every copy runs the destructor, so the one resource is released three times.',
        ),
        choose(
          'A struct owns one file handle and closes it in its destructor. What does the default copy constructor do?',
          [
            'Opens a second file for the copy',
            'Refuses to compile',
            'Copies the handle, so both objects close it',
            'Moves the handle and empties the source',
          ],
          2,
          'The default copy duplicates the handle value, not the file.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\nstruct Handle {\n  int& releases;\n  ~Handle() { ++releases; }\n};\nint main() {\n  int releases = 0;\n  Handle a{releases};\n  {\n    Handle b = a;\n  }\n  std::cout << releases << "\\n";\n}',
          ['0', '1', '2', '3'],
          1,
          'The copy b is destroyed at the end of its block; a is still alive when the count is printed.',
        ),
      ],
    },
    {
      title: 'Use a non-copyable owner normally',
      explanation: [
        'Deleting copies blocks only copying. The owner can still be created, used, and referred to through references, and it still releases its resource once at scope exit.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\nstruct Owner {\n  int& active;\n  explicit Owner(int& a) : active(a) { ++active; }\n  ~Owner() { --active; }\n  Owner(const Owner&) = delete;\n  Owner& operator=(const Owner&) = delete;\n};\nint main() {\n  int active = 0;\n  {\n    Owner o(active);\n    Owner& view = o;\n    std::cout << view.active << " ";\n  }\n  std::cout << active << "\\n";\n}',
        output: '1 0',
        explanation:
          'A reference is not a copy, so view is allowed; the single owner releases once.',
      },
      questions: [
        choose(
          "Owner's copy operations are deleted and Owner a(x); exists. Which line still compiles?",
          [
            'Owner b = a;',
            'Owner c(a);',
            'Owner& r = a;',
            'b = a; for another Owner b',
          ],
          2,
          'Binding a reference does not copy the owner.',
        ),
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nstruct Owner {\n  int& active;\n  explicit Owner(int& a) : active(a) { ++active; }\n  ~Owner() { --active; }\n  Owner(const Owner&) = delete;\n  Owner& operator=(const Owner&) = delete;\n};\nint main() {\n  int active = 0;\n  {\n    Owner a(active);\n    Owner b(active);\n    std::cout << active;\n  }\n  std::cout << active << "\\n";\n}',
          ['20', '10', '22', '21'],
          0,
          'Two separate owners each acquire and release their own share.',
        ),
        choose(
          'Why delete the copies instead of trusting everyone not to copy an owner?',
          [
            'Copies are too slow',
            'Deleted functions run faster',
            'Deleting copies turns a double release into a compile error',
            'Copying is undefined for every struct',
          ],
          2,
          'The mistake is caught when compiling instead of misbehaving at run time.',
        ),
      ],
    },
  ],
  'cpp-raii': [
    {
      title: 'Save a value and restore it at scope exit',
      explanation: [
        'A scope guard is a small object whose destructor undoes a temporary change. Restore guard{mode, mode}; remembers the current value of mode; whatever happens to mode inside the block, the destructor puts the saved value back.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\nstruct Restore {\n  int& target;\n  int saved;\n  ~Restore() { target = saved; }\n};\nint main() {\n  int mode = 1;\n  {\n    Restore guard{mode, mode};\n    mode = 7;\n    std::cout << mode << " ";\n  }\n  std::cout << mode << "\\n";\n}',
        output: '7 1',
        explanation:
          'mode is 7 inside the block; the guard restores the saved 1 when the block ends.',
      },
      questions: [
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nstruct Restore {\n  int& target;\n  int saved;\n  ~Restore() { target = saved; }\n};\nint main() {\n  int level = 3;\n  {\n    Restore g{level, level};\n    level = 99;\n  }\n  std::cout << level << "\\n";\n}',
          ['99', '0', '3', '102'],
          2,
          'The guard saved 3 and writes it back at the end of the block.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\nstruct Restore {\n  int& target;\n  int saved;\n  ~Restore() { target = saved; }\n};\nint main() {\n  int x = 5;\n  {\n    Restore g{x, x};\n    x += 10;\n    x *= 2;\n    std::cout << x << " ";\n  }\n  std::cout << x << "\\n";\n}',
          ['30 30', '15 5', '5 5', '30 5'],
          3,
          'Inside the block x becomes 30; afterwards it is restored to 5.',
        ),
        choose(
          'When does the guard put the old value back?',
          [
            'Immediately after it is constructed',
            'Only if the program ends normally',
            'When its destructor runs at scope exit',
            'The next time target is read',
          ],
          2,
          "Restoring is the destructor's job, so it happens when the guard is destroyed.",
        ),
      ],
    },
    {
      title: 'Restore the actual prior value',
      explanation: [
        'A guard must save the value that was really there and restore that, not a fixed default. Resetting to a constant is right only by accident, when the old value happened to equal it.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\nstruct Restore {\n  int& target;\n  int saved;\n  ~Restore() { target = saved; }\n};\nint main() {\n  int volume = 4;\n  {\n    Restore g{volume, volume};\n    volume = 0;\n  }\n  std::cout << volume << "\\n";\n}',
        output: '4',
        explanation: 'The guard restores the 4 it saved, not some default.',
      },
      questions: [
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nstruct ResetToZero {\n  int& target;\n  ~ResetToZero() { target = 0; }\n};\nint main() {\n  int volume = 4;\n  {\n    ResetToZero g{volume};\n    volume = 9;\n  }\n  std::cout << volume << "\\n";\n}',
          ['4', '9', '13', '0'],
          3,
          'This guard writes 0 instead of the saved 4, so the old setting is lost.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\nstruct Restore {\n  int& target;\n  int saved;\n  ~Restore() { target = saved; }\n};\nint main() {\n  int v = 1;\n  {\n    Restore a{v, v};\n    v = 2;\n    {\n      Restore b{v, v};\n      v = 3;\n    }\n    std::cout << v;\n  }\n  std::cout << v << "\\n";\n}',
          ['31', '11', '21', '23'],
          2,
          'The inner guard restores 2 when its block ends; the outer one restores 1.',
        ),
        choose(
          'A guard always resets a setting to 0 instead of saving it first. When is that wrong?',
          [
            'Never, because 0 is a safe default',
            'Only when the new value is 0',
            'Only when the guard object is copied',
            'Whenever the setting was not 0 before the change',
          ],
          3,
          'The goal is to undo the change, which means returning to the previous value.',
        ),
      ],
    },
    {
      title: 'Stack several guards',
      explanation: [
        'Several guards can protect several values at once. Guards are destroyed in reverse order, so when two guards protect the same variable, the first one, destroyed last, decides the final value.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\nstruct Restore {\n  int& target;\n  int saved;\n  ~Restore() { target = saved; }\n};\nint main() {\n  int speed = 1;\n  int volume = 2;\n  {\n    Restore a{speed, speed};\n    Restore b{volume, volume};\n    speed = 10;\n    volume = 20;\n    std::cout << speed + volume << " ";\n  }\n  std::cout << speed + volume << "\\n";\n}',
        output: '30 3',
        explanation:
          'Both settings are changed inside the block and both are restored when it ends.',
      },
      questions: [
        predictOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nstruct Restore {\n  int& target;\n  int saved;\n  ~Restore() { target = saved; }\n};\nint main() {\n  int v = 1;\n  {\n    Restore a{v, v};\n    v = 5;\n    Restore b{v, v};\n    v = 9;\n  }\n  std::cout << v << "\\n";\n}',
          ['5', '9', '1', '0'],
          2,
          'b restores 5 first; then a, destroyed last, restores 1.',
        ),
        predictOutput(
          'What does this program print?',
          '#include <iostream>\nstruct Restore {\n  int& target;\n  int saved;\n  ~Restore() { target = saved; }\n};\nint main() {\n  int v = 1;\n  {\n    Restore a{v, v};\n    v = 5;\n    Restore b{v, v};\n    v = 9;\n    std::cout << v;\n  }\n  std::cout << v << "\\n";\n}',
          ['95', '99', '11', '91'],
          3,
          'Inside the block v is 9; after both guards run it is back to 1.',
        ),
        choose(
          'Two guards protect the same variable, one created after the other. Which saved value remains after the scope ends?',
          [
            'The value saved by the second guard',
            'The value saved by the first guard',
            'The last value assigned in the block',
            'Zero',
          ],
          1,
          'The first guard is destroyed last, so its restore is the final write.',
        ),
      ],
    },
  ],
};
