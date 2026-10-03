import { choose, predictOutput, type KnowledgePointModule } from './authoring';

// Competitive Programming: the grid (flood fill) and bitmask topics.
export const knowledgePoints: KnowledgePointModule = {
  'cp-grid-bounds': [
    {
      title: 'List the four neighbor candidates of a cell',
      explanation: [
        'A grid cell is named by a (row, column) pair. Under four-direction movement its neighbor candidates differ by exactly one in one coordinate: up is (row - 1, column), down is (row + 1, column), left is (row, column - 1), and right is (row, column + 1).',
        'Cells that touch only at a corner, such as (row + 1, column + 1), are not candidates. Writing the four moves as one list keeps their order fixed, which makes results easy to compare.',
      ],
      example: {
        code: 'row, col = 2, 3\ncandidates = [(row - 1, col), (row + 1, col), (row, col - 1), (row, col + 1)]\nprint(candidates)',
        output: '[(1, 3), (3, 3), (2, 2), (2, 4)]',
        explanation:
          'Up and down change only the row; left and right change only the column. No candidate changes both.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'row, col = 0, 5\ncandidates = [(row - 1, col), (row + 1, col), (row, col - 1), (row, col + 1)]\nprint(candidates)',
          [
            '[(1, 5), (0, 4), (0, 6)]',
            '[(-1, 5), (1, 5), (0, 4), (0, 6)]',
            '[(-1, 4), (1, 6), (0, 4), (0, 6)]',
            '[(1, 5), (-1, 5), (0, 6), (0, 4)]',
          ],
          1,
          'The list is built without any bounds check, so the up move (-1, 5) is still a candidate at this stage.',
        ),
        choose(
          'Which cell is a four-direction neighbor of (4, 7)?',
          ['(5, 8)', '(3, 6)', '(4, 6)', '(6, 7)'],
          2,
          '(4, 6) changes only the column, by one. The others change both coordinates or move two rows.',
        ),
        choose(
          'Which move changes only the column coordinate?',
          ['Up', 'Down', 'A diagonal step', 'Right'],
          3,
          'Right keeps the row and adds one to the column; up and down change the row.',
        ),
        predictOutput(
          'What does this program print?',
          'row, col = 3, 3\nmoves = [(-1, 0), (1, 0), (0, -1), (0, 1)]\nprint([(row + dr, col + dc) for dr, dc in moves][2])',
          ['(3, 2)', '(2, 3)', '(3, 4)', '(4, 3)'],
          0,
          'Index 2 is the third move, (0, -1), which is left: the column drops from 3 to 2.',
        ),
      ],
    },
    {
      title: 'Keep only coordinates inside the grid',
      explanation: [
        'A grid with rows rows and cols columns has valid rows 0 through rows - 1 and valid columns 0 through cols - 1. A candidate is kept only when 0 <= r < rows and 0 <= c < cols; the upper bounds are strict because indexes stop one short of the length.',
        'Filtering the four candidates gives four neighbors for an interior cell, three for a cell on one border, and two for a corner. A one-cell grid has none.',
      ],
      example: {
        code: 'rows, cols = 3, 4\nrow, col = 0, 3\nresult = []\nfor r, c in [(row - 1, col), (row + 1, col), (row, col - 1), (row, col + 1)]:\n    if 0 <= r < rows and 0 <= c < cols:\n        result.append((r, c))\nprint(result)',
        output: '[(1, 3), (0, 2)]',
        explanation:
          'Row -1 fails 0 <= r and column 4 fails c < cols, so the top-right corner keeps only down and left.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'rows, cols = 2, 2\nrow, col = 1, 0\nresult = []\nfor r, c in [(row - 1, col), (row + 1, col), (row, col - 1), (row, col + 1)]:\n    if 0 <= r < rows and 0 <= c < cols:\n        result.append((r, c))\nprint(result)',
          [
            '[(0, 0), (2, 0), (1, 1)]',
            '[(0, 0), (1, 1)]',
            '[(0, 0), (1, -1), (1, 1)]',
            '[(1, 1), (0, 0)]',
          ],
          1,
          'Row 2 is past the last row and column -1 is before the first, so only up and right remain, in that order.',
        ),
        choose(
          'In a grid with cols columns, which test accepts exactly the valid column indexes c?',
          ['0 <= c <= cols', '0 < c < cols', '0 <= c < cols', 'c < cols'],
          2,
          'Columns run from 0 to cols - 1. Using <= admits cols, < at the left rejects 0, and c < cols alone admits negatives.',
        ),
        predictOutput(
          'What does this program print?',
          'rows, cols = 1, 5\nrow, col = 0, 2\ncount = 0\nfor r, c in [(row - 1, col), (row + 1, col), (row, col - 1), (row, col + 1)]:\n    if 0 <= r < rows and 0 <= c < cols:\n        count += 1\nprint(count)',
          ['4', '3', '1', '2'],
          3,
          'With a single row, both up and down leave the grid; left and right stay inside.',
        ),
        choose(
          'How many in-bounds four-direction neighbors does the corner cell (0, 0) of a 5-by-5 grid have?',
          ['2', '3', '4', '0'],
          0,
          'Up and left leave the grid; down and right stay inside.',
        ),
      ],
    },
    {
      title: 'Check bounds before indexing',
      explanation: [
        'Python accepts negative indexes: grid[-1] is the last row, not an error. An unchecked up move from row 0 therefore reads the bottom row, inventing a connection across the border. A row equal to the length raises IndexError instead.',
        'Write the bounds test first in one condition joined by and. Python evaluates and from left to right and stops at the first false part, so grid[r][c] is never read for an out-of-bounds pair.',
      ],
      example: {
        code: 'grid = ["ab", "cd"]\nr, c = -1, 0\nprint(grid[r][c])\nprint(0 <= r < len(grid) and grid[r][c] == "c")',
        output: 'c\nFalse',
        explanation:
          'Row -1 silently wraps to "cd". In the guarded condition, 0 <= r is false, so the comparison with "c" is never evaluated.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'grid = ["xyz", "uvw", "rst"]\nrow, col = 0, 1\nprint(grid[row - 1][col])',
          ['y', 'IndexError', 's', 'v'],
          2,
          'row - 1 is -1, which wraps to the last row "rst"; its column 1 is s.',
        ),
        predictOutput(
          'What does this program print?',
          'grid = [[1, 0], [0, 1]]\nr, c = 2, 1\nprint(0 <= r < len(grid) and grid[r][c] == 1)',
          ['True', 'False', 'IndexError', 'None'],
          1,
          'r < len(grid) is false, so and stops before grid[2] would raise IndexError.',
        ),
        choose(
          'Why must the bounds test come before grid[r][c] in the same condition?',
          [
            'Python sorts the parts of an and expression.',
            'Comparisons are faster than indexing, so the cheap test should run first.',
            'Negative indexes always raise IndexError.',
            'and stops at the first false part, so the invalid read never happens.',
          ],
          3,
          'Short-circuit evaluation is what protects the read; negative indexes do not raise, they wrap.',
        ),
        choose(
          'A search on a 4-row grid reads grid[r][c] for the up move from row 0 without a bounds check. What happens?',
          [
            'It reads row 3, so a false move across the top border can be followed.',
            'It raises IndexError at row -1, and the search crashes on the first up move.',
            'It reads row 0 again, which is harmless.',
            'Python skips the read because the index is negative.',
          ],
          0,
          'Row -1 is the last row, here row 3, so the search may step off the top edge into the bottom row.',
        ),
      ],
    },
  ],
  'cp-grid-passability': [
    {
      title: 'Read a cell only after its bounds pass',
      explanation: [
        'In a binary grid, 1 marks land you can step on and 0 marks water. Being inside the grid does not make a cell passable, so a neighbor needs two tests: in bounds, then value 1.',
        'Put both tests in one and-condition with the bounds first. If the bounds fail, Python never reads the cell; if they pass, the value test decides.',
      ],
      example: {
        code: 'grid = [[1, 0, 1], [1, 1, 0]]\nrows, cols = len(grid), len(grid[0])\nfor r, c in [(-1, 1), (0, 1), (1, 1)]:\n    print(0 <= r < rows and 0 <= c < cols and grid[r][c] == 1)',
        output: 'False\nFalse\nTrue',
        explanation:
          '(-1, 1) fails the bounds; (0, 1) is in bounds but water; (1, 1) is in bounds and land.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'grid = [[0, 1], [1, 1]]\nrows, cols = len(grid), len(grid[0])\nr, c = 0, 0\nprint(0 <= r < rows and 0 <= c < cols and grid[r][c] == 1)',
          ['True', 'IndexError', 'False', '0'],
          2,
          '(0, 0) is inside the grid but holds 0, so the final test is false.',
        ),
        choose(
          'Which neighbor may be stepped on in a binary grid?',
          [
            'Any in-bounds cell.',
            'An in-bounds cell holding 1.',
            'Any cell holding 1, even out of bounds.',
            'An in-bounds cell holding 0.',
          ],
          1,
          'Both conditions are required: the cell must exist and must be land.',
        ),
        predictOutput(
          'What does this program print?',
          'grid = [[1, 1, 1]]\nrows, cols = len(grid), len(grid[0])\nchecks = [0 <= r < rows and 0 <= c < cols and grid[r][c] == 1 for r, c in [(0, 3), (0, 2), (1, 0)]]\nprint(checks)',
          [
            '[True, True, False]',
            '[False, True, True]',
            '[False, False, False]',
            '[False, True, False]',
          ],
          3,
          'Column 3 and row 1 are out of bounds; only (0, 2) is an existing land cell.',
        ),
        choose(
          'A condition reads grid[r][c] == 1 and 0 <= r < rows. What is wrong with it?',
          [
            'Nothing; and checks both parts in any order.',
            'It reads the cell before knowing the index is valid.',
            'It treats water as land.',
            'It rejects every cell in row 0.',
          ],
          1,
          'The left part runs first, so an out-of-bounds or negative index is read before the guard.',
        ),
      ],
    },
    {
      title: 'Collect the land neighbors of a cell',
      explanation: [
        'A land-neighbor function walks the four candidates in a fixed order (up, down, left, right) and keeps those that pass both tests. Its result is the set of moves a search may take from that cell.',
        'The function only reads the grid; it never changes a value. A cell with no land around it returns an empty list even if the cell itself is land.',
      ],
      example: {
        code: 'def land_neighbors(grid, row, col):\n    rows, cols = len(grid), len(grid[0])\n    result = []\n    for r, c in [(row - 1, col), (row + 1, col), (row, col - 1), (row, col + 1)]:\n        if 0 <= r < rows and 0 <= c < cols and grid[r][c] == 1:\n            result.append((r, c))\n    return result\n\nprint(land_neighbors([[1, 1, 0], [0, 1, 1]], 1, 1))',
        output: '[(0, 1), (1, 2)]',
        explanation:
          'Up (0, 1) and right (1, 2) are land; down leaves the grid and left (1, 0) is water.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'def land_neighbors(grid, row, col):\n    rows, cols = len(grid), len(grid[0])\n    result = []\n    for r, c in [(row - 1, col), (row + 1, col), (row, col - 1), (row, col + 1)]:\n        if 0 <= r < rows and 0 <= c < cols and grid[r][c] == 1:\n            result.append((r, c))\n    return result\n\nprint(land_neighbors([[0, 1, 0], [1, 1, 1], [0, 1, 0]], 1, 1))',
          [
            '[(0, 1), (2, 1), (1, 0), (1, 2)]',
            '[(0, 1), (1, 0), (1, 2), (2, 1)]',
            '[(1, 0), (1, 2)]',
            '[(0, 0), (0, 2), (2, 0), (2, 2)]',
          ],
          0,
          'All four direct neighbors are land and appear in up, down, left, right order; the corners are water and are never candidates.',
        ),
        predictOutput(
          'What does this program print?',
          'def land_neighbors(grid, row, col):\n    rows, cols = len(grid), len(grid[0])\n    result = []\n    for r, c in [(row - 1, col), (row + 1, col), (row, col - 1), (row, col + 1)]:\n        if 0 <= r < rows and 0 <= c < cols and grid[r][c] == 1:\n            result.append((r, c))\n    return result\n\nprint(land_neighbors([[1, 0], [0, 1]], 0, 0))',
          ['[(1, 1)]', '[(0, 1), (1, 0)]', '[]', '[(0, 0)]'],
          2,
          'The two direct neighbors hold 0, and the diagonal (1, 1) is not a candidate, so nothing is kept.',
        ),
        choose(
          'land_neighbors is called on a water cell surrounded by land. What should it return?',
          [
            'An empty list, because the function returns nothing for a cell that is water.',
            'The land neighbors; the function filters neighbors, not the cell itself.',
            'An IndexError.',
            'The water cell itself.',
          ],
          1,
          'The function tests each neighbor; whether the starting cell is land is a separate decision for the caller.',
        ),
        predictOutput(
          'What does this program print?',
          'def land_neighbors(grid, row, col):\n    rows, cols = len(grid), len(grid[0])\n    result = []\n    for r, c in [(row - 1, col), (row + 1, col), (row, col - 1), (row, col + 1)]:\n        if 0 <= r < rows and 0 <= c < cols and grid[r][c] == 1:\n            result.append((r, c))\n    return result\n\ngrid = [[1, 1, 1]]\nprint(len(land_neighbors(grid, 0, 2)), grid)',
          ['2 [[1, 1, 1]]', '1 [[1, 1, 0]]', '3 [[1, 1, 1]]', '1 [[1, 1, 1]]'],
          3,
          'Only the left neighbor (0, 1) exists and is land, and the grid is unchanged.',
        ),
      ],
    },
    {
      title: 'Passable is not the same as unvisited',
      explanation: [
        'Land neighbors go both ways: if B is a land neighbor of A, then A is a land neighbor of B. A search that follows land neighbors alone would step from A to B and straight back again.',
        'Stopping repeats needs a separate record of discovered cells. The passability test answers "may I step there?"; the discovered record answers "have I already scheduled it?"',
      ],
      example: {
        code: 'def land_neighbors(grid, row, col):\n    rows, cols = len(grid), len(grid[0])\n    result = []\n    for r, c in [(row - 1, col), (row + 1, col), (row, col - 1), (row, col + 1)]:\n        if 0 <= r < rows and 0 <= c < cols and grid[r][c] == 1:\n            result.append((r, c))\n    return result\n\ngrid = [[1, 1]]\nprint(land_neighbors(grid, 0, 0), land_neighbors(grid, 0, 1))',
        output: '[(0, 1)] [(0, 0)]',
        explanation:
          'Each of the two land cells lists the other, so passability alone allows an endless back-and-forth.',
      },
      questions: [
        choose(
          'A search follows every land neighbor but keeps no record of discovered cells. What happens on two adjacent land cells?',
          [
            'It stops after both cells, because each is visited once.',
            'It raises IndexError at the border.',
            'It keeps stepping between them and never finishes.',
            'It counts each cell exactly twice.',
          ],
          2,
          'Each cell offers the other as a land neighbor, so the work never runs out.',
        ),
        predictOutput(
          'What does this program print?',
          'def land_neighbors(grid, row, col):\n    rows, cols = len(grid), len(grid[0])\n    result = []\n    for r, c in [(row - 1, col), (row + 1, col), (row, col - 1), (row, col + 1)]:\n        if 0 <= r < rows and 0 <= c < cols and grid[r][c] == 1:\n            result.append((r, c))\n    return result\n\ngrid = [[1, 1], [1, 1]]\ntotal = 0\nfor r in range(2):\n    for c in range(2):\n        total += len(land_neighbors(grid, r, c))\nprint(total)',
          ['4', '8', '16', '2'],
          1,
          'Each of the four cells has two land neighbors, so every one of the four connections is counted from both ends.',
        ),
        choose(
          'Which question does a discovered-cell set answer that passability does not?',
          [
            'Whether the cell has already been scheduled.',
            'Whether the cell is inside the grid.',
            'Whether the cell holds land.',
            'Whether the cell touches a corner.',
          ],
          0,
          'Bounds and value decide whether a step is allowed; only a record of discovery prevents repeating work.',
        ),
      ],
    },
  ],
  'cp-grid-component': [
    {
      title: 'Mark a cell when you schedule it',
      explanation: [
        'A flood fill keeps a pending stack of cells still to expand and a seen set of every cell already scheduled. Adding a cell to seen at the moment it is pushed means no later route can push it again.',
        'If cells were marked only when popped, a cell reachable through several land routes could sit on the stack several times before its first pop, repeating work.',
      ],
      example: {
        code: 'grid = [[1, 1], [1, 1]]\nseen = {(0, 0)}\npending = [(0, 0)]\npushes = 1\nwhile pending:\n    r, c = pending.pop()\n    for nr, nc in [(r - 1, c), (r + 1, c), (r, c - 1), (r, c + 1)]:\n        if 0 <= nr < 2 and 0 <= nc < 2 and grid[nr][nc] == 1 and (nr, nc) not in seen:\n            seen.add((nr, nc))\n            pending.append((nr, nc))\n            pushes += 1\nprint(pushes, len(seen))',
        output: '4 4',
        explanation:
          'Each of the four land cells is pushed exactly once, even though (1, 1) can be reached from two directions.',
      },
      questions: [
        choose(
          'When should a flood fill add a cell to its seen set?',
          [
            'When the cell is popped from the stack.',
            'After the whole search finishes.',
            'When the cell is pushed onto the stack.',
            'Only when the cell has no land neighbors.',
          ],
          2,
          'Marking at push time means the second route to the cell finds it already seen.',
        ),
        predictOutput(
          'What does this program print?',
          'grid = [[1, 1, 1]]\nseen = {(0, 1)}\npending = [(0, 1)]\npushes = 1\nwhile pending:\n    r, c = pending.pop()\n    for nr, nc in [(r - 1, c), (r + 1, c), (r, c - 1), (r, c + 1)]:\n        if 0 <= nr < 1 and 0 <= nc < 3 and grid[nr][nc] == 1 and (nr, nc) not in seen:\n            seen.add((nr, nc))\n            pending.append((nr, nc))\n            pushes += 1\nprint(pushes)',
          ['5', '2', '6', '3'],
          3,
          'Starting in the middle, the two end cells are each pushed once: three pushes in total.',
        ),
        choose(
          'A fill marks cells only when popping. Why can a cell be pushed twice?',
          [
            'Two neighbors can both push it before it is popped the first time.',
            'The stack removes the oldest entry first.',
            'Water cells are pushed too.',
            'The bounds test lets a negative index wrap around to a cell on the far edge.',
          ],
          0,
          'Until the first pop, the cell is not marked, so every neighbor that sees it pushes another copy.',
        ),
      ],
    },
    {
      title: 'Grow one island from a starting cell',
      explanation: [
        'An island is a group of land cells connected by up, down, left, and right moves. A flood fill from one land cell discovers exactly that island: every discovered cell is reachable, and every reachable cell is eventually pushed.',
        'The size of the island is the number of discovered cells, len(seen). A water start has no island, and cells that touch the island only at a corner stay outside it.',
      ],
      example: {
        code: 'def component_size(grid, row, col):\n    if grid[row][col] == 0:\n        return 0\n    rows, cols = len(grid), len(grid[0])\n    seen = {(row, col)}\n    pending = [(row, col)]\n    while pending:\n        r, c = pending.pop()\n        for nr, nc in [(r - 1, c), (r + 1, c), (r, c - 1), (r, c + 1)]:\n            if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == 1 and (nr, nc) not in seen:\n                seen.add((nr, nc))\n                pending.append((nr, nc))\n    return len(seen)\n\nprint(component_size([[1, 1, 0], [0, 1, 0], [1, 0, 1]], 0, 0))',
        output: '3',
        explanation:
          '(0, 0), (0, 1), and (1, 1) are joined by moves; (2, 0) and (2, 2) touch the island only diagonally.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'def component_size(grid, row, col):\n    if grid[row][col] == 0:\n        return 0\n    rows, cols = len(grid), len(grid[0])\n    seen = {(row, col)}\n    pending = [(row, col)]\n    while pending:\n        r, c = pending.pop()\n        for nr, nc in [(r - 1, c), (r + 1, c), (r, c - 1), (r, c + 1)]:\n            if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == 1 and (nr, nc) not in seen:\n                seen.add((nr, nc))\n                pending.append((nr, nc))\n    return len(seen)\n\nprint(component_size([[1, 0, 1], [1, 0, 1], [1, 1, 1]], 0, 2))',
          ['3', '7', '4', '0'],
          1,
          'The right column connects to the left column through the bottom row, so all seven land cells form one island.',
        ),
        predictOutput(
          'What does this program print?',
          'def component_size(grid, row, col):\n    if grid[row][col] == 0:\n        return 0\n    rows, cols = len(grid), len(grid[0])\n    seen = {(row, col)}\n    pending = [(row, col)]\n    while pending:\n        r, c = pending.pop()\n        for nr, nc in [(r - 1, c), (r + 1, c), (r, c - 1), (r, c + 1)]:\n            if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == 1 and (nr, nc) not in seen:\n                seen.add((nr, nc))\n                pending.append((nr, nc))\n    return len(seen)\n\nprint(component_size([[0, 1], [1, 0]], 0, 0), component_size([[0, 1], [1, 0]], 0, 1))',
          ['0 2', '1 1', '0 1', '2 2'],
          2,
          'The first start is water. The second start is land, but its only other land cell touches it at a corner.',
        ),
        choose(
          'A grid has three separate islands. What does one flood fill from a land cell return?',
          [
            'The total land in all three islands.',
            'The number of islands.',
            'The size of the largest island.',
            'The size of the island containing the start.',
          ],
          3,
          'A fill only reaches cells connected to its start; other islands need their own fills.',
        ),
        choose(
          'Two land cells touch only at a corner and no other land joins them. Are they in the same island?',
          [
            'No; a corner touch is not a move.',
            'Yes; touching cells always share an island.',
            'Only if both are on the border.',
            'Only in a square grid.',
          ],
          0,
          'Islands are defined by the four allowed moves, and a diagonal step is not one of them.',
        ),
      ],
    },
    {
      title: 'Use an explicit stack for long islands',
      explanation: [
        'A recursive fill calls itself once per step along a path, and Python stops deep call chains: the default recursion limit is about 1,000 calls. A winding island of a few thousand cells is enough to exceed it.',
        'A list used as a stack holds pending cells in ordinary memory, so its length can grow to the size of the island without any depth limit. The discovered set and the four-move loop stay exactly the same.',
      ],
      example: {
        code: 'grid = [[1] * 3000]\nseen = {(0, 0)}\npending = [(0, 0)]\nwhile pending:\n    r, c = pending.pop()\n    for nr, nc in [(r - 1, c), (r + 1, c), (r, c - 1), (r, c + 1)]:\n        if 0 <= nr < 1 and 0 <= nc < 3000 and grid[nr][nc] == 1 and (nr, nc) not in seen:\n            seen.add((nr, nc))\n            pending.append((nr, nc))\nprint(len(seen))',
        output: '3000',
        explanation:
          'The path from the start to the far end is 2,999 steps long. A recursive fill would need that many nested calls; the stack loop needs none.',
      },
      questions: [
        choose(
          'Why can a recursive flood fill fail on a single row of 3,000 land cells?',
          [
            'Sets cannot hold more than 1,000 cells.',
            'The chain of nested calls exceeds Python’s recursion limit.',
            'Long rows contain diagonal moves.',
            'The bounds test fails for columns above 1,000.',
          ],
          1,
          'Each step deeper is another active call; about 1,000 nested calls is Python’s default limit.',
        ),
        predictOutput(
          'What does this program print?',
          'grid = [[1] * 1500, [0] * 1500]\nseen = {(0, 1499)}\npending = [(0, 1499)]\nlargest = 0\nwhile pending:\n    largest = max(largest, len(pending))\n    r, c = pending.pop()\n    for nr, nc in [(r - 1, c), (r + 1, c), (r, c - 1), (r, c + 1)]:\n        if 0 <= nr < 2 and 0 <= nc < 1500 and grid[nr][nc] == 1 and (nr, nc) not in seen:\n            seen.add((nr, nc))\n            pending.append((nr, nc))\nprint(len(seen), largest)',
          ['1500 1500', '3000 1', '1500 2', '1500 1'],
          3,
          'The fill walks left one cell at a time, so the stack never holds more than one pending cell while it discovers all 1,500 land cells.',
        ),
        choose(
          'What changes when a recursive flood fill is rewritten with a pending list?',
          [
            'Diagonal cells become neighbors.',
            'The seen set is no longer needed, because the list never holds the same cell twice.',
            'Pending cells live in a list instead of nested calls, so depth is not limited.',
            'The list visits cells in a different order, so the island size changes.',
          ],
          2,
          'Only the bookkeeping for pending work moves; the neighbor rules and the discovered set are unchanged.',
        ),
      ],
    },
  ],
  'cp-grids': [
    {
      title: 'Start a fill only at undiscovered land',
      explanation: [
        'To count islands, scan every cell in row order. When the scan meets land that no earlier fill discovered, that cell belongs to an island nobody has counted yet: count it and flood-fill the whole island.',
        'All fills share one seen set. Cells claimed by an earlier fill are skipped by the scan, so each island starts exactly one fill, and the number of fills equals the number of islands.',
      ],
      example: {
        code: 'grid = [[1, 0, 1], [1, 0, 0], [0, 0, 1]]\nseen = set()\nislands = 0\nfor row in range(3):\n    for col in range(3):\n        if grid[row][col] == 1 and (row, col) not in seen:\n            islands += 1\n            seen.add((row, col))\n            pending = [(row, col)]\n            while pending:\n                r, c = pending.pop()\n                for nr, nc in [(r - 1, c), (r + 1, c), (r, c - 1), (r, c + 1)]:\n                    if 0 <= nr < 3 and 0 <= nc < 3 and grid[nr][nc] == 1 and (nr, nc) not in seen:\n                        seen.add((nr, nc))\n                        pending.append((nr, nc))\nprint(islands)',
        output: '3',
        explanation:
          'Fills start at (0, 0), (0, 2), and (2, 2). The scan later reaches (1, 0), but the first fill already claimed it.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'grid = [[1, 1, 0, 1], [0, 1, 0, 1], [1, 0, 0, 0]]\nseen = set()\nislands = 0\nfor row in range(3):\n    for col in range(4):\n        if grid[row][col] == 1 and (row, col) not in seen:\n            islands += 1\n            seen.add((row, col))\n            pending = [(row, col)]\n            while pending:\n                r, c = pending.pop()\n                for nr, nc in [(r - 1, c), (r + 1, c), (r, c - 1), (r, c + 1)]:\n                    if 0 <= nr < 3 and 0 <= nc < 4 and grid[nr][nc] == 1 and (nr, nc) not in seen:\n                        seen.add((nr, nc))\n                        pending.append((nr, nc))\nprint(islands)',
          ['3', '6', '2', '4'],
          0,
          'The islands are {(0,0), (0,1), (1,1)}, {(0,3), (1,3)}, and {(2,0)}; (2, 0) touches (1, 1) only at a corner.',
        ),
        choose(
          'Why must every fill in the scan share one seen set?',
          [
            'So diagonal land joins the same island.',
            'So a later scan position on an already counted island does not start a new fill.',
            'So a fill can stop as soon as it reaches a cell that belongs to an earlier island.',
            'So the largest island is found first.',
          ],
          1,
          'A fresh set per fill would forget earlier islands, and every land cell would start a fill.',
        ),
        predictOutput(
          'What does this program print?',
          'grid = [[1, 1], [1, 1]]\nstarts = []\nseen = set()\nfor row in range(2):\n    for col in range(2):\n        if grid[row][col] == 1 and (row, col) not in seen:\n            starts.append((row, col))\n            seen.add((row, col))\n            pending = [(row, col)]\n            while pending:\n                r, c = pending.pop()\n                for nr, nc in [(r - 1, c), (r + 1, c), (r, c - 1), (r, c + 1)]:\n                    if 0 <= nr < 2 and 0 <= nc < 2 and grid[nr][nc] == 1 and (nr, nc) not in seen:\n                        seen.add((nr, nc))\n                        pending.append((nr, nc))\nprint(starts)',
          ['[(0, 0), (0, 1), (1, 0), (1, 1)]', '[(1, 1)]', '[]', '[(0, 0)]'],
          3,
          'The first fill claims the whole 2-by-2 island, so the scan never starts another.',
        ),
        choose(
          'A grid contains only water. What island count does the scan report?',
          ['1', 'The number of cells', '0', '-1'],
          2,
          'No cell is land, so no fill ever starts.',
        ),
      ],
    },
    {
      title: 'Measure each island while filling it',
      explanation: [
        'Each fill can count the cells it pops. Because every island cell is pushed exactly once, that count is the size of the island, and the scan can keep the largest size seen so far.',
        'Record the size after the fill’s loop ends, not inside it: only then has the whole island been discovered.',
      ],
      example: {
        code: 'grid = [[1, 1, 0], [0, 0, 1], [1, 0, 1]]\nseen = set()\nsizes = []\nfor row in range(3):\n    for col in range(3):\n        if grid[row][col] == 1 and (row, col) not in seen:\n            seen.add((row, col))\n            pending = [(row, col)]\n            size = 0\n            while pending:\n                r, c = pending.pop()\n                size += 1\n                for nr, nc in [(r - 1, c), (r + 1, c), (r, c - 1), (r, c + 1)]:\n                    if 0 <= nr < 3 and 0 <= nc < 3 and grid[nr][nc] == 1 and (nr, nc) not in seen:\n                        seen.add((nr, nc))\n                        pending.append((nr, nc))\n            sizes.append(size)\nprint(sizes, max(sizes))',
        output: '[2, 2, 1] 2',
        explanation:
          'Fills start at (0, 0), (1, 2), and (2, 0), finding islands of two, two, and one cells.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'grid = [[1, 0, 1, 1], [1, 0, 0, 1], [1, 1, 0, 1]]\nseen = set()\nsizes = []\nfor row in range(3):\n    for col in range(4):\n        if grid[row][col] == 1 and (row, col) not in seen:\n            seen.add((row, col))\n            pending = [(row, col)]\n            size = 0\n            while pending:\n                r, c = pending.pop()\n                size += 1\n                for nr, nc in [(r - 1, c), (r + 1, c), (r, c - 1), (r, c + 1)]:\n                    if 0 <= nr < 3 and 0 <= nc < 4 and grid[nr][nc] == 1 and (nr, nc) not in seen:\n                        seen.add((nr, nc))\n                        pending.append((nr, nc))\n            sizes.append(size)\nprint(sizes)',
          ['[4, 4]', '[3, 1, 4]', '[4, 3, 1]', '[8]'],
          0,
          'The left island is (0,0), (1,0), (2,0), (2,1); the right island is (0,2), (0,3), (1,3), (2,3).',
        ),
        choose(
          'Where should a fill append its island size to the list?',
          [
            'After each pop, inside the while loop.',
            'After the while loop ends.',
            'Before the first pop.',
            'Once per scanned cell, land or water.',
          ],
          1,
          'The count is complete only once the pending stack is empty.',
        ),
        predictOutput(
          'What does this program print?',
          'grid = [[1, 0, 1], [0, 1, 0], [1, 0, 1]]\nseen = set()\nlargest = 0\nfor row in range(3):\n    for col in range(3):\n        if grid[row][col] == 1 and (row, col) not in seen:\n            seen.add((row, col))\n            pending = [(row, col)]\n            size = 0\n            while pending:\n                r, c = pending.pop()\n                size += 1\n                for nr, nc in [(r - 1, c), (r + 1, c), (r, c - 1), (r, c + 1)]:\n                    if 0 <= nr < 3 and 0 <= nc < 3 and grid[nr][nc] == 1 and (nr, nc) not in seen:\n                        seen.add((nr, nc))\n                        pending.append((nr, nc))\n            largest = max(largest, size)\nprint(largest, len(seen))',
          ['5 5', '1 1', '1 5', '5 1'],
          2,
          'All five land cells touch only at corners, so there are five islands of size one, and all five cells end up in seen.',
        ),
      ],
    },
    {
      title: 'Count the work of the whole scan',
      explanation: [
        'With a shared seen set, each land cell is pushed once and popped once across all fills, and each pop checks at most four neighbors. Together with the scan over every cell, an R-by-C grid costs O(RC) work.',
        'Restarting a fresh fill from every land cell instead repeats whole islands. On a grid that is one big island of L cells, that is L fills of L cells each: O(L²), which for a 400-by-400 grid is billions of steps.',
      ],
      example: {
        code: 'grid = [[1] * 4 for _ in range(3)]\nseen = set()\npops = 0\nfor row in range(3):\n    for col in range(4):\n        if grid[row][col] == 1 and (row, col) not in seen:\n            seen.add((row, col))\n            pending = [(row, col)]\n            while pending:\n                r, c = pending.pop()\n                pops += 1\n                for nr, nc in [(r - 1, c), (r + 1, c), (r, c - 1), (r, c + 1)]:\n                    if 0 <= nr < 3 and 0 <= nc < 4 and grid[nr][nc] == 1 and (nr, nc) not in seen:\n                        seen.add((nr, nc))\n                        pending.append((nr, nc))\nprint(pops)',
        output: '12',
        explanation:
          'The single island has 12 cells, and each is popped once. Restarting from every cell would pop 12 × 12 = 144 times.',
      },
      questions: [
        choose(
          'What is the running time of the shared-seen scan on an R-by-C grid?',
          ['O(R + C)', 'O(RC log RC)', 'O((RC)²)', 'O(RC)'],
          3,
          'Every cell is scanned once and pushed at most once, with at most four neighbor checks per pop.',
        ),
        predictOutput(
          'What does this program print?',
          'grid = [[1, 1, 1], [1, 1, 1]]\npops = 0\nfor row in range(2):\n    for col in range(3):\n        seen = {(row, col)}\n        pending = [(row, col)]\n        while pending:\n            r, c = pending.pop()\n            pops += 1\n            for nr, nc in [(r - 1, c), (r + 1, c), (r, c - 1), (r, c + 1)]:\n                if 0 <= nr < 2 and 0 <= nc < 3 and grid[nr][nc] == 1 and (nr, nc) not in seen:\n                    seen.add((nr, nc))\n                    pending.append((nr, nc))\nprint(pops)',
          ['6', '36', '12', '21'],
          1,
          'This version creates a new seen set for every cell, so each of the six starts refills the whole six-cell island.',
        ),
        choose(
          'A 300-by-300 grid is one island of 90,000 cells. About how many cells does restarting a fill from every land cell pop?',
          [
            'About 8.1 billion',
            'About 90,000',
            'About 360,000',
            'About 180,000',
          ],
          0,
          '90,000 fills of 90,000 cells each is 8.1 × 10⁹ pops, versus 90,000 with a shared set.',
        ),
      ],
    },
  ],
  'cp-bit-position': [
    {
      title: 'Build a one-bit mask with a shift',
      explanation: [
        'An integer can stand for a set of positions: in binary, position k counts 2 to the power k, and the position is present when that binary digit is 1. Positions start at 0 on the right.',
        '1 << k shifts a single 1 left by k places, giving the integer whose only set position is k. So 1 << 0 is 1, 1 << 3 is 8, and 1 << k always equals 2 to the power k.',
      ],
      example: {
        code: 'print([1 << k for k in range(5)])',
        output: '[1, 2, 4, 8, 16]',
        explanation:
          'Each shift doubles the value, selecting the next position.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'print(1 << 6)',
          ['7', '6', '32', '64'],
          3,
          'Shifting 1 left by six places gives 2⁶ = 64.',
        ),
        choose(
          'Which integer has position 4 as its only set position?',
          ['4', '16', '8', '32'],
          1,
          'Position 4 is worth 2⁴ = 16.',
        ),
        predictOutput(
          'What does this program print?',
          'print((1 << 3) + (1 << 0))',
          ['9', '8', '4', '3'],
          0,
          '1 << 3 is 8 and 1 << 0 is 1, and their sum 9 is binary 1001.',
        ),
        choose(
          'Which positions are present in the integer 6?',
          ['0 and 1', 'Only 6', '1 and 2', '0 and 2'],
          2,
          '6 is binary 110: position 1 (worth 2) and position 2 (worth 4).',
        ),
      ],
    },
    {
      title: 'Test one position with &',
      explanation: [
        'mask & (1 << k) keeps only position k of mask. The result is 1 << k when the position is present and 0 when it is absent; it is a number, not True or False.',
        'Use the result as a condition, or wrap it in bool(...) when a boolean is required. Comparing it with == 1 is a classic bug: for k above 0, a present position gives 2, 4, 8, and so on.',
      ],
      example: {
        code: 'mask = 13\nprint(mask & (1 << 2), mask & (1 << 1))\nprint(bool(mask & (1 << 3)))',
        output: '4 0\nTrue',
        explanation:
          '13 is binary 1101: position 2 is present (giving 4), position 1 is absent (giving 0), and position 3 is present.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'mask = 10\nprint(mask & (1 << 3))',
          ['1', '8', 'True', '0'],
          1,
          '10 is binary 1010, so position 3 is present and the AND keeps its value, 8.',
        ),
        predictOutput(
          'What does this program print?',
          'mask = 12\nprint(mask & (1 << 2) == 1)',
          ['True', '4', 'False', '1'],
          2,
          'Position 2 is present, but the AND gives 4, which is not equal to 1. The comparison is the bug.',
        ),
        choose(
          'Which expression is True exactly when position k is present in mask?',
          [
            'mask & (1 << k) != 0',
            'mask & k == 1',
            'mask >> k == 1',
            'mask == 1 << k',
          ],
          0,
          'The AND isolates position k, and it is nonzero exactly when that position is set. (In Python & binds tighter than !=.)',
        ),
        predictOutput(
          'What does this program print?',
          'mask = 5\nprint([bool(mask & (1 << k)) for k in range(4)])',
          [
            '[True, True, False, False]',
            '[False, True, False, True]',
            '[True, False, True, True]',
            '[True, False, True, False]',
          ],
          3,
          '5 is binary 0101: positions 0 and 2 are present, 1 and 3 are not.',
        ),
      ],
    },
    {
      title: 'List the members of a mask',
      explanation: [
        'To turn a mask into the positions it contains, test each candidate position in order and keep the ones that are present. A comprehension over range(n) does this in one line.',
        'The mask records membership only. Equal values stored at different positions are different members, and the empty set is the mask 0.',
      ],
      example: {
        code: 'mask = 13\nprint([k for k in range(4) if mask & (1 << k)])',
        output: '[0, 2, 3]',
        explanation: '13 = 1 + 4 + 8, so positions 0, 2, and 3 are present.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'mask = 22\nprint([k for k in range(5) if mask & (1 << k)])',
          ['[1, 2, 4]', '[0, 1, 3]', '[2, 4]', '[1, 2, 3]'],
          0,
          '22 = 2 + 4 + 16, which are positions 1, 2, and 4.',
        ),
        predictOutput(
          'What does this program print?',
          'values = [7, 7, 9]\nmask = 3\nprint([values[k] for k in range(3) if mask & (1 << k)])',
          ['[7]', '[7, 9]', '[7, 7]', '[9]'],
          2,
          'Mask 3 selects positions 0 and 1; both hold 7, and both are kept as separate members.',
        ),
        choose(
          'Which mask stands for the empty set of positions?',
          ['1', '0', '-1', 'None'],
          1,
          'No position is set in 0.',
        ),
        predictOutput(
          'What does this program print?',
          'mask = 9\nprint(len([k for k in range(8) if mask & (1 << k)]))',
          ['9', '3', '1', '2'],
          3,
          '9 is binary 1001, so exactly two positions are present.',
        ),
      ],
    },
  ],
  'cp-bit-set-clear': [
    {
      title: 'Set a position with |',
      explanation: [
        'mask | (1 << k) returns a mask with position k present and every other position unchanged. OR keeps a 1 wherever either side has one.',
        'Setting is idempotent: if position k is already present, the result equals the original mask. It never removes a position and never counts a member twice.',
      ],
      example: {
        code: 'mask = 5\nprint(mask | (1 << 1))\nprint(mask | (1 << 2))',
        output: '7\n5',
        explanation:
          'Adding position 1 to 101 gives 111 = 7. Position 2 is already present, so 5 stays 5.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'mask = 8\nmask = mask | (1 << 0)\nprint(mask)',
          ['8', '1', '9', '16'],
          2,
          'Position 0 (worth 1) joins position 3 (worth 8): 9.',
        ),
        predictOutput(
          'What does this program print?',
          'mask = 6\nfor k in [1, 1, 2]:\n    mask = mask | (1 << k)\nprint(mask)',
          ['6', '12', '10', '14'],
          0,
          'Positions 1 and 2 are already in 6, so every OR leaves it unchanged.',
        ),
        choose(
          'Why is mask + (1 << k) a risky way to add position k?',
          [
            'Addition is slower than OR.',
            'If k is already present, the addition carries into a higher position.',
            'Addition clears position 0.',
            'For k of 32 or more, the sum overflows a machine word and turns negative.',
          ],
          1,
          'For example 4 + 4 = 8 moves the member from position 2 to position 3; 4 | 4 stays 4.',
        ),
        predictOutput(
          'What does this program print?',
          'mask = 0\nfor k in [4, 0, 4]:\n    mask |= 1 << k\nprint(mask)',
          ['33', '16', '1', '17'],
          3,
          'Positions 4 and 0 are set once each: 16 + 1 = 17.',
        ),
      ],
    },
    {
      title: 'Clear a position with & ~',
      explanation: [
        '~(1 << k) has every position present except k. ANDing a mask with it keeps all other positions and forces position k to 0. In Python ~ produces a negative number, but ANDing it with a nonnegative mask gives a nonnegative result.',
        'Clearing is also idempotent: clearing an absent position leaves the mask unchanged.',
      ],
      example: {
        code: 'mask = 13\nprint(mask & ~(1 << 2))\nprint(mask & ~(1 << 1))',
        output: '9\n13',
        explanation:
          'Removing position 2 from 1101 gives 1001 = 9. Position 1 was already absent, so 13 is unchanged.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'mask = 15\nprint(mask & ~(1 << 3))',
          ['8', '7', '15', '-9'],
          1,
          'Clearing position 3 from 1111 leaves 0111 = 7.',
        ),
        predictOutput(
          'What does this program print?',
          'mask = 10\nprint(mask ^ (1 << 0), mask & ~(1 << 0))',
          ['11 10', '10 10', '11 11', '10 11'],
          0,
          'XOR flips the absent position 0 on, giving 11; clearing it leaves 10 unchanged.',
        ),
        choose(
          'Which expression removes position k from mask whether or not it is present?',
          [
            'mask - (1 << k)',
            'mask ^ (1 << k)',
            'mask & ~(1 << k)',
            'mask | ~(1 << k)',
          ],
          2,
          'Subtraction and XOR misbehave when k is absent; AND with the complement always forces position k to 0.',
        ),
        predictOutput(
          'What does this program print?',
          'mask = 6\nfor k in [2, 2, 0]:\n    mask &= ~(1 << k)\nprint(mask)',
          ['4', '0', '6', '2'],
          3,
          'The first clear removes position 2 (6 becomes 2); clearing it again and clearing the absent position 0 change nothing.',
        ),
      ],
    },
    {
      title: 'Apply a set-or-clear change',
      explanation: [
        'A change described as (k, present) means "make position k present" or "make it absent". Choose | or & ~ from the flag; both operations leave every other position alone.',
        'XOR (^) toggles a position instead. Toggling is not the same as setting: applying the same toggle twice undoes it, while setting twice keeps the member.',
      ],
      example: {
        code: 'mask = 0\nfor k, present in [(1, True), (3, True), (1, False), (3, True)]:\n    mask = mask | (1 << k) if present else mask & ~(1 << k)\nprint(mask)',
        output: '8',
        explanation:
          'Positions 1 and 3 are set, then position 1 is cleared; setting position 3 again changes nothing, leaving 8.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'mask = 0\nfor k, present in [(0, True), (2, True), (0, True), (2, False)]:\n    mask = mask | (1 << k) if present else mask & ~(1 << k)\nprint(mask)',
          ['1', '5', '0', '4'],
          0,
          'Position 0 stays set (setting it twice is harmless) and position 2 ends cleared.',
        ),
        predictOutput(
          'What does this program print?',
          'mask = 0\nfor k in [2, 2, 1]:\n    mask ^= 1 << k\nprint(mask)',
          ['6', '4', '2', '0'],
          2,
          'Toggling position 2 twice cancels out, leaving only position 1: 2.',
        ),
        choose(
          'A list of changes asks to add item 4 twice. Which operation keeps item 4 present after both?',
          [
            'XOR with 1 << 4 each time.',
            'Subtracting 1 << 4 each time.',
            'AND with ~(1 << 4) each time.',
            'OR with 1 << 4 each time.',
          ],
          3,
          'OR is idempotent; XOR would remove the item on the second change.',
        ),
      ],
    },
  ],
  'cp-bit-submask-step': [
    {
      title: 'Step to the next smaller submask',
      explanation: [
        'A submask of mask uses only positions that mask contains. Starting from sub = mask, the expression (sub - 1) & mask gives the next smaller submask: subtracting 1 turns the lowest set position off and the positions below it on, and the AND throws away any position outside mask.',
        'Repeating the step visits every submask once, in decreasing numeric order, without ever producing a number that uses a position outside mask.',
      ],
      example: {
        code: 'mask = 13\nsub = mask\nsteps = [sub]\nfor _ in range(3):\n    sub = (sub - 1) & mask\n    steps.append(sub)\nprint(steps)',
        output: '[13, 12, 9, 8]',
        explanation:
          '13 is 1101. 12 - 1 = 11 is 1011, and the AND with 1101 removes position 1, giving 1001 = 9.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'mask = 10\nprint((mask - 1) & mask)',
          ['9', '8', '2', '0'],
          1,
          '9 is 1001; ANDing with 1010 keeps only position 3, giving 8.',
        ),
        predictOutput(
          'What does this program print?',
          'mask = 6\nsub = 6\nresult = []\nfor _ in range(3):\n    sub = (sub - 1) & mask\n    result.append(sub)\nprint(result)',
          ['[5, 4, 3]', '[4, 3, 2]', '[4, 2, 0]', '[2, 4, 0]'],
          2,
          'The submasks of 110 below 6 are 100, 010, and 000, in decreasing order.',
        ),
        choose(
          'Why does the step AND with mask after subtracting 1?',
          [
            'To remove positions that mask does not contain.',
            'To make the result even.',
            'To add back the lowest position that the subtraction removed.',
            'To keep the result above zero.',
          ],
          0,
          'Subtracting can turn on positions below the lowest set bit; the AND keeps only those that belong to mask.',
        ),
        choose(
          'Which number is never produced by stepping through the submasks of mask = 5?',
          ['4', '1', '0', '2'],
          3,
          '5 is 101, so position 1 (worth 2) is not available to any submask.',
        ),
      ],
    },
    {
      title: 'Stop after processing zero',
      explanation: [
        'Zero is the last submask, the empty selection, and it must be processed too. One more step would compute (0 - 1) & mask = -1 & mask, which is mask itself, so the walk would start over and never end.',
        'So the loop processes sub, then breaks if sub is 0, and only otherwise takes the next step. A mask of 0 has exactly one submask: 0.',
      ],
      example: {
        code: 'mask = 5\nprint((0 - 1) & mask)\nsub = mask\nresult = []\nwhile True:\n    result.append(sub)\n    if sub == 0:\n        break\n    sub = (sub - 1) & mask\nprint(result)',
        output: '5\n[5, 4, 1, 0]',
        explanation:
          'Stepping from zero returns to 5, so the break after recording 0 is what ends the walk.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'mask = 12\nprint((0 - 1) & mask)',
          ['-1', '0', '11', '12'],
          3,
          '-1 has every position set, so ANDing with 12 gives 12: the walk would restart.',
        ),
        predictOutput(
          'What does this program print?',
          'mask = 0\nsub = mask\nresult = []\nwhile True:\n    result.append(sub)\n    if sub == 0:\n        break\n    sub = (sub - 1) & mask\nprint(result)',
          ['[]', '[0]', '[0, 0]', '[-1, 0]'],
          1,
          'The empty mask records its only submask, 0, and stops immediately.',
        ),
        choose(
          'A loop runs while sub > 0 and steps with (sub - 1) & mask. What does it miss?',
          [
            'The mask itself.',
            'Every odd submask.',
            'The empty submask 0.',
            'Nothing; it visits every submask.',
          ],
          2,
          'The condition fails as soon as sub reaches 0, so the empty selection is never processed.',
        ),
      ],
    },
    {
      title: 'Count the submasks of a mask',
      explanation: [
        'Each position present in mask can be in or out of a submask, independently. A mask with k present positions therefore has 2 to the power k submasks, including the mask itself and 0.',
        'Positions absent from mask never vary, so the count depends only on how many positions are set, not on how large the number is.',
      ],
      example: {
        code: 'for mask in [1, 6, 7, 32]:\n    count = 0\n    sub = mask\n    while True:\n        count += 1\n        if sub == 0:\n            break\n        sub = (sub - 1) & mask\n    print(mask, count)',
        output: '1 2\n6 4\n7 8\n32 2',
        explanation:
          '1 and 32 each have one set position (2 submasks), 6 has two (4), and 7 has three (8).',
      },
      questions: [
        choose(
          'How many submasks does mask = 11 (binary 1011) have?',
          ['8', '11', '16', '3'],
          0,
          'Three positions are set, giving 2³ = 8 submasks.',
        ),
        predictOutput(
          'What does this program print?',
          'mask = 40\ncount = 0\nsub = mask\nwhile True:\n    count += 1\n    if sub == 0:\n        break\n    sub = (sub - 1) & mask\nprint(count)',
          ['40', '2', '41', '4'],
          3,
          '40 is binary 101000, with two set positions, so it has 2² = 4 submasks.',
        ),
        choose(
          'Two masks are 3 and 768. Which has more submasks?',
          [
            '768, because it is larger.',
            '3, because small numbers have more subsets.',
            'Neither: each has two set positions, so four submasks.',
            'It depends on the order of the walk.',
          ],
          2,
          '3 is 11 and 768 is 1100000000; both have exactly two set positions.',
        ),
      ],
    },
  ],
  'cp-bitmasks': [
    {
      title: 'Keep the selection in one mask',
      explanation: [
        'A changing selection of indexed items can live in one integer. Each change (index, present) sets or clears one position, and reading the mask afterwards gives the current members.',
        'Because setting and clearing are idempotent, a repeated change leaves the selection as it was. Equal values at different indexes remain different members.',
      ],
      example: {
        code: 'values = [5, -2, 5, 8]\nmask = 0\nfor index, present in [(0, True), (2, True), (3, True), (0, False)]:\n    mask = mask | (1 << index) if present else mask & ~(1 << index)\nprint(mask, [values[k] for k in range(4) if mask & (1 << k)])',
        output: '12 [5, 8]',
        explanation:
          'Items 0, 2, and 3 join, then item 0 leaves: positions 2 and 3 remain, holding 5 and 8.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'mask = 0\nfor index, present in [(1, True), (4, True), (1, True), (4, False), (0, True)]:\n    mask = mask | (1 << index) if present else mask & ~(1 << index)\nprint(mask)',
          ['3', '19', '18', '2'],
          0,
          'Position 1 is set (twice), position 4 is set then cleared, and position 0 is set: 2 + 1 = 3.',
        ),
        predictOutput(
          'What does this program print?',
          'values = [3, 3, 7]\nmask = 0\nfor index, present in [(0, True), (1, True), (2, False)]:\n    mask = mask | (1 << index) if present else mask & ~(1 << index)\nprint([values[k] for k in range(3) if mask & (1 << k)])',
          ['[3]', '[3, 3, 7]', '[3, 3]', '[7]'],
          2,
          'Items 0 and 1 are both selected even though they hold equal values; item 2 was never present.',
        ),
        choose(
          'A change asks to remove an item that is not selected. What should happen to the mask?',
          [
            'It stays the same.',
            'The item is added instead.',
            'The lowest selected item is removed.',
            'The mask becomes negative.',
          ],
          0,
          'Clearing with & ~ is idempotent, so removing an absent item changes nothing.',
        ),
        predictOutput(
          'What does this program print?',
          'mask = 0\ncounts = []\nfor index, present in [(2, True), (5, True), (2, False)]:\n    mask = mask | (1 << index) if present else mask & ~(1 << index)\n    counts.append(len([k for k in range(6) if mask & (1 << k)]))\nprint(counts)',
          ['[1, 2, 3]', '[1, 1, 1]', '[2, 2, 1]', '[1, 2, 1]'],
          3,
          'The selection grows to two members, then shrinks back to one.',
        ),
      ],
    },
    {
      title: 'Score each submask of the selection',
      explanation: [
        'The subsets of the current selection are exactly the submasks of its mask. Walk them with sub = (sub - 1) & mask, stopping after 0, and score each one by adding the values at its set positions.',
        'Counting the submasks whose total equals a target counts each qualifying subset of the selection once. The empty submask has total 0, so it counts when the target is 0.',
      ],
      example: {
        code: 'values = [4, -1, 3, 2]\nmask = 7\nmatches = []\nsub = mask\nwhile True:\n    total = 0\n    for k in range(4):\n        if sub & (1 << k):\n            total += values[k]\n    if total == 3:\n        matches.append(sub)\n    if sub == 0:\n        break\n    sub = (sub - 1) & mask\nprint(matches)',
        output: '[4, 3]',
        explanation:
          'Mask 7 selects items 0, 1, and 2. Only submask 4 (the 3) and submask 3 (4 and -1) total 3; item 3 is never used.',
      },
      questions: [
        predictOutput(
          'What does this program print?',
          'values = [2, 2, 5]\nmask = 3\ncount = 0\nsub = mask\nwhile True:\n    total = 0\n    for k in range(3):\n        if sub & (1 << k):\n            total += values[k]\n    if total == 2:\n        count += 1\n    if sub == 0:\n        break\n    sub = (sub - 1) & mask\nprint(count)',
          ['1', '3', '0', '2'],
          3,
          'Submasks 1 and 2 each select one of the two equal 2s; they are different subsets.',
        ),
        predictOutput(
          'What does this program print?',
          'values = [1, 6, 1]\nmask = 5\ncount = 0\nsub = mask\nwhile True:\n    total = 0\n    for k in range(3):\n        if sub & (1 << k):\n            total += values[k]\n    if total == 0:\n        count += 1\n    if sub == 0:\n        break\n    sub = (sub - 1) & mask\nprint(count)',
          ['0', '1', '2', '4'],
          1,
          'Only the empty submask totals 0; the selected values are both 1.',
        ),
        choose(
          'Item 6 holds the value needed to reach the target, but it is not in the selection mask. Can a submask use it?',
          [
            'Yes, once the selected items alone cannot reach the target.',
            'Yes, because its value matches.',
            'Only after the walk reaches 0.',
            'No; every submask uses only selected positions.',
          ],
          3,
          'The AND in the step removes every position outside the mask, so unselected items never appear.',
        ),
        predictOutput(
          'What does this program print?',
          'values = [-3, 3, 4]\nmask = 7\nbest = None\nsub = mask\nwhile True:\n    total = 0\n    for k in range(3):\n        if sub & (1 << k):\n            total += values[k]\n    if best is None or total > best:\n        best = total\n    if sub == 0:\n        break\n    sub = (sub - 1) & mask\nprint(best)',
          ['4', '7', '10', '3'],
          1,
          'The best subset takes 3 and 4 and skips the negative value: 7.',
        ),
      ],
    },
    {
      title: 'Walk submasks instead of every mask',
      explanation: [
        'Another way to list the subsets of a selection is to loop over every mask in range(1 << n) and skip those with a position outside the selection (sub & ~mask is nonzero). It gives the same answers but always pays for all 2 to the power n masks.',
        'The submask walk pays only for the 2 to the power k subsets of a k-item selection. With 20 items and 10 selected, that is 1,024 steps instead of 1,048,576, and the gap repeats after every change.',
      ],
      example: {
        code: 'n = 12\nmask = 2340\nwalk = 0\nsub = mask\nwhile True:\n    walk += 1\n    if sub == 0:\n        break\n    sub = (sub - 1) & mask\nfull = 0\nfor sub in range(1 << n):\n    if sub & ~mask == 0:\n        full += 1\nprint(walk, full, 1 << n)',
        output: '16 16 4096',
        explanation:
          'Both methods find the same 16 subsets of the four selected items, but the full loop examines all 4,096 masks to do it.',
      },
      questions: [
        choose(
          'With 18 items and a selection of 6, how many masks does each method examine?',
          [
            'Walk: 2¹⁸ = 262,144; full loop: 2⁶ = 64',
            'Walk: 2⁶ = 64; full loop: 2¹⁸ = 262,144',
            'Both examine 2⁶ = 64',
            'Both examine 2¹⁸ = 262,144',
          ],
          1,
          'The walk visits only the selection’s submasks; the full loop tests every mask below 1 << 18.',
        ),
        predictOutput(
          'What does this program print?',
          'mask = 10\nfound = []\nfor sub in range(1 << 4):\n    if sub & ~mask == 0:\n        found.append(sub)\nprint(found)',
          ['[0, 2, 8, 10]', '[2, 8]', '[10, 8, 2, 0]', '[0, 10]'],
          0,
          'The full loop finds the same four submasks as the walk, but in increasing order.',
        ),
        choose(
          'A selection changes 200 times among 20 items, with at most 10 selected. About how many masks does the full loop examine in total?',
          ['About 200,000', 'About 2,000', 'About 210 million', 'About 20,000'],
          2,
          '200 changes × 2²⁰ masks is about 2.1 × 10⁸, while the walk needs at most 200 × 1,024 ≈ 205,000.',
        ),
      ],
    },
  ],
};
