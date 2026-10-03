import { choose, predictOutput, type KnowledgePointModule } from './authoring';

export const knowledgePoints: KnowledgePointModule = {
  'rust-main': [
    {
      title: 'Execution starts at main',
      explanation: [
        'A Rust program starts by running the body of the function named main. Other functions run only when something calls them, wherever they appear in the file.',
      ],
      example: {
        language: 'rust',
        code: 'fn unused() {\n    println!("never");\n}\n\nfn main() {\n    println!("start");\n}',
        output: 'start',
        explanation:
          'unused is defined first, but nothing calls it. Only main runs, so only start is printed.',
      },
      questions: [
        predictOutput(
          'What does this complete Rust program print?',
          'fn helper() {\n    println!("helper");\n}\n\nfn main() {\n    println!("main");\n}',
          ['helper\nmain', 'main', 'helper', 'main\nhelper'],
          1,
          'helper is never called, so only main’s line is printed.',
        ),
        predictOutput(
          'What does this complete Rust program print?',
          'fn main() {\n    greet();\n    println!("done");\n}\n\nfn greet() {\n    println!("hi");\n}',
          ['done\nhi', 'hi\ndone', 'done', 'hi'],
          1,
          'main calls greet first, then prints done. Defining greet after main is fine.',
        ),
        choose(
          'Where does a Rust binary begin executing?',
          [
            'At the first line of the file',
            'At the body of fn main',
            'At the first function defined',
            'At every function, in source order',
          ],
          1,
          'main is the entry point; other functions run only when called.',
        ),
      ],
    },
    {
      title: 'Calls run in the order main makes them',
      explanation: [
        'Inside main, statements run from top to bottom. Calling a function runs its whole body, then execution continues after the call. A function called twice runs twice.',
      ],
      example: {
        language: 'rust',
        code: 'fn first() {\n    println!("first");\n}\n\nfn second() {\n    println!("second");\n}\n\nfn main() {\n    second();\n    first();\n}',
        output: 'second\nfirst',
        explanation:
          'Definition order does not matter. main calls second before first, so second prints first.',
      },
      questions: [
        predictOutput(
          'What does this complete Rust program print?',
          'fn ping() {\n    println!("ping");\n}\n\nfn main() {\n    ping();\n    ping();\n}',
          ['ping', 'ping\nping', 'pingping', 'Nothing'],
          1,
          'Each call runs the whole body, so two calls print two lines.',
        ),
        predictOutput(
          'What does this complete Rust program print?',
          'fn a() {\n    println!("a");\n}\n\nfn b() {\n    println!("b");\n    a();\n}\n\nfn main() {\n    b();\n    println!("c");\n}',
          ['a\nb\nc', 'b\na\nc', 'b\nc\na', 'c\nb\na'],
          1,
          'main calls b, which prints b and then calls a; main prints c afterwards.',
        ),
        predictOutput(
          'What does this complete Rust program print?',
          'fn main() {\n    println!("one");\n    two();\n}\n\nfn two() {\n    println!("two");\n}',
          ['two\none', 'one\ntwo', 'one', 'two'],
          1,
          'main prints one, then calls two. Defining two after main is allowed.',
        ),
        choose(
          'A function is defined but never called. When does its body run?',
          [
            'Before main',
            'After main',
            'Never',
            'Once, at the end of the file',
          ],
          2,
          'Only main runs automatically; uncalled functions never run.',
        ),
      ],
    },
    {
      title: 'Print a value with {}',
      explanation: [
        'The quoted text in println! is a format string. A pair of braces {} inside it is a placeholder: Rust replaces it with the value written after the string and a comma, so println!("{}", 7) prints 7.',
        'The value can be a calculation such as 2 + 3. Rust works it out first and prints the result, 5. Text inside the quotes is printed exactly as written and is never calculated.',
      ],
      example: {
        language: 'rust',
        code: 'fn main() {\n    println!("{}", 4 + 5);\n    println!("4 + 5");\n    println!("total: {}", 4 + 5);\n}',
        output: '9\n4 + 5\ntotal: 9',
        explanation:
          'The first line fills {} with the result of 4 + 5. The second has no placeholder, so its text prints unchanged. The third prints its text and fills {} with 9.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn main() {\n    println!("{}", 6 * 7);\n}',
          ['42', '6 * 7', '{}', '67'],
          0,
          'The placeholder is replaced by the value of 6 * 7, which is 42.',
        ),
        predictOutput(
          'What is printed when this runs?',
          'fn main() {\n    println!("10 - 4");\n    println!("{}", 10 - 4);\n}',
          ['6\n6', '10 - 4\n10 - 4', '10 - 4\n6', '6\n10 - 4'],
          2,
          'Text inside the quotes prints as written; only the value after the comma is calculated.',
        ),
        predictOutput(
          'What is the output of this program?',
          'fn show() {\n    println!("{}", 2 * 5);\n}\n\nfn main() {\n    println!("{}", 1 + 1);\n    show();\n}',
          ['10\n2', '2\n10', '1 + 1\n2 * 5', '2'],
          1,
          'main prints 2 first, then calls show, which prints 10.',
        ),
        choose(
          'Which line prints the number 12?',
          [
            'println!("6 + 6");',
            'println!(6 + 6);',
            'println!("{}");',
            'println!("{}", 6 + 6);',
          ],
          3,
          'The value goes after the format string, and {} marks where it appears. The other lines print the text 6 + 6 or do not compile.',
        ),
      ],
    },
  ],
  'rust-returns': [
    {
      title: 'Return a value with a tail expression',
      explanation: [
        'A function that produces a value states its type after an arrow, as in fn ten() -> i32. i32 is Rust’s everyday whole-number type. The last expression in the body, written without a semicolon, is the tail expression: its value is what the function returns.',
        'A call such as ten() then stands for the returned value, so println!("{}", ten()) prints it.',
      ],
      example: {
        language: 'rust',
        code: 'fn minutes_per_day() -> i32 {\n    24 * 60\n}\n\nfn main() {\n    println!("{}", minutes_per_day());\n}',
        output: '1440',
        explanation:
          '24 * 60 is the tail expression, so minutes_per_day returns 1440 and main prints it.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn total() -> i32 {\n    8 + 7\n}\n\nfn main() {\n    println!("{}", total());\n}',
          ['8 + 7', '15', '87', 'total'],
          1,
          'The tail 8 + 7 is evaluated, and the call total() stands for the returned 15.',
        ),
        predictOutput(
          'What is printed?',
          'fn change() -> i32 {\n    5 - 9\n}\n\nfn main() {\n    println!("{}", change());\n}',
          ['4', '14', '-4', '5 - 9'],
          2,
          '5 - 9 is -4, and an i32 can hold negative numbers.',
        ),
        choose(
          'A function is declared as fn count() -> i32. What must the end of its body provide?',
          [
            'An i32 expression with no semicolon after it',
            'A println! of the number to return',
            'The word i32 on a line of its own',
            'A number in quotes, such as "5"',
          ],
          0,
          'The tail expression, written without a semicolon, supplies the returned i32.',
        ),
        choose(
          'What does the -> i32 in fn score() -> i32 tell Rust?',
          [
            'score prints an i32 when it is called',
            'score needs one i32 argument to run',
            'score may only be called from main',
            'score gives an i32 back to its caller',
          ],
          3,
          'The type after the arrow is the type of the value the function returns.',
        ),
      ],
    },
    {
      title: 'A semicolon on the last line returns nothing',
      explanation: [
        'Putting a semicolon after the last expression turns it into a statement, and a statement produces no value. If the function promises -> i32, the compiler then rejects it with mismatched types: it expected an i32, but the body ends without one.',
        'Lines before the tail, such as println! calls, are statements and keep their semicolons. Only the final expression goes without one.',
      ],
      example: {
        language: 'rust',
        code: 'fn hours_per_week() -> i32 {\n    println!("multiplying");\n    7 * 24\n}\n\nfn main() {\n    println!("{}", hours_per_week());\n}',
        output: 'multiplying\n168',
        explanation:
          'The println! line is a statement, so it ends with a semicolon and runs first. 7 * 24 has no semicolon, so it is the returned value. Writing 7 * 24; would make the program fail to compile.',
      },
      questions: [
        choose(
          'What happens when this program is compiled?',
          [
            'It prints 42, ignoring the semicolon',
            'It prints 0, the default i32',
            'It prints 40 + 2 as written',
            'It fails to compile: no i32 is returned',
          ],
          3,
          'The semicolon makes 40 + 2 a statement, so the body produces no i32 even though the signature promises one.',
          'fn score() -> i32 {\n    40 + 2;\n}\n\nfn main() {\n    println!("{}", score());\n}',
        ),
        choose(
          'Which body makes fn ten() -> i32 return 10?',
          ['{ 10; }', '{ 10 }', '{ println!("10"); }', '{ "10" }'],
          1,
          'Only 10 without a semicolon is a tail expression of type i32.',
        ),
        predictOutput(
          'What does this program print?',
          'fn seven() -> i32 {\n    println!("computing");\n    3 + 4\n}\n\nfn main() {\n    println!("{}", seven());\n}',
          ['7', '7\ncomputing', 'computing\n7', 'computing'],
          2,
          'The call runs seven’s body: it prints computing, then returns 7, which main prints.',
        ),
        choose(
          'This function should return 24 but does not compile. Which change fixes it?',
          [
            'Remove the semicolon after 6 * 4',
            'Remove -> i32 from the first line',
            'Add a semicolon after the closing brace',
            'Wrap 6 * 4 in a println!',
          ],
          0,
          'Without the semicolon, 6 * 4 becomes the tail expression and supplies the promised i32.',
          'fn area() -> i32 {\n    6 * 4;\n}',
        ),
        predictOutput(
          'What is printed when this runs?',
          'fn ready() -> i32 {\n    println!("step 1");\n    println!("step 2");\n    2 * 3\n}\n\nfn main() {\n    println!("{}", ready());\n    println!("done");\n}',
          [
            '6\ndone',
            '6\nstep 1\nstep 2\ndone',
            'step 1\nstep 2\ndone',
            'step 1\nstep 2\n6\ndone',
          ],
          3,
          'The two statements in ready print first; then the tail 2 * 3 is returned and printed, and main prints done last.',
        ),
      ],
    },
    {
      title: 'Use a returned value in another expression',
      explanation: [
        'A call to a function that returns an i32 can be used anywhere an i32 can: inside println!, in arithmetic, or as the tail of another function. Rust runs the call first, then uses its value.',
        'This lets small functions build on each other: one function’s tail can combine the results of other calls.',
      ],
      example: {
        language: 'rust',
        code: 'fn base() -> i32 {\n    10\n}\n\nfn doubled() -> i32 {\n    base() * 2\n}\n\nfn main() {\n    println!("{}", doubled() + 1);\n}',
        output: '21',
        explanation:
          'doubled calls base and returns 10 * 2 = 20. main adds 1 to that value and prints 21.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn width() -> i32 {\n    3\n}\n\nfn height() -> i32 {\n    5\n}\n\nfn area() -> i32 {\n    width() * height()\n}\n\nfn main() {\n    println!("{}", area());\n}',
          ['8', '35', '15', '53'],
          2,
          'area multiplies the values returned by width and height: 3 * 5 = 15.',
        ),
        predictOutput(
          'What is printed?',
          'fn total() -> i32 {\n    3 * 2\n}\n\nfn left() -> i32 {\n    total() - 4\n}\n\nfn main() {\n    println!("{}", left());\n}',
          ['2', '10', '-2', '6'],
          0,
          'total returns 6, and left returns 6 - 4 = 2.',
        ),
        predictOutput(
          'What is the output of this program?',
          'fn one() -> i32 {\n    println!("one");\n    1\n}\n\nfn two() -> i32 {\n    println!("two");\n    one() + 1\n}\n\nfn main() {\n    println!("{}", two());\n}',
          ['one\ntwo\n2', '2', 'two\n2\none', 'two\none\n2'],
          3,
          'two prints first, then its tail calls one, which prints one and returns 1. two returns 2, and main prints it last.',
        ),
        choose(
          'fn total() -> i32 should return the sum of what price() and fee() return. Which body works?',
          [
            '{ price + fee }',
            '{ price() + fee() }',
            '{ price() + fee(); }',
            '{ println!("{}", price() + fee()); }',
          ],
          1,
          'Each helper needs parentheses to be called, and the sum must be the tail, with no semicolon.',
        ),
      ],
    },
  ],
  'rust-parameters': [
    {
      title: 'Give a parameter a name and a type',
      explanation: [
        'A parameter is written in the function’s parentheses as a name and a type, as in fn double(n: i32) -> i32. The type is required: fn double(n) does not compile.',
        'Each call passes a value, the argument, and inside the body the parameter name stands for that value. Another call can pass a different argument and get a different result.',
      ],
      example: {
        language: 'rust',
        code: 'fn double(n: i32) -> i32 {\n    n * 2\n}\n\nfn main() {\n    println!("{}", double(4));\n    println!("{}", double(-3));\n}',
        output: '8\n-6',
        explanation:
          'The first call runs the body with n = 4, the second with n = -3. The same tail n * 2 gives 8 and then -6.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn add_five(x: i32) -> i32 {\n    x + 5\n}\n\nfn main() {\n    println!("{}", add_five(10));\n}',
          ['5', '10', '15', '105'],
          2,
          'x is 10 for this call, so the tail x + 5 is 15.',
        ),
        predictOutput(
          'What is printed?',
          'fn square(n: i32) -> i32 {\n    n * n\n}\n\nfn main() {\n    println!("{}", square(3));\n    println!("{}", square(-4));\n}',
          ['9\n-16', '9\n16', '6\n-8', '3\n-4'],
          1,
          'Each call squares its own argument, and -4 * -4 is 16: two negatives multiply to a positive.',
        ),
        choose(
          'Which first line of a function is valid Rust?',
          [
            'fn triple(n: i32) -> i32 {',
            'fn triple(n) -> i32 {',
            'fn triple(i32 n) -> i32 {',
            'fn triple(n = i32) -> i32 {',
          ],
          0,
          'A parameter is written as name: type, and the type cannot be left out.',
        ),
        choose(
          'What happens when this program is compiled?',
          [
            'It prints 5, reading "4" as a number',
            'It prints 41, joining the text and 1',
            'It prints 4, ignoring the + 1 on text',
            'It fails to compile: "4" is not an i32',
          ],
          3,
          'The parameter is declared i32, and quoted text is a different type, so the call is rejected.',
          'fn inc(n: i32) -> i32 {\n    n + 1\n}\n\nfn main() {\n    println!("{}", inc("4"));\n}',
        ),
      ],
    },
    {
      title: 'Arguments fill parameters by position',
      explanation: [
        'Several parameters are separated by commas, each with its own type. A call’s first argument goes to the first parameter, the second to the second, and so on. Rust matches them by position only.',
        'Swapping the arguments of an operation like subtraction therefore changes the result.',
      ],
      example: {
        language: 'rust',
        code: 'fn take_away(start: i32, removed: i32) -> i32 {\n    start - removed\n}\n\nfn main() {\n    println!("{}", take_away(9, 2));\n    println!("{}", take_away(2, 9));\n}',
        output: '7\n-7',
        explanation:
          'In the first call start is 9 and removed is 2. In the second the values swap places, so the result is 2 - 9 = -7.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn gap(low: i32, high: i32) -> i32 {\n    high - low\n}\n\nfn main() {\n    println!("{}", gap(10, 2));\n}',
          ['8', '12', '-8', '-12'],
          2,
          'The first argument 10 goes to low and 2 goes to high, so the tail is 2 - 10 = -8.',
        ),
        predictOutput(
          'What is printed?',
          'fn pick_second(a: i32, b: i32, c: i32) -> i32 {\n    b\n}\n\nfn main() {\n    println!("{}", pick_second(7, 8, 9));\n}',
          ['7', '8', '9', '24'],
          1,
          'b is the second parameter, so it receives the second argument, 8.',
        ),
        predictOutput(
          'What is the output of this program?',
          'fn sub(a: i32, b: i32) -> i32 {\n    a - b\n}\n\nfn flipped(a: i32, b: i32) -> i32 {\n    sub(b, a)\n}\n\nfn main() {\n    println!("{}", flipped(10, 3));\n}',
          ['7', '13', '3', '-7'],
          3,
          'flipped passes its b (3) first, so sub computes 3 - 10. Each function has its own a and b.',
        ),
        choose(
          'fn rect(width: i32, height: i32) -> i32 is defined. Which call passes width 4 and height 9?',
          [
            'rect(4, 9)',
            'rect(9, 4)',
            'rect(height: 9, width: 4)',
            'rect(4)(9)',
          ],
          0,
          'Arguments go in parameter order; Rust has no named arguments.',
        ),
        choose(
          'fn split(total: i32, parts: i32) -> i32 is defined. What happens with the call split(6)?',
          [
            'parts is set to 0 by default',
            'total and parts both receive 6',
            'The program does not compile',
            'parts is set to 1 by default',
          ],
          2,
          'Rust parameters have no defaults: a call must pass exactly one argument per parameter.',
        ),
      ],
    },
    {
      title: 'Pass expressions and calls as arguments',
      explanation: [
        'An argument can be any i32 expression: a literal, a calculation like 2 * 6, or another call. Rust evaluates the arguments first, from left to right, and then runs the function with those values.',
        'In a nested call such as triple(add(2, 3)), the inner call runs first and its result is passed outward.',
      ],
      example: {
        language: 'rust',
        code: 'fn add(a: i32, b: i32) -> i32 {\n    a + b\n}\n\nfn triple(n: i32) -> i32 {\n    n * 3\n}\n\nfn main() {\n    println!("{}", triple(add(2, 3)));\n}',
        output: '15',
        explanation:
          'add(2, 3) runs first and returns 5. That 5 becomes the argument of triple, which returns 15.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn sub(a: i32, b: i32) -> i32 {\n    a - b\n}\n\nfn double(n: i32) -> i32 {\n    n * 2\n}\n\nfn main() {\n    println!("{}", sub(double(5), 4));\n}',
          ['2', '-6', '6', '14'],
          2,
          'double(5) is 10, which becomes a; 4 is b. So sub returns 10 - 4 = 6.',
        ),
        predictOutput(
          'What is printed?',
          'fn sub(a: i32, b: i32) -> i32 {\n    a - b\n}\n\nfn main() {\n    println!("{}", sub(2 * 6, 1 + 4));\n}',
          ['7', '-7', '17', '11'],
          0,
          'The arguments are evaluated first: a is 12 and b is 5, so the result is 7.',
        ),
        predictOutput(
          'What is the output of this program?',
          'fn show(n: i32) -> i32 {\n    println!("{}", n);\n    n\n}\n\nfn add(a: i32, b: i32) -> i32 {\n    a + b\n}\n\nfn main() {\n    println!("{}", add(show(1), show(2)));\n}',
          ['3', '2\n1\n3', '3\n1\n2', '1\n2\n3'],
          3,
          'Arguments are evaluated left to right, so show(1) prints before show(2). add runs after both, and its result prints last.',
        ),
        choose(
          'Which expression passes the result of add(2, 3) as the second argument of sub?',
          [
            'sub(add(2, 3), 10)',
            'sub(10, add(2, 3))',
            'sub(10, add, 2, 3)',
            'sub(10, add)(2, 3)',
          ],
          1,
          'The whole call add(2, 3) is written in the second argument position.',
        ),
      ],
    },
  ],
  'rust-format': [
    {
      title: 'Fill several {} placeholders in order',
      explanation: [
        'A format string may contain several {} placeholders. They are filled from the values after the string in written order: the first {} takes the first value, the second {} the second, and so on.',
        'Rust checks the count when compiling. println!("{} {}", 1) does not compile, because the second {} has no value to take.',
      ],
      example: {
        language: 'rust',
        code: 'fn main() {\n    println!("{} + {} = {}", 2, 3, 2 + 3);\n}',
        output: '2 + 3 = 5',
        explanation:
          'The three placeholders take 2, 3 and the value of 2 + 3, in that order. The + and = between them are ordinary text.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn main() {\n    println!("{}-{}", 7, 4);\n}',
          ['3', '4-7', '7-4', '7 4'],
          2,
          'The first {} takes 7 and the second takes 4; the - between them is just text.',
        ),
        predictOutput(
          'What is printed?',
          'fn main() {\n    println!("{} {} {}", 3 * 3, 1, 5 - 2);\n}',
          ['9 1 3', '3 1 9', '9 1 5', '3 * 3 1 5 - 2'],
          0,
          'Each value is evaluated, then the results fill the placeholders in order: 9, 1, 3.',
        ),
        predictOutput(
          'What is the output of this program?',
          'fn main() {\n    println!("{} is less than {}", 9, 4);\n}',
          [
            '4 is less than 9',
            '9 is less than 4',
            '{} is less than {}',
            '9 is less than',
          ],
          1,
          'Placeholders follow the order of the values, not the meaning of the sentence, so 9 comes first.',
        ),
        choose(
          'What happens when this program is compiled?',
          [
            'It prints 4 and 4, reusing the value',
            'It prints 4 and, leaving the end blank',
            'It prints 4 and {}, keeping the braces',
            'It fails to compile: one {} has no value',
          ],
          3,
          'Rust counts placeholders at compile time; two {} need two values.',
          'fn main() {\n    println!("{} and {}", 4);\n}',
        ),
      ],
    },
    {
      title: 'Build a String with format!',
      explanation: [
        'format! takes the same format string and values as println!, but instead of printing, it produces the finished text as a String. Nothing appears on screen until something prints that String.',
        'A function can hand text to its caller by declaring -> String and making the format! call its tail expression. The caller can print it with println!("{}", ...), which shows the characters without quotes.',
      ],
      example: {
        language: 'rust',
        code: 'fn label(n: i32) -> String {\n    format!("item #{}", n)\n}\n\nfn main() {\n    println!("{}", label(7));\n}',
        output: 'item #7',
        explanation:
          'label builds the text item #7 and returns it. main prints the returned String with {}.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn tag(n: i32) -> String {\n    format!("[{}]", n)\n}\n\nfn main() {\n    println!("{}", tag(5));\n}',
          ['5', '"[5]"', '[{}]', '[5]'],
          3,
          'format! fills the placeholder with 5, and printing a String with {} shows no quotes.',
        ),
        predictOutput(
          'What is printed?',
          'fn note(n: i32) -> String {\n    format!("note {}", n)\n}\n\nfn main() {\n    note(1);\n    println!("{}", note(2));\n}',
          ['note 1\nnote 2', 'note 2', 'note 1', 'note 2\nnote 1'],
          1,
          'format! only builds text. The String from note(1) is never printed, so only note 2 appears.',
        ),
        predictOutput(
          'What is the output of this program?',
          'fn ratio(a: i32, b: i32) -> String {\n    format!("{}:{}", b, a)\n}\n\nfn main() {\n    println!("{}", ratio(16, 9));\n}',
          ['9:16', '16:9', 'b:a', '"9:16"'],
          0,
          'a is 16 and b is 9, and the format! call lists b first, so the text is 9:16.',
        ),
        choose(
          'fn left(n: i32) -> String must give its caller text such as 3 left instead of printing it. Which body fits?',
          [
            '{ println!("{} left", n) }',
            '{ format!("{} left", n); }',
            '{ format!("{} left", n) }',
            '{ "n left" }',
          ],
          2,
          'format! builds the String, and leaving off the semicolon makes it the returned value.',
        ),
      ],
    },
    {
      title: 'Combine Strings and numbers in one line',
      explanation: [
        'A String fills a {} just like a number does: its characters are inserted, without quotes. Text built by one function can therefore be placed inside a larger format string, next to other values.',
        'Each value is still matched to a placeholder by position, whether it is a number, a String or a piece of quoted text.',
      ],
      example: {
        language: 'rust',
        code: 'fn unit(n: i32) -> String {\n    format!("{} cm", n)\n}\n\nfn main() {\n    println!("width {}, height {}", unit(30), unit(45));\n}',
        output: 'width 30 cm, height 45 cm',
        explanation:
          'Each call to unit returns a String. The first fills the first {} and the second fills the second.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn wrap(n: i32) -> String {\n    format!("<{}>", n)\n}\n\nfn twice(n: i32) -> String {\n    format!("{}{}", wrap(n), wrap(n))\n}\n\nfn main() {\n    println!("{}", twice(3));\n}',
          ['<3>', '<<3>>', '<3><3>', '<3> <3>'],
          2,
          'twice places two copies of wrap’s text side by side; its format string has no space between the placeholders.',
        ),
        predictOutput(
          'What is printed?',
          'fn main() {\n    println!("{} = {}", "total", 4 + 4);\n}',
          ['total = 8', '"total" = 8', 'total = 4 + 4', '8 = total'],
          0,
          'The quoted text fills the first {} without its quotes, and the value of 4 + 4 fills the second.',
        ),
        predictOutput(
          'What is the output of this program?',
          'fn pair(a: i32, b: i32) -> String {\n    format!("{}/{}", a, b)\n}\n\nfn main() {\n    println!("{} then {}", pair(1, 2), pair(2, 1));\n}',
          ['1/2 then 1/2', '2/1 then 1/2', '{}/{} then {}/{}', '1/2 then 2/1'],
          3,
          'pair(1, 2) builds 1/2 and pair(2, 1) builds 2/1; they fill the outer placeholders in order.',
        ),
        choose(
          'A function must return text such as 3/4 built from two whole numbers. Which signature fits?',
          [
            'fn frac(a: i32, b: i32) -> i32',
            'fn frac(a: i32, b: i32) -> String',
            'fn frac(a: i32, b: i32)',
            'fn frac(a: String, b: String) -> i32',
          ],
          1,
          'The inputs are numbers and the result is text, so the parameters are i32 and the return type is String.',
        ),
      ],
    },
  ],
  'rust-debug-format': [
    {
      title: 'Debug-print text with {:?} to see its quotes',
      explanation: [
        '{:?} is a placeholder like {}, but it prints a value’s Debug form, meant for the programmer rather than the user. Numbers look the same either way, but text printed with {:?} keeps its double quotes.',
        'Debug output also escapes special characters. In a string literal, \\" writes a quote character: {} prints it as a plain quote, while {:?} shows it as \\" so the start and end of the text stay clear.',
      ],
      example: {
        language: 'rust',
        code: 'fn main() {\n    println!("{} {:?}", 42, 42);\n    println!("{}", "ready");\n    println!("{:?}", "ready");\n}',
        output: '42 42\nready\n"ready"',
        explanation:
          'The number prints the same with both placeholders. The text prints bare with {} and inside quotes with {:?}.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn main() {\n    println!("{:?}", "go");\n}',
          ['go', '"go"', "'go'", '{:?}'],
          1,
          'The Debug form of text wraps it in double quotes.',
        ),
        predictOutput(
          'What is printed?',
          'fn label(n: i32) -> String {\n    format!("{} kg", n)\n}\n\nfn main() {\n    println!("{:?} / {}", label(3), label(3));\n}',
          ['3 kg / 3 kg', '"3 kg" / "3 kg"', '3 kg / "3 kg"', '"3 kg" / 3 kg'],
          3,
          'The first placeholder is {:?}, so that copy keeps its quotes; the second uses {} and prints the bare text.',
        ),
        predictOutput(
          'What is the output of this program?',
          'fn main() {\n    println!("[{:?}]", 5 - 8);\n}',
          ['[-3]', '["-3"]', '[5 - 8]', '[3]'],
          0,
          'Numbers have no quotes in their Debug form, so -3 prints just as it would with {}.',
        ),
        predictOutput(
          'What does this program print?',
          'fn main() {\n    println!("{:?}", "say \\"hi\\"");\n}',
          ['say "hi"', '"say "hi""', '"say \\"hi\\""', '"say hi"'],
          2,
          'Debug output adds outer quotes and escapes the inner ones as \\", so the boundaries of the text stay clear.',
        ),
      ],
    },
    {
      title: 'Debug-print tuples and arrays',
      explanation: [
        'Tuples and arrays have no {} form: println!("{}", (1, 2)) does not compile, because a tuple has no plain user-facing text. {:?} prints their structure instead: a tuple in parentheses, an array in square brackets, with elements separated by a comma and a space.',
        'Each element appears in its own Debug form, so text inside a tuple or array keeps its quotes.',
      ],
      example: {
        language: 'rust',
        code: 'fn main() {\n    let point = (3, -1);\n    let scores = [10, 20, 30];\n    println!("{:?}", point);\n    println!("{:?}", scores);\n}',
        output: '(3, -1)\n[10, 20, 30]',
        explanation:
          'The tuple prints with parentheses and the array with square brackets, each showing every element in order.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn main() {\n    let pair = (7, true);\n    println!("{:?}", pair);\n}',
          ['7 true', '[7, true]', '(7, true)', '(7,true)'],
          2,
          'A tuple’s Debug form lists its fields in parentheses, separated by a comma and a space.',
        ),
        predictOutput(
          'What is printed?',
          'fn main() {\n    let words = ["red", "blue"];\n    println!("{:?}", words);\n}',
          ['["red", "blue"]', '[red, blue]', '("red", "blue")', 'red blue'],
          0,
          'An array prints in square brackets, and each text element keeps its quotes in Debug form.',
        ),
        choose(
          'What happens when this program is compiled?',
          [
            'It prints (1, 2), as {:?} would',
            'It prints 1 2, without the brackets',
            'It prints 1, the first field only',
            'It fails to compile: {} cannot print a tuple',
          ],
          3,
          'A tuple has no {} form; printing it needs {:?}.',
          'fn main() {\n    let t = (1, 2);\n    println!("{}", t);\n}',
        ),
        predictOutput(
          'What is the output of this program?',
          'fn main() {\n    let entry = (4, "four", false);\n    println!("{:?}", entry);\n}',
          [
            '(4, four, false)',
            '(4, "four", false)',
            '[4, "four", false]',
            '4 "four" false',
          ],
          1,
          'Inside the tuple’s Debug form, the text field keeps its quotes.',
        ),
      ],
    },
    {
      title: 'Mix {} and {:?} in one format string',
      explanation: [
        'Each placeholder picks its own form, so one format string can mix {} and {:?}, and format! accepts {:?} as well. A common pattern prints a whole tuple or array with {:?} and single number fields with {}.',
        'Reach for {:?} when you need to see exactly what a value holds, such as spaces at the edge of text, which {} prints invisibly.',
      ],
      example: {
        language: 'rust',
        code: 'fn swap(pair: (i32, i32)) -> (i32, i32) {\n    (pair.1, pair.0)\n}\n\nfn main() {\n    let flipped = swap((1, 9));\n    println!("{} then {}", flipped.0, flipped.1);\n    println!("{:?}", flipped);\n}',
        output: '9 then 1\n(9, 1)',
        explanation:
          'Each field is a number, so {} can print it. The whole tuple needs {:?}.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn main() {\n    let p = (2, 5);\n    println!("{} {:?}", p.1, p);\n}',
          ['5 (2, 5)', '2 (2, 5)', '(5) (2, 5)', '5 2 5'],
          0,
          'p.1 is the number 5, printed with {}; the whole tuple prints with {:?}.',
        ),
        predictOutput(
          'What is printed?',
          'fn describe(a: [i32; 2]) -> String {\n    format!("{:?} has {} items", a, a.len())\n}\n\nfn main() {\n    println!("{}", describe([4, 6]));\n}',
          [
            '4, 6 has 2 items',
            '[4, 6] has 3 items',
            '[4, 6] has 2 items',
            '"[4, 6]" has 2 items',
          ],
          2,
          'format! writes the array’s Debug form and its length into the String, and printing a String with {} adds no quotes.',
        ),
        predictOutput(
          'What is the output of this program?',
          'fn main() {\n    println!("[{}] {:?}", "ok ", "ok ");\n}',
          ['[ok] "ok"', '[ok ] ok ', '["ok "] ok ', '[ok ] "ok "'],
          3,
          'Both forms keep the trailing space, but only {:?} adds the quotes that make it visible.',
        ),
        choose(
          'let t = (3, 4); is defined. Which line compiles and shows both numbers?',
          [
            'println!("{}", t);',
            'println!("{:?}", t);',
            'println!("{}", t.2);',
            'println!("{} {}", t);',
          ],
          1,
          '{:?} can print the whole tuple. {} cannot, t has no field 2, and one tuple cannot fill two placeholders.',
        ),
      ],
    },
  ],
  'rust-bindings': [
    {
      title: 'Name a value with let',
      explanation: [
        'let width = 4; evaluates the right side and binds the name width to the result. Later lines use the name wherever they need that value. A type can be written after the name, as in let width: i32 = 4;, but Rust usually infers it.',
        'The right side is evaluated once, when the let runs. The name holds the resulting value, not the calculation that produced it.',
      ],
      example: {
        language: 'rust',
        code: 'fn main() {\n    let width = 4;\n    let height = 3;\n    let area = width * height;\n    println!("{}", area);\n}',
        output: '12',
        explanation:
          'area is bound to the value of width * height, which is 12.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn main() {\n    let a = 10;\n    let b = a - 3;\n    println!("{}", b);\n}',
          ['10', '7', '13', 'a - 3'],
          1,
          'b is bound to the value of a - 3, which is 7.',
        ),
        predictOutput(
          'What is printed?',
          'fn cube(n: i32) -> i32 {\n    n * n * n\n}\n\nfn main() {\n    let c = cube(2);\n    println!("{}", c + 1);\n}',
          ['27', '7', '9', '8'],
          2,
          'c holds the 8 returned by cube(2), and 8 + 1 is 9.',
        ),
        predictOutput(
          'What is the output of this program?',
          'fn main() {\n    let first = 2 + 2;\n    let second = first * first;\n    println!("{}", second);\n}',
          ['16', '8', '4', '12'],
          0,
          'first holds the value 4, so second is 4 * 4 = 16.',
        ),
        choose(
          'Which line binds the name speed to 30 as an i32?',
          [
            'speed: i32 = 30;',
            'let i32 speed = 30;',
            'let speed = i32(30);',
            'let speed: i32 = 30;',
          ],
          3,
          'A let binding writes the name, then an optional : type, then = and the value.',
        ),
      ],
    },
    {
      title: 'Reassign a binding declared with let mut',
      explanation: [
        'A binding made with plain let cannot be given a new value. After let count = 1;, the line count = 2; fails to compile with cannot assign twice to immutable variable.',
        'Declaring it as let mut count = 1; allows assignment. The right side is computed from the current value before the name is updated, so count = count + 1; turns 1 into 2.',
      ],
      example: {
        language: 'rust',
        code: 'fn main() {\n    let mut level = 1;\n    println!("{}", level);\n    level = level + 4;\n    println!("{}", level);\n}',
        output: '1\n5',
        explanation:
          'level starts at 1 and is printed. The assignment computes 1 + 4 and stores 5, which the second line prints.',
      },
      questions: [
        choose(
          'What happens when this program is compiled?',
          [
            'It prints 2, the updated value',
            'It prints 3, ignoring the assignment',
            'It fails to compile: lives is not mut',
            'It prints 3, then 2 on the next line',
          ],
          2,
          'Assigning to a binding requires let mut; a plain let binding cannot change.',
          'fn main() {\n    let lives = 3;\n    lives = lives - 1;\n    println!("{}", lives);\n}',
        ),
        predictOutput(
          'What does this program print?',
          'fn main() {\n    let mut n = 5;\n    n = n * 2;\n    n = n - 3;\n    println!("{}", n);\n}',
          ['7', '4', '10', '2'],
          0,
          'n becomes 10, and then 10 - 3 = 7.',
        ),
        predictOutput(
          'What is printed?',
          'fn main() {\n    let mut x = 2;\n    println!("{}", x);\n    x = 10;\n    println!("{}", x + x);\n}',
          ['10\n20', '2\n4', '20\n20', '2\n20'],
          3,
          'The first line prints x before the assignment; the second uses the new value, 10.',
        ),
        predictOutput(
          'What is the output of this program?',
          'fn main() {\n    let mut a = 4;\n    let b = a;\n    a = a + 1;\n    println!("{}", b);\n}',
          ['5', '4', '9', '1'],
          1,
          'b received the value 4 when it was bound; changing a afterwards does not change b.',
        ),
      ],
    },
    {
      title: 'Update in place with +=, -= and *=',
      explanation: [
        'x += 3; is shorthand for x = x + 3;. In the same way, -= subtracts and *= multiplies, starting from the current value. Like plain assignment, they need a let mut binding.',
        'A common pattern copies a parameter into a let mut binding, updates it step by step, and returns it as the tail expression.',
      ],
      example: {
        language: 'rust',
        code: 'fn score(base: i32) -> i32 {\n    let mut total = base;\n    total *= 2;\n    total -= 1;\n    total\n}\n\nfn main() {\n    println!("{}", score(5));\n}',
        output: '9',
        explanation:
          'total starts at 5, doubles to 10, drops to 9, and the tail returns 9.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn main() {\n    let mut c = 10;\n    c -= 4;\n    c += 1;\n    println!("{}", c);\n}',
          ['5', '15', '7', '6'],
          2,
          '10 - 4 is 6, and adding 1 gives 7.',
        ),
        predictOutput(
          'What is printed?',
          'fn grow(n: i32) -> i32 {\n    let mut v = n;\n    v += 2;\n    v *= 3;\n    v\n}\n\nfn main() {\n    println!("{}", grow(1));\n}',
          ['5', '9', '3', '7'],
          1,
          'The updates run in order: 1 + 2 = 3, then 3 * 3 = 9.',
        ),
        predictOutput(
          'What is the output of this program?',
          'fn main() {\n    let mut p = 3;\n    p *= p;\n    p -= 1;\n    println!("{}", p);\n}',
          ['5', '6', '9', '8'],
          3,
          'p *= p multiplies 3 by its current value, giving 9; then 9 - 1 = 8.',
        ),
        choose(
          'A function contains let total = 0; followed by total += 5;. It fails to compile. Which change fixes it?',
          [
            'Write let mut total = 0;',
            'Write let total += 5;',
            'Remove the semicolon after total += 5',
            'Write total =+ 5; instead',
          ],
          0,
          '+= assigns a new value, so the binding must be declared mut.',
        ),
      ],
    },
  ],
  'rust-scope': [
    {
      title: 'Use a block as an expression',
      explanation: [
        'Curly braces form a block. A block runs its statements in order, and its last expression without a semicolon becomes the block’s value, just like a function body. So a block can appear on the right side of let.',
        'The let that receives the block still needs its own semicolon after the closing brace.',
      ],
      example: {
        language: 'rust',
        code: 'fn main() {\n    let total = {\n        let price = 4;\n        let count = 3;\n        price * count\n    };\n    println!("{}", total);\n}',
        output: '12',
        explanation:
          'The block binds price and count, and its tail price * count gives 12, which becomes total.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn main() {\n    let v = {\n        let a = 5;\n        a - 7\n    };\n    println!("{}", v);\n}',
          ['-2', '5', '2', '7'],
          0,
          'The block’s tail a - 7 is -2, and that value is bound to v.',
        ),
        predictOutput(
          'What is printed?',
          'fn main() {\n    let n = {\n        println!("inside");\n        10\n    };\n    println!("{}", n + 1);\n}',
          ['11\ninside', 'inside\n10', 'inside\n11', '11'],
          2,
          'The block runs first, printing inside, and gives 10; then main prints 10 + 1.',
        ),
        choose(
          'What happens when this program is compiled?',
          [
            'It prints 7, the block’s last value',
            'It prints 0, since the block is empty',
            'It prints 3 + 4 as written',
            'It fails to compile: the block has no tail',
          ],
          3,
          'The semicolon turns 3 + 4 into a statement, so the block produces no number and x cannot be printed with {}.',
          'fn main() {\n    let x = {\n        3 + 4;\n    };\n    println!("{}", x);\n}',
        ),
        predictOutput(
          'What is the output of this program?',
          'fn main() {\n    let base = 6;\n    let doubled = {\n        let two = 2;\n        base * two\n    };\n    println!("{}", doubled + base);\n}',
          ['12', '18', '6', '14'],
          1,
          'The block can read base from outside, so doubled is 12, and 12 + 6 = 18.',
        ),
      ],
    },
    {
      title: 'Names bound in a block end at its closing brace',
      explanation: [
        'A let inside a block creates a name that exists only until that block’s closing brace. Code after the block cannot use it: the compiler reports that it cannot find the value in this scope.',
        'Names from outside remain visible inside the block, and an outer let mut binding can be updated there. Such an update lasts after the block, because it changes the outer binding itself.',
      ],
      example: {
        language: 'rust',
        code: 'fn main() {\n    let mut count = 1;\n    let result = {\n        let step = 4;\n        count += step;\n        step * 2\n    };\n    println!("{}", result);\n    println!("{}", count);\n}',
        output: '8\n5',
        explanation:
          'step exists only inside the block. count belongs to main, so the block’s += 4 is still there afterwards.',
      },
      questions: [
        choose(
          'What happens when this program is compiled?',
          [
            'It prints 4, the last value of part',
            'It prints 5, the value of sum',
            'It prints 0, since part was cleared',
            'It fails to compile: part is out of scope',
          ],
          3,
          'part was bound inside the block, so it no longer exists after the closing brace.',
          'fn main() {\n    let sum = {\n        let part = 4;\n        part + 1\n    };\n    println!("{}", part);\n}',
        ),
        predictOutput(
          'What does this program print?',
          'fn main() {\n    let mut count = 1;\n    {\n        count += 10;\n    }\n    println!("{}", count);\n}',
          ['1', '11', '10', '21'],
          1,
          'count is the outer binding; the block updates it, and the change remains after the block.',
        ),
        predictOutput(
          'What is printed?',
          'fn helper(n: i32) -> i32 {\n    let n2 = n * n;\n    n2 + 1\n}\n\nfn main() {\n    let n2 = 100;\n    println!("{}", helper(3) + n2);\n}',
          ['10', '19', '110', '109'],
          2,
          'Each function body is its own scope. helper’s n2 is 9, so it returns 10; main’s n2 is still 100.',
        ),
        choose(
          'Code inside a block uses a name. Which names can it see?',
          [
            'Earlier names from the block or an outer scope',
            'Only names bound inside that block itself',
            'Any name in the function, even ones bound later',
            'Only the function’s own parameters',
          ],
          0,
          'A block sees names already bound in it and in every scope that encloses it.',
        ),
      ],
    },
    {
      title: 'Shadow a name with a new let',
      explanation: [
        'Writing let with a name that already exists creates a new binding that shadows the old one: later lines see the new value. This needs no mut, because nothing is reassigned; there are now two bindings with the same name.',
        'The new value may be computed from the old one, as in let n = n * 2;. The right side runs first, so it still sees the old n.',
      ],
      example: {
        language: 'rust',
        code: 'fn main() {\n    let steps = 3;\n    let steps = steps * 10;\n    let steps = steps + 1;\n    println!("{}", steps);\n}',
        output: '31',
        explanation:
          'Each let creates a new steps from the previous one: 3, then 30, then 31.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn main() {\n    let x = 2;\n    let x = x + 5;\n    let x = x * x;\n    println!("{}", x);\n}',
          ['7', '49', '14', '4'],
          1,
          'x becomes 7 and then 7 * 7 = 49; each line reads the previous binding.',
        ),
        predictOutput(
          'What is printed?',
          'fn adjust(n: i32) -> i32 {\n    let n = n - 1;\n    n * 3\n}\n\nfn main() {\n    println!("{}", adjust(5));\n}',
          ['14', '15', '4', '12'],
          3,
          'The new n is 5 - 1 = 4, and the tail uses that shadowing n: 4 * 3 = 12.',
        ),
        choose(
          'total was bound with let total = 5; and is not mut. Which line makes a binding named total hold 6?',
          [
            'total = total + 1;',
            'let total = total + 1;',
            'total += 1;',
            'mut total = total + 1;',
          ],
          1,
          'Shadowing with a new let needs no mut; assignment would.',
        ),
        predictOutput(
          'What is the output of this program?',
          'fn main() {\n    let v = 8;\n    println!("{}", v);\n    let v = v - 8;\n    println!("{}", v);\n}',
          ['0\n0', '8\n8', '8\n0', '0\n8'],
          2,
          'The first print happens before the shadowing let, so it sees 8; the second sees the new v, 0.',
        ),
      ],
    },
    {
      title: 'Shadowing inside a block ends at the brace',
      explanation: [
        'A let inside a block can shadow an outer name, but only until the block ends. After the closing brace the outer binding is visible again, with its original value.',
        'This is the difference from assignment: assigning to a let mut binding changes the one existing value, while shadowing creates a separate binding that disappears with its scope.',
      ],
      example: {
        language: 'rust',
        code: 'fn main() {\n    let n = 4;\n    let inner = {\n        let n = n * 10;\n        n + 2\n    };\n    println!("{}", inner);\n    println!("{}", n);\n}',
        output: '42\n4',
        explanation:
          'Inside the block, n is shadowed by 40, so the block gives 42. After the block, n means the outer 4 again.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn main() {\n    let x = 1;\n    {\n        let x = 50;\n        println!("{}", x);\n    }\n    println!("{}", x);\n}',
          ['50\n50', '50\n1', '1\n1', '1\n50'],
          1,
          'The inner x is 50 until the closing brace; afterwards the outer x, 1, is visible again.',
        ),
        predictOutput(
          'What is printed?',
          'fn scoped(n: i32) -> i32 {\n    let doubled = {\n        let n = n + n;\n        n - 1\n    };\n    doubled + n\n}\n\nfn main() {\n    println!("{}", scoped(5));\n}',
          ['15', '19', '14', '9'],
          2,
          'The block’s n is 10, so doubled is 9. After the block, n is 5 again, giving 9 + 5 = 14.',
        ),
        predictOutput(
          'What is the output of this program?',
          'fn main() {\n    let mut a = 1;\n    let b = 1;\n    {\n        a = 5;\n        let b = 5;\n    }\n    println!("{}", a + b);\n}',
          ['6', '2', '10', '5'],
          0,
          'Assigning to a changes the outer binding, so a is 5. The inner let b is a separate binding that ends at the brace, so b is still 1.',
        ),
        choose(
          'Inside a block, let total = total * 2; runs. What is total right after the block ends?',
          [
            'Twice the original value',
            'The original value from before the block',
            'Zero, because the block has ended',
            'Nothing: using total there fails to compile',
          ],
          1,
          'The doubled total was a shadowing binding that ended at the brace; the outer total never changed.',
        ),
      ],
    },
  ],
  'rust-tuples-arrays': [
    {
      title: 'Group values in a tuple and read fields by position',
      explanation: [
        'A tuple groups a fixed number of values, which may have different types: (12, true) has type (i32, bool). Read a field with a dot and its position, counting from 0: t.0 is the first field and t.1 the second.',
        'A tuple’s size is part of its type, so asking for a field it does not have, such as t.2 on a pair, does not compile.',
      ],
      example: {
        language: 'rust',
        code: 'fn main() {\n    let item = (12, true);\n    println!("{}", item.0);\n    println!("{}", item.1);\n}',
        output: '12\ntrue',
        explanation:
          'item.0 is the first field, 12, and item.1 is the second, true.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn main() {\n    let t = (4, 9, 2);\n    println!("{}", t.1);\n}',
          ['4', '9', '2', '1'],
          1,
          'Positions count from 0, so t.1 is the second field, 9.',
        ),
        predictOutput(
          'What is printed?',
          'fn split(n: i32) -> (i32, i32) {\n    (n * 2, n - 1)\n}\n\nfn main() {\n    let r = split(6);\n    println!("{}", r.0 + r.1);\n}',
          ['12', '5', '17', '7'],
          2,
          'split(6) returns (12, 5), and adding its two fields gives 17.',
        ),
        choose(
          'let p = (3, false); is defined. Which expression reads the false?',
          ['p.1', 'p.2', 'p[1]', 'p.false'],
          0,
          'Tuple fields are read with a dot and a 0-based position, so the second field is p.1.',
        ),
        choose(
          'What happens when this program is compiled?',
          [
            'It prints 2, the last field',
            'It prints 0 for the missing field',
            'It compiles, then stops when it runs',
            'It fails to compile: there is no field 2',
          ],
          3,
          'A pair has only fields 0 and 1, and the compiler knows that from its type.',
          'fn main() {\n    let t = (1, 2);\n    println!("{}", t.2);\n}',
        ),
      ],
    },
    {
      title: 'Unpack a tuple with let (a, b) = ...',
      explanation: [
        'A let can take a tuple apart in one step: let (w, h) = size; binds w to the first field and h to the second. Names are matched to fields by position, so the pattern must list exactly one name per field.',
        'This is a convenient way to receive several results from a function that returns a tuple.',
      ],
      example: {
        language: 'rust',
        code: 'fn min_max() -> (i32, i32) {\n    (2, 9)\n}\n\nfn main() {\n    let (low, high) = min_max();\n    println!("{}", high - low);\n}',
        output: '7',
        explanation:
          'low gets the first field, 2, and high gets the second, 9. Their difference is 7.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn main() {\n    let (first, second) = (5, 20);\n    println!("{}", second - first);\n}',
          ['-15', '15', '25', '5'],
          1,
          'first is 5 and second is 20, so second - first is 15.',
        ),
        predictOutput(
          'What is printed?',
          'fn main() {\n    let pair = (1, 8);\n    let (b, a) = pair;\n    println!("{}", a);\n}',
          ['8', '1', '9', '0'],
          0,
          'Names are matched by position, not by letter: b gets 1 and a gets 8.',
        ),
        choose(
          'What happens with let (x, y) = (1, 2, 3);?',
          [
            'x is 1 and y is 2; the 3 is ignored',
            'x is 1 and y is 3, the last field',
            'x is 1 and y is the rest, (2, 3)',
            'It fails to compile: 2 names, 3 fields',
          ],
          3,
          'The pattern must have one name for each field of the tuple.',
        ),
        predictOutput(
          'What is the output of this program?',
          'fn order(a: i32, b: i32) -> (i32, i32) {\n    (b, a)\n}\n\nfn main() {\n    let (first, second) = order(4, 7);\n    println!("{}", first);\n    println!("{}", second);\n}',
          ['4\n7', '7\n7', '7\n4', '4\n4'],
          2,
          'order returns (7, 4), so first is 7 and second is 4.',
        ),
      ],
    },
    {
      title: 'Store same-type values in an array and index them',
      explanation: [
        'An array holds a fixed number of values that all share one type: [3, 5, 8] has type [i32; 3]. Mixing types, as in [1, true], does not compile. Read an element with square brackets and its position from 0: a[0] is the first element.',
        'a.len() gives the number of elements. Because positions start at 0, the last element is at a.len() - 1, one less than the length.',
      ],
      example: {
        language: 'rust',
        code: 'fn main() {\n    let temps = [14, 17, 11, 20];\n    println!("{}", temps[1]);\n    println!("{}", temps.len());\n}',
        output: '17\n4',
        explanation:
          'temps[1] is the second element, 17. The array holds four values, so len() is 4 and the last index is 3.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn main() {\n    let a = [6, 2, 9];\n    println!("{}", a[2]);\n}',
          ['2', '6', '9', '3'],
          2,
          'Index 2 is the third element, 9.',
        ),
        predictOutput(
          'What is printed?',
          'fn main() {\n    let nums = [5, 10, 15, 20];\n    println!("{}", nums[nums.len() - 1]);\n}',
          ['15', '20', '4', '3'],
          1,
          'nums.len() is 4, so the index is 3, the position of the last element, 20.',
        ),
        choose(
          'An array has 4 elements. What is the index of its last element?',
          ['3', '4', '-1', '5'],
          0,
          'Indexes run from 0 to the length minus 1, so the last one is 3.',
        ),
        choose(
          'Why does let mixed = [1, true]; fail to compile?',
          [
            'Arrays need at least three elements',
            'true would have to be written as 1',
            'Every element of an array must have one type',
            'An array must be declared with let mut',
          ],
          2,
          'An array has a single element type; a tuple is the tool for mixing types.',
        ),
        predictOutput(
          'What is the output of this program?',
          'fn main() {\n    let w = [3, 1, 4];\n    println!("{}", w[0] + w[2]);\n}',
          ['4', '5', '31', '7'],
          3,
          'w[0] is 3 and w[2] is 4, so their sum is 7.',
        ),
      ],
    },
    {
      title: 'Pass arrays in and get tuples out',
      explanation: [
        'An array type can be a parameter type: fn f(values: [i32; 3]) accepts exactly three i32 values. The function can read several elements by index and return results together as a tuple, which the caller reads field by field.',
        'Elements of a let mut array can also be changed by index, as in slots[0] = 5;.',
      ],
      example: {
        language: 'rust',
        code: 'fn total_and_middle(v: [i32; 3]) -> (i32, i32) {\n    (v[0] + v[1] + v[2], v[1])\n}\n\nfn main() {\n    let result = total_and_middle([2, 7, 4]);\n    println!("{}", result.0);\n    println!("{}", result.1);\n}',
        output: '13\n7',
        explanation:
          'The function reads three elements by index and returns their sum and the middle element as a tuple. main prints each field with {}.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn spread(v: [i32; 3]) -> (i32, i32) {\n    (v[2] - v[0], v[1])\n}\n\nfn main() {\n    let (gap, mid) = spread([4, 6, 11]);\n    println!("{}", gap);\n    println!("{}", mid);\n}',
          ['-7\n6', '7\n6', '7\n4', '2\n6'],
          1,
          'v[2] - v[0] is 11 - 4 = 7, and v[1] is 6.',
        ),
        predictOutput(
          'What is printed?',
          'fn main() {\n    let mut slots = [0, 0, 0];\n    slots[1] = 5;\n    slots[2] += 2;\n    println!("{}", slots[1] + slots[2]);\n}',
          ['5', '2', '7', '0'],
          2,
          'Index 1 is set to 5 and index 2 grows from 0 to 2, so the sum is 7.',
        ),
        predictOutput(
          'What is the output of this program?',
          'fn main() {\n    let pair = ([1, 2, 3], 10);\n    println!("{}", pair.0[2] + pair.1);\n}',
          ['12', '11', '3', '13'],
          3,
          'pair.0 is the array, whose element at index 2 is 3; adding pair.1 gives 13.',
        ),
        choose(
          'A function must return a count together with whether the job is complete. Which return type fits?',
          ['(i32, bool)', '[i32; 2]', '[bool; 2]', '(i32; bool)'],
          0,
          'The two values have different types, which a tuple allows and an array does not.',
        ),
      ],
    },
  ],
  'rust-integers': [
    {
      title: 'Integer division drops the fraction',
      explanation: [
        'Dividing one integer by another gives an integer. The fractional part is discarded, never rounded: 7 / 2 is 3, and 2 / 5 is 0.',
        'For negative results the fraction is also dropped toward zero, so -7 / 2 is -3, not -4.',
      ],
      example: {
        language: 'rust',
        code: 'fn main() {\n    println!("{} {} {}", 7 / 2, 2 / 5, -7 / 2);\n}',
        output: '3 0 -3',
        explanation:
          '3.5 becomes 3, 0.4 becomes 0, and -3.5 becomes -3: each result drops its fraction toward zero.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn main() {\n    println!("{}", 19 / 4);\n}',
          ['4.75', '5', '4', '3'],
          2,
          '19 / 4 is 4.75, and integer division keeps only the 4.',
        ),
        predictOutput(
          'What is printed?',
          'fn main() {\n    println!("{}", -9 / 4);\n}',
          ['-2', '-3', '-2.25', '2'],
          0,
          '-2.25 is truncated toward zero, giving -2.',
        ),
        predictOutput(
          'What is the output of this program?',
          'fn average(a: i32, b: i32) -> i32 {\n    (a + b) / 2\n}\n\nfn main() {\n    println!("{}", average(3, 6));\n}',
          ['4.5', '4', '5', '9'],
          1,
          '9 / 2 would be 4.5, but the integer result keeps only 4.',
        ),
        choose(
          'Which expression evaluates to 0?',
          ['5 / 3', '5 / 5', '-5 / 3', '3 / 5'],
          3,
          '3 / 5 is 0.6, and dropping the fraction leaves 0.',
        ),
      ],
    },
    {
      title: 'Find the remainder with %',
      explanation: [
        'a % b is what is left after taking as many whole b’s out of a as possible: 17 % 5 is 2, because three 5s make 15 and 2 remain. When a is smaller than b, nothing fits, so 4 % 7 is 4.',
        'The remainder takes the sign of the left side: -7 % 3 is -1, matching -7 / 3 being -2.',
      ],
      example: {
        language: 'rust',
        code: 'fn main() {\n    println!("{}", 1234 % 10);\n    println!("{}", (22 + 5) % 24);\n}',
        output: '4\n3',
        explanation:
          '1234 % 10 is the last digit, 4. 27 % 24 is 3: five hours after 22:00 is 3:00 on a 24-hour clock.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn main() {\n    println!("{}", 29 % 10);\n}',
          ['2', '9', '2.9', '19'],
          1,
          '29 holds two whole 10s with 9 left over.',
        ),
        predictOutput(
          'What is printed?',
          'fn main() {\n    println!("{}", 3 % 8);\n}',
          ['0', '8', '3', '5'],
          2,
          '8 does not fit into 3 at all, so the whole 3 is left over.',
        ),
        predictOutput(
          'What is the output of this program?',
          'fn main() {\n    println!("{}", -7 % 3);\n}',
          ['2', '1', '-2', '-1'],
          3,
          '-7 / 3 is -2 with -1 left over; the remainder keeps the sign of the left side.',
        ),
        choose(
          'For which whole numbers n is n % 2 equal to 0?',
          [
            'Even numbers',
            'Odd numbers',
            'Only numbers below 2',
            'Only 0 itself',
          ],
          0,
          'An even number splits into 2s with nothing left over.',
        ),
      ],
    },
    {
      title: 'Each integer type has a fixed range',
      explanation: [
        'Rust has several integer types. i32 and i64 are signed: they hold negative and positive values. u8, u32 and usize are unsigned: they start at 0. usize is the type of lengths and indexes, such as the result of .len().',
        'Each type has a largest value, written like i32::MAX (2147483647) or u8::MAX (255). A value that does not fit is an error: an out-of-range literal does not compile, and arithmetic that overflows stops a debug build with a panic. When values can get large, choose a wider type such as i64.',
      ],
      example: {
        language: 'rust',
        code: 'fn main() {\n    println!("{}", i32::MAX);\n    println!("{}", u8::MAX);\n    let seconds: i64 = 86400 * 365 * 100;\n    println!("{}", seconds);\n}',
        output: '2147483647\n255\n3153600000',
        explanation:
          '86400 * 365 * 100 is larger than i32::MAX, but the i64 annotation makes the calculation use i64, which has room for it.',
      },
      questions: [
        choose(
          'What happens when this program is compiled?',
          [
            'level holds 300 as written',
            'level holds 255, the largest u8',
            'level holds 44 after wrapping',
            'It fails to compile: 300 is too big for u8',
          ],
          3,
          'u8 holds only 0 to 255, and Rust rejects a literal that does not fit.',
          'fn main() {\n    let level: u8 = 300;\n    println!("{}", level);\n}',
        ),
        choose(
          'Which type should hold a temperature that can drop below zero?',
          ['u8', 'u32', 'i32', 'usize'],
          2,
          'Only the signed type in the list can hold negative values.',
        ),
        choose(
          'What happens when this program runs as a debug build?',
          [
            'It prints 2147483648',
            'It panics: the addition overflows',
            'It prints -2147483648',
            'It prints 2147483647',
          ],
          1,
          'i32::MAX + 1 does not fit in an i32, and a debug build stops with an overflow panic instead of printing a wrong number.',
          'fn add_one(n: i32) -> i32 {\n    n + 1\n}\n\nfn main() {\n    println!("{}", add_one(i32::MAX));\n}',
        ),
        predictOutput(
          'What does this program print?',
          'fn main() {\n    println!("{}", u8::MAX / 2);\n}',
          ['127', '128', '127.5', '255'],
          0,
          'u8::MAX is 255, and integer division by 2 drops the .5.',
        ),
        predictOutput(
          'What is printed?',
          'fn area(w: i64, h: i64) -> i64 {\n    w * h\n}\n\nfn main() {\n    println!("{}", area(70000, 40000));\n}',
          ['-1494967296', '280000000', '2800000000', '28000000000'],
          2,
          'The product 2800000000 is too large for i32 but fits easily in i64.',
        ),
      ],
    },
    {
      title: 'Split a total into groups and leftovers',
      explanation: [
        'Division and remainder answer two halves of one question. For items packed in groups of a given size, items / size is the number of full groups and items % size is how many items are left over.',
        'A function can return both at once as a tuple, which prints with {:?}.',
      ],
      example: {
        language: 'rust',
        code: 'fn hours_minutes(total: u32) -> (u32, u32) {\n    (total / 60, total % 60)\n}\n\nfn main() {\n    println!("{:?}", hours_minutes(135));\n}',
        output: '(2, 15)',
        explanation:
          '135 minutes contain two full hours (120 minutes), and 15 minutes remain.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn teams(players: u32, size: u32) -> (u32, u32) {\n    (players / size, players % size)\n}\n\nfn main() {\n    println!("{:?}", teams(23, 4));\n}',
          ['(6, 1)', '(5, 3)', '(5.75, 3)', '(3, 5)'],
          1,
          'Five teams of 4 use 20 players, leaving 3.',
        ),
        predictOutput(
          'What is printed?',
          'fn split_digits(n: u32) -> (u32, u32) {\n    (n / 10, n % 10)\n}\n\nfn main() {\n    println!("{:?}", split_digits(47));\n}',
          ['(7, 4)', '(4.7, 7)', '(4, 7)', '(47, 0)'],
          2,
          'Dividing by 10 drops the last digit, and % 10 keeps only the last digit.',
        ),
        predictOutput(
          'What is the output of this program?',
          'fn main() {\n    let cookies = 50;\n    let per_bag = 12;\n    let full = cookies / per_bag;\n    let spare = cookies % per_bag;\n    println!("{} bags, {} spare", full, spare);\n}',
          [
            '4 bags, 2 spare',
            '5 bags, 0 spare',
            '4 bags, 0 spare',
            '4 bags, 12 spare',
          ],
          0,
          'Four bags of 12 hold 48 cookies, leaving 2.',
        ),
        choose(
          'A number of seconds must be shown as whole minutes plus leftover seconds. Which expression gives the leftover seconds?',
          ['total / 60', '60 % total', 'total - 60', 'total % 60'],
          3,
          'The remainder after taking out every full 60 is the leftover seconds.',
        ),
        choose(
          'For positive whole numbers a and b, which expression always equals a?',
          [
            '(a / b) + (a % b)',
            '(a / b) * b + a % b',
            '(a % b) * b + a / b',
            '(a / b) * (a % b)',
          ],
          1,
          'a / b full groups of size b, plus the a % b leftovers, add back up to a.',
        ),
      ],
    },
  ],
  'rust-floats': [
    {
      title: 'Use f64 for values with a fractional part',
      explanation: [
        'f64 is Rust’s standard type for numbers with a fractional part. A literal with a decimal point, such as 2.5 or 4.0, is an f64, and dividing f64 values keeps the fraction: 7.0 / 2.0 is 3.5.',
        'An f64 and an integer cannot be mixed in one operation. 7.0 / 2 does not compile; write 7.0 / 2.0 instead.',
      ],
      example: {
        language: 'rust',
        code: 'fn main() {\n    println!("{}", 7.0 / 2.0);\n    println!("{}", 7 / 2);\n}',
        output: '3.5\n3',
        explanation:
          'The first division uses f64 values and keeps the .5. The second uses integers, so the fraction is dropped.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn main() {\n    println!("{}", 9.0 / 4.0);\n}',
          ['2', '2.25', '2.3', '2.0'],
          1,
          'Both values are f64, so the exact quotient 2.25 is kept.',
        ),
        predictOutput(
          'What is printed?',
          'fn half(x: f64) -> f64 {\n    x / 2.0\n}\n\nfn main() {\n    println!("{}", half(5.0));\n}',
          ['2', '3', '2.5', '5'],
          2,
          'half divides an f64 by 2.0, so 5.0 becomes 2.5.',
        ),
        choose(
          'What happens when this program is compiled?',
          [
            'It prints 2.5, converting the 4',
            'It prints 2, using integer division',
            'It prints 2.0, rounding the result',
            'It fails to compile: f64 / integer',
          ],
          3,
          'Rust does not mix f64 and integers in one operation; 10.0 / 4.0 would work.',
          'fn main() {\n    let ratio = 10.0 / 4;\n    println!("{}", ratio);\n}',
        ),
        choose(
          'A function computes the average price of several items. Which return type keeps the cents?',
          ['f64', 'i32', 'u32', 'i64'],
          0,
          'Only f64 can hold a fractional result; the integer types would drop it.',
        ),
      ],
    },
    {
      title: 'Print whole floats with {:?} to see the .0',
      explanation: [
        'When an f64 holds a whole number, the two placeholders print it differently: {} shows 3, while {:?} shows 3.0. The Debug form keeps the .0 so you can tell the value is a float.',
        'Values with a fractional part look the same either way: 2.5 prints as 2.5 with both.',
      ],
      example: {
        language: 'rust',
        code: 'fn main() {\n    let whole = 6.0 / 2.0;\n    let part = 5.0 / 2.0;\n    println!("{} {:?}", whole, whole);\n    println!("{} {:?}", part, part);\n}',
        output: '3 3.0\n2.5 2.5',
        explanation:
          'whole is 3.0, which {} prints as 3 and {:?} as 3.0. part is 2.5, which prints the same both ways.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn main() {\n    println!("{:?}", 8.0 / 4.0);\n}',
          ['2', '"2.0"', '2.0', '2.00'],
          2,
          'The result is the whole f64 2.0, and {:?} keeps its .0.',
        ),
        predictOutput(
          'What is printed?',
          'fn main() {\n    println!("{}", 4.0 * 2.5);\n}',
          ['10', '10.0', '8', '8.0'],
          0,
          '4.0 * 2.5 is exactly 10.0, and {} prints a whole f64 without the .0.',
        ),
        predictOutput(
          'What is the output of this program?',
          'fn main() {\n    let point = (1.0, 0.5);\n    println!("{:?}", point);\n}',
          ['(1, 0.5)', '(1.0, 0.50)', '1.0 0.5', '(1.0, 0.5)'],
          3,
          'Inside the tuple’s Debug form, the whole f64 keeps its .0.',
        ),
        choose(
          'x is an f64 holding 7.0. What do println!("{}", x) and println!("{:?}", x) print?',
          ['7.0 and 7', '7 and 7.0', '7 and 7', '7.0 and 7.0'],
          1,
          '{} drops the .0 of a whole float, while {:?} keeps it.',
        ),
      ],
    },
    {
      title: 'Convert with as before dividing',
      explanation: [
        'as converts a number to another numeric type: n as f64 turns an integer into an f64. To divide two integers and keep the fraction, convert both first: a as f64 / b as f64.',
        'Converting the result is too late: (a / b) as f64 does the integer division first, so the fraction is already gone. Converting the other way, x as i32 drops the fractional part toward zero, so 2.9 as i32 is 2.',
      ],
      example: {
        language: 'rust',
        code: 'fn main() {\n    let done = 3;\n    let total = 4;\n    println!("{:?}", done as f64 / total as f64);\n    println!("{:?}", (done / total) as f64);\n}',
        output: '0.75\n0.0',
        explanation:
          'The first line converts both integers, so 3.0 / 4.0 is 0.75. The second divides the integers first, getting 0, and only then converts it to 0.0.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn share(part: i32, whole: i32) -> f64 {\n    part as f64 / whole as f64\n}\n\nfn main() {\n    println!("{}", share(1, 8));\n}',
          ['0', '0.125', '0.12', '0.1'],
          1,
          'Both integers become f64 before dividing, so 1.0 / 8.0 keeps its full fraction.',
        ),
        predictOutput(
          'What is printed?',
          'fn main() {\n    let a = 7;\n    let b = 2;\n    println!("{:?}", (a / b) as f64);\n}',
          ['3.5', '4.0', '3.0', '3'],
          2,
          'a / b is integer division, giving 3, and only then is it converted to 3.0.',
        ),
        predictOutput(
          'What is the output of this program?',
          'fn main() {\n    println!("{}", 9.99 as i32);\n    println!("{}", -2.7 as i32);\n}',
          ['10\n-3', '9\n-3', '10\n-2', '9\n-2'],
          3,
          'Converting to i32 drops the fraction toward zero, never rounding: 9.99 becomes 9 and -2.7 becomes -2.',
        ),
        choose(
          'sum and count are i32 values. Which expression gives their exact average as an f64?',
          [
            'sum as f64 / count as f64',
            '(sum / count) as f64',
            'sum / count as f64',
            'sum as f64 / count',
          ],
          0,
          'Both sides must be f64 before dividing. Converting afterwards loses the fraction, and mixing f64 with i32 does not compile.',
        ),
      ],
    },
    {
      title: 'Compare computed floats with a tolerance',
      explanation: [
        'Most decimal fractions cannot be stored exactly in an f64, so arithmetic can be off by a tiny amount: 0.1 + 0.2 prints 0.30000000000000004. As a result, == between computed floats can be false even when the math says the values are equal.',
        'Instead, check that the distance between them is tiny: (a - b).abs() < 1e-9. .abs() removes the sign, so the check works whichever value is larger, and 1e-9 means 0.000000001.',
      ],
      example: {
        language: 'rust',
        code: 'fn main() {\n    let sum: f64 = 0.1 + 0.2;\n    println!("{}", sum);\n    println!("{}", sum == 0.3);\n    println!("{}", (sum - 0.3).abs() < 1e-9);\n}',
        output: '0.30000000000000004\nfalse\ntrue',
        explanation:
          'sum is a tiny bit above 0.3, so == is false. Their distance is far below 1e-9, so the tolerance check is true.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn main() {\n    let a: f64 = 2.5;\n    let b: f64 = 4.0;\n    println!("{}", (a - b).abs());\n}',
          ['-1.5', '1.5', '6.5', '1'],
          1,
          'a - b is -1.5, and .abs() removes the sign.',
        ),
        predictOutput(
          'What is printed?',
          'fn close(a: f64, b: f64) -> bool {\n    (a - b).abs() < 0.01\n}\n\nfn main() {\n    println!("{}", close(1.004, 1.0));\n    println!("{}", close(1.0, 1.5));\n}',
          ['true\nfalse', 'false\nfalse', 'true\ntrue', 'false\ntrue'],
          0,
          'The first pair differs by 0.004, under 0.01; the second differs by 0.5.',
        ),
        predictOutput(
          'What is the output of this program?',
          'fn main() {\n    let total: f64 = 0.1 + 0.2;\n    println!("{}", total == 0.3);\n}',
          ['true', '0.3', 'false', '0.30000000000000004'],
          2,
          'total is stored as 0.30000000000000004, which is not exactly equal to 0.3.',
        ),
        choose(
          'Why is (x - 0.75).abs() < 1e-9 a safer test than x == 0.75 for a computed f64 x?',
          [
            '== cannot compare two f64 values',
            'Float results can carry tiny rounding errors',
            '.abs() rounds x to a few decimal places',
            '1e-9 turns x into an exact integer',
          ],
          1,
          'A computed float may differ from 0.75 by a tiny rounding error, which the tolerance allows while == does not.',
        ),
      ],
    },
  ],
  'rust-booleans': [
    {
      title: 'Compare numbers to get a bool',
      explanation: [
        'A comparison produces a bool, a value that is either true or false. The comparison operators are < and > for strict order, <= and >= to include equality, == for equal and != for not equal.',
        'A function can return the result of a comparison by declaring -> bool, and println!("{}", ...) prints it as the word true or false.',
      ],
      example: {
        language: 'rust',
        code: 'fn is_adult(age: i32) -> bool {\n    age >= 18\n}\n\nfn main() {\n    println!("{}", is_adult(18));\n    println!("{}", is_adult(17));\n}',
        output: 'true\nfalse',
        explanation:
          '>= includes equality, so 18 counts. 17 is below 18, so the second call returns false.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn fits(size: i32) -> bool {\n    size < 10\n}\n\nfn main() {\n    println!("{}", fits(9));\n    println!("{}", fits(10));\n}',
          ['true\ntrue', 'true\nfalse', 'false\ntrue', 'false\nfalse'],
          1,
          '< is strict: 9 is less than 10, but 10 is not.',
        ),
        predictOutput(
          'What is printed?',
          'fn main() {\n    println!("{}", 3 * 4 == 12);\n    println!("{}", 10 - 3 >= 8);\n}',
          ['false\nfalse', 'true\ntrue', 'false\ntrue', 'true\nfalse'],
          3,
          'The arithmetic runs before the comparison: 12 == 12 is true, and 7 >= 8 is false.',
        ),
        predictOutput(
          'What is the output of this program?',
          'fn main() {\n    println!("{}", 7 != 7);\n    println!("{}", 7 != 8);\n}',
          ['false\ntrue', 'true\nfalse', 'true\ntrue', 'false\nfalse'],
          0,
          '!= is true only when the two values differ.',
        ),
        choose(
          'Which expression is true exactly when n is at most 5?',
          ['n < 5', 'n >= 5', 'n <= 5', 'n == 5'],
          2,
          'At most 5 includes 5 itself, which <= allows and < does not.',
        ),
      ],
    },
    {
      title: 'Require both conditions with &&',
      explanation: [
        'a && b is true only when both a and b are true. It is how you check that a number lies between two bounds: n >= low && n <= high.',
        'Rust evaluates the left side first. If it is false, the whole result must be false, so the right side is skipped entirely.',
      ],
      example: {
        language: 'rust',
        code: 'fn is_teen(age: i32) -> bool {\n    age >= 13 && age <= 19\n}\n\nfn main() {\n    println!("{}", is_teen(13));\n    println!("{}", is_teen(20));\n}',
        output: 'true\nfalse',
        explanation:
          '13 passes both checks. 20 passes age >= 13 but fails age <= 19, so && gives false.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn valid_month(m: i32) -> bool {\n    m >= 1 && m <= 12\n}\n\nfn main() {\n    println!("{}", valid_month(12));\n    println!("{}", valid_month(0));\n}',
          ['true\nfalse', 'true\ntrue', 'false\nfalse', 'false\ntrue'],
          0,
          '12 meets both bounds because <= includes 12. 0 fails m >= 1.',
        ),
        predictOutput(
          'What is printed?',
          'fn main() {\n    println!("{}", 5 > 2 && 2 > 5);\n    println!("{}", 1 < 2 && 2 < 3);\n}',
          ['true\ntrue', 'false\nfalse', 'false\ntrue', 'true\nfalse'],
          2,
          'The first line has one false side, so it is false; both sides of the second are true.',
        ),
        choose(
          'n counts as valid from 10 to 20, including both ends. Which expression checks that?',
          [
            'n > 10 && n < 20',
            '10 <= n <= 20',
            'n >= 10 || n <= 20',
            'n >= 10 && n <= 20',
          ],
          3,
          'Both inclusive bounds must hold, so each gets its own comparison joined by &&. Rust does not allow chained comparisons like 10 <= n <= 20.',
        ),
        predictOutput(
          'What is the output of this program?',
          'fn check(n: i32) -> bool {\n    println!("checking {}", n);\n    n > 0\n}\n\nfn main() {\n    println!("{}", check(-1) && check(5));\n}',
          [
            'checking -1\nchecking 5\nfalse',
            'checking -1\nfalse',
            'false',
            'checking 5\nchecking -1\nfalse',
          ],
          1,
          'check(-1) returns false, so && skips check(5) entirely and the result is false.',
        ),
      ],
    },
    {
      title: 'Accept either condition with ||',
      explanation: [
        'a || b is true when at least one side is true. It suits checks for being outside a range: n < low || n > high.',
        'Like &&, it evaluates left to right and stops early: once the left side is true, the result is true and the right side is never evaluated.',
      ],
      example: {
        language: 'rust',
        code: 'fn is_weekend(day: i32) -> bool {\n    day == 6 || day == 7\n}\n\nfn main() {\n    println!("{}", is_weekend(7));\n    println!("{}", is_weekend(3));\n}',
        output: 'true\nfalse',
        explanation:
          'For 7 the right side is true, which is enough. For 3 neither side is true.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn out_of_range(n: i32) -> bool {\n    n < 0 || n > 100\n}\n\nfn main() {\n    println!("{}", out_of_range(50));\n    println!("{}", out_of_range(101));\n}',
          ['true\nfalse', 'false\ntrue', 'false\nfalse', 'true\ntrue'],
          1,
          '50 fails both sides, so it is not out of range; 101 is above 100.',
        ),
        predictOutput(
          'What is printed?',
          'fn main() {\n    println!("{}", 2 > 1 || 1 > 2);\n    println!("{}", 0 > 1 || 1 > 2);\n}',
          ['false\nfalse', 'true\ntrue', 'false\ntrue', 'true\nfalse'],
          3,
          'One true side is enough for the first line; both sides of the second are false.',
        ),
        choose(
          'A ticket is free for ages under 5 and for ages 65 and over. Which expression is true exactly for free tickets?',
          [
            'age < 5 && age >= 65',
            'age <= 5 || age > 65',
            'age < 5 || age >= 65',
            'age > 5 || age < 65',
          ],
          2,
          'Either condition alone makes the ticket free, so the two exact bounds are joined with ||.',
        ),
        predictOutput(
          'What is the output of this program?',
          'fn noisy(b: bool) -> bool {\n    println!("saw {}", b);\n    b\n}\n\nfn main() {\n    println!("{}", noisy(true) || noisy(false));\n}',
          [
            'saw true\ntrue',
            'saw true\nsaw false\ntrue',
            'true',
            'saw false\nsaw true\ntrue',
          ],
          0,
          'The left call returns true, so || never runs noisy(false).',
        ),
      ],
    },
    {
      title: 'Negate with ! and combine conditions',
      explanation: [
        '! flips a bool: !true is false and !false is true. Put it before a parenthesized condition to ask for the opposite, as in !(n >= 1 && n <= 9), which is true when n is outside 1 to 9.',
        'When && and || appear together, && is evaluated first, so a || b && c means a || (b && c). Add parentheses whenever you mean something else.',
      ],
      example: {
        language: 'rust',
        code: 'fn in_digits(n: i32) -> bool {\n    n >= 0 && n <= 9\n}\n\nfn main() {\n    println!("{}", !in_digits(12));\n    println!("{}", !(3 > 1));\n}',
        output: 'true\nfalse',
        explanation:
          'in_digits(12) is false, and ! flips it to true. 3 > 1 is true, so its negation is false.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn outside(n: i32, low: i32, high: i32) -> bool {\n    !(n >= low && n <= high)\n}\n\nfn main() {\n    println!("{}", outside(5, 1, 10));\n    println!("{}", outside(11, 1, 10));\n}',
          ['true\nfalse', 'true\ntrue', 'false\ntrue', 'false\nfalse'],
          2,
          '5 is inside 1 to 10, so the negation is false; 11 is not inside, so it is true.',
        ),
        predictOutput(
          'What is printed?',
          'fn main() {\n    println!("{}", true || false && false);\n    println!("{}", (true || false) && false);\n}',
          ['false\nfalse', 'true\nfalse', 'false\ntrue', 'true\ntrue'],
          1,
          'Without parentheses, false && false is grouped first, and true || false is true. The parentheses in the second line make || go first.',
        ),
        choose(
          'Which expression is true in exactly the same cases as !(a > 3)?',
          ['a < 3', 'a >= 3', '!a > 3', 'a <= 3'],
          3,
          'Not greater than 3 means 3 or less, which includes a == 3.',
        ),
        predictOutput(
          'What is the output of this program?',
          'fn main() {\n    println!("{}", !(4 == 4) || 2 < 3);\n    println!("{}", !(2 < 3 && 5 > 1));\n}',
          ['true\nfalse', 'false\nfalse', 'true\ntrue', 'false\ntrue'],
          0,
          '!(4 == 4) is false, but 2 < 3 is true, so the first line is true. The second negates a true &&, giving false.',
        ),
      ],
    },
  ],
  'rust-const': [
    {
      title: 'Declare a const with a name and a type',
      explanation: [
        'const NAME: TYPE = value; gives a fixed value a name. The type is required, and by convention the name is written in UPPER_SNAKE_CASE. A const is usually declared outside any function, so every function in the file can read it.',
        'A const can sit anywhere at the top level of the file, even below the functions that use it.',
      ],
      example: {
        language: 'rust',
        code: 'const DAYS_PER_WEEK: u32 = 7;\n\nfn days(weeks: u32) -> u32 {\n    weeks * DAYS_PER_WEEK\n}\n\nfn main() {\n    println!("{}", days(3));\n    println!("{}", DAYS_PER_WEEK);\n}',
        output: '21\n7',
        explanation:
          'days reads DAYS_PER_WEEK to compute 3 * 7 = 21, and main reads the same constant directly.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'const LIMIT: i32 = 50;\n\nfn main() {\n    println!("{}", LIMIT - 8);\n}',
          ['58', '42', 'LIMIT - 8', '50'],
          1,
          'LIMIT stands for 50, so LIMIT - 8 is 42.',
        ),
        choose(
          'Which line declares a valid constant?',
          [
            'const MAX_USERS = 100;',
            'let const MAX_USERS: u32 = 100;',
            'const MAX_USERS: u32 = 100;',
            'const mut MAX_USERS: u32 = 100;',
          ],
          2,
          'A const needs the const keyword, a name, an explicit type and a value, and it cannot be mut.',
        ),
        predictOutput(
          'What is printed?',
          'const BOX: u32 = 12;\n\nfn boxes(items: u32) -> u32 {\n    items / BOX\n}\n\nfn loose(items: u32) -> u32 {\n    items % BOX\n}\n\nfn main() {\n    println!("{} {}", boxes(30), loose(30));\n}',
          ['2 6', '2.5 6', '3 6', '6 2'],
          0,
          'Both functions read the same BOX: 30 / 12 is 2 and 30 % 12 is 6.',
        ),
        choose(
          'RATE is declared below main. What happens when this program is compiled and run?',
          [
            'It fails to compile: RATE is declared later',
            'It prints 15, the value of RATE alone',
            'It prints 0, since RATE is not set yet',
            'It prints 30, using RATE from below',
          ],
          3,
          'Top-level items such as const can be used anywhere in the file, regardless of their position.',
          'fn main() {\n    println!("{}", RATE * 2);\n}\n\nconst RATE: i32 = 15;',
        ),
      ],
    },
    {
      title: 'A const never changes',
      explanation: [
        'A const is fixed for the whole program: assigning to it does not compile, and const mut does not exist. Every use reads the same value.',
        'When a value must start at the constant and then change, copy it into a let mut binding and change the copy. The const keeps its value.',
      ],
      example: {
        language: 'rust',
        code: 'const START: i32 = 10;\n\nfn main() {\n    let mut level = START;\n    level += 5;\n    println!("{}", level);\n    println!("{}", START);\n}',
        output: '15\n10',
        explanation:
          'level is a mutable copy of START, so adding 5 changes level only. START still reads 10.',
      },
      questions: [
        choose(
          'What happens when this program is compiled?',
          [
            'It prints 40, the new value',
            'It prints 30, ignoring the assignment',
            'It fails to compile: SPEED cannot be assigned',
            'It prints 70, adding both values',
          ],
          2,
          'A const is not a variable, so it cannot appear on the left of an assignment.',
          'const SPEED: u32 = 30;\n\nfn main() {\n    SPEED = 40;\n    println!("{}", SPEED);\n}',
        ),
        predictOutput(
          'What does this program print?',
          'const BASE: i32 = 3;\n\nfn main() {\n    let mut total = BASE;\n    total *= BASE;\n    total += BASE;\n    println!("{}", total);\n}',
          ['9', '12', '6', '18'],
          1,
          'total starts at 3, becomes 3 * 3 = 9, then 9 + 3 = 12; BASE is 3 at every use.',
        ),
        predictOutput(
          'What is printed?',
          'const STEP: i32 = 4;\n\nfn next(n: i32) -> i32 {\n    n + STEP\n}\n\nfn main() {\n    println!("{}", next(next(1)));\n}',
          ['5', '13', '9', '8'],
          2,
          'Each call adds the same STEP: 1 + 4 = 5, then 5 + 4 = 9.',
        ),
        choose(
          'A game’s health starts at MAX_HP and drops as the player takes damage. How should the code handle it?',
          [
            'Copy MAX_HP into a let mut binding and lower that',
            'Assign the new health directly to MAX_HP',
            'Declare it as const mut MAX_HP instead',
            'Declare a new const each time health drops',
          ],
          0,
          'The changing value needs a mutable binding; the const stays as the fixed starting point.',
        ),
      ],
    },
    {
      title: 'Name a repeated conversion factor once',
      explanation: [
        'When the same fixed number appears in several places, such as 100 centimeters per meter, give it a const name. Every function then reads that one definition, and the code says what the number means instead of repeating a bare 100.',
        'A const can have any type, including an array, and it is read like any other value of that type.',
      ],
      example: {
        language: 'rust',
        code: 'const CM_PER_M: u32 = 100;\n\nfn to_cm(meters: u32) -> u32 {\n    meters * CM_PER_M\n}\n\nfn split_cm(cm: u32) -> (u32, u32) {\n    (cm / CM_PER_M, cm % CM_PER_M)\n}\n\nfn main() {\n    println!("{}", to_cm(3));\n    println!("{:?}", split_cm(250));\n}',
        output: '300\n(2, 50)',
        explanation:
          'Both functions use the same CM_PER_M. 3 meters is 300 cm, and 250 cm splits into 2 whole meters and 50 cm.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'const SECONDS_PER_MINUTE: u32 = 60;\n\nfn to_seconds(minutes: u32, seconds: u32) -> u32 {\n    minutes * SECONDS_PER_MINUTE + seconds\n}\n\nfn main() {\n    println!("{}", to_seconds(2, 15));\n}',
          ['75', '135', '150', '2015'],
          1,
          'Multiplication happens first: 2 * 60 = 120, plus 15 gives 135.',
        ),
        predictOutput(
          'What is printed?',
          'const PER_TEAM: u32 = 5;\n\nfn teams(players: u32) -> (u32, u32) {\n    (players / PER_TEAM, players % PER_TEAM)\n}\n\nfn main() {\n    println!("{:?}", teams(23));\n}',
          ['(4, 3)', '(5, 0)', '(3, 4)', '(4.6, 3)'],
          0,
          '23 / 5 is 4 full teams, and 23 % 5 leaves 3 players.',
        ),
        choose(
          'The number 24 appears in three functions as hours per day. What is the best change?',
          [
            'Add let hours = 24; at the start of main',
            'Pass 24 as an extra argument to every call',
            'Declare const HOURS_PER_DAY: u32 = 24; and use it',
            'Leave the bare 24 in each function as it is',
          ],
          2,
          'A const gives the fixed value one named definition that every function can read.',
        ),
        predictOutput(
          'What is the output of this program?',
          'const LEVELS: [u32; 3] = [10, 20, 40];\n\nfn bonus(level: usize) -> u32 {\n    LEVELS[level] / 2\n}\n\nfn main() {\n    println!("{}", bonus(0) + bonus(2));\n}',
          ['15', '50', '30', '25'],
          3,
          'bonus(0) is 10 / 2 = 5 and bonus(2) is 40 / 2 = 20, for a total of 25.',
        ),
      ],
    },
  ],
  'rust-if': [
    {
      title: 'Run one branch with if and else',
      explanation: [
        'An if tests a bool condition. When it is true, the block after if runs; otherwise the else block runs. Exactly one of the two blocks runs, and then the program continues after the whole if. The else is optional: without it, nothing extra happens when the condition is false.',
        'The condition must be a bool, such as the comparison n > 0. Rust does not treat a number as true or false.',
      ],
      example: {
        language: 'rust',
        code: 'fn check(n: i32) {\n    if n > 10 {\n        println!("big");\n    } else {\n        println!("small");\n    }\n    println!("checked");\n}\n\nfn main() {\n    check(12);\n    check(10);\n}',
        output: 'big\nchecked\nsmall\nchecked',
        explanation:
          '12 > 10 is true, so the first call prints big. 10 > 10 is false, so the second call runs the else block. Both calls print checked after the if.',
      },
      questions: [
        predictOutput(
          'What does this complete Rust program print?',
          'fn report(temp: i32) {\n    if temp < 0 {\n        println!("ice");\n    } else {\n        println!("water");\n    }\n}\n\nfn main() {\n    report(0);\n}',
          ['ice', 'water', 'ice\nwater', 'Nothing'],
          1,
          '0 < 0 is false, so only the else block runs.',
        ),
        predictOutput(
          'What does this complete Rust program print?',
          'fn gate(age: i32) {\n    if age >= 18 && age <= 65 {\n        println!("standard");\n    } else {\n        println!("reduced");\n    }\n    println!("next");\n}\n\nfn main() {\n    gate(70);\n    gate(18);\n}',
          [
            'standard\nnext\nreduced\nnext',
            'reduced\nstandard\nnext',
            'reduced\nnext\nstandard\nnext',
            'reduced\nnext',
          ],
          2,
          '70 fails age <= 65, so the first call prints reduced; 18 passes both tests. Each call also prints next after its if.',
        ),
        choose(
          'What happens when this program is compiled and run?',
          [
            'It prints yes',
            'It prints no',
            'It fails to compile',
            'It prints yes and no',
          ],
          2,
          'An if condition must be a bool. n is an i32, and Rust does not treat a nonzero number as true, so this is a type error.',
          'fn show(n: i32) {\n    if n {\n        println!("yes");\n    } else {\n        println!("no");\n    }\n}\n\nfn main() {\n    show(3);\n}',
        ),
        predictOutput(
          'What does this complete Rust program print?',
          'fn warn(level: i32) {\n    if level > 3 {\n        println!("alert");\n    }\n    println!("done");\n}\n\nfn main() {\n    warn(2);\n    warn(5);\n}',
          [
            'alert\ndone',
            'done\ndone',
            'alert\ndone\ndone',
            'done\nalert\ndone',
          ],
          3,
          'With no else, warn(2) skips the block and prints only done. warn(5) prints alert, then done.',
        ),
      ],
    },
    {
      title: 'Use if as a value',
      explanation: [
        'if is an expression: the branch that runs produces the value of the whole if. The last expression of each block, written without a semicolon, is that branch’s value, so an if can be the tail expression of a function.',
        'Because either branch might be chosen, both must produce the same type, and an if used as a value needs an else so there is a value when the condition is false.',
      ],
      example: {
        language: 'rust',
        code: 'fn larger(a: i32, b: i32) -> i32 {\n    if a > b {\n        a\n    } else {\n        b\n    }\n}\n\nfn main() {\n    println!("{}", larger(4, 9));\n    println!("{}", larger(-2, -5));\n}',
        output: '9\n-2',
        explanation:
          'For 4 and 9 the condition is false, so the else block’s value, 9, is returned. For -2 and -5 the condition is true, so -2 is returned.',
      },
      questions: [
        predictOutput(
          'What does this complete Rust program print?',
          'fn fee(members: i32) -> i32 {\n    if members > 4 {\n        members * 8\n    } else {\n        members * 10\n    }\n}\n\nfn main() {\n    println!("{}", fee(4));\n}',
          ['32', '40', '4', '72'],
          1,
          '4 > 4 is false, so the else branch gives 4 * 10 = 40.',
        ),
        predictOutput(
          'What does this complete Rust program print?',
          'fn bonus(score: i32) -> i32 {\n    if score >= 90 {\n        5\n    } else {\n        0\n    }\n}\n\nfn main() {\n    println!("{}", 88 + bonus(88));\n    println!("{}", 90 + bonus(90));\n}',
          ['93\n95', '88\n90', '93\n90', '88\n95'],
          3,
          'bonus(88) is 0 because 88 is below 90, and bonus(90) is 5 because >= includes 90.',
        ),
        choose(
          'Why does this function fail to compile?',
          [
            'The branches produce different types',
            'An if cannot be the last expression',
            'The else block needs a semicolon',
            'A function cannot return the literal 1',
          ],
          0,
          'One branch produces an i32 and the other a bool. Both branches of an if used as a value must have the same type.',
          'fn label(n: i32) -> i32 {\n    if n > 0 {\n        1\n    } else {\n        false\n    }\n}\n\nfn main() {\n    println!("{}", label(3));\n}',
        ),
        choose(
          'What happens when this function is compiled?',
          [
            'It compiles; it returns n when n <= 100',
            'It compiles; it returns 0 when n <= 100',
            'It fails: there is no value when n <= 100',
            'It fails: the 100 needs a semicolon',
          ],
          2,
          'An if without else has no value for the false case, so it cannot be the i32 result of the function.',
          'fn cap(n: i32) -> i32 {\n    if n > 100 {\n        100\n    }\n}\n\nfn main() {\n    println!("{}", cap(250));\n}',
        ),
      ],
    },
    {
      title: 'Choose among several cases with else if',
      explanation: [
        'else if adds another condition to try when the earlier ones were false. Rust tests the conditions from top to bottom and runs only the first block whose condition is true; the final else covers everything left over.',
        'Order matters: a broad condition placed first can catch values that a later, narrower condition was meant for.',
      ],
      example: {
        language: 'rust',
        code: 'fn shipping(weight: i32) -> i32 {\n    if weight <= 1 {\n        5\n    } else if weight <= 10 {\n        12\n    } else {\n        30\n    }\n}\n\nfn main() {\n    println!("{}", shipping(1));\n    println!("{}", shipping(7));\n    println!("{}", shipping(25));\n}',
        output: '5\n12\n30',
        explanation:
          '1 passes the first test. 7 fails the first test and passes the second. 25 fails both, so the final else supplies 30.',
      },
      questions: [
        predictOutput(
          'What does this complete Rust program print?',
          'fn grade(score: i32) -> i32 {\n    if score >= 90 {\n        4\n    } else if score >= 80 {\n        3\n    } else if score >= 70 {\n        2\n    } else {\n        0\n    }\n}\n\nfn main() {\n    println!("{}", grade(80));\n}',
          ['2', '4', '3', '0'],
          2,
          '80 fails score >= 90 but passes score >= 80, so the chain stops there with 3.',
        ),
        predictOutput(
          'What does this complete Rust program print?',
          'fn size(n: i32) -> i32 {\n    if n > 10 {\n        1\n    } else if n > 100 {\n        2\n    } else {\n        3\n    }\n}\n\nfn main() {\n    println!("{}", size(500));\n}',
          ['1', '2', '3', '12'],
          0,
          '500 > 10 is already true, so the first branch wins and the n > 100 test is never reached.',
        ),
        predictOutput(
          'What does this complete Rust program print?',
          'fn sign(n: i32) {\n    if n > 0 {\n        println!("plus");\n    } else if n < 0 {\n        println!("minus");\n    } else {\n        println!("zero");\n    }\n}\n\nfn main() {\n    sign(-4);\n    sign(0);\n}',
          ['plus\nzero', 'zero\nminus', 'minus\nminus', 'minus\nzero'],
          3,
          '-4 fails n > 0 and passes n < 0. 0 fails both tests, so the else prints zero.',
        ),
        choose(
          'A ticket function must return 0 for ages under 3, 5 for ages under 12, and 9 otherwise. Which body is correct?',
          [
            'if age < 12 { 5 } else if age < 3 { 0 } else { 9 }',
            'if age < 3 { 0 } else if age < 12 { 5 } else { 9 }',
            'if age < 3 { 0 } else if age > 12 { 5 } else { 9 }',
            'if age < 12 { 0 } else if age < 3 { 5 } else { 9 }',
          ],
          1,
          'The narrower test age < 3 must come first; if age < 12 came first it would also catch ages under 3.',
        ),
      ],
    },
    {
      title: 'Decide with compound conditions',
      explanation: [
        'Each condition in an if chain can be any bool expression, including tests joined with && or || and tests flipped with !. The chain still runs only the first branch whose whole condition is true.',
        'Combined with if as a value, this lets one function turn several inputs into a single result.',
      ],
      example: {
        language: 'rust',
        code: 'fn price(age: i32, weekend: bool) -> i32 {\n    if age < 12 || age >= 65 {\n        6\n    } else if weekend {\n        12\n    } else {\n        10\n    }\n}\n\nfn main() {\n    println!("{}", price(70, true));\n    println!("{}", price(30, true));\n    println!("{}", price(30, false));\n}',
        output: '6\n12\n10',
        explanation:
          '70 satisfies age >= 65, so the first branch wins even on a weekend. 30 fails the first test, so weekend decides between 12 and 10.',
      },
      questions: [
        predictOutput(
          'What does this complete Rust program print?',
          'fn parking(hours: i32, member: bool) -> i32 {\n    if member && hours <= 2 {\n        0\n    } else if hours <= 2 {\n        4\n    } else {\n        hours * 3\n    }\n}\n\nfn main() {\n    println!("{}", parking(3, true));\n}',
          ['0', '4', '9', '3'],
          2,
          '&& needs both parts; hours <= 2 is false, so the first two tests fail and the else gives 3 * 3 = 9.',
        ),
        predictOutput(
          'What does this complete Rust program print?',
          'fn alarm(smoke: bool, heat: i32) -> i32 {\n    if smoke || heat > 60 {\n        2\n    } else if heat > 40 {\n        1\n    } else {\n        0\n    }\n}\n\nfn main() {\n    println!("{}", alarm(false, 50));\n    println!("{}", alarm(true, 20));\n}',
          ['1\n0', '0\n2', '2\n2', '1\n2'],
          3,
          'For (false, 50) neither part of the || is true, but 50 > 40 gives 1. For (true, 20) smoke alone makes the || true, giving 2.',
        ),
        predictOutput(
          'What does this complete Rust program print?',
          'fn access(locked: bool, admin: bool) -> i32 {\n    if !locked {\n        1\n    } else if admin {\n        2\n    } else {\n        3\n    }\n}\n\nfn main() {\n    println!("{}", access(true, true) + access(false, false));\n}',
          ['3', '5', '4', '2'],
          0,
          'access(true, true) skips !locked and returns 2 because admin is true. access(false, false) returns 1 because !false is true. 2 + 1 = 3.',
        ),
        choose(
          'A function must return 1 exactly when n is between 1 and 9, both included, and 0 otherwise. Which body is correct?',
          [
            'if n >= 1 || n <= 9 { 1 } else { 0 }',
            'if n >= 1 && n <= 9 { 1 } else { 0 }',
            'if n > 1 && n < 9 { 1 } else { 0 }',
            'if n >= 1 && n <= 9 { 0 } else { 1 }',
          ],
          1,
          'Both bounds must hold, so they are joined with &&, and >= and <= keep 1 and 9 inside the range.',
        ),
      ],
    },
  ],
  'rust-match': [
    {
      title: 'Match an integer against literal patterns',
      explanation: [
        'match compares a value with each pattern from top to bottom and runs the first arm whose pattern fits. Each arm is written pattern => result, and the whole match produces that arm’s result.',
        'The pattern _ matches any value, so a final _ arm handles everything the earlier arms did not name.',
      ],
      example: {
        language: 'rust',
        code: 'fn medal_points(place: i32) -> i32 {\n    match place {\n        1 => 10,\n        2 => 6,\n        3 => 3,\n        _ => 0,\n    }\n}\n\nfn main() {\n    println!("{}", medal_points(2));\n    println!("{}", medal_points(7));\n}',
        output: '6\n0',
        explanation:
          '2 matches the second arm, so the match produces 6. 7 matches none of the literals, so the _ arm produces 0.',
      },
      questions: [
        predictOutput(
          'What does this complete Rust program print?',
          'fn wheels(kind: i32) -> i32 {\n    match kind {\n        1 => 2,\n        2 => 4,\n        3 => 18,\n        _ => 0,\n    }\n}\n\nfn main() {\n    println!("{}", wheels(3));\n}',
          ['3', '18', '0', '4'],
          1,
          'The value 3 matches the pattern 3, whose result is 18.',
        ),
        predictOutput(
          'What does this complete Rust program print?',
          'fn day_name(day: i32) {\n    match day {\n        6 => println!("Saturday"),\n        7 => println!("Sunday"),\n        _ => println!("weekday"),\n    }\n}\n\nfn main() {\n    day_name(7);\n    day_name(1);\n}',
          ['Sunday\nweekday', 'Sunday\nSaturday', 'weekday\nweekday', 'Sunday'],
          0,
          '7 runs the Sunday arm. 1 matches no literal, so the _ arm prints weekday.',
        ),
        predictOutput(
          'What does this complete Rust program print?',
          'fn code(n: i32) -> i32 {\n    match n {\n        0 => 100,\n        1 => 200,\n        _ => -1,\n    }\n}\n\nfn main() {\n    println!("{}", code(1) + code(5));\n}',
          ['300', '200', '99', '199'],
          3,
          'code(1) is 200 and code(5) falls to the _ arm, giving -1. 200 + -1 = 199.',
        ),
        choose(
          'Two arms of a match both fit the value being matched. Which one runs?',
          [
            'The last one written',
            'Both, from top to bottom',
            'The first one written',
            'Neither; it fails to compile',
          ],
          2,
          'match tries arms in order and stops at the first pattern that fits.',
        ),
      ],
    },
    {
      title: 'Cover every possible value',
      explanation: [
        'A match must be exhaustive: every possible value of the matched type needs an arm. You cannot list every i32, so a match on an i32 needs a fallback such as _; without one, the program does not compile.',
        'Arms are tried in order, so the fallback goes last. A _ placed first matches everything, and the specific arms after it never run.',
      ],
      example: {
        language: 'rust',
        code: 'fn bonus(level: i32) -> i32 {\n    match level {\n        1 => 5,\n        2 => 15,\n        _ => 50,\n    }\n}\n\nfn main() {\n    println!("{}", bonus(2));\n    println!("{}", bonus(-4));\n}',
        output: '15\n50',
        explanation:
          '-4 matches no specific arm, so _ catches it. Without the _ arm the match would not compile, because values like -4 would have nowhere to go.',
      },
      questions: [
        choose(
          'What happens when this program is compiled?',
          [
            'It fails to compile',
            'It prints 40',
            'It prints 0',
            'It prints 40 with a warning',
          ],
          0,
          'Values such as 0 and 4 match no arm, so the match is not exhaustive and the compiler rejects it.',
          'fn rating(stars: i32) -> i32 {\n    match stars {\n        1 => 20,\n        2 => 40,\n        3 => 60,\n    }\n}\n\nfn main() {\n    println!("{}", rating(2));\n}',
        ),
        predictOutput(
          'What does this complete Rust program print?',
          'fn price(size: i32) -> i32 {\n    match size {\n        _ => 9,\n        1 => 3,\n        2 => 5,\n    }\n}\n\nfn main() {\n    println!("{}", price(1));\n}',
          ['3', '9', '5', '12'],
          1,
          'The _ arm comes first and matches every value, so it always wins; the arms for 1 and 2 can never run.',
        ),
        predictOutput(
          'What does this complete Rust program print?',
          'fn check(n: i32) {\n    match n {\n        0 => println!("empty"),\n        _ => println!("some"),\n    }\n    println!("end");\n}\n\nfn main() {\n    check(0);\n    check(3);\n}',
          [
            'empty\nsome\nend',
            'some\nend\nsome\nend',
            'empty\nsome\nend\nend',
            'empty\nend\nsome\nend',
          ],
          3,
          'Each call runs one arm and then prints end. 0 takes the first arm; 3 falls to _.',
        ),
        choose(
          'A match on an i32 has arms for 1, 2 and 3. Where should its _ fallback arm go?',
          [
            'Before the arm for 1',
            'Between the arms for 2 and 3',
            'After the arm for 3',
            'Anywhere; arm order is ignored',
          ],
          2,
          'Arms are tried in order, so a _ placed earlier would catch values meant for the later arms.',
        ),
      ],
    },
    {
      title: 'Group values with | and ranges',
      explanation: [
        'One arm can cover several values. p | q matches when either pattern fits, and a range pattern like 1..=9 matches every integer from 1 to 9, both ends included.',
        'Arms are still tried in order, so a wide range placed after narrower arms only catches the values they did not take. A match on an i32 keeps its _ fallback for everything outside the named values.',
      ],
      example: {
        language: 'rust',
        code: 'fn days_in_month(month: i32) -> i32 {\n    match month {\n        2 => 28,\n        4 | 6 | 9 | 11 => 30,\n        1..=12 => 31,\n        _ => 0,\n    }\n}\n\nfn main() {\n    println!("{}", days_in_month(9));\n    println!("{}", days_in_month(7));\n    println!("{}", days_in_month(13));\n}',
        output: '30\n31\n0',
        explanation:
          '9 is one of the alternatives in 4 | 6 | 9 | 11. 7 skips the first two arms and falls inside 1..=12. 13 is outside every pattern, so _ returns 0.',
      },
      questions: [
        predictOutput(
          'What does this complete Rust program print?',
          'fn level(score: i32) -> i32 {\n    match score {\n        0..=49 => 1,\n        50..=79 => 2,\n        80..=100 => 3,\n        _ => 0,\n    }\n}\n\nfn main() {\n    println!("{}", level(79));\n    println!("{}", level(80));\n}',
          ['2\n2', '2\n3', '1\n3', '3\n3'],
          1,
          '..= includes its upper end, so 79 belongs to 50..=79 and 80 starts 80..=100.',
        ),
        predictOutput(
          'What does this complete Rust program print?',
          'fn points(card: i32) -> i32 {\n    match card {\n        1 => 11,\n        11 | 12 | 13 => 10,\n        2..=10 => card,\n        _ => 0,\n    }\n}\n\nfn main() {\n    println!("{}", points(12) + points(10) + points(1));\n}',
          ['33', '21', '30', '31'],
          3,
          '12 matches 11 | 12 | 13 and gives 10, 10 is inside 2..=10 and gives itself, and 1 gives 11: 10 + 10 + 11 = 31.',
        ),
        predictOutput(
          'What does this complete Rust program print?',
          'fn zone(t: i32) -> i32 {\n    match t {\n        -10..=-1 => 1,\n        0 => 2,\n        1..=10 => 3,\n        _ => 4,\n    }\n}\n\nfn main() {\n    println!("{}", zone(-1));\n    println!("{}", zone(10));\n    println!("{}", zone(11));\n}',
          ['1\n4\n4', '4\n3\n4', '1\n3\n4', '2\n3\n4'],
          2,
          '-1 is the upper end of -10..=-1 and 10 is the upper end of 1..=10; both ends are included. 11 is outside every range.',
        ),
        choose(
          'Which pattern matches exactly the integers 10 through 20, including 10 and 20?',
          ['10..=20', '10..20', '10 | 20', '11..=19'],
          0,
          '..= includes both ends. 10..20 leaves out 20, and 10 | 20 matches only those two numbers.',
        ),
      ],
    },
    {
      title: 'Add conditions with match guards',
      explanation: [
        'A guard adds an if test to an arm: n if n < 0 => ... names the value n and takes the arm only when the condition is true. If the guard is false, matching moves on to the next arm.',
        'The compiler does not use guards to prove a match is exhaustive, so a match whose arms are all guarded still needs a fallback such as _.',
      ],
      example: {
        language: 'rust',
        code: 'fn classify(n: i32) -> i32 {\n    match n {\n        0 => 0,\n        n if n > 100 => 3,\n        n if n > 0 => 1,\n        _ => -1,\n    }\n}\n\nfn main() {\n    println!("{}", classify(250));\n    println!("{}", classify(42));\n    println!("{}", classify(-8));\n}',
        output: '3\n1\n-1',
        explanation:
          '250 passes the guard n > 100. 42 fails that guard and passes n > 0. -8 fails both guards, so _ gives -1.',
      },
      questions: [
        predictOutput(
          'What does this complete Rust program print?',
          'fn discount(qty: i32) -> i32 {\n    match qty {\n        0 => 0,\n        q if q >= 10 => 20,\n        q if q >= 5 => 10,\n        _ => 5,\n    }\n}\n\nfn main() {\n    println!("{}", discount(5));\n    println!("{}", discount(12));\n}',
          ['10\n20', '5\n20', '10\n10', '20\n20'],
          0,
          '5 fails q >= 10 but passes q >= 5, giving 10. 12 passes the first guard, giving 20.',
        ),
        predictOutput(
          'What does this complete Rust program print?',
          'fn rank(n: i32) -> i32 {\n    match n {\n        n if n > 0 => 1,\n        n if n > 50 => 2,\n        _ => 0,\n    }\n}\n\nfn main() {\n    println!("{}", rank(80));\n}',
          ['2', '0', '1', '3'],
          2,
          '80 > 0 is true, so the first arm wins; the n > 50 arm is never tried.',
        ),
        predictOutput(
          'What does this complete Rust program print?',
          'fn describe(n: i32) {\n    match n {\n        1 | 3 | 5 => println!("small odd"),\n        n if n > 5 && n < 10 => println!("medium"),\n        0..=9 => println!("small even"),\n        _ => println!("large"),\n    }\n}\n\nfn main() {\n    describe(4);\n    describe(7);\n    describe(10);\n}',
          [
            'small even\nsmall odd\nlarge',
            'medium\nmedium\nlarge',
            'small even\nmedium\nmedium',
            'small even\nmedium\nlarge',
          ],
          3,
          '4 fails the first two arms and lands in 0..=9. 7 passes the guard. 10 fails the guard (10 < 10 is false) and is outside 0..=9.',
        ),
        choose(
          'Every i32 is negative, zero, or positive, yet this match fails to compile. Why?',
          [
            'Guards cannot use comparison operators',
            'Guards do not count toward exhaustiveness',
            'The arms return different types',
            'A guard cannot reuse the name n',
          ],
          1,
          'The compiler does not reason about guard conditions, so it sees no arm that surely matches; a _ arm is required.',
          'fn sign(n: i32) -> i32 {\n    match n {\n        n if n < 0 => -1,\n        n if n == 0 => 0,\n        n if n > 0 => 1,\n    }\n}\n\nfn main() {\n    println!("{}", sign(5));\n}',
        ),
      ],
    },
  ],
  'rust-loop': [
    {
      title: 'Repeat with loop until break',
      explanation: [
        'loop runs its body again and again; it has no condition of its own. The way out is break, usually inside an if that checks whether the work is done.',
        'Each pass should move toward that exit, for example by changing a counter. A loop whose break can never be reached runs forever.',
      ],
      example: {
        language: 'rust',
        code: 'fn main() {\n    let mut n = 1;\n    loop {\n        println!("{}", n);\n        if n == 3 {\n            break;\n        }\n        n += 1;\n    }\n    println!("after");\n}',
        output: '1\n2\n3\nafter',
        explanation:
          'Each pass prints n and then checks it. When n is 3 the break ends the loop before n += 1, and the program continues with after.',
      },
      questions: [
        predictOutput(
          'What does this complete Rust program print?',
          'fn main() {\n    let mut count = 0;\n    loop {\n        count += 2;\n        if count >= 7 {\n            break;\n        }\n    }\n    println!("{}", count);\n}',
          ['6', '7', '8', '10'],
          2,
          'count goes 2, 4, 6, 8. The first value that is at least 7 is 8, and the loop stops there.',
        ),
        predictOutput(
          'What does this complete Rust program print?',
          'fn main() {\n    let mut n = 10;\n    loop {\n        if n < 4 {\n            break;\n        }\n        println!("{}", n);\n        n -= 3;\n    }\n}',
          ['10\n7', '10\n7\n4', '10\n7\n4\n1', '7\n4\n1'],
          1,
          '10, 7 and 4 are printed. Then n becomes 1, and the check at the top breaks before printing it.',
        ),
        choose(
          'What happens when this program runs?',
          [
            'It prints 0 to 4, then stops',
            'It prints 0 to 5, then stops',
            'It prints 0 again and again forever',
            'It stops at once and prints nothing',
          ],
          2,
          'Nothing in the body changes n, so n == 5 is never true and the break is never reached.',
          'fn main() {\n    let mut n = 0;\n    loop {\n        if n == 5 {\n            break;\n        }\n        println!("{}", n);\n    }\n}',
        ),
        predictOutput(
          'What does this complete Rust program print?',
          'fn main() {\n    let mut steps = 0;\n    let mut x = 1;\n    loop {\n        x *= 3;\n        steps += 1;\n        if x > 50 {\n            break;\n        }\n    }\n    println!("{} {}", steps, x);\n}',
          ['3 27', '4 27', '5 243', '4 81'],
          3,
          'x goes 3, 9, 27, 81. The fourth pass makes x 81, which is over 50, so the loop breaks with steps at 4.',
        ),
      ],
    },
    {
      title: 'Return a value with break',
      explanation: [
        'A loop is an expression. break value; ends the loop and makes value the result of the whole loop, so you can store it with let or make the loop the tail expression of a function.',
        'When a loop is used as a value, every break in it must supply a value of the same type.',
      ],
      example: {
        language: 'rust',
        code: 'fn first_square_over(limit: i32) -> i32 {\n    let mut n = 1;\n    loop {\n        if n * n > limit {\n            break n * n;\n        }\n        n += 1;\n    }\n}\n\nfn main() {\n    println!("{}", first_square_over(30));\n}',
        output: '36',
        explanation:
          'n reaches 6 before n * n exceeds 30, and break n * n hands 36 back as the loop’s value. The loop is the function’s tail expression, so 36 is returned.',
      },
      questions: [
        predictOutput(
          'What does this complete Rust program print?',
          'fn main() {\n    let mut total = 0;\n    let mut i = 1;\n    let result = loop {\n        total += i;\n        if total > 10 {\n            break i;\n        }\n        i += 1;\n    };\n    println!("{} {}", result, total);\n}',
          ['4 10', '15 5', '5 15', '5 10'],
          2,
          'total goes 1, 3, 6, 10, 15. It first exceeds 10 when i is 5, so the loop’s value is 5 and total is 15.',
        ),
        predictOutput(
          'What does this complete Rust program print?',
          'fn next_multiple(n: i32, step: i32) -> i32 {\n    let mut x = n;\n    loop {\n        if x % step == 0 {\n            break x;\n        }\n        x += 1;\n    }\n}\n\nfn main() {\n    println!("{}", next_multiple(14, 5));\n    println!("{}", next_multiple(20, 5));\n}',
          ['15\n20', '15\n25', '10\n20', '14\n20'],
          0,
          'From 14 the loop climbs to 15, the first multiple of 5. 20 is already a multiple, so it breaks on the first pass.',
        ),
        predictOutput(
          'What does this complete Rust program print?',
          'fn main() {\n    let mut x = 100;\n    let mut count = 0;\n    let steps = loop {\n        if x < 10 {\n            break count;\n        }\n        x /= 2;\n        count += 1;\n    };\n    println!("{} {}", steps, x);\n}',
          ['3 12', '5 3', '4 6.25', '4 6'],
          3,
          'x goes 100, 50, 25, 12, 6; integer division drops the .5 from 25 / 2. After four halvings x is below 10.',
        ),
        choose(
          'Why does this function fail to compile?',
          [
            'A loop cannot be the tail of an i32 function',
            'break has no value, so the loop is not an i32',
            'x must be declared inside the loop body',
            'The if inside the loop needs an else block',
          ],
          1,
          'A plain break gives the loop the value (), but the function promises an i32; it needs break x;.',
          'fn find(n: i32) -> i32 {\n    let mut x = n;\n    loop {\n        if x > 10 {\n            break;\n        }\n        x += 4;\n    }\n}\n\nfn main() {\n    println!("{}", find(1));\n}',
        ),
      ],
    },
    {
      title: 'Skip to the next pass with continue',
      explanation: [
        'continue ends the current pass early and jumps back to the top of the loop. The rest of the body is skipped for that pass only; the loop keeps going.',
        'Update the counter before any continue. If the update sits below the continue, the skipped passes never change it, and the loop can repeat the same value forever.',
      ],
      example: {
        language: 'rust',
        code: 'fn main() {\n    let mut n = 0;\n    loop {\n        n += 1;\n        if n > 6 {\n            break;\n        }\n        if n % 3 == 0 {\n            continue;\n        }\n        println!("{}", n);\n    }\n}',
        output: '1\n2\n4\n5',
        explanation:
          'n is advanced first on every pass. For 3 and 6 the continue skips the println!, and at 7 the break ends the loop.',
      },
      questions: [
        predictOutput(
          'What does this complete Rust program print?',
          'fn main() {\n    let mut i = 0;\n    let mut sum = 0;\n    loop {\n        i += 1;\n        if i > 5 {\n            break;\n        }\n        if i == 2 {\n            continue;\n        }\n        sum += i;\n    }\n    println!("{}", sum);\n}',
          ['15', '13', '1', '8'],
          1,
          'When i is 2 the continue skips the addition, so the sum is 1 + 3 + 4 + 5 = 13.',
        ),
        predictOutput(
          'What does this complete Rust program print?',
          'fn main() {\n    let mut n = 10;\n    loop {\n        n -= 1;\n        if n < 5 {\n            break;\n        }\n        if n % 2 == 1 {\n            continue;\n        }\n        println!("{}", n);\n    }\n}',
          ['8\n6', '9\n7\n5', '8\n6\n4', '10\n8\n6'],
          0,
          'n is decreased before anything else, so the values are 9 to 5. Odd values are skipped, and at 4 the loop breaks before printing.',
        ),
        choose(
          'What happens when this program runs?',
          [
            'It prints 0, 1, 3, then stops',
            'It prints 0, 1, 2, 3, then stops',
            'It prints 0, 1, then stops',
            'It prints 0, 1, then never ends',
          ],
          3,
          'When n is 2 the continue jumps back before n += 1, so n stays 2 and the same pass repeats forever.',
          'fn main() {\n    let mut n = 0;\n    loop {\n        if n == 2 {\n            continue;\n        }\n        if n == 4 {\n            break;\n        }\n        println!("{}", n);\n        n += 1;\n    }\n}',
        ),
        predictOutput(
          'What does this complete Rust program print?',
          'fn main() {\n    let mut x = 0;\n    let mut passes = 0;\n    loop {\n        x += 3;\n        if x > 20 {\n            break;\n        }\n        if x % 2 == 0 {\n            continue;\n        }\n        passes += 1;\n    }\n    println!("{} {}", passes, x);\n}',
          ['3 18', '3 21', '6 21', '4 21'],
          1,
          'x takes the values 3 to 18 in steps of 3; only the odd ones (3, 9, 15) reach passes += 1. The loop breaks when x is 21.',
        ),
      ],
    },
    {
      title: 'Search with loop, continue and break',
      explanation: [
        'Many searches follow one shape: advance a candidate at the top of each pass, continue past candidates that fail a test, and break with the first candidate that passes. The value given to break is the answer.',
      ],
      example: {
        language: 'rust',
        code: 'fn first_multiple_of_both(a: i32, b: i32) -> i32 {\n    let mut n = 0;\n    loop {\n        n += 1;\n        if n % a != 0 {\n            continue;\n        }\n        if n % b == 0 {\n            break n;\n        }\n    }\n}\n\nfn main() {\n    println!("{}", first_multiple_of_both(4, 6));\n}',
        output: '12',
        explanation:
          'Numbers that are not multiples of 4 are skipped. Among 4, 8 and 12, the first that is also a multiple of 6 is 12, so break n returns it.',
      },
      questions: [
        predictOutput(
          'What does this complete Rust program print?',
          'fn collatz_steps(start: i32) -> i32 {\n    let mut n = start;\n    let mut steps = 0;\n    loop {\n        if n == 1 {\n            break steps;\n        }\n        if n % 2 == 0 {\n            n /= 2;\n        } else {\n            n = 3 * n + 1;\n        }\n        steps += 1;\n    }\n}\n\nfn main() {\n    println!("{}", collatz_steps(6));\n}',
          ['9', '16', '8', '7'],
          2,
          'The values are 6, 3, 10, 5, 16, 8, 4, 2, 1: eight changes before n reaches 1.',
        ),
        predictOutput(
          'What does this complete Rust program print?',
          'fn main() {\n    let mut n = 20;\n    let found = loop {\n        n += 1;\n        if n % 2 == 0 {\n            continue;\n        }\n        if n % 3 == 0 {\n            break (n, n / 3);\n        }\n    };\n    println!("{:?}", found);\n}',
          ['(24, 8)', '21 7', '(27, 9)', '(21, 7)'],
          3,
          '21 is odd and divisible by 3, so the loop breaks with the tuple (21, 7), which {:?} prints with parentheses.',
        ),
        predictOutput(
          'What does this complete Rust program print?',
          'fn main() {\n    let mut n = 0;\n    let mut skipped = 0;\n    let hit = loop {\n        n += 7;\n        if n % 5 != 0 {\n            skipped += 1;\n            continue;\n        }\n        break n;\n    };\n    println!("{} {}", hit, skipped);\n}',
          ['35 4', '35 5', '28 4', '70 9'],
          0,
          '7, 14, 21 and 28 are skipped, and 35 is the first multiple of 7 that is also a multiple of 5.',
        ),
        choose(
          'A loop searches for the first n above start that is divisible by 7, using continue to skip other numbers. Where must n += 1 go?',
          [
            'Last in the body, below the continue',
            'First in the body, above the tests',
            'After the loop, once it has ended',
            'Nowhere; loop advances n by itself',
          ],
          1,
          'Advancing first means every pass, including skipped ones, moves to a new candidate. Below the continue it would be skipped and the loop would never end.',
        ),
      ],
    },
  ],
  'rust-while': [
    {
      title: 'Repeat while a condition is true',
      explanation: [
        'while condition { body } tests the condition before every pass. If it is true, the body runs and the test happens again; the first time it is false, the loop ends and the program continues after it.',
        'Because the test comes first, a while loop whose condition starts out false runs its body zero times.',
      ],
      example: {
        language: 'rust',
        code: 'fn main() {\n    let mut n = 1;\n    while n <= 3 {\n        println!("{}", n);\n        n += 1;\n    }\n    println!("done at {}", n);\n}',
        output: '1\n2\n3\ndone at 4',
        explanation:
          'The body runs for 1, 2 and 3. After n becomes 4, the test n <= 3 is false, so the loop ends with n still 4.',
      },
      questions: [
        predictOutput(
          'What does this complete Rust program print?',
          'fn main() {\n    let mut x = 5;\n    while x > 0 {\n        println!("{}", x);\n        x -= 2;\n    }\n}',
          ['5\n3\n1\n-1', '5\n3', '5\n3\n1', '3\n1\n-1'],
          2,
          'x is 5, 3 and 1 when the test passes. Once x is -1, x > 0 is false and nothing more prints.',
        ),
        predictOutput(
          'What does this complete Rust program print?',
          'fn main() {\n    let mut count = 0;\n    let mut n = 8;\n    while n < 5 {\n        count += 1;\n        n += 1;\n    }\n    println!("{} {}", count, n);\n}',
          ['1 9', '0 8', '0 5', '3 5'],
          1,
          '8 < 5 is false at the first test, so the body never runs and both values stay as they were.',
        ),
        predictOutput(
          'What does this complete Rust program print?',
          'fn main() {\n    let mut total = 0;\n    let mut step = 1;\n    while total < 20 {\n        total += step;\n        step *= 2;\n    }\n    println!("{} {}", total, step);\n}',
          ['15 16', '31 16', '20 32', '31 32'],
          3,
          'total goes 1, 3, 7, 15, 31 while step doubles to 32. 15 < 20 allows one more pass, which makes total 31.',
        ),
        choose(
          'Which code prints 10, 20 and 30, each on its own line?',
          [
            'let mut n = 10; while n <= 30 { println!("{}", n); n += 10; }',
            'let mut n = 10; while n < 30 { println!("{}", n); n += 10; }',
            'let mut n = 0; while n <= 30 { println!("{}", n); n += 10; }',
            'let mut n = 10; while n <= 30 { n += 10; println!("{}", n); }',
          ],
          0,
          'It starts at 10, prints before adding, and <= lets 30 through. With < it stops after 20; adding first prints 20, 30, 40.',
        ),
      ],
    },
    {
      title: 'Change the tested value inside the body',
      explanation: [
        'The body must change something the condition reads, so that the condition eventually becomes false. If nothing in the body affects the condition, a condition that starts true stays true and the loop never ends.',
        'Shrinking a value is a common pattern: dividing by 10 removes one digit per pass, and dividing by 2 halves the value, with integer division dropping any remainder.',
      ],
      example: {
        language: 'rust',
        code: 'fn halvings(n: u32) -> u32 {\n    let mut value = n;\n    let mut steps = 0;\n    while value > 1 {\n        value /= 2;\n        steps += 1;\n    }\n    steps\n}\n\nfn main() {\n    println!("{}", halvings(20));\n}',
        output: '4',
        explanation:
          'value goes 20, 10, 5, 2, 1; 5 / 2 is 2 because the remainder is dropped. Four passes bring value down to 1, where value > 1 is false.',
      },
      questions: [
        predictOutput(
          'What does this complete Rust program print?',
          'fn main() {\n    let mut n = 50721;\n    let mut digits = 0;\n    while n > 0 {\n        n /= 10;\n        digits += 1;\n    }\n    println!("{}", digits);\n}',
          ['4', '6', '1', '5'],
          3,
          'Each pass removes one digit: 5072, 507, 50, 5, 0. Five passes bring n to 0.',
        ),
        choose(
          'What happens when this program runs?',
          [
            'It prints 3, 2, 1, then liftoff',
            'It prints 3 forever and never reaches liftoff',
            'It prints 3 once, then liftoff',
            'It prints only liftoff',
          ],
          1,
          'The body never changes n, so n > 0 stays true and the loop repeats forever.',
          'fn main() {\n    let mut n = 3;\n    while n > 0 {\n        println!("{}", n);\n    }\n    println!("liftoff");\n}',
        ),
        predictOutput(
          'What does this complete Rust program print?',
          'fn main() {\n    let mut n = 100;\n    while n >= 10 {\n        n /= 3;\n    }\n    println!("{}", n);\n}',
          ['11', '1', '3', '3.7'],
          2,
          'n goes 100, 33, 11, 3, with each division dropping the remainder. 3 is the first value below 10.',
        ),
        predictOutput(
          'What does this complete Rust program print?',
          'fn main() {\n    let mut n = 9073;\n    let mut sum = 0;\n    while n > 0 {\n        sum += n % 10;\n        n /= 10;\n    }\n    println!("{}", sum);\n}',
          ['19', '4', '16', '3'],
          0,
          'Each pass adds the last digit and then removes it: 3 + 7 + 0 + 9 = 19.',
        ),
      ],
    },
    {
      title: 'Walk an array with an index',
      explanation: [
        'A while loop can visit each element of an array by keeping an index that starts at 0 and grows by one per pass. The condition i < values.len() stops the loop right after the last valid index, len() - 1.',
        'Testing i <= values.len() would run one pass too many and read past the end of the array, which panics. A condition can also join the bound check with another test using &&, so the loop stops at the first element that fails it.',
      ],
      example: {
        language: 'rust',
        code: 'fn total(values: [i32; 4]) -> i32 {\n    let mut sum = 0;\n    let mut i = 0;\n    while i < values.len() {\n        sum += values[i];\n        i += 1;\n    }\n    sum\n}\n\nfn main() {\n    println!("{}", total([3, -1, 4, 10]));\n}',
        output: '16',
        explanation:
          'i takes the indexes 0, 1, 2 and 3, adding 3 - 1 + 4 + 10 = 16. When i reaches 4, i < 4 is false and the loop ends.',
      },
      questions: [
        predictOutput(
          'What does this complete Rust program print?',
          'fn main() {\n    let scores = [7, 2, 9];\n    let mut i = scores.len();\n    while i > 0 {\n        i -= 1;\n        println!("{}", scores[i]);\n    }\n}',
          ['7\n2\n9', '9\n2\n7', '2\n7', '9\n2'],
          1,
          'i starts at 3 and is decreased before each read, so the indexes are 2, 1 and 0: the array backwards.',
        ),
        predictOutput(
          'What does this complete Rust program print?',
          'fn main() {\n    let data = [5, 8, 1, 6, 3];\n    let mut i = 0;\n    let mut sum = 0;\n    while i < data.len() {\n        sum += data[i];\n        i += 2;\n    }\n    println!("{} {}", sum, i);\n}',
          ['14 4', '9 5', '9 6', '23 5'],
          2,
          'i visits 0, 2 and 4, adding 5 + 1 + 3 = 9. The next step makes i 6, which fails i < 5.',
        ),
        choose(
          'What happens when this program runs?',
          [
            'It prints 1, 2, 3, then panics',
            'It prints 1, 2 and 3, then stops',
            'It prints 1 and 2, then stops',
            'It fails to compile because of <=',
          ],
          0,
          'With <= the loop also runs for i = 3, and a[3] is past the end of a 3-element array, so the program panics.',
          'fn main() {\n    let a = [1, 2, 3];\n    let mut i = 0;\n    while i <= a.len() {\n        println!("{}", a[i]);\n        i += 1;\n    }\n}',
        ),
        predictOutput(
          'What does this complete Rust program print?',
          'fn main() {\n    let temps = [12, 15, 21, 18, 25];\n    let mut i = 0;\n    while i < temps.len() && temps[i] < 20 {\n        i += 1;\n    }\n    println!("{}", i);\n}',
          ['3', '21', '1', '2'],
          3,
          '12 and 15 are below 20, so i advances twice. At index 2 the value 21 fails the test, and the loop stops with i = 2.',
        ),
      ],
    },
  ],
  'rust-ranges': [
    {
      title: 'Count through a..b, stopping before b',
      explanation: [
        'for x in a..b runs its body once for each integer from a up to, but not including, b, with x holding each value in turn. The range 1..4 gives 1, 2 and 3.',
        'Because the end is left out, a..b gives b - a values: 0..5 runs five times.',
      ],
      example: {
        language: 'rust',
        code: 'fn main() {\n    for x in 2..5 {\n        println!("{}", x);\n    }\n}',
        output: '2\n3\n4',
        explanation:
          'The range starts at 2 and stops before 5, so x is 2, 3 and 4.',
      },
      questions: [
        predictOutput(
          'What does this complete Rust program print?',
          'fn main() {\n    for n in 0..3 {\n        println!("{}", n);\n    }\n}',
          ['0\n1\n2\n3', '1\n2\n3', '0\n1\n2', '1\n2'],
          2,
          'The range includes its start, 0, and excludes its end, 3.',
        ),
        predictOutput(
          'What does this complete Rust program print?',
          'fn main() {\n    let mut total = 0;\n    for x in 3..7 {\n        total += x;\n    }\n    println!("{}", total);\n}',
          ['25', '18', '22', '15'],
          1,
          'x takes 3, 4, 5 and 6, so total is 18; 7 is not included.',
        ),
        predictOutput(
          'What does this complete Rust program print?',
          'fn main() {\n    let mut count = 0;\n    let mut last = 0;\n    for i in 10..15 {\n        count += 1;\n        last = i;\n    }\n    println!("{}", count);\n    println!("{}", last);\n}',
          ['5\n15', '6\n15', '4\n14', '5\n14'],
          3,
          '10..15 gives 15 - 10 = 5 values, and the last of them is 14.',
        ),
        choose(
          'How many times does the body of for i in 4..20 run?',
          ['16', '15', '17', '20'],
          0,
          'a..b gives b - a values, and 20 - 4 = 16.',
        ),
      ],
    },
    {
      title: 'Include the end with a..=b',
      explanation: [
        'Writing ..= instead of .. makes the range inclusive: a..=b gives every integer from a through b, so b itself is the last value. 1..=4 gives 1, 2, 3 and 4.',
        'Use ..= when the problem states its upper limit as included, such as from 1 to n. The range a..=b gives b - a + 1 values.',
      ],
      example: {
        language: 'rust',
        code: 'fn main() {\n    let mut product = 1;\n    for k in 1..=5 {\n        product *= k;\n    }\n    println!("{}", product);\n}',
        output: '120',
        explanation:
          '1..=5 includes 5, so product is 1 * 2 * 3 * 4 * 5 = 120. With 1..5 it would stop at 4 and give 24.',
      },
      questions: [
        predictOutput(
          'What does this complete Rust program print?',
          'fn main() {\n    for x in 7..=9 {\n        println!("{}", x);\n    }\n}',
          ['7\n8', '8\n9', '7\n8\n9', '7\n8\n9\n10'],
          2,
          '..= includes both ends, so x is 7, 8 and 9.',
        ),
        predictOutput(
          'What does this complete Rust program print?',
          'fn main() {\n    let mut a = 0;\n    for x in 1..5 {\n        a += x;\n    }\n    let mut b = 0;\n    for x in 1..=5 {\n        b += x;\n    }\n    println!("{}", a);\n    println!("{}", b);\n}',
          ['10\n15', '15\n15', '10\n10', '15\n21'],
          0,
          '1..5 stops at 4 (sum 10); 1..=5 also includes 5 (sum 15).',
        ),
        choose(
          'A function must add up the scores for levels 1 through n, including level n. Which loop header is right?',
          [
            'for level in 1..n',
            'for level in 0..n',
            'for level in 2..=n',
            'for level in 1..=n',
          ],
          3,
          'The levels start at 1 and must include n, so the range is inclusive: 1..=n.',
        ),
        predictOutput(
          'What does this complete Rust program print?',
          'fn main() {\n    let mut sum = 0;\n    for x in 2..=4 {\n        sum += x * x;\n    }\n    println!("{}", sum);\n}',
          ['13', '29', '54', '9'],
          1,
          'x is 2, 3 and 4, so sum is 4 + 9 + 16 = 29.',
        ),
      ],
    },
    {
      title: 'Know when a range is empty',
      explanation: [
        'A range only counts upward. When the start equals the end, a..b has no values; when the start is past the end, both a..b and a..=b are empty. The loop body then runs zero times.',
        'An empty range is not an error: the program simply continues after the loop, and any accumulator keeps its starting value. Note that a..=a is not empty; it holds the single value a.',
      ],
      example: {
        language: 'rust',
        code: 'fn sum_between(a: i32, b: i32) -> i32 {\n    let mut total = 0;\n    for x in a..b {\n        total += x;\n    }\n    total\n}\n\nfn main() {\n    println!("{}", sum_between(3, 6));\n    println!("{}", sum_between(6, 6));\n    println!("{}", sum_between(9, 2));\n}',
        output: '12\n0\n0',
        explanation:
          '3..6 gives 3 + 4 + 5 = 12. 6..6 and 9..2 are empty, so total stays 0 in those calls.',
      },
      questions: [
        predictOutput(
          'What does this complete Rust program print?',
          'fn main() {\n    println!("start");\n    for x in 5..2 {\n        println!("{}", x);\n    }\n    println!("end");\n}',
          [
            'start\n5\n4\n3\nend',
            'start\n2\n3\n4\nend',
            'start\nend',
            'start\n5\n4\n3\n2\nend',
          ],
          2,
          'Ranges do not count down. 5..2 is empty, so the body never runs.',
        ),
        predictOutput(
          'What does this complete Rust program print?',
          'fn main() {\n    let mut total = 10;\n    for x in 4..4 {\n        total += x;\n    }\n    for x in 4..=4 {\n        total += x;\n    }\n    println!("{}", total);\n}',
          ['14', '18', '10', '22'],
          0,
          '4..4 is empty, but 4..=4 holds the single value 4, so total becomes 14.',
        ),
        predictOutput(
          'What does this complete Rust program print?',
          'fn product_up_to(n: i32) -> i32 {\n    let mut product = 1;\n    for k in 1..=n {\n        product *= k;\n    }\n    product\n}\n\nfn main() {\n    println!("{}", product_up_to(0));\n    println!("{}", product_up_to(3));\n}',
          ['0\n6', '1\n6', '1\n2', '0\n0'],
          1,
          '1..=0 is empty, so product keeps its starting value 1. 1..=3 gives 1 * 2 * 3 = 6.',
        ),
        choose(
          'For which values does the body of for i in a..b run exactly once?',
          ['a = 3, b = 3', 'a = 4, b = 3', 'a = 3, b = 5', 'a = 3, b = 4'],
          3,
          '3..4 holds just 3. 3..3 and 4..3 are empty, and 3..5 holds two values.',
        ),
      ],
    },
    {
      title: 'Accumulate over a range chosen by the caller',
      explanation: [
        'Range bounds can be any integer expressions, including parameters and arithmetic such as start..start + count. Paired with a mut accumulator updated in the body, this gives functions that add, multiply or count over a range the caller chooses.',
        'When the body only needs to repeat and never reads the value, write for _ in 0..n.',
      ],
      example: {
        language: 'rust',
        code: 'fn sum_odds(count: i32) -> i32 {\n    let mut total = 0;\n    for k in 0..count {\n        total += 2 * k + 1;\n    }\n    total\n}\n\nfn main() {\n    println!("{}", sum_odds(4));\n}',
        output: '16',
        explanation:
          'k runs over 0, 1, 2 and 3, so 2 * k + 1 gives the odd numbers 1, 3, 5 and 7, which add up to 16.',
      },
      questions: [
        predictOutput(
          'What does this complete Rust program print?',
          'fn window_sum(start: i32, len: i32) -> i32 {\n    let mut total = 0;\n    for x in start..start + len {\n        total += x;\n    }\n    total\n}\n\nfn main() {\n    println!("{}", window_sum(5, 3));\n}',
          ['18', '26', '15', '13'],
          0,
          'The range is 5..8, which gives 5, 6 and 7, so the sum is 18.',
        ),
        predictOutput(
          'What does this complete Rust program print?',
          'fn main() {\n    let mut total = 0;\n    for row in 1..=3 {\n        for col in 1..=row {\n            total += col;\n        }\n    }\n    println!("{}", total);\n}',
          ['6', '4', '10', '14'],
          2,
          'The inner range grows with row: 1, then 1 + 2, then 1 + 2 + 3. Together that is 1 + 3 + 6 = 10.',
        ),
        predictOutput(
          'What does this complete Rust program print?',
          'fn power(base: i32, exp: i32) -> i32 {\n    let mut result = 1;\n    for _ in 0..exp {\n        result *= base;\n    }\n    result\n}\n\nfn main() {\n    println!("{}", power(3, 4));\n}',
          ['27', '12', '243', '81'],
          3,
          '0..4 runs four times, multiplying 1 by 3 four times: 3 * 3 * 3 * 3 = 81.',
        ),
        choose(
          'A function should multiply together every integer from lo to hi, including both. Which setup is correct?',
          [
            'let mut p = 0; for x in lo..=hi',
            'let mut p = 1; for x in lo..=hi',
            'let mut p = 1; for x in lo..hi',
            'let mut p = 0; for x in lo..hi',
          ],
          1,
          'A product must start at 1 (starting at 0 keeps it 0), and ..= is needed to include hi.',
        ),
      ],
    },
  ],
  'rust-early-return': [
    {
      title: 'End a function immediately with return',
      explanation: [
        'return value; leaves the function at once and hands value to the caller. Any statements after it in the function do not run for that call.',
        'Without return, a function’s result is its tail expression. return lets a function finish from the middle of its body instead, usually inside an if.',
      ],
      example: {
        language: 'rust',
        code: 'fn discount(price: i32) -> i32 {\n    if price < 10 {\n        return price;\n    }\n    println!("discount applied");\n    price - 5\n}\n\nfn main() {\n    println!("{}", discount(8));\n    println!("{}", discount(30));\n}',
        output: '8\ndiscount applied\n25',
        explanation:
          'For 8 the return ends the function before the println! and the tail expression. For 30 the if is skipped, so the message prints and the tail gives 25.',
      },
      questions: [
        predictOutput(
          'What does this complete Rust program print?',
          'fn step(n: i32) -> i32 {\n    if n > 5 {\n        return 100;\n    }\n    println!("small");\n    n + 1\n}\n\nfn main() {\n    println!("{}", step(9));\n}',
          ['small\n100', '100', '10', 'small\n10'],
          1,
          '9 > 5, so return 100 ends the call before the println! or the tail expression can run.',
        ),
        predictOutput(
          'What does this complete Rust program print?',
          'fn label(code: i32) -> i32 {\n    println!("got {}", code);\n    if code % 2 == 0 {\n        return code / 2;\n    }\n    println!("odd");\n    code * 3\n}\n\nfn main() {\n    println!("{}", label(7));\n    println!("{}", label(4));\n}',
          [
            'got 7\n21\ngot 4\n2',
            'got 7\nodd\n21\ngot 4\nodd\n12',
            'got 7\nodd\n21\ngot 4\n2',
            'got 7\nodd\n21\ngot 4\nodd\n2',
          ],
          2,
          'The first println! runs on every call. 7 is odd, so it prints odd and returns 21; 4 is even, so it returns 2 before odd can print.',
        ),
        choose(
          'A function has return 0; inside an if, and a println! follows that if. On a call where the condition is true, what happens?',
          [
            'The function returns 0; the println! is skipped',
            'The println! runs, then the function returns 0',
            'The function ignores return and uses its tail',
            'The println! runs before the if is tested',
          ],
          0,
          'return ends the function on the spot, so nothing after it runs during that call.',
        ),
        predictOutput(
          'What does this complete Rust program print?',
          'fn adjust(n: i32) -> i32 {\n    let mut value = n * 2;\n    if value > 10 {\n        return value - 10;\n    }\n    value += 1;\n    value\n}\n\nfn main() {\n    println!("{}", adjust(8));\n    println!("{}", adjust(3));\n}',
          ['7\n7', '6\n6', '16\n7', '6\n7'],
          3,
          'adjust(8) doubles to 16 and returns 16 - 10 = 6 without reaching value += 1. adjust(3) doubles to 6, skips the if, and adds 1.',
        ),
      ],
    },
    {
      title: 'Handle the special case first with a guard',
      explanation: [
        'A guard clause checks for a special case at the top of a function and returns early when it applies. The rest of the function then deals only with the normal case and ends with an ordinary tail expression.',
        'The return statement ends with a semicolon, but the final tail expression does not. Adding a semicolon there turns it into a statement, and the function no longer produces its value.',
      ],
      example: {
        language: 'rust',
        code: 'fn per_person(total: i32, people: i32) -> i32 {\n    if people == 0 {\n        return 0;\n    }\n    total / people\n}\n\nfn main() {\n    println!("{}", per_person(50, 4));\n    println!("{}", per_person(50, 0));\n}',
        output: '12\n0',
        explanation:
          '50 / 4 truncates to 12. With 0 people the guard returns 0 before the division, which would otherwise panic.',
      },
      questions: [
        predictOutput(
          'What does this complete Rust program print?',
          'fn cost(items: i32) -> i32 {\n    if items <= 0 {\n        return 0;\n    }\n    5 + items * 3\n}\n\nfn main() {\n    println!("{}", cost(-2));\n    println!("{}", cost(4));\n}',
          ['-1\n17', '0\n12', '5\n17', '0\n17'],
          3,
          '-2 hits the guard and returns 0. 4 passes it, so the tail gives 5 + 12 = 17.',
        ),
        predictOutput(
          'What does this complete Rust program print?',
          'fn split(n: i32) -> (i32, i32) {\n    if n < 10 {\n        return (0, n);\n    }\n    (n / 10, n % 10)\n}\n\nfn main() {\n    println!("{:?}", split(7));\n    println!("{:?}", split(47));\n}',
          [
            '(7, 0)\n(4, 7)',
            '(0, 7)\n(4, 7)',
            '(0, 7)\n(0, 47)',
            '(0, 0)\n(4, 7)',
          ],
          1,
          '7 is a single digit, so the guard returns (0, 7). 47 reaches the tail, which splits it into (4, 7).',
        ),
        choose(
          'Why does this function fail to compile?',
          [
            'return 0; must not end with a semicolon',
            'return and a tail cannot share a function',
            'a / b; is a statement, so no i32 is produced',
            'The if needs an else block to compile',
          ],
          2,
          'The semicolon turns the last line into a statement, so the normal path ends without producing the promised i32.',
          'fn safe_div(a: i32, b: i32) -> i32 {\n    if b == 0 {\n        return 0;\n    }\n    a / b;\n}\n\nfn main() {\n    println!("{}", safe_div(9, 3));\n}',
        ),
        choose(
          'A function returns 100 / n, but must return -1 when n is 0. Which body is correct?',
          [
            'if n == 0 { return -1; } 100 / n',
            'let q = 100 / n; if n == 0 { return -1; } q',
            'if n != 0 { return -1; } 100 / n',
            'if n == 0 { -1; } 100 / n',
          ],
          0,
          'The guard must run before the division. Dividing first panics for 0, != flips the test, and -1; without return does not leave the function.',
        ),
      ],
    },
    {
      title: 'Order several guards',
      explanation: [
        'A function can have several guard clauses in a row. They are checked from top to bottom, and the first one whose condition is true decides the result; the guards below it are never reached for that call.',
        'Put the guard that must win first. A broad check placed above a narrower one hides it, just as in an else if chain.',
      ],
      example: {
        language: 'rust',
        code: 'fn shipping(weight: i32, express: bool) -> i32 {\n    if weight <= 0 {\n        return 0;\n    }\n    if express {\n        return 20;\n    }\n    if weight > 10 {\n        return 15;\n    }\n    5\n}\n\nfn main() {\n    println!("{}", shipping(0, true));\n    println!("{}", shipping(12, true));\n    println!("{}", shipping(12, false));\n    println!("{}", shipping(3, false));\n}',
        output: '0\n20\n15\n5',
        explanation:
          'A weight of 0 stops at the first guard even though express is true. 12 with express stops at the second guard; without express it reaches the third. 3 passes every guard and gets the tail value 5.',
      },
      questions: [
        predictOutput(
          'What does this complete Rust program print?',
          'fn bounded(n: i32) -> i32 {\n    if n > 50 {\n        return 50;\n    }\n    if n < 0 {\n        return 0;\n    }\n    n\n}\n\nfn main() {\n    println!("{}", bounded(70) + bounded(-5) + bounded(20));\n}',
          ['85', '120', '70', '65'],
          2,
          '70 is capped at 50, -5 is raised to 0, and 20 passes both guards: 50 + 0 + 20 = 70.',
        ),
        predictOutput(
          'What does this complete Rust program print?',
          'fn fee(age: i32) -> i32 {\n    if age < 18 {\n        return 5;\n    }\n    if age < 5 {\n        return 0;\n    }\n    12\n}\n\nfn main() {\n    println!("{}", fee(3));\n}',
          ['0', '5', '12', '17'],
          1,
          '3 < 18 is true, so the first guard returns 5; the age < 5 guard below it is never reached.',
        ),
        predictOutput(
          'What does this complete Rust program print?',
          'fn classify(n: i32) -> i32 {\n    if n == 0 {\n        println!("zero");\n        return 0;\n    }\n    if n % 2 == 0 {\n        println!("even");\n        return 2;\n    }\n    println!("odd");\n    1\n}\n\nfn main() {\n    println!("{}", classify(6) + classify(0));\n}',
          [
            'zero\neven\n2',
            'even\nodd\nzero\n3',
            'even\nzero\n0',
            'even\nzero\n2',
          ],
          3,
          'classify(6) runs first: it prints even and returns 2. classify(0) prints zero and returns 0. main then prints 2 + 0.',
        ),
        choose(
          'This function should return 0 for negative scores, 100 for scores above 100, and the score otherwise. What goes wrong?',
          [
            'A score of 150 returns 150',
            'A score of -5 returns 100',
            'A score of 0 returns 100',
            'A score of 50 returns 0',
          ],
          0,
          'Every positive score, including 150, is caught by the first guard, so the score > 100 guard is never reached.',
          'fn grade(score: i32) -> i32 {\n    if score > 0 {\n        return score;\n    }\n    if score < 0 {\n        return 0;\n    }\n    if score > 100 {\n        return 100;\n    }\n    score\n}\n\nfn main() {\n    println!("{}", grade(150));\n}',
        ),
      ],
    },
  ],
  'rust-unit': [
    {
      title: 'Functions without a return type give back ()',
      explanation: [
        'The unit value () means there is no meaningful value to give back; its type is also written (). A function declared without -> returns (), so calling it still produces a value: ().',
        '{} cannot print (), but {:?} can, and it shows ().',
      ],
      example: {
        language: 'rust',
        code: 'fn announce(n: i32) {\n    println!("value {}", n);\n}\n\nfn main() {\n    let result = announce(4);\n    println!("{:?}", result);\n}',
        output: 'value 4\n()',
        explanation:
          'Calling announce prints its line, and the call itself evaluates to (). Storing that in result and printing it with {:?} shows ().',
      },
      questions: [
        predictOutput(
          'What does this complete Rust program print?',
          'fn ping() {\n    println!("ping");\n}\n\nfn main() {\n    let r = ping();\n    println!("{:?}", r);\n    println!("{:?}", (r, 5));\n}',
          [
            'ping\nping\n((), 5)',
            '()\nping\n((), 5)',
            'ping\n()\n((), 5)',
            'ping\n()\n(5)',
          ],
          2,
          'ping runs once, when it is called, and returns (). The tuple holds () and 5, and {:?} shows both.',
        ),
        choose(
          'What type of value does a call to fn log(n: i32) { println!("{}", n); } produce?',
          ['i32', 'bool', 'No value of any type', '()'],
          3,
          'With no -> in its signature, the function returns the unit value, whose type is ().',
        ),
        choose(
          'What happens when this program is compiled?',
          [
            'It prints hi, then an empty line',
            'It fails to compile',
            'It prints hi, then ()',
            'It prints hi twice',
          ],
          1,
          '() has no {} form, so println!("{}", show()) is rejected; {:?} would be needed to print ().',
          'fn show() {\n    println!("hi");\n}\n\nfn main() {\n    println!("{}", show());\n}',
        ),
        predictOutput(
          'What does this complete Rust program print?',
          'fn twice(n: i32) {\n    println!("{}", n * 2);\n}\n\nfn main() {\n    let a = twice(1);\n    let b = twice(2);\n    println!("{:?}", [a, b]);\n}',
          ['2\n4\n[(), ()]', '2\n4\n[2, 4]', '[(), ()]', '2\n4\n[]'],
          0,
          'twice prints its result but returns (), so a and b are both () and the array prints as [(), ()].',
        ),
      ],
    },
    {
      title: 'A semicolon turns an expression into a statement',
      explanation: [
        'A block’s value is its final expression. If that expression ends with a semicolon, it becomes a statement, the block has no final expression, and the block’s value is (). So { 4 + 1 } is 5, but { 4 + 1; } is ().',
        'This is why a function that should return an i32 must not end with a semicolon: its body would produce () instead, and the compiler reports mismatched types.',
      ],
      example: {
        language: 'rust',
        code: 'fn main() {\n    let a = {\n        let x = 3;\n        x * 2\n    };\n    let b = {\n        let x = 3;\n        x * 2;\n    };\n    println!("{:?} {:?}", a, b);\n}',
        output: '6 ()',
        explanation:
          'The first block ends with the expression x * 2, so a is 6. In the second block x * 2; is a statement, so b is ().',
      },
      questions: [
        predictOutput(
          'What does this complete Rust program print?',
          'fn main() {\n    let first = { 10 - 4 };\n    let second = { 10 - 4; };\n    println!("{:?}", (first, second));\n}',
          ['(6, 6)', '(6, ())', '((), 6)', '(6, 0)'],
          1,
          'The first block ends in an expression worth 6. The second ends in a statement, so its value is ().',
        ),
        choose(
          'Why does this function fail to compile?',
          [
            'Multiplication cannot be the last line',
            'The parameter n must be declared mut',
            'The body ends in a statement, so it yields ()',
            'An i32 function needs the word return',
          ],
          2,
          'n * 3; is a statement, so the body’s value is () while the signature promises an i32.',
          'fn triple(n: i32) -> i32 {\n    n * 3;\n}\n\nfn main() {\n    println!("{}", triple(4));\n}',
        ),
        predictOutput(
          'What does this complete Rust program print?',
          'fn main() {\n    let x = 5;\n    let y = {\n        let z = x + 1;\n    };\n    let w = {\n        let z = x + 1;\n        z * z\n    };\n    println!("{:?} {:?}", y, w);\n}',
          ['6 36', '6 ()', '() ()', '() 36'],
          3,
          'A let is a statement, so a block that ends with one has the value (). The second block ends with z * z, which is 36.',
        ),
        choose(
          'Which block has the value 9?',
          [
            '{ let n = 4; n + 5 }',
            '{ 4 + 5; }',
            '{ let n = 9; }',
            '{ let n = 4; n + 5; }',
          ],
          0,
          'Only that block ends in an expression without a semicolon; the others end in statements and are worth ().',
        ),
      ],
    },
    {
      title: 'An assignment changes a binding but evaluates to ()',
      explanation: [
        'An assignment such as value = 7 changes the binding, yet as an expression its own value is (), not 7. The same holds for += and the other compound assignments.',
        'So a block that ends with an assignment statement evaluates to () while still updating the binding. The block’s result and the binding’s new value are two different things, and you can capture both.',
      ],
      example: {
        language: 'rust',
        code: 'fn main() {\n    let mut total = 10;\n    let outcome = {\n        total += 5;\n    };\n    println!("{:?} {}", outcome, total);\n}',
        output: '() 15',
        explanation:
          'The block’s value is () because it ends in a statement, but running it still added 5 to total.',
      },
      questions: [
        predictOutput(
          'What does this complete Rust program print?',
          'fn main() {\n    let mut level = 2;\n    let r = {\n        level *= 4;\n    };\n    println!("{:?}", (r, level));\n}',
          ['(8, 8)', '((), 2)', '((), 8)', '(8, 2)'],
          2,
          'The block evaluates to (), while level *= 4 changes level from 2 to 8.',
        ),
        predictOutput(
          'What does this complete Rust program print?',
          'fn main() {\n    let mut a = 1;\n    let mut b = 1;\n    let r = {\n        a = a + b;\n        b = a + b;\n    };\n    println!("{} {}", a, b);\n    println!("{:?}", r);\n}',
          ['2 2\n()', '2 3\n()', '2 3\n3', '1 1\n()'],
          1,
          'a becomes 2, then b uses the new a and becomes 3. The block itself ends in an assignment statement, so r is ().',
        ),
        predictOutput(
          'What does this complete Rust program print?',
          'fn update(start: i32, extra: i32) -> (i32, ()) {\n    let mut n = start;\n    let u = {\n        n -= extra;\n    };\n    (n, u)\n}\n\nfn main() {\n    println!("{:?}", update(10, 3));\n}',
          ['(10, ())', '((), 7)', '(7, 7)', '(7, ())'],
          3,
          'n is reduced to 7, and u holds the () value of the assignment block. The tuple lists n first.',
        ),
        choose(
          'x starts as let mut x = 1;. After let r = { x = 9; }; runs, what are r and x?',
          [
            'r is () and x is 9',
            'r is 9 and x is 9',
            'r is () and x is 1',
            'r is 9 and x is 1',
          ],
          0,
          'The assignment still changes x to 9, but the block ends in a statement, so r is ().',
        ),
      ],
    },
  ],
  'rust-recursion': [
    {
      title: 'Stop recursion with a base case',
      explanation: [
        'A recursive function calls itself on a smaller input. The base case is an input it answers directly, without another call. Every chain of calls must eventually reach it, and then the results flow back through the calls that are waiting.',
        'Tracing helps: sum_to(3) is 3 + sum_to(2), which is 2 + sum_to(1), and so on down to the base case sum_to(0).',
      ],
      example: {
        language: 'rust',
        code: 'fn sum_to(n: u32) -> u32 {\n    if n == 0 {\n        0\n    } else {\n        n + sum_to(n - 1)\n    }\n}\n\nfn main() {\n    println!("{}", sum_to(4));\n}',
        output: '10',
        explanation:
          'sum_to(4) is 4 + sum_to(3), and so on down to sum_to(0), which returns 0 directly. Adding back up gives 4 + 3 + 2 + 1 + 0 = 10.',
      },
      questions: [
        predictOutput(
          'What does this complete Rust program print?',
          'fn power_of_two(n: u32) -> u32 {\n    if n == 0 {\n        1\n    } else {\n        2 * power_of_two(n - 1)\n    }\n}\n\nfn main() {\n    println!("{}", power_of_two(5));\n}',
          ['10', '16', '32', '64'],
          2,
          'Five calls each multiply by 2, and the base case supplies 1: 2 * 2 * 2 * 2 * 2 * 1 = 32.',
        ),
        predictOutput(
          'What does this complete Rust program print?',
          'fn mystery(n: i32) -> i32 {\n    if n == 0 {\n        0\n    } else {\n        n * mystery(n - 1)\n    }\n}\n\nfn main() {\n    println!("{}", mystery(3));\n}',
          ['6', '0', '3', '9'],
          1,
          'The chain ends at mystery(0), which returns 0, and multiplying anything by 0 gives 0: 3 * 2 * 1 * 0.',
        ),
        predictOutput(
          'What does this complete Rust program print?',
          'fn digit_sum(n: u32) -> u32 {\n    if n < 10 {\n        n\n    } else {\n        n % 10 + digit_sum(n / 10)\n    }\n}\n\nfn main() {\n    println!("{}", digit_sum(4096));\n}',
          ['13', '15', '4', '19'],
          3,
          'Each call peels off the last digit: 6 + 9 + 0, and the base case returns the single digit 4. The total is 19.',
        ),
        choose(
          'Given fn count(n: u32) -> u32 { if n == 0 { 0 } else { 1 + count(n - 1) } }, how many calls to count happen in total when main calls count(3)?',
          ['4', '3', '1', '6'],
          0,
          'The calls are count(3), count(2), count(1) and count(0); the base case is a call too.',
        ),
      ],
    },
    {
      title: 'Shrink the input on every call',
      explanation: [
        'Each recursive call must move the input closer to the base case, for example n - 1 toward 0, or n / 10 toward a single digit. If a call can jump past the base case, or passes the same input again, the calls never stop.',
        'Calls that never stop each hold on to memory while they wait, until the program runs out of stack space and crashes with a stack overflow.',
      ],
      example: {
        language: 'rust',
        code: 'fn halvings(n: u32) -> u32 {\n    if n <= 1 {\n        0\n    } else {\n        1 + halvings(n / 2)\n    }\n}\n\nfn main() {\n    println!("{}", halvings(40));\n}',
        output: '5',
        explanation:
          'The input shrinks 40, 20, 10, 5, 2, 1. Five calls add 1 each before n <= 1 stops the chain.',
      },
      questions: [
        choose(
          'What happens when this program runs?',
          [
            'It prints 2',
            'It crashes with a stack overflow',
            'It prints 3',
            'It fails to compile: odd n never reaches 0',
          ],
          1,
          'From 5 the input goes 3, 1, -1, -3 and so on. It skips 0, so the base case is never reached.',
          'fn down(n: i32) -> i32 {\n    if n == 0 {\n        0\n    } else {\n        1 + down(n - 2)\n    }\n}\n\nfn main() {\n    println!("{}", down(5));\n}',
        ),
        predictOutput(
          'What does this complete Rust program print?',
          'fn steps_to_zero(n: u32) -> u32 {\n    if n == 0 {\n        0\n    } else {\n        1 + steps_to_zero(n / 3)\n    }\n}\n\nfn main() {\n    println!("{}", steps_to_zero(50));\n}',
          ['3', '5', '4', '16'],
          2,
          'Integer division takes 50 to 16, 5, 1 and 0. Four calls add 1 before the base case.',
        ),
        choose(
          'A function count_down(n: u32) has the base case n == 0. Which recursive call reaches that base case for every n?',
          [
            'count_down(n)',
            'count_down(n + 1)',
            'count_down(n * 2)',
            'count_down(n - 1)',
          ],
          3,
          'Subtracting 1 moves n one step toward 0 each time. The others repeat n or move it away from 0.',
        ),
        predictOutput(
          'What does this complete Rust program print?',
          'fn halve_until_small(x: f64) -> f64 {\n    if x < 1.0 {\n        x\n    } else {\n        halve_until_small(x / 2.0)\n    }\n}\n\nfn main() {\n    println!("{}", halve_until_small(12.0));\n}',
          ['0.75', '1.5', '0', '0.375'],
          0,
          'The value goes 12, 6, 3, 1.5, 0.75. Floats keep the fraction, and 0.75 is the first value below 1.',
        ),
      ],
    },
    {
      title: 'Work before or after the recursive call',
      explanation: [
        'Code placed before the recursive call runs on the way down, from the original input toward the base case. Code placed after the call runs on the way back up, only once the deeper calls have finished, so it runs in the reverse order.',
        'Moving one println! from before the call to after it reverses the printed sequence.',
      ],
      example: {
        language: 'rust',
        code: 'fn countdown(n: u32) {\n    if n == 0 {\n        println!("go");\n    } else {\n        println!("{}", n);\n        countdown(n - 1);\n    }\n}\n\nfn main() {\n    countdown(3);\n}',
        output: '3\n2\n1\ngo',
        explanation:
          'Each call prints n before calling deeper, so the numbers appear on the way down, and the base case prints go last.',
      },
      questions: [
        predictOutput(
          'What does this complete Rust program print?',
          'fn count_up(n: u32) {\n    if n > 0 {\n        count_up(n - 1);\n        println!("{}", n);\n    }\n}\n\nfn main() {\n    count_up(3);\n}',
          ['3\n2\n1', '0\n1\n2\n3', '1\n2\n3', '3\n2\n1\n0'],
          2,
          'Each call finishes its deeper call before printing, so count_up(1) prints first. count_up(0) prints nothing.',
        ),
        predictOutput(
          'What does this complete Rust program print?',
          'fn echo(n: u32) {\n    if n == 0 {\n        println!("*");\n    } else {\n        println!("in {}", n);\n        echo(n - 1);\n        println!("out {}", n);\n    }\n}\n\nfn main() {\n    echo(2);\n}',
          [
            'in 2\nin 1\n*\nout 2\nout 1',
            'in 2\nin 1\n*\nout 1\nout 2',
            'in 2\nout 2\nin 1\nout 1\n*',
            'in 1\nin 2\n*\nout 2\nout 1',
          ],
          1,
          'The in lines print on the way down, the base case prints *, and the out lines print on the way back up, innermost call first.',
        ),
        predictOutput(
          'What does this complete Rust program print?',
          'fn print_digits(n: u32) {\n    if n >= 10 {\n        print_digits(n / 10);\n    }\n    println!("{}", n % 10);\n}\n\nfn main() {\n    print_digits(507);\n}',
          ['7\n0\n5', '507', '5\n7', '5\n0\n7'],
          3,
          'The call for 507 first handles 50, which first handles 5. Each prints its last digit after the deeper call returns: 5, then 0, then 7.',
        ),
        choose(
          'A recursive function prints n and then calls itself with n - 1, stopping at 0. If the println! is moved below the recursive call, how does the output change?',
          [
            'The numbers print in reverse order',
            'The output is exactly the same',
            'Only the first number prints',
            'Nothing prints at all',
          ],
          0,
          'After the move, each number prints only once the deeper calls finish, so the smallest prints first.',
        ),
      ],
    },
    {
      title: 'Recurse with several parameters',
      explanation: [
        'A recursive function can take several parameters. Pick the one that measures the remaining work, test it in the base case, and shrink it on every call; the other parameters can stay the same or change along the way.',
        'Euclid’s greatest common divisor follows this pattern: gcd(a, b) calls gcd(b, a % b). Since a % b is always smaller than b, the second argument shrinks until it reaches 0.',
      ],
      example: {
        language: 'rust',
        code: 'fn gcd(a: u32, b: u32) -> u32 {\n    if b == 0 {\n        a\n    } else {\n        gcd(b, a % b)\n    }\n}\n\nfn main() {\n    println!("{}", gcd(48, 18));\n}',
        output: '6',
        explanation:
          'The calls are gcd(48, 18), gcd(18, 12), gcd(12, 6) and gcd(6, 0). The base case b == 0 returns a, which is 6.',
      },
      questions: [
        predictOutput(
          'What does this complete Rust program print?',
          'fn power(base: f64, exp: u32) -> f64 {\n    if exp == 0 {\n        1.0\n    } else {\n        base * power(base, exp - 1)\n    }\n}\n\nfn main() {\n    println!("{:?}", power(0.5, 3));\n    println!("{:?}", power(3.0, 2));\n}',
          ['0.125\n9', '1.5\n6.0', '0.125\n9.0', '0.25\n9.0'],
          2,
          'exp shrinks to 0 while base stays fixed: 0.5 * 0.5 * 0.5 = 0.125 and 3.0 * 3.0 = 9.0. {:?} keeps the .0 on a whole f64.',
        ),
        predictOutput(
          'What does this complete Rust program print?',
          'fn sum_range(lo: u32, hi: u32) -> u32 {\n    if lo > hi {\n        0\n    } else {\n        lo + sum_range(lo + 1, hi)\n    }\n}\n\nfn main() {\n    println!("{}", sum_range(3, 6));\n}',
          ['15', '18', '12', '21'],
          1,
          'lo climbs toward hi, so the gap between them shrinks on every call. Once lo passes hi the base case adds 0: 3 + 4 + 5 + 6 = 18.',
        ),
        predictOutput(
          'What does this complete Rust program print?',
          'fn fib(n: u32) -> u32 {\n    if n < 2 {\n        n\n    } else {\n        fib(n - 1) + fib(n - 2)\n    }\n}\n\nfn main() {\n    println!("{}", fib(7));\n}',
          ['8', '21', '7', '13'],
          3,
          'fib(0) and fib(1) are base cases; every other value is the sum of the two before it: 0, 1, 1, 2, 3, 5, 8, 13.',
        ),
        choose(
          'multiply(a: u32, b: u32) -> u32 should compute a * b by adding a once per recursive call. Which body is correct for every b?',
          [
            'if b == 0 { 0 } else { a + multiply(a, b - 1) }',
            'if b == 0 { 1 } else { a + multiply(a, b - 1) }',
            'if b == 0 { 0 } else { a + multiply(a - 1, b) }',
            'if b == 0 { 0 } else { a + multiply(a, b) }',
          ],
          0,
          'b counts the remaining additions, so it must shrink toward the base case, and that base case must add nothing (0).',
        ),
      ],
    },
  ],
  'rust-moves': [
    {
      title: 'Create and print an owned String',
      explanation: [
        'String::from("text") builds a String: a value that owns its text and is responsible for the memory that holds it. String::new() builds an empty String. A String can be stored in a binding, passed to a function, and returned, like any other value.',
        'Printed with {} a String shows its text as is; printed with {:?} it shows the text in double quotes, the same way the Debug form shows any text.',
      ],
      example: {
        language: 'rust',
        code: 'fn label() -> String {\n    String::from("crate")\n}\n\nfn main() {\n    let name = label();\n    let empty = String::new();\n    println!("{}", name);\n    println!("{:?}", name);\n    println!("{:?}", empty);\n}',
        output: 'crate\n"crate"\n""',
        explanation:
          'label returns an owned String. {} prints the bare text, {:?} adds quotes, and the empty String from String::new() prints as "" in Debug form.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn main() {\n    let city = String::from("Lima");\n    println!("{:?}", city);\n}',
          ['"Lima"', 'Lima', "'Lima'", 'String("Lima")'],
          0,
          'The Debug form of a String is its text in double quotes.',
        ),
        predictOutput(
          'What is printed?',
          'fn greeting(name: String) -> String {\n    format!("hi {}", name)\n}\n\nfn main() {\n    let text = greeting(String::from("Ana"));\n    println!("{}", text);\n}',
          ['"hi Ana"', 'hi Ana', 'hi "Ana"', 'Ana'],
          1,
          'greeting builds a new String with format!, and {} prints it without quotes.',
        ),
        predictOutput(
          'What does this program output?',
          'fn main() {\n    let blank = String::new();\n    let word = String::from("ok");\n    println!("{:?} {:?}", blank, word);\n}',
          ['"ok"', '"" ok', '"" "ok"', '"ok" ""'],
          2,
          'String::new() is empty, and its Debug form is a pair of quotes with nothing between them.',
        ),
        choose(
          'Which expression creates a String that owns the text tea?',
          [
            'String::new("tea")',
            'String("tea")',
            'String::from(tea)',
            'String::from("tea")',
          ],
          3,
          'String::from takes the text in double quotes; String::new takes no argument and makes an empty String.',
        ),
      ],
    },
    {
      title: 'Assignment moves a String to a new owner',
      explanation: [
        'A String has exactly one owner: the binding responsible for freeing its text. let b = a; does not copy the text. It moves ownership to b, and a can no longer be used; the compiler rejects any later use of a as a use of a moved value.',
        'Printing with println! only reads a String, so it does not move it. A move happens when the String itself is assigned, placed in a tuple or array, or passed by value.',
      ],
      example: {
        language: 'rust',
        code: 'fn main() {\n    let first = String::from("book");\n    println!("{}", first);\n    let second = first;\n    println!("{}", second);\n}',
        output: 'book\nbook',
        explanation:
          'first can be printed before the move. After let second = first;, only second owns the text, so the last line reads second.',
      },
      questions: [
        choose(
          'What happens when this program is compiled?',
          [
            'It prints map map',
            'It prints an empty a, then map',
            'It compiles, then panics when it prints a',
            'It fails to compile: a was moved into b',
          ],
          3,
          'After let b = a; the text belongs to b. Reading a afterwards is a use of a moved value, which the compiler rejects.',
          'fn main() {\n    let a = String::from("map");\n    let b = a;\n    println!("{} {}", a, b);\n}',
        ),
        predictOutput(
          'What does this program print?',
          'fn main() {\n    let mut slot = String::from("red");\n    let kept = slot;\n    slot = String::from("blue");\n    println!("{} {}", slot, kept);\n}',
          ['blue red', 'red blue', 'blue blue', 'red red'],
          0,
          'kept takes the text red. Assigning a new String to slot gives it fresh text, blue, so both bindings can be read.',
        ),
        choose(
          'Which line can be added at the end of main and still compile?',
          [
            'println!("{}", owner);',
            'println!("{}", holder);',
            'let again = owner;',
            'println!("{:?}", owner);',
          ],
          1,
          'owner moved into holder, so only holder may be used; every line that touches owner is rejected.',
          'fn main() {\n    let owner = String::from("key");\n    let holder = owner;\n}',
        ),
        choose(
          'What does the compiler say about this program?',
          [
            'It compiles and prints "x"',
            'It compiles and prints ("x", 1)',
            'It fails: a tuple cannot hold a String',
            'It fails: tag was moved into pair',
          ],
          3,
          'Putting tag into the tuple moves the String into pair, so tag cannot be printed afterwards.',
          'fn main() {\n    let tag = String::from("x");\n    let pair = (tag, 1);\n    println!("{:?}", tag);\n}',
        ),
      ],
    },
    {
      title: 'Calls move a String in; returns hand it back',
      explanation: [
        'Passing a String to a parameter of type String moves it into the function, exactly like an assignment. After the call, the caller’s binding can no longer be used.',
        'A function gives ownership back by returning the String. The caller then reads the returned value, not the old binding.',
      ],
      example: {
        language: 'rust',
        code: 'fn pass_along(text: String) -> String {\n    let held = text;\n    held\n}\n\nfn main() {\n    let original = String::from("note");\n    let returned = pass_along(original);\n    println!("{:?}", returned);\n}',
        output: '"note"',
        explanation:
          'original moves into pass_along, moves again into held, and comes back as the return value. main reads returned, which now owns the text.',
      },
      questions: [
        choose(
          'What happens with this program?',
          [
            'It fails to compile: the first call moved s',
            'It prints hi twice',
            'It prints hi once, then stops',
            'It prints hi, then an empty line',
          ],
          0,
          'consume takes the String by value, so the first call moves s; the second call would use a moved value.',
          'fn consume(text: String) {\n    println!("{}", text);\n}\n\nfn main() {\n    let s = String::from("hi");\n    consume(s);\n    consume(s);\n}',
        ),
        predictOutput(
          'What does this program print?',
          'fn mark(text: String, n: i32) -> (String, i32) {\n    (text, n * 2)\n}\n\nfn main() {\n    let result = mark(String::from("lap"), 3);\n    println!("{:?}", result);\n}',
          ['(lap, 6)', '("lap", 6)', '("lap", 3)', '"lap", 6'],
          1,
          'The String moves into mark and back out inside the tuple; Debug shows the tuple with the text quoted.',
        ),
        predictOutput(
          'What is printed?',
          'fn append_tag(text: String) -> String {\n    format!("{}-v2", text)\n}\n\nfn main() {\n    let mut name = String::from("app");\n    name = append_tag(name);\n    println!("{}", name);\n}',
          ['app', 'app-v2-v2', 'app-v2', '"app-v2"'],
          2,
          'name moves into append_tag, and the returned String is assigned back to name, so name owns the new text.',
        ),
        choose(
          'A function takes text: String, and the caller needs the text again after the call. Without changing the parameter type, what should the function do?',
          [
            'Print it, which hands ownership back',
            'Nothing; the caller still owns it',
            'Bind it to a new name inside the function',
            'Return the String so the caller gets it back',
          ],
          3,
          'Only a return moves the String back out; printing reads it, and anything kept inside the function is freed when it ends.',
        ),
      ],
    },
    {
      title: 'Track which binding owns the text',
      explanation: [
        'Follow each String from binding to binding: an assignment, a tuple, or a call moves it, and a return hands it to whatever receives the result. Only the binding that owns the text right now can be read.',
      ],
      example: {
        language: 'rust',
        code: 'fn swap(pair: (String, String)) -> (String, String) {\n    let (left, right) = pair;\n    (right, left)\n}\n\nfn main() {\n    let a = String::from("up");\n    let b = String::from("down");\n    let swapped = swap((a, b));\n    println!("{:?}", swapped);\n}',
        output: '("down", "up")',
        explanation:
          'a and b move into the tuple, the tuple moves into swap, and swap returns the two Strings in the other order. swapped owns both now.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn first_of(pair: (String, String)) -> String {\n    let (head, tail) = pair;\n    head\n}\n\nfn main() {\n    let x = String::from("left");\n    let y = String::from("right");\n    let kept = first_of((y, x));\n    println!("{}", kept);\n}',
          ['left', 'left right', '"right"', 'right'],
          3,
          'The tuple is built as (y, x), so its first element is right; first_of returns that String.',
        ),
        predictOutput(
          'What is the output?',
          'fn tag(text: String) -> String {\n    format!("<{}>", text)\n}\n\nfn main() {\n    let a = String::from("b");\n    let b = tag(a);\n    let c = tag(b);\n    println!("{}", c);\n}',
          ['<b>', '<<<b>>>', '<<b>>', 'b'],
          2,
          'a moves into the first call, whose result b moves into the second call, so the text is wrapped twice.',
        ),
        choose(
          'This program does not compile. Which println! does the compiler reject?',
          [
            'The one that prints t',
            'Both of them',
            'Neither; the error is in keep',
            'The one that prints s',
          ],
          3,
          's moved into keep, and the returned String now belongs to t. Printing t is fine; printing s is not.',
          'fn keep(text: String) -> String {\n    text\n}\n\nfn main() {\n    let s = String::from("ok");\n    let t = keep(s);\n    println!("{}", t);\n    println!("{}", s);\n}',
        ),
        choose(
          'After let pair = (name, 7); where name is a String, how can the program read the text again?',
          [
            'Through name, which still owns it',
            'Through neither; the text was freed',
            'Through pair.0, which now owns it',
            'Through both name and pair.0',
          ],
          2,
          'Building the tuple moved the String into it, so the tuple field is its only owner.',
        ),
      ],
    },
  ],
  'rust-copy': [
    {
      title: 'Assigning an integer copies it',
      explanation: [
        'Simple values such as i32 and bool are Copy: assigning one makes a second, independent value and leaves the source usable. Nothing needs to be freed, so there is no ownership to transfer.',
        'The two bindings do not stay linked. Changing the copy later does not change the original, and changing the original does not change the copy.',
      ],
      example: {
        language: 'rust',
        code: 'fn main() {\n    let a = 5;\n    let mut b = a;\n    b += 10;\n    println!("{} {}", a, b);\n}',
        output: '5 15',
        explanation:
          'b starts as a copy of 5. Adding 10 to b changes only b, and a is still readable because an i32 is copied, not moved.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn main() {\n    let x = 7;\n    let y = x;\n    println!("{}", x + y);\n}',
          ['14', '7', '21', 'Compile error: x was moved'],
          0,
          'Assigning an i32 copies it, so both x and y are 7 and still usable.',
        ),
        predictOutput(
          'What is printed?',
          'fn main() {\n    let mut score = 3;\n    let saved = score;\n    score *= 4;\n    println!("{} {}", saved, score);\n}',
          ['3 12', '12 12', '3 3', '12 3'],
          0,
          'saved holds its own copy of 3, so multiplying score afterwards leaves saved unchanged.',
        ),
        choose(
          'Why can x still be used after let y = x; when x is an i32, but not when x is a String?',
          [
            'An i32 binding is always mutable',
            'An i32 is Copy, so the assignment duplicates it; a String moves',
            'The compiler clones every String automatically',
            'An i32 moves too, but only after its last use',
          ],
          1,
          'Copy types are duplicated on assignment. A String owns memory, so assignment moves it instead.',
        ),
        predictOutput(
          'What does this program output?',
          'fn main() {\n    let ready = true;\n    let mut flag = ready;\n    flag = false;\n    println!("{} {}", ready, flag);\n}',
          ['false false', 'true true', 'false true', 'true false'],
          3,
          'A bool is Copy too. flag got its own copy of true, so setting flag to false leaves ready alone.',
        ),
      ],
    },
    {
      title: 'Passing an integer copies it into the function',
      explanation: [
        'Calling a function with an i32 argument hands the function a copy. The caller’s binding keeps its value and stays usable after the call, however many times it is passed.',
        'Inside the function, changing a local made from the parameter cannot reach back to the caller’s variable.',
      ],
      example: {
        language: 'rust',
        code: 'fn doubled(n: i32) -> i32 {\n    let mut m = n;\n    m *= 2;\n    m\n}\n\nfn main() {\n    let start = 6;\n    let result = doubled(start);\n    println!("{} {}", start, result);\n}',
        output: '6 12',
        explanation:
          'doubled works on its own copy of 6. It returns 12, and start is still 6 in main.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn bump(n: i32) -> i32 {\n    n + 1\n}\n\nfn main() {\n    let count = 9;\n    let a = bump(count);\n    let b = bump(count);\n    println!("{} {} {}", count, a, b);\n}',
          ['9 10 10', '9 10 11', '10 10 10', '11 10 11'],
          0,
          'Each call gets its own copy of 9 and returns 10; count itself never changes.',
        ),
        predictOutput(
          'What is printed?',
          'fn reset(value: i32) -> i32 {\n    let mut v = value;\n    v = 0;\n    v\n}\n\nfn main() {\n    let level = 4;\n    let cleared = reset(level);\n    println!("{} {}", level, cleared);\n}',
          ['0 0', '4 0', '4 4', '0 4'],
          1,
          'reset changes only its local copy; level in main keeps 4.',
        ),
        predictOutput(
          'What does this program output?',
          'fn square(n: i32) -> i32 {\n    n * n\n}\n\nfn main() {\n    let side = 3;\n    let area = square(side);\n    let again = square(side);\n    println!("{}", area + again);\n}',
          ['9', 'Compile error: side was moved', '81', '18'],
          3,
          'side is copied into each call, so both calls return 9 and the sum is 18.',
        ),
        choose(
          'A function has the parameter n: i32. The caller passes total and wants to print total afterwards. What must the caller do?',
          [
            'Nothing; total is copied into the call',
            'Return total from the function',
            'Declare total with let mut',
            'Assign total to a spare binding before the call',
          ],
          0,
          'An i32 argument is copied, so the caller keeps total without any extra step.',
        ),
      ],
    },
    {
      title: 'Tuples and arrays of Copy values copy too',
      explanation: [
        'A tuple or array is Copy when every element is Copy. let b = a; with a: [i32; 3] duplicates all three numbers, so changing b[0] leaves a alone.',
        'A tuple that holds a String is not Copy: assigning it moves the whole tuple, and the old binding can no longer be used.',
      ],
      example: {
        language: 'rust',
        code: 'fn main() {\n    let a = [1, 2, 3];\n    let mut b = a;\n    b[0] = 9;\n    println!("{:?} {:?}", a, b);\n}',
        output: '[1, 2, 3] [9, 2, 3]',
        explanation:
          'b is a full copy of the array. Changing its first element does not affect a, and a is still usable.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn main() {\n    let point = (2, 5);\n    let mut shifted = point;\n    shifted.0 = 8;\n    println!("{:?} {:?}", point, shifted);\n}',
          ['(8, 5) (8, 5)', '(2, 5) (2, 5)', '(8, 5) (2, 5)', '(2, 5) (8, 5)'],
          3,
          'A tuple of two i32 values is Copy, so shifted is a separate tuple; only its first field changes.',
        ),
        choose(
          'What happens when this program is compiled?',
          [
            'It prints ("id", 4)',
            'It fails: entry was moved into other',
            'It prints ("", 4)',
            'It fails: other must be declared mut',
          ],
          1,
          'The tuple contains a String, so it is not Copy. Assigning it moves it into other, and entry cannot be printed.',
          'fn main() {\n    let entry = (String::from("id"), 4);\n    let other = entry;\n    println!("{:?}", entry);\n}',
        ),
        predictOutput(
          'What is printed?',
          'fn total(values: [i32; 3]) -> i32 {\n    values[0] + values[1] + values[2]\n}\n\nfn main() {\n    let nums = [4, 5, 6];\n    let sum = total(nums);\n    println!("{} {:?}", sum, nums);\n}',
          [
            '15 []',
            'Compile error: nums was moved',
            '6 [4, 5, 6]',
            '15 [4, 5, 6]',
          ],
          3,
          'An array of i32 is Copy, so total receives a copy and nums is still available to print.',
        ),
        choose(
          'In which case is a still usable after let b = a; ?',
          [
            'a has type String',
            'a has type (String, i32)',
            'a has type (i32, bool)',
            'a has type [String; 2]',
          ],
          2,
          'Only a tuple made entirely of Copy values is Copy; anything containing a String moves.',
        ),
      ],
    },
  ],
  'rust-clone': [
    {
      title: 'Clone a String to get a second owner',
      explanation: [
        '.clone() copies a String’s text into a brand-new String. The original keeps its text and stays usable, and the clone has its own, separate owner.',
        'Cloning is written out because it costs work: the text is copied into fresh memory. Rust never clones a String for you.',
      ],
      example: {
        language: 'rust',
        code: 'fn main() {\n    let original = String::from("plan");\n    let backup = original.clone();\n    println!("{} {}", original, backup);\n}',
        output: 'plan plan',
        explanation:
          'backup owns its own copy of the text, so original was not moved and both can be printed.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn main() {\n    let a = String::from("ink");\n    let b = a.clone();\n    let c = b.clone();\n    println!("{:?}", (a, b, c));\n}',
          [
            '("ink", "", "")',
            '("ink", "ink")',
            '(ink, ink, ink)',
            '("ink", "ink", "ink")',
          ],
          3,
          'Each clone copies the same text, so the tuple holds three equal Strings.',
        ),
        choose(
          'What happens when this program is compiled?',
          [
            'It fails: first was moved before it was cloned',
            'It prints go go',
            'It prints go and an empty string',
            'It prints go go go',
          ],
          0,
          'let second = first; moves the String, so first can no longer be cloned. Clone before the move, not after.',
          'fn main() {\n    let first = String::from("go");\n    let second = first;\n    let third = first.clone();\n    println!("{} {}", second, third);\n}',
        ),
        choose(
          'name is a String. Which line leaves name usable afterwards?',
          [
            'let copy = name;',
            'let copy = name.clone();',
            'let copy = (name, 1);',
            'let copy = [name];',
          ],
          1,
          'Only clone makes a new String; the other lines move name into copy.',
        ),
        choose(
          'After let b = a.clone(); where a is a String, which statement is true?',
          [
            'b borrows the text that a owns',
            'b owns a separate copy of the text',
            'a has moved into b',
            'a and b share one copy of the text',
          ],
          1,
          'clone allocates a new String with equal contents; a keeps its own.',
        ),
      ],
    },
    {
      title: 'Change a clone with push_str',
      explanation: [
        'push_str appends text to the end of a String. The String must be in a let mut binding, because appending changes it.',
        'A clone is independent: appending to the clone leaves the original exactly as it was, and appending to the original leaves the clone alone.',
      ],
      example: {
        language: 'rust',
        code: 'fn main() {\n    let base = String::from("hi");\n    let mut copy = base.clone();\n    copy.push_str(" there");\n    println!("{:?} {:?}", base, copy);\n}',
        output: '"hi" "hi there"',
        explanation:
          'Only copy is changed. base still owns its original text, hi.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn main() {\n    let mut a = String::from("ab");\n    let b = a.clone();\n    a.push_str("cd");\n    println!("{} {}", a, b);\n}',
          ['abcd abcd', 'abcd ab', 'ab abcd', 'ab ab'],
          1,
          'b was cloned before the push, and the push changes only a.',
        ),
        predictOutput(
          'What is printed?',
          'fn main() {\n    let mut log = String::from("a");\n    log.push_str("b");\n    let snapshot = log.clone();\n    log.push_str("c");\n    println!("{} {}", snapshot, log);\n}',
          ['ab abc', 'abc abc', 'a abc', 'ab ab'],
          0,
          'The clone captures the text at that moment, ab; the later push changes only log.',
        ),
        choose(
          'Why does this program fail to compile?',
          [
            'push_str can only add one character',
            'push_str needs a String in a let mut binding',
            'text must be cloned before push_str',
            'A String made with String::from cannot grow',
          ],
          1,
          'Appending changes the String, so its binding must be declared let mut.',
          'fn main() {\n    let text = String::from("tea");\n    text.push_str("pot");\n    println!("{}", text);\n}',
        ),
        predictOutput(
          'What does this program output?',
          'fn main() {\n    let word = String::from("red");\n    let mut first = word.clone();\n    let mut second = word.clone();\n    first.push_str("dish");\n    second.push_str("wood");\n    println!("{} {} {}", word, first, second);\n}',
          [
            'reddishwood reddish redwood',
            'red reddish redwood',
            'red reddishwood redwood',
            'reddish reddish redwood',
          ],
          1,
          'Each clone is its own String, so each push changes only that clone and word stays red.',
        ),
      ],
    },
    {
      title: 'Clone before a move to keep the original',
      explanation: [
        'When a function takes a String by value but you still need the text, pass a clone: the clone moves into the call and the original stays with you.',
        'Clone only when two independent Strings are really needed. When one owner is enough, moving costs nothing.',
      ],
      example: {
        language: 'rust',
        code: 'fn decorate(text: String) -> String {\n    let mut out = text;\n    out.push_str("*");\n    out\n}\n\nfn main() {\n    let title = String::from("menu");\n    let fancy = decorate(title.clone());\n    println!("{} {}", title, fancy);\n}',
        output: 'menu menu*',
        explanation:
          'The clone moves into decorate and comes back with a star. title was never moved, so it still prints menu.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn shout(text: String) -> String {\n    format!("{}!", text)\n}\n\nfn main() {\n    let word = String::from("hey");\n    let loud = shout(word.clone());\n    println!("{} {}", word, loud);\n}',
          ['hey hey!', 'hey! hey!', 'hey hey', 'hey! hey'],
          0,
          'shout received a clone, so word still holds hey and loud holds the new text.',
        ),
        predictOutput(
          'What is printed?',
          'fn versions(text: String) -> (String, String) {\n    let mut edited = text.clone();\n    edited.push_str("2");\n    (edited, text)\n}\n\nfn main() {\n    println!("{:?}", versions(String::from("v")));\n}',
          ['("v", "v2")', '("v2", "v2")', '("v", "v")', '("v2", "v")'],
          3,
          'edited is a changed clone and comes first in the tuple; text keeps v and comes second.',
        ),
        choose(
          'This program fails to compile. Which change makes it print buy milk buy milk?',
          [
            'Declare note with let mut',
            'Call store(note.clone()) instead of store(note)',
            'Clone note after the call to store',
            'Change the parameter of store to i32',
          ],
          1,
          'Passing a clone moves the copy into store, so note is still owned by main when it is printed.',
          'fn store(text: String) -> String {\n    text\n}\n\nfn main() {\n    let note = String::from("buy milk");\n    let kept = store(note);\n    println!("{} {}", note, kept);\n}',
        ),
        choose(
          'A function returns a changed version of a String, and the caller never uses the original again. What should the caller do?',
          [
            'Clone it first so both versions exist',
            'Clone it twice to be safe',
            'Move the String into the function',
            'Clone the result after it comes back',
          ],
          2,
          'No one needs the original afterwards, so a move is enough and a clone would copy the text for nothing.',
        ),
      ],
    },
  ],
  'rust-drop': [
    {
      title: 'Release a String early with drop',
      explanation: [
        'drop(value) takes ownership of a value and frees it right away, before the end of the function. It is the function std::mem::drop, and it can be called without the std::mem:: prefix.',
        'drop takes its argument by value, so the String moves into it. Using the binding afterwards is a use of a moved value, which the compiler rejects.',
      ],
      example: {
        language: 'rust',
        code: 'fn main() {\n    let cache = String::from("big data");\n    let summary = String::from("3 rows");\n    drop(cache);\n    println!("{}", summary);\n}',
        output: '3 rows',
        explanation:
          'cache is freed by drop as soon as that line runs. summary is a different String, so it can still be printed.',
      },
      questions: [
        choose(
          'What happens when this program is compiled?',
          [
            'It fails: temp was moved into drop',
            'It prints scratch',
            'It prints an empty line',
            'It compiles, then panics when temp is printed',
          ],
          0,
          'drop takes ownership of temp, so the later println! uses a moved value and the program does not compile.',
          'fn main() {\n    let temp = String::from("scratch");\n    drop(temp);\n    println!("{}", temp);\n}',
        ),
        predictOutput(
          'What does this program print?',
          'fn main() {\n    let mut current = String::from("v1");\n    drop(current);\n    current = String::from("v2");\n    println!("{}", current);\n}',
          ['v1', 'v1v2', 'Compile error: current was dropped', 'v2'],
          3,
          'After drop, current holds nothing usable, but assigning a new String gives it fresh text that may be read.',
        ),
        predictOutput(
          'What is printed?',
          'fn main() {\n    let a = String::from("left");\n    let b = String::from("right");\n    drop(b);\n    let c = a;\n    println!("{}", c);\n}',
          ['right', 'left right', 'Compile error: a was moved', 'left'],
          3,
          'Only b was dropped. a moved into c, and c is what gets printed.',
        ),
        choose(
          'Which statement frees the String in report before main ends?',
          [
            'report.drop();',
            'std::mem::free(report);',
            'drop(report);',
            'report = drop;',
          ],
          2,
          'drop is an ordinary function that takes the value by argument; there is no drop method or free function to call.',
        ),
      ],
    },
    {
      title: 'Each String is freed once, by its last owner',
      explanation: [
        'Without drop, a String is freed automatically when the binding that owns it goes away, such as when its function ends. If the String was moved, its new owner frees it instead; the old binding frees nothing.',
        'This is why a String has exactly one owner at a time: its text is freed exactly once. Passing a String by value to any function, drop included, makes that function the place where it is freed.',
      ],
      example: {
        language: 'rust',
        code: 'fn finish(text: String) -> i32 {\n    println!("using {}", text);\n    1\n}\n\nfn main() {\n    let job = String::from("build");\n    let status = finish(job);\n    println!("status {}", status);\n}',
        output: 'using build\nstatus 1',
        explanation:
          'job moves into finish, so finish owns the text and frees it when it returns. main has only the integer status left.',
      },
      questions: [
        choose(
          'When is the text of note freed?',
          [
            'When take returns',
            'At the end of main',
            'Twice: in take and at the end of main',
            'Never; the program leaks it',
          ],
          0,
          'note moved into take, so take’s parameter is the owner and frees the text when take returns.',
          'fn take(text: String) {\n    println!("{}", text);\n}\n\nfn main() {\n    let note = String::from("hi");\n    take(note);\n    println!("back in main");\n}',
        ),
        choose(
          'A String is moved from a to b, and then main ends. How many times is its text freed?',
          ['Once, by a', 'Once, by b', 'Twice, once per binding', 'Zero times'],
          1,
          'After the move only b owns the text, so only b frees it.',
        ),
        predictOutput(
          'What does this program print?',
          'fn release(text: String) {\n    println!("freeing {}", text);\n}\n\nfn main() {\n    let a = String::from("a");\n    let b = String::from("b");\n    release(b);\n    println!("still have {}", a);\n    release(a);\n}',
          [
            'still have a\nfreeing a\nfreeing b',
            'freeing a\nfreeing b\nstill have a',
            'freeing b\nstill have a\nfreeing a',
            'freeing b\nstill have a',
          ],
          2,
          'Each String is released inside release when it is passed in, in the order main makes the calls.',
        ),
        choose(
          'Which binding frees the text at the end of main?',
          ['s', 'The text parameter of pass', 'Both s and t', 't'],
          3,
          's moved into pass, and pass returned the String to t, so t is the owner when main ends.',
          'fn pass(text: String) -> String {\n    text\n}\n\nfn main() {\n    let s = String::from("keep");\n    let t = pass(s);\n    println!("{}", t);\n}',
        ),
      ],
    },
    {
      title: 'Drop the old value and return the new one',
      explanation: [
        'A common pattern: drop the String you no longer need, then keep or return the one you do. After drop, only the other binding may be read, so return the replacement, never the dropped value.',
      ],
      example: {
        language: 'rust',
        code: 'fn swap_out(old: String, new: String) -> String {\n    drop(old);\n    new\n}\n\nfn main() {\n    let current = swap_out(String::from("draft"), String::from("final"));\n    println!("{:?}", current);\n}',
        output: '"final"',
        explanation:
          'old is freed inside swap_out, and new moves out as the return value, so main ends up owning final.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn keep_second(a: String, b: String) -> String {\n    drop(a);\n    b\n}\n\nfn main() {\n    let x = String::from("cat");\n    let y = String::from("dog");\n    println!("{}", keep_second(y, x));\n}',
          ['dog', 'catdog', 'cat', 'dogcat'],
          2,
          'The call passes y first, so dog is dropped and the second argument, cat, is returned.',
        ),
        choose(
          'What is wrong with this function?',
          [
            'drop must be written std::mem::drop',
            'It returns b after b was moved into drop',
            'a has to be dropped as well',
            'Nothing; it returns an empty String',
          ],
          1,
          'drop(b) takes ownership of b, so returning b afterwards uses a moved value. It should drop a and return b, or the other way round.',
          'fn pick(a: String, b: String) -> String {\n    drop(b);\n    b\n}',
        ),
        predictOutput(
          'What is printed?',
          'fn refresh(old: String) -> String {\n    drop(old);\n    String::from("fresh")\n}\n\nfn main() {\n    let mut data = String::from("stale");\n    data = refresh(data);\n    println!("{:?}", data);\n}',
          ['"fresh"', '"stale"', '"stalefresh"', '""'],
          0,
          'The old text is dropped inside refresh, and the new String it returns is assigned back to data.',
        ),
        predictOutput(
          'What does this program output?',
          'fn tidy(first: String, second: String) -> (String, i32) {\n    drop(first);\n    (second, 2)\n}\n\nfn main() {\n    let result = tidy(String::from("old"), String::from("new"));\n    println!("{:?}", result);\n}',
          ['("old", 2)', '("new", 2)', '("oldnew", 2)', '(new, 2)'],
          1,
          'first (old) is dropped; second (new) moves into the returned tuple, which Debug prints with quotes.',
        ),
      ],
    },
  ],
  'rust-shared-borrow': [
    {
      title: 'Lend a String with &',
      explanation: [
        '&name creates a shared reference: a way to read name without taking ownership. A parameter of type &String accepts such a reference, and the caller’s binding stays the owner.',
        'Because nothing moves, the caller can lend the same String again, or keep using it after the call.',
      ],
      example: {
        language: 'rust',
        code: 'fn show(text: &String) {\n    println!("[{}]", text);\n}\n\nfn main() {\n    let word = String::from("lend");\n    show(&word);\n    show(&word);\n    println!("{}", word);\n}',
        output: '[lend]\n[lend]\nlend',
        explanation:
          'Each call borrows word for the length of the call. Ownership never leaves main, so word can be lent twice and then printed.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn describe(text: &String) -> String {\n    format!("<{}>", text)\n}\n\nfn main() {\n    let tag = String::from("div");\n    let a = describe(&tag);\n    println!("{} {}", a, tag);\n}',
          [
            '<div> <div>',
            'div div',
            'Compile error: tag was moved',
            '<div> div',
          ],
          3,
          'describe only borrows tag and builds a new String, so tag is unchanged and still owned by main.',
        ),
        choose(
          'This program fails to compile. Which change lets main call peek twice without cloning?',
          [
            'Declare s with let mut',
            'Return text from peek and ignore the result',
            'Print s once before the first call',
            'Make the parameter text: &String and call peek(&s)',
          ],
          3,
          'A &String parameter only borrows, so s stays with main and can be lent again.',
          'fn peek(text: String) {\n    println!("{}", text);\n}\n\nfn main() {\n    let s = String::from("look");\n    peek(s);\n    peek(s);\n}',
        ),
        choose(
          'What does a function with the parameter text: &String own?',
          [
            'Nothing; it only borrows the caller’s String',
            'The String, until the function returns',
            'A fresh copy of the text',
            'The String, which it frees on return',
          ],
          0,
          'A shared reference lends access for reading; ownership, and the job of freeing the text, stay with the caller.',
        ),
        predictOutput(
          'What is printed?',
          'fn main() {\n    let base = String::from("id");\n    let r1 = &base;\n    let r2 = &base;\n    println!("{} {} {}", r1, r2, base);\n}',
          [
            'id',
            'Compile error: base is borrowed twice',
            '&id &id id',
            'id id id',
          ],
          3,
          'Any number of shared references may read a value at once, and printing through a reference shows the text itself.',
        ),
      ],
    },
    {
      title: 'Read length and emptiness through a reference',
      explanation: [
        '.len() gives a String’s length in bytes as a usize; for plain English letters, digits, spaces, and punctuation that is one per character. .is_empty() is true exactly when the length is 0.',
        'Both methods only read, so they work directly on a &String: text.len() is written the same way whether text is a String or a reference to one.',
      ],
      example: {
        language: 'rust',
        code: 'fn stats(text: &String) -> (usize, bool) {\n    (text.len(), text.is_empty())\n}\n\nfn main() {\n    let full = String::from("hello world");\n    let blank = String::new();\n    println!("{:?} {:?}", stats(&full), stats(&blank));\n}',
        output: '(11, false) (0, true)',
        explanation:
          'hello world has 11 characters including the space, so it is not empty. The new String has length 0, so is_empty is true.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn size(text: &String) -> usize {\n    text.len()\n}\n\nfn main() {\n    let s = String::from("a b c");\n    println!("{}", size(&s));\n}',
          ['3', '6', '5', '4'],
          2,
          'The two spaces count too: a, space, b, space, c is 5 characters.',
        ),
        predictOutput(
          'What is printed?',
          'fn main() {\n    let a = String::new();\n    let b = String::from(" ");\n    println!("{} {}", a.is_empty(), b.is_empty());\n}',
          ['true true', 'false false', 'true false', 'false true'],
          2,
          'A single space is still one character, so only the String from String::new() is empty.',
        ),
        predictOutput(
          'What does this program output?',
          'fn combined(a: &String, b: &String) -> usize {\n    a.len() + b.len()\n}\n\nfn main() {\n    let first = String::from("rust");\n    let second = String::from("acean");\n    println!("{}", combined(&first, &second));\n}',
          ['2', '8', '9', '10'],
          2,
          'rust has 4 characters and acean has 5, so the sum is 9.',
        ),
        choose(
          'For let s = String::from("  "); (two spaces), what do s.len() and s.is_empty() return?',
          ['0 and true', '2 and false', '2 and true', '0 and false'],
          1,
          'Spaces are characters like any other, so the length is 2 and the String is not empty.',
        ),
      ],
    },
    {
      title: 'Borrow any value with &T',
      explanation: [
        'References work for every type, not just String. A function taking &[i32; 3] or &(i32, i32) reads the caller’s array or tuple where it is; indexing and .0 work through the reference.',
        'A shared reference only reads. The owner keeps the value and can still use it, or move it away, after the call returns.',
      ],
      example: {
        language: 'rust',
        code: 'fn spread(values: &[i32; 3]) -> i32 {\n    values[2] - values[0]\n}\n\nfn main() {\n    let readings = [4, 9, 15];\n    println!("{} {:?}", spread(&readings), readings);\n}',
        output: '11 [4, 9, 15]',
        explanation:
          'spread indexes through the reference: 15 - 4 is 11. The array still belongs to main, which prints it afterwards.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn flipped(pair: &(i32, i32)) -> (i32, i32) {\n    (pair.1, pair.0)\n}\n\nfn main() {\n    let p = (3, 8);\n    println!("{:?} {:?}", flipped(&p), p);\n}',
          ['(8, 3) (8, 3)', '(3, 8) (3, 8)', '(8, 3) (3, 8)', '(3, 8) (8, 3)'],
          2,
          'flipped builds a new tuple from the fields it reads; the borrowed tuple p is unchanged.',
        ),
        predictOutput(
          'What is printed?',
          'fn total(values: &[i32; 4]) -> i32 {\n    values[0] + values[1] + values[2] + values[3]\n}\n\nfn main() {\n    let costs = [5, 10, 20, 1];\n    let a = total(&costs);\n    let b = total(&costs);\n    println!("{}", a + b);\n}',
          ['36', '35', '72', '70'],
          2,
          'Each call reads the same array and returns 36, so the two results add to 72.',
        ),
        predictOutput(
          'What does this program output?',
          'fn label(entry: &(String, i32)) -> String {\n    format!("{}#{}", entry.0, entry.1)\n}\n\nfn main() {\n    let item = (String::from("bolt"), 12);\n    println!("{}", label(&item));\n    let moved = item;\n    println!("{:?}", moved);\n}',
          [
            'bolt#12\n("bolt", 12)',
            'bolt#12',
            '"bolt"#12\n("bolt", 12)',
            'bolt#12\n(bolt, 12)',
          ],
          0,
          'label only borrows item, so main still owns it and can move it into moved, which Debug prints with quotes.',
        ),
        choose(
          'Which parameter type lets a function read a String while the caller keeps it?',
          [
            'text: &String',
            'text: String',
            'text: (String, i32)',
            'text: [String; 1]',
          ],
          0,
          'Only the reference borrows; the other types take the String by value and move it.',
        ),
      ],
    },
    {
      title: 'Borrow to inspect, then move when done',
      explanation: [
        'Lend a String with & as many times as needed to read it, and move it only at the end, when another owner should take over. Reading through a reference never changes what the owner holds.',
      ],
      example: {
        language: 'rust',
        code: 'fn summary(text: &String) -> (usize, bool) {\n    (text.len(), text.is_empty())\n}\n\nfn archive(text: String) -> String {\n    format!("archived: {}", text)\n}\n\nfn main() {\n    let doc = String::from("draft");\n    let info = summary(&doc);\n    let stored = archive(doc);\n    println!("{:?} {}", info, stored);\n}',
        output: '(5, false) archived: draft',
        explanation:
          'summary borrows doc to measure it. Only afterwards does archive take ownership, so both calls are allowed.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn width(text: &String) -> usize {\n    text.len()\n}\n\nfn take(text: String) -> String {\n    text\n}\n\nfn main() {\n    let s = String::from("panel");\n    let before = width(&s);\n    let owner = take(s);\n    let after = width(&owner);\n    println!("{} {}", before, after);\n}',
          ['5 5', '5 0', '0 5', '6 6'],
          0,
          'Moving a String does not change its text; owner holds the same five characters that s did.',
        ),
        choose(
          'Why is this program rejected?',
          [
            's was moved into take, so it cannot be borrowed afterwards',
            'width cannot be called with &s',
            'take must return &String',
            'A String cannot be both borrowed and moved in one program',
          ],
          0,
          'The move happens first. After it, s no longer owns anything, so &s is a borrow of a moved value.',
          'fn width(text: &String) -> usize {\n    text.len()\n}\n\nfn take(text: String) -> String {\n    text\n}\n\nfn main() {\n    let s = String::from("panel");\n    let owner = take(s);\n    println!("{}", width(&s));\n}',
        ),
        predictOutput(
          'What is printed?',
          'fn is_blank(text: &String) -> bool {\n    text.is_empty()\n}\n\nfn main() {\n    let a = String::new();\n    let b = String::from("x");\n    println!("{:?}", (is_blank(&a), is_blank(&b), a.len() + b.len()));\n}',
          [
            '(true, false, 1)',
            '(false, true, 1)',
            '(true, false, 2)',
            '(true, true, 1)',
          ],
          0,
          'a is empty and b holds one character; borrowing them leaves both usable for the lengths.',
        ),
        choose(
          'A function counts the characters in a String, and the caller keeps using the String afterwards. Which signature fits?',
          [
            'fn count(text: &String) -> usize',
            'fn count(text: String) -> usize',
            'fn count(text: String) -> String',
            'fn count(text: &String) -> String',
          ],
          0,
          'Counting only reads, so a shared reference in and a usize out is enough; taking String would move the caller’s value.',
        ),
      ],
    },
  ],
  'rust-mutable-borrow': [
    {
      title: 'Change a caller’s integer through &mut',
      explanation: [
        '&mut n lends n so that the borrower may change it. The parameter type is &mut i32, the caller’s binding must be declared let mut, and the function reaches the number behind the reference with *: *value += 1 changes the caller’s n.',
        'Without the *, value is the reference itself, not the number. *value also reads the number, for example let old = *value;.',
      ],
      example: {
        language: 'rust',
        code: 'fn add_bonus(score: &mut i32) {\n    *score += 10;\n}\n\nfn main() {\n    let mut points = 5;\n    add_bonus(&mut points);\n    add_bonus(&mut points);\n    println!("{}", points);\n}',
        output: '25',
        explanation:
          'Each call adds 10 to the caller’s points through the reference: 5, then 15, then 25.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn triple(n: &mut i32) {\n    *n *= 3;\n}\n\nfn main() {\n    let mut x = 2;\n    triple(&mut x);\n    println!("{}", x);\n}',
          ['2', '8', '18', '6'],
          3,
          'triple multiplies the caller’s x through the reference, so x becomes 6.',
        ),
        predictOutput(
          'What is printed?',
          'fn reset_ref(n: &mut i32) {\n    *n = 0;\n}\n\nfn reset_copy(n: i32) {\n    let mut local = n;\n    local = 0;\n}\n\nfn main() {\n    let mut a = 7;\n    let b = 7;\n    reset_ref(&mut a);\n    reset_copy(b);\n    println!("{} {}", a, b);\n}',
          ['0 0', '7 0', '7 7', '0 7'],
          3,
          'Only the &mut version writes to the caller’s variable; reset_copy changes its own local copy.',
        ),
        choose(
          'Why does this program fail to compile?',
          [
            'count is not declared with let mut',
            'grow must return the new value',
            '*n += 1 should be written n += 1',
            'An i32 cannot be borrowed mutably',
          ],
          0,
          'A &mut borrow allows changes, so the value it borrows must come from a let mut binding.',
          'fn grow(n: &mut i32) {\n    *n += 1;\n}\n\nfn main() {\n    let count = 1;\n    grow(&mut count);\n    println!("{}", count);\n}',
        ),
        choose(
          'Inside fn bump(v: &mut i32), which statement adds 2 to the caller’s integer?',
          ['v += 2;', '&v += 2;', 'let v = v + 2;', '*v += 2;'],
          3,
          'The * reaches the integer behind the reference; without it the statement would try to add to the reference.',
        ),
      ],
    },
    {
      title: 'Change a String through &mut String',
      explanation: [
        'A &mut String lets a function change the caller’s String in place. push_str(text) appends text to the end, and like other methods it is called directly on the reference, with no *. Fields and indexes also reach through a reference on their own: pos.0 += 1 works on a &mut (i32, i32).',
        'The caller writes &mut name and keeps ownership: after the call, name holds the changed text.',
      ],
      example: {
        language: 'rust',
        code: 'fn sign(letter: &mut String) {\n    letter.push_str(" -- Ana");\n}\n\nfn main() {\n    let mut note = String::from("See you");\n    sign(&mut note);\n    println!("{}", note);\n}',
        output: 'See you -- Ana',
        explanation:
          'sign appends to the String that main owns, so main prints the longer text.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn add_ext(name: &mut String) {\n    name.push_str(".txt");\n}\n\nfn main() {\n    let mut file = String::from("notes");\n    add_ext(&mut file);\n    add_ext(&mut file);\n    println!("{}", file);\n}',
          ['notes.txt', 'notes.txt.txt', 'notes', '.txt.txt'],
          1,
          'Both calls append to the same String, so the extension is added twice.',
        ),
        predictOutput(
          'What is printed?',
          'fn close(text: &mut String) -> usize {\n    text.push_str("]");\n    text.len()\n}\n\nfn main() {\n    let mut s = String::from("[ab");\n    let n = close(&mut s);\n    println!("{} {}", s, n);\n}',
          ['[ab 3', '[ab] 3', '[ab] 4', '[ab 4'],
          2,
          'The push happens before len is read, and it changes main’s String, so both values show the closed text.',
        ),
        choose(
          'Why is this function rejected?',
          [
            'push_str needs a * before text',
            'text has to be returned after the change',
            'A shared &String cannot change the text; it needs &mut String',
            'push_str only works on a String literal',
          ],
          2,
          'A shared reference only allows reading. Appending needs exclusive access through &mut String.',
          'fn shout(text: &String) {\n    text.push_str("!");\n}',
        ),
        predictOutput(
          'What does this program output?',
          'fn step(pos: &mut (i32, i32), dx: i32) {\n    pos.0 += dx;\n    pos.1 -= dx;\n}\n\nfn main() {\n    let mut p = (0, 0);\n    step(&mut p, 2);\n    step(&mut p, 3);\n    println!("{:?}", p);\n}',
          ['(5, -5)', '(3, -3)', '(0, 0)', '(5, 5)'],
          0,
          'Both calls update main’s tuple through the reference: the first field gains 2 + 3 and the second loses the same.',
        ),
      ],
    },
    {
      title: 'Only one active &mut at a time',
      explanation: [
        'While a &mut borrow of a value is in use, it is the only way to reach that value: no second &mut, no shared &, and not even the owner’s own name may be used until the borrow is finished.',
        'The compiler checks this before the program runs, so two parts of a program can never change the same value at the same time. A borrow made inside a { } block is finished when the block ends.',
      ],
      example: {
        language: 'rust',
        code: 'fn main() {\n    let mut total = 1;\n    {\n        let r = &mut total;\n        *r += 4;\n        *r *= 2;\n    }\n    println!("{}", total);\n}',
        output: '10',
        explanation:
          'Inside the block, r is the only access to total: 1 + 4 is 5, doubled is 10. After the block the borrow is over, so total can be printed.',
      },
      questions: [
        choose(
          'What happens when this program is compiled?',
          [
            'It fails: n is mutably borrowed twice at once',
            'It prints 3',
            'It prints 2',
            'It fails: n is not mutable',
          ],
          0,
          'a is still used after b is created, so two &mut borrows of n would be active together.',
          'fn main() {\n    let mut n = 1;\n    let a = &mut n;\n    let b = &mut n;\n    *a += 1;\n    *b += 1;\n    println!("{}", n);\n}',
        ),
        choose(
          'Why is this program rejected?',
          [
            'push_str cannot be called through a reference',
            'println! moves s',
            's must be cloned before it is borrowed',
            's is read while writer still has exclusive access',
          ],
          3,
          'writer is used after the println!, so its &mut borrow is still active when s is read.',
          'fn main() {\n    let mut s = String::from("hi");\n    let writer = &mut s;\n    println!("{}", s);\n    writer.push_str("!");\n}',
        ),
        predictOutput(
          'What does this program print?',
          'fn main() {\n    let mut level = 3;\n    {\n        let r = &mut level;\n        *r -= 1;\n    }\n    {\n        let r = &mut level;\n        *r *= 5;\n    }\n    println!("{}", level);\n}',
          ['14', '15', '2', '10'],
          3,
          'The borrows take turns, one per block: 3 - 1 is 2, then 2 * 5 is 10.',
        ),
        choose(
          'Which pair of borrows of one value x can be in use at the same moment?',
          [
            'One &mut x and one &x',
            'Two &mut x',
            'One &mut x and reading x by name',
            'Two &x',
          ],
          3,
          'Shared borrows may overlap with each other, but a &mut borrow excludes every other access.',
        ),
      ],
    },
    {
      title: 'Update separate values through several &mut',
      explanation: [
        'A function may take several &mut parameters as long as each one points to a different value. Passing the same value twice would create two active &mut borrows of it, which the compiler rejects.',
      ],
      example: {
        language: 'rust',
        code: 'fn transfer(from: &mut i32, to: &mut i32, amount: i32) {\n    *from -= amount;\n    *to += amount;\n}\n\nfn main() {\n    let mut checking = 50;\n    let mut savings = 10;\n    transfer(&mut checking, &mut savings, 15);\n    println!("{} {}", checking, savings);\n}',
        output: '35 25',
        explanation:
          'checking and savings are different values, so each can be lent mutably in the same call. 15 moves from one to the other.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn log(entry: &mut String, n: &mut i32) {\n    entry.push_str("+");\n    *n += 1;\n}\n\nfn main() {\n    let mut trail = String::from("start");\n    let mut count = 0;\n    log(&mut trail, &mut count);\n    log(&mut trail, &mut count);\n    println!("{} {}", trail, count);\n}',
          ['start++ 2', 'start+ 1', 'start++ 0', 'start 2'],
          0,
          'Each call changes both of main’s values, so after two calls there are two plus signs and count is 2.',
        ),
        choose(
          'What happens when this program is compiled?',
          [
            'It compiles and leaves a unchanged at 20',
            'It fails to compile: a is borrowed &mut twice',
            'It subtracts 5 and then adds 5',
            'It adds 5 twice',
          ],
          1,
          'Both parameters would borrow a mutably for the same call, which breaks the one-&mut rule.',
          'fn transfer(from: &mut i32, to: &mut i32, amount: i32) {\n    *from -= amount;\n    *to += amount;\n}\n\nfn main() {\n    let mut a = 20;\n    transfer(&mut a, &mut a, 5);\n    println!("{}", a);\n}',
        ),
        predictOutput(
          'What is printed?',
          'fn swap_values(a: &mut i32, b: &mut i32) {\n    let old_a = *a;\n    *a = *b;\n    *b = old_a;\n}\n\nfn main() {\n    let mut x = 1;\n    let mut y = 9;\n    swap_values(&mut x, &mut y);\n    println!("{} {}", x, y);\n}',
          ['1 9', '9 9', '9 1', '1 1'],
          2,
          'old_a keeps a copy of 1 before a is overwritten, so the two values trade places.',
        ),
        predictOutput(
          'What does this program output?',
          'fn record(total: &mut i32, last: &mut i32, score: i32) {\n    *total += score;\n    *last = score;\n}\n\nfn main() {\n    let mut total = 0;\n    let mut last = 0;\n    record(&mut total, &mut last, 4);\n    record(&mut total, &mut last, 7);\n    println!("{} {}", total, last);\n}',
          ['7 7', '11 4', '11 7', '4 11'],
          2,
          'total collects both scores, 4 + 7, while last is overwritten each time and ends at 7.',
        ),
      ],
    },
  ],
  'rust-borrow-ends': [
    {
      title: 'A shared borrow ends at its last use',
      explanation: [
        'A borrow is active from where it is created to the last place it is used, not to the end of the block. Once a shared reference has been used for the last time, the owner may change the value again.',
        'If the reference is used again after the change, the borrow stretches across the change, and the compiler rejects the program.',
      ],
      example: {
        language: 'rust',
        code: 'fn main() {\n    let mut s = String::from("ab");\n    let view = &s;\n    println!("{}", view);\n    s.push(\'c\');\n    println!("{}", s);\n}',
        output: 'ab\nabc',
        explanation:
          'view is last used in the first println!, so its borrow is over before s.push runs.',
      },
      questions: [
        choose(
          'What happens when this program is compiled?',
          [
            'It prints ab',
            'It prints abc',
            'It fails: view is used after s was changed',
            'It fails: view and s hold the same text',
          ],
          2,
          'The last use of view comes after the push, so the shared borrow is still active while s is changed.',
          'fn main() {\n    let mut s = String::from("ab");\n    let view = &s;\n    s.push(\'c\');\n    println!("{}", view);\n}',
        ),
        predictOutput(
          'What does this program print?',
          'fn main() {\n    let mut list = String::from("x");\n    let r = &list;\n    let size = r.len();\n    list.push_str("yz");\n    println!("{} {}", size, list.len());\n}',
          ['1 3', '3 3', '1 1', '3 1'],
          0,
          'r is last used to read the length 1. After that the push is allowed, and the String grows to 3.',
        ),
        choose(
          'With let r = &s; in a function, where does that shared borrow stop being active?',
          [
            'At the end of the enclosing block',
            'After the last line that uses r',
            'At the end of the function',
            'Right after the let statement',
          ],
          1,
          'A borrow lasts only until its final use; later lines are free to change s.',
        ),
        predictOutput(
          'What is printed?',
          'fn main() {\n    let mut word = String::from("go");\n    let a = &word;\n    let b = &word;\n    println!("{}{}", a, b);\n    word.push(\'!\');\n    println!("{}", word);\n}',
          ['gogo\ngogo!', 'go!go!\ngo!', 'gogo\ngo', 'gogo\ngo!'],
          3,
          'Both shared borrows end at the first println!, so the push is allowed and changes word to go!.',
        ),
      ],
    },
    {
      title: 'A mutable borrow ends at its last use too',
      explanation: [
        'The same rule holds for &mut: after the last write through it, the owner can be read or borrowed again, and a new &mut can be taken.',
        'Reading the owner while the &mut will still be used later is rejected, even when the read comes first in the code.',
      ],
      example: {
        language: 'rust',
        code: 'fn main() {\n    let mut n = 10;\n    let m = &mut n;\n    *m += 5;\n    println!("{}", n);\n    let m2 = &mut n;\n    *m2 *= 2;\n    println!("{}", n);\n}',
        output: '15\n30',
        explanation:
          'm is finished after adding 5, so n can be printed. Then m2 borrows n anew and doubles it.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn main() {\n    let mut count = 1;\n    let r = &mut count;\n    *r += 1;\n    let seen = count;\n    let r2 = &mut count;\n    *r2 += 10;\n    println!("{} {}", seen, count);\n}',
          ['12 12', '2 12', '1 12', '2 2'],
          1,
          'seen copies count after r is finished, so it is 2. r2 then adds 10 to count.',
        ),
        choose(
          'Why does this program fail to compile?',
          [
            'm is never used, which is an error',
            'n must be printed through m',
            'n is read while the &mut borrow m will still be used',
            'A &mut borrow always lasts until main ends',
          ],
          2,
          'The write through m comes after the println!, so m is still active when n is read.',
          'fn main() {\n    let mut n = 1;\n    let m = &mut n;\n    println!("{}", n);\n    *m += 1;\n}',
        ),
        predictOutput(
          'What is printed?',
          'fn main() {\n    let mut s = String::from("a");\n    let w = &mut s;\n    w.push(\'b\');\n    w.push(\'c\');\n    let n = s.len();\n    s.push_str("de");\n    println!("{} {}", n, s);\n}',
          ['5 abcde', '3 abcde', '1 abcde', '3 abc'],
          1,
          'w is finished after the second push, so s.len() reads 3; then s grows to abcde.',
        ),
        choose(
          'In this order the code is rejected: let m = &mut x; let y = x; *m += 1;. Which reordering compiles?',
          [
            'let y = x; *m += 1; let m = &mut x;',
            'let m = &mut x; *m += 1; let y = x;',
            'let m = &mut x; let y = &x; *m += 1;',
            'let m = &x; let y = x; *m += 1;',
          ],
          1,
          'Finishing every use of m before reading x lets the borrow end first.',
        ),
      ],
    },
    {
      title: 'Read what you need before changing',
      explanation: [
        'When you need a fact about a value and also need to change it, read the fact into a plain value first. let before = s.len(); stores a usize, which holds no borrow, so the push that follows is allowed.',
        'Inside a function that has text: &mut String, you can read through it with text.len() and then write through it with text.push(...). Each use is short, so they never overlap.',
      ],
      example: {
        language: 'rust',
        code: 'fn grow_and_report(text: &mut String) -> (usize, usize) {\n    let before = text.len();\n    text.push_str("!!");\n    (before, text.len())\n}\n\nfn main() {\n    let mut s = String::from("wow");\n    let sizes = grow_and_report(&mut s);\n    println!("{:?} {}", sizes, s);\n}',
        output: '(3, 5) wow!!',
        explanation:
          'before is a number copied out before the change, so it keeps 3. The String itself grows to 5 bytes.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn append_count(text: &mut String) -> usize {\n    let old = text.len();\n    text.push(\'?\');\n    old\n}\n\nfn main() {\n    let mut q = String::from("why");\n    let a = append_count(&mut q);\n    let b = append_count(&mut q);\n    println!("{} {} {}", a, b, q);\n}',
          ['4 5 why??', '3 3 why?', '3 4 why?', '3 4 why??'],
          3,
          'Each call reports the length before its push: 3 the first time, 4 the second.',
        ),
        choose(
          'Which change makes this program compile and print 2?',
          [
            'Change let view = &s; to let view = &mut s;',
            "Put s.push('!'); inside its own { } block",
            'Declare view with let mut',
            'Store s.len() in a usize before the push and print that',
          ],
          3,
          'A usize holds no borrow of s, so the push no longer overlaps an active reference.',
          'fn main() {\n    let mut s = String::from("hi");\n    let view = &s;\n    s.push(\'!\');\n    println!("{}", view.len());\n}',
        ),
        predictOutput(
          'What is printed?',
          'fn tag(text: &mut String) -> bool {\n    let was_empty = text.is_empty();\n    text.push(\'*\');\n    was_empty\n}\n\nfn main() {\n    let mut s = String::new();\n    let first = tag(&mut s);\n    let second = tag(&mut s);\n    println!("{} {} {}", first, second, s);\n}',
          ['true true **', 'false false **', 'true false **', 'true false *'],
          2,
          'Each call checks emptiness before pushing. Only the first call sees an empty String.',
        ),
        choose(
          "Why does let n = s.len(); s.push('x'); compile, even though len reads s?",
          [
            'len takes ownership of s and gives it back',
            'push waits until n goes out of scope',
            'n is a plain usize, so no borrow of s remains',
            's.len() makes a copy of the whole String',
          ],
          2,
          'The borrow used to read the length ends as soon as len returns; n is just a number.',
        ),
      ],
    },
  ],
  'rust-slices': [
    {
      title: 'Pass a slice with &[i32]',
      explanation: [
        'A slice, written &[i32], is a borrowed view of elements that sit next to each other. A function taking &[i32] accepts a whole array lent with &arr, whatever its length, without copying it or owning it.',
        '.len() gives the number of elements in the view, and .is_empty() tells whether it has none. {:?} prints a slice the same way as an array.',
      ],
      example: {
        language: 'rust',
        code: 'fn describe(values: &[i32]) -> (usize, bool) {\n    (values.len(), values.is_empty())\n}\n\nfn main() {\n    let short = [7, 8];\n    let long = [1, 2, 3, 4, 5];\n    println!("{:?} {:?}", describe(&short), describe(&long));\n    println!("{:?}", describe(&[]));\n}',
        output: '(2, false) (5, false)\n(0, true)',
        explanation:
          'The same function accepts arrays of length 2, 5, and 0, because each is passed as a slice. Only the empty one reports true for is_empty.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn count(values: &[i32]) -> usize {\n    values.len()\n}\n\nfn main() {\n    let a = [3, 3, 3];\n    let b = [10, 20, 30, 40, 50, 60];\n    println!("{} {}", count(&a), count(&b));\n}',
          ['9 210', '3 3', '3 6', '2 5'],
          2,
          'len counts elements, not their values, so the results are 3 and 6.',
        ),
        predictOutput(
          'What is printed?',
          'fn first_last(values: &[i32]) -> (i32, i32) {\n    (values[0], values[values.len() - 1])\n}\n\nfn main() {\n    let temps = [12, 15, 9, 20];\n    println!("{:?}", first_last(&temps));\n}',
          ['(12, 9)', '(20, 12)', '(15, 20)', '(12, 20)'],
          3,
          'The last index is one less than the length: 4 - 1 is index 3, which holds 20.',
        ),
        choose(
          'Which arguments can be passed to a function whose parameter is values: &[i32]?',
          [
            'Only arrays of one length fixed in the type',
            '&[1, 2] and &[1, 2, 3, 4] alike',
            'Only an array passed by value',
            'Only a single &i32',
          ],
          1,
          'A slice type has no length in it, so borrowed arrays of any length fit.',
        ),
        predictOutput(
          'What does this program output?',
          'fn main() {\n    let data = [5, 6, 7];\n    let view: &[i32] = &data;\n    println!("{:?} {} {}", view, view.len(), view.is_empty());\n}',
          [
            '[5, 6, 7] 3 false',
            '&[5, 6, 7] 3 false',
            '[5, 6, 7] 2 false',
            '[5, 6, 7] 3 true',
          ],
          0,
          'Debug prints a slice like an array, without an &; it has three elements, so it is not empty.',
        ),
      ],
    },
    {
      title: 'Slice a range of elements',
      explanation: [
        '&values[a..b] borrows the elements from index a up to, but not including, b, just like the range a..b. Leave out an end to run to the edge: &values[..2] is the first two, &values[2..] is everything from index 2 on, and &values[..] is the whole thing.',
        'The result is itself a slice, so .len() and indexing work on it, and index 0 of the slice is element a of the original. A range that ends past the last element panics when the program runs.',
      ],
      example: {
        language: 'rust',
        code: 'fn main() {\n    let nums = [10, 20, 30, 40, 50];\n    let middle = &nums[1..4];\n    println!("{:?} {} {}", middle, middle.len(), middle[0]);\n}',
        output: '[20, 30, 40] 3 20',
        explanation:
          '1..4 covers indexes 1, 2, and 3. The slice has 3 elements, and its index 0 is nums[1], which is 20.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn main() {\n    let values = [1, 2, 3, 4, 5, 6];\n    println!("{:?}", &values[2..5]);\n}',
          ['[2, 3, 4, 5]', '[3, 4, 5, 6]', '[2, 3, 4]', '[3, 4, 5]'],
          3,
          'Indexes 2, 3, and 4 hold 3, 4, and 5; index 5 is excluded.',
        ),
        predictOutput(
          'What is printed?',
          'fn main() {\n    let v = [8, 6, 4, 2];\n    let head = &v[..1];\n    let tail = &v[1..];\n    println!("{:?} {:?}", head, tail);\n}',
          ['[8] [6, 4, 2]', '[8, 6] [6, 4, 2]', '[8] [4, 2]', '8 [6, 4, 2]'],
          0,
          '..1 is just index 0, and 1.. is everything from index 1, so the two slices split the array without overlap.',
        ),
        choose(
          'What happens when this program runs?',
          [
            'It prints [2, 3]',
            'It panics: the range ends past the array',
            'It prints [2, 3, 0, 0]',
            'It fails to compile: 5 is past the array',
          ],
          1,
          'The array has 3 elements, so an end of 5 is out of range, and slicing panics instead of shortening the range.',
          'fn main() {\n    let v = [1, 2, 3];\n    let part = &v[1..5];\n    println!("{:?}", part);\n}',
        ),
        predictOutput(
          'What does this program output?',
          'fn main() {\n    let v = [4, 5, 6, 7];\n    let inner = &v[1..3];\n    let deeper = &inner[1..];\n    println!("{:?} {}", deeper, deeper[0]);\n}',
          ['[5, 6] 5', '[6, 7] 6', '[7] 7', '[6] 6'],
          3,
          'inner is [5, 6]. Slicing it from its own index 1 leaves [6]; positions count within inner, not v.',
        ),
      ],
    },
    {
      title: 'Loop over the elements of a slice',
      explanation: [
        'for x in values visits each element of a slice in order. Because the slice is borrowed, each x is a reference, &i32, pointing at the element. Printing x, or adding it to an i32 total with +=, works the same as with a plain number.',
        'Writing the pattern for &x in values copies each element out instead, so x is a plain i32. Use that form when you need the number itself, for example to store it in an i32 binding.',
      ],
      example: {
        language: 'rust',
        code: 'fn total(values: &[i32]) -> i32 {\n    let mut sum = 0;\n    for x in values {\n        sum += x;\n    }\n    sum\n}\n\nfn last_seen(values: &[i32]) -> i32 {\n    let mut last = 0;\n    for &x in values {\n        last = x;\n    }\n    last\n}\n\nfn main() {\n    let v = [3, 1, 4];\n    println!("{} {}", total(&v), last_seen(&v));\n}',
        output: '8 4',
        explanation:
          'total adds each &i32 to sum: 3 + 1 + 4 is 8. last_seen needs plain i32 values to store, so it uses &x; the last one stored is 4.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn main() {\n    let v = [2, 4, 6];\n    for x in &v[1..] {\n        println!("{}", x);\n    }\n}',
          ['2\n4\n6', '&4\n&6', '4\n6', '4'],
          2,
          'The loop visits the slice from index 1, and printing a &i32 shows the number itself.',
        ),
        predictOutput(
          'What is printed?',
          'fn count_and_sum(values: &[i32]) -> (i32, i32) {\n    let mut count = 0;\n    let mut sum = 0;\n    for &x in values {\n        count += 1;\n        sum += x;\n    }\n    (count, sum)\n}\n\nfn main() {\n    println!("{:?}", count_and_sum(&[5, 10, 15, 20]));\n}',
          ['(4, 50)', '(3, 50)', '(4, 30)', '(50, 4)'],
          0,
          'The loop runs once per element, four times, and the elements add up to 50.',
        ),
        choose(
          'Why does this function fail to compile?',
          [
            'A for loop can only visit ranges such as 0..3, not slices',
            'keep must not be declared with let mut',
            'Each x is a &i32 and keep is an i32; writing for &x in values fixes it',
            'values.len() must be called before the loop',
          ],
          2,
          'for x in values yields references. Storing one into an i32 is a type mismatch; the &x pattern copies the number out.',
          'fn final_value(values: &[i32]) -> i32 {\n    let mut keep = 0;\n    for x in values {\n        keep = x;\n    }\n    keep\n}',
        ),
        predictOutput(
          'What does this program output?',
          'fn doubled_sum(values: &[i32]) -> i32 {\n    let mut out = 0;\n    for x in values {\n        out += x * 2;\n    }\n    out\n}\n\nfn main() {\n    let v = [1, 2, 3, 4];\n    println!("{}", doubled_sum(&v[..2]));\n}',
          ['6', '20', '12', '3'],
          0,
          'Only the first two elements are passed: (1 + 2) doubled is 6.',
        ),
      ],
    },
    {
      title: 'Limit the end before slicing a prefix',
      explanation: [
        'Slicing past the end panics, so when a requested length might be too large, limit it first. a.min(b) gives the smaller of two numbers, so &values[..n.min(values.len())] is never longer than the whole slice.',
        'A function can return such a slice as &[i32]. It is a view into the caller’s array, so nothing is copied.',
      ],
      example: {
        language: 'rust',
        code: 'fn take_up_to(values: &[i32], n: usize) -> &[i32] {\n    &values[..n.min(values.len())]\n}\n\nfn main() {\n    let v = [9, 8, 7];\n    println!("{:?} {:?}", take_up_to(&v, 2), take_up_to(&v, 10));\n}',
        output: '[9, 8] [9, 8, 7]',
        explanation:
          'For 2 the limit stays 2. For 10, min picks the length 3, so the slice stops at the end instead of panicking.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn main() {\n    let a: usize = 4;\n    let b: usize = 9;\n    println!("{} {}", a.min(b), b.min(2));\n}',
          ['4 2', '9 9', '4 9', '9 2'],
          0,
          'min returns the smaller value: 4 out of 4 and 9, then 2 out of 9 and 2.',
        ),
        predictOutput(
          'What is printed?',
          'fn take_up_to(values: &[i32], n: usize) -> &[i32] {\n    &values[..n.min(values.len())]\n}\n\nfn main() {\n    let v = [1, 2, 3, 4, 5];\n    let a = take_up_to(&v, 0);\n    let b = take_up_to(&v[3..], 4);\n    println!("{:?} {:?}", a, b);\n}',
          ['[1] [4, 5]', '[] [4, 5, 0, 0]', '[] [1, 2, 3, 4]', '[] [4, 5]'],
          3,
          'A limit of 0 gives an empty slice. &v[3..] has only two elements, so 4 is cut down to 2.',
        ),
        choose(
          'What happens when this program runs?',
          [
            'It prints [1, 2]',
            'It panics: 3 is past the end of the slice',
            'It prints [1, 2, 0]',
            'It fails to compile: the slice is too short',
          ],
          1,
          'Nothing limits the end, and slicing does not shorten an out-of-range request, so it panics.',
          'fn first_three(values: &[i32]) -> &[i32] {\n    &values[..3]\n}\n\nfn main() {\n    println!("{:?}", first_three(&[1, 2]));\n}',
        ),
        predictOutput(
          'What does this program output?',
          'fn sum_first(values: &[i32], n: usize) -> i32 {\n    let mut total = 0;\n    for x in &values[..n.min(values.len())] {\n        total += x;\n    }\n    total\n}\n\nfn main() {\n    let v = [10, 20, 30];\n    println!("{} {}", sum_first(&v, 2), sum_first(&v, 5));\n}',
          ['30 60', '30 0', '60 60', '10 60'],
          0,
          'The first call adds 10 and 20. In the second, 5 is limited to 3, so all three elements are added.',
        ),
      ],
    },
  ],
  'rust-string-conversion': [
    {
      title: 'Tell &str apart from String',
      explanation: [
        'A string literal such as "hi" has type &str: a borrowed view of text that is stored in the program itself. A &str cannot grow. A String owns its text and can grow.',
        'To get an owned String from a &str, call .to_owned(), .to_string(), or String::from; each copies the text into a new String. .to_string() also turns a number into its text. Both types print the same way with {} and {:?}.',
      ],
      example: {
        language: 'rust',
        code: 'fn main() {\n    let view: &str = "tea";\n    let a: String = view.to_owned();\n    let b: String = view.to_string();\n    let c: String = String::from(view);\n    println!("{} {} {} {:?}", view, a, b, c);\n}',
        output: 'tea tea tea "tea"',
        explanation:
          'All three conversions make an owned String with the same text, and the &str is still usable afterwards because it was only read.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn main() {\n    let word = "sky";\n    let owned = word.to_owned();\n    println!("{:?} {:?}", word, owned);\n}',
          ['sky "sky"', '"sky" sky', '&"sky" "sky"', '"sky" "sky"'],
          3,
          'A &str and a String with the same text have the same Debug form: the text in double quotes.',
        ),
        predictOutput(
          'What is printed?',
          'fn main() {\n    let n = 42;\n    let text = n.to_string();\n    println!("{:?}", text);\n}',
          ['42', '"42"', "'42'", '"n"'],
          1,
          'to_string turns the number into a String, and Debug shows a String in double quotes.',
        ),
        choose(
          'Which of these bindings has the type &str?',
          ['b', 'c', 'a', 'd'],
          2,
          'Only the bare literal is a &str. String::from, to_string, and format! all build owned Strings.',
          'fn main() {\n    let a = "hi";\n    let b = String::from("hi");\n    let c = "hi".to_string();\n    let d = format!("{}", "hi");\n}',
        ),
        predictOutput(
          'What does this program output?',
          'fn main() {\n    let first: &str = "ice";\n    let second: String = format!("{}{}", first, "berg");\n    let third = first.to_string();\n    println!("{} {} {}", first, second, third);\n}',
          [
            'ice iceberg iceberg',
            'iceberg iceberg ice',
            'ice iceberg ice',
            'ice ice ice',
          ],
          2,
          'format! and to_string only read first and build new Strings, so first still says ice.',
        ),
      ],
    },
    {
      title: 'Take &str when a function only reads text',
      explanation: [
        'A parameter of type &str accepts a string literal directly. It also accepts a borrowed String: &name, where name is a String, is converted to &str automatically.',
        'So a function that only reads text should take &str. It works for both kinds of caller, and no one has to give up or copy a String.',
      ],
      example: {
        language: 'rust',
        code: 'fn size(text: &str) -> usize {\n    text.len()\n}\n\nfn main() {\n    let owned = String::from("ocean");\n    println!("{} {}", size("sea"), size(&owned));\n    println!("{}", owned);\n}',
        output: '3 5\nocean',
        explanation:
          'size takes a literal in the first call and a borrowed String in the second. owned is only borrowed, so main can still print it.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn bracket(text: &str) -> String {\n    format!("({})", text)\n}\n\nfn main() {\n    let name = String::from("ok");\n    let a = bracket("hi");\n    let b = bracket(&name);\n    println!("{} {} {}", a, b, name);\n}',
          ['(hi) (ok) (ok)', 'hi ok ok', '(hi) ok ok', '(hi) (ok) ok'],
          3,
          'bracket accepts both a literal and &name, and it returns new Strings; name itself is unchanged.',
        ),
        choose(
          'A function only reads its text. Which parameter type accepts both "literal" and &my_string?',
          ['&String', 'String', 'char', '&str'],
          3,
          '&String rejects a literal and String would take ownership; &str accepts both callers.',
        ),
        choose(
          'Why is this program rejected?',
          [
            'size must take ownership with a String parameter',
            'len cannot be called through a reference',
            '"hello" is a &str, and a &String parameter does not accept it',
            'A literal cannot be passed to a function',
          ],
          2,
          'A &String must point at an owned String. A literal is a &str, so the parameter should be &str.',
          'fn size(text: &String) -> usize {\n    text.len()\n}\n\nfn main() {\n    println!("{}", size("hello"));\n}',
        ),
        predictOutput(
          'What is printed?',
          'fn is_blank(text: &str) -> bool {\n    text.is_empty()\n}\n\nfn main() {\n    let empty = String::new();\n    println!("{} {} {}", is_blank(""), is_blank(" "), is_blank(&empty));\n}',
          [
            'true true true',
            'false false true',
            'true false true',
            'true false false',
          ],
          2,
          'The empty literal and the empty String have no characters; a single space is one character.',
        ),
      ],
    },
    {
      title: 'Grow a String with push and push_str',
      explanation: [
        "Only a String can grow, and only from a let mut binding. push adds one character, written in single quotes like '!'; push_str adds a whole &str, written in double quotes.",
        'A &str cannot grow. To build on one, first make an owned copy with .to_owned() or .to_string().',
      ],
      example: {
        language: 'rust',
        code: 'fn main() {\n    let mut path = String::from("home");\n    path.push(\'/\');\n    path.push_str("docs");\n    println!("{}", path);\n}',
        output: 'home/docs',
        explanation:
          'push adds the single character /, then push_str adds the text docs, both at the end.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn main() {\n    let mut s = "ab".to_string();\n    s.push(\'c\');\n    s.push_str("de");\n    s.push(\'f\');\n    println!("{} {}", s, s.len());\n}',
          ['abcdef 5', 'abcdef 4', 'abcdef 6', 'abcfde 6'],
          2,
          'Each call appends at the end, in order, and the result has six characters.',
        ),
        choose(
          'Why does this program fail to compile?',
          [
            'greeting is a &str, which cannot grow; it needs an owned String',
            'push_str only adds a single character',
            'greeting must be printed with {:?}',
            'push_str returns a new String that is ignored',
          ],
          0,
          'A literal is a borrowed &str. Only a String in a let mut binding can be appended to.',
          'fn main() {\n    let greeting = "hello";\n    greeting.push_str(" world");\n    println!("{}", greeting);\n}',
        ),
        choose(
          'Which call appends exactly one character to let mut s = String::new(); ?',
          [
            's.push("x");',
            "s.push_str('x');",
            's.push_str(x);',
            "s.push('x');",
          ],
          3,
          'push takes a char in single quotes; push_str takes a &str in double quotes.',
        ),
        predictOutput(
          'What is printed?',
          'fn main() {\n    let base = "con";\n    let mut word = base.to_owned();\n    word.push_str("text");\n    println!("{} {}", base, word);\n}',
          ['context context', 'con con', 'con context', 'context con'],
          2,
          'to_owned made a separate String, so appending to word leaves the &str base unchanged.',
        ),
      ],
    },
    {
      title: 'Return owned text built from borrowed input',
      explanation: [
        'When a function produces new or changed text, it returns a String: the result must own its text, because the input is only borrowed and cannot grow. Take &str in, make an owned copy, change it, and return it.',
        'When a function only reads its input, return a number or a bool instead, and skip the copy.',
      ],
      example: {
        language: 'rust',
        code: 'fn title_line(name: &str, count: i32) -> String {\n    let mut out = name.to_string();\n    out.push_str(": ");\n    out.push_str(&count.to_string());\n    out\n}\n\nfn main() {\n    println!("{}", title_line("items", 3));\n}',
        output: 'items: 3',
        explanation:
          'out is a new String built from the borrowed name. The number becomes a String with to_string, and &count.to_string() is passed where push_str expects a &str.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn plural(word: &str) -> String {\n    let mut out = word.to_owned();\n    out.push(\'s\');\n    out\n}\n\nfn main() {\n    let cat = String::from("cat");\n    println!("{} {}", plural(&cat), plural("dog"));\n    println!("{}", cat);\n}',
          ['cats dogs\ncats', 'cats dogs\ncat', 'cat dog\ncat', 'cats dogs'],
          1,
          'plural changes its own copy and returns it. cat was only borrowed, so it still says cat.',
        ),
        choose(
          'Why is this function rejected, and what should it return instead?',
          [
            'push needs a let mut text; keep returning &str',
            'push needs double quotes; keep returning &str',
            'A &str cannot grow; make an owned copy and return String',
            'Nothing is wrong; it returns the text with ! added',
          ],
          2,
          'The parameter is a borrowed view, so it cannot be appended to. The changed text must live in a new String that the function returns.',
          "fn excite(text: &str) -> &str {\n    text.push('!');\n    text\n}",
        ),
        predictOutput(
          'What is printed?',
          'fn repeat_twice(text: &str) -> String {\n    let mut out = text.to_owned();\n    out.push_str(text);\n    out\n}\n\nfn main() {\n    let r = repeat_twice("la");\n    println!("{} {}", r, r.len());\n}',
          ['lala 4', 'la 2', 'lala 2', 'lalala 6'],
          0,
          'out starts as a copy of la, then gets la appended once more: four characters.',
        ),
        choose(
          'A function receives text: &str and only needs to report how many bytes it holds. What should it return?',
          [
            'A String copy of text',
            'A String built from text.len().to_string()',
            'A &str pointing at the text',
            'A usize from text.len()',
          ],
          3,
          'A count is a number, so the usize from len is the answer; there is no new text to own, so no String is needed.',
        ),
      ],
    },
  ],
  'rust-chars': [
    {
      title: 'Get the first character with chars().next()',
      explanation: [
        "A char is one Unicode scalar value, written in single quotes: 'a', 'é', '7'. text.chars() walks a string one char at a time, decoding however many bytes each one uses.",
        "text.chars().next() returns the first char as an Option<char>: Some('é') when there is one, None for an empty string. With {:?} a char prints in single quotes; with {} it prints bare.",
      ],
      example: {
        language: 'rust',
        code: 'fn main() {\n    let word = "élan";\n    let first = word.chars().next();\n    println!("{:?} {:?}", first, "".chars().next());\n}',
        output: "Some('é') None",
        explanation:
          'The first char of élan is é, even though it takes two bytes. The empty string has no first char, so next gives None.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn main() {\n    let first = "zebra".chars().next();\n    println!("{:?}", first);\n}',
          ["Some('z')", 'Some("z")', "'z'", 'Some(z)'],
          0,
          'next returns an Option, and a char inside it prints in single quotes.',
        ),
        predictOutput(
          'What is printed?',
          'fn initial(name: &str) -> Option<char> {\n    name.chars().next()\n}\n\nfn main() {\n    println!("{:?} {:?}", initial(""), initial("Øra"));\n}',
          [
            "None Some('Ø')",
            "Some(' ') Some('Ø')",
            "Some('\\0') Some('Ø')",
            "None Some('O')",
          ],
          0,
          'An empty string has no first char, so the answer is None, not a space or a null character. Ø is one char.',
        ),
        choose(
          'What type does text.chars().next() return?',
          ['char', 'Option<char>', 'Option<&str>', 'Option<String>'],
          1,
          'There may be no first char, so the char comes wrapped in an Option.',
        ),
        predictOutput(
          'What does this program output?',
          'fn main() {\n    let c = \'ñ\';\n    println!("{} {:?}", c, c);\n}',
          ["'ñ' 'ñ'", 'ñ "ñ"', "ñ 'ñ'", 'ñ ñ'],
          2,
          '{} prints the character itself; {:?} prints it in single quotes, the char Debug form.',
        ),
      ],
    },
    {
      title: 'Step through a string with repeated next',
      explanation: [
        'chars() gives an iterator that remembers its position. Keep it in a let mut binding, and each call to .next() hands back the following char as Some(c), until the text runs out; after that, every call returns None.',
        'Calling text.chars() again starts a new iterator from the beginning.',
      ],
      example: {
        language: 'rust',
        code: 'fn main() {\n    let mut it = "ok".chars();\n    let a = it.next();\n    let b = it.next();\n    let c = it.next();\n    println!("{:?} {:?} {:?}", a, b, c);\n}',
        output: "Some('o') Some('k') None",
        explanation:
          'The same iterator moves forward with each call: o, then k, then nothing is left.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn main() {\n    let mut letters = "née".chars();\n    letters.next();\n    println!("{:?}", letters.next());\n}',
          ["Some('n')", "Some('e')", 'None', "Some('é')"],
          3,
          'The first call consumes n, so the second call returns the next char, é.',
        ),
        predictOutput(
          'What is printed?',
          'fn main() {\n    let a = "xy".chars().next();\n    let b = "xy".chars().next();\n    println!("{:?} {:?}", a, b);\n}',
          [
            "Some('x') Some('y')",
            "Some('x') None",
            "Some('y') Some('y')",
            "Some('x') Some('x')",
          ],
          3,
          'Each chars() call creates a fresh iterator, so both start at x.',
        ),
        choose(
          "An iterator from \"hi\".chars() has already returned Some('h') and Some('i'). What do the next two calls return?",
          [
            "None and Some('h')",
            "Some('h') and Some('i') again",
            "Some(' ') and None",
            'None and None',
          ],
          3,
          'Once the text is used up, next keeps returning None; it does not start over.',
        ),
        predictOutput(
          'What does this program output?',
          'fn second(text: &str) -> Option<char> {\n    let mut it = text.chars();\n    it.next();\n    it.next()\n}\n\nfn main() {\n    println!("{:?} {:?}", second("été"), second("a"));\n}',
          [
            "Some('t') None",
            "Some('é') None",
            "Some('t') Some('a')",
            'None None',
          ],
          0,
          'é counts as one char, so the second char of été is t. a has only one char, so its second is None.',
        ),
      ],
    },
    {
      title: 'Loop over the chars of a string',
      explanation: [
        'for c in text.chars() visits every char in order. Each c is a plain char, so it can be compared with == against a char literal, printed, or pushed onto a String.',
        "A char that takes several bytes, like 'é', still arrives as a single c.",
      ],
      example: {
        language: 'rust',
        code: 'fn count_a(text: &str) -> i32 {\n    let mut n = 0;\n    for c in text.chars() {\n        if c == \'a\' || c == \'á\' {\n            n += 1;\n        }\n    }\n    n\n}\n\nfn main() {\n    println!("{}", count_a("banána"));\n}',
        output: '3',
        explanation:
          'The loop sees b, a, n, á, n, a. Three of those chars match one of the two letters.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn main() {\n    for c in "héy".chars() {\n        println!("{}", c);\n    }\n}',
          ["'h'\n'é'\n'y'", 'héy', 'h\ny', 'h\né\ny'],
          3,
          'Each char is printed on its own line, and {} shows it without quotes.',
        ),
        predictOutput(
          'What is printed?',
          'fn spaced(text: &str) -> String {\n    let mut out = String::new();\n    for c in text.chars() {\n        out.push(c);\n        out.push(\' \');\n    }\n    out\n}\n\nfn main() {\n    println!("{:?}", spaced("ok"));\n}',
          ['"o k "', '"o k"', '" o k"', '"ok "'],
          0,
          'A space is pushed after every char, including the last one.',
        ),
        predictOutput(
          'What does this program output?',
          'fn count_spaces(text: &str) -> i32 {\n    let mut n = 0;\n    for c in text.chars() {\n        if c == \' \' {\n            n += 1;\n        }\n    }\n    n\n}\n\nfn main() {\n    println!("{}", count_spaces("a b  c"));\n}',
          ['2', '3', '4', '1'],
          1,
          'There is one space after a and two between b and c, and each is its own char.',
        ),
        choose(
          'In for c in "día".chars(), how many times does the loop body run?',
          ['4', '2', '1', '3'],
          3,
          'chars yields one value per character: d, í, and a. The 4 is the byte count, not the char count.',
        ),
      ],
    },
    {
      title: 'Build and test text char by char',
      explanation: [
        'The tools combine: next() picks out the first char, a for loop visits all of them, and each char can be compared with == or != and pushed onto an owned String to build a result.',
        'A for loop can also take an iterator stored in a binding. If next() has already been called on it, the loop continues from where next stopped.',
      ],
      example: {
        language: 'rust',
        code: 'fn without(text: &str, unwanted: char) -> String {\n    let mut out = String::new();\n    for c in text.chars() {\n        if c != unwanted {\n            out.push(c);\n        }\n    }\n    out\n}\n\nfn main() {\n    println!("{:?} {:?}", without("añaña", \'ñ\'), "añaña".chars().next());\n}',
        output: '"aaa" Some(\'a\')',
        explanation:
          'Every ñ is skipped and every other char is pushed, giving aaa. The first char of the original text is a.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn summary(text: &str) -> (Option<char>, i32) {\n    let mut count = 0;\n    for c in text.chars() {\n        if c == \'ö\' {\n            count += 1;\n        }\n    }\n    (text.chars().next(), count)\n}\n\nfn main() {\n    println!("{:?}", summary("öl öl"));\n}',
          ["(Some('ö'), 2)", "(Some('ö'), 4)", "('ö', 2)", "(Some('o'), 2)"],
          0,
          'ö appears twice as a char; its two bytes do not make it count twice. The first char is ö.',
        ),
        predictOutput(
          'What is printed?',
          'fn swap_dashes(text: &str) -> String {\n    let mut out = String::new();\n    for c in text.chars() {\n        if c == \'-\' {\n            out.push(\'_\');\n        } else {\n            out.push(c);\n        }\n    }\n    out\n}\n\nfn main() {\n    println!("{}", swap_dashes("a-b-é"));\n}',
          ['a_b_é', 'a-b-é', 'a_b_', '_a_b_é'],
          0,
          'Each dash is replaced with an underscore and every other char, é included, is copied as is.',
        ),
        choose(
          'A function must give the first char of a name, or nothing when the name is empty. Which return type and body fit?',
          [
            'char, with name.chars().next()',
            'Option<char>, with Some(name.chars())',
            "char, returning ' ' when the name is empty",
            'Option<char>, with name.chars().next()',
          ],
          3,
          'next already returns Option<char>, which has None for the empty case; a space would pretend a char exists.',
        ),
        predictOutput(
          'What does this program output?',
          'fn main() {\n    let mut out = String::new();\n    let mut it = "abc".chars();\n    it.next();\n    for c in it {\n        out.push(c);\n    }\n    println!("{}", out);\n}',
          ['bc', 'abc', 'c', 'ab'],
          0,
          'The first next() uses up a, and the loop continues from where the iterator stopped.',
        ),
      ],
    },
  ],
  'rust-utf8-bytes': [
    {
      title: 'len counts bytes, not characters',
      explanation: [
        'Rust stores text as UTF-8, where each char takes 1 to 4 bytes: ASCII letters, digits, and spaces take 1; letters such as é or ß take 2; symbols such as € take 3; many emoji take 4.',
        '.len() on a String or &str counts those bytes. It equals the number of characters only when every character is ASCII.',
      ],
      example: {
        language: 'rust',
        code: 'fn main() {\n    println!("{} {} {} {}", "abc".len(), "é".len(), "€".len(), "🙂".len());\n}',
        output: '3 2 3 4',
        explanation:
          'Each of a, b, and c is one byte. é needs 2 bytes, € needs 3, and the emoji needs 4, even though each is one character.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn main() {\n    let word = "café";\n    println!("{}", word.len());\n}',
          ['5', '4', '8', '6'],
          0,
          'c, a, and f take one byte each and é takes two, so the length is 5.',
        ),
        predictOutput(
          'What is printed?',
          'fn main() {\n    let price = String::from("9€");\n    println!("{}", price.len());\n}',
          ['2', '4', '3', '5'],
          1,
          'The digit is one byte and the euro sign is three.',
        ),
        choose(
          'For which string does .len() equal the number of characters a reader sees?',
          ['"naïve"', '"5 €"', '"cafe 42"', '"Straße"'],
          2,
          'Only all-ASCII text uses one byte per character; ï, €, and ß each take more.',
        ),
        predictOutput(
          'What does this program output?',
          'fn main() {\n    let mut s = String::from("a");\n    s.push(\'ü\');\n    s.push(\'b\');\n    println!("{} {}", s, s.len());\n}',
          ['aüb 3', 'aüb 5', 'ab 2', 'aüb 4'],
          3,
          'Pushing ü adds two bytes, so the three characters take 4 bytes.',
        ),
      ],
    },
    {
      title: 'Count characters with chars().count()',
      explanation: [
        'text.chars().count() decodes the bytes and counts the chars, which gives the number of Unicode scalar values. Comparing it with .len() shows whether any character needed more than one byte.',
        'A char is a Unicode scalar, which is not always one visible letter. "e\\u{301}" is an e followed by a combining accent: it displays as é but counts as 2 chars.',
      ],
      example: {
        language: 'rust',
        code: 'fn units(text: &str) -> (usize, usize) {\n    (text.len(), text.chars().count())\n}\n\nfn main() {\n    println!("{:?} {:?}", units("niño"), units("hi"));\n}',
        output: '(5, 4) (2, 2)',
        explanation:
          'niño has 4 chars, but ñ takes 2 bytes, so it has 5 bytes. For the ASCII text hi, both counts are 2.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn main() {\n    let s = "€10";\n    println!("{} {}", s.len(), s.chars().count());\n}',
          ['3 3', '3 5', '5 5', '5 3'],
          3,
          'The euro sign is 3 bytes and each digit is 1, so 5 bytes hold 3 chars.',
        ),
        predictOutput(
          'What is printed?',
          'fn main() {\n    let s = "e\\u{301}";\n    println!("{} {}", s.chars().count(), s.len());\n}',
          ['1 2', '1 3', '2 2', '2 3'],
          3,
          'The e and the combining accent are separate chars; the accent takes 2 bytes, so there are 3 bytes in all.',
        ),
        predictOutput(
          'What does this program output?',
          'fn extra_bytes(text: &str) -> usize {\n    text.len() - text.chars().count()\n}\n\nfn main() {\n    println!("{} {}", extra_bytes("año"), extra_bytes("plain"));\n}',
          ['1 0', '0 0', '2 0', '1 5'],
          0,
          'año has 3 chars in 4 bytes, so ñ adds one extra byte; plain is ASCII, so it has none.',
        ),
        choose(
          'A form must reject names longer than 10 characters, counting é as one. Which measurement fits?',
          [
            'name.len()',
            'name.len() / 2',
            'name.chars().next()',
            'name.chars().count()',
          ],
          3,
          'len counts bytes, which would treat é as 2. chars().count() counts each scalar once.',
        ),
      ],
    },
    {
      title: 'Measure each char with len_utf8',
      explanation: [
        "c.len_utf8() tells how many bytes one char needs: 1 for 'a', 2 for 'é', 3 for '€', 4 for '🙂'. Adding it up over text.chars() gives exactly text.len().",
        'This is how byte positions are found: the byte where a char starts is the sum of len_utf8 for every char before it.',
      ],
      example: {
        language: 'rust',
        code: 'fn main() {\n    let mut total = 0;\n    for c in "añ€".chars() {\n        println!("{} {}", c, c.len_utf8());\n        total += c.len_utf8();\n    }\n    println!("total {}", total);\n}',
        output: 'a 1\nñ 2\n€ 3\ntotal 6',
        explanation:
          'The three chars take 1, 2, and 3 bytes, and their sum, 6, is the length of the string in bytes.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          "fn main() {\n    println!(\"{} {} {}\", 'x'.len_utf8(), 'ö'.len_utf8(), '日'.len_utf8());\n}",
          ['1 1 1', '1 2 2', '1 2 4', '1 2 3'],
          3,
          'x is ASCII (1 byte), ö needs 2 bytes, and the CJK character 日 needs 3.',
        ),
        predictOutput(
          'What is printed?',
          'fn start_of_third(text: &str) -> usize {\n    let mut pos = 0;\n    let mut seen = 0;\n    for c in text.chars() {\n        if seen < 2 {\n            pos += c.len_utf8();\n        }\n        seen += 1;\n    }\n    pos\n}\n\nfn main() {\n    println!("{}", start_of_third("éèa"));\n}',
          ['2', '5', '4', '3'],
          2,
          'The first two chars, é and è, take 2 bytes each, so the third char starts at byte 4.',
        ),
        choose(
          'For any string text, which value always equals text.len()?',
          [
            'text.chars().count()',
            'text.chars().count() * 2',
            'The number of times a loop over text.chars() runs',
            'The sum of c.len_utf8() over text.chars()',
          ],
          3,
          'len counts bytes, and len_utf8 gives each char’s bytes; counting chars ignores how wide each one is.',
        ),
        predictOutput(
          'What does this program output?',
          'fn widest(text: &str) -> usize {\n    let mut best = 0;\n    for c in text.chars() {\n        if c.len_utf8() > best {\n            best = c.len_utf8();\n        }\n    }\n    best\n}\n\nfn main() {\n    println!("{} {}", widest("abc"), widest("a€é"));\n}',
          ['3 3', '1 2', '1 3', '0 3'],
          2,
          'Every char of abc is 1 byte. In a€é the widest is €, at 3 bytes.',
        ),
      ],
    },
    {
      title: 'Pick bytes or chars for the job',
      explanation: [
        'Use .len() when the question is about storage, such as a byte limit or a byte position. Use chars().count() when the question is about how many characters were typed. The two agree only for ASCII text, which the test text.len() == text.chars().count() detects.',
      ],
      example: {
        language: 'rust',
        code: 'fn report(text: &str) -> (usize, usize, bool) {\n    let bytes = text.len();\n    let chars = text.chars().count();\n    (bytes, chars, bytes == chars)\n}\n\nfn main() {\n    println!("{:?}", report("über"));\n    println!("{:?}", report("uber"));\n}',
        output: '(5, 4, false)\n(4, 4, true)',
        explanation:
          'ü takes two bytes, so über has one more byte than chars. uber is all ASCII, so the counts match.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn fits(text: &str, max_bytes: usize) -> bool {\n    text.len() <= max_bytes\n}\n\nfn main() {\n    println!("{} {}", fits("ñandú", 5), fits("nandu", 5));\n}',
          ['true true', 'false false', 'false true', 'true false'],
          2,
          'ñandú has 5 chars but 7 bytes, so it does not fit in 5 bytes; nandu is exactly 5.',
        ),
        choose(
          'A database column holds at most 20 bytes of UTF-8. Which check decides whether text can be stored?',
          [
            'text.chars().count() <= 20',
            'text.len() <= 20',
            'text.chars().count() * 4 <= 20',
            'text.len() / 2 <= 20',
          ],
          1,
          'The limit is in bytes, and len counts bytes exactly.',
        ),
        predictOutput(
          'What is printed?',
          'fn main() {\n    let s = "日本";\n    let mut bytes = 0;\n    for c in s.chars() {\n        bytes += c.len_utf8();\n    }\n    println!("{} {} {}", s.chars().count(), bytes, s.len());\n}',
          ['2 2 6', '2 6 6', '6 6 6', '2 4 4'],
          1,
          'Two chars of 3 bytes each: 2 chars, and both byte totals are 6.',
        ),
        predictOutput(
          'What does this program output?',
          'fn is_ascii_only(text: &str) -> bool {\n    text.len() == text.chars().count()\n}\n\nfn main() {\n    let a = is_ascii_only("R2-D2");\n    let b = is_ascii_only("Zoë");\n    let c = is_ascii_only("");\n    println!("{} {} {}", a, b, c);\n}',
          [
            'true false false',
            'true true true',
            'false false true',
            'true false true',
          ],
          3,
          'ë makes Zoë one byte longer than its char count. The empty string has 0 of both, so it passes.',
        ),
      ],
    },
  ],
  'rust-string-boundaries': [
    {
      title: 'Slice a string by byte positions',
      explanation: [
        '&text[a..b] borrows the part of a string from byte a up to byte b, as a &str. For ASCII text bytes and characters line up, so &"hello"[1..4] is "ell".',
        'The positions are byte offsets, not char counts. In "éa", é fills bytes 0 and 1, so &text[0..2] is "é" and &text[2..] is "a". A range that cuts into the middle of a char, such as &text[0..1], panics when the program runs.',
      ],
      example: {
        language: 'rust',
        code: 'fn main() {\n    let text = "éclat";\n    println!("{:?} {:?}", &text[0..2], &text[2..5]);\n}',
        output: '"é" "cla"',
        explanation:
          'é occupies bytes 0 and 1, so 0..2 is exactly é. c, l, and a sit at bytes 2, 3, and 4.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn main() {\n    let s = "rustacean";\n    println!("{}", &s[4..8]);\n}',
          ['stac', 'acea', 'acean', 'tace'],
          1,
          'Bytes 4 through 7 hold a, c, e, and a; byte 8 is excluded.',
        ),
        choose(
          'What happens when this program runs?',
          [
            'It prints di',
            'It prints dí',
            'It fails to compile: í is two bytes',
            'It panics: byte 2 is inside í',
          ],
          3,
          'í takes bytes 1 and 2, so ending a slice at byte 2 would split it, and indexing panics.',
          'fn main() {\n    let s = "día";\n    println!("{}", &s[0..2]);\n}',
        ),
        predictOutput(
          'What is printed?',
          'fn main() {\n    let s = "mañana";\n    println!("{} {}", &s[0..2], &s[4..]);\n}',
          ['ma ñana', 'mañ ana', 'ma ana', 'ma nana'],
          2,
          'ñ fills bytes 2 and 3, so byte 4 is the a after it; &s[4..] is ana.',
        ),
        choose(
          'In "ñu", which pair of byte ranges can be sliced without a panic?',
          ['0..1 and 1..3', '0..1 and 1..2', '1..2 and 2..3', '0..2 and 2..3'],
          3,
          'ñ takes bytes 0 and 1 and u is byte 2, so the only cut points are 0, 2, and 3.',
        ),
      ],
    },
    {
      title: 'Use get for a range that may not fit',
      explanation: [
        'text.get(a..b) asks for the same slice but returns an Option<&str>: Some(slice) when both ends land on char boundaries within the text, and None when an end splits a char or lies past the end. It never panics.',
        'Use get whenever the byte positions come from outside the program or from arithmetic, and are not known to be boundaries.',
      ],
      example: {
        language: 'rust',
        code: 'fn main() {\n    let text = "éx";\n    println!("{:?} {:?}", text.get(0..2), text.get(0..1));\n    println!("{:?}", text.get(1..9));\n}',
        output: 'Some("é") None\nNone',
        explanation:
          '0..2 covers exactly é. 0..1 ends inside é, and 1..9 starts inside é and runs past the end, so both give None.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn main() {\n    let s = "hello";\n    println!("{:?} {:?}", s.get(1..3), s.get(3..8));\n}',
          [
            'Some("el") None',
            'Some("ell") None',
            'Some("el") Some("lo")',
            '"el" None',
          ],
          0,
          '1..3 is e and l. The string has only 5 bytes, so 3..8 is out of range and gives None rather than a shorter slice.',
        ),
        predictOutput(
          'What is printed?',
          'fn prefix(text: &str, end: usize) -> Option<&str> {\n    text.get(..end)\n}\n\nfn main() {\n    let s = "añb";\n    println!("{:?} {:?} {:?}", prefix(s, 1), prefix(s, 2), prefix(s, 3));\n}',
          [
            'Some("a") Some("añ") Some("añb")',
            'Some("a") Some("a") Some("añ")',
            'Some("a") None None',
            'Some("a") None Some("añ")',
          ],
          3,
          'ñ occupies bytes 1 and 2. Ending at 2 splits it, so that prefix is None; ending at 3 includes all of ñ.',
        ),
        choose(
          'Byte position i comes from user input. Why prefer text.get(..i) over &text[..i]?',
          [
            'get counts chars instead of bytes',
            'get returns None for a bad position instead of panicking',
            'get copies the text into a new String',
            'get moves i back to the nearest char boundary',
          ],
          1,
          'Both use byte positions; the difference is that get reports a bad position as None.',
        ),
        predictOutput(
          'What does this program output?',
          'fn main() {\n    let s = "ok";\n    println!("{:?} {:?} {:?}", s.get(2..), s.get(0..0), s.get(3..));\n}',
          [
            'None None None',
            'None Some("") None',
            'Some("") None None',
            'Some("") Some("") None',
          ],
          3,
          'Position 2 is the end of the text, a valid boundary, so 2.. and 0..0 give empty slices. Position 3 is past the end.',
        ),
      ],
    },
    {
      title: 'Check a position with is_char_boundary',
      explanation: [
        'text.is_char_boundary(i) returns true when byte i is a place where slicing is allowed: the start of a char, or exactly text.len() at the end. It returns false for a position inside a char or past the end.',
      ],
      example: {
        language: 'rust',
        code: 'fn main() {\n    let s = "hé!";\n    for i in 0..6 {\n        println!("{} {}", i, s.is_char_boundary(i));\n    }\n}',
        output: '0 true\n1 true\n2 false\n3 true\n4 true\n5 false',
        explanation:
          'h is byte 0, é is bytes 1 and 2, and ! is byte 3, so 2 is inside é. 4 is the end of the text, and 5 is past it.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn main() {\n    let s = "añ";\n    let a = s.is_char_boundary(1);\n    let b = s.is_char_boundary(2);\n    let c = s.is_char_boundary(3);\n    println!("{} {} {}", a, b, c);\n}',
          [
            'true true false',
            'true false true',
            'false true true',
            'true false false',
          ],
          1,
          'ñ starts at byte 1 and ends at byte 2, so 2 is inside it. 3 is the end of the string, which is a boundary.',
        ),
        predictOutput(
          'What is printed?',
          'fn safe_cut(text: &str, i: usize) -> &str {\n    if text.is_char_boundary(i) {\n        &text[..i]\n    } else {\n        text\n    }\n}\n\nfn main() {\n    println!("{} {}", safe_cut("göal", 2), safe_cut("göal", 3));\n}',
          ['g gö', 'gö göa', 'göal gö', 'g göal'],
          2,
          'Byte 2 is inside ö, so the first call returns the whole text. Byte 3 starts a, so the cut keeps gö.',
        ),
        choose(
          'For text = "€" (3 bytes), which positions does is_char_boundary accept?',
          ['0, 1, 2, and 3', '0 and 3', 'Only 0', '0 and 1'],
          1,
          'The single char fills bytes 0 to 2, so only its start and the end of the string are boundaries.',
        ),
        predictOutput(
          'What does this program output?',
          'fn main() {\n    let s = "aé€";\n    let mut count = 0;\n    for i in 0..=s.len() {\n        if s.is_char_boundary(i) {\n            count += 1;\n        }\n    }\n    println!("{} {}", s.len(), count);\n}',
          ['6 4', '6 3', '3 4', '6 7'],
          0,
          'The string has 6 bytes. The boundaries are 0, 1, and 3, where chars start, plus the end at 6.',
        ),
      ],
    },
    {
      title: 'Cut after n chars without splitting one',
      explanation: [
        'To keep the first n characters, add up len_utf8 for the first n chars to find the byte where the cut goes. That position always falls on a char boundary, so slicing there is safe.',
        'When the end position comes from anywhere else, get(..end) gives Some or None instead of risking a panic.',
      ],
      example: {
        language: 'rust',
        code: 'fn first_chars(text: &str, n: usize) -> &str {\n    let mut end = 0;\n    let mut taken = 0;\n    for c in text.chars() {\n        if taken < n {\n            end += c.len_utf8();\n            taken += 1;\n        }\n    }\n    &text[..end]\n}\n\nfn main() {\n    println!("{:?} {:?}", first_chars("crème", 3), first_chars("ok", 5));\n}',
        output: '"crè" "ok"',
        explanation:
          'c, r, and è take 1 + 1 + 2 = 4 bytes, so the cut is at byte 4. ok has fewer than 5 chars, so end reaches the full length.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn byte_end(text: &str, n: usize) -> usize {\n    let mut end = 0;\n    let mut taken = 0;\n    for c in text.chars() {\n        if taken < n {\n            end += c.len_utf8();\n            taken += 1;\n        }\n    }\n    end\n}\n\nfn main() {\n    println!("{} {}", byte_end("añob", 2), byte_end("añob", 9));\n}',
          ['2 4', '2 5', '3 5', '3 4'],
          2,
          'a and ñ take 1 + 2 = 3 bytes. Asking for 9 chars covers the whole text, which is 5 bytes.',
        ),
        predictOutput(
          'What is printed?',
          'fn main() {\n    let s = "€uro";\n    let n = \'€\'.len_utf8();\n    println!("{:?} {:?}", s.get(..n), s.get(..1));\n}',
          [
            'Some("€u") Some("€")',
            'None None',
            'Some("€") Some("")',
            'Some("€") None',
          ],
          3,
          '€ is 3 bytes, so ..3 is exactly €. Ending at byte 1 splits €, so get returns None.',
        ),
        choose(
          'A function wants the first 4 characters of any text. At which byte position should it slice?',
          [
            '4, since each char is one byte',
            'The sum of len_utf8 over the first 4 chars',
            'text.len() / 4',
            'text.chars().count() - 4',
          ],
          1,
          'Characters can be 1 to 4 bytes wide, so the cut point is the total width of the chars being kept.',
        ),
        predictOutput(
          'What does this program output?',
          'fn main() {\n    let s = "日本語";\n    let a = s.get(..3);\n    let b = s.get(..4);\n    let c = s.get(3..6);\n    println!("{:?} {:?} {:?}", a, b, c);\n}',
          [
            'Some("日本語") None Some("本")',
            'Some("日") None Some("本")',
            'Some("日") Some("日") Some("本")',
            'Some("日") None Some("語")',
          ],
          1,
          'Each character is 3 bytes, so boundaries fall at 0, 3, 6, and 9; byte 4 is inside 本.',
        ),
      ],
    },
  ],
  'rust-struct-fields': [
    {
      title: 'Build a struct value and read its fields',
      explanation: [
        '`struct Size { width: i32, height: i32 }` declares a new type that groups named fields. A struct literal such as `Size { width: 2, height: 5 }` creates a value, and `s.width` reads one field from it.',
        'Values in a literal attach to fields by name, so the fields can be written in any order.',
      ],
      example: {
        language: 'rust',
        code: 'struct Size {\n    width: i32,\n    height: i32,\n}\n\nfn main() {\n    let s = Size {\n        height: 5,\n        width: 2,\n    };\n    println!("{}", s.width);\n    println!("{}", s.height);\n}',
        output: '2\n5',
        explanation:
          'The literal lists height first, but each value goes to the field it is named with, so width is 2 and height is 5.',
      },
      questions: [
        predictOutput(
          'Which number does this program print?',
          'struct Ticket {\n    row: i32,\n    seat: i32,\n}\n\nfn main() {\n    let t = Ticket { seat: 14, row: 3 };\n    println!("{}", t.row);\n}',
          ['14', '17', '3', '0'],
          2,
          'Values attach to fields by name, so row is 3 even though seat is written first.',
        ),
        predictOutput(
          'What does this program print?',
          'struct Rect {\n    w: i32,\n    h: i32,\n}\n\nfn main() {\n    let r = Rect { w: 4, h: 6 };\n    println!("{}", r.w * r.h + r.w);\n}',
          ['28', '24', '40', '10'],
          0,
          'r.w * r.h is 24, and adding r.w gives 28; the multiplication happens before the addition.',
        ),
        predictOutput(
          'Two values of the same struct type are created. What is printed?',
          'struct Point {\n    x: i32,\n    y: i32,\n}\n\nfn main() {\n    let a = Point { x: 1, y: 2 };\n    let b = Point { x: 10, y: 20 };\n    println!("{}", a.x + b.y);\n}',
          ['3', '30', '12', '21'],
          3,
          'Each value has its own fields: a.x is 1 and b.y is 20.',
        ),
        choose(
          'Given `let s = Score { home: 2, away: 5 };`, which expression reads the away score?',
          ['s.away', 'Score.away', 's[1]', 's->away'],
          0,
          'A field is read from a value with a dot followed by the field name.',
        ),
      ],
    },
    {
      title: 'Give every field a value',
      explanation: [
        'A struct literal must give a value to every field the struct declares. Rust never fills a missing field with 0 or anything else: leaving one out is a compile error, even if the program never reads that field.',
        'Naming a field that the struct does not declare is a compile error too.',
      ],
      example: {
        language: 'rust',
        code: 'struct Account {\n    id: i32,\n    balance: i32,\n    limit: i32,\n}\n\nfn main() {\n    let acct = Account {\n        id: 7,\n        balance: 0,\n        limit: 500,\n    };\n    println!("{}", acct.limit - acct.balance);\n}',
        output: '500',
        explanation:
          'balance has to be written out even though it is 0. With all three fields given, the literal compiles and limit - balance is 500.',
      },
      questions: [
        choose(
          'What happens when this program is compiled and run?',
          [
            'It prints 5; y defaults to 0',
            'It prints 5; y is never read, so it may be left out',
            'It fails to compile: field y is missing',
            'It compiles, then panics because y was never set',
          ],
          2,
          'Every field must be given in the literal; the missing y is a compile error whether or not it is read.',
          'struct Point {\n    x: i32,\n    y: i32,\n}\n\nfn main() {\n    let p = Point { x: 5 };\n    println!("{}", p.x);\n}',
        ),
        choose(
          'Which literal is valid for `struct Pair { a: i32, b: i32 }`?',
          [
            'Pair { a: 1 }',
            'Pair { 1, 2 }',
            'Pair { b: 2, a: 1 }',
            'Pair { a: 1, b: 2, c: 3 }',
          ],
          2,
          'Both fields are given by name, and their order in the literal does not matter.',
        ),
        choose(
          'A field `z: i32` is added to a struct that already has x and y. What happens to an existing line `let p = Point { x: 1, y: 2 };`?',
          [
            'It stops compiling until the literal gives z a value',
            'It still compiles, with z set to 0',
            'It compiles, and z copies the value of y',
            'It compiles, but reading p.z panics',
          ],
          0,
          'Every literal must now give z a value; Rust does not supply defaults for missing fields.',
        ),
        predictOutput(
          'This literal gives every field, one of them zero. What is printed?',
          'struct Stock {\n    item: i32,\n    count: i32,\n    reserved: i32,\n}\n\nfn main() {\n    let s = Stock {\n        item: 42,\n        reserved: 0,\n        count: 9,\n    };\n    println!("{}", s.count - s.reserved + s.item);\n}',
          ['9', '42', '33', '51'],
          3,
          'All three fields are set by name: 9 - 0 + 42 is 51.',
        ),
      ],
    },
    {
      title: 'Change a field through a mut binding',
      explanation: [
        'Assigning to a field, as in `c.hits = 3;` or `c.hits += 1;`, changes the value held by that binding, so the binding must be declared with `let mut`. Rust has no per-field mut: without mut on the binding, every field is read-only.',
        'Fields you do not assign keep their values.',
      ],
      example: {
        language: 'rust',
        code: 'struct Counter {\n    hits: i32,\n    misses: i32,\n}\n\nfn main() {\n    let mut c = Counter { hits: 0, misses: 0 };\n    c.hits += 1;\n    c.hits += 1;\n    c.misses = 5;\n    println!("{}", c.hits);\n    println!("{}", c.misses);\n}',
        output: '2\n5',
        explanation:
          'c is declared mut, so its fields can change: hits goes from 0 to 2 and misses is set to 5.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'struct Point {\n    x: i32,\n    y: i32,\n}\n\nfn main() {\n    let mut p = Point { x: 2, y: 3 };\n    p.x = p.y * 4;\n    p.y = p.x - 1;\n    println!("{}", p.y);\n}',
          ['11', '1', '12', '2'],
          0,
          'Statements run in order: p.x becomes 12 first, so p.y becomes 12 - 1 = 11.',
        ),
        predictOutput(
          'What does this program print?',
          'struct Wallet {\n    coins: i32,\n    notes: i32,\n}\n\nfn main() {\n    let mut w = Wallet {\n        coins: 10,\n        notes: 2,\n    };\n    w.coins -= 3;\n    w.notes *= 5;\n    println!("{}", w.coins + w.notes);\n}',
          ['12', '9', '20', '17'],
          3,
          'coins drops to 7 and notes becomes 10, so the sum is 17.',
        ),
        choose(
          'What happens when this program is compiled?',
          [
            'It prints 5',
            'It prints 1, ignoring the assignment',
            'It fails to compile: p is not declared mut',
            'It fails to compile: x must be marked mut in the struct',
          ],
          2,
          'Assigning to p.x changes p, which needs `let mut p`; individual fields cannot be marked mut.',
          'struct Point {\n    x: i32,\n    y: i32,\n}\n\nfn main() {\n    let p = Point { x: 1, y: 1 };\n    p.x = 5;\n    println!("{}", p.x);\n}',
        ),
        choose(
          'You want to change only the score field of a struct value. What must be declared mutable?',
          [
            'The binding that holds the whole value',
            'Only the score field, inside the struct definition',
            'Every field of the struct',
            'Nothing, since fields are always writable',
          ],
          0,
          'Mutability belongs to the binding; `let mut` allows assigning any of its fields.',
        ),
      ],
    },
    {
      title: 'Use field shorthand when names match',
      explanation: [
        'When a variable or parameter has the same name as a field, you can write the name once: `Rect { width, height }` means `Rect { width: width, height: height }`. Shorthand and `field: value` pairs can be mixed in one literal.',
        'A function can build a struct this way and return it, with the struct type as its return type.',
      ],
      example: {
        language: 'rust',
        code: 'struct Rect {\n    width: i32,\n    height: i32,\n}\n\nfn make_rect(width: i32, height: i32) -> Rect {\n    Rect { width, height }\n}\n\nfn main() {\n    let r = make_rect(3, 7);\n    println!("{}", r.width * r.height);\n}',
        output: '21',
        explanation:
          'The parameters width and height fill the fields with the same names, so the area is 3 * 7 = 21.',
      },
      questions: [
        predictOutput(
          'The parameters are listed in a different order than the fields. What is printed?',
          'struct Rect {\n    width: i32,\n    height: i32,\n}\n\nfn make(height: i32, width: i32) -> Rect {\n    Rect { width, height }\n}\n\nfn main() {\n    let r = make(2, 9);\n    println!("{}", r.width);\n}',
          ['2', '9', '18', '11'],
          1,
          'Shorthand matches by name: the parameter width receives 9, the second argument.',
        ),
        predictOutput(
          'What does this program print?',
          'struct Point {\n    x: i32,\n    y: i32,\n}\n\nfn main() {\n    let x = 4;\n    let p = Point { x, y: x * 2 };\n    println!("{}", p.y - p.x);\n}',
          ['8', '0', '-4', '4'],
          3,
          'The shorthand x sets the x field to 4, and y is given explicitly as 8; 8 - 4 is 4.',
        ),
        choose(
          'A function has parameters `w: i32` and `h: i32`. Why does `Rect { width, height }` fail to compile inside it?',
          [
            'Shorthand only works for the first field',
            'No variables named width and height exist to supply the values',
            'Struct literals cannot appear inside functions',
            'Shorthand needs the variables to be declared mut',
          ],
          1,
          'Shorthand looks for variables with the field names; here write `Rect { width: w, height: h }`.',
        ),
        predictOutput(
          'What does this program print?',
          'struct Rect {\n    width: i32,\n    height: i32,\n}\n\nfn main() {\n    let height = 5;\n    let mut width = 2;\n    width += height;\n    let r = Rect { height, width };\n    println!("{}", r.width);\n}',
          ['7', '2', '5', '10'],
          0,
          'Shorthand uses the current value of width, which is 7 after `width += height`.',
        ),
      ],
    },
  ],
  'rust-tuple-structs': [
    {
      title: 'Build a tuple struct and read fields by position',
      explanation: [
        '`struct Color(i32, i32, i32);` declares a type whose fields have positions instead of names. Build a value with `Color(0, 128, 128)` and read a field with `.0`, `.1`, or `.2`, counting from zero as with a tuple.',
        'The fields may have different types, as in `struct Reading(i32, bool);`.',
      ],
      example: {
        language: 'rust',
        code: 'struct Color(i32, i32, i32);\n\nfn main() {\n    let teal = Color(0, 128, 128);\n    println!("{} {}", teal.0, teal.2);\n}',
        output: '0 128',
        explanation:
          '.0 is the first field and .2 is the third, so the program prints 0 and 128.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'struct Pair(i32, i32);\n\nfn main() {\n    let p = Pair(8, 3);\n    println!("{}", p.1 - p.0);\n}',
          ['-5', '5', '11', '3'],
          0,
          'p.1 is 3 and p.0 is 8, so p.1 - p.0 is -5.',
        ),
        predictOutput(
          'What does this program print?',
          'struct Reading(i32, bool);\n\nfn main() {\n    let r = Reading(21, false);\n    println!("{} {}", r.1, r.0);\n}',
          ['21 false', 'true 21', 'false 21', '21 true'],
          2,
          'r.1 is the second field, false, and it is printed first.',
        ),
        predictOutput(
          'What does this program print?',
          'struct Triple(i32, i32, i32);\n\nfn main() {\n    let t = Triple(4, 5, 6);\n    println!("{}", t.0 + t.2);\n}',
          ['9', '11', '15', '10'],
          3,
          'Positions start at 0, so t.0 is 4 and t.2 is 6.',
        ),
        choose(
          'For `struct Size(i32, i32);` and `let s = Size(5, 9);`, which expression gives 9?',
          ['s.1', 's.2', 's[1]', 's.y'],
          0,
          'Tuple struct fields are numbered from .0, so the second field is s.1.',
        ),
      ],
    },
    {
      title: 'Tell apart types that wrap the same data',
      explanation: [
        'Two tuple structs with the same field types are still different types, and neither is the plain tuple type. A function that takes `Cents` will not accept a `Count`, even though both wrap one i32.',
        'Wrapping a number in a named type lets the compiler catch an argument passed in the wrong role.',
      ],
      example: {
        language: 'rust',
        code: 'struct Cents(i32);\nstruct Count(i32);\n\nfn total(price: Cents, qty: Count) -> i32 {\n    price.0 * qty.0\n}\n\nfn main() {\n    println!("{}", total(Cents(250), Count(3)));\n}',
        output: '750',
        explanation:
          'Each argument has the type the function asks for, so it compiles and multiplies 250 by 3. Writing total(Count(3), Cents(250)) would not compile.',
      },
      questions: [
        choose(
          'What happens when this program is compiled?',
          [
            'It prints 750, since multiplication order does not matter',
            'It fails to compile: the arguments have the wrong types',
            'It prints 750 after Rust reorders the arguments by type',
            'It prints 3',
          ],
          1,
          'Count and Cents are distinct types, so passing them in swapped positions is a type error.',
          'struct Cents(i32);\nstruct Count(i32);\n\nfn total(price: Cents, qty: Count) -> i32 {\n    price.0 * qty.0\n}\n\nfn main() {\n    println!("{}", total(Count(3), Cents(250)));\n}',
        ),
        choose(
          '`struct Celsius(i32);` and `struct Fahrenheit(i32);` both wrap one i32. A function takes a Celsius. Can you pass it a Fahrenheit?',
          [
            'Yes, because both hold one i32',
            'Yes, if the two numbers are equal',
            'No, they are different types',
            'Only if the value is declared mut',
          ],
          2,
          'Matching field types do not make two structs the same type.',
        ),
        predictOutput(
          'What does this program print?',
          'struct Width(i32);\n\nfn grow(w: Width) -> Width {\n    Width(w.0 + 2)\n}\n\nfn main() {\n    let w = grow(grow(Width(1)));\n    println!("{}", w.0);\n}',
          ['3', '1', '5', '4'],
          2,
          'Each call builds a new Width two larger: 1 becomes 3, then 5.',
        ),
        predictOutput(
          'What does this program print?',
          'struct Price(i32);\nstruct Discount(i32);\n\nfn final_price(p: Price, d: Discount) -> i32 {\n    p.0 - d.0\n}\n\nfn main() {\n    println!("{}", final_price(Price(80), Discount(15)));\n}',
          ['95', '65', '-65', '80'],
          1,
          'The types fix the roles: 80 is the price and 15 the discount, giving 65.',
        ),
        choose(
          'A function takes `(i32, i32)`. What happens if you pass `Point(1, 2)`, where `struct Point(i32, i32);`?',
          [
            'It fails to compile: Point is not the type (i32, i32)',
            'It is accepted, since the fields match',
            'Only the first field is passed',
            'It is converted to (1, 2) automatically',
          ],
          0,
          'A tuple struct is its own named type; build a tuple such as (p.0, p.1) when a tuple is needed.',
        ),
      ],
    },
    {
      title: 'Unpack and rebuild tuple structs',
      explanation: [
        '`let Point(x, y) = p;` unpacks a tuple struct into variables, the same way `let (a, b) = t;` unpacks a tuple. Functions can take a tuple struct, read or unpack its fields, and return a new one built from them.',
        'Your own struct cannot be printed with {:?} yet, but a tuple made from its fields can.',
      ],
      example: {
        language: 'rust',
        code: 'struct Point(i32, i32);\n\nfn shift(p: Point, dx: i32) -> Point {\n    Point(p.0 + dx, p.1)\n}\n\nfn main() {\n    let moved = shift(Point(2, 5), 3);\n    let Point(x, y) = moved;\n    println!("{:?}", (x, y));\n}',
        output: '(5, 5)',
        explanation:
          'shift returns Point(5, 5). The let pattern unpacks it into x and y, and the tuple (x, y) prints in Debug form.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'struct Point(i32, i32);\n\nfn to_tuple(p: Point) -> (i32, i32) {\n    (p.1, p.0)\n}\n\nfn main() {\n    println!("{:?}", to_tuple(Point(7, 2)));\n}',
          ['(7, 2)', 'Point(2, 7)', '[2, 7]', '(2, 7)'],
          3,
          'The function puts p.1 first, so the tuple is (2, 7); it is a plain tuple, so no Point name appears.',
        ),
        predictOutput(
          'What does this program print?',
          'struct Pair(i32, i32);\n\nfn main() {\n    let Pair(a, b) = Pair(6, 1);\n    println!("{} {}", b, a);\n}',
          ['1 6', '6 1', '1 1', '6 6'],
          0,
          'The pattern binds a to 6 and b to 1, and b is printed first.',
        ),
        predictOutput(
          'What does this program print?',
          'struct Range(i32, i32);\n\nfn widen(r: Range, by: i32) -> Range {\n    let Range(lo, hi) = r;\n    Range(lo - by, hi + by)\n}\n\nfn main() {\n    let r = widen(Range(3, 5), 2);\n    println!("{:?}", (r.0, r.1));\n}',
          ['(5, 7)', '(1, 3)', '(1, 7)', '(3, 5)'],
          2,
          'lo is 3 and hi is 5; the new Range moves each end outward by 2.',
        ),
        choose(
          'A program declares `struct Point(i32, i32);` and nothing else for it. Which line prints the fields of `let p = Point(1, 2);` in Debug form?',
          [
            'println!("{:?}", p);',
            'println!("{:?}", (p.0, p.1));',
            'println!("{}", p);',
            'println!("{:?}", Point);',
          ],
          1,
          'A newly declared struct has no Debug form, but a tuple of its i32 fields does.',
        ),
      ],
    },
  ],
  'rust-derive': [
    {
      title: 'Derive Debug to print a struct',
      explanation: [
        'A struct you declare cannot be printed with {:?} until it implements the Debug trait. Writing `#[derive(Debug)]` on the line above the struct makes the compiler generate that code.',
        'The Debug form is the type name followed by each field as `name: value`, in the order the struct declares them. String fields keep their quotes.',
      ],
      example: {
        language: 'rust',
        code: '#[derive(Debug)]\nstruct Player {\n    name: String,\n    level: i32,\n}\n\nfn main() {\n    let p = Player {\n        level: 4,\n        name: String::from("Ana"),\n    };\n    println!("{:?}", p);\n}',
        output: 'Player { name: "Ana", level: 4 }',
        explanation:
          'The literal sets level first, but Debug lists the fields in declaration order, and the String prints with quotes.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          '#[derive(Debug)]\nstruct Point {\n    x: i32,\n    y: i32,\n}\n\nfn main() {\n    println!("{:?}", Point { y: -2, x: 5 });\n}',
          [
            'Point { x: 5, y: -2 }',
            'Point { y: -2, x: 5 }',
            '(5, -2)',
            'Point(5, -2)',
          ],
          0,
          'Fields print in the order the struct declares them, x and then y.',
        ),
        predictOutput(
          'What does this program print?',
          '#[derive(Debug)]\nstruct Tag {\n    label: String,\n    id: i32,\n}\n\nfn main() {\n    let t = Tag {\n        label: String::from("new"),\n        id: 3,\n    };\n    println!("{:?}", t);\n}',
          [
            'Tag { label: "new", id: 3 }',
            'Tag { label: new, id: 3 }',
            '{ label: "new", id: 3 }',
            'Tag { "new", 3 }',
          ],
          0,
          'Debug shows the type name and every field name, and the String keeps its quotes.',
        ),
        choose(
          'What happens when this program is compiled?',
          [
            'It prints Point { x: 1, y: 2 }',
            'It prints Point',
            'It prints (1, 2)',
            'It fails to compile: Point does not implement Debug',
          ],
          3,
          'Without #[derive(Debug)] the struct has no Debug form, so {:?} is rejected at compile time.',
          'struct Point {\n    x: i32,\n    y: i32,\n}\n\nfn main() {\n    let p = Point { x: 1, y: 2 };\n    println!("{:?}", p);\n}',
        ),
        predictOutput(
          'What does this program print?',
          '#[derive(Debug)]\nstruct Line {\n    from: (i32, i32),\n    to: (i32, i32),\n}\n\nfn main() {\n    let l = Line {\n        from: (0, 0),\n        to: (3, 4),\n    };\n    println!("{:?}", l);\n}',
          [
            'Line((0, 0), (3, 4))',
            'Line { (0, 0), (3, 4) }',
            'Line { from: (0, 0), to: (3, 4) }',
            '{ from: (0, 0), to: (3, 4) }',
          ],
          2,
          'Each tuple field prints in its own Debug form inside the struct’s braces.',
        ),
      ],
    },
    {
      title: 'Derive PartialEq to compare with ==',
      explanation: [
        'Comparing two struct values with == needs the PartialEq trait. `#[derive(PartialEq)]` compares field by field: two values are equal only when every field is equal, and != comes with it.',
        'Several traits share one attribute, as in `#[derive(Debug, PartialEq)]`.',
      ],
      example: {
        language: 'rust',
        code: '#[derive(Debug, PartialEq)]\nstruct Version {\n    major: i32,\n    minor: i32,\n}\n\nfn main() {\n    let installed = Version { major: 1, minor: 4 };\n    let required = Version { major: 1, minor: 5 };\n    println!("{}", installed == required);\n    println!("{}", installed.major == required.major);\n}',
        output: 'false\ntrue',
        explanation:
          'minor differs (4 against 5), so the whole values are unequal, even though their major fields are equal.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          '#[derive(PartialEq)]\nstruct Size {\n    w: i32,\n    h: i32,\n}\n\nfn main() {\n    let a = Size { w: 3, h: 4 };\n    let b = Size { h: 4, w: 3 };\n    println!("{} {}", a == b, a != b);\n}',
          ['true false', 'false true', 'true true', 'false false'],
          0,
          'Every field has the same value; the order of the literal does not matter, so == is true and != is false.',
        ),
        predictOutput(
          'What does this program print?',
          '#[derive(PartialEq)]\nstruct Card {\n    suit: String,\n    rank: i32,\n}\n\nfn main() {\n    let a = Card {\n        suit: String::from("hearts"),\n        rank: 10,\n    };\n    let b = Card {\n        suit: String::from("Hearts"),\n        rank: 10,\n    };\n    println!("{} {}", a == b, a.rank == b.rank);\n}',
          ['true true', 'false false', 'true false', 'false true'],
          3,
          '"hearts" and "Hearts" are different Strings, so the cards differ even though their ranks match.',
        ),
        choose(
          'What happens when this program is compiled?',
          [
            'It prints true',
            'It prints false, since a and b are separate values',
            'It fails to compile: Point does not implement PartialEq',
            'It compares only the first field',
          ],
          2,
          'Debug only adds printing; == needs PartialEq, which is not derived here.',
          '#[derive(Debug)]\nstruct Point {\n    x: i32,\n    y: i32,\n}\n\nfn main() {\n    let a = Point { x: 1, y: 2 };\n    let b = Point { x: 1, y: 2 };\n    println!("{}", a == b);\n}',
        ),
        predictOutput(
          'What does this program print?',
          '#[derive(PartialEq)]\nstruct Point {\n    x: i32,\n    y: i32,\n}\n\nfn main() {\n    let mut a = Point { x: 1, y: 1 };\n    let b = Point { x: 1, y: 2 };\n    a.y += 1;\n    println!("{} {}", a == b, a != Point { x: 1, y: 1 });\n}',
          ['false true', 'true false', 'true true', 'false false'],
          2,
          'After a.y += 1, a has the same fields as b, and it no longer equals Point { x: 1, y: 1 }.',
        ),
      ],
    },
    {
      title: 'Derive Clone to make an independent copy',
      explanation: [
        'Assigning a struct value to another binding moves it, String fields and all, so the original can no longer be used. `#[derive(Clone)]` adds a `.clone()` method that duplicates every field, cloning the Strings too, so you get a second value with its own data.',
        'Changing the clone afterwards leaves the original as it was.',
      ],
      example: {
        language: 'rust',
        code: '#[derive(Debug, Clone)]\nstruct Draft {\n    title: String,\n    words: i32,\n}\n\nfn main() {\n    let original = Draft {\n        title: String::from("Notes"),\n        words: 120,\n    };\n    let mut copy = original.clone();\n    copy.words += 30;\n    copy.title.push_str(" v2");\n    println!("{:?}", original);\n    println!("{:?}", copy);\n}',
        output:
          'Draft { title: "Notes", words: 120 }\nDraft { title: "Notes v2", words: 150 }',
        explanation:
          'copy owns its own title and words, so push_str and += change only copy.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          '#[derive(Clone)]\nstruct Counter {\n    n: i32,\n}\n\nfn main() {\n    let a = Counter { n: 5 };\n    let mut b = a.clone();\n    b.n *= 2;\n    println!("{} {}", a.n, b.n);\n}',
          ['10 10', '5 5', '5 10', '10 5'],
          2,
          'b is a separate copy, so doubling b.n leaves a.n at 5.',
        ),
        choose(
          'What happens when this program is compiled?',
          [
            'It prints hi',
            'It fails to compile: a was moved into b',
            'It prints an empty line',
            'It fails to compile: Note does not implement Debug',
          ],
          1,
          'Assigning a to b moves the whole value, String included. Deriving Clone and writing a.clone() would keep a usable.',
          'struct Note {\n    text: String,\n}\n\nfn main() {\n    let a = Note {\n        text: String::from("hi"),\n    };\n    let b = a;\n    println!("{}", a.text);\n}',
        ),
        predictOutput(
          'What does this program print?',
          '#[derive(Clone, PartialEq)]\nstruct Label {\n    text: String,\n    size: i32,\n}\n\nfn main() {\n    let first = Label {\n        text: String::from("ok"),\n        size: 2,\n    };\n    let mut second = first.clone();\n    second.size = 3;\n    println!("{} {}", first == second, first.text == second.text);\n}',
          ['false true', 'true true', 'false false', 'true false'],
          0,
          'The clone starts out equal, but changing size makes the whole values differ; the text fields are still equal.',
        ),
        predictOutput(
          'What does this program print?',
          '#[derive(Debug, Clone)]\nstruct Pet {\n    name: String,\n    age: i32,\n}\n\nfn main() {\n    let a = Pet {\n        name: String::from("Al"),\n        age: 3,\n    };\n    let mut b = a.clone();\n    b.name = String::from("Bo");\n    println!("{:?}", a);\n}',
          [
            'Pet { name: "Bo", age: 3 }',
            'Pet { name: Al, age: 3 }',
            'Pet { name: "AlBo", age: 3 }',
            'Pet { name: "Al", age: 3 }',
          ],
          3,
          'Only the clone b got the new name; a still holds "Al".',
        ),
      ],
    },
    {
      title: 'Combine Debug, Clone, and PartialEq',
      explanation: [
        'Most data structs derive all three: `#[derive(Debug, Clone, PartialEq)]`. Each trait is separate, so leaving one out removes only that ability.',
        'Deriving works field by field: a struct that contains another struct can derive a trait only if the inner struct has it too.',
      ],
      example: {
        language: 'rust',
        code: '#[derive(Debug, Clone, PartialEq)]\nstruct Cell {\n    row: i32,\n    col: i32,\n}\n\nfn main() {\n    let start = Cell { row: 0, col: 0 };\n    let mut cursor = start.clone();\n    cursor.col += 2;\n    println!("{:?} {}", cursor, cursor == start);\n}',
        output: 'Cell { row: 0, col: 2 } false',
        explanation:
          'cursor starts as a clone of start and moves two columns, so it prints with col: 2 and no longer equals start.',
      },
      questions: [
        choose(
          'A struct with an i32 field x derives Debug and Clone but not PartialEq. Given two values a and b of it, which line fails to compile?',
          [
            'let c = a.clone();',
            'println!("{:?}", a);',
            'println!("{}", a.x == b.x);',
            'println!("{}", a == b);',
          ],
          3,
          'Comparing whole values needs PartialEq; comparing two i32 fields does not.',
        ),
        choose(
          'What happens when this program is compiled?',
          [
            'It prints Outer { inner: Inner { v: 1 }, n: 2 }',
            'It fails to compile: Inner does not implement Debug',
            'It prints Outer { n: 2 }, skipping inner',
            'It prints Outer { inner: Inner, n: 2 }',
          ],
          1,
          'Derived Debug prints every field in its own Debug form, so Inner needs #[derive(Debug)] as well.',
          'struct Inner {\n    v: i32,\n}\n\n#[derive(Debug)]\nstruct Outer {\n    inner: Inner,\n    n: i32,\n}\n\nfn main() {\n    let o = Outer {\n        inner: Inner { v: 1 },\n        n: 2,\n    };\n    println!("{:?}", o);\n}',
        ),
        predictOutput(
          'What does this program print?',
          '#[derive(Debug)]\nstruct Inner {\n    v: i32,\n}\n\n#[derive(Debug)]\nstruct Outer {\n    inner: Inner,\n    n: i32,\n}\n\nfn main() {\n    let o = Outer {\n        inner: Inner { v: 1 },\n        n: 2,\n    };\n    println!("{:?}", o);\n}',
          [
            'Outer { inner: Inner { v: 1 }, n: 2 }',
            'Outer { inner: { v: 1 }, n: 2 }',
            'Outer { Inner { v: 1 }, 2 }',
            'Outer { inner: Inner, n: 2 }',
          ],
          0,
          'The inner struct prints in its own Debug form, nested inside the outer one.',
        ),
        predictOutput(
          'What does this program print?',
          '#[derive(Debug, Clone, PartialEq)]\nstruct Score {\n    team: String,\n    pts: i32,\n}\n\nfn main() {\n    let a = Score {\n        team: String::from("red"),\n        pts: 3,\n    };\n    let b = a.clone();\n    let mut c = a.clone();\n    c.pts += 1;\n    println!("{} {} {}", a == b, a == c, b != c);\n}',
          [
            'true true false',
            'true false true',
            'false false true',
            'true false false',
          ],
          1,
          'b is an unchanged clone of a, while c gained a point and so differs from both.',
        ),
      ],
    },
  ],
  'rust-struct-update': [
    {
      title: 'Copy the remaining fields from another value',
      explanation: [
        '`Settings { volume: 1, ..base }` builds a new value. The fields you list take the values you give, and every field you leave out is taken from base.',
        'The `..base` part must come last in the literal, after the changed fields.',
      ],
      example: {
        language: 'rust',
        code: 'struct Settings {\n    volume: i32,\n    brightness: i32,\n    muted: bool,\n}\n\nfn main() {\n    let base = Settings {\n        volume: 5,\n        brightness: 70,\n        muted: false,\n    };\n    let quiet = Settings { volume: 1, ..base };\n    println!("{} {} {}", quiet.volume, quiet.brightness, quiet.muted);\n}',
        output: '1 70 false',
        explanation:
          'Only volume is listed, so brightness and muted are taken from base.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'struct Stats {\n    hp: i32,\n    mp: i32,\n    level: i32,\n}\n\nfn main() {\n    let start = Stats {\n        hp: 10,\n        mp: 4,\n        level: 1,\n    };\n    let next = Stats { level: 2, ..start };\n    println!("{} {} {}", next.hp, next.mp, next.level);\n}',
          ['10 4 1', '0 0 2', '10 4 2', '2 4 1'],
          2,
          'level is given as 2; hp and mp are copied from start.',
        ),
        predictOutput(
          'What does this program print?',
          'struct Point3 {\n    x: i32,\n    y: i32,\n    z: i32,\n}\n\nfn main() {\n    let a = Point3 { x: 1, y: 2, z: 3 };\n    let b = Point3 { x: 9, z: 0, ..a };\n    println!("{:?}", (b.x, b.y, b.z));\n}',
          ['(9, 2, 0)', '(9, 2, 3)', '(1, 2, 3)', '(9, 0, 0)'],
          0,
          'x and z are listed, so only y comes from a.',
        ),
        choose(
          'Which literal builds a copy of base with retries set to 3?',
          [
            'Config { ..base, retries: 3 }',
            'Config { retries: 3, base.. }',
            'Config { retries: 3 } + base',
            'Config { retries: 3, ..base }',
          ],
          3,
          'The changed fields come first and `..base` comes last.',
        ),
        predictOutput(
          'What does this program print?',
          'struct Lamp {\n    on: bool,\n    watts: i32,\n}\n\nfn main() {\n    let lamp = Lamp {\n        on: true,\n        watts: 60,\n    };\n    let off = Lamp { on: false, ..lamp };\n    println!("{} {}", off.on, off.watts);\n}',
          ['false 60', 'true 60', 'false 0', 'true 0'],
          0,
          'on is set to false and watts is filled in from lamp.',
        ),
      ],
    },
    {
      title: 'Leave the base value unchanged',
      explanation: [
        'Update syntax reads from base to build a new value; it does not modify base. When the copied fields are numbers or bools, as here, base stays fully usable afterwards.',
        'After that, changing either value does not affect the other.',
      ],
      example: {
        language: 'rust',
        code: 'struct Window {\n    width: i32,\n    height: i32,\n}\n\nfn main() {\n    let small = Window {\n        width: 300,\n        height: 200,\n    };\n    let wide = Window {\n        width: 800,\n        ..small\n    };\n    println!("{} {}", small.width, wide.width);\n    println!("{} {}", small.height, wide.height);\n}',
        output: '300 800\n200 200',
        explanation:
          'wide gets width 800 and copies height 200, while small keeps its width of 300.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'struct Rect {\n    w: i32,\n    h: i32,\n}\n\nfn main() {\n    let a = Rect { w: 2, h: 3 };\n    let b = Rect { h: 10, ..a };\n    println!("{}", a.h + b.h);\n}',
          ['13', '20', '6', '10'],
          0,
          'a.h is still 3 and b.h is 10.',
        ),
        predictOutput(
          'What does this program print?',
          'struct Rect {\n    w: i32,\n    h: i32,\n}\n\nfn main() {\n    let a = Rect { w: 1, h: 1 };\n    let b = Rect { h: 4, ..a };\n    let c = Rect { w: 5, ..b };\n    println!("{:?}", (c.w, c.h));\n}',
          ['(5, 1)', '(1, 4)', '(1, 1)', '(5, 4)'],
          3,
          'b is w 1, h 4; c takes w = 5 and copies h = 4 from b.',
        ),
        choose(
          'After `let b = Meter { reading: 0, ..a };`, what is a.reading?',
          [
            '0, the same as b.reading',
            'The value it had before',
            'It can no longer be read',
            'It now shares one field with b.reading',
          ],
          1,
          'Update syntax builds b from a without changing a; the new reading is set only on b.',
        ),
        predictOutput(
          'What does this program print?',
          'struct Level {\n    n: i32,\n    lives: i32,\n}\n\nfn main() {\n    let mut base = Level { n: 1, lives: 3 };\n    let next = Level { n: 2, ..base };\n    base.lives = 0;\n    println!("{} {}", next.lives, base.lives);\n}',
          ['0 0', '3 3', '0 3', '3 0'],
          3,
          'next copied lives = 3 when it was built; changing base afterwards does not reach next.',
        ),
      ],
    },
    {
      title: 'Build variations inside functions',
      explanation: [
        'A function can take a value and return a variation of it with update syntax. Field shorthand works in the same literal: `Frame { width, ..base }` takes width from a variable named width and the rest from base.',
        'Each call returns a new value, so calls can be nested to apply several changes.',
      ],
      example: {
        language: 'rust',
        code: 'struct Entry {\n    score: i32,\n    active: bool,\n    rank: i32,\n}\n\nfn deactivated(e: Entry) -> Entry {\n    Entry { active: false, ..e }\n}\n\nfn main() {\n    let start = Entry {\n        score: 40,\n        active: true,\n        rank: 2,\n    };\n    let later = deactivated(Entry { score: 55, ..start });\n    println!("{} {} {}", later.score, later.active, later.rank);\n}',
        output: '55 false 2',
        explanation:
          'The inner literal sets score to 55, deactivated then sets active to false, and rank is copied through both steps.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'struct Player {\n    level: i32,\n    coins: i32,\n}\n\nfn promote(p: Player) -> Player {\n    Player {\n        level: p.level + 1,\n        ..p\n    }\n}\n\nfn main() {\n    let p = promote(promote(Player {\n        level: 1,\n        coins: 50,\n    }));\n    println!("{} {}", p.level, p.coins);\n}',
          ['2 50', '3 52', '3 50', '1 50'],
          2,
          'Each call raises level by one and copies coins, so two calls give level 3.',
        ),
        predictOutput(
          'What does this program print?',
          'struct Frame {\n    width: i32,\n    height: i32,\n}\n\nfn resized(width: i32, base: Frame) -> Frame {\n    Frame { width, ..base }\n}\n\nfn main() {\n    let f = resized(\n        15,\n        Frame {\n            width: 10,\n            height: 20,\n        },\n    );\n    println!("{:?}", (f.width, f.height));\n}',
          ['(15, 20)', '(10, 20)', '(15, 15)', '(10, 15)'],
          0,
          'Shorthand takes width from the parameter, 15, and height comes from base.',
        ),
        predictOutput(
          'What does this program print?',
          'struct Toggle {\n    on: bool,\n    id: i32,\n}\n\nfn main() {\n    let s = Toggle { on: true, id: 7 };\n    let t = Toggle { on: !s.on, ..s };\n    println!("{} {}", s.on && t.on, s.on || t.on);\n}',
          ['true true', 'false false', 'true false', 'false true'],
          3,
          't.on is the negation of s.on, so exactly one of them is true.',
        ),
        choose(
          'Which statement about `let b = Server { port: 9000, ..a };` is true?',
          [
            'Every field of b is 9000',
            'b.port is 9000 and every other field equals a’s',
            'a.port also becomes 9000',
            'b has a port field and no others',
          ],
          1,
          'Listed fields take the new values and every other field is copied from a, which is unchanged.',
        ),
      ],
    },
  ],
  'rust-methods': [
    {
      title: 'Define a method that reads through &self',
      explanation: [
        'Functions inside an `impl Rect { ... }` block belong to the Rect type. A method’s first parameter is a form of self; `&self` borrows the value so the method can read it.',
        'Call a method with a dot, as in `r.area()`, and read fields inside it through self, as in `self.width`. Any other parameters come after self.',
      ],
      example: {
        language: 'rust',
        code: 'struct Rect {\n    width: i32,\n    height: i32,\n}\n\nimpl Rect {\n    fn area(&self) -> i32 {\n        self.width * self.height\n    }\n}\n\nfn main() {\n    let r = Rect {\n        width: 3,\n        height: 5,\n    };\n    println!("{}", r.area());\n}',
        output: '15',
        explanation:
          'r.area() passes r to area as &self, and self.width * self.height is 3 * 5.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'struct Pair(i32, i32);\n\nimpl Pair {\n    fn spread(&self) -> i32 {\n        self.1 - self.0\n    }\n}\n\nfn main() {\n    println!("{}", Pair(3, 10).spread());\n}',
          ['7', '-7', '13', '3'],
          0,
          'self.1 is 10 and self.0 is 3, so the method returns 7.',
        ),
        predictOutput(
          'What does this program print?',
          'struct Rect {\n    width: i32,\n    height: i32,\n}\n\nimpl Rect {\n    fn scaled_area(&self, k: i32) -> i32 {\n        self.width * k * self.height * k\n    }\n}\n\nfn main() {\n    let r = Rect {\n        width: 2,\n        height: 3,\n    };\n    println!("{}", r.scaled_area(2));\n}',
          ['12', '48', '24', '6'],
          2,
          'k is the argument 2, so the sides become 4 and 6, giving 24.',
        ),
        predictOutput(
          'What does this program print?',
          'struct Square(i32);\n\nimpl Square {\n    fn side(&self) -> i32 {\n        self.0\n    }\n\n    fn perimeter(&self) -> i32 {\n        self.side() * 4\n    }\n}\n\nfn main() {\n    println!("{}", Square(6).perimeter());\n}',
          ['36', '6', '10', '24'],
          3,
          'perimeter calls self.side(), which returns 6, and multiplies it by 4.',
        ),
        choose(
          'Inside a method declared `fn total(&self) -> i32`, how do you read the field count?',
          ['self.count', 'count', 'Self.count', 'total.count'],
          0,
          'Fields are reached through the self parameter.',
        ),
      ],
    },
    {
      title: 'Borrow with &self or consume with self',
      explanation: [
        'A method taking `&self` only borrows the value, so you can call it again and keep using the value. A method taking `self` without & takes ownership: the value moves into the call and cannot be used afterwards.',
        'Choose &self for a method that only calculates from the fields.',
      ],
      example: {
        language: 'rust',
        code: 'struct Name(String);\n\nimpl Name {\n    fn length(&self) -> usize {\n        self.0.len()\n    }\n\n    fn into_text(self) -> String {\n        self.0\n    }\n}\n\nfn main() {\n    let n = Name(String::from("Rosa"));\n    println!("{} {}", n.length(), n.length());\n    let text = n.into_text();\n    println!("{}", text);\n}',
        output: '4 4\nRosa',
        explanation:
          'length borrows n, so it can be called twice. into_text takes n and returns its String, so n is used up after that line.',
      },
      questions: [
        choose(
          'What happens when this program is compiled?',
          [
            'It prints 4',
            'It prints 0',
            'It fails to compile: n was moved by into_text',
            'It fails to compile: length must take self',
          ],
          2,
          'into_text takes self, so n moves into that call and cannot be borrowed afterwards.',
          'struct Name(String);\n\nimpl Name {\n    fn length(&self) -> usize {\n        self.0.len()\n    }\n\n    fn into_text(self) -> String {\n        self.0\n    }\n}\n\nfn main() {\n    let n = Name(String::from("Rosa"));\n    let t = n.into_text();\n    println!("{}", n.length());\n}',
        ),
        predictOutput(
          'What does this program print?',
          'struct Wallet(i32);\n\nimpl Wallet {\n    fn peek(&self) -> i32 {\n        self.0\n    }\n\n    fn spend(self) -> i32 {\n        self.0 - 5\n    }\n}\n\nfn main() {\n    let w = Wallet(20);\n    let a = w.peek();\n    let b = w.peek();\n    let c = w.spend();\n    println!("{} {} {}", a, b, c);\n}',
          ['20 15 10', '15 15 15', '20 20 20', '20 20 15'],
          3,
          'peek only borrows, so both calls see 20; spend takes the wallet and returns 15.',
        ),
        choose(
          'A method only computes a total from the fields, and the caller keeps using the value. Which receiver should it take?',
          ['self', '&self', 'Self', 'no receiver'],
          1,
          'Reading needs only a borrow; taking self would consume the value.',
        ),
        predictOutput(
          'What does this program print?',
          'struct Tag(String);\n\nimpl Tag {\n    fn label(self) -> String {\n        format!("<{}>", self.0)\n    }\n}\n\nfn main() {\n    let t = Tag(String::from("b"));\n    let s = t.label();\n    println!("{} {}", s, s.len());\n}',
          ['<b> 3', 'b 1', '<"b"> 5', '<b> 1'],
          0,
          'label consumes the Tag and builds the String "<b>", which is 3 characters long.',
        ),
      ],
    },
    {
      title: 'Change the value in place with &mut self',
      explanation: [
        'A method that changes fields takes `&mut self`; inside it you can write `self.value += 1;`. The caller keeps the value and sees the change.',
        'Calling such a method requires a mutable binding, as in `let mut c = Counter { value: 0 };`.',
      ],
      example: {
        language: 'rust',
        code: 'struct Counter {\n    value: i32,\n}\n\nimpl Counter {\n    fn bump(&mut self) {\n        self.value += 1;\n    }\n\n    fn get(&self) -> i32 {\n        self.value\n    }\n}\n\nfn main() {\n    let mut c = Counter { value: 0 };\n    c.bump();\n    c.bump();\n    println!("{}", c.get());\n}',
        output: '2',
        explanation:
          'Each bump borrows c mutably and adds 1, so get returns 2.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'struct Score(i32);\n\nimpl Score {\n    fn add(&mut self, pts: i32) {\n        self.0 += pts;\n    }\n}\n\nfn main() {\n    let mut s = Score(10);\n    s.add(5);\n    s.add(-3);\n    println!("{}", s.0);\n}',
          ['10', '15', '12', '18'],
          2,
          'Both calls change s itself: 10 + 5 - 3 is 12.',
        ),
        choose(
          'What happens when this program is compiled?',
          [
            'It prints 1',
            'It prints 0, since the change is discarded',
            'It fails to compile: bump must return the new value',
            'It fails to compile: c is not declared mut',
          ],
          3,
          'Calling a &mut self method needs a mutable binding, so c must be declared `let mut c`.',
          'struct Counter {\n    value: i32,\n}\n\nimpl Counter {\n    fn bump(&mut self) {\n        self.value += 1;\n    }\n}\n\nfn main() {\n    let c = Counter { value: 0 };\n    c.bump();\n    println!("{}", c.value);\n}',
        ),
        predictOutput(
          'What does this program print?',
          'struct Tally {\n    hits: i32,\n    total: i32,\n}\n\nimpl Tally {\n    fn record(&mut self, n: i32) {\n        self.hits += 1;\n        self.total += n;\n    }\n}\n\nfn main() {\n    let mut t = Tally { hits: 0, total: 0 };\n    t.record(3);\n    t.record(4);\n    println!("{} {}", t.hits, t.total);\n}',
          ['2 7', '1 4', '7 2', '2 4'],
          0,
          'Each record call adds 1 to hits and n to total.',
        ),
        choose(
          'A method resets a field to 0, and the caller keeps using the value afterwards. Which receiver does it need?',
          ['self', '&self', '&mut self', 'no receiver'],
          2,
          '&self cannot change fields and self would consume the value; &mut self allows changes in place.',
        ),
      ],
    },
    {
      title: 'Pick the receiver for each method',
      explanation: [
        'One impl block can mix receivers: `&self` methods read, `&mut self` methods change fields, and `self` methods consume the value, often to turn it into something else.',
        'Once a self method has run, the value is gone, so that call must be the last use of the value.',
      ],
      example: {
        language: 'rust',
        code: 'struct Tank(i32);\n\nimpl Tank {\n    fn level(&self) -> i32 {\n        self.0\n    }\n\n    fn fill(&mut self, amount: i32) {\n        self.0 += amount;\n    }\n\n    fn drain(self) -> i32 {\n        self.0\n    }\n}\n\nfn main() {\n    let mut t = Tank(5);\n    t.fill(10);\n    let before = t.level();\n    let emptied = t.drain();\n    println!("{} {}", before, emptied);\n}',
        output: '15 15',
        explanation:
          'fill changes t to 15, level reads it, and drain consumes t and returns the same 15.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'struct Account(i32);\n\nimpl Account {\n    fn deposit(&mut self, amount: i32) {\n        self.0 += amount;\n    }\n\n    fn balance(&self) -> i32 {\n        self.0\n    }\n\n    fn close(self) -> i32 {\n        self.0 - 1\n    }\n}\n\nfn main() {\n    let mut a = Account(100);\n    a.deposit(20);\n    let b = a.balance();\n    let c = a.close();\n    println!("{} {}", b, c);\n}',
          ['100 99', '120 120', '119 120', '120 119'],
          3,
          'deposit raises the balance to 120; close consumes the account and returns 120 - 1.',
        ),
        choose(
          'Given this type and `let mut t = Tank(1);`, which sequence of calls compiles?',
          [
            't.drain(); t.fill(2);',
            't.fill(2); t.drain();',
            't.drain(); t.level();',
            't.drain(); t.drain();',
          ],
          1,
          'drain takes self, so it must be the last call; every other order uses t after it has moved.',
          'struct Tank(i32);\n\nimpl Tank {\n    fn level(&self) -> i32 {\n        self.0\n    }\n\n    fn fill(&mut self, amount: i32) {\n        self.0 += amount;\n    }\n\n    fn drain(self) -> i32 {\n        self.0\n    }\n}',
        ),
        predictOutput(
          'What does this program print?',
          'struct Rect {\n    width: i32,\n    height: i32,\n}\n\nimpl Rect {\n    fn dims(&self) -> (i32, i32) {\n        (self.width, self.height)\n    }\n\n    fn rotate(&mut self) {\n        let w = self.width;\n        self.width = self.height;\n        self.height = w;\n    }\n}\n\nfn main() {\n    let mut r = Rect {\n        width: 2,\n        height: 7,\n    };\n    r.rotate();\n    println!("{:?}", r.dims());\n}',
          ['(2, 7)', '(7, 2)', '(7, 7)', '(2, 2)'],
          1,
          'rotate saves the old width before overwriting it, so the two sides swap.',
        ),
        choose(
          'Why would a method take self instead of &self?',
          [
            'To read the fields faster',
            'To change one field and leave the value with the caller',
            'Because it turns the value into something else, and the caller should not use it again',
            'Because &self methods cannot return values',
          ],
          2,
          'Taking self moves the value into the method, which suits conversions such as into_text.',
        ),
      ],
    },
  ],
  'rust-associated-functions': [
    {
      title: 'Call a function through the type with ::',
      explanation: [
        'A function in an impl block that has no self parameter is an associated function. It belongs to the type rather than to a value, so you call it with the type name and two colons, as in `Point::new(4, -1)`.',
        'Functions that build a new value this way are called constructors and are usually named new.',
      ],
      example: {
        language: 'rust',
        code: 'struct Point {\n    x: i32,\n    y: i32,\n}\n\nimpl Point {\n    fn new(x: i32, y: i32) -> Point {\n        Point { x, y }\n    }\n}\n\nfn main() {\n    let p = Point::new(4, -1);\n    println!("{} {}", p.x, p.y);\n}',
        output: '4 -1',
        explanation:
          'Point::new runs without any existing Point and returns one built from its two arguments.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'struct Span {\n    low: i32,\n    high: i32,\n}\n\nimpl Span {\n    fn new(start: i32, length: i32) -> Span {\n        Span {\n            low: start,\n            high: start + length,\n        }\n    }\n}\n\nfn main() {\n    let s = Span::new(3, 4);\n    println!("{:?}", (s.low, s.high));\n}',
          ['(3, 4)', '(4, 7)', '(3, 7)', '(7, 3)'],
          2,
          'new stores start as low and start + length, 7, as high.',
        ),
        predictOutput(
          'What does this program print?',
          'struct Grid {\n    rows: i32,\n    cols: i32,\n}\n\nimpl Grid {\n    fn square(n: i32) -> Grid {\n        Grid { rows: n, cols: n }\n    }\n}\n\nfn main() {\n    let g = Grid::square(3);\n    println!("{}", g.rows * g.cols + g.rows);\n}',
          ['12', '9', '6', '18'],
          0,
          'square builds a 3 by 3 grid, and 3 * 3 + 3 is 12.',
        ),
        choose(
          'For `impl Point { fn origin() -> Point { Point { x: 0, y: 0 } } }`, which call builds the origin?',
          [
            'Point.origin()',
            'origin()',
            'Point::origin(self)',
            'Point::origin()',
          ],
          3,
          'An associated function without self is called through the type with ::.',
        ),
        choose(
          'What happens when this program is compiled?',
          [
            'It fails to compile: new takes no self',
            'It prints 3, since p.new calls Point::new',
            'It prints 1, copying p',
            'It prints 4',
          ],
          0,
          'Dot calls need a self parameter; new has none, so it must be called as Point::new.',
          'struct Point {\n    x: i32,\n    y: i32,\n}\n\nimpl Point {\n    fn new(x: i32, y: i32) -> Point {\n        Point { x, y }\n    }\n}\n\nfn main() {\n    let p = Point::new(1, 2);\n    let q = p.new(3, 4);\n    println!("{}", q.x);\n}',
        ),
      ],
    },
    {
      title: 'Name the type as Self inside impl',
      explanation: [
        'Inside an impl block, `Self` with a capital S is another name for the type being implemented. `fn new() -> Self { Self { value: 0 } }` returns and builds the type without repeating its name.',
        'Lowercase self is the value a method was called on; uppercase Self is the type itself.',
      ],
      example: {
        language: 'rust',
        code: 'struct Timer {\n    seconds: i32,\n    laps: i32,\n}\n\nimpl Timer {\n    fn new() -> Self {\n        Self {\n            seconds: 0,\n            laps: 0,\n        }\n    }\n\n    fn starting_at(seconds: i32) -> Self {\n        Self { seconds, laps: 0 }\n    }\n}\n\nfn main() {\n    let a = Timer::new();\n    let b = Timer::starting_at(90);\n    println!("{} {}", a.seconds, b.seconds + b.laps);\n}',
        output: '0 90',
        explanation:
          'Timer::new sets both fields to 0; starting_at fills seconds from its parameter and sets laps to 0.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'struct Money(i32);\n\nimpl Money {\n    fn zero() -> Self {\n        Self(0)\n    }\n\n    fn dollars(d: i32) -> Self {\n        Self(d * 100)\n    }\n}\n\nfn main() {\n    println!("{}", Money::dollars(3).0 + Money::zero().0);\n}',
          ['3', '0', '103', '300'],
          3,
          'Self(d * 100) builds a Money holding 300, and zero adds nothing.',
        ),
        choose(
          'Inside `impl Counter`, what does `Self { value: 1 }` build?',
          [
            'A copy of self with value changed to 1',
            'A new Counter whose value is 1',
            'A reference to the current Counter',
            'A value of a separate type named Self',
          ],
          1,
          'Self names the type Counter, so this is an ordinary Counter literal.',
        ),
        predictOutput(
          'What does this program print?',
          'struct Vec2 {\n    x: i32,\n    y: i32,\n}\n\nimpl Vec2 {\n    fn new(x: i32, y: i32) -> Self {\n        Self { x, y }\n    }\n\n    fn flipped(&self) -> Self {\n        Self::new(self.y, self.x)\n    }\n}\n\nfn main() {\n    let v = Vec2::new(1, 8).flipped();\n    println!("{} {}", v.x, v.y);\n}',
          ['8 1', '1 8', '8 8', '1 1'],
          0,
          'flipped calls Self::new with y and x swapped, building Vec2 { x: 8, y: 1 }.',
        ),
        predictOutput(
          'What does this program print?',
          'struct Config {\n    retries: i32,\n    timeout: i32,\n}\n\nimpl Config {\n    fn new() -> Self {\n        Self::with_retries(3)\n    }\n\n    fn with_retries(retries: i32) -> Self {\n        Self {\n            retries,\n            timeout: retries * 10,\n        }\n    }\n}\n\nfn main() {\n    let c = Config::new();\n    println!("{} {}", c.retries, c.timeout);\n}',
          ['3 10', '0 0', '3 30', '30 3'],
          2,
          'new hands the work to with_retries(3), which sets timeout to 3 * 10.',
        ),
      ],
    },
    {
      title: 'Choose between Type::f and value.f',
      explanation: [
        'Use an associated function when there is no value yet, as with a constructor; use a method when the work needs an existing value. Both live in the same impl block.',
        'A constructor returns a value, so you can call methods on its result right away: `Celsius::freezing().warmer(5)`.',
      ],
      example: {
        language: 'rust',
        code: 'struct Celsius(i32);\n\nimpl Celsius {\n    fn freezing() -> Self {\n        Self(0)\n    }\n\n    fn warmer(&self, by: i32) -> Self {\n        Self(self.0 + by)\n    }\n}\n\nfn main() {\n    let t = Celsius::freezing().warmer(5).warmer(3);\n    println!("{}", t.0);\n}',
        output: '8',
        explanation:
          'freezing builds Celsius(0), and each warmer call returns a new Celsius: first 5, then 8.',
      },
      questions: [
        choose(
          'A function builds a full Deck when no deck exists yet. Which signature fits it?',
          [
            'fn full(&self) -> Self',
            'fn full(self) -> Self',
            'fn full() -> Self',
            'fn full(&mut self)',
          ],
          2,
          'With no existing value to call it on, it takes no self and is called as Deck::full().',
        ),
        predictOutput(
          'What does this program print?',
          'struct Stack {\n    size: i32,\n}\n\nimpl Stack {\n    fn empty() -> Self {\n        Self { size: 0 }\n    }\n\n    fn pushed(&self) -> Self {\n        Self {\n            size: self.size + 1,\n        }\n    }\n}\n\nfn main() {\n    let s = Stack::empty().pushed().pushed().pushed();\n    println!("{}", s.size);\n}',
          ['1', '0', '4', '3'],
          3,
          'empty starts at 0, and each pushed call returns a new Stack one larger.',
        ),
        predictOutput(
          'What does this program print?',
          'struct Pair {\n    a: i32,\n    b: i32,\n}\n\nimpl Pair {\n    fn new(a: i32, b: i32) -> Self {\n        Self { a, b }\n    }\n\n    fn swapped(&self) -> Self {\n        Self::new(self.b, self.a)\n    }\n\n    fn diff(&self) -> i32 {\n        self.a - self.b\n    }\n}\n\nfn main() {\n    let p = Pair::new(10, 4);\n    println!("{} {}", p.diff(), p.swapped().diff());\n}',
          ['6 6', '6 -6', '-6 6', '14 -6'],
          1,
          'p.diff() is 10 - 4, and the swapped pair computes 4 - 10.',
        ),
        choose(
          'Given this type, which line fails to compile?',
          [
            'let n = Ticket::number();',
            'let t = Ticket::new(5);',
            'let n = Ticket::new(5).number();',
            'let t = Ticket::new(Ticket::new(1).number());',
          ],
          0,
          'number is a method, so it needs a Ticket to be called on; Ticket::number() supplies none.',
          'struct Ticket {\n    id: i32,\n}\n\nimpl Ticket {\n    fn new(id: i32) -> Self {\n        Self { id }\n    }\n\n    fn number(&self) -> i32 {\n        self.id\n    }\n}',
        ),
      ],
    },
  ],
  'rust-enum-variants': [
    {
      title: 'Declare an enum and pick one variant',
      explanation: [
        'An enum lists every value its type can take: `enum Light { Red, Yellow, Green }`. Write a value with the enum name, two colons, and the variant, as in `Light::Yellow`. A Light value is always exactly one of the three.',
        '`matches!(value, Light::Yellow)` is true when the value is that variant and false otherwise.',
      ],
      example: {
        language: 'rust',
        code: 'enum Light {\n    Red,\n    Yellow,\n    Green,\n}\n\nfn main() {\n    let now = Light::Yellow;\n    println!("{}", matches!(now, Light::Yellow));\n    println!("{}", matches!(now, Light::Green));\n}',
        output: 'true\nfalse',
        explanation:
          'now holds Yellow, so it matches Light::Yellow and does not match Light::Green.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'enum Coin {\n    Heads,\n    Tails,\n}\n\nfn main() {\n    let c = Coin::Tails;\n    println!("{}", matches!(c, Coin::Heads));\n}',
          ['true', 'Tails', 'false', 'Heads'],
          2,
          'c is Tails, so it does not match the Heads pattern.',
        ),
        predictOutput(
          'What does this program print?',
          'enum State {\n    Idle,\n    Running,\n}\n\nfn main() {\n    let mut s = State::Idle;\n    s = State::Running;\n    let code = if matches!(s, State::Idle) { 0 } else { 1 };\n    println!("{}", code);\n}',
          ['0', '1', 'Running', 'Idle'],
          1,
          'Reassigning s replaces Idle with Running, so the if takes its else branch.',
        ),
        choose(
          'Which expression creates the Tails value of `enum Coin { Heads, Tails }`?',
          ['Coin::Tails', 'Tails', 'Coin.Tails', 'Coin(Tails)'],
          0,
          'A variant is named through its enum with two colons.',
        ),
        choose(
          'What happens when this program is compiled?',
          [
            'It prints Red',
            'It prints Light::Red, the variant’s full path',
            'It prints 0',
            'It fails to compile: Light has no {} form',
          ],
          3,
          'A newly declared enum has no {} form; test its variant with matches! instead of printing it.',
          'enum Light {\n    Red,\n    Green,\n}\n\nfn main() {\n    let l = Light::Red;\n    println!("{}", l);\n}',
        ),
      ],
    },
    {
      title: 'Branch on the variant',
      explanation: [
        'To act on which variant a value holds, put matches! in an if condition. A chain of if, else if, and else can give each variant its own result.',
        'When the chain is used as a value, it needs a final else so that every possible input produces a result.',
      ],
      example: {
        language: 'rust',
        code: 'enum Size {\n    Small,\n    Medium,\n    Large,\n}\n\nfn price(size: Size) -> i32 {\n    if matches!(size, Size::Small) {\n        3\n    } else if matches!(size, Size::Medium) {\n        4\n    } else {\n        5\n    }\n}\n\nfn main() {\n    println!("{}", price(Size::Medium) + price(Size::Large));\n}',
        output: '9',
        explanation: 'Medium costs 4, and Large reaches the final else for 5.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'enum Size {\n    Small,\n    Medium,\n    Large,\n}\n\nfn price(size: Size) -> i32 {\n    if matches!(size, Size::Small) {\n        3\n    } else if matches!(size, Size::Medium) {\n        4\n    } else {\n        5\n    }\n}\n\nfn main() {\n    println!("{}", price(Size::Small) * 2 + price(Size::Large));\n}',
          ['11', '13', '16', '8'],
          0,
          'Small costs 3, doubled to 6, and Large adds 5.',
        ),
        predictOutput(
          'What does this program print?',
          'enum Gear {\n    Park,\n    Reverse,\n    Drive,\n}\n\nfn speed(g: Gear) -> i32 {\n    if matches!(g, Gear::Reverse) {\n        -5\n    } else if matches!(g, Gear::Park) {\n        0\n    } else {\n        30\n    }\n}\n\nfn main() {\n    println!("{}", speed(Gear::Drive) + speed(Gear::Reverse));\n}',
          ['35', '30', '25', '-5'],
          2,
          'Drive reaches the final else for 30, and Reverse gives -5.',
        ),
        predictOutput(
          'What does this program print?',
          'enum Day {\n    Mon,\n    Fri,\n    Sat,\n    Sun,\n}\n\nfn hours(d: Day) -> i32 {\n    if matches!(d, Day::Sat) || matches!(d, Day::Sun) {\n        0\n    } else {\n        8\n    }\n}\n\nfn main() {\n    println!("{}", hours(Day::Fri) + hours(Day::Sat) + hours(Day::Mon));\n}',
          ['24', '8', '0', '16'],
          3,
          'Saturday gives 0 and each of the two weekdays gives 8.',
        ),
        choose(
          'Size has exactly three variants. What happens when this function is compiled?',
          [
            'It compiles, because all three sizes are covered',
            'It fails to compile: the if chain has no final else',
            'It compiles and returns 0 when nothing matches',
            'It compiles but panics on an unknown size',
          ],
          1,
          'The compiler does not reason about matches! conditions; without a final else, the if has no value in the remaining case.',
          'enum Size {\n    Small,\n    Medium,\n    Large,\n}\n\nfn price(size: Size) -> i32 {\n    if matches!(size, Size::Small) {\n        3\n    } else if matches!(size, Size::Medium) {\n        4\n    } else if matches!(size, Size::Large) {\n        5\n    }\n}',
        ),
      ],
    },
    {
      title: 'Model exclusive states with one enum',
      explanation: [
        'Separate flags such as `loading: bool` and `failed: bool` allow combinations that make no sense, like both being true. An enum with Loading, Failed, and Done variants holds exactly one state at a time, so impossible states cannot be written.',
        'Functions take and return enum values like any other type, which lets a program move from one state to the next.',
      ],
      example: {
        language: 'rust',
        code: 'enum Door {\n    Open,\n    Closed,\n    Locked,\n}\n\nfn turn_key(door: Door) -> Door {\n    if matches!(door, Door::Locked) {\n        Door::Closed\n    } else {\n        door\n    }\n}\n\nfn main() {\n    let d = turn_key(Door::Locked);\n    println!("{}", matches!(d, Door::Closed));\n}',
        output: 'true',
        explanation:
          'The door starts Locked, so turn_key returns Door::Closed, which matches.',
      },
      questions: [
        choose(
          'A download is waiting, running, finished, or failed, and only one of these at a time. Which model rules out impossible combinations?',
          [
            'Four bool variables',
            'Two bool variables',
            'An i32 where any number is allowed',
            'An enum with four variants',
          ],
          3,
          'An enum value is exactly one variant, so contradictory states cannot exist.',
        ),
        predictOutput(
          'What does this program print?',
          'enum Light {\n    Red,\n    Yellow,\n    Green,\n}\n\nfn next(l: Light) -> Light {\n    if matches!(l, Light::Red) {\n        Light::Green\n    } else if matches!(l, Light::Green) {\n        Light::Yellow\n    } else {\n        Light::Red\n    }\n}\n\nfn code(l: Light) -> i32 {\n    if matches!(l, Light::Red) {\n        1\n    } else if matches!(l, Light::Yellow) {\n        2\n    } else {\n        3\n    }\n}\n\nfn main() {\n    println!("{}", code(next(next(Light::Green))));\n}',
          ['1', '2', '3', '0'],
          0,
          'Green becomes Yellow, then Yellow reaches the final else and becomes Red, whose code is 1.',
        ),
        predictOutput(
          'What does this program print?',
          'enum Phase {\n    Start,\n    Middle,\n    End,\n}\n\nfn advance(p: Phase) -> Phase {\n    if matches!(p, Phase::Start) {\n        Phase::Middle\n    } else {\n        Phase::End\n    }\n}\n\nfn main() {\n    let mut p = Phase::Start;\n    p = advance(p);\n    p = advance(p);\n    p = advance(p);\n    let score = if matches!(p, Phase::End) {\n        100\n    } else if matches!(p, Phase::Middle) {\n        50\n    } else {\n        0\n    };\n    println!("{}", score);\n}',
          ['0', '50', '100', '150'],
          2,
          'Start becomes Middle, Middle becomes End, and End stays End.',
        ),
        choose(
          'Door is a plain enum with nothing extra added to it. Which condition compiles?',
          [
            'door == Door::Open',
            'matches!(door, Door::Open)',
            'door = Door::Open',
            'door.is(Door::Open)',
          ],
          1,
          'A plain enum does not support ==; matches! tests the value against a variant pattern.',
        ),
      ],
    },
  ],
  'rust-enum-data': [
    {
      title: 'Carry data in a variant and bind it in match',
      explanation: [
        'A variant can carry values, and each variant declares its own: `Square(i32)` holds one number and `Rect(i32, i32)` holds two. Build a value by calling the variant like a function, as in `Shape::Rect(2, 7)`.',
        'A match arm such as `Shape::Rect(w, h) => w * h` checks the variant and binds its payload to names in one step.',
      ],
      example: {
        language: 'rust',
        code: 'enum Shape {\n    Square(i32),\n    Rect(i32, i32),\n}\n\nfn area(shape: Shape) -> i32 {\n    match shape {\n        Shape::Square(side) => side * side,\n        Shape::Rect(w, h) => w * h,\n    }\n}\n\nfn main() {\n    println!("{} {}", area(Shape::Square(4)), area(Shape::Rect(2, 7)));\n}',
        output: '16 14',
        explanation:
          'The Square arm binds side to 4, and the Rect arm binds w to 2 and h to 7.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'enum Cmd {\n    Up(i32),\n    Down(i32),\n    Stop,\n}\n\nfn delta(c: Cmd) -> i32 {\n    match c {\n        Cmd::Up(n) => n,\n        Cmd::Down(n) => -n,\n        Cmd::Stop => 0,\n    }\n}\n\nfn main() {\n    println!(\n        "{}",\n        delta(Cmd::Up(5)) + delta(Cmd::Down(8)) + delta(Cmd::Stop)\n    );\n}',
          ['13', '3', '-3', '5'],
          2,
          'Up(5) gives 5, Down(8) gives -8, and Stop gives 0.',
        ),
        predictOutput(
          'What does this program print?',
          'enum Pay {\n    Hourly(i32, i32),\n    Salary(i32),\n}\n\nfn weekly(p: Pay) -> i32 {\n    match p {\n        Pay::Hourly(rate, hours) => rate * hours,\n        Pay::Salary(amount) => amount,\n    }\n}\n\nfn main() {\n    println!(\n        "{} {}",\n        weekly(Pay::Hourly(20, 3)),\n        weekly(Pay::Salary(500))\n    );\n}',
          ['60 500', '23 500', '20 500', '60 0'],
          0,
          'Hourly binds rate 20 and hours 3, and Salary binds 500.',
        ),
        choose(
          'shape holds `Shape::Square(4)`. What does the arm `Shape::Rect(w, h) => w + h` do?',
          [
            'It is skipped, because the variant differs',
            'It runs with w = 4 and h = 0',
            'It runs with w = 4 and h = 4',
            'It stops the program with an error',
          ],
          0,
          'An arm runs only when its variant matches; a Square never fits a Rect pattern.',
        ),
        choose(
          'What happens when this is compiled?',
          [
            'It compiles, and Stop returns 0',
            'It fails to compile: Cmd::Stop is not covered',
            'It compiles, and Stop falls into the Down arm',
            'It compiles, but panics when given Stop',
          ],
          1,
          'A match must cover every variant; add a Stop arm or a fallback.',
          'enum Cmd {\n    Up(i32),\n    Down(i32),\n    Stop,\n}\n\nfn delta(c: Cmd) -> i32 {\n    match c {\n        Cmd::Up(n) => n,\n        Cmd::Down(n) => -n,\n    }\n}',
        ),
      ],
    },
    {
      title: 'Move an owned String into a variant',
      explanation: [
        'A payload can be an owned value such as a String. `Note::Text(words)` moves words into the enum value, so words cannot be used afterwards.',
        'Matching on the enum by value moves the payload into the arm’s binding, where you can read it, for example with `.len()`, or return it.',
      ],
      example: {
        language: 'rust',
        code: 'enum Note {\n    Blank,\n    Text(String),\n}\n\nfn length(note: Note) -> usize {\n    match note {\n        Note::Blank => 0,\n        Note::Text(body) => body.len(),\n    }\n}\n\nfn main() {\n    let words = String::from("hello");\n    let note = Note::Text(words);\n    println!("{}", length(note));\n}',
        output: '5',
        explanation:
          'The String moves into Note::Text, and the Text arm binds it as body, whose length is 5.',
      },
      questions: [
        choose(
          'What happens when this program is compiled?',
          [
            'It prints hi',
            'It prints an empty line',
            'It fails to compile: words was moved into the variant',
            'It fails to compile: a variant cannot hold a String',
          ],
          2,
          'Building Note::Text(words) moves the String into the enum value.',
          'enum Note {\n    Blank,\n    Text(String),\n}\n\nfn main() {\n    let words = String::from("hi");\n    let note = Note::Text(words);\n    println!("{}", words);\n}',
        ),
        predictOutput(
          'What does this program print?',
          'enum Entry {\n    Name(String),\n    Id(i32),\n}\n\nfn describe(e: Entry) -> String {\n    match e {\n        Entry::Name(n) => format!("name {}", n),\n        Entry::Id(i) => format!("id {}", i),\n    }\n}\n\nfn main() {\n    println!("{}", describe(Entry::Name(String::from("Kai"))));\n    println!("{}", describe(Entry::Id(7)));\n}',
          ['name "Kai"\nid 7', 'Kai\n7', 'name Kai\nname 7', 'name Kai\nid 7'],
          3,
          'Each arm formats its own payload with {}, which prints the String without quotes.',
        ),
        predictOutput(
          'What does this program print?',
          'enum Reply {\n    Empty,\n    Text(String),\n}\n\nfn text_or_dash(r: Reply) -> String {\n    match r {\n        Reply::Empty => String::from("-"),\n        Reply::Text(t) => t,\n    }\n}\n\nfn main() {\n    let a = text_or_dash(Reply::Text(String::from("ok")));\n    let b = text_or_dash(Reply::Empty);\n    println!("{:?} {:?}", a, b);\n}',
          ['ok -', '"ok" "-"', 'Text("ok") Empty', '"ok" -'],
          1,
          'The Text arm returns its String unchanged, and {:?} prints both Strings with quotes.',
        ),
        predictOutput(
          'What does this program print?',
          'enum Field {\n    Count(i32),\n    Label(String),\n    Flag(bool),\n}\n\nfn size(f: Field) -> usize {\n    match f {\n        Field::Count(_) => 4,\n        Field::Label(s) => s.len(),\n        Field::Flag(_) => 1,\n    }\n}\n\nfn main() {\n    println!(\n        "{}",\n        size(Field::Label(String::from("abc"))) + size(Field::Flag(true))\n    );\n}',
          ['4', '5', '8', '3'],
          0,
          'The label "abc" has length 3 and the flag adds 1.',
        ),
      ],
    },
    {
      title: 'Test payload values with literals and guards',
      explanation: [
        'Patterns inside a variant work like integer patterns: `Reading::Celsius(0)` matches only a zero payload, and `Reading::Celsius(t) if t > 30` binds t and then checks the guard.',
        'Arms are tried from top to bottom and the first match wins, so put specific arms before general ones.',
      ],
      example: {
        language: 'rust',
        code: 'enum Reading {\n    Celsius(i32),\n    Missing,\n}\n\nfn label(r: Reading) -> String {\n    match r {\n        Reading::Celsius(0) => String::from("freezing point"),\n        Reading::Celsius(t) if t > 30 => format!("hot {}", t),\n        Reading::Celsius(t) => format!("mild {}", t),\n        Reading::Missing => String::from("no data"),\n    }\n}\n\nfn main() {\n    println!("{}", label(Reading::Celsius(35)));\n    println!("{}", label(Reading::Celsius(0)));\n}',
        output: 'hot 35\nfreezing point',
        explanation:
          '35 passes the guard of the second arm; 0 is caught by the literal pattern in the first arm.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'enum Reading {\n    Celsius(i32),\n    Missing,\n}\n\nfn label(r: Reading) -> String {\n    match r {\n        Reading::Celsius(0) => String::from("freezing point"),\n        Reading::Celsius(t) if t > 30 => format!("hot {}", t),\n        Reading::Celsius(t) => format!("mild {}", t),\n        Reading::Missing => String::from("no data"),\n    }\n}\n\nfn main() {\n    println!("{}", label(Reading::Celsius(30)));\n}',
          ['hot 30', 'freezing point', 'mild 30', 'no data'],
          2,
          '30 is not greater than 30, so the guard fails and the next Celsius arm matches.',
        ),
        predictOutput(
          'What does this program print?',
          'enum Bid {\n    Pass,\n    Raise(i32),\n}\n\nfn cost(b: Bid) -> i32 {\n    match b {\n        Bid::Raise(n) if n > 100 => 100,\n        Bid::Raise(n) => n,\n        Bid::Pass => 0,\n    }\n}\n\nfn main() {\n    println!(\n        "{} {} {}",\n        cost(Bid::Raise(250)),\n        cost(Bid::Raise(40)),\n        cost(Bid::Pass)\n    );\n}',
          ['250 40 0', '100 40 0', '100 100 0', '100 40 100'],
          1,
          'Raises above 100 are capped by the guarded arm; 40 falls through to the plain Raise arm.',
        ),
        predictOutput(
          'What does this program print?',
          'enum Cell {\n    Wall,\n    Coins(i32),\n}\n\nfn kind(c: Cell) -> i32 {\n    match c {\n        Cell::Wall => 0,\n        Cell::Coins(_) => 1,\n        Cell::Coins(0) => 2,\n    }\n}\n\nfn main() {\n    println!("{}", kind(Cell::Coins(0)));\n}',
          ['2', '0', '3', '1'],
          3,
          'Arms are tried in order, and Coins(_) already matches every Coins value, so the Coins(0) arm is never reached.',
        ),
        choose(
          'Where should the arm `Reading::Celsius(t) => ...` go relative to `Reading::Celsius(t) if t > 30 => ...`?',
          [
            'Before it, so it sees every temperature first',
            'After it, so the guarded arm gets a chance to match',
            'Either place, since match arms have no order',
            'In its place, since guards are not allowed on payloads',
          ],
          1,
          'The unguarded arm matches every Celsius value, so placed first it would hide the guarded one.',
        ),
      ],
    },
    {
      title: 'Handle several data shapes in one enum',
      explanation: [
        'One enum can mix variants that carry nothing, one value, several values, or an owned String. A single match handles them all, binding each payload in its own arm and using literals, guards, and _ where needed.',
        'If a variant is added later, every match without a fallback stops compiling until it handles the new case.',
      ],
      example: {
        language: 'rust',
        code: 'enum Event {\n    Click(i32, i32),\n    Key(String),\n    Quit,\n}\n\nfn describe(e: Event) -> String {\n    match e {\n        Event::Click(x, y) => format!("click at {} {}", x, y),\n        Event::Key(k) => format!("key {} ({} chars)", k, k.len()),\n        Event::Quit => String::from("quit"),\n    }\n}\n\nfn main() {\n    println!("{}", describe(Event::Click(3, 4)));\n    println!("{}", describe(Event::Key(String::from("enter"))));\n}',
        output: 'click at 3 4\nkey enter (5 chars)',
        explanation:
          'Click binds both coordinates, and Key binds its String, which the arm both prints and measures.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'enum Event {\n    Click(i32, i32),\n    Key(String),\n    Quit,\n}\n\nfn describe(e: Event) -> String {\n    match e {\n        Event::Click(x, y) => format!("click at {} {}", x, y),\n        Event::Key(k) => format!("key {} ({} chars)", k, k.len()),\n        Event::Quit => String::from("quit"),\n    }\n}\n\nfn main() {\n    println!("{}", describe(Event::Key(String::from("tab"))));\n    println!("{}", describe(Event::Quit));\n}',
          [
            'key "tab" (3 chars)\nquit',
            'key tab (4 chars)\nquit',
            'key tab (3 chars)\nquit',
            'tab (3 chars)\nquit',
          ],
          2,
          'The String prints without quotes under {}, and "tab" has 3 characters.',
        ),
        predictOutput(
          'What does this program print?',
          'enum Txn {\n    Deposit(i32),\n    Withdraw(i32),\n    Fee,\n}\n\nfn apply(balance: i32, t: Txn) -> i32 {\n    match t {\n        Txn::Deposit(n) => balance + n,\n        Txn::Withdraw(n) if n > balance => balance,\n        Txn::Withdraw(n) => balance - n,\n        Txn::Fee => balance - 2,\n    }\n}\n\nfn main() {\n    let mut b = apply(10, Txn::Deposit(5));\n    b = apply(b, Txn::Withdraw(50));\n    b = apply(b, Txn::Fee);\n    println!("{}", b);\n}',
          ['13', '-37', '15', '-35'],
          0,
          'The deposit makes 15, the guarded arm refuses the 50 withdrawal, and the fee leaves 13.',
        ),
        choose(
          'Shape has Square(i32) and Rect(i32, i32). A Triangle(i32, i32, i32) variant is added. What happens to an existing match on Shape that lists only Square and Rect, with no _ arm?',
          [
            'It keeps compiling, and Triangle returns 0',
            'It stops compiling until Triangle is handled',
            'It compiles, but panics for a triangle',
            'It compiles and treats Triangle as Rect',
          ],
          1,
          'A match must be exhaustive, so the new variant needs its own arm or a fallback.',
        ),
        predictOutput(
          'What does this program print?',
          'enum Token {\n    Num(i32),\n    Word(String),\n    End,\n}\n\nfn is_num(t: Token) -> i32 {\n    match t {\n        Token::Num(_) => 1,\n        _ => 0,\n    }\n}\n\nfn main() {\n    let count = is_num(Token::Num(0)) + is_num(Token::Word(String::from("7"))) + is_num(Token::End);\n    println!("{}", count);\n}',
          ['2', '3', '0', '1'],
          3,
          'Only the Num value matches the first arm, whatever its payload; the Word holding "7" is still a Word.',
        ),
      ],
    },
  ],
  'rust-if-let': [
    {
      title: 'Run a block only when one pattern matches',
      explanation: [
        '`if let Some(n) = value { ... }` tests a single pattern. When value matches, the payload is bound to n and the block runs; when it does not, the block is skipped.',
        'It is a shorter form of a match whose other arms do nothing, and it works with any enum pattern, such as `if let Msg::Data(d) = m`.',
      ],
      example: {
        language: 'rust',
        code: 'fn main() {\n    let found: Option<i32> = Some(42);\n    if let Some(n) = found {\n        println!("got {}", n);\n    }\n    let missing: Option<i32> = None;\n    if let Some(n) = missing {\n        println!("got {}", n);\n    }\n    println!("done");\n}',
        output: 'got 42\ndone',
        explanation:
          'found matches Some and binds n to 42; missing is None, so its block is skipped.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn main() {\n    let mut total = 0;\n    let a = Some(5);\n    let b: Option<i32> = None;\n    if let Some(x) = a {\n        total += x;\n    }\n    if let Some(x) = b {\n        total += x;\n    }\n    total += 1;\n    println!("{}", total);\n}',
          ['5', '1', '6', '11'],
          2,
          'Only a matches Some, adding 5; the second block is skipped, and the last line adds 1.',
        ),
        predictOutput(
          'What does this program print?',
          'enum Msg {\n    Ping,\n    Data(i32),\n}\n\nfn main() {\n    let m = Msg::Data(9);\n    if let Msg::Ping = m {\n        println!("ping");\n    }\n    if let Msg::Data(d) = m {\n        println!("data {}", d);\n    }\n}',
          ['ping\ndata 9', 'data 9', 'ping', 'data 0'],
          1,
          'm is Data(9), so only the second pattern matches, binding d to 9.',
        ),
        predictOutput(
          'What does this program print?',
          'fn main() {\n    let v = Some(0);\n    if let Some(0) = v {\n        println!("zero");\n    }\n    if let Some(1) = v {\n        println!("one");\n    }\n    println!("end");\n}',
          ['one\nend', 'zero\none\nend', 'zero\nend', 'end'],
          2,
          'A literal inside the pattern must match too: Some(0) matches and Some(1) does not.',
        ),
        choose(
          'Which match behaves the same as `if let Some(n) = x { println!("{}", n); }`?',
          [
            'match x { Some(n) => println!("{}", n), None => println!("None") }',
            'match x { Some(n) => println!("{}", n), None => {} }',
            'match x { n => println!("{}", n) }',
            'match x { None => {}, Some(n) => println!("{}", x) }',
          ],
          1,
          'if let runs its block for the one pattern and does nothing otherwise, like a match whose None arm is empty.',
        ),
      ],
    },
    {
      title: 'Add else when every input needs a value',
      explanation: [
        '`if let ... { ... } else { ... }` is an expression: when the pattern does not match, the else block supplies the value instead. It can then be a function’s tail expression or the right side of a let.',
        'Without else, an if let produces no value, so it cannot be the result of a function that returns i32.',
      ],
      example: {
        language: 'rust',
        code: 'fn width_or_default(width: Option<i32>) -> i32 {\n    if let Some(w) = width {\n        w\n    } else {\n        80\n    }\n}\n\nfn main() {\n    println!("{} {}", width_or_default(Some(120)), width_or_default(None));\n}',
        output: '120 80',
        explanation:
          'Some(120) binds w and returns it; None takes the else branch and returns 80.',
      },
      questions: [
        choose(
          'What happens when this is compiled?',
          [
            'It compiles, and None returns 0',
            'It compiles, but panics on None',
            'It fails to compile: without else, None produces no i32',
            'It compiles, and None returns -1',
          ],
          2,
          'Without else the if let has no value when v is None, so it cannot be the i32 result.',
          'fn or_zero(v: Option<i32>) -> i32 {\n    if let Some(n) = v {\n        n\n    }\n}',
        ),
        predictOutput(
          'What does this program print?',
          'fn describe(v: Option<i32>) -> String {\n    if let Some(n) = v {\n        format!("{} items", n)\n    } else {\n        String::from("empty")\n    }\n}\n\nfn main() {\n    println!("{} / {}", describe(Some(3)), describe(None));\n}',
          [
            '3 items / empty',
            '3 items / 0 items',
            'Some(3) items / empty',
            '3 items / None',
          ],
          0,
          'Some(3) binds n to 3, and None takes the else branch.',
        ),
        predictOutput(
          'What does this program print?',
          'enum Size {\n    Fixed(i32),\n    Auto,\n}\n\nfn px(s: Size) -> i32 {\n    if let Size::Fixed(n) = s {\n        n * 2\n    } else {\n        16\n    }\n}\n\nfn main() {\n    println!("{}", px(Size::Fixed(5)) + px(Size::Auto));\n}',
          ['10', '26', '21', '16'],
          1,
          'Fixed(5) gives 10, and Auto takes the else branch for 16.',
        ),
        predictOutput(
          'What does this program print?',
          'fn head_or(values: &[i32], fallback: i32) -> i32 {\n    if let Some(&x) = values.first() {\n        x\n    } else {\n        fallback\n    }\n}\n\nfn main() {\n    println!("{} {}", head_or(&[7, 1], 0), head_or(&[], -1));\n}',
          ['7 0', '1 -1', '0 -1', '7 -1'],
          3,
          'The first slice starts with 7; the empty slice has no first element, so the fallback -1 is used.',
        ),
      ],
    },
    {
      title: 'Use if let inside a loop',
      explanation: [
        'Inside a loop, an if let without else handles the items that match and quietly skips the rest. That suits jobs such as adding up only the values that are present.',
        '`else if let` tries another pattern when the first one does not match.',
      ],
      example: {
        language: 'rust',
        code: 'fn sum_present(values: &[Option<i32>]) -> i32 {\n    let mut total = 0;\n    for &v in values {\n        if let Some(n) = v {\n            total += n;\n        }\n    }\n    total\n}\n\nfn main() {\n    println!("{}", sum_present(&[Some(4), None, Some(-1), Some(10)]));\n}',
        output: '13',
        explanation:
          'The three Some values add up to 4 - 1 + 10 = 13, and the None is skipped.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn count_missing(values: &[Option<i32>]) -> i32 {\n    let mut missing = 0;\n    for &v in values {\n        if let None = v {\n            missing += 1;\n        }\n    }\n    missing\n}\n\nfn main() {\n    println!("{}", count_missing(&[None, Some(0), None]));\n}',
          ['1', '3', '2', '0'],
          2,
          'The None pattern matches the first and third items; Some(0) is present, not missing.',
        ),
        predictOutput(
          'What does this program print?',
          'fn kind(v: Option<i32>) -> i32 {\n    if let Some(0) = v {\n        0\n    } else if let Some(n) = v {\n        n * 10\n    } else {\n        -1\n    }\n}\n\nfn main() {\n    println!("{} {} {}", kind(Some(0)), kind(Some(2)), kind(None));\n}',
          ['0 20 -1', '0 2 -1', '0 20 0', '-1 20 -1'],
          0,
          'Some(0) hits the first pattern, Some(2) reaches else if let, and None falls to else.',
        ),
        predictOutput(
          'What does this program print?',
          'fn main() {\n    let values = [Some(3), None, Some(8), None];\n    let mut last = 0;\n    for &v in &values {\n        if let Some(n) = v {\n            last = n;\n        }\n    }\n    println!("{}", last);\n}',
          ['3', '0', '11', '8'],
          3,
          'Each Some overwrites last and each None is skipped, so 8 remains at the end.',
        ),
        choose(
          'Why does `if let Some(n) = maybe { total += n; }` compile without an else?',
          [
            'Rust adds else { 0 } automatically',
            'It is used as a statement, so the skipped case simply does nothing',
            'None values are turned into 0 first',
            'The compiler proves maybe is always Some',
          ],
          1,
          'No value is needed from this if let, so skipping the block when maybe is None is fine.',
        ),
      ],
    },
  ],
  'rust-destructure': [
    {
      title: 'Unpack a tuple inside an Option',
      explanation: [
        'Patterns can nest. `Some((a, b))` checks that the Option is Some and unpacks the tuple inside it, binding both numbers in one arm.',
        'let patterns nest the same way for plain tuples: `let (x, (y, z)) = (1, (2, 3));`.',
      ],
      example: {
        language: 'rust',
        code: 'fn sum_pair(pair: Option<(i32, i32)>) -> i32 {\n    match pair {\n        Some((a, b)) => a + b,\n        None => 0,\n    }\n}\n\nfn main() {\n    println!("{} {}", sum_pair(Some((3, 9))), sum_pair(None));\n}',
        output: '12 0',
        explanation:
          'The first call binds a to 3 and b to 9; the None call takes the other arm.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn main() {\n    let (count, (x, y)) = (4, (10, -2));\n    println!("{} {}", x + y, count);\n}',
          ['8 4', '12 4', '4 8', '10 -2'],
          0,
          'The inner tuple binds x = 10 and y = -2, and count is 4.',
        ),
        predictOutput(
          'What does this program print?',
          'fn spread(range: Option<(i32, i32)>) -> Option<i32> {\n    match range {\n        Some((lo, hi)) => Some(hi - lo),\n        None => None,\n    }\n}\n\nfn main() {\n    println!("{:?} {:?}", spread(Some((2, 9))), spread(None));\n}',
          ['7 None', 'Some(-7) None', 'Some(7) Some(0)', 'Some(7) None'],
          3,
          'lo is 2 and hi is 9, so the result is Some(7); None stays None.',
        ),
        predictOutput(
          'What does this program print?',
          'fn greet(p: Option<(String, i32)>) -> String {\n    match p {\n        Some((name, age)) => format!("{} is {}", name, age),\n        None => String::from("nobody"),\n    }\n}\n\nfn main() {\n    println!("{}", greet(Some((String::from("Mia"), 30))));\n}',
          ['"Mia" is 30', 'Mia is 30', 'Some(Mia) is 30', 'nobody'],
          1,
          'The pattern unpacks both the Option and the tuple, binding the String and the number.',
        ),
        choose(
          'Which pattern matches `Some((1, 2))` and binds both numbers?',
          ['Some(a, b)', '(Some(a), Some(b))', 'Some((a, b))', 'Some[a, b]'],
          2,
          'The Some holds one tuple, so the tuple pattern goes inside the Some parentheses.',
        ),
      ],
    },
    {
      title: 'Ignore the parts you do not need',
      explanation: [
        'Bind only the data you use. `_` matches anything in its position without binding it, so `Some((x, _, _))` keeps the first number and ignores the other two.',
        'In a tuple pattern, `..` skips all the remaining positions, as in `(first, ..)` or `(.., last)`.',
      ],
      example: {
        language: 'rust',
        code: 'fn x_of(point: Option<(i32, i32, i32)>) -> Option<i32> {\n    match point {\n        Some((x, _, _)) => Some(x),\n        None => None,\n    }\n}\n\nfn main() {\n    println!("{:?}", x_of(Some((5, 6, 7))));\n}',
        output: 'Some(5)',
        explanation:
          'Only the first position is bound; the two underscores match 6 and 7 without naming them.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn main() {\n    let value = Some((8, 3));\n    let doubled = match value {\n        Some((_, b)) => b * 2,\n        None => 0,\n    };\n    println!("{}", doubled);\n}',
          ['16', '11', '6', '0'],
          2,
          '_ skips the 8, and b binds the 3.',
        ),
        predictOutput(
          'What does this program print?',
          'fn main() {\n    let (first, ..) = (4, 5, 6, 7);\n    let (.., last) = (4, 5, 6, 7);\n    println!("{} {}", first, last);\n}',
          ['4 7', '4 5', '7 4', '4 6'],
          0,
          '.. skips every position it covers, leaving the first element in one pattern and the last in the other.',
        ),
        choose(
          'Which pattern binds only the middle number of `Some((10, 20, 30))`?',
          [
            'Some((b, _))',
            'Some((_, _, b))',
            'Some(_, b, _)',
            'Some((_, b, _))',
          ],
          3,
          'The tuple has three positions; _ fills the first and last, and b binds the middle one.',
        ),
        predictOutput(
          'What does this program print?',
          'fn score(p: Option<(String, i32)>) -> i32 {\n    match p {\n        Some((_, points)) => points,\n        None => -1,\n    }\n}\n\nfn main() {\n    println!("{} {}", score(Some((String::from("zed"), 12))), score(None));\n}',
          ['zed -1', '12 -1', '12 0', '-1 12'],
          1,
          'The name is ignored with _ and points binds 12; None gives -1.',
        ),
      ],
    },
    {
      title: 'Match on a tuple of Options',
      explanation: [
        'Group several values into a tuple and match on it to handle each combination: `match (a, b) { (Some(x), Some(y)) => ..., (Some(x), None) => ..., ... }`.',
        'Arms are tried from top to bottom, and together they must cover every combination. `_` and `|` work inside nested patterns too.',
      ],
      example: {
        language: 'rust',
        code: 'fn combine(a: Option<i32>, b: Option<i32>) -> Option<i32> {\n    match (a, b) {\n        (Some(x), Some(y)) => Some(x + y),\n        (Some(x), None) | (None, Some(x)) => Some(x),\n        (None, None) => None,\n    }\n}\n\nfn main() {\n    println!(\n        "{:?} {:?}",\n        combine(Some(2), Some(5)),\n        combine(None, Some(4))\n    );\n    println!("{:?}", combine(None, None));\n}',
        output: 'Some(7) Some(4)\nNone',
        explanation:
          'Two present values are added, a single present value is passed through, and two Nones give None.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn pick(a: Option<i32>, b: Option<i32>) -> i32 {\n    match (a, b) {\n        (Some(x), _) => x,\n        (None, Some(y)) => y * 10,\n        (None, None) => 0,\n    }\n}\n\nfn main() {\n    println!(\n        "{} {} {}",\n        pick(Some(1), Some(2)),\n        pick(None, Some(3)),\n        pick(None, None)\n    );\n}',
          ['1 30 0', '2 30 0', '1 3 0', '20 30 0'],
          0,
          'The first arm takes x whenever a is Some, ignoring b; otherwise b decides.',
        ),
        predictOutput(
          'What does this program print?',
          'fn status(code: (i32, Option<i32>)) -> i32 {\n    match code {\n        (0, _) => 0,\n        (_, None) => -1,\n        (c, Some(extra)) => c + extra,\n    }\n}\n\nfn main() {\n    println!(\n        "{} {} {}",\n        status((0, None)),\n        status((5, None)),\n        status((5, Some(2)))\n    );\n}',
          ['-1 -1 7', '0 -1 7', '0 5 7', '0 -1 5'],
          1,
          '(0, None) hits the first arm before the None arm, (5, None) gives -1, and (5, Some(2)) adds up to 7.',
        ),
        choose(
          'A match on `(a, b)`, where both are `Option<i32>`, has arms only for `(Some(x), Some(y))` and `(Some(x), None)`. What happens?',
          [
            'It compiles and returns a default when a is None',
            'It fails to compile: the combinations where a is None are not covered',
            'It compiles, but panics if a turns out to be None',
            'It compiles, since two arms are enough for two values',
          ],
          1,
          'The arms must cover every combination, including (None, Some(_)) and (None, None).',
        ),
        predictOutput(
          'What does this program print?',
          'fn larger(pair: (Option<i32>, Option<i32>)) -> i32 {\n    match pair {\n        (Some(a), Some(b)) if a > b => a,\n        (Some(_), Some(b)) => b,\n        _ => 0,\n    }\n}\n\nfn main() {\n    println!(\n        "{} {} {}",\n        larger((Some(9), Some(4))),\n        larger((Some(1), Some(6))),\n        larger((Some(3), None))\n    );\n}',
          ['9 6 3', '9 1 0', '4 6 0', '9 6 0'],
          3,
          'The guard picks a when it is larger, the next arm picks b, and any pair with a None falls to _.',
        ),
      ],
    },
    {
      title: 'Unpack an enum nested in an Option or a tuple',
      explanation: [
        'Enum patterns nest like tuple patterns: `Some(Shape::Rect(w, _))` checks the Option, then the variant, then binds the payload, all in one arm. A literal anywhere in the pattern must match exactly.',
        'Nesting works the other way round too: a variant’s payload can be a tuple, as in `Event::Click((x, y))`.',
      ],
      example: {
        language: 'rust',
        code: 'enum Shape {\n    Circle(i32),\n    Rect(i32, i32),\n}\n\nfn width(s: Option<Shape>) -> i32 {\n    match s {\n        Some(Shape::Circle(r)) => r * 2,\n        Some(Shape::Rect(w, _)) => w,\n        None => 0,\n    }\n}\n\nfn main() {\n    println!(\n        "{} {}",\n        width(Some(Shape::Circle(3))),\n        width(Some(Shape::Rect(4, 9)))\n    );\n}',
        output: '6 4',
        explanation:
          'A circle’s width is twice its radius; for a rectangle only the first payload is bound.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'enum Shape {\n    Circle(i32),\n    Rect(i32, i32),\n}\n\nfn width(s: Option<Shape>) -> i32 {\n    match s {\n        Some(Shape::Circle(r)) => r * 2,\n        Some(Shape::Rect(w, _)) => w,\n        None => 0,\n    }\n}\n\nfn main() {\n    println!(\n        "{}",\n        width(Some(Shape::Circle(5))) + width(Some(Shape::Rect(4, 9))) + width(None)\n    );\n}',
          ['19', '13', '9', '14'],
          3,
          'Circle(5) gives 10, the Rect gives its width 4, and None gives 0.',
        ),
        predictOutput(
          'What does this program print?',
          'enum Event {\n    Key(i32),\n    Click((i32, i32)),\n}\n\nfn x_pos(e: Event) -> i32 {\n    match e {\n        Event::Click((x, _)) => x,\n        Event::Key(_) => -1,\n    }\n}\n\nfn main() {\n    println!(\n        "{} {}",\n        x_pos(Event::Click((12, 30))),\n        x_pos(Event::Key(65))\n    );\n}',
          ['30 -1', '12 65', '12 -1', '42 -1'],
          2,
          'The Click payload is a tuple; the pattern binds its first element and ignores the second.',
        ),
        predictOutput(
          'What does this program print?',
          'enum Shape {\n    Circle(i32),\n    Rect(i32, i32),\n}\n\nfn total(order: Option<(Shape, i32)>) -> i32 {\n    match order {\n        Some((Shape::Rect(w, h), n)) => w * h * n,\n        Some((Shape::Circle(_), n)) => n,\n        None => 0,\n    }\n}\n\nfn main() {\n    println!(\n        "{} {}",\n        total(Some((Shape::Rect(2, 5), 3))),\n        total(Some((Shape::Circle(7), 4)))\n    );\n}',
          ['10 4', '30 4', '30 7', '30 28'],
          1,
          'The Rect arm multiplies 2 * 5 by the count 3; the Circle arm ignores the radius and returns the count.',
        ),
        choose(
          'Which arm matches a Some holding a Rect whose first payload, the width, is exactly 0?',
          [
            'Some(Shape::Rect(0, _))',
            'Some(Shape::Rect(_, 0))',
            'Shape::Rect(Some(0), _)',
            'Some(Shape::Rect)(0)',
          ],
          0,
          'The Option is outermost, then the variant, and the literal 0 sits in the first payload position.',
        ),
      ],
    },
  ],
  'rust-option': [
    {
      title: 'Write Some and None and print them',
      explanation: [
        '`Option<T>` is either `Some(value)`, holding a T, or `None`, holding nothing. It takes the place of a null reference: code has to deal with None instead of reading a value that is not there.',
        'Print an Option with {:?}: it shows Some(3), None, or Some("hi") with the string’s quotes; {} cannot print it. When nothing else shows what a None would hold, write the type, as in `let x: Option<i32> = None;`.',
      ],
      example: {
        language: 'rust',
        code: 'fn main() {\n    let present: Option<i32> = Some(3);\n    let absent: Option<i32> = None;\n    let word = Some("hi");\n    println!("{:?} {:?} {:?}", present, absent, word);\n}',
        output: 'Some(3) None Some("hi")',
        explanation:
          'Each Option prints in Debug form; the text payload keeps its quotes inside Some.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn main() {\n    let a = Some(0);\n    let b: Option<i32> = None;\n    println!("{:?} {:?}", a, b);\n}',
          ['0 None', 'None None', 'Some(0) None', 'Some(0) Some(None)'],
          2,
          'Some(0) holds a real zero, which is different from None.',
        ),
        predictOutput(
          'What does this program print?',
          'fn main() {\n    let pair = Some((1, true));\n    println!("{:?}", pair);\n}',
          ['Some(1, true)', 'Some((1, true))', '(1, true)', 'Some([1, true])'],
          1,
          'The payload is a tuple, so its own parentheses appear inside Some( ).',
        ),
        choose(
          'What happens when this program is compiled?',
          [
            'It fails to compile: Option has no {} form',
            'It prints 5',
            'It prints Some(5)',
            'It prints 5, unwrapping the Some automatically',
          ],
          0,
          'Option has no {} form; {:?} would print Some(5).',
          'fn main() {\n    let x = Some(5);\n    println!("{}", x);\n}',
        ),
        predictOutput(
          'What does this program print?',
          'fn main() {\n    let names = [Some("a"), None];\n    println!("{:?}", names);\n}',
          [
            '[Some(a), None]',
            '["a", None]',
            '[Some("a")]',
            '[Some("a"), None]',
          ],
          3,
          'Each element prints in Debug form, and the string keeps its quotes inside Some.',
        ),
      ],
    },
    {
      title: 'Return None when there is no answer',
      explanation: [
        'When a function may have no answer, return `Option<T>`: `Some(answer)` when there is one and `None` when there is not. A made-up value such as 0 or -1 could be mistaken for a real answer.',
        'Every branch must produce the Option, so write `Some(x)` rather than a plain x.',
      ],
      example: {
        language: 'rust',
        code: 'fn last_value(values: &[i32]) -> Option<i32> {\n    if values.is_empty() {\n        None\n    } else {\n        Some(values[values.len() - 1])\n    }\n}\n\nfn main() {\n    println!("{:?} {:?}", last_value(&[4, 8, 15]), last_value(&[]));\n}',
        output: 'Some(15) None',
        explanation:
          'The non-empty slice has a last element, 15. The empty slice has none, so the function returns None instead of inventing a number.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn second(values: &[i32]) -> Option<i32> {\n    if values.len() >= 2 {\n        Some(values[1])\n    } else {\n        None\n    }\n}\n\nfn main() {\n    println!(\n        "{:?} {:?} {:?}",\n        second(&[9, 4, 1]),\n        second(&[9]),\n        second(&[])\n    );\n}',
          [
            'Some(9) None None',
            'Some(4) None None',
            'Some(4) Some(9) None',
            '4 None None',
          ],
          1,
          'Only the first slice has a second element; the shorter slices return None.',
        ),
        predictOutput(
          'What does this program print?',
          'fn remaining(have: i32, need: i32) -> Option<i32> {\n    if need > have {\n        None\n    } else {\n        Some(have - need)\n    }\n}\n\nfn main() {\n    println!("{:?} {:?}", remaining(5, 5), remaining(2, 7));\n}',
          ['None None', 'Some(0) Some(-5)', '0 None', 'Some(0) None'],
          3,
          '5 - 5 is a real answer, Some(0); needing 7 when you have 2 has no answer, so None.',
        ),
        choose(
          'A function returns the smallest number in a slice. What should it return for an empty slice?',
          [
            '0',
            'None, with return type Option<i32>',
            '-1',
            'The largest possible i32',
          ],
          1,
          'Any number could be a real minimum, so only None says that there is none.',
        ),
        choose(
          'What happens when this function is compiled?',
          [
            'It returns Some(0) for an empty slice',
            'It returns None for an empty slice',
            'It fails to compile: 0 is an i32, not an Option<i32>',
            'It panics on an empty slice',
          ],
          2,
          'Both branches must have type Option<i32>; the empty case should be None.',
          'fn first(values: &[i32]) -> Option<i32> {\n    if values.is_empty() {\n        0\n    } else {\n        Some(values[0])\n    }\n}',
        ),
      ],
    },
    {
      title: 'Get the first or last element safely',
      explanation: [
        'Slices have built-in lookups that may come up empty: `values.first()` and `values.last()` return `Option<&T>`, which is Some with a reference to the element, or None for an empty slice.',
        'Debug output does not show the reference, so it prints Some(70). Indexing with `values[0]` panics on an empty slice, while `first()` returns None.',
      ],
      example: {
        language: 'rust',
        code: 'fn main() {\n    let scores = [70, 85, 92];\n    let empty: &[i32] = &[];\n    println!("{:?} {:?}", scores.first(), scores.last());\n    println!("{:?}", empty.first());\n}',
        output: 'Some(70) Some(92)\nNone',
        explanation:
          'first and last find 70 and 92; the empty slice has neither, so first returns None.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn main() {\n    let words = ["red", "green", "blue"];\n    println!("{:?}", words.last());\n}',
          ['Some(blue)', '"blue"', 'Some("red")', 'Some("blue")'],
          3,
          'last gives Some with the final element, and Debug keeps the string’s quotes.',
        ),
        predictOutput(
          'What does this program print?',
          'fn main() {\n    let v = [5];\n    println!("{:?} {:?}", v.first(), v.last());\n}',
          ['Some(5) None', 'Some(5) Some(5)', '5 5', 'None Some(5)'],
          1,
          'With one element, that element is both the first and the last.',
        ),
        predictOutput(
          'What does this program print?',
          'fn main() {\n    let data = [1, 2, 3, 4];\n    println!("{:?} {:?}", data[2..].first(), data[..0].last());\n}',
          [
            'Some(2) None',
            'Some(3) Some(4)',
            'Some(3) None',
            'Some(3) Some(0)',
          ],
          2,
          'data[2..] starts at 3, and data[..0] is empty, so its last is None.',
        ),
        choose(
          'Why use values.first() rather than values[0] when values might be empty?',
          [
            'values[0] panics on an empty slice, while first() returns None',
            'first() copies the whole slice',
            'values[0] also returns None when the slice is empty',
            'first() is the only way to read a slice',
          ],
          0,
          'first() reports a missing element as None instead of stopping the program.',
        ),
      ],
    },
    {
      title: 'Match on Some and None',
      explanation: [
        'To use the value inside an Option, match on it: `match count { Some(n) => ..., None => ... }`. The Some arm binds the payload to n, the None arm handles absence, and both arms give a value of the same type.',
        'Both arms are required: a match that leaves out None does not compile. A pattern such as `Some(&x)` also unpacks the reference that first() and last() return.',
      ],
      example: {
        language: 'rust',
        code: 'fn describe(count: Option<i32>) -> String {\n    match count {\n        Some(n) => format!("{} found", n),\n        None => String::from("none found"),\n    }\n}\n\nfn main() {\n    println!("{}", describe(Some(3)));\n    println!("{}", describe(None));\n}',
        output: '3 found\nnone found',
        explanation:
          'Some(3) runs the first arm with n = 3; None runs the second arm.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn doubled_or(v: Option<i32>) -> i32 {\n    match v {\n        Some(n) => n * 2,\n        None => -1,\n    }\n}\n\nfn main() {\n    println!("{} {}", doubled_or(Some(0)), doubled_or(None));\n}',
          ['-1 -1', '0 -1', '2 -1', '0 0'],
          1,
          'Some(0) is present, so its arm doubles 0; only None gives -1.',
        ),
        predictOutput(
          'What does this program print?',
          'fn opening(values: &[i32]) -> String {\n    match values.first() {\n        Some(x) => format!("starts with {}", x),\n        None => String::from("empty"),\n    }\n}\n\nfn main() {\n    println!("{}", opening(&[8, 3]));\n}',
          ['starts with Some(8)', 'starts with 3', 'starts with 8', 'empty'],
          2,
          'The Some arm binds x to the first element, which {} prints as 8.',
        ),
        choose(
          'What happens when this function is compiled?',
          [
            'It compiles, and None returns 0',
            'It fails to compile: the None case is not handled',
            'It compiles, but panics when v is None',
            'It compiles, and None skips the match',
          ],
          1,
          'A match on an Option must cover both Some and None.',
          'fn value(v: Option<i32>) -> i32 {\n    match v {\n        Some(n) => n,\n    }\n}',
        ),
        predictOutput(
          'What does this program print?',
          'fn ends(values: &[i32]) -> i32 {\n    let a = match values.first() {\n        Some(&x) => x,\n        None => 0,\n    };\n    let b = match values.last() {\n        Some(&x) => x,\n        None => 0,\n    };\n    a + b\n}\n\nfn main() {\n    println!("{} {} {}", ends(&[2, 9, 4]), ends(&[7]), ends(&[]));\n}',
          ['6 7 0', '15 14 0', '6 0 0', '6 14 0'],
          3,
          'A one-element slice has the same first and last element, so 7 + 7; the empty slice gives 0 + 0.',
        ),
      ],
    },
  ],
  'rust-option-map': [
    {
      title: 'Transform a present value with map',
      explanation: [
        '`opt.map(f)` calls the function f on the value inside a Some and wraps the result in a new Some: with a doubling function, Some(3) becomes Some(6). A None stays None.',
        'Pass the function by name, without parentheses, as in `value.map(double)`; map calls it for you.',
      ],
      example: {
        language: 'rust',
        code: 'fn square(n: i32) -> i32 {\n    n * n\n}\n\nfn main() {\n    let a = Some(4);\n    let b: Option<i32> = None;\n    println!("{:?} {:?}", a.map(square), b.map(square));\n}',
        output: 'Some(16) None',
        explanation:
          'square runs on the 4 inside a, giving Some(16); b has no value, so it stays None.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn add_ten(n: i32) -> i32 {\n    n + 10\n}\n\nfn main() {\n    println!("{:?}", Some(-3).map(add_ten));\n}',
          ['7', 'Some(-13)', 'Some(7)', 'Some(Some(7))'],
          2,
          'add_ten receives -3 and returns 7, which map wraps in Some.',
        ),
        predictOutput(
          'What does this program print?',
          'fn add_ten(n: i32) -> i32 {\n    n + 10\n}\n\nfn main() {\n    let missing: Option<i32> = None;\n    println!("{:?}", missing.map(add_ten));\n}',
          ['Some(10)', 'None', '10', 'Some(None)'],
          1,
          'There is no value to transform, so map returns None.',
        ),
        choose(
          'With `fn square(n: i32) -> i32`, what is wrong with `opt.map(square())`?',
          [
            'Nothing; it squares the value',
            'map needs two arguments',
            'map only works on None',
            'square() calls square with no argument',
          ],
          3,
          'map wants the function itself, named without parentheses.',
        ),
        predictOutput(
          'What does this program print?',
          'fn inc(n: i32) -> i32 {\n    n + 1\n}\n\nfn triple(n: i32) -> i32 {\n    n * 3\n}\n\nfn main() {\n    println!("{:?}", Some(2).map(inc).map(triple));\n}',
          ['Some(9)', 'Some(7)', 'Some(6)', 'Some(3)'],
          0,
          'inc runs first and gives 3, then triple gives 9.',
        ),
      ],
    },
    {
      title: 'Know that None skips the function',
      explanation: [
        'For None, map never calls the function at all. You can see this when the function prints something: nothing is printed for a None.',
        '`opt.map(f)` does the same as `match opt { Some(x) => Some(f(x)), None => None }`.',
      ],
      example: {
        language: 'rust',
        code: 'fn announce(n: i32) -> i32 {\n    println!("called with {}", n);\n    n + 1\n}\n\nfn main() {\n    let a: Option<i32> = None;\n    let b = a.map(announce);\n    let c = Some(5).map(announce);\n    println!("{:?} {:?}", b, c);\n}',
        output: 'called with 5\nNone Some(6)',
        explanation:
          'announce runs only once, for the Some(5); mapping the None prints nothing and gives None.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn log(n: i32) -> i32 {\n    println!("log {}", n);\n    n\n}\n\nfn main() {\n    let x: Option<i32> = None;\n    let y = x.map(log).map(log);\n    println!("{:?}", y);\n}',
          ['None', 'log 0\nNone', 'log 0\nlog 0\nNone', 'Some(0)'],
          0,
          'Neither map has a value to pass on, so log never runs.',
        ),
        predictOutput(
          'What does this program print?',
          'fn log(n: i32) -> i32 {\n    println!("log {}", n);\n    n\n}\n\nfn main() {\n    let y = Some(2).map(log).map(log);\n    println!("{:?}", y);\n}',
          [
            'log 2\nSome(2)',
            'Some(2)',
            'Some(2)\nlog 2\nlog 2',
            'log 2\nlog 2\nSome(2)',
          ],
          3,
          'Each map calls log once with 2 before the last line prints the Option.',
        ),
        choose(
          'Which match does the same as `opt.map(neg)`?',
          [
            'match opt { Some(x) => neg(x), None => 0 }',
            'match opt { Some(x) => Some(x), None => None }',
            'match opt { Some(x) => Some(neg(x)), None => None }',
            'match opt { Some(x) => Some(neg(x)), None => Some(neg(0)) }',
          ],
          2,
          'map wraps the function’s result in Some and passes None through without a call.',
        ),
        predictOutput(
          'What does this program print?',
          'fn bump(n: i32) -> i32 {\n    println!("run");\n    n + 1\n}\n\nfn main() {\n    let a = Some(3);\n    let b: Option<i32> = None;\n    let r = a.map(bump);\n    let s = b.map(bump);\n    println!("{:?}", (r, s));\n}',
          [
            'run\n(Some(4), None)',
            'run\nrun\n(Some(4), None)',
            '(Some(4), None)',
            'run\n(Some(4), Some(1))',
          ],
          0,
          'bump runs only for a; b stays None without a call.',
        ),
      ],
    },
    {
      title: 'Change the payload type with map',
      explanation: [
        'The function decides what the new Some holds. Mapping an Option<i32> with a function that returns bool gives an Option<bool>; a function that returns a String gives an Option<String>.',
        'first() and last() give Option<&i32>, so a function mapped over them takes &i32. Arithmetic works on a &i32 directly, as in `n * 2`.',
      ],
      example: {
        language: 'rust',
        code: 'fn describe(n: &i32) -> String {\n    format!("item {}", n)\n}\n\nfn main() {\n    let items = [7, 3];\n    let none: &[i32] = &[];\n    println!("{:?}", items.first().map(describe));\n    println!("{:?}", none.first().map(describe));\n}',
        output: 'Some("item 7")\nNone',
        explanation:
          'describe turns the &i32 into a String, so the result is an Option<String>; the empty slice gives None.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn is_big(n: i32) -> bool {\n    n > 100\n}\n\nfn main() {\n    println!("{:?} {:?}", Some(250).map(is_big), Some(5).map(is_big));\n}',
          [
            'true false',
            'Some(250) None',
            'Some(true) Some(false)',
            'Some(true) None',
          ],
          2,
          'map wraps each bool in Some; a false result is still a present value.',
        ),
        predictOutput(
          'What does this program print?',
          'fn with_square(n: i32) -> (i32, i32) {\n    (n, n * n)\n}\n\nfn main() {\n    println!("{:?}", Some(3).map(with_square));\n}',
          ['Some(3, 9)', 'Some((9, 3))', '(3, 9)', 'Some((3, 9))'],
          3,
          'The function returns a tuple, so map produces a Some holding that tuple.',
        ),
        predictOutput(
          'What does this program print?',
          'fn plus_one(n: &i32) -> i32 {\n    n + 1\n}\n\nfn main() {\n    let v = [10, 20, 30];\n    println!("{:?}", v.last().map(plus_one));\n}',
          ['Some(11)', 'Some(31)', 'Some(30)', '31'],
          1,
          'last gives a reference to 30, and plus_one returns 31 inside Some.',
        ),
        choose(
          '`values.first()` on a slice of i32 gives `Option<&i32>`. Which function can be passed straight to its map?',
          [
            'fn f(n: &i32) -> i32',
            'fn f(n: i32) -> i32',
            'fn f(n: Option<i32>) -> i32',
            'fn f() -> i32',
          ],
          0,
          'map hands the payload itself to the function, and here the payload is a &i32.',
        ),
      ],
    },
    {
      title: 'Build a small pipeline with map',
      explanation: [
        'Several maps can be chained, each one transforming the result of the one before; a None anywhere passes straight through to the end.',
        'map wraps whatever the function returns. If the function itself returns an Option, the result is nested, such as Some(Some(3)) or Some(None).',
      ],
      example: {
        language: 'rust',
        code: 'fn cents(n: &i32) -> i32 {\n    n * 100\n}\n\nfn price_tag(c: i32) -> String {\n    format!("{} cents", c)\n}\n\nfn first_price(prices: &[i32]) -> Option<String> {\n    prices.first().map(cents).map(price_tag)\n}\n\nfn main() {\n    println!("{:?}", first_price(&[3, 8]));\n    println!("{:?}", first_price(&[]));\n}',
        output: 'Some("300 cents")\nNone',
        explanation:
          'The first price 3 becomes 300 and then the String "300 cents"; the empty slice stays None through both maps.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn negate(n: &i32) -> i32 {\n    -n\n}\n\nfn is_positive(n: i32) -> bool {\n    n > 0\n}\n\nfn main() {\n    let values = [4, -2];\n    println!("{:?}", values.last().map(negate).map(is_positive));\n}',
          ['Some(false)', 'Some(true)', 'Some(2)', 'None'],
          1,
          'The last value, -2, is negated to 2, which is positive.',
        ),
        predictOutput(
          'What does this program print?',
          'fn positive(n: i32) -> Option<i32> {\n    if n > 0 {\n        Some(n)\n    } else {\n        None\n    }\n}\n\nfn main() {\n    println!("{:?} {:?}", Some(3).map(positive), Some(-3).map(positive));\n}',
          [
            'Some(3) None',
            'Some(3) Some(None)',
            'Some(Some(3)) None',
            'Some(Some(3)) Some(None)',
          ],
          3,
          'map wraps the Option that positive returns in another Some, so the results are nested.',
        ),
        choose(
          'a is None. In `a.map(f).map(g)`, which functions are called?',
          [
            'f once, g never',
            'Neither f nor g',
            'Both, once each',
            'Only g, with None',
          ],
          1,
          'The first map returns None without calling f, and the second does the same for g.',
        ),
        predictOutput(
          'What does this program print?',
          'fn cents(n: &i32) -> i32 {\n    n * 100\n}\n\nfn tag(c: i32) -> String {\n    format!("{}c", c)\n}\n\nfn main() {\n    let prices = [7, 2];\n    let empty: &[i32] = &[];\n    println!(\n        "{:?} {:?}",\n        prices.last().map(cents).map(tag),\n        empty.last().map(cents).map(tag)\n    );\n}',
          [
            'Some("200c") None',
            'Some("700c") None',
            'Some(200c) None',
            'Some("200c") Some("0c")',
          ],
          0,
          'last picks 2, which becomes 200 and then the String "200c"; the empty slice stays None.',
        ),
      ],
    },
  ],
  'rust-option-and-then': [
    {
      title: 'Chain a step that can itself fail',
      explanation: [
        'When the function you want to apply returns an Option, map would nest the result, as in Some(Some(5)) or Some(None). `opt.and_then(f)` calls f on the payload and returns f’s Option directly.',
        'As with map, a None input stays None and f is never called.',
      ],
      example: {
        language: 'rust',
        code: 'fn positive(n: i32) -> Option<i32> {\n    if n > 0 {\n        Some(n)\n    } else {\n        None\n    }\n}\n\nfn main() {\n    println!("{:?}", Some(5).map(positive));\n    println!("{:?}", Some(5).and_then(positive));\n    println!("{:?}", Some(-2).and_then(positive));\n}',
        output: 'Some(Some(5))\nSome(5)\nNone',
        explanation:
          'map wraps the Option that positive returns; and_then hands it back as it is, so -2 ends as plain None.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn share(n: i32) -> Option<i32> {\n    let total: i32 = 100;\n    total.checked_div(n)\n}\n\nfn main() {\n    println!(\n        "{:?} {:?}",\n        Some(4).and_then(share),\n        Some(0).and_then(share)\n    );\n}',
          [
            'Some(25) Some(0)',
            'Some(Some(25)) None',
            'Some(25) None',
            '25 None',
          ],
          2,
          'and_then returns share’s own result: Some(25), or None for a division by zero.',
        ),
        predictOutput(
          'What does this program print?',
          'fn positive(n: i32) -> Option<i32> {\n    if n > 0 {\n        Some(n)\n    } else {\n        None\n    }\n}\n\nfn main() {\n    let x = Some(-1);\n    println!("{:?} {:?}", x.and_then(positive), x.map(positive));\n}',
          ['None None', 'None Some(None)', 'Some(None) None', 'Some(-1) None'],
          1,
          'and_then returns positive’s None as it is; map wraps it, giving Some(None).',
        ),
        choose(
          'A step returns Option<i32>. Which call avoids ending up with Option<Option<i32>>?',
          [
            'opt.map(step)',
            'Some(opt.map(step))',
            'step(opt)',
            'opt.and_then(step)',
          ],
          3,
          'and_then flattens the result by returning the step’s Option directly.',
        ),
        predictOutput(
          'What does this program print?',
          'fn double_small(n: i32) -> Option<i32> {\n    if n <= 10 {\n        Some(n * 2)\n    } else {\n        None\n    }\n}\n\nfn main() {\n    println!(\n        "{:?} {:?}",\n        Some(10).and_then(double_small),\n        Some(11).and_then(double_small)\n    );\n}',
          ['Some(20) None', 'Some(20) Some(22)', 'Some(10) None', 'None None'],
          0,
          '10 passes the check and doubles to 20; 11 fails it, so the result is None.',
        ),
      ],
    },
    {
      title: 'Divide safely through a named checked-division function',
      explanation: [
        'and_then passes exactly one value to the function. To use two numbers, put them in a tuple: build Some((n, divisor)) and pass a function that takes (i32, i32) and returns `pair.0.checked_div(pair.1)`.',
        'checked_div returns None for a zero divisor or an overflowing division, so the chain ends in None instead of panicking.',
      ],
      example: {
        language: 'rust',
        code: 'fn divide_pair(pair: (i32, i32)) -> Option<i32> {\n    pair.0.checked_div(pair.1)\n}\n\nfn per_person(total: Option<i32>, people: i32) -> Option<i32> {\n    let pair = match total {\n        Some(t) => Some((t, people)),\n        None => None,\n    };\n    pair.and_then(divide_pair)\n}\n\nfn main() {\n    println!(\n        "{:?} {:?}",\n        per_person(Some(12), 4),\n        per_person(Some(12), 0)\n    );\n}',
        output: 'Some(3) None',
        explanation:
          '12 split 4 ways is Some(3); with 0 people, checked_div returns None.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn divide_pair(pair: (i32, i32)) -> Option<i32> {\n    pair.0.checked_div(pair.1)\n}\n\nfn per_person(total: Option<i32>, people: i32) -> Option<i32> {\n    let pair = match total {\n        Some(t) => Some((t, people)),\n        None => None,\n    };\n    pair.and_then(divide_pair)\n}\n\nfn main() {\n    println!("{:?} {:?}", per_person(None, 3), per_person(Some(-12), 4));\n}',
          ['Some(0) Some(-3)', 'None Some(3)', 'None None', 'None Some(-3)'],
          3,
          'A missing total stays None, and -12 divided by 4 is -3.',
        ),
        predictOutput(
          'What does this program print?',
          'fn split(pair: (i32, i32)) -> Option<i32> {\n    pair.0.checked_div(pair.1)\n}\n\nfn main() {\n    println!("{:?}", Some((20, 5)).and_then(split));\n    println!("{:?}", Some((20, 0)).and_then(split));\n}',
          [
            'Some(4)\nSome(0)',
            '4\nNone',
            'Some(4)\nNone',
            'Some(4)\nSome(None)',
          ],
          2,
          'Both inputs are Some, so split runs each time; dividing by zero gives None instead of a panic.',
        ),
        choose(
          'Why does divide_pair take one tuple instead of two i32 parameters?',
          [
            'and_then passes exactly one value, the payload, to the function',
            'checked_div only works on tuples',
            'Tuples divide faster than separate numbers',
            'Functions with two parameters cannot return an Option',
          ],
          0,
          'The Some payload is the only argument, so both numbers must travel together inside it.',
        ),
        predictOutput(
          'What does this program print?',
          'fn divide_pair(pair: (i32, i32)) -> Option<i32> {\n    pair.0.checked_div(pair.1)\n}\n\nfn main() {\n    let input = Some((9, 0));\n    println!(\n        "{:?} {:?}",\n        input.map(divide_pair),\n        input.and_then(divide_pair)\n    );\n}',
          [
            'None None',
            'Some(None) None',
            'Some(0) None',
            'Some(None) Some(None)',
          ],
          1,
          'map wraps the None from checked_div in Some; and_then returns it directly.',
        ),
      ],
    },
    {
      title: 'Run a chain of steps that may fail',
      explanation: [
        'Each and_then in a chain runs only if every earlier step produced Some. The first None skips all the remaining steps, and the chain ends with None.',
        'map and and_then mix freely: use map for a step that always succeeds and and_then for one that may not. The payload can be any type, including an enum.',
      ],
      example: {
        language: 'rust',
        code: 'fn non_negative(n: i32) -> Option<i32> {\n    if n >= 0 {\n        Some(n)\n    } else {\n        None\n    }\n}\n\nfn below_hundred(n: i32) -> Option<i32> {\n    if n < 100 {\n        Some(n)\n    } else {\n        None\n    }\n}\n\nfn doubled(n: i32) -> i32 {\n    n * 2\n}\n\nfn check(n: i32) -> Option<i32> {\n    Some(n)\n        .and_then(non_negative)\n        .and_then(below_hundred)\n        .map(doubled)\n}\n\nfn main() {\n    println!("{:?} {:?}", check(30), check(-4));\n}',
        output: 'Some(60) None',
        explanation:
          '30 passes both checks and doubles to 60; -4 fails the first check, so the rest of the chain is skipped.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn non_negative(n: i32) -> Option<i32> {\n    if n >= 0 {\n        Some(n)\n    } else {\n        None\n    }\n}\n\nfn below_hundred(n: i32) -> Option<i32> {\n    if n < 100 {\n        Some(n)\n    } else {\n        None\n    }\n}\n\nfn doubled(n: i32) -> i32 {\n    n * 2\n}\n\nfn check(n: i32) -> Option<i32> {\n    Some(n)\n        .and_then(non_negative)\n        .and_then(below_hundred)\n        .map(doubled)\n}\n\nfn main() {\n    println!("{:?} {:?}", check(150), check(0));\n}',
          [
            'Some(300) Some(0)',
            'None Some(0)',
            'None None',
            'Some(150) Some(0)',
          ],
          1,
          '150 fails below_hundred; 0 passes both checks and doubles to 0.',
        ),
        predictOutput(
          'What does this program print?',
          'fn step(n: i32) -> Option<i32> {\n    println!("step {}", n);\n    if n > 0 {\n        Some(n - 1)\n    } else {\n        None\n    }\n}\n\nfn main() {\n    println!("{:?}", Some(1).and_then(step).and_then(step).and_then(step));\n}',
          [
            'step 1\nstep 0\nstep -1\nNone',
            'step 1\nNone',
            'step 1\nstep 0\nSome(0)',
            'step 1\nstep 0\nNone',
          ],
          3,
          'step(1) returns Some(0), step(0) returns None, and the third and_then never calls step.',
        ),
        choose(
          'a is Some. In `a.and_then(f).map(g).and_then(h)`, f returns None. Which functions run?',
          ['f, g, and h', 'Only f', 'f and g', 'None of them'],
          1,
          'Once f returns None, map and the second and_then pass None along without calling g or h.',
        ),
        predictOutput(
          'What does this program print?',
          'enum Token {\n    Num(i32),\n    Word,\n}\n\nfn as_num(t: Token) -> Option<i32> {\n    match t {\n        Token::Num(n) => Some(n),\n        Token::Word => None,\n    }\n}\n\nfn below_hundred(n: i32) -> Option<i32> {\n    if n < 100 {\n        Some(n)\n    } else {\n        None\n    }\n}\n\nfn main() {\n    let a = Some(Token::Num(8)).and_then(as_num).and_then(below_hundred);\n    let b = Some(Token::Word).and_then(as_num).and_then(below_hundred);\n    println!("{:?} {:?}", a, b);\n}',
          ['Some(8) None', 'Some(Num(8)) None', 'Some(8) Some(Word)', '8 None'],
          0,
          'as_num turns a Num into Some(8), which passes the check; a Word becomes None and stops the chain.',
        ),
      ],
    },
  ],
  'rust-option-transpose': [
    {
      title: 'Swap Option<Result> into Result<Option>',
      explanation: [
        '`transpose` swaps the two layers of an `Option<Result<T, E>>`: Some(Ok(v)) becomes Ok(Some(v)), Some(Err(e)) becomes Err(e), and None becomes Ok(None).',
        'So a missing value counts as a success with nothing in it, while an error that is present stays an error.',
      ],
      example: {
        language: 'rust',
        code: 'fn main() {\n    let a: Option<Result<i32, &str>> = Some(Ok(5));\n    let b: Option<Result<i32, &str>> = Some(Err("bad"));\n    let c: Option<Result<i32, &str>> = None;\n    println!("{:?}", a.transpose());\n    println!("{:?}", b.transpose());\n    println!("{:?}", c.transpose());\n}',
        output: 'Ok(Some(5))\nErr("bad")\nOk(None)',
        explanation:
          'The Ok moves outside the Some, the error is kept as the error, and the None becomes a successful None.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn main() {\n    let x: Option<Result<i32, &str>> = Some(Ok(0));\n    println!("{:?}", x.transpose());\n}',
          ['Some(Ok(0))', 'Ok(0)', 'Ok(None)', 'Ok(Some(0))'],
          3,
          'The Ok moves to the outside and the Some to the inside; the 0 is still present.',
        ),
        predictOutput(
          'What does this program print?',
          'fn main() {\n    let x: Option<Result<bool, &str>> = None;\n    println!("{:?}", x.transpose());\n}',
          ['None', 'Err(None)', 'Ok(None)', 'Ok(Some(false))'],
          2,
          'An absent value becomes a successful Result holding None.',
        ),
        predictOutput(
          'What does this program print?',
          'fn main() {\n    let x: Option<Result<i32, &str>> = Some(Err("empty"));\n    println!("{:?}", x.transpose());\n}',
          [
            'Err("empty")',
            'Some(Err("empty"))',
            'Err(Some("empty"))',
            'Ok(None)',
          ],
          0,
          'An error that is present is kept as the error of the outer Result.',
        ),
        choose(
          'What type does transpose turn `Option<Result<u8, String>>` into?',
          [
            'Option<Option<u8>>',
            'Result<Option<u8>, String>',
            'Result<u8, Option<String>>',
            'Result<Option<u8>, Option<String>>',
          ],
          1,
          'The Result moves outside with the same error type, and the Option moves inside around the u8.',
        ),
      ],
    },
    {
      title: 'Parse optional text with map and transpose',
      explanation: [
        'To parse an input that may be missing, map the parse function over the Option and then transpose. `str::parse::<i32>` names parse as a function that takes a &str, so it can be passed to map like any named function.',
        '`text.map(str::parse::<i32>)` gives an Option<Result<i32, ParseIntError>>, and `.transpose()` turns it into a Result<Option<i32>, ParseIntError>. Missing text is Ok(None), a valid number is Ok(Some(n)), and bad text is an Err.',
      ],
      example: {
        language: 'rust',
        code: 'fn optional_age(text: Option<&str>) -> Result<Option<i32>, std::num::ParseIntError> {\n    text.map(str::parse::<i32>).transpose()\n}\n\nfn main() {\n    println!("{:?}", optional_age(Some("41")));\n    println!("{:?}", optional_age(None));\n    match optional_age(Some("4x1")) {\n        Ok(v) => println!("ok {:?}", v),\n        Err(_) => println!("parse error"),\n    }\n}',
        output: 'Ok(Some(41))\nOk(None)\nparse error',
        explanation:
          '"41" parses, the missing text stays a successful None, and "4x1" keeps its parse error.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn optional_age(text: Option<&str>) -> Result<Option<i32>, std::num::ParseIntError> {\n    text.map(str::parse::<i32>).transpose()\n}\n\nfn main() {\n    println!("{:?}", optional_age(Some("-7")));\n}',
          ['Some(Ok(-7))', 'Ok(Some(-7))', 'Ok(Some(7))', 'Ok(-7)'],
          1,
          'The text parses to -7, and transpose puts the Ok outside the Some.',
        ),
        predictOutput(
          'What does this program print?',
          'fn read(text: Option<&str>) -> Result<Option<i32>, std::num::ParseIntError> {\n    text.map(str::parse::<i32>).transpose()\n}\n\nfn report(text: Option<&str>) -> String {\n    match read(text) {\n        Ok(v) => format!("ok {:?}", v),\n        Err(_) => String::from("parse error"),\n    }\n}\n\nfn main() {\n    println!("{}", report(Some("12a")));\n    println!("{}", report(None));\n}',
          [
            'ok None\nok None',
            'parse error\nparse error',
            'parse error\nok None',
            'ok Some(12)\nok None',
          ],
          2,
          '"12a" is not a number, so its error is kept; missing text is a successful None.',
        ),
        choose(
          'A setting may be absent, which is fine, or present but malformed, which is an error. Which return type keeps these cases apart?',
          [
            'Option<i32>',
            'Result<i32, ParseIntError>',
            'Option<Option<i32>>',
            'Result<Option<i32>, ParseIntError>',
          ],
          3,
          'Ok(None) means absent, Ok(Some(n)) means present and valid, and Err means malformed.',
        ),
        predictOutput(
          'What does this program print?',
          'fn read_level(text: Option<&str>) -> Result<Option<u8>, std::num::ParseIntError> {\n    text.map(str::parse::<u8>).transpose()\n}\n\nfn main() {\n    println!("{:?} {:?}", read_level(Some("255")), read_level(None));\n}',
          [
            'Ok(Some(255)) Ok(None)',
            'Ok(Some(255)) None',
            'Some(Ok(255)) None',
            'Ok(Some(255)) Err(None)',
          ],
          0,
          '255 fits in a u8, and a missing level is Ok(None).',
        ),
      ],
    },
    {
      title: 'Propagate the error with ? after transpose',
      explanation: [
        'After transpose the value is an ordinary Result, so ? can propagate it: `let tip = text.map(str::parse::<i32>).transpose()?;` returns early on bad text and otherwise leaves an Option<i32>.',
        'The remaining Option can then be matched or mapped, for example to treat a missing value as 0.',
      ],
      example: {
        language: 'rust',
        code: 'fn total_with_tip(bill: &str, tip: Option<&str>) -> Result<i32, std::num::ParseIntError> {\n    let base = bill.parse::<i32>()?;\n    let extra = tip.map(str::parse::<i32>).transpose()?;\n    let added = match extra {\n        Some(t) => t,\n        None => 0,\n    };\n    Ok(base + added)\n}\n\nfn main() {\n    println!("{:?}", total_with_tip("40", Some("6")));\n    println!("{:?}", total_with_tip("40", None));\n}',
        output: 'Ok(46)\nOk(40)',
        explanation:
          'With a tip, extra is Some(6) and the total is 46; without one, extra is None and counts as 0.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn total_with_tip(bill: &str, tip: Option<&str>) -> Result<i32, std::num::ParseIntError> {\n    let base = bill.parse::<i32>()?;\n    let extra = tip.map(str::parse::<i32>).transpose()?;\n    let added = match extra {\n        Some(t) => t,\n        None => 0,\n    };\n    Ok(base + added)\n}\n\nfn main() {\n    match total_with_tip("40", Some("six")) {\n        Ok(n) => println!("{}", n),\n        Err(_) => println!("rejected"),\n    }\n}',
          ['40', '46', 'rejected', 'Ok(40)'],
          2,
          '"six" fails to parse, and ? returns that error before any total is built.',
        ),
        predictOutput(
          'What does this program print?',
          'fn double(n: i32) -> i32 {\n    n * 2\n}\n\nfn doubled(text: Option<&str>) -> Result<Option<i32>, std::num::ParseIntError> {\n    let n = text.map(str::parse::<i32>).transpose()?;\n    Ok(n.map(double))\n}\n\nfn main() {\n    println!("{:?} {:?}", doubled(Some("21")), doubled(None));\n}',
          [
            'Ok(Some(21)) Ok(None)',
            'Ok(Some(42)) Ok(None)',
            'Some(42) None',
            'Ok(Some(42)) Ok(Some(0))',
          ],
          1,
          'After ?, n is Some(21) or None; map doubles a present value and leaves None alone.',
        ),
        choose(
          'In `let n = text.map(str::parse::<i32>).transpose()?;`, what is the type of n?',
          [
            'Result<Option<i32>, ParseIntError>',
            'i32',
            'Option<Result<i32, ParseIntError>>',
            'Option<i32>',
          ],
          3,
          'transpose gives Result<Option<i32>, ParseIntError>, and ? removes the Result layer.',
        ),
        predictOutput(
          'What does this program print?',
          'fn read(text: Option<&str>) -> Result<i32, std::num::ParseIntError> {\n    let n = text.map(str::parse::<i32>).transpose()?;\n    match n {\n        Some(v) => Ok(v),\n        None => Ok(0),\n    }\n}\n\nfn main() {\n    println!("{:?} {:?}", read(None), read(Some("5")));\n}',
          [
            'Ok(0) Ok(5)',
            'Err(None) Ok(5)',
            'Ok(None) Ok(Some(5))',
            'None Ok(5)',
          ],
          0,
          'None transposes to Ok(None), so ? continues with n = None and the match returns Ok(0).',
        ),
      ],
    },
  ],
  'rust-result': [
    {
      title: 'Return Ok for success and Err for failure',
      explanation: [
        'Result<T, E> is an enum with two variants. Ok(T) carries the value a function produced; Err(E) carries a description of why it could not produce one. A function that can fail names both types in its return type and returns exactly one of the variants.',
        'With {:?}, a Result prints as its variant name with the payload inside: Ok(5), or Err("odd"), with the quotes that a string always has in Debug output.',
      ],
      example: {
        language: 'rust',
        code: 'fn half(n: i32) -> Result<i32, &\'static str> {\n    if n % 2 == 0 {\n        Ok(n / 2)\n    } else {\n        Err("odd")\n    }\n}\n\nfn main() {\n    println!("{:?}", half(10));\n    println!("{:?}", half(7));\n}',
        output: 'Ok(5)\nErr("odd")',
        explanation:
          '10 is even, so half returns Ok holding 5. 7 is odd, so half returns Err holding a message instead of inventing a number.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn checked_age(age: i32) -> Result<i32, &\'static str> {\n    if age < 0 {\n        Err("negative age")\n    } else if age > 150 {\n        Err("too large")\n    } else {\n        Ok(age)\n    }\n}\n\nfn main() {\n    println!("{:?}", checked_age(200));\n}',
          [
            'Ok(200)',
            'Err(too large)',
            'Err("too large")',
            'Err("negative age")',
          ],
          2,
          '200 is not negative but it is above 150, so the second branch returns Err with that message, which {:?} prints in quotes.',
        ),
        predictOutput(
          'What is printed?',
          'fn ratio(a: f64, b: f64) -> Result<f64, &\'static str> {\n    if b == 0.0 {\n        Err("division by zero")\n    } else {\n        Ok(a / b)\n    }\n}\n\nfn main() {\n    println!("{:?}", ratio(6.0, 3.0));\n}',
          ['Ok(2)', 'Ok(2.0)', '2.0', 'Err("division by zero")'],
          1,
          'The divisor is not zero, so the result is Ok holding 6.0 / 3.0. Debug output of an f64 always shows the decimal point.',
        ),
        choose(
          "A function is declared to return Result<u32, &'static str>. Which of these can its body return?",
          ['Err(7)', 'Ok("7")', 'Ok(-7)', 'Ok(7)'],
          3,
          'The first type is the Ok payload and the second is the Err payload, so Ok must hold a u32 and Err a string. A u32 cannot be negative.',
        ),
        predictOutput(
          'What does this program print?',
          'fn label(code: i32) -> Result<&\'static str, String> {\n    if code == 200 {\n        Ok("fine")\n    } else {\n        Err(format!("code {}", code))\n    }\n}\n\nfn main() {\n    println!("{:?}", label(404));\n}',
          ['Err("code 404")', 'Err(code 404)', 'Ok("fine")', 'Err("code {}")'],
          0,
          'format! fills {} with 404, and the String payload prints with quotes inside Err.',
        ),
      ],
    },
    {
      title: 'Handle both variants with match',
      explanation: [
        'Because Result is an enum, the caller reads it with match: one arm for Ok(value) and one for Err(error), each binding the payload to a name. Inside an arm the payload is a plain value, so printing it with {} shows no variant name and no quotes.',
        'match must be exhaustive, so a caller cannot forget the failure case: leaving out the Err arm is a compile error.',
      ],
      example: {
        language: 'rust',
        code: 'fn withdraw(balance: i32, amount: i32) -> Result<i32, &\'static str> {\n    if amount > balance {\n        Err("insufficient funds")\n    } else {\n        Ok(balance - amount)\n    }\n}\n\nfn main() {\n    match withdraw(50, 80) {\n        Ok(left) => println!("left: {}", left),\n        Err(reason) => println!("failed: {}", reason),\n    }\n}',
        output: 'failed: insufficient funds',
        explanation:
          '80 is more than the balance of 50, so withdraw returns Err. The Err arm binds the message to reason and prints it with {}, without quotes.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn seats_left(capacity: i32, booked: i32) -> Result<i32, &\'static str> {\n    if booked > capacity {\n        Err("overbooked")\n    } else {\n        Ok(capacity - booked)\n    }\n}\n\nfn main() {\n    match seats_left(30, 12) {\n        Ok(n) => println!("{} seats", n),\n        Err(e) => println!("error: {}", e),\n    }\n}',
          ['Ok(18) seats', '18 seats', 'error: overbooked', '42 seats'],
          1,
          '12 is not above 30, so the result is Ok(18). The Ok arm binds 18 to n and prints it without the Ok wrapper.',
        ),
        predictOutput(
          'What is printed?',
          'fn level(score: i32) -> Result<i32, &\'static str> {\n    if score < 0 {\n        Err("bad score")\n    } else {\n        Ok(score / 10)\n    }\n}\n\nfn main() {\n    let shown = match level(-25) {\n        Ok(n) => n,\n        Err(_) => 0,\n    };\n    println!("{}", shown);\n}',
          ['-2', '-3', '0', 'bad score'],
          2,
          'level returns Err for a negative score, so the match takes the Err(_) arm, which produces 0. The message is ignored.',
        ),
        choose(
          'What happens when you compile this program?',
          [
            'It prints 3, since the value is Ok',
            'It prints Ok(3)',
            'It compiles but prints nothing',
            'It fails to compile because Err is not handled',
          ],
          3,
          'match must cover every variant of Result. Without an Err arm the compiler rejects the program, even though this particular value is Ok.',
          'fn main() {\n    let result: Result<i32, &str> = Ok(3);\n    match result {\n        Ok(n) => println!("{}", n),\n    }\n}',
        ),
        predictOutput(
          'What does this program print?',
          'fn pick(index: usize) -> Result<&\'static str, usize> {\n    let names = ["ann", "bo", "cy"];\n    if index < names.len() {\n        Ok(names[index])\n    } else {\n        Err(index)\n    }\n}\n\nfn main() {\n    match pick(3) {\n        Ok(name) => println!("found {}", name),\n        Err(i) => println!("no item at {}", i),\n    }\n}',
          ['no item at 3', 'found cy', 'Err(3)', 'no item at Err(3)'],
          0,
          'The array has indexes 0 to 2, so 3 is not below names.len() and pick returns Err(3). The Err arm binds the plain number and prints it.',
        ),
      ],
    },
    {
      title: 'Return Err instead of a made-up value',
      explanation: [
        'Without Result, a function might signal failure with a special value such as -1 or 0. That value looks like a real answer, so a caller can use it by mistake, and it cannot say what went wrong.',
        'Returning Err keeps failure apart from every legitimate result: the caller has to deal with it, and the payload explains the problem.',
      ],
      example: {
        language: 'rust',
        code: 'fn average(total: i32, count: i32) -> Result<i32, &\'static str> {\n    if count == 0 {\n        Err("no items")\n    } else {\n        Ok(total / count)\n    }\n}\n\nfn main() {\n    println!("{:?}", average(0, 4));\n    println!("{:?}", average(0, 0));\n}',
        output: 'Ok(0)\nErr("no items")',
        explanation:
          'Both calls have a total of 0, but only the first has a real average. If average returned 0 for no items, the two results would look identical; Err keeps them apart.',
      },
      questions: [
        choose(
          "A function looks up the position of a name in a list. Why return Result<usize, &'static str> rather than -1 when the name is missing?",
          [
            'Result makes the lookup run faster than returning a number',
            'Err stops the program before the bad value can spread',
            'A missing name becomes Err, which cannot be mistaken for a position',
            'Only because usize cannot hold -1; otherwise the designs are equal',
          ],
          2,
          'Err is a separate variant, so no real position can be confused with failure, and the caller must handle it. Err does not stop the program.',
        ),
        predictOutput(
          'What does this program print?',
          'fn discount(price: i32, percent: i32) -> Result<i32, &\'static str> {\n    if percent < 0 || percent > 100 {\n        Err("percent out of range")\n    } else {\n        Ok(price - price * percent / 100)\n    }\n}\n\nfn main() {\n    println!("{:?}", discount(80, 100));\n    println!("{:?}", discount(80, 120));\n}',
          [
            'Ok(0)\nOk(-16)',
            'Ok(80)\nErr("percent out of range")',
            'Ok(0)\nErr("percent out of range")',
            'Err("percent out of range")\nErr("percent out of range")',
          ],
          2,
          '100 is inside the allowed range, so the first call computes 80 - 80 = 0. 120 is out of range, so the second returns Err instead of a negative price.',
        ),
        choose(
          "fn floor_sqrt(n: i32) -> Result<i32, &'static str> has no meaningful answer for n = -9. What should it return?",
          ['Ok(0)', 'Err("negative")', 'Ok(-3)', 'Ok(i32::MIN)'],
          1,
          'No integer squared gives -9. Any Ok value would be an invented answer, so the function should return Err and say why.',
        ),
        predictOutput(
          'What is printed?',
          'fn temperature(reading: i32) -> Result<i32, String> {\n    if reading < -90 {\n        Err(format!("sensor fault: {}", reading))\n    } else {\n        Ok(reading)\n    }\n}\n\nfn main() {\n    match temperature(-120) {\n        Ok(t) => println!("{} degrees", t),\n        Err(message) => println!("{}", message),\n    }\n}',
          [
            'sensor fault: -120',
            'Err("sensor fault: -120")',
            '-120 degrees',
            '"sensor fault: -120"',
          ],
          0,
          '-120 is below -90, so temperature returns Err with a formatted message. The Err arm prints that String with {}, so no quotes appear.',
        ),
      ],
    },
  ],
  'rust-result-map': [
    {
      title: 'Apply a function to the Ok value with map',
      explanation: [
        'result.map(f) calls f on the value inside Ok and wraps what f returns in a new Ok. If the result is Err, map returns that same Err and never calls f.',
        'Pass the function by name, without parentheses: map(square), not map(square()). map does the calling.',
      ],
      example: {
        language: 'rust',
        code: 'fn square(n: i32) -> i32 {\n    n * n\n}\n\nfn main() {\n    let good: Result<i32, &str> = Ok(4);\n    let bad: Result<i32, &str> = Err("no input");\n    println!("{:?}", good.map(square));\n    println!("{:?}", bad.map(square));\n}',
        output: 'Ok(16)\nErr("no input")',
        explanation:
          'good holds 4, so map calls square(4) and wraps 16 in Ok. bad is Err, so map hands back the same Err without calling square.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn add_tax(cents: i32) -> i32 {\n    cents + cents / 10\n}\n\nfn main() {\n    let price: Result<i32, &str> = Ok(250);\n    println!("{:?}", price.map(add_tax));\n}',
          ['275', 'Ok(250)', 'Ok(25)', 'Ok(275)'],
          3,
          'map calls add_tax(250), which adds 250 / 10 = 25, and wraps the result in Ok.',
        ),
        predictOutput(
          'What is printed?',
          'fn negate(n: i32) -> i32 {\n    -n\n}\n\nfn main() {\n    let value: Result<i32, &str> = Err("sensor offline");\n    println!("{:?}", value.map(negate));\n}',
          [
            'Ok(0)',
            'Err("sensor offline")',
            'Ok("sensor offline")',
            'sensor offline',
          ],
          1,
          'The value is Err, so map returns it unchanged and negate is never called.',
        ),
        choose(
          'Why does this program fail to compile?',
          [
            'map works only on Option, not on Result',
            'double must return a Result to be used with map',
            'double() calls the function instead of passing it',
            'r must be declared mut before map can be called',
          ],
          2,
          'map needs the function itself, written double. double() tries to call it right away with no argument, which does not compile.',
          'fn double(n: i32) -> i32 {\n    n * 2\n}\n\nfn main() {\n    let r: Result<i32, &str> = Ok(5);\n    println!("{:?}", r.map(double()));\n}',
        ),
        predictOutput(
          'What does this program print?',
          'fn report(n: i32) -> i32 {\n    println!("mapping {}", n);\n    n + 1\n}\n\nfn main() {\n    let first: Result<i32, &str> = Ok(1);\n    let second: Result<i32, &str> = Err("skip");\n    let a = first.map(report);\n    let b = second.map(report);\n    println!("{:?} {:?}", a, b);\n}',
          [
            'Ok(2) Err("skip")',
            'mapping 1\nOk(2) Err("skip")',
            'mapping 1\nmapping skip\nOk(2) Err("skip")',
            'mapping 1\nOk(1) Err("skip")',
          ],
          1,
          'map calls report only for the Ok value, so mapping 1 is printed once and a becomes Ok(2). The Err passes through unchanged.',
        ),
      ],
    },
    {
      title: 'map can change the Ok type but not the error',
      explanation: [
        'The function passed to map decides the new Ok type. Mapping a Result<u32, &str> with a function from u32 to bool produces a Result<bool, &str>.',
        'The error type stays exactly as it was, because map never touches the Err side.',
      ],
      example: {
        language: 'rust',
        code: 'fn is_adult(age: u32) -> bool {\n    age >= 18\n}\n\nfn main() {\n    let age: Result<u32, &str> = Ok(15);\n    let checked: Result<bool, &str> = age.map(is_adult);\n    println!("{:?}", checked);\n}',
        output: 'Ok(false)',
        explanation:
          'is_adult turns the u32 15 into the bool false, so the Ok payload changes type from u32 to bool, as the annotation on checked says. The error type is still &str.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn describe(n: i32) -> String {\n    format!("{} items", n)\n}\n\nfn main() {\n    let count: Result<i32, &str> = Ok(3);\n    println!("{:?}", count.map(describe));\n}',
          ['Ok(3 items)', 'Ok(3)', '"3 items"', 'Ok("3 items")'],
          3,
          'describe turns 3 into a String, so map produces Ok holding that String, and Debug output shows it in quotes.',
        ),
        choose(
          'value has type Result<i32, String>, and fn to_float(n: i32) -> f64. What is the type of value.map(to_float)?',
          [
            'Result<f64, String>',
            'Result<i32, f64>',
            'Result<f64, f64>',
            'f64',
          ],
          0,
          'map replaces the Ok type with what to_float returns and leaves the String error type alone.',
        ),
        predictOutput(
          'What is printed?',
          'fn halve(n: i32) -> f64 {\n    n as f64 / 2.0\n}\n\nfn main() {\n    let r: Result<i32, &str> = Ok(7);\n    println!("{:?}", r.map(halve));\n}',
          ['Ok(3)', 'Ok(4)', 'Ok(7)', 'Ok(3.5)'],
          3,
          'halve converts 7 to f64 before dividing, so it returns 3.5, and map wraps it in Ok.',
        ),
        choose(
          'Why does the compiler reject check?',
          [
            'is_even must take a Result instead of an i32',
            'map gives Result<bool, &str>, not Result<i32, &str>',
            'map cannot be used when the error type is &str',
            'A function passed to map must return the type it takes',
          ],
          1,
          'is_even returns bool, so r.map(is_even) has type Result<bool, &str>, but check promises Result<i32, &str>.',
          "fn is_even(n: i32) -> bool {\n    n % 2 == 0\n}\n\nfn check(r: Result<i32, &'static str>) -> Result<i32, &'static str> {\n    r.map(is_even)\n}",
        ),
      ],
    },
    {
      title: 'Chain map calls on a validated result',
      explanation: [
        'map returns a new Result, so you can call map on it again. On success each function runs in order, receiving the previous output. On Err none of them run, and the error comes out of the end unchanged.',
        'This lets a validating function return a Result while the caller applies further steps only to valid input.',
      ],
      example: {
        language: 'rust',
        code: 'fn checked_width(w: i32) -> Result<i32, &\'static str> {\n    if w <= 0 {\n        Err("width must be positive")\n    } else {\n        Ok(w)\n    }\n}\n\nfn area(w: i32) -> i32 {\n    w * w\n}\n\nfn add_border(a: i32) -> i32 {\n    a + 4\n}\n\nfn main() {\n    println!("{:?}", checked_width(3).map(area).map(add_border));\n    println!("{:?}", checked_width(0).map(area).map(add_border));\n}',
        output: 'Ok(13)\nErr("width must be positive")',
        explanation:
          'checked_width(3) is Ok(3); area makes 9 and add_border makes 13. checked_width(0) is Err, so neither area nor add_border runs.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn double(n: i32) -> i32 {\n    n * 2\n}\n\nfn plus_one(n: i32) -> i32 {\n    n + 1\n}\n\nfn main() {\n    let r: Result<i32, &str> = Ok(5);\n    println!("{:?}", r.map(plus_one).map(double));\n}',
          ['Ok(12)', 'Ok(11)', 'Ok(6)', 'Ok(10)'],
          0,
          'The maps run left to right: plus_one turns 5 into 6, then double turns 6 into 12.',
        ),
        predictOutput(
          'What is printed?',
          'fn validate(n: i32) -> Result<i32, &\'static str> {\n    if n > 100 {\n        Err("too big")\n    } else {\n        Ok(n)\n    }\n}\n\nfn triple(n: i32) -> i32 {\n    n * 3\n}\n\nfn main() {\n    println!("{:?}", validate(40).map(triple));\n    println!("{:?}", validate(400).map(triple));\n}',
          [
            'Ok(120)\nOk(1200)',
            'Ok(40)\nErr("too big")',
            'Ok(120)\nErr(1200)',
            'Ok(120)\nErr("too big")',
          ],
          3,
          '40 passes validation and triple makes 120. 400 fails, so its Err passes through map and triple is not called.',
        ),
        choose(
          'A Result goes through .map(a).map(b).map(c) and starts as Err. How many of the functions a, b, and c run?',
          ['None of them', 'Only a', 'a and b', 'All three'],
          0,
          'Each map returns the Err unchanged without calling its function, so the error flows through all three calls.',
        ),
        predictOutput(
          'What does this program print?',
          'fn parse_flag(n: i32) -> Result<i32, String> {\n    if n == 0 || n == 1 {\n        Ok(n)\n    } else {\n        Err(format!("{} is not a flag", n))\n    }\n}\n\nfn to_bool(n: i32) -> bool {\n    n == 1\n}\n\nfn main() {\n    println!("{:?}", parse_flag(1).map(to_bool));\n    println!("{:?}", parse_flag(2).map(to_bool));\n}',
          [
            'Ok(1)\nErr("2 is not a flag")',
            'Ok(true)\nErr("2 is not a flag")',
            'Ok(true)\nOk(false)',
            'true\n2 is not a flag',
          ],
          1,
          'parse_flag(1) is Ok(1), and to_bool turns it into true. parse_flag(2) is Err, so map leaves its message as it is.',
        ),
      ],
    },
  ],
  'rust-map-error': [
    {
      title: 'Apply a function to the error with map_err',
      explanation: [
        'result.map_err(f) is the mirror image of map. It calls f on the payload inside Err and wraps the return value in a new Err. An Ok value passes through unchanged, and f is not called.',
      ],
      example: {
        language: 'rust',
        code: 'fn shout(error: &str) -> String {\n    format!("ERROR: {}", error)\n}\n\nfn main() {\n    let failed: Result<i32, &str> = Err("disk full");\n    let fine: Result<i32, &str> = Ok(9);\n    println!("{:?}", failed.map_err(shout));\n    println!("{:?}", fine.map_err(shout));\n}',
        output: 'Err("ERROR: disk full")\nOk(9)',
        explanation:
          'failed is Err, so map_err calls shout and wraps its String in Err. fine is Ok, so map_err returns Ok(9) untouched.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn with_prefix(e: &str) -> String {\n    format!("config: {}", e)\n}\n\nfn main() {\n    let r: Result<u32, &str> = Err("missing key");\n    println!("{:?}", r.map_err(with_prefix));\n}',
          [
            'Err("missing key")',
            'Ok("config: missing key")',
            'Err("config: missing key")',
            'Err(config: missing key)',
          ],
          2,
          'The value is Err, so map_err passes "missing key" to with_prefix and wraps the new String in Err.',
        ),
        predictOutput(
          'What is printed?',
          'fn code_for(e: &str) -> i32 {\n    println!("translating {}", e);\n    500\n}\n\nfn main() {\n    let r: Result<&str, &str> = Ok("page");\n    println!("{:?}", r.map_err(code_for));\n}',
          ['translating page\nOk("page")', 'Err(500)', 'Ok("page")', 'Ok(500)'],
          2,
          'The value is Ok, so map_err returns it unchanged and never calls code_for; nothing else is printed.',
        ),
        choose(
          'r has type Result<i32, i32> and holds Ok(404). What does r.map_err(describe) return?',
          ['Err(404)', 'Ok(describe(404))', 'Err(describe(404))', 'Ok(404)'],
          3,
          'map_err transforms only an Err payload. r is Ok, so it comes back unchanged, even though its number looks like an error code.',
        ),
        predictOutput(
          'What does this program print?',
          'fn message(code: i32) -> &\'static str {\n    if code == 404 {\n        "not found"\n    } else {\n        "server error"\n    }\n}\n\nfn main() {\n    let a: Result<&str, i32> = Err(503);\n    let b: Result<&str, i32> = Err(404);\n    println!("{:?} {:?}", a.map_err(message), b.map_err(message));\n}',
          [
            'Err("server error") Err("not found")',
            'Err("not found") Err("server error")',
            'Err(503) Err(404)',
            'Err("server error") Err("server error")',
          ],
          0,
          '503 is not 404, so a becomes Err("server error"). b holds 404, so it becomes Err("not found").',
        ),
      ],
    },
    {
      title: 'map_err can change the error type',
      explanation: [
        'The new error type is whatever the function returns. A typical use is turning a short &str message or a numeric code into a String with context, so that every error a function returns has the type its signature promises.',
        'The Ok type stays the same, because map_err never touches a successful value.',
      ],
      example: {
        language: 'rust',
        code: 'fn explain(code: u32) -> String {\n    format!("request failed with code {}", code)\n}\n\nfn fetch(ok: bool) -> Result<&\'static str, u32> {\n    if ok {\n        Ok("data")\n    } else {\n        Err(429)\n    }\n}\n\nfn main() {\n    let result: Result<&str, String> = fetch(false).map_err(explain);\n    println!("{:?}", result);\n}',
        output: 'Err("request failed with code 429")',
        explanation:
          'fetch(false) is Err(429), whose error type is u32. map_err(explain) turns it into a String, so the result type becomes Result<&str, String>, as the annotation says.',
      },
      questions: [
        choose(
          "r has type Result<f64, &'static str>, and fn label(e: &str) -> String. What is the type of r.map_err(label)?",
          [
            'Result<String, &str>',
            'Result<f64, &str>',
            'Result<f64, String>',
            'String',
          ],
          2,
          'map_err replaces only the error type, with the String that label returns. The f64 success type is unchanged.',
        ),
        choose(
          'run must return Result<i32, String>, so the compiler rejects its body. Which body makes run compile?',
          [
            'checked(n).map(owned)',
            'checked(n).map_err(owned)',
            'checked(n).map_err(owned())',
            'owned(checked(n))',
          ],
          1,
          'Only the error types differ, so the Err payload must be converted. map_err(owned) turns the &str error into a String and keeps the i32.',
          'fn checked(n: i32) -> Result<i32, &\'static str> {\n    if n < 0 {\n        Err("negative")\n    } else {\n        Ok(n)\n    }\n}\n\nfn owned(e: &str) -> String {\n    String::from(e)\n}\n\nfn run(n: i32) -> Result<i32, String> {\n    checked(n)\n}',
        ),
        predictOutput(
          'What does this program print?',
          'fn as_text(e: i32) -> String {\n    format!("error #{}", e)\n}\n\nfn main() {\n    let r: Result<i32, i32> = Err(7);\n    let s: Result<i32, i32> = Ok(7);\n    println!("{:?}", r.map_err(as_text));\n    println!("{:?}", s.map_err(as_text));\n}',
          [
            'Err(7)\nOk(7)',
            'Err("error #7")\nOk("error #7")',
            'Err("error #7")\nOk(7)',
            'Err("error #7")\nErr("error #7")',
          ],
          2,
          'r is Err(7), so as_text turns it into a String. s is Ok(7), which map_err leaves alone even though it holds the same number.',
        ),
        predictOutput(
          'What is printed?',
          'fn length(e: &str) -> usize {\n    e.len()\n}\n\nfn main() {\n    let r: Result<bool, &str> = Err("timeout");\n    println!("{:?}", r.map_err(length));\n}',
          ['Err("timeout")', 'Ok(7)', 'Err(8)', 'Err(7)'],
          3,
          'length returns the number of bytes in "timeout", which is 7, so the error becomes the usize 7 inside Err.',
        ),
      ],
    },
    {
      title: 'Shape both sides with map and map_err',
      explanation: [
        'Calling map and then map_err shapes both sides of a Result in one expression. Exactly one of the two functions runs: the map function for Ok, the map_err function for Err.',
      ],
      example: {
        language: 'rust',
        code: 'fn validate(n: i32) -> Result<i32, &\'static str> {\n    if n < 0 {\n        Err("negative")\n    } else {\n        Ok(n)\n    }\n}\n\nfn double(n: i32) -> i32 {\n    n * 2\n}\n\nfn context(e: &str) -> String {\n    format!("input: {}", e)\n}\n\nfn main() {\n    println!("{:?}", validate(4).map(double).map_err(context));\n    println!("{:?}", validate(-4).map(double).map_err(context));\n}',
        output: 'Ok(8)\nErr("input: negative")',
        explanation:
          'validate(4) is Ok, so double runs and map_err leaves Ok(8) alone. validate(-4) is Err, so map skips double and context adds the prefix.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn on_ok(n: i32) -> i32 {\n    println!("ok ran");\n    n + 1\n}\n\nfn on_err(e: &str) -> usize {\n    println!("err ran");\n    e.len()\n}\n\nfn main() {\n    let r: Result<i32, &str> = Err("oops");\n    println!("{:?}", r.map(on_ok).map_err(on_err));\n}',
          [
            'ok ran\nerr ran\nErr(4)',
            'ok ran\nOk(5)',
            'err ran\nErr("oops")',
            'err ran\nErr(4)',
          ],
          3,
          'r is Err, so map skips on_ok. map_err calls on_err, which prints its line and returns the length 4.',
        ),
        predictOutput(
          'What is printed?',
          'fn checked_percent(p: i32) -> Result<i32, i32> {\n    if p > 100 {\n        Err(p)\n    } else {\n        Ok(p)\n    }\n}\n\nfn to_fraction(p: i32) -> f64 {\n    p as f64 / 100.0\n}\n\nfn explain(p: i32) -> String {\n    format!("{} is over 100", p)\n}\n\nfn main() {\n    println!("{:?}", checked_percent(25).map(to_fraction).map_err(explain));\n}',
          ['Ok(0.25)', 'Ok(25)', 'Ok(0)', 'Err("25 is over 100")'],
          0,
          '25 is not over 100, so only the Ok path runs: to_fraction converts to f64 before dividing and gives 0.25. explain is not called.',
        ),
        choose(
          'Given fn square(n: i32) -> i32 and fn tag(e: &str) -> String, which chain turns Ok(3) into Ok(9) and Err("x") into Err("bad: x")?',
          [
            'r.map_err(square).map(tag)',
            'r.map(square).map_err(tag)',
            'r.map(tag).map_err(square)',
            'r.map(square).map(tag)',
          ],
          1,
          'map applies to the success value and map_err to the error, so square goes with map and tag goes with map_err.',
        ),
        predictOutput(
          'What does this program print?',
          'fn bump(n: u32) -> u32 {\n    n + 10\n}\n\nfn wrap(e: &str) -> String {\n    format!("[{}]", e)\n}\n\nfn main() {\n    let a: Result<u32, &str> = Ok(5);\n    let b: Result<u32, &str> = Err("late");\n    println!("{:?} {:?}", a.map_err(wrap).map(bump), b.map_err(wrap).map(bump));\n}',
          [
            'Ok(15) Err("late")',
            'Ok(5) Err("[late]")',
            'Ok(15) Err("[late]")',
            'Ok("[15]") Err("[late]")',
          ],
          2,
          'Calling map_err first does not change the outcome: a is Ok, so only bump changes it, and b is Err, so only wrap changes it.',
        ),
      ],
    },
  ],
  'rust-turbofish': [
    {
      title: 'Parse text into a chosen type with parse::<T>()',
      explanation: [
        'A string has a parse method that can produce many types: i32, u8, f64, and more. Writing the type in angle brackets after ::, as in "42".parse::<i32>(), tells it which one. This ::<T> syntax is nicknamed the turbofish.',
        'Text might not be a valid number, so parse returns a Result. For integer types the error is a ParseIntError, whose Debug output names what went wrong, such as InvalidDigit.',
      ],
      example: {
        language: 'rust',
        code: 'fn main() {\n    println!("{:?}", "42".parse::<i32>());\n    println!("{:?}", "4x2".parse::<i32>());\n}',
        output: 'Ok(42)\nErr(ParseIntError { kind: InvalidDigit })',
        explanation:
          '"42" is a valid i32, so the result is Ok(42). "4x2" contains a character that is not a digit, so parse returns Err with kind InvalidDigit.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn main() {\n    println!("{:?}", "-15".parse::<i32>());\n}',
          [
            'Ok(15)',
            'Ok(-15)',
            '-15',
            'Err(ParseIntError { kind: InvalidDigit })',
          ],
          1,
          'A leading minus sign is valid for a signed type like i32, so parse succeeds with -15 inside Ok.',
        ),
        predictOutput(
          'What is printed?',
          'fn main() {\n    println!("{:?}", "3.75".parse::<f64>());\n    println!("{:?}", "3.75".parse::<i32>());\n}',
          [
            'Ok(3.75)\nErr(ParseIntError { kind: InvalidDigit })',
            'Ok(3.75)\nOk(4)',
            'Ok(3.75)\nOk(3)',
            'Ok(3.75)\nErr(ParseFloatError { kind: Invalid })',
          ],
          0,
          'f64 accepts a decimal point. For i32 the "." is not a digit, so parse fails instead of truncating or rounding.',
        ),
        predictOutput(
          'What does this program print?',
          'fn main() {\n    println!("{:?}", " 8".parse::<i32>());\n}',
          [
            'Ok(8)',
            'Err(ParseIntError { kind: Empty })',
            'Ok(0)',
            'Err(ParseIntError { kind: InvalidDigit })',
          ],
          3,
          'parse does not skip spaces. The leading space is not a digit, so the result is an InvalidDigit error.',
        ),
        predictOutput(
          'What is printed?',
          'fn main() {\n    println!("{:?}", "".parse::<i32>());\n}',
          [
            'Ok(0)',
            'Err(ParseIntError { kind: InvalidDigit })',
            'Err(ParseIntError { kind: Empty })',
            'Err(ParseIntError { kind: Zero })',
          ],
          2,
          'Empty text is not a number, not even 0. ParseIntError reports this case with kind Empty.',
        ),
      ],
    },
    {
      title: 'The target type decides which text is valid',
      explanation: [
        'The same text can parse into one type and fail for another. A u8 holds 0 to 255, so "300" is too large for it (kind PosOverflow) even though it is a fine u32. Unsigned types reject a minus sign as InvalidDigit, and a negative number below a signed type’s range gives NegOverflow.',
        'Choosing the narrowest type that fits your data lets parse do the range check for you.',
      ],
      example: {
        language: 'rust',
        code: 'fn main() {\n    println!("{:?}", "300".parse::<u32>());\n    println!("{:?}", "300".parse::<u8>());\n}',
        output: 'Ok(300)\nErr(ParseIntError { kind: PosOverflow })',
        explanation:
          '300 fits in a u32, so the first parse succeeds. A u8 stops at 255, so the second reports PosOverflow instead of wrapping around.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn main() {\n    println!("{:?}", "255".parse::<u8>());\n}',
          [
            'Err(ParseIntError { kind: PosOverflow })',
            'Ok(255)',
            'Ok(-1)',
            'Err(ParseIntError { kind: InvalidDigit })',
          ],
          1,
          '255 is the largest u8, so it still fits and parse returns Ok(255).',
        ),
        predictOutput(
          'What is printed?',
          'fn main() {\n    println!("{:?}", "-1".parse::<u32>());\n}',
          [
            'Ok(4294967295)',
            'Err(ParseIntError { kind: NegOverflow })',
            'Ok(1)',
            'Err(ParseIntError { kind: InvalidDigit })',
          ],
          3,
          'u32 has no negative values, so its parser does not accept a minus sign at all and reports it as an invalid digit.',
        ),
        predictOutput(
          'What does this program print?',
          'fn main() {\n    println!("{:?}", "3000000000".parse::<i64>());\n    println!("{:?}", "3000000000".parse::<i32>());\n}',
          [
            'Ok(3000000000)\nErr(ParseIntError { kind: PosOverflow })',
            'Ok(3000000000)\nOk(3000000000)',
            'Ok(3000000000)\nOk(-1294967296)',
            'Ok(3000000000)\nErr(ParseIntError { kind: InvalidDigit })',
          ],
          0,
          '3000000000 fits in an i64 but is above i32::MAX, 2147483647, so the i32 parse reports PosOverflow.',
        ),
        choose(
          'A field holds the number of people in a room: never negative and at most 200. Which call rejects "-4" and "900" with no extra checks?',
          [
            'text.parse::<i32>()',
            'text.parse::<i64>()',
            'text.parse::<u8>()',
            'text.parse::<f64>()',
          ],
          2,
          'u8 accepts exactly 0 to 255, so the minus sign and 900 both fail while every valid count parses. The other types accept both bad values.',
        ),
      ],
    },
    {
      title: 'Name the type with an annotation instead',
      explanation: [
        'Turbofish is one way to tell parse what to produce. The other is to state the type where the result goes: a let annotation such as let n: Result<u32, std::num::ParseIntError> = text.parse(); or a function whose declared return type is that Result. The compiler infers the target from it.',
        'If nothing names the type, the compiler cannot choose one and stops with “type annotations needed”.',
      ],
      example: {
        language: 'rust',
        code: 'fn read_count(text: &str) -> Result<u32, std::num::ParseIntError> {\n    text.parse()\n}\n\nfn main() {\n    let explicit = "12".parse::<u32>();\n    let annotated: Result<u32, std::num::ParseIntError> = "12".parse();\n    println!("{:?} {:?} {:?}", explicit, annotated, read_count("12"));\n}',
        output: 'Ok(12) Ok(12) Ok(12)',
        explanation:
          'All three parse into u32: the first through turbofish, the second through the let annotation, and the third through the return type of read_count.',
      },
      questions: [
        choose(
          'What happens when you compile this program?',
          [
            'It fails to compile: the target type is unknown',
            'It prints Ok("64")',
            'It prints Ok(64), inferring i32 by default',
            'It prints 64',
          ],
          0,
          'parse can produce many types, and neither a turbofish nor an annotation names one, so the compiler asks for a type annotation.',
          'fn main() {\n    let value = "64".parse();\n    println!("{:?}", value);\n}',
        ),
        predictOutput(
          'What does this program print?',
          'fn read_price(text: &str) -> Result<f64, std::num::ParseFloatError> {\n    text.parse()\n}\n\nfn main() {\n    println!("{:?}", read_price("5"));\n}',
          [
            'Ok(5)',
            'Ok(5.0)',
            'Ok("5")',
            'Err(ParseFloatError { kind: Invalid })',
          ],
          1,
          'The return type makes parse produce an f64. "5" is a valid f64, and Debug output of an f64 shows the decimal point.',
        ),
        predictOutput(
          'What is printed?',
          'fn main() {\n    let a: Result<u8, std::num::ParseIntError> = "500".parse();\n    let b: Result<u32, std::num::ParseIntError> = "500".parse();\n    println!("{:?}", a);\n    println!("{:?}", b);\n}',
          [
            'Ok(500)\nOk(500)',
            'Ok(244)\nOk(500)',
            'Err(ParseIntError { kind: PosOverflow })\nOk(500)',
            'Err(ParseIntError { kind: InvalidDigit })\nOk(500)',
          ],
          2,
          'The annotation on a makes parse target u8, and 500 is above 255. The annotation on b targets u32, where 500 fits.',
        ),
        choose(
          'parse_level must return Result<u8, std::num::ParseIntError>. Which body compiles and parses into a u8?',
          [
            'text.parse()',
            'text.parse::<i32>()',
            'text.parse::<u8>',
            'parse::<u8>(text)',
          ],
          0,
          'The declared return type already names u8, so a plain text.parse() is inferred to produce it. An i32 result would not match, and the last two are not calls of the parse method.',
        ),
      ],
    },
    {
      title: 'Match on a parse result',
      explanation: [
        'A parse result is an ordinary Result, so match handles it: the Ok arm receives the number, and the Err arm decides what invalid text means for your program, such as a fallback value.',
      ],
      example: {
        language: 'rust',
        code: 'fn volume(text: &str) -> u8 {\n    match text.parse::<u8>() {\n        Ok(level) => level,\n        Err(_) => 0,\n    }\n}\n\nfn main() {\n    println!("{} {} {}", volume("70"), volume("700"), volume("loud"));\n}',
        output: '70 0 0',
        explanation:
          '"70" fits in a u8. "700" is too large and "loud" is not a number, so both take the Err arm and become 0.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn doubled(text: &str) -> i32 {\n    match text.parse::<i32>() {\n        Ok(n) => n * 2,\n        Err(_) => -1,\n    }\n}\n\nfn main() {\n    println!("{} {}", doubled("21"), doubled("twenty"));\n}',
          ['42 -1', '2121 -1', '42 0', '-1 -1'],
          0,
          '"21" parses to 21, which doubles to 42. "twenty" is not digits, so the Err arm returns -1.',
        ),
        predictOutput(
          'What is printed?',
          'fn main() {\n    match "12a".parse::<u32>() {\n        Ok(n) => println!("got {}", n),\n        Err(e) => println!("{:?}", e),\n    }\n}',
          [
            'got 12',
            'Err(ParseIntError { kind: InvalidDigit })',
            'ParseIntError { kind: Empty }',
            'ParseIntError { kind: InvalidDigit }',
          ],
          3,
          'parse fails at the a. The Err arm binds only the payload, so the output has no Err( wrapper around it.',
        ),
        predictOutput(
          'What does this program print?',
          'fn value(text: &str) -> i32 {\n    match text.parse::<i32>() {\n        Ok(n) => n,\n        Err(_) => 0,\n    }\n}\n\nfn main() {\n    println!("{}", value("8") + value("x") + value("-3"));\n}',
          ['11', '8', '5', '0'],
          2,
          '"x" falls back to 0 and "-3" parses to -3, so the sum is 8 + 0 - 3 = 5.',
        ),
        choose(
          'Each line of a settings file should hold a volume from 0 to 255. Which approach rejects bad lines and keeps good ones?',
          [
            'Use parse::<i32>() and keep the Ok value',
            'Use parse::<f64>() and keep the Ok value',
            'Check text < "255" and then parse',
            'Use parse::<u8>() and match on Ok and Err',
          ],
          3,
          'u8 matches the allowed range exactly, and matching on the Result makes the bad case explicit. i32 and f64 accept out-of-range or fractional values.',
        ),
      ],
    },
  ],
  'rust-question-mark': [
    {
      title: 'Unwrap a successful step with ?',
      explanation: [
        'Writing ? after a Result gives you the value inside Ok, so let n = text.parse::<i32>()?; makes n an i32, not a Result. The rest of the function can use n directly.',
        'The function containing ? must itself return a Result, and it ends by wrapping its answer in Ok.',
      ],
      example: {
        language: 'rust',
        code: 'fn add_one(text: &str) -> Result<i32, std::num::ParseIntError> {\n    let n = text.parse::<i32>()?;\n    Ok(n + 1)\n}\n\nfn main() {\n    println!("{:?}", add_one("41"));\n}',
        output: 'Ok(42)',
        explanation:
          '"41" parses successfully, so ? hands back 41 as a plain i32. The function adds 1 and wraps 42 in Ok.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn difference(a: &str, b: &str) -> Result<i32, std::num::ParseIntError> {\n    let x = a.parse::<i32>()?;\n    let y = b.parse::<i32>()?;\n    Ok(x - y)\n}\n\nfn main() {\n    println!("{:?}", difference("10", "4"));\n}',
          ['6', 'Ok(6)', 'Ok(Ok(6))', 'Ok(-6)'],
          1,
          'Both parses succeed, so ? gives 10 and 4 as plain i32 values, and the function returns Ok(10 - 4).',
        ),
        choose(
          'Inside a function returning Result<u32, std::num::ParseIntError>, the line let n = "5".parse::<u32>()?; runs. What is the type of n?',
          ['Result<u32, ParseIntError>', 'Ok(u32)', 'u32', '&str'],
          2,
          '? takes the value out of Ok, so n is the plain u32 that parse produced.',
        ),
        choose(
          'Why does plus_ten fail to compile?',
          [
            'n is still a Result; it needs ? to become an i32',
            'n needs a type annotation as well as the turbofish',
            'Ok cannot wrap an arithmetic expression',
            'A function that parses must return i32',
          ],
          0,
          'Without ?, n is the whole Result from parse, and a Result cannot be added to 10.',
          'fn plus_ten(text: &str) -> Result<i32, std::num::ParseIntError> {\n    let n = text.parse::<i32>();\n    Ok(n + 10)\n}',
        ),
        predictOutput(
          'What is printed?',
          'fn square_text(text: &str) -> Result<i64, std::num::ParseIntError> {\n    let n = text.parse::<i64>()?;\n    Ok(n * n)\n}\n\nfn main() {\n    println!("{:?}", square_text("-9"));\n}',
          [
            'Ok(-81)',
            'Ok(81)',
            'Err(ParseIntError { kind: InvalidDigit })',
            '81',
          ],
          1,
          '"-9" is a valid i64, so ? gives -9, and -9 * -9 is 81, wrapped in Ok.',
        ),
      ],
    },
    {
      title: '? hands an Err straight back to the caller',
      explanation: [
        'If the Result is Err, ? ends the whole function at that point, and the function’s result is that same Err. Lines after the ? do not run.',
        'It is a short way to write a match whose Ok arm continues with the value and whose Err arm leaves the function with the error.',
      ],
      example: {
        language: 'rust',
        code: 'fn report(text: &str) -> Result<i32, std::num::ParseIntError> {\n    println!("checking {}", text);\n    let n = text.parse::<i32>()?;\n    println!("parsed {}", n);\n    Ok(n)\n}\n\nfn main() {\n    println!("{:?}", report("x9"));\n}',
        output: 'checking x9\nErr(ParseIntError { kind: InvalidDigit })',
        explanation:
          'The first println runs. Parsing "x9" fails, so ? leaves report with the Err and parsed is never printed. main prints the returned Err.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn steps(text: &str) -> Result<u8, std::num::ParseIntError> {\n    println!("start");\n    let n = text.parse::<u8>()?;\n    println!("done");\n    Ok(n)\n}\n\nfn main() {\n    println!("{:?}", steps("999"));\n}',
          [
            'start\ndone\nErr(ParseIntError { kind: PosOverflow })',
            'start\nErr(ParseIntError { kind: PosOverflow })',
            'start\ndone\nOk(231)',
            'Err(ParseIntError { kind: PosOverflow })',
          ],
          1,
          'start prints first. 999 does not fit in a u8, so ? returns the Err before done is printed.',
        ),
        predictOutput(
          'What is printed?',
          'fn parse_and_halve(text: &str) -> Result<i32, std::num::ParseIntError> {\n    let n = text.parse::<i32>()?;\n    Ok(n / 2)\n}\n\nfn main() {\n    match parse_and_halve("ten") {\n        Ok(v) => println!("half is {}", v),\n        Err(_) => println!("not a number"),\n    }\n}',
          [
            'half is 5',
            'half is 0',
            'Err(ParseIntError { kind: InvalidDigit })',
            'not a number',
          ],
          3,
          '"ten" is not digits, so ? returns the Err from parse_and_halve, and the Err arm in main prints its message.',
        ),
        choose(
          'When ? is applied to an Err, what happens to the rest of the function?',
          [
            'It runs with 0 in place of the failed value',
            'It runs, and the Err is returned at the end',
            'It is skipped, because the function returns that Err',
            'It is skipped, because the program panics',
          ],
          2,
          '? ends the function immediately with the Err as its result. It neither panics nor substitutes a value.',
        ),
        predictOutput(
          'What does this program print?',
          'fn check(text: &str) -> Result<i32, std::num::ParseIntError> {\n    let n = text.parse::<i32>()?;\n    println!("ok: {}", n);\n    Ok(n)\n}\n\nfn main() {\n    println!("{:?}", check("4"));\n    println!("{:?}", check("four"));\n}',
          [
            'ok: 4\nOk(4)\nErr(ParseIntError { kind: InvalidDigit })',
            'ok: 4\nOk(4)\nok: four\nErr(ParseIntError { kind: InvalidDigit })',
            'ok: 4\nOk(4)\nok: 0\nOk(0)',
            'Ok(4)\nErr(ParseIntError { kind: InvalidDigit })',
          ],
          0,
          'check("4") prints its line and returns Ok(4). For "four", ? returns the Err before the println inside check runs.',
        ),
      ],
    },
    {
      title: 'Give the function a compatible Result return type',
      explanation: [
        '? can hand an error back only if the function returns a Result whose error type matches it. Using ? in a function that returns i32, or in a main that returns nothing, is a compile error.',
        'The error types must agree too: parse::<i32>() fails with a ParseIntError and parse::<f64>() with a ParseFloatError, so a function that declares one of them cannot apply ? to the other.',
      ],
      example: {
        language: 'rust',
        code: 'fn ratio(a: &str, b: &str) -> Result<f64, std::num::ParseFloatError> {\n    let top = a.parse::<f64>()?;\n    let bottom = b.parse::<f64>()?;\n    Ok(top / bottom)\n}\n\nfn main() {\n    println!("{:?}", ratio("3", "4"));\n}',
        output: 'Ok(0.75)',
        explanation:
          'Both steps parse into f64, so both can fail only with ParseFloatError, the error type ratio declares. 3.0 / 4.0 is 0.75.',
      },
      questions: [
        choose(
          'What happens when you compile this program?',
          [
            'It prints 12, since "12" is a valid number',
            'It prints Ok(12)',
            'It compiles, then panics on bad input',
            'It fails to compile because main does not return a Result',
          ],
          3,
          '? needs somewhere to send an error. This main returns nothing, so the compiler rejects the ?.',
          'fn main() {\n    let n = "12".parse::<i32>()?;\n    println!("{}", n);\n}',
        ),
        choose(
          'Why does the compiler reject read_two?',
          [
            'Its first ? would return a ParseIntError',
            'as cannot convert an i32 into an f64',
            'A function may use ? only once',
            'Ok cannot hold an f64 value',
          ],
          0,
          'The first ? would return a ParseIntError, but the error type of read_two is ParseFloatError.',
          'fn read_two(a: &str, b: &str) -> Result<f64, std::num::ParseFloatError> {\n    let whole = a.parse::<i32>()?;\n    let part = b.parse::<f64>()?;\n    Ok(whole as f64 + part)\n}',
        ),
        choose(
          'A function applies ? to text.parse::<u8>(). Which return type lets it compile?',
          [
            'u8',
            "Result<u8, &'static str>",
            'Result<u8, std::num::ParseIntError>',
            'Result<std::num::ParseIntError, u8>',
          ],
          2,
          'The error from parse::<u8>() is a ParseIntError, and it belongs in the second, Err position of the Result.',
        ),
        choose(
          'This function does not compile. Which change fixes it?',
          [
            'Remove ::<u8> so the type is inferred',
            'Return Result<u8, ParseIntError> and end with Ok(...)',
            'Write ?? so the value is unwrapped twice',
            'Change the return type to i32',
          ],
          1,
          'A function using ? must return a Result with a matching error type, and its success value must then be wrapped in Ok.',
          'fn level(t: &str) -> u8 {\n    t.parse::<u8>()?\n}',
        ),
      ],
    },
    {
      title: 'Chain several fallible steps',
      explanation: [
        'With ? after each step, a function reads like its success path: parse this, parse that, combine. The steps run in order, and the first Err ends the function, so later steps never run and the caller sees that first error.',
      ],
      example: {
        language: 'rust',
        code: 'fn area(w: &str, h: &str) -> Result<u32, std::num::ParseIntError> {\n    let width = w.parse::<u32>()?;\n    let height = h.parse::<u32>()?;\n    Ok(width * height)\n}\n\nfn main() {\n    println!("{:?}", area("4", "5"));\n    println!("{:?}", area("", "x"));\n}',
        output: 'Ok(20)\nErr(ParseIntError { kind: Empty })',
        explanation:
          'area("4", "5") parses both sides and returns Ok(20). In area("", "x") the empty width fails first, so the result is the Empty error; "x" is never parsed.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn sum3(a: &str, b: &str, c: &str) -> Result<i32, std::num::ParseIntError> {\n    let x = a.parse::<i32>()?;\n    let y = b.parse::<i32>()?;\n    let z = c.parse::<i32>()?;\n    Ok(x + y + z)\n}\n\nfn main() {\n    println!("{:?}", sum3("1", "99999999999", "b"));\n}',
          [
            'Err(ParseIntError { kind: InvalidDigit })',
            'Err(ParseIntError { kind: PosOverflow })',
            'Ok(1)',
            'Ok(100000000000)',
          ],
          1,
          '"1" parses, then "99999999999" is too large for an i32, so ? returns PosOverflow before "b" is looked at.',
        ),
        predictOutput(
          'What is printed?',
          'fn seconds(minutes: &str, extra: &str) -> Result<u32, std::num::ParseIntError> {\n    let m = minutes.parse::<u32>()?;\n    let s = extra.parse::<u32>()?;\n    Ok(m * 60 + s)\n}\n\nfn main() {\n    println!("{:?}", seconds("2", "-5"));\n}',
          [
            'Ok(115)',
            'Ok(125)',
            'Err(ParseIntError { kind: NegOverflow })',
            'Err(ParseIntError { kind: InvalidDigit })',
          ],
          3,
          '"2" parses, but the u32 parser rejects the minus sign in "-5" as an invalid digit, so the second ? returns that Err.',
        ),
        choose(
          'parse_pair applies ? to x.parse::<i32>() and then to y.parse::<i32>(). Both texts are invalid. What does it return?',
          [
            'The error from parsing y',
            'The error from parsing x',
            'Both errors together',
            'Ok(0)',
          ],
          1,
          'The first ? already sees an Err and returns it, so y is never parsed.',
        ),
        predictOutput(
          'What does this program print?',
          'fn average(a: &str, b: &str) -> Result<i32, std::num::ParseIntError> {\n    let x = a.parse::<i32>()?;\n    let y = b.parse::<i32>()?;\n    Ok((x + y) / 2)\n}\n\nfn main() {\n    match average("7", "10") {\n        Ok(v) => println!("avg {}", v),\n        Err(e) => println!("bad input: {:?}", e),\n    }\n}',
          [
            'avg 8.5',
            'avg 9',
            'avg 8',
            'bad input: ParseIntError { kind: InvalidDigit }',
          ],
          2,
          'Both texts parse, so average returns Ok((7 + 10) / 2). Integer division truncates 8.5 to 8.',
        ),
      ],
    },
  ],
  'rust-from-into': [
    {
      title: 'Widen a number with T::from',
      explanation: [
        'i32::from(x) converts x into an i32. The standard library provides From only where every possible input fits the target, such as u8 to i32 or i32 to i64, so the conversion cannot fail: it returns the new number directly.',
        'String::from("hi"), which you already use, is the same kind of conversion: it turns a string literal into an owned String.',
      ],
      example: {
        language: 'rust',
        code: 'fn main() {\n    let small: u8 = 250;\n    let wide = i32::from(small);\n    println!("{}", wide + 10);\n}',
        output: '260',
        explanation:
          'A u8 stops at 255. After i32::from the value is an i32, so adding 10 gives 260 without overflowing.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn main() {\n    let big = i32::MAX;\n    let wide = i64::from(big);\n    println!("{}", wide + 1);\n}',
          ['-2147483648', '0', '2147483647', '2147483648'],
          3,
          'i32::MAX becomes an i64 first, and an i64 has room for one more, so the sum is 2147483648.',
        ),
        predictOutput(
          'What is printed?',
          'fn main() {\n    let a: u8 = 200;\n    let b: u8 = 100;\n    let total = u32::from(a) + u32::from(b);\n    println!("{}", total);\n}',
          ['300', '255', '44', '200100'],
          0,
          'Both u8 values are widened to u32 before adding, so 300 fits instead of overflowing a u8.',
        ),
        choose(
          'Which conversion does the standard library provide through From?',
          [
            'i32::from(x) where x: u32',
            'u8::from(x) where x: i32',
            'u32::from(x) where x: i64',
            'i64::from(x) where x: u32',
          ],
          3,
          'Every u32 value fits in an i64. Each of the others could receive a value that does not fit, such as a u32 above i32::MAX.',
        ),
        choose(
          'n is an i32. What does i64::from(n) give you?',
          [
            'A Result that is Ok when the value fits',
            'An i64 holding the same value',
            'An i64, but only when n is not negative',
            'The same i32 under a new name',
          ],
          1,
          'Every i32 fits in an i64, so From returns the converted value directly, with nothing to check.',
        ),
      ],
    },
    {
      title: 'Convert with into when the target type is known',
      explanation: [
        'x.into() performs the same From conversion, written as a method on the value. It converts into whatever type is expected at that spot: a let annotation, a parameter type, or a function’s return type.',
        'If nothing says what the target is, the compiler cannot pick one and asks for a type annotation.',
      ],
      example: {
        language: 'rust',
        code: 'fn to_wide(n: u32) -> i64 {\n    n.into()\n}\n\nfn main() {\n    let level: u8 = 7;\n    let scaled: i32 = level.into();\n    println!("{} {}", scaled * 1000, to_wide(4000000000) + 1);\n}',
        output: '7000 4000000001',
        explanation:
          'The annotation makes level.into() produce an i32, so 7 * 1000 is computed as an i32. Inside to_wide, the return type makes into produce an i64, which has room for 4000000000 + 1.',
      },
      questions: [
        choose(
          'What happens when you compile this program?',
          [
            'It prints 9',
            'It fails to compile because u8 has no into method',
            'It prints 9 after converting it to an i32',
            'It fails to compile: the target type is unknown',
          ],
          3,
          'into can turn a u8 into many types, and nothing in the program names one, so the compiler asks for an annotation.',
          'fn main() {\n    let small: u8 = 9;\n    let wide = small.into();\n    println!("{}", wide);\n}',
        ),
        predictOutput(
          'What does this program print?',
          'fn add_wide(a: i64, b: i64) -> i64 {\n    a + b\n}\n\nfn main() {\n    let x: i32 = 2000000000;\n    let y: i32 = 2000000000;\n    println!("{}", add_wide(x.into(), y.into()));\n}',
          ['4000000000', '-294967296', '2147483647', '4294967295'],
          0,
          'add_wide takes i64 parameters, so each into converts to i64 and the sum fits.',
        ),
        predictOutput(
          'What is printed?',
          'fn label(text: String) -> String {\n    format!("[{}]", text)\n}\n\nfn main() {\n    let tag: String = "new".into();\n    println!("{:?}", label(tag));\n}',
          ['[new]', '"new"', '["new"]', '"[new]"'],
          3,
          'The annotation makes into produce a String, label wraps it in brackets, and {:?} prints the String with quotes.',
        ),
        choose(
          'In let total: i64 = count.into(); with count: u32, what makes into produce an i64?',
          [
            'The type of count',
            'The i64 annotation on total',
            'into always produces i64',
            'The size of the number in count',
          ],
          1,
          'into converts to whatever type the context expects, and here the annotation on total says i64.',
        ),
      ],
    },
    {
      title: 'Narrowing has no From conversion',
      explanation: [
        'There is no From conversion when some inputs would not fit: no i32::from for an i64, no u8::from for an i32, and no u32::from for an i32, since an i32 can be negative. Writing one is a compile error, even if the particular value would fit.',
        'So From and into are for widening. Narrowing needs a conversion that can report failure, which is a separate tool.',
      ],
      example: {
        language: 'rust',
        code: 'fn main() {\n    let byte: u8 = 255;\n    let count: u32 = 70000;\n    let a = i32::from(byte);\n    let b = i64::from(count);\n    println!("{} {}", a, b);\n}',
        output: '255 70000',
        explanation:
          'u8 to i32 and u32 to i64 always fit, so both calls compile. The reverse calls, u8::from(a) and u32::from(b), do not exist, because an i32 or i64 can hold values those smaller types cannot.',
      },
      questions: [
        choose(
          'What happens when you compile this program?',
          [
            'It prints 120',
            'It panics because an i64 may be too large',
            'It fails to compile: i32 has no From<i64>',
            'It compiles, because 120 fits in an i32',
          ],
          2,
          'From is defined only where every input fits. Some i64 values do not fit in an i32, so i32::from does not accept an i64, whatever the value.',
          'fn main() {\n    let total: i64 = 120;\n    let small = i32::from(total);\n    println!("{}", small);\n}',
        ),
        choose(
          'For which pair does let b: B = a.into(); compile when a has type A?',
          [
            'A = u32, B = u8',
            'A = i32, B = u32',
            'A = u8, B = u32',
            'A = i64, B = i32',
          ],
          2,
          'Every u8 fits in a u32. In the other pairs the target cannot hold every value of the source type.',
        ),
        choose(
          'Why does Rust provide i64::from for a u32 but not i32::from for a u32?',
          [
            'All u32 values fit in i64; some exceed i32::MAX',
            'From never converts into a signed type',
            'u32 and i32 have different sizes',
            'i32::from exists, but only for literals',
          ],
          0,
          'A u32 can be as large as 4294967295, which is more than i32::MAX. An i64 holds every u32 value.',
        ),
        predictOutput(
          'What does this program print?',
          'fn main() {\n    let a: u8 = 255;\n    let b: u32 = u32::from(a) * 1000;\n    let c: i64 = i64::from(b) - 300000;\n    println!("{}", c);\n}',
          ['45000', '-45000', '0', '255000'],
          1,
          'Every step widens: 255 becomes the u32 255000, then the i64 255000, and subtracting 300000 in i64 gives -45000.',
        ),
      ],
    },
    {
      title: 'Widen operands before mixing types',
      explanation: [
        'Rust does not add integers of different types: a u8 plus an i32 is a compile error. Convert each operand to a common, wider type with From or into first; the arithmetic then compiles and has room for large results.',
      ],
      example: {
        language: 'rust',
        code: 'fn total_weight(boxes: u8, per_box: u32) -> i64 {\n    let count = i64::from(boxes);\n    let each: i64 = per_box.into();\n    count * each\n}\n\nfn main() {\n    println!("{}", total_weight(200, 30000000));\n}',
        output: '6000000000',
        explanation:
          'Both values are widened to i64 before multiplying, so the product 6000000000 fits; it would overflow a u32 or an i32.',
      },
      questions: [
        choose(
          'What happens when you compile this program?',
          [
            'It prints 15',
            'It converts b to u8 and prints 15',
            'It fails to compile: u8 and i32 cannot be added',
            'It converts a to i32 and prints 15',
          ],
          2,
          'Rust never converts integer types implicitly, so a + b with a u8 and an i32 is rejected.',
          'fn main() {\n    let a: u8 = 10;\n    let b: i32 = 5;\n    println!("{}", a + b);\n}',
        ),
        predictOutput(
          'What does this program print?',
          'fn mean(a: u8, b: u8) -> i32 {\n    (i32::from(a) + i32::from(b)) / 2\n}\n\nfn main() {\n    println!("{}", mean(250, 101));\n}',
          ['175.5', '47', '176', '175'],
          3,
          'Both bytes become i32 first, so 351 fits, and integer division gives 175.',
        ),
        choose(
          'fn scaled(x: u8, factor: i32) -> i64 must multiply x by factor without overflow. Which body is correct?',
          [
            'i64::from(x) * i64::from(factor)',
            'i64::from(x * factor)',
            'x * factor',
            'i64::from(x) * factor',
          ],
          0,
          'Both operands must be i64 before multiplying. The other bodies mix types or multiply before widening.',
        ),
        predictOutput(
          'What is printed?',
          'fn total(a: u8, b: u8, bonus: i32) -> i32 {\n    i32::from(a) + i32::from(b) + bonus\n}\n\nfn main() {\n    println!("{}", total(200, 200, -500));\n}',
          ['-100', '144', '-356', '400'],
          0,
          'Both bytes become i32 before adding, so 200 + 200 is 400, and adding the bonus of -500 gives -100.',
        ),
      ],
    },
  ],
  'rust-try-from': [
    {
      title: 'Convert with T::try_from when the value might not fit',
      explanation: [
        'For narrowing, use TryFrom: u8::try_from(n) returns a Result. It is Ok holding the converted value when n is between 0 and 255, and Err when it is not.',
        'The error type, TryFromIntError, prints as TryFromIntError(()) with {:?}. It carries no details beyond the fact that the value was out of range.',
      ],
      example: {
        language: 'rust',
        code: 'fn main() {\n    let small: i32 = 200;\n    let big: i32 = 1000;\n    println!("{:?}", u8::try_from(small));\n    println!("{:?}", u8::try_from(big));\n}',
        output: 'Ok(200)\nErr(TryFromIntError(()))',
        explanation:
          '200 fits in a u8, so the first conversion succeeds. 1000 does not, so the second returns Err instead of a wrapped-around number.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn main() {\n    let n: i32 = -1;\n    println!("{:?}", u8::try_from(n));\n}',
          [
            'Ok(255)',
            'Ok(1)',
            'Err(TryFromIntError(()))',
            'Err(TryFromIntError(-1))',
          ],
          2,
          'A u8 has no negative values, so -1 is out of range and try_from returns Err.',
        ),
        predictOutput(
          'What is printed?',
          'fn main() {\n    let big: i64 = 3000000000;\n    let small: i64 = -5;\n    println!("{:?}", i32::try_from(big));\n    println!("{:?}", i32::try_from(small));\n}',
          [
            'Err(TryFromIntError(()))\nOk(-5)',
            'Ok(3000000000)\nOk(-5)',
            'Ok(-1294967296)\nOk(-5)',
            'Err(TryFromIntError(()))\nErr(TryFromIntError(()))',
          ],
          0,
          '3000000000 is above i32::MAX, so the first conversion fails. -5 fits in an i32 even though it came from an i64.',
        ),
        predictOutput(
          'What does this program print?',
          'fn main() {\n    let n: u32 = 255;\n    println!("{:?}", u8::try_from(n));\n    println!("{:?}", u8::try_from(n + 1));\n}',
          [
            'Ok(255)\nOk(0)',
            'Ok(255)\nOk(256)',
            'Err(TryFromIntError(()))\nErr(TryFromIntError(()))',
            'Ok(255)\nErr(TryFromIntError(()))',
          ],
          3,
          '255 is the largest u8, so it converts. 256 is one past the limit, so that conversion fails.',
        ),
        choose(
          'Why does u8::try_from(n) return a Result while u32::from(b) with b: u8 returns a plain u32?',
          [
            'From conversions panic on bad input instead of returning Err',
            'Every u8 fits in a u32, but n may not fit in a u8',
            'try_from can be slow, so it reports timing problems',
            'u8 is the only type whose conversions need a Result',
          ],
          1,
          'From exists only where the conversion always succeeds. TryFrom covers conversions that can fail, and it reports the failure through Err.',
        ),
      ],
    },
    {
      title: 'Use try_into when the target type is known',
      explanation: [
        'n.try_into() is the method form of TryFrom, just as into pairs with From. It converts into the type the context expects, such as a function’s return type or a let annotation, and returns a Result.',
        'Like into, it needs that context: with no target type, the compiler asks for an annotation.',
      ],
      example: {
        language: 'rust',
        code: 'fn to_byte(n: i64) -> Result<u8, std::num::TryFromIntError> {\n    n.try_into()\n}\n\nfn main() {\n    println!("{:?} {:?}", to_byte(65), to_byte(-65));\n}',
        output: 'Ok(65) Err(TryFromIntError(()))',
        explanation:
          'The return type of to_byte makes try_into target u8. 65 fits; -65 is negative, so it fails.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn to_count(n: i32) -> Result<u32, std::num::TryFromIntError> {\n    n.try_into()\n}\n\nfn main() {\n    println!("{:?}", to_count(-12));\n}',
          ['Ok(12)', 'Ok(4294967284)', 'Ok(-12)', 'Err(TryFromIntError(()))'],
          3,
          'The return type makes try_into target u32, which cannot hold -12, so the result is Err.',
        ),
        choose(
          'What happens when you compile this program?',
          [
            'It prints Ok(42), choosing i32 by default',
            'It prints 42',
            'It fails to compile: the target type is unknown',
            'It prints Err(TryFromIntError(()))',
          ],
          2,
          'Nothing says what small should become, so the compiler cannot tell which conversion to use.',
          'fn main() {\n    let n: i64 = 42;\n    let small = n.try_into();\n    println!("{:?}", small);\n}',
        ),
        predictOutput(
          'What is printed?',
          'fn main() {\n    let total: i64 = 5000000000;\n    let fits: Result<i32, std::num::TryFromIntError> = (total / 10).try_into();\n    let too_big: Result<i32, std::num::TryFromIntError> = total.try_into();\n    println!("{:?} {:?}", fits, too_big);\n}',
          [
            'Ok(500000000) Err(TryFromIntError(()))',
            'Ok(500000000) Ok(5000000000)',
            'Err(TryFromIntError(())) Err(TryFromIntError(()))',
            'Ok(500000000) Ok(705032704)',
          ],
          0,
          '500000000 fits in an i32, but 5000000000 is above i32::MAX, so only the second conversion fails.',
        ),
        choose(
          'n is an i32. Which line converts it to a u8 and keeps the possibility of failure?',
          [
            'let b: u8 = n.into();',
            'let b: Result<u8, std::num::TryFromIntError> = n.try_into();',
            'let b = u8::from(n);',
            'let b: Result<u8, std::num::TryFromIntError> = n.into();',
          ],
          1,
          'try_into is the fallible conversion and returns a Result. into and from do not exist for i32 to u8.',
        ),
      ],
    },
    {
      title: 'Match on the Result to choose a fallback',
      explanation: [
        'Because the conversion returns a Result, you decide what out of range means: the Ok arm uses the converted value, and the Err arm picks an explicit fallback.',
        'The error does not say which side the value fell off. When the fallback depends on that, check the original value, for example whether it is negative.',
      ],
      example: {
        language: 'rust',
        code: 'fn small_count(n: i64) -> u32 {\n    match u32::try_from(n) {\n        Ok(count) => count,\n        Err(_) => {\n            if n < 0 {\n                0\n            } else {\n                u32::MAX\n            }\n        }\n    }\n}\n\nfn main() {\n    println!("{} {} {}", small_count(42), small_count(-7), small_count(9000000000));\n}',
        output: '42 0 4294967295',
        explanation:
          '42 fits. -7 fails and is negative, so the fallback is 0. 9000000000 fails and is positive, so the fallback is u32::MAX.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn level(n: i32) -> u8 {\n    match u8::try_from(n) {\n        Ok(v) => v,\n        Err(_) => 0,\n    }\n}\n\nfn main() {\n    println!("{} {} {}", level(12), level(256), level(-3));\n}',
          ['12 255 0', '12 0 0', '12 0 253', '12 256 -3'],
          1,
          '12 fits in a u8. 256 and -3 do not, and this match uses 0 for every Err, whichever side the value was on.',
        ),
        predictOutput(
          'What is printed?',
          'fn describe(n: i64) -> String {\n    match i32::try_from(n) {\n        Ok(v) => format!("fits: {}", v),\n        Err(_) => format!("too wide: {}", n),\n    }\n}\n\nfn main() {\n    println!("{}", describe(-3000000000));\n}',
          [
            'fits: -3000000000',
            'fits: 1294967296',
            'too wide: -3000000000',
            'too wide: TryFromIntError(())',
          ],
          2,
          '-3000000000 is below the smallest i32, so the Err arm runs and prints the original i64 value.',
        ),
        choose(
          'A clamp function returns 255 for any n above 255 and 0 for any n below 0. After u8::try_from(n) gives Err, how does it choose between them?',
          [
            'By reading the error, which says which side overflowed',
            'By checking whether n is negative',
            'It cannot; it has to return 0 for both',
            'By calling try_from again with n + 1',
          ],
          1,
          'TryFromIntError carries no direction, so the function looks at n itself.',
        ),
        predictOutput(
          'What does this program print?',
          'fn clamp(n: i32) -> u8 {\n    match u8::try_from(n) {\n        Ok(b) => b,\n        Err(_) => {\n            if n < 0 {\n                0\n            } else {\n                255\n            }\n        }\n    }\n}\n\nfn main() {\n    let total = u32::from(clamp(300)) + u32::from(clamp(-20)) + u32::from(clamp(45));\n    println!("{}", total);\n}',
          ['300', '325', '45', '555'],
          0,
          'clamp(300) is 255, clamp(-20) is 0, and clamp(45) is 45. Widened to u32, they sum to 300.',
        ),
      ],
    },
  ],
  'rust-copied-cloned': [
    {
      title: 'Copy the value out of an Option<&T> with copied',
      explanation: [
        'first() and last() return Option<&T>: a reference to an element inside the slice, not the element itself. Calling .copied() on that Option turns Some(&x) into Some(x) by copying x, which works for Copy types such as i32. None stays None.',
        'Debug output looks the same either way, Some(4), but the types differ: Option<&i32> versus Option<i32>.',
      ],
      example: {
        language: 'rust',
        code: 'fn last_score(scores: &[i32]) -> Option<i32> {\n    scores.last().copied()\n}\n\nfn main() {\n    println!("{:?}", last_score(&[70, 85, 92]));\n    println!("{:?}", last_score(&[]));\n}',
        output: 'Some(92)\nNone',
        explanation:
          'last() gives a reference to 92, and copied turns it into an owned i32, matching the declared Option<i32>. For an empty slice, last() is None and copied keeps None.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn main() {\n    let temps = [18, 21, 17];\n    let first = temps.first().copied();\n    println!("{:?}", first);\n}',
          ['Some(&18)', 'Some(17)', '18', 'Some(18)'],
          3,
          'first() refers to 18, and copied makes it an owned i32 inside Some.',
        ),
        predictOutput(
          'What is printed?',
          'fn first_reading(values: &[u32]) -> Option<u32> {\n    values.first().copied()\n}\n\nfn main() {\n    println!("{:?}", first_reading(&[]));\n}',
          ['Some(0)', '0', 'None', 'Some(None)'],
          2,
          'An empty slice has no first element, so first() is None, and copied leaves None unchanged.',
        ),
        choose(
          'values has type &[i32]. What is the type of values.first().copied()?',
          ['Option<&i32>', 'i32', '&i32', 'Option<i32>'],
          3,
          'first() gives Option<&i32>, and copied replaces the reference with a copy of the i32 while keeping the Option.',
        ),
        choose(
          'Why does the compiler reject this function?',
          [
            'first() gives Option<&i32>, not Option<i32>',
            'first() gives an i32, not an Option',
            'first() cannot be called on a borrowed slice',
            'An empty slice must be checked with if first',
          ],
          0,
          'The function promises owned values but returns a reference. Adding .copied() after first() fixes it.',
          'fn first_or_none(values: &[i32]) -> Option<i32> {\n    values.first()\n}',
        ),
      ],
    },
    {
      title: 'Clone the value with cloned when it is not Copy',
      explanation: [
        'A String is not Copy, so .copied() on an Option<&String> does not compile. .cloned() calls clone on the referenced value instead and gives an Option<String>, a separately owned copy, while the slice keeps its own String.',
        'For Copy types such as i32, cloned also works and gives the same result as copied; copied simply states that the copy is cheap.',
      ],
      example: {
        language: 'rust',
        code: 'fn first_name(names: &[String]) -> Option<String> {\n    names.first().cloned()\n}\n\nfn main() {\n    let names = [String::from("Ada"), String::from("Grace")];\n    let picked = first_name(&names);\n    println!("{:?} {:?}", picked, names);\n}',
        output: 'Some("Ada") ["Ada", "Grace"]',
        explanation:
          'cloned makes a new String "Ada" for the caller. The array still owns both of its Strings, so it prints unchanged.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn main() {\n    let words = [String::from("red"), String::from("blue")];\n    let last = words.last().cloned();\n    println!("{:?}", last);\n}',
          ['Some(blue)', 'Some("red")', '"blue"', 'Some("blue")'],
          3,
          'last() refers to the String "blue", and cloned returns an owned copy inside Some. Debug output quotes the String.',
        ),
        choose(
          'What happens when you compile this program?',
          [
            'It prints Some("new")',
            'It prints Some(new)',
            'It fails to compile because String is not Copy',
            'It moves "new" out of tags and prints Some("new")',
          ],
          2,
          'copied works only when the referenced type is Copy. A String must be duplicated with clone, so this needs cloned.',
          'fn main() {\n    let tags = [String::from("new"), String::from("sale")];\n    let first = tags.first().copied();\n    println!("{:?}", first);\n}',
        ),
        choose(
          'opt has type Option<&i32>. Which statement about opt.copied() and opt.cloned() is true?',
          [
            'Only copied compiles for i32',
            'Both give the same Option<i32>',
            'Only cloned compiles for i32',
            'cloned leaves it as Option<&i32>',
          ],
          1,
          'i32 is Copy, and every Copy type can also be cloned, so both produce an owned Option<i32> with the same value.',
        ),
        predictOutput(
          'What is printed?',
          'fn main() {\n    let items = [String::from("pen"), String::from("ink")];\n    let a = items.first().cloned();\n    let b = items.first().cloned();\n    println!("{:?} {:?} {}", a, b, items.len());\n}',
          [
            'Some("pen") Some("pen") 2',
            'Some("pen") Some("ink") 2',
            'Some("pen") None 1',
            'Some("pen") Some("pen") 0',
          ],
          0,
          'cloned copies the String without removing it, so the second call finds the same first element and the array still has 2 items.',
        ),
      ],
    },
    {
      title: 'Return owned values from a borrowed slice',
      explanation: [
        'A function that borrows a slice and promises Option<T> needs copied or cloned on each lookup: copied for Copy types like integers, cloned for owned data like String. The caller keeps its data, and the returned values do not borrow from it.',
      ],
      example: {
        language: 'rust',
        code: 'fn first_and_last(words: &[String]) -> (Option<String>, Option<String>) {\n    (words.first().cloned(), words.last().cloned())\n}\n\nfn main() {\n    let words = [String::from("start"), String::from("middle"), String::from("end")];\n    println!("{:?}", first_and_last(&words));\n    println!("{:?}", first_and_last(&words[1..2]));\n}',
        output:
          '(Some("start"), Some("end"))\n(Some("middle"), Some("middle"))',
        explanation:
          'For the whole array the ends are "start" and "end". The slice words[1..2] holds only "middle", so it is both the first and the last element.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn ends(values: &[u8]) -> (Option<u8>, Option<u8>) {\n    (values.first().copied(), values.last().copied())\n}\n\nfn main() {\n    let data = [4, 9, 2, 7];\n    println!("{:?}", ends(&data[1..3]));\n}',
          [
            '(Some(4), Some(7))',
            '(Some(9), Some(7))',
            '(Some(9), Some(2))',
            '(Some(4), Some(2))',
          ],
          2,
          'data[1..3] contains the elements at indexes 1 and 2, which are 9 and 2. The range excludes index 3.',
        ),
        predictOutput(
          'What is printed?',
          'fn edges(words: &[String]) -> (Option<String>, Option<String>) {\n    (words.first().cloned(), words.last().cloned())\n}\n\nfn main() {\n    let words = [String::from("a"), String::from("b")];\n    println!("{:?}", edges(&words[1..1]));\n}',
          [
            '(Some("b"), Some("b"))',
            '(None, None)',
            '(Some("a"), Some("a"))',
            '(Some("a"), None)',
          ],
          1,
          '1..1 is an empty range, so the slice has no elements and both lookups give None.',
        ),
        choose(
          'Which return type fits fn pick(names: &[String]) -> ??? { names.last().cloned() }?',
          ['Option<&String>', 'String', '&String', 'Option<String>'],
          3,
          'cloned turns the Option<&String> from last() into an Option<String> holding an owned copy.',
        ),
        choose(
          'Slice a has type &[i32] and slice b has type &[String]. Which calls give owned values from a.first() and b.first()?',
          [
            'copied for a, cloned for b',
            'cloned for a, copied for b',
            'copied for both',
            'Neither; first() already gives owned values',
          ],
          0,
          'i32 is Copy, so copied works for a. String is not Copy, so b needs cloned.',
        ),
      ],
    },
  ],
  'rust-option-queries': [
    {
      title: 'Check which variant you have',
      explanation: [
        'is_some() and is_none() return a bool saying whether an Option holds a value. is_ok() and is_err() do the same for a Result. They suit if conditions where you only need to know which case you have, not the value inside.',
      ],
      example: {
        language: 'rust',
        code: 'fn main() {\n    let found: Option<i32> = Some(0);\n    let parsed = "12x".parse::<i32>();\n    println!("{} {}", found.is_some(), found.is_none());\n    println!("{} {}", parsed.is_ok(), parsed.is_err());\n}',
        output: 'true false\nfalse true',
        explanation:
          'Some(0) holds a value, even though the value is zero, so is_some is true. "12x" fails to parse, so the Result is Err: is_ok is false and is_err is true.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn main() {\n    let scores = [40, 75];\n    println!("{} {}", scores.first().is_none(), scores.last().is_some());\n}',
          ['true false', 'false true', 'true true', 'false false'],
          1,
          'The array is not empty, so first() is Some and is_none is false, while last() is Some and is_some is true.',
        ),
        predictOutput(
          'What is printed?',
          'fn main() {\n    let count = "0".parse::<u32>();\n    let price = "9.99".parse::<u32>();\n    println!("{} {}", count.is_ok(), price.is_err());\n}',
          ['false true', 'true false', 'true true', 'false false'],
          2,
          '"0" is a valid u32, so is_ok is true; zero is a value, not a failure. "9.99" is not a whole number, so is_err is true.',
        ),
        predictOutput(
          'What does this program print?',
          'fn kind(text: &str) -> &\'static str {\n    if text.parse::<i32>().is_ok() {\n        "number"\n    } else {\n        "word"\n    }\n}\n\nfn main() {\n    println!("{} {} {}", kind("-8"), kind("eight"), kind("8.0"));\n}',
          [
            'number word number',
            'number word word',
            'word word number',
            'number number number',
          ],
          1,
          '"-8" parses as an i32, but "eight" and "8.0" do not, so only the first is_ok is true.',
        ),
        choose(
          'A program counts how many lines are valid integers but never uses the numbers. Which test fits each line?',
          [
            'line.parse::<i32>().is_some()',
            'line.is_ok()',
            'line.parse::<i32>().is_ok()',
            'line.parse::<i32>() == true',
          ],
          2,
          'parse returns a Result, and is_ok answers whether it succeeded without extracting the value. is_some belongs to Option.',
        ),
      ],
    },
    {
      title: 'Supply a default with unwrap_or',
      explanation: [
        'opt.unwrap_or(d) returns the value inside Some, or d when the Option is None. Result has the same method: the Ok value, or d on Err, with the error discarded.',
        'The result is a plain value, no longer wrapped, so you can do arithmetic with it right away.',
      ],
      example: {
        language: 'rust',
        code: 'fn main() {\n    let present: Option<i32> = Some(7);\n    let absent: Option<i32> = None;\n    println!("{} {}", present.unwrap_or(0), absent.unwrap_or(0));\n}',
        output: '7 0',
        explanation:
          'present holds 7, so unwrap_or returns it and ignores the default. absent is None, so it returns the default 0.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn main() {\n    let retries = "three".parse::<u32>().unwrap_or(3);\n    println!("{}", retries + 1);\n}',
          ['1', 'Ok(4)', '3', '4'],
          3,
          '"three" is not digits, so the default 3 is used, and 3 + 1 is 4.',
        ),
        predictOutput(
          'What is printed?',
          'fn half(n: i32) -> Option<i32> {\n    if n % 2 == 0 {\n        Some(n / 2)\n    } else {\n        None\n    }\n}\n\nfn main() {\n    println!("{} {}", half(10).unwrap_or(-1), half(7).unwrap_or(-1));\n}',
          ['5 -1', '5 3', '-1 -1', 'Some(5) None'],
          0,
          'half(10) is Some(5), so 5 is returned. half(7) is None, so the default -1 is used.',
        ),
        predictOutput(
          'What does this program print?',
          'fn main() {\n    let width = "0".parse::<i32>().unwrap_or(80);\n    let height = "".parse::<i32>().unwrap_or(24);\n    println!("{}x{}", width, height);\n}',
          ['80x24', '0x0', '80x0', '0x24'],
          3,
          '"0" parses successfully, so its own value 0 is kept. Only the empty text fails and falls back to 24.',
        ),
        choose(
          'What is the type of "5".parse::<i64>().unwrap_or(0)?',
          ['Result<i64, ParseIntError>', 'Option<i64>', 'i64', 'i32'],
          2,
          'unwrap_or removes the wrapper and returns either the Ok value or the default, both of type i64.',
        ),
      ],
    },
    {
      title: 'Convert between Result and Option with ok and ok_or',
      explanation: [
        'result.ok() turns a Result into an Option: Ok(v) becomes Some(v), and Err becomes None, dropping the error.',
        'opt.ok_or(e) goes the other way: Some(v) becomes Ok(v), and None becomes Err(e) holding the error you supply.',
      ],
      example: {
        language: 'rust',
        code: 'fn main() {\n    let good = "15".parse::<i32>().ok();\n    let bad = "fifteen".parse::<i32>().ok();\n    let missing: Option<i32> = None;\n    println!("{:?} {:?}", good, bad);\n    println!("{:?}", missing.ok_or("no value"));\n}',
        output: 'Some(15) None\nErr("no value")',
        explanation:
          'The successful parse becomes Some(15) and the failed one becomes None. missing is None, so ok_or turns it into Err holding the given message.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn main() {\n    println!("{:?}", "256".parse::<u8>().ok());\n}',
          [
            'Some(256)',
            'Some(0)',
            'Err(ParseIntError { kind: PosOverflow })',
            'None',
          ],
          3,
          '256 does not fit in a u8, so parse returns Err, and ok turns any Err into None.',
        ),
        predictOutput(
          'What is printed?',
          'fn main() {\n    let scores = [88, 92];\n    let empty: [i32; 0] = [];\n    println!("{:?}", scores.last().ok_or("empty"));\n    println!("{:?}", empty.last().ok_or("empty"));\n}',
          [
            'Some(92)\nNone',
            'Ok(92)\nErr("empty")',
            'Ok(92)\nOk("empty")',
            'Ok(88)\nErr("empty")',
          ],
          1,
          'last() is Some for the full array, so ok_or gives Ok(92). For the empty array it is None, which becomes Err("empty").',
        ),
        choose(
          'Which call turns an Option<u32> into a Result<u32, &str> where None becomes Err("missing")?',
          [
            'opt.ok_or("missing")',
            'opt.unwrap_or("missing")',
            'opt.ok()',
            'opt.is_err("missing")',
          ],
          0,
          'ok_or keeps a Some value as Ok and uses its argument as the Err payload for None.',
        ),
        predictOutput(
          'What does this program print?',
          'fn main() {\n    let a = "7".parse::<i32>().ok();\n    let b: Option<i32> = Some(7);\n    println!("{:?} {:?}", a, b.ok_or(0));\n}',
          ['Ok(7) Some(7)', 'Some(7) Ok(7)', 'Some(7) Some(7)', '7 7'],
          1,
          'ok turns Ok(7) into Some(7). ok_or turns Some(7) into Ok(7); the 0 would be used only for None.',
        ),
      ],
    },
    {
      title: 'Parse with a fallback in one expression',
      explanation: [
        'These methods chain. text.parse::<u32>().ok().unwrap_or(30) turns any parse failure into None and then into 30, giving a plain u32 in one expression.',
        'Choose the default with care: if it is also a valid input, such as 0, the caller cannot tell a failure from a real value. When that matters, keep the Result, or check is_err before falling back.',
      ],
      example: {
        language: 'rust',
        code: 'fn timeout_secs(text: &str) -> u32 {\n    text.parse::<u32>().ok().unwrap_or(30)\n}\n\nfn main() {\n    println!("{} {} {}", timeout_secs("5"), timeout_secs("five"), timeout_secs("-5"));\n}',
        output: '5 30 30',
        explanation:
          '"5" parses to 5. "five" is not a number, and u32 rejects the minus sign in "-5", so both fall back to 30.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn pages(text: &str) -> u8 {\n    text.parse::<u8>().ok().unwrap_or(1)\n}\n\nfn main() {\n    println!("{} {} {}", pages("12"), pages("300"), pages("0"));\n}',
          ['12 1 0', '12 255 0', '12 1 1', '12 44 0'],
          0,
          '"300" is too large for a u8 and falls back to 1, while "0" is a valid u8 and keeps its value 0.',
        ),
        predictOutput(
          'What is printed?',
          'fn main() {\n    let inputs = ["4", "four", "40", ""];\n    let mut total = 0;\n    for i in 0..inputs.len() {\n        total += inputs[i].parse::<i32>().ok().unwrap_or(0);\n    }\n    println!("{}", total);\n}',
          ['440', '44', '4', '0'],
          1,
          'Each text that does not parse adds the default 0, so the total is 4 + 0 + 40 + 0 = 44.',
        ),
        choose(
          'A function reads a port with text.parse::<u32>().ok().unwrap_or(0). Why is 0 a risky default?',
          [
            'unwrap_or(0) panics when the text is empty',
            'ok() cannot be called on a parse result',
            'A u32 cannot hold the value 0',
            '"0" and a typo both give 0, so failure goes unnoticed',
          ],
          3,
          'A default that is also a valid result hides the failure from the caller.',
        ),
        predictOutput(
          'What does this program print?',
          'fn read(text: &str) -> Result<i32, &\'static str> {\n    text.parse::<i32>().ok().ok_or("not a number")\n}\n\nfn main() {\n    println!("{:?} {:?}", read("-2"), read("2-"));\n}',
          [
            'Some(-2) None',
            'Ok(-2) Err(ParseIntError { kind: InvalidDigit })',
            'Ok(-2) Ok(2)',
            'Ok(-2) Err("not a number")',
          ],
          3,
          'ok turns the parse result into an Option, and ok_or turns it back into a Result with the new message in place of the ParseIntError.',
        ),
      ],
    },
  ],
  'rust-unwrap': [
    {
      title: 'Take the value out with unwrap',
      explanation: [
        'unwrap() returns the payload: Some(5).unwrap() is 5, and so is Ok(5).unwrap(). When there is no payload, on None or Err, it panics: the program stops with an error message instead of continuing.',
        'So unwrap is safe only where you know the value is present.',
      ],
      example: {
        language: 'rust',
        code: 'fn main() {\n    let count = "12".parse::<i32>().unwrap();\n    let extra = Some(3).unwrap();\n    println!("{}", count + extra);\n}',
        output: '15',
        explanation:
          '"12" parses, so unwrap gives the i32 12. Some(3).unwrap() gives 3. Their sum is 15.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn main() {\n    let values = [8, 1, 6];\n    let last = values.last().unwrap();\n    println!("{}", last);\n}',
          ['Some(6)', '8', '6', '&6'],
          2,
          'last() is Some holding the final element, and unwrap returns that element, 6.',
        ),
        choose(
          'What happens when this program runs?',
          [
            'It prints 4, dropping the fraction',
            'It prints 4.5',
            'It panics because the parse result is Err',
            'It prints 0',
          ],
          2,
          '"4.5" is not a valid i32, so parse returns Err and unwrap panics before println runs.',
          'fn main() {\n    let n = "4.5".parse::<i32>().unwrap();\n    println!("{}", n);\n}',
        ),
        predictOutput(
          'What is printed?',
          'fn halve(n: i32) -> Option<i32> {\n    if n % 2 == 0 {\n        Some(n / 2)\n    } else {\n        None\n    }\n}\n\nfn main() {\n    let x = halve(20).unwrap();\n    let y = halve(x).unwrap();\n    println!("{}", y);\n}',
          ['5', '10', 'Some(5)', '20'],
          0,
          'halve(20) is Some(10), which unwrap turns into 10. halve(10) is Some(5), which unwraps to 5.',
        ),
        choose(
          'What happens when this program runs?',
          [
            'It prints 0',
            'It prints None',
            'It panics because first() returned None',
            'It fails to compile because the array is empty',
          ],
          2,
          'An empty array has no first element, so first() is None and unwrap panics.',
          'fn main() {\n    let empty: [i32; 0] = [];\n    let first = empty.first().unwrap();\n    println!("{}", first);\n}',
        ),
      ],
    },
    {
      title: 'Explain the assumption with expect',
      explanation: [
        'expect("message") works like unwrap but puts your message in the panic output. Write the message as the assumption that was broken, such as "config must contain a port", so whoever reads the crash knows what went wrong.',
        'Like unwrap, expect returns the plain value on success, so an annotation such as let width: u32 = text.parse().expect("…"); also tells parse which type to produce.',
      ],
      example: {
        language: 'rust',
        code: 'fn main() {\n    let width: u32 = "640".parse().expect("width must be a whole number");\n    println!("{}", width / 2);\n}',
        output: '320',
        explanation:
          'The annotation makes parse target u32. "640" is valid, so expect returns 640 and the message is never used.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn main() {\n    let a: i32 = "-7".parse().expect("a must be an integer");\n    let b = Some(10).expect("b is always set");\n    println!("{}", a * b);\n}',
          ['-70', 'a must be an integer', '70', 'Some(-70)'],
          0,
          'Both expect calls succeed, so they return -7 and 10, and the product is -70. The messages appear only on failure.',
        ),
        choose(
          'let n: u8 = text.parse().expect("level must be 0-255"); runs with text equal to "300". What happens?',
          [
            'n becomes 255 and the program continues',
            'n becomes 44 and the program continues',
            'It prints the message, then sets n to 0',
            'It panics with a message containing level must be 0-255',
          ],
          3,
          '300 does not fit in a u8, so parse returns Err and expect panics with the given message.',
        ),
        choose(
          'A program crashes with: port must be a number: ParseIntError { kind: InvalidDigit }. Where did the words before the colon come from?',
          [
            'The text that failed to parse',
            'The message passed to expect',
            'Rust’s description of ParseIntError',
            'The name of the variable being assigned',
          ],
          1,
          'expect on an Err panics with your message followed by the error’s Debug form, which is the part after the colon.',
        ),
        predictOutput(
          'What is printed?',
          'fn main() {\n    let data = [3, 9, 4];\n    let first = data.first().expect("data is never empty");\n    let parsed: i32 = "5".parse().expect("literal is a number");\n    println!("{}", first + parsed);\n}',
          ['8', '35', 'Some(8)', '9'],
          0,
          'first() is Some(3) and "5" parses, so both expect calls return their values, and 3 + 5 is 8.',
        ),
      ],
    },
    {
      title: 'Panic only where failure would be a bug',
      explanation: [
        'A panic stops the program, so reserve unwrap and expect for values that must be present if the code is correct, such as a number literal you wrote yourself or the first item of a list you just checked is not empty.',
        'Input that can legitimately be wrong, such as text from a user or a file, should be handled instead: unwrap_or for a default, or a match that reports the problem.',
      ],
      example: {
        language: 'rust',
        code: 'fn parse_or_zero(text: &str) -> i32 {\n    text.parse::<i32>().unwrap_or(0)\n}\n\nfn main() {\n    let limit: i32 = "100".parse().expect("the built-in limit is a valid number");\n    let user = parse_or_zero("12o");\n    println!("{} {}", limit, user);\n}',
        output: '100 0',
        explanation:
          '"100" is written in the source, so a failure would be a programming mistake, and expect fits. The user’s "12o" can be wrong, so it gets a fallback instead of a crash.',
      },
      questions: [
        choose(
          'Where is expect the right tool?',
          [
            'Parsing a number typed by a user',
            'Parsing the constant "8080" from your own code',
            'Reading the first item of a list that might be empty',
            'Parsing a line from a file you do not control',
          ],
          1,
          'Only the constant is guaranteed to parse when the code is correct. The other values can be missing or malformed in normal use.',
        ),
        choose(
          'A command-line tool parses its count argument with unwrap, and users sometimes type words. What is the better fix?',
          [
            'Replace unwrap with expect so the crash has a message',
            'match on the parse result and print a helpful error on Err',
            'Parse into f64 so that more text is accepted',
            'Call unwrap twice so the second call catches the error',
          ],
          1,
          'A typo from a user is expected, not a bug, so the program should handle Err instead of panicking with any message.',
        ),
        predictOutput(
          'What does this program print?',
          'fn main() {\n    let default_size: u32 = "16".parse().expect("default size is a valid number");\n    let requested = "big".parse::<u32>().unwrap_or(default_size);\n    println!("{}", requested * 2);\n}',
          ['0', '16', '32', '2'],
          2,
          'The constant parses to 16, and "big" falls back to that default, so requested is 16 and twice that is 32.',
        ),
        choose(
          'What happens when this program runs?',
          [
            'It prints 1 1',
            'It prints 1 0',
            'It panics on the line that defines b',
            'It panics on the line that defines a',
          ],
          2,
          'unwrap_or replaces the Err with 1, so a is fine. unwrap has no fallback, so the line that defines b panics.',
          'fn main() {\n    let a = "x".parse::<i32>().unwrap_or(1);\n    let b = "x".parse::<i32>().unwrap();\n    println!("{} {}", a, b);\n}',
        ),
      ],
    },
  ],
  'rust-option-question-mark': [
    {
      title: 'Unwrap Some with ? in a function returning Option',
      explanation: [
        'Inside a function that returns an Option, writing ? after an Option gives the value inside Some and lets the function continue, just as ? does with Ok in a function returning Result.',
        'The return type must match: ? on an Option needs the function to return an Option.',
      ],
      example: {
        language: 'rust',
        code: 'fn half(n: i32) -> Option<i32> {\n    if n % 2 == 0 {\n        Some(n / 2)\n    } else {\n        None\n    }\n}\n\nfn quarter(n: i32) -> Option<i32> {\n    let h = half(n)?;\n    half(h)\n}\n\nfn main() {\n    println!("{:?}", quarter(20));\n}',
        output: 'Some(5)',
        explanation:
          'half(20) is Some(10), so ? gives 10. half(10) is Some(5), which quarter returns as its result.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn first_doubled(values: &[i32]) -> Option<i32> {\n    let first = values.first()?;\n    Some(first * 2)\n}\n\nfn main() {\n    println!("{:?}", first_doubled(&[6, 1]));\n}',
          ['12', 'Some(Some(12))', 'Some(2)', 'Some(12)'],
          3,
          'first() is Some, so ? gives the first element 6, and the function returns Some(6 * 2).',
        ),
        choose(
          'In fn f() -> Option<u32>, the line let n = lookup()?; runs and lookup() returns Some(9). What is n?',
          ['9', 'None', 'Some(9)', 'Ok(9)'],
          0,
          '? takes the value out of Some, so n is the plain u32 9.',
        ),
        predictOutput(
          'What is printed?',
          'fn non_zero(n: i32) -> Option<i32> {\n    if n == 0 {\n        None\n    } else {\n        Some(n)\n    }\n}\n\nfn ratio(a: i32, b: i32) -> Option<i32> {\n    let divisor = non_zero(b)?;\n    Some(a / divisor)\n}\n\nfn main() {\n    println!("{:?}", ratio(17, 5));\n}',
          ['Some(3.4)', 'Some(2)', 'None', 'Some(3)'],
          3,
          '5 is not zero, so ? gives 5, and integer division of 17 by 5 is 3.',
        ),
        choose(
          'Why does the compiler reject this function?',
          [
            'last() returns an i32, so ? has nothing to unwrap',
            '? on an Option needs the function to return an Option',
            '? works only on parse results',
            'last + 1 cannot add a number to a reference',
          ],
          1,
          'last_plus_one returns i32, so ? has no way to return None from it.',
          'fn last_plus_one(values: &[i32]) -> i32 {\n    let last = values.last()?;\n    last + 1\n}',
        ),
      ],
    },
    {
      title: '? returns None as soon as a value is missing',
      explanation: [
        'When the Option is None, ? ends the function at that point and the function returns None. Later lines, including the final Some(...), do not run.',
      ],
      example: {
        language: 'rust',
        code: 'fn sum_ends(values: &[i32]) -> Option<i32> {\n    println!("looking at {} values", values.len());\n    let first = values.first()?;\n    println!("found first");\n    let last = values.last()?;\n    Some(first + last)\n}\n\nfn main() {\n    println!("{:?}", sum_ends(&[]));\n}',
        output: 'looking at 0 values\nNone',
        explanation:
          'The first println runs. The slice is empty, so first() is None and ? returns None before found first is printed.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn half(n: i32) -> Option<i32> {\n    if n % 2 == 0 {\n        Some(n / 2)\n    } else {\n        None\n    }\n}\n\nfn eighth(n: i32) -> Option<i32> {\n    let a = half(n)?;\n    let b = half(a)?;\n    half(b)\n}\n\nfn main() {\n    println!("{:?} {:?}", eighth(40), eighth(12));\n}',
          ['Some(5) None', 'Some(5) Some(1)', 'Some(5) Some(3)', 'None None'],
          0,
          '40 halves to 20, 10, then 5. 12 halves to 6 and then 3, but half(3) is None, so eighth(12) returns None.',
        ),
        predictOutput(
          'What is printed?',
          'fn positive(n: i32) -> Option<i32> {\n    if n > 0 {\n        Some(n)\n    } else {\n        None\n    }\n}\n\nfn trace(n: i32) -> Option<i32> {\n    println!("start {}", n);\n    let p = positive(n)?;\n    println!("passed {}", p);\n    Some(p * 10)\n}\n\nfn main() {\n    println!("{:?}", trace(-2));\n}',
          [
            'start -2\npassed -2\nNone',
            'None',
            'start -2\nNone',
            'start -2\npassed -2\nSome(-20)',
          ],
          2,
          'start prints first. positive(-2) is None, so ? returns None before passed is printed.',
        ),
        choose(
          'A function returning Option<i32> applies ? on three lines in a row. The second one sees None. What happens?',
          [
            'The function returns None, and the third line never runs',
            'The function returns Some of the first value',
            'The third line runs, then the function returns None',
            'The program panics at the second line',
          ],
          0,
          '? returns None from the function immediately, so nothing after the second ? runs.',
        ),
        predictOutput(
          'What does this program print?',
          'fn spread(values: &[i32]) -> Option<i32> {\n    let low = values.first()?;\n    let high = values.last()?;\n    Some(high - low)\n}\n\nfn main() {\n    let data = [2, 9, 15];\n    println!("{:?} {:?}", spread(&data[..1]), spread(&data[3..]));\n}',
          ['None None', 'Some(0) None', 'Some(13) None', 'Some(0) Some(0)'],
          1,
          'data[..1] holds only 2, so first and last are both 2 and the spread is Some(0). data[3..] is empty, so first() is None and ? returns None.',
        ),
      ],
    },
    {
      title: 'Chain lookups and wrap the answer in Some',
      explanation: [
        'Put ? on each lookup that might be missing, then wrap the computed answer in Some as the tail expression, because the function promises an Option. Leaving out Some is a type error: the tail would be a plain number.',
        'Here ? applies to Options only. A Result inside such a function needs its own handling, such as a match.',
      ],
      example: {
        language: 'rust',
        code: 'fn corner_sum(rows: &[i32], cols: &[i32]) -> Option<i32> {\n    let r = rows.first()?;\n    let c = cols.last()?;\n    Some(r + c)\n}\n\nfn main() {\n    println!("{:?}", corner_sum(&[1, 2], &[10, 20]));\n    println!("{:?}", corner_sum(&[1, 2], &[]));\n}',
        output: 'Some(21)\nNone',
        explanation:
          'rows.first() is 1 and cols.last() is 20, so the answer is Some(21). In the second call cols is empty, so ? returns None.',
      },
      questions: [
        choose(
          'What must change for this function to compile?',
          [
            'Each ? must be removed',
            'The return type must be i32',
            'The last line must be Some(x + y)',
            'x and y must be declared mut',
          ],
          2,
          'The function promises Option<i32>, so the plain sum must be wrapped in Some.',
          'fn total(a: &[i32], b: &[i32]) -> Option<i32> {\n    let x = a.first()?;\n    let y = b.first()?;\n    x + y\n}',
        ),
        choose(
          'Why does the compiler reject this function?',
          [
            'first() cannot be used on a slice of &str',
            'Some(n) should be written Ok(n)',
            'parse cannot be called through a reference',
            'The second ? is applied to a Result',
          ],
          3,
          'parse returns a Result, and ? cannot turn its Err into the None this function returns.',
          'fn parse_first(texts: &[&str]) -> Option<i32> {\n    let text = texts.first()?;\n    let n = text.parse::<i32>()?;\n    Some(n)\n}',
        ),
        predictOutput(
          'What is printed?',
          'fn pair_product(a: &[i32], b: &[i32]) -> Option<i32> {\n    let x = a.last()?;\n    let y = b.last()?;\n    Some(x * y)\n}\n\nfn main() {\n    let empty: [i32; 0] = [];\n    println!("{:?}", pair_product(&[3, 4], &[5]));\n    println!("{:?}", pair_product(&empty, &[5]));\n}',
          [
            'Some(15)\nNone',
            'Some(20)\nSome(0)',
            'Some(20)\nNone',
            'Some(20)\nSome(5)',
          ],
          2,
          'The last elements are 4 and 5, so the first call returns Some(20). In the second call a is empty, so ? returns None.',
        ),
        predictOutput(
          'What does this program print?',
          'fn digit(n: i32) -> Option<i32> {\n    if n >= 0 && n <= 9 {\n        Some(n)\n    } else {\n        None\n    }\n}\n\nfn two_digit(tens: i32, ones: i32) -> Option<i32> {\n    let t = digit(tens)?;\n    let o = digit(ones)?;\n    Some(t * 10 + o)\n}\n\nfn main() {\n    println!("{:?} {:?}", two_digit(4, 2), two_digit(4, 12));\n}',
          [
            'Some(42) Some(52)',
            'Some(42) Some(4)',
            'Some(42) Some(40)',
            'Some(42) None',
          ],
          3,
          '4 and 2 are both digits, giving Some(42). 12 is not a digit, so the second ? returns None.',
        ),
      ],
    },
  ],
  'rust-vec-push': [
    {
      title: 'Create a Vec and read its elements',
      explanation: [
        'A Vec<i32> is a growable list of i32 values stored one after another. The vec! macro builds one from the values you list, as in vec![4, 7, 1]. Like an array, it is indexed from 0 with v[i], and v.len() gives the number of elements.',
        'Print a whole Vec with {:?}; it shows the elements in square brackets, the same way an array prints. Indexing past the end compiles, but the program panics when it runs, because a Vec’s length is only known at run time.',
      ],
      example: {
        language: 'rust',
        code: 'fn main() {\n    let temps = vec![18, 21, 19];\n    println!("{} {}", temps[0], temps.len());\n    println!("{:?}", temps);\n}',
        output: '18 3\n[18, 21, 19]',
        explanation:
          'temps[0] is the first element, 18, and len counts all three elements. {:?} prints the elements in order inside square brackets.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn main() {\n    let v = vec![4, 7, 1];\n    println!("{} {}", v[1], v.len());\n}',
          ['4 3', '7 3', '7 2', '1 3'],
          1,
          'Indexes start at 0, so v[1] is the second element, 7. len counts all 3 elements.',
        ),
        predictOutput(
          'What is printed?',
          'fn main() {\n    let names = vec!["ann", "bo"];\n    println!("{:?}", names);\n}',
          ['["ann", "bo"]', '[ann, bo]', 'vec!["ann", "bo"]', '("ann", "bo")'],
          0,
          '{:?} prints a Vec in square brackets, and each string keeps its quotes in Debug form.',
        ),
        predictOutput(
          'Which number does this program print?',
          'fn main() {\n    let v = vec![10, 20, 30, 40];\n    let last = v[v.len() - 1];\n    println!("{}", last);\n}',
          ['30', '4', '10', '40'],
          3,
          'len is 4, so the last valid index is 3, which holds 40.',
        ),
        choose(
          'What happens when this program runs?',
          [
            'It prints 7',
            'It prints 0',
            'It panics with an index out of bounds error',
            'It prints nothing and exits normally',
          ],
          2,
          'A 3-element Vec has indexes 0 to 2. Indexing with 3 compiles, then panics at run time.',
          'fn main() {\n    let v = vec![5, 6, 7];\n    println!("{}", v[3]);\n}',
        ),
      ],
    },
    {
      title: 'Grow a Vec with push',
      explanation: [
        'Vec::new() creates an empty Vec, and push adds one value at the end. Because push changes the Vec, the binding must be declared with let mut. Rust works out the element type from the values you push; write the type, as in let v: Vec<i32> = Vec::new();, when nothing else tells it.',
        'Each push makes len one larger. is_empty() returns true only while the Vec has no elements.',
      ],
      example: {
        language: 'rust',
        code: 'fn main() {\n    let mut scores = Vec::new();\n    println!("{}", scores.is_empty());\n    scores.push(12);\n    scores.push(8);\n    println!("{:?} {} {}", scores, scores.len(), scores.is_empty());\n}',
        output: 'true\n[12, 8] 2 false',
        explanation:
          'The Vec starts empty. The two pushes add 12 and then 8 at the end, so it holds two elements in that order and is no longer empty.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn main() {\n    let mut v = Vec::new();\n    v.push(3);\n    v.push(1);\n    v.push(2);\n    println!("{:?}", v);\n}',
          ['[1, 2, 3]', '[2, 1, 3]', '[3, 1, 2]', '[3]'],
          2,
          'push always appends at the end, so the elements keep the order they were pushed in.',
        ),
        predictOutput(
          'What is printed after the loop?',
          'fn main() {\n    let mut squares = Vec::new();\n    for i in 1..4 {\n        squares.push(i * i);\n    }\n    println!("{:?}", squares);\n}',
          ['[1, 4, 9]', '[1, 4, 9, 16]', '[0, 1, 4, 9]', '[1, 2, 3]'],
          0,
          'The range 1..4 yields 1, 2 and 3, and each square is pushed in turn.',
        ),
        predictOutput(
          'What does this program print?',
          'fn main() {\n    let mut v = vec![5, 6];\n    v.push(4);\n    println!("{} {}", v[2], v.len());\n}',
          ['6 2', '4 2', '5 3', '4 3'],
          3,
          'push adds 4 after the existing elements, at index 2, and the length becomes 3.',
        ),
        choose(
          'Why does this program fail to compile?',
          [
            'Vec::new() needs a starting value',
            'v is not declared mut, so push cannot change it',
            'push only works on a Vec made with vec!',
            'println! cannot print a Vec',
          ],
          1,
          'push modifies the Vec, which requires a mutable binding: let mut v = Vec::new();.',
          'fn main() {\n    let v = Vec::new();\n    v.push(1);\n    println!("{:?}", v);\n}',
        ),
      ],
    },
    {
      title: 'Remove the last element with pop',
      explanation: [
        'pop removes the last element and returns it wrapped in Some. When the Vec is empty there is nothing to remove, so pop returns None instead of panicking.',
        'That makes pop the safe way to take from the end of a Vec that might be empty: the Option tells you whether a value came out. Indexing with v[v.len() - 1] would panic on an empty Vec.',
      ],
      example: {
        language: 'rust',
        code: 'fn main() {\n    let mut v = vec![2, 4, 6];\n    let top = v.pop();\n    println!("{:?} {:?}", top, v);\n    let mut empty: Vec<i32> = Vec::new();\n    println!("{:?}", empty.pop());\n}',
        output: 'Some(6) [2, 4]\nNone',
        explanation:
          'The first pop removes 6, the last element, and returns Some(6); the Vec keeps [2, 4]. The empty Vec has nothing to give, so its pop returns None.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn main() {\n    let mut v = vec![1, 2, 3];\n    v.pop();\n    let x = v.pop();\n    println!("{:?} {}", x, v.len());\n}',
          ['Some(3) 2', 'Some(2) 1', 'Some(1) 1', 'Some(2) 2'],
          1,
          'The first pop removes 3 and its result is ignored. The second removes 2, leaving one element.',
        ),
        predictOutput(
          'What are the three printed lines?',
          'fn main() {\n    let mut v = vec![7, 9];\n    println!("{:?}", v.pop());\n    println!("{:?}", v.pop());\n    println!("{:?}", v.pop());\n}',
          [
            'Some(7)\nSome(9)\nNone',
            '9\n7\nNone',
            'Some(9)\nSome(7)\nSome(7)',
            'Some(9)\nSome(7)\nNone',
          ],
          3,
          'pop takes from the end: 9, then 7. The third call finds the Vec empty and returns None.',
        ),
        predictOutput(
          'What does this program print?',
          'fn main() {\n    let mut v = vec![0];\n    v.pop();\n    let again = v.pop();\n    println!("{:?} {}", again, v.len());\n}',
          ['None 0', 'Some(0) 0', 'Some(0) 1', 'None 1'],
          0,
          'The first pop removes the only element, 0. The second finds the Vec empty and returns None; a stored 0 would have shown as Some(0).',
        ),
        choose(
          'v might be empty. Which expression takes its last element without risking a panic?',
          ['v[v.len() - 1]', 'v[0]', 'v.pop()', 'v[v.len()]'],
          2,
          'pop returns None for an empty Vec. Each indexing form panics when there is no element at that position.',
        ),
      ],
    },
    {
      title: 'Use a Vec as a stack',
      explanation: [
        'push and pop both work at the end of the Vec, so the value pushed most recently is the first one popped: last in, first out. That is how a stack of plates behaves.',
        'A function can take a Vec by value and change it. Write mut before the parameter name, as in fn f(mut items: Vec<i32>), so the body may push to and pop from its own Vec.',
      ],
      example: {
        language: 'rust',
        code: 'fn undo_last(mut history: Vec<i32>, step: i32) -> (Option<i32>, usize) {\n    history.push(step);\n    history.push(step * 2);\n    let undone = history.pop();\n    (undone, history.len())\n}\n\nfn main() {\n    println!("{:?}", undo_last(vec![1], 5));\n}',
        output: '(Some(10), 2)',
        explanation:
          'history grows to [1, 5, 10]. pop removes the most recent value, 10, leaving two elements.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn main() {\n    let mut s = Vec::new();\n    s.push(1);\n    s.push(2);\n    s.pop();\n    s.push(3);\n    println!("{:?}", s);\n}',
          ['[1, 2, 3]', '[2, 3]', '[1, 3]', '[3, 1]'],
          2,
          'pop removes 2, the most recent push, before 3 is pushed onto the end.',
        ),
        predictOutput(
          'What is printed?',
          'fn take_top(mut v: Vec<i32>) -> (Option<i32>, usize) {\n    let top = v.pop();\n    (top, v.len())\n}\n\nfn main() {\n    println!("{:?}", take_top(Vec::new()));\n}',
          ['(None, 0)', '(Some(0), 0)', '(None, 1)', 'None'],
          0,
          'An empty Vec has nothing to pop, so top is None and the length stays 0.',
        ),
        predictOutput(
          'What does this program print?',
          'fn main() {\n    let mut v = Vec::new();\n    for i in 0..3 {\n        v.push(i * 10);\n    }\n    let a = v.pop();\n    let b = v.pop();\n    println!("{:?} {:?} {:?}", a, b, v);\n}',
          [
            'Some(0) Some(10) [20]',
            'Some(30) Some(20) [0, 10]',
            'Some(20) Some(10) [0, 10, 20]',
            'Some(20) Some(10) [0]',
          ],
          3,
          'The loop pushes 0, 10 and 20. Popping twice takes 20 and then 10, leaving [0].',
        ),
        choose(
          'This function does not compile. Which change fixes it?',
          [
            'Take the parameter as &Vec<i32>',
            'Return values.push(0) directly',
            'Build the vector inside with vec! instead',
            'Write mut values: Vec<i32> in the parameter list',
          ],
          3,
          'push needs a mutable binding. A by-value parameter becomes mutable when it is declared mut values.',
          'fn with_zero(values: Vec<i32>) -> Vec<i32> {\n    values.push(0);\n    values\n}',
        ),
      ],
    },
  ],
  'rust-vec-get': [
    {
      title: 'Look up an index with get',
      explanation: [
        'values.get(i) is the checked form of values[i]. When i is a valid index it returns Some with a reference to the element; when i is past the end it returns None instead of panicking.',
        'The reference prints like the value itself, so {:?} shows Some(8) rather than Some(&8). The last valid index is len() - 1, so get(len()) is already None.',
      ],
      example: {
        language: 'rust',
        code: 'fn main() {\n    let scores = [4, 9, 2];\n    println!("{:?} {:?}", scores.get(1), scores.get(3));\n}',
        output: 'Some(9) None',
        explanation:
          'Index 1 holds 9, so get returns Some with a reference to it. The array has 3 elements, so index 3 is out of range and get returns None.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn main() {\n    let a = [3, 6, 9];\n    println!("{:?}", a.get(2));\n}',
          ['Some(9)', 'Some(6)', 'None', '9'],
          0,
          'Indexes start at 0, so index 2 is the third element, 9, wrapped in Some.',
        ),
        predictOutput(
          'What is printed?',
          'fn peek(values: &[i32], i: usize) -> Option<&i32> {\n    values.get(i)\n}\n\nfn main() {\n    println!("{:?} {:?}", peek(&[5, 1], 2), peek(&[], 0));\n}',
          ['Some(1) None', 'None None', 'None Some(0)', 'Some(1) Some(0)'],
          1,
          'A 2-element slice has indexes 0 and 1, so index 2 gives None. An empty slice has no index 0 either.',
        ),
        choose(
          'What happens when this program runs?',
          [
            'It prints 0',
            'It prints 2',
            'It fails to compile: [1, 2] has no index 2',
            'It panics: index 2 is out of bounds',
          ],
          3,
          'Plain indexing cannot report a missing element, so it panics. values.get(2) would return None instead.',
          'fn third(values: &[i32]) -> i32 {\n    values[2]\n}\n\nfn main() {\n    println!("{}", third(&[1, 2]));\n}',
        ),
        choose(
          'A slice has 5 elements. Which call returns None?',
          ['get(0)', 'get(4)', 'get(2)', 'get(5)'],
          3,
          'Valid indexes run from 0 to 4, so 5 is the first index out of range.',
        ),
      ],
    },
    {
      title: 'Copy or clone the element out',
      explanation: [
        'get returns Option<&T>: it lends you the element. When the caller needs its own value, add .copied() for Copy types such as i32 to get an Option<i32>. A String is not Copy, so add .cloned() to get an Option<String>.',
        'None stays None in both cases, so the result still says whether the index existed.',
      ],
      example: {
        language: 'rust',
        code: 'fn price_at(prices: &[i32], slot: usize) -> Option<i32> {\n    prices.get(slot).copied()\n}\n\nfn main() {\n    let words = [String::from("red"), String::from("blue")];\n    let picked: Option<String> = words.get(0).cloned();\n    println!("{:?} {:?} {:?}", price_at(&[6, 3], 1), price_at(&[6, 3], 2), picked);\n}',
        output: 'Some(3) None Some("red")',
        explanation:
          'copied turns the Some(&3) from get into Some(3), and index 2 stays None. cloned makes an owned copy of the String at index 0.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn pick(values: &[i32], i: usize) -> Option<i32> {\n    values.get(i).copied()\n}\n\nfn main() {\n    let v = [7, 8, 9];\n    println!("{:?} {:?}", pick(&v, 0), pick(&v, 9));\n}',
          ['Some(7) None', 'Some(8) None', 'Some(7) Some(9)', 'None None'],
          0,
          'Index 0 holds 7. Index 9 is past the end, and copied keeps that None as None.',
        ),
        predictOutput(
          'What is printed?',
          'fn main() {\n    let names = [String::from("ada"), String::from("lin")];\n    let chosen: Option<String> = names.get(1).cloned();\n    println!("{:?}", chosen);\n}',
          ['Some(lin)', 'Some("ada")', '"lin"', 'Some("lin")'],
          3,
          'cloned gives an owned copy of the String at index 1, and Debug prints it with quotes inside Some.',
        ),
        choose(
          'Why does this function fail to compile?',
          [
            'get needs a range, not a single index',
            'get returns Option<&i32>, not Option<i32>; add .copied()',
            'A slice cannot be indexed with a usize',
            'An Option<i32> cannot hold None',
          ],
          1,
          'get lends a reference. copied turns the Option<&i32> into the Option<i32> the signature promises.',
          'fn at(values: &[i32], i: usize) -> Option<i32> {\n    values.get(i)\n}',
        ),
        choose(
          'names is a &[String]. Which expression gives an Option<String> the caller owns?',
          [
            'names.get(i).copied()',
            'names.get(i)',
            'names.get(i).cloned()',
            'names[i]',
          ],
          2,
          'String is not Copy, so copied is not available. cloned makes an owned copy of the String inside the Option.',
        ),
      ],
    },
    {
      title: 'Look up computed positions safely',
      explanation: [
        'get pays off when the index is calculated, such as i + 1 for the next element. If the calculation lands past the end, the result is None rather than a crash, so the same code works at the edges of the slice.',
        'Indexes are counted from the start of whatever you call get on. On a sub-slice like &v[1..3], get(0) is the sub-slice’s first element.',
      ],
      example: {
        language: 'rust',
        code: 'fn neighbors(values: &[i32], i: usize) -> (Option<i32>, Option<i32>) {\n    (values.get(i).copied(), values.get(i + 1).copied())\n}\n\nfn main() {\n    println!("{:?}", neighbors(&[4, 5, 6], 1));\n    println!("{:?}", neighbors(&[4, 5, 6], 2));\n}',
        output: '(Some(5), Some(6))\n(Some(6), None)',
        explanation:
          'At index 1 both lookups land inside the slice. At index 2, i + 1 is 3, which is past the end, so the second lookup is None.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn after(values: &[i32], i: usize) -> Option<i32> {\n    values.get(i + 1).copied()\n}\n\nfn main() {\n    let v = [2, 4, 8];\n    println!("{:?} {:?}", after(&v, 0), after(&v, 2));\n}',
          ['Some(2) Some(8)', 'Some(4) None', 'Some(4) Some(8)', 'None None'],
          1,
          'after(&v, 0) looks at index 1, which holds 4. after(&v, 2) looks at index 3, past the end.',
        ),
        predictOutput(
          'What is printed?',
          'fn main() {\n    let v = [10, 20, 30, 40];\n    let window = &v[1..3];\n    println!("{:?} {:?}", window.get(0), window.get(2));\n}',
          [
            'Some(10) Some(30)',
            'Some(20) Some(40)',
            'Some(20) None',
            'Some(10) None',
          ],
          2,
          'window is [20, 30], and its indexes start from its own first element, so get(0) is 20 and get(2) is past its end.',
        ),
        predictOutput(
          'What does this program print?',
          'fn ends(values: &[i32]) -> (Option<i32>, Option<i32>) {\n    let last = values.len();\n    (values.get(0).copied(), values.get(last).copied())\n}\n\nfn main() {\n    println!("{:?}", ends(&[3, 1, 7]));\n}',
          [
            '(Some(3), None)',
            '(Some(3), Some(7))',
            '(Some(3), Some(1))',
            '(None, Some(7))',
          ],
          0,
          'len() is 3, one past the last index, so get(3) returns None. The last element sits at len() - 1.',
        ),
        choose(
          'A function returning Option<i32> must give the element after position i, or None when i is the last position. Which body works without panicking?',
          [
            'Some(values[i + 1])',
            'values.get(i).copied()',
            'values.get(i + 1).copied()',
            'values[i + 1]',
          ],
          2,
          'get(i + 1) returns None at the end instead of panicking. Indexing panics there, and get(i) reads the wrong element.',
        ),
      ],
    },
  ],
  'rust-vec-retain': [
    {
      title: 'Keep the elements that pass a test',
      explanation: [
        'v.retain(f) goes through the Vec and keeps each element for which the function f returns true; every element where f returns false is removed. f receives each element as a reference, so its parameter type is &i32 and its body reads the value with *n.',
        'Pass a named function by its name alone, without parentheses: v.retain(is_small).',
      ],
      example: {
        language: 'rust',
        code: 'fn is_small(n: &i32) -> bool {\n    *n < 10\n}\n\nfn main() {\n    let mut v = vec![4, 12, 9, 30];\n    v.retain(is_small);\n    println!("{:?}", v);\n}',
        output: '[4, 9]',
        explanation:
          'is_small returns true for 4 and 9 and false for 12 and 30, so only 4 and 9 remain.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn positive(n: &i32) -> bool {\n    *n > 0\n}\n\nfn main() {\n    let mut v = vec![0, 5, -2, 7];\n    v.retain(positive);\n    println!("{:?}", v);\n}',
          ['[5, 7]', '[0, 5, 7]', '[0, -2]', '[7, 5]'],
          0,
          'positive returns false for 0 and -2, so they are removed; 5 and 7 stay.',
        ),
        predictOutput(
          'What is printed?',
          'fn over_hundred(n: &i32) -> bool {\n    *n > 100\n}\n\nfn main() {\n    let mut v = vec![3, 50, 99];\n    v.retain(over_hundred);\n    println!("{:?} {}", v, v.is_empty());\n}',
          ['[3, 50, 99] false', '[] true', '[99] false', '[] false'],
          1,
          'No element is above 100, so the predicate is false every time and retain removes them all.',
        ),
        choose(
          'You want to remove every 0 from a Vec<i32> and keep everything else. What should the predicate passed to retain return?',
          ['*n == 0', '*n > 0', '*n != 0', '*n >= 0'],
          2,
          'retain keeps elements where the predicate is true, so it must be true for every non-zero value. *n > 0 would also drop the negatives.',
        ),
        choose(
          'Why does this program fail to compile?',
          [
            'retain passes each element as &i32, but big takes an i32',
            'big must return i32, not bool',
            'v must not be mut when retain is called',
            'retain needs the predicate written as big()',
          ],
          0,
          'retain lends each element to the predicate, so the predicate has to accept &i32.',
          'fn big(n: i32) -> bool {\n    n > 5\n}\n\nfn main() {\n    let mut v = vec![3, 8];\n    v.retain(big);\n    println!("{:?}", v);\n}',
        ),
      ],
    },
    {
      title: 'retain edits the Vec in place and keeps the order',
      explanation: [
        'retain changes the Vec it is called on; it does not build a new one. The kept elements stay in their original order, and len shrinks by the number removed.',
        'retain itself returns the unit value (), so read the result from the Vec afterwards. It also works through a &mut Vec<i32>, which lets a helper function filter the caller’s Vec.',
      ],
      example: {
        language: 'rust',
        code: 'fn non_negative(n: &i32) -> bool {\n    *n >= 0\n}\n\nfn clean(values: &mut Vec<i32>) {\n    values.retain(non_negative);\n}\n\nfn main() {\n    let mut readings = vec![5, -1, 0, -7, 3];\n    clean(&mut readings);\n    println!("{:?} {}", readings, readings.len());\n}',
        output: '[5, 0, 3] 3',
        explanation:
          'clean removes -1 and -7 from the caller’s Vec through the mutable reference. 5, 0 and 3 stay in their original order.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn big(n: &i32) -> bool {\n    *n > 5\n}\n\nfn main() {\n    let mut v = vec![9, 1, 8, 2, 7];\n    v.retain(big);\n    println!("{:?} {}", v, v.len());\n}',
          ['[7, 8, 9] 3', '[9, 8, 7] 5', '[1, 2] 2', '[9, 8, 7] 3'],
          3,
          'retain keeps 9, 8 and 7 in the order they already had, and the length drops to 3.',
        ),
        predictOutput(
          'What is printed?',
          'fn short(n: &i32) -> bool {\n    *n < 4\n}\n\nfn main() {\n    let mut v = vec![3, 4, 1];\n    let result = v.retain(short);\n    println!("{:?} {:?}", result, v);\n}',
          ['[3, 1] [3, 1]', '() [3, 1]', '2 [3, 1]', '() [3, 4, 1]'],
          1,
          'retain returns (), the unit value. The filtering shows up in v itself.',
        ),
        predictOutput(
          'What does this program print?',
          'fn not_marker(n: &i32) -> bool {\n    *n != -1\n}\n\nfn drop_markers(values: &mut Vec<i32>) {\n    values.retain(not_marker);\n}\n\nfn main() {\n    let mut v = vec![-1, 6, -1, 2, 6];\n    drop_markers(&mut v);\n    println!("{:?}", v);\n}',
          ['[6, 2]', '[-1, 6, -1, 2, 6]', '[6, 2, 6]', '[2, 6, 6]'],
          2,
          'Both -1 values are removed from the caller’s Vec. Repeated values that pass, like the two 6s, all stay where they were.',
        ),
        choose(
          'v is vec![4, 1, 3]. What is true after v.retain(f), where f keeps values above 2?',
          [
            'v is now [4, 3]',
            'v is unchanged, and retain returned [4, 3]',
            'v is now [3, 4], because retain sorts',
            'v is now [1]',
          ],
          0,
          'retain removes 1 from v itself and leaves 4 and 3 in their original order.',
        ),
      ],
    },
    {
      title: 'Combine conditions in one predicate',
      explanation: [
        'A predicate can test several things with && and ||. With &&, an element survives only if every condition holds; with ||, one true condition is enough.',
        'Write the predicate to describe what to keep. To keep the values from 10 through 20, test *n >= 10 && *n <= 20.',
      ],
      example: {
        language: 'rust',
        code: 'fn is_digit(n: &i32) -> bool {\n    *n >= 0 && *n <= 9\n}\n\nfn main() {\n    let mut v = vec![12, 3, -1, 9, 10];\n    v.retain(is_digit);\n    v.push(0);\n    println!("{:?}", v);\n}',
        output: '[3, 9, 0]',
        explanation:
          'Only 3 and 9 satisfy both bounds. retain leaves the Vec ready for more changes, so push adds 0 at the end.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn in_range(n: &i32) -> bool {\n    *n > 1 && *n < 5\n}\n\nfn main() {\n    let mut v = vec![1, 2, 5, 4, 0];\n    v.retain(in_range);\n    println!("{:?}", v);\n}',
          ['[1, 2, 5, 4]', '[2, 4]', '[1, 5, 0]', '[2, 5, 4]'],
          1,
          'Both comparisons are strict, so 1 and 5 fail along with 0. Only 2 and 4 are kept.',
        ),
        predictOutput(
          'What is printed?',
          'fn extreme(n: &i32) -> bool {\n    *n < 0 || *n > 100\n}\n\nfn main() {\n    let mut v = vec![-5, 50, 150, 0];\n    v.retain(extreme);\n    println!("{:?} {}", v, v.len());\n}',
          ['[-5, 150] 2', '[50, 0] 2', '[-5, 0, 150] 3', '[150, -5] 2'],
          0,
          'With ||, either condition keeps an element: -5 is below 0 and 150 is above 100. They stay in their original order.',
        ),
        choose(
          'Which predicate keeps the values from 10 through 20, including 10 and 20 themselves?',
          [
            '*n > 10 && *n < 20',
            '*n >= 10 || *n <= 20',
            '*n < 10 || *n > 20',
            '*n >= 10 && *n <= 20',
          ],
          3,
          '&& requires both bounds, and >= and <= include the ends. With || every integer passes, and the < 10 || > 20 test keeps exactly the values outside.',
        ),
        predictOutput(
          'What does this program print?',
          'fn small_positive(n: &i32) -> bool {\n    *n > 0 && *n < 10\n}\n\nfn main() {\n    let mut v = vec![8, -3, 15, 2, 6];\n    v.retain(small_positive);\n    let last = v.pop();\n    println!("{:?} {:?}", last, v);\n}',
          [
            'Some(8) [2, 6]',
            'Some(6) [8, -3, 15, 2]',
            'Some(15) [8, 2, 6]',
            'Some(6) [8, 2]',
          ],
          3,
          'retain leaves [8, 2, 6]. pop then removes the last of those, 6.',
        ),
      ],
    },
  ],
  'rust-vec-extend': [
    {
      title: 'Append a range with extend',
      explanation: [
        'v.extend(items) appends every item that items produces, one after another, at the end of the Vec. A range such as 5..8 is an iterator, so v.extend(5..8) appends 5, 6 and 7 in that order.',
        'extend works like calling push once per item. The existing elements stay where they are, and len grows by the number of items appended.',
      ],
      example: {
        language: 'rust',
        code: 'fn main() {\n    let mut v = vec![1, 2];\n    v.extend(5..8);\n    println!("{:?} {}", v, v.len());\n}',
        output: '[1, 2, 5, 6, 7] 5',
        explanation:
          'The range 5..8 yields 5, 6 and 7, which are appended after 1 and 2. The Vec now has 5 elements.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn main() {\n    let mut v = vec![0];\n    v.extend(1..=3);\n    println!("{:?}", v);\n}',
          ['[0, 1, 2, 3]', '[0, 1, 2]', '[1, 2, 3, 0]', '[0, 3]'],
          0,
          '1..=3 includes 3, and extend appends each item after the existing 0.',
        ),
        predictOutput(
          'What is printed?',
          'fn main() {\n    let mut v = Vec::new();\n    v.push(9);\n    v.extend(3..5);\n    v.push(1);\n    println!("{:?}", v);\n}',
          ['[9, 3, 4, 5, 1]', '[9, 1, 3, 4]', '[9, 3, 4, 1]', '[1, 3, 4, 9]'],
          2,
          'Each call adds at the end in the order the calls run: 9, then 3 and 4, then 1.',
        ),
        predictOutput(
          'What does this program print?',
          'fn main() {\n    let mut v = vec![7];\n    v.extend(4..4);\n    println!("{:?} {}", v, v.len());\n}',
          ['[7, 4] 2', '[7] 1', '[7, 4, 4] 3', '[] 0'],
          1,
          'The range 4..4 stops before it starts, so it yields nothing and extend appends nothing.',
        ),
        choose(
          'You want to add 7, 8 and 9 to the end of v. Which call does that?',
          [
            'v.push(7..10)',
            'v.extend(7..9)',
            'v.extend(10..7)',
            'v.extend(7..10)',
          ],
          3,
          'extend appends each item of the range, and 7..10 stops just before 10. push takes one element, and 7..9 would miss 9.',
        ),
      ],
    },
    {
      title: 'Extend from a slice with iter().copied()',
      explanation: [
        'slice.iter() yields a reference to each element, an &i32 rather than an i32. Adding .copied() turns each &i32 into an i32, so v.extend(other.iter().copied()) appends copies of the elements. other is only borrowed and stays usable.',
        'For elements that are not Copy, such as String, use .cloned() instead; it clones each element. Calling copied on an iterator of &String does not compile.',
      ],
      example: {
        language: 'rust',
        code: 'fn main() {\n    let extra = [4, 5];\n    let mut v = vec![1];\n    v.extend(extra.iter().copied());\n    println!("{:?} {:?}", v, extra);\n}',
        output: '[1, 4, 5] [4, 5]',
        explanation:
          'Copies of 4 and 5 are appended after 1, in slice order. extra was only borrowed by iter, so it still holds [4, 5].',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn main() {\n    let data = [3, 6, 9, 12];\n    let mut v = vec![0];\n    v.extend(data[1..3].iter().copied());\n    println!("{:?}", v);\n}',
          ['[0, 3, 6]', '[0, 6, 9, 12]', '[0, 6, 9]', '[6, 9, 0]'],
          2,
          'data[1..3] is the slice [6, 9], and extend appends its elements after 0.',
        ),
        predictOutput(
          'What is printed?',
          'fn main() {\n    let more = [String::from("b"), String::from("c")];\n    let mut names = vec![String::from("a")];\n    names.extend(more.iter().cloned());\n    println!("{:?} {}", names, more.len());\n}',
          [
            '["a", "b", "c"] 0',
            '[a, b, c] 2',
            '["b", "c", "a"] 2',
            '["a", "b", "c"] 2',
          ],
          3,
          'cloned appends owned copies of "b" and "c". more keeps its two Strings because iter only borrowed them.',
        ),
        choose(
          'Why does this program fail to compile?',
          [
            'extend cannot take an iterator that comes from an array',
            'copied needs Copy elements, and String is not Copy; use cloned',
            'names must be declared without mut',
            'iter() moves the Strings out of more',
          ],
          1,
          'copied only works for Copy types such as i32. A String has to be duplicated with cloned.',
          'fn main() {\n    let more = [String::from("x")];\n    let mut names = vec![String::from("w")];\n    names.extend(more.iter().copied());\n    println!("{:?}", names);\n}',
        ),
        predictOutput(
          'What does this program print?',
          'fn joined(mut left: Vec<i32>, right: &[i32]) -> Vec<i32> {\n    left.extend(right.iter().copied());\n    left\n}\n\nfn main() {\n    let tail = [8, 2];\n    let first = joined(vec![5], &tail);\n    let second = joined(first, &tail);\n    println!("{:?}", second);\n}',
          ['[5, 8, 2]', '[5, 8, 2, 8, 2]', '[5, 8, 8, 2, 2]', '[8, 2, 5]'],
          1,
          'The first call appends 8 and 2 after 5. The second appends them again, in the same order, because tail was only borrowed.',
        ),
      ],
    },
    {
      title: 'extend runs a lazy iterator as it consumes it',
      explanation: [
        'extend accepts any iterator, including one built with map. Iterator adapters are lazy: creating base.iter().map(...) runs nothing. The closure runs once per item, in order, while extend pulls the items through.',
      ],
      example: {
        language: 'rust',
        code: 'fn main() {\n    let base = [1, 2];\n    let mut v = vec![0];\n    let doubled = base.iter().map(|n| {\n        println!("doubling {}", n);\n        n * 2\n    });\n    println!("ready");\n    v.extend(doubled);\n    println!("{:?}", v);\n}',
        output: 'ready\ndoubling 1\ndoubling 2\n[0, 2, 4]',
        explanation:
          'Building doubled prints nothing. Only when extend consumes it does the closure run, once for 1 and once for 2, and the results are appended after 0.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn main() {\n    let prices = [5, 8];\n    let mut v = vec![1];\n    v.extend(prices.iter().map(|p| p + 1));\n    println!("{:?}", v);\n}',
          ['[1, 5, 8]', '[6, 9]', '[1, 6, 9]', '[6, 9, 1]'],
          2,
          'map adds 1 to each price as extend consumes it, and the results go after the existing 1.',
        ),
        predictOutput(
          'In what order are the lines printed?',
          'fn main() {\n    let mut v = Vec::new();\n    let items = (1..3).map(|n| {\n        println!("make {}", n);\n        n\n    });\n    println!("start");\n    v.extend(items);\n    println!("{}", v.len());\n}',
          [
            'make 1\nmake 2\nstart\n2',
            'start\nmake 1\nmake 2\n2',
            'start\n2',
            'start\nmake 1\nmake 2\nmake 3\n3',
          ],
          1,
          'The closure does not run when items is created. extend consumes the range 1..3, running the closure for 1 and 2.',
        ),
        predictOutput(
          'What is printed?',
          'fn main() {\n    let offset = 100;\n    let mut v = vec![1, 2];\n    v.extend((1..=2).map(|n| n + offset));\n    v.push(3);\n    println!("{:?}", v);\n}',
          [
            '[1, 2, 101, 102, 3]',
            '[1, 2, 3, 101, 102]',
            '[101, 102, 1, 2, 3]',
            '[1, 2, 101, 3]',
          ],
          0,
          'extend appends 101 and 102 right away, so the later push puts 3 after them.',
        ),
        choose(
          'An iterator built with map is stored in a variable, and its closure prints a line per item. Nothing ever passes the iterator to extend or another consuming call. How many lines does the closure print?',
          [
            'One per item',
            'One, for the first item',
            'One per item, when main ends',
            'None',
          ],
          3,
          'Adapters are lazy. Without a consumer such as extend, the closure never runs.',
        ),
      ],
    },
  ],
  'rust-while-let': [
    {
      title: 'Repeat while the pattern matches',
      explanation: [
        'while let Some(x) = v.pop() { ... } evaluates v.pop() before every pass. While the result matches Some(x), x is bound to the value inside and the body runs; the first time the result is None, the loop ends.',
        'Popping in the condition empties a Vec from its last element to its first, and the loop stops on its own when nothing is left. No index or length check is needed.',
      ],
      example: {
        language: 'rust',
        code: 'fn main() {\n    let mut stack = vec![1, 2, 3];\n    while let Some(top) = stack.pop() {\n        println!("{}", top);\n    }\n    println!("left: {}", stack.len());\n}',
        output: '3\n2\n1\nleft: 0',
        explanation:
          'Each pass pops the current last element and prints it. The fourth pop returns None, which ends the loop with the Vec empty.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn main() {\n    let mut v = vec![4, 5, 6];\n    let mut total = 0;\n    while let Some(x) = v.pop() {\n        total += x;\n    }\n    println!("{} {}", total, v.len());\n}',
          ['15 0', '15 3', '6 2', '11 1'],
          0,
          'The loop pops all three values, adding each one, and stops once the Vec is empty.',
        ),
        predictOutput(
          'What is printed?',
          'fn main() {\n    let mut v = vec![10, 20];\n    let mut rounds = 0;\n    while let Some(_) = v.pop() {\n        rounds += 1;\n    }\n    println!("{}", rounds);\n}',
          ['3', '1', '30', '2'],
          3,
          'The body runs once per Some, so twice. The third pop returns None, which ends the loop without running the body.',
        ),
        predictOutput(
          'What does this program print?',
          'fn main() {\n    let mut v = vec![3];\n    while let Some(n) = v.pop() {\n        println!("{}", n);\n        if n > 1 {\n            v.push(n - 1);\n        }\n    }\n}',
          ['3', '1\n2\n3', '3\n2', '3\n2\n1'],
          3,
          'The condition is checked again before every pass. The body keeps pushing a smaller value until it reaches 1, which pushes nothing.',
        ),
        predictOutput(
          'What is printed?',
          'fn main() {\n    let mut v: Vec<i32> = Vec::new();\n    while let Some(x) = v.pop() {\n        println!("{}", x);\n    }\n    println!("done");\n}',
          ['None\ndone', '0\ndone', 'done', 'done\nNone'],
          2,
          'The first pop already returns None, so the body never runs.',
        ),
      ],
    },
    {
      title: 'The loop ends at the first value that does not match',
      explanation: [
        'The pattern can be more specific than Some(x). while let Some(0) = digits.pop() keeps going only while each popped value is 0, and stops at the first value that is not.',
        'The value that ends the loop has already been taken by pop. It is gone from the Vec, and because it matched nothing it is simply dropped.',
      ],
      example: {
        language: 'rust',
        code: 'fn main() {\n    let mut digits = vec![7, 0, 0];\n    let mut zeros = 0;\n    while let Some(0) = digits.pop() {\n        zeros += 1;\n    }\n    println!("{} {:?}", zeros, digits);\n}',
        output: '2 []',
        explanation:
          'The first two pops return Some(0) and match. The third returns Some(7), which does not match Some(0), so the loop stops, but 7 has already been removed.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn main() {\n    let mut digits = vec![0, 5, 0];\n    let mut zeros = 0;\n    while let Some(0) = digits.pop() {\n        zeros += 1;\n    }\n    println!("{} {:?}", zeros, digits);\n}',
          ['2 []', '1 [0, 5]', '1 [0]', '0 [0, 5, 0]'],
          2,
          'The last 0 matches. Then 5 is popped, fails the pattern and ends the loop, leaving only the first 0.',
        ),
        predictOutput(
          'What is printed?',
          'fn main() {\n    let mut tasks = vec![("wash", true), ("dry", false), ("fold", true)];\n    while let Some((name, true)) = tasks.pop() {\n        println!("{}", name);\n    }\n    println!("{}", tasks.len());\n}',
          ['fold\n1', 'fold\nwash\n0', 'fold\n2', 'wash\nfold\n1'],
          0,
          'fold is popped and matches. dry has false, so the loop stops after removing it, leaving only wash.',
        ),
        choose(
          'A while let loop stopped because pop returned Some(9), which did not match its pattern. Where is the 9 now?',
          [
            'Still at the end of the Vec',
            'Removed from the Vec and dropped',
            'Moved back to the front of the Vec',
            'Bound to the pattern’s variable after the loop',
          ],
          1,
          'pop ran before the pattern was checked, so the 9 left the Vec. Nothing kept it, so it was dropped.',
        ),
        predictOutput(
          'What does this program print?',
          'fn main() {\n    let mut v = vec![4, 12, 3, 8];\n    let mut count = 0;\n    while let Some(1..=9) = v.pop() {\n        count += 1;\n    }\n    println!("{} {}", count, v.len());\n}',
          ['2 1', '3 0', '2 2', '3 1'],
          0,
          '8 and 3 are in 1..=9. 12 is not, so the loop ends after removing it, and only 4 remains.',
        ),
      ],
    },
    {
      title: 'Drain one Vec into another',
      explanation: [
        'A common use of while let is moving every element out of one Vec into another. Popping from the source and pushing onto the output reverses the order, because pop takes the last element first.',
        'The body decides what to do with each value, so the same loop can filter or transform values while it empties the source.',
      ],
      example: {
        language: 'rust',
        code: 'fn evens_reversed(mut values: Vec<i32>) -> Vec<i32> {\n    let mut out = Vec::new();\n    while let Some(n) = values.pop() {\n        if n % 2 == 0 {\n            out.push(n);\n        }\n    }\n    out\n}\n\nfn main() {\n    println!("{:?}", evens_reversed(vec![1, 2, 3, 4, 6]));\n}',
        output: '[6, 4, 2]',
        explanation:
          'Values come off the end: 6, 4, 3, 2, 1. Only the even ones are pushed, so out holds them in reverse order.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn main() {\n    let mut source = vec![1, 2, 3];\n    let mut out = Vec::new();\n    while let Some(x) = source.pop() {\n        out.push(x * 10);\n    }\n    println!("{:?} {:?}", out, source);\n}',
          [
            '[10, 20, 30] []',
            '[30, 20, 10] []',
            '[30, 20, 10] [1, 2, 3]',
            '[30, 20] [1]',
          ],
          1,
          'pop takes 3 first, so the scaled values arrive in reverse order, and source ends up empty.',
        ),
        predictOutput(
          'What are the printed lines?',
          'fn main() {\n    let mut n = 472;\n    let mut digits = Vec::new();\n    while n > 0 {\n        digits.push(n % 10);\n        n = n / 10;\n    }\n    while let Some(d) = digits.pop() {\n        println!("{}", d);\n    }\n}',
          ['2\n7\n4', '472', '4\n7', '4\n7\n2'],
          3,
          'The first loop pushes the digits from the right: 2, 7, 4. Popping them back gives 4, 7, 2.',
        ),
        predictOutput(
          'What is printed?',
          'fn main() {\n    let mut a = vec![1, 2];\n    let mut b = vec![9];\n    while let Some(x) = a.pop() {\n        b.push(x);\n    }\n    println!("{:?} {:?}", a, b);\n}',
          ['[] [9, 1, 2]', '[1, 2] [9, 2, 1]', '[] [9, 2, 1]', '[] [2, 1, 9]'],
          2,
          '2 is popped first and pushed after 9, then 1. a is left empty.',
        ),
        choose(
          'Why does this loop never end?',
          [
            'last borrows the final element without removing it',
            'last returns None after the first pass',
            'while let checks its condition only once',
            'println! puts the element back into v',
          ],
          0,
          'The condition must make progress. last only borrows the final element, so v never shrinks; pop would remove it.',
          'fn main() {\n    let v = vec![1, 2];\n    while let Some(x) = v.last() {\n        println!("{}", x);\n    }\n}',
        ),
      ],
    },
  ],
  'rust-vecdeque': [
    {
      title: 'Serve values first in, first out',
      explanation: [
        'std::collections::VecDeque is a queue that adds and removes values cheaply at both ends. Create one with std::collections::VecDeque::new() in a let mut binding.',
        'push_back adds a value at the back, and pop_front removes the value at the front, returning Some(value), or None when the queue is empty. Together they give first-in, first-out order: values come out in the order they went in.',
      ],
      example: {
        language: 'rust',
        code: 'fn main() {\n    let mut line = std::collections::VecDeque::new();\n    line.push_back("ana");\n    line.push_back("ben");\n    line.push_back("cy");\n    println!("{:?}", line.pop_front());\n    println!("{:?}", line);\n}',
        output: 'Some("ana")\n["ben", "cy"]',
        explanation:
          'ana joined first, so pop_front serves her first. {:?} prints the rest of the queue from front to back.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn main() {\n    let mut q = std::collections::VecDeque::new();\n    q.push_back(1);\n    q.push_back(2);\n    q.push_back(3);\n    let first = q.pop_front();\n    println!("{:?} {:?}", first, q);\n}',
          ['Some(3) [1, 2]', 'Some(1) [2, 3]', 'Some(1) [1, 2, 3]', '1 [2, 3]'],
          1,
          'pop_front removes the oldest value, 1, and returns it wrapped in Some.',
        ),
        predictOutput(
          'What are the printed lines?',
          'fn main() {\n    let mut q = std::collections::VecDeque::new();\n    for n in 4..7 {\n        q.push_back(n);\n    }\n    while let Some(n) = q.pop_front() {\n        println!("{}", n);\n    }\n}',
          ['6\n5\n4', '4\n5\n6\n7', '4\n5\n6', '5\n6'],
          2,
          'Values leave from the front in the order they were pushed at the back. The range 4..7 stops before 7.',
        ),
        predictOutput(
          'What is printed?',
          'fn main() {\n    let mut q = std::collections::VecDeque::new();\n    q.push_back(8);\n    q.pop_front();\n    let again = q.pop_front();\n    println!("{:?} {}", again, q.len());\n}',
          ['Some(8) 0', 'Some(0) 0', 'None 1', 'None 0'],
          3,
          'The first pop_front removes 8. The queue is then empty, so the second returns None.',
        ),
        choose(
          'Customers must be served in the order they arrive. Which pair of VecDeque methods gives that order?',
          [
            'push_front to join, pop_front to serve',
            'push_back to join, pop_back to serve',
            'push_back to join, pop_front to serve',
            'push_back to join, front to serve',
          ],
          2,
          'Joining at the back and leaving from the front is first in, first out. Using the same end for both serves the newest arrival first, and front never removes anyone.',
        ),
      ],
    },
    {
      title: 'Work at both ends and look at the front',
      explanation: [
        'A VecDeque also has push_front, which adds at the front, and pop_back, which removes from the back.',
        'front() returns Some with a reference to the front value without removing it, and len() counts the values. {:?} prints the queue from front to back.',
      ],
      example: {
        language: 'rust',
        code: 'fn main() {\n    let mut q = std::collections::VecDeque::new();\n    q.push_back(2);\n    q.push_front(1);\n    q.push_back(3);\n    println!("{:?} {:?} {}", q, q.front(), q.len());\n    let newest = q.pop_back();\n    println!("{:?} {:?}", newest, q);\n}',
        output: '[1, 2, 3] Some(1) 3\nSome(3) [1, 2]',
        explanation:
          'push_front puts 1 ahead of 2, and push_back puts 3 behind it. front only looks at 1, while pop_back removes 3.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn main() {\n    let mut q = std::collections::VecDeque::new();\n    q.push_front(1);\n    q.push_front(2);\n    q.push_front(3);\n    println!("{:?}", q);\n}',
          ['[1, 2, 3]', '[3]', '[1, 3, 2]', '[3, 2, 1]'],
          3,
          'Each push_front goes ahead of everything already there, so the last value pushed ends up at the front.',
        ),
        predictOutput(
          'What is printed?',
          'fn main() {\n    let mut q = std::collections::VecDeque::new();\n    q.push_back(5);\n    q.push_back(9);\n    let peeked = q.front();\n    println!("{:?} {}", peeked, q.len());\n}',
          ['Some(9) 2', 'Some(5) 1', 'Some(5) 2', '5 2'],
          2,
          'front returns the oldest value, 5, without removing it, so both values are still in the queue.',
        ),
        predictOutput(
          'What does this program print?',
          'fn main() {\n    let mut q = std::collections::VecDeque::new();\n    q.push_back(1);\n    q.push_back(2);\n    q.push_back(3);\n    let a = q.pop_back();\n    let b = q.pop_front();\n    println!("{:?} {:?} {:?}", a, b, q);\n}',
          [
            'Some(3) Some(1) [2]',
            'Some(1) Some(3) [2]',
            'Some(3) Some(2) [1]',
            'Some(3) Some(1) []',
          ],
          0,
          'pop_back takes 3 from the back and pop_front takes 1 from the front, leaving 2.',
        ),
        choose(
          'You want to look at the oldest value in a queue without removing it. Which call do you use?',
          ['q.pop_front()', 'q.back()', 'q.pop_back()', 'q.front()'],
          3,
          'front reads the front value and leaves the queue unchanged. The pop methods remove a value, and back looks at the newest one.',
        ),
      ],
    },
    {
      title: 'Keep a sliding window of recent values',
      explanation: [
        'To remember only the newest k values, push each new value at the back and, whenever the length goes over k, pop the oldest value from the front. The queue then always holds the most recent k values in arrival order.',
      ],
      example: {
        language: 'rust',
        code: 'fn main() {\n    let readings = [7, 3, 9, 4, 6];\n    let mut window = std::collections::VecDeque::new();\n    for &r in &readings {\n        window.push_back(r);\n        if window.len() > 3 {\n            window.pop_front();\n        }\n    }\n    println!("{:?}", window);\n}',
        output: '[9, 4, 6]',
        explanation:
          'Once a fourth value arrives, the oldest is dropped from the front. After all five readings, the window holds the last three.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn main() {\n    let mut window = std::collections::VecDeque::new();\n    for &n in &[5, 1, 8, 2] {\n        window.push_back(n);\n        if window.len() > 2 {\n            window.pop_front();\n        }\n    }\n    println!("{:?}", window);\n}',
          ['[8, 2]', '[5, 1]', '[2, 8]', '[1, 8, 2]'],
          0,
          'Only the two newest values survive, and they keep their arrival order.',
        ),
        predictOutput(
          'What is printed?',
          'fn main() {\n    let mut window = std::collections::VecDeque::new();\n    for n in 1..6 {\n        window.push_back(n);\n        if window.len() >= 3 {\n            window.pop_front();\n        }\n    }\n    println!("{:?}", window);\n}',
          ['[3, 4, 5]', '[4, 5]', '[1, 2]', '[5]'],
          1,
          'The test >= 3 pops as soon as the window reaches 3, so it never keeps more than 2 values: the newest two are 4 and 5.',
        ),
        predictOutput(
          'What does this program print?',
          'fn newest_first(values: &[i32], k: usize) -> Vec<i32> {\n    let mut window = std::collections::VecDeque::new();\n    for &value in values {\n        window.push_back(value);\n        if window.len() > k {\n            window.pop_front();\n        }\n    }\n    let mut out = Vec::new();\n    while let Some(value) = window.pop_back() {\n        out.push(value);\n    }\n    out\n}\n\nfn main() {\n    println!("{:?}", newest_first(&[2, 4, 6, 8], 3));\n}',
          ['[4, 6, 8]', '[8, 6, 4]', '[8, 6, 4, 2]', '[6, 4, 2]'],
          1,
          'The window keeps 4, 6 and 8. Draining it with pop_back takes them newest first.',
        ),
        choose(
          'A window must hold at most k values. Right after window.push_back(value), which check keeps it at that size?',
          [
            'if window.len() > k { window.pop_back(); }',
            'if window.len() >= k { window.pop_front(); }',
            'if window.len() > k { window.push_front(value); }',
            'if window.len() > k { window.pop_front(); }',
          ],
          3,
          'Removing from the front drops the oldest value. pop_back would throw away the value just added, and >= keeps only k - 1 values.',
        ),
      ],
    },
  ],
  'rust-map-lookup': [
    {
      title: 'Store pairs with insert and find them with get',
      explanation: [
        'A HashMap stores values under keys. Create one with std::collections::HashMap::new() in a let mut binding, then call insert(key, value) for each pair; Rust infers the key and value types from the inserts.',
        'map.get(&key) returns Option<&V>: Some with a reference to the stored value, or None when the key is absent. With &str keys you pass the text itself, as in map.get("ana"). contains_key answers just yes or no. A HashMap has no fixed order, so look values up by key rather than printing the whole map.',
      ],
      example: {
        language: 'rust',
        code: 'fn main() {\n    let mut ages = std::collections::HashMap::new();\n    ages.insert("ana", 31);\n    ages.insert("ben", 27);\n    println!("{:?} {:?}", ages.get("ana"), ages.get("cy"));\n    println!("{} {}", ages.contains_key("ben"), ages.len());\n}',
        output: 'Some(31) None\ntrue 2',
        explanation:
          'ana is a key, so get returns Some with her value. cy was never inserted, so get returns None. The map holds 2 keys, including ben.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn main() {\n    let mut rooms = std::collections::HashMap::new();\n    rooms.insert(101, "lab");\n    rooms.insert(204, "office");\n    println!("{:?} {:?}", rooms.get(&204), rooms.get(&102));\n}',
          [
            'Some(office) None',
            'Some("office") None',
            'Some("lab") None',
            'Some("office") Some("lab")',
          ],
          1,
          'Key 204 maps to "office", which Debug prints with quotes. 102 was never inserted.',
        ),
        predictOutput(
          'What is printed?',
          'fn main() {\n    let pairs = [("x", 3), ("y", 7), ("z", 1)];\n    let mut map = std::collections::HashMap::new();\n    for &(key, value) in &pairs {\n        map.insert(key, value);\n    }\n    println!("{:?} {} {}", map.get("y"), map.contains_key("w"), map.len());\n}',
          ['Some(7) false 3', 'Some(1) false 3', 'Some(7) true 3', '7 false 3'],
          0,
          'y was inserted with 7, w never was, and the loop inserted 3 distinct keys.',
        ),
        choose(
          'scores is a HashMap<&str, i32>. What type does scores.get("kim") return?',
          ['i32', 'Option<i32>', '&i32', 'Option<&i32>'],
          3,
          'get lends the stored value: Some(&value) when the key exists and None otherwise.',
        ),
        choose(
          'Why should a program with a fixed expected output avoid printing a whole HashMap with {:?}?',
          [
            'The map always prints its pairs sorted by key',
            'The map always prints its pairs in insertion order',
            'The pairs may print in a different order from run to run',
            'A HashMap cannot be printed with {:?}',
          ],
          2,
          'A HashMap’s order is unspecified and can change between runs, so look values up with get instead.',
        ),
      ],
    },
    {
      title: 'Tell a missing key from a stored zero',
      explanation: [
        'A key that is absent and a key whose value is 0 are different facts, and get keeps them apart: an absent key gives None, while a stored 0 gives Some(0).',
        'Chain .copied() to turn the Option<&i32> into an Option<i32> the caller owns, and return that Option instead of collapsing None into 0. For String values, use .cloned().',
      ],
      example: {
        language: 'rust',
        code: 'fn stock_of(items: &[(&str, i32)], name: &str) -> Option<i32> {\n    let mut stock = std::collections::HashMap::new();\n    for &(item, count) in items {\n        stock.insert(item, count);\n    }\n    stock.get(name).copied()\n}\n\nfn main() {\n    let items = [("pens", 0), ("pads", 4)];\n    println!("{:?} {:?}", stock_of(&items, "pens"), stock_of(&items, "ink"));\n}',
        output: 'Some(0) None',
        explanation:
          'pens is stocked with 0, so the lookup gives Some(0). ink was never listed, so it gives None.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn main() {\n    let mut fines = std::collections::HashMap::new();\n    fines.insert("lee", 0);\n    fines.insert("max", 15);\n    let a = fines.get("lee").copied();\n    let b = fines.get("sam").copied();\n    println!("{:?} {:?}", a, b);\n}',
          ['None None', 'Some(0) Some(0)', 'Some(0) None', '0 None'],
          2,
          'lee is stored with 0, which is still Some(0). sam is not a key, so the lookup is None.',
        ),
        predictOutput(
          'What is printed?',
          'fn describe(found: Option<i32>) {\n    match found {\n        Some(0) => println!("zero"),\n        Some(n) => println!("{}", n),\n        None => println!("missing"),\n    }\n}\n\nfn main() {\n    let mut votes = std::collections::HashMap::new();\n    votes.insert(1, 0);\n    votes.insert(2, 5);\n    describe(votes.get(&1).copied());\n    describe(votes.get(&3).copied());\n}',
          ['missing\nmissing', 'zero\nmissing', 'zero\nzero', '0\nmissing'],
          1,
          'Key 1 holds 0, which matches Some(0). Key 3 is absent, which matches None.',
        ),
        choose(
          'A lookup function must let callers tell a key that was never stored from one stored with the value 0. Which return type works?',
          [
            'i32, returning 0 when the key is missing',
            'bool, true when the value is nonzero',
            'Option<i32>',
            'usize, the number of matching keys',
          ],
          2,
          'Option<i32> gives None for a missing key and Some(0) for a stored zero. The other types merge the two cases.',
        ),
        predictOutput(
          'What does this program print?',
          'fn main() {\n    let mut nick = std::collections::HashMap::new();\n    nick.insert("robert", String::from("bob"));\n    let found: Option<String> = nick.get("robert").cloned();\n    let missing: Option<String> = nick.get("alice").cloned();\n    println!("{:?} {:?}", found, missing);\n}',
          [
            'Some(bob) None',
            'Some("bob") Some("")',
            'Some("robert") None',
            'Some("bob") None',
          ],
          3,
          'cloned makes an owned copy of the stored String, which Debug prints with quotes. The missing key stays None.',
        ),
      ],
    },
    {
      title: 'insert replaces the value of an existing key',
      explanation: [
        'A HashMap holds one value per key. Inserting a key that is already present replaces its old value, and len does not grow.',
        'insert returns the value it replaced: None for a new key, Some(old) for a key that was already there.',
      ],
      example: {
        language: 'rust',
        code: 'fn main() {\n    let mut stock = std::collections::HashMap::new();\n    println!("{:?}", stock.insert("pen", 3));\n    println!("{:?}", stock.insert("pen", 7));\n    println!("{:?} {}", stock.get("pen"), stock.len());\n}',
        output: 'None\nSome(3)\nSome(7) 1',
        explanation:
          'The first insert adds a new key and returns None. The second replaces 3 with 7 and returns the old 3. The map still has one key.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn main() {\n    let entries = [("a", 1), ("b", 2), ("a", 5)];\n    let mut map = std::collections::HashMap::new();\n    for &(key, value) in &entries {\n        map.insert(key, value);\n    }\n    println!("{:?} {}", map.get("a"), map.len());\n}',
          ['Some(1) 2', 'Some(5) 3', 'Some(6) 2', 'Some(5) 2'],
          3,
          'The second insert for "a" replaces 1 with 5. Only two distinct keys exist.',
        ),
        predictOutput(
          'What is printed?',
          'fn main() {\n    let mut seats = std::collections::HashMap::new();\n    let first = seats.insert(12, "kai");\n    let second = seats.insert(14, "mo");\n    let third = seats.insert(12, "zoe");\n    println!("{:?} {:?} {:?}", first, second, third);\n}',
          [
            'None None Some("zoe")',
            'None None Some("kai")',
            'Some("kai") Some("mo") Some("zoe")',
            'None None None',
          ],
          1,
          'Seats 12 and 14 are new at first, so those inserts return None. The third replaces "kai" and returns it.',
        ),
        choose(
          'A loop inserts every pair from [("k", 4), ("k", 9)] into an empty HashMap. What does the map hold afterwards?',
          [
            'Both 4 and 9 under "k", and len is 2',
            'Only 4 under "k", because the second insert is ignored',
            'Only 9 under "k", and len is 1',
            'Nothing, because inserting a duplicate key panics',
          ],
          2,
          'Each key holds one value, and a later insert replaces an earlier one.',
        ),
        predictOutput(
          'What does this program print?',
          'fn main() {\n    let mut best = std::collections::HashMap::new();\n    best.insert("jump", 4);\n    match best.insert("jump", 6) {\n        Some(old) => println!("replaced {}", old),\n        None => println!("new"),\n    }\n    println!("{:?}", best.get("jump"));\n}',
          [
            'replaced 4\nSome(6)',
            'new\nSome(6)',
            'replaced 6\nSome(6)',
            'replaced 4\nSome(4)',
          ],
          0,
          'jump already held 4, so insert returns Some(4) and stores 6 in its place.',
        ),
      ],
    },
  ],
  'rust-map-entry': [
    {
      title: 'Insert a default only when the key is missing',
      explanation: [
        'map.entry(key).or_insert(default) finds the slot for key. If the key is absent, it first stores default there; if the key is present, it leaves the existing value alone and the default is not used.',
        'Either way, or_insert returns a mutable reference, &mut V, to the value now in the map. Dereference it with * to change the value in place: *map.entry(key).or_insert(0) += 1.',
      ],
      example: {
        language: 'rust',
        code: 'fn main() {\n    let mut stock = std::collections::HashMap::new();\n    stock.insert("apple", 5);\n    *stock.entry("apple").or_insert(0) += 2;\n    *stock.entry("pear").or_insert(10) += 1;\n    println!("{:?} {:?}", stock.get("apple"), stock.get("pear"));\n}',
        output: 'Some(7) Some(11)',
        explanation:
          'apple already holds 5, so its default is ignored and 2 is added. pear is missing, so 10 is stored first and then 1 is added.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn main() {\n    let mut m = std::collections::HashMap::new();\n    m.insert("x", 4);\n    *m.entry("x").or_insert(100) += 1;\n    println!("{:?}", m.get("x"));\n}',
          ['Some(101)', 'Some(5)', 'Some(100)', 'Some(4)'],
          1,
          'x is already present, so or_insert ignores 100 and returns the existing 4, which becomes 5.',
        ),
        predictOutput(
          'What is printed?',
          'fn main() {\n    let mut m = std::collections::HashMap::new();\n    m.entry("y").or_insert(3);\n    m.entry("y").or_insert(8);\n    println!("{:?} {}", m.get("y"), m.len());\n}',
          ['Some(3) 1', 'Some(8) 1', 'Some(11) 1', 'Some(3) 2'],
          0,
          'The first call stores 3. The second finds y present, so 8 is never stored.',
        ),
        choose(
          'Why does this program fail to compile?',
          [
            'entry needs a String key, not a &str',
            'or_insert returns &mut i32, so += needs a * in front',
            'or_insert must be called before entry',
            'A HashMap value cannot change after it is inserted',
          ],
          1,
          '+= cannot add to the reference itself; *counts.entry("a").or_insert(0) += 1 changes the value it points to.',
          'fn main() {\n    let mut counts = std::collections::HashMap::new();\n    counts.entry("a").or_insert(0) += 1;\n    println!("{:?}", counts.get("a"));\n}',
        ),
        predictOutput(
          'What does this program print?',
          'fn main() {\n    let mut m = std::collections::HashMap::new();\n    let slot = m.entry(7).or_insert(1);\n    *slot *= 5;\n    println!("{:?} {:?}", m.get(&7), m.get(&5));\n}',
          ['Some(1) None', 'Some(7) None', 'Some(5) Some(1)', 'Some(5) None'],
          3,
          'Key 7 is created with 1, and slot points at that value, so it becomes 5. Key 5 was never inserted.',
        ),
      ],
    },
    {
      title: 'Count occurrences in one pass',
      explanation: [
        'To count how often each value appears, run *counts.entry(value).or_insert(0) += 1 for every value. The first time a value is seen its count is created as 0 and raised to 1; later sightings just add 1.',
        'The same pattern sums amounts per key: add the amount instead of 1. Read the results back with get, since a HashMap’s order is unspecified.',
      ],
      example: {
        language: 'rust',
        code: 'fn main() {\n    let words = ["red", "blue", "red", "red"];\n    let mut counts = std::collections::HashMap::new();\n    for &w in &words {\n        *counts.entry(w).or_insert(0) += 1;\n    }\n    println!("{:?} {:?} {:?}", counts.get("red"), counts.get("blue"), counts.get("green"));\n}',
        output: 'Some(3) Some(1) None',
        explanation:
          'red is counted three times and blue once. green never appeared, so it has no entry at all.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn main() {\n    let rolls = [3, 1, 3, 3, 6];\n    let mut counts = std::collections::HashMap::new();\n    for &r in &rolls {\n        *counts.entry(r).or_insert(0) += 1;\n    }\n    println!("{:?} {:?} {}", counts.get(&3), counts.get(&2), counts.len());\n}',
          [
            'Some(3) None 3',
            'Some(3) Some(0) 3',
            'Some(2) None 5',
            'Some(3) None 5',
          ],
          0,
          '3 appears three times and 2 never does. len counts distinct keys: 3, 1 and 6.',
        ),
        predictOutput(
          'What is printed?',
          'fn main() {\n    let sales = [("tea", 4), ("cake", 3), ("tea", 6)];\n    let mut totals = std::collections::HashMap::new();\n    for &(item, amount) in &sales {\n        *totals.entry(item).or_insert(0) += amount;\n    }\n    println!("{:?} {:?}", totals.get("tea"), totals.get("cake"));\n}',
          [
            'Some(10) Some(3)',
            'Some(6) Some(3)',
            'Some(2) Some(1)',
            'Some(4) Some(3)',
          ],
          0,
          'Each sale adds its amount to the total for its item, so tea collects 4 + 6.',
        ),
        choose(
          'Which line inside the loop counts how many times n appears?',
          [
            'counts.insert(n, 1);',
            '*counts.entry(n).or_insert(0) += 1;',
            'counts.entry(n).or_insert(1);',
            '*counts.entry(n).or_insert(1) += 1;',
          ],
          1,
          'insert resets the count to 1 each time, or_insert(1) alone never increments, and starting at 1 before adding 1 counts the first sighting twice.',
        ),
        predictOutput(
          'What does this program print?',
          'fn tally(values: &[i32]) -> std::collections::HashMap<i32, usize> {\n    let mut counts = std::collections::HashMap::new();\n    for &n in values {\n        *counts.entry(n).or_insert(0) += 1;\n    }\n    counts\n}\n\nfn main() {\n    let t = tally(&[5, 5, -5]);\n    println!("{:?} {:?} {}", t.get(&5), t.get(&-5), tally(&[]).len());\n}',
          [
            'Some(3) None 0',
            'Some(2) None 0',
            'Some(2) Some(1) 1',
            'Some(2) Some(1) 0',
          ],
          3,
          '5 and -5 are different keys with counts 2 and 1. An empty slice creates no entries.',
        ),
      ],
    },
    {
      title: 'Read and update through the entry reference',
      explanation: [
        'The reference from or_insert can be read as well as written. To keep the highest score per player, insert the first score as the default, then replace the stored value only when a later score is larger.',
        'Choose the default with care: it is the starting value for every new key, and later comparisons are made against it.',
      ],
      example: {
        language: 'rust',
        code: 'fn main() {\n    let rounds = [("ivy", 7), ("max", 4), ("ivy", 12), ("ivy", 9)];\n    let mut best = std::collections::HashMap::new();\n    for &(name, score) in &rounds {\n        let slot = best.entry(name).or_insert(score);\n        if score > *slot {\n            *slot = score;\n        }\n    }\n    println!("{:?} {:?}", best.get("ivy"), best.get("max"));\n}',
        output: 'Some(12) Some(4)',
        explanation:
          'ivy starts at 7, rises to 12, and keeps 12 when 9 arrives. max has only one round, so the 4 stored as its default stays.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn main() {\n    let times = [("a", 30), ("b", 25), ("a", 22), ("a", 28)];\n    let mut fastest = std::collections::HashMap::new();\n    for &(runner, t) in &times {\n        let slot = fastest.entry(runner).or_insert(t);\n        if t < *slot {\n            *slot = t;\n        }\n    }\n    println!("{:?} {:?}", fastest.get("a"), fastest.get("b"));\n}',
          [
            'Some(28) Some(25)',
            'Some(22) Some(25)',
            'Some(30) Some(25)',
            'Some(22) None',
          ],
          1,
          'a starts at 30, drops to 22, and 28 does not beat 22. b keeps its only time.',
        ),
        predictOutput(
          'What is printed?',
          'fn votes_for(ballots: &[&str], name: &str) -> Option<i32> {\n    let mut tally = std::collections::HashMap::new();\n    for &b in ballots {\n        *tally.entry(b).or_insert(0) += 1;\n    }\n    tally.get(name).copied()\n}\n\nfn main() {\n    let ballots = ["kim", "lou", "kim"];\n    println!("{:?} {:?}", votes_for(&ballots, "lou"), votes_for(&ballots, "ray"));\n}',
          ['Some(1) Some(0)', 'Some(2) None', 'Some(1) None', 'None None'],
          2,
          'lou got one vote. ray got none, so entry never created a key for ray and get returns None.',
        ),
        predictOutput(
          'What does this program print?',
          'fn main() {\n    let mut level = std::collections::HashMap::new();\n    for &k in &["a", "b", "a"] {\n        *level.entry(k).or_insert(1) *= 2;\n    }\n    println!("{:?} {:?}", level.get("a"), level.get("b"));\n}',
          [
            'Some(4) Some(2)',
            'Some(2) Some(2)',
            'Some(3) Some(2)',
            'Some(4) Some(1)',
          ],
          0,
          'Each new key starts at 1 and is doubled on every sighting: a twice gives 4, b once gives 2.',
        ),
        choose(
          'This program prints Some(0), although zed never scored 0. Why?',
          [
            'entry skips negative values',
            'The comparison should use < instead of >',
            'or_insert(0) starts at 0, which no negative score beats',
            'get returns 0 for keys it cannot find',
          ],
          2,
          'The default becomes the starting best. Using or_insert(score) would start from zed’s first real score.',
          'fn main() {\n    let rounds = [("zed", -4), ("zed", -9)];\n    let mut best = std::collections::HashMap::new();\n    for &(name, score) in &rounds {\n        let slot = best.entry(name).or_insert(0);\n        if score > *slot {\n            *slot = score;\n        }\n    }\n    println!("{:?}", best.get("zed"));\n}',
        ),
      ],
    },
  ],
  'rust-hash-set': [
    {
      title: 'A set keeps one copy of each value',
      explanation: [
        'A HashSet stores values without duplicates. Create one with std::collections::HashSet::new() in a let mut binding and add values with insert. Inserting a value the set already holds changes nothing.',
        'len() therefore counts distinct values. A HashSet has no reliable order, so ask it questions such as len instead of printing it.',
      ],
      example: {
        language: 'rust',
        code: 'fn main() {\n    let mut seen = std::collections::HashSet::new();\n    for &n in &[4, 9, 4, 4, 2] {\n        seen.insert(n);\n    }\n    println!("{}", seen.len());\n}',
        output: '3',
        explanation:
          'Five values are inserted, but 4 is stored only once. The set holds 4, 9 and 2.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn distinct(values: &[i32]) -> usize {\n    let mut seen = std::collections::HashSet::new();\n    for &v in values {\n        seen.insert(v);\n    }\n    seen.len()\n}\n\nfn main() {\n    println!("{} {}", distinct(&[7, 7, 7]), distinct(&[1, 2, 1, 3]));\n}',
          ['3 4', '1 3', '1 2', '0 2'],
          1,
          'Three 7s collapse into one value. 1, 2 and 3 are the distinct values of the second slice.',
        ),
        predictOutput(
          'What is printed?',
          'fn main() {\n    let mut tags = std::collections::HashSet::new();\n    for &t in &["Rust", "rust", "RUST", "rust"] {\n        tags.insert(t);\n    }\n    println!("{}", tags.len());\n}',
          ['1', '4', '3', '2'],
          2,
          'Strings are equal only if they match exactly, including case, so only the repeated "rust" is a duplicate.',
        ),
        predictOutput(
          'What does this program print?',
          'fn main() {\n    let mut edges = std::collections::HashSet::new();\n    edges.insert((1, 2));\n    edges.insert((2, 1));\n    edges.insert((1, 2));\n    println!("{}", edges.len());\n}',
          ['1', '3', '0', '2'],
          3,
          '(1, 2) and (2, 1) are different tuples. Only the second (1, 2) is a duplicate.',
        ),
        choose(
          'A test prints a HashSet built from 1, 2 and 3 with {:?}. What can it rely on?',
          [
            'It prints {1, 2, 3} every time',
            'It prints [1, 2, 3] every time',
            'It prints the values in sorted order',
            'It prints all three, in no fixed order',
          ],
          3,
          'A HashSet’s order is unspecified, so a test should check len or membership instead.',
        ),
      ],
    },
    {
      title: 'insert reports whether a value was new',
      explanation: [
        'insert returns a bool: true when the value was added, false when an equal value was already present. One call both records the value and answers whether it had been seen before.',
        'contains checks membership without changing the set. Pass a reference: for a HashSet<i32>, write seen.contains(&4). For a set of &str, pass the text itself, as in seen.contains("ox").',
      ],
      example: {
        language: 'rust',
        code: 'fn main() {\n    let mut seen = std::collections::HashSet::new();\n    println!("{}", seen.insert("ox"));\n    println!("{}", seen.insert("ox"));\n    println!("{} {}", seen.contains("ox"), seen.contains("yak"));\n}',
        output: 'true\nfalse\ntrue false',
        explanation:
          'The first insert adds ox and returns true. The second finds it already there and returns false. contains then confirms ox is present and yak is not.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn main() {\n    let mut s = std::collections::HashSet::new();\n    let a = s.insert(5);\n    let b = s.insert(6);\n    let c = s.insert(5);\n    println!("{} {} {} {}", a, b, c, s.len());\n}',
          [
            'true true true 3',
            'true true false 2',
            'false false true 2',
            'true true false 3',
          ],
          1,
          '5 and 6 are new, so their inserts return true. The second 5 returns false and adds nothing.',
        ),
        predictOutput(
          'What is printed?',
          'fn main() {\n    let mut s = std::collections::HashSet::new();\n    for &n in &[2, 4, 6] {\n        s.insert(n);\n    }\n    println!("{} {}", s.contains(&4), s.contains(&5));\n    println!("{}", s.contains(&2) && !s.contains(&8));\n}',
          [
            'true false\ntrue',
            'true false\nfalse',
            'false false\ntrue',
            'true true\ntrue',
          ],
          0,
          '4 is in the set and 5 is not. 2 is present and 8 is absent, so the && expression is true.',
        ),
        choose(
          'seen is a HashSet<i32>. Which expression checks whether it holds 4 without changing it?',
          [
            'seen.contains(4)',
            'seen.insert(4)',
            'seen[4]',
            'seen.contains(&4)',
          ],
          3,
          'contains takes a reference to the value. insert would add 4 when it is missing, changing the set.',
        ),
        predictOutput(
          'What are the printed lines?',
          'fn main() {\n    let mut seen = std::collections::HashSet::new();\n    for &c in &["a", "b", "a", "c", "b"] {\n        println!("{}", seen.insert(c));\n    }\n}',
          [
            'true\ntrue\ntrue\ntrue\ntrue',
            'false\nfalse\ntrue\nfalse\ntrue',
            'true\ntrue\nfalse\ntrue\nfalse',
            'true\ntrue\nfalse\ntrue\ntrue',
          ],
          2,
          'Each first sighting returns true. The repeated a and the repeated b return false.',
        ),
      ],
    },
    {
      title: 'Compare lengths to find duplicates',
      explanation: [
        'After every value of a slice has been inserted, the set’s len is the number of distinct values. If it equals the slice’s len, no value repeated. The difference between the two lengths is how many extra copies there were.',
        'This answer does not depend on the set’s order, so it is the same on every run.',
      ],
      example: {
        language: 'rust',
        code: 'fn all_distinct(values: &[i32]) -> bool {\n    let mut seen = std::collections::HashSet::new();\n    for &v in values {\n        seen.insert(v);\n    }\n    seen.len() == values.len()\n}\n\nfn main() {\n    println!("{} {}", all_distinct(&[3, 1, 2]), all_distinct(&[3, 1, 3]));\n}',
        output: 'true false',
        explanation:
          'The first slice keeps all 3 values in the set. In the second, 3 repeats, so the set holds 2 values against a slice of 3.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn extra_copies(values: &[i32]) -> usize {\n    let mut seen = std::collections::HashSet::new();\n    for &v in values {\n        seen.insert(v);\n    }\n    values.len() - seen.len()\n}\n\nfn main() {\n    println!("{}", extra_copies(&[5, 5, 5, 2]));\n}',
          ['3', '1', '2', '4'],
          2,
          'The slice has 4 values and the set has 2 (5 and 2), so there are 2 extra copies.',
        ),
        predictOutput(
          'What is printed?',
          'fn all_distinct(values: &[&str]) -> bool {\n    let mut seen = std::collections::HashSet::new();\n    for &v in values {\n        seen.insert(v);\n    }\n    seen.len() == values.len()\n}\n\nfn main() {\n    println!("{} {}", all_distinct(&[]), all_distinct(&["a", "A"]));\n}',
          ['false true', 'true false', 'true true', 'false false'],
          2,
          'An empty slice and an empty set both have length 0. "a" and "A" are different strings, so nothing repeats.',
        ),
        predictOutput(
          'What does this program print?',
          'fn main() {\n    let mut seen = std::collections::HashSet::new();\n    let mut fresh = true;\n    for &n in &[8, 3, 8] {\n        fresh = seen.insert(n);\n    }\n    println!("{} {}", fresh, seen.len());\n}',
          ['true 3', 'false 2', 'true 2', 'false 3'],
          1,
          'fresh holds only the result of the last insert, the repeated 8, which is false. The set holds 8 and 3.',
        ),
        choose(
          'Every element of values has been inserted into the HashSet seen. Which statement is always true?',
          [
            'seen.len() <= values.len()',
            'seen.len() == values.len()',
            'seen.len() >= values.len()',
            'seen.len() < values.len()',
          ],
          0,
          'Duplicates are stored once, so the set can be smaller than the slice but never larger. It is equal only when nothing repeats.',
        ),
      ],
    },
  ],
  'rust-btree-range': [
    {
      title: 'A BTreeMap keeps its keys in order',
      explanation: [
        'std::collections::BTreeMap is built and queried like a HashMap, with insert, get and len, but it always keeps its keys sorted. Printing it with {:?}, or looping with for (key, value) in &map, visits keys from smallest to largest, whatever order they were inserted in.',
        'Because that order is fixed, a BTreeMap is the map to use when results must come out in key order.',
      ],
      example: {
        language: 'rust',
        code: 'fn main() {\n    let mut days = std::collections::BTreeMap::new();\n    days.insert(30, "c");\n    days.insert(10, "a");\n    days.insert(20, "b");\n    println!("{:?}", days);\n    for (day, label) in &days {\n        println!("{} {}", day, label);\n    }\n}',
        output: '{10: "a", 20: "b", 30: "c"}\n10 a\n20 b\n30 c',
        explanation:
          'The keys were inserted as 30, 10, 20, but the map prints and loops over them in ascending order.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn main() {\n    let mut pets = std::collections::BTreeMap::new();\n    pets.insert("cat", 3);\n    pets.insert("ant", 2);\n    pets.insert("bee", 1);\n    println!("{:?}", pets);\n}',
          [
            '{"cat": 3, "ant": 2, "bee": 1}',
            '{"bee": 1, "ant": 2, "cat": 3}',
            '{"ant": 2, "bee": 1, "cat": 3}',
            '{ant: 2, bee: 1, cat: 3}',
          ],
          2,
          'A BTreeMap is ordered by key, and text keys sort alphabetically. Debug keeps the quotes.',
        ),
        predictOutput(
          'What are the printed lines?',
          'fn main() {\n    let mut m = std::collections::BTreeMap::new();\n    for &k in &[5, -2, 9, 0] {\n        m.insert(k, k * k);\n    }\n    for (k, v) in &m {\n        println!("{} {}", k, v);\n    }\n}',
          [
            '5 25\n-2 4\n9 81\n0 0',
            '-2 4\n0 0\n5 25\n9 81',
            '0 0\n-2 4\n5 25\n9 81',
            '9 81\n5 25\n0 0\n-2 4',
          ],
          1,
          'Keys are visited in ascending numeric order, and -2 is smaller than 0.',
        ),
        predictOutput(
          'What is printed?',
          'fn main() {\n    let mut m = std::collections::BTreeMap::new();\n    m.insert(2, "b");\n    m.insert(1, "a");\n    m.insert(2, "z");\n    println!("{:?} {}", m, m.len());\n}',
          [
            '{1: "a", 2: "z"} 2',
            '{2: "b", 1: "a", 2: "z"} 3',
            '{1: "a", 2: "b"} 2',
            '{2: "z", 1: "a"} 2',
          ],
          0,
          'Inserting key 2 again replaces "b" with "z", and the two keys print in ascending order.',
        ),
        choose(
          'A report must list totals in key order on every run. Why pick a BTreeMap over a HashMap?',
          [
            'A BTreeMap keeps keys in insertion order',
            'A BTreeMap iterates in sorted key order',
            'A BTreeMap lookup never returns None',
            'A HashMap cannot store integer keys',
          ],
          1,
          'Sorted iteration is what BTreeMap guarantees. Insertion order is not kept by either map.',
        ),
      ],
    },
    {
      title: 'Visit only the keys inside a range',
      explanation: [
        'map.range(low..high) visits only the entries whose keys fall in that range, in key order, as (key, value) pairs. The usual range rules apply: low..high leaves out high, while low..=high includes it. Leaving out the end, as in low.., runs up to the largest key.',
        'The bounds do not have to be keys in the map; range simply starts at the first key at or above low.',
      ],
      example: {
        language: 'rust',
        code: 'fn main() {\n    let mut temps = std::collections::BTreeMap::new();\n    for &(hour, t) in &[(6, 11), (9, 15), (12, 21), (15, 19)] {\n        temps.insert(hour, t);\n    }\n    for (hour, t) in temps.range(9..15) {\n        println!("{} {}", hour, t);\n    }\n    let mut total = 0;\n    for (_, t) in temps.range(9..=15) {\n        total += t;\n    }\n    println!("{}", total);\n}',
        output: '9 15\n12 21\n55',
        explanation:
          '9..15 visits hours 9 and 12 but not 15. 9..=15 also includes 15, so the total is 15 + 21 + 19.',
      },
      questions: [
        predictOutput(
          'What are the printed lines?',
          'fn main() {\n    let mut m = std::collections::BTreeMap::new();\n    for &k in &[1, 3, 5, 6, 8] {\n        m.insert(k, 0);\n    }\n    for (k, _) in m.range(3..6) {\n        println!("{}", k);\n    }\n}',
          ['3\n5', '3\n5\n6', '5', '3\n4\n5'],
          0,
          '3..6 includes 3 and stops before 6. range only visits keys that exist, so there is no 4.',
        ),
        predictOutput(
          'What does this program print?',
          'fn main() {\n    let mut m = std::collections::BTreeMap::new();\n    m.insert(2, 10);\n    m.insert(5, 20);\n    m.insert(9, 30);\n    let mut total = 0;\n    for (_, v) in m.range(4..=9) {\n        total += v;\n    }\n    println!("{}", total);\n}',
          ['50', '20', '60', '30'],
          0,
          'Keys 5 and 9 fall in 4..=9, so their values 20 and 30 are added. Key 2 is below the range.',
        ),
        predictOutput(
          'What is printed?',
          'fn main() {\n    let mut m = std::collections::BTreeMap::new();\n    for &k in &[2, 5, 7, 11] {\n        m.insert(k, k * 2);\n    }\n    for (k, v) in m.range(6..) {\n        println!("{} {}", k, v);\n    }\n}',
          ['5 10\n7 14\n11 22', '7 14\n11 22', '2 4\n5 10', '7 14'],
          1,
          '6.. has no end, so it runs to the largest key. 6 is not a key, so the visit starts at 7.',
        ),
        choose(
          'Both boundary keys low and high must count toward a total. Which call visits the right entries?',
          [
            'map.range(low..high)',
            'map.range(low + 1..high)',
            'map.range(low..=high)',
            'map.range(high..=low)',
          ],
          2,
          '..= includes the end, and a range starting at low includes low. The half-open form leaves out high.',
        ),
      ],
    },
    {
      title: 'Check the bounds before calling range',
      explanation: [
        'A for loop over 5..2 simply does nothing, but BTreeMap::range is stricter: when the start is greater than the end, it panics. A range whose start equals its end, such as 4..4, is fine and visits nothing.',
        'When the bounds come from a caller, check them first and return early, as in if low > high { return 0; }, before building the range.',
      ],
      example: {
        language: 'rust',
        code: 'fn points_between(goals: &[(i32, i32)], from: i32, to: i32) -> i32 {\n    if from > to {\n        return 0;\n    }\n    let mut by_minute = std::collections::BTreeMap::new();\n    for &(minute, points) in goals {\n        by_minute.insert(minute, points);\n    }\n    let mut total = 0;\n    for (_, points) in by_minute.range(from..=to) {\n        total += points;\n    }\n    total\n}\n\nfn main() {\n    let goals = [(12, 3), (40, 2), (75, 3)];\n    println!("{} {}", points_between(&goals, 10, 40), points_between(&goals, 60, 30));\n}',
        output: '5 0',
        explanation:
          'Minutes 12 and 40 fall in 10..=40, giving 5. For 60 and 30 the guard returns 0 before range could panic.',
      },
      questions: [
        choose(
          'What happens when this program runs?',
          [
            'It prints 0, because the range is empty',
            'It panics, because the range starts after it ends',
            'It prints 2, visiting the keys from 5 down to 2',
            'It fails to compile, because 5..=2 is not a valid range',
          ],
          1,
          'BTreeMap::range checks its bounds and panics when the start is greater than the end. Guard with an early return instead.',
          'fn main() {\n    let mut m = std::collections::BTreeMap::new();\n    m.insert(3, "c");\n    m.insert(7, "g");\n    let mut seen = 0;\n    for _ in m.range(5..=2) {\n        seen += 1;\n    }\n    println!("{}", seen);\n}',
        ),
        predictOutput(
          'What does this program print?',
          'fn main() {\n    let mut m = std::collections::BTreeMap::new();\n    m.insert(4, 40);\n    m.insert(6, 60);\n    let mut seen = 0;\n    for _ in m.range(4..4) {\n        seen += 1;\n    }\n    println!("{}", seen);\n}',
          ['1', '40', '0', '2'],
          2,
          '4..4 starts at 4 but stops before 4, so it is empty. Its start is not greater than its end, so range visits nothing instead of panicking.',
        ),
        predictOutput(
          'What is printed?',
          'fn sum_range(entries: &[(i32, i32)], low: i32, high: i32) -> i32 {\n    if low > high {\n        return -1;\n    }\n    let mut map = std::collections::BTreeMap::new();\n    for &(k, v) in entries {\n        map.insert(k, v);\n    }\n    let mut total = 0;\n    for (_, v) in map.range(low..high) {\n        total += v;\n    }\n    total\n}\n\nfn main() {\n    let e = [(1, 5), (3, 7), (6, 2)];\n    println!("{} {} {}", sum_range(&e, 1, 6), sum_range(&e, 6, 1), sum_range(&e, 3, 3));\n}',
          ['14 -1 7', '12 -1 0', '12 0 0', '14 -1 0'],
          1,
          'The half-open range 1..6 visits keys 1 and 3, giving 12. 6 > 1 returns -1 before range runs, and 3..3 is empty.',
        ),
        choose(
          'A function receives low and high from its caller and then calls map.range(low..=high). Which guard prevents a panic?',
          [
            'if low == high { return 0; }',
            'if high > low { return 0; }',
            'if low < 0 { return 0; }',
            'if low > high { return 0; }',
          ],
          3,
          'range panics only when the start is greater than the end. low == high is a valid one-key range, and negative keys are fine.',
        ),
      ],
    },
  ],
  'rust-assertions': [
    {
      title: 'Stop the program when a condition is false',
      explanation: [
        'assert!(condition) checks a bool while the program runs. When the condition is true, nothing happens: no output, and execution continues with the next line.',
        'When the condition is false, assert! panics. The program stops at that line with a message such as assertion failed: count > 0, and no later line runs.',
      ],
      example: {
        language: 'rust',
        code: 'fn half(n: u32) -> u32 {\n    assert!(n % 2 == 0);\n    n / 2\n}\n\nfn main() {\n    println!("{}", half(10));\n    println!("{}", half(4));\n}',
        output: '5\n2',
        explanation:
          'Both calls pass an even number, so the assertion holds silently and each call returns half. half(7) would instead stop with assertion failed: n % 2 == 0 before reaching the division.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn main() {\n    let width = 4;\n    let height = 3;\n    assert!(width > height);\n    println!("area {}", width * height);\n}',
          [
            'true\narea 12',
            'area 12',
            'assertion passed\narea 12',
            'Nothing; the program panics',
          ],
          1,
          '4 > 3 is true, so assert! does nothing visible and the program goes on to print the area.',
        ),
        choose(
          'What happens when this program runs?',
          [
            'It prints checking, false, and ordered',
            'It panics before printing anything at all',
            'It prints checking, then panics at the assert!',
            'It prints checking and ordered, with a warning',
          ],
          2,
          'Lines run in order: checking prints, then the false condition panics at the assert!, so ordered never prints.',
          'fn main() {\n    let stock = 2;\n    println!("checking");\n    assert!(stock >= 5);\n    println!("ordered");\n}',
        ),
        predictOutput(
          'What does this program print?',
          'fn ticket_price(age: u32) -> u32 {\n    assert!(age <= 120);\n    if age < 12 {\n        5\n    } else {\n        9\n    }\n}\n\nfn main() {\n    println!("{}", ticket_price(8) + ticket_price(30));\n}',
          ['5\n9', 'true\ntrue\n14', '14', '18'],
          2,
          'Both ages pass the assertion, which prints nothing. The prices 5 and 9 are added and printed once.',
        ),
        choose(
          'Which value of n makes this assertion panic?',
          ['n = 1', 'n = 99', 'n = 50', 'n = 100'],
          3,
          'With n = 100 the part n < 100 is false, so the whole condition is false and assert! panics. The other values satisfy both parts.',
          'assert!(n > 0 && n < 100);',
        ),
      ],
    },
    {
      title: 'Compare two values with assert_eq! and assert_ne!',
      explanation: [
        'assert_eq!(left, right) passes when the two values are equal and panics when they differ. assert_ne!(left, right) is the opposite: it panics when the two values are equal.',
        'A failing comparison prints both values with Debug, labelled left and right in the order you wrote them. Strings therefore appear in quotes, and an Option shows as Some(..) or None.',
      ],
      example: {
        language: 'rust',
        code: 'fn main() {\n    let total = 3 + 4;\n    assert_eq!(total, 7);\n    assert_ne!(total, 0);\n    let word = String::from("cat");\n    assert_eq!(word, "cat");\n    println!("checks passed");\n}',
        output: 'checks passed',
        explanation:
          'total equals 7 and differs from 0, and a String compares equal to a matching string literal. All three checks pass silently, so only the last line prints.',
      },
      questions: [
        choose(
          'This program panics. How does the panic message show the two compared values?',
          [
            'left: ferris and right: Ferris',
            'left: "ferris" and right: "Ferris"',
            'left: "Ferris" and right: "ferris"',
            'assertion failed: name == "Ferris"',
          ],
          1,
          'assert_eq! prints both sides with Debug in the order written, so the strings keep their quotes and name is on the left.',
          'fn main() {\n    let name = String::from("ferris");\n    assert_eq!(name, "Ferris");\n}',
        ),
        predictOutput(
          'What does this program print?',
          'fn main() {\n    let scores = [4, 9, 4];\n    assert_eq!(scores[0], scores[2]);\n    assert_ne!(scores[0], scores[1]);\n    println!("{} {}", scores[0], scores.len());\n}',
          ['true\ntrue\n4 3', 'Nothing; the program panics', '4 3', '4 2'],
          2,
          'scores[0] and scores[2] are both 4, and 4 differs from 9, so both checks pass silently before the final line prints.',
        ),
        choose(
          'Which of these assertions panics when x is 5?',
          [
            'assert_ne!(x, 5);',
            'assert_eq!(x, 5);',
            'assert_ne!(x, 6);',
            'assert!(x > 4);',
          ],
          0,
          'assert_ne! panics when its two values are equal, and x equals 5. The other three conditions hold.',
        ),
        choose(
          'This program panics. What values does the message list?',
          [
            'left: 0 and right: Some(0)',
            'left: Some(0) and right: None',
            'left: null and right: 0',
            'left: None and right: Some(0)',
          ],
          3,
          'Both values print with Debug in the order written: found is None, which is not equal to Some(0).',
          'fn main() {\n    let found: Option<i32> = None;\n    assert_eq!(found, Some(0));\n}',
        ),
      ],
    },
    {
      title: 'Explain a failure with a custom message',
      explanation: [
        'Arguments after the condition form a message, written like println!: assert!(n > 0, "need a positive count, got {}", n). If the assertion fails, that text replaces the default assertion failed: line in the panic.',
        'assert_eq! and assert_ne! take a message the same way, after their two values. Their panic adds your message to the failed line and still lists left and right. When an assertion passes, its message is never formatted or shown.',
      ],
      example: {
        language: 'rust',
        code: 'fn share(total: u32, people: u32) -> u32 {\n    assert!(people > 0, "cannot split {} among 0 people", total);\n    total / people\n}\n\nfn main() {\n    println!("{}", share(17, 4));\n}',
        output: '4',
        explanation:
          '4 people is valid, so the message is never used and 17 / 4 truncates to 4. share(17, 0) would stop with the panic message cannot split 17 among 0 people.',
      },
      questions: [
        choose(
          'What panic message does this program produce?',
          [
            'assertion failed: retries > 0',
            'retries must be positive, got 0',
            'retries must be positive, got {}',
            'assertion failed: retries must be positive, got 0',
          ],
          1,
          'With a message, assert! panics with the formatted message instead of the default text, and {} is filled with 0.',
          'fn main() {\n    let retries = 0;\n    assert!(retries > 0, "retries must be positive, got {}", retries);\n}',
        ),
        predictOutput(
          'What does this program print?',
          'fn label(level: u8) -> String {\n    assert!(level <= 3, "unknown level {}", level);\n    format!("level {}", level)\n}\n\nfn main() {\n    println!("{}", label(3));\n}',
          [
            'unknown level 3\nlevel 3',
            'unknown level 3',
            'Nothing; the program panics',
            'level 3',
          ],
          3,
          '3 <= 3 is true, so the assertion passes and its message is never printed.',
        ),
        choose(
          'Which best describes the panic output of this program?',
          [
            'width 8 is not a multiple of 3, then left: 8, right: 3',
            'assertion failed: width % 3 == 0, without the message',
            'width 8 is not a multiple of 3, then left: 2, right: 0',
            'width 8 is not a multiple of 3, and no values',
          ],
          2,
          'assert_eq! adds your message and still lists both values: 8 % 3 is 2 on the left and 0 on the right.',
          'fn main() {\n    let width = 8;\n    assert_eq!(width % 3, 0, "width {} is not a multiple of 3", width);\n}',
        ),
        choose(
          'When is the message in assert!(ready, "not ready at step {}", step) formatted and shown?',
          [
            'Only when ready is false',
            'Every time the line runs',
            'Only when ready is true',
            'Once, when the program starts',
          ],
          0,
          'The message is part of the panic, and assert! only panics when its condition is false.',
        ),
      ],
    },
    {
      title: 'Check a precondition before the code that needs it',
      explanation: [
        'A precondition is something a function needs before its work makes sense, such as a non-empty slice before reading its first element. Put an assert! with a message at the top of the function, before the line that depends on it.',
        'A bad call then stops at your clear message instead of failing later with a confusing error such as an out-of-bounds index or a division by zero, and good calls run unchanged.',
      ],
      example: {
        language: 'rust',
        code: 'fn spread(values: &[i32]) -> i32 {\n    assert!(!values.is_empty(), "spread needs at least one value");\n    let mut low = values[0];\n    let mut high = values[0];\n    for &v in values {\n        if v < low {\n            low = v;\n        }\n        if v > high {\n            high = v;\n        }\n    }\n    high - low\n}\n\nfn main() {\n    println!("{}", spread(&[4, 9, 2, 7]));\n}',
        output: '7',
        explanation:
          'The slice is not empty, so the assertion passes and values[0] is safe to read. The largest value 9 minus the smallest 2 gives 7. An empty slice would stop at the message instead of an index panic.',
      },
      questions: [
        choose(
          'What happens when this program runs?',
          [
            'It prints 0',
            'It panics with attempt to divide by zero',
            'It panics with no items to share 12 among',
            'It prints 12',
          ],
          2,
          'The assertion runs first and its condition is false, so the program stops with your message before the division could fail.',
          'fn per_item(total: u32, items: &[u32]) -> u32 {\n    assert!(!items.is_empty(), "no items to share {} among", total);\n    total / items.len() as u32\n}\n\nfn main() {\n    println!("{}", per_item(12, &[]));\n}',
        ),
        predictOutput(
          'What does this program print?',
          'fn last_minus_first(values: &[i32]) -> i32 {\n    assert!(values.len() >= 2, "need two values, got {}", values.len());\n    values[values.len() - 1] - values[0]\n}\n\nfn main() {\n    println!("{}", last_minus_first(&[3, 8, 10]));\n}',
          ['need two values, got 3\n7', '-7', '5', '7'],
          3,
          'Three values satisfy the precondition silently, and the last value 10 minus the first value 3 is 7.',
        ),
        choose(
          'A function computes limit / step and should reject step == 0 with assert!(step != 0, "step must not be zero"). Where should that line go?',
          [
            'Before the division, as the first line',
            'After the division, just before returning',
            'In main, after printing the result',
            'Anywhere; its position does not matter',
          ],
          0,
          'Placed after the division, the program would already have panicked with a division by zero. The check must run before the code it protects.',
        ),
        predictOutput(
          'What does this program print?',
          'fn pair_sum(values: &[i32]) -> i32 {\n    assert_eq!(values.len(), 2, "expected a pair");\n    values[0] + values[1]\n}\n\nfn main() {\n    let total = pair_sum(&[6, -2]);\n    assert_ne!(total, 0);\n    println!("{}", total);\n}',
          ['8', '4', 'expected a pair\n4', 'true\n4'],
          1,
          'The slice has exactly two values and their sum 4 is not 0, so both assertions pass silently and only 4 prints.',
        ),
      ],
    },
  ],
  'rust-test-attribute': [
    {
      title: 'Mark a function as a test with #[test]',
      explanation: [
        'Writing #[test] above a function marks it as a test. cargo test builds a separate test program that calls every #[test] function and reports each one, ending with a summary such as 2 passed; 1 failed. It does not run main.',
        'A test passes when it returns without panicking and fails when it panics, usually through a failed assert! or assert_eq!. What the test computes does not matter unless an assertion checks it. The tests usually live in a mod tests marked #[cfg(test)], covered next.',
      ],
      example: {
        language: 'rust',
        code: 'fn double(n: i32) -> i32 {\n    n * 2\n}\n\n#[cfg(test)]\nmod tests {\n    use super::*;\n\n    #[test]\n    fn doubles_positive() {\n        assert_eq!(double(4), 8);\n    }\n\n    #[test]\n    fn doubles_negative() {\n        assert_eq!(double(-3), -6);\n    }\n}\n\nfn main() {\n    println!("{}", double(21));\n}',
        output: '42',
        explanation:
          'Running the program prints 42 from main. cargo test instead calls doubles_positive and doubles_negative; both assertions hold, so it reports 2 passed; 0 failed.',
      },
      questions: [
        choose(
          'cargo test runs the tests in this file. What does it report?',
          [
            '3 passed; 0 failed',
            '2 passed; 1 failed',
            '1 passed; 2 failed',
            '0 passed; 3 failed',
          ],
          1,
          'square(-2) is 4, not -4, so squares_negative panics and fails. The other two return normally and pass.',
          'fn square(n: i32) -> i32 {\n    n * n\n}\n\n#[cfg(test)]\nmod tests {\n    use super::*;\n\n    #[test]\n    fn squares_three() {\n        assert_eq!(square(3), 9);\n    }\n\n    #[test]\n    fn squares_negative() {\n        assert_eq!(square(-2), -4);\n    }\n\n    #[test]\n    fn squares_zero() {\n        assert_eq!(square(0), 0);\n    }\n}',
        ),
        choose(
          'What does cargo test report for this test?',
          [
            'It passes, because nothing in it panics',
            'It fails, because is_even(3) is false',
            'It fails, because a test may not print',
            'It is skipped, because it has no assertion',
          ],
          0,
          'A test fails only by panicking. Without an assertion, the false result is computed, printed, and ignored, so the test passes.',
          'fn is_even(n: u32) -> bool {\n    n % 2 == 0\n}\n\n#[cfg(test)]\nmod tests {\n    use super::*;\n\n    #[test]\n    fn three_is_even() {\n        let result = is_even(3);\n        println!("{}", result);\n    }\n}',
        ),
        choose(
          'Which functions does cargo test call directly?',
          [
            'main, then every #[test] function',
            'Only the first #[test] function in the file',
            'Only the functions that main calls',
            'Every #[test] function, but not main',
          ],
          3,
          'The test program calls each function marked #[test] and reports it; main belongs to the normal program and is not run.',
        ),
        choose(
          'What does cargo test report for this file?',
          [
            'Both tests pass',
            'Both tests fail',
            'divides_evenly passes and handles_zero fails',
            'handles_zero fails and divides_evenly never runs',
          ],
          2,
          'A panic anywhere during a test, even inside the function under test, fails that test. Each test runs on its own, so divides_evenly still passes.',
          'fn ratio(a: u32, b: u32) -> u32 {\n    assert!(b != 0, "b must not be zero");\n    a / b\n}\n\n#[cfg(test)]\nmod tests {\n    use super::*;\n\n    #[test]\n    fn divides_evenly() {\n        assert_eq!(ratio(8, 2), 4);\n    }\n\n    #[test]\n    fn handles_zero() {\n        assert_eq!(ratio(8, 0), 0);\n    }\n}',
        ),
      ],
    },
    {
      title: 'Keep tests out of normal builds with #[cfg(test)]',
      explanation: [
        '#[cfg(test)] on mod tests means the module is compiled only when building for cargo test. A normal cargo build or cargo run leaves the whole module out, as if it were not in the file.',
        'So running the program prints only what main prints. Code inside the tests module, even a println! or a failing assertion, never runs in a normal run, and the tests add nothing to the shipped program.',
      ],
      example: {
        language: 'rust',
        code: 'fn greeting(name: &str) -> String {\n    format!("hello, {}", name)\n}\n\n#[cfg(test)]\nmod tests {\n    use super::*;\n\n    #[test]\n    fn greets_by_name() {\n        println!("running the greeting test");\n        assert_eq!(greeting("ana"), "hello, ana");\n    }\n}\n\nfn main() {\n    println!("{}", greeting("ben"));\n}',
        output: 'hello, ben',
        explanation:
          'A normal run compiles greeting and main but not the tests module, so the test line never prints.',
      },
      questions: [
        predictOutput(
          'What does a normal run of this program print?',
          'fn total(a: u32, b: u32) -> u32 {\n    a + b\n}\n\n#[cfg(test)]\nmod tests {\n    use super::*;\n\n    #[test]\n    fn adds() {\n        println!("test: {}", total(2, 2));\n        assert_eq!(total(2, 2), 4);\n    }\n}\n\nfn main() {\n    println!("main: {}", total(5, 1));\n}',
          ['main: 6', 'test: 4\nmain: 6', 'main: 6\ntest: 4', 'test: 4'],
          0,
          'The tests module is left out of a normal build, so only main prints.',
        ),
        predictOutput(
          'What does a normal run of this program print?',
          'fn discount(price: u32) -> u32 {\n    price - price / 10\n}\n\n#[cfg(test)]\nmod tests {\n    use super::*;\n\n    #[test]\n    fn takes_ten_percent() {\n        assert_eq!(discount(50), 40);\n    }\n}\n\nfn main() {\n    println!("{}", discount(50));\n}',
          ['40', 'Nothing; the program panics', '45', '45\ntest failed'],
          2,
          'The wrong expectation would fail under cargo test, but a normal run leaves the tests module out, so main prints 50 - 5 = 45.',
        ),
        choose(
          'You run cargo build for a release. What happens to the code inside #[cfg(test)] mod tests?',
          [
            'It is compiled but never called',
            'It is left out of the build entirely',
            'It runs once before main',
            'It runs after main returns',
          ],
          1,
          'cfg(test) is false outside cargo test, so the module is not compiled at all.',
        ),
        predictOutput(
          'What does a normal run of this program print?',
          'const LIMIT: u32 = 3;\n\nfn clamp(n: u32) -> u32 {\n    if n > LIMIT {\n        LIMIT\n    } else {\n        n\n    }\n}\n\n#[cfg(test)]\nmod tests {\n    use super::*;\n\n    #[test]\n    fn clamps_large_values() {\n        assert_eq!(clamp(10), LIMIT);\n        println!("clamped");\n    }\n}\n\nfn main() {\n    println!("{} {}", clamp(2), clamp(7));\n}',
          ['clamped\n2 3', '2 7', '2 3\nclamped', '2 3'],
          3,
          'Only main runs: 2 stays 2 and 7 is capped at LIMIT, 3. The test and its println! are not part of a normal build.',
        ),
      ],
    },
    {
      title: 'Reach the code under test with use super::*',
      explanation: [
        'mod tests is a child module of the file it sits in, so the functions above it are not automatically in scope inside it. use super::*; imports every item of the parent module, letting each test call them by their short names.',
        "A child module may use its parent's private items, so the functions under test do not need pub. Without the use line, a test must write the full path, such as super::fee(0), or cargo test fails to compile with cannot find function.",
      ],
      example: {
        language: 'rust',
        code: 'const BASE_FEE: u32 = 2;\n\nfn fee(km: u32) -> u32 {\n    BASE_FEE + km * 3\n}\n\n#[cfg(test)]\nmod tests {\n    use super::*;\n\n    #[test]\n    fn short_trip() {\n        assert_eq!(fee(1), BASE_FEE + 3);\n    }\n\n    #[test]\n    fn no_distance() {\n        assert_eq!(super::fee(0), 2);\n    }\n}\n\nfn main() {\n    println!("{}", fee(4));\n}',
        output: '14',
        explanation:
          'use super::* brings fee and BASE_FEE into the tests module even though neither is pub, and super::fee spells out the same path. main prints 2 + 4 * 3 = 14.',
      },
      questions: [
        choose(
          'This tests module has no use line. What happens?',
          [
            'Both cargo run and cargo test fail to compile',
            'cargo test passes: tests see every function in the file',
            'cargo run prints 15; cargo test fails: triple not found',
            'cargo run fails to compile, but cargo test passes',
          ],
          2,
          'Inside mod tests the name triple is not in scope, but that module only compiles under cargo test, so only cargo test hits the error.',
          'fn triple(n: i32) -> i32 {\n    n * 3\n}\n\n#[cfg(test)]\nmod tests {\n    #[test]\n    fn triples_two() {\n        assert_eq!(triple(2), 6);\n    }\n}\n\nfn main() {\n    println!("{}", triple(5));\n}',
        ),
        choose(
          'fee is defined above mod tests without pub. Can a test that has use super::*; call it?',
          [
            'No; it must be marked pub before a test can call it',
            "Yes; a child module may use its parent's private items",
            'Only if the test function itself is also marked pub',
            'No; private functions can be called only from main',
          ],
          1,
          'Privacy hides items from outside a module, not from its child modules, so the tests module can call fee directly.',
        ),
        choose(
          "Without any use line, how can a test inside mod tests call the parent module's function area?",
          [
            'area(2, 3)',
            'self::area(2, 3)',
            'tests::area(2, 3)',
            'super::area(2, 3)',
          ],
          3,
          'super names the parent module, where area is defined. self and tests both refer to the tests module itself.',
        ),
        predictOutput(
          'The same use super::* line works in any child module. What does this program print?',
          'const PREFIX: &str = "id";\n\nfn tag(n: u32) -> String {\n    format!("{}-{}", PREFIX, n)\n}\n\nmod report {\n    use super::*;\n\n    pub fn line() -> String {\n        format!("{} and {}", tag(1), tag(2))\n    }\n}\n\nfn main() {\n    println!("{}", report::line());\n}',
          [
            'It does not compile: tag is private',
            'id-1 and id-2',
            'It does not compile: report cannot see PREFIX',
            'tag(1) and tag(2)',
          ],
          1,
          'use super::* imports tag and PREFIX into report, and a child module may use private parent items, so line builds id-1 and id-2.',
        ),
      ],
    },
    {
      title: 'Predict what cargo run and cargo test each do',
      explanation: [
        'A typical file holds the code, a #[cfg(test)] mod tests that starts with use super::*, and main. cargo run compiles everything except the tests module and runs main.',
        'cargo test compiles the tests module too, calls every #[test] function instead of main, and counts a test as passed when it returns without panicking.',
      ],
      example: {
        language: 'rust',
        code: 'fn shipping(weight: u32) -> u32 {\n    if weight <= 2 {\n        5\n    } else {\n        5 + (weight - 2) * 2\n    }\n}\n\n#[cfg(test)]\nmod tests {\n    use super::*;\n\n    #[test]\n    fn light_parcel() {\n        assert_eq!(shipping(1), 5);\n    }\n\n    #[test]\n    fn heavy_parcel() {\n        assert_eq!(shipping(5), 11);\n    }\n}\n\nfn main() {\n    println!("{}", shipping(4));\n}',
        output: '9',
        explanation:
          'cargo run prints 5 + 2 * 2 = 9 from main. cargo test calls light_parcel and heavy_parcel instead; both expectations match, so it reports 2 passed; 0 failed and main does not run.',
      },
      questions: [
        predictOutput(
          'What does cargo run print for this file?',
          'fn countdown_sum(n: u32) -> u32 {\n    let mut total = 0;\n    let mut i = n;\n    while i > 0 {\n        total += i;\n        i -= 1;\n    }\n    total\n}\n\n#[cfg(test)]\nmod tests {\n    use super::*;\n\n    #[test]\n    fn sums_three() {\n        assert_eq!(countdown_sum(3), 6);\n    }\n\n    #[test]\n    fn sums_zero() {\n        assert_eq!(countdown_sum(0), 1);\n    }\n}\n\nfn main() {\n    println!("{}", countdown_sum(4));\n}',
          ['6\n1\n10', '1 passed; 1 failed', '10', '10\n1 passed; 1 failed'],
          2,
          'cargo run leaves the tests out and runs main, which prints 4 + 3 + 2 + 1 = 10. The failing sums_zero test matters only to cargo test.',
        ),
        choose(
          'What does cargo test report for this file?',
          [
            '3 passed; 0 failed, then 70',
            '2 passed; 1 failed',
            '2 passed; 1 failed, then 70',
            '3 passed; 0 failed',
          ],
          1,
          'raises_low expects 5 but clamp_percent(-5) returns 0, so that test panics and fails. cargo test never runs main, so 70 is not printed.',
          'fn clamp_percent(n: i32) -> i32 {\n    if n < 0 {\n        0\n    } else if n > 100 {\n        100\n    } else {\n        n\n    }\n}\n\n#[cfg(test)]\nmod tests {\n    use super::*;\n\n    #[test]\n    fn keeps_middle() {\n        assert_eq!(clamp_percent(40), 40);\n    }\n\n    #[test]\n    fn caps_high() {\n        assert_eq!(clamp_percent(250), 100);\n    }\n\n    #[test]\n    fn raises_low() {\n        assert_eq!(clamp_percent(-5), 5);\n    }\n}\n\nfn main() {\n    println!("{}", clamp_percent(70));\n}',
        ),
        choose(
          'Under cargo test, which functions in this file run?',
          [
            'main, helper, and both tests',
            'Only main and helper',
            'Both tests, and helper when they call it',
            'Both tests, but never helper',
          ],
          2,
          'cargo test calls each #[test] function, and any function they call runs as usual; main is not run.',
          'fn helper(n: u32) -> u32 {\n    n + 1\n}\n\n#[cfg(test)]\nmod tests {\n    use super::*;\n\n    #[test]\n    fn adds_one() {\n        assert_eq!(helper(1), 2);\n    }\n\n    #[test]\n    fn adds_one_to_zero() {\n        assert_eq!(helper(0), 1);\n    }\n}\n\nfn main() {\n    println!("{}", helper(41));\n}',
        ),
        predictOutput(
          'What does cargo run print for this file?',
          'fn label(count: u32) -> String {\n    if count == 1 {\n        format!("{} item", count)\n    } else {\n        format!("{} items", count)\n    }\n}\n\n#[cfg(test)]\nmod tests {\n    use super::*;\n\n    #[test]\n    fn singular() {\n        assert_eq!(label(1), "1 item");\n    }\n}\n\nfn main() {\n    println!("{}", label(1));\n    println!("{}", label(0));\n}',
          [
            '1 item\n0 items',
            '1 item\n0 item',
            '1 item\n1 item\n0 items',
            '0 items\n1 item',
          ],
          0,
          'Only main runs: count 1 gives the singular form and 0 gives the plural. The test is not part of a normal run.',
        ),
      ],
    },
  ],
  'rust-test-contract': [
    {
      title: 'A test can only check what a function returns',
      explanation: [
        'assert_eq! compares two values, so a test can check a function only through what it returns. A function that prints its result returns (), and the printed text goes to the terminal, where no assertion can see it.',
        'cargo test does not compare printed output with anything. To make behavior testable, have the function return the value, for example a String built with format!.',
      ],
      example: {
        language: 'rust',
        code: 'fn report_line(name: &str, score: u32) -> String {\n    format!("{}: {}", name, score)\n}\n\n#[cfg(test)]\nmod tests {\n    use super::*;\n\n    #[test]\n    fn formats_name_and_score() {\n        assert_eq!(report_line("ana", 7), "ana: 7");\n    }\n}\n\nfn main() {\n    println!("{}", report_line("ben", 12));\n}',
        output: 'ben: 12',
        explanation:
          'report_line returns its line instead of printing it, so the test can compare the result with "ana: 7" and main can print it.',
      },
      questions: [
        choose(
          'A test should check f with assert_eq!(f(2, 3), "2 of 3"). Which signature lets that assertion compile?',
          [
            'fn f(a: u32, b: u32)',
            'fn f(a: u32, b: u32) -> String',
            'fn f(a: u32, b: u32) -> bool',
            'fn f(a: &mut u32, b: u32)',
          ],
          1,
          'Only a String result can be compared with the text "2 of 3". A function with no return type gives (), and a bool is not text.',
        ),
        choose(
          'What happens when this file is built with cargo test?',
          [
            'The test passes, because show_total prints total 5',
            'The test fails when run, because () is not "total 5"',
            'It fails to compile: show_total returns (), not a string',
            'The test passes, because cargo test checks printed lines',
          ],
          2,
          'show_total returns (), and assert_eq! cannot compare () with a string, so the test module does not compile.',
          'fn show_total(a: u32, b: u32) {\n    println!("total {}", a + b);\n}\n\n#[cfg(test)]\nmod tests {\n    use super::*;\n\n    #[test]\n    fn totals() {\n        assert_eq!(show_total(2, 3), "total 5");\n    }\n}\n\nfn main() {\n    show_total(2, 3);\n}',
        ),
        predictOutput(
          'What does this program print?',
          'fn status(done: u32, total: u32) -> String {\n    format!("{} of {} done", done, total)\n}\n\nfn main() {\n    let line = status(2, 5);\n    println!("[{}]", line);\n}',
          [
            '2 of 5 done\n[2 of 5 done]',
            '[]',
            '[2 of 5 done]',
            '["2 of 5 done"]',
          ],
          2,
          'status only builds and returns the String; the single println! in main prints it inside brackets.',
        ),
        choose(
          'A function prints its summary line and returns nothing. What can a #[test] for it check?',
          [
            'Only that calling it does not panic',
            'That the printed line is correct',
            'That it returned the right String',
            'Nothing; cargo test skips functions that print',
          ],
          0,
          'The printed text is invisible to assertions and the return value is (), so a test can only confirm the call completes without panicking.',
        ),
      ],
    },
    {
      title: 'Returning a value prints nothing by itself',
      explanation: [
        'A function that returns a String shows nothing on its own. The caller decides what to do with the value: main can print it, combine it with other text, or ignore it, and a test can compare it.',
        'Keeping println! in main and the work in returning functions lets the same function serve both the program and its tests.',
      ],
      example: {
        language: 'rust',
        code: 'fn welcome(name: &str) -> String {\n    format!("welcome, {}", name)\n}\n\nfn main() {\n    welcome("ignored");\n    let first = welcome("ana");\n    let second = welcome("ben");\n    println!("{} / {}", first, second);\n}',
        output: 'welcome, ana / welcome, ben',
        explanation:
          "The first call's String is never used, so nothing appears for it. The only output is main's println!, which prints both returned lines once.",
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn shout(word: &str) -> String {\n    format!("{}!", word)\n}\n\nfn main() {\n    shout("hey");\n    let loud = shout("go");\n    println!("{}", loud);\n}',
          ['hey!\ngo!', 'hey!', 'hey!\ngo!\ngo!', 'go!'],
          3,
          'Calling shout only returns a String. The result of shout("hey") is ignored, and main prints only loud.',
        ),
        predictOutput(
          'What does this program print?',
          'fn row(label: &str, value: u32) -> String {\n    format!("{}={}", label, value)\n}\n\nfn main() {\n    let a = row("x", 1);\n    let b = row("y", 2);\n    println!("{}; {}", b, a);\n}',
          ['x=1; y=2', 'x=1\ny=2\ny=2; x=1', 'y=2; x=1', 'x=1\ny=2'],
          2,
          "Building a and b prints nothing. The only output is main's line, which puts b first.",
        ),
        choose(
          'Where should println! go so that both main and a test can use count_line?',
          [
            'Inside count_line, just before it returns the String',
            'In main, on the String that count_line returns',
            'In the test, in place of an assertion',
            'In both count_line and main',
          ],
          1,
          'count_line should only return its String. main prints it, and the test compares it with assert_eq!.',
        ),
        predictOutput(
          'What does this program print?',
          'fn noisy_sum(a: i32, b: i32) -> i32 {\n    println!("adding");\n    a + b\n}\n\nfn quiet_sum(a: i32, b: i32) -> i32 {\n    a + b\n}\n\nfn main() {\n    let x = quiet_sum(1, 2);\n    let y = noisy_sum(3, 4);\n    println!("{}", x + y);\n}',
          ['adding\n10', 'adding\nadding\n10', '10', '3\nadding\n7\n10'],
          0,
          'Only noisy_sum prints, once, when it is called. quiet_sum just returns, and main prints the total 3 + 7.',
        ),
      ],
    },
    {
      title: 'Turn printing code into a testable function',
      explanation: [
        "To make printing code testable, move the formatting into a function that returns the String and let main print the result. The program's output stays the same.",
        'A #[cfg(test)] module can then call that function with several inputs and compare each result with assert_eq!, while a normal run still prints only what main prints.',
      ],
      example: {
        language: 'rust',
        code: 'fn progress(done: u32, total: u32) -> String {\n    format!("{}/{} tasks", done, total)\n}\n\n#[cfg(test)]\nmod tests {\n    use super::*;\n\n    #[test]\n    fn shows_both_counts() {\n        assert_eq!(progress(2, 9), "2/9 tasks");\n    }\n\n    #[test]\n    fn handles_nothing_done() {\n        assert_eq!(progress(0, 3), "0/3 tasks");\n    }\n}\n\nfn main() {\n    println!("{}", progress(4, 6));\n}',
        output: '4/6 tasks',
        explanation:
          'progress replaces a function that used to print the line itself. main prints the returned line, and the two tests check other inputs without any printing.',
      },
      questions: [
        choose(
          'Which rewrite of print_score lets a test check its line with assert_eq!?',
          [
            'fn score_line(points: u32) -> String { println!("score: {}", points); String::new() }',
            'fn score_line(points: u32) { let line = format!("score: {}", points); }',
            'fn score_line(points: u32) -> u32 { println!("score: {}", points); points }',
            'fn score_line(points: u32) -> String { format!("score: {}", points) }',
          ],
          3,
          'Only this version returns the formatted line. The others return an empty String, (), or the number, none of which is the text a test needs.',
          'fn print_score(points: u32) {\n    println!("score: {}", points);\n}',
        ),
        predictOutput(
          'What does a normal run of this program print?',
          'fn temperature(celsius: i32) -> String {\n    if celsius < 0 {\n        format!("{} below zero", -celsius)\n    } else {\n        format!("{} degrees", celsius)\n    }\n}\n\n#[cfg(test)]\nmod tests {\n    use super::*;\n\n    #[test]\n    fn negative_reads_below_zero() {\n        assert_eq!(temperature(-4), "4 below zero");\n    }\n}\n\nfn main() {\n    println!("{}", temperature(-2));\n    println!("{}", temperature(15));\n}',
          [
            '2 below zero\n15 degrees',
            '-2 degrees\n15 degrees',
            '4 below zero\n2 below zero\n15 degrees',
            '-2 below zero\n15 degrees',
          ],
          0,
          'main prints the two returned lines; -2 is negated to 2 in the below-zero form. The test is left out of a normal run.',
        ),
        predictOutput(
          'What does this program print?',
          'fn ratio_line(hits: u32, shots: u32) -> String {\n    format!("{} hits in {} shots", hits, shots)\n}\n\nfn main() {\n    let line = ratio_line(3, 8);\n    assert_eq!(line, "3 hits in 8 shots");\n    println!("{}", line.len());\n}',
          ['3 hits in 8 shots\n17', '17', 'true\n17', '18'],
          1,
          'Because the line is returned, main can check it with assert_eq!, which passes silently, and then print its length, 17 characters.',
        ),
        choose(
          'Which test line compiles and passes for this function?',
          [
            'assert_eq!(level_line(4), "level 4\\n");',
            'assert!(level_line(4));',
            'assert_eq!(level_line(4), "level 4");',
            'assert_eq!(level_line(4), 4);',
          ],
          2,
          'The function returns exactly level 4 with no newline, and a String compares equal to that literal. assert! needs a bool, and 4 is a number, not text.',
          'fn level_line(level: u32) -> String {\n    format!("level {}", level)\n}',
        ),
      ],
    },
  ],
  'rust-package-name': [
    {
      title: 'Turn a package name into the crate name used in code',
      explanation: [
        'Cargo.toml names a package in its [package] section with a line such as name = "fast-csv". A Rust path cannot contain a dash, so code that uses the library writes the crate name with each dash replaced by an underscore: use fast_csv;',
        'text.replace(from, to) returns a new String with every occurrence of from replaced by to. name.replace(\'-\', "_") therefore produces the crate name and leaves name itself unchanged.',
      ],
      example: {
        language: 'rust',
        code: 'fn main() {\n    let package = "fast-csv-reader";\n    let crate_name = package.replace(\'-\', "_");\n    println!("{}", package);\n    println!("use {};", crate_name);\n}',
        output: 'fast-csv-reader\nuse fast_csv_reader;',
        explanation:
          'replace changes every dash, not just the first, and returns a new String. package still holds the dashed name.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn main() {\n    let name = "tiny-http-server";\n    println!("{}", name.replace(\'-\', "_"));\n}',
          [
            'tiny_http-server',
            'tiny_http_server',
            'tinyhttpserver',
            'tiny-http-server',
          ],
          1,
          'replace swaps every dash for an underscore, not just the first one.',
        ),
        choose(
          'A Cargo.toml has name = "image-tools" under [package]. Which line imports its library in Rust code?',
          [
            'use image-tools;',
            'use imagetools;',
            'use image_tools;',
            'use "image-tools";',
          ],
          2,
          'A dash is not allowed in a Rust path, so each dash in the package name becomes an underscore.',
        ),
        predictOutput(
          'What does this program print?',
          'fn main() {\n    let package = String::from("log-parse");\n    let module = package.replace(\'-\', "_");\n    println!("{} {}", package, module);\n}',
          [
            'log-parse log_parse',
            'log_parse log_parse',
            'log-parse log-parse',
            'log_parse log-parse',
          ],
          0,
          'replace returns a new String and leaves package unchanged, so the dashed and underscored names both print.',
        ),
        choose(
          'Which part of Cargo.toml decides the crate name that code imports?',
          [
            'The version field',
            'The edition field',
            'The name of the folder holding Cargo.toml',
            'The name field',
          ],
          3,
          'The name field under [package] identifies the package; code refers to it with dashes turned into underscores.',
        ),
      ],
    },
    {
      title: 'Cut a known start or end off a str',
      explanation: [
        'text.strip_prefix(p) checks whether text starts with p. If it does, it returns Some with the rest of the text after p; if not, it returns None. text.strip_suffix(p) does the same at the end of the text.',
        'The pattern can be a string such as "name = " or a single char such as \'"\'. Only that exact piece is removed, once, and the rest is returned unchanged.',
      ],
      example: {
        language: 'rust',
        code: 'fn main() {\n    let line = "version = 2";\n    println!("{:?}", line.strip_prefix("version = "));\n    println!("{:?}", line.strip_prefix("name = "));\n    println!("{:?}", line.strip_suffix(\'2\'));\n}',
        output: 'Some("2")\nNone\nSome("version = ")',
        explanation:
          'The line starts with "version = ", so the first call returns the rest, "2". It does not start with "name = ", so the second is None. strip_suffix removes only the final 2, keeping the space before it.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn main() {\n    let path = "src/main.rs";\n    println!("{:?}", path.strip_prefix("src/"));\n}',
          ['Some("main.rs")', 'Some("src/")', '"main.rs"', 'None'],
          0,
          'The path starts with src/, so strip_prefix returns Some with what comes after it.',
        ),
        predictOutput(
          'What does this program print?',
          'fn main() {\n    let file = "notes.txt";\n    println!("{:?}", file.strip_suffix(".md"));\n}',
          ['Some("notes")', 'Some("notes.txt")', 'None', '"notes.txt"'],
          2,
          'notes.txt does not end with .md, so strip_suffix returns None rather than the unchanged text.',
        ),
        predictOutput(
          'What does this program print?',
          'fn main() {\n    let word = "\\"quoted\\"";\n    match word.strip_prefix(\'"\') {\n        Some(rest) => println!("{}", rest),\n        None => println!("no quote"),\n    }\n}',
          ['quoted', '"quoted"', 'no quote', 'quoted"'],
          3,
          'strip_prefix removes only the opening quote; the closing quote at the end stays in rest.',
        ),
        choose(
          'What does "name = app".strip_suffix("app") return?',
          ['Some("name =")', 'Some("name = ")', 'Some("app")', 'None'],
          1,
          'Only the exact suffix app is removed, so the space before it remains in the returned text.',
        ),
      ],
    },
    {
      title: 'Chain the cuts with ? in a function returning Option',
      explanation: [
        'strip_prefix and strip_suffix return Option, so they combine with ?. Inside a function that returns Option, line.strip_prefix("name = ")? gives the rest of the line when the prefix is there and makes the whole function return None when it is not.',
        'The steps run in order and the first one that fails ends the function, so only a line that passes every check reaches the final Some(...).',
      ],
      example: {
        language: 'rust',
        code: 'fn quoted_value(line: &str) -> Option<String> {\n    let after_key = line.strip_prefix("edition = ")?;\n    let inner = after_key.strip_prefix(\'"\')?.strip_suffix(\'"\')?;\n    Some(inner.to_string())\n}\n\nfn main() {\n    println!("{:?}", quoted_value("edition = \\"2021\\""));\n    println!("{:?}", quoted_value("edition = 2021"));\n}',
        output: 'Some("2021")\nNone',
        explanation:
          "The first line passes all three cuts, leaving 2021 from between the quotes. The second has no opening quote, so the strip_prefix('\"')? step returns None from the function.",
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn version_of(line: &str) -> Option<String> {\n    let rest = line.strip_prefix("version = ")?;\n    let inner = rest.strip_prefix(\'"\')?.strip_suffix(\'"\')?;\n    Some(inner.to_string())\n}\n\nfn main() {\n    println!("{:?}", version_of("name = \\"cli\\""));\n}',
          ['Some("cli")', 'None', 'Some("")', '"cli"'],
          1,
          'The line does not start with version = , so the first ? returns None from version_of before the quotes are looked at.',
        ),
        predictOutput(
          'What does this program print?',
          'fn bracketed(text: &str) -> Option<String> {\n    let inner = text.strip_prefix(\'[\')?.strip_suffix(\']\')?;\n    Some(format!("<{}>", inner))\n}\n\nfn main() {\n    println!("{:?}", bracketed("[core]"));\n    println!("{:?}", bracketed("[core"));\n}',
          [
            'Some("<core>")\nSome("<core>")',
            'Some("<core>")\nSome("<core")',
            'Some("<core>")\nNone',
            '"<core>"\nNone',
          ],
          2,
          '[core] passes both cuts. [core has no closing bracket, so strip_suffix gives None and ? returns None from the function.',
        ),
        choose(
          'Inside fn f(line: &str) -> Option<String>, the statement let rest = line.strip_prefix("name = ")?; runs with line equal to "title = x". What happens?',
          [
            'rest becomes "title = x"',
            'The program panics',
            'rest becomes an empty str',
            'f returns None right away',
          ],
          3,
          'strip_prefix gives None because the prefix is missing, and ? turns that into an early return of None from f.',
        ),
        choose(
          'Why does this function fail to compile?',
          [
            '? on an Option needs the function to return an Option',
            'strip_prefix needs a char pattern, not a string',
            'rest.len() cannot be called on a borrowed str',
            'The ? must be written before the strip_prefix call',
          ],
          0,
          'key_length returns usize, so there is no None it could return early. ? on an Option works only in a function that returns Option.',
          'fn key_length(line: &str) -> usize {\n    let rest = line.strip_prefix("key=")?;\n    rest.len()\n}',
        ),
      ],
    },
    {
      title: 'Build the use line from a manifest line',
      explanation: [
        'The pieces combine into one function: strip "name = " and the surrounding quotes with ?, replace each dash with an underscore, and format the use line. Any line that is not a quoted name line gives None.',
      ],
      example: {
        language: 'rust',
        code: 'fn use_line(manifest_line: &str) -> Option<String> {\n    let quoted = manifest_line.strip_prefix("name = ")?;\n    let name = quoted.strip_prefix(\'"\')?.strip_suffix(\'"\')?;\n    let crate_name = name.replace(\'-\', "_");\n    Some(format!("use {};", crate_name))\n}\n\nfn main() {\n    println!("{:?}", use_line("name = \\"color-print\\""));\n    println!("{:?}", use_line("version = \\"0.3.1\\""));\n}',
        output: 'Some("use color_print;")\nNone',
        explanation:
          'The name line passes every cut, its dash becomes an underscore, and format! builds the use line. The version line fails the first strip_prefix, so the function returns None.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn use_line(manifest_line: &str) -> Option<String> {\n    let quoted = manifest_line.strip_prefix("name = ")?;\n    let name = quoted.strip_prefix(\'"\')?.strip_suffix(\'"\')?;\n    Some(format!("use {};", name.replace(\'-\', "_")))\n}\n\nfn main() {\n    println!("{:?}", use_line("name = \\"web-api-kit\\""));\n}',
          [
            'Some("use web-api-kit;")',
            'Some("use web_api-kit;")',
            'Some("use web_api_kit;")',
            'None',
          ],
          2,
          'The line is a quoted name line, so every cut succeeds and both dashes become underscores.',
        ),
        predictOutput(
          'What does this program print?',
          'fn use_line(manifest_line: &str) -> Option<String> {\n    let quoted = manifest_line.strip_prefix("name = ")?;\n    let name = quoted.strip_prefix(\'"\')?.strip_suffix(\'"\')?;\n    Some(format!("use {};", name.replace(\'-\', "_")))\n}\n\nfn main() {\n    println!("{:?}", use_line("name = \\"rand\\""));\n    println!("{:?}", use_line("name=\\"rand\\""));\n}',
          [
            'Some("use rand;")\nSome("use rand;")',
            'Some("use rand;")\nNone',
            'None\nNone',
            '"use rand;"\nNone',
          ],
          1,
          'The second line has no spaces around =, so it does not start with "name = " exactly and the first ? returns None.',
        ),
        predictOutput(
          'What does this program print?',
          'fn use_line(manifest_line: &str) -> Option<String> {\n    let quoted = manifest_line.strip_prefix("name = ")?;\n    let name = quoted.strip_prefix(\'"\')?.strip_suffix(\'"\')?;\n    Some(format!("use {};", name.replace(\'-\', "_")))\n}\n\nfn main() {\n    match use_line("name = \\"my-app\\"") {\n        Some(line) => println!("{}", line),\n        None => println!("not a name line"),\n    }\n    match use_line("[package]") {\n        Some(line) => println!("{}", line),\n        None => println!("not a name line"),\n    }\n}',
          [
            'use my-app;\nnot a name line',
            'Some("use my_app;")\nNone',
            'use my_app;\nNone',
            'use my_app;\nnot a name line',
          ],
          3,
          'The match prints the String inside Some without Debug quotes. The [package] header is not a name line, so it takes the None arm.',
        ),
        choose(
          'A teammate writes name.replace(\'-\', "") instead of name.replace(\'-\', "_"). What does use_line now return for name = "data-store"?',
          [
            'Some("use datastore;")',
            'Some("use data_store;")',
            'Some("use data-store;")',
            'None',
          ],
          0,
          'Replacing with an empty string deletes the dash, giving datastore, which is not the crate name data_store.',
        ),
      ],
    },
  ],
  'rust-cow': [
    {
      title: 'Hold either borrowed or owned text in a Cow',
      explanation: [
        'std::borrow::Cow<str> is an enum with two variants: Borrowed(&str), which points at text someone else owns, and Owned(String), which holds its own text. A function can return its input as Cow::Borrowed when nothing needs changing, without copying it, and a new String as Cow::Owned when it built one.',
        'matches!(value, pattern) is true when the value fits the pattern, like a match with one true arm and a false fallback. matches!(c, std::borrow::Cow::Borrowed(_)) tells you which variant c holds.',
      ],
      example: {
        language: 'rust',
        code: 'fn tidy(name: &str) -> std::borrow::Cow<\'_, str> {\n    if name.is_empty() {\n        std::borrow::Cow::Owned(String::from("anonymous"))\n    } else {\n        std::borrow::Cow::Borrowed(name)\n    }\n}\n\nfn main() {\n    let a = tidy("ana");\n    let b = tidy("");\n    println!("{} {}", a, matches!(a, std::borrow::Cow::Borrowed(_)));\n    println!("{} {}", b, matches!(b, std::borrow::Cow::Borrowed(_)));\n}',
        output: 'ana true\nanonymous false',
        explanation:
          'ana needs no change, so tidy returns it borrowed. The empty name is replaced by a new String, so that result is Owned and matches! gives false for Borrowed.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn label(code: &str) -> std::borrow::Cow<\'_, str> {\n    if code == "x" {\n        std::borrow::Cow::Owned(String::from("unknown"))\n    } else {\n        std::borrow::Cow::Borrowed(code)\n    }\n}\n\nfn main() {\n    let c = label("x");\n    println!("{}", matches!(c, std::borrow::Cow::Owned(_)));\n}',
          ['true', 'false', 'Owned', 'unknown'],
          0,
          'code is "x", so label returns a new String as Owned, and matches! returns the bool true.',
        ),
        predictOutput(
          'What does this program print?',
          'fn with_unit(value: &str) -> std::borrow::Cow<\'_, str> {\n    if value == "0" {\n        std::borrow::Cow::Borrowed(value)\n    } else {\n        std::borrow::Cow::Owned(format!("{} kg", value))\n    }\n}\n\nfn main() {\n    let a = with_unit("0");\n    let b = with_unit("12");\n    let a_borrowed = matches!(a, std::borrow::Cow::Borrowed(_));\n    let b_borrowed = matches!(b, std::borrow::Cow::Borrowed(_));\n    println!("{} {}", a_borrowed, b_borrowed);\n}',
          ['false true', 'true true', 'true false', 'false false'],
          2,
          '"0" is returned as it is, borrowed; "12" gets a unit added in a new String, so it is Owned.',
        ),
        choose(
          'A function returns Cow::Borrowed(input) whenever the input needs no change. What does that save compared with always returning a String?',
          [
            'A copy of the text into a new String',
            'The check that decides whether a change is needed',
            'The borrow of the input',
            'Nothing; Borrowed copies the text too',
          ],
          0,
          "Borrowed only points at the caller's text, so the unchanged case allocates and copies nothing.",
        ),
        choose(
          'A function has just built a brand-new String with format!. Which variant should it return it in?',
          [
            'Cow::Borrowed, holding a borrow of the new String',
            'Either; a Cow converts between them on its own',
            'Neither; a Cow can only wrap the input',
            'Cow::Owned, holding the new String',
          ],
          3,
          'The new String belongs to the function, so it must be moved out as Owned; a borrow of it would outlive the String.',
        ),
      ],
    },
    {
      title: 'Print a Cow and see only its text',
      explanation: [
        'Printing a Cow<str> prints the text it holds. With {} you get the bare text, and with {:?} you get the text in quotes, exactly as for a str or String. The variant name never appears.',
        'str methods such as len and is_empty also work directly on a Cow<str>, whichever variant it holds. To learn the variant, use matches! or match.',
      ],
      example: {
        language: 'rust',
        code: 'fn main() {\n    let owned: std::borrow::Cow<\'_, str> = std::borrow::Cow::Owned(String::from("tea"));\n    let borrowed: std::borrow::Cow<\'_, str> = std::borrow::Cow::Borrowed("tea");\n    println!("{} {}", owned, borrowed);\n    println!("{:?} {:?}", owned, borrowed);\n    println!("{}", owned.len() + borrowed.len());\n}',
        output: 'tea tea\n"tea" "tea"\n6',
        explanation:
          'Both values print the same way with {} and with {:?}, even though one is Owned and one is Borrowed. Each has length 3.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn main() {\n    let note: std::borrow::Cow<\'_, str> = std::borrow::Cow::Borrowed("ok");\n    println!("{:?}", note);\n}',
          ['Borrowed("ok")', '"ok"', 'ok', 'Cow("ok")'],
          1,
          'Debug for a Cow<str> shows the text the way a str would, in quotes, without the variant name.',
        ),
        predictOutput(
          'What does this program print?',
          'fn main() {\n    let word: std::borrow::Cow<\'_, str> = std::borrow::Cow::Owned(String::from("sky"));\n    println!("[{}] has {} letters", word, word.len());\n}',
          [
            '[Owned("sky")] has 3 letters',
            '["sky"] has 3 letters',
            '[sky] has 3 letters',
            '[sky] has 5 letters',
          ],
          2,
          '{} prints the bare text, and len counts the three letters of sky, not quotes or the variant.',
        ),
        predictOutput(
          'What does this program print?',
          'fn or_dash(text: &str) -> std::borrow::Cow<\'_, str> {\n    if text.is_empty() {\n        std::borrow::Cow::Owned(String::from("-"))\n    } else {\n        std::borrow::Cow::Borrowed(text)\n    }\n}\n\nfn main() {\n    println!("{:?} {:?}", or_dash(""), or_dash("x"));\n}',
          ['Owned("-") Borrowed("x")', '- x', '"" "x"', '"-" "x"'],
          3,
          'The empty input is replaced by "-" and x is borrowed, but Debug shows only each text in quotes.',
        ),
        choose(
          'Two Cow<str> values hold the same text, one Borrowed and one Owned. How can a program tell them apart?',
          [
            'Check each with matches! or a match on the variant',
            'Print both with {:?} and compare the output',
            'Compare their len() values',
            'Print both with {} and look for quotes',
          ],
          0,
          'Printing and len see only the text, which is identical. Only matching on the variant shows which one holds a borrow.',
        ),
      ],
    },
    {
      title: 'Edit a Cow with to_mut, which copies only borrowed text',
      explanation: [
        'c.to_mut() returns a &mut String that you can change, for example with push or push_str. If c is Borrowed, to_mut first copies the borrowed text into a new String and switches c to Owned. If c is already Owned, it hands out the existing String without copying.',
        "Either way the original &str is never changed: edits go into the Cow's own String. The Cow must be declared with let mut to call to_mut.",
      ],
      example: {
        language: 'rust',
        code: 'fn main() {\n    let original = "draft";\n    let mut doc = std::borrow::Cow::Borrowed(original);\n    println!("{}", matches!(doc, std::borrow::Cow::Borrowed(_)));\n    doc.to_mut().push_str(" v2");\n    println!("{}", matches!(doc, std::borrow::Cow::Borrowed(_)));\n    println!("{} | {}", original, doc);\n}',
        output: 'true\nfalse\ndraft | draft v2',
        explanation:
          'doc starts Borrowed. to_mut copies draft into a new String, so doc becomes Owned and gets the edit, while original still reads draft.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn main() {\n    let base = "file";\n    let mut name = std::borrow::Cow::Borrowed(base);\n    name.to_mut().push_str(".txt");\n    println!("{} {}", base, name);\n}',
          ['file.txt file.txt', 'file file', 'file.txt file', 'file file.txt'],
          3,
          "to_mut copies file into the Cow's own String before the edit, so only name gains .txt and base is unchanged.",
        ),
        predictOutput(
          'What does this program print?',
          "fn main() {\n    let mut code: std::borrow::Cow<'_, str> = std::borrow::Cow::Owned(String::from(\"ab\"));\n    code.to_mut().push('c');\n    code.to_mut().push('d');\n    println!(\"{:?} {}\", code, matches!(code, std::borrow::Cow::Owned(_)));\n}",
          ['"abcd" true', '"abd" true', '"abcd" false', 'Owned("abcd") true'],
          0,
          'Both pushes edit the same owned String, which stays Owned. Debug prints only the text in quotes.',
        ),
        choose(
          'How many times does this program copy the text hello into a new String?',
          ['Zero', 'One', 'Two', 'Three'],
          1,
          'Only the first to_mut finds a Borrowed value and copies it. After that the Cow is Owned, so later calls reuse the same String.',
          "fn main() {\n    let mut greeting = std::borrow::Cow::Borrowed(\"hello\");\n    greeting.to_mut().push('!');\n    greeting.to_mut().push('!');\n    greeting.to_mut().push('?');\n    println!(\"{}\", greeting);\n}",
        ),
        choose(
          'Why does this program fail to compile?',
          [
            'A Borrowed Cow can never be changed',
            'push only works on a Cow built with String::from',
            'to_mut needs note to be declared with let mut',
            'println! cannot print a Cow',
          ],
          2,
          'to_mut takes the Cow mutably, since it may switch it to Owned, so the binding must be let mut note.',
          'fn main() {\n    let note = std::borrow::Cow::Borrowed("hi");\n    note.to_mut().push(\'!\');\n    println!("{}", note);\n}',
        ),
      ],
    },
    {
      title: 'Change the text only when it needs changing',
      explanation: [
        'Cow pays off when most inputs need no change. Check the input first, for example with text.ends_with(p), which is true when text ends with p (starts_with checks the start), and call to_mut only when an edit is needed.',
        'Inputs that are already fine come back still Borrowed, with no new String; only inputs that needed an edit come back Owned.',
      ],
      example: {
        language: 'rust',
        code: 'fn with_slash(path: &str) -> std::borrow::Cow<\'_, str> {\n    let mut result = std::borrow::Cow::Borrowed(path);\n    if !path.ends_with(\'/\') {\n        result.to_mut().push(\'/\');\n    }\n    result\n}\n\nfn main() {\n    let a = with_slash("docs/");\n    let b = with_slash("img");\n    println!("{:?} {}", a, matches!(a, std::borrow::Cow::Borrowed(_)));\n    println!("{:?} {}", b, matches!(b, std::borrow::Cow::Borrowed(_)));\n}',
        output: '"docs/" true\n"img/" false',
        explanation:
          'docs/ already ends with a slash, so to_mut is never called and it stays Borrowed. img needs the slash, so it is copied and becomes Owned.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fn with_hash(tag: &str) -> std::borrow::Cow<\'_, str> {\n    let mut result = std::borrow::Cow::Borrowed(tag);\n    if !tag.starts_with(\'#\') {\n        result = std::borrow::Cow::Owned(format!("#{}", tag));\n    }\n    result\n}\n\nfn main() {\n    let a = with_hash("#rust");\n    let b = with_hash("news");\n    println!("{} {}", a, b);\n    println!("{}", matches!(a, std::borrow::Cow::Owned(_)));\n}',
          [
            '#rust #news\ntrue',
            '##rust #news\nfalse',
            '#rust #news\nfalse',
            '#rust news\nfalse',
          ],
          2,
          '#rust already starts with #, so it is returned borrowed and unchanged. Only news gets a new String with # in front.',
        ),
        predictOutput(
          'What does this program print?',
          'fn ensure_ext(name: &str) -> std::borrow::Cow<\'_, str> {\n    let mut result = std::borrow::Cow::Borrowed(name);\n    if !name.ends_with(".rs") {\n        result.to_mut().push_str(".rs");\n    }\n    result\n}\n\nfn main() {\n    println!("{:?}", ensure_ext("lib.rs"));\n    println!("{:?}", ensure_ext("main"));\n}',
          [
            '"lib.rs.rs"\n"main.rs"',
            '"lib.rs"\n"main.rs"',
            'Borrowed("lib.rs")\nOwned("main.rs")',
            '"lib.rs"\n"main"',
          ],
          1,
          'lib.rs already ends with .rs and is returned as it is; main gets .rs added. Debug shows each text in quotes.',
        ),
        predictOutput(
          'What does this program print?',
          'fn closed(line: &str) -> std::borrow::Cow<\'_, str> {\n    let mut result = std::borrow::Cow::Borrowed(line);\n    if !line.ends_with(\';\') {\n        result.to_mut().push(\';\');\n    }\n    result\n}\n\nfn main() {\n    let a = closed("x = 1;");\n    let b = closed("y = 2");\n    let c = closed("");\n    let owned_a = matches!(a, std::borrow::Cow::Owned(_));\n    let owned_b = matches!(b, std::borrow::Cow::Owned(_));\n    let owned_c = matches!(c, std::borrow::Cow::Owned(_));\n    println!("{} {} {}", owned_a, owned_b, owned_c);\n}',
          [
            'false true false',
            'true true true',
            'false false true',
            'false true true',
          ],
          3,
          'Only x = 1; already ends with a semicolon. The empty line does not end with one either, so it is edited and becomes Owned too.',
        ),
        choose(
          'A function calls result.to_mut() on its Borrowed result first, then adds a period only if one is missing. What changes compared with checking first?',
          [
            'Every input gets copied, even unchanged ones',
            'Nothing changes; to_mut never copies',
            'Only inputs missing the period get copied',
            "The caller's original str gets the period too",
          ],
          0,
          'to_mut copies whenever the Cow is Borrowed, so calling it unconditionally copies every input and loses what Cow saves.',
        ),
      ],
    },
  ],
  'rust-future-ready': [
    {
      title: 'Poll a ready future once',
      explanation: [
        'A future is a value that will eventually produce a result. Its poll method asks it to make progress and returns a std::task::Poll, which is Poll::Ready(value) once the result is available. std::future::ready(v) builds a future whose result v is available on the first poll.',
        'poll needs a Context, which a simple program makes with Context::from_waker(Waker::noop()), and it takes the future as Pin<&mut Self>. For a future like ready that does not care about being moved, Pin::new(&mut fut) is enough. poll is a method of the Future trait, so use std::future::Future; must be in scope.',
      ],
      example: {
        language: 'rust',
        code: 'use std::future::Future;\nuse std::pin::Pin;\nuse std::task::Context;\nuse std::task::Waker;\n\nfn main() {\n    let mut fut = std::future::ready(7);\n    let mut cx = Context::from_waker(Waker::noop());\n    let result = Pin::new(&mut fut).poll(&mut cx);\n    println!("{:?}", result);\n}',
        output: 'Ready(7)',
        explanation:
          'The first poll of a ready future returns its value wrapped in Poll::Ready, and Debug prints that as Ready(7).',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'use std::future::Future;\nuse std::pin::Pin;\nuse std::task::Context;\nuse std::task::Waker;\n\nfn main() {\n    let mut fut = std::future::ready(String::from("ok"));\n    let mut cx = Context::from_waker(Waker::noop());\n    println!("{:?}", Pin::new(&mut fut).poll(&mut cx));\n}',
          ['Ready(ok)', 'Ready("ok")', 'Some("ok")', '"ok"'],
          1,
          'poll returns Poll::Ready holding the String, and Debug shows the String in quotes inside Ready(...).',
        ),
        predictOutput(
          'What does this program print?',
          'use std::future::Future;\nuse std::pin::Pin;\nuse std::task::Context;\nuse std::task::Waker;\n\nfn main() {\n    let mut fut = std::future::ready((2, true));\n    let mut cx = Context::from_waker(Waker::noop());\n    let result = Pin::new(&mut fut).poll(&mut cx);\n    println!("{:?}", result);\n}',
          ['Ready((2, true))', 'Ready(2, true)', '(2, true)', 'Pending'],
          0,
          "The future's result is the whole tuple, so Ready wraps it and Debug shows both sets of parentheses.",
        ),
        choose(
          'This program does not compile. What is missing?',
          [
            'use std::task::Poll;, so Ready can be printed',
            'Wrapping 7 as Poll::Ready(7) before polling',
            'use std::future::Future;, so poll can be called',
            'Calling poll on fut directly, without Pin::new',
          ],
          2,
          'poll belongs to the Future trait, and a trait method can be called only when the trait is in scope.',
          'use std::pin::Pin;\nuse std::task::Context;\nuse std::task::Waker;\n\nfn main() {\n    let mut fut = std::future::ready(7);\n    let mut cx = Context::from_waker(Waker::noop());\n    let result = Pin::new(&mut fut).poll(&mut cx);\n    println!("{:?}", result);\n}',
        ),
        choose(
          'How many polls does it take to get the value out of std::future::ready(3)?',
          ['Two', 'Three', 'None; its value needs no polling', 'One'],
          3,
          'A ready future already has its value, so the first poll returns Poll::Ready(3). Without a poll, nothing hands the value out.',
        ),
      ],
    },
    {
      title: 'Tell Pending from Ready',
      explanation: [
        'Poll has two variants. Poll::Ready(value) carries the finished result. Poll::Pending means the future has not finished yet and carries no value at all, so there is nothing to take out of it.',
        'std::future::pending() makes a future that never finishes: every poll returns Pending. Code that polls must handle both variants, for example with a match on the Poll.',
      ],
      example: {
        language: 'rust',
        code: 'use std::future::Future;\nuse std::pin::Pin;\nuse std::task::Context;\nuse std::task::Poll;\nuse std::task::Waker;\n\nfn main() {\n    let mut cx = Context::from_waker(Waker::noop());\n    let mut never: std::future::Pending<i32> = std::future::pending();\n    match Pin::new(&mut never).poll(&mut cx) {\n        Poll::Ready(value) => println!("got {}", value),\n        Poll::Pending => println!("still waiting"),\n    }\n    println!("{:?}", Pin::new(&mut never).poll(&mut cx));\n}',
        output: 'still waiting\nPending',
        explanation:
          'The pending future never produces a value, so the match takes the Pending arm, and a second poll is Pending again. The type annotation says what the future would produce.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'use std::future::Future;\nuse std::pin::Pin;\nuse std::task::Context;\nuse std::task::Waker;\n\nfn main() {\n    let mut fut: std::future::Pending<u8> = std::future::pending();\n    let mut cx = Context::from_waker(Waker::noop());\n    println!("{:?}", Pin::new(&mut fut).poll(&mut cx));\n}',
          ['Pending(0)', 'Ready(0)', 'Pending', 'None'],
          2,
          'A pending future has no result yet, and Pending carries no value, so Debug prints just Pending.',
        ),
        predictOutput(
          'What does this program print?',
          'use std::future::Future;\nuse std::pin::Pin;\nuse std::task::Context;\nuse std::task::Poll;\nuse std::task::Waker;\n\nfn describe(p: Poll<i32>) -> String {\n    match p {\n        Poll::Ready(v) => format!("done: {}", v),\n        Poll::Pending => String::from("not yet"),\n    }\n}\n\nfn main() {\n    let mut cx = Context::from_waker(Waker::noop());\n    let mut a = std::future::ready(5);\n    let mut b = std::future::pending();\n    println!("{}", describe(Pin::new(&mut b).poll(&mut cx)));\n    println!("{}", describe(Pin::new(&mut a).poll(&mut cx)));\n}',
          [
            'done: 5\nnot yet',
            'not yet\ndone: 5',
            'not yet\nnot yet',
            'not yet\ndone: 0',
          ],
          1,
          'b is polled first and is Pending; a is a ready future, so its first poll is Ready(5).',
        ),
        choose(
          'Why does this match fail to compile?',
          [
            'A match on Poll needs a _ arm',
            'Pending must come before Ready',
            'Ready(v) needs a type annotation',
            'Pending has no value to bind to v',
          ],
          3,
          'Poll::Pending is a variant without data, so the pattern Pending(v) does not exist.',
          'fn take(p: std::task::Poll<i32>) -> i32 {\n    match p {\n        std::task::Poll::Ready(v) => v,\n        std::task::Poll::Pending(v) => v,\n    }\n}',
        ),
        predictOutput(
          'What does this program print?',
          'use std::future::Future;\nuse std::pin::Pin;\nuse std::task::Context;\nuse std::task::Poll;\nuse std::task::Waker;\n\nfn main() {\n    let mut cx = Context::from_waker(Waker::noop());\n    let mut fut: std::future::Pending<i32> = std::future::pending();\n    let mut waits = 0;\n    for _ in 0..3 {\n        if let Poll::Pending = Pin::new(&mut fut).poll(&mut cx) {\n            waits += 1;\n        }\n    }\n    println!("{}", waits);\n}',
          ['3', '1', '0', '2'],
          0,
          'A pending future never finishes, so each of the three polls returns Pending and waits is counted up three times.',
        ),
      ],
    },
    {
      title: 'Creating a future runs nothing until it is polled',
      explanation: [
        'Making a future only builds a value that describes work. None of that work runs until something calls poll, much like an iterator adapter that does nothing until the iterator is consumed. A future that is never polled never does its work.',
        'std::future::poll_fn(closure) builds a future whose poll simply calls the closure, which makes the timing visible: a println! in the closure appears only when poll is called, once per poll.',
      ],
      example: {
        language: 'rust',
        code: 'use std::future::Future;\nuse std::pin::Pin;\nuse std::task::Context;\nuse std::task::Poll;\nuse std::task::Waker;\n\nfn main() {\n    let mut fut = std::future::poll_fn(|_cx| {\n        println!("working");\n        Poll::Ready(10)\n    });\n    println!("future created");\n    let mut cx = Context::from_waker(Waker::noop());\n    let result = Pin::new(&mut fut).poll(&mut cx);\n    println!("{:?}", result);\n}',
        output: 'future created\nworking\nReady(10)',
        explanation:
          'Creating fut runs none of the closure, so future created prints first. The closure runs only during poll, printing working before Ready(10) is printed.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'use std::task::Poll;\n\nfn main() {\n    let fut = std::future::poll_fn(|_cx| {\n        println!("side effect");\n        Poll::Ready(1)\n    });\n    println!("end of main");\n}',
          [
            'side effect\nend of main',
            'end of main',
            'end of main\nside effect',
            'Ready(1)\nend of main',
          ],
          1,
          "fut is created but never polled, so its closure never runs and only main's own line prints.",
        ),
        predictOutput(
          'What does this program print?',
          'use std::future::Future;\nuse std::pin::Pin;\nuse std::task::Context;\nuse std::task::Poll;\nuse std::task::Waker;\n\nfn main() {\n    let mut fut = std::future::poll_fn(|_cx| {\n        println!("poll");\n        Poll::Pending\n    });\n    let mut cx = Context::from_waker(Waker::noop());\n    let first: Poll<i32> = Pin::new(&mut fut).poll(&mut cx);\n    let second: Poll<i32> = Pin::new(&mut fut).poll(&mut cx);\n    println!("{:?} {:?}", first, second);\n}',
          [
            'poll\nPending Pending',
            'Pending Pending',
            'poll\npoll\nPending Pending',
            'Pending Pending\npoll\npoll',
          ],
          2,
          'Each call to poll runs the closure again, so poll prints twice before the two Pending results are printed.',
        ),
        choose(
          'A program builds a future with poll_fn but never calls poll on it. When does the closure inside run?',
          [
            'It never runs, since nothing polls it',
            'It runs once, when the future is created',
            'It runs automatically at the end of main',
            'It runs when the future goes out of scope',
          ],
          0,
          'A future does its work only inside poll. With no poll, the closure is stored but never called.',
        ),
        predictOutput(
          'What does this program print?',
          'use std::future::Future;\nuse std::pin::Pin;\nuse std::task::Context;\nuse std::task::Poll;\nuse std::task::Waker;\n\nfn main() {\n    let mut a = std::future::poll_fn(|_cx| {\n        println!("a runs");\n        Poll::Ready(1)\n    });\n    let mut b = std::future::poll_fn(|_cx| {\n        println!("b runs");\n        Poll::Ready(2)\n    });\n    let mut cx = Context::from_waker(Waker::noop());\n    let second = Pin::new(&mut b).poll(&mut cx);\n    let first = Pin::new(&mut a).poll(&mut cx);\n    println!("{:?} {:?}", first, second);\n}',
          [
            'a runs\nb runs\nReady(1) Ready(2)',
            'b runs\na runs\nReady(2) Ready(1)',
            'Ready(1) Ready(2)',
            'b runs\na runs\nReady(1) Ready(2)',
          ],
          3,
          'Work runs in the order the futures are polled, not created, so b runs first. The final line prints first, then second.',
        ),
      ],
    },
    {
      title: 'Turn one poll into an Option',
      explanation: [
        'To use a single poll result in ordinary code, match on it: Ready(value) becomes Some(value), and Pending becomes None, because no value exists yet.',
        'A future that has returned Ready is finished. Polling std::future::ready a second time panics with Ready polled after completion, so poll it once and keep the value.',
      ],
      example: {
        language: 'rust',
        code: 'use std::future::Future;\nuse std::pin::Pin;\nuse std::task::Context;\nuse std::task::Poll;\nuse std::task::Waker;\n\nfn ready_doubled(n: i32) -> Option<i32> {\n    let mut fut = std::future::ready(n * 2);\n    let mut cx = Context::from_waker(Waker::noop());\n    match Pin::new(&mut fut).poll(&mut cx) {\n        Poll::Ready(value) => Some(value),\n        Poll::Pending => None,\n    }\n}\n\nfn never_ready() -> Option<i32> {\n    let mut fut = std::future::pending();\n    let mut cx = Context::from_waker(Waker::noop());\n    match Pin::new(&mut fut).poll(&mut cx) {\n        Poll::Ready(value) => Some(value),\n        Poll::Pending => None,\n    }\n}\n\nfn main() {\n    println!("{:?} {:?}", ready_doubled(4), never_ready());\n}',
        output: 'Some(8) None',
        explanation:
          'The ready future gives Ready(8) on its first poll, which becomes Some(8). The pending future gives Pending, which becomes None.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'use std::future::Future;\nuse std::pin::Pin;\nuse std::task::Context;\nuse std::task::Poll;\nuse std::task::Waker;\n\nfn first_poll(text: &str) -> Option<usize> {\n    let mut fut = std::future::ready(text.len());\n    let mut cx = Context::from_waker(Waker::noop());\n    match Pin::new(&mut fut).poll(&mut cx) {\n        Poll::Ready(n) => Some(n),\n        Poll::Pending => None,\n    }\n}\n\nfn main() {\n    println!("{:?}", first_poll("async"));\n}',
          ['Some(5)', 'Ready(5)', 'None', '5'],
          0,
          'The ready future returns Ready(5) on its first poll, and the match turns that into Some(5).',
        ),
        predictOutput(
          'What does this program print?',
          'use std::future::Future;\nuse std::pin::Pin;\nuse std::task::Context;\nuse std::task::Poll;\nuse std::task::Waker;\n\nfn poll_never() -> Option<u32> {\n    let mut fut: std::future::Pending<u32> = std::future::pending();\n    let mut cx = Context::from_waker(Waker::noop());\n    match Pin::new(&mut fut).poll(&mut cx) {\n        Poll::Ready(value) => Some(value),\n        Poll::Pending => None,\n    }\n}\n\nfn main() {\n    println!("{:?}", poll_never());\n}',
          ['Some(0)', 'Pending', 'None', 'Ready(None)'],
          2,
          'The poll returns Pending, which has no value, so the function returns None.',
        ),
        choose(
          'What happens when this program runs?',
          [
            'It prints Ready(3) Ready(3)',
            'It prints Ready(3) Pending',
            'It prints Pending Ready(3)',
            'It panics: Ready polled after completion',
          ],
          3,
          'The first poll hands out the value and finishes the future, so polling it again panics.',
          'use std::future::Future;\nuse std::pin::Pin;\nuse std::task::Context;\nuse std::task::Waker;\n\nfn main() {\n    let mut fut = std::future::ready(3);\n    let mut cx = Context::from_waker(Waker::noop());\n    let first = Pin::new(&mut fut).poll(&mut cx);\n    let second = Pin::new(&mut fut).poll(&mut cx);\n    println!("{:?} {:?}", first, second);\n}',
        ),
        choose(
          'A poll returns Poll::Pending. What should a function that reports the poll result as an Option return?',
          [
            'Some(0)',
            'None',
            'Some(Pending)',
            'Nothing; it must panic instead',
          ],
          1,
          'Pending means no value exists yet, which is exactly what None says. Some(0) would invent a value.',
        ),
      ],
    },
  ],
};
