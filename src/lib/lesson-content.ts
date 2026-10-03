import type { Skill } from './curriculum';

export interface WorkedExampleStep {
  title: string;
  explanation: string;
  code?: string;
  output?: string;
}

interface AuthoredStep {
  title: string;
  explanation: string;
  /** Inclusive, one-based lines from the published example, not new code. */
  lines?: [number, number];
}

// These subgoals explain the lesson example only. Assessment solutions and
// learner execution are deliberately absent from this content adapter.
const walkthroughs: Record<string, AuthoredStep[]> = {
  'print-output': [
    {
      title: 'Read the first instruction',
      explanation:
        'The first print() receives the string Hello, Python!. Its quotes mark where the text begins and ends; they are not characters in the output.',
      lines: [1, 1],
    },
    {
      title: 'Move to the next line',
      explanation:
        'After the first call finishes, Python runs the second print(). Each call ends with a new line, so the two messages stay in the same order on separate lines.',
      lines: [2, 2],
    },
  ],
  variables: [
    {
      title: 'Give the name its first value',
      explanation:
        'The assignment makes score refer to the integer 3. Nothing has been printed yet.',
      lines: [1, 1],
    },
    {
      title: 'Calculate before reassigning',
      explanation:
        'On the right of =, score still has its old value: 3 + 2 gives 5. Python then assigns 5 to score. The final print reads this updated value.',
      lines: [2, 3],
    },
  ],
  numbers: [
    {
      title: 'Start with a total duration',
      explanation:
        'minutes holds 137. We want to separate this total into complete hours and the minutes left over.',
      lines: [1, 1],
    },
    {
      title: 'Count complete groups',
      explanation:
        '137 // 60 gives 2: two complete groups use 120 minutes. The floor division result is the number of whole hours.',
      lines: [2, 2],
    },
    {
      title: 'Keep the remainder',
      explanation:
        '137 % 60 gives the remaining 17 minutes. print(hours, remaining) displays both values with a space between them.',
      lines: [3, 4],
    },
  ],
  strings: [
    {
      title: 'Name the values to insert',
      explanation:
        'name is the string Mira, and streak is the integer 3. The message will combine these values with fixed text.',
      lines: [1, 2],
    },
    {
      title: 'Fill the two placeholders',
      explanation:
        'The f before the quote enables formatting. {name} inserts Mira and {streak} inserts 3; the colon, space, and word days remain as written. The resulting string is assigned to message and printed.',
      lines: [3, 4],
    },
  ],
  types: [
    {
      title: 'Turn digit text into a number',
      explanation:
        'The quotes make "12" a string. int(text) produces the integer 12, which is assigned to count; text itself remains a string.',
      lines: [1, 2],
    },
    {
      title: 'Choose the operation by type',
      explanation:
        'count + 3 adds two integers and gives 15. For the second line, str(count) makes "12", so + joins it to " apples" instead of adding numbers.',
      lines: [3, 4],
    },
  ],
  comparisons: [
    {
      title: 'Check an inclusive boundary',
      explanation:
        'age is exactly 18. The condition age >= 18 accepts equality as well as larger values, so it produces True.',
      lines: [1, 2],
    },
    {
      title: 'Distinguish strictness from equality',
      explanation:
        'age > 18 is False because 18 is not larger than itself. age == 18 is True because the two values are equal. Each comparison produces its own boolean.',
      lines: [3, 4],
    },
  ],
  'boolean-logic': [
    {
      title: 'Check the two requirements',
      explanation:
        'age is 21, so age >= 18 is True. has_ticket is also True. These are the two conditions used by the entry rule.',
      lines: [1, 2],
    },
    {
      title: 'Require both conditions',
      explanation:
        'and combines the two True conditions into True. That boolean is assigned to can_enter and then printed; either requirement failing would make this rule false.',
      lines: [3, 4],
    },
  ],
  conditionals: [
    {
      title: 'Test the first branch',
      explanation:
        'score is 82. The first condition, score >= 90, is False, so the assignment of "A" is skipped.',
      lines: [1, 3],
    },
    {
      title: 'Stop at the first match',
      explanation:
        '82 >= 70 is True, so the elif body assigns "B" to grade. The chain now has a match and skips else, even though that branch appears later in the source.',
      lines: [4, 7],
    },
    {
      title: 'Continue after the branch',
      explanation:
        'print(grade) is outside the indented branch bodies. It runs after the chain and reads the grade chosen by the matching branch.',
      lines: [8, 8],
    },
  ],
  lists: [
    {
      title: 'Store the ordered items',
      explanation:
        'colors refers to a list containing blue, green, and red, in that order. The brackets hold three separate string items.',
      lines: [1, 1],
    },
    {
      title: 'Ask two different questions',
      explanation:
        'len(colors) counts the three items. "green" in colors checks whether that exact value is present and produces True. Neither operation changes the list.',
      lines: [2, 3],
    },
  ],
  indexing: [
    {
      title: 'Count from the beginning',
      explanation:
        'The positions in tools are 0 for pen, 1 for book, and 2 for lamp. tools[0] selects the first item because indexing starts at zero.',
      lines: [1, 2],
    },
    {
      title: 'Count from the end or within text',
      explanation:
        'tools[-1] selects the last item, lamp. String positions also start at zero: in "code", c is at 0 and o is at 1, so "code"[1] selects o.',
      lines: [3, 4],
    },
  ],
  'for-loops': [
    {
      title: 'Use the first item',
      explanation:
        'The loop first assigns "blue" to color. The indented print() inserts that current value into the message and displays Choose blue.',
      lines: [1, 3],
    },
    {
      title: 'Repeat the same body',
      explanation:
        'The next item assigns "gold" to color, so the same body displays Choose gold. With no items left, the loop ends. The body runs twice because the list has two items.',
      lines: [2, 3],
    },
  ],
  ranges: [
    {
      title: 'Identify start, stop, and step',
      explanation:
        'range(2, 7, 2) begins at 2, uses an excluded stop of 7, and increases by 2. The loop assigns each generated integer to number.',
      lines: [1, 1],
    },
    {
      title: 'Stop before crossing the boundary',
      explanation:
        'The generated values are 2, 4, and 6. The next candidate would be 8, which is beyond the excluded stop, so it is not generated. The body prints each accepted value on its own line.',
      lines: [1, 2],
    },
  ],
  accumulators: [
    {
      title: 'Initialize once before the loop',
      explanation:
        'total starts at 0 before any items are visited. Keeping this assignment outside the loop lets each update preserve the earlier work.',
      lines: [1, 1],
    },
    {
      title: 'Carry the total forward',
      explanation:
        'For 2, total becomes 0 + 2 = 2. For 5, it becomes 2 + 5 = 7. For 3, it becomes 7 + 3 = 10. Each update uses the previous total.',
      lines: [2, 3],
    },
    {
      title: 'Display after all updates',
      explanation:
        'The unindented print() runs after the loop, so it displays the completed total once rather than displaying every intermediate total.',
      lines: [4, 4],
    },
  ],
  'while-loops': [
    {
      title: 'Check before running the body',
      explanation:
        'count starts at 3. Since 3 > 0, the loop runs its body and prints 3 before decreasing count to 2.',
      lines: [1, 4],
    },
    {
      title: 'Move toward the stopping condition',
      explanation:
        'The condition is checked again for 2, then 1; both are positive, so they are printed and decremented. When count reaches 0, count > 0 is False and the body is skipped.',
      lines: [2, 4],
    },
    {
      title: 'Continue outside the loop',
      explanation:
        'The final print() is unindented, so it runs after the loop has stopped. The zero is not printed by the loop; Go! is printed instead.',
      lines: [5, 5],
    },
  ],
  'list-mutation': [
    {
      title: 'Add a third task',
      explanation:
        'tasks begins with read and practice. append("review") adds review at the end of the same list.',
      lines: [1, 2],
    },
    {
      title: 'Replace one item and remove another',
      explanation:
        'Assigning tasks[0] replaces read with plan. pop() then removes the last item, review, and returns it to the name finished. The list is left with plan and practice.',
      lines: [3, 4],
    },
    {
      title: 'Display the list and removed value',
      explanation:
        'The two print() calls show different values: first the remaining list, including its bracket-and-quote representation, then the removed string without quotes.',
      lines: [5, 6],
    },
  ],
  slicing: [
    {
      title: 'Include the start and exclude the stop',
      explanation:
        'In "python", positions 1, 2, and 3 hold y, t, and h. word[1:4] includes those positions and stops before position 4.',
      lines: [1, 2],
    },
    {
      title: 'Use an omitted start',
      explanation:
        'word[:2] begins at the start and stops before index 2. It therefore selects p and y. Slicing creates the selected string; word is unchanged.',
      lines: [3, 3],
    },
    {
      title: 'Traverse in the opposite direction',
      explanation:
        'The step -1 in word[::-1] visits characters from the end toward the beginning. With both endpoints omitted, it selects the whole string in reverse order.',
      lines: [4, 4],
    },
  ],
  dictionaries: [
    {
      title: 'Update an existing key',
      explanation:
        'scores initially maps Ada to 10 and Lin to 8. Assigning scores["Ada"] = 12 replaces Ada’s value while leaving Lin’s entry unchanged.',
      lines: [1, 2],
    },
    {
      title: 'Choose a lookup for each case',
      explanation:
        'The bracket lookup finds Ada’s updated value, 12. Sam is absent, so get("Sam", 0) returns the supplied default 0 without adding Sam to the dictionary.',
      lines: [3, 4],
    },
  ],
  'dictionary-loops': [
    {
      title: 'Unpack the first pair',
      explanation:
        'items() supplies key-value pairs in insertion order. The first pair assigns "Ada" to name and 8 to score; the f-string uses both values in one message.',
      lines: [1, 3],
    },
    {
      title: 'Repeat with the next pair',
      explanation:
        'The next pair assigns "Lin" to name and 10 to score. The same print() body builds the next line. Each score stays associated with its own name.',
      lines: [2, 3],
    },
  ],
  functions: [
    {
      title: 'Define reusable instructions',
      explanation:
        'def creates greet and its parameter name. The indented body is saved for calls; defining the function does not print a greeting yet.',
      lines: [1, 2],
    },
    {
      title: 'Call with the first argument',
      explanation:
        'greet("Ada") assigns "Ada" to this call’s parameter name. The body formats and prints Hello, Ada!, then control returns to the caller.',
      lines: [4, 4],
    },
    {
      title: 'Reuse the body with another argument',
      explanation:
        'greet("Lin") starts a new call with name set to "Lin". The function body stays the same while its input changes, producing the second greeting.',
      lines: [5, 5],
    },
  ],
  'return-values': [
    {
      title: 'Produce a value for the caller',
      explanation:
        'double multiplies its parameter by 2 and returns the result. return supplies data to the caller; the function itself does not print anything.',
      lines: [1, 2],
    },
    {
      title: 'Store and use the returned value',
      explanation:
        'double(6) returns 12, which is assigned to result. The caller then adds 1 and prints 13. The returned value can participate in another calculation.',
      lines: [4, 5],
    },
  ],
  parameters: [
    {
      title: 'Use the default when an argument is omitted',
      explanation:
        'The function defines quantity with a default of 1. In price_total(5), the positional argument supplies price, and the omitted quantity uses 1, so the product is 5.',
      lines: [1, 4],
    },
    {
      title: 'Match keyword arguments by name',
      explanation:
        'The second call explicitly supplies quantity=3 and price=5. Keywords match parameter names regardless of their written order, so the returned product is 15.',
      lines: [5, 5],
    },
  ],
  comprehensions: [
    {
      title: 'Visit the source items in order',
      explanation:
        'The comprehension takes each n from [-2, 1, 3, 0]. Its trailing condition checks n > 0 before adding a result for that item.',
      lines: [1, 2],
    },
    {
      title: 'Transform only the accepted items',
      explanation:
        '-2 fails the condition and contributes nothing. 1 contributes 1 * 1 = 1, and 3 contributes 3 * 3 = 9. Zero fails the strict condition. The new list therefore contains [1, 9] in that order.',
      lines: [2, 3],
    },
  ],
  errors: [
    {
      title: 'Try the expected conversion',
      explanation:
        'parse_count attempts int(text) inside try. For the first call, "12" is valid integer text, so the conversion succeeds and return sends 12 back to print().',
      lines: [1, 7],
    },
    {
      title: 'Handle the specific failure',
      explanation:
        'In the second call, int("oops") raises ValueError. That interrupts the try block and selects except ValueError, which returns 0. The caller can print that fallback value.',
      lines: [3, 8],
    },
  ],
  'problem-solving': [
    {
      title: 'Start with an empty mapping',
      explanation:
        'Each call creates a fresh counts dictionary. The example supplies code, learn, and code in that order; the loop visits each word once.',
      lines: [1, 3],
    },
    {
      title: 'Count a word’s first occurrence',
      explanation:
        'For the first code, get("code", 0) supplies 0 and the update stores 1. The next word, learn, is also new, so its entry starts at 1.',
      lines: [3, 4],
    },
    {
      title: 'Increase an existing count',
      explanation:
        'For the second code, get() reads the stored 1 instead of the default. Adding 1 replaces that entry with 2. After the loop, return sends the finished mapping to the caller’s print().',
      lines: [4, 7],
    },
  ],
  'rust-main': [
    {
      title: 'Find the entry point',
      explanation:
        'Execution starts in main, whose only statement calls greet(). The helper’s position above main does not make it run first, and without that call it would never run.',
      lines: [5, 7],
    },
    {
      title: 'Run the called function',
      explanation:
        'The call runs greet’s body, where println! prints the quoted text, without its quote marks, as one line. Then greet finishes and main ends.',
      lines: [1, 3],
    },
  ],
  'rust-format': [
    {
      title: 'Fill the placeholders in order',
      explanation:
        'main calls progress(3, 5). Inside progress, the first {} receives done and the second receives total, producing the text 3 of 5 done.',
      lines: [1, 3],
    },
    {
      title: 'Return before printing',
      explanation:
        'format! builds a String and the helper returns it as its final expression. println! then prints that returned String with {}, so no quote marks appear.',
      lines: [5, 7],
    },
  ],
  'rust-bindings': [
    {
      title: 'Create a binding that can change',
      explanation:
        'main calls bump(4), so n starts at 4. let mut value = n initializes value to 4 and permits later assignment to that binding.',
      lines: [1, 2],
    },
    {
      title: 'Update and return the new value',
      explanation:
        'value += 1 changes value from 4 to 5. The final value expression has no semicolon, so the helper returns 5 for main to print.',
      lines: [3, 5],
    },
  ],
  'rust-scope': [
    {
      title: 'Follow the inner binding',
      explanation:
        'scoped(3) starts with an outer n of 3. The inner let n uses that value to calculate 6 and shadows the outer name within the block. n + 1 produces 7 for inside.',
      lines: [1, 5],
    },
    {
      title: 'Return to the outer scope',
      explanation:
        'After the inner block, n again means the outer value 3. The final expression adds inside, 7, to that unchanged input and returns 10.',
      lines: [6, 7],
    },
  ],
  'cpp-integer-values': [
    {
      title: 'Pass a value from main',
      explanation:
        'Execution starts in main. Its call solve(7) gives incoming the integer value 7; declaring the helper above main does not execute its body by itself.',
      lines: [7, 7],
    },
    {
      title: 'Initialize before reading',
      explanation:
        'int saved = incoming creates saved with the incoming value, 7. return saved sends that initialized value back to main, where std::cout displays it followed by a new line.',
      lines: [3, 6],
    },
  ],
  'cpp-arithmetic': [
    {
      title: 'Identify the operand types',
      explanation:
        'main calls solve(7, 2). Both parameters are int, so / performs integer division. The divisor in this example is nonzero.',
      lines: [3, 5],
    },
    {
      title: 'Discard the fractional part',
      explanation:
        'The mathematical quotient is 3.5. Integer division truncates toward zero, leaving 3. The helper returns that integer for std::cout to display.',
      lines: [6, 6],
    },
  ],
  'cpp-explicit-casts': [
    {
      title: 'Convert before dividing',
      explanation:
        'solve(7, 2) receives two integers, but static_cast<double>(numerator) converts 7 to 7.0 before / is evaluated. The division therefore uses floating-point arithmetic.',
      lines: [3, 5],
    },
    {
      title: 'Preserve the fractional result',
      explanation:
        '7.0 divided by 2 gives 3.5. The helper returns that double for std::cout to display. Converting an already computed integer quotient would lose this fraction before the conversion.',
      lines: [6, 6],
    },
  ],
  'cpp-values': [
    {
      title: 'Check the signed bounds before adding',
      explanation:
        'main calls solve(4, 9). Because b is positive, the first guard checks whether a exceeds the largest int minus 9. The value 4 is within that bound, so this guard does not return false. The negative-b guard does not apply.',
      lines: [4, 6],
    },
    {
      title: 'Return the safety decision',
      explanation:
        'Neither guard rejects these inputs, so solve returns true. The helper checks whether addition is safe without computing the sum. std::cout uses its default boolean formatting to display true as 1; it does not print 13.',
      lines: [7, 9],
    },
  ],
};

/**
 * Present authored reasoning around the existing example. Output is always the
 * catalog's published result, never an invented or live execution trace.
 */
export function workedExampleSteps(skill: Skill): WorkedExampleStep[] {
  const example = skill.lesson.example;
  const authored = walkthroughs[skill.id];
  if (authored) {
    const sourceLines = example.code.split('\n');
    return [
      ...authored.map(({ title, explanation, lines }) => ({
        title,
        explanation,
        ...(lines
          ? { code: sourceLines.slice(lines[0] - 1, lines[1]).join('\n') }
          : {}),
      })),
      {
        title: 'Read the result',
        explanation: example.explanation,
        output: example.output,
      },
    ];
  }

  const isText = example.kind === 'text';
  return [
    {
      title: isText ? 'Read the given example' : 'Read the complete program',
      explanation: skill.lesson.paragraphs[0] || skill.summary,
      code: example.code,
    },
    {
      title: 'Follow the reasoning',
      explanation: example.explanation,
    },
    {
      title: 'Read the result',
      explanation:
        'Compare this published result with the example and its explanation.',
      output: example.output,
    },
  ];
}
