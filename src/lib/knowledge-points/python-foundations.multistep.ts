import {
  choose,
  part,
  typeNumber,
  typeOutput,
  type MultistepModule,
} from './authoring';

// Multistep problems for Python foundations (CEN-163). Each one is asked in
// its skill's due reviews and in quizzes; every part names the knowledge
// point it exercises, of the skill itself or of an earlier skill it builds on.
// A part's code runs after the setup's code, as one program.

export const multistepProblems: MultistepModule = {
  'key-functions': [
    {
      title: 'Rank a leaderboard',
      setup: {
        text: [
          'A game stores each player as a `(name, score)` tuple. It ranks them with the highest score first and breaks ties by name.',
        ],
        code: `scores = [("ana", 82), ("bo", 95), ("cy", 82), ("dee", 70)]
ranked = sorted(scores, key=lambda pair: (-pair[1], pair[0]))`,
      },
      parts: [
        part(
          'tuples-kp1',
          typeNumber(
            'What is `scores[1][1]`?',
            95,
            '`scores[1]` is the tuple `("bo", 95)`, and index 1 of that tuple is the score, 95.',
          ),
        ),
        part(
          'key-functions-kp3',
          typeOutput(
            'After the setup runs, what does this print?',
            'print(ranked[:2])',
            "[('bo', 95), ('ana', 82)]",
            'The key `(-score, name)` puts the highest score first; at 82, `"ana"` comes before `"cy"` because the names break the tie.',
          ),
        ),
        part(
          'key-functions-kp4',
          typeOutput(
            'After the setup runs, what does this print?',
            'print(min(scores, key=lambda pair: pair[1])[0])',
            'dee',
            '`min` with a key compares the scores and returns the whole tuple with the lowest one, `("dee", 70)`; index 0 is the name.',
          ),
        ),
        part(
          'sorting-kp1',
          typeOutput(
            'After the setup runs, what does this print?',
            'print(scores[0])',
            "('ana', 82)",
            '`sorted` returns a new list and leaves `scores` in its original order, so its first tuple is still `("ana", 82)`.',
          ),
        ),
      ],
    },
  ],
  decorators: [
    {
      title: 'Count the calls a cache saves',
      setup: {
        text: [
          '`ways(n)` counts the ways to climb `n` stairs taking one or two steps at a time. Every call records its argument in `calls`.',
        ],
        code: `from functools import cache

calls = []

@cache
def ways(n):
    calls.append(n)
    if n <= 1:
        return 1
    return ways(n - 1) + ways(n - 2)`,
      },
      parts: [
        part(
          'recursion-kp2',
          typeNumber(
            'What does `ways(4)` return?',
            5,
            'From the base cases `ways(0)` and `ways(1)` equal to 1, each value adds the two before it: 2, 3, then 5.',
          ),
        ),
        part(
          'decorators-kp3',
          typeOutput(
            'After the setup runs, what does this print?',
            `ways(4)
print(len(calls))`,
            '5',
            'With `@cache`, each argument from 4 down to 0 is computed once; repeated calls return the stored result without running the body.',
          ),
        ),
        part(
          'imports-kp3',
          choose(
            'Which line gives the same decorator the name `memo`, so the function could be decorated with `@memo`?',
            [
              '`from functools import cache as memo`',
              '`import functools as memo`',
              '`from functools import memo`',
              '`from functools import cache; memo = cache()`',
            ],
            0,
            '`from module import name as alias` imports one name under a new name. `import functools as memo` renames the module, not the decorator.',
          ),
        ),
      ],
    },
  ],
  'bisect-module': [
    {
      title: 'Turn scores into letter grades',
      setup: {
        text: [
          'A teacher maps a score to a letter by finding how many cutoffs it reaches. A score equal to a cutoff earns that cutoff’s letter.',
        ],
        code: `from bisect import bisect_right

cutoffs = [60, 70, 80, 90]
letters = "FDCBA"

def grade(score):
    return letters[bisect_right(cutoffs, score)]`,
      },
      parts: [
        part(
          'bisect-module-kp2',
          typeNumber(
            'What is `bisect_right(cutoffs, 80)`?',
            3,
            '`bisect_right` returns the position after every item equal to 80: 60, 70, and 80 come before it, so 3.',
          ),
        ),
        part(
          'bisect-module-kp1',
          typeNumber(
            'What would `bisect_left(cutoffs, 80)` return instead?',
            2,
            '`bisect_left` returns the position before any item equal to 80, which is index 2.',
          ),
        ),
        part(
          'sorting-kp1',
          choose(
            'The cutoffs arrive unsorted as `[80, 60, 90, 70]`. Which line puts them in order before `grade` searches them?',
            [
              '`cutoffs = sorted(cutoffs)`',
              '`cutoffs = cutoffs.sort()`',
              '`sorted(cutoffs)`',
              '`cutoffs = cutoffs.sorted()`',
            ],
            0,
            '`sorted` returns a new ordered list, which must be stored. `list.sort()` sorts in place and returns `None`, and a bare `sorted(...)` call discards its result.',
          ),
        ),
        part(
          'bisect-module-kp2',
          typeOutput(
            'After the setup runs, what does this print?',
            'print(grade(80), grade(59), grade(95))',
            'B F A',
            'The positions are 3, 0, and 4, which pick `"B"`, `"F"`, and `"A"` from `"FDCBA"`.',
          ),
        ),
      ],
    },
  ],
  methods: [
    {
      title: 'Chain deposits on an account',
      setup: {
        text: [
          'An `Account` keeps its owner and balance. `deposit` returns the account itself, so calls can be chained.',
        ],
        code: `class Account:
    def __init__(self, owner, balance=0):
        self.owner = owner
        self.balance = balance

    def deposit(self, amount):
        self.balance += amount
        return self

    def report(self):
        return self.owner + ": " + str(self.balance)`,
      },
      parts: [
        part(
          'classes-kp3',
          typeNumber(
            'What is `Account("li").balance`?',
            0,
            'No balance is passed, so the constructor uses its default, 0.',
          ),
        ),
        part(
          'methods-kp3',
          typeOutput(
            'After the setup runs, what does this print?',
            `a = Account("mo", 5)
print(a.deposit(10).deposit(3).report())`,
            'mo: 18',
            'Each `deposit` adds to the same object and returns it, so the chain adds 10 and then 3 to 5.',
          ),
        ),
        part(
          'classes-kp2',
          typeOutput(
            'After the setup runs, what does this print?',
            `a = Account("x", 1)
b = Account("y", 1)
a.deposit(4)
print(a.balance, b.balance)`,
            '5 1',
            'Each object has its own `balance`; depositing into `a` leaves `b` unchanged.',
          ),
        ),
      ],
    },
  ],
  'build-nested-lists': [
    {
      title: 'Mark a seat in two grids',
      setup: {
        text: [
          'Two seating charts of 3 rows and 4 seats are built in different ways, then the same seat is set to 7 in each.',
        ],
        code: `rows, cols = 3, 4
good = [[0] * cols for _ in range(rows)]
bad = [[0] * cols] * rows
good[1][2] = 7
bad[1][2] = 7`,
      },
      parts: [
        part(
          'nested-lists-kp2',
          typeNumber(
            'What is `len(good[0])`?',
            4,
            '`good[0]` is the first row, which has `cols` seats: 4.',
          ),
        ),
        part(
          'build-nested-lists-kp3',
          typeOutput(
            'After the setup runs, what does this print?',
            'print(bad[0][2], good[0][2])',
            '7 0',
            '`[[0] * cols] * rows` repeats one row object three times, so setting a seat in row 1 changes every row of `bad`. The comprehension builds a new row each time.',
          ),
        ),
        part(
          'nested-lists-kp4',
          typeOutput(
            'After the setup runs, what does this print?',
            `total = 0
for row in bad:
    for cell in row:
        total += cell
print(total)`,
            '21',
            'All three rows of `bad` are the same list `[0, 0, 7, 0]`, so the nested loops add 7 three times.',
          ),
        ),
      ],
    },
  ],
  'dictionary-loops': [
    {
      title: 'Restock a shop',
      setup: {
        text: [
          'A shop adds each delivery to its stock. A product it has never stocked starts from 0.',
        ],
        code: `stock = {"apple": 3, "pear": 0, "fig": 5}
restock = [("pear", 4), ("kiwi", 2), ("apple", 1)]
for name, amount in restock:
    stock[name] = stock.get(name, 0) + amount`,
      },
      parts: [
        part(
          'unpacking-kp4',
          typeNumber(
            'On the loop’s first pass, what is `amount`?',
            4,
            'The first tuple is `("pear", 4)`; the loop unpacks it into `name` and `amount`.',
          ),
        ),
        part(
          'dictionaries-kp3',
          typeNumber(
            'What is `stock["kiwi"]` after the loop?',
            2,
            '`"kiwi"` was missing, so `stock.get("kiwi", 0)` gives 0, and the loop stores 0 + 2.',
          ),
        ),
        part(
          'dictionary-loops-kp3',
          typeOutput(
            'After the setup runs, what does this print?',
            `for name, count in stock.items():
    if count > 3:
        print(name)`,
            `apple
pear
fig`,
            'The counts are now apple 4, pear 4, fig 5, and kiwi 2. `items()` visits them in insertion order, and kiwi is not above 3.',
          ),
        ),
        part(
          'dictionary-loops-kp2',
          typeNumber(
            'What is `sum(stock.values())` after the loop?',
            15,
            'Only the counts matter: 4 + 4 + 5 + 2 = 15.',
          ),
        ),
      ],
    },
  ],
  'collections-module': [
    {
      title: 'Serve a help-desk queue',
      setup: {
        text: [
          'A help desk serves people first come, first served, and counts the topics they ask about. Whoever is served first rejoins the end of the line.',
        ],
        code: `from collections import deque, Counter

queue = deque(["ana", "bo"])
queue.append("cy")
first = queue.popleft()
queue.append(first)
topics = Counter(["login", "bill", "login", "wifi", "login"])`,
      },
      parts: [
        part(
          'collections-module-kp1',
          typeOutput(
            'After the setup runs, what does this print?',
            'print(list(queue))',
            "['bo', 'cy', 'ana']",
            '`popleft` removes `"ana"` from the front, and `append` puts her back at the end.',
          ),
        ),
        part(
          'collections-module-kp2',
          typeNumber(
            'What is `topics["login"]`?',
            3,
            'A `Counter` counts each item of the list; `"login"` appears three times.',
          ),
        ),
        part(
          'dictionaries-kp3',
          choose(
            'What do `topics["fax"]` and `dict(topics)["fax"]` give?',
            [
              '0, then a `KeyError`',
              '0, then 0',
              'A `KeyError`, then 0',
              '`None`, then a `KeyError`',
            ],
            0,
            'A `Counter` reports 0 for a missing item. A plain dictionary has no such default, so looking up a missing key raises a `KeyError`.',
          ),
        ),
        part(
          'list-mutation-kp2',
          typeOutput(
            'After the setup runs, what does this print?',
            `served = list(queue)
print(served.pop())`,
            'ana',
            '`pop()` with no index removes and returns the last item of the list, which is `"ana"`.',
          ),
        ),
      ],
    },
  ],
  'multiple-returns': [
    {
      title: 'Summarize a list in one call',
      setup: {
        text: [
          '`summary` returns the smallest and largest values together, or two `None` values for an empty list.',
        ],
        code: `def summary(values):
    if not values:
        return None, None
    return min(values), max(values)

low, high = summary([4, 9, 2, 7])`,
      },
      parts: [
        part(
          'multiple-returns-kp2',
          typeNumber(
            'What is `high - low`?',
            7,
            'The call returns the tuple `(2, 9)`, which unpacks into `low = 2` and `high = 9`.',
          ),
        ),
        part(
          'return-values-kp3',
          typeOutput(
            'After the setup runs, what does this print?',
            'print(summary([]))',
            '(None, None)',
            'An empty list is false, so the early `return` sends back the tuple `(None, None)` before `min` could fail.',
          ),
        ),
        part(
          'unpacking-kp2',
          choose(
            'What happens when this line runs: `low, high, mid = summary([4, 9])`?',
            [
              'A `ValueError`: two values for three names',
              '`mid` is set to `None`, since nothing is left for it',
              '`mid` is set to 4, the first value',
              '`low` gets the whole tuple `(4, 9)`',
            ],
            0,
            'Unpacking needs exactly one name per value. The function returns two values, so three names raise a `ValueError`.',
          ),
        ),
      ],
    },
  ],
};
