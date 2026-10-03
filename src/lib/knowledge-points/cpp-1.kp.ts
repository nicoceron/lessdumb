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
};
