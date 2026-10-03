import {
  choose,
  part,
  typeNumber,
  typeOutput,
  type MultistepModule,
} from './authoring';

// Multistep problems for Competitive Programming (CEN-163): one algorithm on
// one input, with parts on the algorithm and on the earlier ideas it is built
// from. A part's code runs after the setup's code, as one program.

export const multistepProblems: MultistepModule = {
  'cp-dijkstra': [
    {
      title: 'Find the cheapest delivery routes',
      setup: {
        text: [
          'Dijkstra’s algorithm finds the cheapest route from `"A"` to every place. It records each vertex it finishes in `popped` and skips heap entries that are out of date.',
        ],
        code: `import heapq

graph = {
    "A": [("B", 4), ("C", 1)],
    "B": [("D", 1)],
    "C": [("B", 2), ("D", 5)],
    "D": [],
}

def dijkstra(start):
    dist = {start: 0}
    heap = [(0, start)]
    popped = []
    while heap:
        d, u = heapq.heappop(heap)
        if d != dist[u]:
            continue
        popped.append(u)
        for v, w in graph[u]:
            if v not in dist or d + w < dist[v]:
                dist[v] = d + w
                heapq.heappush(heap, (dist[v], v))
    return dist, popped

dist, popped = dijkstra("A")`,
      },
      parts: [
        part(
          'cp-distance-relaxation-kp1',
          typeNumber(
            'When `"C"` is processed at distance 1, what distance does it propose for `"B"`?',
            3,
            'Across the edge of weight 2: $1 + 2 = 3$, better than the 4 known so far.',
          ),
        ),
        part(
          'cp-dijkstra-kp2',
          typeOutput(
            'After the setup runs, what does this print?',
            'print(popped)',
            "['A', 'C', 'B', 'D']",
            'The heap always yields the smallest current distance: A at 0, C at 1, B at 3, then D at 4.',
          ),
        ),
        part(
          'cp-stale-distance-kp2',
          typeNumber(
            'How many popped heap entries are skipped as stale?',
            2,
            '`(4, "B")` and `(6, "D")` were pushed before better routes were found, so their distances no longer match `dist`.',
          ),
        ),
        part(
          'cp-dijkstra-kp1',
          typeOutput(
            'After the setup runs, what does this print?',
            'print(dist["D"])',
            '4',
            'The route A to C to B to D costs $1 + 2 + 1 = 4$, cheaper than A to C to D at 6.',
          ),
        ),
      ],
    },
  ],
  'cp-topological': [
    {
      title: 'Schedule courses with prerequisites',
      setup: {
        text: [
          'Each edge `(u, v)` means course `u` must come before course `v`. Kahn’s algorithm schedules courses whose prerequisites are all done, oldest first, and returns `None` when a cycle blocks the rest.',
        ],
        code: `from collections import deque

def schedule(n, edges):
    graph = [[] for _ in range(n)]
    indegree = [0] * n
    for u, v in edges:
        graph[u].append(v)
        indegree[v] += 1
    queue = deque(v for v in range(n) if indegree[v] == 0)
    order = []
    while queue:
        u = queue.popleft()
        order.append(u)
        for v in graph[u]:
            indegree[v] -= 1
            if indegree[v] == 0:
                queue.append(v)
    return order if len(order) == n else None`,
      },
      parts: [
        part(
          'cp-graph-models-kp2',
          typeNumber(
            'For the edges `[(0, 2), (1, 2), (2, 3)]`, what is the indegree of course 2?',
            2,
            'Two directed edges end at 2, from courses 0 and 1.',
          ),
        ),
        part(
          'cp-topological-kp1',
          typeOutput(
            'After the setup runs, what does this print?',
            'print(schedule(4, [(0, 2), (1, 2), (2, 3)]))',
            '[0, 1, 2, 3]',
            'Courses 0 and 1 start ready. Course 2 is released only when its second prerequisite leaves, then course 3.',
          ),
        ),
        part(
          'cp-topological-kp2',
          typeOutput(
            'After the setup runs, what does this print?',
            'print(schedule(5, [(3, 4), (0, 1)]))',
            '[0, 2, 3, 1, 4]',
            'Every course with no prerequisite starts in the queue, from both separate chains and the lone course 2; released courses join the back.',
          ),
        ),
        part(
          'cp-topological-kp3',
          typeOutput(
            'After the setup runs, what does this print?',
            'print(schedule(3, [(0, 1), (1, 2), (2, 1)]))',
            'None',
            'Courses 1 and 2 wait for each other, so neither is ever released and the order stops short of 3 courses.',
          ),
        ),
      ],
    },
  ],
  'cp-memoization': [
    {
      title: 'Count paths through a grid',
      setup: {
        text: [
          '`paths` counts the routes from the top-left cell to the bottom-right one, moving only down or right. It also reports how many states its cache stored.',
        ],
        code: `def paths(rows, cols):
    cache = {}

    def walk(r, c):
        if r == rows - 1 and c == cols - 1:
            return 1
        if r >= rows or c >= cols:
            return 0
        key = (r, c)
        if key not in cache:
            cache[key] = walk(r + 1, c) + walk(r, c + 1)
        return cache[key]

    return walk(0, 0), len(cache)`,
      },
      parts: [
        part(
          'cp-memo-base-cases-kp2',
          typeNumber(
            'What does `walk` return for a position below the last row?',
            0,
            'A route that leaves the grid is an overshoot, which completes nothing, unlike the finished target cell, which counts 1.',
          ),
        ),
        part(
          'cp-memoization-kp1',
          typeOutput(
            'After the setup runs, what does this print?',
            'print(paths(3, 3)[0])',
            '6',
            'Each route from a cell is a route after a step down plus one after a step right; for 3 by 3 that totals 6.',
          ),
        ),
        part(
          'cp-memo-state-key-kp1',
          choose(
            'Why must the cache key hold both `r` and `c`?',
            [
              'Cells in one row can have different numbers of routes',
              'A dictionary key must always be a pair of numbers',
              'The key must change on every call to save time',
              'The row alone would make the cache too large',
            ],
            0,
            'A state must include every input that changes the answer; `(1, 0)` and `(1, 2)` share a row but not their route counts.',
          ),
        ),
        part(
          'cp-memoization-kp2',
          typeOutput(
            'After the setup runs, what does this print?',
            'print(paths(3, 3)[1])',
            '8',
            'Every cell except the target is solved once and stored, however many routes pass through it: 9 cells minus 1.',
          ),
        ),
      ],
    },
  ],
  'cp-mst': [
    {
      title: 'Wire the cheapest network',
      setup: {
        text: [
          'Kruskal’s algorithm connects every vertex at the lowest total cost. It takes edges `(u, v, weight)` from cheapest to dearest, ties by endpoints, and skips any edge whose ends are already connected.',
        ],
        code: `def kruskal(n, edges):
    parent = list(range(n))

    def find(x):
        while parent[x] != x:
            x = parent[x]
        return x

    total, used = 0, 0
    for u, v, w in sorted(edges, key=lambda e: (e[2], e[0], e[1])):
        ru, rv = find(u), find(v)
        if ru == rv:
            continue
        parent[ru] = rv
        total += w
        used += 1
    return total if used == n - 1 else None

edges = [(0, 1, 4), (1, 2, 2), (0, 2, 3), (2, 3, 7), (1, 3, 7)]`,
      },
      parts: [
        part(
          'cp-edge-weight-order-kp1',
          typeOutput(
            'After the setup runs, what does this print?',
            'print(sorted(edges, key=lambda e: e[2])[0])',
            '(1, 2, 2)',
            'Sorting by the third field puts the cheapest edge, weight 2, first.',
          ),
        ),
        part(
          'cp-forest-cycle-check-kp1',
          typeNumber(
            'For `kruskal(4, edges)`, how many edges are skipped because their ends are already connected?',
            2,
            'After accepting weights 2 and 3, vertices 0, 1, and 2 are joined, so `(0, 1, 4)` is skipped; after `(1, 3, 7)`, so is `(2, 3, 7)`.',
          ),
        ),
        part(
          'cp-mst-kp1',
          typeOutput(
            'After the setup runs, what does this print?',
            'print(kruskal(4, edges))',
            '12',
            'The accepted edges weigh $2 + 3 + 7 = 12$: three edges for four vertices.',
          ),
        ),
        part(
          'cp-mst-kp2',
          typeOutput(
            'After the setup runs, what does this print?',
            'print(kruskal(5, edges))',
            'None',
            'No edge reaches vertex 4, so only 3 of the 4 needed edges are accepted and no spanning tree exists.',
          ),
        ),
      ],
    },
  ],
  'cp-grids': [
    {
      title: 'Measure the islands on a map',
      setup: {
        text: [
          'On the map, `#` is land and `.` is water; land cells touching up, down, left, or right form one island. The scan starts a fill at each undiscovered land cell and records the island’s size.',
        ],
        code: `grid = [
    "##..#",
    "#...#",
    "..#..",
    "....#",
]

def islands(grid):
    rows, cols = len(grid), len(grid[0])
    seen = set()
    sizes = []
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] != "#" or (r, c) in seen:
                continue
            seen.add((r, c))
            stack, size = [(r, c)], 0
            while stack:
                y, x = stack.pop()
                size += 1
                for ny, nx in ((y + 1, x), (y - 1, x), (y, x + 1), (y, x - 1)):
                    inside = 0 <= ny < rows and 0 <= nx < cols
                    if inside and grid[ny][nx] == "#" and (ny, nx) not in seen:
                        seen.add((ny, nx))
                        stack.append((ny, nx))
            sizes.append(size)
    return sizes`,
      },
      parts: [
        part(
          'cp-grid-passability-kp2',
          typeNumber(
            'How many land neighbours does the top-left cell `(0, 0)` have?',
            2,
            'Of its neighbours inside the map, `(1, 0)` and `(0, 1)` are land.',
          ),
        ),
        part(
          'cp-grids-kp1',
          typeNumber(
            'How many islands does the map have?',
            4,
            'The top-left group of three, the two cells on the right edge, the single middle cell, and the bottom-right cell, which water separates from the others.',
          ),
        ),
        part(
          'cp-grids-kp2',
          typeOutput(
            'After the setup runs, what does this print?',
            'print(islands(grid))',
            '[3, 2, 1, 1]',
            'Each fill starts at an island’s first cell in reading order and counts the cells it pops.',
          ),
        ),
        part(
          'cp-grid-component-kp1',
          choose(
            'Why is a cell added to `seen` when it is pushed rather than when it is popped?',
            [
              'So no cell is pushed twice while it waits on the stack',
              'So the stack pops the cells in reading order',
              'So water cells are never added to the stack',
              'So the fill stops at the edge of the map',
            ],
            0,
            'Two neighbours of one unvisited cell could both push it before it is popped; marking at push time schedules every cell once.',
          ),
        ),
      ],
    },
  ],
  'cp-bfs': [
    {
      title: 'Count the fewest hops',
      setup: {
        text: [
          'A directed network lists each vertex’s outgoing links. Breadth-first search from vertex 0 finds how many links the shortest route to each vertex takes.',
        ],
        code: `from collections import deque

def hops(graph, start):
    dist = {start: 0}
    queue = deque([start])
    while queue:
        u = queue.popleft()
        for v in graph[u]:
            if v not in dist:
                dist[v] = dist[u] + 1
                queue.append(v)
    return dist

graph = {0: [1, 2], 1: [3], 2: [3, 4], 3: [5], 4: [5], 5: []}`,
      },
      parts: [
        part(
          'cp-directed-edge-kp1',
          typeOutput(
            'After the setup runs, what does this print?',
            'print(3 in graph[1], 1 in graph[3])',
            'True False',
            'The link 1 → 3 is recorded only in the list of vertex 1; it does not let 3 reach 1.',
          ),
        ),
        part(
          'cp-bfs-kp1',
          typeOutput(
            'After the setup runs, what does this print?',
            'print(hops(graph, 0)[5])',
            '3',
            'The shortest routes to 5 take three links, such as 0 → 1 → 3 → 5.',
          ),
        ),
        part(
          'cp-bfs-layer-distance-kp2',
          choose(
            'Vertex 3 is discovered from 1 and found again from 2. Why does its distance stay 2?',
            [
              'Its first distance is final: later discoveries are no shorter',
              'Vertex 2 is processed before vertex 1, so it wins',
              'Each vertex stores the larger of its two distances',
              'The second discovery is the one that sets the distance',
            ],
            0,
            'The queue hands out vertices layer by layer, so the first time a vertex is reached is along a shortest route; overwriting it could only make it worse.',
          ),
        ),
        part(
          'cp-bfs-kp2',
          typeOutput(
            'After the setup runs, what does this print?',
            `d = hops(graph, 0)
print([v for v in d if d[v] == 2])`,
            '[3, 4]',
            'The second layer is everything first reached from the first layer, 1 and 2: vertices 3 and 4.',
          ),
        ),
      ],
    },
  ],
  'cp-sweep-line': [
    {
      title: 'Find the busiest moment for rooms',
      setup: {
        text: [
          'Each meeting `(start, end)` needs a room from `start` until just before `end`. A sweep turns meetings into events, +1 at a start and −1 at an end, and tracks how many rooms are in use.',
        ],
        code: `meetings = [(1, 4), (2, 5), (4, 6), (7, 8)]
events = []
for start, end in meetings:
    events.append((start, 1))
    events.append((end, -1))
events.sort()
active = peak = 0
for _, change in events:
    active += change
    peak = max(peak, active)`,
      },
      parts: [
        part(
          'cp-sweep-ties-kp1',
          typeOutput(
            'After the setup runs, what does this print?',
            'print(events[2:4])',
            '[(4, -1), (4, 1)]',
            'Tuples compare by time first, then by change, so at time 4 the departure (−1) sorts before the arrival (+1).',
          ),
        ),
        part(
          'cp-sweep-active-kp1',
          typeOutput(
            'After the setup runs, what does this print?',
            'print(peak)',
            '2',
            'The running count goes 1, 2, 1, 2, 1, 0, 1, 0, so at most two rooms are busy at once.',
          ),
        ),
        part(
          'cp-sweep-ties-kp2',
          typeNumber(
            'If arrivals sorted before departures at equal times, what would the peak be?',
            3,
            'At time 4 the third meeting would start before the first one ended, counting three rooms at once.',
          ),
        ),
        part(
          'cp-sweep-line-kp3',
          choose(
            'How does the sweep’s work grow with the number of meetings, n?',
            [
              'O(n log n), for sorting the 2n events',
              'O(n), for one pass over the events',
              'O(n^2), for comparing every pair',
              'O(log n), since the events are sorted',
            ],
            0,
            'Sorting 2n events dominates; the pass afterwards is linear.',
          ),
        ),
      ],
    },
  ],
  'cp-compression': [
    {
      title: 'Compress large coordinates',
      setup: {
        text: [
          'Values can be huge but few. Coordinate compression replaces each value with its rank among the distinct values, so arrays indexed by value stay small.',
        ],
        code: `values = [40, 10, 40, 1000, 10]
ranks = {v: i for i, v in enumerate(sorted(set(values)))}
compressed = [ranks[v] for v in values]`,
      },
      parts: [
        part(
          'cp-compression-kp1',
          typeOutput(
            'After the setup runs, what does this print?',
            'print(sorted(set(values)))',
            '[10, 40, 1000]',
            'The set keeps one copy of each value, and sorting puts the distinct values in rank order.',
          ),
        ),
        part(
          'cp-compress-translate-kp1',
          typeOutput(
            'After the setup runs, what does this print?',
            'print(compressed)',
            '[1, 0, 1, 2, 0]',
            'Every occurrence is translated in its own position: 40 has rank 1, 10 rank 0, and 1000 rank 2.',
          ),
        ),
        part(
          'cp-compression-kp2',
          choose(
            'What does the compressed list keep from the original values?',
            [
              'Their order and which of them are equal',
              'Their differences and which of them are equal',
              'Their sum and their order',
              'Only how many distinct values there are',
            ],
            0,
            'Ranks preserve comparisons, so anything that depends only on order and equality still works; gaps such as 1000 − 40 are lost.',
          ),
        ),
        part(
          'cp-compress-translate-kp2',
          typeNumber(
            'A counting array indexed by rank needs how many slots?',
            3,
            'One per distinct value: ranks 0, 1, and 2, instead of 1001 slots indexed by value.',
          ),
        ),
      ],
    },
  ],
};
