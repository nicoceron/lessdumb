import { choose, predictOutput, type KnowledgePointModule } from './authoring';

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
  variables: [
    {
      title: 'Store a value under a name and use it',
      explanation: [
        'An assignment such as level = 4 stores the value on the right under the name on the left. The = sign means “assign”: it gives the name a value.',
        'After the assignment, writing the name without quotes stands for its value, so print(level) prints 4. With quotes, "level" is just text, and print("level") prints the word level.',
      ],
      example: {
        code: 'city = "Lima"\nprint(city)\nprint("city")',
        output: 'Lima\ncity',
        explanation:
          'The bare name city is replaced by its value, Lima. The quoted "city" is ordinary text, so it prints as written.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'fruit = "mango"\nprint(fruit)',
          ['fruit', '"mango"', 'mango', 'fruit = mango'],
          2,
          'print(fruit) uses the value stored under fruit, and print() never shows the quotes of a string.',
        ),
        predictOutput(
          'What is printed?',
          'total = 12\nprint("total")',
          ['12', 'total', '"total"', 'total = 12'],
          1,
          'The quotes make "total" plain text, so print() shows the word instead of the variable’s value.',
        ),
        choose(
          'Which line stores the number 7 under the name lives?',
          ['lives = 7', '7 = lives', '"lives" = 7', 'print(lives = 7)'],
          0,
          'The name goes on the left of = and the value on the right.',
        ),
        predictOutput(
          'What is the output?',
          'greeting = "Hi there"\nplace = "home"\nprint(place)\nprint(greeting)',
          [
            'Hi there\nhome',
            'place\ngreeting',
            'home\ngreeting',
            'home\nHi there',
          ],
          3,
          'The prints run in order, place first, and each bare name is replaced by its value.',
        ),
      ],
    },
    {
      title: 'Choose valid variable names',
      explanation: [
        'A variable name may contain letters, digits, and underscores, but it cannot start with a digit and cannot contain spaces or hyphens. Names are case-sensitive: total and Total are two different names.',
        'Python style writes multiword names in lowercase with underscores between the words, such as high_score.',
      ],
      example: {
        code: 'player_1 = "Kim"\nhigh_score = 40\nprint(player_1)\nprint(high_score)',
        output: 'Kim\n40',
        explanation:
          'Both names use only letters, digits, and underscores, and neither starts with a digit, so both assignments work.',
      },
      questions: [
        choose(
          'Which of these names would Python reject?',
          ['total2', '_count', 'max_speed', '3rd_try'],
          3,
          'A name cannot begin with a digit. Digits are fine later in the name, and underscores are allowed anywhere.',
        ),
        choose(
          'Which name follows the usual Python style for “number of guests”?',
          [
            'NumberOfGuests',
            'number_of_guests',
            'numberofguests',
            'number-of-guests',
          ],
          1,
          'Python style uses lowercase words joined by underscores. A hyphen is not allowed in a name at all.',
        ),
        choose(
          'Why can’t total-cost be used as a variable name?',
          [
            'It contains a hyphen',
            'It has two words',
            'It does not start with a capital letter',
            'It contains no digit',
          ],
          0,
          'Hyphens are not allowed in names; total_cost, with an underscore, is a valid two-word name.',
        ),
        predictOutput(
          'What does this program print?',
          'color = "red"\nColor = "blue"\nprint(color)',
          ['blue', 'Color', 'red', 'red\nblue'],
          2,
          'color and Color are different names, so the second assignment does not change color.',
        ),
      ],
    },
    {
      title: 'Update a variable from its old value',
      explanation: [
        'Assigning to a name that already has a value replaces the old value. In score = score + 2, Python first evaluates the right side using the current score, then stores the result back in score.',
        'Because statements run from top to bottom, a print() shows whatever value the name holds at that moment.',
      ],
      example: {
        code: 'coins = 10\nprint(coins)\ncoins = coins + 5\nprint(coins)',
        output: '10\n15',
        explanation:
          'The first print runs while coins is 10. The update computes 10 + 5 and stores 15, which the second print shows.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'steps = 100\nsteps = steps + 50\nprint(steps)',
          ['100', '150', 'steps + 50', '50'],
          1,
          'The right side uses the old value: 100 + 50 is 150, which replaces 100.',
        ),
        predictOutput(
          'What is printed?',
          'level = 1\nlevel = 5\nlevel = 3\nprint(level)',
          ['1', '9', '5', '3'],
          3,
          'Each assignment replaces the previous value; values are not added together, so the last one, 3, remains.',
        ),
        choose(
          'What does Python do first when it runs points = points + 1?',
          [
            'Checks whether points equals points + 1',
            'Sets points to 0 before adding',
            'Evaluates points + 1 using the current value',
            'Creates a second name called points',
          ],
          2,
          'The right side is evaluated first with the current value; only then is the result assigned to points.',
        ),
        predictOutput(
          'What is the output?',
          'total = 4\nprint(total)\ntotal = total + total\nprint(total)',
          ['4\n8', '8\n8', '4\n4', '8\n16'],
          0,
          'The first print runs before the update, so it shows 4. Then 4 + 4 is stored, and the second print shows 8.',
        ),
      ],
    },
    {
      title: 'Track several names line by line',
      explanation: [
        'backup = level gives backup the value level has at that moment. Reassigning level afterwards changes only level; backup keeps the value it received.',
        'To predict a program with several names, go line by line and write down each name’s current value after every assignment.',
      ],
      example: {
        code: 'start = 20\ncurrent = start\ncurrent = current + 5\nprint(start)\nprint(current)',
        output: '20\n25',
        explanation:
          'current starts with the value 20 from start. Updating current to 25 does not change start, which is still 20.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'a = 3\nb = a\na = 10\nprint(a)\nprint(b)',
          ['10\n10', '3\n3', '10\n3', '3\n10'],
          2,
          'b received 3 when b = a ran. Reassigning a to 10 later does not change b.',
        ),
        predictOutput(
          'What is printed?',
          'left = "L"\nright = "R"\ntemp = left\nleft = right\nright = temp\nprint(left)\nprint(right)',
          ['R\nL', 'L\nR', 'R\nR', 'L\nL'],
          0,
          'temp keeps the old left value, L, so after left takes R, right can take L from temp: the values are swapped.',
        ),
        predictOutput(
          'What is the output?',
          'x = 5\ny = x + 1\nx = y + 1\nprint(x)',
          ['5', '6', '8', '7'],
          3,
          'y becomes 5 + 1, which is 6. Then x becomes 6 + 1, which is 7.',
        ),
        choose(
          'A program runs backup = level, then level = 9. What does backup hold afterwards?',
          [
            '9, because backup follows level',
            'The value level had when backup was assigned',
            'Nothing, because level was reassigned',
            'The text level',
          ],
          1,
          'Assignment gives backup the value level had at that moment; later changes to level do not affect it.',
        ),
      ],
    },
  ],
  numbers: [
    {
      title: 'Add, subtract, multiply, and divide',
      explanation: [
        'Integers such as 7 are whole numbers; floats such as 2.5 have a decimal point. The operators +, -, *, and / add, subtract, multiply, and divide.',
        'Division with / always produces a float, even when the result is whole: 8 / 2 is 4.0. When an int and a float are combined, the result is also a float.',
      ],
      example: {
        code: 'width = 6\nheight = 4\nprint(width * height)\nprint(width / 2)\nprint(width - height)',
        output: '24\n3.0\n2',
        explanation:
          'Multiplying and subtracting two integers gives integers. Dividing with / gives the float 3.0, even though 6 divides evenly by 2.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'print(12 / 4)',
          ['3', '8', '3.0', '48'],
          2,
          '/ always produces a float, so an exact division still prints with .0.',
        ),
        predictOutput(
          'What is printed?',
          'apples = 7\npears = 3\nprint(apples - pears)\nprint(apples / 2)',
          ['4\n3', '4\n3.5', '4.0\n3.5', '10\n3.5'],
          1,
          'Subtracting two integers gives the integer 4; 7 / 2 is the float 3.5, not a rounded whole number.',
        ),
        choose(
          'Which of these expressions produces a float?',
          ['9 + 1', '9 * 1', '9 - 1', '9 / 1'],
          3,
          'Only / always returns a float; +, -, and * on two integers give an integer.',
        ),
        predictOutput(
          'What is the output?',
          'price = 2.5\ncount = 4\nprint(price * count)',
          ['10.0', '10', '6.5', '8.0'],
          0,
          'price is a float, so the product is a float: 10.0.',
        ),
      ],
    },
    {
      title: 'Split a number into full groups and a remainder',
      explanation: [
        '// is floor division: it counts how many complete groups fit, so 17 // 5 is 3. % gives the remainder left after those groups, so 17 % 5 is 2.',
        'Together they split a quantity into full groups and what is left over. For a whole number n, n % 2 is 0 when n is even and 1 when it is odd.',
      ],
      example: {
        code: 'eggs = 50\ncartons = eggs // 12\nextra = eggs % 12\nprint(cartons)\nprint(extra)',
        output: '4\n2',
        explanation:
          'Four full cartons hold 48 eggs, so 50 // 12 is 4 and the remaining 50 - 48 eggs give 50 % 12 = 2.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'print(38 // 5)',
          ['7.6', '7', '8', '3'],
          1,
          'Five fits into 38 seven complete times; // drops the fraction instead of rounding up.',
        ),
        predictOutput(
          'What is printed?',
          'print(45 % 7)',
          ['6', '4', '0', '3'],
          3,
          'Six groups of 7 make 42, and 45 - 42 leaves a remainder of 3.',
        ),
        predictOutput(
          'What is the output?',
          'people = 14\nper_car = 4\nprint(people // per_car)\nprint(people % per_car)',
          ['3\n2', '3.5\n2', '4\n2', '2\n3'],
          0,
          'Three full cars carry 12 people, so // gives 3 and % gives the 2 people left over.',
        ),
        choose(
          'n holds a whole number. What does n % 2 tell you?',
          [
            'Half of n',
            'n rounded down to an even number',
            'Whether n is even (0) or odd (1)',
            'How many times 2 fits into n',
          ],
          2,
          'The remainder after dividing by 2 is 0 for even numbers and 1 for odd ones; n // 2 would count the groups.',
        ),
        predictOutput(
          'What does this program print?',
          'print(4 % 10)',
          ['0', '4', '6', '2.5'],
          1,
          'Ten fits into 4 zero times, so the whole 4 is left over as the remainder.',
        ),
      ],
    },
    {
      title: 'Use powers and control the order of operations',
      explanation: [
        '** raises a number to a power: 2 ** 3 is 8. In an expression with several operators, ** is done first, then *, /, //, and %, and finally + and -.',
        'Parentheses override that order, because Python evaluates what is inside them first. Add them whenever the grouping you mean is not the default.',
      ],
      example: {
        code: 'side = 3\nprint(side ** 2)\nprint(2 + side * 4)\nprint((2 + side) * 4)',
        output: '9\n14\n20',
        explanation:
          '3 ** 2 is 9. Without parentheses, side * 4 happens first: 2 + 12 is 14. With parentheses, 2 + 3 happens first: 5 * 4 is 20.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'print(4 + 6 / 2)',
          ['5.0', '7.0', '7', '5'],
          1,
          'Division happens before addition: 6 / 2 is 3.0, and 4 + 3.0 is the float 7.0.',
        ),
        predictOutput(
          'What is printed?',
          'print(3 ** 2 + 1)',
          ['10', '27', '7', '16'],
          0,
          'The power is computed first: 3 ** 2 is 9, then 9 + 1 is 10.',
        ),
        predictOutput(
          'What is the output?',
          'base = 5\nbonus = 3\nprint((base + bonus) * 2)\nprint(base + bonus * 2)',
          ['16\n16', '11\n16', '11\n11', '16\n11'],
          3,
          'The parentheses make 5 + 3 happen first, giving 16. Without them, 3 * 2 happens first, giving 5 + 6 = 11.',
        ),
        choose(
          'Which expression computes the average of 8 and 12 as 10.0?',
          ['8 + 12 / 2', '8 + (12 / 2)', '(8 + 12) / 2', '(8 + 12) // 2'],
          2,
          'The sum must be grouped before dividing, and / gives the float 10.0; // would give the integer 10.',
        ),
      ],
    },
  ],
  strings: [
    {
      title: 'Join and repeat strings',
      explanation: [
        'A string is a sequence of characters. + joins two strings exactly as written, so it adds no space: include one yourself when you need it. Both sides must be strings; joining a string and a number with + raises a TypeError.',
        'Multiplying a string by a whole number repeats it: "na" * 2 is "nana".',
      ],
      example: {
        code: 'first = "Grace"\nlast = "Hopper"\nprint(first + " " + last)\nprint(first + last)',
        output: 'Grace Hopper\nGraceHopper',
        explanation:
          'The first line joins three strings, including a one-space string. The second joins only the two names, so there is no space between them.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'word = "sun"\nprint(word + "flower")',
          ['sun flower', 'word flower', 'sunflower', 'wordflower'],
          2,
          'word holds sun, and + joins the strings without adding a space.',
        ),
        predictOutput(
          'What is printed?',
          'a = "12"\nb = "30"\nprint(a + b)',
          ['1230', '42', '12 30', '3012'],
          0,
          'Both values are strings because of the quotes, so + joins their characters instead of adding numbers.',
        ),
        predictOutput(
          'What is the output?',
          'line = "-" * 5\nprint(line + "|")',
          ['-5|', '-----|', '-|-|-|-|-|', '-----'],
          1,
          '"-" * 5 repeats the dash five times; then + adds one bar at the end.',
        ),
        choose(
          'count holds the number 3. Why does "Total: " + count fail?',
          [
            'Strings cannot contain a colon',
            'The space after the colon is not allowed',
            'count must be written as "count"',
            '+ can join a string only with another string',
          ],
          3,
          'count is a number, and + cannot join a string with a number. Writing "count" would just add the word count.',
        ),
      ],
    },
    {
      title: 'Count characters with len()',
      explanation: [
        'len(text) returns how many characters a string has. Every character counts: letters, digits, punctuation, and spaces. The empty string "" has length 0.',
      ],
      example: {
        code: 'city = "New York"\nprint(len(city))\nprint(len(""))',
        output: '8\n0',
        explanation:
          'New York has seven letters plus one space, so its length is 8. The empty string has no characters.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'print(len("ice cream"))',
          ['8', '2', '10', '9'],
          3,
          'There are eight letters and one space, and the space counts as a character.',
        ),
        predictOutput(
          'What is printed?',
          'print(len("12") + len("345"))',
          ['357', '5', '12345', '2'],
          1,
          'len() returns numbers, 2 and 3, and + adds them. The digits inside the strings are not used as numbers.',
        ),
        predictOutput(
          'What is the output?',
          'word = "  hi  "\nprint(len(word))',
          ['6', '2', '4', '3'],
          0,
          'The two letters are surrounded by two spaces on each side, and every space counts.',
        ),
        choose(
          'Which string has a length of 0?',
          ['" "', '"0"', '""', '"empty"'],
          2,
          'Only "" has no characters. A space and the digit 0 are each one character.',
        ),
      ],
    },
    {
      title: 'Insert values with f-strings',
      explanation: [
        'An f-string has f right before the opening quote. Each expression inside braces is evaluated, and its value is placed into the text, so numbers can be inserted without any conversion.',
        'Text outside the braces is kept exactly as written. Without the f, the braces and the names inside them are printed as ordinary characters.',
      ],
      example: {
        code: 'item = "lamp"\nprice = 18\nprint(f"The {item} costs {price} dollars")\nprint(f"Two of them: {price + price}")',
        output: 'The lamp costs 18 dollars\nTwo of them: 36',
        explanation:
          'Each pair of braces is replaced by the value of its expression; price + price is evaluated to 36 before it is inserted.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'team = "Owls"\nprint("Go {team}!")',
          ['Go Owls!', 'Go team!', 'Go {Owls}!', 'Go {team}!'],
          3,
          'There is no f before the quote, so this is an ordinary string and the braces are printed as written.',
        ),
        predictOutput(
          'What is printed?',
          'a = 7\nb = 5\nprint(f"{a} + {b} = {a + b}")',
          ['7 + 5 = 12', '7 + 5 = 75', '7 + 5 = 7 + 5', '{a} + {b} = 12'],
          0,
          'Each brace is evaluated: a is 7, b is 5, and a + b adds the two numbers to 12. The + outside the braces is plain text.',
        ),
        predictOutput(
          'What is the output?',
          'name = "Olivia"\nprint(f"{name} has {len(name)} letters")',
          [
            'Olivia has 5 letters',
            'name has 6 letters',
            'Olivia has 6 letters',
            'Olivia has len(name) letters',
          ],
          2,
          'Any expression can go inside braces; len(name) is evaluated to 6.',
        ),
        choose(
          'score holds the number 9. Which line prints Score: 9?',
          [
            'print("Score: " + score)',
            'print(f"Score: {score}")',
            'print("Score: {score}")',
            'print(f"Score: score")',
          ],
          1,
          'The f-string evaluates score inside the braces. Without f the braces are literal, without braces the word is literal, and + cannot join a number.',
        ),
      ],
    },
  ],
  types: [
    {
      title: 'Tell int, float, str, and bool values apart',
      explanation: [
        'Every value has a type. int is a whole number such as 42, float is a number with a decimal point such as 4.2 or 3.0, str is text in quotes, and bool is one of the two values True and False.',
        'The quotes decide: "42" is a str even though its characters are digits, so + joins it like any other text instead of adding.',
      ],
      example: {
        code: 'a = "5"\nb = 5\nprint(a + a)\nprint(b + b)',
        output: '55\n10',
        explanation:
          'a is the str "5", so + joins two copies of the text. b is the int 5, so + adds the numbers.',
      },
      questions: [
        choose(
          'What is the type of the value 3.0?',
          ['int', 'float', 'str', 'bool'],
          1,
          'The decimal point makes it a float, even though its value is whole.',
        ),
        choose(
          'Which of these values is a str?',
          ['True', '7.5', '"True"', '75'],
          2,
          'Quotes make a str, even around the word True. Without quotes, True is a bool.',
        ),
        predictOutput(
          'What does this program print?',
          'count = "8"\nprint(count * 2)',
          ['88', '16', '8 8', '"88"'],
          0,
          'count is the text "8", so * 2 repeats the text instead of multiplying a number.',
        ),
        predictOutput(
          'What is printed?',
          'a = 1.5\nb = 2\nprint(a + b)\nprint(b + b)',
          ['3.5\n4.0', '3\n4', '1.52\n22', '3.5\n4'],
          3,
          'A float plus an int gives the float 3.5, while two ints add to the int 4.',
        ),
      ],
    },
    {
      title: 'Convert text to numbers with int() and float()',
      explanation: [
        'int(text) turns a string of digits into an integer, and float(text) turns text such as "2.5" into a float. After converting, + adds instead of joining.',
        'The conversion fails with ValueError when the text does not fit the type: int("ten") fails, and so does int("2.5"), because 2.5 is not written as a whole number. float("2.5") works.',
      ],
      example: {
        code: 'a = "40"\nb = "2"\nprint(a + b)\nprint(int(a) + int(b))\nprint(float(b) / 4)',
        output: '402\n42\n0.5',
        explanation:
          'Joining the two strings gives 402. Converted to ints, they add to 42. float(b) is 2.0, and 2.0 / 4 is 0.5.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'stock = "15"\nprint(int(stock) * 2)',
          ['1515', '30', '17', '30.0'],
          1,
          'int(stock) is the integer 15, so * 2 multiplies it to 30 instead of repeating text.',
        ),
        choose(
          'Which conversion raises ValueError?',
          ['float("3")', 'int("40")', 'float("4.5")', 'int("4.5")'],
          3,
          'int() needs text written as a whole number; "4.5" has a decimal point. float() accepts both "3" and "4.5".',
        ),
        predictOutput(
          'What is the output?',
          'height = "1.75"\nprint(float(height) + 1)',
          ['2.75', '1.751', '2.0', '2'],
          0,
          'float(height) is 1.75, and adding 1 gives 2.75.',
        ),
        predictOutput(
          'What does this program print?',
          'a = "6"\nb = "3"\nprint(int(a) / int(b))\nprint(float(b))',
          ['2\n3', '63\n3.0', '2.0\n3.0', '2.0\n3'],
          2,
          '6 / 3 uses /, which always gives a float, 2.0. float("3") is also a float, 3.0.',
        ),
      ],
    },
    {
      title: 'Convert numbers to text with str()',
      explanation: [
        'str(value) turns a number into text, so + can join it to other strings: "Room " + str(12) is "Room 12". Without str(), "Room " + 12 raises a TypeError.',
        'Convert in the direction the operation needs: to a number when you want arithmetic, to a string when you want to join text.',
      ],
      example: {
        code: 'laps = 3\nmessage = "Laps: " + str(laps)\nprint(message)\nprint(str(laps) + str(laps))',
        output: 'Laps: 3\n33',
        explanation:
          'str(laps) is the text "3", which can be joined to "Laps: ". Joining two copies of "3" gives 33, not 6.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'a = 2\nb = "2"\nprint(str(a) + b)\nprint(a + int(b))',
          ['4\n22', '22\n4', '4\n4', '22\n22'],
          1,
          'The first line joins two strings into 22; the second adds two integers to get 4.',
        ),
        predictOutput(
          'What is printed?',
          'text = "7"\ntotal = int(text) + 3\nprint(str(total) + " points")',
          ['73 points', '10points', 'total points', '10 points'],
          3,
          'int(text) + 3 is 10; str(total) turns it into text, which is joined to " points", including its leading space.',
        ),
        choose(
          'age holds the integer 30. Which expression builds the string "Age 30"?',
          [
            '"Age " + str(age)',
            '"Age " + age',
            '"Age " + "age"',
            'int("Age ") + age',
          ],
          0,
          'str(age) converts 30 to text so + can join it. "age" in quotes would add the word age.',
        ),
        choose(
          'What happens when Python evaluates "Room " + 12?',
          [
            'It produces Room 12',
            'It produces Room12',
            'It raises a TypeError',
            'It raises a ValueError',
          ],
          2,
          '+ cannot join a str and an int, which is a TypeError. ValueError is for content that cannot be converted, such as int("ten").',
        ),
      ],
    },
  ],
  comparisons: [
    {
      title: 'Test equality with == and !=',
      explanation: [
        '== asks whether two values are equal and produces a bool, True or False. != asks whether they are different. Do not confuse == with =, which assigns a value to a name.',
        'Numbers compare by value, so 2 == 2.0 is True, but a number never equals a string: 4 == "4" is False. Strings must match exactly, including uppercase and lowercase letters.',
      ],
      example: {
        code: 'code = 1234\nprint(code == 1234)\nprint(code != 1234)\nprint(code == "1234")',
        output: 'True\nFalse\nFalse',
        explanation:
          'code equals 1234, so == is True and != is False. The quoted "1234" is a string, which never equals the number.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'a = 10\nb = 5 + 5\nprint(a == b)\nprint(a != b)',
          ['True\nTrue', 'False\nTrue', 'True\nFalse', '10\n10'],
          2,
          'b is 10, so the values are equal: == is True and != is False.',
        ),
        predictOutput(
          'What is printed?',
          'answer = "yes"\nprint(answer == "Yes")\nprint(answer != "Yes")',
          ['True\nFalse', 'False\nTrue', 'True\nTrue', 'False\nFalse'],
          1,
          'yes and Yes differ in their first letter, so they are not equal.',
        ),
        choose(
          'Which expression asks whether total equals 100?',
          ['total = 100', 'total != 100', '100 = total', 'total == 100'],
          3,
          '== compares; a single = would assign 100 to total instead of asking a question.',
        ),
        predictOutput(
          'What is the output?',
          'x = 3\nprint(x * 2 == 6.0)\nprint(x * 2 == "6")',
          ['True\nFalse', 'False\nFalse', 'True\nTrue', 'False\nTrue'],
          0,
          'The int 6 equals the float 6.0 because numbers compare by value, but it never equals the string "6".',
        ),
      ],
    },
    {
      title: 'Compare order and check the boundary',
      explanation: [
        '<, >, <=, and >= compare order. < and > are strict, so they are False when both sides are equal. <= and >= include the boundary.',
        'Say the rule in words first: “at least 18” is age >= 18, and “under 13” is age < 13. Then check the boundary value itself, because that is where the two forms disagree.',
      ],
      example: {
        code: 'limit = 50\nspeed = 50\nprint(speed > limit)\nprint(speed >= limit)\nprint(speed < limit + 1)',
        output: 'False\nTrue\nTrue',
        explanation:
          'At exactly the limit, the strict > is False while >= is True. limit + 1 is computed first, and 50 < 51 is True.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'temp = 0\nprint(temp < 0)\nprint(temp <= 0)',
          ['True\nTrue', 'False\nFalse', 'True\nFalse', 'False\nTrue'],
          3,
          '0 is not less than 0, so < is False; <= includes the boundary, so it is True.',
        ),
        choose(
          'A ride is for children who are at most 12 years old. Which condition matches?',
          ['age < 12', 'age > 12', 'age <= 12', 'age >= 12'],
          2,
          '“At most 12” includes 12 itself, so the comparison needs <=.',
        ),
        predictOutput(
          'What is printed?',
          'print(9 // 2 > 4)',
          ['True', 'False', '4', '4.5'],
          1,
          '9 // 2 is 4, and 4 > 4 is False because > excludes the boundary.',
        ),
        choose(
          'Shipping is free for orders over 25 dollars. Which order total best reveals a mix-up between > and >=?',
          ['25', '0', '100', '26.5'],
          0,
          'Only the boundary value, 25, gets different results from total > 25 and total >= 25.',
        ),
      ],
    },
    {
      title: 'Store and use True or False results',
      explanation: [
        'A comparison is an expression whose value is a bool. You can store it in a variable, print it, or put it in an f-string. True and False are not text: passed = "True" stores a string, while passed = score >= 60 stores a bool.',
        'Arithmetic on each side happens before the comparison, so n % 2 == 0 first computes n % 2 and then compares the result with 0.',
      ],
      example: {
        code: 'score = 72\npassed = score >= 60\nprint(passed)\nprint(f"Passed: {passed}")',
        output: 'True\nPassed: True',
        explanation:
          'score >= 60 is True, and that bool is stored in passed. Printing it, alone or in an f-string, shows True.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'n = 15\nis_even = n % 2 == 0\nprint(is_even)',
          ['True', '1', 'False', '0'],
          2,
          '15 % 2 is 1, and 1 == 0 is False; the variable stores that bool, not the remainder.',
        ),
        predictOutput(
          'What is printed?',
          'word = "planet"\nlong_word = len(word) > 6\nprint(f"{word}: {long_word}")',
          ['planet: True', 'planet: 6', 'word: False', 'planet: False'],
          3,
          'planet has 6 letters, and 6 > 6 is False.',
        ),
        choose(
          'Which assignment stores a bool rather than a string?',
          [
            'ready = count > 0',
            'ready = "True"',
            'ready = "count > 0"',
            'ready = str(count > 0)',
          ],
          0,
          'The comparison itself produces True or False. The other options are all strings because of quotes or str().',
        ),
        predictOutput(
          'What is the output?',
          'a = 4\nb = 9\nprint(a * 2 != b)\nprint(b - a > 5)',
          ['False\nTrue', 'True\nFalse', 'True\nTrue', '8\n5'],
          1,
          '8 is not equal to 9, so != is True. 9 - 4 is 5, and 5 > 5 is False.',
        ),
      ],
    },
  ],
  'boolean-logic': [
    {
      title: 'Combine conditions with and and or',
      explanation: [
        'and is True only when both conditions are True. or is True when at least one condition is True, so it is False only when both are False.',
        'Each side is usually a small comparison or a bool variable, as in age >= 18 and has_ticket.',
      ],
      example: {
        code: 'age = 15\nhas_pass = True\nprint(age >= 18 and has_pass)\nprint(age >= 18 or has_pass)',
        output: 'False\nTrue',
        explanation:
          'age >= 18 is False. With and, one False side makes the result False; with or, the True has_pass is enough.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'raining = False\ncold = True\nprint(raining and cold)\nprint(raining or cold)',
          ['False\nTrue', 'True\nFalse', 'False\nFalse', 'True\nTrue'],
          0,
          'and needs both sides True, so it is False. or needs only one, and cold is True.',
        ),
        choose(
          'A discount applies to students and also to anyone over 65. Which condition matches?',
          [
            'student and age > 65',
            'student or age >= 65',
            'student or age > 65',
            'student and age >= 65',
          ],
          2,
          'Either reason is enough, so the parts are joined with or, and “over 65” excludes 65 itself.',
        ),
        choose(
          'a and b are bools. When is a or b False?',
          [
            'When a is False',
            'When exactly one of them is False',
            'When both are True',
            'Only when both are False',
          ],
          3,
          'or is True as soon as one side is True, so it can be False only when neither side is True.',
        ),
        predictOutput(
          'What is printed?',
          'x = 6\nprint(x % 2 == 0 and x % 3 == 0)\nprint(x % 4 == 0 or x > 10)',
          ['True\nTrue', 'True\nFalse', 'False\nFalse', 'False\nTrue'],
          1,
          '6 is divisible by both 2 and 3, so the and is True. 6 is not divisible by 4 and not over 10, so the or is False.',
        ),
      ],
    },
    {
      title: 'Reverse a condition with not and group with parentheses',
      explanation: [
        'not reverses a condition: not True is False, and not False is True. Comparisons are computed before not, so not age >= 13 means not (age >= 13).',
        'When a rule combines several parts, parentheses show the grouping, and Python evaluates them first. not (a and b) is different from (not a) and b.',
      ],
      example: {
        code: 'done = False\nurgent = True\nprint(not done)\nprint(not (done or urgent))\nprint((not done) and urgent)',
        output: 'True\nFalse\nTrue',
        explanation:
          'not done is True. done or urgent is True, so not of it is False. not done and urgent are both True, so the last line is True.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'age = 12\nprint(not age >= 13)\nprint(not age < 13)',
          ['False\nTrue', 'True\nTrue', 'True\nFalse', 'False\nFalse'],
          2,
          'age >= 13 is False, so not makes it True. age < 13 is True, so not makes it False.',
        ),
        predictOutput(
          'What is printed?',
          'a = True\nb = False\nprint(not (a or b))\nprint((not a) or b)',
          ['False\nFalse', 'True\nFalse', 'False\nTrue', 'True\nTrue'],
          0,
          'a or b is True, so not of it is False. not a is False and b is False, so the or is False too.',
        ),
        choose(
          'empty and locked are bools. Which expression means “the box is not empty and not locked”?',
          [
            'not (empty and locked)',
            'not empty and not locked',
            'not empty or locked',
            'empty and not locked',
          ],
          1,
          'Each condition is reversed separately and both must hold. not (empty and locked) would also be True for an empty, unlocked box.',
        ),
        choose(
          'Which value of x makes not (x > 3) True?',
          ['4', '10', '3.5', '3'],
          3,
          'not (x > 3) is True when x > 3 is False, which happens for 3, the boundary, but not for anything larger.',
        ),
      ],
    },
    {
      title: 'Check that a value lies inside a range',
      explanation: [
        'A value is inside a range when it passes both limits, so the two comparisons are joined with and: n >= 10 and n <= 20. Python also lets you chain them: 10 <= n <= 20 means 10 <= n and n <= 20.',
        'To check that a value is outside a range, use or, because breaking one limit is enough: n < 10 or n > 20.',
      ],
      example: {
        code: 'temp = 25\nprint(18 <= temp <= 24)\nprint(temp >= 18 and temp <= 30)\nprint(temp < 18 or temp > 24)',
        output: 'False\nTrue\nTrue',
        explanation:
          '25 passes the lower limit 18 but not the upper limit 24, so the chain is False. It is inside 18 to 30, and it breaks the limit 24, so the or is True.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'n = 20\nprint(10 <= n <= 20)\nprint(10 < n < 20)',
          ['True\nTrue', 'True\nFalse', 'False\nFalse', 'False\nTrue'],
          1,
          'The first chain includes its limits, so 20 is inside. The second uses strict <, so n < 20 fails at 20.',
        ),
        choose(
          'Which condition is True exactly when hour is from 9 to 17, inclusive?',
          [
            '9 < hour < 17',
            '9 <= hour or hour <= 17',
            '9 <= hour <= 17',
            'hour >= 9 or hour > 17',
          ],
          2,
          'Both limits must hold and both are included, so the chain uses <= on each side. With or, every hour would pass.',
        ),
        choose(
          'What does 0 < x <= 5 mean?',
          [
            '0 < x or x <= 5',
            '0 < x and 0 <= 5',
            'x > 0 and x >= 5',
            '0 < x and x <= 5',
          ],
          3,
          'A chain compares each neighboring pair and joins the comparisons with and; x is shared by both.',
        ),
        predictOutput(
          'What is the output?',
          'score = 100\nprint(score < 0 or score > 100)\nprint(0 <= score <= 100)',
          ['False\nTrue', 'True\nFalse', 'True\nTrue', 'False\nFalse'],
          0,
          '100 is not below 0 and not above 100, so the outside test is False. The inclusive chain accepts 100.',
        ),
      ],
    },
  ],
  conditionals: [
    {
      title: 'Run a block only when a condition is True',
      explanation: [
        'An if statement checks a condition. When it is True, Python runs the indented body; when it is False, Python skips the body. The colon after the condition starts the block, and the indentation shows which statements belong to it.',
        'The first line that is no longer indented comes after the if statement, so it runs either way.',
      ],
      example: {
        code: 'balance = 30\nif balance < 50:\n    print("Low balance")\nprint("Done")',
        output: 'Low balance\nDone',
        explanation:
          '30 < 50 is True, so the indented print runs. print("Done") is not indented, so it runs whatever the condition was.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'items = 3\nif items > 5:\n    print("Big order")\nprint("Thanks")',
          ['Big order\nThanks', 'Big order', 'Thanks', 'Thanks\nBig order'],
          2,
          '3 > 5 is False, so the indented line is skipped. The unindented print still runs.',
        ),
        predictOutput(
          'What is printed?',
          'x = 8\nif x % 2 == 0:\n    print("even")\n    x = x + 1\nprint(x)',
          ['even\n9', 'even\n8', '9', '8'],
          0,
          'The condition is True, so both indented lines run: even is printed and x becomes 9 before the last print.',
        ),
        choose(
          'Which statements run only when level >= 10 is True?',
          [
            'Only print("Saved")',
            'print("Expert") and level = 10',
            'All three statements',
            'Only print("Expert")',
          ],
          1,
          'Both indented lines belong to the if body. print("Saved") is not indented, so it always runs.',
          'if level >= 10:\n    print("Expert")\n    level = 10\nprint("Saved")',
        ),
        predictOutput(
          'What is the output?',
          'name = "Bo"\nif len(name) < 3:\n    name = name + "!"\nprint(name)',
          ['Bo', '!Bo', 'Bo !', 'Bo!'],
          3,
          'Bo has 2 characters, so the condition is True and the body adds ! to the end of the name.',
        ),
      ],
    },
    {
      title: 'Choose between two paths with else',
      explanation: [
        'else gives an if statement a second body, which runs exactly when the condition is False. In an if/else, one of the two bodies always runs, and never both.',
        'else has no condition of its own. It ends with a colon, and its body is indented like the if body.',
      ],
      example: {
        code: 'stock = 0\nif stock > 0:\n    print("In stock")\nelse:\n    print("Sold out")',
        output: 'Sold out',
        explanation:
          '0 > 0 is False, so the if body is skipped and the else body runs.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'guess = 7\nsecret = 7\nif guess == secret:\n    print("Correct")\nelse:\n    print("Try again")',
          ['Try again', 'Correct\nTry again', 'Correct', 'Try again\nCorrect'],
          2,
          'The condition is True, so only the if body runs; the else body is skipped.',
        ),
        predictOutput(
          'What is printed?',
          'minutes = 45\nif minutes >= 60:\n    hours = minutes // 60\nelse:\n    hours = 0\nprint(hours)',
          ['0', '0.75', '1', '45'],
          0,
          '45 >= 60 is False, so the else body sets hours to 0; the division never runs.',
        ),
        predictOutput(
          'What is the output?',
          'total = 120\nif total > 100:\n    total = total - 20\nelse:\n    total = total + 5\nprint(total)',
          ['125', '100', '105', '120'],
          1,
          '120 > 100 is True, so only the if body runs and subtracts 20. The else body is skipped, so 5 is never added.',
        ),
        choose(
          'In an if/else statement, how many of the two bodies run?',
          [
            'Both, when the condition is True',
            'None, when the condition is False',
            'At most one, sometimes none',
            'Exactly one',
          ],
          3,
          'The if body runs when the condition is True, and the else body runs when it is False, so exactly one runs.',
        ),
      ],
    },
    {
      title: 'Check several conditions in order with elif',
      explanation: [
        'elif adds another condition, which is checked only if every condition above it was False. Python runs the first branch whose condition is True and skips the rest of the chain, even if later conditions are also True. A final else runs when nothing matched.',
        'When conditions overlap, order matters: put the narrowest or highest threshold first.',
      ],
      example: {
        code: 'wind = 55\nif wind >= 90:\n    print("Storm")\nelif wind >= 40:\n    print("Strong")\nelif wind >= 20:\n    print("Breezy")\nelse:\n    print("Calm")',
        output: 'Strong',
        explanation:
          '55 fails the first test and passes the second, so Strong is printed. wind >= 20 is also True, but the chain has already finished.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'temp = 35\nif temp > 20:\n    print("warm")\nelif temp > 30:\n    print("hot")\nelse:\n    print("cool")',
          ['hot', 'cool', 'warm\nhot', 'warm'],
          3,
          '35 > 20 is True, so the first branch runs and the chain stops before temp > 30 is checked.',
        ),
        predictOutput(
          'What is printed?',
          'level = 3\nif level > 5:\n    print("hard")\nelif level > 2:\n    print("medium")\nelif level > 0:\n    print("easy")',
          ['medium\neasy', 'easy', 'medium', 'hard'],
          2,
          'level > 5 fails, level > 2 matches, and the remaining elif is skipped even though it is also True.',
        ),
        choose(
          'A chain checks if weight > 1: first and elif weight > 10: second. Which branch runs when weight is 15?',
          ['Only the first', 'Only the second', 'Both, in order', 'Neither'],
          0,
          '15 > 1 is already True, so the first branch runs and the elif is never checked. The higher threshold should come first.',
        ),
        predictOutput(
          'What is the output?',
          'age = 13\nif age < 13:\n    price = 5\nelif age < 65:\n    price = 9\nelse:\n    price = 6\nprint(price)',
          ['5', '9', '6', '14'],
          1,
          '13 < 13 is False because < excludes the boundary, so the second condition, 13 < 65, picks a price of 9.',
        ),
      ],
    },
  ],
  'conditional-expressions': [
    {
      title: 'Pick one of two values in one line',
      explanation: [
        'A conditional expression chooses between two values: value_if_true if condition else value_if_false. Read it as “this value if the condition holds, otherwise that value.”',
        'It produces a value, so it usually appears on the right of = or inside print().',
      ],
      example: {
        code: 'battery = 15\nmode = "saver" if battery < 20 else "normal"\nprint(mode)',
        output: 'saver',
        explanation:
          '15 < 20 is True, so the expression produces the value written before if, and mode becomes "saver".',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'speed = 72\nstatus = "fine" if speed <= 70 else "ticket"\nprint(status)',
          ['fine', 'ticket', 'False', 'fine\nticket'],
          1,
          '72 <= 70 is False, so the expression produces the value after else. The condition itself is not printed.',
        ),
        choose(
          'Which line sets size to "big" when n is over 100 and to "small" otherwise?',
          [
            'size = "small" if n > 100 else "big"',
            'size = if n > 100 "big" else "small"',
            'size = "big" if n > 100',
            'size = "big" if n > 100 else "small"',
          ],
          3,
          'The value for a True condition comes first, then if and the condition, then else and the other value.',
        ),
        predictOutput(
          'What is printed?',
          'a = 4\nb = 9\nbigger = a if a > b else b\nprint(bigger)',
          ['4', 'False', '9', '13'],
          2,
          '4 > 9 is False, so bigger receives b, which is 9.',
        ),
        predictOutput(
          'What is the output?',
          'points = 0\nmedal = "none" if points == 0 else "bronze"\nprint(medal)',
          ['none', 'bronze', 'True', 'none\nbronze'],
          0,
          'points == 0 is True, so medal gets the first value. Only one value is ever produced.',
        ),
      ],
    },
    {
      title: 'Use an inline choice inside a larger expression',
      explanation: [
        'Because a conditional expression produces a value, it can go inside print(), an f-string, or a calculation. Python checks the condition first and then evaluates only the chosen side; the other side never runs, so it cannot cause an error.',
        'Everything before if is the first value, and everything after else is the second. Wrap the choice in parentheses when only part of a larger expression depends on it.',
      ],
      example: {
        code: 'text = ""\ncount = int(text) if text != "" else 0\nprint(count)\nlives = 1\nprint(f"{lives} {\'life\' if lives == 1 else \'lives\'} left")',
        output: '0\n1 life left',
        explanation:
          'text is empty, so only the else side, 0, is evaluated, and int("") never runs. Inside the f-string, lives == 1 picks the word life.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'raw = "abc"\nvalue = int(raw) if raw == "42" else -1\nprint(value)',
          ['-1', '42', 'ValueError', 'abc'],
          0,
          'raw == "42" is False, so only -1 is evaluated. int(raw) never runs, so there is no ValueError.',
        ),
        predictOutput(
          'What is printed?',
          'n = 7\nprint(n * 10 if n > 5 else n + 10)',
          ['17', '70', 'True', '7'],
          1,
          '7 > 5 is True, so print receives n * 10, which is 70; n + 10 is never evaluated.',
        ),
        predictOutput(
          'What is the output?',
          'word = "hello"\nshout = word + "!" if len(word) < 3 else word\nprint(shout)',
          ['hello!', 'hellohello', 'hello', 'False'],
          2,
          'The whole of word + "!" is the first value. len(word) < 3 is False, so the result is the second value, word, unchanged.',
        ),
        predictOutput(
          'What does this program print?',
          'base = 100\nmember = False\ntotal = base - (10 if member else 0)\nprint(total)',
          ['90', '0', '10', '100'],
          3,
          'member is False, so the parenthesized choice is 0, and 100 - 0 is 100.',
        ),
        choose(
          'cond is True. Which parts of a if cond else b does Python evaluate?',
          [
            'Only b',
            'a and b, then keeps a',
            'cond, then only a',
            'cond, then a and b',
          ],
          2,
          'The condition is checked first, and only the chosen side is evaluated; b is skipped entirely.',
        ),
      ],
    },
    {
      title: 'Decide when an inline choice fits',
      explanation: [
        'A conditional expression needs both parts; there is no form without else. It fits a choice between exactly two values. When a branch must run several statements, or there are three or more outcomes, an if/elif/else block is clearer.',
        'An if/else whose two bodies only assign a value to the same name can be rewritten as one conditional expression.',
      ],
      example: {
        code: 'hours = 50\nif hours > 40:\n    pay_type = "overtime"\nelse:\n    pay_type = "regular"\nsame = "overtime" if hours > 40 else "regular"\nprint(pay_type)\nprint(same)',
        output: 'overtime\novertime',
        explanation:
          'The block and the one-line expression make the same choice from the same condition, so both names hold "overtime".',
      },
      questions: [
        choose(
          'Which one-line assignment does the same as this block?',
          [
            'state = "water" if temp < 0 else "ice"',
            'state = "ice" if temp < 0 else "water"',
            'state = if temp < 0 "ice" else "water"',
            'state = "ice" if temp < 0',
          ],
          1,
          'The if body’s value goes first and the else body’s value goes after else.',
          'if temp < 0:\n    state = "ice"\nelse:\n    state = "water"',
        ),
        choose(
          'A grade has four possible outcomes: A, B, C, or D. What should you use?',
          [
            'One conditional expression',
            'A conditional expression without else',
            'An if/elif/else chain',
            'A single if/else statement',
          ],
          2,
          'A conditional expression and an if/else each choose between only two outcomes; elif adds the extra ones.',
        ),
        choose(
          'Why is label = "on" if power_on an error?',
          [
            'The condition must come first',
            'Strings cannot be chosen inline',
            'power_on must be compared with True',
            'A conditional expression needs an else part',
          ],
          3,
          'An expression must always produce a value, so the else value is required.',
        ),
        predictOutput(
          'What does this program print?',
          'n = 12\nif n > 10:\n    size = "large" if n > 20 else "medium"\nelse:\n    size = "small"\nprint(size)',
          ['medium', 'large', 'small', 'medium\nsmall'],
          0,
          '12 > 10 sends Python into the if body, where 12 > 20 is False, so size becomes "medium".',
        ),
      ],
    },
  ],
  lists: [
    {
      title: 'Write a list of values',
      explanation: [
        'A list stores values in order between square brackets, with commas between the items. [] is an empty list. A list can hold numbers, strings, or a mix, and each item can be any expression, which Python evaluates when it builds the list.',
        'print() shows a list with its brackets and commas, and puts quotes around the strings inside it.',
      ],
      example: {
        code: 'scores = [90, 75, 82]\nnames = ["Ana", "Ben"]\nempty = []\nprint(scores)\nprint(names)\nprint(empty)',
        output: "[90, 75, 82]\n['Ana', 'Ben']\n[]",
        explanation:
          'Each list prints in its original order. The strings appear with quotes, which Python writes as single quotes, and the empty list prints as [].',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'days = ["Mon", "Tue", "Wed"]\nprint(days)',
          [
            'Mon Tue Wed',
            '["Mon", "Tue", "Wed"]',
            "['Mon', 'Tue', 'Wed']",
            'Mon, Tue, Wed',
          ],
          2,
          'Printing a whole list shows the brackets, commas, and quotes around strings, and Python writes those quotes as single quotes.',
        ),
        choose(
          'Which line creates a list of the numbers 4, 5, and 6?',
          [
            'nums = "4, 5, 6"',
            'nums = [4, 5, 6]',
            'nums = [4 5 6]',
            'nums = 4, 5, 6',
          ],
          1,
          'A list needs square brackets with commas between the items. Quotes would make one string instead.',
        ),
        predictOutput(
          'What is printed?',
          'a = 7\nb = 2\nvalues = [a, b, a + b]\nprint(values)',
          ['[a, b, a + b]', '[7, 2, a + b]', '[9]', '[7, 2, 9]'],
          3,
          'Each item is evaluated when the list is built: a is 7, b is 2, and a + b is 9.',
        ),
        predictOutput(
          'What is the output?',
          'mixed = ["3", 3, 3.0]\nprint(mixed)',
          ["['3', 3, 3.0]", '[3, 3, 3.0]', "['3', '3', '3.0']", '[3, 3, 3]'],
          0,
          'The list keeps each value with its own type: the string shows quotes, the int has no decimal point, and the float keeps .0.',
        ),
      ],
    },
    {
      title: 'Count the items with len()',
      explanation: [
        'len(items) returns how many items a list holds: not their total, and not the number of characters inside them. A string in a list counts as one item no matter how long it is, and len([]) is 0.',
      ],
      example: {
        code: 'words = ["hi", "there"]\nprint(len(words))\nprint(len("there"))\nprint(len([]))',
        output: '2\n5\n0',
        explanation:
          'The list has two items. The string "there" on its own has five characters. The empty list has no items.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'print(len([10, 20, 30, 40]))',
          ['100', '4', '40', '3'],
          1,
          'len() counts the items, and there are four of them; it does not add them up.',
        ),
        predictOutput(
          'What is printed?',
          'names = ["Christopher"]\nprint(len(names))',
          ['11', '0', '1', '12'],
          2,
          'The list holds a single item. The 11 characters belong to the string, not to the list.',
        ),
        predictOutput(
          'What is the output?',
          'sentence = "a b c"\nletters = ["a", "b", "c"]\nprint(len(sentence))\nprint(len(letters))',
          ['3\n3', '5\n5', '3\n5', '5\n3'],
          3,
          'The string has five characters, counting the two spaces. The list has three items.',
        ),
        choose(
          'prices is [2.5, 4.0, 3.5]. What does len(prices) return?',
          ['3', '10.0', '4.0', '9'],
          0,
          'There are three items. 10.0 would be their total, and 4.0 is the largest price.',
        ),
      ],
    },
    {
      title: 'Test whether a value is in a list',
      explanation: [
        'value in items is True when the value matches one of the items exactly, and False otherwise. The result is a bool, so you can print it or store it.',
        'The match is exact and checks whole items: "Red" is not in ["red"], the number 3 is not in ["3"] because a number is never the same as a string, and 2 is not in [12, 20].',
      ],
      example: {
        code: 'pets = ["cat", "dog", "fish"]\nprint("dog" in pets)\nprint("Cat" in pets)',
        output: 'True\nFalse',
        explanation:
          '"dog" is one of the items. "Cat" with a capital C does not match "cat".',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'codes = [101, 202, 303]\nprint(202 in codes)\nprint(2 in codes)',
          ['True\nTrue', 'True\nFalse', 'False\nFalse', 'False\nTrue'],
          1,
          '202 is an item of the list. 2 only appears as a digit inside items, which does not count.',
        ),
        predictOutput(
          'What is printed?',
          'answers = ["1", "2", "3"]\nprint(2 in answers)\nprint("2" in answers)',
          ['False\nTrue', 'True\nTrue', 'True\nFalse', 'False\nFalse'],
          0,
          'The items are strings, so the int 2 is not among them, while the string "2" is.',
        ),
        choose(
          'colors is ["red", "green"]. Which expression is True?',
          [
            '"Red" in colors',
            '"re" in colors',
            '"blue" in colors',
            '"green" in colors',
          ],
          3,
          'Only "green" matches a whole item exactly; case and partial words do not match.',
        ),
        predictOutput(
          'What is the output?',
          'guests = ["Ana", "Ben", "Cy"]\nfound = "Ben" in guests\nprint(f"Ben invited: {found}")',
          [
            'Ben invited: 1',
            'Ben invited: Ben',
            'Ben invited: True',
            'Ben invited: False',
          ],
          2,
          'in produces a bool, not the item or its position, and Ben is in the list.',
        ),
      ],
    },
  ],
  truthiness: [
    {
      title: 'Tell which values count as false',
      explanation: [
        'Every value counts as true or false when Python needs a condition. False, None, 0, 0.0, the empty string "", and the empty list [] are falsy; almost everything else is truthy.',
        'bool(value) shows the result directly. bool("") is False, but bool(" ") is True because a space is a character, and bool([0]) is True because that list has one item.',
      ],
      example: {
        code: 'print(bool(0))\nprint(bool(-3))\nprint(bool(""))\nprint(bool("0"))',
        output: 'False\nTrue\nFalse\nTrue',
        explanation:
          'Zero is falsy, but any other number, even a negative one, is truthy. The empty string is falsy, while "0" is a one-character string, so it is truthy.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'print(bool([]))\nprint(bool([False]))',
          ['False\nFalse', 'True\nTrue', 'False\nTrue', 'True\nFalse'],
          2,
          'An empty list is falsy. [False] has one item, so it is not empty and counts as true.',
        ),
        choose(
          'Which of these values is truthy?',
          ['0.0', '"False"', '""', 'None'],
          1,
          '"False" is a nonempty string, so it is truthy; its letters do not matter.',
        ),
        predictOutput(
          'What is printed?',
          'text = "  "\nprint(bool(text))\nprint(bool(len("")))',
          ['True\nFalse', 'False\nFalse', 'False\nTrue', 'True\nTrue'],
          0,
          'Two spaces are two characters, so the string is truthy. len("") is 0, which is falsy.',
        ),
        choose(
          'How many of these values are falsy: 0, "0", [], " "?',
          ['One', 'Three', 'Four', 'Two'],
          3,
          'Only 0 and [] are falsy. "0" and " " are strings with one character each.',
        ),
      ],
    },
    {
      title: 'Use a value directly as a condition',
      explanation: [
        'Because every value is truthy or falsy, if items: means “if the list is not empty,” and if not name: means “if the string is empty.” This reads better than writing len(items) > 0 or name == "".',
        'not turns a falsy value into True and a truthy value into False.',
      ],
      example: {
        code: 'cart = ["pen"]\ncoupon = ""\nif cart:\n    print("Ready to pay")\nif not coupon:\n    print("No coupon")',
        output: 'Ready to pay\nNo coupon',
        explanation:
          'cart has an item, so it is truthy. coupon is empty, so it is falsy and not coupon is True.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'waitlist = []\nif waitlist:\n    print("Call next")\nelse:\n    print("No one waiting")',
          ['Call next', 'No one waiting', 'Call next\nNo one waiting', '[]'],
          1,
          'The empty list is falsy, so the else branch runs.',
        ),
        predictOutput(
          'What is printed?',
          'nickname = "Jo"\nif not nickname:\n    nickname = "Guest"\nprint(nickname)',
          ['Guest', 'Jo\nGuest', 'nickname', 'Jo'],
          3,
          '"Jo" is not empty, so not nickname is False and the default is never assigned.',
        ),
        choose(
          'tags is a list. Which condition means the same as if len(tags) > 0:?',
          ['if not tags:', 'if tags == 0:', 'if tags:', 'if tags == []:'],
          2,
          'A list is truthy exactly when it has at least one item. if not tags: and if tags == []: test for the opposite.',
        ),
        predictOutput(
          'What is the output?',
          'stock = 0\nif stock:\n    print("available")\nelse:\n    print("sold out")',
          ['sold out', 'available', '0', 'available\nsold out'],
          0,
          '0 is falsy, so the condition fails and the else branch runs.',
        ),
      ],
    },
    {
      title: 'Check for a missing value with is None',
      explanation: [
        'None is the value Python uses for “nothing here yet.” Test for it with is None, or is not None for the opposite.',
        'None is falsy, but so are 0 and "". When 0 or an empty string is a real answer, use is None: if not best: would treat a real score of 0 as missing, while if best is None: does not.',
      ],
      example: {
        code: 'temperature = 0\nif not temperature:\n    print("not: missing")\nif temperature is None:\n    print("is None: missing")\nelse:\n    print(f"Recorded {temperature}")',
        output: 'not: missing\nRecorded 0',
        explanation:
          'not temperature is True because 0 is falsy, so that test wrongly reports a missing reading. temperature is None is False, so the else branch reports the real reading of 0.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'discount = 0\nif discount is None:\n    print("No discount set")\nelse:\n    print(f"Discount: {discount}")',
          [
            'No discount set',
            'Discount: None',
            'Discount: 0',
            'No discount set\nDiscount: 0',
          ],
          2,
          'discount is 0, not None, so is None is False and the else branch prints the real value.',
        ),
        predictOutput(
          'What is printed?',
          'answer = None\nif not answer:\n    print("empty")\nif answer is None:\n    print("none")',
          ['empty', 'none', 'none\nempty', 'empty\nnone'],
          3,
          'None is falsy, so the first test passes, and it is None, so the second passes too. They run in order.',
        ),
        choose(
          'level is None until a player picks one, and 0 is a valid level. Which condition is True only after a level is picked?',
          [
            'if level:',
            'if level is not None:',
            'if not level:',
            'if level != 0:',
          ],
          1,
          'is not None is True for every picked level, including 0. if level: would treat level 0 as not picked.',
        ),
        predictOutput(
          'What is the output?',
          'middle_name = ""\nprint(middle_name is None)\nprint(not middle_name)',
          ['False\nTrue', 'True\nTrue', 'True\nFalse', 'False\nFalse'],
          0,
          'The empty string is not None, but it is falsy, so not middle_name is True.',
        ),
      ],
    },
    {
      title: 'Count with True and False as 1 and 0',
      explanation: [
        'In arithmetic, True acts as 1 and False as 0. Adding comparisons therefore counts how many are true: (a > 0) + (b > 0) is 2 when both hold.',
        'Put each comparison in parentheses so it is computed before the +.',
      ],
      example: {
        code: 'mon = 18\ntue = 25\nwed = 27\nhot_days = (mon > 24) + (tue > 24) + (wed > 24)\nprint(hot_days)\nprint(True * 5)',
        output: '2\n5',
        explanation:
          'The comparisons give False, True, and True, which add up as 0 + 1 + 1. True * 5 is 1 * 5.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'print(True + True + True)',
          ['True', 'TrueTrueTrue', '3', '1'],
          2,
          'Each True counts as 1 in arithmetic, so the sum is 3. + does not join bools like strings.',
        ),
        predictOutput(
          'What is printed?',
          'a = 4\nb = 9\nc = 2\nprint((a > 3) + (b > 3) + (c > 3))',
          ['13', '2', '3', 'True'],
          1,
          'Two of the three comparisons are True, so the total is 1 + 1 + 0. The values themselves are not added.',
        ),
        predictOutput(
          'What is the output?',
          'late = False\nfee = 10 * late\nprint(fee)',
          ['0', '10', 'False', '0.0'],
          0,
          'False acts as 0, so 10 * False is the integer 0.',
        ),
        choose(
          'What does True + 1 evaluate to?',
          ['True', '11', 'A TypeError', '2'],
          3,
          'True acts as the number 1 in arithmetic, so the result is 2. Unlike a string, a bool can be added to a number.',
        ),
      ],
    },
  ],
  'number-builtins': [
    {
      title: 'Total, count, and average a list',
      explanation: [
        'sum(values) adds the numbers in a list, and len(values) counts them, so sum(values) / len(values) is their mean. Because / always gives a float, the mean is a float even when it comes out whole.',
        'sum([]) is 0, since adding no numbers gives zero.',
      ],
      example: {
        code: 'steps = [4000, 6500, 7500]\ntotal = sum(steps)\nprint(total)\nprint(total / len(steps))',
        output: '18000\n6000.0',
        explanation:
          'The three values add up to 18000. Dividing by the count, 3, gives the mean as the float 6000.0.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'prices = [3, 8, 4]\nprint(sum(prices))\nprint(len(prices))',
          ['3\n15', '15\n3', '15\n15', '3\n3'],
          1,
          'sum adds the values to 15, and len counts the three items.',
        ),
        predictOutput(
          'What is printed?',
          'grades = [60, 90, 90, 80]\nprint(sum(grades) / len(grades))',
          ['80', '75.0', '320', '80.0'],
          3,
          'The total 320 divided by 4 items is 80.0; / always gives a float. 75.0 would be halfway between the smallest and largest.',
        ),
        choose(
          'What does sum([]) return?',
          ['0', 'It raises ValueError', '[]', '0.0'],
          0,
          'Adding no numbers gives the integer 0, so sum works on an empty list without an error.',
        ),
        predictOutput(
          'What is the output?',
          'ratings = [4, 5, 3, 4]\naverage = sum(ratings) / len(ratings)\nprint(f"Average: {average}")',
          ['Average: 4', 'Average: 16', 'Average: 4.0', 'Average: 3.2'],
          2,
          'The ratings total 16, and 16 / 4 is the float 4.0.',
        ),
      ],
    },
    {
      title: 'Find the smallest and largest values',
      explanation: [
        'min(values) returns the smallest item of a list and max(values) the largest. They return the value itself, not its position. Both also accept separate arguments, so max(a, b) is the larger of two numbers.',
        'An empty list has no smallest or largest item, so min([]) and max([]) raise ValueError.',
      ],
      example: {
        code: 'heights = [152, 167, 159]\nprint(min(heights))\nprint(max(heights))\nprint(max(4, 11))',
        output: '152\n167\n11',
        explanation:
          'min and max scan the whole list, whatever the order. With two separate arguments, max returns the larger one, 11.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'times = [12.5, 9.8, 10.1]\nprint(min(times))\nprint(max(times))',
          ['12.5\n9.8', '9.8\n12.5', '12.5\n10.1', '9.8\n10.1'],
          1,
          'min finds the smallest value, 9.8, and max the largest, 12.5, wherever they sit in the list.',
        ),
        predictOutput(
          'What is printed?',
          'a = 14\nb = 6\nprint(max(a, b) - min(a, b))',
          ['20', '-8', '6', '8'],
          3,
          'max(a, b) is 14 and min(a, b) is 6, so the difference is 8.',
        ),
        choose(
          'What happens when Python runs max([])?',
          [
            'It returns 0',
            'It returns []',
            'It raises ValueError',
            'It returns an empty string',
          ],
          2,
          'An empty list has no largest item, so max raises ValueError. Only sum([]) has a natural answer, 0.',
        ),
        predictOutput(
          'What is the output?',
          'low = min([5, 2, 8])\nhigh = max(low, 4)\nprint(high)',
          ['4', '8', '2', '5'],
          0,
          'low is 2, and max(2, 4) compares just those two arguments, giving 4.',
        ),
      ],
    },
    {
      title: 'Measure distance with abs() and round with round()',
      explanation: [
        'abs(x) is the distance of x from zero, so abs(-7) and abs(7) are both 7. That makes abs(a - b) the gap between two numbers, whichever one is larger.',
        'round(x) gives the nearest whole number as an int, and round(x, 2) keeps two decimal places.',
      ],
      example: {
        code: 'start = 12\nend = 5\nprint(abs(end - start))\nprint(round(3.14159, 3))\nprint(round(9.8))',
        output: '7\n3.142\n10',
        explanation:
          '5 - 12 is -7, and abs removes the sign. round keeps three decimals of 3.14159, and 9.8 rounds to the whole number 10.',
      },
      questions: [
        choose(
          'Which expression gives the distance between a and b, whichever is larger?',
          ['a - b', 'abs(a - b)', 'abs(a) - abs(b)', 'max(a, b)'],
          1,
          'abs removes the sign of the difference, so the order of a and b no longer matters.',
        ),
        predictOutput(
          'What does this program print?',
          'target = 50\nguess = 64\nprint(abs(target - guess))',
          ['-14', '114', '14', '50'],
          2,
          '50 - 64 is -14, and abs turns it into the distance 14.',
        ),
        predictOutput(
          'What is printed?',
          'print(round(7.86, 1))',
          ['7.8', '8', '7.86', '7.9'],
          3,
          'With one decimal place, 7.86 is closer to 7.9 than to 7.8; round does not just cut off digits.',
        ),
        predictOutput(
          'What is the output?',
          'print(round(4.6), round(4.2))',
          ['5 4', '5.0 4.0', '4 4', '5 5'],
          0,
          'Without a second argument, round returns the nearest whole number as an int: 5 and 4.',
        ),
      ],
    },
    {
      title: 'Track a running minimum from float("inf")',
      explanation: [
        'float("inf") is a float larger than every number, and it prints as inf. Starting with best = float("inf") means the first real value always replaces it, because min(float("inf"), 42) is 42.',
        'Each new value then updates best = min(best, value), which keeps the smaller of the best so far and the new value. Starting from 0 instead would be wrong for positive data, because min would keep the 0.',
      ],
      example: {
        code: 'best = float("inf")\nbest = min(best, 48)\nbest = min(best, 35)\nbest = min(best, 41)\nprint(best)',
        output: '35',
        explanation:
          '48 replaces inf, 35 replaces 48, and 41 is not smaller than 35, so best stays 35.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'best = float("inf")\nprint(best)\nbest = min(best, 9)\nprint(best)',
          ['inf\ninf', '0\n9', 'inf\n9', 'infinity\n9'],
          2,
          'float("inf") prints as inf, and any real number, such as 9, is smaller than it.',
        ),
        predictOutput(
          'What is printed?',
          'lowest = 0\nlowest = min(lowest, 12)\nlowest = min(lowest, 7)\nprint(lowest)',
          ['7', '12', 'inf', '0'],
          3,
          'The starting 0 is smaller than every value, so min keeps it and the real minimum, 7, is lost.',
        ),
        choose(
          'Why start a running minimum at float("inf") instead of 0?',
          [
            'min() compares only float values',
            'The first real value always replaces it',
            'It rounds down to the first value',
            'It makes min() keep the largest value',
          ],
          1,
          'inf can never win a min against real data, so it is replaced right away; 0 would win against every positive value.',
        ),
        predictOutput(
          'What is the output?',
          'best = float("inf")\nbest = min(best, 61)\nbest = min(best, 58)\nbest = min(best, 64)\nprint(best, abs(best - 60))',
          ['58 2', '64 4', '58 -2', '61 1'],
          0,
          'The running minimum ends at 58, and its distance from 60 is abs(-2), which is 2.',
        ),
      ],
    },
  ],
  'string-methods': [
    {
      title: 'Change case and trim with lower, upper, and strip',
      explanation: [
        'Strings have methods: functions attached to a value and called with a dot, as in text.upper(). lower() and upper() change the case of every letter, and strip() removes spaces and newlines from both ends, but not from the middle.',
        'Strings never change in place: each method returns a new string. To keep the result, assign it, for example name = name.strip().',
      ],
      example: {
        code: 'name = "  Ada  "\nclean = name.strip()\nprint(clean + "!")\nprint(name + "!")\nprint(clean.upper())',
        output: 'Ada!\n  Ada  !\nADA',
        explanation:
          'strip() returned a new string without the outer spaces and stored it in clean. name itself still has its spaces, as the second line shows.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'print("Good Morning".lower())',
          ['Good morning', 'GOOD MORNING', 'goodmorning', 'good morning'],
          3,
          'lower() changes every letter to lowercase and leaves the space alone.',
        ),
        predictOutput(
          'What is printed?',
          'code = "ab12"\ncode.upper()\nprint(code)',
          ['AB12', 'ab12', 'Ab12', 'AB12\nab12'],
          1,
          'upper() returns a new string, but it is never assigned, so code still holds the original text.',
        ),
        predictOutput(
          'What is the output?',
          'entry = "   yes   "\nprint(len(entry))\nprint(len(entry.strip()))',
          ['3\n3', '9\n9', '9\n3', '3\n9'],
          2,
          'The original has three spaces on each side, 9 characters in all. strip() removes them, leaving 3.',
        ),
        choose(
          'msg holds "  hi  ". Which statement makes msg itself hold "hi"?',
          ['msg = msg.strip()', 'msg.strip()', 'strip(msg)', 'msg.strip(msg)'],
          0,
          'strip() returns a new string, so the result must be assigned back to msg to keep it.',
        ),
      ],
    },
    {
      title: 'Swap text with replace()',
      explanation: [
        'text.replace(old, new) returns a new string with every occurrence of old swapped for new. The match is exact, so uppercase and lowercase letters must match too.',
        'Replacing with the empty string "" deletes the text. Like every string method, replace leaves the original string unchanged.',
      ],
      example: {
        code: 'date = "2024/05/17"\nprint(date.replace("/", "-"))\nprint(date.replace("/", ""))',
        output: '2024-05-17\n20240517',
        explanation:
          'Both slashes are replaced each time: first by dashes, then by nothing, which removes them.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'print("banana".replace("a", "o"))',
          ['bonana', 'bonono', 'banano', 'bnn'],
          1,
          'replace swaps every occurrence, not just the first, so all three a’s become o.',
        ),
        predictOutput(
          'What is printed?',
          'print("Cat cat CAT".replace("cat", "dog"))',
          ['dog dog dog', 'dog cat CAT', 'Cat cat CAT', 'Cat dog CAT'],
          3,
          'The match is case-sensitive, so only the all-lowercase cat is replaced.',
        ),
        predictOutput(
          'What is the output?',
          'phone = "555 123 4567"\ndigits = phone.replace(" ", "")\nprint(len(digits))',
          ['12', '3', '10', '9'],
          2,
          'Replacing each space with "" removes the two spaces, leaving 10 digits.',
        ),
        choose(
          'Which expression removes every comma from text?',
          [
            'text.replace(",", "")',
            'text.replace("", ",")',
            'text.strip()',
            'text.replace(",", " ")',
          ],
          0,
          'The first argument is what to find and the second is what to put instead; "" puts nothing there. strip() only trims spaces at the ends.',
        ),
      ],
    },
    {
      title: 'Split text into a list with split()',
      explanation: [
        'text.split() breaks text into a list of words. It splits at any run of spaces, tabs, or newlines and ignores spaces at the ends, so len(text.split()) counts the words.',
        'text.split(",") splits at every comma exactly. Spaces next to the commas stay attached to the pieces, and two neighboring commas produce an empty string "" between them.',
      ],
      example: {
        code: 'line = "red  green blue"\nprint(line.split())\nprint("x,,y".split(","))\nprint(len(line.split()))',
        output: "['red', 'green', 'blue']\n['x', '', 'y']\n3",
        explanation:
          'split() treats the double space like a single one. Splitting at commas keeps the empty piece between the two commas. The word list has three items.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'sentence = "  learn python fast "\nprint(sentence.split())',
          [
            "['', 'learn', 'python', 'fast', '']",
            "['learn python fast']",
            "['learn', 'python', 'fast']",
            "['  learn', 'python', 'fast ']",
          ],
          2,
          'split() with no argument splits at whitespace and ignores the spaces at both ends, so only the three words remain.',
        ),
        predictOutput(
          'What is printed?',
          'print("a, b,c".split(","))',
          [
            "['a', 'b', 'c']",
            "['a', ' b', 'c']",
            "['a, b,c']",
            "['a', ',', 'b', ',', 'c']",
          ],
          1,
          'Splitting at "," cuts exactly at each comma, so the space after the first comma stays at the start of " b". The commas themselves are removed.',
        ),
        predictOutput(
          'What is the output?',
          'csv = "4,8,15"\nparts = csv.split(",")\nprint(len(parts))\nprint(parts)',
          [
            '3\n[4, 8, 15]',
            "6\n['4', '8', '15']",
            "1\n['4,8,15']",
            "3\n['4', '8', '15']",
          ],
          3,
          'There are three pieces, and split always produces strings, so each number is shown in quotes.',
        ),
        choose(
          'Which call turns "10:30:45" into ["10", "30", "45"]?',
          [
            '"10:30:45".split(":")',
            '"10:30:45".split()',
            '":".split("10:30:45")',
            '"10:30:45".replace(":", ",")',
          ],
          0,
          'split is called on the text and given the separator. split() with no argument looks for whitespace, and replace returns a string, not a list.',
        ),
        predictOutput(
          'What does this program print?',
          'print(len("to be or not".split()))',
          ['12', '4', '3', '9'],
          1,
          'split() produces a list of four words, and len counts the items, not the characters.',
        ),
      ],
    },
    {
      title: 'Join a list of strings with join()',
      explanation: [
        'separator.join(words) glues a list of strings into one string, with the separator between neighboring items but not at the ends. It reverses split: "-".join("a b c".split()) is "a-b-c".',
        'join accepts only strings, so convert numbers with str() first. Because each method returns a new string, calls can be chained from left to right.',
      ],
      example: {
        code: 'words = ["make", "it", "work"]\nprint(" ".join(words))\nprint("-".join(words).upper())\nprint(", ".join(["7", "8"]))',
        output: 'make it work\nMAKE-IT-WORK\n7, 8',
        explanation:
          'Each separator goes only between items. In the second line, join builds make-it-work first, and upper() is called on that result.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'print("+".join(["1", "2", "3"]))',
          ['6', '1+2+3', '+1+2+3+', '123'],
          1,
          'join places the separator between the strings and does no arithmetic; nothing is added at the ends.',
        ),
        predictOutput(
          'What is printed?',
          'title = "the quick fox"\nprint("_".join(title.split()).upper())',
          [
            'the_quick_fox',
            'THE QUICK FOX',
            '_THE_QUICK_FOX_',
            'THE_QUICK_FOX',
          ],
          3,
          'split makes three words, join links them with underscores, and upper() turns the joined result to capitals.',
        ),
        choose(
          'Why does ", ".join([1, 2, 3]) raise an error?',
          [
            'The separator must be one character',
            'join must be called on the list',
            'join accepts only strings, and these items are ints',
            'The list must have exactly two items',
          ],
          2,
          'join can glue only strings; the numbers would need str() first. Separators of any length are allowed.',
        ),
        predictOutput(
          'What is the output?',
          'h = 9\nm = 5\nprint(":".join([str(h), str(m)]))',
          ['9:5', '14', '9:05', ':9:5:'],
          0,
          'str() turns each number into text, and join puts one colon between them without padding any digits.',
        ),
      ],
    },
  ],
  indexing: [
    {
      title: 'Read an item by its position, counting from 0',
      explanation: [
        'Brackets after a list name select one item by its index. Indices start at 0, so the first item is at index 0, the second at index 1, and so on. The result is the item itself, not a smaller list.',
        'Strings support the same brackets. Indexing a string gives a one-character string.',
      ],
      example: {
        code: 'planets = ["Mercury", "Venus", "Earth", "Mars"]\nprint(planets[0])\nprint(planets[2])\nword = "python"\nprint(word[3])',
        output: 'Mercury\nEarth\nh',
        explanation:
          'Index 0 is Mercury and index 2 is the third planet, Earth. In "python", index 3 is the fourth character, h.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'days = ["Mon", "Tue", "Wed", "Thu"]\nprint(days[1])',
          ['Mon', 'Tue', 'Wed', "['Tue']"],
          1,
          'Index 1 is the second item, Tue. Indexing returns the item, not a list.',
        ),
        predictOutput(
          'What does this program print?',
          'code = "LAMBDA"\nprint(code[0] + code[3])',
          ['LM', 'AD', 'LB', 'L B'],
          2,
          'code[0] is L and code[3] is the fourth character, B; + joins them with no space.',
        ),
        predictOutput(
          'What does this program print?',
          'scores = [12, 30, 7, 25]\nprint(scores[1] + scores[2])',
          ['37', '42', '32', '3'],
          0,
          'scores[1] is 30 and scores[2] is 7, the second and third items, so the sum is 37.',
        ),
        choose(
          'Which expression gives the first character of the string stored in name?',
          ['name[1]', 'name(0)', 'name[len(name)]', 'name[0]'],
          3,
          'Positions start at 0, and indexing uses square brackets.',
        ),
      ],
    },
    {
      title: 'Count from the end with negative indices',
      explanation: [
        'A negative index counts backward from the end: -1 is the last item, -2 the second-last, and so on. This reaches the end of a list or string without knowing its length.',
      ],
      example: {
        code: 'queue = ["Ana", "Ben", "Cai", "Dev"]\nprint(queue[-1])\nprint(queue[-3])\nprint("river"[-2])',
        output: 'Dev\nBen\ne',
        explanation:
          '-1 is the last name, Dev. Counting back three from the end reaches Ben. In "river", -2 is the second-last character, e.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'steps = ["wash", "rinse", "dry", "fold"]\nprint(steps[-2])',
          ['rinse', 'dry', 'fold', 'wash'],
          1,
          '-1 is fold, so -2 is the item just before it, dry.',
        ),
        predictOutput(
          'What does this program print?',
          'word = "planet"\nprint(word[-1] + word[0])',
          ['tp', 'pt', 'et', 'te'],
          0,
          'word[-1] is the last character t and word[0] is p, joined in that order.',
        ),
        choose(
          'A list named log has 10 items. Which index selects the same item as log[9]?',
          ['-9', '-10', '-1', '-0'],
          2,
          'log[9] is the last of 10 items, and -1 always selects the last item.',
        ),
        predictOutput(
          'What does this program print?',
          'temps = [18, 21, 19, 24, 22]\nprint(temps[-3] + temps[1])',
          ['45', '42', '37', '40'],
          3,
          'temps[-3] is third from the end, 19, and temps[1] is 21, so the sum is 40.',
        ),
      ],
    },
    {
      title: 'Stay inside the valid positions',
      explanation: [
        'A sequence of length n has positive indices 0 through n - 1, so the last positive index is len(sequence) - 1. An index past the end does not wrap around: it raises IndexError.',
      ],
      example: {
        code: 'shelf = ["atlas", "novel", "comic"]\nprint(len(shelf))\nprint(len(shelf) - 1)\nprint(shelf[len(shelf) - 1])',
        output: '3\n2\ncomic',
        explanation:
          'Three items sit at indices 0, 1, and 2. The last index is 3 - 1 = 2, so shelf[2] is comic; shelf[3] would raise IndexError.',
      },
      questions: [
        choose(
          'What happens when this program runs?',
          [
            'It prints w',
            'It raises IndexError',
            'It prints x',
            'It raises ValueError',
          ],
          1,
          'The four items are at indices 0 to 3, so index 4 is out of range and raises IndexError.',
          'letters = ["x", "y", "z", "w"]\nprint(letters[4])',
        ),
        predictOutput(
          'What does this program print?',
          'word = "orbit"\nprint(word[len(word) - 1])',
          ['i', '5', 't', '4'],
          2,
          'len(word) is 5, so the index is 4, the last character t.',
        ),
        predictOutput(
          'What does this program print?',
          'nums = [3, 6, 9, 12, 15]\nprint(len(nums) - 1)\nprint(nums[len(nums) - 2])',
          ['4\n12', '5\n15', '4\n15', '5\n12'],
          0,
          'Five items give a last index of 4. Index 5 - 2 = 3 holds 12.',
        ),
        choose(
          'A string s has 6 characters. What is the highest positive index you can use with it?',
          ['6', '7', '4', '5'],
          3,
          'Indices run from 0 to len(s) - 1, which is 5.',
        ),
      ],
    },
  ],

  tuples: [
    {
      title: 'Group values in a tuple and read them by index',
      explanation: [
        'A tuple is an ordered, fixed group of values written with commas, usually inside parentheses: city = ("Lima", 1535, "Peru"). Index it like a list, and len() counts its items.',
        'Printing a tuple shows it in parentheses, with strings in quotes.',
      ],
      example: {
        code: 'city = ("Lima", 1535, "Peru")\nprint(city[0])\nprint(city[-1])\nprint(len(city))\nprint(city)',
        output: "Lima\nPeru\n3\n('Lima', 1535, 'Peru')",
        explanation:
          'Index 0 is the first item and -1 the last. The tuple holds three items, and printing it shows the whole group.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'size = (1920, 1080)\nprint(size[1])',
          ['1920', '1080', '(1920, 1080)', '(1080,)'],
          1,
          'Index 1 is the second item, 1080, and indexing returns the item itself.',
        ),
        predictOutput(
          'What does this program print?',
          'rgb = (200, 50, 10)\nprint(rgb[0] + rgb[-1])',
          ['250', '60', '210', '260'],
          2,
          'rgb[0] is 200 and rgb[-1] is the last item, 10.',
        ),
        predictOutput(
          'What does this program print?',
          'print(len(("red", "green", "blue", "red")))',
          ['4', '3', '15', '1'],
          0,
          'len() counts items, including the repeated "red", so there are four.',
        ),
        choose(
          'Which line stores a row number 2 and a column number 7 together as a tuple?',
          ['cell = [2, 7]', 'cell = (2 7)', 'cell = "2, 7"', 'cell = (2, 7)'],
          3,
          'A tuple separates its items with commas inside parentheses. Square brackets make a list.',
        ),
      ],
    },
    {
      title: 'Write a one-item tuple with a trailing comma',
      explanation: [
        'The commas make a tuple; parentheses only group. So (5) is just the number 5, while (5,) is a tuple holding one item. Without the trailing comma, ("tea") is simply the string "tea".',
      ],
      example: {
        code: 'single = ("tea",)\nplain = ("tea")\nprint(single)\nprint(len(single))\nprint(plain)\nprint(len(plain))',
        output: "('tea',)\n1\ntea\n3",
        explanation:
          'single is a tuple with one item. plain has no comma, so it is the string tea, whose length is its 3 characters.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'box = (7,)\nprint(box)',
          ['7', '(7)', '(7,)', '[7]'],
          2,
          'The trailing comma makes a one-item tuple, and Python prints it with the comma.',
        ),
        predictOutput(
          'What does this program print?',
          'a = (4)\nprint(a * 3)',
          ['(4, 4, 4)', '12', '(12,)', '444'],
          1,
          'Without a comma, (4) is just the number 4, so a * 3 is 12.',
        ),
        predictOutput(
          'What does this program print?',
          'word = ("hello",)\nprint(len(word))',
          ['1', '5', '2', '6'],
          0,
          'The comma makes a tuple with one item, the string hello, so len() is 1.',
        ),
        choose(
          'Which expression is a tuple holding exactly one item, the number 9?',
          ['(9)', '[9]', '(,9)', '(9,)'],
          3,
          'A one-item tuple needs a comma after the item; (9) is just 9.',
        ),
      ],
    },
    {
      title: 'Treat a tuple as fixed once it is made',
      explanation: [
        'Tuples are immutable: assigning to an item, as in point[0] = 9, raises TypeError. To get a different tuple, build a new one and assign it to the name.',
        'Use a tuple for a record whose parts belong together, such as (row, col) or (name, score), and a list for a collection that grows or changes.',
      ],
      example: {
        code: 'start = (0, 0)\nstart = (5, start[1])\nprint(start)',
        output: '(5, 0)',
        explanation:
          'start[0] = 5 would raise TypeError. Instead, a new tuple is built from 5 and the old second item, and start now names it.',
      },
      questions: [
        choose(
          'What happens when this program runs?',
          [
            'It prints (3, 10)',
            'It prints (3, 4)',
            'It raises TypeError',
            'It raises IndexError',
          ],
          2,
          'Tuples cannot be changed, so assigning to size[1] raises TypeError before anything is printed.',
          'size = (3, 4)\nsize[1] = 10\nprint(size)',
        ),
        predictOutput(
          'What does this program print?',
          'pos = (2, 8)\npos = (pos[0] + 1, pos[1])\nprint(pos)',
          ['(3, 8)', '(2, 8)', '(3, 9)', '(2, 8, 3)'],
          0,
          'The right side builds a new tuple from the old values, and pos is reassigned to it.',
        ),
        choose(
          'Which value is the best fit for a tuple rather than a list?',
          [
            'A shopping list that grows during the day',
            'The (latitude, longitude) of one city',
            'The scores recorded as a game goes on',
            'Guest names added as people arrive',
          ],
          1,
          'A coordinate pair is a fixed record of two parts that belong together; the others grow.',
        ),
        choose(
          'rec holds a tuple. Which line runs without an error?',
          [
            'rec[1] = 13',
            'rec[0] = "Ky"',
            'rec[1] = rec[1] + 1',
            'rec = ("Kai", 13)',
          ],
          3,
          'Assigning to any item of a tuple raises TypeError; reassigning the name to a new tuple is allowed.',
          'rec = ("Kai", 12)',
        ),
      ],
    },
    {
      title: 'Compare tuples item by item from the left',
      explanation: [
        'Comparisons such as < and == work on tuples item by item from the left. The first pair of items that differ decides the result; later items matter only when every earlier pair is equal.',
        'This makes tuples handy for ordering records like (year, month, day): the year is checked first, the month only when the years tie.',
      ],
      example: {
        code: 'release = (2024, 3, 15)\ndeadline = (2024, 11, 2)\nprint(release < deadline)\nprint((7, 5) > (7, 9))',
        output: 'True\nFalse',
        explanation:
          'The years tie, so 3 < 11 decides the first result; 15 and 2 are never compared. In the second, 7 ties and 5 > 9 is False.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'print((1, 50) < (2, 0))\nprint((4, 2) < (4, 1))',
          ['True\nFalse', 'False\nFalse', 'True\nTrue', 'False\nTrue'],
          0,
          '1 < 2 settles the first comparison. In the second the 4s tie, and 2 < 1 is False.',
        ),
        predictOutput(
          'What does this program print?',
          'a = (3, 9, 1)\nb = (3, 2, 8)\nprint(a > b)\nprint(a == b)',
          ['False\nFalse', 'True\nFalse', 'False\nTrue', 'True\nTrue'],
          1,
          'The 3s tie, then 9 > 2 decides that a > b. The tuples differ, so == is False even though their sums match.',
        ),
        choose(
          'Which comparison is False?',
          [
            '(0, 9) < (1, 0)',
            '(5, 2) < (5, 3)',
            '(8, 1) > (7, 9)',
            '(4, 6) < (4, 5)',
          ],
          3,
          'The 4s tie, so 6 < 5 decides, and that is False.',
        ),
        choose(
          'When Python evaluates (6, 30, 99) < (6, 31, 0), which items decide the result?',
          ['6 and 6', '99 and 0', '30 and 31', 'The sums 135 and 37'],
          2,
          'The first items tie, so the second items, 30 and 31, are the first pair that differ.',
        ),
      ],
    },
  ],

  'for-loops': [
    {
      title: 'Run the body once for each item, in order',
      explanation: [
        'A for loop takes the items of a list one at a time, in their order. Each time, it assigns the item to the loop variable and runs the indented body with that value.',
      ],
      example: {
        code: 'for city in ["Oslo", "Quito", "Pune"]:\n    print(f"Visit {city}")',
        output: 'Visit Oslo\nVisit Quito\nVisit Pune',
        explanation:
          'city is Oslo on the first pass, Quito on the second, and Pune on the third. The body prints once per city.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'for n in [3, 1, 2]:\n    print(n * 10)',
          ['10\n20\n30', '60', '30\n10\n20', '30'],
          2,
          'The loop keeps the list order and runs the body once per item, so each product gets its own line.',
        ),
        predictOutput(
          'What does this program print?',
          'for word in ["up", "down"]:\n    print(word + "!")',
          ['updown!', 'up!\ndown!', 'down!', 'up\ndown\n!'],
          1,
          'The body runs for up and then for down, adding ! to each word on its own line.',
        ),
        choose(
          'In for size in sizes:, what does size hold during the second pass through the body?',
          [
            'The second item of sizes',
            'The whole list named sizes',
            'The number 2',
            'The number 1',
          ],
          0,
          'The loop variable holds one item at a time, so on the second pass it is the second item.',
        ),
        predictOutput(
          'What does this program print?',
          'for price in [4, 9]:\n    print(price, price * 2)',
          ['8\n18', '4 9\n8 18', '4\n9\n8\n18', '4 8\n9 18'],
          3,
          'Each pass prints one line holding the price and its double.',
        ),
      ],
    },
    {
      title: 'Tell what runs once per item and what runs once',
      explanation: [
        'Every statement indented under the for line runs once per item, top to bottom, before the next item starts. The first line after the loop that is not indented runs once, after all the items.',
        'A loop over an empty list runs its body zero times; the program simply continues after the loop.',
      ],
      example: {
        code: 'for step in ["mix", "bake"]:\n    print("Start", step)\n    print("Finish", step)\nprint("Serve")',
        output: 'Start mix\nFinish mix\nStart bake\nFinish bake\nServe',
        explanation:
          'Both indented lines run for mix, then both run for bake. Serve is not indented, so it prints once at the end.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'for c in ["red", "blue"]:\n    print(c)\nprint("end")',
          [
            'red\nend\nblue\nend',
            'red\nblue\nend',
            'red\nblue',
            'end\nred\nblue',
          ],
          1,
          'print("end") is not indented, so it runs once, after the loop.',
        ),
        predictOutput(
          'What does this program print?',
          'for n in [1, 2]:\n    print("a")\n    print(n)',
          ['a\na\n1\n2', 'a\n1\n2', '1\n2\na', 'a\n1\na\n2'],
          3,
          'The whole body runs for 1 before it runs for 2, so the lines alternate.',
        ),
        choose(
          'How many lines does this program print?',
          ['1', '0', '2', 'It raises an error'],
          0,
          'The empty list gives the body zero passes; only the final print runs.',
          'for item in []:\n    print(item)\nprint("done")',
        ),
        choose(
          'In a for loop, what decides whether a statement runs once per item or only once?',
          [
            'Whether it uses the loop variable',
            'Whether the list has more than one item',
            'Whether it is indented below the for',
            'Whether it comes before a print() call',
          ],
          2,
          'Indentation marks the body; indented statements repeat for each item.',
        ),
      ],
    },
    {
      title: 'Build a new list with append inside a loop',
      explanation: [
        'Create an empty list before the loop. Inside the body, results.append(value) adds one value to the end of results, so the new list fills up in the same order as the loop.',
        'If the empty list is created inside the loop instead, it is replaced on every pass and only the last value survives.',
      ],
      example: {
        code: 'names = ["ada", "lin", "kai"]\nshouts = []\nfor name in names:\n    shouts.append(name + "!")\nprint(shouts)',
        output: "['ada!', 'lin!', 'kai!']",
        explanation:
          'shouts starts empty. Each pass appends one new string to the end, so the results keep the order of names.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'squares = []\nfor n in [3, 1, 4]:\n    squares.append(n * n)\nprint(squares)',
          ['[9, 1, 16]', '[1, 9, 16]', '[16, 1, 9]', '[3, 1, 4, 9, 1, 16]'],
          0,
          'append adds each square to the end, so the results follow the loop order.',
        ),
        predictOutput(
          'What does this program print?',
          'out = []\nfor w in ["hi", "yo"]:\n    out.append(w)\n    out.append(w)\nprint(out)',
          [
            "['hi', 'yo']",
            "['hi', 'yo', 'hi', 'yo']",
            "['hi', 'hi', 'yo', 'yo']",
            "['hihi', 'yoyo']",
          ],
          2,
          'Both appends run for hi before the loop moves on to yo, and each adds a separate item.',
        ),
        predictOutput(
          'What does this program print?',
          'for x in [5, 6]:\n    result = []\n    result.append(x)\nprint(result)',
          ['[5, 6]', '[6]', '[5]', '[]'],
          1,
          'result is reset to an empty list on every pass, so after the loop it holds only the last value.',
        ),
        choose(
          'results is [2, 4]. What does results.append(7) do?',
          [
            'Makes it [7, 2, 4]',
            'Makes it [9, 11]',
            'Replaces it with [7]',
            'Makes it [2, 4, 7]',
          ],
          3,
          'append adds one item to the end of the existing list.',
        ),
      ],
    },
  ],

  unpacking: [
    {
      title: 'Unpack a tuple into separate names',
      explanation: [
        'Put several names, separated by commas, on the left of =, and Python assigns the items of a tuple or list to them in order: x, y = (6, -2) makes x 6 and y -2.',
        'Values separated by commas also build a tuple, so w, h = 4, 5 packs two values and unpacks them in one line.',
      ],
      example: {
        code: 'point = (6, -2)\nx, y = point\nprint(x)\nprint(y)\nw, h = 4, 5\nprint(w * h)',
        output: '6\n-2\n20',
        explanation:
          'The first name gets the first item and the second name the second. 4, 5 is packed into a tuple and unpacked into w and h.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'size = (30, 12)\nwidth, height = size\nprint(height)',
          ['30', '12', '(30, 12)', '(12,)'],
          1,
          'The second name receives the second item, the number 12 itself.',
        ),
        predictOutput(
          'What does this program print?',
          'name, age, city = ["Rui", 41, "Porto"]\nprint(city, name)',
          ['Porto Rui', 'Rui Porto', 'Rui 41', '41 Porto'],
          0,
          'The names take the items in order, so city is Porto and name is Rui; print() shows them in the order asked.',
        ),
        predictOutput(
          'What does this program print?',
          'a, b = 3, 8\nprint(b - a)',
          ['-5', '0', '5', '11'],
          2,
          'a is 3 and b is 8, so b - a is 5.',
        ),
        choose(
          'After hour, minute = (14, 5) runs, what do the names hold?',
          [
            'hour is 5 and minute is 14',
            'Both hold (14, 5)',
            'hour holds (14, 5) and minute is unset',
            'hour is 14 and minute is 5',
          ],
          3,
          'Items are assigned to the names in order, left to right.',
        ),
      ],
    },
    {
      title: 'Match the number of names to the number of items',
      explanation: [
        'Unpacking needs exactly one name per item. Too few or too many names raises ValueError, and no name is assigned.',
        'An item that is itself a tuple still counts as one item, so it goes to a single name.',
      ],
      example: {
        code: 'record = ("Mia", (3, 7))\nname, spot = record\nprint(name)\nprint(spot)\nprint(spot[1])',
        output: 'Mia\n(3, 7)\n7',
        explanation:
          'record has two items, so two names work; the inner tuple becomes spot. Three names here would raise ValueError.',
      },
      questions: [
        choose(
          'What happens when this program runs?',
          [
            'It prints 5 6',
            'It prints 5 6 and drops 7',
            'It raises ValueError',
            'It prints 5 (6, 7)',
          ],
          2,
          'Two names cannot receive three items, so unpacking raises ValueError.',
          'a, b = (5, 6, 7)\nprint(a, b)',
        ),
        choose(
          'Which line raises ValueError?',
          [
            'p, q = (1, 2)',
            'p, q, r = [1, 2, 3]',
            'p, q = [1, (2, 3)]',
            'p, q, r = (1, 2)',
          ],
          3,
          'Three names need three items, but (1, 2) has only two. The inner tuple in the third line counts as one item.',
        ),
        predictOutput(
          'What does this program print?',
          'left, right = [(1, 2), (3, 4)]\nprint(right)',
          ['(1, 2)', '(3, 4)', '2', '4'],
          1,
          'The list has two items, each a tuple, so right receives the whole second tuple.',
        ),
        choose(
          'Which assignment unpacks data without an error?',
          [
            'a, b, c, d = data',
            'a, b = data',
            'a, b, c = data',
            'a, b, c, d, e = data',
          ],
          0,
          'data has four items, so exactly four names are needed.',
          'data = (4, 9, 2, 6)',
        ),
      ],
    },
    {
      title: 'Swap two values in one line',
      explanation: [
        'In a, b = b, a, Python builds the whole right side from the current values first, then assigns. The two values trade places without a temporary variable.',
        'Two separate assignments, a = b and then b = a, do not swap: the first one overwrites a before its old value is saved.',
      ],
      example: {
        code: 'left = "cup"\nright = "plate"\nleft, right = right, left\nprint(left, right)',
        output: 'plate cup',
        explanation:
          'The right side becomes ("plate", "cup") before any name changes, and that tuple is unpacked into left and right.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'x = 10\ny = 20\nx = y\ny = x\nprint(x, y)',
          ['20 10', '20 20', '10 10', '10 20'],
          1,
          'x = y makes x 20, and then y = x copies that 20 back; the old 10 is lost.',
        ),
        predictOutput(
          'What does this program print?',
          'a, b = 3, 7\na, b = b, a + b\nprint(a, b)',
          ['7 10', '7 14', '10 7', '3 10'],
          0,
          'The right side uses the old values: b is 7 and a + b is 10, then both names are assigned.',
        ),
        predictOutput(
          'What does this program print?',
          'p, q, r = "x", "y", "z"\np, q, r = q, r, p\nprint(p, q, r)',
          ['z x y', 'x y z', 'y z y', 'y z x'],
          3,
          'The right side is built first as ("y", "z", "x"), so p gets y, q gets z, and r gets the old p, x.',
        ),
        choose(
          'Which line exchanges the values of first and last?',
          [
            'first = last',
            'last, first = last, first',
            'first, last = last, first',
            'first, last = first, last',
          ],
          2,
          'The right side takes the old last and first, then assigns them to first and last in that order.',
        ),
      ],
    },
    {
      title: 'Unpack each item in a for loop',
      explanation: [
        'When every item in a list is a tuple, the for line can unpack it: for name, score in results: gives both parts their own names on every pass. Each tuple must have as many items as there are names.',
      ],
      example: {
        code: 'stock = [("pens", 12), ("pads", 5)]\nfor item, count in stock:\n    print(f"{count} {item}")',
        output: '12 pens\n5 pads',
        explanation:
          'On the first pass item is pens and count is 12; on the second, pads and 5.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'for w, h in [(2, 3), (4, 5)]:\n    print(w + h)',
          ['5\n9', '6\n8', '14', '2\n3\n4\n5'],
          0,
          'Each tuple is unpacked separately: 2 + 3, then 4 + 5.',
        ),
        predictOutput(
          'What does this program print?',
          'moves = [("up", 2), ("left", 1)]\nfor direction, steps in moves:\n    print(steps, direction)',
          [
            'up 2\nleft 1',
            '2 up\n1 left',
            '2 1\nup left',
            "('up', 2)\n('left', 1)",
          ],
          1,
          'Each pair is split into direction and steps, and print() shows steps first.',
        ),
        predictOutput(
          'What does this program print?',
          'pairs = [("a", 1), ("b", 2)]\nletters = []\nfor letter, number in pairs:\n    letters.append(letter)\nprint(letters)',
          ["[('a', 1), ('b', 2)]", "['a', 1, 'b', 2]", '[1, 2]', "['a', 'b']"],
          3,
          'Only the first part of each pair, letter, is appended.',
        ),
        choose(
          'Each item of people is a (name, age) tuple. Which loop header gives both parts their own names?',
          [
            'for name in people, age:',
            'for name and age in people:',
            'for name, age in people:',
            'for (name) in people:',
          ],
          2,
          'Comma-separated names after for unpack each tuple as the loop reaches it.',
        ),
      ],
    },
  ],

  ranges: [
    {
      title: 'Count from 0 with range(stop)',
      explanation: [
        'range(stop) produces the integers from 0 up to, but not including, stop. range(4) gives 0, 1, 2, 3: four numbers, so a for loop over it runs its body four times.',
        'A range hands out its numbers one at a time. Wrap it in list() to see them all at once.',
      ],
      example: {
        code: 'for i in range(3):\n    print("lap", i)\nprint(list(range(5)))',
        output: 'lap 0\nlap 1\nlap 2\n[0, 1, 2, 3, 4]',
        explanation:
          'range(3) gives 0, 1, 2, so the body runs three times. list(range(5)) shows five numbers, starting at 0 and stopping before 5.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'for n in range(4):\n    print(n * 2)',
          ['2\n4\n6\n8', '0\n2\n4\n6\n8', '0\n2\n4', '0\n2\n4\n6'],
          3,
          'range(4) gives 0, 1, 2, 3, and each is doubled.',
        ),
        predictOutput(
          'What does this program print?',
          'print(list(range(6)))',
          [
            '[1, 2, 3, 4, 5, 6]',
            '[0, 1, 2, 3, 4, 5, 6]',
            '[0, 1, 2, 3, 4, 5]',
            '[6]',
          ],
          2,
          'The range starts at 0 and excludes 6.',
        ),
        predictOutput(
          'What does this program print?',
          'words = []\nfor i in range(3):\n    words.append("ha")\nprint(words)',
          [
            "['ha', 'ha']",
            "['ha', 'ha', 'ha']",
            "['ha', 'ha', 'ha', 'ha']",
            '[0, 1, 2]',
          ],
          1,
          'range(3) gives three numbers, so the body appends ha three times.',
        ),
        choose(
          'How many times does the body of for k in range(10): run?',
          ['10', '9', '11', '1'],
          0,
          'range(10) gives 0 through 9, which is ten numbers.',
        ),
      ],
    },
    {
      title: 'Start counting at another number with range(start, stop)',
      explanation: [
        'With two arguments, range(start, stop) begins at start and still stops before stop. range(5, 9) gives 5, 6, 7, 8, which is stop - start = 4 numbers.',
        'If start is not below stop, the range is empty.',
      ],
      example: {
        code: 'for year in range(2021, 2025):\n    print(year)',
        output: '2021\n2022\n2023\n2024',
        explanation: 'The start 2021 is included and the stop 2025 is not.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'print(list(range(5, 9)))',
          ['[5, 6, 7, 8, 9]', '[6, 7, 8]', '[5, 6, 7, 8]', '[6, 7, 8, 9]'],
          2,
          'The start 5 is included and the stop 9 is excluded.',
        ),
        choose(
          'Which call produces the integers 1 through 10, including 10?',
          ['range(1, 10)', 'range(10)', 'range(0, 11)', 'range(1, 11)'],
          3,
          'Start at 1, and use 11 as the stop so that 10 is the last number.',
        ),
        predictOutput(
          'What does this program print?',
          'print(list(range(4, 4)))',
          ['[4]', '[]', '[0, 1, 2, 3]', '[4, 4]'],
          1,
          'The range must stop before 4 but starts at 4, so it is empty.',
        ),
        predictOutput(
          'What does this program print?',
          'for n in range(3, 6):\n    print(n * n)',
          ['9\n16\n25', '9\n16\n25\n36', '16\n25\n36', '0\n1\n4'],
          0,
          'n takes 3, 4, and 5, and each is squared.',
        ),
      ],
    },
    {
      title: 'Choose the step, including counting down',
      explanation: [
        'A third argument sets the step: range(0, 20, 5) gives 0, 5, 10, 15. The stop is still excluded, even when the step would land on it.',
        'A negative step counts down: range(10, 0, -3) gives 10, 7, 4, 1. Counting down needs that negative step; range(5, 1) without one is empty.',
      ],
      example: {
        code: 'print(list(range(0, 20, 5)))\nfor n in range(10, 0, -3):\n    print(n)',
        output: '[0, 5, 10, 15]\n10\n7\n4\n1',
        explanation:
          'Adding 5 from 0 stops before 20. Subtracting 3 from 10 gives 7, 4, 1, and the next value, -2, is past the stop 0.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'print(list(range(1, 10, 3)))',
          ['[1, 4, 7, 10]', '[1, 4, 7]', '[3, 6, 9]', '[1, 3, 5, 7, 9]'],
          1,
          'Start at 1 and add 3: 1, 4, 7. The next value, 10, is not below the stop.',
        ),
        predictOutput(
          'What does this program print?',
          'for n in range(6, 0, -2):\n    print(n)',
          ['6\n4\n2', '6\n4\n2\n0', '4\n2\n0', '6\n5\n4\n3\n2\n1'],
          0,
          'Counting down by 2 from 6 gives 6, 4, 2, and the stop 0 is excluded.',
        ),
        choose(
          'Which call counts down 5, 4, 3, 2, 1?',
          [
            'range(5, 1, -1)',
            'range(1, 6, -1)',
            'range(5, 0)',
            'range(5, 0, -1)',
          ],
          3,
          'Start at 5, step by -1, and stop before 0 so that 1 is included.',
        ),
        predictOutput(
          'What does this program print?',
          'print(list(range(5, 1)))',
          ['[5, 4, 3, 2]', '[5, 4, 3, 2, 1]', '[]', '[1, 2, 3, 4]'],
          2,
          'The default step is +1, and counting up from 5 never gets below 1, so the range is empty.',
        ),
      ],
    },
  ],

  'zip-enumerate': [
    {
      title: 'Get each item’s position with enumerate',
      explanation: [
        'enumerate(items) produces (position, item) pairs, with positions starting at 0. Unpack each pair in the for line, as in for i, item in enumerate(items):, to have both the position and the value on every pass.',
        'list(enumerate(items)) shows all the pairs at once.',
      ],
      example: {
        code: 'tasks = ["email", "call", "write"]\nfor i, task in enumerate(tasks):\n    print(i, task)',
        output: '0 email\n1 call\n2 write',
        explanation:
          'The first pair is (0, "email"), so i is 0 and task is email; the positions then go up by one.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'for i, name in enumerate(["Ola", "Pim"]):\n    print(name, i)',
          [
            'Ola 1\nPim 2',
            'Ola 0\nPim 1',
            '0 Ola\n1 Pim',
            "(0, 'Ola')\n(1, 'Pim')",
          ],
          1,
          'Positions start at 0, and print() shows name first because it comes first in the call.',
        ),
        predictOutput(
          'What does this program print?',
          'pairs = list(enumerate([7, 8, 9]))\nprint(pairs[2])',
          ['(2, 9)', '(9, 2)', '(3, 9)', '9'],
          0,
          'The pairs are (0, 7), (1, 8), (2, 9). Index 2 is the third pair, with the position first.',
        ),
        predictOutput(
          'What does this program print?',
          'labels = []\nfor i, w in enumerate(["cat", "dog"]):\n    labels.append(f"{i}:{w}")\nprint(labels)',
          [
            "['1:cat', '2:dog']",
            "['cat:0', 'dog:1']",
            "['0:cat', '0:dog']",
            "['0:cat', '1:dog']",
          ],
          3,
          'i is 0 for cat and 1 for dog, and the f-string puts the position before the word.',
        ),
        choose(
          'In for i, item in enumerate(items):, what is i on the first pass?',
          ['1', 'The first item', '0', 'The length of items'],
          2,
          'enumerate counts positions from 0 unless told otherwise.',
        ),
      ],
    },
    {
      title: 'Start the numbering at another value',
      explanation: [
        'A second argument sets the first number: enumerate(items, 1) counts 1, 2, 3, and so on. Only the numbers change; the items still begin with the first item of the list.',
      ],
      example: {
        code: 'podium = ["Sol", "Tam", "Uri"]\nfor place, runner in enumerate(podium, 1):\n    print(f"#{place} {runner}")',
        output: '#1 Sol\n#2 Tam\n#3 Uri',
        explanation:
          'Counting starts at 1, so the first runner is paired with 1, but no runner is skipped.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'for n, c in enumerate(["red", "teal"], 1):\n    print(n, c)',
          ['0 red\n1 teal', '1 red\n2 teal', '1 teal', '2 red\n3 teal'],
          1,
          'The numbering starts at 1, and every item is still visited, starting with red.',
        ),
        predictOutput(
          'What does this program print?',
          'print(list(enumerate(["a", "b"], 10)))',
          [
            "[(0, 'a'), (1, 'b')]",
            "[(10, 'a'), (20, 'b')]",
            "[(11, 'a'), (12, 'b')]",
            "[(10, 'a'), (11, 'b')]",
          ],
          3,
          'Counting starts at 10 and still goes up by one per item.',
        ),
        choose(
          'Which loop numbers the lines of page as 1, 2, 3, and so on?',
          [
            'for n, line in enumerate(page):',
            'for n, line in enumerate(1, page):',
            'for n, line in enumerate(page, 1):',
            'for line, n in enumerate(page, 1):',
          ],
          2,
          'The list comes first and the starting number second, and the number is the first part of each pair.',
        ),
        predictOutput(
          'What does this program print?',
          'for i, v in enumerate([40, 50], 5):\n    print(i + v)',
          ['45\n56', '40\n51', '45\n55', '5\n6'],
          0,
          'The positions are 5 and 6, so the sums are 5 + 40 and 6 + 50.',
        ),
      ],
    },
    {
      title: 'Walk two lists together with zip',
      explanation: [
        'zip(a, b) pairs the items at the same position: the first item of a with the first of b, the second with the second, and so on. Unpack each pair in the for line, as in for x, y in zip(xs, ys):.',
        'zip does not pair every item with every other item; each position is used once.',
      ],
      example: {
        code: 'cities = ["Rome", "Kyiv"]\ntemps = [24, 17]\nfor city, temp in zip(cities, temps):\n    print(f"{city} {temp}C")',
        output: 'Rome 24C\nKyiv 17C',
        explanation:
          'zip pairs Rome with 24 and Kyiv with 17, the values at matching positions.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'for a, b in zip([2, 3], [10, 100]):\n    print(a * b)',
          ['20\n300', '200\n30', '20\n200\n30\n300', '320'],
          0,
          'zip pairs 2 with 10 and 3 with 100, one pair per position.',
        ),
        predictOutput(
          'What does this program print?',
          'print(list(zip(["x", "y"], [True, False])))',
          [
            "[('x', 'y'), (True, False)]",
            "['x', True, 'y', False]",
            "[('x', True), ('y', False)]",
            "[('x', False), ('y', True)]",
          ],
          2,
          'Each pair takes one item from each list at the same position.',
        ),
        predictOutput(
          'What does this program print?',
          'totals = []\nfor a, b in zip([1, 2], [30, 40]):\n    totals.append(a + b)\nprint(totals)',
          ['[3, 70]', '[31, 41, 32, 42]', '[73]', '[31, 42]'],
          3,
          'The pairs are (1, 30) and (2, 40), so the sums are 31 and 42.',
        ),
        choose(
          'first is ["Ana", "Bo"] and last is ["Diaz", "Eng"]. Which loop header visits Ana with Diaz, then Bo with Eng?',
          [
            'for f, l in first, last:',
            'for f, l in zip(first, last):',
            'for f, l in enumerate(first, last):',
            'for f in first, l in last:',
          ],
          1,
          'zip pairs the items at matching positions of the two lists.',
        ),
      ],
    },
    {
      title: 'Expect zip to stop at the shorter input',
      explanation: [
        'When the inputs have different lengths, zip stops as soon as the shorter one runs out. The extra items of the longer one are silently left out, with no error.',
        'That makes it safe to pair a list with a longer range of numbers: the list decides how many pairs there are.',
      ],
      example: {
        code: 'names = ["Ivy", "Jon", "Kim"]\nseats = [12, 14]\nprint(list(zip(names, seats)))\nfor n, name in zip(range(100, 200), names):\n    print(n, name)',
        output: "[('Ivy', 12), ('Jon', 14)]\n100 Ivy\n101 Jon\n102 Kim",
        explanation:
          'seats has only two items, so Kim gets no pair. In the loop, names is the shorter input, so only three numbers are used.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'print(list(zip([5, 6, 7], [8])))',
          [
            '[(5, 8), (6, None), (7, None)]',
            '[(5, 8)]',
            '[(5, 6, 7), (8,)]',
            '[(5, 8), (6, 8), (7, 8)]',
          ],
          1,
          'The second list has one item, so zip makes one pair and stops.',
        ),
        predictOutput(
          'What does this program print?',
          'pairs = list(zip(["a", "b", "c"], [1, 2]))\nprint(len(pairs))',
          ['3', '5', '2', '6'],
          2,
          'The shorter list has two items, so there are two pairs.',
        ),
        choose(
          'zip is given a list of 5 items and a list of 8 items. How many pairs does it produce?',
          ['5', '8', '13', '40'],
          0,
          'zip stops when the shorter input, with 5 items, runs out.',
        ),
        predictOutput(
          'What does this program print?',
          'for n, w in zip(range(1, 10), ["go", "stop"]):\n    print(n, w)',
          [
            '0 go\n1 stop',
            '1 go\n2 stop\n3 None',
            'go 1\nstop 2',
            '1 go\n2 stop',
          ],
          3,
          'The range starts at 1, and the two-word list ends the pairing after two pairs.',
        ),
      ],
    },
  ],

  accumulators: [
    {
      title: 'Keep a running total across a loop',
      explanation: [
        'An accumulator is a variable that collects a result while a loop runs. Give it a starting value before the loop, 0 for a sum or a count, and update it inside the body. total += n is shorthand for total = total + n.',
        'If the starting value is set inside the loop, it is reset on every pass. With an empty list the body never runs, so the result stays at its starting value.',
      ],
      example: {
        code: 'total = 0\nfor minutes in [25, 40, 15]:\n    total += minutes\nprint(total)',
        output: '80',
        explanation:
          'total goes from 0 to 25, then 65, then 80. It is printed once, after the loop.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'total = 0\nfor x in [4, 6, 1]:\n    total += x\n    print(total)',
          ['4\n10\n11', '11', '4\n6\n1', '11\n11\n11'],
          0,
          'The print is inside the loop, so it shows the running total after each update.',
        ),
        predictOutput(
          'What does this program print?',
          'for n in [3, 5, 2]:\n    total = 0\n    total += n\nprint(total)',
          ['10', '2', '0', '3'],
          1,
          'total is reset to 0 on every pass, so after the loop it holds only the last item, 2.',
        ),
        choose(
          'Which statement means the same as score += 5?',
          [
            'score = 5',
            'score == score + 5',
            'score = 5 + 5',
            'score = score + 5',
          ],
          3,
          '+= adds to the current value and stores the result back in the same name.',
        ),
        predictOutput(
          'What does this program print?',
          'letters = 0\nfor word in ["sun", "moon", "stars"]:\n    letters += len(word)\nprint(letters)',
          ['3', '5', '12', '0'],
          2,
          'Each pass adds the length of one word: 3 + 4 + 5 is 12.',
        ),
      ],
    },
    {
      title: 'Update only when an item meets a rule',
      explanation: [
        'Put the update inside an if in the loop body to count or add only the items that pass a test. Items that fail the test leave the accumulator unchanged.',
        'A count adds 1 for each match, with count += 1. A sum adds the matching item itself.',
      ],
      example: {
        code: 'temps = [18, 27, 31, 22, 29]\nhot_days = 0\nfor t in temps:\n    if t >= 27:\n        hot_days += 1\nprint(hot_days)',
        output: '3',
        explanation:
          '27, 31, and 29 pass the test, so hot_days is increased three times. 18 and 22 change nothing.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'big = 0\nfor price in [12, 3, 40, 7]:\n    if price > 10:\n        big += price\nprint(big)',
          ['2', '62', '52', '59'],
          2,
          'Only 12 and 40 are above 10, and their values are added: 52.',
        ),
        predictOutput(
          'What does this program print?',
          'evens = 0\nfor n in [4, 7, 10, 13, 16]:\n    if n % 2 == 0:\n        evens += 1\nprint(evens)',
          ['3', '2', '30', '5'],
          0,
          '4, 10, and 16 are even, and each match adds 1, not its value.',
        ),
        predictOutput(
          'What does this program print?',
          'passed = 0\nfailed = 0\nfor s in [55, 70, 90, 40, 60]:\n    if s >= 60:\n        passed += 1\n    else:\n        failed += 1\nprint(passed, failed)',
          ['2 3', '3 2', '220 95', '5 2'],
          1,
          '70, 90, and 60 meet s >= 60, including the boundary 60; 55 and 40 go to the else branch.',
        ),
        choose(
          'A loop should count the names longer than 4 characters. Where does count += 1 belong?',
          [
            'Before the loop',
            'In the loop body, before the if',
            'After the loop',
            'Inside the if, inside the loop',
          ],
          3,
          'The update must repeat for each item, but only for items that pass the test.',
        ),
      ],
    },
    {
      title: 'Update with *=, //=, and %=',
      explanation: [
        'The shorthand works with other operators too: total *= 2 means total = total * 2, n //= 10 means n = n // 10, and n %= 7 means n = n % 7. Like +=, each one needs the name to have a value already.',
        'A product starts at 1, not 0, because multiplying anything by 0 gives 0.',
      ],
      example: {
        code: 'product = 1\nfor factor in [2, 3, 4]:\n    product *= factor\nprint(product)\nn = 4096\nn //= 10\nprint(n)\nn %= 7\nprint(n)',
        output: '24\n409\n3',
        explanation:
          'product goes 2, 6, 24. 4096 // 10 drops the last digit, giving 409, and 409 % 7 leaves the remainder 3.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'result = 0\nfor x in [5, 2, 3]:\n    result *= x\nprint(result)',
          ['30', '0', '10', '1'],
          1,
          'result starts at 0, and 0 times any number is still 0.',
        ),
        predictOutput(
          'What does this program print?',
          'n = 7351\nn //= 10\nn //= 10\nprint(n)',
          ['735', '73.51', '73', '51'],
          2,
          'Each //= 10 drops the last digit: 7351 becomes 735, then 73.',
        ),
        predictOutput(
          'What does this program print?',
          'value = 50\nvalue %= 8\nprint(value)',
          ['6', '6.25', '42', '2'],
          3,
          'value %= 8 stores the remainder of 50 divided by 8, which is 2.',
        ),
        choose(
          'A loop will multiply together every number in nums with product *= n. What should product start at?',
          [
            '1',
            '0',
            'The largest number in nums',
            'Nothing; product *= n creates it',
          ],
          0,
          'Starting at 1 leaves the first number unchanged; 0 would make the result 0, and the name must exist before *= runs.',
        ),
      ],
    },
  ],

  'while-loops': [
    {
      title: 'Repeat while a condition is true',
      explanation: [
        'A while loop checks its condition before every pass. While the condition is True, the indented body runs and then the condition is checked again. Once it is False, the program continues after the loop.',
        'If the condition is False at the very first check, the body never runs.',
      ],
      example: {
        code: 'n = 1\nwhile n < 20:\n    print(n)\n    n = n * 3\nprint("stopped at", n)',
        output: '1\n3\n9\nstopped at 27',
        explanation:
          'n is 1, 3, then 9, and each passes n < 20. After the update to 27 the check fails, so the loop ends.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'x = 10\nwhile x < 5:\n    print(x)\n    x = x + 1\nprint("done")',
          ['10\ndone', 'done', '10\n11\n12\n13\n14\ndone', '5\ndone'],
          1,
          '10 < 5 is False at the first check, so the body never runs.',
        ),
        predictOutput(
          'What does this program print?',
          'k = 2\nwhile k <= 8:\n    print(k)\n    k = k + 3',
          ['2\n5', '5\n8\n11', '2\n5\n8', '2\n5\n8\n11'],
          2,
          'k is printed before each update. At 11 the check k <= 8 fails, so 11 is never printed.',
        ),
        choose(
          'A while loop’s condition is False the first time it is checked. How many times does the body run?',
          ['0', '1', 'Until the condition becomes True', 'Forever'],
          0,
          'The condition is checked before the first pass, so a False condition skips the body entirely.',
        ),
        predictOutput(
          'What does this program print?',
          'word = "a"\nwhile len(word) < 4:\n    word = word + "b"\nprint(word)',
          ['abbbb', 'abb', 'ab', 'abbb'],
          3,
          'The loop adds b until the length reaches 4: ab, abb, abbb.',
        ),
      ],
    },
    {
      title: 'Change the condition’s variable so the loop ends',
      explanation: [
        'The body must change something the condition depends on, moving it toward the value that makes the condition False. Otherwise the condition stays True and the loop runs forever.',
        'count -= 1 is shorthand for count = count - 1, and count += 1 for count = count + 1.',
      ],
      example: {
        code: 'balance = 100\nwhile balance >= 30:\n    balance -= 30\n    print(balance)',
        output: '70\n40\n10',
        explanation:
          'Each pass takes 30 away. At 10 the check balance >= 30 fails, so the loop ends.',
      },
      questions: [
        choose(
          'What happens when this program runs?',
          [
            'It prints 5, 4, 3, 2, 1 and then stops',
            'It prints 5 once',
            'It never stops, because t only grows',
            'It prints nothing',
          ],
          2,
          't starts above 0 and increases, so t > 0 never becomes False.',
          't = 5\nwhile t > 0:\n    print(t)\n    t += 1',
        ),
        predictOutput(
          'What does this program print?',
          'level = 0\nwhile level < 10:\n    level += 4\nprint(level)',
          ['8', '10', '16', '12'],
          3,
          'level goes 4, 8, 12. At 8 the check still passes, so one more update makes it 12.',
        ),
        choose(
          'What does stock -= 2 do?',
          [
            'Sets stock to -2',
            'Sets stock to stock - 2',
            'Checks whether stock equals stock - 2',
            'Sets stock to 2 - stock',
          ],
          1,
          '-= subtracts from the current value and stores the result in the same name.',
        ),
        predictOutput(
          'What does this program print?',
          'n = 20\nwhile n > 3:\n    n -= 6\nprint(n)',
          ['2', '8', '-4', '3'],
          0,
          'n goes 14, 8, 2. At 2 the check n > 3 fails, so the loop stops there.',
        ),
      ],
    },
    {
      title: 'Count the passes until a goal is reached',
      explanation: [
        'A while loop fits when you do not know in advance how many passes are needed. Keep a counter beside the changing value and add 1 to it on each pass; when the loop ends, the counter says how many passes ran.',
        'Trace the values pass by pass, and check the last one carefully: it is the first value that makes the condition False.',
      ],
      example: {
        code: 'height = 1\nyears = 0\nwhile height < 50:\n    height = height * 2\n    years += 1\nprint(years, height)',
        output: '6 64',
        explanation:
          'height doubles to 2, 4, 8, 16, 32, 64. That is six passes, and 64 is the first value not below 50.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'n = 345\ndigits = 0\nwhile n > 0:\n    n = n // 10\n    digits += 1\nprint(digits)',
          ['3', '345', '2', '4'],
          0,
          'n goes 34, 3, 0, one pass per digit, so the counter reaches 3.',
        ),
        predictOutput(
          'What does this program print?',
          'total = 0\nn = 1\nwhile total < 10:\n    total += n\n    n += 1\nprint(n, total)',
          ['4 10', '5 10', '5 15', '4 6'],
          1,
          'total goes 1, 3, 6, 10 while n goes 2, 3, 4, 5. At 10 the loop stops.',
        ),
        predictOutput(
          'What does this program print?',
          'text = ""\ncount = 3\nwhile count > 0:\n    text = text + str(count)\n    count -= 1\nprint(text)',
          ['123', '3210', '6', '321'],
          3,
          'The digits are joined as text in the order 3, 2, 1, and the loop stops before adding 0.',
        ),
        choose(
          'Savings start at 0 and grow by 20 each week until they reach at least 100. Which line starts that loop?',
          [
            'while savings >= 100:',
            'while savings <= 100:',
            'while savings < 100:',
            'while savings == 100:',
          ],
          2,
          'The loop should continue only while savings are below 100; <= would add one more week at exactly 100.',
        ),
      ],
    },
  ],

  'break-continue': [
    {
      title: 'Leave a loop early with break',
      explanation: [
        'break ends the loop immediately, even if items remain. Execution continues with the first statement after the loop.',
        'break normally sits inside an if, so the loop stops only when a condition holds.',
      ],
      example: {
        code: 'for word in ["plan", "build", "STOP", "test"]:\n    if word == "STOP":\n        break\n    print(word)\nprint("after loop")',
        output: 'plan\nbuild\nafter loop',
        explanation:
          'plan and build are printed. At STOP, break ends the loop, so test is never visited, and the line after the loop runs.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'for n in [3, 8, 2, 9]:\n    if n > 5:\n        break\n    print(n)\nprint("end")',
          ['3\n2\nend', '3\nend', '3', '3\n8\nend'],
          1,
          '8 triggers break before it is printed, so 2 and 9 are never visited; the line after the loop still runs.',
        ),
        predictOutput(
          'What does this program print?',
          'first_big = 0\nfor n in [4, 12, 7, 30]:\n    if n > 10:\n        first_big = n\n        break\nprint(first_big)',
          ['30', '0', '12', '4'],
          2,
          '12 is the first value above 10. break stops the loop there, so 30 is never checked.',
        ),
        choose(
          'When break runs inside a loop, where does execution continue?',
          [
            'At the first statement after the loop',
            'At the top of the loop, with the next item',
            'At the statement right after break',
            'At the start of the program',
          ],
          0,
          'break leaves the loop completely; the program goes on after it.',
        ),
        predictOutput(
          'What does this program print?',
          'n = 0\nwhile n < 10:\n    n += 3\n    if n == 6:\n        break\nprint(n)',
          ['9', '12', '3', '6'],
          3,
          'n becomes 3, then 6, and break ends the loop while n is 6.',
        ),
      ],
    },
    {
      title: 'Skip the rest of one pass with continue',
      explanation: [
        'continue ends only the current pass. The rest of the body is skipped, and the loop goes on to its next item; in a while loop it goes back to the condition check. The loop itself keeps running.',
      ],
      example: {
        code: 'for score in [72, -1, 85, -1, 90]:\n    if score < 0:\n        continue\n    print(score)',
        output: '72\n85\n90',
        explanation:
          'For each -1, continue skips the print. The loop still reaches 85 and 90.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'for x in [1, 2, 3, 4, 5]:\n    if x % 2 == 0:\n        continue\n    print(x)',
          ['1\n3\n5', '2\n4', '1', '1\n2\n3\n4\n5'],
          0,
          'Even numbers hit continue and skip the print; the loop goes on to the next number.',
        ),
        predictOutput(
          'What does this program print?',
          'for c in ["x", "y", "z"]:\n    print(c)\n    if c == "y":\n        continue\n    print("-")',
          ['x\n-\ny', 'x\n-\nz\n-', 'x\n-\ny\n-\nz\n-', 'x\n-\ny\nz\n-'],
          3,
          'y is printed first; then continue skips only its dash, and the loop moves on to z.',
        ),
        choose(
          'When line is an empty string, which statements are skipped for that item?',
          [
            'Only print("checking")',
            'Both prints inside the loop',
            'Everything, including print("finished")',
            'Nothing; the loop body runs as usual',
          ],
          1,
          'continue skips the rest of that pass, which is both prints. The line after the loop is not part of the pass.',
          'for line in lines:\n    if line == "":\n        continue\n    print("checking")\n    print(line)\nprint("finished")',
        ),
        predictOutput(
          'What does this program print?',
          'n = 0\nwhile n < 5:\n    n += 1\n    if n == 3:\n        continue\n    print(n)',
          ['1\n2', '1\n2\n3\n4\n5', '1\n2\n4\n5', '0\n1\n2\n4'],
          2,
          'When n is 3, continue skips the print and goes back to the check. n was already increased, so the loop goes on.',
        ),
      ],
    },
    {
      title: 'Loop with while True until a break',
      explanation: [
        'The condition in while True: never becomes False, so the only way out is a break. This suits loops whose stopping test is easiest to write in the middle of the body.',
        'Make sure some path always reaches the break; otherwise the loop never ends.',
      ],
      example: {
        code: 'n = 1\nwhile True:\n    n = n * 2\n    if n > 40:\n        break\nprint(n)',
        output: '64',
        explanation:
          'n doubles to 2, 4, 8, 16, 32, 64. The check after each update first passes at 64, and break ends the loop.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'count = 0\nwhile True:\n    count += 1\n    if count == 4:\n        break\n    print(count)',
          ['1\n2\n3\n4', '1\n2\n3', '0\n1\n2\n3', '4'],
          1,
          'When count reaches 4, break runs before the print, so 4 is never printed.',
        ),
        choose(
          'What makes a while True: loop stop?',
          [
            'Its condition becoming False',
            'The body running once',
            'A break statement running',
            'A continue statement running',
          ],
          2,
          'The condition True never changes, so only break can end the loop.',
        ),
        predictOutput(
          'What does this program print?',
          'total = 100\nwhile True:\n    total -= 30\n    if total < 0:\n        break\nprint(total)',
          ['-20', '10', '-50', '0'],
          0,
          'total goes 70, 40, 10, -20. The first value below 0 triggers break, and it is printed.',
        ),
        choose(
          'What happens when this program runs?',
          [
            'It stops after one pass, when x is 6',
            'It never enters the body of the loop',
            'It stops at once, because x starts at 5',
            'It runs forever; x is never 5 again',
          ],
          3,
          'x starts at 5 and becomes 6 before the first check, so x == 5 is never True and break never runs.',
          'x = 5\nwhile True:\n    x += 1\n    if x == 5:\n        break',
        ),
      ],
    },
    {
      title: 'Know that break and continue act on the inner loop',
      explanation: [
        'A loop can sit inside another loop’s body. For each item of the outer loop, the inner loop runs completely.',
        'A break or continue inside the inner loop affects only that inner loop. The outer loop then carries on with the rest of its body and its next item.',
      ],
      example: {
        code: 'for row in ["A", "B"]:\n    for seat in [1, 2, 3]:\n        if seat == 2:\n            break\n        print(row, seat)\n    print("next row")',
        output: 'A 1\nnext row\nB 1\nnext row',
        explanation:
          'break ends the seat loop at 2, but the row loop goes on: it prints next row and then starts again with B.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'for a in [1, 2]:\n    for b in [10, 20, 30]:\n        if b == 20:\n            break\n        print(a, b)',
          ['1 10', '1 10\n2 10', '1 10\n1 30\n2 10\n2 30', '1 10\n2 10\n2 20'],
          1,
          'break ends only the inner loop at 20; the outer loop still moves on to 2.',
        ),
        predictOutput(
          'What does this program print?',
          'for x in ["p", "q"]:\n    for y in [1, 2]:\n        if y == 1:\n            continue\n        print(x, y)',
          ['p 2', 'p 1\nq 1', 'p 2\nq 2', 'q 2'],
          2,
          'continue skips y = 1 in the inner loop each time, and the outer loop runs for both p and q.',
        ),
        choose(
          'A break runs inside an inner loop while the outer loop is on its first item. What happens next?',
          [
            'Both loops end at once',
            'The inner loop starts again from its first item',
            'The program stops at the break',
            'The outer loop goes on to its next item',
          ],
          3,
          'break ends only the loop that directly contains it; the outer loop runs the rest of its body and goes on to its next item.',
        ),
        predictOutput(
          'What does this program print?',
          'for word in ["ab", "cd"]:\n    for letter in ["x", "y"]:\n        print(word + letter)\n        break\n    print("done", word)',
          [
            'abx\ndone ab\ncdx\ndone cd',
            'abx',
            'abx\ndone ab',
            'abx\naby\ndone ab\ncdx\ncdy\ndone cd',
          ],
          0,
          'The inner loop prints one combination and breaks; the outer loop prints its line and moves on to cd.',
        ),
      ],
    },
  ],

  'list-mutation': [
    {
      title: 'Replace an item by index and add one with append',
      explanation: [
        'Lists are mutable: they can change after they are made. items[index] = value replaces the item at that position, and items.append(value) adds a new item at the end.',
        'Index assignment only replaces an existing position. Assigning to an index past the end raises IndexError instead of growing the list.',
      ],
      example: {
        code: 'seats = ["Ana", "Ben", "Cy"]\nseats[1] = "Dee"\nseats.append("Eli")\nprint(seats)\nprint(len(seats))',
        output: "['Ana', 'Dee', 'Cy', 'Eli']\n4",
        explanation:
          'Dee replaces Ben at index 1 without changing the length; append then adds Eli as a fourth item.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'nums = [5, 10, 15]\nnums[0] = nums[2]\nprint(nums)',
          ['[15, 10, 5]', '[15, 10, 15]', '[5, 10, 5]', '[15, 10]'],
          1,
          'The value at index 2 is copied into index 0; index 2 itself does not change.',
        ),
        predictOutput(
          'What does this program print?',
          'letters = ["a", "b", "c"]\nletters[-1] = "z"\nletters.append("y")\nprint(letters)',
          [
            "['a', 'b', 'c', 'z', 'y']",
            "['z', 'b', 'c', 'y']",
            "['a', 'b', 'z', 'y']",
            "['a', 'b', 'y', 'z']",
          ],
          2,
          'z replaces the last item c, and then y is added after it.',
        ),
        choose(
          'Which statement changes scores to [3, 9, 7]?',
          [
            'scores[3] = 7',
            'scores.append(7)',
            'scores[7] = 2',
            'scores[2] = 7',
          ],
          3,
          'The 4 is at index 2, so assigning to scores[2] replaces it.',
          'scores = [3, 9, 4]',
        ),
        choose(
          'What happens when this program runs?',
          [
            'It raises IndexError',
            'items becomes ["a", "b", "c"]',
            'items becomes ["a", "c"]',
            'items becomes ["c", "a", "b"]',
          ],
          0,
          'Index 2 does not exist in a two-item list, and index assignment cannot add items; append would.',
          'items = ["a", "b"]\nitems[2] = "c"',
        ),
      ],
    },
    {
      title: 'Remove the last item with pop()',
      explanation: [
        'items.pop() removes the last item and gives it back, so you can store it, as in last = items.pop(). Afterwards the list is one item shorter.',
      ],
      example: {
        code: 'stack = ["red", "green", "blue"]\ntop = stack.pop()\nprint(top)\nprint(stack)',
        output: "blue\n['red', 'green']",
        explanation:
          'pop() takes blue off the end and returns it into top; stack keeps the remaining two items.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'cards = [7, 2, 9]\nlast = cards.pop()\nprint(last, len(cards))',
          ['9 2', '7 2', '9 3', '2 2'],
          0,
          'pop() returns the last item, 9, and the list is left with two items.',
        ),
        predictOutput(
          'What does this program print?',
          'q = ["a", "b", "c"]\nq.pop()\nq.pop()\nprint(q)',
          ["['c']", "['a']", "['a', 'b']", '[]'],
          1,
          'Each pop() removes the current last item: first c, then b.',
        ),
        choose(
          'What does x = values.pop() store in x?',
          [
            'The list without its last item',
            'The first item of values',
            'The item that was removed from the end',
            'Nothing, because pop() only changes the list',
          ],
          2,
          'pop() both shortens the list and returns the item it removed.',
        ),
        predictOutput(
          'What does this program print?',
          'todo = ["wash", "cook"]\ndone = []\ndone.append(todo.pop())\nprint(todo, done)',
          [
            "['cook'] ['wash']",
            "['wash', 'cook'] ['cook']",
            "[] ['wash', 'cook']",
            "['wash'] ['cook']",
          ],
          3,
          'pop() removes cook from the end of todo, and append adds it to done.',
        ),
      ],
    },
    {
      title: 'Know when two names share one list',
      explanation: [
        'b = a does not copy a list; it makes b a second name for the same list. A change made through either name shows up through both.',
        'a.copy() makes a separate list with the same items, so later changes to one list do not affect the other.',
      ],
      example: {
        code: 'original = [1, 2, 3]\nsame = original\nseparate = original.copy()\nsame.append(4)\nseparate[0] = 99\nprint(original)\nprint(separate)',
        output: '[1, 2, 3, 4]\n[99, 2, 3]',
        explanation:
          'same is the same list as original, so the append shows up in original. separate is its own list, so its change stays there.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'a = [1, 2]\nb = a\nb[0] = 5\nprint(a)',
          ['[1, 2]', '[5, 2]', '[5, 1, 2]', '[1, 5]'],
          1,
          'a and b name the same list, so changing it through b also changes what a shows.',
        ),
        predictOutput(
          'What does this program print?',
          'a = [3, 4]\nb = a.copy()\nb.append(5)\nprint(a, b)',
          [
            '[3, 4] [3, 4, 5]',
            '[3, 4, 5] [3, 4, 5]',
            '[3, 4] [5]',
            '[3, 4, 5] [3, 4]',
          ],
          0,
          'copy() makes a separate list holding the same items, so only b gains 5.',
        ),
        choose(
          'Which line makes backup a separate list, so that later changes to plan do not affect it?',
          [
            'backup = plan',
            'backup = [plan]',
            'backup.append(plan)',
            'backup = plan.copy()',
          ],
          3,
          'copy() creates a new list; plain assignment only adds another name for the same one.',
        ),
        predictOutput(
          'What does this program print?',
          'x = [0]\ny = x\ny.append(1)\nz = y.copy()\nz.append(2)\nprint(x)\nprint(z)',
          [
            '[0]\n[0, 1, 2]',
            '[0, 1, 2]\n[0, 1, 2]',
            '[0, 1]\n[0, 1, 2]',
            '[0]\n[0, 2]',
          ],
          2,
          'x and y share a list, so x gets the 1. z is a copy made after that, so only z gets the 2.',
        ),
      ],
    },
  ],

  'list-repetition': [
    {
      title: 'Make a list of n copies with [value] * n',
      explanation: [
        '[value] * n builds a new list holding n copies of value: [0] * 4 is [0, 0, 0, 0]. It works for any simple value, such as False, None, or an empty string.',
        'This is the quick way to make one slot per position before a loop fills them in.',
      ],
      example: {
        code: 'zeros = [0] * 5\nflags = [False] * 3\nprint(zeros)\nprint(flags)\nprint(len(["-"] * 8))',
        output: '[0, 0, 0, 0, 0]\n[False, False, False]\n8',
        explanation:
          'Each one-item list is repeated end to end, so the result has as many items as the number after *.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'print([7] * 3)',
          ['[21]', '[7, 7, 7]', '[7, 3]', '[777]'],
          1,
          'Multiplying a list repeats its items; it does not multiply the number inside.',
        ),
        predictOutput(
          'What does this program print?',
          'slots = [None] * 2\nprint(slots)',
          ['[None, None]', '[None]', '[[None], [None]]', '[0, 0]'],
          0,
          'None is a value like any other, so the list holds two copies of it.',
        ),
        predictOutput(
          'What does this program print?',
          'print(len([1, 2] * 3))',
          ['3', '2', '6', '9'],
          2,
          'The two-item list is repeated three times end to end, giving six items.',
        ),
        choose(
          'Which expression builds a list of 4 empty strings?',
          ['"" * 4', '[] * 4', '[4] * ""', '[""] * 4'],
          3,
          'The value to repeat goes inside the brackets. "" * 4 is still one empty string, and [] * 4 is an empty list.',
        ),
      ],
    },
    {
      title: 'Join two lists with +',
      explanation: [
        'The + operator joins two lists into a new list: the items of the left list, then the items of the right. The original lists are not changed. Both sides must be lists: [1, 2] + 3 raises TypeError.',
        'It combines with repetition, and the repetition happens first: [0] * 2 + [5] is [0, 0, 5].',
      ],
      example: {
        code: 'front = ["ace", "king"]\nback = ["two", "three"]\ndeck = front + back\nprint(deck)\nprint(front)\nprint([0] * 2 + [1] * 3)',
        output:
          "['ace', 'king', 'two', 'three']\n['ace', 'king']\n[0, 0, 1, 1, 1]",
        explanation:
          'deck is a new list with front’s items followed by back’s, and front is unchanged. The last line builds two zeros and three ones, then joins them.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'a = [1, 2]\nb = [3]\nprint(b + a)',
          ['[1, 2, 3]', '[3, 1, 2]', '[4, 5]', '[6]'],
          1,
          '+ joins the lists in the order written, so b’s item comes first.',
        ),
        predictOutput(
          'What does this program print?',
          'row = ["#"] + ["."] * 3 + ["#"]\nprint(row)',
          [
            "['#', '.', '#', '.', '#', '.', '#']",
            "['#', '...', '#']",
            "['#', '.', '.', '.', '#']",
            "['#', '.', '#']",
          ],
          2,
          'Repetition happens first, making three dots, and then the three lists are joined.',
        ),
        predictOutput(
          'What does this program print?',
          'a = [5]\nb = a + [6]\nprint(a, b)',
          ['[5] [5, 6]', '[5, 6] [5, 6]', '[5] [6]', '[5] [11]'],
          0,
          '+ builds a new list for b and leaves a unchanged.',
        ),
        choose(
          'Which expression evaluates to [1, 2, 3]?',
          ['[1, 2] + 3', '[1] + [2] * 2', '[1, 2] * [3]', '[1, 2] + [3]'],
          3,
          'Both sides of + must be lists. [1] + [2] * 2 gives [1, 2, 2], and the other two raise TypeError.',
        ),
      ],
    },
    {
      title: 'Update one slot by its index',
      explanation: [
        'Once the list exists, change one slot by its index: seen[i] = True sets it, and counts[i] += 1 adds to it. Every other slot keeps its value.',
        'Inside a loop, the index can come from the data itself, so each item updates its own slot.',
      ],
      example: {
        code: 'seen = [False] * 4\nseen[2] = True\nseen[0] = True\nprint(seen)\nhits = [0] * 3\nhits[1] += 5\nhits[1] += 2\nprint(hits)',
        output: '[True, False, True, False]\n[0, 7, 0]',
        explanation:
          'Only indexes 2 and 0 of seen change. Both updates to hits go to index 1, which reaches 7 while the others stay 0.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'marks = [0] * 3\nmarks[0] += 1\nmarks[2] += 4\nmarks[0] += 1\nprint(marks)',
          ['[2, 0, 4]', '[1, 0, 4]', '[6, 6, 6]', '[2, 4, 0]'],
          0,
          'Index 0 is increased twice and index 2 once; the slots change independently.',
        ),
        predictOutput(
          'What does this program print?',
          'used = [False] * 5\nfor n in [4, 1, 4]:\n    used[n] = True\nprint(used)',
          [
            '[True, False, False, True, False]',
            '[False, True, False, False, True]',
            '[False, True, False, False, False]',
            '[True, True, True, True, True]',
          ],
          1,
          'Indexes 4 and 1 are set to True. Setting index 4 a second time leaves it True.',
        ),
        choose(
          'Which statement adds 1 to the last slot of board?',
          ['board[6] += 1', 'board += 1', 'board[5] += 1', 'board.append(1)'],
          2,
          'Six slots have indexes 0 to 5, so the last slot is board[5].',
          'board = [0] * 6',
        ),
        predictOutput(
          'What does this program print?',
          'bins = [0] * 2\nfor n in [3, 8, 5, 10, 1]:\n    if n % 2 == 0:\n        bins[0] += 1\n    else:\n        bins[1] += 1\nprint(bins)',
          ['[3, 2]', '[18, 9]', '[5, 5]', '[2, 3]'],
          3,
          'Slot 0 counts the even numbers 8 and 10; slot 1 counts the odd numbers 3, 5, and 1.',
        ),
      ],
    },
    {
      title: 'Size the list so every value has a slot',
      explanation: [
        'To use values directly as indexes, the list needs a slot for every possible value. Values 0 through n need n + 1 slots, because the largest index, n, must exist.',
        'With one slot too few, the largest value raises IndexError. With enough slots, counts[value] += 1 tallies each value in its own slot.',
      ],
      example: {
        code: 'ages = [3, 0, 5, 3, 3]\ncounts = [0] * (5 + 1)\nfor age in ages:\n    counts[age] += 1\nprint(len(counts))\nprint(counts)',
        output: '6\n[1, 0, 0, 3, 0, 1]',
        explanation:
          'Ages run from 0 to 5, so six slots are needed. Each age adds one to the slot with that index.',
      },
      questions: [
        choose(
          'Scores range from 0 to 20. How many slots does a tally list indexed by score need?',
          ['20', '21', '19', '22'],
          1,
          'Indexes 0 through 20 are 21 positions: n + 1 with n = 20.',
        ),
        choose(
          'What happens when this program runs?',
          [
            'It raises IndexError when n is 5',
            'counts becomes [0, 1, 1, 0, 0, 1]',
            'The 5 is skipped and counts becomes [0, 1, 1, 0, 0]',
            'counts becomes [0, 1, 1, 0, 1]',
          ],
          0,
          'Five slots have indexes 0 to 4, so counts[5] does not exist and the list does not grow.',
          'counts = [0] * 5\nfor n in [1, 5, 2]:\n    counts[n] += 1',
        ),
        predictOutput(
          'What does this program print?',
          'days = [1, 3, 3, 0, 3]\ntally = [0] * 4\nfor d in days:\n    tally[d] += 1\nprint(tally[3], tally[2])',
          ['0 3', '3 1', '2 0', '3 0'],
          3,
          'The value 3 appears three times, and no day has the value 2.',
        ),
        predictOutput(
          'What does this program print?',
          'n = 6\nslots = [0] * (n + 1)\nslots[n] = 1\nprint(len(slots))\nprint(slots)',
          [
            '6\n[0, 0, 0, 0, 0, 1]',
            '7\n[0, 0, 0, 0, 0, 1, 0]',
            '7\n[0, 0, 0, 0, 0, 0, 1]',
            '6\n[0, 0, 0, 0, 0, 0, 1]',
          ],
          2,
          'n + 1 is 7 slots, so index 6 exists and is the last slot.',
        ),
      ],
    },
  ],

  'nested-lists': [
    {
      title: 'Pick a row, then a cell, with two indexes',
      explanation: [
        'A list can hold other lists. A grid stored as rows is a list of row lists: grid[r] is the whole row r, and grid[r][c] indexes into that row to get one cell.',
        'The first index picks the row and the second picks the position inside it. Negative indexes work at both levels.',
      ],
      example: {
        code: 'seats = [["A1", "A2", "A3"], ["B1", "B2", "B3"]]\nprint(seats[1])\nprint(seats[1][2])\nprint(seats[0][-1])',
        output: "['B1', 'B2', 'B3']\nB3\nA3",
        explanation:
          'seats[1] is the second row. Index 2 of that row is B3, and -1 of the first row is its last cell, A3.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'm = [[4, 7], [1, 9], [3, 5]]\nprint(m[1][0])',
          ['7', '1', '9', '3'],
          1,
          'm[1] is the row [1, 9], and index 0 of that row is 1.',
        ),
        predictOutput(
          'What does this program print?',
          'grid = [["a", "b"], ["c", "d"]]\nprint(grid[0])',
          ["['a', 'c']", 'a', "['a', 'b']", "['a']"],
          2,
          'One index selects a whole row, the first inner list.',
        ),
        predictOutput(
          'What does this program print?',
          't = [[2, 4, 6], [8, 10, 12]]\nprint(t[-1][-1] + t[0][1])',
          ['20', '14', '18', '16'],
          3,
          't[-1][-1] is the last cell of the last row, 12, and t[0][1] is 4.',
        ),
        choose(
          'In grid[2][0], what does the 2 select?',
          [
            'The row at index 2',
            'The column at index 2',
            'The cell at index 2 of row 0',
            'The second row',
          ],
          0,
          'The first index picks a row, counting from 0; the second index picks a cell in that row.',
        ),
      ],
    },
    {
      title: 'Count the rows and the items in a row',
      explanation: [
        'len(grid) counts the rows, not the cells. len(grid[r]) counts the items in row r.',
        'Rows can have different lengths, so measure the row you are working with instead of assuming every row matches the first.',
      ],
      example: {
        code: 'week = [[8, 6], [7, 9, 5], [10]]\nprint(len(week))\nprint(len(week[1]))\nprint(len(week[2]))',
        output: '3\n3\n1',
        explanation:
          'week holds three rows. The second row has three items and the third has one.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'g = [[1, 2, 3, 4], [5, 6, 7, 8]]\nprint(len(g), len(g[1]))',
          ['4 2', '2 4', '8 4', '2 2'],
          1,
          'g has two rows, and row 1 holds four items.',
        ),
        predictOutput(
          'What does this program print?',
          'rows = [["x"], ["y", "z"], []]\nprint(len(rows))\nprint(len(rows[-1]))',
          ['3\n2', '2\n0', '3\n0', '3\n1'],
          2,
          'An empty row still counts as a row, so there are three; that last row has 0 items.',
        ),
        choose(
          'board has 5 rows with 7 cells in each row. What is len(board)?',
          ['5', '7', '35', '12'],
          0,
          'len() of the outer list counts its items, which are the 5 rows.',
        ),
        choose(
          'Rows of grid can have different lengths. Which expression gives the number of items in row r?',
          ['len(grid)', 'len(grid[0])', 'len(grid)[r]', 'len(grid[r])'],
          3,
          'grid[r] is row r itself, and len() of it counts that row’s items.',
        ),
      ],
    },
    {
      title: 'Change one cell with grid[r][c] = value',
      explanation: [
        'grid[r][c] = value replaces one cell inside the existing grid; every other cell stays as it was. Assigning grid[r] = value instead replaces the whole row.',
        'A row taken out with row = grid[r] is the same list as the one inside grid, so changing row changes grid too.',
      ],
      example: {
        code: 'board = [[".", ".", "."], [".", ".", "."]]\nboard[1][2] = "X"\nboard[0][0] = "O"\nprint(board[0])\nprint(board[1])',
        output: "['O', '.', '.']\n['.', '.', 'X']",
        explanation:
          'X goes to row 1, index 2, and O to row 0, index 0. Each assignment changes a single cell.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'g = [[0, 0], [0, 0]]\ng[0][1] = 5\nprint(g)',
          [
            '[[0, 0], [5, 0]]',
            '[[0, 5], [0, 0]]',
            '[[5, 5], [0, 0]]',
            '[[0, 5], [0, 5]]',
          ],
          1,
          'Row 0, index 1 is the second cell of the first row; nothing else changes.',
        ),
        predictOutput(
          'What does this program print?',
          'g = [[1, 2], [3, 4]]\ng[1] = [9]\nprint(g)',
          [
            '[[1, 2], [9, 4]]',
            '[[1, 9], [3, 9]]',
            '[[1, 2], [9]]',
            '[[1, 2], [3, 9]]',
          ],
          2,
          'With one index, the whole second row is replaced by the new list [9].',
        ),
        choose(
          'Which statement puts "Q" in the third cell of the first row of board?',
          [
            'board[2][0] = "Q"',
            'board[1][3] = "Q"',
            'board[0] = "Q"',
            'board[0][2] = "Q"',
          ],
          3,
          'The first row is index 0, and its third cell is index 2.',
        ),
        predictOutput(
          'What does this program print?',
          'g = [[1, 2], [3, 4]]\nrow = g[0]\nrow[1] = 7\nprint(g)',
          [
            '[[1, 7], [3, 4]]',
            '[[1, 2], [3, 4]]',
            '[[7, 2], [3, 4]]',
            '[[1, 7], [3, 7]]',
          ],
          0,
          'row and g[0] are the same list, so changing row changes the first row of g.',
        ),
      ],
    },
    {
      title: 'Visit every cell with nested loops',
      explanation: [
        'A loop inside another loop visits every cell. The outer loop picks a row, and the inner loop runs completely over that row before the outer loop moves on, so cells come out row by row, left to right.',
        'Looping over each row itself handles rows of any length.',
      ],
      example: {
        code: 'grid = [[1, 2, 3], [4, 5, 6]]\nfor row in grid:\n    for value in row:\n        print(value * 10)\n    print("end of row")',
        output: '10\n20\n30\nend of row\n40\n50\n60\nend of row',
        explanation:
          'The inner loop finishes the first row before the outer loop prints end of row and moves on to the second row.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'pairs = []\nfor a in ["x", "y"]:\n    for b in [1, 2]:\n        pairs.append(a + str(b))\nprint(pairs)',
          [
            "['x1', 'x2', 'y1', 'y2']",
            "['x1', 'y1', 'x2', 'y2']",
            "['x1', 'y2']",
            "['x12', 'y12']",
          ],
          0,
          'For x the inner loop adds x1 and x2 before the outer loop moves on to y.',
        ),
        predictOutput(
          'What does this program print?',
          'm = [[1, 2], [3, 4]]\nfor row in m:\n    for v in row:\n        print(v)',
          ['1\n3\n2\n4', '1\n2\n3\n4', '[1, 2]\n[3, 4]', '1\n2'],
          1,
          'The cells come out row by row: all of the first row, then all of the second.',
        ),
        choose(
          'An outer loop goes over 3 rows, and an inner loop goes over the 4 cells of each row. How many times does the inner body run in total?',
          ['7', '4', '12', '3'],
          2,
          'The inner loop runs 4 times for each of the 3 rows: 3 × 4 = 12.',
        ),
        predictOutput(
          'What does this program print?',
          'rows = [[5], [6, 7], [8, 9, 10]]\nfor row in rows:\n    out = []\n    for v in row:\n        out.append(v * 2)\n    print(out)',
          [
            '[10, 12, 14, 16, 18, 20]',
            '[16, 18, 20]',
            '[10]\n[10, 12, 14]\n[10, 12, 14, 16, 18, 20]',
            '[10]\n[12, 14]\n[16, 18, 20]',
          ],
          3,
          'out is reset for each row and printed after that row’s inner loop, so each row gives one line.',
        ),
      ],
    },
  ],
  slicing: [
    {
      title: 'Take the items from start up to stop',
      explanation: [
        'sequence[start:stop] gives a new list with the items at positions start, start + 1, and so on, up to but not including stop. The slice therefore has stop - start items.',
        'Slicing a string works the same way and gives a shorter string made of those characters.',
      ],
      example: {
        code: 'days = ["mon", "tue", "wed", "thu", "fri"]\nprint(days[1:4])\nword = "keyboard"\nprint(word[3:6])',
        output: "['tue', 'wed', 'thu']\nboa",
        explanation:
          'days[1:4] takes positions 1, 2 and 3 and stops before 4. In keyboard, positions 3, 4 and 5 hold b, o and a.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'nums = [5, 10, 15, 20, 25, 30]\nprint(nums[2:5])',
          [
            '[10, 15, 20]',
            '[15, 20, 25, 30]',
            '[15, 20, 25]',
            '[10, 15, 20, 25]',
          ],
          2,
          'Positions 2, 3 and 4 hold 15, 20 and 25; position 5 is the stop and is left out.',
        ),
        predictOutput(
          'What is printed?',
          'city = "barcelona"\nprint(city[3:7])',
          ['rcel', 'celo', 'celon', 'arce'],
          1,
          'Counting from 0, positions 3 to 6 are c, e, l and o. The character at the stop, n, is excluded.',
        ),
        choose(
          'items holds 10 values. How many values are in items[2:6]?',
          ['4', '5', '6', '3'],
          0,
          'The slice takes positions 2, 3, 4 and 5, which is stop - start = 4 items.',
        ),
        predictOutput(
          'What does this program print?',
          'letters = ["a", "b", "c", "d", "e"]\npart = letters[0:2]\nprint(len(part), part[1])',
          ['3 c', '2 a', '3 b', '2 b'],
          3,
          'part is ["a", "b"], so it has 2 items and its position 1 holds b.',
        ),
      ],
    },
    {
      title: 'Leave out an end, or count from the end',
      explanation: [
        'Leaving out start begins the slice at the first item, and leaving out stop runs it to the end. So s[:3] is the first three items and s[3:] is everything from position 3 on.',
        'Negative positions work in slices just as in indexing: s[-2:] is the last two items, and s[:-1] is everything except the last item.',
      ],
      example: {
        code: 'code = "AB-1234"\nprint(code[:2])\nprint(code[3:])\nprint(code[-2:])',
        output: 'AB\n1234\n34',
        explanation:
          'code[:2] stops before position 2, code[3:] starts at the 1 and runs to the end, and code[-2:] starts two characters from the end.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'scores = [70, 82, 91, 64, 88]\nprint(scores[:2])',
          ['[70, 82, 91]', '[70, 82]', '[91, 64, 88]', '[82, 91]'],
          1,
          'With no start, the slice begins at position 0 and stops before position 2.',
        ),
        predictOutput(
          'What is printed?',
          'name = "Lovelace"\nprint(name[4:])',
          ['elace', 'Love', 'lace', 'ace'],
          2,
          'Position 4 is the second l; with no stop, the slice runs to the end of the string.',
        ),
        predictOutput(
          'What does this program print?',
          'queue = ["ana", "ben", "cy", "dee"]\nprint(queue[-2:])',
          ["['ana', 'ben']", "['dee']", "['ben', 'cy']", "['cy', 'dee']"],
          3,
          'Position -2 is cy, and leaving out stop keeps everything from there to the end.',
        ),
        choose(
          'Which slice gives every character of text except the last one?',
          ['text[:-1]', 'text[-1:]', 'text[1:]', 'text[:1]'],
          0,
          'text[:-1] starts at the beginning and stops before the last position.',
        ),
      ],
    },
    {
      title: 'Step through a sequence, or reverse it',
      explanation: [
        'A third number sets the step. s[::2] takes every second item starting from the first, and s[1::2] does the same starting from position 1. Start and stop keep their usual meaning; the step only says how far to jump each time.',
        'A step of -1 walks backward, so s[::-1] is the whole sequence in reverse order. Reversing does not sort anything; it only flips the order.',
      ],
      example: {
        code: 'nums = [0, 1, 2, 3, 4, 5, 6]\nprint(nums[::3])\nprint(nums[1::2])\nprint("stressed"[::-1])',
        output: '[0, 3, 6]\n[1, 3, 5]\ndesserts',
        explanation:
          'A step of 3 keeps positions 0, 3 and 6. Starting at 1 with step 2 gives the odd positions. Step -1 reads the string backward.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'values = [10, 20, 30, 40, 50, 60]\nprint(values[::2])',
          ['[10, 30, 50]', '[20, 40, 60]', '[10, 40]', '[10, 20]'],
          0,
          'The slice starts at position 0 and jumps by 2, so it keeps positions 0, 2 and 4.',
        ),
        predictOutput(
          'What is printed?',
          'word = "monkey"\nprint(word[1::2])',
          ['mne', 'oky', 'onk', 'okey'],
          1,
          'Starting at position 1 and jumping by 2 visits positions 1, 3 and 5: o, k and y.',
        ),
        predictOutput(
          'What does this program print?',
          'ranks = [3, 1, 4, 1, 5]\nprint(ranks[::-1])',
          [
            '[1, 1, 3, 4, 5]',
            '[5, 4, 3, 1, 1]',
            '[5, 1, 4, 1, 3]',
            '[3, 1, 4, 1, 5]',
          ],
          2,
          'Step -1 only reverses the order of the items; it does not sort them.',
        ),
        choose(
          'Which slice gives the items at positions 0, 3, 6, and so on?',
          ['items[:3]', 'items[3:]', 'items[3::3]', 'items[::3]'],
          3,
          'With no start the slice begins at 0, and a step of 3 jumps to 3, 6 and onward.',
        ),
      ],
    },
    {
      title: 'Predict slices that run past the end',
      explanation: [
        'Indexing past the end raises IndexError, but slicing never does. A stop beyond the end is cut down to the end, and a start beyond the end gives an empty list or string.',
        'A slice whose start is at or after its stop is empty too, because a normal step only moves forward. This makes s[:5] a safe way to say "up to five items", even when s is shorter.',
      ],
      example: {
        code: 'tags = ["new", "sale"]\nprint(tags[:5])\nprint(tags[3:])\nprint(len("hi"[1:10]))',
        output: "['new', 'sale']\n[]\n1",
        explanation:
          'tags has only two items, so tags[:5] gives both and tags[3:] gives none. "hi"[1:10] is just "i", one character.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'top = [9, 7, 4]\nprint(top[1:10])',
          ['[7, 4]', '[9, 7, 4]', '[7]', 'IndexError: list index out of range'],
          0,
          'The stop 10 is past the end, so the slice simply runs to the end from position 1.',
        ),
        predictOutput(
          'What is printed?',
          'word = "cat"\nprint(len(word[1:8]), len(word[5:]))',
          ['7 0', '2 3', '2 0', '3 3'],
          2,
          'word[1:8] is cut down to "at", and word[5:] starts past the end, so it is empty.',
        ),
        predictOutput(
          'What does this program print?',
          'nums = [4, 8, 15, 16]\nprint(nums[3:1])',
          ['[16, 15]', '[]', '[8, 15]', '[15, 16]'],
          1,
          'With the normal step, a slice cannot move backward from 3 to 1, so it is empty.',
        ),
        choose(
          'items holds 3 values. Which of items[7] and items[:7] raises an error?',
          [
            'Both raise IndexError',
            'Only items[:7] raises IndexError',
            'Neither one raises an error',
            'Only items[7] raises IndexError',
          ],
          3,
          'Indexing a missing position raises IndexError, while a slice is cut down to the available items.',
        ),
      ],
    },
  ],
  dictionaries: [
    {
      title: 'Look up a value by its key',
      explanation: [
        'A dictionary stores key: value pairs inside braces, such as {"pen": 2, "ink": 5}. Each key appears once and is linked to one value. Strings and whole numbers are the usual keys.',
        'data[key] gives the value stored under key. Lookups go from key to value only, and asking for a key the dictionary does not have raises KeyError.',
      ],
      example: {
        code: 'capitals = {"France": "Paris", "Japan": "Tokyo", "Peru": "Lima"}\nprint(capitals["Japan"])\ncountry = "Peru"\nprint(f"{country}: {capitals[country]}")',
        output: 'Tokyo\nPeru: Lima',
        explanation:
          'The key "Japan" is linked to "Tokyo". A variable holding a key works the same way, so capitals[country] looks up "Peru".',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'stock = {"apples": 12, "pears": 0, "plums": 7}\nprint(stock["plums"])',
          ['plums', '7', '12', '"plums": 7'],
          1,
          'stock["plums"] gives the value stored under the key plums, which is 7.',
        ),
        predictOutput(
          'What is printed?',
          'codes = {200: "OK", 404: "Not Found", 500: "Error"}\nprint(codes[404])',
          ['Not Found', '404', "'Not Found'", 'OK'],
          0,
          '404 is a key here, not a position, and print() shows the string value without quotes.',
        ),
        choose(
          'What happens when this program runs?',
          [
            'It prints 0',
            'It prints Bo',
            'It raises KeyError',
            'It prints an empty line',
          ],
          2,
          'Bo is not a key in ages, and looking up a missing key with brackets raises KeyError.',
          'ages = {"Ada": 36, "Lin": 29}\nprint(ages["Bo"])',
        ),
        choose(
          'colors = {"sky": "blue", "grass": "green"}. Which expression gives "blue"?',
          ['colors["blue"]', 'colors[0]', 'colors.sky', 'colors["sky"]'],
          3,
          'You look up a value by writing its key in brackets; dictionaries have no positions.',
        ),
      ],
    },
    {
      title: 'Add, change, and remove entries',
      explanation: [
        'data[key] = value stores a value under key. If the key is new, the dictionary gains an entry; if the key already exists, its old value is replaced, because each key appears only once. An update such as data[key] += 1 reads the old value and stores the new one.',
        'del data[key] removes the key and its value. Deleting a key that is not there raises KeyError, just like looking it up. Printing a dictionary shows its entries in the order the keys were first added.',
      ],
      example: {
        code: 'cart = {"tea": 2, "jam": 1}\ncart["tea"] = 3\ncart["bread"] = 1\ndel cart["jam"]\nprint(cart)',
        output: "{'tea': 3, 'bread': 1}",
        explanation:
          'tea already exists, so its value becomes 3. bread is new and is added at the end. del removes jam together with its value.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'points = {"red": 4, "blue": 6}\npoints["red"] = 9\nprint(points["red"] + points["blue"])',
          ['10', '15', '19', '13'],
          1,
          'Assigning to an existing key replaces its value, so red is 9 and 9 + 6 is 15.',
        ),
        predictOutput(
          'What is printed?',
          'lives = {"p1": 3, "p2": 3}\nlives["p2"] += 1\nlives["p3"] = 3\nprint(lives)',
          [
            "{'p1': 3, 'p2': 4, 'p3': 3}",
            "{'p1': 3, 'p2': 3, 'p3': 3}",
            "{'p1': 3, 'p2': 4}",
            "{'p3': 3, 'p1': 3, 'p2': 4}",
          ],
          0,
          'p2 is updated in place to 4, and the new key p3 is added after the existing keys.',
        ),
        predictOutput(
          'What does this program print?',
          'seats = {"A1": "Kim", "A2": "Raj", "A3": "Sol"}\ndel seats["A2"]\nprint(seats)',
          [
            "{'A1': 'Kim', 'A2': 'Raj'}",
            "{'A1': 'Kim', 'A2': 'Sol'}",
            "{'A1': 'Kim', 'A3': 'Sol'}",
            "{'A2': 'Raj'}",
          ],
          2,
          'del removes the key A2 and its value. The other keys keep their own values; nothing shifts the way list items do.',
        ),
        choose(
          'What happens when this program runs?',
          [
            "It prints {'soup': 5}",
            'It prints {}',
            'It raises IndexError',
            'It raises KeyError',
          ],
          3,
          'salad is not a key in menu, and deleting a missing key raises KeyError.',
          'menu = {"soup": 5}\ndel menu["salad"]\nprint(menu)',
        ),
      ],
    },
    {
      title: 'Handle keys that might be missing',
      explanation: [
        'data.get(key, default) returns the value for key when the key exists and the default when it does not, so a missing key never raises KeyError. get only reads; it does not add the key.',
        'key in data asks whether key is one of the keys. It does not search the values. Use it with if when the missing case needs a branch of its own.',
      ],
      example: {
        code: 'prices = {"coffee": 3, "tea": 2}\nprint(prices.get("tea", 0))\nprint(prices.get("juice", 0))\nprint("juice" in prices)\nprint(3 in prices)',
        output: '2\n0\nFalse\nFalse',
        explanation:
          'tea exists, so get returns its value; juice does not, so get returns the default 0. 3 is a value, not a key, so 3 in prices is False.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'limits = {"daily": 50, "weekly": 200}\nprint(limits.get("monthly", 500))',
          ['500', '0', '200', 'monthly'],
          0,
          'monthly is not a key, so get returns the default supplied in the call, 500.',
        ),
        choose(
          'Which expression gives the value stored under "rate" in settings, or 1 when that key is missing?',
          [
            'settings["rate", 1]',
            'settings.get("rate", 1)',
            'settings.get(1, "rate")',
            '"rate" in settings',
          ],
          1,
          'get takes the key first and the default second, and never raises KeyError.',
        ),
        predictOutput(
          'What does this program print?',
          'team = {"lead": "Ana", "dev": "Raj"}\nprint("Ana" in team, "dev" in team)',
          ['True True', 'True False', 'False True', 'False False'],
          2,
          'in checks keys only. Ana is a value, so the first test is False; dev is a key.',
        ),
        predictOutput(
          'What is the output?',
          'counts = {"x": 1}\nvalue = counts.get("y", 7)\nprint(value, counts)',
          ["7 {'x': 1, 'y': 7}", "1 {'x': 1}", "0 {'x': 1}", "7 {'x': 1}"],
          3,
          'get returns the default 7 for the missing key y but does not store it, so counts is unchanged.',
        ),
      ],
    },
    {
      title: 'Count things with a dictionary',
      explanation: [
        'A dictionary makes a set of named counters. Start with the empty dictionary {}, loop over the items, and for each one store counts.get(item, 0) + 1. The first time an item appears, get supplies 0; after that it supplies the count so far.',
        'The same pattern adds amounts instead of 1, such as totals[name] = totals.get(name, 0) + amount. An if with in does the same job: add 1 when the key exists, otherwise store 1.',
      ],
      example: {
        code: 'votes = ["yes", "no", "yes", "yes"]\ntally = {}\nfor vote in votes:\n    tally[vote] = tally.get(vote, 0) + 1\nprint(tally)',
        output: "{'yes': 3, 'no': 1}",
        explanation:
          'The first yes and the first no each start from the default 0. Each later yes adds 1 to the count already stored.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'letters = ["b", "a", "b", "c", "b"]\ncounts = {}\nfor ch in letters:\n    counts[ch] = counts.get(ch, 0) + 1\nprint(counts["b"], counts["c"])',
          ['2 1', '3 1', '1 1', '3 0'],
          1,
          'b appears three times and c once; each appearance adds 1 to what get returns.',
        ),
        predictOutput(
          'What is printed?',
          'orders = ["tea", "cake", "tea"]\nprices = {"tea": 2, "cake": 4}\nbill = {}\nfor item in orders:\n    bill[item] = bill.get(item, 0) + prices[item]\nprint(bill)',
          [
            "{'tea': 2, 'cake': 1}",
            "{'tea': 2, 'cake': 4}",
            "{'tea': 4, 'cake': 4}",
            "{'tea': 2, 'cake': 4, 'tea': 2}",
          ],
          2,
          'Each order adds its price to that item’s total. tea is ordered twice, so its total is 2 + 2; a key is never stored twice.',
        ),
        choose(
          'Why does counts[word] = counts.get(word, 0) + 1 work the first time word appears?',
          [
            'get adds the key with value 0 first',
            'Python starts every new key at 0',
            'The + 1 is skipped for new keys',
            'get returns the default 0 for a missing key',
          ],
          3,
          'For a missing key get returns the default 0, so the assignment stores 0 + 1.',
        ),
        predictOutput(
          'What does this program print?',
          'words = ["hi", "yo", "hi"]\nseen = {}\nfor w in words:\n    if w in seen:\n        seen[w] += 1\n    else:\n        seen[w] = 1\nprint(seen)',
          [
            "{'hi': 2, 'yo': 1}",
            "{'hi': 1, 'yo': 1}",
            "{'hi': 1, 'yo': 1, 'hi': 1}",
            "{'hi': 3, 'yo': 1}",
          ],
          0,
          'The first hi and yo are stored as 1. The second hi is already a key, so its count goes up to 2.',
        ),
      ],
    },
  ],
  'dictionary-loops': [
    {
      title: 'Loop over a dictionary to visit its keys',
      explanation: [
        'for key in data: runs the body once for each key, in the order the keys were added. The loop variable holds the key, not the value.',
        'When the body also needs the value, look it up with data[key] inside the loop.',
      ],
      example: {
        code: 'stock = {"pens": 12, "pads": 4, "ink": 0}\nfor item in stock:\n    print(item, stock[item])',
        output: 'pens 12\npads 4\nink 0',
        explanation:
          'item takes each key in turn, and stock[item] looks up the value that belongs to it.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'ages = {"Kai": 7, "Mo": 9}\nfor x in ages:\n    print(x)',
          ['7\n9', 'Kai\nMo', "('Kai', 7)\n('Mo', 9)", 'Kai 7\nMo 9'],
          1,
          'Looping directly over a dictionary gives its keys only.',
        ),
        predictOutput(
          'What is printed?',
          'rooms = {"A": 3, "B": 5, "C": 2}\ntotal = 0\nfor r in rooms:\n    total += rooms[r]\nprint(total)',
          ['2', '3', '5', '10'],
          3,
          'r is each key, and rooms[r] is its value, so the loop adds 3 + 5 + 2.',
        ),
        predictOutput(
          'What does this program print?',
          'temps = {"mon": 18, "tue": 25, "wed": 21}\nfor day in temps:\n    if temps[day] > 20:\n        print(day)',
          ['tue\nwed', '25\n21', 'tue', 'mon\ntue\nwed'],
          0,
          'The test uses each day’s value, but the loop prints the key, day, for the two warm days.',
        ),
        choose(
          'Inside for k in data:, which expression gives the value that belongs to k?',
          ['k[1]', 'k', 'data[k]', 'data[0]'],
          2,
          'k is a key, so data[k] looks up its value.',
        ),
      ],
    },
    {
      title: 'Loop over values() when only the values matter',
      explanation: [
        'data.values() supplies just the values, in the same order as the keys. Use it when the keys do not matter: to total the values, count those that pass a test, or find the largest.',
        'Inside such a loop there is no key to report, so choose values() only when the task never needs the key.',
      ],
      example: {
        code: 'expenses = {"rent": 900, "food": 300, "bus": 60}\ntotal = 0\nfor amount in expenses.values():\n    total += amount\nprint(total)',
        output: '1260',
        explanation:
          'amount is 900, then 300, then 60, and the accumulator adds them to 1260.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'wins = {"red": 3, "blue": 5, "gold": 1}\nfor w in wins.values():\n    print(w)',
          ['3\n5\n1', 'red\nblue\ngold', '1\n3\n5', '5\n3\n1'],
          0,
          'values() gives the values in the order their keys were added; it does not sort them.',
        ),
        predictOutput(
          'What is printed?',
          'grades = {"Ann": 72, "Bo": 91, "Cy": 85, "Di": 60}\nhigh = 0\nfor g in grades.values():\n    if g >= 85:\n        high += 1\nprint(high)',
          ['176', '1', '2', '3'],
          2,
          '91 and 85 pass the inclusive test, so the count is 2.',
        ),
        predictOutput(
          'What does this program print?',
          'heights = {"oak": 20, "elm": 34, "fir": 27}\ntallest = 0\nfor h in heights.values():\n    if h > tallest:\n        tallest = h\nprint(tallest)',
          ['elm', '27', '20', '34'],
          3,
          'tallest is replaced whenever a larger value appears, so it ends at 34. The loop never sees the key elm.',
        ),
        choose(
          'prices maps item names to prices. Which loop header suits adding up all the prices?',
          [
            'for p in prices:',
            'for p in prices.values():',
            'for k, p in prices:',
            'for p in prices[0]:',
          ],
          1,
          'Only the prices are needed, and values() supplies exactly those.',
        ),
      ],
    },
    {
      title: 'Loop over items() to get each key with its value',
      explanation: [
        'data.items() supplies each entry as a (key, value) pair. Unpack the pair in the loop header, as in for name, score in scores.items():, and both names are ready in the body.',
        'Use items() when the work needs both parts, such as a message that shows a name and its score, or a test on the value that keeps the key.',
      ],
      example: {
        code: 'prices = {"apple": 0.5, "melon": 3.0, "kiwi": 0.25}\nfor fruit, price in prices.items():\n    if price < 1:\n        print(f"{fruit} costs {price}")',
        output: 'apple costs 0.5\nkiwi costs 0.25',
        explanation:
          'Each pair is unpacked into fruit and price. The test uses price, and the message uses both.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'langs = {"py": 1991, "js": 1995}\nfor name, year in langs.items():\n    print(f"{name}-{year}")',
          ['py-1991\njs-1995', 'py-py\njs-js', '1991-py\n1995-js', 'py\njs'],
          0,
          'The first name in the header receives the key and the second receives the value.',
        ),
        predictOutput(
          'What is printed?',
          'sizes = {"S": 36, "M": 40}\nfor entry in sizes.items():\n    print(entry)',
          [
            'S\nM',
            "('S', 36)\n('M', 40)",
            'S 36\nM 40',
            "['S', 36]\n['M', 40]",
          ],
          1,
          'Without unpacking, each item is a (key, value) tuple, and print() shows it with parentheses.',
        ),
        choose(
          'Which loop header gives you each name and score in scores, ready to print lines like Ada: 8?',
          [
            'for name in scores.values():',
            'for name, score in scores:',
            'for name, score in scores.items():',
            'for score in scores:',
          ],
          2,
          'items() supplies key-value pairs, which the header unpacks into name and score.',
        ),
        predictOutput(
          'What does this program print?',
          'stock = {"nails": 0, "bolts": 40, "nuts": 0, "pins": 15}\nempty = []\nfor part, qty in stock.items():\n    if qty == 0:\n        empty.append(part)\nprint(empty)',
          ['[0, 0]', "['bolts', 'pins']", "['nails']", "['nails', 'nuts']"],
          3,
          'The test checks each quantity, and the key of every part with 0 is appended, in key order.',
        ),
      ],
    },
    {
      title: 'Pick the right view and leave the keys alone while looping',
      explanation: [
        'Match the view to the job: the dictionary itself for keys, values() for totals and counts, items() when you need both. Changing the value stored under an existing key during the loop is fine.',
        'Adding or removing keys while looping over the same dictionary is not: Python stops with RuntimeError because the dictionary changed size. Collect what you need in a separate list or dictionary during the loop, and make the changes afterwards.',
      ],
      example: {
        code: 'members = {"Ann": 2019, "Raj": 2024, "Lee": 2015}\nlapsed = []\nfor name, year in members.items():\n    if year < 2020:\n        lapsed.append(name)\nfor name in lapsed:\n    del members[name]\nprint(members)',
        output: "{'Raj': 2024}",
        explanation:
          'The first loop only reads members and records the names to remove. The second loop runs over the list lapsed, so deleting from members is safe.',
      },
      questions: [
        choose(
          'What happens when this program runs?',
          [
            "stock becomes {'b': 3}",
            'It raises RuntimeError',
            'It raises KeyError',
            'Nothing changes',
          ],
          1,
          'Deleting a key while looping over the same dictionary changes its size, so Python raises RuntimeError.',
          'stock = {"a": 0, "b": 3}\nfor key in stock:\n    if stock[key] == 0:\n        del stock[key]',
        ),
        predictOutput(
          'What does this program print?',
          'prices = {"tea": 2, "pie": 5}\nfor item in prices:\n    prices[item] *= 2\nprint(prices)',
          [
            "{'tea': 4, 'pie': 10}",
            "{'tea': 2, 'pie': 5}",
            "{'tea': 4, 'pie': 5}",
            'RuntimeError: dictionary changed size during iteration',
          ],
          0,
          'Replacing the values of existing keys does not add or remove keys, so the loop runs normally and doubles both.',
        ),
        predictOutput(
          'What is printed?',
          'raw = {"a": 3, "b": 8, "c": 5}\nbig = {}\nfor k, v in raw.items():\n    if v > 4:\n        big[k] = v\nprint(big)',
          ["{'b': 8}", "{'a': 3}", "{'b': 8, 'c': 5}", "['b', 'c']"],
          2,
          'The loop reads raw and stores each entry whose value is above 4 in the separate dictionary big.',
        ),
        choose(
          'totals maps names to amounts. Which loop header suits adding up the amounts?',
          [
            'for v in totals:',
            'for k, v in totals:',
            'for v in totals.items():',
            'for v in totals.values():',
          ],
          3,
          'The sum needs only the amounts, so values() is the view that fits.',
        ),
      ],
    },
  ],
  sets: [
    {
      title: 'Remove duplicates with a set',
      explanation: [
        'A set holds each value at most once and keeps no order. set(values) builds a set from a list, dropping repeats, and members can also be written in braces, such as {3, 1, 2}. Because repeats are dropped, len(set(values)) counts the distinct values.',
        'Two sets are equal when they have the same members, whatever order they were written in. A set has no positions, so it cannot be indexed, and its members must be hashable: numbers and strings work, lists do not.',
      ],
      example: {
        code: 'rolls = [4, 2, 4, 6, 2, 4]\ndistinct = set(rolls)\nprint(len(rolls), len(distinct))\nprint(distinct == {2, 4, 6})\nprint({1, 2, 2} == {2, 1})',
        output: '6 3\nTrue\nTrue',
        explanation:
          'The list has six rolls but only three different values. Order and repeats do not matter when sets are compared.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'emails = ["a@x.io", "b@x.io", "a@x.io", "c@x.io", "b@x.io"]\nprint(len(set(emails)))',
          ['5', '2', '3', '1'],
          2,
          'The set keeps a@x.io, b@x.io and c@x.io once each.',
        ),
        predictOutput(
          'What is printed?',
          'a = {3, 1, 2}\nb = {1, 2, 3, 3}\nprint(a == b, len(b))',
          ['False 3', 'True 3', 'False 4', 'True 4'],
          1,
          'b stores 3 only once, so both sets hold exactly 1, 2 and 3; the written order does not matter.',
        ),
        choose(
          'Which of these lines raises an error?',
          [
            's = {1, 2}',
            's = set([1, 1])',
            's = {"a", "b"}',
            's = {[1, 2], [3]}',
          ],
          3,
          'Lists are not hashable, so they cannot be set members; Python raises TypeError.',
        ),
        predictOutput(
          'What does this program print?',
          'words = ["to", "be", "or", "not", "to", "be"]\nprint(len(words) - len(set(words)))',
          ['2', '4', '0', '6'],
          0,
          'There are 6 words but 4 distinct ones, so 2 words were repeats.',
        ),
      ],
    },
    {
      title: 'Start with set(), then add and check members',
      explanation: [
        'value in a_set tests membership, and a_set.add(value) puts one value in; adding a value that is already there changes nothing. A common pattern keeps a seen set while looping: check with in, then add.',
        'Start that set with set(), which prints as set(). Writing {} creates an empty dictionary, not a set, so seen = {} followed by seen.add(x) raises AttributeError.',
      ],
      example: {
        code: 'logins = ["kim", "raj", "kim", "sol", "raj"]\nseen = set()\nfor user in logins:\n    if user in seen:\n        print(f"{user} again")\n    seen.add(user)\nprint(len(seen))',
        output: 'kim again\nraj again\n3',
        explanation:
          'Each name is checked before it is added, so only the second kim and the second raj are reported. The set ends with three names.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          's = {5, 9}\ns.add(9)\ns.add(2)\nprint(len(s), 2 in s, 7 in s)',
          ['4 True False', '3 True False', '3 False False', '2 True True'],
          1,
          'Adding 9 again changes nothing, adding 2 makes three members, and 7 was never added.',
        ),
        predictOutput(
          'What is printed?',
          'codes = [7, 3, 9, 3, 7, 7]\nseen = set()\nrepeats = 0\nfor c in codes:\n    if c in seen:\n        repeats += 1\n    seen.add(c)\nprint(repeats, len(seen))',
          ['3 3', '2 3', '3 6', '2 4'],
          0,
          'The second 3, the second 7 and the third 7 are already in seen, so repeats is 3; seen holds 7, 3 and 9.',
        ),
        predictOutput(
          'What does this program print?',
          'print(set(), {})',
          ['{} {}', 'set() set()', '{} set()', 'set() {}'],
          3,
          'An empty set prints as set(), and {} is an empty dictionary, which prints as {}.',
        ),
        choose(
          'What happens when this program runs?',
          [
            'It prints 1',
            'It prints 0',
            'It raises AttributeError',
            'It raises KeyError',
          ],
          2,
          '{} is an empty dictionary, and dictionaries have no add method.',
          'found = {}\nfound.add("key")\nprint(len(found))',
        ),
      ],
    },
    {
      title: 'Combine sets with |, &, and -',
      explanation: [
        'a | b is the union: everything in a, in b, or in both. a & b is the intersection: only the values in both. a - b is the difference: the values in a that are not in b.',
        'a - b and b - a are usually different sets. Each operator builds a new set and leaves a and b unchanged.',
      ],
      example: {
        code: 'morning = {1, 2, 3, 4}\nevening = {3, 4, 5}\nprint(len(morning | evening))\nprint((morning & evening) == {3, 4})\nprint((morning - evening) == {1, 2})\nprint((evening - morning) == {5})',
        output: '5\nTrue\nTrue\nTrue',
        explanation:
          'Together the sets hold 1 to 5. Only 3 and 4 are shared; 1 and 2 are only in morning, and 5 is only in evening.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'club = {"ana", "ben", "cy"}\nteam = {"ben", "dee"}\nprint(len(club | team), len(club & team))',
          ['5 1', '4 1', '4 2', '3 1'],
          1,
          'The union holds ana, ben, cy and dee, with ben counted once; only ben is in both.',
        ),
        choose(
          'a = {2, 4, 6, 8} and b = {4, 8, 12}. Which expression equals {2, 6}?',
          ['a & b', 'b - a', 'a | b', 'a - b'],
          3,
          'a - b keeps the members of a that are not in b, which are 2 and 6.',
        ),
        predictOutput(
          'What is printed?',
          'x = {5, 6, 7}\ny = {7, 8}\nprint((y - x) == {8}, (x - y) == {8})',
          ['True True', 'False True', 'True False', 'False False'],
          2,
          'y - x keeps 8, but x - y keeps 5 and 6, so the order of the operands matters.',
        ),
        predictOutput(
          'What does this program print?',
          'owned = {"cat", "dog"}\nwanted = {"dog", "fish", "bird"}\nmissing = wanted - owned\nprint(len(missing), "dog" in missing, "fish" in missing)',
          ['2 False True', '1 True False', '3 False True', '2 True True'],
          0,
          'Removing the owned animals from wanted leaves fish and bird, so dog is not in missing.',
        ),
      ],
    },
  ],
  functions: [
    {
      title: 'Define a function, then call it',
      explanation: [
        'def name(): followed by an indented body defines a function. The def statement only stores the body under that name; nothing in the body runs yet.',
        'A call, written name(), runs the whole body from top to bottom and then continues with the line after the call. You can call a function as many times as you like, but the def must have run before the line that calls it.',
      ],
      example: {
        code: 'def banner():\n    print("*****")\n\nprint("start")\nbanner()\nprint("middle")\nbanner()',
        output: 'start\n*****\nmiddle\n*****',
        explanation:
          'The def runs first but prints nothing. Each banner() call prints the stars at the point where the call appears.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'def chime():\n    print("ding")\n    print("dong")\n\nchime()\nchime()',
          [
            'ding\ndong',
            'ding\nding\ndong\ndong',
            'ding\ndong\nding\ndong',
            'dingdong\ndingdong',
          ],
          2,
          'Each call runs the whole body, ding then dong, before the next call starts.',
        ),
        predictOutput(
          'What is printed?',
          'def warn():\n    print("careful")\n\nprint("ready")',
          ['ready', 'careful\nready', 'ready\ncareful', 'careful'],
          0,
          'warn is defined but never called, so its body never runs.',
        ),
        predictOutput(
          'What is the output?',
          'print("A")\n\ndef step():\n    print("B")\n\nprint("C")\nstep()',
          ['A\nB\nC', 'A\nC\nB', 'A\nC', 'B\nA\nC'],
          1,
          'Defining step prints nothing. B appears only when step() is called, after C.',
        ),
        choose(
          'What happens when this program runs?',
          [
            'It prints hi',
            'It prints nothing',
            'It prints hello',
            'It raises NameError',
          ],
          3,
          'The call on the first line runs before the def, so the name hello does not exist yet.',
          'hello()\n\ndef hello():\n    print("hi")',
        ),
      ],
    },
    {
      title: 'Pass arguments into parameters',
      explanation: [
        'The names in the parentheses of a def are parameters. A call supplies arguments, and before the body runs, each argument is assigned to the parameter in the same position.',
        'With def label(item, size):, the call label("cup", "small") makes item "cup" and size "small". Each call can pass different arguments, so the same body produces different output.',
      ],
      example: {
        code: 'def tag(name, role):\n    print(f"{name} ({role})")\n\ntag("Ada", "admin")\ntag("Lin", "guest")',
        output: 'Ada (admin)\nLin (guest)',
        explanation:
          'In the first call name is "Ada" and role is "admin"; the second call fills them with new values.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'def shout(word):\n    print(word + "!")\n\nshout("go")\nshout("stop")',
          ['go!\nstop!', 'word!\nword!', 'go\nstop', 'go!'],
          0,
          'Each call assigns its argument to word, and the body adds an exclamation mark.',
        ),
        predictOutput(
          'What is printed?',
          'def route(start, end):\n    print(f"{start} -> {end}")\n\nroute("Rome", "Oslo")\nroute("Oslo", "Rome")',
          [
            'start -> end\nstart -> end',
            'Rome -> Oslo\nRome -> Oslo',
            'Oslo -> Rome\nRome -> Oslo',
            'Rome -> Oslo\nOslo -> Rome',
          ],
          3,
          'Arguments fill parameters by position, so swapping the arguments swaps start and end.',
        ),
        choose(
          'Given def stamp(code): and the call stamp("A7"), which statement is true?',
          [
            'code is the argument; "A7" is the parameter',
            'code is the parameter; "A7" is the argument',
            'code and "A7" are both parameters',
            'code and "A7" are both arguments',
          ],
          1,
          'The name in the definition is the parameter; the value passed in the call is the argument.',
        ),
        predictOutput(
          'What does this program print?',
          'def show(text):\n    print(f"{len(text)} {text}")\n\nfirst = "ab"\nshow(first + "cd")',
          ['2 ab', '4 text', '4 abcd', '2 abcd'],
          2,
          'The argument expression is evaluated first, so text receives "abcd", which has 4 characters.',
        ),
      ],
    },
    {
      title: 'Keep a function’s variables local',
      explanation: [
        'A variable assigned inside a function body is local: it exists only while that call runs. Code outside the function cannot see it, so using its name there raises NameError. Parameters are local in the same way.',
        'If a local variable has the same name as a variable outside the function, they are still two separate variables. Assigning to the local one does not change the outside one.',
      ],
      example: {
        code: 'message = "outside"\n\ndef note():\n    message = "inside"\n    print(message)\n\nnote()\nprint(message)',
        output: 'inside\noutside',
        explanation:
          'The assignment inside note creates a local message. The outside message is untouched and still holds "outside".',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'color = "red"\n\ndef paint():\n    color = "blue"\n    print("painted " + color)\n\npaint()\nprint(color)',
          [
            'painted blue\nblue',
            'painted blue\nred',
            'painted red\nred',
            'painted red\nblue',
          ],
          1,
          'Inside paint, color is a local variable set to blue. The outside color stays red.',
        ),
        choose(
          'What happens when this program runs?',
          [
            'It prints done',
            'It prints result',
            'It raises NameError',
            'It prints nothing',
          ],
          2,
          'result is local to build and disappears when the call ends, so the last line cannot find it.',
          'def build():\n    result = "done"\n\nbuild()\nprint(result)',
        ),
        predictOutput(
          'What is printed?',
          'name = "Zed"\n\ndef wave(name):\n    print("Hi " + name)\n\nwave("Amy")\nprint(name)',
          ['Hi Amy\nZed', 'Hi Zed\nZed', 'Hi Amy\nAmy', 'Hi Zed\nAmy'],
          0,
          'The parameter name is local and receives "Amy"; the outside name still holds "Zed".',
        ),
        choose(
          'What happens on the last line of this program?',
          [
            'It prints abab',
            'It prints ab',
            'It prints text',
            'It raises NameError',
          ],
          3,
          'text is a parameter, so it exists only during the call and is not defined outside the function.',
          'def double_up(text):\n    print(text + text)\n\ndouble_up("ab")\nprint(text)',
        ),
      ],
    },
  ],
  'return-values': [
    {
      title: 'Return a value the caller can use',
      explanation: [
        'return expression ends the call and hands the value of the expression back to the caller. The call then stands for that value: it can be stored in a variable, printed, compared, or passed to another call.',
        'print() inside a function only shows text on the screen. The caller gets nothing it can calculate with unless the function returns it.',
      ],
      example: {
        code: 'def area(width, height):\n    return width * height\n\nroom = area(4, 3)\nprint(room + area(2, 2))',
        output: '16',
        explanation:
          'area(4, 3) returns 12, which is stored in room. area(2, 2) returns 4, and 12 + 4 is 16.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'def half(n):\n    return n / 2\n\nprint(half(9) + 1)',
          ['5.5', '5', '4.5', '5.0'],
          0,
          'half(9) returns 4.5, because / always gives a float, and the caller adds 1.',
        ),
        predictOutput(
          'What is printed?',
          'def add_fee(price):\n    return price + 2\n\nprint(add_fee(add_fee(10)))',
          ['12', '24', '14', '10'],
          2,
          'The inner call returns 12, which becomes the argument of the outer call, giving 14.',
        ),
        predictOutput(
          'What is the output?',
          'def full_name(first, last):\n    return first + " " + last\n\nname = full_name("Grace", "Hopper")\nprint(len(name))',
          ['Grace Hopper', '11', '2', '12'],
          3,
          'The function returns "Grace Hopper", whose 12 characters include the space.',
        ),
        choose(
          'show(x) prints x * 2, and calc(x) returns x * 2. Which line stores 10 in result?',
          [
            'result = show(5)',
            'result = calc(5)',
            'result = print(calc(5))',
            'result = calc',
          ],
          1,
          'Only a returned value reaches the caller, so result = calc(5) stores 10.',
        ),
      ],
    },
    {
      title: 'Know that a function without return gives None',
      explanation: [
        'If a function reaches the end of its body without returning a value, the call gives back None, Python’s value for "nothing here". A bare return with no value also gives None.',
        'So a function that only prints still returns None: its text appears when it is called, but storing or printing the call’s result gives None.',
      ],
      example: {
        code: 'def report(score):\n    print(f"Score: {score}")\n\nresult = report(7)\nprint(result)',
        output: 'Score: 7\nNone',
        explanation:
          'Calling report prints its line. The function has no return, so result is None.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'def cheer(team):\n    print("Go, " + team)\n\nprint(cheer("Lions"))',
          [
            'Go, Lions',
            'Go, Lions\nNone',
            'None\nGo, Lions',
            'Go, Lions\nGo, Lions',
          ],
          1,
          'The call prints its line first; then the outer print shows the returned value, None.',
        ),
        predictOutput(
          'What is printed?',
          'def square(n):\n    n * n\n\nprint(square(4))',
          ['16', '0', '4', 'None'],
          3,
          'The body calculates n * n but never returns it, so the call gives None.',
        ),
        choose(
          'def log(msg): has print(msg) as its only line. What is stored in x after x = log("hi")?',
          ['None', '"hi"', 'True', '0'],
          0,
          'log prints hi but returns nothing, so x receives None.',
        ),
        predictOutput(
          'What is the output?',
          'def next_age(age):\n    if age < 0:\n        return\n    return age + 1\n\nprint(next_age(-3))\nprint(next_age(4))',
          ['-2\n5', '0\n5', 'None\n5', '-3\n5'],
          2,
          'For -3 the bare return runs, which returns None. For 4 the function returns 5.',
        ),
      ],
    },
    {
      title: 'Return early to handle special cases',
      explanation: [
        'A return statement ends the call on the spot; nothing after it in the same path runs. A statement placed after an unconditional return is never reached.',
        'This makes early returns useful: test a special case first and return its answer, and let the rest of the function handle the normal case. When several ifs each return, only the first one whose condition holds gets to return.',
      ],
      example: {
        code: 'def ticket_price(age):\n    if age < 5:\n        return 0\n    if age >= 65:\n        return 6\n    return 10\n\nprint(ticket_price(3), ticket_price(70), ticket_price(30))',
        output: '0 6 10',
        explanation:
          'Age 3 returns at the first if. Age 70 passes the first test, then returns 6. Age 30 fails both tests and reaches the final return.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'def sign(n):\n    if n > 0:\n        return "positive"\n    return "not positive"\n\nprint(sign(5))\nprint(sign(0))',
          [
            'positive\nnot positive',
            'positive\npositive',
            'not positive\nnot positive',
            'not positive\npositive',
          ],
          0,
          'For 5 the first return ends the call. For 0 the test fails, so the last line returns "not positive".',
        ),
        predictOutput(
          'What is printed?',
          'def tally(n):\n    print("start")\n    return n * 3\n    print("end")\n\nprint(tally(2))',
          ['start\nend\n6', 'start\n6', '6\nstart', 'start\n6\nend'],
          1,
          'The return ends the call, so print("end") never runs; the caller then prints 6.',
        ),
        predictOutput(
          'What is the output?',
          'def grade(score):\n    if score >= 90:\n        return "A"\n    if score >= 80:\n        return "B"\n    return "C"\n\nprint(grade(95) + grade(85) + grade(40))',
          ['BBC', 'CCC', 'ABC', 'BCC'],
          2,
          '95 returns "A" at the first test and never reaches the second. 85 returns "B", and 40 reaches "C".',
        ),
        choose(
          'What does describe(7) return?',
          ['small', 'unknown', 'big, then unknown', 'big'],
          3,
          'The if branch returns "big" and ends the call, so the last return is never reached.',
          'def describe(n):\n    if n > 5:\n        return "big"\n    else:\n        return "small"\n    return "unknown"',
        ),
      ],
    },
  ],
  'multiple-returns': [
    {
      title: 'Return several values as a tuple',
      explanation: [
        'return a, b hands back one tuple holding both values. The comma builds the tuple, so parentheses are optional, and printing the call shows the tuple with its parentheses.',
        'Because the result is a tuple, you can keep it under one name and read its parts by index: result[0] is the first value returned and result[1] the second.',
      ],
      example: {
        code: 'def first_last(word):\n    return word[0], word[-1]\n\nprint(first_last("planet"))\npair = first_last("rocket")\nprint(pair[1])',
        output: "('p', 't')\nt",
        explanation:
          'The function returns a tuple of two characters. pair[1] reads the second part, the last letter of rocket.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'def sizes(text):\n    return len(text), len(text + text)\n\nprint(sizes("abc"))',
          ['3 6', '(3, 6)', '[3, 6]', '(3, 3)'],
          1,
          'The two values come back as one tuple, and print() shows a tuple with parentheses.',
        ),
        predictOutput(
          'What is printed?',
          'def corners(row):\n    return row[0], row[-1]\n\nresult = corners([4, 8, 15, 16])\nprint(result[1])',
          ['4', '8', '16', '(4, 16)'],
          2,
          'result is the tuple (4, 16), so result[1] is its second part, 16, not row[1].',
        ),
        choose(
          'Which return statement hands back low and high together as two values?',
          [
            'return low, high',
            'return low + high',
            'return (low + high)',
            'return low; return high',
          ],
          0,
          'The comma packs both values into one tuple. A second return would never run.',
        ),
        predictOutput(
          'What is the output?',
          'def combine(a, b):\n    return a + b, a - b, a * b\n\nprint(len(combine(5, 2)))',
          ['1', '2', '13', '3'],
          3,
          'The function returns a tuple of three values, (7, 3, 10), so its length is 3.',
        ),
      ],
    },
    {
      title: 'Unpack the returned values at the call',
      explanation: [
        'Unpacking puts each returned value under its own name in one step: low, high = bounds(values). Names are filled in order, so the first name receives the first value returned.',
        'The number of names must match the number of returned values, or Python raises ValueError. Good names also say what each part means, which result[0] and result[1] do not.',
      ],
      example: {
        code: 'def order_pair(a, b):\n    if a < b:\n        return a, b\n    return b, a\n\nsmall, big = order_pair(9, 4)\nprint(small, big)',
        output: '4 9',
        explanation:
          '9 is not less than 4, so the function returns (4, 9). Unpacking puts 4 in small and 9 in big.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'def rect(w, h):\n    return w * h, 2 * (w + h)\n\narea, perimeter = rect(3, 5)\nprint(perimeter)',
          ['15', '16', '(15, 16)', '8'],
          1,
          'The function returns (15, 16); the second name, perimeter, receives 16.',
        ),
        predictOutput(
          'What is printed?',
          'def swap(a, b):\n    return b, a\n\nx, y = swap("left", "right")\nprint(x)',
          ['right', 'left', "('right', 'left')", 'x'],
          0,
          'swap returns ("right", "left"), and x receives the first value.',
        ),
        choose(
          'measure() returns three values. What happens with a, b = measure()?',
          [
            'b receives the last two values',
            'The third value is dropped',
            'It raises ValueError',
            'a receives the whole tuple',
          ],
          2,
          'Two names cannot unpack three values, so Python raises ValueError.',
        ),
        predictOutput(
          'What is the output?',
          'def ends(items):\n    return items[0], items[-1]\n\nfor group in [(1, 2, 3), (7, 8)]:\n    first, last = ends(group)\n    print(first + last)',
          ['6\n15', '1\n7', '(1, 3)\n(7, 8)', '4\n15'],
          3,
          'Each call returns the first and last items; 1 + 3 is 4 and 7 + 8 is 15.',
        ),
      ],
    },
    {
      title: 'Return a status together with a result',
      explanation: [
        'Every path through the function should return the same number of values in the same order, so the caller can always unpack them the same way.',
        'A common shape is a flag plus a value: return True, result when the work succeeded, and False with a placeholder when it did not. The caller unpacks both and checks the flag before using the value.',
      ],
      example: {
        code: 'def safe_divide(a, b):\n    if b == 0:\n        return False, 0\n    return True, a / b\n\nok, value = safe_divide(7, 2)\nprint(ok, value)\nok, value = safe_divide(7, 0)\nprint(ok, value)',
        output: 'True 3.5\nFalse 0',
        explanation:
          'Both paths return two values, so the same unpacking works for both calls. The second call takes the early return.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'def check_pin(pin):\n    if len(pin) != 4:\n        return False, "wrong length"\n    return True, "accepted"\n\nok, msg = check_pin("12345")\nprint(ok, msg)',
          [
            'True accepted',
            'False wrong length',
            'False accepted',
            "(False, 'wrong length')",
          ],
          1,
          'The PIN has 5 characters, so the first return runs and both of its values are unpacked.',
        ),
        predictOutput(
          'What is printed?',
          'def first_even(nums):\n    for n in nums:\n        if n % 2 == 0:\n            return True, n\n    return False, 0\n\nfound, value = first_even([3, 7, 10, 4])\nprint(found, value)\nfound, value = first_even([1, 5])\nprint(found, value)',
          [
            'True 4\nFalse 0',
            'True 10\nFalse 5',
            'True 10\nFalse 0',
            'True 10\nTrue 0',
          ],
          2,
          'The first call returns as soon as it meets 10. The second list has no even number, so the loop ends and False, 0 is returned.',
        ),
        choose(
          'One path of f returns True, total, but another path only returns False. What happens at ok, total = f() when that other path runs?',
          [
            'total becomes None',
            'total keeps its old value',
            'ok is False and total is 0',
            'Unpacking raises TypeError',
          ],
          3,
          'A single False is not a tuple of two values, so it cannot be unpacked into two names.',
        ),
        predictOutput(
          'What is the output?',
          'def parse_age(text):\n    if text == "":\n        return False, 0\n    return True, int(text)\n\nfor raw in ["31", ""]:\n    ok, age = parse_age(raw)\n    if ok:\n        print(age + 1)\n    else:\n        print("missing")',
          ['32\nmissing', '32\n1', '31\nmissing', 'missing\n32'],
          0,
          '"31" converts to 31 and the flag is True, so 32 is printed. The empty string returns False, so the else branch runs.',
        ),
      ],
    },
  ],
  recursion: [
    {
      title: 'Write a base case and a recursive case',
      explanation: [
        'A recursive function calls itself on a smaller input. It needs a base case that returns an answer directly, without calling itself, and a recursive case that calls the function on an input one step closer to the base case.',
        'If the input never reaches the base case, the calls never end, and Python stops them with RecursionError.',
      ],
      example: {
        code: 'def count_down(n):\n    if n == 0:\n        return "liftoff"\n    return str(n) + " " + count_down(n - 1)\n\nprint(count_down(3))',
        output: '3 2 1 liftoff',
        explanation:
          'Each call adds its own number in front of the result for n - 1. At n == 0 the base case returns "liftoff" without calling again.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'def power(base, exp):\n    if exp == 0:\n        return 1\n    return base * power(base, exp - 1)\n\nprint(power(3, 4))',
          ['12', '81', '27', '64'],
          1,
          'Four recursive calls each multiply by 3 before the base case returns 1: 3 * 3 * 3 * 3 * 1 is 81.',
        ),
        predictOutput(
          'What is printed?',
          'def stars(n):\n    if n == 0:\n        return ""\n    return "*" + stars(n - 1)\n\nprint(stars(4) + "|")',
          ['***|', '*|', '****|', '*****|'],
          2,
          'stars(4) adds one star for each of n = 4, 3, 2 and 1; the base case adds nothing.',
        ),
        choose(
          'Which change makes this function stop for every positive n?',
          [
            'Add if n == 0: return 0 before the last line',
            'Change n - 1 to n + 1',
            'Add return 0 after the last line',
            'Call chain(n) instead of chain(n - 1)',
          ],
          0,
          'A base case at 0 answers directly, and n - 1 moves every positive n toward it.',
          'def chain(n):\n    return 2 + chain(n - 1)',
        ),
        choose(
          'What happens when this program runs?',
          [
            'It prints 0',
            'It prints 1',
            'It runs forever without raising an error',
            'It raises RecursionError',
          ],
          3,
          'Starting at 5 and subtracting 2 gives 3, 1, -1, and so on; n is never 0, so the calls never stop.',
          'def halve(n):\n    if n == 0:\n        return 0\n    return halve(n - 2)\n\nprint(halve(5))',
        ),
      ],
    },
    {
      title: 'Trace how the returned values combine',
      explanation: [
        'Each call has its own parameters and waits at its recursive call until the smaller call returns. The calls go all the way down to the base case first; then the answers come back up in reverse order, and each waiting call finishes its own expression with the value it received.',
        'To trace by hand, write the chain of calls down to the base case, then fill in the returned values on the way back up.',
      ],
      example: {
        code: 'def count_digits(n):\n    if n < 10:\n        return 1\n    return 1 + count_digits(n // 10)\n\nprint(count_digits(4096))',
        output: '4',
        explanation:
          'count_digits(4096) waits for 409, which waits for 40, which waits for 4. The base case returns 1, and the waiting calls return 2, 3 and finally 4.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'def build(n):\n    if n == 0:\n        return "x"\n    return "(" + build(n - 1) + ")"\n\nprint(build(2))',
          ['(x)', '((x', '(x)(x)', '((x))'],
          3,
          'build(0) returns x, build(1) wraps it as (x), and build(2) wraps that again.',
        ),
        predictOutput(
          'What is printed?',
          'def mult(a, b):\n    if b == 0:\n        return 0\n    return a + mult(a, b - 1)\n\nprint(mult(6, 3))',
          ['9', '18', '6', '24'],
          1,
          'Three recursive steps each add 6 to the base value 0, giving 18.',
        ),
        predictOutput(
          'What is the output?',
          'def fib(n):\n    if n <= 1:\n        return n\n    return fib(n - 1) + fib(n - 2)\n\nprint(fib(6))',
          ['5', '13', '8', '6'],
          2,
          'Building up from fib(0) = 0 and fib(1) = 1 gives 1, 2, 3, 5, and then fib(6) = 8.',
        ),
        choose(
          'g(3) calls g(2), which calls g(1), the base case. Which call returns first?',
          ['g(1)', 'g(2)', 'g(3)', 'All three at the same time'],
          0,
          'g(3) and g(2) are still waiting for their smaller calls, so the base case g(1) finishes first.',
        ),
      ],
    },
    {
      title: 'Print before or after the recursive call',
      explanation: [
        'Where a print sits relative to the recursive call decides the order of the output. A print before the call runs on the way down, so the first call’s line appears first.',
        'A print after the call runs only when the smaller call has returned, on the way back up, so the call nearest the base case prints first. A function with both shows the way down and then the way back up.',
      ],
      example: {
        code: 'def trace(n):\n    if n == 0:\n        print("base")\n        return\n    print("down", n)\n    trace(n - 1)\n    print("up", n)\n\ntrace(2)',
        output: 'down 2\ndown 1\nbase\nup 1\nup 2',
        explanation:
          'The down lines print before each call goes deeper. The up lines wait until the smaller call returns, so they come out in reverse order.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'def countdown(n):\n    if n == 0:\n        return\n    print(n)\n    countdown(n - 1)\n\ncountdown(3)',
          ['1\n2\n3', '3', '3\n2\n1', '3\n2\n1\n0'],
          2,
          'Each call prints before going deeper, so 3 prints first. The base case returns without printing 0.',
        ),
        predictOutput(
          'What is printed?',
          'def climb(n):\n    if n > 3:\n        return\n    climb(n + 1)\n    print(n)\n\nclimb(1)',
          ['1\n2\n3', '4\n3\n2\n1', '1\n2\n3\n4', '3\n2\n1'],
          3,
          'The print comes after the call, so climb(3) prints first once climb(4) returns without printing.',
        ),
        predictOutput(
          'What is the output?',
          'def wrap(n):\n    if n == 0:\n        return\n    print("<" + str(n))\n    wrap(n - 1)\n    print(str(n) + ">")\n\nwrap(2)',
          [
            '<2\n<1\n1>\n2>',
            '<2\n2>\n<1\n1>',
            '<2\n<1\n2>\n1>',
            '<1\n<2\n2>\n1>',
          ],
          0,
          'The opening lines print on the way down, 2 then 1. The closing lines print on the way back up, 1 then 2.',
        ),
        choose(
          'Which change makes this program print 1, 2, 3 instead of 3, 2, 1?',
          [
            'Call go(n + 1) instead of go(n - 1)',
            'Move print(n) below go(n - 1)',
            'Change the base case to n == 3',
            'Call go(1) instead of go(3)',
          ],
          1,
          'Printing after the recursive call delays each line until the smaller calls have printed theirs.',
          'def go(n):\n    if n == 0:\n        return\n    print(n)\n    go(n - 1)\n\ngo(3)',
        ),
      ],
    },
    {
      title: 'Put a recursive helper inside a function',
      explanation: [
        'A def can appear inside another function’s body. The inner function, often called a helper, exists only while the outer function runs, so code outside cannot call it.',
        'The helper can read the outer function’s parameters and variables without having them passed in. This suits recursion: the outer function takes the caller’s inputs, and a short recursive helper does the work, reading fixed values such as a target or a step from the outer function.',
      ],
      example: {
        code: 'def steps_to_reach(target, step):\n    def walk(position):\n        if position >= target:\n            return 0\n        return 1 + walk(position + step)\n    return walk(0)\n\nprint(steps_to_reach(10, 3))',
        output: '4',
        explanation:
          'walk reads target and step from steps_to_reach. It moves 0, 3, 6, 9, then reaches 12, which is at least 10, so four steps were taken.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'def repeat_text(text, times):\n    def build(n):\n        if n == 0:\n            return ""\n        return text + build(n - 1)\n    return build(times)\n\nprint(repeat_text("ab", 3))',
          ['ab', 'abab', 'ababab', 'ab3'],
          2,
          'build reads text from repeat_text and adds it once for each of n = 3, 2 and 1.',
        ),
        predictOutput(
          'What is printed?',
          'def countdown_from(start):\n    label = "T-"\n    def tick(n):\n        if n == 0:\n            return label + "0"\n        return label + str(n) + " " + tick(n - 1)\n    return tick(start)\n\nprint(countdown_from(2))',
          ['T-2 T-1 T-0', 'T-2 T-1', '2 1 0', 'T-0 T-1 T-2'],
          0,
          'tick reads label from the outer function and works down from 2 to the base case 0.',
        ),
        choose(
          'What happens when this program runs?',
          ['It prints 6', 'It prints 5', 'It prints 1', 'It raises NameError'],
          3,
          'inner exists only inside outer, so the top-level call cannot find the name inner.',
          'def outer(limit):\n    def inner(n):\n        return n + limit\n    return inner(1)\n\nprint(inner(5))',
        ),
        choose(
          'How can count use limit without a limit parameter of its own?',
          [
            'limit is a global variable',
            'It reads limit from below, where it is defined',
            'Python passes all names to every call',
            'count receives limit as a hidden argument',
          ],
          1,
          'A helper defined inside a function can read that function’s parameters and variables.',
          'def below(limit):\n    def count(n):\n        if n >= limit:\n            return 0\n        return 1 + count(n + 1)\n    return count(0)',
        ),
      ],
    },
  ],
  parameters: [
    {
      title: 'Match positional arguments by order',
      explanation: [
        'A function can take several parameters. Positional arguments are matched by order: the first argument goes to the first parameter, the second to the second, and so on. Python does not look at what the values mean, so swapping two arguments swaps what the parameters receive.',
        'A call must supply a value for every parameter that has no default. Passing too few or too many positional arguments raises TypeError.',
      ],
      example: {
        code: 'def describe(item, count, unit):\n    return f"{count} {unit} of {item}"\n\nprint(describe("flour", 2, "kg"))\nprint(describe("milk", 1, "l"))',
        output: '2 kg of flour\n1 l of milk',
        explanation:
          'In each call the first value fills item, the second fills count, and the third fills unit.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'def subtract(a, b):\n    return a - b\n\nprint(subtract(3, 10))\nprint(subtract(10, 3))',
          ['7\n7', '-7\n7', '7\n-7', '-7\n-7'],
          1,
          'In the first call a is 3 and b is 10, so the result is -7; swapping the arguments gives 7.',
        ),
        predictOutput(
          'What is printed?',
          'def label(name, size, color):\n    return name + "-" + size + "-" + color\n\nprint(label("shirt", "red", "M"))',
          ['shirt-red-M', 'shirt-M-red', 'name-size-color', 'red-M-shirt'],
          0,
          'Arguments are matched by position, so size receives "red" and color receives "M", whatever they mean.',
        ),
        choose(
          'def move(x, y, speed): is called as move(2, 5). What happens?',
          [
            'speed becomes 0',
            'speed becomes 5',
            'It raises TypeError',
            'x becomes 2 and y is skipped',
          ],
          2,
          'speed has no default and no argument fills it, so Python raises TypeError for the missing argument.',
        ),
        predictOutput(
          'What is the output?',
          'def pick(items, position):\n    return items[position]\n\nprint(pick(["a", "b", "c"], -1), pick([9, 8, 7], 0))',
          ['a 9', 'c 7', 'b 8', 'c 9'],
          3,
          'The list fills items and the number fills position, so the calls return the last item c and the first item 9.',
        ),
      ],
    },
    {
      title: 'Name arguments with keywords',
      explanation: [
        'A keyword argument names the parameter it fills, as in ratio(part=2, whole=8). Because the name decides the match, keyword arguments can come in any order.',
        'Positional and keyword arguments can be mixed, but the positional ones must come first; a positional argument after a keyword argument is a SyntaxError. Filling the same parameter twice, once by position and once by name, raises TypeError.',
      ],
      example: {
        code: 'def ratio(part, whole):\n    return part / whole\n\nprint(ratio(whole=8, part=2))\nprint(ratio(3, whole=4))',
        output: '0.25\n0.75',
        explanation:
          'The first call names both parameters, so their order does not matter. The second fills part by position and whole by name.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'def divide(top, bottom):\n    return top // bottom\n\nprint(divide(bottom=4, top=20))',
          ['0', '5', '5.0', '4'],
          1,
          'The keywords put 20 in top and 4 in bottom, whatever order they are written in; 20 // 4 is 5.',
        ),
        predictOutput(
          'What is printed?',
          'def card(name, rank, suit):\n    return f"{rank} of {suit} ({name})"\n\nprint(card("ace", suit="hearts", rank="A"))',
          [
            'ace of A (hearts)',
            'hearts of A (ace)',
            'A of hearts (ace)',
            'A of ace (hearts)',
          ],
          2,
          '"ace" fills name by position; the keywords fill suit and rank by name.',
        ),
        choose(
          'For def tile(width, height):, which call is not allowed?',
          [
            'tile(2, 3)',
            'tile(height=3, width=2)',
            'tile(2, height=3)',
            'tile(width=2, 3)',
          ],
          3,
          'A positional argument cannot follow a keyword argument, so that call is a SyntaxError.',
        ),
        choose(
          'For def send(to, subject):, what does send("Ana", to="Bo") do?',
          [
            'It raises TypeError',
            'to is Bo and subject is Ana',
            'to is Ana and subject is Bo',
            'It raises SyntaxError',
          ],
          0,
          '"Ana" already fills to by position, so to="Bo" tries to fill it a second time.',
        ),
      ],
    },
    {
      title: 'Give parameters default values',
      explanation: [
        'A parameter written as name=value has a default. When the caller leaves that argument out, the parameter gets the default; when the caller supplies it, the supplied value wins.',
        'Parameters with defaults must come after those without, so def f(a, b=1): is fine but def f(a=1, b): is a SyntaxError. With keywords, a caller can skip some optional arguments and set only the one it needs.',
      ],
      example: {
        code: 'def note(text, prefix="TODO", mark="!"):\n    return f"{prefix}: {text}{mark}"\n\nprint(note("call Ana"))\nprint(note("buy milk", "FIX"))\nprint(note("pay rent", mark="?"))',
        output: 'TODO: call Ana!\nFIX: buy milk!\nTODO: pay rent?',
        explanation:
          'The first call uses both defaults. The second replaces prefix by position. The third keeps the default prefix and replaces only mark.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'def interest(amount, rate=5):\n    return amount * rate // 100\n\nprint(interest(200))\nprint(interest(200, 10))',
          ['10\n20', '10\n10', '0\n20', '20\n20'],
          0,
          'The first call uses the default rate 5; the second supplies 10, which replaces the default.',
        ),
        predictOutput(
          'What is printed?',
          'def box(width, height=2, depth=1):\n    return width * height * depth\n\nprint(box(3, depth=4))',
          ['12', '24', '6', '3'],
          1,
          'height keeps its default 2 and the keyword sets depth to 4, so the result is 3 * 2 * 4.',
        ),
        choose(
          'Which definition is valid Python?',
          [
            'def f(a=1, b):',
            'def f(a, b=1, c):',
            'def f(a, b=1):',
            'def f(a=1, b, c=2):',
          ],
          2,
          'Every parameter without a default must come before the parameters that have one.',
        ),
        predictOutput(
          'What is the output?',
          'def tag(text, before="[", after="]"):\n    return before + text + after\n\nprint(tag("ok", after=">"), tag("hi", "<"))',
          ['[ok] <hi]', '<ok> <hi>', '[ok> <hi>', '[ok> <hi]'],
          3,
          'The first call changes only after. The second changes before by position and keeps the default after.',
        ),
      ],
    },
    {
      title: 'Avoid a list as a default value',
      explanation: [
        'A default value is created once, when the def runs, not again on each call. For a number or a string that never matters. A list default, though, is one single list shared by every call that leaves the argument out, so items appended in one call are still there in the next.',
        'Use defaults that cannot change in place, such as numbers, strings, or None, and create any list inside the function body, or have the caller pass the list in.',
      ],
      example: {
        code: 'def add_item(item, basket=[]):\n    basket.append(item)\n    return basket\n\nprint(add_item("egg"))\nprint(add_item("jam"))',
        output: "['egg']\n['egg', 'jam']",
        explanation:
          'Both calls leave out basket, so both append to the same default list, and the second call sees the egg from the first.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'def log(event, history=[]):\n    history.append(event)\n    return len(history)\n\nprint(log("a"), log("b"), log("c"))',
          ['1 2 3', '1 1 1', '3 3 3', '0 1 2'],
          0,
          'All three calls append to the same default list, so its length grows by one each time.',
        ),
        choose(
          'Which of these defaults can carry changes from one call into the next?',
          ['count=0', 'items=[]', 'name=""', 'limit=None'],
          1,
          'A list can change in place, and the one default list is shared by every call that uses it.',
        ),
        predictOutput(
          'What is printed?',
          'def collect(x, bucket=[]):\n    bucket.append(x)\n    return bucket\n\nprint(collect(1, []))\nprint(collect(2, []))\nprint(collect(3))\nprint(collect(4))',
          [
            '[1]\n[2]\n[3]\n[4]',
            '[1]\n[1, 2]\n[1, 2, 3]\n[1, 2, 3, 4]',
            '[1]\n[2]\n[3]\n[3, 4]',
            '[1]\n[2]\n[1, 2, 3]\n[1, 2, 3, 4]',
          ],
          2,
          'The first two calls pass their own new lists. Only the last two use the shared default, so 3 and 4 end up together.',
        ),
        predictOutput(
          'What is the output?',
          'def add_tag(tag, tags=[]):\n    tags.append(tag)\n    return tags\n\nfirst = add_tag("x")\nsecond = add_tag("y")\nprint(first)',
          ["['x']", "['y']", "['y', 'x']", "['x', 'y']"],
          3,
          'Both calls return the same default list, so first and second name one list that now holds x and y.',
        ),
      ],
    },
  ],
  comprehensions: [
    {
      title: 'Transform every item with a comprehension',
      explanation: [
        '[expression for item in items] builds a new list. It takes each item in order, evaluates the expression with it, and puts the result in the new list.',
        'It does the same job as an empty list plus a for loop with append, in one line. The original list is not changed, and without a filter the new list has exactly as many items as the original.',
      ],
      example: {
        code: 'prices = [4, 10, 7]\nwith_tax = [p * 1.5 for p in prices]\nprint(with_tax)\nprint(prices)',
        output: '[6.0, 15.0, 10.5]\n[4, 10, 7]',
        explanation:
          'Each price is multiplied by 1.5 in order, giving floats. prices itself is left as it was.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'temps = [0, 10, 25]\nprint([t + 273 for t in temps])',
          ['[0, 10, 25]', '[273, 283, 298]', '[273, 10, 25]', '[298]'],
          1,
          'The expression t + 273 is applied to every item, so each of the three values changes.',
        ),
        predictOutput(
          'What is printed?',
          'words = ["hi", "hello", "hey"]\nprint([len(w) for w in words])',
          ['[2, 5, 3]', '3', '[2, 3, 5]', "['hi', 'hello', 'hey']"],
          0,
          'The new list holds the length of each word, in the original order.',
        ),
        predictOutput(
          'What is the output?',
          'names = ["ada", "lin"]\nprint([f"@{n}" for n in names])',
          [
            "['@n', '@n']",
            "['ada', 'lin']",
            "['@ada', '@lin']",
            "['@ada@lin']",
          ],
          2,
          'The f-string is evaluated for each name, giving one new string per item.',
        ),
        choose(
          'Which comprehension builds the same list as this loop?',
          [
            '[nums / 2 for n in nums]',
            '[n for n in nums / 2]',
            '[n / 2 in nums]',
            '[n / 2 for n in nums]',
          ],
          3,
          'The expression n / 2 goes first, followed by the for part that supplies each n.',
          'halves = []\nfor n in nums:\n    halves.append(n / 2)',
        ),
      ],
    },
    {
      title: 'Keep only some items with an if filter',
      explanation: [
        'Adding if condition after the for part keeps only the items for which the condition is true: [n for n in values if n > 0].',
        'Items that fail the test are skipped entirely; nothing takes their place. The new list can therefore be shorter than the original, or even empty.',
      ],
      example: {
        code: 'ages = [12, 30, 17, 45, 18]\nadults = [a for a in ages if a >= 18]\nprint(adults)',
        output: '[30, 45, 18]',
        explanation:
          '12 and 17 fail the test and are left out. The others are kept in their original order.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'nums = [3, 8, 11, 6, 7]\nprint([n for n in nums if n % 2 == 1])',
          ['[8, 6]', '[3, 11, 7]', '[1, 1, 1]', '[3, 7, 11]'],
          1,
          'The filter keeps the odd numbers, and the expression n keeps them unchanged and in order.',
        ),
        predictOutput(
          'What is printed?',
          'words = ["cat", "horse", "ox", "zebra"]\nprint([w for w in words if len(w) > 3])',
          [
            "['horse', 'zebra']",
            "['cat', 'ox']",
            '[5, 5]',
            "['cat', 'horse', 'zebra']",
          ],
          0,
          'Only horse and zebra are longer than 3 letters; cat has exactly 3, which is not more than 3.',
        ),
        choose(
          'Which comprehension keeps the strings in names that are not "admin"?',
          [
            '[n != "admin" for n in names]',
            '[n for n in names if "admin"]',
            '[n for n in names if n != "admin"]',
            '[n if n != "admin" for n in names]',
          ],
          2,
          'The test goes after the for part and is checked for each n; the expression n keeps the string itself.',
        ),
        predictOutput(
          'What is the output?',
          'scores = [40, 55, 38]\npassed = [s for s in scores if s >= 60]\nprint(passed, len(passed))',
          ['[40, 55, 38] 3', '[False, False, False] 3', '[0, 0, 0] 3', '[] 0'],
          3,
          'No score passes the test, and failing items are skipped, so the new list is empty.',
        ),
      ],
    },
    {
      title: 'Filter first, then transform the kept items',
      explanation: [
        'A comprehension can filter and transform at once: [n * 10 for n in values if n > 2]. The condition is checked on each original item first, and only the items that pass go through the expression.',
        'So the condition talks about the original values, not the results. Read it as: for each n in values, if n > 2, add n * 10.',
      ],
      example: {
        code: 'trees = ["oak", "maple", "fir", "birch"]\nloud = [t + "!" for t in trees if len(t) > 3]\nprint(loud)',
        output: "['maple!', 'birch!']",
        explanation:
          'oak and fir fail the length test on the original words and are skipped. Only maple and birch get an exclamation mark.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'values = [1, 2, 4, 6]\nprint([v * v for v in values if v > 3])',
          ['[16, 36]', '[4, 16, 36]', '[4, 6]', '[1, 4, 16, 36]'],
          0,
          'The test uses the original values, so only 4 and 6 are kept; their squares are 16 and 36.',
        ),
        predictOutput(
          'What is printed?',
          'prices = [12, 3, 25, 8]\nprint([p - 5 for p in prices if p > 7])',
          ['[20]', '[7, 20, 3]', '[12, 25, 8]', '[7, 20]'],
          1,
          '12, 25 and 8 pass the test on the original prices, and each has 5 taken off.',
        ),
        predictOutput(
          'What is the output?',
          'words = ["tea", "", "milk", "jam"]\nprint([w + "s" for w in words if len(w) > 0])',
          [
            "['teas', 's', 'milks', 'jams']",
            "['tea', 'milk', 'jam']",
            "['teas', 'milks', 'jams']",
            "['teas', 'milks']",
          ],
          2,
          'The empty string fails the test before the expression runs, so it never becomes "s".',
        ),
        choose(
          'Which comprehension gives the squares of only the negative numbers in nums?',
          [
            '[n * n for n in nums if n * n < 0]',
            '[n < 0 for n in nums if n * n]',
            '[n for n in nums if n * n < 0]',
            '[n * n for n in nums if n < 0]',
          ],
          3,
          'The filter must test the original n; testing n * n < 0 would never pass, because a square is never negative.',
        ),
      ],
    },
  ],
  'build-nested-lists': [
    {
      title: 'Build a grid of independent rows',
      explanation: [
        '[[0] * cols for _ in range(rows)] builds a grid with rows rows of cols zeros. The comprehension evaluates [0] * cols once on every pass, so each row is a brand-new list, and changing a cell changes only its own row.',
        'The underscore is an ordinary variable name that signals "this loop variable is not used". len(grid) counts the rows and len(grid[0]) the columns.',
      ],
      example: {
        code: 'board = [["."] * 4 for _ in range(3)]\nboard[2][1] = "#"\nprint(len(board), len(board[0]))\nprint(board[2])\nprint(board[0])',
        output: "3 4\n['.', '#', '.', '.']\n['.', '.', '.', '.']",
        explanation:
          'Three passes make three separate rows of four dots. Changing a cell in row 2 leaves row 0 untouched.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'grid = [[0] * 2 for _ in range(3)]\nprint(grid)',
          [
            '[[0, 0, 0], [0, 0, 0]]',
            '[[0, 0], [0, 0], [0, 0]]',
            '[0, 0, 0, 0, 0, 0]',
            '[[0, 0]]',
          ],
          1,
          'range(3) gives three passes, and each pass makes a row of two zeros.',
        ),
        predictOutput(
          'What is printed?',
          'marks = [[0] * 3 for _ in range(2)]\nmarks[1][2] = 5\nprint(marks)',
          [
            '[[0, 0, 0], [0, 0, 5]]',
            '[[0, 0, 5], [0, 0, 5]]',
            '[[0, 5, 0], [0, 0, 0]]',
            '[[0, 0, 0], [0, 5, 0]]',
          ],
          0,
          'The rows are separate lists, so only row 1, column 2 changes.',
        ),
        choose(
          'Which expression builds 5 independent rows of 2 zeros each?',
          [
            '[[0] * 5 for _ in range(2)]',
            '[0] * 2 * 5',
            '[[0, 0] for _ in range(5)]',
            '[[0] * 2] + 5',
          ],
          2,
          'The comprehension runs 5 times and evaluates the row [0, 0] afresh on each pass.',
        ),
        predictOutput(
          'What is the output?',
          'table = [[0] * 4 for _ in range(3)]\nfor row in table:\n    row[0] = 1\nprint(table[1], len(table))',
          [
            '[1, 1, 1, 1] 3',
            '[1, 0, 0, 0] 4',
            '[0, 0, 0, 0] 3',
            '[1, 0, 0, 0] 3',
          ],
          3,
          'row is each actual row of the grid, so setting row[0] marks the first cell of all 3 rows.',
        ),
      ],
    },
    {
      title: 'Make separate empty lists to fill later',
      explanation: [
        '[[] for _ in range(n)] gives n separate empty lists, one new list per pass. This is the starting point for grouping: put each item into the list for its group with groups[i].append(item).',
        'Because every inner list is its own list, appending to one leaves the others as they were.',
      ],
      example: {
        code: 'numbers = [7, 2, 9, 4, 6]\nbuckets = [[] for _ in range(2)]\nfor n in numbers:\n    buckets[n % 2].append(n)\nprint(buckets)',
        output: '[[2, 4, 6], [7, 9]]',
        explanation:
          'Even numbers have remainder 0 and go into buckets[0]; odd numbers go into buckets[1].',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'lists = [[] for _ in range(3)]\nlists[0].append("x")\nlists[2].append("y")\nprint(lists)',
          [
            "[['x', 'y'], ['x', 'y'], ['x', 'y']]",
            "[['x'], [], ['y']]",
            "[['x'], ['y'], []]",
            "['x', 'y']",
          ],
          1,
          'Each inner list is separate, so x goes only into list 0 and y only into list 2.',
        ),
        predictOutput(
          'What is printed?',
          'words = ["ox", "cat", "be", "dog", "a"]\nby_len = [[] for _ in range(4)]\nfor w in words:\n    by_len[len(w)].append(w)\nprint(by_len[2], by_len[0])',
          [
            "['ox', 'be'] []",
            "['cat', 'dog'] ['a']",
            "['ox', 'be'] ['a']",
            "['be', 'ox'] []",
          ],
          0,
          'Each word goes into the list whose index is its length. No word has length 0, so by_len[0] stays empty.',
        ),
        choose(
          'Why does [[] for _ in range(5)] give five groups that can be filled separately?',
          [
            'The underscore copies each list',
            'range(5) sorts the groups',
            'Empty lists can never be shared',
            'Each pass evaluates [] and makes a new list',
          ],
          3,
          'The row expression runs once per pass, so every pass produces a different list.',
        ),
        predictOutput(
          'What is the output?',
          'rows = [[] for _ in range(2)]\nfor i in range(3):\n    rows[0].append(i)\n    rows[1].append(i * 10)\nprint(rows)',
          [
            '[[0, 10, 20], [0, 10, 20]]',
            '[[0, 0], [1, 10], [2, 20]]',
            '[[0, 1, 2], [0, 10, 20]]',
            '[[0, 1, 2, 0, 10, 20]]',
          ],
          2,
          'Row 0 collects each i and row 1 collects each i * 10; the two lists stay separate.',
        ),
      ],
    },
    {
      title: 'Spot the [[0] * cols] * rows trap',
      explanation: [
        '[[0] * cols] * rows looks like a grid but is not one. Repeating the outer list repeats a reference to its single inner list, so every row is the same list, and changing grid[0][0] shows up in every row.',
        '[0] * cols on its own is safe, because a number cannot change in place: assigning to a slot puts a new number there instead of changing a shared one.',
      ],
      example: {
        code: 'rows = [[0] * 3] * 2\nrows[1][2] = 4\nprint(rows)\ncells = [0] * 3\ncells[0] = 4\nprint(cells)',
        output: '[[0, 0, 4], [0, 0, 4]]\n[4, 0, 0]',
        explanation:
          'Both rows are one list, so the change appears twice. In the flat list, assigning cells[0] replaces only that slot.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'g = [["-"] * 3] * 2\ng[1][1] = "X"\nprint(g)',
          [
            "[['-', '-', '-'], ['-', 'X', '-']]",
            "[['-', 'X', '-'], ['-', 'X', '-']]",
            "[['-', 'X', '-'], ['-', '-', '-']]",
            "[['X', 'X', 'X'], ['-', '-', '-']]",
          ],
          1,
          'Both rows are the same list, so changing g[1][1] also changes g[0][1].',
        ),
        predictOutput(
          'What is printed?',
          'seen = [False] * 3\nseen[1] = True\nprint(seen)',
          [
            '[True, True, True]',
            '[True, False, False]',
            '[False, True, False]',
            '[False, False, True]',
          ],
          2,
          'Repeating a simple value is safe: the assignment replaces only slot 1.',
        ),
        predictOutput(
          'What is the output?',
          'groups = [[]] * 3\ngroups[0].append(5)\nprint(len(groups[2]))',
          ['1', '0', '3', '5'],
          0,
          'groups holds the same empty list three times, so appending through groups[0] also fills groups[2].',
        ),
        choose(
          'Which line builds a 3 by 3 grid whose rows can change independently?',
          [
            'grid = [[0] * 3] * 3',
            'grid = [[0, 0, 0]] * 3',
            'grid = [0] * 9',
            'grid = [[0] * 3 for _ in range(3)]',
          ],
          3,
          'Only the comprehension makes a new row on every pass; [0] * 9 is a flat list, not a grid.',
        ),
      ],
    },
    {
      title: 'Use the loop variable to fill each row',
      explanation: [
        'The row expression can use the loop variable, so each row can be different: [[r] * 3 for r in range(2)] gives [[0, 0, 0], [1, 1, 1]].',
        'The row expression can also be a comprehension. In [[r * c for c in range(cols)] for r in range(rows)], the outer for picks a row number r, and the inner comprehension builds that whole row before the outer one moves to the next r.',
      ],
      example: {
        code: 'table = [[r * c for c in range(1, 4)] for r in range(1, 4)]\nprint(table[0])\nprint(table[2])',
        output: '[1, 2, 3]\n[3, 6, 9]',
        explanation:
          'Row 0 is built with r = 1, giving 1, 2 and 3. Row 2 is built with r = 3, giving 3, 6 and 9.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'rows = [[n] * n for n in range(1, 4)]\nprint(rows)',
          [
            '[[1], [2, 2], [3, 3, 3]]',
            '[[1, 1, 1], [2, 2, 2], [3, 3, 3]]',
            '[[0], [1, 1], [2, 2, 2]]',
            '[[1], [2], [3]]',
          ],
          0,
          'For each n from 1 to 3, the row holds n copies of n.',
        ),
        predictOutput(
          'What is printed?',
          'grid = [[r + c for c in range(3)] for r in range(2)]\nprint(grid)',
          [
            '[[0, 1], [1, 2], [2, 3]]',
            '[[0, 1, 2], [1, 2, 3]]',
            '[[0, 1, 2], [0, 1, 2]]',
            '[0, 1, 2, 1, 2, 3]',
          ],
          1,
          'The outer range(2) makes two rows; each row has three cells, r + 0, r + 1 and r + 2.',
        ),
        predictOutput(
          'What is the output?',
          'tri = [[c for c in range(r)] for r in range(4)]\nprint(tri[3], len(tri))',
          ['[0, 1, 2, 3] 4', '[0, 1, 2] 3', '[0, 1, 2] 4', '[1, 2, 3] 4'],
          2,
          'Row 3 is range(3), which is 0, 1 and 2. There are four rows, for r = 0, 1, 2 and 3.',
        ),
        choose(
          'Which expression builds [[0, 1], [0, 1], [0, 1]]?',
          [
            '[[c for c in range(3)] for r in range(2)]',
            '[[r] * 2 for r in range(3)]',
            '[[c, c + 1] for c in range(3)]',
            '[[c for c in range(2)] for r in range(3)]',
          ],
          3,
          'The outer range(3) makes three rows, and each row is the inner comprehension over range(2).',
        ),
      ],
    },
  ],
  'generator-expressions': [
    {
      title: 'Feed a generator expression to sum, min, or max',
      explanation: [
        'A generator expression is a comprehension without the square brackets: sum(p * 2 for p in prices). Instead of building a list first, it hands its values one at a time to the function that consumes them. When it is the only argument, the call’s own parentheses are enough.',
        'min and max accept a generator expression too, so max(len(w) for w in words) finds the longest length without a temporary list.',
      ],
      example: {
        code: 'widths = [3, 5, 2]\nprint(sum(w * w for w in widths))\nprint(max(len(word) for word in ["map", "atlas", "globe"]))',
        output: '38\n5',
        explanation:
          'The squares 9, 25 and 4 are added as they are produced. The lengths are 3, 5 and 5, and the largest is 5.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'costs = [2.5, 4, 1.5]\nprint(sum(c * 2 for c in costs))',
          ['16.0', '8.0', '16', '[5.0, 8, 3.0]'],
          0,
          'The doubled costs 5.0, 8 and 3.0 are added; mixing in floats makes the total a float.',
        ),
        predictOutput(
          'What is printed?',
          'names = ["Eve", "Bartholomew", "Jo"]\nprint(min(len(n) for n in names))',
          ['Jo', '2', '3', '11'],
          1,
          'min receives the lengths 3, 11 and 2, so it returns the number 2, not a name.',
        ),
        predictOutput(
          'What is the output?',
          'readings = [-4, 7, -9, 2]\nprint(max(abs(r) for r in readings))',
          ['7', '-9', '9', '2'],
          2,
          'max compares the distances from zero, 4, 7, 9 and 2, and returns 9.',
        ),
        choose(
          'How does sum(n * n for n in nums) differ from sum([n * n for n in nums])?',
          [
            'It gives a different total',
            'It only works for short lists',
            'It skips the first item',
            'It builds no list of squares first',
          ],
          3,
          'Both give the same total; the generator expression just hands over each square without storing a list.',
        ),
      ],
    },
    {
      title: 'Filter with if inside a generator expression',
      explanation: [
        'A generator expression can end with an if filter, just like a comprehension: sum(x for x in values if x > 0) adds only the positive values.',
        'Summing 1 for every item that passes, sum(1 for x in values if x > 0), counts them. min and max see only the items that pass the filter.',
      ],
      example: {
        code: 'temps = [18, 25, 31, 22, 29]\nprint(sum(1 for t in temps if t > 24))\nprint(min(t for t in temps if t > 24))',
        output: '3\n25',
        explanation:
          'Three temperatures are above 24, so three 1s are added. Among those three, the smallest is 25.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'values = [4, -3, 10, -1, 5]\nprint(sum(v for v in values if v > 0))',
          ['15', '19', '-4', '23'],
          1,
          'Only 4, 10 and 5 pass the filter, and they add up to 19.',
        ),
        predictOutput(
          'What is printed?',
          'words = ["sun", "sky", "moon", "star", "sea"]\nprint(sum(1 for w in words if len(w) == 3))',
          ['3', '9', '5', '2'],
          0,
          'Each of the three 3-letter words contributes 1, so the result is a count, not a total length.',
        ),
        choose(
          'Which expression counts the even numbers in nums?',
          [
            'sum(n for n in nums if n % 2 == 0)',
            'len(n for n in nums if n % 2 == 0)',
            'sum(1 for n in nums if n % 2 == 0)',
            'max(1 for n in nums if n % 2 == 0)',
          ],
          2,
          'Adding 1 for each even number counts them; adding n itself would total their values instead.',
        ),
        predictOutput(
          'What is the output?',
          'ages = [34, 15, 22, 9, 41]\nprint(min(a for a in ages if a >= 18), max(a for a in ages if a < 18))',
          ['9 41', '15 22', '18 17', '22 15'],
          3,
          'The smallest age of at least 18 is 22, and the largest age under 18 is 15.',
        ),
      ],
    },
    {
      title: 'Ask whether any or all items pass',
      explanation: [
        'any(test for x in items) is True when at least one item passes the test. all(test for x in items) is True only when every item passes.',
        'Each stops as soon as the answer is known: any at the first item that passes, all at the first item that fails. Use any for "is there at least one?" and all for "does every one?".',
      ],
      example: {
        code: 'stock = [12, 0, 7]\nprint(any(s == 0 for s in stock))\nprint(all(s > 0 for s in stock))\nprint(all(s < 20 for s in stock))',
        output: 'True\nFalse\nTrue',
        explanation:
          'One count is 0, so any is True and all(s > 0) is False. Every count is below 20, so the last all is True.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'passwords = ["abc12345", "short", "longer123"]\nprint(all(len(p) >= 8 for p in passwords))',
          ['True', 'False', '2', '[True, False, True]'],
          1,
          'short has only 5 characters, and one failure makes all return False.',
        ),
        predictOutput(
          'What is printed?',
          'scores = [55, 62, 48]\nprint(any(s >= 60 for s in scores), all(s >= 40 for s in scores))',
          ['True True', 'False True', 'True False', 'False False'],
          0,
          '62 is at least 60, so any is True; every score is at least 40, so all is True.',
        ),
        predictOutput(
          'What is the output?',
          'names = ["ana", "Ben", "cy"]\nprint(any(n == "ben" for n in names))',
          ['True', 'Ben', 'False', '1'],
          2,
          'String comparison is case-sensitive, so "Ben" does not equal "ben", and no item passes.',
        ),
        choose(
          'Which expression is True only when every value in nums is positive?',
          [
            'any(n > 0 for n in nums)',
            'all(n for n in nums if n > 0)',
            'any(n < 0 for n in nums)',
            'all(n > 0 for n in nums)',
          ],
          3,
          'all checks the test n > 0 on every value and fails if any value is not positive.',
        ),
      ],
    },
    {
      title: 'Predict the results for empty input',
      explanation: [
        'When nothing reaches the function, because the list is empty or the filter keeps nothing, each one still gives a fixed answer. sum gives 0. any gives False, since no item passed. all gives True, since no item failed.',
        'min and max raise ValueError instead, because nothing has no smallest or largest item. Check that some item will pass the filter before calling them.',
      ],
      example: {
        code: 'scores = [45, 52, 38]\nprint(sum(s for s in scores if s >= 90))\nprint(any(s >= 90 for s in scores))\nprint(all(s >= 90 for s in scores if s >= 90))',
        output: '0\nFalse\nTrue',
        explanation:
          'No score is 90 or more. The sum of nothing is 0, any finds no passing item, and the last all receives no items at all, so nothing fails.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'orders = []\nprint(sum(o for o in orders), any(o > 0 for o in orders), all(o > 0 for o in orders))',
          ['0 False False', '0 False True', '0 True True', '0 True False'],
          1,
          'With no orders, the sum is 0, any finds nothing that passes, and all finds nothing that fails.',
        ),
        choose(
          'What does max(x for x in [3, 5] if x > 10) do?',
          ['Returns 0', 'Returns 5', 'Raises ValueError', 'Returns 10'],
          2,
          'No item passes the filter, and max of nothing raises ValueError.',
        ),
        predictOutput(
          'What is printed?',
          'items = [2, 4, 6]\nprint(all(n % 2 == 1 for n in items if n > 6))',
          ['True', 'False', '0', '6'],
          0,
          'No item is greater than 6, so all receives nothing; with no failures it returns True.',
        ),
        choose(
          'tasks is an empty list of status strings. Which expression is True?',
          [
            'any(t == "done" for t in tasks)',
            'sum(1 for t in tasks) == 1',
            'any(t != "done" for t in tasks)',
            'all(t == "done" for t in tasks)',
          ],
          3,
          'all over no items is True, while any over no items is False and the count is 0.',
        ),
      ],
    },
  ],
  errors: [
    {
      title: 'Name the exception a failing line raises',
      explanation: [
        'When a line cannot run, Python stops the program and prints a traceback. Read its last line first: it names the exception type and gives a message. The lines just above it show the line number and the code that failed.',
        'Four types cover most early mistakes. ValueError: a conversion such as int() got text it cannot convert. NameError: a name is used before it was assigned, or is misspelled. TypeError: an operation got the wrong kind of value, such as "Total: " + 5. ZeroDivisionError: a number was divided by zero with /, // or %.',
      ],
      example: {
        code: 'quantity = "12"\ntotal = int(quantity) * 3\nprint(total)\n# If quantity were "12.5", line 2 would fail, and the traceback would end with:\n# ValueError: invalid literal for int() with base 10: \'12.5\'',
        output: '36',
        explanation:
          'int("12") works, so the program prints 36. int() accepts only whole-number text, so "12.5" would raise ValueError, and the last traceback line would name it together with the text that failed.',
      },
      questions: [
        choose(
          'Which exception does this line raise?',
          ['ValueError', 'NameError', 'TypeError', 'ZeroDivisionError'],
          2,
          '+ cannot join a string and an int; the operand has the wrong type, so Python raises TypeError.',
          'label = "Score: " + 40',
        ),
        choose(
          'A program stops with this traceback. What went wrong?',
          [
            'Line 4 converts text that is not a number',
            'Line 4 uses a misspelled or unassigned name',
            'Line 4 divides a number by zero',
            'Line 4 adds a string to a number',
          ],
          1,
          'The last line names NameError: averge was never assigned, most likely a typo for average.',
          'Traceback (most recent call last):\n  File "main.py", line 4, in <module>\n    print(averge)\nNameError: name \'averge\' is not defined',
        ),
        choose(
          'Which of these conversions raises ValueError?',
          ['int("-8")', 'float("2.5")', 'str(25)', 'int("2.5")'],
          3,
          'int() accepts only whole-number text, and "2.5" has a decimal point. float("2.5") and int("-8") both succeed.',
        ),
        choose(
          'Which exception does the last line raise?',
          ['ZeroDivisionError', 'ValueError', 'TypeError', 'NameError'],
          0,
          '% divides to find a remainder, so a divisor of 0 raises ZeroDivisionError, just as / and // do.',
          'groups = 0\nprint(17 % groups)',
        ),
        predictOutput(
          'What does this program print?',
          'def per_person(total, people):\n    if people == 0:\n        return 0\n    return total / people\n\nprint(per_person(12, 0))\nprint(per_person(12, 4))',
          ['0\n3', 'ZeroDivisionError\n3.0', '0\n3.0', '0.0\n3.0'],
          2,
          'The early return handles 0 people before any division runs, so nothing fails. 12 / 4 is the float 3.0.',
        ),
      ],
    },
    {
      title: 'Catch a specific exception with try/except',
      explanation: [
        'Put the operation that might fail inside try:. If a line in the try block raises, Python skips the rest of that block and runs the matching except block. If nothing fails, the except block is skipped. Either way, the program continues after the whole try statement.',
        'Name the exception you expect, as in except ValueError:. An except clause catches only the type it names, so a different failure, such as a NameError from a typo, still stops the program and shows you the bug instead of hiding it.',
      ],
      example: {
        code: 'text = "3 apples"\ntry:\n    count = int(text)\n    print("converted")\nexcept ValueError:\n    count = 0\n    print("not a number")\nprint(count + 1)',
        output: 'not a number\n1',
        explanation:
          'int(text) raises ValueError, so print("converted") is skipped and the except block sets count to 0. The last line runs after the try statement and prints 1.',
      },
      questions: [
        predictOutput(
          'What is printed?',
          'try:\n    n = int("40")\n    print(n + 2)\nexcept ValueError:\n    print("bad input")\nprint("done")',
          ['bad input\ndone', '42\ndone', '42\nbad input\ndone', '42'],
          1,
          'The conversion succeeds, so the except block is skipped and the program continues to print done.',
        ),
        predictOutput(
          'What is the output?',
          'try:\n    print("start")\n    value = float("ten")\n    print("middle")\nexcept ValueError:\n    print("fallback")\nprint("end")',
          [
            'start\nmiddle\nfallback\nend',
            'fallback\nend',
            'start\nmiddle\nend',
            'start\nfallback\nend',
          ],
          3,
          'start prints before the failure. float("ten") raises ValueError, so middle is skipped and fallback runs, then end.',
        ),
        predictOutput(
          'What does this program print?',
          'def to_minutes(text):\n    try:\n        return int(text) * 60\n    except ValueError:\n        return -1\n\nprint(to_minutes("2"))\nprint(to_minutes("two"))',
          ['120\n-1', '-1\n-1', '120\nNone', '2\n-1'],
          0,
          '"2" converts and returns 120. "two" raises ValueError inside try, and the except block returns -1.',
        ),
        choose(
          'What happens when this program runs?',
          [
            'It prints invalid number',
            'It prints 5',
            'It prints nothing and continues',
            'It stops with a NameError',
          ],
          3,
          'except ValueError catches only ValueError. The misspelled name raises NameError, which is not caught, so the program stops.',
          'try:\n    total = 5\n    print(totl)\nexcept ValueError:\n    print("invalid number")',
        ),
        choose(
          'Why write except ValueError: instead of catching every kind of exception?',
          [
            'Python requires an exception name after except',
            'A broad handler runs more slowly',
            'A broad handler would also hide typos and other bugs',
            'ValueError is the only exception int() can raise',
          ],
          2,
          'Catching only the expected failure handles bad input while unexpected mistakes still stop the program, where you can see and fix them.',
        ),
      ],
    },
    {
      title: 'Raise ValueError from your own function',
      explanation: [
        'Your own function can report bad input the same way int() does. raise ValueError("message") stops the function immediately; no value is returned, and no later line of the function runs. Use it when the arguments make the job impossible, such as a negative age.',
        'The caller handles it like any built-in error: make the call inside try and catch ValueError. Lines after the failing call in the try block are skipped. If nothing catches it, the program stops and the traceback shows your message.',
      ],
      example: {
        code: 'def ticket_price(age):\n    if age < 0:\n        raise ValueError("age cannot be negative")\n    if age < 12:\n        return 5\n    return 9\n\ntry:\n    print(ticket_price(30))\n    print(ticket_price(-2))\n    print(ticket_price(8))\nexcept ValueError:\n    print("invalid age")',
        output: '9\ninvalid age',
        explanation:
          '30 gives 9. -2 raises ValueError inside the function, so the rest of the try block, including the call with 8, is skipped, and the except block runs.',
      },
      questions: [
        predictOutput(
          'What is printed?',
          'def withdraw(balance, amount):\n    if amount > balance:\n        raise ValueError("insufficient funds")\n    return balance - amount\n\ntry:\n    print(withdraw(50, 20))\n    print(withdraw(50, 80))\nexcept ValueError:\n    print("declined")',
          ['30\n-30', 'declined', '30\ndeclined', '30\ndeclined\n-30'],
          2,
          'The first call returns 30. The second raises ValueError before subtracting, so declined is printed instead.',
        ),
        predictOutput(
          'What is the output?',
          'def check_score(score):\n    if score > 100:\n        raise ValueError("too high")\n    print("checking")\n    return score\n\ntry:\n    result = check_score(150)\nexcept ValueError:\n    result = 100\nprint(result)',
          ['100', 'checking\n150', 'checking\n100', '150'],
          0,
          'raise stops the function before print("checking") runs, so the except block sets result to 100.',
        ),
        choose(
          'A function runs raise ValueError("empty name"). What happens next?',
          [
            'The function returns None and the caller continues',
            'The next line of the function runs',
            'The function returns the message as a string',
            'The function stops, and the error passes to the caller',
          ],
          3,
          'raise ends the function at once; the caller either catches the ValueError or stops with it.',
        ),
        choose(
          'Which line correctly reports that a width is invalid?',
          [
            'return ValueError("width must be positive")',
            'raise ValueError("width must be positive")',
            'print(ValueError("width must be positive"))',
            'except ValueError("width must be positive")',
          ],
          1,
          'raise signals the failure and stops the function. Returning or printing a ValueError does not stop anything.',
        ),
        predictOutput(
          'What does this program print?',
          'def parse_level(text):\n    level = int(text)\n    if level > 5:\n        raise ValueError("level must be 1 to 5")\n    return level\n\ntry:\n    print(parse_level("3"))\n    print(parse_level("9"))\nexcept ValueError:\n    print("bad level")\ntry:\n    print(parse_level("x"))\nexcept ValueError:\n    print("bad level")',
          [
            '3\n9\nbad level',
            '3\nbad level\nbad level',
            '3\nbad level',
            '3\nbad level\nx',
          ],
          1,
          '"9" converts but is too high, so the function raises ValueError. "x" makes int() raise ValueError. except ValueError catches both.',
        ),
      ],
    },
  ],
  'problem-solving': [
    {
      title: 'State the input and the output before coding',
      explanation: [
        'Start by naming what goes in and what comes out. A word counter takes a list of words and returns a dictionary that maps each distinct word to the number of times it appears. It returns the dictionary instead of printing it, so the caller can store it, look up a word, or test it.',
        'Then work a tiny input by hand. ["red", "blue", "red"] should give {"red": 2, "blue": 1}: one key per distinct word, in the order each word first appears, with counts that add up to the number of words in the list.',
      ],
      example: {
        code: 'def count_words(words):\n    counts = {}\n    for word in words:\n        counts[word] = counts.get(word, 0) + 1\n    return counts\n\ntally = count_words(["sun", "rain", "sun", "sun"])\nprint(tally)\nprint(tally["sun"] + tally["rain"])',
        output: "{'sun': 3, 'rain': 1}\n4",
        explanation:
          'The input is a list of 4 words; the output has one key per distinct word. The counts add up to 4, the length of the input, which is a quick check on a hand-worked answer.',
      },
      questions: [
        choose(
          'For the input ["ox", "ant", "ox"], which value should count_words return?',
          [
            '{2: "ox", 1: "ant"}',
            '{"ox": 1, "ant": 1}',
            '{"ox": 2, "ant": 1}',
            '["ox", "ant"]',
          ],
          2,
          'Each distinct word is a key and its value is how often it appears: ox twice, ant once.',
        ),
        predictOutput(
          'What is printed?',
          'def count_words(words):\n    counts = {}\n    for word in words:\n        counts[word] = counts.get(word, 0) + 1\n    return counts\n\nprint(count_words(["b", "a", "b", "c", "a", "b"]))',
          [
            "{'a': 2, 'b': 3, 'c': 1}",
            "{'b': 3, 'a': 2, 'c': 1}",
            "{'b': 1, 'a': 1, 'c': 1}",
            "{'b': 2, 'a': 1, 'c': 0}",
          ],
          1,
          'Keys appear in the order the words are first seen, b, a, c, and the counts are 3, 2 and 1.',
        ),
        choose(
          'Why should count_words return its dictionary rather than print it?',
          [
            'Printing a dictionary raises an error in a function',
            'A returned dictionary is sorted by key automatically',
            'Every function must end with a return statement',
            'The caller can store, look up, and test the result',
          ],
          3,
          'Returned data can be assigned, indexed by key, and compared with an expected answer; printed text cannot.',
        ),
        choose(
          'A list holds 7 words, and 3 of them are distinct. What must be true of count_words for that list?',
          [
            'It has 3 keys whose counts add up to 7',
            'It has 7 keys whose counts add up to 3',
            'It has 3 keys, each with the count 7',
            'It has 7 keys, each with the count 1',
          ],
          0,
          'There is one key per distinct word, and every word adds 1 to some count, so the counts total 7.',
        ),
      ],
    },
    {
      title: 'Build the counts with get(word, 0) + 1',
      explanation: [
        'Create an empty dictionary before the loop, visit each word, and update its entry with counts[word] = counts.get(word, 0) + 1. For a word seen before, get returns its stored count; for a new word, it returns the default 0, so the first occurrence stores 1. Return the dictionary after the loop.',
        'Two near-misses fail differently. counts[word] += 1 must read counts[word] first, which raises KeyError for a new word. counts[word] = 1 never fails, but it resets the count on every repeat, so every word ends at 1.',
      ],
      example: {
        code: 'counts = {}\nfor fruit in ["pear", "fig", "pear"]:\n    counts[fruit] = counts.get(fruit, 0) + 1\n    print(fruit, counts[fruit])\nprint(counts)',
        output: "pear 1\nfig 1\npear 2\n{'pear': 2, 'fig': 1}",
        explanation:
          'The first pear and fig start from the default 0 and store 1. The second pear reads its stored 1 and stores 2.',
      },
      questions: [
        predictOutput(
          'What is the output?',
          'counts = {"a": 2}\ncounts["a"] = counts.get("a", 0) + 1\ncounts["b"] = counts.get("b", 0) + 1\nprint(counts["a"], counts["b"])',
          ['1 1', '3 0', '2 1', '3 1'],
          3,
          '"a" already holds 2, so it becomes 3. "b" is missing, so get returns 0 and it becomes 1.',
        ),
        predictOutput(
          'This version has a bug. What does it print?',
          'def count_words(words):\n    counts = {}\n    for word in words:\n        counts[word] = 1\n    return counts\n\nprint(count_words(["go", "stop", "go", "go"]))',
          [
            "{'go': 3, 'stop': 1}",
            "{'go': 1, 'stop': 1}",
            "{'stop': 1, 'go': 1}",
            "{'go': 2, 'stop': 1}",
          ],
          1,
          'Each repeat assigns 1 again instead of adding to the old count. Updating a key keeps its original position.',
        ),
        choose(
          'counts starts as {}. What goes wrong if the loop body is counts[word] += 1?',
          [
            'Every count stays at 0',
            'Repeated words are skipped',
            'The first new word raises KeyError',
            'Every count comes out doubled',
          ],
          2,
          '+= reads counts[word] before adding, and a word that is not yet a key raises KeyError.',
        ),
        predictOutput(
          'What does this program print?',
          'def count_words(words):\n    counts = {}\n    for word in words:\n        counts[word] = counts.get(word, 0) + 1\n        return counts\n\nprint(count_words(["up", "up", "down"]))',
          ["{'up': 1}", "{'up': 2, 'down': 1}", "{'up': 1, 'down': 1}", '{}'],
          0,
          'return is indented inside the loop, so the function returns after counting only the first word.',
        ),
      ],
    },
    {
      title: 'Test the boundary cases',
      explanation: [
        'Check the inputs most likely to break a solution. An empty list skips the loop entirely, so the counter returns {}. A list of one repeated word must give a single key with the full count. Words that differ only in capital letters, such as "Tea" and "tea", are different strings, so they get separate keys unless the task says otherwise.',
        'Compare each result with the dictionary you worked out by hand: count_words([]) == {} prints True when the function is right. Two dictionaries are equal when they have the same keys and values, whatever order the keys were added in. The counter builds a new dictionary, so the input list stays unchanged.',
      ],
      example: {
        code: 'def count_words(words):\n    counts = {}\n    for word in words:\n        counts[word] = counts.get(word, 0) + 1\n    return counts\n\nprint(count_words([]))\nprint(count_words(["ok", "ok", "ok"]))\nprint(count_words(["Tea", "tea"]) == {"tea": 1, "Tea": 1})',
        output: "{}\n{'ok': 3}\nTrue",
        explanation:
          'The empty list never enters the loop. Three copies of ok make one key with count 3. Tea and tea are separate keys, and the comparison ignores key order.',
      },
      questions: [
        predictOutput(
          'What is printed?',
          'def count_words(words):\n    counts = {}\n    for word in words:\n        counts[word] = counts.get(word, 0) + 1\n    return counts\n\nprint(count_words(["Go", "go", "GO", "go"]))',
          [
            "{'go': 4}",
            "{'Go': 4}",
            "{'Go': 1, 'go': 2, 'GO': 1}",
            "{'go': 2, 'Go': 1, 'GO': 1}",
          ],
          2,
          'Capital letters make different strings, so Go, go and GO are three keys, in the order first seen.',
        ),
        predictOutput(
          'What is the output?',
          'def count_words(words):\n    counts = {}\n    for word in words:\n        counts[word] = counts.get(word, 0) + 1\n    return counts\n\nempty = count_words([])\nprint(empty == {}, "x" in empty)',
          ['True False', 'False False', 'True True', 'None False'],
          0,
          'The loop never runs, so the function returns an empty dictionary, which has no keys at all.',
        ),
        predictOutput(
          'What does this program print?',
          'def count_words(words):\n    counts = {}\n    for word in words:\n        counts[word] = counts.get(word, 0) + 1\n    return counts\n\nresult = count_words(["b", "a", "b"])\nprint(result == {"a": 1, "b": 2})\nprint(result == {"b": 1, "a": 2})',
          ['False\nFalse', 'False\nTrue', 'True\nTrue', 'True\nFalse'],
          3,
          'Dictionary equality ignores key order but compares values: b must be 2 and a must be 1.',
        ),
        choose(
          'A task says "Cat" and "cat" count as different words. Which test checks that rule?',
          [
            'count_words(["cat", "cat"]) == {"cat": 2}',
            'count_words(["Cat", "cat"]) == {"Cat": 1, "cat": 1}',
            'count_words([]) == {}',
            'count_words(["Cat", "cat"]) == {"cat": 2}',
          ],
          1,
          'Only a test that mixes the two spellings and expects separate keys checks case sensitivity.',
        ),
        predictOutput(
          'What is printed?',
          'def count_words(words):\n    counts = {}\n    for word in words:\n        counts[word] = counts.get(word, 0) + 1\n    return counts\n\nwords = ["x", "y", "x"]\ncounts = count_words(words)\nprint(words)\nprint(counts)',
          [
            "['x', 'y']\n{'x': 2, 'y': 1}",
            "[]\n{'x': 2, 'y': 1}",
            "['x', 'y', 'x']\n{'x': 2, 'y': 1}",
            "{'x': 2, 'y': 1}\n{'x': 2, 'y': 1}",
          ],
          2,
          'The function only reads the list and builds a separate dictionary, so words keeps all three items.',
        ),
      ],
    },
  ],
  sorting: [
    {
      title: 'Get a sorted copy with sorted()',
      explanation: [
        'sorted(values) builds and returns a new list holding the same items in ascending order. Duplicates stay, so sorting [3, 1, 3] gives [1, 3, 3]. The original list keeps its order, so you can use both lists afterwards.',
        'Store or use the result. sorted(values) on a line by itself computes a sorted list and then throws it away, leaving values exactly as it was.',
      ],
      example: {
        code: 'temps = [18, 11, 25, 11]\nordered = sorted(temps)\nprint(ordered)\nprint(temps)\nprint(ordered[0], ordered[-1])',
        output: '[11, 11, 18, 25]\n[18, 11, 25, 11]\n11 25',
        explanation:
          'ordered is a new ascending list that keeps both 11s. temps is unchanged. In the sorted copy, index 0 is the smallest item and index -1 the largest.',
      },
      questions: [
        predictOutput(
          'What is the output?',
          'nums = [4, 9, 1, 7]\nresult = sorted(nums)\nprint(nums)',
          ['[1, 4, 7, 9]', 'None', '[4, 9, 1, 7]', '[9, 7, 4, 1]'],
          2,
          'sorted returned a new list stored in result; nums itself was not changed.',
        ),
        predictOutput(
          'What does this program print?',
          'prices = [12, 5, 8]\nlow = sorted(prices)[0]\nprint(low, prices[0])',
          ['5 5', '12 12', '12 5', '5 12'],
          3,
          'Index 0 of the sorted copy is the smallest price, 5, while prices still starts with 12.',
        ),
        predictOutput(
          'What is printed?',
          'print(sorted([2.5, -1, 2, 0]))',
          [
            '[-1, 0, 2, 2.5]',
            '[0, -1, 2, 2.5]',
            '[2.5, 2, 0, -1]',
            '[-1, 0, 2.5, 2]',
          ],
          0,
          'Ints and floats compare by value, so the order is -1, 0, 2, 2.5 from smallest to largest.',
        ),
        choose(
          'A program runs sorted(scores) on a line by itself, then prints scores. Why is the output still unsorted?',
          [
            'sorted returns None for lists of numbers',
            'sorted returned a new list that nothing stored',
            'scores must be copied before sorted can change it',
            'sorted runs only when its result is printed',
          ],
          1,
          'sorted never changes its argument; its new list was discarded because it was not assigned or used.',
        ),
      ],
    },
    {
      title: 'Predict how strings sort',
      explanation: [
        'Strings sort character by character: the first characters decide, and the next ones matter only when those match. Characters are ordered by their codes, and every uppercase letter comes before every lowercase letter, so "Zoe" sorts before "ada".',
        'A string that is the start of a longer one comes first: "car" before "card". Digits come before letters, and digit text still sorts as text, so "10" comes before "9". Sorting compares items with <, so a list that mixes numbers and strings raises TypeError.',
      ],
      example: {
        code: 'names = ["bea", "Cal", "al", "Ann"]\nprint(sorted(names))\nprint(sorted(["car", "cart", "ca"]))',
        output: "['Ann', 'Cal', 'al', 'bea']\n['ca', 'car', 'cart']",
        explanation:
          'Both capitalized names come before both lowercase ones, and each group is in letter order. ca is the start of car, which is the start of cart, so shorter comes first.',
      },
      questions: [
        predictOutput(
          'What is the output?',
          'print(sorted(["mango", "Kiwi", "apple", "Lime"]))',
          [
            "['apple', 'Kiwi', 'Lime', 'mango']",
            "['Lime', 'Kiwi', 'apple', 'mango']",
            "['mango', 'apple', 'Lime', 'Kiwi']",
            "['Kiwi', 'Lime', 'apple', 'mango']",
          ],
          3,
          'Uppercase K and L come before every lowercase letter; then apple comes before mango.',
        ),
        predictOutput(
          'What does this program print?',
          'print(sorted(["10", "9", "100"]))',
          [
            "['9', '10', '100']",
            "['10', '100', '9']",
            '[9, 10, 100]',
            "['100', '10', '9']",
          ],
          1,
          'These are strings, so the first characters decide: "1" comes before "9". "10" is the start of "100", so it comes first.',
        ),
        choose(
          'Which list is already in the order sorted() would produce?',
          [
            '["apple", "Banana", "cherry"]',
            '["apple", "cherry", "Banana"]',
            '["Banana", "cherry", "apple"]',
            '["Banana", "apple", "cherry"]',
          ],
          3,
          'The capitalized Banana comes first; then the lowercase words follow in letter order.',
        ),
        predictOutput(
          'What is printed?',
          'print(sorted(["sun", "Sun", "sunny", "su"]))',
          [
            "['Sun', 'su', 'sun', 'sunny']",
            "['su', 'sun', 'Sun', 'sunny']",
            "['Sun', 'sun', 'su', 'sunny']",
            "['su', 'Sun', 'sun', 'sunny']",
          ],
          0,
          'Sun starts with a capital, so it is first. Among the rest, each word is the start of the next, so shorter comes first.',
        ),
        choose(
          'What happens when sorted([3, "a", 1]) runs?',
          [
            'It returns [1, 3, "a"], with numbers before text',
            'It returns ["a", 1, 3], with text before numbers',
            'It raises TypeError: 3 and "a" cannot be compared',
            'It returns [1, 3] and leaves out the string "a"',
          ],
          2,
          'Sorting compares items with <, and Python cannot order a number against a string.',
        ),
      ],
    },
    {
      title: 'Sort a list in place with list.sort()',
      explanation: [
        'values.sort() rearranges the list itself. There is no copy, so every name that refers to the same list sees the new order. Use it when you no longer need the original order.',
        'sort returns None. result = values.sort() stores None, and values = values.sort() even replaces your list with None. Call sort on its own line, then use the list.',
      ],
      example: {
        code: 'queue = ["Mo", "Ed", "Lu"]\nanswer = queue.sort()\nprint(answer)\nprint(queue)',
        output: "None\n['Ed', 'Lu', 'Mo']",
        explanation:
          'sort reordered queue itself and returned None, which is what answer holds.',
      },
      questions: [
        predictOutput(
          'What is the output?',
          'a = [7, 3, 5]\nb = a\nb.sort()\nprint(a)',
          ['[7, 3, 5]', 'None', '[7, 5, 3]', '[3, 5, 7]'],
          3,
          'b = a makes both names refer to one list, so sorting it through b also shows through a.',
        ),
        predictOutput(
          'What does this program print?',
          'words = ["oak", "elm", "ash"]\nwords = words.sort()\nprint(words)',
          ["['ash', 'elm', 'oak']", 'None', "['oak', 'elm', 'ash']", '[]'],
          1,
          'The list is sorted, but then words is assigned the return value of sort, which is None.',
        ),
        predictOutput(
          'What is printed?',
          'original = [30, 10, 20]\nworking = original.copy()\nworking.sort()\nprint(original[0], working[0])',
          ['30 10', '10 10', '30 30', '10 30'],
          0,
          'copy made a separate list, so sorting working leaves original in its old order.',
        ),
        choose(
          'Which statement keeps data in its original order and stores a sorted copy?',
          [
            'data.sort()',
            'top = data.sort()',
            'top = sorted(data)',
            'data = sorted(data)',
          ],
          2,
          'sorted makes a new list for top. data.sort() reorders data, and data = sorted(data) rebinds data to the sorted list.',
        ),
      ],
    },
    {
      title: 'Reverse the order with reverse=True or reversed()',
      explanation: [
        'Both sorted and sort accept the keyword argument reverse=True, which orders from largest to smallest, or from z back to A for strings. sorted(values, reverse=True) returns a new descending list; values.sort(reverse=True) reorders values itself.',
        'reversed(values) does not sort at all: it walks the list from its last item to its first. It hands out the items one at a time, so loop over it directly or wrap it in list() to see a list. Use reverse=True to rank items; use reversed() to flip an order you already have.',
      ],
      example: {
        code: 'laps = [52, 48, 55, 50]\nprint(sorted(laps, reverse=True))\nprint(list(reversed(laps)))\nlaps.sort(reverse=True)\nprint(laps[0])',
        output: '[55, 52, 50, 48]\n[50, 55, 48, 52]\n55',
        explanation:
          'reverse=True ranks from largest to smallest. reversed only flips the existing order, so 50 comes first. After the in-place sort, laps[0] is the largest lap.',
      },
      questions: [
        predictOutput(
          'What is the output?',
          'print(list(reversed([4, 1, 3])))',
          ['[4, 3, 1]', '[1, 3, 4]', '[3, 1, 4]', '[4, 1, 3]'],
          2,
          'reversed flips the existing order without sorting, so the last item, 3, comes first.',
        ),
        predictOutput(
          'What does this program print?',
          'print(sorted(["b", "C", "a"], reverse=True))',
          [
            "['b', 'a', 'C']",
            "['C', 'b', 'a']",
            "['a', 'b', 'C']",
            "['a', 'C', 'b']",
          ],
          0,
          'Ascending order is C, a, b because capitals come first; reverse=True turns that into b, a, C.',
        ),
        predictOutput(
          'What is printed?',
          'for step in reversed(["mix", "bake", "cool"]):\n    print(step)',
          [
            'mix\nbake\ncool',
            'bake\ncool\nmix',
            'cool\nmix\nbake',
            'cool\nbake\nmix',
          ],
          3,
          'The loop receives the items from last to first; no sorting happens.',
        ),
        choose(
          'times is [40, 35, 42]. Which expression gives [42, 40, 35]?',
          [
            'list(reversed(times))',
            'sorted(times, reverse=True)',
            'times.sort(reverse=True)',
            'sorted(times)',
          ],
          1,
          'Only sorted with reverse=True returns a descending list. reversed gives [42, 35, 40], and sort returns None.',
        ),
        predictOutput(
          'What is the output?',
          'nums = [5, 8, 2]\nresult = nums.sort(reverse=True)\nprint(result, nums)',
          [
            '[8, 5, 2] [8, 5, 2]',
            'None [5, 8, 2]',
            'None [8, 5, 2]',
            '[8, 5, 2] [5, 8, 2]',
          ],
          2,
          'sort reorders nums from largest to smallest and returns None, even with reverse=True.',
        ),
      ],
    },
  ],
  'key-functions': [
    {
      title: 'Sort by a computed key with key=',
      explanation: [
        'key= takes a function. sorted calls it once on each item and orders the items by the results, but the list it returns still holds the original items. sorted(words, key=len) puts shorter words first, and sorted(nums, key=abs) orders numbers by their distance from zero. Pass the function itself, without parentheses: key=len, not key=len(). A function you define with def works too.',
        'Python sorts are stable: items whose keys are equal keep the order they had before sorting. With key=len, two four-letter words stay in their original order.',
      ],
      example: {
        code: 'words = ["plum", "fig", "kiwi", "apricot"]\nprint(sorted(words, key=len))\nprint(sorted([-4, 3, -1, 2], key=abs))',
        output: "['fig', 'plum', 'kiwi', 'apricot']\n[-1, 2, 3, -4]",
        explanation:
          'The lengths are 4, 3, 4 and 7, so fig comes first and plum stays ahead of kiwi on the tie. The distances from zero are 4, 3, 1 and 2, and the original numbers, signs included, are returned.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'print(sorted(["bb", "a", "ccc", "dd"], key=len))',
          [
            "['a', 'bb', 'ccc', 'dd']",
            "['a', 'bb', 'dd', 'ccc']",
            '[1, 2, 2, 3]',
            "['a', 'dd', 'bb', 'ccc']",
          ],
          1,
          'Items are ordered by length, and bb stays ahead of dd because equal keys keep their original order.',
        ),
        predictOutput(
          'What is printed?',
          'def last_digit(n):\n    return n % 10\n\nprint(sorted([47, 12, 35, 21], key=last_digit))',
          [
            '[12, 21, 35, 47]',
            '[1, 2, 5, 7]',
            '[21, 12, 35, 47]',
            '[47, 35, 12, 21]',
          ],
          2,
          'The keys are 7, 2, 5 and 1, so the numbers are ordered by last digit: 21, 12, 35, 47.',
        ),
        choose(
          'Why does sorted(names, key=len()) fail?',
          [
            'len works only on lists, so it cannot measure names',
            'key must be written before the list it sorts',
            'sorted cannot use built-in functions such as len as keys',
            'key=len() calls len right away instead of passing it',
          ],
          3,
          'Writing len() calls len immediately. key=len passes the function so sorted can call it on each item.',
        ),
        predictOutput(
          'What is the output?',
          'print(sorted([3, -2, 2, -3, 1], key=abs))',
          [
            '[1, -2, 2, 3, -3]',
            '[-3, -2, 1, 2, 3]',
            '[1, 2, -2, -3, 3]',
            '[1, 2, 2, 3, 3]',
          ],
          0,
          'Ordered by distance from zero, with ties kept in their original order: -2 before 2, and 3 before -3.',
        ),
      ],
    },
    {
      title: 'Write a key inline with lambda',
      explanation: [
        'lambda builds a small function without def. lambda n: n % 10 takes n and returns n % 10. The body is a single expression whose value is returned automatically, with no return keyword, so it fits right inside a call: sorted(nums, key=lambda n: n % 10).',
        'lambdas are handy for choosing a field of a tuple. sorted(items, key=lambda item: item[1]) orders (name, price) pairs by price and still returns the whole pairs.',
      ],
      example: {
        code: 'items = [("lamp", 30), ("mug", 8), ("desk", 120)]\nprint(sorted(items, key=lambda item: item[1]))\nprint(sorted(["water", "tea", "Coffee"], key=lambda w: w[-1]))',
        output:
          "[('mug', 8), ('lamp', 30), ('desk', 120)]\n['tea', 'Coffee', 'water']",
        explanation:
          'The first key is the price, so the pairs go 8, 30, 120. The second key is the last letter: a, e, then r.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'scores = [("Ivy", 88), ("Raj", 95), ("Lee", 72)]\nranked = sorted(scores, key=lambda s: s[1])\nprint(ranked[0][0])',
          ['Ivy', 'Raj', 'Lee', '72'],
          2,
          'Sorted by score, the first pair is ("Lee", 72), and index 0 of that pair is the name.',
        ),
        predictOutput(
          'What is printed?',
          'square = lambda n: n * n\nprint(square(4) + square(3))',
          ['49', '12', '7', '25'],
          3,
          'square returns its argument times itself: 16 + 9 is 25.',
        ),
        choose(
          'Which key sorts the strings in words by their last character?',
          [
            'key=lambda w: w[0]',
            'key=lambda w: w[-1]',
            'key=lambda w: len(w)',
            'key=w[-1]',
          ],
          1,
          'The lambda receives each word and returns its last character. key=w[-1] is not a function at all.',
        ),
        predictOutput(
          'What is the output?',
          'print(sorted([7, 9, 5, 4], key=lambda n: n % 3))',
          ['[9, 7, 4, 5]', '[4, 5, 7, 9]', '[0, 1, 1, 2]', '[9, 4, 7, 5]'],
          0,
          'The keys are 1, 0, 2 and 1. 9 comes first, then 7 and 4 in their original order, then 5.',
        ),
      ],
    },
    {
      title: 'Order by several fields with a tuple key',
      explanation: [
        'A key function can return a tuple. Tuples compare item by item, so the first field decides and the second matters only for ties: key=lambda p: (p[1], p[0]) sorts (name, age) pairs by age, then by name.',
        'To reverse just one numeric field, negate it in the key. key=lambda p: (-p[1], p[0]) puts the highest age first while names still run A to Z on ties. reverse=True would instead flip every field, names included.',
      ],
      example: {
        code: 'team = [("Rui", 7), ("Ana", 9), ("Bo", 7), ("Cy", 9)]\nprint(sorted(team, key=lambda p: (-p[1], p[0])))',
        output: "[('Ana', 9), ('Cy', 9), ('Bo', 7), ('Rui', 7)]",
        explanation:
          'The keys are (-7, "Rui"), (-9, "Ana"), (-7, "Bo") and (-9, "Cy"). -9 is smaller than -7, so the 9s come first, and names break the ties.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'words = ["bat", "ox", "ant", "be"]\nprint(sorted(words, key=lambda w: (len(w), w)))',
          [
            "['ox', 'be', 'bat', 'ant']",
            "['ant', 'bat', 'be', 'ox']",
            "['be', 'ox', 'ant', 'bat']",
            "['bat', 'ant', 'ox', 'be']",
          ],
          2,
          'Length decides first, so the two-letter words come first; within each length, the word itself breaks the tie.',
        ),
        predictOutput(
          'What is printed?',
          'runs = [("Kim", 42), ("Ola", 38), ("Ben", 42)]\nprint(sorted(runs, key=lambda r: (-r[1], r[0]))[0])',
          ["('Kim', 42)", "(-42, 'Ben')", "('Ola', 38)", "('Ben', 42)"],
          3,
          'The highest score sorts first, and Ben beats Kim on the name tie. sorted returns the items, not their keys.',
        ),
        choose(
          'Which key sorts (city, population) pairs from most to least populous, breaking ties by city name from A to Z?',
          [
            'key=lambda c: (-c[1], c[0])',
            'key=lambda c: (c[1], c[0])',
            'key=lambda c: (c[0], -c[1])',
            'key=lambda c: (-c[1], -c[0])',
          ],
          0,
          'Negating the population puts larger ones first; the name stays positive so ties go A to Z. A string cannot be negated.',
        ),
        predictOutput(
          'What is the output?',
          'pts = [("Al", 5), ("Di", 8), ("Bo", 5)]\nprint(sorted(pts, key=lambda p: (p[1], p[0]), reverse=True))',
          [
            "[('Di', 8), ('Al', 5), ('Bo', 5)]",
            "[('Di', 8), ('Bo', 5), ('Al', 5)]",
            "[('Al', 5), ('Bo', 5), ('Di', 8)]",
            "[('Bo', 5), ('Al', 5), ('Di', 8)]",
          ],
          1,
          'reverse=True flips both fields of the key, so the names on the tie also run backward: Bo before Al.',
        ),
      ],
    },
    {
      title: 'Pick the best item with min and max',
      explanation: [
        'min and max accept the same key= argument. They compare the items by their keys but return the item itself: max(words, key=len) returns the longest word, not its length. To get the length, call len on the result.',
        'When several items share the best key, min and max return the first of them in the list. To break such ties on purpose, return a tuple from the key.',
      ],
      example: {
        code: 'cities = [("Lima", 10), ("Oslo", 0), ("Cairo", 22), ("Quito", 22)]\nprint(max(cities, key=lambda c: c[1]))\nprint(min(cities, key=lambda c: c[1])[0])',
        output: "('Cairo', 22)\nOslo",
        explanation:
          'Cairo and Quito tie at 22, and max returns the first one, Cairo. min returns the pair with 0, and [0] takes its name.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'print(max(["pear", "banana", "cherry"], key=len))',
          ['cherry', '6', 'banana', 'pear'],
          2,
          'banana and cherry both have 6 letters; max returns the first item with the largest key.',
        ),
        predictOutput(
          'What is printed?',
          'print(min([-7, 4, -2, 5], key=abs))',
          ['-2', '2', '-7', '4'],
          0,
          '-2 is closest to zero. min returns the item itself, sign included, not its key.',
        ),
        predictOutput(
          'What is the output?',
          'bids = [("Ann", 40), ("Raj", 55), ("Sue", 48)]\nbest = max(bids, key=lambda b: b[1])\nprint(best[0], best[1])',
          ['Sue 48', 'Ann 40', '55 Raj', 'Raj 55'],
          3,
          'The key compares the amounts, so the pair with 55 is returned whole. Without the key, max would compare names.',
        ),
        choose(
          'You want the length of the longest word in words. Which expression gives it?',
          [
            'max(words, key=len)',
            'len(max(words, key=len))',
            'max(len, words)',
            'len(max(words))',
          ],
          1,
          'max with key=len returns the longest word, and len then measures it. max(words) alone picks the last word alphabetically.',
        ),
        predictOutput(
          'What does this program print?',
          'players = [("Zia", 3), ("Abe", 3), ("Max", 5)]\nprint(min(players, key=lambda p: p[1]))\nprint(min(players, key=lambda p: (p[1], p[0])))',
          [
            "('Zia', 3)\n('Abe', 3)",
            "('Abe', 3)\n('Abe', 3)",
            "('Zia', 3)\n('Zia', 3)",
            "3\n('Abe', 3)",
          ],
          0,
          'With only the score as key, Zia and Abe tie and the first one, Zia, wins. The tuple key breaks the tie by name.',
        ),
      ],
    },
  ],
  bitwise: [
    {
      title: 'Read an integer in binary',
      explanation: [
        'Integers are stored as bits, binary digits worth 1, 2, 4, 8, 16 and so on, doubling from the right. bin(n) shows those bits after the prefix 0b: bin(13) is 0b1101 because 8 + 4 + 1 = 13.',
        'Number the bits from the right, starting at 0: bit 0 is worth 1, bit 1 is worth 2, and bit k is worth 2 ** k. You can also write a binary number directly in code: 0b1101 is the integer 13, and print(0b1101) shows 13.',
      ],
      example: {
        code: 'print(bin(6))\nprint(bin(21))\nprint(0b1001)',
        output: '0b110\n0b10101\n9',
        explanation:
          '6 is 4 + 2, so bits 2 and 1 are set. 21 is 16 + 4 + 1. The literal 0b1001 has bits worth 8 and 1, so it is the integer 9.',
      },
      questions: [
        predictOutput(
          'What is printed?',
          'print(bin(10))',
          ['0b0101', '0b1010', '0b1100', '10'],
          1,
          '10 is 8 + 2, so the bits worth 8 and 2 are set: 1010.',
        ),
        predictOutput(
          'What is the output?',
          'print(0b10110)',
          ['13', '10110', '22', '0b10110'],
          2,
          'Reading from the right, the set bits are worth 2, 4 and 16, which add up to 22. print shows the integer in decimal.',
        ),
        choose(
          'bin(n) is 0b10010. Which powers of two add up to n?',
          ['16 + 4', '8 + 2', '1 + 8', '16 + 2'],
          3,
          'The set bits are bit 4 (worth 16) and bit 1 (worth 2), counting from 0 on the right.',
        ),
        predictOutput(
          'What does this program print?',
          'print(bin(16), bin(15))',
          [
            '0b10000 0b1111',
            '0b1111 0b10000',
            '0b10000 0b11111',
            '0b1000 0b111',
          ],
          0,
          '16 is a single bit worth 16, written 10000. 15 is 8 + 4 + 2 + 1, all four lower bits set.',
        ),
        choose(
          'Which bit position is worth 32?',
          ['bit 5', 'bit 6', 'bit 32', 'bit 4'],
          0,
          'Bit k is worth 2 ** k, and 2 ** 5 is 32. Counting starts at bit 0.',
        ),
      ],
    },
    {
      title: 'Combine bits with &, | and ^',
      explanation: [
        'Bitwise operators compare two integers one bit position at a time. & (and) sets a bit only where both numbers have it; | (or) sets it where either has it; ^ (exclusive or) sets it where exactly one has it.',
        'Write both numbers in binary, line up the columns, and apply the rule to each column. 6 is 110 and 3 is 011, so 6 & 3 is 010 (2), 6 | 3 is 111 (7), and 6 ^ 3 is 101 (5).',
      ],
      example: {
        code: 'a = 0b1011\nb = 0b0110\nprint(a & b, a | b, a ^ b)',
        output: '2 15 13',
        explanation:
          '1011 & 0110 keeps only the shared bit, 0010 (2). | gives 1111 (15). ^ keeps the bits set in just one number, 1101 (13).',
      },
      questions: [
        predictOutput(
          'What is printed?',
          'print(9 & 12)',
          ['13', '8', '5', '21'],
          1,
          '9 is 1001 and 12 is 1100; only the bit worth 8 is set in both.',
        ),
        predictOutput(
          'What is the output?',
          'print(5 | 9)',
          ['1', '12', '14', '13'],
          3,
          '0101 | 1001 is 1101: every bit set in either number, which is 13.',
        ),
        predictOutput(
          'What does this program print?',
          'print(14 ^ 9)',
          ['7', '8', '15', '23'],
          0,
          '1110 ^ 1001 is 0111: the bit worth 8 is set in both, so it drops out, leaving 4 + 2 + 1.',
        ),
        choose(
          'Which expression is 0 for every integer x?',
          ['x | x', 'x | 0', 'x ^ x', 'x ^ 0'],
          2,
          'Every bit of x matches itself, and ^ keeps only bits that differ. The other three all equal x.',
        ),
        predictOutput(
          'What is printed?',
          'x = 12\nprint(x & 7, x | 1)',
          ['7 12', '4 12', '0 13', '4 13'],
          3,
          '12 is 1100. & 7 (0111) keeps only the bit worth 4, and | 1 turns on the lowest bit, making 1101 (13).',
        ),
      ],
    },
    {
      title: 'Shift bits left and right',
      explanation: [
        'x << k moves every bit k places to the left and fills in zeros, which multiplies x by 2 ** k: 3 << 2 is 12. x >> k moves the bits right and drops the lowest k bits, which is x // 2 ** k: 13 >> 2 is 3.',
        'Shifts bind more loosely than + and -, so 1 << n + 1 means 1 << (n + 1). Add parentheses when you mean something else, such as (1 << n) + 1.',
      ],
      example: {
        code: 'x = 5\nprint(x << 3)\nprint(45 >> 2)\nprint(1 << 2 + 1, (1 << 2) + 1)',
        output: '40\n11\n8 5',
        explanation:
          '5 << 3 is 5 * 8. 45 >> 2 is 45 // 4, which is 11. The addition runs before the shift, so 1 << 2 + 1 is 1 << 3, while the parentheses give 4 + 1.',
      },
      questions: [
        predictOutput(
          'What is the output?',
          'print(7 << 1)',
          ['3', '14', '8', '15'],
          1,
          'Shifting left by one place doubles the number: 111 becomes 1110, which is 14.',
        ),
        predictOutput(
          'What does this program print?',
          'print(100 >> 3)',
          ['800', '12.5', '12', '13'],
          2,
          '>> 3 is floor division by 8, and 100 // 8 is 12. A shift always gives an int.',
        ),
        predictOutput(
          'What is printed?',
          'n = 2\nprint(1 << n + 2)',
          ['6', '4', '8', '16'],
          3,
          'n + 2 is evaluated first, so this is 1 << 4, which is 16.',
        ),
        choose(
          'For a nonnegative integer x, which expression equals x // 8?',
          ['x >> 3', 'x << 3', 'x >> 8', 'x & 8'],
          0,
          '8 is 2 ** 3, so dropping the lowest 3 bits divides by 8 and rounds down.',
        ),
        predictOutput(
          'What is the output?',
          'print(1 >> 1, 6 >> 1)',
          ['0.5 3', '2 12', '0 3', '1 3'],
          2,
          'Shifting right drops the lowest bit: 1 becomes 0, and 110 becomes 11, which is 3.',
        ),
      ],
    },
    {
      title: 'Test, set, and clear a single bit',
      explanation: [
        '1 << k is a mask: a number with only bit k set. x & (1 << k) keeps just that bit of x, so the result is 2 ** k when bit k is set and 0 when it is not. (x >> k) & 1 moves bit k to the end and gives the same answer as 1 or 0. x | (1 << k) turns bit k on and leaves the other bits alone.',
        '~x flips every bit. Python integers have no fixed width, so the result is negative: ~x equals -x - 1, and ~5 is -6. Its main use is clearing a bit: x & ~(1 << k) keeps every bit of x except bit k.',
      ],
      example: {
        code: 'flags = 0b1010\nprint(flags & (1 << 1), flags & (1 << 2))\nprint(flags | (1 << 0))\nprint(flags & ~(1 << 3))\nprint(~flags)',
        output: '2 0\n11\n2\n-11',
        explanation:
          'flags is 10. Bit 1 is set, so the first test gives 2; bit 2 is not, so the second gives 0. Turning on bit 0 gives 11, clearing bit 3 leaves 2, and ~10 is -10 - 1.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'x = 0b10110\nprint(x & (1 << 2), x & (1 << 3))',
          ['1 0', '4 0', '0 8', '4 8'],
          1,
          'Bit 2 of 10110 is set, so the mask keeps 4. Bit 3 is 0, so that test gives 0.',
        ),
        predictOutput(
          'What is printed?',
          'print(~7, ~-3)',
          ['-7 3', '8 -2', '-8 2', '-6 4'],
          2,
          '~x is -x - 1: -7 - 1 is -8, and 3 - 1 is 2.',
        ),
        predictOutput(
          'What is the output?',
          'x = 13\nprint(x & ~(1 << 2), x | (1 << 1))',
          ['13 15', '9 13', '17 15', '9 15'],
          3,
          '13 is 1101. Clearing bit 2 (worth 4) leaves 9, and setting bit 1 (worth 2) gives 1111, which is 15.',
        ),
        choose(
          'Which expression is 1 when bit 3 of x is set and 0 when it is not?',
          ['(x >> 3) & 1', 'x & (1 << 3)', 'x >> 3', 'x & 3'],
          0,
          'Shifting moves bit 3 to position 0, and & 1 keeps only that bit. x & (1 << 3) gives 8, not 1.',
        ),
        predictOutput(
          'What does this program print?',
          'x = 37\nprint((x >> 2) & 1, (x >> 4) & 1)',
          ['0 1', '1 0', '4 0', '1 16'],
          1,
          '37 is 100101. Bit 2 is set and bit 4 is not, and & 1 reports each as 1 or 0.',
        ),
      ],
    },
  ],
  imports: [
    {
      title: 'Load a module with import and reach its names with a dot',
      explanation: [
        'A module is a file of ready-made Python code. import math, written at the top of a program, loads the math module and gives you one name, math. Reach its contents with a dot: math.sqrt(25) is 5.0. Putting imports first lets readers see what the program depends on.',
        'math.sqrt always returns a float, even for a perfect square. The module also holds constants: math.pi is 3.141592653589793, and math.inf is a float larger than every number, which print shows as inf.',
      ],
      example: {
        code: 'import math\nside = math.sqrt(81)\nprint(side)\nprint(side * 4)\nprint(math.pi * 2)',
        output: '9.0\n36.0\n6.283185307179586',
        explanation:
          'math.sqrt(81) is the float 9.0, so multiplying it gives the float 36.0. math.pi is a float constant, and doubling it gives the full float result.',
      },
      questions: [
        predictOutput(
          'What is printed?',
          'import math\nprint(math.sqrt(64) + 1)',
          ['9', '9.0', '65', '8.0'],
          1,
          'math.sqrt(64) is the float 8.0, and adding 1 keeps it a float.',
        ),
        choose(
          'Why does this program fail?',
          [
            'sqrt needs a float argument such as 36.0',
            'math must be imported after the line that uses it',
            'sqrt must be written math.sqrt after import math',
            'sqrt is not one of the functions in the math module',
          ],
          2,
          'import math defines only the name math; sqrt is reached through it with a dot.',
          'import math\nprint(sqrt(36))',
        ),
        predictOutput(
          'What is the output?',
          'import math\nprint(math.sqrt(9) * math.sqrt(4))',
          ['6', '36.0', '13.0', '6.0'],
          3,
          'The square roots are 3.0 and 2.0, and multiplying two floats gives the float 6.0.',
        ),
        predictOutput(
          'What does this program print?',
          'import math\nprint(math.inf + 1000, -math.inf)',
          ['inf -inf', 'inf inf', '1000 -inf', 'inf 0.0'],
          0,
          'Adding a number to infinity still gives infinity, and negating it gives negative infinity, shown as -inf.',
        ),
        choose(
          'Where should import math go, and why?',
          [
            'At the bottom, after the code that uses it',
            'At the top, so readers see the dependencies first',
            'Right before every line that calls a math function',
            'Anywhere, because Python runs imports before other lines',
          ],
          1,
          'Python runs lines top to bottom, so the import must come before any use, and the top is where readers look for it.',
        ),
      ],
    },
    {
      title: 'Round down or up with floor and ceil',
      explanation: [
        'math.floor(x) returns the nearest whole number at or below x, and math.ceil(x) the nearest at or above it. Both return an int: math.floor(7.8) is 7 and math.ceil(7.2) is 8. A value that is already whole stays put, so math.ceil(4.0) is 4.',
        'Below means toward smaller numbers, so for negatives math.floor(-2.5) is -3 and math.ceil(-2.5) is -2. math.ceil(a / b) answers how-many-containers questions: 23 items in boxes of 5 need math.ceil(23 / 5), which is 5 boxes.',
      ],
      example: {
        code: 'import math\nprint(math.floor(9.99), math.ceil(9.01))\nprint(math.floor(-1.5), math.ceil(-1.5))\nprint(math.ceil(17 / 4))',
        output: '9 10\n-2 -1\n5',
        explanation:
          'floor drops to 9 and ceil climbs to 10, however close the value is. For -1.5, the whole number below is -2 and the one above is -1. 17 / 4 is 4.25, which needs 5 groups.',
      },
      questions: [
        predictOutput(
          'What is printed?',
          'import math\nprint(math.ceil(6.0), math.ceil(6.1))',
          ['7 7', '6 7', '6.0 7', '6 6'],
          1,
          '6.0 is already whole, so ceil leaves it at 6. Any part above 6, however small, rounds up to 7.',
        ),
        predictOutput(
          'What is the output?',
          'import math\nprint(math.floor(-0.5))',
          ['0', '-0.5', '1', '-1'],
          3,
          'floor goes toward smaller numbers, and the whole number below -0.5 is -1.',
        ),
        predictOutput(
          'What does this program print?',
          'import math\npeople = 50\nper_table = 8\nprint(math.ceil(people / per_table))',
          ['6', '6.25', '7', '8'],
          2,
          '50 / 8 is 6.25. Six tables seat only 48, so ceil rounds up to 7 tables.',
        ),
        choose(
          'A garage charges one ticket for each started 15 minutes. Which expression gives the tickets for m minutes?',
          [
            'math.ceil(m / 15)',
            'math.floor(m / 15)',
            'm // 15',
            'math.ceil(m) / 15',
          ],
          0,
          'A started block counts in full, so the division must round up. floor and // round down.',
        ),
        predictOutput(
          'What is printed?',
          'import math\nprint(math.floor(7 / 2) + math.ceil(7 / 2))',
          ['6', '7', '8', '7.0'],
          1,
          '7 / 2 is 3.5: floor gives 3 and ceil gives 4, both ints, so the sum is 7.',
        ),
      ],
    },
    {
      title: 'Import names directly with from, or rename with as',
      explanation: [
        'from math import gcd brings just that name into the program, so you call gcd(12, 18) with no math. prefix. List several names with commas, as in from math import floor, ceil. Only the listed names arrive; this form does not define the name math itself.',
        'import math as m loads the whole module under a shorter alias, so you write m.sqrt(9). Data code uses the same convention, as in import numpy as np. A misspelled module name, such as import maths, stops the program with ModuleNotFoundError. gcd(a, b) returns the greatest common divisor: the largest whole number that divides both.',
      ],
      example: {
        code: 'from math import gcd, sqrt\nimport math as m\nprint(gcd(24, 36))\nprint(sqrt(49), m.floor(4.8))',
        output: '12\n7.0 4',
        explanation:
          '12 is the largest number dividing both 24 and 36. sqrt was imported by name, so it needs no prefix, and floor is reached through the alias m.',
      },
      questions: [
        predictOutput(
          'What is the output?',
          'from math import gcd\nprint(gcd(15, 25), gcd(7, 5))',
          ['5 1', '75 35', '5 0', '3 1'],
          0,
          '5 divides both 15 and 25. 7 and 5 share no divisor larger than 1, so their gcd is 1.',
        ),
        choose(
          'After from math import sqrt, which line works?',
          [
            'print(math.sqrt(9))',
            'print(math(9))',
            'print(math.pi)',
            'print(sqrt(9))',
          ],
          3,
          'This form defines only sqrt. The name math was never assigned, so math.sqrt and math.pi fail.',
        ),
        predictOutput(
          'What does this program print?',
          'import math as m\nprint(m.ceil(2.1) * m.floor(2.9))',
          ['4', '9', '6', '6.09'],
          2,
          'm is the math module: ceil(2.1) is 3 and floor(2.9) is 2, so the product is 6.',
        ),
        choose(
          'A program begins with import maths. What happens?',
          [
            'It quietly imports the math module instead',
            'It stops with ModuleNotFoundError at that line',
            'It fails only later, when maths.sqrt is called',
            'It creates a new, empty module named maths',
          ],
          1,
          'No module is named maths, so the import itself fails before any other line runs.',
        ),
        predictOutput(
          'What is printed?',
          'from math import gcd\na = 84\nb = 36\nprint(gcd(a, b), a // gcd(a, b))',
          ['6 14', '12 3', '4 21', '12 7'],
          3,
          'The largest number dividing both 84 and 36 is 12, and 84 // 12 is 7.',
        ),
      ],
    },
  ],
  'collections-module': [
    {
      title: 'Run a first-in, first-out queue with deque',
      explanation: [
        'from collections import deque gives a double-ended queue. deque(items) starts one from a list, and deque() starts it empty. append(x) adds x at the right end, the back of the line, and popleft() removes and returns the item at the left end, the front. len(queue) counts what is still waiting. Items leave in the order they arrived: first in, first out.',
        'A list can do the same job with pop(0), but removing the first item of a list shifts every remaining item one place, which gets slow for long lists; a deque removes from either end quickly. Plain pop() on a deque removes from the right end, as it does on a list, so it takes the newest item instead of the oldest.',
      ],
      example: {
        code: 'from collections import deque\nline = deque(["Ana", "Ben"])\nline.append("Cal")\nprint(line.popleft())\nprint(line.popleft())\nprint(len(line))',
        output: 'Ana\nBen\n1',
        explanation:
          'Cal joins at the back. popleft serves from the front, Ana and then Ben, leaving only Cal waiting.',
      },
      questions: [
        predictOutput(
          'What is the output?',
          'from collections import deque\njobs = deque()\njobs.append("print")\njobs.append("scan")\njobs.append("copy")\nprint(jobs.popleft(), len(jobs))',
          ['copy 2', 'print 3', 'print 2', 'scan 2'],
          2,
          'The first job added is the first removed, and two jobs are left after it leaves.',
        ),
        predictOutput(
          'What does this program print?',
          'from collections import deque\nq = deque([10, 20, 30])\na = q.pop()\nb = q.popleft()\nprint(a, b)',
          ['10 20', '10 30', '30 20', '30 10'],
          3,
          'pop removes from the right end, 30, and popleft removes from the left end, 10.',
        ),
        choose(
          'Customers arrive as Kai, Lu, then Mo. Which pair of calls serves them in arrival order?',
          [
            'append to add each one, popleft to serve',
            'append to add each one, pop to serve',
            'popleft to add each one, append to serve',
            'appendleft to add each one, popleft to serve',
          ],
          0,
          'Adding at the back and serving from the front keeps arrival order. pop would serve Mo, the newest, first.',
        ),
        predictOutput(
          'What is printed?',
          'from collections import deque\nq = deque([1, 2])\nfor n in [3, 4]:\n    q.append(n)\n    q.popleft()\nprint(q.popleft(), len(q))',
          ['1 3', '3 1', '3 2', '4 1'],
          1,
          'Each loop pass adds one number at the back and removes one from the front, leaving 3 and 4. Then 3 is served, and one item remains.',
        ),
      ],
    },
    {
      title: 'Count items with Counter',
      explanation: [
        'from collections import Counter builds a tally in one step: Counter(items) counts each distinct item in a list. It works like a dictionary from items to counts: counts["a"] reads a count, in checks whether an item appeared, and len gives the number of distinct items.',
        'Unlike a plain dictionary, a Counter returns 0 for a missing key instead of raising KeyError. Reading a missing key does not add it, so in still reports False for that key afterwards.',
      ],
      example: {
        code: 'from collections import Counter\nrolls = Counter([6, 2, 6, 6, 3])\nprint(rolls[6], rolls[2], rolls[5])\nprint(len(rolls), 5 in rolls)',
        output: '3 1 0\n3 False',
        explanation:
          '6 was rolled three times and 2 once. 5 never appeared, so its count reads as 0, and it is still not a key. There are three distinct values: 6, 2 and 3.',
      },
      questions: [
        predictOutput(
          'What is the output?',
          'from collections import Counter\nletters = Counter(["m", "a", "m", "m", "a"])\nprint(letters["m"] - letters["a"])',
          ['3', '1', '2', '-1'],
          1,
          'm appears three times and a twice, so the difference is 1.',
        ),
        predictOutput(
          'What does this program print?',
          'from collections import Counter\nseen = Counter(["red", "blue"])\nprint(seen["green"])\nprint("green" in seen)',
          ['0\nTrue', 'None\nFalse', '0\nFalse', '1\nTrue'],
          2,
          'A missing key reads as 0, and reading it does not add green as a key.',
        ),
        choose(
          'counts is the plain dictionary {"a": 1}. What does counts["b"] do?',
          [
            'It returns 0, just like a Counter',
            'It returns None, while a Counter would give 0',
            'It adds "b" with the count 0',
            'It raises KeyError, while a Counter would give 0',
          ],
          3,
          'Only a Counter treats missing keys as 0; a plain dictionary raises KeyError for brackets on a missing key.',
        ),
        predictOutput(
          'What is printed?',
          'from collections import Counter\nwords = Counter(["hi", "yo", "hi", "ok"])\nprint(len(words), words["hi"] + words["bye"])',
          ['3 2', '4 2', '3 3', '4 3'],
          0,
          'len counts distinct items: hi, yo and ok. hi appears twice, and the missing bye adds 0.',
        ),
      ],
    },
    {
      title: 'Update a Counter with +=',
      explanation: [
        'Because a missing key reads as 0, counts[item] += 1 works even on an item’s first appearance, with no get call. Start from an empty Counter() before the loop and add inside it.',
        '+= can add any amount, and -= subtracts: stock["pens"] += 12 adds twelve at once. A Counter pairs naturally with a deque: take each item from the front of the queue and count it as it is processed.',
      ],
      example: {
        code: 'from collections import Counter\ntally = Counter()\nfor animal in ["cat", "dog", "cat"]:\n    tally[animal] += 1\ntally["dog"] += 5\nprint(tally["cat"], tally["dog"], tally["eel"])',
        output: '2 6 0',
        explanation:
          'Each += starts a new animal from 0. dog reaches 1 in the loop and then 6, and eel was never added, so it reads as 0.',
      },
      questions: [
        predictOutput(
          'What is the output?',
          'from collections import Counter\nhits = Counter()\nfor page in ["home", "about", "home", "home"]:\n    hits[page] += 1\nprint(hits["home"], hits["about"])',
          ['1 1', '3 1', '4 4', '3 0'],
          1,
          'Each visit adds 1 to its page, starting from 0, so home reaches 3 and about 1.',
        ),
        choose(
          'tally starts as Counter(). Which loop body counts the words correctly?',
          [
            'tally[word] = 1',
            'tally += word',
            'tally[word] = tally[word]',
            'tally[word] += 1',
          ],
          3,
          'A missing word reads as 0, so += 1 counts its first appearance and every repeat. = 1 would reset repeats.',
        ),
        predictOutput(
          'What does this program print?',
          'from collections import Counter\ngrades = Counter()\nfor score in [91, 78, 85, 62, 95]:\n    if score >= 80:\n        grades["pass"] += 1\n    else:\n        grades["retry"] += 1\nprint(grades["pass"], grades["retry"])',
          ['2 3', '5 0', '3 2', '3 0'],
          2,
          '91, 85 and 95 are at least 80; 78 and 62 go to retry.',
        ),
        predictOutput(
          'What is printed?',
          'from collections import deque, Counter\norders = deque(["tea", "cake", "tea"])\nserved = Counter()\norders.append("cake")\nserved[orders.popleft()] += 1\nserved[orders.popleft()] += 1\nserved[orders.popleft()] += 1\nprint(served["tea"], served["cake"], len(orders))',
          ['2 1 1', '2 2 0', '1 2 1', '2 1 0'],
          0,
          'The queue is tea, cake, tea, cake. Three are served from the front, two teas and one cake, and the last cake still waits.',
        ),
        predictOutput(
          'What is the output?',
          'from collections import Counter\nstock = Counter()\nstock["pens"] += 12\nstock["pens"] -= 5\nstock["pads"] += 3\nprint(stock["pens"], stock["pads"])',
          ['12 3', '7 3', '-5 3', '17 3'],
          1,
          'pens starts from 0, gains 12 and loses 5, leaving 7. pads gains 3.',
        ),
      ],
    },
  ],
  'heapq-module': [
    {
      title: 'Push items and pop the smallest',
      explanation: [
        'heapq keeps a priority queue inside an ordinary list. After import heapq, start with an empty list, add items with heapq.heappush(heap, item), and remove the smallest with heapq.heappop(heap), which also returns it. Items come out smallest first, whatever order they went in.',
        'heap[0] is always the smallest item, so you can look at it without removing it. Each push or pop takes about log n steps, far fewer than sorting the whole list again after every change.',
      ],
      example: {
        code: 'import heapq\nheap = []\nheapq.heappush(heap, 7)\nheapq.heappush(heap, 2)\nheapq.heappush(heap, 5)\nprint(heap[0])\nprint(heapq.heappop(heap))\nprint(heapq.heappop(heap), len(heap))',
        output: '2\n2\n5 1',
        explanation:
          'heap[0] shows 2 without removing it. The first pop removes 2, the next removes 5, and only 7 is left.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'import heapq\nh = []\nfor n in [40, 15, 30, 10]:\n    heapq.heappush(h, n)\nprint(heapq.heappop(h), heapq.heappop(h))',
          ['40 15', '10 10', '10 15', '15 10'],
          2,
          'Each pop removes the current smallest: 10, then 15. The push order does not matter.',
        ),
        predictOutput(
          'What is printed?',
          'import heapq\nh = []\nheapq.heappush(h, 8)\nheapq.heappush(h, 3)\nprint(h[0], len(h))\nprint(heapq.heappop(h), len(h))',
          ['8 2\n3 1', '3 2\n8 1', '3 1\n3 0', '3 2\n3 1'],
          3,
          'Reading h[0] leaves both items in place. heappop removes 3 before len runs, so one item is left.',
        ),
        choose(
          'You need to look at the smallest item in heap without removing it. What do you use?',
          ['heap[0]', 'heapq.heappop(heap)', 'heap[-1]', 'heap.pop()'],
          0,
          'The smallest item always sits at index 0. heappop would remove it, and the end of the list has no special meaning.',
        ),
        predictOutput(
          'What is the output?',
          'import heapq\nnames = []\nfor name in ["Pia", "Ari", "Max"]:\n    heapq.heappush(names, name)\nheapq.heappush(names, "Bea")\nprint(heapq.heappop(names), heapq.heappop(names))',
          ['Pia Ari', 'Ari Bea', 'Ari Max', 'Bea Ari'],
          1,
          'Strings compare alphabetically, so the two smallest names are Ari and Bea, even though Bea was pushed last.',
        ),
      ],
    },
    {
      title: 'Turn an existing list into a heap with heapify',
      explanation: [
        'heapq.heapify(items) rearranges an existing list into a heap in place and returns None. It is faster than pushing the items one by one. Afterwards items[0] is the smallest item, and heappush and heappop keep working on the same list.',
        'A heap is only partly ordered. Apart from items[0], the positions follow a looser rule, so the list is usually not sorted, and items[1] is not necessarily the second smallest. Pop to get the items in order.',
      ],
      example: {
        code: 'import heapq\ntimes = [9, 4, 7, 1, 8]\nheapq.heapify(times)\nprint(times[0])\nprint(heapq.heappop(times), heapq.heappop(times), heapq.heappop(times))',
        output: '1\n1 4 7',
        explanation:
          'After heapify, the smallest time is at index 0. Each pop then removes the current smallest, so the times come out in order.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'import heapq\ncosts = [12, 3, 25, 7]\nheapq.heapify(costs)\nheapq.heappush(costs, 5)\nprint(heapq.heappop(costs), heapq.heappop(costs), len(costs))',
          ['3 7 3', '12 3 3', '3 5 5', '3 5 3'],
          3,
          'The heap holds 3, 5, 7, 12 and 25. The two pops remove 3 and 5, leaving three items.',
        ),
        choose(
          'heapify turned [5, 3, 8, 1, 9, 2] into [1, 3, 2, 5, 9, 8]. What does this show?',
          [
            'heapify sorts only the first half of the list',
            'Only index 0 is guaranteed to hold the smallest item',
            'heapify failed, because the list is not sorted',
            'The largest item is always moved to the end',
          ],
          1,
          'A correct heap needs only the smallest item at index 0; the rest is partly ordered, and 9 is not at the end.',
        ),
        predictOutput(
          'What is printed?',
          'import heapq\ndata = [4, 1, 3]\nresult = heapq.heapify(data)\nprint(result, data[0])',
          ['[1, 4, 3] 1', 'None 4', 'None 1', '[1, 3, 4] 1'],
          2,
          'heapify changes data in place and returns None. Afterwards the smallest item, 1, is at index 0.',
        ),
        choose(
          'Why is heap[1] not a reliable way to read the second smallest item?',
          [
            'Only heap[0] has a guaranteed position',
            'heap[1] always holds the largest item',
            'heapify removes the item at index 1',
            'A heap cannot be indexed past position 0',
          ],
          0,
          'The second smallest may sit at index 1 or 2. Popping twice is the dependable way to get it.',
        ),
      ],
    },
    {
      title: 'Attach data to priorities with tuples',
      explanation: [
        'Push (priority, name) tuples to keep data together with each priority. Tuples compare by their first item, so the tuple with the smallest priority comes out first and brings its other fields along. Index the popped tuple to reach a field: item[1] is the name.',
        'When two priorities are equal, the comparison moves on to the next field, so (2, "bake") comes out before (2, "wash") because "bake" is smaller than "wash".',
      ],
      example: {
        code: 'import heapq\ntodo = []\nheapq.heappush(todo, (2, "wash"))\nheapq.heappush(todo, (1, "shop"))\nheapq.heappush(todo, (2, "bake"))\nprint(heapq.heappop(todo))\nprint(heapq.heappop(todo)[1])\nprint(todo[0][1])',
        output: "(1, 'shop')\nbake\nwash",
        explanation:
          'Priority 1 comes out first as a whole tuple. The two priority-2 tasks tie, so the names decide: bake before wash, which is left at index 0.',
      },
      questions: [
        predictOutput(
          'What is the output?',
          'import heapq\nq = [(5, "low"), (1, "urgent"), (3, "normal")]\nheapq.heapify(q)\nprint(heapq.heappop(q)[1])',
          ['low', "(1, 'urgent')", 'urgent', '1'],
          2,
          'The tuple with priority 1 is the smallest, and [1] selects its name.',
        ),
        predictOutput(
          'What does this program print?',
          'import heapq\nh = []\nheapq.heappush(h, (4, "Zed"))\nheapq.heappush(h, (4, "Amy"))\nheapq.heappush(h, (6, "Bob"))\nfirst = heapq.heappop(h)\nprint(first[1], first[0])',
          ['Zed 4', '4 Amy', 'Bob 6', 'Amy 4'],
          3,
          'Zed and Amy tie on priority 4, so the names decide and Amy is smaller. The print shows the name, then the priority.',
        ),
        choose(
          'Patients are pushed as (rank, name) pairs, where rank 1 is most urgent. Which call adds Lin with rank 2?',
          [
            'heapq.heappush(er, (2, "Lin"))',
            'heapq.heappush(er, ("Lin", 2))',
            'heapq.heappush(er, 2, "Lin")',
            'heapq.heappush((2, "Lin"), er)',
          ],
          0,
          'The heap comes first, then one tuple with the priority in front. With the name first, patients would be ordered alphabetically.',
        ),
        predictOutput(
          'What is printed?',
          'import heapq\nh = []\nfor job in [(3, "c"), (1, "a"), (2, "b"), (1, "z")]:\n    heapq.heappush(h, job)\nprint(heapq.heappop(h)[1], heapq.heappop(h)[1], heapq.heappop(h)[1])',
          ['a b c', 'a z b', 'c a b', 'z a b'],
          1,
          'Both priority-1 jobs come out before priority 2, with a before z on the tie.',
        ),
      ],
    },
    {
      title: 'Pop the largest first by negating',
      explanation: [
        'heapq only ever pops the smallest item. To pop the largest first, push each value negated: the largest number becomes the most negative, so it comes out first. Negate again after popping to get the original value back.',
        'With tuples, negate just the priority: push (-score, name), and the highest score comes out first, with ties still broken by name from A to Z.',
      ],
      example: {
        code: 'import heapq\nheap = []\nfor score in [70, 95, 82]:\n    heapq.heappush(heap, -score)\ntop = -heapq.heappop(heap)\nprint(top)\nprint(-heap[0])',
        output: '95\n82',
        explanation:
          'The heap holds -70, -95 and -82. -95 is the smallest, so it pops first and is negated back to 95. The next largest, 82, is now at index 0.',
      },
      questions: [
        predictOutput(
          'What is the output?',
          'import heapq\nh = []\nfor n in [3, 11, 7]:\n    heapq.heappush(h, -n)\nprint(heapq.heappop(h))',
          ['11', '-3', '-11', '3'],
          2,
          '-11 is the smallest stored value, so it pops first. Nothing negates it back, so -11 is printed.',
        ),
        predictOutput(
          'What does this program print?',
          'import heapq\nbids = []\nheapq.heappush(bids, (-40, "Ola"))\nheapq.heappush(bids, (-65, "Raj"))\nheapq.heappush(bids, (-65, "Eve"))\nbest = heapq.heappop(bids)\nprint(best[1], -best[0])',
          ['Ola 40', 'Raj 65', 'Eve -65', 'Eve 65'],
          3,
          'The two 65 bids tie at -65, and Eve comes before Raj. Negating the priority restores 65.',
        ),
        choose(
          'A heap holds negated prices. Which expression reads the highest price without removing it?',
          ['-heap[0]', 'heap[0]', '-heap[-1]', 'heap[-1]'],
          0,
          'The most negative value, at index 0, belongs to the highest price; negating it restores the price.',
        ),
        predictOutput(
          'What is printed?',
          'import heapq\nh = [-2, -9, -4]\nheapq.heapify(h)\na = -heapq.heappop(h)\nb = -heapq.heappop(h)\nprint(a, b)',
          ['2 4', '9 4', '-9 -4', '4 9'],
          1,
          'The pops return -9 and then -4, the smallest stored values, and negating them gives 9 and 4.',
        ),
      ],
    },
  ],
  'bisect-module': [
    {
      title: 'Find an insertion point with bisect_left',
      explanation: [
        'from bisect import bisect_left gives a binary search. bisect_left(values, x) searches a list sorted in ascending order and returns the first index where x could be inserted while keeping it sorted. Every item before that index is smaller than x, so the result is also the count of items smaller than x. x does not need to be in the list.',
        'The search halves its range at each step, so it needs only about log n comparisons. That works only if values is sorted: on an unsorted list it still returns an index, with no error, but the index means nothing. Sort the list first if needed.',
      ],
      example: {
        code: 'from bisect import bisect_left\nages = [12, 19, 25, 40]\nprint(bisect_left(ages, 21))\nprint(bisect_left(ages, 5), bisect_left(ages, 99))\nprint(bisect_left(ages, 25))',
        output: '2\n0 4\n2',
        explanation:
          '21 belongs after 12 and 19, at index 2. 5 goes before everything and 99 after everything. For 25, which is present, the left insertion point is its own index, 2.',
      },
      questions: [
        predictOutput(
          'What is the output?',
          'from bisect import bisect_left\nprint(bisect_left([3, 6, 9, 12, 15], 10))',
          ['2', '4', '3', '12'],
          2,
          '3, 6 and 9 are smaller than 10, so 10 would be inserted at index 3.',
        ),
        predictOutput(
          'What does this program print?',
          'from bisect import bisect_left\nprint(bisect_left([1, 4, 4, 8], 4))',
          ['2', '3', '0', '1'],
          3,
          'bisect_left lands before the equal items. Only 1 is smaller than 4, so the index is 1.',
        ),
        choose(
          'values is sorted. Which expression counts the items smaller than x?',
          [
            'bisect_left(values, x)',
            'bisect_left(values, x) - 1',
            'bisect_left(values, x) + 1',
            'len(values) - bisect_left(values, x)',
          ],
          0,
          'Every item before the left insertion point is smaller than x, and indexes start at 0, so the index is the count.',
        ),
        predictOutput(
          'What is printed?',
          'from bisect import bisect_left\ntemps = [30, 12, 25, 18]\ntemps.sort()\nprint(bisect_left(temps, 20))',
          ['3', '2', '1', '4'],
          1,
          'After sorting, temps is [12, 18, 25, 30]. Two temperatures are below 20, so the index is 2.',
        ),
        choose(
          'bisect_left is called on the unsorted list [8, 2, 6, 4]. What happens?',
          [
            'It raises an error because the list is not sorted',
            'It sorts the list first, then searches',
            'It returns -1 to signal an unsorted list',
            'It returns an index, but the answer cannot be trusted',
          ],
          3,
          'bisect never checks the order; binary search on unsorted data simply gives a meaningless index.',
        ),
      ],
    },
    {
      title: 'Count copies with bisect_right',
      explanation: [
        'bisect_right(values, x) returns the insertion point after any items equal to x, so it counts the items less than or equal to x. When x is not in the list, bisect_left and bisect_right return the same index.',
        'The copies of x sit between the two insertion points, so bisect_right(values, x) - bisect_left(values, x) counts them. Likewise, len(values) - bisect_right(values, x) counts the items larger than x.',
      ],
      example: {
        code: 'from bisect import bisect_left, bisect_right\nmarks = [55, 70, 70, 70, 88]\nprint(bisect_left(marks, 70), bisect_right(marks, 70))\nprint(bisect_right(marks, 70) - bisect_left(marks, 70))\nprint(len(marks) - bisect_right(marks, 70))',
        output: '1 4\n3\n1',
        explanation:
          'The 70s occupy indexes 1 to 3, so the left point is 1 and the right point is 4. The gap, 3, is the number of 70s, and only 88 lies beyond the right point.',
      },
      questions: [
        predictOutput(
          'What is the output?',
          'from bisect import bisect_right\nprint(bisect_right([2, 5, 5, 9], 5))',
          ['1', '2', '3', '4'],
          2,
          'The right insertion point comes after both 5s, at index 3.',
        ),
        predictOutput(
          'What does this program print?',
          'from bisect import bisect_left, bisect_right\nvalues = [1, 3, 3, 3, 3, 7]\nprint(bisect_right(values, 3) - bisect_left(values, 3))',
          ['3', '4', '5', '1'],
          1,
          'The 3s start at index 1 and end before index 5, so there are 5 - 1 = 4 copies.',
        ),
        predictOutput(
          'What is printed?',
          'from bisect import bisect_left, bisect_right\nprint(bisect_left([10, 20, 30], 25), bisect_right([10, 20, 30], 25))',
          ['2 2', '2 3', '1 2', '3 3'],
          0,
          '25 is not in the list, so there are no equal items to step past: both insertion points are 2.',
        ),
        choose(
          'Which expression counts the items in a sorted list values that are at most x?',
          [
            'bisect_left(values, x)',
            'bisect_right(values, x) - bisect_left(values, x)',
            'len(values) - bisect_right(values, x)',
            'bisect_right(values, x)',
          ],
          3,
          'bisect_right lands after every item equal to x, so everything before it is less than or equal to x.',
        ),
        predictOutput(
          'What is the output?',
          'from bisect import bisect_left, bisect_right\n\ndef count_between(values, low, high):\n    return bisect_right(values, high) - bisect_left(values, low)\n\nprint(count_between([1, 4, 4, 6, 9, 12], 4, 9))',
          ['3', '2', '4', '5'],
          2,
          'bisect_right for 9 is 5 and bisect_left for 4 is 1, so 4, 4, 6 and 9 are counted.',
        ),
      ],
    },
    {
      title: 'Keep a list sorted with insort',
      explanation: [
        'from bisect import insort gives insort(values, x), which inserts x at its sorted position, the index bisect_right would return. A sorted list stays sorted without calling sort again. insort changes the list in place and returns None.',
        'Use it when values arrive one at a time and you need to search them as they come: insort each new value, then count or look up with bisect_left and bisect_right.',
      ],
      example: {
        code: 'from bisect import insort, bisect_left\nscores = [40, 60, 80]\ninsort(scores, 75)\ninsort(scores, 40)\nprint(scores)\nprint(bisect_left(scores, 70))',
        output: '[40, 40, 60, 75, 80]\n3',
        explanation:
          '75 goes between 60 and 80, and the second 40 goes next to the first. The list stays sorted, so bisect_left still counts the three scores below 70.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'from bisect import insort\nnums = [2, 7, 11]\ninsort(nums, 9)\nprint(nums)',
          ['[2, 7, 11, 9]', '[9, 2, 7, 11]', '[2, 7, 9, 11]', '[2, 9, 7, 11]'],
          2,
          'insort places 9 at its sorted position, between 7 and 11, instead of at the end.',
        ),
        predictOutput(
          'What is printed?',
          'from bisect import insort\nnames = ["Ana", "Joe"]\nresult = insort(names, "Eli")\nprint(result, names)',
          [
            "['Ana', 'Eli', 'Joe'] ['Ana', 'Eli', 'Joe']",
            "None ['Ana', 'Joe', 'Eli']",
            "1 ['Ana', 'Eli', 'Joe']",
            "None ['Ana', 'Eli', 'Joe']",
          ],
          3,
          'insort changes names in place and returns None; it does not return the index it used.',
        ),
        predictOutput(
          'What is the output?',
          'from bisect import insort, bisect_left\nseen = []\nfor t in [14, 3, 9, 3]:\n    insort(seen, t)\nprint(seen, bisect_left(seen, 9))',
          [
            '[3, 3, 9, 14] 2',
            '[14, 3, 9, 3] 2',
            '[3, 9, 14] 1',
            '[3, 3, 9, 14] 3',
          ],
          0,
          'Each value goes into its sorted place, duplicates included, and two values are smaller than 9.',
        ),
        choose(
          'Values arrive one at a time, and you search the list after each arrival. Which approach keeps it searchable without sorting it again each time?',
          [
            'append each value, then call sort() on the whole list',
            'insort each value into the already sorted list',
            'append each value and search with bisect_left anyway',
            'append each value, then search reversed(values)',
          ],
          1,
          'insort keeps the list sorted as it grows, which is exactly what bisect needs. Searching an unsorted list gives meaningless answers.',
        ),
      ],
    },
  ],
  classes: [
    {
      title: 'Define a class and create an object',
      explanation: [
        'A class describes a kind of object. class Dog: starts the definition, and the method __init__ inside it runs automatically each time you create an object by calling the class, as in rex = Dog("Rex", 3). Python makes the new object, passes it to __init__ as self, and passes your arguments to the remaining parameters.',
        'Inside __init__, self.name = name stores an attribute on the new object; a plain name = name would only set a local variable that disappears when __init__ ends. Outside the class, read an attribute with a dot: rex.name.',
      ],
      example: {
        code: 'class Dog:\n    def __init__(self, name, age):\n        self.name = name\n        self.age = age\n\nrex = Dog("Rex", 3)\nprint(rex.name)\nprint(rex.age * 7)',
        output: 'Rex\n21',
        explanation:
          'Calling Dog runs __init__ with self as the new object, "Rex" as name and 3 as age. Both values are stored as attributes and read back with a dot.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'class Planet:\n    def __init__(self, name, moons):\n        self.name = name\n        self.moons = moons\n\nmars = Planet("Mars", 2)\nprint(f"{mars.name} has {mars.moons} moons")',
          [
            'mars has 2 moons',
            'Mars has 2 moons',
            'name has moons moons',
            '{mars.name} has {mars.moons} moons',
          ],
          1,
          'mars.name holds the string "Mars" and mars.moons holds 2; the f-string inserts both values.',
        ),
        predictOutput(
          'What is printed?',
          'class Ticket:\n    def __init__(self, seat):\n        print("issuing", seat)\n        self.seat = seat\n\na = Ticket("A1")\nb = Ticket("B4")\nprint(b.seat)',
          [
            'B4',
            'issuing B4\nB4',
            'issuing A1\nissuing B4\nB4',
            'issuing A1\nissuing B4\nissuing B4\nB4',
          ],
          2,
          '__init__ runs once for each object created, so it prints twice before b.seat is read.',
        ),
        choose(
          'class Lamp has def __init__(self, room):. Which call creates a lamp for the desk?',
          [
            'Lamp(self, "desk")',
            'Lamp.__init__("desk")',
            'Lamp(room)',
            'Lamp("desk")',
          ],
          3,
          'Call the class with the arguments after self. Python creates the object and passes it as self itself.',
        ),
        choose(
          'Why does the last line of this program fail?',
          [
            'size = size sets a local variable, not self.size',
            '__init__ must end with return self to keep size',
            'An attribute cannot hold a plain number like 8',
            'Attributes must be read as c[size], not c.size',
          ],
          0,
          'Without self., the assignment never stores anything on the object, so c has no size attribute.',
          'class Cup:\n    def __init__(self, size):\n        size = size\n\nc = Cup(8)\nprint(c.size)',
        ),
      ],
    },
    {
      title: 'Keep separate data in separate objects',
      explanation: [
        'Every call to the class makes a new object with its own attributes. Changing one object’s attribute, as in a.score = 10, leaves every other object alone, even objects created with the same arguments.',
        'Assignment does not copy an object. After b = a, both names refer to the same object, just as two names can share one list, so b.score = 10 changes what a.score shows too. Objects can also be stored in a list and visited in a loop.',
      ],
      example: {
        code: 'class Player:\n    def __init__(self, name):\n        self.name = name\n        self.points = 0\n\nann = Player("Ann")\nbo = Player("Bo")\nann.points = ann.points + 5\nsame = bo\nsame.points = 2\nprint(ann.points, bo.points)',
        output: '5 2',
        explanation:
          'Each player starts with its own points of 0. Only ann gains 5. same is another name for bo’s object, so setting same.points sets bo.points.',
      },
      questions: [
        predictOutput(
          'What is the output?',
          'class Lamp:\n    def __init__(self, on):\n        self.on = on\n\ndesk = Lamp(False)\nporch = Lamp(False)\nporch.on = True\nprint(desk.on, porch.on)',
          ['True True', 'False False', 'False True', 'True False'],
          2,
          'desk and porch are separate objects, so switching porch on leaves desk off.',
        ),
        predictOutput(
          'What does this program print?',
          'class Account:\n    def __init__(self, balance):\n        self.balance = balance\n\nmine = Account(50)\nyours = mine\nyours.balance = yours.balance - 20\nprint(mine.balance)',
          ['50', '20', '-20', '30'],
          3,
          'yours = mine makes a second name for the same object, so the withdrawal shows through mine.',
        ),
        predictOutput(
          'What is printed?',
          'class Box:\n    def __init__(self, weight):\n        self.weight = weight\n\nboxes = [Box(4), Box(9)]\nboxes[1].weight = 1\nfor box in boxes:\n    print(box.weight)',
          ['4\n1', '4\n9', '1\n1', '1\n9'],
          0,
          'boxes[1] is the second box, so only its weight changes to 1. The loop visits both objects in order.',
        ),
        choose(
          'a is an object, and b = a runs. Which statement is true?',
          [
            'b is a copy, so changing b.x leaves a.x alone',
            'a and b are two names for one object',
            'b gets the attribute names but not their values',
            'b stays empty until its own __init__ runs',
          ],
          1,
          'Assignment never copies an object; it gives the same object a second name.',
        ),
      ],
    },
    {
      title: 'Give the constructor defaults and keyword arguments',
      explanation: [
        '__init__ takes parameters like any function. A default such as qty=1 makes that argument optional, and parameters with defaults come after those without. Any setting the caller leaves out falls back to its default.',
        'Callers can name arguments, as in Order("tea", qty=3) or Order(qty=2, item="cake"), in any order. The caller never passes self: in Order("tea"), "tea" fills item, and Python supplies self.',
      ],
      example: {
        code: 'class Order:\n    def __init__(self, item, qty=1, rush=False):\n        self.item = item\n        self.qty = qty\n        self.rush = rush\n\na = Order("tea")\nb = Order("cake", rush=True)\nc = Order(qty=4, item="bun")\nprint(a.qty, a.rush)\nprint(b.qty, b.rush)\nprint(c.item, c.qty)',
        output: '1 False\n1 True\nbun 4',
        explanation:
          'a uses both defaults. b names rush and keeps the default qty. c names both arguments, so their order in the call does not matter.',
      },
      questions: [
        predictOutput(
          'What is the output?',
          'class Room:\n    def __init__(self, name, beds=2):\n        self.name = name\n        self.beds = beds\n\nsuite = Room("Suite", 4)\nsingle = Room("Single", beds=1)\ntwin = Room("Twin")\nprint(suite.beds, single.beds, twin.beds)',
          ['4 2 2', '2 1 2', '4 1 2', '4 1 0'],
          2,
          'suite passes 4 by position and single passes 1 by name. twin passes nothing for beds, so it gets the default 2.',
        ),
        predictOutput(
          'What does this program print?',
          'class Timer:\n    def __init__(self, minutes=5, label="timer"):\n        self.minutes = minutes\n        self.label = label\n\nt = Timer(label="tea")\nprint(t.label, t.minutes)',
          ['tea None', '5 tea', 'timer 5', 'tea 5'],
          3,
          'The keyword argument fills label, and minutes falls back to its default of 5.',
        ),
        choose(
          'Which __init__ definition does Python reject?',
          [
            'def __init__(self, size=1, name):',
            'def __init__(self, name, size=1):',
            'def __init__(self, name, size=1, color="red"):',
            'def __init__(self, name):',
          ],
          0,
          'A parameter without a default cannot follow one with a default.',
        ),
        choose(
          'Song has def __init__(self, title, plays=0):. Which call creates a song titled Echo with 3 plays?',
          [
            'Song(self, "Echo", 3)',
            'Song("Echo", plays=3)',
            'Song.__init__("Echo", 3)',
            'Song(plays="Echo", title=3)',
          ],
          1,
          'Pass the title by position and plays by name; Python supplies self.',
        ),
      ],
    },
  ],
  methods: [
    {
      title: 'Write a method that reads attributes',
      explanation: [
        'A method is a function defined inside a class, indented under it. Its first parameter is self. Calling obj.method(arg) runs the method with self set to obj and arg in the next parameter, so the method reads obj’s attributes as self.something.',
        'A method usually returns a value computed from those attributes, and it can call another method of the same object through self. Every object of the class shares the method’s code, but each call sees its own object’s data.',
      ],
      example: {
        code: 'class Rectangle:\n    def __init__(self, width, height):\n        self.width = width\n        self.height = height\n\n    def area(self):\n        return self.width * self.height\n\n    def scaled_area(self, factor):\n        return self.area() * factor\n\nsmall = Rectangle(2, 3)\nbig = Rectangle(5, 4)\nprint(small.area(), big.area())\nprint(small.scaled_area(10))',
        output: '6 20\n60',
        explanation:
          'small.area() runs with self as small, and big.area() with self as big. scaled_area calls self.area() on the same object and multiplies the result by 10.',
      },
      questions: [
        predictOutput(
          'What is printed?',
          'class Circle:\n    def __init__(self, radius):\n        self.radius = radius\n\n    def diameter(self):\n        return self.radius * 2\n\nc = Circle(7)\nprint(c.diameter() + 1)',
          ['8', '14', '15', '16'],
          2,
          'diameter reads self.radius, 7, and returns 14; the caller then adds 1.',
        ),
        predictOutput(
          'What is the output?',
          'class Wallet:\n    def __init__(self, cash):\n        self.cash = cash\n\n    def can_buy(self, price):\n        return self.cash >= price\n\nw = Wallet(20)\nprint(w.can_buy(15), w.can_buy(25))',
          ['True True', 'False True', '5 -5', 'True False'],
          3,
          'price fills the parameter after self. 20 >= 15 is True and 20 >= 25 is False.',
        ),
        choose(
          'Inside def describe(self):, how does the method read the object’s name attribute?',
          ['self.name', 'name', 'describe.name', 'self[name]'],
          0,
          'Attributes live on the object, and self is that object. A bare name would be a local variable.',
        ),
        choose(
          'A method is defined as def total(): with no parameters. Why does d.total() fail?',
          [
            'Every method must return a value to its caller',
            'd is passed as the first argument, but total has no self',
            'A method must be called as total(d), not d.total()',
            'A method cannot have the same name as an attribute',
          ],
          1,
          'Calling through an object always passes that object first, so a method needs self.',
        ),
        predictOutput(
          'What does this program print?',
          'class Scores:\n    def __init__(self, values):\n        self.values = values\n\n    def best(self):\n        return max(self.values)\n\n    def spread(self):\n        return max(self.values) - min(self.values)\n\ns = Scores([62, 90, 75])\nprint(s.best(), s.spread())',
          ['90 28', '90 62', '75 28', '90 15'],
          0,
          'Both methods read the same list: the largest score is 90, and 90 - 62 is 28.',
        ),
      ],
    },
    {
      title: 'Update attributes inside a method',
      explanation: [
        'A method can change its object: self.total = self.total + n stores a new value on the object, and the change remains after the method returns. The next call on the same object sees the updated value.',
        'A method that only updates its object usually has no return, so it returns None. Call it for its effect, then read the attribute: account.deposit(5) on one line, print(account.balance) on the next.',
      ],
      example: {
        code: 'class Thermostat:\n    def __init__(self, temp):\n        self.temp = temp\n\n    def raise_by(self, degrees):\n        self.temp = self.temp + degrees\n\n    def reset(self):\n        self.temp = 20\n\nhome = Thermostat(18)\nhome.raise_by(3)\nhome.raise_by(1)\nprint(home.temp)\nhome.reset()\nprint(home.temp)',
        output: '22\n20',
        explanation:
          'Each raise_by builds on the stored temperature: 18, 21, then 22. reset replaces it with 20.',
      },
      questions: [
        predictOutput(
          'What is printed?',
          'class Jar:\n    def __init__(self):\n        self.coins = 0\n\n    def add(self, n):\n        self.coins = self.coins + n\n\njar = Jar()\njar.add(5)\njar.add(2)\nprint(jar.coins)',
          ['2', '7', '5', '0'],
          1,
          'Each call adds to the stored value, so the jar goes from 0 to 5 to 7.',
        ),
        predictOutput(
          'What is the output?',
          'class Battery:\n    def __init__(self, level):\n        self.level = level\n\n    def drain(self, amount):\n        self.level = max(0, self.level - amount)\n\nphone = Battery(30)\nresult = phone.drain(50)\nprint(result, phone.level)',
          ['-20 -20', '0 0', 'None -20', 'None 0'],
          3,
          'drain has no return, so result is None. max keeps the stored level from going below 0.',
        ),
        predictOutput(
          'What does this program print?',
          'class Tank:\n    def __init__(self, liters):\n        self.liters = liters\n\n    def fill(self, amount):\n        self.liters = self.liters + amount\n\na = Tank(10)\nb = Tank(10)\na.fill(5)\nb.fill(1)\na.fill(5)\nprint(a.liters, b.liters)',
          ['21 21', '15 11', '20 11', '20 10'],
          2,
          'Each call updates only the object it was called on: a gains 5 twice, and b gains 1.',
        ),
        choose(
          'A method runs total = self.total + n but never assigns to self.total. What happens to the object?',
          [
            'Nothing; total is only a local variable',
            'self.total is updated automatically',
            'The object gets a new attribute named total',
            'The method returns the new total',
          ],
          0,
          'Only an assignment to self.total changes the object. A bare name is local to that call.',
        ),
      ],
    },
    {
      title: 'Return self to chain calls',
      explanation: [
        'If a method ends with return self, the value of the call is the object itself, so you can call another method on it right away: cart.add(3).add(4) runs add on cart twice. A chain can also start from a new object: Cart().add(3) creates the object and updates it in one expression.',
        'Every link in a chain except the last must return self. A method without a return gives None, and calling a method on None fails.',
      ],
      example: {
        code: 'class Builder:\n    def __init__(self):\n        self.text = ""\n\n    def add(self, word):\n        self.text = self.text + word\n        return self\n\n    def shout(self):\n        self.text = self.text + "!"\n        return self\n\nmsg = Builder().add("hi").add(" there").shout()\nprint(msg.text)',
        output: 'hi there!',
        explanation:
          'Each call returns the same Builder, so the next call in the chain updates the same text. msg ends up naming that object.',
      },
      questions: [
        predictOutput(
          'What is printed?',
          'class Stack:\n    def __init__(self):\n        self.items = []\n\n    def push(self, x):\n        self.items.append(x)\n        return self\n\ns = Stack().push(4).push(1).push(9)\nprint(s.items)',
          ['[9]', '[9, 1, 4]', '[4, 1, 9]', '[4]'],
          2,
          'Every push returns the same object, so all three appends go to one list, in call order.',
        ),
        predictOutput(
          'What is the output?',
          'class Meter:\n    def __init__(self):\n        self.km = 0\n\n    def drive(self, km):\n        self.km = self.km + km\n        return self\n\nm = Meter()\nm.drive(10).drive(5)\nm.drive(1)\nprint(m.km)',
          ['15', '16', '1', '10'],
          1,
          'The chain and the later call all update m, so the total is 10 + 5 + 1.',
        ),
        choose(
          'Which chain fails with this class?',
          [
            'box.add(1).add(2)',
            'box.add(1).clear()',
            'box.clear().add(1)',
            'box.add(2).add(1).clear()',
          ],
          2,
          'clear has no return, so box.clear() is None, and None has no add method. A call to clear at the end of a chain is fine.',
          'class Box:\n    def __init__(self):\n        self.items = []\n\n    def add(self, x):\n        self.items.append(x)\n        return self\n\n    def clear(self):\n        self.items = []\n\nbox = Box()',
        ),
        predictOutput(
          'What does this program print?',
          'class Tally:\n    def __init__(self):\n        self.n = 0\n\n    def bump(self):\n        self.n = self.n + 1\n        return self\n\na = Tally()\nb = a.bump().bump()\nb.bump()\nprint(a.n, b.n)',
          ['2 3', '2 1', '1 3', '3 3'],
          3,
          'bump returns the same object, so b is another name for a, and all three bumps change it.',
        ),
      ],
    },
    {
      title: 'Follow the fit-then-predict pattern',
      explanation: [
        'scikit-learn models share one shape, and you can write it in plain Python. Settings go to the constructor, usually as keyword arguments with defaults. fit(data) learns from the data, stores what it learned in attributes whose names end with an underscore, such as mean_ or max_, and returns self.',
        'Methods such as predict and transform then use those learned attributes. Calling them before fit fails, because the learned attributes do not exist yet. Because fit returns self, model = Model().fit(data) creates, trains, and keeps the model in one line.',
      ],
      example: {
        code: 'class Threshold:\n    def __init__(self, margin=0):\n        self.margin = margin\n\n    def fit(self, values):\n        self.cutoff_ = sum(values) / len(values) + self.margin\n        return self\n\n    def predict(self, x):\n        return x > self.cutoff_\n\nmodel = Threshold(margin=5).fit([10, 20, 30])\nprint(model.cutoff_)\nprint(model.predict(22), model.predict(30))',
        output: '25.0\nFalse True',
        explanation:
          'margin is a setting. fit learns the mean 20.0, adds the margin, stores 25.0 in cutoff_, and returns the model. predict compares against that learned cutoff.',
      },
      questions: [
        predictOutput(
          'What is printed?',
          'class Centerer:\n    def fit(self, values):\n        self.mean_ = sum(values) / len(values)\n        return self\n\n    def transform(self, x):\n        return x - self.mean_\n\nc = Centerer().fit([4, 8, 12])\nprint(c.transform(10), c.transform(5))',
          ['2 -3', '2.0 -3.0', '-2.0 3.0', '10 5'],
          1,
          'fit learns the mean 8.0, a float because of /, and transform subtracts it: 10 - 8.0 and 5 - 8.0.',
        ),
        choose(
          'In scikit-learn style code, which attribute name marks a value learned by fit?',
          ['self.scale_', 'self._scale', 'self.scale', 'self.SCALE'],
          0,
          'A trailing underscore marks a learned attribute. Plain names hold settings from the constructor.',
        ),
        choose(
          'Which call in this program fails, and why?',
          [
            'b.predict(4), because fit returned self',
            'a.predict(4), because a has no cutoff_ yet',
            'Threshold(margin=2), because margin is learned by fit',
            'Threshold().fit([1, 3]), because fit needs a margin',
          ],
          1,
          'predict reads self.cutoff_, which only fit creates. b was fitted; a was not.',
          'class Threshold:\n    def __init__(self, margin=0):\n        self.margin = margin\n\n    def fit(self, values):\n        self.cutoff_ = sum(values) / len(values) + self.margin\n        return self\n\n    def predict(self, x):\n        return x > self.cutoff_\n\na = Threshold(margin=2)\nb = Threshold().fit([1, 3])\nprint(b.predict(4))\nprint(a.predict(4))',
        ),
        predictOutput(
          'What is the output?',
          'class Clipper:\n    def __init__(self, low=0):\n        self.low = low\n\n    def fit(self, values):\n        self.high_ = max(values)\n        return self\n\n    def transform(self, x):\n        return min(max(x, self.low), self.high_)\n\nclip = Clipper(low=2).fit([5, 9, 7])\nprint(clip.transform(1), clip.transform(6), clip.transform(12))',
          ['1 6 12', '2 6 12', '0 6 9', '2 6 9'],
          3,
          'low is the setting 2 and high_ is learned as 9, so values are clamped into the range 2 to 9.',
        ),
        predictOutput(
          'What does this program print?',
          'class MaxModel:\n    def fit(self, values):\n        self.max_ = max(values)\n        return self\n\nm = MaxModel()\nm.fit([3, 8])\nfirst = m.max_\nm.fit([1, 2])\nprint(first, m.max_)',
          ['8 8', '2 2', '8 2', '8 3'],
          2,
          'Fitting again replaces the learned attribute. first kept the earlier value, 8.',
        ),
      ],
    },
  ],
};
