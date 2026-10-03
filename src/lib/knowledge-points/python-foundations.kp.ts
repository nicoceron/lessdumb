import { choose, predictOutput, type KnowledgePointModule } from '.';

export const knowledgePoints: KnowledgePointModule = {
  'print-output': [
    {
      title: 'Print one line of text',
      explanation: [
        'print() writes a value to the output. Text between matching quotes is a string; the quotes mark where the text starts and ends and are not printed.',
      ],
      example: {
        code: 'print("Hello, Python!")',
        output: 'Hello, Python!',
        explanation:
          'The string inside the quotes is Hello, Python!, so exactly that text appears, without quotes.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'print("Ready")',
          ['"Ready"', 'Ready', 'print("Ready")', 'Nothing'],
          1,
          'The quotes delimit the string; print() shows only its characters.',
        ),
        predictOutput(
          'What does this program print?',
          "print('Good morning')",
          ['Good morning', "'Good morning'", 'Good', 'Goodmorning'],
          0,
          'Single quotes also delimit a string, and the space inside it is kept.',
        ),
        choose(
          'Which statement prints the text Done?',
          ['print(Done)', 'print("Done")', 'Print("Done")', '"Done"'],
          1,
          'The text must be a quoted string, and the function name is lowercase print.',
        ),
        predictOutput(
          'What does this program print?',
          'print("3 + 4")',
          ['7', '3 + 4', '"3 + 4"', '34'],
          1,
          'Inside quotes, 3 + 4 is just text, so Python prints the characters instead of adding.',
        ),
      ],
    },
    {
      title: 'Run statements from top to bottom',
      explanation: [
        'Python runs statements one at a time, from the top of the file to the bottom. Each print() call ends its output with a new line, so consecutive calls print on separate lines.',
      ],
      example: {
        code: 'print("Hello, Python!")\nprint("One small step.")',
        output: 'Hello, Python!\nOne small step.',
        explanation:
          'The first statement runs first and ends its line; the second statement prints on the next line.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'print("first")\nprint("second")',
          ['first\nsecond', 'second\nfirst', 'first second', 'firstsecond'],
          0,
          'Statements run in source order, and each print() ends with a new line.',
        ),
        predictOutput(
          'What does this program print?',
          'print("C")\nprint("A")\nprint("B")',
          ['A\nB\nC', 'C\nA\nB', 'CAB', 'B\nA\nC'],
          1,
          'Python does not sort output; it prints in the order the statements appear.',
        ),
        predictOutput(
          'What does this program print?',
          'print("Ready")\nprint("Set")\nprint("Go!")',
          ['Ready Set Go!', 'Go!\nSet\nReady', 'Ready\nSet\nGo!', 'Ready\nGo!'],
          2,
          'Three print() calls produce three lines, top to bottom.',
        ),
        choose(
          'A program has two print() calls. How many lines does it output?',
          ['One', 'Two', 'It depends on the text length', 'None until it ends'],
          1,
          'Each print() call ends its output with a new line, so two calls give two lines.',
        ),
      ],
    },
  ],
};
