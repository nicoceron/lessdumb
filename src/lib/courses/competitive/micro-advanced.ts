import type { Skill } from '../../curriculum';
import { choice, exercise, skill, withLargeCase } from './shared';

type Check = [string, string[], number, string, string];
type Atom = {
  id: string;
  parents: string[];
  title: string;
  summary: string;
  lesson: [string, string];
  signature: string;
  contract: string;
  solution: string;
  checks: string;
  demonstration: string;
  output: string;
  reasoning: string;
  hint: string;
  questions: [Check, Check, Check];
  cards: [[string, string], [string, string]];
};

export const competitiveAdvancedStages: Record<string, string[]> = {};
export const competitiveMicroAdvanced: Skill[] = [];

function stages(original: string, unit: string, atoms: [Atom, Atom, Atom]) {
  competitiveAdvancedStages[original] = atoms.map((atom) => atom.id);
  for (const atom of atoms) {
    competitiveMicroAdvanced.push({
      ...skill(
        atom.id,
        unit,
        atom.title,
        atom.summary,
        atom.parents,
        atom.lesson,
        atom.solution + '\n\n' + atom.demonstration,
        atom.output,
        atom.reasoning,
        [
          ...atom.questions.map((item) => choice(...item)),
          exercise(
            atom.contract,
            atom.signature + ':\n    pass\n',
            atom.solution,
            atom.checks,
            atom.reasoning,
            atom.hint,
          ),
        ],
        atom.cards,
      ),
      estimatedMinutes: 5,
    });
  }
}

stages('cp-binary-lifting', 'cp-range', [
  {
    id: 'cp-lifting-parent-row',
    parents: ['return-values', 'slicing'],
    title: 'Keep the immediate-parent row',
    summary: 'Preserve the missing-ancestor sentinel.',
    lesson: [
      'The first binary-lifting row records one-step ancestors: parents[v]. A root has -1. This sentinel means absent, not the last list position.',
      'Copy the parent row for preprocessing so later table construction cannot alter the supplied forest. A forest may have multiple roots, and parents need not appear before children.',
    ],
    signature: 'def parent_row(parents)',
    contract:
      'Implement parent_row(parents). parents describes an acyclic forest, with -1 roots and otherwise valid vertex indices. Return a new equal list preserving every -1 sentinel and input.',
    solution: 'def parent_row(parents):\n    return parents[:]',
    checks:
      'assert parent_row([]) == []\nassert parent_row([-1]) == [-1]\nassert parent_row([2, 2, -1]) == [2, 2, -1]\na = [-1, 0, -1, 2]\nb = parent_row(a)\nassert b == a and b is not a\nb[1] = -1\nassert a == [-1, 0, -1, 2]',
    demonstration: 'print(parent_row([2, 2, -1]))',
    output: '[2, 2, -1]',
    reasoning:
      'The copied base row preserves the later-index root and missing-parent markers.',
    hint: 'Use a full slice or list copy.',
    questions: [
      [
        'What does the base row up[0][v] contain?',
        [
          'The root only',
          'v’s immediate parent',
          'The second ancestor',
          'The number of children',
        ],
        1,
        'Row zero jumps 2**0 = one edge.',
        'Begin with parent pointers.',
      ],
      [
        'Why is -1 checked before another lookup?',
        [
          'Python would read the last entry',
          'It means vertex one',
          'It sorts the forest',
          'It is always positive',
        ],
        0,
        'Negative indexing can silently create a false ancestor.',
        'Remember list[-1].',
      ],
      [
        'Must a parent index be smaller than its child?',
        ['Always', 'Only with two roots', 'No', 'Only for an empty forest'],
        2,
        'Valid acyclic pointers may use any index order.',
        'Indices are labels, not depth.',
      ],
    ],
    cards: [
      [
        'What does binary-lifting row zero represent?',
        'Immediate parents, a one-edge jump.',
      ],
      [
        'What does -1 represent in an ancestor table?',
        'A missing ancestor, requiring a guard before lookup.',
      ],
    ],
  },
  {
    id: 'cp-lifting-compose-jumps',
    parents: [
      'cp-lifting-parent-row',
      'cp-work-doubling',
      'comprehensions',
      'conditional-expressions',
    ],
    title: 'Compose two equal jumps',
    summary: 'Double a jump distance using its previous row.',
    lesson: [
      'If previous[v] jumps d edges, previous[previous[v]] jumps 2d edges. This is how each table row doubles the distance of the preceding row.',
      'If the first jump is -1, the doubled jump is also -1. Check the sentinel before indexing. This atom composes just one row and leaves the supplied row unchanged.',
    ],
    signature: 'def doubled_jumps(previous)',
    contract:
      'Implement doubled_jumps(previous). previous contains a fixed-distance ancestor for each forest vertex, using -1 if missing or valid indices otherwise. Return the row for twice that distance, preserving missing ancestors and input.',
    solution:
      'def doubled_jumps(previous):\n    return [-1 if ancestor == -1 else previous[ancestor] for ancestor in previous]',
    checks:
      'assert doubled_jumps([]) == []\nassert doubled_jumps([-1]) == [-1]\nassert doubled_jumps([-1, 0, 1, 2, 3]) == [-1, -1, 0, 1, 2]\nassert doubled_jumps([2, 2, -1]) == [-1, -1, -1]\na = [-1, 0, -1, 2]\nassert doubled_jumps(a) == [-1, -1, -1, -1]\nassert a == [-1, 0, -1, 2]',
    demonstration: 'print(doubled_jumps([-1, 0, 1, 2, 3]))',
    output: '[-1, -1, 0, 1, 2]',
    reasoning:
      'Each entry follows the previous row twice, giving two-edge ancestors in this example.',
    hint: 'For each first ancestor, return -1 if absent; otherwise lookup previous[first].',
    questions: [
      [
        'A previous row jumps four edges. What does its composition jump?',
        ['Two', 'Four', 'Eight', 'Sixteen'],
        2,
        'Two four-edge jumps combine to eight.',
        'Add equal distances.',
      ],
      [
        'What if the first jump is absent?',
        [
          'Use previous[-1]',
          'Keep -1',
          'Return zero',
          'Jump to the final vertex',
        ],
        1,
        'No later ancestor exists above an absent one.',
        'Guard the sentinel.',
      ],
      [
        'How many such compositions reach 8-edge jumps from parents?',
        ['Three', 'One', 'Eight', 'Zero'],
        0,
        'One doubles to two, then four, then eight.',
        'Count doubling stages.',
      ],
    ],
    cards: [
      [
        'How is a doubling row formed?',
        'Compose the previous jump with itself, guarding -1.',
      ],
      ['What distance does up[j] represent?', '2**j parent edges.'],
    ],
  },
  {
    id: 'cp-lifting-query-bits',
    parents: ['cp-lifting-compose-jumps', 'cp-bit-position', 'nested-lists'],
    title: 'Select jumps from distance bits',
    summary: 'Answer one ancestor query without overflowing the table.',
    lesson: [
      'A distance decomposes into binary powers. For each set bit j, follow row j from the current vertex. The accumulated jumps equal the bits processed so far.',
      'In an acyclic forest of n vertices, distance >= n has no ancestor. Check that bound before table access, and stop if the current vertex becomes -1. A zero distance returns the original vertex.',
    ],
    signature: 'def jump_ancestor(table, vertex, steps)',
    contract:
      'Implement jump_ancestor(table, vertex, steps). table is a valid binary-lifting table for a nonempty acyclic n-vertex forest, with at least max(1, n.bit_length()) rows; vertex is valid and steps is nonnegative, possibly huge. Return the ancestor or -1 if absent. Preserve table. A hidden case runs 50,000 queries on a 100,000-vertex chain and must finish within 3 seconds.',
    solution:
      'def jump_ancestor(table, vertex, steps):\n    n = len(table[0])\n    if steps >= n:\n        return -1\n    bit = 0\n    while steps and vertex != -1:\n        if steps & 1:\n            vertex = table[bit][vertex]\n        steps >>= 1\n        bit += 1\n    return vertex',
    checks: withLargeCase(
      'table = [[-1, 0, 1, 2, 3], [-1, -1, 0, 1, 2], [-1, -1, -1, -1, 0]]\nassert jump_ancestor(table, 4, 0) == 4\nassert jump_ancestor(table, 4, 1) == 3\nassert jump_ancestor(table, 4, 3) == 1\nassert jump_ancestor(table, 4, 4) == 0\nassert jump_ancestor(table, 4, 5) == -1\nassert jump_ancestor(table, 0, 1) == -1\nassert jump_ancestor(table, 4, 10**100) == -1\nassert table[0] == [-1, 0, 1, 2, 3]',
      `_table = [[vertex - 1 for vertex in range(100000)]]
for _ in range(1, 17):
    _previous = _table[-1]
    _table.append([-1 if parent == -1 else _previous[parent] for parent in _previous])
_vertices = _numbers(50000, 0, 99999, 451)
_steps = _numbers(50000, 0, 100000, 452)
def _run():
    return [jump_ancestor(_table, _vertices[i], _steps[i]) for i in range(50000)]
_result, _seconds = _timed(_run)
assert _checksum(_result) == 273083971310116976, "50,000 queries on a 100,000-vertex chain returned wrong ancestors."
_check_time(_seconds, "50,000 queries on a 100,000-vertex chain", "Use one table row per set bit of steps instead of walking single parents.")`,
    ),
    demonstration:
      'table = [[-1, 0, 1, 2, 3], [-1, -1, 0, 1, 2], [-1, -1, -1, -1, 0]]\nprint(jump_ancestor(table, 4, 3))',
    output: '1',
    reasoning:
      'Distance three is one plus two; vertex four moves to three, then one.',
    hint: 'Reject steps >= n, then consume low bits and use the matching row when set.',
    questions: [
      [
        'Which jumps form distance five?',
        [
          'Five one-edge jumps only',
          'One and four',
          'Two and four',
          'Three and two rows',
        ],
        1,
        'Five is binary 101.',
        'Select powers for set bits.',
      ],
      [
        'What is a zero-step ancestor query?',
        [
          'The original vertex',
          '-1 always',
          'The root always',
          'The immediate parent',
        ],
        0,
        'No edges are followed.',
        'Zero has no set bits.',
      ],
      [
        'Why reject steps >= n first?',
        [
          'It sorts the table',
          'Every vertex is then a root',
          'An n-vertex forest chain has fewer than n edges',
          'All queries must be small',
        ],
        2,
        'The bound also protects against arbitrarily large bit positions.',
        'A forest cannot revisit a vertex.',
      ],
    ],
    cards: [
      [
        'How are ancestor query jumps selected?',
        'Use row j for each set bit j in the distance.',
      ],
      [
        'What protects a query with an enormous distance?',
        'In an n-vertex acyclic forest, steps >= n returns -1 before lookups.',
      ],
    ],
  },
]);

stages('cp-scc', 'cp-range', [
  {
    id: 'cp-scc-reverse-edges',
    parents: ['cp-graph-models'],
    title: 'Reverse directed connections',
    summary: 'Build incoming adjacency while retaining all vertices.',
    lesson: [
      'Reversing a directed graph changes every source -> target edge to target -> source. Reversing twice restores the original directions.',
      'An adjacency list needs one list per vertex, including isolated vertices. Duplicate edges and self-loops remain represented. This atom builds only reversed adjacency for the later SCC pass.',
    ],
    signature: 'def reversed_adjacency(n, edges)',
    contract:
      'Implement reversed_adjacency(n, edges) for n >= 0 and valid directed edge endpoints from 0 through n-1. Return a list of n incoming-neighbor lists, preserving input edge order, duplicates, and self-loops. Preserve edges.',
    solution:
      'def reversed_adjacency(n, edges):\n    reverse = [[] for _ in range(n)]\n    for source, target in edges:\n        reverse[target].append(source)\n    return reverse',
    checks:
      'assert reversed_adjacency(0, []) == []\nassert reversed_adjacency(3, []) == [[], [], []]\nassert reversed_adjacency(3, [(0, 1), (2, 1), (1, 2)]) == [[], [0, 2], [1]]\nedges = [(0, 0), (0, 1), (0, 1)]\nassert reversed_adjacency(2, edges) == [[0], [0, 0]]\nassert edges == [(0, 0), (0, 1), (0, 1)]',
    demonstration: 'print(reversed_adjacency(3, [(0, 1), (1, 2)]))',
    output: '[[], [0], [1]]',
    reasoning:
      'Each target stores its original sources as outgoing neighbors in the reversed graph.',
    hint: 'Allocate distinct empty lists, then append source to reverse[target].',
    questions: [
      [
        'What is the reverse of edge 2 -> 5?',
        ['2 -> 5', '5 -> 2', '2 -> 2', '5 -> 5'],
        1,
        'Swap source and target.',
        'Direction is reversed.',
      ],
      [
        'Why allocate n separate neighbor lists?',
        [
          'Only roots need lists',
          'Duplicates disappear',
          'Every vertex, including isolated ones, needs representation',
          'The graph becomes undirected',
        ],
        2,
        'SCCs include isolated vertices too.',
        'Do not omit vertices with no edges.',
      ],
      [
        'What happens to a self-loop under reversal?',
        [
          'It remains a self-loop',
          'It is deleted',
          'It becomes two vertices',
          'It reverses the vertex index',
        ],
        0,
        'Its source and target are the same.',
        'Swap equal endpoints.',
      ],
    ],
    cards: [
      [
        'How is a directed graph reversed?',
        'Swap each edge’s source and target.',
      ],
      [
        'Are isolated vertices represented in SCC preprocessing?',
        'Yes; allocate adjacency for every vertex.',
      ],
    ],
  },
  {
    id: 'cp-scc-finish-order',
    parents: ['cp-dfs', 'cp-tree-traversal', 'break-continue'],
    title: 'Record DFS completion',
    summary: 'Distinguish finishing order from discovery order.',
    lesson: [
      'DFS finishing order records a vertex only after all outgoing neighbors have been processed. Discovery order records it too early and cannot replace the SCC ordering.',
      'Use a frame (vertex, next_neighbor_index) to pause each traversal. An explicit stack avoids recursion depth limits and marks vertices on discovery so cycles cannot repeatedly push them.',
    ],
    signature: 'def dfs_finish_order(graph)',
    contract:
      'Implement dfs_finish_order(graph). graph is a directed adjacency list with valid vertex indices. Visit roots in increasing order and neighbors in listed order. Return vertices in DFS finishing order using iterative frames, including isolated vertices and tolerating duplicates/self-loops. Preserve graph.',
    solution:
      'def dfs_finish_order(graph):\n    seen = [False] * len(graph)\n    order = []\n    for root in range(len(graph)):\n        if seen[root]:\n            continue\n        seen[root] = True\n        stack = [(root, 0)]\n        while stack:\n            vertex, next_index = stack[-1]\n            if next_index == len(graph[vertex]):\n                order.append(vertex)\n                stack.pop()\n            else:\n                neighbor = graph[vertex][next_index]\n                stack[-1] = (vertex, next_index + 1)\n                if not seen[neighbor]:\n                    seen[neighbor] = True\n                    stack.append((neighbor, 0))\n    return order',
    checks:
      'assert dfs_finish_order([]) == []\nassert dfs_finish_order([[], [], []]) == [0, 1, 2]\nassert dfs_finish_order([[1], [2], []]) == [2, 1, 0]\nassert dfs_finish_order([[1, 2], [], []]) == [1, 2, 0]\nassert dfs_finish_order([[0, 1, 1], [0]]) == [1, 0]\ngraph = [[i + 1] for i in range(1499)] + [[]]\nassert dfs_finish_order(graph) == list(range(1499, -1, -1))',
    demonstration: 'print(dfs_finish_order([[1], [2], []]))',
    output: '[2, 1, 0]',
    reasoning:
      'The deepest vertex finishes first; the root is recorded only after its descendant chain completes.',
    hint: 'Keep each next-neighbor index in the stack frame and append when no neighbors remain.',
    questions: [
      [
        'When is a vertex added to finishing order?',
        [
          'On first discovery',
          'After all neighbors are processed',
          'Before pushing its frame',
          'Only if isolated',
        ],
        1,
        'Completion is later than discovery.',
        'Wait until the frame has no next neighbor.',
      ],
      [
        'Why save the next-neighbor index in a frame?',
        [
          'To sort edges',
          'To count SCCs directly',
          'To resume a paused traversal',
          'To remove cycles',
        ],
        2,
        'The parent continues where it left off after a child finishes.',
        'A recursive call normally retains this position.',
      ],
      [
        'Why mark a vertex when it is discovered?',
        [
          'To avoid repeated pushes through cycles',
          'To erase its neighbors',
          'To reverse its edges',
          'To finish it immediately',
        ],
        0,
        'Already discovered vertices are not entered again.',
        'Cycles should not grow the stack forever.',
      ],
    ],
    cards: [
      [
        'How does finishing order differ from discovery order?',
        'Finishing records a vertex after its outgoing traversal completes.',
      ],
      [
        'What does an iterative DFS frame retain?',
        'The current vertex and its next unprocessed neighbor position.',
      ],
    ],
  },
  {
    id: 'cp-scc-reverse-components',
    parents: ['cp-scc-reverse-edges', 'cp-scc-finish-order'],
    title: 'Collect components in reverse finishing order',
    summary:
      'Keep second-pass traversals inside one mutual-reachability group.',
    lesson: [
      'Given the original graph’s finishing order, process vertices in decreasing finishing order on reversed edges. Each unvisited-root traversal collects one strongly connected component.',
      'Global visited marks keep earlier components separate. Sort each component and the final list for deterministic reporting. A singleton without a self-loop is still an SCC, even though it contains no directed cycle.',
    ],
    signature: 'def collect_reverse_components(reverse, order)',
    contract:
      'Implement collect_reverse_components(reverse, order). reverse is a directed graph’s reversed adjacency list, and order is a complete valid DFS finishing order of that original graph. Use iterative traversals in reversed(order), and return sorted vertex lists, with groups sorted lexicographically. Preserve inputs.',
    solution:
      'def collect_reverse_components(reverse, order):\n    seen = [False] * len(reverse)\n    groups = []\n    for root in reversed(order):\n        if seen[root]:\n            continue\n        seen[root] = True\n        stack = [root]\n        group = []\n        while stack:\n            vertex = stack.pop()\n            group.append(vertex)\n            for neighbor in reverse[vertex]:\n                if not seen[neighbor]:\n                    seen[neighbor] = True\n                    stack.append(neighbor)\n        groups.append(sorted(group))\n    return sorted(groups)',
    checks:
      'assert collect_reverse_components([], []) == []\nassert collect_reverse_components([[], [], []], [0, 1, 2]) == [[0], [1], [2]]\nassert collect_reverse_components([[1], [0], [1]], [2, 1, 0]) == [[0, 1], [2]]\nassert collect_reverse_components([[2], [0], [1], [2]], [3, 2, 1, 0]) == [[0, 1, 2], [3]]\nassert collect_reverse_components([[0]], [0]) == [[0]]\nreverse = [[1], [0], [1, 3], [2], [3]]\norder = [4, 3, 2, 1, 0]\nassert collect_reverse_components(reverse, order) == [[0, 1], [2, 3], [4]]\nassert reverse == [[1], [0], [1, 3], [2], [3]] and order == [4, 3, 2, 1, 0]',
    demonstration:
      'print(collect_reverse_components([[1], [0], [1, 3], [2], [3]], [4, 3, 2, 1, 0]))',
    output: '[[0, 1], [2, 3], [4]]',
    reasoning:
      'Reversed finishing order selects zero first, then two, then four, separating the three mutual-reachability groups.',
    hint: 'Traverse reverse edges from each unseen root in reversed(order), with one shared seen list.',
    questions: [
      [
        'Which order controls the second SCC pass?',
        [
          'Discovery order',
          'Decreasing finishing order',
          'Increasing vertex value only',
          'Input edge order',
        ],
        1,
        'Kosaraju uses reversed completion order.',
        'Reverse the first pass’s order.',
      ],
      [
        'Why keep visited marks across second-pass roots?',
        [
          'To skip vertices already assigned to a component',
          'To remove isolated vertices',
          'To delete reverse edges',
          'To require one root',
        ],
        0,
        'Every vertex belongs to one component.',
        'Do not regroup previous components.',
      ],
      [
        'Must a singleton SCC contain a cycle?',
        [
          'Always',
          'Never',
          'Only if it has a self-loop',
          'Only with duplicate incoming edges',
        ],
        2,
        'A zero-edge path gives self-reachability but is not a directed cycle.',
        'Distinguish reachability from a cycle.',
      ],
    ],
    cards: [
      [
        'What order finds SCCs on the reversed graph?',
        'Decreasing DFS finishing order from the original graph.',
      ],
      [
        'Why is the SCC condensation graph acyclic?',
        'A cycle among distinct components would make them mutually reachable and one SCC.',
      ],
    ],
  },
]);

stages('cp-fenwick', 'cp-range', [
  {
    id: 'cp-fenwick-lowbit',
    parents: ['cp-bit-position'],
    title: 'Isolate the lowest set bit',
    summary: 'Read the size of one Fenwick block.',
    lesson: [
      'For positive integer i, lowbit(i) = i & -i isolates its lowest set bit. In a Fenwick tree, that power of two is the length of the block ending at internal index i.',
      'Internal indexing starts at one. Zero has lowbit zero, so advancing an update from zero would never move. This atom computes block sizes before using them for traversal.',
    ],
    signature: 'def fenwick_block_size(index)',
    contract:
      'Implement fenwick_block_size(index) for a nonnegative integer. Return index & -index; zero returns zero. A real update must not begin at zero.',
    solution: 'def fenwick_block_size(index):\n    return index & -index',
    checks:
      'assert fenwick_block_size(0) == 0\nassert fenwick_block_size(1) == 1\nassert fenwick_block_size(6) == 2\nassert fenwick_block_size(12) == 4\nassert fenwick_block_size(16) == 16\nassert fenwick_block_size(1 << 100) == 1 << 100',
    demonstration: 'print([fenwick_block_size(i) for i in [5, 6, 8, 12]])',
    output: '[1, 2, 8, 4]',
    reasoning: 'The lowest set bit determines the internal block size.',
    hint: 'Use bitwise AND between index and its negation.',
    questions: [
      [
        'What is lowbit(12)?',
        ['1', '2', '4', '12'],
        2,
        'Twelve is binary 1100, whose lowest set bit is four.',
        'Find the rightmost one.',
      ],
      [
        'What does lowbit(i) measure in a Fenwick node?',
        [
          'Its block length',
          'Total array length',
          'Always one element',
          'The largest input value',
        ],
        0,
        'The node ends a block of that power-of-two length.',
        'Read the index structure.',
      ],
      [
        'Why is zero unsafe as an update starting index?',
        [
          'It is negative',
          'Its lowbit is zero and cannot advance',
          'It is outside all lists',
          'It represents the final element',
        ],
        1,
        'Adding zero repeats forever.',
        'Compute 0 & -0.',
      ],
    ],
    cards: [
      ['What is lowbit(i)?', 'i & -i, the lowest set bit.'],
      [
        'What indexing does a Fenwick update use internally?',
        'One-based indexing; never start at zero.',
      ],
    ],
  },
  {
    id: 'cp-fenwick-prefix-walk',
    parents: ['cp-fenwick-lowbit', 'cp-prefix-boundaries', 'while-loops'],
    title: 'Collect disjoint prefix blocks',
    summary: 'Subtract lowbits until the prefix is exhausted.',
    lesson: [
      'For a public prefix [0, end), begin at internal index end. Add tree[end], then subtract its lowbit to remove the covered suffix block.',
      'Repeat until index zero. The selected blocks are disjoint and cover the prefix exactly. Empty prefix end zero returns zero without reading any block.',
    ],
    signature: 'def fenwick_prefix(tree, end)',
    contract:
      'Implement fenwick_prefix(tree, end). tree is a valid one-based Fenwick sum list with unused index zero, and 0 <= end < len(tree). Return the public prefix sum [0, end). Preserve tree.',
    solution:
      'def fenwick_prefix(tree, end):\n    total = 0\n    while end > 0:\n        total += tree[end]\n        end -= end & -end\n    return total',
    checks:
      'assert fenwick_prefix([0], 0) == 0\ntree = [0, 2, 5, -1, 8, 7]\nassert fenwick_prefix(tree, 0) == 0\nassert fenwick_prefix(tree, 1) == 2\nassert fenwick_prefix(tree, 3) == 4\nassert fenwick_prefix(tree, 5) == 15\nassert tree == [0, 2, 5, -1, 8, 7]',
    demonstration: 'print(fenwick_prefix([0, 2, 5, -1, 8, 7], 5))',
    output: '15',
    reasoning:
      'At end five, the walk adds the final one-element block seven and the four-element block eight.',
    hint: 'Add tree[end], then end -= end & -end until zero.',
    questions: [
      [
        'Which internal index starts prefix [0, end)?',
        ['end + 1', 'end', '0 always', 'end - 1'],
        1,
        'The endpoint counts the number of public elements.',
        'Updates and queries use different conversions.',
      ],
      [
        'Which direction does the prefix walk move?',
        ['Add lowbit', 'Double index', 'Subtract lowbit', 'Increment by one'],
        2,
        'It removes one covered suffix block at each step.',
        'Move toward zero.',
      ],
      [
        'What is the sum for an empty prefix?',
        ['Zero', 'Infinity', 'The final value', 'None always'],
        0,
        'No elements contribute.',
        'Zero is the sum identity.',
      ],
    ],
    cards: [
      [
        'How does a Fenwick prefix query move?',
        'Subtract the current lowbit after adding that node.',
      ],
      ['Which public range does prefix(end) represent?', '[0, end).'],
    ],
  },
  {
    id: 'cp-fenwick-update-walk',
    parents: ['cp-fenwick-lowbit', 'slicing', 'while-loops'],
    title: 'Visit containing blocks',
    summary: 'Add lowbits after converting one public index.',
    lesson: [
      'A public zero-based point index maps to internal index index + 1. Add its delta to that node and repeatedly add lowbit to visit larger containing blocks.',
      'This atom copies a prebuilt tree and performs one point addition. Negative deltas are allowed, and the walk stops when its internal index reaches the list length.',
    ],
    signature: 'def fenwick_add(tree, index, delta)',
    contract:
      'Implement fenwick_add(tree, index, delta). tree is a valid one-based Fenwick sum list of n + 1 entries, 0 <= index < n, and delta is an integer. Return a copied tree after a public point addition. Preserve tree.',
    solution:
      'def fenwick_add(tree, index, delta):\n    result = tree[:]\n    internal = index + 1\n    while internal < len(result):\n        result[internal] += delta\n        internal += internal & -internal\n    return result',
    checks:
      'assert fenwick_add([0, 7], 0, -2) == [0, 5]\nassert fenwick_add([0, 2, 5, -1, 8, 7], 0, 3) == [0, 5, 8, -1, 11, 7]\nassert fenwick_add([0, 2, 5, -1, 8, 7], 4, -4) == [0, 2, 5, -1, 8, 3]\ntree = [0, 2, 5, -1, 8, 7]\nassert fenwick_add(tree, 2, 5) == [0, 2, 5, 4, 13, 7]\nassert tree == [0, 2, 5, -1, 8, 7]',
    demonstration: 'print(fenwick_add([0, 2, 5, -1, 8, 7], 2, 5))',
    output: '[0, 2, 5, 4, 13, 7]',
    reasoning:
      'The public index-two addition changes internal blocks three and four.',
    hint: 'Copy, begin at index + 1, and advance by internal & -internal.',
    questions: [
      [
        'What internal index corresponds to public index zero?',
        ['0', '1', 'n', '-1'],
        1,
        'The representation is one-based.',
        'Add one at the boundary.',
      ],
      [
        'Which direction does an update walk move?',
        ['Subtract lowbit', 'Decrease by one', 'Add lowbit', 'Stay at zero'],
        2,
        'It visits larger blocks containing the point.',
        'Move away from zero.',
      ],
      [
        'Can a point-add delta be negative?',
        ['Yes', 'Never', 'Only for index zero', 'Only if tree is empty'],
        0,
        'A sum structure supports decreasing a value too.',
        'Addition accepts negative integers.',
      ],
    ],
    cards: [
      [
        'How does a Fenwick point update move?',
        'Convert index to index + 1, then repeatedly add lowbit.',
      ],
      [
        'What is updated at each visited node?',
        'Add the same point delta to its containing-block sum.',
      ],
    ],
  },
]);

stages('cp-segment-tree', 'cp-range', [
  {
    id: 'cp-segment-leaf-layout',
    parents: [
      'cp-work-doubling',
      'slicing',
      'multiple-returns',
      'list-repetition',
      'number-builtins',
    ],
    title: 'Pad minimum-tree leaves',
    summary: 'Place values under a power-of-two boundary.',
    lesson: [
      'A simple iterative segment tree pads its leaf count to a power of two. Actual values begin at that boundary; unused leaves use infinity.',
      'For minima, min(x, infinity) equals x, so padding cannot corrupt real values. This atom creates only the leaf layout; parent summaries are still unfinished.',
    ],
    signature: 'def minimum_leaf_layout(values)',
    contract:
      'Implement minimum_leaf_layout(values) for an integer list. Find the smallest power-of-two size >= len(values), using size 1 for empty input. Return (size, tree), where tree has 2*size infinities and values occupy tree[size:size+len(values)]. Preserve values.',
    solution:
      'def minimum_leaf_layout(values):\n    size = 1\n    while size < len(values):\n        size *= 2\n    tree = [float("inf")] * (2 * size)\n    tree[size:size + len(values)] = values\n    return (size, tree)',
    checks:
      'assert minimum_leaf_layout([]) == (1, [float("inf"), float("inf")])\nassert minimum_leaf_layout([7]) == (1, [float("inf"), 7])\nsize, tree = minimum_leaf_layout([8, 3, 6])\nassert size == 4 and len(tree) == 8\nassert tree[4:] == [8, 3, 6, float("inf")]\nassert all(value == float("inf") for value in tree[:4])\na = [2, -4]\nassert minimum_leaf_layout(a)[1][2:] == a\nassert a == [2, -4]',
    demonstration:
      'size, tree = minimum_leaf_layout([8, 3, 6])\nprint(size)\nprint(tree[size:])',
    output: '4\n[8, 3, 6, inf]',
    reasoning:
      'Three real leaves need a four-leaf boundary; the unused fourth leaf is neutral infinity.',
    hint: 'Double size until sufficient, allocate 2 * size entries, then fill the leaf slice.',
    questions: [
      [
        'Why pad minimum leaves with infinity?',
        [
          'It is the largest real input',
          'min(x, infinity) preserves x',
          'It makes every answer infinite',
          'It allows subtraction',
        ],
        1,
        'Infinity is the minimum identity.',
        'Padding must not change a result.',
      ],
      [
        'Which leaf size suffices for five values?',
        ['5', '6', '8', '10'],
        2,
        'Eight is the smallest power of two >= five.',
        'Double from one.',
      ],
      [
        'Where do actual leaves start in this representation?',
        ['At index size', 'At zero', 'At index one', 'At 2 * size'],
        0,
        'Internal parent nodes occupy earlier positive indices.',
        'Use the layout boundary.',
      ],
    ],
    cards: [
      [
        'What identity pads a range-minimum tree?',
        'Infinity, because min(x, infinity) = x.',
      ],
      [
        'How large is its padded leaf count?',
        'The smallest power of two at least the real array length, with one for empty input.',
      ],
    ],
  },
  {
    id: 'cp-segment-parent-build',
    parents: ['cp-segment-leaf-layout', 'cp-heap-invariant', 'parameters'],
    title: 'Build summaries upward',
    summary: 'Combine child minima after leaves are ready.',
    lesson: [
      'Node i has children 2*i and 2*i + 1. Its minimum is the smaller child summary. Build from size - 1 downward to one so every child is already complete.',
      'Index zero is unused. This atom copies a valid padded leaf layout and builds all internal minima, without updates or range queries yet.',
    ],
    signature: 'def build_minimum_parents(tree, size)',
    contract:
      'Implement build_minimum_parents(tree, size), where size is a positive power of two, len(tree) == 2*size, and leaves at size onward are integers or infinity. Copy tree, fill internal nodes size-1 through one with child minima, and preserve input.',
    solution:
      'def build_minimum_parents(tree, size):\n    result = tree[:]\n    for node in range(size - 1, 0, -1):\n        result[node] = min(result[2 * node], result[2 * node + 1])\n    return result',
    checks:
      'inf = float("inf")\nassert build_minimum_parents([inf, 7], 1) == [inf, 7]\nassert build_minimum_parents([inf, inf], 1) == [inf, inf]\ntree = [inf, inf, inf, inf, 8, 3, 6, inf]\nassert build_minimum_parents(tree, 4) == [inf, 3, 3, 6, 8, 3, 6, inf]\nassert tree == [inf, inf, inf, inf, 8, 3, 6, inf]',
    demonstration:
      'print(build_minimum_parents([float("inf")] * 4 + [8, 3, 6, 1], 4))',
    output: '[inf, 1, 3, 1, 8, 3, 6, 1]',
    reasoning: 'Child pairs build nodes two and three before the root minimum.',
    hint: 'Use range(size - 1, 0, -1) and children 2*node and 2*node+1.',
    questions: [
      [
        'Which indices are node i’s children?',
        [
          'i - 1 and i + 1',
          '2*i and 2*i + 1',
          'i and i + size',
          'Always zero and one',
        ],
        1,
        'Binary heap-style indexing doubles the parent index.',
        'Use the tree representation.',
      ],
      [
        'Why build parents downward from size - 1?',
        [
          'Children then exist before their parent',
          'It sorts leaves',
          'It removes infinity',
          'It reverses input',
        ],
        0,
        'Larger child indices are processed first.',
        'Dependencies must be ready.',
      ],
      [
        'What does root node one contain after building?',
        [
          'The first value only',
          'The array length',
          'The minimum of all real values',
          'The last leaf index',
        ],
        2,
        'Combining every leaf produces the overall minimum.',
        'Follow children to leaves.',
      ],
    ],
    cards: [
      [
        'What is a minimum-tree parent invariant?',
        'tree[i] = min(tree[2*i], tree[2*i + 1]).',
      ],
      [
        'Why build parents from high indices to low?',
        'Each child summary is ready before its parent.',
      ],
    ],
  },
  {
    id: 'cp-segment-query-boundaries',
    parents: ['cp-segment-parent-build', 'cp-prefix-query'],
    title: 'Collect one half-open range',
    summary: 'Consume boundary nodes while moving upward.',
    lesson: [
      'Move public [left, right) endpoints to leaf indices. An odd left is a right child: consume it and advance left. An odd right excludes the next node, so decrement right and consume that node.',
      'Then halve both boundaries and repeat. Collected blocks are disjoint and exactly cover the range. This atom queries a built tree and returns None for an empty range.',
    ],
    signature: 'def query_minimum(tree, size, left, right)',
    contract:
      'Implement query_minimum(tree, size, left, right) for a built padded minimum tree and valid public 0 <= left <= right <= size. Return the minimum on [left, right), or None if empty. Preserve tree. A hidden case runs 30,000 queries on a 131,072-leaf tree and must finish within 3 seconds.',
    solution:
      'def query_minimum(tree, size, left, right):\n    if left == right:\n        return None\n    left += size\n    right += size\n    best = float("inf")\n    while left < right:\n        if left % 2:\n            best = min(best, tree[left])\n            left += 1\n        if right % 2:\n            right -= 1\n            best = min(best, tree[right])\n        left //= 2\n        right //= 2\n    return best',
    checks: withLargeCase(
      'tree = [float("inf"), 1, 3, 1, 8, 3, 6, 1]\nassert query_minimum(tree, 4, 0, 4) == 1\nassert query_minimum(tree, 4, 0, 3) == 3\nassert query_minimum(tree, 4, 1, 3) == 3\nassert query_minimum(tree, 4, 2, 3) == 6\nassert query_minimum(tree, 4, 2, 2) is None\nassert query_minimum(tree, 4, 3, 4) == 1\nassert tree == [float("inf"), 1, 3, 1, 8, 3, 6, 1]',
      `_size = 1 << 17
_tree = [float("inf")] * _size + _numbers(_size, -10**9, 10**9, 441)
for _node in range(_size - 1, 0, -1):
    _tree[_node] = min(_tree[2 * _node], _tree[2 * _node + 1])
_xs = _numbers(30000, 0, _size, 442)
_ys = _numbers(30000, 0, _size, 443)
def _run():
    return [query_minimum(_tree, _size, min(_xs[i], _ys[i]), max(_xs[i], _ys[i])) for i in range(30000)]
_result, _seconds = _timed(_run)
assert _checksum(_result) == 141335678600146869, "30,000 queries on a 131,072-leaf tree returned wrong minima."
_check_time(_seconds, "30,000 queries on a 131,072-leaf tree", "Consume boundary nodes while moving upward instead of scanning the leaves.")`,
    ),
    demonstration:
      'print(query_minimum([float("inf"), 1, 3, 1, 8, 3, 6, 1], 4, 0, 3))',
    output: '3',
    reasoning:
      'The final leaf value one lies outside [0, 3), so it cannot dominate this query.',
    hint: 'Consume odd boundaries before halving both indices.',
    questions: [
      [
        'Which public positions are in [1, 3)?',
        ['1, 2, 3', '1, 2', '2, 3', 'Only 3'],
        1,
        'The right endpoint is excluded.',
        'Use Python slice semantics.',
      ],
      [
        'What happens at an odd right boundary?',
        [
          'Consume tree[right] directly',
          'Always return None',
          'Decrement then consume',
          'Advance by two',
        ],
        2,
        'The boundary itself is excluded.',
        'The included node is just before it.',
      ],
      [
        'Why cannot prefix minima be subtracted for this query?',
        [
          'Minimum has no inverse that removes an earlier prefix',
          'Values are always positive',
          'Minimum is not associative',
          'The tree is unsorted',
        ],
        0,
        'An outside smaller value can hide the range minimum.',
        'Contrast sums with minima.',
      ],
    ],
    cards: [
      [
        'What range convention does the minimum query use?',
        '[left, right), including left and excluding right.',
      ],
      [
        'How are segment query blocks combined?',
        'Consume the relevant odd boundary nodes, then move both boundaries to parents.',
      ],
    ],
  },
]);

stages('cp-gcd', 'cp-number-theory', [
  {
    id: 'cp-gcd-divisibility',
    parents: ['parameters'],
    title: 'Test a common divisor',
    summary: 'Use exact remainders for divisibility.',
    lesson: [
      'A positive divisor d divides integer a when a % d is zero. Negative and zero values of a use the same test. Every positive d divides zero.',
      'A common divisor must divide both integers. This atom checks a proposed positive divisor before deriving the greatest one.',
    ],
    signature: 'def is_common_divisor(a, b, divisor)',
    contract:
      'Implement is_common_divisor(a, b, divisor) for integers a and b and positive integer divisor. Return a boolean indicating that divisor divides both exactly.',
    solution:
      'def is_common_divisor(a, b, divisor):\n    return a % divisor == 0 and b % divisor == 0',
    checks:
      'assert is_common_divisor(18, 30, 6) is True\nassert is_common_divisor(18, 30, 9) is False\nassert is_common_divisor(-12, 18, 6) is True\nassert is_common_divisor(0, 15, 5) is True\nassert is_common_divisor(0, 0, 7) is True\nassert is_common_divisor(7, 9, 1) is True',
    demonstration: 'print(is_common_divisor(18, 30, 6))',
    output: 'True',
    reasoning: 'Both remainders are zero.',
    hint: 'Check a % divisor and b % divisor separately, then combine with and.',
    questions: [
      [
        'What proves d divides a exactly?',
        ['a % d == 0', 'a < d', 'a == 0 only', 'a / d > 0'],
        0,
        'Divisibility means no remainder.',
        'Use modulo.',
      ],
      [
        'Does positive d divide zero?',
        ['Never', 'Yes', 'Only d = 1', 'Only even d'],
        1,
        'Zero is d times zero.',
        'Zero remainder is exact.',
      ],
      [
        'Which condition makes d common to a and b?',
        [
          'Either remainder is zero',
          'd is prime',
          'Both remainders are zero',
          'a equals b',
        ],
        2,
        'Common means dividing both.',
        'Use and.',
      ],
    ],
    cards: [
      ['How do you test divisibility by positive d?', 'a % d == 0.'],
      [
        'What defines a common divisor?',
        'A positive integer dividing both values exactly.',
      ],
    ],
  },
  {
    id: 'cp-gcd-remainder-step',
    parents: ['cp-gcd-divisibility', 'multiple-returns'],
    title: 'Preserve common divisors with a remainder',
    summary: 'Apply one Euclidean state transition.',
    lesson: [
      'For nonnegative a and positive b, replace (a, b) with (b, a % b). Both pairs have exactly the same common divisors.',
      'The remainder is smaller than b, so repeated steps decrease the second argument. This atom performs one step; termination is handled in the full gcd loop.',
    ],
    signature: 'def euclid_step(a, b)',
    contract:
      'Implement euclid_step(a, b), where a >= 0 and b > 0 are integers. Return the tuple (b, a % b).',
    solution: 'def euclid_step(a, b):\n    return (b, a % b)',
    checks:
      'assert euclid_step(30, 18) == (18, 12)\nassert euclid_step(18, 12) == (12, 6)\nassert euclid_step(12, 6) == (6, 0)\nassert euclid_step(0, 7) == (7, 0)\nassert euclid_step(3, 9) == (9, 3)',
    demonstration: 'print(euclid_step(30, 18))',
    output: '(18, 12)',
    reasoning:
      'Subtracting one multiple of eighteen leaves twelve without changing common divisors.',
    hint: 'Return b first and a % b second.',
    questions: [
      [
        'Which pair preserves the gcd?',
        ['(a + 1, b)', '(b, a % b)', '(a * b, 0)', '(a - 1, b - 1)'],
        1,
        'Euclid removes an integer multiple of b.',
        'Remainders retain common divisors.',
      ],
      [
        'How does the new second value compare to positive b?',
        [
          'It is always larger',
          'It equals b',
          'It is smaller',
          'It is negative',
        ],
        2,
        'The remainder lies from zero through b - 1.',
        'Use positive-modulus bounds.',
      ],
      [
        'What does a zero remainder indicate?',
        ['b divides a', 'a is prime', 'b is zero', 'No common divisor exists'],
        0,
        'The division was exact.',
        'Apply divisibility.',
      ],
    ],
    cards: [
      ['What is one Euclidean step?', '(a, b) -> (b, a % b), for b != 0.'],
      [
        'Why does Euclid terminate for normalized integers?',
        'The nonnegative second argument strictly decreases until zero.',
      ],
    ],
  },
  {
    id: 'cp-gcd-lcm-zero',
    parents: ['cp-gcd-divisibility', 'number-builtins'],
    title: 'Derive a least common multiple',
    summary: 'Handle zeros before dividing by the supplied gcd.',
    lesson: [
      'For nonzero a and b, lcm(a, b) = abs((a // gcd(a, b)) * b). Divide before multiplying to keep intermediate integers smaller.',
      'When either input is zero, the lcm convention is zero. Handle that branch before division, especially when both are zero and their gcd is also zero.',
    ],
    signature: 'def lcm_from_gcd(a, b, divisor)',
    contract:
      'Implement lcm_from_gcd(a, b, divisor). divisor is the already-computed nonnegative gcd(a, b), including zero only for (0, 0). Return the nonnegative lcm. Check either input zero before dividing.',
    solution:
      'def lcm_from_gcd(a, b, divisor):\n    if a == 0 or b == 0:\n        return 0\n    return abs((a // divisor) * b)',
    checks:
      'assert lcm_from_gcd(18, 30, 6) == 90\nassert lcm_from_gcd(-12, 18, 6) == 36\nassert lcm_from_gcd(-8, -20, 4) == 40\nassert lcm_from_gcd(0, 15, 15) == 0\nassert lcm_from_gcd(0, 0, 0) == 0\nassert lcm_from_gcd(13, 17, 1) == 221',
    demonstration: 'print(lcm_from_gcd(-12, 18, 6))',
    output: '36',
    reasoning:
      'Exact division by the gcd reduces magnitude, and abs normalizes the result.',
    hint: 'Return zero early; otherwise abs((a // divisor) * b).',
    questions: [
      [
        'What is lcm(0, 15) here?',
        ['15', '1', '0', 'Undefined'],
        2,
        'The lcm zero convention is explicit.',
        'Check zeros first.',
      ],
      [
        'Why divide before multiplying?',
        [
          'It keeps intermediate values smaller',
          'It changes common divisors',
          'It permits division by zero',
          'It forces primality',
        ],
        0,
        'The gcd divides a exactly.',
        'Reduce before multiplication.',
      ],
      [
        'Why handle (0, 0) early?',
        [
          'Its lcm is negative',
          'The supplied gcd is zero',
          'Modulo is unavailable',
          'It has no integers',
        ],
        1,
        'Dividing by that gcd would fail.',
        'Guard before division.',
      ],
    ],
    cards: [
      ['How do you derive a nonzero-input lcm?', 'abs((a // gcd(a, b)) * b).'],
      ['What if either lcm input is zero?', 'Return zero before any division.'],
    ],
  },
]);

stages('cp-modular', 'cp-number-theory', [
  {
    id: 'cp-modular-residue',
    parents: ['parameters'],
    title: 'Normalize a residue',
    summary: 'Keep representatives inside a positive modulus.',
    lesson: [
      'For positive m, Python a % m is an integer from zero through m - 1, including for negative a. Residues represent equivalence classes of numbers differing by multiples of m.',
      'Reduction after multiplication preserves the result modulo m. This atom returns the normalized product residue directly, including modulus one.',
    ],
    signature: 'def product_residue(a, b, modulus)',
    contract:
      'Implement product_residue(a, b, modulus), with integer a and b and positive modulus. Return (a * b) modulo modulus in [0, modulus).',
    solution:
      'def product_residue(a, b, modulus):\n    return (a % modulus) * (b % modulus) % modulus',
    checks:
      'assert product_residue(7, 8, 5) == 1\nassert product_residue(-2, 3, 5) == 4\nassert product_residue(-2, -3, 5) == 1\nassert product_residue(0, 99, 7) == 0\nassert product_residue(99, 100, 1) == 0\nassert product_residue(10**80, 10**70, 97) == (10**150) % 97',
    demonstration: 'print(product_residue(-2, 3, 5))',
    output: '4',
    reasoning: 'Negative six has normalized residue four modulo five.',
    hint: 'Reduce operands, multiply, then reduce the product.',
    questions: [
      [
        'For positive m, which range contains a % m?',
        ['[-m, m]', '[0, m)', '[1, m]', 'Any integer'],
        1,
        'Python uses the positive modulus sign.',
        'Zero is possible, m is excluded.',
      ],
      [
        'What is -6 % 5?',
        ['-1', '1', '4', '6'],
        2,
        '-6 and 4 differ by two multiples of five.',
        'Use the nonnegative representative.',
      ],
      [
        'Does reducing operands before multiplication preserve residue?',
        ['Yes', 'Never', 'Only for primes', 'Only for positive operands'],
        0,
        'Modular multiplication respects equivalence.',
        'Differences are multiples of m.',
      ],
    ],
    cards: [
      [
        'What residue range does positive Python modulus produce?',
        '0 through modulus - 1.',
      ],
      [
        'Can operands be reduced before modular multiplication?',
        'Yes, then reduce the product again.',
      ],
    ],
  },
  {
    id: 'cp-modular-square-step',
    parents: ['cp-modular-residue', 'cp-recursive-combine', 'multiple-returns'],
    title: 'Consume one exponent bit',
    summary: 'Apply one repeated-squaring transition.',
    lesson: [
      'For odd remaining exponent, transfer one current base factor into result. Then square the base and halve the remaining exponent.',
      'The invariant is result * base**remaining modulo m. This atom returns one updated (result, base, exponent) state and handles an even or odd positive exponent.',
    ],
    signature: 'def power_step(result, base, exponent, modulus)',
    contract:
      'Implement power_step(result, base, exponent, modulus), with integer result/base, positive exponent and modulus. If exponent is odd multiply result by base modulo modulus; otherwise normalize result. Return (new_result, base*base % modulus, exponent // 2).',
    solution:
      'def power_step(result, base, exponent, modulus):\n    if exponent % 2:\n        result = result * base % modulus\n    else:\n        result %= modulus\n    return (result, base * base % modulus, exponent // 2)',
    checks:
      'assert power_step(1, 3, 5, 7) == (3, 2, 2)\nassert power_step(3, 2, 2, 7) == (3, 4, 1)\nassert power_step(3, 4, 1, 7) == (5, 2, 0)\nassert power_step(20, -2, 2, 5) == (0, 4, 1)\nassert power_step(1, 9, 3, 1) == (0, 0, 1)',
    demonstration: 'print(power_step(1, 3, 5, 7))',
    output: '(3, 2, 2)',
    reasoning:
      'An odd factor enters result, the base becomes nine modulo seven, and five halves to two.',
    hint: 'Test exponent % 2, reduce products, and return exponent // 2.',
    questions: [
      [
        'What does the odd branch transfer into result?',
        [
          'One current base factor',
          'The modulus',
          'The exponent',
          'Every future square',
        ],
        0,
        'An odd exponent is 2q + 1.',
        'Split off one factor.',
      ],
      [
        'How does remaining exponent change?',
        [
          'It doubles',
          'It halves by integer division',
          'It becomes modulus',
          'It increases',
        ],
        1,
        'One binary digit is consumed.',
        'Use // 2.',
      ],
      [
        'What replaces the current base?',
        ['base + 1', 'base // 2', 'base squared modulo m', 'The old exponent'],
        2,
        'Halving the exponent pairs remaining factors.',
        'Repeated squaring doubles the factor power.',
      ],
    ],
    cards: [
      [
        'What happens for an odd exponent bit?',
        'Multiply result by the current base modulo m.',
      ],
      [
        'What updates happen every squaring step?',
        'Square base modulo m and halve exponent.',
      ],
    ],
  },
  {
    id: 'cp-modular-inverse-condition',
    parents: ['cp-modular-residue', 'cp-gcd', 'imports'],
    title: 'Check whether division is invertible',
    summary: 'Use coprimality rather than assuming a prime modulus.',
    lesson: [
      'A denominator b has a multiplicative inverse modulo m exactly when gcd(b, m) = 1. Composite moduli may have inverses too, but some nonzero residues still lack one.',
      'This atom checks existence using math.gcd. It does not compute the inverse. A prime-modulus exponent shortcut requires additional assumptions and cannot replace this general condition.',
    ],
    signature: 'def has_modular_inverse(value, modulus)',
    contract:
      'Implement has_modular_inverse(value, modulus) for integer value and modulus >= 2. Return whether value has a multiplicative inverse modulo modulus, using the gcd condition.',
    solution:
      'from math import gcd\n\ndef has_modular_inverse(value, modulus):\n    return gcd(value, modulus) == 1',
    checks:
      'assert has_modular_inverse(3, 10) is True\nassert has_modular_inverse(2, 10) is False\nassert has_modular_inverse(-3, 10) is True\nassert has_modular_inverse(0, 7) is False\nassert has_modular_inverse(6, 7) is True\nassert has_modular_inverse(7, 7) is False',
    demonstration:
      'print(has_modular_inverse(3, 10))\nprint(has_modular_inverse(2, 10))',
    output: 'True\nFalse',
    reasoning: 'Three is coprime to ten, while two shares a factor.',
    hint: 'Return gcd(value, modulus) == 1.',
    questions: [
      [
        'When does an inverse modulo m exist?',
        [
          'value < m',
          'gcd(value, m) == 1',
          'value is even',
          'm is positive only',
        ],
        1,
        'Coprimality is necessary and sufficient.',
        'Check shared factors.',
      ],
      [
        'Can an inverse exist for composite modulus ten?',
        ['Never', 'Only for two', 'Yes, for example three', 'Only for zero'],
        2,
        'Three and ten are coprime.',
        'Primality is not required.',
      ],
      [
        'Why does two lack an inverse modulo ten?',
        [
          'They share factor two',
          'Two is too small',
          'Ten is even only',
          'All positive values fail',
        ],
        0,
        'A shared factor prevents a product congruent to one.',
        'Apply gcd.',
      ],
    ],
    cards: [
      [
        'What is the modular inverse existence test?',
        'gcd(value, modulus) == 1.',
      ],
      [
        'Is nonzero residue enough for an inverse under a composite modulus?',
        'No; the residue must be coprime to the modulus.',
      ],
    ],
  },
]);

stages('cp-sieve', 'cp-number-theory', [
  {
    id: 'cp-sieve-candidate-table',
    parents: ['return-values', 'list-repetition'],
    title: 'Prepare prime candidates',
    summary: 'Exclude zero and one before composite marking.',
    lesson: [
      'A sieve table includes every integer index from zero through limit. Initialize candidates true, then exclude zero and one because primes are greater than one.',
      'A true entry is only a candidate until marking finishes. This atom returns that initial table, handling limits zero and one without indexing beyond the list.',
    ],
    signature: 'def prime_candidates(limit)',
    contract:
      'Implement prime_candidates(limit) for nonnegative limit. Return a boolean list of length limit + 1: False at indices zero and one when present, True at all indices >= 2.',
    solution:
      'def prime_candidates(limit):\n    table = [True] * (limit + 1)\n    table[0] = False\n    if limit >= 1:\n        table[1] = False\n    return table',
    checks:
      'assert prime_candidates(0) == [False]\nassert prime_candidates(1) == [False, False]\nassert prime_candidates(4) == [False, False, True, True, True]\na = prime_candidates(3)\na[2] = False\nassert prime_candidates(3)[2] is True',
    demonstration: 'print(prime_candidates(5))',
    output: '[False, False, True, True, True, True]',
    reasoning:
      'Zero and one are excluded; four is still a candidate until marking.',
    hint: 'Allocate limit + 1 entries and guard whether index one exists.',
    questions: [
      [
        'Which indices are never prime?',
        ['0 and 1', '1 and 2', '2 and 3', 'All even indices'],
        0,
        'Prime integers are greater than one.',
        'Apply the definition.',
      ],
      [
        'Does initial True prove primality?',
        [
          'Always',
          'No, it is only a candidate',
          'Only at four',
          'Only at zero',
        ],
        1,
        'Composite marking has not happened yet.',
        'The sieve still has work.',
      ],
      [
        'Why guard the assignment to index one?',
        [
          'One is prime',
          'It makes sorting faster',
          'Limit zero has no index one',
          'Booleans are immutable',
        ],
        2,
        'A zero-bound table has only one entry.',
        'Check list length.',
      ],
    ],
    cards: [
      [
        'Which sieve entries begin false?',
        'Zero and one when those indices exist.',
      ],
      [
        'What does a true initial sieve entry mean?',
        'A prime candidate awaiting composite marking.',
      ],
    ],
  },
  {
    id: 'cp-sieve-square-start',
    parents: ['parameters', 'ranges'],
    title: 'List one prime’s new multiples',
    summary: 'Start composite marking at the prime square.',
    lesson: [
      'For a prime p, smaller composite multiples of p already have a smaller prime factor. Therefore its new marking work begins at p * p.',
      'The inclusive bound requires a range stopping at limit + 1. This atom lists the positions for one prime rather than building the entire sieve.',
    ],
    signature: 'def square_multiples(prime, limit)',
    contract:
      'Implement square_multiples(prime, limit), with prime >= 2 a prime integer and nonnegative limit. Return p*p, p*p+p, ... through limit inclusive, or [] if p*p exceeds limit.',
    solution:
      'def square_multiples(prime, limit):\n    return list(range(prime * prime, limit + 1, prime))',
    checks:
      'assert square_multiples(2, 10) == [4, 6, 8, 10]\nassert square_multiples(3, 20) == [9, 12, 15, 18]\nassert square_multiples(5, 24) == []\nassert square_multiples(5, 25) == [25]\nassert square_multiples(2, 0) == []',
    demonstration: 'print(square_multiples(3, 18))',
    output: '[9, 12, 15, 18]',
    reasoning:
      'Multiples below nine were covered by smaller factors, while eighteen remains inside the bound.',
    hint: 'Use range(prime * prime, limit + 1, prime).',
    questions: [
      [
        'Where does marking for prime p begin?',
        ['p', 'p + 1', 'p * p', 'limit'],
        2,
        'Earlier composite multiples have smaller factors.',
        'Do not mark p itself.',
      ],
      [
        'Why is p * p included when equal to limit?',
        [
          'The bound is inclusive',
          'Squares are prime',
          'All bounds are even',
          'The range is reversed',
        ],
        0,
        'The sieve includes every integer <= limit.',
        'Use limit + 1 as stop.',
      ],
      [
        'What is the marking increment?',
        ['1', 'p', 'p * p', 'limit'],
        1,
        'Consecutive multiples differ by p.',
        'Move to the next multiple.',
      ],
    ],
    cards: [
      ['Where does sieve marking start for prime p?', 'At p squared.'],
      [
        'Why are smaller multiples already covered?',
        'Each has a prime factor smaller than p.',
      ],
    ],
  },
  {
    id: 'cp-sieve-factor-bound',
    parents: ['list-mutation', 'return-values', 'while-loops'],
    title: 'Check the square-root boundary',
    summary: 'Know which factors can still expose composites.',
    lesson: [
      'If a composite is at most limit, at least one of its factors is at most the square root of limit. If both were larger, their product would exceed limit.',
      'Compare p*p <= limit using integers rather than a floating square root. This atom returns the candidate integers through that boundary; the full sieve later filters which candidates are prime.',
    ],
    signature: 'def sieve_factor_candidates(limit)',
    contract:
      'Implement sieve_factor_candidates(limit) for nonnegative integer limit. Return all integer candidates p >= 2 with p*p <= limit, in increasing order. Avoid floating-point square roots.',
    solution:
      'def sieve_factor_candidates(limit):\n    result = []\n    candidate = 2\n    while candidate * candidate <= limit:\n        result.append(candidate)\n        candidate += 1\n    return result',
    checks:
      'assert sieve_factor_candidates(0) == []\nassert sieve_factor_candidates(3) == []\nassert sieve_factor_candidates(4) == [2]\nassert sieve_factor_candidates(15) == [2, 3]\nassert sieve_factor_candidates(16) == [2, 3, 4]\nassert sieve_factor_candidates(25) == [2, 3, 4, 5]',
    demonstration: 'print(sieve_factor_candidates(25))',
    output: '[2, 3, 4, 5]',
    reasoning:
      'Five is included because its square equals the bound. Four is a candidate, not a claim of primality.',
    hint: 'Loop while candidate * candidate <= limit.',
    questions: [
      [
        'Why are factors through sqrt(limit) sufficient?',
        [
          'All primes are smaller',
          'Every composite has a small factor',
          'The output excludes larger primes',
          'All factors are even',
        ],
        1,
        'Two larger factors would exceed the bound.',
        'Compare their product.',
      ],
      [
        'Which integer comparison includes the boundary exactly?',
        [
          'p * p < limit only',
          'p + p <= limit',
          'p * p <= limit',
          'p == limit',
        ],
        2,
        'A prime square at the boundary must be marked.',
        'Use <=.',
      ],
      [
        'Does candidate four here imply four is prime?',
        ['No', 'Always', 'Only at limit sixteen', 'Only with floats'],
        0,
        'This atom lists factor candidates; the sieve filters composites.',
        'Candidate and proven prime differ.',
      ],
    ],
    cards: [
      [
        'Why stop sieve factors at the square-root bound?',
        'Every composite up to n has a factor <= sqrt(n).',
      ],
      [
        'How can the square-root boundary be checked exactly?',
        'Use p * p <= limit with integers.',
      ],
    ],
  },
]);

stages('cp-combinatorics', 'cp-number-theory', [
  {
    id: 'cp-combination-boundaries',
    parents: ['comprehensions', 'parameters'],
    title: 'Handle empty and impossible selections',
    summary: 'Separate counting boundaries before recurrence.',
    lesson: [
      'C(n, k) counts unordered selections of k indexed items from n. Selecting none or all has one possibility. Selecting a negative number or more than n is impossible.',
      'This atom reports those boundaries and uses None for a valid interior state that still needs computation. n is nonnegative, and k may be any integer.',
    ],
    signature: 'def choose_boundary(n, k)',
    contract:
      'Implement choose_boundary(n, k), with n >= 0. Return 0 if k < 0 or k > n; 1 if k == 0 or k == n; otherwise None.',
    solution:
      'def choose_boundary(n, k):\n    if k < 0 or k > n:\n        return 0\n    if k == 0 or k == n:\n        return 1\n    return None',
    checks:
      'assert choose_boundary(0, 0) == 1\nassert choose_boundary(4, 0) == 1\nassert choose_boundary(4, 4) == 1\nassert choose_boundary(4, -1) == 0\nassert choose_boundary(4, 5) == 0\nassert choose_boundary(4, 2) is None',
    demonstration: 'print([choose_boundary(4, k) for k in [-1, 0, 2, 4, 5]])',
    output: '[0, 1, None, 1, 0]',
    reasoning:
      'Empty and full selections count once; valid interior selections need Pascal transitions.',
    hint: 'Check impossible k first, then the two boundaries.',
    questions: [
      [
        'How many ways select zero items?',
        ['Zero', 'One', 'n', 'n factorial'],
        1,
        'The empty selection is one possibility.',
        'Count doing nothing.',
      ],
      [
        'What is C(4, 5)?',
        ['1', '4', '0', '5'],
        2,
        'Five distinct items cannot be selected from four.',
        'The selection is impossible.',
      ],
      [
        'What does None mean in this helper?',
        [
          'A valid interior state needs calculation',
          'The answer is zero',
          'k is invalid',
          'There are no items',
        ],
        0,
        'The helper only resolves boundaries.',
        'Do not confuse unfinished with impossible.',
      ],
    ],
    cards: [
      [
        'What are binomial counting boundaries?',
        'C(n, 0) = C(n, n) = 1; invalid k gives 0.',
      ],
      ['Why does C(0, 0) equal one?', 'There is one empty selection.'],
    ],
  },
  {
    id: 'cp-combination-pascal-step',
    parents: ['cp-combination-boundaries', 'cp-modular-residue', 'ranges'],
    title: 'Add include and exclude counts',
    summary: 'Build one new Pascal row without division.',
    lesson: [
      'Split selections by whether they include one distinguished item. Excluding contributes C(n - 1, k), while including contributes C(n - 1, k - 1). Their disjoint counts add.',
      'This atom builds a full next row from the previous one modulo any positive modulus. Addition avoids assumptions about invertible factorial denominators.',
    ],
    signature: 'def next_pascal_row(previous, modulus)',
    contract:
      'Implement next_pascal_row(previous, modulus). previous is a nonempty Pascal row already reduced modulo positive modulus. Return its next row modulo modulus, with boundary entries 1 % modulus. Preserve previous.',
    solution:
      'def next_pascal_row(previous, modulus):\n    result = [1 % modulus]\n    for index in range(1, len(previous)):\n        result.append((previous[index - 1] + previous[index]) % modulus)\n    result.append(1 % modulus)\n    return result',
    checks:
      'assert next_pascal_row([1], 7) == [1, 1]\nassert next_pascal_row([1, 2, 1], 10) == [1, 3, 3, 1]\nassert next_pascal_row([1, 4, 6, 4, 1], 10) == [1, 5, 0, 0, 5, 1]\nassert next_pascal_row([0, 0], 1) == [0, 0, 0]\na = [1, 3, 3, 1]\nassert next_pascal_row(a, 6) == [1, 4, 0, 4, 1]\nassert a == [1, 3, 3, 1]',
    demonstration: 'print(next_pascal_row([1, 3, 3, 1], 10))',
    output: '[1, 4, 6, 4, 1]',
    reasoning:
      'Adjacent previous counts sum because include/exclude cases are disjoint.',
    hint: 'Use adjacent sums for interior entries and 1 % modulus at both ends.',
    questions: [
      [
        'Why does Pascal’s recurrence add counts?',
        [
          'It partitions include/exclude cases',
          'It orders all items',
          'It multiplies probabilities',
          'It assumes prime n',
        ],
        0,
        'The cases are disjoint and cover every selection.',
        'Look at one distinguished item.',
      ],
      [
        'Which previous entries build an interior new entry k?',
        ['k and k + 1', 'k - 1 and k', 'Only zero', 'All entries'],
        1,
        'They count including and excluding the new item.',
        'Selecting the new item uses one fewer old item.',
      ],
      [
        'Does this addition-only method need a prime modulus?',
        ['Always', 'Only for large n', 'No', 'Only when k is zero'],
        2,
        'No modular division occurs.',
        'Addition works for composite modulus too.',
      ],
    ],
    cards: [
      [
        'What is Pascal’s recurrence?',
        'C(n, k) = C(n - 1, k) + C(n - 1, k - 1).',
      ],
      [
        'Why can Pascal addition use any positive modulus?',
        'It requires no modular division or inverses.',
      ],
    ],
  },
  {
    id: 'cp-combination-descending-row',
    parents: ['cp-combination-pascal-step', 'cp-knapsack-descending-pass'],
    title: 'Update a truncated row downward',
    summary: 'Preserve previous-row counts in one list.',
    lesson: [
      'With a truncated one-dimensional Pascal row, update selected counts from high index to one. dp[k - 1] then still belongs to the previous row.',
      'Ascending updates could reuse counts from the same new item and overcount. Entry zero remains one modulo m. This atom performs one row update on a copy.',
    ],
    signature: 'def add_counting_item(previous, modulus)',
    contract:
      'Implement add_counting_item(previous, modulus). previous is a nonempty truncated Pascal row of residues modulo positive modulus. Return a copy after updating each index k from last through one with (dp[k] + dp[k - 1]) % modulus. Preserve entry zero and input.',
    solution:
      'def add_counting_item(previous, modulus):\n    dp = previous[:]\n    for selected in range(len(dp) - 1, 0, -1):\n        dp[selected] = (dp[selected] + dp[selected - 1]) % modulus\n    return dp',
    checks:
      'assert add_counting_item([1], 7) == [1]\nassert add_counting_item([1, 0, 0], 7) == [1, 1, 0]\nassert add_counting_item([1, 3, 3], 10) == [1, 4, 6]\nassert add_counting_item([0, 0, 0], 1) == [0, 0, 0]\na = [1, 4, 6]\nassert add_counting_item(a, 10) == [1, 5, 0]\nassert a == [1, 4, 6]',
    demonstration: 'print(add_counting_item([1, 3, 3], 10))',
    output: '[1, 4, 6]',
    reasoning:
      'Descending updates read old neighboring entries, maintaining the previous-row interpretation.',
    hint: 'Copy, then use range(len(dp) - 1, 0, -1).',
    questions: [
      [
        'Why update selected counts downward?',
        [
          'To preserve previous-row predecessors',
          'To sort counts',
          'To delete zero',
          'To make k negative',
        ],
        0,
        'The left neighbor must not yet include the new item.',
        'Compare with 0/1 knapsack compression.',
      ],
      [
        'What happens to entry zero?',
        [
          'It doubles',
          'It remains the empty-selection count',
          'It becomes unreachable',
          'It is deleted',
        ],
        1,
        'Selecting zero still has one way modulo m.',
        'The loop stops before zero.',
      ],
      [
        'What can ascending updates cause?',
        [
          'Fewer rows',
          'Exact factorial division',
          'Same-item reuse and overcounting',
          'Always zero',
        ],
        2,
        'Updated predecessors would include the current item already.',
        'Read values from the old row.',
      ],
    ],
    cards: [
      [
        'Which direction preserves a Pascal row in one list?',
        'Descending selected-count indices.',
      ],
      [
        'Why leave entry zero unchanged?',
        'It counts the one empty selection, reduced modulo m.',
      ],
    ],
  },
]);

stages('cp-intervals', 'cp-strategy', [
  {
    id: 'cp-interval-overlap',
    parents: ['parameters', 'tuples', 'number-builtins'],
    title: 'Compare interval endpoints',
    summary: 'Decide overlap under a stated endpoint convention.',
    lesson: [
      'Endpoint rules matter. Two nonempty half-open intervals [a, b) and [c, d) overlap exactly when max(a, c) < min(b, d). Merely touching endpoints do not overlap.',
      'This atom uses positive-length intervals with start < end. The strict comparison follows the excluded right endpoint. Closed intervals would instead allow equality.',
    ],
    signature: 'def intervals_overlap(first, second)',
    contract:
      'Implement intervals_overlap(first, second). Each pair (start, end) has integer start < end and represents [start, end). Return a boolean indicating nonempty overlap.',
    solution:
      'def intervals_overlap(first, second):\n    return max(first[0], second[0]) < min(first[1], second[1])',
    checks:
      'assert intervals_overlap((1, 4), (3, 7)) is True\nassert intervals_overlap((1, 4), (4, 7)) is False\nassert intervals_overlap((-5, -1), (-3, 2)) is True\nassert intervals_overlap((2, 9), (3, 4)) is True\nassert intervals_overlap((1, 2), (3, 4)) is False',
    demonstration: 'print(intervals_overlap((1, 4), (4, 6)))',
    output: 'False',
    reasoning:
      'A shared boundary belongs to only the right-hand interval under half-open semantics.',
    hint: 'Compare the larger start with the smaller end using <.',
    questions: [
      [
        'Do [1, 4) and [4, 7) overlap?',
        ['Yes', 'No', 'Only when sorted', 'Only if positive'],
        1,
        'Four is excluded from the first interval.',
        'Use the endpoint convention.',
      ],
      [
        'Which overlap condition applies here?',
        [
          'max(starts) <= min(ends)',
          'min(starts) > max(ends)',
          'max(starts) < min(ends)',
          'Starts must be equal',
        ],
        2,
        'Strict inequality gives a nonempty intersection.',
        'Find the intersection bounds.',
      ],
      [
        'What changes for closed intervals?',
        [
          'Equality can count as overlap',
          'All disjoint intervals overlap',
          'Starts are excluded',
          'Sorting becomes unnecessary',
        ],
        0,
        'Both closed intervals can contain a shared endpoint.',
        'Closed means endpoints included.',
      ],
    ],
    cards: [
      [
        'When do nonempty half-open intervals overlap?',
        'max(starts) < min(ends).',
      ],
      ['Do half-open intervals touching at one boundary overlap?', 'No.'],
    ],
  },
  {
    id: 'cp-interval-start-order',
    parents: ['cp-sort-key'],
    title: 'Order intervals by their start',
    summary: 'Prepare a left-to-right interval scan.',
    lesson: [
      'Sorting intervals by start makes every later interval begin no earlier than the current one. This is the preparation for merging covered regions.',
      'Use lexicographic tuple order to break equal starts by end. Return a new list and retain duplicates. An interval scan relies on ordering, not on input arrival order.',
    ],
    signature: 'def ordered_intervals(intervals)',
    contract:
      'Implement ordered_intervals(intervals) for a list of integer (start, end) tuples with start < end. Return a new lexicographically sorted list, preserving duplicates and input.',
    solution: 'def ordered_intervals(intervals):\n    return sorted(intervals)',
    checks:
      'assert ordered_intervals([]) == []\nassert ordered_intervals([(4, 7), (1, 5), (1, 3)]) == [(1, 3), (1, 5), (4, 7)]\na = [(2, 3), (0, 1), (2, 3)]\nassert ordered_intervals(a) == [(0, 1), (2, 3), (2, 3)]\nassert a == [(2, 3), (0, 1), (2, 3)]',
    demonstration: 'print(ordered_intervals([(5, 8), (1, 4), (3, 6)]))',
    output: '[(1, 4), (3, 6), (5, 8)]',
    reasoning:
      'The scan sees increasing starts, with deterministic equal-start ordering.',
    hint: 'Use sorted rather than mutating sort.',
    questions: [
      [
        'Which order supports a merge scan?',
        [
          'Decreasing length',
          'Increasing start',
          'Input order always',
          'Random order',
        ],
        1,
        'It places intervals from left to right.',
        'Consider the next unprocessed start.',
      ],
      [
        'What does sorted(intervals) do to input?',
        [
          'Mutates it',
          'Deletes duplicates',
          'Returns a new list',
          'Returns None',
        ],
        2,
        'sorted constructs a new list.',
        'Compare sorted with list.sort.',
      ],
      [
        'How are equal starts ordered for tuples?',
        [
          'By the end as the next field',
          'By object identity',
          'They are rejected',
          'By the number of intervals',
        ],
        0,
        'Lexicographic comparison checks the second field next.',
        'Tuple comparison is left to right.',
      ],
    ],
    cards: [
      [
        'Why sort intervals by start before merging?',
        'A left-to-right scan can compare the next interval to the current covered region.',
      ],
      ['How can interval sorting preserve input?', 'Use sorted(intervals).'],
    ],
  },
  {
    id: 'cp-interval-merge-step',
    parents: ['cp-interval-overlap', 'cp-interval-start-order'],
    title: 'Extend one covered region',
    summary: 'Perform a single sorted merge decision.',
    lesson: [
      'For a current half-open covered region and a next interval starting no earlier, merge when next_start <= current_end. Adjacent regions may be joined because their union is still one interval.',
      'Otherwise the next interval starts after a gap and must remain separate. Notice that joining adjacent union regions uses <=, while testing a nonempty intersection uses <.',
    ],
    signature: 'def merge_next(current, following)',
    contract:
      'Implement merge_next(current, following). Both are positive-length half-open integer intervals, and following starts no earlier than current. Return a list containing their merged union if touching or overlapping, otherwise the two intervals unchanged.',
    solution:
      'def merge_next(current, following):\n    if following[0] <= current[1]:\n        return [(current[0], max(current[1], following[1]))]\n    return [current, following]',
    checks:
      'assert merge_next((1, 4), (3, 7)) == [(1, 7)]\nassert merge_next((1, 4), (4, 7)) == [(1, 7)]\nassert merge_next((1, 9), (3, 5)) == [(1, 9)]\nassert merge_next((1, 3), (5, 7)) == [(1, 3), (5, 7)]\nassert merge_next((-5, -2), (-2, 1)) == [(-5, 1)]',
    demonstration: 'print(merge_next((1, 4), (4, 8)))',
    output: '[(1, 8)]',
    reasoning:
      'Adjacent half-open regions have a union representable as one half-open interval.',
    hint: 'Test following[0] <= current[1], then keep the larger end.',
    questions: [
      [
        'Why use <= when joining covered regions?',
        [
          'Adjacent union regions can be represented together',
          'Half-open intervals always intersect',
          'It deletes gaps',
          'All intervals have equal starts',
        ],
        0,
        'Touching intervals have no missing point in their union.',
        'This is a union operation.',
      ],
      [
        'Current [1, 9), next [3, 5): what end survives?',
        ['3', '5', '9', '14'],
        2,
        'The existing end already extends farther.',
        'Take the maximum end.',
      ],
      [
        'What does next_start > current_end indicate?',
        ['A shared endpoint', 'A gap', 'Containment', 'An invalid sort'],
        1,
        'The intervals have uncovered space between them.',
        'Compare start to current end.',
      ],
    ],
    cards: [
      [
        'When can sorted covered regions be merged?',
        'When the next start is <= the current end, including adjacency.',
      ],
      ['How is the merged end computed?', 'max(current end, next end).'],
    ],
  },
]);

stages('cp-greedy', 'cp-strategy', [
  {
    id: 'cp-greedy-finish-order',
    parents: ['cp-sort-key'],
    title: 'Compare earliest finishes',
    summary: 'Sort scheduling candidates by the boundary that leaves room.',
    lesson: [
      'For maximizing the number of nonoverlapping activities, consider earliest finishing intervals first. A smaller finish leaves at least as much room for every later activity.',
      'The start alone is insufficient: an early-starting long activity can block many short ones. This atom sorts positive-length intervals by (end, start).',
    ],
    signature: 'def finish_order(intervals)',
    contract:
      'Implement finish_order(intervals). intervals contains (start, end) integer tuples with start < end. Return a new list sorted by increasing end, then start. Preserve duplicates and input.',
    solution:
      'def finish_order(intervals):\n    return sorted(intervals, key=lambda interval: (interval[1], interval[0]))',
    checks:
      'assert finish_order([]) == []\nassert finish_order([(0, 9), (2, 4), (1, 4)]) == [(1, 4), (2, 4), (0, 9)]\na = [(5, 7), (0, 1)]\nassert finish_order(a) == [(0, 1), (5, 7)]\nassert a == [(5, 7), (0, 1)]',
    demonstration: 'print(finish_order([(0, 10), (1, 3), (3, 5)]))',
    output: '[(1, 3), (3, 5), (0, 10)]',
    reasoning:
      'Shorter finishing boundaries appear before a long blocking interval.',
    hint: 'Use a key returning (end, start).',
    questions: [
      [
        'Which boundary should be prioritized for maximum activity count?',
        [
          'Earliest start',
          'Earliest finish',
          'Largest duration',
          'Latest start',
        ],
        1,
        'Earliest finish preserves future room.',
        'Think about availability after choosing.',
      ],
      [
        'Why can earliest start fail?',
        [
          'It forbids duplicates',
          'It sorts too slowly',
          'A long first activity can block many short ones',
          'All intervals overlap',
        ],
        2,
        'An early start does not imply a small finishing boundary.',
        'Consider [0, 10) versus two short intervals.',
      ],
      [
        'How should equal finishes be made deterministic here?',
        [
          'By increasing start',
          'By memory address',
          'Delete one',
          'Reverse input',
        ],
        0,
        'The specified tie rule is start order.',
        'Read the return contract.',
      ],
    ],
    cards: [
      [
        'What greedy order maximizes compatible activity count?',
        'Earliest finishing activity first.',
      ],
      [
        'Why is earliest finish promising?',
        'It leaves at least as much room for later activities.',
      ],
    ],
  },
  {
    id: 'cp-greedy-compatibility',
    parents: ['cp-interval-overlap', 'comprehensions'],
    title: 'Keep a feasible next choice',
    summary: 'Test whether a candidate can follow the selected schedule.',
    lesson: [
      'For half-open activities, a candidate beginning exactly at the previous finish is compatible. Feasibility is start >= last_end.',
      'This local test does not prove that any candidate order is optimal. It only maintains a valid schedule; earliest-finish ordering supplies the larger strategy.',
    ],
    signature: 'def compatible_starts(last_end, candidates)',
    contract:
      'Implement compatible_starts(last_end, candidates). last_end is an integer and candidates is a list of integer starts. Return a list of booleans in input order indicating start >= last_end. Preserve candidates.',
    solution:
      'def compatible_starts(last_end, candidates):\n    return [start >= last_end for start in candidates]',
    checks:
      'assert compatible_starts(4, []) == []\nassert compatible_starts(4, [3, 4, 7]) == [False, True, True]\nassert compatible_starts(-2, [-3, -2, 0]) == [False, True, True]\nassert compatible_starts(0, [0, 0]) == [True, True]',
    demonstration: 'print(compatible_starts(5, [2, 5, 8]))',
    output: '[False, True, True]',
    reasoning:
      'Equality is allowed because the preceding activity excludes its end.',
    hint: 'Compare every start with last_end using >=.',
    questions: [
      [
        'Previous end is 5 and next start is 5. Compatible?',
        ['Yes', 'No', 'Only with negative times', 'Only for empty activities'],
        0,
        'Half-open activities may touch.',
        'The previous right endpoint is excluded.',
      ],
      [
        'Which comparison preserves feasibility?',
        [
          'start < last_end',
          'start == last_end only',
          'start >= last_end',
          'start != last_end',
        ],
        2,
        'The candidate must not begin before the previous finish.',
        'Equality is permitted.',
      ],
      [
        'Does feasibility alone prove an optimal schedule?',
        [
          'Always',
          'No, selection order also needs justification',
          'Only for two intervals',
          'Only after mutation',
        ],
        1,
        'Many feasible schedules use too few activities.',
        'Validity and optimality are different.',
      ],
    ],
    cards: [
      [
        'When can a half-open activity follow another?',
        'Its start is >= the previous finish.',
      ],
      [
        'Does a feasible greedy step prove optimality?',
        'No; a global argument must justify the selection order.',
      ],
    ],
  },
  {
    id: 'cp-greedy-exchange-boundary',
    parents: [
      'cp-greedy-compatibility',
      'cp-greedy-finish-order',
      'generator-expressions',
    ],
    title: 'Check an exchange boundary',
    summary: 'Show that an earlier finish preserves a later continuation.',
    lesson: [
      'An exchange proof compares an optimal schedule’s first chosen finish with a greedy finish no later than it. Every later activity feasible after the old finish remains feasible after the earlier one.',
      'This atom checks that implication for a supplied ordered pair of finishes. It is the key local safety fact; full activity selection adds sorting and induction over the remaining activities.',
    ],
    signature: 'def exchange_preserves(greedy_end, old_end, later_starts)',
    contract:
      'Implement exchange_preserves(greedy_end, old_end, later_starts) for arbitrary integer finishing boundaries. Return whether every supplied start that is >= old_end is also >= greedy_end. This tests whether the proposed replacement preserves these continuations; a later replacement may fail. Preserve the list.',
    solution:
      'def exchange_preserves(greedy_end, old_end, later_starts):\n    return all(start < old_end or start >= greedy_end for start in later_starts)',
    checks:
      'assert exchange_preserves(3, 7, []) is True\nassert exchange_preserves(3, 7, [1, 3, 7, 9]) is True\nassert exchange_preserves(-4, -2, [-8, -2, 0]) is True\nassert exchange_preserves(5, 5, [4, 5, 10]) is True\nassert exchange_preserves(8, 7, [7, 9]) is False\nassert exchange_preserves(8, 7, [1, 9]) is True',
    demonstration: 'print(exchange_preserves(3, 7, [7, 9, 12]))',
    output: 'True',
    reasoning:
      'Replacing a finish of seven by three cannot invalidate any start at or after seven.',
    hint: 'For each start, encode not(old-feasible) or new-feasible.',
    questions: [
      [
        'Why can an earlier finish replace a later first finish?',
        [
          'It preserves every feasible later start',
          'It makes durations equal',
          'It selects all activities',
          'It removes sorting',
        ],
        0,
        'Future room can only increase.',
        'Compare the available boundary.',
      ],
      [
        'What form expresses “old feasible implies new feasible”?',
        [
          'old and not new',
          'not old or new',
          'old == not new',
          'new and not old',
        ],
        1,
        'An implication fails only when old is true and new is false.',
        'Use the logical implication rule.',
      ],
      [
        'Which condition is essential to this exchange?',
        [
          'greedy_end > old_end',
          'Starts are positive',
          'greedy_end <= old_end',
          'Intervals have equal lengths',
        ],
        2,
        'Moving the boundary later could block a continuation.',
        'Earlier finish is the safety condition.',
      ],
    ],
    cards: [
      [
        'What does the scheduling exchange argument preserve?',
        'All later activities feasible after the old finish remain feasible after an earlier finish.',
      ],
      [
        'What follows the first exchange in a greedy proof?',
        'Apply the same argument to the remaining compatible subproblem.',
      ],
    ],
  },
]);

stages('cp-bitmasks', 'cp-strategy', [
  {
    id: 'cp-bit-position',
    parents: ['comprehensions', 'parameters', 'ranges', 'bitwise'],
    title: 'Read one membership bit',
    summary: 'Use a power of two to inspect a set position.',
    lesson: [
      'A nonnegative integer mask can represent a set of positions. Position k is present when mask & (1 << k) is nonzero. Positions begin at zero.',
      'The shift creates a mask with exactly one selected bit. Bitwise AND keeps that bit only if it was present in the original set.',
    ],
    signature: 'def contains_bit(mask, position)',
    contract:
      'Implement contains_bit(mask, position) for nonnegative integer mask and position. Return a boolean indicating whether bit position is set.',
    solution:
      'def contains_bit(mask, position):\n    return bool(mask & (1 << position))',
    checks:
      'assert contains_bit(0, 0) is False\nassert contains_bit(5, 0) is True\nassert contains_bit(5, 1) is False\nassert contains_bit(5, 2) is True\nassert contains_bit(1 << 100, 100) is True\nassert contains_bit(1 << 100, 99) is False',
    demonstration: 'print([contains_bit(10, bit) for bit in range(4)])',
    output: '[False, True, False, True]',
    reasoning: 'Ten has binary bits one and three set.',
    hint: 'AND with 1 << position, then convert to bool.',
    questions: [
      [
        'What value selects bit three alone?',
        ['3', '6', '8', '9'],
        2,
        '1 << 3 is eight.',
        'Bits use powers of two.',
      ],
      [
        'Which operation tests membership?',
        ['mask + (1 << k)', 'mask & (1 << k)', 'mask // k', 'mask == k'],
        1,
        'AND isolates the selected bit.',
        'Keep common set bits.',
      ],
      [
        'What positions are present in binary 101?',
        ['0 and 2', '1 and 3', '0 and 1', 'Only 2'],
        0,
        'Count bit positions from the right starting at zero.',
        'The middle bit is absent.',
      ],
    ],
    cards: [
      ['How do you test set membership at bit k?', 'bool(mask & (1 << k)).'],
      [
        'What does 1 << k represent?',
        'A mask with only position k set, equal to 2**k.',
      ],
    ],
  },
  {
    id: 'cp-bit-set-clear',
    parents: ['cp-bit-position', 'conditional-expressions'],
    title: 'Change one set position',
    summary: 'Set a bit with OR and clear it with AND.',
    lesson: [
      'Setting a bit uses mask | (1 << k); it is idempotent, so setting an already present bit does not toggle it. Clearing uses mask & ~(1 << k).',
      'This atom applies either membership operation and returns a new integer. Python integers support arbitrarily large nonnegative masks, so the chosen position need not fit a fixed machine word.',
    ],
    signature: 'def change_bit(mask, position, present)',
    contract:
      'Implement change_bit(mask, position, present). mask and position are nonnegative integers. Return a mask with the position set if present is True, otherwise cleared. Other bits stay unchanged.',
    solution:
      'def change_bit(mask, position, present):\n    bit = 1 << position\n    return mask | bit if present else mask & ~bit',
    checks:
      'assert change_bit(0, 3, True) == 8\nassert change_bit(8, 3, True) == 8\nassert change_bit(13, 2, False) == 9\nassert change_bit(13, 1, False) == 13\nassert change_bit(0, 100, True) == 1 << 100\nassert change_bit(1 << 100, 100, False) == 0',
    demonstration:
      'print(change_bit(5, 1, True))\nprint(change_bit(5, 2, False))',
    output: '7\n1',
    reasoning:
      'OR adds missing membership, while AND with the complemented bit removes only that position.',
    hint: 'Create bit = 1 << position, then use OR or AND with ~bit.',
    questions: [
      [
        'Which operation sets a bit without toggling it?',
        ['XOR', 'OR', 'Division', 'Subtraction'],
        1,
        'OR retains already set bits.',
        'Setting twice should do nothing extra.',
      ],
      [
        'How do you clear bit k?',
        ['mask & ~(1 << k)', 'mask | (1 << k)', 'mask + k', 'mask << k'],
        0,
        'The complement excludes the selected bit.',
        'AND keeps all other positions.',
      ],
      [
        'Setting an already set bit does what?',
        [
          'Clears it',
          'Adds a second copy',
          'Leaves the mask unchanged',
          'Raises an error',
        ],
        2,
        'Membership is a boolean property.',
        'OR is idempotent.',
      ],
    ],
    cards: [
      ['How is bit k set?', 'mask | (1 << k).'],
      ['How is bit k cleared?', 'mask & ~(1 << k).'],
    ],
  },
  {
    id: 'cp-bit-submask-step',
    parents: ['cp-bit-position', 'break-continue'],
    title: 'Move to the next submask',
    summary: 'Enumerate subsets of a fixed bit set.',
    lesson: [
      'Starting with sub = mask, the expression (sub - 1) & mask produces the next smaller submask. The AND removes any positions outside the original mask.',
      'Zero is the final submask. Stop after including it; applying the expression again would return to mask and repeat forever. The empty mask therefore has exactly one submask.',
    ],
    signature: 'def submasks(mask)',
    contract:
      'Implement submasks(mask) for 0 <= mask < 4096. Return all its submasks in descending numeric order, including mask and zero once. Use the submask transition.',
    solution:
      'def submasks(mask):\n    result = []\n    sub = mask\n    while True:\n        result.append(sub)\n        if sub == 0:\n            break\n        sub = (sub - 1) & mask\n    return result',
    checks:
      'assert submasks(0) == [0]\nassert submasks(5) == [5, 4, 1, 0]\nassert submasks(8) == [8, 0]\nassert submasks(7) == [7, 6, 5, 4, 3, 2, 1, 0]\nassert submasks(10) == [10, 8, 2, 0]',
    demonstration: 'print(submasks(5))',
    output: '[5, 4, 1, 0]',
    reasoning:
      'Only bits zero and two are available; the four subsets appear once in descending order.',
    hint: 'Append sub, stop at zero, otherwise assign (sub - 1) & mask.',
    questions: [
      [
        'What computes the next lower submask?',
        ['sub + mask', '(sub - 1) & mask', 'sub | mask', 'mask - sub always'],
        1,
        'Subtract and restrict to original positions.',
        'Use AND with mask.',
      ],
      [
        'Why stop after processing zero?',
        [
          'Zero is invalid',
          'There are no integer bits',
          'The next step would wrap back to mask',
          'It removes mask',
        ],
        2,
        '(-1) & mask equals mask in Python.',
        'Avoid restarting enumeration.',
      ],
      [
        'How many submasks does zero have?',
        ['One', 'Zero', 'Two', 'Infinitely many'],
        0,
        'The empty set has one subset: itself.',
        'Include zero once.',
      ],
    ],
    cards: [
      ['What is the submask enumeration transition?', '(sub - 1) & mask.'],
      [
        'Where must submask enumeration stop?',
        'After including zero exactly once.',
      ],
    ],
  },
]);

stages('cp-geometry', 'cp-strategy', [
  {
    id: 'cp-geometry-displacement',
    parents: ['math-vectors', 'parameters', 'multiple-returns'],
    title: 'Subtract a common origin',
    summary: 'Convert two points into a directed vector.',
    lesson: [
      'A vector from point a to point b is b - a coordinate by coordinate. Translation of both points by the same offset leaves this displacement unchanged.',
      'Integer coordinates make these differences exact in Python. This atom computes only one vector, before using two vectors for orientation.',
    ],
    signature: 'def displacement(a, b)',
    contract:
      'Implement displacement(a, b) for integer (x, y) tuples. Return the vector from a to b as a tuple (b.x - a.x, b.y - a.y).',
    solution: 'def displacement(a, b):\n    return (b[0] - a[0], b[1] - a[1])',
    checks:
      'assert displacement((1, 2), (4, 6)) == (3, 4)\nassert displacement((4, 6), (1, 2)) == (-3, -4)\nassert displacement((-5, 9), (-5, 9)) == (0, 0)\nassert displacement((10**20, 0), (10**20 + 1, -2)) == (1, -2)',
    demonstration: 'print(displacement((2, 3), (7, 1)))',
    output: '(5, -2)',
    reasoning: 'Subtracting the origin gives horizontal and vertical changes.',
    hint: 'Subtract a from b in the same coordinate order.',
    questions: [
      [
        'Which vector goes from a to b?',
        ['a + b', 'a - b', 'b - a', 'b / a'],
        2,
        'Destination minus origin gives displacement.',
        'Follow the direction.',
      ],
      [
        'Translating both points equally changes displacement how?',
        ['It does not change', 'It doubles', 'It reverses', 'It becomes zero'],
        0,
        'The common offset cancels in subtraction.',
        'Subtract both translated coordinates.',
      ],
      [
        'What is the displacement from a point to itself?',
        ['(1, 1)', '(0, 0)', 'Undefined', 'The original point'],
        1,
        'Both coordinate differences are zero.',
        'Subtract equal values.',
      ],
    ],
    cards: [
      [
        'How is a directed displacement vector computed?',
        'Destination minus origin, coordinate by coordinate.',
      ],
      [
        'Why subtract a common origin for orientation?',
        'It gives two vectors whose relative direction is independent of translation.',
      ],
    ],
  },
  {
    id: 'cp-geometry-cross-product',
    parents: ['math-vectors', 'parameters', 'tuples'],
    title: 'Compute signed doubled area',
    summary: 'Combine two vectors without slope division.',
    lesson: [
      'For vectors u and v, the 2D cross product is u.x * v.y - u.y * v.x. It is a signed scalar: positive for counterclockwise orientation in Cartesian coordinates.',
      'Its magnitude is doubled triangle area when the vectors share an origin. The integer formula handles vertical and repeated vectors without division.',
    ],
    signature: 'def cross_product(u, v)',
    contract:
      'Implement cross_product(u, v) for integer two-coordinate tuples. Return u.x * v.y - u.y * v.x exactly.',
    solution: 'def cross_product(u, v):\n    return u[0] * v[1] - u[1] * v[0]',
    checks:
      'assert cross_product((3, 0), (2, 4)) == 12\nassert cross_product((0, 3), (4, 1)) == -12\nassert cross_product((2, 2), (5, 5)) == 0\nassert cross_product((0, 0), (9, 1)) == 0\nassert cross_product((10**20, 0), (0, 10**20)) == 10**40',
    demonstration: 'print(cross_product((4, 0), (1, 3)))',
    output: '12',
    reasoning:
      'The vectors bound a triangle of area six, so the signed doubled area is twelve.',
    hint: 'Multiply across the coordinates and subtract the reverse product.',
    questions: [
      [
        'What is the 2D cross product formula?',
        ['ux * vx + uy * vy', 'ux * vy - uy * vx', 'ux + vy', 'ux / vx'],
        1,
        'Cross multiplication gives the signed area.',
        'Use products with different coordinate indices.',
      ],
      [
        'What does its magnitude represent for a common origin?',
        ['Doubled triangle area', 'Perimeter', 'A slope', 'Always one'],
        0,
        'The determinant is the parallelogram area.',
        'A triangle is half a parallelogram.',
      ],
      [
        'Why is integer cross product useful for vertical lines?',
        [
          'It needs distinct x coordinates',
          'It approximates slopes',
          'It requires no division',
          'It ignores y',
        ],
        2,
        'There is no zero horizontal denominator.',
        'The formula uses multiplication and subtraction.',
      ],
    ],
    cards: [
      ['What is the 2D cross product?', 'ux * vy - uy * vx.'],
      [
        'What does a zero cross product mean?',
        'The vectors are linearly dependent, including zero vectors.',
      ],
    ],
  },
  {
    id: 'cp-geometry-turn-sign',
    parents: ['cp-geometry-displacement', 'cp-geometry-cross-product'],
    title: 'Classify one turn',
    summary: 'Translate a determinant into left, right, or collinear.',
    lesson: [
      'For points a, b, c, compute vectors b - a and c - a, then their cross product. A positive sign means a left turn, negative right, and zero collinear in Cartesian coordinates.',
      'Repeated points also give zero. Screen coordinates with downward-positive y would reverse the visual interpretation; this atom explicitly uses Cartesian axes.',
    ],
    signature: 'def turn(a, b, c)',
    contract:
      'Implement turn(a, b, c) for integer Cartesian (x, y) tuples. Return 1 for a left turn, -1 for right, and 0 for collinear or repeated points. Use a cross product without division.',
    solution:
      'def turn(a, b, c):\n    cross = (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0])\n    return (cross > 0) - (cross < 0)',
    checks:
      'assert turn((0, 0), (3, 0), (2, 2)) == 1\nassert turn((0, 0), (0, 3), (2, 1)) == -1\nassert turn((1, 1), (2, 2), (4, 4)) == 0\nassert turn((0, 0), (2, 2), (2, 2)) == 0\nassert turn((10, 10), (13, 10), (12, 12)) == 1',
    demonstration: 'print(turn((0, 0), (4, 0), (1, 3)))',
    output: '1',
    reasoning: 'The determinant is positive, giving a Cartesian left turn.',
    hint: 'Build both displacements from a; classify the determinant relative to zero.',
    questions: [
      [
        'Positive cross product means what in Cartesian coordinates?',
        ['Right turn', 'Left turn', 'Always collinear', 'Repeated points'],
        1,
        'Positive is counterclockwise.',
        'Use upward-positive y.',
      ],
      [
        'How are repeated points classified?',
        ['Undefined', 'Always left', 'Zero', 'Always right'],
        2,
        'A zero or repeated vector gives zero determinant.',
        'No division is involved.',
      ],
      [
        'Why specify the coordinate convention?',
        [
          'Downward-positive y reverses the visual turn',
          'Integers cannot be negative',
          'Points must be sorted',
          'Coordinates must be prime',
        ],
        0,
        'Axis direction changes orientation interpretation.',
        'Cartesian y points upward.',
      ],
    ],
    cards: [
      [
        'How is a three-point turn classified?',
        'Take cross(b - a, c - a), then use its sign.',
      ],
      [
        'Which turn signs does this course use?',
        'Cartesian left = 1, right = -1, collinear or repeated = 0.',
      ],
    ],
  },
]);

stages('cp-memoization', 'cp-dynamic', [
  {
    id: 'cp-memo-state-key',
    parents: ['comprehensions', 'dictionaries', 'return-values', 'unpacking'],
    title: 'Identify one subproblem',
    summary: 'Use every answer-changing input in a cache key.',
    lesson: [
      'A memoization key describes a subproblem. A position alone cannot distinguish routes when the remaining budget changes what is possible. A tuple of position and budget is hashable and keeps those states separate.',
      'First identify which arguments change the answer, then retain their ordered values. Different budgets at the same position need separate keys. Repeated equal states must receive equal keys.',
    ],
    signature: 'def route_keys(states)',
    contract:
      'Implement route_keys(states). states contains (position, budget) integer pairs, represented by lists or tuples. Return a new list of tuple keys in input order, preserving duplicates and both values. Preserve the input.',
    solution:
      'def route_keys(states):\n    return [(position, budget) for position, budget in states]',
    checks:
      'assert route_keys([]) == []\nassert route_keys([(2, 3), (2, 4), (2, 3)]) == [(2, 3), (2, 4), (2, 3)]\nstates = [[0, 5], [-1, 0]]\nresult = route_keys(states)\nassert result == [(0, 5), (-1, 0)]\nassert all(isinstance(key, tuple) for key in result)\nassert states == [[0, 5], [-1, 0]]',
    demonstration: 'print(route_keys([(3, 2), (3, 8)]))',
    output: '[(3, 2), (3, 8)]',
    reasoning:
      'The same position with a different budget produces a different tuple. Repeated states keep equal keys.',
    hint: 'Unpack each pair and construct a tuple of both values.',
    questions: [
      [
        'Which key distinguishes routes by position and remaining budget?',
        [
          'position',
          '(position, budget)',
          'budget only',
          'The number of calls',
        ],
        1,
        'Both arguments can change the answer.',
        'Keep all answer-changing arguments.',
      ],
      [
        'Are (4, 1) and (4, 2) the same route state?',
        [
          'Always',
          'Only if cached',
          'No, their budgets differ',
          'They are unhashable',
        ],
        2,
        'The budget is part of the state.',
        'Compare both entries.',
      ],
      [
        'Which is a suitable Python dictionary key?',
        [
          'A list of integers',
          'A mutable dictionary',
          'A set',
          'A tuple of integers',
        ],
        3,
        'A tuple of integers is hashable.',
        'Keys must be hashable.',
      ],
    ],
    cards: [
      [
        'What belongs in a memoization key?',
        'Every input that determines the subproblem’s answer.',
      ],
      [
        'Why can a position-only cache fail?',
        'The same position can have different answers for different budgets or other omitted state.',
      ],
    ],
  },
  {
    id: 'cp-memo-base-cases',
    parents: ['comprehensions', 'return-values'],
    title: 'Count the empty completion',
    summary: 'Separate a complete construction from an impossible one.',
    lesson: [
      'When counting exact routes, a remaining distance of zero contributes one completion: take no further steps. A negative remainder contributes zero because that branch overshot.',
      'These boundaries make the recurrence work. This atom implements only the boundaries; positive unfinished states are represented by None and need a later transition.',
    ],
    signature: 'def route_boundary(remaining)',
    contract:
      'Implement route_boundary(remaining) for an integer. Return 1 at zero, 0 below zero, and None for a positive unfinished remainder.',
    solution:
      'def route_boundary(remaining):\n    if remaining == 0:\n        return 1\n    if remaining < 0:\n        return 0\n    return None',
    checks:
      'assert route_boundary(0) == 1\nassert route_boundary(-1) == 0\nassert route_boundary(-300) == 0\nassert route_boundary(1) is None\nassert route_boundary(100) is None',
    demonstration: 'print([route_boundary(value) for value in [-2, 0, 5]])',
    output: '[0, 1, None]',
    reasoning:
      'Zero is one completed route, negatives are impossible, and positive remainders still require transitions.',
    hint: 'Check equality to zero before the negative comparison.',
    questions: [
      [
        'How many empty continuations finish an exact route at zero?',
        ['Zero', 'One', 'Three', 'Infinitely many'],
        1,
        'Doing nothing is one successful completion.',
        'Count a completed construction once.',
      ],
      [
        'What count belongs to a negative remainder?',
        ['One', 'The remainder', 'Zero', 'Its absolute value'],
        2,
        'Overshooting cannot complete an exact route.',
        'This branch is impossible.',
      ],
      [
        'Why return None for a positive state in this boundary helper?',
        [
          'It marks work still needed',
          'It counts a route',
          'It makes the state impossible',
          'It clears the cache',
        ],
        0,
        'The recurrence resolves positive states separately.',
        'The helper is not the full solver.',
      ],
    ],
    cards: [
      [
        'What is the counting base case at a completed empty suffix?',
        'One: there is exactly one way to do nothing.',
      ],
      [
        'What count represents an impossible branch?',
        'Zero, so it contributes nothing to the recurrence.',
      ],
    ],
  },
  {
    id: 'cp-memo-cache-scope',
    parents: ['cp-recursion', 'dictionaries'],
    title: 'Cache completed answers locally',
    summary:
      'Reuse states without sharing input-dependent answers between calls.',
    lesson: [
      'A cache lookup reuses a completed answer. For an uncached state, compute its result, store it, and return it. Caching alone does not break cycles of unfinished recursive calls.',
      'A helper nested inside the public function gets a fresh cache for that call. Here a local dictionary caches triangular sums for 0 <= n <= 200, with each dependency decreasing toward zero.',
    ],
    signature: 'def memo_triangular(n)',
    contract:
      'Implement memo_triangular(n) for 0 <= n <= 200. Return 0 + 1 + ... + n using a nested memoized recurrence. Cache t + solve(t - 1), with zero as the base case.',
    solution:
      'def memo_triangular(n):\n    cache = {0: 0}\n    def solve(t):\n        if t not in cache:\n            cache[t] = t + solve(t - 1)\n        return cache[t]\n    return solve(n)',
    checks:
      'assert memo_triangular(0) == 0\nassert memo_triangular(1) == 1\nassert memo_triangular(7) == 28\nassert memo_triangular(200) == 20100\nassert memo_triangular(4) == 10',
    demonstration: 'print(memo_triangular(6))',
    output: '21',
    reasoning:
      'Every dependency decreases t, and each completed sum is stored locally.',
    hint: 'Initialize {0: 0}; cache t + solve(t - 1) only when t is absent.',
    questions: [
      [
        'When should a state answer enter the cache?',
        [
          'Before deciding its value',
          'After it is computed',
          'Only at program exit',
          'Whenever recursion repeats',
        ],
        1,
        'A cache stores completed answers.',
        'An unfinished call has no answer yet.',
      ],
      [
        'What prevents this recurrence from cycling?',
        [
          'A larger cache',
          'A tuple key',
          't decreases toward zero',
          'A global variable',
        ],
        2,
        'Every call approaches the base case.',
        'Follow t - 1.',
      ],
      [
        'Why nest a cache depending on one call’s input?',
        [
          'To make it unhashable',
          'To share stale answers',
          'To remove base cases',
          'To tie its lifetime to that input',
        ],
        3,
        'A fresh cache cannot retain another call’s input-dependent answers.',
        'Think about cache lifetime.',
      ],
    ],
    cards: [
      [
        'Does caching solve an unfinished recursive cycle?',
        'No. Dependencies must terminate or use explicit cycle handling.',
      ],
      [
        'Why use a per-call nested cache?',
        'It prevents input-dependent answers from surviving into an unrelated call.',
      ],
    ],
  },
]);

stages('cp-knapsack', 'cp-dynamic', [
  {
    id: 'cp-knapsack-capacity-state',
    parents: ['cp-dp-table-base'],
    title: 'Read an at-most-capacity state',
    summary: 'Distinguish a capacity bound from an exact weight.',
    lesson: [
      'In 0/1 knapsack dp[c] is the best value with total weight at most c. Some capacity may remain unused. Choosing nothing gives zero under every nonnegative bound.',
      'A table initialized to zero everywhere represents this at-most interpretation. Exact-weight DP would instead mark many entries unreachable.',
    ],
    signature: 'def capacity_values(capacity)',
    contract:
      'Implement capacity_values(capacity) for nonnegative capacity. Return a new list of capacity + 1 zeros, representing choosing no items under each bound.',
    solution: 'def capacity_values(capacity):\n    return [0] * (capacity + 1)',
    checks:
      'assert capacity_values(0) == [0]\nassert capacity_values(4) == [0, 0, 0, 0, 0]\na = capacity_values(2)\na[0] = 9\nassert capacity_values(2) == [0, 0, 0]',
    demonstration: 'print(capacity_values(3))',
    output: '[0, 0, 0, 0]',
    reasoning: 'The empty subset is feasible under each bound.',
    hint: 'Include both zero and capacity.',
    questions: [
      [
        'What does dp[5] mean here?',
        [
          'Weight exactly 5',
          'Best value with weight at most 5',
          'Five items',
          'Value exactly 5',
        ],
        1,
        'Capacity is an upper bound.',
        'Unused space is allowed.',
      ],
      [
        'Why initialize every entry to zero?',
        [
          'Every exact weight is reachable',
          'Weights are zero',
          'Choosing nothing fits every bound',
          'Capacity is always zero',
        ],
        2,
        'The empty subset is feasible.',
        'Take no items.',
      ],
      [
        'May a weight-three item leave one unused at capacity four?',
        ['Yes', 'Never', 'Only for zero value', 'Only for unlimited copies'],
        0,
        'An exact fill is unnecessary.',
        'At most means no greater than.',
      ],
    ],
    cards: [
      [
        'What does at-most-capacity dp[c] represent?',
        'Best value with total weight no greater than c.',
      ],
      [
        'What value does the empty subset provide?',
        'Zero at every nonnegative capacity.',
      ],
    ],
  },
  {
    id: 'cp-knapsack-take-skip',
    parents: ['cp-knapsack-capacity-state', 'parameters', 'number-builtins'],
    title: 'Compare taking with skipping',
    summary: 'Evaluate one item from the previous item stage.',
    lesson: [
      'Skip an item and keep previous[c], or take it once and add its value to previous[c - weight]. Taking is feasible only when its positive weight fits.',
      'Read both alternatives from the previous stage. This isolated transition leaves that table unchanged, making the two choices explicit.',
    ],
    signature: 'def item_choice(previous, capacity, weight, value)',
    contract:
      'Implement item_choice(previous, capacity, weight, value). previous is an at-most-capacity table, capacity is a valid index, weight is positive, and value is nonnegative. Return the best skip/take result for one item, preserving previous.',
    solution:
      'def item_choice(previous, capacity, weight, value):\n    if weight > capacity:\n        return previous[capacity]\n    return max(previous[capacity], previous[capacity - weight] + value)',
    checks:
      'assert item_choice([0, 0, 0, 0], 3, 2, 5) == 5\nassert item_choice([0, 3, 3, 6], 3, 2, 2) == 6\nassert item_choice([0, 3, 3, 6], 1, 2, 20) == 3\ntable = [0, 4, 4, 4, 8]\nassert item_choice(table, 4, 3, 7) == 11\nassert table == [0, 4, 4, 4, 8]',
    demonstration: 'print(item_choice([0, 0, 5, 5, 5, 5], 5, 3, 7))',
    output: '12',
    reasoning: 'Taking the item leaves capacity two with previous value five.',
    hint: 'Guard the weight, then compare previous[c] and previous[c - weight] + value.',
    questions: [
      [
        'Which predecessor supports taking weight w at capacity c?',
        [
          'previous[c + w]',
          'previous[w]',
          'previous[c - w]',
          'previous[c] + w',
        ],
        2,
        'The item consumes w capacity.',
        'Subtract the weight.',
      ],
      [
        'What if the item is too heavy?',
        [
          'Use a negative index',
          'Keep the skipping value',
          'Take half',
          'Reset to zero',
        ],
        1,
        'The take transition is infeasible.',
        'An item cannot be split.',
      ],
      [
        'Which stage supplies the taking predecessor?',
        [
          'After this item was taken',
          'A future stage',
          'Input weights',
          'Before this item',
        ],
        3,
        'Previous-stage values prevent reuse.',
        'Take this item once.',
      ],
    ],
    cards: [
      [
        'What is the 0/1 take transition?',
        'previous[c - weight] + value when weight fits.',
      ],
      ['Why retain a skip choice?', 'The item may be inferior or infeasible.'],
    ],
  },
  {
    id: 'cp-knapsack-descending-pass',
    parents: ['cp-knapsack-take-skip', 'cp-dp-dependency-order', 'slicing'],
    title: 'Update one item downward',
    summary: 'Keep smaller predecessors at the previous stage.',
    lesson: [
      'In one table, process capacities downward. The smaller c - weight entry has not yet changed during this pass, so it cannot already contain this item.',
      'An ascending loop could read an updated predecessor and reuse the item. This atom copies a previous-stage table and performs exactly one descending item pass.',
    ],
    signature: 'def apply_one_item(previous, weight, value)',
    contract:
      'Implement apply_one_item(previous, weight, value). previous is a nonempty at-most-capacity table, weight is positive, and value is nonnegative. Return a copied table after one descending 0/1 pass. Preserve previous.',
    solution:
      'def apply_one_item(previous, weight, value):\n    dp = previous[:]\n    for capacity in range(len(dp) - 1, weight - 1, -1):\n        dp[capacity] = max(dp[capacity], dp[capacity - weight] + value)\n    return dp',
    checks:
      'assert apply_one_item([0], 1, 8) == [0]\nassert apply_one_item([0, 0, 0, 0, 0], 2, 5) == [0, 0, 5, 5, 5]\nassert apply_one_item([0, 0, 3, 3, 3], 2, 3) == [0, 0, 3, 3, 6]\ntable = [0, 0, 0]\nassert apply_one_item(table, 5, 20) == table\nassert apply_one_item(table, 1, 4) == [0, 4, 4]\nassert table == [0, 0, 0]',
    demonstration: 'print(apply_one_item([0, 0, 0, 0, 0], 2, 5))',
    output: '[0, 0, 5, 5, 5]',
    reasoning:
      'Capacity four reads the unchanged capacity-two value, preventing a second copy.',
    hint: 'Copy first, then range(len(dp) - 1, weight - 1, -1).',
    questions: [
      [
        'Which direction prevents reuse?',
        ['Ascending', 'Descending', 'Random', 'Any'],
        1,
        'Smaller predecessors remain unchanged.',
        'Read previous-stage values.',
      ],
      [
        'One weight-two/value-five item at capacity four gives what?',
        ['0', '2', '5', '10'],
        2,
        'Only one copy exists.',
        '0/1 means take once or skip.',
      ],
      [
        'Why copy previous here?',
        [
          'To preserve the caller’s old stage',
          'To permit reuse',
          'To remove capacity',
          'To sort items',
        ],
        0,
        'The helper returns a new stage.',
        'Keep input ownership clear.',
      ],
    ],
    cards: [
      [
        'Why descend in compressed 0/1 knapsack?',
        'The smaller predecessor stays at the previous item stage.',
      ],
      [
        'What can ascending capacities accidentally implement?',
        'Unlimited reuse of the current item.',
      ],
    ],
  },
]);

stages('cp-subsequences', 'cp-dynamic', [
  {
    id: 'cp-subsequence-order',
    parents: ['accumulators', 'parameters'],
    title: 'Preserve subsequence order',
    summary: 'Select ordered values while allowing gaps.',
    lesson: [
      'A subsequence preserves source order but may skip elements. A subarray is contiguous. Match the next wanted element while scanning source once.',
      'Repeated values need distinct source positions. Empty wanted always succeeds. This atom checks order before considering whether values increase.',
    ],
    signature: 'def is_subsequence(wanted, source)',
    contract:
      'Implement is_subsequence(wanted, source) for integer lists. Return whether wanted can be selected in source order with gaps. Empty wanted returns True. Preserve both lists.',
    solution:
      'def is_subsequence(wanted, source):\n    matched = 0\n    for value in source:\n        if matched < len(wanted) and wanted[matched] == value:\n            matched += 1\n    return matched == len(wanted)',
    checks:
      'assert is_subsequence([], []) is True\nassert is_subsequence([2, 5], [2, 3, 5]) is True\nassert is_subsequence([5, 2], [2, 3, 5]) is False\nassert is_subsequence([2, 2], [2]) is False\nassert is_subsequence([2, 2], [2, 3, 2]) is True\na, b = [1, 4], [1, 2, 4]\nassert is_subsequence(a, b)\nassert a == [1, 4] and b == [1, 2, 4]',
    demonstration:
      'print(is_subsequence([2, 7], [2, 4, 7]))\nprint(is_subsequence([7, 2], [2, 4, 7]))',
    output: 'True\nFalse',
    reasoning:
      'Gaps are allowed, but order and distinct positions are required.',
    hint: 'Advance a matched index only when source matches the next wanted value.',
    questions: [
      [
        'Is [1, 4] a subsequence of [1, 2, 4]?',
        [
          'Yes, gaps are allowed',
          'No, it is not contiguous',
          'Only after sorting',
          'Only with unique values',
        ],
        0,
        'Order is preserved.',
        'Subsequence differs from subarray.',
      ],
      [
        'May [4, 1] be selected from [1, 2, 4]?',
        [
          'Yes',
          'No, order would change',
          'Only with a cache',
          'Always if values exist',
        ],
        1,
        'Four appears after one.',
        'Keep source order.',
      ],
      [
        'Can one occurrence supply [2, 2]?',
        [
          'Yes',
          'Only for LIS',
          'No, two positions are needed',
          'Only if positive',
        ],
        2,
        'Positions cannot be reused.',
        'Repeated values require repeated occurrences.',
      ],
    ],
    cards: [
      [
        'What defines a subsequence?',
        'A selection preserving original order with optional gaps.',
      ],
      [
        'Must a subsequence be contiguous?',
        'No; that restriction defines a subarray or substring.',
      ],
    ],
  },
  {
    id: 'cp-lis-tail-position',
    parents: ['cp-subsequence-order', 'cp-binary-sentinel', 'bisect-module'],
    title: 'Find the first non-smaller tail',
    summary: 'Locate a lower bound to preserve strict increase.',
    lesson: [
      'Equal values cannot extend a strictly increasing subsequence. In sorted tails, locate the first entry greater than or equal to the new value.',
      'bisect_left returns this lower bound. Equality replaces a tail rather than appending. An end index means every tail is smaller.',
    ],
    signature: 'def tail_position(tails, value)',
    contract:
      'Implement tail_position(tails, value) for a sorted integer list. Return the first index with entry >= value, or len(tails). Use bisect_left and preserve tails.',
    solution:
      'from bisect import bisect_left\n\ndef tail_position(tails, value):\n    return bisect_left(tails, value)',
    checks:
      'assert tail_position([], 8) == 0\nassert tail_position([1, 4, 9], 4) == 1\nassert tail_position([1, 4, 9], 6) == 2\nassert tail_position([1, 4, 9], 10) == 3\nassert tail_position([2, 2, 3], 2) == 0\nassert tail_position([-4, -1], -5) == 0',
    demonstration: 'print(tail_position([2, 5, 8], 5))',
    output: '1',
    reasoning: 'An equal five is found at its first position.',
    hint: 'Return bisect_left(tails, value).',
    questions: [
      [
        'What does bisect_left locate?',
        [
          'First entry > value',
          'Last equal entry',
          'First entry >= value',
          'An arbitrary equal entry',
        ],
        2,
        'It finds the left edge of equals.',
        'Lower bound includes equality.',
      ],
      [
        'Why does equality not extend strict LIS?',
        [
          'It is not a strictly greater next value',
          'Duplicates are invalid',
          'It empties tails',
          'It changes order',
        ],
        0,
        'Strict increase requires greater values.',
        'Compare equal values.',
      ],
      [
        'What result means all tails are smaller?',
        ['-1', '0', 'The maximum value', 'len(tails)'],
        3,
        'Insertion would be after the final entry.',
        'The end is an insertion position.',
      ],
    ],
    cards: [
      [
        'Which bisection preserves strict LIS?',
        'bisect_left, replacing the first tail >= the new value.',
      ],
      [
        'When can the tails length extend?',
        'When all existing tails are strictly smaller.',
      ],
    ],
  },
  {
    id: 'cp-lis-tail-update',
    parents: ['cp-lis-tail-position', 'slicing'],
    title: 'Replace one best tail',
    summary: 'Improve an ending value without claiming a complete path.',
    lesson: [
      'tails[k] is the smallest known ending value for an increasing subsequence of length k + 1. A smaller tail leaves more room for future extension.',
      'The entries need not form one actual subsequence. Apply one new value by replacing its lower-bound entry or appending at the end.',
    ],
    signature: 'def update_tails(tails, value)',
    contract:
      'Implement update_tails(tails, value). tails is strictly increasing. Copy it, replace the first entry >= value or append if all are smaller, and return the copy. Preserve tails.',
    solution:
      'from bisect import bisect_left\n\ndef update_tails(tails, value):\n    result = tails[:]\n    position = bisect_left(result, value)\n    if position == len(result):\n        result.append(value)\n    else:\n        result[position] = value\n    return result',
    checks:
      'assert update_tails([], 3) == [3]\nassert update_tails([2, 5, 9], 6) == [2, 5, 6]\nassert update_tails([2, 5, 9], 5) == [2, 5, 9]\nassert update_tails([2, 5, 9], 12) == [2, 5, 9, 12]\ntails = [2, 5, 9]\nassert update_tails(tails, 1) == [1, 5, 9]\nassert tails == [2, 5, 9]',
    demonstration: 'print(update_tails([2, 5, 9], 6))',
    output: '[2, 5, 6]',
    reasoning:
      'Six improves the ending value for length three without adding a new length.',
    hint: 'Copy, bisect_left, then replace or append.',
    questions: [
      [
        'What does tails[2] describe?',
        [
          'Third source element',
          'Smallest known tail for length three',
          'A guaranteed path',
          'Input maximum',
        ],
        1,
        'The index summarizes a subsequence length.',
        'Index two means length three.',
      ],
      [
        'Replacing 9 with 6 in [2, 5, 9] changes length how?',
        ['It grows', 'It becomes zero', 'It stays three', 'It halves'],
        2,
        'Replacement does not add entries.',
        'Count the entries.',
      ],
      [
        'Must all tails entries belong to one actual subsequence?',
        ['No', 'Always', 'Only at length zero', 'Only for negative input'],
        0,
        'Best tails may originate from different paths.',
        'The list summarizes optima.',
      ],
    ],
    cards: [
      [
        'Why prefer a smaller tail for the same length?',
        'It leaves more room for future strictly greater values.',
      ],
      [
        'Does tails alone reconstruct the actual LIS?',
        'No; reconstruction needs additional predecessor information.',
      ],
    ],
  },
]);

stages('cp-tabulation', 'cp-dynamic', [
  {
    id: 'cp-dp-table-base',
    parents: ['return-values', 'list-repetition'],
    title: 'Initialize exact-total costs',
    summary: 'Give reachable and unreachable states different values.',
    lesson: [
      'For minimum packets, dp[t] means the fewest packets totaling exactly t. Zero packets reach zero units, so dp[0] is zero. No positive total is reached before transitions.',
      'Infinity marks unreachable states in a minimum problem. Zero would falsely claim free solutions. Including the target endpoint requires target + 1 entries.',
    ],
    signature: 'def packet_table(target)',
    contract:
      'Implement packet_table(target), where target is nonnegative. Return a new list of target + 1 entries: 0 at index zero, float("inf") elsewhere.',
    solution:
      'def packet_table(target):\n    table = [float("inf")] * (target + 1)\n    table[0] = 0\n    return table',
    checks:
      'assert packet_table(0) == [0]\nassert packet_table(3) == [0, float("inf"), float("inf"), float("inf")]\na = packet_table(2)\na[1] = 4\nassert packet_table(2)[1] == float("inf")',
    demonstration: 'print(packet_table(3))',
    output: '[0, inf, inf, inf]',
    reasoning: 'Only total zero is initially reachable.',
    hint: 'Allocate target + 1 infinities, then assign entry zero.',
    questions: [
      [
        'What is dp[0] for minimum packet count?',
        ['1', 'Infinity', '0', 'target'],
        2,
        'No packets are needed.',
        'Use the empty construction.',
      ],
      [
        'Why start positive totals at infinity?',
        [
          'They are not yet reachable',
          'Packets have infinite sizes',
          'It sorts the table',
          'Zero cannot be stored',
        ],
        0,
        'Unreachable differs from valid zero cost.',
        'Minimum transitions can improve infinity.',
      ],
      [
        'How many entries represent 0 through target?',
        ['target - 1', 'target', '2 * target', 'target + 1'],
        3,
        'Both endpoints are included.',
        'Include zero.',
      ],
    ],
    cards: [
      ['What is the empty-total minimum cost?', 'Zero.'],
      [
        'Why must unreachable differ from zero?',
        'Zero is a valid cost; unreachable must not look like a free solution.',
      ],
    ],
  },
  {
    id: 'cp-dp-single-relaxation',
    parents: ['cp-dp-table-base', 'parameters', 'number-builtins'],
    title: 'Relax one predecessor',
    summary: 'Compare keeping an answer with adding one packet.',
    lesson: [
      'If a smaller total uses previous packets, adding one packet proposes previous + 1. Keep the minimum of that candidate and the current value.',
      'An unreachable predecessor is infinity, and infinity + 1 remains infinity. One relaxation is the elementary update, rather than a complete table computation.',
    ],
    signature: 'def relax_packet(current, previous)',
    contract:
      'Implement relax_packet(current, previous). Both arguments are nonnegative packet counts or float("inf"). Return min(current, previous + 1).',
    solution:
      'def relax_packet(current, previous):\n    return min(current, previous + 1)',
    checks:
      'assert relax_packet(8, 2) == 3\nassert relax_packet(2, 8) == 2\nassert relax_packet(float("inf"), 0) == 1\nassert relax_packet(4, float("inf")) == 4\nassert relax_packet(float("inf"), float("inf")) == float("inf")',
    demonstration: 'print(relax_packet(5, 2))',
    output: '3',
    reasoning:
      'The candidate costs one more packet; a better current optimum survives.',
    hint: 'Compare current with previous + 1.',
    questions: [
      [
        'A predecessor uses 3 packets. What does adding one cost?',
        ['2', '3', '4', '6'],
        2,
        'The transition adds one.',
        'Increment the count once.',
      ],
      [
        'Current is 2 and the candidate is 5. Which survives?',
        ['2', '5', '7', 'Infinity'],
        0,
        'An update cannot worsen the optimum.',
        'Choose the minimum.',
      ],
      [
        'What candidate comes from an unreachable predecessor?',
        ['0', '1', '-1', 'Infinity'],
        3,
        'A finite added cost leaves infinity unreachable.',
        'Infinity plus one stays infinity.',
      ],
    ],
    cards: [
      [
        'What is a minimum-cost relaxation?',
        'Keep min(current, predecessor cost + transition cost).',
      ],
      [
        'Can an unreachable predecessor contribute finite cost?',
        'No; infinity remains infinity under a finite added cost.',
      ],
    ],
  },
  {
    id: 'cp-dp-dependency-order',
    parents: ['cp-dp-single-relaxation', 'ranges'],
    title: 'Fill increasing totals',
    summary: 'Finish smaller dependencies before using them.',
    lesson: [
      'A positive packet size s makes t - s smaller than t. Filling totals in increasing order guarantees the predecessor is ready. Nonpositive sizes are excluded because they break this reasoning.',
      'This atom computes the full table for only sizes one and three. Inspecting every entry exposes dependency order before the general packet solver.',
    ],
    signature: 'def one_three_table(target)',
    contract:
      'Implement one_three_table(target) for 0 <= target <= 5000. Return a list of minimum packet counts using sizes 1 and 3 for every exact total from zero through target. Fill totals in increasing order.',
    solution:
      'def one_three_table(target):\n    dp = [0] * (target + 1)\n    for total in range(1, target + 1):\n        dp[total] = dp[total - 1] + 1\n        if total >= 3:\n            dp[total] = min(dp[total], dp[total - 3] + 1)\n    return dp',
    checks:
      'assert one_three_table(0) == [0]\nassert one_three_table(2) == [0, 1, 2]\nassert one_three_table(7) == [0, 1, 2, 1, 2, 3, 2, 3]\nassert one_three_table(3000)[-1] == 1000',
    demonstration: 'print(one_three_table(6))',
    output: '[0, 1, 2, 1, 2, 3, 2]',
    reasoning: 'Both transitions read smaller totals already computed.',
    hint: 'Use t - 1, then compare t - 3 when t >= 3.',
    questions: [
      [
        'Why does increasing total order work?',
        [
          'Sizes must be sorted',
          'Dependencies use smaller totals',
          'Answers always increase',
          'It removes every loop',
        ],
        1,
        'Positive sizes give smaller predecessor totals.',
        'Compare t and t - s.',
      ],
      [
        'Which dependency is invalid at total 2 for size 3?',
        ['dp[1]', 'dp[0]', 'dp[-1]', 'dp[2]'],
        2,
        'The packet is too large; negative indexing would read the wrong entry.',
        'Guard total >= size.',
      ],
      [
        'How many one/three packets reach 6 optimally?',
        ['1', '2', '3', '6'],
        1,
        'Two threes reach six.',
        'Reuse size three.',
      ],
    ],
    cards: [
      [
        'What makes a tabulation order valid?',
        'Each state is processed after its dependencies.',
      ],
      [
        'Why exclude nonpositive sizes here?',
        'They do not decrease the predecessor total and can break dependency order.',
      ],
    ],
  },
]);
