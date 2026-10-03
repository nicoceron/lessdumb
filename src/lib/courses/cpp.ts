import type { CodeQuestion, CurriculumCatalog, Skill } from '../curriculum';
import { cppPrerequisites } from './cpp/prerequisites';
import { withExerciseId } from './exercise';
import { withTeachingOrder } from './teaching-order';

interface Atom {
  key: string;
  title: string;
  definition: string;
  rule: string;
  violation: string;
  signature: string;
  solution: string;
  starterCode: string;
  tests: string;
  example: string;
  output: string;
}
interface Topic {
  key: string;
  title: string;
  unit: string;
  atoms: Atom[];
}

// Every atom is original content and a distinct compilable operation.
const topics: Topic[] = [
  {
    key: 'values',
    title: 'Values and arithmetic',
    unit: 'cpp-values',
    atoms: [
      {
        key: 'integer-values',
        title: 'Initialized integer values',
        definition:
          'An int object stores an integer value; initialize it before reading it.',
        rule: 'Initialize every local scalar before using its value.',
        violation:
          'Read an uninitialized local and assume the compiler supplied zero.',
        signature: 'int solve(int incoming)',
        solution:
          '#include <iostream>\n#include <cassert>\nint solve(int incoming) {\n  int saved = incoming;\n  return saved;\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\nint solve(int incoming) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\nint main() {\n  assert(solve(7) == 7);\n  assert(solve(-4) == -4);\n  assert(solve(0) == 0);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\nint solve(int incoming) {\n  int saved = incoming;\n  return saved;\n}\nint main() { std::cout << solve(7) << "\\n"; }',
        output: '7',
      },
      {
        key: 'arithmetic',
        title: 'Integer division and remainder',
        definition:
          'Integer / discards the fractional part, truncating toward zero, and % gives the matching remainder, which has the sign of the left operand.',
        rule: 'Use a nonzero divisor, and expect a negative remainder when the left operand is negative.',
        violation:
          'Test for an odd number with value % 2 == 1, which misses negative odd values.',
        signature: 'int solve(int numerator, int denominator)',
        solution:
          '#include <iostream>\n#include <cassert>\nint solve(int numerator, int denominator) {\n  return numerator % denominator;\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\nint solve(int numerator, int denominator) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\nint main() {\n  assert(solve(17, 5) == 2);\n  assert(solve(-7, 2) == -1);\n  assert(solve(7, -2) == 1);\n  assert(solve(6, 3) == 0);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\nint solve(int numerator, int denominator) {\n  return numerator % denominator;\n}\nint main() { std::cout << 17 / 5 << " " << solve(17, 5) << "\\n"; }',
        output: '3 2',
      },
      {
        key: 'explicit-casts',
        title: 'Cast before division',
        definition:
          'Converting one operand to double before division selects floating-point arithmetic.',
        rule: 'Apply the conversion before the division operator is evaluated.',
        violation: 'Divide integers first and cast the result afterward.',
        signature: 'double solve(int numerator, int denominator)',
        solution:
          '#include <iostream>\n#include <cassert>\ndouble solve(int numerator, int denominator) {\n  return static_cast<double>(numerator) / denominator;\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\ndouble solve(int numerator, int denominator) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\nint main() {\n  assert(solve(7, 2) == 3.5);\n  assert(solve(1, 4) == 0.25);\n  assert(solve(-3, 2) == -1.5);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\ndouble solve(int numerator, int denominator) {\n  return static_cast<double>(numerator) / denominator;\n}\nint main() { std::cout << solve(7, 2) << "\\n"; }',
        output: '3.5',
      },
      {
        key: 'overflow-check',
        title: 'Guard an integer addition',
        definition:
          'Signed integer overflow is undefined behavior, so check bounds before evaluating the sum.',
        rule: 'Compare against numeric_limits bounds before the potentially overflowing addition.',
        violation:
          'Compute the overflowing sum and check whether its sign changed.',
        signature: 'bool solve(int a, int b)',
        solution:
          '#include <iostream>\n#include <cassert>\n#include <limits>\nbool solve(int a, int b) {\n  if (b > 0 && a > std::numeric_limits<int>::max() - b) return false;\n  if (b < 0 && a < std::numeric_limits<int>::min() - b) return false;\n  return true;\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\n#include <limits>\nbool solve(int a, int b) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\n#include <limits>\nint main() {\n  assert(solve(4, 9) == true);\n  assert(solve(std::numeric_limits<int>::max(), 1) == false);\n  assert(solve(std::numeric_limits<int>::min(), -1) == false);\n  assert(solve(-4, 4) == true);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\n#include <limits>\nbool solve(int a, int b) {\n  if (b > 0 && a > std::numeric_limits<int>::max() - b) return false;\n  if (b < 0 && a < std::numeric_limits<int>::min() - b) return false;\n  return true;\n}\nint main() { std::cout << solve(4, 9) << "\\n"; }',
        output: '1',
      },
    ],
  },
  {
    key: 'types',
    title: 'Type choices and conversions',
    unit: 'cpp-values',
    atoms: [
      {
        key: 'bool-values',
        title: 'Boolean comparisons',
        definition:
          'A comparison produces bool, whose values are true and false.',
        rule: 'Use == for equality and = only for assignment.',
        violation: 'Replace an equality comparison with an assignment.',
        signature: 'bool solve(int lhs, int rhs)',
        solution:
          '#include <iostream>\n#include <cassert>\nbool solve(int lhs, int rhs) {\n  return lhs == rhs;\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\nbool solve(int lhs, int rhs) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\nint main() {\n  assert(solve(5, 5) == true);\n  assert(solve(5, 3) == false);\n  assert(solve(-1, -1) == true);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\nbool solve(int lhs, int rhs) {\n  return lhs == rhs;\n}\nint main() { std::cout << solve(5, 5) << "\\n"; }',
        output: '1',
      },
      {
        key: 'unsigned-wrap',
        title: 'Unsigned modular arithmetic',
        definition:
          'Unsigned arithmetic is defined modulo one greater than the maximum representable value.',
        rule: 'Use unsigned wrap deliberately; it does not validate business bounds.',
        violation:
          'Rely on wrapping to reject a quantity that exceeded a business limit.',
        signature: 'unsigned int solve(unsigned int value)',
        solution:
          '#include <iostream>\n#include <cassert>\n#include <limits>\nunsigned int solve(unsigned int value) {\n  return value + 1u;\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\n#include <limits>\nunsigned int solve(unsigned int value) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\n#include <limits>\nint main() {\n  assert(solve(3u) == 4u);\n  assert(solve(std::numeric_limits<unsigned int>::max()) == 0u);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\n#include <limits>\nunsigned int solve(unsigned int value) {\n  return value + 1u;\n}\nint main() { std::cout << solve(3u) << "\\n"; }',
        output: '4',
      },
      {
        key: 'scoped-enums',
        title: 'Scoped enumeration values',
        definition:
          'An enum class defines named alternatives without implicitly converting them to int.',
        rule: 'Handle each domain alternative explicitly.',
        violation:
          'Pass an arbitrary integer where a scoped enumerator is required.',
        signature: 'int solve(Side side)',
        solution:
          '#include <iostream>\n#include <cassert>\nenum class Side { Buy, Sell };\nint solve(Side side) {\n  return side == Side::Buy ? 1 : -1;\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\nenum class Side { Buy, Sell };\nint solve(Side side) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\nint main() {\n  assert(solve(Side::Buy) == 1);\n  assert(solve(Side::Sell) == -1);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\nenum class Side { Buy, Sell };\nint solve(Side side) {\n  return side == Side::Buy ? 1 : -1;\n}\nint main() { std::cout << solve(Side::Buy) << "\\n"; }',
        output: '1',
      },
      {
        key: 'auto-deduction',
        title: 'Deduce values with auto',
        definition:
          'auto deduces the initializer type; plain auto makes a value rather than preserving a reference.',
        rule: 'Choose auto& when the new name must refer to the existing object.',
        violation:
          'Expect assignment to a plain auto copy to mutate the source.',
        signature: 'int solve(int value)',
        solution:
          '#include <iostream>\n#include <cassert>\nint solve(int value) {\n  auto copy = value;\n  copy += 2;\n  return value + copy;\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\nint solve(int value) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\nint main() {\n  assert(solve(3) == 8);\n  assert(solve(-1) == 0);\n  assert(solve(0) == 2);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\nint solve(int value) {\n  auto copy = value;\n  copy += 2;\n  return value + copy;\n}\nint main() { std::cout << solve(3) << "\\n"; }',
        output: '8',
      },
    ],
  },
  {
    key: 'type-facts',
    title: 'Characters, sizes, and type traits',
    unit: 'cpp-values',
    atoms: [
      {
        key: 'char-values',
        title: 'Store characters in char',
        definition:
          "A char holds one character as a small integer code, and a character literal such as 'A' uses single quotes.",
        rule: "Convert a digit character to its value with c - '0', because the codes for '0' through '9' are consecutive.",
        violation:
          "Add the digit character '7' to a total as though it were the number 7.",
        signature: 'int solve(char digit)',
        solution:
          "#include <iostream>\n#include <cassert>\nint solve(char digit) {\n  return digit - '0';\n}",
        starterCode:
          '#include <iostream>\n#include <cassert>\nint solve(char digit) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          "#include <iostream>\n#include <cassert>\nint main() {\n  assert(solve('7') == 7);\n  assert(solve('0') == 0);\n  assert(solve('9') == 9);\n}\n",
        example:
          "#include <iostream>\n#include <cassert>\nint solve(char digit) {\n  return digit - '0';\n}\nint main() { std::cout << solve('7') << \"\\n\"; }",
        output: '7',
      },
      {
        key: 'sizeof-bytes',
        title: 'Measure sizes with sizeof',
        definition:
          'sizeof reports how many bytes a type or object occupies, as a std::size_t known at compile time, and sizeof(char) is always 1.',
        rule: 'Compute byte counts with sizeof instead of hard-coding the size of a type.',
        violation:
          'Write 4 in place of sizeof(int) when computing a buffer size.',
        signature: 'std::size_t solve(std::size_t count)',
        solution:
          '#include <iostream>\n#include <cassert>\n#include <cstddef>\nstd::size_t solve(std::size_t count) {\n  return count * sizeof(int);\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\n#include <cstddef>\nstd::size_t solve(std::size_t count) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\n#include <cstddef>\nint main() {\n  assert(solve(3) == 3 * sizeof(int));\n  assert(solve(1) == sizeof(int));\n  assert(solve(0) == 0);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\n#include <cstddef>\nstd::size_t solve(std::size_t count) {\n  return count * sizeof(int);\n}\nint main() { std::cout << solve(3) << "\\n"; }',
        output: '12',
      },
      {
        key: 'fixed-width-integers',
        title: 'Choose exact-width integers',
        definition:
          '<cstdint> types such as std::int32_t and std::uint8_t have exactly the number of bits in their names.',
        rule: 'Use an exact-width type where a format fixes the size, and convert 8-bit values to int before printing them.',
        violation:
          'Store a 16-bit wire field in int and expect it to wrap at 65536.',
        signature: 'std::uint8_t solve(std::uint8_t value, std::uint8_t step)',
        solution:
          '#include <iostream>\n#include <cassert>\n#include <cstdint>\nstd::uint8_t solve(std::uint8_t value, std::uint8_t step) {\n  return static_cast<std::uint8_t>(value + step);\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\n#include <cstdint>\nstd::uint8_t solve(std::uint8_t value, std::uint8_t step) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\n#include <cstdint>\nint main() {\n  assert(solve(250, 10) == 4);\n  assert(solve(1, 2) == 3);\n  assert(solve(255, 1) == 0);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\n#include <cstdint>\nstd::uint8_t solve(std::uint8_t value, std::uint8_t step) {\n  return static_cast<std::uint8_t>(value + step);\n}\nint main() { std::cout << static_cast<int>(solve(250, 10)) << "\\n"; }',
        output: '4',
      },
      {
        key: 'type-traits',
        title: 'Ask the compiler about a type',
        definition:
          '<type_traits> answers questions about types at compile time: std::is_same_v<A, B> and std::is_unsigned_v<T> are bool constants.',
        rule: 'State a type requirement with a trait instead of inferring it from sizes.',
        violation:
          'Treat two types as interchangeable because sizeof reports the same number of bytes.',
        signature: 'bool solve()',
        solution:
          '#include <iostream>\n#include <cassert>\n#include <cstdint>\n#include <type_traits>\nbool solve() {\n  return sizeof(std::uint16_t) == 2 && std::is_unsigned_v<std::uint16_t> &&\n         !std::is_same_v<std::uint16_t, std::int16_t>;\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\n#include <cstdint>\n#include <type_traits>\nbool solve() {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\n#include <cstdint>\n#include <type_traits>\nint main() {\n  assert(solve() == true);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\n#include <cstdint>\n#include <type_traits>\nbool solve() {\n  return sizeof(std::uint16_t) == 2 && std::is_unsigned_v<std::uint16_t> &&\n         !std::is_same_v<std::uint16_t, std::int16_t>;\n}\nint main() { std::cout << solve() << "\\n"; }',
        output: '1',
      },
    ],
  },
  {
    key: 'bits',
    title: 'Shifts and masks',
    unit: 'cpp-values',
    atoms: [
      {
        key: 'bit-shifts',
        title: 'Shift bits left and right',
        definition:
          'For an unsigned value, x << k moves its bits left by k places, multiplying by 2 to the power k, and x >> k moves them right, dividing by 2 to the power k.',
        rule: 'Shift unsigned values, and by fewer places than their width in bits.',
        violation:
          'Shift a 32-bit unsigned value by 32 places and expect the result to be zero.',
        signature: 'unsigned solve(unsigned value, unsigned places)',
        solution:
          '#include <iostream>\n#include <cassert>\nunsigned solve(unsigned value, unsigned places) {\n  return (value >> places) << places;\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\nunsigned solve(unsigned value, unsigned places) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\nint main() {\n  assert(solve(13u, 2u) == 12u);\n  assert(solve(8u, 3u) == 8u);\n  assert(solve(7u, 3u) == 0u);\n  assert(solve(255u, 4u) == 240u);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\nunsigned solve(unsigned value, unsigned places) {\n  return (value >> places) << places;\n}\nint main() { std::cout << solve(13u, 2u) << "\\n"; }',
        output: '12',
      },
      {
        key: 'bit-masks',
        title: 'Select and set bits with masks',
        definition:
          'x & mask keeps only the bits that are set in both values, and x | mask turns the mask bits on.',
        rule: 'Use & with a mask to test or extract bits and | to set them; keep && and || for conditions.',
        violation: 'Use && where a bitwise mask was intended.',
        signature: 'unsigned solve(unsigned value)',
        solution:
          '#include <iostream>\n#include <cassert>\nunsigned solve(unsigned value) {\n  return value & 0xFFu;\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\nunsigned solve(unsigned value) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\nint main() {\n  assert(solve(0x1234u) == 0x34u);\n  assert(solve(255u) == 255u);\n  assert(solve(256u) == 0u);\n  assert(solve(0x1FFu) == 0xFFu);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\nunsigned solve(unsigned value) {\n  return value & 0xFFu;\n}\nint main() { std::cout << solve(0x1234u) << "\\n"; }',
        output: '52',
      },
      {
        key: 'bit-flags',
        title: 'Toggle and clear single-bit flags',
        definition:
          'The flag 1u << k has only bit k set; x ^ flag toggles that bit and x & ~flag clears it.',
        rule: 'Build a flag with 1u << k, then use | to set it, ^ to toggle it, and & ~ to clear it.',
        violation:
          'Clear a flag with x & flag, which keeps only that flag instead.',
        signature: 'unsigned solve(unsigned flags, unsigned bit)',
        solution:
          '#include <iostream>\n#include <cassert>\nunsigned solve(unsigned flags, unsigned bit) {\n  return flags & ~(1u << bit);\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\nunsigned solve(unsigned flags, unsigned bit) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\nint main() {\n  assert(solve(15u, 1u) == 13u);\n  assert(solve(8u, 3u) == 0u);\n  assert(solve(5u, 1u) == 5u);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\nunsigned solve(unsigned flags, unsigned bit) {\n  return flags & ~(1u << bit);\n}\nint main() { std::cout << solve(15u, 1u) << "\\n"; }',
        output: '13',
      },
      {
        key: 'byte-extract',
        title: 'Extract a byte from a word',
        definition:
          'Shifting a word right by 8 * i places and masking with 0xFF extracts byte i, counting from the least significant byte.',
        rule: 'Shift the wanted byte down to the lowest position first, then mask with 0xFF.',
        violation:
          'Mask with 0xFF before shifting, which discards the byte you wanted.',
        signature: 'std::uint8_t solve(std::uint32_t word, unsigned index)',
        solution:
          '#include <iostream>\n#include <cassert>\n#include <cstdint>\nstd::uint8_t solve(std::uint32_t word, unsigned index) {\n  return static_cast<std::uint8_t>((word >> (8 * index)) & 0xFFu);\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\n#include <cstdint>\nstd::uint8_t solve(std::uint32_t word, unsigned index) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\n#include <cstdint>\nint main() {\n  assert(solve(0x11223344u, 0) == 0x44);\n  assert(solve(0x11223344u, 1) == 0x33);\n  assert(solve(0x11223344u, 3) == 0x11);\n  assert(solve(255u, 1) == 0);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\n#include <cstdint>\nstd::uint8_t solve(std::uint32_t word, unsigned index) {\n  return static_cast<std::uint8_t>((word >> (8 * index)) & 0xFFu);\n}\nint main() { std::cout << static_cast<int>(solve(0x11223344u, 1)) << "\\n"; }',
        output: '51',
      },
    ],
  },
  {
    key: 'control',
    title: 'Decisions and loops',
    unit: 'cpp-control',
    atoms: [
      {
        key: 'if-branches',
        title: 'Select with if',
        definition:
          'An if statement executes only the branch selected by its condition.',
        rule: 'Return the result for every possible branch.',
        violation: 'Leave one branch without a defined return value.',
        signature: 'int solve(int value)',
        solution:
          '#include <iostream>\n#include <cassert>\nint solve(int value) {\n  if (value < 0) return -1;\n  if (value > 0) return 1;\n  return 0;\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\nint solve(int value) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\nint main() {\n  assert(solve(-5) == -1);\n  assert(solve(0) == 0);\n  assert(solve(7) == 1);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\nint solve(int value) {\n  if (value < 0) return -1;\n  if (value > 0) return 1;\n  return 0;\n}\nint main() { std::cout << solve(-5) << "\\n"; }',
        output: '-1',
      },
      {
        key: 'for-bounds',
        title: 'Count a half-open range',
        definition:
          'A loop with i < end visits indices from the start through end minus one.',
        rule: 'Use half-open bounds so the end position is never accessed.',
        violation: 'Use <= size when indexing a size-element sequence.',
        signature: 'int solve(int end)',
        solution:
          '#include <iostream>\n#include <cassert>\nint solve(int end) {\n  int count = 0;\n  for (int i = 0; i < end; ++i) ++count;\n  return count;\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\nint solve(int end) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\nint main() {\n  assert(solve(4) == 4);\n  assert(solve(0) == 0);\n  assert(solve(1) == 1);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\nint solve(int end) {\n  int count = 0;\n  for (int i = 0; i < end; ++i) ++count;\n  return count;\n}\nint main() { std::cout << solve(4) << "\\n"; }',
        output: '4',
      },
      {
        key: 'while-progress',
        title: 'Advance a while loop',
        definition:
          'A while loop checks its condition before every iteration, including the first, so its body can run zero times.',
        rule: 'Update the quantity that controls termination on every path.',
        violation: 'Keep the loop condition true without updating its state.',
        signature: 'int solve(int value)',
        solution:
          '#include <iostream>\n#include <cassert>\nint solve(int value) {\n  int steps = 0;\n  while (value > 1) {\n    value /= 2;\n    ++steps;\n  }\n  return steps;\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\nint solve(int value) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\nint main() {\n  assert(solve(8) == 3);\n  assert(solve(10) == 3);\n  assert(solve(1) == 0);\n  assert(solve(0) == 0);\n  assert(solve(-4) == 0);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\nint solve(int value) {\n  int steps = 0;\n  while (value > 1) {\n    value /= 2;\n    ++steps;\n  }\n  return steps;\n}\nint main() { std::cout << solve(8) << "\\n"; }',
        output: '3',
      },
      {
        key: 'early-return',
        title: 'Stop a search early',
        definition:
          'Returning from a function immediately stops its remaining statements.',
        rule: 'Distinguish a found position from the sentinel used for absence.',
        violation:
          'Return zero for both a missing item and an item at position zero.',
        signature: 'int solve(const std::vector<int>& values, int target)',
        solution:
          '#include <iostream>\n#include <cassert>\n#include <vector>\nint solve(const std::vector<int>& values, int target) {\n  for (int i = 0; i < static_cast<int>(values.size()); ++i)\n    if (values[i] == target) return i;\n  return -1;\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\n#include <vector>\nint solve(const std::vector<int>& values, int target) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\n#include <vector>\nint main() {\n  assert(solve({4, 8, 4}, 8) == 1);\n  assert(solve({4}, 4) == 0);\n  assert(solve({}, 1) == -1);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\n#include <vector>\nint solve(const std::vector<int>& values, int target) {\n  for (int i = 0; i < static_cast<int>(values.size()); ++i)\n    if (values[i] == target) return i;\n  return -1;\n}\nint main() { std::cout << solve({4, 8, 4}, 8) << "\\n"; }',
        output: '1',
      },
    ],
  },
  {
    key: 'logic',
    title: 'Combining conditions',
    unit: 'cpp-control',
    atoms: [
      {
        key: 'logical-operators',
        title: 'Combine conditions',
        definition:
          'a && b is true only when both operands are true, a || b is true when at least one is, and !a inverts a bool.',
        rule: 'Add parentheses when mixing && and ||, because && groups more tightly than ||.',
        violation: 'Write a || b && c and expect it to mean (a || b) && c.',
        signature: 'bool solve(int hour, bool holiday)',
        solution:
          '#include <iostream>\n#include <cassert>\nbool solve(int hour, bool holiday) {\n  return hour >= 9 && hour < 17 && !holiday;\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\nbool solve(int hour, bool holiday) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\nint main() {\n  assert(solve(10, false) == true);\n  assert(solve(10, true) == false);\n  assert(solve(8, false) == false);\n  assert(solve(17, false) == false);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\nbool solve(int hour, bool holiday) {\n  return hour >= 9 && hour < 17 && !holiday;\n}\nint main() { std::cout << solve(10, false) << "\\n"; }',
        output: '1',
      },
      {
        key: 'short-circuit',
        title: 'Guard with short-circuit evaluation',
        definition:
          '&& evaluates its right operand only when the left one is true, and || only when the left one is false.',
        rule: 'Put the safety check on the left so the risky operand runs only when it is valid.',
        violation:
          'Divide by a count on the left of && and check that the count is nonzero on the right.',
        signature: 'bool solve(int total, int count)',
        solution:
          '#include <iostream>\n#include <cassert>\nbool solve(int total, int count) {\n  return count != 0 && total / count >= 10;\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\nbool solve(int total, int count) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\nint main() {\n  assert(solve(50, 5) == true);\n  assert(solve(40, 5) == false);\n  assert(solve(7, 0) == false);\n  assert(solve(-30, -3) == true);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\nbool solve(int total, int count) {\n  return count != 0 && total / count >= 10;\n}\nint main() { std::cout << solve(50, 5) << "\\n"; }',
        output: '1',
      },
      {
        key: 'conditional-operator',
        title: 'Choose a value with ?:',
        definition:
          'condition ? a : b evaluates the condition, then evaluates only a when it is true or only b when it is false.',
        rule: 'Use ?: to choose between two values of compatible types, and parenthesize it inside a larger expression.',
        violation:
          'Give the two branches unrelated types, such as a string literal and an int.',
        signature: 'int solve(int a, int b)',
        solution:
          '#include <iostream>\n#include <cassert>\nint solve(int a, int b) {\n  return a > b ? a : b;\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\nint solve(int a, int b) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\nint main() {\n  assert(solve(3, 9) == 9);\n  assert(solve(9, 3) == 9);\n  assert(solve(-2, -5) == -2);\n  assert(solve(4, 4) == 4);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\nint solve(int a, int b) {\n  return a > b ? a : b;\n}\nint main() { std::cout << solve(3, 9) << "\\n"; }',
        output: '9',
      },
      {
        key: 'inclusive-range',
        title: 'Test an inclusive range',
        definition:
          'A value lies in the inclusive range from low to high when low <= value && value <= high.',
        rule: 'Write each bound as its own comparison joined with &&, and use || to test for a value outside the range.',
        violation: 'Chain two comparisons as low <= value <= high.',
        signature: 'bool solve(int value, int low, int high)',
        solution:
          '#include <iostream>\n#include <cassert>\nbool solve(int value, int low, int high) {\n  return low <= value && value <= high;\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\nbool solve(int value, int low, int high) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\nint main() {\n  assert(solve(5, 1, 10) == true);\n  assert(solve(1, 1, 10) == true);\n  assert(solve(10, 1, 10) == true);\n  assert(solve(0, 1, 10) == false);\n  assert(solve(-5, 1, 10) == false);\n  assert(solve(20, 1, 10) == false);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\nbool solve(int value, int low, int high) {\n  return low <= value && value <= high;\n}\nint main() { std::cout << solve(5, 1, 10) << "\\n"; }',
        output: '1',
      },
    ],
  },
  {
    key: 'arrays',
    title: 'Fixed arrays and range loops',
    unit: 'cpp-control',
    atoms: [
      {
        key: 'std-array',
        title: 'Store a fixed number of values',
        definition:
          'std::array<T, N> holds exactly N elements of type T, indexed from 0 through N - 1, and size() returns N.',
        rule: 'Index only positions below size(), and write {} to start every element at zero.',
        violation: 'Use N itself as an index into a std::array of N elements.',
        signature: 'int solve(std::array<int, 4> values)',
        solution:
          '#include <iostream>\n#include <cassert>\n#include <array>\n#include <cstddef>\nint solve(std::array<int, 4> values) {\n  int total = 0;\n  for (std::size_t i = 0; i < values.size(); ++i) total += values[i];\n  return total;\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\n#include <array>\n#include <cstddef>\nint solve(std::array<int, 4> values) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\n#include <array>\n#include <cstddef>\nint main() {\n  assert(solve({1, 2, 3, 4}) == 10);\n  assert(solve({5}) == 5);\n  assert(solve({}) == 0);\n  assert(solve({-2, 2, -2, 2}) == 0);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\n#include <array>\n#include <cstddef>\nint solve(std::array<int, 4> values) {\n  int total = 0;\n  for (std::size_t i = 0; i < values.size(); ++i) total += values[i];\n  return total;\n}\nint main() { std::cout << solve({1, 2, 3, 4}) << "\\n"; }',
        output: '10',
      },
      {
        key: 'range-for',
        title: 'Visit each element with range-for',
        definition:
          'for (int x : values) runs its body once per element, in order, with x holding a copy of that element.',
        rule: 'Use a by-value loop variable when the loop only reads the elements.',
        violation:
          'Assign to a by-value loop variable and expect the array to change.',
        signature: 'int solve(std::array<int, 5> values)',
        solution:
          '#include <iostream>\n#include <cassert>\n#include <array>\nint solve(std::array<int, 5> values) {\n  int total = 0;\n  for (int x : values) total += x * x;\n  return total;\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\n#include <array>\nint solve(std::array<int, 5> values) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\n#include <array>\nint main() {\n  assert(solve({1, 2, 3, 4, 5}) == 55);\n  assert(solve({}) == 0);\n  assert(solve({-1, -1, -1, -1, -1}) == 5);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\n#include <array>\nint solve(std::array<int, 5> values) {\n  int total = 0;\n  for (int x : values) total += x * x;\n  return total;\n}\nint main() { std::cout << solve({1, 2, 3, 4, 5}) << "\\n"; }',
        output: '55',
      },
      {
        key: 'loop-exits',
        title: 'Skip or stop with continue and break',
        definition:
          'continue jumps to the next iteration of the innermost loop, and break leaves that loop immediately.',
        rule: 'Use continue to skip one element and break once the remaining elements no longer matter.',
        violation:
          'Use break where only the current element should be skipped.',
        signature: 'int solve(std::array<int, 6> readings)',
        solution:
          '#include <iostream>\n#include <cassert>\n#include <array>\nint solve(std::array<int, 6> readings) {\n  int total = 0;\n  for (int x : readings) {\n    if (x < 0) continue;\n    if (x == 0) break;\n    total += x;\n  }\n  return total;\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\n#include <array>\nint solve(std::array<int, 6> readings) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\n#include <array>\nint main() {\n  assert(solve({4, -1, 5, 0, 7, 8}) == 9);\n  assert(solve({1, 2, 3, 4, 5, 6}) == 21);\n  assert(solve({0, 9, 9, 9, 9, 9}) == 0);\n  assert(solve({-3, -3, 2, -3, 0, 5}) == 2);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\n#include <array>\nint solve(std::array<int, 6> readings) {\n  int total = 0;\n  for (int x : readings) {\n    if (x < 0) continue;\n    if (x == 0) break;\n    total += x;\n  }\n  return total;\n}\nint main() { std::cout << solve({4, -1, 5, 0, 7, 8}) << "\\n"; }',
        output: '9',
      },
      {
        key: 'range-reference',
        title: 'Change elements through a range-for reference',
        definition:
          'for (int& x : values) binds x to each element itself, so assigning to x updates the array.',
        rule: 'Declare the loop variable as a reference, such as int& or auto&, when the loop must update each element.',
        violation:
          'Write for (int x : values) when the loop is meant to update each element.',
        signature:
          'std::array<int, 4> solve(std::array<int, 4> values, int factor)',
        solution:
          '#include <iostream>\n#include <cassert>\n#include <array>\nstd::array<int, 4> solve(std::array<int, 4> values, int factor) {\n  for (int& x : values) x *= factor;\n  return values;\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\n#include <array>\nstd::array<int, 4> solve(std::array<int, 4> values, int factor) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\n#include <array>\nint main() {\n  assert((solve({1, 2, 3, 4}, 3) == std::array<int, 4>{3, 6, 9, 12}));\n  assert((solve({5, -1, 0, 2}, -2) == std::array<int, 4>{-10, 2, 0, -4}));\n  assert((solve({}, 7) == std::array<int, 4>{}));\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\n#include <array>\nstd::array<int, 4> solve(std::array<int, 4> values, int factor) {\n  for (int& x : values) x *= factor;\n  return values;\n}\nint main() {\n  std::array<int, 4> scaled = solve({1, 2, 3, 4}, 3);\n  std::cout << scaled[0] << " " << scaled[3] << "\\n";\n}',
        output: '3 12',
      },
    ],
  },
  {
    key: 'functions',
    title: 'Function contracts',
    unit: 'cpp-control',
    atoms: [
      {
        key: 'return-values',
        title: 'Return a computed value',
        definition:
          'A function can compute a result from parameters without mutating its caller.',
        rule: 'Keep input parameters and the returned result distinct.',
        violation: 'Assume a local parameter assignment updates the caller.',
        signature: 'int solve(int input)',
        solution:
          '#include <iostream>\n#include <cassert>\nint solve(int input) {\n  int output = input * 2;\n  return output;\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\nint solve(int input) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\nint main() {\n  assert(solve(6) == 12);\n  assert(solve(-3) == -6);\n  assert(solve(0) == 0);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\nint solve(int input) {\n  int output = input * 2;\n  return output;\n}\nint main() { std::cout << solve(6) << "\\n"; }',
        output: '12',
      },
      {
        key: 'function-overloads',
        title: 'Select an overload',
        definition:
          'Overloaded functions share a name but differ in parameter types; argument types select the overload.',
        rule: 'Provide parameter lists that distinguish overload candidates.',
        violation: 'Define two functions differing only in return type.',
        signature: 'int solve(int input)',
        solution:
          '#include <iostream>\n#include <cassert>\nint adjust(int x) { return x + 1; }\ndouble adjust(double x) { return x + 3.5; }\nint solve(int input) {\n  return adjust(input) + static_cast<int>(adjust(1.5));\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\nint adjust(int x) { return x + 1; }\ndouble adjust(double x) { return x + 3.5; }\nint solve(int input) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\nint main() {\n  assert(solve(2) == 8);\n  assert(solve(-1) == 5);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\nint adjust(int x) { return x + 1; }\ndouble adjust(double x) { return x + 3.5; }\nint solve(int input) {\n  return adjust(input) + static_cast<int>(adjust(1.5));\n}\nint main() { std::cout << solve(2) << "\\n"; }',
        output: '8',
      },
      {
        key: 'default-arguments',
        title: 'Supply default arguments',
        definition:
          'A default argument is used when the caller omits that trailing argument.',
        rule: 'Place defaulted parameters after the required parameters.',
        violation: 'Put a required parameter after a defaulted parameter.',
        signature: 'int solve(int value, int offset = 2)',
        solution:
          '#include <iostream>\n#include <cassert>\nint solve(int value, int offset = 2) {\n  return value + offset;\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\nint solve(int value, int offset = 2) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\nint main() {\n  assert(solve(5) == 7);\n  assert(solve(5, 9) == 14);\n  assert(solve(-2, 0) == -2);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\nint solve(int value, int offset = 2) {\n  return value + offset;\n}\nint main() { std::cout << solve(5) << "\\n"; }',
        output: '7',
      },
      {
        key: 'const-contract',
        title: 'Express a read-only parameter',
        definition:
          'A const reference borrows an existing object and prevents mutation through that reference.',
        rule: 'Use const& for a borrowed input that this function only reads.',
        violation:
          'Cast away constness to mutate an object supplied as read-only.',
        signature: 'int solve(const Order& order)',
        solution:
          '#include <iostream>\n#include <cassert>\nstruct Order {\n  int price;\n  int quantity;\n};\nint solve(const Order& order) {\n  return order.price * order.quantity;\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\nstruct Order {\n  int price;\n  int quantity;\n};\nint solve(const Order& order) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\nint main() {\n  assert(solve(Order{12, 3}) == 36);\n  assert(solve(Order{5, 0}) == 0);\n  Order order{7, 6};\n  assert(solve(order) == 42);\n  assert(order.price == 7);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\nstruct Order {\n  int price;\n  int quantity;\n};\nint solve(const Order& order) {\n  return order.price * order.quantity;\n}\nint main() {\n  Order order{12, 3};\n  std::cout << solve(order) << "\\n";\n}',
        output: '36',
      },
    ],
  },
  {
    key: 'references',
    title: 'References and aliases',
    unit: 'cpp-memory',
    atoms: [
      {
        key: 'reference-alias',
        title: 'Bind an lvalue reference',
        definition:
          'An lvalue reference is another name for an existing object.',
        rule: 'Initialize the reference with an object whose lifetime covers every use.',
        violation: 'Return a reference to a function-local object.',
        signature: 'int solve(int value)',
        solution:
          '#include <iostream>\n#include <cassert>\nint solve(int value) {\n  int& alias = value;\n  alias += 3;\n  return value;\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\nint solve(int value) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\nint main() {\n  assert(solve(4) == 7);\n  assert(solve(-3) == 0);\n  assert(solve(0) == 3);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\nint solve(int value) {\n  int& alias = value;\n  alias += 3;\n  return value;\n}\nint main() { std::cout << solve(4) << "\\n"; }',
        output: '7',
      },
      {
        key: 'reference-parameter',
        title: 'Mutate through a reference parameter',
        definition:
          'A non-const reference parameter lets the function modify the caller object.',
        rule: 'Use a mutation contract when modification is part of the intended API.',
        violation:
          'Hide unintended input mutations in an API described as read-only.',
        signature: 'int solve(int start)',
        solution:
          '#include <iostream>\n#include <cassert>\nvoid increment(int& value) { ++value; }\nint solve(int start) {\n  int current = start;\n  increment(current);\n  return current;\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\nvoid increment(int& value) { ++value; }\nint solve(int start) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\nint main() {\n  assert(solve(5) == 6);\n  assert(solve(-1) == 0);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\nvoid increment(int& value) { ++value; }\nint solve(int start) {\n  int current = start;\n  increment(current);\n  return current;\n}\nint main() { std::cout << solve(5) << "\\n"; }',
        output: '6',
      },
      {
        key: 'reference-reseat',
        title: 'Assignment through an alias',
        definition:
          'Assigning to a reference changes its referent; it does not rebind the reference.',
        rule: 'Remember that a reference binding is fixed after initialization.',
        violation:
          'Use reference assignment as though it were pointer reseating.',
        signature: 'int solve(int first, int second)',
        solution:
          '#include <iostream>\n#include <cassert>\nint solve(int first, int second) {\n  int& alias = first;\n  alias = second;\n  second += 10;\n  return alias;\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\nint solve(int first, int second) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\nint main() {\n  assert(solve(1, 4) == 4);\n  assert(solve(8, -2) == -2);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\nint solve(int first, int second) {\n  int& alias = first;\n  alias = second;\n  second += 10;\n  return alias;\n}\nint main() { std::cout << solve(1, 4) << "\\n"; }',
        output: '4',
      },
      {
        key: 'borrowed-output',
        title: 'Return a reference to live storage',
        definition:
          'A returned reference aliases its referenced caller-owned object and is usable only while that object remains alive.',
        rule: 'Return a reference to caller-owned storage whose lifetime covers every use of the returned alias.',
        violation:
          'Return a reference to a function-local scalar after its lifetime ends.',
        signature: 'int& solve(int& value)',
        solution:
          '#include <iostream>\n#include <cassert>\nint& solve(int& value) {\n  return value;\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\nint& solve(int& value) {\n  // TODO: return a reference to the caller-owned value.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\nint main() {\n  int value = 4;\n  int& alias = solve(value);\n  assert(&alias == &value);\n  alias += 3;\n  assert(value == 7);\n  int negative = -4;\n  solve(negative) = -1;\n  assert(negative == -1);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\nint& solve(int& value) {\n  return value;\n}\nint main() {\n  int value = 4;\n  int& alias = solve(value);\n  ++alias;\n  std::cout << value << "\\n";\n}',
        output: '5',
      },
    ],
  },
  {
    key: 'pointers',
    title: 'Pointers and nullable views',
    unit: 'cpp-memory',
    atoms: [
      {
        key: 'pointer-address',
        title: 'Take and dereference an address',
        definition:
          'A pointer can store an object address; dereferencing a valid pointer accesses that object.',
        rule: 'Dereference only a valid pointer to a live object.',
        violation: 'Dereference a pointer after its object lifetime ends.',
        signature: 'int solve(int value)',
        solution:
          '#include <iostream>\n#include <cassert>\nint solve(int value) {\n  int* pointer = &value;\n  *pointer += 4;\n  return value;\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\nint solve(int value) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\nint main() {\n  assert(solve(3) == 7);\n  assert(solve(-4) == 0);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\nint solve(int value) {\n  int* pointer = &value;\n  *pointer += 4;\n  return value;\n}\nint main() { std::cout << solve(3) << "\\n"; }',
        output: '7',
      },
      {
        key: 'nullptr-guard',
        title: 'Handle a null pointer',
        definition: 'nullptr represents the absence of an object address.',
        rule: 'Check a nullable pointer before dereferencing it.',
        violation:
          'Dereference the pointer before checking whether it is null.',
        signature: 'int solve(const int* pointer)',
        solution:
          '#include <iostream>\n#include <cassert>\nint solve(const int* pointer) {\n  return pointer ? *pointer : -1;\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\nint solve(const int* pointer) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\nint main() {\n  int x = 9;\n  assert(solve(&x) == 9);\n  assert(solve(nullptr) == -1);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\nint solve(const int* pointer) {\n  return pointer ? *pointer : -1;\n}\nint main() {\n  int x = 9;\n  std::cout << solve(&x) << "\\n";\n}',
        output: '9',
      },
      {
        key: 'pointer-reseat',
        title: 'Reseat a non-owning pointer',
        definition: 'A pointer variable can be assigned a different address.',
        rule: 'Keep address changes separate from ownership and deletion.',
        violation:
          'Delete storage merely because a borrowed pointer no longer uses it.',
        signature: 'int solve(int first, int second)',
        solution:
          '#include <iostream>\n#include <cassert>\nint solve(int first, int second) {\n  const int* pointer = &first;\n  pointer = &second;\n  return *pointer;\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\nint solve(int first, int second) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\nint main() {\n  assert(solve(1, 8) == 8);\n  assert(solve(9, -2) == -2);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\nint solve(int first, int second) {\n  const int* pointer = &first;\n  pointer = &second;\n  return *pointer;\n}\nint main() { std::cout << solve(1, 8) << "\\n"; }',
        output: '8',
      },
      {
        key: 'pointer-range',
        title: 'Traverse a valid array range',
        definition:
          'Pointer arithmetic is defined within one array and its one-past position.',
        rule: 'Never dereference the one-past pointer.',
        violation:
          'Read through the one-past address as if it were an array element.',
        signature: 'int solve(const std::array<int, 3>& values)',
        solution:
          '#include <iostream>\n#include <cassert>\n#include <array>\nint solve(const std::array<int, 3>& values) {\n  const int* begin = values.data();\n  const int* end = begin + values.size();\n  int total = 0;\n  for (auto p = begin; p != end; ++p) total += *p;\n  return total;\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\n#include <array>\nint solve(const std::array<int, 3>& values) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\n#include <array>\nint main() {\n  assert(solve({1, 3, 5}) == 9);\n  assert(solve({0, 0, 0}) == 0);\n  assert(solve({-3, 2, 1}) == 0);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\n#include <array>\nint solve(const std::array<int, 3>& values) {\n  const int* begin = values.data();\n  const int* end = begin + values.size();\n  int total = 0;\n  for (auto p = begin; p != end; ++p) total += *p;\n  return total;\n}\nint main() { std::cout << solve({1, 3, 5}) << "\\n"; }',
        output: '9',
      },
    ],
  },
  {
    key: 'views',
    title: 'Spans and string views',
    unit: 'cpp-memory',
    atoms: [
      {
        key: 'span-size',
        title: 'Borrow a contiguous span',
        definition:
          'std::span carries a pointer and an element count without owning its elements.',
        rule: 'Keep the backing sequence alive for the entire span use.',
        violation:
          'Store a span to a local array after the array is destroyed.',
        signature: 'int solve(std::span<const int> values)',
        solution:
          '#include <iostream>\n#include <cassert>\n#include <span>\n#include <array>\nint solve(std::span<const int> values) {\n  int sum = 0;\n  for (int value : values) sum += value;\n  return sum;\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\n#include <span>\n#include <array>\nint solve(std::span<const int> values) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\n#include <span>\n#include <array>\nint main() {\n  std::array<int, 3> a{2, 3, 4};\n  assert(solve(a) == 9);\n  assert(solve({}) == 0);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\n#include <span>\n#include <array>\nint solve(std::span<const int> values) {\n  int sum = 0;\n  for (int value : values) sum += value;\n  return sum;\n}\nint main() {\n  std::array<int, 3> a{2, 3, 4};\n  std::cout << solve(a) << "\\n";\n}',
        output: '9',
      },
      {
        key: 'span-subview',
        title: 'Select a checked subspan',
        definition:
          'A subspan views part of the same backing storage and does not allocate a new sequence.',
        rule: 'Check the requested offset against size before making the subspan.',
        violation: 'Pass an offset larger than the span length.',
        signature: 'int solve(std::span<const int> values, std::size_t offset)',
        solution:
          '#include <iostream>\n#include <cassert>\n#include <span>\n#include <array>\n#include <cstddef>\nint solve(std::span<const int> values, std::size_t offset) {\n  if (offset > values.size()) return -1;\n  auto tail = values.subspan(offset);\n  return static_cast<int>(tail.size());\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\n#include <span>\n#include <array>\n#include <cstddef>\nint solve(std::span<const int> values, std::size_t offset) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\n#include <span>\n#include <array>\n#include <cstddef>\nint main() {\n  std::array<int, 4> a{};\n  assert(solve(a, 1) == 3);\n  assert(solve({}, 0) == 0);\n  assert(solve({}, 1) == -1);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\n#include <span>\n#include <array>\n#include <cstddef>\nint solve(std::span<const int> values, std::size_t offset) {\n  if (offset > values.size()) return -1;\n  auto tail = values.subspan(offset);\n  return static_cast<int>(tail.size());\n}\nint main() {\n  std::array<int, 4> a{};\n  std::cout << solve(a, 1) << "\\n";\n}',
        output: '3',
      },
      {
        key: 'string-view',
        title: 'Read a non-owning string view',
        definition:
          'std::string_view borrows characters and stores a length; it need not be null terminated.',
        rule: 'Use the stored length rather than a C-string scan.',
        violation:
          'Call strlen on arbitrary string_view data and assume a terminator exists.',
        signature: 'int solve(std::string_view text)',
        solution:
          '#include <iostream>\n#include <cassert>\n#include <string_view>\nint solve(std::string_view text) {\n  return static_cast<int>(text.size());\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\n#include <string_view>\nint solve(std::string_view text) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\n#include <string_view>\nint main() {\n  assert(solve("rust") == 4);\n  assert(solve("") == 0);\n  assert(solve(std::string_view("a\\0b", 3)) == 3);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\n#include <string_view>\nint solve(std::string_view text) {\n  return static_cast<int>(text.size());\n}\nint main() { std::cout << solve("rust") << "\\n"; }',
        output: '4',
      },
      {
        key: 'view-lifetime',
        title: 'Materialize an owning result',
        definition:
          'Constructing std::string from a view creates an owning copy of the viewed characters.',
        rule: 'Copy into an owning string before the borrowed source expires.',
        violation: 'Retain a view to a temporary string and read it later.',
        signature: 'std::string solve(std::string_view text)',
        solution:
          '#include <iostream>\n#include <cassert>\n#include <string>\n#include <string_view>\nstd::string solve(std::string_view text) {\n  return std::string(text);\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\n#include <string>\n#include <string_view>\nstd::string solve(std::string_view text) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\n#include <string>\n#include <string_view>\nint main() {\n  assert(solve("safe") == std::string("safe"));\n  assert(solve("") == std::string(""));\n  assert(solve("a b") == std::string("a b"));\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\n#include <string>\n#include <string_view>\nstd::string solve(std::string_view text) {\n  return std::string(text);\n}\nint main() { std::cout << solve("safe") << "\\n"; }',
        output: 'safe',
      },
    ],
  },
  {
    key: 'lifetime',
    title: 'Object initialization and lifetime',
    unit: 'cpp-ownership',
    atoms: [
      {
        key: 'aggregate-init',
        title: 'Initialize aggregate members',
        definition:
          'Brace initialization can provide values for public aggregate members in declaration order.',
        rule: 'Initialize members before any operation reads them.',
        violation:
          'Assume an uninitialized numeric member already holds a useful value.',
        signature: 'int solve(int price, int size)',
        solution:
          '#include <iostream>\n#include <cassert>\nstruct Quote { int price; int size; };\nint solve(int price, int size) {\n  Quote quote{price, size};\n  return quote.price + quote.size;\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\nstruct Quote { int price; int size; };\nint solve(int price, int size) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\nint main() {\n  assert(solve(10, 3) == 13);\n  assert(solve(-2, 2) == 0);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\nstruct Quote { int price; int size; };\nint solve(int price, int size) {\n  Quote quote{price, size};\n  return quote.price + quote.size;\n}\nint main() { std::cout << solve(10, 3) << "\\n"; }',
        output: '13',
      },
      {
        key: 'constructor-init',
        title: 'Initialize in a constructor',
        definition:
          'Member initializers construct members before the constructor body runs.',
        rule: 'Declare and initialize members in the dependency order they require.',
        violation:
          'Rely on initializer-list order to override member declaration order.',
        signature: 'int solve(int value)',
        solution:
          '#include <iostream>\n#include <cassert>\nstruct Holder { int value; explicit Holder(int x) : value(x) {} };\nint solve(int value) {\n  Holder holder(value);\n  return holder.value;\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\nstruct Holder { int value; explicit Holder(int x) : value(x) {} };\nint solve(int value) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\nint main() {\n  assert(solve(11) == 11);\n  assert(solve(-2) == -2);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\nstruct Holder { int value; explicit Holder(int x) : value(x) {} };\nint solve(int value) {\n  Holder holder(value);\n  return holder.value;\n}\nint main() { std::cout << solve(11) << "\\n"; }',
        output: '11',
      },
      {
        key: 'destructor-scope',
        title: 'Observe scope exit',
        definition:
          'An automatic object destructor runs when control leaves its scope normally.',
        rule: 'Keep resource release in the destructor of its owning object.',
        violation:
          'Manually call a destructor and then let scope exit destroy the object again.',
        signature: 'int solve()',
        solution:
          '#include <iostream>\n#include <cassert>\nstruct Guard { int& released; ~Guard() { ++released; } };\nint solve() {\n  int released = 0;\n  { Guard guard{released}; }\n  return released;\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\nstruct Guard { int& released; ~Guard() { ++released; } };\nint solve() {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\nint main() {\n  assert(solve() == 1);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\nstruct Guard { int& released; ~Guard() { ++released; } };\nint solve() {\n  int released = 0;\n  { Guard guard{released}; }\n  return released;\n}\nint main() { std::cout << solve() << "\\n"; }',
        output: '1',
      },
      {
        key: 'destruction-order',
        title: 'Destroy locals in reverse order',
        definition:
          'Objects in a scope are destroyed in the reverse order their construction completed.',
        rule: 'Ensure a referenced dependency outlives the object using it.',
        violation:
          'Declare an owner after a borrower whose destructor needs that owner.',
        signature: 'int solve()',
        solution:
          '#include <iostream>\n#include <cassert>\nstruct Tracker { int& log; int digit; ~Tracker() { log = log * 10 + digit; } };\nint solve() {\n  int log = 0;\n  { Tracker first{log, 1}; Tracker second{log, 2}; }\n  return log;\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\nstruct Tracker { int& log; int digit; ~Tracker() { log = log * 10 + digit; } };\nint solve() {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\nint main() {\n  assert(solve() == 21);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\nstruct Tracker { int& log; int digit; ~Tracker() { log = log * 10 + digit; } };\nint solve() {\n  int log = 0;\n  { Tracker first{log, 1}; Tracker second{log, 2}; }\n  return log;\n}\nint main() { std::cout << solve() << "\\n"; }',
        output: '21',
      },
    ],
  },
  {
    key: 'members',
    title: 'Member functions and const',
    unit: 'cpp-ownership',
    atoms: [
      {
        key: 'member-functions',
        title: 'Call a member function on an object',
        definition:
          "A member function is declared inside a struct and called on one object as object.function(), reading and updating that object's members directly.",
        rule: 'Call the member function on the specific object whose state it should use.',
        violation:
          'Call add on one counter and expect a second counter to change too.',
        signature: 'int solve(int start, int amount)',
        solution:
          '#include <iostream>\n#include <cassert>\nstruct Counter {\n  int count;\n  void add(int amount) { count += amount; }\n};\nint solve(int start, int amount) {\n  Counter counter{start};\n  counter.add(amount);\n  counter.add(amount);\n  return counter.count;\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\nstruct Counter {\n  int count;\n  void add(int amount) { count += amount; }\n};\nint solve(int start, int amount) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\nint main() {\n  assert(solve(1, 3) == 7);\n  assert(solve(0, 0) == 0);\n  assert(solve(10, -4) == 2);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\nstruct Counter {\n  int count;\n  void add(int amount) { count += amount; }\n};\nint solve(int start, int amount) {\n  Counter counter{start};\n  counter.add(amount);\n  counter.add(amount);\n  return counter.count;\n}\nint main() { std::cout << solve(1, 3) << "\\n"; }',
        output: '7',
      },
      {
        key: 'const-member-functions',
        title: 'Mark read-only member functions const',
        definition:
          'A member function declared with const after its parameter list promises not to modify members, so it can be called on a const object.',
        rule: 'Mark every member function that only reads state as const.',
        violation:
          'Leave a read-only member function unmarked and then call it on a const object.',
        signature: 'int solve(int width, int height)',
        solution:
          '#include <iostream>\n#include <cassert>\nstruct Rect {\n  int width;\n  int height;\n  int area() const { return width * height; }\n};\nint solve(int width, int height) {\n  const Rect rect{width, height};\n  return rect.area();\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\nstruct Rect {\n  int width;\n  int height;\n  int area() const { return width * height; }\n};\nint solve(int width, int height) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\nint main() {\n  assert(solve(3, 4) == 12);\n  assert(solve(0, 9) == 0);\n  assert(solve(5, 5) == 25);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\nstruct Rect {\n  int width;\n  int height;\n  int area() const { return width * height; }\n};\nint solve(int width, int height) {\n  const Rect rect{width, height};\n  return rect.area();\n}\nint main() { std::cout << solve(3, 4) << "\\n"; }',
        output: '12',
      },
      {
        key: 'const-correctness',
        title: 'Read objects through const references',
        definition:
          'Through a const T& parameter a function can call only const member functions, so read-only access needs const accessors.',
        rule: 'Take objects the function only reads as const T&, mark their accessors const, and use T& only when the function must change the object.',
        violation:
          'Drop const from a getter so that it compiles, then pass every object by non-const reference.',
        signature: 'bool solve(const Tally& tally, int goal)',
        solution:
          '#include <iostream>\n#include <cassert>\nstruct Tally {\n  int total;\n  void add(int amount) { total += amount; }\n  int value() const { return total; }\n};\nbool solve(const Tally& tally, int goal) {\n  return tally.value() >= goal;\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\nstruct Tally {\n  int total;\n  void add(int amount) { total += amount; }\n  int value() const { return total; }\n};\nbool solve(const Tally& tally, int goal) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\nint main() {\n  Tally tally{0};\n  tally.add(5);\n  tally.add(3);\n  assert(solve(tally, 8) == true);\n  assert(solve(tally, 9) == false);\n  assert(tally.value() == 8);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\nstruct Tally {\n  int total;\n  void add(int amount) { total += amount; }\n  int value() const { return total; }\n};\nbool solve(const Tally& tally, int goal) {\n  return tally.value() >= goal;\n}\nint main() {\n  Tally tally{0};\n  tally.add(5);\n  tally.add(3);\n  std::cout << solve(tally, 8) << "\\n";\n}',
        output: '1',
      },
      {
        key: 'private-invariant',
        title: 'Protect an invariant with private members',
        definition:
          "Members declared private can be changed only by the class's own member functions, so those functions can keep an invariant true.",
        rule: 'Make state private when every change must pass a check, and expose it through const accessors.',
        violation:
          'Leave a capped level public so callers can assign values above the cap.',
        signature: 'int solve(int cap, int first, int second)',
        solution:
          '#include <iostream>\n#include <cassert>\nclass Gauge {\n public:\n  explicit Gauge(int cap) : cap_(cap), level_(0) {}\n  void add(int amount) {\n    level_ += amount;\n    if (level_ > cap_) level_ = cap_;\n  }\n  int level() const { return level_; }\n\n private:\n  int cap_;\n  int level_;\n};\nint solve(int cap, int first, int second) {\n  Gauge gauge(cap);\n  gauge.add(first);\n  gauge.add(second);\n  return gauge.level();\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\nclass Gauge {\n public:\n  explicit Gauge(int cap) : cap_(cap), level_(0) {}\n  void add(int amount) {\n    level_ += amount;\n    if (level_ > cap_) level_ = cap_;\n  }\n  int level() const { return level_; }\n\n private:\n  int cap_;\n  int level_;\n};\nint solve(int cap, int first, int second) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\nint main() {\n  assert(solve(10, 4, 3) == 7);\n  assert(solve(10, 8, 5) == 10);\n  assert(solve(5, 0, 0) == 0);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\nclass Gauge {\n public:\n  explicit Gauge(int cap) : cap_(cap), level_(0) {}\n  void add(int amount) {\n    level_ += amount;\n    if (level_ > cap_) level_ = cap_;\n  }\n  int level() const { return level_; }\n\n private:\n  int cap_;\n  int level_;\n};\nint solve(int cap, int first, int second) {\n  Gauge gauge(cap);\n  gauge.add(first);\n  gauge.add(second);\n  return gauge.level();\n}\nint main() { std::cout << solve(10, 8, 5) << "\\n"; }',
        output: '10',
      },
    ],
  },
  {
    key: 'raii',
    title: 'RAII and resource scopes',
    unit: 'cpp-ownership',
    atoms: [
      {
        key: 'scope-resource',
        title: 'Acquire and release one resource',
        definition:
          'RAII ties resource ownership to an object lifetime so release follows scope exit.',
        rule: 'Acquire only after you can represent ownership and release exactly once.',
        violation:
          'Release the same owned resource from two independent owners.',
        signature: 'int solve(int value)',
        solution:
          '#include <iostream>\n#include <cassert>\nstruct Lease { int& count; explicit Lease(int& c) : count(c) { ++count; } ~Lease() { --count; } };\nint solve(int value) {\n  int active = 0;\n  { Lease lease(active); if (value > 0) return active; }\n  return active;\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\nstruct Lease { int& count; explicit Lease(int& c) : count(c) { ++count; } ~Lease() { --count; } };\nint solve(int value) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\nint main() {\n  assert(solve(1) == 1);\n  assert(solve(0) == 0);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\nstruct Lease { int& count; explicit Lease(int& c) : count(c) { ++count; } ~Lease() { --count; } };\nint solve(int value) {\n  int active = 0;\n  { Lease lease(active); if (value > 0) return active; }\n  return active;\n}\nint main() { std::cout << solve(1) << "\\n"; }',
        output: '1',
      },
      {
        key: 'exception-cleanup',
        title: 'Release during stack unwinding',
        definition:
          'Stack unwinding destroys completed automatic objects while an exception leaves their scopes.',
        rule: 'Use destructors that do not throw during cleanup.',
        violation:
          'Throw a second exception from a destructor during active unwinding.',
        signature: 'int solve()',
        solution:
          '#include <iostream>\n#include <cassert>\n#include <stdexcept>\nstruct Lease { int& count; explicit Lease(int& c) : count(c) { ++count; } ~Lease() { --count; } };\nint solve() {\n  int active = 0;\n  try { Lease lease(active); throw std::runtime_error("stop"); }\n  catch (const std::runtime_error&) {}\n  return active + 1;\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\n#include <stdexcept>\nstruct Lease { int& count; explicit Lease(int& c) : count(c) { ++count; } ~Lease() { --count; } };\nint solve() {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\n#include <stdexcept>\nint main() {\n  assert(solve() == 1);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\n#include <stdexcept>\nstruct Lease { int& count; explicit Lease(int& c) : count(c) { ++count; } ~Lease() { --count; } };\nint solve() {\n  int active = 0;\n  try { Lease lease(active); throw std::runtime_error("stop"); }\n  catch (const std::runtime_error&) {}\n  return active + 1;\n}\nint main() { std::cout << solve() << "\\n"; }',
        output: '1',
      },
      {
        key: 'noncopy-owner',
        title: 'Disable duplicate ownership',
        definition:
          'Deleting copy operations prevents a resource owner from accidentally copying its release responsibility.',
        rule: 'Make exclusive resource owners non-copyable or define a deliberate ownership transfer.',
        violation:
          'Allow default copying of a raw owning handle with one release action.',
        signature: 'bool solve()',
        solution:
          '#include <iostream>\n#include <cassert>\n#include <type_traits>\nstruct Owner { Owner() = default; Owner(const Owner&) = delete; Owner& operator=(const Owner&) = delete; };\nbool solve() {\n  return !std::is_copy_constructible_v<Owner> && !std::is_copy_assignable_v<Owner>;\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\n#include <type_traits>\nstruct Owner { Owner() = default; Owner(const Owner&) = delete; Owner& operator=(const Owner&) = delete; };\nbool solve() {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\n#include <type_traits>\nint main() {\n  assert(solve() == true);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\n#include <type_traits>\nstruct Owner { Owner() = default; Owner(const Owner&) = delete; Owner& operator=(const Owner&) = delete; };\nbool solve() {\n  return !std::is_copy_constructible_v<Owner> && !std::is_copy_assignable_v<Owner>;\n}\nint main() { std::cout << solve() << "\\n"; }',
        output: '1',
      },
      {
        key: 'scope-restoration',
        title: 'Restore a temporary change',
        definition:
          'A scope guard can restore an invariant on every scope-exit path.',
        rule: 'Save the prior value and restore it once at scope exit.',
        violation: 'Restore a fixed default instead of the actual prior value.',
        signature: 'int solve(int original)',
        solution:
          '#include <iostream>\n#include <cassert>\nstruct Restore { int& destination; int old; ~Restore() { destination = old; } };\nint solve(int original) {\n  int state = original;\n  { Restore restore{state, state}; state = 99; }\n  return state;\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\nstruct Restore { int& destination; int old; ~Restore() { destination = old; } };\nint solve(int original) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\nint main() {\n  assert(solve(5) == 5);\n  assert(solve(-4) == -4);\n  assert(solve(0) == 0);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\nstruct Restore { int& destination; int old; ~Restore() { destination = old; } };\nint solve(int original) {\n  int state = original;\n  { Restore restore{state, state}; state = 99; }\n  return state;\n}\nint main() { std::cout << solve(5) << "\\n"; }',
        output: '5',
      },
    ],
  },
  {
    key: 'smart-pointers',
    title: 'Owning smart pointers',
    unit: 'cpp-ownership',
    atoms: [
      {
        key: 'unique-allocation',
        title: 'Create a unique owner',
        definition:
          'std::make_unique creates an object managed by one std::unique_ptr owner.',
        rule: 'Use make_unique instead of exposing a raw owning new expression.',
        violation:
          'Store an owning new result in a borrowed raw pointer and forget deletion.',
        signature: 'int solve(int value)',
        solution:
          '#include <iostream>\n#include <cassert>\n#include <memory>\nint solve(int value) {\n  auto owner = std::make_unique<int>(value);\n  return *owner;\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\n#include <memory>\nint solve(int value) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\n#include <memory>\nint main() {\n  assert(solve(12) == 12);\n  assert(solve(-5) == -5);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\n#include <memory>\nint solve(int value) {\n  auto owner = std::make_unique<int>(value);\n  return *owner;\n}\nint main() { std::cout << solve(12) << "\\n"; }',
        output: '12',
      },
      {
        key: 'unique-transfer',
        title: 'Transfer exclusive ownership',
        definition:
          'Moving a unique_ptr transfers its owned pointer and leaves the source empty.',
        rule: 'Use std::move for an intentional ownership transfer.',
        violation: 'Dereference the emptied source unique_ptr after transfer.',
        signature: 'int solve(int value)',
        solution:
          '#include <iostream>\n#include <cassert>\n#include <memory>\n#include <utility>\nint solve(int value) {\n  auto first = std::make_unique<int>(value);\n  auto second = std::move(first);\n  return first == nullptr ? *second : -1;\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\n#include <memory>\n#include <utility>\nint solve(int value) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\n#include <memory>\n#include <utility>\nint main() {\n  assert(solve(7) == 7);\n  assert(solve(2) == 2);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\n#include <memory>\n#include <utility>\nint solve(int value) {\n  auto first = std::make_unique<int>(value);\n  auto second = std::move(first);\n  return first == nullptr ? *second : -1;\n}\nint main() { std::cout << solve(7) << "\\n"; }',
        output: '7',
      },
      {
        key: 'shared-ownership',
        title: 'Share an object lifetime',
        definition:
          'std::shared_ptr keeps an object alive while at least one owning shared_ptr remains.',
        rule: 'Use shared ownership only when multiple owners must independently extend lifetime.',
        violation:
          'Use shared_ptr merely to avoid deciding which component owns the object.',
        signature: 'int solve(int value)',
        solution:
          '#include <iostream>\n#include <cassert>\n#include <memory>\nint solve(int value) {\n  auto first = std::make_shared<int>(value);\n  auto second = first;\n  *second += 2;\n  return *first;\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\n#include <memory>\nint solve(int value) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\n#include <memory>\nint main() {\n  assert(solve(3) == 5);\n  assert(solve(-2) == 0);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\n#include <memory>\nint solve(int value) {\n  auto first = std::make_shared<int>(value);\n  auto second = first;\n  *second += 2;\n  return *first;\n}\nint main() { std::cout << solve(3) << "\\n"; }',
        output: '5',
      },
      {
        key: 'weak-observation',
        title: 'Observe with a weak pointer',
        definition:
          'A weak_ptr observes a shared object without extending its lifetime; lock returns a temporary shared owner if it still exists.',
        rule: 'Lock once and retain that shared_ptr while accessing the object.',
        violation:
          'Check expired and later dereference without obtaining ownership.',
        signature: 'bool solve(bool retain)',
        solution:
          '#include <iostream>\n#include <cassert>\n#include <memory>\nbool solve(bool retain) {\n  auto owner = std::make_shared<int>(5);\n  std::weak_ptr<int> weak = owner;\n  if (!retain) owner.reset();\n  return static_cast<bool>(weak.lock());\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\n#include <memory>\nbool solve(bool retain) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\n#include <memory>\nint main() {\n  assert(solve(true) == true);\n  assert(solve(false) == false);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\n#include <memory>\nbool solve(bool retain) {\n  auto owner = std::make_shared<int>(5);\n  std::weak_ptr<int> weak = owner;\n  if (!retain) owner.reset();\n  return static_cast<bool>(weak.lock());\n}\nint main() { std::cout << solve(true) << "\\n"; }',
        output: '1',
      },
    ],
  },
  {
    key: 'move',
    title: 'Move semantics and value categories',
    unit: 'cpp-ownership',
    atoms: [
      {
        key: 'lvalue-rvalue',
        title: 'Select a value-category overload',
        definition:
          'An lvalue names an existing object; a temporary can bind to an rvalue-reference overload.',
        rule: 'Distinguish the expression category from the declared reference type.',
        violation:
          'Treat a named T&& variable as an rvalue without an explicit cast.',
        signature: 'int solve()',
        solution:
          '#include <iostream>\n#include <cassert>\nint category(int&) { return 1; }\nint category(int&&) { return 2; }\nint solve() {\n  int value = 4;\n  return category(value) * 10 + category(8);\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\nint category(int&) { return 1; }\nint category(int&&) { return 2; }\nint solve() {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\nint main() {\n  assert(solve() == 12);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\nint category(int&) { return 1; }\nint category(int&&) { return 2; }\nint solve() {\n  int value = 4;\n  return category(value) * 10 + category(8);\n}\nint main() { std::cout << solve() << "\\n"; }',
        output: '12',
      },
      {
        key: 'move-cast',
        title: 'Understand std::move',
        definition:
          'std::move is a cast that permits move-aware overload selection; the cast itself does not transfer bytes or ownership.',
        rule: 'Let the receiving operation perform the move; avoid reading unspecified moved-from values.',
        violation:
          'Assume every moved-from standard container is guaranteed to be empty.',
        signature: 'int solve(int value)',
        solution:
          '#include <iostream>\n#include <cassert>\n#include <utility>\nint category(const int&) { return 1; }\nint category(int&&) { return 2; }\nint solve(int value) {\n  return category(std::move(value));\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\n#include <utility>\nint category(const int&) { return 1; }\nint category(int&&) { return 2; }\nint solve(int value) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\n#include <utility>\nint main() {\n  assert(solve(4) == 2);\n  assert(solve(-1) == 2);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\n#include <utility>\nint category(const int&) { return 1; }\nint category(int&&) { return 2; }\nint solve(int value) {\n  return category(std::move(value));\n}\nint main() { std::cout << solve(4) << "\\n"; }',
        output: '2',
      },
      {
        key: 'move-member',
        title: 'Move an owned member',
        definition:
          'A move constructor can transfer a unique_ptr member into a new object.',
        rule: 'Transfer every exclusive resource and leave the source destructible.',
        violation:
          'Give both source and destination ownership of the same raw allocation.',
        signature: 'int solve(int value)',
        solution:
          '#include <iostream>\n#include <cassert>\n#include <memory>\n#include <utility>\nstruct Box { std::unique_ptr<int> data; explicit Box(int x) : data(std::make_unique<int>(x)) {} Box(Box&& other) : data(std::move(other.data)) {} };\nint solve(int value) {\n  Box source(value);\n  Box destination(std::move(source));\n  return source.data ? -1 : *destination.data;\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\n#include <memory>\n#include <utility>\nstruct Box { std::unique_ptr<int> data; explicit Box(int x) : data(std::make_unique<int>(x)) {} Box(Box&& other) : data(std::move(other.data)) {} };\nint solve(int value) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\n#include <memory>\n#include <utility>\nint main() {\n  assert(solve(9) == 9);\n  assert(solve(3) == 3);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\n#include <memory>\n#include <utility>\nstruct Box { std::unique_ptr<int> data; explicit Box(int x) : data(std::make_unique<int>(x)) {} Box(Box&& other) : data(std::move(other.data)) {} };\nint solve(int value) {\n  Box source(value);\n  Box destination(std::move(source));\n  return source.data ? -1 : *destination.data;\n}\nint main() { std::cout << solve(9) << "\\n"; }',
        output: '9',
      },
      {
        key: 'noexcept-move',
        title: 'Mark a nonthrowing move',
        definition:
          'A truthful noexcept move contract allows generic code to select move operations without risking a thrown exception.',
        rule: 'Mark a move noexcept only when its operations really cannot throw.',
        violation:
          'Declare noexcept while deliberately throwing from the move operation.',
        signature: 'bool solve()',
        solution:
          '#include <iostream>\n#include <cassert>\n#include <memory>\n#include <type_traits>\nstruct Box { std::unique_ptr<int> value; Box() = default; Box(Box&&) noexcept = default; };\nbool solve() {\n  return std::is_nothrow_move_constructible_v<Box>;\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\n#include <memory>\n#include <type_traits>\nstruct Box { std::unique_ptr<int> value; Box() = default; Box(Box&&) noexcept = default; };\nbool solve() {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\n#include <memory>\n#include <type_traits>\nint main() {\n  assert(solve() == true);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\n#include <memory>\n#include <type_traits>\nstruct Box { std::unique_ptr<int> value; Box() = default; Box(Box&&) noexcept = default; };\nbool solve() {\n  return std::is_nothrow_move_constructible_v<Box>;\n}\nint main() { std::cout << solve() << "\\n"; }',
        output: '1',
      },
    ],
  },
  {
    key: 'value-semantics',
    title: 'Copying and the rule of zero',
    unit: 'cpp-ownership',
    atoms: [
      {
        key: 'independent-copy',
        title: 'Copy independent container values',
        definition:
          'Copying std::vector copies its element values into independently owned storage.',
        rule: 'Use value containers when independent object values are intended.',
        violation:
          'Assume mutation of one copied vector should alter the other.',
        signature: 'int solve(int value)',
        solution:
          '#include <iostream>\n#include <cassert>\n#include <vector>\nint solve(int value) {\n  std::vector<int> first{value};\n  auto second = first;\n  second[0] += 7;\n  return first[0];\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\n#include <vector>\nint solve(int value) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\n#include <vector>\nint main() {\n  assert(solve(5) == 5);\n  assert(solve(-2) == -2);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\n#include <vector>\nint solve(int value) {\n  std::vector<int> first{value};\n  auto second = first;\n  second[0] += 7;\n  return first[0];\n}\nint main() { std::cout << solve(5) << "\\n"; }',
        output: '5',
      },
      {
        key: 'rule-zero',
        title: 'Delegate ownership to value members',
        definition:
          'The rule of zero lets owning standard-library members implement copying, moving, and destruction for your class.',
        rule: 'Let value members own resources whenever their semantics fit the class.',
        violation:
          'Add manual delete to a class whose vector already owns its storage.',
        signature: 'int solve(int value)',
        solution:
          '#include <iostream>\n#include <cassert>\n#include <vector>\nstruct Record { std::vector<int> values; };\nint solve(int value) {\n  Record first{{value, 2}};\n  Record second = first;\n  second.values[0] = 99;\n  return first.values[0];\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\n#include <vector>\nstruct Record { std::vector<int> values; };\nint solve(int value) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\n#include <vector>\nint main() {\n  assert(solve(7) == 7);\n  assert(solve(-3) == -3);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\n#include <vector>\nstruct Record { std::vector<int> values; };\nint solve(int value) {\n  Record first{{value, 2}};\n  Record second = first;\n  second.values[0] = 99;\n  return first.values[0];\n}\nint main() { std::cout << solve(7) << "\\n"; }',
        output: '7',
      },
      {
        key: 'copy-assignment',
        title: 'Assign a replacement value',
        definition:
          'Copy assignment replaces an existing object value while preserving value ownership semantics.',
        rule: 'Handle self-assignment safely by relying on sound member assignment.',
        violation:
          'Destroy owned state before reading the same state during self-assignment.',
        signature: 'int solve(int value)',
        solution:
          '#include <iostream>\n#include <cassert>\n#include <vector>\nint solve(int value) {\n  std::vector<int> values{value, 1};\n  const auto& alias = values;\n  values = alias;\n  return values.front();\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\n#include <vector>\nint solve(int value) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\n#include <vector>\nint main() {\n  assert(solve(8) == 8);\n  assert(solve(-4) == -4);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\n#include <vector>\nint solve(int value) {\n  std::vector<int> values{value, 1};\n  const auto& alias = values;\n  values = alias;\n  return values.front();\n}\nint main() { std::cout << solve(8) << "\\n"; }',
        output: '8',
      },
      {
        key: 'swap-values',
        title: 'Swap whole values',
        definition:
          'std::swap exchanges two values; standard containers support efficient ownership exchange.',
        rule: 'Swap complete invariant-preserving objects rather than partial ownership fields.',
        violation:
          'Swap only a pointer while leaving its ownership metadata unchanged.',
        signature: 'int solve(int first, int second)',
        solution:
          '#include <iostream>\n#include <cassert>\n#include <vector>\nint solve(int first, int second) {\n  std::vector<int> left{first}, right{second};\n  left.swap(right);\n  return left.front();\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\n#include <vector>\nint solve(int first, int second) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\n#include <vector>\nint main() {\n  assert(solve(2, 9) == 9);\n  assert(solve(8, -3) == -3);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\n#include <vector>\nint solve(int first, int second) {\n  std::vector<int> left{first}, right{second};\n  left.swap(right);\n  return left.front();\n}\nint main() { std::cout << solve(2, 9) << "\\n"; }',
        output: '9',
      },
    ],
  },
  {
    key: 'strings',
    title: 'Owning strings and parsing',
    unit: 'cpp-sequences',
    atoms: [
      {
        key: 'string-size',
        title: 'Count owned characters',
        definition:
          'std::string stores a character sequence and owns its storage.',
        rule: 'Use size to count stored characters, including embedded zeros.',
        violation:
          'Use a C-string scan to infer an owning string stored length.',
        signature: 'int solve(const std::string& text)',
        solution:
          '#include <iostream>\n#include <cassert>\n#include <string>\nint solve(const std::string& text) {\n  return static_cast<int>(text.size());\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\n#include <string>\nint solve(const std::string& text) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\n#include <string>\nint main() {\n  assert(solve("hello") == 5);\n  assert(solve(std::string("a\\0b", 3)) == 3);\n  assert(solve("") == 0);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\n#include <string>\nint solve(const std::string& text) {\n  return static_cast<int>(text.size());\n}\nint main() { std::cout << solve("hello") << "\\n"; }',
        output: '5',
      },
      {
        key: 'string-append',
        title: 'Append characters',
        definition:
          'Appending to a string increases its stored sequence and can reallocate its storage.',
        rule: 'Refresh borrowed views after an operation that may reallocate.',
        violation:
          'Keep using a saved data pointer after a capacity-changing append.',
        signature: 'std::string solve(std::string text, char suffix)',
        solution:
          '#include <iostream>\n#include <cassert>\n#include <string>\nstd::string solve(std::string text, char suffix) {\n  text.push_back(suffix);\n  return text;\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\n#include <string>\nstd::string solve(std::string text, char suffix) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\n#include <string>\nint main() {\n  assert(solve("ab", \'c\') == std::string("abc"));\n  assert(solve("", \'x\') == std::string("x"));\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\n#include <string>\nstd::string solve(std::string text, char suffix) {\n  text.push_back(suffix);\n  return text;\n}\nint main() { std::cout << solve("ab", \'c\') << "\\n"; }',
        output: 'abc',
      },
      {
        key: 'string-find',
        title: 'Represent a missing substring',
        definition:
          'string::find returns npos when its search does not find a match.',
        rule: 'Compare the result with npos before treating it as an index.',
        violation: 'Index at the result even when it equals npos.',
        signature: 'int solve(const std::string& text, char needle)',
        solution:
          '#include <iostream>\n#include <cassert>\n#include <string>\nint solve(const std::string& text, char needle) {\n  auto position = text.find(needle);\n  return position == std::string::npos ? -1 : static_cast<int>(position);\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\n#include <string>\nint solve(const std::string& text, char needle) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\n#include <string>\nint main() {\n  assert(solve("abc", \'b\') == 1);\n  assert(solve("abc", \'z\') == -1);\n  assert(solve("", \'x\') == -1);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\n#include <string>\nint solve(const std::string& text, char needle) {\n  auto position = text.find(needle);\n  return position == std::string::npos ? -1 : static_cast<int>(position);\n}\nint main() { std::cout << solve("abc", \'b\') << "\\n"; }',
        output: '1',
      },
      {
        key: 'from-chars',
        title: 'Parse an integer without allocation',
        definition:
          'std::from_chars reports parsing success with an error code and a pointer to the first unparsed character.',
        rule: 'Accept only when the error code is clear and the entire input was consumed.',
        violation:
          'Accept a numeric prefix while silently ignoring trailing junk.',
        signature: 'int solve(std::string_view text)',
        solution:
          '#include <iostream>\n#include <cassert>\n#include <charconv>\n#include <string_view>\n#include <system_error>\nint solve(std::string_view text) {\n  int value = 0;\n  auto result = std::from_chars(text.data(), text.data() + text.size(), value);\n  if (result.ec != std::errc{} || result.ptr != text.data() + text.size()) return -999;\n  return value;\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\n#include <charconv>\n#include <string_view>\n#include <system_error>\nint solve(std::string_view text) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\n#include <charconv>\n#include <string_view>\n#include <system_error>\nint main() {\n  assert(solve("42") == 42);\n  assert(solve("-7") == -7);\n  assert(solve("12x") == -999);\n  assert(solve("") == -999);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\n#include <charconv>\n#include <string_view>\n#include <system_error>\nint solve(std::string_view text) {\n  int value = 0;\n  auto result = std::from_chars(text.data(), text.data() + text.size(), value);\n  if (result.ec != std::errc{} || result.ptr != text.data() + text.size()) return -999;\n  return value;\n}\nint main() { std::cout << solve("42") << "\\n"; }',
        output: '42',
      },
    ],
  },
  {
    key: 'vectors',
    title: 'Vectors and capacity',
    unit: 'cpp-sequences',
    atoms: [
      {
        key: 'vector-elements',
        title: 'Read a vector element',
        definition:
          'A vector owns a contiguous sequence indexed from zero through size minus one.',
        rule: 'Check index < size before indexing with operator[].',
        violation: 'Read values[size()] as the final element.',
        signature:
          'int solve(const std::vector<int>& values, std::size_t index)',
        solution:
          '#include <iostream>\n#include <cassert>\n#include <vector>\n#include <cstddef>\nint solve(const std::vector<int>& values, std::size_t index) {\n  return index < values.size() ? values[index] : -1;\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\n#include <vector>\n#include <cstddef>\nint solve(const std::vector<int>& values, std::size_t index) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\n#include <vector>\n#include <cstddef>\nint main() {\n  assert(solve({7, 4}, 1) == 4);\n  assert(solve({}, 0) == -1);\n  assert(solve({8}, 1) == -1);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\n#include <vector>\n#include <cstddef>\nint solve(const std::vector<int>& values, std::size_t index) {\n  return index < values.size() ? values[index] : -1;\n}\nint main() { std::cout << solve({7, 4}, 1) << "\\n"; }',
        output: '4',
      },
      {
        key: 'vector-push',
        title: 'Grow a vector with push_back',
        definition: 'push_back appends one element and increases size by one.',
        rule: 'Use size to describe constructed elements rather than capacity.',
        violation:
          'Index reserved but unconstructed capacity as if it contained elements.',
        signature: 'int solve(std::vector<int> values, int next)',
        solution:
          '#include <iostream>\n#include <cassert>\n#include <vector>\nint solve(std::vector<int> values, int next) {\n  values.push_back(next);\n  return static_cast<int>(values.size());\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\n#include <vector>\nint solve(std::vector<int> values, int next) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\n#include <vector>\nint main() {\n  assert(solve({1, 2}, 4) == 3);\n  assert(solve({}, 8) == 1);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\n#include <vector>\nint solve(std::vector<int> values, int next) {\n  values.push_back(next);\n  return static_cast<int>(values.size());\n}\nint main() { std::cout << solve({1, 2}, 4) << "\\n"; }',
        output: '3',
      },
      {
        key: 'vector-reserve',
        title: 'Reserve capacity without changing size',
        definition:
          'reserve requests storage capacity but does not construct new elements or change size.',
        rule: 'Append or resize before accessing elements in newly reserved storage.',
        violation: 'Write values[0] after reserve on an empty vector.',
        signature: 'int solve(std::size_t capacity)',
        solution:
          '#include <iostream>\n#include <cassert>\n#include <vector>\n#include <cstddef>\nint solve(std::size_t capacity) {\n  std::vector<int> values;\n  values.reserve(capacity);\n  return static_cast<int>(values.size());\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\n#include <vector>\n#include <cstddef>\nint solve(std::size_t capacity) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\n#include <vector>\n#include <cstddef>\nint main() {\n  assert(solve(20) == 0);\n  assert(solve(0) == 0);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\n#include <vector>\n#include <cstddef>\nint solve(std::size_t capacity) {\n  std::vector<int> values;\n  values.reserve(capacity);\n  return static_cast<int>(values.size());\n}\nint main() { std::cout << solve(20) << "\\n"; }',
        output: '0',
      },
      {
        key: 'vector-erase',
        title: 'Erase a selected value',
        definition:
          'Erasing a vector element shifts later elements and decreases its size.',
        rule: 'Check the position and refresh iterators at or after the erased element.',
        violation:
          'Use an iterator to a shifted element after an erase invalidated it.',
        signature: 'int solve(std::vector<int> values, std::size_t index)',
        solution:
          '#include <iostream>\n#include <cassert>\n#include <vector>\n#include <cstddef>\nint solve(std::vector<int> values, std::size_t index) {\n  if (index >= values.size()) return -1;\n  values.erase(values.begin() + static_cast<std::ptrdiff_t>(index));\n  int sum = 0;\n  for (int x : values) sum += x;\n  return sum;\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\n#include <vector>\n#include <cstddef>\nint solve(std::vector<int> values, std::size_t index) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\n#include <vector>\n#include <cstddef>\nint main() {\n  assert(solve({3, 7, 9}, 1) == 12);\n  assert(solve({5}, 0) == 0);\n  assert(solve({}, 0) == -1);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\n#include <vector>\n#include <cstddef>\nint solve(std::vector<int> values, std::size_t index) {\n  if (index >= values.size()) return -1;\n  values.erase(values.begin() + static_cast<std::ptrdiff_t>(index));\n  int sum = 0;\n  for (int x : values) sum += x;\n  return sum;\n}\nint main() { std::cout << solve({3, 7, 9}, 1) << "\\n"; }',
        output: '12',
      },
    ],
  },
  {
    key: 'iterators',
    title: 'Iterator ranges and invalidation',
    unit: 'cpp-sequences',
    atoms: [
      {
        key: 'iterator-range',
        title: 'Follow a half-open iterator range',
        definition:
          'The begin/end pair represents a half-open range; end is a sentinel past the final element.',
        rule: 'Test against end before dereferencing an iterator.',
        violation: 'Dereference end to read the last element.',
        signature: 'int solve(const std::vector<int>& values)',
        solution:
          '#include <iostream>\n#include <cassert>\n#include <vector>\nint solve(const std::vector<int>& values) {\n  int count = 0;\n  for (auto it = values.begin(); it != values.end(); ++it) ++count;\n  return count;\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\n#include <vector>\nint solve(const std::vector<int>& values) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\n#include <vector>\nint main() {\n  assert(solve({4, 5, 6}) == 3);\n  assert(solve({}) == 0);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\n#include <vector>\nint solve(const std::vector<int>& values) {\n  int count = 0;\n  for (auto it = values.begin(); it != values.end(); ++it) ++count;\n  return count;\n}\nint main() { std::cout << solve({4, 5, 6}) << "\\n"; }',
        output: '3',
      },
      {
        key: 'iterator-distance',
        title: 'Measure a range distance',
        definition:
          'std::distance returns how many increments separate two ordered iterators in the same range.',
        rule: 'Compute distance using iterators from the same valid range.',
        violation: 'Subtract unrelated container iterators to obtain an index.',
        signature: 'int solve(const std::vector<int>& values)',
        solution:
          '#include <iostream>\n#include <cassert>\n#include <vector>\n#include <iterator>\nint solve(const std::vector<int>& values) {\n  return static_cast<int>(std::distance(values.begin(), values.end()));\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\n#include <vector>\n#include <iterator>\nint solve(const std::vector<int>& values) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\n#include <vector>\n#include <iterator>\nint main() {\n  assert(solve({2, 3}) == 2);\n  assert(solve({}) == 0);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\n#include <vector>\n#include <iterator>\nint solve(const std::vector<int>& values) {\n  return static_cast<int>(std::distance(values.begin(), values.end()));\n}\nint main() { std::cout << solve({2, 3}) << "\\n"; }',
        output: '2',
      },
      {
        key: 'reallocation-invalidation',
        title: 'Reacquire after reallocation',
        definition:
          'A vector reallocation invalidates pointers, references, and iterators to its elements.',
        rule: 'Retain an index and reacquire the element after growth.',
        violation:
          'Dereference a saved pointer after the vector may have reallocated.',
        signature: 'int solve(int value)',
        solution:
          '#include <iostream>\n#include <cassert>\n#include <vector>\n#include <cstddef>\nint solve(int value) {\n  std::vector<int> values{value};\n  std::size_t index = 0;\n  for (int i = 0; i < 100; ++i) values.push_back(i);\n  return values[index];\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\n#include <vector>\n#include <cstddef>\nint solve(int value) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\n#include <vector>\n#include <cstddef>\nint main() {\n  assert(solve(7) == 7);\n  assert(solve(-2) == -2);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\n#include <vector>\n#include <cstddef>\nint solve(int value) {\n  std::vector<int> values{value};\n  std::size_t index = 0;\n  for (int i = 0; i < 100; ++i) values.push_back(i);\n  return values[index];\n}\nint main() { std::cout << solve(7) << "\\n"; }',
        output: '7',
      },
      {
        key: 'erase-loop',
        title: 'Erase while iterating safely',
        definition:
          'vector::erase returns the next valid iterator after the erased position.',
        rule: 'Assign the returned iterator when erasing and increment only when retaining an element.',
        violation: 'Increment the invalidated erased iterator.',
        signature: 'int solve(std::vector<int> values)',
        solution:
          '#include <iostream>\n#include <cassert>\n#include <vector>\nint solve(std::vector<int> values) {\n  for (auto it = values.begin(); it != values.end(); ) {\n    if (*it < 0) it = values.erase(it);\n    else ++it;\n  }\n  return static_cast<int>(values.size());\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\n#include <vector>\nint solve(std::vector<int> values) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\n#include <vector>\nint main() {\n  assert(solve({1, -2, -3, 4}) == 2);\n  assert(solve({-1, -1}) == 0);\n  assert(solve({}) == 0);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\n#include <vector>\nint solve(std::vector<int> values) {\n  for (auto it = values.begin(); it != values.end(); ) {\n    if (*it < 0) it = values.erase(it);\n    else ++it;\n  }\n  return static_cast<int>(values.size());\n}\nint main() { std::cout << solve({1, -2, -3, 4}) << "\\n"; }',
        output: '2',
      },
    ],
  },
  {
    key: 'pairs',
    title: 'Pairs and structured bindings',
    unit: 'cpp-sequences',
    atoms: [
      {
        key: 'pair-members',
        title: 'Group two values in a std::pair',
        definition:
          'std::pair<A, B> stores two values together: .first holds the A value and .second holds the B value.',
        rule: 'Build the pair in a fixed order and read its parts as p.first and p.second.',
        violation: 'Call p.first() as though first were a member function.',
        signature: 'std::pair<int, int> solve(int total, int divisor)',
        solution:
          '#include <iostream>\n#include <cassert>\n#include <utility>\nstd::pair<int, int> solve(int total, int divisor) {\n  return {total / divisor, total % divisor};\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\n#include <utility>\nstd::pair<int, int> solve(int total, int divisor) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\n#include <utility>\nint main() {\n  assert(solve(17, 5).first == 3);\n  assert(solve(17, 5).second == 2);\n  assert(solve(8, 4).first == 2);\n  assert(solve(8, 4).second == 0);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\n#include <utility>\nstd::pair<int, int> solve(int total, int divisor) {\n  return {total / divisor, total % divisor};\n}\nint main() {\n  std::pair<int, int> result = solve(17, 5);\n  std::cout << result.first << " " << result.second << "\\n";\n}',
        output: '3 2',
      },
      {
        key: 'pair-ordering',
        title: 'Compare pairs lexicographically',
        definition:
          'Pairs compare by .first, and only when the firsts are equal does .second decide; == requires both members to match.',
        rule: 'Put the primary key in .first and the tie-breaker in .second when pair order should decide.',
        violation:
          'Put the tie-breaking value in .first and the primary key in .second.',
        signature: 'bool solve(std::pair<int, int> a, std::pair<int, int> b)',
        solution:
          '#include <iostream>\n#include <cassert>\n#include <utility>\nbool solve(std::pair<int, int> a, std::pair<int, int> b) {\n  return a < b;\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\n#include <utility>\nbool solve(std::pair<int, int> a, std::pair<int, int> b) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\n#include <utility>\nint main() {\n  assert(solve({1, 9}, {2, 0}) == true);\n  assert(solve({2, 1}, {2, 5}) == true);\n  assert(solve({2, 5}, {2, 5}) == false);\n  assert(solve({3, 0}, {2, 9}) == false);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\n#include <utility>\nbool solve(std::pair<int, int> a, std::pair<int, int> b) {\n  return a < b;\n}\nint main() { std::cout << solve({2, 1}, {2, 5}) << "\\n"; }',
        output: '1',
      },
      {
        key: 'structured-bindings',
        title: 'Unpack a pair with structured bindings',
        definition:
          'auto [a, b] = p; declares a and b as copies of p.first and p.second, while auto& [a, b] = p; makes them refer to the members.',
        rule: 'Unpack with auto& when the names must update the pair, and with plain auto for independent copies.',
        violation:
          'Unpack with plain auto and expect writes to reach the original pair.',
        signature: 'int solve(std::pair<int, int> range)',
        solution:
          '#include <iostream>\n#include <cassert>\n#include <utility>\nint solve(std::pair<int, int> range) {\n  auto [low, high] = range;\n  return high - low;\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\n#include <utility>\nint solve(std::pair<int, int> range) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\n#include <utility>\nint main() {\n  assert(solve({3, 10}) == 7);\n  assert(solve({-2, 2}) == 4);\n  assert(solve({5, 5}) == 0);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\n#include <utility>\nint solve(std::pair<int, int> range) {\n  auto [low, high] = range;\n  return high - low;\n}\nint main() { std::cout << solve({3, 10}) << "\\n"; }',
        output: '7',
      },
      {
        key: 'pair-results',
        title: 'Return two results as a pair',
        definition:
          'A function can return a std::pair to report two related results, and the caller can name both with structured bindings.',
        rule: 'Return {low, high} as a pair and unpack it at the call site in the same order.',
        violation:
          'Unpack the returned pair in a different order from the one the function used to build it.',
        signature: 'std::pair<int, int> solve(std::array<int, 4> values)',
        solution:
          '#include <iostream>\n#include <cassert>\n#include <array>\n#include <utility>\nstd::pair<int, int> solve(std::array<int, 4> values) {\n  int low = values[0];\n  int high = values[0];\n  for (int x : values) {\n    if (x < low) low = x;\n    if (x > high) high = x;\n  }\n  return {low, high};\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\n#include <array>\n#include <utility>\nstd::pair<int, int> solve(std::array<int, 4> values) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\n#include <array>\n#include <utility>\nint main() {\n  assert((solve({3, 9, -2, 5}) == std::pair<int, int>(-2, 9)));\n  assert((solve({4, 4, 4, 4}) == std::pair<int, int>(4, 4)));\n  assert((solve({0, -1, 7, 2}) == std::pair<int, int>(-1, 7)));\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\n#include <array>\n#include <utility>\nstd::pair<int, int> solve(std::array<int, 4> values) {\n  int low = values[0];\n  int high = values[0];\n  for (int x : values) {\n    if (x < low) low = x;\n    if (x > high) high = x;\n  }\n  return {low, high};\n}\nint main() {\n  auto [low, high] = solve({3, 9, -2, 5});\n  std::cout << low << " " << high << "\\n";\n}',
        output: '-2 9',
      },
    ],
  },
  {
    key: 'maps',
    title: 'Associative mappings',
    unit: 'cpp-containers',
    atoms: [
      {
        key: 'map-find',
        title: 'Look up without inserting',
        definition:
          'map::find searches for a key without inserting a missing entry.',
        rule: 'Compare the lookup iterator to end before dereferencing.',
        violation: 'Dereference a missing lookup result.',
        signature: 'int solve(const std::map<int, int>& values, int key)',
        solution:
          '#include <iostream>\n#include <cassert>\n#include <map>\nint solve(const std::map<int, int>& values, int key) {\n  auto it = values.find(key);\n  return it == values.end() ? -1 : it->second;\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\n#include <map>\nint solve(const std::map<int, int>& values, int key) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\n#include <map>\nint main() {\n  assert(solve({{2, 7}, {5, 9}}, 2) == 7);\n  assert(solve({}, 8) == -1);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\n#include <map>\nint solve(const std::map<int, int>& values, int key) {\n  auto it = values.find(key);\n  return it == values.end() ? -1 : it->second;\n}\nint main() { std::cout << solve({{2, 7}, {5, 9}}, 2) << "\\n"; }',
        output: '7',
      },
      {
        key: 'map-insert',
        title: 'Insert a unique key',
        definition:
          'map::emplace reports whether a key was inserted; an existing key retains its mapped value.',
        rule: 'Use the insertion boolean when duplicate handling matters.',
        violation:
          'Assume insertion succeeded merely because a key now exists.',
        signature: 'int solve(int initial, int replacement)',
        solution:
          '#include <iostream>\n#include <cassert>\n#include <map>\nint solve(int initial, int replacement) {\n  std::map<int, int> values;\n  values.emplace(1, initial);\n  values.emplace(1, replacement);\n  return values.find(1)->second;\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\n#include <map>\nint solve(int initial, int replacement) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\n#include <map>\nint main() {\n  assert(solve(4, 9) == 4);\n  assert(solve(-2, 5) == -2);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\n#include <map>\nint solve(int initial, int replacement) {\n  std::map<int, int> values;\n  values.emplace(1, initial);\n  values.emplace(1, replacement);\n  return values.find(1)->second;\n}\nint main() { std::cout << solve(4, 9) << "\\n"; }',
        output: '4',
      },
      {
        key: 'unordered-frequency',
        title: 'Count with a hash mapping',
        definition:
          'unordered_map supports keyed lookup with average constant-time complexity but does not maintain sorted key order.',
        rule: 'Avoid relying on hash-table iteration order for a deterministic result.',
        violation:
          'Choose the smallest key by taking the first unordered_map element.',
        signature: 'int solve(const std::vector<int>& values, int key)',
        solution:
          '#include <iostream>\n#include <cassert>\n#include <unordered_map>\n#include <vector>\nint solve(const std::vector<int>& values, int key) {\n  std::unordered_map<int, int> counts;\n  for (int value : values) ++counts[value];\n  auto it = counts.find(key);\n  return it == counts.end() ? 0 : it->second;\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\n#include <unordered_map>\n#include <vector>\nint solve(const std::vector<int>& values, int key) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\n#include <unordered_map>\n#include <vector>\nint main() {\n  assert(solve({2, 3, 2, 2}, 2) == 3);\n  assert(solve({}, 8) == 0);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\n#include <unordered_map>\n#include <vector>\nint solve(const std::vector<int>& values, int key) {\n  std::unordered_map<int, int> counts;\n  for (int value : values) ++counts[value];\n  auto it = counts.find(key);\n  return it == counts.end() ? 0 : it->second;\n}\nint main() { std::cout << solve({2, 3, 2, 2}, 2) << "\\n"; }',
        output: '3',
      },
      {
        key: 'ordered-levels',
        title: 'Select an ordered map boundary',
        definition:
          'std::map orders unique keys and exposes the first ordered entry at begin.',
        rule: 'Check emptiness before reading begin.',
        violation: 'Read begin on an empty map.',
        signature: 'int solve(const std::map<int, int>& levels)',
        solution:
          '#include <iostream>\n#include <cassert>\n#include <map>\nint solve(const std::map<int, int>& levels) {\n  return levels.empty() ? -1 : levels.begin()->first;\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\n#include <map>\nint solve(const std::map<int, int>& levels) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\n#include <map>\nint main() {\n  assert(solve({{105, 8}, {101, 2}}) == 101);\n  assert(solve({}) == -1);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\n#include <map>\nint solve(const std::map<int, int>& levels) {\n  return levels.empty() ? -1 : levels.begin()->first;\n}\nint main() { std::cout << solve({{105, 8}, {101, 2}}) << "\\n"; }',
        output: '101',
      },
    ],
  },
  {
    key: 'sets',
    title: 'Sets and priority queues',
    unit: 'cpp-containers',
    atoms: [
      {
        key: 'set-membership',
        title: 'Represent unique membership',
        definition: 'A std::set stores each distinct key at most once.',
        rule: 'Use a set when duplicate identity should collapse.',
        violation: 'Use set size as the count of all repeated events.',
        signature: 'int solve(const std::vector<int>& values)',
        solution:
          '#include <iostream>\n#include <cassert>\n#include <set>\n#include <vector>\nint solve(const std::vector<int>& values) {\n  std::set<int> unique(values.begin(), values.end());\n  return static_cast<int>(unique.size());\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\n#include <set>\n#include <vector>\nint solve(const std::vector<int>& values) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\n#include <set>\n#include <vector>\nint main() {\n  assert(solve({2, 2, 3, 4, 3}) == 3);\n  assert(solve({}) == 0);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\n#include <set>\n#include <vector>\nint solve(const std::vector<int>& values) {\n  std::set<int> unique(values.begin(), values.end());\n  return static_cast<int>(unique.size());\n}\nint main() { std::cout << solve({2, 2, 3, 4, 3}) << "\\n"; }',
        output: '3',
      },
      {
        key: 'set-lower-bound',
        title: 'Find the first qualifying key',
        definition:
          'set::lower_bound returns the first key that is not less than the target.',
        rule: 'Handle end when no qualifying key exists.',
        violation:
          'Dereference lower_bound without considering the all-smaller case.',
        signature: 'int solve(const std::set<int>& values, int target)',
        solution:
          '#include <iostream>\n#include <cassert>\n#include <set>\nint solve(const std::set<int>& values, int target) {\n  auto it = values.lower_bound(target);\n  return it == values.end() ? -1 : *it;\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\n#include <set>\nint solve(const std::set<int>& values, int target) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\n#include <set>\nint main() {\n  assert(solve({3, 8, 12}, 8) == 8);\n  assert(solve({3, 8, 12}, 9) == 12);\n  assert(solve({3}, 4) == -1);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\n#include <set>\nint solve(const std::set<int>& values, int target) {\n  auto it = values.lower_bound(target);\n  return it == values.end() ? -1 : *it;\n}\nint main() { std::cout << solve({3, 8, 12}, 8) << "\\n"; }',
        output: '8',
      },
      {
        key: 'heap-top',
        title: 'Read the largest heap value',
        definition:
          'The default priority_queue exposes its largest element at top.',
        rule: 'Check empty before top or pop.',
        violation: 'Read top when the queue has no elements.',
        signature: 'int solve(const std::vector<int>& values)',
        solution:
          '#include <iostream>\n#include <cassert>\n#include <queue>\n#include <vector>\nint solve(const std::vector<int>& values) {\n  std::priority_queue<int> heap(values.begin(), values.end());\n  return heap.empty() ? -1 : heap.top();\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\n#include <queue>\n#include <vector>\nint solve(const std::vector<int>& values) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\n#include <queue>\n#include <vector>\nint main() {\n  assert(solve({4, 9, 2}) == 9);\n  assert(solve({}) == -1);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\n#include <queue>\n#include <vector>\nint solve(const std::vector<int>& values) {\n  std::priority_queue<int> heap(values.begin(), values.end());\n  return heap.empty() ? -1 : heap.top();\n}\nint main() { std::cout << solve({4, 9, 2}) << "\\n"; }',
        output: '9',
      },
      {
        key: 'min-heap',
        title: 'Order a min heap',
        definition:
          'Using std::greater as a priority_queue comparator places the smallest value at top.',
        rule: 'Choose the comparator that matches the priority contract.',
        violation: 'Use the largest-first heap for an earliest-deadline queue.',
        signature: 'int solve(const std::vector<int>& values)',
        solution:
          '#include <iostream>\n#include <cassert>\n#include <queue>\n#include <vector>\n#include <functional>\nint solve(const std::vector<int>& values) {\n  std::priority_queue<int, std::vector<int>, std::greater<int>> heap(values.begin(), values.end());\n  return heap.empty() ? -1 : heap.top();\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\n#include <queue>\n#include <vector>\n#include <functional>\nint solve(const std::vector<int>& values) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\n#include <queue>\n#include <vector>\n#include <functional>\nint main() {\n  assert(solve({4, 9, 2}) == 2);\n  assert(solve({}) == -1);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\n#include <queue>\n#include <vector>\n#include <functional>\nint solve(const std::vector<int>& values) {\n  std::priority_queue<int, std::vector<int>, std::greater<int>> heap(values.begin(), values.end());\n  return heap.empty() ? -1 : heap.top();\n}\nint main() { std::cout << solve({4, 9, 2}) << "\\n"; }',
        output: '2',
      },
    ],
  },
  {
    key: 'algorithms',
    title: 'Standard algorithms',
    unit: 'cpp-generic',
    atoms: [
      {
        key: 'sort-order',
        title: 'Sort a sequence',
        definition:
          'std::sort rearranges a random-access range according to a strict weak ordering.',
        rule: 'Use a strict comparator such as <, never <=.',
        violation: 'Use <= so an element compares less than itself.',
        signature: 'int solve(std::vector<int> values)',
        solution:
          '#include <iostream>\n#include <cassert>\n#include <vector>\n#include <algorithm>\nint solve(std::vector<int> values) {\n  if (values.empty()) return -1;\n  std::sort(values.begin(), values.end());\n  return values.front();\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\n#include <vector>\n#include <algorithm>\nint solve(std::vector<int> values) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\n#include <vector>\n#include <algorithm>\nint main() {\n  assert(solve({9, 2, 4}) == 2);\n  assert(solve({2, 2}) == 2);\n  assert(solve({}) == -1);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\n#include <vector>\n#include <algorithm>\nint solve(std::vector<int> values) {\n  if (values.empty()) return -1;\n  std::sort(values.begin(), values.end());\n  return values.front();\n}\nint main() { std::cout << solve({9, 2, 4}) << "\\n"; }',
        output: '2',
      },
      {
        key: 'binary-search',
        title: 'Search a sorted range',
        definition:
          'binary_search requires a range sorted under the same comparison used for the search.',
        rule: 'Sort using the search comparator before binary search.',
        violation:
          'Search an unsorted sequence and interpret any result as reliable.',
        signature: 'bool solve(std::vector<int> values, int target)',
        solution:
          '#include <iostream>\n#include <cassert>\n#include <vector>\n#include <algorithm>\nbool solve(std::vector<int> values, int target) {\n  std::sort(values.begin(), values.end());\n  return std::binary_search(values.begin(), values.end(), target);\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\n#include <vector>\n#include <algorithm>\nbool solve(std::vector<int> values, int target) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\n#include <vector>\n#include <algorithm>\nint main() {\n  assert(solve({9, 2, 4}, 4) == true);\n  assert(solve({9, 2}, 4) == false);\n  assert(solve({}, 2) == false);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\n#include <vector>\n#include <algorithm>\nbool solve(std::vector<int> values, int target) {\n  std::sort(values.begin(), values.end());\n  return std::binary_search(values.begin(), values.end(), target);\n}\nint main() { std::cout << solve({9, 2, 4}, 4) << "\\n"; }',
        output: '1',
      },
      {
        key: 'accumulate-seed',
        title: 'Choose an accumulation seed',
        definition:
          'std::accumulate uses the initial value type for the running result.',
        rule: 'Choose a wide seed before summing quantities that exceed int range.',
        violation:
          'Use an int zero seed and expect a long long assignment afterward to repair overflow.',
        signature: 'long long solve(const std::vector<int>& values)',
        solution:
          '#include <iostream>\n#include <cassert>\n#include <vector>\n#include <numeric>\nlong long solve(const std::vector<int>& values) {\n  return std::accumulate(values.begin(), values.end(), 0LL);\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\n#include <vector>\n#include <numeric>\nlong long solve(const std::vector<int>& values) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\n#include <vector>\n#include <numeric>\nint main() {\n  assert(solve({2000000000, 2000000000}) == 4000000000LL);\n  assert(solve({}) == 0LL);\n  assert(solve({-3, 8}) == 5LL);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\n#include <vector>\n#include <numeric>\nlong long solve(const std::vector<int>& values) {\n  return std::accumulate(values.begin(), values.end(), 0LL);\n}\nint main() { std::cout << solve({2000000000, 2000000000}) << "\\n"; }',
        output: '4000000000',
      },
      {
        key: 'remove-erase',
        title: 'Remove values with erase-remove',
        definition:
          'std::remove partitions retained values at the front and returns a logical end; it does not shrink the container.',
        rule: 'Erase the tail beginning at the returned logical end.',
        violation:
          'Treat old vector size as the retained count after remove alone.',
        signature: 'int solve(std::vector<int> values, int discarded)',
        solution:
          '#include <iostream>\n#include <cassert>\n#include <vector>\n#include <algorithm>\nint solve(std::vector<int> values, int discarded) {\n  values.erase(std::remove(values.begin(), values.end(), discarded), values.end());\n  return static_cast<int>(values.size());\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\n#include <vector>\n#include <algorithm>\nint solve(std::vector<int> values, int discarded) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\n#include <vector>\n#include <algorithm>\nint main() {\n  assert(solve({2, 3, 2, 4}, 2) == 2);\n  assert(solve({2, 2}, 2) == 0);\n  assert(solve({}, 2) == 0);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\n#include <vector>\n#include <algorithm>\nint solve(std::vector<int> values, int discarded) {\n  values.erase(std::remove(values.begin(), values.end(), discarded), values.end());\n  return static_cast<int>(values.size());\n}\nint main() { std::cout << solve({2, 3, 2, 4}, 2) << "\\n"; }',
        output: '2',
      },
    ],
  },
  {
    key: 'lambdas',
    title: 'Lambdas and predicates',
    unit: 'cpp-generic',
    atoms: [
      {
        key: 'lambda-value-capture',
        title: 'Capture a snapshot by value',
        definition:
          'A value capture stores its own copy of the captured value when the closure is created.',
        rule: 'Choose value capture when the closure needs a snapshot that can outlive the source variable.',
        violation:
          'Assume later source updates change a value-captured snapshot.',
        signature: 'int solve(int value)',
        solution:
          '#include <iostream>\n#include <cassert>\nint solve(int value) {\n  auto saved = [value] { return value; };\n  value += 10;\n  return saved();\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\nint solve(int value) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\nint main() {\n  assert(solve(4) == 4);\n  assert(solve(-2) == -2);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\nint solve(int value) {\n  auto saved = [value] { return value; };\n  value += 10;\n  return saved();\n}\nint main() { std::cout << solve(4) << "\\n"; }',
        output: '4',
      },
      {
        key: 'lambda-reference-capture',
        title: 'Capture a live object by reference',
        definition:
          'A reference capture accesses the referenced object rather than a snapshot.',
        rule: 'Ensure the referenced object outlives every closure invocation.',
        violation:
          'Return a closure that refers to a local variable that has gone out of scope.',
        signature: 'int solve(int value)',
        solution:
          '#include <iostream>\n#include <cassert>\nint solve(int value) {\n  auto live = [&value] { return value; };\n  value += 3;\n  return live();\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\nint solve(int value) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\nint main() {\n  assert(solve(4) == 7);\n  assert(solve(-3) == 0);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\nint solve(int value) {\n  auto live = [&value] { return value; };\n  value += 3;\n  return live();\n}\nint main() { std::cout << solve(4) << "\\n"; }',
        output: '7',
      },
      {
        key: 'lambda-predicate',
        title: 'Pass a predicate to an algorithm',
        definition:
          'A predicate returns a boolean decision for each element an algorithm examines.',
        rule: 'Keep the predicate comparison consistent with the intended filter.',
        violation:
          'Capture a threshold by reference when its lifetime ends before deferred use.',
        signature: 'int solve(const std::vector<int>& values, int threshold)',
        solution:
          '#include <iostream>\n#include <cassert>\n#include <vector>\n#include <algorithm>\nint solve(const std::vector<int>& values, int threshold) {\n  return static_cast<int>(std::count_if(values.begin(), values.end(), [threshold](int x) { return x > threshold; }));\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\n#include <vector>\n#include <algorithm>\nint solve(const std::vector<int>& values, int threshold) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\n#include <vector>\n#include <algorithm>\nint main() {\n  assert(solve({1, 5, 8, 5}, 4) == 3);\n  assert(solve({1, 2}, 5) == 0);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\n#include <vector>\n#include <algorithm>\nint solve(const std::vector<int>& values, int threshold) {\n  return static_cast<int>(std::count_if(values.begin(), values.end(), [threshold](int x) { return x > threshold; }));\n}\nint main() { std::cout << solve({1, 5, 8, 5}, 4) << "\\n"; }',
        output: '3',
      },
      {
        key: 'lambda-init-capture',
        title: 'Move ownership into a closure',
        definition:
          'An init capture can move a unique_ptr into a closure, making the closure its owner.',
        rule: 'Move an exclusive owner into the closure and use only the new owner.',
        violation:
          'Capture a local unique_ptr by reference and invoke after its scope ends.',
        signature: 'int solve(int value)',
        solution:
          '#include <iostream>\n#include <cassert>\n#include <memory>\n#include <utility>\nint solve(int value) {\n  auto owner = std::make_unique<int>(value);\n  auto read = [held = std::move(owner)] { return *held; };\n  return read();\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\n#include <memory>\n#include <utility>\nint solve(int value) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\n#include <memory>\n#include <utility>\nint main() {\n  assert(solve(12) == 12);\n  assert(solve(-3) == -3);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\n#include <memory>\n#include <utility>\nint solve(int value) {\n  auto owner = std::make_unique<int>(value);\n  auto read = [held = std::move(owner)] { return *held; };\n  return read();\n}\nint main() { std::cout << solve(12) << "\\n"; }',
        output: '12',
      },
    ],
  },
  {
    key: 'templates',
    title: 'Generic functions and types',
    unit: 'cpp-generic',
    atoms: [
      {
        key: 'function-template',
        title: 'Instantiate a function template',
        definition:
          'A function template describes operations that are instantiated for selected argument types.',
        rule: 'Use operations supported by the instantiated type.',
        violation:
          'Assume an unconstrained template operation exists for every type.',
        signature: 'int solve(int first, int second)',
        solution:
          '#include <iostream>\n#include <cassert>\ntemplate<class T> T larger(T a, T b) { return a < b ? b : a; }\nint solve(int first, int second) {\n  return larger(first, second);\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\ntemplate<class T> T larger(T a, T b) { return a < b ? b : a; }\nint solve(int first, int second) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\nint main() {\n  assert(solve(3, 8) == 8);\n  assert(solve(9, 2) == 9);\n  assert(solve(-3, -1) == -1);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\ntemplate<class T> T larger(T a, T b) { return a < b ? b : a; }\nint solve(int first, int second) {\n  return larger(first, second);\n}\nint main() { std::cout << solve(3, 8) << "\\n"; }',
        output: '8',
      },
      {
        key: 'template-deduction',
        title: 'Deduce a template argument',
        definition:
          'Template argument deduction matches function parameter patterns with argument types.',
        rule: 'Pass compatible deduced types or explicitly select the desired template type.',
        violation:
          'Expect a two-T-equal template to deduce one T from int and double without conversion guidance.',
        signature: 'double solve(int value)',
        solution:
          '#include <iostream>\n#include <cassert>\ntemplate<class T> T add(T a, T b) { return a + b; }\ndouble solve(int value) {\n  return add<double>(value, 0.5);\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\ntemplate<class T> T add(T a, T b) { return a + b; }\ndouble solve(int value) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\nint main() {\n  assert(solve(3) == 3.5);\n  assert(solve(-1) == -0.5);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\ntemplate<class T> T add(T a, T b) { return a + b; }\ndouble solve(int value) {\n  return add<double>(value, 0.5);\n}\nint main() { std::cout << solve(3) << "\\n"; }',
        output: '3.5',
      },
      {
        key: 'class-template',
        title: 'Parameterize stored values',
        definition:
          'A class template creates a family of concrete class types with chosen member types.',
        rule: 'Keep per-object state inside members of the instantiated class.',
        violation:
          'Use a shared global to represent every distinct object value.',
        signature: 'int solve(int value)',
        solution:
          '#include <iostream>\n#include <cassert>\ntemplate<class T> struct Slot { T value; };\nint solve(int value) {\n  Slot<int> slot{value};\n  return slot.value;\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\ntemplate<class T> struct Slot { T value; };\nint solve(int value) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\nint main() {\n  assert(solve(7) == 7);\n  assert(solve(-2) == -2);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\ntemplate<class T> struct Slot { T value; };\nint solve(int value) {\n  Slot<int> slot{value};\n  return slot.value;\n}\nint main() { std::cout << solve(7) << "\\n"; }',
        output: '7',
      },
      {
        key: 'forwarding-reference',
        title: 'Forward an argument category',
        definition:
          'std::forward<T> preserves the category represented by a deduced forwarding-reference parameter.',
        rule: 'Forward with the original deduced template parameter.',
        violation:
          'Apply std::move to every argument and accidentally consume caller lvalues.',
        signature: 'int solve(bool temporary)',
        solution:
          '#include <iostream>\n#include <cassert>\n#include <utility>\nint category(int&) { return 1; }\nint category(int&&) { return 2; }\ntemplate<class T> int dispatch(T&& value) { return category(std::forward<T>(value)); }\nint solve(bool temporary) {\n  int value = 4;\n  return temporary ? dispatch(5) : dispatch(value);\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\n#include <utility>\nint category(int&) { return 1; }\nint category(int&&) { return 2; }\ntemplate<class T> int dispatch(T&& value) { return category(std::forward<T>(value)); }\nint solve(bool temporary) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\n#include <utility>\nint main() {\n  assert(solve(true) == 2);\n  assert(solve(false) == 1);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\n#include <utility>\nint category(int&) { return 1; }\nint category(int&&) { return 2; }\ntemplate<class T> int dispatch(T&& value) { return category(std::forward<T>(value)); }\nint solve(bool temporary) {\n  int value = 4;\n  return temporary ? dispatch(5) : dispatch(value);\n}\nint main() { std::cout << solve(true) << "\\n"; }',
        output: '2',
      },
    ],
  },
  {
    key: 'concepts',
    title: 'Constrained templates',
    unit: 'cpp-generic',
    atoms: [
      {
        key: 'integral-concept',
        title: 'Constrain an integer operation',
        definition:
          'The std::integral concept is satisfied by integral types and can constrain a template parameter.',
        rule: 'Constrain modulo-based functions to types that support integral arithmetic.',
        violation:
          'Accept arbitrary floating-point inputs for an operation based on %.',
        signature: 'int solve(int value)',
        solution:
          '#include <iostream>\n#include <cassert>\n#include <concepts>\ntemplate<std::integral T> T remainder(T value) { return value % 2; }\nint solve(int value) {\n  return remainder(value);\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\n#include <concepts>\ntemplate<std::integral T> T remainder(T value) { return value % 2; }\nint solve(int value) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\n#include <concepts>\nint main() {\n  assert(solve(7) == 1);\n  assert(solve(8) == 0);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\n#include <concepts>\ntemplate<std::integral T> T remainder(T value) { return value % 2; }\nint solve(int value) {\n  return remainder(value);\n}\nint main() { std::cout << solve(7) << "\\n"; }',
        output: '1',
      },
      {
        key: 'requires-expression',
        title: 'Describe a required operation',
        definition:
          'A requires expression checks whether specified expressions are well formed for a type.',
        rule: 'Express the operations actually needed by the template body.',
        violation:
          'Constrain an unrelated property while the body requires an unsupported method.',
        signature: 'bool solve()',
        solution:
          '#include <iostream>\n#include <cassert>\n#include <vector>\n#include <concepts>\ntemplate<class T> concept HasSize = requires(const T& value) { value.size(); };\nbool solve() {\n  return HasSize<std::vector<int>> && !HasSize<int>;\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\n#include <vector>\n#include <concepts>\ntemplate<class T> concept HasSize = requires(const T& value) { value.size(); };\nbool solve() {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\n#include <vector>\n#include <concepts>\nint main() {\n  assert(solve() == true);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\n#include <vector>\n#include <concepts>\ntemplate<class T> concept HasSize = requires(const T& value) { value.size(); };\nbool solve() {\n  return HasSize<std::vector<int>> && !HasSize<int>;\n}\nint main() { std::cout << solve() << "\\n"; }',
        output: '1',
      },
      {
        key: 'if-constexpr',
        title: 'Discard an unselected compile-time branch',
        definition:
          'if constexpr discards the branch not selected by its constant condition during template instantiation.',
        rule: 'Use a type trait condition to guard operations specific to one type category.',
        violation:
          'Use an ordinary run-time if to hide an invalid dependent template operation.',
        signature: 'long long solve(int value)',
        solution:
          '#include <iostream>\n#include <cassert>\n#include <type_traits>\n#include <limits>\ntemplate<class T> long long magnitude(T value) { long long widened = value; if constexpr (std::is_signed_v<T>) return widened < 0 ? -widened : widened; else return widened; }\nlong long solve(int value) {\n  return magnitude(value);\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\n#include <type_traits>\n#include <limits>\ntemplate<class T> long long magnitude(T value) { long long widened = value; if constexpr (std::is_signed_v<T>) return widened < 0 ? -widened : widened; else return widened; }\nlong long solve(int value) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\n#include <type_traits>\n#include <limits>\nint main() {\n  assert(solve(-7) == 7LL);\n  assert(solve(3) == 3LL);\n  assert(solve(std::numeric_limits<int>::min()) == 2147483648LL);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\n#include <type_traits>\n#include <limits>\ntemplate<class T> long long magnitude(T value) { long long widened = value; if constexpr (std::is_signed_v<T>) return widened < 0 ? -widened : widened; else return widened; }\nlong long solve(int value) {\n  return magnitude(value);\n}\nint main() { std::cout << solve(-7) << "\\n"; }',
        output: '7',
      },
      {
        key: 'concept-overload',
        title: 'Select a constrained overload',
        definition:
          'A more constrained matching overload can be preferred over an unconstrained alternative.',
        rule: 'Make the specialized constraint express a genuine stronger contract.',
        violation:
          'Assume return type alone distinguishes specialized overloads.',
        signature: 'int solve()',
        solution:
          '#include <iostream>\n#include <cassert>\n#include <concepts>\ntemplate<class T> int classify(T) { return 1; }\ntemplate<std::integral T> int classify(T) { return 2; }\nint solve() {\n  return classify(4) * 10 + classify(2.5);\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\n#include <concepts>\ntemplate<class T> int classify(T) { return 1; }\ntemplate<std::integral T> int classify(T) { return 2; }\nint solve() {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\n#include <concepts>\nint main() {\n  assert(solve() == 21);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\n#include <concepts>\ntemplate<class T> int classify(T) { return 1; }\ntemplate<std::integral T> int classify(T) { return 2; }\nint solve() {\n  return classify(4) * 10 + classify(2.5);\n}\nint main() { std::cout << solve() << "\\n"; }',
        output: '21',
      },
    ],
  },
  {
    key: 'constexpr',
    title: 'Compile-time computation',
    unit: 'cpp-generic',
    atoms: [
      {
        key: 'constexpr-function',
        title: 'Make a compile-time-capable function',
        definition:
          'A constexpr function can be evaluated at compile time when its call satisfies constant-expression rules.',
        rule: 'Keep constant evaluation free of operations disallowed in constant expressions.',
        violation:
          'Assume adding constexpr makes every possible call a constant expression.',
        signature: 'int solve(int value)',
        solution:
          '#include <iostream>\n#include <cassert>\nconstexpr int square(int value) { return value * value; }\nstatic_assert(square(4) == 16);\nint solve(int value) {\n  return square(value);\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\nconstexpr int square(int value) { return value * value; }\nstatic_assert(square(4) == 16);\nint solve(int value) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\nint main() {\n  assert(solve(5) == 25);\n  assert(solve(-3) == 9);\n  assert(solve(0) == 0);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\nconstexpr int square(int value) { return value * value; }\nstatic_assert(square(4) == 16);\nint solve(int value) {\n  return square(value);\n}\nint main() { std::cout << solve(5) << "\\n"; }',
        output: '25',
      },
      {
        key: 'static-assert',
        title: 'Validate a compile-time invariant',
        definition:
          'static_assert rejects a program when its compile-time condition is false.',
        rule: 'Use a constant expression that expresses the structural requirement.',
        violation: 'Use a run-time input as a static_assert condition.',
        signature: 'int solve()',
        solution:
          '#include <iostream>\n#include <cassert>\n#include <cstdint>\nstatic_assert(sizeof(std::uint32_t) == 4);\nint solve() {\n  return static_cast<int>(sizeof(std::uint32_t));\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\n#include <cstdint>\nstatic_assert(sizeof(std::uint32_t) == 4);\nint solve() {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\n#include <cstdint>\nint main() {\n  assert(solve() == 4);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\n#include <cstdint>\nstatic_assert(sizeof(std::uint32_t) == 4);\nint solve() {\n  return static_cast<int>(sizeof(std::uint32_t));\n}\nint main() { std::cout << solve() << "\\n"; }',
        output: '4',
      },
      {
        key: 'consteval-function',
        title: 'Require constant evaluation',
        definition:
          'A consteval function requires its relevant calls to produce a compile-time constant expression.',
        rule: 'Call an immediate function with valid constant-expression arguments.',
        violation:
          'Pass an arbitrary run-time parameter to a consteval function.',
        signature: 'int solve()',
        solution:
          '#include <iostream>\n#include <cassert>\nconsteval int capacity(int exponent) { return 1 << exponent; }\nint solve() {\n  constexpr int count = capacity(3);\n  return count;\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\nconsteval int capacity(int exponent) { return 1 << exponent; }\nint solve() {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\nint main() {\n  assert(solve() == 8);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\nconsteval int capacity(int exponent) { return 1 << exponent; }\nint solve() {\n  constexpr int count = capacity(3);\n  return count;\n}\nint main() { std::cout << solve() << "\\n"; }',
        output: '8',
      },
      {
        key: 'compile-time-array',
        title: 'Build a fixed lookup table',
        definition:
          'A constexpr std::array can store results computed at compile time.',
        rule: 'Check a run-time index before accessing the fixed table.',
        violation: 'Index beyond the fixed compile-time array length.',
        signature: 'int solve(std::size_t index)',
        solution:
          '#include <iostream>\n#include <cassert>\n#include <array>\n#include <cstddef>\nconstexpr std::array<int, 4> table() { std::array<int, 4> result{}; for (int i = 0; i < 4; ++i) result[i] = i * i; return result; }\nint solve(std::size_t index) {\n  constexpr auto values = table();\n  return index < values.size() ? values[index] : -1;\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\n#include <array>\n#include <cstddef>\nconstexpr std::array<int, 4> table() { std::array<int, 4> result{}; for (int i = 0; i < 4; ++i) result[i] = i * i; return result; }\nint solve(std::size_t index) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\n#include <array>\n#include <cstddef>\nint main() {\n  assert(solve(3) == 9);\n  assert(solve(0) == 0);\n  assert(solve(4) == -1);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\n#include <array>\n#include <cstddef>\nconstexpr std::array<int, 4> table() { std::array<int, 4> result{}; for (int i = 0; i < 4; ++i) result[i] = i * i; return result; }\nint solve(std::size_t index) {\n  constexpr auto values = table();\n  return index < values.size() ? values[index] : -1;\n}\nint main() { std::cout << solve(3) << "\\n"; }',
        output: '9',
      },
    ],
  },
  {
    key: 'optional',
    title: 'Represent absence and alternatives',
    unit: 'cpp-errors',
    atoms: [
      {
        key: 'optional-value',
        title: 'Represent an absent result',
        definition: 'std::optional<T> holds either one T value or no value.',
        rule: 'Check has_value before dereferencing an optional.',
        violation: 'Dereference an empty optional.',
        signature: 'int solve(bool available)',
        solution:
          '#include <iostream>\n#include <cassert>\n#include <optional>\nint solve(bool available) {\n  std::optional<int> result;\n  if (available) result = 7;\n  return result.value_or(-1);\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\n#include <optional>\nint solve(bool available) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\n#include <optional>\nint main() {\n  assert(solve(true) == 7);\n  assert(solve(false) == -1);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\n#include <optional>\nint solve(bool available) {\n  std::optional<int> result;\n  if (available) result = 7;\n  return result.value_or(-1);\n}\nint main() { std::cout << solve(true) << "\\n"; }',
        output: '7',
      },
      {
        key: 'optional-search',
        title: 'Return an optional lookup',
        definition:
          'An optional return can distinguish absence from any valid value, including zero.',
        rule: 'Represent failure independently from valid domain values.',
        violation:
          'Use zero as an absent sentinel when zero is a valid answer.',
        signature: 'int solve(const std::vector<int>& values, int target)',
        solution:
          '#include <iostream>\n#include <cassert>\n#include <optional>\n#include <vector>\nstd::optional<int> find_index(const std::vector<int>& values, int target) { for (int i = 0; i < static_cast<int>(values.size()); ++i) if (values[i] == target) return i; return std::nullopt; }\nint solve(const std::vector<int>& values, int target) {\n  auto result = find_index(values, target);\n  return result ? *result : -1;\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\n#include <optional>\n#include <vector>\nstd::optional<int> find_index(const std::vector<int>& values, int target) { for (int i = 0; i < static_cast<int>(values.size()); ++i) if (values[i] == target) return i; return std::nullopt; }\nint solve(const std::vector<int>& values, int target) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\n#include <optional>\n#include <vector>\nint main() {\n  assert(solve({4, 8}, 4) == 0);\n  assert(solve({4}, 3) == -1);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\n#include <optional>\n#include <vector>\nstd::optional<int> find_index(const std::vector<int>& values, int target) { for (int i = 0; i < static_cast<int>(values.size()); ++i) if (values[i] == target) return i; return std::nullopt; }\nint solve(const std::vector<int>& values, int target) {\n  auto result = find_index(values, target);\n  return result ? *result : -1;\n}\nint main() { std::cout << solve({4, 8}, 4) << "\\n"; }',
        output: '0',
      },
      {
        key: 'variant-alternatives',
        title: 'Store one tagged alternative',
        definition:
          'std::variant stores one active alternative and tracks which type is active.',
        rule: 'Query or visit the active alternative rather than assuming its type.',
        violation:
          'Use std::get with a type that is not active and assume it succeeds.',
        signature: 'int solve(bool text)',
        solution:
          '#include <iostream>\n#include <cassert>\n#include <variant>\n#include <string>\nint solve(bool text) {\n  std::variant<int, std::string> value = 8;\n  if (text) value = std::string("abc");\n  return std::holds_alternative<int>(value) ? std::get<int>(value) : static_cast<int>(std::get<std::string>(value).size());\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\n#include <variant>\n#include <string>\nint solve(bool text) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\n#include <variant>\n#include <string>\nint main() {\n  assert(solve(false) == 8);\n  assert(solve(true) == 3);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\n#include <variant>\n#include <string>\nint solve(bool text) {\n  std::variant<int, std::string> value = 8;\n  if (text) value = std::string("abc");\n  return std::holds_alternative<int>(value) ? std::get<int>(value) : static_cast<int>(std::get<std::string>(value).size());\n}\nint main() { std::cout << solve(false) << "\\n"; }',
        output: '8',
      },
      {
        key: 'variant-visitor',
        title: 'Visit the active alternative',
        definition:
          'std::visit invokes a visitor with the currently active variant value.',
        rule: 'Provide a visitor that is valid for every alternative.',
        violation:
          'Write a visitor body that only compiles for one of the variant types.',
        signature: 'int solve(bool text)',
        solution:
          '#include <iostream>\n#include <cassert>\n#include <variant>\n#include <string>\n#include <type_traits>\nint solve(bool text) {\n  std::variant<int, std::string> value = 5;\n  if (text) value = std::string("abcd");\n  return std::visit([](const auto& item) -> int {\n    using T = std::decay_t<decltype(item)>;\n    if constexpr (std::is_same_v<T, int>) return item;\n    else return static_cast<int>(item.size());\n  }, value);\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\n#include <variant>\n#include <string>\n#include <type_traits>\nint solve(bool text) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\n#include <variant>\n#include <string>\n#include <type_traits>\nint main() {\n  assert(solve(false) == 5);\n  assert(solve(true) == 4);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\n#include <variant>\n#include <string>\n#include <type_traits>\nint solve(bool text) {\n  std::variant<int, std::string> value = 5;\n  if (text) value = std::string("abcd");\n  return std::visit([](const auto& item) -> int {\n    using T = std::decay_t<decltype(item)>;\n    if constexpr (std::is_same_v<T, int>) return item;\n    else return static_cast<int>(item.size());\n  }, value);\n}\nint main() { std::cout << solve(false) << "\\n"; }',
        output: '5',
      },
    ],
  },
  {
    key: 'exceptions',
    title: 'Exception contracts',
    unit: 'cpp-errors',
    atoms: [
      {
        key: 'throw-catch',
        title: 'Report and catch an exception',
        definition:
          'throw transfers control to a matching handler while unwinding completed local objects.',
        rule: 'Catch standard exception objects by const reference.',
        violation:
          'Catch by value when preserving a derived exception object matters.',
        signature: 'int solve(int value)',
        solution:
          '#include <iostream>\n#include <cassert>\n#include <stdexcept>\nint solve(int value) {\n  try { if (value < 0) throw std::invalid_argument("negative"); return value; }\n  catch (const std::invalid_argument&) { return -1; }\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\n#include <stdexcept>\nint solve(int value) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\n#include <stdexcept>\nint main() {\n  assert(solve(6) == 6);\n  assert(solve(-3) == -1);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\n#include <stdexcept>\nint solve(int value) {\n  try { if (value < 0) throw std::invalid_argument("negative"); return value; }\n  catch (const std::invalid_argument&) { return -1; }\n}\nint main() { std::cout << solve(6) << "\\n"; }',
        output: '6',
      },
      {
        key: 'bounds-exception',
        title: 'Use checked container access',
        definition:
          'vector::at throws out_of_range when an index is outside the constructed element range.',
        rule: 'Choose at when the API requires checked access and handle its failure deliberately.',
        violation: 'Rely on operator[] to throw for an invalid index.',
        signature:
          'int solve(const std::vector<int>& values, std::size_t index)',
        solution:
          '#include <iostream>\n#include <cassert>\n#include <vector>\n#include <stdexcept>\n#include <cstddef>\nint solve(const std::vector<int>& values, std::size_t index) {\n  try { return values.at(index); }\n  catch (const std::out_of_range&) { return -1; }\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\n#include <vector>\n#include <stdexcept>\n#include <cstddef>\nint solve(const std::vector<int>& values, std::size_t index) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\n#include <vector>\n#include <stdexcept>\n#include <cstddef>\nint main() {\n  assert(solve({8}, 0) == 8);\n  assert(solve({}, 0) == -1);\n  assert(solve({8}, 1) == -1);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\n#include <vector>\n#include <stdexcept>\n#include <cstddef>\nint solve(const std::vector<int>& values, std::size_t index) {\n  try { return values.at(index); }\n  catch (const std::out_of_range&) { return -1; }\n}\nint main() { std::cout << solve({8}, 0) << "\\n"; }',
        output: '8',
      },
      {
        key: 'strong-guarantee',
        title: 'Commit after successful validation',
        definition:
          'The strong exception guarantee leaves observable state unchanged when an operation fails.',
        rule: 'Prepare a replacement and commit only after all fallible validation succeeds.',
        violation: 'Clear the destination before validating the replacement.',
        signature: 'int solve(int original, int replacement)',
        solution:
          '#include <iostream>\n#include <cassert>\n#include <stdexcept>\nint solve(int original, int replacement) {\n  int destination = original;\n  try {\n    if (replacement < 0) throw std::invalid_argument("negative");\n    destination = replacement;\n  } catch (const std::invalid_argument&) {}\n  return destination;\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\n#include <stdexcept>\nint solve(int original, int replacement) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\n#include <stdexcept>\nint main() {\n  assert(solve(4, 9) == 9);\n  assert(solve(4, -2) == 4);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\n#include <stdexcept>\nint solve(int original, int replacement) {\n  int destination = original;\n  try {\n    if (replacement < 0) throw std::invalid_argument("negative");\n    destination = replacement;\n  } catch (const std::invalid_argument&) {}\n  return destination;\n}\nint main() { std::cout << solve(4, 9) << "\\n"; }',
        output: '9',
      },
      {
        key: 'noexcept-expression',
        title: 'Inspect a nonthrowing expression',
        definition:
          'The noexcept operator determines at compile time whether an expression is declared nonthrowing.',
        rule: 'Use noexcept as a contract, not as an exception-recovery mechanism.',
        violation:
          'Expect a noexcept declaration to catch a thrown exception and return normally.',
        signature: 'bool solve()',
        solution:
          '#include <iostream>\n#include <cassert>\nint read_value() noexcept { return 7; }\nint may_fail() { return 8; }\nbool solve() {\n  return noexcept(read_value()) && !noexcept(may_fail());\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\nint read_value() noexcept { return 7; }\nint may_fail() { return 8; }\nbool solve() {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\nint main() {\n  assert(solve() == true);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\nint read_value() noexcept { return 7; }\nint may_fail() { return 8; }\nbool solve() {\n  return noexcept(read_value()) && !noexcept(may_fail());\n}\nint main() { std::cout << solve() << "\\n"; }',
        output: '1',
      },
    ],
  },
  {
    key: 'polymorphism',
    title: 'Interfaces and virtual dispatch',
    unit: 'cpp-errors',
    atoms: [
      {
        key: 'virtual-dispatch',
        title: 'Call through a virtual interface',
        definition:
          'A virtual function call through a base reference selects the most-derived override for the live object.',
        rule: 'Use override to have the compiler check the intended override signature.',
        violation:
          'Accidentally change the parameter list and assume a new method overrides the base.',
        signature: 'int solve(int value)',
        solution:
          '#include <iostream>\n#include <cassert>\nstruct Base { virtual ~Base() = default; virtual int read() const = 0; };\nstruct Derived : Base { int value; explicit Derived(int x) : value(x) {} int read() const override { return value; } };\nint solve(int value) {\n  Derived derived(value);\n  const Base& view = derived;\n  return view.read();\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\nstruct Base { virtual ~Base() = default; virtual int read() const = 0; };\nstruct Derived : Base { int value; explicit Derived(int x) : value(x) {} int read() const override { return value; } };\nint solve(int value) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\nint main() {\n  assert(solve(9) == 9);\n  assert(solve(-3) == -3);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\nstruct Base { virtual ~Base() = default; virtual int read() const = 0; };\nstruct Derived : Base { int value; explicit Derived(int x) : value(x) {} int read() const override { return value; } };\nint solve(int value) {\n  Derived derived(value);\n  const Base& view = derived;\n  return view.read();\n}\nint main() { std::cout << solve(9) << "\\n"; }',
        output: '9',
      },
      {
        key: 'virtual-destruction',
        title: 'Destroy through an owning base pointer',
        definition:
          'A polymorphic base needs a virtual destructor when derived objects are deleted through base pointers.',
        rule: 'Make the owning polymorphic base destructor virtual.',
        violation:
          'Delete a derived allocation through a base pointer whose destructor is non-virtual.',
        signature: 'int solve()',
        solution:
          '#include <iostream>\n#include <cassert>\n#include <memory>\nstruct Base { virtual ~Base() = default; };\nstruct Derived : Base { int& count; explicit Derived(int& x) : count(x) {} ~Derived() override { ++count; } };\nint solve() {\n  int released = 0;\n  { std::unique_ptr<Base> owner = std::make_unique<Derived>(released); }\n  return released;\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\n#include <memory>\nstruct Base { virtual ~Base() = default; };\nstruct Derived : Base { int& count; explicit Derived(int& x) : count(x) {} ~Derived() override { ++count; } };\nint solve() {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\n#include <memory>\nint main() {\n  assert(solve() == 1);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\n#include <memory>\nstruct Base { virtual ~Base() = default; };\nstruct Derived : Base { int& count; explicit Derived(int& x) : count(x) {} ~Derived() override { ++count; } };\nint solve() {\n  int released = 0;\n  { std::unique_ptr<Base> owner = std::make_unique<Derived>(released); }\n  return released;\n}\nint main() { std::cout << solve() << "\\n"; }',
        output: '1',
      },
      {
        key: 'avoid-slicing',
        title: 'Borrow a polymorphic object',
        definition:
          'Copying a derived object into a base value slices away the derived subobject.',
        rule: 'Pass polymorphic objects by reference or owning smart pointer.',
        violation:
          'Copy a derived instance into a base value when dynamic dispatch is required.',
        signature: 'int solve()',
        solution:
          '#include <iostream>\n#include <cassert>\nstruct Base { virtual ~Base() = default; virtual int read() const { return 1; } };\nstruct Derived : Base { int read() const override { return 2; } };\nint solve() {\n  Derived object;\n  const Base& view = object;\n  return view.read();\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\nstruct Base { virtual ~Base() = default; virtual int read() const { return 1; } };\nstruct Derived : Base { int read() const override { return 2; } };\nint solve() {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\nint main() {\n  assert(solve() == 2);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\nstruct Base { virtual ~Base() = default; virtual int read() const { return 1; } };\nstruct Derived : Base { int read() const override { return 2; } };\nint solve() {\n  Derived object;\n  const Base& view = object;\n  return view.read();\n}\nint main() { std::cout << solve() << "\\n"; }',
        output: '2',
      },
      {
        key: 'composition-interface',
        title: 'Compose an implementation',
        definition:
          'Composition stores collaborating objects explicitly instead of inheriting implementation details unnecessarily.',
        rule: 'Use inheritance for an interface contract and members for owned implementation state.',
        violation:
          'Expose internal storage through inheritance merely to reuse a helper method.',
        signature: 'int solve(int value)',
        solution:
          '#include <iostream>\n#include <cassert>\nstruct Scale { int factor; int apply(int x) const { return factor * x; } };\nstruct Processor { Scale scale; int result() const { return scale.apply(2); } };\nint solve(int value) {\n  Processor processor{{value}};\n  return processor.result();\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\nstruct Scale { int factor; int apply(int x) const { return factor * x; } };\nstruct Processor { Scale scale; int result() const { return scale.apply(2); } };\nint solve(int value) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\nint main() {\n  assert(solve(3) == 6);\n  assert(solve(-2) == -4);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\nstruct Scale { int factor; int apply(int x) const { return factor * x; } };\nstruct Processor { Scale scale; int result() const { return scale.apply(2); } };\nint solve(int value) {\n  Processor processor{{value}};\n  return processor.result();\n}\nint main() { std::cout << solve(3) << "\\n"; }',
        output: '6',
      },
    ],
  },
  {
    key: 'build',
    title: 'Compilation and linkage',
    unit: 'cpp-tooling',
    atoms: [
      {
        key: 'declaration-definition',
        title: 'Separate declarations from definitions',
        definition:
          'A declaration describes a function signature; a definition supplies its body, which the linker must find when needed.',
        rule: 'Match the declaration and definition signatures exactly.',
        violation:
          'Declare one signature and define a different overload accidentally.',
        signature: 'int solve(int value)',
        solution:
          '#include <iostream>\n#include <cassert>\nint declared_double(int);\nint declared_double(int value) { return value * 2; }\nint solve(int value) {\n  return declared_double(value);\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\nint declared_double(int);\nint declared_double(int value) { return value * 2; }\nint solve(int value) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\nint main() {\n  assert(solve(5) == 10);\n  assert(solve(-2) == -4);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\nint declared_double(int);\nint declared_double(int value) { return value * 2; }\nint solve(int value) {\n  return declared_double(value);\n}\nint main() { std::cout << solve(5) << "\\n"; }',
        output: '10',
      },
      {
        key: 'namespace-qualified',
        title: 'Qualify a namespace member',
        definition:
          'A namespace groups names and allows qualification to disambiguate otherwise matching identifiers.',
        rule: 'Use qualified names where another declaration could conflict.',
        violation:
          'Import every namespace globally and rely on accidental overload selection.',
        signature: 'int solve(int value)',
        solution:
          '#include <iostream>\n#include <cassert>\nnamespace pricing { int adjust(int value) { return value + 3; } }\nint solve(int value) {\n  return pricing::adjust(value);\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\nnamespace pricing { int adjust(int value) { return value + 3; } }\nint solve(int value) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\nint main() {\n  assert(solve(4) == 7);\n  assert(solve(-3) == 0);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\nnamespace pricing { int adjust(int value) { return value + 3; } }\nint solve(int value) {\n  return pricing::adjust(value);\n}\nint main() { std::cout << solve(4) << "\\n"; }',
        output: '7',
      },
      {
        key: 'internal-linkage',
        title: 'Limit a helper to its translation unit',
        definition:
          'A name in an unnamed namespace has internal linkage and can be used privately within its translation unit.',
        rule: 'Give file-local helpers internal linkage when they are implementation details.',
        violation:
          'Export a common helper name from every source file and violate the one-definition rule.',
        signature: 'int solve(int value)',
        solution:
          '#include <iostream>\n#include <cassert>\nnamespace { int private_adjust(int value) { return value + 4; } }\nint solve(int value) {\n  return private_adjust(value);\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\nnamespace { int private_adjust(int value) { return value + 4; } }\nint solve(int value) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\nint main() {\n  assert(solve(5) == 9);\n  assert(solve(-4) == 0);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\nnamespace { int private_adjust(int value) { return value + 4; } }\nint solve(int value) {\n  return private_adjust(value);\n}\nint main() { std::cout << solve(5) << "\\n"; }',
        output: '9',
      },
      {
        key: 'inline-definition',
        title: 'Define a header-safe inline entity',
        definition:
          'An inline entity may have matching definitions in multiple translation units under the one-definition rule.',
        rule: 'Keep all definitions of the same inline entity identical.',
        violation:
          'Define a header entity differently in separate translation units.',
        signature: 'int solve(int value)',
        solution:
          '#include <iostream>\n#include <cassert>\nnamespace defaults { inline constexpr int offset = 5; }\nint solve(int value) {\n  return value + defaults::offset;\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\nnamespace defaults { inline constexpr int offset = 5; }\nint solve(int value) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\nint main() {\n  assert(solve(3) == 8);\n  assert(solve(-5) == 0);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\nnamespace defaults { inline constexpr int offset = 5; }\nint solve(int value) {\n  return value + defaults::offset;\n}\nint main() { std::cout << solve(3) << "\\n"; }',
        output: '8',
      },
    ],
  },
  {
    key: 'testing',
    title: 'Test contracts and boundary cases',
    unit: 'cpp-tooling',
    atoms: [
      {
        key: 'assert-contract',
        title: 'Assert a known result',
        definition:
          'assert checks a condition in builds where NDEBUG is not defined and aborts when the condition is false.',
        rule: 'Keep production validation separate from debug-only assertions.',
        violation:
          'Use assert as the only check protecting against hostile input.',
        signature: 'int solve(int value)',
        solution:
          '#include <iostream>\n#include <cassert>\nint solve(int value) {\n  int result = value + 2;\n  assert(result == value + 2);\n  return result;\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\nint solve(int value) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\nint main() {\n  assert(solve(5) == 7);\n  assert(solve(-2) == 0);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\nint solve(int value) {\n  int result = value + 2;\n  assert(result == value + 2);\n  return result;\n}\nint main() { std::cout << solve(5) << "\\n"; }',
        output: '7',
      },
      {
        key: 'boundary-case',
        title: 'Specify empty-input behavior',
        definition:
          'A function contract should define what an empty range produces before code accesses its first element.',
        rule: 'Test the empty case before accessing front or back.',
        violation: 'Use front before checking whether the input is empty.',
        signature: 'int solve(const std::vector<int>& values)',
        solution:
          '#include <iostream>\n#include <cassert>\n#include <vector>\nint solve(const std::vector<int>& values) {\n  if (values.empty()) return -1;\n  return values.front();\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\n#include <vector>\nint solve(const std::vector<int>& values) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\n#include <vector>\nint main() {\n  assert(solve({8, 2}) == 8);\n  assert(solve({}) == -1);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\n#include <vector>\nint solve(const std::vector<int>& values) {\n  if (values.empty()) return -1;\n  return values.front();\n}\nint main() { std::cout << solve({8, 2}) << "\\n"; }',
        output: '8',
      },
      {
        key: 'property-test',
        title: 'Check a round-trip property',
        definition:
          'A round-trip test checks that an inverse operation reconstructs valid original inputs.',
        rule: 'Test varied inputs and the domain preconditions of both operations.',
        violation:
          'Treat one happy-path sample as a proof of every boundary case.',
        signature: 'bool solve(int value)',
        solution:
          '#include <iostream>\n#include <cassert>\n#include <vector>\n#include <algorithm>\nbool solve(int value) {\n  std::vector<int> values{value, value + 1, value + 2};\n  auto original = values;\n  std::reverse(values.begin(), values.end());\n  std::reverse(values.begin(), values.end());\n  return values == original;\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\n#include <vector>\n#include <algorithm>\nbool solve(int value) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\n#include <vector>\n#include <algorithm>\nint main() {\n  assert(solve(4) == true);\n  assert(solve(-8) == true);\n  assert(solve(0) == true);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\n#include <vector>\n#include <algorithm>\nbool solve(int value) {\n  std::vector<int> values{value, value + 1, value + 2};\n  auto original = values;\n  std::reverse(values.begin(), values.end());\n  std::reverse(values.begin(), values.end());\n  return values == original;\n}\nint main() { std::cout << solve(4) << "\\n"; }',
        output: '1',
      },
      {
        key: 'float-tolerance',
        title: 'Compare an approximate result',
        definition:
          'Floating-point arithmetic can introduce rounding, so numeric tests need a specified error tolerance.',
        rule: 'Compare absolute error against a justified tolerance for this numeric contract.',
        violation:
          'Demand exact equality for a result whose computation introduces expected rounding.',
        signature:
          'bool solve(double actual, double expected, double tolerance)',
        solution:
          '#include <iostream>\n#include <cassert>\n#include <cmath>\nbool solve(double actual, double expected, double tolerance) {\n  return tolerance >= 0 && std::abs(actual - expected) <= tolerance;\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\n#include <cmath>\nbool solve(double actual, double expected, double tolerance) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\n#include <cmath>\nint main() {\n  assert(solve(0.1 + 0.2, 0.3, 1e-12) == true);\n  assert(solve(1.0, 1.1, 0.01) == false);\n  assert(solve(1.0, 1.0, -1.0) == false);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\n#include <cmath>\nbool solve(double actual, double expected, double tolerance) {\n  return tolerance >= 0 && std::abs(actual - expected) <= tolerance;\n}\nint main() { std::cout << solve(0.1 + 0.2, 0.3, 1e-12) << "\\n"; }',
        output: '1',
      },
    ],
  },
  {
    key: 'threads',
    title: 'Thread lifetimes',
    unit: 'cpp-concurrency',
    atoms: [
      {
        key: 'thread-join',
        title: 'Join a worker thread',
        definition:
          'join waits for a joinable thread to complete and synchronizes with its completion.',
        rule: 'Join or otherwise safely manage every started thread before its owner is destroyed.',
        violation:
          'Destroy a joinable std::thread and expect automatic joining.',
        signature: 'int solve(int value)',
        solution:
          '#include <iostream>\n#include <cassert>\n#include <thread>\nint solve(int value) {\n  int result = 0;\n  std::thread worker([&] { result = value * 2; });\n  worker.join();\n  return result;\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\n#include <thread>\nint solve(int value) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\n#include <thread>\nint main() {\n  assert(solve(5) == 10);\n  assert(solve(-3) == -6);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\n#include <thread>\nint solve(int value) {\n  int result = 0;\n  std::thread worker([&] { result = value * 2; });\n  worker.join();\n  return result;\n}\nint main() { std::cout << solve(5) << "\\n"; }',
        output: '10',
      },
      {
        key: 'thread-input-copy',
        title: 'Give a worker a stable input',
        definition:
          'Copying input into a worker closure can avoid sharing caller mutation and lifetime responsibilities.',
        rule: 'Own or copy the values needed until the worker has completed.',
        violation: 'Pass a dangling reference to a detached worker.',
        signature: 'int solve(int value)',
        solution:
          '#include <iostream>\n#include <cassert>\n#include <thread>\nint solve(int value) {\n  int result = 0;\n  std::thread worker([value, &result] { result = value; });\n  value += 9;\n  worker.join();\n  return result;\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\n#include <thread>\nint solve(int value) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\n#include <thread>\nint main() {\n  assert(solve(7) == 7);\n  assert(solve(-2) == -2);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\n#include <thread>\nint solve(int value) {\n  int result = 0;\n  std::thread worker([value, &result] { result = value; });\n  value += 9;\n  worker.join();\n  return result;\n}\nint main() { std::cout << solve(7) << "\\n"; }',
        output: '7',
      },
      {
        key: 'parallel-partitions',
        title: 'Partition independent worker outputs',
        definition:
          'Separate result objects let workers write independently without racing on the same scalar.',
        rule: 'Keep simultaneous writes on independent objects or protect shared state.',
        violation: 'Accumulate into one non-atomic scalar from both workers.',
        signature: 'int solve(int first, int second)',
        solution:
          '#include <iostream>\n#include <cassert>\n#include <thread>\nint solve(int first, int second) {\n  int left = 0, right = 0;\n  std::thread a([&] { left = first * 2; });\n  std::thread b([&] { right = second * 3; });\n  a.join(); b.join();\n  return left + right;\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\n#include <thread>\nint solve(int first, int second) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\n#include <thread>\nint main() {\n  assert(solve(2, 3) == 13);\n  assert(solve(-1, 2) == 4);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\n#include <thread>\nint solve(int first, int second) {\n  int left = 0, right = 0;\n  std::thread a([&] { left = first * 2; });\n  std::thread b([&] { right = second * 3; });\n  a.join(); b.join();\n  return left + right;\n}\nint main() { std::cout << solve(2, 3) << "\\n"; }',
        output: '13',
      },
      {
        key: 'jthread-lifetime',
        title: 'Use automatic joining with jthread',
        definition:
          'std::jthread joins a joinable owned thread when its destructor runs.',
        rule: 'Keep all referenced inputs alive until jthread destruction has joined the worker.',
        violation:
          'Declare referenced storage after the jthread that needs it during destruction.',
        signature: 'int solve(int value)',
        solution:
          '#include <iostream>\n#include <cassert>\n#include <thread>\nint solve(int value) {\n  int result = 0;\n  { std::jthread worker([&] { result = value + 1; }); }\n  return result;\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\n#include <thread>\nint solve(int value) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\n#include <thread>\nint main() {\n  assert(solve(8) == 9);\n  assert(solve(-1) == 0);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\n#include <thread>\nint solve(int value) {\n  int result = 0;\n  { std::jthread worker([&] { result = value + 1; }); }\n  return result;\n}\nint main() { std::cout << solve(8) << "\\n"; }',
        output: '9',
      },
    ],
  },
  {
    key: 'mutex',
    title: 'Protect shared invariants',
    unit: 'cpp-concurrency',
    atoms: [
      {
        key: 'lock-guard',
        title: 'Own a mutex lock with RAII',
        definition:
          'lock_guard locks a mutex on construction and unlocks it at destruction.',
        rule: 'Use the same mutex for every access to the protected invariant.',
        violation:
          'Protect writes with a mutex while performing concurrent reads without that mutex.',
        signature: 'int solve(int value)',
        solution:
          '#include <iostream>\n#include <cassert>\n#include <mutex>\nint solve(int value) {\n  std::mutex mutex;\n  int shared = value;\n  { std::lock_guard<std::mutex> lock(mutex); shared += 3; }\n  return shared;\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\n#include <mutex>\nint solve(int value) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\n#include <mutex>\nint main() {\n  assert(solve(4) == 7);\n  assert(solve(-3) == 0);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\n#include <mutex>\nint solve(int value) {\n  std::mutex mutex;\n  int shared = value;\n  { std::lock_guard<std::mutex> lock(mutex); shared += 3; }\n  return shared;\n}\nint main() { std::cout << solve(4) << "\\n"; }',
        output: '7',
      },
      {
        key: 'mutex-counter',
        title: 'Serialize a shared increment',
        definition:
          'A mutex makes a read-modify-write critical section exclusive among threads that acquire that mutex.',
        rule: 'Put the whole read-modify-write operation under the same lock.',
        violation:
          'Read the counter outside the lock and write a stale increment inside it.',
        signature: 'int solve(int count)',
        solution:
          '#include <iostream>\n#include <cassert>\n#include <mutex>\n#include <thread>\nint solve(int count) {\n  std::mutex mutex;\n  int total = 0;\n  auto worker = [&] { for (int i = 0; i < count; ++i) { std::lock_guard<std::mutex> lock(mutex); ++total; } };\n  std::thread first(worker), second(worker);\n  first.join(); second.join();\n  return total;\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\n#include <mutex>\n#include <thread>\nint solve(int count) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\n#include <mutex>\n#include <thread>\nint main() {\n  assert(solve(5) == 10);\n  assert(solve(0) == 0);\n  assert(solve(25) == 50);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\n#include <mutex>\n#include <thread>\nint solve(int count) {\n  std::mutex mutex;\n  int total = 0;\n  auto worker = [&] { for (int i = 0; i < count; ++i) { std::lock_guard<std::mutex> lock(mutex); ++total; } };\n  std::thread first(worker), second(worker);\n  first.join(); second.join();\n  return total;\n}\nint main() { std::cout << solve(5) << "\\n"; }',
        output: '10',
      },
      {
        key: 'scoped-two-locks',
        title: 'Acquire two mutexes together',
        definition:
          'scoped_lock can acquire multiple mutexes using a deadlock-avoidance locking algorithm.',
        rule: 'Use coordinated multi-mutex locking for an operation spanning two guarded states.',
        violation:
          'Hold mutex A while waiting for B in one code path and reverse that order in another.',
        signature: 'int solve(int left, int right)',
        solution:
          '#include <iostream>\n#include <cassert>\n#include <mutex>\nint solve(int left, int right) {\n  std::mutex first, second;\n  std::scoped_lock lock(first, second);\n  ++left; --right;\n  return left + right;\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\n#include <mutex>\nint solve(int left, int right) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\n#include <mutex>\nint main() {\n  assert(solve(5, 7) == 12);\n  assert(solve(-2, 2) == 0);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\n#include <mutex>\nint solve(int left, int right) {\n  std::mutex first, second;\n  std::scoped_lock lock(first, second);\n  ++left; --right;\n  return left + right;\n}\nint main() { std::cout << solve(5, 7) << "\\n"; }',
        output: '12',
      },
      {
        key: 'unique-lock',
        title: 'Temporarily release a unique lock',
        definition:
          'unique_lock tracks ownership and can release and reacquire its mutex explicitly.',
        rule: 'Unlock only when the unique_lock owns the mutex.',
        violation: 'Call unlock twice without a successful intervening lock.',
        signature: 'bool solve()',
        solution:
          '#include <iostream>\n#include <cassert>\n#include <mutex>\nbool solve() {\n  std::mutex mutex;\n  std::unique_lock<std::mutex> lock(mutex);\n  lock.unlock();\n  bool released = !lock.owns_lock();\n  lock.lock();\n  return released && lock.owns_lock();\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\n#include <mutex>\nbool solve() {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\n#include <mutex>\nint main() {\n  assert(solve() == true);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\n#include <mutex>\nbool solve() {\n  std::mutex mutex;\n  std::unique_lock<std::mutex> lock(mutex);\n  lock.unlock();\n  bool released = !lock.owns_lock();\n  lock.lock();\n  return released && lock.owns_lock();\n}\nint main() { std::cout << solve() << "\\n"; }',
        output: '1',
      },
    ],
  },
  {
    key: 'condition-variables',
    title: 'Condition-variable protocols',
    unit: 'cpp-concurrency',
    atoms: [
      {
        key: 'wait-predicate',
        title: 'Wait for state with a predicate',
        definition:
          'A condition-variable predicate is rechecked under the mutex, handling spurious wakeups and already-satisfied state.',
        rule: 'Wait with a predicate over state protected by the associated mutex.',
        violation:
          'Treat a single notification as proof that data is available.',
        signature: 'int solve(int value)',
        solution:
          '#include <iostream>\n#include <cassert>\n#include <mutex>\n#include <condition_variable>\nint solve(int value) {\n  std::mutex mutex; std::condition_variable cv;\n  bool ready = true;\n  std::unique_lock<std::mutex> lock(mutex);\n  cv.wait(lock, [&] { return ready; });\n  return value;\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\n#include <mutex>\n#include <condition_variable>\nint solve(int value) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\n#include <mutex>\n#include <condition_variable>\nint main() {\n  assert(solve(8) == 8);\n  assert(solve(-4) == -4);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\n#include <mutex>\n#include <condition_variable>\nint solve(int value) {\n  std::mutex mutex; std::condition_variable cv;\n  bool ready = true;\n  std::unique_lock<std::mutex> lock(mutex);\n  cv.wait(lock, [&] { return ready; });\n  return value;\n}\nint main() { std::cout << solve(8) << "\\n"; }',
        output: '8',
      },
      {
        key: 'notify-after-state',
        title: 'Publish guarded state before notifying',
        definition:
          'The producer changes the predicate state while holding the mutex and then notifies waiting consumers.',
        rule: 'Modify payload and predicate under the same mutex used by the waiter.',
        violation:
          'Modify the non-atomic predicate concurrently without the mutex.',
        signature: 'int solve(int value)',
        solution:
          '#include <iostream>\n#include <cassert>\n#include <mutex>\n#include <condition_variable>\n#include <thread>\nint solve(int value) {\n  std::mutex mutex; std::condition_variable cv; bool ready = false; int payload = 0;\n  std::thread producer([&] { { std::lock_guard<std::mutex> lock(mutex); payload = value; ready = true; } cv.notify_one(); });\n  std::unique_lock<std::mutex> lock(mutex);\n  cv.wait(lock, [&] { return ready; });\n  int result = payload;\n  lock.unlock(); producer.join();\n  return result;\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\n#include <mutex>\n#include <condition_variable>\n#include <thread>\nint solve(int value) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\n#include <mutex>\n#include <condition_variable>\n#include <thread>\nint main() {\n  assert(solve(12) == 12);\n  assert(solve(-2) == -2);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\n#include <mutex>\n#include <condition_variable>\n#include <thread>\nint solve(int value) {\n  std::mutex mutex; std::condition_variable cv; bool ready = false; int payload = 0;\n  std::thread producer([&] { { std::lock_guard<std::mutex> lock(mutex); payload = value; ready = true; } cv.notify_one(); });\n  std::unique_lock<std::mutex> lock(mutex);\n  cv.wait(lock, [&] { return ready; });\n  int result = payload;\n  lock.unlock(); producer.join();\n  return result;\n}\nint main() { std::cout << solve(12) << "\\n"; }',
        output: '12',
      },
      {
        key: 'wait-unlocks',
        title: 'Release the mutex while waiting',
        definition:
          'condition_variable::wait releases the unique_lock mutex while blocked and reacquires it before returning.',
        rule: 'Use a unique_lock that owns the same mutex guarding the predicate.',
        violation:
          'Wait without allowing the producer to acquire the predicate mutex.',
        signature: 'int solve(int value)',
        solution:
          '#include <iostream>\n#include <cassert>\n#include <mutex>\n#include <condition_variable>\n#include <thread>\nint solve(int value) {\n  std::mutex mutex; std::condition_variable cv; bool done = false; int result = 0;\n  std::thread worker([&] { std::lock_guard<std::mutex> lock(mutex); result = value + 2; done = true; cv.notify_one(); });\n  { std::unique_lock<std::mutex> lock(mutex); cv.wait(lock, [&] { return done; }); }\n  worker.join();\n  return result;\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\n#include <mutex>\n#include <condition_variable>\n#include <thread>\nint solve(int value) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\n#include <mutex>\n#include <condition_variable>\n#include <thread>\nint main() {\n  assert(solve(5) == 7);\n  assert(solve(-2) == 0);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\n#include <mutex>\n#include <condition_variable>\n#include <thread>\nint solve(int value) {\n  std::mutex mutex; std::condition_variable cv; bool done = false; int result = 0;\n  std::thread worker([&] { std::lock_guard<std::mutex> lock(mutex); result = value + 2; done = true; cv.notify_one(); });\n  { std::unique_lock<std::mutex> lock(mutex); cv.wait(lock, [&] { return done; }); }\n  worker.join();\n  return result;\n}\nint main() { std::cout << solve(5) << "\\n"; }',
        output: '7',
      },
      {
        key: 'closed-queue-predicate',
        title: 'Represent queue shutdown in the predicate',
        definition:
          'A consumer can wait for either available data or an explicit closed state.',
        rule: 'Include closure in the wait predicate and distinguish an empty closed queue from data.',
        violation:
          'Wait only for nonempty data after the producer has permanently closed the queue.',
        signature: 'int solve(bool available)',
        solution:
          '#include <iostream>\n#include <cassert>\n#include <mutex>\n#include <condition_variable>\n#include <deque>\nint solve(bool available) {\n  std::mutex mutex; std::condition_variable cv;\n  std::deque<int> queue; bool closed = true;\n  if (available) queue.push_back(7);\n  std::unique_lock<std::mutex> lock(mutex);\n  cv.wait(lock, [&] { return closed || !queue.empty(); });\n  return queue.empty() ? -1 : queue.front();\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\n#include <mutex>\n#include <condition_variable>\n#include <deque>\nint solve(bool available) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\n#include <mutex>\n#include <condition_variable>\n#include <deque>\nint main() {\n  assert(solve(true) == 7);\n  assert(solve(false) == -1);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\n#include <mutex>\n#include <condition_variable>\n#include <deque>\nint solve(bool available) {\n  std::mutex mutex; std::condition_variable cv;\n  std::deque<int> queue; bool closed = true;\n  if (available) queue.push_back(7);\n  std::unique_lock<std::mutex> lock(mutex);\n  cv.wait(lock, [&] { return closed || !queue.empty(); });\n  return queue.empty() ? -1 : queue.front();\n}\nint main() { std::cout << solve(true) << "\\n"; }',
        output: '7',
      },
    ],
  },
  {
    key: 'atomics',
    title: 'Atomic scalar operations',
    unit: 'cpp-concurrency',
    atoms: [
      {
        key: 'atomic-load-store',
        title: 'Read and write an atomic value',
        definition:
          'An atomic object supports race-free atomic load and store operations on its own value.',
        rule: 'Use load and store for the atomic itself and separately synchronize other shared data.',
        violation:
          'Assume atomicity of one flag protects an unrelated payload without an ordering protocol.',
        signature: 'int solve(int value)',
        solution:
          '#include <iostream>\n#include <cassert>\n#include <atomic>\nint solve(int value) {\n  std::atomic<int> shared{0};\n  shared.store(value);\n  return shared.load();\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\n#include <atomic>\nint solve(int value) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\n#include <atomic>\nint main() {\n  assert(solve(9) == 9);\n  assert(solve(-3) == -3);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\n#include <atomic>\nint solve(int value) {\n  std::atomic<int> shared{0};\n  shared.store(value);\n  return shared.load();\n}\nint main() { std::cout << solve(9) << "\\n"; }',
        output: '9',
      },
      {
        key: 'atomic-fetch-add',
        title: 'Use an atomic read-modify-write',
        definition:
          'fetch_add atomically adds a value and returns the prior value.',
        rule: 'Use one atomic read-modify-write instead of a separate load and store increment.',
        violation:
          'Implement a concurrent increment as load then store on the same atomic.',
        signature: 'int solve(int value)',
        solution:
          '#include <iostream>\n#include <cassert>\n#include <atomic>\nint solve(int value) {\n  std::atomic<int> counter{value};\n  int previous = counter.fetch_add(3);\n  return previous * 10 + counter.load();\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\n#include <atomic>\nint solve(int value) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\n#include <atomic>\nint main() {\n  assert(solve(2) == 25);\n  assert(solve(0) == 3);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\n#include <atomic>\nint solve(int value) {\n  std::atomic<int> counter{value};\n  int previous = counter.fetch_add(3);\n  return previous * 10 + counter.load();\n}\nint main() { std::cout << solve(2) << "\\n"; }',
        output: '25',
      },
      {
        key: 'atomic-compare-exchange',
        title: 'Update only an expected atomic value',
        definition:
          'compare_exchange_strong writes the desired value only when the current value equals expected; failure updates expected.',
        rule: 'On failure, use the refreshed expected value before retrying an update.',
        violation: 'Retry forever with an unchanged stale expected value.',
        signature: 'int solve(int current, int expected)',
        solution:
          '#include <iostream>\n#include <cassert>\n#include <atomic>\nint solve(int current, int expected) {\n  std::atomic<int> value{current};\n  value.compare_exchange_strong(expected, 9);\n  return value.load();\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\n#include <atomic>\nint solve(int current, int expected) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\n#include <atomic>\nint main() {\n  assert(solve(4, 4) == 9);\n  assert(solve(4, 3) == 4);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\n#include <atomic>\nint solve(int current, int expected) {\n  std::atomic<int> value{current};\n  value.compare_exchange_strong(expected, 9);\n  return value.load();\n}\nint main() { std::cout << solve(4, 4) << "\\n"; }',
        output: '9',
      },
      {
        key: 'atomic-worker-count',
        title: 'Accumulate independent atomic events',
        definition:
          'An atomic counter can count events from multiple workers without lost read-modify-write updates.',
        rule: 'Use fetch_add for each independent counted event.',
        violation:
          'Replace fetch_add with a separate load-plus-store pair under contention.',
        signature: 'int solve(int count)',
        solution:
          '#include <iostream>\n#include <cassert>\n#include <atomic>\n#include <thread>\nint solve(int count) {\n  std::atomic<int> total{0};\n  auto worker = [&] { for (int i = 0; i < count; ++i) total.fetch_add(1, std::memory_order_relaxed); };\n  std::thread first(worker), second(worker); first.join(); second.join();\n  return total.load();\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\n#include <atomic>\n#include <thread>\nint solve(int count) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\n#include <atomic>\n#include <thread>\nint main() {\n  assert(solve(5) == 10);\n  assert(solve(0) == 0);\n  assert(solve(30) == 60);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\n#include <atomic>\n#include <thread>\nint solve(int count) {\n  std::atomic<int> total{0};\n  auto worker = [&] { for (int i = 0; i < count; ++i) total.fetch_add(1, std::memory_order_relaxed); };\n  std::thread first(worker), second(worker); first.join(); second.join();\n  return total.load();\n}\nint main() { std::cout << solve(5) << "\\n"; }',
        output: '10',
      },
    ],
  },
  {
    key: 'memory-ordering',
    title: 'Atomic ordering and publication',
    unit: 'cpp-concurrency',
    atoms: [
      {
        key: 'relaxed-counter',
        title: 'Use relaxed ordering for a counter',
        definition:
          'memory_order_relaxed preserves atomicity and per-object modification order without publishing unrelated data.',
        rule: 'Use relaxed counters only when they do not carry a cross-object publication contract.',
        violation:
          'Read an ordinary payload based only on a relaxed flag and assume a happens-before edge.',
        signature: 'int solve(int value)',
        solution:
          '#include <iostream>\n#include <cassert>\n#include <atomic>\nint solve(int value) {\n  std::atomic<int> count{value};\n  count.fetch_add(2, std::memory_order_relaxed);\n  return count.load(std::memory_order_relaxed);\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\n#include <atomic>\nint solve(int value) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\n#include <atomic>\nint main() {\n  assert(solve(4) == 6);\n  assert(solve(-2) == 0);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\n#include <atomic>\nint solve(int value) {\n  std::atomic<int> count{value};\n  count.fetch_add(2, std::memory_order_relaxed);\n  return count.load(std::memory_order_relaxed);\n}\nint main() { std::cout << solve(4) << "\\n"; }',
        output: '6',
      },
      {
        key: 'release-acquire',
        title: 'Publish data with release and acquire',
        definition:
          'An acquire load that reads a release store synchronizes with that store and makes the preceding payload writes visible.',
        rule: 'Read the payload only after acquiring the publication value from the producer.',
        violation: 'Read the payload before observing the release publication.',
        signature: 'int solve(int value)',
        solution:
          '#include <iostream>\n#include <cassert>\n#include <atomic>\n#include <thread>\nint solve(int value) {\n  int payload = 0; std::atomic<bool> ready{false};\n  std::thread producer([&] { payload = value; ready.store(true, std::memory_order_release); });\n  while (!ready.load(std::memory_order_acquire)) std::this_thread::yield();\n  int result = payload; producer.join();\n  return result;\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\n#include <atomic>\n#include <thread>\nint solve(int value) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\n#include <atomic>\n#include <thread>\nint main() {\n  assert(solve(17) == 17);\n  assert(solve(-4) == -4);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\n#include <atomic>\n#include <thread>\nint solve(int value) {\n  int payload = 0; std::atomic<bool> ready{false};\n  std::thread producer([&] { payload = value; ready.store(true, std::memory_order_release); });\n  while (!ready.load(std::memory_order_acquire)) std::this_thread::yield();\n  int result = payload; producer.join();\n  return result;\n}\nint main() { std::cout << solve(17) << "\\n"; }',
        output: '17',
      },
      {
        key: 'seq-cst',
        title: 'Use a sequentially consistent operation',
        definition:
          'Sequentially consistent atomic operations participate in one total order consistent with their required ordering constraints.',
        rule: 'Keep ordinary shared accesses data-race free even when atomics use seq_cst.',
        violation:
          'Use a seq_cst counter as a replacement for all unrelated data synchronization.',
        signature: 'int solve(int value)',
        solution:
          '#include <iostream>\n#include <cassert>\n#include <atomic>\nint solve(int value) {\n  std::atomic<int> count{value};\n  count.fetch_add(1, std::memory_order_seq_cst);\n  return count.load(std::memory_order_seq_cst);\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\n#include <atomic>\nint solve(int value) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\n#include <atomic>\nint main() {\n  assert(solve(5) == 6);\n  assert(solve(-1) == 0);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\n#include <atomic>\nint solve(int value) {\n  std::atomic<int> count{value};\n  count.fetch_add(1, std::memory_order_seq_cst);\n  return count.load(std::memory_order_seq_cst);\n}\nint main() { std::cout << solve(5) << "\\n"; }',
        output: '6',
      },
      {
        key: 'compare-exchange-retry',
        title: 'Retry a compare-exchange update',
        definition:
          'compare_exchange_weak may fail spuriously, so retry loops update the desired value from the refreshed expected value.',
        rule: 'Recompute desired from the expected value after every failed attempt.',
        violation:
          'Keep a fixed desired value computed from stale state on every retry.',
        signature: 'int solve(int value)',
        solution:
          '#include <iostream>\n#include <cassert>\n#include <atomic>\nint solve(int value) {\n  std::atomic<int> counter{value};\n  int expected = counter.load(std::memory_order_relaxed);\n  while (!counter.compare_exchange_weak(expected, expected + 3, std::memory_order_relaxed)) {}\n  return counter.load(std::memory_order_relaxed);\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\n#include <atomic>\nint solve(int value) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\n#include <atomic>\nint main() {\n  assert(solve(4) == 7);\n  assert(solve(-3) == 0);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\n#include <atomic>\nint solve(int value) {\n  std::atomic<int> counter{value};\n  int expected = counter.load(std::memory_order_relaxed);\n  while (!counter.compare_exchange_weak(expected, expected + 3, std::memory_order_relaxed)) {}\n  return counter.load(std::memory_order_relaxed);\n}\nint main() { std::cout << solve(4) << "\\n"; }',
        output: '7',
      },
    ],
  },
  {
    key: 'futures',
    title: 'Futures and result ownership',
    unit: 'cpp-concurrency',
    atoms: [
      {
        key: 'async-result',
        title: 'Get an asynchronous result',
        definition:
          'std::async with launch::async runs an invocation asynchronously and returns a future for its result.',
        rule: 'Choose an explicit launch policy when the distinction matters.',
        violation:
          'Assume the default launch policy guarantees a new worker thread.',
        signature: 'int solve(int value)',
        solution:
          '#include <iostream>\n#include <cassert>\n#include <future>\nint solve(int value) {\n  auto result = std::async(std::launch::async, [value] { return value * 2; });\n  return result.get();\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\n#include <future>\nint solve(int value) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\n#include <future>\nint main() {\n  assert(solve(7) == 14);\n  assert(solve(-2) == -4);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\n#include <future>\nint solve(int value) {\n  auto result = std::async(std::launch::async, [value] { return value * 2; });\n  return result.get();\n}\nint main() { std::cout << solve(7) << "\\n"; }',
        output: '14',
      },
      {
        key: 'promise-value',
        title: 'Fulfill a promise once',
        definition:
          'A promise supplies one result to the future associated with its shared state.',
        rule: 'Fulfill the promise exactly once with either a result or an exception.',
        violation:
          'Call set_value twice on the same already-satisfied promise.',
        signature: 'int solve(int value)',
        solution:
          '#include <iostream>\n#include <cassert>\n#include <future>\nint solve(int value) {\n  std::promise<int> source;\n  auto result = source.get_future();\n  source.set_value(value + 1);\n  return result.get();\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\n#include <future>\nint solve(int value) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\n#include <future>\nint main() {\n  assert(solve(5) == 6);\n  assert(solve(-1) == 0);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\n#include <future>\nint solve(int value) {\n  std::promise<int> source;\n  auto result = source.get_future();\n  source.set_value(value + 1);\n  return result.get();\n}\nint main() { std::cout << solve(5) << "\\n"; }',
        output: '6',
      },
      {
        key: 'future-exception',
        title: 'Propagate a worker exception',
        definition:
          'future::get rethrows an exception stored by the asynchronous operation.',
        rule: 'Handle exceptions at the future result boundary.',
        violation:
          'Assume worker exceptions are impossible because the caller did not throw directly.',
        signature: 'int solve(bool fail)',
        solution:
          '#include <iostream>\n#include <cassert>\n#include <future>\n#include <stdexcept>\nint solve(bool fail) {\n  auto result = std::async(std::launch::async, [fail] { if (fail) throw std::runtime_error("failed"); return 7; });\n  try { return result.get(); } catch (const std::runtime_error&) { return -1; }\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\n#include <future>\n#include <stdexcept>\nint solve(bool fail) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\n#include <future>\n#include <stdexcept>\nint main() {\n  assert(solve(false) == 7);\n  assert(solve(true) == -1);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\n#include <future>\n#include <stdexcept>\nint solve(bool fail) {\n  auto result = std::async(std::launch::async, [fail] { if (fail) throw std::runtime_error("failed"); return 7; });\n  try { return result.get(); } catch (const std::runtime_error&) { return -1; }\n}\nint main() { std::cout << solve(false) << "\\n"; }',
        output: '7',
      },
      {
        key: 'shared-future',
        title: 'Read a shared result repeatedly',
        definition:
          'shared_future permits multiple reads of the same shared result through copied handles.',
        rule: 'Use shared_future when multiple consumers must observe one result.',
        violation: 'Call get repeatedly on a consumed ordinary future.',
        signature: 'int solve(int value)',
        solution:
          '#include <iostream>\n#include <cassert>\n#include <future>\nint solve(int value) {\n  std::promise<int> source;\n  auto first = source.get_future().share(); auto second = first;\n  source.set_value(value);\n  return first.get() + second.get();\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\n#include <future>\nint solve(int value) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\n#include <future>\nint main() {\n  assert(solve(4) == 8);\n  assert(solve(-2) == -4);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\n#include <future>\nint solve(int value) {\n  std::promise<int> source;\n  auto first = source.get_future().share(); auto second = first;\n  source.set_value(value);\n  return first.get() + second.get();\n}\nint main() { std::cout << solve(4) << "\\n"; }',
        output: '8',
      },
    ],
  },
  {
    key: 'addressing',
    title: 'Address spaces and storage models',
    unit: 'cpp-performance',
    atoms: [
      {
        key: 'page-offset',
        title: 'Split a model address into page and offset',
        definition:
          'For a chosen page size, an address offset is its remainder modulo that page size.',
        rule: 'Treat the page size as an explicit model input rather than a universal hardware constant.',
        violation: 'Hardcode one page size and assume every system uses it.',
        signature:
          'std::size_t solve(std::size_t address, std::size_t page_size)',
        solution:
          '#include <iostream>\n#include <cassert>\n#include <cstddef>\nstd::size_t solve(std::size_t address, std::size_t page_size) {\n  if (page_size == 0) return 0;\n  return address % page_size;\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\n#include <cstddef>\nstd::size_t solve(std::size_t address, std::size_t page_size) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\n#include <cstddef>\nint main() {\n  assert(solve(1000, 256) == 232);\n  assert(solve(512, 256) == 0);\n  assert(solve(1, 0) == 0);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\n#include <cstddef>\nstd::size_t solve(std::size_t address, std::size_t page_size) {\n  if (page_size == 0) return 0;\n  return address % page_size;\n}\nint main() { std::cout << solve(1000, 256) << "\\n"; }',
        output: '232',
      },
      {
        key: 'page-translation',
        title: 'Translate through a page-table model',
        definition:
          'A page-table model maps a virtual page number to a frame while preserving the page offset.',
        rule: 'Validate the page lookup before constructing the translated model address.',
        violation:
          'Access a page-table entry beyond the represented address range.',
        signature:
          'long long solve(std::size_t address, const std::vector<int>& frames)',
        solution:
          '#include <iostream>\n#include <cassert>\n#include <cstddef>\n#include <vector>\nlong long solve(std::size_t address, const std::vector<int>& frames) {\n  constexpr std::size_t page_size = 256;\n  std::size_t page = address / page_size;\n  if (page >= frames.size() || frames[page] < 0) return -1;\n  return static_cast<long long>(frames[page]) * page_size + address % page_size;\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\n#include <cstddef>\n#include <vector>\nlong long solve(std::size_t address, const std::vector<int>& frames) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\n#include <cstddef>\n#include <vector>\nint main() {\n  assert(solve(300, {4, 9}) == 2348LL);\n  assert(solve(10, {-1}) == -1LL);\n  assert(solve(512, {4}) == -1LL);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\n#include <cstddef>\n#include <vector>\nlong long solve(std::size_t address, const std::vector<int>& frames) {\n  constexpr std::size_t page_size = 256;\n  std::size_t page = address / page_size;\n  if (page >= frames.size() || frames[page] < 0) return -1;\n  return static_cast<long long>(frames[page]) * page_size + address % page_size;\n}\nint main() { std::cout << solve(300, {4, 9}) << "\\n"; }',
        output: '2348',
      },
      {
        key: 'aligned-size',
        title: 'Round a model allocation size',
        definition:
          'A model allocation can round a byte count upward to a chosen positive alignment multiple.',
        rule: 'Use the requested alignment and avoid treating an illustrative value as an ABI guarantee.',
        violation: 'Round downward and allocate fewer bytes than requested.',
        signature:
          'std::size_t solve(std::size_t bytes, std::size_t alignment)',
        solution:
          '#include <iostream>\n#include <cassert>\n#include <cstddef>\n#include <limits>\nstd::size_t solve(std::size_t bytes, std::size_t alignment) {\n  if (alignment == 0) return 0;\n  std::size_t remainder = bytes % alignment;\n  if (remainder == 0) return bytes;\n  auto extra = alignment - remainder;\n  if (bytes > std::numeric_limits<std::size_t>::max() - extra) return 0;\n  return bytes + extra;\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\n#include <cstddef>\n#include <limits>\nstd::size_t solve(std::size_t bytes, std::size_t alignment) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\n#include <cstddef>\n#include <limits>\nint main() {\n  assert(solve(13, 8) == 16);\n  assert(solve(16, 8) == 16);\n  assert(solve(0, 8) == 0);\n  assert(solve(4, 0) == 0);\n  assert(solve(std::numeric_limits<std::size_t>::max(), 2) == 0);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\n#include <cstddef>\n#include <limits>\nstd::size_t solve(std::size_t bytes, std::size_t alignment) {\n  if (alignment == 0) return 0;\n  std::size_t remainder = bytes % alignment;\n  if (remainder == 0) return bytes;\n  auto extra = alignment - remainder;\n  if (bytes > std::numeric_limits<std::size_t>::max() - extra) return 0;\n  return bytes + extra;\n}\nint main() { std::cout << solve(13, 8) << "\\n"; }',
        output: '16',
      },
      {
        key: 'storage-duration',
        title: 'Distinguish local and persistent storage',
        definition:
          'A static local variable persists across calls while an ordinary local is recreated for each call.',
        rule: 'Choose persistent state deliberately and avoid hidden cross-test state.',
        violation:
          'Use a static local for per-request scratch state and assume calls are independent.',
        signature: 'int solve()',
        solution:
          '#include <iostream>\n#include <cassert>\nint solve() {\n  int local = 0;\n  auto call = [&] { int ordinary = 0; static int persistent = 0; ++ordinary; ++persistent; local += ordinary; return persistent; };\n  int first = call(); int second = call();\n  return (second - first) * 10 + local;\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\nint solve() {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\nint main() {\n  assert(solve() == 12);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\nint solve() {\n  int local = 0;\n  auto call = [&] { int ordinary = 0; static int persistent = 0; ++ordinary; ++persistent; local += ordinary; return persistent; };\n  int first = call(); int second = call();\n  return (second - first) * 10 + local;\n}\nint main() { std::cout << solve() << "\\n"; }',
        output: '12',
      },
    ],
  },
  {
    key: 'locality',
    title: 'Cache and traversal locality',
    unit: 'cpp-performance',
    atoms: [
      {
        key: 'contiguous-traversal',
        title: 'Traverse contiguous values',
        definition:
          'std::vector elements occupy contiguous storage, making sequential traversal straightforward.',
        rule: 'Traverse live elements using their valid contiguous range.',
        violation:
          'Perform pointer arithmetic across separate unrelated allocations.',
        signature: 'long long solve(const std::vector<int>& values)',
        solution:
          '#include <iostream>\n#include <cassert>\n#include <vector>\nlong long solve(const std::vector<int>& values) {\n  long long sum = 0;\n  for (int value : values) sum += value;\n  return sum;\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\n#include <vector>\nlong long solve(const std::vector<int>& values) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\n#include <vector>\nint main() {\n  assert(solve({2, 3, 4}) == 9LL);\n  assert(solve({}) == 0LL);\n  assert(solve({-5, 2}) == -3LL);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\n#include <vector>\nlong long solve(const std::vector<int>& values) {\n  long long sum = 0;\n  for (int value : values) sum += value;\n  return sum;\n}\nint main() { std::cout << solve({2, 3, 4}) << "\\n"; }',
        output: '9',
      },
      {
        key: 'cache-line-model',
        title: 'Count cache lines in an explicit model',
        definition:
          'A simple aligned model uses ceiling division to count fixed-width lines needed for a byte range.',
        rule: 'Label the line width and starting-alignment assumptions explicitly.',
        violation:
          'Present a deterministic line model as a measured hardware latency.',
        signature:
          'std::size_t solve(std::size_t bytes, std::size_t line_bytes)',
        solution:
          '#include <iostream>\n#include <cassert>\n#include <cstddef>\nstd::size_t solve(std::size_t bytes, std::size_t line_bytes) {\n  if (line_bytes == 0) return 0;\n  return bytes / line_bytes + (bytes % line_bytes != 0);\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\n#include <cstddef>\nstd::size_t solve(std::size_t bytes, std::size_t line_bytes) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\n#include <cstddef>\nint main() {\n  assert(solve(129, 64) == 3);\n  assert(solve(128, 64) == 2);\n  assert(solve(0, 64) == 0);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\n#include <cstddef>\nstd::size_t solve(std::size_t bytes, std::size_t line_bytes) {\n  if (line_bytes == 0) return 0;\n  return bytes / line_bytes + (bytes % line_bytes != 0);\n}\nint main() { std::cout << solve(129, 64) << "\\n"; }',
        output: '3',
      },
      {
        key: 'row-major-index',
        title: 'Index a row-major matrix',
        definition:
          'A row-major flat layout places row r and column c at r times the column count plus c.',
        rule: 'Use the known stride and validate row and column bounds.',
        violation:
          'Use a mismatched stride and silently access a different logical cell.',
        signature:
          'int solve(const std::vector<int>& cells, std::size_t rows, std::size_t cols, std::size_t row, std::size_t col)',
        solution:
          '#include <iostream>\n#include <cassert>\n#include <vector>\n#include <cstddef>\n#include <limits>\nint solve(const std::vector<int>& cells, std::size_t rows, std::size_t cols, std::size_t row, std::size_t col) {\n  if (row >= rows || col >= cols || cols == 0) return -1;\n  if (rows > std::numeric_limits<std::size_t>::max() / cols || rows * cols != cells.size()) return -1;\n  return cells[row * cols + col];\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\n#include <vector>\n#include <cstddef>\n#include <limits>\nint solve(const std::vector<int>& cells, std::size_t rows, std::size_t cols, std::size_t row, std::size_t col) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\n#include <vector>\n#include <cstddef>\n#include <limits>\nint main() {\n  assert(solve({1, 2, 3, 4, 5, 6}, 2, 3, 1, 1) == 5);\n  assert(solve({1, 2}, 1, 2, 1, 0) == -1);\n  assert(solve({}, std::numeric_limits<std::size_t>::max() / 2 + 1, 2, 0, 0) == -1);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\n#include <vector>\n#include <cstddef>\n#include <limits>\nint solve(const std::vector<int>& cells, std::size_t rows, std::size_t cols, std::size_t row, std::size_t col) {\n  if (row >= rows || col >= cols || cols == 0) return -1;\n  if (rows > std::numeric_limits<std::size_t>::max() / cols || rows * cols != cells.size()) return -1;\n  return cells[row * cols + col];\n}\nint main() { std::cout << solve({1, 2, 3, 4, 5, 6}, 2, 3, 1, 1) << "\\n"; }',
        output: '5',
      },
      {
        key: 'structure-arrays',
        title: 'Separate hot fields in a data layout',
        definition:
          'A structure-of-arrays layout stores one field contiguously across many records.',
        rule: 'Keep parallel field arrays at matching lengths before combining them.',
        violation:
          'Combine mismatched arrays and assume every index exists in both.',
        signature:
          'long long solve(const std::vector<int>& prices, const std::vector<int>& sizes)',
        solution:
          '#include <iostream>\n#include <cassert>\n#include <vector>\n#include <cstddef>\nlong long solve(const std::vector<int>& prices, const std::vector<int>& sizes) {\n  if (prices.size() != sizes.size()) return -1;\n  long long total = 0;\n  for (std::size_t i = 0; i < prices.size(); ++i) total += static_cast<long long>(prices[i]) * sizes[i];\n  return total;\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\n#include <vector>\n#include <cstddef>\nlong long solve(const std::vector<int>& prices, const std::vector<int>& sizes) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\n#include <vector>\n#include <cstddef>\nint main() {\n  assert(solve({10, 20}, {2, 3}) == 80LL);\n  assert(solve({1}, {}) == -1LL);\n  assert(solve({}, {}) == 0LL);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\n#include <vector>\n#include <cstddef>\nlong long solve(const std::vector<int>& prices, const std::vector<int>& sizes) {\n  if (prices.size() != sizes.size()) return -1;\n  long long total = 0;\n  for (std::size_t i = 0; i < prices.size(); ++i) total += static_cast<long long>(prices[i]) * sizes[i];\n  return total;\n}\nint main() { std::cout << solve({10, 20}, {2, 3}) << "\\n"; }',
        output: '80',
      },
    ],
  },
  {
    key: 'false-sharing',
    title: 'Alignment and false sharing',
    unit: 'cpp-performance',
    atoms: [
      {
        key: 'alignas-contract',
        title: 'Request object alignment',
        definition:
          'alignas requests an allowed alignment for an object type and can increase its padding.',
        rule: 'Use alignof to inspect the language alignment contract.',
        violation:
          'Assume an illustrative alignas value proves the actual cache-line size on every CPU.',
        signature: 'bool solve()',
        solution:
          '#include <iostream>\n#include <cassert>\nstruct alignas(64) Aligned { int value; };\nbool solve() {\n  return alignof(Aligned) >= 64;\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\nstruct alignas(64) Aligned { int value; };\nbool solve() {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\nint main() {\n  assert(solve() == true);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\nstruct alignas(64) Aligned { int value; };\nbool solve() {\n  return alignof(Aligned) >= 64;\n}\nint main() { std::cout << solve() << "\\n"; }',
        output: '1',
      },
      {
        key: 'padded-counter',
        title: 'Separate independent aligned counters',
        definition:
          'Giving independent counters separately aligned storage can reduce false sharing on a matching line-size model.',
        rule: 'Use synchronization for correctness and padding only for a measured layout concern.',
        violation:
          'Replace atomics with ordinary variables because padding allegedly prevents races.',
        signature: 'int solve(int first, int second)',
        solution:
          '#include <iostream>\n#include <cassert>\n#include <atomic>\nstruct alignas(64) Counter { std::atomic<int> value{0}; };\nint solve(int first, int second) {\n  Counter left{}, right{};\n  left.value.store(first); right.value.store(second);\n  return left.value.load() + right.value.load();\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\n#include <atomic>\nstruct alignas(64) Counter { std::atomic<int> value{0}; };\nint solve(int first, int second) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\n#include <atomic>\nint main() {\n  assert(solve(3, 4) == 7);\n  assert(solve(-2, 2) == 0);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\n#include <atomic>\nstruct alignas(64) Counter { std::atomic<int> value{0}; };\nint solve(int first, int second) {\n  Counter left{}, right{};\n  left.value.store(first); right.value.store(second);\n  return left.value.load() + right.value.load();\n}\nint main() { std::cout << solve(3, 4) << "\\n"; }',
        output: '7',
      },
      {
        key: 'layout-spacing',
        title: 'Inspect object stride',
        definition:
          'sizeof a complete aligned type includes the padding needed for arrays of that type.',
        rule: 'Check layout properties rather than asserting a speedup from alignment alone.',
        violation:
          'Treat a type size check as proof of lower measured latency.',
        signature: 'bool solve()',
        solution:
          '#include <iostream>\n#include <cassert>\n#include <atomic>\nstruct alignas(64) Counter { std::atomic<int> value{0}; };\nbool solve() {\n  return sizeof(Counter) >= alignof(Counter) && sizeof(Counter) % alignof(Counter) == 0;\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\n#include <atomic>\nstruct alignas(64) Counter { std::atomic<int> value{0}; };\nbool solve() {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\n#include <atomic>\nint main() {\n  assert(solve() == true);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\n#include <atomic>\nstruct alignas(64) Counter { std::atomic<int> value{0}; };\nbool solve() {\n  return sizeof(Counter) >= alignof(Counter) && sizeof(Counter) % alignof(Counter) == 0;\n}\nint main() { std::cout << solve() << "\\n"; }',
        output: '1',
      },
      {
        key: 'false-sharing-model',
        title: 'Detect a shared line in a model',
        definition:
          'Two different model addresses share one chosen line when their line-index quotients are equal.',
        rule: 'Specify the modeled line size and treat this as a layout calculation.',
        violation:
          'Claim a modeled address comparison measures coherence traffic.',
        signature:
          'bool solve(std::size_t first, std::size_t second, std::size_t line_bytes)',
        solution:
          '#include <iostream>\n#include <cassert>\n#include <cstddef>\nbool solve(std::size_t first, std::size_t second, std::size_t line_bytes) {\n  return line_bytes != 0 && first / line_bytes == second / line_bytes;\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\n#include <cstddef>\nbool solve(std::size_t first, std::size_t second, std::size_t line_bytes) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\n#include <cstddef>\nint main() {\n  assert(solve(0, 8, 64) == true);\n  assert(solve(0, 64, 64) == false);\n  assert(solve(5, 5, 0) == false);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\n#include <cstddef>\nbool solve(std::size_t first, std::size_t second, std::size_t line_bytes) {\n  return line_bytes != 0 && first / line_bytes == second / line_bytes;\n}\nint main() { std::cout << solve(0, 8, 64) << "\\n"; }',
        output: '1',
      },
    ],
  },
  {
    key: 'chrono',
    title: 'Durations and clocks',
    unit: 'cpp-performance',
    atoms: [
      {
        key: 'duration-count',
        title: 'Hold time as a std::chrono duration',
        definition:
          'A std::chrono duration stores a tick count together with its unit; count() returns the ticks, and adding durations of different units yields the finer unit.',
        rule: 'Keep time values as durations, and call count() only where a plain number is needed, stating its unit.',
        violation:
          'Add a count of seconds to a count of milliseconds as plain integers.',
        signature: 'long long solve(long long seconds, long long millis)',
        solution:
          '#include <iostream>\n#include <cassert>\n#include <chrono>\nlong long solve(long long seconds, long long millis) {\n  std::chrono::milliseconds total = std::chrono::seconds(seconds) + std::chrono::milliseconds(millis);\n  return total.count();\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\n#include <chrono>\nlong long solve(long long seconds, long long millis) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\n#include <chrono>\nint main() {\n  assert(solve(1, 500) == 1500LL);\n  assert(solve(0, 0) == 0LL);\n  assert(solve(2, -250) == 1750LL);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\n#include <chrono>\nlong long solve(long long seconds, long long millis) {\n  std::chrono::milliseconds total = std::chrono::seconds(seconds) + std::chrono::milliseconds(millis);\n  return total.count();\n}\nint main() { std::cout << solve(1, 500) << "\\n"; }',
        output: '1500',
      },
      {
        key: 'duration-cast',
        title: 'Convert durations with duration_cast',
        definition:
          'Converting a duration to a finer unit happens implicitly, but converting to a coarser unit needs std::chrono::duration_cast, which truncates toward zero.',
        rule: 'Use duration_cast only where dropping the remainder is acceptable, and keep the finer unit otherwise.',
        violation:
          'Cast to seconds early and then report the truncated value as an exact time.',
        signature: 'long long solve(long long millis)',
        solution:
          '#include <iostream>\n#include <cassert>\n#include <chrono>\nlong long solve(long long millis) {\n  return std::chrono::duration_cast<std::chrono::seconds>(std::chrono::milliseconds(millis)).count();\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\n#include <chrono>\nlong long solve(long long millis) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\n#include <chrono>\nint main() {\n  assert(solve(2700) == 2LL);\n  assert(solve(999) == 0LL);\n  assert(solve(-1500) == -1LL);\n  assert(solve(3000) == 3LL);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\n#include <chrono>\nlong long solve(long long millis) {\n  return std::chrono::duration_cast<std::chrono::seconds>(std::chrono::milliseconds(millis)).count();\n}\nint main() { std::cout << solve(2700) << "\\n"; }',
        output: '2',
      },
      {
        key: 'time-points',
        title: 'Subtract time points to get a duration',
        definition:
          'A time_point marks an instant on one clock; subtracting two time points of that clock gives the duration between them.',
        rule: 'Subtract time points from the same clock, and add a duration to a time point to move it.',
        violation:
          'Subtract time points that were read from two different clocks.',
        signature: 'long long solve(long long start_ms, long long end_ms)',
        solution:
          '#include <iostream>\n#include <cassert>\n#include <chrono>\nlong long solve(long long start_ms, long long end_ms) {\n  std::chrono::steady_clock::time_point start{std::chrono::milliseconds(start_ms)};\n  std::chrono::steady_clock::time_point end{std::chrono::milliseconds(end_ms)};\n  return std::chrono::duration_cast<std::chrono::milliseconds>(end - start).count();\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\n#include <chrono>\nlong long solve(long long start_ms, long long end_ms) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\n#include <chrono>\nint main() {\n  assert(solve(100, 145) == 45LL);\n  assert(solve(10, 10) == 0LL);\n  assert(solve(500, 200) == -300LL);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\n#include <chrono>\nlong long solve(long long start_ms, long long end_ms) {\n  std::chrono::steady_clock::time_point start{std::chrono::milliseconds(start_ms)};\n  std::chrono::steady_clock::time_point end{std::chrono::milliseconds(end_ms)};\n  return std::chrono::duration_cast<std::chrono::milliseconds>(end - start).count();\n}\nint main() { std::cout << solve(100, 145) << "\\n"; }',
        output: '45',
      },
      {
        key: 'steady-interval',
        title: 'Time an interval with steady_clock',
        definition:
          'std::chrono::steady_clock::now() reads a monotonic clock, so a later reading minus an earlier one is never negative.',
        rule: 'Measure intervals with steady_clock and convert the difference to an explicit unit before reporting it.',
        violation:
          'Time an interval with system_clock and trust it across clock adjustments.',
        signature: 'bool solve()',
        solution:
          '#include <iostream>\n#include <cassert>\n#include <chrono>\nbool solve() {\n  std::chrono::steady_clock::time_point first = std::chrono::steady_clock::now();\n  std::chrono::steady_clock::time_point second = std::chrono::steady_clock::now();\n  return second - first >= std::chrono::nanoseconds(0);\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\n#include <chrono>\nbool solve() {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\n#include <chrono>\nint main() {\n  assert(solve() == true);\n  assert(std::chrono::steady_clock::is_steady);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\n#include <chrono>\nbool solve() {\n  std::chrono::steady_clock::time_point first = std::chrono::steady_clock::now();\n  std::chrono::steady_clock::time_point second = std::chrono::steady_clock::now();\n  return second - first >= std::chrono::nanoseconds(0);\n}\nint main() { std::cout << solve() << "\\n"; }',
        output: '1',
      },
    ],
  },
  {
    key: 'measurement',
    title: 'Performance measurement contracts',
    unit: 'cpp-performance',
    atoms: [
      {
        key: 'elapsed-duration',
        title: 'Compute elapsed duration',
        definition:
          'Elapsed time is the end reading minus the start reading from a suitable consistent clock.',
        rule: 'Use a monotonic clock for intervals and keep units explicit.',
        violation:
          'Subtract unrelated clock epochs and label the result as nanoseconds.',
        signature: 'long long solve(long long start_ns, long long end_ns)',
        solution:
          '#include <iostream>\n#include <cassert>\nlong long solve(long long start_ns, long long end_ns) {\n  return end_ns >= start_ns ? end_ns - start_ns : -1;\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\nlong long solve(long long start_ns, long long end_ns) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\nint main() {\n  assert(solve(100, 145) == 45LL);\n  assert(solve(10, 10) == 0LL);\n  assert(solve(20, 5) == -1LL);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\nlong long solve(long long start_ns, long long end_ns) {\n  return end_ns >= start_ns ? end_ns - start_ns : -1;\n}\nint main() { std::cout << solve(100, 145) << "\\n"; }',
        output: '45',
      },
      {
        key: 'median-samples',
        title: 'Summarize supplied samples with a median',
        definition:
          'The median of sorted samples is the middle value, or the mean of the two middle values for an even sample count.',
        rule: 'Sort a copy and define the empty-sample contract explicitly.',
        violation:
          'Treat a single unusually slow sample as the median automatically.',
        signature: 'double solve(std::vector<int> samples)',
        solution:
          '#include <iostream>\n#include <cassert>\n#include <vector>\n#include <algorithm>\ndouble solve(std::vector<int> samples) {\n  if (samples.empty()) return -1;\n  std::sort(samples.begin(), samples.end());\n  auto middle = samples.size() / 2;\n  if (samples.size() % 2) return samples[middle];\n  return (static_cast<double>(samples[middle - 1]) + samples[middle]) / 2;\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\n#include <vector>\n#include <algorithm>\ndouble solve(std::vector<int> samples) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\n#include <vector>\n#include <algorithm>\nint main() {\n  assert(solve({9, 2, 4}) == 4.0);\n  assert(solve({1, 4, 2, 8}) == 3.0);\n  assert(solve({}) == -1.0);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\n#include <vector>\n#include <algorithm>\ndouble solve(std::vector<int> samples) {\n  if (samples.empty()) return -1;\n  std::sort(samples.begin(), samples.end());\n  auto middle = samples.size() / 2;\n  if (samples.size() % 2) return samples[middle];\n  return (static_cast<double>(samples[middle - 1]) + samples[middle]) / 2;\n}\nint main() { std::cout << solve({9, 2, 4}) << "\\n"; }',
        output: '4',
      },
      {
        key: 'nearest-rank-percentile',
        title: 'Compute a specified percentile rule',
        definition:
          'The nearest-rank percentile selects ceil(p times n) in a sorted one-based sample sequence.',
        rule: 'State the percentile convention and validate the percentile domain.',
        violation:
          'Report p99 without stating the sample count or rank convention.',
        signature: 'int solve(std::vector<int> samples, unsigned percentile)',
        solution:
          '#include <iostream>\n#include <cassert>\n#include <vector>\nint solve(std::vector<int> samples, unsigned percentile) {\n  if (samples.empty() || percentile == 0 || percentile > 100) return -1;\n  std::sort(samples.begin(), samples.end());\n  auto rank = (samples.size() / 100) * percentile + ((samples.size() % 100) * percentile + 99) / 100;\n  return samples[rank - 1];\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\n#include <vector>\nint solve(std::vector<int> samples, unsigned percentile) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\n#include <vector>\nint main() {\n  assert(solve({4, 1, 9, 2}, 50) == 2);\n  assert(solve({4, 1, 9, 2}, 99) == 9);\n  assert(solve({}, 99) == -1);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\n#include <vector>\nint solve(std::vector<int> samples, unsigned percentile) {\n  if (samples.empty() || percentile == 0 || percentile > 100) return -1;\n  std::sort(samples.begin(), samples.end());\n  auto rank = (samples.size() / 100) * percentile + ((samples.size() % 100) * percentile + 99) / 100;\n  return samples[rank - 1];\n}\nint main() { std::cout << solve({4, 1, 9, 2}, 50) << "\\n"; }',
        output: '2',
      },
      {
        key: 'operation-model',
        title: 'Separate a work model from timing',
        definition:
          'An operation-count model describes algorithmic work without pretending to measure machine execution time.',
        rule: 'Label modeled work separately from measured wall-clock results.',
        violation:
          'Turn one operation count into an invented latency measurement.',
        signature: 'long long solve(int rows, int columns)',
        solution:
          '#include <iostream>\n#include <cassert>\nlong long solve(int rows, int columns) {\n  if (rows < 0 || columns < 0) return -1;\n  long long visits = 0;\n  for (int r = 0; r < rows; ++r) for (int c = 0; c < columns; ++c) ++visits;\n  return visits;\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\nlong long solve(int rows, int columns) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\nint main() {\n  assert(solve(3, 4) == 12LL);\n  assert(solve(0, 4) == 0LL);\n  assert(solve(-1, 2) == -1LL);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\nlong long solve(int rows, int columns) {\n  if (rows < 0 || columns < 0) return -1;\n  long long visits = 0;\n  for (int r = 0; r < rows; ++r) for (int c = 0; c < columns; ++c) ++visits;\n  return visits;\n}\nint main() { std::cout << solve(3, 4) << "\\n"; }',
        output: '12',
      },
    ],
  },
  {
    key: 'order-book',
    title: 'Order-book operations',
    unit: 'cpp-applications',
    atoms: [
      {
        key: 'book-add-level',
        title: 'Aggregate a price level',
        definition:
          'A price-level map can aggregate positive order sizes at each price.',
        rule: 'Validate positive sizes before changing level quantity.',
        violation:
          'Add a negative order size and silently create negative displayed liquidity.',
        signature:
          'int solve(const std::vector<std::pair<int, int>>& orders, int target_price)',
        solution:
          '#include <iostream>\n#include <cassert>\n#include <vector>\n#include <utility>\n#include <map>\nint solve(const std::vector<std::pair<int, int>>& orders, int target_price) {\n  std::map<int, int> levels;\n  for (const auto& [price, size] : orders) if (size > 0) levels[price] += size;\n  auto it = levels.find(target_price);\n  return it == levels.end() ? 0 : it->second;\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\n#include <vector>\n#include <utility>\n#include <map>\nint solve(const std::vector<std::pair<int, int>>& orders, int target_price) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\n#include <vector>\n#include <utility>\n#include <map>\nint main() {\n  assert(solve({{100, 3}, {101, 8}, {100, 4}}, 100) == 7);\n  assert(solve({{100, -2}}, 100) == 0);\n  assert(solve({}, 1) == 0);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\n#include <vector>\n#include <utility>\n#include <map>\nint solve(const std::vector<std::pair<int, int>>& orders, int target_price) {\n  std::map<int, int> levels;\n  for (const auto& [price, size] : orders) if (size > 0) levels[price] += size;\n  auto it = levels.find(target_price);\n  return it == levels.end() ? 0 : it->second;\n}\nint main() { std::cout << solve({{100, 3}, {101, 8}, {100, 4}}, 100) << "\\n"; }',
        output: '7',
      },
      {
        key: 'book-cancel-level',
        title: 'Cancel bounded level quantity',
        definition:
          'A cancellation reduces available quantity without allowing the level to become negative.',
        rule: 'Clamp or reject over-cancellation according to the stated contract.',
        violation:
          'Subtract an unchecked cancel size from an unsigned quantity.',
        signature: 'int solve(int available, int cancelled)',
        solution:
          '#include <iostream>\n#include <cassert>\nint solve(int available, int cancelled) {\n  if (available < 0 || cancelled < 0) return -1;\n  return cancelled >= available ? 0 : available - cancelled;\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\nint solve(int available, int cancelled) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\nint main() {\n  assert(solve(10, 4) == 6);\n  assert(solve(3, 9) == 0);\n  assert(solve(4, -1) == -1);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\nint solve(int available, int cancelled) {\n  if (available < 0 || cancelled < 0) return -1;\n  return cancelled >= available ? 0 : available - cancelled;\n}\nint main() { std::cout << solve(10, 4) << "\\n"; }',
        output: '6',
      },
      {
        key: 'book-best-bid',
        title: 'Select the highest bid',
        definition:
          'The best bid is the highest available bid price, which an ordered price map exposes through rbegin.',
        rule: 'Define the empty-book result before accessing the reverse iterator.',
        violation: 'Dereference rbegin on an empty book.',
        signature: 'int solve(const std::map<int, int>& bids)',
        solution:
          '#include <iostream>\n#include <cassert>\n#include <map>\nint solve(const std::map<int, int>& bids) {\n  return bids.empty() ? -1 : bids.rbegin()->first;\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\n#include <map>\nint solve(const std::map<int, int>& bids) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\n#include <map>\nint main() {\n  assert(solve({{101, 2}, {105, 3}, {103, 8}}) == 105);\n  assert(solve({}) == -1);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\n#include <map>\nint solve(const std::map<int, int>& bids) {\n  return bids.empty() ? -1 : bids.rbegin()->first;\n}\nint main() { std::cout << solve({{101, 2}, {105, 3}, {103, 8}}) << "\\n"; }',
        output: '105',
      },
      {
        key: 'book-spread',
        title: 'Compute a best-price spread',
        definition:
          'A quoted spread is the best ask price minus the best bid price.',
        rule: 'Require both sides to be present before computing the spread.',
        violation: 'Treat an absent side as a valid zero-price quote.',
        signature:
          'int solve(const std::map<int, int>& bids, const std::map<int, int>& asks)',
        solution:
          '#include <iostream>\n#include <cassert>\n#include <map>\nint solve(const std::map<int, int>& bids, const std::map<int, int>& asks) {\n  if (bids.empty() || asks.empty()) return -1;\n  return asks.begin()->first - bids.rbegin()->first;\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\n#include <map>\nint solve(const std::map<int, int>& bids, const std::map<int, int>& asks) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\n#include <map>\nint main() {\n  assert(solve({{100, 2}, {102, 1}}, {{105, 3}, {108, 4}}) == 3);\n  assert(solve({}, {{105, 3}}) == -1);\n  assert(solve({{100, 2}}, {{99, 3}}) == -1);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\n#include <map>\nint solve(const std::map<int, int>& bids, const std::map<int, int>& asks) {\n  if (bids.empty() || asks.empty()) return -1;\n  return asks.begin()->first - bids.rbegin()->first;\n}\nint main() { std::cout << solve({{100, 2}, {102, 1}}, {{105, 3}, {108, 4}}) << "\\n"; }',
        output: '3',
      },
    ],
  },
  {
    key: 'ring-buffer',
    title: 'Bounded ring buffers',
    unit: 'cpp-applications',
    atoms: [
      {
        key: 'ring-wrap',
        title: 'Wrap a ring index',
        definition:
          'A bounded ring advances a valid index modulo its positive capacity.',
        rule: 'Reject zero capacity and out-of-range current indices.',
        violation: 'Evaluate modulo zero when the capacity is zero.',
        signature: 'int solve(int current, int capacity)',
        solution:
          '#include <iostream>\n#include <cassert>\nint solve(int current, int capacity) {\n  if (capacity <= 0 || current < 0 || current >= capacity) return -1;\n  return (current + 1) % capacity;\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\nint solve(int current, int capacity) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\nint main() {\n  assert(solve(2, 3) == 0);\n  assert(solve(0, 3) == 1);\n  assert(solve(0, 0) == -1);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\nint solve(int current, int capacity) {\n  if (capacity <= 0 || current < 0 || current >= capacity) return -1;\n  return (current + 1) % capacity;\n}\nint main() { std::cout << solve(2, 3) << "\\n"; }',
        output: '0',
      },
      {
        key: 'ring-bounded-push',
        title: 'Reject writes into a full ring',
        definition:
          'A count-based ring is full when its occupied count equals capacity.',
        rule: 'Check full before writing and advance the write index only after acceptance.',
        violation:
          'Overwrite the read position without notifying the consumer of data loss.',
        signature: 'int solve(const std::vector<int>& input)',
        solution:
          '#include <iostream>\n#include <cassert>\n#include <array>\n#include <vector>\n#include <cstddef>\nint solve(const std::vector<int>& input) {\n  std::array<int, 3> storage{}; std::size_t write = 0, count = 0;\n  for (int value : input) {\n    if (count == storage.size()) break;\n    storage[write] = value; write = (write + 1) % storage.size(); ++count;\n  }\n  return static_cast<int>(count);\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\n#include <array>\n#include <vector>\n#include <cstddef>\nint solve(const std::vector<int>& input) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\n#include <array>\n#include <vector>\n#include <cstddef>\nint main() {\n  assert(solve({1, 2, 3, 4, 5}) == 3);\n  assert(solve({1}) == 1);\n  assert(solve({}) == 0);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\n#include <array>\n#include <vector>\n#include <cstddef>\nint solve(const std::vector<int>& input) {\n  std::array<int, 3> storage{}; std::size_t write = 0, count = 0;\n  for (int value : input) {\n    if (count == storage.size()) break;\n    storage[write] = value; write = (write + 1) % storage.size(); ++count;\n  }\n  return static_cast<int>(count);\n}\nint main() { std::cout << solve({1, 2, 3, 4, 5}) << "\\n"; }',
        output: '3',
      },
      {
        key: 'ring-fifo-pop',
        title: 'Pop in FIFO order',
        definition:
          'A ring consumer reads at the current read index, advances it modulo capacity, and decreases the occupied count.',
        rule: 'Reject empty pops before accessing the read slot.',
        violation: 'Advance the read index when no occupied element exists.',
        signature: 'int solve(const std::vector<int>& input)',
        solution:
          '#include <iostream>\n#include <cassert>\n#include <array>\n#include <vector>\n#include <cstddef>\nint solve(const std::vector<int>& input) {\n  std::array<int, 4> storage{}; std::size_t write = 0, read = 0, count = 0;\n  for (int value : input) { if (count == storage.size()) break; storage[write] = value; write = (write + 1) % storage.size(); ++count; }\n  int encoded = 0;\n  while (count != 0) { encoded = encoded * 10 + storage[read]; read = (read + 1) % storage.size(); --count; }\n  return encoded;\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\n#include <array>\n#include <vector>\n#include <cstddef>\nint solve(const std::vector<int>& input) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\n#include <array>\n#include <vector>\n#include <cstddef>\nint main() {\n  assert(solve({1, 2, 3}) == 123);\n  assert(solve({4, 5}) == 45);\n  assert(solve({}) == 0);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\n#include <array>\n#include <vector>\n#include <cstddef>\nint solve(const std::vector<int>& input) {\n  std::array<int, 4> storage{}; std::size_t write = 0, read = 0, count = 0;\n  for (int value : input) { if (count == storage.size()) break; storage[write] = value; write = (write + 1) % storage.size(); ++count; }\n  int encoded = 0;\n  while (count != 0) { encoded = encoded * 10 + storage[read]; read = (read + 1) % storage.size(); --count; }\n  return encoded;\n}\nint main() { std::cout << solve({1, 2, 3}) << "\\n"; }',
        output: '123',
      },
      {
        key: 'ring-spsc-publication',
        title: 'Publish an SPSC slot safely',
        definition:
          'A single-producer single-consumer ring can use release/acquire index publication to protect payload writes and slot reuse.',
        rule: 'Keep exactly one writer per index and use acquire observations before consuming or reusing slots.',
        violation:
          'Reuse a slot before acquiring the consumer progress that released it.',
        signature: 'int solve(int count)',
        solution:
          '#include <iostream>\n#include <cassert>\n#include <array>\n#include <atomic>\n#include <thread>\n#include <cstddef>\nint solve(int count) {\n  if (count < 0 || count > 100) return -1;\n  std::array<int, 4> slots{}; std::atomic<std::size_t> write{0}, read{0};\n  std::thread producer([&] {\n    for (int value = 1; value <= count; ++value) {\n      auto position = write.load(std::memory_order_relaxed);\n      while (position - read.load(std::memory_order_acquire) >= slots.size()) std::this_thread::yield();\n      slots[position % slots.size()] = value;\n      write.store(position + 1, std::memory_order_release);\n    }\n  });\n  int total = 0;\n  for (int i = 0; i < count; ++i) {\n    auto position = read.load(std::memory_order_relaxed);\n    while (write.load(std::memory_order_acquire) == position) std::this_thread::yield();\n    total += slots[position % slots.size()];\n    read.store(position + 1, std::memory_order_release);\n  }\n  producer.join(); return total;\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\n#include <array>\n#include <atomic>\n#include <thread>\n#include <cstddef>\nint solve(int count) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\n#include <array>\n#include <atomic>\n#include <thread>\n#include <cstddef>\nint main() {\n  assert(solve(5) == 15);\n  assert(solve(0) == 0);\n  assert(solve(30) == 465);\n  assert(solve(-1) == -1);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\n#include <array>\n#include <atomic>\n#include <thread>\n#include <cstddef>\nint solve(int count) {\n  if (count < 0 || count > 100) return -1;\n  std::array<int, 4> slots{}; std::atomic<std::size_t> write{0}, read{0};\n  std::thread producer([&] {\n    for (int value = 1; value <= count; ++value) {\n      auto position = write.load(std::memory_order_relaxed);\n      while (position - read.load(std::memory_order_acquire) >= slots.size()) std::this_thread::yield();\n      slots[position % slots.size()] = value;\n      write.store(position + 1, std::memory_order_release);\n    }\n  });\n  int total = 0;\n  for (int i = 0; i < count; ++i) {\n    auto position = read.load(std::memory_order_relaxed);\n    while (write.load(std::memory_order_acquire) == position) std::this_thread::yield();\n    total += slots[position % slots.size()];\n    read.store(position + 1, std::memory_order_release);\n  }\n  producer.join(); return total;\n}\nint main() { std::cout << solve(5) << "\\n"; }',
        output: '15',
      },
    ],
  },
  {
    key: 'protocol',
    title: 'Binary parsing and protocol bounds',
    unit: 'cpp-applications',
    atoms: [
      {
        key: 'big-endian-word',
        title: 'Decode a big-endian word',
        definition:
          'A big-endian two-byte unsigned value places the high-order byte first.',
        rule: 'Convert bytes explicitly rather than relying on host byte layout.',
        violation:
          'Reinterpret arbitrary byte storage as a host integer and assume the byte order matches.',
        signature: 'unsigned solve(std::uint8_t high, std::uint8_t low)',
        solution:
          '#include <iostream>\n#include <cassert>\n#include <cstdint>\nunsigned solve(std::uint8_t high, std::uint8_t low) {\n  return (static_cast<unsigned>(high) << 8) | static_cast<unsigned>(low);\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\n#include <cstdint>\nunsigned solve(std::uint8_t high, std::uint8_t low) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\n#include <cstdint>\nint main() {\n  assert(solve(1, 2) == 258u);\n  assert(solve(0, 255) == 255u);\n  assert(solve(255, 255) == 65535u);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\n#include <cstdint>\nunsigned solve(std::uint8_t high, std::uint8_t low) {\n  return (static_cast<unsigned>(high) << 8) | static_cast<unsigned>(low);\n}\nint main() { std::cout << solve(1, 2) << "\\n"; }',
        output: '258',
      },
      {
        key: 'frame-length',
        title: 'Validate a length-prefixed frame',
        definition:
          'A frame length must fit within the available payload before parsing may read that payload.',
        rule: 'Validate both header availability and payload extent.',
        violation:
          'Read advertised bytes before checking the buffer contains them.',
        signature: 'bool solve(std::span<const std::uint8_t> bytes)',
        solution:
          '#include <iostream>\n#include <cassert>\n#include <span>\n#include <array>\n#include <cstdint>\n#include <cstddef>\nbool solve(std::span<const std::uint8_t> bytes) {\n  if (bytes.size() < 2) return false;\n  std::size_t length = (static_cast<unsigned>(bytes[0]) << 8) | bytes[1];\n  return length == bytes.size() - 2;\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\n#include <span>\n#include <array>\n#include <cstdint>\n#include <cstddef>\nbool solve(std::span<const std::uint8_t> bytes) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\n#include <span>\n#include <array>\n#include <cstdint>\n#include <cstddef>\nint main() {\n  std::array<std::uint8_t, 5> full{0, 3, 4, 5, 6};\n  assert(solve(full) == true);\n  std::array<std::uint8_t, 2> header{0, 3};\n  assert(solve(header) == false);\n  assert(solve({}) == false);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\n#include <span>\n#include <array>\n#include <cstdint>\n#include <cstddef>\nbool solve(std::span<const std::uint8_t> bytes) {\n  if (bytes.size() < 2) return false;\n  std::size_t length = (static_cast<unsigned>(bytes[0]) << 8) | bytes[1];\n  return length == bytes.size() - 2;\n}\nint main() {\n  std::array<std::uint8_t, 5> full{0, 3, 4, 5, 6};\n  std::cout << solve(full) << "\\n";\n}',
        output: '1',
      },
      {
        key: 'sequence-gap',
        title: 'Detect a message sequence gap',
        definition:
          'A sequence number lets a consumer detect a missing message when the received number differs from the expected next number.',
        rule: 'Track the expected next sequence separately from payload validation.',
        violation:
          'Treat a valid payload checksum as proof of contiguous delivery.',
        signature: 'bool solve(unsigned expected, unsigned received)',
        solution:
          '#include <iostream>\n#include <cassert>\nbool solve(unsigned expected, unsigned received) {\n  return expected != received;\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\nbool solve(unsigned expected, unsigned received) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\nint main() {\n  assert(solve(10, 12) == true);\n  assert(solve(10, 10) == false);\n  assert(solve(0, 1) == true);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\nbool solve(unsigned expected, unsigned received) {\n  return expected != received;\n}\nint main() { std::cout << solve(10, 12) << "\\n"; }',
        output: '1',
      },
      {
        key: 'rle-stream',
        title: 'Encode adjacent byte runs',
        definition:
          'Run-length encoding combines consecutive equal values into value/count pairs.',
        rule: 'Split a run when the byte changes and preserve input order.',
        violation:
          'Merge separated runs of the same byte across intervening values.',
        signature: 'std::string solve(std::string_view input)',
        solution:
          '#include <iostream>\n#include <cassert>\n#include <string>\n#include <string_view>\n#include <cstddef>\nstd::string solve(std::string_view input) {\n  std::string output;\n  for (std::size_t i = 0; i < input.size(); ) {\n    std::size_t end = i + 1; while (end < input.size() && input[end] == input[i]) ++end;\n    output.push_back(input[i]); output += std::to_string(end - i); i = end;\n  }\n  return output;\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\n#include <string>\n#include <string_view>\n#include <cstddef>\nstd::string solve(std::string_view input) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\n#include <string>\n#include <string_view>\n#include <cstddef>\nint main() {\n  assert(solve("aaabbc") == std::string("a3b2c1"));\n  assert(solve("aba") == std::string("a1b1a1"));\n  assert(solve("") == std::string(""));\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\n#include <string>\n#include <string_view>\n#include <cstddef>\nstd::string solve(std::string_view input) {\n  std::string output;\n  for (std::size_t i = 0; i < input.size(); ) {\n    std::size_t end = i + 1; while (end < input.size() && input[end] == input[i]) ++end;\n    output.push_back(input[i]); output += std::to_string(end - i); i = end;\n  }\n  return output;\n}\nint main() { std::cout << solve("aaabbc") << "\\n"; }',
        output: 'a3b2c1',
      },
    ],
  },
  {
    key: 'risk',
    title: 'Quantitative risk and event time',
    unit: 'cpp-applications',
    atoms: [
      {
        key: 'book-imbalance',
        title: 'Compute a normalized book imbalance',
        definition:
          'A basic size imbalance is bid size minus ask size divided by their positive total size.',
        rule: 'Define the zero-total result and reject negative size inputs.',
        violation: 'Divide by zero when both sides have zero size.',
        signature: 'double solve(int bid_size, int ask_size)',
        solution:
          '#include <iostream>\n#include <cassert>\ndouble solve(int bid_size, int ask_size) {\n  if (bid_size < 0 || ask_size < 0) return 0;\n  double total = static_cast<double>(bid_size) + ask_size;\n  return total == 0 ? 0 : (static_cast<double>(bid_size) - ask_size) / total;\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\ndouble solve(int bid_size, int ask_size) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\nint main() {\n  assert(solve(3, 1) == 0.5);\n  assert(solve(1, 3) == -0.5);\n  assert(solve(0, 0) == 0.0);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\ndouble solve(int bid_size, int ask_size) {\n  if (bid_size < 0 || ask_size < 0) return 0;\n  double total = static_cast<double>(bid_size) + ask_size;\n  return total == 0 ? 0 : (static_cast<double>(bid_size) - ask_size) / total;\n}\nint main() { std::cout << solve(3, 1) << "\\n"; }',
        output: '0.5',
      },
      {
        key: 'notional-limit',
        title: 'Check an integer notional limit',
        definition:
          'Notional quantity can be represented in integer ticks using a sufficiently wide multiplication type.',
        rule: 'Convert an operand to the wide type before multiplication.',
        violation: 'Multiply two int operands first and widen only the result.',
        signature: 'bool solve(int price_ticks, int quantity, long long limit)',
        solution:
          '#include <iostream>\n#include <cassert>\nbool solve(int price_ticks, int quantity, long long limit) {\n  if (price_ticks < 0 || quantity < 0 || limit < 0) return false;\n  return static_cast<long long>(price_ticks) * quantity <= limit;\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\nbool solve(int price_ticks, int quantity, long long limit) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\nint main() {\n  assert(solve(100, 3, 300) == true);\n  assert(solve(100, 4, 300) == false);\n  assert(solve(2000000000, 2, 4000000000LL) == true);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\nbool solve(int price_ticks, int quantity, long long limit) {\n  if (price_ticks < 0 || quantity < 0 || limit < 0) return false;\n  return static_cast<long long>(price_ticks) * quantity <= limit;\n}\nint main() { std::cout << solve(100, 3, 300) << "\\n"; }',
        output: '1',
      },
      {
        key: 'position-bound',
        title: 'Check the next net position',
        definition:
          'A position-limit check evaluates the post-trade net position against both negative and positive bounds.',
        rule: 'Widen before adding and compare both sides of the symmetric limit.',
        violation:
          'Apply abs to the minimum signed int and assume it is representable.',
        signature: 'bool solve(int position, int delta, int limit)',
        solution:
          '#include <iostream>\n#include <cassert>\nbool solve(int position, int delta, int limit) {\n  if (limit < 0) return false;\n  long long next = static_cast<long long>(position) + delta;\n  return next >= -static_cast<long long>(limit) && next <= limit;\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\nbool solve(int position, int delta, int limit) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\nint main() {\n  assert(solve(4, 3, 10) == true);\n  assert(solve(-8, -3, 10) == false);\n  assert(solve(8, 3, 10) == false);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\nbool solve(int position, int delta, int limit) {\n  if (limit < 0) return false;\n  long long next = static_cast<long long>(position) + delta;\n  return next >= -static_cast<long long>(limit) && next <= limit;\n}\nint main() { std::cout << solve(4, 3, 10) << "\\n"; }',
        output: '1',
      },
      {
        key: 'expiry-boundary',
        title: 'Expire an event at its deadline',
        definition:
          'An event-time contract can define expiry as now greater than or equal to the stated deadline.',
        rule: 'Use supplied event-time values so boundary tests are deterministic.',
        violation:
          'Depend on wall-clock sleep timing to decide a precise expiration boundary.',
        signature: 'bool solve(long long now, long long deadline)',
        solution:
          '#include <iostream>\n#include <cassert>\nbool solve(long long now, long long deadline) {\n  return now >= deadline;\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\nbool solve(long long now, long long deadline) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\nint main() {\n  assert(solve(10, 10) == true);\n  assert(solve(9, 10) == false);\n  assert(solve(11, 10) == true);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\nbool solve(long long now, long long deadline) {\n  return now >= deadline;\n}\nint main() { std::cout << solve(10, 10) << "\\n"; }',
        output: '1',
      },
    ],
  },
  {
    key: 'deque',
    title: 'Deque and queue adapters',
    unit: 'cpp-containers',
    atoms: [
      {
        key: 'deque-front-back',
        title: 'Insert at both deque ends',
        definition:
          'std::deque supports insertion at both ends without requiring contiguous element storage.',
        rule: 'Use iterator or indexed access rather than assuming one contiguous data pointer.',
        violation:
          'Pass an imagined deque data pointer and total size as one span.',
        signature: 'int solve(int first, int second)',
        solution:
          '#include <iostream>\n#include <cassert>\n#include <deque>\nint solve(int first, int second) {\n  std::deque<int> values; values.push_back(second); values.push_front(first);\n  return values.front() * 10 + values.back();\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\n#include <deque>\nint solve(int first, int second) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\n#include <deque>\nint main() {\n  assert(solve(2, 5) == 25);\n  assert(solve(3, 7) == 37);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\n#include <deque>\nint solve(int first, int second) {\n  std::deque<int> values; values.push_back(second); values.push_front(first);\n  return values.front() * 10 + values.back();\n}\nint main() { std::cout << solve(2, 5) << "\\n"; }',
        output: '25',
      },
      {
        key: 'deque-pop',
        title: 'Pop only a nonempty deque',
        definition:
          'pop_front removes the current front item from a nonempty deque.',
        rule: 'Read the front value before removing it and check empty first.',
        violation: 'Call pop_front on an empty deque.',
        signature: 'int solve(std::deque<int> values)',
        solution:
          '#include <iostream>\n#include <cassert>\n#include <deque>\nint solve(std::deque<int> values) {\n  if (values.empty()) return -1;\n  int first = values.front(); values.pop_front();\n  return first;\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\n#include <deque>\nint solve(std::deque<int> values) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\n#include <deque>\nint main() {\n  assert(solve({8, 3}) == 8);\n  assert(solve({}) == -1);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\n#include <deque>\nint solve(std::deque<int> values) {\n  if (values.empty()) return -1;\n  int first = values.front(); values.pop_front();\n  return first;\n}\nint main() { std::cout << solve({8, 3}) << "\\n"; }',
        output: '8',
      },
      {
        key: 'queue-fifo',
        title: 'Use a FIFO queue adapter',
        definition:
          'std::queue exposes front removal and back insertion to enforce FIFO operations.',
        rule: 'Use queue for arrival-order processing rather than priority ordering.',
        violation:
          'Expect queue to return the maximum-priority item automatically.',
        signature: 'int solve(const std::vector<int>& input)',
        solution:
          '#include <iostream>\n#include <cassert>\n#include <queue>\n#include <vector>\nint solve(const std::vector<int>& input) {\n  std::queue<int> pending; for (int value : input) pending.push(value);\n  if (pending.empty()) return -1;\n  int result = pending.front(); pending.pop(); return result;\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\n#include <queue>\n#include <vector>\nint solve(const std::vector<int>& input) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\n#include <queue>\n#include <vector>\nint main() {\n  assert(solve({4, 9, 2}) == 4);\n  assert(solve({}) == -1);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\n#include <queue>\n#include <vector>\nint solve(const std::vector<int>& input) {\n  std::queue<int> pending; for (int value : input) pending.push(value);\n  if (pending.empty()) return -1;\n  int result = pending.front(); pending.pop(); return result;\n}\nint main() { std::cout << solve({4, 9, 2}) << "\\n"; }',
        output: '4',
      },
      {
        key: 'bounded-deque',
        title: 'Enforce an explicit queue capacity',
        definition:
          'A deque does not have an application capacity limit unless the application enforces one.',
        rule: 'Check the configured capacity before accepting a queued message.',
        violation:
          'Rely on container allocation failure as the intended backpressure policy.',
        signature:
          'int solve(const std::vector<int>& input, std::size_t capacity)',
        solution:
          '#include <iostream>\n#include <cassert>\n#include <deque>\n#include <vector>\n#include <cstddef>\nint solve(const std::vector<int>& input, std::size_t capacity) {\n  std::deque<int> pending;\n  for (int value : input) { if (pending.size() == capacity) break; pending.push_back(value); }\n  return static_cast<int>(pending.size());\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\n#include <deque>\n#include <vector>\n#include <cstddef>\nint solve(const std::vector<int>& input, std::size_t capacity) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\n#include <deque>\n#include <vector>\n#include <cstddef>\nint main() {\n  assert(solve({1, 2, 3}, 2) == 2);\n  assert(solve({1}, 0) == 0);\n  assert(solve({}, 4) == 0);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\n#include <deque>\n#include <vector>\n#include <cstddef>\nint solve(const std::vector<int>& input, std::size_t capacity) {\n  std::deque<int> pending;\n  for (int value : input) { if (pending.size() == capacity) break; pending.push_back(value); }\n  return static_cast<int>(pending.size());\n}\nint main() { std::cout << solve({1, 2, 3}, 2) << "\\n"; }',
        output: '2',
      },
    ],
  },
  {
    key: 'callbacks',
    title: 'Callable objects and type erasure',
    unit: 'cpp-generic',
    atoms: [
      {
        key: 'function-object',
        title: 'Call a stateful function object',
        definition:
          'A type with operator() can carry state and behave as a callable object.',
        rule: 'Keep the callable state contract explicit.',
        violation:
          'Assume every callable object is stateless because it looks like a function call.',
        signature: 'int solve(int offset, int input)',
        solution:
          '#include <iostream>\n#include <cassert>\nstruct Offset { int amount; int operator()(int value) const { return value + amount; } };\nint solve(int offset, int input) {\n  Offset callback{offset};\n  return callback(input);\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\nstruct Offset { int amount; int operator()(int value) const { return value + amount; } };\nint solve(int offset, int input) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\nint main() {\n  assert(solve(3, 5) == 8);\n  assert(solve(-2, 7) == 5);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\nstruct Offset { int amount; int operator()(int value) const { return value + amount; } };\nint solve(int offset, int input) {\n  Offset callback{offset};\n  return callback(input);\n}\nint main() { std::cout << solve(3, 5) << "\\n"; }',
        output: '8',
      },
      {
        key: 'std-function',
        title: 'Store a type-erased callable',
        definition:
          'std::function stores a callable matching its signature and erases the concrete callable type.',
        rule: 'Choose a signature that matches the input and result contract.',
        violation: 'Assume an empty std::function is always safe to call.',
        signature: 'int solve(int value)',
        solution:
          '#include <iostream>\n#include <cassert>\n#include <functional>\nint solve(int value) {\n  std::function<int(int)> callback = [](int x) { return x * 3; };\n  return callback(value);\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\n#include <functional>\nint solve(int value) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\n#include <functional>\nint main() {\n  assert(solve(4) == 12);\n  assert(solve(-2) == -6);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\n#include <functional>\nint solve(int value) {\n  std::function<int(int)> callback = [](int x) { return x * 3; };\n  return callback(value);\n}\nint main() { std::cout << solve(4) << "\\n"; }',
        output: '12',
      },
      {
        key: 'empty-callback',
        title: 'Handle an absent callback',
        definition:
          'A std::function can be empty and converts to bool to report whether it holds a target.',
        rule: 'Check the target before invoking an optional callback.',
        violation: 'Invoke an empty std::function without an absence contract.',
        signature: 'int solve(bool configured, int value)',
        solution:
          '#include <iostream>\n#include <cassert>\n#include <functional>\nint solve(bool configured, int value) {\n  std::function<int(int)> callback;\n  if (configured) callback = [](int x) { return x + 2; };\n  return callback ? callback(value) : -1;\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\n#include <functional>\nint solve(bool configured, int value) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\n#include <functional>\nint main() {\n  assert(solve(true, 5) == 7);\n  assert(solve(false, 5) == -1);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\n#include <functional>\nint solve(bool configured, int value) {\n  std::function<int(int)> callback;\n  if (configured) callback = [](int x) { return x + 2; };\n  return callback ? callback(value) : -1;\n}\nint main() { std::cout << solve(true, 5) << "\\n"; }',
        output: '7',
      },
      {
        key: 'callback-copy',
        title: 'Copy callable state deliberately',
        definition:
          'Copying a value-owned std::function target can create independently stored captured state.',
        rule: 'Distinguish value-owned captures from deliberately shared captures.',
        violation:
          'Expect independent value-captured callback copies to share every update.',
        signature: 'int solve(int start)',
        solution:
          '#include <iostream>\n#include <cassert>\n#include <functional>\nint solve(int start) {\n  std::function<int()> first = [value = start]() mutable { return ++value; };\n  auto second = first;\n  int a = first(); int b = second();\n  return a * 10 + b;\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\n#include <functional>\nint solve(int start) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\n#include <functional>\nint main() {\n  assert(solve(2) == 33);\n  assert(solve(4) == 55);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\n#include <functional>\nint solve(int start) {\n  std::function<int()> first = [value = start]() mutable { return ++value; };\n  auto second = first;\n  int a = first(); int b = second();\n  return a * 10 + b;\n}\nint main() { std::cout << solve(2) << "\\n"; }',
        output: '33',
      },
    ],
  },
  {
    key: 'architecture',
    title: 'Message-processing invariants',
    unit: 'cpp-applications',
    atoms: [
      {
        key: 'backpressure',
        title: 'Represent producer backpressure',
        definition:
          'A bounded pipeline must report or otherwise handle inability to accept more work.',
        rule: 'Make the acceptance result part of the producer contract.',
        violation:
          'Return success after discarding a message without an explicit loss policy.',
        signature: 'bool solve(std::size_t current, std::size_t capacity)',
        solution:
          '#include <iostream>\n#include <cassert>\n#include <cstddef>\nbool solve(std::size_t current, std::size_t capacity) {\n  return current < capacity;\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\n#include <cstddef>\nbool solve(std::size_t current, std::size_t capacity) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\n#include <cstddef>\nint main() {\n  assert(solve(2, 3) == true);\n  assert(solve(3, 3) == false);\n  assert(solve(0, 0) == false);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\n#include <cstddef>\nbool solve(std::size_t current, std::size_t capacity) {\n  return current < capacity;\n}\nint main() { std::cout << solve(2, 3) << "\\n"; }',
        output: '1',
      },
      {
        key: 'idempotent-message',
        title: 'Apply each message identity once',
        definition:
          'An idempotency set can prevent a repeated message identity from changing state twice.',
        rule: 'Define stable event identities and retain them for the deduplication contract duration.',
        violation:
          'Generate a new identity for each retry and call the result deduplicated.',
        signature: 'int solve(const std::vector<int>& identities)',
        solution:
          '#include <iostream>\n#include <cassert>\n#include <vector>\n#include <set>\nint solve(const std::vector<int>& identities) {\n  std::set<int> seen; int applied = 0;\n  for (int id : identities) if (seen.insert(id).second) ++applied;\n  return applied;\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\n#include <vector>\n#include <set>\nint solve(const std::vector<int>& identities) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\n#include <vector>\n#include <set>\nint main() {\n  assert(solve({4, 8, 4, 9, 8}) == 3);\n  assert(solve({}) == 0);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\n#include <vector>\n#include <set>\nint solve(const std::vector<int>& identities) {\n  std::set<int> seen; int applied = 0;\n  for (int id : identities) if (seen.insert(id).second) ++applied;\n  return applied;\n}\nint main() { std::cout << solve({4, 8, 4, 9, 8}) << "\\n"; }',
        output: '3',
      },
      {
        key: 'replay-events',
        title: 'Replay an ordered event log',
        definition:
          'Deterministic event replay applies the recorded operations in their specified order.',
        rule: 'Preserve event order and make each operation contract explicit.',
        violation:
          'Sort a causal event log by payload value before replaying it.',
        signature:
          'int solve(int initial, const std::vector<std::pair<char, int>>& events)',
        solution:
          "#include <iostream>\n#include <cassert>\n#include <vector>\n#include <utility>\nint solve(int initial, const std::vector<std::pair<char, int>>& events) {\n  int state = initial;\n  for (const auto& [kind, value] : events) { if (kind == '=') state = value; else if (kind == '+') state += value; }\n  return state;\n}",
        starterCode:
          '#include <iostream>\n#include <cassert>\n#include <vector>\n#include <utility>\nint solve(int initial, const std::vector<std::pair<char, int>>& events) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          "#include <iostream>\n#include <cassert>\n#include <vector>\n#include <utility>\nint main() {\n  assert(solve(0, {{'=', 5}, {'+', 2}}) == 7);\n  assert(solve(0, {{'+', 2}, {'=', 5}}) == 5);\n  assert(solve(3, {}) == 3);\n}\n",
        example:
          "#include <iostream>\n#include <cassert>\n#include <vector>\n#include <utility>\nint solve(int initial, const std::vector<std::pair<char, int>>& events) {\n  int state = initial;\n  for (const auto& [kind, value] : events) { if (kind == '=') state = value; else if (kind == '+') state += value; }\n  return state;\n}\nint main() { std::cout << solve(0, {{'=', 5}, {'+', 2}}) << \"\\n\"; }",
        output: '7',
      },
      {
        key: 'snapshot-replay',
        title: 'Replay only after a snapshot boundary',
        definition:
          'A snapshot boundary states which earlier event positions are already represented by the saved state.',
        rule: 'Start replay after the recorded included-event boundary.',
        violation:
          'Apply already-snapshotted events again and double count them.',
        signature:
          'int solve(int snapshot, const std::vector<int>& deltas, std::size_t included)',
        solution:
          '#include <iostream>\n#include <cassert>\n#include <vector>\n#include <cstddef>\nint solve(int snapshot, const std::vector<int>& deltas, std::size_t included) {\n  if (included > deltas.size()) return -1;\n  int state = snapshot;\n  for (std::size_t i = included; i < deltas.size(); ++i) state += deltas[i];\n  return state;\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\n#include <vector>\n#include <cstddef>\nint solve(int snapshot, const std::vector<int>& deltas, std::size_t included) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\n#include <vector>\n#include <cstddef>\nint main() {\n  assert(solve(7, {3, 4, 5}, 2) == 12);\n  assert(solve(7, {3, 4}, 2) == 7);\n  assert(solve(0, {}, 1) == -1);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\n#include <vector>\n#include <cstddef>\nint solve(int snapshot, const std::vector<int>& deltas, std::size_t included) {\n  if (included > deltas.size()) return -1;\n  int state = snapshot;\n  for (std::size_t i = included; i < deltas.size(); ++i) state += deltas[i];\n  return state;\n}\nint main() { std::cout << solve(7, {3, 4, 5}, 2) << "\\n"; }',
        output: '12',
      },
    ],
  },
  {
    key: 'determinism',
    title: 'Deterministic domain boundaries',
    unit: 'cpp-applications',
    atoms: [
      {
        key: 'tie-break-order',
        title: 'Specify a total tie-break key',
        definition:
          'A deterministic priority contract can order equal-price records by an explicit secondary identity.',
        rule: 'Include the intended tie-break field in the comparator or use a specified stable policy.',
        violation:
          'Rely on unspecified equal-key ordering as an arrival-priority guarantee.',
        signature: 'int solve(std::vector<std::pair<int, int>> records)',
        solution:
          '#include <iostream>\n#include <cassert>\n#include <vector>\n#include <utility>\n#include <algorithm>\nint solve(std::vector<std::pair<int, int>> records) {\n  if (records.empty()) return -1;\n  std::sort(records.begin(), records.end(), [](const auto& a, const auto& b) { return a.first != b.first ? a.first < b.first : a.second < b.second; });\n  return records.front().second;\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\n#include <vector>\n#include <utility>\n#include <algorithm>\nint solve(std::vector<std::pair<int, int>> records) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\n#include <vector>\n#include <utility>\n#include <algorithm>\nint main() {\n  assert(solve({{100, 8}, {100, 3}, {101, 1}}) == 3);\n  assert(solve({{99, 7}, {100, 2}}) == 7);\n  assert(solve({}) == -1);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\n#include <vector>\n#include <utility>\n#include <algorithm>\nint solve(std::vector<std::pair<int, int>> records) {\n  if (records.empty()) return -1;\n  std::sort(records.begin(), records.end(), [](const auto& a, const auto& b) { return a.first != b.first ? a.first < b.first : a.second < b.second; });\n  return records.front().second;\n}\nint main() { std::cout << solve({{100, 8}, {100, 3}, {101, 1}}) << "\\n"; }',
        output: '3',
      },
      {
        key: 'integer-money',
        title: 'Keep exact integer tick accounting',
        definition:
          'Integer tick accounting represents discrete monetary units exactly within its checked integer range.',
        rule: 'State the tick scale and keep arithmetic within the representable domain.',
        violation:
          'Mix quantities expressed in different tick scales without conversion.',
        signature: 'long long solve(int price_ticks, int size, int fee_ticks)',
        solution:
          '#include <iostream>\n#include <cassert>\nlong long solve(int price_ticks, int size, int fee_ticks) {\n  return static_cast<long long>(price_ticks) * size + fee_ticks;\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\nlong long solve(int price_ticks, int size, int fee_ticks) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\nint main() {\n  assert(solve(125, 4, 3) == 503LL);\n  assert(solve(100, 0, 2) == 2LL);\n  assert(solve(2000000000, 2, 0) == 4000000000LL);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\nlong long solve(int price_ticks, int size, int fee_ticks) {\n  return static_cast<long long>(price_ticks) * size + fee_ticks;\n}\nint main() { std::cout << solve(125, 4, 3) << "\\n"; }',
        output: '503',
      },
      {
        key: 'seeded-engine',
        title: 'Use an explicit random-engine seed',
        definition:
          'A fixed seed and a specified standard random engine provide a reproducible engine sequence.',
        rule: 'Record the engine and seed; distribution algorithms can have separate portability contracts.',
        violation:
          'Report a seed without specifying the random engine or sampling procedure.',
        signature: 'bool solve(unsigned seed)',
        solution:
          '#include <iostream>\n#include <cassert>\n#include <random>\nbool solve(unsigned seed) {\n  std::mt19937 first(seed), second(seed);\n  for (int i = 0; i < 20; ++i) if (first() != second()) return false;\n  return true;\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\n#include <random>\nbool solve(unsigned seed) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\n#include <random>\nint main() {\n  assert(solve(42) == true);\n  assert(solve(0) == true);\n  assert(solve(12345) == true);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\n#include <random>\nbool solve(unsigned seed) {\n  std::mt19937 first(seed), second(seed);\n  for (int i = 0; i < 20; ++i) if (first() != second()) return false;\n  return true;\n}\nint main() { std::cout << solve(42) << "\\n"; }',
        output: '1',
      },
      {
        key: 'end-to-end-contract',
        title: 'Apply a deduplicated bounded risk event',
        definition:
          'Combining identity deduplication and a position bound gives each accepted event one explicit state transition.',
        rule: 'Deduplicate identities and reject a transition before mutating protected state.',
        violation:
          'Mutate position before checking the risk limit and forget to restore rejected changes.',
        signature:
          'int solve(int initial, const std::vector<std::pair<int, int>>& events, int limit)',
        solution:
          '#include <iostream>\n#include <cassert>\n#include <vector>\n#include <utility>\n#include <set>\nint solve(int initial, const std::vector<std::pair<int, int>>& events, int limit) {\n  if (limit < 0) return -1;\n  std::set<int> seen; int position = initial;\n  for (const auto& [id, delta] : events) {\n    if (!seen.insert(id).second) continue;\n    long long next = static_cast<long long>(position) + delta;\n    if (next >= -static_cast<long long>(limit) && next <= limit) position = static_cast<int>(next);\n  }\n  return position;\n}',
        starterCode:
          '#include <iostream>\n#include <cassert>\n#include <vector>\n#include <utility>\n#include <set>\nint solve(int initial, const std::vector<std::pair<int, int>>& events, int limit) {\n  // TODO: implement the operation described above.\n  static_assert(false, "Implement this function");\n}',
        tests:
          '#include <iostream>\n#include <cassert>\n#include <vector>\n#include <utility>\n#include <set>\nint main() {\n  assert(solve(0, {{1, 3}, {1, 3}, {2, 9}, {3, -2}}, 5) == 1);\n  assert(solve(2, {{1, -4}, {2, 1}}, 5) == -1);\n  assert(solve(0, {}, 5) == 0);\n}\n',
        example:
          '#include <iostream>\n#include <cassert>\n#include <vector>\n#include <utility>\n#include <set>\nint solve(int initial, const std::vector<std::pair<int, int>>& events, int limit) {\n  if (limit < 0) return -1;\n  std::set<int> seen; int position = initial;\n  for (const auto& [id, delta] : events) {\n    if (!seen.insert(id).second) continue;\n    long long next = static_cast<long long>(position) + delta;\n    if (next >= -static_cast<long long>(limit) && next <= limit) position = static_cast<int>(next);\n  }\n  return position;\n}\nint main() { std::cout << solve(0, {{1, 3}, {1, 3}, {2, 9}, {3, -2}}, 5) << "\\n"; }',
        output: '1',
      },
    ],
  },
];
const unitDetails: Record<string, [string, string]> = {
  'cpp-values': [
    'Values and types',
    'Initialize values, select types, and reason about conversions and numeric bounds.',
  ],
  'cpp-control': [
    'Control flow and functions',
    'Use explicit branches, terminating loops, parameters, overloads, and contracts.',
  ],
  'cpp-memory': [
    'References, pointers, and views',
    'Borrow live storage with clear nullability, bounds, and lifetime contracts.',
  ],
  'cpp-ownership': [
    'Lifetime and ownership',
    'Manage resources with RAII, smart pointers, moves, and value semantics.',
  ],
  'cpp-sequences': [
    'Strings, vectors, and iterators',
    'Parse and transform owning sequences while respecting capacity and invalidation.',
  ],
  'cpp-containers': [
    'Associative and queued containers',
    'Choose map, set, heap, deque, and queue representations for their contracts.',
  ],
  'cpp-generic': [
    'Algorithms and generic code',
    'Use predicates, templates, concepts, compile-time operations, and callable objects.',
  ],
  'cpp-errors': [
    'Errors and interfaces',
    'Represent absence, catch failures, preserve invariants, and define polymorphic interfaces.',
  ],
  'cpp-tooling': [
    'Compilation and test contracts',
    'Understand declarations, linkage, namespaces, assertions, boundaries, and numeric tests.',
  ],
  'cpp-concurrency': [
    'Threads and synchronization',
    'Own worker lifetimes, protect state, publish data, and collect asynchronous results.',
  ],
  'cpp-performance': [
    'Architecture and performance reasoning',
    'Model addresses, locality, alignment, false sharing, and supplied measurement samples.',
  ],
  'cpp-applications': [
    'Quant and system applications',
    'Build order-book, bounded-buffer, protocol, risk, and deterministic event operations.',
  ],
};

export const cppTopicStages: Record<string, string[]> = Object.fromEntries(
  topics.map((topic) => [
    `cpp-${topic.key}`,
    topic.atoms.map((atom, index) =>
      index === 3 ? `cpp-${topic.key}` : `cpp-${atom.key}`,
    ),
  ]),
);
const authored: Skill[] = topics.flatMap((topic, topicIndex) =>
  topic.atoms.map((atom, stageIndex) => {
    const id = cppTopicStages[`cpp-${topic.key}`][stageIndex];
    // Choice practice lives in knowledge points; this is the code exercise.
    const exercises: Omit<CodeQuestion, 'id'>[] = [
      {
        type: 'code',
        language: 'cpp',
        prompt: `Implement ${atom.signature}. ${atom.definition} ${atom.rule} The contract checks below specify required inputs and expected results. Keep the supplied helper declarations and required headers; define the operation without adding main().`,
        starterCode: atom.starterCode,
        solution: atom.solution,
        tests: atom.tests,
        contract: atom.tests,
        explanation: `${atom.definition} ${atom.rule}`,
        hint: `${atom.rule} The lesson gives a runnable example of this exact operation.`,
      },
    ];
    return {
      id,
      courseId: 'cpp',
      domain: 'programming',
      unitId: topic.unit,
      title: atom.title,
      summary: atom.definition,
      prerequisites: cppPrerequisites[id],
      order: topicIndex * 4 + stageIndex,
      estimatedMinutes: 6,
      topicId: `cpp-${topic.key}`,
      topicTitle: topic.title,
      stage: stageIndex + 1,
      stageCount: 4,
      assessment: { requiredTypes: ['code', 'choice'], reviewAnswers: 2 },
      lesson: {
        paragraphs: [
          atom.definition,
          `${atom.rule} A common error is to ${atom.violation[0].toLowerCase()}${atom.violation.slice(1)}`,
        ],
        example: {
          language: 'cpp',
          code: atom.example,
          output: atom.output,
          explanation: `${atom.definition} ${atom.rule}`,
        },
      },
      questions: withExerciseId(id, exercises),
      flashcards: [
        {
          id: `${id}-card1`,
          skillId: id,
          front: `Explain ${atom.title.toLowerCase()}.`,
          back: atom.definition,
        },
        {
          id: `${id}-card2`,
          skillId: id,
          front: `What rule keeps ${atom.title.toLowerCase()} correct?`,
          back: atom.rule,
        },
      ],
    };
  }),
);
const cppSkills = withTeachingOrder(authored);

export const cppCatalog: CurriculumCatalog = {
  courses: [
    {
      id: 'cpp',
      title: 'C++: from values to systems',
      description:
        '208 focused C++20 skills: lifetime and ownership, STL, generic code, compiler contracts, concurrency, architecture, and original quant-system applications.',
      domain: 'programming',
      language: 'cpp',
      skillIds: cppSkills.map((skill) => skill.id),
      resources: [
        {
          label: 'C++ working draft: language and library contracts',
          url: 'https://eel.is/c++draft/',
        },
        {
          label: 'C++ Core Guidelines',
          url: 'https://isocpp.github.io/CppCoreGuidelines/CppCoreGuidelines',
        },
        {
          label: 'GCC compilation stages',
          url: 'https://gcc.gnu.org/onlinedocs/gcc/Overall-Options.html',
        },
        {
          label: 'GetCracked public developer topic catalog',
          url: 'https://getcracked.io/progress-tree',
        },
      ],
    },
  ],
  units: Object.entries(unitDetails).map(([id, [title, description]]) => ({
    id,
    title,
    description,
    courseId: 'cpp',
  })),
  skills: cppSkills,
};
