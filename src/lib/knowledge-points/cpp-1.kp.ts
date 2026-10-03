import {
  choose,
  predictOutput,
  typeOutput,
  type KnowledgePointModule,
} from './authoring';

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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint main() {\n  int count = 12;\n  std::cout << count << "\\n";\n}',
          '12',
          'count holds the value it was initialized with.',
        ),
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint main() {\n  int level = -3;\n  std::cout << level << "\\n";\n}',
          '-3',
          'An int can hold negative whole numbers, and it prints with its sign.',
        ),
        choose(
          'Inside main, which declaration is safe to read on the next line?',
          ['int total;', 'int total = 0;', 'int total[];', 'int;'],
          1,
          'Only the initialized declaration has a defined value to read.',
        ),
        choose(
          'What does a local int declared as `int score;` contain before assignment?',
          [
            'Always 0',
            'Always -1',
            'An indeterminate value; never read it',
            'The value left over from the previous run',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint main() {\n  int a = 4;\n  int b = a;\n  a = 10;\n  std::cout << b << "\\n";\n}',
          '4',
          'b copied 4 before a changed, and the copy does not follow a.',
        ),
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint main() {\n  int x = 2;\n  int y = x;\n  y = y + 5;\n  std::cout << x << " " << y << "\\n";\n}',
          '2 7',
          'Changing the copy y does not affect x.',
        ),
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint main() {\n  int first = 5;\n  int second = first;\n  first = first * 3;\n  std::cout << first << " " << second << "\\n";\n}',
          '15 5',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint main() {\n  int total = 22;\n  int teams = 4;\n  std::cout << total / teams << "\\n";\n}',
          '5',
          '22 / 4 is 5.5 in mathematics; integer division discards the .5 and keeps 5.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  std::cout << 3 / 4 << "\\n";\n}',
          '0',
          '3 / 4 is less than one, and integer division discards the whole fraction, leaving 0.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  int pages = 50;\n  int per_sheet = 8;\n  std::cout << pages / per_sheet * per_sheet << "\\n";\n}',
          '48',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint main() {\n  int change = -9;\n  std::cout << change / 4 << "\\n";\n}',
          '-2',
          '-9 / 4 is -2.25, and truncating toward zero gives -2.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  std::cout << -1 / 3 << "\\n";\n}',
          '0',
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
        typeOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  int a = -15;\n  int b = 4;\n  std::cout << a / b << " " << -a / b << "\\n";\n}',
          '-3 3',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint main() {\n  std::cout << 29 % 6 << "\\n";\n}',
          '5',
          '29 / 6 is 4, and 29 - 4 * 6 leaves 5.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  int eggs = 40;\n  std::cout << eggs / 12 << " " << eggs % 12 << "\\n";\n}',
          '3 4',
          '40 eggs fill 3 boxes of 12, which hold 36, so 4 eggs are left over.',
        ),
        choose(
          'After int r = n % 5; which value of r means that n is a multiple of 5?',
          ['5', '0', '1', 'n / 5'],
          1,
          'A multiple of 5 divides evenly, so nothing is left over and the remainder is 0.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  std::cout << 8 % 10 << "\\n";\n}',
          '8',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint main() {\n  std::cout << -10 % 4 << "\\n";\n}',
          '-2',
          '-10 / 4 truncates to -2, and -10 - (-2 * 4) leaves -2.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  int n = -9;\n  std::cout << n % 2 << "\\n";\n}',
          '-1',
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
        typeOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  std::cout << 14 % -5 << " " << -14 % 5 << "\\n";\n}',
          '4 -4',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint main() {\n  int sum = 9;\n  int n = 4;\n  std::cout << static_cast<double>(sum) / n << "\\n";\n}',
          '2.25',
          'sum becomes 9.0, and 9.0 / 4 is 2.25.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  int a = 5;\n  std::cout << a / 2 << " " << static_cast<double>(a) / 2 << "\\n";\n}',
          '2 2.5',
          'a / 2 is integer division and gives 2; converting a to double first gives 2.5.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  double share = static_cast<double>(6) / 3;\n  std::cout << share << "\\n";\n}',
          '2',
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
          'Only static_cast<double>(1) / 4 converts before dividing. 1 / 4 is 0 before any cast, and 1 % 4 is the remainder 1.',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint main() {\n  int points = 11;\n  int games = 2;\n  double average = static_cast<double>(points / games);\n  std::cout << average << "\\n";\n}',
          '5',
          'points / games is integer division and gives 5; converting 5 to double does not bring back the .5.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  int a = 3;\n  int b = 4;\n  std::cout << static_cast<double>(a) / b << " " << static_cast<double>(a / b) << "\\n";\n}',
          '0.75 0',
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
        typeOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  int x = 10;\n  int y = 4;\n  double ratio = static_cast<double>(x) / y;\n  std::cout << ratio * 2 << "\\n";\n}',
          '5',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint main() {\n  std::cout << static_cast<int>(9.99) << "\\n";\n}',
          '9',
          'The conversion discards .99 instead of rounding, leaving 9.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  double half = static_cast<double>(7) / 2;\n  std::cout << static_cast<int>(half * 3) << "\\n";\n}',
          '10',
          'half is 3.5, half * 3 is 10.5, and converting to int drops the .5.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  std::cout << static_cast<int>(-4.6) << "\\n";\n}',
          '-4',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint main() {\n  int x = 3;\n  std::cout << (x == 5) << "\\n";\n}',
          '0',
          '3 is not equal to 5, so the comparison is false, which std::cout prints as 0.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  int a = 7;\n  int b = 2;\n  std::cout << (a != b) << " " << (a == b + 5) << "\\n";\n}',
          '1 1',
          '7 differs from 2, and b + 5 is 7, so both comparisons are true and print 1.',
        ),
        choose(
          'Why is the comparison written in parentheses in std::cout << (a == b);?',
          [
            'They turn the comparison result into an int before printing',
            'Otherwise << binds first, and it does not compile',
            'They make == compare values instead of names',
            'They are only a style choice with no effect',
          ],
          1,
          'Without parentheses the expression is (std::cout << a) == b, which compares a stream with an int and does not compile.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  int count = 0;\n  std::cout << (count == 0) << (count != 0) << "\\n";\n}',
          '10',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint main() {\n  int a = -3;\n  int b = 2;\n  std::cout << (a < b) << "\\n";\n}',
          '1',
          '-3 is less than 2, so the comparison is true and prints 1.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  int limit = 10;\n  int used = 10;\n  std::cout << (used < limit) << " " << (used <= limit) << "\\n";\n}',
          '0 1',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint main() {\n  int level = 3;\n  bool high = level > 5;\n  std::cout << high << "\\n";\n}',
          '0',
          '3 > 5 is false, and a false bool prints as 0.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  int a = 2;\n  int b = 9;\n  a = b;\n  std::cout << (a == b) << " " << a << "\\n";\n}',
          '1 9',
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
        typeOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  int t = 8;\n  bool same = t == 8;\n  t = 9;\n  std::cout << same << "\\n";\n}',
          '1',
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
        typeOutput(
          'What does this program print?',
          '#include <iostream>\n#include <limits>\nint main() {\n  int low = std::numeric_limits<int>::min();\n  std::cout << (low < 0) << " " << (low + 1 < 0) << "\\n";\n}',
          '1 1',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <limits>\nint main() {\n  int a = 100;\n  int b = 50;\n  if (b > 0 && a > std::numeric_limits<int>::max() - b) std::cout << "reject\\n";\n  else std::cout << a + b << "\\n";\n}',
          '150',
          '100 is far below max - 50, so the guard passes and the sum 150 is printed.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\n#include <limits>\nint main() {\n  int a = std::numeric_limits<int>::max() - 5;\n  int b = 6;\n  bool fits = !(b > 0 && a > std::numeric_limits<int>::max() - b);\n  std::cout << fits << "\\n";\n}',
          '0',
          'a is max - 5, which is greater than max - 6, so the sum would overflow and fits is false.',
        ),
        choose(
          'Why does the guard compare a with max - b instead of checking whether a + b is greater than max?',
          [
            'Computing a + b could itself overflow',
            'Subtraction is faster than addition',
            'An int sum cannot be compared with max',
            'max - b is shorter to write',
          ],
          0,
          'No int can be greater than max, and an overflowing a + b is undefined, so the check must avoid evaluating it.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\n#include <limits>\nint main() {\n  int a = std::numeric_limits<int>::max() - 6;\n  int b = 6;\n  if (a > std::numeric_limits<int>::max() - b) std::cout << "reject\\n";\n  else std::cout << (a + b == std::numeric_limits<int>::max()) << "\\n";\n}',
          '1',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <limits>\nint main() {\n  int a = -20;\n  int b = -7;\n  if (b < 0 && a < std::numeric_limits<int>::min() - b) std::cout << "underflow\\n";\n  else std::cout << a + b << "\\n";\n}',
          '-27',
          '-20 is far above min + 7, so the guard passes and the sum is -27.',
        ),
        choose(
          'b is negative. Which test detects that a + b would go below the minimum int?',
          ['a > max - b', 'a + b < min', 'a < min + b', 'a < min - b'],
          3,
          'min - b is safe to compute when b is negative. a + b < min would evaluate the overflowing sum, and min + b itself overflows.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\n#include <limits>\nint main() {\n  int a = std::numeric_limits<int>::min() + 2;\n  int b = -3;\n  bool safe = !(b > 0 && a > std::numeric_limits<int>::max() - b) &&\n              !(b < 0 && a < std::numeric_limits<int>::min() - b);\n  std::cout << safe << "\\n";\n}',
          '0',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <limits>\nint main() {\n  unsigned int zero = 0u;\n  unsigned int below = zero - 1u;\n  std::cout << (below == std::numeric_limits<unsigned int>::max()) << "\\n";\n}',
          '1',
          'Subtracting 1 from 0 wraps to the maximum, so the comparison is true.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\n#include <limits>\nint main() {\n  unsigned int top = std::numeric_limits<unsigned int>::max();\n  std::cout << top + 3u << "\\n";\n}',
          '2',
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
        typeOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  unsigned int a = 3u;\n  unsigned int b = 5u;\n  std::cout << (a - b > a) << "\\n";\n}',
          '1',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint main() {\n  unsigned int have = 10u;\n  unsigned int need = 3u;\n  if (need > have) std::cout << "short\\n";\n  else std::cout << have - need << "\\n";\n}',
          '7',
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
        typeOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  unsigned int a = 2u;\n  unsigned int b = 5u;\n  unsigned int gap = a - b;\n  std::cout << (gap > 1000u) << "\\n";\n}',
          '1',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <limits>\nint main() {\n  unsigned int used = 10u;\n  unsigned int extra = 5u;\n  if (extra > std::numeric_limits<unsigned int>::max() - used) std::cout << "rejected\\n";\n  else std::cout << used + extra << "\\n";\n}',
          '15',
          'There is plenty of room above 10, so the program adds and prints 15.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\n#include <limits>\nint main() {\n  unsigned int used = std::numeric_limits<unsigned int>::max() - 2u;\n  unsigned int total = used + 5u;\n  std::cout << total << "\\n";\n}',
          '2',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nenum class Door { Open, Closed };\nint main() {\n  Door d = Door::Closed;\n  std::cout << (d == Door::Open) << "\\n";\n}',
          '0',
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
        typeOutput(
          'What does this program print?',
          '#include <iostream>\nenum class Mode { Fast, Safe };\nint main() {\n  Mode a = Mode::Safe;\n  Mode b = a;\n  std::cout << (a == b) << (b != Mode::Fast) << "\\n";\n}',
          '11',
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
            'It does not compile',
            'It prints Level::High, its qualified name',
          ],
          2,
          'std::cout has no way to print a scoped enumeration, because it does not convert implicitly to int.',
          '#include <iostream>\nenum class Level { Low, High };\nint main() {\n  Level level = Level::High;\n  std::cout << level << "\\n";\n}',
        ),
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nenum class Side { Buy, Sell };\nint main() {\n  Side s = Side::Buy;\n  int qty = 7;\n  std::cout << (s == Side::Buy ? qty : -qty) << "\\n";\n}',
          '7',
          's is Buy, so the conditional yields qty, which is 7.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\nenum class Fee { None, Flat };\nint main() {\n  Fee fee = Fee::Flat;\n  int cost = 100 + (fee == Fee::Flat ? 5 : 0);\n  std::cout << cost << "\\n";\n}',
          '105',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nenum class Signal { Stop, Slow, Go };\nint main() {\n  Signal s = Signal::Go;\n  int speed = s == Signal::Stop ? 0 : s == Signal::Slow ? 30 : 60;\n  std::cout << speed << "\\n";\n}',
          '60',
          'Go fails both tests, so the final branch gives 60.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\nenum class Tier { Basic, Plus, Pro };\nint main() {\n  Tier t = Tier::Basic;\n  int seats = t == Tier::Pro ? 10 : t == Tier::Plus ? 5 : 1;\n  std::cout << seats << "\\n";\n}',
          '1',
          'Basic is neither Pro nor Plus, so the last branch gives 1 seat.',
        ),
        choose(
          'Someone adds Fast to Signal but leaves the speed chain unchanged. What speed does Signal::Fast get?',
          [
            'A compile error',
            '0, from the first branch',
            'An unpredictable value',
            '60, from the final branch',
          ],
          3,
          'Fast fails the Stop and Slow tests, so it falls into the last branch: the chain must be updated deliberately.',
          'enum class Signal { Stop, Slow, Go, Fast };\nint speed = s == Signal::Stop ? 0 : s == Signal::Slow ? 30 : 60;',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint main() {\n  auto x = 7;\n  auto y = x;\n  y = y * 3;\n  std::cout << x << " " << y << "\\n";\n}',
          '7 21',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint main() {\n  int stock = 8;\n  auto& ref = stock;\n  ref -= 3;\n  std::cout << stock << "\\n";\n}',
          '5',
          'ref is another name for stock, so subtracting through it changes stock to 5.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  int level = 2;\n  int& r = level;\n  auto c = r;\n  c = 9;\n  std::cout << level << "\\n";\n}',
          '2',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint main() {\n  int a = 1;\n  auto& b = a;\n  auto c = b;\n  b = 5;\n  std::cout << a << c << "\\n";\n}',
          '51',
          'b changes a to 5, while c kept the copy 1 it was initialized with.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  int score = 10;\n  auto saved = score;\n  auto& live = score;\n  live = live * 2;\n  std::cout << saved + live << "\\n";\n}',
          '30',
          'saved is 10, and live refers to score, which becomes 20, so the sum is 30.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  int n = 6;\n  auto& first = n;\n  auto& second = first;\n  second -= 2;\n  std::cout << n << " " << first << "\\n";\n}',
          '4 4',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint main() {\n  char c = \'x\';\n  std::cout << c << c << "\\n";\n}',
          'xx',
          'Each << prints the character x, with nothing between them.',
        ),
        choose(
          'Which declaration stores one character in a char?',
          ['char c = "A";', "char c = 'AB';", "char c = 'A';", 'char c = A;'],
          2,
          'Single quotes with exactly one character make a char literal. "A" is a string literal, and A alone is a name.',
        ),
        typeOutput(
          'What does this program print?',
          "#include <iostream>\nint main() {\n  char first = 'q';\n  char second = first;\n  first = 'r';\n  std::cout << first << second << \"\\n\";\n}",
          'rq',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint main() {\n  char c = \'a\';\n  std::cout << c + 1 << "\\n";\n}',
          '98',
          'c + 1 is int arithmetic on the code 97, so the program prints the int 98, not a character.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  char c = \'a\';\n  char d = c + 2;\n  std::cout << d << "\\n";\n}',
          'c',
          'Storing 97 + 2 in a char gives the character with code 99, which is c.',
        ),
        typeOutput(
          'What does this program print?',
          "#include <iostream>\nint main() {\n  char c = 'C';\n  int gap = c - 'A';\n  std::cout << gap << \"\\n\";\n}",
          '2',
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
        typeOutput(
          'What does this complete C++20 program print?',
          "#include <iostream>\nint main() {\n  char d = '4';\n  std::cout << (d - '0') + 1 << \"\\n\";\n}",
          '5',
          "d - '0' is the value 4, and adding 1 gives 5. Adding 1 to the character code itself would give 53.",
        ),
        typeOutput(
          'What does this program print?',
          "#include <iostream>\nint main() {\n  char tens = '3';\n  char ones = '8';\n  int number = (tens - '0') * 10 + (ones - '0');\n  std::cout << number << \"\\n\";\n}",
          '38',
          'The digits convert to 3 and 8, and 3 * 10 + 8 is 38.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  int value = 6;\n  char digit = \'0\' + value;\n  std::cout << digit << "\\n";\n}',
          '6',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint main() {\n  std::cout << sizeof(char) * 10 << "\\n";\n}',
          '10',
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
        typeOutput(
          'This compiler uses a 4-byte int. What does this program print?',
          '#include <iostream>\nint main() {\n  std::cout << sizeof(int) * 3 << "\\n";\n}',
          '12',
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
        typeOutput(
          'What does this complete C++20 program print on a compiler with a 4-byte int?',
          '#include <iostream>\nint main() {\n  int tiny = 1;\n  int huge = 2000000000;\n  std::cout << sizeof(tiny) << " " << sizeof(huge) << "\\n";\n}',
          '4 4',
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
        typeOutput(
          'What does this program print?',
          "#include <iostream>\nint main() {\n  char a = 'x';\n  char b = 'y';\n  std::cout << sizeof(a) + sizeof(b) << \"\\n\";\n}",
          '2',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint main() {\n  int items = 8;\n  std::cout << items * sizeof(char) << "\\n";\n}',
          '8',
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
        typeOutput(
          'What does this program print with a 4-byte int?',
          '#include <iostream>\nint main() {\n  int rows = 3;\n  int cols = 5;\n  std::cout << rows * cols * sizeof(int) << "\\n";\n}',
          '60',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <cstdint>\nint main() {\n  std::cout << sizeof(std::int32_t) * 8 << "\\n";\n}',
          '32',
          'std::int32_t is 4 bytes, and 4 bytes of 8 bits each are 32 bits.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\n#include <cstdint>\n#include <limits>\nint main() {\n  std::cout << std::numeric_limits<std::uint16_t>::max() << "\\n";\n}',
          '65535',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <cstdint>\nint main() {\n  std::uint8_t a = 200;\n  std::uint8_t b = 100;\n  std::uint8_t sum = static_cast<std::uint8_t>(a + b);\n  std::cout << static_cast<int>(sum) << "\\n";\n}',
          '44',
          '200 + 100 is 300 as an int, and 300 - 256 leaves 44 when it is stored in 8 bits.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\n#include <cstdint>\nint main() {\n  std::uint8_t a = 200;\n  std::uint8_t b = 100;\n  std::cout << a + b << "\\n";\n}',
          '300',
          'Both operands are promoted to int before adding, and the int sum 300 is printed without being stored back in 8 bits.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\n#include <cstdint>\nint main() {\n  std::uint16_t count = 65535;\n  count = static_cast<std::uint16_t>(count + 1);\n  std::cout << count << "\\n";\n}',
          '0',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <cstdint>\nint main() {\n  std::uint8_t v = 66;\n  std::cout << v << "\\n";\n}',
          'B',
          'std::uint8_t prints as a character, and code 66 is B.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\n#include <cstdint>\nint main() {\n  std::uint8_t v = 55;\n  std::cout << static_cast<int>(v) + 1 << "\\n";\n}',
          '56',
          'Converted to int, v is 55, and adding 1 gives the int 56.',
        ),
        choose(
          'Why does std::cout << value print a letter when value is a std::uint8_t holding 72?',
          [
            'It is usually unsigned char, printed as a character',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <type_traits>\nint main() {\n  std::cout << std::is_same_v<unsigned, unsigned int> << "\\n";\n}',
          '1',
          'unsigned is another spelling of unsigned int, so the trait is true.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\n#include <type_traits>\nint main() {\n  std::cout << std::is_same_v<char, signed char> << std::is_same_v<int, signed int> << "\\n";\n}',
          '01',
          'char, signed char, and unsigned char are three distinct types, so the first test is 0, while signed int is just int.',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <type_traits>\nint main() {\n  std::cout << std::is_integral_v<char> << " " << std::is_floating_point_v<int> << "\\n";\n}',
          '1 0',
          'char counts as an integer type, and int is not a floating-point type.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\n#include <cstddef>\n#include <type_traits>\nint main() {\n  std::cout << std::is_unsigned_v<std::size_t> << std::is_signed_v<double> << "\\n";\n}',
          '11',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <cstdint>\n#include <type_traits>\nint main() {\n  bool ok = sizeof(std::int16_t) == 2 && std::is_unsigned_v<std::int16_t>;\n  std::cout << ok << "\\n";\n}',
          '0',
          'The size matches, but std::int16_t is signed, so the combined requirement is false.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\n#include <cstdint>\n#include <type_traits>\nint main() {\n  bool same = std::is_same_v<std::uint8_t, std::int8_t>;\n  bool equal_size = sizeof(std::uint8_t) == sizeof(std::int8_t);\n  std::cout << same << equal_size << "\\n";\n}',
          '01',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint main() {\n  unsigned x = 5u;\n  std::cout << (x << 3) << "\\n";\n}',
          '40',
          'Shifting left 3 places multiplies by 8, and 5 * 8 is 40.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  std::cout << (1u << 10) << "\\n";\n}',
          '1024',
          '1u << 10 is 2 to the 10th power, 1024; the zeros are binary, not decimal.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  std::cout << 1u << 3u << "\\n";\n}',
          '13',
          'Without parentheses both << are stream insertions, so the program prints 1 and then 3.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  unsigned flags = 1u;\n  flags = flags << 2;\n  flags = flags << 1;\n  std::cout << flags << "\\n";\n}',
          '8',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint main() {\n  unsigned bytes = 5000u;\n  std::cout << (bytes >> 10) << "\\n";\n}',
          '4',
          'Shifting right by 10 divides by 1024: 5000 / 1024 is 4 after discarding the remainder.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  unsigned v = 7u;\n  std::cout << (v >> 1) << " " << (v >> 3) << "\\n";\n}',
          '3 0',
          '7 / 2 is 3 and 7 / 8 is 0 once the fractions are discarded.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  unsigned v = 13u;\n  std::cout << ((v >> 2) << 2) << "\\n";\n}',
          '12',
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
        typeOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  unsigned mask = 1u << 31;\n  std::cout << (mask >> 31) << "\\n";\n}',
          '1',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint main() {\n  std::cout << 0x20 << "\\n";\n}',
          '32',
          'Hex 20 means 2 sixteens, which is 32 in decimal.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  std::cout << 0b111 << "\\n";\n}',
          '7',
          'Binary 111 is 4 + 2 + 1, which prints as 7.',
        ),
        choose(
          'Which literal equals 15?',
          ['0x15', '0b15', '0b1110', '0b1111'],
          3,
          'Binary 1111 is 8 + 4 + 2 + 1. 0x15 is 21, 0b1110 is 14, and 0b15 is not a valid literal.',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint main() {\n  unsigned v = 0b1101u;\n  std::cout << (v & 0b0110u) << "\\n";\n}',
          '4',
          'Only bit 2 (value 4) is set in both 1101 and 0110.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  unsigned v = 300u;\n  std::cout << (v & 0xFFu) << "\\n";\n}',
          '44',
          '300 is 256 + 44, and masking with 0xFF removes the 256 bit, leaving 44.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  unsigned flags = 0b1010u;\n  bool has_bit1 = (flags & 0b0010u) != 0u;\n  std::cout << has_bit1 << "\\n";\n}',
          '1',
          'Bit 1 is set in 1010, so the masked value is 2, which is nonzero.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  unsigned a = 0b0100u;\n  unsigned b = 0b0011u;\n  std::cout << (a & b) << " " << (a && b) << "\\n";\n}',
          '0 1',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint main() {\n  unsigned v = 0b1000u;\n  std::cout << (v | 0b0011u) << "\\n";\n}',
          '11',
          'The result has bits 3, 1, and 0 set: 8 + 2 + 1 is 11.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  unsigned v = 0b0101u;\n  std::cout << (v | 0b0100u) << "\\n";\n}',
          '5',
          'Bit 2 is already set, so OR-ing it in again leaves 5 unchanged.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  unsigned high = 0x12u;\n  unsigned low = 0x34u;\n  std::cout << ((high * 256u) | low) << "\\n";\n}',
          '4660',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint main() {\n  unsigned bit5 = 1u << 5;\n  std::cout << bit5 << "\\n";\n}',
          '32',
          'Only bit 5 is set, which is worth 2 to the 5th, 32.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  unsigned flags = (1u << 0) | (1u << 2);\n  std::cout << flags << "\\n";\n}',
          '5',
          'Bits 0 and 2 are worth 1 and 4, so the combined flags are 5.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  unsigned flags = 0b1010u;\n  std::cout << ((flags & (1u << 1)) != 0u) << ((flags & (1u << 2)) != 0u) << "\\n";\n}',
          '10',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint main() {\n  std::cout << (2 ^ 3) << "\\n";\n}',
          '1',
          '^ is exclusive or: 10 ^ 11 is 01 in binary, so the result is 1, not 2 cubed.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  unsigned v = 0b1100u;\n  v = v ^ (1u << 2);\n  std::cout << v << "\\n";\n}',
          '8',
          'Bit 2 was set, so toggling it turns it off: 1100 becomes 1000, which is 8.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  unsigned v = 9u;\n  v ^= 4u;\n  v ^= 4u;\n  std::cout << v << "\\n";\n}',
          '9',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint main() {\n  unsigned v = 0b0111u;\n  std::cout << (v & ~0b0100u) << "\\n";\n}',
          '3',
          'Bit 2 is cleared, so 0111 becomes 0011, which is 3.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  unsigned v = 0b1010u;\n  std::cout << (v & ~(1u << 0)) << "\\n";\n}',
          '10',
          'Bit 0 is already clear, so clearing it again leaves 10 unchanged.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  unsigned v = 0b1010u;\n  std::cout << (v & (1u << 3)) << "\\n";\n}',
          '8',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <cstdint>\nint main() {\n  std::uint32_t word = 0xAB00u;\n  std::cout << (word >> 8) << "\\n";\n}',
          '171',
          'Byte 1 is 0xAB, and shifting it down gives 171.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\n#include <cstdint>\nint main() {\n  std::uint32_t w = 0x05000000u;\n  std::cout << (w >> 24) << "\\n";\n}',
          '5',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <cstdint>\nint main() {\n  std::uint32_t word = 0x123456u;\n  std::cout << (word >> 8) << "\\n";\n}',
          '4660',
          'Without a mask, byte 2 is still present above byte 1: the result is 0x1234, 4660.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\n#include <cstdint>\nint main() {\n  std::uint32_t word = 0x123456u;\n  std::cout << ((word & 0xFFu) >> 8) << "\\n";\n}',
          '0',
          'Masking first keeps only 0x56, and shifting that right 8 places leaves 0.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\n#include <cstdint>\nint main() {\n  std::uint32_t word = 0x0000FF01u;\n  std::cout << ((word >> 8) & 0xFFu) << " " << (word & 0xFFu) << "\\n";\n}',
          '255 1',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <cstdint>\nint main() {\n  std::uint32_t word = 0x11223344u;\n  std::uint8_t top = static_cast<std::uint8_t>((word >> 24) & 0xFFu);\n  std::cout << static_cast<int>(top) << "\\n";\n}',
          '17',
          'The top byte is 0x11, which is 17.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\n#include <cstdint>\nint main() {\n  std::uint32_t word = 0x4142u;\n  std::uint8_t high = static_cast<std::uint8_t>((word >> 8) & 0xFFu);\n  std::cout << high << "\\n";\n}',
          'A',
          'Byte 1 is 0x41, which is 65, and a std::uint8_t prints as the character with that code: A.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\n#include <cstdint>\nint main() {\n  std::uint32_t word = 0x01020304u;\n  int sum = static_cast<int>(word & 0xFFu) + static_cast<int>((word >> 24) & 0xFFu);\n  std::cout << sum << "\\n";\n}',
          '5',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint main() {\n  int stock = 0;\n  if (stock == 0) std::cout << "reorder\\n";\n  std::cout << "checked\\n";\n}',
          'reorder\nchecked',
          'The condition is true, so reorder prints first, followed by the unconditional checked.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  int x = 4;\n  if (x > 10) std::cout << "big\\n";\n  std::cout << x << "\\n";\n}',
          '4',
          '4 > 10 is false, so only the statement after the if runs.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  int points = 5;\n  if (points >= 5) points = points * 2;\n  std::cout << points << "\\n";\n}',
          '10',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint main() {\n  int n = 7;\n  if (n == 7) std::cout << "lucky\\n";\n  else std::cout << "plain\\n";\n}',
          'lucky',
          'n == 7 is true, so only the first branch runs.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  int a = 3;\n  int b = 3;\n  if (a > b) std::cout << a << "\\n";\n  else std::cout << b + 1 << "\\n";\n}',
          '4',
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
        typeOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  int total = 0;\n  int qty = 3;\n  if (qty > 2) {\n    total = qty * 10;\n    std::cout << "bulk ";\n  } else {\n    total = qty * 12;\n  }\n  std::cout << total << "\\n";\n}',
          'bulk 30',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint main() {\n  int score = 85;\n  if (score >= 90) std::cout << "A\\n";\n  else if (score >= 80) std::cout << "B\\n";\n  else std::cout << "C\\n";\n}',
          'B',
          '85 fails the first test and passes the second, so B is printed and the chain stops.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  int score = 95;\n  if (score >= 80) std::cout << "B\\n";\n  else if (score >= 90) std::cout << "A\\n";\n  else std::cout << "C\\n";\n}',
          'B',
          'The first true test wins: 95 >= 80 is checked first, so B is printed even though 95 >= 90.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  int t = 15;\n  if (t < 0) std::cout << "ice\\n";\n  else if (t < 20) std::cout << "cool\\n";\n  else if (t < 10) std::cout << "cold\\n";\n  else std::cout << "warm\\n";\n}',
          'cool',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint main() {\n  int hour = 20;\n  std::cout << (hour >= 9 && hour < 17) << "\\n";\n}',
          '0',
          'hour >= 9 is true but hour < 17 is false, so && gives false, printed as 0.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  int a = 5;\n  int b = 5;\n  std::cout << (a == b && a > 0) << (a == b && b > 9) << "\\n";\n}',
          '10',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint main() {\n  int code = 404;\n  std::cout << (code == 200 || code == 204) << "\\n";\n}',
          '0',
          'Neither comparison is true, so || is false.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  bool rain = true;\n  bool snow = true;\n  std::cout << (rain || snow) << "\\n";\n}',
          '1',
          '|| is true when at least one operand is true, and that includes both being true.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  int x = -3;\n  std::cout << (x < 0 || x > 100) << (x > 0 || x == -3) << "\\n";\n}',
          '11',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint main() {\n  bool a = true;\n  bool b = false;\n  bool c = false;\n  std::cout << (a || b && c) << " " << ((a || b) && c) << "\\n";\n}',
          '1 0',
          'The first groups as a || (b && c), which is true; the second requires c, which is false.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  int n = 4;\n  std::cout << !(n > 2) << "\\n";\n}',
          '0',
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
        typeOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  bool done = false;\n  bool failed = true;\n  std::cout << (!done && !failed) << "\\n";\n}',
          '0',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint main() {\n  int stock = 0;\n  int shown = stock > 0 ? stock : -1;\n  std::cout << shown << "\\n";\n}',
          '-1',
          'stock > 0 is false, so shown takes the second value, -1.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  int score = 75;\n  std::cout << (score >= 60 ? 1 : 0) << "\\n";\n}',
          '1',
          '75 >= 60 is true, so the expression is 1.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  int x = -4;\n  int magnitude = x < 0 ? -x : x;\n  std::cout << magnitude << "\\n";\n}',
          '4',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint main() {\n  int calls = 0;\n  int x = 2;\n  int y = x > 5 ? ++calls : calls + 100;\n  std::cout << y << " " << calls << "\\n";\n}',
          '100 0',
          'x > 5 is false, so only calls + 100 is evaluated; the increment never happens.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  int a = 0;\n  int b = 0;\n  int pick = 1;\n  int r = pick == 1 ? ++a : ++b;\n  std::cout << a << b << r << "\\n";\n}',
          '101',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint main() {\n  int base = 10;\n  bool vip = false;\n  int total = base + vip ? 5 : 0;\n  std::cout << total << "\\n";\n}',
          '5',
          'Without parentheses the condition is base + vip, which is 10 and therefore true, so total is 5.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  int n = 3;\n  int m = 2 * (n > 2 ? n : 2);\n  std::cout << m << "\\n";\n}',
          '6',
          'n > 2 is true, so the parenthesized conditional is 3, and 2 * 3 is 6.',
        ),
        choose(
          'What is wrong with int r = flag ? 42 : "none";?',
          [
            'It always yields 42',
            'Its two result types are incompatible',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint main() {\n  for (int i = 1; i <= 4; ++i) std::cout << i;\n  std::cout << "\\n";\n}',
          '1234',
          'i starts at 1 and the body runs while i <= 4, so 1 through 4 are printed.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  int total = 0;\n  for (int i = 0; i < 5; ++i) total += i;\n  std::cout << total << "\\n";\n}',
          '10',
          'The loop adds 0 + 1 + 2 + 3 + 4, which is 10; 5 itself is never added.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  for (int i = 10; i > 7; --i) std::cout << i << ",";\n  std::cout << "\\n";\n}',
          '10,9,8,',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint main() {\n  int n = 0;\n  for (int i = 3; i < 8; ++i) ++n;\n  std::cout << n << "\\n";\n}',
          '5',
          'The loop visits 3, 4, 5, 6, and 7: end - start is 8 - 3 = 5.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  int n = 0;\n  for (int i = 2; i <= 6; ++i) ++n;\n  std::cout << n << "\\n";\n}',
          '5',
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
        typeOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  int last = -1;\n  for (int i = 0; i < 6; ++i) last = i;\n  std::cout << last << "\\n";\n}',
          '5',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint main() {\n  int total = 100;\n  for (int i = 0; i < 0; ++i) total = 0;\n  std::cout << total << "\\n";\n}',
          '100',
          '0 < 0 is false, so the assignment never runs and total keeps 100.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  int n = 0;\n  for (int i = 10; i < 3; ++i) ++n;\n  std::cout << n << "\\n";\n}',
          '0',
          'The loop would need i < 3, but i starts at 10, so it never runs.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  int sum = 0;\n  for (int i = 1; i < 6; i += 2) sum += i;\n  std::cout << sum << "\\n";\n}',
          '9',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint main() {\n  int n = 20;\n  int steps = 0;\n  while (n > 0) {\n    n -= 6;\n    ++steps;\n  }\n  std::cout << steps << " " << n << "\\n";\n}',
          '4 -4',
          'n goes 20, 14, 8, 2, -4. Four passes run, and the loop stops once n is no longer positive.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  int value = 1000;\n  int halvings = 0;\n  while (value >= 100) {\n    value /= 2;\n    ++halvings;\n  }\n  std::cout << halvings << "\\n";\n}',
          '4',
          'value goes 1000, 500, 250, 125, 62, so four halvings run.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  int n = 45;\n  int sum = 0;\n  while (n > 0) {\n    sum += n % 10;\n    n /= 10;\n  }\n  std::cout << sum << "\\n";\n}',
          '9',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint main() {\n  int x = 2;\n  while (x < 2) x = x * 10;\n  std::cout << x << "\\n";\n}',
          '2',
          '2 < 2 is false at the start, so x is never multiplied.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  int digits = 0;\n  int n = 0;\n  while (n != 0) {\n    n /= 10;\n    ++digits;\n  }\n  std::cout << digits << "\\n";\n}',
          '0',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint main() {\n  int n = 1234;\n  int digits = 0;\n  while (n != 0) {\n    n /= 10;\n    ++digits;\n  }\n  std::cout << digits << "\\n";\n}',
          '4',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint square(int n) {\n  return n * n;\n}\nint main() {\n  std::cout << square(5) + 1 << "\\n";\n}',
          '26',
          'square(5) is 25, and adding 1 gives 26.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\nint area(int width, int height) {\n  return width * height;\n}\nint main() {\n  std::cout << area(3, 4) << " " << area(4, 3) << "\\n";\n}',
          '12 12',
          'Arguments are matched to parameters in order, and both products are 12.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\nint next(int n) {\n  return n + 1;\n}\nint main() {\n  std::cout << next(next(next(0))) << "\\n";\n}',
          '3',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint reset(int n) {\n  n = 0;\n  return n;\n}\nint main() {\n  int count = 7;\n  reset(count);\n  std::cout << count << "\\n";\n}',
          '7',
          'reset changed only its copy, and its returned 0 was not stored, so count is still 7.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\nint triple(int n) {\n  n *= 3;\n  return n;\n}\nint main() {\n  int a = 2;\n  int b = triple(a);\n  std::cout << a + b << "\\n";\n}',
          '8',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint span(int start, int end) {\n  return end - start;\n}\nint main() {\n  std::cout << span(3, 10) * 2 << "\\n";\n}',
          '14',
          'span(3, 10) is 7, and the call can be used in the larger expression 7 * 2.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\nint first(int a, int b) {\n  return a;\n  return b;\n}\nint main() {\n  std::cout << first(1, 2) << "\\n";\n}',
          '1',
          'The first return ends the function, so the second never runs.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\nint doubled(int n) {\n  return n * 2;\n}\nint main() {\n  int x = 4;\n  doubled(x);\n  std::cout << x << "\\n";\n}',
          '4',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nstruct Box {\n  int w;\n  int h;\n  int d;\n};\nint volume(const Box& box) {\n  return box.w * box.h * box.d;\n}\nint main() {\n  Box box{2, 3, 4};\n  std::cout << volume(box) << "\\n";\n}',
          '24',
          'The function multiplies the three members: 2 * 3 * 4 is 24.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\nstruct Point {\n  int x;\n  int y;\n};\nint sum(const Point& p) {\n  return p.x + p.y;\n}\nint main() {\n  Point a{3, -1};\n  Point b{10, 5};\n  std::cout << sum(a) + sum(b) << "\\n";\n}',
          '17',
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
            'It does not compile: account is const',
          ],
          3,
          'Assigning to a member through a const reference is rejected by the compiler.',
          '#include <iostream>\nstruct Account {\n  int balance;\n};\nint drain(const Account& account) {\n  account.balance = 0;\n  return account.balance;\n}\nint main() {\n  Account a{50};\n  std::cout << drain(a) << "\\n";\n}',
        ),
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nstruct Tank {\n  int level;\n};\nint read(const Tank& tank) {\n  return tank.level;\n}\nint main() {\n  Tank tank{40};\n  tank.level += 5;\n  std::cout << read(tank) << "\\n";\n}',
          '45',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nstruct Wallet {\n  int cash;\n};\nvoid spend(Wallet& wallet, int amount) {\n  wallet.cash -= amount;\n}\nint left(const Wallet& wallet) {\n  return wallet.cash;\n}\nint main() {\n  Wallet wallet{50};\n  spend(wallet, 20);\n  spend(wallet, 5);\n  std::cout << left(wallet) << "\\n";\n}',
          '25',
          'Both calls change the same wallet: 50 - 20 - 5 is 25.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\nstruct Pair {\n  int a;\n  int b;\n};\nint copy_sum(Pair p) {\n  p.a = 100;\n  return p.a + p.b;\n}\nint main() {\n  Pair p{1, 2};\n  int s = copy_sum(p);\n  std::cout << s << " " << p.a << "\\n";\n}',
          '102 1',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <vector>\nint first_negative(const std::vector<int>& values) {\n  for (int i = 0; i < static_cast<int>(values.size()); ++i)\n    if (values[i] < 0) return i;\n  return -1;\n}\nint main() {\n  std::cout << first_negative({5, 3, -1}) << "\\n";\n}',
          '2',
          'The first negative value is at position 2.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\n#include <vector>\nint count_until_zero(const std::vector<int>& values) {\n  int count = 0;\n  for (int i = 0; i < static_cast<int>(values.size()); ++i) {\n    if (values[i] == 0) return count;\n    ++count;\n  }\n  return count;\n}\nint main() {\n  std::cout << count_until_zero({3, 8, 0, 4}) << "\\n";\n}',
          '2',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <vector>\nint find(const std::vector<int>& values, int target) {\n  for (int i = 0; i < static_cast<int>(values.size()); ++i)\n    if (values[i] == target) return i;\n  return -1;\n}\nint main() {\n  std::cout << find({4, 4, 4}, 4) << "\\n";\n}',
          '0',
          'The search returns at the first match, position 0.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\n#include <vector>\nint find(const std::vector<int>& values, int target) {\n  for (int i = 0; i < static_cast<int>(values.size()); ++i)\n    if (values[i] == target) return i;\n  return -1;\n}\nint main() {\n  std::cout << find({}, 1) << "\\n";\n}',
          '-1',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <vector>\nint find(const std::vector<int>& values, int target) {\n  for (int i = 0; i < static_cast<int>(values.size()); ++i)\n    if (values[i] == target) return i;\n  return -1;\n}\nint main() {\n  int pos = find({3, 6, 9}, 5);\n  if (pos != -1) std::cout << "at " << pos << "\\n";\n  else std::cout << "missing\\n";\n}',
          'missing',
          '5 is not present, so find returns -1 and the else branch runs.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\n#include <vector>\nint find(const std::vector<int>& values, int target) {\n  for (int i = 0; i < static_cast<int>(values.size()); ++i)\n    if (values[i] == target) return i;\n  return -1;\n}\nint main() {\n  std::vector<int> v{10, 20, 30, 20};\n  int pos = find(v, 20);\n  if (pos != -1) std::cout << pos << " " << v[pos] << "\\n";\n}',
          '1 20',
          'The first 20 is at position 1, and v[1] is 20.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\n#include <vector>\nint find_last(const std::vector<int>& values, int target) {\n  int last = -1;\n  for (int i = 0; i < static_cast<int>(values.size()); ++i)\n    if (values[i] == target) last = i;\n  return last;\n}\nint main() {\n  std::cout << find_last({2, 5, 2, 7}, 2) << "\\n";\n}',
          '2',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint main() {\n  int checks = 0;\n  bool ok = 7 > 1 && ++checks > 0;\n  std::cout << ok << " " << checks << "\\n";\n}',
          '1 1',
          'The left side is true, so the right side runs: checks becomes 1 and the result is true.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  int n = 0;\n  bool r = n != 0 && ++n > 0;\n  std::cout << r << n << "\\n";\n}',
          '00',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint main() {\n  int n = 0;\n  bool r = 2 > 5 || ++n == 1;\n  std::cout << r << n << "\\n";\n}',
          '11',
          'The left side is false, so ++n runs; n becomes 1 and the comparison is true.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  int n = 0;\n  bool r = n == 0 || ++n == 1;\n  std::cout << r << n << "\\n";\n}',
          '10',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint main() {\n  int count = 5;\n  int total = 50;\n  std::cout << (count != 0 && total / count >= 10) << "\\n";\n}',
          '1',
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
        typeOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  int d = 0;\n  int n = 9;\n  bool skip = d == 0 || n / d > 1;\n  std::cout << skip << "\\n";\n}',
          '1',
          'd == 0 is true, so || stops there and the division never runs.',
        ),
        choose(
          'Why is total / count > 2 && count != 0 dangerous?',
          [
            'count != 0 is evaluated twice',
            '&& evaluates its operands from right to left',
            'It is always false',
            'It can divide by zero before the check runs',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint main() {\n  int v = 10;\n  std::cout << (1 <= v && v <= 10) << (1 <= v && v < 10) << "\\n";\n}',
          '10',
          '10 is inside the inclusive range, but v < 10 excludes it from the second.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  int age = 0;\n  std::cout << (1 <= age && age <= 120) << "\\n";\n}',
          '0',
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
        typeOutput(
          'This program spells out how C++ groups 0 <= v <= 3. What does it print?',
          '#include <iostream>\nint main() {\n  int v = -5;\n  std::cout << ((0 <= v) <= 3) << "\\n";\n}',
          '1',
          '0 <= -5 is false, which is 0, and 0 <= 3 is true, so the grouped test prints 1 even though -5 is out of range.',
        ),
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint main() {\n  int v = 2;\n  std::cout << ((5 <= v) <= 9) << " " << (5 <= v && v <= 9) << "\\n";\n}',
          '1 0',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint main() {\n  int v = 100;\n  std::cout << (v < 0 || v > 100) << "\\n";\n}',
          '0',
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
        typeOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  int x = 15;\n  std::cout << !(1 <= x && x <= 10) << (x < 1 || x > 10) << "\\n";\n}',
          '11',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <array>\nint main() {\n  std::array<int, 4> a{5, 6, 7, 8};\n  std::cout << a[1] << a[3] << "\\n";\n}',
          '68',
          'Index 1 is the second element, 6, and index 3 is the fourth, 8.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\n#include <array>\nint main() {\n  std::array<int, 5> a{1, 2, 3, 4, 5};\n  std::cout << a[a.size() - 1] << "\\n";\n}',
          '5',
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
            'It fails to compile: the size is fixed',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <array>\nint main() {\n  std::array<int, 3> counts{};\n  counts[1] += 2;\n  std::cout << counts[0] << counts[1] << counts[2] << "\\n";\n}',
          '020',
          'All three counts start at 0, and only counts[1] becomes 2.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\n#include <array>\n#include <cstddef>\nint main() {\n  std::array<int, 5> a{1, 2};\n  int sum = 0;\n  for (std::size_t i = 0; i < a.size(); ++i) sum += a[i];\n  std::cout << sum << "\\n";\n}',
          '3',
          'The array holds 1, 2, 0, 0, 0, so the sum is 3.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\n#include <array>\nint main() {\n  std::array<int, 2> a{4, 9};\n  std::array<int, 2> b = a;\n  b[0] = 0;\n  std::cout << a[0] << b[0] << "\\n";\n}',
          '40',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <array>\n#include <cstddef>\nint main() {\n  std::array<int, 4> a{2, 4, 6, 8};\n  for (std::size_t i = 0; i < a.size(); i += 2) std::cout << a[i];\n  std::cout << "\\n";\n}',
          '26',
          'Stepping by 2 visits indices 0 and 2, which hold 2 and 6.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\n#include <array>\n#include <cstddef>\nint main() {\n  std::array<int, 3> a{1, 2, 3};\n  for (std::size_t i = 0; i < a.size(); ++i) a[i] = a[i] * 10;\n  std::cout << a[0] + a[2] << "\\n";\n}',
          '40',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <array>\nint main() {\n  std::array<int, 3> a{2, 5, 7};\n  int sum = 0;\n  for (int x : a) sum += x;\n  std::cout << sum << "\\n";\n}',
          '14',
          'Each element is added once: 2 + 5 + 7 is 14.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\n#include <array>\nint main() {\n  std::array<int, 4> a{1, 2, 3, 4};\n  int product = 1;\n  for (int x : a) product *= x;\n  std::cout << product << "\\n";\n}',
          '24',
          'Multiplying all four elements gives 24.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\n#include <array>\nint main() {\n  std::array<int, 3> a{};\n  int visits = 0;\n  for (int x : a) visits += 1 + x;\n  std::cout << visits << "\\n";\n}',
          '3',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <array>\nint main() {\n  std::array<int, 2> a{5, 6};\n  for (int x : a) x += 100;\n  std::cout << a[0] + a[1] << "\\n";\n}',
          '11',
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
        typeOutput(
          'What does this program print?',
          '#include <iostream>\n#include <array>\nint main() {\n  std::array<int, 3> a{4, 4, 4};\n  int changed = 0;\n  for (int x : a) {\n    x = 9;\n    changed += x;\n  }\n  std::cout << changed << " " << a[0] << "\\n";\n}',
          '27 4',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <array>\nint main() {\n  std::array<int, 4> a{1, 2, 3, 4};\n  for (int x : a) {\n    if (x == 2) continue;\n    std::cout << x;\n  }\n  std::cout << "\\n";\n}',
          '134',
          'Only the pass for 2 is skipped; the loop carries on with 3 and 4.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\n#include <array>\nint main() {\n  std::array<int, 5> a{0, 7, 0, 7, 0};\n  int count = 0;\n  for (int x : a) {\n    if (x == 0) continue;\n    ++count;\n  }\n  std::cout << count << "\\n";\n}',
          '2',
          'The three zeros are skipped, so only the two 7s are counted.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  for (int i = 1; i <= 5; ++i) {\n    if (i == 3) continue;\n    std::cout << i;\n  }\n  std::cout << "\\n";\n}',
          '1245',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint main() {\n  for (int i = 1; i <= 10; ++i) {\n    if (i * i > 20) break;\n    std::cout << i;\n  }\n  std::cout << "\\n";\n}',
          '1234',
          '5 * 5 is the first square above 20, so the loop stops before printing 5.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\n#include <array>\nint main() {\n  std::array<int, 4> a{3, 3, 9, 3};\n  int seen = 0;\n  for (int x : a) {\n    ++seen;\n    if (x == 9) break;\n  }\n  std::cout << seen << "\\n";\n}',
          '3',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <array>\nint main() {\n  std::array<int, 6> readings{-2, -2, 5, 0, 5, 5};\n  int total = 0;\n  for (int x : readings) {\n    if (x < 0) continue;\n    if (x == 0) break;\n    total += x;\n  }\n  std::cout << total << "\\n";\n}',
          '5',
          'Only the first 5 is added before the 0 stops the loop.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\n#include <array>\nint main() {\n  std::array<int, 4> a{3, -4, 0, 2};\n  int total = 0;\n  for (int x : a) {\n    if (x == 0) break;\n    if (x < 0) continue;\n    total += x;\n  }\n  std::cout << total << "\\n";\n}',
          '3',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <array>\nint main() {\n  std::array<int, 4> a{1, 1, 1, 1};\n  for (int& x : a) x += 2;\n  int sum = 0;\n  for (int x : a) sum += x;\n  std::cout << sum << "\\n";\n}',
          '12',
          'Each element becomes 3, so the four elements add to 12.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\n#include <array>\nint main() {\n  std::array<int, 3> a{5, 6, 7};\n  for (int x : a) x = 0;\n  for (int& y : a) y -= 1;\n  std::cout << a[0] << a[1] << a[2] << "\\n";\n}',
          '456',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <array>\nint main() {\n  std::array<int, 3> a{1, 2, 3};\n  for (auto x : a) x *= 5;\n  std::cout << a[1] << "\\n";\n}',
          '2',
          'Plain auto copies each element, so the array is unchanged and a[1] is 2.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\n#include <array>\nint main() {\n  std::array<int, 4> a{4, 3, 2, 1};\n  int i = 0;\n  for (auto& x : a) {\n    x = i;\n    ++i;\n  }\n  std::cout << a[0] << a[3] << "\\n";\n}',
          '03',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <array>\nint main() {\n  std::array<int, 3> a{5, 5, 5};\n  int running = 0;\n  for (int& x : a) {\n    running += x;\n    x = running;\n  }\n  std::cout << a[2] << "\\n";\n}',
          '15',
          'The last element becomes the full running total, 15.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\n#include <array>\nint main() {\n  std::array<int, 3> a{5, 5, 5};\n  int running = 0;\n  for (int x : a) {\n    running += x;\n    x = running;\n  }\n  std::cout << a[2] << "\\n";\n}',
          '5',
          'The loop variable is a copy, so the totals are written only to copies and a[2] stays 5.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\n#include <array>\nint main() {\n  std::array<int, 3> a{3, 1, 2};\n  for (auto& x : a) x = x * x;\n  int sum = 0;\n  for (auto x : a) sum += x;\n  std::cout << sum << "\\n";\n}',
          '14',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint scale(int x) {\n  return x * 10;\n}\ndouble scale(double x) {\n  return x * 100;\n}\nint main() {\n  std::cout << scale(2) << " " << scale(0.5) << "\\n";\n}',
          '20 50',
          'scale(2) uses the int version (20) and scale(0.5) the double version (50).',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\nint kind(int) {\n  return 1;\n}\nint kind(double) {\n  return 2;\n}\nint main() {\n  std::cout << kind(3) << kind(3.0) << kind(7 / 2) << "\\n";\n}',
          '121',
          '7 / 2 is integer division, so its type is int and it selects the first overload.',
        ),
        choose(
          'Which pair declares two distinct overloads of f?',
          [
            'int f(int); double f(int);',
            'int f(int x); int f(int y);',
            'int f(int); int f(double);',
            'double f(int); double f(int);',
          ],
          2,
          'Only int f(int); int f(double); differs in parameter types; parameter names and return types do not count.',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint half(int x) {\n  return x / 2;\n}\ndouble half(double x) {\n  return x / 2;\n}\nint main() {\n  std::cout << half(9) << " " << half(9.0) << "\\n";\n}',
          '4 4.5',
          '9 selects the int overload (4) and 9.0 the double overload (4.5).',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\ndouble area(double radius) {\n  return 3 * radius * radius;\n}\nint area(int side) {\n  return side * side;\n}\nint main() {\n  std::cout << area(2) + area(1.0) << "\\n";\n}',
          '7',
          'area(2) is the int version, 4; area(1.0) is the double version, 3.0; the sum prints as 7.',
        ),
        choose(
          'Why do int f(int) and double f(int) fail to compile together?',
          [
            'Two functions named f cannot both return numbers',
            'Return types alone cannot pick an overload',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint count(int) {\n  return 1;\n}\nint count(int, int) {\n  return 2;\n}\nint main() {\n  std::cout << count(5) + count(5, 6) << "\\n";\n}',
          '3',
          'One argument calls the version returning 1, two arguments the version returning 2.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\ndouble average(int a, int b) {\n  return (a + b) / 2.0;\n}\nint average(int a) {\n  return a;\n}\nint main() {\n  std::cout << average(3, 4) << " " << average(3) << "\\n";\n}',
          '3.5 3',
          'The two-argument version divides by 2.0 and returns 3.5; the one-argument version returns 3.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\nint g(int) {\n  return 1;\n}\nint g(double) {\n  return 2;\n}\nint main() {\n  std::cout << g(2) * g(2.5) << "\\n";\n}',
          '2',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint seats(int people, int extra = 1) {\n  return people + extra;\n}\nint main() {\n  std::cout << seats(4) << "\\n";\n}',
          '5',
          'extra is omitted, so its default 1 is added to 4.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\nint grow(int n, int step = 2) {\n  return n * step;\n}\nint main() {\n  std::cout << grow(5, 3) + grow(5) << "\\n";\n}',
          '25',
          'grow(5, 3) is 15 and grow(5) uses step 2 for 10, so the sum is 25.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\nint f(int a, int b = 10) {\n  return a - b;\n}\nint main() {\n  std::cout << f(4, 0) << " " << f(4) << "\\n";\n}',
          '4 -6',
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
          'Only int f(int a, int b = 1); gives defaults to trailing parameters alone.',
        ),
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint box(int w, int h = 2, int d = 3) {\n  return w * h * d;\n}\nint main() {\n  std::cout << box(2, 1) << "\\n";\n}',
          '6',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint level(int n = 1) {\n  return n * n;\n}\nint main() {\n  std::cout << level() + level(3) << "\\n";\n}',
          '10',
          'level() uses 1 and returns 1; level(3) returns 9.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\nint add(int a, int b = 5) {\n  return a + b;\n}\nint main() {\n  int b = 100;\n  std::cout << add(1) << "\\n";\n}',
          '6',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint main() {\n  int a = 3;\n  int& r = a;\n  r = 8;\n  std::cout << a << "\\n";\n}',
          '8',
          'Assigning to r assigns to a, because r is another name for a.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  int a = 3;\n  int& r = a;\n  a = a * 4;\n  std::cout << r << "\\n";\n}',
          '12',
          'Changes made through a are visible through r, since both name one object.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  int x = 1;\n  int& y = x;\n  int& z = y;\n  z += 9;\n  std::cout << x << y << "\\n";\n}',
          '1010',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint main() {\n  int a = 2;\n  int b = a;\n  int& c = a;\n  b += 10;\n  c += 100;\n  std::cout << a << " " << b << "\\n";\n}',
          '102 12',
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
        typeOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  int n = 5;\n  int m = n;\n  int& k = m;\n  k = 0;\n  std::cout << n << m << "\\n";\n}',
          '50',
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
            'A reference needs an object to bind to',
            'r is a reserved name',
          ],
          2,
          'There is no such thing as an unbound reference, so the initializer is required.',
        ),
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint main() {\n  int stock = 10;\n  int& shelf = stock;\n  --shelf;\n  --stock;\n  std::cout << shelf << " " << stock << "\\n";\n}',
          '8 8',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nvoid reset(int& n) {\n  n = 0;\n}\nint main() {\n  int count = 7;\n  reset(count);\n  std::cout << count << "\\n";\n}',
          '0',
          "n refers to count, so assigning 0 changes the caller's variable.",
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\nvoid twice(int& n) {\n  n *= 2;\n}\nint main() {\n  int a = 3;\n  twice(a);\n  twice(a);\n  std::cout << a << "\\n";\n}',
          '12',
          'Each call doubles the same a: 3 becomes 6, then 12.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\nvoid copy_change(int n) {\n  n = 50;\n}\nvoid ref_change(int& n) {\n  n = 60;\n}\nint main() {\n  int a = 1;\n  int b = 2;\n  copy_change(a);\n  ref_change(b);\n  std::cout << a << " " << b << "\\n";\n}',
          '1 60',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nvoid bad_swap(int& a, int& b) {\n  a = b;\n  b = a;\n}\nint main() {\n  int x = 1;\n  int y = 2;\n  bad_swap(x, y);\n  std::cout << x << y << "\\n";\n}',
          '22',
          'a = b overwrites x with 2 before it is saved, so b = a copies 2 back.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\nvoid swap_copies(int a, int b) {\n  int t = a;\n  a = b;\n  b = t;\n}\nint main() {\n  int x = 4;\n  int y = 9;\n  swap_copies(x, y);\n  std::cout << x << y << "\\n";\n}',
          '49',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint next_ticket(int& counter) {\n  counter += 1;\n  return counter * 100;\n}\nint main() {\n  int c = 0;\n  next_ticket(c);\n  int t = next_ticket(c);\n  std::cout << c << " " << t << "\\n";\n}',
          '2 200',
          'Both calls increment c, and the second returns 2 * 100.',
        ),
        choose(
          'A function named read_level(int& level) also sets level to 0. Why is that a problem?',
          [
            'int& parameters can never be changed',
            'The change is lost when the function returns',
            'Callers expect a read-only query, not a change',
            'The program will not compile',
          ],
          2,
          'Nothing in the call shows the mutation, so it should be part of the stated contract or avoided.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\nvoid bump(int& a, int b) {\n  a += b;\n  b += a;\n}\nint main() {\n  int a = 1;\n  int b = 2;\n  bump(a, b);\n  std::cout << a << b << "\\n";\n}',
          '32',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint main() {\n  int a = 10;\n  int b = 20;\n  int& r = a;\n  r = b;\n  b = 30;\n  std::cout << a << " " << r << "\\n";\n}',
          '20 20',
          'r = b copied 20 into a. r still names a, so the later change to b does not show.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  int a = 1;\n  int b = 2;\n  int& r = a;\n  r = b;\n  r = 7;\n  std::cout << a << b << "\\n";\n}',
          '72',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint main() {\n  int left = 3;\n  int right = 9;\n  int& r = left;\n  r = right;\n  r += 1;\n  std::cout << left << " " << right << "\\n";\n}',
          '10 9',
          'r stays bound to left: it receives 9 and then becomes 10, while right stays 9.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  int a = 0;\n  int b = 5;\n  int& r = a;\n  r = b;\n  b = r + 1;\n  std::cout << a << b << "\\n";\n}',
          '56',
          'a becomes 5 through r, and then b becomes a + 1, which is 6.',
        ),
        choose(
          'How can code make an existing reference refer to a different object?',
          [
            'Assign the other object to it',
            'Declare it again with the same name',
            'Write r = &other; to store the new address',
            'It cannot; a reference never rebinds',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint main() {\n  int stock = 12;\n  int* p = &stock;\n  std::cout << *p + 1 << "\\n";\n}',
          '13',
          '*p reads 12, and adding 1 gives 13; the pointer itself is not changed.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  int a = 3;\n  int b = 9;\n  int* p = &b;\n  std::cout << *p << "\\n";\n}',
          '9',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint main() {\n  int a = 1;\n  int* p = &a;\n  *p = 50;\n  std::cout << a << "\\n";\n}',
          '50',
          'Assigning to *p assigns to a.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  int a = 2;\n  int* p = &a;\n  int b = *p;\n  *p = 8;\n  std::cout << a << " " << b << "\\n";\n}',
          '8 2',
          'b copied 2 before the write; the write through p changes only a.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  int n = 5;\n  int* p = &n;\n  n = 6;\n  std::cout << *p * 2 << "\\n";\n}',
          '12',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nvoid triple(int* p) {\n  *p = *p * 3;\n}\nint main() {\n  int v = 4;\n  triple(&v);\n  triple(&v);\n  std::cout << v << "\\n";\n}',
          '36',
          'Each call triples the same v: 4, 12, 36.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\nint read(const int* p) {\n  return *p;\n}\nint main() {\n  int a = 7;\n  int b = 3;\n  std::cout << read(&a) - read(&b) << "\\n";\n}',
          '4',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint& alias_of(int& v) {\n  return v;\n}\nint main() {\n  int a = 1;\n  int& r = alias_of(a);\n  r = 20;\n  std::cout << a << "\\n";\n}',
          '20',
          'The returned reference names a, so r is another name for a.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\nint copy_of(int& v) {\n  return v;\n}\nint main() {\n  int a = 1;\n  int r = copy_of(a);\n  r = 20;\n  std::cout << a << "\\n";\n}',
          '1',
          'copy_of returns int, a copy of the value, so changing r leaves a alone.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\nint& alias_of(int& v) {\n  return v;\n}\nint main() {\n  int a = 5;\n  alias_of(alias_of(a)) *= 2;\n  std::cout << a << "\\n";\n}',
          '10',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint& slot(int& v) {\n  return v;\n}\nint main() {\n  int x = 3;\n  int copy = slot(x);\n  int& ref = slot(x);\n  ref += 1;\n  copy += 10;\n  std::cout << x << " " << copy << "\\n";\n}',
          '4 13',
          'ref changes x to 4; copy is independent and becomes 13.',
        ),
        choose(
          'f takes int& v and returns v as an int&. What is value after int value = f(x);?',
          [
            'Another name for x, bound by the call',
            'An independent int copied from x',
            'A pointer holding the address of x',
            'An int left uninitialized',
          ],
          1,
          'Initializing a plain int from a reference copies the referred value.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\nint& slot(int& v) {\n  return v;\n}\nint main() {\n  int a = 6;\n  slot(a) = 0;\n  std::cout << a << "\\n";\n}',
          '0',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint& counter(int& storage) {\n  storage += 1;\n  return storage;\n}\nint main() {\n  int calls = 5;\n  int& r = counter(calls);\n  r *= 2;\n  std::cout << calls << "\\n";\n}',
          '12',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint main() {\n  int* p = nullptr;\n  int x = 3;\n  p = &x;\n  std::cout << (p != nullptr) << "\\n";\n}',
          '1',
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
        typeOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  int* p = nullptr;\n  std::cout << (p == nullptr ? 1 : 2) << "\\n";\n}',
          '1',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint read_or(const int* p, int fallback) {\n  return p != nullptr ? *p : fallback;\n}\nint main() {\n  int stock = 0;\n  std::cout << read_or(&stock, 50) << "\\n";\n}',
          '0',
          'The pointer is not null, so the stored 0 is read; the fallback is only for a missing object.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\nint read_or(const int* p, int fallback) {\n  return p != nullptr ? *p : fallback;\n}\nint main() {\n  std::cout << read_or(nullptr, 7) + read_or(nullptr, 3) << "\\n";\n}',
          '10',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint main() {\n  int* p = nullptr;\n  std::cout << (p ? *p : -1) << "\\n";\n}',
          '-1',
          'A null pointer converts to false, so the fallback -1 is chosen.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  int a = 0;\n  int* p = &a;\n  std::cout << (p ? 10 : 20) << "\\n";\n}',
          '10',
          'The pointer is non-null, so the condition is true even though the int it points to is 0.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  int a = 5;\n  int* p = &a;\n  p = nullptr;\n  std::cout << (p ? *p : 0) << " " << a << "\\n";\n}',
          '0 5',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint main() {\n  int a = 3;\n  int b = 4;\n  int* p = &a;\n  *p = 10;\n  p = &b;\n  *p = 20;\n  std::cout << a << " " << b << "\\n";\n}',
          '10 20',
          'The first write goes to a; after reseating, the second write goes to b.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  int a = 1;\n  int b = 2;\n  int* p = &a;\n  int* q = p;\n  p = &b;\n  std::cout << *q << *p << "\\n";\n}',
          '12',
          'q copied the old address of a; only p was moved to b.',
        ),
        choose(
          'p is a pointer and r is a reference to a. How does p = &b; differ from r = b;?',
          [
            'Both make the name refer to b',
            'p moves to b; r = b copies b into a',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint main() {\n  int a = 1;\n  int b = 1;\n  int* p = &a;\n  *p += 1;\n  p = &b;\n  *p += 5;\n  std::cout << a << b << "\\n";\n}',
          '26',
          'a received the first increment and keeps 2; b received the second and becomes 6.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\nint main() {\n  int a = 4;\n  int b = 6;\n  int* p = &a;\n  int* q = &b;\n  p = q;\n  *p = 0;\n  std::cout << a << " " << b << "\\n";\n}',
          '4 0',
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
            'It compiles, but the write to a is ignored',
          ],
          1,
          'Through a pointer to const the pointed-to int can be read but not assigned.',
          '#include <iostream>\nint main() {\n  int a = 2;\n  const int* p = &a;\n  *p = 5;\n  std::cout << a << "\\n";\n}',
        ),
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint main() {\n  int a = 2;\n  const int* p = &a;\n  a = 9;\n  std::cout << *p << "\\n";\n}',
          '9',
          'const restricts writes through p, not through a; p reads the new value 9.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\nint total(const int* x, const int* y) {\n  return *x + *y;\n}\nint main() {\n  int a = 4;\n  int b = 6;\n  const int* p = &a;\n  std::cout << total(p, &b);\n  p = &b;\n  std::cout << " " << total(p, &b) << "\\n";\n}',
          '10 12',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <array>\nint main() {\n  std::array<int, 4> a{5, 6, 7, 8};\n  const int* p = a.data();\n  ++p;\n  std::cout << *p << "\\n";\n}',
          '6',
          '++p moves one element forward, from 5 to 6.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\n#include <array>\nint main() {\n  std::array<int, 4> a{5, 6, 7, 8};\n  const int* p = a.data() + 3;\n  std::cout << *(p - 1) << "\\n";\n}',
          '7',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <array>\nint main() {\n  std::array<int, 4> a{2, 2, 2, 2};\n  const int* end = a.data() + a.size();\n  int product = 1;\n  for (const int* p = a.data(); p != end; ++p) product *= *p;\n  std::cout << product << "\\n";\n}',
          '16',
          'The loop multiplies all four elements: 2 * 2 * 2 * 2 is 16.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\n#include <array>\nint main() {\n  std::array<int, 5> a{};\n  const int* end = a.data() + a.size();\n  int steps = 0;\n  for (const int* p = a.data(); p != end; ++p) ++steps;\n  std::cout << steps << "\\n";\n}',
          '5',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <array>\nint main() {\n  std::array<int, 5> a{1, 2, 3, 4, 5};\n  const int* p = a.data() + a.size();\n  --p;\n  --p;\n  std::cout << *p << "\\n";\n}',
          '4',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <array>\n#include <span>\nint main() {\n  std::array<int, 3> a{7, 8, 9};\n  std::span<const int> s = a;\n  std::cout << s[0] + s[2] << "\\n";\n}',
          '16',
          'The span sees the array elements 7 and 9.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\n#include <array>\n#include <span>\nint main() {\n  std::array<int, 3> a{1, 2, 3};\n  std::span<int> s = a;\n  s[0] = 50;\n  std::cout << a[0] << "\\n";\n}',
          '50',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <array>\n#include <cstddef>\n#include <span>\nstd::size_t count(std::span<const int> values) {\n  return values.size();\n}\nint main() {\n  std::array<int, 6> a{};\n  std::cout << count(a) << "\\n";\n}',
          '6',
          'The span covers all six elements; their values being 0 does not matter.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\n#include <array>\n#include <span>\nint sum(std::span<const int> values) {\n  int total = 0;\n  for (int x : values) total += x;\n  return total;\n}\nint main() {\n  std::array<int, 3> a{4, 5, 6};\n  std::cout << sum(a) << " " << sum({}) << "\\n";\n}',
          '15 0',
          'The second call passes an empty span, so the loop adds nothing.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\n#include <array>\n#include <span>\nint first(std::span<const int> values) {\n  return values[0];\n}\nint main() {\n  std::array<int, 3> a{9, 8, 7};\n  a[0] = 1;\n  std::cout << first(a) << "\\n";\n}',
          '1',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <array>\n#include <span>\nint main() {\n  std::array<int, 2> a{5, 5};\n  std::span<const int> v = a;\n  a[0] = 0;\n  std::cout << v[0] + v[1] << "\\n";\n}',
          '5',
          'v views a, so it sees the 0 written into a[0].',
        ),
        choose(
          'A function returns a std::span over a std::array that is a local variable of that function. What is wrong?',
          [
            'Nothing; the span keeps the array alive',
            'The span dangles once the array dies',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <array>\n#include <span>\nint main() {\n  std::array<int, 4> a{10, 20, 30, 40};\n  std::span<const int> s = a;\n  std::span<const int> t = s.subspan(1);\n  std::cout << t[0] << " " << t.size() << "\\n";\n}',
          '20 3',
          'The tail starts at 20 and has 4 - 1 = 3 elements.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\n#include <array>\n#include <span>\nint main() {\n  std::array<int, 3> a{1, 2, 3};\n  std::span<const int> s = a;\n  std::cout << s.subspan(3).size() << "\\n";\n}',
          '0',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <array>\n#include <span>\nint main() {\n  std::array<int, 4> a{9, 8, 7, 6};\n  std::span<const int> s = a;\n  std::span<const int> w = s.subspan(1, 2);\n  std::cout << w[0] << " " << w[1] << "\\n";\n}',
          '8 7',
          'Two elements starting at index 1 are 8 and 7.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\n#include <array>\n#include <span>\nint main() {\n  std::array<int, 4> a{1, 1, 1, 1};\n  std::span<int> s = a;\n  std::span<int> mid = s.subspan(1, 2);\n  mid[0] = 5;\n  std::cout << a[1] << "\\n";\n}',
          '5',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <array>\n#include <cstddef>\n#include <span>\nint main() {\n  std::array<int, 3> a{4, 5, 6};\n  std::span<const int> s = a;\n  std::size_t offset = 1;\n  if (offset > s.size()) std::cout << "bad offset\\n";\n  else std::cout << s.subspan(offset).size() << "\\n";\n}',
          '2',
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
        typeOutput(
          'What does this program print?',
          '#include <iostream>\n#include <cstddef>\n#include <span>\nint main() {\n  std::span<const int> empty;\n  std::size_t offset = 0;\n  if (offset > empty.size()) std::cout << "bad offset\\n";\n  else std::cout << empty.subspan(offset).size() << "\\n";\n}',
          '0',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <string_view>\nint main() {\n  std::string_view s = "C++20";\n  std::cout << s.size() << "\\n";\n}',
          '5',
          "C, +, +, 2, and 0 are five characters; the literal's terminating null is not counted.",
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\n#include <string>\n#include <string_view>\nint main() {\n  std::string text = "hello";\n  std::string_view v = text;\n  std::cout << v[1] << v[4] << "\\n";\n}',
          'eo',
          'Index 1 is e and index 4 is o.',
        ),
        choose(
          'What does a std::string_view own?',
          [
            'A copy of the characters',
            'A null-terminated buffer of its own',
            'The std::string it was made from',
            'Nothing; it borrows the characters',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <string_view>\nint main() {\n  std::string_view full = "abcdef";\n  std::string_view part(full.data(), 3);\n  std::cout << part << " " << part.size() << "\\n";\n}',
          'abc 3',
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
        typeOutput(
          'What does this program print?',
          '#include <iostream>\n#include <string_view>\nint main() {\n  std::string_view v("x\\0yz", 4);\n  std::cout << v.size() << "\\n";\n}',
          '4',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <string_view>\nint main() {\n  std::string_view s = "monday";\n  std::cout << s.substr(0, 3) << "\\n";\n}',
          'mon',
          'Three characters starting at position 0 are m, o, n.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\n#include <string_view>\nint main() {\n  std::string_view s = "lesson";\n  std::cout << s.substr(3) << " " << s.substr(3).size() << "\\n";\n}',
          'son 3',
          'From position 3 to the end is son, three characters.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\n#include <string_view>\nint main() {\n  std::string_view s = "abcdef";\n  std::string_view mid = s.substr(2, 2);\n  std::cout << mid << mid.size() << "\\n";\n}',
          'cd2',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <string>\n#include <string_view>\nint main() {\n  std::string original = "alpha";\n  std::string_view v = original;\n  std::string copy(v);\n  original = "beta";\n  std::cout << copy << "\\n";\n}',
          'alpha',
          'copy took its own characters while original still said alpha.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\n#include <string>\n#include <string_view>\nint main() {\n  std::string_view v = "abcdef";\n  std::string part(v.substr(1, 3));\n  std::cout << part << part.size() << "\\n";\n}',
          'bcd3',
          'The view b, c, d is copied into a three-character string.',
        ),
        choose(
          'After std::string owned(view);, what happens to owned if the characters the view refers to change later?',
          [
            'owned changes along with the characters',
            'owned becomes an empty string',
            'It keeps its own copy, unaffected',
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
            'The temporary dies at the semicolon, so v dangles',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <string>\n#include <string_view>\nstd::string keep(std::string_view v) {\n  return std::string(v);\n}\nint main() {\n  std::string a = keep("one");\n  std::string b = keep(a);\n  a = "two";\n  std::cout << b << "\\n";\n}',
          'one',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <chrono>\nint main() {\n  std::chrono::seconds s{90};\n  std::cout << s.count() << "\\n";\n}',
          '90',
          "count() returns the ticks in the duration's own unit, seconds.",
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\n#include <chrono>\nint main() {\n  std::chrono::minutes m{3};\n  std::chrono::minutes more = m + std::chrono::minutes{2};\n  std::cout << more.count() << "\\n";\n}',
          '5',
          'Adding two minute durations gives 5 minutes.',
        ),
        choose(
          'What does count() return for std::chrono::milliseconds d{1500};?',
          [
            '1.5, the value in seconds',
            '1, the whole seconds',
            '1500000, the microseconds',
            '1500, in milliseconds',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <chrono>\nint main() {\n  std::chrono::milliseconds t = std::chrono::seconds{1} + std::chrono::milliseconds{1};\n  std::cout << t.count() << "\\n";\n}',
          '1001',
          '1 second is 1000 milliseconds; adding 1 gives 1001.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\n#include <chrono>\nint main() {\n  std::chrono::seconds s = std::chrono::minutes{2};\n  std::cout << s.count() << "\\n";\n}',
          '120',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <chrono>\nint main() {\n  std::chrono::hours h{2};\n  std::chrono::seconds s = h;\n  long long n = s.count();\n  std::cout << n << "\\n";\n}',
          '7200',
          'Two hours are 7200 seconds.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\n#include <chrono>\nint main() {\n  std::chrono::milliseconds a{400};\n  std::chrono::milliseconds b{-150};\n  std::cout << (a + b).count() << "\\n";\n}',
          '250',
          'A negative duration subtracts: 400 + (-150) is 250.',
        ),
        choose(
          'Why is long long a good type for a millisecond count?',
          [
            'count() always returns a double',
            'Counts can exceed a 32-bit int within weeks',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <chrono>\nint main() {\n  std::chrono::milliseconds ms{5999};\n  std::cout << std::chrono::duration_cast<std::chrono::seconds>(ms).count() << "\\n";\n}',
          '5',
          'The cast does not round: 5.999 seconds become 5.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\n#include <chrono>\nint main() {\n  std::chrono::seconds s{150};\n  std::cout << std::chrono::duration_cast<std::chrono::minutes>(s).count() << "\\n";\n}',
          '2',
          '150 seconds are 2.5 minutes, and the cast keeps 2.',
        ),
        choose(
          'What happens when this code is compiled?',
          [
            's becomes 2 seconds, truncated',
            's becomes 3 seconds, rounded',
            's becomes 2.7 seconds, exactly',
            'It does not compile',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <chrono>\nint main() {\n  std::chrono::milliseconds d{-2999};\n  std::cout << std::chrono::duration_cast<std::chrono::seconds>(d).count() << "\\n";\n}',
          '-2',
          '-2.999 seconds truncate toward zero to -2.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\n#include <chrono>\nint main() {\n  std::chrono::seconds s{-90};\n  std::cout << std::chrono::duration_cast<std::chrono::minutes>(s).count() << "\\n";\n}',
          '-1',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <chrono>\nint main() {\n  std::chrono::milliseconds total{3999};\n  std::chrono::seconds whole = std::chrono::duration_cast<std::chrono::seconds>(total);\n  std::chrono::milliseconds rest = total - whole;\n  std::cout << whole.count() << " s " << rest.count() << " ms\\n";\n}',
          '3 s 999 ms',
          'The cast keeps 3 seconds, and 3999 - 3000 leaves 999 milliseconds.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\n#include <chrono>\nint main() {\n  std::chrono::seconds total{125};\n  std::chrono::minutes m = std::chrono::duration_cast<std::chrono::minutes>(total);\n  std::chrono::seconds rest = total - m;\n  std::cout << m.count() << ":" << rest.count() << "\\n";\n}',
          '2:5',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <chrono>\nint main() {\n  std::chrono::steady_clock::time_point start{std::chrono::seconds{2}};\n  std::chrono::steady_clock::time_point end{std::chrono::seconds{5}};\n  std::cout << std::chrono::duration_cast<std::chrono::milliseconds>(end - start).count() << "\\n";\n}',
          '3000',
          'The instants are 3 seconds apart, which is 3000 milliseconds.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\n#include <chrono>\nint main() {\n  std::chrono::steady_clock::time_point start{std::chrono::milliseconds{500}};\n  std::chrono::steady_clock::time_point end{std::chrono::milliseconds{200}};\n  std::cout << std::chrono::duration_cast<std::chrono::milliseconds>(end - start).count() << "\\n";\n}',
          '-300',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <chrono>\nint main() {\n  std::chrono::steady_clock::time_point start{std::chrono::milliseconds{1000}};\n  std::chrono::steady_clock::time_point later = start + std::chrono::milliseconds{250};\n  std::cout << std::chrono::duration_cast<std::chrono::milliseconds>(later.time_since_epoch()).count() << "\\n";\n}',
          '1250',
          'Moving 250 milliseconds past an instant at 1000 milliseconds gives 1250.',
        ),
        choose(
          'a and b are steady_clock time points and d is a duration. Which expression does not compile?',
          ['a - b', 'a + d', 'a - d', 'a + b'],
          3,
          'An instant plus a duration is meaningful; an instant plus an instant is not.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\n#include <chrono>\nint main() {\n  std::chrono::steady_clock::time_point start{std::chrono::seconds{20}};\n  std::chrono::steady_clock::time_point later = start + std::chrono::minutes{1};\n  std::cout << std::chrono::duration_cast<std::chrono::seconds>(later - start).count() << "\\n";\n}',
          '60',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <chrono>\nint main() {\n  std::chrono::steady_clock::time_point a{std::chrono::milliseconds{3000}};\n  std::chrono::steady_clock::time_point b = a + std::chrono::milliseconds{999};\n  std::cout << std::chrono::duration_cast<std::chrono::seconds>(b - a).count() << " " << std::chrono::duration_cast<std::chrono::milliseconds>(b - a).count() << "\\n";\n}',
          '0 999',
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
        typeOutput(
          'What does this program print?',
          '#include <iostream>\n#include <chrono>\nint main() {\n  std::chrono::steady_clock::time_point a{std::chrono::seconds{1}};\n  std::chrono::steady_clock::time_point b{std::chrono::milliseconds{1}};\n  std::cout << std::chrono::duration_cast<std::chrono::milliseconds>(a - b).count() << "\\n";\n}',
          '999',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <chrono>\nint main() {\n  std::chrono::steady_clock::time_point a = std::chrono::steady_clock::now();\n  std::chrono::steady_clock::time_point b = std::chrono::steady_clock::now();\n  std::cout << (b - a >= std::chrono::nanoseconds{0}) << "\\n";\n}',
          '1',
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
        typeOutput(
          'What does this program print?',
          '#include <iostream>\n#include <chrono>\nint main() {\n  std::cout << std::chrono::steady_clock::is_steady << "\\n";\n}',
          '1',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <chrono>\nint main() {\n  std::chrono::steady_clock::time_point a = std::chrono::steady_clock::now();\n  std::chrono::steady_clock::time_point b = a + std::chrono::seconds{2};\n  std::cout << (b > a) << (b - a == std::chrono::seconds{2}) << "\\n";\n}',
          '11',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <chrono>\nint main() {\n  std::chrono::steady_clock::time_point start{std::chrono::microseconds{2000}};\n  std::chrono::steady_clock::time_point end{std::chrono::microseconds{5750}};\n  std::cout << std::chrono::duration_cast<std::chrono::microseconds>(end - start).count() << " us\\n";\n}',
          '3750 us',
          'In microseconds the full interval, 3750, is kept.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\n#include <chrono>\nint main() {\n  std::chrono::steady_clock::time_point start{std::chrono::seconds{10}};\n  std::chrono::steady_clock::time_point end = start + std::chrono::milliseconds{1500};\n  std::cout << std::chrono::duration_cast<std::chrono::seconds>(end - start).count() << " s\\n";\n}',
          '1 s',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nstruct Point {\n  int x;\n  int y;\n};\nint main() {\n  Point p{4, -2};\n  std::cout << p.y << " " << p.x << "\\n";\n}',
          '-2 4',
          'x is 4 and y is -2; the program prints y first.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\nstruct Size {\n  int width;\n  int height;\n};\nint main() {\n  Size s{3, 5};\n  std::cout << s.width * s.height << "\\n";\n}',
          '15',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nstruct Totals {\n  int a;\n  int b;\n  int c;\n};\nint main() {\n  Totals t{1, 2};\n  std::cout << t.a + t.b + t.c << "\\n";\n}',
          '3',
          'c was not given a value, so it is 0, and the sum is 1 + 2 + 0.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\nstruct Stats {\n  int count;\n  int sum;\n};\nint main() {\n  Stats s{};\n  s.count += 1;\n  std::cout << s.count << s.sum << "\\n";\n}',
          '10',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nstruct P {\n  int x;\n  int y;\n};\nint main() {\n  P a{1, 2};\n  P b = a;\n  b.x = 9;\n  std::cout << a.x << b.x << "\\n";\n}',
          '19',
          'b is an independent copy, so only b.x becomes 9.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\nstruct Range {\n  int low;\n  int high;\n};\nRange make(int a, int b) {\n  return Range{a, b};\n}\nint width(Range r) {\n  return r.high - r.low;\n}\nint main() {\n  std::cout << width(make(3, 10)) << "\\n";\n}',
          '7',
          'make builds the struct {3, 10}, and width returns 10 - 3.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\nstruct Box {\n  int v;\n};\nint bump(Box b) {\n  b.v += 1;\n  return b.v;\n}\nint main() {\n  Box box{4};\n  int r = bump(box);\n  std::cout << r << box.v << "\\n";\n}',
          '54',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nstruct Temp {\n  int celsius;\n  explicit Temp(int c) : celsius(c) {}\n};\nint main() {\n  Temp t(-4);\n  std::cout << t.celsius + 4 << "\\n";\n}',
          '0',
          'celsius is initialized to -4, and adding 4 gives 0.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\nstruct Scaled {\n  int value;\n  explicit Scaled(int x) : value(x * 10) {}\n};\nint main() {\n  Scaled s(3);\n  std::cout << s.value << "\\n";\n}',
          '30',
          'The initializer may be any expression: value starts as 3 * 10.',
        ),
        choose(
          'What does : value(x) do in Holder(int x) : value(x) {}?',
          [
            'Calls a function named value',
            'Assigns x after the body has run',
            'Initializes the member value from x',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nstruct Account {\n  int balance;\n  explicit Account(int start) : balance(start) {\n    balance += 100;\n  }\n};\nint main() {\n  Account a(5);\n  std::cout << a.balance << "\\n";\n}',
          '105',
          'balance starts at 5 from the initializer, and the body adds 100.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\nstruct Doubler {\n  int v;\n  explicit Doubler(int x) : v(x) {\n    v = v * 2;\n  }\n};\nint main() {\n  Doubler d(6);\n  std::cout << d.v << "\\n";\n}',
          '12',
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
            'end is initialized first, from an unset length',
            'Nothing, because the initializer list order is used',
            'length must be listed first in the initializer list',
          ],
          1,
          'Declaration order wins: end is initialized first and reads an uninitialized length.',
          'struct Bad {\n  int end;\n  int length;\n  Bad(int start, int len) : length(len), end(start + length) {}\n};',
        ),
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nstruct Area {\n  int w;\n  int h;\n  int area;\n  Area(int a, int b) : w(a), h(b), area(w * h) {}\n};\nint main() {\n  Area x(3, 4);\n  std::cout << x.area << "\\n";\n}',
          '12',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nstruct Bell {\n  ~Bell() { std::cout << "ring\\n"; }\n};\nint main() {\n  std::cout << "start\\n";\n  {\n    Bell b;\n  }\n  std::cout << "end\\n";\n}',
          'start\nring\nend',
          'b lives only inside the inner block, so ring appears before end.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\nstruct Bell {\n  ~Bell() { std::cout << "ring\\n"; }\n};\nint main() {\n  Bell a;\n  std::cout << "body\\n";\n}',
          'body\nring',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nstruct Counter {\n  int& count;\n  ~Counter() { count += 10; }\n};\nint main() {\n  int total = 1;\n  {\n    Counter c{total};\n    total += 1;\n  }\n  std::cout << total << "\\n";\n}',
          '12',
          'total becomes 2 inside the block, and the destructor adds 10 at its end.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\nstruct Guard {\n  int& released;\n  ~Guard() { ++released; }\n};\nint main() {\n  int n = 0;\n  {\n    Guard a{n};\n  }\n  {\n    Guard b{n};\n  }\n  std::cout << n << "\\n";\n}',
          '2',
          'Each guard is destroyed at the end of its own block, so n is incremented twice.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\nstruct Guard {\n  int& released;\n  ~Guard() { ++released; }\n};\nint main() {\n  int n = 0;\n  {\n    Guard a{n};\n    std::cout << n;\n  }\n  std::cout << n << "\\n";\n}',
          '01',
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
        typeOutput(
          'What does this program print?',
          '#include <iostream>\nstruct Tag {\n  int id;\n  ~Tag() { std::cout << "end " << id << "\\n"; }\n};\nint main() {\n  Tag outer{5};\n  {\n    Tag inner{6};\n    std::cout << "in\\n";\n  }\n}',
          'in\nend 6\nend 5',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nstruct Tag {\n  int id;\n  ~Tag() { std::cout << id; }\n};\nint main() {\n  {\n    Tag x{7};\n    Tag y{8};\n  }\n  std::cout << "\\n";\n}',
          '87',
          'y was constructed last, so it is destroyed first.',
        ),
        choose(
          'Why are locals destroyed in the reverse order of construction?',
          [
            'The order is chosen at random by the compiler',
            'Later objects may depend on earlier ones',
            'The compiler sorts the objects by their size',
            'So that output appears in reverse order',
          ],
          1,
          'Reverse order guarantees that anything an object was built on still exists when it is destroyed.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\nstruct Tracker {\n  int& log;\n  int digit;\n  ~Tracker() { log = log * 10 + digit; }\n};\nint main() {\n  int log = 0;\n  {\n    Tracker first{log, 1};\n    Tracker second{log, 2};\n  }\n  std::cout << log << "\\n";\n}',
          '21',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nstruct Tag {\n  int id;\n  ~Tag() { std::cout << id; }\n};\nint main() {\n  {\n    {\n      Tag a{1};\n    }\n    Tag b{2};\n    Tag c{3};\n  }\n  std::cout << "\\n";\n}',
          '132',
          'a ends with its own block first; then c and b go in reverse order.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\nstruct Tracker {\n  int& log;\n  int digit;\n  ~Tracker() { log = log * 10 + digit; }\n};\nint main() {\n  int log = 0;\n  {\n    Tracker a{log, 4};\n    {\n      Tracker b{log, 5};\n    }\n    Tracker c{log, 6};\n  }\n  std::cout << log << "\\n";\n}',
          '564',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nstruct Log {\n  int lines;\n};\nstruct Writer {\n  Log& log;\n  int n;\n  ~Writer() { log.lines += n; }\n};\nint main() {\n  Log log{0};\n  {\n    Writer a{log, 1};\n    Writer b{log, 10};\n  }\n  std::cout << log.lines << "\\n";\n}',
          '11',
          'Both writers record their amounts when the block ends: 10 + 1.',
        ),
        choose(
          'Why is it a bug to declare a borrower before the object it borrows in the same block?',
          [
            'The borrower cannot be constructed',
            'References must always be declared last',
            'It wastes memory on an extra copy',
            'The owner dies while still borrowed',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nstruct Wallet {\n  int cash;\n  void spend(int amount) { cash -= amount; }\n};\nint main() {\n  Wallet w{20};\n  w.spend(5);\n  w.spend(5);\n  std::cout << w.cash << "\\n";\n}',
          '10',
          "Two calls each subtract 5 from w's cash.",
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\nstruct Rect {\n  int w;\n  int h;\n  int area() { return w * h; }\n};\nint main() {\n  Rect r{3, 4};\n  std::cout << r.area() << "\\n";\n}',
          '12',
          "area uses r's members w and h.",
        ),
        choose(
          'Inside void add(int amount) { count += amount; }, which count changes?',
          [
            'A global variable named count',
            "Every Counter object's count member",
            'The count of the object it is called on',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nstruct Counter {\n  int count;\n  void add(int amount) { count += amount; }\n};\nint main() {\n  Counter a{5};\n  Counter b = a;\n  b.add(10);\n  std::cout << a.count << " " << b.count << "\\n";\n}',
          '5 15',
          'b is a separate copy, so adding to it leaves a at 5.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\nstruct Counter {\n  int count;\n  void add(int amount) { count += amount; }\n};\nint main() {\n  Counter a{0};\n  Counter b{0};\n  a.add(3);\n  a.add(3);\n  b.add(1);\n  std::cout << a.count - b.count << "\\n";\n}',
          '5',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nstruct Tank {\n  int level;\n  void fill(int amount) { level += amount; }\n  int remaining(int capacity) { return capacity - level; }\n};\nint main() {\n  Tank t{30};\n  t.fill(20);\n  std::cout << t.remaining(100) << "\\n";\n}',
          '50',
          'level becomes 50, and 100 - 50 leaves 50.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\nstruct Acc {\n  int total;\n  int add(int x) {\n    total += x;\n    return total;\n  }\n};\nint main() {\n  Acc a{0};\n  a.add(2);\n  std::cout << a.add(3) << "\\n";\n}',
          '5',
          'The first call makes total 2, and the second returns 2 + 3.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\nstruct Score {\n  int points;\n  int doubled() { return points * 2; }\n};\nint main() {\n  Score s{3};\n  std::cout << s.doubled() + s.doubled() << " " << s.points << "\\n";\n}',
          '12 3',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nstruct Temp {\n  int c;\n  int doubled() const { return c * 2; }\n};\nint main() {\n  const Temp t{21};\n  std::cout << t.doubled() << "\\n";\n}',
          '42',
          'The const member function reads c and returns 42.',
        ),
        choose(
          'Why does b.read() fail to compile here?',
          [
            'v must be declared private first',
            'read must return void instead of int',
            'read is not a const member function',
            'const objects cannot have any members',
          ],
          2,
          'Without const, the compiler must assume read might modify the object.',
          'struct Box {\n  int v;\n  int read() { return v; }\n};\nint main() {\n  const Box b{1};\n  b.read();\n}',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\nstruct Pair {\n  int a;\n  int b;\n  int sum() const { return a + b; }\n};\nint main() {\n  const Pair p{2, 5};\n  Pair q{1, 1};\n  std::cout << p.sum() << q.sum() << "\\n";\n}',
          '72',
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
            'It does not compile: peek is const',
          ],
          3,
          'Members are read-only inside a const member function.',
          'struct Meter {\n  int reading;\n  int peek() const {\n    reading += 1;\n    return reading;\n  }\n};',
        ),
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nstruct Meter {\n  int reading;\n  int peek() const { return reading; }\n  void tick() { reading += 1; }\n};\nint main() {\n  Meter m{0};\n  m.tick();\n  m.tick();\n  int a = m.peek();\n  m.tick();\n  std::cout << a << m.peek() << "\\n";\n}',
          '23',
          'a saved 2; one more tick makes the reading 3.',
        ),
        choose(
          'Meter has int peek() const and void tick(). Given const Meter m{5};, which can be called on m?',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nstruct Gauge {\n  int level;\n  int read() const { return level; }\n  void set(int v) { level = v; }\n};\nint main() {\n  Gauge a{2};\n  const Gauge b{5};\n  a.set(a.read() + b.read());\n  std::cout << a.read() << "\\n";\n}',
          '7',
          'a is set to 2 + 5.',
        ),
        choose(
          'Gauge has int read() const and void set(int v). With Gauge a{1}; and const Gauge b{2};, which call does not compile?',
          ['a.read()', 'a.set(3)', 'b.read()', 'b.set(3)'],
          3,
          'set is not const, so it cannot be called on the const object b.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\nstruct Gauge {\n  int level;\n  int read() const { return level; }\n  void set(int v) { level = v; }\n};\nint main() {\n  Gauge a{4};\n  const Gauge snapshot = a;\n  a.set(9);\n  std::cout << snapshot.read() << a.read() << "\\n";\n}',
          '49',
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
          'struct Tally {\n  int total;\n  void add(int x) { total += x; }\n  int value() const { return total; }\n};\nint reset(const Tally& t) {\n  t.add(-t.value());\n  return t.value();\n}',
        ),
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nstruct Tally {\n  int total;\n  void add(int x) { total += x; }\n  int value() const { return total; }\n};\nint twice(const Tally& t) {\n  return t.value() * 2;\n}\nint main() {\n  Tally t{5};\n  t.add(1);\n  std::cout << twice(t) << "\\n";\n}',
          '12',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nstruct Tally {\n  int total;\n  void add(int x) { total += x; }\n  int value() const { return total; }\n};\nvoid record(Tally& t, int x) {\n  t.add(x);\n}\nvoid copy_record(Tally t, int x) {\n  t.add(x);\n}\nint main() {\n  Tally t{1};\n  record(t, 2);\n  copy_record(t, 100);\n  std::cout << t.value() << "\\n";\n}',
          '3',
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
        typeOutput(
          'What does this program print?',
          '#include <iostream>\nstruct Tally {\n  int total;\n  void add(int x) { total += x; }\n  int value() const { return total; }\n};\nbool reached(const Tally& t, int goal) {\n  return t.value() >= goal;\n}\nint main() {\n  Tally t{0};\n  t.add(4);\n  std::cout << reached(t, 4) << reached(t, 5) << "\\n";\n}',
          '10',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nstruct Stock {\n  int units;\n  int count() const { return units; }\n  void sell() { units -= 1; }\n};\nint total(const Stock& a, const Stock& b) {\n  return a.count() + b.count();\n}\nint main() {\n  Stock s{3};\n  Stock t{4};\n  s.sell();\n  std::cout << total(s, t) << "\\n";\n}',
          '6',
          's has 2 units after the sale, and t has 4.',
        ),
        choose(
          'A team removes const from every getter. What breaks?',
          [
            'The getters become slower',
            'Objects of the type can no longer be copied',
            'Calls through const T& stop compiling',
            'Nothing breaks',
          ],
          2,
          'Through const T& only const member functions are callable.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\nstruct Stock {\n  int units;\n  int count() const { return units; }\n  void sell() { units -= 1; }\n};\nint total(const Stock& a, const Stock& b) {\n  return a.count() + b.count();\n}\nint main() {\n  const Stock fixed{10};\n  Stock live{10};\n  live.sell();\n  std::cout << total(fixed, live) << "\\n";\n}',
          '19',
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
          'What happens with g.level_ = 50; in main?',
          [
            'level_ becomes 50',
            'It does not compile: level_ is private',
            'The assignment is ignored at run time',
            'level_ becomes 10, the cap',
          ],
          1,
          "Only Gauge's own member functions can access its private members.",
          'class Gauge {\n public:\n  explicit Gauge(int cap) : cap_(cap), level_(0) {}\n  void add(int amount) {\n    level_ += amount;\n    if (level_ > cap_) level_ = cap_;\n  }\n  int level() const { return level_; }\n\n private:\n  int cap_;\n  int level_;\n};\nint main() {\n  Gauge g(10);\n  g.level_ = 50;\n}',
        ),
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nclass Gauge {\n public:\n  explicit Gauge(int cap) : cap_(cap), level_(0) {}\n  void add(int amount) {\n    level_ += amount;\n    if (level_ > cap_) level_ = cap_;\n  }\n  int level() const { return level_; }\n\n private:\n  int cap_;\n  int level_;\n};\nint main() {\n  Gauge g(10);\n  g.add(8);\n  g.add(5);\n  std::cout << g.level() << "\\n";\n}',
          '10',
          '8 + 5 would be 13, but add caps the level at 10.',
        ),
        choose(
          'How do struct and class differ in C++?',
          [
            'Only classes can have member functions',
            'Only structs can have constructors and destructors',
            'struct defaults to public, class to private',
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
        typeOutput(
          'What does this program print?',
          '#include <iostream>\nclass Gauge {\n public:\n  explicit Gauge(int cap) : cap_(cap), level_(0) {}\n  void add(int amount) {\n    level_ += amount;\n    if (level_ > cap_) level_ = cap_;\n    if (level_ < 0) level_ = 0;\n  }\n  int level() const { return level_; }\n\n private:\n  int cap_;\n  int level_;\n};\nint main() {\n  Gauge g(5);\n  g.add(2);\n  g.add(-10);\n  g.add(1);\n  std::cout << g.level() << "\\n";\n}',
          '1',
          'The level goes 2, then is raised from -8 to 0, then becomes 1.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\nclass Gauge {\n public:\n  explicit Gauge(int cap) : cap_(cap), level_(0) {}\n  void add(int amount) {\n    level_ += amount;\n    if (level_ > cap_) level_ = cap_;\n    if (level_ < 0) level_ = 0;\n  }\n  int level() const { return level_; }\n\n private:\n  int cap_;\n  int level_;\n};\nint main() {\n  Gauge g(100);\n  g.add(60);\n  g.add(60);\n  g.add(-30);\n  std::cout << g.level() << "\\n";\n}',
          '70',
          '60, then capped at 100, then 100 - 30.',
        ),
        choose(
          'Why can no caller ever see a Gauge level above its cap?',
          [
            'The compiler checks the cap at every call',
            'An int member cannot exceed the cap',
            'The destructor corrects any bad level',
            'Only add changes it, and add clamps it',
          ],
          3,
          'The state is private, so add is the only way in, and add checks the rule.',
          'class Gauge {\n public:\n  explicit Gauge(int cap) : cap_(cap), level_(0) {}\n  void add(int amount) {\n    level_ += amount;\n    if (level_ > cap_) level_ = cap_;\n    if (level_ < 0) level_ = 0;\n  }\n  int level() const { return level_; }\n\n private:\n  int cap_;\n  int level_;\n};',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nclass Account {\n public:\n  explicit Account(int start) : balance_(start) {}\n  bool withdraw(int amount) {\n    if (amount > balance_) return false;\n    balance_ -= amount;\n    return true;\n  }\n  int balance() const { return balance_; }\n\n private:\n  int balance_;\n};\nint main() {\n  Account a(50);\n  bool first = a.withdraw(30);\n  bool second = a.withdraw(30);\n  std::cout << first << second << " " << a.balance() << "\\n";\n}',
          '10 20',
          'The first withdrawal leaves 20; the second asks for more than 20 and is refused.',
        ),
        choose(
          'Account keeps balance_ private, offers int balance() const, and changes it only in withdraw, which checks the amount. Why not make balance_ public?',
          [
            'Because int members cannot be public',
            'To make the program run faster',
            'Every change must go through withdraw’s check',
            'Because const functions must return members',
          ],
          2,
          'Read access is safe to share; write access is kept behind the checking function.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\nclass Account {\n public:\n  explicit Account(int start) : balance_(start) {}\n  bool withdraw(int amount) {\n    if (amount > balance_) return false;\n    balance_ -= amount;\n    return true;\n  }\n  int balance() const { return balance_; }\n\n private:\n  int balance_;\n};\nint main() {\n  Account a(10);\n  Account b = a;\n  b.withdraw(4);\n  std::cout << a.balance() << " " << b.balance() << "\\n";\n}',
          '10 6',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nstruct Lease {\n  int& count;\n  explicit Lease(int& c) : count(c) { ++count; }\n  ~Lease() { --count; }\n};\nint main() {\n  int active = 0;\n  {\n    Lease a(active);\n    Lease b(active);\n    std::cout << active;\n  }\n  std::cout << active << "\\n";\n}',
          '20',
          'Two leases are held inside the block, and both are released when it ends.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\nstruct Lease {\n  int& count;\n  explicit Lease(int& c) : count(c) { ++count; }\n  ~Lease() { --count; }\n};\nint main() {\n  int active = 0;\n  {\n    Lease a(active);\n    {\n      Lease b(active);\n      std::cout << active;\n    }\n    std::cout << active;\n  }\n  std::cout << active << "\\n";\n}',
          '210',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nstruct Lock {\n  int& held;\n  explicit Lock(int& h) : held(h) { held = 1; }\n  ~Lock() { held = 0; }\n};\nint work(int& state, int input) {\n  Lock lock(state);\n  if (input < 0) return -1;\n  return input * 2;\n}\nint main() {\n  int state = 0;\n  int r = work(state, 4);\n  std::cout << r << " " << state << "\\n";\n}',
          '8 0',
          'The normal return also destroys lock, so state is 0 again.',
        ),
        choose(
          'A function holds a Lease and has three return statements. How many release calls must be written?',
          [
            'Three, one before each return',
            'One, at the end of the function',
            'Two, before the early returns',
            'None; the destructor does it',
          ],
          3,
          'Every way out of the scope destroys the owner.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\nstruct Lease {\n  int& count;\n  explicit Lease(int& c) : count(c) { ++count; }\n  ~Lease() { --count; }\n};\nint measure(int& active) {\n  Lease lease(active);\n  return active * 10;\n}\nint main() {\n  int a = 0;\n  int r = measure(a);\n  std::cout << r << " " << a << "\\n";\n}',
          '10 0',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nstruct Counter {\n  int& releases;\n  ~Counter() { ++releases; }\n};\nint main() {\n  int releases = 0;\n  {\n    Counter a{releases};\n    Counter b = a;\n  }\n  std::cout << releases << "\\n";\n}',
          '2',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <stdexcept>\nstruct Tag {\n  int id;\n  ~Tag() { std::cout << id; }\n};\nint main() {\n  try {\n    Tag a{1};\n    Tag b{2};\n    throw std::runtime_error("x");\n  } catch (const std::runtime_error&) {\n    std::cout << "!";\n  }\n  std::cout << "\\n";\n}',
          '21!',
          'Unwinding destroys b and then a before the handler prints !.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\n#include <stdexcept>\nstruct Lease {\n  int& count;\n  explicit Lease(int& c) : count(c) { ++count; }\n  ~Lease() { --count; }\n};\nint main() {\n  int active = 0;\n  try {\n    Lease lease(active);\n    throw std::runtime_error("fail");\n  } catch (const std::runtime_error&) {\n    std::cout << active << "\\n";\n  }\n}',
          '0',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <stdexcept>\nstruct Tag {\n  int id;\n  ~Tag() { std::cout << id; }\n};\nint main() {\n  try {\n    Tag a{5};\n    Tag b{6};\n    throw std::runtime_error("x");\n    Tag c{7};\n  } catch (const std::runtime_error&) {\n    std::cout << "!";\n  }\n  std::cout << "\\n";\n}',
          '65!',
          'c was never created; b and a are destroyed in reverse order.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\n#include <stdexcept>\nstruct Tag {\n  int id;\n  ~Tag() { std::cout << id; }\n};\nvoid step() {\n  Tag t{3};\n  throw std::runtime_error("x");\n}\nint main() {\n  try {\n    Tag outer{9};\n    step();\n  } catch (const std::runtime_error&) {\n    std::cout << "!";\n  }\n  std::cout << "\\n";\n}',
          '39!',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <stdexcept>\nstruct Lease {\n  int& count;\n  explicit Lease(int& c) : count(c) { ++count; }\n  ~Lease() { --count; }\n};\nint main() {\n  int active = 0;\n  try {\n    Lease a(active);\n    {\n      Lease b(active);\n      std::cout << active;\n      throw std::runtime_error("x");\n    }\n  } catch (const std::runtime_error&) {\n    std::cout << active << "\\n";\n  }\n}',
          '20',
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
          'What happens with Owner a; Owner b = a;?',
          [
            'b becomes a second owner of the resource',
            'b starts out empty, owning nothing',
            'a is moved into b, leaving a empty',
            'It does not compile: copying is deleted',
          ],
          3,
          'Copying needs the copy constructor, which no longer exists.',
          'struct Owner {\n  Owner() = default;\n  Owner(const Owner&) = delete;\n  Owner& operator=(const Owner&) = delete;\n};',
        ),
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <type_traits>\nstruct Plain {\n  int v;\n};\nstruct Owner {\n  Owner() = default;\n  Owner(const Owner&) = delete;\n  Owner& operator=(const Owner&) = delete;\n};\nint main() {\n  std::cout << std::is_copy_constructible_v<Plain> << std::is_copy_constructible_v<Owner> << "\\n";\n}',
          '10',
          'Plain keeps its default copy constructor; Owner deleted its own.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\n#include <type_traits>\nstruct Owner {\n  Owner() = default;\n  Owner(const Owner&) = delete;\n  Owner& operator=(const Owner&) = delete;\n};\nint main() {\n  std::cout << (!std::is_copy_constructible_v<Owner> && !std::is_copy_assignable_v<Owner>) << "\\n";\n}',
          '1',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nstruct Handle {\n  int& releases;\n  ~Handle() { ++releases; }\n};\nint main() {\n  int releases = 0;\n  {\n    Handle a{releases};\n    Handle b = a;\n    Handle c = b;\n  }\n  std::cout << releases << "\\n";\n}',
          '3',
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
        typeOutput(
          'What does this program print?',
          '#include <iostream>\nstruct Handle {\n  int& releases;\n  ~Handle() { ++releases; }\n};\nint main() {\n  int releases = 0;\n  Handle a{releases};\n  {\n    Handle b = a;\n  }\n  std::cout << releases << "\\n";\n}',
          '1',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nstruct Owner {\n  int& active;\n  explicit Owner(int& a) : active(a) { ++active; }\n  ~Owner() { --active; }\n  Owner(const Owner&) = delete;\n  Owner& operator=(const Owner&) = delete;\n};\nint main() {\n  int active = 0;\n  {\n    Owner a(active);\n    Owner b(active);\n    std::cout << active;\n  }\n  std::cout << active << "\\n";\n}',
          '20',
          'Two separate owners each acquire and release their own share.',
        ),
        choose(
          'Why delete the copies instead of trusting everyone not to copy an owner?',
          [
            'Copies are too slow for objects that own resources',
            'Deleted functions run faster',
            'A double release becomes a compile error',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nstruct Restore {\n  int& target;\n  int saved;\n  ~Restore() { target = saved; }\n};\nint main() {\n  int level = 3;\n  {\n    Restore g{level, level};\n    level = 99;\n  }\n  std::cout << level << "\\n";\n}',
          '3',
          'The guard saved 3 and writes it back at the end of the block.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\nstruct Restore {\n  int& target;\n  int saved;\n  ~Restore() { target = saved; }\n};\nint main() {\n  int x = 5;\n  {\n    Restore g{x, x};\n    x += 10;\n    x *= 2;\n    std::cout << x << " ";\n  }\n  std::cout << x << "\\n";\n}',
          '30 5',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nstruct ResetToZero {\n  int& target;\n  ~ResetToZero() { target = 0; }\n};\nint main() {\n  int volume = 4;\n  {\n    ResetToZero g{volume};\n    volume = 9;\n  }\n  std::cout << volume << "\\n";\n}',
          '0',
          'This guard writes 0 instead of the saved 4, so the old setting is lost.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\nstruct Restore {\n  int& target;\n  int saved;\n  ~Restore() { target = saved; }\n};\nint main() {\n  int v = 1;\n  {\n    Restore a{v, v};\n    v = 2;\n    {\n      Restore b{v, v};\n      v = 3;\n    }\n    std::cout << v;\n  }\n  std::cout << v << "\\n";\n}',
          '21',
          'The inner guard restores 2 when its block ends; the outer one restores 1.',
        ),
        choose(
          'A guard always resets a setting to 0 instead of saving it first. When is that wrong?',
          [
            'Never, because 0 is a safe default',
            'Only when the new value is 0',
            'Only when the guard object is copied',
            'Whenever the old value was not 0',
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
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nstruct Restore {\n  int& target;\n  int saved;\n  ~Restore() { target = saved; }\n};\nint main() {\n  int v = 1;\n  {\n    Restore a{v, v};\n    v = 5;\n    Restore b{v, v};\n    v = 9;\n  }\n  std::cout << v << "\\n";\n}',
          '1',
          'b restores 5 first; then a, destroyed last, restores 1.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\nstruct Restore {\n  int& target;\n  int saved;\n  ~Restore() { target = saved; }\n};\nint main() {\n  int v = 1;\n  {\n    Restore a{v, v};\n    v = 5;\n    Restore b{v, v};\n    v = 9;\n    std::cout << v;\n  }\n  std::cout << v << "\\n";\n}',
          '91',
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
  'cpp-unique-allocation': [
    {
      title: 'Create a unique owner with std::make_unique',
      explanation: [
        'std::make_unique<int>(12) from <memory> creates an int on the heap and returns a std::unique_ptr<int> that owns it. The unique_ptr is used like a pointer: *owner reads or writes the int.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\n#include <memory>\nint main() {\n  std::unique_ptr<int> owner = std::make_unique<int>(12);\n  std::cout << *owner << "\\n";\n}',
        output: '12',
        explanation:
          'owner owns a new int initialized to 12, and *owner reads it.',
      },
      questions: [
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <memory>\nint main() {\n  auto p = std::make_unique<int>(5);\n  *p += 3;\n  std::cout << *p << "\\n";\n}',
          '8',
          'Writing through *p changes the owned int from 5 to 8.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\n#include <memory>\nint main() {\n  auto a = std::make_unique<int>(2);\n  auto b = std::make_unique<int>(2);\n  *a = 10;\n  std::cout << *a + *b << "\\n";\n}',
          '12',
          'Each call creates its own int, so changing *a leaves *b at 2.',
        ),
        choose(
          'What does std::make_unique<int>(7) return?',
          [
            'An int holding 7',
            'A std::unique_ptr<int> owning 7',
            'A raw pointer that must be deleted',
            'A reference to a temporary 7',
          ],
          1,
          'make_unique creates the object and hands it to a unique owner.',
        ),
      ],
    },
    {
      title: 'Let the owner free the object at scope exit',
      explanation: [
        'When a unique_ptr is destroyed, its destructor destroys and frees the object it owns. p->id reads a member of the owned object; it means the same as (*p).id.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\n#include <memory>\nstruct Noisy {\n  int id;\n  explicit Noisy(int i) : id(i) {}\n  ~Noisy() { std::cout << "free " << id << "\\n"; }\n};\nint main() {\n  {\n    auto p = std::make_unique<Noisy>(1);\n    std::cout << "using " << p->id << "\\n";\n  }\n  std::cout << "after\\n";\n}',
        output: 'using 1\nfree 1\nafter',
        explanation:
          'p is destroyed at the end of its block, and it destroys the Noisy it owns.',
      },
      questions: [
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <memory>\nstruct Noisy {\n  int id;\n  explicit Noisy(int i) : id(i) {}\n  ~Noisy() { std::cout << "free " << id << "\\n"; }\n};\nint main() {\n  {\n    auto a = std::make_unique<Noisy>(1);\n    auto b = std::make_unique<Noisy>(2);\n  }\n  std::cout << "done\\n";\n}',
          'free 2\nfree 1\ndone',
          'The owners are destroyed in reverse order, and each frees its object.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\n#include <memory>\nstruct Noisy {\n  int id;\n  explicit Noisy(int i) : id(i) {}\n  ~Noisy() { std::cout << "free " << id << "\\n"; }\n};\nint main() {\n  auto p = std::make_unique<Noisy>(4);\n  std::cout << (*p).id + p->id << "\\n";\n}',
          '8\nfree 4',
          '(*p).id and p->id are the same member. The object is freed when p is destroyed at the end of main.',
        ),
        choose(
          'Who deletes the object created by std::make_unique?',
          [
            'The programmer, with delete',
            'Nobody, so it leaks',
            "The unique_ptr's destructor",
            'The operating system at the next allocation',
          ],
          2,
          'Owning the object means freeing it, automatically, when the owner goes away.',
        ),
      ],
    },
    {
      title: 'Free early with reset and avoid raw new',
      explanation: [
        'p.reset() frees the owned object now and leaves p empty, equal to nullptr. A raw pointer from new has no owner at all: unless some code calls delete exactly once, the object leaks.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\n#include <memory>\nstruct Noisy {\n  int id;\n  explicit Noisy(int i) : id(i) {}\n  ~Noisy() { std::cout << "free " << id << "\\n"; }\n};\nint main() {\n  auto p = std::make_unique<Noisy>(3);\n  p.reset();\n  std::cout << (p == nullptr) << "\\n";\n}',
        output: 'free 3\n1',
        explanation:
          'reset destroys the object immediately, and p is left empty.',
      },
      questions: [
        choose(
          'int* raw = new int(5); is never deleted. What happens?',
          [
            'The int is freed at scope exit',
            'The compiler inserts the delete',
            'It is freed when raw is reassigned',
            'The memory leaks, because nothing frees it',
          ],
          3,
          'A raw pointer does not own anything; only an explicit delete would free the int.',
        ),
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <memory>\nstruct Noisy {\n  int id;\n  explicit Noisy(int i) : id(i) {}\n  ~Noisy() { std::cout << "free " << id << "\\n"; }\n};\nint main() {\n  auto p = std::make_unique<Noisy>(5);\n  std::cout << "a\\n";\n  p.reset();\n  std::cout << "b\\n";\n}',
          'a\nfree 5\nb',
          'reset frees the object between the two prints; p is empty at the end, so nothing more is freed.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\n#include <memory>\nint main() {\n  std::unique_ptr<int> p;\n  std::cout << (p == nullptr) << " ";\n  p = std::make_unique<int>(9);\n  std::cout << *p << "\\n";\n}',
          '1 9',
          'A default-constructed unique_ptr is empty; afterwards it is given a new int holding 9.',
        ),
      ],
    },
  ],
  'cpp-lvalue-rvalue': [
    {
      title: 'Tell named objects from temporaries',
      explanation: [
        'An lvalue names an object that lives on, such as a variable. An rvalue is a temporary value, such as 8 or x + 1. Overloads taking int& and int&& let a call tell them apart: lvalues bind to int&, temporaries to int&&.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\nint category(int&) {\n  return 1;\n}\nint category(int&&) {\n  return 2;\n}\nint main() {\n  int value = 4;\n  std::cout << category(value) << category(8) << "\\n";\n}',
        output: '12',
        explanation:
          'value is a named object, so it picks int&; the literal 8 is a temporary, so it picks int&&.',
      },
      questions: [
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint category(int&) {\n  return 1;\n}\nint category(int&&) {\n  return 2;\n}\nint main() {\n  int v = 3;\n  std::cout << category(v) << category(v + 1) << "\\n";\n}',
          '12',
          'v names an object; v + 1 produces a temporary result.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\nint category(int&) {\n  return 1;\n}\nint category(int&&) {\n  return 2;\n}\nint main() {\n  int a = 1;\n  int& r = a;\n  std::cout << category(r) << category(10) << category(a * 2) << "\\n";\n}',
          '122',
          'r names a, an lvalue; 10 and a * 2 are temporaries.',
        ),
        choose(
          'Which argument binds to the int&& overload?',
          [
            'A named int variable',
            'A reference to an int variable',
            'The result of x + 1',
            'An int member of a struct object',
          ],
          2,
          'Only the arithmetic result is a temporary; the others name existing objects.',
        ),
      ],
    },
    {
      title: 'Treat a named rvalue reference as an lvalue',
      explanation: [
        'A variable declared int&& has a name, so using it is an lvalue expression. The declared type says what it can bind to; the expression category says how it behaves when used.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\nint category(int&) {\n  return 1;\n}\nint category(int&&) {\n  return 2;\n}\nint main() {\n  int&& temp = 7;\n  std::cout << category(temp) << "\\n";\n}',
        output: '1',
        explanation:
          'temp is declared int&&, but the expression temp names a variable, so int& is chosen.',
      },
      questions: [
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint category(int&) {\n  return 1;\n}\nint category(int&&) {\n  return 2;\n}\nint pass(int&& x) {\n  return category(x);\n}\nint main() {\n  std::cout << pass(3) << "\\n";\n}',
          '1',
          'Inside pass, x has a name, so category(x) picks the int& overload.',
        ),
        choose(
          'Why does category(r) pick int& when r is declared as int&& r = 5;?',
          [
            'int&& is the same type as int&',
            'The literal 5 is an lvalue',
            'r has a name, so the expression r is an lvalue',
            'Overload resolution ignores reference kinds',
          ],
          2,
          'Any named variable is an lvalue when used, whatever its declared reference type.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\nint category(int&) {\n  return 1;\n}\nint category(int&&) {\n  return 2;\n}\nint main() {\n  int&& r = 5;\n  r += 1;\n  std::cout << r << category(r) << "\\n";\n}',
          '61',
          'r refers to a temporary that lives as long as r, so it can be changed to 6; as a name it is an lvalue.',
        ),
      ],
    },
    {
      title: 'Overload on const T& and T&&',
      explanation: [
        'A const int& parameter accepts anything, lvalues and temporaries alike. When an int&& overload also exists, temporaries prefer it. A plain non-const int& cannot bind to a temporary at all.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\nint which(const int&) {\n  return 1;\n}\nint which(int&&) {\n  return 2;\n}\nint main() {\n  int x = 0;\n  const int c = 5;\n  std::cout << which(x) << which(c) << which(9) << "\\n";\n}',
        output: '112',
        explanation:
          'x and c are lvalues and go to const int&; 9 is a temporary and goes to int&&.',
      },
      questions: [
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nint which(const int&) {\n  return 1;\n}\nint which(int&&) {\n  return 2;\n}\nint main() {\n  int x = 4;\n  std::cout << which(x * 3) << which(x) << "\\n";\n}',
          '21',
          'x * 3 is a temporary; x is an lvalue.',
        ),
        choose(
          'Only int f(const int&) is declared. Which calls compile?',
          [
            'Only f(x) for a variable x',
            'Only f(5)',
            'Both f(x) and f(5)',
            'Neither of them',
          ],
          2,
          'A const lvalue reference can bind to temporaries as well as to named objects.',
        ),
        choose(
          'Why does g(5) not compile when g is declared int g(int&)?',
          [
            'g must return void, not int',
            'A plain int& cannot bind to the temporary 5',
            '5 is a long literal, not an int',
            'g needs a second overload declared first',
          ],
          1,
          'Binding a modifiable reference to a temporary is not allowed.',
        ),
      ],
    },
  ],
  'cpp-move-cast': [
    {
      title: 'Turn a name into an rvalue with std::move',
      explanation: [
        'std::move(x) from <utility> is a cast: it turns the lvalue x into an rvalue expression, so overload resolution picks a T&& overload. It does not move anything by itself.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\n#include <utility>\nint category(const int&) {\n  return 1;\n}\nint category(int&&) {\n  return 2;\n}\nint main() {\n  int value = 4;\n  std::cout << category(value) << category(std::move(value)) << "\\n";\n}',
        output: '12',
        explanation:
          'Plain value is an lvalue; std::move(value) is an rvalue, so the int&& overload is chosen.',
      },
      questions: [
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <utility>\nint category(const int&) {\n  return 1;\n}\nint category(int&&) {\n  return 2;\n}\nint main() {\n  int x = 1;\n  std::cout << category(std::move(x)) << category(x) << "\\n";\n}',
          '21',
          'Only the call that wraps x in std::move passes an rvalue.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\n#include <utility>\nint main() {\n  int x = 7;\n  int y = std::move(x);\n  std::cout << x << " " << y << "\\n";\n}',
          '7 7',
          'Moving an int is just a copy, so x keeps its value.',
        ),
        choose(
          'What does std::move(x), on its own, do to x?',
          [
            'Empties x immediately',
            'Copies x into a temporary',
            'Nothing by itself; it is only a cast',
            'Deletes x at the end of the line',
          ],
          2,
          'Whatever moving happens is done by the function that receives the rvalue.',
        ),
      ],
    },
    {
      title: 'Let the receiving operation do the work',
      explanation: [
        'The receiving function decides what happens to an rvalue. Here two overloads only report which one was called. A std::move whose result is not passed anywhere has no effect at all.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\n#include <utility>\nvoid receive(const int&) {\n  std::cout << "copy\\n";\n}\nvoid receive(int&&) {\n  std::cout << "move\\n";\n}\nint main() {\n  int a = 1;\n  receive(a);\n  receive(std::move(a));\n}',
        output: 'copy\nmove',
        explanation: 'The cast changes only which overload receives a.',
      },
      questions: [
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <utility>\nvoid receive(const int&) {\n  std::cout << "copy ";\n}\nvoid receive(int&&) {\n  std::cout << "move ";\n}\nint main() {\n  int a = 1;\n  receive(a);\n  receive(std::move(a));\n  receive(a + 1);\n  std::cout << "\\n";\n}',
          'copy move move',
          'a is an lvalue; std::move(a) and a + 1 are rvalues.',
        ),
        choose(
          'With ints, what is x after int y = std::move(x);?',
          [
            '0, because x was moved from',
            'Unchanged, because moving an int copies it',
            'Undefined until it is assigned again',
            'Equal to y + 1 after the move',
          ],
          1,
          'There is nothing to transfer in an int, so the move is a copy.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\n#include <utility>\nint total(int&& a, int&& b) {\n  return a + b;\n}\nint main() {\n  int x = 2;\n  int y = 3;\n  std::cout << total(std::move(x), std::move(y)) << x << "\\n";\n}',
          '52',
          'std::move lets the named ints bind to int&&; the function only reads them, so x is still 2.',
        ),
      ],
    },
    {
      title: 'Do not rely on a moved-from value',
      explanation: [
        'After a real move, such as moving a std::string, the source is valid but its value is unspecified unless the operation documents it. Do not read it expecting the old value or emptiness; give it a new value or let it be destroyed.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\n#include <utility>\nint main() {\n  int x = 4;\n  int y = std::move(x);\n  x = 10;\n  std::cout << x + y << "\\n";\n}',
        output: '14',
        explanation:
          'Assigning a fresh value to the moved-from variable is always fine.',
      },
      questions: [
        choose(
          'After std::string b = std::move(a);, what may you safely do with a?',
          [
            'Read it and expect the old text',
            'Read it and expect an empty string',
            'Assign it a new value or let it be destroyed',
            'Nothing at all, not even destroy it',
          ],
          2,
          'A moved-from object stays valid, but its value must not be relied on.',
        ),
        choose(
          'Is a moved-from standard container guaranteed to be empty?',
          [
            'Yes, always',
            'No; it is valid but unspecified',
            'Only a std::vector',
            'Only if it was empty before',
          ],
          1,
          'The standard leaves the moved-from value unspecified for most operations.',
        ),
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <utility>\nint main() {\n  int x = 4;\n  int y = std::move(x);\n  x = 10;\n  std::cout << x << y << "\\n";\n}',
          '104',
          'x is given 10 after the move; y holds the 4 it received.',
        ),
      ],
    },
  ],
  'cpp-unique-transfer': [
    {
      title: 'Transfer ownership with std::move',
      explanation: [
        'A unique_ptr cannot be copied, because two owners would delete the object twice. It can be moved: auto second = std::move(first); hands the object to second and leaves first empty.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\n#include <memory>\n#include <utility>\nint main() {\n  auto first = std::make_unique<int>(7);\n  auto second = std::move(first);\n  std::cout << (first == nullptr) << " " << *second << "\\n";\n}',
        output: '1 7',
        explanation: 'Ownership moved to second, and first is now null.',
      },
      questions: [
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <memory>\n#include <utility>\nint main() {\n  auto a = std::make_unique<int>(3);\n  std::unique_ptr<int> b = std::move(a);\n  *b += 1;\n  std::cout << *b << (a == nullptr) << "\\n";\n}',
          '41',
          'b owns the int, which becomes 4, and a is empty.',
        ),
        choose(
          'What happens with auto a = std::make_unique<int>(1); auto b = a;?',
          [
            'b becomes a second owner of the int',
            'a becomes null and b owns the int',
            'b gets its own copy of the int',
            'It does not compile',
          ],
          3,
          'Copying is deleted for unique_ptr; ownership can only be moved.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\n#include <memory>\n#include <utility>\nint main() {\n  auto a = std::make_unique<int>(5);\n  auto b = std::move(a);\n  auto c = std::move(b);\n  std::cout << (a == nullptr) << (b == nullptr) << *c << "\\n";\n}',
          '115',
          'The int passed from a to b to c, leaving both earlier owners empty.',
        ),
      ],
    },
    {
      title: 'Check the emptied source before using it',
      explanation: [
        'Dereferencing an empty unique_ptr is undefined behavior. After a move, test the source before reading it, for example p ? *p : -1; it can also be given a new object.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\n#include <memory>\n#include <utility>\nint main() {\n  auto first = std::make_unique<int>(4);\n  auto second = std::move(first);\n  std::cout << (first ? *first : -1) << " " << (second ? *second : -1) << "\\n";\n}',
        output: '-1 4',
        explanation:
          'first is empty, so the fallback is used; second owns the 4.',
      },
      questions: [
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <memory>\nint main() {\n  std::unique_ptr<int> p;\n  std::cout << (p ? *p : 0) << "\\n";\n}',
          '0',
          'A default unique_ptr is empty, so the condition is false.',
        ),
        choose(
          'After auto b = std::move(a); with unique_ptrs, what does *a do?',
          [
            'Reads the old value',
            'Returns 0',
            'Moves the value back into a',
            'Undefined behavior: a is null',
          ],
          3,
          'a no longer owns anything; there is no object to read.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\n#include <memory>\n#include <utility>\nint main() {\n  auto a = std::make_unique<int>(9);\n  auto b = std::move(a);\n  a = std::make_unique<int>(1);\n  std::cout << *a + *b << "\\n";\n}',
          '10',
          'a was refilled with a new int 1, while b owns the 9.',
        ),
      ],
    },
    {
      title: 'Pass ownership into and out of functions',
      explanation: [
        'A function that returns std::unique_ptr gives its caller ownership. A function that takes std::unique_ptr by value takes ownership, so the caller must hand it over with std::move; to only look, take const std::unique_ptr<int>&.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\n#include <memory>\n#include <utility>\nstd::unique_ptr<int> make(int v) {\n  return std::make_unique<int>(v * 2);\n}\nint consume(std::unique_ptr<int> p) {\n  return *p + 1;\n}\nint main() {\n  auto p = make(5);\n  int r = consume(std::move(p));\n  std::cout << r << " " << (p == nullptr) << "\\n";\n}',
        output: '11 1',
        explanation:
          'make returns an owner of 10; consume takes it over and returns 11, leaving p empty.',
      },
      questions: [
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <memory>\nstd::unique_ptr<int> make(int v) {\n  return std::make_unique<int>(v * 2);\n}\nint main() {\n  auto p = make(3);\n  std::cout << *p << "\\n";\n}',
          '6',
          'make creates an int holding 6 and returns its owner.',
        ),
        choose(
          'p is a unique_ptr variable and consume takes std::unique_ptr<int> by value. Why does consume(p) not compile?',
          [
            'consume needs a raw pointer, such as p.get()',
            'p would be copied, which is forbidden',
            'p is null',
            'Functions cannot take a unique_ptr',
          ],
          1,
          'Passing an lvalue by value copies it; consume(std::move(p)) transfers instead.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\n#include <memory>\n#include <utility>\nstd::unique_ptr<int> make(int v) {\n  return std::make_unique<int>(v * 2);\n}\nint peek(const std::unique_ptr<int>& p) {\n  return *p;\n}\nint consume(std::unique_ptr<int> p) {\n  return *p + 1;\n}\nint main() {\n  auto p = make(4);\n  int a = peek(p);\n  int b = consume(std::move(p));\n  std::cout << a << " " << b << " " << (p == nullptr) << "\\n";\n}',
          '8 9 1',
          'peek only borrows; consume takes ownership, leaving p empty.',
        ),
      ],
    },
  ],
  'cpp-shared-ownership': [
    {
      title: 'Share one object between shared_ptr copies',
      explanation: [
        'std::make_shared<int>(3) creates an int owned by a std::shared_ptr. Copying a shared_ptr does not copy the int: both copies own the same object, so a change through one is visible through the other.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\n#include <memory>\nint main() {\n  auto first = std::make_shared<int>(3);\n  auto second = first;\n  *second += 2;\n  std::cout << *first << "\\n";\n}',
        output: '5',
        explanation: 'first and second own the same int, which becomes 5.',
      },
      questions: [
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <memory>\nint main() {\n  auto a = std::make_shared<int>(1);\n  auto b = a;\n  *a = 50;\n  std::cout << *b << "\\n";\n}',
          '50',
          'a and b share one int.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\n#include <memory>\nint main() {\n  auto a = std::make_shared<int>(1);\n  auto b = std::make_shared<int>(1);\n  *a = 50;\n  std::cout << *b << "\\n";\n}',
          '1',
          'Two make_shared calls create two separate ints.',
        ),
        choose(
          'What does copying a shared_ptr do?',
          [
            'Clones the pointed-to object',
            'Moves ownership and empties the source',
            'Fails to compile',
            'Adds another owner of the same object',
          ],
          3,
          'Shared ownership means several pointers own one object.',
        ),
      ],
    },
    {
      title: 'Count the owners with use_count()',
      explanation: [
        'A shared_ptr keeps a count of how many shared_ptrs own its object; use_count() reports it. Copies raise the count, destroying or resetting an owner lowers it, and moving transfers an owner without changing the count.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\n#include <memory>\nint main() {\n  auto a = std::make_shared<int>(0);\n  std::cout << a.use_count();\n  {\n    auto b = a;\n    std::cout << a.use_count();\n  }\n  std::cout << a.use_count() << "\\n";\n}',
        output: '121',
        explanation:
          'b adds an owner inside the block and removes it when destroyed.',
      },
      questions: [
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <memory>\nint main() {\n  auto a = std::make_shared<int>(0);\n  auto b = a;\n  auto c = b;\n  std::cout << a.use_count() << "\\n";\n}',
          '3',
          'a, b, and c all own the same int.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\n#include <memory>\nint main() {\n  auto a = std::make_shared<int>(0);\n  auto b = a;\n  b.reset();\n  std::cout << a.use_count() << (b == nullptr) << "\\n";\n}',
          '11',
          'reset makes b give up ownership, so only a remains.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\n#include <memory>\nint main() {\n  auto a = std::make_shared<int>(0);\n  {\n    auto b = a;\n    auto c = a;\n  }\n  std::cout << a.use_count() << "\\n";\n}',
          '1',
          'b and c stop owning when their block ends, leaving only a.',
        ),
      ],
    },
    {
      title: 'Keep the object alive until the last owner leaves',
      explanation: [
        'The shared object is destroyed when its last owner is destroyed or reset. Shared ownership is for objects that several parts of a program must keep alive independently; when one owner is enough, a unique_ptr states that more clearly.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\n#include <memory>\nstruct Noisy {\n  ~Noisy() { std::cout << "freed\\n"; }\n};\nint main() {\n  auto a = std::make_shared<Noisy>();\n  {\n    auto b = a;\n    a.reset();\n    std::cout << "still here\\n";\n  }\n  std::cout << "end\\n";\n}',
        output: 'still here\nfreed\nend',
        explanation:
          'After a.reset(), b is the last owner; the object dies when b does.',
      },
      questions: [
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <memory>\nstruct Noisy {\n  ~Noisy() { std::cout << "freed\\n"; }\n};\nint main() {\n  auto a = std::make_shared<Noisy>();\n  auto b = a;\n  a.reset();\n  b.reset();\n  std::cout << "x\\n";\n}',
          'freed\nx',
          'The object is destroyed once, when the second owner lets go.',
        ),
        choose(
          'When is an object held by several shared_ptrs destroyed?',
          [
            'When the first owner is destroyed',
            'Only when the program exits',
            'When use_count() is called',
            'When the last owner is destroyed or reset',
          ],
          3,
          'As long as any owner remains, the object stays alive.',
        ),
        choose(
          'Why not use shared_ptr for every heap object?',
          [
            'It cannot hold an int',
            'It is not part of the standard library',
            'It always leaks memory',
            'It blurs who owns the object and adds overhead',
          ],
          3,
          'Shared ownership is a deliberate design choice, not a default.',
        ),
      ],
    },
  ],
  'cpp-smart-pointers': [
    {
      title: 'Observe an object with weak_ptr',
      explanation: [
        'std::weak_ptr<int> w = owner; watches a shared object without owning it, so it does not raise use_count(). expired() reports whether the object has already been destroyed.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\n#include <memory>\nint main() {\n  auto owner = std::make_shared<int>(5);\n  std::weak_ptr<int> watcher = owner;\n  std::cout << owner.use_count() << " " << watcher.expired() << "\\n";\n}',
        output: '1 0',
        explanation:
          'The watcher is not an owner, and the object is still alive.',
      },
      questions: [
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <memory>\nint main() {\n  auto owner = std::make_shared<int>(5);\n  std::weak_ptr<int> w = owner;\n  owner.reset();\n  std::cout << w.expired() << "\\n";\n}',
          '1',
          'The only owner let go, so the object is gone and the weak_ptr has expired.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\n#include <memory>\nint main() {\n  auto a = std::make_shared<int>(1);\n  std::weak_ptr<int> w1 = a;\n  std::weak_ptr<int> w2 = a;\n  std::cout << a.use_count() << "\\n";\n}',
          '1',
          'Weak pointers do not count as owners.',
        ),
        choose(
          'Does a weak_ptr keep its object alive?',
          [
            'Yes, just like a shared_ptr',
            'Only while the weak_ptr is in scope',
            'No, it only observes',
            'Only if it was created first',
          ],
          2,
          'A weak_ptr never extends the lifetime of the object.',
        ),
      ],
    },
    {
      title: 'Lock a weak_ptr before using the object',
      explanation: [
        'w.lock() returns a shared_ptr: an owner of the object if it still exists, or an empty shared_ptr if it does not. Keep that shared_ptr while using the object, so it cannot disappear in the middle; checking expired() and then reading leaves a gap in which it could.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\n#include <memory>\nint main() {\n  auto owner = std::make_shared<int>(7);\n  std::weak_ptr<int> w = owner;\n  std::shared_ptr<int> locked = w.lock();\n  if (locked) std::cout << *locked << " " << owner.use_count() << "\\n";\n}',
        output: '7 2',
        explanation:
          'lock produced a second owner, so the count is 2 while it is held.',
      },
      questions: [
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <memory>\nint main() {\n  auto owner = std::make_shared<int>(3);\n  std::weak_ptr<int> w = owner;\n  owner.reset();\n  std::shared_ptr<int> p = w.lock();\n  std::cout << (p == nullptr) << "\\n";\n}',
          '1',
          'The object is already gone, so lock returns an empty shared_ptr.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\n#include <memory>\nint main() {\n  auto owner = std::make_shared<int>(3);\n  std::weak_ptr<int> w = owner;\n  std::shared_ptr<int> p = w.lock();\n  owner.reset();\n  std::cout << *p << " " << w.expired() << "\\n";\n}',
          '3 0',
          'p became an owner before owner.reset(), so the object stays alive.',
        ),
        choose(
          'Why call lock() instead of checking expired() and then reading the object?',
          [
            'expired() always returns false here',
            'expired() is not a member of weak_ptr',
            'It can expire between check and read',
            'lock() makes a fresh copy of the int',
          ],
          2,
          'lock checks and takes ownership in one step.',
        ),
      ],
    },
    {
      title: 'Test lock() as a bool',
      explanation: [
        'A shared_ptr converts to bool: true when it owns an object. static_cast<bool>(w.lock()) is therefore a yes-or-no answer to "is the object still there?", and it stays true as long as any owner remains.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\n#include <memory>\nint main() {\n  auto owner = std::make_shared<int>(5);\n  std::weak_ptr<int> w = owner;\n  bool before = static_cast<bool>(w.lock());\n  owner.reset();\n  bool after = static_cast<bool>(w.lock());\n  std::cout << before << after << "\\n";\n}',
        output: '10',
        explanation:
          'The first lock finds the object; after the reset there is nothing left to lock.',
      },
      questions: [
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <memory>\nint main() {\n  auto a = std::make_shared<int>(1);\n  auto b = a;\n  std::weak_ptr<int> w = a;\n  a.reset();\n  std::cout << static_cast<bool>(w.lock()) << "\\n";\n}',
          '1',
          'b still owns the object, so lock succeeds.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\n#include <memory>\nint main() {\n  std::weak_ptr<int> w;\n  std::cout << w.expired() << static_cast<bool>(w.lock()) << "\\n";\n}',
          '10',
          'An empty weak_ptr observes nothing: it counts as expired and locks to an empty pointer.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\n#include <memory>\nint main() {\n  auto a = std::make_shared<int>(8);\n  std::weak_ptr<int> w = a;\n  std::shared_ptr<int> p = w.lock();\n  std::cout << (p && *p == 8) << p.use_count() << "\\n";\n}',
          '12',
          'p owns the 8, and together with a there are two owners.',
        ),
      ],
    },
  ],
  'cpp-move-member': [
    {
      title: 'Move an owned member in a move constructor',
      explanation: [
        'A move constructor, Box(Box&& other), builds a new object from one that is about to be given up. For a unique_ptr member it moves the pointer across: data(std::move(other.data)). std::move is needed because other.data has a name and would otherwise be treated as something to copy.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\n#include <memory>\n#include <utility>\nstruct Box {\n  std::unique_ptr<int> data;\n  explicit Box(int x) : data(std::make_unique<int>(x)) {}\n  Box(Box&& other) : data(std::move(other.data)) {}\n};\nint main() {\n  Box source(9);\n  Box destination(std::move(source));\n  std::cout << (source.data == nullptr) << " " << *destination.data << "\\n";\n}',
        output: '1 9',
        explanation:
          'The int now belongs to destination, and source.data is empty.',
      },
      questions: [
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <memory>\n#include <utility>\nstruct Box {\n  std::unique_ptr<int> data;\n  explicit Box(int x) : data(std::make_unique<int>(x)) {}\n  Box(Box&& other) : data(std::move(other.data)) {}\n};\nint main() {\n  Box a(4);\n  Box b(std::move(a));\n  std::cout << (a.data ? *a.data : -1) << " " << *b.data << "\\n";\n}',
          '-1 4',
          "The move constructor took a's int, so a is empty and b holds 4.",
        ),
        choose(
          'Why does Box(Box&& other) : data(std::move(other.data)) {} need std::move?',
          [
            'unique_ptr has no constructor without it',
            'It deletes other afterwards',
            'Without it, a copy is attempted',
            'It is optional and only documents intent',
          ],
          2,
          "Named members are lvalues; the cast lets unique_ptr's move constructor be chosen.",
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\n#include <memory>\n#include <utility>\nstruct Box {\n  std::unique_ptr<int> data;\n  explicit Box(int x) : data(std::make_unique<int>(x)) {}\n  Box(Box&& other) : data(std::move(other.data)) {}\n};\nint main() {\n  Box a(2);\n  Box b(std::move(a));\n  Box c(std::move(b));\n  std::cout << (a.data == nullptr) + (b.data == nullptr) << *c.data << "\\n";\n}',
          '22',
          'Both earlier boxes are empty (1 + 1 = 2), and c holds the 2.',
        ),
      ],
    },
    {
      title: 'Leave the source safe to destroy',
      explanation: [
        'The moved-from object is still destroyed later, so after the move it must own nothing. A moved-from unique_ptr is empty and its destructor does nothing, so the resource is released exactly once, by the new owner.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\n#include <memory>\n#include <utility>\nstruct Res {\n  int id;\n  explicit Res(int i) : id(i) {}\n  ~Res() { std::cout << "release " << id << "\\n"; }\n};\nstruct Holder {\n  std::unique_ptr<Res> res;\n  explicit Holder(int id) : res(std::make_unique<Res>(id)) {}\n  Holder(Holder&& other) : res(std::move(other.res)) {}\n};\nint main() {\n  {\n    Holder a(1);\n    Holder b(std::move(a));\n  }\n  std::cout << "done\\n";\n}',
        output: 'release 1\ndone',
        explanation:
          'Both holders are destroyed, but only b owns the resource, so it is released once.',
      },
      questions: [
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <memory>\n#include <utility>\nstruct Res {\n  int id;\n  explicit Res(int i) : id(i) {}\n  ~Res() { std::cout << "release " << id << "\\n"; }\n};\nstruct Holder {\n  std::unique_ptr<Res> res;\n  explicit Holder(int id) : res(std::make_unique<Res>(id)) {}\n  Holder(Holder&& other) : res(std::move(other.res)) {}\n};\nint main() {\n  Holder a(1);\n  Holder b(2);\n  Holder c(std::move(a));\n}',
          'release 1\nrelease 2',
          'Destruction runs c, b, a: c releases 1, b releases 2, and the empty a releases nothing.',
        ),
        choose(
          "A move constructor copies a raw owning pointer from other and leaves other's pointer unchanged. What goes wrong?",
          [
            'Nothing, because the move finished',
            'Both objects delete the same memory',
            'The new object ends up empty',
            'The program does not compile',
          ],
          1,
          'Two owners of one allocation mean a double delete when both are destroyed.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\n#include <memory>\n#include <utility>\nstruct Res {\n  int id;\n  explicit Res(int i) : id(i) {}\n  ~Res() { std::cout << "release " << id << "\\n"; }\n};\nstruct Holder {\n  std::unique_ptr<Res> res;\n  explicit Holder(int id) : res(std::make_unique<Res>(id)) {}\n  Holder(Holder&& other) : res(std::move(other.res)) {}\n};\nint main() {\n  Holder a(7);\n  Holder b(std::move(a));\n  std::cout << (a.res == nullptr) << "\\n";\n}',
          '1\nrelease 7',
          'a is empty after the move; the resource is released once, when b is destroyed.',
        ),
      ],
    },
    {
      title: 'Rely on generated moves for simple types',
      explanation: [
        'A struct that declares none of its own copy, move, or destructor functions gets a generated move constructor and move assignment, which move every member. A struct with a unique_ptr member therefore moves but cannot be copied.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\n#include <memory>\n#include <utility>\nstruct Pack {\n  std::unique_ptr<int> item;\n};\nint main() {\n  Pack a{std::make_unique<int>(6)};\n  Pack b = std::move(a);\n  std::cout << (a.item == nullptr) << *b.item << "\\n";\n}',
        output: '16',
        explanation:
          'The generated move constructor moved the unique_ptr member.',
      },
      questions: [
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <memory>\n#include <utility>\nstruct Pack {\n  std::unique_ptr<int> item;\n};\nint main() {\n  Pack a{std::make_unique<int>(3)};\n  Pack b{std::make_unique<int>(4)};\n  b = std::move(a);\n  std::cout << *b.item << (a.item == nullptr) << "\\n";\n}',
          '31',
          'Move assignment gives b the 3 (its old 4 is freed) and empties a.',
        ),
        choose(
          'Why does Pack b = a; fail to compile?',
          [
            'Pack has no constructor at all',
            'b must be declared as a reference',
            'a is const',
            'Its unique_ptr cannot be copied',
          ],
          3,
          'The generated copy constructor would have to copy the unique_ptr, which is not allowed.',
          'struct Pack {\n  std::unique_ptr<int> item;\n};\nPack a{std::make_unique<int>(6)};\nPack b = a;',
        ),
        choose(
          "Which members does a struct's compiler-generated move constructor move?",
          [
            'Only the first declared member',
            'Every member, using its own move',
            'None of them; it copies instead',
            'Only the members that are unique_ptrs',
          ],
          1,
          'Member-wise moving applies to all members, in declaration order.',
        ),
      ],
    },
  ],
  'cpp-move': [
    {
      title: 'Mark a move that cannot throw as noexcept',
      explanation: [
        'Writing noexcept on a move constructor promises it will not throw. A defaulted move of members that cannot throw, such as a unique_ptr, may be marked noexcept truthfully. std::is_nothrow_move_constructible_v<T> reports whether T makes that promise.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\n#include <memory>\n#include <type_traits>\nstruct Box {\n  std::unique_ptr<int> value;\n  Box() = default;\n  Box(Box&&) noexcept = default;\n};\nint main() {\n  std::cout << std::is_nothrow_move_constructible_v<Box> << "\\n";\n}',
        output: '1',
        explanation:
          'Box declares a noexcept move constructor, so the trait is true.',
      },
      questions: [
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <type_traits>\nstruct Risky {\n  Risky() = default;\n  Risky(Risky&&) {}\n};\nint main() {\n  std::cout << std::is_nothrow_move_constructible_v<Risky> << "\\n";\n}',
          '0',
          'A hand-written move constructor without noexcept makes no promise.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\n#include <type_traits>\nstruct Safe {\n  Safe() = default;\n  Safe(Safe&&) noexcept {}\n};\nstruct Risky {\n  Risky() = default;\n  Risky(Risky&&) {}\n};\nint main() {\n  std::cout << std::is_nothrow_move_constructible_v<Safe> << std::is_nothrow_move_constructible_v<Risky> << "\\n";\n}',
          '10',
          'Only Safe marks its move constructor noexcept.',
        ),
        choose(
          'What does noexcept on a move constructor promise?',
          [
            'It catches every exception',
            'It runs faster than a copy',
            'It cannot be called directly',
            'It will not throw',
          ],
          3,
          'noexcept is a promise about exceptions, nothing more.',
        ),
      ],
    },
    {
      title: 'Keep the noexcept promise truthful',
      explanation: [
        'If a noexcept function does throw, the exception is not passed on: std::terminate ends the program. The noexcept(expression) operator asks whether an expression is declared not to throw.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\nint read_value() noexcept {\n  return 7;\n}\nint may_fail() {\n  return 8;\n}\nint main() {\n  std::cout << noexcept(read_value()) << noexcept(may_fail()) << "\\n";\n}',
        output: '10',
        explanation:
          'Only read_value is declared noexcept; may_fail makes no promise even though it happens not to throw.',
      },
      questions: [
        choose(
          'A function marked noexcept throws an exception. What happens?',
          [
            'The nearest catch block handles it',
            'The exception is silently ignored',
            'std::terminate ends the program',
            'noexcept is switched off at run time',
          ],
          2,
          'The promise was broken, and the program cannot continue.',
        ),
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\nvoid quiet() noexcept {}\nvoid loud() {}\nint main() {\n  std::cout << noexcept(quiet()) << noexcept(loud()) << noexcept(1 + 1) << "\\n";\n}',
          '101',
          'quiet promises not to throw, loud does not, and 1 + 1 cannot throw.',
        ),
        choose(
          'When should a move constructor be marked noexcept?',
          [
            'Always, even if it may throw',
            'Never, because exceptions must propagate',
            'Only when its operations truly cannot throw',
            'Only for types with no members',
          ],
          2,
          'A false promise turns an exception into program termination.',
        ),
      ],
    },
    {
      title: 'See why generic code prefers nonthrowing moves',
      explanation: [
        'Generic code that must not lose data, such as a vector moving its elements to new storage, moves only if the move cannot throw; otherwise it copies, so a failure leaves the originals intact. std::move_if_noexcept(x) from <utility> makes the same choice: an rvalue when the move is noexcept (or no copy exists), otherwise an lvalue that gets copied.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\n#include <utility>\nstruct Safe {\n  Safe() = default;\n  Safe(const Safe&) { std::cout << "copy\\n"; }\n  Safe(Safe&&) noexcept { std::cout << "move\\n"; }\n};\nint main() {\n  Safe a;\n  Safe b = std::move_if_noexcept(a);\n}',
        output: 'move',
        explanation: "Safe's move cannot throw, so the move is chosen.",
      },
      questions: [
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <utility>\nstruct Risky {\n  Risky() = default;\n  Risky(const Risky&) { std::cout << "copy\\n"; }\n  Risky(Risky&&) { std::cout << "move\\n"; }\n};\nint main() {\n  Risky a;\n  Risky b = std::move_if_noexcept(a);\n}',
          'copy',
          'The move might throw and a copy is available, so the safe copy is chosen.',
        ),
        choose(
          'Why does std::vector copy, rather than move, elements whose move may throw when it grows?',
          [
            'Moves are always slower than copies',
            'A vector is never allowed to move elements',
            'A throwing move halfway would damage the old elements',
            'The choice is made at random by the library',
          ],
          2,
          'Copying keeps the original elements intact if something throws.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\n#include <utility>\nstruct Only {\n  Only() = default;\n  Only(Only&&) { std::cout << "move\\n"; }\n};\nint main() {\n  Only a;\n  Only b = std::move_if_noexcept(a);\n}',
          'move',
          'Only has no copy constructor, so the possibly throwing move is the only option.',
        ),
      ],
    },
  ],
  'cpp-independent-copy': [
    {
      title: 'Copy a vector and get independent elements',
      explanation: [
        'A std::vector owns its elements. Copying it, as in std::vector<int> second = first;, copies every element into storage the new vector owns, so later changes to one vector do not affect the other.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\n#include <vector>\nint main() {\n  std::vector<int> first{1, 2, 3};\n  std::vector<int> second = first;\n  second[0] = 100;\n  std::cout << first[0] << " " << second[0] << "\\n";\n}',
        output: '1 100',
        explanation:
          'second has its own copy of the elements, so only it changes.',
      },
      questions: [
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <vector>\nint main() {\n  std::vector<int> a{5, 6};\n  auto b = a;\n  b[1] += 10;\n  std::cout << a[1] << " " << b[1] << "\\n";\n}',
          '6 16',
          'auto b = a makes an independent vector; only b[1] changes.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\n#include <vector>\nint main() {\n  std::vector<int> a{1};\n  std::vector<int> b = a;\n  a[0] = 9;\n  std::cout << b[0] << "\\n";\n}',
          '1',
          'b copied 1 before a changed.',
        ),
        choose(
          'After auto copy = original; with a std::vector, how are their elements related?',
          [
            'They share the same storage',
            'copy is empty until it is written',
            'copy has its own equal elements',
            'copy refers to original',
          ],
          2,
          'Copying a vector copies its elements.',
        ),
      ],
    },
    {
      title: 'Choose between a copy and a reference',
      explanation: [
        "auto& alias = v; refers to the same vector, so changes through it are shared. A function parameter of type std::vector<int> receives a copy, while const std::vector<int>& borrows the caller's vector.",
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\n#include <vector>\nint main() {\n  std::vector<int> v{4, 5};\n  auto copy = v;\n  auto& alias = v;\n  alias[0] = 0;\n  std::cout << v[0] << " " << copy[0] << "\\n";\n}',
        output: '0 4',
        explanation: 'alias is v itself; copy kept the original 4.',
      },
      questions: [
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <vector>\nint main() {\n  std::vector<int> v{1, 2};\n  auto& r = v;\n  auto c = r;\n  r[1] = 7;\n  std::cout << v[1] << c[1] << "\\n";\n}',
          '72',
          'r is v; c is a copy made before the change.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\n#include <vector>\nint bump_copy(std::vector<int> v) {\n  v[0] += 1;\n  return v[0];\n}\nint main() {\n  std::vector<int> v{3};\n  int r = bump_copy(v);\n  std::cout << r << v[0] << "\\n";\n}',
          '43',
          "The function changed its own copy; the caller's vector still holds 3.",
        ),
        choose(
          'A function takes std::vector<int> values by value and changes it. What does the caller see?',
          [
            'The changed elements',
            'An empty vector',
            'Its own vector, unchanged',
            'A compile error',
          ],
          2,
          'The parameter is an independent copy.',
        ),
      ],
    },
    {
      title: 'Know that copies cost time and memory',
      explanation: [
        'std::vector<int> big(1000, 7); holds 1000 sevens. Copying it copies all 1000 elements, so the cost grows with the size. When a function only reads a large vector, a const reference avoids that work.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\n#include <vector>\nint main() {\n  std::vector<int> big(1000, 7);\n  std::vector<int> copy = big;\n  copy[999] = 0;\n  std::cout << big[999] << " " << copy.size() << "\\n";\n}',
        output: '7 1000',
        explanation:
          'copy has its own 1000 elements; changing one leaves big unchanged.',
      },
      questions: [
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <vector>\nint main() {\n  std::vector<int> v(3, 2);\n  auto c = v;\n  c[0] = 5;\n  std::cout << v[0] + v[1] + v[2] << "\\n";\n}',
          '6',
          'v holds three 2s, untouched by the change to the copy.',
        ),
        choose(
          'Why pass a large vector that is only read as const std::vector<int>& rather than by value?',
          [
            'Vectors cannot be passed by value',
            'References are faster for every type',
            'const stops the vector from being freed',
            'A by-value parameter copies every element',
          ],
          3,
          'The reference avoids the copy, and const keeps the function read-only.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\n#include <vector>\nint main() {\n  std::vector<int> v(4, 1);\n  std::vector<int> w = v;\n  w[0] = 9;\n  std::cout << v.size() + w.size() << " " << v[0] << "\\n";\n}',
          '8 1',
          'Each vector has 4 elements, and v[0] is still 1.',
        ),
      ],
    },
  ],
  'cpp-rule-zero': [
    {
      title: 'Let value members copy themselves',
      explanation: [
        'A struct whose members manage themselves, such as a std::vector, needs no hand-written copy constructor. The compiler-generated one copies each member, so copies of the struct are independent.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\n#include <vector>\nstruct Record {\n  std::vector<int> values;\n};\nint main() {\n  Record first{{7, 2}};\n  Record second = first;\n  second.values[0] = 99;\n  std::cout << first.values[0] << "\\n";\n}',
        output: '7',
        explanation:
          'Copying the record copied its vector, so first is unaffected.',
      },
      questions: [
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <vector>\nstruct Team {\n  std::vector<int> scores;\n  int bonus;\n};\nint main() {\n  Team a{{1, 2}, 5};\n  Team b = a;\n  b.scores[1] = 0;\n  b.bonus = 0;\n  std::cout << a.scores[1] + a.bonus << "\\n";\n}',
          '7',
          'Every member was copied, so a still has scores[1] = 2 and bonus = 5.',
        ),
        choose(
          'Record holds a std::vector and declares no copy constructor. What does copying a Record do?',
          [
            'Shares the vector between both records',
            'Fails to compile',
            'Gives each record its own vector',
            "Leaves the copy's vector empty",
          ],
          2,
          "The generated copy constructor copies each member using that member's own copy.",
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\n#include <vector>\nstruct Bag {\n  std::vector<int> items;\n};\nint main() {\n  Bag a{{1, 2, 3}};\n  Bag b = a;\n  b.items[0] = 10;\n  std::cout << a.items.size() << " " << b.items[0] << "\\n";\n}',
          '3 10',
          'b has its own three elements; only its first one changed.',
        ),
      ],
    },
    {
      title: 'Write no special members when members manage resources',
      explanation: [
        "The rule of zero: if every resource is owned by a member that cleans up after itself, write none of the copy, move, or destructor functions. Adding a destructor that frees a vector's storage by hand would free it twice.",
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\n#include <vector>\nstruct Grid {\n  std::vector<int> row;\n  std::vector<int> col;\n};\nint main() {\n  Grid a{{1, 2}, {3}};\n  Grid b{{0}, {0, 0}};\n  b = a;\n  a.row[0] = 5;\n  std::cout << b.row[0] << " " << b.col.size() << "\\n";\n}',
        output: '1 1',
        explanation:
          'The generated assignment copied both vectors, so b is independent of later changes to a.',
      },
      questions: [
        choose(
          "A class holds a std::vector, and its author adds a destructor that frees the vector's storage by hand. What goes wrong?",
          [
            'Nothing; the extra delete is just safety',
            'The storage is freed twice',
            'The vector leaks its storage instead',
            'The class can no longer be copied',
          ],
          1,
          'The vector already owns and frees its storage.',
        ),
        choose(
          'What does the rule of zero recommend?',
          [
            'Write all five special member functions for every class',
            'Never use classes',
            'Declare none; let the members manage resources',
            'Delete the copy operations of every class',
          ],
          2,
          'The members already know how to copy, move, and destroy themselves.',
        ),
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <vector>\nstruct Grid {\n  std::vector<int> row;\n  std::vector<int> col;\n};\nint main() {\n  Grid a{{4}, {1, 2, 3}};\n  Grid b = a;\n  b.col[2] = 9;\n  std::cout << a.col[2] << b.row[0] << "\\n";\n}',
          '34',
          'a keeps its own col, and b.row was copied as 4.',
        ),
      ],
    },
  ],
  'cpp-copy-assignment': [
    {
      title: 'Replace a value with copy assignment',
      explanation: [
        "a = b; on an existing vector a throws away a's old elements and copies b's. Afterwards the two are equal but still independent.",
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\n#include <vector>\nint main() {\n  std::vector<int> a{1, 2, 3};\n  std::vector<int> b{9};\n  b = a;\n  a[0] = 0;\n  std::cout << b.size() << " " << b[0] << "\\n";\n}',
        output: '3 1',
        explanation:
          "b now has a copy of a's three elements; the later change to a does not reach it.",
      },
      questions: [
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <vector>\nint main() {\n  std::vector<int> a{4};\n  std::vector<int> b{5, 6, 7};\n  a = b;\n  std::cout << a.size() << a[2] << "\\n";\n}',
          '37',
          'a now holds 5, 6, 7.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\n#include <vector>\nint main() {\n  std::vector<int> a{1};\n  std::vector<int> b{2};\n  a = b;\n  b[0] = 3;\n  std::cout << a[0] << b[0] << "\\n";\n}',
          '23',
          'a copied 2; changing b afterwards does not affect it.',
        ),
        choose(
          'After a = b; with vectors, what does a contain?',
          [
            "Its old elements followed by b's",
            'The same storage as b',
            "Only a copy of b's elements",
            "Only b's first element",
          ],
          2,
          'Assignment replaces the whole value.',
        ),
      ],
    },
    {
      title: 'Make self-assignment safe',
      explanation: [
        'Assigning an object to itself, perhaps through a reference, must leave it unchanged. Standard types handle it; a hand-written assignment that frees its own data before copying from the source would destroy the very data it is about to copy.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\n#include <vector>\nint main() {\n  std::vector<int> values{8, 1};\n  const auto& alias = values;\n  values = alias;\n  std::cout << values[0] << values.size() << "\\n";\n}',
        output: '82',
        explanation:
          'alias is values itself, and assigning a vector to itself keeps its contents.',
      },
      questions: [
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <vector>\nint main() {\n  std::vector<int> v{3, 4, 5};\n  auto& same = v;\n  v = same;\n  std::cout << v.size() << v[1] << "\\n";\n}',
          '34',
          'Self-assignment leaves the three elements as they were.',
        ),
        choose(
          'A hand-written copy assignment frees its own storage first and then copies from other. What happens with x = x;?',
          [
            'Nothing; self-assignment is skipped',
            'It frees the data before copying it',
            'It copies the data twice',
            'It does not compile',
          ],
          1,
          'other is x itself, so the data is gone before it is read.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\nstruct Pair {\n  int a;\n  int b;\n};\nint main() {\n  Pair p{1, 2};\n  Pair& r = p;\n  p = r;\n  std::cout << p.a << p.b << "\\n";\n}',
          '12',
          'Assigning p to itself leaves both members unchanged.',
        ),
      ],
    },
    {
      title: 'Tell assignment from initialization',
      explanation: [
        "std::vector<int> b = a; creates b as a copy (copy construction). b = a; on a b that already exists replaces its value (copy assignment). Both produce independent copies; assignment also discards b's old value.",
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\n#include <vector>\nstruct Inventory {\n  std::vector<int> counts;\n};\nint main() {\n  Inventory a{{3, 4}};\n  Inventory b{{0}};\n  b = a;\n  b.counts[0] = 9;\n  std::cout << a.counts[0] << b.counts[0] << b.counts.size() << "\\n";\n}',
        output: '392',
        explanation:
          "b received a copy of a's two counts, then changed its own first count.",
      },
      questions: [
        choose(
          'Which line performs copy assignment rather than copy construction?',
          [
            'std::vector<int> b = a;',
            'std::vector<int> b(a);',
            'auto b = a;',
            'b = a; where b already exists',
          ],
          3,
          'Only b = a; on an existing b gives a new value to an object that already exists; the others create b.',
        ),
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <vector>\nint main() {\n  std::vector<int> a{1, 2};\n  std::vector<int> b{3};\n  std::vector<int> c{4, 5, 6};\n  a = b = c;\n  std::cout << a.size() << b.size() << "\\n";\n}',
          '33',
          'Assignment groups right to left: b = c first, then a = b.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\n#include <vector>\nstruct Inventory {\n  std::vector<int> counts;\n};\nint main() {\n  Inventory a{{1}};\n  Inventory b{{2, 2}};\n  a = b;\n  b.counts[1] = 7;\n  std::cout << a.counts.size() << a.counts[1] << "\\n";\n}',
          '22',
          "a copied both of b's counts before b changed.",
        ),
      ],
    },
  ],
  'cpp-value-semantics': [
    {
      title: 'Swap two vectors',
      explanation: [
        'a.swap(b), or std::swap(a, b) from <utility>, exchanges the entire contents of two vectors. A vector swap exchanges their internal storage instead of copying elements, so it is fast whatever the sizes.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\n#include <vector>\nint main() {\n  std::vector<int> left{2};\n  std::vector<int> right{9, 8};\n  left.swap(right);\n  std::cout << left.size() << left[0] << " " << right[0] << "\\n";\n}',
        output: '29 2',
        explanation: 'left now holds 9, 8 and right holds 2.',
      },
      questions: [
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <vector>\nint main() {\n  std::vector<int> a{1, 2, 3};\n  std::vector<int> b{4};\n  a.swap(b);\n  std::cout << a.size() << b.size() << "\\n";\n}',
          '13',
          'The contents trade places, sizes included.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\n#include <utility>\n#include <vector>\nint main() {\n  std::vector<int> a{5};\n  std::vector<int> b{6};\n  std::swap(a, b);\n  std::cout << a[0] << b[0] << "\\n";\n}',
          '65',
          'std::swap exchanges the two vectors.',
        ),
        choose(
          'Why is swapping two large vectors fast?',
          [
            'The elements are copied in parallel',
            'Only the first elements are swapped',
            'They exchange internal storage, not elements',
            'It is not fast; it copies both vectors',
          ],
          2,
          "Each vector simply takes over the other's storage.",
        ),
      ],
    },
    {
      title: 'Swap ints and structs with std::swap',
      explanation: [
        'std::swap works on any copyable or movable type: two ints, two structs, two vectors. For a struct it exchanges the whole objects, every member at once.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\n#include <utility>\nint main() {\n  int a = 3;\n  int b = 8;\n  std::swap(a, b);\n  std::cout << a << b << "\\n";\n}',
        output: '83',
        explanation: 'The values of a and b are exchanged.',
      },
      questions: [
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <utility>\nstruct Quote {\n  int price;\n  int size;\n};\nint main() {\n  Quote x{10, 1};\n  Quote y{20, 2};\n  std::swap(x, y);\n  std::cout << x.price << " " << x.size << "\\n";\n}',
          '20 2',
          "Whole objects are exchanged, so x takes both of y's members.",
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\n#include <utility>\nint main() {\n  int a = 1;\n  int b = 2;\n  int c = 3;\n  std::swap(a, b);\n  std::swap(b, c);\n  std::cout << a << b << c << "\\n";\n}',
          '231',
          'After the first swap a is 2 and b is 1; the second swap moves 3 into b and 1 into c.',
        ),
        choose(
          'A hand-written swap exchanges only the data pointer of two buffers, not their size members. What is left?',
          [
            'Two correctly swapped buffers',
            'Two buffers that are both empty',
            'A compile error in the swap',
            'Buffers whose pointer and size disagree',
          ],
          3,
          'Members that describe one another must be swapped together.',
        ),
      ],
    },
    {
      title: 'Swap whole values and keep references in place',
      explanation: [
        "Swapping exchanges values, not identities: a reference to a still refers to a, which now holds the other value. Swapping complete objects keeps each object's members consistent with each other.",
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\n#include <vector>\nint main() {\n  std::vector<int> a{1, 2};\n  std::vector<int> b{3};\n  std::vector<int>& ref = a;\n  a.swap(b);\n  std::cout << ref.size() << ref[0] << "\\n";\n}',
        output: '13',
        explanation: 'ref still names a, and a now holds the single element 3.',
      },
      questions: [
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <utility>\nint main() {\n  int x = 4;\n  int y = 9;\n  int& r = x;\n  std::swap(x, y);\n  std::cout << r << "\\n";\n}',
          '9',
          'r refers to x, and x now holds 9.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\n#include <vector>\nint main() {\n  std::vector<int> a{1};\n  std::vector<int> b{2, 3};\n  a.swap(b);\n  a.swap(b);\n  std::cout << a.size() << b.size() << "\\n";\n}',
          '12',
          'Swapping twice puts everything back where it started.',
        ),
        choose(
          'Why swap entire objects rather than their members one by one?',
          [
            'Member swaps do not compile',
            'Whole swaps keep members consistent',
            'Whole swaps copy more data',
            'Swapping members one by one is faster',
          ],
          1,
          'Swapping everything together cannot leave an object half updated.',
        ),
      ],
    },
  ],
  'cpp-vector-elements': [
    {
      title: 'Index a vector from 0 to size() - 1',
      explanation: [
        'std::vector<int> from <vector> holds a sequence of ints in one contiguous block. Elements are numbered from 0, v[i] reads element i, and v.size() is the number of elements, so the last one is v[v.size() - 1].',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\n#include <vector>\nint main() {\n  std::vector<int> prices{7, 4, 9};\n  std::cout << prices[0] << " " << prices[2] << " " << prices.size() << "\\n";\n}',
        output: '7 9 3',
        explanation:
          'Index 0 is the first price and index 2 the last of the three.',
      },
      questions: [
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <vector>\nint main() {\n  std::vector<int> v{3, 6, 9, 12};\n  std::cout << v[1] + v[3] << "\\n";\n}',
          '18',
          'Index 1 holds 6 and index 3 holds 12.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\n#include <vector>\nint main() {\n  std::vector<int> v{5, 8};\n  std::cout << v[v.size() - 1] << "\\n";\n}',
          '8',
          'size() is 2, so the last element is at index 1.',
        ),
        choose(
          'Which expression reads the last element of a vector v that has 5 elements?',
          ['v[5]', 'v[6]', 'v[4]', 'v[-1]'],
          2,
          'Five elements occupy indices 0 through 4.',
        ),
      ],
    },
    {
      title: 'Write elements through operator[]',
      explanation: [
        'v[i] is the element itself, so v[i] = x; replaces it. operator[] does not check i: an index outside 0 to size() - 1 is undefined behavior, not an error message.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\n#include <vector>\nint main() {\n  std::vector<int> scores{1, 2, 3};\n  scores[1] = 20;\n  std::cout << scores[0] + scores[1] << "\\n";\n}',
        output: '21',
        explanation: 'The second element is replaced by 20, and 1 + 20 is 21.',
      },
      questions: [
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <vector>\nint main() {\n  std::vector<int> v{0, 0, 0};\n  v[2] = 5;\n  v[0] = v[2] * 2;\n  std::cout << v[0] << v[1] << v[2] << "\\n";\n}',
          '1005',
          'v becomes 10, 0, 5, printed without separators.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\n#include <vector>\nint main() {\n  std::vector<int> v{4, 4};\n  int x = v[0];\n  v[0] = 9;\n  std::cout << x << v[0] << "\\n";\n}',
          '49',
          'x copied 4 before the element was replaced with 9.',
        ),
        choose(
          'What does v[10] do when v has 3 elements?',
          [
            'Returns 0 for a missing element',
            'Throws an out-of-range exception',
            'Grows the vector to 11 elements',
            'Undefined behavior, with no check',
          ],
          3,
          'Only indices below size() may be used with operator[].',
        ),
      ],
    },
    {
      title: 'Check index < size() before indexing',
      explanation: [
        'Indices and sizes are std::size_t, an unsigned type, so a valid index i satisfies i < v.size(). Check that first and choose a fallback otherwise, for example i < v.size() ? v[i] : -1.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\n#include <cstddef>\n#include <vector>\nint main() {\n  std::vector<int> v{7, 4};\n  std::size_t index = 5;\n  std::cout << (index < v.size() ? v[index] : -1) << "\\n";\n}',
        output: '-1',
        explanation:
          '5 is not below the size 2, so the fallback is used and v[5] is never touched.',
      },
      questions: [
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <cstddef>\n#include <vector>\nint main() {\n  std::vector<int> v{7, 4};\n  std::size_t i = 1;\n  std::cout << (i < v.size() ? v[i] : -1) << "\\n";\n}',
          '4',
          'Index 1 is valid and holds 4.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\n#include <cstddef>\n#include <vector>\nint main() {\n  std::vector<int> v;\n  std::size_t i = 0;\n  std::cout << (i < v.size() ? v[i] : -1) << " " << v.size() << "\\n";\n}',
          '-1 0',
          'An empty vector has no index 0, so the fallback is chosen.',
        ),
        choose(
          'Why is the check i <= v.size() wrong?',
          [
            'It rejects index 0',
            'size() cannot be compared with an index',
            'It is correct as written',
            'It allows i == v.size(), past the end',
          ],
          3,
          'The last valid index is size() - 1.',
        ),
      ],
    },
  ],
  'cpp-string-size': [
    {
      title: 'Store text in std::string and count it',
      explanation: [
        'std::string from <string> owns a sequence of characters in memory it manages, and size() returns how many characters it holds. Spaces count like any other character.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\n#include <string>\nint main() {\n  std::string word = "hello";\n  std::cout << word.size() << " " << word << "\\n";\n}',
        output: '5 hello',
        explanation: 'The string holds five characters.',
      },
      questions: [
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <string>\nint main() {\n  std::string s = "C++ 20";\n  std::cout << s.size() << "\\n";\n}',
          '6',
          'C, +, +, space, 2, 0: the space counts too.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\n#include <string>\nint main() {\n  std::string empty = "";\n  std::string space = " ";\n  std::cout << empty.size() << space.size() << "\\n";\n}',
          '01',
          'The empty string holds nothing; the other holds one space.',
        ),
        choose(
          'What does a std::string own?',
          [
            'Only a pointer to a string literal',
            'A fixed buffer of 16 characters',
            'Its own copy of the characters',
            'Nothing; it borrows its characters',
          ],
          2,
          'A std::string has its own storage, which grows as needed.',
        ),
      ],
    },
    {
      title: 'Read characters by position',
      explanation: [
        's[i] is the character at position i, counting from 0, so the last character is s[s.size() - 1]. Copying a string copies its characters, so the copy can change independently.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\n#include <string>\nint main() {\n  std::string name = "Ada";\n  std::cout << name[0] << name[name.size() - 1] << "\\n";\n}',
        output: 'Aa',
        explanation: 'Position 0 is A and the last position, 2, is a.',
      },
      questions: [
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <string>\nint main() {\n  std::string s = "stack";\n  std::cout << s[1] << s[4] << "\\n";\n}',
          'tk',
          'Position 1 is t and position 4 is k.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\n#include <string>\nint main() {\n  std::string s = "abc";\n  std::string t = s;\n  t[0] = s[2];\n  std::cout << s << " " << t << "\\n";\n}',
          'abc cbc',
          't is a separate copy; only its first character becomes c.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\n#include <string>\nint main() {\n  std::string s = "hello";\n  std::cout << static_cast<int>(s.size()) * 2 << "\\n";\n}',
          '10',
          'size() is 5, converted to int and doubled.',
        ),
      ],
    },
    {
      title: 'Count embedded zero characters',
      explanation: [
        'A std::string stores its length, so it can hold \\0 characters. std::string("a\\0b", 3) has three characters. Building a string from a plain literal stops at the first \\0, because a literal is read up to its terminator.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\n#include <string>\nint main() {\n  std::string full("a\\0b", 3);\n  std::string cut = "a\\0b";\n  std::cout << full.size() << " " << cut.size() << "\\n";\n}',
        output: '3 1',
        explanation:
          'full was given the length 3; cut stopped at the embedded \\0.',
      },
      questions: [
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <string>\nint main() {\n  std::string s("x\\0\\0y", 4);\n  std::cout << s.size() << "\\n";\n}',
          '4',
          'The string was built with an explicit length of 4.',
        ),
        choose(
          'Why does std::string cut = "a\\0b"; hold only one character?',
          [
            'std::string cannot store \\0',
            'The compiler removes \\0 from literals',
            'Construction stops at the first \\0',
            'size() skips \\0 characters',
          ],
          2,
          'Without a length, the literal is read only up to its first null character.',
        ),
        choose(
          'Which tells how many characters a std::string really holds, including any \\0?',
          [
            'The position of the first \\0',
            's.size()',
            'strlen(s.c_str())',
            'sizeof(s)',
          ],
          1,
          'The stored length counts every character; strlen stops at \\0, and sizeof measures the string object.',
        ),
      ],
    },
  ],
  'cpp-string-append': [
    {
      title: 'Append one character with push_back',
      explanation: [
        "s.push_back('c') adds one character to the end of s, so size() grows by one.",
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\n#include <string>\nint main() {\n  std::string word = "ab";\n  word.push_back(\'c\');\n  std::cout << word << " " << word.size() << "\\n";\n}',
        output: 'abc 3',
        explanation: 'c is added after b, and the size grows from 2 to 3.',
      },
      questions: [
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <string>\nint main() {\n  std::string s = "go";\n  s.push_back(\'!\');\n  s.push_back(\'!\');\n  std::cout << s << "\\n";\n}',
          'go!!',
          'Each push_back adds one ! at the end.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\n#include <string>\nint main() {\n  std::string s;\n  s.push_back(\'x\');\n  std::cout << s.size() << s << "\\n";\n}',
          '1x',
          'An empty string gains one character.',
        ),
        choose(
          "What does s.push_back('z') change?",
          [
            'It replaces the last character with z',
            'It adds z at the front',
            'It adds z at the end and size() grows by 1',
            'It adds the text "z" twice',
          ],
          2,
          'push_back always appends exactly one character.',
        ),
      ],
    },
    {
      title: 'Append text with +=',
      explanation: [
        's += "ing" appends several characters at once, and s += \'c\' appends one. Appending to a copy leaves the original unchanged.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\n#include <string>\nint main() {\n  std::string verb = "jump";\n  verb += "ing";\n  std::cout << verb << "\\n";\n}',
        output: 'jumping',
        explanation: 'ing is added after jump.',
      },
      questions: [
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <string>\nint main() {\n  std::string path = "dir";\n  path += \'/\';\n  path += "file";\n  std::cout << path << " " << path.size() << "\\n";\n}',
          'dir/file 8',
          'The slash and the four letters of file follow dir: 3 + 1 + 4 characters.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\n#include <string>\nint main() {\n  std::string a = "ab";\n  std::string b = a;\n  b += "cd";\n  std::cout << a << " " << b << "\\n";\n}',
          'ab abcd',
          'b is a copy, so appending to it leaves a as it was.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\n#include <string>\nint main() {\n  std::string s = "1";\n  s += s;\n  s += s;\n  std::cout << s << "\\n";\n}',
          '1111',
          'Each += doubles the string: 1, 11, 1111.',
        ),
      ],
    },
    {
      title: 'Re-read the string after appending',
      explanation: [
        'Appending may need more room than the string has, in which case it moves its characters to new, larger storage. Pointers or views saved earlier then refer to freed memory. Positions stay meaningful, so keep an index and read s[index] again.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\n#include <string>\nint main() {\n  std::string s = "abc";\n  int index = 1;\n  s += "defghijklmnopqrstuvwxyz";\n  std::cout << s[index] << s.size() << "\\n";\n}',
        output: 'b26',
        explanation:
          'Wherever the characters now live, position 1 still holds b.',
      },
      questions: [
        choose(
          'A program saves s.data() in a pointer and then appends many characters to s. Why is the saved pointer unsafe?',
          [
            'data() returns a copy of the text',
            'The append may move the characters elsewhere',
            'Appending clears the string first',
            'Pointers into strings are never allowed',
          ],
          1,
          'After a reallocation the pointer refers to storage that was freed.',
        ),
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <string>\nint main() {\n  std::string s = "xy";\n  int index = 0;\n  s += "0123456789012345678901234567890123456789";\n  std::cout << s[index] << s[index + 1] << "\\n";\n}',
          'xy',
          'The first two characters are still x and y after the append.',
        ),
        choose(
          'After appending to a string, what is the safe way to reach its second character?',
          [
            'Reuse a pointer saved before the append',
            'Reuse a string_view made before the append',
            'Read s[1] again',
            'Assume it moved to the end',
          ],
          2,
          'Indexing goes through the string itself, so it always finds the current storage.',
        ),
      ],
    },
  ],
  'cpp-string-find': [
    {
      title: 'Find a character or substring',
      explanation: [
        's.find(\'n\') returns the position of the first n in s, and s.find("na") the position where the first na begins. Positions count from 0.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\n#include <string>\nint main() {\n  std::string text = "banana";\n  std::cout << text.find(\'n\') << " " << text.find("na") << "\\n";\n}',
        output: '2 2',
        explanation: 'The first n, and the first na, both start at position 2.',
      },
      questions: [
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <string>\nint main() {\n  std::string s = "hello";\n  std::cout << s.find(\'l\') << "\\n";\n}',
          '2',
          'The first l is at position 2.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\n#include <string>\nint main() {\n  std::string s = "a,b,c";\n  std::cout << s.find(\',\') << " " << s.find("b,c") << "\\n";\n}',
          '1 2',
          'The first comma is at 1, and b,c starts at 2.',
        ),
        choose(
          'A character occurs several times in a string. Which position does find return?',
          ['The last one', 'The first one', 'All of them', 'The middle one'],
          1,
          'find searches from the start and stops at the first match.',
        ),
      ],
    },
    {
      title: 'Compare with npos when nothing is found',
      explanation: [
        'When there is no match, find returns the special value std::string::npos. It is not a valid position, so compare the result with npos before using it. Do not test the result as a bool: a match at position 0 would count as false.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\n#include <string>\nint main() {\n  std::string s = "abc";\n  auto pos = s.find(\'z\');\n  std::cout << (pos == std::string::npos) << "\\n";\n}',
        output: '1',
        explanation: 'There is no z, so find returns npos.',
      },
      questions: [
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <string>\nint main() {\n  std::string s = "abc";\n  auto pos = s.find(\'c\');\n  std::cout << (pos == std::string::npos) << pos << "\\n";\n}',
          '02',
          'c is found at position 2, so the result is not npos.',
        ),
        choose(
          'What does find return when there is no match?',
          ['0', '-1', 'The length of the string', 'std::string::npos'],
          3,
          'npos is the documented "not found" value.',
        ),
        choose(
          'Why is if (s.find(\'x\')) a wrong test for "s contains x"?',
          [
            'find already returns a bool',
            'find cannot be used in a condition',
            'It is correct as written',
            'Position 0 is false; npos is true',
          ],
          3,
          'The position converts to bool, which says nothing about whether a match exists.',
        ),
      ],
    },
    {
      title: 'Turn the result into an index or a sentinel',
      explanation: [
        "Convert a found position to int only after checking for npos, for example pos == std::string::npos ? -1 : static_cast<int>(pos). find also takes a starting position: s.find('l', 1) searches from position 1.",
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\n#include <string>\nint main() {\n  std::string s = "hello";\n  auto pos = s.find(\'e\');\n  int index = pos == std::string::npos ? -1 : static_cast<int>(pos);\n  std::cout << index << "\\n";\n}',
        output: '1',
        explanation: 'e is found at position 1, so the index is 1.',
      },
      questions: [
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <string>\nint main() {\n  std::string s = "hello";\n  auto pos = s.find(\'q\');\n  int index = pos == std::string::npos ? -1 : static_cast<int>(pos);\n  std::cout << index << "\\n";\n}',
          '-1',
          'There is no q, so the sentinel -1 is chosen.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\n#include <string>\nint main() {\n  std::string s = "level";\n  auto first = s.find(\'l\');\n  auto second = s.find(\'l\', first + 1);\n  std::cout << first << " " << second << "\\n";\n}',
          '0 4',
          'The second search starts after the first l and finds the last one at 4.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\n#include <string>\nint main() {\n  std::string s = "";\n  auto pos = s.find(\'a\');\n  std::cout << (pos == std::string::npos ? -1 : static_cast<int>(pos)) << "\\n";\n}',
          '-1',
          'An empty string contains nothing, so find returns npos.',
        ),
      ],
    },
  ],
  'cpp-strings': [
    {
      title: 'Parse digits with std::from_chars',
      explanation: [
        'std::from_chars(first, last, value) from <charconv> reads an integer from the characters in [first, last) into value, without allocating. It returns a result with ec, an error code that equals std::errc{} on success, and ptr, which points to the first character it did not use.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\n#include <charconv>\n#include <string_view>\n#include <system_error>\nint main() {\n  std::string_view text = "42";\n  int value = 0;\n  auto result = std::from_chars(text.data(), text.data() + text.size(), value);\n  std::cout << value << " " << (result.ec == std::errc{}) << "\\n";\n}',
        output: '42 1',
        explanation:
          'The two digits parse to 42, and the error code reports success.',
      },
      questions: [
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <charconv>\n#include <string_view>\n#include <system_error>\nint main() {\n  std::string_view text = "-17";\n  int value = 0;\n  auto result = std::from_chars(text.data(), text.data() + text.size(), value);\n  std::cout << value << " " << (result.ec == std::errc{}) << "\\n";\n}',
          '-17 1',
          'A leading minus sign is accepted, and parsing succeeds.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\n#include <charconv>\n#include <string_view>\n#include <system_error>\nint main() {\n  std::string_view text = "abc";\n  int value = 0;\n  auto result = std::from_chars(text.data(), text.data() + text.size(), value);\n  std::cout << value << " " << (result.ec == std::errc{}) << "\\n";\n}',
          '0 0',
          'No digits are found, so ec reports an error and value keeps its 0.',
        ),
        choose(
          'How does std::from_chars report a failure?',
          [
            'It throws a std::invalid_argument',
            'It sets value to -1 as a marker',
            'It sets result.ec and leaves value unchanged',
            'It prints an error message to std::cerr',
          ],
          2,
          'from_chars never throws; the result object carries the outcome.',
        ),
      ],
    },
    {
      title: 'Check that the whole input was used',
      explanation: [
        'from_chars succeeds as soon as it reads at least one digit, and it stops at the first character that does not belong to the number. Compare result.ptr with the end of the input to know whether anything was left over.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\n#include <charconv>\n#include <string_view>\nint main() {\n  std::string_view text = "12x";\n  int value = 0;\n  auto result = std::from_chars(text.data(), text.data() + text.size(), value);\n  std::cout << value << " " << (result.ptr == text.data() + text.size()) << "\\n";\n}',
        output: '12 0',
        explanation:
          'The prefix 12 parses, but ptr stops at x, before the end.',
      },
      questions: [
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <charconv>\n#include <string_view>\nint main() {\n  std::string_view text = "77";\n  int value = 0;\n  auto result = std::from_chars(text.data(), text.data() + text.size(), value);\n  std::cout << value << " " << (result.ptr == text.data() + text.size()) << "\\n";\n}',
          '77 1',
          'Both digits are used, so ptr reaches the end.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\n#include <charconv>\n#include <string_view>\nint main() {\n  std::string_view text = "3.5";\n  int value = 0;\n  auto result = std::from_chars(text.data(), text.data() + text.size(), value);\n  std::cout << value << " " << (result.ptr == text.data() + text.size()) << "\\n";\n}',
          '3 0',
          'Parsing an int stops at the dot, so value is 3 and input is left over.',
        ),
        choose(
          'Why check result.ptr as well as result.ec?',
          [
            'ec is always zero after parsing',
            'ptr holds the parsed value itself',
            'A prefix like 12x still parses',
            'It is never needed for integers',
          ],
          2,
          'Only ptr reveals trailing characters that were not part of the number.',
        ),
      ],
    },
    {
      title: 'Accept only a clean, complete number',
      explanation: [
        'A strict parser accepts the input only if ec reports success and ptr reached the end. Anything else, including empty input or a leading space, is rejected.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\n#include <charconv>\n#include <string_view>\n#include <system_error>\nint main() {\n  std::string_view text = "250";\n  int value = 0;\n  auto r = std::from_chars(text.data(), text.data() + text.size(), value);\n  if (r.ec != std::errc{} || r.ptr != text.data() + text.size()) std::cout << "invalid\\n";\n  else std::cout << value * 2 << "\\n";\n}',
        output: '500',
        explanation:
          'The whole input is a valid number, so it is accepted and doubled.',
      },
      questions: [
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <charconv>\n#include <string_view>\n#include <system_error>\nint main() {\n  std::string_view text = "";\n  int value = 0;\n  auto r = std::from_chars(text.data(), text.data() + text.size(), value);\n  if (r.ec != std::errc{} || r.ptr != text.data() + text.size()) std::cout << "invalid\\n";\n  else std::cout << value * 2 << "\\n";\n}',
          'invalid',
          'There are no digits at all, so ec reports an error.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\n#include <charconv>\n#include <string_view>\n#include <system_error>\nint main() {\n  std::string_view text = " 5";\n  int value = 0;\n  auto r = std::from_chars(text.data(), text.data() + text.size(), value);\n  if (r.ec != std::errc{} || r.ptr != text.data() + text.size()) std::cout << "invalid\\n";\n  else std::cout << value * 2 << "\\n";\n}',
          'invalid',
          'from_chars does not skip leading spaces, so it finds no number.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\n#include <charconv>\n#include <string_view>\n#include <system_error>\nint main() {\n  std::string_view text = "007";\n  int value = 0;\n  auto r = std::from_chars(text.data(), text.data() + text.size(), value);\n  if (r.ec != std::errc{} || r.ptr != text.data() + text.size()) std::cout << "invalid\\n";\n  else std::cout << value * 2 << "\\n";\n}',
          '14',
          'Leading zeros are ordinary digits, so 007 parses to 7.',
        ),
      ],
    },
  ],
  'cpp-vector-push': [
    {
      title: 'Append with push_back',
      explanation: [
        'v.push_back(x) adds x as a new last element, so size() grows by one. v.back() reads the last element.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\n#include <vector>\nint main() {\n  std::vector<int> v{1, 2};\n  v.push_back(4);\n  std::cout << v.size() << " " << v[2] << "\\n";\n}',
        output: '3 4',
        explanation: '4 becomes the third element, at index 2.',
      },
      questions: [
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <vector>\nint main() {\n  std::vector<int> v;\n  v.push_back(5);\n  v.push_back(6);\n  std::cout << v[0] << v[1] << v.size() << "\\n";\n}',
          '562',
          'Elements are appended in order: 5, then 6, for a size of 2.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\n#include <vector>\nint main() {\n  std::vector<int> v{9};\n  v.push_back(v[0] + 1);\n  std::cout << v.back() << "\\n";\n}',
          '10',
          'The new last element is 9 + 1.',
        ),
        choose(
          'What does push_back do to size()?',
          [
            'Leaves it unchanged',
            'Doubles it',
            'Increases it by one',
            'Sets it to capacity()',
          ],
          2,
          'Exactly one element is added.',
        ),
      ],
    },
    {
      title: 'Tell size from capacity',
      explanation: [
        'size() counts the elements; capacity() counts how many fit before the vector must find more memory, so capacity() >= size(). The exact capacity depends on the library. Only indices below size() hold elements.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\n#include <vector>\nint main() {\n  std::vector<int> v{1, 2, 3};\n  v.push_back(4);\n  std::cout << v.size() << " " << (v.capacity() >= v.size()) << "\\n";\n}',
        output: '4 1',
        explanation:
          'There are 4 elements, and the capacity is always at least that.',
      },
      questions: [
        choose(
          'A vector has size() 3 and capacity() 8. Which indices hold elements?',
          ['0 to 7', '1 to 3', '3 to 7', '0 to 2'],
          3,
          'Capacity is spare room; only the first size() positions hold elements.',
        ),
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <vector>\nint main() {\n  std::vector<int> v;\n  v.push_back(1);\n  v.push_back(2);\n  v.push_back(3);\n  std::cout << (v.capacity() >= 3) << v.size() << "\\n";\n}',
          '13',
          'The capacity covers the 3 elements; their count is 3.',
        ),
        choose(
          'Which value says how many elements a vector holds?',
          ['capacity()', 'sizeof(v)', 'size()', 'The last index'],
          2,
          'size() is the element count; the last index is one less.',
        ),
      ],
    },
    {
      title: 'Know that push_back stores a copy',
      explanation: [
        'push_back copies the value into the vector. Changing the original variable afterwards does not change the element, and the element does not change the variable.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\n#include <vector>\nint main() {\n  int x = 5;\n  std::vector<int> v;\n  v.push_back(x);\n  x = 9;\n  std::cout << v[0] << "\\n";\n}',
        output: '5',
        explanation: 'The vector stored its own copy of 5.',
      },
      questions: [
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <vector>\nint main() {\n  std::vector<int> v{1};\n  int last = v[0];\n  v.push_back(last * 10);\n  last = 0;\n  std::cout << v[1] << last << "\\n";\n}',
          '100',
          'The element 10 was copied in before last became 0.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\n#include <vector>\nint main() {\n  std::vector<int> a{1};\n  std::vector<int> b;\n  b.push_back(a[0]);\n  a[0] = 7;\n  std::cout << b[0] << "\\n";\n}',
          '1',
          'b received a copy of 1.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\n#include <vector>\nint main() {\n  std::vector<int> v;\n  v.push_back(3);\n  v.push_back(v[0]);\n  v[0] = 8;\n  std::cout << v[0] + v[1] << "\\n";\n}',
          '11',
          'v[1] copied 3 before v[0] became 8.',
        ),
      ],
    },
  ],
  'cpp-vector-reserve': [
    {
      title: 'Reserve room without adding elements',
      explanation: [
        'v.reserve(n) makes capacity() at least n, but it adds no elements: size() is unchanged. Reserving less than the current capacity does nothing.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\n#include <vector>\nint main() {\n  std::vector<int> v;\n  v.reserve(20);\n  std::cout << v.size() << " " << (v.capacity() >= 20) << "\\n";\n}',
        output: '0 1',
        explanation: 'There is room for 20, but still no elements.',
      },
      questions: [
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <vector>\nint main() {\n  std::vector<int> v{1, 2};\n  v.reserve(100);\n  std::cout << v.size() << v[1] << "\\n";\n}',
          '22',
          'reserve keeps the two elements and the size of 2.',
        ),
        choose(
          'What does v.reserve(5) change on an empty vector?',
          [
            'size() becomes 5, with zeros',
            'Five zeros are added at the end',
            'Nothing at all until the next push',
            'Only capacity(), to at least 5',
          ],
          3,
          'reserve affects room, not contents.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\n#include <vector>\nint main() {\n  std::vector<int> v{1, 2, 3};\n  v.reserve(1);\n  std::cout << v.size() << (v.capacity() >= 3) << "\\n";\n}',
          '31',
          'Reserving less than is already available changes nothing.',
        ),
      ],
    },
    {
      title: 'Write only to elements that exist',
      explanation: [
        'Reserved room holds no elements, so v[0] = 1 after reserve on an empty vector is undefined behavior. Add elements with push_back, or use resize(n), which makes size() equal n by adding zeros.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\n#include <vector>\nint main() {\n  std::vector<int> v;\n  v.reserve(4);\n  v.push_back(10);\n  v.push_back(20);\n  std::cout << v[1] << " " << v.size() << "\\n";\n}',
        output: '20 2',
        explanation:
          'The elements were added with push_back, so indices 0 and 1 are valid.',
      },
      questions: [
        choose(
          'std::vector<int> v; v.reserve(10); v[0] = 1; What is wrong?',
          [
            'Nothing; the room is reserved',
            'reserve must be called twice',
            'v has no elements yet, so v[0] is out of range',
            'v[0] must be read before it is written',
          ],
          2,
          'size() is still 0, so there is no element 0.',
        ),
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <vector>\nint main() {\n  std::vector<int> v;\n  v.reserve(2);\n  v.resize(2);\n  v[1] = 4;\n  std::cout << v[0] << v[1] << v.size() << "\\n";\n}',
          '042',
          'resize adds two zeros, and then the second one is replaced with 4.',
        ),
        choose(
          'Which call makes v[2] valid on an empty vector?',
          ['v.reserve(3)', 'v.capacity()', 'v.reserve(2)', 'v.resize(3)'],
          3,
          'Only resize creates elements.',
        ),
      ],
    },
    {
      title: 'Reserve when the count is known',
      explanation: [
        'While size() stays within the capacity, push_back does not need new memory. Reserving the expected count up front therefore avoids repeated reallocations, and capacity() does not change while the vector fills up.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\n#include <cstddef>\n#include <vector>\nint main() {\n  std::vector<int> v;\n  v.reserve(3);\n  std::size_t before = v.capacity();\n  v.push_back(1);\n  v.push_back(2);\n  v.push_back(3);\n  std::cout << (v.capacity() == before) << "\\n";\n}',
        output: '1',
        explanation:
          'Three elements fit in the reserved room, so no reallocation was needed.',
      },
      questions: [
        choose(
          'Why reserve before pushing back 1000 elements whose count is known?',
          [
            'It is required before push_back',
            'It avoids repeated reallocations',
            'It sets every element to zero',
            'It makes size() return 1000 immediately',
          ],
          1,
          'One allocation up front replaces several as the vector grows.',
        ),
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <cstddef>\n#include <vector>\nint main() {\n  std::vector<int> v;\n  v.reserve(2);\n  std::size_t cap = v.capacity();\n  v.push_back(5);\n  std::cout << (v.capacity() == cap) << v.size() << "\\n";\n}',
          '11',
          'One element fits in the reserved room, so the capacity is unchanged.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\n#include <vector>\nint main() {\n  std::vector<int> v;\n  v.reserve(4);\n  v.push_back(7);\n  v.push_back(8);\n  std::cout << v.size() << (v.capacity() >= 4) << "\\n";\n}',
          '21',
          'Two elements were added, and the reserved room is still at least 4.',
        ),
      ],
    },
  ],
  'cpp-iterator-range': [
    {
      title: 'Walk from begin() to end()',
      explanation: [
        'v.begin() is an iterator to the first element and v.end() an iterator one past the last. Like a pointer, *it reads the element and ++it moves to the next one, so a loop runs while it != v.end().',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\n#include <vector>\nint main() {\n  std::vector<int> v{4, 5, 6};\n  for (auto it = v.begin(); it != v.end(); ++it) std::cout << *it;\n  std::cout << "\\n";\n}',
        output: '456',
        explanation:
          'The iterator visits each element in order and stops when it reaches end().',
      },
      questions: [
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <vector>\nint main() {\n  std::vector<int> v{2, 4, 6};\n  int sum = 0;\n  for (auto it = v.begin(); it != v.end(); ++it) sum += *it;\n  std::cout << sum << "\\n";\n}',
          '12',
          'All three elements are added.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\n#include <vector>\nint main() {\n  std::vector<int> v{1, 2, 3};\n  auto it = v.begin();\n  ++it;\n  std::cout << *it << "\\n";\n}',
          '2',
          'One step from the first element reaches the second, 2.',
        ),
        choose(
          'What does v.end() refer to?',
          [
            'The last element',
            'The first element',
            'The position one past the last element',
            'The end of the reserved capacity',
          ],
          2,
          'end() is a sentinel that marks where the range stops.',
        ),
      ],
    },
    {
      title: 'Never dereference end()',
      explanation: [
        'end() does not refer to an element, so *v.end() is undefined behavior. The last element is at end() - 1, and an empty vector has begin() == end().',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\n#include <vector>\nint main() {\n  std::vector<int> empty;\n  std::cout << (empty.begin() == empty.end()) << "\\n";\n}',
        output: '1',
        explanation: 'With no elements, the range starts where it ends.',
      },
      questions: [
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <vector>\nint main() {\n  std::vector<int> v{8};\n  auto it = v.begin();\n  ++it;\n  std::cout << (it == v.end()) << "\\n";\n}',
          '1',
          'Moving past the only element reaches end().',
        ),
        choose(
          'Which expression reads the last element of a non-empty vector v?',
          ['*v.end()', '*v.begin()', 'v.end()[0]', '*(v.end() - 1)'],
          3,
          'end() is one past the last element, so one step back is the last one.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\n#include <vector>\nint main() {\n  std::vector<int> v;\n  int count = 0;\n  for (auto it = v.begin(); it != v.end(); ++it) ++count;\n  std::cout << count << "\\n";\n}',
          '0',
          'begin() already equals end(), so the loop body never runs.',
        ),
      ],
    },
    {
      title: 'Change elements through an iterator',
      explanation: [
        'For a non-const vector, *it is the element itself, so assigning to *it changes the vector. --it steps backward.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\n#include <vector>\nint main() {\n  std::vector<int> v{1, 2, 3};\n  for (auto it = v.begin(); it != v.end(); ++it) *it *= 10;\n  std::cout << v[0] << " " << v[2] << "\\n";\n}',
        output: '10 30',
        explanation: 'Each element is multiplied in place.',
      },
      questions: [
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <vector>\nint main() {\n  std::vector<int> v{5, 5};\n  auto it = v.begin();\n  *it = 0;\n  std::cout << v[0] << v[1] << "\\n";\n}',
          '05',
          'Only the first element is changed through the iterator.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\n#include <vector>\nint main() {\n  std::vector<int> v{3, 1, 2};\n  auto it = v.end();\n  --it;\n  *it += 7;\n  std::cout << v[2] << "\\n";\n}',
          '9',
          'One step back from end() is the last element, which becomes 9.',
        ),
        choose(
          'How is a vector iterator like a pointer into an array?',
          [
            'It stores a copy of the element',
            'It owns the element it refers to',
            '*it reads the element; ++it moves on',
            'It can only move backward, never forward',
          ],
          2,
          'Iterators generalize pointers to all standard containers.',
        ),
      ],
    },
  ],
  'cpp-vectors': [
    {
      title: 'Erase an element and close the gap',
      explanation: [
        'v.erase(v.begin() + i) removes the element at index i. The later elements shift down by one, and size() decreases by one.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\n#include <vector>\nint main() {\n  std::vector<int> v{3, 7, 9};\n  v.erase(v.begin() + 1);\n  std::cout << v.size() << " " << v[1] << "\\n";\n}',
        output: '2 9',
        explanation: '7 is removed, and 9 moves down to index 1.',
      },
      questions: [
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <vector>\nint main() {\n  std::vector<int> v{1, 2, 3, 4};\n  v.erase(v.begin());\n  for (int x : v) std::cout << x;\n  std::cout << "\\n";\n}',
          '234',
          'The first element is removed and the rest keep their order.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\n#include <vector>\nint main() {\n  std::vector<int> v{5, 6, 7};\n  v.erase(v.begin() + 2);\n  std::cout << v.size() << v[v.size() - 1] << "\\n";\n}',
          '26',
          'Removing the last element leaves 5, 6.',
        ),
        choose(
          'What happens to the elements after an erased one?',
          [
            'A hole is left at that index',
            'They are erased too',
            'They shift down to fill the gap',
            'They move to the front',
          ],
          2,
          'A vector stays contiguous, so later elements move down.',
        ),
      ],
    },
    {
      title: 'Check the position before erasing',
      explanation: [
        'erase needs an iterator to a real element; an out-of-range position is undefined behavior. Check the index against size() first. v.begin() + i needs a signed offset, so convert a std::size_t index with static_cast<std::ptrdiff_t>.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\n#include <cstddef>\n#include <vector>\nint main() {\n  std::vector<int> v{3, 7, 9};\n  std::size_t index = 5;\n  if (index >= v.size()) std::cout << "no such element\\n";\n  else v.erase(v.begin() + static_cast<std::ptrdiff_t>(index));\n}',
        output: 'no such element',
        explanation:
          'Index 5 is out of range, so the program reports it instead of erasing.',
      },
      questions: [
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <cstddef>\n#include <vector>\nint main() {\n  std::vector<int> v{3, 7, 9};\n  std::size_t index = 0;\n  if (index >= v.size()) std::cout << "no such element\\n";\n  else {\n    v.erase(v.begin() + static_cast<std::ptrdiff_t>(index));\n    int sum = 0;\n    for (int x : v) sum += x;\n    std::cout << sum << "\\n";\n  }\n}',
          '16',
          'The 3 is removed, and 7 + 9 is 16.',
        ),
        choose(
          'What does v.erase(v.begin() + 5) do when v has 3 elements?',
          [
            'Erases the last element instead',
            'Nothing; the call is ignored',
            'Throws an out-of-range exception',
            'Undefined behavior: no bounds check',
          ],
          3,
          'erase does not check its argument.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\n#include <cstddef>\n#include <vector>\nint main() {\n  std::vector<int> v;\n  std::size_t index = 0;\n  std::cout << (index >= v.size() ? "empty" : "ok") << "\\n";\n}',
          'empty',
          'An empty vector has no element at index 0.',
        ),
      ],
    },
    {
      title: 'Use the iterator that erase returns',
      explanation: [
        'Erasing invalidates iterators at and after the erased position. erase returns a valid iterator to the element that followed the erased one (or end()), so continue from that.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\n#include <vector>\nint main() {\n  std::vector<int> v{1, 2, 3, 4};\n  auto it = v.erase(v.begin() + 1);\n  std::cout << *it << " " << v.size() << "\\n";\n}',
        output: '3 3',
        explanation: 'After 2 is erased, the returned iterator points at 3.',
      },
      questions: [
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <vector>\nint main() {\n  std::vector<int> v{10, 20, 30};\n  auto it = v.erase(v.begin());\n  std::cout << *it << "\\n";\n}',
          '20',
          'The element after the erased 10 is 20.',
        ),
        choose(
          'An iterator pointed at v[2] when v[1] was erased. What is it now?',
          [
            'It still points at the same value',
            'Invalid; it must not be used',
            'It points one element later',
            'It points at v[1]',
          ],
          1,
          'Elements after the erased one moved, so iterators to them are invalidated.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\n#include <vector>\nint main() {\n  std::vector<int> v{4, 5, 6};\n  auto it = v.erase(v.begin() + 2);\n  std::cout << (it == v.end()) << v.size() << "\\n";\n}',
          '12',
          'Erasing the last element returns end().',
        ),
      ],
    },
  ],
  'cpp-iterator-distance': [
    {
      title: 'Count steps with std::distance',
      explanation: [
        'std::distance(first, last) from <iterator> returns how many ++ steps lead from first to last in the same range. From begin() to end() that is the number of elements.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\n#include <iterator>\n#include <vector>\nint main() {\n  std::vector<int> v{2, 3, 5, 7};\n  std::cout << std::distance(v.begin(), v.end()) << "\\n";\n}',
        output: '4',
        explanation:
          'Four steps lead from the first element to one past the last.',
      },
      questions: [
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <iterator>\n#include <vector>\nint main() {\n  std::vector<int> v{1, 2, 3, 4, 5};\n  auto it = v.begin() + 3;\n  std::cout << std::distance(v.begin(), it) << "\\n";\n}',
          '3',
          'it is three steps after begin().',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\n#include <iterator>\n#include <vector>\nint main() {\n  std::vector<int> v;\n  std::cout << std::distance(v.begin(), v.end()) << "\\n";\n}',
          '0',
          'An empty range has no steps.',
        ),
        choose(
          'What does std::distance(first, last) count?',
          [
            'The bytes between the two iterators',
            'The elements equal to *first',
            'The capacity of the container',
            'The ++ steps from first to last',
          ],
          3,
          'It counts positions, not bytes or values.',
        ),
      ],
    },
    {
      title: 'Turn an iterator into an index',
      explanation: [
        "The distance from begin() to an iterator is that element's index. For vector iterators, b - a gives the same number as std::distance(a, b). Both iterators must come from the same vector.",
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\n#include <iterator>\n#include <vector>\nint main() {\n  std::vector<int> v{4, 8, 15};\n  auto it = v.begin() + 2;\n  int index = static_cast<int>(std::distance(v.begin(), it));\n  std::cout << index << " " << v[index] << "\\n";\n}',
        output: '2 15',
        explanation:
          'The iterator is two steps from begin(), so it refers to index 2.',
      },
      questions: [
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <iterator>\n#include <vector>\nint main() {\n  std::vector<int> v{9, 8, 7};\n  auto it = v.end() - 1;\n  std::cout << std::distance(v.begin(), it) << "\\n";\n}',
          '2',
          'The last element of three is at index 2.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\n#include <iterator>\n#include <vector>\nint main() {\n  std::vector<int> v{1, 2, 3, 4};\n  auto a = v.begin() + 1;\n  auto b = v.begin() + 3;\n  std::cout << std::distance(a, b) << " " << b - a << "\\n";\n}',
          '2 2',
          'Both ways count the two steps from index 1 to index 3.',
        ),
        choose(
          'Why not subtract iterators that come from two different vectors?',
          [
            'Subtraction of iterators is never allowed',
            'The result is undefined',
            'It returns a distance in bytes',
            'It always returns 0',
          ],
          1,
          'A distance is meaningful only within one range.',
        ),
      ],
    },
    {
      title: 'Expect a signed result',
      explanation: [
        'For vector iterators, distance returns a signed integer, std::ptrdiff_t, so going backward gives a negative number. Convert it with static_cast<int> when an int index is needed.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\n#include <iterator>\n#include <vector>\nint main() {\n  std::vector<int> v{1, 2, 3};\n  std::cout << std::distance(v.end(), v.begin()) << "\\n";\n}',
        output: '-3',
        explanation: 'From end() back to begin() is three steps backward.',
      },
      questions: [
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <iterator>\n#include <vector>\nint main() {\n  std::vector<int> v{1, 2, 3, 4};\n  auto a = v.begin() + 2;\n  std::cout << std::distance(a, v.begin()) << "\\n";\n}',
          '-2',
          'Going from index 2 back to index 0 is two steps backward.',
        ),
        choose(
          'What type does std::distance return for vector iterators?',
          [
            'std::size_t, an unsigned type',
            'A signed integer type, std::ptrdiff_t',
            'bool, true when they differ',
            'Another iterator of the vector',
          ],
          1,
          'It must be able to represent backward distances.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\n#include <iterator>\n#include <vector>\nint main() {\n  std::vector<int> v{5, 6, 7, 8};\n  int middle = static_cast<int>(std::distance(v.begin(), v.end())) / 2;\n  std::cout << v[middle] << "\\n";\n}',
          '7',
          'There are 4 elements, so middle is 2, and v[2] is 7.',
        ),
      ],
    },
  ],
  'cpp-reallocation-invalidation': [
    {
      title: 'Know when a vector reallocates',
      explanation: [
        'When push_back finds size() equal to capacity(), the vector allocates a larger block, moves the elements there, and frees the old block. capacity() then grows. Within the existing capacity, no reallocation happens.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\n#include <cstddef>\n#include <vector>\nint main() {\n  std::vector<int> v{1};\n  std::size_t before = v.capacity();\n  for (std::size_t i = v.size(); i < before; ++i) v.push_back(0);\n  v.push_back(2);\n  std::cout << (v.capacity() > before) << "\\n";\n}',
        output: '1',
        explanation:
          'The loop fills the vector to capacity, so the final push_back must reallocate.',
      },
      questions: [
        choose(
          'When must push_back reallocate?',
          [
            'On every call',
            'When size() already equals capacity()',
            'Never; vectors grow in place',
            'When capacity() exceeds size()',
          ],
          1,
          'Only a full vector needs a larger block.',
        ),
        choose(
          'What happens to the old storage when a vector reallocates?',
          [
            'It is kept as a backup copy',
            'It is shared by the old and new block',
            'It is freed after the elements move',
            'Nothing happens to it',
          ],
          2,
          'That is why anything pointing into the old block becomes invalid.',
        ),
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <cstddef>\n#include <vector>\nint main() {\n  std::vector<int> v;\n  v.reserve(3);\n  std::size_t cap = v.capacity();\n  v.push_back(1);\n  v.push_back(2);\n  std::cout << (v.capacity() == cap) << "\\n";\n}',
          '1',
          'Two elements fit in the reserved room, so no reallocation occurs.',
        ),
      ],
    },
    {
      title: 'Keep an index across growth',
      explanation: [
        "A reallocation invalidates every pointer, reference, and iterator to the vector's elements. An index is just a position, so it still finds the same element after the vector grows.",
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\n#include <cstddef>\n#include <vector>\nint main() {\n  std::vector<int> v{7};\n  std::size_t index = 0;\n  for (int i = 0; i < 100; ++i) v.push_back(i);\n  std::cout << v[index] << "\\n";\n}',
        output: '7',
        explanation:
          'However often the vector moved, index 0 still holds the first element.',
      },
      questions: [
        choose(
          'What is wrong with this code?',
          [
            'first is a copy, so it never changes',
            'push_back cannot be called in a loop',
            'first may refer to freed storage',
            'Nothing; references follow the vector',
          ],
          2,
          'The reference was taken before the growth that moved the elements.',
          'std::vector<int> v{7};\nint& first = v[0];\nfor (int i = 0; i < 100; ++i) v.push_back(i);\nstd::cout << first;',
        ),
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <cstddef>\n#include <vector>\nint main() {\n  std::vector<int> v{3, 4};\n  std::size_t i = 1;\n  for (int k = 0; k < 50; ++k) v.push_back(k);\n  std::cout << v[i] << v.size() << "\\n";\n}',
          '452',
          'Index 1 still holds 4, and the vector now has 52 elements.',
        ),
        choose(
          'Which one still finds the same element after a reallocation?',
          [
            'A pointer to the element',
            'A reference to the element',
            'An iterator to the element',
            "The element's index",
          ],
          3,
          'Only the index does not depend on where the storage lives.',
        ),
      ],
    },
    {
      title: 'Reacquire after growth',
      explanation: [
        'Take pointers, references, and iterators after the vector has finished growing, or reserve enough capacity first so it does not reallocate. Within the reserved capacity, existing references stay valid.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\n#include <vector>\nint main() {\n  std::vector<int> v{5};\n  for (int i = 0; i < 20; ++i) v.push_back(i);\n  int& first = v[0];\n  first += 1;\n  std::cout << v[0] << "\\n";\n}',
        output: '6',
        explanation:
          'The reference is taken after the growth, so it refers to the current storage.',
      },
      questions: [
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <vector>\nint main() {\n  std::vector<int> v{1};\n  v.reserve(10);\n  int& r = v[0];\n  v.push_back(2);\n  r = 9;\n  std::cout << v[0] << "\\n";\n}',
          '9',
          'The reserve made room for the push_back, so no reallocation invalidated r.',
        ),
        choose(
          'A loop pushes elements and also needs the first element each time. What is safe?',
          [
            'Keep a pointer from before the loop',
            'Keep an iterator from before the loop',
            'Keep a reference from before the loop',
            'Keep an index and read v[0] when needed',
          ],
          3,
          'Pointers, references, and iterators may be invalidated by any push that reallocates.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\n#include <vector>\nint main() {\n  std::vector<int> v{2, 4};\n  for (int i = 0; i < 30; ++i) v.push_back(i);\n  auto it = v.begin() + 1;\n  std::cout << *it << "\\n";\n}',
          '4',
          'The iterator is created after the growth and points at index 1.',
        ),
      ],
    },
  ],
  'cpp-iterators': [
    {
      title: 'Erase while iterating with the returned iterator',
      explanation: [
        'To remove some elements in one pass, assign it = v.erase(it) when erasing and ++it only when keeping the element. The returned iterator already points at the next element, so incrementing it too would skip one.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\n#include <vector>\nint main() {\n  std::vector<int> v{1, -2, -3, 4};\n  for (auto it = v.begin(); it != v.end();) {\n    if (*it < 0) it = v.erase(it);\n    else ++it;\n  }\n  std::cout << v.size() << "\\n";\n}',
        output: '2',
        explanation:
          'Both negative values are removed, including the second of two in a row.',
      },
      questions: [
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <vector>\nint main() {\n  std::vector<int> v{-1, -1, 5};\n  for (auto it = v.begin(); it != v.end();) {\n    if (*it < 0) it = v.erase(it);\n    else ++it;\n  }\n  std::cout << v.size() << "\\n";\n}',
          '1',
          'Both negatives are removed, leaving only 5.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\n#include <vector>\nint main() {\n  std::vector<int> v{3, 0, 0, 7};\n  for (auto it = v.begin(); it != v.end();) {\n    if (*it == 0) it = v.erase(it);\n    else ++it;\n  }\n  for (int x : v) std::cout << x;\n  std::cout << "\\n";\n}',
          '37',
          'Both zeros are erased and 3, 7 remain.',
        ),
        choose(
          'Why does this loop increment it only in the else branch?',
          [
            '++it is never allowed after an erase',
            'To skip every other element on purpose',
            'erase already returns the next element',
            'It makes the loop run noticeably faster',
          ],
          2,
          'Incrementing after an erase would skip the element that moved into place.',
          'for (auto it = v.begin(); it != v.end();) {\n  if (*it < 0) {\n    it = v.erase(it);\n  } else {\n    ++it;\n  }\n}',
        ),
      ],
    },
    {
      title: 'Never use the erased iterator',
      explanation: [
        'After v.erase(it), the old it is invalid. Incrementing or reading it is undefined behavior, which is exactly what a plain for loop with ++it does if it erases without using the returned iterator.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\n#include <vector>\nint main() {\n  std::vector<int> v{2, 4, 5, 6};\n  int erased = 0;\n  for (auto it = v.begin(); it != v.end();) {\n    if (*it % 2 == 0) {\n      it = v.erase(it);\n      ++erased;\n    } else {\n      ++it;\n    }\n  }\n  std::cout << erased << " " << v.size() << "\\n";\n}',
        output: '3 1',
        explanation: 'Three even values are erased, and only 5 remains.',
      },
      questions: [
        choose(
          'What is wrong with this loop?',
          [
            'erase cannot take an iterator argument',
            'it is invalid after erase, yet the loop uses it',
            'Negative values cannot be erased',
            'Nothing; the loop is correct',
          ],
          1,
          'The erased iterator must be replaced by the one erase returns.',
          'for (auto it = v.begin(); it != v.end(); ++it)\n  if (*it < 0) v.erase(it);',
        ),
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <vector>\nint main() {\n  std::vector<int> v{1, 1, 1};\n  for (auto it = v.begin(); it != v.end();) {\n    if (*it == 1) it = v.erase(it);\n    else ++it;\n  }\n  std::cout << v.size() << (v.begin() == v.end()) << "\\n";\n}',
          '01',
          'Every element is erased, so the vector ends empty.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\n#include <vector>\nint main() {\n  std::vector<int> v{5, -5, 5, -5};\n  int seen = 0;\n  for (auto it = v.begin(); it != v.end();) {\n    ++seen;\n    if (*it < 0) it = v.erase(it);\n    else ++it;\n  }\n  std::cout << seen << v.size() << "\\n";\n}',
          '42',
          'Each original element is examined once, and the two negatives are erased.',
        ),
      ],
    },
    {
      title: 'Keep the remaining order',
      explanation: [
        'Erasing in this loop keeps the order of the elements that remain; nothing is reordered or sorted.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\n#include <vector>\nint main() {\n  std::vector<int> v{9, 1, 8, 2, 7};\n  for (auto it = v.begin(); it != v.end();) {\n    if (*it < 5) it = v.erase(it);\n    else ++it;\n  }\n  for (int x : v) std::cout << x;\n  std::cout << "\\n";\n}',
        output: '987',
        explanation:
          'The small values are removed, and 9, 8, 7 stay in their original order.',
      },
      questions: [
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <vector>\nint main() {\n  std::vector<int> v{4, 3, 2, 1};\n  for (auto it = v.begin(); it != v.end();) {\n    if (*it % 2 != 0) it = v.erase(it);\n    else ++it;\n  }\n  for (int x : v) std::cout << x;\n  std::cout << "\\n";\n}',
          '42',
          'The odd values are erased, and 4, 2 keep their order.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\n#include <vector>\nint main() {\n  std::vector<int> v{1, 2, 3};\n  for (auto it = v.begin(); it != v.end();) {\n    if (*it > 1) it = v.erase(it);\n    else ++it;\n  }\n  for (int x : v) std::cout << x;\n  std::cout << "\\n";\n}',
          '1',
          'Only 1 is kept.',
        ),
        choose(
          'Does erasing in this loop change the order of the elements that remain?',
          [
            'Yes, they end up sorted',
            'Yes, they end up reversed',
            'No, they keep their order',
            'Only the first one moves',
          ],
          2,
          'erase shifts later elements down without reordering them.',
          'for (auto it = v.begin(); it != v.end();) {\n  if (*it < 0) {\n    it = v.erase(it);\n  } else {\n    ++it;\n  }\n}',
        ),
      ],
    },
  ],
  'cpp-pair-members': [
    {
      title: 'Make a pair and read .first and .second',
      explanation: [
        'std::pair<int, int> from <utility> holds two values. They are data members, so they are read and written without parentheses: p.first and p.second.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\n#include <utility>\nint main() {\n  std::pair<int, int> point{3, 8};\n  std::cout << point.first << " " << point.second << "\\n";\n}',
        output: '3 8',
        explanation:
          'The first value given goes into first, the second into second.',
      },
      questions: [
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <utility>\nint main() {\n  std::pair<int, int> p{10, 4};\n  std::cout << p.first - p.second << "\\n";\n}',
          '6',
          'first is 10 and second is 4.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\n#include <utility>\nint main() {\n  std::pair<int, int> p{1, 2};\n  p.second = p.first + 5;\n  std::cout << p.first << p.second << "\\n";\n}',
          '16',
          'second is replaced with 1 + 5.',
        ),
        choose(
          'How do you read the second value of a pair p?',
          ['p.second()', 'p[1]', 'p.second', 'p.get(1)'],
          2,
          'first and second are data members, not functions.',
        ),
      ],
    },
    {
      title: 'Copy pairs and build them with make_pair',
      explanation: [
        'std::make_pair(4, 5) creates a pair from its arguments. Copying a pair copies both values, so the copy is independent.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\n#include <utility>\nint main() {\n  std::pair<int, int> a{2, 3};\n  std::pair<int, int> b = a;\n  b.first = 9;\n  std::cout << a.first << b.first << "\\n";\n}',
        output: '29',
        explanation: 'b is a copy, so changing it leaves a alone.',
      },
      questions: [
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <utility>\nint main() {\n  std::pair<int, int> a = std::make_pair(4, 5);\n  std::pair<int, int> b = a;\n  a.second = 0;\n  std::cout << b.second << a.second << "\\n";\n}',
          '50',
          'b copied 5 before a.second became 0.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\n#include <utility>\nint main() {\n  std::pair<int, int> p{7, 1};\n  std::pair<int, int> q{p.second, p.first};\n  std::cout << q.first << q.second << "\\n";\n}',
          '17',
          'q is built with the members of p in swapped order.',
        ),
        choose(
          'What does std::make_pair(4, 5) create?',
          [
            'An array holding the two ints',
            'The sum of its arguments, 9',
            'A std::pair<int, int> holding 4 and 5',
            'A reference to the first argument',
          ],
          2,
          'make_pair deduces the member types from its arguments.',
        ),
      ],
    },
    {
      title: 'Keep two related results together',
      explanation: [
        'A pair is a simple way to keep two results that belong together, such as a quotient and its remainder, as one value.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\n#include <utility>\nint main() {\n  int total = 17;\n  int divisor = 5;\n  std::pair<int, int> result{total / divisor, total % divisor};\n  std::cout << result.first << " " << result.second << "\\n";\n}',
        output: '3 2',
        explanation: '17 / 5 is 3, with 2 left over.',
      },
      questions: [
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <utility>\nint main() {\n  std::pair<int, int> result{23 / 4, 23 % 4};\n  std::cout << result.first << " " << result.second << "\\n";\n}',
          '5 3',
          '23 / 4 is 5, and 23 - 20 leaves 3.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\n#include <utility>\nint main() {\n  std::pair<int, int> r{-7 / 2, -7 % 2};\n  std::cout << r.first << " " << r.second << "\\n";\n}',
          '-3 -1',
          'The quotient truncates toward zero, and the remainder takes the sign of -7.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\n#include <utility>\nint main() {\n  int minutes = 135;\n  std::pair<int, int> hm{minutes / 60, minutes % 60};\n  std::cout << hm.first * 100 + hm.second << "\\n";\n}',
          '215',
          'The pair holds 2 hours and 15 minutes, combined as 215.',
        ),
      ],
    },
  ],
  'cpp-pair-ordering': [
    {
      title: 'Compare pairs by first, then by second',
      explanation: [
        'p < q compares the .first members first. Only when they are equal does it compare .second. This is lexicographic order, like sorting words letter by letter.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\n#include <utility>\nint main() {\n  std::pair<int, int> a{1, 9};\n  std::pair<int, int> b{2, 0};\n  std::cout << (a < b) << "\\n";\n}',
        output: '1',
        explanation: '1 < 2 decides it; the second members are never compared.',
      },
      questions: [
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <utility>\nint main() {\n  std::pair<int, int> a{2, 1};\n  std::pair<int, int> b{2, 5};\n  std::cout << (a < b) << (b < a) << "\\n";\n}',
          '10',
          'The firsts tie, so the seconds decide: 1 < 5.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\n#include <utility>\nint main() {\n  std::pair<int, int> a{3, 0};\n  std::pair<int, int> b{2, 9};\n  std::cout << (a < b) << "\\n";\n}',
          '0',
          '3 is not less than 2, so a is not less than b, whatever the seconds are.',
        ),
        choose(
          'When does .second affect the result of p < q?',
          [
            'Always',
            'Never',
            'Only when p.second is larger',
            'Only when p.first == q.first',
          ],
          3,
          'The second members break ties between equal firsts.',
        ),
      ],
    },
    {
      title: 'Require both members for equality',
      explanation: [
        'p == q is true only when both the firsts and the seconds are equal. The other comparisons, <=, >, and >=, follow the same lexicographic order.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\n#include <utility>\nint main() {\n  std::pair<int, int> a{4, 5};\n  std::pair<int, int> b{4, 6};\n  std::cout << (a == b) << (a != b) << "\\n";\n}',
        output: '01',
        explanation: 'The firsts match but the seconds differ.',
      },
      questions: [
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <utility>\nint main() {\n  std::pair<int, int> a{1, 1};\n  std::pair<int, int> b = a;\n  std::cout << (a == b) << (a < b) << "\\n";\n}',
          '10',
          'Equal pairs are not less than each other.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\n#include <utility>\nint main() {\n  std::pair<int, int> a{2, 7};\n  std::pair<int, int> b{2, 7};\n  std::cout << (a <= b) << (a > b) << "\\n";\n}',
          '10',
          'Equal pairs satisfy <= but not >.',
        ),
        choose(
          'Which two pairs are equal?',
          [
            '{1, 2} and {2, 1}',
            '{0, 5} and {5, 0}',
            '{3, 4} and {3, 4}',
            '{1, 1} and {1, 2}',
          ],
          2,
          'Both members must match, in the same positions.',
        ),
      ],
    },
    {
      title: 'Write the same comparison by hand',
      explanation: [
        'Pair ordering is the same as a.first < b.first || (a.first == b.first && a.second < b.second). Put the primary key in .first and the tie-breaker in .second, and pair comparison does the rest.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\n#include <utility>\nint main() {\n  std::pair<int, int> a{5, 2};\n  std::pair<int, int> b{5, 3};\n  bool manual = a.first < b.first || (a.first == b.first && a.second < b.second);\n  std::cout << manual << (a < b) << "\\n";\n}',
        output: '11',
        explanation: 'Both forms see equal firsts and compare the seconds.',
      },
      questions: [
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <utility>\nint main() {\n  std::pair<int, int> a{6, 0};\n  std::pair<int, int> b{5, 9};\n  bool manual = a.first < b.first || (a.first == b.first && a.second < b.second);\n  std::cout << manual << (a < b) << "\\n";\n}',
          '00',
          '6 is not less than 5 and not equal to it, so both forms say false.',
        ),
        choose(
          'Records are pairs of {price, arrival id}. Two records have the same price. Which one is less?',
          [
            'The one with the larger id',
            'The one with the smaller id',
            'Neither; ties stay unordered',
            'The one created first in the program',
          ],
          1,
          'With equal firsts, the seconds decide.',
        ),
        choose(
          'Which hand-written test matches a < b for pairs?',
          [
            'a.first < b.first && a.second < b.second',
            'a.first < b.first || (a.first == b.first && a.second > b.second)',
            'a.first < b.first || (a.first == b.first && a.second < b.second)',
            'a.first + a.second < b.first + b.second',
          ],
          2,
          'Only this test compares the seconds, with <, just when the firsts tie.',
        ),
      ],
    },
  ],
  'cpp-structured-bindings': [
    {
      title: 'Unpack a pair into named copies',
      explanation: [
        'auto [low, high] = range; declares two new variables initialized from range.first and range.second, matched by position. With plain auto they are copies.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\n#include <utility>\nint main() {\n  std::pair<int, int> range{3, 10};\n  auto [low, high] = range;\n  std::cout << high - low << "\\n";\n}',
        output: '7',
        explanation: 'low gets 3 and high gets 10.',
      },
      questions: [
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <utility>\nint main() {\n  std::pair<int, int> p{4, 9};\n  auto [a, b] = p;\n  std::cout << b << a << "\\n";\n}',
          '94',
          'a is 4 and b is 9; the program prints b first.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\n#include <utility>\nint main() {\n  std::pair<int, int> p{1, 2};\n  auto [x, y] = p;\n  x = 50;\n  std::cout << p.first << " " << x << "\\n";\n}',
          '1 50',
          'x is a copy, so assigning to it leaves p.first at 1.',
        ),
        choose(
          'In auto [a, b] = p;, how are a and b matched to the members of p?',
          [
            'By the names a and b themselves',
            'Alphabetically by the chosen names',
            'By position: a gets first and b gets second',
            'In an unspecified order',
          ],
          2,
          'The names are chosen freely; only their order matters.',
        ),
      ],
    },
    {
      title: 'Bind by reference with auto&',
      explanation: [
        "auto& [a, b] = p; makes a and b refer to p's members, so assigning to them changes p.",
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\n#include <utility>\nint main() {\n  std::pair<int, int> p{1, 2};\n  auto& [first, second] = p;\n  first = 10;\n  std::cout << p.first << "\\n";\n}',
        output: '10',
        explanation:
          'first refers to p.first, so the assignment changes the pair.',
      },
      questions: [
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <utility>\nint main() {\n  std::pair<int, int> p{3, 4};\n  auto& [a, b] = p;\n  b += a;\n  std::cout << p.second << "\\n";\n}',
          '7',
          'b refers to p.second, which becomes 4 + 3.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\n#include <utility>\nint main() {\n  std::pair<int, int> p{3, 4};\n  auto [a, b] = p;\n  auto& [c, d] = p;\n  a = 0;\n  d = 0;\n  std::cout << p.first << p.second << "\\n";\n}',
          '30',
          'a is a copy, so p.first stays 3; d refers to p.second, which becomes 0.',
        ),
        choose(
          "You want to change a pair's members through the unpacked names. Which form do you need?",
          [
            'auto [a, b] = p;',
            'auto [a, b] = &p;',
            'auto (a, b) = p;',
            'auto& [a, b] = p;',
          ],
          3,
          "Only the reference form binds the names to the pair's own members.",
        ),
      ],
    },
    {
      title: 'Unpack each element in a range-based for loop',
      explanation: [
        'Structured bindings work in a range-based for loop over pairs: for (auto [id, value] : items) copies each pair, and for (auto& [id, value] : items) refers to it, so updates reach the container. const auto& reads without copying.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\n#include <array>\n#include <utility>\nint main() {\n  std::array<std::pair<int, int>, 3> orders{{{100, 2}, {101, 5}, {99, 1}}};\n  int total = 0;\n  for (const auto& [price, qty] : orders) total += price * qty;\n  std::cout << total << "\\n";\n}',
        output: '804',
        explanation: '100 * 2 + 101 * 5 + 99 * 1 is 200 + 505 + 99.',
      },
      questions: [
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <array>\n#include <utility>\nint main() {\n  std::array<std::pair<int, int>, 2> items{{{1, 10}, {2, 20}}};\n  int sum = 0;\n  for (auto [id, value] : items) sum += value;\n  std::cout << sum << "\\n";\n}',
          '30',
          'Only the second members, 10 and 20, are added.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\n#include <array>\n#include <utility>\nint main() {\n  std::array<std::pair<int, int>, 2> items{{{1, 10}, {2, 20}}};\n  for (auto& [id, value] : items) value += id;\n  std::cout << items[1].second << "\\n";\n}',
          '22',
          'The reference bindings update each pair: 20 + 2 is 22.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\n#include <array>\n#include <utility>\nint main() {\n  std::array<std::pair<int, int>, 2> items{{{1, 10}, {2, 20}}};\n  for (auto [id, value] : items) value = 0;\n  std::cout << items[0].second << "\\n";\n}',
          '10',
          'Plain auto copies each pair, so the array keeps its values.',
        ),
      ],
    },
  ],
  'cpp-pairs': [
    {
      title: 'Return two results as a pair',
      explanation: [
        'A function can return std::pair<int, int> to hand back two results at once. return {low, high}; builds the pair with low as first and high as second.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\n#include <array>\n#include <utility>\nstd::pair<int, int> min_max(std::array<int, 4> values) {\n  int low = values[0];\n  int high = values[0];\n  for (int x : values) {\n    if (x < low) low = x;\n    if (x > high) high = x;\n  }\n  return {low, high};\n}\nint main() {\n  std::pair<int, int> result = min_max({3, 9, -2, 5});\n  std::cout << result.first << " " << result.second << "\\n";\n}',
        output: '-2 9',
        explanation:
          'One pass finds both extremes, and the pair carries both back.',
      },
      questions: [
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <array>\n#include <utility>\nstd::pair<int, int> min_max(std::array<int, 4> values) {\n  int low = values[0];\n  int high = values[0];\n  for (int x : values) {\n    if (x < low) low = x;\n    if (x > high) high = x;\n  }\n  return {low, high};\n}\nint main() {\n  std::pair<int, int> result = min_max({4, 4, 4, 4});\n  std::cout << result.first << " " << result.second << "\\n";\n}',
          '4 4',
          'Every value is 4, so it is both the smallest and the largest.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\n#include <array>\n#include <utility>\nstd::pair<int, int> min_max(std::array<int, 4> values) {\n  int low = values[0];\n  int high = values[0];\n  for (int x : values) {\n    if (x < low) low = x;\n    if (x > high) high = x;\n  }\n  return {low, high};\n}\nint main() {\n  std::pair<int, int> result = min_max({0, -1, 7, 2});\n  std::cout << result.second - result.first << "\\n";\n}',
          '8',
          'The range runs from -1 to 7, a spread of 8.',
        ),
        choose(
          'What does return {low, high}; do in a function that returns std::pair<int, int>?',
          [
            'Returns low only',
            'Returns an array of two ints',
            'Returns the pair (low, high)',
            'Does not compile without make_pair',
          ],
          2,
          'The braces initialize the returned pair in member order.',
        ),
      ],
    },
    {
      title: 'Unpack the result in the same order',
      explanation: [
        'The caller can name both results at once with auto [q, r] = f();. The names are matched by position, so they must follow the order the function used to build the pair.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\n#include <utility>\nstd::pair<int, int> div_mod(int a, int b) {\n  return {a / b, a % b};\n}\nint main() {\n  auto [q, r] = div_mod(17, 5);\n  std::cout << q << " " << r << "\\n";\n}',
        output: '3 2',
        explanation: 'q receives the quotient and r the remainder.',
      },
      questions: [
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <utility>\nstd::pair<int, int> div_mod(int a, int b) {\n  return {a / b, a % b};\n}\nint main() {\n  auto [r, q] = div_mod(17, 5);\n  std::cout << q << "\\n";\n}',
          '2',
          'The names are swapped: q is bound to second, which holds the remainder 2.',
        ),
        choose(
          'A function returns {count, total}. The caller writes auto [total, count] = f();. What goes wrong?',
          [
            'It does not compile',
            'The names are swapped: total holds the count',
            'Bindings match by name, so it works',
            'Both names receive the total',
          ],
          1,
          'Structured bindings follow positions, not names.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\n#include <utility>\nstd::pair<int, int> div_mod(int a, int b) {\n  return {a / b, a % b};\n}\nint main() {\n  auto [q, r] = div_mod(29, 6);\n  std::cout << q * 6 + r << "\\n";\n}',
          '29',
          'Quotient times divisor plus remainder rebuilds the original 29.',
        ),
      ],
    },
    {
      title: 'Compare returned pairs',
      explanation: [
        'A returned pair can be compared directly with == or <, using the lexicographic rules: first members first, second members to break ties.',
      ],
      example: {
        language: 'cpp',
        code: '#include <iostream>\n#include <utility>\nstd::pair<int, int> div_mod(int a, int b) {\n  return {a / b, a % b};\n}\nint main() {\n  std::cout << (div_mod(10, 3) == std::pair<int, int>(3, 1)) << "\\n";\n}',
        output: '1',
        explanation: '10 / 3 is 3 with remainder 1, so both members match.',
      },
      questions: [
        typeOutput(
          'What does this complete C++20 program print?',
          '#include <iostream>\n#include <utility>\nstd::pair<int, int> div_mod(int a, int b) {\n  return {a / b, a % b};\n}\nint main() {\n  std::cout << (div_mod(9, 3) == std::pair<int, int>(3, 1)) << "\\n";\n}',
          '0',
          '9 / 3 leaves remainder 0, so the seconds differ.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\n#include <utility>\nstd::pair<int, int> div_mod(int a, int b) {\n  return {a / b, a % b};\n}\nint main() {\n  std::cout << (div_mod(7, 2) < div_mod(8, 2)) << "\\n";\n}',
          '1',
          '{3, 1} is less than {4, 0} because 3 < 4.',
        ),
        typeOutput(
          'What does this program print?',
          '#include <iostream>\n#include <utility>\nstd::pair<int, int> div_mod(int a, int b) {\n  return {a / b, a % b};\n}\nint main() {\n  std::pair<int, int> a = div_mod(11, 4);\n  std::pair<int, int> b = div_mod(10, 4);\n  std::cout << (a > b) << (a.first == b.first) << "\\n";\n}',
          '11',
          'Both quotients are 2, so the remainders 3 and 2 decide.',
        ),
      ],
    },
  ],
  'cpp-abs-value': [
    {
      title: 'std::abs gives the magnitude of a number',
      explanation: [
        'std::abs(x) returns x without its sign: std::abs(-7) and std::abs(7) are both 7, and std::abs(0) is 0. The int and long long versions come from <cstdlib>; for a double include <cmath>, and the result is a double: std::abs(-2.5) is 2.5.',
      ],
      example: {
        language: 'cpp',
        code: `#include <cmath>
#include <cstdlib>
#include <iostream>
int main() {
  std::cout << std::abs(-7) << " " << std::abs(7) << " " << std::abs(-2.5) << "\\n";
}`,
        output: '7 7 2.5',
        explanation:
          'Both 7 and -7 have magnitude 7. The double overload keeps the fraction, giving 2.5.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          `#include <cstdlib>
#include <iostream>
int main() {
  std::cout << std::abs(-12) + std::abs(5) << "\\n";
}`,
          '17',
          'The magnitudes are 12 and 5, and their sum is 17.',
        ),
        typeOutput(
          'What does this program print?',
          `#include <cmath>
#include <iostream>
int main() {
  std::cout << std::abs(-0.75) * 4 << "\\n";
}`,
          '3',
          'std::abs(-0.75) is the double 0.75, and 0.75 * 4 is 3.',
        ),
        typeOutput(
          'What does this program print?',
          `#include <cstdlib>
#include <iostream>
int main() {
  int a = -3;
  int b = -8;
  std::cout << std::abs(a) - std::abs(b) << "\\n";
}`,
          '-5',
          'The magnitudes are 3 and 8, and 3 - 8 is -5: std::abs applies only to its own argument.',
        ),
        choose(
          'Which expression is never negative for ints a and b whose difference fits in an int?',
          ['a - b', 'std::abs(a) - std::abs(b)', 'std::abs(a - b)', '-(a - b)'],
          2,
          'Only the magnitude of the difference is guaranteed to be at least 0; the other expressions are negative for some inputs.',
        ),
      ],
    },
    {
      title: 'Measure the distance between two values',
      explanation: [
        'The distance between a and b on the number line is std::abs(a - b), and it does not depend on the order: std::abs(3 - 10) and std::abs(10 - 3) are both 7. Two doubles count as close when std::abs(x - y) <= tolerance.',
        'Subtract first, then take the magnitude. std::abs(a) - std::abs(b) compares sizes, not positions: for -4 and 4 it gives 0, although the values are 8 apart. One limit: the most negative int has no positive partner in int, so keep differences well inside the type’s range.',
      ],
      example: {
        language: 'cpp',
        code: `#include <cmath>
#include <cstdlib>
#include <iostream>
int main() {
  std::cout << std::abs(3 - 10) << " " << std::abs(10 - 3) << " " << std::abs(-4 - 4) << "\\n";
  double x = 0.1 + 0.2;
  std::cout << (std::abs(x - 0.3) <= 1e-9) << "\\n";
}`,
        output: '7 7 8\n1',
        explanation:
          'Both orders give the distance 7, and -4 and 4 are 8 apart. 0.1 + 0.2 is not exactly 0.3 as a double, but it is within the tolerance.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          `#include <cstdlib>
#include <iostream>
int main() {
  int low = -6;
  int high = 9;
  std::cout << std::abs(low - high) << " " << std::abs(high - low) << "\\n";
}`,
          '15 15',
          '-6 and 9 are 15 apart, and the distance is the same in either order.',
        ),
        typeOutput(
          'What does this program print?',
          `#include <cstdlib>
#include <iostream>
int main() {
  std::cout << std::abs(-4) - std::abs(4) << " " << std::abs(-4 - 4) << "\\n";
}`,
          '0 8',
          'The magnitudes are equal, so their difference is 0, but the values themselves are 8 apart.',
        ),
        typeOutput(
          'What does this program print?',
          `#include <cmath>
#include <iostream>
int main() {
  double measured = 2.004;
  double expected = 2.0;
  std::cout << (std::abs(measured - expected) <= 0.01) << (std::abs(expected - measured) <= 0.001) << "\\n";
}`,
          '10',
          'The values are 0.004 apart in either order: within 0.01, but not within 0.001.',
        ),
        choose(
          'A test checks measured - expected <= tolerance without std::abs. Which result does it wrongly accept?',
          [
            'A measured value far below expected',
            'A measured value exactly equal to expected',
            'A measured value slightly above expected but within tolerance',
            'A measured value far above expected',
          ],
          0,
          'A large negative difference is still less than the tolerance, so values that are far too small pass.',
        ),
      ],
    },
  ],
  'cpp-to-string': [
    {
      title: 'std::to_string writes a number’s digits',
      explanation: [
        'std::to_string(n), from <string>, returns a std::string holding the decimal digits of n, with a leading minus sign when n is negative: std::to_string(42) is "42" and std::to_string(-7) is "-7". The result is ordinary text, so size() counts its characters and += appends it to another string.',
      ],
      example: {
        language: 'cpp',
        code: `#include <iostream>
#include <string>
int main() {
  std::string digits = std::to_string(-305);
  std::cout << digits << " " << digits.size() << "\\n";
}`,
        output: '-305 4',
        explanation:
          'The text holds the minus sign and three digits, so its size is 4.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          `#include <iostream>
#include <string>
int main() {
  std::string s = std::to_string(1000);
  std::cout << s.size() << "\\n";
}`,
          '4',
          '"1000" has four characters.',
        ),
        typeOutput(
          'What does this program print?',
          `#include <iostream>
#include <string>
int main() {
  std::string id = "order-";
  id += std::to_string(17);
  std::cout << id << "\\n";
}`,
          'order-17',
          'std::to_string(17) is the text "17", and += appends it after "order-".',
        ),
        typeOutput(
          'What does this program print?',
          `#include <iostream>
#include <string>
int main() {
  std::string s = std::to_string(-42);
  std::cout << s[0] << s.size() << "\\n";
}`,
          '-3',
          'The first character is the minus sign, and "-42" has three characters.',
        ),
        choose(
          'Which expression produces the text "250"?',
          [
            'std::string(250)',
            'std::to_string(250)',
            'std::to_string("250")',
            'std::string("2") + 50',
          ],
          1,
          'std::to_string takes a number and returns its digits as a std::string.',
        ),
      ],
    },
    {
      title: 'Convert before appending a number to text',
      explanation: [
        'std::string has no += that writes a number’s digits. text += 65 compiles, but it converts 65 to a char and appends the single character whose code is 65, the letter A. Convert first: text += std::to_string(65) appends the two characters 6 and 5.',
        'For a double, std::to_string always writes six digits after the decimal point: std::to_string(2.5) is "2.500000". It is most useful for integers, whose text is exact and compact.',
      ],
      example: {
        language: 'cpp',
        code: `#include <iostream>
#include <string>
int main() {
  std::string wrong = "id=";
  wrong += 65;
  std::string right = "id=";
  right += std::to_string(65);
  std::cout << wrong << " " << right << "\\n";
}`,
        output: 'id=A id=65',
        explanation:
          'Appending the int 65 adds the character with code 65, A. Converting it first appends the digits 6 and 5.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          `#include <iostream>
#include <string>
int main() {
  std::string s = "v";
  s += 66;
  s += std::to_string(66);
  std::cout << s << "\\n";
}`,
          'vB66',
          'The first += appends the character with code 66, B; the second appends the digits 66.',
        ),
        predictOutput(
          'What does this program print?',
          `#include <iostream>
#include <string>
int main() {
  std::cout << std::to_string(2.5) << "\\n";
}`,
          ['2.5', '2.50000', '2.50', '2.500000'],
          3,
          'std::to_string writes a double with six digits after the decimal point.',
        ),
        typeOutput(
          'What does this program print?',
          `#include <iostream>
#include <string>
int main() {
  std::string line = std::to_string(10);
  line += std::to_string(20);
  line += std::to_string(-3);
  std::cout << line << " " << line.size() << "\\n";
}`,
          '1020-3 6',
          'The pieces are joined without spaces: "10", "20", and "-3" make six characters.',
        ),
        choose(
          'A log line built with text += count shows a strange symbol instead of the count 7. Why?',
          [
            'count was negative, so its digits were hidden',
            'std::string cannot store digit characters',
            '+= appended the char with code 7',
            '+= appended the address of count',
          ],
          2,
          'An int appended with += becomes one char. std::to_string(count) gives the digit text.',
        ),
      ],
    },
  ],
  'cpp-reverse-range': [
    {
      title: 'std::reverse flips a range in place',
      explanation: [
        'std::reverse(first, last), from <algorithm>, reverses the elements between two iterators. It works in place: it swaps the first and last elements, then the next pair inward, and returns nothing. std::reverse(v.begin(), v.end()) reverses a whole vector.',
        'The original order is overwritten, so copy the vector first when you still need it: std::vector<int> original = values; and then reverse values.',
      ],
      example: {
        language: 'cpp',
        code: `#include <algorithm>
#include <iostream>
#include <vector>
int main() {
  std::vector<int> values{1, 2, 3, 4};
  std::vector<int> original = values;
  std::reverse(values.begin(), values.end());
  std::cout << values[0] << values[1] << values[2] << values[3] << " " << original[0] << "\\n";
}`,
        output: '4321 1',
        explanation:
          'values is reversed in place. The copy made before the call still starts with 1.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          `#include <algorithm>
#include <iostream>
#include <vector>
int main() {
  std::vector<int> v{7, 8, 9};
  std::reverse(v.begin(), v.end());
  std::cout << v[0] << v[1] << v[2] << "\\n";
}`,
          '987',
          'The first and last elements swap, and the middle one stays put.',
        ),
        typeOutput(
          'What does this program print?',
          `#include <algorithm>
#include <iostream>
#include <vector>
int main() {
  std::vector<int> v{1, 2, 3};
  std::vector<int> keep = v;
  std::reverse(v.begin(), v.end());
  std::cout << v[0] << " " << keep[0] << "\\n";
}`,
          '3 1',
          'Only v is reversed; keep is an independent copy made before the call.',
        ),
        choose(
          'What does std::reverse(v.begin(), v.end()) return?',
          [
            'Nothing; it reorders v itself',
            'A reversed copy of v',
            'An iterator to the new first element',
            'The number of swaps it made',
          ],
          0,
          'std::reverse returns void and changes the range it is given.',
        ),
        typeOutput(
          'What does this program print?',
          `#include <algorithm>
#include <iostream>
#include <vector>
int main() {
  std::vector<int> v{5, 6, 7, 8, 9};
  std::reverse(v.begin(), v.end());
  std::cout << v[2] << " " << v[4] << "\\n";
}`,
          '7 5',
          'The reversed vector is 9 8 7 6 5: the middle element stays at index 2, and 5 moves to the end.',
        ),
      ],
    },
    {
      title: 'Reverse only part of a range',
      explanation: [
        'The iterators choose what is reversed. std::reverse(v.begin(), v.begin() + 3) reverses only the first three elements, and std::reverse(v.begin() + 2, v.end()) reverses everything from index 2 on. The range is half-open, so the element at the second iterator is not moved.',
      ],
      example: {
        language: 'cpp',
        code: `#include <algorithm>
#include <iostream>
#include <vector>
int main() {
  std::vector<int> v{1, 2, 3, 4, 5};
  std::reverse(v.begin(), v.begin() + 3);
  std::cout << v[0] << v[1] << v[2] << v[3] << v[4] << "\\n";
}`,
        output: '32145',
        explanation:
          'Only indexes 0 to 2 are reversed; 4 and 5 stay where they were.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          `#include <algorithm>
#include <iostream>
#include <vector>
int main() {
  std::vector<int> v{1, 2, 3, 4, 5};
  std::reverse(v.begin() + 2, v.end());
  std::cout << v[0] << v[1] << v[2] << v[3] << v[4] << "\\n";
}`,
          '12543',
          'Indexes 2 to 4 hold 3, 4, 5 and become 5, 4, 3; the first two elements are untouched.',
        ),
        typeOutput(
          'What does this program print?',
          `#include <algorithm>
#include <iostream>
#include <vector>
int main() {
  std::vector<int> v{4, 5, 6};
  std::reverse(v.begin(), v.begin() + 1);
  std::cout << v[0] << v[1] << v[2] << "\\n";
}`,
          '456',
          'A one-element range reads the same reversed, so nothing moves.',
        ),
        typeOutput(
          'What does this program print?',
          `#include <algorithm>
#include <iostream>
#include <vector>
int main() {
  std::vector<int> v{2, 4, 6, 8};
  std::reverse(v.begin(), v.end());
  std::reverse(v.begin(), v.begin() + 2);
  std::cout << v[0] << v[1] << v[2] << v[3] << "\\n";
}`,
          '6842',
          'The first call gives 8 6 4 2; the second swaps the first two elements, giving 6 8 4 2.',
        ),
        choose(
          'v may have any size of at least 2. Which call reverses exactly its last two elements?',
          [
            'std::reverse(v.end() - 2, v.end())',
            'std::reverse(v.begin(), v.begin() + 2)',
            'std::reverse(v.end(), v.end() - 2)',
            'std::reverse(v.begin() + 2, v.end())',
          ],
          0,
          'v.end() - 2 is the second-to-last element and v.end() is one past the last, so the range holds the last two.',
        ),
      ],
    },
  ],
  'cpp-digit-palindrome': [
    {
      title: 'Reverse a number’s digits as text',
      explanation: [
        'std::to_string turns a number into its digit characters, and a std::string is a range of characters, so std::reverse(s.begin(), s.end()) reverses those digits in place. Reverse a copy when you also need the original text, and compare two strings with ==, which is true when they hold the same characters in the same order.',
      ],
      example: {
        language: 'cpp',
        code: `#include <algorithm>
#include <iostream>
#include <string>
int main() {
  std::string digits = std::to_string(1203);
  std::string reversed = digits;
  std::reverse(reversed.begin(), reversed.end());
  std::cout << digits << " " << reversed << " " << (digits == reversed) << "\\n";
}`,
        output: '1203 3021 0',
        explanation:
          'The copy is reversed while digits keeps the original order, and the two texts differ.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          `#include <algorithm>
#include <iostream>
#include <string>
int main() {
  std::string s = std::to_string(500);
  std::reverse(s.begin(), s.end());
  std::cout << s << "\\n";
}`,
          '005',
          'Reversing text keeps every character, including the zeros, which now come first.',
        ),
        typeOutput(
          'What does this program print?',
          `#include <algorithm>
#include <iostream>
#include <string>
int main() {
  std::string s = std::to_string(-45);
  std::reverse(s.begin(), s.end());
  std::cout << s << "\\n";
}`,
          '54-',
          'The minus sign is a character too, so it moves to the end.',
        ),
        typeOutput(
          'What does this program print?',
          `#include <algorithm>
#include <iostream>
#include <string>
int main() {
  std::string a = std::to_string(1221);
  std::string b = a;
  std::reverse(b.begin(), b.end());
  std::cout << (a == b) << "\\n";
}`,
          '1',
          '1221 reads the same backwards, so the reversed copy equals the original.',
        ),
      ],
    },
    {
      title: 'Remove the sign, then compare',
      explanation: [
        'A sign is not a digit: reversing "-121" gives "121-", which never matches. Take std::abs first, so std::to_string(std::abs(-121)) is "121", whose reverse matches. Then compare the original text with its reversed copy using ==.',
      ],
      example: {
        language: 'cpp',
        code: `#include <algorithm>
#include <cstdlib>
#include <iostream>
#include <string>
bool is_palindrome(int value) {
  std::string digits = std::to_string(std::abs(value));
  std::string reversed = digits;
  std::reverse(reversed.begin(), reversed.end());
  return digits == reversed;
}
int main() {
  std::cout << is_palindrome(-121) << is_palindrome(123) << is_palindrome(7) << "\\n";
}`,
        output: '101',
        explanation:
          '-121 becomes "121", a palindrome. "123" reversed is "321". A single digit always matches itself.',
      },
      questions: [
        typeOutput(
          'What does this program print?',
          `#include <algorithm>
#include <cstdlib>
#include <iostream>
#include <string>
bool is_palindrome(int value) {
  std::string digits = std::to_string(std::abs(value));
  std::string reversed = digits;
  std::reverse(reversed.begin(), reversed.end());
  return digits == reversed;
}
int main() {
  std::cout << is_palindrome(10) << is_palindrome(0) << "\\n";
}`,
          '01',
          '"10" reversed is "01", which differs. "0" is a single digit and matches itself.',
        ),
        typeOutput(
          'This version forgets std::abs. What does it print?',
          `#include <algorithm>
#include <iostream>
#include <string>
int main() {
  std::string s = std::to_string(-11);
  std::string r = s;
  std::reverse(r.begin(), r.end());
  std::cout << (s == r) << " " << r << "\\n";
}`,
          '0 11-',
          'The minus sign moves to the end, so "-11" and "11-" differ even though the digits form a palindrome.',
        ),
        choose(
          'Why does is_palindrome reverse a copy rather than digits itself?',
          [
            'std::reverse cannot change a std::string',
            'std::abs only works on a copy',
            'Comparing a string with itself does not compile',
            'In place, no unreversed text would remain',
          ],
          3,
          'After an in-place reverse, both sides of the comparison would be the same reversed text.',
        ),
        typeOutput(
          'What does this program print?',
          `#include <algorithm>
#include <cstdlib>
#include <iostream>
#include <string>
bool is_palindrome(int value) {
  std::string digits = std::to_string(std::abs(value));
  std::string reversed = digits;
  std::reverse(reversed.begin(), reversed.end());
  return digits == reversed;
}
int main() {
  std::cout << is_palindrome(1001) << is_palindrome(-1010) << "\\n";
}`,
          '10',
          '"1001" reads the same backwards. -1010 becomes "1010", whose reverse is "0101".',
        ),
      ],
    },
  ],
};
