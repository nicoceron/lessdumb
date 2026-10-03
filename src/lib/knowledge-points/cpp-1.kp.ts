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
};
