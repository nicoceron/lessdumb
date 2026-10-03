import { choose, predictOutput, type KnowledgePointModule } from '.';

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
  ],
};
