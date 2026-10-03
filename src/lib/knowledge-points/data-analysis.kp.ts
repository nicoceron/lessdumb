import { choose, predictOutput, type KnowledgePointModule } from './authoring';

export const knowledgePoints: KnowledgePointModule = {
  'da-arrays': [
    {
      title: 'Turn a list into an array and read its shape',
      explanation: [
        'Import NumPy once with import numpy as np, then np.array(values) builds an array from a list. A flat list gives a one-dimensional array; a list of equally long inner lists gives a two-dimensional grid with one row per inner list.',
        'shape is a tuple with one length per axis: (3,) for three values in a line, (2, 4) for two rows of four columns. The trailing comma in (3,) marks a tuple with a single length.',
      ],
      example: {
        code: 'import numpy as np\nflat = np.array([4, 8, 15])\ngrid = np.array([[1, 2, 3, 4], [5, 6, 7, 8]])\nprint(flat.shape)\nprint(grid.shape)',
        output: '(3,)\n(2, 4)',
        explanation:
          'The flat list has one axis of length 3. The nested list has two inner lists (rows) of four values (columns), so its shape is (2, 4).',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'import numpy as np\npoints = np.array([[3, 1], [4, 1], [5, 9]])\nprint(points.shape)',
          ['(2, 3)', '(3, 2)', '(6,)', '(3,)'],
          1,
          'Three inner lists become three rows, and each has two values, so the shape is (3, 2).',
        ),
        predictOutput(
          'What does this program print?',
          'import numpy as np\nrolls = np.array([7, 1, 7, 2, 9])\nprint(rolls.shape)',
          ['(1, 5)', '5', '(5, 1)', '(5,)'],
          3,
          'A flat list makes a one-dimensional array; its only axis has length 5.',
        ),
        choose(
          'A list holds 12 inner lists, each with the readings of 3 sensors. What shape does np.array give it?',
          ['(3, 12)', '(36,)', '(12, 3)', '(12,)'],
          2,
          'Each inner list becomes a row: 12 rows of 3 columns.',
        ),
        predictOutput(
          'What does this program print?',
          'import numpy as np\nrow = np.array([[10, 20, 30]])\nprint(row.shape)',
          ['(1, 3)', '(3,)', '(3, 1)', '(1,)'],
          0,
          'The outer list contains one inner list of three values: one row, three columns.',
        ),
      ],
    },
    {
      title: 'Count entries and axes with size and ndim',
      explanation: [
        'size is the total number of entries: the product of the lengths in shape. ndim is the number of axes, so a flat array has ndim 1 and a grid has ndim 2. Neither depends on the values stored.',
        'len(array) behaves like len on the outer list: it counts only the first axis, which for a grid is the number of rows, not the number of entries.',
      ],
      example: {
        code: 'import numpy as np\ngrid = np.array([[2, 4, 6], [1, 3, 5]])\nprint(grid.size)\nprint(grid.ndim)\nprint(len(grid))',
        output: '6\n2\n2',
        explanation:
          'The shape is (2, 3), so size is 2 × 3 = 6 and there are 2 axes. len counts the 2 rows.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'import numpy as np\nflags = np.array([[1, 0, 1, 0], [0, 1, 0, 1], [1, 1, 0, 0]])\nprint(flags.size)',
          ['3', '4', '12', '7'],
          2,
          'The shape is (3, 4), and size multiplies the axis lengths: 3 × 4 = 12.',
        ),
        predictOutput(
          'What does this program print?',
          'import numpy as np\nlevels = np.array([5, 6, 7, 8])\nprint(levels.ndim)\nprint(levels.size)',
          ['4\n1', '1\n4', '4\n4', '0\n4'],
          1,
          'A flat array has one axis, and that axis holds four entries.',
        ),
        predictOutput(
          'What does this program print?',
          'import numpy as np\nboard = np.array([[9, 8, 7], [6, 5, 4]])\nprint(len(board))\nprint(board.size)',
          ['3\n6', '6\n6', '2\n3', '2\n6'],
          3,
          'len counts the first axis (2 rows), while size counts all 6 entries.',
        ),
        choose(
          'An array has shape (5, 4). What are its ndim and size?',
          [
            'ndim 5, size 4',
            'ndim 2, size 9',
            'ndim 20, size 2',
            'ndim 2, size 20',
          ],
          3,
          'Two lengths in the shape means two axes, and 5 × 4 = 20 entries.',
        ),
      ],
    },
    {
      title: 'Choose a data type',
      explanation: [
        'Every entry in an array shares one dtype. A list of whole numbers gives an integer dtype, but if any entry has a decimal part NumPy stores every entry as a float, so 2 becomes 2.0. Passing dtype=float asks for floats even when every value is whole.',
        'tolist() turns an array back into ordinary Python lists and numbers, which print cleanly. Floats keep their .0, which is a quick way to see the dtype in the output.',
      ],
      example: {
        code: 'import numpy as np\nmixed = np.array([3, 4.5, 6])\ncounts = np.array([3, 4, 6], dtype=float)\nprint(mixed.tolist())\nprint(counts.tolist())\nprint(mixed.dtype)',
        output: '[3.0, 4.5, 6.0]\n[3.0, 4.0, 6.0]\nfloat64',
        explanation:
          'One decimal entry makes the whole array float64, and dtype=float makes whole numbers floats as well.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'import numpy as np\nweights = np.array([1, 2.5, 4])\nprint(weights.tolist())',
          ['[1, 2.5, 4]', '[1.0, 2.5, 4.0]', '[1, 2, 4]', '[1.0, 2.0, 4.0]'],
          1,
          'A single decimal entry makes every entry a float; nothing is rounded.',
        ),
        predictOutput(
          'What does this program print?',
          'import numpy as np\ngrid = np.array([[1, 2], [3, 4]], dtype=float)\nprint(grid.tolist())',
          [
            '[[1, 2], [3, 4]]',
            '[1.0, 2.0, 3.0, 4.0]',
            '[[1.0, 2], [3.0, 4]]',
            '[[1.0, 2.0], [3.0, 4.0]]',
          ],
          3,
          'dtype=float converts every entry, and tolist keeps the nested row structure.',
        ),
        choose(
          'Which call stores the whole numbers 4, 10 and 7 as floating-point entries?',
          [
            'np.array([4, 10, 7], dtype=float)',
            'np.array([4, 10, 7])',
            'np.array([4, 10, 7]).tolist()',
            'np.array([[4], [10], [7]])',
          ],
          0,
          'Only an explicit dtype=float turns whole-number input into floats.',
        ),
        predictOutput(
          'What does this program print?',
          'import numpy as np\nprices = np.array([5, 6, 7], dtype=float)\nfirst = prices.tolist()[0]\nprint(first + 1)',
          ['6', '[6.0]', '6.0', '51'],
          2,
          'tolist gives the Python float 5.0, and 5.0 + 1 is the float 6.0.',
        ),
      ],
    },
  ],

  'da-vectorization': [
    {
      title: 'Apply arithmetic to every entry',
      explanation: [
        'Arithmetic between an array and a number applies to every entry: prices * 2 doubles each price. Two arrays of the same shape combine position by position, so a + b adds matching entries. The result is a new array; the original is unchanged unless you assign the result back.',
        'A Python list behaves differently: [1, 2] * 2 repeats the list as [1, 2, 1, 2], and adding two lists joins them. Check whether a value is a list or an array before predicting the result.',
      ],
      example: {
        code: 'import numpy as np\nprices = np.array([3, 5, 8])\nprint((prices * 2).tolist())\nprint((prices + np.array([1, 1, 2])).tolist())\nprint([3, 5, 8] * 2)',
        output: '[6, 10, 16]\n[4, 6, 10]\n[3, 5, 8, 3, 5, 8]',
        explanation:
          'The array doubles each entry and adds matching positions; the list is repeated instead.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'import numpy as np\nstock = np.array([4, 7, 1])\nprint((stock - 1).tolist())',
          ['[4, 7, 1, -1]', '[3, 7, 1]', '[3, 6, 0]', '[4, 7, 0]'],
          2,
          'Subtracting a number from an array subtracts it from every entry.',
        ),
        predictOutput(
          'What does this program print?',
          'import numpy as np\nunits = np.array([2, 3])\nprice = np.array([10, 20])\nprint((units * price).tolist())',
          ['[20, 60]', '[12, 23]', '80', '[2, 3, 10, 20]'],
          0,
          'Equal shapes combine position by position: 2 × 10 and 3 × 20. Nothing is summed.',
        ),
        predictOutput(
          'What does this program print?',
          'values = [1, 2, 3]\nprint(values * 2)',
          ['[2, 4, 6]', '[1, 1, 2, 2, 3, 3]', '12', '[1, 2, 3, 1, 2, 3]'],
          3,
          'values is a plain list, and multiplying a list by 2 repeats it.',
        ),
        predictOutput(
          'What does this program print?',
          'import numpy as np\nlevels = np.array([5, 9])\ndoubled = levels * 2\nprint(levels.tolist())',
          ['[10, 18]', '[5, 9]', '[5, 9, 5, 9]', '[10, 18, 5, 9]'],
          1,
          'levels * 2 builds a new array stored in doubled; levels itself is unchanged.',
        ),
      ],
    },
    {
      title: 'Reduce a whole array to one number',
      explanation: [
        'A reduction combines many entries into fewer. Called with no axis, .sum() and .mean() use every entry of the array, whatever its shape, and return a single number. mean() divides by the number of entries, so it always gives a float.',
        'Reductions are methods called on the array, such as totals.sum(). They return a new value and leave the array unchanged.',
      ],
      example: {
        code: 'import numpy as np\nsales = np.array([[2, 4], [6, 8]])\nprint(sales.sum())\nprint(sales.mean())',
        output: '20\n5.0',
        explanation:
          'All four entries are added (20) and the mean divides that by 4 entries, giving the float 5.0.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'import numpy as np\nscores = np.array([3, 5, 10])\nprint(scores.sum())\nprint(scores.mean())',
          ['18\n6', '18\n6.0', '3\n6.0', '18\n9.0'],
          1,
          '3 + 5 + 10 = 18, and 18 / 3 = 6.0; a mean is always a float.',
        ),
        predictOutput(
          'What does this program print?',
          'import numpy as np\ngrid = np.array([[1, 2, 3], [4, 5, 6]])\nprint(grid.sum())',
          ['[5, 7, 9]', '[6, 15]', '6', '21'],
          3,
          'With no axis, sum adds all six entries into one number: 21.',
        ),
        predictOutput(
          'What does this program print?',
          'import numpy as np\ngrid = np.array([[2, 2], [4, 8]])\nprint(grid.mean())',
          ['4.0', '[3.0, 5.0]', '16', '[2.0, 6.0]'],
          0,
          'The four entries add to 16, and 16 / 4 = 4.0. The lists are per-column and per-row means.',
        ),
        choose(
          'A 3 × 4 array of daily step counts is reduced with .sum() and no axis. What do you get?',
          [
            'One total for each of the 3 rows',
            'A single total of all 12 entries',
            'One total for each of the 4 columns',
            'A 3 × 4 array of running totals',
          ],
          1,
          'Without an axis, the reduction combines every entry into one value.',
        ),
      ],
    },
    {
      title: 'Reduce along one axis',
      explanation: [
        'Give a reduction an axis to keep the other one. axis=0 combines entries down the rows, leaving one result per column; axis=1 combines across the columns, leaving one result per row.',
        'The axis you name is the one that disappears. A (2, 3) array summed with axis=0 has shape (3,); summed with axis=1 it has shape (2,).',
      ],
      example: {
        code: 'import numpy as np\ngrid = np.array([[1, 2, 3], [10, 20, 30]])\nprint(grid.sum(axis=0).tolist())\nprint(grid.sum(axis=1).tolist())\nprint(grid.mean(axis=1).shape)',
        output: '[11, 22, 33]\n[6, 60]\n(2,)',
        explanation:
          'axis=0 adds each column (1 + 10, 2 + 20, 3 + 30); axis=1 adds each row. Removing the column axis from (2, 3) leaves (2,).',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'import numpy as np\na = np.array([[5, 1], [2, 7], [3, 3]])\nprint(a.sum(axis=0).tolist())',
          ['[6, 9, 6]', '21', '[10, 11]', '[5, 1, 2, 7, 3, 3]'],
          2,
          'axis=0 adds down each column: 5 + 2 + 3 and 1 + 7 + 3.',
        ),
        predictOutput(
          'What does this program print?',
          'import numpy as np\na = np.array([[4, 6], [1, 3]])\nprint(a.mean(axis=1).tolist())',
          ['[5.0, 2.0]', '[2.5, 4.5]', '3.5', '[5, 2]'],
          0,
          'axis=1 averages across each row: (4 + 6) / 2 and (1 + 3) / 2, as floats.',
        ),
        predictOutput(
          'What does this program print?',
          'import numpy as np\na = np.array([[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12]])\nprint(a.sum(axis=1).shape)',
          ['(4,)', '(3, 4)', '(1,)', '(3,)'],
          3,
          'The shape is (3, 4); reducing axis 1 removes the 4 columns and leaves one total per row.',
        ),
        choose(
          'An array has shape (6, 2). Which reduction leaves one result for each of the 6 rows?',
          ['a.sum(axis=0)', 'a.sum()', 'a.sum(axis=1)', 'a.sum(axis=6)'],
          2,
          'axis=1 removes the column axis, so each of the 6 rows keeps a result.',
        ),
      ],
    },
    {
      title: 'Match the axis to the question',
      explanation: [
        'NumPy stores dimensions, not meaning. Before reducing, say what a row and a column represent. If rows are shops and columns are days, a total per shop removes the day axis (axis=1) and a total per day removes the shop axis (axis=0).',
        'Check the count of results: it should equal the number of things the question asks about. Three shops should give three totals.',
      ],
      example: {
        code: 'import numpy as np\nvisits = np.array([[12, 15], [9, 6], [21, 24]])\nprint(visits.sum(axis=1).tolist())\nprint(visits.mean(axis=0).tolist())',
        output: '[27, 15, 45]\n[14.0, 15.0]',
        explanation:
          'Rows are shops A, B and C; columns are Monday and Tuesday. Summing across days gives one total per shop, and averaging down the shops gives one mean per day.',
      },
      questions: [
        choose(
          'readings has one row per patient (40 rows) and one column per hour (24 columns). Which expression gives each patient’s average reading?',
          [
            'readings.mean(axis=0)',
            'readings.mean()',
            'readings.sum(axis=1)',
            'readings.mean(axis=1)',
          ],
          3,
          'Averaging across the hour columns (axis=1) leaves one mean per patient row.',
        ),
        choose(
          'With the same 40 × 24 readings, how many values does readings.mean(axis=0) return, and what does each describe?',
          [
            '40, one per patient',
            '24, one per hour',
            '1, the overall mean',
            '64, one per row and column',
          ],
          1,
          'axis=0 removes the patient axis, leaving one mean for each of the 24 hours.',
        ),
        predictOutput(
          'Rows are classrooms and columns are exams. What does this program print?',
          'import numpy as np\nscores = np.array([[70, 90], [80, 60], [60, 75]])\nprint(scores.mean(axis=0).tolist())',
          ['[80.0, 70.0, 67.5]', '72.5', '[70.0, 75.0]', '[210, 225]'],
          2,
          'axis=0 averages down the classrooms, giving one mean per exam.',
        ),
        choose(
          'A (12, 5) array holds monthly sales for 5 stores, one row per month. A manager wants each store’s yearly total. What shape should the correct result have?',
          ['(5,)', '(12,)', '(5, 12)', '(60,)'],
          0,
          'One total per store means the month axis disappears: sum(axis=0) gives shape (5,).',
        ),
      ],
    },
  ],

  'da-array-indexing': [
    {
      title: 'Select by row and column position',
      explanation: [
        'a[r, c] picks the entry at row r and column c, counting from zero. A colon means every position along that axis: a[:, 1] is the second column, and a[2] (or a[2, :]) is the third row.',
        'A slice such as a[0:2, 1:] works like list slicing on each axis separately and stops before its end position.',
      ],
      example: {
        code: 'import numpy as np\na = np.array([[3, 6, 9], [4, 8, 12], [5, 10, 15]])\nprint(a[1, 2])\nprint(a[:, 0].tolist())\nprint(a[0:2, 1:].tolist())',
        output: '12\n[3, 4, 5]\n[[6, 9], [8, 12]]',
        explanation:
          'Row 1, column 2 holds 12. The colon takes column 0 from every row. The slice keeps rows 0–1 and columns 1 onward.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'import numpy as np\na = np.array([[7, 1, 4], [2, 9, 6]])\nprint(a[1, 0])',
          ['1', '7', '2', '9'],
          2,
          'The row comes first: row 1 is [2, 9, 6], and column 0 of it is 2.',
        ),
        predictOutput(
          'What does this program print?',
          'import numpy as np\na = np.array([[7, 1, 4], [2, 9, 6]])\nprint(a[:, 2].tolist())',
          ['[4, 6]', '[2, 9, 6]', '[1, 9]', '[7, 1, 4]'],
          0,
          'The colon spans both rows, and position 2 is the third column.',
        ),
        predictOutput(
          'What does this program print?',
          'import numpy as np\na = np.array([[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12]])\nprint(a[1:, :2].tolist())',
          [
            '[[5, 6, 7], [9, 10, 11]]',
            '[[1, 2], [5, 6]]',
            '[[6, 7], [10, 11]]',
            '[[5, 6], [9, 10]]',
          ],
          3,
          'Rows from 1 to the end, and columns 0 and 1 (stopping before 2).',
        ),
        choose(
          'r has one row per day and one column per sensor. Which expression gives every day’s value for the fourth sensor?',
          ['r[3]', 'r[:, 4]', 'r[:, 3]', 'r[3, :]'],
          2,
          'All rows (:) and column position 3, the fourth column. r[3] is the fourth day.',
        ),
      ],
    },
    {
      title: 'Filter with a boolean mask',
      explanation: [
        'Comparing an array with a value, such as values > 10, gives an array of True and False with the same shape. Putting that mask in brackets keeps the entries where it is True, in their original order; the result can be shorter than the source, or even empty.',
        'For a grid, build the mask from one column, such as a[:, 1] >= 65. Then a[mask] keeps whole rows, because the mask has one True or False per row.',
      ],
      example: {
        code: 'import numpy as np\ntemps = np.array([18, 25, 21, 30])\nprint((temps > 20).tolist())\nprint(temps[temps > 20].tolist())\nrows = np.array([[1, 50], [2, 80], [3, 65]])\nprint(rows[rows[:, 1] >= 65].tolist())',
        output: '[False, True, True, True]\n[25, 21, 30]\n[[2, 80], [3, 65]]',
        explanation:
          'The mask marks entries above 20, and indexing keeps them in source order. The row mask comes from column 1 and keeps two complete rows.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'import numpy as np\nv = np.array([4, 11, 7, 15, 2])\nprint(v[v >= 7].tolist())',
          [
            '[7, 11, 15]',
            '[4, 2]',
            '[11, 7, 15]',
            '[False, True, True, True, False]',
          ],
          2,
          'The mask keeps entries at least 7 in their original order; it does not sort them.',
        ),
        predictOutput(
          'What does this program print?',
          'import numpy as np\nv = np.array([3, 8, 5])\nprint((v < 6).tolist())',
          ['[True, False, True]', '[3, 5]', '[False, True, False]', '2'],
          0,
          'A comparison alone gives the mask, one True or False per entry, not the selected values.',
        ),
        predictOutput(
          'What does this program print?',
          'import numpy as np\nm = np.array([[10, 1], [20, 0], [30, 1]])\nprint(m[m[:, 1] == 1].tolist())',
          ['[10, 30]', '[1, 1]', '[[20, 0]]', '[[10, 1], [30, 1]]'],
          3,
          'The mask has one value per row, so whole rows whose second column is 1 are kept.',
        ),
        predictOutput(
          'What does this program print?',
          'import numpy as np\nv = np.array([6, 2, 9])\nprint(len(v[v > 10]))',
          ['3', '0', '[]', 'False'],
          1,
          'No entry exceeds 10, so the selection is an empty array of length 0.',
        ),
      ],
    },
    {
      title: 'Know when a selection shares data',
      explanation: [
        'A basic slice such as a[:, 1] or a[1:3] is usually a view: it shares storage with the source array, so assigning into the slice changes the source too. Calling .copy() on the selection gives an independent array.',
        'A boolean-mask selection always builds a new array, so changing it leaves the source alone. When you plan to modify a selection, make your intent explicit with .copy().',
      ],
      example: {
        code: 'import numpy as np\nraw = np.array([1, 2, 3, 4])\nview = raw[1:3]\nview[0] = 99\nprint(raw.tolist())\nsafe = raw[1:3].copy()\nsafe[0] = 0\nprint(raw.tolist())',
        output: '[1, 99, 3, 4]\n[1, 99, 3, 4]',
        explanation:
          'Writing into the view changed raw. Writing into the copy did not, so raw is the same on the second line.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'import numpy as np\na = np.array([5, 6, 7])\npart = a[:2]\npart[1] = 0\nprint(a.tolist())',
          ['[5, 6, 7]', '[5, 0]', '[0, 6, 7]', '[5, 0, 7]'],
          3,
          'part is a view of the first two entries, so setting part[1] changes a[1].',
        ),
        predictOutput(
          'What does this program print?',
          'import numpy as np\na = np.array([5, 6, 7])\npart = a[:2].copy()\npart[1] = 0\nprint(a.tolist())',
          ['[5, 0, 7]', '[5, 6, 7]', '[5, 0]', '[0, 6, 7]'],
          1,
          'copy() gives part its own storage, so a is unchanged.',
        ),
        predictOutput(
          'What does this program print?',
          'import numpy as np\na = np.array([1, 8, 3, 9])\nbig = a[a > 5]\nbig[0] = -1\nprint(a.tolist())\nprint(big.tolist())',
          [
            '[1, 8, 3, 9]\n[-1, 9]',
            '[1, -1, 3, 9]\n[-1, 9]',
            '[1, 8, 3, 9]\n[8, 9]',
            '[-1, 8, 3, 9]\n[-1, 9]',
          ],
          0,
          'A mask selection is a new array: big changes, a does not.',
        ),
        choose(
          'You want to adjust the first column of raw for a chart without changing raw itself. Which line is safe?',
          [
            'col = raw[:, 0]',
            'col = raw',
            'col = raw[:, 0].copy()',
            'raw[:, 0] = col',
          ],
          2,
          'A basic slice would share raw’s storage; .copy() makes the column independent.',
        ),
      ],
    },
  ],

  'da-broadcasting': [
    {
      title: 'Check shape compatibility from the right',
      explanation: [
        'Broadcasting lets arrays of different shapes combine entry by entry. Line the shapes up at the right. Each pair of lengths must be equal, or one of them must be 1; a missing leading length counts as 1. A single number works with any shape.',
        'So (2, 3) + (3,) works: the 3s match and the missing length acts as 1, so the vector is reused for each row. (2, 3) + (2,) fails with ValueError, because 3 and 2 differ and neither is 1.',
      ],
      example: {
        code: 'import numpy as np\ngrid = np.array([[1, 2, 3], [4, 5, 6]])\nrow = np.array([10, 20, 30])\nprint((grid + row).tolist())\nprint((grid + row).shape)',
        output: '[[11, 22, 33], [14, 25, 36]]\n(2, 3)',
        explanation:
          'The trailing lengths are both 3, so row is added to each of the two rows of grid.',
      },
      questions: [
        choose(
          'Which array shape can be added directly to an array of shape (4, 3)?',
          ['(4,)', '(2, 3)', '(3, 4)', '(3,)'],
          3,
          'Aligned at the right, 3 matches 3 and the missing length counts as 1.',
        ),
        choose(
          'What happens when NumPy adds arrays of shapes (5, 2) and (5,)?',
          [
            'The (5,) array is added down each column',
            'It raises ValueError because 2 and 5 differ',
            'Each row gains all 5 values',
            'The result has shape (5, 5)',
          ],
          1,
          'Shapes align from the right, so 2 is compared with 5. They differ and neither is 1.',
        ),
        predictOutput(
          'What does this program print?',
          'import numpy as np\na = np.array([[1, 1], [2, 2], [3, 3]])\nb = np.array([10, 100])\nprint((a * b).tolist())',
          [
            '[[10, 10], [20, 20], [30, 30]]',
            '[[11, 101], [12, 102], [13, 103]]',
            '[[10, 100], [20, 200], [30, 300]]',
            '[[10, 10], [200, 200], [3, 3]]',
          ],
          2,
          'b has one value per column, so each row is multiplied by [10, 100].',
        ),
        choose(
          'Which pair of shapes is compatible for broadcasting?',
          [
            '(2, 5) and (1, 5)',
            '(3, 4) and (3,)',
            '(6,) and (4,)',
            '(2, 3) and (3, 2)',
          ],
          0,
          '5 matches 5, and the 1 stretches to 2. Every other pair has a mismatch that is not 1.',
        ),
      ],
    },
    {
      title: 'Turn a vector into a column',
      explanation: [
        'To give each row its own adjustment, the adjustment needs one value per row arranged as a column. Indexing with [:, None] inserts a length-1 axis: a vector of shape (3,) becomes (3, 1).',
        'Against a (3, 4) array, the 3s match and the 1 stretches across the 4 columns, so every entry in row i uses the i-th value.',
      ],
      example: {
        code: 'import numpy as np\nscores = np.array([[50, 60], [70, 80], [90, 100]])\nbonus = np.array([1, 2, 3])\nprint(bonus[:, None].shape)\nprint((scores + bonus[:, None]).tolist())',
        output: '(3, 1)\n[[51, 61], [72, 82], [93, 103]]',
        explanation:
          'bonus has one value per row. As a (3, 1) column, each value is added across its own row.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'import numpy as np\nv = np.array([4, 5])\nprint(v[:, None].shape)',
          ['(1, 2)', '(2,)', '(2, 2)', '(2, 1)'],
          3,
          'None adds a new axis of length 1 after the existing axis of length 2.',
        ),
        predictOutput(
          'What does this program print?',
          'import numpy as np\nm = np.array([[1, 2, 3], [4, 5, 6]])\ns = np.array([10, 20])\nprint((m * s[:, None]).tolist())',
          [
            '[[10, 20, 30], [80, 100, 120]]',
            '[[10, 40, 3], [40, 100, 6]]',
            '[[11, 12, 13], [24, 25, 26]]',
            '[[10, 20, 30], [40, 50, 60]]',
          ],
          0,
          'Row 0 is multiplied by 10 and row 1 by 20.',
        ),
        choose(
          'prices has shape (4, 3): 4 stores by 3 products. tax has one rate per store, shape (4,). Which expression applies each store’s rate across its row?',
          [
            'prices * tax',
            'prices * tax[None, :]',
            'prices * tax[:, None]',
            'prices[:, None] * tax',
          ],
          2,
          'tax[:, None] has shape (4, 1), so each rate stretches across its store’s 3 products.',
        ),
        predictOutput(
          'What does this program print?',
          'import numpy as np\nm = np.array([[0, 0], [0, 0], [0, 0]])\nr = np.array([1, 2, 3])\nprint((m + r[:, None]).tolist())',
          [
            '[[1, 2], [1, 2], [1, 2]]',
            '[[1, 1], [2, 2], [3, 3]]',
            '[[1, 2, 3], [1, 2, 3]]',
            '[1, 2, 3]',
          ],
          1,
          'As a column, r supplies one value per row, repeated across both columns.',
        ),
      ],
    },
    {
      title: 'Predict the result shape',
      explanation: [
        'The result takes the larger length on each aligned axis, and both inputs can stretch. (3, 1) + (3,) is read as (3, 1) + (1, 3), so the result is (3, 3): a full table of every pair, not three sums.',
        'That is legal but rarely what a per-row adjustment meant. Before trusting a broadcast calculation, check that the result shape matches the shape your question needs.',
      ],
      example: {
        code: 'import numpy as np\ncol = np.array([[1], [2], [3]])\nrow = np.array([10, 20, 30])\nprint((col + row).shape)\nprint((col + row).tolist())',
        output: '(3, 3)\n[[11, 21, 31], [12, 22, 32], [13, 23, 33]]',
        explanation:
          'The column stretches across 3 columns and the row stretches down 3 rows, producing all nine sums.',
      },
      questions: [
        choose(
          'What shape results from adding arrays of shapes (4, 1) and (5,)?',
          ['(4, 1)', '(5,)', 'ValueError, because 4 and 5 differ', '(4, 5)'],
          3,
          'Aligned at the right, 1 pairs with 5 and 4 pairs with a missing length, so both stretch to (4, 5).',
        ),
        predictOutput(
          'What does this program print?',
          'import numpy as np\na = np.array([[1], [2]])\nb = np.array([10, 20, 30])\nprint((a * b).tolist())',
          [
            '[[10], [40]]',
            '[[10, 20, 30], [20, 40, 60]]',
            '[10, 40, 90]',
            '[[10, 20], [20, 40]]',
          ],
          1,
          'Shapes (2, 1) and (3,) broadcast to (2, 3): each row value multiplies the whole of b.',
        ),
        predictOutput(
          'What does this program print?',
          'import numpy as np\na = np.array([[0, 0, 0], [0, 0, 0]])\nb = np.array([[5], [7]])\nprint((a + b).tolist())',
          [
            '[[5, 5, 5], [7, 7, 7]]',
            '[[5, 7, 0], [5, 7, 0]]',
            '[[5, 7], [5, 7], [5, 7]]',
            '[[5], [7]]',
          ],
          0,
          'b has shape (2, 1), so each of its values fills its row of the (2, 3) result.',
        ),
        choose(
          'A colleague adds weights of shape (3, 1) to totals of shape (3,), expecting three adjusted totals. What do they actually get?',
          [
            'Three adjusted totals, shape (3,)',
            'A ValueError because the shapes differ',
            'A 3 × 3 table of every weight and total pair',
            'Three totals as a column, shape (3, 1)',
          ],
          2,
          '(3, 1) and (3,) broadcast to (3, 3), so the calculation silently produces nine values.',
        ),
      ],
    },
  ],

  'da-series': [
    {
      title: 'Build a Series with labels',
      explanation: [
        'Import pandas with import pandas as pd. pd.Series(values, index=labels) pairs each value with a label. Built from a dictionary, the keys become the labels and the values become the data, in the dictionary’s order.',
        '.index holds the labels and .tolist() returns the values as a plain list. Without an index argument, pandas labels the values 0, 1, 2, and so on.',
      ],
      example: {
        code: 'import pandas as pd\nstock = pd.Series({"pens": 40, "pads": 12, "ink": 5})\nprint(stock.index.tolist())\nprint(stock.tolist())\nplain = pd.Series([7, 9])\nprint(plain.index.tolist())',
        output: "['pens', 'pads', 'ink']\n[40, 12, 5]\n[0, 1]",
        explanation:
          'The dictionary keys become the labels and its values the data. The list version gets default labels 0 and 1.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'import pandas as pd\ns = pd.Series([3, 8], index=["mon", "tue"])\nprint(s.index.tolist())',
          ['[3, 8]', "['mon', 'tue']", '[0, 1]', "[('mon', 3), ('tue', 8)]"],
          1,
          'index holds the labels supplied with index=, not the values.',
        ),
        predictOutput(
          'What does this program print?',
          'import pandas as pd\ns = pd.Series({"x": 1, "y": 4, "z": 9})\nprint(s.tolist())',
          ["['x', 'y', 'z']", '[0, 1, 2]', '14', '[1, 4, 9]'],
          3,
          'Dictionary values become the Series values; tolist returns them in order.',
        ),
        predictOutput(
          'What does this program print?',
          'import pandas as pd\ns = pd.Series([5, 6, 7])\nprint(s.index.tolist())',
          ['[5, 6, 7]', '[1, 2, 3]', '[0, 1, 2]', '[]'],
          2,
          'With no index given, labels default to positions starting at 0.',
        ),
        choose(
          'visits = {"mon": 120, "tue": 95}. Which call makes the days the labels?',
          [
            'pd.Series(visits)',
            'pd.Series(list(visits))',
            'pd.Series([visits])',
            'pd.Series(visits, index=[0, 1])',
          ],
          0,
          'A dictionary’s keys become the index automatically.',
        ),
      ],
    },
    {
      title: 'Select by label or by position',
      explanation: [
        '.loc[label] looks a value up by its label; .iloc[position] counts positions from zero and ignores the labels. With word labels the two are hard to confuse, but with integer labels s.loc[10] means the label 10, which may sit at position 0.',
        'Asking .loc for a label that is not in the index raises KeyError, just like a missing dictionary key.',
      ],
      example: {
        code: 'import pandas as pd\nrooms = pd.Series([18, 25, 31], index=[101, 102, 103])\nprint(rooms.loc[102])\nprint(rooms.iloc[0])',
        output: '25\n18',
        explanation:
          'The label 102 holds 25. Position 0 is the first value, 18, whatever its label is.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'import pandas as pd\ns = pd.Series([40, 50, 60], index=[2, 1, 0])\nprint(s.loc[0])',
          ['40', '50', '60', 'KeyError'],
          2,
          'loc looks for the label 0, which is attached to the last value.',
        ),
        predictOutput(
          'What does this program print?',
          'import pandas as pd\ns = pd.Series([40, 50, 60], index=[2, 1, 0])\nprint(s.iloc[0])',
          ['40', '60', '2', '50'],
          0,
          'iloc counts positions, so position 0 is the first value regardless of its label.',
        ),
        predictOutput(
          'What does this program print?',
          'import pandas as pd\ns = pd.Series({"red": 3, "green": 7, "blue": 1})\nprint(s.iloc[2])\nprint(s.loc["red"])',
          ['7\n3', '3\n1', '1\n7', '1\n3'],
          3,
          'Position 2 is the third value (blue, 1); the label red holds 3.',
        ),
        choose(
          'A Series is labelled by invoice numbers 500, 501 and 502. Which selection returns the value at the third position?',
          ['s.loc[2]', 's.iloc[2]', 's.loc[3]', 's.iloc[502]'],
          1,
          'Positions use iloc and start at 0. s.loc[2] would look for an invoice numbered 2.',
        ),
      ],
    },
    {
      title: 'Compute with a Series',
      explanation: [
        'Arithmetic on a Series applies to every value and keeps the labels, just like an array keeps its shape. Reductions such as .sum(), .mean() and .max() return one number.',
        '.idxmax() returns the label of the largest value, which is often what a question such as “which city was warmest?” actually asks for.',
      ],
      example: {
        code: 'import pandas as pd\nhours = pd.Series({"ana": 6, "ben": 9, "cy": 3})\nprint((hours * 10).to_dict())\nprint(hours.sum())\nprint(hours.idxmax())',
        output: "{'ana': 60, 'ben': 90, 'cy': 30}\n18\nben",
        explanation:
          'Multiplying keeps each label with its new value; sum adds the values, and idxmax names the label holding the largest one.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'import pandas as pd\ns = pd.Series({"a": 2, "b": 5})\nprint((s + 1).to_dict())',
          [
            "{'a': 2, 'b': 5}",
            '[3, 6]',
            "{'a': 3, 'b': 6}",
            "{'a': 3, 'b': 5}",
          ],
          2,
          'Adding 1 changes every value and keeps the labels.',
        ),
        predictOutput(
          'What does this program print?',
          'import pandas as pd\ns = pd.Series({"x": 4, "y": 10, "z": 1})\nprint(s.mean())',
          ['15', '5.0', '10', '4.0'],
          1,
          'The values add to 15, and 15 / 3 = 5.0.',
        ),
        predictOutput(
          'What does this program print?',
          'import pandas as pd\ns = pd.Series({"north": 12, "south": 30, "east": 18})\nprint(s.idxmax())\nprint(s.max())',
          ['south\n30', '30\nsouth', '1\n30', 'north\n30'],
          0,
          'idxmax gives the label of the largest value; max gives the value itself.',
        ),
        choose(
          'temps is a Series of readings labelled by city. Which expression answers “which city was warmest?”',
          ['temps.max()', 'temps.sum()', 'temps.iloc[0]', 'temps.idxmax()'],
          3,
          'max returns the highest reading; idxmax returns the city label that holds it.',
        ),
      ],
    },
  ],

  'da-dataframes': [
    {
      title: 'Build a table from columns',
      explanation: [
        'pd.DataFrame({...}) takes a dictionary whose keys are column names and whose values are equal-length lists. Position i of every list forms row i. Columns can hold different types, such as text in one and numbers in another.',
        'shape gives (rows, columns), columns.tolist() lists the names, and len(table) counts rows. head(n) returns the first n rows as a smaller table.',
      ],
      example: {
        code: 'import pandas as pd\nbooks = pd.DataFrame({"title": ["Dune", "Emma", "Ulysses"], "pages": [412, 474, 730]})\nprint(books.shape)\nprint(books.columns.tolist())\nprint(len(books.head(2)))',
        output: "(3, 2)\n['title', 'pages']\n2",
        explanation:
          'Three positions in each list make three rows, and two keys make two columns. head(2) keeps two rows.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'import pandas as pd\nt = pd.DataFrame({"a": [1, 2, 3, 4], "b": [5, 6, 7, 8], "c": [0, 0, 0, 0]})\nprint(t.shape)',
          ['(3, 4)', '(12,)', '(4, 3)', '(4,)'],
          2,
          'Each list has 4 values (rows), and there are 3 keys (columns).',
        ),
        predictOutput(
          'What does this program print?',
          'import pandas as pd\nt = pd.DataFrame({"city": ["Lima", "Oslo"], "temp": [19, 4]})\nprint(t.columns.tolist())\nprint(len(t))',
          [
            "['Lima', 'Oslo']\n2",
            "['city', 'temp']\n2",
            "['city', 'temp']\n4",
            '[0, 1]\n2',
          ],
          1,
          'The dictionary keys name the columns, and len counts the two rows.',
        ),
        predictOutput(
          'What does this program print?',
          'import pandas as pd\nt = pd.DataFrame({"n": [9, 8, 7, 6, 5]})\nprint(t.head(3).shape)',
          ['(5, 1)', '(1, 3)', '(3,)', '(3, 1)'],
          3,
          'head(3) keeps the first three rows and every column.',
        ),
        choose(
          'Which dictionary builds a valid DataFrame with 3 rows?',
          [
            '{"id": [1, 2, 3], "ok": [True, False]}',
            '{"id": [1, 2, 3], "ok": [True, False, True]}',
            '{"id": 3, "ok": 3}',
            '{"rows": [1, 2, 3], "cols": [1, 2]}',
          ],
          1,
          'Every column list must have the same length; the others mix lengths or give no lists.',
        ),
      ],
    },
    {
      title: 'Select one or several columns',
      explanation: [
        'table["price"] returns that column as a Series labelled by the table’s row index. table[["item", "price"]] passes a list of names and returns a DataFrame with those columns in the listed order.',
        'A one-name list, table[["price"]], still returns a DataFrame with one column. Asking for a name that is not a column raises KeyError.',
      ],
      example: {
        code: 'import pandas as pd\nmenu = pd.DataFrame({"dish": ["soup", "salad"], "price": [6, 8], "vegan": [True, True]})\nprint(menu["price"].tolist())\nprint(menu[["vegan", "dish"]].columns.tolist())\nprint(menu[["price"]].shape)',
        output: "[6, 8]\n['vegan', 'dish']\n(2, 1)",
        explanation:
          'A single name gives a Series of values; a list of names gives a table in the requested order, even when the list has one name.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'import pandas as pd\nt = pd.DataFrame({"a": [1, 2], "b": [3, 4]})\nprint(t[["a"]].shape)\nprint(t["a"].shape)',
          ['(2,)\n(2, 1)', '(2, 1)\n(2, 1)', '(2, 1)\n(2,)', '(1, 2)\n(2,)'],
          2,
          'A list of names returns a table (2 rows, 1 column); a single name returns a one-dimensional Series.',
        ),
        predictOutput(
          'What does this program print?',
          'import pandas as pd\nt = pd.DataFrame({"x": [1, 2], "y": [3, 4], "z": [5, 6]})\nprint(t[["z", "x"]].columns.tolist())',
          ["['x', 'z']", "['x', 'y', 'z']", "['z']", "['z', 'x']"],
          3,
          'The selected columns follow the order of the list you pass.',
        ),
        predictOutput(
          'What does this program print?',
          'import pandas as pd\nt = pd.DataFrame({"name": ["Ana", "Bo"], "age": [31, 27]})\nprint(t["age"].sum())',
          ['58', '[31, 27]', '2', '3127'],
          0,
          'The column is a Series of numbers, and sum adds them.',
        ),
        choose(
          'You need a table holding only the id and email columns of users. Which expression returns it?',
          [
            'users["id", "email"]',
            'users[["id", "email"]]',
            'users["id"]["email"]',
            'users[["id"], ["email"]]',
          ],
          1,
          'The inner brackets build one list of names; the outer brackets select with it.',
        ),
      ],
    },
    {
      title: 'Add a derived column',
      explanation: [
        'Assigning to a new name, table["total"] = expression, adds a column; assigning to an existing name replaces it. An expression that combines columns, such as table["units"] * table["price"], is computed row by row, giving one value per row.',
        'A single value also works: table["currency"] = "EUR" fills every row with it.',
      ],
      example: {
        code: 'import pandas as pd\ncart = pd.DataFrame({"item": ["tea", "mug"], "qty": [3, 2], "price": [4, 7]})\ncart["cost"] = cart["qty"] * cart["price"]\ncart["qty"] = cart["qty"] + 1\nprint(cart["cost"].tolist())\nprint(cart["qty"].tolist())\nprint(cart.shape)',
        output: '[12, 14]\n[4, 3]\n(2, 4)',
        explanation:
          'cost is computed per row (3 × 4, 2 × 7) and added as a fourth column. Reassigning qty replaces that column without adding another.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'import pandas as pd\nt = pd.DataFrame({"w": [2, 5], "h": [3, 4]})\nt["area"] = t["w"] * t["h"]\nprint(t["area"].tolist())',
          ['26', '[10, 12]', '[2, 5, 3, 4]', '[6, 20]'],
          3,
          'Each row multiplies its own w and h: 2 × 3 and 5 × 4.',
        ),
        predictOutput(
          'What does this program print?',
          'import pandas as pd\nt = pd.DataFrame({"a": [1, 2]})\nt["b"] = 0\nt["a"] = t["a"] * 10\nprint(t.shape)\nprint(t["a"].tolist())',
          [
            '(2, 2)\n[10, 20]',
            '(2, 3)\n[10, 20]',
            '(2, 2)\n[1, 2]',
            '(3, 2)\n[10, 20]',
          ],
          0,
          'b is a new column; assigning to a replaces the existing column, so there are still only two.',
        ),
        predictOutput(
          'What does this program print?',
          'import pandas as pd\nt = pd.DataFrame({"km": [10, 4]})\nt["half"] = t["km"] * 0.5\nprint(t["half"].tolist())',
          ['[5, 2]', '[5.0, 2.0]', '7.0', '[10, 4, 5.0, 2.0]'],
          1,
          'Multiplying by 0.5 gives one float per row.',
        ),
        choose(
          'After orders["revenue"] = orders["units"] * orders["price"], what does each revenue value describe?',
          [
            'The grand total of all orders',
            'The units of one row times the price of the next row',
            'That row’s units times that row’s price',
            'The average price per unit',
          ],
          2,
          'Column arithmetic pairs values from the same row, giving one result per order.',
        ),
      ],
    },
  ],

  'da-label-alignment': [
    {
      title: 'Arithmetic matches labels, not positions',
      explanation: [
        'When two Series are combined, pandas pairs the values that share a label, whatever order the labels are in. A value is never paired with whatever happens to sit at the same position.',
        'This is what you want when two datasets describe the same stable identities, such as products or regions, but were collected in different orders.',
      ],
      example: {
        code: 'import pandas as pd\njan = pd.Series([10, 20], index=["tea", "cake"])\nfeb = pd.Series([5, 1], index=["cake", "tea"])\ntotal = jan + feb\nprint(total.loc["tea"])\nprint(total.loc["cake"])',
        output: '11\n25',
        explanation:
          'tea pairs 10 with 1 and cake pairs 20 with 5, even though cake comes first in feb.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'import pandas as pd\na = pd.Series([1, 2], index=["x", "y"])\nb = pd.Series([10, 20], index=["y", "x"])\nprint((a + b).loc["x"])',
          ['11', '12', '21', '3'],
          2,
          'x is 1 in a and 20 in b, so the aligned sum is 21.',
        ),
        predictOutput(
          'What does this program print?',
          'import pandas as pd\na = pd.Series([5, 6], index=["p", "q"])\nb = pd.Series([2, 3], index=["q", "p"])\nprint((a * b).loc["q"])',
          ['12', '18', '10', '15'],
          0,
          'q is 6 in a and 2 in b, so the product is 12. Pairing by position would give 18.',
        ),
        choose(
          'Two Series list the same five stores in different orders. How does this_year - last_year pair the values?',
          [
            'First value with first value, by position',
            'By sorting both value lists first',
            'Only stores at matching positions are kept',
            'By store label',
          ],
          3,
          'Index labels carry identity, so each store’s values are paired with each other.',
        ),
        predictOutput(
          'What does this program print?',
          'import pandas as pd\na = pd.Series([1, 2, 3], index=["a", "b", "c"])\nb = pd.Series([100, 200, 300], index=["c", "b", "a"])\nprint((a + b).loc["a"])\nprint(a.tolist()[0] + b.tolist()[0])',
          ['101\n101', '301\n101', '101\n301', '301\n301'],
          1,
          'The Series sum pairs label a (1 + 300). The plain lists have no labels, so they pair first with first (1 + 100).',
        ),
      ],
    },
    {
      title: 'Decide what a missing label means',
      explanation: [
        'If a label appears in only one Series, ordinary arithmetic has nothing to pair it with, so the result there is NaN, pandas’ marker for a missing number. Because NaN is a float, the result’s values become floats.',
        's.add(other, fill_value=0) treats the absent side as 0 before adding. Use it only when absence really means zero, such as no sales through a channel; an unmeasured temperature is unknown, not zero.',
      ],
      example: {
        code: 'import pandas as pd\nshop = pd.Series([4, 2], index=["pen", "ink"])\nweb = pd.Series([3], index=["pen"])\nprint((shop + web).loc["ink"])\nprint(shop.add(web, fill_value=0).loc["ink"])',
        output: 'nan\n2.0',
        explanation:
          'ink exists only in shop. Plain addition leaves it missing; fill_value=0 counts the absent web sales as zero.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'import pandas as pd\na = pd.Series([1, 2], index=["x", "y"])\nb = pd.Series([5], index=["x"])\nprint((a + b).tolist())',
          ['[6, 2]', '[6.0, 2.0]', '[6.0, nan]', '[6]'],
          2,
          'y has no partner in b, so its sum is missing, and the values become floats.',
        ),
        predictOutput(
          'What does this program print?',
          'import pandas as pd\na = pd.Series([1, 2], index=["x", "y"])\nb = pd.Series([5], index=["x"])\nprint(a.add(b, fill_value=0).tolist())',
          ['[6.0, nan]', '[6, 7]', '[6.0, 0.0]', '[6.0, 2.0]'],
          3,
          'The absent y in b counts as 0, so y keeps its own value 2.',
        ),
        choose(
          'Rainfall from two weather stations is added for a regional total. Station B was offline on Tuesday, so Tuesday is absent from its Series. Is fill_value=0 appropriate?',
          [
            'Yes, an absent label always means zero',
            'No, the offline station’s rainfall is unknown, not zero',
            'Yes, because NaN cannot be stored in a Series',
            'No, because add does not accept fill_value',
          ],
          1,
          'Filling with zero would claim no rain fell; the honest result for Tuesday is missing.',
        ),
        choose(
          'shop and web count orders per product. A product sold only online is missing from shop. Which expression gives correct combined counts?',
          [
            'shop.add(web, fill_value=0)',
            'shop + web',
            'shop.tolist() + web.tolist()',
            'shop.add(web, fill_value=1)',
          ],
          0,
          'No shop orders genuinely means zero, so filling the absent side with 0 is correct.',
        ),
      ],
    },
    {
      title: 'Request labels with reindex',
      explanation: [
        '.reindex(labels) returns a Series with exactly those labels in exactly that order, each carrying its own value. A requested label that is not present gets NaN, and a label left out of the list is dropped. It never sorts or changes values.',
        'Use reindex to present results in a fixed order, or to check coverage: NaN in the result shows which requested labels had no data.',
      ],
      example: {
        code: 'import pandas as pd\nscore = pd.Series([7, 9, 4], index=["b", "c", "a"])\nprint(score.reindex(["a", "b", "c"]).tolist())\nprint(score.reindex(["c", "d"]).tolist())',
        output: '[4, 7, 9]\n[9.0, nan]',
        explanation:
          'Each value travels with its label into the requested order. d was not present, so it is missing, and b and a were left out.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'import pandas as pd\ns = pd.Series([1, 2, 3], index=["x", "y", "z"])\nprint(s.reindex(["z", "x"]).tolist())',
          ['[1, 3]', '[3, 1]', '[1, 2]', '[3, 2, 1]'],
          1,
          'The result has only z then x, with their own values; y is dropped.',
        ),
        predictOutput(
          'What does this program print?',
          'import pandas as pd\ns = pd.Series([10, 20], index=["mon", "tue"])\nprint(s.reindex(["mon", "tue", "wed"]).tolist())',
          ['[10, 20]', '[10, 20, 0]', '[10.0, 20.0, 0.0]', '[10.0, 20.0, nan]'],
          3,
          'wed is requested but absent, so it is missing, which also makes the values floats.',
        ),
        predictOutput(
          'What does this program print?',
          'import pandas as pd\ns = pd.Series([5, 1, 3], index=["q", "r", "p"])\nprint(s.reindex(["p", "q", "r"]).tolist())',
          ['[3, 5, 1]', '[1, 3, 5]', '[5, 1, 3]', '[3, 1, 5]'],
          0,
          'p holds 3, q holds 5 and r holds 1; reindex reorders labels without sorting values.',
        ),
        choose(
          'A report must list regions in the order north, east, south, west, even when a region has no data. Which expression fits?',
          [
            's.loc["north"]',
            's.add(s, fill_value=0)',
            's.reindex(["north", "east", "south", "west"])',
            's.iloc[0]',
          ],
          2,
          'reindex produces exactly the requested labels in order and marks absent regions as missing.',
        ),
      ],
    },
  ],

  'da-table-filtering': [
    {
      title: 'Keep rows with a boolean mask',
      explanation: [
        'A comparison on a column, such as t["score"] >= 80, gives a boolean Series with one True or False per row. t.loc[mask] keeps the True rows; t.loc[mask, "name"] or t.loc[mask, ["name", "score"]] also chooses columns.',
        'Kept rows keep their original index labels, so a filtered table’s index can have gaps. to_dict("list") maps each column name to its list of values, a compact way to print a small table.',
      ],
      example: {
        code: 'import pandas as pd\nruns = pd.DataFrame({"runner": ["Ana", "Ben", "Cai", "Dee"], "km": [5, 12, 8, 3]})\nlong_runs = runs.loc[runs["km"] > 6]\nprint(long_runs["runner"].tolist())\nprint(long_runs.index.tolist())',
        output: "['Ben', 'Cai']\n[1, 2]",
        explanation:
          'Only rows 1 and 2 have more than 6 km, and they keep their labels 1 and 2.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'import pandas as pd\nt = pd.DataFrame({"name": ["a", "b", "c"], "qty": [0, 4, 9]})\nprint(t.loc[t["qty"] > 0, "name"].tolist())',
          ["['a']", '[4, 9]', "['b', 'c']", '[False, True, True]'],
          2,
          'The mask keeps rows with positive qty, and the column selector returns their names.',
        ),
        predictOutput(
          'What does this program print?',
          'import pandas as pd\nt = pd.DataFrame({"v": [8, 3, 9, 1]})\nprint(t.loc[t["v"] < 5].index.tolist())',
          ['[0, 1]', '[3, 1]', '[0, 2]', '[1, 3]'],
          3,
          'Rows 1 and 3 hold values below 5, and they keep their original labels in order.',
        ),
        predictOutput(
          'What does this program print?',
          'import pandas as pd\nt = pd.DataFrame({"city": ["Rome", "Oslo", "Cairo"], "temp": [24, 9, 31], "rain": [1, 4, 0]})\nprint(t.loc[t["temp"] > 20, ["city", "rain"]].to_dict("list"))',
          [
            "{'city': ['Rome', 'Cairo'], 'rain': [1, 0]}",
            "{'city': ['Rome', 'Cairo'], 'temp': [24, 31]}",
            "{'city': ['Oslo'], 'rain': [4]}",
            "{'city': ['Rome', 'Oslo', 'Cairo'], 'rain': [1, 4, 0]}",
          ],
          0,
          'The mask picks Rome and Cairo; the column list keeps city and rain only.',
        ),
        choose(
          'After filtering, a table’s index is [0, 2, 5]. What does that tell you?',
          [
            'The table was sorted by its values',
            'Rows 0, 2 and 5 of the original passed the condition',
            'Three rows contain missing values',
            'The filter failed and should be repeated',
          ],
          1,
          'Filtering keeps each surviving row’s original label, so the gaps show which rows were dropped.',
        ),
      ],
    },
    {
      title: 'Combine conditions with &, | and ~',
      explanation: [
        'Python’s and and or work on single True or False values, not on a whole Series of them. For masks, use & for “both”, | for “either” and ~ for “not”. Each row is tested on its own.',
        'Wrap every comparison in parentheses, because & and | are applied before comparisons: (t["a"] > 1) & (t["b"] < 5).',
      ],
      example: {
        code: 'import pandas as pd\nrooms = pd.DataFrame({"room": ["A", "B", "C", "D"], "seats": [10, 40, 25, 60], "screen": [True, False, True, True]})\nmask = (rooms["seats"] >= 20) & rooms["screen"]\nprint(rooms.loc[mask, "room"].tolist())\nprint(rooms.loc[~rooms["screen"], "room"].tolist())',
        output: "['C', 'D']\n['B']",
        explanation:
          'B has seats but no screen and A has a screen but too few seats, so only C and D satisfy both. ~ flips the screen column, leaving B.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'import pandas as pd\nt = pd.DataFrame({"x": [1, 5, 8, 3], "y": [9, 2, 7, 4]})\nprint(t.loc[(t["x"] > 2) & (t["y"] > 3)].index.tolist())',
          ['[0, 1, 2, 3]', '[1, 2, 3]', '[2]', '[2, 3]'],
          3,
          'x > 2 holds for rows 1, 2 and 3; y > 3 holds for rows 0, 2 and 3. Both hold for 2 and 3.',
        ),
        predictOutput(
          'What does this program print?',
          'import pandas as pd\nt = pd.DataFrame({"x": [1, 5, 8, 3], "y": [9, 2, 7, 4]})\nprint(t.loc[(t["x"] > 6) | (t["y"] > 8)].index.tolist())',
          ['[]', '[2]', '[0, 2]', '[0, 1, 2]'],
          2,
          'Row 2 has x above 6 and row 0 has y above 8; either is enough.',
        ),
        predictOutput(
          'What does this program print?',
          'import pandas as pd\nt = pd.DataFrame({"item": ["cup", "pot", "pan"], "sold_out": [False, True, False]})\nprint(t.loc[~t["sold_out"], "item"].tolist())',
          [
            "['cup', 'pan']",
            "['pot']",
            "['cup', 'pot', 'pan']",
            '[True, False, True]',
          ],
          0,
          '~ turns the sold_out mask around, keeping items that are still available.',
        ),
        choose(
          'Which expression keeps rows priced under 10 or rated above 4?',
          [
            't[t["price"] < 10 or t["rating"] > 4]',
            't[(t["price"] < 10) & (t["rating"] > 4)]',
            't[(t["price"] < 10) | (t["rating"] > 4)]',
            't[t["price"] < 10 | t["rating"] > 4]',
          ],
          2,
          '| means either, and both comparisons need parentheses. or cannot combine whole Series.',
        ),
      ],
    },
    {
      title: 'Update selected cells in one step',
      explanation: [
        'To change values in some rows, put the row mask and the column name in one .loc: t.loc[mask, "status"] = "late". The assignment writes into t itself and leaves the other rows alone.',
        'A chained form such as t[mask]["status"] = "late" first builds a separate filtered table and then edits that copy, so t never changes. Current pandas warns about it; always use the single .loc form.',
      ],
      example: {
        code: 'import pandas as pd\norders = pd.DataFrame({"id": [1, 2, 3], "days": [2, 9, 5]})\norders["status"] = "on time"\norders.loc[orders["days"] > 4, "status"] = "late"\nprint(orders["status"].tolist())',
        output: "['on time', 'late', 'late']",
        explanation:
          'Every row starts as on time, then the single .loc assignment changes only the rows with more than 4 days.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'import pandas as pd\nt = pd.DataFrame({"score": [55, 72, 90]})\nt["grade"] = "pass"\nt.loc[t["score"] < 60, "grade"] = "fail"\nprint(t["grade"].tolist())',
          [
            "['pass', 'pass', 'pass']",
            "['fail', 'pass', 'pass']",
            "['fail']",
            "['pass', 'fail', 'fail']",
          ],
          1,
          'Only the first score is below 60, so only that row becomes fail.',
        ),
        predictOutput(
          'What does this program print?',
          'import pandas as pd\nt = pd.DataFrame({"qty": [3, 0, 7]})\nt.loc[t["qty"] == 0, "qty"] = 1\nprint(t["qty"].tolist())',
          ['[3, 0, 7]', '[1, 1, 1]', '[1]', '[3, 1, 7]'],
          3,
          'The mask selects only the zero, and the assignment replaces it in t.',
        ),
        choose(
          'A teammate writes t[t["age"] < 18]["group"] = "minor" and finds that no row of t changed. Why?',
          [
            't[t["age"] < 18] is a separate table, so the assignment edits that copy',
            'The mask must have selected no rows',
            'Strings cannot be assigned to a column',
            'The index must be reset before assigning',
          ],
          0,
          'Chained selection creates an intermediate copy; a single .loc assignment targets t.',
        ),
        choose(
          'Which line sets price to 0 for every discontinued product in t?',
          [
            't[t["discontinued"]]["price"] = 0',
            't["price"] = t["discontinued"]',
            't.loc["price", t["discontinued"]] = 0',
            't.loc[t["discontinued"], "price"] = 0',
          ],
          3,
          'The row mask comes first and the column name second, in one .loc assignment.',
        ),
      ],
    },
  ],

  'da-csv': [
    {
      title: 'Parse CSV text into a table',
      explanation: [
        'CSV stores a table as text: the first line names the columns, and each later line is one row with values separated by commas. pd.read_csv parses that text into a DataFrame and guesses a type for each column, so numbers become numbers.',
        'These examples wrap the text with StringIO (from io import StringIO), which makes a string behave like an open file; with a real file you pass its path instead. The parser respects quotes: in "Lima, Peru" the comma belongs to the value, which splitting each line on commas by hand would break.',
      ],
      example: {
        code: 'from io import StringIO\nimport pandas as pd\ntext = "city,visits\\n\\"Lima, Peru\\",12\\nOslo,7\\n"\nplaces = pd.read_csv(StringIO(text))\nprint(places.shape)\nprint(places["city"].tolist())',
        output: "(2, 2)\n['Lima, Peru', 'Oslo']",
        explanation:
          'The header names two columns and two lines follow, so the shape is (2, 2). The quoted comma stays inside the first city.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'from io import StringIO\nimport pandas as pd\ntext = "id,score\\n1,80\\n2,95\\n3,70\\n"\nt = pd.read_csv(StringIO(text))\nprint(t.shape)',
          ['(4, 2)', '(2, 3)', '(3, 2)', '(3, 1)'],
          2,
          'The header line names the columns and is not a row, leaving three rows of two values.',
        ),
        predictOutput(
          'What does this program print?',
          'from io import StringIO\nimport pandas as pd\ntext = "name,city\\n\\"Ng, Kim\\",Rome\\nAli,Oslo\\n"\nt = pd.read_csv(StringIO(text))\nprint(t["name"].tolist())',
          [
            "['Ng', 'Ali']",
            "['Ng, Kim', 'Ali']",
            "['Ng', 'Kim', 'Ali']",
            "['Rome', 'Oslo']",
          ],
          1,
          'The quotes mark "Ng, Kim" as one field, so its comma does not split it.',
        ),
        predictOutput(
          'What does this program print?',
          'from io import StringIO\nimport pandas as pd\ntext = "item,qty\\npen,4\\npad,6\\n"\nt = pd.read_csv(StringIO(text))\nprint(t["qty"].sum())',
          ['46', "['4', '6']", '2', '10'],
          3,
          'read_csv recognises the qty values as numbers, so sum adds them rather than joining text.',
        ),
        choose(
          'Why does read_csv handle the line "Smith, Jo",42 correctly when line.split(",") does not?',
          [
            'read_csv ignores every comma inside a line',
            'split removes the quotes before splitting',
            'read_csv treats the quoted text as a single field',
            'read_csv reads only the first column of each line',
          ],
          2,
          'A CSV parser knows a quoted field may contain the delimiter; split cuts at every comma.',
        ),
      ],
    },
    {
      title: 'Declare the delimiter',
      explanation: [
        'Not every delimited file uses commas. Semicolons are common where the comma is the decimal mark, and tab-separated files come from many exports. sep tells read_csv which character separates fields, such as sep=";" or sep="\\t" for a tab.',
        'With the wrong separator, the header contains no delimiter, so the whole line becomes one column with a long name. Checking shape and column names right after loading catches this immediately.',
      ],
      example: {
        code: 'from io import StringIO\nimport pandas as pd\ntext = "site;count\\nA;4\\nB;9\\n"\nwrong = pd.read_csv(StringIO(text))\nright = pd.read_csv(StringIO(text), sep=";")\nprint(wrong.shape)\nprint(right.shape)\nprint(right["count"].tolist())',
        output: '(2, 1)\n(2, 2)\n[4, 9]',
        explanation:
          'Read with commas, each line is one field, giving one column. With sep=";" the two columns appear.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'from io import StringIO\nimport pandas as pd\ntext = "a|b\\n1|2\\n3|4\\n"\nt = pd.read_csv(StringIO(text), sep="|")\nprint(t.columns.tolist())',
          ["['a|b']", "['1', '2']", "['a', 'b', '1', '2']", "['a', 'b']"],
          3,
          'With the pipe declared as the separator, the header splits into two column names.',
        ),
        predictOutput(
          'What does this program print?',
          'from io import StringIO\nimport pandas as pd\ntext = "x;y\\n1;2\\n"\nt = pd.read_csv(StringIO(text))\nprint(t.columns.tolist())',
          ["['x;y']", "['x', 'y']", "['1;2']", '[]'],
          0,
          'The default separator is a comma, and the header has none, so it is one column name.',
        ),
        predictOutput(
          'What does this program print?',
          'from io import StringIO\nimport pandas as pd\ntext = "day\\ttemp\\nmon\\t12\\ntue\\t15\\n"\nt = pd.read_csv(StringIO(text), sep="\\t")\nprint(t["temp"].mean())',
          ['27', '13.5', '12', 'nan'],
          1,
          'The tab separator splits day from temp, and the mean of 12 and 15 is 13.5.',
        ),
        choose(
          'A file loads with shape (500, 1) and a single column named "id;name;total". What is the most likely fix?',
          [
            'Pass dtype={"id": "string"}',
            'Drop the first row',
            'Pass sep=";" to read_csv',
            'Call head(500)',
          ],
          2,
          'The semicolons in the column name show the real delimiter was never applied.',
        ),
      ],
    },
    {
      title: 'Protect identifiers and missing markers',
      explanation: [
        'read_csv guesses each column’s type. A code such as 007 looks numeric, so it becomes the number 7 and loses its leading zeros. dtype={"code": "string"} keeps it as text: identifiers are labels, not quantities.',
        'Empty fields and common markers such as NA or n/a are read as missing automatically. Sources often have their own markers, such as - or 999; na_values=["-"] tells read_csv to treat those tokens as missing too.',
      ],
      example: {
        code: 'from io import StringIO\nimport pandas as pd\ntext = "code,temp\\n007,21\\n042,-\\n"\nraw = pd.read_csv(StringIO(text))\nclean = pd.read_csv(StringIO(text), dtype={"code": "string"}, na_values=["-"])\nprint(raw["code"].tolist())\nprint(clean["code"].tolist())\nprint(clean["temp"].tolist())',
        output: "[7, 42]\n['007', '042']\n[21.0, nan]",
        explanation:
          'Without a dtype the codes lose their zeros. With na_values, the - becomes missing, so temp is numeric (floats because of the missing value).',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'from io import StringIO\nimport pandas as pd\ntext = "zip,pop\\n02134,9\\n10001,21\\n"\nt = pd.read_csv(StringIO(text))\nprint(t["zip"].tolist())',
          [
            "['02134', '10001']",
            '[2134, 10001]',
            '[2134.0, 10001.0]',
            '[2, 1]',
          ],
          1,
          'The zip codes look like integers, so they are parsed as numbers and the leading zero disappears.',
        ),
        predictOutput(
          'What does this program print?',
          'from io import StringIO\nimport pandas as pd\ntext = "zip,pop\\n02134,9\\n10001,21\\n"\nt = pd.read_csv(StringIO(text), dtype={"zip": "string"})\nprint(t["zip"].tolist())',
          [
            '[2134, 10001]',
            "['2134', '10001']",
            '[2134.0, 10001.0]',
            "['02134', '10001']",
          ],
          3,
          'Declaring the column as text keeps every character, including the leading zero.',
        ),
        predictOutput(
          'What does this program print?',
          'from io import StringIO\nimport pandas as pd\ntext = "id,score\\n1,88\\n2,?\\n3,75\\n"\nt = pd.read_csv(StringIO(text), na_values=["?"])\nprint(t["score"].tolist())',
          [
            '[88.0, nan, 75.0]',
            "[88, '?', 75]",
            '[88, 75]',
            '[88.0, 0.0, 75.0]',
          ],
          0,
          'The ? marker becomes missing, so the column is numeric with one NaN, stored as floats.',
        ),
        choose(
          'A sensor export writes 999 when a reading failed. What should read_csv be told?',
          [
            'dtype={"reading": "string"}',
            'sep="999"',
            'na_values=["999"]',
            'Nothing, because 999 is a valid number',
          ],
          2,
          '999 is a source-specific missing marker, so declare it with na_values.',
        ),
      ],
    },
  ],

  'da-missing-values': [
    {
      title: 'Detect missing values',
      explanation: [
        'pandas marks a missing number as NaN (some column types show <NA> instead). .isna() returns True for each missing entry and .notna() the opposite. Because True counts as 1, .isna().sum() counts the missing entries; on a whole table it gives one count per column.',
        'Never test with == against NaN: NaN is not equal to anything, not even itself, so the comparison is always False and finds nothing.',
      ],
      example: {
        code: 'import pandas as pd\ntemps = pd.Series([21.5, None, 19.0, None])\nprint(temps.isna().tolist())\nprint(temps.isna().sum())\nprint((temps == float("nan")).sum())',
        output: '[False, True, False, True]\n2\n0',
        explanation:
          'isna flags the two None entries, and summing the flags counts them. The == test finds nothing because NaN never equals NaN.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'import pandas as pd\ns = pd.Series([4, None, 7])\nprint(s.notna().tolist())',
          ['[False, True, False]', '[4.0, 7.0]', '[True, False, True]', '2'],
          2,
          'notna is True where a value is present, so only the middle entry is False.',
        ),
        predictOutput(
          'What does this program print?',
          'import pandas as pd\nt = pd.DataFrame({"a": [1, None, 3], "b": [None, None, 6]})\nprint(t["b"].isna().sum())\nprint(t.isna().sum().tolist())',
          ['2\n3', '2\n[1, 2]', '1\n[1, 2]', '2\n[2, 1]'],
          1,
          'Column b has two missing entries; on the table, the counts are 1 for a and 2 for b.',
        ),
        predictOutput(
          'What does this program print?',
          'import pandas as pd\ns = pd.Series([1.0, None, 3.0])\nprint((s == s).tolist())',
          [
            '[True, True, True]',
            '[False, True, False]',
            '[True, None, True]',
            '[True, False, True]',
          ],
          3,
          'Every present value equals itself, but NaN is not equal even to itself.',
        ),
        choose(
          'Which expression counts the missing values in the price column?',
          [
            't["price"].isna().sum()',
            '(t["price"] == None).sum()',
            't["price"].sum()',
            'len(t["price"])',
          ],
          0,
          'isna flags missing entries reliably, and summing the flags counts them.',
        ),
      ],
    },
    {
      title: 'Drop or fill, and keep the result',
      explanation: [
        '.dropna() removes missing entries. On a table, .dropna() removes every row with any missing value, while .dropna(subset=["score"]) removes only rows whose score is missing. .fillna(value) replaces missing entries with a chosen value.',
        'Both return a new result and leave the original unchanged, so assign the result to a name or back to a column.',
      ],
      example: {
        code: 'import pandas as pd\nt = pd.DataFrame({"name": ["Ana", "Ben", "Cy"], "score": [8.0, None, 6.0], "note": [None, "late", None]})\nkept = t.dropna(subset=["score"])\nprint(kept["name"].tolist())\nprint(t.dropna().shape)\nt["note"] = t["note"].fillna("none")\nprint(t["note"].tolist())',
        output: "['Ana', 'Cy']\n(0, 3)\n['none', 'late', 'none']",
        explanation:
          'Only Ben lacks a score. Plain dropna removes all three rows, because each misses either score or note. The fill is assigned back to the note column.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'import pandas as pd\ns = pd.Series([2.0, None, 5.0])\ns.fillna(0)\nprint(s.tolist())',
          ['[2.0, 0.0, 5.0]', '[2.0, 5.0]', '[2.0, nan, 5.0]', '[2, 0, 5]'],
          2,
          'fillna returns a new Series; the result was never assigned, so s still has its NaN.',
        ),
        predictOutput(
          'What does this program print?',
          'import pandas as pd\nt = pd.DataFrame({"a": [1, None, 3], "b": [4, 5, None]})\nprint(len(t.dropna()))\nprint(len(t.dropna(subset=["a"])))',
          ['2\n1', '1\n2', '3\n2', '1\n1'],
          1,
          'Two rows miss something, leaving 1. Only one row misses a, leaving 2.',
        ),
        predictOutput(
          'What does this program print?',
          'import pandas as pd\nt = pd.DataFrame({"city": ["Rome", None, "Oslo"], "pop": [3, 2, None]})\nclean = t.dropna(subset=["city"])\nprint(clean["pop"].tolist())',
          ['[3.0, nan]', '[3.0]', '[3.0, 2.0]', '[3.0, 2.0, nan]'],
          0,
          'Only the row with no city is dropped; the missing pop in Oslo’s row stays.',
        ),
        choose(
          'A survey has an optional comment column and a required age column. Which call removes only respondents without an age?',
          [
            't.dropna()',
            't.fillna("age")',
            't.dropna(subset=["comment"])',
            't.dropna(subset=["age"])',
          ],
          3,
          'subset limits the rule to the required column; plain dropna would also drop rows missing only a comment.',
        ),
      ],
    },
    {
      title: 'Choose a rule that matches the meaning',
      explanation: [
        'Reductions such as .sum() and .mean() skip missing entries, so a mean describes the values that were actually observed. Filling missing entries with 0 adds observations that never happened and drags the mean down.',
        'Whether a blank means zero or unknown is a fact about the source, not something pandas can decide. Use the documented meaning, and count the missing entries before changing them so you can report the effect.',
      ],
      example: {
        code: 'import pandas as pd\nminutes = pd.Series([30.0, None, 50.0, None])\nprint(minutes.mean())\nprint(minutes.fillna(0).mean())\nprint(minutes.isna().sum())',
        output: '40.0\n20.0\n2',
        explanation:
          'The mean skips the two blanks: (30 + 50) / 2. After filling, it divides 80 by 4 instead.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'import pandas as pd\ns = pd.Series([10.0, None, 20.0])\nprint(s.mean())\nprint(s.fillna(0).mean())',
          ['10.0\n10.0', '15.0\n15.0', '15.0\n10.0', 'nan\n10.0'],
          2,
          'The first mean uses the two observed values; the filled version divides 30 by 3.',
        ),
        predictOutput(
          'What does this program print?',
          'import pandas as pd\ns = pd.Series([4.0, None, 6.0, None])\nprint(s.mean())',
          ['2.5', '5.0', 'nan', '10.0'],
          1,
          'Missing entries are skipped, so the mean is (4 + 6) / 2.',
        ),
        choose(
          'A shop’s refund column is blank on days with no refunds, as the export documentation states. Which handling fits?',
          [
            'Drop the blank days',
            'Fill the blanks with the mean refund',
            'Leave them missing, since blank means unknown',
            'Fill the blanks with 0',
          ],
          3,
          'The documentation says a blank means no refunds, so 0 is the observed value.',
        ),
        choose(
          'A heart-rate column is blank whenever the watch was off. What does fillna(0) do to the average heart rate?',
          [
            'Pulls it down with readings that never happened',
            'Nothing, because the mean skips zeros',
            'Raises it, because blanks become numbers',
            'Sets it to exactly 0',
          ],
          0,
          'Zeros count as observations, so the average now mixes in impossible heart rates.',
        ),
      ],
    },
  ],

  'da-conversion': [
    {
      title: 'Convert text to numbers and expose bad tokens',
      explanation: [
        'Columns read from text can hold numbers stored as strings, such as "12", next to junk such as "oops". pd.to_numeric(series, errors="coerce") converts every valid token and turns invalid ones into NaN. Because NaN is a float, the result is a float column.',
        'errors="raise", the default, stops with ValueError at the first invalid token. Use it when your data contract promises every value is numeric, so a violation is loud instead of silently missing.',
      ],
      example: {
        code: 'import pandas as pd\nraw = pd.Series(["12", "7.5", "oops"])\nnums = pd.to_numeric(raw, errors="coerce")\nprint(nums.tolist())\nprint(nums.sum())',
        output: '[12.0, 7.5, nan]\n19.5',
        explanation:
          'The two valid tokens become numbers and oops becomes NaN, which the sum skips.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'import pandas as pd\nraw = pd.Series(["3", "x", "4"])\nprint(pd.to_numeric(raw, errors="coerce").tolist())',
          ['[3, 0, 4]', "['3', nan, '4']", '[3.0, nan, 4.0]', '[3.0, 4.0]'],
          2,
          'x cannot be a number, so it becomes NaN; the column becomes float to hold it.',
        ),
        predictOutput(
          'What does this program print?',
          'import pandas as pd\nraw = pd.Series(["10", "20", "30"])\nprint(pd.to_numeric(raw).sum())',
          ['102030', '60', "['10', '20', '30']", '60.0'],
          1,
          'Every token is a valid whole number, so the result is integers and the sum is 60.',
        ),
        choose(
          'pd.to_numeric(pd.Series(["5", "five"])) is called with default settings. What happens?',
          [
            'It returns [5.0, nan]',
            'It returns [5, 0]',
            'It returns the text unchanged',
            'It raises ValueError at "five"',
          ],
          3,
          'The default is errors="raise", so the first invalid token stops the conversion.',
        ),
        choose(
          'A price column must contain only numbers; a bad token means the upstream export broke. Which call fits?',
          [
            'pd.to_numeric(col, errors="raise")',
            'pd.to_numeric(col, errors="coerce")',
            'col.fillna(0)',
            'col.astype("string")',
          ],
          0,
          'Raising makes the broken contract visible instead of quietly producing NaN.',
        ),
      ],
    },
    {
      title: 'Count conversions that failed',
      explanation: [
        'After coercion, a NaN means one of two things: the raw value was already missing, or conversion rejected it. A newly failed value was present before and missing after, so its mask is raw.notna() & converted.isna().',
        'Counting those separately tells you how much bad input the source sent, and raw.loc[mask] shows the rejected tokens themselves before you decide what to do.',
      ],
      example: {
        code: 'import pandas as pd\nraw = pd.Series(["4", None, "abc", "9"])\nconverted = pd.to_numeric(raw, errors="coerce")\nfailed = raw.notna() & converted.isna()\nprint(converted.isna().sum())\nprint(failed.sum())\nprint(raw.loc[failed].tolist())',
        output: "2\n1\n['abc']",
        explanation:
          'Two converted values are missing, but one was already missing in raw. Only abc was rejected.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'import pandas as pd\nraw = pd.Series(["1", None, "2", "?"])\nconv = pd.to_numeric(raw, errors="coerce")\nprint(conv.isna().sum())\nprint((raw.notna() & conv.isna()).sum())',
          ['1\n2', '2\n2', '2\n1', '1\n1'],
          2,
          'Two converted values are missing; only ? was present before conversion.',
        ),
        predictOutput(
          'What does this program print?',
          'import pandas as pd\nraw = pd.Series(["7", "seven", "7.0", "-"])\nconv = pd.to_numeric(raw, errors="coerce")\nprint(raw.loc[raw.notna() & conv.isna()].tolist())',
          ["['seven']", "['7', '7.0']", "['-']", "['seven', '-']"],
          3,
          '7 and 7.0 are valid numbers; seven and - were present but rejected.',
        ),
        choose(
          'After coercing a column of 1,000 values, 40 are missing. Before coercion, 35 were already missing. How many tokens did conversion reject?',
          ['40', '5', '75', '35'],
          1,
          'Only the missing values that were present before count as rejections: 40 − 35.',
        ),
        choose(
          'Why count raw.notna() & converted.isna() rather than converted.isna()?',
          [
            'It separates rejected tokens from values that were never there',
            'It includes values that were already missing',
            'isna does not work on converted columns',
            'It turns rejected tokens into zeros',
          ],
          0,
          'converted.isna() mixes both causes; the combined mask isolates the rejections.',
        ),
      ],
    },
    {
      title: 'Store whole numbers with gaps as Int64',
      explanation: [
        'A numeric column containing NaN is stored as floats, so counts print as 4.0. .astype("Int64"), with a capital I, converts to pandas’ nullable integer type, which holds whole numbers and shows missing entries as <NA>.',
        'astype("Int64") refuses values with a fractional part, such as 2.5, by raising TypeError rather than silently truncating a measurement. Use it only when the values really are whole.',
      ],
      example: {
        code: 'import pandas as pd\ncounts = pd.to_numeric(pd.Series(["4", "x", "9"]), errors="coerce")\nprint(counts.tolist())\nwhole = counts.astype("Int64")\nprint(whole.tolist())\nprint(whole.dtype)',
        output: '[4.0, nan, 9.0]\n[4, <NA>, 9]\nInt64',
        explanation:
          'Coercion leaves floats because of the NaN. Int64 stores the counts as whole numbers and keeps the gap as <NA>.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'import pandas as pd\ns = pd.Series([3.0, None, 5.0])\nprint(s.astype("Int64").tolist())',
          ['[3.0, nan, 5.0]', '[3, 0, 5]', '[3, 5]', '[3, <NA>, 5]'],
          3,
          'Int64 keeps the whole values as integers and the missing entry as <NA>.',
        ),
        predictOutput(
          'What does this program print?',
          'import pandas as pd\ns = pd.Series([1.0, 2.0])\nprint(s.astype("Int64").sum())',
          ['3.0', '3', '[1, 2]', '12'],
          1,
          'After conversion the values are integers, so their sum is the integer 3.',
        ),
        choose(
          's holds [1.0, 2.5, None]. What does s.astype("Int64") do?',
          [
            'Returns [1, 2, <NA>]',
            'Returns [1, 3, <NA>]',
            'Raises TypeError because 2.5 is not whole',
            'Returns [1.0, 2.5, nan] unchanged',
          ],
          2,
          'Int64 will not truncate or round a fractional value.',
        ),
        choose(
          'Why choose "Int64" rather than "int64" for a visitor-count column with a few unknown days?',
          [
            '"Int64" can hold missing entries; "int64" cannot',
            '"Int64" rounds decimals automatically',
            '"int64" stores text',
            '"Int64" stores floats more precisely',
          ],
          0,
          'The plain NumPy integer type has no representation for a missing value.',
        ),
      ],
    },
  ],

  'da-duplicates': [
    {
      title: 'Find repeated keys with duplicated',
      explanation: [
        '.duplicated() marks each row that repeats an earlier row: the first occurrence is False and later copies are True. With no arguments it compares every column.',
        '.duplicated(subset=["order_id"]) compares only the key, which also catches rows that share an identity but disagree on other fields. .sum() on the result counts the extra rows.',
      ],
      example: {
        code: 'import pandas as pd\nlog = pd.DataFrame({"order_id": [1, 2, 1, 3, 1], "qty": [5, 2, 5, 4, 6]})\nprint(log.duplicated().tolist())\nprint(log.duplicated(subset=["order_id"]).tolist())\nprint(log.duplicated(subset=["order_id"]).sum())',
        output:
          '[False, False, True, False, False]\n[False, False, True, False, True]\n2',
        explanation:
          'Only row 2 repeats a whole earlier row. By key, rows 2 and 4 both repeat order 1, even though row 4 has a different qty.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'import pandas as pd\nt = pd.DataFrame({"id": [7, 8, 7, 7]})\nprint(t.duplicated().tolist())',
          [
            '[True, False, True, True]',
            '[False, False, True, False]',
            '[False, False, True, True]',
            '[False, True, False, True]',
          ],
          2,
          'The first 7 is an original; both later 7s repeat it.',
        ),
        predictOutput(
          'What does this program print?',
          'import pandas as pd\nt = pd.DataFrame({"id": [1, 1, 2], "v": [10, 11, 12]})\nprint(t.duplicated().sum())\nprint(t.duplicated(subset=["id"]).sum())',
          ['1\n1', '0\n0', '1\n0', '0\n1'],
          3,
          'No whole row repeats, but id 1 appears twice.',
        ),
        choose(
          'Two rows have the same event_id but different amounts. Which check reports the repeat?',
          [
            't.duplicated(subset=["event_id"])',
            't.duplicated()',
            't.duplicated(subset=["amount"])',
            't["amount"].sum()',
          ],
          0,
          'The rows differ in amount, so only a key-based check sees them as the same event.',
        ),
        predictOutput(
          'What does this program print?',
          'import pandas as pd\nt = pd.DataFrame({"user": ["a", "b", "a", "c", "b"], "day": [1, 1, 2, 2, 1]})\nprint(t.duplicated(subset=["user", "day"]).sum())',
          ['2', '0', '1', '3'],
          2,
          'Only the pair (b, 1) occurs twice; a appears twice but on different days.',
        ),
      ],
    },
    {
      title: 'Keep one row per key with a declared policy',
      explanation: [
        '.drop_duplicates(subset=["id"], keep="first") keeps the first row for each id, and keep="last" keeps the last. First and last refer to the current row order, which may be arbitrary.',
        'To make the choice meaningful, sort first: .sort_values("version") orders the rows by version from smallest to largest, so keep="last" then keeps the highest version of each id. Sort by id afterwards if you want a tidy order.',
      ],
      example: {
        code: 'import pandas as pd\nrec = pd.DataFrame({"id": [2, 1, 2, 1], "version": [2, 1, 4, 3], "city": ["Rome", "Oslo", "Pisa", "Bergen"]})\nlatest = rec.sort_values("version").drop_duplicates(subset=["id"], keep="last")\nprint(latest.sort_values("id")["city"].tolist())\nprint(rec.drop_duplicates(subset=["id"])["city"].tolist())',
        output: "['Bergen', 'Pisa']\n['Rome', 'Oslo']",
        explanation:
          'After sorting by version, the last row for id 1 is version 3 (Bergen) and for id 2 is version 4 (Pisa). Without sorting, keep="first" just takes whichever row came first.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'import pandas as pd\nt = pd.DataFrame({"id": [5, 5, 6], "val": ["a", "b", "c"]})\nprint(t.drop_duplicates(subset=["id"], keep="last")["val"].tolist())',
          ["['a', 'c']", "['c']", "['b', 'c']", "['a', 'b', 'c']"],
          2,
          'For id 5 the last row is b; id 6 appears once.',
        ),
        predictOutput(
          'What does this program print?',
          'import pandas as pd\nt = pd.DataFrame({"id": [1, 1, 1], "ver": [3, 1, 2], "v": ["x", "y", "z"]})\nprint(t.sort_values("ver").drop_duplicates(subset=["id"], keep="last")["v"].tolist())',
          ["['x']", "['z']", "['y']", "['x', 'y', 'z']"],
          0,
          'Sorted by ver the rows are y, z, x, so the last is x, the highest version.',
        ),
        predictOutput(
          'What does this program print?',
          'import pandas as pd\nt = pd.DataFrame({"id": [1, 1, 1], "ver": [3, 1, 2], "v": ["x", "y", "z"]})\nprint(t.sort_values("ver").drop_duplicates(subset=["id"])["v"].tolist())',
          ["['x']", "['z']", "['y', 'z', 'x']", "['y']"],
          3,
          'keep="first" is the default, and after sorting the first row is the lowest version, y.',
        ),
        choose(
          'Rows for each customer arrive in random order, each with an updated_at timestamp. You want the most recent row per customer. What should come before drop_duplicates(subset=["customer"], keep="last")?',
          [
            'Sorting by customer name',
            'Sorting by updated_at',
            'Nothing, because last already means most recent',
            'Removing the timestamp column',
          ],
          1,
          'last follows row order, so the rows must be ordered by time for last to mean latest.',
        ),
      ],
    },
    {
      title: 'Validate the key and report what you removed',
      explanation: [
        'After deduplicating, confirm the key really is unique: table["id"].is_unique is True only when no value repeats. Record how many rows were removed, len(before) - len(after), so a reader can judge the effect.',
        'Rows that share a key but disagree on other fields may be real conflicts, not harmless repeats. A large removal count is a reason to investigate before reporting.',
      ],
      example: {
        code: 'import pandas as pd\nraw = pd.DataFrame({"id": [1, 2, 2, 3, 3, 3], "amount": [5, 8, 8, 2, 2, 9]})\nprint(raw["id"].is_unique)\nclean = raw.drop_duplicates(subset=["id"])\nprint(clean["id"].is_unique)\nprint(len(raw) - len(clean))',
        output: 'False\nTrue\n3',
        explanation:
          'Ids 2 and 3 repeat, so the key is not unique until three rows are removed. One of them (amount 9) disagreed with the kept row and deserves a look.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'import pandas as pd\nt = pd.DataFrame({"code": ["a", "b", "a"]})\nprint(t["code"].is_unique)\nprint(t.drop_duplicates()["code"].is_unique)',
          ['True\nTrue', 'False\nFalse', 'True\nFalse', 'False\nTrue'],
          3,
          'a repeats at first; after dropping the repeat, every code appears once.',
        ),
        predictOutput(
          'What does this program print?',
          'import pandas as pd\nt = pd.DataFrame({"id": [4, 4, 4, 5], "x": [1, 1, 2, 3]})\nprint(len(t) - len(t.drop_duplicates()))\nprint(len(t) - len(t.drop_duplicates(subset=["id"])))',
          ['1\n2', '2\n1', '1\n1', '2\n2'],
          0,
          'Only one whole row repeats exactly; by id alone, two rows repeat id 4.',
        ),
        choose(
          'After deduplication, table["id"].is_unique is still False. What does that mean?',
          [
            'Every id is missing',
            'Some id still appears more than once',
            'The table has no rows',
            'Too many rows were removed',
          ],
          1,
          'is_unique is False exactly when at least one value repeats.',
        ),
        choose(
          'Deduplicating 10,000 orders by order_id removes 2,400 rows, many with amounts that differ from the kept rows. What is the sound next step?',
          [
            'Report the totals, since deduplication succeeded',
            'Drop the amount column',
            'Investigate why one order has several different amounts',
            'Switch to keep="last" so fewer rows are removed',
          ],
          2,
          'Conflicting values for one key suggest a data problem that deduplication only hides.',
        ),
      ],
    },
  ],

  'da-text': [
    {
      title: 'Clean a text column with .str',
      explanation: [
        'A column of text has vectorized string methods under .str. .str.strip() removes surrounding spaces, .str.lower() and .str.upper() change case, and .str.len() counts characters. They apply to every entry, and missing entries stay missing.',
        'Chain them to normalise identifiers: s.str.strip().str.lower() turns " North " and "NORTH" into the same text.',
      ],
      example: {
        code: 'import pandas as pd\nsites = pd.Series([" North ", "north", "NORTH", None])\nclean = sites.str.strip().str.lower()\nprint(clean.fillna("missing").tolist())\nprint(sites.str.len().tolist())',
        output: "['north', 'north', 'north', 'missing']\n[7.0, 5.0, 5.0, nan]",
        explanation:
          'All three spellings become north, and the missing entry stays missing until fillna labels it. The spaces count toward the first length.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'import pandas as pd\ns = pd.Series(["  Ada", "Lin  "])\nprint(s.str.strip().tolist())',
          [
            "['  Ada', 'Lin  ']",
            "['ada', 'lin']",
            "['Ada', 'Lin']",
            "['Ada  ', '  Lin']",
          ],
          2,
          'strip removes spaces at both ends and does not change case.',
        ),
        predictOutput(
          'What does this program print?',
          'import pandas as pd\ns = pd.Series(["Paris", " paris", "PARIS "])\nprint(s.str.strip().str.lower().tolist())',
          [
            "['paris', 'paris', 'paris']",
            "['paris', ' paris', 'paris ']",
            "['Paris', 'paris', 'PARIS']",
            "['PARIS', 'PARIS', 'PARIS']",
          ],
          0,
          'Stripping then lowercasing makes all three spellings identical.',
        ),
        predictOutput(
          'What does this program print?',
          'import pandas as pd\ns = pd.Series(["ok", None])\nprint(s.str.upper().fillna("?").tolist())',
          ["['OK', 'NONE']", "['OK']", "['ok', '?']", "['OK', '?']"],
          3,
          'upper changes the present text and leaves the missing entry missing, which fillna then labels.',
        ),
        choose(
          'Why does s.strip() fail when s is a Series, while s.str.strip() works?',
          [
            'Series cannot hold text',
            'strip is a method of single strings, and .str applies it to every entry',
            'strip needs an argument when used on a Series',
            's.strip() works only on numeric Series',
          ],
          1,
          'The .str accessor exposes string methods that run element by element.',
        ),
      ],
    },
    {
      title: 'Check which values normalisation merged',
      explanation: [
        'Normalising is a decision about meaning: treating "North" and "north" as one site is right only if the source says case does not matter. Some codes are case-sensitive, and merging them would combine different things.',
        '.nunique() counts distinct non-missing values. Comparing it before and after cleaning shows how many values were merged, and keeping the raw column lets anyone audit those merges.',
      ],
      example: {
        code: 'import pandas as pd\nraw = pd.Series(["Oslo", "oslo ", "Bergen", "OSLO"])\nclean = raw.str.strip().str.lower()\nprint(raw.nunique())\nprint(clean.nunique())',
        output: '4\n2',
        explanation:
          'Four distinct spellings collapse to two cities, so three raw values were merged into oslo.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'import pandas as pd\nraw = pd.Series(["A1", "a1", " A1", "B2"])\nprint(raw.nunique())\nprint(raw.str.strip().str.lower().nunique())',
          ['2\n2', '4\n4', '4\n2', '3\n2'],
          2,
          'All four raw strings differ; after cleaning only a1 and b2 remain.',
        ),
        predictOutput(
          'What does this program print?',
          'import pandas as pd\nraw = pd.Series(["x ", "x", "y", None])\nprint(raw.nunique())\nprint(raw.str.strip().nunique())',
          ['4\n3', '3\n3', '4\n2', '3\n2'],
          3,
          'nunique ignores the missing entry; stripping merges "x " with "x".',
        ),
        choose(
          'Product codes "AB-12" and "ab-12" belong to different suppliers, and the supplier contract says case is significant. What should cleaning do?',
          [
            'Keep case and only strip surrounding spaces',
            'Lowercase both so they match',
            'Drop one of them as a duplicate',
            'Uppercase both so they match',
          ],
          0,
          'The contract makes case part of the identity, so changing it would merge different products.',
        ),
        choose(
          'Why keep the raw column after creating a normalised one?',
          [
            'Because pandas cannot overwrite a text column',
            'To check later which source values were merged',
            'To make the table load faster',
            'Because normalised text cannot be filtered',
          ],
          1,
          'The raw values are the evidence for reviewing the normalisation rule.',
        ),
      ],
    },
    {
      title: 'Search text literally and decide the missing rule',
      explanation: [
        '.str.contains(pattern) is True where the text contains the pattern. By default the pattern is a regular expression, a small language in which some characters have special meanings; "." matches any single character. regex=False searches for the literal text instead.',
        'Depending on the column type, missing text can produce a missing result instead of True or False, which is not a usable mask. na=False states the rule explicitly: missing text does not match.',
      ],
      example: {
        code: 'import pandas as pd\ncodes = pd.Series(["A.1", "AX1", None], dtype="string")\nprint(codes.str.contains(".", regex=False, na=False).tolist())\nprint(codes.str.contains(".", na=False).tolist())\nprint(codes.str.contains(".", regex=False).tolist())',
        output:
          '[True, False, False]\n[True, True, False]\n[True, False, <NA>]',
        explanation:
          'Literally, only A.1 contains a dot. As a regular expression the dot matches any character, so AX1 matches too. Without na=False, the missing code gives <NA>.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'import pandas as pd\ns = pd.Series(["v1.2", "v12", "v1-2"])\nprint(s.str.contains("1.2", regex=False).tolist())',
          [
            '[True, True, True]',
            '[True, False, True]',
            '[True, False, False]',
            '[False, False, False]',
          ],
          2,
          'Only v1.2 contains the literal characters 1.2.',
        ),
        predictOutput(
          'What does this program print?',
          'import pandas as pd\ns = pd.Series(["v1.2", "v12", "v1-2"])\nprint(s.str.contains("1.2").tolist())',
          [
            '[True, False, True]',
            '[True, False, False]',
            '[True, True, True]',
            '[False, False, True]',
          ],
          0,
          'As a regular expression the dot matches any character, so 1-2 matches. v12 has no character between 1 and 2.',
        ),
        predictOutput(
          'What does this program print?',
          'import pandas as pd\ns = pd.Series(["red apple", None, "green pear"], dtype="string")\nprint(s.str.contains("apple", regex=False, na=False).tolist())',
          [
            '[True, <NA>, False]',
            '[True, True, False]',
            '[True, False]',
            '[True, False, False]',
          ],
          3,
          'na=False decides that the missing entry does not match, so every result is True or False.',
        ),
        choose(
          'You keep emails containing "@example.com" using contains with default settings. Which mistake does regex=False prevent?',
          [
            'Uppercase letters being ignored',
            'A dot matching any character, as in "@exampleXcom"',
            'Missing emails raising KeyError',
            'The @ sign being removed',
          ],
          1,
          'In a regular expression the dot is a wildcard, so unintended addresses can match.',
        ),
      ],
    },
  ],

  'da-categories': [
    {
      title: 'Declare an ordered scale',
      explanation: [
        'pd.Categorical(values, categories=[...], ordered=True) records the allowed labels and their order; wrap it in pd.Series to use it as a column. s.sort_values() returns the values in ascending order, and for an ordered categorical that order is the declared one rather than the alphabet.',
        'Ordered categories also compare by rank, so s > "low" is True for medium and high.',
      ],
      example: {
        code: 'import pandas as pd\nlevels = ["high", "low", "medium", "low"]\nplain = pd.Series(levels)\nranked = pd.Series(pd.Categorical(levels, categories=["low", "medium", "high"], ordered=True))\nprint(plain.sort_values().tolist())\nprint(ranked.sort_values().tolist())\nprint((ranked > "low").tolist())',
        output:
          "['high', 'low', 'low', 'medium']\n['low', 'low', 'medium', 'high']\n[True, False, True, False]",
        explanation:
          'Plain text sorts alphabetically, which puts high first. The ordered categorical follows low, medium, high, and compares by that rank.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'import pandas as pd\nsizes = pd.Series(["M", "S", "L"])\nprint(sizes.sort_values().tolist())',
          [
            "['S', 'M', 'L']",
            "['M', 'S', 'L']",
            "['L', 'M', 'S']",
            "['L', 'S', 'M']",
          ],
          2,
          'Plain text sorts alphabetically: L, M, S.',
        ),
        predictOutput(
          'What does this program print?',
          'import pandas as pd\nsizes = pd.Series(pd.Categorical(["M", "S", "L"], categories=["S", "M", "L"], ordered=True))\nprint(sizes.sort_values().tolist())',
          [
            "['S', 'M', 'L']",
            "['L', 'M', 'S']",
            "['M', 'S', 'L']",
            "['L', 'S', 'M']",
          ],
          0,
          'The declared order S, M, L controls sorting.',
        ),
        predictOutput(
          'What does this program print?',
          'import pandas as pd\ngrade = pd.Series(pd.Categorical(["B", "A", "C"], categories=["C", "B", "A"], ordered=True))\nprint((grade >= "B").tolist())',
          [
            '[True, False, True]',
            '[True, False, False]',
            '[False, True, True]',
            '[True, True, False]',
          ],
          3,
          'The scale runs C, B, A, so A ranks above B and C ranks below it.',
        ),
        choose(
          'Why sort shirt sizes with an ordered categorical rather than as plain text?',
          [
            'Plain text cannot be sorted',
            'Plain text sorts alphabetically, putting L before M before S',
            'Categoricals sort by how often each size appears',
            'Ordered categoricals remove duplicate sizes',
          ],
          1,
          'The meaningful order of sizes is not the alphabetical order of their labels.',
        ),
      ],
    },
    {
      title: 'Check values against the allowed set',
      explanation: [
        'A value outside the declared categories cannot be stored, so pandas turns it into a missing value (newer versions also warn). A typo such as "hgih" would quietly become missing.',
        'Check membership before converting: values.isin(allowed) is True for each allowed entry, and len(values) - values.isin(allowed).sum() counts the entries that need a look.',
      ],
      example: {
        code: 'import pandas as pd\nraw = pd.Series(["low", "hgih", "high", "Low"])\nallowed = ["low", "medium", "high"]\nprint(raw.isin(allowed).tolist())\nprint(len(raw) - raw.isin(allowed).sum())',
        output: '[True, False, True, False]\n2',
        explanation:
          'The typo and the capitalised Low are not in the allowed list. Converting now would turn both into missing values.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'import pandas as pd\nraw = pd.Series(["red", "blue", "Red", "green"])\nprint(raw.isin(["red", "green", "blue"]).tolist())',
          [
            '[True, True, True, True]',
            '[True, False, False, True]',
            '[False, False, True, False]',
            '[True, True, False, True]',
          ],
          3,
          'isin compares exact text, so Red with a capital letter is not in the list.',
        ),
        predictOutput(
          'What does this program print?',
          'import pandas as pd\nraw = pd.Series(["S", "M", "XL", "M"])\nprint(len(raw) - raw.isin(["S", "M", "L"]).sum())',
          ['1', '3', '0', '2'],
          0,
          'Three entries are allowed; only XL is not.',
        ),
        choose(
          'A Categorical with categories ["S", "M", "L"] is built from ["S", "XL", "M"]. What happens to "XL"?',
          [
            'It becomes a new category',
            'It is stored as "L"',
            'It becomes a missing value',
            'It moves to the end of the order',
          ],
          2,
          'Only declared categories can be stored, so the unexpected label is lost as missing.',
        ),
        choose(
          'Why run isin against the allowed list before converting to a Categorical?',
          [
            'isin sorts the values into category order',
            'Conversion would turn unexpected labels into missing values, losing what they were',
            'Categorical requires every value to be lowercase',
            'isin removes duplicate labels',
          ],
          1,
          'Checking first shows exactly which raw labels break the contract.',
        ),
      ],
    },
    {
      title: 'Encode membership with indicator columns',
      explanation: [
        'pd.get_dummies(series, dtype=int) makes one column per category, named after it, holding 1 where the row has that category and 0 elsewhere, so each row has exactly one 1. For plain text the columns are in alphabetical order; for a Categorical there is one column per declared category, in declared order, even for unused ones.',
        '.cat.codes shows each value’s position in its categories list. Codes are internal identifiers, not measurements: with categories red, green, blue, code 2 is not twice code 1.',
      ],
      example: {
        code: 'import pandas as pd\ncolour = pd.Series(["red", "blue", "red"])\ndummies = pd.get_dummies(colour, dtype=int)\nprint(dummies.columns.tolist())\nprint(dummies["red"].tolist())\nprint(dummies.shape)',
        output: "['blue', 'red']\n[1, 0, 1]\n(3, 2)",
        explanation:
          'Two distinct colours give two indicator columns. The red column is 1 in the rows that are red.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'import pandas as pd\ns = pd.Series(["cat", "dog", "cat", "fish"])\nd = pd.get_dummies(s, dtype=int)\nprint(d.shape)\nprint(d["cat"].tolist())',
          [
            '(3, 4)\n[1, 0, 1, 0]',
            '(4, 3)\n[0, 1, 0, 1]',
            '(4, 3)\n[1, 0, 1, 0]',
            '(4, 1)\n[2]',
          ],
          2,
          'Four rows and three distinct animals; the cat column marks rows 0 and 2.',
        ),
        predictOutput(
          'What does this program print?',
          'import pandas as pd\ns = pd.Series(pd.Categorical(["mid", "low"], categories=["low", "mid", "high"]))\nprint(pd.get_dummies(s, dtype=int).columns.tolist())',
          [
            "['mid', 'low']",
            "['low', 'mid']",
            "['high', 'low', 'mid']",
            "['low', 'mid', 'high']",
          ],
          3,
          'A Categorical gets a column for every declared category, in declared order, even high, which never occurs.',
        ),
        predictOutput(
          'What does this program print?',
          'import pandas as pd\ns = pd.Series(pd.Categorical(["b", "c", "a"], categories=["c", "b", "a"]))\nprint(s.cat.codes.tolist())',
          ['[1, 2, 0]', '[1, 0, 2]', '[0, 1, 2]', '[2, 1, 0]'],
          1,
          'Codes are positions in the declared list c, b, a: b is 1, c is 0 and a is 2.',
        ),
        choose(
          'Cities are encoded as 0 = Lima, 1 = Oslo, 2 = Rome, and a model treats the code as a number. What false assumption does that create?',
          [
            'That the cities are missing values',
            'That the column is text',
            'That Rome is somehow double Oslo, with Oslo between Lima and Rome',
            'None, because codes are measurements',
          ],
          2,
          'Arithmetic on codes invents an order and distances between cities; indicator columns avoid this.',
        ),
      ],
    },
  ],

  'da-joins': [
    {
      title: 'Choose which rows survive a join',
      explanation: [
        'left.merge(right, on="key", how=...) adds the right table’s columns to rows with a matching key. how="inner" keeps only keys found in both tables. how="left" keeps every left row; where no right row matches, the new columns hold NaN, pandas’ missing marker.',
        'The join type is an analysis decision: an inner join silently drops observations that have no match.',
      ],
      example: {
        code: 'import pandas as pd\norders = pd.DataFrame({"sku": ["A", "B", "C"], "qty": [2, 1, 5]})\nprices = pd.DataFrame({"sku": ["A", "C"], "price": [3, 4]})\nprint(len(orders.merge(prices, on="sku", how="inner")))\nleft = orders.merge(prices, on="sku", how="left")\nprint(left["price"].tolist())',
        output: '2\n[3.0, nan, 4.0]',
        explanation:
          'B has no price, so the inner join drops it while the left join keeps it with a missing price.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'import pandas as pd\na = pd.DataFrame({"id": [1, 2, 3, 4]})\nb = pd.DataFrame({"id": [2, 4, 6], "x": [9, 8, 7]})\nprint(len(a.merge(b, on="id", how="inner")))\nprint(len(a.merge(b, on="id", how="left")))',
          ['4\n4', '2\n5', '3\n4', '2\n4'],
          3,
          'Only ids 2 and 4 are in both; the left join keeps all four left rows.',
        ),
        predictOutput(
          'What does this program print?',
          'import pandas as pd\na = pd.DataFrame({"id": [1, 2, 3, 4]})\nb = pd.DataFrame({"id": [2, 4, 6], "x": [9, 8, 7]})\nprint(a.merge(b, on="id", how="left")["x"].tolist())',
          [
            '[9, 8]',
            '[nan, 9.0, nan, 8.0]',
            '[9.0, 8.0, 7.0, nan]',
            '[0, 9, 0, 8]',
          ],
          1,
          'Each left id gets its own match or NaN; id 6 exists only on the right and is not kept.',
        ),
        choose(
          'Every sale must stay in the revenue report, even when its product is missing from the catalogue. Which join fits sales.merge(catalogue, on="sku", ...)?',
          [
            'how="inner"',
            'how="left"',
            'Either, because inner and left keep the same rows',
            'Neither; join the catalogue to itself first',
          ],
          1,
          'A left join keeps every sale and shows missing catalogue details as NaN.',
        ),
        choose(
          'An inner join of 1,000 visits to a site table with one row per site returns 940 rows. What does that tell you?',
          [
            'The site table has duplicate sites',
            '940 sites were visited',
            '60 visits name sites missing from the site table',
            'The join must be repeated',
          ],
          2,
          'With unique site rows, each visit matches at most once, so 60 visits found no site.',
        ),
      ],
    },
    {
      title: 'Catch repeated keys with validate',
      explanation: [
        'Every matching pair of rows becomes a result row. If the right table repeats a key, each left row with that key is copied once per repeat, so a left join can return more rows than the left table had and totals double-count.',
        'validate states the expected relationship, left side first: "many_to_one" means many left rows may share a key but right keys must be unique; "one_to_one" demands uniqueness on both sides. If the data breaks the rule, merge raises MergeError instead of quietly multiplying rows.',
      ],
      example: {
        code: 'import pandas as pd\nsales = pd.DataFrame({"store": ["N", "S", "N"], "amount": [10, 20, 30]})\nregions = pd.DataFrame({"store": ["N", "N", "S"], "region": ["east", "west", "south"]})\njoined = sales.merge(regions, on="store", how="left")\nprint(len(joined))\nprint(joined["amount"].sum())',
        output: '5\n100',
        explanation:
          'Store N appears twice in regions, so both N sales are copied twice: 5 rows, and the total of 60 becomes 100. validate="many_to_one" would have raised an error.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'import pandas as pd\nleft = pd.DataFrame({"k": ["a", "b"]})\nright = pd.DataFrame({"k": ["a", "a", "a", "b"], "v": [1, 2, 3, 4]})\nprint(len(left.merge(right, on="k", how="left")))',
          ['2', '3', '4', '6'],
          2,
          'a matches three right rows and b matches one, so there are four result rows.',
        ),
        predictOutput(
          'What does this program print?',
          'import pandas as pd\norders = pd.DataFrame({"cust": [1, 1, 2], "total": [5, 7, 9]})\ncust = pd.DataFrame({"cust": [1, 2, 2], "tier": ["gold", "std", "vip"]})\nprint(orders.merge(cust, on="cust", how="left")["total"].sum())',
          ['21', '39', '18', '30'],
          3,
          'Customer 2 appears twice in cust, so the 9 is counted twice: 5 + 7 + 9 + 9.',
        ),
        choose(
          'Many invoices should each match exactly one customer record. Which validate value states that contract for invoices.merge(customers, on="cust_id")?',
          ['"one_to_one"', '"many_to_one"', '"many_to_many"', '"left_only"'],
          1,
          'Invoices (left) may repeat a customer, but customers (right) must be unique.',
        ),
        choose(
          'A left join with validate="many_to_one" raises MergeError. What does that mean?',
          [
            'Some key appears more than once in the right table',
            'Some left keys have no match',
            'The left table repeats some keys',
            'The key columns hold different types',
          ],
          0,
          'many_to_one allows repeated left keys and unmatched rows; it forbids repeated right keys.',
        ),
      ],
    },
    {
      title: 'Audit unmatched rows with indicator',
      explanation: [
        'indicator=True adds a _merge column saying where each row came from: "both" for a match and "left_only" for a left row with no partner. Counting the left_only rows shows how much of your data the lookup table failed to cover.',
        'Inspect unmatched keys before reporting. A typo, a missing lookup entry and a genuinely new item each need a different fix.',
      ],
      example: {
        code: 'import pandas as pd\nevents = pd.DataFrame({"site": ["A", "C", "A", "D"], "n": [1, 2, 3, 4]})\nsites = pd.DataFrame({"site": ["A", "B"], "region": ["east", "west"]})\nj = events.merge(sites, on="site", how="left", indicator=True)\nprint(j["_merge"].tolist())\nprint((j["_merge"] == "left_only").sum())',
        output: "['both', 'left_only', 'both', 'left_only']\n2",
        explanation:
          'Sites C and D are not in the site table, so two event rows are left_only.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'import pandas as pd\na = pd.DataFrame({"k": [1, 2, 3]})\nb = pd.DataFrame({"k": [3, 1]})\nj = a.merge(b, on="k", how="left", indicator=True)\nprint(j["_merge"].tolist())',
          [
            "['both', 'both', 'left_only']",
            "['both', 'left_only', 'both']",
            "['left_only', 'both', 'left_only']",
            "['both', 'both', 'both']",
          ],
          1,
          'Keys 1 and 3 appear in b; key 2 does not. The result keeps the left order.',
        ),
        predictOutput(
          'What does this program print?',
          'import pandas as pd\na = pd.DataFrame({"code": ["x", "y", "z", "y"]})\nb = pd.DataFrame({"code": ["y"], "name": ["Yew"]})\nj = a.merge(b, on="code", how="left", indicator=True)\nprint((j["_merge"] == "left_only").sum())',
          ['1', '3', '0', '2'],
          3,
          'x and z have no partner; both y rows match.',
        ),
        choose(
          'After a left join with indicator=True, 15% of rows are left_only. Which response is sound?',
          [
            'Switch to an inner join so they disappear',
            'Fill their region with the most common region',
            'Inspect those keys before reporting totals by region',
            'Ignore them, because left joins always leave some rows unmatched',
          ],
          2,
          'Unmatched rows would distort a by-region report; find out why they failed to match.',
        ),
        choose(
          'Which _merge value marks a left row that found no partner in the right table?',
          ['"left_only"', '"both"', 'NaN', '"unmatched"'],
          0,
          'left_only means the row exists only on the left side of the join.',
        ),
      ],
    },
  ],

  'da-reshape': [
    {
      title: 'Melt wide columns into long rows',
      explanation: [
        'A wide table has one column per repeated measurement, such as jan and feb. A long table has one row per measurement, with one column naming the measurement and one holding its value. .melt(id_vars=["site"], var_name="month", value_name="sales") converts wide to long.',
        'Each id row contributes one row per melted column, so the long table has rows × melted columns rows. pandas lists every row for the first melted column, then every row for the next.',
      ],
      example: {
        code: 'import pandas as pd\nwide = pd.DataFrame({"site": ["A", "B"], "jan": [3, 5], "feb": [4, 6]})\nlong = wide.melt(id_vars=["site"], var_name="month", value_name="sales")\nprint(long.shape)\nprint(long["month"].tolist())\nprint(long["sales"].tolist())',
        output: "(4, 3)\n['jan', 'jan', 'feb', 'feb']\n[3, 5, 4, 6]",
        explanation:
          'Two sites times two month columns give four rows of site, month and sales. All jan rows come first.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'import pandas as pd\nw = pd.DataFrame({"id": [1, 2, 3], "q1": [5, 6, 7], "q2": [1, 2, 3]})\nprint(w.melt(id_vars=["id"]).shape)',
          ['(3, 3)', '(6, 2)', '(3, 6)', '(6, 3)'],
          3,
          'Three ids times two melted columns give 6 rows: id, a variable column and a value column.',
        ),
        predictOutput(
          'What does this program print?',
          'import pandas as pd\nw = pd.DataFrame({"team": ["x", "y"], "home": [2, 0], "away": [1, 3]})\nl = w.melt(id_vars=["team"], var_name="venue", value_name="goals")\nprint(l["team"].tolist())',
          [
            "['x', 'x', 'y', 'y']",
            "['x', 'y']",
            "['x', 'y', 'x', 'y']",
            "['home', 'home', 'away', 'away']",
          ],
          2,
          'All home rows come first (x, y), then all away rows (x, y).',
        ),
        choose(
          'A wide table has a student id and 4 test columns for 50 students. How many rows does melting the test columns produce?',
          ['54', '50', '4', '200'],
          3,
          'Each of the 50 students contributes one row per test: 50 × 4.',
        ),
        choose(
          'In wide.melt(id_vars=["site"], ...), what is the role of site?',
          [
            'It is melted into the value column',
            'It is repeated on every long row, keeping each value attached to its site',
            'It is dropped from the result',
            'It becomes the new column names',
          ],
          1,
          'Identifier columns stay as columns and are copied to every measurement row.',
        ),
      ],
    },
    {
      title: 'Pivot long rows back to wide',
      explanation: [
        '.pivot(index="site", columns="month", values="sales") builds a wide table with one row per index value and one column per distinct value of the columns field, each cell taken from the matching long row. The new columns come out in sorted order.',
        'Read a cell with .loc[row_label, column_label]. A pair with no long row gets NaN, which also turns that column’s values into floats.',
      ],
      example: {
        code: 'import pandas as pd\nlong = pd.DataFrame({"site": ["A", "A", "B"], "month": ["jan", "feb", "jan"], "sales": [3, 4, 5]})\nwide = long.pivot(index="site", columns="month", values="sales")\nprint(wide.shape)\nprint(wide.loc["A", "feb"])\nprint(wide.loc["B", "feb"])',
        output: '(2, 2)\n4.0\nnan',
        explanation:
          'Two sites and two months give a 2 × 2 table. B has no feb row, so that cell is missing and the feb column holds floats.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'import pandas as pd\nl = pd.DataFrame({"day": ["mon", "mon", "tue", "tue"], "shift": ["am", "pm", "am", "pm"], "staff": [3, 5, 4, 6]})\nw = l.pivot(index="day", columns="shift", values="staff")\nprint(w.loc["tue", "am"])',
          ['5', '3', '6', '4'],
          3,
          'The cell for tue and am comes from the long row with staff 4.',
        ),
        predictOutput(
          'What does this program print?',
          'import pandas as pd\nl = pd.DataFrame({"day": ["mon", "mon", "tue", "tue"], "shift": ["am", "pm", "am", "pm"], "staff": [3, 5, 4, 6]})\nw = l.pivot(index="day", columns="shift", values="staff")\nprint(w.shape)',
          ['(4, 3)', '(2, 2)', '(2, 4)', '(4, 2)'],
          1,
          'Two days become rows and two shifts become columns.',
        ),
        predictOutput(
          'What does this program print?',
          'import pandas as pd\nl = pd.DataFrame({"k": ["a", "b"], "m": ["x", "y"], "v": [1, 2]})\nw = l.pivot(index="k", columns="m", values="v")\nprint(w.loc["a", "y"])',
          ['nan', '0', '1', '2'],
          0,
          'No long row has k = a and m = y, so that cell is missing.',
        ),
        choose(
          'After pivot(index="store", columns="week", values="sales"), what does one row of the wide table represent?',
          [
            'One week, with a column per store',
            'One sale',
            'One store, with a column per week',
            'One store and week pair',
          ],
          2,
          'The index field becomes the rows and the columns field becomes the columns.',
        ),
      ],
    },
    {
      title: 'Pivot needs one value per cell',
      explanation: [
        'pivot places exactly one value in each index and column cell. If two long rows share the same pair, there is no single value to place, so pivot raises ValueError rather than guessing.',
        'Check first with .duplicated(subset=["site", "month"]).sum(). Then resolve repeats deliberately: drop exact repeats, or investigate conflicting values. Do not average conflicting measurements just to make a reshape succeed.',
      ],
      example: {
        code: 'import pandas as pd\nlong = pd.DataFrame({"site": ["A", "A", "A"], "month": ["jan", "jan", "feb"], "sales": [3, 3, 4]})\nprint(long.duplicated(subset=["site", "month"]).sum())\nfixed = long.drop_duplicates()\nprint(fixed.pivot(index="site", columns="month", values="sales").loc["A", "jan"])',
        output: '1\n3',
        explanation:
          'A and jan appears twice, but both rows agree, so dropping the exact repeat is safe and pivot succeeds.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'import pandas as pd\nl = pd.DataFrame({"r": [1, 1, 2, 2], "c": ["x", "y", "x", "x"], "v": [5, 6, 7, 8]})\nprint(l.duplicated(subset=["r", "c"]).sum())',
          ['0', '2', '1', '3'],
          2,
          'Only the pair (2, x) appears twice, so pivot would fail on that cell.',
        ),
        choose(
          'pivot raises ValueError saying the index contains duplicate entries. What does it mean?',
          [
            'The value column holds text',
            'Some index and column pair has more than one value',
            'The index column has missing values',
            'The table is already wide',
          ],
          1,
          'One output cell would need two values, so pivot refuses.',
        ),
        choose(
          'Two long rows give different temperatures for station S3 at noon. Which response is sound before pivoting?',
          [
            'Investigate which reading is valid, then resolve it explicitly',
            'Average them so the pivot works',
            'Delete station S3 entirely',
            'Swap the index and columns fields',
          ],
          0,
          'Conflicting measurements need a decision based on evidence, not an automatic average.',
        ),
        predictOutput(
          'What does this program print?',
          'import pandas as pd\nw = pd.DataFrame({"id": ["p", "q"], "a": [1, 2], "b": [3, 4]})\nl = w.melt(id_vars=["id"], var_name="col", value_name="val")\nback = l.pivot(index="id", columns="col", values="val")\nprint(back.loc["q", "b"])',
          ['2', '3', 'nan', '4'],
          3,
          'Melting and pivoting reorganise values without changing them, so q and b still hold 4.',
        ),
      ],
    },
  ],

  'da-groupby': [
    {
      title: 'Total a column per group',
      explanation: [
        'table.groupby("site")["count"].sum() splits the rows by site, adds the count values within each group, and returns a Series with one value per group, labelled by the group keys in sorted order. Other reductions work the same way: .mean(), .max(), .min().',
        'groupby on its own only describes the groups; nothing is computed until you call a reduction.',
      ],
      example: {
        code: 'import pandas as pd\nvisits = pd.DataFrame({"site": ["B", "A", "B", "A", "B"], "count": [3, 4, 5, 2, 1]})\ntotals = visits.groupby("site")["count"].sum()\nprint(totals.to_dict())\nprint(visits.groupby("site")["count"].mean().to_dict())',
        output: "{'A': 6, 'B': 9}\n{'A': 3.0, 'B': 3.0}",
        explanation:
          'A’s rows hold 4 and 2; B’s hold 3, 5 and 1. The result lists A before B, sorted by key, not by first appearance.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'import pandas as pd\ndf = pd.DataFrame({"team": ["x", "y", "x"], "pts": [4, 7, 6]})\nprint(df.groupby("team")["pts"].sum().to_dict())',
          ["{'x': 4, 'y': 7}", '17', "{'x': 6, 'y': 7}", "{'x': 10, 'y': 7}"],
          3,
          'Team x’s two rows add to 10; team y has one row of 7.',
        ),
        predictOutput(
          'What does this program print?',
          'import pandas as pd\ndf = pd.DataFrame({"day": ["sat", "sun", "sat", "sun"], "temp": [20, 14, 24, 18]})\nprint(df.groupby("day")["temp"].max().to_dict())',
          [
            "{'sat': 24, 'sun': 18}",
            "{'sat': 44, 'sun': 32}",
            "{'sat': 20, 'sun': 14}",
            '24',
          ],
          0,
          'max is taken within each day’s rows.',
        ),
        predictOutput(
          'What does this program print?',
          'import pandas as pd\ndf = pd.DataFrame({"c": ["b", "a", "b"], "v": [1, 2, 3]})\nprint(df.groupby("c")["v"].sum().index.tolist())',
          ["['b', 'a']", "['b', 'a', 'b']", "['a', 'b']", '[0, 1]'],
          2,
          'Each distinct key appears once, and the keys are sorted.',
        ),
        choose(
          'sales has region and amount columns. Which expression gives the average amount per region?',
          [
            'sales.groupby("amount")["region"].mean()',
            'sales.groupby("region")["amount"].mean()',
            'sales["amount"].mean()',
            'sales.groupby("region")',
          ],
          1,
          'Group by the key, select the measured column, then reduce. groupby alone computes nothing.',
        ),
      ],
    },
    {
      title: 'Count rows or count values',
      explanation: [
        '.size() counts the rows in each group. .count() on a selected column counts that column’s non-missing values. They differ exactly when the column has missing entries: a group of 3 orders with 1 missing rating has size 3 and count 2.',
        'A grouped .mean() also skips missing values, so it averages over the count, not the size.',
      ],
      example: {
        code: 'import pandas as pd\nr = pd.DataFrame({"shop": ["A", "A", "A", "B"], "rating": [4.0, None, 5.0, 3.0]})\nprint(r.groupby("shop").size().to_dict())\nprint(r.groupby("shop")["rating"].count().to_dict())\nprint(r.groupby("shop")["rating"].mean().to_dict())',
        output: "{'A': 3, 'B': 1}\n{'A': 2, 'B': 1}\n{'A': 4.5, 'B': 3.0}",
        explanation:
          'Shop A has three rows but only two ratings, and its mean uses those two: (4 + 5) / 2.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'import pandas as pd\ndf = pd.DataFrame({"g": ["x", "x", "y"], "v": [None, 2.0, None]})\nprint(df.groupby("g").size().to_dict())\nprint(df.groupby("g")["v"].count().to_dict())',
          [
            "{'x': 1, 'y': 0}\n{'x': 2, 'y': 1}",
            "{'x': 2, 'y': 1}\n{'x': 2, 'y': 1}",
            "{'x': 2, 'y': 1}\n{'x': 1, 'y': 0}",
            "{'x': 1, 'y': 1}\n{'x': 1, 'y': 0}",
          ],
          2,
          'size counts rows (2 and 1); count counts present values (1 and 0).',
        ),
        predictOutput(
          'What does this program print?',
          'import pandas as pd\ndf = pd.DataFrame({"k": ["a", "a", "a"], "v": [6.0, None, 0.0]})\nprint(df.groupby("k")["v"].mean().to_dict())',
          ["{'a': 2.0}", "{'a': nan}", "{'a': 6.0}", "{'a': 3.0}"],
          3,
          'The missing value is skipped, so the mean is (6 + 0) / 2. The 0 is a real value and counts.',
        ),
        choose(
          'Each row is a support ticket, and resolution_hours is blank while a ticket is open. Which expression gives the number of tickets per agent, open or closed?',
          [
            't.groupby("agent")["resolution_hours"].count()',
            't.groupby("agent")["resolution_hours"].sum()',
            't.groupby("agent").size()',
            't["agent"].count()',
          ],
          2,
          'size counts every row; count on resolution_hours would skip the open tickets.',
        ),
        choose(
          'A group has size 50 but its score count is 12. What should you note before comparing its mean score with other groups?',
          [
            'The mean includes 38 zeros',
            'The mean rests on only 12 observed scores',
            'The group has 12 duplicate rows',
            'size and count always differ',
          ],
          1,
          'Missing scores are skipped, so the mean describes just 12 of the 50 rows.',
        ),
      ],
    },
    {
      title: 'Decide whether missing keys form a group',
      explanation: [
        'Rows whose grouping key is missing are left out of the groups by default, so their values disappear from every group total. groupby("site", dropna=False) keeps them as one more group, labelled NaN and listed last.',
        'Comparing the sum of the group totals with the overall total reveals excluded rows. Decide, and state in the report, whether those rows belong.',
      ],
      example: {
        code: 'import pandas as pd\nv = pd.DataFrame({"site": ["A", None, "A", "B"], "count": [3, 4, 5, 2]})\nprint(v.groupby("site")["count"].sum().sum())\nprint(v["count"].sum())\nprint(v.groupby("site", dropna=False)["count"].sum().tolist())',
        output: '10\n14\n[8, 2, 4]',
        explanation:
          'The row without a site (count 4) is missing from the grouped total of 10. With dropna=False it forms its own group after A and B.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'import pandas as pd\ndf = pd.DataFrame({"k": ["x", None, "x"], "v": [1, 5, 2]})\nprint(df.groupby("k")["v"].sum().to_dict())',
          ["{'x': 3, None: 5}", "{'x': 3}", "{'x': 8}", "{'x': 3, 'nan': 5}"],
          1,
          'By default the row with a missing key belongs to no group.',
        ),
        predictOutput(
          'What does this program print?',
          'import pandas as pd\ndf = pd.DataFrame({"k": ["x", None, "x"], "v": [1, 5, 2]})\nprint(len(df.groupby("k", dropna=False)["v"].sum()))',
          ['1', '3', '0', '2'],
          3,
          'dropna=False adds a group for the missing key next to x.',
        ),
        predictOutput(
          'What does this program print?',
          'import pandas as pd\ndf = pd.DataFrame({"team": ["r", None, None, "b"], "pts": [2, 3, 4, 1]})\nprint(df["pts"].sum() - df.groupby("team")["pts"].sum().sum())',
          ['7', '0', '3', '10'],
          0,
          'The overall total is 10 and the grouped totals add to 3, so 7 points sit in rows without a team.',
        ),
        choose(
          'A sales report grouped by region totals 9,200, but the raw amount column totals 10,000. What is the most likely cause?',
          [
            'groupby rounds each region’s amounts',
            'Some regions had no sales',
            'Rows with a missing region were left out of the groups',
            'The grouped sum counted some rows twice',
          ],
          2,
          'Missing keys are dropped by default, so their 800 never reaches any region.',
        ),
      ],
    },
  ],

  'da-aggregations': [
    {
      title: 'Name several summaries at once',
      explanation: [
        '.agg(total=("amount", "sum"), orders=("amount", "size")) computes several summaries per group. Each keyword names an output column, and its tuple gives the input column and the reduction. The result is a table with one row per group.',
        'Named outputs make the summary’s contract readable: anyone can see which column and operation produced each number.',
      ],
      example: {
        code: 'import pandas as pd\no = pd.DataFrame({"shop": ["A", "B", "A"], "amount": [10, 25, 30]})\ns = o.groupby("shop").agg(total=("amount", "sum"), biggest=("amount", "max"), orders=("amount", "size"))\nprint(s.columns.tolist())\nprint(s.loc["A"].tolist())',
        output: "['total', 'biggest', 'orders']\n[40, 30, 2]",
        explanation:
          'The keywords become the column names. Shop A’s amounts are 10 and 30: total 40, biggest 30, from 2 orders.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'import pandas as pd\ndf = pd.DataFrame({"g": ["x", "x", "y"], "v": [1, 5, 4]})\nr = df.groupby("g").agg(low=("v", "min"), high=("v", "max"))\nprint(r.loc["x"].tolist())',
          ['[1, 4]', '[5, 1]', '[6, 4]', '[1, 5]'],
          3,
          'Group x holds 1 and 5, and the columns are in the order low, high.',
        ),
        predictOutput(
          'What does this program print?',
          'import pandas as pd\ndf = pd.DataFrame({"g": ["x", "x", "y"], "v": [1, 5, 4]})\nr = df.groupby("g").agg(n=("v", "size"), avg=("v", "mean"))\nprint(r.columns.tolist())\nprint(r["avg"].tolist())',
          [
            "['v', 'v']\n[3.0, 4.0]",
            "['n', 'avg']\n[3.0, 4.0]",
            "['size', 'mean']\n[3.0, 4.0]",
            "['n', 'avg']\n[2.0, 4.0]",
          ],
          1,
          'The keywords name the columns. x averages (1 + 5) / 2 and y is 4.',
        ),
        choose(
          'In agg(revenue=("price", "sum")), which part names the column that appears in the result?',
          ['"price"', '"sum"', 'revenue', 'The group key'],
          2,
          'The keyword is the output name; the tuple gives the input column and reduction.',
        ),
        choose(
          'result is 1 for a win and 0 otherwise. Which call returns per-team columns named wins and games?',
          [
            't.groupby("team").agg(wins=("result", "sum"), games=("result", "size"))',
            't.groupby("team")["result"].sum()',
            't.groupby("result").agg(team=("wins", "sum"))',
            't.agg(wins=("team", "sum"), games=("team", "size"))',
          ],
          0,
          'Summing the 1s counts wins and size counts games, each named by its keyword.',
        ),
      ],
    },
    {
      title: 'Pick statistics that fit the question',
      explanation: [
        'The median is the middle value once the values are sorted, or the average of the two middle values when the count is even. Unlike the mean, it barely moves when one value is extreme, so a group with one huge order can have a high mean but an ordinary median.',
        'A sum grows with group size, and a mean of 2 rows is weaker evidence than a mean of 200. Report a count next to means and totals so readers can judge the support.',
      ],
      example: {
        code: 'import pandas as pd\no = pd.DataFrame({"shop": ["A", "A", "A", "B", "B"], "amount": [10, 12, 98, 20, 22]})\ns = o.groupby("shop").agg(mean=("amount", "mean"), median=("amount", "median"), n=("amount", "size"))\nprint(s["mean"].tolist())\nprint(s["median"].tolist())',
        output: '[40.0, 21.0]\n[12.0, 21.0]',
        explanation:
          'Shop A’s 98 pulls its mean to 40, while its median stays at the middle value 12. B has no extreme value, so both agree.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'import pandas as pd\ns = pd.Series([2, 4, 99])\nprint(s.median())\nprint(s.mean())',
          ['35.0\n4.0', '4.0\n4.0', '4.0\n35.0', '2.0\n35.0'],
          2,
          'The middle of 2, 4, 99 is 4; the mean is 105 / 3 = 35.',
        ),
        predictOutput(
          'What does this program print?',
          'import pandas as pd\nprint(pd.Series([9, 1, 5, 3]).median())',
          ['4.5', '3.0', '5.0', '4.0'],
          3,
          'Sorted, the values are 1, 3, 5, 9, so the median averages the middle two: 4.0. The mean would be 4.5.',
        ),
        predictOutput(
          'What does this program print?',
          'import pandas as pd\ndf = pd.DataFrame({"g": ["a", "a", "a", "b"], "v": [1, 2, 30, 5]})\nr = df.groupby("g").agg(med=("v", "median"), n=("v", "size"))\nprint(r["med"].tolist())',
          ['[2.0, 5.0]', '[11.0, 5.0]', '[1.0, 5.0]', '[30.0, 5.0]'],
          0,
          'Group a sorted is 1, 2, 30, so its median is 2; b has the single value 5.',
        ),
        choose(
          'Shop A’s mean order is 300 from 2 orders; shop B’s is 120 from 400 orders. Which statement is fair?',
          [
            'A clearly attracts bigger customers',
            'A’s mean rests on only 2 orders, so it is weak evidence',
            'B is failing',
            'Counts do not matter when comparing means',
          ],
          1,
          'Two orders cannot support a strong claim, which is why counts belong beside means.',
        ),
      ],
    },
    {
      title: 'Keep keys as columns and order the result',
      explanation: [
        'By default the group keys become the result’s index. groupby("shop", as_index=False) keeps them as an ordinary column instead, so the summary is a regular table that is easy to export or combine with others.',
        '.sort_values("total", ascending=False) orders the summary by a measure, largest first. Sorting changes only the presentation, not the groups.',
      ],
      example: {
        code: 'import pandas as pd\no = pd.DataFrame({"shop": ["A", "B", "C", "B"], "amount": [5, 7, 9, 4]})\ns = o.groupby("shop", as_index=False).agg(total=("amount", "sum"))\nprint(s.columns.tolist())\nprint(s.sort_values("total", ascending=False)["shop"].tolist())',
        output: "['shop', 'total']\n['B', 'C', 'A']",
        explanation:
          'shop stays a column next to total. Sorting by total, descending, puts B (11) before C (9) and A (5).',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'import pandas as pd\ndf = pd.DataFrame({"k": ["p", "q", "p"], "v": [1, 2, 3]})\nr = df.groupby("k", as_index=False).agg(s=("v", "sum"))\nprint(r.to_dict("list"))',
          [
            "{'s': [4, 2]}",
            "{'k': ['p', 'q'], 's': [4, 2]}",
            "{'k': ['p', 'q', 'p'], 's': [1, 2, 3]}",
            "{'k': ['p', 'q'], 's': [1, 2]}",
          ],
          1,
          'as_index=False keeps k as a column beside the summary.',
        ),
        predictOutput(
          'What does this program print?',
          'import pandas as pd\ndf = pd.DataFrame({"k": ["p", "q", "p"], "v": [1, 2, 3]})\nr = df.groupby("k").agg(s=("v", "sum"))\nprint(r.columns.tolist())\nprint(r.index.tolist())',
          [
            "['k', 's']\n[0, 1]",
            "['s']\n[0, 1]",
            "['k', 's']\n['p', 'q']",
            "['s']\n['p', 'q']",
          ],
          3,
          'By default the keys move into the index, leaving s as the only column.',
        ),
        predictOutput(
          'What does this program print?',
          'import pandas as pd\ndf = pd.DataFrame({"city": ["x", "y", "z", "x"], "n": [1, 8, 3, 1]})\nr = df.groupby("city", as_index=False).agg(total=("n", "sum"))\nprint(r.sort_values("total", ascending=False)["city"].tolist())',
          [
            "['x', 'y', 'z']",
            "['x', 'z', 'y']",
            "['y', 'z', 'x']",
            "['z', 'y', 'x']",
          ],
          2,
          'Totals are x 2, y 8 and z 3, so descending order is y, z, x.',
        ),
        choose(
          'You will export a per-store summary to CSV, and a colleague expects a store column in the file. Which option helps?',
          ['as_index=False', 'dropna=False', 'ascending=False', 'keep="last"'],
          0,
          'With as_index=False the store keys stay an ordinary column of the table.',
        ),
      ],
    },
  ],

  'da-transforms': [
    {
      title: 'Repeat a group result on every row',
      explanation: [
        'A grouped reduction returns one value per group. .transform("mean") computes the same group summary but returns it once for every original row, aligned with the table’s index, so it can be stored as a new column.',
        'Any reduction name works: transform("sum"), transform("max"), transform("size").',
      ],
      example: {
        code: 'import pandas as pd\ns = pd.DataFrame({"team": ["A", "B", "A", "B"], "score": [2, 9, 6, 5]})\nprint(s.groupby("team")["score"].mean().tolist())\ns["team_mean"] = s.groupby("team")["score"].transform("mean")\nprint(s["team_mean"].tolist())',
        output: '[4.0, 7.0]\n[4.0, 7.0, 4.0, 7.0]',
        explanation:
          'mean gives one value per team; transform repeats each team’s value on that team’s rows, in the original row order.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'import pandas as pd\ndf = pd.DataFrame({"g": ["x", "y", "x"], "v": [1, 10, 3]})\nprint(df.groupby("g")["v"].transform("sum").tolist())',
          ['[4, 10]', '[1, 10, 3]', '[14, 14, 14]', '[4, 10, 4]'],
          3,
          'Each row receives its own group’s total: x rows get 4, the y row gets 10.',
        ),
        predictOutput(
          'What does this program print?',
          'import pandas as pd\ndf = pd.DataFrame({"g": ["x", "y", "x"], "v": [1, 10, 3]})\nprint(len(df.groupby("g")["v"].sum()))\nprint(len(df.groupby("g")["v"].transform("sum")))',
          ['3\n2', '2\n3', '2\n2', '3\n3'],
          1,
          'The reduction has one value per group; transform has one per row.',
        ),
        predictOutput(
          'What does this program print?',
          'import pandas as pd\ndf = pd.DataFrame({"k": ["a", "a", "b"], "v": [5, 1, 7]})\ndf["top"] = df.groupby("k")["v"].transform("max")\nprint(df["top"].tolist())',
          ['[5, 7]', '[5, 1, 7]', '[5, 5, 7]', '[7, 7, 7]'],
          2,
          'Both a rows get a’s maximum 5, and the b row gets 7.',
        ),
        choose(
          'Why use transform rather than mean() when adding each row’s group mean as a column?',
          [
            'mean() cannot follow groupby',
            'transform is always faster',
            'transform removes missing values',
            'transform returns one value per row, matching the table',
          ],
          3,
          'A column needs one value per row; the grouped mean has only one per group.',
        ),
      ],
    },
    {
      title: 'Compare each row with its own group',
      explanation: [
        'With the group value on every row, ordinary column arithmetic compares each observation with its own group. value minus group mean is a centered value: positive means above its group’s mean, which is not the same as above the overall mean.',
        'Because transform keeps the original index, the subtraction lines up row by row automatically.',
      ],
      example: {
        code: 'import pandas as pd\ns = pd.DataFrame({"class": ["A", "A", "B", "B"], "score": [60, 80, 85, 95]})\ncentered = s["score"] - s.groupby("class")["score"].transform("mean")\nprint(centered.tolist())\nprint((s["score"] - s["score"].mean()).tolist())',
        output: '[-10.0, 10.0, -5.0, 5.0]\n[-20.0, 0.0, 5.0, 15.0]',
        explanation:
          'Class means are 70 and 90. The 85 is below its class mean but above the overall mean of 80.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'import pandas as pd\ndf = pd.DataFrame({"g": ["x", "x", "y", "y"], "v": [2, 4, 10, 30]})\nprint((df["v"] - df.groupby("g")["v"].transform("mean")).tolist())',
          [
            '[-9.5, -7.5, -1.5, 18.5]',
            '[3.0, 3.0, 20.0, 20.0]',
            '[-1.0, 1.0, -10.0, 10.0]',
            '[-1.0, 1.0]',
          ],
          2,
          'Group means are 3 and 20, so each row differs from its own mean by 1 or 10.',
        ),
        choose(
          'A student’s centered score is +5 within class B. What does that tell you?',
          [
            'They scored 5 above every other student',
            'They scored 5 above the school mean',
            'Class B’s mean is 5',
            'They scored 5 above class B’s mean',
          ],
          3,
          'The reference point is the student’s own class mean.',
        ),
        predictOutput(
          'What does this program print?',
          'import pandas as pd\ndf = pd.DataFrame({"store": ["s1", "s2", "s1"], "sales": [100, 40, 60]})\ndf["gap"] = df["sales"] - df.groupby("store")["sales"].transform("max")\nprint(df["gap"].tolist())',
          ['[0, -60, -40]', '[0, 0, -40]', '[-100, -40, -60]', '[0, 60, 40]'],
          1,
          's1’s best is 100 and s2’s is 40, so only the 60 falls short of its store’s maximum.',
        ),
        choose(
          'Two runners in different age groups both have centered times of −3 minutes. Which conclusion is justified?',
          [
            'They ran equally fast in absolute terms',
            'Both beat the overall mean by 3 minutes',
            'Each was 3 minutes faster than their own group’s mean',
            'Their groups have the same mean time',
          ],
          2,
          'Centering compares each runner with their own group, not with each other.',
        ),
      ],
    },
    {
      title: 'Compute shares within a group',
      explanation: [
        'A share is a row’s value divided by its group total: value / transform("sum"). The shares in each group add up to 1, which makes groups of different sizes comparable.',
        'A group whose total is 0 has no meaningful shares: 0 / 0 gives NaN. Decide how to report such groups before publishing.',
      ],
      example: {
        code: 'import pandas as pd\nd = pd.DataFrame({"region": ["N", "N", "S", "S"], "units": [30, 10, 0, 0]})\nshare = d["units"] / d.groupby("region")["units"].transform("sum")\nprint(share.tolist())',
        output: '[0.75, 0.25, nan, nan]',
        explanation:
          'Region N’s total is 40, so its rows hold 75% and 25%. Region S sold nothing, so its shares are undefined.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'import pandas as pd\ndf = pd.DataFrame({"g": ["a", "a", "b"], "v": [1, 3, 5]})\nprint((df["v"] / df.groupby("g")["v"].transform("sum")).tolist())',
          [
            '[1.0, 3.0, 5.0]',
            '[0.25, 0.75]',
            '[0.5, 0.5, 1.0]',
            '[0.25, 0.75, 1.0]',
          ],
          3,
          'Group a totals 4, so its rows are 1/4 and 3/4; group b’s only row is all of its total.',
        ),
        predictOutput(
          'What does this program print?',
          'import pandas as pd\ndf = pd.DataFrame({"team": ["x", "x", "x"], "goals": [2, 2, 4]})\nshare = df["goals"] / df.groupby("team")["goals"].transform("sum")\nprint(share.sum())',
          ['8', '3.0', '1.0', '0.5'],
          2,
          'Shares within one group always add up to 1.',
        ),
        choose(
          'A shop’s share of its region’s sales is 0.4. What does that mean?',
          [
            'Its sales grew by 40%',
            'It made 40% of its region’s sales',
            'It made 40% of all sales',
            'Its region has 0.4 shops',
          ],
          1,
          'The denominator is the region’s total, not the overall total.',
        ),
        choose(
          'One region sold nothing this week, so its total is 0. What happens to its rows’ shares?',
          [
            'They become 0, which is accurate',
            'They become 1',
            'pandas raises ZeroDivisionError',
            'They become NaN, so the report needs a rule for that region',
          ],
          3,
          '0 / 0 is undefined, which pandas shows as NaN rather than raising an error.',
        ),
      ],
    },
  ],

  'da-window': [
    {
      title: 'Average a trailing window',
      explanation: [
        'values.rolling(3).mean() gives, at each row, the mean of that row and the two rows before it, in row order. Each row gets its own local reference, unlike a group mean that one value describes a whole group. .rolling(3).sum() and .rolling(3).max() work the same way.',
        'The first two rows do not have three rows to use yet, so their results are missing.',
      ],
      example: {
        code: 'import pandas as pd\ntemps = pd.Series([10, 12, 17, 13, 18])\nprint(temps.rolling(3).mean().tolist())',
        output: '[nan, nan, 13.0, 14.0, 16.0]',
        explanation:
          'Row 2 averages 10, 12, 17; row 3 averages 12, 17, 13; row 4 averages 17, 13, 18.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'import pandas as pd\ns = pd.Series([2, 4, 6, 8])\nprint(s.rolling(2).mean().tolist())',
          [
            '[3.0, 5.0, 7.0]',
            '[3.0, 5.0, 7.0, nan]',
            '[2.0, 3.0, 5.0, 7.0]',
            '[nan, 3.0, 5.0, 7.0]',
          ],
          3,
          'Each result uses the row and the one before; row 0 has no earlier row, so it is missing.',
        ),
        predictOutput(
          'What does this program print?',
          'import pandas as pd\ns = pd.Series([1, 5, 2, 8, 3])\nprint(s.rolling(3).max().tolist())',
          [
            '[nan, nan, 5.0, 8.0, 8.0]',
            '[5.0, 8.0, 8.0]',
            '[nan, nan, 8.0, 8.0, 8.0]',
            '[1.0, 5.0, 5.0, 8.0, 8.0]',
          ],
          0,
          'The windows are (1, 5, 2), (5, 2, 8) and (2, 8, 3), and the result keeps one entry per row.',
        ),
        predictOutput(
          'What does this program print?',
          'import pandas as pd\ns = pd.Series([3, 3, 9, 0])\nprint(s.rolling(3).sum().iloc[3])',
          ['15.0', '9.0', '12.0', 'nan'],
          2,
          'Row 3’s window holds rows 1 to 3: 3 + 9 + 0.',
        ),
        choose(
          'In rolling(4).mean(), which rows does the result at row 10 use?',
          [
            'Rows 10, 11, 12 and 13',
            'Rows 7, 8, 9 and 10',
            'Rows 8 to 12',
            'Every row from 0 to 10',
          ],
          1,
          'A default window trails: the current row and the three before it.',
        ),
      ],
    },
    {
      title: 'Control incomplete windows with min_periods',
      explanation: [
        'By default a window needs all its rows, so the first window − 1 results are NaN. min_periods sets how many rows are enough: with min_periods=1, the first result is just the first value, the second averages two values, and so on.',
        'That fills the gap but changes the evidence: early results rest on fewer observations than later ones. Choose min_periods deliberately and say so when reporting.',
      ],
      example: {
        code: 'import pandas as pd\ns = pd.Series([3, 9, 6, 12])\nprint(s.rolling(3).mean().fillna(-1).tolist())\nprint(s.rolling(3, min_periods=1).mean().tolist())\nprint(s.rolling(3, min_periods=2).mean().fillna(-1).tolist())',
        output:
          '[-1.0, -1.0, 6.0, 9.0]\n[3.0, 6.0, 6.0, 9.0]\n[-1.0, 6.0, 6.0, 9.0]',
        explanation:
          'The full windows give 6 and 9. min_periods=1 also accepts one and two rows; min_periods=2 accepts two rows but not one. The -1 only makes missing entries visible.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'import pandas as pd\ns = pd.Series([10, 20, 30])\nprint(s.rolling(2, min_periods=1).mean().tolist())',
          [
            '[nan, 15.0, 25.0]',
            '[15.0, 25.0]',
            '[10.0, 15.0, 25.0]',
            '[5.0, 15.0, 25.0]',
          ],
          2,
          'The first window holds only 10, and min_periods=1 accepts it; its mean is 10, not 10 / 2.',
        ),
        predictOutput(
          'What does this program print?',
          'import pandas as pd\ns = pd.Series([1, 2, 3, 4, 5])\nprint(s.rolling(4).sum().isna().sum())',
          ['4', '1', '0', '3'],
          3,
          'A full window of 4 first exists at row 3, so rows 0, 1 and 2 are missing.',
        ),
        predictOutput(
          'What does this program print?',
          'import pandas as pd\ns = pd.Series([6, 2, 4])\nprint(s.rolling(3, min_periods=2).mean().fillna(0).tolist())',
          [
            '[6.0, 4.0, 4.0]',
            '[0.0, 4.0, 4.0]',
            '[0.0, 0.0, 4.0]',
            '[0.0, 2.0, 4.0]',
          ],
          1,
          'Row 0 has one value, fewer than 2, so it is missing; row 1 averages 6 and 2.',
        ),
        choose(
          'A 7-day rolling average uses min_periods=1. What is true of the value on day 2?',
          [
            'It averages only 2 days, so it rests on less evidence than later values',
            'It averages 7 days like every other value',
            'It is missing',
            'It equals the day-2 value exactly',
          ],
          0,
          'With min_periods=1, early windows contain only the days seen so far.',
        ),
      ],
    },
    {
      title: 'Put rows in time order first',
      explanation: [
        'rolling follows row order, not dates. If the rows are out of time order, “the previous rows” mixes unrelated days. Sort by the time column first, for example t.sort_values("day"), then roll.',
        'A three-row window is three observations, not three days; with gaps it can span a week. A centered window (center=True) also uses later rows, which a prediction made at that moment could not have known.',
      ],
      example: {
        code: 'import pandas as pd\nt = pd.DataFrame({"day": [3, 1, 2, 4], "sales": [9, 1, 5, 7]})\nprint(t["sales"].rolling(2).sum().tolist())\nordered = t.sort_values("day")\nprint(ordered["sales"].rolling(2).sum().tolist())',
        output: '[nan, 10.0, 6.0, 12.0]\n[nan, 6.0, 14.0, 16.0]',
        explanation:
          'Unsorted, the second sum pairs day 3 with day 1. After sorting, each window pairs consecutive days: 1 + 5, 5 + 9, 9 + 7.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'import pandas as pd\nt = pd.DataFrame({"week": [2, 1, 3], "n": [4, 10, 6]})\nprint(t.sort_values("week")["n"].rolling(2).mean().tolist())',
          [
            '[nan, 7.0, 8.0]',
            '[nan, 7.0, 5.0]',
            '[nan, 5.0, 7.0]',
            '[7.0, 5.0]',
          ],
          1,
          'In week order the values are 10, 4, 6, so the means are 7 and 5.',
        ),
        predictOutput(
          'The rows are not sorted by day. What does this program print?',
          'import pandas as pd\nt = pd.DataFrame({"day": [2, 3, 1], "v": [5, 0, 10]})\nprint(t["v"].rolling(2).sum().tolist())',
          [
            '[nan, 15.0, 5.0]',
            '[5.0, 10.0]',
            '[nan, 10.0, 15.0]',
            '[nan, 5.0, 10.0]',
          ],
          3,
          'rolling uses row order as given: 5 + 0, then 0 + 10. Sorting by day first would give 15 and 5.',
        ),
        choose(
          'Readings arrive at 09:00, 09:05 and 13:00. What does a 3-row rolling mean at 13:00 cover?',
          [
            'Exactly the last three hours',
            'Three readings from the same minute',
            'The last three readings, spanning four hours',
            'Every reading of the day',
          ],
          2,
          'A row-based window counts observations, whatever time they span.',
        ),
        choose(
          'Why is a centered rolling mean unfair as a feature for predicting tomorrow’s demand?',
          [
            'It ignores the current value',
            'It uses values from after the prediction time',
            'It requires text data',
            'It always returns NaN',
          ],
          1,
          'A centered window includes later rows, which would not exist when the prediction is made.',
        ),
      ],
    },
  ],

  'da-datetime': [
    {
      title: 'Parse dates with a declared format',
      explanation: [
        'pd.to_datetime(text, format="%d/%m/%Y") turns strings into timestamps using codes: %d is the day, %m the month and %Y the four-digit year. The text 03/04/2024 is 3 April with %d/%m/%Y but 4 March with %m/%d/%Y, so declare the format instead of letting pandas guess.',
        'Parsed values have a .dt accessor: .dt.year, .dt.month, .dt.day, .dt.hour, and .dt.strftime("%Y-%m-%d") to format them as text. A string that does not fit the format, or names an impossible date, raises an error.',
      ],
      example: {
        code: 'import pandas as pd\nraw = pd.Series(["03/04/2024", "25/12/2024"])\ndates = pd.to_datetime(raw, format="%d/%m/%Y")\nprint(dates.dt.month.tolist())\nprint(dates.dt.strftime("%Y-%m-%d").tolist())',
        output: "[4, 12]\n['2024-04-03', '2024-12-25']",
        explanation:
          'The declared format reads the first number as the day, so 03/04 is in April.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'import pandas as pd\nd = pd.to_datetime(pd.Series(["05/06/2024"]), format="%m/%d/%Y")\nprint(d.dt.month.tolist())\nprint(d.dt.day.tolist())',
          ['[6]\n[5]', '[5]\n[5]', '[2024]\n[6]', '[5]\n[6]'],
          3,
          'With %m first, 05 is the month and 06 the day.',
        ),
        predictOutput(
          'What does this program print?',
          'import pandas as pd\nd = pd.to_datetime(pd.Series(["2024-02-29", "2023-11-05"]), format="%Y-%m-%d")\nprint(d.dt.strftime("%d/%m/%Y").tolist())',
          [
            "['29/02/2024', '05/11/2023']",
            "['02/29/2024', '11/05/2023']",
            "['2024-02-29', '2023-11-05']",
            "['29/02/2024', '11/05/2023']",
          ],
          0,
          'strftime writes the day, then the month, then the year, as its format string says.',
        ),
        choose(
          'A UK supplier writes 07/08/2024 for 7 August. Which format parses it correctly?',
          ['"%m/%d/%Y"', '"%Y/%m/%d"', '"%d/%m/%Y"', '"%d/%Y/%m"'],
          2,
          'The day comes first, then the month, then the year.',
        ),
        choose(
          'pd.to_datetime(pd.Series(["31/02/2024"]), format="%d/%m/%Y") is called. What happens?',
          [
            'It returns 2 March 2024',
            'It raises an error because 31 February does not exist',
            'It returns 29 February 2024',
            'It swaps the day and month',
          ],
          1,
          'Parsing validates the date, and by default an invalid one raises an error.',
        ),
      ],
    },
    {
      title: 'Normalise offsets to UTC',
      explanation: [
        'A timestamp such as 2024-01-02T00:30:00+02:00 carries an offset: that clock reading is 2 hours ahead of UTC, so the same instant is 2024-01-01 22:30 in UTC. Subtract the offset to get UTC.',
        'pd.to_datetime(values, utc=True) converts every value to UTC, so comparisons and sorting use real instants. Sorting the original text instead sorts characters, which can put a later instant first.',
      ],
      example: {
        code: 'import pandas as pd\nraw = pd.Series(["2024-01-02T00:30:00+02:00", "2024-01-01T23:30:00+00:00"])\ntimes = pd.to_datetime(raw, utc=True)\nprint(times.dt.strftime("%Y-%m-%d %H:%M").tolist())\nprint(times.iloc[0] < times.iloc[1])',
        output: "['2024-01-01 22:30', '2024-01-01 23:30']\nTrue",
        explanation:
          'The first text shows a later date, but in UTC it happened an hour before the second.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'import pandas as pd\nt = pd.to_datetime(pd.Series(["2024-05-01T09:00:00+03:00"]), utc=True)\nprint(t.dt.hour.tolist())',
          ['[9]', '[12]', '[6]', '[3]'],
          2,
          '09:00 at UTC+3 is 3 hours ahead of UTC, so the UTC hour is 6.',
        ),
        predictOutput(
          'What does this program print?',
          'import pandas as pd\nt = pd.to_datetime(pd.Series(["2024-05-01T01:00:00+05:00"]), utc=True)\nprint(t.dt.strftime("%Y-%m-%d %H:%M").tolist())',
          [
            "['2024-05-01 06:00']",
            "['2024-05-01 01:00']",
            "['2024-05-01 20:00']",
            "['2024-04-30 20:00']",
          ],
          3,
          'Subtracting 5 hours from 01:00 crosses midnight into the previous day.',
        ),
        predictOutput(
          'What does this program print?',
          'import pandas as pd\nraw = pd.Series(["2024-03-01T10:00:00-05:00", "2024-03-01T12:00:00+00:00"])\nt = pd.to_datetime(raw, utc=True)\nprint(t.dt.hour.tolist())',
          ['[15, 12]', '[10, 12]', '[5, 12]', '[12, 15]'],
          0,
          'A negative offset means behind UTC, so 10:00−05:00 is 15:00 UTC.',
        ),
        choose(
          'Event A is at 10:00+02:00 and event B at 09:30+00:00 on the same date. Which happened first?',
          [
            'B, at 09:30 UTC',
            'A, at 08:00 UTC',
            'They happened at the same instant',
            'A, because its offset is larger',
          ],
          1,
          'A is 08:00 in UTC, which is earlier than B’s 09:30.',
        ),
      ],
    },
    {
      title: 'Know what utc=True assumes',
      explanation: [
        'A naive timestamp such as 2024-01-01 23:30 has no offset. utc=True does not discover where it was recorded; it simply declares it to be UTC. If the source clock showed local time, every instant is now off by the local offset.',
        'Calendar dates depend on the zone: 23:30 UTC on 1 January is already 2 January in Tokyo (UTC+9). Choose the reporting zone before extracting dates or grouping by day.',
      ],
      example: {
        code: 'import pandas as pd\nnaive = pd.to_datetime(pd.Series(["2024-01-01 23:30"]), utc=True)\naware = pd.to_datetime(pd.Series(["2024-01-01 23:30+09:00"]), utc=True)\nprint(naive.dt.strftime("%H:%M").tolist())\nprint(aware.dt.strftime("%Y-%m-%d %H:%M").tolist())',
        output: "['23:30']\n['2024-01-01 14:30']",
        explanation:
          'The naive value keeps its clock reading and is simply labelled UTC. The value with an offset is converted, moving 9 hours earlier.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'import pandas as pd\nt = pd.to_datetime(pd.Series(["2024-06-01 08:00"]), utc=True)\nprint(t.dt.hour.tolist())',
          ['[6]', '[10]', '[8]', '[0]'],
          2,
          'Without an offset, the clock reading is taken as UTC unchanged.',
        ),
        predictOutput(
          'What does this program print?',
          'import pandas as pd\nt = pd.to_datetime(pd.Series(["2024-12-31T22:00:00-03:00"]), utc=True)\nprint(t.dt.strftime("%Y-%m-%d").tolist())',
          [
            "['2024-12-31']",
            "['2024-12-30']",
            "['2025-12-31']",
            "['2025-01-01']",
          ],
          3,
          '22:00 at UTC−3 is 01:00 UTC the next day, which is in a new year.',
        ),
        choose(
          'A log written in New York local time (UTC−5) has naive timestamps, and you parse them with utc=True. What is wrong with the result?',
          [
            'Each instant is labelled 5 hours earlier than it really happened',
            'Nothing, because pandas detects the zone',
            'Each instant is labelled 5 hours later than it really happened',
            'The dates become missing',
          ],
          0,
          '10:00 in New York is really 15:00 UTC, but the naive 10:00 was labelled 10:00 UTC.',
        ),
        choose(
          'A café in Lima (UTC−5) wants sales per local business day from UTC timestamps. What must happen before extracting the date?',
          [
            'Nothing, because UTC dates equal local dates',
            'Convert the timestamps to Lima time',
            'Drop every sale after 19:00',
            'Sort the timestamps',
          ],
          1,
          'Sales after 19:00 Lima time fall on the next UTC date, so dates must come from local time.',
        ),
      ],
    },
  ],

  'da-resampling': [
    {
      title: 'Group by calendar intervals with resample',
      explanation: [
        'With timestamps as the index, series.resample("D").sum() groups observations into calendar days and sums each day. Other frequencies include "h" for hours, "W" for weeks and "MS" for calendar months. For a table, name the timestamp column: table.resample("D", on="time")["amount"].sum().',
        'Frequency and reduction are separate choices: daily sums answer “how much in total?”, daily means answer “how large on average?”.',
      ],
      example: {
        code: 'import pandas as pd\ntimes = pd.to_datetime(["2024-01-01 08:00", "2024-01-01 18:00", "2024-01-02 09:00"])\nsales = pd.Series([2, 5, 4], index=times)\ndaily = sales.resample("D").sum()\nprint(daily.tolist())\nprint(daily.index.strftime("%m-%d").tolist())',
        output: "[7, 4]\n['01-01', '01-02']",
        explanation:
          'The two January 1 readings share a bin and add to 7; January 2 has one reading. Each bin is labelled by its day.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'import pandas as pd\ntimes = pd.to_datetime(["2024-03-01 01:00", "2024-03-01 23:00", "2024-03-02 12:00", "2024-03-02 13:00"])\ns = pd.Series([1, 2, 3, 4], index=times)\nprint(s.resample("D").sum().tolist())',
          ['[1, 2, 3, 4]', '[10]', '[3, 3, 4]', '[3, 7]'],
          3,
          'Both March 1 readings fall in one day (1 + 2) and both March 2 readings in the next (3 + 4).',
        ),
        predictOutput(
          'What does this program print?',
          'import pandas as pd\ntimes = pd.to_datetime(["2024-01-01 09:15", "2024-01-01 09:45", "2024-01-01 10:05"])\ns = pd.Series([5, 1, 2], index=times)\nprint(s.resample("h").sum().tolist())',
          ['[5, 1, 2]', '[6, 2]', '[8]', '[5, 3]'],
          1,
          'The 9 o’clock hour holds 5 and 1; the 10 o’clock hour holds 2.',
        ),
        predictOutput(
          'What does this program print?',
          'import pandas as pd\nt = pd.DataFrame({"time": pd.to_datetime(["2024-05-01 10:00", "2024-05-01 11:00", "2024-05-02 10:00"]), "n": [1, 1, 5]})\nprint(t.resample("D", on="time")["n"].mean().tolist())',
          [
            '[1.0, 5.0]',
            '[2.0, 5.0]',
            '[1.0, 1.0, 5.0]',
            '[2.3333333333333335]',
          ],
          0,
          'May 1 averages its two readings of 1; May 2 has the single reading 5.',
        ),
        choose(
          'A table has a time column and an amount column. Which expression gives the total amount per calendar day?',
          [
            't.groupby("amount")["time"].sum()',
            't.resample("amount").sum()',
            't.resample("D", on="time")["amount"].sum()',
            't["amount"].rolling(1).sum()',
          ],
          2,
          'resample with on= bins rows by the time column; the reduction then sums each day.',
        ),
      ],
    },
    {
      title: 'Tell an empty interval from a measured zero',
      explanation: [
        'resample creates every interval from the first observation to the last, including days with no rows. .sum() on an empty interval returns 0, which reads as “nothing happened”. sum(min_count=1) requires at least one value and returns NaN instead; .mean() already gives NaN there, and .count() gives 0.',
        'A missing interval is not proof of zero activity: an outage may have stopped data collection. Keep empty bins visible until you know which it is.',
      ],
      example: {
        code: 'import pandas as pd\ntimes = pd.to_datetime(["2024-01-01 08:00", "2024-01-03 09:00"])\nv = pd.Series([2, 4], index=times)\nprint(v.resample("D").sum().tolist())\nprint(v.resample("D").sum(min_count=1).tolist())\nprint(v.resample("D").count().tolist())',
        output: '[2, 0, 4]\n[2.0, nan, 4.0]\n[1, 0, 1]',
        explanation:
          'January 2 has no rows. Plain sum reports 0, min_count=1 reports it as missing, and count shows it had no observations.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'import pandas as pd\ntimes = pd.to_datetime(["2024-02-01", "2024-02-04"])\nv = pd.Series([3, 6], index=times)\nprint(len(v.resample("D").sum()))',
          ['2', '3', '1', '4'],
          3,
          'Bins run from February 1 to February 4, including the two empty days between.',
        ),
        predictOutput(
          'What does this program print?',
          'import pandas as pd\ntimes = pd.to_datetime(["2024-02-01", "2024-02-04"])\nv = pd.Series([3, 6], index=times)\nprint(v.resample("D").sum(min_count=1).isna().sum())',
          ['0', '1', '2', '4'],
          2,
          'February 2 and 3 have no values, so with min_count=1 both are missing.',
        ),
        predictOutput(
          'What does this program print?',
          'import pandas as pd\ntimes = pd.to_datetime(["2024-02-01 10:00", "2024-02-03 10:00"])\nv = pd.Series([5, 1], index=times)\nprint(v.resample("D").mean().tolist())',
          [
            '[5.0, nan, 1.0]',
            '[5.0, 0.0, 1.0]',
            '[5.0, 1.0]',
            '[3.0, 3.0, 3.0]',
          ],
          0,
          'An empty day has no values to average, so its mean is missing.',
        ),
        choose(
          'A daily rainfall series has no rows for 3 May because the gauge was offline. Which aggregation keeps that day honest?',
          [
            'resample("D").sum()',
            'resample("D").sum(min_count=1)',
            'resample("D").count()',
            'Dropping 3 May before resampling',
          ],
          1,
          'min_count=1 leaves the offline day missing instead of reporting 0 mm of rain.',
        ),
      ],
    },
    {
      title: 'Bin days in the reporting zone',
      explanation: [
        'Daily bins start at midnight in the timestamps’ own zone. Timestamps parsed with a shared offset, such as -05:00, and without utc=True keep that local zone; with utc=True the same instants are binned by UTC midnight.',
        'Midnight UTC is 19:00 the previous evening at UTC−5, so evening sales can land on different days. Convert to the business’s reporting zone before resampling, and state the zone in the report.',
      ],
      example: {
        code: 'import pandas as pd\nraw = ["2024-03-01T20:00:00-05:00", "2024-03-01T22:00:00-05:00", "2024-03-02T09:00:00-05:00"]\nlocal = pd.Series([1, 1, 1], index=pd.to_datetime(raw))\nutc = pd.Series([1, 1, 1], index=pd.to_datetime(raw, utc=True))\nprint(local.resample("D").sum().tolist())\nprint(utc.resample("D").sum().tolist())',
        output: '[2, 1]\n[3]',
        explanation:
          'In local time, two sales are on March 1 and one on March 2. In UTC, all three are on March 2, because 20:00−05:00 is already 01:00 UTC.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'import pandas as pd\nraw = ["2024-07-01T23:00:00+00:00", "2024-07-02T01:00:00+00:00"]\nv = pd.Series([4, 6], index=pd.to_datetime(raw))\nprint(v.resample("D").sum().tolist())',
          ['[10]', '[4, 6]', '[6, 4]', '[4, 0, 6]'],
          1,
          'In UTC the readings are on July 1 and July 2, one per day.',
        ),
        predictOutput(
          'What does this program print?',
          'import pandas as pd\nraw = ["2024-07-01T23:00:00+00:00", "2024-07-02T01:00:00+00:00"]\nv = pd.Series([4, 6], index=pd.to_datetime(raw))\nlocal = pd.Series([4, 6], index=pd.to_datetime(["2024-07-02T08:00:00+09:00", "2024-07-02T10:00:00+09:00"]))\nprint(local.resample("D").sum().tolist())',
          ['[4, 6]', '[6, 4]', '[10]', '[4, 0, 6]'],
          2,
          'At UTC+9 the same two instants are 08:00 and 10:00 on July 2, so they share one day.',
        ),
        choose(
          'A Tokyo shop (UTC+9) makes a sale at 08:00 local time on 5 June, which is 23:00 UTC on 4 June. Which day does a report binned by UTC days put it in?',
          ['5 June', '4 June', '6 June', 'Neither; it is dropped'],
          1,
          'UTC bins use UTC midnight, and the sale happened before it.',
        ),
        choose(
          'When should timestamps be converted to the business’s zone in a daily report?',
          [
            'After resampling into days',
            'Only for weekly reports',
            'Before resampling into days',
            'Never, because days are the same everywhere',
          ],
          2,
          'The bins’ midnight boundaries come from the zone the timestamps are in at resampling time.',
        ),
      ],
    },
  ],

  'da-exploration': [
    {
      title: 'Count categories with value_counts',
      explanation: [
        'value_counts() counts each distinct value and lists them from most to least frequent. normalize=True returns proportions instead of counts. Missing values are left out unless you pass dropna=False.',
        'Check counts before comparing groups: a category with 3 rows cannot support the same conclusions as one with 300.',
      ],
      example: {
        code: 'import pandas as pd\nplan = pd.Series(["free", "pro", "free", "team", "free", "pro", "free", "free"])\nprint(plan.value_counts().to_dict())\nprint(plan.value_counts(normalize=True).to_dict())',
        output:
          "{'free': 5, 'pro': 2, 'team': 1}\n{'free': 0.625, 'pro': 0.25, 'team': 0.125}",
        explanation:
          'free appears 5 times out of 8, so it comes first with a proportion of 0.625.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'import pandas as pd\ns = pd.Series(["b", "a", "b", "c", "b", "a"])\nprint(s.value_counts().to_dict())',
          [
            "{'a': 2, 'b': 3, 'c': 1}",
            "{'b': 3, 'a': 2, 'c': 1}",
            "{'b': 1, 'a': 1, 'c': 1}",
            "{'c': 1, 'a': 2, 'b': 3}",
          ],
          1,
          'Values are counted and listed from most to least frequent, not alphabetically.',
        ),
        predictOutput(
          'What does this program print?',
          'import pandas as pd\ns = pd.Series(["y", "n", "y", "y"])\nprint(s.value_counts(normalize=True).to_dict())',
          [
            "{'y': 3, 'n': 1}",
            "{'n': 0.25, 'y': 0.75}",
            "{'y': 75, 'n': 25}",
            "{'y': 0.75, 'n': 0.25}",
          ],
          3,
          'normalize=True divides each count by 4 and keeps the most frequent first.',
        ),
        predictOutput(
          'What does this program print?',
          'import pandas as pd\ns = pd.Series(["x", None, "x", None, None])\nprint(s.value_counts().to_dict())',
          ["{'x': 2}", "{None: 3, 'x': 2}", "{'x': 2, None: 3}", "{'x': 5}"],
          0,
          'Missing values are excluded by default, even when they are the most common entry.',
        ),
        choose(
          'A churn rate per plan shows 0% for the enterprise plan, and value_counts shows only 2 enterprise customers. What should the report say?',
          [
            'Enterprise customers never churn',
            'Enterprise should be removed from the analysis',
            'The 0% rests on 2 customers and is weak evidence',
            'Churn is impossible on the enterprise plan',
          ],
          2,
          'Two customers are far too few to support a claim about the whole plan.',
        ),
      ],
    },
    {
      title: 'Compare mean and median with describe',
      explanation: [
        '.describe() summarises a numeric column: count, mean, std (a measure of spread), min, the values 25%, 50% and 75% of the way through the sorted data, and max. The 50% value is the median, and count includes only present values.',
        'When the mean sits far from the median, a few extreme values are pulling it. That is a reason to inspect those observations and their source, not to delete them automatically.',
      ],
      example: {
        code: 'import pandas as pd\nvalues = pd.Series([2, 3, 4, 51])\nd = values.describe()\nprint(d["mean"])\nprint(d["50%"])\nprint(d[["count", "min", "max"]].tolist())',
        output: '15.0\n3.5\n[4.0, 2.0, 51.0]',
        explanation:
          'The single 51 lifts the mean to 15, while the median stays between 3 and 4.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'import pandas as pd\ns = pd.Series([1, 2, 3, 4, 90])\nprint(s.mean())\nprint(s.median())',
          ['3.0\n20.0', '20.0\n3.0', '20.0\n20.0', '22.5\n3.0'],
          1,
          'The mean is 100 / 5 = 20; the middle value of the sorted five is 3.',
        ),
        predictOutput(
          'What does this program print?',
          'import pandas as pd\ns = pd.Series([5, 1, 9])\nprint(s.describe()["50%"])',
          ['1.0', '9.0', '15.0', '5.0'],
          3,
          'Sorted, the values are 1, 5, 9, so the 50% value (the median) is 5.',
        ),
        predictOutput(
          'What does this program print?',
          'import pandas as pd\nd = pd.Series([3.0, None, 7.0]).describe()\nprint(d["count"])\nprint(d["max"])',
          ['3.0\n7.0', '2.0\nnan', '2.0\n7.0', '3.0\nnan'],
          2,
          'count includes only the two present values, and max ignores the missing one.',
        ),
        choose(
          'Delivery times have a mean of 9 days and a median of 3 days. What is the sound next step?',
          [
            'Report 9 days as the typical delivery',
            'Inspect the slow deliveries and their source before summarising',
            'Delete the slowest deliveries',
            'Report the median and never mention the gap',
          ],
          1,
          'The gap shows a few very slow deliveries; whether they are real or errors decides how to report.',
        ),
      ],
    },
    {
      title: 'Read a correlation without claiming a cause',
      explanation: [
        'x.corr(y) measures how closely two columns follow a straight-line pattern across paired rows. It is 1.0 when the points lie exactly on a rising line, −1.0 on a falling line, and near 0 when there is no straight-line pattern.',
        'Correlation is association, not causation. Ice-cream sales and drownings both rise in summer because of a third factor, heat. Shared trends, selected samples and confounding variables can all create correlation.',
      ],
      example: {
        code: 'import pandas as pd\nhours = pd.Series([1, 2, 3, 4])\nscore = pd.Series([52, 60, 68, 76])\nfatigue = pd.Series([9, 7, 5, 3])\nprint(hours.corr(score))\nprint(hours.corr(fatigue))',
        output: '1.0\n-1.0',
        explanation:
          'Score rises by exactly 8 per hour and fatigue falls by exactly 2, so both lie on straight lines, one rising and one falling.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'import pandas as pd\nx = pd.Series([1, 2, 3])\ny = pd.Series([30, 20, 10])\nprint(x.corr(y))',
          ['1.0', '-10.0', '-1.0', '0.0'],
          2,
          'y falls by the same amount at each step, a perfect falling line.',
        ),
        predictOutput(
          'What does this program print?',
          'import pandas as pd\nx = pd.Series([2, 4, 6, 8])\ny = pd.Series([5, 9, 13, 17])\nprint(x.corr(y))',
          ['2.0', '0.5', '-1.0', '1.0'],
          3,
          'Correlation measures how straight the pattern is, not its slope; any exact rising line gives 1.0.',
        ),
        choose(
          'Across many fires, the number of firefighters sent correlates strongly with the damage. What is the best explanation?',
          [
            'Bigger fires bring both more firefighters and more damage',
            'Firefighters cause the damage',
            'The correlation must be a calculation error',
            'Damage attracts firefighters after the fire',
          ],
          0,
          'Fire size is a confounding variable that drives both measurements.',
        ),
        choose(
          'Two columns have a correlation of 0.0. Which statement is justified?',
          [
            'They are unrelated in every way',
            'One causes the other',
            'The data must contain missing values',
            'They show no straight-line relationship in this data',
          ],
          3,
          'Correlation only measures linear association; a curved relationship can still exist.',
        ),
      ],
    },
  ],

  'da-pipeline': [
    {
      title: 'Wrap the analysis in a function',
      explanation: [
        'A pipeline takes source data in and returns a result: def report(text): parse, clean, summarise, return. Everything it needs comes from its parameter, so calling it again with the same text gives the same answer, and calling it with new text analyses the new data.',
        'Code that depends on variables left over from earlier runs can silently use stale data. A function makes the inputs explicit.',
      ],
      example: {
        code: 'from io import StringIO\nimport pandas as pd\n\ndef total_units(text):\n    data = pd.read_csv(StringIO(text))\n    return int(data["units"].sum())\n\nprint(total_units("units\\n3\\n4\\n"))\nprint(total_units("units\\n10\\n"))\nprint(total_units("units\\n3\\n4\\n"))',
        output: '7\n10\n7',
        explanation:
          'Each call parses its own text. The first and third calls receive the same input, so they return the same result.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'from io import StringIO\nimport pandas as pd\n\ndef shops(text):\n    data = pd.read_csv(StringIO(text))\n    return len(data)\n\nprint(shops("shop\\nA\\nB\\nC\\n"))\nprint(shops("shop\\nD\\n"))',
          ['4\n2', '3\n4', '3\n1', '1\n3'],
          2,
          'Each call counts the data rows of its own input; the header is not a row.',
        ),
        predictOutput(
          'What does this program print?',
          'calls = []\n\ndef report(value):\n    calls.append(value)\n    return len(calls)\n\nprint(report("a"))\nprint(report("a"))',
          ['1\n1', 'a\na', '2\n2', '1\n2'],
          3,
          'The function depends on the list outside it, so the same input gives a different result the second time.',
        ),
        choose(
          'A notebook’s final total changes depending on which earlier cells were run. What fixes the root cause?',
          [
            'Put the steps in a function that takes the source data and returns the result',
            'Run the cells in a different order',
            'Add print statements to each cell',
            'Copy the final total by hand',
          ],
          0,
          'With explicit inputs and a returned result, the total no longer depends on leftover state.',
        ),
        choose(
          'Which design best fits a reusable cleaning step?',
          [
            'def clean(): edits a table stored in a global variable',
            'def clean(text): prints the cleaned table and returns nothing',
            'def clean(text): parses text and returns a cleaned DataFrame',
            'A cell that edits the table in place each time it runs',
          ],
          2,
          'Taking the source as a parameter and returning a result makes the step repeatable and testable.',
        ),
      ],
    },
    {
      title: 'Make broken assumptions fail loudly',
      explanation: [
        'assert condition, "message" does nothing when the condition is True and raises AssertionError with the message when it is False. Use it to state what a pipeline relies on: keys are unique, required columns exist, quantities are numeric.',
        'A failed check stops the pipeline before it produces a plausible-looking but wrong number. A caller can catch the error with try/except and report what broke.',
      ],
      example: {
        code: 'import pandas as pd\n\ndef check(data):\n    assert data["id"].is_unique, "duplicate id"\n    return len(data)\n\nprint(check(pd.DataFrame({"id": [1, 2, 3]})))\ntry:\n    check(pd.DataFrame({"id": [1, 1]}))\nexcept AssertionError as error:\n    print("rejected:", error)',
        output: '3\nrejected: duplicate id',
        explanation:
          'The first table passes the check. The second repeats id 1, so the assertion raises and the caller prints its message.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'def validate(units):\n    assert units >= 0, "negative units"\n    return units * 2\n\ntry:\n    print(validate(4))\n    print(validate(-1))\nexcept AssertionError as error:\n    print(error)',
          ['8\n-2', 'negative units', '8\nnegative units', '8'],
          2,
          '4 passes and prints 8; −1 fails the assertion, so its message is printed instead of a result.',
        ),
        predictOutput(
          'What does this program print?',
          'from io import StringIO\nimport pandas as pd\n\ndef load(text):\n    data = pd.read_csv(StringIO(text))\n    assert "qty" in data.columns, "missing qty column"\n    return int(data["qty"].sum())\n\nfor text in ["qty\\n2\\n5\\n", "amount\\n9\\n"]:\n    try:\n        print(load(text))\n    except AssertionError as error:\n        print("error:", error)',
          [
            '7\n9',
            'error: missing qty column',
            '7\nKeyError',
            '7\nerror: missing qty column',
          ],
          3,
          'The first source has qty and sums to 7. The second lacks the column, so the check fails before any sum.',
        ),
        predictOutput(
          'What does this program print?',
          'import pandas as pd\n\ndef parse(values):\n    return pd.to_numeric(pd.Series(values), errors="raise").sum()\n\ntry:\n    print(parse(["3", "4"]))\n    print(parse(["3", "four"]))\nexcept ValueError:\n    print("bad quantity")',
          ['7\nbad quantity', '7\n3', '7\nnan', 'bad quantity'],
          0,
          'The second call meets an invalid token, and errors="raise" stops it instead of skipping four.',
        ),
        choose(
          'Why does a pipeline assert that event_id is unique before summing?',
          [
            'assert makes the sum faster',
            'Repeated ids would count the same event twice in the total',
            'Unique ids remove missing values',
            'pandas cannot sum a column unless ids are unique',
          ],
          1,
          'The check protects the meaning of a row, and so the meaning of the total.',
        ),
      ],
    },
    {
      title: 'Order the steps so each can trust the last',
      explanation: [
        'Steps depend on each other: convert types before checking numeric rules, deduplicate before aggregating, and validate the key after deduplicating. Swapping the order can make a check meaningless or count observations twice.',
        'Write the policy choices, such as which version wins and how missing quantities are handled, inside the function, so the same rules run every time.',
      ],
      example: {
        code: 'from io import StringIO\nimport pandas as pd\n\ndef units_by_shop(text):\n    data = pd.read_csv(StringIO(text))\n    data["units"] = pd.to_numeric(data["units"], errors="raise")\n    data = data.sort_values("version").drop_duplicates("event_id", keep="last")\n    assert data["event_id"].is_unique\n    return data.groupby("shop")["units"].sum().to_dict()\n\ntext = "event_id,version,shop,units\\n1,1,west,2\\n1,2,west,5\\n2,1,east,4\\n"\nprint(units_by_shop(text))',
        output: "{'east': 4, 'west': 5}",
        explanation:
          'Event 1 has two versions; only version 2 (5 units) survives, so west totals 5 rather than 7.',
      },
      questions: [
        predictOutput(
          'This version skips deduplication. What does it print?',
          'from io import StringIO\nimport pandas as pd\n\ntext = "event_id,version,shop,units\\n1,1,west,2\\n1,2,west,5\\n2,1,east,4\\n"\ndata = pd.read_csv(StringIO(text))\nprint(data.groupby("shop")["units"].sum().to_dict())',
          [
            "{'east': 4, 'west': 5}",
            "{'east': 4, 'west': 7}",
            "{'west': 7, 'east': 4}",
            "{'east': 4, 'west': 2}",
          ],
          1,
          'Both versions of event 1 are counted, so west double-counts to 7.',
        ),
        predictOutput(
          'This version keeps the last row without sorting by version. What does it print?',
          'from io import StringIO\nimport pandas as pd\n\ntext = "event_id,version,shop,units\\n1,2,west,5\\n1,1,west,2\\n2,1,east,4\\n"\ndata = pd.read_csv(StringIO(text))\nlatest = data.drop_duplicates("event_id", keep="last")\nprint(latest.groupby("shop")["units"].sum().to_dict())',
          [
            "{'east': 4, 'west': 5}",
            "{'east': 4, 'west': 7}",
            "{'east': 4, 'west': 2}",
            "{'west': 2}",
          ],
          2,
          'The last row for event 1 is the older version 1, so the outdated 2 units win.',
        ),
        choose(
          'Where should the uniqueness assertion on event_id go in a pipeline that removes old versions?',
          [
            'Before reading the CSV',
            'Before converting units to numbers',
            'Right after deduplication, before aggregating',
            'After printing the report',
          ],
          2,
          'Asserting before deduplication would always fail; after aggregating it is too late to protect the totals.',
        ),
        choose(
          'A pipeline fills missing units with 0 and only then checks that every quantity is present. What goes wrong?',
          [
            'The check can never fail, so missing quantities slip through as zeros',
            'The fill raises an error',
            'Nothing, because the order of these steps does not matter',
            'groupby loses its keys',
          ],
          0,
          'After filling, nothing is missing, so the check cannot detect the original gaps.',
        ),
      ],
    },
  ],
};
