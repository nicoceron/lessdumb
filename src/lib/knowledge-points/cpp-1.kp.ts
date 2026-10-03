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
};
